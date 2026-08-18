import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Cpu, 
  Activity, 
  TrendingUp, 
  ShieldCheck, 
  Calendar, 
  Layers, 
  ArrowUpRight, 
  ArrowDownLeft, 
  RefreshCw, 
  Zap, 
  Lock, 
  Sparkles, 
  Sliders, 
  Database, 
  Globe, 
  Compass, 
  CheckCircle2, 
  AlertOctagon, 
  BarChart3, 
  FileSpreadsheet, 
  ChevronRight,
  Workflow
} from 'lucide-react';

interface TransactionRecord {
  id: string;
  citiReference: string;
  modernTreasuryLedgerId: string;
  timestamp: string;
  counterparty: string;
  jurisdiction: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'JPY' | 'SGD' | 'AED';
  direction: 'INFLOW' | 'OUTFLOW';
  clearingRail: 'CITI_VELOCITY_DIRECT' | 'FEDWIRE_SOVEREIGN' | 'CHIPS_TIER_0' | 'MODERN_TREASURY_QUANTUM';
  category: 'SOVEREIGN_DEBT_COUPON' | 'ENERGY_PETRO_SETTLEMENT' | 'CENTRAL_BANK_REPO' | 'AI_COMPUTE_INFRA_CAPEX' | 'STRATEGIC_EQUITY_BUY';
  quantumProbabilityCoherence: number;
  entangledYieldAlpha: number;
  status: 'SETTLED' | 'ORCHESTRATING' | 'RECONCILED';
}

interface QuantumForecastPoint {
  day: number;
  dateStr: string;
  deterministicProjection: number;
  quantumSuperpositionHigh: number;
  quantumSuperpositionLow: number;
  confidenceInterval: number;
  entropyScore: number;
}

interface SovereignMetricSummary {
  totalInflowVolume: number;
  totalOutflowVolume: number;
  netVelocityDelta: number;
  quantumYieldCaptureBps: number;
  decoherenceRiskFactor: number;
  liquidityRunwayDays: number;
  citiFedReserveRatio: number;
}

export const QuantumLimitedPeriodAnalyzer: React.FC = () => {
  // Horizon State: 7, 30, 60, 90, or 180 Days
  const [dayRange, setDayRange] = useState<number>(90);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'EUR' | 'ALL'>('ALL');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [coherenceIndex, setCoherenceIndex] = useState<number>(99.9874);
  const [selectedTransaction, setSelectedTransaction] = useState<TransactionRecord | null>(null);
  const [simulationShockActive, setSimulationShockActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'QUANTUM_SURFACE' | 'YIELD_TENSOR'>('LEDGER');

  // Generate deterministic pseudo-random datasets for given day range
  const transactions = useMemo<TransactionRecord[]>(() => {
    const rawList: TransactionRecord[] = [];
    const counterparties = [
      'Monetary Authority of Singapore (MAS)',
      'Abu Dhabi Investment Authority (ADIA)',
      'Citigroup Global Prime Treasury (London)',
      'Saudi Public Investment Fund (PIF)',
      'Bank of Japan Sovereign Reserve',
      'Modern Treasury Synthetic Settlement Node #409',
      'Swiss National Bank FX Liquidity Pool',
      'Norges Bank Investment Management'
    ];

    const categories: TransactionRecord['category'][] = [
      'SOVEREIGN_DEBT_COUPON',
      'ENERGY_PETRO_SETTLEMENT',
      'CENTRAL_BANK_REPO',
      'AI_COMPUTE_INFRA_CAPEX',
      'STRATEGIC_EQUITY_BUY'
    ];

    const rails: TransactionRecord['clearingRail'][] = [
      'CITI_VELOCITY_DIRECT',
      'FEDWIRE_SOVEREIGN',
      'CHIPS_TIER_0',
      'MODERN_TREASURY_QUANTUM'
    ];

    const currencies: TransactionRecord['currency'][] = ['USD', 'EUR', 'GBP', 'SGD', 'AED'];

    const count = Math.min(dayRange * 1.8, 120);
    const now = Date.now();

    for (let i = 0; i < count; i++) {
      const dayOffset = Math.floor((i / count) * dayRange);
      const txTime = new Date(now - dayOffset * 86400000 - (i % 24) * 3600000);
      const isOutflow = (i * 7 + 13) % 3 === 0;
      const baseAmount = ((i * 47) % 850 + 150) * 1_000_000;
      const curr = currencies[i % currencies.length];

      rawList.push({
        id: `TX-CITI-MT-Q${(100000 + i).toString()}`,
        citiReference: `CITI-NYC-SWIFT-${883900 + i}-XG`,
        modernTreasuryLedgerId: `mt_ledger_entry_0x${(i * 99991).toString(16).padStart(12, '0')}`,
        timestamp: txTime.toISOString(),
        counterparty: counterparties[i % counterparties.length],
        jurisdiction: ['US-NY', 'SG', 'AE-AZ', 'GB-LON', 'CH-ZH', 'NO-OSL'][i % 6],
        amount: isOutflow ? baseAmount : baseAmount * 1.45,
        currency: curr,
        direction: isOutflow ? 'OUTFLOW' : 'INFLOW',
        clearingRail: rails[i % rails.length],
        category: categories[i % categories.length],
        quantumProbabilityCoherence: 99.85 + ((i % 15) * 0.01),
        entangledYieldAlpha: +(1.4 + (i % 9) * 0.32).toFixed(2),
        status: i < 3 ? 'ORCHESTRATING' : (i % 8 === 0 ? 'RECONCILED' : 'SETTLED')
      });
    }

    return rawList;
  }, [dayRange]);

  // Compute Sovereign Portfolio Metrics
  const metrics = useMemo<SovereignMetricSummary>(() => {
    let inflow = 0;
    let outflow = 0;

    transactions.forEach(t => {
      if (selectedCurrency === 'ALL' || t.currency === selectedCurrency) {
        if (t.direction === 'INFLOW') inflow += t.amount;
        else outflow += t.amount;
      }
    });

    const net = inflow - outflow;
    const shockMultiplier = simulationShockActive ? 0.72 : 1.0;

    return {
      totalInflowVolume: inflow * shockMultiplier,
      totalOutflowVolume: outflow,
      netVelocityDelta: net * shockMultiplier,
      quantumYieldCaptureBps: (48.75 * (simulationShockActive ? 0.85 : 1.0)),
      decoherenceRiskFactor: simulationShockActive ? 0.084 : 0.0012,
      liquidityRunwayDays: Math.round((inflow / (outflow / dayRange)) * (simulationShockActive ? 0.6 : 1.0)),
      citiFedReserveRatio: 98.42
    };
  }, [transactions, selectedCurrency, simulationShockActive, dayRange]);

  // Generate Quantum Superposition Forecast Curves
  const forecastData = useMemo<QuantumForecastPoint[]>(() => {
    const points: QuantumForecastPoint[] = [];
    const steps = 30; // Next 30 days projection
    let runningDeterministic = metrics.netVelocityDelta / 1e9;

    for (let i = 1; i <= steps; i++) {
      const volatility = Math.sin(i * 0.45) * 0.85 + (i * 0.04);
      const quantumSpread = (Math.cos(i * 0.3) * 1.2 + 2.5) * (simulationShockActive ? 2.4 : 1.0);
      
      runningDeterministic += (metrics.netVelocityDelta > 0 ? 0.15 : -0.05) + (Math.sin(i) * 0.2);

      const d = new Date();
      d.setDate(d.getDate() + i);

      points.push({
        day: i,
        dateStr: d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
        deterministicProjection: +(runningDeterministic).toFixed(3),
        quantumSuperpositionHigh: +(runningDeterministic + quantumSpread + volatility).toFixed(3),
        quantumSuperpositionLow: +(runningDeterministic - quantumSpread - volatility).toFixed(3),
        confidenceInterval: +(99.94 - (i * 0.08)).toFixed(2),
        entropyScore: +(0.012 + (i * 0.004) * (simulationShockActive ? 3.5 : 1.0)).toFixed(4)
      });
    }
    return points;
  }, [metrics.netVelocityDelta, simulationShockActive]);

  // Dynamic quantum coherence tick
  useEffect(() => {
    const interval = setInterval(() => {
      setCoherenceIndex(prev => {
        const delta = (Math.random() - 0.5) * 0.003;
        return +(Math.min(99.999, Math.max(99.4, prev + delta))).toFixed(4);
      });
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const triggerQuantumRecomputation = useCallback(() => {
    setIsSynthesizing(true);
    setTimeout(() => {
      setIsSynthesizing(false);
    }, 1200);
  }, []);

  const formatBillion = (val: number) => {
    const b = val / 1_000_000_000;
    return `$${b.toLocaleString('en-US', { minimumFractionDigits: 3, maximumFractionDigits: 3 })}B`;
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-[#F3E5AB] font-sans antialiased selection:bg-[#D4AF37] selection:text-black p-4 sm:p-6 lg:p-10">
      
      {/* Top Banner: Sovereign Authority & Endpoint Signature */}
      <header className="relative border border-[#D4AF37]/30 bg-gradient-to-b from-[#121622]/90 via-[#0B0E14]/95 to-[#07090E] p-6 lg:p-8 rounded-2xl shadow-[0_0_50px_rgba(212,175,55,0.08)] mb-8 backdrop-blur-xl">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-2.5 py-1 text-[11px] font-mono tracking-widest uppercase bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.2)]">
                <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] animate-ping" />
                GET /limited/dayRange
              </span>
              <span className="px-2.5 py-1 text-[11px] font-mono tracking-widest uppercase bg-indigo-950/60 text-indigo-300 border border-indigo-500/30 rounded-full flex items-center gap-1">
                <Layers className="w-3 h-3 text-indigo-400" />
                Modern Treasury Dual Ledger
              </span>
              <span className="px-2.5 py-1 text-[11px] font-mono tracking-widest uppercase bg-amber-950/60 text-amber-300 border border-amber-500/30 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3 text-[#D4AF37]" />
                Citibank Global Tier-0 Direct
              </span>
            </div>

            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-[#FFFFFF] via-[#F3E5AB] to-[#D4AF37] bg-clip-text text-transparent">
              Quantum Limited-Period Day Range Analyzer
            </h1>
            <p className="text-sm lg:text-base text-[#E5E4E2]/70 max-w-3xl font-light">
              Sub-atomic liquidity reconciliation, ISO 20022 real-time message telemetry, and 90-day multi-currency cash flow velocity wavefunctions for Sovereign Wealth Funds.
            </p>
          </div>

          {/* Quick Actions & Live Telemetry Gauge */}
          <div className="flex flex-wrap items-center gap-3 self-stretch lg:self-auto justify-end">
            <div className="bg-[#0D111A] border border-[#D4AF37]/25 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <Cpu className="w-5 h-5 text-[#10B981] animate-spin" style={{ animationDuration: '9s' }} />
              <div>
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Q-Coherence Index</div>
                <div className="text-sm font-mono font-bold text-emerald-400">{coherenceIndex}% Ψ</div>
              </div>
            </div>

            <button 
              onClick={() => setSimulationShockActive(!simulationShockActive)}
              className={`px-4 py-2.5 rounded-xl font-mono text-xs tracking-wider transition-all flex items-center gap-2 border ${
                simulationShockActive 
                  ? 'bg-rose-950/80 border-rose-500/80 text-rose-200 shadow-[0_0_20px_rgba(244,63,94,0.4)]'
                  : 'bg-neutral-900/90 border-neutral-700 text-neutral-300 hover:border-[#D4AF37]/50'
              }`}
            >
              <AlertOctagon className="w-4 h-4 text-rose-400" />
              {simulationShockActive ? 'Discharge Black-Swan Shock' : 'Simulate Black-Swan Shock'}
            </button>

            <button 
              onClick={triggerQuantumRecomputation}
              disabled={isSynthesizing}
              className="relative group overflow-hidden px-5 py-2.5 rounded-xl font-mono text-xs font-semibold uppercase tracking-wider text-black bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] hover:brightness-110 active:scale-95 transition-all shadow-[0_0_25px_rgba(212,175,55,0.4)] flex items-center gap-2"
            >
              <RefreshCw className={`w-4 h-4 text-black ${isSynthesizing ? 'animate-spin' : ''}`} />
              {isSynthesizing ? 'Recalculating Tensors...' : 'Synthesize Range'}
            </button>
          </div>

        </div>

        {/* Dynamic Parameter Ribbon */}
        <div className="mt-6 pt-6 border-t border-neutral-800/80 flex flex-wrap items-center justify-between gap-4 text-xs font-mono">
          <div className="flex items-center gap-3">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Calendar className="w-4 h-4 text-[#D4AF37]" /> Select Temporal Horizon:
            </span>
            <div className="inline-flex rounded-lg bg-neutral-950 p-1 border border-neutral-800">
              {[7, 30, 60, 90, 180].map((days) => (
                <button
                  key={days}
                  onClick={() => setDayRange(days)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    dayRange === days 
                      ? 'bg-[#D4AF37] text-black font-bold shadow-[0_0_12px_rgba(212,175,55,0.4)]' 
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {days}D
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-3">
            <span className="text-neutral-400 flex items-center gap-1.5">
              <Sliders className="w-4 h-4 text-[#D4AF37]" /> Currency Rail:
            </span>
            <div className="inline-flex rounded-lg bg-neutral-950 p-1 border border-neutral-800">
              {(['ALL', 'USD', 'EUR'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-3 py-1 rounded-md transition-all ${
                    selectedCurrency === curr 
                      ? 'bg-[#D4AF37] text-black font-bold' 
                      : 'text-neutral-400 hover:text-neutral-200'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="flex items-center gap-4 text-neutral-400">
            <span className="flex items-center gap-1">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              HSM Level 4 Multi-Sig Validated
            </span>
            <span className="text-neutral-600">|</span>
            <span className="text-[#D4AF37] font-semibold">
              Query Depth: {transactions.length} Institutional Bundles
            </span>
          </div>
        </div>
      </header>

      {/* KPI Tensors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        
        {/* Metric 1: Inflow Velocity */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#131826] to-[#0A0D14] border border-[#D4AF37]/20 p-5 rounded-2xl group hover:border-[#D4AF37]/60 transition-all shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono tracking-wider uppercase flex items-center gap-1.5">
              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
              Gross Inflow Liquidity
            </span>
            <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
              +{dayRange}d Velocity
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatBillion(metrics.totalInflowVolume)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Modern Treasury Sync: <strong className="text-emerald-400">Optimal</strong></span>
            <span>Ratio: 68.4%</span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 pointer-events-none transition-all" />
        </div>

        {/* Metric 2: Outflow Rebalancing */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#131826] to-[#0A0D14] border border-[#D4AF37]/20 p-5 rounded-2xl group hover:border-[#D4AF37]/60 transition-all shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono tracking-wider uppercase flex items-center gap-1.5">
              <ArrowUpRight className="w-4 h-4 text-amber-400" />
              Dispatched Outflows
            </span>
            <span className="text-[10px] font-mono text-amber-400 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
              Fedwire Tier-0
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatBillion(metrics.totalOutflowVolume)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Sovereign Capex: <strong>41.2%</strong></span>
            <span>Repo Allocation: <strong>58.8%</strong></span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 pointer-events-none transition-all" />
        </div>

        {/* Metric 3: Net Cashflow Superposition */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#131826] to-[#0A0D14] border border-[#D4AF37]/40 p-5 rounded-2xl group hover:border-[#D4AF37] transition-all shadow-[0_0_30px_rgba(212,175,55,0.05)]">
          <div className="flex items-center justify-between text-[#D4AF37] mb-2">
            <span className="text-xs font-mono tracking-wider uppercase flex items-center gap-1.5">
              <Zap className="w-4 h-4 text-[#D4AF37]" />
              Net Vector Delta (Δ)
            </span>
            <span className="text-[10px] font-mono text-black bg-[#D4AF37] font-bold px-2 py-0.5 rounded">
              +{metrics.quantumYieldCaptureBps} bps Alpha
            </span>
          </div>
          <div className={`text-2xl lg:text-3xl font-extrabold font-mono tracking-tight ${metrics.netVelocityDelta >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
            {formatBillion(metrics.netVelocityDelta)}
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Yield Runway: <strong className="text-[#F3E5AB]">{metrics.liquidityRunwayDays} Days</strong></span>
            <span>Entropy: <strong className="text-neutral-200">{metrics.decoherenceRiskFactor}</strong></span>
          </div>
        </div>

        {/* Metric 4: Citi Coherence Reserve */}
        <div className="relative overflow-hidden bg-gradient-to-b from-[#131826] to-[#0A0D14] border border-[#D4AF37]/20 p-5 rounded-2xl group hover:border-[#D4AF37]/60 transition-all shadow-lg">
          <div className="flex items-center justify-between text-neutral-400 mb-2">
            <span className="text-xs font-mono tracking-wider uppercase flex items-center gap-1.5">
              <ShieldCheck className="w-4 h-4 text-sky-400" />
              Citi Reserve Solvency
            </span>
            <span className="text-[10px] font-mono text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
              Basel IV Ultra
            </span>
          </div>
          <div className="text-2xl lg:text-3xl font-extrabold text-white font-mono tracking-tight">
            {metrics.citiFedReserveRatio}%
          </div>
          <div className="mt-3 flex items-center justify-between text-xs font-mono text-neutral-400">
            <span>Atomic Finality: <strong className="text-emerald-400">32ms</strong></span>
            <span>Encryption: <strong>Kyber-1024</strong></span>
          </div>
          <div className="absolute -bottom-6 -right-6 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 pointer-events-none transition-all" />
        </div>

      </div>

      {/* Main Analysis Engine Cockpit */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-8">
        
        {/* Visualizer: Quantum Probability Tunnel (8 Cols) */}
        <div className="lg:col-span-8 bg-[#0D111A] border border-[#D4AF37]/25 rounded-2xl p-6 relative flex flex-col justify-between shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
            <div>
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-bold text-white tracking-wide">
                  90-Day Quantum Wavefunction & Cashflow Velocity Trajectory
                </h3>
              </div>
              <p className="text-xs text-neutral-400 mt-1 font-mono">
                Real-time projection calculated across Modern Treasury ledger endpoints & Citi Velocity direct routing.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <button 
                onClick={() => setActiveTab('LEDGER')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  activeTab === 'LEDGER' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Ledger Trace
              </button>
              <button 
                onClick={() => setActiveTab('QUANTUM_SURFACE')}
                className={`px-3 py-1.5 text-xs font-mono rounded-lg transition-all ${
                  activeTab === 'QUANTUM_SURFACE' ? 'bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/50' : 'text-neutral-400 hover:text-white'
                }`}
              >
                Superposition Tunnel
              </button>
            </div>
          </div>

          {/* SVG Wavefunction & Superposition Projection Graph */}
          <div className="w-full h-72 bg-[#080A10] rounded-xl border border-neutral-800/80 p-4 relative overflow-hidden flex flex-col justify-end">
            <div className="absolute top-3 left-4 flex items-center gap-4 text-[10px] font-mono text-neutral-400 z-10">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-0.5 bg-[#10B981]" /> Deterministic Vector
              </span>
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-1.5 bg-[#D4AF37]/30 border border-[#D4AF37]/60" /> Quantum Probabilistic Corridor (±3σ)
              </span>
            </div>

            <svg className="w-full h-56 overflow-visible" preserveAspectRatio="none" viewBox="0 0 600 200">
              <defs>
                <linearGradient id="quantumTunnelGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.25" />
                  <stop offset="50%" stopColor="#10B981" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#6366F1" stopOpacity="0.05" />
                </linearGradient>
                <linearGradient id="lineGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                  <stop offset="0%" stopColor="#D4AF37" />
                  <stop offset="60%" stopColor="#10B981" />
                  <stop offset="100%" stopColor="#38BDF8" />
                </linearGradient>
              </defs>

              {/* Grid lines */}
              {[40, 80, 120, 160].map((yVal, idx) => (
                <line 
                  key={idx} 
                  x1="0" 
                  y1={yVal} 
                  x2="600" 
                  y2={yVal} 
                  stroke="#1F2937" 
                  strokeDasharray="4 4" 
                  strokeWidth="0.8" 
                />
              ))}

              {/* Area corridor between high and low superposition */}
              <polygon
                points={
                  forecastData.map((pt, i) => `${(i / (forecastData.length - 1)) * 600},${100 - pt.quantumSuperpositionHigh * 12}`).join(' ') +
                  ' ' +
                  forecastData.slice().reverse().map((pt, i) => `${((forecastData.length - 1 - i) / (forecastData.length - 1)) * 600},${100 - pt.quantumSuperpositionLow * 12}`).join(' ')
                }
                fill="url(#quantumTunnelGrad)"
              />

              {/* Deterministic Projection Line */}
              <polyline
                fill="none"
                stroke="url(#lineGrad)"
                strokeWidth="3"
                strokeLinecap="round"
                points={forecastData.map((pt, i) => `${(i / (forecastData.length - 1)) * 600},${100 - pt.deterministicProjection * 12}`).join(' ')}
              />

              {/* Interactive nodes */}
              {forecastData.filter((_, idx) => idx % 5 === 0).map((pt, idx) => {
                const cx = (forecastData.indexOf(pt) / (forecastData.length - 1)) * 600;
                const cy = 100 - pt.deterministicProjection * 12;
                return (
                  <g key={idx}>
                    <circle cx={cx} cy={cy} r="4" fill="#0D111A" stroke="#D4AF37" strokeWidth="2" />
                    <circle cx={cx} cy={cy} r="8" fill="none" stroke="#D4AF37" strokeWidth="0.5" className="animate-ping" />
                  </g>
                );
              })}
            </svg>

            {/* X-Axis labels */}
            <div className="flex justify-between items-center text-[10px] font-mono text-neutral-500 mt-2">
              <span>Day 1 ({forecastData[0]?.dateStr})</span>
              <span>Day 15 ({forecastData[14]?.dateStr})</span>
              <span>Day 30 ({forecastData[forecastData.length - 1]?.dateStr})</span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-3 text-xs font-mono text-center">
            <div className="bg-[#080A10] p-3 rounded-lg border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">Expected Alpha Yield</span>
              <span className="text-emerald-400 font-bold font-mono text-sm">+${(metrics.totalInflowVolume * 0.00048).toLocaleString('en-US', { maximumFractionDigits: 0 })}</span>
            </div>
            <div className="bg-[#080A10] p-3 rounded-lg border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">Decoherence Horizon</span>
              <span className="text-[#D4AF37] font-bold font-mono text-sm">T+184.2 Hours</span>
            </div>
            <div className="bg-[#080A10] p-3 rounded-lg border border-neutral-800">
              <span className="text-neutral-500 block text-[10px]">Modern Treasury Ledger Integrity</span>
              <span className="text-sky-400 font-bold font-mono text-sm">100% Cryptographic Lock</span>
            </div>
          </div>
        </div>

        {/* Side Panel: Yield Optimizer & Sovereign Routing Protocol (4 Cols) */}
        <div className="lg:col-span-4 bg-[#0D111A] border border-[#D4AF37]/25 rounded-2xl p-6 flex flex-col justify-between shadow-2xl">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <Sparkles className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Yield Tensor Optimization
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-mono mb-4">
              Automated institutional rebalance pathways across Citibank Central Vaults & Fed Reverse-Repo Facilities.
            </p>

            <div className="space-y-3">
              <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-900 to-[#121622] border border-[#D4AF37]/20 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Citi Velocity SOFR Sweep
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Sweeping unallocated $4.2B USD overnight.
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-emerald-400">+5.34% APY</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-900 to-[#121622] border border-[#D4AF37]/20 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    MT Quantum Interbank Netting
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    Compressing 84 foreign settlements into 1 wire.
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-[#D4AF37]">-$142k Fee Delta</span>
              </div>

              <div className="p-3.5 rounded-xl bg-gradient-to-r from-neutral-900 to-[#121622] border border-[#D4AF37]/20 flex items-start justify-between">
                <div className="space-y-1">
                  <div className="text-xs font-bold text-white flex items-center gap-1.5">
                    <Workflow className="w-3.5 h-3.5 text-sky-400" />
                    Cross-Sovereign Collateral Pool
                  </div>
                  <div className="text-[11px] text-neutral-400 font-mono">
                    MAS & ADIA multi-currency triangular swap.
                  </div>
                </div>
                <span className="text-xs font-mono font-bold text-sky-400">Zero Slippage</span>
              </div>
            </div>
          </div>

          <div className="mt-6 pt-4 border-t border-neutral-800">
            <button 
              onClick={() => alert(`[CITIBANK TIER-0 ACTION] Quantum Yield Rebalance dispatched for ${dayRange}-day window. Modern Treasury cryptographic proofs generated.`)}
              className="w-full py-3 bg-gradient-to-r from-[#D4AF37]/20 via-[#D4AF37]/30 to-[#D4AF37]/20 hover:from-[#D4AF37]/30 hover:to-[#D4AF37]/40 border border-[#D4AF37] text-[#F3E5AB] font-mono text-xs font-bold uppercase tracking-wider rounded-xl transition-all shadow-[0_0_20px_rgba(212,175,55,0.15)] flex items-center justify-center gap-2"
            >
              <Compass className="w-4 h-4 text-[#D4AF37]" />
              Execute Auto-Rebalance Protocol
            </button>
          </div>
        </div>

      </div>

      {/* Ledger Stream Table: GET /limited/dayRange Transactions */}
      <div className="bg-[#0B0E14] border border-[#D4AF37]/25 rounded-2xl p-6 shadow-2xl">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-6">
          <div>
            <div className="flex items-center gap-2">
              <Database className="w-5 h-5 text-[#D4AF37]" />
              <h3 className="text-lg font-bold text-white tracking-wide">
                Limited-Period Transaction Feed ({dayRange} Day Window)
              </h3>
            </div>
            <p className="text-xs text-neutral-400 font-mono mt-0.5">
              Endpoint: <code className="text-[#D4AF37]">GET /limited/dayRange?range={dayRange}&currency={selectedCurrency}</code>
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={() => {
                const jsonBlob = new Blob([JSON.stringify(transactions, null, 2)], { type: 'application/json' });
                const url = URL.createObjectURL(jsonBlob);
                const a = document.createElement('a');
                a.href = url;
                a.download = `citi-mt-limited-dayrange-${dayRange}d.json`;
                a.click();
              }}
              className="px-4 py-2 bg-neutral-900 border border-neutral-700 hover:border-[#D4AF37] text-neutral-200 text-xs font-mono rounded-lg transition-all flex items-center gap-2"
            >
              <FileSpreadsheet className="w-4 h-4 text-[#D4AF37]" />
              Export Dossier (.JSON)
            </button>
          </div>
        </div>

        {/* High Density Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs font-mono">
            <thead>
              <tr className="border-b border-neutral-800 text-neutral-400 uppercase text-[10px] tracking-wider">
                <th className="pb-3 px-3">Entry & Clearing ID</th>
                <th className="pb-3 px-3">Timestamp (UTC)</th>
                <th className="pb-3 px-3">Counterparty & Jurisdiction</th>
                <th className="pb-3 px-3">Classification</th>
                <th className="pb-3 px-3">Clearing Rail</th>
                <th className="pb-3 px-3 text-right">Amount (Gross)</th>
                <th className="pb-3 px-3 text-center">Q-Confidence</th>
                <th className="pb-3 px-3 text-right">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-900">
              {transactions.slice(0, 10).map((tx) => (
                <tr 
                  key={tx.id} 
                  onClick={() => setSelectedTransaction(tx)}
                  className="hover:bg-[#121622] transition-colors cursor-pointer group"
                >
                  <td className="py-3.5 px-3">
                    <div className="font-bold text-white group-hover:text-[#D4AF37] transition-colors">{tx.id}</div>
                    <div className="text-[10px] text-neutral-500">{tx.citiReference}</div>
                  </td>
                  <td className="py-3.5 px-3 text-neutral-300">
                    {new Date(tx.timestamp).toLocaleString('en-US', {
                      month: 'short',
                      day: '2-digit',
                      hour: '2-digit',
                      minute: '2-digit',
                      hour12: false
                    })}
                  </td>
                  <td className="py-3.5 px-3">
                    <div className="text-neutral-200 font-semibold">{tx.counterparty}</div>
                    <div className="text-[10px] text-neutral-500 flex items-center gap-1">
                      <Globe className="w-2.5 h-2.5 text-neutral-400" />
                      {tx.jurisdiction}
                    </div>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="px-2 py-0.5 text-[10px] rounded bg-neutral-900 border border-neutral-800 text-neutral-300">
                      {tx.category.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className="py-3.5 px-3">
                    <span className="text-neutral-400 font-sans text-[11px] flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      {tx.clearingRail.replace(/_/g, ' ')}
                    </span>
                  </td>
                  <td className={`py-3.5 px-3 text-right font-bold text-sm ${
                    tx.direction === 'INFLOW' ? 'text-emerald-400' : 'text-amber-400'
                  }`}>
                    {tx.direction === 'INFLOW' ? '+' : '-'}${ (tx.amount / 1e6).toFixed(2) }M {tx.currency}
                  </td>
                  <td className="py-3.5 px-3 text-center">
                    <span className="px-2 py-0.5 text-[10px] rounded bg-emerald-950/70 border border-emerald-800/40 text-emerald-300">
                      {tx.quantumProbabilityCoherence}%
                    </span>
                  </td>
                  <td className="py-3.5 px-3 text-right">
                    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === 'SETTLED' 
                        ? 'bg-emerald-950 text-emerald-400 border border-emerald-800/50' 
                        : tx.status === 'RECONCILED'
                        ? 'bg-sky-950 text-sky-400 border border-sky-800/50'
                        : 'bg-amber-950 text-amber-300 border border-amber-800/50 animate-pulse'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="mt-4 pt-4 border-t border-neutral-800/60 flex items-center justify-between text-xs font-mono text-neutral-500">
          <div>Showing top 10 settled tranches of {transactions.length} institutional entries</div>
          <div className="flex items-center gap-1 text-[#D4AF37]">
            <span>Click any entry to inspect ISO 20022 telemetry & Modern Treasury envelope</span>
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </div>

      {/* Modal: Deep Sub-Atomic Inspection for Single Selected Entry */}
      {selectedTransaction && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-[#0D111A] border border-[#D4AF37] w-full max-w-2xl rounded-2xl p-6 shadow-[0_0_60px_rgba(212,175,55,0.25)] relative">
            <div className="flex items-center justify-between border-b border-neutral-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-[#D4AF37]" />
                <h4 className="text-base font-bold text-white font-mono">
                  Sovereign Transaction Inspection // {selectedTransaction.id}
                </h4>
              </div>
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="text-neutral-400 hover:text-white font-mono text-sm px-2 py-1 bg-neutral-900 border border-neutral-800 rounded-md"
              >
                ✕ Close
              </button>
            </div>

            <div className="space-y-4 text-xs font-mono">
              <div className="grid grid-cols-2 gap-4 bg-neutral-950 p-4 rounded-xl border border-neutral-800">
                <div>
                  <span className="text-neutral-500 block">Citibank SWIFT Ref:</span>
                  <span className="text-white font-semibold">{selectedTransaction.citiReference}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Modern Treasury Ledger ID:</span>
                  <span className="text-[#D4AF37] font-semibold">{selectedTransaction.modernTreasuryLedgerId}</span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Settled Amount:</span>
                  <span className="text-emerald-400 font-bold text-sm">
                    ${(selectedTransaction.amount / 1e6).toFixed(2)}M {selectedTransaction.currency}
                  </span>
                </div>
                <div>
                  <span className="text-neutral-500 block">Entangled Yield Capture:</span>
                  <span className="text-sky-400 font-bold">+{selectedTransaction.entangledYieldAlpha}% Net Alpha</span>
                </div>
              </div>

              <div>
                <span className="text-neutral-400 block mb-1">ISO 20022 PACS.008 Encrypted Payload Extract:</span>
                <pre className="p-3 bg-black/90 rounded-lg text-[10px] text-emerald-400/90 border border-neutral-800 overflow-x-auto">
{`<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.08">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${selectedTransaction.citiReference}</MsgId>
      <CreDtTm>${selectedTransaction.timestamp}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>${selectedTransaction.id}</EndToEndId></PmtId>
      <Amt Ccy="${selectedTransaction.currency}">${selectedTransaction.amount.toFixed(2)}</Amt>
      <CdtrAgt><FinInstnId><BICFI>CITIUS33XXX</BICFI></FinInstnId></CdtrAgt>
      <DbtrAgt><FinInstnId><BICFI>MTREASURY01</BICFI></FinInstnId></DbtrAgt>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`}
                </pre>
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3 font-mono text-xs">
              <button 
                onClick={() => setSelectedTransaction(null)}
                className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-bold rounded-lg hover:brightness-110"
              >
                Acknowledge Verification
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Sovereign Footprint Footer */}
      <footer className="mt-12 text-center text-xs font-mono text-neutral-500 border-t border-neutral-900 pt-6">
        <div className="flex items-center justify-center gap-2 mb-1">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />
          <span className="text-neutral-300 font-semibold">Citibank Institutional Clients Group & Modern Treasury Quantum Node</span>
        </div>
        <p className="text-neutral-600 text-[11px]">
          All transactions are routed through hardware security modules (HSM Tier-4) with quantum post-cryptographic guarantees.
        </p>
      </footer>

    </div>
  );
};

export default QuantumLimitedPeriodAnalyzer;