import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  Shield, 
  Cpu, 
  Coins, 
  RefreshCw, 
  Trash2, 
  Zap, 
  Layers, 
  Lock, 
  Unlock, 
  TrendingUp, 
  Globe, 
  Fingerprint, 
  Sparkles, 
  AlertTriangle, 
  CheckCircle2, 
  ArrowUpRight, 
  Sliders, 
  Database, 
  Activity,
  DollarSign,
  Key
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Token {
  id: string;
  name: string;
  collateral: number;
  treasuryAccount: string;
  aiRiskScore: number;
  entropy: number;
  status: 'ACTIVE' | 'REFRESHING' | 'REVOKED';
  createdAt: string;
  txHash: string;
}

interface SecurityLog {
  id: string;
  timestamp: string;
  event: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  source: string;
}

export default function ImperialTokenSuite() {
  // --- STATE MANAGEMENT ---
  const [activeTab, setActiveTab] = useState<'provision' | 'refresh' | 'revoke' | 'shield'>('provision');
  const [tvl, setTvl] = useState<number>(148294000000); // $148.29B starting TVL
  const [quantumEntropy, setQuantumEntropy] = useState<number>(99.999994);
  const [activeTokens, setActiveTokens] = useState<Token[]>([
    {
      id: 'TOK-9921-X',
      name: 'Sovereign AI Liquidity Bond',
      collateral: 2500000000,
      treasuryAccount: 'Citi-NY-Vault-01',
      aiRiskScore: 1.2,
      entropy: 99.999998,
      status: 'ACTIVE',
      createdAt: '2026-03-30 08:12:04 UTC',
      txHash: '0x8f3c...9a2e_MT_CITI'
    },
    {
      id: 'TOK-4402-Y',
      name: 'Imperial Treasury Yield Token',
      collateral: 5000000000,
      treasuryAccount: 'Citi-London-Vault-09',
      aiRiskScore: 0.8,
      entropy: 99.999991,
      status: 'ACTIVE',
      createdAt: '2026-03-30 10:45:19 UTC',
      txHash: '0x4a1b...7f8c_MT_CITI'
    },
    {
      id: 'TOK-1108-Z',
      name: 'Quantum Arbitrage Reserve',
      collateral: 1200000000,
      treasuryAccount: 'Citi-Tokyo-Vault-04',
      aiRiskScore: 2.4,
      entropy: 99.999985,
      status: 'ACTIVE',
      createdAt: '2026-03-30 11:02:55 UTC',
      txHash: '0x9d2e...3b1a_MT_CITI'
    }
  ]);

  const [securityLogs, setSecurityLogs] = useState<SecurityLog[]>([
    { id: '1', timestamp: '14:22:01', event: 'Modern Treasury API Signature Verified', severity: 'LOW', source: 'MT-GATEWAY' },
    { id: '2', timestamp: '14:21:45', event: 'AI Neural Threat Scan: 0 Anomalies Detected', severity: 'LOW', source: 'CITI-AI-CORE' },
    { id: '3', timestamp: '14:19:12', event: 'Quantum Entropy Calibration Completed', severity: 'MEDIUM', source: 'HSM-QUANTUM' },
    { id: '4', timestamp: '14:15:30', event: 'Multi-Sig Hardware Security Module Synced', severity: 'LOW', source: 'HSM-CLUSTER' }
  ]);

  // Provisioning Form State
  const [newTokenName, setNewTokenName] = useState<string>('Bespoke Sovereign Asset');
  const [collateralAmount, setCollateralAmount] = useState<number>(1000000000); // $1B default
  const [selectedVault, setSelectedVault] = useState<string>('Citi-NY-Vault-01');
  const [aiRiskTolerance, setAiRiskTolerance] = useState<'CONSERVATIVE' | 'BALANCED' | 'ALPHA'>('BALANCED');
  const [isMinting, setIsMinting] = useState<boolean>(false);
  const [mintProgress, setMintProgress] = useState<number>(0);
  const [mintStep, setMintStep] = useState<string>('');

  // Revocation State
  const [securityOverrideCode, setSecurityOverrideCode] = useState<string>('');
  const [bypassSafeguards, setBypassSafeguards] = useState<boolean>(false);
  const [ledgerReversal, setLedgerReversal] = useState<boolean>(false);

  // --- SIMULATED REAL-TIME METRICS ---
  useEffect(() => {
    const interval = setInterval(() => {
      // TVL fluctuates upwards slightly to simulate massive high-frequency institutional flows
      setTvl(prev => prev + Math.floor(Math.random() * 150000) - 30000);
      // Quantum entropy fluctuates around 99.99999%
      setQuantumEntropy(prev => {
        const change = (Math.random() - 0.5) * 0.000005;
        const next = prev + change;
        return next > 100 ? 100 : next < 99.9999 ? 99.9999 : next;
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Simulated Security Log Feed
  useEffect(() => {
    const interval = setInterval(() => {
      const events = [
        { event: 'Modern Treasury Ledger Sync Successful', severity: 'LOW', source: 'MT-LEDGER' },
        { event: 'AI Risk Engine Re-evaluated Sovereign Collateral', severity: 'LOW', source: 'CITI-AI-CORE' },
        { event: 'Prevented unauthorized quantum decryption attempt', severity: 'HIGH', source: 'QUANTUM-SHIELD' },
        { event: 'Bespoke liquidity routing optimized via Citibank AI', severity: 'LOW', source: 'CITI-ROUTER' },
        { event: 'High-value transaction pre-authorized by Modern Treasury', severity: 'MEDIUM', source: 'MT-GATEWAY' }
      ];
      const randomEvent = events[Math.floor(Math.random() * events.length)];
      const now = new Date();
      const timestamp = now.toTimeString().split(' ')[0];
      
      setSecurityLogs(prev => [
        {
          id: Math.random().toString(),
          timestamp,
          event: randomEvent.event,
          severity: randomEvent.severity as any,
          source: randomEvent.source
        },
        ...prev.slice(0, 15)
      ]);
    }, 8000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleMintToken = useCallback(async (e: React.FormEvent) => {
    e.preventDefault();
    if (isMinting) return;

    setIsMinting(true);
    setMintProgress(5);
    setMintStep('Initializing Citibank AI Risk Assessment...');

    const steps = [
      { progress: 25, step: 'Analyzing Collateralization via Modern Treasury Ledger...' },
      { progress: 50, step: 'Securing Multi-Sig Hardware Security Module (HSM) Keys...' },
      { progress: 75, step: 'Generating Quantum-Resistant Cryptographic Signatures...' },
      { progress: 90, step: 'Finalizing Citibank Sovereign Settlement Routing...' },
      { progress: 100, step: 'Token Successfully Provisioned!' }
    ];

    for (const s of steps) {
      await new Promise(resolve => setTimeout(resolve, 1200));
      setMintProgress(s.progress);
      setMintStep(s.step);
    }

    const newToken: Token = {
      id: `TOK-${Math.floor(1000 + Math.random() * 9000)}-${String.fromCharCode(65 + Math.floor(Math.random() * 26))}`,
      name: newTokenName,
      collateral: collateralAmount,
      treasuryAccount: selectedVault,
      aiRiskScore: aiRiskTolerance === 'CONSERVATIVE' ? 0.4 : aiRiskTolerance === 'BALANCED' ? 1.1 : 2.9,
      entropy: 99.999999,
      status: 'ACTIVE',
      createdAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}_MT_CITI`
    };

    setActiveTokens(prev => [newToken, ...prev]);
    setTvl(prev => prev + collateralAmount);
    
    // Add success log
    setSecurityLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toTimeString().split(' ')[0],
        event: `PROVISIONED: ${newToken.name} ($${(newToken.collateral / 1e9).toFixed(2)}B)`,
        severity: 'MEDIUM',
        source: 'IMPERIAL-ORCHESTRATOR'
      },
      ...prev
    ]);

    setTimeout(() => {
      setIsMinting(false);
      setMintProgress(0);
      setMintStep('');
      // Reset form
      setNewTokenName('Bespoke Sovereign Asset');
      setCollateralAmount(1000000000);
    }, 1500);

  }, [isMinting, newTokenName, collateralAmount, selectedVault, aiRiskTolerance]);

  const handleRefresh = useCallback(async (tokenId: string) => {
    setActiveTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'REFRESHING' } : t));
    
    setSecurityLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toTimeString().split(' ')[0],
        event: `Initiated Quantum Re-Key for ${tokenId}`,
        severity: 'MEDIUM',
        source: 'QUANTUM-SHIELD'
      },
      ...prev
    ]);

    await new Promise(resolve => setTimeout(resolve, 2000));

    setActiveTokens(prev => prev.map(t => t.id === tokenId ? { 
      ...t, 
      status: 'ACTIVE', 
      entropy: 99.999999,
      txHash: `0x${Math.random().toString(16).substr(2, 8)}...${Math.random().toString(16).substr(2, 4)}_MT_REFRESH`
    } : t));

    setSecurityLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toTimeString().split(' ')[0],
        event: `COMPLETED: Quantum Re-Key & Modern Treasury Sync for ${tokenId}`,
        severity: 'LOW',
        source: 'MT-LEDGER'
      },
      ...prev
    ]);
  }, []);

  const handleRevoke = useCallback(async (tokenId: string) => {
    if (!bypassSafeguards || !ledgerReversal || securityOverrideCode !== 'CITI-AI-999') {
      alert('CRITICAL ERROR: Security protocols not met. Ensure override code is correct and all safeguards are acknowledged.');
      return;
    }

    const tokenToRevoke = activeTokens.find(t => t.id === tokenId);
    if (!tokenToRevoke) return;

    setActiveTokens(prev => prev.map(t => t.id === tokenId ? { ...t, status: 'REVOKED' } : t));
    setTvl(prev => prev - tokenToRevoke.collateral);

    setSecurityLogs(prev => [
      {
        id: Math.random().toString(),
        timestamp: new Date().toTimeString().split(' ')[0],
        event: `REVOKED & BURNED: ${tokenToRevoke.name} ($${(tokenToRevoke.collateral / 1e9).toFixed(2)}B collateral returned)`,
        severity: 'CRITICAL',
        source: 'IMPERIAL-ORCHESTRATOR'
      },
      ...prev
    ]);

    // Reset revocation inputs
    setSecurityOverrideCode('');
    setBypassSafeguards(false);
    setLedgerReversal(false);
  }, [activeTokens, bypassSafeguards, ledgerReversal, securityOverrideCode]);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* TOP LUXURY GLOW EFFECT */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full max-w-7xl h-[350px] bg-gradient-to-b from-amber-500/10 via-cyan-500/5 to-transparent blur-3xl pointer-events-none" />

      {/* HEADER */}
      <header className="relative border-b border-amber-500/20 bg-neutral-950/80 backdrop-blur-md z-10">
        <div className="max-w-7xl mx-auto px-6 py-5 flex flex-col md:flex-row justify-between items-center gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-amber-500/20 rounded-full blur-md animate-pulse" />
              <div className="relative w-12 h-12 rounded-full bg-gradient-to-tr from-amber-600 via-yellow-500 to-amber-400 flex items-center justify-center border border-amber-300/40 shadow-lg shadow-amber-500/20">
                <Shield className="w-6 h-6 text-neutral-950" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold tracking-[0.25em] text-amber-400 uppercase">Citibank Private Ledger</span>
                <span className="px-2 py-0.5 text-[9px] font-extrabold tracking-wider bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 rounded-full">AI-POWERED</span>
              </div>
              <h1 className="text-2xl font-extrabold tracking-tight text-white">
                IMPERIAL <span className="bg-gradient-to-r from-amber-400 via-yellow-200 to-white bg-clip-text text-transparent">TOKEN SUITE</span>
              </h1>
            </div>
          </div>

          {/* LIVE STATUS BAR */}
          <div className="flex flex-wrap items-center gap-6 text-xs">
            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <div>
                <p className="text-neutral-400 text-[10px] uppercase tracking-wider">Modern Treasury Sync</p>
                <p className="font-mono font-semibold text-emerald-400">CONNECTED (0.4ms)</p>
              </div>
            </div>

            <div className="bg-neutral-900/80 border border-neutral-800 rounded-xl px-4 py-2 flex items-center gap-3">
              <Cpu className="w-4 h-4 text-cyan-400 animate-pulse" />
              <div>
                <p className="text-neutral-400 text-[10px] uppercase tracking-wider">AI Core Status</p>
                <p className="font-mono font-semibold text-cyan-400">OPTIMIZED (99.8% Efficiency)</p>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT CONTAINER */}
      <main className="relative max-w-7xl mx-auto px-6 py-8 z-10">
        
        {/* METRICS DASHBOARD */}
        <section className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
          {/* TVL */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-amber-500/20 rounded-2xl p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold tracking-wider text-amber-400 uppercase">Total Value Locked</span>
              <DollarSign className="w-4 h-4 text-amber-400" />
            </div>
            <p className="text-3xl font-mono font-extrabold text-white tracking-tight">
              ${(tvl / 1e9).toLocaleString(undefined, { minimumFractionDigits: 6, maximumFractionDigits: 6 })}B
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-emerald-400 text-xs font-semibold">
              <TrendingUp className="w-3.5 h-3.5" />
              <span>+14.2% Institutional Inflow (24h)</span>
            </div>
          </div>

          {/* ACTIVE TOKENS */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Active Sovereign Tokens</span>
              <Coins className="w-4 h-4 text-cyan-400" />
            </div>
            <p className="text-3xl font-mono font-extrabold text-white tracking-tight">
              {activeTokens.filter(t => t.status !== 'REVOKED').length} <span className="text-sm text-neutral-500">/ {activeTokens.length} Total</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-cyan-400 text-xs font-semibold">
              <Layers className="w-3.5 h-3.5" />
              <span>Modern Treasury Ledger Synced</span>
            </div>
          </div>

          {/* QUANTUM ENTROPY */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">Quantum Entropy Rate</span>
              <Fingerprint className="w-4 h-4 text-purple-400" />
            </div>
            <p className="text-3xl font-mono font-extrabold text-white tracking-tight">
              {quantumEntropy.toFixed(6)}%
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-purple-400 text-xs font-semibold">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Military-Grade HSM Shield Active</span>
            </div>
          </div>

          {/* AI RISK INDEX */}
          <div className="relative overflow-hidden bg-gradient-to-b from-neutral-900 to-neutral-950 border border-neutral-800 rounded-2xl p-6 shadow-2xl">
            <div className="flex justify-between items-start mb-2">
              <span className="text-xs font-bold tracking-wider text-neutral-400 uppercase">AI Risk Index</span>
              <Activity className="w-4 h-4 text-emerald-400" />
            </div>
            <p className="text-3xl font-mono font-extrabold text-emerald-400 tracking-tight">
              SECURE <span className="text-sm text-neutral-500">(0.85 Avg)</span>
            </p>
            <div className="flex items-center gap-1.5 mt-2 text-neutral-400 text-xs">
              <Globe className="w-3.5 h-3.5 text-neutral-500" />
              <span>Real-time global threat monitoring</span>
            </div>
          </div>
        </section>

        {/* TABBED INTERFACE NAVIGATION */}
        <div className="flex flex-wrap gap-2 p-1.5 bg-neutral-900/90 border border-neutral-800 rounded-2xl mb-8">
          <button
            onClick={() => setActiveTab('provision')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'provision'
                ? 'bg-gradient-to-r from-amber-600 to-yellow-500 text-neutral-950 shadow-lg shadow-amber-500/10 font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Coins className="w-4 h-4" />
            Token Provisioning
          </button>

          <button
            onClick={() => setActiveTab('refresh')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'refresh'
                ? 'bg-gradient-to-r from-cyan-600 to-blue-500 text-white shadow-lg shadow-cyan-500/10 font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <RefreshCw className="w-4 h-4" />
            Token Refresh
          </button>

          <button
            onClick={() => setActiveTab('revoke')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'revoke'
                ? 'bg-gradient-to-r from-rose-600 to-red-500 text-white shadow-lg shadow-rose-500/10 font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Trash2 className="w-4 h-4" />
            Token Revocation
          </button>

          <button
            onClick={() => setActiveTab('shield')}
            className={`flex-1 min-w-[150px] flex items-center justify-center gap-2.5 py-3.5 px-4 rounded-xl text-xs font-bold tracking-wider uppercase transition-all duration-300 ${
              activeTab === 'shield'
                ? 'bg-gradient-to-r from-emerald-600 to-teal-500 text-white shadow-lg shadow-emerald-500/10 font-extrabold'
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800/50'
            }`}
          >
            <Shield className="w-4 h-4" />
            Quantum Shield
          </button>
        </div>

        {/* TAB CONTENT PANELS */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* LEFT/CENTER: MAIN INTERACTIVE CONSOLE */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* TAB 1: PROVISIONING CONSOLE */}
            {activeTab === 'provision' && (
              <div className="bg-neutral-900/50 border border-amber-500/20 rounded-3xl p-8 backdrop-blur-md shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/30">
                    <Coins className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Token Provisioning Console</h2>
                    <p className="text-xs text-neutral-400">Mint sovereign-grade AI-backed treasury tokens instantly routed through Modern Treasury.</p>
                  </div>
                </div>

                <form onSubmit={handleMintToken} className="space-y-6">
                  {/* Token Name */}
                  <div>
                    <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Token Asset Name</label>
                    <input 
                      type="text" 
                      value={newTokenName}
                      onChange={(e) => setNewTokenName(e.target.value)}
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-semibold"
                      placeholder="e.g. Sovereign AI Liquidity Bond"
                      required
                    />
                  </div>

                  {/* Collateral Slider */}
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <label className="text-xs font-bold uppercase tracking-wider text-neutral-400">Citibank Collateralization</label>
                      <span className="text-sm font-mono font-bold text-amber-400">${(collateralAmount / 1e9).toFixed(2)} Billion USD</span>
                    </div>
                    <input 
                      type="range" 
                      min="100000000" 
                      max="10000000000" 
                      step="100000000"
                      value={collateralAmount}
                      onChange={(e) => setCollateralAmount(Number(e.target.value))}
                      className="w-full h-1.5 bg-neutral-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-neutral-500 font-mono mt-1">
                      <span>$100M (Min)</span>
                      <span>$5.0B</span>
                      <span>$10.0B (Max)</span>
                    </div>
                  </div>

                  {/* Vault Selection & AI Risk Tolerance */}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">Modern Treasury Vault</label>
                      <select 
                        value={selectedVault}
                        onChange={(e) => setSelectedVault(e.target.value)}
                        className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-all font-semibold"
                      >
                        <option value="Citi-NY-Vault-01">Citi-NY-Vault-01 (USD)</option>
                        <option value="Citi-London-Vault-09">Citi-London-Vault-09 (GBP)</option>
                        <option value="Citi-Tokyo-Vault-04">Citi-Tokyo-Vault-04 (JPY)</option>
                        <option value="Citi-Zurich-Vault-12">Citi-Zurich-Vault-12 (CHF)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-bold uppercase tracking-wider text-neutral-400 mb-2">AI Risk Tolerance Engine</label>
                      <div className="grid grid-cols-3 gap-2">
                        {(['CONSERVATIVE', 'BALANCED', 'ALPHA'] as const).map((mode) => (
                          <button
                            key={mode}
                            type="button"
                            onClick={() => setAiRiskTolerance(mode)}
                            className={`py-2.5 px-2 rounded-xl text-[10px] font-bold tracking-wider transition-all border ${
                              aiRiskTolerance === mode 
                                ? 'bg-amber-500/10 border-amber-500 text-amber-400' 
                                : 'bg-neutral-950 border-neutral-800 text-neutral-500 hover:text-neutral-300'
                            }`}
                          >
                            {mode}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Minting Progress Bar */}
                  {isMinting && (
                    <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-3">
                      <div className="flex justify-between text-xs font-mono">
                        <span className="text-amber-400 animate-pulse">{mintStep}</span>
                        <span className="text-white font-bold">{mintProgress}%</span>
                      </div>
                      <div className="w-full bg-neutral-900 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 h-full transition-all duration-500"
                          style={{ width: `${mintProgress}%` }}
                        />
                      </div>
                    </div>
                  )}

                  {/* Submit Button */}
                  <button
                    type="submit"
                    disabled={isMinting}
                    className="w-full relative overflow-hidden group bg-gradient-to-r from-amber-600 via-yellow-500 to-amber-400 text-neutral-950 font-extrabold text-sm uppercase tracking-widest py-4 px-6 rounded-xl transition-all duration-300 hover:shadow-lg hover:shadow-amber-500/20 disabled:opacity-50"
                  >
                    <span className="relative z-10 flex items-center justify-center gap-2">
                      <Sparkles className="w-4 h-4" />
                      Initiate Imperial Minting
                    </span>
                    <div className="absolute inset-0 bg-white/20 translate-y-full group-hover:translate-y-0 transition-transform duration-300" />
                  </button>
                </form>
              </div>
            )}

            {/* TAB 2: REFRESH CONSOLE */}
            {activeTab === 'refresh' && (
              <div className="bg-neutral-900/50 border border-cyan-500/20 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <div className="flex items-center justify-between mb-6">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-cyan-500/10 rounded-lg border border-cyan-500/30">
                      <RefreshCw className="w-6 h-6 text-cyan-400" />
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-white">Token Refresh Console</h2>
                      <p className="text-xs text-neutral-400">Re-key quantum-encrypted assets and synchronize with Modern Treasury ledgers.</p>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  {activeTokens.filter(t => t.status !== 'REVOKED').map((token) => (
                    <div 
                      key={token.id} 
                      className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-cyan-500/30 transition-all"
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-cyan-400">{token.id}</span>
                          <h3 className="text-sm font-bold text-white">{token.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400 font-mono">
                          <span>Collateral: <strong className="text-white">${(token.collateral / 1e9).toFixed(2)}B</strong></span>
                          <span>Vault: <strong className="text-white">{token.treasuryAccount}</strong></span>
                          <span>Entropy: <strong className="text-purple-400">{token.entropy.toFixed(6)}%</strong></span>
                        </div>
                        <p className="text-[10px] text-neutral-500 font-mono">TX Hash: {token.txHash}</p>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          token.status === 'REFRESHING' 
                            ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/30 animate-pulse' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {token.status}
                        </span>

                        <button
                          onClick={() => handleRefresh(token.id)}
                          disabled={token.status === 'REFRESHING'}
                          className="flex items-center gap-1.5 bg-neutral-900 hover:bg-cyan-500/10 border border-neutral-800 hover:border-cyan-500/30 text-neutral-300 hover:text-cyan-400 px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                        >
                          <RefreshCw className={`w-3.5 h-3.5 ${token.status === 'REFRESHING' ? 'animate-spin' : ''}`} />
                          Quantum Re-Key
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 3: REVOCATION CONSOLE */}
            {activeTab === 'revoke' && (
              <div className="bg-neutral-900/50 border border-rose-500/20 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-rose-500/10 rounded-lg border border-rose-500/30">
                    <Trash2 className="w-6 h-6 text-rose-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Token Revocation Console</h2>
                    <p className="text-xs text-neutral-400">Instantly burn compromised or expired multi-billion dollar access keys with full ledger reversal.</p>
                  </div>
                </div>

                {/* Security Safeguards Panel */}
                <div className="bg-rose-950/20 border border-rose-500/30 rounded-2xl p-5 mb-6 space-y-4">
                  <div className="flex items-start gap-3">
                    <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-xs font-bold uppercase tracking-wider text-rose-400">Critical Security Protocol Required</h4>
                      <p className="text-xs text-neutral-300 mt-1">
                        Revoking a token instantly returns collateral to the source vault and voids all active AI liquidity routing. This action is irreversible.
                      </p>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <label className="flex items-center gap-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 cursor-pointer hover:border-rose-500/30 transition-all">
                      <input 
                        type="checkbox" 
                        checked={bypassSafeguards}
                        onChange={(e) => setBypassSafeguards(e.target.checked)}
                        className="rounded border-neutral-800 text-rose-500 focus:ring-rose-500/50 bg-neutral-950 w-4 h-4"
                      />
                      <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Bypass AI Safeguards</span>
                    </label>

                    <label className="flex items-center gap-3 bg-neutral-950/50 p-3 rounded-xl border border-neutral-800 cursor-pointer hover:border-rose-500/30 transition-all">
                      <input 
                        type="checkbox" 
                        checked={ledgerReversal}
                        onChange={(e) => setLedgerReversal(e.target.checked)}
                        className="rounded border-neutral-800 text-rose-500 focus:ring-rose-500/50 bg-neutral-950 w-4 h-4"
                      />
                      <span className="text-[11px] font-bold text-neutral-300 uppercase tracking-wider">Modern Treasury Reversal</span>
                    </label>
                  </div>

                  <div>
                    <label className="block text-[10px] font-bold uppercase tracking-wider text-neutral-400 mb-1.5">Enter Security Override Code</label>
                    <input 
                      type="password" 
                      value={securityOverrideCode}
                      onChange={(e) => setSecurityOverrideCode(e.target.value)}
                      placeholder="Enter 'CITI-AI-999' to authorize"
                      className="w-full bg-neutral-950 border border-neutral-800 rounded-xl px-4 py-2.5 text-xs text-white focus:outline-none focus:border-rose-500/50 transition-all font-mono"
                    />
                  </div>
                </div>

                {/* Active Tokens List for Revocation */}
                <div className="space-y-4">
                  {activeTokens.map((token) => (
                    <div 
                      key={token.id} 
                      className={`bg-neutral-950 border rounded-2xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 transition-all ${
                        token.status === 'REVOKED' ? 'border-neutral-900 opacity-50' : 'border-neutral-800 hover:border-rose-500/30'
                      }`}
                    >
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-rose-400">{token.id}</span>
                          <h3 className="text-sm font-bold text-white">{token.name}</h3>
                        </div>
                        <div className="flex flex-wrap gap-x-4 gap-y-1 text-[11px] text-neutral-400 font-mono">
                          <span>Collateral: <strong className="text-white">${(token.collateral / 1e9).toFixed(2)}B</strong></span>
                          <span>Vault: <strong className="text-white">{token.treasuryAccount}</strong></span>
                        </div>
                      </div>

                      <div className="flex items-center gap-3 w-full md:w-auto justify-between md:justify-end">
                        <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider ${
                          token.status === 'REVOKED' 
                            ? 'bg-rose-500/10 text-rose-400 border border-rose-500/30' 
                            : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                        }`}>
                          {token.status}
                        </span>

                        {token.status !== 'REVOKED' && (
                          <button
                            onClick={() => handleRevoke(token.id)}
                            className="flex items-center gap-1.5 bg-rose-950/20 hover:bg-rose-600 border border-rose-500/30 hover:border-rose-500 text-rose-400 hover:text-white px-3.5 py-2 rounded-xl text-xs font-bold transition-all"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Burn Token
                          </button>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* TAB 4: QUANTUM SECURITY SHIELD */}
            {activeTab === 'shield' && (
              <div className="bg-neutral-900/50 border border-emerald-500/20 rounded-3xl p-8 backdrop-blur-md shadow-2xl">
                <div className="flex items-center gap-3 mb-6">
                  <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30">
                    <Shield className="w-6 h-6 text-emerald-400" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-white">Quantum Security Shield</h2>
                    <p className="text-xs text-neutral-400">Real-time threat matrix, AI-driven anomaly detection, and multi-signature HSM status.</p>
                  </div>
                </div>

                {/* Threat Matrix Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">AI Threat Analysis</span>
                    <div className="flex items-center gap-2">
                      <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                      <span className="text-sm font-bold text-white">0 Active Threats</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Continuous neural network scanning active.</p>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">HSM Key Rotation</span>
                    <div className="flex items-center gap-2">
                      <Lock className="w-5 h-5 text-cyan-400" />
                      <span className="text-sm font-bold text-white">Every 60 Seconds</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Quantum-resistant key generation.</p>
                  </div>

                  <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-4 space-y-2">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-neutral-400">Ledger Integrity</span>
                    <div className="flex items-center gap-2">
                      <Database className="w-5 h-5 text-purple-400" />
                      <span className="text-sm font-bold text-white">100% Verified</span>
                    </div>
                    <p className="text-[10px] text-neutral-500">Modern Treasury ledger synced.</p>
                  </div>
                </div>

                {/* Visual Threat Map Mock */}
                <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(#10b981_1px,transparent_1px)] [background-size:16px_16px] opacity-10" />
                  <div className="relative z-10 flex flex-col items-center justify-center py-8 text-center space-y-3">
                    <div className="w-16 h-16 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center animate-pulse">
                      <Globe className="w-8 h-8 text-emerald-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white">Global Security Node Network</h4>
                      <p className="text-xs text-neutral-400 max-w-md mx-auto mt-1">
                        Citibank AI nodes in New York, London, Tokyo, and Zurich are actively securing the Modern Treasury ledger routing paths.
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            )}

          </div>

          {/* RIGHT: LIVE AUDIT LOG & LEDGER STATUS */}
          <div className="space-y-6">
            
            {/* MODERN TREASURY LEDGER STATUS */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl">
              <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-cyan-400" />
                Modern Treasury Ledger
              </h3>

              <div className="space-y-3">
                <div className="flex justify-between items-center text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400">Ledger ID</span>
                  <span className="font-mono font-bold text-white">led_citi_ai_0091</span>
                </div>

                <div className="flex justify-between items-center text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400">Pending Settlements</span>
                  <span className="font-mono font-bold text-amber-400">0.00 USD</span>
                </div>

                <div className="flex justify-between items-center text-xs bg-neutral-950 p-3 rounded-xl border border-neutral-800">
                  <span className="text-neutral-400">Last Sync Block</span>
                  <span className="font-mono font-bold text-cyan-400">#9,482,102</span>
                </div>
              </div>
            </div>

            {/* LIVE SECURITY LOGS */}
            <div className="bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 backdrop-blur-md shadow-2xl flex flex-col h-[450px]">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold uppercase tracking-wider text-neutral-400 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Live Security Audit Log
                </h3>
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              </div>

              <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-neutral-800 scrollbar-track-transparent">
                {securityLogs.map((log) => (
                  <div 
                    key={log.id} 
                    className="bg-neutral-950 border border-neutral-900 rounded-xl p-3 space-y-1 hover:border-neutral-800 transition-all"
                  >
                    <div className="flex justify-between items-center text-[10px] font-mono">
                      <span className="text-neutral-500">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded font-bold ${
                        log.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400' :
                        log.severity === 'HIGH' ? 'bg-amber-500/10 text-amber-400' :
                        log.severity === 'MEDIUM' ? 'bg-cyan-500/10 text-cyan-400' :
                        'bg-neutral-800 text-neutral-400'
                      }`}>
                        {log.severity}
                      </span>
                    </div>
                    <p className="text-xs text-neutral-200 font-medium">{log.event}</p>
                    <p className="text-[9px] text-neutral-500 font-mono uppercase tracking-wider">Source: {log.source}</p>
                  </div>
                ))}
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 mt-12 relative z-10">
        <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-amber-500/50" />
            <span>© 2026 Citibank N.A. Imperial AI & Modern Treasury Division. All Sovereign Rights Reserved.</span>
          </div>
          <div className="flex gap-6 font-mono text-[10px]">
            <span className="hover:text-amber-400 cursor-pointer transition-colors">SECURE CORE v9.4-QUANTUM</span>
            <span className="hover:text-cyan-400 cursor-pointer transition-colors">MT-API-v4.2</span>
          </div>
        </div>
      </footer>
    </div>
  );
}