import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Cpu,
  ArrowUpRight,
  CheckCircle2,
  Clock,
  AlertTriangle,
  Key,
  Layers,
  RefreshCw,
  DollarSign,
  Globe,
  Lock,
  Sparkles,
  Filter,
  ChevronRight,
  Zap,
  Award,
  Search,
  X,
  FileText,
  Activity,
  Fingerprint,
  Send,
  Building2,
  TrendingUp
} from 'lucide-react';

export type PayoutStatus =
  | 'pending_ai_validation'
  | 'awaiting_multisig'
  | 'routing_liquidity'
  | 'settling_fedwire'
  | 'posted'
  | 'flagged_compliance';

export interface MultiSigSigner {
  id: string;
  name: string;
  role: string;
  institution: string;
  status: 'signed' | 'pending' | 'rejected';
  timestamp?: string;
  signatureHash?: string;
}

export interface LiquidityRoute {
  provider: 'Citibank Sovereign Gateway' | 'Modern Treasury Interbank' | 'Fedwire Real-Time RTGS' | 'CHIPS Prime Route' | 'SWIFT gpi Sovereign VIP';
  estimatedDurationMs: number;
  costBasisBps: number;
  aiConfidenceScore: number;
  liquidityPoolOrigin: string;
  settlementRiskIndex: number;
}

export interface LedgerAccountPayout {
  id: string;
  referenceNumber: string;
  createdAt: string;
  settledAt?: string;
  sourceLedgerAccountId: string;
  sourceLedgerAccountName: string;
  destinationAccountName: string;
  destinationBicIban: string;
  destinationBank: string;
  amount: number;
  currency: 'USD' | 'CHF' | 'EUR' | 'SGD' | 'XAU_OZ';
  status: PayoutStatus;
  aiRouting: LiquidityRoute;
  multisigMatrix: MultiSigSigner[];
  citibankComplianceId: string;
  modernTreasuryLedgerTxId: string;
  description: string;
  riskTier: 'Tier 0 - Sovereign Immunity' | 'Tier 1 - Ultra Institutional' | 'Tier 2 - High Net Worth Strategic';
}

const MOCK_PAYOUTS: LedgerAccountPayout[] = [
  {
    id: 'lap_sovereign_99812984',
    referenceNumber: 'CITI-SOV-PAY-2025-0891X',
    createdAt: '2025-02-23T14:32:00.000Z',
    sourceLedgerAccountId: 'la_citi_vault_chf_001',
    sourceLedgerAccountName: 'Citibank Zurich Sovereign Gold & Liquidity Reserve',
    destinationAccountName: 'GIC Private Sovereign Trust A-1',
    destinationBicIban: 'CITISGSGXXXX / SG88 CITI 0001 9928 1102 33',
    destinationBank: 'Citibank N.A. Singapore Sovereign Branch',
    amount: 145000000.0,
    currency: 'USD',
    status: 'awaiting_multisig',
    aiRouting: {
      provider: 'Citibank Sovereign Gateway',
      estimatedDurationMs: 420,
      costBasisBps: 0.12,
      aiConfidenceScore: 99.87,
      liquidityPoolOrigin: 'Citibank Global Intragroup Sovereign Pool #9',
      settlementRiskIndex: 0.001
    },
    multisigMatrix: [
      {
        id: 'sig_01',
        name: 'Alexander von Bern',
        role: 'Chief Investment Trustee',
        institution: 'Citibank Private Sovereign Office',
        status: 'signed',
        timestamp: '2025-02-23T14:35:12Z',
        signatureHash: '0x8fba...99c2e'
      },
      {
        id: 'sig_02',
        name: 'AI Sentinel Risk Kernel v9',
        role: 'Autonomous High-Value Validator',
        institution: 'Citibank Quantum Risk Engine',
        status: 'signed',
        timestamp: '2025-02-23T14:32:04Z',
        signatureHash: '0x3ac1...11de4'
      },
      {
        id: 'sig_03',
        name: 'Lady Eleanor Vance-Roth',
        role: 'Executive Sovereign Delegate',
        institution: 'Modern Treasury Interbank Council',
        status: 'pending'
      }
    ],
    citibankComplianceId: 'CITI-AML-SOV-ALPHA-9921',
    modernTreasuryLedgerTxId: 'ltx_mt_ledger_88491209348',
    description: 'Bilateral Cross-Border Sovereign Liquidity Sweep for Sovereign Wealth Fund Allocation',
    riskTier: 'Tier 0 - Sovereign Immunity'
  },
  {
    id: 'lap_sovereign_77491022',
    referenceNumber: 'CITI-SOV-PAY-2025-0890Z',
    createdAt: '2025-02-23T11:15:22.000Z',
    settledAt: '2025-02-23T11:15:23.820Z',
    sourceLedgerAccountId: 'la_citi_vault_usd_009',
    sourceLedgerAccountName: 'Citibank New York Institutional Deep Ledger #4',
    destinationAccountName: 'Royal Abu Dhabi Energy Reserve Co.',
    destinationBicIban: 'NBADAEAAXXX / AE09 0330 0000 1198 2234 11',
    destinationBank: 'First Abu Dhabi Bank / Modern Treasury Settlement Route',
    amount: 380000000.0,
    currency: 'USD',
    status: 'posted',
    aiRouting: {
      provider: 'Fedwire Real-Time RTGS',
      estimatedDurationMs: 1820,
      costBasisBps: 0.05,
      aiConfidenceScore: 99.99,
      liquidityPoolOrigin: 'Federal Reserve Bank of New York Fedwire Sovereign Corridor',
      settlementRiskIndex: 0.0
    },
    multisigMatrix: [
      {
        id: 'sig_01',
        name: 'Sheikh Mansoor Al-Qasimi',
        role: 'Sovereign Treasury Director',
        institution: 'Sovereign Fund Protocol',
        status: 'signed',
        timestamp: '2025-02-23T11:12:00Z',
        signatureHash: '0x12a9...fe09a'
      },
      {
        id: 'sig_02',
        name: 'Julian Montgomery, CFA',
        role: 'Global Head of Liquidity Management',
        institution: 'Citibank Institutional Clients Group',
        status: 'signed',
        timestamp: '2025-02-23T11:14:18Z',
        signatureHash: '0x77c2...a89f3'
      },
      {
        id: 'sig_03',
        name: 'Autonomous Co-Signer Node #12',
        role: 'AI Ledger Integrity Guard',
        institution: 'Modern Treasury Multi-Cloud Consensus',
        status: 'signed',
        timestamp: '2025-02-23T11:14:50Z',
        signatureHash: '0xcc89...b4412'
      }
    ],
    citibankComplianceId: 'CITI-AML-SOV-OMEGA-0012',
    modernTreasuryLedgerTxId: 'ltx_mt_ledger_77319984712',
    description: 'Refined Hydrocarbon & Rare-Earth Collateralized Settlement Batch',
    riskTier: 'Tier 0 - Sovereign Immunity'
  },
  {
    id: 'lap_sovereign_55392019',
    referenceNumber: 'CITI-SOV-PAY-2025-0889A',
    createdAt: '2025-02-23T09:00:10.000Z',
    sourceLedgerAccountId: 'la_citi_vault_chf_992',
    sourceLedgerAccountName: 'Geneva Private Banking Sovereign Ledger',
    destinationAccountName: 'Monaco Dynastic Family Reserve 1904',
    destinationBicIban: 'BARCMCMXXXX / MC58 3000 2005 6700 0012 3456 78',
    destinationBank: 'Barclays Bank Private Monaco & Citibank Cross-Clear',
    amount: 52000000.0,
    currency: 'CHF',
    status: 'routing_liquidity',
    aiRouting: {
      provider: 'Modern Treasury Interbank',
      estimatedDurationMs: 840,
      costBasisBps: 0.18,
      aiConfidenceScore: 98.65,
      liquidityPoolOrigin: 'Swiss National Bank / SIX Interbank Clearing Feed',
      settlementRiskIndex: 0.004
    },
    multisigMatrix: [
      {
        id: 'sig_01',
        name: 'Countess Beatrix de Monferrato',
        role: 'Principal Fiduciary Trustee',
        institution: 'Private Dynastic Office',
        status: 'signed',
        timestamp: '2025-02-23T09:02:11Z',
        signatureHash: '0xee14...19ab9'
      },
      {
        id: 'sig_02',
        name: 'Henrik Larsson, Ph.D.',
        role: 'VP Sovereign Algorithm Risk',
        institution: 'Citibank Private Sovereign Office',
        status: 'signed',
        timestamp: '2025-02-23T09:04:40Z',
        signatureHash: '0x55aa...3341c'
      },
      {
        id: 'sig_03',
        name: 'AI Sentinel Risk Kernel v9',
        role: 'Autonomous High-Value Validator',
        institution: 'Citibank Quantum Risk Engine',
        status: 'signed',
        timestamp: '2025-02-23T09:05:01Z',
        signatureHash: '0xaa44...88f11'
      }
    ],
    citibankComplianceId: 'CITI-AML-SOV-BETA-7711',
    modernTreasuryLedgerTxId: 'ltx_mt_ledger_66190023418',
    description: 'Sovereign Physical Gold Purchase & Inter-vault Equalization Payout',
    riskTier: 'Tier 1 - Ultra Institutional'
  }
];

export const ImperialLedgerPayouts: React.FC = () => {
  const [payouts, setPayouts] = useState<LedgerAccountPayout[]>(MOCK_PAYOUTS);
  const [selectedPayout, setSelectedPayout] = useState<LedgerAccountPayout | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [isAiOptimizing, setIsAiOptimizing] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [signingInProgress, setSigningInProgress] = useState<string | null>(null);
  const [liveTelemetryTicker, setLiveTelemetryTicker] = useState<number>(0);

  // New Payout Form State
  const [newSourceLedger, setNewSourceLedger] = useState('la_citi_vault_usd_009');
  const [newDestinationName, setNewDestinationName] = useState('');
  const [newDestinationIban, setNewDestinationIban] = useState('');
  const [newDestinationBank, setNewDestinationBank] = useState('');
  const [newAmount, setNewAmount] = useState<string>('');
  const [newCurrency, setNewCurrency] = useState<'USD' | 'CHF' | 'EUR' | 'SGD' | 'XAU_OZ'>('USD');
  const [newDescription, setNewDescription] = useState('');
  const [newRiskTier, setNewRiskTier] = useState<LedgerAccountPayout['riskTier']>('Tier 0 - Sovereign Immunity');

  // Simulated Quantum Pulse
  useEffect(() => {
    const interval = setInterval(() => {
      setLiveTelemetryTicker((prev) => (prev + 1) % 1000000);
    }, 2800);
    return () => clearInterval(interval);
  }, []);

  const totalVaultVolumeUSD = useMemo(() => {
    return payouts.reduce((acc, p) => acc + (p.currency === 'USD' ? p.amount : p.amount * 1.12), 0);
  }, [payouts]);

  const pendingMultiSigCount = useMemo(() => {
    return payouts.filter((p) => p.status === 'awaiting_multisig').length;
  }, [payouts]);

  const filteredPayouts = useMemo(() => {
    return payouts.filter((payout) => {
      const matchesSearch =
        payout.referenceNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.destinationAccountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.destinationBank.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.sourceLedgerAccountName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        payout.citibankComplianceId.toLowerCase().includes(searchQuery.toLowerCase());

      const matchesStatus = statusFilter === 'all' || payout.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [payouts, searchQuery, statusFilter]);

  const formatCurrency = (val: number, cur: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: cur === 'XAU_OZ' ? 'USD' : cur,
      maximumFractionDigits: 2
    }).format(val) + (cur === 'XAU_OZ' ? ' (Gold oz)' : '');
  };

  const handleAiDeepReroute = useCallback(() => {
    setIsAiOptimizing(true);
    setTimeout(() => {
      setPayouts((prev) =>
        prev.map((p) => {
          if (p.status === 'routing_liquidity' || p.status === 'awaiting_multisig') {
            return {
              ...p,
              aiRouting: {
                ...p.aiRouting,
                aiConfidenceScore: Math.min(99.99, Number((p.aiRouting.aiConfidenceScore + 0.05).toFixed(2))),
                costBasisBps: Math.max(0.01, Number((p.aiRouting.costBasisBps - 0.02).toFixed(2))),
                estimatedDurationMs: Math.max(250, p.aiRouting.estimatedDurationMs - 120)
              }
            };
          }
          return p;
        })
      );
      setIsAiOptimizing(false);
    }, 1200);
  }, []);

  const handleSignMultiSig = (payoutId: string, signerId: string) => {
    setSigningInProgress(`${payoutId}_${signerId}`);
    setTimeout(() => {
      setPayouts((prev) =>
        prev.map((p) => {
          if (p.id !== payoutId) return p;
          const updatedSigners = p.multisigMatrix.map((s) => {
            if (s.id === signerId) {
              return {
                ...s,
                status: 'signed' as const,
                timestamp: new Date().toISOString(),
                signatureHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
              };
            }
            return s;
          });

          const allSigned = updatedSigners.every((s) => s.status === 'signed');
          const nextStatus: PayoutStatus = allSigned ? 'settling_fedwire' : p.status;

          return {
            ...p,
            multisigMatrix: updatedSigners,
            status: nextStatus
          };
        })
      );

      // Also update selectedPayout modal view if open
      if (selectedPayout && selectedPayout.id === payoutId) {
        setSelectedPayout((prev) => {
          if (!prev) return null;
          const updatedSigners = prev.multisigMatrix.map((s) => {
            if (s.id === signerId) {
              return {
                ...s,
                status: 'signed' as const,
                timestamp: new Date().toISOString(),
                signatureHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
              };
            }
            return s;
          });
          const allSigned = updatedSigners.every((s) => s.status === 'signed');
          return {
            ...prev,
            multisigMatrix: updatedSigners,
            status: allSigned ? 'settling_fedwire' : prev.status
          };
        });
      }

      setSigningInProgress(null);
    }, 1500);
  };

  const handleCreatePayout = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newAmount || !newDestinationName || !newDestinationIban) return;

    const numAmount = parseFloat(newAmount);
    const newPayout: LedgerAccountPayout = {
      id: `lap_sovereign_${Math.floor(10000000 + Math.random() * 90000000)}`,
      referenceNumber: `CITI-SOV-PAY-2025-${Math.floor(1000 + Math.random() * 9000)}X`,
      createdAt: new Date().toISOString(),
      sourceLedgerAccountId: newSourceLedger,
      sourceLedgerAccountName:
        newSourceLedger === 'la_citi_vault_usd_009'
          ? 'Citibank New York Institutional Deep Ledger #4'
          : 'Citibank Zurich Sovereign Gold & Liquidity Reserve',
      destinationAccountName: newDestinationName,
      destinationBicIban: newDestinationIban,
      destinationBank: newDestinationBank || 'Citibank Sovereign Gateway Direct',
      amount: numAmount,
      currency: newCurrency,
      status: 'awaiting_multisig',
      aiRouting: {
        provider: 'Citibank Sovereign Gateway',
        estimatedDurationMs: 380,
        costBasisBps: 0.08,
        aiConfidenceScore: 99.95,
        liquidityPoolOrigin: 'Citibank Tier-0 Interbank Deep Liquidity Bridge',
        settlementRiskIndex: 0.0002
      },
      multisigMatrix: [
        {
          id: 'sig_usr_01',
          name: 'Chief Sovereign Trustee (Session Key)',
          role: 'Primary Account Signatory',
          institution: 'Citibank Sovereign Private Division',
          status: 'signed',
          timestamp: new Date().toISOString(),
          signatureHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        },
        {
          id: 'sig_ai_02',
          name: 'AI Sentinel Risk Kernel v9',
          role: 'Autonomous High-Value Validator',
          institution: 'Citibank Quantum Risk Engine',
          status: 'signed',
          timestamp: new Date().toISOString(),
          signatureHash: '0x' + Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('')
        },
        {
          id: 'sig_req_03',
          name: 'Executive Modern Treasury Co-Signer',
          role: 'Secondary Interbank Validator',
          institution: 'Modern Treasury Interbank Council',
          status: 'pending'
        }
      ],
      citibankComplianceId: `CITI-AML-SOV-${Math.floor(10000 + Math.random() * 90000)}`,
      modernTreasuryLedgerTxId: `ltx_mt_ledger_${Math.floor(10000000000 + Math.random() * 90000000000)}`,
      description: newDescription || 'Ultra High-Value Sovereign Ledger Account Payout Dispatch',
      riskTier: newRiskTier
    };

    setPayouts([newPayout, ...payouts]);
    setShowCreateModal(false);
    // Reset form
    setNewAmount('');
    setNewDestinationName('');
    setNewDestinationIban('');
    setNewDestinationBank('');
    setNewDescription('');
  };

  const getStatusBadge = (status: PayoutStatus) => {
    switch (status) {
      case 'posted':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-[0_0_12px_rgba(16,185,129,0.2)]">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Settled & Posted
          </span>
        );
      case 'awaiting_multisig':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-amber-950/80 border border-amber-500/40 text-amber-300 shadow-[0_0_12px_rgba(245,158,11,0.2)]">
            <Key className="w-3.5 h-3.5 text-amber-400" /> Multi-Sig Required (2/3)
          </span>
        );
      case 'routing_liquidity':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-sky-950/80 border border-sky-500/40 text-sky-300 shadow-[0_0_12px_rgba(14,165,233,0.2)]">
            <Zap className="w-3.5 h-3.5 text-sky-400 animate-pulse" /> AI Liquidity Routing
          </span>
        );
      case 'settling_fedwire':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-indigo-950/80 border border-indigo-500/40 text-indigo-300 shadow-[0_0_12px_rgba(99,102,241,0.2)]">
            <RefreshCw className="w-3.5 h-3.5 text-indigo-400 animate-spin" /> RTGS Settlement
          </span>
        );
      case 'pending_ai_validation':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-purple-950/80 border border-purple-500/40 text-purple-300">
            <Cpu className="w-3.5 h-3.5 text-purple-400" /> AI Pre-Clear
          </span>
        );
      case 'flagged_compliance':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold tracking-wider uppercase bg-rose-950/80 border border-rose-500/40 text-rose-300">
            <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Compliance Lock
          </span>
        );
    }
  };

  return (
    <div className="w-full min-h-screen bg-stone-950 text-stone-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-amber-500 selection:text-stone-950">
      {/* Background Ambient Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[50vw] h-[50vw] bg-gradient-to-br from-amber-500/10 via-yellow-600/5 to-transparent rounded-full blur-3xl" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[50vw] h-[50vw] bg-gradient-to-tl from-emerald-500/10 via-amber-700/5 to-transparent rounded-full blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto space-y-8">
        {/* TOP VIP HEADER */}
        <header className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 pb-6 border-b border-amber-500/20">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600 via-amber-500 to-yellow-400 shadow-[0_0_25px_rgba(245,158,11,0.4)] text-stone-950">
                <Building2 className="w-7 h-7 stroke-[2.2]" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-mono font-bold tracking-widest text-amber-400 uppercase bg-amber-950/60 px-2 py-0.5 rounded border border-amber-500/30">
                    Citibank Sovereign Private Banking × Modern Treasury
                  </span>
                  <span className="text-[10px] font-mono text-stone-400">ENDPOINT: /api/ledger_account_payouts</span>
                </div>
                <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent">
                  Imperial Ledger Account Payouts
                </h1>
              </div>
            </div>
            <p className="text-sm text-stone-400 max-w-2xl">
              High-value autonomous payouts powered by Citibank AI Liquidity Routing, multi-signature cryptographic authorization, and real-time Modern Treasury ledger synchronization.
            </p>
          </div>

          {/* Quick Action Station */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleAiDeepReroute}
              disabled={isAiOptimizing}
              className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-stone-900 border border-amber-500/30 hover:border-amber-400 text-amber-300 hover:text-amber-200 text-xs font-mono font-semibold transition-all duration-200 shadow-[0_0_15px_rgba(0,0,0,0.5)] disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isAiOptimizing ? 'animate-spin text-amber-400' : 'text-amber-400'}`} />
              {isAiOptimizing ? 'Optimizing AI Routing...' : 'Trigger AI Routing Matrix'}
            </button>

            <button
              onClick={() => setShowCreateModal(true)}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_0_25px_rgba(245,158,11,0.35)] transition-all duration-200"
            >
              <ArrowUpRight className="w-4 h-4 stroke-[2.5]" />
              Dispatch Sovereign Payout
            </button>
          </div>
        </header>

        {/* METRICS & LIQUIDITY TELEMETRY BANNER */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <DollarSign className="w-16 h-16 text-amber-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400">Total Active Vault Pool</span>
            <div className="text-2xl font-black font-mono text-amber-200 mt-1">
              {formatCurrency(totalVaultVolumeUSD, 'USD')}
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400 mt-2">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>Modern Treasury Multi-Ledger Synced</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Key className="w-16 h-16 text-amber-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400">Pending Multi-Sig Consents</span>
            <div className="text-2xl font-black font-mono text-yellow-300 mt-1">
              {pendingMultiSigCount} <span className="text-xs font-normal text-stone-400">Payouts Pending</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-amber-400/80 mt-2 font-mono">
              <Lock className="w-3.5 h-3.5" />
              <span>Tier-0 Sovereign Multi-Sig Enforced</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Sparkles className="w-16 h-16 text-amber-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400">AI Routing Efficiency</span>
            <div className="text-2xl font-black font-mono text-emerald-300 mt-1">
              99.94% <span className="text-xs font-normal text-stone-400">Cost Reduced</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-emerald-400/80 mt-2 font-mono">
              <Cpu className="w-3.5 h-3.5" />
              <span>Avg Latency: 480ms (Citibank Deep-Book)</span>
            </div>
          </div>

          <div className="p-5 rounded-2xl bg-stone-900/80 border border-amber-500/20 backdrop-blur-xl relative overflow-hidden group hover:border-amber-500/40 transition-all">
            <div className="absolute top-0 right-0 p-3 opacity-10 group-hover:opacity-20 transition-opacity">
              <Fingerprint className="w-16 h-16 text-amber-400" />
            </div>
            <span className="text-[11px] font-mono uppercase tracking-widest text-stone-400">Quantum Sovereign Pulse</span>
            <div className="text-xl font-bold font-mono text-stone-200 mt-1 flex items-center gap-2">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
              <span>SYNC-{liveTelemetryTicker.toString(16).toUpperCase().padStart(6, '0')}</span>
            </div>
            <div className="flex items-center gap-1 text-[11px] text-stone-400 mt-2 font-mono">
              <ShieldCheck className="w-3.5 h-3.5 text-amber-400" />
              <span>Citibank AML & Fedwire RTGS Prime</span>
            </div>
          </div>
        </section>

        {/* SEARCH, FILTER & TABLE CONTAINER */}
        <section className="bg-stone-900/60 border border-amber-500/20 rounded-2xl backdrop-blur-2xl p-4 sm:p-6 space-y-5 shadow-2xl">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            {/* Search Input */}
            <div className="relative w-full md:w-96">
              <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-amber-400/70" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search reference, IBAN, ledger, recipient..."
                className="w-full pl-10 pr-4 py-2 bg-stone-950/70 border border-amber-500/20 rounded-xl text-xs font-mono text-stone-200 placeholder-stone-500 focus:outline-none focus:border-amber-400/60 focus:ring-1 focus:ring-amber-400/30 transition-all"
              />
            </div>

            {/* Filter Tabs */}
            <div className="flex items-center gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0">
              <Filter className="w-3.5 h-3.5 text-stone-500 ml-1 mr-1" />
              {[
                { label: 'All Payouts', value: 'all' },
                { label: 'Awaiting Multi-Sig', value: 'awaiting_multisig' },
                { label: 'AI Routing', value: 'routing_liquidity' },
                { label: 'Settled & Posted', value: 'posted' }
              ].map((tab) => (
                <button
                  key={tab.value}
                  onClick={() => setStatusFilter(tab.value)}
                  className={`px-3 py-1.5 rounded-lg text-xs font-mono transition-all whitespace-nowrap ${
                    statusFilter === tab.value
                      ? 'bg-amber-500 text-stone-950 font-bold shadow-[0_0_12px_rgba(245,158,11,0.3)]'
                      : 'bg-stone-950/40 text-stone-400 hover:text-stone-200 border border-stone-800'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {/* TABLE OF PAYOUTS */}
          <div className="overflow-x-auto rounded-xl border border-amber-500/10">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-stone-950/80 border-b border-amber-500/20 text-[10px] font-mono uppercase tracking-widest text-amber-400/80">
                  <th className="py-3.5 px-4 font-semibold">Reference & Risk</th>
                  <th className="py-3.5 px-4 font-semibold">Source / Destination Account</th>
                  <th className="py-3.5 px-4 font-semibold text-right">Amount</th>
                  <th className="py-3.5 px-4 font-semibold">AI Routing Engine</th>
                  <th className="py-3.5 px-4 font-semibold">Status / Multi-Sig</th>
                  <th className="py-3.5 px-4 font-semibold text-center">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-800/60 text-xs">
                {filteredPayouts.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-stone-500 font-mono text-xs">
                      No sovereign ledger payouts found matching criteria.
                    </td>
                  </tr>
                ) : (
                  filteredPayouts.map((payout) => {
                    const signedCount = payout.multisigMatrix.filter((s) => s.status === 'signed').length;
                    const totalSigners = payout.multisigMatrix.length;

                    return (
                      <tr
                        key={payout.id}
                        className="hover:bg-amber-500/[0.03] transition-colors group cursor-pointer"
                        onClick={() => setSelectedPayout(payout)}
                      >
                        {/* Reference & Tier */}
                        <td className="py-4 px-4 align-top">
                          <div className="font-mono font-bold text-amber-200 group-hover:text-amber-300 flex items-center gap-1.5">
                            {payout.referenceNumber}
                            <ArrowUpRight className="w-3 h-3 text-amber-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                          </div>
                          <div className="text-[10px] font-mono text-stone-500 mt-1 flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3 text-amber-400/60" />
                            {payout.riskTier}
                          </div>
                          <div className="text-[10px] font-mono text-stone-600 mt-0.5">
                            {new Date(payout.createdAt).toLocaleString()}
                          </div>
                        </td>

                        {/* Accounts */}
                        <td className="py-4 px-4 align-top max-w-xs">
                          <div className="font-semibold text-stone-200 truncate">
                            {payout.destinationAccountName}
                          </div>
                          <div className="text-[10px] font-mono text-stone-400 truncate">
                            {payout.destinationBank}
                          </div>
                          <div className="text-[10px] font-mono text-amber-400/60 truncate mt-1">
                            From: {payout.sourceLedgerAccountName}
                          </div>
                        </td>

                        {/* Amount */}
                        <td className="py-4 px-4 align-top text-right font-mono">
                          <div className="text-base font-black text-amber-300">
                            {formatCurrency(payout.amount, payout.currency)}
                          </div>
                          <div className="text-[10px] text-stone-500 uppercase tracking-widest">
                            {payout.currency} Ledger Asset
                          </div>
                        </td>

                        {/* AI Routing */}
                        <td className="py-4 px-4 align-top">
                          <div className="flex items-center gap-1 text-[11px] font-mono text-stone-300">
                            <Cpu className="w-3 h-3 text-amber-400" />
                            {payout.aiRouting.provider}
                          </div>
                          <div className="text-[10px] font-mono text-emerald-400 mt-0.5">
                            Score: {payout.aiRouting.aiConfidenceScore}% | {payout.aiRouting.estimatedDurationMs}ms
                          </div>
                          <div className="text-[9px] font-mono text-stone-500 truncate max-w-[200px] mt-0.5">
                            Pool: {payout.aiRouting.liquidityPoolOrigin}
                          </div>
                        </td>

                        {/* Status & Multi-sig */}
                        <td className="py-4 px-4 align-top space-y-1.5">
                          {getStatusBadge(payout.status)}
                          <div className="flex items-center gap-1.5 text-[10px] font-mono text-stone-400">
                            <Lock className="w-3 h-3 text-amber-400/70" />
                            <span>
                              Signatures: <span className="text-amber-300 font-bold">{signedCount}</span>/{totalSigners}
                            </span>
                          </div>
                        </td>

                        {/* Action */}
                        <td className="py-4 px-4 align-top text-center" onClick={(e) => e.stopPropagation()}>
                          <button
                            onClick={() => setSelectedPayout(payout)}
                            className="px-3 py-1 rounded-lg bg-stone-900 border border-amber-500/30 hover:border-amber-400 text-stone-300 hover:text-amber-200 text-xs font-mono transition-all"
                          >
                            Inspect
                          </button>
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </section>

        {/* MODAL: DETAIL & MULTI-SIG APPROVAL CONSOLE */}
        {selectedPayout && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-stone-900 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 sm:p-8 space-y-6 text-stone-200">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-amber-500/20 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                      Citibank Sovereign Audit Core
                    </span>
                    <span className="text-xs font-mono text-stone-400">ID: {selectedPayout.id}</span>
                  </div>
                  <h2 className="text-2xl font-black text-amber-200 mt-1 flex items-center gap-3">
                    {selectedPayout.referenceNumber}
                  </h2>
                  <p className="text-xs text-stone-400 mt-1">{selectedPayout.description}</p>
                </div>
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 text-stone-400 hover:text-amber-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Status and Payout Overview */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 rounded-xl bg-stone-950/70 border border-amber-500/10">
                  <span className="text-[10px] font-mono uppercase text-stone-400">Disbursement Amount</span>
                  <div className="text-xl font-bold font-mono text-amber-300 mt-0.5">
                    {formatCurrency(selectedPayout.amount, selectedPayout.currency)}
                  </div>
                  <span className="text-[10px] font-mono text-stone-500">Asset: {selectedPayout.currency}</span>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/70 border border-amber-500/10">
                  <span className="text-[10px] font-mono uppercase text-stone-400">Current Payout Status</span>
                  <div className="mt-1">{getStatusBadge(selectedPayout.status)}</div>
                  <span className="text-[10px] font-mono text-stone-500 block mt-1">
                    Compliance AML: {selectedPayout.citibankComplianceId}
                  </span>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/70 border border-amber-500/10">
                  <span className="text-[10px] font-mono uppercase text-stone-400">Modern Treasury Ledger Tx</span>
                  <div className="text-xs font-mono font-semibold text-stone-200 mt-1 truncate">
                    {selectedPayout.modernTreasuryLedgerTxId}
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 mt-1 block">
                    Source: {selectedPayout.sourceLedgerAccountId}
                  </span>
                </div>
              </div>

              {/* Beneficiary & Routing Breakdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 rounded-xl bg-stone-950/40 border border-stone-800 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Globe className="w-3.5 h-3.5" /> Destination Sovereign Entity
                  </h4>
                  <div className="text-sm font-semibold text-stone-100">{selectedPayout.destinationAccountName}</div>
                  <div className="text-xs font-mono text-stone-400">{selectedPayout.destinationBank}</div>
                  <div className="text-xs font-mono text-amber-300/80 bg-stone-950 p-2 rounded border border-stone-800 break-all">
                    IBAN/BIC: {selectedPayout.destinationBicIban}
                  </div>
                </div>

                <div className="p-4 rounded-xl bg-stone-950/40 border border-stone-800 space-y-2">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Cpu className="w-3.5 h-3.5" /> AI Liquidity Routing Telemetry
                  </h4>
                  <div className="text-xs space-y-1 font-mono text-stone-300">
                    <div className="flex justify-between">
                      <span className="text-stone-500">Route Method:</span>
                      <span className="text-stone-200 font-semibold">{selectedPayout.aiRouting.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">AI Confidence:</span>
                      <span className="text-emerald-400">{selectedPayout.aiRouting.aiConfidenceScore}%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Execution Latency:</span>
                      <span>{selectedPayout.aiRouting.estimatedDurationMs} ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-stone-500">Intragroup Cost Basis:</span>
                      <span>{selectedPayout.aiRouting.costBasisBps} bps</span>
                    </div>
                    <div className="flex justify-between truncate">
                      <span className="text-stone-500">Liquidity Origin:</span>
                      <span className="text-stone-300 truncate">{selectedPayout.aiRouting.liquidityPoolOrigin}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Multi-Sig Signer Matrix */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-amber-400 flex items-center gap-1.5">
                    <Key className="w-3.5 h-3.5" /> Multi-Signature Authorization Workflow (2/3 Quorum)
                  </h4>
                  <span className="text-[10px] font-mono text-stone-500">Hardware Security Module / Ed25519</span>
                </div>

                <div className="space-y-2">
                  {selectedPayout.multisigMatrix.map((signer) => {
                    const isPending = signer.status === 'pending';
                    const isThisSigning = signingInProgress === `${selectedPayout.id}_${signer.id}`;

                    return (
                      <div
                        key={signer.id}
                        className="flex flex-col sm:flex-row sm:items-center justify-between p-3.5 rounded-xl bg-stone-950/70 border border-stone-800 gap-3"
                      >
                        <div className="space-y-0.5">
                          <div className="flex items-center gap-2">
                            <span className="text-xs font-bold text-stone-200">{signer.name}</span>
                            <span className="text-[10px] font-mono text-stone-400">({signer.role})</span>
                          </div>
                          <div className="text-[10px] font-mono text-stone-500">{signer.institution}</div>
                          {signer.signatureHash && (
                            <div className="text-[9px] font-mono text-amber-400/80">
                              Sig: {signer.signatureHash} • Signed at: {new Date(signer.timestamp || '').toLocaleTimeString()}
                            </div>
                          )}
                        </div>

                        <div>
                          {signer.status === 'signed' ? (
                            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-mono font-semibold bg-emerald-950/80 text-emerald-300 border border-emerald-500/30">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Authorized
                            </span>
                          ) : (
                            <button
                              onClick={() => handleSignMultiSig(selectedPayout.id, signer.id)}
                              disabled={isThisSigning}
                              className="w-full sm:w-auto flex items-center justify-center gap-1.5 px-4 py-1.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-stone-950 font-mono text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_0_15px_rgba(245,158,11,0.25)] transition-all disabled:opacity-50"
                            >
                              {isThisSigning ? (
                                <>
                                  <RefreshCw className="w-3 h-3 animate-spin" /> Cryptographic Sign...
                                </>
                              ) : (
                                <>
                                  <Fingerprint className="w-3.5 h-3.5" /> Authorize & Sign
                                </>
                              )}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Modal Footer */}
              <div className="flex items-center justify-end gap-3 pt-4 border-t border-amber-500/20">
                <button
                  onClick={() => setSelectedPayout(null)}
                  className="px-4 py-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-stone-700 text-stone-400 text-xs font-mono transition-all"
                >
                  Close Console
                </button>
              </div>
            </div>
          </div>
        )}

        {/* MODAL: DISPATCH SOVEREIGN PAYOUT */}
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-stone-950/80 backdrop-blur-md">
            <div className="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-stone-900 border border-amber-500/30 rounded-2xl shadow-[0_0_50px_rgba(245,158,11,0.2)] p-6 sm:p-8 space-y-6 text-stone-200">
              <div className="flex items-start justify-between border-b border-amber-500/20 pb-4">
                <div>
                  <span className="text-xs font-mono font-bold uppercase tracking-widest text-amber-400 bg-amber-950/80 px-2 py-0.5 rounded border border-amber-500/30">
                    Citibank Sovereign Dispatch
                  </span>
                  <h3 className="text-2xl font-black text-amber-200 mt-1">Initiate Ledger Payout</h3>
                  <p className="text-xs text-stone-400 mt-0.5">
                    POST to Modern Treasury Ledger Account Payout endpoint with AI liquidity optimization.
                  </p>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="p-2 rounded-xl bg-stone-950 border border-stone-800 hover:border-amber-500 text-stone-400 hover:text-amber-300 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreatePayout} className="space-y-4">
                {/* Source Ledger Account */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                    Originating Ledger Account
                  </label>
                  <select
                    value={newSourceLedger}
                    onChange={(e) => setNewSourceLedger(e.target.value)}
                    className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="la_citi_vault_usd_009">
                      Citibank New York Institutional Deep Ledger #4 (USD 1.84B Reserve)
                    </option>
                    <option value="la_citi_vault_chf_001">
                      Citibank Zurich Sovereign Gold & Liquidity Reserve (CHF 2.20B Reserve)
                    </option>
                  </select>
                </div>

                {/* Amount & Currency */}
                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                      Disbursement Amount
                    </label>
                    <input
                      type="number"
                      step="any"
                      required
                      placeholder="e.g. 50000000"
                      value={newAmount}
                      onChange={(e) => setNewAmount(e.target.value)}
                      className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                      Asset / Currency
                    </label>
                    <select
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value as any)}
                      className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-400"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CHF">CHF (Fr)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="SGD">SGD (S$)</option>
                      <option value="XAU_OZ">XAU (Gold Oz)</option>
                    </select>
                  </div>
                </div>

                {/* Beneficiary Entity */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                    Beneficiary Entity / Legal Sovereign Name
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Sovereign Wealth Reserve Entity VII"
                    value={newDestinationName}
                    onChange={(e) => setNewDestinationName(e.target.value)}
                    className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* IBAN / BIC */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                      Destination IBAN / Account Number
                    </label>
                    <input
                      type="text"
                      required
                      placeholder="e.g. SG88 CITI 0001 9928 1102 33"
                      value={newDestinationIban}
                      onChange={(e) => setNewDestinationIban(e.target.value)}
                      className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                      Destination Bank / BIC
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Citibank N.A. Private Branch"
                      value={newDestinationBank}
                      onChange={(e) => setNewDestinationBank(e.target.value)}
                      className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                    />
                  </div>
                </div>

                {/* Risk Classification Tier */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                    Sovereign Compliance Risk Tier
                  </label>
                  <select
                    value={newRiskTier}
                    onChange={(e) => setNewRiskTier(e.target.value as any)}
                    className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 focus:outline-none focus:border-amber-400"
                  >
                    <option value="Tier 0 - Sovereign Immunity">Tier 0 - Sovereign Immunity (Expedited Multi-Sig)</option>
                    <option value="Tier 1 - Ultra Institutional">Tier 1 - Ultra Institutional (Citibank VP Co-Sign)</option>
                    <option value="Tier 2 - High Net Worth Strategic">Tier 2 - High Net Worth Strategic</option>
                  </select>
                </div>

                {/* Description */}
                <div>
                  <label className="block text-xs font-mono uppercase tracking-wider text-amber-400 mb-1">
                    Ledger Audit Narration
                  </label>
                  <textarea
                    rows={2}
                    placeholder="Enter fiduciary memorandum or transaction purpose..."
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                    className="w-full bg-stone-950 border border-amber-500/30 rounded-xl p-3 text-xs font-mono text-stone-200 placeholder-stone-600 focus:outline-none focus:border-amber-400"
                  />
                </div>

                {/* Submit button */}
                <div className="pt-2 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-4 py-2.5 rounded-xl bg-stone-950 border border-stone-800 text-stone-400 text-xs font-mono hover:text-stone-200"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-stone-950 text-xs font-bold uppercase tracking-wider hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all"
                  >
                    <Send className="w-4 h-4" /> Dispatch Payout
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ImperialLedgerPayouts;