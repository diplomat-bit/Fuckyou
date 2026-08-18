"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Shield,
  Zap,
  Cpu,
  Lock,
  ArrowRight,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Sliders,
  DollarSign,
  Layers,
  Key,
  Globe,
  Sparkles,
  ChevronRight,
  Clock,
  Send,
  Building,
  Terminal,
  Activity,
  CreditCard,
  Eye,
  Copy,
  Check
} from "lucide-react";

// Types
export type PaymentRail = "CITI_CHIPS_INSTANT" | "MODERN_TREASURY_RTP" | "FEDNOW_SOVEREIGN" | "SWIFT_GPI_HYPERDRIVE" | "QUANTUM_ATOMIC_SETTLE";

export type FlowStatus = "pending_tokenization" | "ai_risk_evaluating" | "ledger_allocated" | "client_authorized" | "clearing" | "settled" | "flagged_sovereign_review";

export interface CounterpartyTarget {
  id: string;
  name: string;
  institution: string;
  accountMask: string;
  citiBic: string;
  kycTier: "TIER_0_HEAD_OF_STATE" | "TIER_1_FAMILY_OFFICE" | "TIER_ULTRA_CONGLOMERATE";
  jurisdiction: string;
}

export interface PaymentFlowItem {
  id: string;
  clientToken: string;
  amount: number;
  currency: string;
  rail: PaymentRail;
  counterparty: CounterpartyTarget;
  status: FlowStatus;
  neuralRiskScore: number;
  estimatedSettlementSeconds: number;
  luxAssetClass: "AERO_FLEET" | "SUPER_YACHT" | "ORBITAL_REAL_ESTATE" | "ISLAND_ACQUISITION" | "SOVEREIGN_DEBT_SWAP";
  modernTreasuryLedgerId: string;
  citiEscrowKey: string;
  createdAt: string;
  updatedAt: string;
}

export interface AIRecommendation {
  recommendedRail: PaymentRail;
  citiFxFractionalAlpha: number;
  estimatedFeeSovereignBps: number;
  liquidityConfidence: number;
  aiRationale: string;
}

const SAMPLE_COUNTERPARTIES: CounterpartyTarget[] = [
  {
    id: "CP-LUX-9081",
    name: "L'Ombre Sovereign Maritime Trust",
    institution: "Citibank Private Bank (Zurich Branch)",
    accountMask: "•••• 8829",
    citiBic: "CITICHZZXXX",
    kycTier: "TIER_0_HEAD_OF_STATE",
    jurisdiction: "Monaco / Switzerland"
  },
  {
    id: "CP-LUX-4412",
    name: "Aetherius Orbital Infrastructure Ltd",
    institution: "Citibank Institutional Global Treasury (London)",
    accountMask: "•••• 0194",
    citiBic: "CITIGB2LXXX",
    kycTier: "TIER_ULTRA_CONGLOMERATE",
    jurisdiction: "United Kingdom / Cayman"
  },
  {
    id: "CP-LUX-7733",
    name: "Val-d'Or Dynasty Family Office",
    institution: "Citibank Private Wealth Management (New York HQ)",
    accountMask: "•••• 6542",
    citiBic: "CITIUS33XXX",
    kycTier: "TIER_1_FAMILY_OFFICE",
    jurisdiction: "United States (Delaware Trust)"
  }
];

const INITIAL_FLOWS: PaymentFlowItem[] = [
  {
    id: "flw_citi_mt_9981a3e8",
    clientToken: "citi_live_clt_0x9a8f273b5ce4021d7bfa",
    amount: 145000000.0,
    currency: "USD",
    rail: "CITI_CHIPS_INSTANT",
    counterparty: SAMPLE_COUNTERPARTIES[0],
    status: "settled",
    neuralRiskScore: 0.0012,
    estimatedSettlementSeconds: 1.4,
    luxAssetClass: "SUPER_YACHT",
    modernTreasuryLedgerId: "mt_led_7781b0a9918",
    citiEscrowKey: "ESC-CITI-NY-8910-A",
    createdAt: "2025-03-30T10:14:22Z",
    updatedAt: "2025-03-30T10:14:24Z"
  },
  {
    id: "flw_citi_mt_4412c019",
    clientToken: "citi_live_clt_0x33e8b091fca7182e00cd",
    amount: 580000000.0,
    currency: "EUR",
    rail: "QUANTUM_ATOMIC_SETTLE",
    counterparty: SAMPLE_COUNTERPARTIES[1],
    status: "clearing",
    neuralRiskScore: 0.0041,
    estimatedSettlementSeconds: 0.8,
    luxAssetClass: "ORBITAL_REAL_ESTATE",
    modernTreasuryLedgerId: "mt_led_2901ee827fa",
    citiEscrowKey: "ESC-CITI-LDN-4421-Q",
    createdAt: "2025-03-30T11:02:10Z",
    updatedAt: "2025-03-30T11:03:00Z"
  }
];

export default function QuantumPaymentFlows() {
  const [flows, setFlows] = useState<PaymentFlowItem[]>(INITIAL_FLOWS);
  const [selectedFlow, setSelectedFlow] = useState<PaymentFlowItem | null>(INITIAL_FLOWS[1]);
  const [wizardStep, setWizardStep] = useState<number>(1);
  const [copiedToken, setCopiedToken] = useState<string | null>(null);

  // Form Creation State
  const [amount, setAmount] = useState<string>("85000000");
  const [currency, setCurrency] = useState<string>("USD");
  const [assetClass, setAssetClass] = useState<PaymentFlowItem["luxAssetClass"]>("ISLAND_ACQUISITION");
  const [selectedCounterpartyId, setSelectedCounterpartyId] = useState<string>(SAMPLE_COUNTERPARTIES[2].id);
  const [selectedRail, setSelectedRail] = useState<PaymentRail>("MODERN_TREASURY_RTP");
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [clientTokenPreview, setClientTokenPreview] = useState<string | null>(null);
  const [aiAnalysisRunning, setAiAnalysisRunning] = useState<boolean>(false);
  const [activeCheckoutFlow, setActiveCheckoutFlow] = useState<PaymentFlowItem | null>(null);
  const [checkoutBiometricPassed, setCheckoutBiometricPassed] = useState<boolean>(false);

  // Simulated AI Engine calculation
  const aiRecommendation: AIRecommendation = useMemo(() => {
    const num = parseFloat(amount) || 0;
    if (num > 250000000) {
      return {
        recommendedRail: "QUANTUM_ATOMIC_SETTLE",
        citiFxFractionalAlpha: 0.00018,
        estimatedFeeSovereignBps: 0.45,
        liquidityConfidence: 99.98,
        aiRationale: "Citibank Deep Liquidity Protocol recommends Quantum Atomic Settlement for amounts exceeding $250M to eradicate multi-ledger delta slippage."
      };
    } else if (currency === "USD") {
      return {
        recommendedRail: "CITI_CHIPS_INSTANT",
        citiFxFractionalAlpha: 0.00005,
        estimatedFeeSovereignBps: 0.22,
        liquidityConfidence: 100.0,
        aiRationale: "Modern Treasury + Citi CHIPS pipeline guarantees deterministic millisecond finality with zero counterparty settlement variance."
      };
    } else {
      return {
        recommendedRail: "SWIFT_GPI_HYPERDRIVE",
        citiFxFractionalAlpha: 0.00035,
        estimatedFeeSovereignBps: 0.65,
        liquidityConfidence: 99.85,
        aiRationale: "Cross-border sovereign currency swap optimal through Modern Treasury routing with Citibank Global FX Corridors."
      };
    }
  }, [amount, currency]);

  // Handle Token Copying
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedToken(text);
    setTimeout(() => setCopiedToken(null), 2500);
  };

  // Generate Flow / Step Advance
  const handleGenerateFlow = async () => {
    setIsSynthesizing(true);
    setAiAnalysisRunning(true);

    // Simulate AI synthesis & Modern Treasury token generation delay
    await new Promise((resolve) => setTimeout(resolve, 1400));
    setAiAnalysisRunning(false);

    const generatedToken = `citi_live_clt_0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`;
    const newFlowId = `flw_citi_mt_${Math.random().toString(16).substring(2, 10)}`;
    const targetCp = SAMPLE_COUNTERPARTIES.find((c) => c.id === selectedCounterpartyId) || SAMPLE_COUNTERPARTIES[0];

    const newFlow: PaymentFlowItem = {
      id: newFlowId,
      clientToken: generatedToken,
      amount: parseFloat(amount) || 1000000,
      currency,
      rail: selectedRail,
      counterparty: targetCp,
      status: "pending_tokenization",
      neuralRiskScore: 0.0008,
      estimatedSettlementSeconds: selectedRail === "QUANTUM_ATOMIC_SETTLE" ? 0.6 : 2.1,
      luxAssetClass: assetClass,
      modernTreasuryLedgerId: `mt_led_${Math.random().toString(16).substring(2, 11)}`,
      citiEscrowKey: `ESC-CITI-VIP-${Math.floor(1000 + Math.random() * 9000)}-Z`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    setClientTokenPreview(generatedToken);
    setFlows((prev) => [newFlow, ...prev]);
    setSelectedFlow(newFlow);
    setIsSynthesizing(false);
    setWizardStep(4);
  };

  // Run Real-time status advancement simulation
  const advanceFlowStatus = (flowId: string) => {
    setFlows((prev) =>
      prev.map((f) => {
        if (f.id !== flowId) return f;
        const stateMap: Record<FlowStatus, FlowStatus> = {
          pending_tokenization: "ai_risk_evaluating",
          ai_risk_evaluating: "ledger_allocated",
          ledger_allocated: "client_authorized",
          client_authorized: "clearing",
          clearing: "settled",
          settled: "settled",
          flagged_sovereign_review: "ledger_allocated"
        };
        const next = stateMap[f.status];
        return { ...f, status: next, updatedAt: new Date().toISOString() };
      })
    );
  };

  // Sync selected flow with main array updates
  useEffect(() => {
    if (selectedFlow) {
      const fresh = flows.find((f) => f.id === selectedFlow.id);
      if (fresh) setSelectedFlow(fresh);
    }
  }, [flows]);

  return (
    <div className="min-h-screen bg-[#02050B] text-slate-100 p-4 md:p-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner: Sovereign High Net Worth Citibank / Modern Treasury Mesh */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-amber-500/20 pb-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-widest uppercase bg-gradient-to-r from-amber-500/10 to-amber-600/20 text-amber-300 border border-amber-500/30">
              <Sparkles className="w-3 h-3 text-amber-400" /> Citibank Private Wealth & Modern Treasury OS
            </span>
            <span className="inline-flex items-center gap-1 text-[11px] font-mono text-cyan-400/80 bg-cyan-950/40 px-2 py-0.5 rounded border border-cyan-800/40">
              <Zap className="w-3 h-3" /> /api/payment_flows
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
            Quantum Payment Flow Orchestrator
            <span className="text-xs font-mono font-normal px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-300">
              Bespoke Sovereign Edition v9.8
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Autonomous multi-million dollar liquidity settlement engine combining Citibank Institutional Escrow, Modern Treasury Ledger Virtualization, and Neural Counterparty Due Diligence.
          </p>
        </div>

        {/* Live Network Health Gauges */}
        <div className="flex items-center gap-3 bg-slate-900/80 backdrop-blur-md p-3 rounded-xl border border-slate-800 shadow-xl">
          <div className="flex flex-col border-r border-slate-800 pr-3">
            <span className="text-[10px] uppercase font-mono text-slate-400">Citi Chips Core</span>
            <span className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span> 0.04ms Latency
            </span>
          </div>
          <div className="flex flex-col border-r border-slate-800 pr-3">
            <span className="text-[10px] uppercase font-mono text-slate-400">MT Inter-Ledger</span>
            <span className="text-xs font-mono font-bold text-cyan-400">SYNCED (100.0%)</span>
          </div>
          <div className="flex flex-col">
            <span className="text-[10px] uppercase font-mono text-slate-400">AI Risk Guard</span>
            <span className="text-xs font-mono font-bold text-amber-400 flex items-center gap-0.5">
              <Shield className="w-3 h-3" /> TIER-0 ACTIVE
            </span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* LEFT COLUMN: Interactive Luxury Payment Flow Wizard (7 Cols) */}
        <section className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
            {/* Ambient luxury glow */}
            <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -left-24 w-64 h-64 bg-cyan-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Stepper Navigation */}
            <div className="flex items-center justify-between mb-8 relative z-10 border-b border-slate-800 pb-4">
              {[
                { step: 1, label: "Asset & Amount", icon: DollarSign },
                { step: 2, label: "Counterparty", icon: Building },
                { step: 3, label: "Modern Treasury Rail", icon: Cpu },
                { step: 4, label: "Client Token / Deploy", icon: Key }
              ].map((item) => {
                const IconComponent = item.icon;
                const isActive = wizardStep === item.step;
                const isPassed = wizardStep > item.step;
                return (
                  <button
                    key={item.step}
                    onClick={() => setWizardStep(item.step)}
                    className={`flex items-center gap-2 group transition-all text-left ${
                      isActive ? "text-amber-400 font-semibold" : isPassed ? "text-slate-300" : "text-slate-600"
                    }`}
                  >
                    <div
                      className={`w-7 h-7 rounded-lg flex items-center justify-center text-xs font-mono transition-all ${
                        isActive
                          ? "bg-amber-500 text-black font-bold shadow-lg shadow-amber-500/30"
                          : isPassed
                          ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/40"
                          : "bg-slate-800 text-slate-500 border border-slate-700"
                      }`}
                    >
                      {isPassed ? <Check className="w-3.5 h-3.5" /> : item.step}
                    </div>
                    <span className="hidden sm:inline text-xs">{item.label}</span>
                  </button>
                );
              })}
            </div>

            {/* STEP 1: Asset Classification & Valuation */}
            {wizardStep === 1 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-amber-400" /> Specify Luxury Asset Class & Escrow Sum
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Citibank High-Value settlement initiates under strict sovereign AML & Modern Treasury multi-sig.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Target Asset Acquisition</label>
                    <select
                      value={assetClass}
                      onChange={(e) => setAssetClass(e.target.value as PaymentFlowItem["luxAssetClass"])}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-amber-500 transition-colors"
                    >
                      <option value="SUPER_YACHT">Lürssen 140m Super Yacht Refit ($145M+)</option>
                      <option value="ORBITAL_REAL_ESTATE">Low-Orbit Habitat Commercial Module</option>
                      <option value="ISLAND_ACQUISITION">Private Atoll Sovereign Purchase</option>
                      <option value="AERO_FLEET">Bombardier Global 8000 Fleet Escrow</option>
                      <option value="SOVEREIGN_DEBT_SWAP">Bilateral Sovereign Debt Collateral Swap</option>
                    </select>
                  </div>

                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-300">Base Sovereign Currency</label>
                    <div className="grid grid-cols-4 gap-2">
                      {["USD", "EUR", "CHF", "SGD"].map((c) => (
                        <button
                          key={c}
                          type="button"
                          onClick={() => setCurrency(c)}
                          className={`py-2 text-xs font-mono font-bold rounded-lg border transition-all ${
                            currency === c
                              ? "bg-amber-500/20 text-amber-300 border-amber-500 shadow-md"
                              : "bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700"
                          }`}
                        >
                          {c}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="space-y-2">
                  <label className="text-xs font-medium text-slate-300 flex items-center justify-between">
                    <span>Payment Flow Value ({currency})</span>
                    <span className="text-amber-400 font-mono font-bold">
                      ${Number(amount).toLocaleString()} {currency}
                    </span>
                  </label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-3 text-slate-500 font-mono">$</span>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-700 rounded-xl pl-8 pr-4 py-2.5 text-base font-mono text-white focus:outline-none focus:border-amber-500"
                    />
                  </div>
                </div>

                {/* AI Rationale Insight Card */}
                <div className="p-4 bg-gradient-to-br from-slate-950 via-slate-900 to-amber-950/20 rounded-xl border border-amber-500/30">
                  <div className="flex items-center gap-2 text-amber-400 text-xs font-bold mb-1">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-spin-slow" /> Citi Neural Intelligence Recommendation
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed font-mono">{aiRecommendation.aiRationale}</p>
                  <div className="mt-3 flex items-center gap-4 text-[11px] font-mono text-slate-400">
                    <span>Est. Fee: {aiRecommendation.estimatedFeeSovereignBps} bps</span>
                    <span>•</span>
                    <span>Confidence: {aiRecommendation.liquidityConfidence}%</span>
                    <span>•</span>
                    <span className="text-emerald-400">Alpha FX Advantage: +{aiRecommendation.citiFxFractionalAlpha}%</span>
                  </div>
                </div>

                <div className="flex justify-end">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all"
                  >
                    Proceed to Counterparty <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 2: Counterparty Target Validation */}
            {wizardStep === 2 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Building className="w-5 h-5 text-amber-400" /> Modern Treasury Counterparty Routing
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Select an authenticated institutional tier recipient. All accounts verify directly against Citibank Global clearing logs.
                  </p>
                </div>

                <div className="space-y-3">
                  {SAMPLE_COUNTERPARTIES.map((cp) => (
                    <div
                      key={cp.id}
                      onClick={() => setSelectedCounterpartyId(cp.id)}
                      className={`p-4 rounded-xl border cursor-pointer transition-all ${
                        selectedCounterpartyId === cp.id
                          ? "bg-slate-800/90 border-amber-500/70 shadow-lg shadow-amber-500/10"
                          : "bg-slate-950/50 border-slate-800 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-2">
                            <h4 className="text-sm font-semibold text-white">{cp.name}</h4>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                              {cp.kycTier}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-1">{cp.institution}</p>
                          <div className="flex items-center gap-3 mt-2 text-[11px] font-mono text-slate-500">
                            <span>BIC: {cp.citiBic}</span>
                            <span>•</span>
                            <span>Jurisdiction: {cp.jurisdiction}</span>
                            <span>•</span>
                            <span className="text-slate-300 font-bold">{cp.accountMask}</span>
                          </div>
                        </div>
                        <div
                          className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            selectedCounterpartyId === cp.id ? "border-amber-400 bg-amber-500 text-black" : "border-slate-700"
                          }`}
                        >
                          {selectedCounterpartyId === cp.id && <Check className="w-3.5 h-3.5" />}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setWizardStep(1)}
                    className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    onClick={() => setWizardStep(3)}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold px-6 py-2.5 rounded-xl shadow-lg transition-all"
                  >
                    Verify Rail Architecture <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* STEP 3: Modern Treasury Rail Optimization */}
            {wizardStep === 3 && (
              <div className="space-y-6 animate-fadeIn">
                <div>
                  <h3 className="text-lg font-bold text-white flex items-center gap-2">
                    <Cpu className="w-5 h-5 text-amber-400" /> Select Settlement Pipeline & Protocol
                  </h3>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Modern Treasury automates split ledger entries while Citibank executes final settlement across target rails.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {[
                    {
                      id: "CITI_CHIPS_INSTANT",
                      name: "Citi CHIPS Ultra-Instant",
                      latency: "400ms",
                      security: "Citibank Vault Multi-Sig",
                      badge: "PREFERRED TIER-1"
                    },
                    {
                      id: "MODERN_TREASURY_RTP",
                      name: "Modern Treasury Direct RTP",
                      latency: "950ms",
                      security: "Real-Time Gross ISO20022",
                      badge: "24/7/365 UNCONDITIONAL"
                    },
                    {
                      id: "QUANTUM_ATOMIC_SETTLE",
                      name: "Quantum Atomic Multi-Ledger",
                      latency: "120ms",
                      security: "NIST Quantum Safe Crystal-Kyber",
                      badge: "MAX PRIVACY / $100M+"
                    },
                    {
                      id: "SWIFT_GPI_HYPERDRIVE",
                      name: "SWIFT GPI High-Velocity",
                      latency: "3.2s",
                      security: "Central Bank Tier 0 Escrow",
                      badge: "CROSS-SOVEREIGN"
                    }
                  ].map((rail) => (
                    <div
                      key={rail.id}
                      onClick={() => setSelectedRail(rail.id as PaymentRail)}
                      className={`p-3.5 rounded-xl border cursor-pointer transition-all ${
                        selectedRail === rail.id
                          ? "bg-amber-500/10 border-amber-500 text-white shadow-lg"
                          : "bg-slate-950/60 border-slate-800 text-slate-300 hover:border-slate-700"
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-xs font-bold font-mono text-amber-300">{rail.badge}</span>
                        <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-800/40">
                          {rail.latency}
                        </span>
                      </div>
                      <h4 className="text-sm font-semibold">{rail.name}</h4>
                      <p className="text-[11px] text-slate-400 mt-1 flex items-center gap-1 font-mono">
                        <Lock className="w-3 h-3 text-slate-500" /> {rail.security}
                      </p>
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2">
                  <button
                    onClick={() => setWizardStep(2)}
                    className="text-xs font-mono text-slate-400 hover:text-white transition-colors"
                  >
                    Back
                  </button>
                  <button
                    disabled={isSynthesizing}
                    onClick={handleGenerateFlow}
                    className="flex items-center gap-2 bg-gradient-to-r from-amber-500 via-amber-400 to-amber-600 hover:brightness-110 text-black font-bold px-6 py-2.5 rounded-xl shadow-xl transition-all"
                  >
                    {isSynthesizing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" /> Synthesizing Flow & MT Ledger...
                      </>
                    ) : (
                      <>
                        <Key className="w-4 h-4" /> Synthesize Client Token & Flow <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* STEP 4: Token Generation & Checkout Initialization */}
            {wizardStep === 4 && clientTokenPreview && (
              <div className="space-y-6 animate-fadeIn">
                <div className="text-center py-4">
                  <div className="w-12 h-12 rounded-2xl bg-amber-500/20 border border-amber-500/40 flex items-center justify-center mx-auto mb-3 text-amber-400">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <h3 className="text-xl font-bold text-white">Payment Flow Synthesized & Ledgered</h3>
                  <p className="text-xs text-slate-400 max-w-md mx-auto mt-1">
                    Modern Treasury endpoint <code className="text-cyan-300 font-mono">/api/payment_flows</code> has issued an ephemeral high-entropy authorization token.
                  </p>
                </div>

                {/* Client Token Vault Box */}
                <div className="p-4 bg-slate-950 rounded-xl border border-amber-500/30 space-y-3">
                  <div className="flex items-center justify-between text-xs">
                    <span className="font-mono text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Key className="w-3.5 h-3.5 text-amber-400" /> Ephemeral Client Token (X-Citi-Auth)
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">EXPIRES IN 14:59</span>
                  </div>

                  <div className="flex items-center gap-2 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
                    <code className="text-xs font-mono text-amber-200 flex-1 overflow-x-auto select-all">
                      {clientTokenPreview}
                    </code>
                    <button
                      onClick={() => copyToClipboard(clientTokenPreview)}
                      className="p-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors"
                      title="Copy Client Token"
                    >
                      {copiedToken === clientTokenPreview ? (
                        <Check className="w-4 h-4 text-emerald-400" />
                      ) : (
                        <Copy className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                </div>

                {/* Actions: Launch Embedded Luxury Checkout */}
                <div className="flex flex-col sm:flex-row items-center gap-3">
                  <button
                    onClick={() => {
                      if (selectedFlow) {
                        setActiveCheckoutFlow(selectedFlow);
                        setCheckoutBiometricPassed(false);
                      }
                    }}
                    className="w-full sm:flex-1 flex items-center justify-center gap-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-3 px-4 rounded-xl shadow-lg transition-all"
                  >
                    <CreditCard className="w-4 h-4" /> Launch Embedded Luxury Checkout
                  </button>

                  <button
                    onClick={() => {
                      setWizardStep(1);
                      setClientTokenPreview(null);
                    }}
                    className="w-full sm:w-auto px-4 py-3 bg-slate-800 hover:bg-slate-700 text-xs font-mono text-slate-300 rounded-xl transition-colors"
                  >
                    New Flow
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* ACTIVE FLOWS TELEMETRY LIST */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Activity className="w-4 h-4 text-cyan-400" /> Active Modern Treasury Flow Pool
                </h3>
                <p className="text-xs text-slate-400">Live polling from Modern Treasury & Citi Master Ledger.</p>
              </div>
              <span className="text-xs font-mono text-slate-500">Live Nodes: 4 Clusters</span>
            </div>

            <div className="space-y-3">
              {flows.map((flow) => {
                const isSelected = selectedFlow?.id === flow.id;
                return (
                  <div
                    key={flow.id}
                    onClick={() => setSelectedFlow(flow)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      isSelected
                        ? "bg-slate-800/90 border-cyan-500/60 shadow-lg shadow-cyan-500/10"
                        : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700"
                    }`}
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div className="flex items-center gap-3">
                        <div
                          className={`w-3 h-3 rounded-full ${
                            flow.status === "settled"
                              ? "bg-emerald-400 shadow-md shadow-emerald-400/50"
                              : flow.status === "clearing"
                              ? "bg-cyan-400 animate-pulse"
                              : "bg-amber-400"
                          }`}
                        />
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-white">{flow.id}</span>
                            <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {flow.luxAssetClass}
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{flow.counterparty.name}</p>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm font-mono font-bold text-amber-300">
                          {flow.currency} {flow.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] font-mono text-slate-500 uppercase tracking-wide">
                          {flow.rail}
                        </div>
                      </div>
                    </div>

                    {/* Quick status progression trigger */}
                    <div className="mt-3 pt-3 border-t border-slate-800/60 flex items-center justify-between">
                      <span className="text-[11px] font-mono text-cyan-400 capitalize">
                        Status: <span className="text-slate-200">{flow.status.replace(/_/g, " ")}</span>
                      </span>
                      {flow.status !== "settled" && (
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            advanceFlowStatus(flow.id);
                          }}
                          className="text-[11px] font-mono px-2.5 py-1 rounded bg-cyan-950/60 hover:bg-cyan-900/60 text-cyan-300 border border-cyan-700/50 transition-colors flex items-center gap-1"
                        >
                          Step Forward <ArrowRight className="w-3 h-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: Real-Time Flow Inspection & Embedded Luxury Checkout Simulation (5 Cols) */}
        <section className="lg:col-span-5 space-y-6">
          {/* FLOW AUDIT & CRYPTO TELEMETRY */}
          <div className="bg-slate-900/60 backdrop-blur-xl border border-slate-800/80 rounded-2xl p-6 shadow-2xl">
            <h3 className="text-base font-bold text-white flex items-center gap-2 mb-1">
              <Terminal className="w-4 h-4 text-amber-400" /> Deep Ledger Inspection
            </h3>
            <p className="text-xs text-slate-400 mb-4">Citibank Sovereign Cryptographic Telemetry</p>

            {selectedFlow ? (
              <div className="space-y-4">
                <div className="p-3.5 bg-slate-950 rounded-xl border border-slate-800 space-y-2.5 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Flow Identifier:</span>
                    <span className="text-amber-300 font-bold">{selectedFlow.id}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">MT Ledger ID:</span>
                    <span className="text-cyan-400">{selectedFlow.modernTreasuryLedgerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Escrow Node:</span>
                    <span className="text-slate-300">{selectedFlow.citiEscrowKey}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Neural Risk Index:</span>
                    <span className="text-emerald-400 font-bold">{(selectedFlow.neuralRiskScore * 100).toFixed(4)}% (SAFE)</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Est. Settlement:</span>
                    <span className="text-slate-300">{selectedFlow.estimatedSettlementSeconds}s (Atomic)</span>
                  </div>
                </div>

                {/* Micro Visual Status Pipeline */}
                <div className="p-4 bg-slate-950/80 rounded-xl border border-slate-800">
                  <div className="text-[11px] uppercase tracking-wider font-mono text-slate-400 mb-3">
                    Multi-Rail Settlement Progress
                  </div>
                  <div className="space-y-2">
                    {[
                      { key: "pending_tokenization", label: "Token Generation & Nonce Binding" },
                      { key: "ai_risk_evaluating", label: "AI Neural AML & Sanctions Cross-Check" },
                      { key: "ledger_allocated", label: "Modern Treasury Sub-Ledger Segregation" },
                      { key: "client_authorized", label: "Citibank Sovereign Private Key Signature" },
                      { key: "settled", label: "Final Irrevocable Atomic Finality" }
                    ].map((stepItem, idx) => {
                      const isComplete =
                        selectedFlow.status === "settled" ||
                        (selectedFlow.status === "clearing" && idx <= 3) ||
                        (selectedFlow.status === "client_authorized" && idx <= 3) ||
                        (selectedFlow.status === "ledger_allocated" && idx <= 2) ||
                        (selectedFlow.status === "ai_risk_evaluating" && idx <= 1) ||
                        (selectedFlow.status === "pending_tokenization" && idx === 0);

                      return (
                        <div key={stepItem.key} className="flex items-center gap-2.5 text-xs font-mono">
                          <div
                            className={`w-4 h-4 rounded-full flex items-center justify-center ${
                              isComplete ? "bg-emerald-500/20 text-emerald-400 border border-emerald-500/50" : "bg-slate-800 text-slate-600"
                            }`}
                          >
                            {isComplete ? <Check className="w-2.5 h-2.5" /> : idx + 1}
                          </div>
                          <span className={isComplete ? "text-slate-200" : "text-slate-600"}>{stepItem.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>

                <div className="p-3 bg-cyan-950/20 border border-cyan-800/40 rounded-xl flex items-center gap-3">
                  <Globe className="w-5 h-5 text-cyan-400 shrink-0" />
                  <div className="text-xs font-mono text-slate-300">
                    Routing dynamically anchored to Citi Singapore & Zurich high-frequency liquidity corridors.
                  </div>
                </div>
              </div>
            ) : (
              <div className="text-center py-8 text-xs font-mono text-slate-500">
                Select a flow from the pool to inspect live ledger telemetry.
              </div>
            )}
          </div>

          {/* EMBEDDED LUXURY CHECKOUT SIMULATOR (MODAL / INLINE DRAWER) */}
          {activeCheckoutFlow && (
            <div className="bg-gradient-to-b from-slate-900 to-black border-2 border-amber-500/60 rounded-2xl p-6 shadow-2xl space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-3 h-3 rounded-full bg-amber-400 animate-ping" />
                  <h4 className="text-sm font-bold text-white font-mono">Bespoke Checkout Terminal</h4>
                </div>
                <button
                  onClick={() => setActiveCheckoutFlow(null)}
                  className="text-xs font-mono text-slate-500 hover:text-white"
                >
                  [Dismiss]
                </button>
              </div>

              <div className="text-center py-3">
                <span className="text-[11px] font-mono text-amber-400/90 tracking-widest uppercase">
                  Citibank Private Client Verification
                </span>
                <div className="text-2xl font-mono font-extrabold text-white mt-1">
                  ${activeCheckoutFlow.amount.toLocaleString()} {activeCheckoutFlow.currency}
                </div>
                <p className="text-xs text-slate-400 mt-1">{activeCheckoutFlow.counterparty.name}</p>
              </div>

              {/* Biometric / Multi-Sig Emulation */}
              {!checkoutBiometricPassed ? (
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 text-center space-y-3">
                  <div className="w-12 h-12 rounded-full bg-amber-500/10 border border-amber-500/30 flex items-center justify-center mx-auto text-amber-400">
                    <Lock className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <div className="text-xs font-bold text-white">Quantum Key Biometric Authorization</div>
                    <p className="text-[11px] text-slate-400 mt-0.5">
                      Touch biometric reader or trigger YubiKey Hardware Token for irrevocable Modern Treasury instruction.
                    </p>
                  </div>

                  <button
                    onClick={() => {
                      setCheckoutBiometricPassed(true);
                      advanceFlowStatus(activeCheckoutFlow.id);
                    }}
                    className="w-full bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold py-2.5 rounded-lg text-xs font-mono transition-all shadow-md"
                  >
                    Simulate Biometric Auth & Sign
                  </button>
                </div>
              ) : (
                <div className="p-4 bg-emerald-950/20 border border-emerald-500/40 rounded-xl text-center space-y-2 animate-fadeIn">
                  <CheckCircle2 className="w-8 h-8 text-emerald-400 mx-auto" />
                  <div className="text-xs font-bold font-mono text-emerald-300">
                    Irrevocable Sovereign Transfer Dispatched
                  </div>
                  <p className="text-[11px] text-slate-400">
                    Ledger entries committed. Citi CHIPS routing token has executed atomic transfer.
                  </p>
                </div>
              )}

              <div className="text-[10px] font-mono text-center text-slate-500">
                Modern Treasury Direct API Bridge • 256-bit Post-Quantum Cryptography
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
}