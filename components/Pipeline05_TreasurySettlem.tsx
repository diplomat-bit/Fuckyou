

// --- CONSOLIDATED FROM: ./pipelines/Pipeline05_TreasurySettlem.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  DollarSign,
  ArrowRightLeft,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Clock,
  RefreshCw,
  Send,
  FileText,
  Database,
  Layers,
  BarChart3,
  TrendingUp,
  Landmark,
  Globe,
  Activity,
  Eye,
  Filter,
  Download,
  Zap,
  ChevronRight,
  Lock,
  Unlock,
  Play,
  Search,
  Sliders,
  CheckSquare,
  Square,
  AlertCircle,
  ExternalLink,
  ChevronDown,
  FileCode,
  ArrowUpRight,
  ArrowDownLeft,
  XCircle,
  Plus
} from 'lucide-react';

// --- Types & Interfaces ---

export type SettlementStatus = 
  | 'INGESTED'
  | 'SSI_MATCHED'
  | 'NETTED'
  | 'LIQUIDITY_RESERVED'
  | 'SWIFT_DISPATCHED'
  | 'CONFIRMED'
  | 'FAILED'
  | 'MANUAL_HOLD';

export type InstrumentType = 'FX_SPOT' | 'FX_FORWARD' | 'CROSS_CURRENCY_SWAP' | 'MONEY_MARKET' | 'TREASURY_REPO';

export type Currency = 'USD' | 'EUR' | 'GBP' | 'JPY' | 'CHF' | 'SGD';

export interface SettlementRecord {
  id: string;
  dealRef: string;
  counterparty: string;
  counterpartyBic: string;
  type: InstrumentType;
  buyCurrency: Currency;
  buyAmount: number;
  sellCurrency: Currency;
  sellAmount: number;
  exchangeRate: number;
  valueDate: string;
  cutoffTime: string;
  status: SettlementStatus;
  ssiVerified: boolean;
  nettingEligible: boolean;
  nettingBatchId?: string;
  nostroAccount: string;
  swiftMessageId?: string;
  swiftType: 'pacs.008' | 'pacs.009' | 'MT103' | 'MT202' | 'camt.053';
  priority: 'LOW' | 'NORMAL' | 'HIGH' | 'URGENT';
  failureReason?: string;
  lastUpdated: string;
  approver?: string;
}

export interface NostroPosition {
  currency: Currency;
  bankName: string;
  bic: string;
  accountNumber: string;
  openingBalance: number;
  projectedSettlements: number;
  intradayBalance: number;
  creditLimit: number;
  utilizationPct: number;
  cutoffCountdown: string;
  status: 'OPTIMAL' | 'WARNING' | 'CRITICAL';
}

export interface NettingPoolItem {
  id: string;
  batchCode: string;
  currencyPair: string;
  totalGrossVolume: number;
  netVolume: number;
  settlementSavings: number;
  participantsCount: number;
  transactionsCount: number;
  scheduledCutoff: string;
  status: 'OPEN' | 'CALCULATING' | 'READY_TO_SETTLE' | 'SETTLED';
}

export interface PipelineStageMetric {
  id: number;
  name: string;
  code: SettlementStatus;
  count: number;
  volumeUsd: number;
  slaBreachRisk: number;
  automatedPct: number;
}

// --- Initial Mock Data ---

const INITIAL_TRANSACTIONS: SettlementRecord[] = [
  {
    id: 'SETL-2025-0891',
    dealRef: 'TRD-FX-992104',
    counterparty: 'JPMorgan Chase & Co.',
    counterpartyBic: 'CHASUS33XXX',
    type: 'FX_SPOT',
    buyCurrency: 'USD',
    buyAmount: 14500000,
    sellCurrency: 'EUR',
    sellAmount: 13385600,
    exchangeRate: 1.0832,
    valueDate: '2025-05-18',
    cutoffTime: '16:30 EST',
    status: 'CONFIRMED',
    ssiVerified: true,
    nettingEligible: true,
    nettingBatchId: 'NET-USD-EUR-04',
    nostroAccount: 'NOST-JPMC-NY-01',
    swiftMessageId: 'SW-MSG-8812904',
    swiftType: 'pacs.009',
    priority: 'HIGH',
    lastUpdated: '14:22:10',
    approver: 'A. Vance (Treasury VP)'
  },
  {
    id: 'SETL-2025-0892',
    dealRef: 'TRD-MM-441029',
    counterparty: 'Deutsche Bank AG',
    counterpartyBic: 'DEUTDEDDFXX',
    type: 'MONEY_MARKET',
    buyCurrency: 'EUR',
    buyAmount: 25000000,
    sellCurrency: 'USD',
    sellAmount: 27075000,
    exchangeRate: 1.0830,
    valueDate: '2025-05-18',
    cutoffTime: '16:00 CET',
    status: 'SWIFT_DISPATCHED',
    ssiVerified: true,
    nettingEligible: false,
    nostroAccount: 'NOST-DB-FR-02',
    swiftMessageId: 'SW-MSG-8812955',
    swiftType: 'pacs.009',
    priority: 'URGENT',
    lastUpdated: '14:38:05',
    approver: 'System Automated'
  },
  {
    id: 'SETL-2025-0893',
    dealRef: 'TRD-SWP-109432',
    counterparty: 'BNP Paribas',
    counterpartyBic: 'BNPAFRPPXXX',
    type: 'CROSS_CURRENCY_SWAP',
    buyCurrency: 'GBP',
    buyAmount: 8200000,
    sellCurrency: 'USD',
    sellAmount: 10414000,
    exchangeRate: 1.2700,
    valueDate: '2025-05-18',
    cutoffTime: '15:45 GMT',
    status: 'LIQUIDITY_RESERVED',
    ssiVerified: true,
    nettingEligible: true,
    nettingBatchId: 'NET-GBP-USD-02',
    nostroAccount: 'NOST-BNP-LDN-09',
    swiftType: 'pacs.008',
    priority: 'NORMAL',
    lastUpdated: '14:41:20'
  },
  {
    id: 'SETL-2025-0894',
    dealRef: 'TRD-REPO-881902',
    counterparty: 'Citigroup Global Markets',
    counterpartyBic: 'CITIUS33XXX',
    type: 'TREASURY_REPO',
    buyCurrency: 'USD',
    buyAmount: 50000000,
    sellCurrency: 'USD',
    sellAmount: 50034722,
    exchangeRate: 1.0000,
    valueDate: '2025-05-18',
    cutoffTime: '17:00 EST',
    status: 'SSI_MATCHED',
    ssiVerified: true,
    nettingEligible: false,
    nostroAccount: 'NOST-FED-NY-DIRECT',
    swiftType: 'pacs.009',
    priority: 'URGENT',
    lastUpdated: '14:45:00'
  },
  {
    id: 'SETL-2025-0895',
    dealRef: 'TRD-FX-992155',
    counterparty: 'Barclays Bank UK',
    counterpartyBic: 'BARCGB22XXX',
    type: 'FX_SPOT',
    buyCurrency: 'USD',
    buyAmount: 4100000,
    sellCurrency: 'GBP',
    sellAmount: 3228346,
    exchangeRate: 1.2700,
    valueDate: '2025-05-18',
    cutoffTime: '15:45 GMT',
    status: 'FAILED',
    ssiVerified: false,
    nettingEligible: true,
    nostroAccount: 'NOST-BARC-LDN-01',
    swiftType: 'MT202',
    priority: 'HIGH',
    failureReason: 'SSI Nostro IBAN mismatch; LEI validation alert (LEI: 213800LBQA1Y9L22JB70)',
    lastUpdated: '14:46:12'
  },
  {
    id: 'SETL-2025-0896',
    dealRef: 'TRD-FX-992160',
    counterparty: 'UBS AG Zurich',
    counterpartyBic: 'UBSWCHZHXXX',
    type: 'FX_FORWARD',
    buyCurrency: 'CHF',
    buyAmount: 11800000,
    sellCurrency: 'EUR',
    sellAmount: 12272000,
    exchangeRate: 0.9615,
    valueDate: '2025-05-18',
    cutoffTime: '16:00 CET',
    status: 'INGESTED',
    ssiVerified: false,
    nettingEligible: true,
    nostroAccount: 'NOST-UBS-ZH-04',
    swiftType: 'pacs.008',
    priority: 'NORMAL',
    lastUpdated: '14:47:00'
  },
  {
    id: 'SETL-2025-0897',
    dealRef: 'TRD-FX-992178',
    counterparty: 'Sumitomo Mitsui Banking',
    counterpartyBic: 'SMBCJPJTXXX',
    type: 'FX_SPOT',
    buyCurrency: 'JPY',
    buyAmount: 1600000000,
    sellCurrency: 'USD',
    sellAmount: 10322580,
    exchangeRate: 155.00,
    valueDate: '2025-05-19',
    cutoffTime: '14:00 JST',
    status: 'MANUAL_HOLD',
    ssiVerified: true,
    nettingEligible: false,
    nostroAccount: 'NOST-SMBC-TYO-01',
    swiftType: 'pacs.009',
    priority: 'NORMAL',
    failureReason: 'Pre-advice CLS window threshold hold pending liquidity confirmation',
    lastUpdated: '14:49:50'
  }
];

const INITIAL_NOSTRO: NostroPosition[] = [
  {
    currency: 'USD',
    bankName: 'Federal Reserve / JPMorgan NY',
    bic: 'CHASUS33XXX',
    accountNumber: 'NOST-FED-USD-4401',
    openingBalance: 124500000,
    projectedSettlements: -38250000,
    intradayBalance: 86250000,
    creditLimit: 50000000,
    utilizationPct: 42.5,
    cutoffCountdown: '02h 14m',
    status: 'OPTIMAL'
  },
  {
    currency: 'EUR',
    bankName: 'Deutsche Bundesbank / DB FR',
    bic: 'DEUTDEDDFXX',
    accountNumber: 'NOST-T2S-EUR-8819',
    openingBalance: 78200000,
    projectedSettlements: -65100000,
    intradayBalance: 13100000,
    creditLimit: 30000000,
    utilizationPct: 83.2,
    cutoffCountdown: '01h 45m',
    status: 'WARNING'
  },
  {
    currency: 'GBP',
    bankName: 'Bank of England / Barclays LDN',
    bic: 'BARCGB22XXX',
    accountNumber: 'NOST-CHAPS-GBP-1102',
    openingBalance: 42000000,
    projectedSettlements: -39800000,
    intradayBalance: 2200000,
    creditLimit: 15000000,
    utilizationPct: 94.8,
    cutoffCountdown: '01h 12m',
    status: 'CRITICAL'
  },
  {
    currency: 'JPY',
    bankName: 'Bank of Japan / SMBC Tokyo',
    bic: 'SMBCJPJTXXX',
    accountNumber: 'NOST-BOJ-JPY-9903',
    openingBalance: 4500000000,
    projectedSettlements: 1200000000,
    intradayBalance: 5700000000,
    creditLimit: 2000000000,
    utilizationPct: 18.0,
    cutoffCountdown: '07h 30m',
    status: 'OPTIMAL'
  },
  {
    currency: 'CHF',
    bankName: 'Swiss National Bank / UBS Zurich',
    bic: 'UBSWCHZHXXX',
    accountNumber: 'NOST-SIC-CHF-3301',
    openingBalance: 31000000,
    projectedSettlements: -8400000,
    intradayBalance: 22600000,
    creditLimit: 20000000,
    utilizationPct: 27.0,
    cutoffCountdown: '02h 00m',
    status: 'OPTIMAL'
  }
];

const INITIAL_NETTING_POOLS: NettingPoolItem[] = [
  {
    id: 'POOL-01',
    batchCode: 'NET-USD-EUR-04',
    currencyPair: 'EUR / USD',
    totalGrossVolume: 84500000,
    netVolume: 12300000,
    settlementSavings: 72200000,
    participantsCount: 6,
    transactionsCount: 18,
    scheduledCutoff: '15:15 CET',
    status: 'READY_TO_SETTLE'
  },
  {
    id: 'POOL-02',
    batchCode: 'NET-GBP-USD-02',
    currencyPair: 'GBP / USD',
    totalGrossVolume: 38200000,
    netVolume: 7100000,
    settlementSavings: 31100000,
    participantsCount: 4,
    transactionsCount: 9,
    scheduledCutoff: '15:00 GMT',
    status: 'CALCULATING'
  },
  {
    id: 'POOL-03',
    batchCode: 'NET-USD-JPY-01',
    currencyPair: 'USD / JPY',
    totalGrossVolume: 120000000,
    netVolume: 24000000,
    settlementSavings: 96000000,
    participantsCount: 8,
    transactionsCount: 24,
    scheduledCutoff: '17:00 JST',
    status: 'SETTLED'
  }
];

export const Pipeline05_TreasurySettlement: React.FC = () => {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'MONITOR' | 'LEDGER' | 'NOSTRO' | 'NETTING' | 'SWIFT_INSPECTOR'>('MONITOR');
  
  // Data States
  const [transactions, setTransactions] = useState<SettlementRecord[]>(INITIAL_TRANSACTIONS);
  const [nostroAccounts, setNostroAccounts] = useState<NostroPosition[]>(INITIAL_NOSTRO);
  const [nettingPools, setNettingPools] = useState<NettingPoolItem[]>(INITIAL_NETTING_POOLS);
  
  // Selection & Modal States
  const [selectedTxId, setSelectedTxId] = useState<string | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('ALL');
  const [filterCurrency, setFilterCurrency] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [isSimulatingFeed, setIsSimulatingFeed] = useState<boolean>(false);
  const [selectedRows, setSelectedRows] = useState<string[]>([]);
  const [liquiditySweepModalOpen, setLiquiditySweepModalOpen] = useState<boolean>(false);
  const [sweepDetails, setSweepDetails] = useState<{ ccy: Currency; amount: number }>({ ccy: 'GBP', amount: 5000000 });
  const [notificationToast, setNotificationToast] = useState<{ show: boolean; message: string; type: 'success' | 'warn' | 'info' }>({
    show: false,
    message: '',
    type: 'info'
  });

  // Show temporary toast
  const triggerToast = useCallback((message: string, type: 'success' | 'warn' | 'info' = 'info') => {
    setNotificationToast({ show: true, message, type });
    setTimeout(() => {
      setNotificationToast(prev => ({ ...prev, show: false }));
    }, 4000);
  }, []);

  // Selected Transaction for Inspector
  const activeTx = useMemo(() => {
    return transactions.find(t => t.id === selectedTxId) || transactions[0];
  }, [transactions, selectedTxId]);

  // Stage Metrics calculation
  const stageMetrics: PipelineStageMetric[] = useMemo(() => {
    const stages: { code: SettlementStatus; name: string }[] = [
      { code: 'INGESTED', name: '1. Ingestion' },
      { code: 'SSI_MATCHED', name: '2. SSI Validation' },
      { code: 'NETTED', name: '3. Netting Aggregation' },
      { code: 'LIQUIDITY_RESERVED', name: '4. Liquidity Earmark' },
      { code: 'SWIFT_DISPATCHED', name: '5. RTGS / SWIFT Dispatch' },
      { code: 'CONFIRMED', name: '6. Settlement Finality' }
    ];

    return stages.map((st, idx) => {
      const matchTxs = transactions.filter(t => t.status === st.code);
      const vol = matchTxs.reduce((sum, t) => sum + (t.buyCurrency === 'USD' ? t.buyAmount : t.sellAmount), 0);
      return {
        id: idx + 1,
        name: st.name,
        code: st.code,
        count: matchTxs.length,
        volumeUsd: vol,
        slaBreachRisk: st.code === 'INGESTED' ? 1 : 0,
        automatedPct: 94.5 + idx * 0.8
      };
    });
  }, [transactions]);

  // Filtered Ledger Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(item => {
      const matchStatus = filterStatus === 'ALL' || item.status === filterStatus;
      const matchCcy = filterCurrency === 'ALL' || item.buyCurrency === filterCurrency || item.sellCurrency === filterCurrency;
      const matchText = 
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.dealRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.counterparty.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.counterpartyBic.toLowerCase().includes(searchQuery.toLowerCase());
      return matchStatus && matchCcy && matchText;
    });
  }, [transactions, filterStatus, filterCurrency, searchQuery]);

  // KPI Computations
  const totalVolumeUSD = useMemo(() => {
    return transactions.reduce((acc, curr) => {
      return acc + (curr.buyCurrency === 'USD' ? curr.buyAmount : curr.sellAmount);
    }, 0);
  }, [transactions]);

  const settledRate = useMemo(() => {
    const confirmedCount = transactions.filter(t => t.status === 'CONFIRMED').length;
    return transactions.length > 0 ? Math.round((confirmedCount / transactions.length) * 100) : 0;
  }, [transactions]);

  const failedCount = useMemo(() => {
    return transactions.filter(t => t.status === 'FAILED' || t.status === 'MANUAL_HOLD').length;
  }, [transactions]);

  // Execution Handlers
  const handleAdvanceStage = useCallback((txId: string) => {
    const stageOrder: SettlementStatus[] = [
      'INGESTED',
      'SSI_MATCHED',
      'NETTED',
      'LIQUIDITY_RESERVED',
      'SWIFT_DISPATCHED',
      'CONFIRMED'
    ];

    setTransactions(prev => prev.map(item => {
      if (item.id !== txId) return item;
      const currentIndex = stageOrder.indexOf(item.status);
      if (currentIndex === -1 || currentIndex === stageOrder.length - 1) return item;
      const nextStatus = stageOrder[currentIndex + 1];
      
      return {
        ...item,
        status: nextStatus,
        lastUpdated: new Date().toTimeString().split(' ')[0],
        swiftMessageId: nextStatus === 'SWIFT_DISPATCHED' ? `SW-MSG-${Math.floor(1000000 + Math.random() * 9000000)}` : item.swiftMessageId,
        approver: nextStatus === 'CONFIRMED' ? 'Auto-CLS Finality Agent' : item.approver
      };
    }));

    triggerToast(`Settlement item ${txId} transitioned to next workflow phase.`, 'success');
  }, [triggerToast]);

  const handleResolveFailure = (txId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id !== txId) return t;
      return {
        ...t,
        status: 'SSI_MATCHED',
        ssiVerified: true,
        failureReason: undefined,
        lastUpdated: new Date().toTimeString().split(' ')[0],
        approver: 'Treasury Admin (Override)'
      };
    }));
    triggerToast(`Exception for ${txId} overridden. Re-entering pipeline.`, 'info');
  };

  const handleReleaseHold = (txId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id !== txId) return t;
      return {
        ...t,
        status: 'LIQUIDITY_RESERVED',
        failureReason: undefined,
        lastUpdated: new Date().toTimeString().split(' ')[0],
        approver: 'CLS Desk Manager'
      };
    }));
    triggerToast(`Manual hold on ${txId} released. Liquidity committed.`, 'success');
  };

  const handleExecuteBatchNetting = (poolId: string) => {
    setNettingPools(prev => prev.map(p => {
      if (p.id !== poolId) return p;
      return { ...p, status: 'SETTLED' };
    }));

    setTransactions(prev => prev.map(t => {
      if (t.nettingBatchId && nettingPools.find(p => p.id === poolId)?.batchCode === t.nettingBatchId) {
        return {
          ...t,
          status: 'SWIFT_DISPATCHED',
          swiftMessageId: `SW-NET-${Math.floor(100000 + Math.random() * 900000)}`,
          lastUpdated: new Date().toTimeString().split(' ')[0]
        };
      }
      return t;
    }));

    triggerToast(`Multilateral Netting Batch ${poolId} executed. Savings locked.`, 'success');
  };

  const handleInjectLiquiditySweep = () => {
    setNostroAccounts(prev => prev.map(acc => {
      if (acc.currency === sweepDetails.ccy) {
        const newIntra = acc.intradayBalance + sweepDetails.amount;
        const newUtil = Math.max(0, 100 - (newIntra / (acc.openingBalance || 1)) * 100);
        return {
          ...acc,
          intradayBalance: newIntra,
          utilizationPct: Math.round(newUtil * 10) / 10,
          status: newUtil > 90 ? 'CRITICAL' : newUtil > 75 ? 'WARNING' : 'OPTIMAL'
        };
      }
      return acc;
    }));
    setLiquiditySweepModalOpen(false);
    triggerToast(`Liquidity sweep of ${sweepDetails.ccy} ${sweepDetails.amount.toLocaleString()} executed successfully.`, 'success');
  };

  // Simulating Live Market and Pipeline Pulse
  useEffect(() => {
    if (!isSimulatingFeed) return;
    const interval = setInterval(() => {
      setTransactions(prev => {
        // randomly pick an ingested or matched item and advance it
        const eligible = prev.filter(t => t.status === 'INGESTED' || t.status === 'SSI_MATCHED');
        if (eligible.length === 0) return prev;
        const target = eligible[Math.floor(Math.random() * eligible.length)];
        return prev.map(t => {
          if (t.id === target.id) {
            const nextSt: SettlementStatus = t.status === 'INGESTED' ? 'SSI_MATCHED' : 'LIQUIDITY_RESERVED';
            return {
              ...t,
              status: nextSt,
              ssiVerified: true,
              lastUpdated: new Date().toTimeString().split(' ')[0]
            };
          }
          return t;
        });
      });
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatingFeed]);

  // Bulk actions
  const toggleSelectAll = () => {
    if (selectedRows.length === filteredTransactions.length) {
      setSelectedRows([]);
    } else {
      setSelectedRows(filteredTransactions.map(t => t.id));
    }
  };

  const toggleSelectRow = (id: string) => {
    setSelectedRows(prev => 
      prev.includes(id) ? prev.filter(r => r !== id) : [...prev, id]
    );
  };

  const handleBulkDispatch = () => {
    setTransactions(prev => prev.map(t => {
      if (selectedRows.includes(t.id) && t.status !== 'CONFIRMED' && t.status !== 'FAILED') {
        return {
          ...t,
          status: 'SWIFT_DISPATCHED',
          swiftMessageId: `SW-BULK-${Math.floor(100000 + Math.random() * 900000)}`,
          lastUpdated: new Date().toTimeString().split(' ')[0]
        };
      }
      return t;
    }));
    triggerToast(`Bulk dispatched ${selectedRows.length} settlements to SWIFT RTGS gateway.`, 'success');
    setSelectedRows([]);
  };

  // ISO 20022 XML Generator helper
  const generateIsoXmlPayload = (tx: SettlementRecord) => {
    return `<?xml version="1.0" encoding="UTF-8"?>
<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.009.001.08">
  <FICdtTrf>
    <GrpHdr>
      <MsgId>${tx.swiftMessageId || 'PENDING-GEN-001'}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf>
        <SttlmMtd>CLRG</SttlmMtd>
        <ClrSys>
          <Prtry>FEDWIRE_TARGET2_CLS</Prtry>
        </ClrSys>
      </SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId>
        <EndToEndId>${tx.dealRef}</EndToEndId>
        <UETR>c01a2f90-128b-4c22-811c-${tx.id.replace('SETL-', '')}</UETR>
      </PmtId>
      <IntrBkSttlmAmt Ccy="${tx.buyCurrency}">${tx.buyAmount.toFixed(2)}</IntrBkSttlmAmt>
      <IntrBkSttlmDt>${tx.valueDate}</IntrBkSttlmDt>
      <Dbtr>
        <FinInstnId>
          <BICFI>GLOBALTRSYXXXX</BICFI>
          <Nm>Global Treasury Corp Principal</Nm>
        </FinInstnId>
      </Dbtr>
      <DbtrAcct>
        <Id><Othr><Id>${tx.nostroAccount}</Id></Othr></Id>
      </DbtrAcct>
      <Cdtr>
        <FinInstnId>
          <BICFI>${tx.counterpartyBic}</BICFI>
          <Nm>${tx.counterparty}</Nm>
        </FinInstnId>
      </Cdtr>
      <InstrForCdtrAgt>
        <InstrInf>/BNF/ TREASURY SETTLEMENT VALUE ${tx.valueDate} CUTOFF ${tx.cutoffTime}</InstrInf>
      </InstrForCdtrAgt>
    </CdtTrfTxInf>
  </FICdtTrf>
</Document>`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 lg:p-6 select-none">
      {/* Toast Notification */}
      {notificationToast.show && (
        <div className={`fixed top-4 right-4 z-50 flex items-center gap-3 px-4 py-3 rounded-lg shadow-2xl border backdrop-blur-md transition-all duration-300 ${
          notificationToast.type === 'success' 
            ? 'bg-emerald-950/90 border-emerald-500/50 text-emerald-200' 
            : notificationToast.type === 'warn'
            ? 'bg-amber-950/90 border-amber-500/50 text-amber-200'
            : 'bg-indigo-950/90 border-indigo-500/50 text-indigo-200'
        }`}>
          {notificationToast.type === 'success' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
          {notificationToast.type === 'warn' && <AlertTriangle className="w-5 h-5 text-amber-400" />}
          {notificationToast.type === 'info' && <Activity className="w-5 h-5 text-indigo-400" />}
          <span className="text-sm font-medium">{notificationToast.message}</span>
        </div>
      )}

      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 pb-5 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-600 to-cyan-600 rounded-xl shadow-lg shadow-indigo-500/20 border border-indigo-400/30">
              <Landmark className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                  Pipeline 05 : Treasury Settlement & Liquidity Engine
                </h1>
                <span className="text-[11px] font-semibold bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  CLS / RTGS Tier 1
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Real-time FX & Money Market settlement orchestrator, multilateral netting engine & SWIFT ISO 20022 gateway.
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center flex-wrap gap-2.5">
            <button
              onClick={() => setIsSimulatingFeed(!isSimulatingFeed)}
              className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSimulatingFeed
                  ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 animate-pulse'
                  : 'bg-slate-900 hover:bg-slate-800 text-slate-300 border-slate-700'
              }`}
            >
              <Zap className="w-3.5 h-3.5" />
              {isSimulatingFeed ? 'Simulation Active' : 'Simulate Feed'}
            </button>

            <button
              onClick={() => setLiquiditySweepModalOpen(true)}
              className="flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white shadow-md shadow-indigo-600/30 border border-indigo-400/40 transition-all"
            >
              <ArrowRightLeft className="w-3.5 h-3.5" />
              Inter-Nostro Sweep
            </button>

            <div className="h-6 w-px bg-slate-800 mx-1 hidden sm:block" />

            <div className="flex items-center bg-slate-900 border border-slate-800 rounded-lg p-1">
              <button
                onClick={() => setActiveTab('MONITOR')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'MONITOR' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Pipeline Monitor
              </button>
              <button
                onClick={() => setActiveTab('LEDGER')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'LEDGER' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Settlement Ledger
              </button>
              <button
                onClick={() => setActiveTab('NOSTRO')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'NOSTRO' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Nostro Cash Positions
              </button>
              <button
                onClick={() => setActiveTab('NETTING')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'NETTING' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Netting Engine
              </button>
              <button
                onClick={() => setActiveTab('SWIFT_INSPECTOR')}
                className={`px-3 py-1 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'SWIFT_INSPECTOR' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ISO 20022 XML
              </button>
            </div>
          </div>
        </div>

        {/* Global Pipeline Health Status Ribbon */}
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-5 gap-3 mt-5">
          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">Total Intraday Turnover</div>
            <div className="text-lg font-bold text-white mt-1">
              ${(totalVolumeUSD / 1000000).toFixed(2)}M
            </div>
            <div className="flex items-center text-[10px] text-emerald-400 mt-1 gap-1">
              <TrendingUp className="w-3 h-3" /> +14.2% vs yesterday
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">Settlement Finality Rate</div>
            <div className="text-lg font-bold text-white mt-1">{settledRate}%</div>
            <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
              <div className="bg-emerald-500 h-full rounded-full transition-all duration-500" style={{ width: `${settledRate}%` }} />
            </div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">Exceptions & Holds</div>
            <div className="flex items-center justify-between mt-1">
              <div className="text-lg font-bold text-amber-300">{failedCount} Item(s)</div>
              {failedCount > 0 && (
                <span className="flex h-2 w-2 relative">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
                </span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Action required before cut-off</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3">
            <div className="text-[11px] text-slate-400 font-medium">Netting Efficiency</div>
            <div className="text-lg font-bold text-cyan-300">76.8%</div>
            <div className="text-[10px] text-cyan-400/80 mt-1">$199.3M liquidity saved</div>
          </div>

          <div className="bg-slate-900/70 border border-slate-800 rounded-xl p-3 col-span-2 sm:col-span-4 lg:col-span-1">
            <div className="text-[11px] text-slate-400 font-medium">CLS Primary Window</div>
            <div className="text-lg font-bold text-indigo-300 flex items-center gap-1.5 mt-1">
              <Clock className="w-4 h-4 text-indigo-400 animate-spin" style={{ animationDuration: '8s' }} />
              01h 22m 18s
            </div>
            <div className="text-[10px] text-slate-400 mt-1">Target2 / Fedwire connected</div>
          </div>
        </div>
      </header>

      {/* Main View Area */}
      <main>
        {/* VIEW 1: PIPELINE MONITOR (Visual Stages) */}
        {activeTab === 'MONITOR' && (
          <div className="space-y-6">
            {/* Visual Workflow Stage Progression */}
            <div className="bg-slate-900/90 border border-slate-800/80 rounded-2xl p-5 shadow-xl backdrop-blur-md">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white tracking-wide uppercase">
                    Straight-Through Processing (STP) Pipeline Stages
                  </h2>
                </div>
                <span className="text-xs text-slate-400">Total Active Batches: 7 | SLA Guard: ACTIVE</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-3">
                {stageMetrics.map((st, index) => {
                  return (
                    <div 
                      key={st.id} 
                      className="relative bg-slate-950/80 border border-slate-800/90 hover:border-indigo-500/40 rounded-xl p-4 transition-all duration-200 flex flex-col justify-between group"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-xs font-bold text-slate-300">Stage {st.id}</span>
                        <span className="text-[10px] px-2 py-0.5 rounded-full bg-slate-800 text-indigo-300 font-medium">
                          {st.automatedPct}% Auto
                        </span>
                      </div>
                      
                      <div className="text-xs font-semibold text-slate-200 mb-1">{st.name.replace(/^\d+\.\s*/, '')}</div>
                      
                      <div className="mt-2 flex items-baseline justify-between">
                        <div className="text-xl font-bold text-white">{st.count}</div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ${(st.volumeUsd / 1000000).toFixed(1)}M
                        </div>
                      </div>

                      <div className="mt-3 pt-2 border-t border-slate-800/60 flex items-center justify-between text-[10px]">
                        <span className="text-slate-400">Status</span>
                        <span className="text-emerald-400 font-medium flex items-center gap-1">
                          <CheckCircle2 className="w-3 h-3" /> Nominal
                        </span>
                      </div>
                      
                      {index < 5 && (
                        <div className="hidden lg:block absolute -right-2 top-1/2 -translate-y-1/2 z-10 text-slate-600 group-hover:text-indigo-400 transition-colors pointer-events-none">
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Quick Actions & Live Processing Queue */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Queue List */}
              <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    In-Flight Settlement Queue
                  </h3>
                  <div className="text-xs text-slate-400 font-mono">Showing {transactions.length} instructions</div>
                </div>

                <div className="space-y-2.5 max-h-[480px] overflow-y-auto pr-1">
                  {transactions.map(item => (
                    <div 
                      key={item.id}
                      onClick={() => setSelectedTxId(item.id)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                        selectedTxId === item.id 
                          ? 'bg-indigo-950/40 border-indigo-500/60 shadow-md shadow-indigo-950' 
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-900/60'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          item.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-400' :
                          item.status === 'FAILED' ? 'bg-rose-500/20 text-rose-400' :
                          item.status === 'MANUAL_HOLD' ? 'bg-amber-500/20 text-amber-400' :
                          'bg-indigo-500/20 text-indigo-400'
                        }`}>
                          {item.type === 'FX_SPOT' || item.type === 'FX_FORWARD' ? <ArrowRightLeft className="w-4 h-4" /> : <DollarSign className="w-4 h-4" />}
                        </div>

                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-white">{item.id}</span>
                            <span className="text-[10px] text-slate-400 font-mono">({item.dealRef})</span>
                            <span className={`text-[9px] px-1.5 py-0.5 rounded font-semibold uppercase ${
                              item.priority === 'URGENT' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                              item.priority === 'HIGH' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                              'bg-slate-800 text-slate-300'
                            }`}>
                              {item.priority}
                            </span>
                          </div>
                          
                          <div className="text-xs text-slate-300 mt-1 font-medium">
                            {item.counterparty} <span className="text-[11px] text-slate-500 font-mono">[{item.counterpartyBic}]</span>
                          </div>

                          <div className="flex items-center gap-3 text-[11px] text-slate-400 mt-1 font-mono">
                            <span>Buy: <strong className="text-emerald-400">{item.buyCurrency} {item.buyAmount.toLocaleString()}</strong></span>
                            <span>•</span>
                            <span>Sell: <strong className="text-slate-300">{item.sellCurrency} {item.sellAmount.toLocaleString()}</strong></span>
                          </div>
                        </div>
                      </div>

                      {/* Right actions / status badge */}
                      <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 border-t sm:border-t-0 pt-2 sm:pt-0 border-slate-800">
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          item.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          item.status === 'FAILED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                          item.status === 'MANUAL_HOLD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                        }`}>
                          {item.status.replace('_', ' ')}
                        </span>

                        <div className="flex items-center gap-1.5">
                          {item.status === 'FAILED' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleResolveFailure(item.id); }}
                              className="px-2 py-1 text-[10px] font-medium bg-rose-600 hover:bg-rose-500 text-white rounded transition"
                            >
                              Resolve SSI
                            </button>
                          ) : item.status === 'MANUAL_HOLD' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleReleaseHold(item.id); }}
                              className="px-2 py-1 text-[10px] font-medium bg-amber-600 hover:bg-amber-500 text-white rounded transition"
                            >
                              Release Hold
                            </button>
                          ) : item.status !== 'CONFIRMED' ? (
                            <button
                              onClick={(e) => { e.stopPropagation(); handleAdvanceStage(item.id); }}
                              className="px-2 py-1 text-[10px] font-medium bg-slate-800 hover:bg-indigo-600 text-slate-200 hover:text-white rounded border border-slate-700 transition flex items-center gap-1"
                            >
                              <Play className="w-2.5 h-2.5" /> Progress
                            </button>
                          ) : (
                            <span className="text-[10px] text-emerald-400 flex items-center gap-0.5">
                              <CheckCircle2 className="w-3 h-3" /> Settled
                            </span>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Right Side: Selected Inspection Card */}
              <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl flex flex-col justify-between">
                <div>
                  <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-4">
                    <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-indigo-400" />
                      Instruction Inspector
                    </h3>
                    <span className="text-xs font-mono text-indigo-400">{activeTx.id}</span>
                  </div>

                  {activeTx.failureReason && (
                    <div className="mb-4 p-3 bg-rose-950/60 border border-rose-500/50 rounded-xl text-xs text-rose-300 flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 shrink-0 text-rose-400 mt-0.5" />
                      <div>
                        <div className="font-semibold text-rose-200">Execution Alert</div>
                        <div className="mt-0.5 text-[11px] leading-relaxed">{activeTx.failureReason}</div>
                      </div>
                    </div>
                  )}

                  <div className="space-y-3 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Deal Reference</span>
                      <span className="text-slate-200 font-mono font-medium">{activeTx.dealRef}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Instrument Type</span>
                      <span className="text-indigo-300 font-medium">{activeTx.type.replace(/_/g, ' ')}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Counterparty</span>
                      <span className="text-slate-200 font-medium">{activeTx.counterparty}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Counterparty BIC</span>
                      <span className="text-slate-300 font-mono">{activeTx.counterpartyBic}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Nostro Account</span>
                      <span className="text-slate-200 font-mono">{activeTx.nostroAccount}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Exchange Rate</span>
                      <span className="text-slate-200 font-mono">{activeTx.exchangeRate.toFixed(4)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Value Date / Cutoff</span>
                      <span className="text-slate-200 font-mono">{activeTx.valueDate} ({activeTx.cutoffTime})</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">SWIFT Message Type</span>
                      <span className="text-cyan-400 font-mono font-medium">{activeTx.swiftType}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-400">Sign-off Approver</span>
                      <span className="text-slate-300">{activeTx.approver || 'Pending System Approval'}</span>
                    </div>
                  </div>
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 space-y-2">
                  <button
                    onClick={() => {
                      setActiveTab('SWIFT_INSPECTOR');
                    }}
                    className="w-full py-2 bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition"
                  >
                    <FileCode className="w-3.5 h-3.5" /> View ISO 20022 XML Payload
                  </button>
                  <button
                    onClick={() => triggerToast(`Audit log exported for ${activeTx.id}`, 'info')}
                    className="w-full py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium flex items-center justify-center gap-2 transition"
                  >
                    <Download className="w-3.5 h-3.5" /> Export Audit Trail
                  </button>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* VIEW 2: SETTLEMENT LEDGER (Data Grid with Search & Filters) */}
        {activeTab === 'LEDGER' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              {/* Search Bar */}
              <div className="relative flex-1 max-w-md">
                <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search deal ref, counterparty, BIC, ID..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {/* Filters & Actions */}
              <div className="flex items-center gap-2 flex-wrap">
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="INGESTED">Ingested</option>
                  <option value="SSI_MATCHED">SSI Matched</option>
                  <option value="LIQUIDITY_RESERVED">Liquidity Reserved</option>
                  <option value="SWIFT_DISPATCHED">SWIFT Dispatched</option>
                  <option value="CONFIRMED">Confirmed</option>
                  <option value="FAILED">Failed</option>
                  <option value="MANUAL_HOLD">Manual Hold</option>
                </select>

                <select
                  value={filterCurrency}
                  onChange={(e) => setFilterCurrency(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-300 text-xs rounded-xl px-3 py-2 focus:outline-none focus:border-indigo-500"
                >
                  <option value="ALL">All Currencies</option>
                  <option value="USD">USD</option>
                  <option value="EUR">EUR</option>
                  <option value="GBP">GBP</option>
                  <option value="JPY">JPY</option>
                  <option value="CHF">CHF</option>
                </select>

                {selectedRows.length > 0 && (
                  <button
                    onClick={handleBulkDispatch}
                    className="flex items-center gap-1.5 px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30 transition"
                  >
                    <Send className="w-3.5 h-3.5" /> Dispatch Selected ({selectedRows.length})
                  </button>
                )}
              </div>
            </div>

            {/* Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 font-semibold uppercase text-[10px] tracking-wider">
                    <th className="p-3 w-10 text-center">
                      <button onClick={toggleSelectAll} className="text-slate-400 hover:text-white">
                        {selectedRows.length === filteredTransactions.length && filteredTransactions.length > 0 ? (
                          <CheckSquare className="w-4 h-4 text-indigo-400" />
                        ) : (
                          <Square className="w-4 h-4" />
                        )}
                      </button>
                    </th>
                    <th className="p-3">Instruction ID / Deal</th>
                    <th className="p-3">Counterparty</th>
                    <th className="p-3">Instrument</th>
                    <th className="p-3">Buy Leg</th>
                    <th className="p-3">Sell Leg</th>
                    <th className="p-3">Rate</th>
                    <th className="p-3">Value Date / Cutoff</th>
                    <th className="p-3">Status</th>
                    <th className="p-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredTransactions.map((tx) => {
                    const isSelected = selectedRows.includes(tx.id);
                    return (
                      <tr 
                        key={tx.id} 
                        className={`hover:bg-slate-800/40 transition-colors ${
                          isSelected ? 'bg-indigo-950/20' : ''
                        }`}
                      >
                        <td className="p-3 text-center">
                          <button onClick={() => toggleSelectRow(tx.id)} className="text-slate-400 hover:text-white">
                            {isSelected ? <CheckSquare className="w-4 h-4 text-indigo-400" /> : <Square className="w-4 h-4" />}
                          </button>
                        </td>
                        <td className="p-3">
                          <div className="font-bold text-white">{tx.id}</div>
                          <div className="text-[10px] text-slate-500">{tx.dealRef}</div>
                        </td>
                        <td className="p-3 font-sans">
                          <div className="font-medium text-slate-200">{tx.counterparty}</div>
                          <div className="text-[10px] text-slate-500 font-mono">{tx.counterpartyBic}</div>
                        </td>
                        <td className="p-3 font-sans">
                          <span className="px-2 py-0.5 rounded bg-slate-800 text-slate-300 text-[10px]">
                            {tx.type.replace(/_/g, ' ')}
                          </span>
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-emerald-400">{tx.buyCurrency}</span> {tx.buyAmount.toLocaleString()}
                        </td>
                        <td className="p-3">
                          <span className="font-bold text-slate-400">{tx.sellCurrency}</span> {tx.sellAmount.toLocaleString()}
                        </td>
                        <td className="p-3 text-slate-300">
                          {tx.exchangeRate.toFixed(4)}
                        </td>
                        <td className="p-3">
                          <div className="text-slate-300">{tx.valueDate}</div>
                          <div className="text-[10px] text-slate-500">{tx.cutoffTime}</div>
                        </td>
                        <td className="p-3 font-sans">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                            tx.status === 'CONFIRMED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                            tx.status === 'FAILED' ? 'bg-rose-500/20 text-rose-300 border border-rose-500/40' :
                            tx.status === 'MANUAL_HOLD' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                            'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40'
                          }`}>
                            {tx.status.replace('_', ' ')}
                          </span>
                        </td>
                        <td className="p-3 text-right font-sans">
                          <button
                            onClick={() => {
                              setSelectedTxId(tx.id);
                              setActiveTab('MONITOR');
                            }}
                            className="p-1.5 text-slate-400 hover:text-indigo-400 hover:bg-indigo-950/60 rounded-lg transition"
                            title="Inspect in Pipeline"
                          >
                            <Eye className="w-4 h-4" />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* VIEW 3: NOSTRO CASH POSITIONS */}
        {activeTab === 'NOSTRO' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <Landmark className="w-4 h-4 text-indigo-400" />
                  Real-time Multi-Currency Nostro Liquidity
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Intraday balances tracked against central bank RTGS limits and CLS pay-in windows.
                </p>
              </div>
              <button
                onClick={() => setLiquiditySweepModalOpen(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold flex items-center gap-2 shadow-md shadow-indigo-600/30 transition"
              >
                <ArrowRightLeft className="w-4 h-4" /> Execute Balancing Sweep
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
              {nostroAccounts.map((nostro) => {
                return (
                  <div 
                    key={nostro.currency}
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 shadow-lg flex flex-col justify-between"
                  >
                    <div>
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2.5">
                          <span className="text-lg font-black text-white px-2.5 py-1 rounded-lg bg-slate-800 border border-slate-700">
                            {nostro.currency}
                          </span>
                          <div>
                            <div className="text-xs font-bold text-slate-200">{nostro.bankName}</div>
                            <div className="text-[10px] text-slate-500 font-mono">{nostro.bic}</div>
                          </div>
                        </div>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          nostro.status === 'OPTIMAL' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          nostro.status === 'WARNING' ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40' :
                          'bg-rose-500/20 text-rose-300 border border-rose-500/40'
                        }`}>
                          {nostro.status}
                        </span>
                      </div>

                      <div className="mt-5 space-y-2.5 text-xs">
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Account Ref</span>
                          <span className="text-slate-300 font-mono">{nostro.accountNumber}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Opening Balance</span>
                          <span className="text-slate-300 font-mono">{nostro.openingBalance.toLocaleString()} {nostro.currency}</span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Projected In/Outflow</span>
                          <span className={`font-mono font-medium ${
                            nostro.projectedSettlements >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}>
                            {nostro.projectedSettlements >= 0 ? '+' : ''}{nostro.projectedSettlements.toLocaleString()} {nostro.currency}
                          </span>
                        </div>
                        <div className="flex justify-between py-1 border-b border-slate-800">
                          <span className="text-slate-400">Live Intraday Balance</span>
                          <span className="text-white font-bold font-mono text-sm">
                            {nostro.intradayBalance.toLocaleString()} {nostro.currency}
                          </span>
                        </div>
                      </div>

                      <div className="mt-4">
                        <div className="flex justify-between text-[11px] text-slate-400 mb-1">
                          <span>Credit Buffer Utilization</span>
                          <span className="font-mono text-slate-200">{nostro.utilizationPct}%</span>
                        </div>
                        <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                          <div 
                            className={`h-full rounded-full transition-all duration-500 ${
                              nostro.utilizationPct > 85 ? 'bg-rose-500' :
                              nostro.utilizationPct > 70 ? 'bg-amber-500' :
                              'bg-indigo-500'
                            }`}
                            style={{ width: `${Math.min(nostro.utilizationPct, 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-5 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs">
                      <div className="flex items-center gap-1.5 text-slate-400">
                        <Clock className="w-3.5 h-3.5 text-indigo-400" /> Cut-off in: <span className="text-indigo-300 font-mono">{nostro.cutoffCountdown}</span>
                      </div>
                      <button 
                        onClick={() => {
                          setSweepDetails({ ccy: nostro.currency, amount: 2000000 });
                          setLiquiditySweepModalOpen(true);
                        }}
                        className="text-indigo-400 hover:text-indigo-300 text-xs font-semibold flex items-center gap-1"
                      >
                        Top-up <ChevronRight className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* VIEW 4: NETTING ENGINE & CLEARING */}
        {activeTab === 'NETTING' && (
          <div className="space-y-6">
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
                <div>
                  <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-cyan-400" />
                    Multilateral Netting Cycles & Compression
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Continuous bilateral and multilateral netting matrices reducing gross liquidity obligations.
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <div className="text-right">
                    <div className="text-xs text-slate-400">Aggregate Netting Savings</div>
                    <div className="text-base font-bold text-emerald-400 font-mono">$199,300,000</div>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                {nettingPools.map((pool) => (
                  <div key={pool.id} className="bg-slate-950/90 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between border-b border-slate-800/80 pb-2.5">
                        <span className="text-xs font-bold text-white font-mono">{pool.batchCode}</span>
                        <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${
                          pool.status === 'SETTLED' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' :
                          pool.status === 'READY_TO_SETTLE' ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/40' :
                          'bg-amber-500/20 text-amber-300 border border-amber-500/40'
                        }`}>
                          {pool.status.replace(/_/g, ' ')}
                        </span>
                      </div>

                      <div className="mt-3 space-y-2 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Currency Pair</span>
                          <span className="font-bold text-indigo-300">{pool.currencyPair}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Gross Obligation</span>
                          <span className="text-slate-300 font-mono">${(pool.totalGrossVolume / 1000000).toFixed(2)}M</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Net Settled Requirement</span>
                          <span className="text-white font-bold font-mono">${(pool.netVolume / 1000000).toFixed(2)}M</span>
                        </div>
                        <div className="flex justify-between text-emerald-400">
                          <span>Capital Freed (Savings)</span>
                          <span className="font-bold font-mono">${(pool.settlementSavings / 1000000).toFixed(2)}M</span>
                        </div>
                        <div className="flex justify-between text-slate-400 text-[11px]">
                          <span>Participants / Trades</span>
                          <span>{pool.participantsCount} banks / {pool.transactionsCount} txs</span>
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800">
                      {pool.status === 'SETTLED' ? (
                        <div className="w-full py-1.5 bg-emerald-950/40 border border-emerald-500/30 rounded-lg text-center text-xs text-emerald-300 font-medium flex items-center justify-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5" /> Settled & Reconciled
                        </div>
                      ) : (
                        <button
                          onClick={() => handleExecuteBatchNetting(pool.id)}
                          className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold flex items-center justify-center gap-1.5 transition shadow"
                        >
                          <Play className="w-3 h-3" /> Settle Net Position
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}

        {/* VIEW 5: ISO 20022 XML INSPECTOR */}
        {activeTab === 'SWIFT_INSPECTOR' && (
          <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 shadow-xl space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-slate-800">
              <div>
                <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                  <FileCode className="w-4 h-4 text-cyan-400" />
                  ISO 20022 Financial Messaging Engine (MX / pacs.009)
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Schema-validated payment XML payload for instruction <strong className="text-indigo-300">{activeTx.id}</strong>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => {
                    navigator.clipboard.writeText(generateIsoXmlPayload(activeTx));
                    triggerToast('ISO 20022 XML copied to clipboard', 'info');
                  }}
                  className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium flex items-center gap-1.5 transition"
                >
                  <FileText className="w-3.5 h-3.5" /> Copy Payload
                </button>
                <button
                  onClick={() => triggerToast(`Validating pacs.009 schema against ISO 20022 CBPR+ specifications... ALL CHECKS PASSED`, 'success')}
                  className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition"
                >
                  <ShieldCheck className="w-3.5 h-3.5" /> Validate Schema
                </button>
              </div>
            </div>

            <div className="relative bg-slate-950 border border-slate-800 rounded-xl p-4 overflow-x-auto font-mono text-xs text-indigo-200 max-h-[500px]">
              <pre className="whitespace-pre">{generateIsoXmlPayload(activeTx)}</pre>
            </div>
          </div>
        )}
      </main>

      {/* MODAL: INTER-NOSTRO LIQUIDITY SWEEP */}
      {liquiditySweepModalOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-md p-5 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <ArrowRightLeft className="w-4 h-4 text-indigo-400" />
                Inter-Nostro Liquidity Sweep
              </h3>
              <button 
                onClick={() => setLiquiditySweepModalOpen(false)}
                className="text-slate-400 hover:text-white"
              >
                <XCircle className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Destination Currency Account</label>
                <select
                  value={sweepDetails.ccy}
                  onChange={(e) => setSweepDetails(prev => ({ ...prev, ccy: e.target.value as Currency }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-medium focus:outline-none focus:border-indigo-500"
                >
                  <option value="USD">USD - Fedwire / JPMorgan NY</option>
                  <option value="EUR">EUR - Target2 / Deutsche Bank FR</option>
                  <option value="GBP">GBP - CHAPS / Barclays LDN</option>
                  <option value="JPY">JPY - BOJ-NET / SMBC Tokyo</option>
                  <option value="CHF">CHF - SIC / UBS Zurich</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Injection Amount</label>
                <input
                  type="number"
                  value={sweepDetails.amount}
                  onChange={(e) => setSweepDetails(prev => ({ ...prev, amount: Number(e.target.value) }))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div className="p-3 bg-indigo-950/40 border border-indigo-500/30 rounded-xl text-indigo-300 text-[11px] leading-relaxed">
                Sweeps are routed via automated intra-group repo facility. Settlement will reflect on the target central bank account within 30 seconds.
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setLiquiditySweepModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl text-xs font-medium"
              >
                Cancel
              </button>
              <button
                onClick={handleInjectLiquiditySweep}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-semibold shadow-md shadow-indigo-600/30"
              >
                Confirm & Dispatch Sweep
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Pipeline05_TreasurySettlement;