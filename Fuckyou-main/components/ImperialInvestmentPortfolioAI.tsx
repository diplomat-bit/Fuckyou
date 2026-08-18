import React, { useState, useMemo, useEffect } from 'react';
import {
  TrendingUp,
  Shield,
  Award,
  Cpu,
  Gem,
  DollarSign,
  Sparkles,
  RefreshCw,
  BarChart3,
  ChevronRight,
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Globe,
  Lock,
  Zap,
  Sliders,
  Filter,
  CheckCircle2,
  Clock,
  Layers,
  Scale
} from 'lucide-react';

export interface InvestmentTransaction {
  id: string;
  referenceNumber: string;
  tradeDate: string;
  settlementDate: string;
  ticker: string;
  securityName: string;
  assetClass: 'Sovereign_Bond' | 'Private_Equity' | 'Tier1_Equities' | 'Structured_Note' | 'Gold_Derivative';
  exchange: 'NYSE' | 'LSE' | 'SIX_Swiss' | 'Citibank_Private_Desk' | 'Modern_Treasury_Prime';
  type: 'BUY' | 'SELL' | 'SYNTHETIC_SWAP' | 'COUPON_REINVEST';
  quantity: number;
  executionPrice: number;
  currentMarketPrice: number;
  totalCostBasis: number;
  currentValuation: number;
  unrealizedPnL: number;
  unrealizedPnLPercent: number;
  couponOrYieldPercent: number;
  maturityDate?: string;
  custodianEntity: string;
  settlementStatus: 'SETTLED' | 'CLEARING' | 'AI_OPTIMIZED_HOLD' | 'ESCROW_VERIFIED';
  aiForecast: {
    targetTwelveMonthPrice: number;
    projectedYieldAlpha: number;
    riskScore: number;
    arbitrageConfidence: number;
    recommendedAction: 'EXPAND_EXPOSURE' | 'STRATEGIC_HOLD' | 'SYSTEMIC_HARVEST' | 'AI_HEDGE';
    macroRationale: string;
  };
}

const INITIAL_PORTFOLIO_TRANSACTIONS: InvestmentTransaction[] = [
  {
    id: 'TX-CITI-99842-GLD',
    referenceNumber: 'CTI-MT-8839210-NV',
    tradeDate: '2025-02-18',
    settlementDate: '2025-02-20',
    ticker: 'CH-SWISS-100Y-SOV',
    securityName: 'Swiss Confederation Sovereign Gold-Collateralized 3.85% 2045',
    assetClass: 'Sovereign_Bond',
    exchange: 'SIX_Swiss',
    type: 'BUY',
    quantity: 500000,
    executionPrice: 104.25,
    currentMarketPrice: 108.60,
    totalCostBasis: 52125000,
    currentValuation: 54300000,
    unrealizedPnL: 2175000,
    unrealizedPnLPercent: 4.17,
    couponOrYieldPercent: 4.42,
    maturityDate: '2045-10-15',
    custodianEntity: 'Citibank Private Bank (Zurich Vaults)',
    settlementStatus: 'SETTLED',
    aiForecast: {
      targetTwelveMonthPrice: 114.80,
      projectedYieldAlpha: 1.84,
      riskScore: 9,
      arbitrageConfidence: 98.4,
      recommendedAction: 'EXPAND_EXPOSURE',
      macroRationale: 'AI identifies central bank reserve rebalancing into AAA gold-indexed instruments, driving yields 48bps above G10 baseline.'
    }
  },
  {
    id: 'TX-CITI-87421-PE',
    referenceNumber: 'CTI-MT-9041834-NV',
    tradeDate: '2025-02-22',
    settlementDate: '2025-02-25',
    ticker: 'NV-QUANT-AI-PRIME',
    securityName: 'NextGen Neuromorphic AI Compute Foundry Convertible Series AA',
    assetClass: 'Private_Equity',
    exchange: 'Modern_Treasury_Prime',
    type: 'BUY',
    quantity: 125000,
    executionPrice: 420.00,
    currentMarketPrice: 512.50,
    totalCostBasis: 52500000,
    currentValuation: 64062500,
    unrealizedPnL: 11562500,
    unrealizedPnLPercent: 22.02,
    couponOrYieldPercent: 14.80,
    maturityDate: '2029-06-30',
    custodianEntity: 'Modern Treasury Institutional Clearing',
    settlementStatus: 'SETTLED',
    aiForecast: {
      targetTwelveMonthPrice: 780.00,
      projectedYieldAlpha: 8.65,
      riskScore: 28,
      arbitrageConfidence: 94.2,
      recommendedAction: 'EXPAND_EXPOSURE',
      macroRationale: 'Proprietary patent clearance creates enterprise monopoly pricing power. Quantum inference margins projected +340% YoY.'
    }
  },
  {
    id: 'TX-CITI-76193-EQ',
    referenceNumber: 'CTI-MT-3810291-NV',
    tradeDate: '2025-02-24',
    settlementDate: '2025-02-26',
    ticker: 'BRK.A',
    securityName: 'Berkshire Hathaway Inc. Class A Common (Imperial Custody Alloc)',
    assetClass: 'Tier1_Equities',
    exchange: 'NYSE',
    type: 'BUY',
    quantity: 85,
    executionPrice: 618400.00,
    currentMarketPrice: 638900.00,
    totalCostBasis: 52564000,
    currentValuation: 54306500,
    unrealizedPnL: 1742500,
    unrealizedPnLPercent: 3.31,
    couponOrYieldPercent: 3.10,
    custodianEntity: 'Citibank Global Markets London',
    settlementStatus: 'SETTLED',
    aiForecast: {
      targetTwelveMonthPrice: 710000.00,
      projectedYieldAlpha: 2.15,
      riskScore: 12,
      arbitrageConfidence: 96.9,
      recommendedAction: 'STRATEGIC_HOLD',
      macroRationale: 'Unmatched insurance float optionality positioned perfectly for modern automated yield capture algorithms.'
    }
  },
  {
    id: 'TX-CITI-65201-SN',
    referenceNumber: 'CTI-MT-1940182-NV',
    tradeDate: '2025-02-27',
    settlementDate: '2025-03-01',
    ticker: 'CITI-IMPERIAL-YLD-VII',
    securityName: 'Citibank Prime Arbitrage Yield Enhanced Note (Dual Currency Callable)',
    assetClass: 'Structured_Note',
    exchange: 'Citibank_Private_Desk',
    type: 'BUY',
    quantity: 30000,
    executionPrice: 1000.00,
    currentMarketPrice: 1038.20,
    totalCostBasis: 30000000,
    currentValuation: 31146000,
    unrealizedPnL: 1146000,
    unrealizedPnLPercent: 3.82,
    couponOrYieldPercent: 11.25,
    maturityDate: '2027-12-31',
    custodianEntity: 'Citibank Geneva Vaults',
    settlementStatus: 'AI_OPTIMIZED_HOLD',
    aiForecast: {
      targetTwelveMonthPrice: 1090.00,
      projectedYieldAlpha: 5.40,
      riskScore: 19,
      arbitrageConfidence: 92.5,
      recommendedAction: 'EXPAND_EXPOSURE',
      macroRationale: 'High sovereign rate spread differential captures algorithmic variance in Tokyo and Frankfurt swap markets.'
    }
  },
  {
    id: 'TX-CITI-54312-GD',
    referenceNumber: 'CTI-MT-7718290-NV',
    tradeDate: '2025-02-28',
    settlementDate: '2025-03-02',
    ticker: 'XAU-IMP-PHYS-DERIV',
    securityName: 'London Bullion Physical Allocated 99.999% Fine Gold Sovereign Trust',
    assetClass: 'Gold_Derivative',
    exchange: 'LSE',
    type: 'BUY',
    quantity: 15000,
    executionPrice: 2880.00,
    currentMarketPrice: 3045.50,
    totalCostBasis: 43200000,
    currentValuation: 45682500,
    unrealizedPnL: 2482500,
    unrealizedPnLPercent: 5.75,
    couponOrYieldPercent: 2.85,
    custodianEntity: 'Citibank Singapore Gold Repository',
    settlementStatus: 'ESCROW_VERIFIED',
    aiForecast: {
      targetTwelveMonthPrice: 3450.00,
      projectedYieldAlpha: 4.10,
      riskScore: 6,
      arbitrageConfidence: 99.1,
      recommendedAction: 'EXPAND_EXPOSURE',
      macroRationale: 'Systemic flight to physical vaulted liquidity will trigger asymmetric upside re-rating across high net worth sovereign desks.'
    }
  }
];

export const ImperialInvestmentPortfolioAI: React.FC = () => {
  const [transactions, setTransactions] = useState<InvestmentTransaction[]>(INITIAL_PORTFOLIO_TRANSACTIONS);
  const [selectedFilter, setSelectedFilter] = useState<string>('ALL');
  const [aiEngineActive, setAiEngineActive] = useState<boolean>(true);
  const [selectedTx, setSelectedTx] = useState<InvestmentTransaction | null>(INITIAL_PORTFOLIO_TRANSACTIONS[0]);
  const [monteCarloHorizonYears, setMonteCarloHorizonYears] = useState<number>(10);
  const [simulatedYieldDrift, setSimulatedYieldDrift] = useState<number>(1.25);
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [telemetryPulse, setTelemetryPulse] = useState<number>(0);

  // Periodic Telemetry Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setTelemetryPulse((prev) => (prev + 1) % 100);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  // Filtered dataset
  const filteredTransactions = useMemo(() => {
    if (selectedFilter === 'ALL') return transactions;
    return transactions.filter((tx) => tx.assetClass === selectedFilter);
  }, [transactions, selectedFilter]);

  // Aggregate Portfolio Financials
  const portfolioAggregates = useMemo(() => {
    const totalCost = transactions.reduce((acc, tx) => acc + tx.totalCostBasis, 0);
    const totalValuation = transactions.reduce((acc, tx) => acc + tx.currentValuation, 0);
    const totalPnL = totalValuation - totalCost;
    const pnlPercent = (totalPnL / totalCost) * 100;
    const weightedYield =
      transactions.reduce((acc, tx) => acc + tx.couponOrYieldPercent * tx.currentValuation, 0) / totalValuation;
    const expectedAnnualCashflow = totalValuation * (weightedYield / 100);
    const aggregateAIAveragedAlpha =
      transactions.reduce((acc, tx) => acc + tx.aiForecast.projectedYieldAlpha, 0) / transactions.length;

    return {
      totalCost,
      totalValuation,
      totalPnL,
      pnlPercent,
      weightedYield,
      expectedAnnualCashflow,
      aggregateAIAveragedAlpha
    };
  }, [transactions]);

  // Monte Carlo AI Wealth Forecast Calculation
  const monteCarloForecast = useMemo(() => {
    const principal = portfolioAggregates.totalValuation;
    const baseRate = (portfolioAggregates.weightedYield + simulatedYieldDrift) / 100;
    const compounded = principal * Math.pow(1 + baseRate, monteCarloHorizonYears);
    const conservativeFloor = principal * Math.pow(1 + (baseRate * 0.72), monteCarloHorizonYears);
    const hyperExpansionCeiling = principal * Math.pow(1 + (baseRate * 1.38), monteCarloHorizonYears);

    return {
      projectedTerminalValue: compounded,
      conservativeFloor,
      hyperExpansionCeiling,
      netGeneratedWealth: compounded - principal
    };
  }, [portfolioAggregates, monteCarloHorizonYears, simulatedYieldDrift]);

  const handleSynthesizeRebalance = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setTransactions((prev) =>
        prev.map((tx) => {
          const deltaAlpha = (Math.random() * 0.35).toFixed(2);
          const priceBoost = tx.currentMarketPrice * (1 + (Math.random() * 0.015));
          const newMarketVal = priceBoost * tx.quantity;
          const newPnL = newMarketVal - tx.totalCostBasis;
          return {
            ...tx,
            currentMarketPrice: Number(priceBoost.toFixed(2)),
            currentValuation: Number(newMarketVal.toFixed(2)),
            unrealizedPnL: Number(newPnL.toFixed(2)),
            unrealizedPnLPercent: Number(((newPnL / tx.totalCostBasis) * 100).toFixed(2)),
            couponOrYieldPercent: Number((tx.couponOrYieldPercent + parseFloat(deltaAlpha) * 0.1).toFixed(2))
          };
        })
      );
      setIsSynthesizing(false);
    }, 1200);
  };

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatPrecisionUSD = (amount: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(amount);
  };

  return (
    <div className="min-h-screen bg-[#070709] text-zinc-100 font-sans p-4 sm:p-6 lg:p-10 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner: Citibank + Modern Treasury + AI Crown Header */}
      <header className="relative overflow-hidden rounded-3xl border border-amber-500/30 bg-gradient-to-br from-zinc-950 via-[#0e0d0c] to-zinc-900 p-8 shadow-[0_0_80px_-15px_rgba(212,175,55,0.18)] mb-8">
        <div className="absolute top-0 right-0 -mr-20 -mt-20 h-96 w-96 rounded-full bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-28 h-72 w-72 rounded-full bg-amber-400/5 blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-3">
            <div className="flex flex-wrap items-center gap-3">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-amber-500/10 text-amber-300 border border-amber-500/30">
                <Gem className="w-3.5 h-3.5 text-amber-400" />
                Citibank Sovereign Private Desk &times; Modern Treasury Prime
              </span>
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                <Activity className="w-3 h-3 animate-pulse" />
                Live Imperial Yield Oracle Online
              </span>
            </div>
            <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-amber-200 to-yellow-500">
              Imperial Investment Portfolio & Yield Matrix
            </h1>
            <p className="text-sm sm:text-base text-zinc-400 max-w-3xl leading-relaxed">
              Institutional-grade multi-asset transaction processor executing real-time sovereign yield discovery, 
              deep bond duration hedging, and neural Monte Carlo wealth expansion across global tier-one custodial vaults.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3 self-stretch xl:self-auto">
            <button
              onClick={handleSynthesizeRebalance}
              disabled={isSynthesizing}
              className="flex-1 xl:flex-none flex items-center justify-center gap-2.5 px-6 py-3.5 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-black font-bold text-sm tracking-wide shadow-lg shadow-amber-500/20 hover:shadow-amber-500/40 hover:brightness-110 active:scale-[0.98] transition-all disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isSynthesizing ? 'animate-spin' : ''}`} />
              {isSynthesizing ? 'Neural Synthesizing...' : 'Execute AI Multi-Asset Rebalance'}
            </button>

            <button
              onClick={() => setAiEngineActive(!aiEngineActive)}
              className={`flex items-center gap-2 px-5 py-3.5 rounded-2xl border text-sm font-semibold transition-all ${
                aiEngineActive
                  ? 'bg-amber-950/40 border-amber-500/50 text-amber-300 shadow-inner'
                  : 'bg-zinc-900/80 border-zinc-700 text-zinc-400 hover:text-zinc-200'
              }`}
            >
              <Cpu className="w-4 h-4 text-amber-400" />
              AI Yield Engine: {aiEngineActive ? 'ENGAGED' : 'STANDBY'}
            </button>
          </div>
        </div>

        {/* Global Key Metrix Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4 mt-8 pt-8 border-t border-amber-500/15">
          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Total Prime Valuation</div>
            <div className="text-xl sm:text-2xl font-black text-amber-200 mt-1 tracking-tight">
              {formatUSD(portfolioAggregates.totalValuation)}
            </div>
            <div className="text-[11px] text-emerald-400 font-medium mt-1 flex items-center gap-1">
              <ArrowUpRight className="w-3 h-3" />
              +{portfolioAggregates.pnlPercent.toFixed(2)}% Net Return
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Unrealized Capital Gain</div>
            <div className="text-xl sm:text-2xl font-black text-emerald-400 mt-1 tracking-tight">
              +{formatUSD(portfolioAggregates.totalPnL)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">
              Cost: {formatUSD(portfolioAggregates.totalCost)}
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Weighted Portfolio Yield</div>
            <div className="text-xl sm:text-2xl font-black text-amber-300 mt-1 tracking-tight">
              {portfolioAggregates.weightedYield.toFixed(2)}% <span className="text-xs text-amber-400/80 font-normal">p.a.</span>
            </div>
            <div className="text-[11px] text-amber-300/80 mt-1">
              SOFR + { (portfolioAggregates.weightedYield - 5.1).toFixed(2) }% Spread
            </div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Projected Annual Inflow</div>
            <div className="text-xl sm:text-2xl font-black text-amber-100 mt-1 tracking-tight">
              {formatUSD(portfolioAggregates.expectedAnnualCashflow)}
            </div>
            <div className="text-[11px] text-zinc-400 mt-1">Direct Vault Settlement</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">AI Alpha Acceleration</div>
            <div className="text-xl sm:text-2xl font-black text-yellow-400 mt-1 tracking-tight flex items-center gap-1">
              <Sparkles className="w-4 h-4 text-yellow-300" />
              +{portfolioAggregates.aggregateAIAveragedAlpha.toFixed(2)}%
            </div>
            <div className="text-[11px] text-emerald-400 mt-1">Alpha Above Benchmark</div>
          </div>

          <div className="p-4 rounded-2xl bg-black/40 border border-zinc-800/80">
            <div className="text-xs uppercase tracking-wider text-zinc-400 font-medium">Custody Depository</div>
            <div className="text-lg font-bold text-zinc-200 mt-1 truncate">
              Citi Zurich Vaults
            </div>
            <div className="text-[11px] text-amber-400 font-semibold mt-1 flex items-center gap-1">
              <Shield className="w-3 h-3" /> Tier 1 Sovereign Grade
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout: Left Matrix & Right AI Wealth Supercomputer */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left 8-Cols: Transaction Flow, Yield Analyzer, Asset List */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Filtering and Search Controls */}
          <div className="flex flex-wrap items-center justify-between gap-4 p-4 rounded-2xl bg-zinc-950/80 border border-zinc-800 backdrop-blur-md">
            <div className="flex items-center gap-2 overflow-x-auto pb-1 sm:pb-0">
              <span className="text-xs text-zinc-500 uppercase tracking-wider font-semibold mr-1 flex items-center gap-1">
                <Filter className="w-3.5 h-3.5" /> Filter:
              </span>
              {[
                { id: 'ALL', label: 'All Custodied Assets' },
                { id: 'Sovereign_Bond', label: 'Sovereign Bonds' },
                { id: 'Private_Equity', label: 'Private Equity' },
                { id: 'Tier1_Equities', label: 'Tier 1 Equities' },
                { id: 'Structured_Note', label: 'Structured Notes' },
                { id: 'Gold_Derivative', label: 'Physical Gold Derivatives' }
              ].map((filter) => (
                <button
                  key={filter.id}
                  onClick={() => setSelectedFilter(filter.id)}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition-all whitespace-nowrap ${
                    selectedFilter === filter.id
                      ? 'bg-amber-500 text-black shadow-md shadow-amber-500/20'
                      : 'bg-zinc-900 text-zinc-400 hover:text-zinc-200 hover:bg-zinc-800'
                  }`}
                >
                  {filter.label}
                </button>
              ))}
            </div>
            <div className="text-xs font-mono text-amber-400/90 flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping" />
              Pulse: {telemetryPulse} | Modern Treasury Bridge Active
            </div>
          </div>

          {/* Investment Transaction Ledger Cards */}
          <div className="space-y-4">
            {filteredTransactions.map((tx) => {
              const isSelected = selectedTx?.id === tx.id;
              return (
                <div
                  key={tx.id}
                  onClick={() => setSelectedTx(tx)}
                  className={`cursor-pointer rounded-2xl border transition-all duration-300 p-5 ${
                    isSelected
                      ? 'bg-gradient-to-r from-zinc-950 via-[#131211] to-zinc-900 border-amber-500/60 shadow-[0_0_30px_rgba(212,175,55,0.12)]'
                      : 'bg-zinc-950/60 border-zinc-800/80 hover:border-zinc-700 hover:bg-zinc-900/40'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 font-black text-sm">
                        {tx.ticker.slice(0, 4)}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="text-base font-bold text-zinc-100">{tx.securityName}</span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-800 text-amber-300/90 border border-zinc-700">
                            {tx.exchange}
                          </span>
                          <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-300 border border-emerald-500/20">
                            {tx.settlementStatus}
                          </span>
                        </div>
                        <div className="text-xs text-zinc-400 mt-1 flex flex-wrap items-center gap-x-3 gap-y-1">
                          <span>Ref: <span className="text-zinc-300 font-mono">{tx.referenceNumber}</span></span>
                          <span>Settled: {tx.settlementDate}</span>
                          <span>Custodian: <span className="text-amber-200/80">{tx.custodianEntity}</span></span>
                        </div>
                      </div>
                    </div>

                    <div className="flex sm:flex-col items-end justify-between sm:justify-center w-full sm:w-auto border-t sm:border-t-0 pt-3 sm:pt-0 border-zinc-800">
                      <div className="text-lg sm:text-xl font-extrabold text-amber-300 font-mono">
                        {formatUSD(tx.currentValuation)}
                      </div>
                      <div className="text-xs font-semibold text-emerald-400 flex items-center gap-1">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        +{formatUSD(tx.unrealizedPnL)} (+{tx.unrealizedPnLPercent}%)
                      </div>
                    </div>
                  </div>

                  {/* Yield & AI Arbitrage Bar */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-4 pt-4 border-t border-zinc-800/80 text-xs">
                    <div>
                      <div className="text-zinc-500 font-medium">Coupon / Effective Yield</div>
                      <div className="text-sm font-bold text-amber-400 mt-0.5">
                        {tx.couponOrYieldPercent.toFixed(2)}% APY
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 font-medium">Units Executed</div>
                      <div className="text-sm font-bold text-zinc-200 mt-0.5 font-mono">
                        {tx.quantity.toLocaleString()} @ {formatPrecisionUSD(tx.executionPrice)}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 font-medium">AI Target (12M)</div>
                      <div className="text-sm font-bold text-emerald-400 mt-0.5 font-mono">
                        {formatPrecisionUSD(tx.aiForecast.targetTwelveMonthPrice)}
                      </div>
                    </div>

                    <div>
                      <div className="text-zinc-500 font-medium">AI Recommendation</div>
                      <div className="text-sm font-extrabold text-amber-300 mt-0.5 flex items-center gap-1">
                        <Sparkles className="w-3 h-3 text-amber-400" />
                        {tx.aiForecast.recommendedAction.replace('_', ' ')}
                      </div>
                    </div>
                  </div>

                  {/* Micro AI Commentary Banner */}
                  {isSelected && (
                    <div className="mt-4 p-3.5 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-200/90 flex items-start gap-2.5 animate-fadeIn">
                      <Zap className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-amber-300 mr-1">Imperial Intelligence Rationale:</span>
                        {tx.aiForecast.macroRationale}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>

          {/* Institutional Bond Yield Matrix & Arbitrage Calculator */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-950 to-[#0e0d0c] border border-amber-500/30 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-amber-100">Live Fixed-Income & Sovereign Yield Arbitrage Grid</h2>
              </div>
              <span className="text-xs font-mono px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/20">
                NYSE & SIX Real-Time Feeds
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-zinc-800 text-zinc-400 uppercase tracking-wider font-semibold">
                    <th className="pb-3">Desk Instrument</th>
                    <th className="pb-3">Nominal Yield</th>
                    <th className="pb-3">Duration Risk</th>
                    <th className="pb-3">Modern Treasury Liquidity Vector</th>
                    <th className="pb-3 text-right">Spread vs Benchmark</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-zinc-800/60 font-mono">
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3 font-medium text-zinc-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Swiss Confed 3.85% 2045
                    </td>
                    <td className="py-3 text-amber-300 font-bold">4.42%</td>
                    <td className="py-3 text-zinc-300">AAA (Sovereign)</td>
                    <td className="py-3 text-emerald-400">Instant T+0 Vaulted Delivery</td>
                    <td className="py-3 text-right text-emerald-400">+148 bps</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3 font-medium text-zinc-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      Citibank Structured Arbitrage VII
                    </td>
                    <td className="py-3 text-amber-300 font-bold">11.25%</td>
                    <td className="py-3 text-zinc-300">A+ (Collateralized)</td>
                    <td className="py-3 text-emerald-400">Escrow Automated Settlement</td>
                    <td className="py-3 text-right text-emerald-400">+615 bps</td>
                  </tr>
                  <tr className="hover:bg-zinc-900/40">
                    <td className="py-3 font-medium text-zinc-200 flex items-center gap-2">
                      <span className="h-1.5 w-1.5 rounded-full bg-amber-400" />
                      US Sovereign 30Y Treasury Bond
                    </td>
                    <td className="py-3 text-amber-300 font-bold">4.65%</td>
                    <td className="py-3 text-zinc-300">AA+ (Federal Reserve)</td>
                    <td className="py-3 text-emerald-400">Fedwire Real-Time RTGS</td>
                    <td className="py-3 text-right text-zinc-400">PAR REF</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right 4-Cols: Imperial AI Predictive Supercomputer & Wealth Simulator */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* AI Wealth Monte Carlo Supercomputer */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-zinc-950 via-[#100f0d] to-black border border-amber-500/40 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-36 h-36 bg-amber-500/10 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-base font-extrabold text-amber-100">Imperial AI Wealth Oracle</h3>
                  <div className="text-[11px] text-zinc-400">Multi-Decade Neural Forecaster</div>
                </div>
              </div>
              <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30">
                Quantum v9
              </span>
            </div>

            {/* Parameter Sliders */}
            <div className="space-y-4 my-5 p-4 rounded-2xl bg-black/60 border border-zinc-800">
              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-zinc-400">Horizon Horizon Span</span>
                  <span className="text-amber-300 font-mono">{monteCarloHorizonYears} Years</span>
                </div>
                <input
                  type="range"
                  min={1}
                  max={30}
                  step={1}
                  value={monteCarloHorizonYears}
                  onChange={(e) => setMonteCarloHorizonYears(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-amber-400"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs font-semibold mb-1">
                  <span className="text-zinc-400">Simulated AI Alpha Drift</span>
                  <span className="text-emerald-400 font-mono">+{simulatedYieldDrift.toFixed(2)}%</span>
                </div>
                <input
                  type="range"
                  min={0.0}
                  max={5.0}
                  step={0.25}
                  value={simulatedYieldDrift}
                  onChange={(e) => setSimulatedYieldDrift(Number(e.target.value))}
                  className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-emerald-400"
                />
              </div>
            </div>

            {/* Forecast Projection Outcome Display */}
            <div className="space-y-3">
              <div className="p-4 rounded-2xl bg-gradient-to-r from-amber-500/10 via-yellow-500/5 to-transparent border border-amber-500/30">
                <div className="text-xs uppercase tracking-wider text-amber-300/80 font-bold">
                  Projected Terminal Wealth ({monteCarloHorizonYears}Y)
                </div>
                <div className="text-2xl sm:text-3xl font-black text-amber-100 font-mono mt-1">
                  {formatUSD(monteCarloForecast.projectedTerminalValue)}
                </div>
                <div className="text-xs font-semibold text-emerald-400 mt-1 flex items-center gap-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  +{formatUSD(monteCarloForecast.netGeneratedWealth)} Net Expansion
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-400">Conservative Floor</div>
                  <div className="font-mono font-bold text-zinc-200 mt-1">
                    {formatUSD(monteCarloForecast.conservativeFloor)}
                  </div>
                </div>

                <div className="p-3 rounded-xl bg-zinc-900/80 border border-zinc-800">
                  <div className="text-zinc-400">Hyper-Expansion Ceiling</div>
                  <div className="font-mono font-bold text-amber-300 mt-1">
                    {formatUSD(monteCarloForecast.hyperExpansionCeiling)}
                  </div>
                </div>
              </div>
            </div>

            {/* Trust & Custody Verification Block */}
            <div className="mt-6 pt-5 border-t border-zinc-800/80 space-y-2.5 text-xs text-zinc-400">
              <div className="flex items-center gap-2 text-zinc-300 font-semibold">
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                <span>Basel IV Capital Adequacy Compliance: 440%</span>
              </div>
              <div className="flex items-center gap-2">
                <Shield className="w-3.5 h-3.5 text-emerald-400" />
                <span>Citibank Zurich Vault Physical Allocation Verified</span>
              </div>
              <div className="flex items-center gap-2">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Modern Treasury Real-Time Wire Rails Active</span>
              </div>
            </div>
          </div>

          {/* Selected Transaction Deep Inspector */}
          {selectedTx && (
            <div className="p-6 rounded-3xl bg-zinc-950 border border-zinc-800 shadow-xl space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Layers className="w-4 h-4 text-amber-400" />
                  <h4 className="text-sm font-bold text-zinc-100">Deep Instrument Profile</h4>
                </div>
                <span className="text-[10px] font-mono font-bold text-amber-300 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                  {selectedTx.id}
                </span>
              </div>

              <div className="text-xs space-y-2.5">
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Asset Classification</span>
                  <span className="font-semibold text-zinc-200">{selectedTx.assetClass.replace('_', ' ')}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Primary Exchange</span>
                  <span className="font-semibold text-zinc-200">{selectedTx.exchange}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">Yield / Coupon Rate</span>
                  <span className="font-semibold text-amber-300">{selectedTx.couponOrYieldPercent}% p.a.</span>
                </div>
                {selectedTx.maturityDate && (
                  <div className="flex justify-between py-1 border-b border-zinc-800/60">
                    <span className="text-zinc-400">Maturity Horizon</span>
                    <span className="font-semibold text-zinc-200">{selectedTx.maturityDate}</span>
                  </div>
                )}
                <div className="flex justify-between py-1 border-b border-zinc-800/60">
                  <span className="text-zinc-400">AI Confidence Index</span>
                  <span className="font-semibold text-emerald-400 font-mono">
                    {selectedTx.aiForecast.arbitrageConfidence}%
                  </span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-zinc-400">Risk Variance Metric</span>
                  <span className="font-semibold text-amber-400 font-mono">
                    {selectedTx.aiForecast.riskScore} / 100
                  </span>
                </div>
              </div>

              <button className="w-full mt-2 py-3 rounded-xl bg-zinc-900 hover:bg-zinc-800 border border-zinc-700 text-xs font-bold text-amber-300 transition-all flex items-center justify-center gap-2">
                <span>Download Sovereign Escrow Certificate</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          )}

        </div>

      </div>

      {/* Footer / System Credentials */}
      <footer className="mt-12 pt-6 border-t border-zinc-900 flex flex-col sm:flex-row items-center justify-between text-xs text-zinc-500 gap-4">
        <div className="flex items-center gap-2">
          <Award className="w-4 h-4 text-amber-400" />
          <span>Citibank Institutional Wealth AI &bull; Modern Treasury Settlement Network</span>
        </div>
        <div className="font-mono text-zinc-600">
          SEC 17 CFR &bull; FINMA Sovereign Vault Tier-1 Verified &bull; Latency: 0.12ms
        </div>
      </footer>
    </div>
  );
};

export default ImperialInvestmentPortfolioAI;