import React, { useState, useEffect, useRef } from 'react';
import { 
  Shield, 
  Key, 
  Lock, 
  ArrowRight, 
  ArrowLeft, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Server, 
  Smartphone, 
  User, 
  Layers, 
  Copy, 
  Check, 
  Play, 
  Pause, 
  RotateCcw, 
  Zap, 
  ExternalLink,
  Code,
  FileText,
  Clock,
  Terminal
} from 'lucide-react';

export type OAuthMode = '2-legged' | '3-legged';

export interface SequenceStep {
  id: number;
  from: 'cardholder' | 'fintech' | 'aggregator' | 'gateway' | 'idp';
  to: 'cardholder' | 'fintech' | 'aggregator' | 'gateway' | 'idp';
  label: string;
  sublabel: string;
  httpMethod?: 'GET' | 'POST' | 'REDIRECT' | 'INTERNAL';
  endpoint?: string;
  headers?: Record<string, string>;
  payload?: Record<string, any>;
  responsePayload?: Record<string, any>;
  description: string;
  securityNotes: string;
  latencyMs: number;
}

export const TWO_LEGGED_STEPS: SequenceStep[] = [
  {
    id: 1,
    from: 'fintech',
    to: 'gateway',
    label: '1. Request Client Token (M2M)',
    sublabel: 'POST /ccoauth/token',
    httpMethod: 'POST',
    endpoint: 'https://api-sandbox.chase.com/ccoauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic Base64(client_id:client_secret)',
      'x-jpmc-trace-id': 'b4e9f1a0c8d74e1290fa87b321a5d6e8'
    },
    payload: {
      grant_type: 'client_credentials',
      scope: 'card'
    },
    responsePayload: {
      access_token: 'chase_m2m_jwt_eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9...',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'card'
    },
    description: 'Partner backend requests a 2-legged machine-to-machine JWT using client credentials issued during enterprise onboarding.',
    securityNotes: 'Mutual TLS (mTLS) with JPMC Root CA + SHA256 Client Secret signature. Strict IP whitelisting enforced.',
    latencyMs: 142
  },
  {
    id: 2,
    from: 'gateway',
    to: 'idp',
    label: '2. Validate Partner Credentials',
    sublabel: 'Internal OAuth Broker Authz',
    httpMethod: 'INTERNAL',
    endpoint: 'internal://idp.core.jpmchase.net/v2/verify-partner',
    headers: {
      'X-Partner-Id': 'PTR-884920-MERCHANT-L2'
    },
    payload: {
      client_id: 'ptr_clnt_8823f98a2b',
      scope_requested: ['card']
    },
    responsePayload: {
      authorized: true,
      partner_tier: 'TIER_1_ENTERPRISE',
      quota_limit: '100000_RPS'
    },
    description: 'JPMC API Gateway queries the Core Identity Provider to verify partner certificate, cryptographic signers, and entitlement scopes.',
    securityNotes: 'Kerberos/OAuth introspection behind internal DMZ boundary.',
    latencyMs: 38
  },
  {
    id: 3,
    from: 'gateway',
    to: 'fintech',
    label: '3. Return 2-Legged Bearer Token',
    sublabel: '200 OK (JWT Access Token)',
    httpMethod: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store'
    },
    responsePayload: {
      access_token: 'chase_m2m_jwt_98741e0bca2358...',
      token_type: 'Bearer',
      expires_in: 3600,
      scope: 'card'
    },
    description: 'Gateway returns a cryptographically signed asymmetric RS256 token valid for 3600 seconds with "card" scope.',
    securityNotes: 'Token contains JTI claim to prevent replay attacks and is tied to the partner thumbprint.',
    latencyMs: 120
  },
  {
    id: 4,
    from: 'fintech',
    to: 'gateway',
    label: '4. Execute CLPWPE API Operation',
    sublabel: 'POST /enrollments/{uuid}',
    httpMethod: 'POST',
    endpoint: 'https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1/merchants/programs/pay-with-points/enrollments/7c9e6679-7425-40de-944b-e07fc1f90ae7',
    headers: {
      'authorization': 'Bearer chase_m2m_jwt_98741e0bca2358...',
      'enrollment-type-code': 'AUTOENROLL',
      'external-account-identifier': 'EXT-CUST-ACCT-889410382',
      'trace-id': 'b4e9f1a0c8d74e1290fa87b321a5d6e8',
      'channel-type': 'WEB'
    },
    payload: {
      enrollmentPreference: 'ENABLED_ALL_CARDS'
    },
    responsePayload: {
      enrollment: {
        enrollmentStatusName: 'AUTOENROLLED',
        enrollmentStatusDate: '2025-02-23'
      },
      product: {
        merchantDefinedProductCode: 'SAPPHIRE_RESERVE'
      }
    },
    description: 'Fintech issues an enrollment request on behalf of the customer using 2-legged authorization with customer account mapping headers.',
    securityNotes: 'Gateway matches account reference UUID with merchant relationship tables before routing to backend.',
    latencyMs: 185
  }
];

export const THREE_LEGGED_STEPS: SequenceStep[] = [
  {
    id: 1,
    from: 'cardholder',
    to: 'fintech',
    label: '1. Initiate "Link Chase Rewards"',
    sublabel: 'User action on UI',
    httpMethod: 'GET',
    endpoint: 'https://fintech-app.com/rewards/connect/chase',
    description: 'Cardholder clicks "Connect Chase Ultimate Rewards" inside the partner merchant checkout flow.',
    securityNotes: 'Client session established with PKCE Code Verifier generated locally.',
    latencyMs: 45
  },
  {
    id: 2,
    from: 'fintech',
    to: 'cardholder',
    label: '2. Redirect to Chase OAuth Authorization',
    sublabel: 'HTTP 302 Redirect with PKCE',
    httpMethod: 'REDIRECT',
    endpoint: 'https://secure07ea.chase.com/auth/oauth/v2/authorize',
    payload: {
      response_type: 'code',
      client_id: 'ptr_clnt_8823f98a2b',
      redirect_uri: 'https://fintech-app.com/oauth/callback',
      scope: 'card loyalty.pwp',
      state: 'st_9941a0b3f88c7d',
      code_challenge: 'E9Melhoa2OwvFrGMTJguCH5rtx647bCq-gWecQAmCSw',
      code_challenge_method: 'S256'
    },
    description: 'Fintech redirects cardholder browser to Chase Secure Login Portal with S256 PKCE challenge parameter and state nonce.',
    securityNotes: 'Prevents CSRF and authorization code interception attacks without client secret leak in browser.',
    latencyMs: 80
  },
  {
    id: 3,
    from: 'cardholder',
    to: 'idp',
    label: '3. Multi-Factor Authentication & Consent',
    sublabel: 'User logs into Chase Bank',
    httpMethod: 'POST',
    endpoint: 'https://secure07ea.chase.com/auth/login/authenticate',
    payload: {
      username: 'chase_cardholder_vip',
      mfa_token: '891043',
      consented_accounts: ['SAPPHIRE_RESERVE_...9041']
    },
    description: 'User enters credentials, passes FIDO2/MFA push notification, and consents to grant Pay with Points privileges for Sapphire Reserve.',
    securityNotes: 'Credentials never touch the Fintech or Aggregator servers. Chase session isolated in sandboxed domain.',
    latencyMs: 1400
  },
  {
    id: 4,
    from: 'idp',
    to: 'cardholder',
    label: '4. Redirect with Authz Code',
    sublabel: 'HTTP 302 Redirect to Callback',
    httpMethod: 'REDIRECT',
    endpoint: 'https://fintech-app.com/oauth/callback?code=chase_authz_cd_8831a90c&state=st_9941a0b3f88c7d',
    description: 'Chase IdP issues a short-lived authorization code (60 sec TTL) and returns the cardholder to the fintech application.',
    securityNotes: 'Single-use code bound to the original PKCE code verifier and client redirect URI.',
    latencyMs: 110
  },
  {
    id: 5,
    from: 'fintech',
    to: 'gateway',
    label: '5. Exchange Code & Code Verifier for Token',
    sublabel: 'POST /ccoauth/token (3-legged)',
    httpMethod: 'POST',
    endpoint: 'https://api.chase.com/ccoauth/token',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
      'Authorization': 'Basic Base64(client_id:client_secret)'
    },
    payload: {
      grant_type: 'authorization_code',
      code: 'chase_authz_cd_8831a90c',
      redirect_uri: 'https://fintech-app.com/oauth/callback',
      code_verifier: 'dBjftJeZ4CVP-mB92K27uhbUJU1p1r_wW1gFWFOEjXk'
    },
    responsePayload: {
      access_token: 'chase_user_bearer_jwt_77341b9c8e...',
      token_type: 'Bearer',
      expires_in: 1800,
      refresh_token: 'chase_rt_004921bdfa8910243...',
      scope: 'card loyalty.pwp'
    },
    description: 'Fintech backend securely calls Chase OAuth server to swap the authorization code along with raw PKCE code_verifier.',
    securityNotes: 'Dual authentication: Client Secret (server-side) + PKCE verifier SHA256 validation.',
    latencyMs: 195
  },
  {
    id: 6,
    from: 'fintech',
    to: 'gateway',
    label: '6. Call CLPWPE with Dual Authorization',
    sublabel: 'POST /enrollments/{uuid} with auth & auth2',
    httpMethod: 'POST',
    endpoint: 'https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1/merchants/programs/pay-with-points/enrollments/7c9e6679-7425-40de-944b-e07fc1f90ae7',
    headers: {
      'authorization': 'Bearer chase_user_bearer_jwt_77341b9c8e...',
      'authorization2': 'Bearer chase_partner_m2m_jwt_98741e...',
      'enrollment-type-code': 'ENROLL',
      'external-account-identifier': 'EXT-CUST-ACCT-889410382',
      'trace-id': 'b4e9f1a0c8d74e1290fa87b321a5d6e8',
      'channel-type': 'MOBILE_NATIVE'
    },
    payload: {
      enrollmentStatus: 'ENROLLED',
      selectedRewardProgram: 'CHASE_ULTIMATE_REWARDS'
    },
    responsePayload: {
      enrollment: {
        enrollmentStatusName: 'ENROLLED',
        enrollmentStatusDate: '2025-02-23'
      },
      product: {
        merchantDefinedProductCode: 'SAPPHIRE_RESERVE'
      }
    },
    description: 'Enrollment executed with primary user delegation token in "authorization" header and secondary merchant token in "authorization2".',
    securityNotes: 'Fulfills OpenAPI spec requirements for combined 3-legged user consent and 2-legged merchant entitlement.',
    latencyMs: 230
  }
];

export const ChaseOAuthFlowVisualizer: React.FC = () => {
  const [activeMode, setActiveMode] = useState<OAuthMode>('3-legged');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [viewTab, setViewTab] = useState<'visual' | 'code' | 'headers'>('visual');
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const steps = activeMode === '2-legged' ? TWO_LEGGED_STEPS : THREE_LEGGED_STEPS;
  const currentStep = steps[currentStepIndex] || steps[0];

  useEffect(() => {
    setCurrentStepIndex(0);
    setIsPlaying(false);
  }, [activeMode]);

  useEffect(() => {
    if (isPlaying) {
      timerRef.current = setInterval(() => {
        setCurrentStepIndex((prev) => {
          if (prev >= steps.length - 1) {
            setIsPlaying(false);
            return prev;
          }
          return prev + 1;
        });
      }, 3500);
    } else {
      if (timerRef.current) clearInterval(timerRef.current);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isPlaying, steps.length]);

  const handleCopy = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const getEntityIcon = (entity: string) => {
    switch (entity) {
      case 'cardholder':
        return <User className="w-5 h-5 text-emerald-400" />;
      case 'fintech':
        return <Smartphone className="w-5 h-5 text-cyan-400" />;
      case 'aggregator':
        return <Layers className="w-5 h-5 text-amber-400" />;
      case 'gateway':
        return <Server className="w-5 h-5 text-blue-400" />;
      case 'idp':
        return <Shield className="w-5 h-5 text-purple-400" />;
      default:
        return <Server className="w-5 h-5 text-slate-400" />;
    }
  };

  const getEntityName = (entity: string) => {
    switch (entity) {
      case 'cardholder':
        return 'Cardholder Browser / App';
      case 'fintech':
        return 'Fintech Partner Backend';
      case 'aggregator':
        return 'Data Aggregator / Switch';
      case 'gateway':
        return 'api.chase.com Gateway';
      case 'idp':
        return 'Chase Core Auth & IdP';
      default:
        return entity;
    }
  };

  const participants = activeMode === '2-legged' 
    ? ['fintech', 'gateway', 'idp']
    : ['cardholder', 'fintech', 'gateway', 'idp'];

  return (
    <div className="w-full bg-[#0a111e] border border-blue-900/40 rounded-xl shadow-2xl text-slate-100 overflow-hidden font-sans">
      {/* Header Bar */}
      <div className="bg-[#0f1d33] border-b border-blue-900/50 p-5 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="p-2.5 bg-blue-600/20 border border-blue-500/40 rounded-lg text-blue-400 shadow-inner">
            <Lock className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-xl font-bold tracking-tight text-white">OAuth 2.0 Security Architecture Flow</h2>
              <span className="text-xs uppercase px-2.5 py-0.5 rounded-full bg-blue-500/10 text-blue-300 font-mono font-semibold border border-blue-500/30">
                RFC 6749 + PKCE
              </span>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Interactive protocol verification between Partner Apps and Chase Core Identity Services (CLPWPE)
            </p>
          </div>
        </div>

        {/* Mode Selector */}
        <div className="flex items-center bg-slate-900/80 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveMode('2-legged')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeMode === '2-legged'
                ? 'bg-blue-600 text-white shadow-md shadow-blue-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            2-Legged OAuth (M2M)
          </button>
          <button
            onClick={() => setActiveMode('3-legged')}
            className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
              activeMode === '3-legged'
                ? 'bg-purple-600 text-white shadow-md shadow-purple-900/50'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            3-Legged OAuth (Delegated Consent)
          </button>
        </div>
      </div>

      {/* Mode Briefing Banner */}
      <div className={`px-6 py-3 border-b text-xs flex items-center justify-between ${
        activeMode === '2-legged' 
          ? 'bg-blue-950/30 border-blue-900/30 text-blue-200' 
          : 'bg-purple-950/30 border-purple-900/30 text-purple-200'
      }`}>
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 shrink-0 text-amber-400" />
          <span>
            <strong>{activeMode === '2-legged' ? 'Client Credentials Flow:' : 'Authorization Code Flow with PKCE:'}</strong>{' '}
            {activeMode === '2-legged'
              ? 'Secures direct server-to-server API calls using client ID/Secret. Ideal for batch auto-enrollments and automated loyalty operations.'
              : 'Secures delegated end-user consent without exposing cardholder credentials to merchant apps. Required for self-enrollment.'}
          </span>
        </div>
        <div className="flex items-center space-x-2 shrink-0">
          <span className="font-mono text-[11px] text-slate-400">Endpoint: https://api-sandbox.chase.com/ccoauth/token</span>
        </div>
      </div>

      {/* Control Bar & Timeline Progress */}
      <div className="bg-[#0b1526] px-6 py-3 border-b border-slate-800 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={() => setIsPlaying(!isPlaying)}
            className="flex items-center space-x-1.5 px-3 py-1.5 bg-blue-600 hover:bg-blue-500 text-white text-xs font-bold rounded shadow transition"
          >
            {isPlaying ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5" />}
            <span>{isPlaying ? 'Pause' : 'Auto Play'}</span>
          </button>
          <button
            onClick={() => {
              setIsPlaying(false);
              setCurrentStepIndex(0);
            }}
            className="p-1.5 text-slate-400 hover:text-white bg-slate-800/80 hover:bg-slate-700 rounded transition"
            title="Reset Sequence"
          >
            <RotateCcw className="w-4 h-4" />
          </button>

          <div className="h-4 w-[1px] bg-slate-700 mx-2" />

          {/* Stepper Buttons */}
          <div className="flex items-center space-x-1">
            {steps.map((s, idx) => (
              <button
                key={s.id}
                onClick={() => {
                  setIsPlaying(false);
                  setCurrentStepIndex(idx);
                }}
                className={`w-7 h-7 rounded-full text-xs font-mono font-bold transition flex items-center justify-center ${
                  idx === currentStepIndex
                    ? activeMode === '2-legged' 
                      ? 'bg-blue-500 text-white ring-2 ring-blue-400/50 shadow-lg' 
                      : 'bg-purple-500 text-white ring-2 ring-purple-400/50 shadow-lg'
                    : idx < currentStepIndex
                    ? 'bg-slate-800 text-emerald-400 border border-emerald-500/30'
                    : 'bg-slate-900 text-slate-500 border border-slate-800 hover:text-slate-300'
                }`}
              >
                {idx < currentStepIndex ? '✓' : idx + 1}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            <span>Est. Step Latency: <span className="text-amber-300 font-mono">{currentStep.latencyMs}ms</span></span>
          </div>

          <div className="flex bg-slate-900 p-0.5 rounded border border-slate-800">
            <button
              onClick={() => setViewTab('visual')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                viewTab === 'visual' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Visual Flow
            </button>
            <button
              onClick={() => setViewTab('headers')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                viewTab === 'headers' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Headers & Wire Payload
            </button>
            <button
              onClick={() => setViewTab('code')}
              className={`px-2.5 py-1 text-xs rounded font-medium transition ${
                viewTab === 'code' ? 'bg-slate-800 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Implementation Code
            </button>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {viewTab === 'visual' && (
          <div className="space-y-6">
            {/* Sequence Diagram Canvas */}
            <div className="bg-[#060c17] p-6 rounded-xl border border-blue-950/80 relative overflow-x-auto shadow-inner">
              {/* Participant Columns Header */}
              <div className="grid grid-cols-4 gap-4 min-w-[700px] mb-8 pb-4 border-b border-slate-800/80">
                {participants.map((p) => (
                  <div key={p} className="flex flex-col items-center">
                    <div className="flex items-center space-x-2 px-3 py-1.5 rounded-lg bg-slate-900/90 border border-slate-700/80 shadow-md">
                      {getEntityIcon(p)}
                      <span className="text-xs font-semibold text-slate-200">{getEntityName(p)}</span>
                    </div>
                    <div className="w-[1px] h-6 bg-slate-800 mt-2" />
                  </div>
                ))}
              </div>

              {/* Step Sequence Lines */}
              <div className="space-y-4 min-w-[700px] relative">
                {steps.map((step, idx) => {
                  const isCurrent = idx === currentStepIndex;
                  const isPassed = idx < currentStepIndex;
                  const fromIdx = participants.indexOf(step.from);
                  const toIdx = participants.indexOf(step.to);
                  const isLeftToRight = fromIdx <= toIdx;
                  
                  // Calculate positioning percentages
                  const colSpan = Math.abs(toIdx - fromIdx);
                  const startCol = Math.min(fromIdx, toIdx);

                  return (
                    <div 
                      key={step.id} 
                      onClick={() => {
                        setIsPlaying(false);
                        setCurrentStepIndex(idx);
                      }}
                      className={`cursor-pointer transition-all duration-300 p-2.5 rounded-lg border ${
                        isCurrent 
                          ? activeMode === '2-legged'
                            ? 'bg-blue-950/60 border-blue-500/70 shadow-lg shadow-blue-950'
                            : 'bg-purple-950/60 border-purple-500/70 shadow-lg shadow-purple-950'
                          : isPassed
                          ? 'bg-slate-900/40 border-slate-800/80 opacity-70'
                          : 'bg-transparent border-transparent opacity-40 hover:opacity-60'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5 px-2 text-xs">
                        <div className="flex items-center space-x-2">
                          <span className={`font-mono px-1.5 py-0.5 rounded text-[10px] font-bold ${
                            isCurrent ? 'bg-blue-500 text-white' : 'bg-slate-800 text-slate-400'
                          }`}>
                            STEP {step.id}
                          </span>
                          <span className={`font-semibold ${isCurrent ? 'text-white' : 'text-slate-300'}`}>
                            {step.label}
                          </span>
                          {step.httpMethod && (
                            <span className={`font-mono text-[10px] px-1.5 rounded ${
                              step.httpMethod === 'POST' ? 'bg-emerald-950 text-emerald-300 border border-emerald-800' :
                              step.httpMethod === 'REDIRECT' ? 'bg-amber-950 text-amber-300 border border-amber-800' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {step.httpMethod}
                            </span>
                          )}
                        </div>
                        <span className="text-[11px] text-slate-500 font-mono">{step.sublabel}</span>
                      </div>

                      {/* Direction Vector Representation */}
                      <div className="relative h-6 bg-slate-950/40 rounded flex items-center px-4 border border-slate-900">
                        <div className="w-full flex items-center justify-between text-[11px] font-mono text-slate-400">
                          <div className="flex items-center space-x-1 text-slate-300 font-semibold">
                            {getEntityIcon(step.from)}
                            <span>{getEntityName(step.from).split(' ')[0]}</span>
                          </div>
                          
                          <div className="flex-1 mx-4 flex items-center relative">
                            <div className={`w-full h-0.5 ${
                              isCurrent 
                                ? activeMode === '2-legged' ? 'bg-blue-500 animate-pulse' : 'bg-purple-500 animate-pulse'
                                : 'bg-slate-700'
                            }`} />
                            <ArrowRight className={`w-4 h-4 -ml-2 shrink-0 ${
                              isCurrent 
                                ? activeMode === '2-legged' ? 'text-blue-400' : 'text-purple-400'
                                : 'text-slate-600'
                            }`} />
                          </div>

                          <div className="flex items-center space-x-1 text-slate-300 font-semibold">
                            {getEntityIcon(step.to)}
                            <span>{getEntityName(step.to).split(' ')[0]}</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Step Detail Card */}
            <div className="bg-[#0b1526] rounded-xl border border-blue-900/40 p-5 shadow-xl">
              <div className="flex flex-wrap items-start justify-between gap-4 pb-4 border-b border-slate-800">
                <div className="space-y-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-2 py-0.5 bg-blue-500/20 text-blue-300 font-mono text-xs rounded border border-blue-500/30">
                      Step {currentStep.id} of {steps.length}
                    </span>
                    <h3 className="text-base font-bold text-white">{currentStep.label}</h3>
                  </div>
                  <p className="text-xs text-slate-300 max-w-2xl">{currentStep.description}</p>
                </div>

                <div className="flex items-center space-x-2">
                  <button
                    disabled={currentStepIndex === 0}
                    onClick={() => setCurrentStepIndex(p => p - 1)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 disabled:opacity-30 rounded text-xs flex items-center space-x-1 text-slate-200 transition"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Previous</span>
                  </button>
                  <button
                    disabled={currentStepIndex === steps.length - 1}
                    onClick={() => setCurrentStepIndex(p => p + 1)}
                    className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 disabled:opacity-30 rounded text-xs flex items-center space-x-1 text-white font-semibold transition shadow"
                  >
                    <span>Next Step</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>

              {/* Security & Token Info Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4 text-xs">
                <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-2 text-emerald-400 font-semibold mb-1.5">
                    <Shield className="w-4 h-4" />
                    <span>Security Context & RFC Compliance</span>
                  </div>
                  <p className="text-slate-400 leading-relaxed">{currentStep.securityNotes}</p>
                </div>

                <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
                  <div className="flex items-center space-x-2 text-blue-400 font-semibold mb-1.5">
                    <Key className="w-4 h-4" />
                    <span>Target Route / Action</span>
                  </div>
                  <p className="font-mono text-slate-300 break-all bg-slate-950 p-2 rounded border border-slate-800/80">
                    {currentStep.endpoint || 'Direct In-Memory Browser Session Event'}
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {viewTab === 'headers' && (
          <div className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Request Headers & Payload */}
              <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-200">HTTP Request Headers & Payload</span>
                  </div>
                  <button
                    onClick={() => handleCopy(JSON.stringify({ headers: currentStep.headers, payload: currentStep.payload }, null, 2), 'req')}
                    className="text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                  >
                    {copiedKey === 'req' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                    <span>{copiedKey === 'req' ? 'Copied' : 'Copy'}</span>
                  </button>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  {currentStep.headers && (
                    <div>
                      <div className="text-slate-500 mb-1 text-[11px] uppercase tracking-wider">Headers</div>
                      <pre className="bg-[#040810] p-3 rounded-lg text-blue-300 border border-slate-800/80 overflow-x-auto">
                        {Object.entries(currentStep.headers).map(([k, v]) => (
                          <div key={k} className="leading-5">
                            <span className="text-purple-400">{k}:</span> <span className="text-slate-300">{v}</span>
                          </div>
                        ))}
                      </pre>
                    </div>
                  )}

                  {currentStep.payload && (
                    <div>
                      <div className="text-slate-500 mb-1 text-[11px] uppercase tracking-wider">Payload Body</div>
                      <pre className="bg-[#040810] p-3 rounded-lg text-emerald-300 border border-slate-800/80 overflow-x-auto">
                        {JSON.stringify(currentStep.payload, null, 2)}
                      </pre>
                    </div>
                  )}

                  {!currentStep.headers && !currentStep.payload && (
                    <div className="text-slate-500 italic p-4 text-center">No HTTP body or custom headers for browser direct event</div>
                  )}
                </div>
              </div>

              {/* Response Body */}
              <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4">
                <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800">
                  <div className="flex items-center space-x-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-200">Server Response Payload</span>
                  </div>
                  {currentStep.responsePayload && (
                    <button
                      onClick={() => handleCopy(JSON.stringify(currentStep.responsePayload, null, 2), 'res')}
                      className="text-slate-400 hover:text-white text-xs flex items-center space-x-1"
                    >
                      {copiedKey === 'res' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                      <span>{copiedKey === 'res' ? 'Copied' : 'Copy'}</span>
                    </button>
                  )}
                </div>

                <div className="font-mono text-xs">
                  {currentStep.responsePayload ? (
                    <pre className="bg-[#040810] p-3 rounded-lg text-emerald-300 border border-slate-800/80 overflow-x-auto">
                      {JSON.stringify(currentStep.responsePayload, null, 2)}
                    </pre>
                  ) : (
                    <div className="text-slate-500 italic p-4 text-center">No synchronous JSON response body (Redirect or Client side action)</div>
                  )}
                </div>
              </div>
            </div>
          </div>
        )}

        {viewTab === 'code' && (
          <div className="bg-[#070e1b] rounded-xl border border-slate-800 p-4">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800">
              <div className="flex items-center space-x-2">
                <Code className="w-4 h-4 text-purple-400" />
                <span className="text-xs font-bold text-slate-200">
                  Production TypeScript Implementation: {activeMode === '2-legged' ? '2-Legged M2M Client' : '3-Legged PKCE Token Broker'}
                </span>
              </div>
              <button
                onClick={() => handleCopy(activeMode === '2-legged' ? TWO_LEGGED_CODE_SAMPLE : THREE_LEGGED_CODE_SAMPLE, 'code_sample')}
                className="text-slate-400 hover:text-white text-xs flex items-center space-x-1 bg-slate-800 px-2.5 py-1 rounded"
              >
                {copiedKey === 'code_sample' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'code_sample' ? 'Copied Code' : 'Copy Source'}</span>
              </button>
            </div>

            <pre className="bg-[#040810] p-4 rounded-lg text-xs font-mono text-slate-300 overflow-x-auto border border-slate-800/80 leading-relaxed">
              {activeMode === '2-legged' ? TWO_LEGGED_CODE_SAMPLE : THREE_LEGGED_CODE_SAMPLE}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Info / OpenAPI Specs Binding */}
      <div className="bg-[#0b1526] px-6 py-3 border-t border-slate-800 flex flex-wrap items-center justify-between text-[11px] text-slate-400">
        <div className="flex items-center space-x-3">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Chase API Spec: <strong>Card Loyalty Pay With Points Enrollment API v1.0.0</strong></span>
        </div>
        <div className="flex items-center space-x-4">
          <span>Base Path: <code className="text-blue-300">/card/loyalty/earn-rewards/enrollment/v1</code></span>
          <span>Security: <code className="text-purple-300">Common 2-Legged OAuth (card scope)</code></span>
        </div>
      </div>
    </div>
  );
};

// Production code templates shown in code tab
const TWO_LEGGED_CODE_SAMPLE = `import axios from 'axios';
import crypto from 'crypto';

export class Chase2LeggedOAuthClient {
  private clientId: string;
  private clientSecret: string;
  private tokenUrl = 'https://api-sandbox.chase.com/ccoauth/token';
  private cachedToken: { token: string; expiresAt: number } | null = null;

  constructor(clientId: string, clientSecret: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
  }

  /**
   * Retrieves an M2M OAuth Bearer token with 2-legged authentication
   */
  async getBearerToken(): Promise<string> {
    if (this.cachedToken && Date.now() < this.cachedToken.expiresAt - 60000) {
      return this.cachedToken.token;
    }

    const authHeader = Buffer.from(\`\${this.clientId}:\${this.clientSecret}\`).toString('base64');
    const traceId = crypto.randomBytes(16).toString('hex');

    const response = await axios.post(
      this.tokenUrl,
      new URLSearchParams({
        grant_type: 'client_credentials',
        scope: 'card'
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': \`Basic \${authHeader}\`,
          'trace-id': traceId
        }
      }
    );

    this.cachedToken = {
      token: response.data.access_token,
      expiresAt: Date.now() + response.data.expires_in * 1000
    };

    return response.data.access_token;
  }

  /**
   * Enrolls a cardholder into Pay with Points
   */
  async autoEnrollCard(accountUuid: string, externalAccountId: string) {
    const token = await this.getBearerToken();
    const traceId = crypto.randomBytes(16).toString('hex');

    return axios.post(
      \`https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1/merchants/programs/pay-with-points/enrollments/\${accountUuid}\`,
      {},
      {
        headers: {
          'authorization': \`Bearer \${token}\`,
          'enrollment-type-code': 'AUTOENROLL',
          'external-account-identifier': externalAccountId,
          'trace-id': traceId,
          'channel-type': 'WEB'
        }
      }
    );
  }
}`;

const THREE_LEGGED_CODE_SAMPLE = `import crypto from 'crypto';
import axios from 'axios';

export class Chase3LeggedPKCEBroker {
  private clientId: string;
  private clientSecret: string;
  private redirectUri: string;

  constructor(clientId: string, clientSecret: string, redirectUri: string) {
    this.clientId = clientId;
    this.clientSecret = clientSecret;
    this.redirectUri = redirectUri;
  }

  /**
   * Generates PKCE Challenge and State for authorization URL
   */
  generateAuthUrl(): { url: string; codeVerifier: string; state: string } {
    const codeVerifier = crypto.randomBytes(32).toString('base64url');
    const codeChallenge = crypto
      .createHash('sha256')
      .update(codeVerifier)
      .digest('base64url');
    const state = crypto.randomBytes(16).toString('hex');

    const params = new URLSearchParams({
      response_type: 'code',
      client_id: this.clientId,
      redirect_uri: this.redirectUri,
      scope: 'card loyalty.pwp',
      state,
      code_challenge: codeChallenge,
      code_challenge_method: 'S256'
    });

    return {
      url: \`https://secure07ea.chase.com/auth/oauth/v2/authorize?\${params.toString()}\`,
      codeVerifier,
      state
    };
  }

  /**
   * Exchanges Authorization Code + PKCE Verifier for dual user tokens
   */
  async exchangeCodeForTokens(authCode: string, codeVerifier: string) {
    const authHeader = Buffer.from(\`\${this.clientId}:\${this.clientSecret}\`).toString('base64');

    const response = await axios.post(
      'https://api.chase.com/ccoauth/token',
      new URLSearchParams({
        grant_type: 'authorization_code',
        code: authCode,
        redirect_uri: this.redirectUri,
        code_verifier: codeVerifier
      }).toString(),
      {
        headers: {
          'Content-Type': 'application/x-www-form-urlencoded',
          'Authorization': \`Basic \${authHeader}\`
        }
      }
    );

    return response.data; // { access_token, refresh_token, expires_in, scope }
  }
}`;

export default ChaseOAuthFlowVisualizer;