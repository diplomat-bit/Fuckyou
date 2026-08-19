

// --- CONSOLIDATED FROM: ./components/chase/ChaseJwtInspector.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Types & Interfaces ---

export interface JwtHeader {
  alg?: string;
  typ?: string;
  kid?: string;
  x5t?: string;
  [key: string]: unknown;
}

export interface ChaseJwtClaims {
  iss?: string;
  sub?: string;
  aud?: string | string[];
  exp?: number;
  nbf?: number;
  iat?: number;
  jti?: string;
  client_id?: string;
  scope?: string;
  channel_type?: string;
  partner_id?: string;
  account_ref_uuid?: string;
  ext_acct_id?: string;
  token_type?: string;
  roles?: string[];
  [key: string]: unknown;
}

export interface JwksKey {
  kty: string;
  kid: string;
  use?: string;
  alg?: string;
  n?: string;
  e?: string;
}

export interface ValidationCheck {
  id: string;
  title: string;
  status: 'passed' | 'failed' | 'warning' | 'info';
  details: string;
}

export interface DecodedToken {
  header: JwtHeader;
  payload: ChaseJwtClaims;
  signature: string;
  rawHeader: string;
  rawPayload: string;
}

// --- Sample Chase Tokens for Instant Testing ---

const SAMPLE_TOKENS = {
  twoLeggedValid: (() => {
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'chase-ccoauth-key-2025' }))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      iss: 'https://api.chase.com/ccoauth/token',
      sub: 'merchant-partner-enterprise-app',
      aud: 'https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1',
      exp: now + 3600,
      nbf: now - 30,
      iat: now - 30,
      jti: '018f3a9e-8c3b-7df1-a849-2e6b91129abc',
      client_id: 'prod_merchant_rewards_svc_9921',
      scope: 'card rewards:enrollment:write rewards:enrollment:read',
      channel_type: 'WEB_DESKTOP',
      partner_id: 'PARTNER_GLOBAL_CORP_001',
      token_type: 'Bearer'
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const sig = 'T4tV9X7Y-qN5k_z8E3lR2uX9aP7mD2cK4jL8nB6vQ1wS5hF3gJ7kM9pA2sD4fG6h';
    return `${header}.${payload}.${sig}`;
  })(),
  expiredToken: (() => {
    const header = btoa(JSON.stringify({ alg: 'RS256', typ: 'JWT', kid: 'chase-ccoauth-key-2024' }))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const past = Math.floor(Date.now() / 1000) - 7200;
    const payload = btoa(JSON.stringify({
      iss: 'https://api-sandbox.chase.com/ccoauth/token',
      sub: 'sandbox-test-client',
      aud: 'api.chase.com',
      exp: past + 1800,
      iat: past,
      jti: 'f5c6e812-4029-4d89-9a71-33cbfae52356',
      client_id: 'sandbox_client_id_4491',
      scope: 'card'
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const sig = 'ExpiredSigExample_fA89s87dF7sdF987sf67a8sd76f87asdf687a6sd7';
    return `${header}.${payload}.${sig}`;
  })(),
  missingScopeToken: (() => {
    const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT', kid: 'dev-key-1' }))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      iss: 'https://api.chase.com',
      sub: 'partner-app-restricted',
      aud: 'https://api.chase.com/card',
      exp: now + 1800,
      iat: now,
      scope: 'user:profile merchant:read', // MISSING REQUIRED 'card' SCOPE
      client_id: 'limited_partner_client'
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const sig = 'hmacSignatureMock_kLmN980123_4567890abcdefg';
    return `${header}.${payload}.${sig}`;
  })(),
  insecureNoneAlg: (() => {
    const header = btoa(JSON.stringify({ alg: 'none', typ: 'JWT' }))
      .replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    const now = Math.floor(Date.now() / 1000);
    const payload = btoa(JSON.stringify({
      iss: 'untrusted-issuer.example.com',
      sub: 'admin-escalation',
      exp: now + 3600,
      scope: 'card admin:all'
    })).replace(/=/g, '').replace(/\+/g, '-').replace(/\//g, '_');
    return `${header}.${payload}.`;
  })()
};

// --- Helper Utilities ---

function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return decodeURIComponent(
      atob(base64)
        .split('')
        .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
        .join('')
    );
  } catch {
    throw new Error('Invalid Base64Url encoding');
  }
}

function base64UrlEncode(str: string): string {
  return btoa(
    encodeURIComponent(str).replace(/%([0-9A-F]{2})/g, (_, p1) =>
      String.fromCharCode(parseInt(p1, 16))
    )
  )
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function formatEpochDate(epoch?: number): string {
  if (!epoch) return 'N/A';
  const date = new Date(epoch * 1000);
  return `${date.toISOString()} (${date.toLocaleString()})`;
}

// --- Main Component ---

export const ChaseJwtInspector: React.FC = () => {
  const [tokenInput, setTokenInput] = useState<string>(SAMPLE_TOKENS.twoLeggedValid);
  const [decoded, setDecoded] = useState<DecodedToken | null>(null);
  const [parseError, setParseError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'inspector' | 'headers' | 'credentials' | 'jwks' | 'generator'>('inspector');
  
  // Base64 Credentials State
  const [clientId, setClientId] = useState<string>('prod_merchant_rewards_svc_9921');
  const [clientSecret, setClientSecret] = useState<string>('sec_live_99d14f3b_9019_4bca_chase_enterprise');
  const [authHeaderOutput, setAuthHeaderOutput] = useState<string>('');
  
  // Custom Token Generator State
  const [genAlg, setGenAlg] = useState<string>('RS256');
  const [genClientId, setGenClientId] = useState<string>('prod_merchant_rewards_svc_9921');
  const [genScope, setGenScope] = useState<string>('card');
  const [genTtlSeconds, setGenTtlSeconds] = useState<number>(3600);
  const [genPartnerId, setGenPartnerId] = useState<string>('PARTNER_GLOBAL_CORP_001');

  // Copy Feedback State
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Parse JWT
  const parseToken = useCallback((raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) {
      setDecoded(null);
      setParseError(null);
      return;
    }

    const parts = trimmed.split('.');
    if (parts.length !== 3) {
      setParseError(`Invalid JWT structure: Expected 3 segments separated by dots, got ${parts.length}`);
      setDecoded(null);
      return;
    }

    try {
      const rawHeader = base64UrlDecode(parts[0]);
      const rawPayload = base64UrlDecode(parts[1]);
      const header = JSON.parse(rawHeader) as JwtHeader;
      const payload = JSON.parse(rawPayload) as ChaseJwtClaims;

      setDecoded({
        header,
        payload,
        signature: parts[2],
        rawHeader,
        rawPayload
      });
      setParseError(null);
    } catch (err: unknown) {
      setParseError(`Parsing error: ${err instanceof Error ? err.message : String(err)}`);
      setDecoded(null);
    }
  }, []);

  useEffect(() => {
    parseToken(tokenInput);
  }, [tokenInput, parseToken]);

  // Compute Base64 Basic Auth Header
  useEffect(() => {
    if (!clientId && !clientSecret) {
      setAuthHeaderOutput('');
      return;
    }
    const combined = `${clientId}:${clientSecret}`;
    try {
      const encoded = btoa(combined);
      setAuthHeaderOutput(`Basic ${encoded}`);
    } catch {
      setAuthHeaderOutput('Encoding error: Invalid characters for Base64');
    }
  }, [clientId, clientSecret]);

  // Validation Audits
  const validationChecks = useMemo<ValidationCheck[]>(() => {
    if (!decoded) return [];
    const checks: ValidationCheck[] = [];
    const now = Math.floor(Date.now() / 1000);
    const { header, payload } = decoded;

    // 1. Algorithm Check
    if (header.alg === 'none') {
      checks.push({
        id: 'alg',
        title: 'Signature Algorithm Security',
        status: 'failed',
        details: 'CRITICAL: "alg": "none" is insecure and strictly rejected by Chase Gateway.'
      });
    } else if (header.alg === 'RS256' || header.alg === 'PS256' || header.alg === 'ES256') {
      checks.push({
        id: 'alg',
        title: 'Asymmetric Signature Algorithm',
        status: 'passed',
        details: `Uses secure enterprise algorithm (${header.alg}). Matches Chase Production specification.`
      });
    } else {
      checks.push({
        id: 'alg',
        title: 'Signature Algorithm',
        status: 'warning',
        details: `Using ${header.alg}. Standard Chase 2-Legged OAuth standardizes on RS256.`
      });
    }

    // 2. Expiration (exp)
    if (!payload.exp) {
      checks.push({
        id: 'exp',
        title: 'Token Expiry (exp)',
        status: 'failed',
        details: 'Missing "exp" claim. Tokens must have a finite expiration timestamp.'
      });
    } else if (payload.exp < now) {
      const expiredAgo = Math.round(now - payload.exp);
      checks.push({
        id: 'exp',
        title: 'Token Expiry (exp)',
        status: 'failed',
        details: `Token is EXPIRED by ${expiredAgo}s (${formatEpochDate(payload.exp)}). Gateway will return 401 Unauthorized.`
      });
    } else {
      const remainingSec = Math.round(payload.exp - now);
      checks.push({
        id: 'exp',
        title: 'Token Expiration Time',
        status: 'passed',
        details: `Valid for another ${remainingSec}s (${Math.floor(remainingSec / 60)} min ${remainingSec % 60} sec).`
      });
    }

    // 3. Not Before (nbf)
    if (payload.nbf) {
      if (payload.nbf > now + 30) {
        checks.push({
          id: 'nbf',
          title: 'Not Before (nbf) Check',
          status: 'failed',
          details: `Token not active yet. Future activation date: ${formatEpochDate(payload.nbf)}.`
        });
      } else {
        checks.push({
          id: 'nbf',
          title: 'Not Before (nbf)',
          status: 'passed',
          details: `Active since ${formatEpochDate(payload.nbf)}.`
        });
      }
    }

    // 4. Chase Pay With Points Scope Check ('card')
    const scopes = (payload.scope || '').split(' ').filter(Boolean);
    if (!payload.scope) {
      checks.push({
        id: 'scope',
        title: 'Card Loyalty Scope Verification',
        status: 'failed',
        details: 'Missing "scope" claim in token payload.'
      });
    } else if (scopes.includes('card')) {
      checks.push({
        id: 'scope',
        title: 'Chase Required "card" Scope',
        status: 'passed',
        details: 'OAuth2 scope "card" is present. Card Loyalty Pay With Points Enrollment API authorization granted.'
      });
    } else {
      checks.push({
        id: 'scope',
        title: 'Chase Required "card" Scope',
        status: 'failed',
        details: `Missing mandatory "card" scope. Available scopes: [${scopes.join(', ')}]. Will result in 403 Forbidden or 401 Unauthorized.`
      });
    }

    // 5. Key Identifier (kid) in Header
    if (header.kid) {
      checks.push({
        id: 'kid',
        title: 'JWKS Key Identifier (kid)',
        status: 'passed',
        details: `Key ID "${header.kid}" specified. Enables rapid rotation lookup via Chase JWKS endpoint.`
      });
    } else {
      checks.push({
        id: 'kid',
        title: 'JWKS Key Identifier (kid)',
        status: 'warning',
        details: 'No "kid" provided in header. Multi-key JWKS rotation requires matching kid.'
      });
    }

    // 6. Issuer Check
    if (payload.iss && payload.iss.includes('chase.com')) {
      checks.push({
        id: 'iss',
        title: 'Chase Identity Issuer',
        status: 'passed',
        details: `Legitimate Chase realm issuer: "${payload.iss}"`
      });
    } else {
      checks.push({
        id: 'iss',
        title: 'Issuer Realm',
        status: 'info',
        details: `Issuer: ${payload.iss || 'Unspecified'}`
      });
    }

    return checks;
  }, [decoded]);

  // Handle Token Generator
  const generateNewToken = () => {
    const now = Math.floor(Date.now() / 1000);
    const newHeader = {
      alg: genAlg,
      typ: 'JWT',
      kid: `chase-key-${new Date().getFullYear()}-01`
    };

    const newPayload: ChaseJwtClaims = {
      iss: 'https://api.chase.com/ccoauth/token',
      sub: genClientId,
      aud: 'https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1',
      exp: now + Number(genTtlSeconds),
      nbf: now - 10,
      iat: now,
      jti: 'chase-' + Math.random().toString(36).substring(2, 11) + '-' + Date.now().toString(16),
      client_id: genClientId,
      scope: genScope,
      partner_id: genPartnerId,
      token_type: 'Bearer'
    };

    const hB64 = base64UrlEncode(JSON.stringify(newHeader));
    const pB64 = base64UrlEncode(JSON.stringify(newPayload));
    const mockSig = 'synthetic_sig_' + Math.random().toString(36).substring(2) + Math.random().toString(36).substring(2);
    
    const fullToken = `${hB64}.${pB64}.${mockSig}`;
    setTokenInput(fullToken);
    setActiveTab('inspector');
  };

  // Mock Chase JWKS
  const chaseJwksSample: { keys: JwksKey[] } = {
    keys: [
      {
        kty: 'RSA',
        kid: 'chase-ccoauth-key-2025',
        use: 'sig',
        alg: 'RS256',
        n: 'uR2Z9Q_MockRSA_Modulus_Chase_Enterprise_Grade_Key_Enrollment_V1_abcdef1234567890',
        e: 'AQAB'
      },
      {
        kty: 'RSA',
        kid: 'chase-ccoauth-key-2024',
        use: 'sig',
        alg: 'RS256',
        n: 'vT3A8R_MockRSA_Modulus_Chase_PriorYear_Key_abcdef1234567890',
        e: 'AQAB'
      }
    ]
  };

  return (
    <div className="w-full bg-[#0a1128] text-slate-100 rounded-xl border border-blue-900/50 shadow-2xl overflow-hidden font-sans">
      {/* Top Header Bar */}
      <div className="bg-[#002244] border-b border-blue-800/60 px-6 py-4 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="w-10 h-10 rounded-lg bg-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/30">
            <svg className="w-6 h-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
            </svg>
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-wide text-white flex items-center gap-2">
              Chase JWT Security & OAuth Token Inspector
              <span className="text-xs uppercase bg-blue-500/20 text-blue-300 px-2 py-0.5 rounded border border-blue-400/30">
                2-Legged OAuth
              </span>
            </h1>
            <p className="text-xs text-blue-200/70">
              Card Loyalty Pay with Points Enrollment API Token Engine
            </p>
          </div>
        </div>

        {/* Quick Sample Selector */}
        <div className="flex items-center space-x-2 text-xs">
          <span className="text-slate-400 font-medium">Load Preset:</span>
          <button
            onClick={() => setTokenInput(SAMPLE_TOKENS.twoLeggedValid)}
            className="px-2.5 py-1 rounded bg-blue-950/80 hover:bg-blue-900 border border-blue-700/50 text-blue-200 transition"
          >
            Valid 2-Legged
          </button>
          <button
            onClick={() => setTokenInput(SAMPLE_TOKENS.expiredToken)}
            className="px-2.5 py-1 rounded bg-amber-950/80 hover:bg-amber-900 border border-amber-700/50 text-amber-200 transition"
          >
            Expired
          </button>
          <button
            onClick={() => setTokenInput(SAMPLE_TOKENS.missingScopeToken)}
            className="px-2.5 py-1 rounded bg-rose-950/80 hover:bg-rose-900 border border-rose-700/50 text-rose-200 transition"
          >
            Missing Scope
          </button>
          <button
            onClick={() => setTokenInput(SAMPLE_TOKENS.insecureNoneAlg)}
            className="px-2.5 py-1 rounded bg-purple-950/80 hover:bg-purple-900 border border-purple-700/50 text-purple-200 transition"
          >
            Alg: None
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-blue-900/40 bg-[#07132c] px-6 text-sm">
        <button
          onClick={() => setActiveTab('inspector')}
          className={`py-3 px-4 font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'inspector'
              ? 'border-blue-400 text-blue-300 bg-blue-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
          </svg>
          <span>Token Inspector</span>
        </button>

        <button
          onClick={() => setActiveTab('headers')}
          className={`py-3 px-4 font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'headers'
              ? 'border-blue-400 text-blue-300 bg-blue-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
          </svg>
          <span>Chase Headers Builder</span>
        </button>

        <button
          onClick={() => setActiveTab('credentials')}
          className={`py-3 px-4 font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'credentials'
              ? 'border-blue-400 text-blue-300 bg-blue-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 1121 9z" />
          </svg>
          <span>Basic Auth & Credentials</span>
        </button>

        <button
          onClick={() => setActiveTab('jwks')}
          className={`py-3 px-4 font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'jwks'
              ? 'border-blue-400 text-blue-300 bg-blue-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
          </svg>
          <span>JWKS Public Keys</span>
        </button>

        <button
          onClick={() => setActiveTab('generator')}
          className={`py-3 px-4 font-medium border-b-2 transition flex items-center space-x-2 ${
            activeTab === 'generator'
              ? 'border-blue-400 text-blue-300 bg-blue-950/40'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
          </svg>
          <span>Token Generator</span>
        </button>
      </div>

      <div className="p-6 space-y-6">
        {/* TAB 1: INSPECTOR */}
        {activeTab === 'inspector' && (
          <div className="space-y-6">
            {/* Input Area */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Raw Bearer Token (Authorization: Bearer &lt;token&gt;)
                </label>
                <div className="flex items-center space-x-2">
                  <button
                    onClick={() => copyToClipboard(tokenInput, 'rawToken')}
                    className="text-xs text-blue-400 hover:text-blue-300 flex items-center space-x-1"
                  >
                    <span>{copiedKey === 'rawToken' ? 'Copied!' : 'Copy Token'}</span>
                  </button>
                  <button
                    onClick={() => setTokenInput('')}
                    className="text-xs text-slate-400 hover:text-slate-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
              <textarea
                value={tokenInput}
                onChange={(e) => setTokenInput(e.target.value)}
                placeholder="Paste Bearer JWT token here (Header.Payload.Signature)..."
                rows={3}
                className="w-full bg-[#050b18] border border-blue-900/60 rounded-lg p-3 text-xs font-mono text-blue-200 focus:outline-none focus:ring-2 focus:ring-blue-500/50 break-all resize-y"
              />
              {parseError && (
                <div className="mt-2 p-3 bg-rose-950/60 border border-rose-800/60 rounded text-xs text-rose-200 flex items-start space-x-2">
                  <svg className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span>{parseError}</span>
                </div>
              )}
            </div>

            {/* Decoded Sections Grid */}
            {decoded && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* 1. Header (Red/Rose accent) */}
                <div className="bg-[#050b18] border border-rose-900/40 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-rose-950 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-rose-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-rose-500"></span>
                      1. JOSE Header
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Algorithm & Key</span>
                  </div>
                  <pre className="text-xs font-mono text-rose-200 overflow-x-auto p-2 bg-rose-950/20 rounded flex-1">
                    {JSON.stringify(decoded.header, null, 2)}
                  </pre>
                  <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Algorithm:</span>
                      <span className="font-mono text-rose-300">{decoded.header.alg || 'None'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Key ID (kid):</span>
                      <span className="font-mono text-rose-300 truncate max-w-[140px]">{decoded.header.kid || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* 2. Payload (Purple/Violet accent) */}
                <div className="bg-[#050b18] border border-purple-900/40 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-purple-950 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-purple-500"></span>
                      2. Payload Claims
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">Chase Subject & Scope</span>
                  </div>
                  <pre className="text-xs font-mono text-purple-200 overflow-x-auto p-2 bg-purple-950/20 rounded flex-1 max-h-72">
                    {JSON.stringify(decoded.payload, null, 2)}
                  </pre>
                  <div className="mt-3 text-[11px] text-slate-400 space-y-1">
                    <div className="flex justify-between">
                      <span>Subject:</span>
                      <span className="font-mono text-purple-300 truncate max-w-[140px]">{decoded.payload.sub || 'N/A'}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Scope:</span>
                      <span className={`font-mono font-bold ${decoded.payload.scope?.includes('card') ? 'text-emerald-400' : 'text-rose-400'}`}>
                        {decoded.payload.scope || 'None'}
                      </span>
                    </div>
                  </div>
                </div>

                {/* 3. Signature & Verification (Cyan/Blue accent) */}
                <div className="bg-[#050b18] border border-cyan-900/40 rounded-xl p-4 flex flex-col">
                  <div className="flex items-center justify-between pb-3 border-b border-cyan-950 mb-3">
                    <span className="text-xs font-bold uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                      <span className="w-2.5 h-2.5 rounded-full bg-cyan-500"></span>
                      3. Cryptographic Signature
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">RS256 / SHA-256</span>
                  </div>
                  <div className="p-2 bg-cyan-950/20 rounded flex-1">
                    <p className="text-xs font-mono text-cyan-300 break-all">
                      {decoded.signature || '<Signature Stripped / None>'}
                    </p>
                  </div>
                  <div className="mt-3 p-2.5 bg-blue-950/40 border border-blue-800/40 rounded text-[11px] text-slate-300">
                    <div className="flex items-center justify-between">
                      <span>Token Type:</span>
                      <span className="font-semibold text-blue-300">2-Legged OAuth 2.0</span>
                    </div>
                    <div className="flex items-center justify-between mt-1">
                      <span>Gateway Target:</span>
                      <span className="font-mono text-blue-300">api.chase.com</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Security Audit Verification Checklist */}
            {decoded && (
              <div className="bg-[#050b18] border border-blue-900/50 rounded-xl p-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-bold text-white flex items-center gap-2">
                    <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                    </svg>
                    Chase API Gateway Authorization Pre-Flight Audit
                  </h3>
                  <span className="text-xs text-slate-400">
                    {validationChecks.filter(c => c.status === 'passed').length} / {validationChecks.length} Passed
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {validationChecks.map((check) => (
                    <div
                      key={check.id}
                      className={`p-3 rounded-lg border flex items-start space-x-3 ${
                        check.status === 'passed'
                          ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-100'
                          : check.status === 'failed'
                          ? 'bg-rose-950/20 border-rose-800/40 text-rose-100'
                          : check.status === 'warning'
                          ? 'bg-amber-950/20 border-amber-800/40 text-amber-100'
                          : 'bg-blue-950/20 border-blue-800/40 text-blue-100'
                      }`}
                    >
                      {check.status === 'passed' && (
                        <div className="w-5 h-5 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                      )}
                      {check.status === 'failed' && (
                        <div className="w-5 h-5 rounded-full bg-rose-500/20 border border-rose-500 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-rose-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M6 18L18 6M6 6l12 12" />
                          </svg>
                        </div>
                      )}
                      {check.status === 'warning' && (
                        <div className="w-5 h-5 rounded-full bg-amber-500/20 border border-amber-500 flex items-center justify-center shrink-0 mt-0.5">
                          <svg className="w-3 h-3 text-amber-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 9v2m0 4h.01" />
                          </svg>
                        </div>
                      )}
                      {check.status === 'info' && (
                        <div className="w-5 h-5 rounded-full bg-blue-500/20 border border-blue-500 flex items-center justify-center shrink-0 mt-0.5">
                          <span className="text-[10px] font-bold text-blue-400">i</span>
                        </div>
                      )}

                      <div className="flex-1">
                        <div className="text-xs font-semibold">{check.title}</div>
                        <div className="text-[11px] opacity-80 mt-0.5">{check.details}</div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {/* TAB 2: CHASE HEADERS BUILDER */}
        {activeTab === 'headers' && (
          <div className="space-y-6">
            <div className="bg-[#050b18] border border-blue-900/50 rounded-xl p-5 space-y-4">
              <div className="border-b border-blue-900/40 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>Loyalty Pay with Points Enrollment API Required Request Headers</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Reference: Swagger 2.0 /merchants/programs/pay-with-points/enrollments/&#123;account-reference-universal-unique-identifier&#125;
                </p>
              </div>

              <div className="space-y-3 font-mono text-xs">
                {/* Header 1: Authorization */}
                <div className="p-3 bg-blue-950/30 rounded border border-blue-900/40">
                  <div className="flex justify-between text-blue-300 font-bold mb-1">
                    <span>authorization:</span>
                    <span className="text-emerald-400 text-[10px]">REQUIRED (OAuth 2-Legged)</span>
                  </div>
                  <div className="text-slate-300 break-all">
                    Bearer {tokenInput ? tokenInput.slice(0, 50) + '...' : '<YOUR_BEARER_TOKEN>'}
                  </div>
                  <p className="font-sans text-[11px] text-slate-400 mt-1">
                    OAuth bearer token sent as per OAuth2 spec. Validated at Chase API Gateway.
                  </p>
                </div>

                {/* Header 2: trace-id */}
                <div className="p-3 bg-blue-950/30 rounded border border-blue-900/40">
                  <div className="flex justify-between text-blue-300 font-bold mb-1">
                    <span>trace-id:</span>
                    <span className="text-emerald-400 text-[10px]">REQUIRED (128-bit hex)</span>
                  </div>
                  <div className="text-slate-300">
                    4f89d30a12e54bb2910fa8e71234abcd
                  </div>
                  <p className="font-sans text-[11px] text-slate-400 mt-1">
                    A unique Trace ID for every request, 128-bit number in lower hex characters (32 chars).
                  </p>
                </div>

                {/* Header 3: enrollment-type-code */}
                <div className="p-3 bg-blue-950/30 rounded border border-blue-900/40">
                  <div className="flex justify-between text-blue-300 font-bold mb-1">
                    <span>enrollment-type-code:</span>
                    <span className="text-emerald-400 text-[10px]">REQUIRED (AUTOENROLL | ENROLL)</span>
                  </div>
                  <div className="text-slate-300">AUTOENROLL</div>
                  <p className="font-sans text-[11px] text-slate-400 mt-1">
                    Codifies enrollment type based on benefit offered. Max length 30 chars.
                  </p>
                </div>

                {/* Header 4: external-account-identifier */}
                <div className="p-3 bg-blue-950/30 rounded border border-blue-900/40">
                  <div className="flex justify-between text-blue-300 font-bold mb-1">
                    <span>external-account-identifier:</span>
                    <span className="text-emerald-400 text-[10px]">REQUIRED (Max 32 chars)</span>
                  </div>
                  <div className="text-slate-300">EXT-CUST-ACCT-889104</div>
                  <p className="font-sans text-[11px] text-slate-400 mt-1">
                    Unique identifier linking customer and account in firm's customer enterprise system.
                  </p>
                </div>

                {/* Header 5: channel-type */}
                <div className="p-3 bg-blue-950/30 rounded border border-blue-900/40">
                  <div className="flex justify-between text-blue-300 font-bold mb-1">
                    <span>channel-type:</span>
                    <span className="text-slate-400 text-[10px]">OPTIONAL</span>
                  </div>
                  <div className="text-slate-300">WEB</div>
                  <p className="font-sans text-[11px] text-slate-400 mt-1">
                    Digital channel origin (e.g., WEB, MOBILE_APP, POS). Max length 15 chars.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: BASIC AUTH CREDENTIALS */}
        {activeTab === 'credentials' && (
          <div className="space-y-6">
            <div className="bg-[#050b18] border border-blue-900/50 rounded-xl p-5 space-y-4">
              <div className="border-b border-blue-900/40 pb-3">
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <span>OAuth2 Client Credentials & Basic Auth Generator</span>
                </h3>
                <p className="text-xs text-slate-400 mt-1">
                  Used when calling Chase Token URL: <code className="text-blue-300">https://api-sandbox.chase.com/ccoauth/token</code>
                </p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">
                    Client ID (Issued by Chase API Developer Portal)
                  </label>
                  <input
                    type="text"
                    value={clientId}
                    onChange={(e) => setClientId(e.target.value)}
                    className="w-full bg-[#030712] border border-blue-900/60 rounded p-2 text-xs font-mono text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-300 font-semibold mb-1 block">
                    Client Secret (Confidential Key)
                  </label>
                  <input
                    type="password"
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full bg-[#030712] border border-blue-900/60 rounded p-2 text-xs font-mono text-blue-200 focus:outline-none focus:ring-1 focus:ring-blue-500"
                  />
                </div>
              </div>

              {/* Output Basic Header */}
              <div className="mt-4 p-4 bg-blue-950/30 rounded border border-blue-900/50 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-300 uppercase tracking-wider">
                    Computed Authorization Header
                  </span>
                  <button
                    onClick={() => copyToClipboard(authHeaderOutput, 'basicAuth')}
                    className="text-xs text-blue-400 hover:text-blue-200"
                  >
                    {copiedKey === 'basicAuth' ? 'Copied!' : 'Copy Header'}
                  </button>
                </div>
                <div className="font-mono text-xs text-emerald-400 bg-[#030712] p-2.5 rounded break-all border border-blue-900/30">
                  Authorization: {authHeaderOutput}
                </div>
              </div>

              {/* cURL Example */}
              <div className="p-4 bg-slate-950/60 rounded border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-slate-300">
                    cURL Token Exchange Sample (2-Legged Flow)
                  </span>
                  <button
                    onClick={() => copyToClipboard(
                      `curl -X POST https://api-sandbox.chase.com/ccoauth/token \\\n  -H "Authorization: ${authHeaderOutput}" \\\n  -H "Content-Type: application/x-www-form-urlencoded" \\\n  -d "grant_type=client_credentials&scope=card"`,
                      'curlSample'
                    )}
                    className="text-xs text-blue-400 hover:text-blue-200"
                  >
                    {copiedKey === 'curlSample' ? 'Copied!' : 'Copy cURL'}
                  </button>
                </div>
                <pre className="text-[11px] font-mono text-slate-300 bg-[#030712] p-3 rounded overflow-x-auto">
{`curl -X POST https://api-sandbox.chase.com/ccoauth/token \\
  -H "Authorization: ${authHeaderOutput}" \\
  -H "Content-Type: application/x-www-form-urlencoded" \\
  -d "grant_type=client_credentials&scope=card"`}
                </pre>
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: JWKS PUBLIC KEYS */}
        {activeTab === 'jwks' && (
          <div className="space-y-6">
            <div className="bg-[#050b18] border border-blue-900/50 rounded-xl p-5 space-y-4">
              <div className="border-b border-blue-900/40 pb-3 flex justify-between items-center">
                <div>
                  <h3 className="text-sm font-bold text-white">Chase JWKS (JSON Web Key Set) Simulation</h3>
                  <p className="text-xs text-slate-400">Endpoint: https://api.chase.com/.well-known/jwks.json</p>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(chaseJwksSample, null, 2), 'jwksJson')}
                  className="text-xs text-blue-400 hover:text-blue-300"
                >
                  {copiedKey === 'jwksJson' ? 'Copied!' : 'Copy JWKS'}
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {chaseJwksSample.keys.map((key) => (
                  <div key={key.kid} className="p-4 bg-blue-950/20 border border-blue-900/40 rounded-lg space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-blue-300 font-bold">{key.kid}</span>
                      <span className="text-[10px] bg-blue-900/50 text-blue-200 px-2 py-0.5 rounded">{key.alg} / {key.kty}</span>
                    </div>
                    <div className="text-[11px] text-slate-400 space-y-1 font-mono">
                      <div>use: {key.use}</div>
                      <div>e: {key.e}</div>
                      <div className="truncate text-slate-500">n: {key.n}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: TOKEN GENERATOR */}
        {activeTab === 'generator' && (
          <div className="bg-[#050b18] border border-blue-900/50 rounded-xl p-5 space-y-4">
            <div className="border-b border-blue-900/40 pb-3">
              <h3 className="text-sm font-bold text-white">Synthetic Chase JWT Generator</h3>
              <p className="text-xs text-slate-400">Create bespoke tokens for sandbox & integration unit testing</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="text-xs text-slate-300 block mb-1">Algorithm (alg)</label>
                <select
                  value={genAlg}
                  onChange={(e) => setGenAlg(e.target.value)}
                  className="w-full bg-[#030712] border border-blue-900/60 rounded p-2 text-xs font-mono text-blue-200"
                >
                  <option value="RS256">RS256 (Chase Standard)</option>
                  <option value="PS256">PS256 (Probabilistic Signature)</option>
                  <option value="ES256">ES256 (Elliptic Curve)</option>
                  <option value="HS256">HS256 (HMAC SHA-256)</option>
                  <option value="none">none (Unsecured / Test)</option>
                </select>
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Client ID / Subject</label>
                <input
                  type="text"
                  value={genClientId}
                  onChange={(e) => setGenClientId(e.target.value)}
                  className="w-full bg-[#030712] border border-blue-900/60 rounded p-2 text-xs font-mono text-blue-200"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Scope(s)</label>
                <input
                  type="text"
                  value={genScope}
                  onChange={(e) => setGenScope(e.target.value)}
                  className="w-full bg-[#030712] border border-blue-900/60 rounded p-2 text-xs font-mono text-blue-200"
                  placeholder="e.g. card rewards:read"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">TTL Expiry (Seconds from now)</label>
                <input
                  type="number"
                  value={genTtlSeconds}
                  onChange={(e) => setGenTtlSeconds(Number(e.target.value))}
                  className="w-full bg-[#030712] border border-blue-900/60 rounded p-2 text-xs font-mono text-blue-200"
                />
              </div>

              <div>
                <label className="text-xs text-slate-300 block mb-1">Partner Identifier</label>
                <input
                  type="text"
                  value={genPartnerId}
                  onChange={(e) => setGenPartnerId(e.target.value)}
                  className="w-full bg-[#030712] border border-blue-900/60 rounded p-2 text-xs font-mono text-blue-200"
                />
              </div>
            </div>

            <div className="pt-3">
              <button
                onClick={generateNewToken}
                className="px-5 py-2.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded-lg shadow-lg shadow-blue-500/20 transition flex items-center space-x-2"
              >
                <span>Synthesize Token & Load into Inspector</span>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14 5l7 7m0 0l-7 7m7-7H3" />
                </svg>
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Footer */}
      <div className="bg-[#040915] border-t border-blue-900/40 px-6 py-3 text-[11px] text-slate-400 flex items-center justify-between">
        <span>Chase API Store Servers: <code className="text-blue-300">api.chase.com/card/loyalty/earn-rewards/enrollment/v1</code></span>
        <span>Secured via Common 2-Legged OAuth</span>
      </div>
    </div>
  );
};

export default ChaseJwtInspector;