import React, { useState, useMemo } from 'react';
import { 
  Trash2, 
  Key, 
  ShieldAlert, 
  CheckCircle2, 
  XCircle, 
  Loader2, 
  Eye, 
  EyeOff, 
  Settings, 
  Send, 
  Copy, 
  Check, 
  Info, 
  RefreshCw,
  Code
} from 'lucide-react';

interface RevokeResponse {
  status: number;
  statusText: string;
  body: string;
  headers: Record<string, string>;
}

export default function OauthTokenRevoker() {
  // State for Request Configuration
  const [endpoint, setEndpoint] = useState('https://api.example.com/oauth/revoke');
  const [token, setToken] = useState('');
  const [tokenTypeHint, setTokenTypeHint] = useState<'access_token' | 'refresh_token' | ''>('access_token');
  const [authMethod, setAuthMethod] = useState<'basic' | 'body' | 'none'>('basic');
  const [clientId, setClientId] = useState('');
  const [clientSecret, setClientSecret] = useState('');
  const [showSecret, setShowSecret] = useState(false);
  const [customHeaders, setCustomHeaders] = useState<{ key: string; value: string }[]>([
    { key: 'Content-Type', value: 'application_x-www-form-urlencoded' }
  ]);

  // UI & Execution State
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<RevokeResponse | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [activeTab, setActiveTab] = useState<'builder' | 'headers'>('builder');
  const [isMockMode, setIsMockMode] = useState(true);

  // Generate Basic Auth Header
  const basicAuthHeader = useMemo(() => {
    if (!clientId && !clientSecret) return '';
    try {
      return `Basic ${btoa(`${clientId}:${clientSecret}`)}`;
    } catch (e) {
      return 'Invalid credentials encoding';
    }
  }, [clientId, clientSecret]);

  // Generate Request Body
  const requestBody = useMemo(() => {
    const params = new URLSearchParams();
    params.append('token', token || '[YOUR_TOKEN]');
    if (tokenTypeHint) {
      params.append('token_type_hint', tokenTypeHint);
    }
    if (authMethod === 'body') {
      params.append('client_id', clientId || '[CLIENT_ID]');
      params.append('client_secret', clientSecret || '[CLIENT_SECRET]');
    }
    return params.toString();
  }, [token, tokenTypeHint, authMethod, clientId, clientSecret]);

  // Generate cURL command for preview
  const curlCommand = useMemo(() => {
    let curl = `curl -X POST "${endpoint}" \\\n`;
    
    // Headers
    if (authMethod === 'basic' && basicAuthHeader) {
      curl += `  -H "Authorization: ${basicAuthHeader}" \\\n`;
    }
    customHeaders.forEach(h => {
      if (h.key && h.value) {
        curl += `  -H "${h.key}: ${h.value}" \\\n`;
      }
    });
    
    // Body
    curl += `  -d "${requestBody}"`;
    return curl;
  }, [endpoint, authMethod, basicAuthHeader, customHeaders, requestBody]);

  const handleCopyCurl = () => {
    navigator.clipboard.writeText(curlCommand);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleAddHeader = () => {
    setCustomHeaders([...customHeaders, { key: '', value: '' }]);
  };

  const handleRemoveHeader = (index: number) => {
    setCustomHeaders(customHeaders.filter((_, i) => i !== index));
  };

  const handleHeaderChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...customHeaders];
    updated[index][field] = val;
    setCustomHeaders(updated);
  };

  const handleRevoke = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!token) {
      setError('Please enter a token to revoke.');
      return;
    }

    setIsLoading(true);
    setError(null);
    setResponse(null);

    if (isMockMode) {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1200));
      setIsLoading(false);
      setResponse({
        status: 200,
        statusText: 'OK',
        headers: {
          'content-type': 'application/json; charset=utf-8',
          'cache-control': 'no-store',
          'pragma': 'no-cache'
        },
        body: JSON.stringify({
          active: false,
          message: 'Token successfully revoked or was already invalid (RFC 7009 compliance).'
        }, null, 2)
      });
      return;
    }

    // Real API Call
    try {
      const headers: Record<string, string> = {};
      
      // Apply custom headers
      customHeaders.forEach(h => {
        if (h.key) headers[h.key] = h.value;
      });

      // Apply Auth Header
      if (authMethod === 'basic' && basicAuthHeader) {
        headers['Authorization'] = basicAuthHeader;
      }

      const res = await fetch(endpoint, {
        method: 'POST',
        headers: headers,
        body: requestBody
      });

      const responseText = await res.text();
      let formattedBody = responseText;
      try {
        formattedBody = JSON.stringify(JSON.parse(responseText), null, 2);
      } catch (e) {
        // Keep as plain text if not JSON
      }

      const resHeaders: Record<string, string> = {};
      res.headers.forEach((value, key) => {
        resHeaders[key] = value;
      });

      setResponse({
        status: res.status,
        statusText: res.statusText,
        headers: resHeaders,
        body: formattedBody
      });
    } catch (err: any) {
      setError(err.message || 'An error occurred while sending the revocation request.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-start items-center font-sans">
      <div className="w-full max-w-6xl space-y-8">
        
        {/* Header Section */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6 gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wider uppercase">
              <ShieldAlert className="w-4 h-4" />
              OAuth 2.0 Security Suite
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1">
              Token Revocation Studio
            </h1>
            <p className="text-slate-400 text-sm mt-1 max-w-2xl">
              Fully compliant with <a href="https://datatracker.ietf.org/doc/html/rfc7009" target="_blank" rel="noreferrer" className="text-indigo-400 hover:underline">RFC 7009</a>. 
              Safely invalidate active access or refresh tokens to prevent unauthorized access.
            </p>
          </div>

          {/* Mode Switcher */}
          <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800 self-start md:self-center">
            <button
              onClick={() => setIsMockMode(true)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                isMockMode 
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Mock Sandbox
            </button>
            <button
              onClick={() => setIsMockMode(false)}
              className={`px-4 py-1.5 rounded-lg text-xs font-medium transition-all ${
                !isMockMode 
                  ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-500/20' 
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Live Endpoint
            </button>
          </div>
        </div>

        {/* Main Workspace Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Configuration Panel */}
          <div className="lg:col-span-7 space-y-6">
            <form onSubmit={handleRevoke} className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              
              {/* Section Title */}
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Settings className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">Request Builder</h2>
                </div>
                <span className="text-xs text-slate-500 font-mono">POST /revoke</span>
              </div>

              {/* Endpoint URL */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                  Revocation Endpoint URL
                </label>
                <input
                  type="url"
                  required
                  disabled={isMockMode}
                  value={isMockMode ? 'https://api.sandbox-oauth.dev/v1/revoke' : endpoint}
                  onChange={(e) => setEndpoint(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition disabled:opacity-60"
                  placeholder="https://your-auth-server.com/oauth/revoke"
                />
              </div>

              {/* Token Input */}
              <div className="space-y-2">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Token to Revoke
                  </label>
                  <span className="text-xs text-rose-400 font-medium">* Required</span>
                </div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Key className="h-5 w-5 text-slate-500" />
                  </div>
                  <input
                    type="text"
                    required
                    value={token}
                    onChange={(e) => setToken(e.target.value)}
                    placeholder="e.g. sl.u.AF98yHjK... or refresh token"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition font-mono"
                  />
                </div>
              </div>

              {/* Token Type Hint & Auth Method Row */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                
                {/* Token Type Hint */}
                <div className="space-y-2">
                  <div className="flex items-center gap-1.5">
                    <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                      Token Type Hint
                    </label>
                    <div className="group relative">
                      <Info className="w-3.5 h-3.5 text-slate-500 cursor-help" />
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 hidden group-hover:block w-48 bg-slate-950 border border-slate-800 text-slate-300 text-[11px] p-2 rounded shadow-xl z-10">
                        Helps the authorization server optimize the lookup process.
                      </div>
                    </div>
                  </div>
                  <select
                    value={tokenTypeHint}
                    onChange={(e) => setTokenTypeHint(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="access_token">Access Token (access_token)</option>
                    <option value="refresh_token">Refresh Token (refresh_token)</option>
                    <option value="">None (Auto-detect)</option>
                  </select>
                </div>

                {/* Client Authentication Method */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400">
                    Client Authentication
                  </label>
                  <select
                    value={authMethod}
                    onChange={(e) => setAuthMethod(e.target.value as any)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition"
                  >
                    <option value="basic">HTTP Basic Auth (Recommended)</option>
                    <option value="body">Post Body Parameters</option>
                    <option value="none">None (Public Client)</option>
                  </select>
                </div>

              </div>

              {/* Client Credentials (Conditional) */}
              {authMethod !== 'none' && (
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-4">
                  <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500"></span>
                    Client Credentials
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 uppercase font-medium">Client ID</label>
                      <input
                        type="text"
                        value={clientId}
                        onChange={(e) => setClientId(e.target.value)}
                        placeholder="client_id"
                        className="w-full bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="text-[11px] text-slate-500 uppercase font-medium">Client Secret</label>
                      <div className="relative">
                        <input
                          type={showSecret ? 'text' : 'password'}
                          value={clientSecret}
                          onChange={(e) => setClientSecret(e.target.value)}
                          placeholder="client_secret"
                          className="w-full bg-slate-900 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => setShowSecret(!showSecret)}
                          className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-500 hover:text-slate-300"
                        >
                          {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Tabs for Headers & Advanced */}
              <div className="space-y-4">
                <div className="flex border-b border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('builder')}
                    className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === 'builder' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Request Body Preview
                  </button>
                  <button
                    type="button"
                    onClick={() => setActiveTab('headers')}
                    className={`pb-2 px-4 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === 'headers' 
                        ? 'border-indigo-500 text-indigo-400' 
                        : 'border-transparent text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    Custom Headers ({customHeaders.length})
                  </button>
                </div>

                {/* Tab Content: Body Preview */}
                {activeTab === 'builder' && (
                  <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/60">
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-xs text-slate-500 font-mono">application/x-www-form-urlencoded</span>
                    </div>
                    <div className="font-mono text-xs text-indigo-300 break-all bg-slate-900/50 p-3 rounded-lg border border-slate-800">
                      {requestBody}
                    </div>
                  </div>
                )}

                {/* Tab Content: Custom Headers */}
                {activeTab === 'headers' && (
                  <div className="space-y-3">
                    {customHeaders.map((header, index) => (
                      <div key={index} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Header-Name"
                          value={header.key}
                          onChange={(e) => handleHeaderChange(index, 'key', e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={header.value}
                          onChange={(e) => handleHeaderChange(index, 'value', e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveHeader(index)}
                          className="p-2 text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                    <button
                      type="button"
                      onClick={handleAddHeader}
                      className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                    >
                      + Add Custom Header
                    </button>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                  isMockMode 
                    ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-indigo-500/10' 
                    : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-emerald-500/10'
                } disabled:opacity-50 disabled:cursor-not-allowed`}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Revoking Token...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    {isMockMode ? 'Simulate Revocation' : 'Execute Revocation'}
                  </>
                )}
              </button>

            </form>
          </div>

          {/* Right Column: Live Preview & Response */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* cURL Code Block */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <Code className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">cURL Request</h2>
                </div>
                <button
                  onClick={handleCopyCurl}
                  className="flex items-center gap-1.5 text-xs text-slate-400 hover:text-slate-200 bg-slate-950 border border-slate-800 px-2.5 py-1.5 rounded-lg transition"
                >
                  {copied ? (
                    <>
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                      Copied!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copy
                    </>
                  )}
                </button>
              </div>

              <div className="relative">
                <pre className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 text-xs font-mono text-slate-300 overflow-x-auto max-h-48 whitespace-pre-wrap leading-relaxed">
                  {curlCommand}
                </pre>
              </div>
            </div>

            {/* Response Panel */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4 min-h-[320px] flex flex-col justify-between">
              <div>
                <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
                  <div className="flex items-center gap-2">
                    <RefreshCw className={`w-5 h-5 text-indigo-400 ${isLoading ? 'animate-spin' : ''}`} />
                    <h2 className="text-lg font-semibold text-white">Response Status</h2>
                  </div>
                  {response && (
                    <span className={`px-2.5 py-1 rounded-full text-xs font-bold ${
                      response.status >= 200 && response.status < 300 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {response.status} {response.statusText}
                    </span>
                  )}
                </div>

                {/* Error Display */}
                {error && (
                  <div className="bg-rose-500/10 border border-rose-500/20 rounded-xl p-4 flex items-start gap-3 text-rose-300 text-sm">
                    <XCircle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <span className="font-semibold">Execution Error:</span> {error}
                    </div>
                  </div>
                )}

                {/* Empty State */}
                {!response && !error && !isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                    <div className="w-12 h-12 rounded-full bg-slate-950 border border-slate-800 flex items-center justify-center text-slate-500">
                      <Send className="w-5 h-5" />
                    </div>
                    <div>
                      <p className="text-sm font-medium text-slate-300">No Request Sent Yet</p>
                      <p className="text-xs text-slate-500 max-w-xs mt-1">
                        Configure the parameters on the left and click execute to trigger the revocation flow.
                      </p>
                    </div>
                  </div>
                )}

                {/* Loading State */}
                {isLoading && (
                  <div className="flex flex-col items-center justify-center py-12 text-center space-y-3">
                    <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                    <p className="text-xs text-slate-400">Awaiting response from authorization server...</p>
                  </div>
                )}

                {/* Response Body & Headers */}
                {response && !isLoading && (
                  <div className="space-y-4">
                    {/* Response Headers */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Response Headers</span>
                      <div className="bg-slate-950 border border-slate-800/60 rounded-lg p-3 max-h-28 overflow-y-auto font-mono text-[11px] text-slate-400 space-y-1">
                        {Object.entries(response.headers).map(([k, v]) => (
                          <div key={k} className="flex justify-between border-b border-slate-900 pb-1 last:border-0">
                            <span className="text-indigo-400">{k}:</span>
                            <span className="text-slate-300 truncate max-w-[200px]">{v}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Response Body */}
                    <div className="space-y-1.5">
                      <span className="text-[10px] font-semibold text-slate-500 uppercase tracking-wider">Response Body</span>
                      <pre className="bg-slate-950 border border-slate-800/60 rounded-lg p-3 font-mono text-xs text-emerald-400 overflow-x-auto max-h-40">
                        {response.body || 'No response body returned (Standard RFC 7009 behavior for successful revocation)'}
                      </pre>
                    </div>
                  </div>
                )}
              </div>

              {/* RFC Compliance Note */}
              <div className="border-t border-slate-800/60 pt-4 mt-4 flex items-start gap-2.5 text-[11px] text-slate-500">
                <CheckCircle2 className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
                <p>
                  Note: RFC 7009 specifies that if a token is already invalid or does not exist, the server must still respond with a 200 OK status to prevent user-enumeration attacks.
                </p>
              </div>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
}