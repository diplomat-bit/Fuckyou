import React, { useState, useMemo, useEffect } from 'react';
import { 
  Play, 
  RotateCcw, 
  Copy, 
  Check, 
  Settings, 
  Cpu, 
  Code, 
  FileText, 
  AlertCircle, 
  CheckCircle2, 
  Loader2, 
  HelpCircle,
  ArrowRight,
  Lock,
  Globe,
  Terminal
} from 'lucide-react';

type GrantType = 'authorization_code' | 'client_credentials' | 'refresh_token' | 'password';

interface RequestHeader {
  key: string;
  value: string;
}

export default function OauthTokenRequestSimulator() {
  // State for OAuth parameters
  const [grantType, setGrantType] = useState<GrantType>('authorization_code');
  const [tokenEndpoint, setTokenEndpoint] = useState('https://api.oauth-provider.com/v2/token');
  const [clientId, setClientId] = useState('client_id_9a8b7c6d5e');
  const [clientSecret, setClientSecret] = useState('sec_prod_x928374928374928374');
  const [code, setCode] = useState('splat_auth_code_8f7e6d5c4b3a21');
  const [redirectUri, setRedirectUri] = useState('https://myapp.com/oauth/callback');
  const [refreshToken, setRefreshToken] = useState('ref_tok_888888888888888888');
  const [username, setUsername] = useState('developer@example.com');
  const [password, setPassword] = useState('super-secure-password-123');
  const [scope, setScope] = useState('read:profile write:settings offline_access');

  // Simulation settings
  const [latency, setLatency] = useState<number>(800); // ms
  const [simulateError, setSimulateError] = useState<boolean>(false);
  const [errorType, setErrorType] = useState<string>('invalid_grant');

  // UI state
  const [isSending, setIsSending] = useState<boolean>(false);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [activeReqTab, setActiveReqTab] = useState<'body' | 'headers'>('body');
  const [activeResTab, setActiveResTab] = useState<'body' | 'headers'>('body');
  
  // Response state
  const [responseStatus, setResponseStatus] = useState<number | null>(null);
  const [responseHeaders, setResponseHeaders] = useState<Record<string, string> | null>(null);
  const [responseBody, setResponseBody] = useState<any | null>(null);
  const [simulatedAt, setSimulatedAt] = useState<string | null>(null);

  // Auto-generate authorization header if client credentials are in header
  const [authMethod, setAuthMethod] = useState<'body' | 'basic'>('basic');

  // Copy helper
  const copyToClipboard = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  // Compute request headers
  const headers = useMemo<RequestHeader[]>(() => {
    const list: RequestHeader[] = [
      { key: 'Content-Type', value: 'application/x-www-form-urlencoded' },
      { key: 'Accept', value: 'application/json' },
    ];

    if (authMethod === 'basic') {
      try {
        const credentials = btoa(`${clientId}:${clientSecret}`);
        list.push({ key: 'Authorization', value: `Basic ${credentials}` });
      } catch (e) {
        list.push({ key: 'Authorization', value: 'Basic [Invalid Characters]' });
      }
    }

    return list;
  }, [authMethod, clientId, clientSecret]);

  // Compute request body parameters
  const bodyParams = useMemo(() => {
    const params: Record<string, string> = { grant_type: grantType };

    if (authMethod === 'body') {
      params['client_id'] = clientId;
      params['client_secret'] = clientSecret;
    }

    if (scope) {
      params['scope'] = scope;
    }

    switch (grantType) {
      case 'authorization_code':
        params['code'] = code;
        params['redirect_uri'] = redirectUri;
        break;
      case 'refresh_token':
        params['refresh_token'] = refreshToken;
        break;
      case 'password':
        params['username'] = username;
        params['password'] = password;
        break;
      case 'client_credentials':
        // No extra params needed beyond grant_type and client credentials
        break;
    }

    return params;
  }, [grantType, authMethod, clientId, clientSecret, code, redirectUri, refreshToken, username, password, scope]);

  // Format body as application/x-www-form-urlencoded
  const urlEncodedBody = useMemo(() => {
    return Object.entries(bodyParams)
      .map(([key, val]) => `${encodeURIComponent(key)}=${encodeURIComponent(val)}`)
      .join('&');
  }, [bodyParams]);

  // Trigger simulation
  const handleSimulate = () => {
    setIsSending(true);
    setResponseStatus(null);
    setResponseBody(null);
    setResponseHeaders(null);

    setTimeout(() => {
      const timestamp = new Date().toUTCString();
      setSimulatedAt(timestamp);

      const resHeaders: Record<string, string> = {
        'Content-Type': 'application/json;charset=UTF-8',
        'Cache-Control': 'no-store',
        'Pragma': 'no-cache',
        'Date': timestamp,
        'Server': 'OAuth-Engine/3.4.1',
        'X-Content-Type-Options': 'nosniff',
      };

      if (simulateError) {
        setResponseStatus(400);
        resHeaders['Connection'] = 'close';
        setResponseHeaders(resHeaders);

        let errorDescription = 'The provided authorization grant or refresh token is invalid, expired, or revoked.';
        if (errorType === 'invalid_client') {
          errorDescription = 'Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).';
          setResponseStatus(401);
        } else if (errorType === 'unsupported_grant_type') {
          errorDescription = 'The authorization grant type is not supported by the authorization server.';
        } else if (errorType === 'invalid_scope') {
          errorDescription = 'The requested scope is invalid, unknown, or malformed.';
        }

        setResponseBody({
          error: errorType,
          error_description: errorDescription,
          error_uri: 'https://tools.ietf.org/html/rfc6749#section-5.2'
        });
      } else {
        setResponseStatus(200);
        setResponseHeaders(resHeaders);

        // Generate mock successful response
        const mockAccessToken = `at_prod_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;
        const mockRefreshToken = `rt_prod_${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`;

        const successBody: Record<string, any> = {
          access_token: mockAccessToken,
          token_type: 'Bearer',
          expires_in: 3600,
          scope: scope || 'default',
        };

        // Include refresh token if requested or if authorization_code/password grant
        if (grantType === 'authorization_code' || grantType === 'password' || grantType === 'refresh_token') {
          successBody['refresh_token'] = mockRefreshToken;
        }

        setResponseBody(successBody);
      }

      setIsSending(false);
    }, latency);
  };

  // Reset fields to defaults
  const handleReset = () => {
    setGrantType('authorization_code');
    setClientId('client_id_9a8b7c6d5e');
    setClientSecret('sec_prod_x928374928374928374');
    setCode('splat_auth_code_8f7e6d5c4b3a21');
    setRedirectUri('https://myapp.com/oauth/callback');
    setRefreshToken('ref_tok_888888888888888888');
    setUsername('developer@example.com');
    setPassword('super-secure-password-123');
    setScope('read:profile write:settings offline_access');
    setAuthMethod('basic');
    setLatency(800);
    setSimulateError(false);
    setErrorType('invalid_grant');
    setResponseStatus(null);
    setResponseBody(null);
    setResponseHeaders(null);
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 lg:p-8 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 mb-8 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="px-2.5 py-0.5 text-xs font-semibold tracking-wider text-indigo-400 bg-indigo-950/50 border border-indigo-800/50 rounded-full uppercase">
              OAuth 2.0 Sandbox
            </span>
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
          </div>
          <h1 className="text-2xl lg:text-3xl font-bold tracking-tight text-white">
            Token Endpoint Simulator
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Configure, inspect, and execute raw POST requests to simulate OAuth 2.0 token exchanges.
          </p>
        </div>
        <div className="flex items-center gap-2 self-stretch md:self-auto">
          <button
            onClick={handleReset}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 text-sm font-medium text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-all"
          >
            <RotateCcw className="w-4 h-4" />
            Reset Fields
          </button>
          <button
            onClick={handleSimulate}
            disabled={isSending}
            className="flex-1 md:flex-none flex items-center justify-center gap-2 px-5 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 disabled:text-indigo-300/50 rounded-lg shadow-lg shadow-indigo-950/50 transition-all"
          >
            {isSending ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" />
                Exchanging...
              </>
            ) : (
              <>
                <Play className="w-4 h-4 fill-current" />
                Send Request
              </>
            )}
          </button>
        </div>
      </div>

      {/* Main Workspace Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration (5 cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Section: Grant Type Selection */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider">
              <Cpu className="w-4 h-4" />
              <span>Grant Type Configuration</span>
            </div>
            
            <div className="space-y-2">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Select Grant Type (grant_type)
              </label>
              <div className="grid grid-cols-2 gap-2">
                {[
                  { id: 'authorization_code', label: 'Auth Code' },
                  { id: 'client_credentials', label: 'Client Credentials' },
                  { id: 'refresh_token', label: 'Refresh Token' },
                  { id: 'password', label: 'Password' },
                ].map((gt) => (
                  <button
                    key={gt.id}
                    onClick={() => setGrantType(gt.id as GrantType)}
                    className={`px-3 py-2.5 text-xs font-medium rounded-lg border text-left transition-all ${
                      grantType === gt.id
                        ? 'bg-indigo-950/40 border-indigo-500 text-indigo-200 shadow-inner'
                        : 'bg-slate-950/40 border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    {gt.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Client Auth Method */}
            <div className="space-y-2 pt-2 border-t border-slate-800/60">
              <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider">
                Client Authentication Method
              </label>
              <div className="flex gap-4">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="authMethod"
                    checked={authMethod === 'basic'}
                    onChange={() => setAuthMethod('basic')}
                    className="accent-indigo-500 bg-slate-950 border-slate-800"
                  />
                  <span>Basic Auth Header</span>
                </label>
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="radio"
                    name="authMethod"
                    checked={authMethod === 'body'}
                    onChange={() => setAuthMethod('body')}
                    className="accent-indigo-500 bg-slate-950 border-slate-800"
                  />
                  <span>Request Body (POST)</span>
                </label>
              </div>
            </div>
          </div>

          {/* Section: Dynamic Parameters */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider">
                <Lock className="w-4 h-4" />
                <span>Request Parameters</span>
              </div>
              <span className="text-xs text-slate-500">Dynamic Fields</span>
            </div>

            <div className="space-y-4">
              {/* Token Endpoint URL */}
              <div className="space-y-1.5">
                <label className="block text-xs font-medium text-slate-400">Token Endpoint URL</label>
                <div className="relative">
                  <Globe className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    value={tokenEndpoint}
                    onChange={(e) => setTokenEndpoint(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Client ID & Secret */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400">client_id</label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="block text-xs font-medium text-slate-400">client_secret</label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                  />
                </div>
              </div>

              {/* Grant Specific Fields */}
              {grantType === 'authorization_code' && (
                <>
                  <div className="space-y-1.5 p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg space-y-3">
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-indigo-400">code (Authorization Code)</label>
                      <input
                        type="text"
                        value={code}
                        onChange={(e) => setCode(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                      />
                    </div>
                    <div className="space-y-1.5">
                      <label className="block text-xs font-medium text-indigo-400">redirect_uri</label>
                      <input
                        type="text"
                        value={redirectUri}
                        onChange={(e) => setRedirectUri(e.target.value)}
                        className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                      />
                    </div>
                  </div>
                </>
              )}

              {grantType === 'refresh_token' && (
                <div className="space-y-1.5 p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
                  <label className="block text-xs font-medium text-indigo-400">refresh_token</label>
                  <input
                    type="text"
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                  />
                </div>
              )}

              {grantType === 'password' && (
                <div className="space-y-3 p-3 bg-slate-950/40 border border-slate-800/60 rounded-lg">
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-indigo-400">username</label>
                    <input
                      type="text"
                      value={username}
                      onChange={(e) => setUsername(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="block text-xs font-medium text-indigo-400">password</label>
                    <input
                      type="password"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                    />
                  </div>
                </div>
              )}

              {/* Scope */}
              <div className="space-y-1.5">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-medium text-slate-400">scope (Optional)</label>
                  <span className="text-[10px] text-slate-500">Space-separated list</span>
                </div>
                <input
                  type="text"
                  value={scope}
                  onChange={(e) => setScope(e.target.value)}
                  placeholder="e.g. read write offline_access"
                  className="w-full px-3 py-2 text-sm bg-slate-950 border border-slate-800 rounded-lg focus:outline-none focus:border-indigo-500 text-slate-200 font-mono"
                />
              </div>
            </div>
          </div>

          {/* Section: Simulation Controls */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm uppercase tracking-wider">
              <Settings className="w-4 h-4" />
              <span>Simulation Settings</span>
            </div>

            {/* Latency Slider */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Network Latency</span>
                <span className="text-indigo-400 font-mono font-semibold">{latency}ms</span>
              </div>
              <input
                type="range"
                min="100"
                max="3000"
                step="100"
                value={latency}
                onChange={(e) => setLatency(Number(e.target.value))}
                className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
              />
              <div className="flex justify-between text-[10px] text-slate-500">
                <span>100ms (Fast)</span>
                <span>3000ms (Slow 3G)</span>
              </div>
            </div>

            {/* Error Simulation Toggle */}
            <div className="pt-2 border-t border-slate-800/60 space-y-3">
              <div className="flex items-center justify-between">
                <label className="flex items-center gap-2 text-sm text-slate-300 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={simulateError}
                    onChange={(e) => setSimulateError(e.target.checked)}
                    className="rounded accent-indigo-500 bg-slate-950 border-slate-800 h-4 w-4"
                  />
                  <span>Simulate Error Response</span>
                </label>
              </div>

              {simulateError && (
                <div className="space-y-1.5 animate-fadeIn">
                  <label className="block text-xs font-medium text-rose-400">OAuth Error Code</label>
                  <select
                    value={errorType}
                    onChange={(e) => setErrorType(e.target.value)}
                    className="w-full px-3 py-2 text-xs bg-slate-950 border border-rose-950 rounded-lg focus:outline-none focus:border-rose-500 text-rose-200 font-mono"
                  >
                    <option value="invalid_grant">invalid_grant (400)</option>
                    <option value="invalid_client">invalid_client (401)</option>
                    <option value="unsupported_grant_type">unsupported_grant_type (400)</option>
                    <option value="invalid_scope">invalid_scope (400)</option>
                  </select>
                </div>
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Request & Response Inspection (7 cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Request Inspector */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">HTTP Request Inspector</span>
              </div>
              <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                <button
                  onClick={() => setActiveReqTab('body')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    activeReqTab === 'body'
                      ? 'bg-indigo-950/60 text-indigo-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Request Body
                </button>
                <button
                  onClick={() => setActiveReqTab('headers')}
                  className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                    activeReqTab === 'headers'
                      ? 'bg-indigo-950/60 text-indigo-300'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Headers ({headers.length})
                </button>
              </div>
            </div>

            {/* Request URL Bar */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800/60 flex items-center gap-2 font-mono text-xs">
              <span className="px-2 py-0.5 bg-emerald-950 text-emerald-400 border border-emerald-800/50 rounded font-bold">
                POST
              </span>
              <span className="text-slate-300 truncate flex-1">{tokenEndpoint}</span>
              <button
                onClick={() => copyToClipboard(`POST ${tokenEndpoint}`, 'req-url')}
                className="text-slate-500 hover:text-slate-300 p-1 rounded transition-all"
                title="Copy Request URL"
              >
                {copiedField === 'req-url' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
              </button>
            </div>

            {/* Request Content Area */}
            <div className="p-4 bg-slate-950 font-mono text-xs min-h-[160px] max-h-[240px] overflow-y-auto relative">
              {activeReqTab === 'body' ? (
                <div className="space-y-3">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-900">
                    <span>application/x-www-form-urlencoded</span>
                    <button
                      onClick={() => copyToClipboard(urlEncodedBody, 'req-body')}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      {copiedField === 'req-body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Raw</span>
                    </button>
                  </div>
                  
                  {/* Structured Key-Value View */}
                  <div className="space-y-1.5">
                    {Object.entries(bodyParams).map(([key, val]) => (
                      <div key={key} className="flex items-start py-0.5 hover:bg-slate-900/40 px-1 rounded">
                        <span className="text-indigo-400 font-semibold min-w-[120px]">{key}</span>
                        <span className="text-slate-500 px-1.5">=</span>
                        <span className="text-slate-300 break-all">{val}</span>
                      </div>
                    ))}
                  </div>

                  {/* Raw String Preview */}
                  <div className="mt-4 pt-3 border-t border-slate-900">
                    <span className="text-[10px] text-slate-500 block mb-1 uppercase tracking-wider">Raw Payload:</span>
                    <div className="p-2 bg-slate-900/50 rounded text-slate-400 break-all select-all">
                      {urlEncodedBody}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-2">
                  <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-900">
                    <span>HTTP Headers</span>
                    <button
                      onClick={() => copyToClipboard(headers.map(h => `${h.key}: ${h.value}`).join('\n'), 'req-headers')}
                      className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                    >
                      {copiedField === 'req-headers' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                      <span>Copy Headers</span>
                    </button>
                  </div>
                  <div className="space-y-1.5">
                    {headers.map((header, idx) => (
                      <div key={idx} className="flex items-start py-0.5 hover:bg-slate-900/40 px-1 rounded">
                        <span className="text-indigo-400 font-semibold min-w-[140px]">{header.key}</span>
                        <span className="text-slate-500 px-1.5">:</span>
                        <span className="text-slate-300 break-all">{header.value}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Response Inspector */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl overflow-hidden flex flex-col">
            <div className="bg-slate-900 px-4 py-3 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-indigo-400" />
                <span className="text-sm font-semibold text-slate-200">HTTP Response Inspector</span>
              </div>
              {responseStatus && (
                <div className="flex items-center gap-1 bg-slate-950 p-0.5 rounded-lg border border-slate-800">
                  <button
                    onClick={() => setActiveResTab('body')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      activeResTab === 'body'
                        ? 'bg-indigo-950/60 text-indigo-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    JSON Response
                  </button>
                  <button
                    onClick={() => setActiveResTab('headers')}
                    className={`px-2.5 py-1 text-xs font-medium rounded-md transition-all ${
                      activeResTab === 'headers'
                        ? 'bg-indigo-950/60 text-indigo-300'
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    Headers
                  </button>
                </div>
              )}
            </div>

            {/* Response Status Bar */}
            <div className="p-4 bg-slate-950/60 border-b border-slate-800/60 flex items-center justify-between font-mono text-xs">
              <div className="flex items-center gap-2">
                <span className="text-slate-500">Status:</span>
                {responseStatus ? (
                  <span className={`px-2 py-0.5 rounded font-bold border ${
                    responseStatus >= 200 && responseStatus < 300
                      ? 'bg-emerald-950 text-emerald-400 border-emerald-800/50'
                      : 'bg-rose-950 text-rose-400 border-rose-800/50'
                  }`}>
                    {responseStatus} {responseStatus === 200 ? 'OK' : responseStatus === 401 ? 'Unauthorized' : 'Bad Request'}
                  </span>
                ) : (
                  <span className="text-slate-500 italic">No request sent yet</span>
                )}
              </div>
              {simulatedAt && (
                <span className="text-slate-500 text-[10px] hidden sm:inline">
                  Time: {simulatedAt}
                </span>
              )}
            </div>

            {/* Response Content Area */}
            <div className="p-4 bg-slate-950 font-mono text-xs min-h-[220px] max-h-[320px] overflow-y-auto relative flex flex-col justify-center">
              {isSending ? (
                <div className="flex flex-col items-center justify-center py-8 space-y-3">
                  <Loader2 className="w-8 h-8 text-indigo-500 animate-spin" />
                  <p className="text-slate-400 text-xs">Simulating network latency ({latency}ms)...</p>
                </div>
              ) : responseBody ? (
                activeResTab === 'body' ? (
                  <div className="space-y-3 h-full">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-900">
                      <span>application/json</span>
                      <button
                        onClick={() => copyToClipboard(JSON.stringify(responseBody, null, 2), 'res-body')}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                      >
                        {copiedField === 'res-body' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy JSON</span>
                      </button>
                    </div>
                    <pre className="text-slate-300 overflow-x-auto p-2 bg-slate-900/30 rounded leading-relaxed">
                      {JSON.stringify(responseBody, null, 2)}
                    </pre>
                  </div>
                ) : (
                  <div className="space-y-2 h-full">
                    <div className="flex justify-between items-center text-[10px] text-slate-500 uppercase tracking-wider pb-1 border-b border-slate-900">
                      <span>Response Headers</span>
                      <button
                        onClick={() => copyToClipboard(
                          Object.entries(responseHeaders || {}).map(([k, v]) => `${k}: ${v}`).join('\n'),
                          'res-headers'
                        )}
                        className="flex items-center gap-1 text-slate-400 hover:text-slate-200"
                      >
                        {copiedField === 'res-headers' ? <Check className="w-3 h-3 text-emerald-400" /> : <Copy className="w-3 h-3" />}
                        <span>Copy Headers</span>
                      </button>
                    </div>
                    <div className="space-y-1.5">
                      {responseHeaders && Object.entries(responseHeaders).map(([key, val]) => (
                        <div key={key} className="flex items-start py-0.5 hover:bg-slate-900/40 px-1 rounded">
                          <span className="text-indigo-400 font-semibold min-w-[160px]">{key}</span>
                          <span className="text-slate-500 px-1.5">:</span>
                          <span className="text-slate-300 break-all">{val}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              ) : (
                <div className="flex flex-col items-center justify-center py-12 text-center space-y-2">
                  <div className="p-3 bg-slate-900 rounded-full border border-slate-800 text-slate-600">
                    <FileText className="w-6 h-6" />
                  </div>
                  <div className="max-w-xs">
                    <p className="text-slate-400 text-xs font-sans">
                      Click <strong className="text-indigo-400">"Send Request"</strong> above to simulate the OAuth 2.0 token exchange and inspect the response.
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Quick Reference Guide */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-xl p-4 space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold text-xs uppercase tracking-wider">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              <span>OAuth 2.0 Token Exchange Quick Guide</span>
            </div>
            <p className="text-xs text-slate-400 leading-relaxed">
              The token endpoint is used by clients to obtain an access token by presenting its authorization grant or refresh token. 
              Requests must be sent using the <code className="text-indigo-300 font-mono">POST</code> method and parameters must be 
              URL-encoded (<code className="text-indigo-300 font-mono">application/x-www-form-urlencoded</code>) in the request body.
            </p>
          </div>

        </div>

      </div>
    </div>
  );
}