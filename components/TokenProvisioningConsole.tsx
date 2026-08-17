import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 
  Coins, 
  Key, 
  Lock, 
  TrendingUp, 
  Layers, 
  Compass, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  DollarSign, 
  Fingerprint, 
  Activity,
  Globe,
  Zap
} from 'lucide-react';

// Define types for our state
interface TokenResponse {
  access_token: string;
  token_type: string;
  expires_in: number;
  scope: string;
  jti: string;
  modern_treasury_ledger_id: string;
  asset_valuation: string;
}

interface ScopeItem {
  id: string;
  name: string;
  description: string;
  cost: string;
}

export default function TokenProvisioningConsole() {
  // State Management
  const [authCode, setAuthCode] = useState<string>('CITI-ELITE-999-ALPHA-SECURE');
  const [clientSecret, setClientSecret] = useState<string>('••••••••••••••••••••••••••••••••');
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [provisionComplete, setProvisionComplete] = useState<boolean>(false);
  const [fraudScore, setFraudScore] = useState<number>(0.01);
  const [isAnalyzingFraud, setIsAnalyzingFraud] = useState<boolean>(false);
  const [ledgerStatus, setLedgerStatus] = useState<'IDLE' | 'PENDING' | 'LEDGERED'>('IDLE');
  const [selectedScopes, setSelectedScopes] = useState<string[]>([
    'wealth.management.read', 
    'sovereign.vault.write', 
    'ai.predictive.arbitrage'
  ]);
  const [tokenData, setTokenData] = useState<TokenResponse | null>(null);
  const [systemLog, setSystemLog] = useState<string[]>([
    'System initialized. Secure connection established with Citibank GCB Core.',
    'Modern Treasury ledger link: ACTIVE (Asset Account: LA_CITI_ELITE_009)',
    'AI Fraud Detection Engine: STANDBY (Quantum Biometrics Active)'
  ]);

  // Available Luxury Scopes
  const availableScopes: ScopeItem[] = [
    { id: 'wealth.management.read', name: 'Wealth Management Read', description: 'Access ultra-high-net-worth portfolio balances.', cost: '$50,000,000 Limit' },
    { id: 'sovereign.vault.write', name: 'Sovereign Vault Write', description: 'Authorize multi-million dollar physical gold transfers.', cost: '$500,000,000 Limit' },
    { id: 'ai.predictive.arbitrage', name: 'AI Predictive Arbitrage', description: 'Deploy real-time AI trading models on global markets.', cost: 'Unlimited Execution' },
    { id: 'modern.treasury.ledger', name: 'Modern Treasury Ledgering', description: 'Direct ledger integration for real-time asset creation.', cost: 'Sovereign Backed' },
  ];

  // Add log helper
  const addLog = (message: string) => {
    setSystemLog(prev => [`[${new Date().toLocaleTimeString()}] ${message}`, ...prev]);
  };

  // Toggle Scope Selection
  const toggleScope = (scopeId: string) => {
    if (selectedScopes.includes(scopeId)) {
      setSelectedScopes(selectedScopes.filter(id => id !== scopeId));
      addLog(`Scope removed: ${scopeId}`);
    } else {
      setSelectedScopes([...selectedScopes, scopeId]);
      addLog(`Scope authorized: ${scopeId}`);
    }
  };

  // Simulate AI Fraud Analysis
  const runAIFraudAnalysis = async () => {
    setIsAnalyzingFraud(true);
    addLog('AI Fraud Engine: Initiating multi-vector biometric & behavioral analysis...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    const simulatedScore = parseFloat((Math.random() * 0.05 + 0.01).toFixed(4));
    setFraudScore(simulatedScore);
    setIsAnalyzingFraud(false);
    addLog(`AI Fraud Engine: Analysis complete. Risk Score: ${simulatedScore * 100}% (Extremely Safe).`);
    return simulatedScore;
  };

  // Handle Token Provisioning & Modern Treasury Ledgering
  const handleProvisionToken = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!authCode) return;

    setIsProvisioning(true);
    setProvisionComplete(false);
    setLedgerStatus('PENDING');
    addLog('Initiating OAuth2 exchange at /oauth2/token/us/gcb...');

    // Step 1: AI Fraud Check
    const score = await runAIFraudAnalysis();
    if (score > 0.10) {
      addLog('AI Fraud Engine: Warning! Risk threshold exceeded. Aborting.');
      setIsProvisioning(false);
      return;
    }

    // Step 2: Modern Treasury Ledgering Simulation
    addLog('Modern Treasury: Creating pending ledger transaction for token asset...');
    await new Promise(resolve => setTimeout(resolve, 1200));
    
    // Step 3: Token Generation
    addLog('Citibank GCB: Exchanging authorization code for high-value access token...');
    await new Promise(resolve => setTimeout(resolve, 1500));

    const generatedToken = {
      access_token: `ct_gcb_live_ai_${Math.random().toString(36).substring(2, 15).toUpperCase()}_${Math.random().toString(36).substring(2, 15).toUpperCase()}`,
      token_type: 'Bearer (Ultra-Luxury Elite)',
      expires_in: 3600,
      scope: selectedScopes.join(' '),
      jti: `jti_gcb_mt_${Math.random().toString(36).substring(2, 10)}`,
      modern_treasury_ledger_id: `tx_mt_ledger_${Math.random().toString(36).substring(2, 12).toUpperCase()}`,
      asset_valuation: '$250,000,000.00 USD'
    };

    setTokenData(generatedToken);
    setLedgerStatus('LEDGERED');
    setProvisionComplete(true);
    setIsProvisioning(false);
    
    addLog(`Modern Treasury: Ledger entry finalized. Asset valued at ${generatedToken.asset_valuation} recorded.`);
    addLog(`Citibank GCB: Token successfully provisioned. JTI: ${generatedToken.jti}`);
  };

  return (
    <div className="min-h-screen bg-[#0B0B0B] text-white font-sans selection:bg-[#D4AF37] selection:text-black p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Luxury Accents */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-[#D4AF37] opacity-[0.03] rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-[#AA7C11] opacity-[0.02] rounded-full blur-[150px] pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center border-b border-[#2A2518] pb-8 mb-10 gap-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-[10px] tracking-[0.2em] uppercase font-semibold bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black rounded-full shadow-[0_0_15px_rgba(212,175,55,0.3)]">
              Citibank Private Elite AI
            </span>
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-500 animate-pulse" />
            <span className="text-xs text-neutral-400 tracking-wider">Secure Node 09</span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-[#F3E5AB] to-[#D4AF37]">
            Token Provisioning Console
          </h1>
          <p className="text-xs text-neutral-400 mt-1 tracking-wide">
            Endpoint: <code className="text-[#D4AF37] bg-[#1A160E] px-2 py-0.5 rounded border border-[#3D331D]">/oauth2/token/us/gcb</code>
          </p>
        </div>

        {/* Modern Treasury Live Asset Counter */}
        <div className="bg-gradient-to-br from-[#16140F] to-[#0F0E0B] border border-[#3D331D] rounded-xl p-4 flex items-center gap-4 shadow-2xl">
          <div className="p-3 bg-[#221C10] rounded-lg border border-[#5C4A24]">
            <Coins className="w-6 h-6 text-[#D4AF37] animate-spin-slow" />
          </div>
          <div>
            <p className="text-[10px] text-neutral-400 uppercase tracking-[0.15em]">Modern Treasury Ledger Value</p>
            <p className="text-xl font-mono font-bold text-[#D4AF37] tracking-wider">$1,250,000,000.00</p>
            <p className="text-[9px] text-emerald-400 flex items-center gap-1 mt-0.5">
              <Activity className="w-3 h-3" /> Real-time Sovereign Backed Assets
            </p>
          </div>
        </div>
      </header>

      {/* Main Dashboard Grid */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-grow">
        
        {/* Left Column: Configuration & Scopes (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-8">
          
          {/* OAuth Credentials Form */}
          <section className="bg-gradient-to-b from-[#12110E] to-[#0D0C0A] border border-[#2A2518] rounded-2xl p-6 shadow-xl relative">
            <div className="absolute top-0 right-0 w-32 h-[1px] bg-gradient-to-r from-transparent via-[#D4AF37] to-transparent" />
            
            <div className="flex items-center gap-2 mb-6">
              <Key className="w-5 h-5 text-[#D4AF37]" />
              <h2 className="text-lg font-medium tracking-wide text-white">OAuth2 Exchange Credentials</h2>
            </div>

            <form onSubmit={handleProvisionToken} className="space-y-5">
              <div>
                <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">
                  Authorization Code (GCB Secure)
                </label>
                <div className="relative">
                  <input 
                    type="text" 
                    value={authCode}
                    onChange={(e) => setAuthCode(e.target.value)}
                    className="w-full bg-[#1A1814] border border-[#3D331D] rounded-lg px-4 py-3 text-sm font-mono text-[#F3E5AB] focus:outline-none focus:border-[#D4AF37] focus:ring-1 focus:ring-[#D4AF37] transition-all"
                    placeholder="Enter Citibank Auth Code"
                    required
                  />
                  <div className="absolute right-3 top-3 flex items-center gap-1.5">
                    <span className="text-[9px] bg-[#2D2515] text-[#D4AF37] px-2 py-0.5 rounded border border-[#5C4A24] font-mono">
                      AES-256
                    </span>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">
                    Client ID
                  </label>
                  <input 
                    type="text" 
                    value="citi_elite_ai_client_99" 
                    disabled
                    className="w-full bg-[#141310] border border-[#2A2518] rounded-lg px-4 py-3 text-sm font-mono text-neutral-500 cursor-not-allowed"
                  />
                </div>
                <div>
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider mb-2">
                    Client Secret
                  </label>
                  <input 
                    type="text" 
                    value={clientSecret}
                    onChange={(e) => setClientSecret(e.target.value)}
                    className="w-full bg-[#1A1814] border border-[#3D331D] rounded-lg px-4 py-3 text-sm font-mono text-[#F3E5AB] focus:outline-none focus:border-[#D4AF37] transition-all"
                  />
                </div>
              </div>

              {/* Scope Selector */}
              <div className="pt-4 border-t border-[#2A2518]">
                <div className="flex justify-between items-center mb-3">
                  <label className="block text-xs text-neutral-400 uppercase tracking-wider">
                    Select Authorized Scopes
                  </label>
                  <span className="text-[10px] text-[#D4AF37] font-mono">
                    {selectedScopes.length} Scopes Selected
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {availableScopes.map((scope) => {
                    const isSelected = selectedScopes.includes(scope.id);
                    return (
                      <button
                        key={scope.id}
                        type="button"
                        onClick={() => toggleScope(scope.id)}
                        className={`text-left p-3 rounded-xl border transition-all flex flex-col justify-between h-24 ${
                          isSelected 
                            ? 'bg-gradient-to-br from-[#221C10] to-[#1A150D] border-[#D4AF37] shadow-[0_0_15px_rgba(212,175,55,0.1)]' 
                            : 'bg-[#12110E] border-[#2A2518] hover:border-[#3D331D]'
                        }`}
                      >
                        <div className="flex justify-between items-start w-full">
                          <span className={`text-xs font-medium ${isSelected ? 'text-[#D4AF37]' : 'text-neutral-300'}`}>
                            {scope.name}
                          </span>
                          <div className={`w-3.5 h-3.5 rounded-full border flex items-center justify-center ${
                            isSelected ? 'border-[#D4AF37] bg-[#D4AF37]' : 'border-neutral-600'
                          }`}>
                            {isSelected && <div className="w-1.5 h-1.5 bg-black rounded-full" />}
                          </div>
                        </div>
                        <div>
                          <p className="text-[10px] text-neutral-400 line-clamp-1 mb-1">{scope.description}</p>
                          <span className="text-[9px] font-mono text-[#AA7C11] bg-[#221C10] px-1.5 py-0.5 rounded border border-[#3D331D]">
                            {scope.cost}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Action Button */}
              <button
                type="submit"
                disabled={isProvisioning || selectedScopes.length === 0}
                className={`w-full py-4 rounded-xl font-medium tracking-widest uppercase text-xs transition-all duration-300 flex items-center justify-center gap-2 relative overflow-hidden ${
                  isProvisioning 
                    ? 'bg-[#221C10] text-neutral-500 border border-[#3D331D] cursor-wait' 
                    : 'bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black hover:shadow-[0_0_30px_rgba(212,175,55,0.4)] active:scale-[0.99]'
                }`}
              >
                {isProvisioning ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Provisioning Multi-Million Dollar Asset...
                  </>
                ) : (
                  <>
                    <Shield className="w-4 h-4" />
                    Exchange Code & Provision Token
                  </>
                )}
              </button>
            </form>
          </section>

          {/* Real-time System Logs */}
          <section className="bg-[#0D0C0A] border border-[#2A2518] rounded-2xl p-5 flex-grow flex flex-col">
            <div className="flex items-center justify-between mb-3 border-b border-[#1F1B12] pb-3">
              <div className="flex items-center gap-2">
                <Activity className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-medium uppercase tracking-wider text-neutral-300">Telemetry & Audit Logs</h3>
              </div>
              <span className="text-[9px] font-mono text-neutral-500">SECURE CONNECTION</span>
            </div>
            <div className="font-mono text-[11px] text-neutral-400 space-y-2 overflow-y-auto max-h-48 flex-grow custom-scrollbar">
              {systemLog.map((log, index) => (
                <div key={index} className="border-l-2 border-[#3D331D] pl-2 py-0.5 hover:bg-[#141310] transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </section>

        </div>

        {/* Right Column: AI Fraud & Modern Treasury Ledgering (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-8">
          
          {/* AI Fraud Detection Panel */}
          <section className="bg-gradient-to-b from-[#12110E] to-[#0D0C0A] border border-[#2A2518] rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-24 h-24 bg-[#D4AF37] opacity-[0.02] rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Cpu className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-medium tracking-wide text-white">AI Fraud Telemetry</h2>
              </div>
              <span className="text-[10px] bg-[#1A160E] text-[#D4AF37] px-2 py-0.5 rounded border border-[#3D331D] font-mono">
                Quantum Engine v4.2
              </span>
            </div>

            {/* Fraud Score Gauge */}
            <div className="flex flex-col items-center justify-center py-4 border-b border-[#2A2518] mb-4">
              <div className="relative w-32 h-32 flex items-center justify-center">
                {/* Outer Ring */}
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#1F1B12"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="64"
                    cy="64"
                    r="56"
                    stroke="#D4AF37"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={351.8}
                    strokeDashoffset={351.8 - (351.8 * (1 - fraudScore))}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <div className="absolute flex flex-col items-center justify-center">
                  <Fingerprint className="w-6 h-6 text-[#D4AF37] mb-1 animate-pulse" />
                  <span className="text-2xl font-mono font-bold text-white">
                    {(fraudScore * 100).toFixed(2)}%
                  </span>
                  <span className="text-[8px] text-neutral-400 uppercase tracking-widest">Risk Index</span>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4 w-full mt-6 text-center">
                <div className="bg-[#141310] p-2 rounded-lg border border-[#2A2518]">
                  <p className="text-[9px] text-neutral-400 uppercase">Biometrics</p>
                  <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">VERIFIED</p>
                </div>
                <div className="bg-[#141310] p-2 rounded-lg border border-[#2A2518]">
                  <p className="text-[9px] text-neutral-400 uppercase">IP Velocity</p>
                  <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">OPTIMAL</p>
                </div>
                <div className="bg-[#141310] p-2 rounded-lg border border-[#2A2518]">
                  <p className="text-[9px] text-neutral-400 uppercase">Device Trust</p>
                  <p className="text-xs font-mono font-semibold text-emerald-400 mt-0.5">99.9%</p>
                </div>
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">AI Decision Matrix:</span>
                <span className="text-emerald-400 font-medium">APPROVED (Sovereign Tier)</span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-neutral-400">Neural Latency:</span>
                <span className="text-neutral-300 font-mono">1.42ms</span>
              </div>
            </div>
          </section>

          {/* Modern Treasury Ledgering Status */}
          <section className="bg-gradient-to-b from-[#12110E] to-[#0D0C0A] border border-[#2A2518] rounded-2xl p-6 relative">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-lg font-medium tracking-wide text-white">Modern Treasury Ledger</h2>
              </div>
              <span className={`text-[10px] px-2.5 py-0.5 rounded-full font-mono font-semibold ${
                ledgerStatus === 'LEDGERED' 
                  ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' 
                  : ledgerStatus === 'PENDING'
                  ? 'bg-amber-950 text-amber-400 border border-amber-800 animate-pulse'
                  : 'bg-neutral-900 text-neutral-400 border border-neutral-800'
              }`}>
                {ledgerStatus}
              </span>
            </div>

            <div className="space-y-4">
              <div className="bg-[#141310] p-4 rounded-xl border border-[#2A2518] space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400">Ledger Account</span>
                  <span className="text-xs font-mono text-[#F3E5AB]">LA_CITI_ELITE_TOKEN_009</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400">Asset Classification</span>
                  <span className="text-xs font-mono text-[#D4AF37]">Sovereign AI Token Asset</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-neutral-400">Valuation</span>
                  <span className="text-xs font-mono text-white font-bold">$250,000,000.00 USD</span>
                </div>
              </div>

              {/* Ledger Entry Visualization */}
              <div className="border-l-2 border-[#D4AF37] pl-4 py-1 space-y-2">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider">Double-Entry Ledger Record</p>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div>
                    <p className="text-neutral-500">DEBIT (Asset)</p>
                    <p className="text-emerald-400">+$250,000,000.00</p>
                  </div>
                  <div>
                    <p className="text-neutral-500">CREDIT (Equity)</p>
                    <p className="text-amber-500">-$250,000,000.00</p>
                  </div>
                </div>
              </div>
            </div>
          </section>

        </div>

      </main>

      {/* Token Output Modal / Section (Full Width when complete) */}
      {provisionComplete && tokenData && (
        <section className="max-w-7xl mx-auto w-full mt-8 bg-gradient-to-r from-[#1A160E] via-[#12110E] to-[#1A160E] border-2 border-[#D4AF37] rounded-2xl p-6 md:p-8 shadow-[0_0_50px_rgba(212,175,55,0.15)] relative overflow-hidden animate-fade-in">
          <div className="absolute top-0 right-0 p-4">
            <span className="px-3 py-1 text-[9px] tracking-widest uppercase bg-emerald-950 text-emerald-400 border border-emerald-800 rounded-full">
              Live Token Active
            </span>
          </div>

          <div className="flex flex-col md:flex-row items-start md:items-center gap-6 mb-6">
            <div className="p-4 bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] rounded-2xl text-black shadow-lg">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div>
              <h3 className="text-xl font-light text-white tracking-wide">
                Citibank OAuth2 Token Provisioned Successfully
              </h3>
              <p className="text-xs text-neutral-400 mt-1">
                This token is backed by a $250M Modern Treasury ledger entry and secured by real-time AI biometrics.
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Token Details */}
            <div className="lg:col-span-2 space-y-4">
              <div>
                <label className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-1.5">
                  Access Token (Bearer)
                </label>
                <div className="bg-[#0D0C0A] border border-[#3D331D] rounded-lg p-3 font-mono text-xs text-[#F3E5AB] break-all select-all cursor-pointer hover:border-[#D4AF37] transition-colors">
                  {tokenData.access_token}
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-[#0D0C0A] border border-[#2A2518] p-3 rounded-lg">
                  <span className="block text-[9px] text-neutral-500 uppercase">Token Type</span>
                  <span className="text-xs font-mono text-white font-medium">{tokenData.token_type}</span>
                </div>
                <div className="bg-[#0D0C0A] border border-[#2A2518] p-3 rounded-lg">
                  <span className="block text-[9px] text-neutral-500 uppercase">Expires In</span>
                  <span className="text-xs font-mono text-white font-medium">{tokenData.expires_in} seconds</span>
                </div>
                <div className="bg-[#0D0C0A] border border-[#2A2518] p-3 rounded-lg">
                  <span className="block text-[9px] text-neutral-500 uppercase">JTI (Unique ID)</span>
                  <span className="text-xs font-mono text-white font-medium">{tokenData.jti}</span>
                </div>
                <div className="bg-[#0D0C0A] border border-[#2A2518] p-3 rounded-lg">
                  <span className="block text-[9px] text-neutral-500 uppercase">Ledger ID</span>
                  <span className="text-xs font-mono text-[#D4AF37] font-medium truncate block">{tokenData.modern_treasury_ledger_id}</span>
                </div>
              </div>
            </div>

            {/* Scope Visualization Map */}
            <div className="bg-[#0D0C0A] border border-[#2A2518] p-4 rounded-xl flex flex-col justify-between">
              <div>
                <span className="block text-[10px] text-neutral-400 uppercase tracking-wider mb-3">
                  Active Scope Authorization Map
                </span>
                <div className="space-y-2">
                  {selectedScopes.map((scope) => (
                    <div key={scope} className="flex items-center gap-2 text-xs text-neutral-300">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#D4AF37]" />
                      <span className="font-mono">{scope}</span>
                    </div>
                  ))}
                </div>
              </div>
              <div className="pt-4 border-t border-[#1F1B12] mt-4 flex justify-between items-center">
                <span className="text-[10px] text-neutral-500">Security Level</span>
                <span className="text-[10px] text-emerald-400 font-mono font-bold">SOVEREIGN ELITE</span>
              </div>
            </div>
          </div>
        </section>
      )}

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full mt-12 pt-6 border-t border-[#1F1B12] flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500">
        <div className="flex items-center gap-2">
          <Globe className="w-4 h-4 text-[#D4AF37]" />
          <span>Citibank Global Consumer Banking (GCB) &bull; AI Sovereign Network</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#terms" className="hover:text-[#D4AF37] transition-colors">Modern Treasury Ledgering Agreement</a>
          <a href="#privacy" className="hover:text-[#D4AF37] transition-colors">Quantum Security Protocol</a>
        </div>
        <p className="text-[10px] font-mono text-neutral-600">
          SECURE NODE ID: CITI-MT-AI-999-ZURICH
        </p>
      </footer>
    </div>
  );
}