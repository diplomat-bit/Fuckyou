import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Globe, 
  Building, 
  Key, 
  Lock, 
  Send, 
  RefreshCw, 
  Clock, 
  Check, 
  Copy, 
  Terminal, 
  Eye, 
  EyeOff, 
  Plus, 
  Trash2, 
  Settings, 
  Code, 
  Cpu, 
  AlertCircle, 
  ShieldCheck,
  ChevronRight,
  Info,
  Play,
  Square,
  Sparkles
} from 'lucide-react';

// --- Types & Interfaces ---
interface Country {
  code: string;
  name: string;
  flag: string;
  endpoint: string;
}

interface BusinessUnit {
  id: string;
  name: string;
  icon: string;
  audience: string;
}

interface ScopeOption {
  name: string;
  description: string;
}

interface CustomParam {
  key: string;
  value: string;
}

interface LogEntry {
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

// --- Mock Data ---
const COUNTRIES: Country[] = [
  { code: 'US', name: 'United States', flag: '🇺🇸', endpoint: 'https://api.us.auth-gateway.com/v2/oauth/token' },
  { code: 'GB', name: 'United Kingdom', flag: '🇬🇧', endpoint: 'https://api.uk.auth-gateway.com/v2/oauth/token' },
  { code: 'DE', name: 'Germany (EU)', flag: '🇩🇪', endpoint: 'https://api.eu.auth-gateway.com/v2/oauth/token' },
  { code: 'SG', name: 'Singapore', flag: '🇸🇬', endpoint: 'https://api.sg.auth-gateway.com/v2/oauth/token' },
  { code: 'AU', name: 'Australia', flag: '🇦🇺', endpoint: 'https://api.au.auth-gateway.com/v2/oauth/token' },
];

const BUSINESS_UNITS: BusinessUnit[] = [
  { id: 'retail', name: 'Retail Banking', icon: 'Building', audience: 'https://api.bank.com/retail' },
  { id: 'wealth', name: 'Wealth Management', icon: 'Sparkles', audience: 'https://api.bank.com/wealth' },
  { id: 'corporate', name: 'Corporate & Investment', icon: 'Cpu', audience: 'https://api.bank.com/corporate' },
  { id: 'insurance', name: 'Insurance Services', icon: 'ShieldCheck', audience: 'https://api.bank.com/insurance' },
];

const PRESET_SCOPES: ScopeOption[] = [
  { name: 'accounts.read', description: 'Read access to account details and balances' },
  { name: 'payments.write', description: 'Initiate and authorize outbound payments' },
  { name: 'customers.read', description: 'Retrieve customer profile and KYC details' },
  { name: 'transactions.history', description: 'Access historical transaction ledgers' },
  { name: 'offline_access', description: 'Request offline access / refresh tokens' },
];

export default function OauthClientCredentialsDashboard() {
  // --- State Management ---
  const [selectedCountry, setSelectedCountry] = useState<Country>(COUNTRIES[0]);
  const [selectedBU, setSelectedBU] = useState<BusinessUnit>(BUSINESS_UNITS[0]);
  
  const [clientId, setClientId] = useState('client_id_sandbox_9f82a1bc');
  const [clientSecret, setClientSecret] = useState('client_secret_sandbox_7d3e91fa82bc4019de82');
  const [showSecret, setShowSecret] = useState(false);
  
  const [selectedScopes, setSelectedScopes] = useState<string[]>(['accounts.read', 'customers.read']);
  const [customParams, setCustomParams] = useState<CustomParam[]>([
    { key: 'environment', value: 'sandbox' }
  ]);

  // Simulator & Response States
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationProgress, setSimulationProgress] = useState(0);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [responseToken, setResponseToken] = useState<any>(null);
  const [responseHeaders, setResponseHeaders] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'response' | 'headers' | 'decoded'>('response');

  // Timer States
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [maxTime, setMaxTime] = useState<number>(60); // Default 60s for demo, can be 3600s
  const [isTimerActive, setIsTimerActive] = useState(false);
  const [autoRefresh, setAutoRefresh] = useState(false);

  // UI Feedback States
  const [copiedText, setCopiedText] = useState<string | null>(null);

  const logEndRef = useRef<HTMLDivElement>(null);

  // --- Helper: Base64 Basic Auth Generator ---
  const basicAuthHeader = useMemo(() => {
    try {
      const credentials = `${clientId}:${clientSecret}`;
      return `Basic ${btoa(credentials)}`;
    } catch (e) {
      return 'Basic [Invalid Characters]';
    }
  }, [clientId, clientSecret]);

  // --- Helper: Request Payload Generator ---
  const requestPayload = useMemo(() => {
    const params = new URLSearchParams();
    params.append('grant_type', 'client_credentials');
    if (selectedScopes.length > 0) {
      params.append('scope', selectedScopes.join(' '));
    }
    params.append('audience', selectedBU.audience);
    customParams.forEach(param => {
      if (param.key.trim()) {
        params.append(param.key.trim(), param.value);
      }
    });
    return params.toString();
  }, [selectedScopes, selectedBU, customParams]);

  // --- Helper: Decoded JWT Mock ---
  const decodedToken = useMemo(() => {
    if (!responseToken || !responseToken.access_token) return null;
    return {
      header: {
        alg: "RS256",
        typ: "JWT",
        kid: "auth-key-v2"
      },
      payload: {
        iss: selectedCountry.endpoint,
        sub: clientId,
        aud: selectedBU.audience,
        exp: Math.floor(Date.now() / 1000) + timeLeft,
        iat: Math.floor(Date.now() / 1000),
        jti: "8f92c1b0-92a1-4b3c-8d1e-7f6a5b4c3d2e",
        scopes: selectedScopes,
        business_unit: selectedBU.id,
        country: selectedCountry.code,
        client_metadata: {
          env: "sandbox",
          generated_via: "Developer Playground"
        }
      },
      signature: "SgV4b3...[Verified Signature]"
    };
  }, [responseToken, timeLeft, selectedCountry, selectedBU, clientId, selectedScopes]);

  // --- Logger Utility ---
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString([], { hour12: false });
    setLogs(prev => [...prev, { timestamp, type, message }]);
  };

  // Auto-scroll logs
  useEffect(() => {
    logEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // --- Token Expiration Timer Logic ---
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (isTimerActive && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            setIsTimerActive(false);
            addLog("Access token has expired.", "warning");
            if (autoRefresh) {
              addLog("Auto-refresh enabled. Triggering token renewal...", "info");
              triggerSimulation();
            }
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isTimerActive, timeLeft, autoRefresh]);

  // --- Copy to Clipboard Helper ---
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // --- Custom Parameters Handlers ---
  const handleAddParam = () => {
    setCustomParams([...customParams, { key: '', value: '' }]);
  };

  const handleRemoveParam = (index: number) => {
    const updated = [...customParams];
    updated.splice(index, 1);
    setCustomParams(updated);
  };

  const handleParamChange = (index: number, field: 'key' | 'value', val: string) => {
    const updated = [...customParams];
    updated[index][field] = val;
    setCustomParams(updated);
  };

  // --- Scope Selection Handler ---
  const toggleScope = (scopeName: string) => {
    if (selectedScopes.includes(scopeName)) {
      setSelectedScopes(selectedScopes.filter(s => s !== scopeName));
    } else {
      setSelectedScopes([...selectedScopes, scopeName]);
    }
  };

  // --- Simulator Trigger ---
  const triggerSimulation = () => {
    if (isSimulating) return;
    
    setIsSimulating(true);
    setSimulationProgress(10);
    setLogs([]);
    
    addLog(`Initiating Client Credentials Grant Flow [${selectedCountry.code} - ${selectedBU.name}]`, 'info');
    
    setTimeout(() => {
      setSimulationProgress(30);
      addLog(`Resolving token endpoint: ${selectedCountry.endpoint}`, 'info');
      addLog(`Encoding credentials using Basic Auth scheme...`, 'info');
    }, 400);

    setTimeout(() => {
      setSimulationProgress(60);
      addLog(`POST request dispatched with payload: ${requestPayload.substring(0, 60)}...`, 'info');
      addLog(`Authorization Header: ${basicAuthHeader.substring(0, 20)}...`, 'info');
    }, 900);

    setTimeout(() => {
      setSimulationProgress(85);
      addLog(`Validating Client ID and Secret against Identity Provider database...`, 'info');
    }, 1400);

    setTimeout(() => {
      setSimulationProgress(100);
      const mockToken = `eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImF1dGgta2V5LXYyIn0.${btoa(JSON.stringify({
        iss: selectedCountry.endpoint,
        sub: clientId,
        exp: Math.floor(Date.now() / 1000) + 60,
        scopes: selectedScopes
      }))}.signature_hash_xyz`;

      setResponseToken({
        access_token: mockToken,
        token_type: "Bearer",
        expires_in: 60,
        scope: selectedScopes.join(' '),
        issued_at: new Date().toISOString(),
        refresh_token_available: false
      });

      setResponseHeaders({
        "Content-Type": "application/json;charset=UTF-8",
        "Cache-Control": "no-store",
        "Pragma": "no-cache",
        "X-Content-Type-Options": "nosniff",
        "X-Frame-Options": "DENY",
        "Server": "OAuth-Gateway-Engine/4.2.1"
      });

      addLog(`Token successfully issued! HTTP 200 OK`, 'success');
      setIsSimulating(false);
      
      // Start countdown
      setTimeLeft(60);
      setMaxTime(60);
      setIsTimerActive(true);
    }, 2000);
  };

  const handleRevokeToken = () => {
    setResponseToken(null);
    setResponseHeaders(null);
    setTimeLeft(0);
    setIsTimerActive(false);
    addLog("Token revoked by developer.", "warning");
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased p-4 md:p-8">
      {/* Header Section */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Cpu className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
                OAuth 2.0 Client Credentials Playground
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                A master developer dashboard for testing, generating, and inspecting machine-to-machine authorization flows.
              </p>
            </div>
          </div>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-xl border border-slate-800">
          <span className="text-xs font-semibold text-slate-400 px-3">ENVIRONMENT:</span>
          <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-3 py-1.5 rounded-lg border border-emerald-500/20 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            SANDBOX GATEWAY
          </span>
        </div>
      </header>

      {/* Main Grid Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: Configuration & Payload Builder (7 Cols) */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* 1. Country & Business Unit Selector */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500"></div>
            <div className="flex items-center gap-2 mb-4">
              <Globe className="w-5 h-5 text-indigo-400" />
              <h2 className="text-lg font-semibold text-slate-200">Gateway Target Configuration</h2>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Country Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Target Region / Country
                </label>
                <div className="relative">
                  <select
                    value={selectedCountry.code}
                    onChange={(e) => {
                      const country = COUNTRIES.find(c => c.code === e.target.value);
                      if (country) {
                        setSelectedCountry(country);
                        addLog(`Switched target region to ${country.name}`, 'info');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    {COUNTRIES.map(c => (
                      <option key={c.code} value={c.code}>
                        {c.flag} &nbsp; {c.name} ({c.code})
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronRight className="w-4 h-4 transform rotate-90" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 truncate">
                  Endpoint: <code className="text-indigo-400">{selectedCountry.endpoint}</code>
                </p>
              </div>

              {/* Business Unit Selector */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Business Unit (Audience)
                </label>
                <div className="relative">
                  <select
                    value={selectedBU.id}
                    onChange={(e) => {
                      const bu = BUSINESS_UNITS.find(b => b.id === e.target.value);
                      if (bu) {
                        setSelectedBU(bu);
                        addLog(`Switched business unit to ${bu.name}`, 'info');
                      }
                    }}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-slate-200 focus:outline-none focus:ring-2 focus:ring-indigo-500 appearance-none cursor-pointer"
                  >
                    {BUSINESS_UNITS.map(bu => (
                      <option key={bu.id} value={bu.id}>
                        {bu.name}
                      </option>
                    ))}
                  </select>
                  <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                    <ChevronRight className="w-4 h-4 transform rotate-90" />
                  </div>
                </div>
                <p className="text-xs text-slate-500 mt-1.5 truncate">
                  Audience: <code className="text-purple-400">{selectedBU.audience}</code>
                </p>
              </div>
            </div>
          </section>

          {/* 2. Credentials & Basic Auth Generator */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-purple-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Key className="w-5 h-5 text-purple-400" />
                <h2 className="text-lg font-semibold text-slate-200">Client Credentials & Basic Auth</h2>
              </div>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Info className="w-3.5 h-3.5" /> Auto-encoded to Base64
              </span>
            </div>

            <div className="space-y-4">
              {/* Client ID */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Client ID
                </label>
                <div className="relative">
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-10 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter Client ID"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center text-slate-500">
                    <Lock className="w-4 h-4" />
                  </div>
                </div>
              </div>

              {/* Client Secret */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Client Secret
                </label>
                <div className="relative">
                  <input
                    type={showSecret ? "text" : "password"}
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-4 pr-20 py-2.5 text-slate-200 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Enter Client Secret"
                  />
                  <div className="absolute inset-y-0 right-3 flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-slate-400 hover:text-slate-200 transition-colors"
                    >
                      {showSecret ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Generated Basic Auth Header */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 mt-2">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Generated Authorization Header
                  </span>
                  <button
                    onClick={() => handleCopy(basicAuthHeader, 'auth_header')}
                    className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedText === 'auth_header' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Header</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 break-all bg-slate-900/50 p-2.5 rounded border border-slate-800">
                  <span className="text-purple-400">Authorization:</span> {basicAuthHeader}
                </div>
              </div>
            </div>
          </section>

          {/* 3. Request Payload Builder */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-pink-500"></div>
            <div className="flex items-center gap-2 mb-4">
              <Code className="w-5 h-5 text-pink-400" />
              <h2 className="text-lg font-semibold text-slate-200">Request Payload Builder</h2>
            </div>

            <div className="space-y-5">
              {/* Grant Type (Read-only for Client Credentials) */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">
                  Grant Type
                </label>
                <input
                  type="text"
                  value="client_credentials"
                  disabled
                  className="w-full bg-slate-950/50 border border-slate-800/80 rounded-xl px-4 py-2.5 text-slate-400 font-mono text-sm cursor-not-allowed"
                />
              </div>

              {/* Scopes Multi-select */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                  Scopes (Permissions)
                </label>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                  {PRESET_SCOPES.map(scope => {
                    const isSelected = selectedScopes.includes(scope.name);
                    return (
                      <button
                        key={scope.name}
                        type="button"
                        onClick={() => toggleScope(scope.name)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between ${
                          isSelected 
                            ? 'bg-pink-500/10 border-pink-500/40 text-pink-200' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex justify-between items-center w-full">
                          <span className="font-mono text-xs font-bold">{scope.name}</span>
                          <div className={`w-4 h-4 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-pink-400 bg-pink-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                          </div>
                        </div>
                        <span className="text-[11px] text-slate-500 mt-1 leading-tight">
                          {scope.description}
                        </span>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Custom Parameters */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Custom Request Parameters
                  </label>
                  <button
                    type="button"
                    onClick={handleAddParam}
                    className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Parameter
                  </button>
                </div>

                {customParams.length === 0 ? (
                  <div className="text-center py-4 bg-slate-950 rounded-xl border border-dashed border-slate-800 text-slate-500 text-xs">
                    No custom parameters added.
                  </div>
                ) : (
                  <div className="space-y-2">
                    {customParams.map((param, idx) => (
                      <div key={idx} className="flex items-center gap-2">
                        <input
                          type="text"
                          placeholder="Key"
                          value={param.key}
                          onChange={(e) => handleParamChange(idx, 'key', e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        />
                        <input
                          type="text"
                          placeholder="Value"
                          value={param.value}
                          onChange={(e) => handleParamChange(idx, 'value', e.target.value)}
                          className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:ring-1 focus:ring-pink-500"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveParam(idx)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Raw Request Payload Preview */}
              <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80">
                <div className="flex justify-between items-center mb-2">
                  <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    Form-Urlencoded Payload Preview
                  </span>
                  <button
                    onClick={() => handleCopy(requestPayload, 'payload')}
                    className="text-xs text-pink-400 hover:text-pink-300 flex items-center gap-1 transition-colors"
                  >
                    {copiedText === 'payload' ? (
                      <>
                        <Check className="w-3.5 h-3.5 text-emerald-400" />
                        <span className="text-emerald-400">Copied!</span>
                      </>
                    ) : (
                      <>
                        <Copy className="w-3.5 h-3.5" />
                        <span>Copy Payload</span>
                      </>
                    )}
                  </button>
                </div>
                <div className="font-mono text-xs text-slate-300 break-all bg-slate-900/50 p-2.5 rounded border border-slate-800">
                  {requestPayload}
                </div>
              </div>
            </div>
          </section>

        </div>

        {/* RIGHT COLUMN: Simulator, Response Inspector & Timer (5 Cols) */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* 1. Simulator Panel */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-emerald-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-slate-200">Request Simulator</h2>
              </div>
              <span className="text-xs bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-400 font-mono">
                POST
              </span>
            </div>

            {/* Action Button */}
            <button
              type="button"
              onClick={triggerSimulation}
              disabled={isSimulating}
              className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm flex items-center justify-center gap-2 transition-all shadow-lg ${
                isSimulating 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-slate-950 font-bold active:scale-[0.98]'
              }`}
            >
              {isSimulating ? (
                <>
                  <RefreshCw className="w-4.5 h-4.5 animate-spin" />
                  <span>Simulating Request...</span>
                </>
              ) : (
                <>
                  <Send className="w-4.5 h-4.5" />
                  <span>Execute Client Credentials Flow</span>
                </>
              )}
            </button>

            {/* Progress Bar */}
            {isSimulating && (
              <div className="mt-4">
                <div className="w-full bg-slate-950 rounded-full h-1.5 overflow-hidden border border-slate-800">
                  <div 
                    className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full transition-all duration-300"
                    style={{ width: `${simulationProgress}%` }}
                  ></div>
                </div>
              </div>
            )}

            {/* Console Logs */}
            <div className="mt-4 bg-slate-950 rounded-xl border border-slate-800 p-4">
              <div className="flex justify-between items-center mb-2 border-b border-slate-800/60 pb-2">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400"></span>
                  Console Output
                </span>
                <button 
                  onClick={() => setLogs([])}
                  className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
                >
                  Clear Logs
                </button>
              </div>
              <div className="h-40 overflow-y-auto font-mono text-[11px] space-y-1.5 scrollbar-thin scrollbar-thumb-slate-800">
                {logs.length === 0 ? (
                  <div className="text-slate-600 italic py-8 text-center">
                    Ready to dispatch request. Click "Execute" above.
                  </div>
                ) : (
                  logs.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-slate-600 shrink-0">[{log.timestamp}]</span>
                      <span className={`
                        ${log.type === 'success' ? 'text-emerald-400' : ''}
                        ${log.type === 'warning' ? 'text-amber-400' : ''}
                        ${log.type === 'error' ? 'text-rose-400' : ''}
                        ${log.type === 'info' ? 'text-slate-300' : ''}
                      `}>
                        {log.message}
                      </span>
                    </div>
                  ))
                )}
                <div ref={logEndRef} />
              </div>
            </div>
          </section>

          {/* 2. Token Expiration Timer */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-amber-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Clock className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-semibold text-slate-200">Token Expiration Timer</h2>
              </div>
              {timeLeft > 0 && (
                <span className="bg-emerald-500/10 text-emerald-400 text-xs font-bold px-2 py-0.5 rounded border border-emerald-500/20">
                  ACTIVE
                </span>
              )}
            </div>

            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 space-y-4">
              {/* Countdown Display */}
              <div className="flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 block">Time Remaining</span>
                  <span className="text-2xl font-mono font-bold text-slate-100">
                    {timeLeft > 0 ? `${timeLeft}s` : '00s (No Active Token)'}
                  </span>
                </div>
                
                {/* Circular/Linear Progress Visual */}
                <div className="w-2/3">
                  <div className="w-full bg-slate-900 rounded-full h-3 overflow-hidden border border-slate-800">
                    <div 
                      className={`h-full transition-all duration-1000 ${
                        timeLeft > 20 ? 'bg-emerald-500' : timeLeft > 5 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${(timeLeft / maxTime) * 100}%` }}
                    ></div>
                  </div>
                  <div className="flex justify-between text-[10px] text-slate-500 mt-1">
                    <span>Expired</span>
                    <span>{maxTime}s Max</span>
                  </div>
                </div>
              </div>

              {/* Auto-Refresh Toggle & Revoke */}
              <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 pt-2 border-t border-slate-900">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={autoRefresh}
                    onChange={(e) => setAutoRefresh(e.target.checked)}
                    className="rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950"
                  />
                  <span className="text-xs text-slate-300 font-medium">Auto-refresh on expiry</span>
                </label>

                {timeLeft > 0 && (
                  <button
                    type="button"
                    onClick={handleRevokeToken}
                    className="text-xs bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/20 px-3 py-1.5 rounded-lg transition-colors"
                  >
                    Revoke Token
                  </button>
                )}
              </div>
            </div>
          </section>

          {/* 3. Response Inspector */}
          <section className="bg-slate-900 rounded-2xl border border-slate-800 p-6 shadow-xl relative overflow-hidden">
            <div className="absolute top-0 left-0 w-1 h-full bg-blue-500"></div>
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Code className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-slate-200">Response Inspector</h2>
              </div>
            </div>

            {/* Tabs */}
            <div className="flex border-b border-slate-800 mb-4">
              <button
                onClick={() => setActiveTab('response')}
                className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'response' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                JSON Response
              </button>
              <button
                onClick={() => setActiveTab('decoded')}
                className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'decoded' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Decoded JWT
              </button>
              <button
                onClick={() => setActiveTab('headers')}
                className={`flex-1 pb-2 text-xs font-semibold border-b-2 transition-colors ${
                  activeTab === 'headers' 
                    ? 'border-blue-500 text-blue-400' 
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Headers
              </button>
            </div>

            {/* Tab Content */}
            <div className="bg-slate-950 rounded-xl p-4 border border-slate-800/80 min-h-[220px] flex flex-col justify-between">
              {responseToken ? (
                <>
                  <div className="font-mono text-xs text-slate-300 overflow-x-auto max-h-60 scrollbar-thin scrollbar-thumb-slate-800">
                    {activeTab === 'response' && (
                      <pre className="text-emerald-400">
                        {JSON.stringify(responseToken, null, 2)}
                      </pre>
                    )}
                    {activeTab === 'decoded' && decodedToken && (
                      <div className="space-y-3">
                        <div>
                          <span className="text-rose-400 font-bold">// Header</span>
                          <pre className="text-slate-400">{JSON.stringify(decodedToken.header, null, 2)}</pre>
                        </div>
                        <div>
                          <span className="text-indigo-400 font-bold">// Payload</span>
                          <pre className="text-slate-300">{JSON.stringify(decodedToken.payload, null, 2)}</pre>
                        </div>
                        <div>
                          <span className="text-amber-400 font-bold">// Signature</span>
                          <pre className="text-slate-500">{decodedToken.signature}</pre>
                        </div>
                      </div>
                    )}
                    {activeTab === 'headers' && responseHeaders && (
                      <pre className="text-blue-400">
                        {JSON.stringify(responseHeaders, null, 2)}
                      </pre>
                    )}
                  </div>

                  {/* Copy Active Tab Content */}
                  <div className="mt-4 pt-3 border-t border-slate-900 flex justify-end">
                    <button
                      onClick={() => {
                        const content = activeTab === 'response' 
                          ? JSON.stringify(responseToken, null, 2)
                          : activeTab === 'decoded' 
                          ? JSON.stringify(decodedToken, null, 2)
                          : JSON.stringify(responseHeaders, null, 2);
                        handleCopy(content, 'inspector');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1 transition-colors"
                    >
                      {copiedText === 'inspector' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied!</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy Active View</span>
                        </>
                      )}
                    </button>
                  </div>
                </>
              ) : (
                <div className="flex flex-col items-center justify-center text-center py-12 text-slate-500">
                  <AlertCircle className="w-8 h-8 mb-2 text-slate-600" />
                  <p className="text-xs">No active token session.</p>
                  <p className="text-[11px] text-slate-600 mt-1">Execute the simulator to generate and inspect OAuth tokens.</p>
                </div>
              )}
            </div>
          </section>

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-900 text-center text-xs text-slate-500">
        <p>© {new Date().getFullYear()} Developer Playground. Built for secure, high-performance API integration testing.</p>
      </footer>
    </div>
  );
}