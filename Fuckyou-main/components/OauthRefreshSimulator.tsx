import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  RefreshCw, 
  Key, 
  Shield, 
  Clock, 
  AlertTriangle, 
  CheckCircle, 
  Copy, 
  Terminal, 
  Settings, 
  Play, 
  Database, 
  Eye, 
  EyeOff, 
  Trash2, 
  HelpCircle,
  ArrowRight,
  FileText,
  Check,
  Cpu
} from 'lucide-react';

// --- Types & Interfaces ---
interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  issued_at: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  type: 'success' | 'error' | 'info';
  endpoint: string;
  requestBody: any;
  responseStatus: number;
  responseBody: any;
}

// --- Helper Functions ---
const generateRandomString = (length: number) => {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-._~';
  let result = '';
  for (let i = 0; i < length; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return result;
};

const generateMockJWT = (type: 'access' | 'refresh', scope: string, clientId: string) => {
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (type === 'access' ? 3600 : 86400 * 30); // 1 hour or 30 days
  
  const payload = btoa(JSON.stringify({
    sub: 'user_dev_98321',
    iss: 'https://auth.simulator.dev',
    aud: clientId || 'client_id_default',
    exp,
    iat: now,
    type,
    scope: scope || 'read write offline_access',
    jti: generateRandomString(16)
  }));
  
  const signature = btoa('mock_signature_hash_value_for_simulation_purposes');
  return `${header}.${payload}.${signature}`;
};

export default function OauthRefreshSimulator() {
  // --- State Management ---
  const [endpointUrl, setEndpointUrl] = useState('https://api.oauth-provider.com/v1/oauth/refresh');
  const [isMockMode, setIsMockMode] = useState(true);
  const [refreshToken, setRefreshToken] = useState('');
  const [clientId, setClientId] = useState('client_dev_abc123');
  const [clientSecret, setClientSecret] = useState('sec_9876543210fedcba');
  const [scope, setScope] = useState('read write offline_access');
  const [latency, setLatency] = useState(800); // ms
  const [forceError, setForceError] = useState<'none' | 'invalid_grant' | 'invalid_client' | 'expired_token' | 'server_error'>('none');
  const [showSecret, setShowSecret] = useState(false);
  
  // Request/Response State
  const [isLoading, setIsLoading] = useState(false);
  const [response, setResponse] = useState<{
    status: number;
    statusText: string;
    headers: Record<string, string>;
    data: TokenResponse | any;
  } | null>(null);
  
  // Logs & History
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [activeTab, setActiveTab] = useState<'simulator' | 'logs' | 'jwt-decoder'>('simulator');
  const [copiedField, setCopiedField] = useState<string | null>(null);
  
  // Countdown Timer for Access Token Expiration
  const [timeLeft, setTimeLeft] = useState<number | null>(null);

  // Initialize with a mock refresh token
  useEffect(() => {
    setRefreshToken(generateMockJWT('refresh', 'read write offline_access', 'client_dev_abc123'));
  }, []);

  // Countdown effect
  useEffect(() => {
    if (!response || response.status !== 200 || !response.data.expires_in) {
      setTimeLeft(null);
      return;
    }

    const issuedAt = response.data.issued_at || Math.floor(Date.now() / 1000);
    const expiresAt = issuedAt + response.data.expires_in;
    
    const updateTimer = () => {
      const now = Math.floor(Date.now() / 1000);
      const remaining = expiresAt - now;
      if (remaining <= 0) {
        setTimeLeft(0);
      } else {
        setTimeLeft(remaining);
      }
    };

    updateTimer();
    const interval = setInterval(updateTimer, 1000);
    return () => clearInterval(interval);
  }, [response]);

  // --- Actions ---
  const handleGenerateMockToken = () => {
    const newToken = generateMockJWT('refresh', scope, clientId);
    setRefreshToken(newToken);
    addLog('info', 'Generated new mock refresh token locally.', 200, { refresh_token: newToken });
  };

  const handleCopy = (text: string, fieldId: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(fieldId);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const addLog = (type: 'success' | 'error' | 'info', message: string, status: number, body: any) => {
    const newLog: LogEntry = {
      id: generateRandomString(8),
      timestamp: new Date().toLocaleTimeString(),
      type,
      endpoint: endpointUrl,
      requestBody: {
        grant_type: 'refresh_token',
        refresh_token: refreshToken ? `${refreshToken.substring(0, 15)}...` : '',
        client_id: clientId,
        scope
      },
      responseStatus: status,
      responseBody: body
    };
    setLogs(prev => [newLog, ...prev]);
  };

  const handleRefreshSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setResponse(null);

    const requestBody = {
      grant_type: 'refresh_token',
      refresh_token: refreshToken,
      client_id: clientId,
      client_secret: clientSecret,
      scope: scope
    };

    if (isMockMode) {
      // Simulate API Call
      await new Promise(resolve => setTimeout(resolve, latency));

      let mockResponseStatus = 200;
      let mockResponseData: any = {};

      if (forceError !== 'none') {
        switch (forceError) {
          case 'invalid_grant':
            mockResponseStatus = 400;
            mockResponseData = {
              error: 'invalid_grant',
              error_description: 'The provided authorization grant or refresh token is invalid, expired, or revoked.'
            };
            break;
          case 'invalid_client':
            mockResponseStatus = 401;
            mockResponseData = {
              error: 'invalid_client',
              error_description: 'Client authentication failed (e.g., unknown client, no client authentication included, or unsupported authentication method).'
            };
            break;
          case 'expired_token':
            mockResponseStatus = 400;
            mockResponseData = {
              error: 'invalid_grant',
              error_description: 'Refresh token has expired.'
            };
            break;
          case 'server_error':
            mockResponseStatus = 500;
            mockResponseData = {
              error: 'server_error',
              error_description: 'The authorization server encountered an unexpected condition that prevented it from fulfilling the request.'
            };
            break;
        }
      } else if (!refreshToken) {
        mockResponseStatus = 400;
        mockResponseData = {
          error: 'invalid_request',
          error_description: 'Missing required parameter: refresh_token'
        };
      } else {
        // Success Simulation
        const newAccessToken = generateMockJWT('access', scope, clientId);
        const newRefreshToken = generateMockJWT('refresh', scope, clientId);
        mockResponseData = {
          access_token: newAccessToken,
          refresh_token: newRefreshToken,
          token_type: 'Bearer',
          expires_in: 3600,
          scope: scope || 'read write offline_access',
          issued_at: Math.floor(Date.now() / 1000)
        };
      }

      const simulatedResponse = {
        status: mockResponseStatus,
        statusText: mockResponseStatus === 200 ? 'OK' : mockResponseStatus === 401 ? 'Unauthorized' : mockResponseStatus === 400 ? 'Bad Request' : 'Internal Server Error',
        headers: {
          'content-type': 'application/json;charset=UTF-8',
          'cache-control': 'no-store',
          'pragma': 'no-cache'
        },
        data: mockResponseData
      };

      setResponse(simulatedResponse);
      addLog(
        mockResponseStatus === 200 ? 'success' : 'error',
        mockResponseStatus === 200 ? 'Token refreshed successfully (Simulated).' : `Refresh failed with status ${mockResponseStatus} (Simulated).`,
        mockResponseStatus,
        mockResponseData
      );
      setIsLoading(false);
    } else {
      // Real HTTP Request
      try {
        const res = await fetch(endpointUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/x-www-form-urlencoded',
            'Authorization': `Basic ${btoa(`${clientId}:${clientSecret}`)}`
          },
          body: new URLSearchParams(requestBody).toString()
        });

        const data = await res.json();
        const realResponse = {
          status: res.status,
          statusText: res.statusText,
          headers: Object.fromEntries(res.headers.entries()),
          data
        };

        setResponse(realResponse);
        addLog(
          res.ok ? 'success' : 'error',
          res.ok ? 'Token refreshed successfully via live endpoint.' : `Live refresh failed with status ${res.status}.`,
          res.status,
          data
        );
      } catch (err: any) {
        const errorResponse = {
          status: 0,
          statusText: 'Network Error',
          headers: {},
          data: { error: 'network_error', error_description: err.message || 'Failed to fetch' }
        };
        setResponse(errorResponse);
        addLog('error', `Network error: ${err.message}`, 0, errorResponse.data);
      } finally {
        setIsLoading(false);
      }
    }
  };

  // --- JWT Decoder Helper ---
  const decodedTokenParts = useMemo(() => {
    const tokenToDecode = response?.data?.access_token || refreshToken;
    if (!tokenToDecode) return null;
    
    const parts = tokenToDecode.split('.');
    if (parts.length !== 3) return null;

    try {
      const header = JSON.parse(atob(parts[0]));
      const payload = JSON.parse(atob(parts[1]));
      return { header, payload, signature: parts[2], raw: tokenToDecode };
    } catch (e) {
      return null;
    }
  }, [response, refreshToken]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <RefreshCw className="w-6 h-6 animate-spin-slow" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              OAuth 2.0 Refresh Token Simulator
            </h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Simulate, test, and debug the <code className="text-indigo-400 bg-indigo-950/50 px-1.5 py-0.5 rounded text-xs">/refresh</code> (POST) grant flow with real-time feedback.
          </p>
        </div>
        
        {/* Mode Selector */}
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setIsMockMode(true)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              isMockMode 
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Cpu className="w-3.5 h-3.5" />
            Mock Sandbox
          </button>
          <button
            onClick={() => setIsMockMode(false)}
            className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 flex items-center gap-2 ${
              !isMockMode 
                ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-600/20' 
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Live Endpoint
          </button>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Configuration & Inputs (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
                activeTab === 'simulator'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Simulator Config
            </button>
            <button
              onClick={() => setActiveTab('jwt-decoder')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
                activeTab === 'jwt-decoder'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Shield className="w-4 h-4" />
              JWT Decoder
              {decodedTokenParts && (
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              )}
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all -mb-px flex items-center gap-2 ${
                activeTab === 'logs'
                  ? 'border-indigo-500 text-indigo-400'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Request Logs
              {logs.length > 0 && (
                <span className="bg-slate-800 text-slate-300 text-xs px-1.5 py-0.5 rounded-full font-bold">
                  {logs.length}
                </span>
              )}
            </button>
          </div>

          {/* Tab Content: Simulator */}
          {activeTab === 'simulator' && (
            <form onSubmit={handleRefreshSubmit} className="space-y-6">
              
              {/* Endpoint Configuration */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  Endpoint Configuration
                </h3>
                
                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-400 block">POST Request URL</label>
                  <div className="flex gap-2">
                    <span className="bg-slate-800 text-indigo-400 text-xs font-bold px-3 py-2 rounded-lg border border-slate-700 flex items-center">
                      POST
                    </span>
                    <input
                      type="text"
                      value={endpointUrl}
                      onChange={(e) => setEndpointUrl(e.target.value)}
                      disabled={isMockMode}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 flex-1 disabled:opacity-60 disabled:cursor-not-allowed"
                      placeholder="https://api.yourdomain.com/oauth/token"
                    />
                  </div>
                  {isMockMode && (
                    <p className="text-[11px] text-slate-500 italic">
                      * Running in Mock Sandbox. Requests will be intercepted and simulated locally.
                    </p>
                  )}
                </div>
              </div>

              {/* Client Credentials */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Key className="w-4 h-4 text-indigo-400" />
                  Client Credentials
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Client ID</label>
                    <input
                      type="text"
                      value={clientId}
                      onChange={(e) => setClientId(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                      placeholder="client_..."
                    />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-medium text-slate-400">Client Secret</label>
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={clientSecret}
                        onChange={(e) => setClientSecret(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-3 pr-10 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                        placeholder="secret_..."
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Requested Scope (Optional)</label>
                  <input
                    type="text"
                    value={scope}
                    onChange={(e) => setScope(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-indigo-500"
                    placeholder="read write offline_access"
                  />
                </div>
              </div>

              {/* Refresh Token Input */}
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4 backdrop-blur-sm">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <RefreshCw className="w-4 h-4 text-indigo-400" />
                    Refresh Token Input
                  </h3>
                  <button
                    type="button"
                    onClick={handleGenerateMockToken}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 bg-indigo-950/40 px-2.5 py-1 rounded-lg border border-indigo-900/50 transition-all"
                  >
                    <Cpu className="w-3 h-3" />
                    Generate Mock Token
                  </button>
                </div>

                <div className="space-y-1.5">
                  <textarea
                    value={refreshToken}
                    onChange={(e) => setRefreshToken(e.target.value)}
                    rows={4}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-slate-300 focus:outline-none focus:border-indigo-500 placeholder:text-slate-600"
                    placeholder="Paste your refresh_token here..."
                  />
                </div>
              </div>

              {/* Simulation Controls (Only visible in Mock Mode) */}
              {isMockMode && (
                <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-5 space-y-4">
                  <h3 className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                    <Settings className="w-4 h-4 text-indigo-400" />
                    Sandbox Simulation Controls
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {/* Latency Slider */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-400">Network Latency</span>
                        <span className="text-indigo-400 font-mono">{latency}ms</span>
                      </div>
                      <input
                        type="range"
                        min="100"
                        max="3000"
                        step="100"
                        value={latency}
                        onChange={(e) => setLatency(Number(e.target.value))}
                        className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                    </div>

                    {/* Force Error State */}
                    <div className="space-y-2">
                      <label className="text-xs font-medium text-slate-400 block">Force Error Response</label>
                      <select
                        value={forceError}
                        onChange={(e: any) => setForceError(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="none">None (Simulate Success)</option>
                        <option value="invalid_grant">400 Bad Request (invalid_grant)</option>
                        <option value="expired_token">400 Bad Request (expired_token)</option>
                        <option value="invalid_client">401 Unauthorized (invalid_client)</option>
                        <option value="server_error">500 Internal Server Error</option>
                      </select>
                    </div>
                  </div>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all duration-200 ${
                  isLoading 
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                    : isMockMode 
                      ? 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30'
                      : 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20 hover:shadow-emerald-600/30'
                }`}
              >
                {isLoading ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Processing Refresh Request...
                  </>
                ) : (
                  <>
                    <Play className="w-4 h-4 fill-current" />
                    Execute Refresh Token Flow
                  </>
                )}
              </button>

            </form>
          )}

          {/* Tab Content: JWT Decoder */}
          {activeTab === 'jwt-decoder' && (
            <div className="space-y-6">
              <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 space-y-4">
                <div className="flex justify-between items-center">
                  <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                    <Shield className="w-4 h-4 text-indigo-400" />
                    JWT Token Decoder
                  </h3>
                  <span className="text-xs text-slate-500">Decodes header & payload locally</span>
                </div>

                {decodedTokenParts ? (
                  <div className="space-y-4">
                    {/* Header */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-rose-400 uppercase tracking-wider">Header (Algorithm & Token Type)</span>
                      <pre className="bg-slate-950 border border-rose-950/50 rounded-lg p-3 text-xs font-mono text-rose-300 overflow-x-auto">
                        {JSON.stringify(decodedTokenParts.header, null, 2)}
                      </pre>
                    </div>

                    {/* Payload */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">Payload (Claims)</span>
                      <pre className="bg-slate-950 border border-indigo-950/50 rounded-lg p-3 text-xs font-mono text-indigo-300 overflow-x-auto">
                        {JSON.stringify(decodedTokenParts.payload, null, 2)}
                      </pre>
                    </div>

                    {/* Signature */}
                    <div className="space-y-1.5">
                      <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">Signature</span>
                      <div className="bg-slate-950 border border-emerald-950/50 rounded-lg p-3 text-xs font-mono text-emerald-500 break-all">
                        HMACSHA256(<br />
                        &nbsp;&nbsp;base64UrlEncode(header) + "." +<br />
                        &nbsp;&nbsp;base64UrlEncode(payload),<br />
                        &nbsp;&nbsp;<span className="text-slate-400">your-256-bit-secret</span><br />
                        ) <span className="text-emerald-400">✔ Verified (Simulated)</span>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-3" />
                    <p className="text-sm text-slate-400">No valid JWT detected.</p>
                    <p className="text-xs text-slate-500 mt-1 max-w-md mx-auto">
                      Generate a mock token or execute a successful refresh request to decode the resulting access token.
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Tab Content: Logs */}
          {activeTab === 'logs' && (
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-sm font-semibold text-slate-200">Activity History</h3>
                {logs.length > 0 && (
                  <button
                    onClick={() => setLogs([])}
                    className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    Clear Logs
                  </button>
                )}
              </div>

              {logs.length === 0 ? (
                <div className="text-center py-12 bg-slate-900/20 border border-slate-800 rounded-2xl">
                  <Terminal className="w-8 h-8 text-slate-700 mx-auto mb-3" />
                  <p className="text-sm text-slate-400">No logs recorded yet.</p>
                  <p className="text-xs text-slate-500 mt-1">Execute a refresh request to see live telemetry.</p>
                </div>
              ) : (
                <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2">
                  {logs.map((log) => (
                    <div 
                      key={log.id} 
                      className="bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 space-y-3 text-xs"
                    >
                      <div className="flex justify-between items-center">
                        <div className="flex items-center gap-2">
                          <span className={`w-2 h-2 rounded-full ${
                            log.type === 'success' ? 'bg-emerald-500' : log.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'
                          }`} />
                          <span className="font-mono text-slate-400">{log.timestamp}</span>
                        </div>
                        <span className={`font-mono font-bold px-2 py-0.5 rounded ${
                          log.responseStatus >= 200 && log.responseStatus < 300 
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' 
                            : 'bg-rose-950 text-rose-400 border border-rose-900/50'
                        }`}>
                          HTTP {log.responseStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-800/50">
                        <div>
                          <span className="text-slate-500 block mb-1 font-semibold">Request Payload:</span>
                          <pre className="bg-slate-950 p-2 rounded font-mono text-[11px] text-slate-300 overflow-x-auto">
                            {JSON.stringify(log.requestBody, null, 2)}
                          </pre>
                        </div>
                        <div>
                          <span className="text-slate-500 block mb-1 font-semibold">Response Payload:</span>
                          <pre className="bg-slate-950 p-2 rounded font-mono text-[11px] text-slate-300 overflow-x-auto">
                            {JSON.stringify(log.responseBody, null, 2)}
                          </pre>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

        </div>

        {/* Right Column: Live Response & Telemetry (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Response Panel */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 space-y-6 backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />
            
            <div className="flex justify-between items-center">
              <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Terminal className="w-4 h-4 text-indigo-400" />
                Live Response Console
              </h2>
              {response && (
                <span className={`text-xs font-mono font-bold px-2.5 py-1 rounded-full ${
                  response.status === 200 
                    ? 'bg-emerald-950/80 text-emerald-400 border border-emerald-800/50' 
                    : 'bg-rose-950/80 text-rose-400 border border-rose-800/50'
                }`}>
                  {response.status} {response.statusText}
                </span>
              )}
            </div>

            {response ? (
              <div className="space-y-6">
                
                {/* Success State Details */}
                {response.status === 200 && (
                  <div className="space-y-4">
                    
                    {/* Expiration Countdown */}
                    {timeLeft !== null && (
                      <div className="bg-indigo-950/30 border border-indigo-900/40 rounded-xl p-4 flex items-center justify-between">
                        <div className="flex items-center gap-3">
                          <Clock className="w-5 h-5 text-indigo-400 animate-pulse" />
                          <div>
                            <span className="text-xs text-slate-400 block">Access Token Expiration</span>
                            <span className="text-sm font-bold text-slate-200">
                              {timeLeft > 0 ? `${Math.floor(timeLeft / 60)}m ${timeLeft % 60}s remaining` : 'Expired'}
                            </span>
                          </div>
                        </div>
                        <div className="w-12 h-12 rounded-full border-2 border-indigo-500/20 flex items-center justify-center relative">
                          <span className="text-[10px] font-mono text-indigo-400 font-bold">
                            {Math.round((timeLeft / 3600) * 100)}%
                          </span>
                        </div>
                      </div>
                    )}

                    {/* Access Token Display */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <Key className="w-3 h-3 text-emerald-400" />
                          access_token
                        </span>
                        <button
                          onClick={() => handleCopy(response.data.access_token, 'access_token')}
                          className="text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          {copiedField === 'access_token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 break-all max-h-24 overflow-y-auto">
                        {response.data.access_token}
                      </div>
                    </div>

                    {/* Refresh Token Display */}
                    <div className="space-y-1.5">
                      <div className="flex justify-between items-center">
                        <span className="text-xs font-semibold text-slate-400 flex items-center gap-1">
                          <RefreshCw className="w-3 h-3 text-indigo-400" />
                          new_refresh_token
                        </span>
                        <button
                          onClick={() => handleCopy(response.data.refresh_token, 'refresh_token')}
                          className="text-slate-500 hover:text-indigo-400 transition-colors"
                        >
                          {copiedField === 'refresh_token' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 font-mono text-xs text-slate-300 break-all max-h-24 overflow-y-auto">
                        {response.data.refresh_token}
                      </div>
                    </div>

                  </div>
                )}

                {/* Error State Details */}
                {response.status !== 200 && (
                  <div className="bg-rose-950/20 border border-rose-900/40 rounded-xl p-4 flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold text-rose-400 uppercase tracking-wider">
                        {response.data.error || 'Request Failed'}
                      </h4>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        {response.data.error_description || 'An error occurred while attempting to refresh the token.'}
                      </p>
                    </div>
                  </div>
                )}

                {/* Raw JSON Response */}
                <div className="space-y-2">
                  <span className="text-xs font-semibold text-slate-400 block">Raw JSON Response Payload</span>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 text-xs font-mono text-indigo-300 overflow-x-auto max-h-64">
                    {JSON.stringify(response.data, null, 2)}
                  </pre>
                </div>

              </div>
            ) : (
              <div className="text-center py-20 border border-dashed border-slate-800 rounded-xl">
                <Play className="w-10 h-10 text-slate-700 mx-auto mb-4 animate-pulse" />
                <p className="text-sm text-slate-400 font-medium">Awaiting Execution</p>
                <p className="text-xs text-slate-500 mt-1 max-w-xs mx-auto">
                  Configure the parameters on the left and click "Execute Refresh Token Flow" to simulate the round-trip.
                </p>
              </div>
            )}
          </div>

          {/* Educational / Flow Diagram Card */}
          <div className="bg-slate-900/30 border border-slate-800/60 rounded-2xl p-5 space-y-4">
            <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
              <FileText className="w-4 h-4 text-indigo-400" />
              How Refresh Token Flow Works
            </h3>
            
            <div className="space-y-3 text-xs text-slate-400">
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold shrink-0">1</div>
                <p>Client sends a <code className="text-indigo-300">POST</code> request to the authorization server with <code className="text-indigo-300">grant_type=refresh_token</code> and the current refresh token.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold shrink-0">2</div>
                <p>The authorization server validates the refresh token and client credentials.</p>
              </div>
              <div className="flex gap-3">
                <div className="w-5 h-5 rounded-full bg-indigo-950 text-indigo-400 flex items-center justify-center font-bold shrink-0">3</div>
                <p>If valid, a brand new <code className="text-emerald-400">access_token</code> (and optionally a new <code className="text-indigo-400">refresh_token</code>) is returned.</p>
              </div>
            </div>
          </div>

        </div>

      </main>
    </div>
  );
}