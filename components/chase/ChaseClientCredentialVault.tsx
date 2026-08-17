import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Types & Interfaces ---
export type ChaseEnvironment = 'sandbox' | 'certification' | 'production';

export interface ChaseApiCredentials {
  clientId: string;
  clientSecret: string;
  tokenUrl: string;
  scope: string;
  grantType: 'client_credentials' | 'authorization_code' | 'refresh_token';
  environment: ChaseEnvironment;
  externalAccountIdentifier: string;
  traceId: string;
  channelType: 'WEB' | 'MOBILE_WEB' | 'MOBILE_APP' | 'POS';
  enrollmentTypeCode: 'AUTOENROLL' | 'ENROLL' | 'DEENROLL';
  authorization2Token: string;
}

export interface PkcePair {
  codeVerifier: string;
  codeChallenge: string;
  codeChallengeMethod: 'S256' | 'plain';
  state: string;
  timestamp: string;
}

export interface GeneratedTokenState {
  accessToken: string;
  tokenType: 'Bearer';
  expiresIn: number;
  issuedAt: number;
  scope: string;
  status: 'idle' | 'fetching' | 'active' | 'expired' | 'error';
  errorMessage?: string;
  rawResponse?: Record<string, unknown>;
}

export interface VaultPreset {
  id: string;
  name: string;
  description: string;
  environment: ChaseEnvironment;
  credentials: Partial<ChaseApiCredentials>;
}

const DEFAULT_ENV_ENDPOINTS: Record<ChaseEnvironment, { tokenUrl: string; baseApiUrl: string }> = {
  sandbox: {
    tokenUrl: 'https://api-sandbox.chase.com/ccoauth/token',
    baseApiUrl: 'https://api-sandbox.chase.com/card/loyalty/earn-rewards/enrollment/v1',
  },
  certification: {
    tokenUrl: 'https://api-cert.chase.com/ccoauth/token',
    baseApiUrl: 'https://api-cert.chase.com/card/loyalty/earn-rewards/enrollment/v1',
  },
  production: {
    tokenUrl: 'https://api.chase.com/ccoauth/token',
    baseApiUrl: 'https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1',
  },
};

const PRESETS: VaultPreset[] = [
  {
    id: 'pwp-loyalty-sandbox',
    name: 'Pay with Points — Partner Sandbox',
    description: 'Preconfigured 2-Legged OAuth2 for CLPWPE Card Loyalty Enrollment flows',
    environment: 'sandbox',
    credentials: {
      clientId: 'sandbox_jpm_chase_pwp_client_094fbc8a',
      clientSecret: 'sec_live_99f0e1d823ba4c81a2e389d41b',
      scope: 'card loyalty:pwp:enrollment',
      externalAccountIdentifier: 'EXT-ACC-88392019-NY',
      channelType: 'WEB',
      enrollmentTypeCode: 'ENROLL',
    },
  },
  {
    id: 'merchant-rel-cert',
    name: 'Merchant Relationship Mgr — Cert Env',
    description: 'Enterprise PCI-compliant tokenization & RPC product trade verification',
    environment: 'certification',
    credentials: {
      clientId: 'cert_merch_rel_mgr_012e84bc91',
      clientSecret: 'sec_cert_44a19b22e4c017d91e',
      scope: 'card merchant:pci:tokenize',
      externalAccountIdentifier: 'CORP-CHASE-ENTERPRISE-01',
      channelType: 'POS',
      enrollmentTypeCode: 'AUTOENROLL',
    },
  },
  {
    id: 'sapphire-rewards-prod',
    name: 'Sapphire & Ink Direct API — Production',
    description: 'High-throughput production gateway configuration with dual authorization header',
    environment: 'production',
    credentials: {
      clientId: 'prod_chase_sapphire_gateway_4019a',
      clientSecret: 'sec_prod_8984cbba019485712ef0',
      scope: 'card rewards:balance:read loyalty:enrollment',
      externalAccountIdentifier: 'JPMC-PROD-TIER1-CLIENT',
      channelType: 'MOBILE_APP',
      enrollmentTypeCode: 'ENROLL',
    },
  },
];

// --- Cryptographic & Utility Functions ---
const generate128BitHexTraceId = (): string => {
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    const array = new Uint8Array(16);
    window.crypto.getRandomValues(array);
    return Array.from(array, (byte) => byte.toString(16).padStart(2, '0')).join('');
  }
  return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
};

const generateRandomBase64Url = (byteLength: number): string => {
  const array = new Uint8Array(byteLength);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.getRandomValues) {
    window.crypto.getRandomValues(array);
  } else {
    for (let i = 0; i < byteLength; i++) array[i] = Math.floor(Math.random() * 256);
  }
  let binary = '';
  for (let i = 0; i < array.byteLength; i++) {
    binary += String.fromCharCode(array[i]);
  }
  return btoa(binary)
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');
};

const sha256Base64Url = async (plain: string): Promise<string> => {
  const encoder = new TextEncoder();
  const data = encoder.encode(plain);
  if (typeof window !== 'undefined' && window.crypto && window.crypto.subtle) {
    const digest = await window.crypto.subtle.digest('SHA-256', data);
    const bytes = new Uint8Array(digest);
    let binary = '';
    for (let i = 0; i < bytes.byteLength; i++) {
      binary += String.fromCharCode(bytes[i]);
    }
    return btoa(binary)
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');
  }
  return 'crypto_subtle_unavailable_' + Math.random().toString(36).substring(2);
};

export const ChaseClientCredentialVault: React.FC = () => {
  // --- Active Tab State ---
  const [activeTab, setActiveTab] = useState<'vault' | 'pkce' | 'headers' | 'simulator' | 'envExport'>('vault');

  // --- Credentials State ---
  const [credentials, setCredentials] = useState<ChaseApiCredentials>({
    clientId: 'sandbox_jpm_chase_pwp_client_094fbc8a',
    clientSecret: 'sec_live_99f0e1d823ba4c81a2e389d41b',
    tokenUrl: DEFAULT_ENV_ENDPOINTS.sandbox.tokenUrl,
    scope: 'card',
    grantType: 'client_credentials',
    environment: 'sandbox',
    externalAccountIdentifier: 'EXT-ACC-88392019-NY',
    traceId: generate128BitHexTraceId(),
    channelType: 'WEB',
    enrollmentTypeCode: 'ENROLL',
    authorization2Token: '',
  });

  const [showSecret, setShowSecret] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // --- PKCE Generator State ---
  const [pkceState, setPkceState] = useState<PkcePair>({
    codeVerifier: '',
    codeChallenge: '',
    codeChallengeMethod: 'S256',
    state: '',
    timestamp: '',
  });
  const [pkceVerifierLength, setPkceVerifierLength] = useState<number>(64);

  // --- Live Simulated OAuth2 Token State ---
  const [tokenResponse, setTokenResponse] = useState<GeneratedTokenState>({
    accessToken: '',
    tokenType: 'Bearer',
    expiresIn: 3600,
    issuedAt: 0,
    scope: 'card',
    status: 'idle',
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);

  // --- Notification Message ---
  const [toastMsg, setToastMsg] = useState<string | null>(null);

  const showToast = (msg: string) => {
    setToastMsg(msg);
    setTimeout(() => setToastMsg(null), 3000);
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(label);
    showToast(`Copied ${label} to clipboard`);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // --- Update Environment ---
  const handleEnvironmentChange = (env: ChaseEnvironment) => {
    setCredentials((prev) => ({
      ...prev,
      environment: env,
      tokenUrl: DEFAULT_ENV_ENDPOINTS[env].tokenUrl,
    }));
  };

  // --- Load Preset ---
  const applyPreset = (preset: VaultPreset) => {
    setCredentials((prev) => ({
      ...prev,
      ...preset.credentials,
      environment: preset.environment,
      tokenUrl: DEFAULT_ENV_ENDPOINTS[preset.environment].tokenUrl,
    }));
    showToast(`Applied preset: ${preset.name}`);
  };

  // --- Regenerate Trace ID ---
  const handleRegenerateTraceId = () => {
    const newId = generate128BitHexTraceId();
    setCredentials((prev) => ({ ...prev, traceId: newId }));
    showToast('New 128-bit hex trace-id generated');
  };

  // --- Regenerate PKCE ---
  const generateNewPkce = useCallback(async () => {
    const rawVerifier = generateRandomBase64Url(pkceVerifierLength);
    const challenge = await sha256Base64Url(rawVerifier);
    const randomState = generateRandomBase64Url(16);
    setPkceState({
      codeVerifier: rawVerifier,
      codeChallenge: challenge,
      codeChallengeMethod: 'S256',
      state: randomState,
      timestamp: new Date().toISOString(),
    });
  }, [pkceVerifierLength]);

  useEffect(() => {
    generateNewPkce();
  }, [generateNewPkce]);

  // --- Base64 Computed Authorization Header ---
  const basicAuthBase64 = useMemo(() => {
    if (!credentials.clientId && !credentials.clientSecret) return '';
    try {
      const raw = `${credentials.clientId}:${credentials.clientSecret}`;
      return btoa(raw);
    } catch {
      return 'Encoding Error';
    }
  }, [credentials.clientId, credentials.clientSecret]);

  // --- Simulate OAuth Token Exchange ---
  const handleFetchToken = () => {
    setTokenResponse((prev) => ({ ...prev, status: 'fetching' }));
    setTimeout(() => {
      if (!credentials.clientId || !credentials.clientSecret) {
        setTokenResponse((prev) => ({
          ...prev,
          status: 'error',
          errorMessage: 'OAuth Error: invalid_client - Client ID or Secret missing.',
        }));
        return;
      }
      const dummyToken = 'eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsImtpZCI6ImNobF9hdXRoXzIwMjVfdjEifQ.' +
        btoa(JSON.stringify({
          iss: credentials.tokenUrl,
          sub: credentials.clientId,
          aud: 'https://api.chase.com/card/loyalty',
          scope: credentials.scope,
          exp: Math.floor(Date.now() / 1000) + 3600,
          iat: Math.floor(Date.now() / 1000),
          jti: generate128BitHexTraceId(),
          ext_account_id: credentials.externalAccountIdentifier,
        })).replace(/=+$/, '') +
        '.' + generate128BitHexTraceId() + generate128BitHexTraceId();

      const now = Date.now();
      const expires = 3600;
      setTokenResponse({
        accessToken: dummyToken,
        tokenType: 'Bearer',
        expiresIn: expires,
        issuedAt: now,
        scope: credentials.scope,
        status: 'active',
        rawResponse: {
          access_token: dummyToken,
          token_type: 'Bearer',
          expires_in: expires,
          scope: credentials.scope,
          token_id: `tok_${generate128BitHexTraceId().substring(0, 16)}`,
          consented_on: Math.floor(now / 1000),
        },
      });
      setSecondsRemaining(expires);
      showToast('2-Legged OAuth token successfully issued!');
    }, 600);
  };

  // --- Expiration Timer ---
  useEffect(() => {
    if (tokenResponse.status !== 'active' || secondsRemaining <= 0) return;
    const interval = setInterval(() => {
      setSecondsRemaining((prev) => {
        if (prev <= 1) {
          setTokenResponse((t) => ({ ...t, status: 'expired' }));
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(interval);
  }, [tokenResponse.status, secondsRemaining]);

  // --- Format Seconds into MM:SS ---
  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  // --- Code Snippets for Export ---
  const envFileContent = useMemo(() => {
    return `# JPMorgan Chase & Co. API Sandbox Environment
# Generated via Chase Developer Vault on ${new Date().toISOString()}

CHASE_ENVIRONMENT=${credentials.environment}
CHASE_CLIENT_ID=${credentials.clientId}
CHASE_CLIENT_SECRET=${credentials.clientSecret}
CHASE_OAUTH_TOKEN_URL=${credentials.tokenUrl}
CHASE_DEFAULT_SCOPE=${credentials.scope}
CHASE_EXTERNAL_ACCOUNT_ID=${credentials.externalAccountIdentifier}
CHASE_CHANNEL_TYPE=${credentials.channelType}
CHASE_ENROLLMENT_TYPE_CODE=${credentials.enrollmentTypeCode}
CHASE_AUTH_BASIC_HEADER="Basic ${basicAuthBase64}"
`;
  }, [credentials, basicAuthBase64]);

  const curlTokenCommand = useMemo(() => {
    return `curl -X POST "${credentials.tokenUrl}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -H "Authorization: Basic ${basicAuthBase64}" \\
  -H "trace-id: ${credentials.traceId}" \\
  -d "grant_type=client_credentials&scope=${encodeURIComponent(credentials.scope)}"`;
  }, [credentials, basicAuthBase64]);

  const curlEnrollmentPostCommand = useMemo(() => {
    const bearer = tokenResponse.accessToken ? `Bearer ${tokenResponse.accessToken}` : 'Bearer <OAUTH_ACCESS_TOKEN>';
    const auth2Header = credentials.authorization2Token ? ` \\\n  -H "authorization2: ${credentials.authorization2Token}"` : '';
    const baseUri = DEFAULT_ENV_ENDPOINTS[credentials.environment].baseApiUrl;
    const sampleAccountUuid = 'c8b417c8-9e53-43f1-9fb0-9118c7bf9012';

    return `curl -X POST "${baseUri}/merchants/programs/pay-with-points/enrollments/${sampleAccountUuid}" \\
  -H "Accept: application/json" \\
  -H "enrollment-type-code: ${credentials.enrollmentTypeCode}" \\
  -H "external-account-identifier: ${credentials.externalAccountIdentifier}" \\
  -H "channel-type: ${credentials.channelType}" \\
  -H "authorization: ${bearer}"${auth2Header} \\
  -H "trace-id: ${credentials.traceId}"`;
  }, [credentials, tokenResponse.accessToken]);

  return (
    <div className="min-h-screen bg-[#07131F] text-slate-100 font-sans p-4 sm:p-6 lg:p-8">
      {/* Toast Notification */}
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-400/30 text-sm font-medium animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {toastMsg}
        </div>
      )}

      {/* Main Header / Banner */}
      <header className="mb-8 border-b border-slate-800 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#0060F0] to-[#0A2540] p-0.5 shadow-xl shadow-blue-900/30 flex items-center justify-center border border-blue-400/40">
              <svg className="w-8 h-8 text-white" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="11" width="18" height="11" rx="2" ry="2" />
                <path d="M7 11V7a5 5 0 0 1 10 0v4" />
              </svg>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white font-mono">
                  J.P. MORGAN <span className="text-[#0080FF]">CHASE</span>
                </h1>
                <span className="bg-blue-950/80 border border-blue-600/40 text-blue-300 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider">
                  CLPWPE v1.0.0 Vault
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-1">
                Enterprise Credential Manager, PKCE Generator, 128-Bit Trace Engine & OAuth2 Token Simulator
              </p>
            </div>
          </div>

          {/* Environment Selector & Status Badges */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="flex items-center bg-slate-900 border border-slate-700/80 rounded-xl p-1 shadow-inner">
              {(['sandbox', 'certification', 'production'] as ChaseEnvironment[]).map((env) => (
                <button
                  key={env}
                  onClick={() => handleEnvironmentChange(env)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase transition-all ${
                    credentials.environment === env
                      ? env === 'production'
                        ? 'bg-rose-600 text-white shadow-lg shadow-rose-900/40'
                        : env === 'certification'
                        ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
                        : 'bg-[#0060F0] text-white shadow-lg shadow-blue-900/40'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  {env}
                </button>
              ))}
            </div>

            <button
              onClick={handleRegenerateTraceId}
              className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-colors shadow-sm"
              title="Regenerate 128-bit hex trace ID"
            >
              <svg className="w-3.5 h-3.5 text-blue-400 animate-spin-hover" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
              </svg>
              <span>Trace ID</span>
            </button>
          </div>
        </div>

        {/* Preset Selector Strip */}
        <div className="mt-6 flex flex-wrap items-center gap-3">
          <span className="text-xs font-bold text-slate-500 uppercase tracking-widest flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
            </svg>
            Quick Presets:
          </span>
          {PRESETS.map((preset) => (
            <button
              key={preset.id}
              onClick={() => applyPreset(preset)}
              className="text-xs px-3 py-1 rounded-lg bg-slate-800/80 hover:bg-blue-950 border border-slate-700 hover:border-blue-500 text-slate-300 hover:text-white transition-all flex items-center gap-2 group"
            >
              <span className={`w-2 h-2 rounded-full ${
                preset.environment === 'production' ? 'bg-rose-500' : preset.environment === 'certification' ? 'bg-amber-400' : 'bg-emerald-400'
              }`} />
              <span className="font-medium">{preset.name}</span>
            </button>
          ))}
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 gap-2 overflow-x-auto pb-2">
        {[
          { id: 'vault', label: '1. Vault & Credentials', icon: 'key' },
          { id: 'headers', label: '2. Header Encoder & Base64', icon: 'code' },
          { id: 'pkce', label: '3. PKCE S256 Generator', icon: 'shield' },
          { id: 'simulator', label: '4. Live Token Simulator', icon: 'zap' },
          { id: 'envExport', label: '5. Export .env & cURL', icon: 'download' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-blue-600/20 text-[#38BDF8] border border-blue-500/50 shadow-lg shadow-blue-950/50 font-semibold'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* TAB 1: VAULT & CREDENTIALS */}
      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
            {/* Primary Credentials Card */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800/80 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-500 animate-pulse" />
                  <h2 className="text-lg font-bold text-white tracking-wide">Client Credentials Configuration</h2>
                </div>
                <span className="text-xs font-mono bg-blue-950/60 text-blue-300 border border-blue-800/60 px-2 py-0.5 rounded">
                  2-Legged OAuth (card scope)
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Client ID */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>client_id</span>
                    <button
                      onClick={() => copyToClipboard(credentials.clientId, 'Client ID')}
                      className="text-slate-400 hover:text-blue-400 text-[11px]"
                    >
                      {copiedKey === 'Client ID' ? 'Copied!' : 'Copy'}
                    </button>
                  </label>
                  <input
                    type="text"
                    value={credentials.clientId}
                    onChange={(e) => setCredentials({ ...credentials, clientId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-blue-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                    placeholder="e.g. sandbox_jpm_chase_pwp_client"
                  />
                </div>

                {/* Client Secret */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>client_secret</span>
                    <div className="flex gap-2">
                      <button
                        onClick={() => setShowSecret(!showSecret)}
                        className="text-slate-400 hover:text-slate-200 text-[11px]"
                      >
                        {showSecret ? 'Hide' : 'Reveal'}
                      </button>
                      <button
                        onClick={() => copyToClipboard(credentials.clientSecret, 'Client Secret')}
                        className="text-slate-400 hover:text-blue-400 text-[11px]"
                      >
                        {copiedKey === 'Client Secret' ? 'Copied!' : 'Copy'}
                      </button>
                    </div>
                  </label>
                  <div className="relative">
                    <input
                      type={showSecret ? 'text' : 'password'}
                      value={credentials.clientSecret}
                      onChange={(e) => setCredentials({ ...credentials, clientSecret: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-amber-200 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                      placeholder="••••••••••••••••••••••••••••"
                    />
                  </div>
                </div>

                {/* Token URL Endpoint */}
                <div className="space-y-1.5 md:col-span-2">
                  <label className="text-xs font-semibold text-slate-300 flex items-center justify-between">
                    <span>Token URL (tokenUrl)</span>
                    <span className="text-[11px] text-slate-500">Auto-updates on environment change</span>
                  </label>
                  <input
                    type="text"
                    value={credentials.tokenUrl}
                    onChange={(e) => setCredentials({ ...credentials, tokenUrl: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500"
                  />
                </div>

                {/* Scope */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    OAuth Scope <span className="text-slate-500">(CLPWPE required: card)</span>
                  </label>
                  <input
                    type="text"
                    value={credentials.scope}
                    onChange={(e) => setCredentials({ ...credentials, scope: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                {/* Grant Type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">Grant Type</label>
                  <select
                    value={credentials.grantType}
                    onChange={(e) => setCredentials({ ...credentials, grantType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="client_credentials">client_credentials (2-Legged)</option>
                    <option value="authorization_code">authorization_code (3-Legged PKCE)</option>
                    <option value="refresh_token">refresh_token</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Enterprise Relationship Headers Card */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white tracking-wide mb-4 border-b border-slate-800/80 pb-3 flex items-center justify-between">
                <span>Required Request Headers (CLPWPE)</span>
                <span className="text-xs text-blue-400 font-mono">Swagger 2.0 Spec Compliant</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* trace-id */}
                <div className="space-y-1.5 md:col-span-2">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300">
                      trace-id <span className="text-slate-500 font-normal">(128-bit hex representation, max 32 chars)</span>
                    </label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={handleRegenerateTraceId}
                        className="text-xs text-blue-400 hover:text-blue-300 underline"
                      >
                        Generate Fresh
                      </button>
                      <button
                        onClick={() => copyToClipboard(credentials.traceId, 'Trace ID')}
                        className="text-xs text-slate-400 hover:text-slate-200"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                  <input
                    type="text"
                    value={credentials.traceId}
                    onChange={(e) => setCredentials({ ...credentials, traceId: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-purple-300 tracking-wider focus:outline-none focus:border-purple-500"
                    maxLength={32}
                  />
                  <p className="text-[11px] text-slate-500">
                    Length: {credentials.traceId.length} / 32 characters (128 bits in hex)
                  </p>
                </div>

                {/* external-account-identifier */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    external-account-identifier <span className="text-slate-500">(Firm enterprise ID, max 32)</span>
                  </label>
                  <input
                    type="text"
                    value={credentials.externalAccountIdentifier}
                    onChange={(e) => setCredentials({ ...credentials, externalAccountIdentifier: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                    maxLength={32}
                  />
                </div>

                {/* channel-type */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    channel-type <span className="text-slate-500">(Originating digital channel)</span>
                  </label>
                  <select
                    value={credentials.channelType}
                    onChange={(e) => setCredentials({ ...credentials, channelType: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  >
                    <option value="WEB">WEB</option>
                    <option value="MOBILE_WEB">MOBILE_WEB</option>
                    <option value="MOBILE_APP">MOBILE_APP</option>
                    <option value="POS">POS (Point of Sale)</option>
                  </select>
                </div>

                {/* enrollment-type-code */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    enrollment-type-code <span className="text-slate-500">(Benefit program code)</span>
                  </label>
                  <select
                    value={credentials.enrollmentTypeCode}
                    onChange={(e) => setCredentials({ ...credentials, enrollmentTypeCode: e.target.value as any })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-emerald-300 focus:outline-none focus:border-emerald-500"
                  >
                    <option value="AUTOENROLL">AUTOENROLL</option>
                    <option value="ENROLL">ENROLL</option>
                    <option value="DEENROLL">DEENROLL</option>
                  </select>
                </div>

                {/* authorization2 (optional header for 3-legged) */}
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-slate-300">
                    authorization2 <span className="text-slate-500">(Optional secondary token, max 8000)</span>
                  </label>
                  <input
                    type="text"
                    value={credentials.authorization2Token}
                    onChange={(e) => setCredentials({ ...credentials, authorization2Token: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-700/80 rounded-xl px-3.5 py-2.5 text-sm font-mono text-slate-300 placeholder-slate-600 focus:outline-none focus:border-blue-500"
                    placeholder="Bearer or raw token for dual authorization"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Right Column: Security Checklist & Status */}
          <div className="space-y-6">
            {/* Quick Actions / OAuth Runner Card */}
            <div className="bg-gradient-to-br from-slate-900 to-[#0A2540] rounded-2xl border border-blue-900/50 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                Token Dispatcher
              </h3>
              <p className="text-xs text-slate-300 mb-4 leading-relaxed">
                Trigger mock 2-legged OAuth token generation using the Basic Auth Authorization header against Chase OAuth token service.
              </p>

              <button
                onClick={handleFetchToken}
                disabled={tokenResponse.status === 'fetching'}
                className="w-full bg-gradient-to-r from-[#0060F0] to-[#0080FF] hover:from-[#0050D0] hover:to-[#0070E0] text-white font-bold py-3 px-4 rounded-xl shadow-lg shadow-blue-900/50 transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {tokenResponse.status === 'fetching' ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" viewBox="0 0 24 24" fill="none">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                    </svg>
                    <span>Authenticating with Chase...</span>
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
                    </svg>
                    <span>Issue Bearer Token</span>
                  </>
                )}
              </button>

              {tokenResponse.status === 'active' && (
                <div className="mt-4 p-3 bg-emerald-950/60 border border-emerald-500/40 rounded-xl">
                  <div className="flex items-center justify-between text-xs text-emerald-300 font-semibold mb-1">
                    <span className="flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                      Token Active
                    </span>
                    <span className="font-mono">{formatTime(secondsRemaining)} remaining</span>
                  </div>
                  <div className="w-full bg-slate-900 rounded-full h-1.5 mt-2 overflow-hidden">
                    <div
                      className="bg-emerald-400 h-full transition-all duration-1000"
                      style={{ width: `${(secondsRemaining / 3600) * 100}%` }}
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Architecture Card */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <h3 className="text-sm font-bold text-slate-200 uppercase tracking-wider mb-3">
                Security Architecture
              </h3>
              <ul className="space-y-3 text-xs text-slate-300">
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>2-Legged OAuth 2.0:</strong> Client Credentials flow secured at <code>/ccoauth/token</code>.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>Traceability:</strong> Every request requires a non-repeating 128-bit hex trace ID.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>Merchant UUID Isolation:</strong> 128-bit hex UUID ensures full partition between merchant systems.</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-blue-400 font-bold">✓</span>
                  <span><strong>RFC 7636 PKCE:</strong> High-entropy cryptographic verifier and SHA-256 challenges.</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: HEADER ENCODER & BASE64 */}
      {activeTab === 'headers' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h2 className="text-lg font-bold text-white mb-2">HTTP Basic Authorization Header Generator</h2>
            <p className="text-sm text-slate-400 mb-6">
              Chase OAuth Gateway requires <code className="text-blue-300 bg-slate-950 px-1.5 py-0.5 rounded">Authorization: Basic Base64(client_id:client_secret)</code> for obtaining access tokens via <code>POST /ccoauth/token</code>.
            </p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Plain Text Credential Pair</label>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 break-all select-all">
                    {credentials.clientId || '<EMPTY_CLIENT_ID>'}:{credentials.clientSecret || '<EMPTY_CLIENT_SECRET>'}
                  </div>
                </div>

                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Base64 Encoded Value</label>
                  <div className="relative">
                    <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-amber-300 break-all select-all pr-16">
                      {basicAuthBase64}
                    </div>
                    <button
                      onClick={() => copyToClipboard(basicAuthBase64, 'Base64 Header')}
                      className="absolute right-2 top-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-semibold text-slate-300 block mb-1">Full HTTP Header String</label>
                  <div className="relative">
                    <pre className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto">
                      Authorization: Basic {basicAuthBase64}
                    </pre>
                    <button
                      onClick={() => copyToClipboard(`Authorization: Basic ${basicAuthBase64}`, 'Full Header')}
                      className="absolute right-2 top-2 px-2.5 py-1 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded-lg border border-slate-700 transition-colors"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 text-xs text-slate-400 space-y-2">
                  <div className="font-semibold text-slate-200 flex items-center gap-1.5">
                    <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    Production Security Standard
                  </div>
                  <p>
                    Ensure your application secrets are never committed to client bundles. In standard merchant production architectures, this Basic Auth exchange is orchestrated server-side on backend API gateways or edge proxies.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Full Chase Request Header Suite */}
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <h3 className="text-md font-bold text-white mb-4">Complete CLPWPE Request Headers Bundle</h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950 text-slate-400 uppercase text-[10px] tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="p-3">Header Name</th>
                    <th className="p-3">Required</th>
                    <th className="p-3">Max Length</th>
                    <th className="p-3">Current Resolved Value</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-slate-300">
                  <tr>
                    <td className="p-3 font-bold text-blue-400">enrollment-type-code</td>
                    <td className="p-3 text-emerald-400">Yes</td>
                    <td className="p-3 text-slate-500">30</td>
                    <td className="p-3 text-slate-200">{credentials.enrollmentTypeCode}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => copyToClipboard(credentials.enrollmentTypeCode, 'enrollment-type-code')} className="text-slate-400 hover:text-white">Copy</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-400">external-account-identifier</td>
                    <td className="p-3 text-emerald-400">Yes</td>
                    <td className="p-3 text-slate-500">32</td>
                    <td className="p-3 text-slate-200">{credentials.externalAccountIdentifier}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => copyToClipboard(credentials.externalAccountIdentifier, 'external-account-identifier')} className="text-slate-400 hover:text-white">Copy</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-400">trace-id</td>
                    <td className="p-3 text-emerald-400">Yes</td>
                    <td className="p-3 text-slate-500">32</td>
                    <td className="p-3 text-purple-300">{credentials.traceId}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => copyToClipboard(credentials.traceId, 'trace-id')} className="text-slate-400 hover:text-white">Copy</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-400">channel-type</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3 text-slate-500">15</td>
                    <td className="p-3 text-slate-200">{credentials.channelType}</td>
                    <td className="p-3 text-right">
                      <button onClick={() => copyToClipboard(credentials.channelType, 'channel-type')} className="text-slate-400 hover:text-white">Copy</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-400">authorization</td>
                    <td className="p-3 text-slate-500">No (OAuth2)</td>
                    <td className="p-3 text-slate-500">8000</td>
                    <td className="p-3 text-emerald-300 truncate max-w-xs">
                      {tokenResponse.accessToken ? `Bearer ${tokenResponse.accessToken.substring(0, 24)}...` : 'Bearer <Pending_Token>'}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => copyToClipboard(tokenResponse.accessToken ? `Bearer ${tokenResponse.accessToken}` : '', 'authorization')} className="text-slate-400 hover:text-white">Copy</button>
                    </td>
                  </tr>
                  <tr>
                    <td className="p-3 font-bold text-blue-400">authorization2</td>
                    <td className="p-3 text-slate-500">No</td>
                    <td className="p-3 text-slate-500">8000</td>
                    <td className="p-3 text-slate-400 truncate max-w-xs">
                      {credentials.authorization2Token || '<none>'}
                    </td>
                    <td className="p-3 text-right">
                      <button onClick={() => copyToClipboard(credentials.authorization2Token, 'authorization2')} className="text-slate-400 hover:text-white">Copy</button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: PKCE S256 GENERATOR */}
      {activeTab === 'pkce' && (
        <div className="space-y-6">
          <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-lg font-bold text-white">OAuth 2.0 PKCE (RFC 7636) Generator</h2>
                <p className="text-sm text-slate-400">
                  Cryptographically secure Proof Key for Code Exchange using Web Crypto API SHA-256
                </p>
              </div>
              <button
                onClick={generateNewPkce}
                className="px-4 py-2 bg-[#0060F0] hover:bg-blue-600 text-white text-xs font-bold rounded-xl shadow-lg transition-all flex items-center gap-2 self-start sm:self-auto"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
                Generate Fresh PKCE Pair
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Code Verifier */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    code_verifier <span className="text-slate-500 font-normal">({pkceState.codeVerifier.length} chars)</span>
                  </label>
                  <button
                    onClick={() => copyToClipboard(pkceState.codeVerifier, 'Code Verifier')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={3}
                  value={pkceState.codeVerifier}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-blue-200 resize-none focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  Keep secret on client until exchanging the authorization code with the token server.
                </p>
              </div>

              {/* Code Challenge */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    code_challenge <span className="text-slate-500 font-normal">(Base64URL-encoded SHA-256)</span>
                  </label>
                  <button
                    onClick={() => copyToClipboard(pkceState.codeChallenge, 'Code Challenge')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Copy
                  </button>
                </div>
                <textarea
                  readOnly
                  rows={3}
                  value={pkceState.codeChallenge}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 font-mono text-xs text-emerald-300 resize-none focus:outline-none"
                />
                <p className="text-[11px] text-slate-500">
                  Method: <span className="text-slate-300 font-mono font-bold">S256</span> (Send in initial auth redirect query params).
                </p>
              </div>

              {/* Random State Parameter */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    state <span className="text-slate-500 font-normal">(CSRF Prevention Token)</span>
                  </label>
                  <button
                    onClick={() => copyToClipboard(pkceState.state, 'OAuth State')}
                    className="text-xs text-blue-400 hover:text-blue-300"
                  >
                    Copy
                  </button>
                </div>
                <input
                  type="text"
                  readOnly
                  value={pkceState.state}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2.5 font-mono text-xs text-purple-300 focus:outline-none"
                />
              </div>

              {/* Verifier Entropy Slider */}
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300">
                    Entropy Byte Length ({pkceVerifierLength} bytes)
                  </label>
                  <span className="text-xs text-slate-500">RFC 7636 recommends 43-128</span>
                </div>
                <input
                  type="range"
                  min="32"
                  max="96"
                  value={pkceVerifierLength}
                  onChange={(e) => setPkceVerifierLength(Number(e.target.value))}
                  className="w-full accent-blue-500 cursor-pointer"
                />
              </div>
            </div>

            {/* Generated Authorization URL Preview */}
            <div className="mt-6 pt-6 border-t border-slate-800">
              <label className="text-xs font-semibold text-slate-300 block mb-2">
                3-Legged Auth Request URL Construction Preview
              </label>
              <div className="p-3.5 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 break-all select-all leading-relaxed">
                https://api-sandbox.chase.com/ccoauth/authorize?
                <span className="text-blue-400">response_type=code</span>&
                <span className="text-amber-400">client_id={credentials.clientId || 'YOUR_CLIENT_ID'}</span>&
                <span className="text-emerald-400">redirect_uri=https%3A%2F%2Fpartner.com%2Fcallback</span>&
                <span className="text-purple-400">scope={encodeURIComponent(credentials.scope)}</span>&
                <span className="text-rose-400">state={pkceState.state}</span>&
                <span className="text-sky-400">code_challenge={pkceState.codeChallenge}</span>&
                <span className="text-indigo-400">code_challenge_method=S256</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 4: LIVE TOKEN SIMULATOR */}
      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Control & Endpoint Card */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-4">
              <h2 className="text-lg font-bold text-white">OAuth2 Dispatcher</h2>
              <p className="text-xs text-slate-400">
                Executes mock 2-Legged OAuth Client Credentials token exchange conforming with Chase API Gateway specifications.
              </p>

              <div className="p-3 bg-slate-950 rounded-xl border border-slate-800 text-xs font-mono space-y-1">
                <div className="text-slate-500">POST TARGET</div>
                <div className="text-blue-300 break-all">{credentials.tokenUrl}</div>
              </div>

              <button
                onClick={handleFetchToken}
                disabled={tokenResponse.status === 'fetching'}
                className="w-full bg-[#0060F0] hover:bg-blue-600 text-white font-bold py-3 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2"
              >
                {tokenResponse.status === 'fetching' ? 'Requesting...' : 'Request Access Token'}
              </button>

              <div className="border-t border-slate-800 pt-4 space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Status</span>
                  <span className={`font-bold font-mono uppercase ${
                    tokenResponse.status === 'active' ? 'text-emerald-400' : tokenResponse.status === 'expired' ? 'text-amber-400' : 'text-slate-500'
                  }`}>
                    {tokenResponse.status}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Token Type</span>
                  <span className="text-slate-200 font-mono">{tokenResponse.tokenType}</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Expires In</span>
                  <span className="text-slate-200 font-mono">{tokenResponse.expiresIn}s ({formatTime(secondsRemaining)})</span>
                </div>
              </div>
            </div>

            {/* Token Response Payload Viewer */}
            <div className="lg:col-span-2 bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    API Response Body (JSON)
                  </h3>
                </div>
                {tokenResponse.accessToken && (
                  <button
                    onClick={() => copyToClipboard(JSON.stringify(tokenResponse.rawResponse, null, 2), 'Token JSON')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                  >
                    Copy JSON
                  </button>
                )}
              </div>

              {tokenResponse.status === 'error' ? (
                <div className="p-4 bg-rose-950/60 border border-rose-600/40 rounded-xl text-rose-300 font-mono text-xs">
                  {tokenResponse.errorMessage}
                </div>
              ) : tokenResponse.accessToken ? (
                <div className="space-y-4">
                  <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto max-h-72">
                    {JSON.stringify(tokenResponse.rawResponse, null, 2)}
                  </pre>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-300">Raw Bearer Authorization Header</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        readOnly
                        value={`Bearer ${tokenResponse.accessToken}`}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs font-mono text-blue-300 focus:outline-none"
                      />
                      <button
                        onClick={() => copyToClipboard(`Bearer ${tokenResponse.accessToken}`, 'Bearer Header')}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-medium rounded-xl border border-slate-700"
                      >
                        Copy
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-12 text-center text-slate-500 font-mono text-xs border border-dashed border-slate-800 rounded-xl">
                  No active token issued. Click &ldquo;Request Access Token&rdquo; to simulate authentication.
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* TAB 5: EXPORT .ENV & CURL */}
      {activeTab === 'envExport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* .env File Format */}
            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-3">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                  <svg className="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                  </svg>
                  Environment Sandbox (.env)
                </h3>
                <button
                  onClick={() => copyToClipboard(envFileContent, '.env File')}
                  className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                >
                  Copy .env
                </button>
              </div>
              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed max-h-96">
                {envFileContent}
              </pre>
            </div>

            {/* cURL Commands Generator */}
            <div className="space-y-6">
              {/* Token cURL */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    cURL: OAuth2 Token Exchange
                  </h3>
                  <button
                    onClick={() => copyToClipboard(curlTokenCommand, 'Token cURL')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                  >
                    Copy cURL
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-amber-300 overflow-x-auto leading-relaxed">
                  {curlTokenCommand}
                </pre>
              </div>

              {/* Enrollment cURL */}
              <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold text-white uppercase tracking-wider">
                    cURL: CLPWPE Enrollment POST
                  </h3>
                  <button
                    onClick={() => copyToClipboard(curlEnrollmentPostCommand, 'Enrollment cURL')}
                    className="text-xs text-blue-400 hover:text-blue-300 font-mono"
                  >
                    Copy cURL
                  </button>
                </div>
                <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-sky-300 overflow-x-auto leading-relaxed">
                  {curlEnrollmentPostCommand}
                </pre>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Branding */}
      <footer className="mt-12 pt-6 border-t border-slate-800 text-center text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>JPMorgan Chase & Co. • Card Loyalty Pay with Points (CLPWPE) Developer Vault</div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Target: api.chase.com</span>
          <span>•</span>
          <span>OAuth 2.0 (2-Legged)</span>
          <span>•</span>
          <span>128-Bit Hex RFC Compliant</span>
        </div>
      </footer>
    </div>
  );
};

export default ChaseClientCredentialVault;
components/chase/ChaseArchitectureFlowDiagram.tsx
e === 1 ? 'border-amber-400 text-amber-400' : 'border-gray-500 text-gray-500'}`}>
                {step.stepNumber}
              </div>
              <span className={`text-xs mt-1 font-medium ${step.state === 2 ? 'text-emerald-400' : step.state === 1 ? 'text-amber-300 font-semibold' : 'text-gray-400'}`}>
                {step.id}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* FOOTER: SECURITY & SYSTEM ATTRIBUTES */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-xs font-mono text-gray-400 border-t border-blue-950 pt-4">
        <div className="bg-[#051326] p-3 rounded border border-blue-900/40">
          <div className="text-gray-300 font-bold mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-400 inline-block"></span>
            OAuth 2.0 Mutual TLS
          </div>
          <div>2-Legged Client Credentials &amp; 3-Legged PKCE with AES-256 payload integrity.</div>
        </div>

        <div className="bg-[#051326] p-3 rounded border border-blue-900/40">
          <div className="text-gray-300 font-bold mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-cyan-400 inline-block"></span>
            128-Bit Hex Traceability
          </div>
          <div>End-to-end `trace-id` propagation across all Chase perimeter nodes.</div>
        </div>

        <div className="bg-[#051326] p-3 rounded border border-blue-900/40">
          <div className="text-gray-300 font-bold mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-purple-400 inline-block"></span>
            Account UUID Isolation
          </div>
          <div>Strict 128-bit persistent merchant UUIDs decoupling PAN/PII data.</div>
        </div>

        <div className="bg-[#051326] p-3 rounded border border-blue-900/40">
          <div className="text-gray-300 font-bold mb-1 flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-blue-400 inline-block"></span>
            SLA &amp; Resilience
          </div>
          <div>99.999% uptime target with sub-50ms Gateway forward latency.</div>
        </div>
      </div>
    </div>
  );
};

export default ChaseArchitectureFlowDiagram;
import React, { useState, useEffect } from 'react';

export type FlowType = 'ENROLL' | 'UNENROLL' | 'HEALTH_PING';

export interface ArchitectureNode {
  id: string;
  name: string;
  subTitle: string;
  icon: string;
  color: string;
  description: string;
  ipDomain: string;
  securityZone: string;
}

export interface ArchitectureStep {
  stepNumber: number;
  id: string;
  fromNodeId: string;
  toNodeId: string;
  title: string;
  httpMethod: 'GET' | 'POST' | 'PUT' | 'INTERNAL_RPC' | 'OAUTH_TOKEN';
  endpoint: string;
  description: string;
  requestHeaders?: Record<string, string>;
  responsePayload?: Record<string, any>;
  durationMs: number;
  statusCode: number;
  statusText: string;
  state: 0 | 1 | 2; // 0: upcoming, 1: active, 2: completed
}

const NODES: Record<string, ArchitectureNode> = {
  APP: {
    id: 'APP',
    name: 'Partner Merchant App',
    subTitle: 'Digital Channel Originator',
    icon: '📱',
    color: '#00D4FF',
    description: 'Merchant e-commerce checkout, iOS/Android client, or POS channel triggering loyalty enrollments.',
    ipDomain: 'merchant-checkout.partner.com',
    securityZone: 'Partner DMZ (External)',
  },
  GATEWAY: {
    id: 'GATEWAY',
    name: 'Chase API Gateway',
    subTitle: 'Perimeter Security & Rate Limiting',
    icon: '🛡️',
    color: '#0060F0',
    description: 'Enforces mutual TLS, OAuth2 bearer validation, 128-bit trace-id routing, and DDoS throttling.',
    ipDomain: 'api.chase.com / api-sandbox.chase.com',
    securityZone: 'JPMorgan Enterprise Edge Layer',
  },
  AUTH_SERVICE: {
    id: 'AUTH_SERVICE',
    name: 'Chase Auth Service',
    subTitle: '2-Legged OAuth & Token Dispenser',
    icon: '🔐',
    color: '#A855F7',
    description: 'Validates OAuth2 bearer scopes (card), verifies authorization2 headers, and issues JWT tokens.',
    ipDomain: 'api.chase.com/ccoauth/token',
    securityZone: 'JPMC Core Security Enclave',
  },
  CLPWPE_CORE: {
    id: 'CLPWPE_CORE',
    name: 'CLPWPE Service',
    subTitle: 'Card Loyalty Pay With Points Engine',
    icon: '💳',
    color: '#10B981',
    description: 'Core rewards processor managing enrollment status dates, RPC codes (Sapphire/Ink/Freedom), and auto-enroll.',
    ipDomain: 'internal.rewards.chase.com/v1',
    securityZone: 'JPMC High Security Core Banking',
  },
};

const ENROLL_STEPS: Omit<ArchitectureStep, 'state'>[] = [
  {
    stepNumber: 1,
    id: 'PING_HEALTH',
    fromNodeId: 'APP',
    toNodeId: 'GATEWAY',
    title: 'Pre-flight Health Verification',
    httpMethod: 'GET',
    endpoint: '/card/loyalty/earn-rewards/enrollment/v1/ping',
    description: 'App verifies gateway latency and active availability of the CLPWPE enrollment clusters.',
    requestHeaders: {
      'Accept': 'application/json',
      'trace-id': 'e849fa8192ab41029c0182741fa9021a',
    },
    responsePayload: {
      status: 'UP',
      cluster: 'chase-pwp-prod-east-01',
      latency: '12ms',
    },
    durationMs: 38,
    statusCode: 200,
    statusText: 'OK',
  },
  {
    stepNumber: 2,
    id: 'GATEWAY_HEALTH_ACK',
    fromNodeId: 'GATEWAY',
    toNodeId: 'APP',
    title: '200 OK Health Acknowledgement',
    httpMethod: 'GET',
    endpoint: '/ping (Response)',
    description: 'API Gateway returns 200 OK confirming API endpoints are fully operational for traffic.',
    responsePayload: { status: 'OK', httpStatus: 200 },
    durationMs: 14,
    statusCode: 200,
    statusText: 'OK',
  },
  {
    stepNumber: 3,
    id: 'POST_ENROLL_DISPATCH',
    fromNodeId: 'APP',
    toNodeId: 'GATEWAY',
    title: 'POST /enrollments/{account-reference-uuid}',
    httpMethod: 'POST',
    endpoint: '/merchants/programs/pay-with-points/enrollments/c8b417c8-9e53-43f1-9fb0-9118c7bf9012',
    description: 'Transmits 128-bit persistent account reference UUID along with enrollment headers to Chase Gateway.',
    requestHeaders: {
      'enrollment-type-code': 'ENROLL',
      'external-account-identifier': 'EXT-ACC-88392019-NY',
      'channel-type': 'WEB',
      'trace-id': 'e849fa8192ab41029c0182741fa9021a',
      'authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    durationMs: 82,
    statusCode: 202,
    statusText: 'Accepted for Ingestion',
  },
  {
    stepNumber: 4,
    id: 'AUTH_VALIDATION_CALL',
    fromNodeId: 'GATEWAY',
    toNodeId: 'AUTH_SERVICE',
    title: 'OAuth2 Bearer & Scope Validation',
    httpMethod: 'OAUTH_TOKEN',
    endpoint: 'internal://auth.chase.com/oauth/v2/introspect',
    description: 'Gateway offloads bearer token validation, checking client credentials and "card" authorization scope.',
    requestHeaders: {
      'Authorization': 'Basic MTI4YmFzZTY0dG9rZW46c2VjcmV0',
      'X-Scope-Required': 'card',
      'trace-id': 'e849fa8192ab41029c0182741fa9021a',
    },
    durationMs: 25,
    statusCode: 200,
    statusText: 'Authorized (Valid Token)',
  },
  {
    stepNumber: 5,
    id: 'AUTH_VALIDATION_RETURN',
    fromNodeId: 'AUTH_SERVICE',
    toNodeId: 'GATEWAY',
    title: 'Token Validated & Claims Returned',
    httpMethod: 'OAUTH_TOKEN',
    endpoint: 'internal://auth.chase.com/oauth/v2/introspect (Response)',
    description: 'Auth Service certifies token authenticity and forwards validated customer relationship metadata.',
    responsePayload: {
      active: true,
      scope: 'card',
      client_id: 'sandbox_jpm_chase_pwp_client_094fbc8a',
      tier: 'PLATINUM_RESERVE',
    },
    durationMs: 18,
    statusCode: 200,
    statusText: 'Token Certified',
  },
  {
    stepNumber: 6,
    id: 'FORWARD_TO_CLPWPE',
    fromNodeId: 'GATEWAY',
    toNodeId: 'CLPWPE_CORE',
    title: 'Internal RPC: Execute Card Enrollment',
    httpMethod: 'INTERNAL_RPC',
    endpoint: 'grpc://rewards-loyalty.core.chase.local/EnrollCardholder',
    description: 'Gateway forwards validated parameters to Card Loyalty engine to update rewards product ledger.',
    requestHeaders: {
      'x-jpmc-route': 'CLPWPE-PROD',
      'x-account-uuid': 'c8b417c8-9e53-43f1-9fb0-9118c7bf9012',
      'trace-id': 'e849fa8192ab41029c0182741fa9021a',
    },
    durationMs: 110,
    statusCode: 200,
    statusText: 'State Transitioned',
  },
  {
    stepNumber: 7,
    id: 'CLPWPE_PROCESS_AND_RESPOND',
    fromNodeId: 'CLPWPE_CORE',
    toNodeId: 'GATEWAY',
    title: 'Enrollment Response Generation',
    httpMethod: 'INTERNAL_RPC',
    endpoint: 'grpc://rewards-loyalty.core.chase.local/EnrollCardholder (Ack)',
    description: 'CLPWPE verifies product code (SAPPHIRE_RESERVE), updates enrollmentStatusDate to today, and returns JSON.',
    responsePayload: {
      enrollment: {
        enrollmentStatusName: 'ENROLLED',
        enrollmentStatusDate: new Date().toISOString().split('T')[0],
      },
      product: {
        merchantDefinedProductCode: 'SAPPHIRE_RESERVE',
      },
    },
    durationMs: 45,
    statusCode: 200,
    statusText: 'Enrollment Object Created',
  },
  {
    stepNumber: 8,
    id: 'GATEWAY_RESPONSE_TO_APP',
    fromNodeId: 'GATEWAY',
    toNodeId: 'APP',
    title: '200 OK: EnrollmentResponse Dispatched',
    httpMethod: 'POST',
    endpoint: '/merchants/programs/pay-with-points/enrollments/... (200 OK)',
    description: 'Final EnrollmentResponse JSON returned to Partner Merchant with 200 OK and Trace Header.',
    responsePayload: {
      enrollment: {
        enrollmentStatusName: 'ENROLLED',
        enrollmentStatusDate: new Date().toISOString().split('T')[0],
      },
      product: {
        merchantDefinedProductCode: 'SAPPHIRE_RESERVE',
      },
    },
    durationMs: 22,
    statusCode: 200,
    statusText: 'HTTP 200 OK (Success)',
  },
];

const UNENROLL_STEPS: Omit<ArchitectureStep, 'state'>[] = [
  {
    stepNumber: 1,
    id: 'UNENROLL_PUT_INITIATE',
    fromNodeId: 'APP',
    toNodeId: 'GATEWAY',
    title: 'PUT /enrollments/{account-reference-uuid}',
    httpMethod: 'PUT',
    endpoint: '/merchants/programs/pay-with-points/enrollments/c8b417c8-9e53-43f1-9fb0-9118c7bf9012',
    description: 'Cardholder requests un-enrollment from Pay with Points program.',
    requestHeaders: {
      'enrollment-type-code': 'ENROLL',
      'external-account-identifier': 'EXT-ACC-88392019-NY',
      'trace-id': 'a194910283bd7810182741fa9021a882',
      'authorization': 'Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
    },
    durationMs: 75,
    statusCode: 200,
    statusText: 'PUT Received',
  },
  {
    stepNumber: 2,
    id: 'UNENROLL_AUTH_CHECK',
    fromNodeId: 'GATEWAY',
    toNodeId: 'AUTH_SERVICE',
    title: 'Validate Token & Opt-Out Permissions',
    httpMethod: 'OAUTH_TOKEN',
    endpoint: 'internal://auth.chase.com/oauth/v2/introspect',
    description: 'Verifies bearer token and validates partner un-enrollment delegation entitlements.',
    durationMs: 22,
    statusCode: 200,
    statusText: 'Authorized',
  },
  {
    stepNumber: 3,
    id: 'UNENROLL_AUTH_ACK',
    fromNodeId: 'AUTH_SERVICE',
    toNodeId: 'GATEWAY',
    title: 'Auth Approval Received',
    httpMethod: 'OAUTH_TOKEN',
    endpoint: 'internal://auth.chase.com/oauth/v2/introspect (Ack)',
    description: 'Authentication Service permits revocation of cardholder membership.',
    durationMs: 15,
    statusCode: 200,
    statusText: 'Approved',
  },
  {
    stepNumber: 4,
    id: 'UNENROLL_CLPWPE_EXECUTE',
    fromNodeId: 'GATEWAY',
    toNodeId: 'CLPWPE_CORE',
    title: 'Execute Un-enrollment Status Modification',
    httpMethod: 'INTERNAL_RPC',
    endpoint: 'grpc://rewards-loyalty.core.chase.local/UnenrollCardholder',
    description: 'Modifies enrollment status in core ledger from ENROLLED to UN-ENROLLED.',
    durationMs: 95,
    statusCode: 200,
    statusText: 'Status Altered',
  },
  {
    stepNumber: 5,
    id: 'UNENROLL_CLPWPE_CONFIRM',
    fromNodeId: 'CLPWPE_CORE',
    toNodeId: 'GATEWAY',
    title: 'Un-enrollment Object Confirmation',
    httpMethod: 'INTERNAL_RPC',
    endpoint: 'grpc://rewards-loyalty.core.chase.local/UnenrollCardholder (Ack)',
    description: 'Returns UN-ENROLLED status with newly stamped status modification date.',
    responsePayload: {
      enrollment: {
        enrollmentStatusName: 'UN-ENROLLED',
        enrollmentStatusDate: new Date().toISOString().split('T')[0],
      },
      product: {
        merchantDefinedProductCode: 'SAPPHIRE_RESERVE',
      },
    },
    durationMs: 35,
    statusCode: 200,
    statusText: 'Ledger Updated',
  },
  {
    stepNumber: 6,
    id: 'UNENROLL_FINAL_200',
    fromNodeId: 'GATEWAY',
    toNodeId: 'APP',
    title: '200 OK: Un-enrollment Confirmed',
    httpMethod: 'PUT',
    endpoint: '/merchants/programs/pay-with-points/enrollments/... (200 OK)',
    description: 'Partner app receives full Un-Enrollment confirmation payload.',
    responsePayload: {
      enrollment: {
        enrollmentStatusName: 'UN-ENROLLED',
        enrollmentStatusDate: new Date().toISOString().split('T')[0],
      },
      product: {
        merchantDefinedProductCode: 'SAPPHIRE_RESERVE',
      },
    },
    durationMs: 18,
    statusCode: 200,
    statusText: 'HTTP 200 OK',
  },
];

export const ChaseArchitectureFlowDiagram: React.FC = () => {
  const [selectedFlow, setSelectedFlow] = useState<FlowType>('ENROLL');
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [playbackSpeed, setPlaybackSpeed] = useState<number>(1800); // ms per step
  const [focusedNodeId, setFocusedNodeId] = useState<string | null>(null);

  // Initialize steps based on current flow
  const rawSteps = selectedFlow === 'ENROLL' ? ENROLL_STEPS : UNENROLL_STEPS;
  
  const steps: ArchitectureStep[] = rawSteps.map((step, idx) => {
    let state: 0 | 1 | 2 = 0;
    if (idx < currentStepIndex) state = 2; // completed
    else if (idx === currentStepIndex) state = 1; // active
    return { ...step, state };
  });

  const currentStep = steps[currentStepIndex] || steps[0];

  // Auto-advancing playback timer
  useEffect(() => {
    if (!isPlaying) return;

    const timer = setTimeout(() => {
      setCurrentStepIndex((prev) => {
        if (prev >= steps.length - 1) {
          return 0; // loop back
        }
        return prev + 1;
      });
    }, playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentStepIndex, steps.length, playbackSpeed]);

  const handleFlowChange = (newFlow: FlowType) => {
    setSelectedFlow(newFlow);
    setCurrentStepIndex(0);
    setIsPlaying(true);
  };

  const handleStepSelect = (index: number) => {
    setCurrentStepIndex(index);
    setIsPlaying(false);
  };

  return (
    <div className="w-full bg-[#030914] text-gray-100 rounded-xl p-4 md:p-8 border border-blue-900/60 shadow-2xl font-sans">
      {/* HEADER SECTION */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between border-b border-blue-950 pb-6 mb-8 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 rounded bg-[#0060F0]/20 border border-[#0060F0] text-[#0080FF] text-xs font-mono font-bold uppercase tracking-wider">
              JPMorgan Chase Architecture Spec
            </span>
            <span className="text-xs text-gray-400 font-mono">CLPWPE-FLOW-V1</span>
          </div>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mt-1 tracking-tight">
            Card Loyalty Pay With Points End-to-End Topology
          </h2>
          <p className="text-sm text-gray-400 mt-1 max-w-3xl">
            Real-time interactive sequence visualizer mapping external merchant partner requests across the perimeter API Gateway, authentication token introspection clusters, and the core CLPWPE ledger.
          </p>
        </div>

        {/* FLOW SWITCHER & CONTROLS */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0A192F] p-1 rounded-lg border border-blue-900/80 flex items-center">
            <button
              onClick={() => handleFlowChange('ENROLL')}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-mono transition-all ${
                selectedFlow === 'ENROLL'
                  ? 'bg-[#0060F0] text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              POST Enrollment (Self/Auto)
            </button>
            <button
              onClick={() => handleFlowChange('UNENROLL')}
              className={`px-3 py-1.5 rounded text-xs font-semibold font-mono transition-all ${
                selectedFlow === 'UNENROLL'
                  ? 'bg-amber-600 text-white shadow-md'
                  : 'text-gray-400 hover:text-gray-200'
              }`}
            >
              PUT Un-enrollment
            </button>
          </div>

          <div className="flex items-center gap-2 bg-[#0A192F] px-3 py-1.5 rounded-lg border border-blue-900/80">
            <button
              onClick={() => setIsPlaying(!isPlaying)}
              className="text-xs font-mono px-2 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded text-blue-300 flex items-center gap-1.5"
            >
              {isPlaying ? (
                <>
                  <span className="w-2 h-2 bg-emerald-400 rounded-full animate-pulse"></span>
                  PAUSE
                </>
              ) : (
                <>
                  <span className="w-2 h-2 bg-amber-400 rounded-full"></span>
                  PLAY
                </>
              )}
            </button>

            <button
              onClick={() => handleStepSelect(0)}
              className="text-xs font-mono px-2 py-1 bg-blue-950 hover:bg-blue-900 border border-blue-800 rounded text-gray-300"
              title="Restart Sequence"
            >
              ↺ RESTART
            </button>

            <select
              value={playbackSpeed}
              onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
              className="bg-blue-950 text-xs font-mono text-gray-300 border border-blue-800 rounded px-1.5 py-1 focus:outline-none"
            >
              <option value={2800}>0.5x Slow</option>
              <option value={1800}>1.0x Normal</option>
              <option value={900}>2.0x Fast</option>
            </select>
          </div>
        </div>
      </div>

      {/* INTERACTIVE NODES TOPOLOGY GRID */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {Object.values(NODES).map((node) => {
          const isOrigin = currentStep.fromNodeId === node.id;
          const isTarget = currentStep.toNodeId === node.id;
          const isActive = isOrigin || isTarget;
          const isHovered = focusedNodeId === node.id;

          return (
            <div
              key={node.id}
              onMouseEnter={() => setFocusedNodeId(node.id)}
              onMouseLeave={() => setFocusedNodeId(null)}
              className={`relative rounded-xl p-5 border transition-all duration-300 ${
                isActive
                  ? 'bg-[#0B203E] border-[#0080FF] shadow-lg shadow-blue-950 ring-2 ring-[#0060F0]/50'
                  : 'bg-[#06152B] border-blue-950/80 hover:border-blue-800'
              } ${isHovered ? 'scale-[1.02]' : ''}`}
            >
              {/* Active Transfer Badges */}
              {isOrigin && (
                <span className="absolute -top-3 left-4 bg-cyan-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow animate-bounce">
                  TRANSMITTING ORIGIN
                </span>
              )}
              {isTarget && (
                <span className="absolute -top-3 right-4 bg-emerald-600 text-white text-[10px] font-mono px-2 py-0.5 rounded-full font-bold shadow animate-pulse">
                  INGESTING TARGET
                </span>
              )}

              <div className="flex items-center justify-between mb-3">
                <span className="text-2xl">{node.icon}</span>
                <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-blue-950 text-blue-300 border border-blue-800">
                  {node.id}
                </span>
              </div>

              <h3 className="font-bold text-white text-base tracking-tight">{node.name}</h3>
              <p className="text-xs text-blue-300 font-medium mb-3">{node.subTitle}</p>

              <div className="space-y-1.5 text-[11px] font-mono text-gray-400 border-t border-blue-900/40 pt-3">
                <div className="truncate">
                  <span className="text-gray-500">HOST:</span> {node.ipDomain}
                </div>
                <div className="truncate">
                  <span className="text-gray-500">ZONE:</span> {node.securityZone}
                </div>
              </div>

              <p className="text-xs text-gray-300 mt-3 line-clamp-2">
                {node.description}
              </p>
            </div>
          );
        })}
      </div>

      {/* ACTIVE SEQUENCE STEP INSPECTION BOARD */}
      <div className="bg-[#051326] rounded-xl border border-blue-900/60 p-6 mb-8 shadow-inner">
        <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-blue-950 gap-2">
          <div className="flex items-center gap-3">
            <span className="w-8 h-8 rounded-full bg-[#0060F0] text-white flex items-center justify-center font-mono font-bold text-sm shadow">
              {currentStep.stepNumber}
            </span>
            <div>
              <span className="text-xs font-mono text-blue-400 uppercase font-semibold">
                Active Step Execution ({currentStepIndex + 1} of {steps.length})
              </span>
              <h4 className="text-lg font-bold text-white">{currentStep.title}</h4>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className={`px-2.5 py-1 rounded text-xs font-mono font-bold ${
              currentStep.httpMethod === 'POST'
                ? 'bg-blue-900/80 text-blue-300 border border-blue-700'
                : currentStep.httpMethod === 'PUT'
                ? 'bg-amber-900/80 text-amber-300 border border-amber-700'
                : currentStep.httpMethod === 'INTERNAL_RPC'
                ? 'bg-emerald-900/80 text-emerald-300 border border-emerald-700'
                : currentStep.httpMethod === 'OAUTH_TOKEN'
                ? 'bg-purple-900/80 text-purple-300 border border-purple-700'
                : 'bg-teal-900/80 text-teal-300 border border-teal-700'
            }`}>
              {currentStep.httpMethod}
            </span>

            <span className="px-2.5 py-1 rounded text-xs font-mono font-bold bg-emerald-950 text-emerald-300 border border-emerald-800">
              STATUS {currentStep.statusCode} {currentStep.statusText}
            </span>

            <span className="text-xs font-mono text-gray-400">
              ⏱ {currentStep.durationMs}ms
            </span>
          </div>
        </div>

        {/* STEP DETAILS & IN-FLIGHT PACKET */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
          {/* Transmission Path Narrative */}
          <div className="lg:col-span-5 space-y-4">
            <div>
              <span className="text-xs font-mono text-gray-400">TRANSMISSION VECTOR</span>
              <div className="flex items-center gap-2 mt-1 font-mono text-sm bg-[#071933] p-3 rounded border border-blue-900/40">
                <span className="text-cyan-400 font-bold">{NODES[currentStep.fromNodeId]?.name}</span>
                <span className="text-gray-500">➔</span>
                <span className="text-emerald-400 font-bold">{NODES[currentStep.toNodeId]?.name}</span>
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-gray-400">PROTOCOL ENDPOINT</span>
              <div className="font-mono text-xs text-blue-200 bg-[#071933] p-3 rounded border border-blue-900/40 break-all">
                {currentStep.endpoint}
              </div>
            </div>

            <div>
              <span className="text-xs font-mono text-gray-400">PROTOCOL NARRATIVE</span>
              <p className="text-sm text-gray-300 mt-1 leading-relaxed bg-[#071933] p-3 rounded border border-blue-900/40">
                {currentStep.description}
              </p>
            </div>
          </div>

          {/* Wire Inspector (Headers & Payloads) */}
          <div className="lg:col-span-7 bg-[#020A17] rounded-lg p-4 border border-blue-950 font-mono text-xs">
            <div className="flex items-center justify-between border-b border-blue-900/40 pb-2 mb-3">
              <span className="text-gray-400 uppercase text-[11px] font-bold">In-Flight Packet Wire Inspector</span>
              <span className="text-[10px] text-emerald-400">TLS 1.3 / AES-GCM-256</span>
            </div>

            {currentStep.requestHeaders && (
              <div className="mb-4">
                <span className="text-blue-400 font-semibold block mb-1 text-[11px]">// Request Headers</span>
                <div className="bg-[#051326] p-2.5 rounded border border-blue-900/30 text-gray-300 space-y-1">
                  {Object.entries(currentStep.requestHeaders).map(([k, v]) => (
                    <div key={k} className="flex">
                      <span className="text-cyan-300 mr-2">{k}:</span>
                      <span className="text-gray-300 break-all">{v}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {currentStep.responsePayload && (
              <div>
                <span className="text-emerald-400 font-semibold block mb-1 text-[11px]">// Response Payload (application/json)</span>
                <pre className="bg-[#051326] p-2.5 rounded border border-blue-900/30 text-emerald-300 overflow-x-auto">
                  {JSON.stringify(currentStep.responsePayload, null, 2)}
                </pre>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* TIMELINE STEPPER STRIP */}
      <div className="mb-8 overflow-x-auto pb-2">
        <div className="flex items-center justify-between min-w-[700px] relative">
          <div className="absolute top-1/2 left-0 right-0 h-1 bg-blue-950 -translate-y-1/2 z-0"></div>

          {steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => handleStepSelect(idx)}
              className="relative z-10 flex flex-col items-center cursor-pointer group"
            >
              <div className={`w-8 h-8 rounded-full border-2 flex items-center justify-center font-mono text-xs font-bold transition-all ${step.state === 2 ? 'bg-emerald-600 border-emerald-400 text-white' : step.state === 1 ? 'bg-[#0060F0] border-cyan-300 text-white ring-4 ring-blue-900/60 scale-125' : 'bg-[#06152B] border-blue-900 text-gray-500 hover:border-gray-400'}`}>
                {step.state === 2 ? '✓' : step.stepNumber}
              </div>
              <span className={`text-[11px] mt-2 font-mono font-medium whitespace-nowrap ${step.state === 1 ? 'text-cyan-300 font-bold' : step.state === 2 ? 'text-gray-300' : 'text-gray-600'}`}>
                Step {step.stepNumber}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* SWAGGER SPECIFICATION QUICK REFERENCE */}
      <div className="bg-[#071933] rounded-xl border border-blue-900/50 p-5 mb-8">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-bold text-white text-sm flex items-center gap-2">
            <span>📖</span> CLPWPE Swagger 2.0 Contract Endpoints
          </h3>
          <span className="text-xs text-blue-400 font-mono">basePath: /card/loyalty/earn-rewards/enrollment/v1</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
          <div className="p-3 bg-[#030B17] rounded border border-blue-950 hover:border-blue-800 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-teal-400 font-bold">GET /ping</span>
              <span className="text-[10px] text-gray-500">200, 500, 504</span>
            </div>
            <p className="text-gray-400 text-[11px]">System diagnostic operation verifying health &amp; upstream connectivity.</p>
          </div>

          <div className="p-3 bg-[#030B17] rounded border border-blue-950 hover:border-blue-800 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-blue-400 font-bold">POST /merchants/.../enrollments/{'{uuid}'}</span>
              <span className="text-[10px] text-gray-500">200, 400, 401, 409, 500</span>
            </div>
            <p className="text-gray-400 text-[11px]">Enrolls cardholder into Pay with Points (supports AUTOENROLL &amp; ENROLL).</p>
          </div>

          <div className="p-3 bg-[#030B17] rounded border border-blue-950 hover:border-blue-800 transition-colors">
            <div className="flex items-center justify-between mb-1">
              <span className="text-amber-400 font-bold">PUT /merchants/.../enrollments/{'{uuid}'}</span>
              <span className="text-[10px] text-gray-500">200, 400, 401, 403, 409</span>
            </div>
            <p className="text-gray-400 text-[11px]">Un-enrolls cardholder from Pay with Points rewards program.</p>
          </div>
        </div>
      </div>

      {/* INTERACTIVE TIMELINE / PLAYBACK SCRUBBER */}
      <div className="bg-[#051326] rounded-lg p-4 border border-blue-950 mb-6">
        <div className="flex items-center justify-between text-xs font-mono text-gray-400 mb-2">
          <span>STEP SCRUBBER</span>
          <span>{Math.round(((currentStepIndex + 1) / steps.length) * 100)}% COMPLETE</span>
        </div>
        <div className="w-full bg-blue-950 h-2 rounded-full overflow-hidden">
          <div
            className="bg-gradient-to-r from-blue-500 via-cyan-400 to-emerald-400 h-full transition-all duration-300"
            style={{ width: `${((currentStepIndex + 1) / steps.length) * 100}%` }}
          ></div>
        </div>

        <div className="flex items-center justify-between mt-3 gap-2 overflow-x-auto">
          {steps.map((step, idx) => (
            <div
              key={step.id}
              onClick={() => handleStepSelect(idx)}
              className={`flex-1 min-w-[90px] p-2 rounded text-center cursor-pointer font-mono border transition-all ${
                currentStepIndex === idx
                  ? 'bg-blue-900/60 border-cyan-400 text-cyan-200'
                  : 'bg-blue-950/40 border-transparent text-gray-500 hover:text-gray-300'
              }`}
            >
              <div className={`w-5 h-5 mx-auto rounded-full border flex items-center justify-center text-[10px] ${step.state === 2 ? 'border-emerald-400 text-emerald-400' : step.statcomponents/chase/ChaseCompliancePciVault.tsx
import React, { useState, useEffect } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================
export type PciLevel = 'Level 1' | 'Level 2' | 'Level 3' | 'Level 4';
export type AuditStatus = 'COMPLIANT' | 'IN_REVIEW' | 'FLAGGED' | 'REMEDIATED';

export interface PciRequirement {
  id: string;
  section: string;
  title: string;
  description: string;
  status: AuditStatus;
  evidence: string;
  lastAudited: string;
  responsibleOfficer: string;
  chaseControlId: string;
}

export interface EncryptionProfile {
  algorithm: string;
  keyLength: string;
  kcv: string; // Key Check Value
  rotationPeriodDays: number;
  lastRotated: string;
  nextRotation: string;
  hsmFipsLevel: string;
}

export interface SecurityEventLog {
  id: string;
  timestamp: string;
  event: string;
  actor: string;
  ipAddress: string;
  traceId: string;
  pciScopeImpact: 'NONE' | 'OUT_OF_SCOPE_TOKEN' | 'IN_SCOPE_TRANSIENT';
  status: 'SUCCESS' | 'BLOCKED' | 'WARNING';
}

// ==========================================
// CONSTANTS & MOCK DATA
// ==========================================
const INITIAL_PCI_REQUIREMENTS: PciRequirement[] = [
  {
    id: 'PCI-DSS-3.4',
    section: 'Requirement 3: Protect Stored Cardholder Data',
    title: 'Render PAN Unreadable Anywhere It Is Stored',
    description: 'Use strong cryptography with associated key management, tokenization, or hashing to protect primary account numbers.',
    status: 'COMPLIANT',
    evidence: '128-bit UUID Reference Identifiers (account-reference-universal-unique-identifier) decouple PANs across all merchant databases.',
    lastAudited: '2025-01-15',
    responsibleOfficer: 'JPMC Global SecOps - Cryptographic Services',
    chaseControlId: 'CTL-JPM-CRYPTO-8819',
  },
  {
    id: 'PCI-DSS-4.1',
    section: 'Requirement 4: Protect Cardholder Data with Strong Cryptography During Transmission',
    title: 'Encrypt All Cardholder Data Across Open/Public Networks',
    description: 'Enforce TLS 1.3/1.2 with strict ciphersuites on all perimeter API gateways and disable insecure SSL fallbacks.',
    status: 'COMPLIANT',
    evidence: 'Strict HSTS and Mutual TLS on api.chase.com and api-sandbox.chase.com; RSA 4096 & ECDSA P-384 enforced.',
    lastAudited: '2025-02-01',
    responsibleOfficer: 'Edge Perimeter & Gateway Operations',
    chaseControlId: 'CTL-JPM-NETSEC-4012',
  },
  {
    id: 'PCI-DSS-6.5',
    section: 'Requirement 6: Develop and Maintain Secure Systems and Software',
    title: 'Prevent Common Software Vulnerabilities',
    description: 'Enforce continuous SAST/DAST gating, OpenAPI 2.0 strict header validation, and sanitized JSON schema ingestion.',
    status: 'COMPLIANT',
    evidence: 'Automated CI/CD security gate scanning Swagger 2.0 endpoints against CLPWPE contract specs.',
    lastAudited: '2025-02-18',
    responsibleOfficer: 'Rewards & Benefits DevSecOps Lead',
    chaseControlId: 'CTL-JPM-APPSEC-9904',
  },
  {
    id: 'PCI-DSS-8.2',
    section: 'Requirement 8: Identify Users and Authenticate Access to System Components',
    title: 'Multi-Factor Authentication & 2-Legged OAuth2 Secret Vaulting',
    description: 'Enforce 2-legged OAuth 2.0 with client credentials rotation and dual Authorization headers for multi-tenant isolation.',
    status: 'COMPLIANT',
    evidence: 'OAuth token URL (https://api-sandbox.chase.com/ccoauth/token) backed by HSM-managed secrets & short 3600s TTLs.',
    lastAudited: '2025-01-28',
    responsibleOfficer: 'Identity and Access Management (IAM)',
    chaseControlId: 'CTL-JPM-IAM-5110',
  },
  {
    id: 'PCI-DSS-10.2',
    section: 'Requirement 10: Log and Monitor All Access to System Components',
    title: '128-Bit Hex Trace ID End-to-End Audit Trails',
    description: 'Implement automated audit trails for all system components to reconstruct events with strict non-repudiation.',
    status: 'COMPLIANT',
    evidence: 'Mandatory 128-bit lower hex trace-id header required on every GET/POST/PUT endpoint, propagated to Splunk SIEM.',
    lastAudited: '2025-02-20',
    responsibleOfficer: 'Enterprise SIEM & Telemetry Guild',
    chaseControlId: 'CTL-JPM-AUDIT-1209',
  },
  {
    id: 'PCI-DSS-12.8',
    section: 'Requirement 12: Maintain an Information Security Policy',
    title: 'Third-Party Service Provider Relationship Management',
    description: 'Maintain and implement policies to manage service providers with which cardholder data is shared or who could affect security.',
    status: 'COMPLIANT',
    evidence: 'Merchant Relationship Manager Service enforces RPC isolation and verified external-account-identifier headers.',
    lastAudited: '2025-02-10',
    responsibleOfficer: 'Merchant Risk & Compliance Review Board',
    chaseControlId: 'CTL-JPM-TPRM-3042',
  },
];

const INITIAL_LOGS: SecurityEventLog[] = [
  {
    id: 'EVT-908124',
    timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    event: 'POST /enrollments (Auto-enroll 128-bit UUID Verification)',
    actor: 'MERCHANT_SVC_094FBC',
    ipAddress: '198.51.100.44',
    traceId: '7a9b0c1d2e3f405162738495a6b7c8d9',
    pciScopeImpact: 'OUT_OF_SCOPE_TOKEN',
    status: 'SUCCESS',
  },
  {
    id: 'EVT-908123',
    timestamp: new Date(Date.now() - 1000 * 60 * 12).toISOString(),
    event: 'OAuth2 2-Legged Bearer Token Issuance',
    actor: 'APP_AUTH_DISPATCHER',
    ipAddress: '198.51.100.44',
    traceId: '8f0a1b2c3d4e5f60718293a4b5c6d7e8',
    pciScopeImpact: 'NONE',
    status: 'SUCCESS',
  },
  {
    id: 'EVT-908122',
    timestamp: new Date(Date.now() - 1000 * 60 * 25).toISOString(),
    event: 'Blocked Insecure HTTP Attempt (Strict TLS Enforcement)',
    actor: 'UNKNOWN_CLIENT',
    ipAddress: '203.0.113.89',
    traceId: '112233445566778899aabbccddeeff00',
    pciScopeImpact: 'NONE',
    status: 'BLOCKED',
  },
  {
    id: 'EVT-908121',
    timestamp: new Date(Date.now() - 1000 * 60 * 48).toISOString(),
    event: 'PUT /enrollments (Un-enrollment Status Modification to UN-ENROLLED)',
    actor: 'MERCHANT_SVC_094FBC',
    ipAddress: '198.51.100.44',
    traceId: 'ccddeeff00112233445566778899aabb',
    pciScopeImpact: 'OUT_OF_SCOPE_TOKEN',
    status: 'SUCCESS',
  },
];

// ==========================================
// COMPONENT
// ==========================================
export const ChaseCompliancePciVault: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'matrix' | 'tokenization' | 'hsm' | 'auditLogs' | 'attestation'>('matrix');
  const [pciLevel] = useState<PciLevel>('Level 1');
  const [requirements] = useState<PciRequirement[]>(INITIAL_PCI_REQUIREMENTS);
  const [logs] = useState<SecurityEventLog[]>(INITIAL_LOGS);
  const [selectedReq, setSelectedReq] = useState<PciRequirement | null>(INITIAL_PCI_REQUIREMENTS[0]);

  // Interactive Tokenizer Sandbox
  const [inputPan, setInputPan] = useState<string>('4111 2222 3333 4444');
  const [generatedUuid, setGeneratedUuid] = useState<string>('c8b417c8-9e53-43f1-9fb0-9118c7bf9012');
  const [isTokenizing, setIsTokenizing] = useState<boolean>(false);
  const [tokenizedTimestamp, setTokenizedTimestamp] = useState<string>(new Date().toISOString());

  // HSM Key Profile State
  const [hsmProfile] = useState<EncryptionProfile>({
    algorithm: 'AES-GCM-256 (Envelope Encryption)',
    keyLength: '256 bits (Key Encryption Key: RSA-4096)',
    kcv: '9F 82 A4 (Valid SHA-256)',
    rotationPeriodDays: 90,
    lastRotated: '2025-01-01',
    nextRotation: '2025-04-01 (In 42 days)',
    hsmFipsLevel: 'FIPS 140-2 Level 3 (Luna PCIe HSM)',
  });

  const handleSimulateTokenize = () => {
    setIsTokenizing(true);
    setTimeout(() => {
      // Generate standard pseudo-UUID v4
      const hex = '0123456789abcdef';
      let uuid = '';
      for (let i = 0; i < 36; i++) {
        if (i === 8 || i === 13 || i === 18 || i === 23) {
          uuid += '-';
        } else if (i === 14) {
          uuid += '4';
        } else {
          uuid += hex[Math.floor(Math.random() * 16)];
        }
      }
      setGeneratedUuid(uuid);
      setTokenizedTimestamp(new Date().toISOString());
      setIsTokenizing(false);
    }, 600);
  };

  return (
    <div className="w-full min-h-screen bg-[#020813] text-gray-100 font-sans p-4 sm:p-6 lg:p-8">
      {/* TOP HEADER / JPMC BRANDING */}
      <header className="border-b border-blue-950 pb-6 mb-8 flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-[#0060F0] to-[#0A2540] flex items-center justify-center text-white font-bold text-xl shadow-lg border border-blue-400/30">
              🛡️
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight font-mono">
                  J.P. MORGAN <span className="text-[#0080FF]">PCI-DSS</span>
                </h1>
                <span className="bg-emerald-950 text-emerald-400 border border-emerald-500/40 text-xs px-2.5 py-0.5 rounded-full font-mono font-semibold">
                  PCI-DSS v4.0.1 VERIFIED
                </span>
              </div>
              <p className="text-xs sm:text-sm text-gray-400 mt-0.5">
                Institutional Merchant Relationship Manager • Cardholder Data Environment (CDE) Tokenization Vault
              </p>
            </div>
          </div>
        </div>

        {/* COMPLIANCE STATUS BADGES */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#06152B] border border-blue-900/60 rounded-xl px-4 py-2 text-xs font-mono">
            <span className="text-gray-500 block text-[10px] uppercase">Entity Classification</span>
            <span className="text-white font-bold">{pciLevel} Service Provider</span>
          </div>

          <div className="bg-[#06152B] border border-blue-900/60 rounded-xl px-4 py-2 text-xs font-mono">
            <span className="text-gray-500 block text-[10px] uppercase">SAQ Type</span>
            <span className="text-emerald-400 font-bold">SAQ D for Service Providers</span>
          </div>

          <div className="bg-[#06152B] border border-blue-900/60 rounded-xl px-4 py-2 text-xs font-mono">
            <span className="text-gray-500 block text-[10px] uppercase">AOC Attestation</span>
            <span className="text-blue-400 font-bold">QSA Certified (Annual)</span>
          </div>
        </div>
      </header>

      {/* TOP NAVIGATION TABS */}
      <nav className="flex border-b border-blue-950 mb-8 gap-2 overflow-x-auto pb-2">
        {[
          { id: 'matrix', label: '1. PCI-DSS v4.0 Control Matrix', icon: '📋' },
          { id: 'tokenization', label: '2. Zero-PAN Tokenization Engine', icon: '🔄' },
          { id: 'hsm', label: '3. HSM Cryptographic Key Store', icon: '🔐' },
          { id: 'auditLogs', label: '4. Immutable Trace SIEM Logs', icon: '📊' },
          { id: 'attestation', label: '5. Attestation of Compliance (AOC)', icon: '📜' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium text-xs sm:text-sm transition-all whitespace-nowrap ${
              activeTab === tab.id
                ? 'bg-[#0060F0]/20 text-[#38BDF8] border border-[#0060F0]/60 shadow-lg font-semibold'
                : 'text-gray-400 hover:text-gray-200 hover:bg-slate-900/60 border border-transparent'
            }`}
          >
            <span>{tab.icon}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </nav>

      {/* ========================================================================= */}
      {/* TAB 1: PCI-DSS CONTROL MATRIX                                             */}
      {/* ========================================================================= */}
      {activeTab === 'matrix' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <div className="bg-[#06152B] rounded-2xl border border-blue-900/60 p-5 shadow-xl">
              <div className="flex items-center justify-between border-b border-blue-950 pb-4 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-white tracking-wide">
                    Card Loyalty Pay With Points Compliance Ledger
                  </h2>
                  <p className="text-xs text-gray-400">
                    Comprehensive mapping of CLPWPE Swagger endpoints against PCI-DSS 4.0 mandates.
                  </p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/80 border border-emerald-600/40 px-3 py-1 rounded-full font-bold">
                  6 of 6 Mandatory Gates PASS
                </span>
              </div>

              <div className="space-y-3">
                {requirements.map((req) => (
                  <div
                    key={req.id}
                    onClick={() => setSelectedReq(req)}
                    className={`p-4 rounded-xl border cursor-pointer transition-all ${
                      selectedReq?.id === req.id
                        ? 'bg-[#0A2540] border-[#0060F0] ring-1 ring-[#0060F0]/50 shadow-md'
                        : 'bg-[#040E1E] border-blue-950/70 hover:border-blue-800'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-1.5">
                      <div className="flex items-center gap-2">
                        <span className="font-mono text-xs font-bold text-blue-400 bg-blue-950 px-2 py-0.5 rounded border border-blue-800">
                          {req.id}
                        </span>
                        <h3 className="text-sm font-bold text-white">{req.title}</h3>
                      </div>
                      <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-700">
                        {req.status}
                      </span>
                    </div>
                    <p className="text-xs text-gray-300 line-clamp-2 mt-1">{req.description}</p>
                    <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 mt-2 border-t border-blue-900/30 pt-2">
                      <span>Control: <strong className="text-gray-300">{req.chaseControlId}</strong></span>
                      <span>Audited: <strong className="text-gray-300">{req.lastAudited}</strong></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right Inspector Column */}
          <div className="space-y-6">
            {selectedReq ? (
              <div className="bg-[#06152B] rounded-2xl border border-blue-900/60 p-5 shadow-xl space-y-4">
                <div className="border-b border-blue-950 pb-3">
                  <span className="text-xs font-mono text-blue-400">{selectedReq.section}</span>
                  <h3 className="text-lg font-bold text-white mt-1">{selectedReq.title}</h3>
                </div>

                <div>
                  <span className="text-xs font-mono text-gray-400 uppercase">Requirement Mandate</span>
                  <p className="text-xs text-gray-300 mt-1 bg-[#040E1E] p-3 rounded-lg border border-blue-950 leading-relaxed">
                    {selectedReq.description}
                  </p>
                </div>

                <div>
                  <span className="text-xs font-mono text-gray-400 uppercase">Technical Proof / Control Evidence</span>
                  <div className="text-xs text-emerald-300 mt-1 bg-emerald-950/40 p-3 rounded-lg border border-emerald-800/40 leading-relaxed font-mono">
                    {selectedReq.evidence}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono text-gray-400 border-t border-blue-950 pt-3">
                  <div className="flex justify-between">
                    <span>Audit Status</span>
                    <span className="text-emerald-400 font-bold">{selectedReq.status}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>JPMC Control Code</span>
                    <span className="text-blue-300">{selectedReq.chaseControlId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Responsible Entity</span>
                    <span className="text-gray-200 text-right truncate max-w-[180px]">{selectedReq.responsibleOfficer}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Last QSA Inspection</span>
                    <span className="text-gray-300">{selectedReq.lastAudited}</span>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-[#06152B] rounded-2xl border border-blue-900/60 p-6 text-center text-gray-500 font-mono text-xs">
                Select a PCI requirement to view cryptographic evidence.
              </div>
            )}

            {/* Scope Reducer Callout */}
            <div className="bg-gradient-to-br from-[#06152B] to-[#0A2540] rounded-2xl border border-blue-800/40 p-5 shadow-xl">
              <h4 className="text-sm font-bold text-white flex items-center gap-2 mb-2">
                <span>⚡</span> Merchant Scope Reduction
              </h4>
              <p className="text-xs text-gray-300 leading-relaxed">
                By integrating via Chase&apos;s 128-bit persistent account-reference-uuid instead of raw primary account numbers, external partners de-scope up to <strong>90% of PCI-DSS audit obligations</strong>, shifting cardholder liability to J.P. Morgan&apos;s verified cryptographic core.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 2: ZERO-PAN TOKENIZATION ENGINE                                       */}
      {/* ========================================================================= */}
      {activeTab === 'tokenization' && (
        <div className="space-y-6">
          <div className="bg-[#06152B] rounded-2xl border border-blue-900/60 p-6 shadow-xl">
            <div className="border-b border-blue-950 pb-4 mb-6">
              <h2 className="text-lg font-bold text-white">
                PCI Merchant Relationship Manager: Tokenization Pipeline
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                Demonstrates how raw credit card accounts are transformed into irreversible, 128-bit universally unique identifiers (UUIDs) before partner persistence.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Tokenization Sandbox Form */}
              <div className="space-y-4">
                <div>
                  <label className="text-xs font-mono text-gray-300 font-semibold block mb-1.5">
                    Raw Credit Card PAN (Simulated Merchant Input)
                  </label>
                  <input
                    type="text"
                    value={inputPan}
                    onChange={(e) => setInputPan(e.target.value)}
                    className="w-full bg-[#040E1E] border border-blue-900/80 rounded-xl px-4 py-3 text-sm font-mono text-amber-300 focus:outline-none focus:border-blue-500"
                    placeholder="4111 2222 3333 4444"
                  />
                  <span className="text-[11px] font-mono text-rose-400 mt-1 block">
                    ⚠️ In production, raw PANs NEVER touch merchant databases after tokenization.
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs font-mono text-gray-400 block mb-1">Target Card Product</label>
                    <div className="bg-[#040E1E] border border-blue-900/50 p-2.5 rounded-lg text-xs font-mono text-blue-300">
                      SAPPHIRE_RESERVE
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-mono text-gray-400 block mb-1">Scope Category</label>
                    <div className="bg-[#040E1E] border border-blue-900/50 p-2.5 rounded-lg text-xs font-mono text-emerald-400">
                      PCI Zero-Knowledge
                    </div>
                  </div>
                </div>

                <button
                  onClick={handleSimulateTokenize}
                  disabled={isTokenizing}
                  className="w-full bg-gradient-to-r from-[#0060F0] to-[#0080FF] hover:from-[#0050D0] hover:to-[#0070E0] text-white font-mono text-xs font-bold py-3.5 px-4 rounded-xl shadow-lg transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {isTokenizing ? (
                    <>
                      <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></span>
                      Executing HSM Tokenization...
                    </>
                  ) : (
                    <>
                      <span>🔒</span>
                      Generate 128-Bit Account Reference UUID
                    </>
                  )}
                </button>
              </div>

              {/* Output Result Sandbox */}
              <div className="bg-[#040E1E] rounded-xl border border-blue-950 p-5 space-y-4">
                <div className="flex items-center justify-between border-b border-blue-900/40 pb-2">
                  <span className="text-xs font-mono text-blue-400 uppercase font-bold">
                    Generated Swagger Path Parameter
                  </span>
                  <span className="text-[10px] font-mono bg-emerald-950 text-emerald-300 px-2 py-0.5 rounded border border-emerald-800">
                    Irreversible 128-bit Hex
                  </span>
                </div>

                <div>
                  <label className="text-[11px] font-mono text-gray-400 block mb-1">
                    account-reference-universal-unique-identifier:
                  </label>
                  <div className="bg-[#06152B] p-3 rounded-lg border border-blue-800/60 font-mono text-sm text-emerald-300 break-all select-all font-bold">
                    {generatedUuid}
                  </div>
                </div>

                <div className="space-y-2 text-xs font-mono text-gray-400 border-t border-blue-900/30 pt-3">
                  <div className="flex justify-between">
                    <span>Field Length</span>
                    <span className="text-gray-200">36 bytes (128-bit hex string)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Stored at Partner DB</span>
                    <span className="text-emerald-400 font-bold">YES (Fully Out of Scope)</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Token Timestamp</span>
                    <span className="text-gray-300">{tokenizedTimestamp}</span>
                  </div>
                </div>

                <div className="p-3 bg-blue-950/40 rounded border border-blue-800/40 text-xs font-mono text-blue-300">
                  // Example REST path for enrollment:
                  <div className="text-gray-200 mt-1 text-[11px] break-all">
                    POST /merchants/programs/pay-with-points/enrollments/{generatedUuid}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 3: HSM CRYPTOGRAPHIC KEY STORE                                        */}
      {/* ========================================================================= */}
      {activeTab === 'hsm' && (
        <div className="space-y-6">
          <div className="bg-[#06152B] rounded-2xl border border-blue-900/60 p-6 shadow-xl">
            <div className="border-b border-blue-950 pb-4 mb-6">
              <h2 className="text-lg font-bold text-white">Hardware Security Module (HSM) Key Governance</h2>
              <p className="text-xs text-gray-400 mt-1">
                FIPS 140-2 Level 3 Hardware Root-of-Trust protecting CLPWPE token encryption and dual-key rotation lifecycles.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <div className="bg-[#040E1E] p-4 rounded-xl border border-blue-950 space-y-2">
                <span className="text-xs font-mono text-gray-400">Primary Cipher Suite</span>
                <h3 className="text-base font-bold text-white font-mono">{hsmProfile.algorithm}</h3>
                <p className="text-xs text-gray-400">Authenticated encryption with associated data (AEAD) guarding ledger tokens.</p>
              </div>

              <div className="bg-[#040E1E] p-4 rounded-xl border border-blue-950 space-y-2">
                <span className="text-xs font-mono text-gray-400">Key Length &amp; Wrapper</span>
                <h3 className="text-base font-bold text-emerald-400 font-mono">{hsmProfile.keyLength}</h3>
                <p className="text-xs text-gray-400">Key Encryption Key (KEK) sealed inside HSM tamper-proof boundary.</p>
              </div>

              <div className="bg-[#040E1E] p-4 rounded-xl border border-blue-950 space-y-2">
                <span className="text-xs font-mono text-gray-400">Key Check Value (KCV)</span>
                <h3 className="text-base font-bold text-amber-400 font-mono">{hsmProfile.kcv}</h3>
                <p className="text-xs text-gray-400">Cryptographic proof validating key synchronization across distributed nodes.</p>
              </div>

              <div className="bg-[#040E1E] p-4 rounded-xl border border-blue-950 space-y-2">
                <span className="text-xs font-mono text-gray-400">Hardware Certification</span>
                <h3 className="text-base font-bold text-blue-300 font-mono">{hsmProfile.hsmFipsLevel}</h3>
                <p className="text-xs text-gray-400">Physical tamper-response circuitry with automatic zeroization protections.</p>
              </div>

              <div className="bg-[#040E1E] p-4 rounded-xl border border-blue-950 space-y-2">
                <span className="text-xs font-mono text-gray-400">Rotation Schedule</span>
                <h3 className="text-base font-bold text-white font-mono">Every {hsmProfile.rotationPeriodDays} Days</h3>
                <p className="text-xs text-gray-400">Last rotated on {hsmProfile.lastRotated}; next scheduled: {hsmProfile.nextRotation}.</p>
              </div>

              <div className="bg-[#040E1E] p-4 rounded-xl border border-blue-950 space-y-2">
                <span className="text-xs font-mono text-gray-400">Split-Knowledge Ceremony</span>
                <h3 className="text-base font-bold text-purple-400 font-mono">M-of-N Dual Custody</h3>
                <p className="text-xs text-gray-400">3 of 5 authorized Security Officers required for master key derivation.</p>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 4: IMMUTABLE TRACE SIEM LOGS                                          */}
      {/* ========================================================================= */}
      {activeTab === 'auditLogs' && (
        <div className="space-y-6">
          <div className="bg-[#06152B] rounded-2xl border border-blue-900/60 p-6 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-b border-blue-950 pb-4 mb-4 gap-2">
              <div>
                <h2 className="text-lg font-bold text-white">PCI-DSS Requirement 10: Audit Trails</h2>
                <p className="text-xs text-gray-400">
                  Real-time tamper-evident SIEM telemetry correlated by 128-bit lower hex trace-id headers.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping"></span>
                <span className="text-xs font-mono text-emerald-400 font-bold">LIVE TELEMETRY STREAM</span>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-[#040E1E] text-gray-400 uppercase text-[10px] tracking-wider border-b border-blue-950">
                  <tr>
                    <th className="p-3">Event ID</th>
                    <th className="p-3">Timestamp (UTC)</th>
                    <th className="p-3">Operation / Endpoint</th>
                    <th className="p-3">Actor &amp; IP</th>
                    <th className="p-3">Trace ID (128-bit)</th>
                    <th className="p-3">PCI Scope</th>
                    <th className="p-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-blue-950/60 text-gray-300">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-blue-950/30 transition-colors">
                      <td className="p-3 font-bold text-blue-400">{log.id}</td>
                      <td className="p-3 text-gray-400">{log.timestamp.replace('T', ' ').substring(0, 19)}</td>
                      <td className="p-3 font-medium text-white">{log.event}</td>
                      <td className="p-3 text-gray-300">
                        <div>{log.actor}</div>
                        <div className="text-[10px] text-gray-500">{log.ipAddress}</div>
                      </td>
                      <td className="p-3 text-purple-300 truncate max-w-[140px]" title={log.traceId}>
                        {log.traceId}
                      </td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.pciScopeImpact === 'NONE'
                            ? 'bg-gray-800 text-gray-300'
                            : 'bg-emerald-950 text-emerald-300 border border-emerald-700'
                        }`}>
                          {log.pciScopeImpact}
                        </span>
                      </td>
                      <td className="p-3 text-right">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                          log.status === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300'
                            : 'bg-rose-950 text-rose-300'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* ========================================================================= */}
      {/* TAB 5: ATTESTATION OF COMPLIANCE (AOC)                                    */}
      {/* ========================================================================= */}
      {activeTab === 'attestation' && (
        <div className="space-y-6 max-w-4xl mx-auto">
          <div className="bg-[#06152B] rounded-2xl border border-blue-900/60 p-8 shadow-2xl space-y-6">
            <div className="text-center border-b border-blue-950 pb-6">
              <span className="text-xs font-mono font-bold text-blue-400 uppercase tracking-widest block mb-1">
                Executive Certificate of Compliance
              </span>
              <h2 className="text-2xl font-extrabold text-white">
                PCI-DSS v4.0 Attestation of Compliance (AOC)
              </h2>
              <p className="text-xs text-gray-400 mt-1">
                JPMorgan Chase &amp; Co. • Merchant Loyalty Pay With Points Services
              </p>
            </div>

            <div className="bg-[#040E1E] p-6 rounded-xl border border-blue-950 space-y-4 text-xs font-mono leading-relaxed text-gray-300">
              <p>
                <strong>SECTION 1: ASSESSMENT OVERVIEW</strong><br />
                This document certifies that the <em>Card Loyalty Pay With Points Enrollment API (CLPWPE)</em> infrastructure operated by JPMorgan Chase &amp; Co. has been fully audited by an independent Qualified Security Assessor (QSA) and found to comply in all material respects with the Payment Card Industry Data Security Standard (PCI-DSS) Version 4.0.1.
              </p>

              <p>
                <strong>SECTION 2: TOKENIZATION &amp; ISOLATION CLAUSE</strong><br />
                All merchant partner interactions utilize 128-bit hex UUID account references (<code className="text-emerald-300">account-reference-universal-unique-identifier</code>) and 2-legged OAuth 2.0 bearer authorization. Primary Account Numbers (PANs) are strictly out of scope for participating merchant endpoints.
              </p>

              <div className="grid grid-cols-2 gap-4 border-t border-blue-950 pt-4 text-[11px]">
                <div>
                  <span className="text-gray-500 block">Lead QSA Assessor</span>
                  <span className="font-bold text-white">Global Cybersecurity Assessment Partners LLP</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Target Architecture</span>
                  <span className="font-bold text-white">api.chase.com / CLPWPE v1.0.0</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Assessment Date</span>
                  <span className="font-bold text-white">January 15, 2025</span>
                </div>
                <div>
                  <span className="text-gray-500 block">Certificate Identifier</span>
                  <span className="font-bold text-emerald-400">JPMC-PCI-AOC-2025-0981</span>
                </div>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between pt-4 border-t border-blue-950 gap-4">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 rounded-full bg-blue-950 border border-blue-700 flex items-center justify-center text-xl">
                  📜
                </div>
                <div className="text-xs font-mono">
                  <div className="font-bold text-white">Jamie Dimon Executive Endorsement</div>
                  <div className="text-gray-400">Approved for Tier-1 Global Partner Integrations</div>
                </div>
              </div>

              <button
                onClick={() => alert('Official JPMC PCI-DSS Attestation of Compliance (AOC) PDF Package generated.')}
                className="px-5 py-2.5 bg-[#0060F0] hover:bg-blue-600 text-white font-mono text-xs font-bold rounded-xl shadow-lg transition-all"
              >
                Download Signed AOC (PDF)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER */}
      <footer className="mt-12 pt-6 border-t border-blue-950 text-center text-xs text-gray-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>JPMorgan Chase &amp; Co. • Global Security &amp; Compliance Vault</div>
        <div className="flex items-center gap-4 text-gray-400">
          <span>PCI-DSS 4.0</span>
          <span>•</span>
          <span>FIPS 140-2 Level 3</span>
          <span>•</span>
          <span>ISO/IEC 27001</span>
          <span>•</span>
          <span>SOC 2 Type II</span>
        </div>
      </footer>
    </div>
  );
};

export default ChaseCompliancePciVault;