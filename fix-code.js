import fs from 'fs';
import path from 'path';
import { execSync } from 'child_process';

const API_KEY = process.env.GEMINI_API_KEY;
if (!API_KEY) {
  console.error("Missing GEMINI_API_KEY environment variable.");
  process.exit(1);
}

// Global configurations
const FILE_LIMIT = 50; // Safety cap per workflow run
const IGNORED_DIRS = ['.git', '.github', 'node_modules', 'dist', 'build', 'out'];
const ALLOWED_EXTENSIONS = ['.js', '.jsx', '.ts', '.tsx', '.css', '.html', '.json'];

// Round-robin array of active Gemini developer models
const GEMINI_MODELS = [
  'gemini-3.5-flash',         // Google's newest agent/coding model
  'gemini-3.1-pro-preview',   // Frontier-class deep reasoning
  'gemini-3.1-flash-lite',    // High-speed, high-volume automation
  'gemini-2.5-pro',           // Established long-context coding engine
  'gemini-2.5-flash'          // Low-latency fallback model
];

function getAllFiles(dirPath, arrayOfFiles = []) {
  const files = fs.readdirSync(dirPath);
  files.forEach((file) => {
    const resPath = path.join(dirPath, file);
    if (fs.statSync(resPath).isDirectory()) {
      if (!IGNORED_DIRS.includes(file)) {
        getAllFiles(resPath, arrayOfFiles);
      }
    } else {
      if (ALLOWED_EXTENSIONS.includes(path.extname(file))) {
        arrayOfFiles.push(resPath);
      }
    }
  });
  return arrayOfFiles;
}

// Executes git commands dynamically within the live node thread
function commitAndPushFile(filePath, modelUsed) {
  try {
    // Check if the individual file actually has changes
    const status = execSync(`git status --porcelain "${filePath}"`, { encoding: 'utf-8' }).trim();
    if (!status) {
      console.log(`No changes detected for ${filePath}. Skipping commit.`);
      return;
    }

    console.log(`Changes detected in ${filePath}. Launching atomic commit...`);
    execSync(`git add "${filePath}"`);
    execSync(`git commit -m "style/fix: autonomous alignment of ${path.basename(filePath)} using ${modelUsed}"`);
    
    // Push immediately to the current working branch
    const branchName = process.env.GITHUB_REF_NAME || 'main';
    execSync(`git push origin HEAD:${branchName}`);
    console.log(`Successfully pushed alignment for ${filePath} to remote branch.`);
  } catch (error) {
    console.error(`Git atomic transaction failed for ${filePath}:`, error.message);
  }
}

async function fixFileWithGemini(filePath, modelName) {
  console.log(`Processing [${filePath}] using Model [${modelName}]`);
  const originalContent = fs.readFileSync(filePath, 'utf-8');

  const payload = {
    contents: [{
      parts: [{
        text: `You are an expert software engineer. Analyze the following code file (${filePath}). Fix any syntax errors, type compliance failures, logical bugs, formatting anomalies, or runtime hazards. 

CRITICAL: Return ONLY the raw, updated code file content. Do NOT wrap it in markdown code blocks (\`\`\`), do NOT provide descriptions, explanations, or introductory text. If the file requires no modifications, return the original text exactly.

Original Code:
${originalContent}`
      }]
    }]
  };

  try {
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/${modelName}:generateContent?key=${API_KEY}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });

    if (!response.ok) {
      throw new Error(`API response error: ${response.status} ${response.statusText}`);
    }

    const data = await response.json();
    let fixedContent = data.candidates?.[0]?.content?.parts?.[0]?.text;

    if (fixedContent) {
      if (fixedContent.startsWith('```')) {
        fixedContent = fixedContent.replace(/^```[a-zA-Z]*\n/, '').replace(/\n```$/, '');
      }

      fs.writeFileSync(filePath, fixedContent, 'utf-8');
      console.log(`Disk updated for: ${filePath}`);
      
      // Execute the save immediately
      commitAndPushFile(filePath, modelName);
    }
  } catch (error) {
    console.error(`Failed to process ${filePath} with ${modelName}:`, error.message);
  }
}

async function main() {
  // Configure git identities inside the script execution scope
  try {
    execSync('git config --global user.name "github-actions[bot]"');
    execSync('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
  } catch (err) {
    console.error("Failed to initialize git configuration profile.", err.message);
  }

  const allFiles = getAllFiles('.');
  console.log(`Found ${allFiles.length} total eligible target files across repository.`);
  
  // Slice to max 50 files for this specific iteration run
  const targetFiles = allFiles.slice(0, FILE_LIMIT);
  console.log(`Capping optimization stream to the first ${targetFiles.length} files to protect token usage.`);

  for (let i = 0; i < targetFiles.length; i++) {
    const file = targetFiles[i];
    // Cycle sequentially through models: 0, 1, 2, 3, 4, 0, 1...
    const modelName = GEMINI_MODELS[i % GEMINI_MODELS.length];
    
    await fixFileWithGemini(file, modelName);
    
    // 2-second delay between file streams to maintain stable pacing
    await new Promise(resolve => setTimeout(resolve, 2000));
  }
  
  console.log("Optimization batch completed successfully.");
}

main();
