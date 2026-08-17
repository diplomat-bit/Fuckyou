import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Cpu, 
  Landmark, 
  Key, 
  Zap, 
  Award, 
  TrendingUp, 
  Globe, 
  Lock, 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  ChevronRight, 
  DollarSign,
  Layers,
  Fingerprint
} from 'lucide-react';

// Premium Types for the Sovereign Gateway
interface ComplianceMetrics {
  ofacSanctionsCheck: 'PASSED' | 'FAILED' | 'WARNING';
  amlVelocityScore: number; // 0-100
  geopoliticalRiskIndex: number; // 0-100
  syntheticIdentityProbability: number; // 0-100
  overallRiskScore: number; // 0-100
  aiDecision: 'APPROVED_SOVEREIGN' | 'MANUAL_RECONCILIATION' | 'DENIED';
}

interface CounterpartyDetails {
  id: string;
  name: string;
  routingNumber: string;
  encryptedAccountNumber: string;
  status: 'active' | 'pending' | 'suspended';
  verificationType: 'microdeposits' | 'plaid' | 'prenote' | 'instant_sovereign';
  createdAt: string;
}

export default function ModernTreasuryRoutingGateway() {
  // State Management
  const [accountId, setAccountId] = useState<string>('CITI-PRV-9999-X');
  const [routingNumber, setRoutingNumber] = useState<string>('021000021'); // Chase/Citi high-value routing
  const [rawAccountNumber, setRawAccountNumber] = useState<string>('987654321098');
  const [encryptedAccountNumber, setEncryptedAccountNumber] = useState<string>('');
  const [counterpartyName, setCounterpartyName] = useState<string>('Aurelius Global Wealth Trust');
  const [taxId, setTaxId] = useState<string>('XX-XXX8888');
  
  // Process States
  const [isEncrypting, setIsEncrypting] = useState<boolean>(false);
  const [isScreening, setIsScreening] = useState<boolean>(false);
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [currentStep, setCurrentStep] = useState<'idle' | 'encrypted' | 'screened' | 'provisioned'>('idle');

  // AI & Modern Treasury Results
  const [complianceMetrics, setComplianceMetrics] = useState<ComplianceMetrics | null>(null);
  const [provisionedCounterparty, setProvisionedCounterparty] = useState<CounterpartyDetails | null>(null);
  const [transactionLimit, setTransactionLimit] = useState<string>('$5,000,000,000');

  // Simulate Encryption Endpoint: /accounts/{accountId}/encrypt/accountRoutingNumber
  const handleEncryptAndFetch = async () => {
    if (!accountId || !routingNumber || !rawAccountNumber) return;
    setIsEncrypting(true);
    
    // Simulate high-grade HSM encryption delay
    await new Promise((resolve) => setTimeout(resolve, 1500));
    
    // Simulated response from /accounts/{accountId}/encrypt/accountRoutingNumber
    const simulatedEncryptedToken = `enc_citi_mt_${btoa(rawAccountNumber + routingNumber).substring(0, 32).toUpperCase()}_v4`;
    setEncryptedAccountNumber(simulatedEncryptedToken);
    setIsEncrypting(false);
    setCurrentStep('encrypted');
  };

  // Simulate AI-Driven Compliance Screening & Risk Scoring
  const handleAIScreening = async () => {
    if (!encryptedAccountNumber) return;
    setIsScreening(true);

    // Simulate deep neural network analysis
    await new Promise((resolve) => setTimeout(resolve, 2000));

    const simulatedMetrics: ComplianceMetrics = {
      ofacSanctionsCheck: 'PASSED',
      amlVelocityScore: 98.4,
      geopoliticalRiskIndex: 1.2, // Ultra-low risk
      syntheticIdentityProbability: 0.02,
      overallRiskScore: 99.8, // 99.8% Safe / Sovereign Grade
      aiDecision: 'APPROVED_SOVEREIGN'
    };

    setComplianceMetrics(simulatedMetrics);
    setIsScreening(false);
    setCurrentStep('screened');
  };

  // Simulate Modern Treasury Counterparty Provisioning
  const handleProvisionCounterparty = async () => {
    if (!complianceMetrics || complianceMetrics.aiDecision !== 'APPROVED_SOVEREIGN') return;
    setIsProvisioning(true);

    // Simulate Modern Treasury API call
    await new Promise((resolve) => setTimeout(resolve, 1800));

    const simulatedCounterparty: CounterpartyDetails = {
      id: `cpty_mt_sovereign_${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
      name: counterpartyName,
      routingNumber: routingNumber,
      encryptedAccountNumber: encryptedAccountNumber,
      status: 'active',
      verificationType: 'instant_sovereign',
      createdAt: new Date().toISOString()
    };

    setProvisionedCounterparty(simulatedCounterparty);
    setIsProvisioning(false);
    setCurrentStep('provisioned');
  };

  const resetGateway = () => {
    setEncryptedAccountNumber('');
    setComplianceMetrics(null);
    setProvisionedCounterparty(null);
    setCurrentStep('idle');
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-amber-500 selection:text-black p-6 md:p-12 flex flex-col justify-between relative overflow-hidden">
      
      {/* Background Ambient Luxury Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[150px] pointer-events-none" />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[1px] bg-gradient-to-r from-transparent via-amber-500/20 to-transparent pointer-events-none" />

      {/* Header */}
      <header className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-start md:items-center gap-6 border-b border-amber-500/10 pb-8 z-10">
        <div>
          <div className="flex items-center gap-2 text-amber-500 text-xs font-semibold tracking-[0.3em] uppercase mb-2">
            <Award className="w-4 h-4 animate-pulse" />
            Citi Private Ledger × Modern Treasury
          </div>
          <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-amber-400">
            Sovereign Routing Gateway
          </h1>
          <p className="text-slate-400 text-sm mt-2 max-w-xl">
            High-value counterparty provisioning engine powered by Aegis AI compliance screening and real-time risk scoring.
          </p>
        </div>
        <div className="flex flex-col items-end text-right">
          <span className="text-xs text-slate-500 uppercase tracking-widest">Sovereign Tier Limit</span>
          <span className="text-2xl font-mono font-bold text-amber-400 tracking-wider">{transactionLimit}</span>
          <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
            Fedwire Real-Time Liquidity Route Active
          </span>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 my-12 z-10 flex-grow">
        
        {/* Left Column: Configuration & Actions (7 Cols) */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Step 1: Citi Secure Encryption */}
          <div className="bg-gradient-to-b from-slate-900/90 to-black border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-amber-500/10 rounded-xl border border-amber-500/20 text-amber-400">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">1. Citi Secure HSM Encryption</h3>
                  <p className="text-xs text-slate-400">Encrypt routing & account numbers via Citi Private API</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 px-2.5 py-1 rounded-full border border-amber-500/20 uppercase tracking-wider">
                Endpoint: /encrypt
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Citi Account ID</label>
                <input 
                  type="text" 
                  value={accountId} 
                  onChange={(e) => setAccountId(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="CITI-PRV-XXXX"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Routing Transit Number (RTN)</label>
                <input 
                  type="text" 
                  value={routingNumber} 
                  onChange={(e) => setRoutingNumber(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50 transition-all"
                  placeholder="021000021"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Raw Account Number (Confidential)</label>
                <div className="relative">
                  <input 
                    type="password" 
                    value={rawAccountNumber} 
                    onChange={(e) => setRawAccountNumber(e.target.value)}
                    className="w-full bg-black border border-slate-800 rounded-xl pl-4 pr-10 py-3 text-sm font-mono text-white focus:outline-none focus:border-amber-500/50 transition-all tracking-widest"
                    placeholder="••••••••••••"
                  />
                  <Lock className="absolute right-3.5 top-3.5 w-4 h-4 text-slate-500" />
                </div>
              </div>
            </div>

            <button
              onClick={handleEncryptAndFetch}
              disabled={isEncrypting || currentStep !== 'idle'}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                currentStep === 'idle' 
                  ? 'bg-gradient-to-r from-amber-500 to-amber-600 text-black hover:brightness-110 shadow-lg shadow-amber-500/10' 
                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              {isEncrypting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Accessing Citi HSM Vault...
                </>
              ) : currentStep !== 'idle' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Account Encrypted Successfully
                </>
              ) : (
                <>
                  <Fingerprint className="w-4 h-4" />
                  Encrypt Account & Routing Number
                </>
              )}
            </button>

            {encryptedAccountNumber && (
              <div className="mt-4 p-4 bg-amber-500/5 border border-amber-500/20 rounded-xl">
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] text-amber-400 uppercase tracking-widest font-semibold">Encrypted Token Payload</span>
                  <span className="text-[10px] text-slate-500 font-mono">AES-GCM-256</span>
                </div>
                <p className="text-xs font-mono text-slate-300 break-all bg-black/50 p-2.5 rounded border border-slate-900">
                  {encryptedAccountNumber}
                </p>
              </div>
            )}
          </div>

          {/* Step 2: Aegis AI Compliance Screening */}
          <div className={`bg-gradient-to-b from-slate-900/90 to-black border rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all duration-500 ${
            currentStep === 'idle' ? 'opacity-40 pointer-events-none border-slate-800' : 'border-slate-800'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 rounded-xl border border-blue-500/20 text-blue-400">
                  <Cpu className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">2. Aegis AI Compliance Screening</h3>
                  <p className="text-xs text-slate-400">Real-time AML, OFAC, and synthetic identity scoring</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-blue-500/10 text-blue-400 px-2.5 py-1 rounded-full border border-blue-500/20 uppercase tracking-wider">
                AI Engine v9.4
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Counterparty Legal Name</label>
                <input 
                  type="text" 
                  value={counterpartyName} 
                  onChange={(e) => setCounterpartyName(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
              <div>
                <label className="block text-xs text-slate-400 uppercase tracking-wider mb-2">Tax ID / EIN</label>
                <input 
                  type="text" 
                  value={taxId} 
                  onChange={(e) => setTaxId(e.target.value)}
                  className="w-full bg-black border border-slate-800 rounded-xl px-4 py-3 text-sm font-mono text-white focus:outline-none focus:border-blue-500/50 transition-all"
                />
              </div>
            </div>

            <button
              onClick={handleAIScreening}
              disabled={isScreening || currentStep !== 'encrypted'}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                currentStep === 'encrypted' 
                  ? 'bg-gradient-to-r from-blue-500 to-indigo-600 text-white hover:brightness-110 shadow-lg shadow-blue-500/10' 
                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              {isScreening ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Running Neural Compliance Models...
                </>
              ) : currentStep === 'screened' || currentStep === 'provisioned' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Sovereign Compliance Cleared
                </>
              ) : (
                <>
                  <Shield className="w-4 h-4" />
                  Execute AI Compliance Screening
                </>
              )}
            </button>

            {complianceMetrics && (
              <div className="mt-6 grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-blue-500/5 border border-blue-500/10 rounded-xl">
                <div className="text-center border-r border-slate-800/50">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">OFAC Status</span>
                  <span className="text-xs font-bold text-emerald-400 bg-emerald-400/10 px-2 py-0.5 rounded border border-emerald-400/20">
                    {complianceMetrics.ofacSanctionsCheck}
                  </span>
                </div>
                <div className="text-center border-r border-slate-800/50">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">AML Velocity</span>
                  <span className="text-sm font-mono font-bold text-white">{complianceMetrics.amlVelocityScore}%</span>
                </div>
                <div className="text-center border-r border-slate-800/50">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Synthetic ID Risk</span>
                  <span className="text-sm font-mono font-bold text-white">{complianceMetrics.syntheticIdentityProbability}%</span>
                </div>
                <div className="text-center">
                  <span className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Overall Score</span>
                  <span className="text-sm font-mono font-bold text-amber-400">{complianceMetrics.overallRiskScore}%</span>
                </div>
              </div>
            )}
          </div>

          {/* Step 3: Modern Treasury Provisioning */}
          <div className={`bg-gradient-to-b from-slate-900/90 to-black border rounded-2xl p-6 relative overflow-hidden shadow-2xl transition-all duration-500 ${
            currentStep !== 'screened' && currentStep !== 'provisioned' ? 'opacity-40 pointer-events-none border-slate-800' : 'border-slate-800'
          }`}>
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="p-2.5 bg-emerald-500/10 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <Landmark className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-lg text-white">3. Modern Treasury Provisioning</h3>
                  <p className="text-xs text-slate-400">Create high-value counterparty with encrypted routing</p>
                </div>
              </div>
              <span className="text-[10px] font-mono bg-emerald-500/10 text-emerald-400 px-2.5 py-1 rounded-full border border-emerald-400/20 uppercase tracking-wider">
                MT API v1.0
              </span>
            </div>

            <button
              onClick={handleProvisionCounterparty}
              disabled={isProvisioning || currentStep !== 'screened'}
              className={`w-full py-3.5 rounded-xl font-semibold text-sm tracking-wider transition-all flex items-center justify-center gap-2 ${
                currentStep === 'screened' 
                  ? 'bg-gradient-to-r from-emerald-500 to-teal-600 text-black hover:brightness-110 shadow-lg shadow-emerald-500/10' 
                  : 'bg-slate-900 text-slate-500 border border-slate-800 cursor-not-allowed'
              }`}
            >
              {isProvisioning ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Provisioning Counterparty in Modern Treasury...
                </>
              ) : currentStep === 'provisioned' ? (
                <>
                  <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                  Counterparty Provisioned & Active
                </>
              ) : (
                <>
                  <Zap className="w-4 h-4" />
                  Provision Counterparty
                </>
              )}
            </button>

            {provisionedCounterparty && (
              <div className="mt-6 p-4 bg-emerald-500/5 border border-emerald-500/20 rounded-xl space-y-3">
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                  <span className="text-xs text-slate-400">Counterparty ID</span>
                  <span className="text-xs font-mono text-white font-semibold">{provisionedCounterparty.id}</span>
                </div>
                <div className="flex justify-between items-center border-b border-slate-800/50 pb-2">
                  <span className="text-xs text-slate-400">Verification Method</span>
                  <span className="text-xs font-mono text-amber-400 uppercase tracking-wider font-semibold">
                    {provisionedCounterparty.verificationType.replace('_', ' ')}
                  </span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-xs text-slate-400">Status</span>
                  <span className="text-xs font-mono text-emerald-400 uppercase font-semibold flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                    {provisionedCounterparty.status}
                  </span>
                </div>
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Sovereign Status & AI Insights (5 Cols) */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Live Status Panel */}
          <div className="bg-gradient-to-b from-slate-900/90 to-black border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-2xl flex-grow flex flex-col justify-between">
            <div className="absolute top-0 right-0 w-40 h-40 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div>
              <div className="flex items-center justify-between mb-6">
                <h3 className="font-bold text-lg text-white flex items-center gap-2">
                  <Layers className="w-5 h-5 text-amber-500" />
                  Sovereign Ledger Status
                </h3>
                <span className="text-[10px] font-mono text-slate-500">SECURE NODE</span>
              </div>

              {/* Progress Steps Visualizer */}
              <div className="space-y-6 relative before:absolute before:left-4 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-800">
                
                {/* Step 1 Indicator */}
                <div className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-mono z-10 transition-all ${
                    currentStep !== 'idle' 
                      ? 'bg-amber-500 border-amber-500 text-black font-bold' 
                      : 'bg-black border-slate-800 text-slate-500'
                  }`}>
                    01
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold transition-all ${currentStep !== 'idle' ? 'text-white' : 'text-slate-500'}`}>
                      Citi HSM Encryption
                    </h4>
                    <p className="text-xs text-slate-500">Secure payload generation via /encrypt</p>
                  </div>
                </div>

                {/* Step 2 Indicator */}
                <div className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-mono z-10 transition-all ${
                    currentStep === 'screened' || currentStep === 'provisioned'
                      ? 'bg-blue-500 border-blue-500 text-white font-bold' 
                      : 'bg-black border-slate-800 text-slate-500'
                  }`}>
                    02
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold transition-all ${currentStep === 'screened' || currentStep === 'provisioned' ? 'text-white' : 'text-slate-500'}`}>
                      Aegis AI Compliance
                    </h4>
                    <p className="text-xs text-slate-500">Multi-vector risk scoring & OFAC screening</p>
                  </div>
                </div>

                {/* Step 3 Indicator */}
                <div className="flex gap-4 relative">
                  <div className={`w-8 h-8 rounded-full flex items-center justify-center border text-xs font-mono z-10 transition-all ${
                    currentStep === 'provisioned'
                      ? 'bg-emerald-500 border-emerald-500 text-black font-bold' 
                      : 'bg-black border-slate-800 text-slate-500'
                  }`}>
                    03
                  </div>
                  <div>
                    <h4 className={`text-sm font-semibold transition-all ${currentStep === 'provisioned' ? 'text-white' : 'text-slate-500'}`}>
                      Modern Treasury Provisioning
                    </h4>
                    <p className="text-xs text-slate-500">Counterparty activation & routing mapping</p>
                  </div>
                </div>

              </div>
            </div>

            {/* AI Insights Box */}
            <div className="mt-8 p-4 bg-gradient-to-r from-amber-500/10 to-transparent border-l-2 border-amber-500 rounded-r-xl">
              <div className="flex items-center gap-2 text-amber-400 text-xs font-bold uppercase tracking-wider mb-1">
                <Cpu className="w-3.5 h-3.5" />
                Aegis AI Recommendation
              </div>
              <p className="text-xs text-slate-300 leading-relaxed">
                {currentStep === 'idle' && "Awaiting Citi HSM encryption payload to initiate real-time risk scoring models."}
                {currentStep === 'encrypted' && "Payload encrypted. Ready to execute deep neural network compliance screening."}
                {currentStep === 'screened' && "Sovereign-grade clearance detected. Risk score is optimal. Safe to provision counterparty."}
                {currentStep === 'provisioned' && "Counterparty successfully provisioned. High-value routing channels mapped to Fedwire Prime."}
              </p>
            </div>

            {/* Reset Button */}
            {currentStep !== 'idle' && (
              <button 
                onClick={resetGateway}
                className="mt-6 w-full py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-white rounded-xl text-xs font-semibold tracking-wider transition-all border border-slate-800 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3 h-3" />
                Reset Gateway Session
              </button>
            )}

          </div>

          {/* Premium Security Badges */}
          <div className="bg-gradient-to-b from-slate-900/50 to-black border border-slate-800/50 rounded-2xl p-6 space-y-4">
            <h4 className="text-xs text-slate-500 uppercase tracking-widest font-bold">Sovereign Security Standards</h4>
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center gap-2.5">
                <Shield className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-300">SOC2 Type II Certified</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-300">Cross-Border Routing</span>
              </div>
              <div className="flex items-center gap-2.5">
                <Lock className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-300">AES-GCM-256 Vault</span>
              </div>
              <div className="flex items-center gap-2.5">
                <TrendingUp className="w-4 h-4 text-amber-500" />
                <span className="text-xs text-slate-300">Real-Time Liquidity</span>
              </div>
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto w-full flex flex-col md:flex-row justify-between items-center gap-4 border-t border-slate-900 pt-8 text-xs text-slate-500 z-10">
        <p>© {new Date().getFullYear()} Citibank Sovereign Private Ledger. All rights reserved.</p>
        <div className="flex gap-6">
          <a href="#terms" className="hover:text-amber-400 transition-colors">Sovereign Terms</a>
          <a href="#privacy" className="hover:text-amber-400 transition-colors">Privacy Protocol</a>
          <a href="#mt-docs" className="hover:text-amber-400 transition-colors">Modern Treasury Integration</a>
        </div>
      </footer>

    </div>
  );
}