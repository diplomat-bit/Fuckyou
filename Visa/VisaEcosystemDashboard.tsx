import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import {
  CreditCard,
  Coins,
  Brain,
  Activity,
  ShieldCheck,
  Zap,
  ArrowUpRight,
  ArrowDownLeft,
  RefreshCw,
  Search,
  Filter,
  Terminal,
  Cpu,
  Globe,
  Lock,
  Unlock,
  Send,
  DollarSign,
  AlertTriangle,
  CheckCircle2,
  Sliders,
  Layers,
  FileText,
  Play,
  Pause,
  Download,
  Copy,
  Check,
  Eye,
  EyeOff,
  Plus,
  Trash2,
  ChevronRight,
  Info,
  Sparkles,
  Scale,
  Link2,
  Database
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell
} from 'recharts';

// Types & Interfaces
interface CryptoAsset {
  symbol: string;
  name: string;
  balance: number;
  price: number;
  change24h: number;
  color: string;
  walletAddress: string;
}

interface VisaCard {
  id: string;
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  status: 'Active' | 'Frozen' | 'Tokenized';
  limit: number;
  balance: number;
  tokenizedId?: string;
  type: 'Visa Platinum' | 'Visa Signature' | 'Visa Infinite' | 'Visa Commercial';
}

interface UnifiedTransaction {
  id: string;
  timestamp: string;
  type: 'Visa Direct' | 'Crypto Bridge' | 'Card Purchase' | 'Settlement';
  source: string;
  destination: string;
  amount: number;
  currency: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Flagged';
  riskScore: number;
  txHash?: string;
  complianceStatus: 'Approved' | 'Review Required' | 'Blocked';
}

interface LogEntry {
  timestamp: string;
  source: 'VISA_API' | 'CRYPTO_NODE' | 'GEMINI_AI' | 'SYSTEM';
  message: string;
  type: 'info' | 'success' | 'warning' | 'error';
}

export default function VisaEcosystemDashboard() {
  // --- State Management ---
  const [cryptoAssets, setCryptoAssets] = useState<CryptoAsset[]>([
    { symbol: 'USDC', name: 'USD Coin', balance: 1250000.00, price: 1.00, change24h: 0.01, color: '#2775CA', walletAddress: '0x71C...8947' },
    { symbol: 'ETH', name: 'Ethereum', balance: 342.50, price: 3240.50, change24h: 4.25, color: '#627EEA', walletAddress: '0x3fC...22a1' },
    { symbol: 'BTC', name: 'Bitcoin', balance: 18.45, price: 89250.00, change24h: 2.80, color: '#F7931A', walletAddress: 'bc1q...99p4' },
    { symbol: 'SOL', name: 'Solana', balance: 1250.00, price: 185.20, change24h: -1.15, color: '#14F195', walletAddress: '5Wz...k9p2' }
  ]);

  const [visaCards, setVisaCards] = useState<VisaCard[]>([
    { id: 'card-1', cardNumber: '4111 2222 3333 4444', cardholderName: 'SOVEREIGN CORP', expiryDate: '12/28', cvv: '982', status: 'Tokenized', limit: 5000000, balance: 1245000, tokenizedId: 'vts-tok-992811', type: 'Visa Infinite' },
    { id: 'card-2', cardNumber: '4555 6666 7777 8888', cardholderName: 'TREASURY DEPT', expiryDate: '08/27', cvv: '114', status: 'Active', limit: 2000000, balance: 450000, type: 'Visa Commercial' },
    { id: 'card-3', cardNumber: '4999 0000 1111 2222', cardholderName: 'LIQUIDITY POOL A', expiryDate: '04/26', cvv: '335', status: 'Frozen', limit: 1000000, balance: 0, type: 'Visa Signature' }
  ]);

  const [transactions, setTransactions] = useState<UnifiedTransaction[]>([
    { id: 'TXN-101', timestamp: '2025-03-02 14:22:10', type: 'Visa Direct', source: 'Visa Commercial (*8888)', destination: 'USDC Wallet', amount: 250000, currency: 'USD', status: 'Completed', riskScore: 12, txHash: '0x88a2...f912', complianceStatus: 'Approved' },
    { id: 'TXN-102', timestamp: '2025-03-02 14:15:45', type: 'Crypto Bridge', source: 'ETH Wallet', destination: 'Visa Infinite (*4444)', amount: 15000, currency: 'USD', status: 'Completed', riskScore: 28, txHash: '0x44b1...a332', complianceStatus: 'Approved' },
    { id: 'TXN-103', timestamp: '2025-03-02 13:55:00', type: 'Card Purchase', source: 'Visa Infinite (*4444)', destination: 'Sovereign Cloud Services', amount: 8500, currency: 'USD', status: 'Completed', riskScore: 8, complianceStatus: 'Approved' },
    { id: 'TXN-104', timestamp: '2025-03-02 13:10:12', type: 'Settlement', source: 'USDC Wallet', destination: 'Visa Settlement Account', amount: 500000, currency: 'USDC', status: 'Completed', riskScore: 15, txHash: '0x99c2...e881', complianceStatus: 'Approved' },
    { id: 'TXN-105', timestamp: '2025-03-02 12:45:30', type: 'Visa Direct', source: 'Visa Platinum (*2222)', destination: 'SOL Wallet', amount: 120000, currency: 'USD', status: 'Flagged', riskScore: 82, complianceStatus: 'Review Required' }
  ]);

  const [logs, setLogs] = useState<LogEntry[]>([
    { timestamp: '14:22:10', source: 'VISA_API', message: 'Visa Direct Push Payment initiated successfully to USDC Wallet.', type: 'success' },
    { timestamp: '14:22:11', source: 'CRYPTO_NODE', message: 'USDC Mint event detected on Ethereum Mainnet. Tx: 0x88a2...f912', type: 'info' },
    { timestamp: '14:22:12', source: 'GEMINI_AI', message: 'Compliance Audit: Transaction TXN-101 matches standard corporate liquidity profile. Risk score: 12/100.', type: 'success' },
    { timestamp: '14:15:45', source: 'CRYPTO_NODE', message: 'Bridge request received: Swap 4.63 ETH to USD settlement rail.', type: 'info' },
    { timestamp: '14:15:47', source: 'VISA_API', message: 'Visa Token Service: Decrypted token vts-tok-992811 for settlement.', type: 'info' }
  ]);

  // Interactive Form States
  const [selectedCard, setSelectedCard] = useState<string>('card-1');
  const [selectedCrypto, setSelectedCrypto] = useState<string>('USDC');
  const [transferAmount, setTransferAmount] = useState<string>('');
  const [transferDirection, setTransferDirection] = useState<'VisaToCrypto' | 'CryptoToVisa'>('VisaToCrypto');
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [sandboxMode, setSandboxMode] = useState<boolean>(true);

  // Gemini AI Chat States
  const [chatInput, setChatInput] = useState<string>('');
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'user' | 'gemini'; text: string; timestamp: string }>>([
    { sender: 'gemini', text: 'Welcome to the Visa-Crypto-Gemini Autonomous Command Center. I am analyzing your unified ledger, Visa Token Service metrics, and real-time crypto liquidity pools. How can I assist you with settlement optimization or compliance auditing today?', timestamp: '14:00' }
  ]);
  const [isAiThinking, setIsAiThinking] = useState<boolean>(false);

  // Card Customizer / Tokenizer States
  const [showCardDetails, setShowCardDetails] = useState<Record<string, boolean>>({});
  const [newCardLimit, setNewCardLimit] = useState<string>('');

  // --- Real-time Simulation Loop ---
  useEffect(() => {
    const interval = setInterval(() => {
      // 1. Simulate Crypto Price Fluctuations (Random Walk)
      setCryptoAssets(prev => prev.map(asset => {
        if (asset.symbol === 'USDC') return asset;
        const percentChange = (Math.random() - 0.48) * 0.5; // Slight upward bias
        const newPrice = Math.max(0.1, asset.price * (1 + percentChange / 100));
        return {
          ...asset,
          price: parseFloat(newPrice.toFixed(2)),
          change24h: parseFloat((asset.change24h + percentChange).toFixed(2))
        };
      }));

      // 2. Randomly trigger simulated network logs
      const logSources: Array<'VISA_API' | 'CRYPTO_NODE' | 'GEMINI_AI' | 'SYSTEM'> = ['VISA_API', 'CRYPTO_NODE', 'GEMINI_AI', 'SYSTEM'];
      const logMessages = [
        { source: 'VISA_API', message: 'Visa Advanced Authorization (VAA) heartbeat active. Latency: 42ms.', type: 'info' },
        { source: 'CRYPTO_NODE', message: 'Gas price correlation optimized. Current Gwei: 24.', type: 'success' },
        { source: 'GEMINI_AI', message: 'Predictive Liquidity Model: Recommending USDC sweep to Visa Commercial rail within 2 hours.', type: 'info' },
        { source: 'SYSTEM', message: 'Database Bridge: Synced 12 new blocks with local AstraDB instance.', type: 'success' }
      ];

      if (Math.random() > 0.7) {
        const randomLog = logMessages[Math.floor(Math.random() * logMessages.length)];
        const now = new Date();
        const timeStr = now.toTimeString().split(' ')[0];
        setLogs(prev => [{ timestamp: timeStr, source: randomLog.source as any, message: randomLog.message, type: randomLog.type as any }, ...prev.slice(0, 49)]);
      }
    }, 4000);

    return () => clearInterval(interval);
  }, []);

  // --- Helper Functions ---
  const addLog = useCallback((source: 'VISA_API' | 'CRYPTO_NODE' | 'GEMINI_AI' | 'SYSTEM', message: string, type: 'info' | 'success' | 'warning' | 'error') => {
    const now = new Date();
    const timeStr = now.toTimeString().split(' ')[0];
    setLogs(prev => [{ timestamp: timeStr, source, message, type }, ...prev]);
  }, []);

  const toggleCardStatus = (cardId: string) => {
    setVisaCards(prev => prev.map(card => {
      if (card.id === cardId) {
        const nextStatus = card.status === 'Active' ? 'Frozen' : card.status === 'Frozen' ? 'Tokenized' : 'Active';
        addLog('VISA_API', `Card ${card.cardNumber.slice(-4)} status updated to ${nextStatus}.`, 'warning');
        return { ...card, status: nextStatus };
      }
      return card;
    }));
  };

  const handleVisaDirectTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(transferAmount);
    if (isNaN(amount) || amount <= 0) return;

    setIsProcessing(true);
    addLog('VISA_API', `Initiating Visa Direct push payment of $${amount.toLocaleString()}...`, 'info');

    setTimeout(() => {
      const card = visaCards.find(c => c.id === selectedCard);
      const crypto = cryptoAssets.find(a => a.symbol === selectedCrypto);

      if (!card || !crypto) {
        setIsProcessing(false);
        return;
      }

      if (transferDirection === 'VisaToCrypto') {
        if (card.balance < amount) {
          addLog('VISA_API', `Transfer failed: Insufficient funds on Visa Card (*${card.cardNumber.slice(-4)}).`, 'error');
          setIsProcessing(false);
          return;
        }

        // Deduct from Visa, Add to Crypto
        setVisaCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance - amount } : c));
        setCryptoAssets(prev => prev.map(a => a.symbol === crypto.symbol ? { ...a, balance: a.balance + (amount / a.price) } : a));
      } else {
        const cryptoValue = amount / crypto.price;
        if (crypto.balance < cryptoValue) {
          addLog('CRYPTO_NODE', `Transfer failed: Insufficient ${crypto.symbol} balance.`, 'error');
          setIsProcessing(false);
          return;
        }

        // Deduct from Crypto, Add to Visa
        setCryptoAssets(prev => prev.map(a => a.symbol === crypto.symbol ? { ...a, balance: a.balance - cryptoValue } : a));
        setVisaCards(prev => prev.map(c => c.id === card.id ? { ...c, balance: c.balance + amount } : c));
      }

      // Generate Transaction
      const newTx: UnifiedTransaction = {
        id: `TXN-${Math.floor(100 + Math.random() * 900)}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        type: transferDirection === 'VisaToCrypto' ? 'Visa Direct' : 'Crypto Bridge',
        source: transferDirection === 'VisaToCrypto' ? `Visa Card (*${card.cardNumber.slice(-4)})` : `${crypto.symbol} Wallet`,
        destination: transferDirection === 'VisaToCrypto' ? `${crypto.symbol} Wallet` : `Visa Card (*${card.cardNumber.slice(-4)})`,
        amount,
        currency: 'USD',
        status: 'Completed',
        riskScore: Math.floor(Math.random() * 30),
        txHash: '0x' + Array.from({ length: 40 }, () => Math.floor(Math.random() * 16).toString(16)).join(''),
        complianceStatus: 'Approved'
      };

      setTransactions(prev => [newTx, ...prev]);
      addLog('VISA_API', `Visa Direct settlement completed. Tx Hash: ${newTx.txHash?.slice(0, 10)}...`, 'success');
      
      // Trigger Gemini AI Compliance Audit
      setIsAiThinking(true);
      setTimeout(() => {
        const aiResponse = `Autonomous Compliance Audit for ${newTx.id}: Verified JWS signature on Visa payload. Cross-referenced with Ethereum smart contract state. Zero anomalies detected. Risk Score: ${newTx.riskScore}/100. Transaction cleared for instant settlement.`;
        addLog('GEMINI_AI', aiResponse, 'success');
        setIsAiThinking(false);
      }, 1500);

      setTransferAmount('');
      setIsProcessing(false);
    }, 2000);
  };

  // --- Gemini AI Chat Integration ---
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages(prev => [...prev, { sender: 'user', text: userMsg, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
    setChatInput('');
    setIsAiThinking(true);
    addLog('GEMINI_AI', `Analyzing request: "${userMsg}"`, 'info');

    // Simulate Gemini AI response with high-fidelity financial/crypto/Visa context
    setTimeout(() => {
      let aiText = '';
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes('settle') || lowerMsg.includes('optimize')) {
        aiText = `Based on current gas fees (24 Gwei) and Visa Direct push payment rails, the optimal settlement route is to batch-transfer USDC via the Solana network. This reduces transaction costs by 94.2% compared to Ethereum Mainnet and settles in < 2 seconds. I have pre-authorized a Visa Token Service (VTS) credential for this route.`;
      } else if (lowerMsg.includes('risk') || lowerMsg.includes('fraud') || lowerMsg.includes('compliance')) {
        aiText = `I have audited the last 50 unified transactions. Transaction TXN-105 remains flagged due to a geo-spatial anomaly (IP address mismatch with cardholder profile). I recommend keeping this card frozen until multi-factor hardware attestation is completed via the Identity Citadel.`;
      } else if (lowerMsg.includes('balance') || lowerMsg.includes('portfolio')) {
        const totalVisa = visaCards.reduce((acc, c) => acc + c.balance, 0);
        const totalCrypto = cryptoAssets.reduce((acc, a) => acc + (a.balance * a.price), 0);
        aiText = `Your unified ecosystem balance is $${(totalVisa + totalCrypto).toLocaleString(undefined, { minimumFractionDigits: 2 })}. Visa liquidity accounts for ${((totalVisa / (totalVisa + totalCrypto)) * 100).toFixed(1)}% of total assets, while Crypto wallets hold the remaining ${((totalCrypto / (totalVisa + totalCrypto)) * 100).toFixed(1)}%. Portfolio health is optimal.`;
      } else {
        aiText = `I have processed your query. Integrating Visa Developer APIs with decentralized smart contracts allows us to execute real-time atomic swaps. I can help you trigger a Visa Direct push payment, mint a virtual card via Visa Token Service, or run a compliance audit on your unified ledger. What would you like to do?`;
      }

      setChatMessages(prev => [...prev, { sender: 'gemini', text: aiText, timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) }]);
      addLog('GEMINI_AI', 'Response generated successfully.', 'success');
      setIsAiThinking(false);
    }, 2000);
  };

  // --- Calculations & Metrics ---
  const totalVisaBalance = useMemo(() => visaCards.reduce((acc, c) => acc + c.balance, 0), [visaCards]);
  const totalCryptoBalance = useMemo(() => cryptoAssets.reduce((acc, a) => acc + (a.balance * a.price), 0), [cryptoAssets]);
  const unifiedBalance = useMemo(() => totalVisaBalance + totalCryptoBalance, [totalVisaBalance, totalCryptoBalance]);

  const chartData = useMemo(() => {
    // Generate mock historical data for Visa vs Crypto settlement volume
    return [
      { name: '08:00', VisaVolume: 450000, CryptoVolume: 320000, GasFee: 45 },
      { name: '09:00', VisaVolume: 620000, CryptoVolume: 410000, GasFee: 52 },
      { name: '10:00', VisaVolume: 890000, CryptoVolume: 580000, GasFee: 68 },
      { name: '11:00', VisaVolume: 1200000, CryptoVolume: 950000, GasFee: 55 },
      { name: '12:00', VisaVolume: 1100000, CryptoVolume: 1150000, GasFee: 40 },
      { name: '13:00', VisaVolume: 1450000, CryptoVolume: 1300000, GasFee: 35 },
      { name: '14:00', VisaVolume: totalVisaBalance / 1000, CryptoVolume: totalCryptoBalance / 10000, GasFee: 24 }
    ];
  }, [totalVisaBalance, totalCryptoBalance]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-indigo-500 selection:text-white">
      {/* --- Header Section --- */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-xl shadow-lg shadow-indigo-500/20 ring-1 ring-indigo-400/30">
            <CreditCard className="w-8 h-8 text-white animate-pulse" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-indigo-300 bg-clip-text text-transparent">
                Visa Sovereign Ecosystem
              </h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 rounded-full border border-indigo-500/20">
                Gemini AI Active
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Unified Visa Developer Sandbox, Multi-Chain Crypto Settlement, & Autonomous Compliance
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Sandbox Toggle */}
          <button
            onClick={() => {
              setSandboxMode(!sandboxMode);
              addLog('SYSTEM', `Sandbox mode ${!sandboxMode ? 'enabled' : 'disabled'}.`, 'warning');
            }}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold border transition-all ${
              sandboxMode
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 shadow-lg shadow-emerald-500/5'
                : 'bg-slate-800 text-slate-400 border-slate-700'
            }`}
          >
            <Zap className="w-3.5 h-3.5" />
            {sandboxMode ? 'VISA SANDBOX: ACTIVE' : 'VISA PRODUCTION'}
          </button>

          {/* Status Indicators */}
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900 rounded-lg border border-slate-800 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
            <span className="text-slate-300 font-medium">Ethereum Node: Synced</span>
          </div>

          <button
            onClick={() => {
              addLog('SYSTEM', 'Manual ecosystem synchronization triggered.', 'info');
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 hover:text-white transition-all"
            title="Sync Ecosystem"
          >
            <RefreshCw className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* --- Top Stats Grid --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {/* Stat 1: Unified Balance */}
        <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl hover:border-indigo-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl group-hover:bg-indigo-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-400">Unified Ecosystem Balance</span>
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
              <Globe className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            ${unifiedBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+4.8% vs yesterday</span>
          </div>
        </div>

        {/* Stat 2: Visa Settlement Volume */}
        <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl hover:border-blue-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-400">Visa Direct Push Volume</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-400">
              <CreditCard className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            ${totalVisaBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-slate-400">
            <Activity className="w-3.5 h-3.5 text-blue-400" />
            <span>Active Limit: $8.0M</span>
          </div>
        </div>

        {/* Stat 3: Crypto Wallet Value */}
        <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl hover:border-emerald-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-400">Crypto Wallet Value</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">
            ${totalCryptoBalance.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>USDC, ETH, BTC, SOL</span>
          </div>
        </div>

        {/* Stat 4: Gemini AI Risk Mitigation */}
        <div className="relative overflow-hidden bg-slate-900/50 backdrop-blur-md border border-slate-800/80 rounded-2xl p-6 shadow-xl hover:border-violet-500/30 transition-all group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl group-hover:bg-violet-500/10 transition-all" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-sm font-medium text-slate-400">Gemini AI Risk Mitigation</span>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-400">
              <Brain className="w-5 h-5" />
            </div>
          </div>
          <h3 className="text-2xl font-bold text-white tracking-tight">99.98%</h3>
          <div className="flex items-center gap-1.5 mt-2 text-xs text-violet-400 font-medium">
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Zero compliance breaches</span>
          </div>
        </div>
      </section>

      {/* --- Main Content Grid --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* --- LEFT COLUMN: Visa Direct, Cards, & Charts (8/12 cols) --- */}
        <div className="lg:col-span-8 flex flex-col gap-8">
          
          {/* Section: Visa Direct & Crypto Bridge Settlement */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Zap className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Visa Direct & Crypto Bridge Settlement</h2>
              </div>
              <div className="flex bg-slate-800 p-1 rounded-lg border border-slate-700">
                <button
                  onClick={() => setTransferDirection('VisaToCrypto')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    transferDirection === 'VisaToCrypto'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Visa → Crypto
                </button>
                <button
                  onClick={() => setTransferDirection('CryptoToVisa')}
                  className={`px-3 py-1 rounded-md text-xs font-bold transition-all ${
                    transferDirection === 'CryptoToVisa'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'text-slate-400 hover:text-white'
                  }`}
                >
                  Crypto → Visa
                </button>
              </div>
            </div>

            <form onSubmit={handleVisaDirectTransfer} className="grid grid-cols-1 md:grid-cols-3 gap-6 items-end">
              {/* Source Card Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  {transferDirection === 'VisaToCrypto' ? 'Source Visa Card' : 'Destination Visa Card'}
                </label>
                <select
                  value={selectedCard}
                  onChange={(e) => setSelectedCard(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  {visaCards.map(card => (
                    <option key={card.id} value={card.id}>
                      {card.type} (*{card.cardNumber.slice(-4)}) - ${card.balance.toLocaleString()}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Crypto Selection */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase tracking-wider">
                  {transferDirection === 'VisaToCrypto' ? 'Destination Crypto Asset' : 'Source Crypto Asset'}
                </label>
                <select
                  value={selectedCrypto}
                  onChange={(e) => setSelectedCrypto(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                >
                  {cryptoAssets.map(asset => (
                    <option key={asset.symbol} value={asset.symbol}>
                      {asset.name} ({asset.symbol}) - Bal: {asset.balance.toFixed(2)}
                    </option>
                  ))}
                </select>
              </div>

              {/* Amount Input & Submit */}
              <div className="flex gap-3">
                <div className="relative flex-1">
                  <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-bold">$</span>
                  <input
                    type="number"
                    placeholder="Amount (USD)"
                    value={transferAmount}
                    onChange={(e) => setTransferAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-8 pr-4 py-3 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-all"
                    required
                  />
                </div>
                <button
                  type="submit"
                  disabled={isProcessing}
                  className="bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold px-6 py-3 rounded-xl text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center gap-2"
                >
                  {isProcessing ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" />
                      Settling...
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4" />
                      Execute
                    </>
                  )}
                </button>
              </div>
            </form>

            {/* Settlement Rail Info */}
            <div className="mt-4 p-3 bg-slate-950 rounded-xl border border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Info className="w-4 h-4 text-indigo-400" />
                <span>
                  Settlement Rail:{' '}
                  <strong className="text-slate-200">
                    {selectedCrypto === 'USDC' ? 'Visa B2B Connect (USDC Stablecoin Rail)' : 'Decentralized Liquidity Bridge'}
                  </strong>
                </span>
              </div>
              <span>Estimated Settlement Time: <strong className="text-emerald-400">&lt; 3 seconds</strong></span>
            </div>
          </div>

          {/* Section: Real-time Analytics Chart */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-bold text-white">Unified Settlement & Gas Fee Correlation</h2>
              </div>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                  Visa Direct Push
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />
                  Crypto Settlement
                </span>
                <span className="flex items-center gap-1.5 text-slate-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-amber-500" />
                  Gas Fee (Gwei)
                </span>
              </div>
            </div>

            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorVisa" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                    </linearGradient>
                    <linearGradient id="colorCrypto" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#10b981" stopOpacity={0.3} />
                      <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={11} />
                  <YAxis stroke="#64748b" fontSize={11} />
                  <Tooltip
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                    labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="VisaVolume" stroke="#6366f1" strokeWidth={2} fillOpacity={1} fill="url(#colorVisa)" name="Visa Push ($k)" />
                  <Area type="monotone" dataKey="CryptoVolume" stroke="#10b981" strokeWidth={2} fillOpacity={1} fill="url(#colorCrypto)" name="Crypto Bridge ($k)" />
                  <Line type="monotone" dataKey="GasFee" stroke="#f59e0b" strokeWidth={2} dot={{ r: 3 }} name="Gas Fee (Gwei)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Section: Visa Token Service & Card Customizer */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex justify-between items-center mb-6">
              <div className="flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-bold text-white">Visa Token Service (VTS) & Virtual Cards</h2>
              </div>
              <button
                onClick={() => {
                  const newCard: VisaCard = {
                    id: `card-${Date.now()}`,
                    cardNumber: `4${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)} ${Math.floor(1000 + Math.random() * 9000)}`,
                    cardholderName: 'NEW LIQUIDITY POOL',
                    expiryDate: '12/29',
                    cvv: Math.floor(100 + Math.random() * 900).toString(),
                    status: 'Active',
                    limit: 1000000,
                    balance: 0,
                    type: 'Visa Infinite'
                  };
                  setVisaCards(prev => [...prev, newCard]);
                  addLog('VISA_API', `New virtual card ${newCard.cardNumber.slice(-4)} minted successfully.`, 'success');
                }}
                className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 hover:text-white text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all"
              >
                <Plus className="w-4 h-4" />
                Mint Virtual Card
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {visaCards.map(card => (
                <div
                  key={card.id}
                  className={`relative overflow-hidden rounded-2xl p-5 border transition-all flex flex-col justify-between h-48 ${
                    card.status === 'Frozen'
                      ? 'bg-slate-950/80 border-slate-800 opacity-60'
                      : 'bg-gradient-to-br from-slate-900 to-slate-950 border-slate-800 hover:border-indigo-500/40 shadow-lg'
                  }`}
                >
                  {/* Card Glow Accent */}
                  <div className={`absolute -top-10 -right-10 w-24 h-24 rounded-full blur-2xl ${
                    card.status === 'Tokenized' ? 'bg-indigo-500/10' : card.status === 'Active' ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                  }`} />

                  <div className="flex justify-between items-start">
                    <div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">{card.type}</span>
                      <h4 className="text-sm font-bold text-slate-200 mt-0.5">{card.cardholderName}</h4>
                    </div>
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      card.status === 'Tokenized'
                        ? 'bg-indigo-500/10 text-indigo-400 border-indigo-500/20'
                        : card.status === 'Active'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                    }`}>
                      {card.status}
                    </span>
                  </div>

                  <div className="my-4">
                    <div className="flex items-center justify-between">
                      <p className="text-base font-mono tracking-widest text-slate-300">
                        {showCardDetails[card.id] ? card.cardNumber : `•••• •••• •••• ${card.cardNumber.slice(-4)}`}
                      </p>
                      <button
                        onClick={() => setShowCardDetails(prev => ({ ...prev, [card.id]: !prev[card.id] }))}
                        className="text-slate-500 hover:text-slate-300 transition-all"
                      >
                        {showCardDetails[card.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    <div className="flex gap-4 mt-1 text-[10px] font-mono text-slate-500">
                      <span>EXP: {card.expiryDate}</span>
                      <span>CVV: {showCardDetails[card.id] ? card.cvv : '•••'}</span>
                    </div>
                  </div>

                  <div className="flex justify-between items-center pt-2 border-t border-slate-800/60">
                    <div>
                      <span className="text-[9px] text-slate-500 uppercase block">Available Balance</span>
                      <span className="text-sm font-bold text-white">${card.balance.toLocaleString()}</span>
                    </div>
                    <div className="flex gap-2">
                      <button
                        onClick={() => toggleCardStatus(card.id)}
                        className="p-1.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-slate-400 hover:text-white transition-all border border-slate-700"
                        title={card.status === 'Active' ? 'Freeze Card' : 'Activate Card'}
                      >
                        {card.status === 'Active' ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
                      </button>
                      {card.status !== 'Tokenized' && (
                        <button
                          onClick={() => {
                            setVisaCards(prev => prev.map(c => c.id === card.id ? { ...c, status: 'Tokenized', tokenizedId: `vts-tok-${Math.floor(100000 + Math.random() * 900000)}` } : c));
                            addLog('VISA_API', `Card ${card.cardNumber.slice(-4)} tokenized via Visa Token Service.`, 'success');
                          }}
                          className="p-1.5 bg-indigo-600/20 hover:bg-indigo-600/30 rounded-lg text-indigo-400 hover:text-indigo-300 transition-all border border-indigo-500/30"
                          title="Tokenize Card"
                        >
                          <Cpu className="w-3.5 h-3.5" />
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: Gemini AI, Risk Engine, & Logs (4/12 cols) --- */}
        <div className="lg:col-span-4 flex flex-col gap-8">
          
          {/* Section: Gemini AI Autonomous Advisor */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[420px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Brain className="w-5 h-5 text-violet-400" />
                <h2 className="text-lg font-bold text-white">Gemini AI Advisor</h2>
              </div>
              <span className="flex items-center gap-1 text-xs text-emerald-400 font-semibold">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Online
              </span>
            </div>

            {/* Chat Messages Area */}
            <div className="flex-1 overflow-y-auto flex flex-col gap-3 mb-4 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`max-w-[85%] rounded-2xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'gemini'
                      ? 'bg-slate-800/60 text-slate-200 self-start border border-slate-700/50'
                      : 'bg-indigo-600 text-white self-end'
                  }`}
                >
                  <p>{msg.text}</p>
                  <span className="block text-[9px] text-slate-400 mt-1 text-right">{msg.timestamp}</span>
                </div>
              ))}
              {isAiThinking && (
                <div className="bg-slate-800/60 text-slate-200 self-start border border-slate-700/50 rounded-2xl p-3 text-xs flex items-center gap-2">
                  <RefreshCw className="w-3.5 h-3.5 animate-spin text-violet-400" />
                  <span>Gemini is analyzing ecosystem metrics...</span>
                </div>
              )}
            </div>

            {/* Quick Prompts */}
            <div className="flex gap-2 mb-3 overflow-x-auto pb-1">
              <button
                onClick={() => setChatInput('Optimize settlement route')}
                className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-700 transition-all"
              >
                Optimize Route
              </button>
              <button
                onClick={() => setChatInput('Audit transaction compliance')}
                className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-700 transition-all"
              >
                Audit Compliance
              </button>
              <button
                onClick={() => setChatInput('Ecosystem balance summary')}
                className="whitespace-nowrap bg-slate-800 hover:bg-slate-700 text-slate-300 text-[10px] font-semibold px-2.5 py-1 rounded-full border border-slate-700 transition-all"
              >
                Balance Summary
              </button>
            </div>

            {/* Chat Input Form */}
            <form onSubmit={handleSendMessage} className="flex gap-2">
              <input
                type="text"
                placeholder="Ask Gemini AI..."
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 focus:outline-none focus:border-violet-500 transition-all"
              />
              <button
                type="submit"
                className="bg-violet-600 hover:bg-violet-500 text-white font-bold px-4 py-2.5 rounded-xl text-xs transition-all flex items-center justify-center"
              >
                Send
              </button>
            </form>
          </div>

          {/* Section: Visa Advanced Authorization (VAA) Risk Engine */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
            <div className="flex items-center gap-2 mb-4 pb-3 border-b border-slate-800">
              <ShieldCheck className="w-5 h-5 text-emerald-400" />
              <h2 className="text-lg font-bold text-white">Visa Advanced Authorization (VAA)</h2>
            </div>

            <div className="flex flex-col gap-4">
              <div className="flex justify-between items-center p-3 bg-slate-950 rounded-xl border border-slate-800/60">
                <div>
                  <span className="text-xs font-bold text-slate-200 block">Real-time Fraud Scoring</span>
                  <span className="text-[10px] text-slate-400">Powered by Visa VAA + Gemini AI</span>
                </div>
                <span className="text-sm font-extrabold text-emerald-400">Active</span>
              </div>

              {/* Risk Score Gauge Indicator */}
              <div className="p-4 bg-slate-950 rounded-xl border border-slate-800/60 flex flex-col gap-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Average Ecosystem Risk Score</span>
                  <span className="font-bold text-emerald-400">14 / 100 (Low)</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div className="bg-gradient-to-r from-emerald-500 via-amber-500 to-rose-500 h-full" style={{ width: '14%' }} />
                </div>
              </div>

              {/* Compliance Checklist */}
              <div className="flex flex-col gap-2 text-xs">
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    JWS Signature Verification
                  </span>
                  <span className="text-slate-500">Passed</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    AML / KYC Screening
                  </span>
                  <span className="text-slate-500">Passed</span>
                </div>
                <div className="flex items-center justify-between text-slate-300">
                  <span className="flex items-center gap-2">
                    <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                    Smart Contract Audit Trail
                  </span>
                  <span className="text-slate-500">Passed</span>
                </div>
              </div>
            </div>
          </div>

          {/* Section: Real-time Integration Log Stream */}
          <div className="bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl flex flex-col h-[300px]">
            <div className="flex justify-between items-center mb-4 pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="w-5 h-5 text-indigo-400" />
                <h2 className="text-lg font-bold text-white">Ecosystem Log Stream</h2>
              </div>
              <button
                onClick={() => setLogs([])}
                className="text-slate-500 hover:text-slate-300 text-xs transition-all"
              >
                Clear Logs
              </button>
            </div>

            <div className="flex-1 overflow-y-auto font-mono text-[10px] flex flex-col gap-2 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.length === 0 ? (
                <div className="text-slate-600 text-center py-8">No logs recorded.</div>
              ) : (
                logs.map((log, idx) => (
                  <div key={idx} className="flex gap-2 items-start leading-relaxed">
                    <span className="text-slate-500 shrink-0">{log.timestamp}</span>
                    <span className={`font-bold shrink-0 ${
                      log.source === 'VISA_API'
                        ? 'text-blue-400'
                        : log.source === 'CRYPTO_NODE'
                        ? 'text-emerald-400'
                        : log.source === 'GEMINI_AI'
                        ? 'text-violet-400'
                        : 'text-slate-400'
                    }`}>
                      [{log.source}]
                    </span>
                    <span className={`${
                      log.type === 'success'
                        ? 'text-emerald-300'
                        : log.type === 'warning'
                        ? 'text-amber-300'
                        : log.type === 'error'
                        ? 'text-rose-400'
                        : 'text-slate-300'
                    }`}>
                      {log.message}
                    </span>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>

      {/* --- BOTTOM SECTION: Unified Transaction Ledger --- */}
      <section className="mt-8 bg-slate-900/40 backdrop-blur-md border border-slate-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-indigo-400" />
            <h2 className="text-lg font-bold text-white">Unified Transaction Ledger</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all">
              Filter: All
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all">
              Visa Direct
            </button>
            <button className="bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold px-3 py-1.5 rounded-lg border border-slate-700 transition-all">
              Crypto Bridge
            </button>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                <th className="py-3 px-4">Txn ID</th>
                <th className="py-3 px-4">Timestamp</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Source</th>
                <th className="py-3 px-4">Destination</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Risk Score</th>
                <th className="py-3 px-4">Compliance</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60 text-xs text-slate-300">
              {transactions.map(tx => (
                <tr key={tx.id} className="hover:bg-slate-800/20 transition-all">
                  <td className="py-3.5 px-4 font-mono font-bold text-slate-200">{tx.id}</td>
                  <td className="py-3.5 px-4 text-slate-400">{tx.timestamp}</td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold border ${
                      tx.type === 'Visa Direct'
                        ? 'bg-blue-500/10 text-blue-400 border-blue-500/20'
                        : tx.type === 'Crypto Bridge'
                        ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                        : 'bg-slate-500/10 text-slate-400 border-slate-500/20'
                    }`}>
                      {tx.type}
                    </span>
                  </td>
                  <td className="py-3.5 px-4 font-medium">{tx.source}</td>
                  <td className="py-3.5 px-4 font-medium">{tx.destination}</td>
                  <td className="py-3.5 px-4 font-bold text-white">${tx.amount.toLocaleString()}</td>
                  <td className="py-3.5 px-4">
                    <span className={`font-bold ${
                      tx.riskScore > 50 ? 'text-rose-400' : tx.riskScore > 25 ? 'text-amber-400' : 'text-emerald-400'
                    }`}>
                      {tx.riskScore} / 100
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`flex items-center gap-1.5 font-semibold ${
                      tx.complianceStatus === 'Approved'
                        ? 'text-emerald-400'
                        : tx.complianceStatus === 'Review Required'
                        ? 'text-amber-400'
                        : 'text-rose-400'
                    }`}>
                      {tx.complianceStatus === 'Approved' ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <AlertTriangle className="w-3.5 h-3.5" />
                      )}
                      {tx.complianceStatus}
                    </span>
                  </td>
                  <td className="py-3.5 px-4">
                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                      tx.status === 'Completed'
                        ? 'bg-emerald-500/10 text-emerald-400'
                        : tx.status === 'Pending'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-rose-500/10 text-rose-400'
                    }`}>
                      {tx.status}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}