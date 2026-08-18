import React, { useState, useMemo, useEffect } from 'react';
import {
  Shield,
  TrendingUp,
  Sparkles,
  Cpu,
  Layers,
  Globe,
  Award,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  Scale,
  DollarSign,
  BarChart3,
  CheckCircle2,
  AlertTriangle,
  Zap,
  ChevronRight,
  PieChart,
  Send,
  Building2
} from 'lucide-react';

interface SecurityHolding {
  id: string;
  isin: string;
  cusip: string;
  name: string;
  assetClass: 'Sovereign Debt' | 'Perpetual Tier 1 CoCo' | 'Structured Yield Note' | 'Ultra-Cap Equity' | 'Global Sukuk';
  parValue: number;
  marketValue: number;
  unrealizedGainLoss: number;
  unrealizedGainLossPct: number;
  couponRate: number;
  couponFrequency: 'Annual' | 'Semi-Annual' | 'Quarterly' | 'Monthly' | 'Zero Coupon';
  ytm: number;
  maturityDate: string;
  ratings: {
    sp: string;
    moodys: string;
    crisil: string;
    fitch: string;
  };
  aiRecommendation: {
    action: 'HARVEST_TAX_LOSS' | 'HOLD_FOR_PAR' | 'CONVEXITY_OVERWEIGHT' | 'LIQUIDATE_PRE_COUPON';
    confidenceScore: number;
    projectedTaxAlphaBps: number;
    aiRationale: string;
  };
  modernTreasurySettlementRoute: string;
}

interface MutualFundHolding {
  id: string;
  folioNumber: string;
  fundName: string;
  fundClass: string;
  isin: string;
  units: number;
  navPerUnit: number;
  marketValue: number;
  costBasis: number;
  unrealizedGain: number;
  expenseRatio: number;
  aumTier: string;
  dividendReinvestment: boolean;
  ratings: {
    morningstar: string;
    crisil: string;
    citiQuantScore: string;
  };
  aiRebalanceTargetDeltaPct: number;
}

interface BrokerageAccountSummary {
  accountNumber: string;
  accountType: string;
  custodian: string;
  clearingHouse: string;
  totalMarketValue: number;
  totalUnrealizedGains: number;
  marginFacilityLimit: number;
  availableCashSweep: number;
  modernTreasuryLedgerId: string;
  sovereignCollateralPledged: number;
}

export const ImperialSecuritiesBrokerageAI: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'brokerage' | 'mutual_funds' | 'ai_convexity' | 'settlement'>('brokerage');
  const [selectedAssetClass, setSelectedAssetClass] = useState<string>('ALL');
  const [harvestingModalOpen, setHarvestingModalOpen] = useState<boolean>(false);
  const [selectedHolding, setSelectedHolding] = useState<SecurityHolding | null>(null);
  const [isExecutingAiReroute, setIsExecutingAiReroute] = useState<boolean>(false);
  const [executionLog, setExecutionLog] = useState<string[]>([]);
  const [quantumHarvestWeight, setQuantumHarvestWeight] = useState<number>(75);

  const accountSummary: BrokerageAccountSummary = {
    accountNumber: "CITI-IMP-SEC-009841-X9",
    accountType: "Citi Sovereign Tier-1 Discretionary Custody & Brokerage",
    custodian: "Citibank N.A. London / Zurich Global Custodial Depository",
    clearingHouse: "Euroclear / DTCC / Clearstream Ultra-Fast Fedwire Interconnect",
    totalMarketValue: 842914800.50,
    totalUnrealizedGains: 78419200.12,
    marginFacilityLimit: 250000000.00,
    availableCashSweep: 42108920.80,
    modernTreasuryLedgerId: "led_citi_sovereign_9941a87bf00",
    sovereignCollateralPledged: 150000000.00
  };

  const securitiesHoldings: SecurityHolding[] = [
    {
      id: 'SEC-001',
      isin: 'US912810TL67',
      cusip: '912810TL6',
      name: 'US Treasury Sovereign Bond 4.250% 2054',
      assetClass: 'Sovereign Debt',
      parValue: 120000000,
      marketValue: 124840000,
      unrealizedGainLoss: 4840000,
      unrealizedGainLossPct: 4.03,
      couponRate: 4.25,
      couponFrequency: 'Semi-Annual',
      ytm: 4.18,
      maturityDate: '2054-02-15',
      ratings: { sp: 'AA+', moodys: 'Aaa', crisil: 'AAA/Stable', fitch: 'AA+' },
      aiRecommendation: {
        action: 'CONVEXITY_OVERWEIGHT',
        confidenceScore: 98.4,
        projectedTaxAlphaBps: 42,
        aiRationale: 'Citi Ultra-Yield Predictive Engine forecasts long-duration steepening. Retain for apex yield carry and institutional repo collateralization.'
      },
      modernTreasurySettlementRoute: 'MT_FEDWIRE_DIRECT_FEDNOW_001'
    },
    {
      id: 'SEC-002',
      isin: 'XS2408389445',
      cusip: 'N/A-EUROCLEAR',
      name: 'Kingdom of Saudi Arabia Sovereign Sukuk 5.250% 2038',
      assetClass: 'Global Sukuk',
      parValue: 85000000,
      marketValue: 89620000,
      unrealizedGainLoss: 4620000,
      unrealizedGainLossPct: 5.43,
      couponRate: 5.25,
      couponFrequency: 'Semi-Annual',
      ytm: 4.88,
      maturityDate: '2038-10-24',
      ratings: { sp: 'A', moodys: 'A1', crisil: 'AAA-Equivalent', fitch: 'A+' },
      aiRecommendation: {
        action: 'HOLD_FOR_PAR',
        confidenceScore: 94.2,
        projectedTaxAlphaBps: 28,
        aiRationale: 'Optimal high-grade spread compression; non-correlated sovereign resilience matrix intact.'
      },
      modernTreasurySettlementRoute: 'MT_EUROCLEAR_RTGS_DIRECT'
    },
    {
      id: 'SEC-003',
      isin: 'CH0498721124',
      cusip: 'CH04987211',
      name: 'UBS Group Tier-1 Perpetual CoCo (Reset 7.000%)',
      assetClass: 'Perpetual Tier 1 CoCo',
      parValue: 50000000,
      marketValue: 47850000,
      unrealizedGainLoss: -2150000,
      unrealizedGainLossPct: -4.30,
      couponRate: 7.00,
      couponFrequency: 'Quarterly',
      ytm: 7.45,
      maturityDate: 'Perpetual Callable 2029',
      ratings: { sp: 'BBB+', moodys: 'Baa2', crisil: 'AA+', fitch: 'A-' },
      aiRecommendation: {
        action: 'HARVEST_TAX_LOSS',
        confidenceScore: 99.1,
        projectedTaxAlphaBps: 115,
        aiRationale: 'Synthetically harvest $2.15M loss to neutralize Q3 Sovereign Realized Alpha, instant replacement with Barclays Tier 1 Equivalent via Modern Treasury.'
      },
      modernTreasurySettlementRoute: 'MT_SWISS_SIX_CLEARING_09'
    },
    {
      id: 'SEC-004',
      isin: 'XS2778401929',
      cusip: 'X27784019',
      name: 'Republic of Singapore Ultra-Green Sovereign 3.875% 2072',
      assetClass: 'Sovereign Debt',
      parValue: 95000000,
      marketValue: 104200000,
      unrealizedGainLoss: 9200000,
      unrealizedGainLossPct: 9.68,
      couponRate: 3.875,
      couponFrequency: 'Annual',
      ytm: 3.62,
      maturityDate: '2072-08-01',
      ratings: { sp: 'AAA', moodys: 'Aaa', crisil: 'AAA/Imperial', fitch: 'AAA' },
      aiRecommendation: {
        action: 'CONVEXITY_OVERWEIGHT',
        confidenceScore: 97.8,
        projectedTaxAlphaBps: 64,
        aiRationale: 'Ultra-rare long-dated ESG AAA sovereign instrument. High synthetic scarcity premium over global sovereign benchmarks.'
      },
      modernTreasurySettlementRoute: 'MT_MAS_MEPS_PLUS_INSTANT'
    },
    {
      id: 'SEC-005',
      isin: 'US0846707026',
      cusip: '084670702',
      name: 'Berkshire Hathaway Inc 4.800% 2052 Structured Class A Note',
      assetClass: 'Structured Yield Note',
      parValue: 60000000,
      marketValue: 63780000,
      unrealizedGainLoss: 3780000,
      unrealizedGainLossPct: 6.30,
      couponRate: 4.80,
      couponFrequency: 'Semi-Annual',
      ytm: 4.55,
      maturityDate: '2052-05-15',
      ratings: { sp: 'AA', moodys: 'Aa2', crisil: 'AAA/Stable', fitch: 'AA' },
      aiRecommendation: {
        action: 'HOLD_FOR_PAR',
        confidenceScore: 91.5,
        projectedTaxAlphaBps: 18,
        aiRationale: 'Fortress balance sheet credit with embedded liquidity yield enhancer.'
      },
      modernTreasurySettlementRoute: 'MT_DTCC_INSTANT_DELIVERY_VS_PAYMENT'
    }
  ];

  const mutualFundHoldings: MutualFundHolding[] = [
    {
      id: 'MF-001',
      folioNumber: 'CITI-MF-ZUR-8839210',
      fundName: 'Citibank Global Prime Institutional Ultra-Liquidity Class Premier',
      fundClass: 'Super Institutional Accumulation',
      isin: 'LU2491028301',
      units: 4500000,
      navPerUnit: 44.8210,
      marketValue: 201694500.00,
      costBasis: 195000000.00,
      unrealizedGain: 6694500.00,
      expenseRatio: 0.12,
      aumTier: 'Sovereign Anchor ($10B+)',
      dividendReinvestment: true,
      ratings: { morningstar: '5 Stars ★★★★★', crisil: 'CRISIL Rank 1', citiQuantScore: '99.8/100' },
      aiRebalanceTargetDeltaPct: +2.5
    },
    {
      id: 'MF-002',
      folioNumber: 'CITI-MF-NYC-5510294',
      fundName: 'BlackRock Sovereign AI & High-Convexity Quantum Growth Fund',
      fundClass: 'Class Sovereign Z-Institutional',
      isin: 'US0928109923',
      units: 1250000,
      navPerUnit: 168.7420,
      marketValue: 210927500.50,
      costBasis: 164000000.00,
      unrealizedGain: 46927500.50,
      expenseRatio: 0.28,
      aumTier: 'Apex Alpha Tier',
      dividendReinvestment: true,
      ratings: { morningstar: '5 Stars ★★★★★', crisil: 'AAA-MFR', citiQuantScore: '100.0/100' },
      aiRebalanceTargetDeltaPct: -1.2
    }
  ];

  const filteredSecurities = useMemo(() => {
    if (selectedAssetClass === 'ALL') return securitiesHoldings;
    return securitiesHoldings.filter(s => s.assetClass === selectedAssetClass);
  }, [selectedAssetClass]);

  const handleExecuteAiHarvest = (holding: SecurityHolding) => {
    setSelectedHolding(holding);
    setHarvestingModalOpen(true);
    setExecutionLog([
      `[00:00.01] Initiating Quantum Tax-Alpha Harvest on ${holding.isin}...`,
      `[00:00.04] Citibank AI Ledger synchronized with Modern Treasury ID: ${accountSummary.modernTreasuryLedgerId}`,
      `[00:00.08] Querying CRISIL / Moody / S&P composite risk vectors... Optimal parity verified.`,
      `[00:00.12] Ready for instant atomic DVP settlement.`
    ]);
  };

  const runQuantumExecution = () => {
    setIsExecutingAiReroute(true);
    setTimeout(() => {
      setExecutionLog(prev => [
        ...prev,
        `[00:00.45] Executing atomic sell order of ${selectedHolding?.isin} for exact par liquidation...`,
        `[00:00.90] Modern Treasury Rail: Dispatched via ${selectedHolding?.modernTreasurySettlementRoute}`,
        `[00:01.32] Automated instant repurchase into matched duration hedge (Yield Delta: +14 bps)`,
        `[00:01.80] Harvest complete. Estimated Sovereign Tax Alpha Realized: $${((Math.abs(selectedHolding?.unrealizedGainLoss || 0) * (quantumHarvestWeight / 100)) * 0.37).toLocaleString(undefined, { maximumFractionDigits: 2 })}`,
        `[00:02.10] Citibank Custody Statement updated with cryptographic seal.`
      ]);
      setIsExecutingAiReroute(false);
    }, 2200);
  };

  return (
    <div className="min-h-screen bg-[#03060C] text-[#E2E8F0] p-6 lg:p-10 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Top Banner: Sovereign Status & Citi Crest */}
      <header className="mb-8 border-b border-[#D4AF37]/20 pb-6 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] flex items-center justify-center p-[2px] shadow-[0_0_20px_rgba(212,175,55,0.4)]">
              <div className="w-full h-full bg-[#070C16] rounded-[10px] flex items-center justify-center">
                <Building2 className="w-5 h-5 text-[#D4AF37]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs uppercase tracking-[0.3em] font-semibold text-[#D4AF37] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  CITIGROUP PRIVATE WEALTH
                </span>
                <span className="text-xs text-[#64748B] flex items-center gap-1">
                  <Shield className="w-3.5 h-3.5 text-emerald-400" /> Euroclear & DTCC Tier-1 Sovereign Custody
                </span>
              </div>
              <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3 mt-1">
                Imperial Securities Brokerage & Mutual Fund AI
                <span className="inline-flex items-center text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-1 rounded-full border border-emerald-500/40">
                  <Zap className="w-3 h-3 mr-1 fill-emerald-400" /> AI QUANTUM OPTIMIZER ACTIVE
                </span>
              </h1>
            </div>
          </div>
          <p className="text-sm text-[#94A3B8] max-w-3xl">
            Live institutional portfolio console parsing ISINs, coupon cadence, international rating scales (CRISIL, Moody's, S&P, Fitch), 
            and algorithmic unrealized alpha optimization powered by Modern Treasury real-time settlement rails.
          </p>
        </div>

        {/* Global Financial Pill */}
        <div className="flex flex-wrap items-center gap-3 bg-[#0A101D]/90 border border-[#1E293B] p-3 rounded-2xl backdrop-blur-xl shadow-2xl">
          <div className="px-4 py-2 bg-[#0F172A] rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Total Combined AUM</div>
            <div className="text-lg font-bold text-white font-mono">
              ${(accountSummary.totalMarketValue + mutualFundHoldings.reduce((a, b) => a + b.marketValue, 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
          <div className="px-4 py-2 bg-[#0F172A] rounded-xl border border-slate-800">
            <div className="text-[10px] uppercase font-mono text-slate-400 tracking-wider">Unrealized Net Gain</div>
            <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1">
              <TrendingUp className="w-4 h-4" />
              +${(accountSummary.totalUnrealizedGains + mutualFundHoldings.reduce((a, b) => a + b.unrealizedGain, 0)).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
          </div>
        </div>
      </header>

      {/* Account Master Summary Banner */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="relative overflow-hidden bg-gradient-to-b from-[#0E1726] to-[#080E18] border border-[#D4AF37]/30 p-5 rounded-2xl shadow-lg">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span>SECURITIES CUSTODY A/C</span>
            <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-xl font-bold font-mono text-white tracking-wide">{accountSummary.accountNumber}</div>
          <div className="text-xs text-slate-400 mt-2 flex items-center gap-1.5">
            <Award className="w-3.5 h-3.5 text-[#D4AF37]" />
            {accountSummary.custodian}
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-b from-[#0E1726] to-[#080E18] border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span>MODERN TREASURY LEDGER</span>
            <Layers className="w-3.5 h-3.5 text-blue-400" />
          </div>
          <div className="text-sm font-mono text-blue-300 truncate font-semibold">{accountSummary.modernTreasuryLedgerId}</div>
          <div className="text-xs text-emerald-400 mt-2 flex items-center gap-1 font-mono">
            <CheckCircle2 className="w-3.5 h-3.5" /> RTGS Instant Ledger Linked
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-b from-[#0E1726] to-[#080E18] border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span>MARGIN FACILITY & SWEEP</span>
            <DollarSign className="w-3.5 h-3.5 text-emerald-400" />
          </div>
          <div className="text-xl font-bold font-mono text-white">
            ${(accountSummary.marginFacilityLimit).toLocaleString()}
          </div>
          <div className="text-xs text-slate-400 mt-2">
            Available Cash Sweep: <span className="text-white font-mono">${(accountSummary.availableCashSweep).toLocaleString()}</span>
          </div>
        </div>

        <div className="relative overflow-hidden bg-gradient-to-b from-[#0E1726] to-[#080E18] border border-slate-800 p-5 rounded-2xl shadow-lg">
          <div className="flex justify-between items-center text-xs font-mono text-slate-400 mb-2">
            <span>AI TAX-LOSS HARVEST MATRIX</span>
            <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
          </div>
          <div className="text-xl font-bold font-mono text-[#D4AF37]">
            +$795,500.00
          </div>
          <div className="text-xs text-slate-400 mt-2 flex items-center justify-between">
            <span>AI Alpha Potential:</span>
            <span className="text-emerald-400 font-mono font-bold">+115 Bps Convexity</span>
          </div>
        </div>
      </section>

      {/* Navigation Tabs */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800 pb-4 mb-6">
        <div className="flex items-center gap-2 bg-[#0B111E] p-1.5 rounded-xl border border-slate-800/80">
          <button
            onClick={() => setActiveTab('brokerage')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'brokerage'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <BarChart3 className="w-4 h-4" />
            Securities Holdings ({securitiesHoldings.length})
          </button>
          <button
            onClick={() => setActiveTab('mutual_funds')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'mutual_funds'
                ? 'bg-gradient-to-r from-[#D4AF37] to-[#AA771C] text-black shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <PieChart className="w-4 h-4" />
            Mutual Fund Schemas ({mutualFundHoldings.length})
          </button>
          <button
            onClick={() => setActiveTab('ai_convexity')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'ai_convexity'
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Gains & Tax Harvesting Engine
          </button>
          <button
            onClick={() => setActiveTab('settlement')}
            className={`px-4 py-2 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeTab === 'settlement'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-600 text-white shadow-md font-bold'
                : 'text-slate-400 hover:text-white'
            }`}
          >
            <Layers className="w-4 h-4" />
            Modern Treasury Rails
          </button>
        </div>

        {activeTab === 'brokerage' && (
          <div className="flex items-center gap-2">
            <span className="text-xs font-mono text-slate-400">Class Filter:</span>
            {['ALL', 'Sovereign Debt', 'Global Sukuk', 'Perpetual Tier 1 CoCo', 'Structured Yield Note'].map((cls) => (
              <button
                key={cls}
                onClick={() => setSelectedAssetClass(cls)}
                className={`text-[11px] font-mono px-3 py-1.5 rounded-lg border transition-all ${
                  selectedAssetClass === cls
                    ? 'bg-[#1E293B] text-[#D4AF37] border-[#D4AF37]/50 font-bold'
                    : 'bg-[#080E18] text-slate-400 border-slate-800 hover:text-white'
                }`}
              >
                {cls}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Tab 1: Securities Holdings with ISINs, Ratings, and Coupons */}
      {activeTab === 'brokerage' && (
        <div className="space-y-6">
          <div className="overflow-x-auto rounded-2xl border border-slate-800 bg-[#070D18]/90 backdrop-blur-md shadow-2xl">
            <table className="w-full text-left text-xs font-sans">
              <thead className="bg-[#0D1626] uppercase font-mono text-[11px] text-slate-400 border-b border-slate-800">
                <tr>
                  <th className="py-4 px-4 font-semibold text-white">Asset & ISIN / CUSIP</th>
                  <th className="py-4 px-3 font-semibold">Credit Ratings (CRISIL / S&P / Moody)</th>
                  <th className="py-4 px-3 font-semibold">Coupon & YTM</th>
                  <th className="py-4 px-3 font-semibold">Maturity Date</th>
                  <th className="py-4 px-3 font-semibold text-right">Par Value</th>
                  <th className="py-4 px-3 font-semibold text-right">Market Value</th>
                  <th className="py-4 px-3 font-semibold text-right">Unrealized P&L</th>
                  <th className="py-4 px-4 font-semibold text-center">AI Alpha Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredSecurities.map((security) => (
                  <tr key={security.id} className="hover:bg-[#0E192D] transition-colors group">
                    {/* Security ISIN & Name */}
                    <td className="py-4 px-4">
                      <div className="font-sans font-bold text-sm text-white group-hover:text-[#D4AF37] transition-colors">
                        {security.name}
                      </div>
                      <div className="flex items-center gap-2 mt-1 font-mono text-[11px] text-slate-400">
                        <span className="bg-[#131F33] px-2 py-0.5 rounded text-amber-200/90 border border-amber-500/20">
                          ISIN: {security.isin}
                        </span>
                        <span className="text-slate-500">CUSIP: {security.cusip}</span>
                        <span className="text-[10px] text-blue-400 border border-blue-500/30 px-1.5 py-0.5 rounded">
                          {security.assetClass}
                        </span>
                      </div>
                    </td>

                    {/* Credit Ratings Badge */}
                    <td className="py-4 px-3">
                      <div className="flex flex-col gap-1">
                        <div className="flex items-center gap-1.5">
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-indigo-950 text-indigo-300 border border-indigo-700/50">
                            CRISIL: {security.ratings.crisil}
                          </span>
                          <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-blue-950 text-blue-300 border border-blue-700/50">
                            S&P: {security.ratings.sp}
                          </span>
                        </div>
                        <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                          <span>Moody's: {security.ratings.moodys}</span>
                          <span>•</span>
                          <span>Fitch: {security.ratings.fitch}</span>
                        </div>
                      </div>
                    </td>

                    {/* Coupon Frequency & Yield */}
                    <td className="py-4 px-3">
                      <div className="font-bold text-white text-sm">
                        {security.couponRate.toFixed(3)}% <span className="text-slate-400 text-xs font-normal">p.a.</span>
                      </div>
                      <div className="text-[11px] text-slate-400">
                        {security.couponFrequency} • <span className="text-emerald-400">YTM: {security.ytm}%</span>
                      </div>
                    </td>

                    {/* Maturity */}
                    <td className="py-4 px-3 text-slate-300 text-xs">
                      {security.maturityDate}
                    </td>

                    {/* Par Value */}
                    <td className="py-4 px-3 text-right font-medium text-slate-300">
                      ${security.parValue.toLocaleString()}
                    </td>

                    {/* Market Value */}
                    <td className="py-4 px-3 text-right font-bold text-white">
                      ${security.marketValue.toLocaleString()}
                    </td>

                    {/* Unrealized Gain/Loss */}
                    <td className="py-4 px-3 text-right">
                      <div className={`font-bold flex items-center justify-end gap-1 ${
                        security.unrealizedGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}>
                        {security.unrealizedGainLoss >= 0 ? (
                          <ArrowUpRight className="w-4 h-4" />
                        ) : (
                          <ArrowDownRight className="w-4 h-4" />
                        )}
                        ${Math.abs(security.unrealizedGainLoss).toLocaleString()}
                      </div>
                      <div className={`text-[10px] ${
                        security.unrealizedGainLoss >= 0 ? 'text-emerald-500' : 'text-rose-500'
                      }`}>
                        {security.unrealizedGainLoss >= 0 ? '+' : ''}{security.unrealizedGainLossPct.toFixed(2)}%
                      </div>
                    </td>

                    {/* AI Action */}
                    <td className="py-4 px-4 text-center">
                      <button
                        onClick={() => handleExecuteAiHarvest(security)}
                        className={`text-[11px] font-sans font-bold px-3 py-1.5 rounded-xl border transition-all flex items-center gap-1.5 mx-auto ${
                          security.aiRecommendation.action === 'HARVEST_TAX_LOSS'
                            ? 'bg-rose-950/80 hover:bg-rose-900 text-rose-300 border-rose-600/50 animate-pulse'
                            : security.aiRecommendation.action === 'CONVEXITY_OVERWEIGHT'
                            ? 'bg-emerald-950/80 hover:bg-emerald-900 text-emerald-300 border-emerald-600/50'
                            : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
                        }`}
                      >
                        <Sparkles className="w-3.5 h-3.5" />
                        {security.aiRecommendation.action.replace(/_/g, ' ')}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Tab 2: Mutual Fund Schemas */}
      {activeTab === 'mutual_funds' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {mutualFundHoldings.map((mf) => (
              <div key={mf.id} className="bg-gradient-to-b from-[#0D1526] to-[#070D18] border border-slate-800 hover:border-[#D4AF37]/50 transition-all rounded-3xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 transform translate-x-4 -translate-y-4 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl" />
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <span className="text-[10px] uppercase font-mono tracking-widest bg-blue-950/60 text-blue-400 border border-blue-700/40 px-2 py-0.5 rounded">
                      FOLIO: {mf.folioNumber}
                    </span>
                    <h3 className="text-lg font-bold text-white mt-1 font-sans">{mf.fundName}</h3>
                    <p className="text-xs text-slate-400">{mf.fundClass} • ISIN: {mf.isin}</p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono text-emerald-400 font-bold bg-emerald-950/70 border border-emerald-600/40 px-2.5 py-1 rounded-full">
                      {mf.ratings.citiQuantScore}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3 my-5 p-4 bg-[#050912]/80 border border-slate-800/80 rounded-2xl font-mono text-xs">
                  <div>
                    <span className="text-slate-500 uppercase text-[10px]">NAV / Unit</span>
                    <div className="text-white font-bold text-sm mt-0.5">${mf.navPerUnit.toFixed(4)}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px]">Held Units</span>
                    <div className="text-white font-bold text-sm mt-0.5">{mf.units.toLocaleString()}</div>
                  </div>
                  <div>
                    <span className="text-slate-500 uppercase text-[10px]">Expense Ratio</span>
                    <div className="text-amber-400 font-bold text-sm mt-0.5">{mf.expenseRatio}%</div>
                  </div>
                </div>

                <div className="flex justify-between items-center border-t border-slate-800/80 pt-4 font-mono">
                  <div>
                    <span className="text-xs text-slate-400">Total Valuation:</span>
                    <div className="text-xl font-bold text-white">
                      ${mf.marketValue.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-slate-400">Unrealized Gain:</span>
                    <div className="text-base font-bold text-emerald-400 flex items-center justify-end gap-1">
                      <TrendingUp className="w-4 h-4" />
                      +${mf.unrealizedGain.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </div>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                  <span className="flex items-center gap-1.5">
                    <Award className="w-4 h-4 text-[#D4AF37]" /> {mf.ratings.crisil} • {mf.ratings.morningstar}
                  </span>
                  <span className="text-blue-400 font-mono">
                    AI Rebalance Target: <strong className="text-white">{mf.aiRebalanceTargetDeltaPct > 0 ? `+${mf.aiRebalanceTargetDeltaPct}%` : `${mf.aiRebalanceTargetDeltaPct}%`}</strong>
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Tab 3: AI Gains & Convexity Optimization Console */}
      {activeTab === 'ai_convexity' && (
        <div className="bg-[#070D18] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-8">
          <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
            <div>
              <div className="flex items-center gap-2 text-[#D4AF37] font-mono text-xs uppercase tracking-widest">
                <Sparkles className="w-4 h-4" />
                Citibank AI Unrealized Gains & Convexity Rebalancing Core
              </div>
              <h2 className="text-2xl font-bold text-white mt-1">Autonomous Tax-Alpha & Duration Convexity Optimizer</h2>
              <p className="text-sm text-slate-400 mt-1 max-w-3xl">
                Continuous neural evaluation of macro yield curves against high-net-worth portfolio tax-loss harvesting pools, automated cross-asset swaps, and Modern Treasury instant settlement routing.
              </p>
            </div>
            <div className="bg-[#0B1322] border border-blue-500/30 p-4 rounded-2xl font-mono text-center">
              <span className="text-xs text-blue-400 uppercase">Est. Annual Tax Alpha</span>
              <div className="text-2xl font-bold text-white mt-0.5">+$1,420,800.00</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="bg-[#091120] border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-purple-950/80 border border-purple-600/40 text-purple-400">
                  <Sliders className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Synthetic Yield Harvesting</h4>
                  <p className="text-xs text-slate-400">Loss offset against capital gains</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Automatically flags CoCo perpetual and subordinated credit unrealized drawdowns. Replaces positions within 400ms without violating IRS wash-sale rules via alternate sovereign proxies.
              </p>
            </div>

            <div className="bg-[#091120] border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-emerald-950/80 border border-emerald-600/40 text-emerald-400">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Duration Convexity Matching</h4>
                  <p className="text-xs text-slate-400">Macro rate curve immunizer</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Weights long-duration Singapore Sovereign Green & US Treasury 30Y notes against dynamic inversion parameters to guarantee positive convexity and cash flow certainty.
              </p>
            </div>

            <div className="bg-[#091120] border border-slate-800 p-5 rounded-2xl">
              <div className="flex items-center gap-3 mb-3">
                <div className="p-2.5 rounded-xl bg-amber-950/80 border border-amber-600/40 text-amber-400">
                  <Globe className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-bold text-white text-sm">Multi-Jurisdiction Ratings Radar</h4>
                  <p className="text-xs text-slate-400">CRISIL, S&P, Moody's, Fitch</p>
                </div>
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                Parses live downgrades/upgrades across sovereign and quasi-sovereign desks. Dispatches real-time re-allocation instructions to custodian clearing hubs.
              </p>
            </div>
          </div>

          <div className="p-6 bg-gradient-to-r from-[#0C1527] to-[#080F1E] border border-slate-800 rounded-2xl flex flex-col lg:flex-row items-center justify-between gap-6">
            <div className="space-y-1">
              <h4 className="text-base font-bold text-white flex items-center gap-2">
                <Zap className="w-4 h-4 text-[#D4AF37]" /> Global Rebalance Execution Protocol
              </h4>
              <p className="text-xs text-slate-400">
                Execute algorithmic tax-loss harvesting & coupon cash sweep reinvestment across DTCC, Euroclear, and Modern Treasury Ledgers.
              </p>
            </div>
            <button
              onClick={() => handleExecuteAiHarvest(securitiesHoldings[2])}
              className="px-6 py-3 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] text-black font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(212,175,55,0.4)] transition-all flex items-center gap-2 shrink-0"
            >
              <Sparkles className="w-4 h-4" /> Trigger Automated Loss Harvesting ($2.15M)
            </button>
          </div>
        </div>
      )}

      {/* Tab 4: Modern Treasury Settlement Rails */}
      {activeTab === 'settlement' && (
        <div className="bg-[#070D18] border border-slate-800 rounded-3xl p-8 shadow-2xl space-y-6">
          <div className="flex justify-between items-center border-b border-slate-800 pb-5">
            <div>
              <span className="text-xs font-mono text-emerald-400 uppercase tracking-wider">MODERN TREASURY INTERCONNECT</span>
              <h3 className="text-xl font-bold text-white mt-0.5">Real-Time Gross Settlement & Ledger Orchestration</h3>
            </div>
            <div className="flex items-center gap-2 font-mono text-xs text-slate-400">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              Direct Fedwire / FedNow / RTGS Live
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <h4 className="text-xs uppercase font-mono text-slate-400">Active Modern Treasury Ledger Endpoints</h4>
              
              <div className="p-4 bg-[#0A111F] border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <div className="flex justify-between">
                  <span className="text-slate-400">Ledger ID:</span>
                  <span className="text-white font-bold">{accountSummary.modernTreasuryLedgerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Currency:</span>
                  <span className="text-emerald-400 font-bold">USD / EUR / SGD / CHF Multi-Currency Sweep</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">DVP Settlement Speed:</span>
                  <span className="text-blue-400">Instant (Sub-400ms Cryptographic Finality)</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-slate-400">Custodial Counterparty:</span>
                  <span className="text-amber-400">Citibank London Prime Vaults</span>
                </div>
              </div>

              <div className="p-4 bg-[#0A111F] border border-slate-800 rounded-xl space-y-2 font-mono text-xs">
                <div className="text-xs font-bold text-white uppercase tracking-wider mb-1">Modern Treasury Rails Routing:</div>
                <ul className="space-y-1.5 text-slate-300">
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>MT_FEDWIRE_DIRECT_FEDNOW_001</strong> - Primary US Sovereign Debt Rail</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>MT_EUROCLEAR_RTGS_DIRECT</strong> - EMEA Sovereign & Sukuk Clearance</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                    <span><strong>MT_MAS_MEPS_PLUS_INSTANT</strong> - APAC Green Bond Corridor</span>
                  </li>
                </ul>
              </div>
            </div>

            <div className="p-6 bg-[#040811] border border-slate-800/80 rounded-2xl flex flex-col justify-between">
              <div>
                <div className="text-xs font-mono uppercase text-slate-400 mb-1">Automated Cash Sweep Protocol</div>
                <h4 className="text-lg font-bold text-white mb-3">Citibank ↔ Modern Treasury Quantum Rebalancer</h4>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  Surplus coupon disbursements are instantly swept into AAA-rated sovereign liquidity funds with daily accrued dividends, maintaining zero drag and sub-second margin availability.
                </p>
              </div>
              <div className="p-3 bg-[#0B1424] border border-slate-800 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-mono text-slate-400">Current Yield on Cash Sweep</span>
                  <div className="text-base font-bold text-emerald-400 font-mono">5.28% APY Net Institutional</div>
                </div>
                <button className="px-3 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-bold transition-all">
                  Configure Rails
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Modal / Action Drawer for AI Unrealized Gain / Tax Alpha Harvesting */}
      {harvestingModalOpen && selectedHolding && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#080E1A] border border-[#D4AF37]/50 w-full max-w-3xl rounded-3xl p-6 lg:p-8 shadow-[0_0_50px_rgba(212,175,55,0.2)] relative">
            <div className="flex justify-between items-start pb-4 border-b border-slate-800">
              <div>
                <span className="text-[11px] font-mono uppercase text-[#D4AF37] tracking-widest flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> CITIBANK AI HARVESTING CONSOLE
                </span>
                <h3 className="text-xl font-bold text-white mt-1">Execute Sovereign Tax-Alpha & Swap Protocol</h3>
                <p className="text-xs text-slate-400 mt-0.5">Asset: {selectedHolding.name} ({selectedHolding.isin})</p>
              </div>
              <button
                onClick={() => setHarvestingModalOpen(false)}
                className="text-slate-400 hover:text-white text-lg font-mono p-1"
              >
                ✕
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6 font-mono text-xs">
              <div className="p-3.5 bg-[#0D1627] border border-slate-800 rounded-xl">
                <span className="text-slate-500 uppercase text-[10px]">Current Unrealized</span>
                <div className={`text-base font-bold mt-1 ${selectedHolding.unrealizedGainLoss >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                  ${selectedHolding.unrealizedGainLoss.toLocaleString()} ({selectedHolding.unrealizedGainLossPct}%)
                </div>
              </div>
              <div className="p-3.5 bg-[#0D1627] border border-slate-800 rounded-xl">
                <span className="text-slate-500 uppercase text-[10px]">AI Action</span>
                <div className="text-base font-bold text-[#D4AF37] mt-1">
                  {selectedHolding.aiRecommendation.action.replace(/_/g, ' ')}
                </div>
              </div>
              <div className="p-3.5 bg-[#0D1627] border border-slate-800 rounded-xl">
                <span className="text-slate-500 uppercase text-[10px]">CRISIL / Moody Rating</span>
                <div className="text-base font-bold text-blue-300 mt-1">
                  {selectedHolding.ratings.crisil} • {selectedHolding.ratings.moodys}
                </div>
              </div>
            </div>

            <div className="mb-6 space-y-2">
              <div className="flex justify-between text-xs font-mono">
                <span className="text-slate-300">Execution Intensity / Rebalance Weight:</span>
                <span className="text-[#D4AF37] font-bold">{quantumHarvestWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                value={quantumHarvestWeight}
                onChange={(e) => setQuantumHarvestWeight(Number(e.target.value))}
                className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
              />
              <div className="flex justify-between text-[10px] font-mono text-slate-500">
                <span>Conservative Partial (10%)</span>
                <span>Maximum Sovereign Alpha (100%)</span>
              </div>
            </div>

            {/* Execution Telemetry Log */}
            <div className="bg-[#03060C] border border-slate-800 rounded-xl p-4 font-mono text-xs text-slate-300 h-40 overflow-y-auto space-y-1">
              <div className="text-slate-500 uppercase text-[10px] pb-1 border-b border-slate-900 flex items-center justify-between">
                <span>Atomic Modern Treasury Ledger Log</span>
                <span className="text-emerald-400">STATUS: READY</span>
              </div>
              {executionLog.map((log, index) => (
                <div key={index} className="leading-relaxed font-mono text-[11px] text-emerald-300/90">
                  {log}
                </div>
              ))}
            </div>

            <div className="flex items-center justify-end gap-3 mt-6 pt-4 border-t border-slate-800">
              <button
                onClick={() => setHarvestingModalOpen(false)}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 text-xs font-semibold hover:bg-slate-800 transition-all"
              >
                Dismiss
              </button>
              <button
                disabled={isExecutingAiReroute}
                onClick={runQuantumExecution}
                className="px-6 py-2.5 rounded-xl bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA771C] text-black text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-lg disabled:opacity-50 flex items-center gap-2"
              >
                {isExecutingAiReroute ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    Transacting via Modern Treasury...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black" />
                    Commit Execution Route
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Footer / Sovereign Disclosures */}
      <footer className="mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
        <div className="flex items-center gap-4">
          <span>CITIBANK N.A. WEALTH CUSTODY</span>
          <span>•</span>
          <span>CRISIL / S&P / MOODY'S VERIFIED</span>
          <span>•</span>
          <span>MODERN TREASURY LEDGERS ENABLED</span>
        </div>
        <div>
          SECURITIES BROKERAGE SCHEMA V9.4 - INSTITUTIONAL GRADE ENCRYPTION (AES-256)
        </div>
      </footer>
    </div>
  );
};

export default ImperialSecuritiesBrokerageAI;