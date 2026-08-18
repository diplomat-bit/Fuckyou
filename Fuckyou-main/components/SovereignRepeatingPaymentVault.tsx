"use client";

import React, { useState, useEffect, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Shield,
  Crown,
  Landmark,
  RefreshCw,
  Zap,
  TrendingUp,
  AlertOctagon,
  Terminal,
  Key,
  Lock,
  ArrowUpRight,
  Cpu,
  Layers,
  DollarSign,
  Activity,
  Sliders,
  Clock,
  ChevronRight,
  Globe,
  Radio,
  FileCheck2,
  CheckCircle2,
  XCircle,
  PauseCircle,
  PlayCircle,
  Flame,
  Search,
  Sparkles,
  Eye,
  SlidersHorizontal,
  Workflow
} from "lucide-react";

// --- TYPES & INTERFACES ---

export type CurrencyDenomination = "USD" | "EUR" | "XAU_OZ" | "AED" | "SDR";

export type StandingInstructionStatus =
  | "ACTIVE_SOVEREIGN_PRIORITY"
  | "AI_OPTIMIZING"
  | "LIQUIDITY_BUFFERED"
  | "HELD_FOR_DUAL_KEY"
  | "TERMINATION_PENDING"
  | "REVOKED";

export interface RecurringPaymentInstruction {
  id: string;
  referenceCode: string;
  beneficiary: {
    entityName: string;
    jurisdiction: string;
    institution: "Citibank N.A. London" | "Citibank Zurich Private Vault" | "Modern Treasury Sovereign Ledger" | "Monetary Authority of Singapore";
    routingBic: string;
    riskScore: number; // 0-100
    sovereignTier: "Tier-0 Imperial" | "Tier-1 Central Bank" | "Tier-2 Supranational";
  };
  allocationCategory: "Petro-Settlement" | "Gold Bullion Lease" | "AI Compute Syndicate" | "Sovereign Debt Service" | "Dynastic Trust Conduit";
  frequency: "DAILY_ROLLOVER" | "WEEKLY_SWEEP" | "BI_WEEKLY_NET" | "MONTHLY_SETTLEMENT" | "PERPETUAL_WATERFALL";
  baseAmount: number;
  currency: CurrencyDenomination;
  executedRuns: number;
  lifetimeDisbursed: number;
  nextExecutionDate: string;
  priorityWeight: number; // 1 to 10
  status: StandingInstructionStatus;
  aiVarianceDamping: boolean;
  smartRoutingProtocol: string;
  telemetryLatencyMs: number;
  lastExecutionTx: string;
}

export interface CashFlowWaterfallNode {
  tier: string;
  sourceAmount: number;
  absorbedAmount: number;
  spilloverTarget: string;
  flowVelocityPerSec: number;
  purityGrade: string;
}

// --- MOCK SOVEREIGN DATA ---

const INITIAL_INSTRUCTIONS: RecurringPaymentInstruction[] = [
  {
    id: "SI-8890-GLD",
    referenceCode: "CITI-XAU-SWEEP-009",
    beneficiary: {
      entityName: "Crown Custody Vaults (Geneva)",
      jurisdiction: "Switzerland (CH)",
      institution: "Citibank Zurich Private Vault",
      routingBic: "CITICHZZXXX",
      riskScore: 0.8,
      sovereignTier: "Tier-0 Imperial"
    },
    allocationCategory: "Gold Bullion Lease",
    frequency: "DAILY_ROLLOVER",
    baseAmount: 142500000.0,
    currency: "XAU_OZ",
    executedRuns: 1420,
    lifetimeDisbursed: 202350000000,
    nextExecutionDate: "2025-04-01T04:00:00.000Z",
    priorityWeight: 10,
    status: "ACTIVE_SOVEREIGN_PRIORITY",
    aiVarianceDamping: true,
    smartRoutingProtocol: "Citi-Quantum-Settlement-v9",
    telemetryLatencyMs: 1.2,
    lastExecutionTx: "0x9E84...F12C"
  },
  {
    id: "SI-7741-PET",
    referenceCode: "MODTREAS-PETRO-902",
    beneficiary: {
      entityName: "Abu Dhabi Hydrocarbon Liquidity Syndicate",
      jurisdiction: "United Arab Emirates (UAE)",
      institution: "Modern Treasury Sovereign Ledger",
      routingBic: "MTRUS33XXPET",
      riskScore: 2.1,
      sovereignTier: "Tier-1 Central Bank"
    },
    allocationCategory: "Petro-Settlement",
    frequency: "WEEKLY_SWEEP",
    baseAmount: 850000000.0,
    currency: "USD",
    executedRuns: 248,
    lifetimeDisbursed: 210800000000,
    nextExecutionDate: "2025-04-03T18:00:00.000Z",
    priorityWeight: 9,
    status: "AI_OPTIMIZING",
    aiVarianceDamping: true,
    smartRoutingProtocol: "ModernTreasury-Continuous-Ledger-RTGS",
    telemetryLatencyMs: 4.8,
    lastExecutionTx: "0x3A21...CB88"
  },
  {
    id: "SI-6632-CMP",
    referenceCode: "CITI-NVDA-H200-GRID",
    beneficiary: {
      entityName: "Aetherius Compute Sovereign Trust",
      jurisdiction: "Singapore (SG)",
      institution: "Monetary Authority of Singapore",
      routingBic: "CITISGSGXXX",
      riskScore: 4.5,
      sovereignTier: "Tier-1 Central Bank"
    },
    allocationCategory: "AI Compute Syndicate",
    frequency: "PERPETUAL_WATERFALL",
    baseAmount: 320000000.0,
    currency: "USD",
    executedRuns: 890,
    lifetimeDisbursed: 284800000000,
    nextExecutionDate: "2025-04-01T00:00:01.000Z",
    priorityWeight: 8,
    status: "ACTIVE_SOVEREIGN_PRIORITY",
    aiVarianceDamping: true,
    smartRoutingProtocol: "Citi-FedNow-Direct-Optical",
    telemetryLatencyMs: 0.9,
    lastExecutionTx: "0x89C1...7E43"
  },
  {
    id: "SI-5519-DEB",
    referenceCode: "CITI-PARIS-CLUB-SRVC",
    beneficiary: {
      entityName: "Supranational Bond Sinking Fund",
      jurisdiction: "Luxembourg (LU)",
      institution: "Citibank N.A. London",
      routingBic: "CITIGB2LXXX",
      riskScore: 1.4,
      sovereignTier: "Tier-2 Supranational"
    },
    allocationCategory: "Sovereign Debt Service",
    frequency: "MONTHLY_SETTLEMENT",
    baseAmount: 1250000000.0,
    currency: "EUR",
    executedRuns: 64,
    lifetimeDisbursed: 80000000000,
    nextExecutionDate: "2025-04-15T12:00:00.000Z",
    priorityWeight: 10,
    status: "LIQUIDITY_BUFFERED",
    aiVarianceDamping: false,
    smartRoutingProtocol: "TARGET2-High-Value-Interlink",
    telemetryLatencyMs: 6.4,
    lastExecutionTx: "0x12FA...4491"
  },
  {
    id: "SI-4401-DYN",
    referenceCode: "MODTREAS-DYNASTY-CONDUIT",
    beneficiary: {
      entityName: "House of Saxe-Coburg Hereditary Trust",
      jurisdiction: "Liechtenstein (LI)",
      institution: "Modern Treasury Sovereign Ledger",
      routingBic: "MTRULI22XXX",
      riskScore: 0.3,
      sovereignTier: "Tier-0 Imperial"
    },
    allocationCategory: "Dynastic Trust Conduit",
    frequency: "BI_WEEKLY_NET",
    baseAmount: 75000000.0,
    currency: "SDR",
    executedRuns: 512,
    lifetimeDisbursed: 38400000000,
    nextExecutionDate: "2025-04-07T08:30:00.000Z",
    priorityWeight: 7,
    status: "HELD_FOR_DUAL_KEY",
    aiVarianceDamping: true,
    smartRoutingProtocol: "MT-Multi-Sovereign-Settlement-Mesh",
    telemetryLatencyMs: 3.1,
    lastExecutionTx: "0xAA43...90EF"
  }
];

const WATERFALL_LAYERS: CashFlowWaterfallNode[] = [
  {
    tier: "Primary Alpha Stream (Petro & Hydrocarbon Inflows)",
    sourceAmount: 4850000000,
    absorbedAmount: 2100000000,
    spilloverTarget: "Secondary Tier-1 Sovereign Debt Buffer",
    flowVelocityPerSec: 56128.45,
    purityGrade: "99.999% Cleared"
  },
  {
    tier: "Gold Bullion Perpetual Lease Arbitrage",
    sourceAmount: 3200000000,
    absorbedAmount: 1850000000,
    spilloverTarget: "AI Autonomous Compute Capital Reserve",
    flowVelocityPerSec: 37041.22,
    purityGrade: "Allocated Physical Bar Audit"
  },
  {
    tier: "AI Autonomous Compute Yield Syndicate",
    sourceAmount: 1950000000,
    absorbedAmount: 950000000,
    spilloverTarget: "Dynastic Multi-Generational Trust Pool",
    flowVelocityPerSec: 22589.9,
    purityGrade: "Quantum-Encrypted Synthetic"
  },
  {
    tier: "Residual Ultra-Liquid Discretionary Sinking Reserve",
    sourceAmount: 1100000000,
    absorbedAmount: 1100000000,
    spilloverTarget: "Final Sovereign Vault Anchor",
    flowVelocityPerSec: 12740.05,
    purityGrade: "Citibank Central Gold Reserve"
  }
];

export default function SovereignRepeatingPaymentVault() {
  const [instructions, setInstructions] = useState<RecurringPaymentInstruction[]>(INITIAL_INSTRUCTIONS);
  const [selectedInstruction, setSelectedInstruction] = useState<RecurringPaymentInstruction | null>(INITIAL_INSTRUCTIONS[0]);
  const [selectedCategory, setSelectedCategory] = useState<string>("ALL");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [selectedDenomination, setSelectedDenomination] = useState<CurrencyDenomination>("USD");
  const [killSwitchModalOpen, setKillSwitchModalOpen] = useState<boolean>(false);
  const [dualAuthKey, setDualAuthKey] = useState<string>("");
  const [isAuthorizingTermination, setIsAuthorizingTermination] = useState<boolean>(false);
  const [telemetryPulse, setTelemetryPulse] = useState<number>(0);
  const [simulatedLiveThroughput, setSimulatedLiveThroughput] = useState<number>(128490.5);
  const [aiOptimizationRunning, setAiOptimizationRunning] = useState<boolean>(false);
  const [auditLog, setAuditLog] = useState<string[]>([
    "[CITI-FEDNOW-01] Standing instruction SI-8890-GLD automated lease cleared via Zurich Vault.",
    "[MODERN-TREASURY] Continuous sweep SI-7741-PET calculated 0.0034% positive basis variance.",
    "[AI-AUTOPILOT] Dynamic cash-flow balance algorithm activated for 90-day horizon.",
    "[CITIBANK-PRIVATE] Multi-signature token refreshed for sovereign identity ledger."
  ]);

  // Live telemetry pulsation effect
  useEffect(() => {
    const timer = setInterval(() => {
      setTelemetryPulse((prev) => (prev + 1) % 100);
      setSimulatedLiveThroughput((prev) => {
        const delta = (Math.random() - 0.48) * 1250;
        return Math.max(100000, prev + delta);
      });
    }, 2800);
    return () => clearInterval(timer);
  }, []);

  // Format currency in luxury style
  const formatSovereignCurrency = (val: number, curr: CurrencyDenomination = selectedDenomination) => {
    const symbols: Record<CurrencyDenomination, string> = {
      USD: "$",
      EUR: "€",
      XAU_OZ: " oz XAU ",
      AED: " د.إ ",
      SDR: "SDR "
    };

    if (curr === "XAU_OZ") {
      return `${val.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${symbols.XAU_OZ}`;
    }

    return `${symbols[curr]}${val.toLocaleString("en-US", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // Filtered list
  const filteredInstructions = useMemo(() => {
    return instructions.filter((item) => {
      const matchCat = selectedCategory === "ALL" || item.allocationCategory === selectedCategory;
      const matchSearch =
        item.referenceCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.beneficiary.entityName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.beneficiary.institution.toLowerCase().includes(searchQuery.toLowerCase());
      return matchCat && matchSearch;
    });
  }, [instructions, selectedCategory, searchQuery]);

  // Metrics calculation
  const totalLifetimeRecurringVolume = useMemo(() => {
    return instructions.reduce((acc, curr) => acc + curr.lifetimeDisbursed, 0);
  }, [instructions]);

  const activeDailyVolume = useMemo(() => {
    return instructions
      .filter((i) => i.status !== "REVOKED")
      .reduce((acc, curr) => acc + curr.baseAmount, 0);
  }, [instructions]);

  const averageRiskIndex = useMemo(() => {
    const totalRisk = instructions.reduce((acc, curr) => acc + curr.beneficiary.riskScore, 0);
    return (totalRisk / (instructions.length || 1)).toFixed(2);
  }, [instructions]);

  // Termination Sequence
  const handleTerminateStandingInstruction = () => {
    if (!selectedInstruction) return;
    setIsAuthorizingTermination(true);

    setTimeout(() => {
      setInstructions((prev) =>
        prev.map((inst) =>
          inst.id === selectedInstruction.id
            ? { ...inst, status: "REVOKED" as StandingInstructionStatus }
            : inst
        )
      );
      if (selectedInstruction) {
        setSelectedInstruction({ ...selectedInstruction, status: "REVOKED" });
      }
      setIsAuthorizingTermination(false);
      setKillSwitchModalOpen(false);
      setDualAuthKey("");
      setAuditLog((prev) => [
        `[SOVEREIGN-REVOCATION] Standing Instruction ${selectedInstruction.referenceCode} PERMANENTLY TERMINATED. Dual-key cert validated via HSM #904.`,
        ...prev
      ]);
    }, 1800);
  };

  // Run AI Rebalance Sweep
  const triggerAiRebalance = () => {
    setAiOptimizationRunning(true);
    setTimeout(() => {
      setAiOptimizationRunning(false);
      setAuditLog((prev) => [
        `[AI-ENGINE-CASCADE] Recurring waterfall yield re-optimized across Citibank N.A. & Modern Treasury ledgers. Total execution slip reduced by 0.0042%.`,
        ...prev
      ]);
    }, 2000);
  };

  return (
    <div className="min-h-screen bg-[#050508] text-[#E8E8EC] font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* BACKGROUND ATMOSPHERIC GRADIENTS */}
      <div className="fixed inset-0 pointer-events-none z-0">
        <div className="absolute top-0 left-1/4 w-[600px] h-[600px] bg-[#D4AF37]/5 rounded-full blur-[140px]" />
        <div className="absolute bottom-10 right-1/4 w-[700px] h-[500px] bg-[#997B28]/5 rounded-full blur-[160px]" />
        <div className="absolute inset-0 bg-[radial-gradient(#1c1c24_1px,transparent_1px)] [background-size:24px_24px] opacity-30" />
      </div>

      {/* TOP LUXURY NAVIGATION / STATUS HEADER */}
      <header className="relative z-10 border-b border-[#2A2718]/80 bg-[#09090F]/90 backdrop-blur-xl px-6 py-4">
        <div className="max-w-[1780px] mx-auto flex flex-col xl:flex-row xl:items-center xl:justify-between gap-4">
          
          {/* Sovereign Brand Seal */}
          <div className="flex items-center space-x-4">
            <div className="relative p-2.5 rounded-2xl bg-gradient-to-b from-[#2A2411] to-[#0D0C07] border border-[#D4AF37]/40 shadow-[0_0_25px_rgba(212,175,55,0.15)]">
              <Crown className="w-8 h-8 text-[#E2C366] drop-shadow-[0_0_8px_rgba(226,195,102,0.6)]" />
              <span className="absolute -bottom-1 -right-1 flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#10B981] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#10B981]"></span>
              </span>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] tracking-[0.3em] uppercase font-bold text-[#A58835] bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  CITIBANK IMPERIAL APPARATUS • MODERN TREASURY ENGINE
                </span>
                <span className="text-xs text-zinc-500 font-mono">NODE: ZURICH-SOV-01</span>
              </div>
              <h1 className="text-2xl font-black tracking-tight text-white flex items-center gap-2">
                Sovereign Standing Instruction Vault
                <span className="text-xs font-mono font-medium text-[#D4AF37] border border-[#D4AF37]/40 px-2 py-0.5 rounded-full bg-[#1A1608]">
                  PTP ULTRA-CASCADE
                </span>
              </h1>
            </div>
          </div>

          {/* Real-time Hardware & Crypto Telemetry */}
          <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
            <div className="bg-[#121118]/80 border border-[#2B2933] px-3.5 py-2 rounded-xl flex items-center space-x-3 shadow-inner">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest">Live Flow Velocity</div>
                <div className="text-emerald-400 font-bold tracking-tight">
                  ${simulatedLiveThroughput.toFixed(2)}/sec
                </div>
              </div>
            </div>

            <div className="bg-[#121118]/80 border border-[#2B2933] px-3.5 py-2 rounded-xl flex items-center space-x-3 shadow-inner">
              <Cpu className="w-4 h-4 text-[#D4AF37]" />
              <div>
                <div className="text-[10px] text-zinc-400 uppercase tracking-widest">AI Damping Engine</div>
                <div className="text-[#E2C366] font-bold">QUANTUM-ACTIVE (0.8ms)</div>
              </div>
            </div>

            {/* Currency Selector */}
            <div className="flex items-center space-x-1 bg-[#15141D] p-1 rounded-xl border border-[#2D2A1C]">
              {(["USD", "EUR", "XAU_OZ", "AED", "SDR"] as CurrencyDenomination[]).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedDenomination(curr)}
                  className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                    selectedDenomination === curr
                      ? "bg-gradient-to-b from-[#D4AF37] to-[#997B28] text-black shadow-md font-bold"
                      : "text-zinc-400 hover:text-white"
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>

            <button
              onClick={triggerAiRebalance}
              disabled={aiOptimizationRunning}
              className="flex items-center space-x-2 px-4 py-2 rounded-xl bg-gradient-to-r from-[#D4AF37]/20 via-[#E2C366]/20 to-[#997B28]/20 border border-[#D4AF37]/50 text-[#F5E296] hover:border-[#D4AF37] transition shadow-[0_0_15px_rgba(212,175,55,0.1)] active:scale-95 disabled:opacity-50"
            >
              <Sparkles className={`w-4 h-4 text-[#D4AF37] ${aiOptimizationRunning ? "animate-spin" : ""}`} />
              <span className="font-bold tracking-wide">
                {aiOptimizationRunning ? "AI RE-OPTIMIZING..." : "AI OPTIMIZE WATERFALL"}
              </span>
            </button>
          </div>
        </div>
      </header>

      {/* MAIN VIEWPORT */}
      <main className="relative z-10 max-w-[1780px] mx-auto px-6 py-6 space-y-6">
        
        {/* TOP GOLD FOIL METRICS SUITE */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* Card 1 */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#121118] via-[#100F15] to-[#0A090E] border border-[#2D2A1F] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B5963E]">
                Lifetime Settled Volume
              </span>
              <Landmark className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatSovereignCurrency(totalLifetimeRecurringVolume)}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs text-zinc-400">
              <span className="text-emerald-400 font-semibold flex items-center">
                <ArrowUpRight className="w-3.5 h-3.5 mr-0.5" /> +14.2% YoY
              </span>
              <span>• Continuous Sweep</span>
            </div>
          </div>

          {/* Card 2 */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#121118] via-[#100F15] to-[#0A090E] border border-[#2D2A1F] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#10B981]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B5963E]">
                Active Cycle Commitment
              </span>
              <RefreshCw className="w-5 h-5 text-emerald-400 animate-[spin_12s_linear_infinite]" />
            </div>
            <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-white tracking-tight">
              {formatSovereignCurrency(activeDailyVolume)}
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs text-zinc-400">
              <span className="text-[#E2C366] font-mono font-medium">5 Standing Orders Active</span>
              <span>• Citibank Core</span>
            </div>
          </div>

          {/* Card 3 */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#121118] via-[#100F15] to-[#0A090E] border border-[#2D2A1F] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B5963E]">
                Sovereign Risk Index
              </span>
              <Shield className="w-5 h-5 text-[#E2C366]" />
            </div>
            <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight">
              {averageRiskIndex} <span className="text-sm text-zinc-400 font-mono">/ 100 [AAA-STABLE]</span>
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs text-zinc-400">
              <span className="text-emerald-400">Zero default probability</span>
              <span>• Basel IV Sovereign</span>
            </div>
          </div>

          {/* Card 4 */}
          <div className="relative overflow-hidden p-5 rounded-2xl bg-gradient-to-br from-[#121118] via-[#100F15] to-[#0A090E] border border-[#2D2A1F] shadow-[0_4px_24px_rgba(0,0,0,0.6)]">
            <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-bl-full pointer-events-none" />
            <div className="flex items-center justify-between">
              <span className="text-[11px] font-mono uppercase tracking-widest text-[#B5963E]">
                Dual-Key Sovereign Guard
              </span>
              <Lock className="w-5 h-5 text-[#D4AF37]" />
            </div>
            <div className="mt-3 text-2xl lg:text-3xl font-extrabold text-white tracking-tight flex items-center gap-2">
              <span>HSM ENCLAVE 04</span>
            </div>
            <div className="mt-2 flex items-center space-x-2 text-xs text-zinc-400">
              <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Modern Treasury Multi-Party Validated</span>
            </div>
          </div>

        </section>

        {/* WATERFALL RECURRING CASH-FLOW VISUALIZER */}
        <section className="p-6 rounded-2xl bg-gradient-to-b from-[#100F15] to-[#0A090F] border border-[#2D2A1E] shadow-2xl relative">
          <div className="flex flex-col md:flex-row md:items-center justify-between pb-4 border-b border-[#232017] mb-6 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <Workflow className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-bold text-white tracking-tight">
                  Multi-Asset Recurring Cash Flow Waterfall Telemetry
                </h2>
              </div>
              <p className="text-xs text-zinc-400 mt-0.5">
                Automated continuous distribution algorithm with quantum liquidity spillover containment.
              </p>
            </div>
            <div className="flex items-center space-x-3 text-xs font-mono">
              <span className="flex items-center space-x-1.5 text-[#E2C366] bg-[#221C0B] px-3 py-1.5 rounded-lg border border-[#3E3416]">
                <Activity className="w-3.5 h-3.5 animate-spin" />
                <span>PTP AUTO-ROUTING ENGAGED</span>
              </span>
            </div>
          </div>

          {/* Waterfall Node Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 relative">
            {WATERFALL_LAYERS.map((layer, idx) => {
              const absorptionRate = ((layer.absorbedAmount / layer.sourceAmount) * 100).toFixed(1);
              return (
                <div
                  key={layer.tier}
                  className="relative p-4 rounded-xl bg-[#14131C]/90 border border-[#2B271A] hover:border-[#D4AF37]/50 transition duration-300 group"
                >
                  <div className="flex items-center justify-between text-[11px] font-mono text-[#B5963E] mb-2">
                    <span className="font-bold">LAYER 0{idx + 1}</span>
                    <span className="text-zinc-400">{layer.purityGrade}</span>
                  </div>

                  <h3 className="text-sm font-bold text-white mb-2 group-hover:text-[#E2C366] transition">
                    {layer.tier}
                  </h3>

                  <div className="space-y-2 mt-3 font-mono">
                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Total Pool Inflow:</span>
                      <span className="text-white font-bold">{formatSovereignCurrency(layer.sourceAmount)}</span>
                    </div>

                    <div className="flex justify-between text-xs">
                      <span className="text-zinc-400">Absorbed / Cleared:</span>
                      <span className="text-emerald-400 font-semibold">{formatSovereignCurrency(layer.absorbedAmount)}</span>
                    </div>

                    {/* Progress Fill Bar */}
                    <div className="w-full bg-[#201F29] h-2 rounded-full overflow-hidden my-2">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${absorptionRate}%` }}
                        transition={{ duration: 1.2, delay: idx * 0.2 }}
                        className="h-full bg-gradient-to-r from-[#997B28] via-[#D4AF37] to-[#F5E296]"
                      />
                    </div>

                    <div className="flex justify-between text-[11px] text-zinc-500 pt-1 border-t border-[#22202B]">
                      <span>Spillover Target:</span>
                      <span className="text-[#D4AF37] truncate max-w-[130px]">{layer.spilloverTarget}</span>
                    </div>

                    <div className="flex justify-between text-[10px] text-zinc-400">
                      <span>Dynamic Flow:</span>
                      <span className="text-emerald-400">${layer.flowVelocityPerSec.toLocaleString()}/s</span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* WORKBENCH: STANDING INSTRUCTIONS DIRECTORY & FORENSIC DRAWER */}
        <section className="grid grid-cols-1 xl:grid-cols-12 gap-6">
          
          {/* LEFT 8 COLS: INSTRUCTIONS DIRECTORY */}
          <div className="xl:col-span-8 space-y-4">
            
            {/* Action Bar / Filter Bar */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 p-4 rounded-xl bg-[#0E0D13] border border-[#2A2718]">
              <div className="relative w-full sm:w-80">
                <Search className="w-4 h-4 text-zinc-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Search Reference, Sovereign Beneficiary, BIC..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-9 pr-4 py-2 bg-[#17161F] border border-[#2E2A1E] rounded-lg text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-[#D4AF37]"
                />
              </div>

              {/* Category Filter Pills */}
              <div className="flex flex-wrap items-center gap-1.5 w-full sm:w-auto">
                {["ALL", "Gold Bullion Lease", "Petro-Settlement", "AI Compute Syndicate", "Sovereign Debt Service"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3 py-1.5 rounded-lg text-xs font-medium transition ${
                      selectedCategory === cat
                        ? "bg-[#D4AF37] text-black font-bold shadow"
                        : "bg-[#16151E] text-zinc-400 hover:text-white border border-[#2A271E]"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Standing Instructions Table / Card Matrix */}
            <div className="space-y-3">
              {filteredInstructions.map((item) => {
                const isSelected = selectedInstruction?.id === item.id;
                const isRevoked = item.status === "REVOKED";

                return (
                  <motion.div
                    key={item.id}
                    onClick={() => setSelectedInstruction(item)}
                    whileHover={{ scale: 1.005 }}
                    className={`relative p-5 rounded-2xl cursor-pointer transition duration-200 border ${
                      isSelected
                        ? "bg-gradient-to-r from-[#17150F] via-[#121117] to-[#16151F] border-[#D4AF37] shadow-[0_0_25px_rgba(212,175,55,0.12)]"
                        : "bg-[#0E0D14]/90 border-[#232017] hover:border-[#4B4222]"
                    } ${isRevoked ? "opacity-50 grayscale" : ""}`}
                  >
                    {/* Top row */}
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center space-x-3">
                        <div className="p-2 rounded-xl bg-[#1F1B0E] border border-[#D4AF37]/30 text-[#D4AF37]">
                          <Crown className="w-4 h-4" />
                        </div>
                        <div>
                          <div className="flex items-center space-x-2">
                            <span className="font-bold text-white text-sm">{item.beneficiary.entityName}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-[#1B1924] border border-[#2D2A3B] text-zinc-300">
                              {item.beneficiary.jurisdiction}
                            </span>
                            <span className="text-[10px] font-mono font-bold px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                              {item.beneficiary.sovereignTier}
                            </span>
                          </div>
                          <div className="text-xs text-zinc-400 font-mono mt-0.5 flex items-center space-x-2">
                            <span>Ref: {item.referenceCode}</span>
                            <span>•</span>
                            <span className="text-[#B5963E]">{item.beneficiary.institution}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-lg font-black text-white font-mono tracking-tight">
                          {formatSovereignCurrency(item.baseAmount, item.currency)}
                        </div>
                        <div className="text-[11px] font-mono text-[#B5963E] uppercase tracking-wider">
                          Freq: {item.frequency.replace("_", " ")}
                        </div>
                      </div>
                    </div>

                    {/* Meta Bar */}
                    <div className="mt-4 pt-3 border-t border-[#232029] flex flex-wrap items-center justify-between gap-3 text-xs font-mono">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-1.5">
                          <span className="text-zinc-500">Routing Protocol:</span>
                          <span className="text-zinc-300">{item.smartRoutingProtocol}</span>
                        </div>
                        <div className="flex items-center space-x-1.5">
                          <span className="text-zinc-500">Latency:</span>
                          <span className="text-emerald-400">{item.telemetryLatencyMs}ms</span>
                        </div>
                      </div>

                      <div className="flex items-center space-x-3">
                        <span
                          className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold tracking-wider uppercase border ${
                            item.status === "ACTIVE_SOVEREIGN_PRIORITY"
                              ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/30"
                              : item.status === "AI_OPTIMIZING"
                              ? "bg-[#D4AF37]/10 text-[#E2C366] border-[#D4AF37]/40"
                              : item.status === "LIQUIDITY_BUFFERED"
                              ? "bg-blue-500/10 text-blue-400 border-blue-500/30"
                              : item.status === "HELD_FOR_DUAL_KEY"
                              ? "bg-amber-500/10 text-amber-400 border-amber-500/30"
                              : "bg-rose-500/10 text-rose-400 border-rose-500/30"
                          }`}
                        >
                          {item.status.replace(/_/g, " ")}
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#D4AF37]" />
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          </div>

          {/* RIGHT 4 COLS: FORENSIC TELEMETRY & SOVEREIGN KILL-SWITCH */}
          <div className="xl:col-span-4 space-y-4">
            
            {/* Selected Instruction Deep Forensic Card */}
            {selectedInstruction ? (
              <div className="p-6 rounded-2xl bg-gradient-to-b from-[#13121A] to-[#0A090E] border border-[#2D2A1C] shadow-2xl relative">
                <div className="flex items-center justify-between pb-4 border-b border-[#262319]">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="text-sm font-bold uppercase tracking-wider text-white">
                      Standing Forensic Audit
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono text-[#D4AF37] bg-[#221B0A] px-2 py-0.5 rounded border border-[#443714]">
                    ID: {selectedInstruction.id}
                  </span>
                </div>

                <div className="mt-4 space-y-3 font-mono text-xs">
                  <div className="bg-[#181622] p-3 rounded-xl border border-[#292635]">
                    <div className="text-[10px] text-zinc-400 uppercase tracking-widest mb-1">
                      Beneficiary Verification
                    </div>
                    <div className="text-white font-bold text-sm">
                      {selectedInstruction.beneficiary.entityName}
                    </div>
                    <div className="text-zinc-400 text-[11px] mt-0.5">
                      BIC: {selectedInstruction.beneficiary.routingBic} • Risk Score: {selectedInstruction.beneficiary.riskScore}/100
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-[#181622] p-3 rounded-xl border border-[#292635]">
                      <div className="text-[10px] text-zinc-400 uppercase">Lifetime Cleared</div>
                      <div className="text-[#E2C366] font-bold text-sm mt-1">
                        {formatSovereignCurrency(selectedInstruction.lifetimeDisbursed, selectedInstruction.currency)}
                      </div>
                    </div>
                    <div className="bg-[#181622] p-3 rounded-xl border border-[#292635]">
                      <div className="text-[10px] text-zinc-400 uppercase">Total Sweeps</div>
                      <div className="text-white font-bold text-sm mt-1">
                        {selectedInstruction.executedRuns.toLocaleString()} Runs
                      </div>
                    </div>
                  </div>

                  <div className="bg-[#181622] p-3 rounded-xl border border-[#292635] space-y-2">
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Next Scheduled Sweep:</span>
                      <span className="text-white font-semibold">
                        {new Date(selectedInstruction.nextExecutionDate).toUTCString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">Last Execution Proof:</span>
                      <span className="text-[#D4AF37] font-semibold underline cursor-pointer">
                        {selectedInstruction.lastExecutionTx}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-zinc-400">AI Variance Damping:</span>
                      <span className="text-emerald-400 font-semibold">
                        {selectedInstruction.aiVarianceDamping ? "ENGAGED (Auto-Nullify Slip)" : "BYPASS"}
                      </span>
                    </div>
                  </div>

                  {/* Operational Controls / Sovereign Termination */}
                  <div className="pt-2 space-y-2">
                    {selectedInstruction.status !== "REVOKED" ? (
                      <button
                        onClick={() => setKillSwitchModalOpen(true)}
                        className="w-full py-3 rounded-xl bg-gradient-to-r from-rose-950/80 via-red-900/60 to-rose-950/80 border border-rose-600/60 hover:border-rose-500 text-rose-200 font-bold tracking-wider uppercase text-xs flex items-center justify-center space-x-2 transition shadow-[0_0_20px_rgba(225,29,72,0.15)] active:scale-98"
                      >
                        <AlertOctagon className="w-4 h-4 text-rose-400" />
                        <span>Authorize Sovereign Revocation</span>
                      </button>
                    ) : (
                      <div className="p-3 rounded-xl bg-rose-950/30 border border-rose-800/40 text-center text-rose-400 font-bold uppercase text-xs">
                        Instruction Permanently Revoked
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ) : (
              <div className="p-8 rounded-2xl bg-[#0E0D14] border border-[#242118] text-center text-zinc-500 font-mono text-xs">
                Select a Standing Instruction to inspect forensic telemetry.
              </div>
            )}

            {/* LIVE SOVEREIGN EVENT AUDIT LOG */}
            <div className="p-5 rounded-2xl bg-[#0D0C12] border border-[#232019] shadow-xl">
              <div className="flex items-center justify-between pb-3 border-b border-[#211E16] mb-3">
                <div className="flex items-center space-x-2">
                  <FileCheck2 className="w-4 h-4 text-[#D4AF37]" />
                  <span className="text-xs font-bold uppercase tracking-wider text-white">
                    Live Audit Ledger
                  </span>
                </div>
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              </div>
              <div className="space-y-2 max-h-[220px] overflow-y-auto font-mono text-[11px] text-zinc-400 pr-1">
                {auditLog.map((log, i) => (
                  <div
                    key={i}
                    className="p-2 rounded bg-[#13121A] border border-[#1F1E29] leading-relaxed hover:text-white transition"
                  >
                    {log}
                  </div>
                ))}
              </div>
            </div>

          </div>

        </section>

      </main>

      {/* DUAL-KEY SOVEREIGN TERMINATION MODAL */}
      <AnimatePresence>
        {killSwitchModalOpen && selectedInstruction && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ scale: 0.92, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.92, opacity: 0 }}
              className="relative w-full max-w-lg p-6 rounded-3xl bg-gradient-to-b from-[#181315] via-[#100D10] to-[#0A070A] border-2 border-rose-600/70 shadow-[0_0_50px_rgba(225,29,72,0.3)] text-white"
            >
              <div className="flex items-center space-x-3 text-rose-500 mb-4">
                <div className="p-3 bg-rose-500/10 rounded-2xl border border-rose-500/30">
                  <AlertOctagon className="w-7 h-7" />
                </div>
                <div>
                  <h3 className="text-lg font-black tracking-tight text-white">
                    Sovereign Revocation Execution
                  </h3>
                  <p className="text-xs text-rose-400/80 font-mono">
                    Standing Instruction Permanent Kill-Switch Sequence
                  </p>
                </div>
              </div>

              <div className="space-y-4 font-mono text-xs">
                <p className="text-zinc-300 leading-relaxed">
                  You are about to irreversibly terminate Standing Instruction:
                  <span className="text-[#D4AF37] font-bold block mt-1">
                    {selectedInstruction.referenceCode} ({selectedInstruction.beneficiary.entityName})
                  </span>
                  This will cease all automatic SWIFT GPI transfers and Modern Treasury ledger sweeps across all connected jurisdictions.
                </p>

                <div className="p-3 bg-black/60 rounded-xl border border-rose-950 space-y-1 text-[11px]">
                  <div className="flex justify-between text-zinc-400">
                    <span>Base Amount per Sweep:</span>
                    <span className="text-white font-bold">
                      {formatSovereignCurrency(selectedInstruction.baseAmount, selectedInstruction.currency)}
                    </span>
                  </div>
                  <div className="flex justify-between text-zinc-400">
                    <span>Lifetime Cleared Volume:</span>
                    <span className="text-emerald-400 font-bold">
                      {formatSovereignCurrency(selectedInstruction.lifetimeDisbursed, selectedInstruction.currency)}
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-[11px] font-bold text-rose-300 uppercase tracking-wider block">
                    Enter Dual-Key HSM Sovereign Token
                  </label>
                  <div className="relative">
                    <Key className="w-4 h-4 text-rose-500 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input
                      type="password"
                      placeholder="XXXX-SOV-KEY-9901-ALPHA"
                      value={dualAuthKey}
                      onChange={(e) => setDualAuthKey(e.target.value)}
                      className="w-full pl-9 pr-4 py-2.5 bg-[#1F1215] border border-rose-800/60 rounded-xl text-xs text-white placeholder-zinc-600 focus:outline-none focus:border-rose-500"
                    />
                  </div>
                </div>

                <div className="pt-3 flex items-center justify-end space-x-3">
                  <button
                    onClick={() => {
                      setKillSwitchModalOpen(false);
                      setDualAuthKey("");
                    }}
                    className="px-4 py-2.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-zinc-300 text-xs font-semibold transition"
                  >
                    Abort Sequence
                  </button>
                  <button
                    onClick={handleTerminateStandingInstruction}
                    disabled={dualAuthKey.length < 4 || isAuthorizingTermination}
                    className="px-5 py-2.5 rounded-xl bg-gradient-to-r from-red-600 to-rose-700 hover:from-red-500 hover:to-rose-600 text-white font-bold text-xs tracking-wider uppercase transition shadow-lg disabled:opacity-40 flex items-center space-x-2"
                  >
                    {isAuthorizingTermination ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        <span>Revoking Across Ledgers...</span>
                      </>
                    ) : (
                      <>
                        <Lock className="w-4 h-4" />
                        <span>Execute Irrevocable Revocation</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* LUXURY GOLD FOIL BOTTOM ACCENT */}
      <footer className="relative z-10 border-t border-[#232017] bg-[#07070A] px-6 py-4 mt-12 text-xs font-mono text-zinc-500">
        <div className="max-w-[1780px] mx-auto flex flex-col sm:flex-row items-center justify-between gap-2">
          <div className="flex items-center space-x-2 text-[#A58835]">
            <Crown className="w-4 h-4 text-[#D4AF37]" />
            <span>CITIBANK SOVEREIGN TERMINAL • EMPOWERED BY MODERN TREASURY LEDGER ENGINE</span>
          </div>
          <div>QUANTUM-SECURED PROTOCOL • 256-BIT ELLIPTIC P-384 HSM ACTIVE</div>
        </div>
      </footer>
    </div>
  );
}