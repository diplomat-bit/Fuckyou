import React, { useState, useEffect, useMemo, useId } from 'react';

// ==========================================
// TYPES & DATA CONTRACTS
// ==========================================

export type AggregatorPartner = {
  id: string;
  name: string;
  legalEntity: string;
  logoBadge: string;
  logoBg: string;
  category: 'FINTECH_AGGREGATOR' | 'TAX_PREP' | 'WEALTH_TECH' | 'PAYMENT_RAIL';
  securityRating: 'FDX_5_3_CERTIFIED' | 'ISO_27001' | 'SOC2_TYPE_II';
  trustedSince: string;
  activeUsersCount: string;
  description: string;
  callbackUri: string;
};

export type BankAccountScope = {
  id: string;
  accountNumberMasked: string;
  accountTitle: string;
  productType: 'CARD_REWARDS' | 'CHECKING' | 'SAVINGS' | 'INVESTMENT' | 'BUSINESS';
  balance: number;
  currency: string;
  isEligiblePayWithPoints: boolean;
  pointsBalance?: number;
};

export type PermissionScope = {
  id: string;
  name: string;
  code: string;
  category: 'IDENTITY' | 'BALANCES' | 'TRANSACTIONS' | 'REWARDS' | 'STATEMENTS';
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH';
  description: string;
  fdxMapping: string;
};

export type ActiveConsentRecord = {
  consentId: string;
  partnerId: string;
  partnerName: string;
  grantedAt: string;
  expiresAt: string;
  selectedAccountIds: string[];
  selectedScopeIds: string[];
  status: 'ACTIVE' | 'REVOKED' | 'EXPIRED';
  authCode: string;
  traceId: string;
};

// ==========================================
// STATIC SEED DATA
// ==========================================

const PARTNERS: AggregatorPartner[] = [
  {
    id: 'plaid-fdx',
    name: 'Plaid Open Banking',
    legalEntity: 'Plaid Inc. via Chase Secure Exchange Gateway',
    logoBadge: 'PL',
    logoBg: 'from-blue-600 to-indigo-700',
    category: 'FINTECH_AGGREGATOR',
    securityRating: 'FDX_5_3_CERTIFIED',
    trustedSince: '2019-11-14',
    activeUsersCount: '18.4M Accounts',
    description: 'Direct tokenized API access replacing credential sharing for budget and portfolio tools.',
    callbackUri: 'https://cdn.plaid.com/link/oauth/v2/callback',
  },
  {
    id: 'stripe-financial',
    name: 'Stripe Financial Connections',
    legalEntity: 'Stripe Payments LLC - Direct Core API',
    logoBadge: 'ST',
    logoBg: 'from-violet-600 to-purple-800',
    category: 'PAYMENT_RAIL',
    securityRating: 'FDX_5_3_CERTIFIED',
    trustedSince: '2021-04-02',
    activeUsersCount: '9.2M Accounts',
    description: 'Instant micro-deposit elimination and real-time ACH account verification.',
    callbackUri: 'https://connect.stripe.com/financial_connections/oauth_return',
  },
  {
    id: 'turbotax-intuit',
    name: 'Intuit / TurboTax Sync',
    legalEntity: 'Intuit Financial Services Data Network',
    logoBadge: 'IT',
    logoBg: 'from-emerald-600 to-teal-800',
    category: 'TAX_PREP',
    securityRating: 'SOC2_TYPE_II',
    trustedSince: '2018-01-20',
    activeUsersCount: '14.1M Accounts',
    description: 'Automated 1099-INT, 1099-DIV, and qualified dividend tax schedule generation.',
    callbackUri: 'https://oauth.intuit.com/secure/tax-import/jpmc',
  },
  {
    id: 'yodlee-envestnet',
    name: 'Envestnet | Yodlee Wealth',
    legalEntity: 'Envestnet Data Services LLC',
    logoBadge: 'YD',
    logoBg: 'from-amber-600 to-orange-700',
    category: 'WEALTH_TECH',
    securityRating: 'FDX_5_3_CERTIFIED',
    trustedSince: '2017-08-09',
    activeUsersCount: '6.7M Accounts',
    description: 'Comprehensive wealth aggregation, 401(k) mirror, and Private Client portfolio consolidation.',
    callbackUri: 'https://aggregation.yodlee.com/oauth/token_exchange',
  },
];

const CHASE_ACCOUNTS: BankAccountScope[] = [
  {
    id: 'chk-8891',
    accountNumberMasked: '•••• 8891',
    accountTitle: 'Chase Premier Plus Checking',
    productType: 'CHECKING',
    balance: 84920.45,
    currency: 'USD',
    isEligiblePayWithPoints: false,
  },
  {
    id: 'sav-4012',
    accountNumberMasked: '•••• 4012',
    accountTitle: 'Chase Sapphire Private Savings',
    productType: 'SAVINGS',
    balance: 412500.0,
    currency: 'USD',
    isEligiblePayWithPoints: false,
  },
  {
    id: 'crd-9904',
    accountNumberMasked: '•••• 9904',
    accountTitle: 'Chase Sapphire Reserve® (Visa Infinite)',
    productType: 'CARD_REWARDS',
    balance: 4120.18,
    currency: 'USD',
    isEligiblePayWithPoints: true,
    pointsBalance: 342980,
  },
  {
    id: 'crd-2231',
    accountNumberMasked: '•••• 2231',
    accountTitle: 'Ink Business Preferred® Credit Card',
    productType: 'BUSINESS',
    balance: 18450.9,
    currency: 'USD',
    isEligiblePayWithPoints: true,
    pointsBalance: 512400,
  },
  {
    id: 'inv-7719',
    accountNumberMasked: '•••• 7719',
    accountTitle: 'J.P. Morgan Self-Directed Wealth Portfolio',
    productType: 'INVESTMENT',
    balance: 1240890.3,
    currency: 'USD',
    isEligiblePayWithPoints: false,
  },
];

const PERMISSION_SCOPES: PermissionScope[] = [
  {
    id: 'scope-acct-info',
    name: 'Account Identifiers & Masked Numbers',
    code: 'fdx:account_details:read',
    category: 'IDENTITY',
    riskLevel: 'LOW',
    description: 'Allows reading of bank routing number, tokenized virtual card identifier, and masked account number.',
    fdxMapping: 'ACCOUNT_BASIC_READ',
  },
  {
    id: 'scope-balances',
    name: 'Real-Time Balance & Available Credit',
    code: 'fdx:balances:read',
    category: 'BALANCES',
    riskLevel: 'LOW',
    description: 'Provides live settled balances, pending holds, and available credit lines.',
    fdxMapping: 'ACCOUNT_BALANCES_READ',
  },
  {
    id: 'scope-tx-history',
    name: '24-Month Transaction History & Memos',
    code: 'fdx:transactions:read',
    category: 'TRANSACTIONS',
    riskLevel: 'MEDIUM',
    description: 'Grants access to transaction categorization, timestamps, merchant names, and ISO currency codes.',
    fdxMapping: 'TRANSACTION_EXTENDED_READ',
  },
  {
    id: 'scope-loyalty-pwp',
    name: 'Ultimate Rewards® & Pay With Points API',
    code: 'chase:loyalty:pay_with_points:manage',
    category: 'REWARDS',
    riskLevel: 'MEDIUM',
    description: 'Enables Pay with Points partner enrollment (CLPWPE) and real-time redemption rate queries.',
    fdxMapping: 'REWARDS_PROGRAM_PWP_DIRECT',
  },
  {
    id: 'scope-identity-kyc',
    name: 'Legal Customer Identity & KYC Profile',
    code: 'fdx:customer:profile:read',
    category: 'IDENTITY',
    riskLevel: 'HIGH',
    description: 'Shares primary account holder legal name, verified email, residential address, and tax residency status.',
    fdxMapping: 'CUSTOMER_PROFILE_FULL_READ',
  },
  {
    id: 'scope-statements',
    name: 'PDF Statements & Year-End Tax Docs',
    code: 'fdx:statements:read',
    category: 'STATEMENTS',
    riskLevel: 'HIGH',
    description: 'Permits retrieving official monthly e-statements and 1099 interest/dividend distributions.',
    fdxMapping: 'STATEMENTS_EXTENDED_READ',
  },
];

// Helper: Generates random cryptographic lower hex string
const generateHexTrace = (bytes: number): string => {
  const chars = '0123456789abcdef';
  let out = '';
  for (let i = 0; i < bytes * 2; i++) {
    out += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return out;
};

// Helper: Format USD currency
const formatUsd = (val: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    minimumFractionDigits: 2,
  }).format(val);
};

export const ChaseAggregatorConsentPortal: React.FC = () => {
  // Stepper state: 1 = Partner & Scope Configuration, 2 = Biometric & PKCE Security Gate, 3 = Confirmation & Live Audit
  const [activeStep, setActiveStep] = useState<1 | 2 | 3>(1);
  const [selectedPartnerId, setSelectedPartnerId] = useState<string>('plaid-fdx');
  const [selectedAccountIds, setSelectedAccountIds] = useState<string[]>(['chk-8891', 'crd-9904']);
  const [selectedScopeIds, setSelectedScopeIds] = useState<string[]>([
    'scope-acct-info',
    'scope-balances',
    'scope-tx-history',
    'scope-loyalty-pwp',
  ]);
  const [consentDurationMonths, setConsentDurationMonths] = useState<number>(12);
  const [allowInstantPayWithPointsEnroll, setAllowInstantPayWithPointsEnroll] = useState<boolean>(true);

  // Security & OAuth Simulation State
  const [pkceCodeChallenge, setPkceCodeChallenge] = useState<string>('');
  const [pkceCodeVerifier, setPkceCodeVerifier] = useState<string>('');
  const [authCodeGenerated, setAuthCodeGenerated] = useState<string>('');
  const [traceId, setTraceId] = useState<string>('');
  const [biometricStatus, setBiometricStatus] = useState<'IDLE' | 'SCANNING' | 'VERIFIED' | 'FAILED'>('IDLE');
  const [biometricProgress, setBiometricProgress] = useState<number>(0);
  const [hardwareKeySignature, setHardwareKeySignature] = useState<string>('');

  // Active Consents Store
  const [activeConsents, setActiveConsents] = useState<ActiveConsentRecord[]>([
    {
      consentId: 'cns_01hx98bc7291a1',
      partnerId: 'turbotax-intuit',
      partnerName: 'Intuit / TurboTax Sync',
      grantedAt: '2025-01-15T09:30:00Z',
      expiresAt: '2026-01-15T09:30:00Z',
      selectedAccountIds: ['chk-8891', 'sav-4012'],
      selectedScopeIds: ['scope-acct-info', 'scope-balances', 'scope-statements'],
      status: 'ACTIVE',
      authCode: 'jpmc_oauth2_cd_4891bca7e8',
      traceId: '8f0a21bc901e4a19b88231908234ab01',
    },
  ]);

  // Tab View for dashboard toggle
  const [portalTab, setPortalTab] = useState<'CONSENT_WIZARD' | 'ACTIVE_AUTHORIZATIONS' | 'SECURITY_DIAGNOSTICS'>(
    'CONSENT_WIZARD'
  );
  const [revocationToast, setRevocationToast] = useState<string | null>(null);

  // Selected partner object
  const currentPartner = useMemo(() => {
    return PARTNERS.find((p) => p.id === selectedPartnerId) || PARTNERS[0];
  }, [selectedPartnerId]);

  // Initialize PKCE values
  useEffect(() => {
    setPkceCodeVerifier(generateHexTrace(32));
    setPkceCodeChallenge(generateHexTrace(24) + '_SHA256');
    setTraceId(generateHexTrace(16));
  }, [selectedPartnerId]);

  // Biometric animation loop
  const handleStartBiometricVerification = () => {
    setBiometricStatus('SCANNING');
    setBiometricProgress(0);

    const interval = setInterval(() => {
      setBiometricProgress((prev) => {
        if (prev >= 100) {
          clearInterval(interval);
          setBiometricStatus('VERIFIED');
          const fakeSig = 'ECDSA_P256_SHA256_' + generateHexTrace(18).toUpperCase();
          const generatedCode = 'jpmc_auth_' + generateHexTrace(12);
          setHardwareKeySignature(fakeSig);
          setAuthCodeGenerated(generatedCode);

          // Auto complete step after 900ms
          setTimeout(() => {
            // Push into active consents
            const newRecord: ActiveConsentRecord = {
              consentId: 'cns_' + generateHexTrace(7),
              partnerId: currentPartner.id,
              partnerName: currentPartner.name,
              grantedAt: new Date().toISOString(),
              expiresAt: new Date(Date.now() + consentDurationMonths * 30 * 24 * 3600 * 1000).toISOString(),
              selectedAccountIds: [...selectedAccountIds],
              selectedScopeIds: [...selectedScopeIds],
              status: 'ACTIVE',
              authCode: generatedCode,
              traceId: traceId,
            };

            setActiveConsents((prevList) => [newRecord, ...prevList]);
            setActiveStep(3);
          }, 900);
          return 100;
        }
        return prev + 25;
      });
    }, 180);
  };

  // Toggle Account Select
  const toggleAccount = (accId: string) => {
    setSelectedAccountIds((prev) => (prev.includes(accId) ? prev.filter((id) => id !== accId) : [...prev, accId]));
  };

  // Toggle Scope Select
  const toggleScope = (scId: string) => {
    setSelectedScopeIds((prev) => (prev.includes(scId) ? prev.filter((id) => id !== scId) : [...prev, scId]));
  };

  // Revoke Consent
  const handleRevokeConsent = (consentId: string) => {
    setActiveConsents((prev) =>
      prev.map((c) => (c.consentId === consentId ? { ...c, status: 'REVOKED' as const } : c))
    );
    setRevocationToast(`Consent Token ${consentId} has been permanently invalidated across JPMC API Gateways.`);
    setTimeout(() => setRevocationToast(null), 4500);
  };

  return (
    <div className="w-full min-h-screen bg-[#071326] text-slate-100 font-sans antialiased p-4 sm:p-6 lg:p-8 selection:bg-[#117ACA] selection:text-white">
      {/* Toast Notification */}
      {revocationToast && (
        <div className="fixed top-6 right-6 z-50 max-w-md bg-rose-950/95 border border-rose-500/60 backdrop-blur-xl shadow-2xl p-4 rounded-xl flex items-start gap-3 animate-bounce">
          <div className="w-2.5 h-2.5 rounded-full bg-rose-500 mt-1.5 shrink-0 animate-ping" />
          <div className="text-sm">
            <p className="font-semibold text-rose-200">OAuth Grant Revocation Complete</p>
            <p className="text-xs text-rose-300 mt-0.5">{revocationToast}</p>
          </div>
        </div>
      )}

      {/* Main Header / JPMC Brand Banner */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#00205B] via-[#0A2540] to-[#041122] border border-blue-900/40 rounded-2xl p-6 lg:p-8 shadow-2xl shadow-blue-950/40 relative overflow-hidden">
          {/* Subtle Octagon Watermark */}
          <div className="absolute -right-12 -bottom-16 w-80 h-80 border-8 border-blue-500/10 rounded-3xl transform rotate-45 pointer-events-none" />
          <div className="absolute right-32 top-4 w-40 h-40 border-4 border-blue-400/5 rounded-full pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <div className="w-9 h-9 bg-gradient-to-br from-[#117ACA] to-[#00205B] rounded-lg border border-blue-400/40 flex items-center justify-center font-black tracking-widest text-white shadow-md shadow-blue-500/30">
                  <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
                    <path d="M12 2L2 7v10l10 5 10-5V7L12 2zm0 2.2l7.5 3.75v7.5L12 19.2 4.5 15.45v-7.5L12 4.2z" />
                  </svg>
                </div>
                <span className="text-xs tracking-[0.25em] uppercase font-bold text-blue-300 bg-blue-950/80 px-2.5 py-1 rounded border border-blue-800/60">
                  JPMorgan Chase & Co. Open Banking Core
                </span>
                <span className="text-[11px] font-mono bg-emerald-950/70 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-700/50 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                  FDX 5.3 MTLS ENFORCED
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold tracking-tight text-white">
                Chase Direct Access & Consent Management Portal
              </h1>
              <p className="text-sm sm:text-base text-slate-300 max-w-3xl mt-2 leading-relaxed">
                Empowering cardholders and wealth clients with cryptographically signed, zero-password granular data
                delegation for authorized financial partners & Pay with Points programs.
              </p>
            </div>

            {/* Quick Metrics Badge */}
            <div className="flex flex-row md:flex-col items-center md:items-end gap-3 shrink-0 bg-slate-900/60 p-4 rounded-xl border border-blue-800/30">
              <div className="text-left md:text-right">
                <span className="text-xs text-slate-400 uppercase tracking-wider block font-semibold">
                  Cardholder Tier
                </span>
                <span className="text-sm font-bold text-amber-300 flex items-center md:justify-end gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400" />
                  Chase Private Client® & Sapphire Reserve
                </span>
              </div>
              <div className="text-left md:text-right border-l md:border-l-0 md:border-t border-slate-700/60 pl-3 md:pl-0 md:pt-2">
                <span className="text-xs text-slate-400 block font-mono">Trace ID: {traceId.slice(0, 12)}...</span>
              </div>
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="mt-8 pt-4 border-t border-blue-900/40 flex flex-wrap gap-2">
            <button
              onClick={() => setPortalTab('CONSENT_WIZARD')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                portalTab === 'CONSENT_WIZARD'
                  ? 'bg-[#117ACA] text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 4v16m8-8H4" />
              </svg>
              Authorize New Partner (OAuth 2.0 PKCE)
            </button>
            <button
              onClick={() => setPortalTab('ACTIVE_AUTHORIZATIONS')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                portalTab === 'ACTIVE_AUTHORIZATIONS'
                  ? 'bg-[#117ACA] text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z"
                />
              </svg>
              Active Grants & Live Revocation Engine ({activeConsents.filter((c) => c.status === 'ACTIVE').length})
            </button>
            <button
              onClick={() => setPortalTab('SECURITY_DIAGNOSTICS')}
              className={`px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all flex items-center gap-2 ${
                portalTab === 'SECURITY_DIAGNOSTICS'
                  ? 'bg-[#117ACA] text-white shadow-lg shadow-blue-600/30'
                  : 'bg-slate-800/60 text-slate-300 hover:bg-slate-800 hover:text-white'
              }`}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                />
              </svg>
              FDX Payload & Security Telemetry
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-7xl mx-auto">
        {/* ========================================================================= */}
        {/* TAB 1: 3-STEP CONSENT AUTHORIZATION WIZARD */}
        {/* ========================================================================= */}
        {portalTab === 'CONSENT_WIZARD' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Interactive Wizard / Configuration (8 cols) */}
            <div className="lg:col-span-8 space-y-6">
              {/* Stepper Progress Indicator */}
              <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
                {[
                  { step: 1, label: 'Scopes & Accounts' },
                  { step: 2, label: 'Biometric Gate' },
                  { step: 3, label: 'OAuth Token Handshake' },
                ].map((s, idx) => (
                  <div key={s.step} className="flex items-center gap-3">
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs transition-colors ${
                        activeStep === s.step
                          ? 'bg-[#117ACA] text-white ring-4 ring-blue-500/20'
                          : activeStep > s.step
                          ? 'bg-emerald-600 text-white'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {activeStep > s.step ? '✓' : s.step}
                    </div>
                    <span
                      className={`text-xs sm:text-sm font-semibold hidden sm:inline ${
                        activeStep === s.step ? 'text-white' : 'text-slate-400'
                      }`}
                    >
                      {s.label}
                    </span>
                    {idx < 2 && <div className="w-8 sm:w-16 h-[2px] bg-slate-800 ml-2" />}
                  </div>
                ))}
              </div>

              {/* STEP 1: PARTNER SELECTION & GRANULAR SCOPES */}
              {activeStep === 1 && (
                <div className="space-y-6 animate-fadeIn">
                  {/* Partner Picker Section */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#117ACA]" />
                          1. Select Verified Fintech Aggregator
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          Only verified third parties with bilateral Chase FDX Core APIs are displayed.
                        </p>
                      </div>
                      <span className="text-xs font-mono text-blue-400 bg-blue-950/60 px-2.5 py-1 rounded border border-blue-900">
                        2-Legged & 3-Legged OAuth Supported
                      </span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      {PARTNERS.map((partner) => (
                        <div
                          key={partner.id}
                          onClick={() => setSelectedPartnerId(partner.id)}
                          className={`p-4 rounded-xl border cursor-pointer transition-all ${
                            selectedPartnerId === partner.id
                              ? 'bg-blue-950/40 border-blue-500 ring-2 ring-blue-500/30 shadow-lg'
                              : 'bg-slate-800/40 border-slate-700/50 hover:bg-slate-800 hover:border-slate-600'
                          }`}
                        >
                          <div className="flex items-start gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg bg-gradient-to-br ${partner.logoBg} flex items-center justify-center font-bold text-white text-sm shadow-md shrink-0`}
                            >
                              {partner.logoBadge}
                            </div>
                            <div className="flex-1 min-w-0">
                              <div className="flex items-center justify-between">
                                <h3 className="font-bold text-white text-sm truncate">{partner.name}</h3>
                                {selectedPartnerId === partner.id && (
                                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                                )}
                              </div>
                              <p className="text-[11px] text-slate-400 truncate">{partner.legalEntity}</p>
                              <div className="mt-2 flex items-center gap-2">
                                <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-900 text-blue-300 border border-slate-700">
                                  {partner.securityRating}
                                </span>
                                <span className="text-[10px] text-slate-400 font-medium">
                                  {partner.activeUsersCount}
                                </span>
                              </div>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Account Permission Select */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#117ACA]" />
                          2. Authorize Eligible Chase Accounts
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          You control which accounts are exposed. Credentials (password/PIN) are never shared.
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          if (selectedAccountIds.length === CHASE_ACCOUNTS.length) {
                            setSelectedAccountIds([]);
                          } else {
                            setSelectedAccountIds(CHASE_ACCOUNTS.map((a) => a.id));
                          }
                        }}
                        className="text-xs text-blue-400 hover:text-blue-300 font-semibold"
                      >
                        {selectedAccountIds.length === CHASE_ACCOUNTS.length ? 'Deselect All' : 'Select All Accounts'}
                      </button>
                    </div>

                    <div className="space-y-2.5">
                      {CHASE_ACCOUNTS.map((acc) => {
                        const isSelected = selectedAccountIds.includes(acc.id);
                        return (
                          <div
                            key={acc.id}
                            onClick={() => toggleAccount(acc.id)}
                            className={`p-3.5 rounded-xl border flex items-center justify-between cursor-pointer transition-all ${
                              isSelected
                                ? 'bg-blue-950/30 border-blue-600/70 shadow-sm'
                                : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/60'
                            }`}
                          >
                            <div className="flex items-center gap-3.5">
                              <div
                                className={`w-5 h-5 rounded flex items-center justify-center border transition-all ${
                                  isSelected ? 'bg-[#117ACA] border-blue-400 text-white' : 'border-slate-600 bg-slate-800'
                                }`}
                              >
                                {isSelected && <span className="text-xs font-bold">✓</span>}
                              </div>
                              <div>
                                <div className="flex items-center gap-2">
                                  <span className="text-sm font-bold text-white">{acc.accountTitle}</span>
                                  <span className="text-xs font-mono text-slate-400">{acc.accountNumberMasked}</span>
                                  {acc.isEligiblePayWithPoints && (
                                    <span className="text-[10px] bg-amber-950/80 text-amber-300 border border-amber-800/60 px-2 py-0.2 rounded font-bold">
                                      Pay With Points Active
                                    </span>
                                  )}
                                </div>
                                <div className="flex items-center gap-3 text-xs text-slate-400 mt-0.5">
                                  <span>Ledger Balance: {formatUsd(acc.balance)}</span>
                                  {acc.pointsBalance && (
                                    <span className="text-amber-400 font-mono font-medium">
                                      ★ {acc.pointsBalance.toLocaleString()} Ultimate Rewards®
                                    </span>
                                  )}
                                </div>
                              </div>
                            </div>
                            <span className="text-xs font-mono font-semibold text-slate-400 bg-slate-900 px-2 py-1 rounded">
                              {acc.productType}
                            </span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  {/* Granular Permission Scopes */}
                  <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h2 className="text-lg font-bold text-white flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#117ACA]" />
                          3. Granular Data Permissions & Scopes
                        </h2>
                        <p className="text-xs text-slate-400 mt-1">
                          FDX 5.3 standardized scopes enforced with zero-trust tokenization.
                        </p>
                      </div>
                      <span className="text-xs text-slate-400 font-mono">
                        {selectedScopeIds.length} of {PERMISSION_SCOPES.length} Granted
                      </span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {PERMISSION_SCOPES.map((scope) => {
                        const isGranted = selectedScopeIds.includes(scope.id);
                        return (
                          <div
                            key={scope.id}
                            onClick={() => toggleScope(scope.id)}
                            className={`p-3.5 rounded-xl border flex flex-col justify-between cursor-pointer transition-all ${
                              isGranted
                                ? 'bg-blue-950/30 border-blue-600/70'
                                : 'bg-slate-800/30 border-slate-800 hover:bg-slate-800/60 opacity-60'
                            }`}
                          >
                            <div>
                              <div className="flex items-center justify-between gap-2 mb-1.5">
                                <div className="flex items-center gap-2">
                                  <div
                                    className={`w-4 h-4 rounded flex items-center justify-center border text-[10px] ${
                                      isGranted ? 'bg-[#117ACA] border-blue-400 text-white' : 'border-slate-600'
                                    }`}
                                  >
                                    {isGranted && '✓'}
                                  </div>
                                  <span className="text-xs font-bold text-slate-100">{scope.name}</span>
                                </div>
                                <span
                                  className={`text-[9px] font-mono uppercase px-1.5 py-0.5 rounded font-bold ${
                                    scope.riskLevel === 'HIGH'
                                      ? 'bg-rose-950 text-rose-300 border border-rose-800'
                                      : scope.riskLevel === 'MEDIUM'
                                      ? 'bg-amber-950 text-amber-300 border border-amber-800'
                                      : 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                                  }`}
                                >
                                  {scope.riskLevel} SENSITIVITY
                                </span>
                              </div>
                              <p className="text-[11px] text-slate-400 leading-relaxed pl-6">{scope.description}</p>
                            </div>
                            <div className="mt-2 pl-6 flex items-center justify-between text-[10px] font-mono text-blue-400/80">
                              <span>Scope: {scope.code}</span>
                            </div>
                          </div>
                        );
                      })}
                    </div>

                    {/* Pay with Points Fast-Enroll Switch */}
                    <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-slate-900 to-slate-900 border border-amber-800/40 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-9 h-9 rounded-lg bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-300 font-bold">
                          ★
                        </div>
                        <div>
                          <p className="text-xs font-bold text-amber-200">
                            Auto-Enroll into Chase Pay with Points (CLPWPE)
                          </p>
                          <p className="text-[11px] text-slate-400">
                            Calls <code className="text-amber-300">/merchants/programs/pay-with-points/enrollments</code> with UUID
                            tokenization.
                          </p>
                        </div>
                      </div>
                      <input
                        type="checkbox"
                        checked={allowInstantPayWithPointsEnroll}
                        onChange={(e) => setAllowInstantPayWithPointsEnroll(e.target.checked)}
                        className="w-5 h-5 accent-[#117ACA] rounded cursor-pointer"
                      />
                    </div>

                    {/* Consent Duration Selection */}
                    <div className="mt-4 flex flex-wrap items-center justify-between gap-4 p-3.5 bg-slate-950 rounded-xl border border-slate-800 text-xs">
                      <span className="text-slate-300 font-semibold">Consent Expiration Window:</span>
                      <div className="flex gap-2">
                        {[3, 6, 12, 24].map((mo) => (
                          <button
                            key={mo}
                            onClick={() => setConsentDurationMonths(mo)}
                            className={`px-3 py-1.5 rounded-lg font-mono font-bold transition-all ${
                              consentDurationMonths === mo
                                ? 'bg-[#117ACA] text-white shadow'
                                : 'bg-slate-800 text-slate-400 hover:text-slate-200'
                            }`}
                          >
                            {mo} Months
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Proceed to Step 2 Button */}
                  <div className="flex justify-end">
                    <button
                      disabled={selectedAccountIds.length === 0 || selectedScopeIds.length === 0}
                      onClick={() => setActiveStep(2)}
                      className={`px-8 py-3.5 rounded-xl font-bold text-sm transition-all flex items-center gap-2 shadow-xl ${
                        selectedAccountIds.length > 0 && selectedScopeIds.length > 0
                          ? 'bg-[#117ACA] hover:bg-blue-600 text-white shadow-blue-700/30'
                          : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      }`}
                    >
                      <span>Proceed to Biometric Authorization Gate</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 2: BIOMETRIC VERIFICATION & FIDO2 SIGNING GATE */}
              {activeStep === 2 && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-8 shadow-2xl space-y-6 text-center animate-fadeIn">
                  <div className="max-w-md mx-auto">
                    <div className="w-16 h-16 mx-auto bg-gradient-to-tr from-[#117ACA] to-cyan-400 rounded-2xl p-0.5 shadow-lg shadow-blue-500/30 mb-4 flex items-center justify-center">
                      <div className="w-full h-full bg-slate-950 rounded-[14px] flex items-center justify-center">
                        <svg className="w-8 h-8 text-blue-400 animate-pulse" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.5"
                            d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A13.916 13.916 0 008 11a4 4 0 118 0c0 1.017-.07 2.019-.203 3m-2.118 6.844A21.88 21.88 0 0015.171 17m3.839 1.132c.645-2.266.99-4.659.99-7.132A8 8 0 004 11m0 0c0 2.473.345 4.866.99 7.132M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                          />
                        </svg>
                      </div>
                    </div>

                    <h2 className="text-xl font-bold text-white">Chase Biometric & Secure Key Verification</h2>
                    <p className="text-xs text-slate-400 mt-2">
                      Please verify your identity using Touch ID, Face ID, or your physical FIDO2 security token to authorize
                      access for <strong className="text-blue-300">{currentPartner.name}</strong>.
                    </p>

                    {/* Biometric Progress Box */}
                    <div className="my-6 p-6 rounded-2xl bg-slate-950 border border-slate-800 relative overflow-hidden">
                      <div className="flex flex-col items-center justify-center gap-3">
                        <div className="relative w-20 h-20 flex items-center justify-center">
                          <div
                            className={`absolute inset-0 rounded-full border-2 border-dashed ${
                              biometricStatus === 'SCANNING'
                                ? 'border-blue-400 animate-spin'
                                : biometricStatus === 'VERIFIED'
                                ? 'border-emerald-400'
                                : 'border-slate-700'
                            }`}
                          />
                          <div className="text-2xl">
                            {biometricStatus === 'VERIFIED' ? '🛡️' : biometricStatus === 'SCANNING' ? '⚡' : '🔒'}
                          </div>
                        </div>

                        <div className="text-center">
                          <span className="text-xs font-mono uppercase tracking-wider block font-bold text-slate-300">
                            {biometricStatus === 'IDLE' && 'Awaiting Client Sensor'}
                            {biometricStatus === 'SCANNING' && 'Verifying ECDSA Signature...'}
                            {biometricStatus === 'VERIFIED' && 'Identity Confirmed • Hardware Attested'}
                          </span>
                          <span className="text-[11px] font-mono text-slate-500 block mt-1">
                            Trace: {traceId}
                          </span>
                        </div>

                        {/* Progress Bar */}
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden mt-2">
                          <div
                            className="bg-gradient-to-r from-blue-500 to-emerald-400 h-full transition-all duration-300"
                            style={{ width: `${biometricProgress}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    {/* Biometric Action Buttons */}
                    <div className="flex flex-col gap-2.5">
                      {biometricStatus === 'IDLE' && (
                        <button
                          onClick={handleStartBiometricVerification}
                          className="w-full py-3.5 rounded-xl bg-gradient-to-r from-[#117ACA] to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold text-sm shadow-xl shadow-blue-700/30 flex items-center justify-center gap-2"
                        >
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="2"
                              d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                            />
                          </svg>
                          Authorize with Face ID / Touch ID / WebAuthn
                        </button>
                      )}

                      <button
                        onClick={() => setActiveStep(1)}
                        className="text-xs text-slate-400 hover:text-slate-200 py-2 font-medium"
                      >
                        ← Back to Scope & Account Selection
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* STEP 3: CONFIRMATION & LIVE TOKEN DETAILS */}
              {activeStep === 3 && (
                <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 sm:p-8 shadow-2xl space-y-6 animate-fadeIn">
                  <div className="flex items-center gap-4 border-b border-slate-800 pb-6">
                    <div className="w-12 h-12 rounded-xl bg-emerald-500/20 border border-emerald-500/40 flex items-center justify-center text-emerald-400 font-bold text-xl">
                      ✓
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">OAuth 2.0 PKCE Handshake Completed</h2>
                      <p className="text-xs text-slate-400 mt-1">
                        Tokenized authorization grant has been issued to <strong className="text-white">{currentPartner.name}</strong>.
                      </p>
                    </div>
                  </div>

                  {/* Token Details Panel */}
                  <div className="space-y-3 font-mono text-xs">
                    <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>ISSUED_AUTH_CODE:</span>
                        <span className="text-emerald-400 font-bold">{authCodeGenerated}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>REDIRECT_URI:</span>
                        <span className="text-blue-300 truncate max-w-xs">{currentPartner.callbackUri}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>FDX_SECURITY_SIGNATURE:</span>
                        <span className="text-purple-300 truncate max-w-xs">{hardwareKeySignature}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>CHASE_TRACE_ID:</span>
                        <span className="text-slate-200">{traceId}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>EXPIRES_AT:</span>
                        <span className="text-amber-300">
                          {new Date(Date.now() + consentDurationMonths * 30 * 24 * 3600 * 1000).toUTCString()}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Action row */}
                  <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
                    <button
                      onClick={() => {
                        setActiveStep(1);
                        setBiometricStatus('IDLE');
                      }}
                      className="px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold transition-all"
                    >
                      Authorize Another Integration
                    </button>
                    <button
                      onClick={() => setPortalTab('ACTIVE_AUTHORIZATIONS')}
                      className="px-6 py-2.5 rounded-xl bg-[#117ACA] hover:bg-blue-600 text-white text-xs font-bold shadow-lg shadow-blue-600/30 transition-all"
                    >
                      View in Active Consents Dashboard →
                    </button>
                  </div>
                </div>
              )}
            </div>

            {/* Right Column: Live Scope Manifest & Security Spec (4 cols) */}
            <div className="lg:col-span-4 space-y-6">
              {/* Partner Profile Summary Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-3 mb-4">
                  <div
                    className={`w-10 h-10 rounded-lg bg-gradient-to-br ${currentPartner.logoBg} flex items-center justify-center font-bold text-white text-sm shrink-0`}
                  >
                    {currentPartner.logoBadge}
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">{currentPartner.name}</h3>
                    <span className="text-[11px] text-emerald-400 flex items-center gap-1 font-mono font-medium">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      {currentPartner.securityRating}
                    </span>
                  </div>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-4">{currentPartner.description}</p>

                <div className="space-y-2 border-t border-slate-800 pt-4 text-xs font-mono">
                  <div className="flex justify-between text-slate-400">
                    <span>Legal Entity:</span>
                    <span className="text-slate-200 font-sans text-right text-[11px] max-w-[160px] truncate">
                      {currentPartner.legalEntity}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>FDX Partner ID:</span>
                    <span className="text-blue-300">{currentPartner.id}</span>
                  </div>
                  <div className="flex justify-between text-slate-400">
                    <span>Protocol:</span>
                    <span className="text-emerald-300">FDX 5.3 REST + TLS 1.3</span>
                  </div>
                </div>
              </div>

              {/* Dynamic Consent Summary Badge */}
              <div className="bg-gradient-to-b from-blue-950/40 to-slate-900 border border-blue-900/50 rounded-2xl p-6 shadow-xl">
                <h3 className="text-xs font-bold uppercase tracking-wider text-blue-300 mb-3 flex items-center gap-2">
                  <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"
                    />
                  </svg>
                  Grant Summary Manifest
                </h3>

                <div className="space-y-3 text-xs">
                  <div>
                    <span className="text-slate-400 block text-[11px]">Selected Accounts ({selectedAccountIds.length}):</span>
                    <div className="mt-1 space-y-1">
                      {selectedAccountIds.map((accId) => {
                        const a = CHASE_ACCOUNTS.find((x) => x.id === accId);
                        return (
                          <div key={accId} className="flex justify-between text-slate-200 bg-slate-950/60 px-2 py-1 rounded">
                            <span className="truncate max-w-[150px]">{a?.accountTitle}</span>
                            <span className="font-mono text-blue-300">{a?.accountNumberMasked}</span>
                          </div>
                        );
                      })}
                    </div>
                  </div>

                  <div>
                    <span className="text-slate-400 block text-[11px]">Approved Scopes ({selectedScopeIds.length}):</span>
                    <div className="flex flex-wrap gap-1 mt-1">
                      {selectedScopeIds.map((scId) => (
                        <span key={scId} className="text-[10px] font-mono bg-blue-900/40 text-blue-200 px-2 py-0.5 rounded border border-blue-800/40">
                          {scId.replace('scope-', '')}
                        </span>
                      ))}
                    </div>
                  </div>

                  <div className="pt-2 border-t border-blue-900/40 flex justify-between items-center text-[11px] text-slate-400">
                    <span>Pay with Points Hook:</span>
                    <span className={`font-bold ${allowInstantPayWithPointsEnroll ? 'text-emerald-400' : 'text-slate-500'}`}>
                      {allowInstantPayWithPointsEnroll ? 'ENABLED (CLPWPE)' : 'DISABLED'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: ACTIVE AUTHORIZATIONS & KILL SWITCH ENGINE */}
        {/* ========================================================================= */}
        {portalTab === 'ACTIVE_AUTHORIZATIONS' && (
          <div className="space-y-6 animate-fadeIn">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                  Active Third-Party Authorizations & Tokens
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  You hold full unilateral control to terminate data sharing tokens at any time under Chase Open Banking Policy.
                </p>
              </div>
              <div className="flex items-center gap-3">
                <span className="text-xs text-slate-400 font-mono">
                  Active Grants: {activeConsents.filter((c) => c.status === 'ACTIVE').length}
                </span>
              </div>
            </div>

            {/* Active Consents List */}
            <div className="grid grid-cols-1 gap-4">
              {activeConsents.map((consent) => {
                const partnerMeta = PARTNERS.find((p) => p.id === consent.partnerId) || PARTNERS[0];
                const isRevoked = consent.status === 'REVOKED';

                return (
                  <div
                    key={consent.consentId}
                    className={`rounded-2xl border p-6 transition-all ${
                      isRevoked
                        ? 'bg-slate-950/60 border-slate-800/80 opacity-60'
                        : 'bg-slate-900/90 border-slate-800 shadow-xl'
                    }`}
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${partnerMeta.logoBg} flex items-center justify-center font-bold text-white text-base shadow-md shrink-0`}
                        >
                          {partnerMeta.logoBadge}
                        </div>
                        <div>
                          <div className="flex items-center gap-3">
                            <h3 className="font-bold text-white text-base">{consent.partnerName}</h3>
                            <span
                              className={`text-[10px] font-mono uppercase px-2 py-0.5 rounded-full font-bold border ${
                                isRevoked
                                  ? 'bg-rose-950 text-rose-300 border-rose-800'
                                  : 'bg-emerald-950 text-emerald-300 border-emerald-800'
                              }`}
                            >
                              {consent.status}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{partnerMeta.legalEntity}</p>
                          <div className="mt-3 flex flex-wrap gap-4 text-xs font-mono text-slate-400">
                            <span>
                              Granted: <strong className="text-slate-200">{new Date(consent.grantedAt).toLocaleDateString()}</strong>
                            </span>
                            <span>
                              Expires: <strong className="text-amber-300">{new Date(consent.expiresAt).toLocaleDateString()}</strong>
                            </span>
                            <span>
                              Consent ID: <strong className="text-blue-300">{consent.consentId}</strong>
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Right Action & Accounts */}
                      <div className="flex flex-col sm:flex-row lg:flex-col items-start lg:items-end justify-between gap-3">
                        <div className="text-left lg:text-right">
                          <span className="text-[11px] text-slate-400 block">
                            Shared Accounts ({consent.selectedAccountIds.length}):
                          </span>
                          <div className="flex flex-wrap gap-1 mt-1 justify-start lg:justify-end">
                            {consent.selectedAccountIds.map((accId) => (
                              <span key={accId} className="text-[10px] font-mono bg-slate-950 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                                {accId}
                              </span>
                            ))}
                          </div>
                        </div>

                        {!isRevoked ? (
                          <button
                            onClick={() => handleRevokeConsent(consent.consentId)}
                            className="px-4 py-2 rounded-lg bg-rose-950/80 hover:bg-rose-900 border border-rose-700/60 text-rose-200 text-xs font-bold transition-all flex items-center gap-1.5 shadow-md shadow-rose-950/50"
                          >
                            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="2"
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                            Revoke All Access Now
                          </button>
                        ) : (
                          <span className="text-xs font-mono text-rose-400 font-bold">
                            Grant Revoked & Purged from Gateway
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FDX PAYLOAD & SECURITY TELEMETRY INSPECTOR */}
        {/* ========================================================================= */}
        {portalTab === 'SECURITY_DIAGNOSTICS' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 animate-fadeIn">
            {/* Left: Interactive API Schema JSON */}
            <div className="lg:col-span-7 bg-slate-950 border border-slate-800 rounded-2xl p-6 font-mono text-xs shadow-2xl">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                <span className="text-slate-300 font-bold flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-[#117ACA]" />
                  OAuth 2.0 PKCE / FDX 5.3 Real-Time Token Contract
                </span>
                <span className="text-[10px] text-emerald-400 bg-emerald-950 px-2 py-0.5 rounded border border-emerald-800">
                  HTTP 200 OK
                </span>
              </div>

              <pre className="text-slate-300 overflow-x-auto p-4 bg-slate-900/60 rounded-xl border border-slate-800/80 leading-relaxed">
{JSON.stringify(
  {
    issuer: 'https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1',
    token_type: 'Bearer',
    trace_id: traceId,
    client_id: currentPartner.id,
    scope: selectedScopeIds.map((s) => s.replace('scope-', '')).join(' '),
    grant_type: 'authorization_code',
    code_challenge: pkceCodeChallenge,
    code_challenge_method: 'S256',
    accounts_delegated: selectedAccountIds.map((id) => ({
      account_uuid: id,
      type: CHASE_ACCOUNTS.find((a) => a.id === id)?.productType,
      pay_with_points_eligible: CHASE_ACCOUNTS.find((a) => a.id === id)?.isEligiblePayWithPoints,
    })),
    security_attestation: {
      fido2_signature: hardwareKeySignature || 'AWAITING_BIOMETRIC_TRIGGER',
      mtls_tls_version: 'TLS_1_3_X25519',
      fdx_version: '5.3.1-GA',
      iso_27001_compliant: true,
    },
  },
  null,
  2
)}
              </pre>
            </div>

            {/* Right: Security Safeguards & Regulatory Posture */}
            <div className="lg:col-span-5 space-y-4">
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="text-sm font-bold text-white mb-3">Chase Open Banking Protections</h3>
                <ul className="space-y-3 text-xs text-slate-300">
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>
                      <strong>Zero Password Sharing:</strong> FinTech partners never see or store your chase.com credentials.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>
                      <strong>Tokenized Account Numbers:</strong> Virtual surrogate tokens prevent raw routing/account disclosure.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>
                      <strong>Instant Revocation:</strong> Revoking instantly invalidates refresh tokens and downstream webhooks.
                    </span>
                  </li>
                  <li className="flex items-start gap-2.5">
                    <span className="text-emerald-400 font-bold shrink-0">✓</span>
                    <span>
                      <strong>CLPWPE Integration:</strong> Securely synchronizes Ultimate Rewards points without exposing account balances.
                    </span>
                  </li>
                </ul>
              </div>

              <div className="bg-blue-950/40 border border-blue-900/50 rounded-2xl p-6">
                <h4 className="text-xs font-bold text-blue-300 uppercase tracking-wider mb-2">
                  FDX Standards Compliance
                </h4>
                <p className="text-[11px] text-slate-300 leading-relaxed">
                  Chase is a founding member of the Financial Data Exchange (FDX). All endpoints conform to the FDX 5.3
                  specification, CFPB 1033 Open Banking rulemaking, and FIDO Alliance Level 2 cryptographic authenticator
                  benchmarks.
                </p>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <span>© {new Date().getFullYear()} JPMorgan Chase & Co. All rights reserved.</span>
          <span>•</span>
          <span className="text-slate-400">Member FDIC. Equal Housing Opportunity.</span>
        </div>
        <div className="flex items-center gap-4 text-[11px] font-mono">
          <span className="text-blue-400">CLPWPE v1.0.0</span>
          <span>•</span>
          <span>API Store: api.chase.com</span>
        </div>
      </footer>
    </div>
  );
};

export default ChaseAggregatorConsentPortal;