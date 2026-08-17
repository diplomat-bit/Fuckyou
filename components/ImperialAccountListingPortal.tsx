import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Sparkles,
  TrendingUp,
  Globe,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Cpu,
  Landmark,
  ChevronRight,
  ChevronLeft,
  Filter,
  Search,
  Lock,
  Activity,
  Eye,
  Download,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Building,
  Coins,
  CreditCard,
  PieChart,
  SlidersHorizontal,
  ExternalLink,
  ChevronDown
} from 'lucide-react';

// ==========================================
// CITIBANK OPENAPI & MODERN TREASURY SCHEMAS
// ==========================================

export type AccountClassification = 'ASSET' | 'LIABILITY';
export type AccountGroupType = 'DEPOSIT' | 'INVESTMENT' | 'CREDIT_CARD' | 'LOAN' | 'ESCROW_SOVEREIGN' | 'TREASURY_SWEEP';
export type AccountStatus = 'ACTIVE' | 'DORMANT' | 'RESTRICTED' | 'PLEDGED' | 'SYNDICATED';

export interface CitiCurrencyBalance {
  currencyCode: string;
  amount: number;
  usdEquivalent: number;
  fxRateToUsd: number;
  lastValuationTimestamp: string;
}

export interface CitiAccountDetail {
  accountId: string;
  accountDisplayNumber: string;
  accountNickname: string;
  accountGroup: AccountGroupType;
  accountClassification: AccountClassification;
  accountStatus: AccountStatus;
  currencyCode: string;
  availableBalance: number;
  currentBalance: number;
  holdAmount: number;
  floatingAmount: number;
  creditLimit?: number;
  interestRate?: number;
  maturityDate?: string;
  institutionCode: string;
  routingBic: string;
  modernTreasuryLedgerId: string;
  citiCardIndicator: boolean;
  yieldRateAnnualized?: number;
  sweepTargetRatio?: number;
  regulatoryJurisdiction: 'US_NY' | 'UK_LON' | 'SG_MAS' | 'CH_FINMA' | 'AE_ADGM';
  complianceLevel: 'ULTRA_TIER_1' | 'SOVEREIGN_IMMUNITY' | 'INSTITUTIONAL_PRIME';
}

export interface AccountGroupSummary {
  accountGroup: AccountGroupType;
  groupDisplayName: string;
  classification: AccountClassification;
  totalAvailableBalanceUSD: number;
  totalOutstandingBalanceUSD: number;
  accountCount: number;
  accounts: CitiAccountDetail[];
  currencyDistribution: Record<string, number>;
}

export interface CitiAccountListingResponse {
  accountGroupSummaries: AccountGroupSummary[];
  totalGlobalNetWorthUSD: number;
  totalAssetBalanceUSD: number;
  totalLiabilityBalanceUSD: number;
  foreignCurrencyReservesUSD: number;
  localCurrencyReservesUSD: number;
  nextStartIndex: string | null;
  totalRecordCount: number;
  executionTimestamp: string;
  requestId: string;
}

export interface AiLiquidityForecast {
  periodDays: number;
  projectedNetInflow: number;
  projectedNetOutflow: number;
  recommendedSweepAmount: number;
  neuralConfidenceScore: number;
  arbitrageYieldOpportunityBps: number;
  riskStressIndex: number;
  predictiveNarrative: string;
  topOptimalMove: {
    sourceAccountId: string;
    targetAccountId: string;
    suggestedTransferUSD: number;
    projectedYieldGainUSD: number;
  };
}

// ==========================================
// MOCK HIGH-NET-WORTH CITIBANK + MT DATA
// ==========================================

const INITIAL_CITI_RESPONSE: CitiAccountListingResponse = {
  executionTimestamp: new Date().toISOString(),
  requestId: 'CITI-NY-AI-99081247-PROD',
  totalGlobalNetWorthUSD: 4_892_430_120.45,
  totalAssetBalanceUSD: 5_240_800_000.00,
  totalLiabilityBalanceUSD: 348_369_879.55,
  foreignCurrencyReservesUSD: 2_150_400_000.00,
  localCurrencyReservesUSD: 3_090_400_000.00,
  nextStartIndex: 'PAGE_TOKEN_CITI_SEC_CURSOR_0x89A4B',
  totalRecordCount: 42,
  accountGroupSummaries: [
    {
      accountGroup: 'DEPOSIT',
      groupDisplayName: 'Citibank N.A. Sovereign Demand & High-Yield Liquidity',
      classification: 'ASSET',
      totalAvailableBalanceUSD: 1_840_500_000.00,
      totalOutstandingBalanceUSD: 0,
      accountCount: 3,
      currencyDistribution: { USD: 1_200_000_000, EUR: 400_000_000, CHF: 240_500_000 },
      accounts: [
        {
          accountId: 'CITI-NY-88902-D1',
          accountDisplayNumber: '•••• •••• 8890 2911',
          accountNickname: 'Imperial Sovereign Cash Primary Reserve',
          accountGroup: 'DEPOSIT',
          accountClassification: 'ASSET',
          accountStatus: 'ACTIVE',
          currencyCode: 'USD',
          availableBalance: 1_200_000_000.00,
          currentBalance: 1_200_150_000.00,
          holdAmount: 150_000.00,
          floatingAmount: 4_200_000.00,
          institutionCode: 'CITI-US-001',
          routingBic: 'CITIUS33XXX',
          modernTreasuryLedgerId: 'mt_ldg_9981a8b7c6d',
          citiCardIndicator: false,
          yieldRateAnnualized: 5.42,
          sweepTargetRatio: 0.40,
          regulatoryJurisdiction: 'US_NY',
          complianceLevel: 'SOVEREIGN_IMMUNITY'
        },
        {
          accountId: 'CITI-LON-44012-D2',
          accountDisplayNumber: '•••• •••• 4401 9283',
          accountNickname: 'Citibank London Euro Commercial Treasury',
          accountGroup: 'DEPOSIT',
          accountClassification: 'ASSET',
          accountStatus: 'ACTIVE',
          currencyCode: 'EUR',
          availableBalance: 367_647_058.82,
          currentBalance: 367_647_058.82,
          holdAmount: 0,
          floatingAmount: 12_500_000.00,
          institutionCode: 'CITI-GB-089',
          routingBic: 'CITIGB2LXXX',
          modernTreasuryLedgerId: 'mt_ldg_3377x9911e',
          citiCardIndicator: false,
          yieldRateAnnualized: 4.15,
          sweepTargetRatio: 0.30,
          regulatoryJurisdiction: 'UK_LON',
          complianceLevel: 'ULTRA_TIER_1'
        },
        {
          accountId: 'CITI-ZUR-10982-D3',
          accountDisplayNumber: '•••• •••• 1098 7714',
          accountNickname: 'Helvetic Reserve Asset Depository',
          accountGroup: 'DEPOSIT',
          accountClassification: 'ASSET',
          accountStatus: 'ACTIVE',
          currencyCode: 'CHF',
          availableBalance: 216_666_666.67,
          currentBalance: 216_666_666.67,
          holdAmount: 0,
          floatingAmount: 0,
          institutionCode: 'CITI-CH-992',
          routingBic: 'CITICHZZXXX',
          modernTreasuryLedgerId: 'mt_ldg_ch_8820f7',
          citiCardIndicator: false,
          yieldRateAnnualized: 2.10,
          sweepTargetRatio: 0.15,
          regulatoryJurisdiction: 'CH_FINMA',
          complianceLevel: 'SOVEREIGN_IMMUNITY'
        }
      ]
    },
    {
      accountGroup: 'INVESTMENT',
      groupDisplayName: 'Citi Global Markets & Institutional Prime Custody',
      classification: 'ASSET',
      totalAvailableBalanceUSD: 2_650_300_000.00,
      totalOutstandingBalanceUSD: 0,
      accountCount: 2,
      currencyDistribution: { USD: 2_100_300_000, SGD: 550_000_000 },
      accounts: [
        {
          accountId: 'CITI-SG-99312-I1',
          accountDisplayNumber: '•••• •••• 9931 0021',
          accountNickname: 'APAC Macro Neural Hedge & Sovereign Yield',
          accountGroup: 'INVESTMENT',
          accountClassification: 'ASSET',
          accountStatus: 'ACTIVE',
          currencyCode: 'SGD',
          availableBalance: 742_500_000.00,
          currentBalance: 742_500_000.00,
          holdAmount: 0,
          floatingAmount: 18_400_000.00,
          institutionCode: 'CITI-SG-044',
          routingBic: 'CITISGSGXXX',
          modernTreasuryLedgerId: 'mt_ldg_sg_7718aa',
          citiCardIndicator: false,
          yieldRateAnnualized: 7.85,
          sweepTargetRatio: 0.20,
          regulatoryJurisdiction: 'SG_MAS',
          complianceLevel: 'ULTRA_TIER_1'
        },
        {
          accountId: 'CITI-NY-77112-I2',
          accountDisplayNumber: '•••• •••• 7711 5590',
          accountNickname: 'Quantum Alpha Systematic Treasury Fund',
          accountGroup: 'INVESTMENT',
          accountClassification: 'ASSET',
          accountStatus: 'ACTIVE',
          currencyCode: 'USD',
          availableBalance: 2_100_300_000.00,
          currentBalance: 2_100_300_000.00,
          holdAmount: 50_000_000.00,
          floatingAmount: 0,
          institutionCode: 'CITI-US-001',
          routingBic: 'CITIUS33XXX',
          modernTreasuryLedgerId: 'mt_ldg_us_alpha90',
          citiCardIndicator: false,
          yieldRateAnnualized: 8.92,
          sweepTargetRatio: 0.35,
          regulatoryJurisdiction: 'US_NY',
          complianceLevel: 'INSTITUTIONAL_PRIME'
        }
      ]
    },
    {
      accountGroup: 'ESCROW_SOVEREIGN',
      groupDisplayName: 'ADGM & Swiss Escrow Bullion Collateralized Facility',
      classification: 'ASSET',
      totalAvailableBalanceUSD: 750_000_000.00,
      totalOutstandingBalanceUSD: 0,
      accountCount: 1,
      currencyDistribution: { AED: 2_754_750_000 },
      accounts: [
        {
          accountId: 'CITI-ADGM-5519-E1',
          accountDisplayNumber: '•••• •••• 5519 1184',
          accountNickname: 'Sovereign Physical Gold & Synthetic Liquidity Escrow',
          accountGroup: 'ESCROW_SOVEREIGN',
          accountClassification: 'ASSET',
          accountStatus: 'PLEDGED',
          currencyCode: 'AED',
          availableBalance: 2_754_750_000.00,
          currentBalance: 2_754_750_000.00,
          holdAmount: 750_000_000.00,
          floatingAmount: 0,
          institutionCode: 'CITI-AE-701',
          routingBic: 'CITIAEADXXX',
          modernTreasuryLedgerId: 'mt_ldg_ae_gold774',
          citiCardIndicator: false,
          yieldRateAnnualized: 4.80,
          regulatoryJurisdiction: 'AE_ADGM',
          complianceLevel: 'SOVEREIGN_IMMUNITY'
        }
      ]
    },
    {
      accountGroup: 'LOAN',
      groupDisplayName: 'Syndicated Sovereign Revolver & Euro Medium Term Notes',
      classification: 'LIABILITY',
      totalAvailableBalanceUSD: 0,
      totalOutstandingBalanceUSD: 315_000_000.00,
      accountCount: 1,
      currencyDistribution: { USD: 315_000_000 },
      accounts: [
        {
          accountId: 'CITI-LN-99120-L1',
          accountDisplayNumber: '•••• •••• 9912 4001',
          accountNickname: 'Syndicated Term Facility Tranche IV',
          accountGroup: 'LOAN',
          accountClassification: 'LIABILITY',
          accountStatus: 'SYNDICATED',
          currencyCode: 'USD',
          availableBalance: 0,
          currentBalance: -315_000_000.00,
          holdAmount: 0,
          floatingAmount: 0,
          creditLimit: 500_000_000.00,
          interestRate: 3.25,
          maturityDate: '2034-12-31',
          institutionCode: 'CITI-US-001',
          routingBic: 'CITIUS33XXX',
          modernTreasuryLedgerId: 'mt_ldg_syn_loan_4',
          citiCardIndicator: false,
          regulatoryJurisdiction: 'US_NY',
          complianceLevel: 'SOVEREIGN_IMMUNITY'
        }
      ]
    },
    {
      accountGroup: 'CREDIT_CARD',
      groupDisplayName: 'Citibank Chairman Diamond Centurion Commercial Fleet',
      classification: 'LIABILITY',
      totalAvailableBalanceUSD: 66_630_120.45,
      totalOutstandingBalanceUSD: 33_369_879.55,
      accountCount: 1,
      currencyDistribution: { USD: 33_369_879.55 },
      accounts: [
        {
          accountId: 'CITI-CC-00192-C1',
          accountDisplayNumber: '•••• •••• •••• 0001',
          accountNickname: 'Chairman Sovereign Jet & Fleet Card Unlimited',
          accountGroup: 'CREDIT_CARD',
          accountClassification: 'LIABILITY',
          accountStatus: 'ACTIVE',
          currencyCode: 'USD',
          availableBalance: 66_630_120.45,
          currentBalance: -33_369_879.55,
          holdAmount: 1_200_000.00,
          floatingAmount: 4_500_000.00,
          creditLimit: 100_000_000.00,
          institutionCode: 'CITI-US-001',
          routingBic: 'CITIUS33XXX',
          modernTreasuryLedgerId: 'mt_ldg_cc_fleet_01',
          citiCardIndicator: true,
          regulatoryJurisdiction: 'US_NY',
          complianceLevel: 'ULTRA_TIER_1'
        }
      ]
    }
  ]
};

// AI Engine Liquidity Projection Simulation
const AI_FORECAST_DATA: AiLiquidityForecast = {
  periodDays: 30,
  projectedNetInflow: 384_500_000.00,
  projectedNetOutflow: 112_000_000.00,
  recommendedSweepAmount: 185_000_000.00,
  neuralConfidenceScore: 99.94,
  arbitrageYieldOpportunityBps: 84.5,
  riskStressIndex: 0.012,
  predictiveNarrative:
    'Sovereign liquidity runway exceeds 48.2 months at current burn rate. Predictive ML model indicates +84.5 bps net yield enhancement by sweeping $185M unencumbered USD cash from CITI-US Demand Primary into CITI-SG Institutional Yield Sleeve before Asian trading open.',
  topOptimalMove: {
    sourceAccountId: 'CITI-NY-88902-D1',
    targetAccountId: 'CITI-SG-99312-I1',
    suggestedTransferUSD: 185_000_000,
    projectedYieldGainUSD: 4_520_000
  }
};

// ==========================================
// FORMATTING UTILITIES
// ==========================================

const formatUSD = (val: number): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 2,
    minimumFractionDigits: 2
  }).format(val);
};

const formatLocalCurrency = (amount: number, currency: string): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency,
    maximumFractionDigits: 2
  }).format(amount);
};

// ==========================================
// MAIN COMPONENT: ImperialAccountListingPortal
// ==========================================

export default function ImperialAccountListingPortal() {
  const [data, setData] = useState<CitiAccountListingResponse>(INITIAL_CITI_RESPONSE);
  const [activeClassification, setActiveClassification] = useState<'ALL' | 'ASSET' | 'LIABILITY'>('ALL');
  const [activeGroupFilter, setActiveGroupFilter] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedAccount, setSelectedAccount] = useState<CitiAccountDetail | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [autoSweepActive, setAutoSweepActive] = useState<boolean>(true);
  const [isAiDrawerOpen, setIsAiDrawerOpen] = useState<boolean>(false);
  const [isExportModalOpen, setIsExportModalOpen] = useState<boolean>(false);
  const [pageHistory, setPageHistory] = useState<string[]>([]);
  const [currentPageIndex, setCurrentPageIndex] = useState<number>(1);
  const [realtimePulse, setRealtimePulse] = useState<number>(0);

  // Periodic simulated ticker pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setRealtimePulse(prev => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Filter accounts based on classification, group and search
  const filteredSummaries = useMemo(() => {
    return data.accountGroupSummaries
      .filter(grp => {
        if (activeClassification !== 'ALL' && grp.classification !== activeClassification) {
          return false;
        }
        if (activeGroupFilter !== 'ALL' && grp.accountGroup !== activeGroupFilter) {
          return false;
        }
        return true;
      })
      .map(grp => {
        const matchingAccounts = grp.accounts.filter(acc => {
          if (!searchQuery.trim()) return true;
          const query = searchQuery.toLowerCase();
          return (
            acc.accountNickname.toLowerCase().includes(query) ||
            acc.accountId.toLowerCase().includes(query) ||
            acc.accountDisplayNumber.toLowerCase().includes(query) ||
            acc.currencyCode.toLowerCase().includes(query) ||
            acc.regulatoryJurisdiction.toLowerCase().includes(query) ||
            acc.modernTreasuryLedgerId.toLowerCase().includes(query)
          );
        });
        return {
          ...grp,
          accounts: matchingAccounts
        };
      })
      .filter(grp => grp.accounts.length > 0);
  }, [data, activeClassification, activeGroupFilter, searchQuery]);

  // Handle Refresh simulation
  const handleRefresh = useCallback(() => {
    setIsRefreshing(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        executionTimestamp: new Date().toISOString(),
        totalGlobalNetWorthUSD: prev.totalGlobalNetWorthUSD + (Math.random() * 200_000 - 50_000),
        foreignCurrencyReservesUSD: prev.foreignCurrencyReservesUSD + (Math.random() * 100_000 - 25_000)
      }));
      setIsRefreshing(false);
    }, 900);
  }, []);

  // Simulated Next Start Index Pagination
  const handleNextPage = () => {
    if (!data.nextStartIndex) return;
    setPageHistory(prev => [...prev, data.nextStartIndex!]);
    setCurrentPageIndex(prev => prev + 1);
    setIsRefreshing(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        nextStartIndex: currentPageIndex >= 2 ? null : `PAGE_TOKEN_CITI_SEC_CURSOR_0x${Math.floor(Math.random() * 999999).toString(16)}`
      }));
      setIsRefreshing(false);
    }, 600);
  };

  const handlePrevPage = () => {
    if (pageHistory.length === 0) return;
    setPageHistory(prev => prev.slice(0, -1));
    setCurrentPageIndex(prev => Math.max(1, prev - 1));
    setIsRefreshing(true);
    setTimeout(() => {
      setData(prev => ({
        ...prev,
        nextStartIndex: 'PAGE_TOKEN_CITI_SEC_CURSOR_0x89A4B'
      }));
      setIsRefreshing(false);
    }, 600);
  };

  // Modern Treasury Sweep Execution Mock
  const handleExecuteAiSweep = () => {
    alert(
      `[MODERN TREASURY CITIBANK BRIDGE] Sweep Initiated:\n\n• Routed USD $185,000,000.00 from Primary Depository (${AI_FORECAST_DATA.topOptimalMove.sourceAccountId}) to Institutional Yield Sleeve (${AI_FORECAST_DATA.topOptimalMove.targetAccountId})\n• Projected Alpha: +$4,520,000.00 annualized.\n• Citi ISO 20022 Pacs.008 confirmation generated.`
    );
    setIsAiDrawerOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 font-sans antialiased selection:bg-[#E6CA65]/30 selection:text-[#FFF8DC]">
      {/* Top Ambient Glow Lines */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-[#E6CA65] to-transparent opacity-80 z-50 pointer-events-none" />
      <div className="fixed -top-40 left-1/2 -translate-x-1/2 w-[900px] h-[350px] bg-gradient-to-b from-[#D4AF37]/10 via-[#0B2341]/20 to-transparent blur-3xl pointer-events-none" />

      {/* Main Container */}
      <div className="max-w-[1720px] mx-auto px-4 sm:px-6 lg:px-10 py-8 relative">
        
        {/* ========================================================= */}
        {/* TOP BAR / SOVEREIGN HEADER                                */}
        {/* ========================================================= */}
        <header className="flex flex-col lg:flex-row lg:items-center lg:justify-between pb-8 border-b border-slate-800/80 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-xl bg-gradient-to-br from-[#E6CA65] via-[#997724] to-[#403108] p-[1px] shadow-lg shadow-[#E6CA65]/10">
                <div className="h-full w-full bg-[#070B11] rounded-[11px] flex items-center justify-center">
                  <Landmark className="w-5 h-5 text-[#E6CA65]" />
                </div>
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-[11px] tracking-[0.25em] font-semibold text-[#E6CA65] uppercase">
                    Citibank OpenAPI • GET / Listing & Details
                  </span>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-mono font-bold bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    LIVE MT-LEDGER SYNC
                  </span>
                </div>
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                  Imperial Sovereign Accounts Terminal
                </h1>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 font-normal">
              High-frequency multi-jurisdiction asset consolidation • Modern Treasury dynamic sweeps • AI predictive liquidity & FX arbitrage
            </p>
          </div>

          {/* Quick Actions & Telemetry */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsAiDrawerOpen(true)}
              className="group relative px-4 py-2.5 rounded-xl text-xs font-semibold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37]/20 via-[#E6CA65]/30 to-[#997724]/20 border border-[#E6CA65]/50 text-[#FFF8DC] hover:border-[#E6CA65] transition-all duration-300 shadow-md shadow-[#E6CA65]/10 flex items-center gap-2"
            >
              <Sparkles className="w-4 h-4 text-[#E6CA65] group-hover:rotate-12 transition-transform" />
              <span>AI Liquidity Engine</span>
              <span className="px-1.5 py-0.5 rounded text-[10px] font-mono bg-[#E6CA65]/20 text-[#FFF8DC]">
                99.94% Conf.
              </span>
            </button>

            <button
              onClick={() => setIsExportModalOpen(true)}
              className="px-4 py-2.5 rounded-xl text-xs font-semibold tracking-wider bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-200 transition-all flex items-center gap-2"
            >
              <Download className="w-4 h-4 text-slate-400" />
              <span>ISO 20022 Export</span>
            </button>

            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="p-2.5 rounded-xl bg-slate-900/80 hover:bg-slate-800 border border-slate-700/80 text-slate-300 hover:text-white transition-all disabled:opacity-50"
              title="Refresh Citi OpenAPI Balances"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-[#E6CA65]' : ''}`} />
            </button>
          </div>
        </header>

        {/* ========================================================= */}
        {/* TOP SOVEREIGN KPIS / ASSET-LIABILITY MATRIX               */}
        {/* ========================================================= */}
        <section className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 sm:gap-5 my-8">
          
          {/* Card 1: Total Global Net Worth */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0E1522] to-[#070A10] border border-slate-800 p-5 group hover:border-[#E6CA65]/50 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Landmark className="w-20 h-20 text-[#E6CA65]" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>TOTAL SOVEREIGN NET WORTH</span>
              <span className="text-[10px] font-mono text-[#E6CA65] bg-[#E6CA65]/10 px-2 py-0.5 rounded border border-[#E6CA65]/20">
                USD CONSOLIDATED
              </span>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-white font-mono">
              {formatUSD(data.totalGlobalNetWorthUSD)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+3.84% ($181.2M) 24h Yield Rebalance</span>
            </div>
          </div>

          {/* Card 2: Total Assets (Gross Liquid) */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0E1522] to-[#070A10] border border-slate-800 p-5 group hover:border-emerald-500/50 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Coins className="w-20 h-20 text-emerald-400" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>GROSS CUSTODIAL ASSETS</span>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                TIER 1 CAPITAL
              </span>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-emerald-300 font-mono">
              {formatUSD(data.totalAssetBalanceUSD)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400" />
              <span>Local: {formatUSD(data.localCurrencyReservesUSD)}</span>
            </div>
          </div>

          {/* Card 3: Liabilities / Synthetic Lines */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0E1522] to-[#070A10] border border-slate-800 p-5 group hover:border-amber-500/50 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <CreditCard className="w-20 h-20 text-amber-400" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>OUTSTANDING LIABILITIES</span>
              <span className="text-[10px] font-mono text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                SYNDICATED + CC
              </span>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-amber-200 font-mono">
              {formatUSD(data.totalLiabilityBalanceUSD)}
            </div>
            <div className="mt-2 flex items-center gap-2 text-xs text-slate-400">
              <span className="w-2 h-2 rounded-full bg-amber-400" />
              <span>Weighted Avg Cost: 3.32% p.a.</span>
            </div>
          </div>

          {/* Card 4: Multi-Currency & Sovereign Reserves */}
          <div className="relative overflow-hidden rounded-2xl bg-gradient-to-b from-[#0E1522] to-[#070A10] border border-slate-800 p-5 group hover:border-cyan-500/50 transition-all shadow-xl">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Globe className="w-20 h-20 text-cyan-400" />
            </div>
            <div className="flex items-center justify-between text-xs text-slate-400 font-medium">
              <span>FOREIGN FX RESERVES</span>
              <span className="text-[10px] font-mono text-cyan-400 bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-500/20">
                EUR • CHF • SGD • AED
              </span>
            </div>
            <div className="mt-3 text-2xl sm:text-3xl font-black tracking-tight text-cyan-300 font-mono">
              {formatUSD(data.foreignCurrencyReservesUSD)}
            </div>
            <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
              <span>4 Active Geographies</span>
              <span className="text-cyan-400 font-mono text-[11px]">Auto FX Hedged 100%</span>
            </div>
          </div>

        </section>

        {/* ========================================================= */}
        {/* AI PREDICTIVE RUNWAY BANNER                               */}
        {/* ========================================================= */}
        <section className="mb-8 rounded-2xl bg-gradient-to-r from-[#0C121E] via-[#0E1929] to-[#0C121E] border border-[#D4AF37]/30 p-5 sm:p-6 shadow-2xl relative overflow-hidden">
          <div className="absolute -right-12 -bottom-12 w-64 h-64 bg-[#E6CA65]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
            <div className="flex items-start gap-4">
              <div className="p-3 rounded-xl bg-[#E6CA65]/10 border border-[#E6CA65]/30 text-[#E6CA65] shrink-0 mt-1">
                <Cpu className="w-6 h-6 animate-pulse" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <h2 className="text-sm font-bold tracking-wider text-[#E6CA65] uppercase">
                    Citibank AI Liquidity Optimization Engine & Runway
                  </h2>
                  <span className="px-2 py-0.5 text-[10px] rounded font-mono bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 font-bold">
                    PREDICTIVE RUNWAY: 48.2 MONTHS
                  </span>
                </div>
                <p className="text-xs sm:text-sm text-slate-300 max-w-4xl leading-relaxed">
                  {AI_FORECAST_DATA.predictiveNarrative}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-4 self-stretch sm:self-auto justify-end">
              <button
                onClick={handleExecuteAiSweep}
                className="w-full sm:w-auto px-5 py-3 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-[#D4AF37] to-[#B38F24] hover:from-[#E6CA65] hover:to-[#C29D30] text-[#05070B] transition-all shadow-lg shadow-[#D4AF37]/20 flex items-center justify-center gap-2 shrink-0 cursor-pointer"
              >
                <Zap className="w-4 h-4 fill-current" />
                <span>Execute $185M Optimal Sweep</span>
              </button>
            </div>
          </div>
        </section>

        {/* ========================================================= */}
        {/* FILTER CONTROLS & SEARCH BAR                              */}
        {/* ========================================================= */}
        <section className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 mb-6">
          
          {/* Classification Filter Tabs */}
          <div className="flex items-center p-1 bg-slate-900/90 rounded-xl border border-slate-800 self-start">
            <button
              onClick={() => setActiveClassification('ALL')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                activeClassification === 'ALL'
                  ? 'bg-[#E6CA65] text-[#070B11] shadow-md shadow-[#E6CA65]/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ALL PORTFOLIOS
            </button>
            <button
              onClick={() => setActiveClassification('ASSET')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                activeClassification === 'ASSET'
                  ? 'bg-emerald-500 text-slate-950 shadow-md shadow-emerald-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              ASSETS ONLY
            </button>
            <button
              onClick={() => setActiveClassification('LIABILITY')}
              className={`px-4 py-2 rounded-lg text-xs font-semibold tracking-wider transition-all ${
                activeClassification === 'LIABILITY'
                  ? 'bg-amber-500 text-slate-950 shadow-md shadow-amber-500/20 font-bold'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              LIABILITIES ONLY
            </button>
          </div>

          {/* Search and Secondary Filter */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="relative flex-1 sm:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
              <input
                type="text"
                placeholder="Search Account ID, BIC, currency, nickname..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#E6CA65] focus:ring-1 focus:ring-[#E6CA65] transition-all"
              />
              {searchQuery && (
                <button
                  onClick={() => setSearchQuery('')}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-500 hover:text-slate-300"
                >
                  ✕
                </button>
              )}
            </div>

            <select
              value={activeGroupFilter}
              onChange={e => setActiveGroupFilter(e.target.value)}
              className="px-3 py-2 text-xs rounded-xl bg-slate-900/80 border border-slate-800 text-slate-300 focus:outline-none focus:border-[#E6CA65] cursor-pointer"
            >
              <option value="ALL">All Account Groups</option>
              <option value="DEPOSIT">Deposits & Demand</option>
              <option value="INVESTMENT">Investment Custody</option>
              <option value="ESCROW_SOVEREIGN">Escrow & Sovereign Collateral</option>
              <option value="LOAN">Syndicated Loans</option>
              <option value="CREDIT_CARD">Chairman Cards</option>
            </select>
          </div>
        </section>

        {/* ========================================================= */}
        {/* CITIBANK ACCOUNT GROUP SUMMARIES LISTING                  */}
        {/* ========================================================= */}
        <div className="space-y-6">
          {filteredSummaries.length === 0 ? (
            <div className="rounded-2xl border border-slate-800 bg-[#090D14] p-12 text-center">
              <AlertTriangle className="w-10 h-10 text-[#E6CA65] mx-auto mb-3 opacity-60" />
              <h3 className="text-lg font-bold text-white">No Matching Accounts Found</h3>
              <p className="text-xs text-slate-400 mt-1 max-w-md mx-auto">
                No accounts match the active filter criteria. Adjust your search query or reset the classification filters.
              </p>
              <button
                onClick={() => {
                  setSearchQuery('');
                  setActiveClassification('ALL');
                  setActiveGroupFilter('ALL');
                }}
                className="mt-4 px-4 py-2 rounded-xl text-xs font-semibold bg-[#E6CA65] text-slate-950"
              >
                Reset All Filters
              </button>
            </div>
          ) : (
            filteredSummaries.map((group, groupIdx) => (
              <div
                key={`${group.accountGroup}-${groupIdx}`}
                className="rounded-2xl bg-gradient-to-b from-[#0B0F19] to-[#070A10] border border-slate-800/90 overflow-hidden shadow-2xl transition-all hover:border-slate-700"
              >
                {/* Group Summary Header */}
                <div className="p-5 sm:p-6 bg-slate-900/40 border-b border-slate-800 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span
                        className={`px-2.5 py-1 rounded-md text-[10px] font-mono font-bold tracking-wider ${
                          group.classification === 'ASSET'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                        }`}
                      >
                        {group.classification}
                      </span>
                      <h3 className="text-base sm:text-lg font-bold text-white tracking-tight">
                        {group.groupDisplayName}
                      </h3>
                      <span className="text-xs text-slate-500 font-mono">
                        ({group.accounts.length} {group.accounts.length === 1 ? 'Ledger' : 'Ledgers'})
                      </span>
                    </div>
                    
                    {/* Currency Distribution Chips */}
                    <div className="flex flex-wrap items-center gap-2 pt-1">
                      <span className="text-[11px] text-slate-400 font-mono">Currencies:</span>
                      {Object.entries(group.currencyDistribution).map(([curr, amt]) => (
                        <span
                          key={curr}
                          className="px-2 py-0.5 rounded text-[10px] font-mono bg-slate-800 text-slate-300 border border-slate-700/60"
                        >
                          {curr}: {formatLocalCurrency(amt, curr)}
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Group Balance Metrics */}
                  <div className="flex items-center gap-6 self-start md:self-auto">
                    <div className="text-right">
                      <div className="text-[11px] text-slate-400 font-medium">
                        {group.classification === 'ASSET' ? 'TOTAL GROUP AVAILABLE' : 'TOTAL OUTSTANDING'}
                      </div>
                      <div
                        className={`text-lg sm:text-xl font-bold font-mono ${
                          group.classification === 'ASSET' ? 'text-emerald-400' : 'text-amber-400'
                        }`}
                      >
                        {group.classification === 'ASSET'
                          ? formatUSD(group.totalAvailableBalanceUSD)
                          : formatUSD(group.totalOutstandingBalanceUSD)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Account Details Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800/80 bg-slate-950/40 text-[11px] font-mono text-slate-400 uppercase tracking-wider">
                        <th className="py-3.5 px-5">Account & Ledger</th>
                        <th className="py-3.5 px-4">Jurisdiction & BIC</th>
                        <th className="py-3.5 px-4">Status & Tier</th>
                        <th className="py-3.5 px-4 text-right">Yield / Int</th>
                        <th className="py-3.5 px-4 text-right">Hold / Float</th>
                        <th className="py-3.5 px-5 text-right">Available Balance</th>
                        <th className="py-3.5 px-4 text-center">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/50 text-xs">
                      {group.accounts.map(acc => (
                        <tr
                          key={acc.accountId}
                          className="hover:bg-[#121A28]/60 transition-colors group cursor-pointer"
                          onClick={() => setSelectedAccount(acc)}
                        >
                          {/* Account ID & Nickname */}
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <div className="p-2 rounded-lg bg-slate-800/80 text-[#E6CA65] group-hover:bg-[#E6CA65] group-hover:text-slate-950 transition-colors">
                                {acc.citiCardIndicator ? (
                                  <CreditCard className="w-4 h-4" />
                                ) : acc.accountGroup === 'INVESTMENT' ? (
                                  <PieChart className="w-4 h-4" />
                                ) : (
                                  <Building className="w-4 h-4" />
                                )}
                              </div>
                              <div>
                                <div className="font-semibold text-slate-100 group-hover:text-[#E6CA65] transition-colors flex items-center gap-2">
                                  <span>{acc.accountNickname}</span>
                                </div>
                                <div className="text-[11px] font-mono text-slate-400 flex items-center gap-2 mt-0.5">
                                  <span>{acc.accountDisplayNumber}</span>
                                  <span className="text-slate-600">•</span>
                                  <span className="text-slate-500">{acc.modernTreasuryLedgerId}</span>
                                </div>
                              </div>
                            </div>
                          </td>

                          {/* Jurisdiction & BIC */}
                          <td className="py-4 px-4 font-mono">
                            <div className="flex items-center gap-1.5 text-slate-200">
                              <Globe className="w-3.5 h-3.5 text-cyan-400" />
                              <span>{acc.regulatoryJurisdiction}</span>
                            </div>
                            <div className="text-[11px] text-slate-500 mt-0.5">{acc.routingBic}</div>
                          </td>

                          {/* Status & Tier */}
                          <td className="py-4 px-4">
                            <div className="flex flex-col gap-1">
                              <span
                                className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-mono font-semibold w-fit ${
                                  acc.accountStatus === 'ACTIVE'
                                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                    : acc.accountStatus === 'PLEDGED'
                                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                    : 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                                }`}
                              >
                                {acc.accountStatus}
                              </span>
                              <span className="text-[10px] text-slate-500 font-mono tracking-tight">
                                {acc.complianceLevel}
                              </span>
                            </div>
                          </td>

                          {/* Yield / Rate */}
                          <td className="py-4 px-4 text-right font-mono">
                            {acc.yieldRateAnnualized ? (
                              <div className="text-emerald-400 font-semibold">
                                +{acc.yieldRateAnnualized.toFixed(2)}% p.a.
                              </div>
                            ) : acc.interestRate ? (
                              <div className="text-amber-400 font-semibold">
                                {acc.interestRate.toFixed(2)}% cost
                              </div>
                            ) : (
                              <div className="text-slate-500">—</div>
                            )}
                            {acc.sweepTargetRatio && (
                              <div className="text-[10px] text-slate-500 mt-0.5">
                                Sweep: {(acc.sweepTargetRatio * 100).toFixed(0)}%
                              </div>
                            )}
                          </td>

                          {/* Hold / Float */}
                          <td className="py-4 px-4 text-right font-mono text-slate-400">
                            <div>Hold: {formatUSD(acc.holdAmount)}</div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Float: {formatUSD(acc.floatingAmount)}
                            </div>
                          </td>

                          {/* Available Balance */}
                          <td className="py-4 px-5 text-right font-mono">
                            <div
                              className={`text-sm font-bold ${
                                acc.accountClassification === 'ASSET' ? 'text-white' : 'text-amber-300'
                              }`}
                            >
                              {formatLocalCurrency(acc.availableBalance, acc.currencyCode)}
                            </div>
                            <div className="text-[10px] text-slate-500 mt-0.5">
                              Book: {formatLocalCurrency(acc.currentBalance, acc.currencyCode)}
                            </div>
                          </td>

                          {/* Actions */}
                          <td className="py-4 px-4 text-center" onClick={e => e.stopPropagation()}>
                            <button
                              onClick={() => setSelectedAccount(acc)}
                              className="p-1.5 rounded-lg bg-slate-800 hover:bg-[#E6CA65] text-slate-300 hover:text-slate-950 transition-colors"
                              title="Inspect Full Citi Endpoint Record"
                            >
                              <Eye className="w-4 h-4" />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* ========================================================= */}
        {/* CITIBANK GET / PAGINATION WITH nextStartIndex             */}
        {/* ========================================================= */}
        <footer className="mt-8 pt-6 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
          <div className="flex items-center gap-2 font-mono">
            <span className="text-slate-500">Citi OpenAPI Cursor:</span>
            <span className="px-2 py-1 bg-slate-900 rounded border border-slate-800 text-[#E6CA65] text-[11px] truncate max-w-[280px]">
              {data.nextStartIndex || 'END_OF_CURSOR_STREAM'}
            </span>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-slate-400 font-mono">
              Page {currentPageIndex} of {Math.ceil(data.totalRecordCount / 8)}
            </span>
            <button
              onClick={handlePrevPage}
              disabled={currentPageIndex === 1 || isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900 transition-all flex items-center gap-1"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Previous</span>
            </button>
            <button
              onClick={handleNextPage}
              disabled={!data.nextStartIndex || isRefreshing}
              className="px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-slate-300 hover:bg-slate-800 hover:text-white disabled:opacity-30 disabled:hover:bg-slate-900 transition-all flex items-center gap-1"
            >
              <span>Next Cursor</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          </div>
        </footer>

      </div>

      {/* ========================================================= */}
      {/* DRAWER: CITIBANK ACCOUNT DETAIL INSPECTOR MODAL           */}
      {/* ========================================================= */}
      {selectedAccount && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-200">
          <div className="relative w-full max-w-3xl rounded-3xl bg-[#090E17] border border-[#E6CA65]/40 shadow-2xl p-6 sm:p-8 max-h-[90vh] overflow-y-auto">
            
            {/* Modal Header */}
            <div className="flex items-center justify-between pb-6 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className="p-3 rounded-2xl bg-[#E6CA65]/10 border border-[#E6CA65]/30 text-[#E6CA65]">
                  <Landmark className="w-6 h-6" />
                </div>
                <div>
                  <div className="text-[10px] font-mono tracking-widest text-[#E6CA65] uppercase">
                    Citibank Verified Ledger Details
                  </div>
                  <h2 className="text-xl font-bold text-white">{selectedAccount.accountNickname}</h2>
                  <div className="text-xs font-mono text-slate-400">{selectedAccount.accountId}</div>
                </div>
              </div>
              <button
                onClick={() => setSelectedAccount(null)}
                className="p-2 rounded-xl bg-slate-800/80 text-slate-400 hover:text-white hover:bg-slate-700 transition-all"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="py-6 space-y-6">
              
              {/* Balances Highlight */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 p-4 rounded-2xl bg-slate-950/60 border border-slate-800/80">
                <div>
                  <div className="text-xs text-slate-400 font-mono">AVAILABLE FOR DISBURSEMENT</div>
                  <div className="text-2xl font-black font-mono text-emerald-400 mt-1">
                    {formatLocalCurrency(selectedAccount.availableBalance, selectedAccount.currencyCode)}
                  </div>
                </div>
                <div>
                  <div className="text-xs text-slate-400 font-mono">BOOK / CURRENT LEDGER</div>
                  <div className="text-2xl font-black font-mono text-slate-200 mt-1">
                    {formatLocalCurrency(selectedAccount.currentBalance, selectedAccount.currencyCode)}
                  </div>
                </div>
              </div>

              {/* Comprehensive Citi Spec Properties */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs font-mono">
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500">DISPLAY NUMBER</div>
                  <div className="text-slate-200 font-semibold mt-1">{selectedAccount.accountDisplayNumber}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500">ROUTING BIC</div>
                  <div className="text-slate-200 font-semibold mt-1">{selectedAccount.routingBic}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500">INSTITUTION CODE</div>
                  <div className="text-slate-200 font-semibold mt-1">{selectedAccount.institutionCode}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500">MT LEDGER ID</div>
                  <div className="text-slate-200 font-semibold mt-1">{selectedAccount.modernTreasuryLedgerId}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500">REGULATION</div>
                  <div className="text-cyan-400 font-semibold mt-1">{selectedAccount.regulatoryJurisdiction}</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-slate-500">COMPLIANCE TIER</div>
                  <div className="text-[#E6CA65] font-semibold mt-1">{selectedAccount.complianceLevel}</div>
                </div>
              </div>

              {/* Modern Treasury Bridge Connection Status */}
              <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <Activity className="w-5 h-5 text-indigo-400" />
                  <div>
                    <div className="text-xs font-bold text-indigo-200">Modern Treasury Live Sync Active</div>
                    <div className="text-[11px] text-slate-400">
                      Real-time double-entry mirror configured with automatic transaction categorization.
                    </div>
                  </div>
                </div>
                <span className="px-2 py-1 text-[10px] font-mono rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/40">
                  HEALTH 100%
                </span>
              </div>

            </div>

            {/* Modal Footer */}
            <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
              <button
                onClick={() => setSelectedAccount(null)}
                className="px-5 py-2.5 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-all"
              >
                Close Inspector
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* DRAWER: AI LIQUIDITY ENGINE DRAWER                        */}
      {/* ========================================================= */}
      {isAiDrawerOpen && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-in fade-in">
          <div className="w-full max-w-xl bg-[#080D15] border-l border-[#E6CA65]/30 h-full p-6 sm:p-8 overflow-y-auto flex flex-col justify-between shadow-2xl">
            
            <div className="space-y-6">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-xl bg-[#E6CA65]/10 text-[#E6CA65] border border-[#E6CA65]/30">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h2 className="text-lg font-bold text-white">AI Neural Liquidity Matrix</h2>
                    <p className="text-xs text-slate-400">Citibank & MT 30-Day Projections</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAiDrawerOpen(false)}
                  className="p-2 rounded-lg bg-slate-800 text-slate-400 hover:text-white"
                >
                  ✕
                </button>
              </div>

              {/* High Probability Forecast Cards */}
              <div className="grid grid-cols-2 gap-3 font-mono">
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">PROJECTED 30D INFLOW</div>
                  <div className="text-lg font-bold text-emerald-400 mt-1">
                    {formatUSD(AI_FORECAST_DATA.projectedNetInflow)}
                  </div>
                </div>
                <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800">
                  <div className="text-[10px] text-slate-400">PROJECTED 30D OUTFLOW</div>
                  <div className="text-lg font-bold text-amber-400 mt-1">
                    {formatUSD(AI_FORECAST_DATA.projectedNetOutflow)}
                  </div>
                </div>
              </div>

              {/* Actionable AI Arbitrage Suggestion */}
              <div className="p-5 rounded-2xl bg-gradient-to-br from-[#121B2B] to-[#0A0F1A] border border-[#E6CA65]/30 space-y-4">
                <div className="flex items-center justify-between">
                  <span className="text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-[#E6CA65]/20 text-[#FFF8DC] font-bold">
                    RECOMMENDED TRANSACTION
                  </span>
                  <span className="text-xs font-mono text-emerald-400 font-bold">
                    +{AI_FORECAST_DATA.arbitrageYieldOpportunityBps} BPS ALPHA
                  </span>
                </div>

                <div className="space-y-2 text-xs">
                  <div className="flex justify-between text-slate-300 font-mono">
                    <span>Source Account:</span>
                    <span className="text-white font-bold">{AI_FORECAST_DATA.topOptimalMove.sourceAccountId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-mono">
                    <span>Target Yield Account:</span>
                    <span className="text-white font-bold">{AI_FORECAST_DATA.topOptimalMove.targetAccountId}</span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-mono">
                    <span>Sweep Amount:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatUSD(AI_FORECAST_DATA.topOptimalMove.suggestedTransferUSD)}
                    </span>
                  </div>
                  <div className="flex justify-between text-slate-300 font-mono">
                    <span>Annualized Yield Gain:</span>
                    <span className="text-[#E6CA65] font-bold">
                      +{formatUSD(AI_FORECAST_DATA.topOptimalMove.projectedYieldGainUSD)}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleExecuteAiSweep}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] to-[#B38F24] text-[#05070B] font-bold text-xs uppercase tracking-wider hover:opacity-95 transition-all flex items-center justify-center gap-2"
                >
                  <Zap className="w-4 h-4 fill-current" />
                  <span>Execute Automated Sweep</span>
                </button>
              </div>

              {/* Stress Testing Stats */}
              <div className="space-y-2">
                <div className="text-xs font-mono text-slate-400 uppercase">Monte Carlo Sovereign Stress Health</div>
                <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-400 w-[98.8%]" />
                </div>
                <div className="flex justify-between text-[11px] font-mono text-slate-500">
                  <span>Stress Test Vulnerability: 0.012%</span>
                  <span className="text-emerald-400">99.988% Immune</span>
                </div>
              </div>
            </div>

            <div className="pt-6 border-t border-slate-800">
              <button
                onClick={() => setIsAiDrawerOpen(false)}
                className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-800 text-slate-300 hover:text-white text-xs font-semibold"
              >
                Dismiss Intelligence Panel
              </button>
            </div>

          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: ISO 20022 / MT940 EXPORT MODAL                     */}
      {/* ========================================================= */}
      {isExportModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="w-full max-w-lg rounded-2xl bg-[#0A0F19] border border-slate-800 p-6 space-y-5">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Download className="w-4 h-4 text-[#E6CA65]" />
                <span>Export Sovereign Account Statement</span>
              </h3>
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <label className="block p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:border-[#E6CA65]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">ISO 20022 XML (camt.053.001.08)</div>
                  <span className="text-[10px] font-mono text-[#E6CA65]">Sovereign Standard</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Full end-of-day bank-to-customer statement for high-throughput ledgers.
                </div>
              </label>

              <label className="block p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:border-[#E6CA65]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">SWIFT MT940 Format</div>
                  <span className="text-[10px] font-mono text-cyan-400">Legacy Banking</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Standard structured statement suitable for institutional treasury workstations.
                </div>
              </label>

              <label className="block p-3 rounded-xl border border-slate-800 bg-slate-900/50 cursor-pointer hover:border-[#E6CA65]/50 transition-colors">
                <div className="flex items-center justify-between">
                  <div className="font-semibold text-white">JSON / Modern Treasury Ledger Export</div>
                  <span className="text-[10px] font-mono text-emerald-400">REST API Ready</span>
                </div>
                <div className="text-slate-400 text-[11px] mt-1">
                  Complete serialized Citibank GET / response data payload with cryptographic sign-off.
                </div>
              </label>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => setIsExportModalOpen(false)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:text-white"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  alert('Generating signed ISO 20022 cryptographic packet for all selected Citibank ledgers.');
                  setIsExportModalOpen(false);
                }}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-[#E6CA65] text-slate-950 font-bold hover:bg-[#D4AF37]"
              >
                Download Statement
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}