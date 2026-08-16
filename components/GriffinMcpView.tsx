import React, { useState } from 'react';
import { Copy, Check, Terminal, Key, FileCode, Info, Cpu, ExternalLink, ShieldAlert, Settings, Layers, HelpCircle } from 'lucide-react';

export default function GriffinMcpView() {
  const [apiKey, setApiKey] = useState('');
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'macos' | 'windows'>('macos');

  const mcpConfig = {
    mcpServers: {
      griffin: {
        command: "npx",
        args: [
          "-y",
          "@griffin-sh/mcp-server"
        ],
        env: {
          GRIFFIN_API_KEY: apiKey || "YOUR_GRIFFIN_API_KEY"
        }
      }
    }
  };

  const configString = JSON.stringify(mcpConfig, null, 2);

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(configString);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="max-w-6xl mx-auto px-4 py-8 text-slate-800 dark:text-slate-100">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-200 dark:border-slate-800 pb-6 mb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300 text-xs font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
              Beta
            </span>
            <span className="text-xs text-slate-500 dark:text-slate-400 flex items-center gap-1">
              <Cpu className="w-3.5 h-3.5" /> Model Context Protocol
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 dark:text-white">
            Griffin MCP Server
          </h1>
          <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
            Connect your Claude Desktop client directly to Griffin's financial, compliance, and banking APIs. Query bank accounts, check transaction statuses, and run compliance workflows using natural language.
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-3">
          <a
            href="https://docs.griffin.com"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-slate-700 bg-white border border-slate-300 rounded-lg hover:bg-slate-50 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700 dark:hover:bg-slate-700 transition-colors"
          >
            Griffin Docs <ExternalLink className="w-4 h-4" />
          </a>
          <a
            href="https://modelcontextprotocol.io"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
          >
            About MCP <ExternalLink className="w-4 h-4" />
          </a>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Documentation & Guides */}
        <div className="lg:col-span-7 space-y-8">
          {/* Prerequisites */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <Layers className="w-5 h-5 text-blue-500" /> Prerequisites
            </h2>
            <ul className="space-y-3 text-sm text-slate-600 dark:text-slate-400">
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">1</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Claude Desktop App</strong>
                  <p className="mt-0.5">Ensure you have the official Claude Desktop client installed on your machine (macOS or Windows).</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">2</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Node.js Installed</strong>
                  <p className="mt-0.5">The server runs via <code className="px-1.5 py-0.5 bg-slate-100 dark:bg-slate-800 rounded text-xs font-mono">npx</code>. Node.js v18 or higher is required.</p>
                </div>
              </li>
              <li className="flex items-start gap-3">
                <span className="flex-shrink-0 w-5 h-5 rounded-full bg-blue-50 dark:bg-blue-950/50 text-blue-600 dark:text-blue-400 flex items-center justify-center text-xs font-bold mt-0.5">3</span>
                <div>
                  <strong className="text-slate-900 dark:text-white">Griffin API Key</strong>
                  <p className="mt-0.5">An active API key from your Griffin dashboard (sandbox or live environment).</p>
                </div>
              </li>
            </ul>
          </section>

          {/* Configuration Paths */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2 text-slate-900 dark:text-white">
                <Settings className="w-5 h-5 text-blue-500" /> Configuration Paths
              </h2>
              <div className="flex bg-slate-100 dark:bg-slate-800 p-1 rounded-lg text-xs font-medium">
                <button
                  onClick={() => setActiveTab('macos')}
                  className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'macos' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  macOS
                </button>
                <button
                  onClick={() => setActiveTab('windows')}
                  className={`px-3 py-1.5 rounded-md transition-all ${activeTab === 'windows' ? 'bg-white dark:bg-slate-700 text-slate-900 dark:text-white shadow-sm' : 'text-slate-500 hover:text-slate-900 dark:hover:text-white'}`}
                >
                  Windows
                </button>
              </div>
            </div>

            <p className="text-sm text-slate-600 dark:text-slate-400 mb-4">
              To configure Claude Desktop to use the Griffin MCP server, you need to add the configuration to your local configuration file located at:
            </p>

            <div className="bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-lg p-3.5 font-mono text-xs flex items-center justify-between">
              <span className="truncate text-blue-600 dark:text-blue-400">
                {activeTab === 'macos' 
                  ? '~/Library/Application Support/Claude/claude_desktop_config.json' 
                  : '%APPDATA%\\Claude\\claude_desktop_config.json'
                }
              </span>
              <button
                onClick={() => {
                  const path = activeTab === 'macos' 
                    ? '~/Library/Application Support/Claude/claude_desktop_config.json' 
                    : '%APPDATA%\\Claude\\claude_desktop_config.json';
                  navigator.clipboard.writeText(path);
                }}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 p-1 rounded transition-colors"
                title="Copy path"
              >
                <Copy className="w-4 h-4" />
              </button>
            </div>

            <div className="mt-4 flex items-start gap-2.5 text-xs text-amber-600 dark:text-amber-400 bg-amber-50 dark:bg-amber-950/30 border border-amber-200/50 dark:border-amber-900/30 p-3 rounded-lg">
              <ShieldAlert className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <p>
                If the file or directory does not exist, you can create them manually. Make sure to back up any existing configurations before editing.
              </p>
            </div>
          </section>

          {/* How to Use */}
          <section className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2 text-slate-900 dark:text-white">
              <HelpCircle className="w-5 h-5 text-blue-500" /> How to Use
            </h2>
            <div className="space-y-4 text-sm text-slate-600 dark:text-slate-400">
              <p>
                Once configured and Claude Desktop is restarted, you will see a new hammer icon in the input box indicating that MCP tools are active.
              </p>
              <div className="border-l-2 border-blue-500 pl-4 py-1 space-y-2">
                <p className="italic">"Check the status of my latest transaction on Griffin."</p>
                <p className="italic">"List all active bank accounts in our sandbox environment."</p>
                <p className="italic">"Run a compliance check for a new customer named Jane Doe."</p>
              </div>
            </div>
          </section>
        </div>

        {/* Right Column: Interactive Config Generator */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-white dark:bg-slate-900 border border-slate-200 dark:border-slate-800 rounded-xl p-6 shadow-sm sticky top-6">
            <h2 className="text-lg font-semibold mb-2 flex items-center gap-2 text-slate-900 dark:text-white">
              <Terminal className="w-5 h-5 text-blue-500" /> Config Generator
            </h2>
            <p className="text-xs text-slate-500 dark:text-slate-400 mb-6">
              Input your API key to generate a ready-to-use configuration block for your Claude Desktop client.
            </p>

            {/* API Key Input */}
            <div className="space-y-2 mb-6">
              <label htmlFor="api-key" className="block text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Griffin API Key
              </label>
              <div className="relative rounded-md shadow-sm">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <Key className="h-4 w-4 text-slate-400" aria-hidden="true" />
                </div>
                <input
                  type="password"
                  name="api-key"
                  id="api-key"
                  className="block w-full pl-10 pr-3 py-2.5 text-sm border border-slate-300 dark:border-slate-700 rounded-lg bg-slate-50 dark:bg-slate-950 text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
                  placeholder="g_sandbox_..."
                  value={apiKey}
                  onChange={(e) => setApiKey(e.target.value)}
                />
              </div>
              <p className="text-[11px] text-slate-400 dark:text-slate-500 flex items-center gap-1">
                <Info className="w-3 h-3" /> Your key is processed entirely in your browser and never sent to our servers.
              </p>
            </div>

            {/* JSON Output */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 flex items-center gap-1.5">
                  <FileCode className="w-3.5 h-3.5" /> Configuration JSON
                </span>
                <button
                  onClick={handleCopy}
                  className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded text-xs font-medium transition-all ${
                    copied 
                      ? 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300' 
                      : 'bg-slate-100 hover:bg-slate-200 text-slate-700 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-300'
                  }`}
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5" /> Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" /> Copy Config
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 text-slate-200 p-4 rounded-lg overflow-x-auto font-mono text-xs leading-relaxed border border-slate-800 max-h-[320px]">
                  <code>{configString}</code>
                </pre>
                <div className="absolute bottom-2 right-2 pointer-events-none opacity-10 text-white font-bold text-xs uppercase tracking-widest">
                  JSON
                </div>
              </div>
            </div>

            {/* Next Steps */}
            <div className="mt-6 pt-6 border-t border-slate-200 dark:border-slate-800">
              <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400 mb-3">
                Next Steps
              </h4>
              <ol className="space-y-2.5 text-xs text-slate-600 dark:text-slate-400">
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-500">1.</span>
                  <span>Copy the JSON block above.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-500">2.</span>
                  <span>Paste it into your <code className="px-1 py-0.5 bg-slate-100 dark:bg-slate-800 rounded font-mono">claude_desktop_config.json</code> file.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="font-bold text-blue-500">3.</span>
                  <span>Completely restart the Claude Desktop application.</span>
                </li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}