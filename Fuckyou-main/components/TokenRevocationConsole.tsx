import React, { useState, useEffect, useCallback } from 'react';
import { 
  ShieldAlert, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Unlock, 
  RefreshCw, 
  Globe, 
  Cpu, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Activity, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  Fingerprint, 
  Sliders, 
  FileText, 
  Server, 
  Compass 
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface TokenSession {
  id: string;
  aggregatorName: string;
  logoUrl?: string;
  connectedAt: string;
  lastUsedAt: string;
  scopes: string[];
  riskScore: number; // 0 to 100
  status: 'active' | 'revoking' | 'revoked' | 'compromised';
  associatedLedgerId: string;
  associatedLedgerBalance: number; // in USD
  currency: string;
  liquidityPool: string;
}

interface AuditLog {
  id: string;
  timestamp: string;
  event: string;
  severity: 'info' | 'warning' | 'critical' | 'success';
  node: string;
}

// ============================================================================
// INITIAL PREMIUM MOCK DATA
// ============================================================================

const INITIAL_SESSIONS: TokenSession[] = [
  {
    id: "tok_citi_plaid_99281",
    aggregatorName: "Plaid Premium Elite",
    connectedAt: "2024-02-15T08:12:00Z",
    lastUsedAt: "2024-10-24T14:22:11Z",
    scopes: ["accounts.read", "transactions.read", "wire.initiate", "identity.verify"],
    riskScore: 12,
    status: 'active',
    associatedLedgerId: "la_mod_treasury_990112",
    associatedLedgerBalance: 450000000, // $450M
    currency: "USD",
    liquidityPool: "Citi New York Fedwire Pool (UHNW-01)"
  },
  {
    id: "tok_citi_yodlee_88102",
    aggregatorName: "Yodlee Sovereign Connect",
    connectedAt: "2024-01-10T10:05:30Z",
    lastUsedAt: "2024-10-24T15:01:45Z",
    scopes: ["accounts.read", "balances.realtime", "ledger.write"],
    riskScore: 68, // High risk trigger
    status: 'active',
    associatedLedgerId: "la_mod_treasury_883011",
    associatedLedgerBalance: 1250000000, // $1.25B
    currency: "EUR",
    liquidityPool: "Citi London CHAPS Liquidity Pool (SOV-09)"
  },
  {
    id: "tok_citi_finicity_77301",
    aggregatorName: "Finicity Family Office API",
    connectedAt: "2024-05-20T16:45:00Z",
    lastUsedAt: "2024-10-24T11:10:02Z",
    scopes: ["accounts.read", "tax.documents", "investment.write"],
    riskScore: 24,
    status: 'active',
    associatedLedgerId: "la_mod_treasury_774092",
    associatedLedgerBalance: 850000000, // $850M
    currency: "CHF",
    liquidityPool: "Citi Zurich Sovereign Vault Pool (FAM-04)"
  }
];

const INITIAL_LOGS: AuditLog[] = [
  {
    id: "log_01",
    timestamp: "15:22:10",
    event: "AURA AI: Continuous threat vector analysis initiated across global endpoints.",
    severity: "info",
    node: "Citi-AI-Core-NY"
  },
  {
    id: "log_02",
    timestamp: "15:22:12",
    event: "Modern Treasury: Ledger sync complete. Total locked liquidity: $2.55B USD equivalent.",
    severity: "success",
    node: "MT-Ledger-Sync"
  },
  {
    id: "log_03",
    timestamp: "15:23:01",
    event: "Anomalous high-frequency read detected on Yodlee Sovereign Connect.",
    severity: "warning",
    node: "Citi-Shield-London"
  }
];

export default function TokenRevocationConsole() {
  // State Management
  const [sessions, setSessions] = useState<TokenSession[]>(INITIAL_SESSIONS);
  const [selectedSession, setSelectedSession] = useState<TokenSession | null>(INITIAL_SESSIONS[1]); // Default to high risk Yodlee
  const [logs, setLogs] = useState<AuditLog[]>(INITIAL_LOGS);
  const [isRevoking, setIsRevoking] = useState<boolean>(false);
  const [revocationStep, setRevocationStep] = useState<number>(0);
  const [aiThreatMitigationActive, setAiThreatMitigationActive] = useState<boolean>(true);
  const [biometricVerified, setBiometricVerified] = useState<boolean>(false);
  const [globalLiquidityStatus, setGlobalLiquidityStatus] = useState<'optimal' | 'secured' | 'auditing'>('optimal');

  // Live clock for luxury aesthetic
  const [currentTime, setCurrentTime] = useState<string>("");
  useEffect(() => {
    const updateTime = () => {
      const now = new Date();
      setCurrentTime(now.toUTCString());
    };
    updateTime();
    const interval = setInterval(updateTime, 1000);
    return () => clearInterval(interval);
  }, []);

  // Helper to add logs dynamically
  const addLog = useCallback((event: string, severity: 'info' | 'warning' | 'critical' | 'success', node: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [
      { id: `log_${Date.now()}`, timestamp, event, severity, node },
      ...prev.slice(0, 15) // Keep last 15 logs
    ]);
  }, []);

  // Simulate AI Threat Mitigation background activity
  useEffect(() => {
    if (!aiThreatMitigationActive) return;

    const interval = setInterval(() => {
      const randomSession = sessions[Math.floor(Math.random() * sessions.length)];
      if (randomSession && randomSession.status === 'active') {
        const drift = Math.floor(Math.random() * 6) - 3; // -3 to +3
        const newRisk = Math.max(5, Math.min(95, randomSession.riskScore + drift));
        
        setSessions(prev => prev.map(s => s.id === randomSession.id ? { ...s, riskScore: newRisk } : s));
        
        if (newRisk > 75) {
          addLog(
            `AURA AI: Elevated risk detected on ${randomSession.aggregatorName} (${newRisk}%). Recommending immediate Modern Treasury ledger lock.`,
            'critical',
            'AURA-Threat-Engine'
          );
        }
      }
    }, 8000);

    return () => clearInterval(interval);
  }, [aiThreatMitigationActive, sessions, addLog]);

  // Execute the ultra-luxury multi-step revocation & ledger freeze
  const handleRevocationSequence = async () => {
    if (!selectedSession) return;
    setIsRevoking(true);
    setRevocationStep(1);
    setGlobalLiquidityStatus('auditing');

    // Step 1: AI Threat Mitigation Scan
    addLog(`AURA AI: Initiating deep-packet inspection on ${selectedSession.aggregatorName} token payload...`, 'info', 'AURA-Threat-Engine');
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Step 2: OAuth2 Revocation Endpoint Trigger
    setRevocationStep(2);
    addLog(`POST /oauth2/revoke HTTP/1.1 - Revoking token ${selectedSession.id} on Citibank Private API Gateway...`, 'info', 'Citi-OAuth-Gateway');
    await new Promise(resolve => setTimeout(resolve, 1800));
    
    // Step 3: Modern Treasury Ledger Freeze
    setRevocationStep(3);
    addLog(`Modern Treasury API: POST /v1/ledger_entries - Freezing Ledger Account ${selectedSession.associatedLedgerId}...`, 'warning', 'Modern-Treasury-Core');
    addLog(`Modern Treasury: Lock state set to 'frozen'. All pending wire transfers and ACH debits halted instantly.`, 'success', 'Modern-Treasury-Core');
    await new Promise(resolve => setTimeout(resolve, 2000));

    // Step 4: Global Liquidity Audit & Escrow Routing
    setRevocationStep(4);
    const formattedBalance = new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedSession.currency }).format(selectedSession.associatedLedgerBalance);
    addLog(`Citi Liquidity Router: Moving ${formattedBalance} to secure, non-custodial escrow pool.`, 'info', 'Citi-Liquidity-Router');
    addLog(`Compliance Audit: Real-time audit triggered across London, New York, and Zurich liquidity nodes.`, 'success', 'Citi-Compliance-Audit');
    await new Promise(resolve => setTimeout(resolve, 1800));

    // Step 5: Complete
    setRevocationStep(5);
    setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, status: 'revoked', riskScore: 0 } : s));
    setSelectedSession(prev => prev ? { ...prev, status: 'revoked', riskScore: 0 } : null);
    setGlobalLiquidityStatus('secured');
    setIsRevoking(false);
    setBiometricVerified(false);
    addLog(`SUCCESS: Token ${selectedSession.id} fully revoked. Modern Treasury ledger locked. Global liquidity secured.`, 'success', 'Citi-AURA-System');
  };

  const triggerBiometricVerification = () => {
    addLog("Biometric Verification: Requesting quantum-encrypted fingerprint/face scan...", "info", "Citi-Secure-Enclave");
    setTimeout(() => {
      setBiometricVerified(true);
      addLog("Biometric Verification: Success. Identity confirmed via Citibank Private Pass.", "success", "Citi-Secure-Enclave");
    }, 1200);
  };

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200 overflow-x-hidden">
      
      {/* TOP LUXURY STATUS BAR */}
      <div className="border-b border-amber-500/20 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-3 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-3">
          <div className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
          </div>
          <span className="text-xs tracking-[0.25em] text-amber-500 font-semibold uppercase">CITIBANK PRIVATE ELITE</span>
          <span className="text-neutral-600">|</span>
          <span className="text-xs tracking-wider text-neutral-400 font-mono">AURA AI v4.92</span>
        </div>

        <div className="flex items-center space-x-6">
          <div className="hidden md:flex items-center space-x-2 text-xs text-neutral-400 font-mono">
            <Globe className="w-3.5 h-3.5 text-amber-500/80 animate-spin-slow" />
            <span>GLOBAL LIQUIDITY STATUS:</span>
            <span className={`font-bold uppercase ${
              globalLiquidityStatus === 'optimal' ? 'text-emerald-400' : 
              globalLiquidityStatus === 'secured' ? 'text-amber-400' : 'text-cyan-400 animate-pulse'
            }`}>
              {globalLiquidityStatus}
            </span>
          </div>
          <div className="text-xs text-neutral-400 font-mono bg-neutral-900 px-3 py-1 rounded border border-neutral-800">
            {currentTime || "CONNECTING TO CITI TIME SERVERS..."}
          </div>
        </div>
      </div>

      {/* MAIN HERO HEADER */}
      <header className="relative overflow-hidden border-b border-neutral-900 bg-gradient-to-b from-neutral-900/50 to-neutral-950 px-6 py-12 md:px-12">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(212,175,55,0.08),transparent_45%)]" />
        <div className="max-w-7xl mx-auto relative z-10">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center space-x-2 bg-amber-500/10 border border-amber-500/30 px-3 py-1 rounded-full mb-4">
                <Cpu className="w-3.5 h-3.5 text-amber-500" />
                <span className="text-[10px] tracking-widest uppercase text-amber-400 font-semibold">Quantum-Resistant Threat Mitigation</span>
              </div>
              <h1 className="text-3xl md:text-5xl font-extralight tracking-tight text-neutral-100">
                Token Revocation <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-amber-600">Console</span>
              </h1>
              <p className="text-neutral-400 text-sm md:text-base mt-2 max-w-2xl font-light leading-relaxed">
                Instantaneous revocation of data aggregator access via <code className="text-amber-400 font-mono bg-neutral-900 px-1.5 py-0.5 rounded">/oauth2/revoke</code>. 
                Simultaneously triggers Modern Treasury ledger freezes and real-time compliance audits across global liquidity pools.
              </p>
            </div>

            {/* QUICK STATS */}
            <div className="grid grid-cols-2 gap-4 bg-neutral-900/60 p-4 rounded-xl border border-neutral-800/80 backdrop-blur-sm min-w-[280px]">
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Total Secured Assets</span>
                <span className="text-xl font-semibold text-amber-400 font-mono">$2,550,000,000</span>
              </div>
              <div>
                <span className="text-[10px] text-neutral-500 uppercase tracking-wider block">Active Aggregators</span>
                <span className="text-xl font-semibold text-neutral-200 font-mono">
                  {sessions.filter(s => s.status === 'active').length} / {sessions.length}
                </span>
              </div>
              <div className="col-span-2 border-t border-neutral-800/80 pt-2 mt-2 flex items-center justify-between">
                <span className="text-[10px] text-neutral-400 uppercase tracking-wider">AI Threat Mitigation</span>
                <button 
                  onClick={() => {
                    setAiThreatMitigationActive(!aiThreatMitigationActive);
                    addLog(`AURA AI: Threat mitigation engine ${!aiThreatMitigationActive ? 'ENABLED' : 'DISABLED'}.`, !aiThreatMitigationActive ? 'success' : 'warning', 'AURA-Core');
                  }}
                  className={`text-[10px] px-2 py-0.5 rounded font-mono uppercase tracking-widest transition-all ${
                    aiThreatMitigationActive ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/40' : 'bg-neutral-800 text-neutral-500 border border-neutral-700'
                  }`}
                >
                  {aiThreatMitigationActive ? 'ACTIVE' : 'PAUSED'}
                </button>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="max-w-7xl mx-auto px-6 py-10 md:px-12 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: ACTIVE SESSIONS & AGGREGATORS (5 COLS) */}
        <section className="lg:col-span-5 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Layers className="w-4 h-4 text-amber-500" />
              <h2 className="text-lg font-medium tracking-wide text-neutral-200">Connected Aggregators</h2>
            </div>
            <span className="text-xs text-neutral-500 font-mono">Real-time Risk Index</span>
          </div>

          <div className="space-y-4">
            {sessions.map((session) => {
              const isSelected = selectedSession?.id === session.id;
              const isHighRisk = session.riskScore > 50;
              
              return (
                <div
                  key={session.id}
                  onClick={() => !isRevoking && setSelectedSession(session)}
                  className={`group relative p-5 rounded-xl border transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'bg-gradient-to-br from-neutral-900 to-neutral-950 border-amber-500/60 shadow-[0_0_20px_rgba(212,175,55,0.1)]' 
                      : 'bg-neutral-900/40 border-neutral-800/80 hover:border-neutral-700 hover:bg-neutral-900/60'
                  } ${isRevoking ? 'opacity-50 cursor-not-allowed' : ''}`}
                >
                  {/* Risk Indicator Bar */}
                  <div className="absolute top-0 left-0 right-0 h-[2px] rounded-t-xl overflow-hidden bg-neutral-800">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        session.status === 'revoked' ? 'bg-neutral-600' :
                        isHighRisk ? 'bg-gradient-to-r from-red-500 to-amber-500' : 'bg-gradient-to-r from-emerald-500 to-amber-400'
                      }`}
                      style={{ width: `${session.status === 'revoked' ? 0 : session.riskScore}%` }}
                    />
                  </div>

                  <div className="flex items-start justify-between mt-1">
                    <div>
                      <h3 className="font-medium text-neutral-200 group-hover:text-amber-400 transition-colors flex items-center gap-2">
                        {session.aggregatorName}
                        {session.status === 'revoked' && (
                          <span className="text-[9px] bg-neutral-800 text-neutral-400 px-2 py-0.5 rounded uppercase tracking-widest font-mono">
                            REVOKED & LOCKED
                          </span>
                        )}
                      </h3>
                      <p className="text-xs text-neutral-500 font-mono mt-1">{session.id}</p>
                    </div>

                    <div className="text-right">
                      <span className={`text-xs font-mono font-bold px-2 py-1 rounded ${
                        session.status === 'revoked' ? 'bg-neutral-800 text-neutral-500' :
                        isHighRisk ? 'bg-red-500/10 text-red-400 border border-red-500/20' : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      }`}>
                        {session.status === 'revoked' ? 'SECURE' : `RISK: ${session.riskScore}%`}
                      </span>
                    </div>
                  </div>

                  {/* Ledger Details */}
                  <div className="mt-4 pt-4 border-t border-neutral-800/60 grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Modern Treasury Ledger</span>
                      <span className="font-mono text-neutral-300 block truncate">{session.associatedLedgerId}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-neutral-500 block text-[10px] uppercase tracking-wider">Ledger Balance</span>
                      <span className="font-mono text-amber-500 font-semibold block">
                        {new Intl.NumberFormat('en-US', { style: 'currency', currency: session.currency, maximumFractionDigits: 0 }).format(session.associatedLedgerBalance)}
                      </span>
                    </div>
                  </div>

                  {/* Scopes & Connection Info */}
                  <div className="mt-3 flex flex-wrap gap-1">
                    {session.scopes.map(scope => (
                      <span key={scope} className="text-[9px] bg-neutral-950 text-neutral-400 px-1.5 py-0.5 rounded font-mono border border-neutral-800/60">
                        {scope}
                      </span>
                    ))}
                  </div>

                  <div className="mt-3 flex items-center justify-between text-[10px] text-neutral-500 font-mono">
                    <span>Connected: {new Date(session.connectedAt).toLocaleDateString()}</span>
                    <span>Last Active: {new Date(session.lastUsedAt).toLocaleTimeString()}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* AI THREAT MITIGATION INSIGHT CARD */}
          <div className="bg-gradient-to-br from-amber-500/5 to-amber-500/0 border border-amber-500/10 rounded-xl p-5 space-y-3">
            <div className="flex items-center space-x-2">
              <Cpu className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-medium text-amber-400 uppercase tracking-wider">AURA AI Threat Mitigation Engine</h3>
            </div>
            <p className="text-xs text-neutral-400 leading-relaxed font-light">
              AURA AI continuously monitors API payloads, request frequencies, and IP routing anomalies. 
              If a data aggregator exhibits suspicious behavior, the system automatically prepares a 
              <strong> Modern Treasury Ledger Lock</strong> and queues the token for instant revocation.
            </p>
            <div className="flex items-center justify-between text-xs pt-2 border-t border-neutral-900">
              <span className="text-neutral-500">Active Threat Vectors Scanned:</span>
              <span className="font-mono text-amber-500 font-semibold">1,402 / sec</span>
            </div>
          </div>
        </section>

        {/* RIGHT COLUMN: REVOCATION CONSOLE & LEDGER FREEZE (7 COLS) */}
        <section className="lg:col-span-7 space-y-6">
          
          {selectedSession ? (
            <div className="bg-neutral-900/30 border border-neutral-800 rounded-2xl p-6 md:p-8 space-y-8 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
              
              {/* Header of Console */}
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-neutral-800">
                <div>
                  <span className="text-[10px] text-amber-500 font-mono uppercase tracking-widest block">Target Aggregator Session</span>
                  <h2 className="text-2xl font-light text-neutral-100 mt-1">
                    {selectedSession.aggregatorName}
                  </h2>
                  <p className="text-xs text-neutral-500 font-mono mt-0.5">{selectedSession.id}</p>
                </div>

                <div className="flex items-center space-x-3 bg-neutral-950 p-2 rounded-lg border border-neutral-800">
                  <div className="p-2 bg-amber-500/10 rounded-md">
                    <Sliders className="w-4 h-4 text-amber-500" />
                  </div>
                  <div>
                    <span className="text-[9px] text-neutral-500 uppercase block">Liquidity Pool</span>
                    <span className="text-xs font-mono text-neutral-300 block max-w-[180px] truncate">
                      {selectedSession.liquidityPool}
                    </span>
                  </div>
                </div>
              </div>

              {/* Modern Treasury Ledger Account Status Card */}
              <div className="bg-neutral-950 border border-neutral-800/80 rounded-xl p-5 space-y-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Layers className="w-4 h-4 text-amber-500" />
                    <span className="text-xs font-semibold uppercase tracking-wider text-neutral-300">Modern Treasury Ledger Integration</span>
                  </div>
                  <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                    Real-Time Sync
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-2">
                  <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/50">
                    <span className="text-[10px] text-neutral-500 uppercase block">Ledger Account ID</span>
                    <span className="text-xs font-mono text-neutral-200 block mt-1 truncate">{selectedSession.associatedLedgerId}</span>
                  </div>
                  <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/50">
                    <span className="text-[10px] text-neutral-500 uppercase block">Ledger Balance</span>
                    <span className="text-xs font-mono text-amber-500 font-bold block mt-1">
                      {new Intl.NumberFormat('en-US', { style: 'currency', currency: selectedSession.currency }).format(selectedSession.associatedLedgerBalance)}
                    </span>
                  </div>
                  <div className="bg-neutral-900/50 p-3 rounded-lg border border-neutral-800/50">
                    <span className="text-[10px] text-neutral-500 uppercase block">Ledger Lock Status</span>
                    <span className={`text-xs font-mono font-bold block mt-1 ${
                      selectedSession.status === 'revoked' ? 'text-red-400' : 'text-emerald-400'
                    }`}>
                      {selectedSession.status === 'revoked' ? 'LOCKED (FROZEN)' : 'UNLOCKED (ACTIVE)'}
                    </span>
                  </div>
                </div>

                <p className="text-[11px] text-neutral-500 leading-relaxed font-light">
                  Upon triggering revocation, Modern Treasury will instantly execute a ledger lock API call, 
                  preventing any debit or credit entries to this account. Simultaneously, funds are routed to a 
                  Citibank secure escrow ledger to mitigate potential threat vectors.
                </p>
              </div>

              {/* Revocation Action Panel */}
              {selectedSession.status === 'revoked' ? (
                <div className="bg-emerald-950/20 border border-emerald-500/30 rounded-xl p-6 text-center space-y-3">
                  <div className="inline-flex p-3 bg-emerald-500/10 rounded-full text-emerald-400">
                    <ShieldCheck className="w-8 h-8" />
                  </div>
                  <h3 className="text-lg font-medium text-emerald-400">Access Revoked & Ledger Frozen</h3>
                  <p className="text-xs text-neutral-400 max-w-md mx-auto leading-relaxed">
                    The OAuth2 token has been permanently invalidated. Modern Treasury ledger account 
                    <code className="text-amber-400 font-mono bg-neutral-950 px-1 py-0.5 rounded mx-1">{selectedSession.associatedLedgerId}</code> 
                    is locked. Global compliance audit reports have been dispatched to Citibank Private Wealth compliance nodes.
                  </p>
                  <button
                    onClick={() => {
                      setSessions(prev => prev.map(s => s.id === selectedSession.id ? { ...s, status: 'active', riskScore: 15 } : s));
                      setSelectedSession(prev => prev ? { ...prev, status: 'active', riskScore: 15 } : null);
                      addLog(`AURA AI: Restored session ${selectedSession.id} for testing purposes.`, 'info', 'Citi-AURA-System');
                    }}
                    className="mt-4 text-xs text-neutral-400 hover:text-amber-400 underline underline-offset-4 transition-colors"
                  >
                    Reset Session for Demonstration
                  </button>
                </div>
              ) : (
                <div className="space-y-6">
                  {/* Biometric Verification Step */}
                  <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <div className="flex items-center space-x-3">
                      <div className={`p-2.5 rounded-lg ${biometricVerified ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-500'}`}>
                        <Fingerprint className="w-6 h-6" />
                      </div>
                      <div>
                        <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-200">Citibank Private Pass Biometrics</h4>
                        <p className="text-[11px] text-neutral-500 mt-0.5">Multi-signature AI approval requires biometric confirmation.</p>
                      </div>
                    </div>

                    <button
                      onClick={triggerBiometricVerification}
                      disabled={biometricVerified || isRevoking}
                      className={`w-full md:w-auto px-4 py-2 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                        biometricVerified 
                          ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 cursor-default' 
                          : 'bg-amber-500 text-neutral-950 hover:bg-amber-400 font-bold shadow-[0_0_15px_rgba(212,175,55,0.2)]'
                      }`}
                    >
                      {biometricVerified ? 'VERIFIED' : 'VERIFY IDENTITY'}
                    </button>
                  </div>

                  {/* Revocation Progress Steps (Visible during execution) */}
                  {isRevoking && (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-xl p-5 space-y-4">
                      <h4 className="text-xs font-semibold uppercase tracking-wider text-neutral-300 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 text-amber-500 animate-spin" />
                        Executing Secure Revocation Sequence
                      </h4>
                      
                      <div className="space-y-3">
                        {[
                          { step: 1, label: "AURA AI Threat Vector Analysis" },
                          { step: 2, label: "OAuth2 Token Revocation (/oauth2/revoke)" },
                          { step: 3, label: "Modern Treasury Ledger Lock & Freeze" },
                          { step: 4, label: "Global Liquidity Escrow Routing & Audit" }
                        ].map((s) => (
                          <div key={s.step} className="flex items-center justify-between text-xs">
                            <span className={`${revocationStep >= s.step ? 'text-neutral-200' : 'text-neutral-600'}`}>
                              {s.step}. {s.label}
                            </span>
                            <span className="font-mono">
                              {revocationStep > s.step && <span className="text-emerald-400">COMPLETE</span>}
                              {revocationStep === s.step && <span className="text-amber-400 animate-pulse">PROCESSING...</span>}
                              {revocationStep < s.step && <span className="text-neutral-700">PENDING</span>}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Trigger Button */}
                  <div className="pt-2">
                    <button
                      onClick={handleRevocationSequence}
                      disabled={!biometricVerified || isRevoking}
                      className={`w-full py-4 rounded-xl font-mono text-sm uppercase tracking-widest transition-all duration-300 flex items-center justify-center space-x-2 ${
                        biometricVerified && !isRevoking
                          ? 'bg-gradient-to-r from-red-600 via-amber-600 to-red-700 text-white font-bold hover:shadow-[0_0_30px_rgba(220,38,38,0.3)] border border-red-500/30'
                          : 'bg-neutral-900 text-neutral-600 border border-neutral-800 cursor-not-allowed'
                      }`}
                    >
                      <Lock className="w-4 h-4" />
                      <span>INSTANTLY REVOKE ACCESS & FREEZE LEDGER</span>
                    </button>
                    <p className="text-center text-[10px] text-neutral-500 mt-3 font-light">
                      Warning: This action is irreversible. It will instantly terminate all active API sessions, freeze the associated Modern Treasury ledger, and trigger a global compliance audit.
                    </p>
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="bg-neutral-900/20 border border-neutral-800/60 rounded-2xl p-12 text-center space-y-4">
              <div className="inline-flex p-4 bg-neutral-900 rounded-full text-neutral-600">
                <ShieldAlert className="w-10 h-10" />
              </div>
              <h3 className="text-lg font-medium text-neutral-300">No Aggregator Selected</h3>
              <p className="text-xs text-neutral-500 max-w-sm mx-auto">
                Select an active data aggregator connection from the left panel to manage its OAuth2 token status and Modern Treasury ledger locks.
              </p>
            </div>
          )}

          {/* REAL-TIME AUDIT LOGS & CONSOLE OUTPUT */}
          <div className="bg-neutral-950 border border-neutral-900 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-neutral-900 pb-3">
              <div className="flex items-center space-x-2">
                <Activity className="w-4 h-4 text-amber-500" />
                <h3 className="text-xs font-semibold uppercase tracking-wider text-neutral-300">AURA AI & Modern Treasury Live Audit Feed</h3>
              </div>
              <span className="text-[10px] font-mono text-neutral-500">Node: Citi-Global-Core</span>
            </div>

            <div className="space-y-2 max-h-[180px] overflow-y-auto font-mono text-[11px] scrollbar-thin scrollbar-thumb-neutral-800">
              {logs.map((log) => (
                <div key={log.id} className="flex items-start space-x-2 hover:bg-neutral-900/40 p-1 rounded transition-colors">
                  <span className="text-neutral-600 shrink-0">[{log.timestamp}]</span>
                  <span className={`shrink-0 px-1.5 py-0.2 rounded text-[9px] uppercase tracking-wider ${
                    log.severity === 'critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                    log.severity === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    log.severity === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-neutral-800 text-neutral-400'
                  }`}>
                    {log.severity}
                  </span>
                  <span className="text-neutral-500 shrink-0">[{log.node}]</span>
                  <span className="text-neutral-300 leading-relaxed">{log.event}</span>
                </div>
              ))}
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 px-6 mt-12 text-center text-xs text-neutral-600 font-mono">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
          <p>© 2024 Citibank, N.A. Member FDIC. Co-branded with Modern Treasury. Powered by AURA AI.</p>
          <div className="flex space-x-4">
            <a href="#terms" className="hover:text-amber-500 transition-colors">Private Banking Terms</a>
            <span>•</span>
            <a href="#security" className="hover:text-amber-500 transition-colors">Quantum Security Protocol</a>
          </div>
        </div>
      </footer>

    </div>
  );
}