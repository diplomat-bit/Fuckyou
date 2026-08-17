import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldAlert,
  RefreshCw,
  Cpu,
  Database,
  Lock,
  Layers,
  Activity,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  Terminal,
  Sliders,
  ArrowUpRight,
  Zap,
  Sparkles,
  Server,
  Clock,
  Coins,
  FileCheck,
  Radio,
  ArrowDownRight,
  FileText,
  KeyRound
} from 'lucide-react';

export interface ShadowTransaction {
  id: string;
  modernTreasuryLedgerId: string;
  citiReferenceId: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'SGD' | 'AED';
  priorityTier: 'TIER-0_SOVEREIGN' | 'TIER-1_ULTRA_HNW' | 'TIER-2_INSTITUTIONAL';
  status: 'QUEUED' | 'SHADOW_POSTED' | 'AI_VALIDATED' | 'RECONCILING' | 'RECONCILED' | 'REJECTED';
  riskScore: number;
  aiVerificationHash: string;
  timestamp: string;
  description: string;
  ledgerImpact: {
    debitAccount: string;
    creditAccount: string;
    syntheticBalanceAfter: number;
  };
}

export interface MaintenanceStatus {
  citiConnectStatus: 'OFFLINE_MAINTENANCE' | 'DEGRADED' | 'HEALTHY';
  modernTreasuryBridge: 'SHADOW_ACTIVE' | 'HOT_STANDBY' | 'SYNCED';
  maintenanceWindowEnd: string;
  estimatedRecoverySecs: number;
  bufferedTransactionValue: number;
  queuedCount: number;
  aiDriftConfidence: number;
}

export interface ShadowLedgerMetrics {
  totalSyntheticLiquidity: number;
  reconciledToday: number;
  conflictRate: number;
  aiLatencyMicroseconds: number;
  quantumSealStatus: 'ENCRYPTED_ECDSA_P384' | 'POST_QUANTUM_KYBER1024';
}

export const ModernTreasuryFailoverLedger: React.FC = () => {
  // Maintenance & System State
  const [maintenance, setMaintenance] = useState<MaintenanceStatus>({
    citiConnectStatus: 'OFFLINE_MAINTENANCE',
    modernTreasuryBridge: 'SHADOW_ACTIVE',
    maintenanceWindowEnd: '2025-05-18T04:30:00.000Z',
    estimatedRecoverySecs: 1420,
    bufferedTransactionValue: 4892450000.0,
    queuedCount: 14,
    aiDriftConfidence: 99.9984
  });

  const [metrics, setMetrics] = useState<ShadowLedgerMetrics>({
    totalSyntheticLiquidity: 18450200000.0,
    reconciledToday: 3120400000.0,
    conflictRate: 0.000012,
    aiLatencyMicroseconds: 240,
    quantumSealStatus: 'POST_QUANTUM_KYBER1024'
  });

  // Active Filter / Tab
  const [selectedTier, setSelectedTier] = useState<string>('ALL');
  const [activeModal, setActiveModal] = useState<'NEW_TX' | 'DRY_RUN' | 'AUDIT_LOG' | null>(null);
  const [isSimulatingRecon, setIsSimulatingRecon] = useState(false);
  const [logFeed, setLogFeed] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  // Transactions State
  const [transactions, setTransactions] = useState<ShadowTransaction[]>([
    {
      id: 'MT-SHD-98104-X1',
      modernTreasuryLedgerId: 'mt_led_01HYX99201948',
      citiReferenceId: 'CITI-NY-PRI-889021-B',
      sourceAccount: 'CITI-SOV-0091-GLOBAL-SETTLE',
      destinationAccount: 'MT-SYNTH-VAULT-AE81',
      amount: 1450000000.0,
      currency: 'USD',
      priorityTier: 'TIER-0_SOVEREIGN',
      status: 'AI_VALIDATED',
      riskScore: 0.002,
      aiVerificationHash: '0x7f83b1657ff1fc53b92dc18148a1d65dfc2d4b1fa3d677284addd200126d9069',
      timestamp: '2025-05-18T02:14:02.819Z',
      description: 'Kingdom Sovereign Wealth Allocation - AI Compute Node Infrastructure Collateral',
      ledgerImpact: {
        debitAccount: 'CITI-SOV-0091-GLOBAL-SETTLE',
        creditAccount: 'MT-SYNTH-VAULT-AE81',
        syntheticBalanceAfter: 12450000000.0
      }
    },
    {
      id: 'MT-SHD-98105-X2',
      modernTreasuryLedgerId: 'mt_led_01HYX99318274',
      citiReferenceId: 'CITI-LN-PB-991204-Q',
      sourceAccount: 'CITI-PB-GENEVA-OCTA-01',
      destinationAccount: 'MT-SYNTH-ESCROW-CH09',
      amount: 620000000.0,
      currency: 'CHF',
      priorityTier: 'TIER-1_ULTRA_HNW',
      status: 'SHADOW_POSTED',
      riskScore: 0.014,
      aiVerificationHash: '0x3a4b9c1d0e9f8a7b6c5d4e3f2a1b0c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4a3b',
      timestamp: '2025-05-18T02:18:44.102Z',
      description: 'Diamond Cut Superyacht Syndicate & Hyper-Real Estate Dual Escrow',
      ledgerImpact: {
        debitAccount: 'CITI-PB-GENEVA-OCTA-01',
        creditAccount: 'MT-SYNTH-ESCROW-CH09',
        syntheticBalanceAfter: 2840000000.0
      }
    },
    {
      id: 'MT-SHD-98106-X3',
      modernTreasuryLedgerId: 'mt_led_01HYX99477219',
      citiReferenceId: 'CITI-SG-CORP-440192-K',
      sourceAccount: 'CITI-INST-TOKYO-SETTLE-8',
      destinationAccount: 'MT-SYNTH-CLEAR-SG02',
      amount: 890000000.0,
      currency: 'SGD',
      priorityTier: 'TIER-0_SOVEREIGN',
      status: 'QUEUED',
      riskScore: 0.005,
      aiVerificationHash: '0x99a8b7c6d5e4f3a2b1c0d9e8f7a6b5c4d3e2f1a0b9c8d7e6f5a4b3c2d1e0f9a8',
      timestamp: '2025-05-18T02:22:15.541Z',
      description: 'Subsea Quantum Fiber Multi-Jurisdiction Interbank Clearing Line',
      ledgerImpact: {
        debitAccount: 'CITI-INST-TOKYO-SETTLE-8',
        creditAccount: 'MT-SYNTH-CLEAR-SG02',
        syntheticBalanceAfter: 6110000000.0
      }
    },
    {
      id: 'MT-SHD-98107-X4',
      modernTreasuryLedgerId: 'mt_led_01HYX99581900',
      citiReferenceId: 'CITI-DUB-FIN-771829-M',
      sourceAccount: 'CITI-DIFC-ROYAL-RESERVE',
      destinationAccount: 'MT-SYNTH-VAULT-DXB3',
      amount: 1932450000.0,
      currency: 'AED',
      priorityTier: 'TIER-0_SOVEREIGN',
      status: 'AI_VALIDATED',
      riskScore: 0.0009,
      aiVerificationHash: '0x1234567890abcdef1234567890abcdef1234567890abcdef1234567890abcdef',
      timestamp: '2025-05-18T02:27:09.911Z',
      description: 'Sovereign AI GPU Compute Reserve & Fusion Grid Strategic Settlement',
      ledgerImpact: {
        debitAccount: 'CITI-DIFC-ROYAL-RESERVE',
        creditAccount: 'MT-SYNTH-VAULT-DXB3',
        syntheticBalanceAfter: 19820000000.0
      }
    }
  ]);

  // Form State for new shadow TX
  const [newTx, setNewTx] = useState({
    sourceAccount: 'CITI-SOV-GLOBAL-PRIME-001',
    destinationAccount: 'MT-SYNTH-EXPEDITE-99',
    amount: '250000000',
    currency: 'USD' as const,
    priorityTier: 'TIER-0_SOVEREIGN' as const,
    description: 'Autonomous Private Equity Liquidity Rebalance'
  });

  // Simulated live feed timer
  useEffect(() => {
    const timer = setInterval(() => {
      setMaintenance(prev => ({
        ...prev,
        estimatedRecoverySecs: Math.max(0, prev.estimatedRecoverySecs - 1),
        aiDriftConfidence: Number((99.998 + Math.random() * 0.0015).toFixed(4))
      }));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Real-time terminal telemetry logs
  useEffect(() => {
    const initialLogs = [
      `[${new Date().toISOString()}] [CITI-CORE] Maintenance schedule active: CITI-CONNECT API ISO-20022 gateway offline for scheduled core upgrade.`,
      `[${new Date().toISOString()}] [MODERN-TREASURY] Shadow Ledger Engine engaged: Dual-entry state isolated. Synthetic balance anchoring at $18.450B.`,
      `[${new Date().toISOString()}] [AI-SENTINEL] Neural validator v9.8.4 initialized. Quantum drift probability: < 0.0001%.`,
      `[${new Date().toISOString()}] [FAILOVER-GATE] Modern Treasury Hot-Standby routing live transactions into zero-loss state queues.`
    ];
    setLogFeed(initialLogs);
  }, []);

  const addLog = (message: string) => {
    const timestamp = new Date().toISOString();
    setLogFeed(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  };

  const handleQueueTransaction = (e: React.FormEvent) => {
    e.preventDefault();
    const numAmount = parseFloat(newTx.amount) || 0;
    const newEntry: ShadowTransaction = {
      id: `MT-SHD-${Math.floor(10000 + Math.random() * 90000)}-X${Math.floor(Math.random() * 9)}`,
      modernTreasuryLedgerId: `mt_led_${Date.now().toString(36)}`,
      citiReferenceId: `CITI-SYNTH-${Math.floor(100000 + Math.random() * 900000)}-AUTO`,
      sourceAccount: newTx.sourceAccount,
      destinationAccount: newTx.destinationAccount,
      amount: numAmount,
      currency: newTx.currency,
      priorityTier: newTx.priorityTier,
      status: 'AI_VALIDATED',
      riskScore: parseFloat((Math.random() * 0.01).toFixed(4)),
      aiVerificationHash: `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
      timestamp: new Date().toISOString(),
      description: newTx.description,
      ledgerImpact: {
        debitAccount: newTx.sourceAccount,
        creditAccount: newTx.destinationAccount,
        syntheticBalanceAfter: 15400000000.0 - numAmount
      }
    };

    setTransactions(prev => [newEntry, ...prev]);
    setMaintenance(prev => ({
      ...prev,
      queuedCount: prev.queuedCount + 1,
      bufferedTransactionValue: prev.bufferedTransactionValue + numAmount
    }));

    addLog(`[TX-INJECT] Shadow Tx ${newEntry.id} synthesized. Amount: ${newEntry.currency} ${newEntry.amount.toLocaleString()}. AI Hash: ${newEntry.aiVerificationHash.substring(0, 16)}...`);
    setActiveModal(null);
  };

  const handleTriggerReconciliationSimulation = () => {
    setIsSimulatingRecon(true);
    addLog(`[RECON-START] Initiating high-throughput Modern Treasury <> Citi shadow reconciliation test.`);

    setTimeout(() => {
      setTransactions(prev =>
        prev.map(tx => (tx.status === 'QUEUED' || tx.status === 'SHADOW_POSTED' ? { ...tx, status: 'AI_VALIDATED' } : tx))
      );
      addLog(`[RECON-SIM] Neural Consensus passed across 4 distributed Citi ledger nodes. 0 mismatch anomalies detected.`);
      setIsSimulatingRecon(false);
    }, 1800);
  };

  const handleForcePostRecoverySync = () => {
    setIsSimulatingRecon(true);
    addLog(`[CRITICAL-SYNC] Initiating Post-Maintenance Core Sync between Modern Treasury Double-Entry Ledger and Citi Direct Network.`);

    setTimeout(() => {
      setTransactions(prev =>
        prev.map(tx => ({ ...tx, status: 'RECONCILED' }))
      );
      setMaintenance(prev => ({
        ...prev,
        citiConnectStatus: 'HEALTHY',
        modernTreasuryBridge: 'SYNCED',
        queuedCount: 0
      }));
      addLog(`[SYNC-COMPLETE] 100% Transactions Reconciled to Citi Core. Cryptographic Quantum Seals generated. Zero Slippage Recorded.`);
      setIsSimulatingRecon(false);
    }, 2400);
  };

  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesTier = selectedTier === 'ALL' || tx.priorityTier === selectedTier;
      const matchesSearch =
        tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.citiReferenceId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
        tx.sourceAccount.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesTier && matchesSearch;
    });
  }, [transactions, selectedTier, searchQuery]);

  const formatCurrency = (val: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      maximumFractionDigits: 0
    }).format(val);
  };

  const formatSeconds = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner: Sovereign Grade Status */}
      <div className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-[#0d1527] via-[#090e1a] to-[#120f06] p-6 shadow-[0_0_50px_rgba(217,119,6,0.15)] mb-8">
        <div className="absolute -right-20 -top-20 w-80 h-80 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-20 -bottom-20 w-80 h-80 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-widest bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center gap-1.5 shadow-[0_0_15px_rgba(245,158,11,0.3)]">
                <Sparkles className="w-3.5 h-3.5 animate-pulse text-amber-400" />
                Sovereign Institutional Failover Engine
              </div>
              <div className="px-3 py-1 rounded-full text-xs font-mono bg-blue-500/10 text-blue-400 border border-blue-500/30 flex items-center gap-1.5">
                <Radio className="w-3 h-3 animate-ping text-blue-400" />
                Modern Treasury &times; Citi Direct Link
              </div>
            </div>
            <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-500 bg-clip-text text-transparent">
              Shadow Ledger &amp; Maintenance Queuing Portal
            </h1>
            <p className="text-slate-400 text-sm max-w-3xl leading-relaxed">
              Ultra-high-fidelity offline state machine mirroring CitiConnect treasury rails with zero data loss. 
              Real-time synthetic double-entry ledger ledgering, multi-currency AI liquidity buffer, and post-window atomic reconciliation.
            </p>
          </div>

          {/* Maintenance Countdown & Action Pill */}
          <div className="flex flex-col sm:flex-row items-center gap-4 w-full lg:w-auto">
            <div className="w-full sm:w-auto bg-[#0a0f1d]/80 backdrop-blur-xl border border-slate-700/60 p-4 rounded-xl flex items-center gap-4">
              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg">
                <Clock className="w-6 h-6 text-amber-400 animate-spin" style={{ animationDuration: '12s' }} />
              </div>
              <div>
                <div className="text-xs text-slate-400 font-mono tracking-wider uppercase">Citi Maintenance Window</div>
                <div className="text-xl font-bold text-amber-300 font-mono">
                  {formatSeconds(maintenance.estimatedRecoverySecs)} Remaining
                </div>
                <div className="text-[10px] text-emerald-400 flex items-center gap-1 font-mono">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  AI SHADOW ACTIVE (100% ISOLATED)
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal('NEW_TX')}
              className="w-full sm:w-auto px-6 py-4 rounded-xl font-bold text-sm uppercase tracking-wider bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-[0_0_30px_rgba(245,158,11,0.4)] transition-all transform hover:-translate-y-0.5 active:translate-y-0 flex items-center justify-center gap-2 cursor-pointer"
            >
              <Zap className="w-4 h-4 fill-current" />
              Queue Shadow Tx
            </button>
          </div>
        </div>
      </div>

      {/* Real-time Telemetry Dashboard Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Card 1 */}
        <div className="bg-[#0b101e]/90 border border-amber-500/20 rounded-xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Buffered Volume in Shadow</span>
            <Database className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {formatCurrency(maintenance.bufferedTransactionValue)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-amber-400/90">{maintenance.queuedCount} Tx In Flight</span>
            <span className="text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Zero Collateral Drift
            </span>
          </div>
        </div>

        {/* Card 2 */}
        <div className="bg-[#0b101e]/90 border border-blue-500/20 rounded-xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Modern Treasury Liquidity</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-2xl font-black font-mono text-white tracking-tight">
            {formatCurrency(metrics.totalSyntheticLiquidity)}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Total Backed Escrow</span>
            <span className="text-blue-400">9 Multi-Currencies</span>
          </div>
        </div>

        {/* Card 3 */}
        <div className="bg-[#0b101e]/90 border border-emerald-500/20 rounded-xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">AI Predictive Reconciliation</span>
            <Cpu className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-2xl font-black font-mono text-emerald-400 tracking-tight">
            {maintenance.aiDriftConfidence}%
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Model: Gemini Ultra Fin</span>
            <span className="text-emerald-300">{metrics.aiLatencyMicroseconds}µs Sync Latency</span>
          </div>
        </div>

        {/* Card 4 */}
        <div className="bg-[#0b101e]/90 border border-purple-500/20 rounded-xl p-5 backdrop-blur-md relative overflow-hidden group hover:border-purple-500/50 transition-all">
          <div className="flex items-center justify-between text-slate-400 mb-3">
            <span className="text-xs font-mono uppercase tracking-wider">Quantum Ledger Seal</span>
            <Lock className="w-4 h-4 text-purple-400" />
          </div>
          <div className="text-lg font-bold font-mono text-purple-300 tracking-tight flex items-center gap-2">
            <KeyRound className="w-4 h-4 text-purple-400" />
            {metrics.quantumSealStatus}
          </div>
          <div className="mt-2 flex items-center justify-between text-xs font-mono">
            <span className="text-slate-400">Citi Tier-1 Root CA</span>
            <span className="text-purple-400">Cryptographically Sealed</span>
          </div>
        </div>
      </div>

      {/* Main Grid: Transactions Matrix + Live Terminal & Simulators */}
      <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
        {/* Left 2 Cols: Transaction Table & Filter Controls */}
        <div className="xl:col-span-2 space-y-6">
          <div className="bg-[#090e1a] border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
            {/* Header / Filter Toolbar */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
              <div>
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-amber-400" />
                  Offline Buffered Transactions Matrix
                </h2>
                <p className="text-xs text-slate-400 font-mono mt-0.5">
                  Holding state for automated post-window release to CitiConnect ISO-20022 wire endpoints.
                </p>
              </div>

              <div className="flex flex-wrap items-center gap-2 w-full md:w-auto">
                <input
                  type="text"
                  placeholder="Search Ref, ID, or Entity..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="bg-slate-900/90 border border-slate-700/80 rounded-lg px-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50 w-full sm:w-48"
                />

                <div className="flex bg-slate-900 border border-slate-800 rounded-lg p-0.5">
                  {['ALL', 'TIER-0_SOVEREIGN', 'TIER-1_ULTRA_HNW'].map(tier => (
                    <button
                      key={tier}
                      onClick={() => setSelectedTier(tier)}
                      className={`px-2.5 py-1 text-xs font-mono rounded-md transition-all ${
                        selectedTier === tier
                          ? 'bg-amber-500 text-slate-950 font-bold shadow'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {tier === 'ALL' ? 'ALL' : tier.replace('TIER-', 'T-')}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="divide-y divide-slate-800/60 mt-4 max-h-[580px] overflow-y-auto pr-1 custom-scrollbar">
              {filteredTransactions.length === 0 ? (
                <div className="py-12 text-center text-slate-500 font-mono text-sm">
                  No shadow transactions matching query filters.
                </div>
              ) : (
                filteredTransactions.map(tx => (
                  <div
                    key={tx.id}
                    className="py-4 hover:bg-slate-800/30 transition-colors rounded-xl px-3 group"
                  >
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-2">
                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[10px] font-mono font-bold tracking-wider uppercase border ${
                            tx.priorityTier === 'TIER-0_SOVEREIGN'
                              ? 'bg-amber-500/10 text-amber-300 border-amber-500/30'
                              : 'bg-indigo-500/10 text-indigo-300 border-indigo-500/30'
                          }`}
                        >
                          {tx.priorityTier}
                        </span>
                        <span className="font-mono text-xs text-slate-300 font-semibold">{tx.id}</span>
                        <span className="text-[11px] font-mono text-slate-500 hidden md:inline">
                          MT ID: {tx.modernTreasuryLedgerId}
                        </span>
                      </div>

                      <div className="flex items-center gap-3">
                        <span
                          className={`px-2 py-0.5 rounded-full text-[10px] font-mono font-bold uppercase flex items-center gap-1 ${
                            tx.status === 'RECONCILED'
                              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                              : tx.status === 'AI_VALIDATED'
                              ? 'bg-blue-500/20 text-blue-300 border border-blue-500/30'
                              : 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                          }`}
                        >
                          {tx.status === 'RECONCILED' && <CheckCircle2 className="w-3 h-3 text-emerald-400" />}
                          {tx.status === 'AI_VALIDATED' && <Sparkles className="w-3 h-3 text-blue-400" />}
                          {tx.status === 'SHADOW_POSTED' && <Clock className="w-3 h-3 text-amber-400" />}
                          {tx.status}
                        </span>
                        <div className="text-right">
                          <div className="font-mono font-bold text-amber-300 text-sm">
                            {formatCurrency(tx.amount, tx.currency)}
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="text-xs text-slate-300 mb-2 font-medium">{tx.description}</div>

                    {/* Routing Micro-Specs */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-[11px] font-mono bg-slate-950/60 p-2.5 rounded-lg border border-slate-800/80 text-slate-400">
                      <div>
                        <span className="text-slate-500 block text-[10px]">DEBIT ENTITY:</span>
                        <span className="text-slate-300 truncate block">{tx.sourceAccount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">CREDIT SHADOW VAULT:</span>
                        <span className="text-amber-400/90 truncate block">{tx.destinationAccount}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">AI RISK ENGINE SCORE:</span>
                        <span className="text-emerald-400 font-bold">
                          {(tx.riskScore * 100).toFixed(3)}% (Ultra-Safe)
                        </span>
                      </div>
                    </div>

                    <div className="mt-2 flex items-center justify-between text-[10px] font-mono text-slate-500">
                      <span className="truncate max-w-[280px]">AI Hash: {tx.aiVerificationHash}</span>
                      <span>Citi Ref: {tx.citiReferenceId}</span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right 1 Col: Failover Control Center & Live Event Terminal */}
        <div className="space-y-6">
          {/* Quick Simulation Actions */}
          <div className="bg-[#090e1a] border border-slate-800 rounded-2xl p-6 backdrop-blur-xl">
            <h3 className="text-sm font-bold text-slate-100 uppercase tracking-wider mb-4 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-amber-400" />
              Reconciliation &amp; Failover Controls
            </h3>

            <div className="space-y-3">
              <button
                onClick={handleTriggerReconciliationSimulation}
                disabled={isSimulatingRecon}
                className="w-full p-3.5 rounded-xl border border-blue-500/40 bg-blue-500/10 hover:bg-blue-500/20 text-blue-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <RefreshCw className={`w-4 h-4 ${isSimulatingRecon ? 'animate-spin' : ''}`} />
                  Run AI Double-Entry Dry Run
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={handleForcePostRecoverySync}
                disabled={isSimulatingRecon}
                className="w-full p-3.5 rounded-xl border border-emerald-500/40 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all disabled:opacity-50"
              >
                <span className="flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Execute Post-Recovery Settlement
                </span>
                <ArrowUpRight className="w-4 h-4" />
              </button>

              <button
                onClick={() => addLog(`[AUDIT-PULSE] Modern Treasury Merkle tree verified. Root: 0x9bf41...d720c`)}
                className="w-full p-3.5 rounded-xl border border-slate-700 bg-slate-900/80 hover:bg-slate-800 text-slate-300 font-mono text-xs font-bold uppercase tracking-wider flex items-center justify-between transition-all"
              >
                <span className="flex items-center gap-2">
                  <ShieldAlert className="w-4 h-4 text-amber-400" />
                  Generate Sovereign Audit Seal
                </span>
                <FileCheck className="w-4 h-4 text-slate-400" />
              </button>
            </div>

            {/* Bridge Status Telemetry */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 space-y-3 font-mono text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">CitiConnect ISO Gateway:</span>
                <span className="text-amber-400 font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30">
                  {maintenance.citiConnectStatus}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Modern Treasury Hot-Standby:</span>
                <span className="text-emerald-400 font-bold px-2 py-0.5 rounded bg-emerald-500/10 border border-emerald-500/30">
                  {maintenance.modernTreasuryBridge}
                </span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Ledger Conflict Rate:</span>
                <span className="text-slate-200 font-bold">{metrics.conflictRate}%</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-slate-400">Post-Settlement Slashing Risk:</span>
                <span className="text-emerald-400 font-bold">0.000000% (Guaranteed)</span>
              </div>
            </div>
          </div>

          {/* Live High-Frequency Event Terminal */}
          <div className="bg-[#060911] border border-slate-800/90 rounded-2xl p-5 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2 text-xs font-mono font-bold text-slate-300">
                <Terminal className="w-4 h-4 text-amber-400" />
                Ledger Telemetry &amp; AI Sentinel Logs
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            </div>

            <div className="mt-3 font-mono text-[11px] text-slate-400 space-y-2 h-64 overflow-y-auto custom-scrollbar leading-relaxed">
              {logFeed.map((log, idx) => (
                <div key={idx} className="border-l-2 border-amber-500/40 pl-2 py-0.5 text-slate-300/90">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Modal: Queue New Shadow Transaction */}
      {activeModal === 'NEW_TX' && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="bg-[#0a0f1e] border border-amber-500/40 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_60px_rgba(245,158,11,0.2)] relative animate-in fade-in zoom-in-95 duration-200">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Zap className="w-5 h-5 text-amber-400" />
                Queue Shadow Synthetic Settlement
              </h3>
              <button
                onClick={() => setActiveModal(null)}
                className="text-slate-400 hover:text-white text-lg font-mono"
              >
                ✕
              </button>
            </div>

            <form onSubmit={handleQueueTransaction} className="mt-4 space-y-4 font-mono text-xs">
              <div>
                <label className="block text-slate-400 mb-1">Source Account (Citi Direct Anchor)</label>
                <input
                  type="text"
                  value={newTx.sourceAccount}
                  onChange={e => setNewTx({ ...newTx, sourceAccount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Destination Modern Treasury Shadow Vault</label>
                <input
                  type="text"
                  value={newTx.destinationAccount}
                  onChange={e => setNewTx({ ...newTx, destinationAccount: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-slate-400 mb-1">Amount</label>
                  <input
                    type="number"
                    value={newTx.amount}
                    onChange={e => setNewTx({ ...newTx, amount: e.target.value })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-amber-300 font-bold text-sm focus:outline-none focus:border-amber-500"
                    required
                  />
                </div>
                <div>
                  <label className="block text-slate-400 mb-1">Currency</label>
                  <select
                    value={newTx.currency}
                    onChange={e => setNewTx({ ...newTx, currency: e.target.value as any })}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  >
                    <option value="USD">USD - United States Dollar</option>
                    <option value="EUR">EUR - Euro Sovereign</option>
                    <option value="GBP">GBP - British Pound</option>
                    <option value="CHF">CHF - Swiss Franc Prime</option>
                    <option value="SGD">SGD - Singapore Dollar</option>
                    <option value="AED">AED - UAE Dirham</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Priority Settlement Tier</label>
                <select
                  value={newTx.priorityTier}
                  onChange={e => setNewTx({ ...newTx, priorityTier: e.target.value as any })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-amber-400 font-bold focus:outline-none focus:border-amber-500"
                >
                  <option value="TIER-0_SOVEREIGN">TIER-0 SOVEREIGN (Zero Latency Execution)</option>
                  <option value="TIER-1_ULTRA_HNW">TIER-1 ULTRA HNW (Priority Modern Treasury Escrow)</option>
                  <option value="TIER-2_INSTITUTIONAL">TIER-2 INSTITUTIONAL (Batch Cleared)</option>
                </select>
              </div>

              <div>
                <label className="block text-slate-400 mb-1">Audit Description</label>
                <input
                  type="text"
                  value={newTx.description}
                  onChange={e => setNewTx({ ...newTx, description: e.target.value })}
                  className="w-full bg-slate-900 border border-slate-700 rounded-lg p-2.5 text-slate-200 focus:outline-none focus:border-amber-500"
                  required
                />
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/30 rounded-lg text-slate-300 text-[11px] leading-relaxed">
                <span className="font-bold text-amber-400">AI Sentinel Pre-Verification:</span> This transaction will be validated against historical Citi ledger state and buffered with automated cryptographic nonces. Reconciled upon window completion.
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setActiveModal(null)}
                  className="px-4 py-2.5 rounded-lg border border-slate-700 text-slate-300 hover:bg-slate-800 transition-all font-mono"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-6 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-slate-950 font-bold uppercase tracking-wider hover:from-amber-400 hover:to-yellow-500 shadow-lg shadow-amber-500/30 transition-all"
                >
                  Confirm &amp; Shadow Post
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default ModernTreasuryFailoverLedger;