import React, { useState, useEffect, useCallback, useRef } from 'react';
import {
  ShieldCheck,
  ShieldAlert,
  Key,
  Cpu,
  Eye,
  EyeOff,
  Fingerprint,
  Lock,
  Unlock,
  Layers,
  Terminal,
  Activity,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Globe,
  Building2,
  Diamond,
  RefreshCw,
  Zap,
  Server,
  Database,
  ArrowRightLeft,
  FileCheck,
  Copy,
  Check
} from 'lucide-react';

// --- DATA STRUCTURES & INTERFACES ---

interface VaultAccount {
  id: string;
  institution: 'Citibank N.A. Private Sovereign' | 'Modern Treasury Liquidity Ledger';
  accountType: 'Ultra-High-Net-Worth Omnibus' | 'Continuous Settlement Clear Pool' | 'Quantum Sovereign Reserve';
  maskedIban: string;
  clearIban: string;
  maskedRouting: string;
  clearRouting: string;
  maskedSwift: string;
  clearSwift: string;
  jurisdiction: string;
  balanceClear: string;
  balanceCurrency: string;
  hsmEnclaveId: string;
  quantumKeyHash: string;
  biometricThresholdMet: boolean;
}

interface ThreatLog {
  id: string;
  timestamp: string;
  threatLevel: 'NOMINAL' | 'DEFENDED' | 'ANOMALY_SUPPRESSED';
  origin: string;
  entropyVector: string;
  neuralConfidence: number;
  actionTaken: string;
}

const VAULT_ACCOUNTS: VaultAccount[] = [
  {
    id: 'citi-sov-001',
    institution: 'Citibank N.A. Private Sovereign',
    accountType: 'Quantum Sovereign Reserve',
    maskedIban: 'US94 CITI 0008 •••• •••• •••• 9924',
    clearIban: 'US94 CITI 0008 4920 1198 8301 9924',
    maskedRouting: '021000089 (HSM-OBF)',
    clearRouting: '021000089',
    maskedSwift: 'CITIUS33XXX-SEC',
    clearSwift: 'CITIUS33XXX',
    jurisdiction: 'New York (Federal Reserve Tier-1 Sovereign Node)',
    balanceClear: '$42,850,000,000.00',
    balanceCurrency: 'USD',
    hsmEnclaveId: 'CITI-HSM-SGX-TITANIUM-098',
    quantumKeyHash: '0x7F4A9B89C31D78013EFA4401BC99A2D48E',
    biometricThresholdMet: false
  },
  {
    id: 'mt-ledger-002',
    institution: 'Modern Treasury Liquidity Ledger',
    accountType: 'Continuous Settlement Clear Pool',
    maskedIban: 'GB29 MTLY 6016 •••• •••• •••• 4401',
    clearIban: 'GB29 MTLY 6016 1390 4018 7720 4401',
    maskedRouting: '601613 (MT-VIRT-ENCRYPT)',
    clearRouting: '60-16-13',
    maskedSwift: 'MTLYGB2LXXX-CLR',
    clearSwift: 'MTLYGB2LXXX',
    jurisdiction: 'London (Bank of England RTGS RT-Interface)',
    balanceClear: '£18,620,000,000.00',
    balanceCurrency: 'GBP',
    hsmEnclaveId: 'MT-AWS-NITRO-ENCLAVE-91A',
    quantumKeyHash: '0x3E80194FA0DC8115682AA77B099CEF5012',
    biometricThresholdMet: false
  },
  {
    id: 'citi-mt-hybrid-003',
    institution: 'Citibank N.A. Private Sovereign',
    accountType: 'Ultra-High-Net-Worth Omnibus',
    maskedIban: 'CH93 CITI 0839 •••• •••• •••• 1008',
    clearIban: 'CH93 CITI 0839 8812 0041 9912 1008',
    maskedRouting: '08398 (ZURICH-CIPHER)',
    clearRouting: '08398',
    maskedSwift: 'CITICHZZXXX',
    clearSwift: 'CITICHZZXXX',
    jurisdiction: 'Zurich (SNB Direct Sovereign Settlement Link)',
    balanceClear: 'CHF 29,400,000,000.00',
    balanceCurrency: 'CHF',
    hsmEnclaveId: 'CITI-ZURICH-VAULT-K7',
    quantumKeyHash: '0x99A0CF410294EA114408CC7169BD0081C4',
    biometricThresholdMet: false
  }
];

const INITIAL_THREAT_LOGS: ThreatLog[] = [
  {
    id: 'LOG-8812',
    timestamp: 'JUST NOW',
    threatLevel: 'NOMINAL',
    origin: 'Citi-Gateway: SGX Enclave v4',
    entropyVector: 'Shannon Entropy: 7.9998 bits/byte',
    neuralConfidence: 99.998,
    actionTaken: 'Zero-Memory Leak Shield Active. Ephemeral Buffer Purged.'
  },
  {
    id: 'LOG-8811',
    timestamp: '42s ago',
    threatLevel: 'DEFENDED',
    origin: 'MT-Webhook Relay: Endpoint Ping',
    entropyVector: 'Side-Channel Timing Probe (Suppressed)',
    neuralConfidence: 99.982,
    actionTaken: 'Synthetic Jitter Injected. Real Memory Space Obfuscated.'
  },
  {
    id: 'LOG-8810',
    timestamp: '2m ago',
    threatLevel: 'NOMINAL',
    origin: 'Federal Reserve FedNow Core',
    entropyVector: 'ISO 20022 Signature Verified (pqc-Dilithium)',
    neuralConfidence: 100.0,
    actionTaken: 'Bilateral Quantum Certificate Validated.'
  }
];

export const SovereignClearDataVault: React.FC = () => {
  // State
  const [selectedVaultIndex, setSelectedVaultIndex] = useState<number>(0);
  const [isDecrypted, setIsDecrypted] = useState<boolean>(false);
  const [isDecrypting, setIsDecrypting] = useState<boolean>(false);
  const [key1Active, setKey1Active] = useState<boolean>(false);
  const [key2Active, setKey2Active] = useState<boolean>(false);
  const [biometricScanning, setBiometricScanning] = useState<boolean>(false);
  const [scanProgress, setScanProgress] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Scrambler morphing animation state
  const [scrambledIban, setScrambledIban] = useState<string>(VAULT_ACCOUNTS[0].maskedIban);
  const [scrambledRouting, setScrambledRouting] = useState<string>(VAULT_ACCOUNTS[0].maskedRouting);
  const [scrambledSwift, setScrambledSwift] = useState<string>(VAULT_ACCOUNTS[0].maskedSwift);

  // AI & telemetry metrics
  const [entropyRate, setEntropyRate] = useState<number>(99.994);
  const [activeThreatLogs, setActiveThreatLogs] = useState<ThreatLog[]>(INITIAL_THREAT_LOGS);
  const [autoLockCountdown, setAutoLockCountdown] = useState<number | null>(null);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const activeAccount = VAULT_ACCOUNTS[selectedVaultIndex];

  // Helper for random character scrambling effect
  const scrambleString = (target: string, progressRatio: number): string => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789#%&*@!$';
    const revealedLength = Math.floor(target.length * progressRatio);
    return target
      .split('')
      .map((char, i) => {
        if (char === ' ' || char === '-' || char === '.') return char;
        if (i < revealedLength) return target[i];
        return chars[Math.floor(Math.random() * chars.length)];
      })
      .join('');
  };

  // Perform Scrambled Morph Effect on Decrypt
  const triggerMorphAnimation = useCallback((targetAccount: VaultAccount, reverse = false) => {
    let currentStep = 0;
    const totalSteps = 24;
    const intervalTime = 40;

    const interval = setInterval(() => {
      currentStep++;
      const ratio = currentStep / totalSteps;
      const effectiveRatio = reverse ? 1 - ratio : ratio;

      const destIban = reverse ? targetAccount.maskedIban : targetAccount.clearIban;
      const destRouting = reverse ? targetAccount.maskedRouting : targetAccount.clearRouting;
      const destSwift = reverse ? targetAccount.maskedSwift : targetAccount.clearSwift;

      setScrambledIban(scrambleString(destIban, effectiveRatio));
      setScrambledRouting(scrambleString(destRouting, effectiveRatio));
      setScrambledSwift(scrambleString(destSwift, effectiveRatio));

      if (currentStep >= totalSteps) {
        clearInterval(interval);
        setScrambledIban(destIban);
        setScrambledRouting(destRouting);
        setScrambledSwift(destSwift);
      }
    }, intervalTime);
  }, []);

  // Update cipher view when account changes
  useEffect(() => {
    setIsDecrypted(false);
    setKey1Active(false);
    setKey2Active(false);
    setAutoLockCountdown(null);
    if (timerRef.current) clearInterval(timerRef.current);
    setScrambledIban(activeAccount.maskedIban);
    setScrambledRouting(activeAccount.maskedRouting);
    setScrambledSwift(activeAccount.maskedSwift);
  }, [selectedVaultIndex]);

  // Real-time jitter simulation for sovereign telemetry
  useEffect(() => {
    const liveInterval = setInterval(() => {
      setEntropyRate((prev) => {
        const jitter = (Math.random() - 0.5) * 0.004;
        return Number(Math.min(100, Math.max(99.98, prev + jitter)).toFixed(4));
      });
    }, 2400);
    return () => clearInterval(liveInterval);
  }, []);

  // Dual-Key Biometric Scan Execution
  const handleInitiateBiometric = () => {
    if (biometricScanning || isDecrypted) return;
    setBiometricScanning(true);
    setScanProgress(0);

    let p = 0;
    const scanInterval = setInterval(() => {
      p += 5;
      setScanProgress(p);

      if (p === 50) {
        setKey1Active(true);
      }

      if (p >= 100) {
        clearInterval(scanInterval);
        setKey2Active(true);
        setBiometricScanning(false);
        finalizeDecryption();
      }
    }, 45);
  };

  const finalizeDecryption = () => {
    setIsDecrypting(true);
    setTimeout(() => {
      setIsDecrypting(false);
      setIsDecrypted(true);
      triggerMorphAnimation(activeAccount, false);

      // Start 60-second self-destruct / re-encryption countdown
      setAutoLockCountdown(60);

      // Append real-time verified threat log
      const newLog: ThreatLog = {
        id: `LOG-${Math.floor(1000 + Math.random() * 9000)}`,
        timestamp: 'JUST NOW',
        threatLevel: 'NOMINAL',
        origin: 'Citi/Modern Treasury Bilateral Cryptographic Clear',
        entropyVector: 'Dual Biometric FIDO3 Enclave Match: 100%',
        neuralConfidence: 99.999,
        actionTaken: 'Zero-Knowledge Unmasking Authorized. Auto-Purge Armed (60s).'
      };
      setActiveThreatLogs((prev) => [newLog, ...prev.slice(0, 4)]);
    }, 300);
  };

  // Re-encrypt / Lock Vault
  const handleImmediateLock = () => {
    if (!isDecrypted && !key1Active && !key2Active) return;
    triggerMorphAnimation(activeAccount, true);
    setIsDecrypted(false);
    setKey1Active(false);
    setKey2Active(false);
    setAutoLockCountdown(null);
    if (timerRef.current) clearInterval(timerRef.current);
  };

  // Auto lock countdown logic
  useEffect(() => {
    if (autoLockCountdown !== null && autoLockCountdown > 0) {
      timerRef.current = setInterval(() => {
        setAutoLockCountdown((prev) => {
          if (prev === null || prev <= 1) {
            handleImmediateLock();
            return null;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [autoLockCountdown]);

  const copyToClipboard = (text: string, fieldName: string) => {
    if (!isDecrypted) return;
    navigator.clipboard.writeText(text);
    setCopiedField(fieldName);
    setTimeout(() => setCopiedField(null), 2000);
  };

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Background Atmospheric Glows */}
      <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
        <div className="absolute -top-[20%] left-1/4 w-[600px] h-[600px] bg-blue-950/20 rounded-full blur-[140px]" />
        <div className="absolute top-1/3 -right-[10%] w-[550px] h-[550px] bg-amber-900/10 rounded-full blur-[160px]" />
        <div className="absolute -bottom-[10%] left-1/3 w-[500px] h-[500px] bg-slate-900/40 rounded-full blur-[120px]" />
      </div>

      <div className="relative z-10 max-w-7xl mx-auto space-y-6">
        {/* ================= TITANIUM MASTER HEADER ================= */}
        <header className="relative border border-slate-700/60 bg-gradient-to-r from-slate-900/90 via-[#0B1220]/95 to-slate-900/90 backdrop-blur-2xl rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.8)] overflow-hidden">
          {/* Sovereign Brushed Titanium Accent Stripe */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-amber-400 to-transparent opacity-80" />
          <div className="absolute -top-24 -right-24 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="p-2.5 rounded-xl bg-gradient-to-br from-slate-800 to-slate-950 border border-slate-600/50 shadow-inner">
                  <Diamond className="w-7 h-7 text-amber-400 animate-pulse" />
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] font-mono tracking-widest text-amber-400/90 uppercase px-2 py-0.5 rounded bg-amber-950/40 border border-amber-800/40">
                      Sovereign Tier-0 Clear Enclave
                    </span>
                    <span className="text-[10px] font-mono tracking-widest text-emerald-400 uppercase px-2 py-0.5 rounded bg-emerald-950/40 border border-emerald-800/40 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                      Zero-Exposure AI Shield: ACTIVE
                    </span>
                  </div>
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2 mt-1">
                    Citibank <span className="text-slate-400 font-light">×</span> Modern Treasury
                    <span className="text-xs text-slate-400 font-mono font-normal ml-2 border border-slate-700/80 px-2 py-0.5 rounded-md bg-slate-900/60">
                      FIPS 140-3 Level 4 HSM
                    </span>
                  </h1>
                </div>
              </div>
              <p className="text-sm text-slate-400 max-w-2xl">
                Dual-Key Biometric Quantum Unmasking Console for Institutional Omnibus Clearing & Automated RTGS Continuous Settlement Ledger.
              </p>
            </div>

            {/* Top Vault Metrics & Live Indicators */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Zero-Leak Entropy</span>
                  <Activity className="w-3.5 h-3.5 text-emerald-400" />
                </div>
                <div className="text-lg font-mono font-bold text-slate-100">{entropyRate}%</div>
                <div className="text-[10px] text-emerald-400/80">Quantum Immune</div>
              </div>

              <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>HSM Status</span>
                  <Server className="w-3.5 h-3.5 text-amber-400" />
                </div>
                <div className="text-lg font-mono font-bold text-amber-300">SGX-ULTRA</div>
                <div className="text-[10px] text-slate-400">Isolated Memory Space</div>
              </div>

              <div className="col-span-2 sm:col-span-1 p-3 rounded-xl bg-slate-950/70 border border-slate-800 backdrop-blur-sm">
                <div className="flex items-center justify-between text-[11px] text-slate-400 mb-1">
                  <span>Enclave Auto-Lock</span>
                  <Zap className="w-3.5 h-3.5 text-cyan-400" />
                </div>
                <div className="text-lg font-mono font-bold text-cyan-300">
                  {autoLockCountdown !== null ? `${autoLockCountdown}s` : 'LOCKED'}
                </div>
                <div className="text-[10px] text-slate-400">Self-Purge Timer</div>
              </div>
            </div>
          </div>

          {/* Account Selector Tabs */}
          <div className="mt-8 flex flex-wrap gap-2 border-t border-slate-800/80 pt-4">
            {VAULT_ACCOUNTS.map((acc, index) => {
              const isSelected = selectedVaultIndex === index;
              return (
                <button
                  key={acc.id}
                  onClick={() => setSelectedVaultIndex(index)}
                  className={`flex items-center space-x-3 px-4 py-2.5 rounded-xl text-xs font-mono transition-all duration-200 border ${
                    isSelected
                      ? 'bg-gradient-to-r from-slate-800 to-slate-850 border-amber-500/60 text-white shadow-lg shadow-amber-950/20'
                      : 'bg-slate-950/40 border-slate-800/80 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                  }`}
                >
                  <Building2
                    className={`w-4 h-4 ${isSelected ? 'text-amber-400' : 'text-slate-500'}`}
                  />
                  <div className="text-left">
                    <div className="font-semibold text-slate-200">{acc.institution}</div>
                    <div className="text-[10px] text-slate-400">{acc.accountType}</div>
                  </div>
                  {isSelected && (
                    <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse ml-2" />
                  )}
                </button>
              );
            })}
          </div>
        </header>

        {/* ================= MAIN INTERFACE: SPLIT ENGINE ================= */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* LEFT 7 COLUMNS: THE DECRYPTION CHAMBER & TITANIUM DISPLAY */}
          <section className="lg:col-span-7 space-y-6">
            {/* Decryption Chamber Card */}
            <div className="relative border border-slate-700/80 bg-gradient-to-b from-[#0e1626] to-[#080d17] rounded-2xl p-6 shadow-2xl overflow-hidden">
              {/* Top Bar of Vault Screen */}
              <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
                <div className="flex items-center space-x-2">
                  <div
                    className={`w-3 h-3 rounded-full ${
                      isDecrypted ? 'bg-emerald-400 shadow-[0_0_12px_#34d399]' : 'bg-amber-500/80 shadow-[0_0_12px_#f59e0b]'
                    }`}
                  />
                  <span className="text-xs font-mono font-medium tracking-wider text-slate-300">
                    STATUS:{' '}
                    <span className={isDecrypted ? 'text-emerald-400 font-bold' : 'text-amber-400 font-bold'}>
                      {isDecrypted ? 'DECRYPTED & UNMASKED (CLEAR DATA MODE)' : 'ENCRYPTED CIPHER VAULT'}
                    </span>
                  </span>
                </div>

                <div className="flex items-center space-x-2">
                  {isDecrypted ? (
                    <button
                      onClick={handleImmediateLock}
                      className="px-3 py-1.5 rounded-lg bg-red-950/40 hover:bg-red-900/60 border border-red-800/60 text-red-300 text-xs font-mono font-semibold transition flex items-center gap-1.5"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      Instant Obfuscate & Purge
                    </button>
                  ) : (
                    <div className="text-[11px] font-mono text-slate-400 flex items-center gap-1">
                      <Lock className="w-3.5 h-3.5 text-amber-500" />
                      Zero-Exposure Shield Armed
                    </div>
                  )}
                </div>
              </div>

              {/* Main Clear Account Visualizer */}
              <div className="my-6 p-6 rounded-xl bg-slate-950/90 border border-slate-800/90 relative overflow-hidden group">
                <div className="absolute -right-12 -bottom-12 opacity-5 pointer-events-none">
                  <ShieldCheck className="w-64 h-64 text-amber-400" />
                </div>

                {/* Balance Banner */}
                <div className="flex flex-col sm:flex-row sm:items-baseline sm:justify-between gap-2 pb-4 border-b border-slate-900">
                  <div>
                    <span className="text-[10px] font-mono uppercase text-slate-400 tracking-wider">
                      Verified Vault Balance ({activeAccount.balanceCurrency})
                    </span>
                    <div className="text-2xl md:text-3xl font-mono font-black text-white tracking-tight flex items-center gap-3">
                      {isDecrypted ? activeAccount.balanceClear : '••••••••••••••••••••'}
                      <span className="text-xs font-mono font-normal text-amber-400 border border-amber-500/30 px-2 py-0.5 rounded bg-amber-950/30">
                        {activeAccount.balanceCurrency} RTGS
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-[11px] font-mono text-slate-400">
                    <div>Jurisdiction:</div>
                    <div className="text-slate-200 font-medium">{activeAccount.jurisdiction}</div>
                  </div>
                </div>

                {/* Sensitive Routing & IBAN Fields */}
                <div className="mt-6 space-y-4">
                  {/* IBAN / Account Number */}
                  <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          Primary Sovereign IBAN / Account Number
                        </span>
                        {isDecrypted && (
                          <span className="text-[9px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800/50 px-1.5 rounded">
                            UNMASKED
                          </span>
                        )}
                      </div>
                      <div className="text-base sm:text-lg font-mono font-bold tracking-wider text-amber-200">
                        {scrambledIban}
                      </div>
                    </div>
                    {isDecrypted && (
                      <button
                        onClick={() => copyToClipboard(activeAccount.clearIban, 'iban')}
                        className="px-3 py-1.5 rounded-md bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-mono flex items-center justify-center gap-1.5 transition self-start sm:self-center border border-slate-700"
                        title="Copy to Clipboard"
                      >
                        {copiedField === 'iban' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    )}
                  </div>

                  {/* Routing Node & SWIFT BIC */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    {/* Routing Number */}
                    <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          FedWire / Clearing Routing
                        </span>
                        {isDecrypted && (
                          <button
                            onClick={() => copyToClipboard(activeAccount.clearRouting, 'routing')}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedField === 'routing' ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-100">
                        {scrambledRouting}
                      </div>
                    </div>

                    {/* SWIFT BIC */}
                    <div className="p-3.5 rounded-lg bg-slate-900/80 border border-slate-800 space-y-1">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-mono uppercase tracking-wider text-slate-400">
                          SWIFT / BIC Master Node
                        </span>
                        {isDecrypted && (
                          <button
                            onClick={() => copyToClipboard(activeAccount.clearSwift, 'swift')}
                            className="text-slate-400 hover:text-white"
                          >
                            {copiedField === 'swift' ? (
                              <Check className="w-3 h-3 text-emerald-400" />
                            ) : (
                              <Copy className="w-3 h-3" />
                            )}
                          </button>
                        )}
                      </div>
                      <div className="text-sm font-mono font-bold text-slate-100">
                        {scrambledSwift}
                      </div>
                    </div>
                  </div>

                  {/* HSM Cryptographic Proof Hash */}
                  <div className="p-3 rounded-lg bg-slate-950 border border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-400">
                    <div className="flex items-center space-x-2 overflow-hidden">
                      <Database className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                      <span className="truncate">Key Hash: {activeAccount.quantumKeyHash}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 shrink-0 ml-2">HSM: {activeAccount.hsmEnclaveId}</span>
                  </div>
                </div>
              </div>

              {/* DUAL-KEY BIOMETRIC UNMASKING CONTROLS */}
              <div className="border border-slate-800 bg-slate-950/60 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Fingerprint className="w-5 h-5 text-amber-400" />
                    <span className="text-xs font-mono font-semibold uppercase tracking-wider text-slate-200">
                      Dual-Key Cryptographic Biometric Unmasking
                    </span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-400">
                    2-of-2 Consensus Required
                  </span>
                </div>

                {/* Progress Bar when scanning */}
                {biometricScanning && (
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-[10px] font-mono text-amber-300">
                      <span>Executing Multi-Factor Neural Quantum Handshake...</span>
                      <span>{scanProgress}%</span>
                    </div>
                    <div className="w-full bg-slate-900 rounded-full h-1.5 overflow-hidden border border-slate-800">
                      <div
                        className="bg-gradient-to-r from-amber-500 via-yellow-300 to-emerald-400 h-full transition-all duration-75"
                        style={{ width: `${scanProgress}%` }}
                      />
                    </div>
                  </div>
                )}

                {/* Dual-Key Indicators */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {/* Key 1: Citi Sovereign Seal */}
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 flex items-center space-x-3 ${
                      key1Active
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-md ${
                        key1Active ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Key className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-semibold">Key A: Citi Sovereign Enclave</div>
                      <div className="text-[10px] opacity-75">
                        {key1Active ? 'AUTHENTICATED & UNLOCKED' : 'Awaiting Biometric Token'}
                      </div>
                    </div>
                  </div>

                  {/* Key 2: Modern Treasury Ledger Lock */}
                  <div
                    className={`p-3 rounded-lg border transition-all duration-300 flex items-center space-x-3 ${
                      key2Active
                        ? 'bg-emerald-950/30 border-emerald-500/60 text-emerald-300'
                        : 'bg-slate-900/60 border-slate-800 text-slate-400'
                    }`}
                  >
                    <div
                      className={`p-2 rounded-md ${
                        key2Active ? 'bg-emerald-900/50 text-emerald-300' : 'bg-slate-800 text-slate-500'
                      }`}
                    >
                      <Layers className="w-4 h-4" />
                    </div>
                    <div className="text-xs font-mono">
                      <div className="font-semibold">Key B: Modern Treasury Master Seal</div>
                      <div className="text-[10px] opacity-75">
                        {key2Active ? 'AUTHENTICATED & UNLOCKED' : 'Awaiting Ledger Authorization'}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Decrypt Trigger Button */}
                {!isDecrypted ? (
                  <button
                    disabled={biometricScanning || isDecrypting}
                    onClick={handleInitiateBiometric}
                    className="w-full py-3.5 px-4 rounded-xl bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-500 hover:from-amber-400 hover:to-yellow-400 text-slate-950 font-mono font-bold text-sm tracking-wider shadow-[0_0_30px_rgba(245,158,11,0.25)] transition duration-200 flex items-center justify-center space-x-2 disabled:opacity-50"
                  >
                    {biometricScanning ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin text-slate-950" />
                        <span>VERIFYING BILATERAL HARDWARE ENCLAVES...</span>
                      </>
                    ) : (
                      <>
                        <Fingerprint className="w-4 h-4 text-slate-950" />
                        <span>INITIATE DUAL BIOMETRIC CLEAR DATA UNMASKING</span>
                      </>
                    )}
                  </button>
                ) : (
                  <div className="flex items-center justify-between p-3 rounded-lg bg-emerald-950/40 border border-emerald-600/50 text-emerald-300 text-xs font-mono">
                    <div className="flex items-center space-x-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                      <span>Zero-Knowledge Decrypted Stream Active. Session expires in {autoLockCountdown}s.</span>
                    </div>
                    <button
                      onClick={handleImmediateLock}
                      className="text-xs underline hover:text-emerald-100 font-bold ml-2"
                    >
                      Lock Now
                    </button>
                  </div>
                )}
              </div>
            </div>
          </section>

          {/* RIGHT 5 COLUMNS: AI ZERO-EXPOSURE SENTRY & AUDIT STREAM */}
          <section className="lg:col-span-5 space-y-6">
            {/* AI Zero-Exposure Shield Monitor */}
            <div className="border border-slate-700/80 bg-gradient-to-b from-[#0b121e] to-[#070b12] rounded-2xl p-6 shadow-2xl space-y-5">
              <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                <div className="flex items-center space-x-2">
                  <Cpu className="w-5 h-5 text-cyan-400" />
                  <h2 className="text-sm font-mono font-bold uppercase tracking-wider text-slate-200">
                    Autonomous AI Anomaly Sentry
                  </h2>
                </div>
                <span className="text-[10px] font-mono text-cyan-400 px-2 py-0.5 rounded bg-cyan-950/50 border border-cyan-800/40">
                  Neural Model v9.8
                </span>
              </div>

              {/* Threat Matrix Status */}
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Memory Exfiltration</div>
                  <div className="text-base font-mono font-bold text-emerald-400 mt-1 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    0.00% Zero-Leak
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Scattered RAM Ephemera</div>
                </div>

                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <div className="text-[10px] font-mono text-slate-400 uppercase">Neural Confidence</div>
                  <div className="text-base font-mono font-bold text-cyan-300 mt-1 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-cyan-400" />
                    99.998%
                  </div>
                  <div className="text-[9px] text-slate-500 mt-0.5">Adversarial Resistance</div>
                </div>
              </div>

              {/* Live Threat Radar Scanner */}
              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between text-xs font-mono">
                  <span className="text-slate-300 font-semibold flex items-center gap-1.5">
                    <Activity className="w-3.5 h-3.5 text-amber-400" />
                    Active Cryptographic Threat Telemetry
                  </span>
                  <span className="text-[10px] text-emerald-400 animate-pulse">● LIVE</span>
                </div>

                <div className="space-y-2 max-h-[220px] overflow-y-auto pr-1 text-[11px] font-mono scrollbar-thin scrollbar-thumb-slate-800">
                  {activeThreatLogs.map((log) => (
                    <div
                      key={log.id}
                      className="p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/90 space-y-1"
                    >
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-slate-200">{log.origin}</span>
                        <span className="text-[9px] text-slate-500">{log.timestamp}</span>
                      </div>
                      <div className="text-slate-400 text-[10px]">{log.entropyVector}</div>
                      <div className="text-emerald-400/90 text-[10px] flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3 text-emerald-400 shrink-0" />
                        {log.actionTaken}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Modern Treasury Clearing Pipeline Integration Badge */}
              <div className="p-4 rounded-xl bg-gradient-to-r from-slate-900 to-[#0f172a] border border-slate-800 space-y-2">
                <div className="flex items-center space-x-2">
                  <ArrowRightLeft className="w-4 h-4 text-amber-400" />
                  <span className="text-xs font-mono font-bold text-slate-200">
                    Modern Treasury Direct Dispatch Link
                  </span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Decrypted credentials execute through isolated Modern Treasury Payment Orders with bilateral Citibank RTGS signing. No plain-text ever hits disk or third-party relays.
                </p>
                <div className="flex items-center space-x-4 pt-1 text-[10px] font-mono text-slate-400">
                  <span className="flex items-center gap-1">
                    <FileCheck className="w-3 h-3 text-cyan-400" />
                    Ledgersmith Engine v4.2
                  </span>
                  <span className="flex items-center gap-1">
                    <Globe className="w-3 h-3 text-amber-400" />
                    Direct FedNow / CHAPS / TARGET2
                  </span>
                </div>
              </div>
            </div>

            {/* Sovereign Compliance Seal */}
            <div className="p-4 rounded-2xl border border-slate-800/80 bg-slate-950/40 backdrop-blur-md flex items-center justify-between text-xs font-mono text-slate-400">
              <div className="flex items-center space-x-3">
                <ShieldAlert className="w-4 h-4 text-amber-500 shrink-0" />
                <span>Zero-Trust Ephemeral Buffer Policy Active</span>
              </div>
              <span className="text-[10px] text-slate-500 font-mono">ISO-27001 / SOC-2 Type II</span>
            </div>
          </section>
        </div>
      </div>
    </div>
  );
};

export default SovereignClearDataVault;