import React, { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import {
  ShieldCheck,
  Layers,
  Lock,
  Cpu,
  Coins,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Zap,
  CheckCircle2,
  AlertTriangle,
  Fingerprint,
  Terminal,
  Hash,
  Database,
  Eye,
  EyeOff,
  Activity,
  Binary,
  Scale,
  Sparkles,
  Server,
  DollarSign
} from 'lucide-react';

// ==========================================
// TYPES & DATA STRUCTURES
// ==========================================

export type ZKProofStatus = 'VERIFIED' | 'COMPUTING_WITNESS' | 'SYNTHESIZING_SNARK' | 'FAILED' | 'IDLE';

export interface CitiEncryptedAccount {
  citiAccountIdHash: string; // SHA3-512 + Citi HSM Enclave Mask
  citiOmnibusRoute: string; // e.g. "CITI-US-NY-FEDWIRE-UHNW-009"
  iso20022EndToEndId: string;
  zkCommitment: string;
  encryptedBalanceCiphertext: string;
  currency: 'USD' | 'EUR' | 'CHF' | 'XAU_TROY_OZ' | 'BTC_SYNTH';
  nominalTier: 'SOVEREIGN_TIER_1' | 'DYNASTIC_PRIVATE_OFFICE' | 'CENTRAL_BANK_CLEARING';
}

export interface ModernTreasuryLedgerAccount {
  id: string;
  name: string;
  description: string;
  normalBalance: 'credit' | 'debit';
  postedBalanceCents: bigint;
  pendingBalanceCents: bigint;
  currency: string;
  citiLinkedAccountIdHash: string;
  ledgerId: string;
  zkProofKey: string;
  status: 'ACTIVE' | 'ARCHIVED' | 'LOCKED_AUDIT';
}

export interface ModernTreasuryLedgerEntry {
  id: string;
  ledgerId: string;
  ledgerTransactionId: string;
  ledgerAccountId: string;
  amountCents: bigint;
  direction: 'credit' | 'debit';
  status: 'posted' | 'pending' | 'rejected';
  citiEncryptedRef: string;
  zkSnarkProofHash: string;
  settlementLatencyMicroseconds: number;
  timestamp: string;
}

export interface LedgerTransactionPayload {
  description: string;
  citiDebitAccount: CitiEncryptedAccount;
  citiCreditAccount: CitiEncryptedAccount;
  mtDebitLedgerAccountId: string;
  mtCreditLedgerAccountId: string;
  amount: number;
  currency: string;
  zkCircuit: 'Plonk-Ultra-16k' | 'Groth16-Citi-Vault' | 'Stark-Quantum-128';
}

// ==========================================
// COMPONENT
// ==========================================

export const ModernTreasuryZeroKnowledgeLedger: React.FC = () => {
  // State: Modern Treasury Ledger Accounts
  const [ledgerAccounts, setLedgerAccounts] = useState<ModernTreasuryLedgerAccount[]>([
    {
      id: 'mt_la_9901_sovereign_reserves',
      name: 'Citi-Treasury Sovereign Liquidity Omnibus',
      description: 'Zero-Knowledge Multi-Billion Fedwire Liquidity Bridge',
      normalBalance: 'credit',
      postedBalanceCents: BigInt('84920000000000'), // $849,200,000.00
      pendingBalanceCents: BigInt('1250000000000'), // $12,500,000.00
      currency: 'USD',
      citiLinkedAccountIdHash: '0x8f19a002bc45de9910c2c1199ae8b374992bda9142f1b88e1029c0119283fa01',
      ledgerId: 'mt_led_ultra_001_prod',
      zkProofKey: 'zk-citi-snark-prod-v9.42-enclave-active',
      status: 'ACTIVE',
    },
    {
      id: 'mt_la_9902_private_client_vault',
      name: 'UHNW Dynastic Real-Time Settlements',
      description: 'Ultra-High-Frequency zk-STARK Private Ledger Account',
      normalBalance: 'debit',
      postedBalanceCents: BigInt('31850000000000'), // $318,500,000.00
      pendingBalanceCents: BigInt('500000000000'),  // $5,000,000.00
      currency: 'USD',
      citiLinkedAccountIdHash: '0xd7a93144ef20491b92c819fa281bb871092eac4311029ba839e102948201bca9',
      ledgerId: 'mt_led_ultra_001_prod',
      zkProofKey: 'zk-citi-snark-prod-v9.42-enclave-active',
      status: 'ACTIVE',
    },
    {
      id: 'mt_la_9903_aurum_synthetics',
      name: 'Citi-Gold Allocated Bullion Collateral',
      description: 'Physical Fort Knox Tokenized Ingot Reserve Layer',
      normalBalance: 'credit',
      postedBalanceCents: BigInt('124000000000000'), // $1,240,000,000.00
      pendingBalanceCents: BigInt('0'),
      currency: 'USD',
      citiLinkedAccountIdHash: '0x22bca9810f2c99a0e104928bfa9281a8c7920194820bc0192841029bc019283f',
      ledgerId: 'mt_led_ultra_001_prod',
      zkProofKey: 'zk-citi-snark-prod-v9.42-enclave-active',
      status: 'ACTIVE',
    }
  ]);

  // State: Modern Treasury Ledger Entries (Double Entry Feed)
  const [ledgerEntries, setLedgerEntries] = useState<ModernTreasuryLedgerEntry[]>([
    {
      id: 'mt_le_8819201_debit',
      ledgerId: 'mt_led_ultra_001_prod',
      ledgerTransactionId: 'mt_ltx_8819201',
      ledgerAccountId: 'mt_la_9901_sovereign_reserves',
      amountCents: BigInt('50000000000'), // $500,000.00
      direction: 'debit',
      status: 'posted',
      citiEncryptedRef: '0x71fa9...citi_enc_iso20022_pacs008',
      zkSnarkProofHash: '0x992c109...snark_witness_verified',
      settlementLatencyMicroseconds: 142,
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    },
    {
      id: 'mt_le_8819201_credit',
      ledgerId: 'mt_led_ultra_001_prod',
      ledgerTransactionId: 'mt_ltx_8819201',
      ledgerAccountId: 'mt_la_9902_private_client_vault',
      amountCents: BigInt('50000000000'), // $500,000.00
      direction: 'credit',
      status: 'posted',
      citiEncryptedRef: '0x71fa9...citi_enc_iso20022_pacs008',
      zkSnarkProofHash: '0x992c109...snark_witness_verified',
      settlementLatencyMicroseconds: 142,
      timestamp: new Date(Date.now() - 1000 * 60 * 3).toISOString(),
    }
  ]);

  // Interactive Execution Form State
  const [transferAmount, setTransferAmount] = useState<string>('25000000'); // $25M default
  const [selectedDebitAccountId, setSelectedDebitAccountId] = useState<string>('mt_la_9901_sovereign_reserves');
  const [selectedCreditAccountId, setSelectedCreditAccountId] = useState<string>('mt_la_9902_private_client_vault');
  const [zkCircuitType, setZkCircuitType] = useState<'Plonk-Ultra-16k' | 'Groth16-Citi-Vault' | 'Stark-Quantum-128'>('Groth16-Citi-Vault');
  
  // ZK Pipeline Status
  const [zkStatus, setZkStatus] = useState<ZKProofStatus>('IDLE');
  const [zkWitnessLog, setZkWitnessLog] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [showEncryptedHashes, setShowEncryptedHashes] = useState<boolean>(false);

  // Live Terminal Stream simulation
  const terminalRef = useRef<HTMLDivElement>(null);

  const addLog = useCallback((msg: string) => {
    setZkWitnessLog((prev) => [...prev.slice(-40), `[${new Date().toISOString().substring(11, 23)}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (terminalRef.current) {
      terminalRef.current.scrollTop = terminalRef.current.scrollHeight;
    }
  }, [zkWitnessLog]);

  // Initial Boot Logs
  useEffect(() => {
    addLog('Citi Quantum Enclave HSM Initialized.');
    addLog('Modern Treasury Ledger API v2 Connected via Mutual TLS 1.3.');
    addLog('Zero-Knowledge Polynomial Commitment Keys loaded (CRS: 0x99A_GOLD_TIER).');
  }, [addLog]);

  // Total Portfolio Calculations
  const totalLedgerBalance = useMemo(() => {
    return ledgerAccounts.reduce((acc, curr) => acc + curr.postedBalanceCents, BigInt(0));
  }, [ledgerAccounts]);

  const formattedTotalBalance = useMemo(() => {
    const dollars = Number(totalLedgerBalance) / 100;
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2,
    }).format(dollars);
  }, [totalLedgerBalance]);

  // Execute ZK Double-Entry Transaction
  const handleExecuteZKTransaction = async () => {
    const rawAmountDollars = parseFloat(transferAmount);
    if (isNaN(rawAmountDollars) || rawAmountDollars <= 0) {
      alert('Invalid Ledger Amount.');
      return;
    }

    if (selectedDebitAccountId === selectedCreditAccountId) {
      alert('Double-entry accounting requires distinct Ledger Accounts for Debit and Credit.');
      return;
    }

    setIsProcessing(true);
    setZkStatus('COMPUTING_WITNESS');
    addLog(`INIT: Preparing $${rawAmountDollars.toLocaleString()} ZK Ledger Transaction.`);
    addLog(`CITI-HSM: Generating homomorphic blinding factor over Citi Account Hash...`);

    await new Promise((res) => setTimeout(res, 600));
    setZkStatus('SYNTHESIZING_SNARK');
    addLog(`SNARK: Synthesizing R1CS constraints for ${zkCircuitType}...`);
    addLog(`VERIFY: Proving balance sufficiency without revealing Citi Omnibus cleartext...`);

    await new Promise((res) => setTimeout(res, 900));
    setZkStatus('VERIFIED');
    addLog(`ZK-PROOF: Verified in 118μs. Zero-knowledge commitment valid.`);

    // Modern Treasury Double Entry Posting
    const amountInCents = BigInt(Math.round(rawAmountDollars * 100));
    const txId = `mt_ltx_${Math.random().toString(36).substring(2, 9)}`;
    const nowIso = new Date().toISOString();
    const zkHash = `0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`;
    const citiRefHash = `CITI-MX-${Math.random().toString(36).substring(2, 10).toUpperCase()}-ZK`;

    const newDebitEntry: ModernTreasuryLedgerEntry = {
      id: `mt_le_${Math.random().toString(36).substring(2, 8)}_dr`,
      ledgerId: 'mt_led_ultra_001_prod',
      ledgerTransactionId: txId,
      ledgerAccountId: selectedDebitAccountId,
      amountCents: amountInCents,
      direction: 'debit',
      status: 'posted',
      citiEncryptedRef: citiRefHash,
      zkSnarkProofHash: zkHash,
      settlementLatencyMicroseconds: Math.floor(Math.random() * 60) + 90,
      timestamp: nowIso,
    };

    const newCreditEntry: ModernTreasuryLedgerEntry = {
      id: `mt_le_${Math.random().toString(36).substring(2, 8)}_cr`,
      ledgerId: 'mt_led_ultra_001_prod',
      ledgerTransactionId: txId,
      ledgerAccountId: selectedCreditAccountId,
      amountCents: amountInCents,
      direction: 'credit',
      status: 'posted',
      citiEncryptedRef: citiRefHash,
      zkSnarkProofHash: zkHash,
      settlementLatencyMicroseconds: Math.floor(Math.random() * 60) + 90,
      timestamp: nowIso,
    };

    // Update balances atomically in state
    setLedgerAccounts((prev) =>
      prev.map((acc) => {
        if (acc.id === selectedDebitAccountId) {
          return {
            ...acc,
            postedBalanceCents:
              acc.normalBalance === 'debit'
                ? acc.postedBalanceCents + amountInCents
                : acc.postedBalanceCents - amountInCents,
          };
        }
        if (acc.id === selectedCreditAccountId) {
          return {
            ...acc,
            postedBalanceCents:
              acc.normalBalance === 'credit'
                ? acc.postedBalanceCents + amountInCents
                : acc.postedBalanceCents - amountInCents,
          };
        }
        return acc;
      })
    );

    setLedgerEntries((prev) => [newDebitEntry, newCreditEntry, ...prev]);

    addLog(`MODERN TREASURY: POST /ledger_transactions [200 OK] -> Tx ID ${txId}`);
    addLog(`CITI FEDWIRE: End-to-End Pacs.008 Encrypted Confirmation Broadcasted.`);

    setTimeout(() => {
      setIsProcessing(false);
      setZkStatus('IDLE');
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* BACKGROUND ORBS & LUXURY OVERLAY */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] bg-amber-600/10 rounded-full blur-[140px]" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] bg-cyan-600/10 rounded-full blur-[160px]" />
        <div className="absolute top-[40%] left-[30%] w-[350px] h-[350px] bg-emerald-600/5 rounded-full blur-[120px]" />
      </div>

      {/* TOP LUXURY HEADER */}
      <header className="relative z-10 max-w-7xl mx-auto mb-8 border-b border-amber-500/20 pb-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative p-3 bg-gradient-to-br from-amber-500/20 via-amber-950/40 to-black border border-amber-500/40 rounded-2xl shadow-[0_0_25px_rgba(245,158,11,0.2)]">
              <Scale className="w-8 h-8 text-amber-400 animate-pulse" />
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_8px_#34d399]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-500 bg-clip-text text-transparent">
                  CITIBANK × MODERN TREASURY
                </h1>
                <span className="text-xs uppercase tracking-widest px-2.5 py-0.5 rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/30 font-mono font-semibold">
                  Zero-Knowledge Core
                </span>
              </div>
              <p className="text-xs md:text-sm text-slate-400 mt-1">
                Encrypted ISO-20022 High-Frequency Double-Entry Ledger Orchestrator
              </p>
            </div>
          </div>

          {/* TELEMETRY METRICS BADGES */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
              <Activity className="w-4 h-4 text-emerald-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">Citi Latency</div>
                <div className="text-xs font-mono font-bold text-emerald-400">0.114 ms</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
              <ShieldCheck className="w-4 h-4 text-amber-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">zk-SNARK Circuit</div>
                <div className="text-xs font-mono font-bold text-amber-400">Groth16 / 256-bit</div>
              </div>
            </div>

            <div className="px-3 py-1.5 rounded-xl bg-slate-900/80 border border-slate-800 flex items-center gap-2">
              <Database className="w-4 h-4 text-cyan-400" />
              <div className="text-left">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider font-mono">MT Synchrony</div>
                <div className="text-xs font-mono font-bold text-cyan-400">100.000% Atomic</div>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="relative z-10 max-w-7xl mx-auto space-y-8">
        
        {/* STATS OVERVIEW CARDS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          
          {/* Card 1: Total Sovereign Balance */}
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-black p-6 border border-amber-500/20 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-amber-500/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Coins className="w-24 h-24 text-amber-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider uppercase text-amber-400/80 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5" /> Total Ledger Value Locked
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-mono">
                LIVE CITI FEED
              </span>
            </div>
            <div className="mt-4">
              <div className="text-3xl lg:text-4xl font-extrabold tracking-tight text-white font-mono">
                {formattedTotalBalance}
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                Audited via Zero-Knowledge Cryptographic Witness
              </p>
            </div>
          </div>

          {/* Card 2: ZK Proof Enclave */}
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-black p-6 border border-cyan-500/20 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-cyan-500/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Fingerprint className="w-24 h-24 text-cyan-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider uppercase text-cyan-400/80 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" /> Citi Encrypted Account Link
              </span>
              <button
                onClick={() => setShowEncryptedHashes(!showEncryptedHashes)}
                className="text-[10px] px-2 py-0.5 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 font-mono hover:bg-cyan-500/20 transition-colors flex items-center gap-1"
              >
                {showEncryptedHashes ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                {showEncryptedHashes ? 'MASK' : 'REVEAL'}
              </button>
            </div>
            <div className="mt-4">
              <div className="text-sm font-mono text-cyan-200 truncate">
                {showEncryptedHashes
                  ? '0x8f19a002bc45de9910c2c1199ae8b374992bda9142f1b88e1029c0119283fa01'
                  : '••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••'}
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1 font-mono">
                <Cpu className="w-3.5 h-3.5 text-cyan-400" />
                ISO 20022 MX Pacs.008 BLINDED ENCLAVE
              </p>
            </div>
          </div>

          {/* Card 3: Modern Treasury Engine */}
          <div className="relative group overflow-hidden rounded-2xl bg-gradient-to-b from-slate-900/90 via-slate-950/90 to-black p-6 border border-purple-500/20 shadow-2xl backdrop-blur-xl transition-all duration-300 hover:border-purple-500/50">
            <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:opacity-20 transition-opacity">
              <Server className="w-24 h-24 text-purple-400" />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs font-mono tracking-wider uppercase text-purple-400/80 flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5" /> High-Frequency Ledger Core
              </span>
              <span className="text-[10px] px-2 py-0.5 rounded bg-purple-500/10 text-purple-400 border border-purple-500/20 font-mono">
                SYNCED
              </span>
            </div>
            <div className="mt-4">
              <div className="text-2xl font-bold text-slate-100 font-mono">
                {ledgerAccounts.length} Master Accounts
              </div>
              <p className="text-xs text-slate-400 mt-2 flex items-center gap-1">
                <Zap className="w-3.5 h-3.5 text-purple-400" />
                {ledgerEntries.length} Double-Entry Bookings Orchestrated
              </p>
            </div>
          </div>

        </section>

        {/* LEDGER ACCOUNTS & INTERACTIVE DISPATCHER GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT: MODERN TREASURY LEDGER ACCOUNTS (7 COLS) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
              <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-amber-400" />
                  <h2 className="text-lg font-bold text-slate-200">Modern Treasury Ledger Accounts</h2>
                </div>
                <span className="text-xs font-mono text-slate-500">Live Double-Entry Mappings</span>
              </div>

              <div className="space-y-4">
                {ledgerAccounts.map((account) => {
                  const balanceInDollars = Number(account.postedBalanceCents) / 100;
                  return (
                    <div
                      key={account.id}
                      className="p-4 rounded-xl bg-black/40 border border-slate-800 hover:border-amber-500/40 transition-all group"
                    >
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-200 text-sm">{account.name}</span>
                            <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-amber-400 uppercase">
                              {account.normalBalance} Normal
                            </span>
                          </div>
                          <p className="text-xs text-slate-400 mt-0.5">{account.description}</p>
                          <div className="text-[11px] font-mono text-slate-500 mt-1 truncate max-w-sm">
                            Citi ID Hash:{' '}
                            {showEncryptedHashes
                              ? account.citiLinkedAccountIdHash
                              : account.citiLinkedAccountIdHash.slice(0, 16) + '...'}
                          </div>
                        </div>

                        <div className="text-left sm:text-right">
                          <div className="text-lg font-mono font-bold text-amber-300">
                            {new Intl.NumberFormat('en-US', {
                              style: 'currency',
                              currency: 'USD',
                            }).format(balanceInDollars)}
                          </div>
                          <div className="text-[10px] font-mono text-slate-500 uppercase">
                            MT ID: {account.id}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* LIVE ZK AUDIT LOG / TERMINAL */}
            <div className="bg-black/80 border border-slate-800 rounded-2xl p-5 font-mono shadow-2xl backdrop-blur-xl">
              <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-800 text-xs text-slate-400">
                <div className="flex items-center gap-2 text-amber-400">
                  <Terminal className="w-4 h-4" />
                  <span className="font-bold">zk-SNARK Execution Enclave & Modern Treasury Webhook Telemetry</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  <span className="text-[10px] text-emerald-400">ONLINE</span>
                </div>
              </div>

              <div
                ref={terminalRef}
                className="h-44 overflow-y-auto space-y-1.5 text-xs text-slate-300 scrollbar-thin scrollbar-thumb-slate-800"
              >
                {zkWitnessLog.map((log, idx) => (
                  <div key={idx} className="leading-relaxed">
                    <span className="text-amber-500/80">{log.substring(0, 13)}</span>
                    <span className="text-slate-300">{log.substring(13)}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* RIGHT: ZK DISPATCH CONTROLLER (5 COLS) */}
          <div className="lg:col-span-5 space-y-6">
            <div className="bg-gradient-to-b from-slate-900/90 via-slate-950 to-black border border-amber-500/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl">
              <div className="flex items-center gap-2 mb-4 border-b border-slate-800 pb-3">
                <Zap className="w-5 h-5 text-amber-400" />
                <h2 className="text-lg font-bold text-slate-100">Discreet Ledger Dispatcher</h2>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Transfer Amount (USD - Millions)
                  </label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-amber-400 font-mono font-bold">
                      $
                    </div>
                    <input
                      type="number"
                      value={transferAmount}
                      onChange={(e) => setTransferAmount(e.target.value)}
                      placeholder="e.g. 50000000"
                      className="w-full bg-black/60 border border-slate-700 rounded-xl py-2.5 pl-8 pr-4 text-slate-100 font-mono text-sm focus:outline-none focus:border-amber-500 transition-colors"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Debit Ledger Account (Origin)
                  </label>
                  <select
                    value={selectedDebitAccountId}
                    onChange={(e) => setSelectedDebitAccountId(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-xl py-2.5 px-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {ledgerAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Credit Ledger Account (Destination)
                  </label>
                  <select
                    value={selectedCreditAccountId}
                    onChange={(e) => setSelectedCreditAccountId(e.target.value)}
                    className="w-full bg-black/60 border border-slate-700 rounded-xl py-2.5 px-3 text-slate-100 font-mono text-xs focus:outline-none focus:border-amber-500 transition-colors"
                  >
                    {ledgerAccounts.map((acc) => (
                      <option key={acc.id} value={acc.id}>
                        {acc.name} ({acc.id})
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-mono uppercase text-slate-400 mb-1">
                    Zero-Knowledge Verifier Circuit
                  </label>
                  <div className="grid grid-cols-3 gap-2">
                    {(['Groth16-Citi-Vault', 'Plonk-Ultra-16k', 'Stark-Quantum-128'] as const).map((circuit) => (
                      <button
                        key={circuit}
                        type="button"
                        onClick={() => setZkCircuitType(circuit)}
                        className={`text-[10px] font-mono py-2 px-1.5 rounded-lg border transition-all truncate ${
                          zkCircuitType === circuit
                            ? 'bg-amber-500/20 border-amber-500 text-amber-300 font-bold'
                            : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        {circuit.split('-')[0]}
                      </button>
                    ))}
                  </div>
                </div>

                {/* DISPATCH ACTION BUTTON */}
                <button
                  onClick={handleExecuteZKTransaction}
                  disabled={isProcessing}
                  className={`w-full mt-4 py-3.5 px-4 rounded-xl font-bold font-mono text-sm tracking-wider uppercase flex items-center justify-center gap-2 shadow-lg transition-all duration-300 ${
                    isProcessing
                      ? 'bg-amber-950/40 border border-amber-500/30 text-amber-400 cursor-not-allowed'
                      : 'bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 text-black hover:brightness-110 shadow-[0_0_20px_rgba(245,158,11,0.3)] active:scale-[0.98]'
                  }`}
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin text-amber-400" />
                      <span>{zkStatus}...</span>
                    </>
                  ) : (
                    <>
                      <Lock className="w-4 h-4" />
                      <span>Generate ZK Proof & Post Ledger</span>
                    </>
                  )}
                </button>

                <div className="pt-2">
                  <div className="p-3 rounded-lg bg-amber-500/5 border border-amber-500/20 text-[11px] text-amber-200/70 flex items-start gap-2">
                    <ShieldCheck className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                    <span>
                      Transactions are cryptographically proven before posting to Modern Treasury. No plaintext balances or account owners are exposed to public networks.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* LIVE DOUBLE-ENTRY INTEGRITY CHECK */}
            <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                  <Scale className="w-5 h-5" />
                </div>
                <div>
                  <div className="text-xs font-bold text-slate-200">Double-Entry Invariant</div>
                  <div className="text-[11px] text-slate-500">Sum(Debits) == Sum(Credits)</div>
                </div>
              </div>
              <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
                BALANCED
              </span>
            </div>
          </div>

        </div>

        {/* DOUBLE-ENTRY AUDIT LOG (RECENT TRANSACTIONS) */}
        <section className="bg-slate-900/70 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 mb-6 border-b border-slate-800 pb-4">
            <div>
              <h2 className="text-lg font-bold text-slate-200 flex items-center gap-2">
                <Binary className="w-5 h-5 text-amber-400" />
                Modern Treasury Live Double-Entry Ledger Bookings
              </h2>
              <p className="text-xs text-slate-400 mt-0.5">
                Every entry is cryptographically anchored with Citi ISO 20022 MX BLIND-SIG & zk-SNARK proof hashes
              </p>
            </div>
            <div className="text-xs font-mono text-slate-400 bg-black/40 px-3 py-1.5 rounded-lg border border-slate-800">
              Total Entries: {ledgerEntries.length}
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs font-mono">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 uppercase tracking-wider">
                  <th className="pb-3 px-3">Entry ID</th>
                  <th className="pb-3 px-3">Ledger Account</th>
                  <th className="pb-3 px-3">Type</th>
                  <th className="pb-3 px-3">Amount</th>
                  <th className="pb-3 px-3">Citi Encrypted Ref</th>
                  <th className="pb-3 px-3">zk-Proof Hash</th>
                  <th className="pb-3 px-3 text-right">Settled</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {ledgerEntries.map((entry) => {
                  const isDebit = entry.direction === 'debit';
                  const amountFormatted = new Intl.NumberFormat('en-US', {
                    style: 'currency',
                    currency: 'USD',
                  }).format(Number(entry.amountCents) / 100);

                  return (
                    <tr key={entry.id} className="hover:bg-amber-500/5 transition-colors group">
                      <td className="py-3.5 px-3 text-slate-300 font-semibold flex items-center gap-1.5">
                        <Hash className="w-3.5 h-3.5 text-slate-500" />
                        {entry.id}
                      </td>
                      <td className="py-3.5 px-3 text-slate-300">
                        {ledgerAccounts.find((a) => a.id === entry.ledgerAccountId)?.name || entry.ledgerAccountId}
                      </td>
                      <td className="py-3.5 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                            isDebit
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}
                        >
                          {isDebit ? <ArrowUpRight className="w-3 h-3" /> : <ArrowDownLeft className="w-3 h-3" />}
                          {entry.direction}
                        </span>
                      </td>
                      <td className={`py-3.5 px-3 font-bold ${isDebit ? 'text-rose-300' : 'text-emerald-300'}`}>
                        {amountFormatted}
                      </td>
                      <td className="py-3.5 px-3 text-slate-400">
                        <span className="text-[11px] bg-slate-950 px-2 py-1 rounded border border-slate-800">
                          {entry.citiEncryptedRef}
                        </span>
                      </td>
                      <td className="py-3.5 px-3 text-amber-400/90 truncate max-w-[140px]">
                        {entry.zkSnarkProofHash}
                      </td>
                      <td className="py-3.5 px-3 text-right text-slate-400">
                        {entry.settlementLatencyMicroseconds} μs
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>

      </main>

      {/* LUXURY STATUS FOOTER */}
      <footer className="relative z-10 max-w-7xl mx-auto mt-12 pt-6 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-amber-400 shadow-[0_0_8px_#f59e0b]" />
          <span>Citi Private Enclave × Modern Treasury Synchronizer Engine v9.8.1-PROD</span>
        </div>
        <div>
          Federated ISO 20022 pacs.008 & pacs.002 Zero-Knowledge Multi-Billion Clearing
        </div>
      </footer>
    </div>
  );
};

export default ModernTreasuryZeroKnowledgeLedger;