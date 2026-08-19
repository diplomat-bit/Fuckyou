

// --- CONSOLIDATED FROM: ./components/chase/ChaseTokenAuthManager.tsx ---

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, Key, Clock, CheckCircle, AlertCircle, 
  RefreshCw, Copy, Eye, EyeOff, Server, Lock, 
  Code, Activity, ChevronRight, Terminal, Check,
  Zap, Database, Globe
} from 'lucide-react';

// --- Types & Interfaces ---

interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  refresh_token: string;
  scope: string;
  id_token?: string;
}

interface DecodedToken {
  header: Record<string, any>;
  payload: Record<string, any>;
}

interface AuthConfig {
  clientId: string;
  clientSecret: string;
  authCode: string;
  redirectUri: string;
  grantType: string;
}

// --- Utility Functions ---

const generateUuid = () => {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    const r = Math.random() * 16 | 0, v = c === 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
};

const base64UrlEncode = (obj: any) => 
  btoa(JSON.stringify(obj)).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');

const generateMockJwt = (clientId: string, scopes: string, expiresIn: number) => {
  const header = { alg: 'RS256', typ: 'JWT', kid: 'chase-auth-key-prod-1' };
  const payload = {
    iss: 'https://api.chase.com/identity/auth/v1',
    sub: `usr_${generateUuid().substring(0, 8)}`,
    aud: clientId || 'chase_partner_client',
    exp: Math.floor(Date.now() / 1000) + expiresIn,
    iat: Math.floor(Date.now() / 1000),
    jti: generateUuid(),
    scope: scopes,
    amr: ['pwd', 'mfa'],
    client_id: clientId
  };
  
  const signature = Array.from({length: 43}, () => 
    'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_'[Math.floor(Math.random() * 64)]
  ).join('');

  return `${base64UrlEncode(header)}.${base64UrlEncode(payload)}.${signature}`;
};

const decodeJwt = (token: string): DecodedToken | null => {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const decode = (str: string) => JSON.parse(atob(str.replace(/-/g, '+').replace(/_/g, '/')));
    return {
      header: decode(parts[0]),
      payload: decode(parts[1])
    };
  } catch (e) {
    return null;
  }
};

// --- UI Components ---

const Card = ({ children, title, icon: Icon, className = '', action = null }: any) => (
  <div className={`bg-[#0f172a] border border-[#1e293b] rounded-xl overflow-hidden shadow-2xl flex flex-col ${className}`}>
    <div className="px-5 py-4 border-b border-[#1e293b] flex items-center justify-between bg-[#0b1120]">
      <div className="flex items-center gap-3">
        <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400 border border-blue-500/20">
          <Icon size={18} />
        </div>
        <h3 className="text-sm font-semibold text-slate-200 tracking-wide uppercase">{title}</h3>
      </div>
      {action && <div>{action}</div>}
    </div>
    <div className="p-5 flex-1 flex flex-col">
      {children}
    </div>
  </div>
);

const InputGroup = ({ label, type = 'text', value, onChange, placeholder, icon: Icon, isSecret = false }: any) => {
  const [show, setShow] = useState(false);
  const actualType = isSecret && !show ? 'password' : type;

  return (
    <div className="mb-4">
      <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">{label}</label>
      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-slate-500">
          <Icon size={16} />
        </div>
        <input
          type={actualType}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          className="block w-full pl-10 pr-10 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 transition-all outline-none"
          placeholder={placeholder}
          spellCheck={false}
        />
        {isSecret && (
          <button
            type="button"
            onClick={() => setShow(!show)}
            className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200 transition-colors"
          >
            {show ? <EyeOff size={16} /> : <Eye size={16} />}
          </button>
        )}
      </div>
    </div>
  );
};

const JsonViewer = ({ data }: { data: any }) => (
  <pre className="bg-[#0b1120] p-4 rounded-lg border border-[#1e293b] overflow-x-auto text-xs font-mono text-slate-300 leading-relaxed">
    <code dangerouslySetInnerHTML={{
      __html: JSON.stringify(data, null, 2)
        .replace(/"([^"]+)":/g, '<span class="text-blue-400">"$1"</span>:')
        .replace(/: "([^"]+)"/g, ': <span class="text-emerald-400">"$1"</span>')
        .replace(/: ([0-9]+)/g, ': <span class="text-amber-400">$1</span>')
    }} />
  </pre>
);

// --- Main Component ---

export default function ChaseTokenAuthManager() {
  const [config, setConfig] = useState<AuthConfig>({
    clientId: 'chase_client_8f92a1b3',
    clientSecret: 'cs_live_9a8b7c6d5e4f3g2h1i0j',
    authCode: 'auth_code_xyz789_req_445',
    redirectUri: 'https://partner.app.com/callback',
    grantType: 'authorization_code'
  });

  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'inspector' | 'logs'>('inspector');
  const [copiedToken, setCopiedToken] = useState(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string, type: 'info' | 'req' | 'res' | 'err' = 'info') => {
    const timestamp = new Date().toISOString().split('T')[1].slice(0, -1);
    let prefix = '';
    switch(type) {
      case 'req': prefix = '→ '; break;
      case 'res': prefix = '← '; break;
      case 'err': prefix = '✖ '; break;
      default: prefix = 'ℹ ';
    }
    setLogs(prev => [...prev, `[${timestamp}] ${prefix}${msg}`]);
  }, []);

  useEffect(() => {
    if (logsEndRef.current) {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (tokenData && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [tokenData, timeLeft]);

  const handleExchange = async () => {
    if (!config.clientId || !config.clientSecret || !config.authCode) {
      setError('Client ID, Secret, and Auth Code are required.');
      return;
    }

    setLoading(true);
    setError(null);
    setTokenData(null);
    setTimeLeft(0);
    setLogs([]);

    addLog('Initiating OAuth 2.0 Token Exchange...', 'info');
    addLog(`POST /api/identity/auth/v1/oauth2/token/us/gcb HTTP/1.1`, 'req');
    addLog(`Host: api.chase.com`, 'req');
    addLog(`Content-Type: application/x-www-form-urlencoded`, 'req');
    
    const authHeader = btoa(`${config.clientId}:${config.clientSecret}`);
    addLog(`Authorization: Basic ${authHeader.substring(0, 10)}...`, 'req');
    
    const payload = `grant_type=${config.grantType}&code=${config.authCode}&redirect_uri=${encodeURIComponent(config.redirectUri)}`;
    addLog(`Payload: ${payload}`, 'req');

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1200));

    try {
      // Simulate validation
      if (config.authCode === 'expired_code') {
        throw new Error('invalid_grant: The provided authorization code is invalid or has expired.');
      }

      const expiresIn = 3600;
      const scopes = 'card loyalty_enrollment read_balance offline_access';
      
      const mockResponse: TokenResponse = {
        access_token: generateMockJwt(config.clientId, scopes, expiresIn),
        token_type: 'Bearer',
        expires_in: expiresIn,
        refresh_token: `ref_${generateUuid().replace(/-/g, '')}`,
        scope: scopes,
        id_token: generateMockJwt(config.clientId, 'openid profile', expiresIn + 3600)
      };

      addLog(`HTTP/1.1 200 OK`, 'res');
      addLog(`Content-Type: application/json`, 'res');
      addLog(`Received Access Token (JWT) and Refresh Token`, 'info');

      setTokenData(mockResponse);
      setTimeLeft(expiresIn);
    } catch (err: any) {
      addLog(`HTTP/1.1 400 Bad Request`, 'res');
      addLog(`Error: ${err.message}`, 'err');
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  };

  const decodedToken = tokenData ? decodeJwt(tokenData.access_token) : null;

  return (
    <div className="min-h-screen bg-[#020617] text-slate-300 p-6 font-sans selection:bg-blue-500/30">
      {/* Header */}
      <div className="max-w-7xl mx-auto mb-8 flex items-center justify-between">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-blue-600 p-2 rounded-lg shadow-[0_0_15px_rgba(37,99,235,0.5)]">
              <Shield className="text-white" size={24} />
            </div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Chase OAuth 2.0 Token Studio</h1>
          </div>
          <p className="text-slate-400 text-sm max-w-2xl">
            Comprehensive token exchange manager for <code className="text-blue-400 bg-blue-900/20 px-1.5 py-0.5 rounded">/api/identity/auth/v1/oauth2/token/us/gcb</code>. 
            Validate authorization codes, inspect JWTs, and manage session lifecycles for the Loyalty Pay with Points Enrollment Service.
          </p>
        </div>
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
            <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
            API Gateway Online
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-[#1e293b] text-slate-300 border border-[#334155] rounded-full">
            <Globe size={14} />
            Environment: Sandbox
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration */}
        <div className="lg:col-span-4 flex flex-col gap-6">
          <Card title="Client Configuration" icon={Code}>
            <InputGroup 
              label="Client ID" 
              icon={Server} 
              value={config.clientId} 
              onChange={(v: string) => setConfig({...config, clientId: v})} 
            />
            <InputGroup 
              label="Client Secret" 
              icon={Key} 
              isSecret 
              value={config.clientSecret} 
              onChange={(v: string) => setConfig({...config, clientSecret: v})} 
            />
            <InputGroup 
              label="Redirect URI" 
              icon={Globe} 
              value={config.redirectUri} 
              onChange={(v: string) => setConfig({...config, redirectUri: v})} 
            />
          </Card>

          <Card title="Authorization Grant" icon={Lock}>
            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5 ml-1">Grant Type</label>
              <select 
                value={config.grantType}
                onChange={(e) => setConfig({...config, grantType: e.target.value})}
                className="block w-full px-3 py-2.5 bg-[#1e293b] border border-[#334155] rounded-lg text-sm text-slate-200 focus:ring-2 focus:ring-blue-500/50 focus:border-blue-500 outline-none appearance-none"
              >
                <option value="authorization_code">Authorization Code</option>
                <option value="client_credentials">Client Credentials</option>
                <option value="refresh_token">Refresh Token</option>
              </select>
            </div>
            <InputGroup 
              label="Authorization Code" 
              icon={Zap} 
              value={config.authCode} 
              onChange={(v: string) => setConfig({...config, authCode: v})} 
            />
            
            <button
              onClick={handleExchange}
              disabled={loading}
              className="w-full mt-2 bg-blue-600 hover:bg-blue-500 text-white font-medium py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(37,99,235,0.2)] hover:shadow-[0_0_25px_rgba(37,99,235,0.4)]"
            >
              {loading ? (
                <RefreshCw size={18} className="animate-spin" />
              ) : (
                <Activity size={18} />
              )}
              {loading ? 'Exchanging Token...' : 'Execute Token Exchange'}
            </button>

            {error && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2 text-red-400 text-sm">
                <AlertCircle size={16} className="mt-0.5 shrink-0" />
                <p>{error}</p>
              </div>
            )}
          </Card>
        </div>

        {/* Right Column: Results & Inspection */}
        <div className="lg:col-span-8 flex flex-col gap-6">
          
          {/* Token Status Bar */}
          <div className="bg-[#0f172a] border border-[#1e293b] rounded-xl p-4 flex items-center justify-between shadow-lg">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Status</p>
                <div className="flex items-center gap-2">
                  {tokenData ? (
                    <span className="flex items-center gap-1.5 text-emerald-400 font-medium text-sm">
                      <CheckCircle size={16} /> Active Session
                    </span>
                  ) : (
                    <span className="flex items-center gap-1.5 text-slate-500 font-medium text-sm">
                      <Clock size={16} /> Awaiting Exchange
                    </span>
                  )}
                </div>
              </div>
              <div className="w-px h-8 bg-[#1e293b]"></div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Time Remaining</p>
                <div className={`font-mono text-lg font-medium ${timeLeft > 300 ? 'text-blue-400' : timeLeft > 0 ? 'text-amber-400' : 'text-slate-600'}`}>
                  {tokenData ? formatTime(timeLeft) : '--:--'}
                </div>
              </div>
              <div className="w-px h-8 bg-[#1e293b]"></div>
              <div>
                <p className="text-xs text-slate-500 font-medium uppercase tracking-wider mb-1">Token Type</p>
                <div className="text-sm font-medium text-slate-300">
                  {tokenData ? tokenData.token_type : '---'}
                </div>
              </div>
            </div>
            
            {tokenData && (
              <button 
                onClick={() => setTokenData(null)}
                className="px-4 py-2 bg-[#1e293b] hover:bg-[#334155] text-slate-300 text-sm font-medium rounded-lg transition-colors border border-[#334155]"
              >
                Revoke Token
              </button>
            )}
          </div>

          {/* Main Inspection Area */}
          <Card 
            title="Token Inspector & Logs" 
            icon={Database}
            className="flex-1 min-h-[500px]"
            action={
              <div className="flex bg-[#1e293b] rounded-lg p-1 border border-[#334155]">
                <button
                  onClick={() => setActiveTab('inspector')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'inspector' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  JWT Inspector
                </button>
                <button
                  onClick={() => setActiveTab('logs')}
                  className={`px-3 py-1 text-xs font-medium rounded-md transition-colors ${activeTab === 'logs' ? 'bg-blue-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
                >
                  Network Logs
                </button>
              </div>
            }
          >
            {activeTab === 'inspector' ? (
              <div className="flex flex-col h-full gap-4">
                {tokenData ? (
                  <>
                    {/* Raw Token */}
                    <div>
                      <div className="flex items-center justify-between mb-2">
                        <label className="text-xs font-medium text-slate-400">Raw Access Token</label>
                        <button 
                          onClick={() => copyToClipboard(tokenData.access_token)}
                          className="text-xs flex items-center gap-1 text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          {copiedToken ? <Check size={14} /> : <Copy size={14} />}
                          {copiedToken ? 'Copied!' : 'Copy'}
                        </button>
                      </div>
                      <div className="bg-[#0b1120] border border-[#1e293b] rounded-lg p-3 font-mono text-xs break-all text-slate-400 leading-relaxed">
                        <span className="text-pink-400">{tokenData.access_token.split('.')[0]}</span>
                        <span className="text-slate-500">.</span>
                        <span className="text-purple-400">{tokenData.access_token.split('.')[1]}</span>
                        <span className="text-slate-500">.</span>
                        <span className="text-emerald-400">{tokenData.access_token.split('.')[2]}</span>
                      </div>
                    </div>

                    {/* Scopes */}
                    <div>
                      <label className="text-xs font-medium text-slate-400 mb-2 block">Granted Scopes</label>
                      <div className="flex flex-wrap gap-2">
                        {tokenData.scope.split(' ').map(scope => (
                          <span key={scope} className="px-2.5 py-1 bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs rounded-md font-mono">
                            {scope}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Decoded JWT */}
                    <div className="flex-1 grid grid-cols-2 gap-4 min-h-[200px]">
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-400 mb-2 block">Header (JOSE)</label>
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <JsonViewer data={decodedToken?.header} />
                        </div>
                      </div>
                      <div className="flex flex-col">
                        <label className="text-xs font-medium text-slate-400 mb-2 block">Payload (Claims)</label>
                        <div className="flex-1 overflow-hidden flex flex-col">
                          <JsonViewer data={decodedToken?.payload} />
                        </div>
                      </div>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-3">
                    <Shield size={48} className="opacity-20" />
                    <p className="text-sm">Execute a token exchange to inspect the JWT payload.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 bg-[#0b1120] border border-[#1e293b] rounded-lg p-4 font-mono text-xs overflow-y-auto flex flex-col">
                {logs.length === 0 ? (
                  <div className="flex-1 flex items-center justify-center text-slate-600">
                    No network activity yet.
                  </div>
                ) : (
                  <div className="space-y-1.5">
                    {logs.map((log, i) => {
                      let colorClass = 'text-slate-400';
                      if (log.includes('→')) colorClass = 'text-blue-400';
                      if (log.includes('←')) colorClass = 'text-emerald-400';
                      if (log.includes('✖') || log.includes('400')) colorClass = 'text-red-400';
                      if (log.includes('ℹ')) colorClass = 'text-amber-400';
                      
                      return (
                        <div key={i} className={`${colorClass} break-all`}>
                          {log}
                        </div>
                      );
                    })}
                    <div ref={logsEndRef} />
                  </div>
                )}
              </div>
            )}
          </Card>
        </div>
      </div>
    </div>
  );
}