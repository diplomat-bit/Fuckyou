# Multi-Workflow Self-Healing Ecosystem

Welcome to the **Multi-Workflow Self-Healing Ecosystem**, an automated repository maintenance framework. This system leverages GitHub Actions, advanced static analysis, and Gemini Pro AI to automatically detect, diagnose, and repair codebase issues (such as linting errors, failing tests, security vulnerabilities, and broken dependencies) without requiring manual developer intervention.

---

## Table of Contents

1. [System Overview](#system-overview)
2. [How the Workflows Interact](#how-the-workflows-interact)
3. [GitHub Secrets Configuration](#github-secrets-configuration)
4. [Local Execution Guide](#local-execution-guide)
5. [Best Practices for Automated Maintenance](#best-practices-for-automated-maintenance)
6. [Troubleshooting & Logs](#troubleshooting--logs)

---

## System Overview

The self-healing ecosystem is designed to transform passive CI/CD pipelines into active, self-correcting systems. Instead of merely reporting that a build or test suite has failed, the ecosystem triggers an AI-driven agent that:
1. Analyzes the failure logs and the affected source code.
2. Formulates a precise code fix using the Gemini API.
3. Validates the fix locally within a sandbox or temporary runner.
4. Submits a structured Pull Request (or commits directly to a patch branch) to resolve the issue.

```
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│  Code Push /   │ ───> │  CI Pipeline   │ ───> │  Build/Test    │
│  Scheduled Run │      │  (Lint/Test)   │      │  Failure!      │
└────────────────┘      └────────────────┘      └────────────────┘
                                                        │
                                                        ▼
┌────────────────┐      ┌────────────────┐      ┌────────────────┐
│ Pull Request   │ <─── │ Validate Fix   │ <─── │ Gemini AI      │
│ Created/Merged │      │ (Local Run)    │      │ Agent Repair   │
└────────────────┘      └────────────────┘      └────────────────┘
```

---

## How the Workflows Interact

The ecosystem is composed of four primary workflows located in `.github/workflows/`:

### 1. Code Quality & Linting (`lint-and-format.yml`)
* **Trigger:** On push to any branch, or pull request target.
* **Purpose:** Runs linters (e.g., ESLint, Prettier, Ruff, or Flake8) to ensure style guide compliance.
* **Failure Action:** If linting fails, it dispatches a repository event to trigger the Self-Healing Agent with the linting error log.

### 2. Automated Testing (`test-suite.yml`)
* **Trigger:** On push, pull request, or manual dispatch.
* **Purpose:** Executes unit, integration, and end-to-end tests.
* **Failure Action:** On test failure, it packages the failing test files, the test runner output, and the stack trace, then triggers the Self-Healing Agent.

### 3. Self-Healing Agent (`self-healing-agent.yml`)
* **Trigger:** Repository dispatch events (`trigger-self-healing`) or workflow run failures.
* **Purpose:** The core engine. It reads the failure context, queries the Gemini API (`gemini-1.5-pro` or `gemini-1.5-flash`), applies the suggested code modifications, runs a verification build, and opens a Pull Request with the prefix `self-healing/patch-*`.

### 4. Scheduled Repository Maintenance (`scheduled-maintenance.yml`)
* **Trigger:** Cron schedule (e.g., every Sunday at 00:00 UTC) or manual trigger.
* **Purpose:** Scans for outdated dependencies, deprecated API usages, and security vulnerabilities (using tools like Dependabot, npm audit, or Snyk). If vulnerabilities are found, it automatically invokes the Self-Healing Agent to upgrade packages and fix breaking changes.

---

## GitHub Secrets Configuration

To enable the self-healing ecosystem, you must configure the following secrets in your GitHub repository settings (**Settings > Secrets and variables > Actions**):

| Secret Name | Required | Description |
| :--- | :---: | :--- |
| `GEMINI_API_KEY` | **Yes** | Your Google AI Studio API key. Used to authenticate requests to the Gemini models for code generation and error analysis. |
| `HEALER_PAT` | *Optional* | A Personal Access Token (PAT) with `repo` and `workflow` scopes. Required if you want the self-healing agent to trigger other GitHub Actions workflows upon creating a patch branch (the default `GITHUB_TOKEN` cannot trigger subsequent workflow runs to prevent infinite loops). |
| `SLACK_WEBHOOK_URL` | *Optional* | Webhook URL to send real-time notifications regarding healing attempts, successes, and failures to your team's Slack channel. |

### Steps to Configure Secrets:
1. Navigate to your repository on GitHub.
2. Click on **Settings** (the gear icon).
3. In the left sidebar, expand **Secrets and variables** and click **Actions**.
4. Click **New repository secret**.
5. Add `GEMINI_API_KEY` and paste your API key from Google AI Studio.
6. (Optional) Add `HEALER_PAT` with your custom GitHub Personal Access Token.

---

## Local Execution Guide

You can run the self-healing scripts locally to debug the AI's suggestions or to manually trigger a repair session without pushing to GitHub.

### Prerequisites
* Node.js (v18 or higher) or Python (3.10 or higher) depending on your project's implementation.
* A valid Gemini API Key exported to your environment.

### Setup Environment
Create a `.env` file in the root of your repository:
```bash
GEMINI_API_KEY="your_actual_gemini_api_key_here"
GITHUB_TOKEN="your_local_github_pat_for_testing"
ENVIRONMENT="local"
```

### Running the Repair Script

#### For Node.js-based Healing Agents:
```bash
# Install dependencies
npm install

# Run the self-healing script with a simulated error log
node scripts/self-healing/heal.js --error-log="./logs/sample-failure.log" --target-file="./src/utils/math.js"
```

#### For Python-based Healing Agents:
```bash
# Set up virtual environment
python -m venv venv
source venv/bin/activate

# Install dependencies
pip install -r scripts/self-healing/requirements.txt

# Run the self-healing script
python scripts/self-healing/heal.py --error-log "./logs/sample-failure.log" --target-file "./src/utils/math.js"
```

---

## Best Practices for Automated Maintenance

To maintain a secure, stable, and highly efficient self-healing repository, adhere to the following best practices:

### 1. Prevent Infinite Loops (The "Runaway Agent" Problem)
* **Limit Retries:** Configure the self-healing workflow to attempt a maximum of **3 healing cycles** per issue. If the fix still fails the test suite after 3 attempts, the agent must halt and assign a human reviewer.
* **Branch Filtering:** Ensure the self-healing workflow ignores pushes to branches matching `self-healing/patch-*` to prevent the agent from triggering itself recursively.

### 2. Strict Verification Sandboxing
* Always run the project's test suite (`npm test`, `pytest`, etc.) *inside* the self-healing runner *before* committing the code or opening a Pull Request.
* If the verification step fails, reject the AI's suggestion, log the new error, and feed it back into the model for a second iteration.

### 3. Human-in-the-Loop Review
* While the agent can commit directly to development branches in highly experimental repositories, for production systems, **always require a Pull Request**.
* Protect your `main` or `production` branches using GitHub Branch Protection Rules:
  * Require status checks to pass before merging.
  * Require at least one approved review from a human maintainer.

### 4. Prompt Engineering & Context Minimization
* Do not send the entire codebase to the Gemini API. This wastes tokens and increases latency.
* Send only:
  1. The specific failing file(s).
  2. The relevant test file.
  3. The exact error stack trace (truncated to the last 100 lines).
* Use system instructions to force the model to output *only* valid code or structured JSON containing the patch, avoiding conversational filler.

---

## Troubleshooting & Logs

If the self-healing agent fails to run or produces incorrect fixes, check the following:

* **API Rate Limits:** The Gemini API has rate limits (Requests Per Minute / Tokens Per Minute). If you hit these limits, the agent will log a `429 Too Many Requests` error. Implement exponential backoff in your local scripts.
* **Insufficient Permissions:** If the agent fails to create a branch or open a Pull Request, verify that the workflow has write permissions. In your workflow YAML, ensure you have:
  ```yaml
  permissions:
    contents: write
    pull-requests: write
  ```
* **Incomplete Context:** If the AI generates irrelevant fixes, inspect the generated prompt in the GitHub Actions run logs to ensure the error log was correctly parsed and passed to the model.