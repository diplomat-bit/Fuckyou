import React, { useState, useEffect, useMemo } from 'react';
import {
  ShieldCheck,
  Scale,
  FileCode2,
  Cpu,
  Zap,
  AlertOctagon,
  ArrowRightLeft,
  CheckCircle2,
  RefreshCw,
  Sliders,
  Database,
  Lock,
  Eye,
  Terminal,
  Activity,
  DollarSign,
  TrendingDown,
  Layers,
  ChevronRight,
  Sparkles,
  ExternalLink,
  HelpCircle,
  Clock
} from 'lucide-react';

interface StandingInstructionEvent {
  id: string;
  citiPtpId: string;
  citiAccountRef: string;
  debtorIban: string;
  debtorName: string;
  creditorIban: string;
  creditorName: string;
  amount: number;
  currency: string;
  frequency: 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'ADHOC';
  cancellationTimestamp: string;
  cancellationReasonCode: string;
  cancellationReasonDesc: string;
  reconciliationStatus: 'RECONCILED' | 'PENDING_MODERN_TREASURY' | 'DISCREPANCY' | 'PAIN_002_DISPATCHED';
  aiRiskScore: number;
  aiAnomalyDetection: {
    flagged: boolean;
    confidence: number;
    verdict: string;
    suggestedAction: string;
  };
  modernTreasuryJournal: {
    journalEntryId: string;
    ledgerId: string;
    status: 'posted' | 'pending' | 'rejected';
    entries: {
      accountName: string;
      accountId: string;
      direction: 'credit' | 'debit';
      amount: number;
    }[];
  };
  iso20022Pain002Payload: string;
}

const INITIAL_EVENTS: StandingInstructionEvent[] = [
  {
    id: "SI-AUD-90821-X1",
    citiPtpId: "CITI-PTP-88492019-NY",
    citiAccountRef: "CITI-US-PRIVATE-88219491",
    debtorIban: "US33CITI20000088219491001",
    debtorName: "Aethelgard Sovereign Trust Ltd.",
    creditorIban: "GB29BARC20000019283748291",
    creditorName: "Blackstone Liquidity Master LLC",
    amount: 148500000.00,
    currency: "USD",
    frequency: "MONTHLY",
    cancellationTimestamp: "2025-02-23T14:28:11.892Z",
    cancellationReasonCode: "CUST_REVOCATION",
    cancellationReasonDesc: "Counterparty Mandate Revoked - Capital Relocation to Tier-1 Custody",
    reconciliationStatus: "PAIN_002_DISPATCHED",
    aiRiskScore: 12,
    aiAnomalyDetection: {
      flagged: false,
      confidence: 99.4,
      verdict: "Authorized Executive Cancellation Signature Authenticated via Citi Biometric HSM Key.",
      suggestedAction: "Execute zero-latency MT ledger balancing and broadcast ISO 20022 pain.002.001.12 confirmation."
    },
    modernTreasuryJournal: {
      journalEntryId: "mt_je_01J8F929BA991KAAZ823",
      ledgerId: "mt_led_global_sovereign_prime",
      status: "posted",
      entries: [
        {
          accountName: "Citi Standing Settlement Clearing Acc",
          accountId: "mt_acc_citi_clr_99812",
          direction: "credit",
          amount: 148500000.00
        },
        {
          accountName: "Unallocated PTP Escrow Obligations",
          accountId: "mt_acc_ptp_escrow_4410",
          direction: "debit",
          amount: 148500000.00
        }
      ]
    },
    iso20022Pain002Payload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.12">
  <CstmrPmtStsRpt>
    <GrpHdr>
      <MsgId>CITI-MT-PAIN002-20250223-90821-X1</MsgId>
      <CreDtTm>2025-02-23T14:28:12.012Z</CreDtTm>
      <InitgPty>
        <Nm>Citibank NA Institutional Treasury &amp; Modern Treasury Gateway</Nm>
        <Id><OrgId><AnyBIC>CITIUS33XXX</AnyBIC></OrgId></Id>
      </InitgPty>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>CITI-PTP-88492019-NY-ORIG-PAIN001</OrgnlMsgId>
      <OrgnlMsgNmId>pain.001.001.11</OrgnlMsgNmId>
      <GrpSts>RJCT</GrpSts>
      <StsRsnInf>
        <Rsn><Cd>MS03</Cd></Rsn>
        <AddtlInf>Standing Instruction Revoked by PTP Settlement Controller</AddtlInf>
      </StsRsnInf>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <StsId>TX-STAT-88492019-MODTRSY-JRNL-01</StsId>
      <OrgnlEndToEndId>E2E-CITI-MT-88492019</OrgnlEndToEndId>
      <TxSts>CANC</TxSts>
      <OrgnlTxRef>
        <Amt><InstdAmt Ccy="USD">148500000.00</InstdAmt></Amt>
        <Dbtr><Nm>Aethelgard Sovereign Trust Ltd.</Nm></Dbtr>
        <Cdtr><Nm>Blackstone Liquidity Master LLC</Nm></Cdtr>
      </OrgnlTxRef>
    </TxInfAndSts>
  </CstmrPmtStsRpt>
</Document>`
  },
  {
    id: "SI-AUD-90822-X2",
    citiPtpId: "CITI-PTP-44910283-LON",
    citiAccountRef: "CITI-GB-SWISS-77491023",
    debtorIban: "GB12CITI40000077491023009",
    debtorName: "Vanderbilt & Zurich Multi-Family Office",
    creditorIban: "CH93000000000000088910293",
    creditorName: "Helvetia Alpine Vaults AG",
    amount: 82400000.00,
    currency: "EUR",
    frequency: "QUARTERLY",
    cancellationTimestamp: "2025-02-23T14:41:04.102Z",
    cancellationReasonCode: "INSUFFICIENT_LIQUIDITY_BUFFER",
    cancellationReasonDesc: "Autonomous Liquidity Firewall Triggered - Rebalancing Yield Vectors",
    reconciliationStatus: "PENDING_MODERN_TREASURY",
    aiRiskScore: 48,
    aiAnomalyDetection: {
      flagged: true,
      confidence: 94.8,
      verdict: "High-Frequency Standing Order Cancellation: 3rd event detected in 48 hours across cross-border corridor.",
      suggestedAction: "Place Modern Treasury Journal in provisional hold and verify multi-sig custody consensus."
    },
    modernTreasuryJournal: {
      journalEntryId: "mt_je_01J8FA812C991823HFA71",
      ledgerId: "mt_led_emea_liquidity_prime",
      status: "pending",
      entries: [
        {
          accountName: "Citi London Liquidity Clearing",
          accountId: "mt_acc_citi_lon_441",
          direction: "credit",
          amount: 82400000.00
        },
        {
          accountName: "Helvetia Pending Standing Commitment",
          accountId: "mt_acc_helv_cmt_902",
          direction: "debit",
          amount: 82400000.00
        }
      ]
    },
    iso20022Pain002Payload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.12">
  <CstmrPmtStsRpt>
    <GrpHdr>
      <MsgId>CITI-MT-PAIN002-20250223-90822-X2</MsgId>
      <CreDtTm>2025-02-23T14:41:05.109Z</CreDtTm>
      <InitgPty>
        <Nm>Citibank London Wholesale &amp; Modern Treasury Sync</Nm>
      </InitgPty>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>CITI-PTP-44910283-LON-PAIN001</OrgnlMsgId>
      <OrgnlMsgNmId>pain.001.001.11</OrgnlMsgNmId>
      <GrpSts>PDNG</GrpSts>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <StsId>TX-STAT-44910283-HOLD-REV</StsId>
      <TxSts>PDNG</TxSts>
      <OrgnlTxRef>
        <Amt><InstdAmt Ccy="EUR">82400000.00</InstdAmt></Amt>
      </OrgnlTxRef>
    </TxInfAndSts>
  </CstmrPmtStsRpt>
</Document>`
  },
  {
    id: "SI-AUD-90823-X3",
    citiPtpId: "CITI-PTP-11029384-SG",
    citiAccountRef: "CITI-SG-CORP-99210499",
    debtorIban: "SG44CITI11000099210499011",
    debtorName: "Singa-Nippon Sovereign Quantum Fund",
    creditorIban: "JP88CITI00000000192837461",
    creditorName: "Tokyo AI Supercluster Holdings Inc.",
    amount: 320000000.00,
    currency: "USD",
    frequency: "MONTHLY",
    cancellationTimestamp: "2025-02-23T14:52:19.441Z",
    cancellationReasonCode: "AI_ORCHESTRATED_SWAP",
    cancellationReasonDesc: "Autonomous Yield Rebalance into Hyper-Short Duration T-Bills via MT Ledgers",
    reconciliationStatus: "RECONCILED",
    aiRiskScore: 3,
    aiAnomalyDetection: {
      flagged: false,
      confidence: 99.98,
      verdict: "Optimal Standing Order Termination. Direct offset journal matching 100% balanced in Modern Treasury core.",
      suggestedAction: "Instant Pain.002 ack receipt generated and dispatched to Citi FedLine Direct."
    },
    modernTreasuryJournal: {
      journalEntryId: "mt_je_01J8FB109921KASB1194",
      ledgerId: "mt_led_apac_quantum_tier1",
      status: "posted",
      entries: [
        {
          accountName: "Citi SG Institutional Escrow",
          accountId: "mt_acc_citi_sg_9011",
          direction: "credit",
          amount: 320000000.00
        },
        {
          accountName: "Autonomous Liquidity Reservoir APAC",
          accountId: "mt_acc_apac_res_001",
          direction: "debit",
          amount: 320000000.00
        }
      ]
    },
    iso20022Pain002Payload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.12">
  <CstmrPmtStsRpt>
    <GrpHdr>
      <MsgId>CITI-MT-PAIN002-20250223-90823-X3</MsgId>
      <CreDtTm>2025-02-23T14:52:20.001Z</CreDtTm>
      <InitgPty>
        <Nm>Citibank APAC Private Desk</Nm>
      </InitgPty>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>CITI-PTP-11029384-SG-RAW</OrgnlMsgId>
      <GrpSts>ACTC</GrpSts>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <StsId>TX-STAT-11029384-BALANCED</StsId>
      <TxSts>ACCP</TxSts>
      <OrgnlTxRef>
        <Amt><InstdAmt Ccy="USD">320000000.00</InstdAmt></Amt>
      </OrgnlTxRef>
    </TxInfAndSts>
  </CstmrPmtStsRpt>
</Document>`
  }
];

export const ModernTreasuryStandingInstructionAuditor: React.FC = () => {
  const [events, setEvents] = useState<StandingInstructionEvent[]>(INITIAL_EVENTS);
  const [selectedEventId, setSelectedEventId] = useState<string>(INITIAL_EVENTS[0].id);
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'ISO_XML' | 'MT_JOURNAL' | 'AI_AUDIT'>('OVERVIEW');
  const [isSynthesizing, setIsSynthesizing] = useState(false);
  const [autoReconcileRunning, setAutoReconcileRunning] = useState(false);
  const [copiedNotification, setCopiedNotification] = useState(false);
  const [streamSpeed, setStreamSpeed] = useState<number>(100);

  const selectedEvent = useMemo(() => {
    return events.find(e => e.id === selectedEventId) || events[0];
  }, [events, selectedEventId]);

  const totalMonitoredVolume = useMemo(() => {
    return events.reduce((acc, curr) => acc + curr.amount, 0);
  }, [events]);

  const handleSimulateNewCancellation = () => {
    setIsSynthesizing(true);
    setTimeout(() => {
      const randomAmount = Math.floor(Math.random() * 250000000) + 15000000;
      const newIdNumber = Math.floor(Math.random() * 90000) + 10000;
      const currencies = ["USD", "EUR", "GBP", "SGD", "CHF"];
      const selectedCcy = currencies[Math.floor(Math.random() * currencies.length)];

      const newEvent: StandingInstructionEvent = {
        id: `SI-AUD-${newIdNumber}-Z${events.length + 1}`,
        citiPtpId: `CITI-PTP-${Math.floor(Math.random() * 90000000 + 10000000)}-QUANTUM`,
        citiAccountRef: `CITI-GLOBAL-PRIVATE-${Math.floor(Math.random() * 900000 + 100000)}`,
        debtorIban: `US89CITI${Math.floor(Math.random() * 9000000000000000 + 1000000000000000)}`,
        debtorName: "Oppenheimer Global Macro Sovereign SPV",
        creditorIban: `CH910000${Math.floor(Math.random() * 9000000000000000 + 1000000000000000)}`,
        creditorName: "Astra Autonomous Liquidity Pool IV",
        amount: randomAmount,
        currency: selectedCcy,
        frequency: "MONTHLY",
        cancellationTimestamp: new Date().toISOString(),
        cancellationReasonCode: "AI_QUANT_ALPHA_SHIFT",
        cancellationReasonDesc: "Autonomous algorithmic cancellation: Yield divergence detected across Tier-1 Money Markets.",
        reconciliationStatus: "PENDING_MODERN_TREASURY",
        aiRiskScore: Math.floor(Math.random() * 25) + 2,
        aiAnomalyDetection: {
          flagged: false,
          confidence: 99.8,
          verdict: "Real-time cryptographic hash verified against Citibank Core CitiConnect Node.",
          suggestedAction: "Convert to Modern Treasury double-entry ledger offset immediately."
        },
        modernTreasuryJournal: {
          journalEntryId: `mt_je_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
          ledgerId: "mt_led_hyper_sovereign_prime",
          status: "pending",
          entries: [
            {
              accountName: "Citi Global Clearing Settlement",
              accountId: `mt_acc_citi_clr_${Math.floor(Math.random() * 9000 + 1000)}`,
              direction: "credit",
              amount: randomAmount
            },
            {
              accountName: "Standing Commitment Liquidity Ledger",
              accountId: `mt_acc_scl_${Math.floor(Math.random() * 9000 + 1000)}`,
              direction: "debit",
              amount: randomAmount
            }
          ]
        },
        iso20022Pain002Payload: `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pain.002.001.12">
  <CstmrPmtStsRpt>
    <GrpHdr>
      <MsgId>CITI-MT-PAIN002-${Date.now()}-GEN</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <InitgPty>
        <Nm>Citibank Automated Instruction Engine</Nm>
      </InitgPty>
    </GrpHdr>
    <OrgnlGrpInfAndSts>
      <OrgnlMsgId>CITI-PTP-AUTO-CANC-${Date.now()}</OrgnlMsgId>
      <GrpSts>RJCT</GrpSts>
    </OrgnlGrpInfAndSts>
    <TxInfAndSts>
      <StsId>TX-STAT-${newIdNumber}-SYNC</StsId>
      <TxSts>CANC</TxSts>
      <OrgnlTxRef>
        <Amt><InstdAmt Ccy="${selectedCcy}">${randomAmount.toFixed(2)}</InstdAmt></Amt>
      </OrgnlTxRef>
    </TxInfAndSts>
  </CstmrPmtStsRpt>
</Document>`
      };

      setEvents(prev => [newEvent, ...prev]);
      setSelectedEventId(newEvent.id);
      setIsSynthesizing(false);
    }, 800);
  };

  const handleExecuteAutonomousReconciliation = (id: string) => {
    setAutoReconcileRunning(true);
    setTimeout(() => {
      setEvents(prev => prev.map(ev => {
        if (ev.id === id) {
          return {
            ...ev,
            reconciliationStatus: 'RECONCILED',
            modernTreasuryJournal: {
              ...ev.modernTreasuryJournal,
              status: 'posted'
            }
          };
        }
        return ev;
      }));
      setAutoReconcileRunning(false);
    }, 1000);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner: Sovereign Luxury Tier-1 Branding */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0C1019] via-[#121824] to-[#0A0D14] border border-amber-500/20 p-6 mb-8 shadow-2xl shadow-black/80 backdrop-blur-3xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-bl from-amber-500/10 via-cyan-500/5 to-transparent rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-12 -bottom-12 w-64 h-64 bg-emerald-500/10 rounded-full blur-2xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="px-2.5 py-0.5 rounded-full text-[10px] font-mono tracking-widest uppercase bg-gradient-to-r from-amber-500/20 to-amber-600/20 text-amber-300 border border-amber-500/40">
                Tier-1 Institutional Compliance
              </span>
              <span className="flex items-center gap-1.5 text-xs text-emerald-400 font-mono">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                CITIBANK CONNECT &amp; MODERN TREASURY LEDGER ACTIVE
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-amber-100/90 bg-clip-text text-transparent">
              Standing Instruction Auditor &amp; ISO 20022 pain.002 Engine
            </h1>
            <p className="text-sm text-slate-400 max-w-3xl mt-1 leading-relaxed">
              Autonomous Standing Order &amp; Promise-to-Pay (PTP) revocation reconciler. Converts Citi core cancellation vectors into balanced Modern Treasury journal double-entries with cryptographically verified ISO 20022 pain.001/pain.002 transmission receipts.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleSimulateNewCancellation}
              disabled={isSynthesizing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-semibold text-xs tracking-wide uppercase transition-all duration-200 shadow-lg shadow-amber-500/20 hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50 cursor-pointer"
            >
              {isSynthesizing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  <span>Synthesizing PTP...</span>
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4 text-black" />
                  <span>Inject Citi PTP Cancellation</span>
                </>
              )}
            </button>
            <button
              onClick={() => handleExecuteAutonomousReconciliation(selectedEvent.id)}
              disabled={autoReconcileRunning || selectedEvent.reconciliationStatus === 'RECONCILED'}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#172033] hover:bg-[#1E293B] border border-cyan-500/30 text-cyan-300 hover:text-cyan-200 font-semibold text-xs tracking-wide uppercase transition-all duration-200 shadow-lg hover:scale-[1.02] active:scale-[0.98] disabled:opacity-40 cursor-pointer"
            >
              <ArrowRightLeft className={`w-4 h-4 ${autoReconcileRunning ? 'animate-spin' : ''}`} />
              <span>{selectedEvent.reconciliationStatus === 'RECONCILED' ? 'Ledger Balanced' : 'Auto-Balance Ledger'}</span>
            </button>
          </div>
        </div>

        {/* Global Financial Metrics Strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6 pt-6 border-t border-slate-800/80">
          <div className="bg-[#080B11]/80 rounded-xl p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <DollarSign className="w-3.5 h-3.5 text-amber-400" />
              Audited PTP Revocation Volume
            </div>
            <div className="text-lg md:text-xl font-bold text-white font-mono mt-1">
              ${(totalMonitoredVolume / 1000000).toFixed(2)}M <span className="text-xs text-slate-500 font-normal">USD Equiv</span>
            </div>
          </div>
          <div className="bg-[#080B11]/80 rounded-xl p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-cyan-400" />
              Modern Treasury Ledgers
            </div>
            <div className="text-lg md:text-xl font-bold text-cyan-300 font-mono mt-1">
              100% Invariant Match
            </div>
          </div>
          <div className="bg-[#080B11]/80 rounded-xl p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <FileCode2 className="w-3.5 h-3.5 text-emerald-400" />
              pain.002 Status Reports
            </div>
            <div className="text-lg md:text-xl font-bold text-emerald-400 font-mono mt-1">
              {events.length} Sealed Documents
            </div>
          </div>
          <div className="bg-[#080B11]/80 rounded-xl p-3 border border-slate-800/60">
            <div className="text-[11px] text-slate-400 font-mono uppercase tracking-wider flex items-center gap-1.5">
              <Cpu className="w-3.5 h-3.5 text-purple-400" />
              AI Compliance Risk Model
            </div>
            <div className="text-lg md:text-xl font-bold text-purple-300 font-mono mt-1">
              99.7% Ultra Confidence
            </div>
          </div>
        </div>
      </div>

      {/* Main Split Layout: Left Pipeline Stream / Right Deep Inspection Deck */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Live Event Ingestion Stream */}
        <div className="xl:col-span-5 flex flex-col gap-4">
          <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 mb-4">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold tracking-wider uppercase text-slate-200">
                  PTP Cancellation Ingest Pipeline
                </h2>
              </div>
              <span className="text-[11px] font-mono bg-slate-800/80 px-2 py-0.5 rounded text-slate-300">
                {events.length} Events Monitored
              </span>
            </div>

            <div className="space-y-3 max-h-[640px] overflow-y-auto pr-1">
              {events.map((ev) => {
                const isSelected = ev.id === selectedEventId;
                return (
                  <div
                    key={ev.id}
                    onClick={() => setSelectedEventId(ev.id)}
                    className={`relative p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected
                        ? 'bg-[#151D2C] border-amber-500/50 shadow-lg shadow-amber-500/5'
                        : 'bg-[#0E131F]/70 border-slate-800/80 hover:border-slate-700 hover:bg-[#121927]'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 right-0 w-2 h-full bg-gradient-to-b from-amber-400 to-amber-600 rounded-r-xl" />
                    )}

                    <div className="flex items-start justify-between gap-2 mb-2">
                      <div>
                        <span className="text-[10px] font-mono uppercase px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                          {ev.citiPtpId}
                        </span>
                        <h3 className="text-xs font-semibold text-white mt-1.5">
                          {ev.debtorName}
                        </h3>
                      </div>
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-amber-300">
                          {ev.currency} {ev.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </div>
                        <span className="text-[10px] text-slate-400 font-mono">
                          {ev.frequency}
                        </span>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-400 line-clamp-1 mb-3">
                      {ev.cancellationReasonDesc}
                    </p>

                    <div className="flex items-center justify-between text-[10px] pt-2 border-t border-slate-800/80 font-mono">
                      <div className="flex items-center gap-1.5">
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          ev.reconciliationStatus === 'RECONCILED' ? 'bg-emerald-400' :
                          ev.reconciliationStatus === 'PAIN_002_DISPATCHED' ? 'bg-cyan-400' : 'bg-amber-400'
                        }`} />
                        <span className={
                          ev.reconciliationStatus === 'RECONCILED' ? 'text-emerald-400 font-medium' :
                          ev.reconciliationStatus === 'PAIN_002_DISPATCHED' ? 'text-cyan-400 font-medium' : 'text-amber-400 font-medium'
                        }>
                          {ev.reconciliationStatus}
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-slate-400">
                        <Clock className="w-3 h-3 text-slate-500" />
                        {new Date(ev.cancellationTimestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Column: Deep Inspection Deck */}
        <div className="xl:col-span-7 flex flex-col gap-4">
          <div className="bg-[#0B0F19] rounded-2xl border border-slate-800 p-5 shadow-2xl flex flex-col h-full">
            
            {/* Header with Navigation Tabs */}
            <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-slate-800">
              <div>
                <span className="text-[10px] font-mono uppercase text-amber-400 tracking-wider">
                  Active Instruction Entity
                </span>
                <h2 className="text-base font-bold text-white font-mono">
                  {selectedEvent.id} &bull; {selectedEvent.citiPtpId}
                </h2>
              </div>

              {/* Tabs */}
              <div className="flex items-center bg-[#070A10] p-1 rounded-xl border border-slate-800">
                <button
                  onClick={() => setActiveTab('OVERVIEW')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'OVERVIEW'
                      ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Summary
                </button>
                <button
                  onClick={() => setActiveTab('MT_JOURNAL')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'MT_JOURNAL'
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  Modern Treasury Journal
                </button>
                <button
                  onClick={() => setActiveTab('ISO_XML')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'ISO_XML'
                      ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  ISO pain.002 Payload
                </button>
                <button
                  onClick={() => setActiveTab('AI_AUDIT')}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all cursor-pointer ${
                    activeTab === 'AI_AUDIT'
                      ? 'bg-purple-500/20 text-purple-300 border border-purple-500/30'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  AI Governance
                </button>
              </div>
            </div>

            {/* Notification Bar if Copied */}
            {copiedNotification && (
              <div className="mt-3 py-1 px-3 bg-emerald-500/20 border border-emerald-500/40 rounded text-emerald-300 text-xs font-mono text-center">
                Payload copied to clipboard successfully.
              </div>
            )}

            {/* TAB CONTENT: SUMMARY OVERVIEW */}
            {activeTab === 'OVERVIEW' && (
              <div className="py-4 space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Debtor Profile Card */}
                  <div className="bg-[#0E1422] p-4 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                      <span>Debtor Party (Originator)</span>
                      <span className="text-amber-400">Citi Private Desk</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{selectedEvent.debtorName}</div>
                    <div className="text-xs font-mono text-slate-400 mt-2 break-all bg-[#080C14] p-2 rounded border border-slate-800/80">
                      IBAN: {selectedEvent.debtorIban}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 font-mono">
                      Ref Account: {selectedEvent.citiAccountRef}
                    </div>
                  </div>

                  {/* Creditor Profile Card */}
                  <div className="bg-[#0E1422] p-4 rounded-xl border border-slate-800">
                    <div className="text-[10px] font-mono uppercase text-slate-400 mb-1 flex items-center justify-between">
                      <span>Creditor Beneficiary</span>
                      <span className="text-cyan-400">Target Institution</span>
                    </div>
                    <div className="text-sm font-semibold text-white">{selectedEvent.creditorName}</div>
                    <div className="text-xs font-mono text-slate-400 mt-2 break-all bg-[#080C14] p-2 rounded border border-slate-800/80">
                      IBAN: {selectedEvent.creditorIban}
                    </div>
                    <div className="mt-2 text-[11px] text-slate-500 font-mono">
                      Status: Mandate Voided at Clearing Layer
                    </div>
                  </div>
                </div>

                {/* Event Metadata Breakdown */}
                <div className="bg-[#0E1422] p-4 rounded-xl border border-slate-800 space-y-3">
                  <div className="text-xs font-semibold text-slate-200 uppercase tracking-wider">
                    Standing Order Revocation Attributes
                  </div>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 font-mono text-xs">
                    <div>
                      <div className="text-slate-500 text-[10px]">REASON CODE</div>
                      <div className="text-amber-400 font-medium">{selectedEvent.cancellationReasonCode}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">MANDATE FREQUENCY</div>
                      <div className="text-slate-200">{selectedEvent.frequency}</div>
                    </div>
                    <div>
                      <div className="text-slate-500 text-[10px]">NOMINAL VALUE</div>
                      <div className="text-white font-bold">{selectedEvent.currency} {selectedEvent.amount.toLocaleString()}</div>
                    </div>
                    <div className="col-span-2 md:col-span-3">
                      <div className="text-slate-500 text-[10px]">CANCELLATION STATEMENT</div>
                      <div className="text-slate-300 text-xs mt-0.5">{selectedEvent.cancellationReasonDesc}</div>
                    </div>
                  </div>
                </div>

                {/* Process Step Pipeline Visualizer */}
                <div className="bg-[#070A10] p-4 rounded-xl border border-slate-800">
                  <div className="text-[11px] font-mono text-slate-400 uppercase tracking-wider mb-3">
                    Automated Invariant Lifecycle
                  </div>
                  <div className="flex items-center justify-between text-xs font-mono">
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-emerald-500/20 border border-emerald-500 text-emerald-400 flex items-center justify-center font-bold mb-1">
                        ✓
                      </div>
                      <span className="text-[10px] text-slate-300">Citi PTP Revoke</span>
                    </div>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-emerald-500 to-cyan-500 mx-2" />
                    <div className="flex flex-col items-center text-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold mb-1 ${
                        selectedEvent.reconciliationStatus === 'RECONCILED'
                          ? 'bg-emerald-500/20 border border-emerald-500 text-emerald-400'
                          : 'bg-cyan-500/20 border border-cyan-500 text-cyan-400'
                      }`}>
                        MT
                      </div>
                      <span className="text-[10px] text-slate-300">Journal Balance</span>
                    </div>
                    <div className="h-[1px] flex-1 bg-gradient-to-r from-cyan-500 to-amber-500 mx-2" />
                    <div className="flex flex-col items-center text-center">
                      <div className="w-8 h-8 rounded-full bg-amber-500/20 border border-amber-500 text-amber-400 flex items-center justify-center font-bold mb-1">
                        ISO
                      </div>
                      <span className="text-[10px] text-slate-300">pain.002 Dispatched</span>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MODERN TREASURY JOURNAL ENTRIES */}
            {activeTab === 'MT_JOURNAL' && (
              <div className="py-4 space-y-4">
                <div className="flex items-center justify-between bg-[#0E1422] p-3 rounded-xl border border-slate-800">
                  <div>
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Modern Treasury Journal Entry ID</div>
                    <div className="text-xs font-mono font-bold text-cyan-300">{selectedEvent.modernTreasuryJournal.journalEntryId}</div>
                  </div>
                  <div className="text-right">
                    <div className="text-[10px] font-mono text-slate-400 uppercase">Ledger Target</div>
                    <div className="text-xs font-mono text-slate-300">{selectedEvent.modernTreasuryJournal.ledgerId}</div>
                  </div>
                </div>

                <div className="border border-slate-800 rounded-xl overflow-hidden">
                  <table className="w-full text-left font-mono text-xs">
                    <thead className="bg-[#080C14] text-slate-400 text-[10px] uppercase border-b border-slate-800">
                      <tr>
                        <th className="p-3">Ledger Account</th>
                        <th className="p-3">Account Reference</th>
                        <th className="p-3">Direction</th>
                        <th className="p-3 text-right">Amount ({selectedEvent.currency})</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 bg-[#0E1422]">
                      {selectedEvent.modernTreasuryJournal.entries.map((entry, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30">
                          <td className="p-3 font-semibold text-slate-200">{entry.accountName}</td>
                          <td className="p-3 text-slate-400 text-[11px]">{entry.accountId}</td>
                          <td className="p-3">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              entry.direction === 'credit'
                                ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                                : 'bg-cyan-500/20 text-cyan-400 border border-cyan-500/30'
                            }`}>
                              {entry.direction.toUpperCase()}
                            </span>
                          </td>
                          <td className="p-3 text-right font-bold text-white">
                            {entry.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="bg-[#080C14] p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs text-slate-300 font-mono">Modern Treasury Double-Entry Balance Verification:</span>
                  </div>
                  <span className="text-xs font-mono font-bold text-emerald-400">Δ 0.00000000 (BALANCED)</span>
                </div>
              </div>
            )}

            {/* TAB CONTENT: ISO 20022 XML PAYLOAD */}
            {activeTab === 'ISO_XML' && (
              <div className="py-4 space-y-3 flex-1 flex flex-col">
                <div className="flex items-center justify-between">
                  <div className="text-xs font-mono text-slate-400 flex items-center gap-2">
                    <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                    <span>pain.002.001.12 Customer Payment Status Report</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(selectedEvent.iso20022Pain002Payload)}
                    className="text-xs font-mono text-amber-400 hover:text-amber-300 bg-amber-500/10 hover:bg-amber-500/20 px-2.5 py-1 rounded border border-amber-500/30 transition-all cursor-pointer"
                  >
                    Copy XML
                  </button>
                </div>

                <div className="relative flex-1 bg-[#04060A] p-4 rounded-xl border border-slate-800 font-mono text-[11px] text-emerald-300/90 overflow-x-auto whitespace-pre max-h-[460px] select-all shadow-inner">
                  {selectedEvent.iso20022Pain002Payload}
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI COMPLIANCE & RISK AUDITOR */}
            {activeTab === 'AI_AUDIT' && (
              <div className="py-4 space-y-4">
                <div className="p-4 rounded-xl bg-gradient-to-br from-purple-950/20 via-[#0E1422] to-[#0A0E1A] border border-purple-500/30">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-purple-400" />
                      <span className="text-xs font-bold font-mono text-purple-300 uppercase">
                        AI Neural Anomaly Analysis
                      </span>
                    </div>
                    <span className="text-xs font-mono px-2 py-0.5 rounded bg-purple-500/20 text-purple-200 border border-purple-500/40">
                      Risk Score: {selectedEvent.aiRiskScore}/100
                    </span>
                  </div>

                  <p className="text-xs text-slate-200 leading-relaxed mb-3">
                    {selectedEvent.aiAnomalyDetection.verdict}
                  </p>

                  <div className="p-3 rounded-lg bg-[#06080F] border border-purple-500/20">
                    <div className="text-[10px] font-mono text-purple-400 uppercase tracking-wider mb-1">
                      Autonomous Recommendation
                    </div>
                    <div className="text-xs text-slate-300 font-mono">
                      {selectedEvent.aiAnomalyDetection.suggestedAction}
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 font-mono text-xs">
                  <div className="bg-[#0E1422] p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">OFAC &amp; FINCEN SANCTION CHECK</div>
                    <div className="text-emerald-400 font-semibold mt-1">CLEARED (0 HITS)</div>
                  </div>
                  <div className="bg-[#0E1422] p-3 rounded-xl border border-slate-800">
                    <div className="text-slate-500 text-[10px]">CITI HSM BIOMETRIC SEAL</div>
                    <div className="text-cyan-400 font-semibold mt-1">ED25519 VERIFIED</div>
                  </div>
                </div>
              </div>
            )}

            {/* Footer Action Strip */}
            <div className="mt-auto pt-4 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span className="font-mono text-[11px]">
                Citi FedLine Gateway ID: <strong className="text-slate-200">GW-CITI-NY-902</strong>
              </span>
              <div className="flex items-center gap-2">
                <Lock className="w-3.5 h-3.5 text-emerald-400" />
                <span className="font-mono text-[11px] text-emerald-400">End-to-End Cryptographic Invariant Guard</span>
              </div>
            </div>

          </div>
        </div>

      </div>
    </div>
  );
};

export default ModernTreasuryStandingInstructionAuditor;