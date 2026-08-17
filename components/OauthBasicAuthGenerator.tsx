"use client";

import React, { useState, useEffect } from "react";
import { 
  Key, 
  Lock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ArrowRight, 
  Terminal, 
  Cpu, 
  RefreshCw, 
  Info, 
  FileCode, 
  Sparkles,
  Layers
} from "lucide-react";

export default function OauthBasicAuthGenerator() {
  const [clientId, setClientId] = useState("");
  const [clientSecret, setClientSecret] = useState("");
  const [showSecret, setShowSecret] = useState(false);
  const [copiedType, setCopiedType] = useState<"header" | "base64" | "curl" | null>(null);
  const [activeTab, setActiveTab] = useState<"visualizer" | "developer">("visualizer");

  // Auto-populate with dummy credentials for instant value demonstration
  const handleLoadDemo = () => {
    setClientId("8f3b9a2c4e6d8f0a1b3c5e7f9a0b2c4d");
    setClientSecret("s3cr3t_0auth_t0k3n_g3n3rat0r_xyz123456789");
  };

  const handleClear = () => {
    setClientId("");
    setClientSecret("");
  };

  // Safe Base64 encoding supporting UTF-8
  const getBase64 = (str: string): string => {
    try {
      return btoa(encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) => {
        return String.fromCharCode(parseInt(p1, 16));
      }));
    } catch (e) {
      return "";
    }
  };

  const combinedString = clientId || clientSecret ? `${clientId}:${clientSecret}` : "";
  const base64Encoded = combinedString ? getBase64(combinedString) : "";
  const authHeader = base64Encoded ? `Basic ${base64Encoded}` : "";

  const curlCommand = `curl -X POST https://api.provider.com/oauth/token \\
  -H "Authorization: ${authHeader || "Basic <credentials>"}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials"`;

  const handleCopy = async (text: string, type: "header" | "base64" | "curl") => {
    if (!text) return;
    try {
      await navigator.clipboard.writeText(text);
      setCopiedType(type);
      setTimeout(() => setCopiedType(null), 2000);
    } catch (err) {
      console.error("Failed to copy text: ", err);
    }
  };

  // Helper to chunk string for binary visualization
  const stringToBinaryVisual = (str: string) => {
    if (!str) return [];
    return str.split("").slice(0, 12).map(char => ({
      char,
      binary: char.charCodeAt(0).toString(2).padStart(8, "0")
    }));
  };

  const binaryChunks = stringToBinaryVisual(combinedString);

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-8 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden relative">
      {/* Decorative Background Gradients */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* Header Section */}
      <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <span className="px-2.5 py-1 text-xs font-semibold tracking-wider text-blue-400 bg-blue-500/10 rounded-full border border-blue-500/20 uppercase">
              OAuth 2.0 Utility
            </span>
            <span className="flex items-center gap-1 px-2.5 py-1 text-xs font-semibold tracking-wider text-emerald-400 bg-emerald-500/10 rounded-full border border-emerald-500/20">
              <Sparkles className="w-3 h-3" /> Production Ready
            </span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            OAuth Basic Auth Header Generator
          </h1>
          <p className="text-slate-400 mt-1 text-sm max-w-2xl">
            Securely encode your Client ID and Client Secret into an RFC 7617 compliant Base64 Authorization header. Visualizes the step-by-step encoding pipeline locally in your browser.
          </p>
        </div>
        <div className="flex gap-2 w-full md:w-auto">
          <button
            onClick={handleLoadDemo}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 hover:border-slate-700 rounded-xl transition-all duration-200"
          >
            <Cpu className="w-4 h-4 text-blue-400" />
            Load Demo Data
          </button>
          {(clientId || clientSecret) && (
            <button
              onClick={handleClear}
              className="flex items-center justify-center p-2.5 text-sm font-medium text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-rose-950/20 border border-slate-800 hover:border-rose-900/30 rounded-xl transition-all duration-200"
              title="Clear inputs"
            >
              <RefreshCw className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 relative z-10">
        
        {/* Left Column: Inputs & Configuration */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Key className="w-5 h-5 text-blue-400" />
              Credentials Input
            </h2>
            
            <div className="space-y-4">
              {/* Client ID Input */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Client ID
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <span className="text-xs font-mono">ID</span>
                  </div>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    placeholder="e.g. 8f3b9a2c4e6d8f0a1b3c5e7f9a0b2c4d"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-200 placeholder-slate-600 text-sm font-mono transition-all duration-200"
                  />
                </div>
              </div>

              {/* Client Secret Input */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Client Secret
                  </label>
                  <button
                    type="button"
                    onClick={() => setShowSecret(!showSecret)}
                    className="text-xs text-slate-400 hover:text-slate-200 flex items-center gap-1 transition-colors"
                  >
                    {showSecret ? (
                      <>
                        <EyeOff className="w-3.5 h-3.5" /> Hide Secret
                      </>
                    ) : (
                      <>
                        <Eye className="w-3.5 h-3.5" /> Show Secret
                      </>
                    )}
                  </button>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                  <input
                    type={showSecret ? "text" : "password"}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    placeholder="e.g. s3cr3t_0auth_t0k3n_g3n3rat0r_xyz"
                    className="w-full pl-10 pr-4 py-3 bg-slate-950 border border-slate-800 focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-200 placeholder-slate-600 text-sm font-mono transition-all duration-200"
                  />
                </div>
              </div>
            </div>

            {/* Security Notice */}
            <div className="mt-6 p-3.5 bg-blue-500/5 border border-blue-500/10 rounded-xl flex items-start gap-3">
              <Info className="w-4 h-4 text-blue-400 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-400 leading-relaxed">
                <strong className="text-slate-300">Local Execution:</strong> Your credentials never leave your browser. All encoding processes are executed client-side using standard JavaScript APIs.
              </p>
            </div>
          </div>

          {/* Quick Reference Card */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-6">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              RFC 7617 Specifications
            </h3>
            <ul className="space-y-2.5 text-xs text-slate-400">
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>Credentials are joined with a single colon (<code className="text-indigo-300 font-mono">:</code>) character.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>The combined string is encoded using the Base64 character set.</span>
              </li>
              <li className="flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 shrink-0" />
                <span>The scheme identifier is <code className="text-indigo-300 font-mono">Basic</code> (case-insensitive, but conventionally capitalized).</span>
              </li>
            </ul>
          </div>
        </div>

        {/* Right Column: Visualizer & Output */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Tab Selection */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab("visualizer")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "visualizer"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Sparkles className="w-4 h-4" />
              Step-by-Step Visualizer
            </button>
            <button
              onClick={() => setActiveTab("developer")}
              className={`pb-3 px-4 text-sm font-medium border-b-2 transition-all duration-200 flex items-center gap-2 ${
                activeTab === "developer"
                  ? "border-blue-500 text-blue-400"
                  : "border-transparent text-slate-400 hover:text-slate-200"
              }`}
            >
              <Terminal className="w-4 h-4" />
              Developer Integration
            </button>
          </div>

          {/* Tab Content: Visualizer */}
          {activeTab === "visualizer" && (
            <div className="space-y-6">
              
              {/* Step 1: Concatenation */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  Step 1: Concatenate
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Combine Credentials with Colon
                </h3>
                
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-x-auto whitespace-nowrap">
                  {clientId || clientSecret ? (
                    <div className="flex items-center gap-1">
                      <span className="text-blue-400" title="Client ID">{clientId || "<client_id>"}</span>
                      <span className="text-rose-400 font-bold px-1" title="Separator">:</span>
                      <span className="text-emerald-400" title="Client Secret">
                        {showSecret ? (clientSecret || "<client_secret>") : "•".repeat(Math.min(clientSecret.length || 12, 24))}
                      </span>
                    </div>
                  ) : (
                    <span className="text-slate-600 italic">Enter credentials on the left to visualize...</span>
                  )}
                </div>
                <div className="mt-2 text-[11px] text-slate-500">
                  Format: <code className="text-slate-400 font-mono">[client_id]:[client_secret]</code>
                </div>
              </div>

              {/* Step 2: Binary Representation (Visual Polish) */}
              {combinedString && (
                <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                    Step 2: Binary Stream
                  </div>
                  <h3 className="text-sm font-semibold text-slate-300 mb-3">
                    UTF-8 Byte Mapping (First 12 chars)
                  </h3>
                  <div className="grid grid-cols-4 sm:grid-cols-6 md:grid-cols-12 gap-2">
                    {binaryChunks.map((item, idx) => (
                      <div key={idx} className="bg-slate-950 border border-slate-800/80 rounded-lg p-2 text-center">
                        <div className="text-xs font-bold text-blue-400 font-mono">{item.char === ":" ? ":" : item.char}</div>
                        <div className="text-[8px] text-slate-500 font-mono mt-1 tracking-tighter">{item.binary}</div>
                      </div>
                    ))}
                    {combinedString.length > 12 && (
                      <div className="bg-slate-950/40 border border-dashed border-slate-800 rounded-lg p-2 flex items-center justify-center text-[10px] text-slate-600 font-mono">
                        +{combinedString.length - 12} more
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Step 3: Base64 Encoding */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-[10px] font-mono text-slate-600 uppercase tracking-widest">
                  Step 3: Base64 Encode
                </div>
                <h3 className="text-sm font-semibold text-slate-300 mb-3">
                  Base64 Output String
                </h3>
                
                <div className="relative">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 pr-12 font-mono text-xs break-all min-h-[50px] flex items-center">
                    {base64Encoded ? (
                      <span className="text-indigo-400">{base64Encoded}</span>
                    ) : (
                      <span className="text-slate-600 italic">Awaiting credentials...</span>
                    )}
                  </div>
                  {base64Encoded && (
                    <button
                      onClick={() => handleCopy(base64Encoded, "base64")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
                      title="Copy Base64 string"
                    >
                      {copiedType === "base64" ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

              {/* Step 4: Final Authorization Header */}
              <div className="bg-gradient-to-br from-slate-900 to-indigo-950/30 border border-indigo-500/20 rounded-2xl p-6 relative overflow-hidden">
                <div className="absolute top-3 right-4 text-[10px] font-mono text-indigo-400 uppercase tracking-widest font-semibold">
                  Final Output
                </div>
                <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-indigo-400" />
                  HTTP Authorization Header
                </h3>
                
                <div className="relative">
                  <div className="bg-slate-950/90 border border-indigo-500/20 rounded-xl p-4 pr-12 font-mono text-xs break-all min-h-[50px] flex items-center">
                    {authHeader ? (
                      <div>
                        <span className="text-emerald-400 font-semibold">Authorization:</span>{" "}
                        <span className="text-slate-200">{authHeader}</span>
                      </div>
                    ) : (
                      <span className="text-slate-600 italic">Awaiting credentials...</span>
                    )}
                  </div>
                  {authHeader && (
                    <button
                      onClick={() => handleCopy(`Authorization: ${authHeader}`, "header")}
                      className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-slate-400 hover:text-slate-200 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
                      title="Copy full header"
                    >
                      {copiedType === "header" ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  )}
                </div>
              </div>

            </div>
          )}

          {/* Tab Content: Developer Integration */}
          {activeTab === "developer" && (
            <div className="space-y-6">
              
              {/* cURL Command Generator */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 relative overflow-hidden">
                <div className="flex justify-between items-center mb-3">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    cURL Request Template
                  </h3>
                  {authHeader && (
                    <button
                      onClick={() => handleCopy(curlCommand, "curl")}
                      className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 rounded-lg transition-all"
                    >
                      {copiedType === "curl" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy Code
                        </>
                      )}
                    </button>
                  )}
                </div>
                
                <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 overflow-x-auto leading-relaxed">
                  {curlCommand}
                </pre>
              </div>

              {/* Code Snippets */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6">
                <h3 className="text-sm font-semibold text-slate-300 mb-4">
                  Implementation Snippets
                </h3>
                
                <div className="space-y-4">
                  {/* Node.js */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1.5 font-mono">Node.js (Fetch API)</div>
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-slate-400 overflow-x-auto">
{`const clientId = "${clientId || "YOUR_CLIENT_ID"}";
const clientSecret = "${clientSecret || "YOUR_CLIENT_SECRET"}";
const credentials = Buffer.from(\`\${clientId}:\${clientSecret}\`).toString('base64');

const response = await fetch('https://api.provider.com/oauth/token', {
  method: 'POST',
  headers: {
    'Authorization': \`Basic \${credentials}\`,
    'Content-Type': 'application/x-www-form-urlencoded'
  },
  body: new URLSearchParams({ grant_type: 'client_credentials' })
});`}
                    </pre>
                  </div>

                  {/* Python */}
                  <div>
                    <div className="text-xs font-semibold text-slate-400 mb-1.5 font-mono">Python (Requests)</div>
                    <pre className="bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-[11px] text-slate-400 overflow-x-auto">
{`import requests

client_id = "${clientId || "YOUR_CLIENT_ID"}"
client_secret = "${clientSecret || "YOUR_CLIENT_SECRET"}"

# Requests handles Basic Auth automatically using the 'auth' parameter
response = requests.post(
    "https://api.provider.com/oauth/token",
    auth=(client_id, client_secret),
    data={"grant_type": "client_credentials"}
)`}
                    </pre>
                  </div>
                </div>
              </div>

            </div>
          )}

        </div>
      </div>

      {/* Footer Info */}
      <div className="mt-8 pt-6 border-t border-slate-900 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Fully compliant with RFC 6749 (OAuth 2.0 Framework)</span>
        </div>
        <div>
          Designed for secure, local-first developer workflows.
        </div>
      </div>
    </div>
  );
}