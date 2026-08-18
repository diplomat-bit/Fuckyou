import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  CreditCard,
  Coins,
  RefreshCw,
  CheckCircle2,
  AlertTriangle,
  TrendingUp,
  ArrowRight,
  Settings,
  Terminal,
  Activity,
  ShieldCheck,
  Globe,
  Zap,
  DollarSign,
  Plus,
  Trash2,
  Copy,
  Check,
  ExternalLink,
  Cpu,
  Layers,
  Lock,
  Unlock,
  ArrowUpRight,
  FileText,
  Wifi,
  Database
} from 'lucide-react';

// Interfaces
interface MerchantConfig {
  merchantName: string;
  merchantId: string;
  terminalId: string;
  settlementCurrency: 'USDC' | 'USDT' | 'BTC' | 'ETH';
  settlementAddress: string;
  autoSettlement: boolean;
  slippageTolerance: number;
  acquiringFeePercent: number;
}

interface ExchangeRates {
  USDC: number;
  USDT: number;
  BTC: number;
  ETH: number;
}

interface Transaction {
  id: string;
  timestamp: string;
  cardholder: string;
  cardNumber: string;
  cardType: 'Visa Classic' | 'Visa Gold' | 'Visa Platinum' | 'Visa Infinite';
  amountUsd: number;
  cryptoCurrency: 'USDC' | 'USDT' | 'BTC' | 'ETH';
  cryptoAmount: number;
  exchangeRate: number;
  networkFeeUsd: number;
  acquiringFeeUsd: number;
  netSettlementCrypto: number;
  status: 'AUTHORIZED' | 'CONVERTING' | 'SETTLING' | 'SETTLED' | 'FAILED';
  txHash: string;
  blockNumber: number;
  visaAuthCode: string;
  terminalId: string;
}

interface TerminalLog {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'error' | 'network';
  message: string;
}

export default function VisaMerchantAcquiringSimulator() {
  // State
  const [config, setConfig] = useState<MerchantConfig>({
    merchantName: 'Sovereign Nexus Labs',
    merchantId: 'MID-VISA-889201-X',
    terminalId: 'TID-9921-A',
    settlementCurrency: 'USDC',
    settlementAddress: '0x71C7656EC7ab88b098defB751B7401B5f6d1476B',
    autoSettlement: true,
    slippageTolerance: 0.5,
    acquiringFeePercent: 0.45 // 0.45% acquiring fee vs traditional 2.9%
  });

  const [rates, setRates] = useState<ExchangeRates>({
    USDC: 1.00,
    USDT: 1.00,
    BTC: 64250.75,
    ETH: 3450.20
  });

  const [rateTrend, setRateTrend] = useState<{ [key: string]: 'up' | 'down' | 'stable' }>({
    USDC: 'stable',
    USDT: 'stable',
    BTC: 'up',
    ETH: 'up'
  });

  const [transactions, setTransactions] = useState<Transaction[]>([
    {
      id: 'TX-8829102',
      timestamp: new Date(Date.now() - 3600000 * 2).toISOString(),
      cardholder: 'Satoshi Nakamoto',
      cardNumber: '4111 11XX XXXX 1111',
      cardType: 'Visa Infinite',
      amountUsd: 1250.00,
      cryptoCurrency: 'BTC',
      cryptoAmount: 0.019455,
      exchangeRate: 64250.75,
      networkFeeUsd: 1.50,
      acquiringFeeUsd: 5.63,
      netSettlementCrypto: 0.019345,
      status: 'SETTLED',
      txHash: '0x8a2f91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0',
      blockNumber: 845921,
      visaAuthCode: 'V-AUTH-992108',
      terminalId: 'TID-9921-A'
    },
    {
      id: 'TX-8829101',
      timestamp: new Date(Date.now() - 3600000 * 5).toISOString(),
      cardholder: 'Alice Vance',
      cardNumber: '4000 12XX XXXX 4321',
      cardType: 'Visa Platinum',
      amountUsd: 85.50,
      cryptoCurrency: 'USDC',
      cryptoAmount: 85.50,
      exchangeRate: 1.00,
      networkFeeUsd: 0.05,
      acquiringFeeUsd: 0.38,
      netSettlementCrypto: 85.07,
      status: 'SETTLED',
      txHash: '0x3f4a5b6c7d8e9f0a1b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a',
      blockNumber: 19820192,
      visaAuthCode: 'V-AUTH-110293',
      terminalId: 'TID-9921-A'
    }
  ]);

  // Form State
  const [formCardholder, setFormCardholder] = useState('');
  const [formCardNumber, setFormCardNumber] = useState('4111 1111 1111 1111');
  const [formExpiry, setFormExpiry] = useState('12/28');
  const [formCvv, setFormCvv] = useState('321');
  const [formAmount, setFormAmount] = useState('150.00');
  const [formCardType, setFormCardType] = useState<'Visa Classic' | 'Visa Gold' | 'Visa Platinum' | 'Visa Infinite'>('Visa Infinite');

  const [isProcessing, setIsProcessing] = useState(false);
  const [processingStep, setProcessingStep] = useState<number>(0);
  const [currentTx, setCurrentTx] = useState<Partial<Transaction> | null>(null);
  const [logs, setLogs] = useState<TerminalLog[]>([]);
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'simulator' | 'ledger' | 'config' | 'api'>('simulator');

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Add Log Helper
  const addLog = (message: string, type: 'info' | 'success' | 'warning' | 'error' | 'network' = 'info') => {
    const newLog: TerminalLog = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message
    };
    setLogs(prev => [...prev, newLog]);
  };

  // Simulate Exchange Rate Fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prev => {
        const btcChange = (Math.random() - 0.49) * 150;
        const ethChange = (Math.random() - 0.49) * 12;
        const usdcChange = (Math.random() - 0.5) * 0.001; // Peg stability
        const usdtChange = (Math.random() - 0.5) * 0.001;

        const nextBtc = Math.max(10000, prev.BTC + btcChange);
        const nextEth = Math.max(500, prev.ETH + ethChange);
        const nextUsdc = Math.max(0.99, Math.min(1.01, prev.USDC + usdcChange));
        const nextUsdt = Math.max(0.99, Math.min(1.01, prev.USDT + usdtChange));

        setRateTrend({
          BTC: btcChange > 0 ? 'up' : btcChange < 0 ? 'down' : 'stable',
          ETH: ethChange > 0 ? 'up' : ethChange < 0 ? 'down' : 'stable',
          USDC: Math.abs(usdcChange) > 0.0005 ? (usdcChange > 0 ? 'up' : 'down') : 'stable',
          USDT: Math.abs(usdtChange) > 0.0005 ? (usdtChange > 0 ? 'up' : 'down') : 'stable'
        });

        return {
          USDC: Number(nextUsdc.toFixed(4)),
          USDT: Number(nextUsdt.toFixed(4)),
          BTC: Number(nextBtc.toFixed(2)),
          ETH: Number(nextEth.toFixed(2))
        };
      });
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // Auto-scroll terminal
  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Copy to Clipboard Helper
  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => setCopiedText(null), 2000);
  };

  // Calculate current conversion preview
  const conversionPreview = useMemo(() => {
    const amount = parseFloat(formAmount) || 0;
    const rate = rates[config.settlementCurrency];
    const cryptoAmount = amount / rate;
    const acquiringFee = amount * (config.acquiringFeePercent / 100);
    const networkFee = config.settlementCurrency === 'BTC' ? 2.50 : config.settlementCurrency === 'ETH' ? 1.80 : 0.10;
    const netCrypto = (amount - acquiringFee - networkFee) / rate;

    return {
      cryptoAmount: cryptoAmount > 0 ? cryptoAmount : 0,
      acquiringFee: acquiringFee > 0 ? acquiringFee : 0,
      networkFee: networkFee > 0 ? networkFee : 0,
      netCrypto: netCrypto > 0 ? netCrypto : 0
    };
  }, [formAmount, rates, config.settlementCurrency, config.acquiringFeePercent]);

  // Total Stats
  const stats = useMemo(() => {
    let totalUsd = 0;
    let totalAcquiringFees = 0;
    let totalNetworkFees = 0;
    const cryptoTotals = { USDC: 0, USDT: 0, BTC: 0, ETH: 0 };

    transactions.forEach(tx => {
      if (tx.status === 'SETTLED') {
        totalUsd += tx.amountUsd;
        totalAcquiringFees += tx.acquiringFeeUsd;
        totalNetworkFees += tx.networkFeeUsd;
        cryptoTotals[tx.cryptoCurrency] += tx.netSettlementCrypto;
      }
    });

    // Traditional Visa fees would be ~2.9% + $0.30 per transaction
    const traditionalFees = transactions.length * 0.30 + totalUsd * 0.029;
    const actualFees = totalAcquiringFees + totalNetworkFees;
    const savings = Math.max(0, traditionalFees - actualFees);

    return {
      totalUsd,
      totalAcquiringFees,
      totalNetworkFees,
      cryptoTotals,
      savings,
      txCount: transactions.length
    };
  }, [transactions]);

  // Process Visa Transaction with Instant Crypto Settlement
  const handleProcessTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (isProcessing) return;

    const amount = parseFloat(formAmount);
    if (isNaN(amount) || amount <= 0) {
      alert('Please enter a valid transaction amount.');
      return;
    }

    setIsProcessing(true);
    setProcessingStep(1);
    setLogs([]);

    const txId = `TX-${Math.floor(1000000 + Math.random() * 9000000)}`;
    const authCode = `V-AUTH-${Math.floor(100000 + Math.random() * 900000)}`;
    const selectedCrypto = config.settlementCurrency;
    const currentRate = rates[selectedCrypto];
    const acquiringFee = amount * (config.acquiringFeePercent / 100);
    const networkFee = selectedCrypto === 'BTC' ? 2.50 : selectedCrypto === 'ETH' ? 1.80 : 0.10;
    const netSettlementUsd = amount - acquiringFee - networkFee;
    const netSettlementCrypto = netSettlementUsd / currentRate;

    const newTx: Transaction = {
      id: txId,
      timestamp: new Date().toISOString(),
      cardholder: formCardholder || 'Valued Customer',
      cardNumber: formCardNumber.replace(/(\d{4})\s(\d{4})\s(\d{4})\s(\d{4})/, '$1 XXXX XXXX $4'),
      cardType: formCardType,
      amountUsd: amount,
      cryptoCurrency: selectedCrypto,
      cryptoAmount: amount / currentRate,
      exchangeRate: currentRate,
      networkFeeUsd: networkFee,
      acquiringFeeUsd: acquiringFee,
      netSettlementCrypto: netSettlementCrypto,
      status: 'AUTHORIZED',
      txHash: '',
      blockNumber: 0,
      visaAuthCode: authCode,
      terminalId: config.terminalId
    };

    setCurrentTx(newTx);

    // Step 1: Visa Network Authorization
    addLog(`[VisaNet] Initiating authorization request for $${amount.toFixed(2)} USD`, 'network');
    addLog(`[VisaNet] Cardholder: ${newTx.cardholder} | Card: ${newTx.cardNumber}`, 'info');
    addLog(`[VisaNet] Routing through Visa Token Service (VTS) for secure tokenization...`, 'info');
    
    await new Promise(resolve => setTimeout(resolve, 1200));
    setProcessingStep(2);
    addLog(`[VisaNet] Fraud score evaluated: 0.02 (Low Risk). 3D Secure verified.`, 'success');
    addLog(`[VisaNet] Authorization APPROVED. Auth Code: ${authCode}`, 'success');

    // Step 2: Instant Liquidity Conversion
    await new Promise(resolve => setTimeout(resolve, 1000));
    setProcessingStep(3);
    addLog(`[Acquiring Engine] Initiating instant settlement conversion to ${selectedCrypto}`, 'info');
    addLog(`[Acquiring Engine] Locked Exchange Rate: 1 ${selectedCrypto} = $${currentRate.toLocaleString()} USD`, 'info');
    addLog(`[Acquiring Engine] Deducting acquiring fee: $${acquiringFee.toFixed(2)} USD (${config.acquiringFeePercent}%)`, 'info');
    addLog(`[Acquiring Engine] Deducting network gas fee: $${networkFee.toFixed(2)} USD`, 'info');
    addLog(`[Acquiring Engine] Net settlement amount: $${netSettlementUsd.toFixed(2)} USD -> ${netSettlementCrypto.toFixed(6)} ${selectedCrypto}`, 'success');

    // Step 3: On-chain Settlement
    await new Promise(resolve => setTimeout(resolve, 1200));
    setProcessingStep(4);
    const generatedHash = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    const generatedBlock = selectedCrypto === 'BTC' ? 845922 : selectedCrypto === 'ETH' ? 19820193 : 19820193;
    
    addLog(`[Sovereign Ledger] Broadcasting settlement payload to blockchain network...`, 'network');
    addLog(`[Sovereign Ledger] Target Merchant Wallet: ${config.settlementAddress}`, 'info');
    addLog(`[Sovereign Ledger] Transaction Hash: ${generatedHash}`, 'info');

    await new Promise(resolve => setTimeout(resolve, 1500));
    setProcessingStep(5);
    
    const finalizedTx: Transaction = {
      ...newTx,
      status: 'SETTLED',
      txHash: generatedHash,
      blockNumber: generatedBlock
    };

    setTransactions(prev => [finalizedTx, ...prev]);
    setCurrentTx(finalizedTx);
    setIsProcessing(false);
    addLog(`[Sovereign Ledger] Block ${generatedBlock} confirmed. Settlement complete!`, 'success');
    addLog(`[Acquiring Engine] Merchant account credited with ${netSettlementCrypto.toFixed(6)} ${selectedCrypto}`, 'success');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-8 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="bg-gradient-to-r from-blue-600 to-emerald-500 p-2 rounded-lg shadow-lg shadow-blue-500/10">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Visa Acquiring & Instant Crypto Settlement
            </h1>
          </div>
          <p className="text-slate-400 text-sm md:text-base">
            Real-time Visa payment processing with instant on-chain settlement in stablecoins or Bitcoin.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 px-4 py-2 rounded-xl backdrop-blur-sm">
          <div className="flex items-center gap-2">
            <span className="relative flex h-3.5 w-3.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3.5 w-3.5 bg-emerald-500"></span>
            </span>
            <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">VisaNet Live</span>
          </div>
          <div className="h-4 w-px bg-slate-800"></div>
          <div className="text-xs text-slate-400 font-mono">MID: {config.merchantId}</div>
        </div>
      </header>

      {/* Main Grid */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Stats & Exchange Rates (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Exchange Rates Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <Activity className="w-4 h-4 text-blue-400" />
                Real-Time Liquidity Rates
              </h2>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <RefreshCw className="w-3 h-3 animate-spin text-slate-500" />
                Auto-updating
              </span>
            </div>

            <div className="space-y-3">
              {Object.entries(rates).map(([currency, rate]) => {
                const trend = rateTrend[currency];
                return (
                  <div key={currency} className="flex justify-between items-center p-3 bg-slate-950/60 border border-slate-800/50 rounded-xl hover:border-slate-700/50 transition-all">
                    <div className="flex items-center gap-3">
                      <div className={`w-8 h-8 rounded-lg flex items-center justify-center font-bold text-xs ${
                        currency === 'USDC' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                        currency === 'USDT' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        currency === 'BTC' ? 'bg-amber-500/10 text-amber-500 border border-amber-500/20' :
                        'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      }`}>
                        {currency}
                      </div>
                      <div>
                        <div className="font-semibold text-sm">{currency === 'USDC' || currency === 'USDT' ? 'Stablecoin' : currency === 'BTC' ? 'Bitcoin' : 'Ethereum'}</div>
                        <div className="text-xs text-slate-500">Instant Settlement</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-mono font-bold text-sm">
                        ${rate.toLocaleString(undefined, { minimumFractionDigits: currency.includes('USD') ? 4 : 2 })}
                      </div>
                      <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                        trend === 'up' ? 'bg-emerald-500/10 text-emerald-400' :
                        trend === 'down' ? 'bg-rose-500/10 text-rose-400' :
                        'bg-slate-800 text-slate-400'
                      }`}>
                        {trend === 'up' ? '▲ UP' : trend === 'down' ? '▼ DOWN' : '● STABLE'}
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Merchant Stats Card */}
          <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md shadow-xl space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              Acquiring Performance
            </h2>

            <div className="grid grid-cols-2 gap-4">
              <div className="bg-slate-950/60 border border-slate-800/50 p-3 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Total Volume</div>
                <div className="text-lg font-bold font-mono text-white">${stats.totalUsd.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="bg-slate-950/60 border border-slate-800/50 p-3 rounded-xl">
                <div className="text-xs text-slate-500 mb-1">Acquiring Savings</div>
                <div className="text-lg font-bold font-mono text-emerald-400 flex items-center gap-1">
                  <Zap className="w-4 h-4 fill-emerald-400/20" />
                  ${stats.savings.toFixed(2)}
                </div>
              </div>
            </div>

            <div className="bg-slate-950/60 border border-slate-800/50 p-4 rounded-xl space-y-3">
              <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settled Balances</div>
              <div className="space-y-2">
                {Object.entries(stats.cryptoTotals).map(([currency, total]) => (
                  <div key={currency} className="flex justify-between items-center text-xs">
                    <span className="text-slate-500 font-medium">{currency} Balance</span>
                    <span className="font-mono font-bold text-slate-300">
                      {total.toFixed(currency === 'BTC' || currency === 'ETH' ? 6 : 2)} {currency}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-blue-950/20 border border-blue-900/30 p-3.5 rounded-xl flex items-start gap-3">
              <ShieldCheck className="w-5 h-5 text-blue-400 shrink-0 mt-0.5" />
              <div className="text-xs text-blue-300 leading-relaxed">
                <strong>Sovereign Settlement Guarantee:</strong> All Visa transactions are instantly converted and settled on-chain within 3 seconds, eliminating chargeback risk and rolling reserves.
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Workspace (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Navigation Tabs */}
          <div className="flex border-b border-slate-800 gap-2">
            <button
              onClick={() => setActiveTab('simulator')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'simulator'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <CreditCard className="w-4 h-4" />
              Terminal Simulator
            </button>
            <button
              onClick={() => setActiveTab('ledger')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'ledger'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-4 h-4" />
              Settlement Ledger
            </button>
            <button
              onClick={() => setActiveTab('config')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'config'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Settings className="w-4 h-4" />
              Merchant Config
            </button>
            <button
              onClick={() => setActiveTab('api')}
              className={`px-4 py-2.5 text-sm font-medium border-b-2 transition-all flex items-center gap-2 ${
                activeTab === 'api'
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-4 h-4" />
              Developer API
            </button>
          </div>

          {/* Tab Content: Simulator */}
          {activeTab === 'simulator' && (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
              
              {/* Transaction Form (7 cols) */}
              <div className="md:col-span-7 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-5">
                <div className="flex justify-between items-center">
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Zap className="w-4 h-4 text-yellow-400" />
                    Swipe / Tap Visa Card
                  </h3>
                  <span className="text-xs text-slate-500">Terminal ID: {config.terminalId}</span>
                </div>

                <form onSubmit={handleProcessTransaction} className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Cardholder Name</label>
                    <input
                      type="text"
                      value={formCardholder}
                      onChange={e => setFormCardholder(e.target.value)}
                      placeholder="Satoshi Nakamoto"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all font-mono"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Card Number</label>
                      <input
                        type="text"
                        value={formCardNumber}
                        onChange={e => setFormCardNumber(e.target.value)}
                        placeholder="4111 1111 1111 1111"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Card Tier</label>
                      <select
                        value={formCardType}
                        onChange={e => setFormCardType(e.target.value as any)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                      >
                        <option value="Visa Classic">Visa Classic</option>
                        <option value="Visa Gold">Visa Gold</option>
                        <option value="Visa Platinum">Visa Platinum</option>
                        <option value="Visa Infinite">Visa Infinite</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-3 gap-4">
                    <div className="col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Expiry Date</label>
                      <input
                        type="text"
                        value={formExpiry}
                        onChange={e => setFormExpiry(e.target.value)}
                        placeholder="MM/YY"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all font-mono"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">CVV</label>
                      <input
                        type="password"
                        value={formCvv}
                        onChange={e => setFormCvv(e.target.value)}
                        placeholder="***"
                        maxLength={4}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all font-mono"
                        required
                      />
                    </div>
                  </div>

                  <div className="border-t border-slate-800/80 my-4 pt-4"></div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Amount (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3.5 top-2 text-slate-500 font-mono text-sm">$</span>
                        <input
                          type="number"
                          step="0.01"
                          value={formAmount}
                          onChange={e => setFormAmount(e.target.value)}
                          placeholder="0.00"
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all font-mono"
                          required
                        />
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Settlement Asset</label>
                      <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5">
                        <Coins className="w-4 h-4 text-emerald-400" />
                        <span className="text-sm font-bold text-white">{config.settlementCurrency}</span>
                        <span className="text-[10px] text-slate-500 bg-slate-900 px-1.5 py-0.5 rounded ml-auto">Preferred</span>
                      </div>
                    </div>
                  </div>

                  {/* Conversion Preview Box */}
                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-2.5">
                    <div className="text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Breakdown Preview</div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Gross Amount</span>
                      <span className="font-mono text-slate-300">${(parseFloat(formAmount) || 0).toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Visa Acquiring Fee ({config.acquiringFeePercent}%)</span>
                      <span className="font-mono text-rose-400">-${conversionPreview.acquiringFee.toFixed(2)} USD</span>
                    </div>
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">On-chain Gas Fee</span>
                      <span className="font-mono text-rose-400">-${conversionPreview.networkFee.toFixed(2)} USD</span>
                    </div>
                    <div className="border-t border-slate-800/60 my-1.5"></div>
                    <div className="flex justify-between text-sm font-bold">
                      <span className="text-slate-300">Net Settlement</span>
                      <span className="font-mono text-emerald-400">
                        {conversionPreview.netCrypto.toFixed(config.settlementCurrency === 'BTC' || config.settlementCurrency === 'ETH' ? 6 : 2)} {config.settlementCurrency}
                      </span>
                    </div>
                  </div>

                  <button
                    type="submit"
                    disabled={isProcessing}
                    className={`w-full py-3 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 shadow-lg ${
                      isProcessing
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                        : 'bg-gradient-to-r from-blue-600 to-emerald-600 hover:from-blue-500 hover:to-emerald-500 text-white shadow-blue-500/10 hover:shadow-blue-500/20'
                    }`}
                  >
                    {isProcessing ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing Settlement...
                      </>
                    ) : (
                      <>
                        <CreditCard className="w-4 h-4" />
                        Authorize & Settle Instantly
                      </>
                    )}
                  </button>
                </form>
              </div>

              {/* Live Terminal Logs (5 cols) */}
              <div className="md:col-span-5 flex flex-col bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden shadow-xl h-[520px]">
                <div className="bg-slate-900/80 border-b border-slate-800 px-4 py-3 flex justify-between items-center">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-wider text-slate-300">Acquiring Terminal Log</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-[10px] text-slate-500 font-mono">ONLINE</span>
                  </div>
                </div>

                {/* Log Stream */}
                <div className="flex-1 p-4 overflow-y-auto font-mono text-xs space-y-3 scrollbar-thin scrollbar-thumb-slate-800">
                  {logs.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-600 text-center p-4">
                      <Cpu className="w-8 h-8 mb-2 text-slate-700 animate-pulse" />
                      <p>Waiting for transaction initiation...</p>
                      <p className="text-[10px] mt-1">Submit the form to trigger the Visa-to-Crypto settlement protocol.</p>
                    </div>
                  ) : (
                    logs.map(log => (
                      <div key={log.id} className="border-l-2 pl-2.5 py-0.5 border-slate-800 hover:bg-slate-900/30 transition-all">
                        <div className="flex items-center gap-2 mb-0.5">
                          <span className="text-[10px] text-slate-500">{log.timestamp}</span>
                          <span className={`text-[9px] font-bold px-1 rounded uppercase ${
                            log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400' :
                            log.type === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                            log.type === 'error' ? 'bg-rose-500/10 text-rose-400' :
                            log.type === 'network' ? 'bg-blue-500/10 text-blue-400' :
                            'bg-slate-800 text-slate-400'
                          }`}>
                            {log.type}
                          </span>
                        </div>
                        <p className="text-slate-300 leading-relaxed break-words">{log.message}</p>
                      </div>
                    ))
                  )}
                  <div ref={terminalEndRef} />
                </div>

                {/* Progress Bar */}
                {isProcessing && (
                  <div className="bg-slate-900 border-t border-slate-800 p-3 space-y-2">
                    <div className="flex justify-between text-[10px] font-bold text-slate-400">
                      <span>Settlement Progress</span>
                      <span>{Math.round((processingStep / 5) * 100)}%</span>
                    </div>
                    <div className="w-full bg-slate-850 h-1.5 rounded-full overflow-hidden">
                      <div
                        className="bg-gradient-to-r from-blue-500 to-emerald-500 h-full transition-all duration-500"
                        style={{ width: `${(processingStep / 5) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                )}
              </div>

            </div>
          )}

          {/* Tab Content: Ledger */}
          {activeTab === 'ledger' && (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-4">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Layers className="w-4 h-4 text-blue-400" />
                  Settlement Ledger
                </h3>
                <span className="text-xs text-slate-400 font-mono">{transactions.length} Transactions Settled</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-bold text-slate-400 uppercase tracking-wider">
                      <th className="py-3 px-4">Tx ID / Time</th>
                      <th className="py-3 px-4">Cardholder</th>
                      <th className="py-3 px-4 text-right">USD Amount</th>
                      <th className="py-3 px-4 text-right">Crypto Settled</th>
                      <th className="py-3 px-4">On-chain Hash</th>
                      <th className="py-3 px-4 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-sm">
                    {transactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-850/30 transition-all">
                        <td className="py-3.5 px-4">
                          <div className="font-bold text-slate-200">{tx.id}</div>
                          <div className="text-[10px] text-slate-500">{new Date(tx.timestamp).toLocaleString()}</div>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="font-medium text-slate-300">{tx.cardholder}</div>
                          <div className="text-xs text-slate-500 font-mono">{tx.cardNumber} ({tx.cardType})</div>
                        </td>
                        <td className="py-3.5 px-4 text-right font-mono font-bold text-slate-200">
                          ${tx.amountUsd.toFixed(2)}
                        </td>
                        <td className="py-3.5 px-4 text-right">
                          <div className="font-mono font-bold text-emerald-400">
                            {tx.netSettlementCrypto.toFixed(tx.cryptoCurrency === 'BTC' || tx.cryptoCurrency === 'ETH' ? 6 : 2)} {tx.cryptoCurrency}
                          </div>
                          <div className="text-[10px] text-slate-500 font-mono">Rate: ${tx.exchangeRate.toLocaleString()}</div>
                        </td>
                        <td className="py-3.5 px-4 font-mono text-xs">
                          {tx.txHash ? (
                            <div className="flex items-center gap-1.5 text-blue-400 hover:text-blue-300 cursor-pointer" onClick={() => handleCopy(tx.txHash, tx.id)}>
                              <span>{tx.txHash.substring(0, 8)}...{tx.txHash.substring(56)}</span>
                              {copiedText === tx.id ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                            </div>
                          ) : (
                            <span className="text-slate-600">N/A</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-center">
                          <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-bold bg-emerald-500/10 text-emerald-400">
                            <CheckCircle2 className="w-3 h-3" />
                            Settled
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* Tab Content: Config */}
          {activeTab === 'config' && (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Settings className="w-4 h-4 text-blue-400" />
                Merchant Acquiring Configuration
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Merchant Name</label>
                    <input
                      type="text"
                      value={config.merchantName}
                      onChange={e => setConfig(prev => ({ ...prev, merchantName: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Settlement Currency Preference</label>
                    <select
                      value={config.settlementCurrency}
                      onChange={e => setConfig(prev => ({ ...prev, settlementCurrency: e.target.value as any }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all"
                    >
                      <option value="USDC">USDC (USD Coin - ERC20)</option>
                      <option value="USDT">USDT (Tether - ERC20)</option>
                      <option value="BTC">BTC (Bitcoin Native)</option>
                      <option value="ETH">ETH (Ethereum Native)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Settlement Wallet Address</label>
                    <input
                      type="text"
                      value={config.settlementAddress}
                      onChange={e => setConfig(prev => ({ ...prev, settlementAddress: e.target.value }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Slippage Tolerance (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={config.slippageTolerance}
                      onChange={e => setConfig(prev => ({ ...prev, slippageTolerance: parseFloat(e.target.value) || 0.5 }))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-100 focus:outline-none focus:border-blue-500 transition-all font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Acquiring Fee Rate (%)</label>
                    <div className="flex items-center gap-2 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-sm text-slate-400 font-mono">
                      <span>{config.acquiringFeePercent}%</span>
                      <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded ml-auto">85% cheaper than traditional</span>
                    </div>
                  </div>

                  <div className="bg-slate-950/80 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Auto-Settlement Protocol</span>
                      <button
                        onClick={() => setConfig(prev => ({ ...prev, autoSettlement: !prev.autoSettlement }))}
                        className={`w-10 h-6 rounded-full p-1 transition-all ${config.autoSettlement ? 'bg-emerald-500' : 'bg-slate-800'}`}
                      >
                        <div className={`w-4 h-4 rounded-full bg-white transition-all ${config.autoSettlement ? 'translate-x-4' : 'translate-x-0'}`}></div>
                      </button>
                    </div>
                    <p className="text-xs text-slate-500 leading-relaxed">
                      When enabled, funds are instantly converted and pushed to your on-chain wallet address. If disabled, funds accumulate in your Sovereign custodial balance.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Tab Content: Developer API */}
          {activeTab === 'api' && (
            <div className="bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md shadow-xl space-y-6">
              <div className="flex justify-between items-center">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-blue-400" />
                  Developer Integration & Webhooks
                </h3>
                <span className="text-xs text-slate-500 font-mono">v1.0.4-beta</span>
              </div>

              <div className="space-y-4">
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">API Keys</span>
                    <span className="text-[10px] text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">Active</span>
                  </div>
                  <div className="flex items-center gap-2 bg-slate-900/50 border border-slate-850 rounded-lg px-3 py-2 font-mono text-xs text-slate-300">
                    <Lock className="w-3.5 h-3.5 text-slate-500" />
                    <span>sk_live_visa_settle_889201_x_9921_a</span>
                    <button
                      onClick={() => handleCopy('sk_live_visa_settle_889201_x_9921_a', 'api_key')}
                      className="ml-auto text-slate-500 hover:text-slate-300"
                    >
                      {copiedText === 'api_key' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Webhook Endpoint</span>
                  <div className="flex gap-2">
                    <input
                      type="text"
                      defaultValue="https://api.sovereignnexus.com/v1/webhooks/visa-settlement"
                      className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3.5 py-2 text-xs text-slate-300 font-mono focus:outline-none"
                      readOnly
                    />
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-4 py-2 rounded-xl text-xs font-bold transition-all">
                      Test Webhook
                    </button>
                  </div>
                </div>

                <div className="space-y-2">
                  <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Sample Webhook Payload (JSON)</span>
                  <pre className="bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-[11px] text-slate-300 overflow-x-auto leading-relaxed">
{`{
  "id": "evt_settlement_succeeded",
  "object": "event",
  "created": ${Math.floor(Date.now() / 1000)},
  "data": {
    "transaction_id": "TX-8829102",
    "visa_auth_code": "V-AUTH-992108",
    "amount_usd": 1250.00,
    "settlement": {
      "currency": "${config.settlementCurrency}",
      "amount": ${conversionPreview.netCrypto.toFixed(6)},
      "exchange_rate": ${rates[config.settlementCurrency]},
      "network_fee_usd": ${conversionPreview.networkFee},
      "acquiring_fee_usd": ${conversionPreview.acquiringFee},
      "tx_hash": "0x8a2f91b2c3d4e5f6a7b8c9d0e1f2a3b4c5d6e7f8a9b0c1d2e3f4a5b6c7d8e9f0",
      "block_number": 19820193,
      "destination_address": "${config.settlementAddress}"
    }
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </div>

      </main>

      {/* Footer */}
      <footer className="max-w-7xl mx-auto mt-12 border-t border-slate-800 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>PCI-DSS Level 1 Compliant Acquiring Network</span>
        </div>
        <div>
          <span>Sovereign Acquiring Engine v2.4.1 • Powered by Visa Token Service</span>
        </div>
      </footer>
    </div>
  );
}