import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  Cpu,
  Activity,
  Zap,
  TrendingDown,
  Clock,
  Globe,
  Database,
  ArrowUpRight,
  AlertTriangle,
  Play,
  RefreshCw,
  Layers,
  CheckCircle2,
  Lock,
  Radio,
  Sliders,
  DollarSign,
  BarChart3,
  Network,
  Eye,
  Crosshair,
  Server
} from 'lucide-react';

interface SettlementWindow {
  id: string;
  name: string;
  clearingRail: 'CitiDirect BE' | 'Fedwire' | 'CHIPS' | 'TARGET2' | 'Modern Treasury Ledger' | 'SWIFT gpi';
  region: 'Americas' | 'EMEA' | 'APAC' | 'Global';
  openUtc: string;
  closeUtc: string;
  peakLiquidityWindow: string;
  hourlyVolumeUsd: number;
  criticality: 'ULTRA-CRITICAL' | 'HIGH' | 'SYSTEMIC';
  status: 'OPTIMAL' | 'THROTTLED' | 'AT_RISK' | 'CRITICAL_WINDOW';
}

interface OutageScenario {
  id: string;
  systemName: string;
  vendor: 'Citibank N.A. Core' | 'Modern Treasury Node' | 'SWIFT Alliance Gateway' | 'AWS us-east-1 GovCloud';
  estimatedDurationMin: number;
  scheduledStartUtc: string;
  scheduledEndUtc: string;
  severity: 'Tier 0 Systemic' | 'Tier 1 Prime' | 'Tier 2 Auxiliary';
  aiConfidenceScore: number;
  simulatedCapitalAtRiskUsd: number;
  predictedFailRate: number;
  algorithmicExposure: {
    fxHedgeDrift: number;
    interestAccrualLagUsd: number;
    intradayLiquidityShortfallUsd: number;
    regulatoryPenaltyProbability: number;
  };
  recommendedMitigation: string;
  failoverRail: string;
}

interface QuantumNodeState {
  nodeId: string;
  location: string;
  entropyScore: number;
  byzantineTolerance: number;
  latencyMs: number;
  state: 'SYNCHRONIZED' | 'DRIFT_DETECTED' | 'ISOLATING' | 'OPTIMAL';
}

export const QuantumOutagePredictorAI: React.FC = () => {
  // Global Simulation Controls
  const [selectedHorizonHours, setSelectedHorizonHours] = useState<number>(24);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [simulationIteration, setSimulationIteration] = useState<number>(1048576);
  const [activeTab, setActiveTab] = useState<'FORECAST' | 'SETTLEMENT_MATRIX' | 'NEURAL_FAILOVER' | 'MONTE_CARLO'>('FORECAST');
  const [selectedScenario, setSelectedScenario] = useState<string>('OUTAGE-9842');
  const [autoMitigationArmed, setAutoMitigationArmed] = useState<boolean>(true);
  const [quantumTelemetryRate, setQuantumTelemetryRate] = useState<number>(1.2);

  // Settlement System Reference State
  const settlementWindows: SettlementWindow[] = useMemo(
    () => [
      {
        id: 'WIN-FED-01',
        name: 'Fedwire Funds Service Cutoff',
        clearingRail: 'Fedwire',
        region: 'Americas',
        openUtc: '01:00',
        closeUtc: '23:00',
        peakLiquidityWindow: '19:30 - 22:30 UTC',
        hourlyVolumeUsd: 142000000000,
        criticality: 'SYSTEMIC',
        status: 'CRITICAL_WINDOW'
      },
      {
        id: 'WIN-CITI-02',
        name: 'CitiDirect Institutional Batch Gateway',
        clearingRail: 'CitiDirect BE',
        region: 'Global',
        openUtc: '00:00',
        closeUtc: '24:00',
        peakLiquidityWindow: '13:00 - 18:00 UTC',
        hourlyVolumeUsd: 89000000000,
        criticality: 'ULTRA-CRITICAL',
        status: 'AT_RISK'
      },
      {
        id: 'WIN-MT-03',
        name: 'Modern Treasury High-Frequency Ledger Sync',
        clearingRail: 'Modern Treasury Ledger',
        region: 'Global',
        openUtc: '00:00',
        closeUtc: '24:00',
        peakLiquidityWindow: '12:00 - 20:00 UTC',
        hourlyVolumeUsd: 45000000000,
        criticality: 'ULTRA-CRITICAL',
        status: 'OPTIMAL'
      },
      {
        id: 'WIN-CHIPS-04',
        name: 'CHIPS Netting Finality Window',
        clearingRail: 'CHIPS',
        region: 'Americas',
        openUtc: '02:00',
        closeUtc: '21:30',
        peakLiquidityWindow: '20:00 - 21:30 UTC',
        hourlyVolumeUsd: 110000000000,
        criticality: 'SYSTEMIC',
        status: 'OPTIMAL'
      },
      {
        id: 'WIN-T2-05',
        name: 'TARGET2 RTGS Core Closure',
        clearingRail: 'TARGET2',
        region: 'EMEA',
        openUtc: '06:00',
        closeUtc: '17:00',
        peakLiquidityWindow: '14:30 - 17:00 UTC',
        hourlyVolumeUsd: 98000000000,
        criticality: 'SYSTEMIC',
        status: 'OPTIMAL'
      }
    ],
    []
  );

  // Scenarios Modeled by AI Engine
  const [scenarios, setScenarios] = useState<OutageScenario[]>([
    {
      id: 'OUTAGE-9842',
      systemName: 'CitiDirect Primary Kafka Cluster Sharding',
      vendor: 'Citibank N.A. Core',
      estimatedDurationMin: 42,
      scheduledStartUtc: '19:45 UTC (T+0)',
      scheduledEndUtc: '20:27 UTC (T+0)',
      severity: 'Tier 0 Systemic',
      aiConfidenceScore: 99.42,
      simulatedCapitalAtRiskUsd: 14850000000,
      predictedFailRate: 18.7,
      algorithmicExposure: {
        fxHedgeDrift: 4.82,
        interestAccrualLagUsd: 2840000,
        intradayLiquidityShortfallUsd: 3100000000,
        regulatoryPenaltyProbability: 0.12
      },
      recommendedMitigation: 'Auto-divert institutional batch payouts to Modern Treasury fallback Virtual IBAN pool with real-time Fedwire backup routing.',
      failoverRail: 'Modern Treasury Multi-Bank Smart Router (JPMorgan / Wells Fargo Hot-Standby)'
    },
    {
      id: 'OUTAGE-9843',
      systemName: 'Modern Treasury Webhook Notification Node US-East',
      vendor: 'Modern Treasury Node',
      estimatedDurationMin: 18,
      scheduledStartUtc: '22:15 UTC (T+0)',
      scheduledEndUtc: '22:33 UTC (T+0)',
      severity: 'Tier 1 Prime',
      aiConfidenceScore: 96.88,
      simulatedCapitalAtRiskUsd: 2420000000,
      predictedFailRate: 4.2,
      algorithmicExposure: {
        fxHedgeDrift: 0.94,
        interestAccrualLagUsd: 412000,
        intradayLiquidityShortfallUsd: 450000000,
        regulatoryPenaltyProbability: 0.01
      },
      recommendedMitigation: 'Activate deterministic polling ledger engine with Citi Direct API asynchronous reconcile sync.',
      failoverRail: 'Citi Connect Micro-Gateway Alpha'
    },
    {
      id: 'OUTAGE-9844',
      systemName: 'SWIFT Alliance Gateway HSM Key Rotation',
      vendor: 'SWIFT Alliance Gateway',
      estimatedDurationMin: 120,
      scheduledStartUtc: '01:00 UTC (T+1)',
      scheduledEndUtc: '03:00 UTC (T+1)',
      severity: 'Tier 0 Systemic',
      aiConfidenceScore: 98.15,
      simulatedCapitalAtRiskUsd: 38900000000,
      predictedFailRate: 41.5,
      algorithmicExposure: {
        fxHedgeDrift: 12.3,
        interestAccrualLagUsd: 9140000,
        intradayLiquidityShortfallUsd: 8700000000,
        regulatoryPenaltyProbability: 0.38
      },
      recommendedMitigation: 'Pre-fund EUR/USD clearing collars on TARGET2 and hold synthetic liquidity across local Citi Tokyo and London nodes.',
      failoverRail: 'Citibank Quantum Mesh Private Settlement Highway'
    }
  ]);

  // Quantum Edge Nodes
  const quantumNodes: QuantumNodeState[] = useMemo(
    () => [
      { nodeId: 'Q-NYC-01', location: 'New York (Citi 388 Greenwich Data Tier 4)', entropyScore: 0.00012, byzantineTolerance: 99.9999, latencyMs: 0.18, state: 'OPTIMAL' },
      { nodeId: 'Q-LDN-02', location: 'London (Canary Wharf Quantum PoP)', entropyScore: 0.00034, byzantineTolerance: 99.9995, latencyMs: 0.62, state: 'OPTIMAL' },
      { nodeId: 'Q-TYO-03', location: 'Tokyo (Otemachi Tier 5 Autonomous Grid)', entropyScore: 0.00189, byzantineTolerance: 99.9821, latencyMs: 1.84, state: 'DRIFT_DETECTED' },
      { nodeId: 'Q-SFO-04', location: 'San Francisco (Modern Treasury Cloud Fabric)', entropyScore: 0.00008, byzantineTolerance: 99.9999, latencyMs: 0.31, state: 'OPTIMAL' }
    ],
    []
  );

  // Live Stream Simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setQuantumTelemetryRate((prev) => +(prev + (Math.random() * 0.08 - 0.04)).toFixed(3));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  const triggerMonteCarloSimulation = useCallback(() => {
    setIsSimulating(true);
    let count = 0;
    const interval = setInterval(() => {
      count += 131072;
      setSimulationIteration((prev) => prev + 131072);
      if (count >= 1048576) {
        clearInterval(interval);
        setIsSimulating(false);
      }
    }, 80);
  }, []);

  const activeScenario = useMemo(
    () => scenarios.find((s) => s.id === selectedScenario) || scenarios[0],
    [scenarios, selectedScenario]
  );

  const formatCurrency = (val: number) => {
    if (val >= 1e9) return `$${(val / 1e9).toFixed(2)}B`;
    if (val >= 1e6) return `$${(val / 1e6).toFixed(2)}M`;
    return `$${val.toLocaleString()}`;
  };

  return (
    <div className="w-full min-h-screen bg-[#050608] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-400/30 selection:text-amber-200">
      {/* Top Super-Header Badge */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-amber-500/20 pb-6 mb-6">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-amber-400 via-amber-600 to-yellow-800 p-0.5 shadow-[0_0_35px_rgba(245,158,11,0.35)]">
              <div className="w-full h-full bg-[#090b10] rounded-[14px] flex items-center justify-center">
                <Cpu className="w-7 h-7 text-amber-400 animate-pulse" />
              </div>
            </div>
            <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#050608] flex items-center justify-center">
              <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-[10px] tracking-[0.25em] font-mono uppercase bg-amber-950/80 text-amber-300 border border-amber-500/40 px-2 py-0.5 rounded">
                CITI QUANTUM ENGINE v9.4 // MODERN TREASURY SYNAPSE
              </span>
              <span className="text-[10px] tracking-widest font-mono text-emerald-400 bg-emerald-950/50 border border-emerald-500/30 px-2 py-0.5 rounded flex items-center">
                <Radio className="w-3 h-3 mr-1 animate-pulse" /> FEED SYNCHRONIZED
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-slate-100 via-amber-200 to-amber-500 tracking-tight mt-1">
              Quantum Outage Impact Predictor AI
            </h1>
            <p className="text-xs md:text-sm text-slate-400 font-light">
              High-Frequency Clearing Collision Forecaster, Settlement Window Overlap Matrix & Automated Rail Failover Suite
            </p>
          </div>
        </div>

        {/* Action Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="bg-[#0e121a] border border-slate-800 rounded-xl px-4 py-2 flex items-center space-x-3">
            <div className="flex flex-col text-right">
              <span className="text-[10px] font-mono text-slate-400 tracking-wider">PREDICTIVE ENTROPY</span>
              <span className="text-sm font-mono font-bold text-amber-400">{quantumTelemetryRate} μ-FLOPS</span>
            </div>
            <Activity className="w-5 h-5 text-amber-400 animate-bounce" />
          </div>

          <button
            onClick={triggerMonteCarloSimulation}
            disabled={isSimulating}
            className={`relative overflow-hidden px-5 py-2.5 rounded-xl font-mono text-xs tracking-wider uppercase font-semibold flex items-center space-x-2 transition-all duration-300 ${
              isSimulating
                ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 cursor-not-allowed'
                : 'bg-gradient-to-r from-amber-500 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black shadow-[0_0_25px_rgba(245,158,11,0.4)] border border-amber-300'
            }`}
          >
            <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
            <span>{isSimulating ? 'Computing 1.048M Paths...' : 'Execute AI Monte Carlo'}</span>
          </button>
        </div>
      </div>

      {/* Main KPI Ribbons */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Metric 1 */}
        <div className="bg-gradient-to-br from-[#0c0f17] to-[#121622] p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>MAX STRANDED CAPITAL</span>
            <DollarSign className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatCurrency(activeScenario.simulatedCapitalAtRiskUsd)}
          </div>
          <div className="mt-2 flex items-center text-xs text-rose-400 font-mono space-x-1">
            <TrendingDown className="w-3.5 h-3.5" />
            <span>+{activeScenario.predictedFailRate}% Volatility Spike Risk</span>
          </div>
        </div>

        {/* Metric 2 */}
        <div className="bg-gradient-to-br from-[#0c0f17] to-[#121622] p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>AI CONFIDENCE COEFFICIENT</span>
            <Crosshair className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-emerald-400 font-mono tracking-tight">
            {activeScenario.aiConfidenceScore}%
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400 font-mono space-x-1">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Quantum Tensor Validation</span>
          </div>
        </div>

        {/* Metric 3 */}
        <div className="bg-gradient-to-br from-[#0c0f17] to-[#121622] p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>INTRADAY SETTLEMENT DRAG</span>
            <Clock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
            {formatCurrency(activeScenario.algorithmicExposure.intradayLiquidityShortfallUsd)}
          </div>
          <div className="mt-2 flex items-center text-xs text-amber-300 font-mono space-x-1">
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Modern Treasury Sync Active</span>
          </div>
        </div>

        {/* Metric 4 */}
        <div className="bg-gradient-to-br from-[#0c0f17] to-[#121622] p-4 rounded-2xl border border-slate-800/80 shadow-lg relative overflow-hidden group hover:border-amber-500/40 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl group-hover:bg-sky-500/10 transition-all" />
          <div className="flex items-center justify-between text-slate-400 text-xs font-mono mb-2">
            <span>AUTONOMOUS MITIGATION</span>
            <Lock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="text-2xl md:text-3xl font-extrabold text-sky-400 font-mono tracking-tight flex items-center">
            ARMED
            <span className="ml-2 inline-block w-2.5 h-2.5 rounded-full bg-sky-400 animate-ping" />
          </div>
          <div className="mt-2 flex items-center text-xs text-slate-400 font-mono space-x-1">
            <Layers className="w-3.5 h-3.5 text-sky-400" />
            <span>Zero-Slippage Failover Standby</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="max-w-7xl mx-auto flex items-center space-x-2 border-b border-slate-800 mb-6 pb-2 overflow-x-auto">
        <button
          onClick={() => setActiveTab('FORECAST')}
          className={`px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === 'FORECAST'
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Eye className="w-4 h-4" />
          <span>COLLISION RADAR</span>
        </button>
        <button
          onClick={() => setActiveTab('SETTLEMENT_MATRIX')}
          className={`px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === 'SETTLEMENT_MATRIX'
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>HIGH-VALUE CLEARING MATRIX</span>
        </button>
        <button
          onClick={() => setActiveTab('NEURAL_FAILOVER')}
          className={`px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === 'NEURAL_FAILOVER'
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Network className="w-4 h-4" />
          <span>AUTONOMIC ROUTING & MODERN TREASURY RAILS</span>
        </button>
        <button
          onClick={() => setActiveTab('MONTE_CARLO')}
          className={`px-4 py-2 rounded-lg font-mono text-xs tracking-wider transition-all flex items-center space-x-2 ${
            activeTab === 'MONTE_CARLO'
              ? 'bg-amber-400/10 text-amber-300 border border-amber-400/40'
              : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>MONTE CARLO PROJECTIONS</span>
        </button>
      </div>

      {/* Main Workspace Panels */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2-Column Main Stage */}
        <div className="lg:col-span-2 space-y-6">
          {activeTab === 'FORECAST' && (
            <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 border-b border-slate-800/80 gap-3">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center">
                    <ShieldAlert className="w-5 h-5 text-amber-400 mr-2" />
                    AI Outage Horizon & Collision Detector
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Analyzing scheduled maintenance against Fedwire, CHIPS, TARGET2 and MT ledger sync timings
                  </p>
                </div>
                <div className="flex items-center space-x-2 bg-[#121620] px-3 py-1.5 rounded-lg border border-slate-700">
                  <Sliders className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[11px] font-mono text-slate-300">Horizon:</span>
                  <select
                    value={selectedHorizonHours}
                    onChange={(e) => setSelectedHorizonHours(Number(e.target.value))}
                    className="bg-transparent text-amber-300 font-mono text-xs font-bold outline-none cursor-pointer"
                  >
                    <option value={12} className="bg-slate-900 text-white">12 Hours</option>
                    <option value={24} className="bg-slate-900 text-white">24 Hours</option>
                    <option value={48} className="bg-slate-900 text-white">48 Hours</option>
                    <option value={72} className="bg-slate-900 text-white">72 Hours</option>
                  </select>
                </div>
              </div>

              {/* Scenario Selector Ribbon */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-3 my-5">
                {scenarios.map((scen) => {
                  const isSelected = scen.id === selectedScenario;
                  return (
                    <div
                      key={scen.id}
                      onClick={() => setSelectedScenario(scen.id)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-amber-500/10 border-amber-400 shadow-[0_0_15px_rgba(245,158,11,0.15)]'
                          : 'bg-[#0e121a] border-slate-800 hover:border-slate-700 hover:bg-[#131824]'
                      }`}
                    >
                      <div className="flex items-center justify-between text-[10px] font-mono mb-1.5">
                        <span className={isSelected ? 'text-amber-300 font-bold' : 'text-slate-400'}>
                          {scen.id}
                        </span>
                        <span
                          className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            scen.severity === 'Tier 0 Systemic'
                              ? 'bg-rose-950 text-rose-300 border border-rose-800'
                              : 'bg-amber-950 text-amber-300 border border-amber-800'
                          }`}
                        >
                          {scen.severity}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-slate-200 line-clamp-1 mb-1">
                        {scen.systemName}
                      </div>
                      <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between">
                        <span>Duration: {scen.estimatedDurationMin}m</span>
                        <span className="text-amber-400 font-bold">{formatCurrency(scen.simulatedCapitalAtRiskUsd)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Deep Analysis of Selected Incident */}
              <div className="bg-[#07090e] border border-amber-500/20 rounded-xl p-5 relative overflow-hidden">
                <div className="flex flex-col md:flex-row md:items-center justify-between pb-3 border-b border-slate-800/80 gap-2">
                  <div className="flex items-center space-x-2">
                    <AlertTriangle className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-xs uppercase tracking-wider text-amber-300 font-bold">
                      Selected Outage Profile: {activeScenario.systemName}
                    </span>
                  </div>
                  <span className="font-mono text-xs text-slate-400">
                    Window: <strong className="text-slate-200">{activeScenario.scheduledStartUtc}</strong> → <strong className="text-slate-200">{activeScenario.scheduledEndUtc}</strong>
                  </span>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
                  <div className="bg-[#0f131d] p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">FX HEDGE SLIPPAGE DRIFT</span>
                    <span className="text-lg font-mono font-bold text-rose-400">
                      +{activeScenario.algorithmicExposure.fxHedgeDrift} bps
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Cross-currency spread deviation</span>
                  </div>
                  <div className="bg-[#0f131d] p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">INTEREST ACCRUAL DRAG</span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      {formatCurrency(activeScenario.algorithmicExposure.interestAccrualLagUsd)}
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Overnight uncollateralized friction</span>
                  </div>
                  <div className="bg-[#0f131d] p-3 rounded-lg border border-slate-800">
                    <span className="text-[10px] font-mono text-slate-400 block mb-1">REGULATORY PENALTY PROB</span>
                    <span className="text-lg font-mono font-bold text-purple-400">
                      {(activeScenario.algorithmicExposure.regulatoryPenaltyProbability * 100).toFixed(1)}%
                    </span>
                    <span className="text-[10px] text-slate-500 block mt-1">Basel III Intraday Liquidity LCR</span>
                  </div>
                </div>

                {/* AI Prescriptive Action Banner */}
                <div className="p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-black border border-amber-500/40 flex items-start space-x-3">
                  <Zap className="w-5 h-5 text-amber-400 mt-0.5 flex-shrink-0" />
                  <div>
                    <div className="text-xs font-mono font-bold text-amber-300 uppercase tracking-wide">
                      AI Prescriptive Mitigation Routing
                    </div>
                    <div className="text-xs text-slate-300 mt-1 leading-relaxed">
                      {activeScenario.recommendedMitigation}
                    </div>
                    <div className="mt-2.5 flex items-center space-x-2 text-[11px] font-mono">
                      <span className="text-slate-400">Fallback Pipeline:</span>
                      <span className="px-2 py-0.5 bg-amber-400/20 text-amber-200 border border-amber-400/30 rounded">
                        {activeScenario.failoverRail}
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'SETTLEMENT_MATRIX' && (
            <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center">
                    <Globe className="w-5 h-5 text-amber-400 mr-2" />
                    Global High-Value Settlement Horizons
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Real-time clearing cutoff monitoring against Citi Direct & Modern Treasury multi-ledger pipelines
                  </p>
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-lg">
                  5 ACTIVE RAILS
                </span>
              </div>

              <div className="space-y-3">
                {settlementWindows.map((win) => (
                  <div
                    key={win.id}
                    className="p-4 rounded-xl bg-[#090c12] border border-slate-800/80 hover:border-amber-500/30 transition-all flex flex-col md:flex-row md:items-center justify-between gap-4"
                  >
                    <div className="flex items-start space-x-3">
                      <div
                        className={`w-3 h-3 rounded-full mt-1 ${
                          win.status === 'OPTIMAL'
                            ? 'bg-emerald-500 shadow-[0_0_10px_rgba(16,185,129,0.5)]'
                            : win.status === 'AT_RISK'
                            ? 'bg-amber-400 shadow-[0_0_10px_rgba(245,158,11,0.5)]'
                            : 'bg-rose-500 shadow-[0_0_10px_rgba(244,63,94,0.5)] animate-ping'
                        }`}
                      />
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-bold text-sm text-slate-200">{win.name}</span>
                          <span className="text-[10px] font-mono uppercase bg-slate-800 text-slate-300 px-1.5 py-0.2 rounded">
                            {win.region}
                          </span>
                          <span className="text-[10px] font-mono uppercase bg-amber-950/60 text-amber-300 px-1.5 py-0.2 rounded border border-amber-700/40">
                            {win.clearingRail}
                          </span>
                        </div>
                        <div className="text-xs text-slate-400 mt-1 flex items-center space-x-3 font-mono">
                          <span>Hours: {win.openUtc} - {win.closeUtc} UTC</span>
                          <span className="text-amber-400/90 font-semibold">Peak: {win.peakLiquidityWindow}</span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center justify-between md:justify-end space-x-6 text-right font-mono">
                      <div>
                        <span className="text-[10px] text-slate-500 block">EST. HOURLY VOL</span>
                        <span className="text-xs font-bold text-slate-200">{formatCurrency(win.hourlyVolumeUsd)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block">STATUS</span>
                        <span
                          className={`text-xs font-bold ${
                            win.status === 'OPTIMAL'
                              ? 'text-emerald-400'
                              : win.status === 'AT_RISK'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {win.status.replace('_', ' ')}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {activeTab === 'NEURAL_FAILOVER' && (
            <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center">
                    <Network className="w-5 h-5 text-amber-400 mr-2" />
                    Automated Quantum Failover Topology
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Citibank Direct BE to Modern Treasury multi-hop decentralized routing mesh
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="text-xs font-mono text-slate-400">Autonomous Execution:</span>
                  <button
                    onClick={() => setAutoMitigationArmed(!autoMitigationArmed)}
                    className={`px-3 py-1 rounded-lg font-mono text-xs font-bold transition-all ${
                      autoMitigationArmed
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-400/50'
                        : 'bg-rose-950/40 text-rose-400 border border-rose-800'
                    }`}
                  >
                    {autoMitigationArmed ? 'ENABLED' : 'DISARMED'}
                  </button>
                </div>
              </div>

              {/* Visual Routing Canvas Mock */}
              <div className="p-6 rounded-xl bg-[#06080d] border border-slate-800 relative overflow-hidden">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center relative z-10">
                  {/* Step 1 */}
                  <div className="p-4 rounded-xl bg-[#0d111a] border border-amber-500/30">
                    <div className="text-[10px] font-mono text-amber-400 font-bold mb-1">INGESTION LAYER</div>
                    <div className="text-xs font-bold text-white mb-2">CitiDirect BE Prime Engine</div>
                    <div className="text-[11px] font-mono text-slate-400 bg-black/40 p-2 rounded">
                      Inbound SWIFT MT103 / ISO 20022 Pacs.008
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-emerald-400">Latency: 0.18ms</div>
                  </div>

                  {/* Step 2 */}
                  <div className="p-4 rounded-xl bg-[#0d111a] border border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]">
                    <div className="text-[10px] font-mono text-amber-300 font-bold mb-1">AI COLLISION BROKER</div>
                    <div className="text-xs font-bold text-amber-200 mb-2">Modern Treasury Smart Router</div>
                    <div className="text-[11px] font-mono text-slate-400 bg-black/40 p-2 rounded">
                      Sub-millisecond Outage Hazard Classification
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-amber-400">Heuristic: ACTIVE</div>
                  </div>

                  {/* Step 3 */}
                  <div className="p-4 rounded-xl bg-[#0d111a] border border-emerald-500/30">
                    <div className="text-[10px] font-mono text-emerald-400 font-bold mb-1">FALLBACK DESTINATION</div>
                    <div className="text-xs font-bold text-white mb-2">Fedwire & Multi-IBAN Pool</div>
                    <div className="text-[11px] font-mono text-slate-400 bg-black/40 p-2 rounded">
                      Direct RTGS Collateralized Settlement
                    </div>
                    <div className="mt-3 text-[10px] font-mono text-emerald-400">Liquidity Buffer: $120B</div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between text-xs font-mono text-slate-400 gap-2">
                  <span>Routing Strategy: <strong className="text-slate-200">Least-Frictional Liquidity Path (LFLP)</strong></span>
                  <span className="text-amber-400">Max Auto-Execute Size: $5,000,000,000 / tx</span>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'MONTE_CARLO' && (
            <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80 mb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center">
                    <BarChart3 className="w-5 h-5 text-amber-400 mr-2" />
                    Simulated Value at Risk (VaR) Distribution
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    1,048,576 Iterations evaluating non-linear systemic clearing gridlock
                  </p>
                </div>
                <span className="text-xs font-mono text-slate-400 bg-[#121622] px-3 py-1 rounded border border-slate-700">
                  Iterations: {simulationIteration.toLocaleString()}
                </span>
              </div>

              {/* High-Tech Gauge Visualization */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-2">
                <div className="p-4 rounded-xl bg-[#080a0f] border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">99.9% VaR MAXIMUM LOSS PROBABILITY</span>
                  <span className="text-3xl font-mono font-black text-rose-500 tracking-tight">$42.85M</span>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono leading-relaxed">
                    Estimated fail-fee penalty, overnight penalty borrowing, and client SLA indemnifications during prolonged 60m peak window outage.
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-[#080a0f] border border-slate-800">
                  <span className="text-xs font-mono text-slate-400 block mb-1">EXPECTED SHORTFALL (CVaR)</span>
                  <span className="text-3xl font-mono font-black text-amber-400 tracking-tight">$71.20M</span>
                  <p className="text-[11px] text-slate-400 mt-2 font-mono leading-relaxed">
                    Tail-risk exposure scenario under systemic cross-market clearing freeze with Fedwire queue backlog.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Right 1-Column Control & Telemetry Panel */}
        <div className="space-y-6">
          {/* Quantum Node Health Monitor */}
          <div className="bg-[#0b0e14] border border-slate-800/80 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800/80 mb-3">
              <span className="text-xs font-mono font-bold text-amber-400 flex items-center">
                <Server className="w-4 h-4 mr-1.5" />
                QUANTUM TELEMETRY NODES
              </span>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
            </div>

            <div className="space-y-3">
              {quantumNodes.map((node) => (
                <div
                  key={node.nodeId}
                  className="p-3 rounded-xl bg-[#07090e] border border-slate-800/60 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between text-xs font-mono mb-1">
                    <span className="font-bold text-slate-200">{node.nodeId}</span>
                    <span
                      className={`text-[10px] font-bold px-1.5 py-0.2 rounded ${
                        node.state === 'OPTIMAL'
                          ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                          : 'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}
                    >
                      {node.state}
                    </span>
                  </div>
                  <div className="text-[11px] text-slate-400 truncate mb-1.5">{node.location}</div>
                  <div className="grid grid-cols-2 gap-2 text-[10px] font-mono text-slate-400 pt-1 border-t border-slate-800/60">
                    <span>Latency: <strong className="text-slate-200">{node.latencyMs}ms</strong></span>
                    <span>BFT Tol: <strong className="text-emerald-400">{node.byzantineTolerance}%</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Institutional Compliance & Audit Trail */}
          <div className="bg-gradient-to-b from-[#0c0f17] to-[#08090d] border border-amber-500/20 rounded-2xl p-5 shadow-2xl">
            <span className="text-xs font-mono font-bold text-slate-300 flex items-center mb-3">
              <Lock className="w-4 h-4 text-amber-400 mr-2" />
              REGULATORY AUDIT LOCK
            </span>
            <div className="text-xs text-slate-400 space-y-2.5 font-mono">
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>OCC Reg 30 Subpart B:</span>
                <span className="text-emerald-400 font-bold">COMPLIANT</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>Federal Reserve PS01:</span>
                <span className="text-emerald-400 font-bold">ACTIVE</span>
              </div>
              <div className="flex justify-between border-b border-slate-800/60 pb-1.5">
                <span>Modern Treasury Ledgers:</span>
                <span className="text-amber-400 font-bold">ZERO SPREAD</span>
              </div>
              <div className="flex justify-between">
                <span>SHA-384 Attestation Hash:</span>
                <span className="text-slate-300 font-bold">8f4a...e91c</span>
              </div>
            </div>

            <button
              onClick={() => alert(`Initiating Instant Quantum Audit Seal for Scenario: ${activeScenario.id}`)}
              className="mt-4 w-full py-2.5 bg-gradient-to-r from-amber-500/20 to-amber-600/10 hover:from-amber-500/30 hover:to-amber-600/20 text-amber-300 border border-amber-500/30 rounded-xl font-mono text-xs font-bold tracking-wider uppercase transition-all flex items-center justify-center space-x-2"
            >
              <span>Export Executive Attestation</span>
              <ArrowUpRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      </div>

      {/* Footer System Status Bar */}
      <div className="max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between text-slate-500 text-xs font-mono gap-2">
        <div className="flex items-center space-x-3">
          <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Citi Institutional Clearing Engine + Modern Treasury Synapse Connected</span>
        </div>
        <div>
          <span>Quantum Epoch: 9482.01948 // Latency: 0.28ms</span>
        </div>
      </div>
    </div>
  );
};

export default QuantumOutagePredictorAI;