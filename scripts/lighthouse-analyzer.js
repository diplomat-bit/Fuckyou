const fs = require('fs');
const path = require('path');
const { GoogleGenerativeAI } = require('@google/generative-ai');

/**
 * Attempts to retrieve the Gemini API key from environment variables or local configuration files.
 * @returns {string|null} The API key if found, otherwise null.
 */
function getApiKey() {
  if (process.env.GEMINI_API_KEY) return process.env.GEMINI_API_KEY;
  if (process.env.API_KEY) return process.env.API_KEY;
  if (process.env.VITE_GEMINI_API_KEY) return process.env.VITE_GEMINI_API_KEY;

  const secretsPath = path.resolve(process.cwd(), 'secrets.json');
  if (fs.existsSync(secretsPath)) {
    try {
      const secrets = JSON.parse(fs.readFileSync(secretsPath, 'utf8'));
      return secrets.GEMINI_API_KEY || secrets.geminiApiKey || secrets.VITE_GEMINI_API_KEY || secrets.API_KEY || null;
    } catch (e) {
      // Ignore json parse error
    }
  }
  return null;
}

/**
 * Prints usage instructions and exits.
 */
function printUsageAndExit() {
  console.log(`
Usage:
  node scripts/lighthouse-analyzer.js <path-to-lighthouse-report.json> [output-directory]

Environment Variables / Configuration:
  GEMINI_API_KEY    Required (or present in secrets.json). Your Gemini API key.
  GEMINI_MODEL      Optional. Generative model to use (default: gemini-1.5-flash).
`);
  process.exit(1);
}

/**
 * Parses the Lighthouse JSON report and extracts key performance, SEO, accessibility, and architectural bottlenecks.
 * @param {object} report - The parsed Lighthouse JSON object.
 * @returns {object} Extracted bottlenecks and metadata.
 */
function extractBottlenecks(report) {
  const audits = report.audits || {};
  const bottlenecks = [];

  // Target audits related to performance, core web vitals, assets, accessibility, and SEO
  const targetAudits = [
    // Core Web Vitals & Loading
    'first-contentful-paint',
    'largest-contentful-paint',
    'total-blocking-time',
    'cumulative-layout-shift',
    'speed-index',
    'interactive',
    'server-response-time',
    'dom-size',

    // Images
    'modern-image-formats',
    'uses-optimized-images',
    'responsive-images',
    'efficient-animated-content',
    'uses-text-compression',

    // CSS/JS Bundles & Size
    'unminified-javascript',
    'unminified-css',
    'unused-javascript',
    'unused-css-rules',
    'total-byte-weight',
    'render-blocking-resources',

    // SEO / Meta & PWA
    'meta-description',
    'viewport',
    'document-title',
    'font-display',
    'canonical',
    'structured-data',
    'is-on-https',

    // Accessibility
    'aria-allowed-attr',
    'aria-required-children',
    'color-contrast',
    'image-alt',
    'label'
  ];

  for (const auditId of targetAudits) {
    const audit = audits[auditId];
    if (audit && audit.score !== null && audit.score < 0.9) {
      // Extract relevant details
      const items = audit.details && audit.details.items ? audit.details.items.slice(0, 10) : [];
      bottlenecks.push({
        id: auditId,
        title: audit.title,
        description: audit.description,
        score: audit.score,
        displayValue: audit.displayValue,
        numericValue: audit.numericValue,
        warnings: audit.warnings,
        items: items.map(item => {
          return {
            url: item.url || item.node?.snippet || item.node?.selector || undefined,
            wastedBytes: item.wastedBytes,
            wastedPercent: item.wastedPercent,
            totalBytes: item.totalBytes,
            nodeLabel: item.node?.nodeLabel
          };
        })
      });
    }
  }

  return {
    url: report.requestedUrl || report.finalUrl || 'Unknown URL',
    fetchTime: report.fetchTime,
    lighthouseVersion: report.lighthouseVersion,
    scores: {
      performance: report.categories?.performance?.score ?? 0,
      seo: report.categories?.seo?.score ?? 0,
      bestPractices: report.categories?.['best-practices']?.score ?? 0,
      accessibility: report.categories?.accessibility?.score ?? 0,
      pwa: report.categories?.pwa?.score ?? 0
    },
    bottlenecks
  };
}

/**
 * Queries Gemini to generate optimized code, configurations, and recommendations.
 * @param {object} data - Extracted bottleneck data.
 * @param {string} [apiKey] - Optional explicit API key.
 * @returns {Promise<string>} Gemini's response.
 */
async function queryGemini(data, apiKey) {
  const key = apiKey || getApiKey();
  if (!key) {
    throw new Error("GEMINI_API_KEY environment variable or secrets.json entry is missing. Please set it before running the script.");
  }

  const modelName = process.env.GEMINI_MODEL || 'gemini-1.5-flash';
  const genAI = new GoogleGenerativeAI(key);
  const model = genAI.getGenerativeModel({ model: modelName });

  const prompt = `
You are an expert Web Performance Engineer, Frontend Architect, and Security Specialist.
Analyze the following Lighthouse audit bottlenecks for the website: ${data.url}

Current Category Scores:
- Performance: ${Math.round(data.scores.performance * 100)}/100
- SEO: ${Math.round(data.scores.seo * 100)}/100
- Best Practices: ${Math.round(data.scores.bestPractices * 100)}/100
- Accessibility: ${Math.round(data.scores.accessibility * 100)}/100
- PWA: ${Math.round(data.scores.pwa * 100)}/100

Identified Bottlenecks (${data.bottlenecks.length}):
${JSON.stringify(data.bottlenecks, null, 2)}

Your task is to generate a comprehensive, production-ready optimization report.
For each critical bottleneck identified:
1. Provide a clear explanation of why it occurs and how it impacts performance, Web Vitals, or user experience.
2. Generate the exact optimized code, configuration files, or scripts needed to resolve the issue. This includes:
   - Optimized build configurations (e.g., vite.config.ts, webpack.config.js, or next.config.js).
   - HTML snippets (e.g., optimized meta tags, preloading/prefetching, asset tags, viewport setup).
   - React/TypeScript component optimizations (e.g., code-splitting with React.lazy, dynamic imports, image component wrappers).
   - CSS/JS optimization strategies (critical CSS, font loading with font-display: swap).
   - Caching strategies or server config (e.g., Nginx, Express headers, Service Worker caching).
3. Ensure all code blocks are fully functional, well-commented, and ready to be integrated into modern React/TypeScript/Vite web apps.

Format your response in clean Markdown. Group the optimizations logically into:
1. Critical Web Vitals & Asset Delivery
2. JavaScript & CSS Code-Splitting / Bundle Optimization
3. Image & Font Optimizations
4. SEO, Metadata & Accessibility Adjustments
5. Server, Caching & Deployment Enhancements
`;

  console.log(`Querying Gemini API (${modelName}) for optimizations...`);
  const result = await model.generateContent(prompt);
  const response = await result.response;
  return response.text();
}

/**
 * Programmatic execution method for analyzing lighthouse report JSON.
 * @param {string} reportPath - Path to the lighthouse JSON file.
 * @param {string} outputDir - Directory to output findings.
 */
async function analyzeLighthouseReport(reportPath, outputDir) {
  if (!fs.existsSync(reportPath)) {
    throw new Error(`Lighthouse report file not found at "${reportPath}"`);
  }

  const rawData = fs.readFileSync(reportPath, 'utf8');
  const reportData = JSON.parse(rawData);

  console.log(`Analyzing Lighthouse report: ${reportPath}`);
  const extractedData = extractBottlenecks(reportData);

  if (!fs.existsSync(outputDir)) {
    fs.mkdirSync(outputDir, { recursive: true });
  }

  // Save extracted JSON for diagnostic tools
  const summaryPath = path.join(outputDir, 'lighthouse-summary.json');
  fs.writeFileSync(summaryPath, JSON.stringify(extractedData, null, 2), 'utf8');
  console.log(`Saved extracted audit metrics to: ${summaryPath}`);

  if (extractedData.bottlenecks.length === 0) {
    console.log("Great news! No significant bottlenecks (score < 0.9) were found in the targeted categories.");
    return { extractedData, reportMarkdown: null };
  }

  console.log(`Found ${extractedData.bottlenecks.length} bottleneck(s) to optimize.`);

  const reportMarkdown = await queryGemini(extractedData);
  const reportOutputPath = path.join(outputDir, 'optimizations-report.md');
  fs.writeFileSync(reportOutputPath, reportMarkdown, 'utf8');

  console.log(`\nSuccess! Optimization report generated successfully.`);
  console.log(`Saved to: ${reportOutputPath}`);

  return { extractedData, reportMarkdown, reportOutputPath };
}

/**
 * Main execution handler when run directly from command line.
 */
async function main() {
  const args = process.argv.slice(2);
  if (args.length < 1) {
    printUsageAndExit();
  }

  const reportPath = path.resolve(args[0]);
  const outputDir = args[1] ? path.resolve(args[1]) : path.join(process.cwd(), 'lighthouse-optimizations');

  try {
    await analyzeLighthouseReport(reportPath, outputDir);
  } catch (error) {
    console.error(`Error during optimization generation: ${error.message}`);
    process.exit(1);
  }
}

if (require.main === module) {
  main();
}

module.exports = {
  extractBottlenecks,
  queryGemini,
  analyzeLighthouseReport,
  getApiKey
};