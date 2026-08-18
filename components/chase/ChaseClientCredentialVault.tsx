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
  const [activeTab, setActiveTab] = useState<'vault' | 'pkce' | 'headers' | 'simulator' | 'envExport'>('vault');
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
  const [pkceState, setPkceState] = useState<PkcePair>({
    codeVerifier: '',
    codeChallenge: '',
    codeChallengeMethod: 'S256',
    state: '',
    timestamp: '',
  });
  const [pkceVerifierLength, setPkceVerifierLength] = useState<number>(64);
  const [tokenResponse, setTokenResponse] = useState<GeneratedTokenState>({
    accessToken: '',
    tokenType: 'Bearer',
    expiresIn: 3600,
    issuedAt: 0,
    scope: 'card',
    status: 'idle',
  });
  const [secondsRemaining, setSecondsRemaining] = useState<number>(0);
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

  const handleEnvironmentChange = (env: ChaseEnvironment) => {
    setCredentials((prev) => ({
      ...prev,
      environment: env,
      tokenUrl: DEFAULT_ENV_ENDPOINTS[env].tokenUrl,
    }));
  };

  const applyPreset = (preset: VaultPreset) => {
    setCredentials((prev) => ({
      ...prev,
      ...preset.credentials,
      environment: preset.environment,
      tokenUrl: DEFAULT_ENV_ENDPOINTS[preset.environment].tokenUrl,
    }));
    showToast(`Applied preset: ${preset.name}`);
  };

  const handleRegenerateTraceId = () => {
    const newId = generate128BitHexTraceId();
    setCredentials((prev) => ({ ...prev, traceId: newId }));
    showToast('New 128-bit hex trace-id generated');
  };

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

  const basicAuthBase64 = useMemo(() => {
    if (!credentials.clientId && !credentials.clientSecret) return '';
    try {
      const raw = `${credentials.clientId}:${credentials.clientSecret}`;
      return btoa(raw);
    } catch {
      return 'Encoding Error';
    }
  }, [credentials.clientId, credentials.clientSecret]);

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

  const formatTime = (secs: number) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

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
      {toastMsg && (
        <div className="fixed bottom-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white px-5 py-3 rounded-xl shadow-2xl border border-emerald-400/30 text-sm font-medium animate-bounce">
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
          </svg>
          {toastMsg}
        </div>
      )}

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

      {activeTab === 'vault' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-6">
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

            <div className="bg-slate-900/90 rounded-2xl border border-slate-800 p-6 shadow-xl backdrop-blur-sm">
              <h2 className="text-lg font-bold text-white tracking-wide mb-4 border-b border-slate-800/80 pb-3 flex items-center justify-between">
                <span>Required Request Headers (CLPWPE)</span>
                <span className="text-xs text-blue-400 font-mono">Swagger 2.0 Spec Compliant</span>
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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

          <div className="space-y-6">
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

      {activeTab === 'simulator' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
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

      {activeTab === 'envExport' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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

            <div className="space-y-6">
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