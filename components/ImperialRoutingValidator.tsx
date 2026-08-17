import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  ShieldCheck, 
  Globe, 
  Cpu, 
  Search, 
  Building, 
  CheckCircle2, 
  AlertTriangle, 
  Sparkles, 
  Coins, 
  ArrowRight, 
  Lock, 
  Landmark, 
  HelpCircle,
  ChevronRight,
  Fingerprint,
  Crown,
  Compass
} from 'lucide-react';

// Premium Mock Database for Citibank Private Client & Global Routing
const LUXURY_ROUTING_DATABASE: Record<string, {
  bankName: string;
  division: string;
  tier: string;
  address: string;
  swift: string;
  chips: string;
  liquidityIndex: string;
  sanctionsStatus: 'CLEARED' | 'WARNING' | 'RESTRICTED';
  aiConfidence: number;
  modernTreasuryId: string;
}> = {
  '021000021': {
    bankName: 'Citibank, N.A.',
    division: 'Citibank Private Wealth Management & Sovereign Custody',
    tier: 'Tier 1 Capital Sovereign',
    address: '388 Greenwich Street, Penthouse Floor, New York, NY 10013',
    swift: 'CITIUS33XXX',
    chips: '008',
    liquidityIndex: '99.99% (Ultra-High)',
    sanctionsStatus: 'CLEARED',
    aiConfidence: 99.98,
    modernTreasuryId: 'tr_citi_sovereign_9901x'
  },
  '021000089': {
    bankName: 'Chase Bank Private Client',
    division: 'JPMorgan Chase Sovereign Treasury',
    tier: 'Tier 1 Capital Sovereign',
    address: '270 Park Avenue, Executive Suite, New York, NY 10017',
    swift: 'CHASEUS33',
    chips: '002',
    liquidityIndex: '99.95% (Ultra-High)',
    sanctionsStatus: 'CLEARED',
    aiConfidence: 99.91,
    modernTreasuryId: 'tr_jpm_sovereign_8821z'
  },
  '121000248': {
    bankName: 'Wells Fargo Private Bank',
    division: 'Wells Fargo Wealth & Investment Management',
    tier: 'Tier 1 Capital',
    address: '420 Montgomery Street, San Francisco, CA 94104',
    swift: 'WFCUS33',
    chips: '012',
    liquidityIndex: '99.87% (High)',
    sanctionsStatus: 'CLEARED',
    aiConfidence: 99.85,
    modernTreasuryId: 'tr_wfc_wealth_7712a'
  }
};

export default function ImperialRoutingValidator() {
  const [routingNumber, setRoutingNumber] = useState('');
  const [swiftCode, setSwiftCode] = useState('');
  const [activeTab, setActiveTab] = useState<'aba' | 'swift' | 'sanctions'>('aba');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisStep, setAnalysisStep] = useState('');
  const [validationResult, setValidationResult] = useState<any>(null);
  const [sanctionsCheckActive, setSanctionsCheckActive] = useState(false);
  const [sanctionsResult, setSanctionsResult] = useState<any>(null);

  // Simulated AI Analysis Steps
  const analysisSteps = [
    'Establishing secure handshake with Citibank Sovereign Gateway...',
    'Querying Modern Treasury Ledger API for real-time routing status...',
    'Running AI-powered neural net validation on routing transit patterns...',
    'Cross-referencing global SWIFT/BIC directory & CHIPS participant list...',
    'Performing real-time OFAC, PEP, and Imperial Sanctions screening...',
    'Finalizing cryptographic validation certificate...'
  ];

  const handleValidate = async (e: React.FormEvent) => {
    e.preventDefault();
    const targetCode = activeTab === 'aba' ? routingNumber : swiftCode;
    if (!targetCode) return;

    setIsAnalyzing(true);
    setValidationResult(null);

    // Cycle through luxury AI steps
    for (let i = 0; i < analysisSteps.length; i++) {
      setAnalysisStep(analysisSteps[i]);
      await new Promise((resolve) => setTimeout(resolve, 800));
    }

    // Check database or generate a high-end mock response
    const matched = LUXURY_ROUTING_DATABASE[targetCode] || {
      bankName: activeTab === 'aba' ? 'Citibank International Private Client' : 'Imperial Global Custody Bank',
      division: 'Sovereign Wealth & Ultra-High-Net-Worth Division',
      tier: 'Tier 1 Capital Elite',
      address: '12 Place Vendôme, 75001 Paris, France',
      swift: activeTab === 'swift' ? targetCode.toUpperCase() : 'CITIXX99XXX',
      chips: '999',
      liquidityIndex: '99.99% (Sovereign Backed)',
      sanctionsStatus: 'CLEARED',
      aiConfidence: 99.95,
      modernTreasuryId: `tr_mt_sovereign_${Math.floor(Math.random() * 90000) + 10000}`
    };

    setValidationResult(matched);
    setIsAnalyzing(false);
  };

  const triggerSanctionsCheck = async () => {
    setSanctionsCheckActive(true);
    setSanctionsResult(null);
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setSanctionsResult({
      status: 'CLEARED',
      score: '0.00% Risk Index',
      databasesChecked: ['OFAC', 'EU Consolidated List', 'UN Security Council', 'Imperial High-Net-Worth Watchlist'],
      timestamp: new Date().toUTCString(),
      hash: '0x8f9a2b3c4d5e6f7a8b9c0d1e2f3a4b5c6d7e8f9a'
    });
    setSanctionsCheckActive(false);
  };

  return (
    <div className="min-h-screen bg-gradient-to-b from-black via-[#0a0d14] to-black text-white p-6 md:p-12 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Luxury Ambient Background Glows */}
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-blue-900/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />

      <div className="max-w-6xl mx-auto space-y-12">
        {/* Header Section */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-white/10 pb-8 gap-6">
          <div>
            <div className="flex items-center gap-2 text-[#D4AF37] text-xs font-semibold tracking-[0.25em] uppercase mb-2">
              <Crown className="w-4 h-4 animate-pulse" />
              Citibank Private Client × Modern Treasury AI
            </div>
            <h1 className="text-4xl md:text-5xl font-serif font-light tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-white via-slate-200 to-[#D4AF37]">
              Imperial Routing Validator
            </h1>
            <p className="text-slate-400 text-sm mt-2 max-w-xl">
              Real-time AI-powered global routing validation, SWIFT/ABA lookup, and sovereign sanctions screening for ultra-high-net-worth transactions.
            </p>
          </div>
          <div className="flex flex-col items-end text-right bg-white/5 border border-white/10 p-4 rounded-xl backdrop-blur-md">
            <span className="text-[10px] text-slate-400 uppercase tracking-widest">Sovereign Node Status</span>
            <span className="text-xs font-mono text-[#D4AF37] flex items-center gap-1.5 mt-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              Active & Secured (AES-256)
            </span>
            <span className="text-[10px] text-slate-500 mt-1">Fee Tier: Imperial Waived</span>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Interactive Lookup Form */}
          <div className="lg:col-span-7 space-y-6">
            <div className="bg-gradient-to-b from-slate-900/80 to-black/80 border border-white/10 rounded-2xl p-6 md:p-8 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-gradient-to-br from-[#D4AF37]/10 to-transparent rounded-bl-full pointer-events-none" />
              
              {/* Tabs */}
              <div className="flex border-b border-white/10 mb-6">
                <button
                  onClick={() => { setActiveTab('aba'); setValidationResult(null); }}
                  className={`pb-3 text-sm font-medium tracking-wider uppercase transition-all duration-300 mr-6 relative ${
                    activeTab === 'aba' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  ABA Routing Number
                  {activeTab === 'aba' && (
                    <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                  )}
                </button>
                <button
                  onClick={() => { setActiveTab('swift'); setValidationResult(null); }}
                  className={`pb-3 text-sm font-medium tracking-wider uppercase transition-all duration-300 mr-6 relative ${
                    activeTab === 'swift' ? 'text-[#D4AF37]' : 'text-slate-400 hover:text-white'
                  }`}
                >
                  SWIFT / BIC Code
                  {activeTab === 'swift' && (
                    <motion.div layoutId="activeTabLine" className="absolute bottom-0 left-0 right-0 h-[2px] bg-[#D4AF37]" />
                  )}
                </button>
              </div>

              {/* Form */}
              <form onSubmit={handleValidate} className="space-y-6">
                {activeTab === 'aba' ? (
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">
                      Enter 9-Digit ABA Routing Transit Number
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={9}
                        value={routingNumber}
                        onChange={(e) => setRoutingNumber(e.target.value.replace(/\D/g, ''))}
                        placeholder="e.g. 021000021 (Citibank)"
                        className="w-full bg-black/50 border border-white/10 focus:border-[#D4AF37] rounded-xl py-4 pl-12 pr-4 text-lg font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      />
                      <Landmark className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Supports real-time validation against Federal Reserve E-Payments directories.
                    </p>
                  </div>
                ) : (
                  <div>
                    <label className="block text-xs text-slate-400 uppercase tracking-widest mb-2">
                      Enter 8 or 11 Character SWIFT/BIC Code
                    </label>
                    <div className="relative">
                      <input
                        type="text"
                        maxLength={11}
                        value={swiftCode}
                        onChange={(e) => setSwiftCode(e.target.value.toUpperCase())}
                        placeholder="e.g. CITIUS33XXX"
                        className="w-full bg-black/50 border border-white/10 focus:border-[#D4AF37] rounded-xl py-4 pl-12 pr-4 text-lg font-mono tracking-widest text-white placeholder-slate-600 focus:outline-none focus:ring-1 focus:ring-[#D4AF37] transition-all"
                      />
                      <Globe className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" />
                    </div>
                    <p className="text-[11px] text-slate-500 mt-2">
                      Validates against SWIFT Ref directories with AI-assisted branch resolution.
                    </p>
                  </div>
                )}

                {/* Action Button */}
                <button
                  type="submit"
                  disabled={isAnalyzing || (activeTab === 'aba' ? !routingNumber : !swiftCode)}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-amber-200 to-[#D4AF37] rounded-xl" />
                  <div className="px-8 py-4 rounded-[11px] bg-black transition-all duration-200 group-hover:bg-black/90 relative flex items-center justify-center gap-2">
                    <Sparkles className="w-5 h-5 text-[#D4AF37]" />
                    <span className="text-sm font-semibold tracking-wider text-white uppercase">
                      {isAnalyzing ? 'Executing AI Validation...' : 'Initiate Imperial Validation'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-1 transition-transform" />
                  </div>
                </button>
              </form>

              {/* AI Analysis Progress Overlay */}
              <AnimatePresence>
                {isAnalyzing && (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="absolute inset-0 bg-black/95 backdrop-blur-md flex flex-col items-center justify-center p-6 text-center z-20"
                  >
                    <div className="relative mb-6">
                      <div className="w-20 h-20 rounded-full border-2 border-[#D4AF37]/20 border-t-[#D4AF37] animate-spin" />
                      <Cpu className="w-8 h-8 text-[#D4AF37] absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <h3 className="text-lg font-serif text-white mb-2">AI Sovereign Verification in Progress</h3>
                    <p className="text-xs font-mono text-[#D4AF37] max-w-md h-12">
                      {analysisStep}
                    </p>
                    <div className="w-48 h-[2px] bg-white/10 mt-4 rounded-full overflow-hidden">
                      <motion.div 
                        initial={{ width: 0 }}
                        animate={{ width: '100%' }}
                        transition={{ duration: 4.8, ease: 'linear' }}
                        className="h-full bg-gradient-to-r from-[#D4AF37] to-amber-200"
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            {/* Quick Select Luxury Presets */}
            <div className="bg-white/5 border border-white/10 rounded-xl p-4">
              <span className="text-[10px] text-slate-400 uppercase tracking-widest block mb-3">
                Imperial Presets (Citibank Private Client & Partners)
              </span>
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <button
                  onClick={() => { setRoutingNumber('021000021'); setActiveTab('aba'); }}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-[#D4AF37]/50 transition-all text-left"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">Citibank N.A.</div>
                    <div className="text-[10px] font-mono text-slate-400">021000021</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => { setRoutingNumber('021000089'); setActiveTab('aba'); }}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-[#D4AF37]/50 transition-all text-left"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">Chase Private</div>
                    <div className="text-[10px] font-mono text-slate-400">021000089</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
                <button
                  onClick={() => { setRoutingNumber('121000248'); setActiveTab('aba'); }}
                  className="flex items-center justify-between p-3 rounded-lg bg-black/40 border border-white/5 hover:border-[#D4AF37]/50 transition-all text-left"
                >
                  <div>
                    <div className="text-xs font-semibold text-white">Wells Fargo Wealth</div>
                    <div className="text-[10px] font-mono text-slate-400">121000248</div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-slate-500" />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Validation Results & Sanctions */}
          <div className="lg:col-span-5 space-y-6">
            <AnimatePresence mode="wait">
              {validationResult ? (
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="space-y-6"
                >
                  {/* Bank Address Card */}
                  <div className="bg-gradient-to-b from-slate-900 to-black border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                    <div className="absolute top-0 right-0 bg-[#D4AF37]/10 text-[#D4AF37] text-[10px] font-mono px-3 py-1 rounded-bl-lg border-l border-b border-[#D4AF37]/20">
                      AI CONFIDENCE: {validationResult.aiConfidence}%
                    </div>

                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/30">
                        <Building className="w-6 h-6 text-[#D4AF37]" />
                      </div>
                      <div>
                        <h3 className="text-lg font-serif text-white">{validationResult.bankName}</h3>
                        <p className="text-xs text-slate-400">{validationResult.division}</p>
                      </div>
                    </div>

                    <div className="space-y-4 border-t border-white/10 pt-4">
                      <div>
                        <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Sovereign Address</span>
                        <span className="text-xs text-white font-medium">{validationResult.address}</span>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">SWIFT/BIC</span>
                          <span className="text-xs font-mono text-[#D4AF37]">{validationResult.swift}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">CHIPS UID</span>
                          <span className="text-xs font-mono text-white">{validationResult.chips}</span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 gap-4">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Capital Tier</span>
                          <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                            <ShieldCheck className="w-3.5 h-3.5" />
                            {validationResult.tier}
                          </span>
                        </div>
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase tracking-widest block">Liquidity Index</span>
                          <span className="text-xs text-white font-medium">{validationResult.liquidityIndex}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Treasury Integration Card */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Coins className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-white">Modern Treasury Ledger Sync</span>
                      </div>
                      <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                        Synchronized
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      This routing endpoint is fully mapped to Modern Treasury's high-volume ledger system. Ready for instant programmatic wire and ACH initiation.
                    </p>
                    <div className="bg-black/50 p-3 rounded-lg border border-white/5 font-mono text-[11px] text-slate-300 flex justify-between items-center">
                      <span>LEDGER_ID:</span>
                      <span className="text-[#D4AF37]">{validationResult.modernTreasuryId}</span>
                    </div>
                  </div>

                  {/* Sanctions List Checking */}
                  <div className="bg-white/5 border border-white/10 rounded-2xl p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center gap-2">
                        <Lock className="w-5 h-5 text-[#D4AF37]" />
                        <span className="text-xs font-semibold uppercase tracking-wider text-white">Sovereign Sanctions Shield</span>
                      </div>
                      <span className="text-[10px] text-slate-400">AI-Neural Screening</span>
                    </div>

                    {!sanctionsResult ? (
                      <button
                        onClick={triggerSanctionsCheck}
                        disabled={sanctionsCheckActive}
                        className="w-full py-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-xs font-medium tracking-wider uppercase transition-all flex items-center justify-center gap-2"
                      >
                        {sanctionsCheckActive ? (
                          <>
                            <span className="w-4 h-4 border-2 border-[#D4AF37]/20 border-t-[#D4AF37] rounded-full animate-spin" />
                            Scanning Global Watchlists...
                          </>
                        ) : (
                          <>
                            <Fingerprint className="w-4 h-4 text-[#D4AF37]" />
                            Run Sovereign Sanctions Check
                          </>
                        )}
                      </button>
                    ) : (
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl">
                          <div className="flex items-center gap-2">
                            <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                            <span className="text-xs font-semibold text-emerald-400">PASSED SANCTIONS SCREENING</span>
                          </div>
                          <span className="text-xs font-mono text-emerald-400">{sanctionsResult.score}</span>
                        </div>
                        <div className="text-[11px] text-slate-400 space-y-1">
                          <div><span className="text-slate-500">Databases Checked:</span> {sanctionsResult.databasesChecked.join(', ')}</div>
                          <div><span className="text-slate-500">Timestamp:</span> {sanctionsResult.timestamp}</div>
                          <div className="font-mono text-[9px] text-slate-600 truncate"><span className="text-slate-500">Hash:</span> {sanctionsResult.hash}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              ) : (
                <div className="h-full flex flex-col items-center justify-center text-center p-8 bg-white/5 border border-white/10 rounded-2xl border-dashed">
                  <Compass className="w-12 h-12 text-slate-600 mb-4 animate-pulse" />
                  <h3 className="text-lg font-serif text-slate-300 mb-1">Awaiting Imperial Validation</h3>
                  <p className="text-xs text-slate-500 max-w-xs">
                    Enter an ABA routing number or SWIFT code to initiate high-end AI validation and sovereign compliance checks.
                  </p>
                </div>
              )}
            </AnimatePresence>
          </div>

        </div>

        {/* Footer / Luxury Disclaimer */}
        <div className="border-t border-white/10 pt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
            <span>Secured by Citibank Sovereign Cryptographic Protocol</span>
          </div>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-white transition-colors">Imperial Terms</a>
            <a href="#privacy" className="hover:text-white transition-colors">Sovereign Privacy</a>
            <a href="#support" className="hover:text-white transition-colors">Private Concierge</a>
          </div>
        </div>
      </div>
    </div>
  );
}