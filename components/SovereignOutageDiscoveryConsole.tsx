"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import {
  Clock,
  AlertTriangle,
  ShieldCheck,
  Zap,
  Server,
  Activity,
  Database,
  Cpu,
  Lock,
  Sparkles,
  RefreshCw,
  Eye,
  Layers,
  Compass,
  ChevronRight,
  TrendingDown,
  Globe2,
  Terminal,
  Radio,
  Share2,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
  ExternalLink,
  ShieldAlert
} from "lucide-react";

// --- Types & Interfaces ---

export interface OutageScope {
  id: string;
  scopeName: string;
  category: "AISP" | "PISP" | "CBPII" | "IDENTITY" | "SETTLEMENT";
  impactLevel: "TOTAL" | "PARTIAL" | "DEGRADED" | "STANDBY_RESILIENT";
  endpointsImpacted: string[];
  modernTreasuryFallbackRoute: string;
  quantumResilienceFactor: number; // 0 - 1.00
  mitigationProtocol: string;
}

export interface PSD2ScheduledOutage {
  id: string;
  sovereignReference: string;
  citibankRegion: "EMEA_LONDON_CORE" | "NA_NEW_YORK_METRO" | "APAC_SINGAPORE_VAULT" | "SWISS_ALPINE_STORAGE";
  isoDuration: string; // ISO 8601 e.g. "PT3H45M"
  startTimeUTC: string;
  endTimeUTC: string;
  status: "SCHEDULED" | "ACTIVE_WINDOW" | "QUANTUM_MITIGATED" | "COMPLETED";
  regulatoryFramework: "PSD2_RTS_ARTICLE_32" | "OPEN_BANKING_UK_V3" | "MAS_API_EXCELLENCE" | "FEDNOW_ULTRA";
  quantumEngineVerdict: {
    confidence: number;
    recommendedFailover: string;
    shadowLedgerSyncP99: string;
    projectedSlippageBps: number;
  };
  scopes: OutageScope[];
  notes: string;
}

// --- Sample Sovereign PSD2 Outage Fixtures ---

const INITIAL_OUTAGES: PSD2ScheduledOutage[] = [
  {
    id: "OUTAGE-CITI-PSD2-9901X",
    sovereignReference: "CITI-SOV-EU-994029-A",
    citibankRegion: "EMEA_LONDON_CORE",
    isoDuration: "PT2H30M00S",
    startTimeUTC: new Date(Date.now() + 1000 * 60 * 42 + 1000 * 18).toISOString(),
    endTimeUTC: new Date(Date.now() + 1000 * 60 * 192).toISOString(),
    status: "SCHEDULED",
    regulatoryFramework: "PSD2_RTS_ARTICLE_32",
    quantumEngineVerdict: {
      confidence: 0.9984,
      recommendedFailover: "MODERN_TREASURY_QUANTUM_ROUTING_RELAY_3",
      shadowLedgerSyncP99: "4.12ms",
      projectedSlippageBps: 0.0001
    },
    scopes: [
      {
        id: "SC-01",
        scopeName: "Direct Payment Initiation (PISP RTS-32)",
        category: "PISP",
        impactLevel: "PARTIAL",
        endpointsImpacted: ["/v3.1/pisp/domestic-payments", "/v3.1/pisp/international-scheduled-transfers"],
        modernTreasuryFallbackRoute: "mt_rtp_instant_settle_gateway_v4",
        quantumResilienceFactor: 0.965,
        mitigationProtocol: "Bi-directional Autonomous Shadow Buffer"
      },
      {
        id: "SC-02",
        scopeName: "Account Aggregation & Statement Streams (AISP)",
        category: "AISP",
        impactLevel: "DEGRADED",
        endpointsImpacted: ["/v3.1/aisp/accounts/{accountId}/balances", "/v3.1/aisp/transactions-quantum-stream"],
        modernTreasuryFallbackRoute: "mt_virtual_account_telemetry_mirror",
        quantumResilienceFactor: 0.989,
        mitigationProtocol: "Read-Only 24k Gold Cache Vault Replication"
      },
      {
        id: "SC-03",
        scopeName: "Card-Based Fund Confirmation (CBPII)",
        category: "CBPII",
        impactLevel: "TOTAL",
        endpointsImpacted: ["/v3.1/cbpii/funds-confirmation"],
        modernTreasuryFallbackRoute: "mt_synthetic_preauth_collateral_engine",
        quantumResilienceFactor: 0.892,
        mitigationProtocol: "Atomic Collateral Lock Guarantee"
      }
    ],
    notes: "Routine architectural quantum core firmware upgrade on PSD2 Direct Gateway clusters."
  },
  {
    id: "OUTAGE-CITI-PSD2-8822B",
    sovereignReference: "CITI-SOV-CH-338192-K",
    citibankRegion: "SWISS_ALPINE_STORAGE",
    isoDuration: "PT4H15M30S",
    startTimeUTC: new Date(Date.now() + 1000 * 60 * 180).toISOString(),
    endTimeUTC: new Date(Date.now() + 1000 * 60 * 435).toISOString(),
    status: "SCHEDULED",
    regulatoryFramework: "PSD2_RTS_ARTICLE_32",
    quantumEngineVerdict: {
      confidence: 0.9997,
      recommendedFailover: "CITI_PRIVATE_FABRIC_ALPINE_MIRROR_0",
      shadowLedgerSyncP99: "1.89ms",
      projectedSlippageBps: 0.0
    },
    scopes: [
      {
        id: "SC-04",
        scopeName: "Swiss RTGS / SIC6 Sovereign Linkage",
        category: "SETTLEMENT",
        impactLevel: "STANDBY_RESILIENT",
        endpointsImpacted: ["/v2/sic6/quantum-wire", "/v2/iso20022/pacs.008.001.09"],
        modernTreasuryFallbackRoute: "mt_swiss_cantonal_interbank_pipe",
        quantumResilienceFactor: 0.999,
        mitigationProtocol: "Zero-Latency Dual Ledger Shadow Ingestion"
      },
      {
        id: "SC-05",
        scopeName: "Consortium PSD2 Token Validation Engine",
        category: "IDENTITY",
        impactLevel: "PARTIAL",
        endpointsImpacted: ["/oauth2/v2/token", "/oauth2/v2/psd2/eidas-verify"],
        modernTreasuryFallbackRoute: "mt_eidas_hardware_security_enclave",
        quantumResilienceFactor: 0.978,
        mitigationProtocol: "Pre-validated eIDAS QWAC Certificate Pinning"
      }
    ],
    notes: "Quarterly Alpine Zero-Trust hardware security key rotation & RTS Article 32 stress benchmark."
  }
];

// --- Helpers: ISO Duration & Quantum Formats ---

function parseISODuration(isoStr: string) {
  const regex = /PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?/;
  const matches = isoStr.match(regex);
  if (!matches) return { hours: 0, minutes: 0, seconds: 0, totalSeconds: 0 };
  const hours = parseInt(matches[1] || "0", 10);
  const minutes = parseInt(matches[2] || "0", 10);
  const seconds = parseInt(matches[3] || "0", 10);
  const totalSeconds = hours * 3600 + minutes * 60 + seconds;
  return { hours, minutes, seconds, totalSeconds };
}

// Format milliseconds into atomic countdown tokens
function calculateTimeDelta(targetIso: string) {
  const diff = Math.max(0, new Date(targetIso).getTime() - Date.now());
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  const millis = Math.floor((diff % 1000) / 10);
  return {
    hours: String(hours).padStart(2, "0"),
    minutes: String(minutes).padStart(2, "0"),
    seconds: String(seconds).padStart(2, "0"),
    millis: String(millis).padStart(2, "0"),
    isLive: diff === 0
  };
}

export default function SovereignOutageDiscoveryConsole() {
  const [outages, setOutages] = useState<PSD2ScheduledOutage[]>(INITIAL_OUTAGES);
  const [selectedOutageId, setSelectedOutageId] = useState<string>(INITIAL_OUTAGES[0].id);
  const [filterCategory, setFilterCategory] = useState<string>("ALL");
  const [isSynthesizingAI, setIsSynthesizingAI] = useState<boolean>(false);
  const [modernTreasuryFailoverActive, setModernTreasuryFailoverActive] = useState<boolean>(false);
  const [telemetryPulse, setTelemetryPulse] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [tick, setTick] = useState<number>(0);

  // Precision 50ms quantum tick for microsecond-level gold countdown
  useEffect(() => {
    const interval = setInterval(() => {
      setTick((prev) => prev + 1);
    }, 50);
    return () => clearInterval(interval);
  }, []);

  // Selected Outage object
  const activeOutage = useMemo(() => {
    return outages.find((o) => o.id === selectedOutageId) || outages[0];
  }, [outages, selectedOutageId]);

  // Live countdown computation
  const countdown = useMemo(() => {
    return calculateTimeDelta(activeOutage.startTimeUTC);
  }, [activeOutage.startTimeUTC, tick]);

  const parsedDuration = useMemo(() => {
    return parseISODuration(activeOutage.isoDuration);
  }, [activeOutage.isoDuration]);

  // Filtered scopes
  const filteredScopes = useMemo(() => {
    return activeOutage.scopes.filter((sc) => {
      const matchesCat = filterCategory === "ALL" || sc.category === filterCategory;
      const matchesSearch =
        sc.scopeName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        sc.endpointsImpacted.some((ep) => ep.toLowerCase().includes(searchQuery.toLowerCase()));
      return matchesCat && matchesSearch;
    });
  }, [activeOutage, filterCategory, searchQuery]);

  // Simulate Sovereign AI Analysis Re-computation
  const triggerQuantumAIReassessment = useCallback(() => {
    setIsSynthesizingAI(true);
    setTimeout(() => {
      setIsSynthesizingAI(false);
      setTelemetryPulse((p) => p + 1);
    }, 1200);
  }, []);

  return (
    <div className="min-h-screen bg-[#060608] text-[#F3E5AB] font-sans antialiased p-4 md:p-8 selection:bg-[#D4AF37]/30 selection:text-[#FFF7D6]">
      {/* --- Top Sovereign Luxury Ambient Glow Bar --- */}
      <div className="fixed top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-[#D4AF37] via-[#FFF7D6] to-[#AA7C11] opacity-80 shadow-[0_0_20px_#D4AF37] z-50 pointer-events-none" />

      {/* --- Header: 24k Gold Prestige Nav & Status --- */}
      <header className="max-w-7xl mx-auto mb-8 border border-[#D4AF37]/30 rounded-2xl bg-gradient-to-b from-[#14141c]/90 via-[#0d0d12]/95 to-[#060608] backdrop-blur-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.85),0_0_25px_rgba(212,175,55,0.12)]">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="flex items-start gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#FFDF73] via-[#D4AF37] to-[#73510A] p-[1.5px] shadow-[0_0_25px_rgba(212,175,55,0.4)]">
                <div className="w-full h-full bg-[#09090D] rounded-xl flex items-center justify-center">
                  <Compass className="w-7 h-7 text-[#FFDF73] animate-[spin_24s_linear_infinite]" />
                </div>
              </div>
              <span className="absolute -bottom-1 -right-1 flex h-4 w-4">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75" />
                <span className="relative inline-flex rounded-full h-4 w-4 bg-[#AA7C11] border border-[#FFDF73] text-[9px] font-bold text-black items-center justify-center">
                  ✦
                </span>
              </span>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] tracking-[0.3em] font-extrabold text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-2.5 py-0.5 rounded-full border border-[#D4AF37]/30">
                  Citibank Sovereign Suite
                </span>
                <span className="text-[10px] tracking-[0.25em] font-mono text-[#A89F91] uppercase">
                  PSD2 RTS Art. 32 Compliance
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] via-[#FFDF73] to-[#AA7C11] mt-1 font-semibold">
                Sovereign PSD2 Scheduled Outage Console
              </h1>
              <p className="text-xs text-[#C5BC9F]/80 font-light mt-0.5">
                Autonomous API resilience matrix with Modern Treasury atomic failover integration.
              </p>
            </div>
          </div>

          {/* Quick Global Telemetry Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-[#0f0f15]/90 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 shadow-inner">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#9E947C]">Sovereign MTBO</div>
              <div className="text-lg font-mono font-bold text-[#FFDF73] flex items-center gap-1.5">
                <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                99.9994%
              </div>
            </div>

            <div className="bg-[#0f0f15]/90 border border-[#D4AF37]/20 rounded-xl px-4 py-2.5 shadow-inner">
              <div className="text-[10px] uppercase font-mono tracking-wider text-[#9E947C]">Failover Route</div>
              <div className="text-sm font-mono font-semibold text-[#E5D7A3] flex items-center gap-1.5">
                <Zap className="w-4 h-4 text-[#D4AF37]" />
                Modern Treasury Mesh
              </div>
            </div>

            <button
              onClick={triggerQuantumAIReassessment}
              disabled={isSynthesizingAI}
              className="relative group overflow-hidden px-4 py-2.5 rounded-xl bg-gradient-to-r from-[#AA7C11] via-[#D4AF37] to-[#8C6409] text-black font-semibold text-xs tracking-wider uppercase transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.6)] active:scale-95 disabled:opacity-50 flex items-center gap-2"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizingAI ? "animate-spin" : "group-hover:rotate-180 transition-transform duration-500"}`} />
              <span>{isSynthesizingAI ? "Quantum Synthesis..." : "Re-assess Sovereign Pulse"}</span>
            </button>
          </div>
        </div>
      </header>

      {/* --- Main Cockpit Grid --- */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- Left Column: Outage Selector & ISO Telemetry --- */}
        <section className="lg:col-span-4 space-y-6">
          {/* Outage Selector Card */}
          <div className="border border-[#D4AF37]/30 rounded-2xl bg-[#0c0c11]/90 backdrop-blur-xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)]">
            <div className="flex items-center justify-between pb-4 border-b border-[#D4AF37]/15">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D4AF37]" />
                <h2 className="text-sm font-mono uppercase tracking-[0.2em] text-[#FFDF73]">
                  Scheduled Outage Feeds
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-[#D4AF37]/15 text-[#FFDF73] px-2 py-0.5 rounded border border-[#D4AF37]/30">
                {outages.length} ACTIVE DIRECTIVES
              </span>
            </div>

            <div className="space-y-3 mt-4">
              {outages.map((outage) => {
                const isSelected = outage.id === activeOutage.id;
                return (
                  <div
                    key={outage.id}
                    onClick={() => setSelectedOutageId(outage.id)}
                    className={`cursor-pointer transition-all duration-300 rounded-xl p-3.5 border ${
                      isSelected
                        ? "bg-gradient-to-r from-[#1e1c12] via-[#242114] to-[#12110c] border-[#FFDF73] shadow-[0_0_20px_rgba(212,175,55,0.25)]"
                        : "bg-[#08080a]/60 border-[#D4AF37]/15 hover:border-[#D4AF37]/40 hover:bg-[#121218]"
                    }`}
                  >
                    <div className="flex items-center justify-between text-xs">
                      <span className="font-mono text-[#D4AF37] font-semibold tracking-wider">
                        {outage.id}
                      </span>
                      <span
                        className={`text-[9px] font-mono px-2 py-0.5 rounded-full border ${
                          outage.status === "SCHEDULED"
                            ? "bg-amber-950/60 text-[#FFDF73] border-[#FFDF73]/40"
                            : "bg-emerald-950/60 text-emerald-300 border-emerald-500/40"
                        }`}
                      >
                        {outage.status}
                      </span>
                    </div>

                    <div className="mt-2 text-xs font-serif text-[#FAF5E4] line-clamp-1">
                      {outage.notes}
                    </div>

                    <div className="mt-2.5 flex items-center justify-between text-[10px] font-mono text-[#9B927D]">
                      <span className="flex items-center gap-1">
                        <Globe2 className="w-3 h-3 text-[#D4AF37]" />
                        {outage.citibankRegion}
                      </span>
                      <span className="text-[#FFDF73]">ISO {outage.isoDuration}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Rich ISO 8601 Duration & Protocol Breakdown */}
          <div className="border border-[#D4AF37]/30 rounded-2xl bg-[#0c0c11]/90 backdrop-blur-xl p-5 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-4">
            <div className="flex items-center justify-between border-b border-[#D4AF37]/15 pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-mono uppercase tracking-[0.2em] text-[#FFDF73]">
                  ISO 8601 Duration Telemetry
                </h3>
              </div>
              <span className="text-[10px] font-mono text-[#D4AF37]">
                {activeOutage.regulatoryFramework}
              </span>
            </div>

            {/* Visual breakdown of ISO string */}
            <div className="bg-[#07070a] border border-[#D4AF37]/20 rounded-xl p-3.5">
              <div className="text-[10px] uppercase font-mono text-[#8C8470] mb-1">
                Raw ISO Duration Token
              </div>
              <div className="text-xl font-mono font-bold text-[#FFF2C6] tracking-widest">
                {activeOutage.isoDuration}
              </div>
              <div className="grid grid-cols-3 gap-2 mt-3 pt-3 border-t border-[#D4AF37]/15 text-center">
                <div className="bg-[#121217] rounded-lg p-2 border border-[#D4AF37]/10">
                  <div className="text-[10px] font-mono text-[#8C8470]">HOURS</div>
                  <div className="text-base font-mono font-bold text-[#FFDF73]">{parsedDuration.hours}h</div>
                </div>
                <div className="bg-[#121217] rounded-lg p-2 border border-[#D4AF37]/10">
                  <div className="text-[10px] font-mono text-[#8C8470]">MINUTES</div>
                  <div className="text-base font-mono font-bold text-[#FFDF73]">{parsedDuration.minutes}m</div>
                </div>
                <div className="bg-[#121217] rounded-lg p-2 border border-[#D4AF37]/10">
                  <div className="text-[10px] font-mono text-[#8C8470]">TOTAL SEC</div>
                  <div className="text-base font-mono font-bold text-[#FFDF73]">
                    {parsedDuration.totalSeconds}s
                  </div>
                </div>
              </div>
            </div>

            {/* Sovereign Quantum Verdict Box */}
            <div className="rounded-xl border border-[#D4AF37]/30 bg-gradient-to-br from-[#1c190f]/70 via-[#101015] to-[#0a0a0d] p-4 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
              <div className="flex items-center gap-2 text-xs font-mono text-[#FFDF73] mb-2">
                <Sparkles className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span>Citibank AI Consensus Matrix</span>
              </div>
              <div className="space-y-2 text-xs">
                <div className="flex justify-between font-mono">
                  <span className="text-[#968D78]">Confidence Score:</span>
                  <span className="text-[#FFF2C6] font-bold">
                    {(activeOutage.quantumEngineVerdict.confidence * 100).toFixed(2)}%
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#968D78]">Shadow Ledger P99:</span>
                  <span className="text-emerald-400 font-bold">
                    {activeOutage.quantumEngineVerdict.shadowLedgerSyncP99}
                  </span>
                </div>
                <div className="flex justify-between font-mono">
                  <span className="text-[#968D78]">Max Slippage:</span>
                  <span className="text-[#FFDF73] font-bold">
                    {activeOutage.quantumEngineVerdict.projectedSlippageBps} bps
                  </span>
                </div>
              </div>

              {/* Toggle Modern Treasury Bridge */}
              <div className="mt-4 pt-3 border-t border-[#D4AF37]/20 flex items-center justify-between">
                <div className="text-[11px] font-mono text-[#C4B795]">
                  Modern Treasury Hot-Standby
                </div>
                <button
                  onClick={() => setModernTreasuryFailoverActive(!modernTreasuryFailoverActive)}
                  className={`px-3 py-1 rounded-full text-[10px] font-mono font-bold tracking-wider transition-all duration-300 border ${
                    modernTreasuryFailoverActive
                      ? "bg-emerald-500/20 text-emerald-300 border-emerald-400 shadow-[0_0_15px_rgba(52,211,153,0.3)]"
                      : "bg-[#18181f] text-[#A89F91] border-[#D4AF37]/30 hover:border-[#D4AF37]"
                  }`}
                >
                  {modernTreasuryFailoverActive ? "ROUTING ENGAGED" : "ARM FAILOVER"}
                </button>
              </div>
            </div>
          </div>
        </section>

        {/* --- Right Column: Quantum Clock & Partial Scope Matrix --- */}
        <section className="lg:col-span-8 space-y-6">
          
          {/* Quantum Real-Time Countdown Clock Banner */}
          <div className="border border-[#D4AF37]/40 rounded-2xl bg-gradient-to-r from-[#17150f]/90 via-[#0d0d12] to-[#17150f]/90 p-6 shadow-[0_20px_50px_rgba(0,0,0,0.8),0_0_30px_rgba(212,175,55,0.15)] relative overflow-hidden">
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#D4AF37]/10 via-transparent to-transparent pointer-events-none" />

            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-[#D4AF37]/20 relative z-10">
              <div>
                <div className="flex items-center gap-2">
                  <Radio className="w-4 h-4 text-[#FFDF73] animate-pulse" />
                  <span className="text-[11px] font-mono uppercase tracking-[0.25em] text-[#FFDF73]">
                    Quantum Outage Epoch Countdown
                  </span>
                </div>
                <div className="text-xs font-mono text-[#A89F91] mt-0.5">
                  Ref: <span className="text-[#FFDF73] font-semibold">{activeOutage.sovereignReference}</span>
                </div>
              </div>
              <div className="flex items-center gap-2 bg-[#09090e] px-3.5 py-1.5 rounded-xl border border-[#D4AF37]/30">
                <Clock className="w-3.5 h-3.5 text-[#D4AF37]" />
                <span className="text-xs font-mono text-[#FAF5E4]">
                  Start: {new Date(activeOutage.startTimeUTC).toUTCString().slice(17, 25)} UTC
                </span>
              </div>
            </div>

            {/* Atomic Clock Segments */}
            <div className="grid grid-cols-4 gap-3 md:gap-6 my-6 text-center relative z-10">
              <div className="bg-gradient-to-b from-[#1b1911] to-[#0a0a0e] border border-[#D4AF37]/40 rounded-xl p-3 md:p-4 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <div className="text-3xl md:text-5xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] to-[#D4AF37]">
                  {countdown.hours}
                </div>
                <div className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-mono text-[#9B927D] mt-1">
                  Hours
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#1b1911] to-[#0a0a0e] border border-[#D4AF37]/40 rounded-xl p-3 md:p-4 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <div className="text-3xl md:text-5xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] to-[#D4AF37]">
                  {countdown.minutes}
                </div>
                <div className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-mono text-[#9B927D] mt-1">
                  Minutes
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#1b1911] to-[#0a0a0e] border border-[#D4AF37]/40 rounded-xl p-3 md:p-4 shadow-[0_0_20px_rgba(212,175,55,0.1)]">
                <div className="text-3xl md:text-5xl font-mono font-extrabold text-transparent bg-clip-text bg-gradient-to-b from-[#FFF5D1] to-[#D4AF37]">
                  {countdown.seconds}
                </div>
                <div className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-mono text-[#9B927D] mt-1">
                  Seconds
                </div>
              </div>

              <div className="bg-gradient-to-b from-[#2a220d] to-[#0a0a0e] border border-[#FFDF73]/60 rounded-xl p-3 md:p-4 shadow-[0_0_25px_rgba(255,223,115,0.2)]">
                <div className="text-3xl md:text-5xl font-mono font-extrabold text-[#FFF2C6] tabular-nums">
                  {countdown.millis}
                </div>
                <div className="text-[9px] md:text-[11px] uppercase tracking-[0.2em] font-mono text-[#D4AF37] mt-1">
                  Centisec
                </div>
              </div>
            </div>

            {/* Active failover routing badge */}
            {modernTreasuryFailoverActive && (
              <div className="relative z-10 bg-[#0d2117]/80 border border-emerald-500/50 rounded-xl p-3 flex items-center justify-between text-xs font-mono text-emerald-300">
                <div className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  <span>MODERN TREASURY SYNDICATED SHADOW TUNNEL ACTIVE</span>
                </div>
                <span className="text-[10px] text-emerald-400/80 underline decoration-emerald-500/50">
                  Target Route: {activeOutage.quantumEngineVerdict.recommendedFailover}
                </span>
              </div>
            )}
          </div>

          {/* Partial Outage Scope Matrix */}
          <div className="border border-[#D4AF37]/30 rounded-2xl bg-[#0c0c11]/90 backdrop-blur-xl p-6 shadow-[0_15px_40px_rgba(0,0,0,0.6)] space-y-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div>
                <h3 className="text-base font-serif font-bold text-transparent bg-clip-text bg-gradient-to-r from-[#FFF5D1] to-[#D4AF37] flex items-center gap-2">
                  <Layers className="w-4 h-4 text-[#D4AF37]" />
                  PSD2 Scope & Subsystem Impact Matrix
                </h3>
                <p className="text-xs font-mono text-[#9B927D] mt-0.5">
                  Granular endpoints, fault tolerances, and Modern Treasury automated relays.
                </p>
              </div>

              {/* Filters */}
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="text"
                  placeholder="Filter endpoints / scopes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-[#07070a] border border-[#D4AF37]/30 rounded-lg px-3 py-1.5 text-xs text-[#FAF5E4] placeholder-[#736B59] focus:outline-none focus:border-[#FFDF73] font-mono w-44"
                />

                <select
                  value={filterCategory}
                  onChange={(e) => setFilterCategory(e.target.value)}
                  className="bg-[#07070a] border border-[#D4AF37]/30 rounded-lg px-3 py-1.5 text-xs text-[#FAF5E4] focus:outline-none focus:border-[#FFDF73] font-mono cursor-pointer"
                >
                  <option value="ALL">ALL SCOPES</option>
                  <option value="PISP">PISP</option>
                  <option value="AISP">AISP</option>
                  <option value="CBPII">CBPII</option>
                  <option value="IDENTITY">IDENTITY</option>
                  <option value="SETTLEMENT">SETTLEMENT</option>
                </select>
              </div>
            </div>

            {/* Scope Matrix List */}
            <div className="space-y-4">
              {filteredScopes.length === 0 ? (
                <div className="text-center py-10 border border-dashed border-[#D4AF37]/20 rounded-xl text-xs font-mono text-[#8C8470]">
                  No subsystem scopes match the specified filters.
                </div>
              ) : (
                filteredScopes.map((scope) => {
                  const isTotal = scope.impactLevel === "TOTAL";
                  const isPartial = scope.impactLevel === "PARTIAL";
                  const isDegraded = scope.impactLevel === "DEGRADED";

                  return (
                    <div
                      key={scope.id}
                      className="border border-[#D4AF37]/20 rounded-xl bg-[#09090d]/80 p-4 transition-all hover:border-[#D4AF37]/50 hover:bg-[#121219]"
                    >
                      <div className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-3 border-b border-[#D4AF37]/15">
                        <div className="flex items-center gap-3">
                          <span
                            className={`text-[10px] font-mono px-2 py-0.5 rounded font-bold border ${
                              scope.category === "PISP"
                                ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                                : scope.category === "AISP"
                                ? "bg-cyan-950/80 text-cyan-300 border-cyan-500/50"
                                : "bg-purple-950/80 text-purple-300 border-purple-500/50"
                            }`}
                          >
                            {scope.category}
                          </span>
                          <span className="text-sm font-serif font-semibold text-[#FFF5D1]">
                            {scope.scopeName}
                          </span>
                        </div>

                        {/* Impact badge */}
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono px-2.5 py-0.5 rounded-full font-bold border flex items-center gap-1 ${
                              isTotal
                                ? "bg-rose-950/80 text-rose-300 border-rose-500/50"
                                : isPartial
                                ? "bg-amber-950/80 text-amber-300 border-amber-500/50"
                                : isDegraded
                                ? "bg-yellow-950/80 text-yellow-300 border-yellow-500/50"
                                : "bg-emerald-950/80 text-emerald-300 border-emerald-500/50"
                            }`}
                          >
                            <AlertTriangle className="w-3 h-3" />
                            {scope.impactLevel}
                          </span>
                          <span className="text-[11px] font-mono text-[#D4AF37]">
                            {(scope.quantumResilienceFactor * 100).toFixed(1)}% Q-Factor
                          </span>
                        </div>
                      </div>

                      {/* Endpoints */}
                      <div className="mt-3 space-y-1.5">
                        <div className="text-[10px] font-mono text-[#7D7562] uppercase">
                          Impacted PSD2 Endpoints:
                        </div>
                        <div className="flex flex-wrap gap-1.5">
                          {scope.endpointsImpacted.map((ep, i) => (
                            <span
                              key={i}
                              className="font-mono text-[10px] bg-[#050508] border border-[#D4AF37]/15 text-[#E6DCBF] px-2 py-0.5 rounded"
                            >
                              {ep}
                            </span>
                          ))}
                        </div>
                      </div>

                      {/* Modern Treasury Routing Info */}
                      <div className="mt-3 pt-2.5 border-t border-[#D4AF37]/10 flex flex-col sm:flex-row sm:items-center justify-between text-[11px] font-mono text-[#A89F91] gap-2">
                        <div>
                          <span className="text-[#D4AF37]">Failover Pipeline:</span>{" "}
                          <code className="text-[#FAF5E4]">{scope.modernTreasuryFallbackRoute}</code>
                        </div>
                        <div className="text-[10px] text-[#8C8470]">
                          Protocol: <span className="text-[#FFF2C6]">{scope.mitigationProtocol}</span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Luxury Sovereign Footer Sign-off */}
          <div className="rounded-xl border border-[#D4AF37]/20 bg-[#08080c] p-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-[#8C8470]">
            <div className="flex items-center gap-2">
              <Lock className="w-3.5 h-3.5 text-[#D4AF37]" />
              <span>Citibank Sovereign Enclave Cryptographic Signature Verified</span>
            </div>
            <div className="flex items-center gap-4 text-[10px]">
              <span className="text-[#D4AF37]">TLS 1.3 / Quantum Kyber-1024</span>
              <span>Modern Treasury API Mesh v2025.2</span>
            </div>
          </div>
        </section>

      </main>
    </div>
  );
}