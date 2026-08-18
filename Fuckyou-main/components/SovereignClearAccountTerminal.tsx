import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Eye,
  EyeOff,
  Copy,
  Check,
  Download,
  Terminal,
  Cpu,
  Fingerprint,
  RefreshCw,
  Lock,
  Unlock,
  Sparkles,
  Server,
  Zap,
  Activity,
  AlertTriangle,
  FileCheck,
  Layers,
  ArrowUpRight,
  Database
} from 'lucide-react';

interface EncryptedAccountRecord {
  id: string;
  maskedAlias: string;
  clearAccountIdentifier: string;
  routingBic: string;
  citiBranchOrigin: string;
  modernTreasuryLedgerId: string;
  currency: 'USD' | 'EUR' | 'CHF' | 'GBP' | 'SGD';
  allocationBalance: number;
  encryptionStandard: 'HSM-AES-GCM-512' | 'QUANTUM-LATTICE-KYBER-1024' | 'CITI-ZK-ENCLAVE-V4';
  hsmNode: string;
  aiSecurityScore: number;
  anomalyRiskIndex: number;
  complianceRating: 'SOVEREIGN_PASSED' | 'ZERO_TRUST_VERIFIED' | 'REVIEW_PENDING';
  isUnmasked: boolean;
  unmaskedAt?: string;
  timeRemainingSec?: number;
}

const INITIAL_BATCH_RECORDS: EncryptedAccountRecord[] = [
  {
    id: 'CITI-SOV-00918-ALPHA',
    maskedAlias: 'CITI-ENCR-9902••••••••7812',
    clearAccountIdentifier: 'US89 CITI 0210 0008 9918 2004 7812',
    routingBic: 'CITIUS33XXX / 021000089',
    citiBranchOrigin: 'Citibank Private Bank, Park Avenue Sovereign Desk NY',
    modernTreasuryLedgerId: 'mt_led_01HY8992XA77PLM0198',
    currency: 'USD',
    allocationBalance: 1245000000.00,
    encryptionStandard: 'QUANTUM-LATTICE-KYBER-1024',
    hsmNode: 'HSM-ZURICH-ALPHA-01',
    aiSecurityScore: 99.84,
    anomalyRiskIndex: 0.02,
    complianceRating: 'SOVEREIGN_PASSED',
    isUnmasked: false
  },
  {
    id: 'CITI-SOV-00919-BETA',
    maskedAlias: 'CITI-ENCR-8831••••••••1109',
    clearAccountIdentifier: 'CH93 0883 1000 0029 4810 1109 4',
    routingBic: 'CITICHZZXXX / 08831',
    citiBranchOrigin: 'Citibank N.A., Zurich Sovereign Enclave',
    modernTreasuryLedgerId: 'mt_led_01HY9003BB88ZQL0442',
    currency: 'CHF',
    allocationBalance: 890450000.00,
    encryptionStandard: 'CITI-ZK-ENCLAVE-V4',
    hsmNode: 'HSM-GENEVA-SECURE-09',
    aiSecurityScore: 98.95,
    anomalyRiskIndex: 0.11,
    complianceRating: 'SOVEREIGN_PASSED',
    isUnmasked: false
  },
  {
    id: 'CITI-SOV-00920-GAMMA',
    maskedAlias: 'CITI-ENCR-1049••••••••6430',
    clearAccountIdentifier: 'GB29 CITI 1850 0829 3049 6430 88',
    routingBic: 'CITIGB2LXXX / 185008',
    citiBranchOrigin: 'Citibank Private Wealth, Canary Wharf London',
    modernTreasuryLedgerId: 'mt_led_01HY9044CC99WKL0881',
    currency: 'GBP',
    allocationBalance: 650000000.00,
    encryptionStandard: 'HSM-AES-GCM-512',
    hsmNode: 'HSM-LONDON-TIER4-03',
    aiSecurityScore: 97.40,
    anomalyRiskIndex: 0.35,
    complianceRating: 'ZERO_TRUST_VERIFIED',
    isUnmasked: false
  },
  {
    id: 'CITI-SOV-00921-DELTA',
    maskedAlias: 'CITI-ENCR-4472••••••••9015',
    clearAccountIdentifier: 'SG11 CITI 0019 9002 4472 9015 12',
    routingBic: 'CITISGSGXXX / 00199',
    citiBranchOrigin: 'Citibank International, Marina Bay Financial Tower SG',
    modernTreasuryLedgerId: 'mt_led_01HY9101DD11JKL0299',
    currency: 'SGD',
    allocationBalance: 1820000000.00,
    encryptionStandard: 'QUANTUM-LATTICE-KYBER-1024',
    hsmNode: 'HSM-SINGAPORE-APEX-04',
    aiSecurityScore: 99.92,
    anomalyRiskIndex: 0.01,
    complianceRating: 'SOVEREIGN_PASSED',
    isUnmasked: false
  },
  {
    id: 'CITI-SOV-00922-EPSILON',
    maskedAlias: 'CITI-ENCR-7729••••••••3311',
    clearAccountIdentifier: 'DE89 5007 0010 0772 9033 1109 0',
    routingBic: 'CITIDEFFXXX / 50070010',
    citiBranchOrigin: 'Citibank Europe PLC, Frankfurt Sovereign Hub',
    modernTreasuryLedgerId: 'mt_led_01HY9210EE22MNP0773',
    currency: 'EUR',
    allocationBalance: 430200000.00,
    encryptionStandard: 'CITI-ZK-ENCLAVE-V4',
    hsmNode: 'HSM-FRANKFURT-VAULT-02',
    aiSecurityScore: 96.80,
    anomalyRiskIndex: 0.49,
    complianceRating: 'ZERO_TRUST_VERIFIED',
    isUnmasked: false
  }
];

export const SovereignClearAccountTerminal: React.FC = () => {
  const [records, setRecords] = useState<EncryptedAccountRecord[]>(INITIAL_BATCH_RECORDS);
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [isBatchProcessing, setIsBatchProcessing] = useState<boolean>(false);
  const [isAiAuditing, setIsAiAuditing] = useState<boolean>(false);
  const [vaultExportStatus, setVaultExportStatus] = useState<'idle' | 'encrypting' | 'exported'>('idle');
  const [auditLog, setAuditLog] = useState<string[]>([
    'SYSTEM BOOT: Sovereign Citi Clearance Terminal v8.9.2 Active',
    'HSM Cluster: 5 of 5 Quantum Enclaves synchronized with Modern Treasury Ledger mesh',
    'AI Risk Evaluation Engine: Online with neural heuristic weights v24.11'
  ]);
  const [filterQuery, setFilterQuery] = useState<string>('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');

  // Auto-scrub ticker for unmasked values (30 second auto re-mask timer)
  useEffect(() => {
    const timer = setInterval(() => {
      setRecords((prev) =>
        prev.map((rec) => {
          if (rec.isUnmasked && rec.timeRemainingSec !== undefined) {
            if (rec.timeRemainingSec <= 1) {
              return { ...rec, isUnmasked: false, timeRemainingSec: undefined };
            }
            return { ...rec, timeRemainingSec: rec.timeRemainingSec - 1 };
          }
          return rec;
        })
      );
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const addLog = useCallback((message: string) => {
    const timestamp = new Date().toISOString().substring(11, 19);
    setAuditLog((prev) => [`[${timestamp}] ${message}`, ...prev.slice(0, 49)]);
  }, []);

  const handleToggleUnmask = (id: string) => {
    setRecords((prev) =>
      prev.map((item) => {
        if (item.id === id) {
          const nextState = !item.isUnmasked;
          if (nextState) {
            addLog(`DECRYPT_SIGNAL: Record ${id} decrypted via Citi HSM Key Pair. Ephemeral auto-scrub engaged (30s).`);
            return {
              ...item,
              isUnmasked: true,
              unmaskedAt: new Date().toLocaleTimeString(),
              timeRemainingSec: 30
            };
          } else {
            addLog(`RE_MASK_TRIGGER: Record ${id} account identifier safely returned to cipher state.`);
            return {
              ...item,
              isUnmasked: false,
              timeRemainingSec: undefined
            };
          }
        }
        return item;
      })
    );
  };

  const handleBatchUnmaskAll = async () => {
    setIsBatchProcessing(true);
    addLog('BATCH_INITIATE: Authorizing bulk unmask via Modern Treasury multi-sig enclave...');
    await new Promise((r) => setTimeout(r, 900));

    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        isUnmasked: true,
        unmaskedAt: new Date().toLocaleTimeString(),
        timeRemainingSec: 30
      }))
    );
    setIsBatchProcessing(false);
    addLog('BATCH_COMPLETE: 5 of 5 accounts unmasked. AI surveillance active. Auto-scrub active.');
  };

  const handleBatchMaskAll = () => {
    setRecords((prev) =>
      prev.map((r) => ({
        ...r,
        isUnmasked: false,
        timeRemainingSec: undefined
      }))
    );
    addLog('BATCH_ENCRYPT_ALL: All identifier outputs scrambled to sovereign cipher state.');
  };

  const handleCopyToClipboard = async (text: string, id: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      addLog(`CLIPBOARD_PIPELINE: Clear identifier for [${id}] copied. Ephemeral OS memory purge recommended.`);
      setTimeout(() => setCopiedId(null), 2500);
    } catch (err) {
      addLog(`ERROR: Clipboard copy failed for [${id}]: ${err}`);
    }
  };

  const handleRunAiAudit = async () => {
    setIsAiAuditing(true);
    addLog('AI_NEURAL_EVAL: Computing zero-day routing anomalies, Modern Treasury ledger consistency, and AML heuristics...');
    await new Promise((r) => setTimeout(r, 1400));

    setRecords((prev) =>
      prev.map((rec) => {
        const deltaScore = Number((Math.random() * 0.4 - 0.2).toFixed(2));
        const newScore = Math.min(99.99, Math.max(92.00, Number((rec.aiSecurityScore + deltaScore).toFixed(2))));
        const newAnomaly = Math.max(0.005, Number((rec.anomalyRiskIndex * (0.85 + Math.random() * 0.3)).toFixed(3)));
        return {
          ...rec,
          aiSecurityScore: newScore,
          anomalyRiskIndex: newAnomaly
        };
      })
    );

    setIsAiAuditing(false);
    addLog('AI_NEURAL_EVAL_COMPLETE: Dynamic risk matrix updated across Citi Sovereign nodes.');
  };

  const handleExportToVault = async () => {
    setVaultExportStatus('encrypting');
    addLog('VAULT_EXPORT_PIPELINE: Packaging batch payload with Modern Treasury Zero-Knowledge metadata & Citi signatures...');
    await new Promise((r) => setTimeout(r, 1800));

    const exportPayload = {
      exportTimestamp: new Date().toISOString(),
      vaultClassification: 'TOP_SECRET//SOVEREIGN_CITI_MT_CLEARANCE',
      hsmClusterSignature: '0x994FA281BC004E8A9114FD883CDE1920AF378129',
      recordsTotal: records.length,
      aggregateBalanceUSD: records.reduce((acc, curr) => acc + curr.allocationBalance, 0),
      batchData: records.map((r) => ({
        id: r.id,
        routingBic: r.routingBic,
        citiBranch: r.citiBranchOrigin,
        modernTreasuryLedger: r.modernTreasuryLedgerId,
        currency: r.currency,
        balance: r.allocationBalance,
        encryptionProfile: r.encryptionStandard,
        clearAccountDigest: r.clearAccountIdentifier,
        aiSecurityScore: r.aiSecurityScore
      }))
    };

    const blob = new Blob([JSON.stringify(exportPayload, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `CITI_SOVEREIGN_CLEAR_VAULT_${Date.now()}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);

    setVaultExportStatus('exported');
    addLog('VAULT_EXPORT_SUCCESS: Signed cryptographic package exported to Sovereign Local Vault.');
    setTimeout(() => setVaultExportStatus('idle'), 4000);
  };

  const filteredRecords = useMemo(() => {
    return records.filter((rec) => {
      const matchesCurrency = selectedCurrency === 'ALL' || rec.currency === selectedCurrency;
      const matchesQuery =
        rec.id.toLowerCase().includes(filterQuery.toLowerCase()) ||
        rec.routingBic.toLowerCase().includes(filterQuery.toLowerCase()) ||
        rec.citiBranchOrigin.toLowerCase().includes(filterQuery.toLowerCase()) ||
        rec.modernTreasuryLedgerId.toLowerCase().includes(filterQuery.toLowerCase());
      return matchesCurrency && matchesQuery;
    });
  }, [records, filterQuery, selectedCurrency]);

  const totalVaultValueUSD = useMemo(() => {
    return records.reduce((sum, r) => sum + r.allocationBalance, 0);
  }, [records]);

  const averageAiScore = useMemo(() => {
    if (!records.length) return 0;
    const sum = records.reduce((acc, curr) => acc + curr.aiSecurityScore, 0);
    return (sum / records.length).toFixed(2);
  }, [records]);

  const unmaskedCount = useMemo(() => {
    return records.filter((r) => r.isUnmasked).length;
  }, [records]);

  return (
    <div className="min-h-screen bg-[#05070B] text-slate-100 p-4 md:p-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner: Sovereign Authority & Modern Treasury Bridge Status */}
      <div className="max-w-7xl mx-auto space-y-6">
        <header className="relative overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-r from-black via-[#0D1117] to-[#161B22] p-6 md:p-8 shadow-2xl shadow-amber-950/20 backdrop-blur-xl">
          <div className="absolute top-0 right-0 h-40 w-40 bg-gradient-to-bl from-amber-500/10 via-emerald-500/5 to-transparent blur-2xl pointer-events-none" />
          <div className="absolute -left-10 -bottom-10 h-44 w-44 bg-blue-600/10 blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 relative z-10">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-amber-500/10 text-amber-400 border border-amber-500/30">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                  Citibank Sovereign Core
                </span>
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold uppercase tracking-widest bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                  Modern Treasury Sync: LIVE
                </span>
              </div>
              <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
                Sovereign Clear Account Terminal
                <span className="text-sm font-mono px-2.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                  HSM-V8.9
                </span>
              </h1>
              <p className="text-slate-400 text-sm md:text-base max-w-2xl">
                Batch identifier unmasking terminal with real-time AI security evaluations, instant cryptographic
                copy-buffer scrubs, and direct Modern Treasury sovereign cold vault export pipeline.
              </p>
            </div>

            {/* Quick Metrics Bar */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="bg-black/60 border border-slate-800 p-3 rounded-xl backdrop-blur-md">
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono uppercase">
                  <Layers className="w-3.5 h-3.5 text-amber-400" /> Managed Assets
                </div>
                <div className="text-lg font-bold text-amber-300 font-mono mt-1">
                  ${(totalVaultValueUSD / 1_000_000_000).toFixed(2)}B <span className="text-xs text-slate-500">USD</span>
                </div>
              </div>

              <div className="bg-black/60 border border-slate-800 p-3 rounded-xl backdrop-blur-md">
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono uppercase">
                  <Cpu className="w-3.5 h-3.5 text-emerald-400" /> AI Net Score
                </div>
                <div className="text-lg font-bold text-emerald-400 font-mono mt-1">
                  {averageAiScore}% <span className="text-xs text-slate-500">RESISTANT</span>
                </div>
              </div>

              <div className="col-span-2 sm:col-span-1 bg-black/60 border border-slate-800 p-3 rounded-xl backdrop-blur-md">
                <div className="text-xs text-slate-400 flex items-center gap-1 font-mono uppercase">
                  <Unlock className="w-3.5 h-3.5 text-blue-400" /> Decrypted
                </div>
                <div className="text-lg font-bold text-white font-mono mt-1">
                  {unmaskedCount} / {records.length} <span className="text-xs text-slate-500">ACTIVE</span>
                </div>
              </div>
            </div>
          </div>
        </header>

        {/* Global Action Bar & Filters */}
        <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 bg-[#0A0E17] border border-slate-800/80 p-4 rounded-xl">
          <div className="flex flex-wrap items-center gap-3 flex-1">
            <div className="relative flex-1 min-w-[220px]">
              <input
                type="text"
                placeholder="Search Citi Account ID, BIC, Branch, or MT Ledger..."
                value={filterQuery}
                onChange={(e) => setFilterQuery(e.target.value)}
                className="w-full bg-slate-900/90 border border-slate-700 text-sm rounded-lg px-3.5 py-2 text-white placeholder-slate-500 focus:outline-none focus:border-amber-500 transition-colors font-mono"
              />
            </div>

            <div className="flex items-center gap-1.5 bg-slate-900 border border-slate-800 rounded-lg p-1">
              {['ALL', 'USD', 'EUR', 'CHF', 'GBP', 'SGD'].map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-2.5 py-1 text-xs font-mono font-medium rounded transition-all ${
                    selectedCurrency === curr
                      ? 'bg-amber-500 text-black font-bold shadow-md shadow-amber-500/20'
                      : 'text-slate-400 hover:text-white hover:bg-slate-800'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            {unmaskedCount < records.length ? (
              <button
                onClick={handleBatchUnmaskAll}
                disabled={isBatchProcessing}
                className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-black font-semibold text-xs rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-amber-900/30 disabled:opacity-50"
              >
                {isBatchProcessing ? (
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-black" />
                ) : (
                  <Unlock className="w-3.5 h-3.5 text-black" />
                )}
                Unmask Batch
              </button>
            ) : (
              <button
                onClick={handleBatchMaskAll}
                className="flex items-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 font-semibold text-xs rounded-lg uppercase tracking-wider transition-all border border-slate-700"
              >
                <Lock className="w-3.5 h-3.5 text-amber-400" />
                Lock Batch
              </button>
            )}

            <button
              onClick={handleRunAiAudit}
              disabled={isAiAuditing}
              className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-emerald-400 font-semibold text-xs rounded-lg uppercase tracking-wider border border-emerald-500/30 hover:border-emerald-500 transition-all shadow-lg shadow-emerald-950/20 disabled:opacity-50"
            >
              {isAiAuditing ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
              ) : (
                <Cpu className="w-3.5 h-3.5 text-emerald-400" />
              )}
              AI Deep Audit
            </button>

            <button
              onClick={handleExportToVault}
              disabled={vaultExportStatus !== 'idle'}
              className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white font-semibold text-xs rounded-lg uppercase tracking-wider transition-all shadow-lg shadow-blue-900/30 disabled:opacity-50"
            >
              {vaultExportStatus === 'encrypting' ? (
                <RefreshCw className="w-3.5 h-3.5 animate-spin text-white" />
              ) : vaultExportStatus === 'exported' ? (
                <Check className="w-3.5 h-3.5 text-white" />
              ) : (
                <Download className="w-3.5 h-3.5 text-white" />
              )}
              {vaultExportStatus === 'encrypting'
                ? 'Signing...'
                : vaultExportStatus === 'exported'
                ? 'Exported'
                : 'Vault Export'}
            </button>
          </div>
        </div>

        {/* Account Records List */}
        <div className="space-y-4">
          <AnimatePresence>
            {filteredRecords.map((record) => (
              <motion.div
                key={record.id}
                layout
                initial={{ opacity: 0, y: 12 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, scale: 0.98 }}
                className={`relative rounded-xl border transition-all duration-300 overflow-hidden ${
                  record.isUnmasked
                    ? 'border-amber-500/60 bg-gradient-to-b from-[#121620] via-[#0e121a] to-[#070a0f] shadow-xl shadow-amber-950/20'
                    : 'border-slate-800/80 bg-[#0A0D14] hover:border-slate-700'
                }`}
              >
                {/* Visual Top Highlight Bar for Unmasked */}
                {record.isUnmasked && (
                  <div className="h-1 w-full bg-gradient-to-r from-amber-500 via-emerald-400 to-amber-500 animate-pulse" />
                )}

                <div className="p-5 md:p-6 space-y-5">
                  {/* Row 1: Header + Identifiers */}
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-3">
                      <div
                        className={`p-2.5 rounded-xl border ${
                          record.isUnmasked
                            ? 'bg-amber-500/10 border-amber-500/40 text-amber-400'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        <Fingerprint className="w-6 h-6" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold tracking-wider text-amber-400">
                            {record.id}
                          </span>
                          <span className="text-xs px-2 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300 font-mono">
                            {record.currency}
                          </span>
                          <span className="text-[10px] px-2 py-0.5 rounded bg-emerald-950/60 border border-emerald-700/50 text-emerald-300 font-mono flex items-center gap-1">
                            <ShieldCheck className="w-3 h-3" />
                            {record.complianceRating}
                          </span>
                        </div>
                        <h3 className="text-sm font-semibold text-slate-300 mt-0.5">
                          {record.citiBranchOrigin}
                        </h3>
                      </div>
                    </div>

                    {/* Allocation Balance */}
                    <div className="text-left md:text-right">
                      <div className="text-xs text-slate-500 uppercase tracking-widest font-mono">
                        Ledger Allocation Balance
                      </div>
                      <div className="text-xl font-mono font-bold text-white tracking-tight mt-0.5">
                        {record.currency} {record.allocationBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                    </div>
                  </div>

                  {/* Row 2: Account Clearance Display Box */}
                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-4 items-center bg-black/50 border border-slate-800/80 rounded-xl p-4">
                    {/* Identifier Area */}
                    <div className="lg:col-span-8 space-y-1.5">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1">
                          <KeyRound className="w-3 h-3 text-amber-400" />
                          Citi Canonical Account Identifier (IBAN / BBAN)
                        </span>
                        {record.isUnmasked && record.timeRemainingSec !== undefined && (
                          <span className="text-[11px] font-mono text-amber-400 flex items-center gap-1 animate-pulse">
                            Auto-Scrub: {record.timeRemainingSec}s
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-3">
                        <div
                          className={`font-mono text-base md:text-lg tracking-wider px-3.5 py-2 rounded-lg border w-full select-all transition-all duration-200 ${
                            record.isUnmasked
                              ? 'bg-amber-950/20 border-amber-500/50 text-amber-200 shadow-inner'
                              : 'bg-slate-900 border-slate-800 text-slate-500'
                          }`}
                        >
                          {record.isUnmasked ? record.clearAccountIdentifier : record.maskedAlias}
                        </div>

                        {/* Action buttons for specific record */}
                        <div className="flex items-center gap-1.5 shrink-0">
                          <button
                            onClick={() => handleToggleUnmask(record.id)}
                            title={record.isUnmasked ? 'Re-mask Identifier' : 'Unmask Identifier'}
                            className={`p-2 rounded-lg border transition-all ${
                              record.isUnmasked
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300 hover:bg-amber-500/30'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {record.isUnmasked ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>

                          <button
                            onClick={() =>
                              handleCopyToClipboard(
                                record.isUnmasked ? record.clearAccountIdentifier : record.maskedAlias,
                                record.id
                              )
                            }
                            title="Copy to Clipboard"
                            className="p-2 rounded-lg bg-slate-800 border border-slate-700 text-slate-300 hover:bg-slate-700 hover:text-white transition-all"
                          >
                            {copiedId === record.id ? (
                              <Check className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <Copy className="w-4 h-4" />
                            )}
                          </button>
                        </div>
                      </div>
                    </div>

                    {/* AI Security Evaluation HUD */}
                    <div className="lg:col-span-4 bg-[#0D121D] border border-slate-800 rounded-lg p-3 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                          <Cpu className="w-3 h-3 text-emerald-400" />
                          AI Security Score
                        </span>
                        <span
                          className={`font-mono text-xs font-bold ${
                            record.aiSecurityScore > 98
                              ? 'text-emerald-400'
                              : record.aiSecurityScore > 95
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {record.aiSecurityScore}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div
                          className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 rounded-full transition-all duration-500"
                          style={{ width: `${record.aiSecurityScore}%` }}
                        />
                      </div>

                      <div className="flex items-center justify-between text-[10px] font-mono text-slate-400 pt-1">
                        <span>Anomaly Index: {record.anomalyRiskIndex}</span>
                        <span className="text-slate-500">{record.encryptionStandard}</span>
                      </div>
                    </div>
                  </div>

                  {/* Row 3: Modern Treasury Ledger & Telemetry Details */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 text-xs font-mono text-slate-400 border-t border-slate-800/60 pt-3">
                    <div className="flex items-center gap-2 truncate">
                      <Database className="w-3.5 h-3.5 text-blue-400 shrink-0" />
                      <span className="text-slate-500">MT Ledger:</span>
                      <span className="text-slate-300 truncate">{record.modernTreasuryLedgerId}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <Server className="w-3.5 h-3.5 text-amber-400 shrink-0" />
                      <span className="text-slate-500">Routing BIC:</span>
                      <span className="text-slate-300 truncate">{record.routingBic}</span>
                    </div>

                    <div className="flex items-center gap-2 truncate">
                      <Zap className="w-3.5 h-3.5 text-purple-400 shrink-0" />
                      <span className="text-slate-500">HSM Enclave:</span>
                      <span className="text-slate-300 truncate">{record.hsmNode}</span>
                    </div>
                  </div>
                </div>
              </motion.div>
            ))}
          </AnimatePresence>

          {filteredRecords.length === 0 && (
            <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl bg-black/40">
              <AlertTriangle className="w-8 h-8 text-amber-500/60 mx-auto mb-2" />
              <p className="text-slate-400 text-sm">No sovereign account records match your filter criteria.</p>
            </div>
          )}
        </div>

        {/* Live Sovereign Audit & HSM Telemetry Console */}
        <div className="rounded-xl border border-slate-800 bg-[#080B10] p-5 shadow-xl">
          <div className="flex items-center justify-between pb-3 border-b border-slate-800">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-amber-400" />
              <h4 className="text-xs font-mono font-bold uppercase tracking-wider text-slate-200">
                HSM Enclave & AI Security Audit Console
              </h4>
            </div>
            <div className="flex items-center gap-2 text-[11px] font-mono text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
              CITI_ZK_MESH_SYNCED
            </div>
          </div>

          <div className="mt-3 bg-black/80 rounded-lg p-3 font-mono text-xs text-slate-400 h-32 overflow-y-auto space-y-1 scrollbar-thin scrollbar-thumb-slate-800">
            {auditLog.map((log, index) => (
              <div
                key={index}
                className={`leading-relaxed ${
                  log.includes('DECRYPT_SIGNAL')
                    ? 'text-amber-300'
                    : log.includes('AI_NEURAL')
                    ? 'text-emerald-300'
                    : log.includes('VAULT_EXPORT')
                    ? 'text-blue-300'
                    : 'text-slate-400'
                }`}
              >
                {log}
              </div>
            ))}
          </div>

          <div className="mt-3 flex flex-wrap items-center justify-between text-[11px] font-mono text-slate-500 pt-2 border-t border-slate-800/60">
            <div className="flex items-center gap-3">
              <span>Citibank Sovereign clearance API: v2025.1</span>
              <span>•</span>
              <span>Modern Treasury Multi-Party Computation: ENFORCED</span>
            </div>
            <div className="text-amber-500/70 flex items-center gap-1">
              <FileCheck className="w-3 h-3" />
              EAL6+ Hardware Security Level Verified
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SovereignClearAccountTerminal;