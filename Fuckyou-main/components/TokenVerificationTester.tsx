import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- Inline Icon Components ---
const IconShieldCheck = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
  </svg>
);

const IconClock = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 9 0 0118 0z" />
  </svg>
);

const IconAlertTriangle = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
  </svg>
);

const IconCheck = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
  </svg>
);

const IconX = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const IconPlay = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
  </svg>
);

const IconRefresh = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
  </svg>
);

const IconKey = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 7a2 2 0 012 2m4 0a6 6 0 01-7.743 5.743L11 17H9v2H7v2H4a1 1 0 01-1-1v-2.586a1 1 0 01.293-.707l5.964-5.964A6 6 0 0121 9z" />
  </svg>
);

const IconCopy = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z" />
  </svg>
);

const IconTerminal = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
  </svg>
);

const IconSliders = ({ className = "w-5 h-5" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
  </svg>
);

const IconLock = ({ className = "w-4 h-4" }: { className?: string }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
  </svg>
);

// --- Helpers for Base64 & JWT Simulation ---
function base64UrlEncode(str: string): string {
  try {
    return btoa(str)
      .replace(/=/g, '')
      .replace(/\+/g, '-')
      .replace(/\//g, '_');
  } catch (e) {
    return '';
  }
}

function base64UrlDecode(str: string): string {
  try {
    let base64 = str.replace(/-/g, '+').replace(/_/g, '/');
    while (base64.length % 4) {
      base64 += '=';
    }
    return atob(base64);
  } catch (e) {
    return '';
  }
}

function buildMockJwt(headerObj: object, payloadObj: object, mockSig = "sVT48mKw_99ZkP0X28qM_mockSig"): string {
  const h = base64UrlEncode(JSON.stringify(headerObj));
  const p = base64UrlEncode(JSON.stringify(payloadObj));
  return `${h}.${p}.${mockSig}`;
}

// Interfaces
interface ParsedJwt {
  header: Record<string, any> | null;
  payload: Record<string, any> | null;
  rawHeader: string;
  rawPayload: string;
  signature: string;
  isValidStructure: boolean;
}

interface VerificationStep {
  id: string;
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  message: string;
  latencyMs: number;
  details?: Record<string, any>;
}

interface MiddlewareConfig {
  clockToleranceSec: number;
  expectedIssuer: string;
  expectedAudience: string;
  enforceMtls: boolean;
  enforceFapiHeaders: boolean;
  requiredScopes: string[];
}

export const TokenVerificationTester: React.FC = () => {
  // Current time state
  const [now, setNow] = useState<number>(Math.floor(Date.now() / 1000));
  const [autoTick, setAutoTick] = useState<boolean>(true);
  const [copied, setCopied] = useState<boolean>(false);

  // Headers input
  const [authHeader, setAuthHeader] = useState<string>('');
  const [fapiInteractionId, setFapiInteractionId] = useState<string>('d9b4c0e1-45a8-4c12-b12a-89a712f518e2');
  const [fapiAuthDate, setFapiAuthDate] = useState<string>(new Date().toUTCString());
  const [clientCertHash, setClientCertHash] = useState<string>('a8f9c2d1b8e4f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6');

  // Middleware Config
  const [config, setConfig] = useState<MiddlewareConfig>({
    clockToleranceSec: 30,
    expectedIssuer: 'https://auth.sovereign-ledger.gov',
    expectedAudience: 'https://api.citiconnect.com/v1',
    enforceMtls: true,
    enforceFapiHeaders: true,
    requiredScopes: ['financial:read', 'sovereign:verify'],
  });

  const [rawSecretKey, setRawSecretKey] = useState<string>('super-secret-sovereign-vault-key-2025');

  // Active Preset state
  const [activePreset, setActivePreset] = useState<string>('valid_fapi');

  // Update clock every second if autoTick enabled
  useEffect(() => {
    if (!autoTick) return;
    const interval = setInterval(() => {
      setNow(Math.floor(Date.now() / 1000));
    }, 1000);
    return () => clearInterval(interval);
  }, [autoTick]);

  // Generators for presets
  const generatePreset = useCallback((presetType: string) => {
    const currentEpoch = Math.floor(Date.now() / 1000);
    setActivePreset(presetType);

    const standardHeader = {
      alg: 'PS256',
      typ: 'JWT',
      kid: 'gov-sec-key-0092',
    };

    let payload: Record<string, any> = {
      iss: 'https://auth.sovereign-ledger.gov',
      aud: 'https://api.citiconnect.com/v1',
      sub: 'usr_sovereign_dept_7710',
      iat: currentEpoch - 10,
      nbf: currentEpoch - 10,
      exp: currentEpoch + 3600,
      jti: 'nonce_' + Math.random().toString(36).substring(2, 10),
      scope: 'financial:read sovereign:verify',
      cnf: {
        'x5t#S256': 'a8f9c2d1b8e4f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6',
      },
      client_id: 'client_app_citibank_gateway_01',
    };

    let sig = 'aX9_zK19P_signature_valid_hash_44921008271';

    if (presetType === 'valid_fapi') {
      // Default valid
      setClientCertHash('a8f9c2d1b8e4f1a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a0b1c2d3e4f5a6');
      setFapiAuthDate(new Date().toUTCString());
    } else if (presetType === 'future_clock_skew') {
      // Issued 45s in future
      payload.iat = currentEpoch + 45;
      payload.nbf = currentEpoch + 45;
      payload.exp = currentEpoch + 3645;
    } else if (presetType === 'expired') {
      // Expired 120 seconds ago
      payload.iat = currentEpoch - 3720;
      payload.nbf = currentEpoch - 3720;
      payload.exp = currentEpoch - 120;
    } else if (presetType === 'missing_mtls') {
      // Thumbprint mismatch or missing
      delete payload.cnf;
      setClientCertHash('0000000000000000000000000000000000000000000000000000000000000000');
    } else if (presetType === 'invalid_aud_scope') {
      payload.aud = 'https://untrusted-thirdparty-service.org';
      payload.scope = 'public:read';
    } else if (presetType === 'malformed') {
      setAuthHeader('Bearer invalid.jwt.token.structure.bad.format');
      return;
    } else if (presetType === 'bad_signature') {
      sig = 'INVALID_SIGNATURE_BYTES_FAILED_MAC';
    }

    const jwtStr = buildMockJwt(standardHeader, payload, sig);
    setAuthHeader(`Bearer ${jwtStr}`);
  }, []);

  // Initialize with valid_fapi preset
  useEffect(() => {
    generatePreset('valid_fapi');
  }, [generatePreset]);

  // Parse Raw JWT
  const parsedToken: ParsedJwt = useMemo(() => {
    if (!authHeader) {
      return { header: null, payload: null, rawHeader: '', rawPayload: '', signature: '', isValidStructure: false };
    }

    const rawToken = authHeader.replace(/^Bearer\s+/i, '').trim();
    const parts = rawToken.split('.');

    if (parts.length !== 3) {
      return { header: null, payload: null, rawHeader: parts[0] || '', rawPayload: parts[1] || '', signature: parts[2] || '', isValidStructure: false };
    }

    try {
      const headerJson = base64UrlDecode(parts[0]);
      const payloadJson = base64UrlDecode(parts[1]);
      const header = headerJson ? JSON.parse(headerJson) : null;
      const payload = payloadJson ? JSON.parse(payloadJson) : null;

      return {
        header,
        payload,
        rawHeader: headerJson,
        rawPayload: payloadJson,
        signature: parts[2],
        isValidStructure: !!(header && payload),
      };
    } catch (e) {
      return { header: null, payload: null, rawHeader: parts[0], rawPayload: parts[1], signature: parts[2], isValidStructure: false };
    }
  }, [authHeader]);

  // Real-time Middleware Pipeline Verification Execution
  const verificationPipeline = useMemo(() => {
    const steps: VerificationStep[] = [];
    let isOverallSuccess = true;

    // Step 1: Format & Extraction
    const t0 = performance.now();
    const hasBearer = /^Bearer\s+[\w-]+\.[\w-]+\.[\w-]+$/i.test(authHeader.trim());
    const step1Passed = hasBearer && parsedToken.isValidStructure;
    steps.push({
      id: 'HEADER_FORMAT',
      name: 'Authorization Header & JWT Format',
      status: step1Passed ? 'passed' : 'failed',
      message: step1Passed
        ? 'Authorization header contains valid Bearer 3-part JWT structure'
        : 'Malformed Authorization header or invalid JWT dot-notation syntax',
      latencyMs: +(performance.now() - t0).toFixed(2),
      details: {
        scheme: authHeader.startsWith('Bearer ') ? 'Bearer' : 'Unknown',
        partsCount: authHeader.replace(/^Bearer\s+/i, '').split('.').length,
      },
    });

    if (!step1Passed) isOverallSuccess = false;

    // Step 2: Signature Integrity Simulation
    const t1 = performance.now();
    const sigValid = step1Passed && !parsedToken.signature.includes('INVALID');
    steps.push({
      id: 'SIGNATURE_VERIFY',
      name: 'Asymmetric PS256 Signature Verification',
      status: !step1Passed ? 'skipped' : sigValid ? 'passed' : 'failed',
      message: !step1Passed
        ? 'Skipped due to header format error'
        : sigValid
        ? 'Signature validated against JWKS public key (kid: gov-sec-key-0092)'
        : 'Cryptographic signature mismatch: Signature verification failed',
      latencyMs: +(performance.now() - t1).toFixed(2),
      details: {
        algorithm: parsedToken.header?.alg || 'UNKNOWN',
        keyId: parsedToken.header?.kid || 'N/A',
      },
    });

    if (!sigValid && step1Passed) isOverallSuccess = false;

    // Step 3: Temporal Validity & Clock Skew Tolerance Check
    const t2 = performance.now();
    let temporalPassed = false;
    let temporalMsg = '';
    const payload = parsedToken.payload;

    if (!step1Passed || !payload) {
      steps.push({
        id: 'TEMPORAL_VALIDITY',
        name: 'Temporal Claim & Clock Skew Tolerance Check',
        status: 'skipped',
        message: 'Skipped due to upstream parsing failure',
        latencyMs: 0,
      });
    } else {
      const exp = payload.exp;
      const nbf = payload.nbf;
      const iat = payload.iat;

      const tolerance = config.clockToleranceSec;
      const minValidTime = now - tolerance;
      const maxValidTime = now + tolerance;

      const isExpired = exp && exp < minValidTime;
      const isNotYetValid = nbf && nbf > maxValidTime;
      const isFutureIat = iat && iat > maxValidTime;

      if (isExpired) {
        const delta = now - exp;
        temporalPassed = false;
        temporalMsg = `Token EXPIRED ${delta}s ago (exp: ${exp}, current: ${now}, tolerance: ±${tolerance}s)`;
      } else if (isNotYetValid) {
        const delta = nbf - now;
        temporalPassed = false;
        temporalMsg = `Token NOT BEFORE timestamp is ${delta}s in the future (nbf: ${nbf}, current: ${now}, tolerance: ±${tolerance}s)`;
      } else if (isFutureIat) {
        const delta = iat - now;
        temporalPassed = false;
        temporalMsg = `Token issued in future by ${delta}s exceeding clock tolerance ±${tolerance}s`;
      } else {
        temporalPassed = true;
        const skewIat = now - (iat || now);
        temporalMsg = `Temporal claims valid. Clock skew delta: ${skewIat > 0 ? '+' : ''}${skewIat}s (Tolerance: ±${tolerance}s)`;
      }

      steps.push({
        id: 'TEMPORAL_VALIDITY',
        name: 'Temporal Claim & Clock Skew Tolerance Check',
        status: temporalPassed ? 'passed' : 'failed',
        message: temporalMsg,
        latencyMs: +(performance.now() - t2).toFixed(2),
        details: {
          currentEpoch: now,
          exp: payload.exp,
          nbf: payload.nbf,
          iat: payload.iat,
          clockToleranceSec: config.clockToleranceSec,
        },
      });

      if (!temporalPassed) isOverallSuccess = false;
    }

    // Step 4: Issuer, Audience & Scope Validation
    const t3 = performance.now();
    if (!step1Passed || !payload) {
      steps.push({
        id: 'ISSUER_SCOPE',
        name: 'Issuer, Audience & Scope Enforcement',
        status: 'skipped',
        message: 'Skipped',
        latencyMs: 0,
      });
    } else {
      const issMatch = payload.iss === config.expectedIssuer;
      const audMatch = payload.aud === config.expectedAudience;
      const tokenScopes = (payload.scope || '').split(' ');
      const hasRequiredScopes = config.requiredScopes.every((req) => tokenScopes.includes(req));

      const step4Passed = issMatch && audMatch && hasRequiredScopes;
      let failureReason = [];
      if (!issMatch) failureReason.push(`Issuer mismatch ('${payload.iss}' != '${config.expectedIssuer}')`);
      if (!audMatch) failureReason.push(`Audience mismatch ('${payload.aud}' != '${config.expectedAudience}')`);
      if (!hasRequiredScopes) failureReason.push(`Missing required scopes [${config.requiredScopes.filter(s => !tokenScopes.includes(s)).join(', ')}]`);

      steps.push({
        id: 'ISSUER_SCOPE',
        name: 'Issuer, Audience & Scope Enforcement',
        status: step4Passed ? 'passed' : 'failed',
        message: step4Passed
          ? `Validated iss, aud, and required scopes [${config.requiredScopes.join(', ')}]`
          : `Validation error: ${failureReason.join('; ')}`,
        latencyMs: +(performance.now() - t3).toFixed(2),
        details: {
          iss: payload.iss,
          aud: payload.aud,
          scopes: tokenScopes,
        },
      });

      if (!step4Passed) isOverallSuccess = false;
    }

    // Step 5: mTLS & FAPI 2.0 Header Binding Check
    const t4 = performance.now();
    if (!step1Passed || !payload) {
      steps.push({
        id: 'MTLS_FAPI_BINDING',
        name: 'mTLS Certificate & FAPI Header Binding',
        status: 'skipped',
        message: 'Skipped',
        latencyMs: 0,
      });
    } else {
      let mtlsPassed = true;
      let fapiPassed = true;
      let msgs: string[] = [];

      if (config.enforceMtls) {
        const cnfThumbprint = payload.cnf?.['x5t#S256'];
        if (!cnfThumbprint) {
          mtlsPassed = false;
          msgs.push('Token lacks cnf.x5t#S256 claim binding');
        } else if (cnfThumbprint !== clientCertHash) {
          mtlsPassed = false;
          msgs.push('mTLS client cert hash does not match token cnf.x5t#S256 binding');
        } else {
          msgs.push('mTLS client certificate bound successfully');
        }
      }

      if (config.enforceFapiHeaders) {
        if (!fapiInteractionId || fapiInteractionId.length < 10) {
          fapiPassed = false;
          msgs.push('Missing or invalid x-fapi-interaction-id header');
        } else {
          msgs.push('FAPI 2.0 interaction ID validated');
        }
      }

      const step5Passed = mtlsPassed && fapiPassed;
      steps.push({
        id: 'MTLS_FAPI_BINDING',
        name: 'mTLS Certificate & FAPI Header Binding',
        status: step5Passed ? 'passed' : 'failed',
        message: step5Passed ? msgs.join('; ') : `Binding failed: ${msgs.join('; ')}`,
        latencyMs: +(performance.now() - t4).toFixed(2),
        details: {
          tokenCnf: payload.cnf,
          clientCertHash,
          fapiInteractionId,
        },
      });

      if (!step5Passed) isOverallSuccess = false;
    }

    return {
      isOverallSuccess,
      steps,
      totalLatencyMs: steps.reduce((acc, s) => acc + s.latencyMs, 0).toFixed(2),
    };
  }, [authHeader, parsedToken, config, now, clientCertHash, fapiInteractionId]);

  // Copy helper
  const handleCopyToken = () => {
    navigator.clipboard.writeText(authHeader);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Header Bar */}
      <div className="max-w-7xl mx-auto mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 border border-blue-500/30 rounded-xl">
              <IconShieldCheck className="w-7 h-7" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Token & Middleware Verification
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-400 border border-blue-500/20 font-mono">
                  FAPI 2.0 / OAuth2 / JWS
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time middleware security sandbox: test authorization headers, clock skew tolerance, and claim validation.
              </p>
            </div>
          </div>
        </div>

        {/* Dynamic System Clock & Status Pill */}
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 px-3 py-2 rounded-lg text-xs font-mono text-slate-300">
            <IconClock className="w-4 h-4 text-emerald-400 animate-pulse" />
            <span>Epoch: {now}</span>
            <button
              onClick={() => setAutoTick(!autoTick)}
              className={`ml-2 px-1.5 py-0.5 rounded text-[10px] uppercase font-bold ${
                autoTick ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-700 text-slate-400'
              }`}
            >
              {autoTick ? 'LIVE' : 'PAUSED'}
            </button>
          </div>

          <div
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-semibold text-sm border ${
              verificationPipeline.isOverallSuccess
                ? 'bg-emerald-950/60 border-emerald-500/40 text-emerald-400'
                : 'bg-rose-950/60 border-rose-500/40 text-rose-400'
            }`}
          >
            {verificationPipeline.isOverallSuccess ? (
              <>
                <IconCheck className="w-5 h-5" />
                <span>AUTHORIZED (200 OK)</span>
              </>
            ) : (
              <>
                <IconX className="w-5 h-5" />
                <span>UNAUTHORIZED (401 / 403)</span>
              </>
            )}
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Preset Selector Bar */}
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 shadow-lg">
          <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center justify-between">
            <span className="flex items-center gap-1.5">
              <IconKey className="w-4 h-4 text-amber-400" />
              Quick Test Presets
            </span>
            <span className="text-[11px] text-slate-500">Select a scenario to prefill headers and claims</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {[
              { id: 'valid_fapi', label: 'Valid FAPI 2.0 Auth Token', color: 'emerald' },
              { id: 'future_clock_skew', label: 'Clock Skew (+45s Future iat)', color: 'amber' },
              { id: 'expired', label: 'Expired Token (-120s exp)', color: 'rose' },
              { id: 'missing_mtls', label: 'Missing mTLS Binding', color: 'purple' },
              { id: 'invalid_aud_scope', label: 'Invalid Audience / Scope', color: 'orange' },
              { id: 'bad_signature', label: 'Tampered Signature', color: 'red' },
              { id: 'malformed', label: 'Malformed Token Format', color: 'slate' },
            ].map((p) => {
              const isActive = activePreset === p.id;
              return (
                <button
                  key={p.id}
                  onClick={() => generatePreset(p.id)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all duration-150 border ${
                    isActive
                      ? 'bg-blue-600 text-white border-blue-400 shadow-md shadow-blue-900/30 font-semibold'
                      : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300 border-slate-700/60 hover:border-slate-600'
                  }`}
                >
                  {p.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Main Grid: 2 Columns */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Left Column: Requests & Config (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            {/* Request Headers Input Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <IconTerminal className="w-4 h-4 text-blue-400" />
                  Request Authorization Header
                </h2>
                <button
                  onClick={handleCopyToken}
                  className="text-xs flex items-center gap-1 text-slate-400 hover:text-white transition-colors"
                  title="Copy full Authorization header"
                >
                  <IconCopy className="w-3.5 h-3.5" />
                  {copied ? 'Copied!' : 'Copy'}
                </button>
              </div>

              <div>
                <label className="block text-xs font-mono text-slate-400 mb-1.5">Authorization Header</label>
                <textarea
                  value={authHeader}
                  onChange={(e) => setAuthHeader(e.target.value)}
                  rows={4}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-blue-300 focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all resize-y"
                  placeholder="Bearer eyJhbGciOi..."
                />
              </div>

              {/* FAPI / Network Headers */}
              <div className="border-t border-slate-800/80 pt-4 space-y-3">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider block">
                  FAPI 2.0 & Network Context
                </span>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">x-fapi-interaction-id</label>
                  <input
                    type="text"
                    value={fapiInteractionId}
                    onChange={(e) => setFapiInteractionId(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">
                    x-client-cert-sha256 (mTLS Thumbprint)
                  </label>
                  <input
                    type="text"
                    value={clientCertHash}
                    onChange={(e) => setClientCertHash(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500 truncate"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-mono text-slate-400 mb-1">x-fapi-auth-date</label>
                  <input
                    type="text"
                    value={fapiAuthDate}
                    onChange={(e) => setFapiAuthDate(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>
            </div>

            {/* Middleware Verification Parameters Card */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <IconSliders className="w-4 h-4 text-purple-400" />
                  Middleware Tolerances & Rules
                </h2>
                <span className="text-xs text-slate-500 font-mono">Engine v2.4</span>
              </div>

              {/* Clock Skew Slider */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-300 font-medium">Clock Skew Tolerance:</span>
                  <span className="font-mono text-amber-400 font-bold bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                    ±{config.clockToleranceSec} seconds
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="300"
                  step="5"
                  value={config.clockToleranceSec}
                  onChange={(e) => setConfig({ ...config, clockToleranceSec: parseInt(e.target.value) || 0 })}
                  className="w-full accent-amber-500 cursor-pointer h-1.5 bg-slate-800 rounded-lg"
                />
                <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                  <span>0s (Strict)</span>
                  <span>30s (Default)</span>
                  <span>120s</span>
                  <span>300s (Permissive)</span>
                </div>
              </div>

              {/* Expected Issuer & Audience */}
              <div className="space-y-3 pt-2">
                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">Expected Issuer (iss)</label>
                  <input
                    type="text"
                    value={config.expectedIssuer}
                    onChange={(e) => setConfig({ ...config, expectedIssuer: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-[11px] text-slate-400 font-medium mb-1">Expected Audience (aud)</label>
                  <input
                    type="text"
                    value={config.expectedAudience}
                    onChange={(e) => setConfig({ ...config, expectedAudience: e.target.value })}
                    className="w-full bg-slate-950 border border-slate-800 rounded-md px-3 py-1.5 text-xs font-mono text-slate-200 focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              {/* Toggles */}
              <div className="pt-2 space-y-2 border-t border-slate-800/80">
                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-300">Enforce mTLS Certificate Binding</span>
                  <input
                    type="checkbox"
                    checked={config.enforceMtls}
                    onChange={(e) => setConfig({ ...config, enforceMtls: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>

                <label className="flex items-center justify-between cursor-pointer">
                  <span className="text-xs text-slate-300">Enforce FAPI 2.0 Headers</span>
                  <input
                    type="checkbox"
                    checked={config.enforceFapiHeaders}
                    onChange={(e) => setConfig({ ...config, enforceFapiHeaders: e.target.checked })}
                    className="w-4 h-4 accent-blue-600 rounded"
                  />
                </label>
              </div>
            </div>
          </div>

          {/* Right Column: Decoder & Pipeline Output (7 cols) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Step-by-Step Middleware Execution Pipeline */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <IconShieldCheck className="w-4 h-4 text-emerald-400" />
                  Middleware Pipeline Execution Steps
                </h2>
                <span className="text-xs font-mono text-slate-400">
                  Total Latency: <strong className="text-emerald-400">{verificationPipeline.totalLatencyMs} ms</strong>
                </span>
              </div>

              <div className="space-y-3">
                {verificationPipeline.steps.map((step, index) => {
                  const isPass = step.status === 'passed';
                  const isFail = step.status === 'failed';
                  const isSkip = step.status === 'skipped';

                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-lg border transition-all ${
                        isPass
                          ? 'bg-slate-950/60 border-emerald-500/30 text-slate-200'
                          : isFail
                          ? 'bg-rose-950/30 border-rose-500/40 text-slate-200'
                          : 'bg-slate-950/20 border-slate-800/80 text-slate-500'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div className="flex items-center gap-2.5">
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center font-bold text-xs shrink-0 ${
                              isPass
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40'
                                : isFail
                                ? 'bg-rose-500/20 text-rose-400 border border-rose-500/40'
                                : 'bg-slate-800 text-slate-500'
                            }`}
                          >
                            {isPass ? <IconCheck className="w-3.5 h-3.5" /> : isFail ? <IconX className="w-3.5 h-3.5" /> : '-'}
                          </div>
                          <div>
                            <span className="text-xs font-semibold tracking-wide text-slate-100">
                              Step {index + 1}: {step.name}
                            </span>
                            <p className="text-xs font-mono mt-0.5 text-slate-300">{step.message}</p>
                          </div>
                        </div>

                        <span className="text-[10px] font-mono text-slate-500 whitespace-nowrap">{step.latencyMs}ms</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Token Inspector Tabs / Decoded Token Panels */}
            <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-lg space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <IconCode className="w-4 h-4 text-cyan-400" />
                  Decoded Token Claims Inspector
                </h2>
                {parsedToken.isValidStructure ? (
                  <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[11px] font-mono">
                    Valid JWT Structure
                  </span>
                ) : (
                  <span className="px-2 py-0.5 bg-rose-500/10 text-rose-400 border border-rose-500/20 rounded text-[11px] font-mono">
                    Invalid Token
                  </span>
                )}
              </div>

              {/* Time Gauge Preview */}
              {parsedToken.payload && (
                <div className="grid grid-cols-3 gap-3 p-3 bg-slate-950 border border-slate-800 rounded-lg text-center font-mono">
                  <div className="p-2 border-r border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Issued At (iat)</span>
                    <span className="text-xs text-slate-200 font-bold">{parsedToken.payload.iat || 'N/A'}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {parsedToken.payload.iat
                        ? new Date(parsedToken.payload.iat * 1000).toLocaleTimeString()
                        : '-'}
                    </span>
                  </div>

                  <div className="p-2 border-r border-slate-800">
                    <span className="text-[10px] text-slate-400 block uppercase">Not Before (nbf)</span>
                    <span className="text-xs text-slate-200 font-bold">{parsedToken.payload.nbf || 'N/A'}</span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {parsedToken.payload.nbf
                        ? new Date(parsedToken.payload.nbf * 1000).toLocaleTimeString()
                        : '-'}
                    </span>
                  </div>

                  <div className="p-2">
                    <span className="text-[10px] text-slate-400 block uppercase">Expires (exp)</span>
                    <span
                      className={`text-xs font-bold ${
                        parsedToken.payload.exp && parsedToken.payload.exp < now ? 'text-rose-400' : 'text-emerald-400'
                      }`}
                    >
                      {parsedToken.payload.exp || 'N/A'}
                    </span>
                    <span className="text-[10px] text-slate-400 block mt-0.5">
                      {parsedToken.payload.exp
                        ? new Date(parsedToken.payload.exp * 1000).toLocaleTimeString()
                        : '-'}
                    </span>
                  </div>
                </div>
              )}

              {/* JSON Decoded Views */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Header JSON */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-purple-400 font-semibold block">Header (JOSE Header)</span>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-purple-300 overflow-x-auto h-40">
                    {parsedToken.header ? JSON.stringify(parsedToken.header, null, 2) : '// No valid header decoded'}
                  </pre>
                </div>

                {/* Payload JSON */}
                <div className="space-y-1.5">
                  <span className="text-[11px] font-mono text-blue-400 font-semibold block">Payload (Claims)</span>
                  <pre className="bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-blue-300 overflow-x-auto h-40">
                    {parsedToken.payload ? JSON.stringify(parsedToken.payload, null, 2) : '// No valid payload decoded'}
                  </pre>
                </div>
              </div>

              {/* Signature Preview */}
              <div className="space-y-1">
                <span className="text-[11px] font-mono text-slate-400 font-semibold block">Cryptographic Signature</span>
                <div className="bg-slate-950 border border-slate-800 rounded-lg p-2.5 text-xs font-mono text-slate-400 truncate">
                  {parsedToken.signature || 'N/A'}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default TokenVerificationTester;