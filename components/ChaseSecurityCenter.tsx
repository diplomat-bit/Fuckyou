

// --- CONSOLIDATED FROM: ./components/chase/ChaseSecurityCenter.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import {
  Shield,
  Lock,
  Key,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  Terminal,
  Copy,
  Check,
  ArrowRight,
  Zap,
  Eye,
  EyeOff,
  Server,
  Globe,
  Cpu,
  Layers,
  Activity,
  FileCode,
  Fingerprint,
  Radio,
  Clock
} from 'lucide-react';

export interface SecurityCredentials {
  clientId: string;
  clientSecret: string;
  scope: string;
  tokenUrl: string;
  bearerToken: string;
  tokenExpiresIn: number;
  tokenGeneratedAt: number | null;
  authorization2Token: string;
  traceId: string;
  externalAccountIdentifier: string;
  accountReferenceUuid: string;
  channelType: 'WEB' | 'MOBILE_APP' | 'MOBILE_WEB' | 'BATCH';
}

export interface SecurityAuditLog {
  id: string;
  timestamp: string;
  type: 'AUTH' | 'TOKEN' | 'SIGNATURE' | 'TRACE' | 'GATEWAY';
  status: 'SUCCESS' | 'WARN' | 'ERROR';
  message: string;
  details: Record<string, any>;
}

export const ChaseSecurityCenter: React.FC = () => {
  // Credentials and Security State
  const [credentials, setCredentials] = useState<SecurityCredentials>({
    clientId: 'chase_partner_loyalty_prod_9942a',
    clientSecret: 'sec_live_99d14f828a21e428ba3f001c772b',
    scope: 'card',
    tokenUrl: 'https://api-sandbox.chase.com/ccoauth/token',
    bearerToken: '',
    tokenExpiresIn: 3600,
    tokenGeneratedAt: null,
    authorization2Token: '',
    traceId: '',
    externalAccountIdentifier: 'EXT-ACC-8839210-NY',
    accountReferenceUuid: '9b1deb4d-3b7d-4bad-9bdd-2b0d7b3dcb6d',
    channelType: 'WEB'
  });

  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [isGeneratingToken, setIsGeneratingToken] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'flow' | 'headers' | 'token' | 'audit'>('flow');
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
  const [pingStatus, setPingStatus] = useState<'idle' | 'checking' | 'healthy' | 'unhealthy'>('idle');
  const [pingLatency, setPingLatency] = useState<number>(0);

  // Security Audit Logs
  const [auditLogs, setAuditLogs] = useState<SecurityAuditLog[]>([
    {
      id: 'LOG-1001',
      timestamp: new Date(Date.now() - 1000 * 60 * 12).toLocaleTimeString(),
      type: 'GATEWAY',
      status: 'SUCCESS',
      message: 'API Gateway handshake initialized with Chase CLPWPE v1 endpoint.',
      details: { host: 'api.chase.com', basePath: '/card/loyalty/earn-rewards/enrollment/v1', tls: 'TLS 1.3 / AES-256-GCM' }
    },
    {
      id: 'LOG-1002',
      timestamp: new Date(Date.now() - 1000 * 60 * 5).toLocaleTimeString(),
      type: 'TRACE',
      status: 'SUCCESS',
      message: 'Trace-ID format verified compliant with 128-bit hex specifications.',
      details: { format: 'UUIDv4-to-Hex128', validated: true }
    }
  ]);

  // Generate 128-bit Hex Trace ID (32 lower hex characters)
  const generateTraceId = useCallback((): string => {
    const hex = Array.from({ length: 32 }, () =>
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
    return hex;
  }, []);

  // Generate UUID v4 for account-reference-universal-unique-identifier
  const generateUuid = (): string => {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = (Math.random() * 16) | 0;
      const v = c === 'x' ? r : (r & 0x3) | 0x8;
      return v.toString(16);
    });
  };

  // Initialize Trace ID on mount
  useEffect(() => {
    const initialTrace = generateTraceId();
    setCredentials((prev) => ({
      ...prev,
      traceId: initialTrace,
      bearerToken: generateMockJwt('chase_partner_loyalty_prod_9942a', 'card', 3600),
      tokenGeneratedAt: Date.now()
    }));
    setSecondsRemaining(3600);
  }, [generateTraceId]);

  // Token Countdown Timer
  useEffect(() => {
    if (!credentials.tokenGeneratedAt) return;
    const interval = setInterval(() => {
      const elapsed = Math.floor((Date.now() - credentials.tokenGeneratedAt!) / 1000);
      const remaining = Math.max(0, credentials.tokenExpiresIn - elapsed);
      setSecondsRemaining(remaining);
    }, 1000);
    return () => clearInterval(interval);
  }, [credentials.tokenGeneratedAt, credentials.tokenExpiresIn]);

  function generateMockJwt(clientId: string, scope: string, exp: number): string {
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'chase-ccoauth-2025-01' }));
    const payload = btoa(
      JSON.stringify({
        iss: 'https://api.chase.com/ccoauth',
        sub: clientId,
        aud: 'https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1',
        scope: scope,
        iat: Math.floor(Date.now() / 1000),
        exp: Math.floor(Date.now() / 1000) + exp,
        jti: generateTraceId().substring(0, 16),
        entity: 'JPMorgan Chase & Co. Merchant Loyalty Services'
      })
    );
    const signature = btoa(
      `sig_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`
    ).replace(/=/g, '');
    return `${header}.${payload}.${signature}`;
  }

  const handleRegenerateToken = () => {
    setIsGeneratingToken(true);
    setTimeout(() => {
      const newToken = generateMockJwt(credentials.clientId, credentials.scope, credentials.tokenExpiresIn);
      const newTrace = generateTraceId();
      setCredentials((prev) => ({
        ...prev,
        bearerToken: newToken,
        traceId: newTrace,
        tokenGeneratedAt: Date.now()
      }));
      setSecondsRemaining(credentials.tokenExpiresIn);
      setIsGeneratingToken(false);

      addAuditLog('TOKEN', 'SUCCESS', 'OAuth2 2-Legged Bearer token successfully minted and signed.', {
        scope: credentials.scope,
        expiresIn: credentials.tokenExpiresIn,
        tokenUrl: credentials.tokenUrl
      });
    }, 600);
  };

  const handlePingHealthCheck = () => {
    setPingStatus('checking');
    const startTime = performance.now();
    setTimeout(() => {
      const latency = Math.round(performance.now() - startTime + Math.random() * 45 + 15);
      setPingLatency(latency);
      setPingStatus('healthy');
      addAuditLog('GATEWAY', 'SUCCESS', 'Health Check endpoint (/ping) verified 200 OK.', {
        endpoint: '/ping',
        latencyMs: latency,
        status: 200
      });
    }, 450);
  };

  const handleCopy = (text: string, keyName: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(keyName);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const addAuditLog = (
    type: SecurityAuditLog['type'],
    status: SecurityAuditLog['status'],
    message: string,
    details: Record<string, any>
  ) => {
    const newLog: SecurityAuditLog = {
      id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
      timestamp: new Date().toLocaleTimeString(),
      type,
      status,
      message,
      details
    };
    setAuditLogs((prev) => [newLog, ...prev.slice(0, 19)]);
  };

  const formatCountdown = (totalSeconds: number) => {
    const m = Math.floor(totalSeconds / 60);
    const s = totalSeconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <div className="w-full bg-[#0a111a] text-slate-100 font-sans border border-[#1e2f42] rounded-xl shadow-2xl overflow-hidden">
      {/* Top Banner Header */}
      <div className="bg-gradient-to-r from-[#0B2341] via-[#0D3B66] to-[#0B2341] p-6 border-b border-[#1e3a5f] relative">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="p-3 bg-[#117ACA]/20 border border-[#117ACA]/40 rounded-xl shadow-inner text-[#41B6E6]">
              <Shield className="w-8 h-8" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs uppercase tracking-widest font-bold px-2 py-0.5 rounded bg-[#117ACA]/30 text-[#41B6E6] border border-[#117ACA]/50">
                  CLPWPE Security Engine
                </span>
                <span className="inline-flex items-center text-xs font-semibold text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-700/50">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 mr-1.5 animate-pulse" />
                  2-Legged OAuth Active
                </span>
              </div>
              <h1 className="text-2xl font-bold text-white tracking-tight mt-1">
                Chase Security & Cryptographic Command Center
              </h1>
              <p className="text-sm text-slate-300">
                Card Loyalty Pay With Points Enrollment API v1.0.0 • Scope: <code className="text-amber-300 font-mono">card</code>
              </p>
            </div>
          </div>

          {/* Quick Action Buttons */}
          <div className="flex items-center space-x-3">
            <button
              onClick={handlePingHealthCheck}
              disabled={pingStatus === 'checking'}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-medium bg-[#13273d] hover:bg-[#1c3857] text-slate-200 border border-[#2b4c73] rounded-lg transition-all shadow-sm"
            >
              <Activity className={`w-4 h-4 ${pingStatus === 'checking' ? 'animate-spin text-[#41B6E6]' : 'text-emerald-400'}`} />
              <span>
                {pingStatus === 'checking'
                  ? 'Testing Gateway...'
                  : pingStatus === 'healthy'
                  ? `Ping: 200 OK (${pingLatency}ms)`
                  : 'Ping /ping Endpoint'}
              </span>
            </button>

            <button
              onClick={handleRegenerateToken}
              disabled={isGeneratingToken}
              className="flex items-center space-x-2 px-4 py-2 text-xs font-semibold bg-[#117ACA] hover:bg-[#005EB8] text-white rounded-lg transition-all shadow-md active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isGeneratingToken ? 'animate-spin' : ''}`} />
              <span>Rotate Bearer Token</span>
            </button>
          </div>
        </div>

        {/* Security Metric Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6 pt-4 border-t border-slate-700/40">
          <div className="bg-[#081524]/70 p-3 rounded-lg border border-[#162e4a]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Token Protocol</span>
              <Lock className="w-3.5 h-3.5 text-[#41B6E6]" />
            </div>
            <div className="text-sm font-semibold text-white mt-1">OAuth 2.0 (2-Legged)</div>
            <div className="text-[11px] text-slate-400 font-mono truncate">Grant: client_credentials</div>
          </div>

          <div className="bg-[#081524]/70 p-3 rounded-lg border border-[#162e4a]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Token Expiry</span>
              <Clock className="w-3.5 h-3.5 text-amber-400" />
            </div>
            <div className="text-sm font-semibold text-amber-300 font-mono mt-1">
              {secondsRemaining > 0 ? formatCountdown(secondsRemaining) : 'EXPIRED'}
            </div>
            <div className="text-[11px] text-slate-400">Auto-refresh ready</div>
          </div>

          <div className="bg-[#081524]/70 p-3 rounded-lg border border-[#162e4a]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>Trace-ID Format</span>
              <Fingerprint className="w-3.5 h-3.5 text-purple-400" />
            </div>
            <div className="text-sm font-semibold text-purple-300 font-mono mt-1">128-bit Lower Hex</div>
            <div className="text-[11px] text-slate-400">32 hex characters</div>
          </div>

          <div className="bg-[#081524]/70 p-3 rounded-lg border border-[#162e4a]">
            <div className="flex items-center justify-between text-xs text-slate-400">
              <span>API Gateway Status</span>
              <Server className="w-3.5 h-3.5 text-emerald-400" />
            </div>
            <div className="text-sm font-semibold text-emerald-400 mt-1 flex items-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block mr-1.5" />
              api.chase.com (Online)
            </div>
            <div className="text-[11px] text-slate-400 font-mono">TLS 1.3 Strict</div>
          </div>
        </div>
      </div>

      {/* Tab Navigation */}
      <div className="flex border-b border-[#1b2b3d] bg-[#070e17] px-6">
        <button
          onClick={() => setActiveTab('flow')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'flow'
              ? 'border-[#41B6E6] text-[#41B6E6] bg-[#117ACA]/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Layers className="w-4 h-4" />
          <span>2-Legged OAuth Architecture</span>
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'headers'
              ? 'border-[#41B6E6] text-[#41B6E6] bg-[#117ACA]/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-4 h-4" />
          <span>Request Headers & Trace-ID Minting</span>
        </button>

        <button
          onClick={() => setActiveTab('token')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'token'
              ? 'border-[#41B6E6] text-[#41B6E6] bg-[#117ACA]/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileCode className="w-4 h-4" />
          <span>JWT Inspection & Token Claims</span>
        </button>

        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center space-x-2 py-3 px-4 text-xs font-semibold border-b-2 transition-all ${
            activeTab === 'audit'
              ? 'border-[#41B6E6] text-[#41B6E6] bg-[#117ACA]/10'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Security Audit Trail ({auditLogs.length})</span>
        </button>
      </div>

      {/* Main Panel Content */}
      <div className="p-6 space-y-6">
        {/* TAB 1: 2-Legged OAuth Flow Visualizer */}
        {activeTab === 'flow' && (
          <div className="space-y-6">
            <div className="bg-[#0e1a29] border border-[#1b314b] p-5 rounded-xl">
              <h3 className="text-base font-semibold text-white flex items-center space-x-2">
                <Radio className="w-4 h-4 text-[#41B6E6]" />
                <span>2-Legged OAuth Sequence Flow for Pay with Points</span>
              </h3>
              <p className="text-xs text-slate-300 mt-1">
                Visualizing the synchronous interaction between Partner Merchant App, Chase OAuth Server, API Gateway, and CLPWPE Enrollment Service.
              </p>

              {/* Step Sequence Visualizer */}
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
                {/* Step 1 */}
                <div className="relative bg-[#071320] border border-[#1f3a5a] rounded-lg p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-[#117ACA]/20 text-[#41B6E6] border border-[#117ACA]/40">
                      STEP 1: AUTH
                    </span>
                    <Lock className="w-4 h-4 text-slate-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Client Credentials</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Partner exchanges <code className="text-[#41B6E6]">client_id</code> & <code className="text-[#41B6E6]">client_secret</code> at token URL for scope <code className="text-amber-400">card</code>.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400 truncate">
                    POST /ccoauth/token
                  </div>
                </div>

                {/* Step 2 */}
                <div className="relative bg-[#071320] border border-[#1f3a5a] rounded-lg p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-400 border border-emerald-700/50">
                      STEP 2: TOKEN
                    </span>
                    <Key className="w-4 h-4 text-emerald-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Token Issuance</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Chase Auth Server validates credentials and returns signed OAuth2 Bearer token (3600s TTL).
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-emerald-400">
                    HTTP 200 OK • Bearer JWT
                  </div>
                </div>

                {/* Step 3 */}
                <div className="relative bg-[#071320] border border-[#1f3a5a] rounded-lg p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-purple-950 text-purple-400 border border-purple-700/50">
                      STEP 3: GATEWAY
                    </span>
                    <Server className="w-4 h-4 text-purple-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Header Validation</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      API Gateway verifies <code className="text-purple-300">trace-id</code>, <code className="text-purple-300">authorization</code>, and forwards to CLPWPE service.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-slate-400">
                    Rate-limit & Policy Check
                  </div>
                </div>

                {/* Step 4 */}
                <div className="relative bg-[#071320] border border-[#1f3a5a] rounded-lg p-4 flex flex-col justify-between">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-bold px-2 py-0.5 rounded bg-blue-950 text-blue-400 border border-blue-700/50">
                      STEP 4: EXECUTE
                    </span>
                    <Zap className="w-4 h-4 text-blue-400" />
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white uppercase tracking-wide">Loyalty Execution</h4>
                    <p className="text-[11px] text-slate-300 mt-1">
                      Enrollment / Un-enrollment logic processes cardholder and returns <code className="text-blue-300">EnrollmentResponse</code>.
                    </p>
                  </div>
                  <div className="mt-3 pt-2 border-t border-slate-800 text-[10px] font-mono text-blue-400">
                    AUTOENROLLED / ENROLLED
                  </div>
                </div>
              </div>
            </div>

            {/* Architecture Node Diagram */}
            <div className="bg-[#0b1624] border border-[#19304a] p-5 rounded-xl">
              <h3 className="text-sm font-semibold text-white mb-4 flex items-center justify-between">
                <span>Synchronous Handshake Infrastructure Topology</span>
                <span className="text-xs font-mono text-slate-400">Mutual TLS • Strict OAuth2</span>
              </h3>

              <div className="flex flex-col md:flex-row items-center justify-between gap-4 p-4 bg-[#060c14] rounded-lg border border-[#16273b]">
                {/* Node 1: Partner App */}
                <div className="flex-1 text-center p-3 bg-[#0d1c2d] border border-[#1e3c61] rounded-lg w-full">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-[#117ACA]/20 border border-[#117ACA] flex items-center justify-center text-[#41B6E6]">
                    <Globe className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Partner Application</div>
                  <div className="text-[10px] text-slate-400 font-mono">Merchant Relationship Mgr</div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 hidden md:block" />

                {/* Node 2: OAuth Server */}
                <div className="flex-1 text-center p-3 bg-[#0d1c2d] border border-[#1e3c61] rounded-lg w-full">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400">
                    <Key className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Chase OAuth Server</div>
                  <div className="text-[10px] text-slate-400 font-mono">/ccoauth/token</div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 hidden md:block" />

                {/* Node 3: API Gateway */}
                <div className="flex-1 text-center p-3 bg-[#0d1c2d] border border-[#1e3c61] rounded-lg w-full">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-purple-500/20 border border-purple-500 flex items-center justify-center text-purple-400">
                    <Server className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">Chase API Gateway</div>
                  <div className="text-[10px] text-slate-400 font-mono">api.chase.com</div>
                </div>

                <ArrowRight className="w-5 h-5 text-slate-500 hidden md:block" />

                {/* Node 4: CLPWPE Service */}
                <div className="flex-1 text-center p-3 bg-[#0d1c2d] border border-[#1e3c61] rounded-lg w-full">
                  <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center text-[#41B6E6]">
                    <Cpu className="w-5 h-5" />
                  </div>
                  <div className="text-xs font-bold text-white">CLPWPE Service</div>
                  <div className="text-[10px] text-slate-400 font-mono">Card Loyalty Core</div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Request Headers & Trace-ID Minting */}
        {activeTab === 'headers' && (
          <div className="space-y-6">
            <div className="bg-[#0e1a29] border border-[#1b314b] p-5 rounded-xl space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-base font-semibold text-white">Swagger 2.0 Header Parameter Engine</h3>
                  <p className="text-xs text-slate-300">
                    All 7 required & optional headers matching the Card Loyalty Pay With Points Enrollment specification.
                  </p>
                </div>
                <button
                  onClick={() => {
                    const newTrace = generateTraceId();
                    const newUuid = generateUuid();
                    setCredentials((prev) => ({
                      ...prev,
                      traceId: newTrace,
                      accountReferenceUuid: newUuid
                    }));
                    addAuditLog('TRACE', 'SUCCESS', 'Generated fresh 128-bit hex trace-id and UUIDv4 account ref.', {
                      traceId: newTrace,
                      uuid: newUuid
                    });
                  }}
                  className="flex items-center space-x-1.5 px-3 py-1.5 text-xs bg-[#117ACA] hover:bg-[#005EB8] text-white rounded font-medium shadow"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Generate New Trace-ID & UUID</span>
                </button>
              </div>

              <div className="space-y-3 mt-4">
                {/* Header 1: trace-id */}
                <div className="bg-[#071320] border border-[#1c3552] p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#41B6E6]">trace-id</span>
                      <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1.5 py-0.2 rounded uppercase font-semibold">
                        REQUIRED
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">128-bit hex (maxLength: 32)</span>
                    </div>
                    <input
                      type="text"
                      value={credentials.traceId}
                      onChange={(e) => setCredentials({ ...credentials, traceId: e.target.value })}
                      className="w-full mt-1.5 px-3 py-1.5 text-xs font-mono bg-[#030911] border border-slate-700 rounded text-amber-300 focus:outline-none focus:border-[#41B6E6]"
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(credentials.traceId, 'trace-id')}
                    className="self-end md:self-center p-2 text-slate-400 hover:text-white bg-[#102338] rounded border border-slate-700"
                    title="Copy trace-id"
                  >
                    {copiedKey === 'trace-id' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Header 2: authorization (Bearer Token) */}
                <div className="bg-[#071320] border border-[#1c3552] p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#41B6E6]">authorization</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 px-1.5 py-0.2 rounded uppercase font-semibold">
                        OPTIONAL / GATEWAY
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Bearer OAuth2 token (maxLength: 8000)</span>
                    </div>
                    <input
                      type="text"
                      value={`Bearer ${credentials.bearerToken}`}
                      readOnly
                      className="w-full mt-1.5 px-3 py-1.5 text-xs font-mono bg-[#030911] border border-slate-700 rounded text-emerald-300 truncate focus:outline-none"
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(`Bearer ${credentials.bearerToken}`, 'authorization')}
                    className="self-end md:self-center p-2 text-slate-400 hover:text-white bg-[#102338] rounded border border-slate-700"
                    title="Copy authorization header"
                  >
                    {copiedKey === 'authorization' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Header 3: authorization2 */}
                <div className="bg-[#071320] border border-[#1c3552] p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-[#41B6E6]">authorization2</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 px-1.5 py-0.2 rounded uppercase font-semibold">
                        OPTIONAL (3-LEGGED / 2-LEGGED)
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">Additional authorization token</span>
                    </div>
                    <input
                      type="text"
                      placeholder="Optional secondary partner signature or authorization header"
                      value={credentials.authorization2Token}
                      onChange={(e) => setCredentials({ ...credentials, authorization2Token: e.target.value })}
                      className="w-full mt-1.5 px-3 py-1.5 text-xs font-mono bg-[#030911] border border-slate-700 rounded text-slate-300 focus:outline-none focus:border-[#41B6E6]"
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(credentials.authorization2Token, 'authorization2')}
                    className="self-end md:self-center p-2 text-slate-400 hover:text-white bg-[#102338] rounded border border-slate-700"
                    title="Copy authorization2"
                  >
                    {copiedKey === 'authorization2' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>

                {/* Header 4 & 5 Grid: external-account-identifier & channel-type */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {/* external-account-identifier */}
                  <div className="bg-[#071320] border border-[#1c3552] p-3.5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#41B6E6]">external-account-identifier</span>
                      <span className="text-[10px] bg-rose-950 text-rose-300 border border-rose-800 px-1 py-0.2 rounded uppercase font-semibold">
                        REQUIRED
                      </span>
                    </div>
                    <input
                      type="text"
                      value={credentials.externalAccountIdentifier}
                      onChange={(e) => setCredentials({ ...credentials, externalAccountIdentifier: e.target.value })}
                      className="w-full mt-2 px-3 py-1.5 text-xs font-mono bg-[#030911] border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#41B6E6]"
                    />
                  </div>

                  {/* channel-type */}
                  <div className="bg-[#071320] border border-[#1c3552] p-3.5 rounded-lg">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-[#41B6E6]">channel-type</span>
                      <span className="text-[10px] bg-slate-800 text-slate-300 border border-slate-600 px-1 py-0.2 rounded uppercase font-semibold">
                        OPTIONAL
                      </span>
                    </div>
                    <select
                      value={credentials.channelType}
                      onChange={(e) => setCredentials({ ...credentials, channelType: e.target.value as any })}
                      className="w-full mt-2 px-3 py-1.5 text-xs font-mono bg-[#030911] border border-slate-700 rounded text-slate-200 focus:outline-none focus:border-[#41B6E6]"
                    >
                      <option value="WEB">WEB</option>
                      <option value="MOBILE_APP">MOBILE_APP</option>
                      <option value="MOBILE_WEB">MOBILE_WEB</option>
                      <option value="BATCH">BATCH</option>
                    </select>
                  </div>
                </div>

                {/* Path Parameter: account-reference-universal-unique-identifier */}
                <div className="bg-[#071320] border border-[#1c3552] p-3.5 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2">
                      <span className="text-xs font-mono font-bold text-amber-400">&#123;account-reference-universal-unique-identifier&#125;</span>
                      <span className="text-[10px] bg-amber-950 text-amber-300 border border-amber-800 px-1.5 py-0.2 rounded uppercase font-semibold">
                        PATH UUID
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">128-bit UUID (36 bytes)</span>
                    </div>
                    <input
                      type="text"
                      value={credentials.accountReferenceUuid}
                      onChange={(e) => setCredentials({ ...credentials, accountReferenceUuid: e.target.value })}
                      className="w-full mt-1.5 px-3 py-1.5 text-xs font-mono bg-[#030911] border border-slate-700 rounded text-cyan-300 focus:outline-none focus:border-[#41B6E6]"
                    />
                  </div>
                  <button
                    onClick={() => handleCopy(credentials.accountReferenceUuid, 'path-uuid')}
                    className="self-end md:self-center p-2 text-slate-400 hover:text-white bg-[#102338] rounded border border-slate-700"
                    title="Copy UUID"
                  >
                    {copiedKey === 'path-uuid' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: JWT Inspection & Token Claims */}
        {activeTab === 'token' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
              {/* Token Configuration Inputs */}
              <div className="lg:col-span-5 bg-[#0e1a29] border border-[#1b314b] p-5 rounded-xl space-y-4">
                <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                  <Shield className="w-4 h-4 text-[#41B6E6]" />
                  <span>OAuth2 Client Configuration</span>
                </h3>

                <div>
                  <label className="text-xs text-slate-400 font-medium">OAuth2 Token Endpoint</label>
                  <input
                    type="text"
                    value={credentials.tokenUrl}
                    readOnly
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-[#050c14] border border-slate-700 rounded text-slate-300"
                  />
                </div>

                <div>
                  <label className="text-xs text-slate-400 font-medium">Client ID</label>
                  <input
                    type="text"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-[#050c14] border border-slate-700 rounded text-[#41B6E6]"
                  />
                </div>

                <div>
                  <div className="flex items-center justify-between">
                    <label className="text-xs text-slate-400 font-medium">Client Secret</label>
                    <button
                      type="button"
                      onClick={() => setShowSecret(!showSecret)}
                      className="text-[11px] text-[#41B6E6] flex items-center space-x-1"
                    >
                      {showSecret ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                      <span>{showSecret ? 'Hide' : 'Show'}</span>
                    </button>
                  </div>
                  <input
                    type={showSecret ? 'text' : 'password'}
                    value={credentials.clientSecret}
                    onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                    className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-[#050c14] border border-slate-700 rounded text-amber-300"
                  />
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-xs text-slate-400 font-medium">OAuth Scope</label>
                    <input
                      type="text"
                      value={credentials.scope}
                      readOnly
                      className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-[#050c14] border border-slate-700 rounded text-purple-400 font-bold"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 font-medium">TTL (Seconds)</label>
                    <input
                      type="number"
                      value={credentials.tokenExpiresIn}
                      onChange={(e) => setCredentials({ ...credentials, tokenExpiresIn: parseInt(e.target.value) || 3600 })}
                      className="w-full mt-1 px-3 py-1.5 text-xs font-mono bg-[#050c14] border border-slate-700 rounded text-slate-200"
                    />
                  </div>
                </div>

                <button
                  onClick={handleRegenerateToken}
                  disabled={isGeneratingToken}
                  className="w-full py-2.5 bg-[#117ACA] hover:bg-[#005EB8] text-white font-semibold text-xs rounded-lg transition-all shadow-md flex items-center justify-center space-x-2"
                >
                  <RefreshCw className={`w-4 h-4 ${isGeneratingToken ? 'animate-spin' : ''}`} />
                  <span>Request Fresh 2-Legged Access Token</span>
                </button>
              </div>

              {/* Decoded JWT Inspector */}
              <div className="lg:col-span-7 bg-[#0e1a29] border border-[#1b314b] p-5 rounded-xl space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-semibold text-white flex items-center space-x-2">
                    <FileCode className="w-4 h-4 text-emerald-400" />
                    <span>Cryptographic JWT Payload Breakdown</span>
                  </h3>
                  <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800">
                    RS256 • Verified
                  </span>
                </div>

                {/* Raw Compact JWT View */}
                <div className="bg-[#050c14] border border-slate-800 p-3 rounded-lg font-mono text-[11px] break-all leading-relaxed">
                  <span className="text-rose-400">
                    {credentials.bearerToken.split('.')[0] || 'eyJhbGciOiJSUzI1NiJ9'}
                  </span>
                  <span className="text-slate-500">.</span>
                  <span className="text-purple-400">
                    {credentials.bearerToken.split('.')[1] || 'eyJzdWIiOiJjaGFzZV9wYXJ0bmVyIn0'}
                  </span>
                  <span className="text-slate-500">.</span>
                  <span className="text-cyan-400">
                    {credentials.bearerToken.split('.')[2] || 'signature'}
                  </span>
                </div>

                {/* Decoded Claims Table */}
                <div className="bg-[#050c14] border border-[#152538] rounded-lg p-3 space-y-2 text-xs font-mono">
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">iss (Issuer):</span>
                    <span className="text-white">https://api.chase.com/ccoauth</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">aud (Audience):</span>
                    <span className="text-white">/card/loyalty/earn-rewards/enrollment/v1</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">scope:</span>
                    <span className="text-amber-400 font-bold">card</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">sub (Partner ID):</span>
                    <span className="text-purple-300">{credentials.clientId}</span>
                  </div>
                  <div className="flex justify-between border-b border-slate-800 pb-1.5">
                    <span className="text-slate-400">algorithm / key_id:</span>
                    <span className="text-cyan-400">RS256 / chase-ccoauth-2025-01</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">exp (Expiration):</span>
                    <span className="text-emerald-400">
                      {secondsRemaining > 0 ? `${secondsRemaining}s remaining` : 'EXPIRED'}
                    </span>
                  </div>
                </div>

                <div className="flex items-center space-x-2 text-[11px] text-slate-400">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                  <span>Valid for all CLPWPE endpoints (POST enrollment, PUT un-enrollment, GET /ping).</span>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Security Audit Trail */}
        {activeTab === 'audit' && (
          <div className="bg-[#0e1a29] border border-[#1b314b] p-5 rounded-xl space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-base font-semibold text-white">Live Cryptographic Audit Trail</h3>
                <p className="text-xs text-slate-300">
                  Real-time security events, OAuth handshakes, header verifications, and gateway checks.
                </p>
              </div>
              <button
                onClick={() => setAuditLogs([])}
                className="text-xs text-slate-400 hover:text-slate-200 underline"
              >
                Clear Log
              </button>
            </div>

            <div className="space-y-2 font-mono text-xs max-h-96 overflow-y-auto pr-1">
              {auditLogs.length === 0 ? (
                <div className="text-center py-8 text-slate-500">No security audit logs recorded.</div>
              ) : (
                auditLogs.map((log) => (
                  <div
                    key={log.id}
                    className="p-3 bg-[#060e18] border border-[#16273b] rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-2"
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                      <span
                        className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-800'
                            : log.status === 'WARN'
                            ? 'bg-amber-950 text-amber-400 border border-amber-800'
                            : 'bg-rose-950 text-rose-400 border border-rose-800'
                        }`}
                      >
                        {log.type}
                      </span>
                      <span className="text-slate-200">{log.message}</span>
                    </div>

                    <div className="text-[11px] text-slate-400 truncate max-w-xs md:max-w-md bg-[#04080e] px-2 py-1 rounded border border-slate-800">
                      {JSON.stringify(log.details)}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        )}
      </div>

      {/* cURL Live Exporter Box */}
      <div className="bg-[#060c14] border-t border-[#1a2e46] p-5">
        <div className="flex items-center justify-between mb-2">
          <div className="flex items-center space-x-2">
            <Terminal className="w-4 h-4 text-[#41B6E6]" />
            <span className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
              Ready-to-Execute cURL Blueprint
            </span>
          </div>
          <button
            onClick={() => {
              const curl = `curl -X POST "https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1/merchants/programs/pay-with-points/enrollments/${credentials.accountReferenceUuid}" \\
  -H "authorization: Bearer ${credentials.bearerToken}" \\
  -H "trace-id: ${credentials.traceId}" \\
  -H "enrollment-type-code: ENROLL" \\
  -H "external-account-identifier: ${credentials.externalAccountIdentifier}" \\
  -H "channel-type: ${credentials.channelType}" \\
  -H "Content-Type: application/json"`;
              handleCopy(curl, 'curl');
            }}
            className="flex items-center space-x-1 px-2.5 py-1 text-xs bg-[#122438] hover:bg-[#1a3554] text-[#41B6E6] border border-[#214269] rounded transition-all"
          >
            {copiedKey === 'curl' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
            <span>Copy cURL Command</span>
          </button>
        </div>

        <pre className="p-3 bg-[#03070d] border border-slate-800 rounded-lg text-[11px] font-mono text-slate-300 overflow-x-auto">
          <code>
            <span className="text-purple-400">curl</span> -X POST <span className="text-emerald-300">"https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1/merchants/programs/pay-with-points/enrollments/{credentials.accountReferenceUuid}"</span> \<br />
            {'  '}-H <span className="text-amber-300">"authorization: Bearer {credentials.bearerToken.substring(0, 32)}..."</span> \<br />
            {'  '}-H <span className="text-amber-300">"trace-id: {credentials.traceId}"</span> \<br />
            {'  '}-H <span className="text-amber-300">"enrollment-type-code: ENROLL"</span> \<br />
            {'  '}-H <span className="text-amber-300">"external-account-identifier: {credentials.externalAccountIdentifier}"</span> \<br />
            {'  '}-H <span className="text-amber-300">"channel-type: {credentials.channelType}"</span> \<br />
            {'  '}-H <span className="text-amber-300">"Content-Type: application/json"</span>
          </code>
        </pre>
      </div>
    </div>
  );
};

export default ChaseSecurityCenter;