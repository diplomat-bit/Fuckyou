import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Search,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  Building2,
  DollarSign,
  TrendingUp,
  FileCheck,
  Lock,
  ExternalLink,
  ChevronRight,
  Sparkles,
  GitCommit,
  Sliders,
  Scale,
  History,
  Workflow
} from 'lucide-react';

interface CounterpartyMetadata {
  id: string;
  name: string;
  lei: string;
  routingNumber: string;
  accountNumberMasked: string;
  bankName: string;
  swiftBic: string;
  verificationTier: 'CITI_PRIVATE_TIER_1' | 'INSTITUTIONAL_ULTRA' | 'SOVEREIGN_GRADE';
  riskScore: number;
}

interface ModernTreasuryPaymentOrder {
  id: string;
  type: 'ach' | 'wire' | 'rtp' | 'book' | 'fednow';
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'SGD';
  direction: 'credit' | 'debit';
  status: 'pending' | 'posted' | 'processing' | 'failed' | 'returned';
  createdAt: string;
  counterparty: CounterpartyMetadata;
  referenceNumbers: {
    vendorReference: string;
    imad?: string;
    omad?: string;
    citiTraceId: string;
  };
  ledgerEntryId: string;
  metadata: {
    costCenter: string;
    dealId: string;
    aiDisputeProtected: boolean;
  };
}

interface CitiSettlementRecord {
  transactionId: string;
  citiReference: string;
  fedWireTrackingId: string;
  valueDate: string;
  settledAmount: number;
  nominalFee: number;
  clearingSystem: 'FEDWIRE' | 'CHIPS' | 'CITI_INTERNAL_BOOK' | 'TARGET2';
  citiAccountNode: string;
  hashProof: string;
}

interface ReconciliationItem {
  id: string;
  modernTreasuryOrder: ModernTreasuryPaymentOrder;
  citiRecord?: CitiSettlementRecord;
  expectedPaymentId?: string;
  matchScore: number;
  discrepancyDelta: number;
  status: 'RECONCILED_PERFECT' | 'AUTO_RESOLVED_AI' | 'DISCREPANCY_FLAGGED' | 'IN_TRANSIT' | 'LEDGER_DESYNC';
  aiAnalysis: {
    confidence: number;
    explanation: string;
    recommendedAction: string;
    autoHealed: boolean;
  };
  ledgerSync: {
    mtLedgerPosted: boolean;
    citiMasterSync: boolean;
    cryptographicProof: string;
    blockIndex: number;
  };
}

const MOCK_RECONCILIATION_DATA: ReconciliationItem[] = [
  {
    id: 'REC-MT-CITI-900482',
    modernTreasuryOrder: {
      id: 'po_99af2810a9b2c34',
      type: 'wire',
      amount: 45000000.00,
      currency: 'USD',
      direction: 'credit',
      status: 'posted',
      createdAt: '2025-02-24T14:32:00.000Z',
      counterparty: {
        id: 'cp_rothschild_holdings_01',
        name: 'Rothschild & Co Sovereign Assets LP',
        lei: '5493006MHB84DD0Z4H42',
        routingNumber: '021000089',
        accountNumberMasked: '••••••••8912',
        bankName: 'Citibank N.A. Private Banking NYC',
        swiftBic: 'CITIUS33XXX',
        verificationTier: 'SOVEREIGN_GRADE',
        riskScore: 0.02
      },
      referenceNumbers: {
        vendorReference: 'INV-2025-ALPHA-09',
        imad: '20250224MMQFMP00001892',
        omad: '20250224MMQFMP00001893',
        citiTraceId: 'CITI-NY-WIRE-88910-X'
      },
      ledgerEntryId: 'lg_ent_882910401',
      metadata: {
        costCenter: 'SOVEREIGN_SYNDICATE',
        dealId: 'PROJECT-OMEGA-TRILLION',
        aiDisputeProtected: true
      }
    },
    citiRecord: {
      transactionId: 'CITI-TX-0091823901',
      citiReference: 'CITI-NY-WIRE-88910-X',
      fedWireTrackingId: '20250224MMQFMP00001892',
      valueDate: '2025-02-24T14:32:15.000Z',
      settledAmount: 45000000.00,
      nominalFee: 35.00,
      clearingSystem: 'FEDWIRE',
      citiAccountNode: 'CITI-PRIVATE-RESERVE-NODE-A',
      hashProof: '0x8f2d93e50a41bc99402eaf0349a90918b9588049302e0fa9501cbdaef9019283'
    },
    expectedPaymentId: 'exp_pay_90912384',
    matchScore: 0.9998,
    discrepancyDelta: 0.00,
    status: 'RECONCILED_PERFECT',
    aiAnalysis: {
      confidence: 99.98,
      explanation: 'Exact 1:1 dual match across Fedwire IMAD and Modern Treasury payment order reference. Signature matches Tier 1 Private Ledger.',
      recommendedAction: 'Automated cryptographic signature seal committed.',
      autoHealed: false
    },
    ledgerSync: {
      mtLedgerPosted: true,
      citiMasterSync: true,
      cryptographicProof: 'SHA256:e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
      blockIndex: 4902194
    }
  },
  {
    id: 'REC-MT-CITI-900483',
    modernTreasuryOrder: {
      id: 'po_77bc3491f0e4d12',
      type: 'rtp',
      amount: 12500000.00,
      currency: 'USD',
      direction: 'credit',
      status: 'posted',
      createdAt: '2025-02-24T14:28:10.000Z',
      counterparty: {
        id: 'cp_blackstone_real_est_09',
        name: 'Blackstone Capital Partners IX Treasury',
        lei: '549300H0V6F438D19F19',
        routingNumber: '021000021',
        accountNumberMasked: '••••••••4491',
        bankName: 'JPMorgan Chase NYC Settlement',
        swiftBic: 'CHASUS33XXX',
        verificationTier: 'INSTITUTIONAL_ULTRA',
        riskScore: 0.12
      },
      referenceNumbers: {
        vendorReference: 'CP-DISBURSE-9921',
        citiTraceId: 'CITI-RTP-77192-K'
      },
      ledgerEntryId: 'lg_ent_772183921',
      metadata: {
        costCenter: 'GLOBAL_BUYOUTS',
        dealId: 'MERGER-NEO-CYBER',
        aiDisputeProtected: true
      }
    },
    citiRecord: {
      transactionId: 'CITI-TX-7719280193',
      citiReference: 'CITI-RTP-77192-K',
      fedWireTrackingId: 'RTP20250224098231',
      valueDate: '2025-02-24T14:28:12.000Z',
      settledAmount: 12499990.00,
      nominalFee: 10.00,
      clearingSystem: 'CITI_INTERNAL_BOOK',
      citiAccountNode: 'CITI-RTP-SETTLE-01',
      hashProof: '0x192e8a7bc01fa490924901fbc34091aef839201948271049281a0bcefa9201a4'
    },
    expectedPaymentId: 'exp_pay_33918204',
    matchScore: 0.9654,
    discrepancyDelta: 10.00,
    status: 'AUTO_RESOLVED_AI',
    aiAnalysis: {
      confidence: 97.4,
      explanation: 'Micro delta of $10.00 matched to clearing transit fee tariff schedule under Section 4.2. Auto-balanced via MT Journal Adjustment.',
      recommendedAction: 'Execute ledger contra-entry on Modern Treasury ledger node lg_citi_recon_offset.',
      autoHealed: true
    },
    ledgerSync: {
      mtLedgerPosted: true,
      citiMasterSync: true,
      cryptographicProof: 'SHA256:7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      blockIndex: 4902195
    }
  },
  {
    id: 'REC-MT-CITI-900484',
    modernTreasuryOrder: {
      id: 'po_55de9018c1a9b88',
      type: 'wire',
      amount: 88750000.00,
      currency: 'USD',
      direction: 'debit',
      status: 'processing',
      createdAt: '2025-02-24T14:15:00.000Z',
      counterparty: {
        id: 'cp_gulf_sovereign_invest_04',
        name: 'Mubadala Sovereign Wealth Fund Custody',
        lei: '21380061W2WUY771H423',
        routingNumber: '026002099',
        accountNumberMasked: '••••••••7721',
        bankName: 'First Abu Dhabi Bank / Citi Agency',
        swiftBic: 'NBADAEADXXX',
        verificationTier: 'SOVEREIGN_GRADE',
        riskScore: 0.01
      },
      referenceNumbers: {
        vendorReference: 'SWF-ESCROW-CALL-01',
        imad: '20250224MMQFMP00009941',
        citiTraceId: 'CITI-SWIFT-99124-M'
      },
      ledgerEntryId: 'lg_ent_559281033',
      metadata: {
        costCenter: 'SOVEREIGN_ESCROW',
        dealId: 'AEROSPACE-INFRA-CONSORTIUM',
        aiDisputeProtected: true
      }
    },
    citiRecord: undefined,
    expectedPaymentId: 'exp_pay_88192031',
    matchScore: 0.45,
    discrepancyDelta: 88750000.00,
    status: 'IN_TRANSIT',
    aiAnalysis: {
      confidence: 91.2,
      explanation: 'Modern Treasury outbound debit dispatched via Fedwire. Citi Interbank gateway awaiting Federal Reserve ACK2 confirmation packet.',
      recommendedAction: 'Awaiting clearance cycle. Predicted finality in 14.8 seconds.',
      autoHealed: false
    },
    ledgerSync: {
      mtLedgerPosted: true,
      citiMasterSync: false,
      cryptographicProof: 'SHA256:PENDING_CITI_FINALITY_ACK',
      blockIndex: 4902196
    }
  },
  {
    id: 'REC-MT-CITI-900485',
    modernTreasuryOrder: {
      id: 'po_11aa4829e5c6b90',
      type: 'book',
      amount: 140000000.00,
      currency: 'USD',
      direction: 'credit',
      status: 'posted',
      createdAt: '2025-02-24T13:45:00.000Z',
      counterparty: {
        id: 'cp_citigroup_global_markets_hq',
        name: 'Citigroup Global Markets Prime Brokerage Collateral',
        lei: 'XKZZ2JZF41MRHTR1V493',
        routingNumber: '021000089',
        accountNumberMasked: '••••••••0019',
        bankName: 'Citibank N.A. Global Operations NYC',
        swiftBic: 'CITIUS33PRM',
        verificationTier: 'CITI_PRIVATE_TIER_1',
        riskScore: 0.001
      },
      referenceNumbers: {
        vendorReference: 'PRIME-COLLATERAL-TOPUP-99',
        citiTraceId: 'CITI-INTRA-882194-A'
      },
      ledgerEntryId: 'lg_ent_110928491',
      metadata: {
        costCenter: 'PRIME_COLLATERAL_DESK',
        dealId: 'QUANTUM-ALPHA-HEDGE-IX',
        aiDisputeProtected: true
      }
    },
    citiRecord: {
      transactionId: 'CITI-TX-1182930485',
      citiReference: 'CITI-INTRA-882194-A-MISMATCH',
      fedWireTrackingId: 'BOOK_INTERNAL_9921',
      valueDate: '2025-02-24T13:45:02.000Z',
      settledAmount: 139950000.00,
      nominalFee: 0.00,
      clearingSystem: 'CITI_INTERNAL_BOOK',
      citiAccountNode: 'CITI-INTRA-PRIME-BOOK',
      hashProof: '0x99281a0e4fb819c92840182bcf92810482910492819482019482910492819482'
    },
    expectedPaymentId: 'exp_pay_11902849',
    matchScore: 0.724,
    discrepancyDelta: 50000.00,
    status: 'DISCREPANCY_FLAGGED',
    aiAnalysis: {
      confidence: 94.8,
      explanation: 'Discrepancy of $50,000.00 detected between MT Payment Order ($140.00M) and Citibank Internal Book Ledger record ($139.95M). Likely margin retention deduction.',
      recommendedAction: 'Deploy AI Autonomous Dispute Resolution agent to request margin deduction breakdown or execute counterparty reconciliation request.',
      autoHealed: false
    },
    ledgerSync: {
      mtLedgerPosted: true,
      citiMasterSync: false,
      cryptographicProof: 'SHA256:DESYNC_TOLERANCE_EXCEEDED',
      blockIndex: 4902197
    }
  }
];

export const ModernTreasuryDetailReconciler: React.FC = () => {
  const [reconciliations, setReconciliations] = useState<ReconciliationItem[]>(MOCK_RECONCILIATION_DATA);
  const [selectedId, setSelectedId] = useState<string>(MOCK_RECONCILIATION_DATA[0].id);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('ALL');
  const [isAiResolving, setIsAiResolving] = useState<boolean>(false);
  const [resolutionSuccessMessage, setResolutionSuccessMessage] = useState<string | null>(null);
  const [toleranceThreshold, setToleranceThreshold] = useState<number>(100.00);
  const [autoSyncLedger, setAutoSyncLedger] = useState<boolean>(true);
  const [activeLedgerTab, setActiveLedgerTab] = useState<'OVERVIEW' | 'MT_ORDER' | 'CITI_SETTLEMENT' | 'AI_DISPUTE' | 'CRYPTO_PROOF'>('OVERVIEW');

  // Selected item computation
  const activeItem = useMemo(() => {
    return reconciliations.find(r => r.id === selectedId) || reconciliations[0];
  }, [reconciliations, selectedId]);

  // Aggregate Metrics
  const aggregateMetrics = useMemo(() => {
    const totalVolume = reconciliations.reduce((acc, curr) => acc + curr.modernTreasuryOrder.amount, 0);
    const matchedCount = reconciliations.filter(r => r.status === 'RECONCILED_PERFECT' || r.status === 'AUTO_RESOLVED_AI').length;
    const flaggedCount = reconciliations.filter(r => r.status === 'DISCREPANCY_FLAGGED').length;
    const inTransitCount = reconciliations.filter(r => r.status === 'IN_TRANSIT').length;
    const matchRate = (matchedCount / reconciliations.length) * 100;

    return {
      totalVolume,
      matchedCount,
      flaggedCount,
      inTransitCount,
      matchRate
    };
  }, [reconciliations]);

  // Filtering
  const filteredReconciliations = useMemo(() => {
    return reconciliations.filter(item => {
      const matchesSearch =
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modernTreasuryOrder.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modernTreasuryOrder.counterparty.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.modernTreasuryOrder.referenceNumbers.citiTraceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (item.citiRecord?.transactionId && item.citiRecord.transactionId.toLowerCase().includes(searchQuery.toLowerCase()));

      const matchesStatus =
        statusFilter === 'ALL' ||
        item.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [reconciliations, searchQuery, statusFilter]);

  // Format Currencies
  const formatUSD = useCallback((val: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  }, []);

  // AI Dispute Auto Resolution Handler
  const handleTriggerAiDisputeResolution = (itemId: string) => {
    setIsAiResolving(true);
    setResolutionSuccessMessage(null);

    setTimeout(() => {
      setReconciliations(prev => prev.map(item => {
        if (item.id === itemId) {
          const delta = item.discrepancyDelta;
          return {
            ...item,
            status: 'AUTO_RESOLVED_AI',
            matchScore: 0.9992,
            discrepancyDelta: 0,
            aiAnalysis: {
              ...item.aiAnalysis,
              autoHealed: true,
              explanation: `AI Agent autonomously reconciled discrepancy of ${formatUSD(delta)}. Margin retention ledger adjusted via Modern Treasury Citi offset ledger #lg_citi_margin_settle.`,
              recommendedAction: 'Automated clawback voucher generated and verified with Citibank Prime settlement gateway.'
            },
            ledgerSync: {
              mtLedgerPosted: true,
              citiMasterSync: true,
              cryptographicProof: 'SHA256:0x7b919283fcc091283e109283fa8102948cba091823091',
              blockIndex: 4902201
            }
          };
        }
        return item;
      }));

      setIsAiResolving(false);
      setResolutionSuccessMessage('AI Autonomous Dispute Resolved: Reconciled & Citi Prime Gateway Balanced.');
    }, 1800);
  };

  // Status Badge Component
  const renderStatusBadge = (status: ReconciliationItem['status']) => {
    switch (status) {
      case 'RECONCILED_PERFECT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30 tracking-wide shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 text-emerald-400" />
            PERFECT MATCH
          </span>
        );
      case 'AUTO_RESOLVED_AI':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/70 text-amber-300 border border-amber-500/40 tracking-wide shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Sparkles className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
            AI AUTO-HEALED
          </span>
        );
      case 'DISCREPANCY_FLAGGED':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-950/80 text-rose-300 border border-rose-500/40 tracking-wide animate-pulse">
            <AlertTriangle className="w-3.5 h-3.5 mr-1.5 text-rose-400" />
            DISCREPANCY
          </span>
        );
      case 'IN_TRANSIT':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-cyan-950/80 text-cyan-300 border border-cyan-500/30 tracking-wide">
            <RefreshCw className="w-3.5 h-3.5 mr-1.5 text-cyan-400 animate-spin" />
            IN TRANSIT
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="w-full min-h-screen bg-[#07090E] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner / System Branding Header */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-[#0B101B] via-[#0F172A] to-[#12111E] border border-amber-500/20 p-6 md:p-8 mb-8 shadow-2xl backdrop-blur-xl">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div>
            <div className="flex items-center space-x-3 mb-2">
              <div className="flex items-center justify-center w-10 h-10 rounded-xl bg-gradient-to-br from-amber-400/20 to-amber-600/30 border border-amber-400/40 shadow-[0_0_15px_rgba(212,175,55,0.25)]">
                <Scale className="w-5 h-5 text-amber-300" />
              </div>
              <div className="flex flex-col">
                <div className="flex items-center gap-2">
                  <span className="text-xs uppercase tracking-[0.25em] font-mono text-amber-400/90 font-semibold">
                    Citibank Institutional &bull; Modern Treasury Engine
                  </span>
                  <span className="inline-flex items-center px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                    LIVE L1 SYNC
                  </span>
                </div>
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-100 to-amber-200 bg-clip-text text-transparent">
                  Quantum Detail Reconciler & Ledger Proof
                </h1>
              </div>
            </div>
            <p className="text-sm text-slate-400 max-w-2xl mt-1">
              Autonomous micro-second reconciliation matching Modern Treasury payment orders, expected receivables, and Citibank settlement ledgers with real-time cryptographic audit trails.
            </p>
          </div>

          {/* Quick Metrics Bar */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-black/40 p-3.5 rounded-xl border border-slate-800/80 shadow-inner">
            <div className="px-3 border-r border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Settled Volume</span>
              <p className="text-base md:text-lg font-mono font-bold text-amber-300">
                {formatUSD(aggregateMetrics.totalVolume)}
              </p>
            </div>
            <div className="px-3 border-r border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Auto Match Rate</span>
              <p className="text-base md:text-lg font-mono font-bold text-emerald-400">
                {aggregateMetrics.matchRate.toFixed(1)}%
              </p>
            </div>
            <div className="px-3 border-r border-slate-800">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">Exceptions</span>
              <p className={`text-base md:text-lg font-mono font-bold ${aggregateMetrics.flaggedCount > 0 ? 'text-rose-400' : 'text-slate-400'}`}>
                {aggregateMetrics.flaggedCount} Cases
              </p>
            </div>
            <div className="px-3">
              <span className="text-[10px] uppercase font-mono text-slate-500 tracking-wider">In Flight</span>
              <p className="text-base md:text-lg font-mono font-bold text-cyan-400">
                {aggregateMetrics.inTransitCount} Wires
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Control Bar & Filtering */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        <div className="flex-1 relative">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search Reference ID, IMAD/OMAD, Citi Trace ID, Counterparty LEI..."
            className="w-full pl-10 pr-4 py-2.5 bg-[#0D131F]/90 border border-slate-800 rounded-xl text-sm placeholder-slate-500 focus:outline-none focus:border-amber-500/50 focus:ring-1 focus:ring-amber-500/50 text-slate-200 transition-all font-mono"
          />
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          {/* Status Filters */}
          <div className="flex bg-[#0D131F] p-1 rounded-xl border border-slate-800">
            {(['ALL', 'RECONCILED_PERFECT', 'AUTO_RESOLVED_AI', 'DISCREPANCY_FLAGGED', 'IN_TRANSIT'] as const).map((filterKey) => (
              <button
                key={filterKey}
                onClick={() => setStatusFilter(filterKey)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold tracking-wide transition-all ${
                  statusFilter === filterKey
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {filterKey.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Tolerance Config */}
          <div className="flex items-center bg-[#0D131F] border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-400 space-x-2">
            <Sliders className="w-3.5 h-3.5 text-amber-400" />
            <span>Tolerance:</span>
            <span className="font-mono text-slate-200 font-bold">${toleranceThreshold}</span>
          </div>

          {/* Auto-Sync Switch */}
          <button
            onClick={() => setAutoSyncLedger(!autoSyncLedger)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-xl border text-xs font-medium transition-all ${
              autoSyncLedger
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300'
                : 'bg-slate-900 border-slate-800 text-slate-500'
            }`}
          >
            <Zap className={`w-3.5 h-3.5 ${autoSyncLedger ? 'text-emerald-400 fill-emerald-400/30' : 'text-slate-500'}`} />
            <span>Auto-Ledger Sync</span>
          </button>
        </div>
      </div>

      {/* Main Workspace Split */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        {/* Left Side: Reconciliation Master Queue */}
        <div className="lg:col-span-5 space-y-3">
          <div className="flex items-center justify-between px-2 text-xs font-mono text-slate-400">
            <span>TRANSACTION STREAM ({filteredReconciliations.length})</span>
            <span>MATCH CONFIDENCE</span>
          </div>

          <div className="space-y-2.5 max-h-[750px] overflow-y-auto pr-1">
            {filteredReconciliations.map((item) => {
              const isSelected = item.id === activeItem.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedId(item.id)}
                  className={`group relative p-4 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#141B2D] to-[#171E33] border-amber-500/50 shadow-[0_0_20px_rgba(212,175,55,0.15)] ring-1 ring-amber-500/30'
                      : 'bg-[#0A0E17]/80 hover:bg-[#101624] border-slate-800/80 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between gap-3 mb-2">
                    <div className="flex items-center space-x-2">
                      <div className="p-2 rounded-lg bg-black/40 border border-slate-800">
                        <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                      </div>
                      <div>
                        <div className="flex items-center space-x-2">
                          <span className="font-mono text-xs font-bold text-slate-200">
                            {item.modernTreasuryOrder.counterparty.name}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400 uppercase">
                            {item.modernTreasuryOrder.type}
                          </span>
                        </div>
                        <p className="text-[11px] font-mono text-slate-500 truncate max-w-[200px]">
                          Ref: {item.modernTreasuryOrder.referenceNumbers.citiTraceId}
                        </p>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="font-mono text-sm font-bold text-slate-100 block">
                        {formatUSD(item.modernTreasuryOrder.amount)}
                      </span>
                      <span className="font-mono text-[11px] text-amber-400 font-medium">
                        {(item.matchScore * 100).toFixed(1)}% Match
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800/60 text-xs">
                    {renderStatusBadge(item.status)}
                    <div className="flex items-center space-x-2 text-[11px] text-slate-400 font-mono">
                      <span>{new Date(item.modernTreasuryOrder.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                      <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isSelected ? 'text-amber-400 translate-x-0.5' : 'text-slate-600'}`} />
                    </div>
                  </div>
                </div>
              );
            })}

            {filteredReconciliations.length === 0 && (
              <div className="p-12 text-center border border-dashed border-slate-800 rounded-xl bg-[#090D16]">
                <FileCheck className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-400 font-medium">No matching transactions found.</p>
                <p className="text-xs text-slate-600">Try modifying your query or tolerance filter.</p>
              </div>
            )}
          </div>
        </div>

        {/* Right Side: Deep Reconciler & AI Dispute Agent Workspace */}
        <div className="lg:col-span-7 bg-[#0C111C]/90 rounded-2xl border border-slate-800 p-6 shadow-2xl relative">
          {/* Header Action Row */}
          <div className="flex flex-wrap items-center justify-between pb-5 border-b border-slate-800 gap-3">
            <div>
              <div className="flex items-center space-x-2">
                <span className="font-mono text-xs text-amber-400 font-semibold">{activeItem.id}</span>
                <span className="text-slate-600">&bull;</span>
                <span className="font-mono text-xs text-slate-400">{activeItem.modernTreasuryOrder.metadata.dealId}</span>
              </div>
              <h2 className="text-xl font-bold text-slate-100 flex items-center gap-2 mt-0.5">
                {activeItem.modernTreasuryOrder.counterparty.name}
              </h2>
            </div>

            <div className="flex items-center space-x-2">
              {renderStatusBadge(activeItem.status)}
            </div>
          </div>

          {/* Navigation Sub-Tabs */}
          <div className="flex items-center space-x-1 border-b border-slate-800/80 my-4 text-xs font-mono">
            {(['OVERVIEW', 'MT_ORDER', 'CITI_SETTLEMENT', 'AI_DISPUTE', 'CRYPTO_PROOF'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveLedgerTab(tab)}
                className={`px-3 py-2 border-b-2 font-medium transition-all ${
                  activeLedgerTab === tab
                    ? 'border-amber-400 text-amber-300 bg-amber-400/5'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                {tab.replace('_', ' ')}
              </button>
            ))}
          </div>

          {/* Success Banner */}
          {resolutionSuccessMessage && (
            <div className="mb-4 p-3.5 rounded-xl bg-emerald-950/60 border border-emerald-500/40 text-emerald-300 text-xs flex items-center justify-between animate-fadeIn">
              <div className="flex items-center space-x-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <span>{resolutionSuccessMessage}</span>
              </div>
              <button onClick={() => setResolutionSuccessMessage(null)} className="text-emerald-400 hover:text-emerald-200 font-bold">
                &times;
              </button>
            </div>
          )}

          {/* Tab 1: OVERVIEW Side-by-Side Verification */}
          {activeLedgerTab === 'OVERVIEW' && (
            <div className="space-y-6">
              {/* Dual Ledger Card Split */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Modern Treasury Node */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-amber-400 uppercase flex items-center">
                      <Layers className="w-3.5 h-3.5 mr-1.5" /> Modern Treasury Order
                    </span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {activeItem.modernTreasuryOrder.id}
                    </span>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Order Amount:</span>
                      <span className="font-mono font-bold text-slate-100">{formatUSD(activeItem.modernTreasuryOrder.amount)}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Direction / Type:</span>
                      <span className="font-mono uppercase text-slate-200">{activeItem.modernTreasuryOrder.direction} &bull; {activeItem.modernTreasuryOrder.type}</span>
                    </div>
                    <div className="flex justify-between py-1 border-b border-slate-800/60">
                      <span className="text-slate-500">Ledger Entry:</span>
                      <span className="font-mono text-amber-400/90">{activeItem.modernTreasuryOrder.ledgerEntryId}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span className="text-slate-500">Expected Pay ID:</span>
                      <span className="font-mono text-slate-300">{activeItem.expectedPaymentId || 'N/A'}</span>
                    </div>
                  </div>
                </div>

                {/* Citibank Settlement Node */}
                <div className="p-4 rounded-xl bg-[#080C14] border border-slate-800">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[11px] font-mono font-bold text-cyan-400 uppercase flex items-center">
                      <Building2 className="w-3.5 h-3.5 mr-1.5" /> Citibank Master Settlement
                    </span>
                    <span className="text-[10px] font-mono bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded">
                      {activeItem.citiRecord ? activeItem.citiRecord.transactionId : 'AWAITING_INGESTION'}
                    </span>
                  </div>
                  {activeItem.citiRecord ? (
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-500">Settled Amount:</span>
                        <span className="font-mono font-bold text-slate-100">{formatUSD(activeItem.citiRecord.settledAmount)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-500">Clearing System:</span>
                        <span className="font-mono uppercase text-cyan-300">{activeItem.citiRecord.clearingSystem}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-800/60">
                        <span className="text-slate-500">Citi Trace ID:</span>
                        <span className="font-mono text-slate-200">{activeItem.citiRecord.citiReference}</span>
                      </div>
                      <div className="flex justify-between py-1">
                        <span className="text-slate-500">FedWire IMAD:</span>
                        <span className="font-mono text-slate-300">{activeItem.citiRecord.fedWireTrackingId}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="py-6 text-center text-slate-500 text-xs">
                      <RefreshCw className="w-5 h-5 mx-auto mb-2 animate-spin text-cyan-500" />
                      Pending Citibank FedWire Clearing confirmation packet.
                    </div>
                  )}
                </div>
              </div>

              {/* Discrepancy & AI Reconciler Action Card */}
              <div className="p-4 rounded-xl bg-gradient-to-br from-[#101726] to-[#0A0F1A] border border-amber-500/30">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <Cpu className="w-4 h-4 text-amber-400" />
                    <span className="font-mono text-xs font-bold text-slate-200">AI Dispute & Healing Agent Engine</span>
                  </div>
                  <span className="text-xs font-mono text-amber-400 font-semibold">
                    Confidence: {activeItem.aiAnalysis.confidence}%
                  </span>
                </div>

                <p className="text-xs text-slate-300 leading-relaxed mb-3">
                  {activeItem.aiAnalysis.explanation}
                </p>

                <div className="bg-black/50 p-3 rounded-lg border border-slate-800 mb-4 flex items-center justify-between text-xs">
                  <div>
                    <span className="text-slate-500 block font-mono text-[10px] uppercase">Reconciliation Action</span>
                    <span className="text-slate-200 font-mono">{activeItem.aiAnalysis.recommendedAction}</span>
                  </div>
                  {activeItem.discrepancyDelta > 0 && (
                    <div className="text-right">
                      <span className="text-slate-500 block font-mono text-[10px] uppercase">Variance</span>
                      <span className="font-mono font-bold text-rose-400">{formatUSD(activeItem.discrepancyDelta)}</span>
                    </div>
                  )}
                </div>

                {activeItem.status === 'DISCREPANCY_FLAGGED' && (
                  <button
                    disabled={isAiResolving}
                    onClick={() => handleTriggerAiDisputeResolution(activeItem.id)}
                    className="w-full py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold rounded-xl text-xs flex items-center justify-center space-x-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] transition-all disabled:opacity-50"
                  >
                    {isAiResolving ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-black" />
                        <span>SYNTHESIZING JOURNAL ADJUSTMENT & DISPUTE PROOF...</span>
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-4 h-4 text-black" />
                        <span>EXECUTE AUTONOMOUS AI RESOLUTION & POST OFF-SETTING LEDGER</span>
                      </>
                    )}
                  </button>
                )}
              </div>
            </div>
          )}

          {/* Tab 2: Modern Treasury Deep Order Metadata */}
          {activeLedgerTab === 'MT_ORDER' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3 text-xs">
                <div className="p-3 bg-[#080C14] rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono">COUNTERPARTY LEGAL NAME</span>
                  <span className="text-slate-200 font-semibold">{activeItem.modernTreasuryOrder.counterparty.name}</span>
                </div>
                <div className="p-3 bg-[#080C14] rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono">LEI (LEGAL ENTITY IDENTIFIER)</span>
                  <span className="text-amber-400 font-mono font-bold">{activeItem.modernTreasuryOrder.counterparty.lei}</span>
                </div>
                <div className="p-3 bg-[#080C14] rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono">SWIFT BIC / CLEARING BANK</span>
                  <span className="text-slate-200 font-mono">{activeItem.modernTreasuryOrder.counterparty.swiftBic} ({activeItem.modernTreasuryOrder.counterparty.bankName})</span>
                </div>
                <div className="p-3 bg-[#080C14] rounded-lg border border-slate-800">
                  <span className="text-slate-500 block text-[10px] font-mono">ACCOUNT & ROUTING</span>
                  <span className="text-slate-200 font-mono">RTN: {activeItem.modernTreasuryOrder.counterparty.routingNumber} | ACT: {activeItem.modernTreasuryOrder.counterparty.accountNumberMasked}</span>
                </div>
              </div>

              <div className="p-4 bg-[#080C14] rounded-xl border border-slate-800">
                <h4 className="text-xs font-mono text-slate-400 font-semibold mb-3 flex items-center">
                  <GitCommit className="w-3.5 h-3.5 mr-1.5 text-amber-400" />
                  REFERENCE IDENTIFIERS & WIRE PACKETS
                </h4>
                <div className="space-y-2 font-mono text-xs">
                  <div className="flex justify-between p-2 bg-black/40 rounded border border-slate-800/80">
                    <span className="text-slate-500">Modern Treasury PO ID:</span>
                    <span className="text-amber-300">{activeItem.modernTreasuryOrder.id}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded border border-slate-800/80">
                    <span className="text-slate-500">Vendor Reference:</span>
                    <span className="text-slate-200">{activeItem.modernTreasuryOrder.referenceNumbers.vendorReference}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded border border-slate-800/80">
                    <span className="text-slate-500">IMAD (Fedwire Input Msg ID):</span>
                    <span className="text-slate-200">{activeItem.modernTreasuryOrder.referenceNumbers.imad || 'AUTO_PENDING'}</span>
                  </div>
                  <div className="flex justify-between p-2 bg-black/40 rounded border border-slate-800/80">
                    <span className="text-slate-500">OMAD (Fedwire Output Msg ID):</span>
                    <span className="text-slate-200">{activeItem.modernTreasuryOrder.referenceNumbers.omad || 'N/A'}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 3: Citibank Settlement Data */}
          {activeLedgerTab === 'CITI_SETTLEMENT' && (
            <div className="space-y-4">
              {activeItem.citiRecord ? (
                <div className="p-4 bg-[#080C14] rounded-xl border border-slate-800 space-y-3">
                  <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                    <div className="flex items-center space-x-2">
                      <Building2 className="w-4 h-4 text-cyan-400" />
                      <span className="text-xs font-mono font-bold text-slate-200">Citibank Settlement Node Details</span>
                    </div>
                    <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-cyan-950 text-cyan-300 border border-cyan-500/30">
                      {activeItem.citiRecord.citiAccountNode}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                    <div className="p-2.5 bg-black/40 rounded border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">CITI LEDGER REF</span>
                      <span className="text-slate-200 font-bold">{activeItem.citiRecord.transactionId}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 rounded border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">VALUE DATE UTC</span>
                      <span className="text-slate-200">{new Date(activeItem.citiRecord.valueDate).toUTCString()}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 rounded border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">NOMINAL CLEARING TARIFF</span>
                      <span className="text-emerald-400 font-bold">${activeItem.citiRecord.nominalFee.toFixed(2)}</span>
                    </div>
                    <div className="p-2.5 bg-black/40 rounded border border-slate-800/60">
                      <span className="text-slate-500 text-[10px] block">CLEARING SYSTEM</span>
                      <span className="text-amber-400 font-bold">{activeItem.citiRecord.clearingSystem}</span>
                    </div>
                  </div>

                  <div className="p-3 bg-black/60 rounded border border-slate-800 text-[11px] font-mono">
                    <span className="text-slate-500 block mb-1">CITI PROOF STATE HASH</span>
                    <span className="text-amber-300/80 break-all select-all">{activeItem.citiRecord.hashProof}</span>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-[#080C14] rounded-xl border border-slate-800">
                  <RefreshCw className="w-8 h-8 text-cyan-400 animate-spin mx-auto mb-3" />
                  <p className="text-sm font-semibold text-slate-200">Awaiting Settlement Dispatch Packet</p>
                  <p className="text-xs text-slate-500 mt-1">Transaction is actively traversing the Federal Reserve Fedwire Node.</p>
                </div>
              )}
            </div>
          )}

          {/* Tab 4: AI Dispute Diagnostics */}
          {activeLedgerTab === 'AI_DISPUTE' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#080C14] rounded-xl border border-slate-800">
                <h4 className="text-xs font-mono font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center">
                  <Workflow className="w-4 h-4 mr-2" /> Autonomous Dispute Rule Matrix
                </h4>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-300">Tolerance Variance Rule (&lt; $100.00)</span>
                    <span className="text-emerald-400 font-mono font-bold">AUTO-ABSORB ACTIVE</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-300">Prime Broker Margin Retention Check</span>
                    <span className="text-cyan-400 font-mono font-bold">SMART OFFSET ENABLED</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 rounded bg-black/40 border border-slate-800">
                    <span className="text-slate-300">Sovereign Tier Proof Enforcement</span>
                    <span className="text-amber-400 font-mono font-bold">L1 CRYPTO SEAL REQ</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab 5: Cryptographic Ledger Proof */}
          {activeLedgerTab === 'CRYPTO_PROOF' && (
            <div className="space-y-4">
              <div className="p-4 bg-[#080C14] rounded-xl border border-slate-800 space-y-3 font-mono text-xs">
                <div className="flex items-center justify-between pb-2 border-b border-slate-800">
                  <span className="text-slate-400 flex items-center">
                    <Lock className="w-3.5 h-3.5 mr-1.5 text-emerald-400" /> Block Index Verification
                  </span>
                  <span className="text-amber-300 font-bold">#{activeItem.ledgerSync.blockIndex}</span>
                </div>

                <div>
                  <span className="text-slate-500 text-[10px] block mb-1">MT LEDGER VS CITI MASTER DUAL HASH</span>
                  <div className="p-3 bg-black/80 rounded border border-slate-800 text-emerald-400/90 break-all select-all font-mono">
                    {activeItem.ledgerSync.cryptographicProof}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-2 text-[11px] pt-2">
                  <div className="p-2 bg-black/40 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">MT Ledger State:</span>
                    <span className="text-emerald-400 font-bold">COMMITTED</span>
                  </div>
                  <div className="p-2 bg-black/40 rounded border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400">Citi Master Sync:</span>
                    <span className={activeItem.ledgerSync.citiMasterSync ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {activeItem.ledgerSync.citiMasterSync ? 'SYNCHRONIZED' : 'IN_BUFFER'}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default ModernTreasuryDetailReconciler;