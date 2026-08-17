import React, { useState, useMemo, useEffect } from 'react';
import {
  ShieldAlert,
  Terminal,
  Lock,
  Key,
  RefreshCw,
  Layers,
  ArrowUpRight,
  ArrowDownLeft,
  CheckCircle2,
  AlertTriangle,
  FileText,
  Database,
  Radio,
  DollarSign,
  Activity,
  ChevronRight,
  Download,
  Search,
  Filter,
  ShieldCheck,
  Sparkles,
  Cpu,
  Building2,
  UserX,
  Send,
  Zap,
  Clock,
  Fingerprint,
  ExternalLink,
  Sliders,
  Scale,
  Copy,
  Check
} from 'lucide-react';

interface RevokedAgreement {
  id: string;
  ledgerId: string;
  counterpartyName: string;
  counterpartyId: string;
  citiAccountMask: string;
  routingProtocol: 'SWIFT_GPI' | 'FEDNOW_INSTANT' | 'CHIPS_HIGH_VALUE' | 'ACH_CORPORATE';
  ptpContractReference: string;
  revocationReason: 'SANCTIONS_COMPLIANCE_HIT' | 'MUTUAL_DISSOLUTION' | 'INSOLVENCY_TRIGGER' | 'MATERIAL_BREACH' | 'AI_FRAUD_PREEMPTION';
  revocationTimestamp: string;
  initialAllocationUSD: number;
  spentAmountUSD: number;
  unspentReserveUSD: number;
  status: 'PENDING_RELEASE' | 'RELEASE_EXECUTED' | 'DISPUTED_ESCROW' | 'ARBITRATION_HOLD';
  isoReturnCode: string;
  auditHash: string;
  sentinelAiConfidence: number;
}

interface CounterpartyNotification {
  id: string;
  agreementId: string;
  recipientEntity: string;
  channel: 'SWIFT_CAMT_056' | 'FEDNOW_DISPATCH' | 'CITI_SECURE_CONNECT_EDI' | 'API_WEBHOOK_MT';
  dispatchStatus: 'DELIVERED_CONFIRMED' | 'IN_TRANSIT' | 'ACKNOWLEDGED_BY_FED' | 'SIGNATURE_VERIFIED';
  isoMessageType: string;
  sentAt: string;
  latencyMs: number;
}

interface AuditLogEntry {
  nodeId: string;
  blockHeight: number;
  timestamp: string;
  action: string;
  initiator: string;
  digest: string;
  citiLedgerState: 'SYNCHRONIZED' | 'MERKLE_VALIDATED';
  riskScore: number;
}

const MOCK_REVOKED_AGREEMENTS: RevokedAgreement[] = [
  {
    id: 'PTP-REV-980421-CX',
    ledgerId: 'mt_ledg_99a8f230_citi_pb_01',
    counterpartyName: 'Aethelgard Sovereign Capital Ltd (Geneva)',
    counterpartyId: 'CP-SWISS-9942-AETH',
    citiAccountMask: 'CITI-PB-8891-USD-SWX',
    routingProtocol: 'SWIFT_GPI',
    ptpContractReference: 'PTP-INSTITUTIONAL-CREDIT-FACILITY-2025-Q1',
    revocationReason: 'AI_FRAUD_PREEMPTION',
    revocationTimestamp: '2025-03-29T14:22:18.490Z',
    initialAllocationUSD: 1250000000.0,
    spentAmountUSD: 412500000.0,
    unspentReserveUSD: 837500000.0,
    status: 'PENDING_RELEASE',
    isoReturnCode: 'camt.056.001.08 / CUST_MODN_TREASURY_AUTO_KILL',
    auditHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    sentinelAiConfidence: 99.98
  },
  {
    id: 'PTP-REV-774102-HK',
    ledgerId: 'mt_ledg_12c77f01_citi_sg_09',
    counterpartyName: 'Apex Quantum Asset Holdings (Singapore Pte)',
    counterpartyId: 'CP-SG-8841-APEX',
    citiAccountMask: 'CITI-INST-4432-SGD-HKG',
    routingProtocol: 'CHIPS_HIGH_VALUE',
    ptpContractReference: 'PTP-OVERNIGHT-ESCROW-CLEARING-SYN-04',
    revocationReason: 'SANCTIONS_COMPLIANCE_HIT',
    revocationTimestamp: '2025-03-29T13:45:02.102Z',
    initialAllocationUSD: 650000000.0,
    spentAmountUSD: 180000000.0,
    unspentReserveUSD: 470000000.0,
    status: 'RELEASE_EXECUTED',
    isoReturnCode: 'pacs.008.001.10 / OFAC_CITI_SENTINEL_STOP',
    auditHash: '7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
    sentinelAiConfidence: 100.0
  },
  {
    id: 'PTP-REV-410985-US',
    ledgerId: 'mt_ledg_77b33d45_citi_ny_90',
    counterpartyName: 'Manhattan Meridian Interbank Liquidity LLC',
    counterpartyId: 'CP-US-7712-MMIL',
    citiAccountMask: 'CITI-TREAS-0019-USD-NYC',
    routingProtocol: 'FEDNOW_INSTANT',
    ptpContractReference: 'PTP-FEDNOW-REALTIME-ESCROW-TRI-PARTY',
    revocationReason: 'MATERIAL_BREACH',
    revocationTimestamp: '2025-03-29T11:10:44.821Z',
    initialAllocationUSD: 340000000.0,
    spentAmountUSD: 340000000.0,
    unspentReserveUSD: 0.0,
    status: 'RELEASE_EXECUTED',
    isoReturnCode: 'camt.029.001.09 / RESOLVED_NO_RESERVE_REMAINING',
    auditHash: 'cb8379ac2098aa165029e3938a51da0bcecfc008b679d44040dc9b9d12cacb9d',
    sentinelAiConfidence: 98.64
  },
  {
    id: 'PTP-REV-339108-LDN',
    ledgerId: 'mt_ledg_55a10982_citi_ldn_77',
    counterpartyName: 'Rothschild-Vanderbilt Strategic Energy Consortium',
    counterpartyId: 'CP-UK-4411-RVSC',
    citiAccountMask: 'CITI-PB-3329-GBP-LDN',
    routingProtocol: 'SWIFT_GPI',
    ptpContractReference: 'PTP-COMMODITIES-CROSS-CURRENCY-RESERVE-2025',
    revocationReason: 'MUTUAL_DISSOLUTION',
    revocationTimestamp: '2025-03-29T09:15:33.200Z',
    initialAllocationUSD: 2400000000.0,
    spentAmountUSD: 600000000.0,
    unspentReserveUSD: 1800000000.0,
    status: 'PENDING_RELEASE',
    isoReturnCode: 'camt.056.001.08 / CONSENSUAL_SETTLEMENT_SWIFT_GPI',
    auditHash: '9f86d081884c7d659a2feaa0c55ad015a3bf4f1b2b0b822cd15d6c15b0f00a08',
    sentinelAiConfidence: 99.99
  }
];

const MOCK_NOTIFICATIONS: CounterpartyNotification[] = [
  {
    id: 'NOTIF-DISPATCH-991',
    agreementId: 'PTP-REV-980421-CX',
    recipientEntity: 'Aethelgard Sovereign Capital Ltd / Swiss Central Clearing',
    channel: 'SWIFT_CAMT_056',
    dispatchStatus: 'DELIVERED_CONFIRMED',
    isoMessageType: 'camt.056.001.08 (Revocation Demand)',
    sentAt: '2025-03-29T14:22:20.120Z',
    latencyMs: 14.2
  },
  {
    id: 'NOTIF-DISPATCH-992',
    agreementId: 'PTP-REV-774102-HK',
    recipientEntity: 'Monetary Authority of Singapore (MAS) Gateway / Apex',
    channel: 'CITI_SECURE_CONNECT_EDI',
    dispatchStatus: 'SIGNATURE_VERIFIED',
    isoMessageType: 'pacs.008.001.10 (Direct Debit Recall Stop)',
    sentAt: '2025-03-29T13:45:03.411Z',
    latencyMs: 9.8
  },
  {
    id: 'NOTIF-DISPATCH-993',
    agreementId: 'PTP-REV-410985-US',
    recipientEntity: 'Federal Reserve Bank of New York (FedLine)',
    channel: 'FEDNOW_DISPATCH',
    dispatchStatus: 'ACKNOWLEDGED_BY_FED',
    isoMessageType: 'admi.007.001.01 (FedNow Receipt ACK)',
    sentAt: '2025-03-29T11:10:45.002Z',
    latencyMs: 3.1
  },
  {
    id: 'NOTIF-DISPATCH-994',
    agreementId: 'PTP-REV-339108-LDN',
    recipientEntity: 'Bank of England RTGS / Modern Treasury Ledger Core',
    channel: 'API_WEBHOOK_MT',
    dispatchStatus: 'DELIVERED_CONFIRMED',
    isoMessageType: 'modern_treasury.ledger_entry.void_payload.v3',
    sentAt: '2025-03-29T09:15:35.099Z',
    latencyMs: 18.4
  }
];

const MOCK_AUDIT_LOGS: AuditLogEntry[] = [
  {
    nodeId: 'CITI-ZURICH-HSM-ALPHA-09',
    blockHeight: 8942104,
    timestamp: '2025-03-29T14:22:21.000Z',
    action: 'VOID_LEDGER_ALLOCATION_AND_TRIGGER_VAULT_SWEEP',
    initiator: 'CITI_SENTINEL_AI_SUPERVISOR_9',
    digest: '0x9482fba91c01e99a8e341bfad00192e48271a0942d991b10',
    citiLedgerState: 'MERKLE_VALIDATED',
    riskScore: 0.001
  },
  {
    nodeId: 'MODERN-TREASURY-HYPERLEDGER-GATEWAY-US-EAST',
    blockHeight: 8942103,
    timestamp: '2025-03-29T13:45:04.120Z',
    action: 'ESCROW_RESERVE_LOCK_DISPATCH_CAMT_056',
    initiator: 'TREASURY_AUTOMATION_KERNEL',
    digest: '0x33b1e847cd9810a9f00198cbf128a8d0187465aa9012cd71',
    citiLedgerState: 'SYNCHRONIZED',
    riskScore: 0.004
  },
  {
    nodeId: 'CITI-LONDON-QUANTUM-LEDGER-01',
    blockHeight: 8942099,
    timestamp: '2025-03-29T09:15:36.442Z',
    action: 'PTP_CONTRACT_TERMINATION_MUTUAL_CONSENT',
    initiator: 'OFFSHORE_LIQUIDITY_DESK_LONDON',
    digest: '0x00f128ab99812ccca901842019ddfae908127394bb012894',
    citiLedgerState: 'MERKLE_VALIDATED',
    riskScore: 0.000
  }
];

export const ModernTreasuryPayeeRevocationLedger: React.FC = () => {
  const [agreements, setAgreements] = useState<RevokedAgreement[]>(MOCK_REVOKED_AGREEMENTS);
  const [notifications] = useState<CounterpartyNotification[]>(MOCK_NOTIFICATIONS);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>(MOCK_AUDIT_LOGS);
  const [selectedAgreementId, setSelectedAgreementId] = useState<string>(MOCK_REVOKED_AGREEMENTS[0].id);
  const [filterReason, setFilterReason] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'LEDGER' | 'RESERVE_RELEASE' | 'NOTIFICATIONS' | 'AUDIT_PROOF'>('LEDGER');
  const [isExecutingRelease, setIsExecutingRelease] = useState<boolean>(false);
  const [copiedHash, setCopiedHash] = useState<string | null>(null);
  const [reallocationVault, setReallocationVault] = useState<string>('CITI_PRIVATE_BANK_SOVEREIGN_RESERVE_01');
  const [releaseSuccessBanner, setReleaseSuccessBanner] = useState<string | null>(null);

  // Selected Agreement Object
  const selectedAgreement = useMemo(() => {
    return agreements.find((a) => a.id === selectedAgreementId) || agreements[0];
  }, [agreements, selectedAgreementId]);

  // Aggregate Metrics
  const totalRevokedCapital = useMemo(() => {
    return agreements.reduce((acc, curr) => acc + curr.initialAllocationUSD, 0);
  }, [agreements]);

  const totalUnspentReserves = useMemo(() => {
    return agreements.reduce((acc, curr) => acc + curr.unspentReserveUSD, 0);
  }, [agreements]);

  const totalPendingReleaseReserves = useMemo(() => {
    return agreements
      .filter((a) => a.status === 'PENDING_RELEASE')
      .reduce((acc, curr) => acc + curr.unspentReserveUSD, 0);
  }, [agreements]);

  // Filtered Agreements
  const filteredAgreements = useMemo(() => {
    return agreements.filter((item) => {
      const matchSearch =
        item.counterpartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.ledgerId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.citiAccountMask.toLowerCase().includes(searchQuery.toLowerCase());
      const matchFilter = filterReason === 'ALL' || item.revocationReason === filterReason;
      return matchSearch && matchFilter;
    });
  }, [agreements, searchQuery, filterReason]);

  // Copy helper
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedHash(text);
    setTimeout(() => setCopiedHash(null), 2500);
  };

  // Execute unspent reserve release
  const handleExecuteRelease = () => {
    if (!selectedAgreement || selectedAgreement.status !== 'PENDING_RELEASE' || selectedAgreement.unspentReserveUSD <= 0) return;

    setIsExecutingRelease(true);

    setTimeout(() => {
      const updatedAmount = selectedAgreement.unspentReserveUSD;
      setAgreements((prev) =>
        prev.map((agr) => {
          if (agr.id === selectedAgreement.id) {
            return {
              ...agr,
              status: 'RELEASE_EXECUTED',
              unspentReserveUSD: 0
            };
          }
          return agr;
        })
      );

      const newAudit: AuditLogEntry = {
        nodeId: 'CITI-NYC-RESERVE-SWEEP-KERNEL-01',
        blockHeight: auditLogs[0].blockHeight + 1,
        timestamp: new Date().toISOString(),
        action: `UNSPENT_RESERVE_RELEASE_TO_${reallocationVault}`,
        initiator: 'CITI_DIRECT_TREASURY_OFFICER_AUTH_L3',
        digest: '0x' + Array.from({ length: 48 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        citiLedgerState: 'MERKLE_VALIDATED',
        riskScore: 0.0001
      };

      setAuditLogs((prev) => [newAudit, ...prev]);
      setIsExecutingRelease(false);
      setReleaseSuccessBanner(`Successfully reclaimed $${(updatedAmount / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 2 })}M USD into ${reallocationVault}. Merkle proof committed.`);

      setTimeout(() => {
        setReleaseSuccessBanner(null);
      }, 6000);
    }, 1400);
  };

  return (
    <div className="w-full min-h-screen bg-[#07090E] text-slate-100 font-sans antialiased selection:bg-[#D4AF37] selection:text-black pb-16">
      {/* Top Citi & Modern Treasury Header Bar */}
      <header className="sticky top-0 z-40 border-b border-[#D4AF37]/20 bg-[#0A0D14]/90 backdrop-blur-xl px-6 py-3.5 flex flex-wrap items-center justify-between gap-4 shadow-2xl">
        <div className="flex items-center gap-3">
          <div className="relative flex items-center justify-center w-10 h-10 rounded-lg bg-gradient-to-br from-[#D4AF37] via-[#997A15] to-[#0A0D14] p-0.5 shadow-lg shadow-[#D4AF37]/20">
            <div className="w-full h-full bg-[#07090E] rounded-md flex items-center justify-center">
              <Building2 className="w-5 h-5 text-[#F3E5AB]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.25em] font-mono uppercase text-[#D4AF37] font-semibold">
                CITI PRIVATE BANK × MODERN TREASURY
              </span>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-mono font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                <Radio className="w-2.5 h-2.5 mr-1 animate-pulse" />
                SOVEREIGN LEDGER ACTIVE
              </span>
            </div>
            <h1 className="text-lg font-bold text-white tracking-tight flex items-center gap-2">
              Payee Revocation Ledger & Reserve Reconciliation Console
            </h1>
          </div>
        </div>

        {/* Global Action & Status Badges */}
        <div className="flex items-center gap-3">
          <div className="hidden lg:flex items-center gap-2 px-3 py-1.5 rounded-lg bg-zinc-900/80 border border-zinc-800 text-xs font-mono text-slate-300">
            <Cpu className="w-3.5 h-3.5 text-[#D4AF37]" />
            <span>AI Sentinel Engine:</span>
            <span className="text-emerald-400 font-semibold">V4.9 Quantum Guard (0.00ms)</span>
          </div>

          <button
            onClick={() => {
              const csvData = agreements.map((a) => `${a.id},${a.counterpartyName},${a.unspentReserveUSD},${a.status}`).join('\n');
              const blob = new Blob([csvData], { type: 'text/csv' });
              const url = URL.createObjectURL(blob);
              const link = document.createElement('a');
              link.href = url;
              link.download = `CITI_MT_REVOCATION_LEDGER_${Date.now()}.csv`;
              link.click();
            }}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#D4AF37]/10 hover:bg-[#D4AF37]/20 text-[#F3E5AB] border border-[#D4AF37]/30 text-xs font-medium transition-all shadow-sm"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export ISO CAMT.053</span>
          </button>
        </div>
      </header>

      {/* Success Notification Banner */}
      {releaseSuccessBanner && (
        <div className="mx-6 mt-4 p-3.5 bg-emerald-950/80 border border-emerald-500/40 rounded-xl flex items-center justify-between text-emerald-200 text-sm shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-2 duration-300">
          <div className="flex items-center gap-3">
            <CheckCircle2 className="w-5 h-5 text-emerald-400 shrink-0" />
            <span className="font-mono text-xs md:text-sm font-medium">{releaseSuccessBanner}</span>
          </div>
          <button onClick={() => setReleaseSuccessBanner(null)} className="text-xs text-emerald-400 underline hover:text-emerald-200">
            Dismiss
          </button>
        </div>
      )}

      {/* Main Container */}
      <main className="max-w-[1720px] mx-auto px-4 sm:px-6 mt-6 space-y-6">
        {/* Tier-1 Executive Treasury Stats Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-[#0E121B] border border-[#D4AF37]/20 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37]/5 rounded-full blur-2xl group-hover:bg-[#D4AF37]/10 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Total Revoked Agreements Volume</span>
              <DollarSign className="w-4 h-4 text-[#D4AF37]" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight font-mono">
              ${(totalRevokedCapital / 1_000_000_000).toFixed(2)}B <span className="text-xs text-[#D4AF37] font-normal">USD</span>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-slate-400 font-mono gap-1">
              <span className="text-rose-400 font-medium">4 Contracts Terminated</span>
              <span>• 100% Citi Custody</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0E121B] border border-emerald-500/20 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">Locked Unspent Reserves</span>
              <Lock className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-emerald-400 tracking-tight font-mono">
              ${(totalUnspentReserves / 1_000_000_000).toFixed(3)}B <span className="text-xs text-emerald-500 font-normal">USD</span>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-slate-400 font-mono gap-1">
              <span className="text-[#D4AF37] font-medium">${(totalPendingReleaseReserves / 1_000_000).toFixed(1)}M Pending Reclaim</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0E121B] border border-amber-500/20 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">FedNow / SWIFT ISO CAMT.056 Dispatch</span>
              <Radio className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-amber-300 tracking-tight font-mono">
              4 / 4 <span className="text-xs text-slate-400 font-normal">SYNCHRONIZED</span>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-slate-400 font-mono gap-1">
              <Zap className="w-3 h-3 text-amber-400" />
              <span>Avg Latency: <strong className="text-white">11.3ms</strong></span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-[#0E121B] border border-[#D4AF37]/20 shadow-xl relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all" />
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-mono uppercase tracking-wider text-slate-400">AI Sentinel Audit Score</span>
              <ShieldCheck className="w-4 h-4 text-[#F3E5AB]" />
            </div>
            <div className="text-2xl lg:text-3xl font-extrabold text-[#F3E5AB] tracking-tight font-mono">
              99.98% <span className="text-xs text-slate-400 font-normal">ZERO-DAY SECURE</span>
            </div>
            <div className="mt-2 flex items-center text-[11px] text-slate-400 font-mono gap-1">
              <Sparkles className="w-3 h-3 text-[#D4AF37]" />
              <span>SHA-256 Merkle Proof Verified</span>
            </div>
          </div>
        </section>

        {/* Navigation Tabs */}
        <div className="border-b border-zinc-800 flex items-center gap-1 sm:gap-2">
          <button
            onClick={() => setActiveTab('LEDGER')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'LEDGER'
                ? 'border-[#D4AF37] text-[#F3E5AB] bg-zinc-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/20'
            }`}
          >
            <Database className="w-4 h-4" />
            <span>PTP Revocation Ledger</span>
          </button>
          <button
            onClick={() => setActiveTab('RESERVE_RELEASE')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'RESERVE_RELEASE'
                ? 'border-emerald-400 text-emerald-300 bg-zinc-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/20'
            }`}
          >
            <Scale className="w-4 h-4" />
            <span>Unspent Reserve Sweep ({agreements.filter((a) => a.status === 'PENDING_RELEASE').length})</span>
          </button>
          <button
            onClick={() => setActiveTab('NOTIFICATIONS')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'NOTIFICATIONS'
                ? 'border-amber-400 text-amber-300 bg-zinc-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/20'
            }`}
          >
            <Send className="w-4 h-4" />
            <span>ISO 20022 Dispatches</span>
          </button>
          <button
            onClick={() => setActiveTab('AUDIT_PROOF')}
            className={`px-4 py-2.5 text-xs sm:text-sm font-mono uppercase tracking-wider font-semibold rounded-t-lg transition-all border-b-2 flex items-center gap-2 ${
              activeTab === 'AUDIT_PROOF'
                ? 'border-purple-400 text-purple-300 bg-zinc-900/50'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-zinc-900/20'
            }`}
          >
            <Fingerprint className="w-4 h-4" />
            <span>Immutable Hash Tree</span>
          </button>
        </div>

        {/* Tab 1: PTP Revocation Ledger */}
        {activeTab === 'LEDGER' && (
          <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
            {/* Left Ledger Table View */}
            <div className="xl:col-span-8 space-y-4">
              <div className="p-4 bg-[#0B0E17] border border-zinc-800 rounded-xl flex flex-wrap items-center justify-between gap-3 shadow-lg">
                <div className="relative flex-1 min-w-[240px]">
                  <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    placeholder="Search by counterparty, ledger ID, account mask..."
                    className="w-full pl-9 pr-3 py-2 bg-zinc-950 border border-zinc-800 rounded-lg text-xs font-mono text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#D4AF37]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <Filter className="w-3.5 h-3.5 text-slate-400" />
                  <select
                    value={filterReason}
                    onChange={(e) => setFilterReason(e.target.value)}
                    className="bg-zinc-950 border border-zinc-800 rounded-lg px-2.5 py-2 text-xs font-mono text-slate-300 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="ALL">All Revocation Triggers</option>
                    <option value="AI_FRAUD_PREEMPTION">AI Preemption</option>
                    <option value="SANCTIONS_COMPLIANCE_HIT">Sanctions Compliance</option>
                    <option value="MATERIAL_BREACH">Material Breach</option>
                    <option value="MUTUAL_DISSOLUTION">Mutual Dissolution</option>
                  </select>
                </div>
              </div>

              {/* Data Grid Table */}
              <div className="bg-[#0B0E17] border border-zinc-800 rounded-xl overflow-hidden shadow-2xl">
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs font-mono">
                    <thead className="bg-[#101420] text-slate-400 border-b border-zinc-800 text-[11px] uppercase">
                      <tr>
                        <th className="px-4 py-3">Counterparty & PTP Agreement</th>
                        <th className="px-4 py-3">Routing / Ledger ID</th>
                        <th className="px-4 py-3">Initial Volume</th>
                        <th className="px-4 py-3">Unspent Reserve</th>
                        <th className="px-4 py-3">Revocation Trigger</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3 text-right">Inspect</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-zinc-800/60">
                      {filteredAgreements.map((agr) => {
                        const isSelected = agr.id === selectedAgreementId;
                        return (
                          <tr
                            key={agr.id}
                            onClick={() => setSelectedAgreementId(agr.id)}
                            className={`cursor-pointer transition-all hover:bg-zinc-800/40 ${
                              isSelected ? 'bg-[#D4AF37]/5 border-l-2 border-[#D4AF37]' : ''
                            }`}
                          >
                            <td className="px-4 py-3.5">
                              <div className="font-semibold text-white">{agr.counterpartyName}</div>
                              <div className="text-[10px] text-slate-500">{agr.id} • {agr.ptpContractReference}</div>
                            </td>
                            <td className="px-4 py-3.5">
                              <span className="inline-flex items-center px-1.5 py-0.5 rounded text-[10px] bg-zinc-800 text-slate-300 border border-zinc-700">
                                {agr.routingProtocol}
                              </span>
                              <div className="text-[10px] text-slate-500 font-mono truncate max-w-[140px] mt-0.5">
                                {agr.citiAccountMask}
                              </div>
                            </td>
                            <td className="px-4 py-3.5 text-slate-200 font-semibold">
                              ${(agr.initialAllocationUSD / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1 })}M
                            </td>
                            <td className="px-4 py-3.5 font-bold">
                              {agr.unspentReserveUSD > 0 ? (
                                <span className="text-emerald-400">
                                  ${(agr.unspentReserveUSD / 1_000_000).toLocaleString('en-US', { minimumFractionDigits: 1 })}M
                                </span>
                              ) : (
                                <span className="text-slate-500">$0.00 (Zeroed)</span>
                              )}
                            </td>
                            <td className="px-4 py-3.5">
                              <span
                                className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-semibold border ${
                                  agr.revocationReason === 'AI_FRAUD_PREEMPTION'
                                    ? 'bg-purple-950/60 border-purple-500/40 text-purple-300'
                                    : agr.revocationReason === 'SANCTIONS_COMPLIANCE_HIT'
                                    ? 'bg-rose-950/60 border-rose-500/40 text-rose-300'
                                    : 'bg-amber-950/60 border-amber-500/40 text-amber-300'
                                }`}
                              >
                                {agr.revocationReason.replace(/_/g, ' ')}
                              </span>
                            </td>
                            <td className="px-4 py-3.5">
                              {agr.status === 'PENDING_RELEASE' ? (
                                <span className="inline-flex items-center gap-1 text-[10px] text-amber-400 font-semibold">
                                  <Clock className="w-3 h-3 animate-spin" /> PENDING RECLAIM
                                </span>
                              ) : (
                                <span className="inline-flex items-center gap-1 text-[10px] text-emerald-400 font-semibold">
                                  <CheckCircle2 className="w-3 h-3" /> RELEASED
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3.5 text-right">
                              <ChevronRight
                                className={`w-4 h-4 inline-block transition-transform ${
                                  isSelected ? 'text-[#D4AF37] translate-x-1' : 'text-slate-600'
                                }`}
                              />
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>

            {/* Right Detailed Inspector Panel */}
            <div className="xl:col-span-4 space-y-4">
              <div className="bg-[#0B0E17] border border-[#D4AF37]/30 rounded-xl p-5 shadow-2xl space-y-5">
                <div className="flex items-center justify-between border-b border-zinc-800 pb-3">
                  <div className="flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-[#D4AF37]" />
                    <h3 className="font-bold text-white font-mono text-sm uppercase">
                      Revocation Dossier
                    </h3>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-zinc-900 text-slate-300 border border-zinc-800">
                    ID: {selectedAgreement.id}
                  </span>
                </div>

                <div className="space-y-3 font-mono text-xs">
                  <div>
                    <label className="text-[10px] uppercase text-slate-500">Counterparty Entity</label>
                    <div className="text-white font-semibold text-sm">{selectedAgreement.counterpartyName}</div>
                    <div className="text-slate-400 text-[11px]">{selectedAgreement.counterpartyId}</div>
                  </div>

                  <div className="grid grid-cols-2 gap-3 pt-1">
                    <div>
                      <label className="text-[10px] uppercase text-slate-500">Citi Custody Account</label>
                      <div className="text-slate-200">{selectedAgreement.citiAccountMask}</div>
                    </div>
                    <div>
                      <label className="text-[10px] uppercase text-slate-500">Modern Treasury ID</label>
                      <div className="text-[#D4AF37] truncate">{selectedAgreement.ledgerId}</div>
                    </div>
                  </div>

                  <div className="p-3 bg-zinc-950/80 rounded-lg border border-zinc-800/80 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Total Allocated:</span>
                      <span className="text-white font-bold">${selectedAgreement.initialAllocationUSD.toLocaleString()} USD</span>
                    </div>
                    <div className="flex justify-between items-center text-xs">
                      <span className="text-slate-400">Settled Pre-Termination:</span>
                      <span className="text-rose-400 font-bold">${selectedAgreement.spentAmountUSD.toLocaleString()} USD</span>
                    </div>
                    <div className="h-px bg-zinc-800 my-1" />
                    <div className="flex justify-between items-center text-sm font-bold">
                      <span className="text-emerald-400">Reclaimable Reserve:</span>
                      <span className="text-emerald-400">${selectedAgreement.unspentReserveUSD.toLocaleString()} USD</span>
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-slate-500">ISO 20022 Protocol Code</label>
                    <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-[11px] text-amber-300 font-mono break-all">
                      {selectedAgreement.isoReturnCode}
                    </div>
                  </div>

                  <div>
                    <label className="text-[10px] uppercase text-slate-500 flex items-center justify-between">
                      <span>Cryptographic Audit Proof (SHA-256)</span>
                      <button
                        onClick={() => handleCopy(selectedAgreement.auditHash)}
                        className="text-[#D4AF37] hover:underline inline-flex items-center gap-1"
                      >
                        {copiedHash === selectedAgreement.auditHash ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                        <span>Copy</span>
                      </button>
                    </label>
                    <div className="p-2 bg-zinc-950 rounded border border-zinc-800 text-[10px] text-slate-400 font-mono break-all">
                      {selectedAgreement.auditHash}
                    </div>
                  </div>

                  <div className="pt-2">
                    {selectedAgreement.status === 'PENDING_RELEASE' ? (
                      <button
                        onClick={handleExecuteRelease}
                        disabled={isExecutingRelease || selectedAgreement.unspentReserveUSD <= 0}
                        className="w-full py-3 bg-gradient-to-r from-[#D4AF37] via-[#C59B27] to-[#A07C16] hover:brightness-110 text-black font-bold text-xs uppercase tracking-wider rounded-lg shadow-xl shadow-[#D4AF37]/20 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
                      >
                        {isExecutingRelease ? (
                          <>
                            <RefreshCw className="w-4 h-4 animate-spin text-black" />
                            <span>Sweeping Escrow to Citi Vault...</span>
                          </>
                        ) : (
                          <>
                            <ArrowDownLeft className="w-4 h-4 text-black" />
                            <span>Release ${(selectedAgreement.unspentReserveUSD / 1_000_000).toFixed(1)}M USD Unspent Reserve</span>
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="w-full py-2.5 bg-emerald-950/40 border border-emerald-500/40 rounded-lg text-emerald-300 text-center font-bold text-xs flex items-center justify-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span>Reserve Fully Released & Reconciled</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Reserve Release & Liquidity Reallocation */}
        {activeTab === 'RESERVE_RELEASE' && (
          <div className="space-y-6">
            <div className="p-6 bg-[#0B0E17] border border-emerald-500/30 rounded-2xl shadow-2xl relative overflow-hidden">
              <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 border-b border-zinc-800 pb-5">
                <div>
                  <div className="inline-flex items-center gap-2 text-xs font-mono uppercase tracking-wider text-emerald-400 font-semibold mb-1">
                    <Sparkles className="w-3.5 h-3.5" /> High-Value Escrow Reallocation Engine
                  </div>
                  <h2 className="text-xl font-bold text-white tracking-tight">
                    Reclaim Unspent PTP Collateral to Citi Sovereign Vaults
                  </h2>
                </div>

                <div className="flex items-center gap-3">
                  <div className="text-right font-mono">
                    <div className="text-xs text-slate-400 uppercase">Available for Instant Sweep</div>
                    <div className="text-2xl font-black text-emerald-400">
                      ${(totalPendingReleaseReserves / 1_000_000_000).toFixed(4)}B USD
                    </div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 my-6">
                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <label className="text-xs font-mono uppercase text-slate-400">Destination Reallocation Vault</label>
                  <select
                    value={reallocationVault}
                    onChange={(e) => setReallocationVault(e.target.value)}
                    className="mt-2 w-full bg-zinc-900 border border-zinc-700 text-white rounded-lg p-2.5 text-xs font-mono focus:border-emerald-400 focus:outline-none"
                  >
                    <option value="CITI_PRIVATE_BANK_SOVEREIGN_RESERVE_01">Citi Sovereign Yield Vault (USD 5.12% APY)</option>
                    <option value="CITI_GLOBAL_COLLATERAL_POOL_SWX">Citi Swiss Escrow Liquidity Buffer (EUR/USD)</option>
                    <option value="MODERN_TREASURY_SETTLEMENT_OVERNIGHT">Modern Treasury Interbank Clearing Node</option>
                  </select>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <label className="text-xs font-mono uppercase text-slate-400">Execution Settlement Engine</label>
                  <div className="mt-2 flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>Citi Sentinel Ledger Core:</span>
                    <span className="text-emerald-400 font-bold">FedNow / RTGS ISO 20022</span>
                  </div>
                  <div className="mt-1 flex items-center justify-between text-xs font-mono text-slate-300">
                    <span>Target Execution Latency:</span>
                    <span className="text-white font-bold">&lt; 150 milliseconds</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-950 rounded-xl border border-zinc-800">
                  <label className="text-xs font-mono uppercase text-slate-400">Projected Daily Yield on Sweep</label>
                  <div className="mt-2 text-xl font-bold text-[#F3E5AB] font-mono">
                    +${((totalPendingReleaseReserves * 0.0512) / 365).toLocaleString('en-US', { maximumFractionDigits: 0 })} / day
                  </div>
                  <div className="text-[11px] text-slate-500 font-mono mt-0.5">Based on Citi Overnight Repo Benchmark Rate</div>
                </div>
              </div>

              {/* Action Table */}
              <div className="border border-zinc-800 rounded-xl overflow-hidden bg-zinc-950">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-zinc-900 text-slate-400 border-b border-zinc-800">
                    <tr>
                      <th className="px-4 py-3">Agreement ID</th>
                      <th className="px-4 py-3">Counterparty Name</th>
                      <th className="px-4 py-3">Unspent Capital</th>
                      <th className="px-4 py-3">Status</th>
                      <th className="px-4 py-3 text-right">Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-zinc-800/60">
                    {agreements.map((agr) => (
                      <tr key={agr.id} className="hover:bg-zinc-900/40">
                        <td className="px-4 py-3 text-slate-300 font-semibold">{agr.id}</td>
                        <td className="px-4 py-3 text-white">{agr.counterpartyName}</td>
                        <td className="px-4 py-3 text-emerald-400 font-bold">
                          ${agr.unspentReserveUSD.toLocaleString()} USD
                        </td>
                        <td className="px-4 py-3">
                          {agr.status === 'PENDING_RELEASE' ? (
                            <span className="inline-flex items-center gap-1 text-amber-400 font-semibold text-[11px]">
                              <Clock className="w-3 h-3" /> PENDING REALLOCATION
                            </span>
                          ) : (
                            <span className="inline-flex items-center gap-1 text-emerald-400 font-semibold text-[11px]">
                              <CheckCircle2 className="w-3 h-3" /> RELEASED TO VAULT
                            </span>
                          )}
                        </td>
                        <td className="px-4 py-3 text-right">
                          {agr.status === 'PENDING_RELEASE' && agr.unspentReserveUSD > 0 ? (
                            <button
                              onClick={() => {
                                setSelectedAgreementId(agr.id);
                                handleExecuteRelease();
                              }}
                              className="px-3 py-1.5 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 border border-emerald-500/40 rounded-lg text-xs font-semibold"
                            >
                              Execute Sweep
                            </button>
                          ) : (
                            <span className="text-slate-600 text-xs">—</span>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 3: ISO 20022 Counterparty Notifications */}
        {activeTab === 'NOTIFICATIONS' && (
          <div className="p-6 bg-[#0B0E17] border border-amber-500/20 rounded-2xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Send className="w-4 h-4 text-amber-400" />
                  Counterparty Revocation Messaging Dispatcher
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  Real-time ISO 20022 camt.056 / pacs.008 revocation telegrams dispatched over SWIFT GPI and FedLine.
                </p>
              </div>
              <span className="px-2.5 py-1 rounded bg-amber-500/10 text-amber-300 border border-amber-500/30 text-xs font-mono font-semibold">
                ALL SYSTEMS CONFIRMED
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {notifications.map((notif) => (
                <div key={notif.id} className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-mono font-bold text-[#D4AF37]">{notif.id}</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                      <CheckCircle2 className="w-3 h-3" />
                      {notif.dispatchStatus.replace(/_/g, ' ')}
                    </span>
                  </div>

                  <div className="text-xs font-mono">
                    <div className="text-slate-400 text-[10px] uppercase">Target Entity:</div>
                    <div className="text-white font-semibold">{notif.recipientEntity}</div>
                  </div>

                  <div className="p-2.5 bg-zinc-900/90 rounded border border-zinc-800 text-[11px] font-mono space-y-1">
                    <div className="text-amber-300 flex items-center justify-between">
                      <span>Message Type:</span>
                      <span className="font-bold">{notif.isoMessageType}</span>
                    </div>
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Channel:</span>
                      <span className="text-slate-200">{notif.channel}</span>
                    </div>
                    <div className="text-slate-400 flex items-center justify-between">
                      <span>Network Latency:</span>
                      <span className="text-emerald-400 font-bold">{notif.latencyMs} ms</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500">
                    <span>Agreement: {notif.agreementId}</span>
                    <span>{new Date(notif.sentAt).toLocaleTimeString()} UTC</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Tab 4: Immutable Cryptographic Audit Hash Tree */}
        {activeTab === 'AUDIT_PROOF' && (
          <div className="p-6 bg-[#0B0E17] border border-purple-500/30 rounded-2xl shadow-2xl space-y-6">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b border-zinc-800 pb-4">
              <div>
                <h3 className="text-base font-bold text-white font-mono flex items-center gap-2">
                  <Fingerprint className="w-4 h-4 text-purple-400" />
                  Citi Sentinel × Modern Treasury Ledger Merkle Proof
                </h3>
                <p className="text-xs text-slate-400 font-mono mt-1">
                  High-frequency cryptographic integrity verification. Zero state mutations permitted without multi-sig consensus.
                </p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 px-2.5 py-1 rounded">
                  Merkle Tree Root: Verified Valid
                </span>
              </div>
            </div>

            <div className="space-y-3 font-mono">
              {auditLogs.map((log, idx) => (
                <div
                  key={idx}
                  className="p-4 bg-zinc-950 rounded-xl border border-zinc-800 hover:border-purple-500/40 transition-all space-y-2"
                >
                  <div className="flex flex-wrap items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-xs px-2 py-0.5 rounded bg-purple-950/60 text-purple-300 border border-purple-500/30 font-bold">
                        Block #{log.blockHeight}
                      </span>
                      <span className="text-xs text-white font-semibold">{log.action}</span>
                    </div>
                    <span className="text-[11px] text-slate-400">
                      {new Date(log.timestamp).toISOString()}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-[11px] pt-1">
                    <div>
                      <span className="text-slate-500">Node: </span>
                      <span className="text-slate-300">{log.nodeId}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">Initiator: </span>
                      <span className="text-slate-300">{log.initiator}</span>
                    </div>
                    <div>
                      <span className="text-slate-500">State: </span>
                      <span className="text-emerald-400 font-semibold">{log.citiLedgerState}</span>
                    </div>
                  </div>

                  <div className="p-2 bg-black/60 rounded border border-zinc-900 text-[10px] text-slate-400 flex items-center justify-between">
                    <span className="truncate max-w-[80%] font-mono">SHA-256 Hash Digest: {log.digest}</span>
                    <button
                      onClick={() => handleCopy(log.digest)}
                      className="text-[#D4AF37] hover:underline flex items-center gap-1"
                    >
                      {copiedHash === log.digest ? <Check className="w-2.5 h-2.5" /> : <Copy className="w-2.5 h-2.5" />}
                      <span>Copy</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>

      {/* Persistent Bottom Citi Gold Status Bar */}
      <footer className="fixed bottom-0 left-0 right-0 z-30 bg-[#07090E]/95 border-t border-[#D4AF37]/20 backdrop-blur-md px-6 py-2 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-400">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1.5 text-slate-300">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Modern Treasury API Node: <strong className="text-white">v2025.1.0-citigroup-prime</strong>
          </span>
          <span className="hidden sm:inline-block text-zinc-700">|</span>
          <span className="hidden sm:inline-block text-slate-300">
            ISO Return Pipeline: <strong className="text-white">camt.056 / pacs.008 Active</strong>
          </span>
        </div>

        <div className="flex items-center gap-3 text-[#D4AF37]">
          <span>Citi Private Bank Treasury Division</span>
          <span>•</span>
          <span className="font-bold">Confidential Tier-1 Asset Ledger</span>
        </div>
      </footer>
    </div>
  );
};

export default ModernTreasuryPayeeRevocationLedger;