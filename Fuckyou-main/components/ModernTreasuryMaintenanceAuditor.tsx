import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Zap,
  Activity,
  Server,
  FileCheck2,
  Download,
  Terminal,
  Clock,
  Sparkles,
  Lock,
  Building2,
  Database,
  ExternalLink,
  ChevronRight,
  TrendingUp,
  AlertTriangle,
  RefreshCw,
  Search,
  KeyRound,
  FileText
} from 'lucide-react';

interface MaintenanceNotice {
  id: string;
  source: 'Citibank N.A. London' | 'Citibank Europe Plc (Dublin)' | 'CitiDirect BE Global Core';
  apiDomain: string;
  regulationClause: string;
  scheduledStart: string;
  scheduledEnd: string;
  impactLevel: 'CRITICAL_WINDOW' | 'DEGRADED_PERFORMANCE' | 'ZERO_DOWNTIME_FAILOVER';
  mitigationStrategy: string;
  status: 'PENDING' | 'EXECUTING_AUTOSWAP' | 'RESOLVED';
  mtLedgerRerouteActive: boolean;
}

interface ComplianceReceipt {
  receiptId: string;
  timestamp: string;
  framework: 'PSD2 RTS Art. 32' | 'Basel IV Liquidity' | 'ECB TARGET2-Securities' | 'DORA Digital Resilience';
  hashSignature: string;
  citiConfirmationId: string;
  modernTreasuryBatchId: string;
  status: 'VERIFIED_ON_CHAIN' | 'PENDING_REGULATOR_ACK' | 'SEALED';
  slaBreachPenaltyGuaranteed: string;
}

interface SlaMetric {
  endpoint: string;
  tier: 'Diamond Tier Sovereign' | 'Institutional Ultra';
  currentUptime: number;
  targetUptime: number;
  latencyMs: number;
  monthlyPenaltyAccruedUsd: number;
  circuitBreakerStatus: 'OPTIMAL' | 'WARMED' | 'TRIGGERED';
}

export const ModernTreasuryMaintenanceAuditor: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'maintenance' | 'receipts' | 'sla' | 'ai-audit'>('maintenance');
  const [selectedReceipt, setSelectedReceipt] = useState<ComplianceReceipt | null>(null);
  const [filterQuery, setFilterQuery] = useState('');
  const [isAuditing, setIsAuditing] = useState(false);
  const [autoMitigationEnabled, setAutoMitigationEnabled] = useState(true);
  const [currentTime, setCurrentTime] = useState<string>(new Date().toISOString());

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentTime(new Date().toISOString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const [slaMetrics] = useState<SlaMetric[]>([
    {
      endpoint: 'Citi Open Banking PSD2 XS2A v3.1.8',
      tier: 'Diamond Tier Sovereign',
      currentUptime: 99.9994,
      targetUptime: 99.9990,
      latencyMs: 14.2,
      monthlyPenaltyAccruedUsd: 0,
      circuitBreakerStatus: 'OPTIMAL'
    },
    {
      endpoint: 'Modern Treasury Ledgers Sync Gateway (CitiDirect FedNow / CHIPS)',
      tier: 'Institutional Ultra',
      currentUptime: 99.9989,
      targetUptime: 99.9990,
      latencyMs: 8.7,
      monthlyPenaltyAccruedUsd: 14250.00,
      circuitBreakerStatus: 'WARMED'
    },
    {
      endpoint: 'Citi Institutional FX Liquidity Bridge (ISO 20022 camt.053)',
      tier: 'Diamond Tier Sovereign',
      currentUptime: 100.0000,
      targetUptime: 99.9990,
      latencyMs: 11.4,
      monthlyPenaltyAccruedUsd: 0,
      circuitBreakerStatus: 'OPTIMAL'
    },
    {
      endpoint: 'Modern Treasury PSD2 RTS Fallback Multi-Rail Orchestrator',
      tier: 'Diamond Tier Sovereign',
      currentUptime: 99.9998,
      targetUptime: 99.9990,
      latencyMs: 6.1,
      monthlyPenaltyAccruedUsd: 0,
      circuitBreakerStatus: 'OPTIMAL'
    }
  ]);

  const [maintenanceNotices, setMaintenanceNotices] = useState<MaintenanceNotice[]>([
    {
      id: 'PSD2-CITI-EUR-2025-089',
      source: 'Citibank Europe Plc (Dublin)',
      apiDomain: 'https://api.citigroup.com/psd2/v3/aisp/accounts',
      regulationClause: 'PSD2 RTS Chapter 3 Art. 32(4) Mandatory Window',
      scheduledStart: '2025-03-01T01:00:00Z',
      scheduledEnd: '2025-03-01T03:30:00Z',
      impactLevel: 'CRITICAL_WINDOW',
      mitigationStrategy: 'Automated failover to Modern Treasury synthetic balance virtualizer via ISO 20022 intraday camt.052 ledger mirrors.',
      status: 'PENDING',
      mtLedgerRerouteActive: true
    },
    {
      id: 'PSD2-CITI-LON-2025-114',
      source: 'Citibank N.A. London',
      apiDomain: 'https://emea.api.citigroup.com/direct/v2/piis/confirmations',
      regulationClause: 'FCA Open Banking Standard Reg 65 Notice',
      scheduledStart: '2025-03-04T23:00:00Z',
      scheduledEnd: '2025-03-05T00:15:00Z',
      impactLevel: 'DEGRADED_PERFORMANCE',
      mitigationStrategy: 'Dynamic payment request routing to Modern Treasury SEPA Instant backup node (Frankfurt Equinix FR2).',
      status: 'EXECUTING_AUTOSWAP',
      mtLedgerRerouteActive: true
    },
    {
      id: 'CORE-CITI-NY-2025-003',
      source: 'CitiDirect BE Global Core',
      apiDomain: 'https://directbe.citigroup.com/treasury/enterprise/rtp',
      regulationClause: 'US Fedwire / PSD2 Cross-Border Settlement Reciprocity',
      scheduledStart: '2025-02-28T04:00:00Z',
      scheduledEnd: '2025-02-28T04:45:00Z',
      impactLevel: 'ZERO_DOWNTIME_FAILOVER',
      mitigationStrategy: 'Zero-downtime hot ledger replication active. AI Autonomous fail-safe armed.',
      status: 'RESOLVED',
      mtLedgerRerouteActive: false
    }
  ]);

  const [receipts] = useState<ComplianceReceipt[]>([
    {
      receiptId: 'RCPT-MT-CITI-99841-BIV',
      timestamp: '2025-02-26T18:42:19.412Z',
      framework: 'PSD2 RTS Art. 32',
      hashSignature: '0x9e8a71f0082bc319fbd81682390fcae7834bc671928374faec10398bb201f99c',
      citiConfirmationId: 'CITI-EMEA-REG-8829104-X',
      modernTreasuryBatchId: 'mt_btch_sovereign_8891049281',
      status: 'VERIFIED_ON_CHAIN',
      slaBreachPenaltyGuaranteed: '$5,000,000.00 FDIC/ECB Backed'
    },
    {
      receiptId: 'RCPT-MT-CITI-99842-DORA',
      timestamp: '2025-02-26T17:15:02.109Z',
      framework: 'DORA Digital Resilience',
      hashSignature: '0xaa138402ff918c72834b910283caee9108347102934812374bcf1038573210ab',
      citiConfirmationId: 'CITI-DORA-COMPL-7749102-Y',
      modernTreasuryBatchId: 'mt_btch_sovereign_3391082214',
      status: 'SEALED',
      slaBreachPenaltyGuaranteed: '$10,000,000.00 Lloyds Syndicated'
    },
    {
      receiptId: 'RCPT-MT-CITI-99843-T2S',
      timestamp: '2025-02-26T15:30:44.891Z',
      framework: 'ECB TARGET2-Securities',
      hashSignature: '0x3cfa9108849bca710293847291083bca9182374619028347cae910283746bb12',
      citiConfirmationId: 'CITI-TARGET2-AUDIT-339102-E',
      modernTreasuryBatchId: 'mt_btch_sovereign_1189402941',
      status: 'VERIFIED_ON_CHAIN',
      slaBreachPenaltyGuaranteed: '€7,500,000.00 Bundesbank Escrow'
    },
    {
      receiptId: 'RCPT-MT-CITI-99844-BASEL',
      timestamp: '2025-02-26T12:04:18.003Z',
      framework: 'Basel IV Liquidity',
      hashSignature: '0x882910fae83910cbca719283748201948bcfe7192837490192834caebf910384',
      citiConfirmationId: 'CITI-BIS-LCR-4491029-K',
      modernTreasuryBatchId: 'mt_btch_sovereign_9928174620',
      status: 'PENDING_REGULATOR_ACK',
      slaBreachPenaltyGuaranteed: '$15,000,000.00 Gold Sovereign Vault'
    }
  ]);

  const handleRunAiAudit = () => {
    setIsAuditing(true);
    setTimeout(() => {
      setIsAuditing(false);
    }, 2400);
  };

  const filteredNotices = useMemo(() => {
    return maintenanceNotices.filter(
      (n) =>
        n.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
        n.source.toLowerCase().includes(filterQuery.toLowerCase()) ||
        n.regulationClause.toLowerCase().includes(filterQuery.toLowerCase())
    );
  }, [maintenanceNotices, filterQuery]);

  const toggleFailover = (id: string) => {
    setMaintenanceNotices((prev) =>
      prev.map((n) =>
        n.id === id ? { ...n, mtLedgerRerouteActive: !n.mtLedgerRerouteActive } : n
      )
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#05070B] text-slate-100 font-sans p-4 sm:p-6 lg:p-10 border-t-2 border-[#D4AF37] selection:bg-[#D4AF37] selection:text-black">
      {/* Upper Titanium Crown Bar */}
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-slate-800/80 gap-4">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-[#1E2430] to-[#0A0D14] border border-[#D4AF37]/40 rounded-xl shadow-[0_0_20px_rgba(212,175,55,0.15)]">
              <Building2 className="w-6 h-6 text-[#D4AF37]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30">
                  PSD2 Sovereign Compliance Module
                </span>
                <span className="text-[10px] font-mono tracking-widest uppercase px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
                  Modern Treasury Core Live
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-slate-100 via-slate-200 to-[#D4AF37] bg-clip-text text-transparent">
                Citibank N.A. Regulatory & Maintenance Auditor
              </h1>
            </div>
          </div>
        </div>

        {/* Realtime Telemetry Pulse Badge */}
        <div className="flex items-center gap-4 bg-gradient-to-r from-[#0C1019] to-[#121826] px-4 py-2.5 rounded-xl border border-slate-800 shadow-inner">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3 w-3">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-mono font-semibold text-emerald-400 tracking-wider">
              ZERO-FAILOVER ARMED
            </span>
          </div>
          <div className="h-4 w-px bg-slate-700"></div>
          <div className="text-right font-mono">
            <div className="text-[10px] text-slate-400">REGULATORY UTC CLOCK</div>
            <div className="text-xs font-bold text-slate-200">{currentTime.slice(11, 23)}</div>
          </div>
        </div>
      </div>

      {/* Hero Financial Impact & SLA Metrics Strip */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        <div className="bg-[#0A0E17]/90 border border-slate-800 hover:border-[#D4AF37]/50 transition-all rounded-xl p-4 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/10 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Global SLA Aggregate</span>
            <Activity className="w-4 h-4 text-[#D4AF37]" />
          </div>
          <div className="text-2xl font-mono font-black text-slate-100">99.9992%</div>
          <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
            <TrendingUp className="w-3 h-3" /> +0.0002% over contractual threshold
          </div>
        </div>

        <div className="bg-[#0A0E17]/90 border border-slate-800 hover:border-cyan-500/50 transition-all rounded-xl p-4 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Breach Penalty Escrow</span>
            <ShieldCheck className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="text-2xl font-mono font-black text-cyan-300">$37,500,000</div>
          <div className="text-[11px] text-slate-400 mt-1 font-mono">
            Syndicated Tier-1 Bank Backstop
          </div>
        </div>

        <div className="bg-[#0A0E17]/90 border border-slate-800 hover:border-amber-500/50 transition-all rounded-xl p-4 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">PSD2 Maintenance Windows</span>
            <AlertTriangle className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-mono font-black text-amber-300">2 Active / 1 Resolved</div>
          <div className="text-[11px] text-amber-400/80 mt-1 font-mono">
            Auto-synthetic mirroring active
          </div>
        </div>

        <div className="bg-[#0A0E17]/90 border border-slate-800 hover:border-purple-500/50 transition-all rounded-xl p-4 relative overflow-hidden group shadow-lg">
          <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-mono uppercase tracking-wider">Auditor AI Status</span>
            <Sparkles className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-2xl font-mono font-black text-purple-300">Aethelgard AI v4.2</div>
          <div className="text-[11px] text-purple-400/80 mt-1 font-mono">
            Autonomous RTS 32.4 Safeguards ON
          </div>
        </div>
      </div>

      {/* Main Interactive Matrix */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Navigation / Control Column */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 bg-[#0B0F19] p-2 rounded-xl border border-slate-800">
            <div className="flex items-center gap-1.5 overflow-x-auto">
              <button
                onClick={() => setActiveTab('maintenance')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'maintenance'
                    ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Server className="w-3.5 h-3.5" />
                CITI PSD2 NOTICES
              </button>
              <button
                onClick={() => setActiveTab('sla')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'sla'
                    ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Zap className="w-3.5 h-3.5" />
                SLA & PENALTIES
              </button>
              <button
                onClick={() => setActiveTab('receipts')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'receipts'
                    ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <FileCheck2 className="w-3.5 h-3.5" />
                COMPLIANCE RECEIPTS
              </button>
              <button
                onClick={() => setActiveTab('ai-audit')}
                className={`px-4 py-2 rounded-lg text-xs font-mono font-bold transition-all flex items-center gap-2 ${
                  activeTab === 'ai-audit'
                    ? 'bg-[#D4AF37] text-black shadow-[0_0_15px_rgba(212,175,55,0.3)]'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
                }`}
              >
                <Cpu className="w-3.5 h-3.5" />
                AETHELGARD SYNTHESIS
              </button>
            </div>

            <div className="relative w-full sm:w-auto">
              <Search className="w-3.5 h-3.5 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search regulatory logs..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full sm:w-48 pl-8 pr-3 py-1.5 text-xs font-mono bg-black/50 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-600 focus:outline-none focus:border-[#D4AF37]"
              />
            </div>
          </div>

          {/* TAB 1: MAINTENANCE NOTICES */}
          {activeTab === 'maintenance' && (
            <div className="space-y-4">
              {filteredNotices.map((notice) => (
                <div
                  key={notice.id}
                  className="p-5 rounded-2xl bg-gradient-to-br from-[#0B0F1A] via-[#0E1322] to-[#0A0D15] border border-slate-800/90 hover:border-slate-700 transition-all shadow-xl"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-3 border-b border-slate-800">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-mono font-bold rounded bg-amber-500/10 text-amber-300 border border-amber-500/30">
                        {notice.id}
                      </span>
                      <span className="text-xs font-bold text-slate-200">{notice.source}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span
                        className={`text-[10px] font-mono font-bold px-2.5 py-0.5 rounded-full border ${
                          notice.impactLevel === 'CRITICAL_WINDOW'
                            ? 'bg-rose-500/10 text-rose-400 border-rose-500/30'
                            : notice.impactLevel === 'DEGRADED_PERFORMANCE'
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                            : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                        }`}
                      >
                        {notice.impactLevel}
                      </span>
                      <span className="text-xs font-mono text-slate-500">
                        {notice.status}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-3 text-xs">
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Target Endpoint</div>
                      <div className="font-mono text-slate-300 truncate mt-0.5">{notice.apiDomain}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Regulatory Mandate</div>
                      <div className="font-mono text-[#D4AF37] mt-0.5">{notice.regulationClause}</div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Planned Window (UTC)</div>
                      <div className="font-mono text-slate-300 mt-0.5">
                        {new Date(notice.scheduledStart).toUTCString().slice(0, 22)} →{' '}
                        {new Date(notice.scheduledEnd).toUTCString().slice(17, 22)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Modern Treasury Reroute</div>
                      <div className="flex items-center gap-2 mt-0.5 font-mono">
                        <span
                          className={`inline-block w-2 h-2 rounded-full ${
                            notice.mtLedgerRerouteActive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-600'
                          }`}
                        ></span>
                        <span className={notice.mtLedgerRerouteActive ? 'text-emerald-300 font-semibold' : 'text-slate-500'}>
                          {notice.mtLedgerRerouteActive ? 'Automated Fallback Active' : 'Standby / Manual'}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 mb-4 text-xs font-mono text-slate-400">
                    <span className="text-[#D4AF37] font-semibold">Failover Protocol: </span>
                    {notice.mitigationStrategy}
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <button
                      onClick={() => toggleFailover(notice.id)}
                      className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-2 border ${
                        notice.mtLedgerRerouteActive
                          ? 'bg-rose-950/40 border-rose-700/50 text-rose-300 hover:bg-rose-900/60'
                          : 'bg-emerald-950/40 border-emerald-700/50 text-emerald-300 hover:bg-emerald-900/60'
                      }`}
                    >
                      <RefreshCw className="w-3 h-3" />
                      {notice.mtLedgerRerouteActive ? 'Deactivate Route Failover' : 'Force Arm Failover'}
                    </button>
                    <span className="text-[10px] font-mono text-slate-500">
                      Audit Hash: SHA256({notice.id.slice(0, 8)})
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 2: SLA UPTIMES & PENALTIES */}
          {activeTab === 'sla' && (
            <div className="space-y-4">
              <div className="p-4 rounded-xl bg-gradient-to-r from-[#141C2C] to-[#0A0D15] border border-[#D4AF37]/30 flex items-center justify-between">
                <div>
                  <div className="text-xs font-mono uppercase text-[#D4AF37]">
                    Citi-Modern Treasury Sovereign SLA Agreement
                  </div>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5">
                    Tier-1 Institutional Contract Guarantee: $250,000 penalty per 0.001% breach below 99.999%
                  </div>
                </div>
                <Lock className="w-5 h-5 text-[#D4AF37]" />
              </div>

              {slaMetrics.map((sla, idx) => (
                <div
                  key={idx}
                  className="p-5 rounded-2xl bg-[#090D17] border border-slate-800 hover:border-slate-700 transition-all"
                >
                  <div className="flex items-center justify-between mb-3">
                    <div>
                      <span className="text-xs font-mono font-bold text-cyan-400 mr-2">{sla.tier}</span>
                      <span className="text-sm font-bold text-slate-100">{sla.endpoint}</span>
                    </div>
                    <span className="text-xs font-mono font-black px-2.5 py-1 rounded bg-slate-900 border border-slate-700 text-slate-200">
                      {sla.latencyMs} ms
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-3">
                    <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Live Uptime</div>
                      <div className="text-lg font-mono font-bold text-emerald-400">
                        {sla.currentUptime.toFixed(4)}%
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Target: {sla.targetUptime.toFixed(4)}%</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Accrued Citi Penalty</div>
                      <div className="text-lg font-mono font-bold text-[#D4AF37]">
                        ${sla.monthlyPenaltyAccruedUsd.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Auto-escrow deductions</div>
                    </div>
                    <div className="p-3 bg-black/40 rounded-xl border border-slate-800">
                      <div className="text-[10px] font-mono text-slate-500 uppercase">Circuit Breaker</div>
                      <div className="text-lg font-mono font-bold text-slate-200">
                        {sla.circuitBreakerStatus}
                      </div>
                      <div className="text-[10px] text-slate-500 font-mono">Hardware HSM Level 4</div>
                    </div>
                  </div>

                  {/* Visual Progress Bar */}
                  <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                    <div
                      className="bg-gradient-to-r from-emerald-500 via-cyan-400 to-[#D4AF37] h-1.5 rounded-full"
                      style={{ width: `${(sla.currentUptime / 100) * 100}%` }}
                    ></div>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 3: COMPLIANCE RECEIPTS */}
          {activeTab === 'receipts' && (
            <div className="space-y-4">
              <div className="flex items-center justify-between text-xs font-mono text-slate-400 px-1">
                <span>Cryptographically Sealed Regulatory Receipts</span>
                <span>4 Receipts Verified</span>
              </div>
              {receipts.map((rcpt) => (
                <div
                  key={rcpt.receiptId}
                  onClick={() => setSelectedReceipt(rcpt)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedReceipt?.receiptId === rcpt.receiptId
                      ? 'bg-[#101726] border-[#D4AF37]'
                      : 'bg-[#090D17] border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 rounded-lg bg-black/60 border border-slate-800 text-[#D4AF37]">
                        <KeyRound className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-mono font-bold text-slate-200">{rcpt.receiptId}</div>
                        <div className="text-[11px] font-mono text-[#D4AF37]">{rcpt.framework}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                        {rcpt.status}
                      </span>
                      <div className="text-[10px] font-mono text-slate-500 mt-1">
                        {new Date(rcpt.timestamp).toLocaleTimeString()} UTC
                      </div>
                    </div>
                  </div>
                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <span className="truncate max-w-[280px]">Hash: {rcpt.hashSignature}</span>
                    <span className="text-slate-300 font-semibold">{rcpt.slaBreachPenaltyGuaranteed}</span>
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* TAB 4: AETHELGARD AI AUDIT */}
          {activeTab === 'ai-audit' && (
            <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0C111D] to-[#080B12] border border-slate-800 space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-purple-950/40 border border-purple-500/40 rounded-xl text-purple-300">
                    <Cpu className="w-6 h-6 animate-pulse" />
                  </div>
                  <div>
                    <h3 className="text-base font-bold text-slate-100">Aethelgard AI Autonomous Officer</h3>
                    <p className="text-xs text-slate-400 font-mono">
                      Continuous PSD2 RTS Art. 32 Compliance Synthesis & CitiDirect Interop
                    </p>
                  </div>
                </div>
                <button
                  onClick={handleRunAiAudit}
                  disabled={isAuditing}
                  className="px-4 py-2 bg-gradient-to-r from-[#D4AF37] to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-mono font-bold text-xs rounded-xl shadow-lg transition-all flex items-center gap-2 disabled:opacity-50"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isAuditing ? 'animate-spin' : ''}`} />
                  {isAuditing ? 'Synthesizing...' : 'Trigger Full Audit'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black/60 border border-slate-800 font-mono text-xs space-y-2 text-slate-300">
                <div className="text-purple-400 font-bold flex items-center gap-2">
                  <Terminal className="w-4 h-4" /> AI EXECUTIVE SUMMARY & DIRECTIVE
                </div>
                <p className="leading-relaxed text-slate-300">
                  Notice <span className="text-[#D4AF37]">PSD2-CITI-EUR-2025-089</span> presents zero systemic liquidity risk. 
                  Modern Treasury intraday ledger cache has provisioned <span className="text-cyan-400">€140,000,000.00</span> in synthetic mirrors.
                  No RTS 32 breach penalties are anticipated. Continuous failover health is optimal.
                </p>
                <div className="pt-2 flex flex-wrap gap-2 text-[10px]">
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400">
                    ECB RTS Status: PASS
                  </span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400">
                    Citi Dublin Direct Failover: VERIFIED
                  </span>
                  <span className="px-2 py-1 bg-slate-900 border border-slate-800 rounded text-slate-400">
                    Latency Delta: +0.4ms
                  </span>
                </div>
              </div>

              {/* Toggle switch for auto-mitigation */}
              <div className="flex items-center justify-between p-4 bg-[#090D17] border border-slate-800 rounded-xl">
                <div>
                  <div className="text-xs font-bold text-slate-200">Autonomous Regulatory Rerouting</div>
                  <div className="text-[11px] text-slate-500">
                    Allow AI to execute sub-millisecond API rail failover during unannounced Citibank downtime.
                  </div>
                </div>
                <button
                  onClick={() => setAutoMitigationEnabled(!autoMitigationEnabled)}
                  className={`w-12 h-6 flex items-center rounded-full p-1 transition-all ${
                    autoMitigationEnabled ? 'bg-[#D4AF37] justify-end' : 'bg-slate-800 justify-start'
                  }`}
                >
                  <div className="w-4 h-4 rounded-full bg-black shadow-md"></div>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Right Sidebar: Verifiable Receipt Inspector & Audit Certificate */}
        <div className="lg:col-span-4 space-y-6">
          <div className="p-6 rounded-2xl bg-gradient-to-b from-[#0E1424] via-[#090D17] to-[#05070B] border border-[#D4AF37]/30 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10">
              <ShieldAlert className="w-32 h-32 text-[#D4AF37]" />
            </div>

            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-sm font-mono font-bold tracking-wider text-slate-200 uppercase">
                Regulatory Ledger Inspector
              </h2>
            </div>

            {selectedReceipt ? (
              <div className="space-y-4">
                <div className="p-3 bg-black/60 rounded-xl border border-slate-800 font-mono">
                  <div className="text-[10px] text-slate-500">RECEIPT TOKEN</div>
                  <div className="text-xs font-bold text-[#D4AF37] break-all">{selectedReceipt.receiptId}</div>
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-500">Framework:</span>
                    <span className="text-slate-200 font-semibold">{selectedReceipt.framework}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-500">Citi Ref ID:</span>
                    <span className="text-slate-200 font-semibold">{selectedReceipt.citiConfirmationId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-500">MT Batch ID:</span>
                    <span className="text-slate-200 font-semibold">{selectedReceipt.modernTreasuryBatchId}</span>
                  </div>
                  <div className="flex justify-between py-1.5 border-b border-slate-800/80">
                    <span className="text-slate-500">Penalty Escrow:</span>
                    <span className="text-emerald-400 font-semibold">{selectedReceipt.slaBreachPenaltyGuaranteed}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Cryptographic Proof:</span>
                    <div className="p-2 bg-black/80 rounded border border-slate-800 text-[10px] text-slate-400 break-all leading-tight">
                      {selectedReceipt.hashSignature}
                    </div>
                  </div>
                </div>

                <div className="pt-2 flex gap-2">
                  <button
                    onClick={() => alert(`Exporting cryptographically sealed ISO 20022 audit receipt for ${selectedReceipt.receiptId}`)}
                    className="flex-1 py-2 bg-slate-800 hover:bg-slate-700 text-slate-100 font-mono text-xs font-bold rounded-xl transition-all flex items-center justify-center gap-2 border border-slate-700"
                  >
                    <Download className="w-3.5 h-3.5" />
                    Export Camt.053
                  </button>
                  <button
                    onClick={() => alert(`Validating zk-proof signature on ECB/Fedwire bridge... Verified!`)}
                    className="p-2 bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#D4AF37] border border-[#D4AF37]/40 rounded-xl transition-all"
                  >
                    <ExternalLink className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <div className="text-center py-12 px-4">
                <FileCheck2 className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                <p className="text-xs font-mono text-slate-400">
                  Select any compliance receipt from the list to inspect cryptographic guarantees and Citi PSD2 SLA seals.
                </p>
              </div>
            )}
          </div>

          {/* Quick ISO 20022 Audit Terminal */}
          <div className="p-5 rounded-2xl bg-black/80 border border-slate-800 font-mono text-xs">
            <div className="flex items-center justify-between mb-3 text-slate-400">
              <span className="flex items-center gap-2 text-[10px] text-[#D4AF37] uppercase">
                <Database className="w-3.5 h-3.5" /> Realtime Audit Dispatcher
              </span>
              <span className="text-[9px] text-emerald-400">LIVE SYNC</span>
            </div>
            <div className="space-y-1.5 text-[11px] text-slate-400">
              <p className="text-slate-500">&gt; Modern Treasury Node #881 ... OK</p>
              <p className="text-slate-500">&gt; CitiDirect PSD2 Handshake ... 200 OK</p>
              <p className="text-emerald-400">&gt; ISO 20022 head.001.001.01 Verified</p>
              <p className="text-slate-500">&gt; 0 SLA breaches reported in 24h</p>
            </div>
            <div className="mt-4 pt-3 border-t border-slate-900 flex justify-between items-center text-[10px] text-slate-500">
              <span>Citibank N.A. Institutional</span>
              <ChevronRight className="w-3 h-3 text-[#D4AF37]" />
            </div>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ModernTreasuryMaintenanceAuditor;