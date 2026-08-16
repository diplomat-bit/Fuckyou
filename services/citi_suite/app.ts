import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import multer from 'multer';
import { parseStringPromise } from 'xml2js';
import { GoogleGenerativeAI } from '@google/generative-ai';

declare module 'multer';
declare module 'xml2js';

// Load environment variables
dotenv.config();

const app = express();
const port = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// Multer configuration for file uploads
const storage = multer.memoryStorage();
const upload = multer({ 
  storage,
  limits: { fileSize: 10 * 1024 * 1024 } // 10MB limit
});

// In-memory database/state
let rawXmlStore: string = '';
let parsedXmlStore: any = null;
let aiAnalysisStore: {
  summary: string;
  timestamp: string;
  modelUsed: string;
} | null = null;

// Initialize Gemini AI
const geminiApiKey = process.env.GEMINI_API_KEY || '';
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

/**
 * Helper to parse XML string to JSON
 */
async function parseXmlToJson(xmlString: string): Promise<any> {
  try {
    const cleanXml = xmlString.trim();
    if (!cleanXml) {
      throw new Error('XML content is empty');
    }
    return await parseStringPromise(cleanXml, {
      explicitArray: false,
      mergeAttrs: true,
      ignoreAttrs: false,
    });
  } catch (error: any) {
    throw new Error(`XML Parsing Error: ${error.message}`);
  }
}

/**
 * API Endpoints
 */

// 1. Upload XML File
app.post('/api/xml/upload', upload.single('file'), async (req: Request & { file?: any }, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!req.file) {
      res.status(400).json({ error: 'No file uploaded' });
      return;
    }

    const xmlContent = req.file.buffer.toString('utf-8');
    const parsedData = await parseXmlToJson(xmlContent);

    rawXmlStore = xmlContent;
    parsedXmlStore = parsedData;

    res.status(200).json({
      message: 'XML file uploaded and parsed successfully',
      data: parsedXmlStore
    });
  } catch (error: any) {
    next(error);
  }
});

// 2. Submit Raw XML Text
app.post('/api/xml/raw', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { xml } = req.body;
    if (!xml) {
      res.status(400).json({ error: 'No XML content provided in request body' });
      return;
    }

    const parsedData = await parseXmlToJson(xml);
    rawXmlStore = xml;
    parsedXmlStore = parsedData;

    res.status(200).json({
      message: 'XML text received and parsed successfully',
      data: parsedXmlStore
    });
  } catch (error: any) {
    next(error);
  }
});

// 3. Get Parsed XML Data
app.get('/api/xml', (req: Request, res: Response) => {
  if (!parsedXmlStore) {
    res.status(404).json({ error: 'No XML data has been parsed yet' });
    return;
  }
  res.status(200).json({
    raw: rawXmlStore,
    parsed: parsedXmlStore
  });
});

// 4. Trigger Gemini AI Analysis
app.post('/api/analyze', async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    if (!parsedXmlStore) {
      res.status(400).json({ error: 'No parsed XML data available for analysis. Please upload XML first.' });
      return;
    }

    if (!genAI) {
      res.status(500).json({ 
        error: 'Gemini API Key is not configured on the server. Please set the GEMINI_API_KEY environment variable.' 
      });
      return;
    }

    const { customPrompt } = req.body;
    const modelName = 'gemini-1.5-flash';
    const model = genAI.getGenerativeModel({ model: modelName });

    const defaultPrompt = `You are an expert data analyst and system architect. 
Analyze the following parsed XML data structure and content. 
Provide:
1. An executive summary of what this data represents.
2. Key insights, patterns, or anomalies found in the data.
3. A structured breakdown of the main entities and their relationships.
4. Actionable recommendations or next steps based on this data.
5. A suggested JSON schema or database structure to store this data permanently.

Format your entire response in clean, beautiful Markdown with clear headings, bullet points, and tables where appropriate.

Parsed XML Data (JSON format):
${JSON.stringify(parsedXmlStore, null, 2)}`;

    const prompt = customPrompt ? `${customPrompt}\n\nData:\n${JSON.stringify(parsedXmlStore, null, 2)}` : defaultPrompt;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    const text = response.text();

    aiAnalysisStore = {
      summary: text,
      timestamp: new Date().toISOString(),
      modelUsed: modelName
    };

    res.status(200).json(aiAnalysisStore);
  } catch (error: any) {
    next(error);
  }
});

// 5. Get Latest AI Analysis
app.get('/api/analysis', (req: Request, res: Response) => {
  if (!aiAnalysisStore) {
    res.status(404).json({ error: 'No AI analysis has been performed yet' });
    return;
  }
  res.status(200).json(aiAnalysisStore);
});

// 6. Reset Server State
app.post('/api/reset', (req: Request, res: Response) => {
  rawXmlStore = '';
  parsedXmlStore = null;
  aiAnalysisStore = null;
  res.status(200).json({ message: 'Server state reset successfully' });
});

// 7. Serve Interactive Presentation Dashboard (HTML/JS/CSS)
app.get('/', (req: Request, res: Response) => {
  res.send(`
<!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Gemini XML Intelligence Dashboard</title>
    <script src="https://cdn.tailwindcss.com"></script>
    <script src="https://cdn.jsdelivr.net/npm/marked/marked.min.js"></script>
    <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.4.0/css/all.min.css">
    <style>
        .markdown-body table {
            width: 100%;
            border-collapse: collapse;
            margin: 1rem 0;
        }
        .markdown-body th, .markdown-body td {
            border: 1px solid #e2e8f0;
            padding: 0.75rem;
            text-align: left;
        }
        .markdown-body th {
            background-color: #f8fafc;
        }
        .markdown-body h1 { font-size: 1.8rem; font-weight: 700; margin-top: 1.5rem; margin-bottom: 0.5rem; color: #1e293b; }
        .markdown-body h2 { font-size: 1.5rem; font-weight: 600; margin-top: 1.25rem; margin-bottom: 0.5rem; color: #334155; }
        .markdown-body h3 { font-size: 1.25rem; font-weight: 600; margin-top: 1rem; margin-bottom: 0.5rem; color: #475569; }
        .markdown-body ul, .markdown-body ol { padding-left: 1.5rem; margin-bottom: 1rem; list-style-type: disc; }
        .markdown-body p { margin-bottom: 1rem; line-height: 1.6; color: #334155; }
        .markdown-body code { background-color: #f1f5f9; padding: 0.2rem 0.4rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.9em; }
        .markdown-body pre { background-color: #0f172a; color: #f8fafc; padding: 1rem; border-radius: 0.5rem; overflow-x: auto; margin-bottom: 1rem; }
        .markdown-body pre code { background-color: transparent; color: inherit; padding: 0; }
    </style>
</head>
<body class="bg-slate-50 min-h-screen font-sans text-slate-800">

    <!-- Navigation -->
    <nav class="bg-indigo-900 text-white shadow-md">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex items-center justify-between h-16">
                <div class="flex items-center space-x-3">
                    <i class="fa-solid fa-brain text-2xl text-indigo-300 animate-pulse"></i>
                    <span class="font-bold text-xl tracking-wider">Gemini XML Intelligence</span>
                </div>
                <div class="flex items-center space-x-4">
                    <span class="bg-indigo-800 px-3 py-1 rounded-full text-xs font-semibold text-indigo-200 border border-indigo-700">
                        Powered by Gemini 1.5 Flash
                    </span>
                    <button onclick="resetState()" class="text-sm bg-red-600 hover:bg-red-700 px-3 py-1.5 rounded transition font-medium">
                        <i class="fa-solid fa-trash-can mr-1"></i> Reset
                    </button>
                </div>
            </div>
        </div>
    </nav>

    <!-- Main Content -->
    <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div class="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            <!-- Left Column: Input & Controls -->
            <div class="lg:col-span-5 space-y-6">
                
                <!-- XML Input Card -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <i class="fa-solid fa-file-code text-indigo-600 mr-2"></i> Load XML Data
                    </h2>
                    
                    <!-- Tabs for Upload Method -->
                    <div class="flex border-b border-slate-200 mb-4">
                        <button onclick="switchInputTab('file')" id="tab-file" class="flex-1 py-2 text-center font-medium text-sm border-b-2 border-indigo-600 text-indigo-600">
                            <i class="fa-solid fa-upload mr-1"></i> File Upload
                        </button>
                        <button onclick="switchInputTab('text')" id="tab-text" class="flex-1 py-2 text-center font-medium text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700">
                            <i class="fa-solid fa-keyboard mr-1"></i> Raw XML Text
                        </button>
                    </div>

                    <!-- File Upload Form -->
                    <div id="input-file-container" class="space-y-4">
                        <div class="border-2 border-dashed border-slate-300 rounded-lg p-6 text-center hover:border-indigo-500 transition cursor-pointer relative" id="dropzone">
                            <input type="file" id="fileInput" accept=".xml" class="absolute inset-0 w-full h-full opacity-0 cursor-pointer" onchange="handleFileSelect(event)">
                            <i class="fa-solid fa-cloud-arrow-up text-4xl text-slate-400 mb-2"></i>
                            <p class="text-sm font-medium text-slate-700" id="fileName">Drag & drop your XML file here, or click to browse</p>
                            <p class="text-xs text-slate-500 mt-1">Supports standard XML files up to 10MB</p>
                        </div>
                        <button onclick="uploadFile()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-sm flex items-center justify-center">
                            <i class="fa-solid fa-play mr-2"></i> Parse Uploaded File
                        </button>
                    </div>

                    <!-- Raw Text Form -->
                    <div id="input-text-container" class="space-y-4 hidden">
                        <textarea id="rawXmlText" rows="8" class="w-full border border-slate-300 rounded-lg p-3 font-mono text-xs focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="Paste your XML content here..."></textarea>
                        <button onclick="submitRawXml()" class="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-2.5 px-4 rounded-lg transition shadow-sm flex items-center justify-center">
                            <i class="fa-solid fa-play mr-2"></i> Parse Raw XML
                        </button>
                    </div>
                </div>

                <!-- AI Analysis Trigger Card -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
                    <h2 class="text-lg font-bold text-slate-900 mb-4 flex items-center">
                        <i class="fa-solid fa-wand-magic-sparkles text-indigo-600 mr-2"></i> AI Analysis Settings
                    </h2>
                    <div class="space-y-4">
                        <div>
                            <label class="block text-sm font-medium text-slate-700 mb-1">Custom Prompt / Focus Area (Optional)</label>
                            <textarea id="customPrompt" rows="3" class="w-full border border-slate-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500" placeholder="e.g., Focus on identifying financial anomalies, or summarize the user permissions..."></textarea>
                        </div>
                        <button onclick="triggerAnalysis()" id="btn-analyze" class="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 text-white font-bold py-3 px-4 rounded-lg transition shadow-md flex items-center justify-center space-x-2">
                            <i class="fa-solid fa-bolt"></i>
                            <span>Generate Gemini AI Insights</span>
                        </button>
                    </div>
                </div>

            </div>

            <!-- Right Column: Interactive Dashboard / Results -->
            <div class="lg:col-span-7 space-y-6">
                
                <!-- Status Bar -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 p-4 flex items-center justify-between">
                    <div class="flex items-center space-x-4">
                        <span class="flex h-3.5 w-3.5 relative">
                            <span class="animate-ping absolute inline-flex h-full w-full rounded-full opacity-75" id="status-ping"></span>
                            <span class="relative inline-flex rounded-full h-3.5 w-3.5" id="status-dot"></span>
                        </span>
                        <span class="font-medium text-sm text-slate-700" id="status-text">Awaiting XML Data...</span>
                    </div>
                    <div class="text-xs text-slate-500" id="status-timestamp"></div>
                </div>

                <!-- Output Tabs -->
                <div class="bg-white rounded-xl shadow-sm border border-slate-200 overflow-hidden">
                    <div class="flex border-b border-slate-200 bg-slate-50">
                        <button onclick="switchOutputTab('parsed')" id="tab-parsed" class="flex-1 py-3 text-center font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600">
                            <i class="fa-solid fa-code mr-1"></i> Parsed JSON
                        </button>
                        <button onclick="switchOutputTab('ai')" id="tab-ai" class="flex-1 py-3 text-center font-semibold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700">
                            <i class="fa-solid fa-robot mr-1"></i> AI Analysis
                        </button>
                    </div>

                    <!-- Parsed JSON View -->
                    <div id="output-parsed" class="p-6">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-slate-900">Structured JSON Representation</h3>
                            <button onclick="copyToClipboard('json-pre')" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                <i class="fa-solid fa-copy mr-1"></i> Copy JSON
                            </button>
                        </div>
                        <div class="bg-slate-900 rounded-lg p-4 overflow-auto max-h-[500px]">
                            <pre id="json-pre" class="text-emerald-400 font-mono text-xs leading-relaxed">{}</pre>
                        </div>
                    </div>

                    <!-- AI Analysis View -->
                    <div id="output-ai" class="p-6 hidden">
                        <div class="flex justify-between items-center mb-4">
                            <h3 class="font-bold text-slate-900 flex items-center">
                                <i class="fa-solid fa-sparkles text-violet-600 mr-2"></i> Gemini Executive Insights
                            </h3>
                            <button onclick="copyToClipboard('ai-markdown')" class="text-xs text-indigo-600 hover:text-indigo-800 font-medium">
                                <i class="fa-solid fa-copy mr-1"></i> Copy Markdown
                            </button>
                        </div>
                        <div id="ai-markdown" class="hidden"></div>
                        <div id="ai-rendered" class="markdown-body bg-white border border-slate-100 rounded-lg p-6 overflow-auto max-h-[500px] shadow-inner">
                            <div class="text-center py-12 text-slate-400">
                                <i class="fa-solid fa-brain text-5xl mb-3 block"></i>
                                <p>Click "Generate Gemini AI Insights" to analyze your parsed XML data.</p>
                            </div>
                        </div>
                    </div>
                </div>

            </div>
        </div>
    </main>

    <!-- Toast Notification -->
    <div id="toast" class="fixed bottom-5 right-5 bg-slate-900 text-white px-4 py-3 rounded-lg shadow-xl flex items-center space-x-2 transform translate-y-20 opacity-0 transition duration-300 z-50">
        <span id="toast-icon"></span>
        <span id="toast-message" class="text-sm font-medium"></span>
    </div>

    <script>
        let selectedFile = null;
        let currentInputTab = 'file';
        let currentOutputTab = 'parsed';

        // Initialize Status
        updateStatus('idle', 'Awaiting XML Data...');

        function switchInputTab(tab) {
            currentInputTab = tab;
            const fileTab = document.getElementById('tab-file');
            const textTab = document.getElementById('tab-text');
            const fileContainer = document.getElementById('input-file-container');
            const textContainer = document.getElementById('input-text-container');

            if (tab === 'file') {
                fileTab.className = "flex-1 py-2 text-center font-medium text-sm border-b-2 border-indigo-600 text-indigo-600";
                textTab.className = "flex-1 py-2 text-center font-medium text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700";
                fileContainer.classList.remove('hidden');
                textContainer.classList.add('hidden');
            } else {
                textTab.className = "flex-1 py-2 text-center font-medium text-sm border-b-2 border-indigo-600 text-indigo-600";
                fileTab.className = "flex-1 py-2 text-center font-medium text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700";
                textContainer.classList.remove('hidden');
                fileContainer.classList.add('hidden');
            }
        }

        function switchOutputTab(tab) {
            currentOutputTab = tab;
            const parsedTab = document.getElementById('tab-parsed');
            const aiTab = document.getElementById('tab-ai');
            const parsedOutput = document.getElementById('output-parsed');
            const aiOutput = document.getElementById('output-ai');

            if (tab === 'parsed') {
                parsedTab.className = "flex-1 py-3 text-center font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600";
                aiTab.className = "flex-1 py-3 text-center font-semibold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700";
                parsedOutput.classList.remove('hidden');
                aiOutput.classList.add('hidden');
            } else {
                aiTab.className = "flex-1 py-3 text-center font-semibold text-sm border-b-2 border-indigo-600 text-indigo-600";
                parsedTab.className = "flex-1 py-3 text-center font-semibold text-sm border-b-2 border-transparent text-slate-500 hover:text-slate-700";
                aiOutput.classList.remove('hidden');
                parsedOutput.classList.add('hidden');
            }
        }

        function handleFileSelect(event) {
            const file = event.target.files[0];
            if (file) {
                selectedFile = file;
                document.getElementById('fileName').innerText = file.name;
                showToast('success', 'File selected: ' + file.name);
            }
        }

        async function uploadFile() {
            if (!selectedFile) {
                showToast('error', 'Please select an XML file first');
                return;
            }

            updateStatus('loading', 'Uploading and parsing XML file...');
            const formData = new FormData();
            formData.append('file', selectedFile);

            try {
                const response = await fetch('/api/xml/upload', {
                    method: 'POST',
                    body: formData
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.error || 'Failed to upload file');

                document.getElementById('json-pre').innerText = JSON.stringify(result.data, null, 2);
                updateStatus('success', 'XML parsed successfully!');
                showToast('success', 'XML parsed successfully!');
                switchOutputTab('parsed');
            } catch (error) {
                updateStatus('error', error.message);
                showToast('error', error.message);
            }
        }

        async function submitRawXml() {
            const xmlText = document.getElementById('rawXmlText').value.trim();
            if (!xmlText) {
                showToast('error', 'Please paste XML content first');
                return;
            }

            updateStatus('loading', 'Parsing raw XML text...');

            try {
                const response = await fetch('/api/xml/raw', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ xml: xmlText })
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.error || 'Failed to parse XML');

                document.getElementById('json-pre').innerText = JSON.stringify(result.data, null, 2);
                updateStatus('success', 'XML parsed successfully!');
                showToast('success', 'XML parsed successfully!');
                switchOutputTab('parsed');
            } catch (error) {
                updateStatus('error', error.message);
                showToast('error', error.message);
            }
        }

        async function triggerAnalysis() {
            updateStatus('loading', 'Gemini AI is analyzing your data...');
            const customPrompt = document.getElementById('customPrompt').value.trim();
            switchOutputTab('ai');
            document.getElementById('ai-rendered').innerHTML = \`
                <div class="flex flex-col items-center justify-center py-12">
                    <i class="fa-solid fa-spinner fa-spin text-5xl text-indigo-600 mb-4"></i>
                    <p class="text-slate-600 font-medium">Gemini is processing the XML structure and generating insights...</p>
                </div>
            \`;

            try {
                const response = await fetch('/api/analyze', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ customPrompt })
                });
                const result = await response.json();

                if (!response.ok) throw new Error(result.error || 'AI Analysis failed');

                document.getElementById('ai-markdown').innerText = result.summary;
                document.getElementById('ai-rendered').innerHTML = marked.parse(result.summary);
                updateStatus('success', 'AI Analysis complete!');
                showToast('success', 'AI Analysis complete!');
            } catch (error) {
                updateStatus('error', error.message);
                showToast('error', error.message);
                document.getElementById('ai-rendered').innerHTML = \`
                    <div class="text-center py-12 text-red-600">
                        <i class="fa-solid fa-triangle-exclamation text-5xl mb-3 block"></i>
                        <p class="font-semibold">Analysis Failed</p>
                        <p class="text-sm text-slate-500 mt-1">\${error.message}</p>
                    </div>
                \`;
            }
        }

        async function resetState() {
            if (!confirm('Are you sure you want to reset all data?')) return;
            try {
                const response = await fetch('/api/reset', { method: 'POST' });
                if (response.ok) {
                    document.getElementById('json-pre').innerText = '{}';
                    document.getElementById('ai-markdown').innerText = '';
                    document.getElementById('ai-rendered').innerHTML = \`
                        <div class="text-center py-12 text-slate-400">
                            <i class="fa-solid fa-brain text-5xl mb-3 block"></i>
                            <p>Click "Generate Gemini AI Insights" to analyze your parsed XML data.</p>
                        </div>
                    \`;
                    document.getElementById('fileInput').value = '';
                    document.getElementById('fileName').innerText = 'Drag & drop your XML file here, or click to browse';
                    document.getElementById('rawXmlText').value = '';
                    document.getElementById('customPrompt').value = '';
                    selectedFile = null;
                    updateStatus('idle', 'Awaiting XML Data...');
                    showToast('success', 'State reset successfully');
                }
            } catch (error) {
                showToast('error', 'Failed to reset state');
            }
        }

        function updateStatus(type, message) {
            const ping = document.getElementById('status-ping');
            const dot = document.getElementById('status-dot');
            const text = document.getElementById('status-text');
            const timestamp = document.getElementById('status-timestamp');

            timestamp.innerText = new Date().toLocaleTimeString();

            if (type === 'idle') {
                ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-slate-400 opacity-75";
                dot.className = "relative inline-flex rounded-full h-3.5 w-3.5 bg-slate-500";
                text.className = "font-medium text-sm text-slate-500";
            } else if (type === 'loading') {
                ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75";
                dot.className = "relative inline-flex rounded-full h-3.5 w-3.5 bg-amber-500";
                text.className = "font-medium text-sm text-amber-600";
            } else if (type === 'success') {
                ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75";
                dot.className = "relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500";
                text.className = "font-medium text-sm text-emerald-600";
            } else if (type === 'error') {
                ping.className = "animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75";
                dot.className = "relative inline-flex rounded-full h-3.5 w-3.5 bg-red-500";
                text.className = "font-medium text-sm text-red-600";
            }
            text.innerText = message;
        }

        function showToast(type, message) {
            const toast = document.getElementById('toast');
            const icon = document.getElementById('toast-icon');
            const msg = document.getElementById('toast-message');

            msg.innerText = message;
            if (type === 'success') {
                icon.innerHTML = '<i class="fa-solid fa-circle-check text-emerald-400"></i>';
            } else {
                icon.innerHTML = '<i class="fa-solid fa-circle-exclamation text-red-400"></i>';
            }

            toast.classList.remove('translate-y-20', 'opacity-0');
            toast.classList.add('translate-y-0', 'opacity-100');

            setTimeout(() => {
                toast.classList.remove('translate-y-0', 'opacity-100');
                toast.classList.add('translate-y-20', 'opacity-0');
            }, 3000);
        }

        function copyToClipboard(elementId) {
            const text = document.getElementById(elementId).innerText;
            navigator.clipboard.writeText(text).then(() => {
                showToast('success', 'Copied to clipboard!');
            }).catch(() => {
                showToast('error', 'Failed to copy');
            });
        }
    </script>
</body>
</html>
  `);
});

// Global Error Handler Middleware
app.use((err: any, req: Request, res: Response, next: NextFunction) => {
  console.error('Error:', err);
  res.status(err.status || 500).json({
    error: err.message || 'An unexpected internal server error occurred'
  });
});

// Start Server
app.listen(port, () => {
  console.log(`==================================================`);
  console.log(`🚀 Gemini XML Intelligence Server is running!`);
  console.log(`   Port: ${port}`);
  console.log(`   Dashboard: http://localhost:${port}`);
  console.log(`==================================================`);
});