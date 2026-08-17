import React, { useState, useEffect, useCallback } from 'react';
import { 
  Crown, 
  Gem, 
  Cpu, 
  TrendingUp, 
  Shield, 
  Globe, 
  Coins, 
  Zap, 
  ArrowUpRight, 
  Sparkles, 
  Wallet, 
  Activity, 
  Send, 
  RefreshCw, 
  Lock, 
  Sliders, 
  MessageSquare, 
  CheckCircle2,
  ChevronRight,
  DollarSign,
  Building,
  Scale
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface LedgerAccount {
  id: string;
  name: string;
  location: string;
  balance: number;
  currency: string;
  type: 'Sovereign' | 'Trust' | 'Vault' | 'Custody';
  routingNumber: string;
  status: 'Active' | 'Optimizing' | 'Secured';
}

interface Transaction {
  id: string;
  sender: string;
  receiver: string;
  amount: number;
  currency: string;
  status: 'Settled' | 'Processing' | 'AI-Optimized';
  timestamp: string;
  type: 'Wire' | 'RTGS' | 'Intra-Ledger';
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
  actionable?: boolean;
  actionType?: string;
}

export default function CitiImperialDashboard() {
  // --- STATE ---
  const [netWorth, setNetWorth] = useState<number>(14204958201.42);
  const [aiYield, setAiYield] = useState<number>(32.48);
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [selectedAccount, setSelectedAccount] = useState<string>('acc-1');
  const [wireAmount, setWireAmount] = useState<string>('');
  const [wireRecipient, setWireRecipient] = useState<string>('');
  const [wireDestination, setWireDestination] = useState<string>('Zurich Imperial Vault');
  const [chatInput, setChatInput] = useState<string>('');
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      sender: 'ai',
      text: 'Welcome back, Your Serene Highness. Citi Imperial AI has optimized your global liquidity across Modern Treasury ledgers. Yield is up 1.2% since your last login.',
      timestamp: 'Just now'
    }
  ]);
  const [allocation, setAllocation] = useState({
    asteroidMining: 25,
    quantumComputing: 35,
    sovereignBonds: 20,
    fineArtAI: 20
  });
  const [transactions, setTransactions] = useState<Transaction[]>([
    { id: 'TXN-9082', sender: 'Cayman Trust Corp', receiver: 'Zurich Imperial Vault', amount: 250000000, currency: 'USD', status: 'Settled', timestamp: '2 mins ago', type: 'RTGS' },
    { id: 'TXN-9081', sender: 'Citi Imperial AI', receiver: 'Singapore Sovereign Fund', amount: 120000000, currency: 'USD', status: 'AI-Optimized', timestamp: '12 mins ago', type: 'Intra-Ledger' },
    { id: 'TXN-9080', sender: 'London Custody', receiver: 'Luxembourg Private Ledger', amount: 450000000, currency: 'EUR', status: 'Settled', timestamp: '1 hour ago', type: 'Wire' },
    { id: 'TXN-9079', sender: 'Tokyo Liquidity Hub', receiver: 'Cayman Trust Corp', amount: 85000000, currency: 'USD', status: 'Settled', timestamp: '3 hours ago', type: 'RTGS' }
  ]);

  const [accounts, setAccounts] = useState<LedgerAccount[]>([
    { id: 'acc-1', name: 'Zurich Imperial Vault', location: 'Switzerland', balance: 5420958201.42, currency: 'USD', type: 'Vault', routingNumber: 'MT-ZUR-9981', status: 'Optimizing' },
    { id: 'acc-2', name: 'Cayman Sovereign Trust', location: 'Cayman Islands', balance: 4100000000.00, currency: 'USD', type: 'Trust', routingNumber: 'MT-CAY-4412', status: 'Secured' },
    { id: 'acc-3', name: 'Singapore Quantum Custody', location: 'Singapore', balance: 3284000000.00, currency: 'USD', type: 'Custody', routingNumber: 'MT-SGP-8801', status: 'Active' },
    { id: 'acc-4', name: 'London Royal Ledger', location: 'United Kingdom', balance: 1400000000.00, currency: 'GBP', type: 'Sovereign', routingNumber: 'MT-LON-1102', status: 'Secured' }
  ]);

  // --- SIMULATED REAL-TIME TICKERS ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Micro-fluctuations in net worth to simulate real-time AI trading & yield generation
      setNetWorth(prev => prev + (Math.random() * 1500 - 400));
      // Micro-fluctuations in AI yield
      setAiYield(prev => Math.min(45, Math.max(25, prev + (Math.random() * 0.04 - 0.02))));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // --- HANDLERS ---
  const handleOptimize = () => {
    setIsOptimizing(true);
    setTimeout(() => {
      setIsOptimizing(false);
      setAiYield(prev => prev + 1.45);
      setNetWorth(prev => prev + 12500000);
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: 'Modern Treasury Ledger optimization complete. Reallocated $1.2B from low-yield sovereign bonds to Quantum AI Arbitrage. Projected annual yield increased by +1.45%.',
          timestamp: 'Just now'
        }
      ]);
    }, 2000);
  };

  const handleWireTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(wireAmount);
    if (!amountNum || amountNum <= 0 || !wireRecipient) return;

    // Deduct from selected account
    setAccounts(prev => prev.map(acc => {
      if (acc.id === selectedAccount) {
        return { ...acc, balance: acc.balance - amountNum };
      }
      return acc;
    }));

    // Add to transactions
    const newTxn: Transaction = {
      id: `TXN-${Math.floor(1000 + Math.random() * 9000)}`,
      sender: accounts.find(a => a.id === selectedAccount)?.name || 'Imperial Account',
      receiver: wireRecipient,
      amount: amountNum,
      currency: 'USD',
      status: 'Processing',
      timestamp: 'Just now',
      type: 'RTGS'
    };

    setTransactions(prev => [newTxn, ...prev]);
    setNetWorth(prev => prev - amountNum * 0.0001); // Simulated ultra-low luxury fee

    // AI Concierge response
    setTimeout(() => {
      setTransactions(prev => prev.map(t => t.id === newTxn.id ? { ...t, status: 'Settled' } : t));
      setChatHistory(prev => [
        ...prev,
        {
          sender: 'ai',
          text: `Modern Treasury API successfully routed $${amountNum.toLocaleString()} USD to ${wireRecipient} via high-priority FedNow/RTGS. Settlement finalized in 1.4 seconds.`,
          timestamp: 'Just now'
        }
      ]);
    }, 1500);

    setWireAmount('');
    setWireRecipient('');
  };

  const handleChatSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatHistory(prev => [...prev, { sender: 'user', text: userMsg, timestamp: 'Just now' }]);
    setChatInput('');

    // AI Response Logic based on keywords
    setTimeout(() => {
      let aiResponse = "I have analyzed your request through the Citi Imperial AI core. Our Modern Treasury integration is standing by to execute your command.";
      
      if (userMsg.toLowerCase().includes('wire') || userMsg.toLowerCase().includes('transfer')) {
        aiResponse = "To initiate a multi-billion dollar wire, please use the Modern Treasury Ledger Routing panel on the left, or specify the exact sovereign entity you wish to fund.";
      } else if (userMsg.toLowerCase().includes('yield') || userMsg.toLowerCase().includes('optimize')) {
        aiResponse = "Analyzing global yield curves... I recommend reallocating 5% of your Singapore Custody reserves into our bespoke Orbital Real Estate AI Fund to capture an additional 4.2% APY.";
      } else if (userMsg.toLowerCase().includes('tax') || userMsg.toLowerCase().includes('cayman')) {
        aiResponse = "Cayman Sovereign Trust structures are fully optimized. Modern Treasury automated ledger rules have routed current-quarter gains to tax-exempt offshore vehicles, saving $42.1M in projected liabilities.";
      }

      setChatHistory(prev => [...prev, { sender: 'ai', text: aiResponse, timestamp: 'Just now' }]);
    }, 1000);
  };

  const handleAllocationChange = (key: keyof typeof allocation, value: number) => {
    setAllocation(prev => {
      const updated = { ...prev, [key]: value };
      // Simple normalization to keep total close to 100% is omitted for luxury freedom, but let's keep it interactive
      return updated;
    });
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* --- TOP LUXURY STATUS BAR --- */}
      <div className="bg-gradient-to-r from-amber-950 via-slate-900 to-amber-950 border-b border-amber-500/30 px-6 py-2 text-xs flex justify-between items-center tracking-widest text-amber-400/80">
        <div className="flex items-center gap-4">
          <span className="flex items-center gap-1">
            <Crown className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            CITI IMPERIAL ELITE MEMBERSHIP: ACTIVE
          </span>
          <span className="text-slate-500">|</span>
          <span className="flex items-center gap-1">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            QUANTUM LEDGER ENCRYPTION: SECURED
          </span>
        </div>
        <div className="flex items-center gap-4">
          <span>MODERN TREASURY API: CONNECTED</span>
          <span className="text-slate-500">|</span>
          <span>ZURICH TIME: {new Date().toLocaleTimeString('en-US', { timeZone: 'Europe/Zurich', hour: '2-digit', minute: '2-digit' })}</span>
        </div>
      </div>

      {/* --- MAIN HEADER --- */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-50 px-8 py-5 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-amber-500 to-yellow-500 rounded-full blur opacity-40 animate-pulse"></div>
            <div className="relative bg-slate-950 p-2.5 rounded-full border border-amber-500/50">
              <Crown className="w-8 h-8 text-amber-400" />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500 bg-clip-text text-transparent">
              CITIBANK IMPERIAL
            </h1>
            <p className="text-xs text-slate-400 tracking-widest uppercase">AI Sovereign Wealth &amp; Modern Treasury Orchestrator</p>
          </div>
        </div>

        {/* Real-time Net Worth Display */}
        <div className="text-right">
          <p className="text-xs text-amber-400/70 tracking-widest uppercase font-semibold">Total Sovereign Liquidity</p>
          <p className="text-3xl font-mono font-bold text-white tracking-tight">
            ${netWorth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
        </div>
      </header>

      {/* --- MAIN CONTENT GRID --- */}
      <main className="p-8 max-w-[1800px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* --- LEFT COLUMN: METRICS & LEDGERS (7 COLS) --- */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* METRICS GRID */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Metric 1 */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <TrendingUp className="w-6 h-6 text-amber-400" />
                </div>
                <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-2 py-1 rounded-full border border-emerald-500/20">
                  +12.4% MoM
                </span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">AI-Optimized Yield</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">
                {aiYield.toFixed(2)}%
              </p>
              <p className="text-xs text-slate-500 mt-2">Generating approx. ${(netWorth * (aiYield / 100) / 365).toLocaleString('en-US', { maximumFractionDigits: 0 })}/day</p>
            </div>

            {/* Metric 2 */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-blue-500/10 rounded-lg border border-blue-500/20">
                  <Globe className="w-6 h-6 text-blue-400" />
                </div>
                <span className="text-xs font-mono text-blue-400 bg-blue-500/10 px-2 py-1 rounded-full border border-blue-500/20">
                  5 Nodes
                </span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Modern Treasury Ledgers</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">Active Global</p>
              <p className="text-xs text-slate-500 mt-2">Instant cross-border settlement active</p>
            </div>

            {/* Metric 3 */}
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/20 rounded-2xl p-6 relative overflow-hidden group hover:border-amber-500/40 transition-all duration-300">
              <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
              <div className="flex justify-between items-start mb-4">
                <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                  <Gem className="w-6 h-6 text-emerald-400" />
                </div>
                <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-2 py-1 rounded-full border border-amber-500/20">
                  AAA Rated
                </span>
              </div>
              <p className="text-xs text-slate-400 uppercase tracking-wider">Sovereign Collateral</p>
              <p className="text-2xl font-mono font-bold text-white mt-1">$4.2B Liquid</p>
              <p className="text-xs text-slate-500 mt-2">Backed by physical gold &amp; orbital assets</p>
            </div>
          </div>

          {/* MODERN TREASURY LEDGER & VIRTUAL ACCOUNTS */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Building className="w-5 h-5 text-amber-400" />
                  Modern Treasury Ledger Accounts
                </h2>
                <p className="text-xs text-slate-400">Real-time virtual accounts with automated routing rules</p>
              </div>
              <button 
                onClick={handleOptimize}
                disabled={isOptimizing}
                className="flex items-center gap-2 bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.2)] disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isOptimizing ? 'animate-spin' : ''}`} />
                {isOptimizing ? 'Optimizing Liquidity...' : 'AI Rebalance Ledgers'}
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {accounts.map((acc) => (
                <div 
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc.id)}
                  className={`p-4 rounded-xl border transition-all cursor-pointer ${
                    selectedAccount === acc.id 
                      ? 'bg-slate-900 border-amber-500/60 shadow-[0_0_15px_rgba(214,175,53,0.1)]' 
                      : 'bg-slate-950/60 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-start">
                    <div>
                      <p className="text-sm font-bold text-white">{acc.name}</p>
                      <p className="text-xs text-slate-400">{acc.location} • {acc.routingNumber}</p>
                    </div>
                    <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                      acc.status === 'Optimizing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      acc.status === 'Secured' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                    }`}>
                      {acc.status}
                    </span>
                  </div>
                  <div className="mt-4 flex justify-between items-end">
                    <span className="text-xs text-slate-500 font-mono">{acc.type}</span>
                    <span className="text-lg font-mono font-bold text-amber-400">
                      ${acc.balance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* AI SOVEREIGN WEALTH ALLOCATOR */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <Sliders className="w-5 h-5 text-amber-400" />
                  AI Sovereign Wealth Allocator
                </h2>
                <p className="text-xs text-slate-400">Direct AI capital deployment into ultra-exclusive asset classes</p>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-500/10 px-3 py-1 rounded-full border border-amber-500/20 flex items-center gap-1">
                <Sparkles className="w-3 h-3" />
                Dynamic Yield Optimization
              </span>
            </div>

            <div className="space-y-5">
              {/* Slider 1 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Asteroid Mining &amp; Off-Planet Minerals</span>
                  <span className="text-amber-400 font-mono font-bold">{allocation.asteroidMining}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={allocation.asteroidMining}
                  onChange={(e) => handleAllocationChange('asteroidMining', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Slider 2 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Quantum Computing &amp; AI Arbitrage</span>
                  <span className="text-amber-400 font-mono font-bold">{allocation.quantumComputing}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={allocation.quantumComputing}
                  onChange={(e) => handleAllocationChange('quantumComputing', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Slider 3 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Sovereign Debt &amp; Central Bank Liquidity</span>
                  <span className="text-amber-400 font-mono font-bold">{allocation.sovereignBonds}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={allocation.sovereignBonds}
                  onChange={(e) => handleAllocationChange('sovereignBonds', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* Slider 4 */}
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-300 font-medium">Bespoke Fine Art &amp; Historical Artifacts AI Fund</span>
                  <span className="text-amber-400 font-mono font-bold">{allocation.fineArtAI}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={allocation.fineArtAI}
                  onChange={(e) => handleAllocationChange('fineArtAI', parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>
            </div>
          </div>

        </div>

        {/* --- RIGHT COLUMN: AI CONCIERGE & TRANSACTIONS (5 COLS) --- */}
        <div className="lg:col-span-5 space-y-8">
          
          {/* CITI IMPERIAL AI CONCIERGE */}
          <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-amber-500/30 rounded-2xl p-6 shadow-[0_0_30px_rgba(212,175,55,0.05)] flex flex-col h-[480px]">
            <div className="flex justify-between items-center pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                  <Cpu className="w-5 h-5 text-amber-400" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white">Citi Imperial AI Concierge</h2>
                  <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-ping"></span>
                    Quantum Core Online
                  </p>
                </div>
              </div>
              <span className="text-xs font-mono text-slate-400">v4.2-Sovereign</span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto my-4 space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {chatHistory.map((msg, idx) => (
                <div 
                  key={idx} 
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div className={`max-w-[85%] rounded-xl p-3 text-xs leading-relaxed ${
                    msg.sender === 'user' 
                      ? 'bg-amber-500 text-slate-950 font-medium rounded-tr-none' 
                      : 'bg-slate-900 text-slate-200 border border-slate-800 rounded-tl-none'
                  }`}>
                    {msg.text}
                  </div>
                  <span className="text-[9px] text-slate-500 mt-1 px-1">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleChatSubmit} className="flex gap-2 pt-2 border-t border-slate-800">
              <input 
                type="text" 
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Command AI (e.g., 'Optimize tax exposure via Cayman Trust')..."
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
              />
              <button 
                type="submit"
                className="bg-amber-500 hover:bg-amber-600 text-slate-950 p-2 rounded-lg transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* HIGH-VALUE WIRE ROUTING (MODERN TREASURY API) */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <h2 className="text-sm font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Modern Treasury High-Value Wire Routing
            </h2>
            <form onSubmit={handleWireTransfer} className="space-y-4">
              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Source Ledger Account</label>
                <select 
                  value={selectedAccount}
                  onChange={(e) => setSelectedAccount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                >
                  {accounts.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} (${acc.balance.toLocaleString()})
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Recipient Entity</label>
                  <input 
                    type="text" 
                    required
                    value={wireRecipient}
                    onChange={(e) => setWireRecipient(e.target.value)}
                    placeholder="e.g., Swiss Trust Corp"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  />
                </div>
                <div>
                  <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Destination Routing</label>
                  <select 
                    value={wireDestination}
                    onChange={(e) => setWireDestination(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-amber-500/50"
                  >
                    <option value="Zurich Imperial Vault">Zurich Imperial Vault</option>
                    <option value="Cayman Sovereign Trust">Cayman Sovereign Trust</option>
                    <option value="Singapore Quantum Custody">Singapore Quantum Custody</option>
                    <option value="London Royal Ledger">London Royal Ledger</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[10px] text-slate-400 uppercase tracking-wider mb-1">Amount (USD)</label>
                <div className="relative">
                  <span className="absolute left-3 top-2 text-xs text-amber-400 font-mono">$</span>
                  <input 
                    type="number" 
                    required
                    value={wireAmount}
                    onChange={(e) => setWireAmount(e.target.value)}
                    placeholder="500,000,000"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-7 pr-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-amber-500/50"
                  />
                </div>
              </div>

              <button 
                type="submit"
                className="w-full bg-gradient-to-r from-amber-500 to-yellow-600 hover:from-amber-600 hover:to-yellow-700 text-slate-950 font-bold text-xs py-2.5 rounded-lg transition-all shadow-[0_0_15px_rgba(245,158,11,0.1)] flex items-center justify-center gap-2"
              >
                <Lock className="w-3.5 h-3.5" />
                Authorize Sovereign Wire via FedNow
              </button>
            </form>
          </div>

          {/* REAL-TIME CAPITAL FLOWS */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 backdrop-blur-sm">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-sm font-bold text-white flex items-center gap-2">
                <Activity className="w-4 h-4 text-amber-400" />
                Real-Time Capital Flows
              </h2>
              <span className="text-[10px] font-mono text-slate-500">Modern Treasury API Logs</span>
            </div>

            <div className="space-y-3">
              {transactions.map((txn) => (
                <div key={txn.id} className="flex justify-between items-center p-3 bg-slate-950/40 rounded-xl border border-slate-900 hover:border-slate-800 transition-all">
                  <div className="flex items-center gap-3">
                    <div className="p-1.5 bg-slate-900 rounded-lg border border-slate-800">
                      <ArrowUpRight className="w-4 h-4 text-amber-400" />
                    </div>
                    <div>
                      <p className="text-xs font-bold text-white">{txn.receiver}</p>
                      <p className="text-[10px] text-slate-500">From {txn.sender} • {txn.type}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <p className="text-xs font-mono font-bold text-amber-400">
                      +${txn.amount.toLocaleString()} {txn.currency}
                    </p>
                    <span className={`text-[9px] font-mono px-1.5 py-0.5 rounded ${
                      txn.status === 'Settled' ? 'bg-emerald-500/10 text-emerald-400' :
                      txn.status === 'AI-Optimized' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-blue-500/10 text-blue-400 animate-pulse'
                    }`}>
                      {txn.status}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

        </div>

      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-8 mt-12 text-center text-xs text-slate-600 space-y-2">
        <p className="flex items-center justify-center gap-2 text-amber-400/60 font-semibold">
          <Scale className="w-4 h-4" />
          CITI IMPERIAL SOVEREIGN WEALTH COMPLIANCE &amp; REGULATORY DISCLOSURE
        </p>
        <p className="max-w-3xl mx-auto leading-relaxed">
          This platform is reserved exclusively for sovereign wealth funds, central banks, and ultra-high-net-worth individuals with assets exceeding $10 Billion USD. All transactions are routed via Modern Treasury APIs and optimized in real-time by the Citi Imperial AI Quantum Core. Past performance of AI-driven yield optimization is not indicative of future multi-billion dollar returns.
        </p>
        <p className="text-[10px] text-slate-700">
          © {new Date().getFullYear()} Citibank Imperial N.A. Member FDIC. Modern Treasury Integration Partner. All Rights Reserved.
        </p>
      </footer>
    </div>
  );
}