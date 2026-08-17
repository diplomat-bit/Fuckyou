import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  ShieldCheck,
  Crown,
  CreditCard,
  TrendingUp,
  RefreshCw,
  Sparkles,
  Plane,
  Anchor,
  FileSpreadsheet,
  CheckCircle2,
  AlertCircle,
  ExternalLink,
  ChevronRight,
  Zap,
  DollarSign,
  Lock,
  Compass,
  Building2,
  Coins,
  Receipt,
  Layers,
  ArrowRightLeft,
  Clock,
  Briefcase
} from 'lucide-react';

// --- CHASE SWAGGER / API CONTRACT TYPES ---

export type MerchantDefinedProductCode =
  | 'SAPPHIRE_RESERVE'
  | 'JPM_RESERVE'
  | 'SAPPHIRE_PREFERRED'
  | 'SAPPHIRE_NO_FEE'
  | 'INK_BUSINESS_PREFERRED'
  | 'INK_PLUS'
  | 'INK_BUSINESS_CASH'
  | 'INK_CASH'
  | 'INK_BUSINESS_UNLIMITED'
  | 'FREEDOM_UNLIMITED'
  | 'FREEDOM'
  | 'FREEDOM_STUDENT'
  | 'SLATE';

export type EnrollmentStatusName =
  | 'AUTOENROLLED'
  | 'ENROLLED'
  | 'UN-ENROLLED'
  | 'OPTED_OUT'
  | 'OPTED_IN'
  | 'NOT_ENROLLED';

export interface ApiEnrollment {
  enrollmentStatusName: EnrollmentStatusName;
  enrollmentStatusDate: string;
}

export interface ApiTransaction {
  merchantDefinedProductCode: MerchantDefinedProductCode;
}

export interface EnrollmentResponse {
  enrollment: ApiEnrollment;
  product: ApiTransaction;
}

export interface ApiError {
  errorDescription: string;
  serviceErrorCode?: string;
  externalErrorCode?: string;
}

export interface TaxLotRecord {
  lotId: string;
  acquiredDate: string;
  sourceDescription: string;
  cardProduct: MerchantDefinedProductCode;
  pointsAmount: number;
  costBasisPerPoint: number;
  is1099Taxable: boolean;
  settlementStatus: 'SETTLED' | 'PENDING_AUDIT' | 'RECONCILED';
}

export interface WealthCardAccount {
  id: string;
  accountReferenceUuid: string;
  externalAccountIdentifier: string;
  cardTitle: string;
  cardType: MerchantDefinedProductCode;
  cardholderName: string;
  lastFour: string;
  expirationDate: string;
  status: EnrollmentStatusName;
  statusModifiedDate: string;
  metalComposition: string;
  creditLimit: number;
  availableCredit: number;
  currentCycleSpend: number;
  pointsBalance: number;
  multiplierBase: number;
  travelPortalMultiplier: number;
  privateAviationMultiplier: number;
  conciergeAssigned: string;
  isPalladiumTier: boolean;
}

// --- INITIAL WEALTH DATA MOCKS ---

const INITIAL_CARDS: WealthCardAccount[] = [
  {
    id: 'jpm-res-001',
    accountReferenceUuid: 'e7b99c48-8314-4a27-a068-081cf80e32b1',
    externalAccountIdentifier: 'JPM-PWM-NY-8829104',
    cardTitle: 'J.P. Morgan Reserve Card',
    cardType: 'JPM_RESERVE',
    cardholderName: 'ALEXANDER V. MONTGOMERY',
    lastFour: '0019',
    expirationDate: '12/28',
    status: 'AUTOENROLLED',
    statusModifiedDate: '2025-01-15',
    metalComposition: 'Solid Palladium & Brass Inlay (27g)',
    creditLimit: 250000,
    availableCredit: 231450,
    currentCycleSpend: 18550,
    pointsBalance: 8420500,
    multiplierBase: 1.0,
    travelPortalMultiplier: 1.5,
    privateAviationMultiplier: 2.2,
    conciergeAssigned: 'Morgan Private Client Desk - Geneva / NY',
    isPalladiumTier: true
  },
  {
    id: 'csr-002',
    accountReferenceUuid: '9b1d8f76-c42e-4e89-bd11-66778899aabb',
    externalAccountIdentifier: 'CHS-PWM-US-9912041',
    cardTitle: 'Chase Sapphire Reserve® Private Client',
    cardType: 'SAPPHIRE_RESERVE',
    cardholderName: 'ALEXANDER V. MONTGOMERY',
    lastFour: '8842',
    expirationDate: '09/27',
    status: 'ENROLLED',
    statusModifiedDate: '2025-02-01',
    metalComposition: 'Hardened Tungsten Core (13g)',
    creditLimit: 120000,
    availableCredit: 114200,
    currentCycleSpend: 5800,
    pointsBalance: 4215000,
    multiplierBase: 1.0,
    travelPortalMultiplier: 1.5,
    privateAviationMultiplier: 1.85,
    conciergeAssigned: 'Sapphire Bespoke Concierge HQ',
    isPalladiumTier: false
  },
  {
    id: 'ink-003',
    accountReferenceUuid: '3f847291-76aa-4d15-9988-bbccddeeff00',
    externalAccountIdentifier: 'CHS-CORP-LP-4410982',
    cardTitle: 'Ink Business Preferred® Private Holdings',
    cardType: 'INK_BUSINESS_PREFERRED',
    cardholderName: 'MONTGOMERY HOLDINGS LLC',
    lastFour: '4091',
    expirationDate: '04/29',
    status: 'ENROLLED',
    statusModifiedDate: '2025-01-20',
    metalComposition: 'Stainless Steel Hybrid',
    creditLimit: 500000,
    availableCredit: 472100,
    currentCycleSpend: 27900,
    pointsBalance: 2214700,
    multiplierBase: 1.0,
    travelPortalMultiplier: 1.25,
    privateAviationMultiplier: 1.6,
    conciergeAssigned: 'Commercial Private Escrow Desk',
    isPalladiumTier: false
  }
];

const TAX_LOTS: TaxLotRecord[] = [
  {
    lotId: 'LOT-2025-04A',
    acquiredDate: '2025-02-14',
    sourceDescription: 'Q1 Global Syndicate Advisory Cardspend Rebate',
    cardProduct: 'JPM_RESERVE',
    pointsAmount: 1850000,
    costBasisPerPoint: 0.00,
    is1099Taxable: false,
    settlementStatus: 'SETTLED'
  },
  {
    lotId: 'LOT-2025-02K',
    acquiredDate: '2025-01-10',
    sourceDescription: 'Annual Private Wealth Asset Tier Bonus Award',
    cardProduct: 'JPM_RESERVE',
    pointsAmount: 1000000,
    costBasisPerPoint: 0.01,
    is1099Taxable: true,
    settlementStatus: 'RECONCILED'
  },
  {
    lotId: 'LOT-2024-12P',
    acquiredDate: '2024-12-28',
    sourceDescription: 'NetJets Co-Charter Commercial Spend Multiplier',
    cardProduct: 'SAPPHIRE_RESERVE',
    pointsAmount: 2450000,
    costBasisPerPoint: 0.00,
    is1099Taxable: false,
    settlementStatus: 'SETTLED'
  },
  {
    lotId: 'LOT-2024-11M',
    acquiredDate: '2024-11-19',
    sourceDescription: 'Treasury Settlement Escrow Purchase Volume',
    cardProduct: 'INK_BUSINESS_PREFERRED',
    pointsAmount: 1550200,
    costBasisPerPoint: 0.00,
    is1099Taxable: false,
    settlementStatus: 'SETTLED'
  }
];

export const ChasePrivateWealthPointsVault: React.FC = () => {
  // --- STATE ---
  const [cards, setCards] = useState<WealthCardAccount[]>(INITIAL_CARDS);
  const [selectedCardId, setSelectedCardId] = useState<string>('jpm-res-001');
  const [activeTab, setActiveTab] = useState<'vault' | 'taxlots' | 'concierge' | 'pwp-api' | 'transfers'>('vault');
  
  // API Simulator State
  const [apiIsSubmitting, setApiIsSubmitting] = useState<boolean>(false);
  const [apiChannelType, setApiChannelType] = useState<string>('WEB_PRIVATE_VAULT');
  const [apiTargetAction, setApiTargetAction] = useState<'ENROLL' | 'AUTOENROLL' | 'UNENROLL'>('ENROLL');
  const [lastApiResponse, setLastApiResponse] = useState<{
    status: number;
    traceId: string;
    body: EnrollmentResponse | ApiError;
  } | null>(null);
  const [pingStatus, setPingStatus] = useState<'HEALTHY' | 'TESTING' | 'OFFLINE'>('HEALTHY');
  
  // Conversion Calculator State
  const [calcPointsInput, setCalcPointsInput] = useState<number>(500000);
  const [selectedRedemptionChannel, setSelectedRedemptionChannel] = useState<'AVIATION' | 'TRAVEL_PORTAL' | 'PWP_MERCHANT' | 'STATEMENT_CREDIT'>('AVIATION');

  const activeCard = useMemo(() => {
    return cards.find((c) => c.id === selectedCardId) || cards[0];
  }, [cards, selectedCardId]);

  const totalPortfolioPoints = useMemo(() => {
    return cards.reduce((sum, c) => sum + c.pointsBalance, 0);
  }, [cards]);

  // Dynamic Valuation Calculations
  const portfolioValuations = useMemo(() => {
    return {
      cashEquivalent: totalPortfolioPoints * 0.01,
      travelPortalValue: totalPortfolioPoints * 0.015,
      privateAviationValue: totalPortfolioPoints * 0.022,
      merchantPwpValue: totalPortfolioPoints * 0.018
    };
  }, [totalPortfolioPoints]);

  // Utility to generate lower-hex 32 char traceId as required by Chase Swagger spec
  const generateTraceId = () => {
    const chars = '0123456789abcdef';
    let result = '';
    for (let i = 0; i < 32; i++) {
      result += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return result;
  };

  // Run Health Check /ping
  const handlePingHealthCheck = () => {
    setPingStatus('TESTING');
    setTimeout(() => {
      setPingStatus('HEALTHY');
    }, 450);
  };

  // Execute CLPWPE API Swagger Post / Put Call Simulation
  const handleExecuteEnrollmentApi = () => {
    setApiIsSubmitting(true);
    const traceId = generateTraceId();
    const isUnenroll = apiTargetAction === 'UNENROLL';

    setTimeout(() => {
      const nowFormatted = new Date().toISOString().split('T')[0];
      let newStatus: EnrollmentStatusName = 'ENROLLED';
      if (apiTargetAction === 'AUTOENROLL') newStatus = 'AUTOENROLLED';
      if (apiTargetAction === 'UNENROLL') newStatus = 'UN-ENROLLED';

      // Update local card list state
      setCards((prev) =>
        prev.map((c) =>
          c.id === activeCard.id
            ? {
                ...c,
                status: newStatus,
                statusModifiedDate: nowFormatted
              }
            : c
        )
      );

      const responsePayload: EnrollmentResponse = {
        enrollment: {
          enrollmentStatusName: newStatus,
          enrollmentStatusDate: nowFormatted
        },
        product: {
          merchantDefinedProductCode: activeCard.cardType
        }
      };

      setLastApiResponse({
        status: 200,
        traceId,
        body: responsePayload
      });
      setApiIsSubmitting(false);
    }, 650);
  };

  // Calculator Result
  const calculatedValuation = useMemo(() => {
    const pts = Math.max(0, calcPointsInput);
    switch (selectedRedemptionChannel) {
      case 'AVIATION':
        return {
          rate: activeCard.privateAviationMultiplier * 0.01,
          multiplier: `${activeCard.privateAviationMultiplier}x`,
          usdValue: pts * (activeCard.privateAviationMultiplier * 0.01),
          description: 'NetJets & Private Air Charter Bespoke Clearing Desk'
        };
      case 'TRAVEL_PORTAL':
        return {
          rate: activeCard.travelPortalMultiplier * 0.01,
          multiplier: `${activeCard.travelPortalMultiplier}x`,
          usdValue: pts * (activeCard.travelPortalMultiplier * 0.01),
          description: 'Chase Ultimate Rewards® Luxury Hotel & Air Suite'
        };
      case 'PWP_MERCHANT':
        return {
          rate: 0.018,
          multiplier: '1.80x',
          usdValue: pts * 0.018,
          description: 'Pay with Points Instant Merchant Direct Settlement'
        };
      case 'STATEMENT_CREDIT':
      default:
        return {
          rate: 0.01,
          multiplier: '1.00x',
          usdValue: pts * 0.01,
          description: 'Direct Cash Back / Account Statement Liquid Credit'
        };
    }
  }, [calcPointsInput, selectedRedemptionChannel, activeCard]);

  return (
    <div className="min-h-screen bg-[#070d18] text-slate-100 font-sans antialiased p-3 sm:p-6 lg:p-8">
      {/* --- TOP INSTITUTIONAL HEADER RIBBON --- */}
      <header className="max-w-7xl mx-auto mb-8">
        <div className="bg-gradient-to-r from-[#0b1626] via-[#112239] to-[#0b1626] border border-[#d4af37]/30 rounded-2xl p-5 shadow-2xl backdrop-blur-xl relative overflow-hidden">
          {/* Subtle gold watermarked seal background */}
          <div className="absolute right-0 top-0 w-96 h-96 bg-[#d4af37]/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
          
          <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
            <div>
              <div className="flex items-center space-x-3">
                <div className="h-10 w-10 bg-gradient-to-br from-[#d4af37] via-[#c5a059] to-[#99772d] rounded-lg flex items-center justify-center shadow-lg text-slate-950 font-black tracking-widest text-lg border border-[#f3e5ab]/40">
                  JPM
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                      J.P. MORGAN PRIVATE WEALTH
                    </h1>
                    <span className="bg-[#d4af37]/15 text-[#d4af37] border border-[#d4af37]/30 text-xs px-2.5 py-0.5 rounded-full font-semibold uppercase tracking-wider flex items-center gap-1">
                      <Crown className="w-3 h-3 text-[#d4af37]" /> Palladium Division
                    </span>
                  </div>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">
                    REWARDS POINTS VAULT &bull; CLPWPE ENROLLMENT ENGINE v1.0.0 &bull; HOST: <span className="text-slate-300">api.chase.com</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Live Gateway & Ping Health Badge */}
            <div className="flex flex-wrap items-center gap-3">
              <button
                onClick={handlePingHealthCheck}
                className="flex items-center gap-2 bg-[#0a1322] hover:bg-[#14233c] text-xs font-mono text-slate-300 border border-slate-700/80 px-3.5 py-2 rounded-xl transition duration-200"
                title="GET /ping - Health Check Operation"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${pingStatus === 'TESTING' ? 'animate-spin text-[#d4af37]' : 'text-emerald-400'}`} />
                <span>/ping Gateway:</span>
                <span className="text-emerald-400 font-semibold">{pingStatus === 'TESTING' ? 'PROBING...' : '200 OK'}</span>
              </button>

              <div className="flex items-center gap-2 bg-[#0a1322] text-xs font-mono text-slate-300 border border-slate-700/80 px-3.5 py-2 rounded-xl">
                <Lock className="w-3.5 h-3.5 text-[#d4af37]" />
                <span>OAuth:</span>
                <span className="text-[#d4af37] font-semibold">2-Legged (Scope: card)</span>
              </div>

              <div className="bg-gradient-to-r from-[#d4af37]/20 to-[#c5a059]/20 border border-[#d4af37]/40 px-4 py-1.5 rounded-xl text-right">
                <div className="text-[10px] uppercase font-bold tracking-widest text-[#d4af37]">Private Client Concierge</div>
                <div className="text-xs font-mono font-bold text-white tracking-wider">+1 (800) 808-8888 &bull; JPM-DIRECT</div>
              </div>
            </div>
          </div>

          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center gap-2 mt-6 pt-4 border-t border-slate-800/80">
            <button
              onClick={() => setActiveTab('vault')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeTab === 'vault'
                  ? 'bg-[#d4af37] text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Coins className="w-4 h-4" />
              Vault Overview & Multipliers
            </button>

            <button
              onClick={() => setActiveTab('pwp-api')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeTab === 'pwp-api'
                  ? 'bg-[#d4af37] text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Zap className="w-4 h-4" />
              CLPWPE Swagger Enrollment Console
            </button>

            <button
              onClick={() => setActiveTab('taxlots')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeTab === 'taxlots'
                  ? 'bg-[#d4af37] text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <FileSpreadsheet className="w-4 h-4" />
              Tax-Lot Settlement & Basis Ledger
            </button>

            <button
              onClick={() => setActiveTab('concierge')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeTab === 'concierge'
                  ? 'bg-[#d4af37] text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <Sparkles className="w-4 h-4" />
              J.P. Morgan Reserve Benefits Desk
            </button>

            <button
              onClick={() => setActiveTab('transfers')}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide transition ${
                activeTab === 'transfers'
                  ? 'bg-[#d4af37] text-slate-950 shadow-md font-bold'
                  : 'bg-slate-900/60 hover:bg-slate-800 text-slate-300 border border-slate-800'
              }`}
            >
              <ArrowRightLeft className="w-4 h-4" />
              Direct Aviation & Partner Exchange
            </button>
          </div>
        </div>
      </header>

      {/* --- MAIN DASHBOARD BODY --- */}
      <main className="max-w-7xl mx-auto space-y-8">
        {/* TOP METRICS SUMMARY STRIP */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="bg-[#0c1628]/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Total Vault Balance</span>
              <Coins className="w-4 h-4 text-[#d4af37]" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono">
              {totalPortfolioPoints.toLocaleString()}
            </div>
            <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-mono">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+382,400 pts earned this quarter</span>
            </div>
          </div>

          <div className="bg-[#0c1628]/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Private Jet / Yacht Power (2.2x)</span>
              <Plane className="w-4 h-4 text-sky-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-[#d4af37] font-mono">
              ${portfolioValuations.privateAviationValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Bespoke charter rate conversion parity
            </div>
          </div>

          <div className="bg-[#0c1628]/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Chase Travel Portal (1.5x)</span>
              <Compass className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-100 font-mono">
              ${portfolioValuations.travelPortalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              First/Biz Class & Luxury Hotel Portfolios
            </div>
          </div>

          <div className="bg-[#0c1628]/80 border border-slate-800/90 rounded-2xl p-4 shadow-lg backdrop-blur">
            <div className="flex items-center justify-between text-slate-400 mb-2">
              <span className="text-xs uppercase font-medium tracking-wider">Liquid Cash Settlement (1.0x)</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-slate-300 font-mono">
              ${portfolioValuations.cashEquivalent.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-400 mt-2">
              Immediate Treasury Account transfer basis
            </div>
          </div>
        </div>

        {/* --- TAB 1: VAULT OVERVIEW & MULTIPLIERS --- */}
        {activeTab === 'vault' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            {/* Left Column: Card Portfolio Selection */}
            <div className="lg:col-span-5 space-y-4">
              <div className="flex items-center justify-between">
                <h2 className="text-sm uppercase font-bold tracking-widest text-slate-400 flex items-center gap-2">
                  <CreditCard className="w-4 h-4 text-[#d4af37]" /> Active Card Accounts
                </h2>
                <span className="text-xs text-slate-500 font-mono">{cards.length} Enterprise Cards</span>
              </div>

              <div className="space-y-3">
                {cards.map((card) => {
                  const isSelected = card.id === selectedCardId;
                  return (
                    <div
                      key={card.id}
                      onClick={() => setSelectedCardId(card.id)}
                      className={`cursor-pointer rounded-2xl p-4 transition-all duration-300 border relative overflow-hidden ${
                        isSelected
                          ? 'bg-gradient-to-r from-[#12233f] to-[#182c4d] border-[#d4af37] shadow-xl ring-1 ring-[#d4af37]/40'
                          : 'bg-[#09121f]/90 border-slate-800 hover:border-slate-700 hover:bg-[#0e1c31]'
                      }`}
                    >
                      {/* Metallic sheen aesthetic bar */}
                      <div
                        className={`absolute top-0 left-0 bottom-0 w-1.5 ${
                          card.cardType === 'JPM_RESERVE'
                            ? 'bg-gradient-to-b from-[#d4af37] via-[#fff] to-[#99772d]'
                            : card.cardType === 'SAPPHIRE_RESERVE'
                            ? 'bg-gradient-to-b from-sky-400 to-blue-700'
                            : 'bg-gradient-to-b from-slate-400 to-slate-700'
                        }`}
                      />

                      <div className="pl-3">
                        <div className="flex items-center justify-between">
                          <span className="text-xs font-mono uppercase font-bold text-slate-300">
                            {card.cardType}
                          </span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-mono font-semibold ${
                              card.status === 'ENROLLED' || card.status === 'AUTOENROLLED'
                                ? 'bg-emerald-500/15 text-emerald-300 border border-emerald-500/30'
                                : 'bg-rose-500/15 text-rose-300 border border-rose-500/30'
                            }`}
                          >
                            {card.status}
                          </span>
                        </div>

                        <h3 className="text-base font-bold text-white mt-1">{card.cardTitle}</h3>
                        
                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/80">
                          <div>
                            <div className="text-[10px] text-slate-400 uppercase">Points Balance</div>
                            <div className="text-sm font-mono font-bold text-[#d4af37]">
                              {card.pointsBalance.toLocaleString()} pts
                            </div>
                          </div>

                          <div className="text-right">
                            <div className="text-[10px] text-slate-400 uppercase">Card ending in</div>
                            <div className="text-xs font-mono font-bold text-slate-200">
                              &bull;&bull;&bull;&bull; {card.lastFour}
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Physical Card Specification Specimen */}
              <div className="bg-[#0a1424] border border-slate-800 rounded-2xl p-4 text-xs space-y-2">
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Physical Material</span>
                  <span className="font-mono text-slate-200">{activeCard.metalComposition}</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">Dedicated Escrow Limit</span>
                  <span className="font-mono text-slate-200">${activeCard.creditLimit.toLocaleString()} USD</span>
                </div>
                <div className="flex items-center justify-between text-slate-400">
                  <span className="font-semibold uppercase tracking-wider text-[10px]">UUID Reference</span>
                  <span className="font-mono text-[10px] text-[#d4af37] truncate max-w-[200px]">
                    {activeCard.accountReferenceUuid}
                  </span>
                </div>
              </div>
            </div>

            {/* Right Column: Active Card Multiplier Engine & Live Conversion Calculator */}
            <div className="lg:col-span-7 space-y-6">
              {/* Selected Card Deep Dive Header */}
              <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl relative overflow-hidden">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-mono font-semibold text-[#d4af37] uppercase">
                        Account Identifier: {activeCard.externalAccountIdentifier}
                      </span>
                      {activeCard.isPalladiumTier && (
                        <span className="bg-[#d4af37]/20 text-[#d4af37] border border-[#d4af37]/40 text-[10px] px-2 py-0.5 rounded font-bold uppercase">
                          Palladium Cardmember
                        </span>
                      )}
                    </div>
                    <h2 className="text-2xl font-black text-white mt-1">{activeCard.cardTitle}</h2>
                    <p className="text-xs text-slate-400 mt-1">
                      Assigned Concierge Unit: <span className="text-slate-200">{activeCard.conciergeAssigned}</span>
                    </p>
                  </div>

                  <div className="text-right sm:border-l sm:border-slate-800 sm:pl-6">
                    <div className="text-xs text-slate-400 uppercase font-medium">Available Rewards Balance</div>
                    <div className="text-3xl font-extrabold text-[#d4af37] font-mono">
                      {activeCard.pointsBalance.toLocaleString()}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">
                      &asymp; ${(activeCard.pointsBalance * 0.015).toLocaleString(undefined, { minimumFractionDigits: 2 })} Travel Credit
                    </div>
                  </div>
                </div>

                {/* Multiplier Tiers Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-6 pt-6 border-t border-slate-800/80">
                  <div className="bg-[#070e1b] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-sky-400 flex items-center gap-1">
                      <Plane className="w-3 h-3" /> Private Jet Charter
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {activeCard.privateAviationMultiplier}x Multiplier
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">2.20&cent; per pt with NetJets/WheelsUp</div>
                  </div>

                  <div className="bg-[#070e1b] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-emerald-400 flex items-center gap-1">
                      <Compass className="w-3 h-3" /> Chase Travel Portal
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      {activeCard.travelPortalMultiplier}x Multiplier
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">1.50&cent; per pt on 5-Star Hotel & First Air</div>
                  </div>

                  <div className="bg-[#070e1b] p-3 rounded-xl border border-slate-800">
                    <div className="text-[10px] uppercase font-bold text-amber-400 flex items-center gap-1">
                      <Zap className="w-3 h-3" /> Pay With Points (PWP)
                    </div>
                    <div className="text-xl font-bold font-mono text-white mt-1">
                      1.80x Multiplier
                    </div>
                    <div className="text-[11px] text-slate-400 mt-0.5">Dynamic Merchant Instant Clearing</div>
                  </div>
                </div>
              </div>

              {/* Interactive Redemption Calculator */}
              <div className="bg-gradient-to-br from-[#0c172a] to-[#070e1a] border border-[#d4af37]/30 rounded-2xl p-6 shadow-2xl">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-2">
                    <div className="p-2 bg-[#d4af37]/15 rounded-lg text-[#d4af37]">
                      <Receipt className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-white">Private Wealth Point Liquidity Engine</h3>
                      <p className="text-xs text-slate-400">Calculate instant dollar purchasing power across institutional redemption corridors.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                      Points to Liquidate / Convert
                    </label>
                    <div className="relative">
                      <input
                        type="number"
                        step={10000}
                        value={calcPointsInput}
                        onChange={(e) => setCalcPointsInput(Number(e.target.value))}
                        className="w-full bg-[#050b14] border border-slate-700 text-white font-mono text-lg rounded-xl px-4 py-3 focus:outline-none focus:border-[#d4af37]"
                      />
                      <div className="absolute right-3 top-3.5 flex items-center gap-2">
                        <button
                          onClick={() => setCalcPointsInput(activeCard.pointsBalance)}
                          className="bg-[#15233c] hover:bg-[#1f3459] text-[#d4af37] text-[10px] font-mono font-bold px-2 py-1 rounded"
                        >
                          MAX CARD ({activeCard.pointsBalance.toLocaleString()})
                        </button>
                      </div>
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs uppercase tracking-wider font-semibold text-slate-300 mb-1.5">
                      Redemption Corridor
                    </label>
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                      <button
                        type="button"
                        onClick={() => setSelectedRedemptionChannel('AVIATION')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                          selectedRedemptionChannel === 'AVIATION'
                            ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37]'
                            : 'bg-[#08111e] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold">
                          <Plane className="w-3.5 h-3.5" /> Jet Charter
                        </div>
                        <div className="text-[10px] opacity-80 mt-1">{activeCard.privateAviationMultiplier}x Multiplier</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRedemptionChannel('TRAVEL_PORTAL')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                          selectedRedemptionChannel === 'TRAVEL_PORTAL'
                            ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37]'
                            : 'bg-[#08111e] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold">
                          <Compass className="w-3.5 h-3.5" /> Chase Travel
                        </div>
                        <div className="text-[10px] opacity-80 mt-1">{activeCard.travelPortalMultiplier}x Multiplier</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRedemptionChannel('PWP_MERCHANT')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                          selectedRedemptionChannel === 'PWP_MERCHANT'
                            ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37]'
                            : 'bg-[#08111e] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold">
                          <Zap className="w-3.5 h-3.5" /> Pay w/ Points
                        </div>
                        <div className="text-[10px] opacity-80 mt-1">1.80x Multiplier</div>
                      </button>

                      <button
                        type="button"
                        onClick={() => setSelectedRedemptionChannel('STATEMENT_CREDIT')}
                        className={`p-2.5 rounded-xl border text-xs font-semibold text-left transition ${
                          selectedRedemptionChannel === 'STATEMENT_CREDIT'
                            ? 'bg-[#d4af37]/15 border-[#d4af37] text-[#d4af37]'
                            : 'bg-[#08111e] border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-1 font-bold">
                          <DollarSign className="w-3.5 h-3.5" /> Cash Basis
                        </div>
                        <div className="text-[10px] opacity-80 mt-1">1.00x Multiplier</div>
                      </button>
                    </div>
                  </div>

                  {/* Valuation Display Box */}
                  <div className="mt-4 bg-[#050b14] border border-[#d4af37]/40 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4">
                    <div>
                      <div className="text-xs text-slate-400 uppercase font-mono">Calculated Net Value</div>
                      <div className="text-3xl font-black text-[#d4af37] font-mono">
                        ${calculatedValuation.usdValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </div>
                      <div className="text-xs text-slate-300 mt-0.5">{calculatedValuation.description}</div>
                    </div>

                    <div className="flex items-center gap-3 w-full sm:w-auto">
                      <button
                        onClick={() => {
                          alert(`Concierge transfer request initialized for $${calculatedValuation.usdValue.toLocaleString()} (${calcPointsInput.toLocaleString()} pts) via ${calculatedValuation.description}. Request routed to ${activeCard.conciergeAssigned}.`);
                        }}
                        className="w-full sm:w-auto bg-gradient-to-r from-[#d4af37] to-[#c5a059] hover:from-[#e5bf47] hover:to-[#d4af37] text-slate-950 font-bold px-5 py-2.5 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition duration-200"
                      >
                        <Sparkles className="w-4 h-4" />
                        Execute Liquidation
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 2: CLPWPE SWAGGER ENROLLMENT CONSOLE --- */}
        {activeTab === 'pwp-api' && (
          <div className="space-y-6">
            <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <Zap className="w-5 h-5 text-[#d4af37]" />
                    Card Loyalty Pay With Points Enrollment API (CLPWPE)
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Direct integration interface adhering to Chase OpenAPI v1.0.0 specifications (`POST` &amp; `PUT` endpoints).
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono bg-blue-900/30 text-blue-300 border border-blue-700/40 px-3 py-1 rounded-lg">
                    Base: /card/loyalty/earn-rewards/enrollment/v1
                  </span>
                </div>
              </div>

              {/* Endpoint Runner Form */}
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mt-6">
                <div className="lg:col-span-5 space-y-4">
                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">
                      Target Card Account
                    </label>
                    <select
                      value={activeCard.id}
                      onChange={(e) => setSelectedCardId(e.target.value)}
                      className="w-full bg-[#070e1a] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#d4af37]"
                    >
                      {cards.map((c) => (
                        <option key={c.id} value={c.id}>
                          {c.cardTitle} ({c.cardType}) - Ends {c.lastFour}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">
                      Account Reference UUID (`account-reference-universal-unique-identifier`)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={activeCard.accountReferenceUuid}
                      className="w-full bg-[#050a12] border border-slate-800 text-[#d4af37] rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">
                      External Account Identifier (`external-account-identifier`)
                    </label>
                    <input
                      type="text"
                      readOnly
                      value={activeCard.externalAccountIdentifier}
                      className="w-full bg-[#050a12] border border-slate-800 text-slate-300 rounded-xl px-3 py-2 text-xs font-mono focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">
                        API Action Method
                      </label>
                      <select
                        value={apiTargetAction}
                        onChange={(e) => setApiTargetAction(e.target.value as any)}
                        className="w-full bg-[#070e1a] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="ENROLL">POST - ENROLL (Manual)</option>
                        <option value="AUTOENROLL">POST - AUTOENROLL</option>
                        <option value="UNENROLL">PUT - UN-ENROLL</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs uppercase font-semibold text-slate-300 mb-1">
                        Channel Type Header
                      </label>
                      <select
                        value={apiChannelType}
                        onChange={(e) => setApiChannelType(e.target.value)}
                        className="w-full bg-[#070e1a] border border-slate-700 text-white rounded-xl px-3 py-2 text-xs font-mono focus:outline-none focus:border-[#d4af37]"
                      >
                        <option value="WEB_PRIVATE_VAULT">WEB_PRIVATE_VAULT</option>
                        <option value="MOBILE_NATIVE">MOBILE_NATIVE</option>
                        <option value="CONCIERGE_DESK">CONCIERGE_DESK</option>
                      </select>
                    </div>
                  </div>

                  <button
                    onClick={handleExecuteEnrollmentApi}
                    disabled={apiIsSubmitting}
                    className="w-full mt-2 bg-[#d4af37] hover:bg-[#e0bc46] disabled:opacity-50 text-slate-950 font-bold px-4 py-3 rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg transition"
                  >
                    {apiIsSubmitting ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>Transmitting to Chase Gateway...</span>
                      </>
                    ) : (
                      <>
                        <Zap className="w-4 h-4 text-slate-950" />
                        <span>
                          Transmit {apiTargetAction === 'UNENROLL' ? 'PUT /un-enroll' : 'POST /enrollments'}
                        </span>
                      </>
                    )}
                  </button>
                </div>

                {/* HTTP Request / Response Inspector */}
                <div className="lg:col-span-7 space-y-4">
                  <div className="bg-[#050b14] border border-slate-800 rounded-xl p-4 font-mono text-xs overflow-hidden">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-300">REQUEST HEADERS &amp; PATH</span>
                      <span className="text-[10px] text-emerald-400">2-Legged OAuth Authenticated</span>
                    </div>

                    <div className="space-y-1 text-slate-300">
                      <div className="text-slate-400">
                        <span className="text-amber-400 font-bold">{apiTargetAction === 'UNENROLL' ? 'PUT' : 'POST'}</span> https://api.chase.com/card/loyalty/earn-rewards/enrollment/v1/merchants/programs/pay-with-points/enrollments/{activeCard.accountReferenceUuid}
                      </div>
                      <div className="text-slate-500 mt-2">-- Headers:</div>
                      <div><span className="text-sky-400">enrollment-type-code:</span> {apiTargetAction}</div>
                      <div><span className="text-sky-400">external-account-identifier:</span> {activeCard.externalAccountIdentifier}</div>
                      <div><span className="text-sky-400">channel-type:</span> {apiChannelType}</div>
                      <div><span className="text-sky-400">authorization:</span> Bearer eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCIsIng1dCI6...</div>
                      <div><span className="text-sky-400">trace-id:</span> {lastApiResponse?.traceId || '4f90119a029482810a92bcde710492ab'}</div>
                    </div>
                  </div>

                  <div className="bg-[#050b14] border border-slate-800 rounded-xl p-4 font-mono text-xs">
                    <div className="flex items-center justify-between text-slate-400 border-b border-slate-800 pb-2 mb-3">
                      <span className="text-[11px] font-bold text-slate-300">RESPONSE PAYLOAD (application/json)</span>
                      <span className="text-[10px] text-emerald-400 font-bold">
                        STATUS: {lastApiResponse ? lastApiResponse.status : 200} OK
                      </span>
                    </div>

                    <pre className="text-emerald-300 text-[11px] overflow-x-auto leading-relaxed">
{JSON.stringify(
  lastApiResponse
    ? lastApiResponse.body
    : {
        enrollment: {
          enrollmentStatusName: activeCard.status,
          enrollmentStatusDate: activeCard.statusModifiedDate
        },
        product: {
          merchantDefinedProductCode: activeCard.cardType
        }
      },
  null,
  2
)}
                    </pre>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 3: TAX-LOT SETTLEMENT & BASIS LEDGER --- */}
        {activeTab === 'taxlots' && (
          <div className="space-y-6">
            <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <FileSpreadsheet className="w-5 h-5 text-[#d4af37]" />
                    Ultimate Rewards® Points Tax-Lot Accounting &amp; Basis Ledger
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Reconciliation engine separating non-taxable spend rebates from 1099-MISC bank bonuses for institutional wealth compliance.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="bg-[#070e1a] border border-slate-700 px-3 py-1.5 rounded-xl text-right">
                    <div className="text-[10px] text-slate-400 uppercase">Non-Taxable Rebate Pts</div>
                    <div className="text-xs font-mono font-bold text-emerald-400">5,850,200 (85.4%)</div>
                  </div>
                  <div className="bg-[#070e1a] border border-slate-700 px-3 py-1.5 rounded-xl text-right">
                    <div className="text-[10px] text-slate-400 uppercase">1099-MISC Basis Pts</div>
                    <div className="text-xs font-mono font-bold text-amber-400">1,000,000 (14.6%)</div>
                  </div>
                </div>
              </div>

              {/* Tax-Lot Table */}
              <div className="overflow-x-auto mt-6">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 uppercase font-mono text-[10px]">
                      <th className="py-3 px-4">Lot ID</th>
                      <th className="py-3 px-4">Acquisition Date</th>
                      <th className="py-3 px-4">Origin / Description</th>
                      <th className="py-3 px-4">Associated Card</th>
                      <th className="py-3 px-4 text-right">Points Lot</th>
                      <th className="py-3 px-4 text-right">Cost Basis / Pt</th>
                      <th className="py-3 px-4 text-center">IRS Tax Status</th>
                      <th className="py-3 px-4 text-center">Settlement Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono">
                    {TAX_LOTS.map((lot) => (
                      <tr key={lot.lotId} className="hover:bg-slate-900/40 transition">
                        <td className="py-3 px-4 font-bold text-white">{lot.lotId}</td>
                        <td className="py-3 px-4 text-slate-300">{lot.acquiredDate}</td>
                        <td className="py-3 px-4 font-sans text-slate-200">{lot.sourceDescription}</td>
                        <td className="py-3 px-4 text-[#d4af37] font-semibold">{lot.cardProduct}</td>
                        <td className="py-3 px-4 text-right font-bold text-white">
                          {lot.pointsAmount.toLocaleString()}
                        </td>
                        <td className="py-3 px-4 text-right text-slate-300">
                          ${lot.costBasisPerPoint.toFixed(4)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {lot.is1099Taxable ? (
                            <span className="bg-amber-500/10 text-amber-300 border border-amber-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                              1099-MISC (Taxable)
                            </span>
                          ) : (
                            <span className="bg-emerald-500/10 text-emerald-300 border border-emerald-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                              Spend Rebate (Non-Taxable)
                            </span>
                          )}
                        </td>
                        <td className="py-3 px-4 text-center">
                          <span className="bg-blue-500/10 text-blue-300 border border-blue-500/30 text-[10px] px-2 py-0.5 rounded font-bold">
                            {lot.settlementStatus}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Tax Advisory Footnote */}
              <div className="mt-6 bg-[#070e1a] border border-slate-800 rounded-xl p-4 flex items-start gap-3">
                <AlertCircle className="w-5 h-5 text-[#d4af37] shrink-0 mt-0.5" />
                <div className="text-xs text-slate-400">
                  <span className="text-slate-200 font-semibold">J.P. Morgan Private Wealth Tax Compliance Note:</span> Points accrued via spend-based merchant transactions represent a post-purchase reduction in acquisition cost and are generally non-taxable under IRC &sect; 61. Discretionary relationship bonuses are reported on IRS Form 1099-MISC at a standardized $0.010 valuation. Consult your Private Bank advisor for specific tax lot liquidation planning.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* --- TAB 4: J.P. MORGAN RESERVE BENEFITS DESK --- */}
        {activeTab === 'concierge' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-[#0b1626] border border-[#d4af37]/40 rounded-2xl p-6 shadow-xl relative overflow-hidden">
              <div className="h-10 w-10 bg-[#d4af37]/15 rounded-xl flex items-center justify-center text-[#d4af37] mb-4">
                <Crown className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Palladium Dedicated Concierge</h3>
              <p className="text-xs text-slate-400 mt-2">
                Direct access to private bankers in Geneva, New York, and London for private jet chartering, bespoke Michelin dining reservations, and sovereign escort services.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Priority Response:</span>
                <span className="text-[#d4af37] font-mono font-bold">&lt; 30 Seconds Live Pick-up</span>
              </div>
            </div>

            <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="h-10 w-10 bg-sky-500/15 rounded-xl flex items-center justify-center text-sky-400 mb-4">
                <Plane className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Sapphire Lounge &amp; Private Tarmac</h3>
              <p className="text-xs text-slate-400 mt-2">
                Complimentary unlimited access to Chase Sapphire Lounges by The Club worldwide for cardholder plus unlimited verified guests. Dedicated tarmac transfers at select international hubs.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Guest Policy:</span>
                <span className="text-emerald-400 font-mono font-bold">Unlimited Private Guests</span>
              </div>
            </div>

            <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="h-10 w-10 bg-amber-500/15 rounded-xl flex items-center justify-center text-amber-400 mb-4">
                <Building2 className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Annual Experience &amp; Travel Credit</h3>
              <p className="text-xs text-slate-400 mt-2">
                Automatic statement credit of $300 for global travel plus $1,000 annual bespoke private client art, opera, and sporting box experience vouchers.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Credit Balance:</span>
                <span className="text-white font-mono font-bold">$1,300.00 Available</span>
              </div>
            </div>

            <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="h-10 w-10 bg-indigo-500/15 rounded-xl flex items-center justify-center text-indigo-400 mb-4">
                <ShieldCheck className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Primary Marine &amp; Aircraft Insurance</h3>
              <p className="text-xs text-slate-400 mt-2">
                Global emergency medical evacuation coverage up to $500,000, trip cancellation insurance up to $50,000 per passenger, and superyacht charter damage protection.
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Underwritten By:</span>
                <span className="text-slate-200 font-mono">Chubb Global Specialty</span>
              </div>
            </div>

            <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="h-10 w-10 bg-emerald-500/15 rounded-xl flex items-center justify-center text-emerald-400 mb-4">
                <Anchor className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-white">Monaco &amp; Caribbean Marina Privileges</h3>
              <p className="text-xs text-slate-400 mt-2">
                Guaranteed berth allocations and VIP customs fast-tracking at Port Hercule (Monaco), Gustavia (St. Barts), and Porto Cervo (Sardinia).
              </p>
              <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between text-xs">
                <span className="text-slate-400">Berth Clearance:</span>
                <span className="text-[#d4af37] font-mono font-bold">Tier 1 Sovereign Status</span>
              </div>
            </div>

            <div className="bg-[#0b1626] border border-[#d4af37]/40 rounded-2xl p-6 shadow-xl flex flex-col justify-between">
              <div>
                <h3 className="text-base font-bold text-white">Direct Banker Hotline</h3>
                <p className="text-xs text-slate-400 mt-2">
                  Initiate a secure encrypted voice line to the Chairman&apos;s Private Advisory desk at 270 Park Avenue, NY.
                </p>
              </div>
              <button
                onClick={() => alert("Routing secure VoIP uplink to J.P. Morgan Private Bank Executive Escrow Desk...")}
                className="mt-6 w-full bg-[#d4af37] hover:bg-[#e0bc46] text-slate-950 font-bold py-2.5 rounded-xl text-xs flex items-center justify-center gap-2"
              >
                <Lock className="w-4 h-4" /> Secure Call Desk
              </button>
            </div>
          </div>
        )}

        {/* --- TAB 5: DIRECT AVIATION & PARTNER EXCHANGE --- */}
        {activeTab === 'transfers' && (
          <div className="space-y-6">
            <div className="bg-[#0b1626] border border-slate-800 rounded-2xl p-6 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-white flex items-center gap-2">
                    <ArrowRightLeft className="w-5 h-5 text-[#d4af37]" />
                    1:1 Instant Points Transfer &amp; Private Aviation Partners
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Transfer Ultimate Rewards® points at instant 1:1 parity to premier global airline, hospitality, and private air fleets.
                  </p>
                </div>
                <div className="text-xs font-mono text-[#d4af37] bg-[#d4af37]/10 border border-[#d4af37]/30 px-3 py-1.5 rounded-xl">
                  Transfer Rate: 1.00 UR = 1.00 Partner Mile/Point
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 mt-6">
                {[
                  { name: 'NetJets Private Aviation', type: 'Private Fleet', bonus: '+20% Annual Tier Bonus', speed: 'Instant Transfer' },
                  { name: 'Singapore Airlines KrisFlyer', type: 'First Class Suites', bonus: '1:1 Parity', speed: 'Instant Transfer' },
                  { name: 'Air France-KLM Flying Blue', type: 'La Premiere Access', bonus: '1:1 Parity', speed: 'Instant Transfer' },
                  { name: 'Emirates Skywards', type: 'First Class Privileges', bonus: '1:1 Parity', speed: 'Instant Transfer' },
                  { name: 'World of Hyatt', type: 'Luxury Hotels & Resorts', bonus: '1:1 Parity (High Value)', speed: 'Instant Transfer' },
                  { name: 'British Airways Executive Club', type: 'Concorde Room Access', bonus: '1:1 Parity', speed: 'Instant Transfer' },
                ].map((partner, idx) => (
                  <div key={idx} className="bg-[#070e1a] border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase text-slate-400">{partner.type}</span>
                        <span className="text-[10px] text-emerald-400 font-mono font-bold">{partner.speed}</span>
                      </div>
                      <h4 className="text-sm font-bold text-white mt-1">{partner.name}</h4>
                      <div className="text-xs text-[#d4af37] font-semibold mt-1">{partner.bonus}</div>
                    </div>

                    <button
                      onClick={() => alert(`Transfer gateway opened for ${partner.name}. Points balance: ${activeCard.pointsBalance.toLocaleString()}`)}
                      className="mt-4 w-full bg-[#112239] hover:bg-[#183153] text-slate-200 text-xs font-semibold py-2 rounded-lg border border-slate-700 flex items-center justify-center gap-1.5 transition"
                    >
                      <span>Transfer Points</span>
                      <ChevronRight className="w-3.5 h-3.5" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>

      {/* --- FOOTER COMPLIANCE & RECONCILIATION BAR --- */}
      <footer className="max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800/80 text-center sm:text-left flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-500 font-mono">
        <div>
          &copy; {new Date().getFullYear()} JPMorgan Chase &amp; Co. Member FDIC. Card Loyalty Pay With Points Engine.
        </div>
        <div className="flex items-center gap-4">
          <span className="text-slate-400">Swagger 2.0 CLPWPE v1.0.0</span>
          <span>&bull;</span>
          <span className="text-[#d4af37]">Solid Palladium Account Service</span>
          <span>&bull;</span>
          <span className="text-emerald-400">All Systems Operational</span>
        </div>
      </footer>
    </div>
  );
};

export default ChasePrivateWealthPointsVault;