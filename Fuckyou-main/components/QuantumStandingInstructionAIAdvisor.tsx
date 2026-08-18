import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import {
  ShieldAlert,
  Cpu,
  Activity,
  Zap,
  TrendingUp,
  AlertOctagon,
  Layers,
  ArrowUpRight,
  BarChart3,
  CheckCircle2,
  Sliders,
  RefreshCw,
  KeyRound,
  Globe,
  Radio,
  Clock,
  Sparkles,
  ChevronRight,
  Lock,
  Flame,
  Scale,
  FileSpreadsheet
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface StandingInstruction {
  id: string;
  modernTreasuryRuleId: string;
  citiDirectRef: string;
  payeeName: string;
  payeeBic: string;
  payeeTier: 'TIER-0 SOVEREIGN' | 'TIER-1 SYSTEMIC' | 'STRATEGIC PARTNER' | 'OPERATIONAL VENDOR';
  amount: number;
  currency: string;
  frequency: 'HOURLY' | 'DAILY' | 'TRI-WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY';
  clearingRail: 'CITI_GLOBAL_SUB_SECOND' | 'CHIPS' | 'FEDWIRE_ULTRA' | 'TARGET2_ATOMIC';
  nextExecution: string;
  status: 'ACTIVE_LOCKED' | 'ANNEALING_REVIEW' | 'SUSPENDED' | 'CRITICAL_DISPUTE';
  workingCapitalAllocation: number; // in Millions USD
  baselineLitigationRisk: number; // 0-100%
  earlyTerminationPenalty: number;
}

export interface QuantumSimulationMetrics {
  qStateCoherence: number;
  liquidityRetentionDelta: number; // USD
  workingCapitalVelocityDelta: number; // + or - %
  payeeRelationshipFrictionIndex: number; // 0 to 100
  litigationProbability: number; // %
  alternativeRoutingArbitrage: number; // USD
  compositeRecommendation: 'PROCEED_CANCEL' | 'CONDITIONAL_HOLD' | 'QUANTUM_SPLIT_EXECUTION' | 'STRICT_ABORT';
  neuralConfidence: number; // 0.0 - 1.0
  entropyDecayRate: number;
}

// ============================================================================
// MOCK HIGH-NET-WORTH CORPORATE RECURRING INSTRUCTIONS
// ============================================================================

const STANDING_INSTRUCTIONS_DATA: StandingInstruction[] = [
  {
    id: 'SI-CITI-MT-9082-XQ',
    modernTreasuryRuleId: 'rule_live_01HZ89XKVNM72QA00129B87F',
    citiDirectRef: 'CITI-NY-LEDGER-8812-QST',
    payeeName: 'Aethelgard Sovereign Prime Liquidity S.A.',
    payeeBic: 'AETHCHZZXXX',
    payeeTier: 'TIER-0 SOVEREIGN',
    amount: 145000000.00,
    currency: 'USD',
    frequency: 'DAILY',
    clearingRail: 'CITI_GLOBAL_SUB_SECOND',
    nextExecution: 'In 47 mins (16:00:00 UTC)',
    status: 'ACTIVE_LOCKED',
    workingCapitalAllocation: 412.5,
    baselineLitigationRisk: 84.6,
    earlyTerminationPenalty: 2900000.00
  },
  {
    id: 'SI-CITI-MT-4401-EU',
    modernTreasuryRuleId: 'rule_live_09PL44KZMMP83QQ99812A11C',
    citiDirectRef: 'CITI-LDN-CORE-0922-EUR',
    payeeName: 'Nordic Euroclear Clearing & Collateral Vaults',
    payeeBic: 'EURONL2AXXX',
    payeeTier: 'TIER-1 SYSTEMIC',
    amount: 87500000.00,
    currency: 'EUR',
    frequency: 'TRI-WEEKLY',
    clearingRail: 'TARGET2_ATOMIC',
    nextExecution: 'Tomorrow @ 07:00:00 CET',
    status: 'ACTIVE_LOCKED',
    workingCapitalAllocation: 195.0,
    baselineLitigationRisk: 32.1,
    earlyTerminationPenalty: 875000.00
  },
  {
    id: 'SI-CITI-MT-1190-TK',
    modernTreasuryRuleId: 'rule_live_77JJ99XAPPR00ZZ11234F55M',
    citiDirectRef: 'CITI-TYO-INTRA-3391-JPY',
    payeeName: 'Mitsubishi-Sumitomo Synthetic Yield Facility',
    payeeBic: 'BOTKJPJTXXX',
    payeeTier: 'STRATEGIC PARTNER',
    amount: 32000000000.00,
    currency: 'JPY',
    frequency: 'MONTHLY',
    clearingRail: 'FEDWIRE_ULTRA',
    nextExecution: 'In 3 days',
    status: 'ANNEALING_REVIEW',
    workingCapitalAllocation: 218.4,
    baselineLitigationRisk: 14.8,
    earlyTerminationPenalty: 0.00
  }
];

// ============================================================================
// COMPONENT
// ============================================================================

export const QuantumStandingInstructionAIAdvisor: React.FC = () => {
  const [selectedInstruction, setSelectedInstruction] = useState<StandingInstruction>(STANDING_INSTRUCTIONS_DATA[0]);
  const [isSimulating, setIsSimulating] = useState<boolean>(false);
  const [stressShockBps, setStressShockBps] = useState<number>(75);
  const [counterpartyTensionWeight, setCounterpartyTensionWeight] = useState<number>(65);
  const [annealingCycles, setAnnealingCycles] = useState<number>(1048576);
  const [activeTab, setActiveTab] = useState<'NEURAL_CURVE' | 'QUANTUM_STATE' | 'LEDGER_PAYLOAD' | 'RISK_MATRIX'>('NEURAL_CURVE');
  const [hsmAuthStep, setHsmAuthStep] = useState<number>(0);
  const [isAuthorizingCancel, setIsAuthorizingCancel] = useState<boolean>(false);
  const [qubitCoherence, setQubitCoherence] = useState<number>(99.984);
  const [activeTelemetryTick, setActiveTelemetryTick] = useState<number>(0);

  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  // Periodic Telemetry Clock
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveTelemetryTick((prev) => prev + 1);
      setQubitCoherence(99.94 + Math.random() * 0.05);
    }, 1800);
    return () => clearInterval(timer);
  }, []);

  // Compute Quantum Simulation Metrics Dynamically
  const simulationMetrics = useMemo<QuantumSimulationMetrics>(() => {
    const rawAmt = selectedInstruction.amount;
    const isUsd = selectedInstruction.currency === 'USD';
    const normalizedAmtUSD = isUsd ? rawAmt : rawAmt / (selectedInstruction.currency === 'EUR' ? 1.08 : 155.0);

    const liquidityRetention = normalizedAmtUSD * (1 - (selectedInstruction.earlyTerminationPenalty / normalizedAmtUSD));
    const frictionBase = (selectedInstruction.baselineLitigationRisk * 0.6) + (counterpartyTensionWeight * 0.4);
    const litRisk = Math.min(99.4, frictionBase + (stressShockBps * 0.08));
    const velocityDelta = -1.4 * (stressShockBps / 20) + (selectedInstruction.payeeTier === 'TIER-0 SOVEREIGN' ? -12.4 : 4.2);
    
    let recommendation: QuantumSimulationMetrics['compositeRecommendation'] = 'CONDITIONAL_HOLD';
    if (litRisk > 75 && selectedInstruction.payeeTier === 'TIER-0 SOVEREIGN') {
      recommendation = 'STRICT_ABORT';
    } else if (liquidityRetention > 50000000 && frictionBase < 40) {
      recommendation = 'PROCEED_CANCEL';
    } else if (frictionBase >= 40 && frictionBase <= 75) {
      recommendation = 'QUANTUM_SPLIT_EXECUTION';
    }

    const confidence = Math.min(0.9998, 0.945 + (annealingCycles / 20000000) - (stressShockBps * 0.0002));

    return {
      qStateCoherence: qubitCoherence,
      liquidityRetentionDelta: liquidityRetention,
      workingCapitalVelocityDelta: parseFloat(velocityDelta.toFixed(2)),
      payeeRelationshipFrictionIndex: Math.min(100, Math.round(frictionBase)),
      litigationProbability: parseFloat(litRisk.toFixed(1)),
      alternativeRoutingArbitrage: normalizedAmtUSD * 0.0034,
      compositeRecommendation: recommendation,
      neuralConfidence: parseFloat(confidence.toFixed(4)),
      entropyDecayRate: 0.0014
    };
  }, [selectedInstruction, stressShockBps, counterpartyTensionWeight, annealingCycles, qubitCoherence]);

  // Render Neural Confidence Curve on Canvas
  const drawNeuralCurve = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const width = (canvas.width = canvas.parentElement?.clientWidth || 700);
    const height = (canvas.height = 280);

    ctx.clearRect(0, 0, width, height);

    // Background Grid
    ctx.strokeStyle = 'rgba(212, 175, 55, 0.08)';
    ctx.lineWidth = 1;
    for (let x = 0; x < width; x += 40) {
      ctx.beginPath();
      ctx.moveTo(x, 0);
      ctx.lineTo(x, height);
      ctx.stroke();
    }
    for (let y = 0; y < height; y += 30) {
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(width, y);
      ctx.stroke();
    }

    // Confidence Band Area
    const gradientBand = ctx.createLinearGradient(0, 0, width, height);
    gradientBand.addColorStop(0, 'rgba(16, 185, 129, 0.18)');
    gradientBand.addColorStop(0.5, 'rgba(212, 175, 55, 0.12)');
    gradientBand.addColorStop(1, 'rgba(239, 68, 68, 0.05)');

    ctx.beginPath();
    ctx.moveTo(0, height * 0.7);

    // Neural Wave Points
    const points: { x: number; y: number }[] = [];
    const step = width / 12;
    const shockFactor = stressShockBps / 100;

    for (let i = 0; i <= 12; i++) {
      const x = i * step;
      const wave = Math.sin((i + activeTelemetryTick * 0.2) * 0.8) * (18 * shockFactor);
      const baseDecay = (height * 0.35) + (i * (height * 0.035) * (simulationMetrics.payeeRelationshipFrictionIndex / 50));
      const y = Math.min(height - 20, Math.max(20, baseDecay + wave));
      points.push({ x, y });
    }

    // Upper Curve
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y - 25);
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      const cy = (points[i - 1].y + points[i].y) / 2 - 25;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y - 25, cx, cy);
    }
    // Lower Curve Reverse
    for (let i = points.length - 1; i >= 0; i--) {
      ctx.lineTo(points[i].x, points[i].y + 35);
    }
    ctx.closePath();
    ctx.fillStyle = gradientBand;
    ctx.fill();

    // Primary Confidence Path Line (Gold Glow)
    ctx.beginPath();
    ctx.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
      const cx = (points[i - 1].x + points[i].x) / 2;
      const cy = (points[i - 1].y + points[i].y) / 2;
      ctx.quadraticCurveTo(points[i - 1].x, points[i - 1].y, cx, cy);
    }
    ctx.strokeStyle = '#D4AF37';
    ctx.lineWidth = 2.5;
    ctx.shadowColor = '#D4AF37';
    ctx.shadowBlur = 12;
    ctx.stroke();
    ctx.shadowBlur = 0;

    // Draw Quantum Superposition Nodes
    points.forEach((pt, idx) => {
      if (idx % 2 === 0) {
        ctx.beginPath();
        ctx.arc(pt.x, pt.y, 4.5, 0, Math.PI * 2);
        ctx.fillStyle = '#10B981';
        ctx.fill();
        ctx.strokeStyle = '#052E16';
        ctx.lineWidth = 2;
        ctx.stroke();

        // Subtext Epoch
        ctx.fillStyle = 'rgba(212, 175, 55, 0.7)';
        ctx.font = '9px monospace';
        ctx.fillText(`τ+${idx * 6}h`, pt.x - 10, pt.y - 12);
      }
    });

  }, [stressShockBps, activeTelemetryTick, simulationMetrics]);

  useEffect(() => {
    if (activeTab === 'NEURAL_CURVE') {
      drawNeuralCurve();
    }
  }, [drawNeuralCurve, activeTab]);

  const triggerQuantumAnneal = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setAnnealingCycles((prev) => prev + 524288);
      setIsSimulating(false);
    }, 1200);
  };

  const handleStartCancellationFlow = () => {
    setIsAuthorizingCancel(true);
    setHsmAuthStep(1);
  };

  const handleAdvanceHsmStep = () => {
    if (hsmAuthStep < 3) {
      setHsmAuthStep(hsmAuthStep + 1);
    } else {
      setTimeout(() => {
        setIsAuthorizingCancel(false);
        setHsmAuthStep(0);
        alert(`STANDING INSTRUCTION TERMINATION BROADCAST: Instruction ${selectedInstruction.id} cancelled across Citibank NY Federal Gateway & Modern Treasury Ledger. Liquidity reclaimed: $${(simulationMetrics.liquidityRetentionDelta / 1e6).toFixed(2)}M.`);
      }, 700);
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#07090E] text-slate-100 p-4 md:p-8 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* TOP HEADER: CITIBANK LUXURY + MODERN TREASURY INTEGRATION */}
      <div className="max-w-7xl mx-auto border border-[#D4AF37]/30 bg-gradient-to-r from-[#0C1017] via-[#101724] to-[#0A0D14] rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden mb-6">
        <div className="absolute top-0 right-0 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative z-10">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-semibold uppercase tracking-widest bg-gradient-to-r from-[#D4AF37]/20 to-[#996515]/20 border border-[#D4AF37]/40 text-[#FFDF73] rounded-full flex items-center gap-1.5 shadow-sm">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                Citi Private Bank • Quantum Liquidity Core
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono bg-emerald-950/60 border border-emerald-500/30 text-emerald-400 rounded-md">
                MODERN TREASURY SYNC: 100%
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-light tracking-tight text-white flex items-center gap-3">
              Standing Instruction <span className="font-serif italic text-[#D4AF37]">Quantum AI Advisory</span>
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-2xl">
              Real-time quantum-annealed evaluation of intra-day liquidity velocity, payee relationship volatility,
              and cross-border systemic litigation exposure before cancelling multi-million standing orders.
            </p>
          </div>

          {/* Realtime Quantum Telemetry Pill */}
          <div className="flex flex-wrap lg:flex-nowrap items-center gap-4 bg-black/60 border border-slate-800 p-3.5 rounded-xl">
            <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
              <div className="relative">
                <Cpu className="w-6 h-6 text-[#D4AF37] animate-pulse" />
                <span className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-400 rounded-full" />
              </div>
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Q-Lattice Coherence</div>
                <div className="text-sm font-mono font-bold text-emerald-300">{qubitCoherence.toFixed(3)}%</div>
              </div>
            </div>

            <div className="flex items-center gap-3 border-r border-slate-800 pr-4">
              <Radio className="w-5 h-5 text-sky-400" />
              <div>
                <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Modern Treasury Ledger</div>
                <div className="text-xs font-mono font-semibold text-slate-200">citi_sub_second_live</div>
              </div>
            </div>

            <button
              onClick={triggerQuantumAnneal}
              disabled={isSimulating}
              className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-[#B38B22] hover:from-[#E5C158] hover:to-[#C69A2B] text-black font-semibold text-xs tracking-wide rounded-lg flex items-center gap-2 transition duration-200 active:scale-95 shadow-lg disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Annealing (2²⁰)...' : 'Re-Anneal Superposition'}
            </button>
          </div>
        </div>
      </div>

      {/* MAIN COCKPIT GRID */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: STANDING INSTRUCTION SELECTION & ATTRIBUTES (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Instruction Switcher */}
          <div className="bg-[#0D121D] border border-slate-800/90 rounded-2xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xs font-mono uppercase tracking-widest text-[#D4AF37] flex items-center gap-2">
                <Layers className="w-4 h-4" /> Active Standing Directives
              </h2>
              <span className="text-[11px] text-slate-400 font-mono">3 Active Streams</span>
            </div>

            <div className="space-y-3">
              {STANDING_INSTRUCTIONS_DATA.map((si) => {
                const isSelected = selectedInstruction.id === si.id;
                return (
                  <div
                    key={si.id}
                    onClick={() => setSelectedInstruction(si)}
                    className={`p-3.5 rounded-xl border transition cursor-pointer text-left ${
                      isSelected
                        ? 'bg-gradient-to-r from-[#D4AF37]/15 via-slate-900 to-slate-900 border-[#D4AF37]/60 shadow-lg'
                        : 'bg-black/40 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div>
                        <div className="text-xs font-bold text-white flex items-center gap-1.5">
                          {si.payeeName}
                        </div>
                        <div className="text-[10px] font-mono text-slate-400 mt-0.5">
                          {si.citiDirectRef}
                        </div>
                      </div>
                      <span className={`text-[9px] px-2 py-0.5 rounded font-mono font-bold ${
                        si.payeeTier === 'TIER-0 SOVEREIGN' ? 'bg-purple-950 text-purple-300 border border-purple-800' :
                        si.payeeTier === 'TIER-1 SYSTEMIC' ? 'bg-blue-950 text-blue-300 border border-blue-800' :
                        'bg-amber-950 text-amber-300 border border-amber-800'
                      }`}>
                        {si.payeeTier}
                      </span>
                    </div>

                    <div className="mt-3 flex items-baseline justify-between pt-2 border-t border-slate-800/60 font-mono">
                      <span className="text-xs text-slate-400">Scheduled Outflow:</span>
                      <span className="text-sm font-semibold text-[#FFDF73]">
                        {si.currency} {si.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div className="mt-1 flex items-center justify-between text-[11px] text-slate-500 font-mono">
                      <span>Freq: {si.frequency}</span>
                      <span className="text-amber-400 flex items-center gap-1">
                        <Clock className="w-3 h-3" /> {si.nextExecution}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Instruction Live Attributes */}
          <div className="bg-[#0D121D] border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 flex items-center gap-2">
              <Globe className="w-4 h-4 text-sky-400" /> Counterparty & Settlement Vector
            </h3>

            <div className="grid grid-cols-2 gap-3 text-xs font-mono">
              <div className="p-2.5 bg-black/40 border border-slate-800 rounded-lg">
                <div className="text-slate-500 text-[10px]">PAYEE BIC</div>
                <div className="text-slate-200 font-bold mt-0.5">{selectedInstruction.payeeBic}</div>
              </div>
              <div className="p-2.5 bg-black/40 border border-slate-800 rounded-lg">
                <div className="text-slate-500 text-[10px]">CLEARING RAIL</div>
                <div className="text-emerald-400 font-bold mt-0.5">{selectedInstruction.clearingRail}</div>
              </div>
              <div className="p-2.5 bg-black/40 border border-slate-800 rounded-lg">
                <div className="text-slate-500 text-[10px]">EARLY CANCEL PENALTY</div>
                <div className="text-rose-400 font-bold mt-0.5">
                  ${(selectedInstruction.earlyTerminationPenalty).toLocaleString()}
                </div>
              </div>
              <div className="p-2.5 bg-black/40 border border-slate-800 rounded-lg">
                <div className="text-slate-500 text-[10px]">ALLOCATED WORKING CAP</div>
                <div className="text-[#D4AF37] font-bold mt-0.5">
                  ${selectedInstruction.workingCapitalAllocation}M
                </div>
              </div>
            </div>

            {/* Quantum Stress Shock Dial */}
            <div className="pt-2 border-t border-slate-800/80">
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-mono flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" /> Macro Liquidity Stress Shock
                </span>
                <span className="font-mono text-[#D4AF37] font-bold">+{stressShockBps} bps</span>
              </div>
              <input
                type="range"
                min="0"
                max="300"
                step="5"
                value={stressShockBps}
                onChange={(e) => setStressShockBps(Number(e.target.value))}
                className="w-full accent-[#D4AF37] bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
              <div className="flex justify-between text-[10px] text-slate-500 font-mono mt-1">
                <span>Baseline (0)</span>
                <span>Mild (+100)</span>
                <span>Extreme Volatility (+300)</span>
              </div>
            </div>

            {/* Counterparty Friction Sensitivity */}
            <div>
              <div className="flex justify-between items-center text-xs mb-1.5">
                <span className="text-slate-300 font-mono flex items-center gap-1.5">
                  <Scale className="w-3.5 h-3.5 text-rose-400" /> Payee Litigious Tension Bias
                </span>
                <span className="font-mono text-rose-400 font-bold">{counterpartyTensionWeight}%</span>
              </div>
              <input
                type="range"
                min="10"
                max="100"
                step="1"
                value={counterpartyTensionWeight}
                onChange={(e) => setCounterpartyTensionWeight(Number(e.target.value))}
                className="w-full accent-rose-500 bg-slate-800 rounded-lg h-1.5 cursor-pointer"
              />
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI QUANTUM ADVISORY ENGINE & VISUALIZATIONS (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">

          {/* AI DECISION BANNER */}
          <div className={`p-6 rounded-2xl border backdrop-blur-md relative overflow-hidden transition-all duration-300 ${
            simulationMetrics.compositeRecommendation === 'PROCEED_CANCEL'
              ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
              : simulationMetrics.compositeRecommendation === 'QUANTUM_SPLIT_EXECUTION'
              ? 'bg-amber-950/30 border-amber-500/50 text-amber-200'
              : simulationMetrics.compositeRecommendation === 'CONDITIONAL_HOLD'
              ? 'bg-sky-950/30 border-sky-500/50 text-sky-200'
              : 'bg-rose-950/40 border-rose-500/60 text-rose-200'
          }`}>
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative z-10">
              <div>
                <div className="text-xs font-mono uppercase tracking-widest opacity-80 flex items-center gap-2">
                  <Zap className="w-4 h-4" /> AI Quantum Recommendation Horizon
                </div>
                <div className="text-2xl md:text-3xl font-serif tracking-wide font-bold mt-1 text-white flex items-center gap-3">
                  {simulationMetrics.compositeRecommendation === 'PROCEED_CANCEL' && 'CANCEL DIRECTIVE APPROVED'}
                  {simulationMetrics.compositeRecommendation === 'QUANTUM_SPLIT_EXECUTION' && 'EXECUTE QUANTUM SPLIT (50/50)'}
                  {simulationMetrics.compositeRecommendation === 'CONDITIONAL_HOLD' && 'HOLD EXECUTION PENDING RATE SET'}
                  {simulationMetrics.compositeRecommendation === 'STRICT_ABORT' && 'ABORT CANCELLATION: SOVEREIGN RISK'}
                </div>
                <p className="text-xs text-slate-300 mt-2 max-w-xl">
                  {simulationMetrics.compositeRecommendation === 'PROCEED_CANCEL' && 'High liquidity recapture with minimal relationship degradation. Legal indemnities remain intact under ISDA Master Protocol.'}
                  {simulationMetrics.compositeRecommendation === 'QUANTUM_SPLIT_EXECUTION' && 'Full cancellation triggers excessive friction. Recommend splitting standing amount across Citi Intraday Vaults and Modern Treasury overnight sweep.'}
                  {simulationMetrics.compositeRecommendation === 'CONDITIONAL_HOLD' && 'Liquidity velocity delta is neutral. Awaiting European Central Bank repo window fix before final instruction revocation.'}
                  {simulationMetrics.compositeRecommendation === 'STRICT_ABORT' && 'Critical warning: Unilateral standing instruction revocation will trigger immediate counterparty litigation & Tier-0 sovereign collateral penalties.'}
                </p>
              </div>

              {/* Neural Confidence Gauge */}
              <div className="bg-black/50 border border-white/10 p-4 rounded-xl text-right min-w-[170px]">
                <div className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">Neural Confidence</div>
                <div className="text-2xl font-mono font-bold text-[#FFDF73]">
                  {(simulationMetrics.neuralConfidence * 100).toFixed(2)}%
                </div>
                <div className="text-[10px] text-emerald-400 font-mono mt-0.5">
                  {(annealingCycles).toLocaleString()} Superposition States
                </div>
              </div>
            </div>
          </div>

          {/* KEY QUANTUM KPI TILES */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="bg-[#0D121D] border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Retained Liquidity</span>
                <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
              </div>
              <div className="text-lg font-mono font-bold text-emerald-400 mt-1">
                +${(simulationMetrics.liquidityRetentionDelta / 1e6).toFixed(2)}M
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Net of termination fee</div>
            </div>

            <div className="bg-[#0D121D] border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>WCV Velocity Delta</span>
                <Activity className="w-3.5 h-3.5 text-[#D4AF37]" />
              </div>
              <div className="text-lg font-mono font-bold text-[#D4AF37] mt-1">
                {simulationMetrics.workingCapitalVelocityDelta > 0 ? '+' : ''}
                {simulationMetrics.workingCapitalVelocityDelta}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Working cap velocity</div>
            </div>

            <div className="bg-[#0D121D] border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Payee Friction</span>
                <Flame className="w-3.5 h-3.5 text-amber-400" />
              </div>
              <div className="text-lg font-mono font-bold text-amber-400 mt-1">
                {simulationMetrics.payeeRelationshipFrictionIndex} / 100
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Counterparty tension index</div>
            </div>

            <div className="bg-[#0D121D] border border-slate-800 p-4 rounded-xl shadow-lg">
              <div className="text-[11px] font-mono text-slate-400 uppercase flex items-center justify-between">
                <span>Litigation Risk</span>
                <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
              </div>
              <div className="text-lg font-mono font-bold text-rose-400 mt-1">
                {simulationMetrics.litigationProbability}%
              </div>
              <div className="text-[10px] text-slate-500 font-mono mt-0.5">Dispute trigger prob</div>
            </div>
          </div>

          {/* INTERACTIVE WORKSPACE TABS */}
          <div className="bg-[#0D121D] border border-slate-800 rounded-2xl overflow-hidden shadow-2xl">
            {/* Tab Bar */}
            <div className="flex border-b border-slate-800 bg-black/40 px-4 pt-3 gap-2">
              <button
                onClick={() => setActiveTab('NEURAL_CURVE')}
                className={`px-4 py-2.5 text-xs font-mono tracking-wider rounded-t-lg transition flex items-center gap-2 ${
                  activeTab === 'NEURAL_CURVE'
                    ? 'bg-[#0D121D] border-t-2 border-[#D4AF37] text-[#FFDF73] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" /> Neural Confidence Wave
              </button>
              <button
                onClick={() => setActiveTab('QUANTUM_STATE')}
                className={`px-4 py-2.5 text-xs font-mono tracking-wider rounded-t-lg transition flex items-center gap-2 ${
                  activeTab === 'QUANTUM_STATE'
                    ? 'bg-[#0D121D] border-t-2 border-[#D4AF37] text-[#FFDF73] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" /> Qubit Annealing State Vector
              </button>
              <button
                onClick={() => setActiveTab('LEDGER_PAYLOAD')}
                className={`px-4 py-2.5 text-xs font-mono tracking-wider rounded-t-lg transition flex items-center gap-2 ${
                  activeTab === 'LEDGER_PAYLOAD'
                    ? 'bg-[#0D121D] border-t-2 border-[#D4AF37] text-[#FFDF73] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileSpreadsheet className="w-3.5 h-3.5" /> MT/Citi Ledger Payload
              </button>
              <button
                onClick={() => setActiveTab('RISK_MATRIX')}
                className={`px-4 py-2.5 text-xs font-mono tracking-wider rounded-t-lg transition flex items-center gap-2 ${
                  activeTab === 'RISK_MATRIX'
                    ? 'bg-[#0D121D] border-t-2 border-[#D4AF37] text-[#FFDF73] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <AlertOctagon className="w-3.5 h-3.5" /> Relationship Matrix
              </button>
            </div>

            {/* Tab Content 1: Neural Confidence Curve */}
            {activeTab === 'NEURAL_CURVE' && (
              <div className="p-5 space-y-4">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400">
                  <span>Dynamic Predictive Confidence Trajectory (72-Hour Horizon)</span>
                  <span className="text-[#D4AF37] flex items-center gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                    Simulated at 128 Epochs/sec
                  </span>
                </div>
                <div className="w-full bg-black/60 rounded-xl p-2 border border-slate-800">
                  <canvas ref={canvasRef} className="w-full block" />
                </div>
                <div className="grid grid-cols-3 gap-3 text-[11px] font-mono text-slate-400 pt-1">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#10B981]" />
                    <span>Settlement Window (Zero Decay)</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-[#D4AF37]" />
                    <span>Expected Working Cap Return</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span>Breach / Dispute Boundary</span>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 2: Quantum State Vector */}
            {activeTab === 'QUANTUM_STATE' && (
              <div className="p-5 space-y-4 font-mono text-xs">
                <div className="bg-black/50 p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-emerald-400 font-bold uppercase tracking-wider text-xs">
                    |Ψ_StandingInstruction⟩ = α|Execute⟩ + β|Cancel⟩ + γ|Split⟩
                  </div>
                  <div className="text-slate-400">
                    State Probability Distribution calculated via Quantum Annealing (Adiabatic Eigenstate formulation):
                  </div>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>P(Full Cancellation)</span>
                        <span>44.2%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-emerald-400 h-2 rounded-full" style={{ width: '44.2%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>P(Hold Directive)</span>
                        <span>18.6%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-sky-400 h-2 rounded-full" style={{ width: '18.6%' }} />
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-slate-300 mb-1">
                        <span>P(Synthetic Quantum Split)</span>
                        <span>37.2%</span>
                      </div>
                      <div className="w-full bg-slate-800 rounded-full h-2">
                        <div className="bg-[#D4AF37] h-2 rounded-full" style={{ width: '37.2%' }} />
                      </div>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-slate-400">
                  <div className="p-3 bg-black/40 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500">HAMILTONIAN OPERATOR</span>
                    <p className="text-slate-200 mt-1 font-bold">H_citi = ∑ J_ij σ_z^i σ_z^j + h_i σ_x^i</p>
                  </div>
                  <div className="p-3 bg-black/40 border border-slate-800 rounded-lg">
                    <span className="text-[10px] text-slate-500">FIDELITY INDEX</span>
                    <p className="text-[#FFDF73] mt-1 font-bold">F = 0.99982 (Quantum Supremacy Validated)</p>
                  </div>
                </div>
              </div>
            )}

            {/* Tab Content 3: Ledger API Payload */}
            {activeTab === 'LEDGER_PAYLOAD' && (
              <div className="p-5 font-mono text-xs">
                <div className="bg-black/70 p-4 rounded-xl border border-slate-800 text-slate-300 overflow-x-auto">
                  <div className="text-emerald-400 font-bold mb-2">// Modern Treasury Ledger + CitiDirect Integration Payload</div>
                  <pre className="text-[11px] leading-relaxed">
{JSON.stringify({
  action: "REPUTE_STANDING_INSTRUCTION_CANCELLATION",
  client_entity: "CITIGROUP_GLOBAL_MARKETS_ULTRA_HNW",
  modern_treasury_rule_id: selectedInstruction.modernTreasuryRuleId,
  citidirect_settlement_reference: selectedInstruction.citiDirectRef,
  beneficiary: {
    name: selectedInstruction.payeeName,
    bic: selectedInstruction.payeeBic,
    tier: selectedInstruction.payeeTier,
    clearing_system: selectedInstruction.clearingRail
  },
  financials: {
    scheduled_amount: selectedInstruction.amount,
    currency: selectedInstruction.currency,
    reclaimed_liquidity_usd: simulationMetrics.liquidityRetentionDelta,
    calculated_termination_fee: selectedInstruction.earlyTerminationPenalty
  },
  ai_quantum_validation: {
    annealing_cycles: annealingCycles,
    neural_confidence: simulationMetrics.neuralConfidence,
    recommendation: simulationMetrics.compositeRecommendation,
    stress_shock_applied_bps: stressShockBps,
    q_coherence: qubitCoherence
  },
  quorum_security: {
    hsm_enclave: "HSM-CITI-VAULT-091A-FIPS-140-3",
    timestamp: new Date().toISOString()
  }
}, null, 2)}
                  </pre>
                </div>
              </div>
            )}

            {/* Tab Content 4: Relationship Risk Matrix */}
            {activeTab === 'RISK_MATRIX' && (
              <div className="p-5 space-y-4 font-mono text-xs">
                <div className="p-4 bg-black/40 border border-slate-800 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-300 font-bold">Counterparty Relationship Sensitivity</span>
                    <span className="text-rose-400 font-bold">{selectedInstruction.payeeTier}</span>
                  </div>
                  <p className="text-slate-400 text-[11px]">
                    Evaluation of ISDA collateral thresholds, bilateral credit support annex (CSA) ratings,
                    and cross-clearing spillover risk should the standing order be cancelled.
                  </p>
                  <div className="grid grid-cols-3 gap-3 pt-2">
                    <div className="p-2.5 bg-black/60 rounded border border-slate-800">
                      <div className="text-slate-500 text-[10px]">CSA THRESHOLD</div>
                      <div className="text-slate-200 font-bold">$50,000,000</div>
                    </div>
                    <div className="p-2.5 bg-black/60 rounded border border-slate-800">
                      <div className="text-slate-500 text-[10px]">ARBITRATION VENUE</div>
                      <div className="text-slate-200 font-bold">LCIA London</div>
                    </div>
                    <div className="p-2.5 bg-black/60 rounded border border-slate-800">
                      <div className="text-slate-500 text-[10px]">RECOVERY FRICTION</div>
                      <div className="text-amber-400 font-bold">MEDIUM-HIGH</div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* ACTION FOOTER: CANCELLATION EXECUTION BAR */}
            <div className="p-4 bg-black/60 border-t border-slate-800 flex flex-col sm:flex-row justify-between items-center gap-4">
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <Lock className="w-4 h-4 text-[#D4AF37]" />
                <span>HSM Hardware Signing Enclave: <strong className="text-emerald-400">FIPS 140-3 ACTIVE</strong></span>
              </div>

              <div className="flex items-center gap-3">
                <button
                  onClick={() => alert(`Instruction ${selectedInstruction.id} modification scheduled for split execution.`)}
                  className="px-4 py-2 text-xs font-mono uppercase bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg transition"
                >
                  Schedule Quantum Split
                </button>
                <button
                  onClick={handleStartCancellationFlow}
                  className="px-5 py-2 text-xs font-mono uppercase font-bold tracking-wider bg-gradient-to-r from-rose-600 to-rose-700 hover:from-rose-500 hover:to-rose-600 text-white rounded-lg shadow-lg shadow-rose-900/40 flex items-center gap-2 transition active:scale-95"
                >
                  <AlertOctagon className="w-4 h-4" /> Cancel Standing Directive
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MULTI-STAGE BIOMETRIC / HSM CANCELLATION MODAL */}
      {isAuthorizingCancel && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-50 flex items-center justify-center p-4">
          <div className="bg-[#0B0F17] border border-[#D4AF37] rounded-2xl max-w-lg w-full p-6 shadow-2xl relative space-y-5 animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-start border-b border-slate-800 pb-3">
              <div>
                <span className="text-[10px] font-mono uppercase px-2 py-0.5 bg-[#D4AF37]/20 text-[#FFDF73] rounded">
                  Citibank Sovereign Dual-Custody Protocol
                </span>
                <h3 className="text-lg font-serif text-white font-bold mt-1">
                  Confirm Directive Cancellation
                </h3>
              </div>
              <button
                onClick={() => { setIsAuthorizingCancel(false); setHsmAuthStep(0); }}
                className="text-slate-400 hover:text-white font-mono text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div className="p-3 bg-rose-950/30 border border-rose-800/60 rounded-lg text-rose-200">
                You are about to cancel recurring instruction <strong>{selectedInstruction.id}</strong> targeting <strong>{selectedInstruction.payeeName}</strong>.
              </div>

              {/* Progress Steps */}
              <div className="space-y-2 py-2">
                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  hsmAuthStep >= 1 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-black/40 border-slate-800 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    <KeyRound className="w-4 h-4" /> 1. Citigroup FIPS Enclave HSM Token
                  </span>
                  {hsmAuthStep >= 1 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  hsmAuthStep >= 2 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-black/40 border-slate-800 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    <Cpu className="w-4 h-4" /> 2. Modern Treasury Ledger Lock Release
                  </span>
                  {hsmAuthStep >= 2 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>

                <div className={`p-2.5 rounded-lg border flex items-center justify-between ${
                  hsmAuthStep >= 3 ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300' : 'bg-black/40 border-slate-800 text-slate-500'
                }`}>
                  <span className="flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4" /> 3. Treasury Board Sovereign Quorum
                  </span>
                  {hsmAuthStep >= 3 && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
                </div>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-3 border-t border-slate-800">
              <button
                onClick={() => { setIsAuthorizingCancel(false); setHsmAuthStep(0); }}
                className="px-4 py-2 text-xs font-mono text-slate-400 hover:text-white"
              >
                Abort
              </button>
              <button
                onClick={handleAdvanceHsmStep}
                className="px-5 py-2 text-xs font-mono uppercase font-bold bg-[#D4AF37] hover:bg-[#FFDF73] text-black rounded-lg shadow-lg flex items-center gap-1.5 transition"
              >
                {hsmAuthStep === 0 && 'Begin HSM Authorization'}
                {hsmAuthStep === 1 && 'Confirm HSM Token'}
                {hsmAuthStep === 2 && 'Approve MT Ledger Unlock'}
                {hsmAuthStep === 3 && 'Broadcast Termination'}
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default QuantumStandingInstructionAIAdvisor;