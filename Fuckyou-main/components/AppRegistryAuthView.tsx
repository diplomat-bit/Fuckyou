import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Key,
  ShieldCheck,
  Lock,
  RefreshCw,
  Copy,
  Check,
  Code,
  Terminal,
  Sliders,
  Plus,
  Trash2,
  Clock,
  Cpu,
  Eye,
  EyeOff,
  AlertCircle,
  CheckCircle2,
  ShieldAlert,
  FileJson,
  Zap,
  ExternalLink,
  Shield,
  Activity,
  Sparkles
} from 'lucide-react';

// --- Web Crypto Helpers ---

function base64UrlEncodeStr(str: string): string {
  try {
    return btoa(unescape(encodeURIComponent(str)))
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch (e) {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  }
}

function base64UrlEncodeBytes(bytes: Uint8Array): string {
  let binary = '';
  const len = bytes.byteLength;
  for (let i = 0; i < len; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary)
    .replace(/=/g, '')
    .replace(/\+/g, '-')
    .replace(/\//g, '_');
}

function base64UrlDecodeStr(str: string): string {
  let output = str.replace(/-/g, '+').replace(/_/g, '/');
  switch (output.length % 4) {
    case 0:
      break;
    case 2:
      output += '==';
      break;
    case 3:
      output += '=';
      break;
    default:
      throw new Error('Illegal base64url string!');
  }
  return decodeURIComponent(escape(atob(output)));
}

async function signHmacJwt(
  headerObj: Record<string, any>,
  payloadObj: Record<string, any>,
  secretStr: string,
  alg: 'HS256' | 'HS384' | 'HS512'
): Promise<string> {
  const enc = new TextEncoder();
  const headerB64 = base64UrlEncodeStr(JSON.stringify(headerObj));
  const payloadB64 = base64UrlEncodeStr(JSON.stringify(payloadObj));
  const dataToSign = `${headerB64}.${payloadB64}`;

  let hashName = 'SHA-256';
  if (alg === 'HS384') hashName = 'SHA-384';
  if (alg === 'HS512') hashName = 'SHA-512';

  const cryptoKey = await window.crypto.subtle.importKey(
    'raw',
    enc.encode(secretStr),
    { name: 'HMAC', hash: { name: hashName } },
    false,
    ['sign']
  );

  const signatureBuffer = await window.crypto.subtle.sign(
    'HMAC',
    cryptoKey,
    enc.encode(dataToSign)
  );

  const sigB64 = base64UrlEncodeBytes(new Uint8Array(signatureBuffer));
  return `${dataToSign}.${sigB64}`;
}

async function verifyHmacJwt(
  jwtStr: string,
  secretStr: string
): Promise<{ valid: boolean; header?: any; payload?: any; error?: string }> {
  try {
    const parts = jwtStr.split('.');
    if (parts.length !== 3) {
      return { valid: false, error: 'JWT must contain exactly 3 dot-separated parts' };
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const header = JSON.parse(base64UrlDecodeStr(headerB64));
    const payload = JSON.parse(base64UrlDecodeStr(payloadB64));

    let hashName = 'SHA-256';
    if (header.alg === 'HS384') hashName = 'SHA-384';
    if (header.alg === 'HS512') hashName = 'SHA-512';
    if (!['HS256', 'HS384', 'HS512'].includes(header.alg)) {
      return { valid: false, error: `Unsupported or non-HMAC algorithm: ${header.alg}` };
    }

    const enc = new TextEncoder();
    const dataToSign = `${headerB64}.${payloadB64}`;

    const cryptoKey = await window.crypto.subtle.importKey(
      'raw',
      enc.encode(secretStr),
      { name: 'HMAC', hash: { name: hashName } },
      false,
      ['verify']
    );

    // Convert base64url sig to Uint8Array
    let rawSig = signatureB64.replace(/-/g, '+').replace(/_/g, '/');
    while (rawSig.length % 4) rawSig += '=';
    const binarySig = atob(rawSig);
    const sigBytes = new Uint8Array(binarySig.length);
    for (let i = 0; i < binarySig.length; i++) {
      sigBytes[i] = binarySig.charCodeAt(i);
    }

    const isValid = await window.crypto.subtle.verify(
      'HMAC',
      cryptoKey,
      sigBytes,
      enc.encode(dataToSign)
    );

    if (!isValid) {
      return { valid: false, header, payload, error: 'Signature verification failed (Invalid secret or payload mismatch)' };
    }

    // Expiry check
    if (payload.exp && typeof payload.exp === 'number') {
      const now = Math.floor(Date.now() / 1000);
      if (now > payload.exp) {
        return { valid: false, header, payload, error: 'Token has expired (exp claim exceeded current time)' };
      }
    }

    return { valid: true, header, payload };
  } catch (err: any) {
    return { valid: false, error: err.message || 'Failed to decode or verify token' };
  }
}

// --- Presets Definition ---

interface ClaimPair {
  id: string;
  key: string;
  value: string;
  type: 'string' | 'number' | 'boolean' | 'json';
}

interface Preset {
  id: string;
  name: string;
  description: string;
  issuer: string;
  subject: string;
  audience: string;
  scopes: string[];
  ttlMinutes: number;
  environment: string;
  customClaims: ClaimPair[];
}

const PRESETS: Preset[] = [
  {
    id: 'app-deployer',
    name: 'App Deployment Service',
    description: 'High-privilege scope for automated CI/CD pipeline deployments & registry updates.',
    issuer: 'app-registry.sovereign.gov',
    subject: 'srv_app_deployer_v2',
    audience: 'api.app-registry.internal',
    scopes: ['app:read', 'app:write', 'app:deploy', 'webhooks:manage'],
    ttlMinutes: 60,
    environment: 'production',
    customClaims: [
      { id: '1', key: 'service_tier', value: 'tier_1_mission_critical', type: 'string' },
      { id: '2', key: 'can_override_locks', value: 'true', type: 'boolean' },
      { id: '3', key: 'max_concurrent_jobs', value: '10', type: 'number' }
    ]
  },
  {
    id: 'webhook-dispatcher',
    name: 'Webhook Event Dispatcher',
    description: 'Targeted token for dispatching asynchronous lifecycle events to remote workers.',
    issuer: 'app-registry.sovereign.gov',
    subject: 'srv_webhook_dispatcher',
    audience: 'events.app-registry.internal',
    scopes: ['webhook:dispatch', 'metrics:write'],
    ttlMinutes: 15,
    environment: 'production',
    customClaims: [
      { id: '1', key: 'max_retries', value: '5', type: 'number' },
      { id: '2', key: 'dispatch_queue', value: 'priority_high', type: 'string' }
    ]
  },
  {
    id: 'treasury-bridge',
    name: 'Treasury & Billing Bridge',
    description: 'Encrypted token for interconnecting App Registry usage with Modern Treasury Ledger.',
    issuer: 'app-registry.sovereign.gov',
    subject: 'bridge_treasury_finops',
    audience: 'treasury.sovereign.bank',
    scopes: ['billing:read', 'billing:charge', 'ledger:sync', 'audit:write'],
    ttlMinutes: 30,
    environment: 'production',
    customClaims: [
      { id: '1', key: 'currency', value: 'USD', type: 'string' },
      { id: '2', key: 'authorization_limit', value: '500000', type: 'number' },
      { id: '3', key: 'fedramp_level', value: 'high', type: 'string' }
    ]
  },
  {
    id: 'admin-auditor',
    name: 'Security & Compliance Inspector',
    description: 'Read-only diagnostic access token for compliance logging and policy auditing.',
    issuer: 'app-registry.sovereign.gov',
    subject: 'auditor_sec_gov_007',
    audience: 'audit.app-registry.internal',
    scopes: ['app:read', 'audit:read', 'telemetry:read', 'iam:inspect'],
    ttlMinutes: 120,
    environment: 'gov-airgap',
    customClaims: [
      { id: '1', key: 'clearance_level', value: 'TS_SCI', type: 'string' },
      { id: '2', key: 'compliance_framework', value: 'NIST_800_53', type: 'string' }
    ]
  }
];

export const AppRegistryAuthView: React.FC = () => {
  // --- Token Generator Form State ---
  const [selectedPreset, setSelectedPreset] = useState<string>('app-deployer');
  const [algorithm, setAlgorithm] = useState<'HS256' | 'HS384' | 'HS512'>('HS256');
  const [keyId, setKeyId] = useState<string>('key_app_registry_prod_01');
  const [secretKey, setSecretKey] = useState<string>('super_secret_sovereign_app_registry_hmac_key_2025');
  const [showSecret, setShowSecret] = useState<boolean>(false);

  const [issuer, setIssuer] = useState<string>(PRESETS[0].issuer);
  const [subject, setSubject] = useState<string>(PRESETS[0].subject);
  const [audience, setAudience] = useState<string>(PRESETS[0].audience);
  const [environment, setEnvironment] = useState<string>(PRESETS[0].environment);
  const [ttlMinutes, setTtlMinutes] = useState<number>(PRESETS[0].ttlMinutes);
  const [scopesText, setScopesText] = useState<string>(PRESETS[0].scopes.join(', '));
  const [customClaims, setCustomClaims] = useState<ClaimPair[]>(PRESETS[0].customClaims);

  const [includeIat, setIncludeIat] = useState<boolean>(true);
  const [includeJti, setIncludeJti] = useState<boolean>(true);
  const [jtiVal, setJtiVal] = useState<string>(() => 'jti_' + Math.random().toString(36).substring(2, 11));

  // Output generated token
  const [generatedJwt, setGeneratedJwt] = useState<string>('');
  const [isGenerating, setIsGenerating] = useState<boolean>(false);

  // UX Copy feedback
  const [copiedToken, setCopiedToken] = useState<boolean>(false);
  const [copiedCurl, setCopiedCurl] = useState<boolean>(false);

  // Active Tab
  const [activeTab, setActiveTab] = useState<'generator' | 'verifier' | 'code'>('generator');

  // --- Token Verifier State ---
  const [verifyTokenInput, setVerifyTokenInput] = useState<string>('');
  const [verifySecretInput, setVerifySecretInput] = useState<string>('super_secret_sovereign_app_registry_hmac_key_2025');
  const [verifyResult, setVerifyResult] = useState<{ valid: boolean; header?: any; payload?: any; error?: string } | null>(null);
  const [isVerifying, setIsVerifying] = useState<boolean>(false);

  // Apply Preset Handler
  const handleApplyPreset = (presetId: string) => {
    const found = PRESETS.find((p) => p.id === presetId);
    if (!found) return;
    setSelectedPreset(presetId);
    setIssuer(found.issuer);
    setSubject(found.subject);
    setAudience(found.audience);
    setEnvironment(found.environment);
    setTtlMinutes(found.ttlMinutes);
    setScopesText(found.scopes.join(', '));
    setCustomClaims(JSON.parse(JSON.stringify(found.customClaims)));
    setJtiVal('jti_' + Math.random().toString(36).substring(2, 11));
  };

  // Random secret generator
  const generateRandomSecret = () => {
    const arr = new Uint8Array(32);
    window.crypto.getRandomValues(arr);
    const hex = Array.from(arr).map(b => b.toString(16).padStart(2, '0')).join('');
    setSecretKey('sec_' + hex);
  };

  // Add Custom Claim
  const handleAddClaim = () => {
    const newClaim: ClaimPair = {
      id: Math.random().toString(36).substring(2, 9),
      key: 'new_claim_' + (customClaims.length + 1),
      value: 'value',
      type: 'string'
    };
    setCustomClaims([...customClaims, newClaim]);
  };

  const handleRemoveClaim = (id: string) => {
    setCustomClaims(customClaims.filter(c => c.id !== id));
  };

  const handleUpdateClaim = (id: string, field: keyof ClaimPair, val: any) => {
    setCustomClaims(
      customClaims.map(c => {
        if (c.id === id) {
          return { ...c, [field]: val };
        }
        return c;
      })
    );
  };

  // Build JWT payload object dynamically
  const payloadObject = useMemo(() => {
    const now = Math.floor(Date.now() / 1000);
    const exp = now + ttlMinutes * 60;

    const scopes = scopesText
      .split(',')
      .map(s => s.trim())
      .filter(Boolean);

    const obj: Record<string, any> = {
      iss: issuer,
      sub: subject,
      aud: audience,
      env: environment,
      scope: scopes,
      exp: exp
    };

    if (includeIat) obj.iat = now;
    if (includeJti && jtiVal) obj.jti = jtiVal;

    // Process custom claims
    customClaims.forEach(claim => {
      if (!claim.key.trim()) return;
      let parsedVal: any = claim.value;
      if (claim.type === 'number') {
        parsedVal = Number(claim.value) || 0;
      } else if (claim.type === 'boolean') {
        parsedVal = claim.value.toLowerCase() === 'true' || claim.value === '1';
      } else if (claim.type === 'json') {
        try {
          parsedVal = JSON.parse(claim.value);
        } catch {
          parsedVal = claim.value;
        }
      }
      obj[claim.key.trim()] = parsedVal;
    });

    return obj;
  }, [issuer, subject, audience, environment, ttlMinutes, scopesText, includeIat, includeJti, jtiVal, customClaims]);

  const headerObject = useMemo(() => {
    const h: Record<string, any> = {
      alg: algorithm,
      typ: 'JWT'
    };
    if (keyId) h.kid = keyId;
    return h;
  }, [algorithm, keyId]);

  // Generate JWT Effect
  const generateJwtToken = useCallback(async () => {
    if (!secretKey) {
      setGeneratedJwt('');
      return;
    }
    setIsGenerating(true);
    try {
      const jwt = await signHmacJwt(headerObject, payloadObject, secretKey, algorithm);
      setGeneratedJwt(jwt);
    } catch (err) {
      console.error('Error generating JWT:', err);
    } finally {
      setIsGenerating(false);
    }
  }, [headerObject, payloadObject, secretKey, algorithm]);

  useEffect(() => {
    generateJwtToken();
  }, [generateJwtToken]);

  // Sync generated JWT to Verifier input on initial generation or when tab opens
  useEffect(() => {
    if (generatedJwt && !verifyTokenInput) {
      setVerifyTokenInput(generatedJwt);
      setVerifySecretInput(secretKey);
    }
  }, [generatedJwt, secretKey, verifyTokenInput]);

  // Copy handler
  const handleCopyToken = async () => {
    if (!generatedJwt) return;
    await navigator.clipboard.writeText(generatedJwt);
    setCopiedToken(true);
    setTimeout(() => setCopiedToken(false), 2000);
  };

  const curlCommand = useMemo(() => {
    return `curl -X POST https://api.app-registry.sovereign.gov/v1/apps/deploy \\
  -H "Authorization: Bearer ${generatedJwt || '<YOUR_JWT_TOKEN>'}" \\
  -H "Content-Type: application/json" \\
  -d '{
    "app_id": "app_auth_service",
    "deployment_target": "us-east-cluster"
  }'`;
  }, [generatedJwt]);

  const handleCopyCurl = async () => {
    await navigator.clipboard.writeText(curlCommand);
    setCopiedCurl(true);
    setTimeout(() => setCopiedCurl(false), 2000);
  };

  // Run Manual Verification
  const handleRunVerify = async () => {
    setIsVerifying(true);
    const res = await verifyHmacJwt(verifyTokenInput, verifySecretInput);
    setVerifyResult(res);
    setIsVerifying(false);
  };

  // Token Colorizer Parts
  const tokenParts = useMemo(() => {
    if (!generatedJwt) return { header: '', payload: '', signature: '' };
    const p = generatedJwt.split('.');
    return {
      header: p[0] || '',
      payload: p[1] || '',
      signature: p[2] || ''
    };
  }, [generatedJwt]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Header / Context */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
                <Key className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                  App Registry Auth Token Forge
                  <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                    HMAC Signer
                  </span>
                </h1>
                <p className="text-sm text-slate-400">
                  Interactive HMAC-SHA JWT Generator & Key Validator for Sovereign App Registry APIs
                </p>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={() => setActiveTab('generator')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'generator'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Sliders className="w-4 h-4" />
              Claims & Token Generator
            </button>
            <button
              onClick={() => setActiveTab('verifier')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'verifier'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <ShieldCheck className="w-4 h-4" />
              Inspector & Verifier
            </button>
            <button
              onClick={() => setActiveTab('code')}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition-all flex items-center gap-2 ${
                activeTab === 'code'
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'bg-slate-900 text-slate-400 hover:text-white border border-slate-800'
              }`}
            >
              <Code className="w-4 h-4" />
              API Code Snippets
            </button>
          </div>
        </div>

        {/* Quick Presets Bar */}
        <div className="mt-6 bg-slate-900/60 border border-slate-800 rounded-xl p-4">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            Quick Presets for Registry Services
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {PRESETS.map((preset) => {
              const isSelected = selectedPreset === preset.id;
              return (
                <button
                  key={preset.id}
                  onClick={() => handleApplyPreset(preset.id)}
                  className={`p-3 rounded-lg border text-left transition-all relative overflow-hidden ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 text-white ring-1 ring-indigo-500/30'
                      : 'bg-slate-900/80 border-slate-800 text-slate-300 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="font-semibold text-sm flex items-center justify-between">
                    <span>{preset.name}</span>
                    {isSelected && <Sparkles className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <p className="text-xs text-slate-400 mt-1 line-clamp-2 leading-relaxed">
                    {preset.description}
                  </p>
                  <div className="mt-2 flex items-center gap-2 text-[10px] text-slate-500">
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                      TTL: {preset.ttlMinutes}m
                    </span>
                    <span className="bg-slate-800 px-1.5 py-0.5 rounded border border-slate-700 font-mono">
                      {preset.scopes.length} scopes
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* Main Container */}
      <div className="max-w-7xl mx-auto">
        {activeTab === 'generator' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Controls Column (7 Cols) */}
            <div className="lg:col-span-7 space-y-6">
              {/* Crypto & Signature Configuration */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Header & Signature Keys
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">HMAC Secret Suite</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Signing Algorithm (alg)
                    </label>
                    <select
                      value={algorithm}
                      onChange={(e) => setAlgorithm(e.target.value as any)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="HS256">HS256 (HMAC SHA-256)</option>
                      <option value="HS384">HS384 (HMAC SHA-384)</option>
                      <option value="HS512">HS512 (HMAC SHA-512)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Key Identifier (kid)
                    </label>
                    <input
                      type="text"
                      value={keyId}
                      onChange={(e) => setKeyId(e.target.value)}
                      placeholder="e.g. key_app_registry_prod_01"
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <div className="flex items-center justify-between mb-1">
                      <label className="block text-xs font-medium text-slate-400">
                        HMAC Secret Key
                      </label>
                      <button
                        onClick={generateRandomSecret}
                        className="text-xs text-indigo-400 hover:text-indigo-300 flex items-center gap-1 font-sans"
                      >
                        <RefreshCw className="w-3 h-3" />
                        Generate Random Key
                      </button>
                    </div>
                    <div className="relative">
                      <input
                        type={showSecret ? 'text' : 'password'}
                        value={secretKey}
                        onChange={(e) => setSecretKey(e.target.value)}
                        placeholder="Enter signing secret string..."
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg pl-3 pr-10 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        type="button"
                        onClick={() => setShowSecret(!showSecret)}
                        className="absolute right-3 top-2.5 text-slate-400 hover:text-white"
                      >
                        {showSecret ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Core Standard Payload Claims */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <h2 className="text-base font-semibold text-white flex items-center gap-2">
                    <Sliders className="w-4 h-4 text-indigo-400" />
                    Standard Claims Configuration
                  </h2>
                  <span className="text-xs text-slate-400 font-mono">RFC 7519 Compliant</span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Issuer (iss)
                    </label>
                    <input
                      type="text"
                      value={issuer}
                      onChange={(e) => setIssuer(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Subject / Client ID (sub)
                    </label>
                    <input
                      type="text"
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Audience (aud)
                    </label>
                    <input
                      type="text"
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Target Environment (env)
                    </label>
                    <select
                      value={environment}
                      onChange={(e) => setEnvironment(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    >
                      <option value="production">production</option>
                      <option value="staging">staging</option>
                      <option value="sandbox">sandbox</option>
                      <option value="gov-airgap">gov-airgap</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Expiration TTL (minutes)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        value={ttlMinutes}
                        min={1}
                        max={43200}
                        onChange={(e) => setTtlMinutes(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <span className="text-xs text-slate-400 font-mono whitespace-nowrap">
                        = {ttlMinutes >= 60 ? `${(ttlMinutes / 60).toFixed(1)} hrs` : `${ttlMinutes} mins`}
                      </span>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Token ID (jti)
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={jtiVal}
                        onChange={(e) => setJtiVal(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      />
                      <button
                        onClick={() => setJtiVal('jti_' + Math.random().toString(36).substring(2, 11))}
                        className="p-2 bg-slate-800 hover:bg-slate-700 rounded-lg border border-slate-700 text-slate-300"
                        title="Randomize JTI"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Allowed Scopes (comma separated)
                    </label>
                    <input
                      type="text"
                      value={scopesText}
                      onChange={(e) => setScopesText(e.target.value)}
                      placeholder="app:read, app:deploy, billing:charge..."
                      className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-indigo-300 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    />
                  </div>

                  <div className="sm:col-span-2 flex items-center gap-6 pt-2">
                    <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeIat}
                        onChange={(e) => setIncludeIat(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                      />
                      Include Issued At (`iat`)
                    </label>

                    <label className="flex items-center gap-2 text-xs font-medium text-slate-300 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={includeJti}
                        onChange={(e) => setIncludeJti(e.target.checked)}
                        className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500 bg-slate-950"
                      />
                      Include JWT ID (`jti`)
                    </label>
                  </div>
                </div>
              </div>

              {/* Custom Key-Value Claims Builder */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm">
                <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                  <div>
                    <h2 className="text-base font-semibold text-white flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400" />
                      Custom Application Claims
                    </h2>
                    <p className="text-xs text-slate-400">Inject additional operational context into the token payload</p>
                  </div>
                  <button
                    onClick={handleAddClaim}
                    className="px-3 py-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/30 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Add Claim
                  </button>
                </div>

                {customClaims.length === 0 ? (
                  <div className="text-center py-6 border border-dashed border-slate-800 rounded-lg text-slate-500 text-xs">
                    No custom claims attached. Click "Add Claim" to insert key-value pairs.
                  </div>
                ) : (
                  <div className="space-y-3">
                    {customClaims.map((claim) => (
                      <div key={claim.id} className="flex items-center gap-2 bg-slate-950 p-2.5 rounded-lg border border-slate-800">
                        <input
                          type="text"
                          value={claim.key}
                          onChange={(e) => handleUpdateClaim(claim.id, 'key', e.target.value)}
                          placeholder="Claim Key"
                          className="w-1/3 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-white focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <select
                          value={claim.type}
                          onChange={(e) => handleUpdateClaim(claim.id, 'type', e.target.value as any)}
                          className="w-24 bg-slate-900 border border-slate-700 rounded px-2 py-1.5 text-xs text-slate-300 focus:outline-none"
                        >
                          <option value="string">String</option>
                          <option value="number">Number</option>
                          <option value="boolean">Boolean</option>
                          <option value="json">JSON</option>
                        </select>
                        <input
                          type="text"
                          value={claim.value}
                          onChange={(e) => handleUpdateClaim(claim.id, 'value', e.target.value)}
                          placeholder="Value"
                          className="flex-1 bg-slate-900 border border-slate-700 rounded px-2.5 py-1.5 text-xs font-mono text-emerald-400 focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                        <button
                          onClick={() => handleRemoveClaim(claim.id)}
                          className="p-1.5 text-slate-500 hover:text-rose-400 hover:bg-rose-500/10 rounded"
                          title="Remove Claim"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </div>

            {/* Right Token Output Column (5 Cols) */}
            <div className="lg:col-span-5 space-y-6">
              {/* Generated Signed Token Display */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-sm sticky top-6">
                <div className="flex items-center justify-between mb-3 pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <h2 className="text-base font-semibold text-white">Live Encoded JWT</h2>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={generateJwtToken}
                      className="p-1.5 text-slate-400 hover:text-white bg-slate-800 rounded-lg border border-slate-700"
                      title="Re-sign token"
                    >
                      <RefreshCw className={`w-3.5 h-3.5 ${isGenerating ? 'animate-spin' : ''}`} />
                    </button>
                    <button
                      onClick={handleCopyToken}
                      className="px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium flex items-center gap-1.5 shadow-md shadow-indigo-600/20 transition-all"
                    >
                      {copiedToken ? <Check className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                      {copiedToken ? 'Copied!' : 'Copy Token'}
                    </button>
                  </div>
                </div>

                {/* Encoded JWT Output with Colorized Structure */}
                <div className="mb-4">
                  <div className="text-[11px] text-slate-400 mb-1 flex items-center justify-between">
                    <span>Encoded Compact Token</span>
                    <span className="font-mono text-[10px] text-slate-500">
                      Length: {generatedJwt.length} chars
                    </span>
                  </div>
                  <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs break-all leading-relaxed tracking-wider min-h-[110px] max-h-[180px] overflow-y-auto">
                    {generatedJwt ? (
                      <>
                        <span className="text-rose-400 hover:bg-rose-950/40 rounded px-0.5" title="JWT Header">
                          {tokenParts.header}
                        </span>
                        <span className="text-slate-500">.</span>
                        <span className="text-indigo-400 hover:bg-indigo-950/40 rounded px-0.5" title="JWT Payload Claims">
                          {tokenParts.payload}
                        </span>
                        <span className="text-slate-500">.</span>
                        <span className="text-emerald-400 hover:bg-emerald-950/40 rounded px-0.5" title="HMAC Signature">
                          {tokenParts.signature}
                        </span>
                      </>
                    ) : (
                      <span className="text-slate-600 italic">Enter a valid secret key to generate HMAC signature...</span>
                    )}
                  </div>
                  <div className="flex items-center gap-4 mt-2 text-[10px] font-mono text-slate-400 px-1">
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                      Header (alg, typ, kid)
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-indigo-500"></span>
                      Payload Claims
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                      Signature
                    </span>
                  </div>
                </div>

                {/* Decoded Inspection Tabs inside Card */}
                <div className="space-y-4 pt-2">
                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <FileJson className="w-3.5 h-3.5 text-rose-400" />
                        Decoded Header
                      </span>
                    </div>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-rose-300 overflow-x-auto">
                      {JSON.stringify(headerObject, null, 2)}
                    </pre>
                  </div>

                  <div>
                    <div className="flex items-center justify-between text-xs font-semibold text-slate-300 mb-1.5">
                      <span className="flex items-center gap-1.5">
                        <FileJson className="w-3.5 h-3.5 text-indigo-400" />
                        Decoded Payload Claims
                      </span>
                      <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                        <Clock className="w-3 h-3 text-amber-400" />
                        Exp: {new Date(payloadObject.exp * 1000).toLocaleTimeString()}
                      </span>
                    </div>
                    <pre className="p-3 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-indigo-200 overflow-x-auto max-h-64">
                      {JSON.stringify(payloadObject, null, 2)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Verifier & Inspector */}
        {activeTab === 'verifier' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-indigo-400" />
                JWT Decryptor & HMAC Verification Engine
              </h2>
              <p className="text-sm text-slate-400 mb-6">
                Paste any HMAC signed JSON Web Token to verify signature validity, algorithm parameters, and claim expiration status.
              </p>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Raw Encoded JWT Token String
                  </label>
                  <textarea
                    rows={4}
                    value={verifyTokenInput}
                    onChange={(e) => setVerifyTokenInput(e.target.value)}
                    placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg p-3 font-mono text-xs text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    HMAC Secret Key for Signature Verification
                  </label>
                  <input
                    type="password"
                    value={verifySecretInput}
                    onChange={(e) => setVerifySecretInput(e.target.value)}
                    placeholder="Enter secret key string used to sign token..."
                    className="w-full bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <div className="pt-2">
                  <button
                    onClick={handleRunVerify}
                    disabled={isVerifying || !verifyTokenInput}
                    className="w-full sm:w-auto px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-slate-800 text-white font-medium rounded-lg text-sm flex items-center justify-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    <ShieldCheck className="w-4 h-4" />
                    {isVerifying ? 'Verifying HMAC Signature...' : 'Inspect & Verify Token'}
                  </button>
                </div>
              </div>
            </div>

            {/* Verification Result Output */}
            {verifyResult && (
              <div
                className={`border rounded-xl p-6 ${
                  verifyResult.valid
                    ? 'bg-emerald-950/20 border-emerald-500/40 text-emerald-100'
                    : 'bg-rose-950/20 border-rose-500/40 text-rose-100'
                }`}
              >
                <div className="flex items-center gap-3 mb-4">
                  {verifyResult.valid ? (
                    <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                  ) : (
                    <ShieldAlert className="w-6 h-6 text-rose-400" />
                  )}
                  <div>
                    <h3 className="text-base font-semibold">
                      {verifyResult.valid ? 'Signature Verified & Valid' : 'Verification Failed'}
                    </h3>
                    <p className="text-xs opacity-80">
                      {verifyResult.valid
                        ? 'HMAC secret matches signature and token claim expiration time is in the future.'
                        : verifyResult.error || 'Token signature is invalid or secret key mismatch.'}
                    </p>
                  </div>
                </div>

                {verifyResult.header && verifyResult.payload && (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 pt-4 border-t border-slate-800">
                    <div>
                      <div className="text-xs font-semibold text-slate-300 mb-2">Decoded Header</div>
                      <pre className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg font-mono text-xs text-rose-300 overflow-x-auto">
                        {JSON.stringify(verifyResult.header, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <div className="text-xs font-semibold text-slate-300 mb-2">Decoded Payload Claims</div>
                      <pre className="p-3 bg-slate-950/80 border border-slate-800 rounded-lg font-mono text-xs text-indigo-300 overflow-x-auto">
                        {JSON.stringify(verifyResult.payload, null, 2)}
                      </pre>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Tab 3: Code Snippets & cURL */}
        {activeTab === 'code' && (
          <div className="max-w-4xl mx-auto space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center justify-between mb-4 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <Terminal className="w-5 h-5 text-indigo-400" />
                  <h2 className="text-lg font-semibold text-white">cURL Request Command</h2>
                </div>
                <button
                  onClick={handleCopyCurl}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 border border-slate-700"
                >
                  {copiedCurl ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                  {copiedCurl ? 'Copied' : 'Copy cURL'}
                </button>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 overflow-x-auto leading-relaxed">
                {curlCommand}
              </pre>
            </div>

            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
                <Code className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-semibold text-white">TypeScript / Node.js Verification Middleware</h2>
              </div>

              <pre className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-emerald-300 overflow-x-auto leading-relaxed">
{`import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';

export function appRegistryAuthMiddleware(secret: string) {
  return (req: Request, res: Response, next: NextFunction) => {
    const authHeader = req.headers.authorization;
    if (!authHeader?.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Missing or malformed Authorization header' });
    }

    const token = authHeader.split(' ')[1];
    const parts = token.split('.');
    if (parts.length !== 3) {
      return res.status(401).json({ error: 'Invalid JWT structure' });
    }

    const [headerB64, payloadB64, signatureB64] = parts;
    const dataToSign = \`\${headerB64}.\${payloadB64}\`;

    // Re-verify HMAC signature
    const expectedSig = crypto
      .createHmac('sha256', secret)
      .update(dataToSign)
      .digest('base64url');

    if (signatureB64 !== expectedSig) {
      return res.status(403).json({ error: 'HMAC Signature verification failed' });
    }

    const payload = JSON.parse(Buffer.from(payloadB64, 'base64url').toString('utf8'));
    if (payload.exp && Math.floor(Date.now() / 1000) > payload.exp) {
      return res.status(401).json({ error: 'Token expired' });
    }

    // Attach validated token context to express request
    (req as any).appRegistryAuth = payload;
    next();
  };
}`}
              </pre>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default AppRegistryAuthView;
