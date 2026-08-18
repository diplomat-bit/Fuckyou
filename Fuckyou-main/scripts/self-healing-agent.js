const fs = require('fs');
const path = require('path');
const { exec } = require('child_process');

// Configuration constants
const MAX_RETRIES = process.env.MAX_HEALING_RETRIES ? parseInt(process.env.MAX_HEALING_RETRIES, 10) : 3;
const BUILD_COMMAND = process.env.BUILD_COMMAND || 'npm run build';
const MODEL_NAME = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
const API_KEY = process.env.GEMINI_API_KEY;

/**
 * Dynamically imports or requires the Google Generative AI SDK.
 * Provides a clear error message if the package is missing.
 */
function getGeminiSDK() {
  try {
    return require('@google/generative-ai');
  } catch (error) {
    console.error('\n🚨 Error: The "@google/generative-ai" package is required.');
    console.error('Please install it using: npm install @google/generative-ai\n');
    process.exit(1);
  }
}

/**
 * Recursively scans the workspace to build a list of project files,
 * ignoring common build artifacts and dependency directories.
 */
function getProjectFiles(dir, baseDir = dir) {
  let results = [];
  if (!fs.existsSync(dir)) return results;

  const list = fs.readdirSync(dir);
  const ignoreList = [
    'node_modules',
    '.git',
    'dist',
    'build',
    '.next',
    'out',
    'coverage',
    '.DS_Store',
    'package-lock.json',
    'yarn.lock',
    'pnpm-lock.yaml'
  ];

  for (const file of list) {
    if (ignoreList.includes(file)) continue;
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);

    if (stat && stat.isDirectory()) {
      results = results.concat(getProjectFiles(filePath, baseDir));
    } else {
      results.push(path.relative(baseDir, filePath));
    }
  }
  return results;
}

/**
 * Heuristically identifies which files are most relevant to the build error
 * by scanning the error logs for file paths present in the project.
 */
function getRelevantFiles(errorLog, projectFiles) {
  const relevant = new Set();
  const normalizedLog = errorLog.replace(/\\/g, '/');

  for (const file of projectFiles) {
    const normalizedFile = file.replace(/\\/g, '/');
    // Check if the file path is mentioned in the logs
    if (normalizedLog.includes(normalizedFile)) {
      relevant.add(file);
    }
  }

  // Fallback: If no specific files are matched, include common configuration files
  if (relevant.size === 0) {
    const fallbacks = ['package.json', 'tsconfig.json', 'jsconfig.json', 'webpack.config.js'];
    for (const fallback of fallbacks) {
      if (projectFiles.includes(fallback)) {
        relevant.add(fallback);
      }
    }
  }

  return Array.from(relevant);
}

/**
 * Executes the build command and captures stdout, stderr, and exit codes.
 */
function runBuild() {
  return new Promise((resolve) => {
    console.log(`\n🚀 Running build command: "${BUILD_COMMAND}"...`);
    exec(BUILD_COMMAND, (error, stdout, stderr) => {
      if (error) {
        resolve({
          success: false,
          stdout: stdout.trim(),
          stderr: stderr.trim(),
          error: error.message
        });
      } else {
        resolve({
          success: true,
          stdout: stdout.trim(),
          stderr: stderr.trim()
        });
      }
    });
  });
}

/**
 * Queries the Gemini API with the error context and project state
 * to retrieve structured file repairs.
 */
async function askGeminiForFix(errorContext) {
  if (!API_KEY) {
    console.error('\n🚨 Error: GEMINI_API_KEY environment variable is not set.');
    console.error('Please set it before running the self-healing agent.\n');
    process.exit(1);
  }

  const { GoogleGenerativeAI } = getGeminiSDK();
  const genAI = new GoogleGenerativeAI(API_KEY);
  const model = genAI.getGenerativeModel({
    model: MODEL_NAME,
    generationConfig: {
      responseMimeType: "application/json",
    }
  });

  const prompt = `
You are an expert self-healing software engineering agent.
The project build has failed. Your task is to analyze the build failure, inspect the project structure and the contents of the relevant files, and provide the exact file repairs needed to fix the build.

--- BUILD FAILURE DETAILS ---
Command: ${BUILD_COMMAND}
Error Output:
${errorContext.stderr || errorContext.error}

Stdout Output:
${errorContext.stdout}

--- PROJECT STRUCTURE ---
${errorContext.projectStructure.join('\n')}

--- RELEVANT FILE CONTENTS ---
${JSON.stringify(errorContext.fileContents, null, 2)}

--- INSTRUCTIONS ---
1. Analyze the compilation/build error carefully.
2. Identify which file(s) need to be modified or created to resolve the error.
3. Return a JSON object matching the following schema:
{
  "explanation": "A brief explanation of the root cause and how your changes fix it.",
  "repairs": [
    {
      "path": "relative/path/to/file.js",
      "content": "The complete, updated content of the file. Do not use placeholders or partial code. Provide the full file content."
    }
  ]
}

Ensure the JSON is valid and matches the schema exactly. Do not wrap the JSON in markdown code blocks.
`;

  const result = await model.generateContent(prompt);
  const responseText = result.response.text();
  
  try {
    return JSON.parse(responseText);
  } catch (e) {
    // Fallback parsing in case Gemini wraps the JSON in markdown blocks despite instructions
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      return JSON.parse(jsonMatch[0]);
    }
    throw new Error(`Failed to parse Gemini response as JSON. Raw response:\n${responseText}`);
  }
}

/**
 * Writes the repaired file contents back to the workspace.
 */
function applyRepairs(repairs) {
  console.log('\n🔧 Applying repairs...');
  for (const repair of repairs) {
    const absolutePath = path.resolve(process.cwd(), repair.path);
    console.log(`   Writing to: ${repair.path}`);
    
    // Ensure target directory exists
    fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
    fs.writeFileSync(absolutePath, repair.content, 'utf8');
  }
  console.log('✅ Repairs applied successfully.');
}

/**
 * Main self-healing loop.
 */
async function main() {
  console.log('=== Starting Self-Healing Agent ===');
  let attempt = 1;
  let buildPassed = false;

  while (attempt <= MAX_RETRIES && !buildPassed) {
    console.log(`\n--- Attempt ${attempt} of ${MAX_RETRIES} ---`);
    const buildResult = await runBuild();

    if (buildResult.success) {
      console.log('🎉 Build succeeded! No healing required.');
      buildPassed = true;
      break;
    }

    console.log('❌ Build failed. Initiating self-healing process...');
    
    try {
      const projectFiles = getProjectFiles(process.cwd());
      const combinedLogs = `${buildResult.stdout}\n${buildResult.stderr}\n${buildResult.error || ''}`;
      const relevantFiles = getRelevantFiles(combinedLogs, projectFiles);

      console.log(`📂 Found ${projectFiles.length} files in project.`);
      console.log(`🔍 Identified relevant files for context:`, relevantFiles);

      const fileContents = {};
      for (const file of relevantFiles) {
        try {
          const fullPath = path.resolve(process.cwd(), file);
          fileContents[file] = fs.readFileSync(fullPath, 'utf8');
        } catch (e) {
          console.warn(`⚠️ Could not read file ${file}: ${e.message}`);
        }
      }

      const errorContext = {
        stdout: buildResult.stdout,
        stderr: buildResult.stderr,
        error: buildResult.error,
        projectStructure: projectFiles,
        fileContents
      };

      console.log('🧠 Querying Gemini API for repairs...');
      const healingPlan = await askGeminiForFix(errorContext);

      console.log(`\n💡 Gemini Explanation:\n${healingPlan.explanation}`);

      if (healingPlan.repairs && healingPlan.repairs.length > 0) {
        applyRepairs(healingPlan.repairs);
      } else {
        console.log('⚠️ Gemini did not suggest any file repairs.');
      }

    } catch (error) {
      console.error('🚨 Error during self-healing cycle:', error);
    }

    attempt++;
  }

  if (buildPassed) {
    console.log('\n✨ Self-healing completed successfully! The workspace is now in a healthy state.');
    process.exit(0);
  } else {
    console.error(`\n❌ Self-healing failed to resolve the build issues after ${MAX_RETRIES} attempts.`);
    process.exit(1);
  }
}

// Execute the self-healing engine
main();