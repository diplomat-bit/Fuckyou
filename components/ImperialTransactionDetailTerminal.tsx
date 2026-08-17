import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Cpu,
  Globe,
  Coins,
  Terminal,
  FileCode,
  ArrowUpRight,
  Lock,
  Activity,
  CheckCircle2,
  RefreshCw,
  Download,
  Building2,
  Sparkles,
  Layers,
  ChevronRight,
  ExternalLink,
  Zap,
  Fingerprint,
  TrendingUp,
  AlertCircle
} from 'lucide-react';

interface CorrespondentBank {
  institutionName: string;
  bicSwift: string;
  chipsUid: string;
  fedwireRouting: string;
  cityCountry: string;
  role: 'Ordering Institution' | 'Intermediary Correspondent' | 'Beneficiary Bank';
  settlementStatus: 'CLEARED' | 'SETTLED' | 'IN_TRANSIT';
}

interface FXExecutionDetails {
  baseCurrency: string;
  quoteCurrency: string;
  executedRate: number;
  marketSpotRateAtExecution: number;
  spreadBps: number;
  notionalBaseAmount: number;
  settledQuoteAmount: number;
  fixingSource: string;
  hedgeContractRef: string;
}

interface AISovereignRiskProfile {
  anomalyScore: number;
  sanctionGraphState: 'CLEARED_TIER_0' | 'FLAGGED' | 'MANUAL_REVIEW';
  regulatoryConfidence: number;
  liquidityImpactScore: 'NEGLIGIBLE' | 'MODERATE' | 'SYSTEMIC_SURGE';
  aiAgentNotes: string[];
  neuralValidationHash: string;
}

interface ImperialTransactionDetail {
  transactionReferenceId: string;
  uetUuid: string;
  modernTreasuryJournalId: string;
  citiDirectLedgerRef: string;
  settlementTimestamp: string;
  bookingDate: string;
  valueDate: string;
  amount: number;
  currency: string;
  transactionType: string;
  paymentMethod: 'CITI_GLOBAL_TRANSFER' | 'FEDWIRE_SOVEREIGN' | 'SWIFT_GPI_INSTANT' | 'CHAPS_DIRECT';
  status: 'SETTLED_IRREVOCABLE' | 'PENDING_MULTI_SIG' | 'PROCESSING_CLEARING';
  orderingParty: {
    name: string;
    accountNumberMasked: string;
    entityType: string;
    domicile: string;
    lei: string;
  };
  beneficiaryParty: {
    name: string;
    accountNumberIban: string;
    domicile: string;
    lei: string;
    jurisdictionTier: string;
  };
  routingChain: CorrespondentBank[];
  fxEngine: FXExecutionDetails;
  aiRisk: AISovereignRiskProfile;
  iso20022Payload: {
    messageType: string;
    endToEndId: string;
    instructionId: string;
    clearingChannel: string;
    purposeCode: string;
    structuredRemittanceInfo: string;
  };
}

const DEFAULT_TRANSACTION: ImperialTransactionDetail = {
  transactionReferenceId: 'CITI-SOV-2025-0894921-X',
  uetUuid: 'e8f192b0-4f91-4c5b-91c2-19e0b8e73499',
  modernTreasuryJournalId: 'mt_jrn_01HQZ9984XK94821L',
  citiDirectLedgerRef: 'CD-NYC-GOLD-9844102-VAULT',
  settlementTimestamp: '2025-03-29T14:32:08.824Z',
  bookingDate: '2025-03-29',
  valueDate: '2025-03-29',
  amount: 485000000.00,
  currency: 'USD',
  transactionType: 'Cross-Border High-Value Real-Time Gross Settlement (RTGS)',
  paymentMethod: 'SWIFT_GPI_INSTANT',
  status: 'SETTLED_IRREVOCABLE',
  orderingParty: {
    name: 'CITIBANK N.A. PRIVATE CUSTODY FOR AURELIA SOVEREIGN FUND',
    accountNumberMasked: '•••• •••• •••• 9924-USD',
    entityType: 'Sovereign Wealth Vehicle (Tier 1)',
    domicile: 'Singapore (SG)',
    lei: '5493006MHB84DD0ZWV18'
  },
  beneficiaryParty: {
    name: 'VAULT RESERVE HOLDINGS CORP / DUAL-TREASURY ALLOCATION',
    accountNumberIban: 'CH93 0000 8000 0123 4567 8901 2',
    domicile: 'Zurich, Switzerland (CH)',
    lei: '984500E2B8956A3C4491',
    jurisdictionTier: 'Swiss FINMA Sovereign Institutional'
  },
  routingChain: [
    {
      institutionName: 'CITIBANK N.A. NEW YORK (GLOBAL HQ)',
      bicSwift: 'CITIUS33XXX',
      chipsUid: 'CP-0008',
      fedwireRouting: '021000089',
      cityCountry: 'New York, USA',
      role: 'Ordering Institution',
      settlementStatus: 'CLEARED'
    },
    {
      institutionName: 'CITIBANK EUROPE PLC / CITI LONDON INTERMEDIARY',
      bicSwift: 'CITIGB2LXXX',
      chipsUid: 'CH-4910',
      fedwireRouting: 'N/A',
      cityCountry: 'London, United Kingdom',
      role: 'Intermediary Correspondent',
      settlementStatus: 'CLEARED'
    },
    {
      institutionName: 'UBS SWITZERLAND AG (PRIVATE WEALTH & CUSTODY)',
      bicSwift: 'UBSWCHZH80A',
      chipsUid: 'UB-9941',
      fedwireRouting: 'N/A',
      cityCountry: 'Zurich, Switzerland',
      role: 'Beneficiary Bank',
      settlementStatus: 'SETTLED'
    }
  ],
  fxEngine: {
    baseCurrency: 'USD',
    quoteCurrency: 'CHF',
    executedRate: 0.88421,
    marketSpotRateAtExecution: 0.88418,
    spreadBps: 0.34,
    notionalBaseAmount: 485000000.00,
    settledQuoteAmount: 428841850.00,
    fixingSource: 'Citi Velocity Spot Continuous Stream (EBS Refined)',
    hedgeContractRef: 'FXH-CITI-CHF-2025-991A'
  },
  aiRisk: {
    anomalyScore: 0.0014,
    sanctionGraphState: 'CLEARED_TIER_0',
    regulatoryConfidence: 99.98,
    liquidityImpactScore: 'NEGLIGIBLE',
    aiAgentNotes: [
      'Automated Citi Imperial Agent #948 validated dual-key multi-sig authorization.',
      'Modern Treasury Ledger ledger_entry_993 settled against Citi High-Value Settlement Rail in 142ms.',
      'SWIFT gpi Tracker UID verified: Zero hop latency penalty across 3 cross-border nodes.',
      'No OFAC / Swiss SECO / EU sanctions overlap detected across deep graph traversal (Depth: 7).'
    ],
    neuralValidationHash: '0x9fa8e71b28c03e8471e9a302bd8c8a14e9f736a5c1284a6bdf8018e47c7291a1'
  },
  iso20022Payload: {
    messageType: 'pacs.008.001.10 (Financial Institutional Customer Credit Transfer)',
    endToEndId: 'E2E-CITI-20250329-88391048-A',
    instructionId: 'INSTR-SOV-MT-9018471',
    clearingChannel: 'SWIFT_NET_HIGH_VALUE_INSTANT',
    purposeCode: 'TREA (Treasury Operation / Capital Injection)',
    structuredRemittanceInfo: 'REMITTANCE FOR SOVEREIGN INFRASTRUCTURE GOLD COLLATERAL ENHANCEMENT / TRANCHE 9'
  }
};

export const ImperialTransactionDetailTerminal: React.FC<{
  transactionRef?: string;
  onRefresh?: () => void;
}> = ({ transactionRef = 'CITI-SOV-2025-0894921-X', onRefresh }) => {
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'FX_ARBITRAGE' | 'ROUTING_CHAIN' | 'AI_SENTINEL' | 'ISO_RAW'>('OVERVIEW');
  const [data, setData] = useState<ImperialTransactionDetail>(DEFAULT_TRANSACTION);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [isCopied, setIsCopied] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState<string>(transactionRef);

  useEffect(() => {
    fetchTransactionDetails(transactionRef);
  }, [transactionRef]);

  const fetchTransactionDetails = async (refId: string) => {
    setIsLoading(true);
    // Simulate high-frequency Citi + Modern Treasury Endpoint latency
    try {
      await new Promise((resolve) => setTimeout(resolve, 450));
      setData({
        ...DEFAULT_TRANSACTION,
        transactionReferenceId: refId.toUpperCase()
      });
    } catch {
      // Fallback
    } finally {
      setIsLoading(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setIsCopied(label);
    setTimeout(() => setIsCopied(null), 2000);
  };

  const formatCurrency = (val: number, cur: string = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="w-full min-h-screen bg-[#060709] text-stone-200 font-sans p-4 sm:p-6 lg:p-8 flex flex-col items-center justify-start selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Luxury Horizon Glow */}
      <div className="fixed top-0 left-1/2 -translate-x-1/2 w-3/4 h-64 bg-gradient-to-b from-amber-600/10 via-amber-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* Main Terminal Frame */}
      <div className="w-full max-w-7xl relative z-10 border border-amber-500/20 rounded-2xl bg-gradient-to-b from-stone-950 via-[#0a0c10] to-black shadow-[0_0_80px_rgba(217,119,6,0.08)] backdrop-blur-xl overflow-hidden">
        
        {/* Imperial Header & Endpoint Telemetry Bar */}
        <div className="border-b border-amber-500/15 bg-gradient-to-r from-stone-950 via-stone-900/60 to-stone-950 px-6 py-5 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-stone-950 p-[1.5px] shadow-[0_0_25px_rgba(245,158,11,0.3)]">
                <div className="w-full h-full bg-black rounded-[10px] flex items-center justify-center">
                  <Sparkles className="w-6 h-6 text-amber-400 animate-pulse" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-black flex items-center justify-center">
                <div className="w-1.5 h-1.5 bg-white rounded-full animate-ping" />
              </div>
            </div>

            <div>
              <div className="flex items-center space-x-2">
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded">
                  Citi Imperial Velvet Tier
                </span>
                <span className="px-2 py-0.5 text-[10px] font-mono tracking-widest uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded">
                  Modern Treasury Sync: LIVE
                </span>
                <span className="text-xs text-stone-400 font-mono hidden md:inline">
                  ENDPOINT: <span className="text-stone-300">GET /&#123;transactionReferenceId&#125;/details</span>
                </span>
              </div>
              <h1 className="text-xl sm:text-2xl font-light tracking-tight text-white flex items-center gap-2 mt-1">
                <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-100">
                  Global RTGS Transaction Deep-Dive
                </span>
              </h1>
            </div>
          </div>

          {/* Quick Actions & Ref Search */}
          <div className="flex flex-wrap items-center gap-2.5">
            <div className="relative flex items-center">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Lookup Reference ID..."
                className="bg-stone-900/90 border border-amber-500/20 text-amber-200 text-xs font-mono rounded-lg pl-3 pr-8 py-2 w-56 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400/50 placeholder:text-stone-600 transition"
              />
              <button
                onClick={() => fetchTransactionDetails(searchTerm)}
                className="absolute right-2 text-stone-400 hover:text-amber-300 transition"
                title="Search Reference"
              >
                <Zap className="w-4 h-4" />
              </button>
            </div>

            <button
              onClick={() => {
                if (onRefresh) onRefresh();
                fetchTransactionDetails(searchTerm);
              }}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-3 py-2 text-xs font-medium text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLoading ? 'animate-spin' : ''}`} />
              <span className="hidden sm:inline">Refresh State</span>
            </button>

            <button
              onClick={() => copyToClipboard(JSON.stringify(data, null, 2), 'EXPORT_JSON')}
              className="flex items-center space-x-1.5 px-3.5 py-2 text-xs font-medium text-black bg-gradient-to-r from-amber-300 via-amber-400 to-amber-500 hover:from-amber-200 hover:to-amber-400 font-semibold rounded-lg shadow-[0_0_15px_rgba(245,158,11,0.25)] transition active:scale-95"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isCopied === 'EXPORT_JSON' ? 'Vault Copied!' : 'Export Dossier'}</span>
            </button>
          </div>
        </div>

        {/* Hero Value Banner */}
        <div className="p-6 lg:p-8 bg-gradient-to-r from-amber-950/20 via-stone-900/40 to-amber-950/20 border-b border-amber-500/15">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
            
            {/* Left: Notional & Status */}
            <div className="lg:col-span-7 space-y-3">
              <div className="flex items-center space-x-3">
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-300 border border-emerald-500/30">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1 text-emerald-400" />
                  {data.status}
                </span>
                <span className="text-xs font-mono text-stone-400 tracking-wider">
                  UETR: {data.uetUuid}
                </span>
              </div>

              <div className="flex items-baseline space-x-3">
                <span className="text-3xl sm:text-5xl font-extralight tracking-tight text-white">
                  {formatCurrency(data.amount, data.currency)}
                </span>
                <span className="text-lg font-mono font-medium text-amber-400">
                  {data.currency}
                </span>
              </div>

              <p className="text-xs sm:text-sm text-stone-400 max-w-2xl font-light leading-relaxed">
                {data.transactionType} executed with zero counterparty settlement risk. Backed by multi-sovereign gold reserve escrow and cleared via Modern Treasury Dual-Ledger routing.
              </p>
            </div>

            {/* Right: Key Identifiers Matrix */}
            <div className="lg:col-span-5 grid grid-cols-2 gap-3 p-4 rounded-xl bg-black/60 border border-amber-500/20 backdrop-blur-md">
              <div>
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Ledger Journal</span>
                <span className="text-xs font-mono text-amber-200/90 truncate block" title={data.modernTreasuryJournalId}>
                  {data.modernTreasuryJournalId}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Citi Direct Ref</span>
                <span className="text-xs font-mono text-amber-200/90 truncate block" title={data.citiDirectLedgerRef}>
                  {data.citiDirectLedgerRef}
                </span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Value Date</span>
                <span className="text-xs font-mono text-stone-300">{data.valueDate}</span>
              </div>
              <div>
                <span className="text-[10px] uppercase font-mono text-stone-500 block">Payment Method</span>
                <span className="text-xs font-mono text-emerald-400">{data.paymentMethod}</span>
              </div>
            </div>

          </div>
        </div>

        {/* Tabbed Navigation */}
        <div className="border-b border-amber-500/15 bg-black/40 px-6 flex space-x-1 sm:space-x-4 overflow-x-auto scrollbar-none">
          {[
            { id: 'OVERVIEW', label: 'Overview & Parties', icon: Building2 },
            { id: 'ROUTING_CHAIN', label: 'SWIFT Correspondent Route', icon: Globe },
            { id: 'FX_ARBITRAGE', label: 'FX & Rate Execution', icon: Coins },
            { id: 'AI_SENTINEL', label: 'AI Sovereign Sentinel', icon: Cpu },
            { id: 'ISO_RAW', label: 'ISO 20022 Telemetry', icon: FileCode }
          ].map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center space-x-2 py-3.5 px-3 border-b-2 text-xs sm:text-sm font-medium transition whitespace-nowrap ${
                  isActive
                    ? 'border-amber-400 text-amber-300 bg-amber-500/5'
                    : 'border-transparent text-stone-400 hover:text-stone-200 hover:border-stone-700'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-amber-400' : 'text-stone-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>

        {/* Tab Content Containers */}
        <div className="p-6 lg:p-8 bg-[#090b0e]/95 min-h-[420px]">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'OVERVIEW' && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fadeIn">
              
              {/* Ordering Party Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-stone-900/80 to-black border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-amber-500/10 flex items-center justify-center border border-amber-500/30">
                      <ArrowUpRight className="w-4 h-4 text-amber-400" />
                    </div>
                    <span className="text-xs uppercase font-mono tracking-wider text-stone-400">Ordering Debtor</span>
                  </div>
                  <span className="text-[10px] font-mono bg-stone-800 text-amber-300 px-2 py-0.5 rounded">ORIGIN</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white tracking-wide">{data.orderingParty.name}</h4>
                  <div className="text-xs font-mono text-stone-400">Account: <span className="text-stone-200">{data.orderingParty.accountNumberMasked}</span></div>
                  <div className="text-xs font-mono text-stone-400">Type: <span className="text-amber-300">{data.orderingParty.entityType}</span></div>
                  <div className="text-xs font-mono text-stone-400">Domicile: <span className="text-stone-200">{data.orderingParty.domicile}</span></div>
                  <div className="text-xs font-mono text-stone-400">LEI: <span className="text-stone-300">{data.orderingParty.lei}</span></div>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-500">Security Clearance</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">TIER-1 MULTI-SIG CONFIRMED</span>
                  </div>
                </div>
              </div>

              {/* Beneficiary Party Card */}
              <div className="p-5 rounded-xl bg-gradient-to-br from-stone-900/80 to-black border border-amber-500/20 space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-stone-800">
                  <div className="flex items-center space-x-2">
                    <div className="w-7 h-7 rounded-lg bg-emerald-500/10 flex items-center justify-center border border-emerald-500/30">
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>
                    <span className="text-xs uppercase font-mono tracking-wider text-stone-400">Beneficiary Creditor</span>
                  </div>
                  <span className="text-[10px] font-mono bg-stone-800 text-emerald-300 px-2 py-0.5 rounded">DESTINATION</span>
                </div>

                <div className="space-y-2">
                  <h4 className="text-sm font-semibold text-white tracking-wide">{data.beneficiaryParty.name}</h4>
                  <div className="text-xs font-mono text-stone-400">IBAN: <span className="text-stone-200 font-mono">{data.beneficiaryParty.accountNumberIban}</span></div>
                  <div className="text-xs font-mono text-stone-400">Jurisdiction: <span className="text-emerald-300">{data.beneficiaryParty.jurisdictionTier}</span></div>
                  <div className="text-xs font-mono text-stone-400">Domicile: <span className="text-stone-200">{data.beneficiaryParty.domicile}</span></div>
                  <div className="text-xs font-mono text-stone-400">LEI: <span className="text-stone-300">{data.beneficiaryParty.lei}</span></div>
                </div>

                <div className="pt-2">
                  <div className="w-full bg-stone-950 p-2.5 rounded-lg border border-stone-800/80 flex items-center justify-between">
                    <span className="text-[11px] font-mono text-stone-500">Dual-Vault Verification</span>
                    <span className="text-[11px] font-mono text-emerald-400 font-medium">IRREVOCABLE TITLED</span>
                  </div>
                </div>
              </div>

              {/* Execution Timeline & Modern Treasury Ledger */}
              <div className="md:col-span-2 p-5 rounded-xl bg-black border border-stone-800 space-y-4">
                <h4 className="text-xs uppercase font-mono text-amber-400 tracking-wider flex items-center gap-2">
                  <Activity className="w-4 h-4" />
                  Dual-Ledger Settlement Confirmation
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs font-mono">
                  <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                    <span className="text-stone-500 block text-[10px]">EXECUTION TIMESTAMP</span>
                    <span className="text-stone-200">{data.settlementTimestamp}</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                    <span className="text-stone-500 block text-[10px]">CLEARING TIME</span>
                    <span className="text-emerald-400 font-semibold">142 ms (Sub-Second)</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-lg border border-stone-800">
                    <span className="text-stone-500 block text-[10px]">SOVEREIGN ESCROW</span>
                    <span className="text-amber-300">CITI VAULT RESERVE NY #08</span>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: ROUTING CHAIN */}
          {activeTab === 'ROUTING_CHAIN' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">SWIFT gpi High-Value Correspondent Corridor</h3>
                  <p className="text-xs text-stone-400">Deterministic routing across verified tier-one liquidity nodes.</p>
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 border border-emerald-500/20 px-2.5 py-1 rounded">
                  Hop Count: {data.routingChain.length} Nodes
                </span>
              </div>

              <div className="relative pl-6 space-y-6 before:absolute before:left-3 before:top-3 before:bottom-3 before:w-0.5 before:bg-gradient-to-b before:from-amber-400 before:via-stone-700 before:to-emerald-500">
                {data.routingChain.map((node, idx) => (
                  <div key={idx} className="relative group">
                    {/* Node Dot */}
                    <div className={`absolute -left-6 top-4 w-6 h-6 rounded-full border-2 bg-black flex items-center justify-center transition ${
                      idx === 0 ? 'border-amber-400 text-amber-400' : idx === data.routingChain.length - 1 ? 'border-emerald-400 text-emerald-400' : 'border-stone-500 text-stone-400'
                    }`}>
                      <div className="w-2 h-2 rounded-full bg-current" />
                    </div>

                    {/* Node Box */}
                    <div className="p-4 rounded-xl bg-gradient-to-r from-stone-900 to-black border border-stone-800 group-hover:border-amber-500/40 transition">
                      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                        <div>
                          <span className="text-[10px] font-mono text-amber-400/80 uppercase tracking-widest">{node.role}</span>
                          <h4 className="text-sm font-medium text-white">{node.institutionName}</h4>
                        </div>
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono ${
                          node.settlementStatus === 'SETTLED' ? 'bg-emerald-500/10 text-emerald-300 border border-emerald-500/30' : 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                        }`}>
                          {node.settlementStatus}
                        </span>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-3 pt-3 border-t border-stone-800/80 text-xs font-mono">
                        <div>
                          <span className="text-stone-500 block text-[10px]">SWIFT BIC</span>
                          <span className="text-amber-200">{node.bicSwift}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">CHIPS UID</span>
                          <span className="text-stone-300">{node.chipsUid}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">FEDWIRE RTN</span>
                          <span className="text-stone-300">{node.fedwireRouting}</span>
                        </div>
                        <div>
                          <span className="text-stone-500 block text-[10px]">LOCATION</span>
                          <span className="text-stone-300">{node.cityCountry}</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 3: FX & ARBITRAGE */}
          {activeTab === 'FX_ARBITRAGE' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-stone-900/60 border border-amber-500/20">
                  <span className="text-[10px] font-mono uppercase text-stone-400">Base Notional</span>
                  <div className="text-2xl font-light text-white mt-1">
                    {formatCurrency(data.fxEngine.notionalBaseAmount, data.fxEngine.baseCurrency)}
                  </div>
                  <span className="text-xs font-mono text-amber-400/80">{data.fxEngine.baseCurrency} Liquidity Pool</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900/60 border border-amber-500/20">
                  <span className="text-[10px] font-mono uppercase text-stone-400">Locked Execution Rate</span>
                  <div className="text-2xl font-light text-emerald-400 mt-1">
                    {data.fxEngine.executedRate}
                  </div>
                  <span className="text-xs font-mono text-stone-400">Market Spot: {data.fxEngine.marketSpotRateAtExecution}</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-900/60 border border-amber-500/20">
                  <span className="text-[10px] font-mono uppercase text-stone-400">Settled Quote Notional</span>
                  <div className="text-2xl font-light text-amber-200 mt-1">
                    {formatCurrency(data.fxEngine.settledQuoteAmount, data.fxEngine.quoteCurrency)}
                  </div>
                  <span className="text-xs font-mono text-emerald-400">Spread: {data.fxEngine.spreadBps} bps</span>
                </div>
              </div>

              <div className="p-5 rounded-xl bg-black border border-stone-800 space-y-3">
                <h4 className="text-xs uppercase font-mono text-amber-400 tracking-wider flex items-center gap-2">
                  <TrendingUp className="w-4 h-4" />
                  Sovereign FX Matrix Details
                </h4>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs font-mono">
                  <div className="p-3 bg-stone-950 rounded-lg border border-stone-900">
                    <span className="text-stone-500 text-[10px] block">FIXING STREAM SOURCE</span>
                    <span className="text-stone-200">{data.fxEngine.fixingSource}</span>
                  </div>
                  <div className="p-3 bg-stone-950 rounded-lg border border-stone-900">
                    <span className="text-stone-500 text-[10px] block">HEDGE PROTOCOL REF</span>
                    <span className="text-amber-300">{data.fxEngine.hedgeContractRef}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: AI SENTINEL */}
          {activeTab === 'AI_SENTINEL' && (
            <div className="space-y-6 animate-fadeIn">
              <div className="p-5 rounded-xl bg-gradient-to-br from-stone-900/80 via-black to-stone-950 border border-amber-500/30">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 rounded-lg bg-amber-500/10 border border-amber-500/30 flex items-center justify-center">
                      <Cpu className="w-5 h-5 text-amber-400 animate-pulse" />
                    </div>
                    <div>
                      <h4 className="text-sm font-semibold text-white">Citi Neural Sovereign Risk Profiler</h4>
                      <p className="text-xs font-mono text-stone-400">Autonomous Model: CITI-SENTINEL-GPT-v9.4</p>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <span className="px-2.5 py-1 text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 rounded-lg">
                      Confidence: {data.aiRisk.regulatoryConfidence}%
                    </span>
                    <span className="px-2.5 py-1 text-xs font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-lg">
                      Anomaly Score: {data.aiRisk.anomalyScore}
                    </span>
                  </div>
                </div>

                <div className="mt-5 space-y-3">
                  <h5 className="text-xs font-mono text-stone-400 uppercase">Automated Telemetry Insights</h5>
                  <div className="space-y-2">
                    {data.aiRisk.aiAgentNotes.map((note, index) => (
                      <div key={index} className="flex items-start space-x-2.5 text-xs text-stone-300 font-mono bg-stone-950/80 p-2.5 rounded-lg border border-stone-800/80">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 mt-0.5 flex-shrink-0" />
                        <span>{note}</span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="mt-5 pt-4 border-t border-stone-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2 text-xs font-mono text-stone-500">
                  <div className="flex items-center space-x-1.5 truncate">
                    <Fingerprint className="w-4 h-4 text-amber-400 flex-shrink-0" />
                    <span className="truncate">Neural Hash: {data.aiRisk.neuralValidationHash}</span>
                  </div>
                  <span className="text-emerald-400 flex-shrink-0 font-medium">CRYPTOGRAPHICALLY AUDITED</span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 5: ISO 20022 RAW */}
          {activeTab === 'ISO_RAW' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-white">ISO 20022 pacs.008 Native Envelope</h3>
                  <p className="text-xs text-stone-400">Real-time structured financial messaging payload.</p>
                </div>
                <button
                  onClick={() => copyToClipboard(JSON.stringify(data.iso20022Payload, null, 2), 'ISO_PAYLOAD')}
                  className="px-3 py-1 text-xs font-mono text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded transition"
                >
                  {isCopied === 'ISO_PAYLOAD' ? 'Copied to Buffer' : 'Copy ISO Payload'}
                </button>
              </div>

              <div className="p-4 rounded-xl bg-black border border-stone-800 font-mono text-xs overflow-x-auto">
                <pre className="text-amber-200/90 leading-relaxed whitespace-pre-wrap">
                  {`<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>${data.transactionReferenceId}</MsgId>
      <CreDtTm>${data.settlementTimestamp}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Prtry>${data.iso20022Payload.clearingChannel}</Prtry>
        </ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${data.iso20022Payload.endToEndId}</EndToEndId>
        <UETR>${data.uetUuid}</UETR>
        <InstrId>${data.iso20022Payload.instructionId}</InstrId>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${data.currency}">${data.amount.toFixed(2)}</IntrBkSttlmAmt>
      <Purp>
        <Cd>${data.iso20022Payload.purposeCode}</Cd>
      </Purp>
      <RmtInf>
        <Ustrd>${data.iso20022Payload.structuredRemittanceInfo}</Ustrd>
      </RmtInf>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`}
                </pre>
              </div>
            </div>
          )}

        </div>

        {/* Imperial Vault Footer Bar */}
        <div className="px-6 py-4 bg-stone-950 border-t border-amber-500/15 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-stone-500">
          <div className="flex items-center space-x-2">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Encrypted under Citi Sovereign Hardware Security Modules (FIPS 140-3 Level 4)</span>
          </div>

          <div className="flex items-center space-x-4">
            <span className="text-stone-400">Modern Treasury Sync: <span className="text-emerald-400">100% REAL-TIME</span></span>
            <div className="h-3 w-px bg-stone-800" />
            <span className="text-amber-400 font-semibold">24K VELVET CLASS</span>
          </div>
        </div>

      </div>
    </div>
  );
};

export default ImperialTransactionDetailTerminal;