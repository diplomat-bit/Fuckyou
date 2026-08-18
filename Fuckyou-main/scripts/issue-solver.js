const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');
const { GoogleGenerativeAI } = require('@google/generative-ai');
const { Octokit } = require('@octokit/rest');

// Helper to clean JSON responses from Gemini (stripping markdown code blocks if present)
function cleanJsonResponse(text) {
  let clean = text.trim();
  // Remove markdown code blocks if present
  clean = clean.replace(/^```json\s*/i, '');
  clean = clean.replace(/^```\s*/i, '');
  clean = clean.replace(/```$/, '');
  clean = clean.trim();

  try {
    return JSON.parse(clean);
  } catch (e) {
    // Try to extract JSON using regex
    const jsonMatch = clean.match(/[\{\[][\s\S]*[\}\]]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (innerError) {
        throw new Error(`Failed to parse extracted JSON: ${innerError.message}. Original text: ${text}`);
      }
    }
    throw new Error(`Failed to parse JSON: ${e.message}. Original text: ${text}`);
  }
}

// Helper to recursively list all files in the workspace
function getAllFiles(dirPath, arrayOfFiles = []) {
  try {
    const files = fs.readdirSync(dirPath);

    files.forEach((file) => {
      const absolutePath = path.join(dirPath, file);
      const relativePath = path.relative(process.cwd(), absolutePath);

      // Ignore common directories and lock files
      if (
        file === 'node_modules' ||
        file === '.git' ||
        file === 'dist' ||
        file === 'build' ||
        file === '.github' ||
        file === 'package-lock.json' ||
        file === 'yarn.lock' ||
        file === 'pnpm-lock.yaml' ||
        file === 'bun.lockb' ||
        file === 'bun.lock' ||
        file === 'tmp' ||
        file === '.cache'
      ) {
        return;
      }

      try {
        const stat = fs.statSync(absolutePath);
        if (stat.isDirectory()) {
          getAllFiles(absolutePath, arrayOfFiles);
        } else if (stat.isFile()) {
          arrayOfFiles.push(relativePath);
        }
      } catch (e) {
        console.warn(`Skipping path due to error: ${absolutePath}`, e.message);
      }
    });
  } catch (e) {
    console.warn(`Skipping directory due to error: ${dirPath}`, e.message);
  }

  return arrayOfFiles;
}

// Helper to run shell commands safely
function runCommand(command) {
  try {
    return execSync(command, { encoding: 'utf8' }).trim();
  } catch (error) {
    console.error(`Failed to execute command: ${command}`, error.message);
    throw error;
  }
}

async function main() {
  const repoEnv = process.env.GITHUB_REPOSITORY;
  const issueNumberStr = process.env.ISSUE_NUMBER;
  const githubToken = process.env.GITHUB_TOKEN;
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (!repoEnv || !issueNumberStr || !githubToken || !geminiApiKey) {
    console.error('Missing required environment variables: GITHUB_REPOSITORY, ISSUE_NUMBER, GITHUB_TOKEN, GEMINI_API_KEY');
    process.exit(1);
  }

  const [owner, repo] = repoEnv.split('/');
  const issueNumber = parseInt(issueNumberStr, 10);

  console.log(`Initializing Issue Solver for ${owner}/${repo} #${issueNumber}...`);

  // Initialize APIs
  const octokit = new Octokit({ auth: githubToken });
  const genAI = new GoogleGenerativeAI(geminiApiKey);

  // Helper to generate content with fallback models
  async function generateContentWithFallback(prompt) {
    const models = ['gemini-2.5-flash', 'gemini-1.5-flash', 'gemini-1.5-pro'];
    let lastError;
    for (const modelName of models) {
      try {
        console.log(`Attempting generation with model: ${modelName}...`);
        const modelInstance = genAI.getGenerativeModel({ model: modelName });
        const result = await modelInstance.generateContent(prompt);
        return result.response.text();
      } catch (error) {
        console.warn(`Model ${modelName} failed:`, error.message);
        lastError = error;
      }
    }
    throw new Error(`All models failed. Last error: ${lastError?.message}`);
  }

  // 1. Fetch Issue Details & Comments
  console.log('Fetching issue details from GitHub...');
  let issue;
  try {
    const { data } = await octokit.issues.get({
      owner,
      repo,
      issue_number: issueNumber,
    });
    issue = data;
    console.log(`Issue Title: ${issue.title}`);
  } catch (error) {
    console.error('Error fetching issue details:', error.message);
    process.exit(1);
  }

  console.log('Fetching issue comments for additional context...');
  let commentsText = '';
  try {
    const { data: comments } = await octokit.issues.listComments({
      owner,
      repo,
      issue_number: issueNumber,
    });
    if (comments && comments.length > 0) {
      commentsText = comments.map(c => `Comment by ${c.user?.login || 'user'}: ${c.body}`).join('\n\n');
      console.log(`Fetched ${comments.length} comments.`);
    }
  } catch (error) {
    console.warn('Could not fetch issue comments:', error.message);
  }

  const issueBodyWithComments = `
Title: ${issue.title}
Body: ${issue.body || 'No description provided.'}
${commentsText ? `\nAdditional Comments:\n${commentsText}` : ''}
`;

  // 2. Scan Workspace Files
  console.log('Scanning workspace files...');
  const allFiles = getAllFiles(process.cwd());
  if (allFiles.length === 0) {
    console.error('No files found in the workspace.');
    process.exit(1);
  }
  console.log(`Found ${allFiles.length} files in workspace.`);

  // 3. Ask Gemini to identify target files
  console.log('Analyzing repository structure to locate target files...');
  const fileIdentificationPrompt = `You are an expert software engineer.
Given the following bug report/issue:
${issueBodyWithComments}

And the list of files in the repository:
${allFiles.join('\n')}

Identify which files need to be modified to resolve this issue.
Respond ONLY with a JSON array of file paths, for example:
["src/index.js", "src/utils.js"]
Do not include any markdown formatting, code blocks, or extra text. Just the raw JSON array.`;

  let targetFiles = [];
  try {
    const responseText = await generateContentWithFallback(fileIdentificationPrompt);
    targetFiles = cleanJsonResponse(responseText);
    console.log('Target files identified by Gemini:', targetFiles);
  } catch (error) {
    console.error('Error identifying target files:', error.message);
    process.exit(1);
  }

  if (!Array.isArray(targetFiles) || targetFiles.length === 0) {
    console.error('No target files identified or invalid response format.');
    process.exit(1);
  }

  // 4. Read contents of target files
  const filesContentMap = {};
  for (const file of targetFiles) {
    const filePath = path.join(process.cwd(), file);
    if (fs.existsSync(filePath)) {
      filesContentMap[file] = fs.readFileSync(filePath, 'utf8');
    } else {
      console.warn(`Warning: Identified file does not exist locally: ${file}`);
    }
  }

  if (Object.keys(filesContentMap).length === 0) {
    console.error('None of the identified target files exist in the workspace.');
    process.exit(1);
  }

  // 5. Ask Gemini to generate precise patches
  console.log('Generating code patches...');
  const filesContentString = Object.entries(filesContentMap)
    .map(([filePath, content]) => `--- FILE: ${filePath} ---\n${content}\n--- END FILE ---`)
    .join('\n\n');

  const patchPrompt = `You are an expert software engineer.
We need to resolve the following issue:
${issueBodyWithComments}

Here are the current contents of the files identified for modification:

${filesContentString}

Please generate the complete updated content for each of these files to resolve the issue.
Respond ONLY with a JSON object where the keys are the file paths and the values are the complete, updated file contents.
Example format:
{
  "src/index.js": "const updatedCode = ...",
  "src/utils.js": "..."
}
Do not include any markdown formatting, code blocks, or extra text. Just the raw JSON object.`;

  let updatedFiles = {};
  try {
    const responseText = await generateContentWithFallback(patchPrompt);
    updatedFiles = cleanJsonResponse(responseText);
  } catch (error) {
    console.error('Error generating patches:', error.message);
    process.exit(1);
  }

  // 6. Prepare Workspace (Git Branch)
  console.log('Preparing workspace for automated pull request creation...');
  const branchName = `issue-solver/fix-issue-${issueNumber}`;
  
  try {
    // Configure git user if not already set
    try {
      runCommand('git config --global user.name "github-actions[bot]"');
      runCommand('git config --global user.email "github-actions[bot]@users.noreply.github.com"');
    } catch (e) {
      console.log('Git user configuration skipped or already configured.');
    }

    // Create and switch to branch
    console.log(`Creating branch: ${branchName}`);
    runCommand(`git checkout -B ${branchName}`);
  } catch (error) {
    console.error('Error preparing git branch:', error.message);
    process.exit(1);
  }

  // 7. Apply Changes
  console.log('Applying generated patches to workspace...');
  for (const [filePath, newContent] of Object.entries(updatedFiles)) {
    const absolutePath = path.join(process.cwd(), filePath);
    try {
      fs.mkdirSync(path.dirname(absolutePath), { recursive: true });
      fs.writeFileSync(absolutePath, newContent, 'utf8');
      console.log(`Successfully updated: ${filePath}`);
    } catch (error) {
      console.error(`Failed to write updates to ${filePath}:`, error.message);
    }
  }

  // 8. Commit Changes
  try {
    console.log('Staging and committing changes...');
    runCommand('git add .');
    
    // Check if there are actual changes to commit
    const status = runCommand('git status --porcelain');
    if (!status) {
      console.log('No changes detected. Workspace is clean.');
      process.exit(0);
    }

    runCommand(`git commit -m "fix: resolve issue #${issueNumber} via AI solver"`);
    console.log(`Workspace successfully prepared on branch: ${branchName}`);
  } catch (error) {
    console.error('Error committing changes:', error.message);
    process.exit(1);
  }

  // 9. Push Changes and Create Pull Request
  try {
    console.log(`Pushing branch ${branchName} to origin...`);
    const remoteUrl = `https://x-access-token:${githubToken}@github.com/${owner}/${repo}.git`;
    runCommand(`git push "${remoteUrl}" HEAD:${branchName} --force`);

    // Detect default branch
    let defaultBranch = 'main';
    try {
      const { data: repoData } = await octokit.repos.get({ owner, repo });
      defaultBranch = repoData.default_branch || 'main';
    } catch (e) {
      console.warn('Could not fetch repository default branch, defaulting to main:', e.message);
    }

    console.log('Creating Pull Request...');
    const prTitle = `fix: resolve issue #${issueNumber} via AI solver`;
    const prBody = `This is an automated pull request generated by the AI Issue Solver to resolve issue #${issueNumber}.\n\n### Issue Description\n**Title:** ${issue.title}\n\n**Body:**\n${issue.body || 'No description provided.'}\n\n### Changes Applied\n${Object.keys(updatedFiles).map(f => `- Updated \`${f}\``).join('\n')}`;

    const { data: pr } = await octokit.pulls.create({
      owner,
      repo,
      title: prTitle,
      body: prBody,
      head: branchName,
      base: defaultBranch,
    });

    console.log(`Pull Request created successfully: ${pr.html_url}`);

    // Add a comment to the issue
    console.log('Adding comment to the issue...');
    await octokit.issues.createComment({
      owner,
      repo,
      issue_number: issueNumber,
      body: `🤖 AI Issue Solver has proposed a fix for this issue in Pull Request #${pr.number} (${pr.html_url}).`,
    });

  } catch (error) {
    console.error('Error pushing changes or creating Pull Request:', error.message);
    process.exit(1);
  }
}

main().catch((err) => {
  console.error('Fatal error in issue-solver script:', err);
  process.exit(1);
});