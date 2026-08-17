import React, { useState, useCallback } from "react";
import {
  Key,
  Lock,
  Globe,
  Cpu,
  Terminal,
  Copy,
  Check,
  RefreshCw,
  Eye,
  EyeOff,
  Settings,
  Server,
  Activity,
  FileCode,
  Layers,
  Laptop,
  Network
} from "lucide-react";

// Interfaces
interface ClientConfig {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  authUrl: string;
  scopes: string;
  countryCode: string;
  businessCode: string;
  devicePrint: string;
  userIp: string;
  hardwareId: string;
  userAgent: string;
  platform: string;
}

const initialConfig: ClientConfig = {
  clientId: "cli_9f8a7b6c5d4e3f2g1h",
  clientSecret: "sec_m0n2b3v4c5x6z7l8k9j8h7g6f5d4s3a2",
  tokenUrl: "https://api.platform.com/oauth/v2/token",
  authUrl: "https://api.platform.com/oauth/v2/authorize",
  scopes: "read:profile write:orders offline_access",
  countryCode: "US",
  businessCode: "CORP_RETAIL_01",
  devicePrint: "fp_9a8b7c6d5e4f3g2h1i0j9k8l7m6n5o4p",
  userIp: "192.168.1.105",
  hardwareId: "HW-9081-ACBD-FFE2",
  userAgent: "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36",
  platform: "macOS-ARM64"
};

export default function OauthClientConfigurator() {
  const [config, setConfig] = useState<ClientConfig>(initialConfig);
  const [showSecret, setShowSecret] = useState(false);
  const [activeTab, setActiveTab] = useState<"basic" | "regional" | "device" | "preview">("basic");
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [isTesting, setIsTesting] = useState(false);
  const [testLogs, setTestLogs] = useState<string[]>([]);
  const [tokenResult, setTokenResult] = useState<any | null>(null);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setConfig((prev) => ({ ...prev, [name]: value }));
  };

  const triggerCopy = (text: string, fieldName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const generateRandomValue = (type: "devicePrint" | "hardwareId" | "clientSecret") => {
    const chars = "abcdef0123456789";
    let result = "";
    if (type === "clientSecret") {
      result = "sec_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    } else if (type === "devicePrint") {
      result = "fp_" + Array.from({ length: 32 }, () => chars[Math.floor(Math.random() * chars.length)]).join("");
    } else if (type === "hardwareId") {
      result = "HW-" + Array.from({ length: 4 }, () => Math.floor(1000 + Math.random() * 9000)).join("-");
    }
    setConfig((prev) => ({ ...prev, [type]: result }));
  };

  const runConnectionTest = async () => {
    setIsTesting(true);
    setTestLogs([]);
    setTokenResult(null);

    const logs = [
      "Initializing OAuth2 Client Credentials Grant Flow...",
      `Target Token Endpoint: ${config.tokenUrl}`,
      `Preparing headers with Client ID: ${config.clientId.substring(0, 8)}...`,
      `Injecting Regional Context: Country=${config.countryCode}, Business=${config.businessCode}`,
      `Injecting Device Metadata: IP=${config.userIp}, HardwareID=${config.hardwareId}`,
      "Signing request payload with Client Secret...",
      "Sending POST request to authorization server..."
    ];

    for (let i = 0; i < logs.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setTestLogs((prev) => [...prev, logs[i]]);
    }

    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    const mockToken = {
      access_token: "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6Im9hdXRoLWtleSJ9." + btoa(JSON.stringify({
        iss: "auth.platform.com",
        sub: config.clientId,
        aud: "api.platform.com",
        exp: Math.floor(Date.now() / 1000) + 3600,
        scope: config.scopes,
        country: config.countryCode,
        biz_code: config.businessCode,
        device_hash: config.devicePrint
      })).replace(/=/g, ""),
      token_type: "Bearer",
      expires_in: 3600,
      refresh_token: "rfr_8x9y0z1a2b3c4d5e6f7g8h9i",
      scope: config.scopes
    };

    setTokenResult(mockToken);
    setTestLogs((prev) => [...prev, "✔ Token successfully acquired!", "Status: 200 OK"]);
    setIsTesting(false);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-start items-center font-sans">
      <div className="w-full max-w-6xl">
        {/* Header */}
        <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 shadow-lg shadow-indigo-500/10">
                <Settings className="w-6 h-6 animate-spin-slow" />
              </div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                OAuth2 Client Configurator
              </h1>
            </div>
            <p className="text-slate-400 mt-2 text-sm md:text-base">
              Configure secure client credentials, regional parameters, and device fingerprinting metadata.
            </p>
          </div>
          <div className="flex items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              OpenAPI 3.0 Compliant
            </span>
          </div>
        </header>

        {/* Main Grid Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration Form */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-900/50 p-1 rounded-xl gap-1">
              <button
                onClick={() => setActiveTab("basic")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === "basic"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Key className="w-4 h-4" />
                Credentials
              </button>
              <button
                onClick={() => setActiveTab("regional")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === "regional"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Globe className="w-4 h-4" />
                Regional
              </button>
              <button
                onClick={() => setActiveTab("device")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === "device"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <Cpu className="w-4 h-4" />
                Device & IP
              </button>
              <button
                onClick={() => setActiveTab("preview")}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-xs md:text-sm font-medium transition-all ${
                  activeTab === "preview"
                    ? "bg-indigo-600 text-white shadow-md shadow-indigo-600/20"
                    : "text-slate-400 hover:text-slate-200 hover:bg-slate-800/50"
                }`}
              >
                <FileCode className="w-4 h-4" />
                JSON
              </button>
            </div>

            {/* Tab Contents */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl">
              
              {/* TAB 1: Basic Credentials */}
              {activeTab === "basic" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <Lock className="w-5 h-5 text-indigo-400" />
                    OAuth2 Client Credentials
                  </h3>
                  <p className="text-xs text-slate-400">
                    Configure standard OAuth2 client credentials and endpoints required for token exchange.
                  </p>

                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Client ID
                      </label>
                      <div className="relative">
                        <input
                          type="text"
                          name="clientId"
                          value={config.clientId}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-3 pr-10 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => triggerCopy(config.clientId, "clientId")}
                          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors"
                        >
                          {copiedField === "clientId" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <span>Client Secret</span>
                        <button
                          type="button"
                          onClick={() => generateRandomValue("clientSecret")}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Generate New
                        </button>
                      </label>
                      <div className="relative">
                        <input
                          type={showSecret ? "text" : "password"}
                          name="clientSecret"
                          value={config.clientSecret}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-3 pr-20 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                        />
                        <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => setShowSecret(!showSecret)}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                          <button
                            type="button"
                            onClick={() => triggerCopy(config.clientSecret, "clientSecret")}
                            className="text-slate-500 hover:text-slate-300 transition-colors"
                          >
                            {copiedField === "clientSecret" ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                          </button>
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Token Endpoint URL
                        </label>
                        <input
                          type="text"
                          name="tokenUrl"
                          value={config.tokenUrl}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Authorization Endpoint
                        </label>
                        <input
                          type="text"
                          name="authUrl"
                          value={config.authUrl}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Scopes (Space separated)
                      </label>
                      <input
                        type="text"
                        name="scopes"
                        value={config.scopes}
                        onChange={handleInputChange}
                        placeholder="e.g. read write offline_access"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 2: Regional Parameters */}
              {activeTab === "regional" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-indigo-400" />
                    Regional & Business Context
                  </h3>
                  <p className="text-xs text-slate-400">
                    Specify geographic and business unit parameters required by multi-tenant or localized OpenAPI gateways.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Country Code (ISO 3166-1 alpha-2)
                      </label>
                      <select
                        name="countryCode"
                        value={config.countryCode}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      >
                        <option value="US">United States (US)</option>
                        <option value="GB">United Kingdom (GB)</option>
                        <option value="DE">Germany (DE)</option>
                        <option value="FR">France (FR)</option>
                        <option value="JP">Japan (JP)</option>
                        <option value="BR">Brazil (BR)</option>
                        <option value="IN">India (IN)</option>
                        <option value="AU">Australia (AU)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Business Code
                      </label>
                      <input
                        type="text"
                        name="businessCode"
                        value={config.businessCode}
                        onChange={handleInputChange}
                        placeholder="e.g. CORP_RETAIL_01"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                      />
                    </div>
                  </div>

                  <div className="p-4 bg-indigo-950/20 border border-indigo-500/10 rounded-xl mt-4">
                    <h4 className="text-xs font-semibold text-indigo-400 uppercase tracking-wider mb-1">
                      Why are these required?
                    </h4>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Many enterprise APIs route traffic and apply data residency policies based on the country and business unit context passed during the initial OAuth2 token handshake.
                    </p>
                  </div>
                </div>
              )}

              {/* TAB 3: Device & Network Details */}
              {activeTab === "device" && (
                <div className="space-y-5">
                  <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-indigo-400" />
                    Device Fingerprint & Network Metadata
                  </h3>
                  <p className="text-xs text-slate-400">
                    Simulate advanced security parameters often required for high-security financial or enterprise API endpoints.
                  </p>

                  <div className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          User IP Address
                        </label>
                        <input
                          type="text"
                          name="userIp"
                          value={config.userIp}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Platform / OS
                        </label>
                        <input
                          type="text"
                          name="platform"
                          value={config.platform}
                          onChange={handleInputChange}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all"
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <span>Device Print (Fingerprint Hash)</span>
                        <button
                          type="button"
                          onClick={() => generateRandomValue("devicePrint")}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                      </label>
                      <input
                        type="text"
                        name="devicePrint"
                        value={config.devicePrint}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2 flex justify-between items-center">
                        <span>Hardware ID</span>
                        <button
                          type="button"
                          onClick={() => generateRandomValue("hardwareId")}
                          className="text-[10px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                        >
                          <RefreshCw className="w-3 h-3" /> Regenerate
                        </button>
                      </label>
                      <input
                        type="text"
                        name="hardwareId"
                        value={config.hardwareId}
                        onChange={handleInputChange}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        User Agent
                      </label>
                      <textarea
                        name="userAgent"
                        value={config.userAgent}
                        onChange={handleInputChange}
                        rows={2}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-200 focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-all font-mono resize-none"
                      />
                    </div>
                  </div>
                </div>
              )}

              {/* TAB 4: JSON Preview */}
              {activeTab === "preview" && (
                <div className="space-y-5">
                  <div className="flex justify-between items-center">
                    <h3 className="text-lg font-semibold text-slate-200 flex items-center gap-2">
                      <FileCode className="w-5 h-5 text-indigo-400" />
                      Configuration Payload
                    </h3>
                    <button
                      onClick={() => triggerCopy(JSON.stringify(config, null, 2), "jsonConfig")}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors"
                    >
                      {copiedField === "jsonConfig" ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy JSON
                        </>
                      )}
                    </button>
                  </div>
                  <p className="text-xs text-slate-400">
                    This JSON payload represents the complete client configuration mapped to OpenAPI parameters.
                  </p>

                  <div className="relative">
                    <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 overflow-x-auto text-xs text-indigo-300 font-mono max-h-80 leading-relaxed">
                      {JSON.stringify(config, null, 2)}
                    </pre>
                  </div>
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={runConnectionTest}
                disabled={isTesting}
                className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isTesting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    Requesting Token...
                  </>
                ) : (
                  <>
                    <Activity className="w-5 h-5" />
                    Test Connection & Get Token
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Live Terminal & Token Output */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Terminal Logs */}
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden shadow-xl flex flex-col h-[320px]">
              <div className="bg-slate-950 px-4 py-3 border-b border-slate-800/80 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  <span className="text-xs font-semibold text-slate-300 tracking-wider uppercase">
                    Execution Console
                  </span>
                </div>
                <div className="flex gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-rose-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500/80"></span>
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500/80"></span>
                </div>
              </div>
              <div className="p-4 flex-1 overflow-y-auto font-mono text-[11px] space-y-2 bg-slate-950/40">
                {testLogs.length === 0 ? (
                  <div className="text-slate-500 h-full flex flex-col items-center justify-center gap-2">
                    <Terminal className="w-8 h-8 opacity-30" />
                    <span>Console idle. Click "Test Connection" to run.</span>
                  </div>
                ) : (
                  testLogs.map((log, idx) => (
                    <div
                      key={idx}
                      className={`transition-all duration-300 ${
                        log.startsWith("✔")
                          ? "text-emerald-400 font-semibold"
                          : log.startsWith("Status:")
                          ? "text-indigo-400"
                          : "text-slate-300"
                      }`}
                    >
                      <span className="text-slate-600 mr-2">[{new Date().toLocaleTimeString()}]</span>
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>

            {/* Token Result Card */}
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-sm shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                  <Server className="w-4 h-4 text-indigo-400" />
                  OAuth2 Token Response
                </h3>
                {tokenResult && (
                  <button
                    onClick={() => triggerCopy(JSON.stringify(tokenResult, null, 2), "tokenResponse")}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedField === "tokenResponse" ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" /> Copied
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" /> Copy Response
                      </>
                    )}
                  </button>
                )}
              </div>

              {tokenResult ? (
                <div className="space-y-3">
                  <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                    <div className="text-xs text-emerald-400 font-semibold flex items-center gap-1.5">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                      Active Access Token Generated
                    </div>
                    <p className="text-[10px] text-slate-400 mt-1">
                      Expires in {tokenResult.expires_in} seconds (1 hour)
                    </p>
                  </div>

                  <div className="space-y-2">
                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Access Token (JWT)
                      </span>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-indigo-300 break-all max-h-24 overflow-y-auto">
                        {tokenResult.access_token}
                      </div>
                    </div>

                    <div>
                      <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wider block mb-1">
                        Refresh Token
                      </span>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 font-mono text-[10px] text-slate-300 break-all">
                        {tokenResult.refresh_token}
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-36 border border-dashed border-slate-800 rounded-xl flex flex-col items-center justify-center text-slate-500 text-xs gap-2">
                  <Layers className="w-6 h-6 opacity-30" />
                  <span>No active token session.</span>
                </div>
              )}
            </div>

            {/* OpenAPI Parameter Mapping Info */}
            <div className="bg-gradient-to-br from-indigo-950/30 to-slate-900/50 border border-indigo-500/10 rounded-2xl p-5 space-y-3">
              <h4 className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                <Network className="w-4 h-4" />
                OpenAPI Parameter Mapping
              </h4>
              <p className="text-xs text-slate-400 leading-relaxed">
                This configurator maps directly to standard OpenAPI security schemes and custom header parameters:
              </p>
              <ul className="text-[11px] text-slate-300 space-y-1.5 list-disc list-inside">
                <li><code className="text-indigo-300 font-mono">securitySchemes.OAuth2</code> (Client Credentials Flow)</li>
                <li><code className="text-indigo-300 font-mono">X-Country-Code</code> (Header parameter)</li>
                <li><code className="text-indigo-300 font-mono">X-Business-Code</code> (Header parameter)</li>
                <li><code className="text-indigo-300 font-mono">X-Device-Print</code> & <code className="text-indigo-300 font-mono">X-Hardware-ID</code> (Metadata headers)</li>
              </ul>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
}