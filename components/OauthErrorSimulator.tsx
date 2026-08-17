import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  ShieldAlert, 
  XCircle, 
  RefreshCw, 
  Copy, 
  Check, 
  Terminal, 
  HelpCircle, 
  Play, 
  Clock, 
  Layers, 
  FileCode, 
  Server, 
  Info,
  AlertCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export type ErrorSeverity = 'warn' | 'invalid' | 'error' | 'fatal';
export type ErrorLocation = 'query' | 'body' | 'header' | 'redirect_uri' | 'server';

export interface OauthErrorPreset {
  id: string;
  status: number;
  statusText: string;
  severity: ErrorSeverity;
  code: string;
  location: ErrorLocation;
  parameter?: string;
  description: string;
  mitigation: string;
  documentationUrl: string;
}

interface HistoryLogEntry extends OauthErrorPreset {
  timestamp: string;
  customized?: boolean;
}

// --- PRESETS DATA ---
const ERROR_PRESETS: OauthErrorPreset[] = [
  {
    id: 'invalid_request_uri',
    status: 400,
    statusText: 'Bad Request',
    severity: 'invalid',
    code: 'invalid_request',
    location: 'query',
    parameter: 'redirect_uri',
    description: 'The request query parameter "redirect_uri" is missing, invalid, or does not match the registered redirect URIs for this client.',
    mitigation: 'Verify that the redirect URI matches exactly with the one configured in your developer dashboard, including trailing slashes and protocols.',
    documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc6749#section-5.2'
  },
  {
    id: 'invalid_client_credentials',
    status: 401,
    statusText: 'Unauthorized',
    severity: 'error',
    code: 'invalid_client',
    location: 'header',
    parameter: 'Authorization',
    description: 'Client authentication failed. Common causes include invalid client secrets, incorrect Authorization header format, or an unknown client ID.',
    mitigation: 'Ensure the Authorization header uses the "Basic" scheme with base64-encoded client_id:client_secret, or verify your client credentials.',
    documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc6749#section-5.2'
  },
  {
    id: 'unauthorized_grant',
    status: 403,
    statusText: 'Forbidden',
    severity: 'warn',
    code: 'unauthorized_client',
    location: 'body',
    parameter: 'grant_type',
    description: 'The authenticated client is not authorized to use the requested authorization grant type (e.g., client credentials, authorization code).',
    mitigation: 'Check your application settings in the developer portal to ensure the requested grant type is enabled for this client.',
    documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc6749#section-5.2'
  },
  {
    id: 'invalid_grant_expired',
    status: 400,
    statusText: 'Bad Request',
    severity: 'invalid',
    code: 'invalid_grant',
    location: 'body',
    parameter: 'code',
    description: 'The provided authorization grant (e.g., authorization code, resource owner credentials) or refresh token is invalid, expired, or revoked.',
    mitigation: 'Request a new authorization code or prompt the user to re-authenticate. Remember that authorization codes are single-use and short-lived.',
    documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc6749#section-5.2'
  },
  {
    id: 'invalid_scope_requested',
    status: 400,
    statusText: 'Bad Request',
    severity: 'warn',
    code: 'invalid_scope',
    location: 'query',
    parameter: 'scope',
    description: 'The requested scope is invalid, unknown, malformed, or exceeds the scope granted by the resource owner or allowed by client configuration.',
    mitigation: 'Verify that the scopes requested are spelled correctly and match the scopes configured/allowed for your OAuth application.',
    documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc6749#section-5.2'
  },
  {
    id: 'server_error_fatal',
    status: 500,
    statusText: 'Internal Server Error',
    severity: 'fatal',
    code: 'server_error',
    location: 'server',
    description: 'The authorization server encountered an unexpected condition that prevented it from fulfilling the request.',
    mitigation: 'This is an internal server issue. Please check the OAuth provider status page or retry the request later with exponential backoff.',
    documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc6749#section-5.2'
  },
  {
    id: 'temporarily_unavailable',
    status: 503,
    statusText: 'Service Unavailable',
    severity: 'fatal',
    code: 'temporarily_unavailable',
    location: 'server',
    description: 'The authorization server is currently unable to handle the request due to a temporary overloading or maintenance of the server.',
    mitigation: 'Retry the request after a short delay. If provided, respect the "Retry-After" HTTP response header.',
    documentationUrl: 'https://datatracker.ietf.org/doc/html/rfc6749#section-5.2'
  }
];

export default function OauthErrorSimulator() {
  // --- STATE ---
  const [selectedPresetId, setSelectedPresetId] = useState<string>(ERROR_PRESETS[0].id);
  const [activeTab, setActiveTab] = useState<'visual' | 'json' | 'http'>('visual');
  const [copied, setCopied] = useState<boolean>(false);
  const [history, setHistory] = useState<HistoryLogEntry[]>([
    {
      ...ERROR_PRESETS[0],
      timestamp: new Date(Date.now() - 60000 * 5).toLocaleTimeString()
    }
  ]);

  // Custom overrides
  const [customStatus, setCustomStatus] = useState<number>(ERROR_PRESETS[0].status);
  const [customSeverity, setCustomSeverity] = useState<ErrorSeverity>(ERROR_PRESETS[0].severity);
  const [customCode, setCustomCode] = useState<string>(ERROR_PRESETS[0].code);
  const [customLocation, setCustomLocation] = useState<ErrorLocation>(ERROR_PRESETS[0].location);
  const [customParam, setCustomParam] = useState<string>(ERROR_PRESETS[0].parameter || '');
  const [customDesc, setCustomDesc] = useState<string>(ERROR_PRESETS[0].description);
  const [customMitigation, setCustomMitigation] = useState<string>(ERROR_PRESETS[0].mitigation);

  // --- HANDLERS ---
  const handlePresetChange = (presetId: string) => {
    const preset = ERROR_PRESETS.find(p => p.id === presetId);
    if (preset) {
      setSelectedPresetId(presetId);
      setCustomStatus(preset.status);
      setCustomSeverity(preset.severity);
      setCustomCode(preset.code);
      setCustomLocation(preset.location);
      setCustomParam(preset.parameter || '');
      setCustomDesc(preset.description);
      setCustomMitigation(preset.mitigation);
    }
  };

  const currentError = useMemo(() => {
    const preset = ERROR_PRESETS.find(p => p.id === selectedPresetId);
    return {
      id: selectedPresetId,
      status: customStatus,
      statusText: customStatus === 400 ? 'Bad Request' : 
                  customStatus === 401 ? 'Unauthorized' : 
                  customStatus === 403 ? 'Forbidden' : 
                  customStatus === 500 ? 'Internal Server Error' : 
                  customStatus === 503 ? 'Service Unavailable' : 'Error',
      severity: customSeverity,
      code: customCode,
      location: customLocation,
      parameter: customParam || undefined,
      description: customDesc,
      mitigation: customMitigation,
      documentationUrl: preset?.documentationUrl || 'https://datatracker.ietf.org/doc/html/rfc6749'
    };
  }, [selectedPresetId, customStatus, customSeverity, customCode, customLocation, customParam, customDesc, customMitigation]);

  const triggerSimulation = () => {
    const newLog: HistoryLogEntry = {
      ...currentError,
      timestamp: new Date().toLocaleTimeString(),
      customized: currentError.description !== ERROR_PRESETS.find(p => p.id === selectedPresetId)?.description
    };
    setHistory(prev => [newLog, ...prev].slice(0, 10)); // Keep last 10
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // --- HELPERS ---
  const getSeverityStyles = (severity: ErrorSeverity) => {
    switch (severity) {
      case 'warn':
        return {
          bg: 'bg-amber-500/10 border-amber-500/30 text-amber-400',
          badge: 'bg-amber-500/20 text-amber-300 border-amber-500/40',
          icon: <AlertTriangle className="w-5 h-5 text-amber-400" />,
          glow: 'shadow-[0_0_15px_rgba(245,158,11,0.15)]'
        };
      case 'invalid':
        return {
          bg: 'bg-blue-500/10 border-blue-500/30 text-blue-400',
          badge: 'bg-blue-500/20 text-blue-300 border-blue-500/40',
          icon: <Info className="w-5 h-5 text-blue-400" />,
          glow: 'shadow-[0_0_15px_rgba(59,130,246,0.15)]'
        };
      case 'error':
        return {
          bg: 'bg-rose-500/10 border-rose-500/30 text-rose-400',
          badge: 'bg-rose-500/20 text-rose-300 border-rose-500/40',
          icon: <ShieldAlert className="w-5 h-5 text-rose-400" />,
          glow: 'shadow-[0_0_15px_rgba(244,63,94,0.15)]'
        };
      case 'fatal':
        return {
          bg: 'bg-red-600/15 border-red-500/40 text-red-400',
          badge: 'bg-red-500/30 text-red-200 border-red-500/50 animate-pulse',
          icon: <XCircle className="w-5 h-5 text-red-400" />,
          glow: 'shadow-[0_0_20px_rgba(239,68,68,0.25)]'
        };
    }
  };

  const jsonPayload = JSON.stringify({
    error: currentError.code,
    error_description: currentError.description,
    error_uri: currentError.documentationUrl,
    meta: {
      status_code: currentError.status,
      severity: currentError.severity,
      location: currentError.location,
      ...(currentError.parameter && { parameter: currentError.parameter }),
      timestamp: new Date().toISOString()
    }
  }, null, 2);

  const rawHttpResponse = `HTTP/1.1 ${currentError.status} ${currentError.statusText}
Content-Type: application/json;charset=UTF-8
Cache-Control: no-store
Pragma: no-cache

${jsonPayload}`;

  const severityStyles = getSeverityStyles(currentError.severity);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 flex flex-col justify-start items-center font-sans selection:bg-indigo-500/30">
      {/* Header */}
      <div className="w-full max-w-7xl mb-8 text-center md:text-left">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-indigo-500/10 border border-indigo-500/30 text-indigo-300 text-xs font-medium mb-3">
          <Terminal className="w-3.5 h-3.5" />
          OAuth 2.0 Debugging Suite
        </div>
        <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
          OAuth Error Simulator
        </h1>
        <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
          Simulate, inspect, and debug standard OAuth 2.0 error responses. Perfect for testing client-side error handling, middleware validation, and edge cases.
        </p>
      </div>

      {/* Main Grid */}
      <div className="w-full max-w-7xl grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Left Column: Controls & Customization */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Preset Selector */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <label className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Select Error Preset
              </label>
              <span className="text-xs text-slate-500">RFC 6749 Compliant</span>
            </div>
            <div className="relative">
              <select
                value={selectedPresetId}
                onChange={(e) => handlePresetChange(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all appearance-none cursor-pointer"
              >
                {ERROR_PRESETS.map((preset) => (
                  <option key={preset.id} value={preset.id}>
                    [{preset.status}] {preset.code} ({preset.severity})
                  </option>
                ))}
              </select>
              <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-400">
                <svg className="fill-current h-4 w-4" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 20 20">
                  <path d="M9.293 12.95l.707.707L15.657 8l-1.414-1.414L10 10.828 5.757 6.586 4.343 8z" />
                </svg>
              </div>
            </div>
          </div>

          {/* Customizer Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2 pb-2 border-b border-slate-800">
              <RefreshCw className="w-4 h-4 text-indigo-400" />
              Customize Parameters
            </h3>

            {/* Status & Severity */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">HTTP Status</label>
                <select
                  value={customStatus}
                  onChange={(e) => setCustomStatus(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value={400}>400 Bad Request</option>
                  <option value={401}>401 Unauthorized</option>
                  <option value={403}>403 Forbidden</option>
                  <option value={500}>500 Internal Server Error</option>
                  <option value={503}>503 Service Unavailable</option>
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Severity</label>
                <select
                  value={customSeverity}
                  onChange={(e) => setCustomSeverity(e.target.value as ErrorSeverity)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="invalid">Invalid (Input)</option>
                  <option value="warn">Warn (Config)</option>
                  <option value="error">Error (Auth)</option>
                  <option value="fatal">Fatal (Server)</option>
                </select>
              </div>
            </div>

            {/* Error Code & Location */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Error Code</label>
                <input
                  type="text"
                  value={customCode}
                  onChange={(e) => setCustomCode(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Error Location</label>
                <select
                  value={customLocation}
                  onChange={(e) => setCustomLocation(e.target.value as ErrorLocation)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                >
                  <option value="query">Query Parameter</option>
                  <option value="body">Request Body</option>
                  <option value="header">HTTP Header</option>
                  <option value="redirect_uri">Redirect URI</option>
                  <option value="server">Server Internal</option>
                </select>
              </div>
            </div>

            {/* Parameter Target */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Target Parameter (Optional)</label>
              <input
                type="text"
                value={customParam}
                onChange={(e) => setCustomParam(e.target.value)}
                placeholder="e.g. client_id, scope, redirect_uri"
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
              />
            </div>

            {/* Description */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Error Description</label>
              <textarea
                rows={3}
                value={customDesc}
                onChange={(e) => setCustomDesc(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Mitigation */}
            <div>
              <label className="block text-xs text-slate-400 mb-1.5">Mitigation Strategy</label>
              <textarea
                rows={2}
                value={customMitigation}
                onChange={(e) => setCustomMitigation(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500 resize-none"
              />
            </div>

            {/* Trigger Button */}
            <button
              onClick={triggerSimulation}
              className="w-full mt-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 text-white font-medium text-sm py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
            >
              <Play className="w-4 h-4 fill-current" />
              Simulate & Log Error
            </button>
          </div>

        </div>

        {/* Right Column: Visualizer & Output */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Output Tabs */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden backdrop-blur-md shadow-xl">
            <div className="flex border-b border-slate-800 bg-slate-950/50 p-2 justify-between items-center">
              <div className="flex gap-1">
                <button
                  onClick={() => setActiveTab('visual')}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'visual' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Visual Alert
                </button>
                <button
                  onClick={() => setActiveTab('json')}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'json' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  JSON Payload
                </button>
                <button
                  onClick={() => setActiveTab('http')}
                  className={`px-4 py-2 rounded-lg text-xs font-medium transition-all ${
                    activeTab === 'http' 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  HTTP Raw
                </button>
              </div>

              {/* Copy Button */}
              <button
                onClick={() => copyToClipboard(activeTab === 'json' ? jsonPayload : activeTab === 'http' ? rawHttpResponse : JSON.stringify(currentError, null, 2))}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-all"
                title="Copy to clipboard"
              >
                {copied ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Tab Content */}
            <div className="p-6 min-h-[380px] flex flex-col justify-between">
              
              {/* VISUAL TAB */}
              {activeTab === 'visual' && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Main Alert Banner */}
                  <div className={`border rounded-xl p-5 flex gap-4 items-start transition-all ${severityStyles.bg} ${severityStyles.glow}`}>
                    <div className="mt-0.5">{severityStyles.icon}</div>
                    <div className="space-y-1.5 flex-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-bold text-sm tracking-wide uppercase">
                          {currentError.code}
                        </span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-semibold border uppercase tracking-wider ${severityStyles.badge}`}>
                          {currentError.severity}
                        </span>
                        <span className="text-xs text-slate-400 ml-auto font-mono">
                          HTTP {currentError.status}
                        </span>
                      </div>
                      <p className="text-sm text-slate-200 leading-relaxed">
                        {currentError.description}
                      </p>
                    </div>
                  </div>

                  {/* Metadata Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <Server className="w-3.5 h-3.5 text-indigo-400" />
                        Error Context
                      </div>
                      <div className="space-y-1 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-900">
                          <span className="text-slate-400">Detected Location:</span>
                          <span className="font-mono text-indigo-300">{currentError.location}</span>
                        </div>
                        {currentError.parameter && (
                          <div className="flex justify-between py-1 border-b border-slate-900">
                            <span className="text-slate-400">Target Parameter:</span>
                            <span className="font-mono text-rose-300">{currentError.parameter}</span>
                          </div>
                        )}
                        <div className="flex justify-between py-1">
                          <span className="text-slate-400">Status Text:</span>
                          <span className="text-slate-300">{currentError.statusText}</span>
                        </div>
                      </div>
                    </div>

                    <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-2">
                      <div className="text-xs text-slate-500 font-medium flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
                        Developer Mitigation
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {currentError.mitigation}
                      </p>
                    </div>
                  </div>

                  {/* Documentation Link */}
                  <div className="pt-2 flex justify-end">
                    <a
                      href={currentError.documentationUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                    >
                      Read RFC Specification &rarr;
                    </a>
                  </div>
                </div>
              )}

              {/* JSON TAB */}
              {activeTab === 'json' && (
                <div className="font-mono text-xs text-indigo-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed flex-1">
                  {jsonPayload}
                </div>
              )}

              {/* HTTP TAB */}
              {activeTab === 'http' && (
                <div className="font-mono text-xs text-slate-300 bg-slate-950 p-4 rounded-xl border border-slate-800 overflow-x-auto whitespace-pre-wrap leading-relaxed flex-1">
                  <span className="text-emerald-400">{rawHttpResponse.split('\n\n')[0]}</span>
                  {'\n\n'}
                  <span className="text-indigo-300">{rawHttpResponse.split('\n\n')[1]}</span>
                </div>
              )}

            </div>
          </div>

          {/* Simulation History */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Clock className="w-4 h-4 text-indigo-400" />
                Simulation History Log
              </h3>
              <button 
                onClick={() => setHistory([])}
                className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
              >
                Clear Log
              </button>
            </div>

            {history.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-xs border border-dashed border-slate-800 rounded-xl">
                No simulated events yet. Click "Simulate & Log Error" above.
              </div>
            ) : (
              <div className="space-y-2 max-h-[180px] overflow-y-auto pr-1">
                {history.map((log, index) => {
                  const logStyles = getSeverityStyles(log.severity);
                  return (
                    <div 
                      key={index} 
                      className="flex items-center justify-between p-3 bg-slate-950/50 border border-slate-800/60 rounded-xl text-xs hover:border-slate-700 transition-all"
                    >
                      <div className="flex items-center gap-3">
                        <span className={`w-2 h-2 rounded-full ${
                          log.severity === 'fatal' ? 'bg-red-500' :
                          log.severity === 'error' ? 'bg-rose-500' :
                          log.severity === 'warn' ? 'bg-amber-500' : 'bg-blue-500'
                        }`} />
                        <span className="font-mono text-slate-400">[{log.status}]</span>
                        <span className="font-semibold text-slate-200">{log.code}</span>
                        {log.customized && (
                          <span className="text-[9px] bg-indigo-500/10 text-indigo-300 px-1.5 py-0.5 rounded border border-indigo-500/20">
                            custom
                          </span>
                        )}
                      </div>
                      <div className="flex items-center gap-3 text-slate-500">
                        <span className="font-mono text-[10px]">{log.location}</span>
                        <span>•</span>
                        <span>{log.timestamp}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Footer / Info */}
      <div className="w-full max-w-7xl mt-12 pt-6 border-t border-slate-900 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <AlertCircle className="w-4 h-4 text-slate-600" />
          <span>This simulator complies with the OAuth 2.0 Authorization Framework (RFC 6749).</span>
        </div>
        <div>
          <span>Designed for developers & security engineers.</span>
        </div>
      </div>
    </div>
  );
}