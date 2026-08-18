import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  CreditCard, 
  Zap, 
  ShieldCheck, 
  AlertTriangle, 
  RefreshCw, 
  TrendingDown, 
  DollarSign, 
  ArrowRight, 
  Activity, 
  Cpu, 
  CheckCircle2, 
  Lock, 
  Coins, 
  User, 
  FileText, 
  ShieldAlert,
  ChevronRight,
  Sparkles,
  Check,
  X
} from 'lucide-react';

interface TransactionLog {
  timestamp: string;
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

const CRYPTO_PRICES: Record<string, number> = {
  BTC: 67420.50,
  ETH: 3485.20,
  SOL: 142.80,
  USDC: 1.00,
};

export default function VisaDirectSettlementEngine() {
  // Form States
  const [cryptoAsset, setCryptoAsset] = useState<string>('BTC');
  const [liquidationAmount, setLiquidationAmount] = useState<string>('0.5');
  const [cardNumber, setCardNumber] = useState<string>('4000123456789010');
  const [cardholderName, setCardholderName] = useState<string>('Sovereign Citizen');
  const [cardExpiry, setCardExpiry] = useState<string>('12/28');
  const [cardCvv, setCardCvv] = useState<string>('123');

  // Engine States
  const [settlementStatus, setSettlementStatus] = useState<'idle' | 'assessing' | 'liquidating' | 'settling' | 'completed' | 'failed'>('idle');
  const [riskScore, setRiskScore] = useState<number | null>(null);
  const [riskDecision, setRiskDecision] = useState<'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' | null>(null);
  const [riskAnalysis, setRiskAnalysis] = useState<string>('');
  const [visaTxId, setVisaTxId] = useState<string | null>(null);
  const [liquidationHash, setLiquidationHash] = useState<string | null>(null);
  const [logs, setLogs] = useState<TransactionLog[]>([]);

  // Calculate estimated fiat value
  const estimatedFiat = useMemo(() => {
    const amt = parseFloat(liquidationAmount) || 0;
    const price = CRYPTO_PRICES[cryptoAsset] || 0;
    return (amt * price).toFixed(2);
  }, [cryptoAsset, liquidationAmount]);

  // Add log helper
  const addLog = useCallback((message: string, type: 'info' | 'success' | 'warning' | 'error' = 'info') => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [{ timestamp, message, type }, ...prev]);
  }, []);

  // Initialize with system logs
  useEffect(() => {
    addLog('Visa Direct Settlement Engine initialized.', 'info');
    addLog('Gemini Risk Assessment Model v2.5 connected.', 'success');
    addLog('Crypto Liquidation Bridge: Active (AstraDB & Alpaca Liquidity Pools).', 'info');
  }, [addLog]);

  // Format card number for display
  const maskedCard = useMemo(() => {
    if (!cardNumber) return '•••• •••• •••• ••••';
    const cleaned = cardNumber.replace(/\s+/g, '');
    if (cleaned.length < 16) return cleaned;
    return `•••• •••• •••• ${cleaned.slice(-4)}`;
  }, [cardNumber]);

  // Run Gemini Risk Assessment
  const runRiskAssessment = async () => {
    setSettlementStatus('assessing');
    addLog(`Initiating Gemini Risk Assessment for ${cardholderName}...`, 'info');
    
    try {
      // Simulate API call to Gemini-based risk endpoint
      await new Promise(resolve => setTimeout(resolve, 2200));
      
      // Mocking Gemini's structured response based on input parameters
      const isHighRiskAmount = parseFloat(estimatedFiat) > 50000;
      const isSuspiciousCard = cardNumber.startsWith('4111'); // Mock trigger
      
      let score = 12;
      let decision: 'APPROVED' | 'REJECTED' | 'MANUAL_REVIEW' = 'APPROVED';
      let analysis = '';

      if (isHighRiskAmount) {
        score = 68;
        decision = 'MANUAL_REVIEW';
        analysis = 'Gemini Risk Engine detected a high-value liquidation transaction. While the cardholder identity matches the sovereign ledger, the transaction size exceeds standard real-time push limits. Recommended for manual compliance override or multi-signature authorization.';
      } else if (isSuspiciousCard) {
        score = 89;
        decision = 'REJECTED';
        analysis = 'Gemini Risk Engine flagged this transaction due to card bin mismatch and potential velocity anomalies. The destination debit card has been associated with high-frequency liquidations within the last 24 hours. Settlement blocked.';
      } else {
        score = 8;
        decision = 'APPROVED';
        analysis = 'Gemini Risk Engine verified the transaction as LOW RISK. Cardholder name matches the authenticated Web3 wallet signature. Destination card supports Visa Fast Funds (Visa Direct). Liquidation and push-to-card settlement approved.';
      }

      setRiskScore(score);
      setRiskDecision(decision);
      setRiskAnalysis(analysis);

      if (decision === 'APPROVED') {
        addLog(`Gemini Risk Assessment: APPROVED (Score: ${score}/100)`, 'success');
        return true;
      } else if (decision === 'MANUAL_REVIEW') {
        addLog(`Gemini Risk Assessment: MANUAL REVIEW REQUIRED (Score: ${score}/100)`, 'warning');
        setSettlementStatus('idle');
        return false;
      } else {
        addLog(`Gemini Risk Assessment: REJECTED (Score: ${score}/100) - ${analysis}`, 'error');
        setSettlementStatus('failed');
        return false;
      }
    } catch (error) {
      addLog('Risk assessment failed due to network timeout.', 'error');
      setSettlementStatus('failed');
      return false;
    }
  };

  // Execute Liquidation and Visa Direct Push
  const executeSettlement = async () => {
    const approved = await runRiskAssessment();
    if (!approved) return;

    // Step 2: Crypto Liquidation
    setSettlementStatus('liquidating');
    addLog(`Liquidating ${liquidationAmount} ${cryptoAsset} via integrated liquidity pools...`, 'info');
    
    try {
      await new Promise(resolve => setTimeout(resolve, 2000));
      const mockHash = '0x' + Array.from({length: 64}, () => Math.floor(Math.random()*16).toString(16)).join('');
      setLiquidationHash(mockHash);
      addLog(`Crypto liquidated successfully. Tx Hash: ${mockHash.slice(0, 10)}...${mockHash.slice(-8)}`, 'success');
      addLog(`Converted ${liquidationAmount} ${cryptoAsset} to $${estimatedFiat} USD.`, 'info');

      // Step 3: Visa Direct Push-to-Card
      setSettlementStatus('settling');
      addLog(`Initiating Visa Direct Push Payment (Acquirer Reference Number generation)...`, 'info');
      
      await new Promise(resolve => setTimeout(resolve, 2500));
      const mockVisaTx = 'VSD-' + Math.floor(100000000 + Math.random() * 900000000);
      setVisaTxId(mockVisaTx);
      
      addLog(`Visa Direct Push Payment Successful. Ref ID: ${mockVisaTx}`, 'success');
      addLog(`Funds successfully pushed to debit card ending in ${cardNumber.slice(-4)}.`, 'success');
      
      setSettlementStatus('completed');
    } catch (error) {
      addLog('Settlement failed during execution phase.', 'error');
      setSettlementStatus('failed');
    }
  };

  const resetEngine = () => {
    setSettlementStatus('idle');
    setRiskScore(null);
    setRiskDecision(null);
    setRiskAnalysis('');
    setVisaTxId(null);
    setLiquidationHash(null);
    addLog('Engine reset. Ready for next liquidation request.', 'info');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between font-sans">
      {/* Header */}
      <header className="border-b border-slate-800 pb-4 mb-6 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <CreditCard className="w-3 h-3" /> VISA DIRECT
            </span>
            <span className="bg-purple-600 text-white text-xs font-bold px-2.5 py-1 rounded-full flex items-center gap-1">
              <Sparkles className="w-3 h-3" /> GEMINI AI
            </span>
          </div>
          <h1 className="text-2xl font-extrabold tracking-tight mt-1 text-white flex items-center gap-2">
            Visa Direct Real-Time Settlement Engine
          </h1>
          <p className="text-slate-400 text-sm mt-0.5">
            Push crypto liquidation proceeds directly to debit cards with real-time AI risk mitigation.
          </p>
        </div>
        <div className="flex items-center gap-3 bg-slate-900 p-2.5 rounded-lg border border-slate-800">
          <div className="text-right">
            <div className="text-xs text-slate-400">System Status</div>
            <div className="text-sm font-bold text-emerald-400 flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> Operational
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-6 items-start">
        
        {/* Left Column: Input Form & Card Preview */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Card Preview */}
          <div className="relative bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 p-6 rounded-2xl border border-blue-900/50 shadow-2xl overflow-hidden group">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-600/10 rounded-full blur-3xl -mr-12 -mt-12"></div>
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-purple-600/10 rounded-full blur-3xl -ml-12 -mb-12"></div>
            
            <div className="relative z-10 flex flex-col justify-between h-44">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-[10px] uppercase tracking-widest text-blue-400 font-semibold">Sovereign Settlement Card</p>
                  <h3 className="text-lg font-bold text-white mt-1">{cardholderName || 'Sovereign Citizen'}</h3>
                </div>
                <div className="bg-white/10 px-3 py-1 rounded-md backdrop-blur-sm text-xs font-mono text-white border border-white/10">
                  Visa Direct
                </div>
              </div>

              <div className="my-4">
                <p className="text-xs text-slate-400 font-mono mb-1">Card Number</p>
                <p className="text-xl font-mono tracking-widest text-white font-bold">
                  {maskedCard}
                </p>
              </div>

              <div className="flex justify-between items-end">
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">Expiry</p>
                  <p className="text-sm font-mono text-white font-semibold">{cardExpiry || 'MM/YY'}</p>
                </div>
                <div>
                  <p className="text-[9px] uppercase tracking-wider text-slate-400">CVV</p>
                  <p className="text-sm font-mono text-white font-semibold">{cardCvv || '•••'}</p>
                </div>
                <div className="text-right">
                  <span className="text-xs font-bold italic text-blue-300">VISA</span>
                </div>
              </div>
            </div>
          </div>

          {/* Input Form */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Coins className="w-4 h-4 text-blue-400" /> Liquidation Parameters
            </h3>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Crypto Asset</label>
                <select 
                  value={cryptoAsset} 
                  onChange={(e) => setCryptoAsset(e.target.value)}
                  disabled={settlementStatus !== 'idle'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                >
                  {Object.keys(CRYPTO_PRICES).map(asset => (
                    <option key={asset} value={asset}>{asset}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-xs text-slate-400 mb-1.5">Amount to Liquidate</label>
                <input 
                  type="number" 
                  value={liquidationAmount}
                  onChange={(e) => setLiquidationAmount(e.target.value)}
                  disabled={settlementStatus !== 'idle'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                  placeholder="0.00"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 flex justify-between items-center">
              <div>
                <span className="text-xs text-slate-400 block">Estimated Payout (USD)</span>
                <span className="text-lg font-extrabold text-white">${estimatedFiat}</span>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Current Price</span>
                <span className="text-xs font-mono text-slate-300">1 {cryptoAsset} = ${CRYPTO_PRICES[cryptoAsset].toLocaleString()}</span>
              </div>
            </div>

            <div className="border-t border-slate-800/60 pt-4 space-y-3">
              <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <CreditCard className="w-3.5 h-3.5 text-blue-400" /> Destination Debit Card
              </h3>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Cardholder Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    value={cardholderName}
                    onChange={(e) => setCardholderName(e.target.value)}
                    disabled={settlementStatus !== 'idle'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50"
                    placeholder="John Doe"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs text-slate-400 mb-1">Card Number</label>
                <input 
                  type="text" 
                  value={cardNumber}
                  onChange={(e) => setCardNumber(e.target.value)}
                  disabled={settlementStatus !== 'idle'}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 font-mono"
                  placeholder="4000 1234 5678 9010"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Expiry Date</label>
                  <input 
                    type="text" 
                    value={cardExpiry}
                    onChange={(e) => setCardExpiry(e.target.value)}
                    disabled={settlementStatus !== 'idle'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 font-mono"
                    placeholder="MM/YY"
                  />
                </div>
                <div>
                  <label className="block text-xs text-slate-400 mb-1">CVV</label>
                  <input 
                    type="password" 
                    value={cardCvv}
                    onChange={(e) => setCardCvv(e.target.value)}
                    disabled={settlementStatus !== 'idle'}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500 disabled:opacity-50 font-mono"
                    placeholder="•••"
                  />
                </div>
              </div>
            </div>

            {settlementStatus === 'idle' ? (
              <button
                onClick={executeSettlement}
                className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-500 hover:to-purple-500 text-white font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                <Zap className="w-4 h-4" /> Liquidate & Settle Instantly
              </button>
            ) : (
              <button
                onClick={resetEngine}
                disabled={settlementStatus === 'assessing' || settlementStatus === 'liquidating' || settlementStatus === 'settling'}
                className="w-full bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold py-3 px-4 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 disabled:opacity-50"
              >
                <RefreshCw className="w-4 h-4 animate-spin" /> Reset Engine
              </button>
            )}
          </div>
        </div>

        {/* Right Column: AI Risk Assessment & Live Logs */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* AI Risk Assessment Panel */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-purple-400" /> Gemini Risk Assessment
              </h3>
              {riskDecision && (
                <span className={`text-xs font-extrabold px-2.5 py-1 rounded-full ${
                  riskDecision === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  riskDecision === 'MANUAL_REVIEW' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {riskDecision}
                </span>
              )}
            </div>

            {settlementStatus === 'assessing' ? (
              <div className="py-8 flex flex-col items-center justify-center text-center space-y-3">
                <div className="relative">
                  <div className="w-12 h-12 rounded-full border-4 border-purple-500/20 border-t-purple-500 animate-spin"></div>
                  <Sparkles className="w-5 h-5 text-purple-400 absolute top-3.5 left-3.5 animate-pulse" />
                </div>
                <p className="text-sm text-slate-300 font-medium">Gemini is analyzing transaction parameters...</p>
                <p className="text-xs text-slate-500 max-w-md">Evaluating cardholder identity, wallet reputation, transaction velocity, and liquidity pool depth.</p>
              </div>
            ) : riskScore !== null ? (
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Risk Score</span>
                    <div className="flex items-baseline gap-1 mt-2">
                      <span className={`text-3xl font-black ${
                        riskScore < 30 ? 'text-emerald-400' :
                        riskScore < 70 ? 'text-amber-400' :
                        'text-rose-400'
                      }`}>{riskScore}</span>
                      <span className="text-xs text-slate-500">/100</span>
                    </div>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Decision Engine</span>
                    <span className={`text-lg font-bold mt-2 ${
                      riskDecision === 'APPROVED' ? 'text-emerald-400' :
                      riskDecision === 'MANUAL_REVIEW' ? 'text-amber-400' :
                      'text-rose-400'
                    }`}>{riskDecision}</span>
                  </div>

                  <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex flex-col justify-between">
                    <span className="text-xs text-slate-400">Visa Fast Funds</span>
                    <span className="text-lg font-bold text-blue-400 mt-2 flex items-center gap-1">
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" /> Supported
                    </span>
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80">
                  <span className="text-xs text-slate-400 block mb-1.5">Gemini AI Analysis Justification</span>
                  <p className="text-sm text-slate-300 leading-relaxed">{riskAnalysis}</p>
                </div>
              </div>
            ) : (
              <div className="py-8 text-center text-slate-500 border border-dashed border-slate-800 rounded-xl">
                <ShieldAlert className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">No active risk assessment. Trigger a liquidation to run Gemini AI analysis.</p>
              </div>
            )}
          </div>

          {/* Live Settlement Progress */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-4 flex items-center gap-2">
              <Activity className="w-4 h-4 text-blue-400" /> Settlement Pipeline
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
              {/* Step 1 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                settlementStatus === 'assessing' ? 'bg-purple-950/20 border-purple-500/50 shadow-lg shadow-purple-950/10' :
                riskDecision ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-50'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-purple-400">Step 1</span>
                  {riskDecision === 'APPROVED' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : 
                   riskDecision === 'REJECTED' ? <X className="w-3.5 h-3.5 text-rose-400" /> : null}
                </div>
                <span className="text-xs font-bold text-white block">AI Risk Check</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Gemini Assessment</span>
              </div>

              {/* Step 2 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                settlementStatus === 'liquidating' ? 'bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-950/10' :
                liquidationHash ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-50'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Step 2</span>
                  {liquidationHash && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-xs font-bold text-white block">Liquidation</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Crypto to USD Swap</span>
              </div>

              {/* Step 3 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                settlementStatus === 'settling' ? 'bg-blue-950/20 border-blue-500/50 shadow-lg shadow-blue-950/10' :
                visaTxId ? 'bg-slate-950 border-slate-800' : 'bg-slate-950/40 border-slate-900 opacity-50'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Step 3</span>
                  {visaTxId && <Check className="w-3.5 h-3.5 text-emerald-400" />}
                </div>
                <span className="text-xs font-bold text-white block">Visa Direct Push</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Real-Time Settlement</span>
              </div>

              {/* Step 4 */}
              <div className={`p-3.5 rounded-xl border transition-all duration-300 ${
                settlementStatus === 'completed' ? 'bg-emerald-950/20 border-emerald-500/50 shadow-lg shadow-emerald-950/10' :
                settlementStatus === 'failed' ? 'bg-rose-950/20 border-rose-500/50' :
                'bg-slate-950/40 border-slate-900 opacity-50'
              }`}>
                <div className="flex justify-between items-center mb-1">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400">Step 4</span>
                </div>
                <span className="text-xs font-bold text-white block">Settled</span>
                <span className="text-[10px] text-slate-400 block mt-0.5">Funds Available</span>
              </div>
            </div>
          </div>

          {/* Live Logs */}
          <div className="bg-slate-900 p-6 rounded-2xl border border-slate-800">
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 mb-3 flex items-center gap-2">
              <FileText className="w-4 h-4 text-slate-400" /> Live Transaction Logs
            </h3>
            <div className="bg-slate-950 rounded-xl p-4 h-48 overflow-y-auto font-mono text-xs space-y-2 border border-slate-800/60">
              {logs.map((log, index) => (
                <div key={index} className="flex items-start gap-2 leading-relaxed">
                  <span className="text-slate-500 shrink-0">[{log.timestamp}]</span>
                  <span className={`
                    ${log.type === 'success' ? 'text-emerald-400' : ''}
                    ${log.type === 'warning' ? 'text-amber-400' : ''}
                    ${log.type === 'error' ? 'text-rose-400 font-bold' : ''}
                    ${log.type === 'info' ? 'text-slate-300' : ''}
                  `}>
                    {log.message}
                  </span>
                </div>
              ))}
            </div>
          </div>

        </div>
      </div>

      {/* Footer / Security Badges */}
      <footer className="border-t border-slate-800 pt-4 mt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-blue-500" />
          <span>PCI-DSS Compliant & Secured by Visa Direct API Gateway</span>
        </div>
        <div className="flex items-center gap-4">
          <span>AstraDB Ledger Sync: Active</span>
          <span>Alpaca Liquidity Pool: Connected</span>
        </div>
      </footer>
    </div>
  );
}