import React, { useState, useMemo, useEffect } from 'react';
import {
  Sparkles,
  ShieldCheck,
  TrendingUp,
  DollarSign,
  PlusCircle,
  Search,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Cpu,
  RefreshCw,
  SlidersHorizontal,
  Layers,
  ChevronRight,
  Building2,
  FileCheck,
  ArrowDownLeft,
  Zap,
  Globe2,
  Lock,
  Wallet,
  X,
  PieChart,
  Activity,
  Award
} from 'lucide-react';

export type PaymentStatus = 
  | 'unreconciled' 
  | 'partially_reconciled' 
  | 'reconciled' 
  | 'settlement_in_flight' 
  | 'ai_flagged';

export interface ExpectedPayment {
  id: string;
  trackingRef: string;
  counterpartyName: string;
  counterpartyBic: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'CHF' | 'AED' | 'GBP' | 'SGD';
  expectedDate: string;
  status: PaymentStatus;
  reconciliationType: 'SWIFT_GPI_INSTANT' | 'CITI_GLOBAL_MESH' | 'FEDWIRE_SOVEREIGN' | 'CHIPS_TIER1';
  aiMatchScore: number;
  aiMatchReason: string;
  virtualAccountId: string;
  category: 'Sovereign Debt Service' | 'Bespoke M&A Escrow' | 'Commodity Settlement' | 'Private Equity Call';
  collateralTier: 'Tier 1 Prime Gold-Backed' | 'AAA Sovereign Bond' | 'Cash Escrow Fed Reserve';
}

const INITIAL_EXPECTED_PAYMENTS: ExpectedPayment[] = [
  {
    id: 'exp_sov_99182301',
    trackingRef: 'CITI-NY-2025-0891X',
    counterpartyName: 'Kingdom Sovereign Wealth Fund IX',
    counterpartyBic: 'CARSUS33XXX',
    amount: 750000000.00,
    currency: 'USD',
    expectedDate: '2025-04-15',
    status: 'settlement_in_flight',
    reconciliationType: 'CITI_GLOBAL_MESH',
    aiMatchScore: 99.8,
    aiMatchReason: 'SWIFT UETR match confirmed via Fedwire high-value corridor with predictive hash parity.',
    virtualAccountId: 'VA-CITI-OB-88092',
    category: 'Sovereign Debt Service',
    collateralTier: 'AAA Sovereign Bond'
  },
  {
    id: 'exp_sov_99182302',
    trackingRef: 'MT-MODTR-881920B',
    counterpartyName: 'Aethelgard Global Lux Capital S.A.',
    counterpartyBic: 'LUXBA22XXX',
    amount: 240000000.00,
    currency: 'EUR',
    expectedDate: '2025-04-16',
    status: 'partially_reconciled',
    reconciliationType: 'SWIFT_GPI_INSTANT',
    aiMatchScore: 94.2,
    aiMatchReason: 'Tranche A (€180M) matched in real-time. Tranche B pending TARGET2 closing window.',
    virtualAccountId: 'VA-CITI-EUR-10294',
    category: 'Bespoke M&A Escrow',
    collateralTier: 'Cash Escrow Fed Reserve'
  },
  {
    id: 'exp_sov_99182303',
    trackingRef: 'CITI-ZUR-9912001',
    counterpartyName: 'Helvetia Alpine Multi-Asset Trust',
    counterpartyBic: 'UBSWCHZHXXX',
    amount: 185000000.00,
    currency: 'CHF',
    expectedDate: '2025-04-18',
    status: 'reconciled',
    reconciliationType: 'CITI_GLOBAL_MESH',
    aiMatchScore: 100.0,
    aiMatchReason: 'Instant zero-knowledge cryptographic signature matched via Citi Institutional Multi-Cloud Vault.',
    virtualAccountId: 'VA-CITI-CHF-09281',
    category: 'Private Equity Call',
    collateralTier: 'Tier 1 Prime Gold-Backed'
  },
  {
    id: 'exp_sov_99182304',
    trackingRef: 'FED-20250414-9910',
    counterpartyName: 'Al-Miraj Petroleum Sovereign Syndicate',
    counterpartyBic: 'NBADAEADXXX',
    amount: 1250000000.00,
    currency: 'AED',
    expectedDate: '2025-04-19',
    status: 'unreconciled',
    reconciliationType: 'FEDWIRE_SOVEREIGN',
    aiMatchScore: 88.5,
    aiMatchReason: 'Pre-flight settlement telemetry matched. Awaiting local central bank RTGS batching release.',
    virtualAccountId: 'VA-CITI-AED-33918',
    category: 'Commodity Settlement',
    collateralTier: 'Tier 1 Prime Gold-Backed'
  },
  {
    id: 'exp_sov_99182305',
    trackingRef: 'AI-FLAG-98319-X',
    counterpartyName: 'Vanguard Pacific Strategic Inflows',
    counterpartyBic: 'CITISGSGXXX',
    amount: 95000000.00,
    currency: 'SGD',
    expectedDate: '2025-04-20',
    status: 'ai_flagged',
    reconciliationType: 'CHIPS_TIER1',
    aiMatchScore: 61.4,
    aiMatchReason: 'Discrepancy detected in remittance metadata tag :70:. AI Neural Engine isolated potential routing slip.',
    virtualAccountId: 'VA-CITI-SGD-44019',
    category: 'Private Equity Call',
    collateralTier: 'AAA Sovereign Bond'
  }
];

export const SovereignExpectedPayments: React.FC = () => {
  const [payments, setPayments] = useState<ExpectedPayment[]>(INITIAL_EXPECTED_PAYMENTS);
  const [selectedPayment, setSelectedPayment] = useState<ExpectedPayment | null>(INITIAL_EXPECTED_PAYMENTS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedStatus, setSelectedStatus] = useState<string>('ALL');
  const [isWizardOpen, setIsWizardOpen] = useState(false);
  const [isAiReconciling, setIsAiReconciling] = useState(false);

  // New Expected Payment Form State
  const [newPayment, setNewPayment] = useState({
    counterpartyName: '',
    counterpartyBic: '',
    amount: '',
    currency: 'USD' as const,
    expectedDate: new Date().toISOString().split('T')[0],
    category: 'Bespoke M&A Escrow' as const,
    reconciliationType: 'CITI_GLOBAL_MESH' as const,
    collateralTier: 'Tier 1 Prime Gold-Backed' as const
  });

  const currencyFormatters: Record<string, Intl.NumberFormat> = useMemo(() => ({
    USD: new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
    EUR: new Intl.NumberFormat('de-DE', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 }),
    CHF: new Intl.NumberFormat('de-CH', { style: 'currency', currency: 'CHF', maximumFractionDigits: 0 }),
    AED: new Intl.NumberFormat('en-AE', { style: 'currency', currency: 'AED', maximumFractionDigits: 0 }),
    GBP: new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }),
    SGD: new Intl.NumberFormat('en-SG', { style: 'currency', currency: 'SGD', maximumFractionDigits: 0 })
  }), []);

  const formatCurrency = (val: number, curr: string) => {
    return (currencyFormatters[curr] || currencyFormatters['USD']).format(val);
  };

  const filteredPayments = useMemo(() => {
    return payments.filter(p => {
      const matchesSearch = 
        p.counterpartyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.trackingRef.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.virtualAccountId.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesStatus = selectedStatus === 'ALL' || p.status === selectedStatus;
      return matchesSearch && matchesStatus;
    });
  }, [payments, searchQuery, selectedStatus]);

  const totalPipelineUSD = useMemo(() => {
    // Standard static conversion for macro dashboard aggregate
    const rates: Record<string, number> = { USD: 1.0, EUR: 1.08, CHF: 1.12, AED: 0.272, GBP: 1.28, SGD: 0.74 };
    return payments.reduce((acc, curr) => acc + (curr.amount * (rates[curr.currency] || 1)), 0);
  }, [payments]);

  const highConfidenceRatio = useMemo(() => {
    const highMatch = payments.filter(p => p.aiMatchScore >= 90).length;
    return Math.round((highMatch / (payments.length || 1)) * 100);
  }, [payments]);

  const triggerNeuralReconciliation = () => {
    setIsAiReconciling(true);
    setTimeout(() => {
      setPayments(prev => 
        prev.map(p => {
          if (p.status === 'unreconciled' || p.status === 'ai_flagged') {
            return {
              ...p,
              status: 'reconciled',
              aiMatchScore: 99.9,
              aiMatchReason: 'Real-time Modern Treasury ledger node mapped via Citi Quantum-Resistant Channel.'
            };
          }
          return p;
        })
      );
      setIsAiReconciling(false);
    }, 1800);
  };

  const handleCreatePayment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPayment.counterpartyName || !newPayment.amount) return;

    const generatedPayment: ExpectedPayment = {
      id: `exp_sov_${Math.floor(10000000 + Math.random() * 90000000)}`,
      trackingRef: `CITI-PREMIUM-${Math.floor(1000 + Math.random() * 9000)}-X`,
      counterpartyName: newPayment.counterpartyName,
      counterpartyBic: newPayment.counterpartyBic || 'CITIUS33XXX',
      amount: parseFloat(newPayment.amount),
      currency: newPayment.currency,
      expectedDate: newPayment.expectedDate,
      status: 'settlement_in_flight',
      reconciliationType: newPayment.reconciliationType,
      aiMatchScore: 97.4,
      aiMatchReason: 'AI predicted settlement trajectory verified against Citi Sovereign Liquidity Pool.',
      virtualAccountId: `VA-CITI-${newPayment.currency}-${Math.floor(10000 + Math.random() * 90000)}`,
      category: newPayment.category,
      collateralTier: newPayment.collateralTier
    };

    setPayments([generatedPayment, ...payments]);
    setSelectedPayment(generatedPayment);
    setIsWizardOpen(false);
    setNewPayment({
      counterpartyName: '',
      counterpartyBic: '',
      amount: '',
      currency: 'USD',
      expectedDate: new Date().toISOString().split('T')[0],
      category: 'Bespoke M&A Escrow',
      reconciliationType: 'CITI_GLOBAL_MESH',
      collateralTier: 'Tier 1 Prime Gold-Backed'
    });
  };

  return (
    <div className="min-h-screen bg-[#07090e] text-slate-100 p-4 md:p-8 font-sans selection:bg-[#c5a059] selection:text-black">
      {/* Top Banner: Sovereign Branding */}
      <header className="max-w-7xl mx-auto mb-8 border-b border-[#2d281e] pb-6">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#dfba73] via-[#a88238] to-[#584118] p-0.5 shadow-[0_0_25px_rgba(218,185,115,0.25)] flex items-center justify-center">
              <div className="w-full h-full bg-[#0d0f17] rounded-[10px] flex items-center justify-center">
                <Globe2 className="w-7 h-7 text-[#dfba73]" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[11px] uppercase tracking-[0.25em] text-[#d6b265] font-semibold bg-[#2a2213] px-2.5 py-0.5 rounded border border-[#6b5428]">
                  Citibank Sovereign Core
                </span>
                <span className="text-[11px] uppercase tracking-[0.2em] text-emerald-400 bg-emerald-950/60 px-2 py-0.5 rounded border border-emerald-800/50 flex items-center">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse mr-1.5" />
                  Modern Treasury Neural Mesh
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
                Expected Inflows & Liquidity Horizon
              </h1>
              <p className="text-xs text-slate-400 mt-0.5">
                Endpoint: <code className="text-[#e2c17c] font-mono">/api/expected_payments</code> • High-Value Automated Predictive Cashflow Engine
              </p>
            </div>
          </div>

          {/* Action Bar */}
          <div className="flex items-center space-x-3">
            <button
              onClick={triggerNeuralReconciliation}
              disabled={isAiReconciling}
              className="flex items-center space-x-2 px-4 py-2.5 rounded-lg bg-[#141923] border border-[#d6b265]/40 hover:border-[#d6b265] text-[#ecd8a5] transition-all hover:shadow-[0_0_15px_rgba(218,185,115,0.2)] text-xs font-medium uppercase tracking-wider disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isAiReconciling ? 'animate-spin text-[#d6b265]' : ''}`} />
              <span>{isAiReconciling ? 'AI Synthesizing Mesh...' : 'Run Neural Reconciliation'}</span>
            </button>
            <button
              onClick={() => setIsWizardOpen(true)}
              className="flex items-center space-x-2 px-5 py-2.5 rounded-lg bg-gradient-to-r from-[#d6b265] via-[#c49a45] to-[#9c7528] text-slate-950 font-bold text-xs uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(218,185,115,0.35)] transition-all"
            >
              <PlusCircle className="w-4 h-4" />
              <span>Issue Expected Payment</span>
            </button>
          </div>
        </div>

        {/* Global Treasury KPI Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <div className="bg-gradient-to-br from-[#121622] to-[#0c0e15] p-4 rounded-xl border border-[#262c3d] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <DollarSign className="w-16 h-16 text-[#d6b265]" />
            </div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Aggregate Inbound Horizon</p>
            <p className="text-2xl font-black text-[#f3e5c8] mt-1">
              ${(totalPipelineUSD / 1_000_000).toFixed(2)}M <span className="text-xs text-slate-400 font-normal">USD Equiv</span>
            </p>
            <div className="mt-2 flex items-center text-[11px] text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5 mr-1" />
              <span>+18.4% vs last sovereign settlement cycle</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#121622] to-[#0c0e15] p-4 rounded-xl border border-[#262c3d] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Sparkles className="w-16 h-16 text-emerald-400" />
            </div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Predictive Match Confidence</p>
            <p className="text-2xl font-black text-emerald-400 mt-1">{highConfidenceRatio}%</p>
            <div className="mt-2 flex items-center text-[11px] text-slate-400">
              <ShieldCheck className="w-3.5 h-3.5 mr-1 text-[#d6b265]" />
              <span>Sub-second deterministic clearing active</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#121622] to-[#0c0e15] p-4 rounded-xl border border-[#262c3d] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Building2 className="w-16 h-16 text-[#d6b265]" />
            </div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Active Virtual Nostro Accounts</p>
            <p className="text-2xl font-black text-white mt-1">14 <span className="text-xs text-[#d6b265] font-normal">Tier-1 Vaults</span></p>
            <div className="mt-2 flex items-center text-[11px] text-slate-400">
              <Lock className="w-3.5 h-3.5 mr-1 text-emerald-400" />
              <span>Citi Protected Collateralization</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-[#121622] to-[#0c0e15] p-4 rounded-xl border border-[#262c3d] shadow-lg relative overflow-hidden">
            <div className="absolute top-0 right-0 p-3 opacity-10">
              <Activity className="w-16 h-16 text-cyan-400" />
            </div>
            <p className="text-xs uppercase tracking-wider text-slate-400 font-medium">Settlement Velocity</p>
            <p className="text-2xl font-black text-cyan-300 mt-1">480 ms</p>
            <div className="mt-2 flex items-center text-[11px] text-cyan-400">
              <Zap className="w-3.5 h-3.5 mr-1" />
              <span>Direct Modern Treasury Webhook Mesh</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left Column: Filterable List & Forecasting (7 cols) */}
        <section className="lg:col-span-7 space-y-4">
          {/* Controls Bar */}
          <div className="bg-[#0f131c] border border-[#202738] p-3.5 rounded-xl flex flex-col sm:flex-row gap-3 items-center justify-between shadow-md">
            <div className="relative w-full sm:w-64">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search counterparties, refs, vaults..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-3 py-1.5 text-xs bg-[#171d2c] border border-[#2b354c] rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-[#d6b265]"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex items-center space-x-1.5 overflow-x-auto w-full sm:w-auto pb-1 sm:pb-0">
              {[
                { label: 'All', value: 'ALL' },
                { label: 'In Flight', value: 'settlement_in_flight' },
                { label: 'Reconciled', value: 'reconciled' },
                { label: 'Flagged', value: 'ai_flagged' }
              ].map(f => (
                <button
                  key={f.value}
                  onClick={() => setSelectedStatus(f.value)}
                  className={`px-3 py-1 text-xs rounded-full transition-all ${
                    selectedStatus === f.value
                      ? 'bg-[#d6b265] text-black font-semibold shadow-[0_0_10px_rgba(214,178,101,0.4)]'
                      : 'bg-[#151a27] text-slate-400 hover:text-slate-200 border border-[#232c40]'
                  }`}
                >
                  {f.label}
                </button>
              ))}
            </div>
          </div>

          {/* List of Expected Payments */}
          <div className="space-y-3">
            {filteredPayments.map(payment => {
              const isSelected = selectedPayment?.id === payment.id;
              return (
                <div
                  key={payment.id}
                  onClick={() => setSelectedPayment(payment)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer relative ${
                    isSelected
                      ? 'bg-gradient-to-r from-[#171d2b] to-[#121623] border-[#d6b265] shadow-[0_0_20px_rgba(214,178,101,0.15)]'
                      : 'bg-[#0f131d] border-[#1d2436] hover:border-[#333d59]'
                  }`}
                >
                  {isSelected && (
                    <div className="absolute left-0 top-3 bottom-3 w-1 bg-[#d6b265] rounded-r-full" />
                  )}

                  <div className="flex justify-between items-start">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono uppercase bg-[#1e2638] text-slate-300 px-2 py-0.5 rounded border border-[#2f3b54]">
                          {payment.trackingRef}
                        </span>
                        <span className="text-[10px] uppercase font-semibold text-[#ecd8a5]">
                          {payment.category}
                        </span>
                      </div>
                      <h3 className="text-base font-bold text-white tracking-wide">
                        {payment.counterpartyName}
                      </h3>
                      <p className="text-xs text-slate-400 font-mono">
                        BIC: <span className="text-slate-200">{payment.counterpartyBic}</span> • Target: {payment.expectedDate}
                      </p>
                    </div>

                    <div className="text-right space-y-1">
                      <p className="text-lg font-black text-[#f7ecd5] tracking-tight">
                        {formatCurrency(payment.amount, payment.currency)}
                      </p>
                      <div className="flex items-center justify-end space-x-1.5">
                        {payment.status === 'reconciled' && (
                          <span className="inline-flex items-center text-[10px] text-emerald-400 bg-emerald-950/60 border border-emerald-800/40 px-2 py-0.5 rounded">
                            <CheckCircle2 className="w-3 h-3 mr-1" /> Reconciled
                          </span>
                        )}
                        {payment.status === 'partially_reconciled' && (
                          <span className="inline-flex items-center text-[10px] text-amber-300 bg-amber-950/60 border border-amber-800/40 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 mr-1" /> Partial Match
                          </span>
                        )}
                        {payment.status === 'settlement_in_flight' && (
                          <span className="inline-flex items-center text-[10px] text-sky-400 bg-sky-950/60 border border-sky-800/40 px-2 py-0.5 rounded">
                            <ArrowUpRight className="w-3 h-3 mr-1" /> In Flight
                          </span>
                        )}
                        {payment.status === 'unreconciled' && (
                          <span className="inline-flex items-center text-[10px] text-slate-400 bg-slate-800/60 border border-slate-700 px-2 py-0.5 rounded">
                            <Clock className="w-3 h-3 mr-1" /> Awaiting Inflow
                          </span>
                        )}
                        {payment.status === 'ai_flagged' && (
                          <span className="inline-flex items-center text-[10px] text-rose-400 bg-rose-950/60 border border-rose-800/40 px-2 py-0.5 rounded">
                            <AlertTriangle className="w-3 h-3 mr-1" /> AI Discrepancy
                          </span>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* AI Match Gauge Strip */}
                  <div className="mt-3 pt-3 border-t border-[#1d2537] flex items-center justify-between text-xs">
                    <div className="flex items-center space-x-2">
                      <Sparkles className="w-3.5 h-3.5 text-[#d6b265]" />
                      <span className="text-slate-400 text-[11px]">AI Confidence:</span>
                      <span className={`font-mono font-bold text-[11px] ${
                        payment.aiMatchScore >= 90 ? 'text-emerald-400' : payment.aiMatchScore >= 75 ? 'text-amber-400' : 'text-rose-400'
                      }`}>
                        {payment.aiMatchScore}%
                      </span>
                    </div>

                    <div className="text-[11px] text-slate-400 flex items-center">
                      <span className="font-mono text-[#d6b265] mr-1">VIRTUAL NOSTRO:</span> {payment.virtualAccountId}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>

        {/* Right Column: AI Deep Reconciliation Inspector & Sovereign Telemetry (5 cols) */}
        <section className="lg:col-span-5 space-y-4">
          {selectedPayment ? (
            <div className="bg-[#0f131d] border border-[#2b2519] rounded-xl p-5 shadow-2xl relative overflow-hidden">
              {/* Background Luxury Accent */}
              <div className="absolute top-0 right-0 w-48 h-48 bg-gradient-to-bl from-[#d6b265]/10 to-transparent pointer-events-none rounded-full blur-2xl" />

              <div className="flex items-center justify-between border-b border-[#242c3e] pb-4">
                <div>
                  <div className="flex items-center space-x-2">
                    <Award className="w-4 h-4 text-[#d6b265]" />
                    <span className="text-[11px] uppercase tracking-widest text-[#d6b265] font-semibold">
                      Citi-AI Match Telemetry
                    </span>
                  </div>
                  <h2 className="text-lg font-bold text-white mt-1">{selectedPayment.trackingRef}</h2>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-slate-400 block font-mono">EXPECTED RECORD ID</span>
                  <span className="text-xs font-mono text-slate-200">{selectedPayment.id}</span>
                </div>
              </div>

              {/* Big Value Showcase */}
              <div className="mt-5 p-4 rounded-xl bg-gradient-to-r from-[#171c28] to-[#121622] border border-[#303a52]">
                <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Expected Nominal Sum</p>
                <div className="flex items-baseline justify-between mt-1">
                  <p className="text-2xl font-black text-[#fceecf] tracking-tight">
                    {formatCurrency(selectedPayment.amount, selectedPayment.currency)}
                  </p>
                  <span className="text-xs font-mono uppercase bg-[#283248] text-[#e8cf96] px-2 py-0.5 rounded border border-[#445375]">
                    {selectedPayment.currency}
                  </span>
                </div>
                <div className="mt-3 flex items-center justify-between text-xs text-slate-400 border-t border-[#262f44] pt-2">
                  <span>Assigned Collateral:</span>
                  <span className="text-slate-200 font-medium">{selectedPayment.collateralTier}</span>
                </div>
              </div>

              {/* AI Reasoning Module */}
              <div className="mt-5 p-4 rounded-xl bg-[#131926] border border-[#d6b265]/30 space-y-2.5">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-1.5">
                    <Cpu className="w-4 h-4 text-[#d6b265]" />
                    <span className="text-xs font-bold text-[#ecd8a5] uppercase tracking-wider">
                      Neural Cash-Flow Reasoning
                    </span>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 font-semibold bg-emerald-950/80 px-2 py-0.5 rounded border border-emerald-700/50">
                    {selectedPayment.aiMatchScore}% Deterministic
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed font-light">
                  {selectedPayment.aiMatchReason}
                </p>
                <div className="bg-[#0b0e17] p-2.5 rounded-lg border border-[#232c40] font-mono text-[11px] text-slate-400 space-y-1">
                  <div className="flex justify-between">
                    <span>Protocol Rails:</span>
                    <span className="text-[#ecd8a5]">{selectedPayment.reconciliationType}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Target Vault BIC:</span>
                    <span className="text-slate-200">{selectedPayment.counterpartyBic}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Modern Treasury Node:</span>
                    <span className="text-emerald-400">SYNCED_HEALTHY</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-5 space-y-2">
                <button
                  onClick={() => {
                    setPayments(prev =>
                      prev.map(p =>
                        p.id === selectedPayment.id
                          ? { ...p, status: 'reconciled', aiMatchScore: 100 }
                          : p
                      )
                    );
                    setSelectedPayment(prev => prev ? { ...prev, status: 'reconciled', aiMatchScore: 100 } : null);
                  }}
                  className="w-full py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center space-x-2 shadow-lg shadow-emerald-950/50"
                >
                  <FileCheck className="w-4 h-4" />
                  <span>Execute Sovereign Match & Settlement</span>
                </button>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => {
                      alert(`Exported Citi High-Value Ledger Audit for ${selectedPayment.id}`);
                    }}
                    className="py-2 px-3 rounded-lg bg-[#181f30] hover:bg-[#202940] text-slate-300 text-xs font-semibold border border-[#29344e] transition-all text-center"
                  >
                    Export SWIFT MT103
                  </button>
                  <button
                    onClick={() => {
                      setPayments(prev =>
                        prev.map(p =>
                          p.id === selectedPayment.id
                            ? { ...p, status: 'ai_flagged', aiMatchScore: 45.0, aiMatchReason: 'Manual compliance isolation initiated by Risk Desk.' }
                            : p
                        )
                      );
                      setSelectedPayment(prev => prev ? { ...prev, status: 'ai_flagged', aiMatchScore: 45.0, aiMatchReason: 'Manual compliance isolation initiated by Risk Desk.' } : null);
                    }}
                    className="py-2 px-3 rounded-lg bg-[#2b161c] hover:bg-[#3b1c24] text-rose-300 text-xs font-semibold border border-rose-900/50 transition-all text-center"
                  >
                    Hold / Flag Escrow
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="h-full min-h-[350px] bg-[#0f131d] border border-[#1e2536] rounded-xl flex flex-col items-center justify-center text-slate-500 p-6 text-center">
              <PieChart className="w-12 h-12 text-slate-600 mb-3" />
              <p className="text-sm font-medium">Select an expected payment from the pipeline</p>
              <p className="text-xs text-slate-600 mt-1">Deep AI cash flow matching telemetry will initialize</p>
            </div>
          )}

          {/* Live Micro-Ledger Horizon Tracker */}
          <div className="bg-[#0f131d] border border-[#202738] rounded-xl p-4">
            <h3 className="text-xs uppercase tracking-wider text-slate-400 font-semibold mb-3 flex items-center">
              <Activity className="w-4 h-4 text-[#d6b265] mr-2" />
              Sovereign Settlement Liquidity Window
            </h3>
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-slate-400">Target Settlement Cycle (GMT)</span>
                <span className="text-slate-200 font-mono">T+0 Continuous</span>
              </div>
              <div className="w-full bg-[#171d2b] h-2 rounded-full overflow-hidden">
                <div className="bg-gradient-to-r from-[#d6b265] to-emerald-400 h-full w-[78%]" />
              </div>
              <div className="flex justify-between text-[11px] text-slate-500 font-mono">
                <span>Fedwire RTGS: OPEN</span>
                <span>TARGET2: OPEN</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Creation Modal / Wizard */}
      {isWizardOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="bg-[#0e121a] border border-[#d6b265]/50 rounded-2xl w-full max-w-xl p-6 shadow-2xl relative">
            <button
              onClick={() => setIsWizardOpen(false)}
              className="absolute right-4 top-4 text-slate-400 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center space-x-2 mb-4">
              <div className="p-2 rounded-lg bg-[#272115] border border-[#d6b265]">
                <PlusCircle className="w-5 h-5 text-[#d6b265]" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Create Expected Inbound Payment</h3>
                <p className="text-xs text-slate-400">Institutional Escrow & Citi Modern Treasury Inflow Setup</p>
              </div>
            </div>

            <form onSubmit={handleCreatePayment} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Counterparty Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Abu Dhabi Investment Authority"
                    value={newPayment.counterpartyName}
                    onChange={e => setNewPayment({ ...newPayment, counterpartyName: e.target.value })}
                    className="w-full bg-[#151b27] border border-[#28334b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d6b265]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Counterparty BIC / SWIFT
                  </label>
                  <input
                    type="text"
                    placeholder="e.g. CITIUS33XXX"
                    value={newPayment.counterpartyBic}
                    onChange={e => setNewPayment({ ...newPayment, counterpartyBic: e.target.value.toUpperCase() })}
                    className="w-full bg-[#151b27] border border-[#28334b] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d6b265]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Expected Sum
                  </label>
                  <input
                    type="number"
                    step="any"
                    required
                    placeholder="50000000.00"
                    value={newPayment.amount}
                    onChange={e => setNewPayment({ ...newPayment, amount: e.target.value })}
                    className="w-full bg-[#151b27] border border-[#28334b] rounded-lg px-3 py-2 text-xs text-white font-mono focus:outline-none focus:border-[#d6b265]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Currency
                  </label>
                  <select
                    value={newPayment.currency}
                    onChange={e => setNewPayment({ ...newPayment, currency: e.target.value as any })}
                    className="w-full bg-[#151b27] border border-[#28334b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d6b265]"
                  >
                    <option value="USD">USD - US Dollar</option>
                    <option value="EUR">EUR - Euro (TARGET2)</option>
                    <option value="CHF">CHF - Swiss Franc (SIC)</option>
                    <option value="AED">AED - UAE Dirham</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Expected Inflow Date
                  </label>
                  <input
                    type="date"
                    value={newPayment.expectedDate}
                    onChange={e => setNewPayment({ ...newPayment, expectedDate: e.target.value })}
                    className="w-full bg-[#151b27] border border-[#28334b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d6b265]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                    Routing Channel
                  </label>
                  <select
                    value={newPayment.reconciliationType}
                    onChange={e => setNewPayment({ ...newPayment, reconciliationType: e.target.value as any })}
                    className="w-full bg-[#151b27] border border-[#28334b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d6b265]"
                  >
                    <option value="CITI_GLOBAL_MESH">Citi Global Mesh (Zero-Latency)</option>
                    <option value="SWIFT_GPI_INSTANT">SWIFT gpi Sovereign Instant</option>
                    <option value="FEDWIRE_SOVEREIGN">Fedwire Sovereign High-Value</option>
                    <option value="CHIPS_TIER1">CHIPS Tier-1 Settlement</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-1">
                  Escrow Collateral Classification
                </label>
                <select
                  value={newPayment.collateralTier}
                  onChange={e => setNewPayment({ ...newPayment, collateralTier: e.target.value as any })}
                  className="w-full bg-[#151b27] border border-[#28334b] rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-[#d6b265]"
                >
                  <option value="Tier 1 Prime Gold-Backed">Tier 1 Prime Gold-Backed</option>
                  <option value="AAA Sovereign Bond">AAA Sovereign Bond Collateral</option>
                  <option value="Cash Escrow Fed Reserve">Cash Escrow Fed Reserve Segregated</option>
                </select>
              </div>

              <div className="pt-4 flex justify-end space-x-3 border-t border-[#232b3d]">
                <button
                  type="button"
                  onClick={() => setIsWizardOpen(false)}
                  className="px-4 py-2 rounded-lg bg-[#181f2f] text-slate-300 text-xs font-semibold hover:bg-[#20293d]"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2 rounded-lg bg-gradient-to-r from-[#d6b265] to-[#a88238] text-slate-950 text-xs font-bold uppercase tracking-wider shadow-lg shadow-[#d6b265]/20 hover:brightness-110"
                >
                  Register Expected Inflow
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default SovereignExpectedPayments;