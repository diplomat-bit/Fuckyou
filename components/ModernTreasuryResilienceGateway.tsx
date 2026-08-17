import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  AlertTriangle,
  ArrowRightLeft,
  Cpu,
  Activity,
  Zap,
  Layers,
  Landmark,
  Network,
  CheckCircle2,
  Lock,
  Sparkles,
  RefreshCw,
  ChevronRight,
  DollarSign,
  Database,
  Radio,
  Clock,
  Gauge,
  Sliders,
  Flame,
  Globe2,
  CornerDownRight,
  Fingerprint
} from 'lucide-react';

interface PaymentOrder {
  id: string;
  treasuryTrackingId: string;
  beneficiary: string;
  counterpartyBank: string;
  amount: number;
  currency: string;
  originalRail: 'CITI_FEDWIRE' | 'CITI_ACH_SAMEDAY' | 'CITI_SWIFT_GPI' | 'CITI_TARGET2';
  reroutedRail: 'MODERN_TREASURY_JPM' | 'MODERN_TREASURY_BNY' | 'FEDNOW_DIRECT' | 'BOE_CHAPS_FALLBACK';
  status: 'OPTIMAL_ROUTING' | 'INTERCEPTED_IN_FLIGHT' | 'SETTLED_SECONDARY' | 'AI_REBALANCING';
  interceptReason: string;
  timestamp: string;
  hash: string;
  feeDeltaBps: number;
  executionLatencyMs: number;
}

interface LiquidityHub {
  id: string;
  name: string;
  code: string;
  institution: string;
  capacityAllocated: number;
  availableLiquidity: number;
  healthScore: number;
  currentLatency: number;
  activeRail: string;
  isCitiCore: boolean;
  status: 'ONLINE' | 'DEGRADED_INTERCEPT' | 'MAINTENANCE_SCHEDULED' | 'DRAINED';
}

interface OutageEvent {
  id: string;
  title: string;
  affectedCores: string[];
  scheduledWindow: string;
  severity: 'CRITICAL_WINDOW' | 'WARNING_FEDWIRE_CUTOFF' | 'MAINTENANCE_ACTIVE';
  mitigationProtocol: string;
  aiConfidenceScore: number;
}

export const ModernTreasuryResilienceGateway: React.FC = () => {
  // Master telemetry states
  const [autonomousRerouteActive, setAutonomousRerouteActive] = useState<boolean>(true);
  const [citibankCoreHealth, setCitibankCoreHealth] = useState<number>(38.4);
  const [isSimulatingOutage, setIsSimulatingOutage] = useState<boolean>(true);
  const [selectedHub, setSelectedHub] = useState<string>('hub-mt-bny');
  const [totalLiquidityRerouted, setTotalLiquidityRerouted] = useState<number>(4829140000.50);
  const [inFlightOrdersCount, setInFlightOrdersCount] = useState<number>(142);
  const [slippageAvoidedUsd, setSlippageAvoidedUsd] = useState<number>(2418900.00);

  // Modern Treasury Liquidity Hubs State
  const [liquidityHubs, setLiquidityHubs] = useState<LiquidityHub[]>([
    {
      id: 'hub-citi-ny',
      name: 'Citibank NA Tier-1 Primary Node (399 Park Ave)',
      code: 'CITI-US-CORE-01',
      institution: 'Citibank N.A. New York',
      capacityAllocated: 6500000000,
      availableLiquidity: 1240000000,
      healthScore: 38.4,
      currentLatency: 142,
      activeRail: 'Fedwire / CHIPS Primary',
      isCitiCore: true,
      status: 'DEGRADED_INTERCEPT'
    },
    {
      id: 'hub-mt-bny',
      name: 'Modern Treasury Sovereign Escrow / BNY Mellon Hub',
      code: 'MT-BNY-SOV-09',
      institution: 'The Bank of New York Mellon',
      capacityAllocated: 8200000000,
      availableLiquidity: 7940000000,
      healthScore: 99.98,
      currentLatency: 4.2,
      activeRail: 'Tri-Party Modern Treasury Virtual Ledger',
      isCitiCore: false,
      status: 'ONLINE'
    },
    {
      id: 'hub-mt-jpm',
      name: 'Modern Treasury Onyx & Institutional Clearing Hub',
      code: 'MT-JPM-ONYX-04',
      institution: 'JPMorgan Chase & Co.',
      capacityAllocated: 9500000000,
      availableLiquidity: 9120000000,
      healthScore: 99.99,
      currentLatency: 3.8,
      activeRail: 'FedNow / Direct Real-Time Rail',
      isCitiCore: false,
      status: 'ONLINE'
    },
    {
      id: 'hub-mt-boe',
      name: 'Modern Treasury London Sovereign RTGS Reserve',
      code: 'MT-BOE-RTGS-02',
      institution: 'Bank of England RTGS Connector',
      capacityAllocated: 4100000000,
      availableLiquidity: 3980000000,
      healthScore: 99.95,
      currentLatency: 8.1,
      activeRail: 'CHAPS / TARGET2 Mirror',
      isCitiCore: false,
      status: 'ONLINE'
    }
  ]);

  // Active Outage Alerts
  const [activeOutage, setActiveOutage] = useState<OutageEvent>({
    id: 'OUTAGE-CITI-2025-089',
    title: 'Citibank Core ACH / Global Fedwire Batch Settlement Maintenance Window',
    affectedCores: ['CitiDirect BE', 'Citi Connect API v2.4', 'Fedwire Core Routing Node 12'],
    scheduledWindow: '02:00 UTC - 06:30 UTC (Under Active Autonomous Interception)',
    severity: 'CRITICAL_WINDOW',
    mitigationProtocol: 'MODERN_TREASURY_QUANTUM_SWEEP_PROTOCOL_V7',
    aiConfidenceScore: 99.94
  });

  // Dynamic In-Flight Payment Orders
  const [orders, setOrders] = useState<PaymentOrder[]>([
    {
      id: 'ORD-9901-FX',
      treasuryTrackingId: 'mt_po_98a7cf2e1098b4',
      beneficiary: 'Sovereign Wealth Fund Alpha Core',
      counterpartyBank: 'UBS Zurich (SWIFT: UBSWCHZH)',
      amount: 450000000.00,
      currency: 'USD',
      originalRail: 'CITI_FEDWIRE',
      reroutedRail: 'MODERN_TREASURY_BNY',
      status: 'SETTLED_SECONDARY',
      interceptReason: 'Citi Direct BE Latency Spike (>140ms) & Pending Batch Halt',
      timestamp: 'Just now',
      hash: '0x88f4e2a9b31d8e119b456201f92e3a510c4d8b92e741a33b7',
      feeDeltaBps: -0.85,
      executionLatencyMs: 14.2
    },
    {
      id: 'ORD-9902-SWP',
      treasuryTrackingId: 'mt_po_55b2ae990184ca',
      beneficiary: 'Ares Global Private Debt Collateral Trust',
      counterpartyBank: 'JPMorgan Chase NY (ABA: 021000021)',
      amount: 875000000.00,
      currency: 'USD',
      originalRail: 'CITI_FEDWIRE',
      reroutedRail: 'MODERN_TREASURY_JPM',
      status: 'INTERCEPTED_IN_FLIGHT',
      interceptReason: 'Autonomous Zero-Downtime Intercept: Citi Maintenance T-12m',
      timestamp: '14s ago',
      hash: '0x12a9e87b003c4f92d8471b6903e198d5c410ba2358e72f910',
      feeDeltaBps: -1.20,
      executionLatencyMs: 8.4
    },
    {
      id: 'ORD-9903-ACH',
      treasuryTrackingId: 'mt_po_319eac1184a6dd',
      beneficiary: 'BlackRock Systematic Liquidity Sweep 04',
      counterpartyBank: 'State Street Boston (ABA: 011000028)',
      amount: 320000000.00,
      currency: 'USD',
      originalRail: 'CITI_ACH_SAMEDAY',
      reroutedRail: 'FEDNOW_DIRECT',
      status: 'OPTIMAL_ROUTING',
      interceptReason: 'Predictive Cutoff Prevention Engine Triggered',
      timestamp: '32s ago',
      hash: '0xf552b9981e4a77038db4901cae8473921049da39281e00a39',
      feeDeltaBps: -0.40,
      executionLatencyMs: 5.1
    },
    {
      id: 'ORD-9904-EUR',
      treasuryTrackingId: 'mt_po_7718cd3381a9bc',
      beneficiary: 'GIC Sovereign Real Estate Holdings BV',
      counterpartyBank: 'BNP Paribas Paris (SWIFT: BNPAFRPP)',
      amount: 610000000.00,
      currency: 'EUR',
      originalRail: 'CITI_TARGET2',
      reroutedRail: 'BOE_CHAPS_FALLBACK',
      status: 'AI_REBALANCING',
      interceptReason: 'Citi Frankfurt Gateway TLS Handshake Timeout Mitigation',
      timestamp: '1m ago',
      hash: '0x49ca81023be718f4a0129bc840134f590184bba039d91244e',
      feeDeltaBps: -2.15,
      executionLatencyMs: 18.9
    }
  ]);

  // AI Prompt Optimization telemetry stream
  const [aiTelemetryLog, setAiTelemetryLog] = useState<string[]>([
    '[AI-ORCHESTRATOR] Intercepted Citi Direct API 503 gateway variance: Diverting $875,000,000 to Modern Treasury Ledger BNY Escrow.',
    '[MODERN TREASURY LEDGER] Auto-reconciliation validated via dual ECDSA Ledger Signatures. Net delta: 0.00 USD discrepancy.',
    '[RAIL ARBITRAGE] Fedwire queue saturation detected at Citi Core. Rebalancing to Modern Treasury Real-Time FedNow Node.',
    '[LIQUIDITY OPTIMIZER] Multi-hub sweep threshold verified: $28.74B global capacity across 4 fallback nodes.'
  ]);

  // Periodic simulated live ticker and transactions
  useEffect(() => {
    const interval = setInterval(() => {
      const deltaAmount = Math.floor(Math.random() * 45000000) + 5000000;
      setTotalLiquidityRerouted(prev => prev + deltaAmount);
      setSlippageAvoidedUsd(prev => prev + Math.floor(Math.random() * 8500) + 1200);

      // Random micro-adjustment to Citi Core Health
      if (isSimulatingOutage) {
        setCitibankCoreHealth(prev => {
          const jitter = (Math.random() * 4 - 2);
          return Math.max(12.0, Math.min(48.5, Number((prev + jitter).toFixed(2))));
        });
      } else {
        setCitibankCoreHealth(99.98);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, [isSimulatingOutage]);

  // Toggle Outage Simulation Switch
  const toggleOutageState = useCallback(() => {
    setIsSimulatingOutage(prev => {
      const next = !prev;
      if (next) {
        setCitibankCoreHealth(34.2);
        setAiTelemetryLog(logs => [
          `[CRITICAL INTERCEPT] Manual/Scheduled Citibank Outage Interceptor Activated. All $500M+ Fedwire batches auto-routed to Modern Treasury secondary ledger.`,
          ...logs.slice(0, 5)
        ]);
      } else {
        setCitibankCoreHealth(99.98);
        setAiTelemetryLog(logs => [
          `[CORE RECOVERY] Citibank API v2.4 handshake normalized. Dual-homed redundant mode active. Modern Treasury remains hot standby.`,
          ...logs.slice(0, 5)
        ]);
      }
      return next;
    });
  }, []);

  // Format currency helpers
  const formatCurrency = (val: number, currency: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 2
    }).format(val);
  };

  const selectedHubData = useMemo(() => {
    return liquidityHubs.find(h => h.id === selectedHub) || liquidityHubs[1];
  }, [liquidityHubs, selectedHub]);

  return (
    <div className="w-full min-h-screen bg-[#07090E] text-slate-100 font-sans p-4 sm:p-6 lg:p-10 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Luxury Gradient Glow Top Border */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-500 via-emerald-400 to-cyan-500 z-50 shadow-[0_0_20px_rgba(245,158,11,0.5)]" />

      {/* Main Container */}
      <div className="max-w-[1720px] mx-auto space-y-8">
        
        {/* Executive Luxury Header */}
        <header className="relative rounded-2xl border border-slate-800/80 bg-gradient-to-b from-slate-900/90 via-[#0B0F19] to-[#07090E] p-6 sm:p-8 backdrop-blur-2xl shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Subtle Ambient Background Watermark */}
          <div className="absolute -right-24 -bottom-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -left-20 -top-20 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-1.5 px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/10 to-amber-600/20 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-wider uppercase">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Citibank Sovereign Core &times; Modern Treasury Enterprise
                </div>
                <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 text-xs font-mono">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  QUANTUM-AI FAILOVER: ARMED
                </div>
                <div className="px-3 py-1 rounded-full bg-slate-800/80 border border-slate-700 text-slate-300 text-xs font-mono">
                  ISO-20022 / FEDWIRE ADAPTER ACTIVE
                </div>
              </div>

              <h1 className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-slate-400">
                Modern Treasury Resilience Gateway
              </h1>
              <p className="text-slate-400 text-sm sm:text-base max-w-3xl leading-relaxed">
                Autonomous AI Interceptor for scheduled & unscheduled Citibank core outages. Real-time deterministic
                rerouting of corporate liquidity sweeps, Fedwire, CHIPS, and high-velocity multi-currency payment orders
                across secondary institutional balance sheets.
              </p>
            </div>

            {/* Top Right Executive Controls */}
            <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4 w-full lg:w-auto">
              <button
                onClick={toggleOutageState}
                className={`relative group px-6 py-3.5 rounded-xl border font-mono text-xs sm:text-sm font-semibold tracking-wide transition-all duration-300 flex items-center justify-center gap-3 shadow-2xl ${
                  isSimulatingOutage
                    ? 'bg-gradient-to-r from-amber-600/90 to-red-600/90 border-amber-400/50 text-white shadow-amber-900/30 hover:brightness-110'
                    : 'bg-slate-800/80 border-slate-700 text-slate-300 hover:bg-slate-800 hover:border-slate-600'
                }`}
              >
                <Flame className={`w-4 h-4 ${isSimulatingOutage ? 'text-amber-200 animate-bounce' : 'text-slate-400'}`} />
                <span>{isSimulatingOutage ? 'CITIBANK OUTAGE INTERCEPT: ENGAGED' : 'SIMULATE CITI CORE OUTAGE'}</span>
              </button>

              <div className="p-3.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center justify-between gap-4 font-mono text-xs text-slate-300">
                <div className="flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" />
                  <span>AI DUAL-SIG:</span>
                </div>
                <span className="text-emerald-400 font-bold tracking-wider">ONLINE (0.0001ms)</span>
              </div>
            </div>
          </div>

          {/* Key Metrics Banner */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-6 border-t border-slate-800/80">
            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Total Liquidity Rerouted</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-100 mt-1">
                {formatCurrency(totalLiquidityRerouted)}
              </div>
              <div className="text-[11px] font-mono text-emerald-400 flex items-center gap-1 mt-1.5">
                <CheckCircle2 className="w-3 h-3" /> 100% Zero-Loss Settlement
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Citi Core Health Index</span>
              <div className="flex items-baseline gap-2 mt-1">
                <span className={`text-2xl sm:text-3xl font-mono font-bold ${citibankCoreHealth < 50 ? 'text-rose-400' : 'text-emerald-400'}`}>
                  {citibankCoreHealth}%
                </span>
                <span className="text-xs font-mono text-slate-400">
                  {citibankCoreHealth < 50 ? 'DEGRADED / REROUTING' : 'OPTIMAL'}
                </span>
              </div>
              <div className="w-full bg-slate-800 rounded-full h-1.5 mt-2.5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-700 ${citibankCoreHealth < 50 ? 'bg-gradient-to-r from-rose-500 to-amber-500' : 'bg-emerald-400'}`}
                  style={{ width: `${citibankCoreHealth}%` }}
                />
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Slippage & Penalties Saved</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-cyan-300 mt-1">
                {formatCurrency(slippageAvoidedUsd)}
              </div>
              <div className="text-[11px] font-mono text-cyan-400/80 flex items-center gap-1 mt-1.5">
                <Zap className="w-3 h-3" /> Real-time Arbitrage Optimization
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80">
              <span className="text-xs font-mono uppercase text-slate-400 tracking-wider">Intercepted Transactions</span>
              <div className="text-2xl sm:text-3xl font-mono font-bold text-purple-300 mt-1">
                {inFlightOrdersCount} in-flight
              </div>
              <div className="text-[11px] font-mono text-purple-400 flex items-center gap-1 mt-1.5">
                <Lock className="w-3 h-3" /> Modern Treasury Ledger Verified
              </div>
            </div>
          </div>
        </header>

        {/* Live Outage Interception Alert Strip */}
        <div className="p-5 rounded-xl border border-amber-500/30 bg-gradient-to-r from-amber-950/30 via-slate-900/80 to-slate-900/80 backdrop-blur-xl flex flex-col md:flex-row items-start md:items-center justify-between gap-4 shadow-lg shadow-amber-950/20">
          <div className="flex items-start md:items-center gap-4">
            <div className="p-2.5 rounded-lg bg-amber-500/20 border border-amber-500/40 text-amber-400 shrink-0">
              <AlertTriangle className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono font-bold uppercase text-amber-400 tracking-wider">
                  ACTIVE INTERCEPTION PROTOCOL [{activeOutage.id}]
                </span>
                <span className="px-2 py-0.5 rounded bg-amber-400/10 text-amber-300 text-[10px] font-mono border border-amber-400/20">
                  SEV-1 AUTOPILOT
                </span>
              </div>
              <h4 className="text-base font-semibold text-white mt-0.5">{activeOutage.title}</h4>
              <p className="text-xs text-slate-400 font-mono mt-1">
                Target Window: <span className="text-slate-300">{activeOutage.scheduledWindow}</span> | Affected: {activeOutage.affectedCores.join(', ')}
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 shrink-0 self-end md:self-center">
            <div className="text-right">
              <span className="text-[10px] font-mono uppercase text-slate-400 block">AI Neural Routing Confidence</span>
              <span className="text-sm font-mono font-bold text-emerald-400">{activeOutage.aiConfidenceScore}%</span>
            </div>
            <div className="h-8 w-[1px] bg-slate-800" />
            <button
              onClick={() => setAutonomousRerouteActive(!autonomousRerouteActive)}
              className={`px-4 py-2 rounded-lg font-mono text-xs font-bold tracking-wider transition-colors border ${
                autonomousRerouteActive
                  ? 'bg-emerald-500/20 text-emerald-300 border-emerald-500/40 hover:bg-emerald-500/30'
                  : 'bg-rose-500/20 text-rose-300 border-rose-500/40 hover:bg-rose-500/30'
              }`}
            >
              {autonomousRerouteActive ? 'AUTONOMOUS ACTIVE' : 'MANUAL OVERRIDE'}
            </button>
          </div>
        </div>

        {/* Core Architecture Matrix */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* Left / Middle Column: Liquidity Hubs & Ledger Routing Map */}
          <div className="xl:col-span-8 space-y-6">
            
            {/* Liquidity Routing Grid */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400">
                    <Network className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Multi-Rail Sovereign Liquidity Hubs</h3>
                    <p className="text-xs font-mono text-slate-400">Modern Treasury Dual-Ledger Sync Matrix</p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                  <span className="text-xs font-mono text-slate-400">4 OF 4 LEDGERS SYNCHRONIZED</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {liquidityHubs.map((hub) => (
                  <div
                    key={hub.id}
                    onClick={() => setSelectedHub(hub.id)}
                    className={`cursor-pointer rounded-xl p-5 border transition-all duration-200 relative overflow-hidden ${
                      selectedHub === hub.id
                        ? 'border-amber-500/50 bg-gradient-to-b from-slate-900 to-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                        : 'border-slate-800/80 bg-slate-950/40 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    {/* Top Hub Bar */}
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-2.5">
                        <div className={`p-2 rounded-lg ${hub.isCitiCore ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'}`}>
                          <Landmark className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-mono font-bold text-slate-200">{hub.code}</span>
                            {hub.isCitiCore && (
                              <span className="px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 text-[9px] font-mono border border-rose-500/20 font-semibold">
                                CITI CORE
                              </span>
                            )}
                          </div>
                          <span className="text-xs text-slate-400 block line-clamp-1">{hub.institution}</span>
                        </div>
                      </div>

                      <div className="text-right">
                        <span className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                          hub.status === 'ONLINE' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {hub.status}
                        </span>
                      </div>
                    </div>

                    {/* Capacity and Liquidity Metrics */}
                    <div className="mt-4 pt-4 border-t border-slate-800/60 grid grid-cols-2 gap-3 font-mono text-xs">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Allocated Cap</span>
                        <span className="text-slate-300 font-semibold">{formatCurrency(hub.capacityAllocated)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase">Available Dry Powder</span>
                        <span className="text-emerald-400 font-semibold">{formatCurrency(hub.availableLiquidity)}</span>
                      </div>
                    </div>

                    {/* Rail and Latency Indicator */}
                    <div className="mt-3 flex items-center justify-between text-[11px] font-mono text-slate-400">
                      <div className="flex items-center gap-1.5">
                        <Radio className="w-3 h-3 text-cyan-400" />
                        <span className="text-slate-300 truncate max-w-[170px]">{hub.activeRail}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="w-3 h-3 text-slate-500" />
                        <span className={hub.currentLatency > 50 ? 'text-amber-400' : 'text-slate-400'}>
                          {hub.currentLatency}ms
                        </span>
                      </div>
                    </div>

                    {/* Selection Indicator line */}
                    {selectedHub === hub.id && (
                      <div className="absolute bottom-0 left-0 right-0 h-[2px] bg-gradient-to-r from-amber-400 to-emerald-400" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* In-Flight Payments Intercept Feed */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-6 backdrop-blur-xl">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 mb-6">
                <div className="flex items-center gap-3">
                  <div className="p-2 rounded-lg bg-purple-500/10 border border-purple-500/20 text-purple-400">
                    <ArrowRightLeft className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-white tracking-wide">Autonomous Payment Orders Stream</h3>
                    <p className="text-xs font-mono text-slate-400">Intercepted Citibank Rails Routed to Modern Treasury</p>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-cyan-400" />
                  <span>STREAMING REAL-TIME</span>
                </div>
              </div>

              {/* Transactions List */}
              <div className="space-y-3">
                {orders.map((order) => (
                  <div
                    key={order.id}
                    className="p-4 rounded-xl border border-slate-800/80 bg-slate-950/60 hover:border-slate-700 transition-all space-y-3"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-2">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-400">{order.id}</span>
                          <span className="text-xs font-mono text-slate-500">[{order.treasuryTrackingId}]</span>
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-semibold bg-cyan-500/10 text-cyan-300 border border-cyan-500/20">
                            {order.status}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-slate-100">{order.beneficiary}</h4>
                        <p className="text-xs font-mono text-slate-400">Counterparty: {order.counterpartyBank}</p>
                      </div>

                      <div className="lg:text-right font-mono">
                        <div className="text-lg font-bold text-white">{formatCurrency(order.amount, order.currency)}</div>
                        <div className="text-[11px] text-emerald-400 flex items-center lg:justify-end gap-1">
                          <span>Fee Savings: {Math.abs(order.feeDeltaBps)} bps</span>
                          <span>&bull;</span>
                          <span>Latency: {order.executionLatencyMs}ms</span>
                        </div>
                      </div>
                    </div>

                    {/* Routing Path Banner */}
                    <div className="p-2.5 rounded-lg bg-slate-900/90 border border-slate-800 flex flex-wrap items-center justify-between gap-2 text-xs font-mono">
                      <div className="flex items-center gap-2 text-slate-400">
                        <span className="line-through text-rose-400/80">{order.originalRail}</span>
                        <CornerDownRight className="w-3.5 h-3.5 text-amber-400" />
                        <span className="text-emerald-400 font-semibold">{order.reroutedRail}</span>
                      </div>

                      <div className="text-[11px] text-slate-400 italic">
                        &ldquo;{order.interceptReason}&rdquo;
                      </div>
                    </div>

                    {/* Cryptographic Ledger Signature */}
                    <div className="flex items-center justify-between text-[10px] font-mono text-slate-500 pt-1 border-t border-slate-800/40">
                      <div className="flex items-center gap-1 truncate max-w-xs sm:max-w-md">
                        <Fingerprint className="w-3 h-3 text-cyan-500 shrink-0" />
                        <span className="truncate">{order.hash}</span>
                      </div>
                      <span className="shrink-0">{order.timestamp}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </div>

          {/* Right Column: AI Routing Engine, Hub Details & Policy Controls */}
          <div className="xl:col-span-4 space-y-6">
            
            {/* Selected Liquidity Hub Deep Dive */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-6 backdrop-blur-xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-amber-400">
                  <Database className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Selected Secondary Hub</h3>
                </div>
                <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                  {selectedHubData.code}
                </span>
              </div>

              <div className="space-y-4">
                <div>
                  <h4 className="text-base font-bold text-white">{selectedHubData.name}</h4>
                  <p className="text-xs text-slate-400 font-mono mt-0.5">{selectedHubData.institution}</p>
                </div>

                <div className="p-3.5 rounded-xl bg-slate-950/70 border border-slate-800/80 space-y-2.5 font-mono text-xs">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Live Health SLA:</span>
                    <span className="text-emerald-400 font-bold">{selectedHubData.healthScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Avg Roundtrip Handshake:</span>
                    <span className="text-cyan-300 font-bold">{selectedHubData.currentLatency} ms</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Active Liquidity Rail:</span>
                    <span className="text-slate-200 font-bold truncate max-w-[180px]">{selectedHubData.activeRail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Capacity Utilization:</span>
                    <span className="text-amber-300 font-bold">
                      {Math.round((1 - selectedHubData.availableLiquidity / selectedHubData.capacityAllocated) * 100)}%
                    </span>
                  </div>
                </div>

                {/* Instant Sweep Injection Action */}
                <button
                  onClick={() => {
                    setTotalLiquidityRerouted(prev => prev + 250000000);
                    setAiTelemetryLog(logs => [
                      `[MANUAL SWEEP] $250,000,000 liquidity injected into ${selectedHubData.code} via Modern Treasury Instant Clearing API.`,
                      ...logs.slice(0, 5)
                    ]);
                  }}
                  className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/30 border border-amber-500/40 hover:border-amber-400 text-amber-200 font-mono text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center justify-center gap-2"
                >
                  <Zap className="w-3.5 h-3.5 text-amber-400" />
                  Inject $250M Liquidity Sweep
                </button>
              </div>
            </div>

            {/* AI Autonomous Policy Engine */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-6 backdrop-blur-xl space-y-4">
              <div className="flex items-center gap-2 text-cyan-400">
                <Cpu className="w-4 h-4" />
                <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Modern Treasury AI Engine</h3>
              </div>

              <div className="space-y-3 font-mono text-xs">
                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Fedwire Cutoff Predetection</span>
                  <span className="px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-[10px]">
                    T-15 MIN PREDICTIVE
                  </span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Multi-Sig Reroute Threshold</span>
                  <span className="text-slate-200 font-bold">$500,000,000.00</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Max Rail Latency Tolerance</span>
                  <span className="text-amber-400 font-bold">45.0 ms</span>
                </div>

                <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                  <span className="text-slate-400">Ledger Auto-Reconciliation</span>
                  <span className="text-emerald-400 font-bold">STRICT (Zero-Float)</span>
                </div>
              </div>
            </div>

            {/* Real-time AI Telemetry Log */}
            <div className="rounded-2xl border border-slate-800 bg-[#0B0F19]/90 p-6 backdrop-blur-xl space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-emerald-400">
                  <Activity className="w-4 h-4" />
                  <h3 className="text-sm font-bold uppercase tracking-wider font-mono">Autonomous Event Log</h3>
                </div>
                <span className="text-[10px] font-mono text-slate-500">LIVE FEED</span>
              </div>

              <div className="space-y-2 font-mono text-[11px] text-slate-300 max-h-64 overflow-y-auto pr-1">
                {aiTelemetryLog.map((log, index) => (
                  <div key={index} className="p-2.5 rounded-lg bg-slate-950/80 border border-slate-800/60 leading-relaxed">
                    <span className="text-amber-400/90 select-none">&gt; </span>
                    {log}
                  </div>
                ))}
              </div>
            </div>

            {/* Regulatory & Institutional Compliance Seal */}
            <div className="p-4 rounded-xl bg-gradient-to-b from-slate-900/60 to-slate-950/90 border border-slate-800/80 text-center space-y-2">
              <div className="flex items-center justify-center gap-2 text-slate-400 text-xs font-mono">
                <ShieldCheck className="w-4 h-4 text-amber-400" />
                <span>FEDWIRE / OCC TIER-1 RESILIENCE COMPLIANT</span>
              </div>
              <p className="text-[11px] text-slate-500 font-mono">
                Modern Treasury Virtual Clearing Layer HSM Key: <code className="text-slate-400">0xMT_SEC_9941_CITI_FAILOVER</code>
              </p>
            </div>

          </div>

        </div>

      </div>
    </div>
  );
};

export default ModernTreasuryResilienceGateway;