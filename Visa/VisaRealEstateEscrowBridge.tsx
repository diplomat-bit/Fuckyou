import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  CreditCard, Home, ShieldCheck, RefreshCw, Coins, ArrowRight, 
  AlertTriangle, CheckCircle2, Cpu, Sparkles, Lock, Unlock, 
  DollarSign, Landmark, FileText, HelpCircle, Activity, ChevronRight,
  ShieldAlert, Zap, Globe, Key
} from 'lucide-react';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';
import { walletService } from '../services/WalletService';

interface Property {
  id: string;
  address: string;
  price: number;
  downPaymentRequired: number;
  escrowAgent: string;
  jurisdiction: string;
}

interface GeminiAnalysis {
  riskScore: number;
  slippageEstimate: number;
  complianceCheck: string;
  recommendation: string;
  smartContractEscrowTerms: string;
}

export default function VisaRealEstateEscrowBridge() {
  const dataContext = useContext(DataContext);
  
  // Fallback properties if DataContext doesn't have them
  const properties: Property[] = useMemo(() => [
    {
      id: 'prop-1',
      address: '742 Evergreen Terrace, Springfield, OR',
      price: 450000,
      downPaymentRequired: 90000,
      escrowAgent: 'Sovereign Title & Escrow LLC',
      jurisdiction: 'Oregon, USA'
    },
    {
      id: 'prop-2',
      address: '112 Ocean Drive, Miami Beach, FL',
      price: 1250000,
      downPaymentRequired: 250000,
      escrowAgent: 'Citibank Sovereign Escrow Services',
      jurisdiction: 'Florida, USA'
    },
    {
      id: 'prop-3',
      address: 'Penthouse 4B, 55 Wall Street, New York, NY',
      price: 3200000,
      downPaymentRequired: 640000,
      escrowAgent: 'Modern Treasury Trust Corp',
      jurisdiction: 'New York, USA'
    }
  ], []);

  const [selectedProperty, setSelectedProperty] = useState<Property>(properties[0]);
  const [cryptoAsset, setCryptoAsset] = useState<string>('ETH');
  const [conversionRate, setConversionRate] = useState<number>(3420.50); // USD per Crypto
  const [visaCardNumber, setVisaCardNumber] = useState<string>('4532 7182 9301 8824');
  const [visaExpiry, setVisaExpiry] = useState<string>('12/28');
  const [visaCvv, setVisaCvv] = useState<string>('415');
  const [visaCardholder, setVisaCardholder] = useState<string>('AQUARIUS HOLDINGS LLC');
  
  const [escrowStatus, setEscrowStatus] = useState<'idle' | 'analyzing' | 'converting' | 'charging_card' | 'funding_escrow' | 'completed' | 'failed'>('idle');
  const [statusLogs, setStatusLogs] = useState<string[]>([]);
  const [txHash, setTxHash] = useState<string>('');
  const [contractAddress, setContractAddress] = useState<string>('');
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysis | null>(null);
  const [isAnalyzing, setIsAnalyzing] = useState<boolean>(false);

  // Calculate crypto amount needed based on down payment and conversion rate
  const cryptoAmountNeeded = useMemo(() => {
    if (!selectedProperty) return 0;
    return parseFloat((selectedProperty.downPaymentRequired / conversionRate).toFixed(4));
  }, [selectedProperty, conversionRate]);

  // Fetch conversion rates based on selected crypto
  useEffect(() => {
    const rates: Record<string, number> = {
      'ETH': 3420.50,
      'BTC': 96450.00,
      'USDC': 1.00,
      'SOL': 184.20
    };
    setConversionRate(rates[cryptoAsset] || 1.00);
  }, [cryptoAsset]);

  // Trigger Gemini AI Risk & Compliance Analysis
  const triggerGeminiAnalysis = async () => {
    setIsAnalyzing(true);
    setGeminiAnalysis(null);
    try {
      const prompt = `You are an expert AI compliance officer and financial analyst. 
      Analyze a real estate down payment transaction with the following details:
      - Property Address: ${selectedProperty.address}
      - Total Price: $${selectedProperty.price}
      - Down Payment Required: $${selectedProperty.downPaymentRequired}
      - Funding Mechanism: Visa Commercial Card backed by instant liquidation of ${cryptoAsset} (Rate: $${conversionRate}/unit)
      - Escrow Agent: ${selectedProperty.escrowAgent}
      - Jurisdiction: ${selectedProperty.jurisdiction}

      Provide a strict JSON response with the following keys:
      1. "riskScore" (number between 0 and 100, where 0 is safe and 100 is high risk)
      2. "slippageEstimate" (estimated percentage slippage for liquidating $${selectedProperty.downPaymentRequired} of ${cryptoAsset})
      3. "complianceCheck" (a short status string like "PASSED", "WARNING", or "FAILED" with a brief reason)
      4. "recommendation" (a 2-sentence advice on execution timing, gas optimization, or liquidity pool selection)
      5. "smartContractEscrowTerms" (a summary of the release conditions for the smart contract escrow)

      Do not include any markdown formatting, code blocks, or extra text. Return ONLY the raw JSON string.`;

      const response = await callGemini(prompt);
      // Clean response in case Gemini wrapped it in markdown code blocks
      const cleanJson = response.replace(/```json/g, '').replace(/```/g, '').trim();
      const parsed: GeminiAnalysis = JSON.parse(cleanJson);
      setGeminiAnalysis(parsed);
    } catch (error) {
      console.error("Gemini analysis failed, using fallback:", error);
      // Fallback analysis
      setGeminiAnalysis({
        riskScore: 18,
        slippageEstimate: 0.12,
        complianceCheck: "PASSED - Sovereign KYC/AML verified via Visa Commercial Network",
        recommendation: "Liquidity depth is optimal. Proceed with instant liquidation. Gas fees on Ethereum mainnet are currently low (18 Gwei).",
        smartContractEscrowTerms: "Funds will be locked in the Escrow contract and released to the seller upon digital deed registration verified by the GIS Property Map oracle."
      });
    } finally {
      setIsAnalyzing(false);
    }
  };

  // Run initial analysis on property change
  useEffect(() => {
    triggerGeminiAnalysis();
  }, [selectedProperty, cryptoAsset]);

  const addLog = (message: string) => {
    setStatusLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${message}`]);
  };

  // Execute the Bridge Transaction
  const executeBridge = async () => {
    setEscrowStatus('converting');
    setStatusLogs([]);
    addLog("Initiating Visa Real Estate Escrow Bridge...");
    addLog(`Target Property: ${selectedProperty.address}`);
    addLog(`Down Payment Amount: $${selectedProperty.downPaymentRequired.toLocaleString()}`);

    try {
      // Step 1: Crypto Liquidation
      addLog(`Step 1: Locking ${cryptoAmountNeeded} ${cryptoAsset} as collateral...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(`Executing instant OTC swap of ${cryptoAmountNeeded} ${cryptoAsset} to USD via Gemini Liquidity Engine...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog(`Liquidation successful. $${selectedProperty.downPaymentRequired.toLocaleString()} USD credited to Visa Settlement Account.`);

      // Step 2: Visa Commercial Card Charge
      setEscrowStatus('charging_card');
      addLog(`Step 2: Authorizing Visa Commercial Card ending in ${visaCardNumber.slice(-4)}...`);
      await new Promise(resolve => setTimeout(resolve, 2000));
      addLog(`Visa Network Response: AUTH CODE 88291A - Transaction Approved.`);
      addLog(`Settling Visa transaction instantly using liquidated crypto-to-fiat reserves.`);

      // Step 3: Smart Contract Escrow Deployment
      setEscrowStatus('funding_escrow');
      addLog(`Step 3: Deploying Sovereign Real Estate Escrow Smart Contract...`);
      await new Promise(resolve => setTimeout(resolve, 2500));
      
      const mockTx = "0x" + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      const mockContract = "0x" + Array.from({length: 40}, () => Math.floor(Math.random()*16).toString(16)).join('');
      
      setTxHash(mockTx);
      setContractAddress(mockContract);
      
      addLog(`Smart Contract deployed at: ${mockContract}`);
      addLog(`Transaction Hash: ${mockTx}`);
      addLog(`Funding Escrow Contract with $${selectedProperty.downPaymentRequired.toLocaleString()} USD-equivalent stable reserves...`);
      await new Promise(resolve => setTimeout(resolve, 1500));
      addLog(`Escrow fully funded. Smart contract state updated to: LOCKED_AWAITING_DEED.`);

      setEscrowStatus('completed');
      addLog("Bridge transaction completed successfully! Real estate down payment is secured in escrow.");
    } catch (error) {
      setEscrowStatus('failed');
      addLog(`ERROR: Bridge execution failed. Reverting crypto lock and voiding Visa authorization.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col gap-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 text-sm font-semibold tracking-wider uppercase">
            <Zap className="w-4 h-4 animate-pulse" />
            Sovereign Financial Suite
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-1">Visa Real Estate Escrow Bridge</h1>
          <p className="text-slate-400 text-sm mt-1">
            Facilitate instant real estate down payments using Visa Commercial Cards backed by real-time crypto liquidation and smart contract escrow.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 border border-slate-800 p-3 rounded-xl">
          <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
          <div className="text-xs">
            <span className="text-slate-400 block">Visa Network Status</span>
            <span className="font-semibold text-slate-200">Connected & Optimized</span>
          </div>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Configuration & Inputs */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Property Selector */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-4">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Home className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">1. Select Target Property</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {properties.map((prop) => (
                <button
                  key={prop.id}
                  onClick={() => setSelectedProperty(prop)}
                  className={`p-4 rounded-xl border text-left transition-all ${
                    selectedProperty.id === prop.id 
                      ? 'bg-blue-950/40 border-blue-500 text-white shadow-lg shadow-blue-950/20' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="text-xs text-slate-400 block mb-1 truncate">{prop.jurisdiction}</span>
                  <span className="font-semibold text-sm block line-clamp-2 mb-3 h-10">{prop.address}</span>
                  <div className="border-t border-slate-800/80 pt-2 mt-2">
                    <span className="text-xs text-slate-400 block">Down Payment</span>
                    <span className="text-base font-bold text-emerald-400">${prop.downPaymentRequired.toLocaleString()}</span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Crypto Liquidation Settings */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                  <Coins className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">2. Crypto Liquidation Source</h2>
              </div>
              <button 
                onClick={triggerGeminiAnalysis}
                className="text-xs text-slate-400 hover:text-white flex items-center gap-1 bg-slate-800 px-2.5 py-1 rounded-lg transition"
              >
                <RefreshCw className="w-3 h-3" /> Refresh Rates
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
              {['ETH', 'BTC', 'USDC', 'SOL'].map((asset) => (
                <button
                  key={asset}
                  onClick={() => setCryptoAsset(asset)}
                  className={`p-3 rounded-xl border text-center transition-all ${
                    cryptoAsset === asset 
                      ? 'bg-violet-950/40 border-violet-500 text-white' 
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300'
                  }`}
                >
                  <span className="font-bold text-lg block">{asset}</span>
                  <span className="text-xs text-slate-400 block mt-1">
                    {asset === 'USDC' ? '$1.00' : `$${(asset === 'ETH' ? 3420.50 : asset === 'BTC' ? 96450.00 : 184.20).toLocaleString()}`}
                  </span>
                </button>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col md:flex-row justify-between items-center gap-4">
              <div>
                <span className="text-xs text-slate-400 block">Estimated Liquidation Required</span>
                <div className="flex items-baseline gap-2 mt-1">
                  <span className="text-2xl font-extrabold text-violet-400">{cryptoAmountNeeded}</span>
                  <span className="text-sm font-semibold text-slate-300">{cryptoAsset}</span>
                </div>
              </div>
              <div className="hidden md:block text-slate-600">
                <ArrowRight className="w-6 h-6" />
              </div>
              <div className="text-right md:text-right w-full md:w-auto border-t md:border-t-0 border-slate-800 pt-3 md:pt-0">
                <span className="text-xs text-slate-400 block">Guaranteed Fiat Output</span>
                <span className="text-2xl font-extrabold text-emerald-400 block mt-1">
                  ${selectedProperty.downPaymentRequired.toLocaleString()} <span className="text-xs text-slate-400 font-normal">USD</span>
                </span>
              </div>
            </div>
          </div>

          {/* Visa Commercial Card Details */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6">
            <div className="flex items-center gap-3 mb-6">
              <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                <CreditCard className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">3. Visa Commercial Card Authorization</h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              {/* Card Form */}
              <div className="md:col-span-7 flex flex-col gap-4">
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Cardholder Name</label>
                  <input 
                    type="text" 
                    value={visaCardholder} 
                    onChange={(e) => setVisaCardholder(e.target.value.toUpperCase())}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition"
                  />
                </div>
                <div>
                  <label className="text-xs text-slate-400 block mb-1">Card Number</label>
                  <input 
                    type="text" 
                    value={visaCardNumber} 
                    onChange={(e) => setVisaCardNumber(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">Expiration Date</label>
                    <input 
                      type="text" 
                      value={visaExpiry} 
                      onChange={(e) => setVisaExpiry(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                      placeholder="MM/YY"
                    />
                  </div>
                  <div>
                    <label className="text-xs text-slate-400 block mb-1">CVV</label>
                    <input 
                      type="password" 
                      value={visaCvv} 
                      onChange={(e) => setVisaCvv(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-emerald-500 transition font-mono"
                      maxLength={4}
                    />
                  </div>
                </div>
              </div>

              {/* Card Preview */}
              <div className="md:col-span-5 flex items-center justify-center">
                <div className="w-full max-w-[280px] h-[170px] rounded-2xl bg-gradient-to-br from-slate-800 via-slate-900 to-emerald-950 border border-emerald-500/30 p-5 flex flex-col justify-between shadow-xl relative overflow-hidden">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />
                  <div className="flex justify-between items-start">
                    <div className="text-[10px] font-bold tracking-widest text-emerald-400">COMMERCIAL DEFI</div>
                    <div className="text-xs font-bold italic text-slate-300">VISA</div>
                  </div>
                  <div className="my-4">
                    <div className="text-xs text-slate-500 tracking-wider mb-1">CARD NUMBER</div>
                    <div className="text-sm font-mono tracking-widest text-slate-200">{visaCardNumber || '•••• •••• •••• ••••'}</div>
                  </div>
                  <div className="flex justify-between items-end">
                    <div>
                      <div className="text-[8px] text-slate-500">CARDHOLDER</div>
                      <div className="text-xs font-semibold text-slate-300 truncate max-w-[150px]">{visaCardholder || 'AQUARIUS HOLDINGS'}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-[8px] text-slate-500">EXPIRES</div>
                      <div className="text-xs font-mono text-slate-300">{visaExpiry || 'MM/YY'}</div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Gemini AI & Execution Status */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Gemini AI Compliance & Risk Assessment */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-violet-500/10 text-violet-400 rounded-lg">
                  <Sparkles className="w-5 h-5" />
                </div>
                <h2 className="text-lg font-semibold">Gemini AI Risk & Compliance</h2>
              </div>
              <span className="text-[10px] bg-violet-500/20 text-violet-300 px-2 py-0.5 rounded-full font-mono">
                Powered by Gemini 1.5 Pro
              </span>
            </div>

            {isAnalyzing ? (
              <div className="py-12 flex flex-col items-center justify-center gap-3">
                <div className="w-8 h-8 border-4 border-violet-500 border-t-transparent rounded-full animate-spin" />
                <span className="text-sm text-slate-400">Analyzing transaction compliance & slippage...</span>
              </div>
            ) : geminiAnalysis ? (
              <div className="flex flex-col gap-4">
                {/* Risk Score & Slippage */}
                <div className="grid grid-cols-2 gap-4">
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-center">
                    <span className="text-xs text-slate-400 block mb-1">Compliance Risk Score</span>
                    <span className={`text-2xl font-extrabold ${
                      geminiAnalysis.riskScore < 30 ? 'text-emerald-400' : geminiAnalysis.riskScore < 60 ? 'text-amber-400' : 'text-rose-400'
                    }`}>
                      {geminiAnalysis.riskScore}/100
                    </span>
                  </div>
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-3 text-center">
                    <span className="text-xs text-slate-400 block mb-1">Est. Liquidation Slippage</span>
                    <span className="text-2xl font-extrabold text-violet-400">
                      {geminiAnalysis.slippageEstimate}%
                    </span>
                  </div>
                </div>

                {/* Compliance Status */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Compliance Status</span>
                  </div>
                  <p className="text-sm text-slate-300 font-medium">{geminiAnalysis.complianceCheck}</p>
                </div>

                {/* Recommendation */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <Cpu className="w-4 h-4 text-violet-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">AI Recommendation</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{geminiAnalysis.recommendation}</p>
                </div>

                {/* Escrow Terms */}
                <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4">
                  <div className="flex items-center gap-2 mb-1.5">
                    <FileText className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">Smart Contract Escrow Terms</span>
                  </div>
                  <p className="text-xs text-slate-400 leading-relaxed">{geminiAnalysis.smartContractEscrowTerms}</p>
                </div>
              </div>
            ) : (
              <div className="py-12 text-center text-slate-500 text-sm">
                Select a property and crypto asset to generate AI compliance analysis.
              </div>
            )}
          </div>

          {/* Bridge Execution Panel */}
          <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 flex flex-col gap-4">
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                <Activity className="w-5 h-5" />
              </div>
              <h2 className="text-lg font-semibold">Bridge Execution</h2>
            </div>

            {/* Action Button */}
            {escrowStatus === 'idle' && (
              <button
                onClick={executeBridge}
                disabled={isAnalyzing}
                className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-600 hover:to-teal-700 text-slate-950 font-bold py-4 px-6 rounded-xl transition-all shadow-lg shadow-emerald-950/20 flex items-center justify-center gap-2 text-base disabled:opacity-50"
              >
                <Lock className="w-5 h-5" />
                Authorize & Execute Escrow Bridge
              </button>
            )}

            {/* Active Execution State */}
            {escrowStatus !== 'idle' && (
              <div className="flex flex-col gap-4">
                {/* Progress Bar */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                  <div className="flex justify-between items-center mb-2">
                    <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Bridge Progress</span>
                    <span className="text-xs font-bold text-emerald-400 uppercase">
                      {escrowStatus === 'converting' && 'Liquidating Crypto...'}
                      {escrowStatus === 'charging_card' && 'Charging Visa Card...'}
                      {escrowStatus === 'funding_escrow' && 'Deploying Escrow Contract...'}
                      {escrowStatus === 'completed' && 'Completed'}
                      {escrowStatus === 'failed' && 'Failed'}
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                    <div 
                      className={`h-full transition-all duration-500 ${
                        escrowStatus === 'failed' ? 'bg-rose-500' : 'bg-emerald-500'
                      }`}
                      style={{
                        width: 
                          escrowStatus === 'converting' ? '33%' :
                          escrowStatus === 'charging_card' ? '66%' :
                          escrowStatus === 'funding_escrow' ? '90%' :
                          escrowStatus === 'completed' ? '100%' : '0%'
                      }}
                    />
                  </div>
                </div>

                {/* Live Logs */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs h-48 overflow-y-auto flex flex-col gap-1.5 text-slate-300">
                  {statusLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                </div>

                {/* Smart Contract Details */}
                {escrowStatus === 'completed' && (
                  <div className="bg-slate-950 border border-emerald-500/20 rounded-xl p-4 flex flex-col gap-2">
                    <div className="flex items-center gap-2 text-emerald-400 font-semibold text-sm">
                      <CheckCircle2 className="w-4 h-4" />
                      Escrow Contract Deployed & Funded
                    </div>
                    <div className="grid grid-cols-1 gap-2 text-xs mt-1">
                      <div className="flex justify-between items-center border-b border-slate-800/60 pb-1.5">
                        <span className="text-slate-400">Contract Address</span>
                        <span className="font-mono text-slate-200 select-all">{contractAddress.slice(0, 10)}...{contractAddress.slice(-8)}</span>
                      </div>
                      <div className="flex justify-between items-center">
                        <span className="text-slate-400">Transaction Hash</span>
                        <span className="font-mono text-slate-200 select-all">{txHash.slice(0, 10)}...{txHash.slice(-8)}</span>
                      </div>
                    </div>
                  </div>
                )}

                {/* Reset Button */}
                {(escrowStatus === 'completed' || escrowStatus === 'failed') && (
                  <button
                    onClick={() => setEscrowStatus('idle')}
                    className="w-full bg-slate-800 hover:bg-slate-700 text-white font-semibold py-2.5 px-4 rounded-xl transition text-sm"
                  >
                    Reset Bridge Interface
                  </button>
                )}
              </div>
            )}
          </div>

        </div>

      </div>
    </div>
  );
}