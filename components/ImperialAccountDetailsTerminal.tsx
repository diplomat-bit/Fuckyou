import React, { useState, useEffect } from 'react';
import { 
  Crown, 
  Shield, 
  TrendingUp, 
  Cpu, 
  Coins, 
  Layers, 
  ArrowUpRight, 
  Zap, 
  Globe, 
  Compass, 
  Gem, 
  ChevronRight, 
  RefreshCw, 
  Lock, 
  Sliders, 
  Activity,
  DollarSign,
  Briefcase,
  Anchor,
  Award
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface AccountDetails {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'credit_card' | 'loan' | 'line_of_credit' | 'brokerage' | 'retirement';
  accountNumber: string;
  routingNumber?: string;
  balance: number;
  currency: string;
  apy?: string;
  limit?: number;
  availableCredit?: number;
  interestRate?: string;
  modernTreasuryLedgerId: string;
  sovereignRating: string;
  status: 'Active' | 'Secured' | 'Optimizing';
}

interface AIInsight {
  id: string;
  title: string;
  description: string;
  impactValue: string;
  type: 'yield' | 'tax' | 'arbitrage' | 'liquidity';
  confidence: number;
}

export default function ImperialAccountDetailsTerminal() {
  // --- STATE ---
  const [selectedAccount, setSelectedAccount] = useState<string>('acc-01');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [optimizationProgress, setOptimizationProgress] = useState<number>(0);
  const [ledgerSyncing, setLedgerSyncing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'ledger' | 'ai_insights'>('overview');
  const [systemTime, setSystemTime] = useState<string>('');

  useEffect(() => {
    const timer = setInterval(() => {
      const now = new Date();
      setSystemTime(now.toUTCString());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // --- ULTRA-LUXURY MOCK DATA ---
  const accounts: AccountDetails[] = [
    {
      id: 'acc-01',
      name: 'Sovereign Reserve Checking',
      type: 'checking',
      accountNumber: '•••• •••• 8888',
      routingNumber: '021000021 (Citi Private Bank NY)',
      balance: 142500000.00,
      currency: 'USD',
      modernTreasuryLedgerId: 'ledger_usr_999_sov_chk',
      sovereignRating: 'AAA (Imperial Class)',
      status: 'Secured'
    },
    {
      id: 'acc-02',
      name: 'Imperial Yield Vault',
      type: 'savings',
      accountNumber: '•••• •••• 9999',
      routingNumber: '021000021 (Citi Private Bank NY)',
      balance: 450000000.00,
      currency: 'USD',
      apy: '8.45% AI-Boosted APY',
      modernTreasuryLedgerId: 'ledger_usr_999_imp_sav',
      sovereignRating: 'AAA (Imperial Class)',
      status: 'Optimizing'
    },
    {
      id: 'acc-03',
      name: 'Citibank Centurion Ultimate',
      type: 'credit_card',
      accountNumber: '•••• •••• •••• 0001',
      balance: -1240000.00,
      currency: 'USD',
      limit: 50000000.00,
      availableCredit: 48760000.00,
      modernTreasuryLedgerId: 'ledger_usr_999_centurion',
      sovereignRating: 'Sovereign Backed',
      status: 'Active'
    },
    {
      id: 'acc-04',
      name: 'Sovereign Mega-Yacht Financing',
      type: 'loan',
      accountNumber: '•••• •••• 4444',
      balance: -85000000.00,
      currency: 'USD',
      interestRate: '1.95% Fixed Sovereign',
      modernTreasuryLedgerId: 'ledger_usr_999_yacht_loan',
      sovereignRating: 'AA+ Secured',
      status: 'Active'
    },
    {
      id: 'acc-05',
      name: 'Modern Treasury Liquidity Line',
      type: 'line_of_credit',
      accountNumber: '•••• •••• 5555',
      balance: 185000000.00,
      currency: 'USD',
      limit: 200000000.00,
      modernTreasuryLedgerId: 'ledger_usr_999_mt_loc',
      sovereignRating: 'AAA Sovereign',
      status: 'Optimizing'
    },
    {
      id: 'acc-06',
      name: 'Quantum AI Arbitrage Portfolio',
      type: 'brokerage',
      accountNumber: '•••• •••• 7777',
      balance: 1204500000.00,
      currency: 'USD',
      modernTreasuryLedgerId: 'ledger_usr_999_quantum_broker',
      sovereignRating: 'AAA (Imperial Class)',
      status: 'Optimizing'
    },
    {
      id: 'acc-07',
      name: 'Dynasty Generational Trust',
      type: 'retirement',
      accountNumber: '•••• •••• 1111',
      balance: 890000000.00,
      currency: 'USD',
      modernTreasuryLedgerId: 'ledger_usr_999_dynasty_trust',
      sovereignRating: 'AAA (Imperial Class)',
      status: 'Secured'
    }
  ];

  const aiInsights: AIInsight[] = [
    {
      id: 'ins-01',
      title: 'Sovereign Yield Arbitrage',
      description: 'Modern Treasury detected a 120bps yield discrepancy between Swiss Sovereign Bonds and Citibank Imperial Vault. Recommend routing $45,000,000 via RTGS.',
      impactValue: '+$540,000 Annually',
      type: 'yield',
      confidence: 99.8
    },
    {
      id: 'ins-02',
      title: 'Tax-Loss Harvesting Optimization',
      description: 'AI Engine detected $12,400,000 in unrealized losses in Quantum Brokerage. Offsetting against real estate gains will optimize tax liability to absolute zero.',
      impactValue: '+$4,340,000 Saved',
      type: 'tax',
      confidence: 98.9
    },
    {
      id: 'ins-03',
      title: 'Modern Treasury Routing Efficiency',
      description: 'Automate high-value wire routing through FedNow and SWIFT gpi simultaneously to bypass regional liquidity locks. Reduces settlement latency to 1.2 seconds.',
      impactValue: 'Instant Settlement',
      type: 'arbitrage',
      confidence: 99.9
    }
  ];

  const currentAccount = accounts.find(a => a.id === selectedAccount) || accounts[0];

  // --- SIMULATE AI OPTIMIZATION ---
  const triggerAIOptimization = () => {
    setIsOptimizing(true);
    setOptimizationProgress(0);
    const interval = setInterval(() => {
      setOptimizationProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setTimeout(() => setIsOptimizing(false), 1000);
          return 100;
        }
        return prev + 10;
      });
    }, 200);
  };

  // --- SIMULATE LEDGER SYNC ---
  const triggerLedgerSync = () => {
    setLedgerSyncing(true);
    setTimeout(() => {
      setLedgerSyncing(false);
    }, 1500);
  };

  // --- CALCULATE TOTAL SOVEREIGN WEALTH ---
  const totalAssets = accounts.reduce((sum, acc) => acc.balance > 0 ? sum + acc.balance : sum, 0);
  const totalLiabilities = Math.abs(accounts.reduce((sum, acc) => acc.balance < 0 ? sum + acc.balance : sum, 0));
  const netSovereignWealth = totalAssets - totalLiabilities;

  return (
    <div className="min-h-screen bg-neutral-950 text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* TOP LUXURY HEADER */}
      <header className="border-b border-amber-500/20 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 px-8 py-4 flex justify-between items-center">
        <div className="flex items-center gap-3">
          <div className="relative">
            <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-200 opacity-75 blur animate-pulse"></div>
            <div className="relative bg-black p-2 rounded-full border border-amber-400/40">
              <Crown className="h-6 w-6 text-amber-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs tracking-[0.3em] text-amber-400 font-bold uppercase">Citibank Imperial</span>
              <span className="text-[9px] bg-amber-500/10 text-amber-300 border border-amber-500/30 px-1.5 py-0.5 rounded font-mono">AI ORACLE v9.4</span>
            </div>
            <h1 className="text-lg font-semibold tracking-tight text-slate-100">Sovereign Wealth Terminal</h1>
          </div>
        </div>

        {/* SYSTEM STATUS */}
        <div className="hidden lg:flex items-center gap-6 text-xs font-mono">
          <div className="flex items-center gap-2 text-emerald-400">
            <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></span>
            <span>Modern Treasury Ledger: Connected</span>
          </div>
          <div className="text-slate-400">
            <span>System Time: </span>
            <span className="text-amber-400">{systemTime || 'Syncing...'}</span>
          </div>
          <div className="border-l border-neutral-800 pl-6 flex items-center gap-2">
            <Shield className="h-4 w-4 text-amber-400" />
            <span className="text-slate-300">Quantum Encrypted</span>
          </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <main className="max-w-7xl mx-auto p-6 lg:p-8 space-y-8">
        
        {/* SOVEREIGN BALANCE METRICS */}
        <section className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Total Assets */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Total Sovereign Assets</p>
                <h3 className="text-3xl font-bold tracking-tight text-amber-400 mt-2">
                  ${totalAssets.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-2 bg-amber-500/10 rounded-lg border border-amber-500/20">
                <Coins className="h-5 w-5 text-amber-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-emerald-400">
              <ArrowUpRight className="h-4 w-4" />
              <span>+14.2% AI Arbitrage Yield (YTD)</span>
            </div>
          </div>

          {/* Total Liabilities */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 shadow-2xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-red-500/5 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono tracking-wider text-slate-400 uppercase">Sovereign Liabilities</p>
                <h3 className="text-3xl font-bold tracking-tight text-slate-100 mt-2">
                  ${totalLiabilities.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-2 bg-red-500/10 rounded-lg border border-red-500/20">
                <Anchor className="h-5 w-5 text-red-400" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <Lock className="h-4 w-4 text-amber-400" />
              <span>Secured by Sovereign Real Estate & Yachts</span>
            </div>
          </div>

          {/* Net Sovereign Wealth */}
          <div className="relative overflow-hidden rounded-2xl border border-amber-400 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6 shadow-2xl">
            <div className="absolute -inset-px rounded-2xl bg-gradient-to-r from-amber-500/20 via-yellow-200/10 to-amber-600/20 pointer-events-none"></div>
            <div className="absolute top-0 right-0 w-32 h-32 bg-yellow-400/10 rounded-full blur-3xl"></div>
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-mono tracking-wider text-amber-400 uppercase font-bold">Net Sovereign Wealth</p>
                <h3 className="text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 mt-2">
                  ${netSovereignWealth.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-2 bg-amber-400 text-black rounded-lg">
                <Gem className="h-5 w-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-amber-300">
              <Award className="h-4 w-4" />
              <span>Imperial Tier Status: Active</span>
            </div>
          </div>
        </section>

        {/* MAIN INTERACTIVE TERMINAL */}
        <section className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: ACCOUNTS GROUP DETAILS LIST (5 Cols) */}
          <div className="lg:col-span-5 space-y-4">
            <div className="flex justify-between items-center px-2">
              <h2 className="text-sm font-mono tracking-widest text-amber-400 uppercase flex items-center gap-2">
                <Layers className="h-4 w-4" /> Accounts Group Details
              </h2>
              <span className="text-xs text-slate-500 font-mono">{accounts.length} Accounts</span>
            </div>

            <div className="space-y-3 max-h-[600px] overflow-y-auto pr-2 custom-scrollbar">
              {accounts.map((acc) => {
                const isSelected = acc.id === selectedAccount;
                return (
                  <button
                    key={acc.id}
                    onClick={() => setSelectedAccount(acc.id)}
                    className={`w-full text-left transition-all duration-300 rounded-xl p-4 border ${
                      isSelected 
                        ? 'bg-gradient-to-r from-neutral-900 to-neutral-950 border-amber-400 shadow-lg shadow-amber-500/5' 
                        : 'bg-neutral-900/40 border-neutral-800 hover:border-amber-500/30 hover:bg-neutral-900/60'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className={`h-2 w-2 rounded-full ${
                            acc.status === 'Optimizing' ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'
                          }`}></span>
                          <span className="text-xs font-mono text-slate-400 uppercase tracking-wider">{acc.type}</span>
                        </div>
                        <h4 className="font-semibold text-slate-100 tracking-tight">{acc.name}</h4>
                        <p className="text-xs font-mono text-slate-500">{acc.accountNumber}</p>
                      </div>
                      <div className="text-right">
                        <span className={`text-base font-bold font-mono ${
                          acc.balance < 0 ? 'text-red-400' : 'text-amber-400'
                        }`}>
                          {acc.balance < 0 ? '-' : ''}${Math.abs(acc.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                        </span>
                        {acc.apy && (
                          <p className="text-[10px] text-emerald-400 font-mono mt-1">{acc.apy}</p>
                        )}
                        {acc.interestRate && (
                          <p className="text-[10px] text-amber-300 font-mono mt-1">{acc.interestRate}</p>
                        )}
                      </div>
                    </div>

                    {/* Modern Treasury Ledger Tag */}
                    <div className="mt-3 pt-3 border-t border-neutral-800/60 flex justify-between items-center text-[10px] font-mono text-slate-500">
                      <span>Ledger: {acc.modernTreasuryLedgerId}</span>
                      <span className="text-amber-400/80">{acc.sovereignRating}</span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* RIGHT COLUMN: DETAILED VIEW & AI OPTIMIZATION (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* TABS */}
            <div className="flex border-b border-neutral-800">
              <button
                onClick={() => setActiveTab('overview')}
                className={`px-6 py-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
                  activeTab === 'overview' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Account Overview
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`px-6 py-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
                  activeTab === 'ledger' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Modern Treasury Ledger
              </button>
              <button
                onClick={() => setActiveTab('ai_insights')}
                className={`px-6 py-3 text-xs font-mono tracking-wider uppercase border-b-2 transition-all ${
                  activeTab === 'ai_insights' ? 'border-amber-400 text-amber-400' : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                AI Wealth Insights
              </button>
            </div>

            {/* TAB CONTENT: OVERVIEW */}
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* Gold-Plated Chart & Balance Display */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-neutral-900 to-neutral-950 p-6">
                  <div className="absolute top-0 right-0 p-4">
                    <span className="text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 px-2 py-1 rounded">
                      REAL-TIME FEED
                    </span>
                  </div>

                  <p className="text-xs font-mono text-slate-400 uppercase tracking-wider">Selected Account Balance</p>
                  <h2 className="text-4xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-amber-500 mt-2 font-mono">
                    {currentAccount.balance < 0 ? '-' : ''}${Math.abs(currentAccount.balance).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </h2>

                  {/* Gold-Plated SVG Chart */}
                  <div className="mt-8 h-48 w-full relative">
                    <div className="absolute inset-0 flex items-end justify-between opacity-20">
                      {[...Array(12)].map((_, i) => (
                        <div key={i} className="w-1 bg-amber-500" style={{ height: `${Math.sin(i) * 40 + 60}%` }}></div>
                      ))}
                    </div>
                    {/* Glowing Gold Line */}
                    <svg className="w-full h-full overflow-visible" viewBox="0 0 100 100" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="goldGrad" x1="0" y1="0" x2="1" y2="0">
                          <stop offset="0%" stopColor="#D4AF37" />
                          <stop offset="50%" stopColor="#FFD700" />
                          <stop offset="100%" stopColor="#AA7C11" />
                        </linearGradient>
                        <filter id="glow" x="-20%" y="-20%" width="140%" height="140%">
                          <feGaussianBlur stdDeviation="2" result="blur" />
                          <feComposite in="SourceGraphic" in2="blur" operator="over" />
                        </filter>
                      </defs>
                      <path
                        d="M 0 80 Q 20 20, 40 50 T 80 10 T 100 30"
                        fill="none"
                        stroke="url(#goldGrad)"
                        strokeWidth="2"
                        filter="url(#glow)"
                      />
                      {/* Area fill */}
                      <path
                        d="M 0 80 Q 20 20, 40 50 T 80 10 T 100 30 L 100 100 L 0 100 Z"
                        fill="url(#goldGrad)"
                        opacity="0.05"
                      />
                    </svg>
                    <div className="absolute bottom-2 left-0 right-0 flex justify-between text-[10px] font-mono text-slate-500">
                      <span>00:00 UTC</span>
                      <span>06:00 UTC</span>
                      <span>12:00 UTC</span>
                      <span>18:00 UTC</span>
                      <span>Now</span>
                    </div>
                  </div>
                </div>

                {/* Account Metadata Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Routing Transit Number</span>
                    <p className="text-sm font-mono text-slate-200">{currentAccount.routingNumber || 'N/A - Credit/Loan Line'}</p>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Sovereign Security Rating</span>
                    <p className="text-sm font-mono text-amber-400 flex items-center gap-1.5">
                      <Shield className="h-4 w-4" /> {currentAccount.sovereignRating}
                    </p>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Modern Treasury Ledger ID</span>
                    <p className="text-xs font-mono text-slate-300 truncate">{currentAccount.modernTreasuryLedgerId}</p>
                  </div>
                  <div className="bg-neutral-900/40 border border-neutral-800 rounded-xl p-4 space-y-1">
                    <span className="text-[10px] font-mono text-slate-500 uppercase">Account Status</span>
                    <p className="text-sm font-mono text-emerald-400 flex items-center gap-1.5">
                      <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse"></span>
                      {currentAccount.status}
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: MODERN TREASURY LEDGER */}
            {activeTab === 'ledger' && (
              <div className="space-y-6">
                <div className="bg-neutral-900/40 border border-neutral-800 rounded-2xl p-6 space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-lg font-semibold text-slate-100">Modern Treasury Ledger Sync</h3>
                      <p className="text-xs text-slate-400">Real-time double-entry ledger tracking for sovereign assets</p>
                    </div>
                    <button
                      onClick={triggerLedgerSync}
                      disabled={ledgerSyncing}
                      className="flex items-center gap-2 px-4 py-2 bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/30 rounded-lg text-xs font-mono text-amber-400 transition-all"
                    >
                      <RefreshCw className={`h-4 w-4 ${ledgerSyncing ? 'animate-spin' : ''}`} />
                      {ledgerSyncing ? 'Syncing Ledger...' : 'Sync Ledger'}
                    </button>
                  </div>

                  {/* Ledger Visualizer */}
                  <div className="border border-neutral-800 rounded-xl overflow-hidden bg-black">
                    <div className="bg-neutral-900 px-4 py-3 border-b border-neutral-800 flex justify-between items-center text-xs font-mono text-slate-400">
                      <span>LEDGER ID: {currentAccount.modernTreasuryLedgerId}</span>
                      <span className="text-emerald-400">STATUS: SYNCHRONIZED</span>
                    </div>
                    <div className="p-4 space-y-4">
                      {/* Ledger Entry 1 */}
                      <div className="flex justify-between items-center text-xs font-mono border-b border-neutral-900 pb-3">
                        <div>
                          <p className="text-slate-300">Sovereign Wire Inbound (SWIFT gpi)</p>
                          <p className="text-[10px] text-slate-500">Ref: tx_mt_99201823</p>
                        </div>
                        <div className="text-right">
                          <p className="text-emerald-400 font-bold">+$12,500,000.00</p>
                          <p className="text-[10px] text-slate-500">Settled via FedNow</p>
                        </div>
                      </div>
                      {/* Ledger Entry 2 */}
                      <div className="flex justify-between items-center text-xs font-mono border-b border-neutral-900 pb-3">
                        <div>
                          <p className="text-slate-300">AI Yield Reallocation</p>
                          <p className="text-[10px] text-slate-500">Ref: tx_mt_88301922</p>
                        </div>
                        <div className="text-right">
                          <p className="text-amber-400 font-bold">+$450,000.00</p>
                          <p className="text-[10px] text-slate-500">Internal Ledger Transfer</p>
                        </div>
                      </div>
                      {/* Ledger Entry 3 */}
                      <div className="flex justify-between items-center text-xs font-mono">
                        <div>
                          <p className="text-slate-300">Sovereign Yacht Maintenance</p>
                          <p className="text-[10px] text-slate-500">Ref: tx_mt_77201922</p>
                        </div>
                        <div className="text-right">
                          <p className="text-red-400 font-bold">-$120,000.00</p>
                          <p className="text-[10px] text-slate-500">Settled via RTGS</p>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Modern Treasury Routing Map */}
                  <div className="space-y-3">
                    <h4 className="text-xs font-mono text-slate-400 uppercase tracking-wider">High-Value Routing Path</h4>
                    <div className="grid grid-cols-4 gap-2 text-center text-[10px] font-mono">
                      <div className="bg-neutral-900 p-3 rounded-lg border border-amber-500/20">
                        <p className="text-amber-400 font-bold">CITIBANK NY</p>
                        <p className="text-slate-500 mt-1">Origin</p>
                      </div>
                      <div className="bg-neutral-900 p-3 rounded-lg border border-amber-500/20">
                        <p className="text-amber-400 font-bold">MODERN TREASURY</p>
                        <p className="text-slate-500 mt-1">Ledger Sync</p>
                      </div>
                      <div className="bg-neutral-900 p-3 rounded-lg border border-amber-500/20">
                        <p className="text-amber-400 font-bold">FEDNOW / RTGS</p>
                        <p className="text-slate-500 mt-1">Settlement</p>
                      </div>
                      <div className="bg-neutral-900 p-3 rounded-lg border border-amber-500/20">
                        <p className="text-emerald-400 font-bold">SOVEREIGN VAULT</p>
                        <p className="text-slate-500 mt-1">Destination</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: AI WEALTH INSIGHTS */}
            {activeTab === 'ai_insights' && (
              <div className="space-y-6">
                {/* AI Optimization Trigger */}
                <div className="relative overflow-hidden rounded-2xl border border-amber-400 bg-gradient-to-r from-neutral-900 to-neutral-950 p-6">
                  <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/10 rounded-full blur-3xl"></div>
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                        <Cpu className="h-5 w-5 text-amber-400 animate-pulse" /> Imperial AI Wealth Optimizer
                      </h3>
                      <p className="text-xs text-slate-400 mt-1">
                        Simulate real-time sovereign yield optimization across Citibank and Modern Treasury ledgers.
                      </p>
                    </div>
                    <button
                      onClick={triggerAIOptimization}
                      disabled={isOptimizing}
                      className="px-6 py-3 bg-gradient-to-r from-amber-500 to-yellow-400 hover:from-amber-600 hover:to-yellow-500 text-black font-bold text-xs font-mono uppercase tracking-wider rounded-xl shadow-lg shadow-amber-500/20 transition-all disabled:opacity-50"
                    >
                      {isOptimizing ? 'Optimizing...' : 'Optimize Sovereign Yield'}
                    </button>
                  </div>

                  {/* Optimization Progress Bar */}
                  {isOptimizing && (
                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs font-mono text-amber-400">
                        <span>Reallocating Sovereign Assets...</span>
                        <span>{optimizationProgress}%</span>
                      </div>
                      <div className="w-full bg-neutral-800 h-2 rounded-full overflow-hidden">
                        <div 
                          className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full transition-all duration-200"
                          style={{ width: `${optimizationProgress}%` }}
                        ></div>
                      </div>
                    </div>
                  )}
                </div>

                {/* AI Insights List */}
                <div className="space-y-4">
                  {aiInsights.map((insight) => (
                    <div 
                      key={insight.id}
                      className="bg-neutral-900/40 border border-neutral-800 hover:border-amber-500/30 rounded-xl p-5 transition-all space-y-3"
                    >
                      <div className="flex justify-between items-start">
                        <div className="flex items-center gap-2">
                          <div className="p-1.5 bg-amber-500/10 rounded-lg border border-amber-500/20">
                            <Zap className="h-4 w-4 text-amber-400" />
                          </div>
                          <div>
                            <h4 className="font-semibold text-slate-100">{insight.title}</h4>
                            <span className="text-[10px] font-mono text-slate-500">Confidence: {insight.confidence}%</span>
                          </div>
                        </div>
                        <span className="text-xs font-mono font-bold text-emerald-400 bg-emerald-400/10 border border-emerald-400/20 px-2 py-1 rounded">
                          {insight.impactValue}
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">{insight.description}</p>
                      <div className="flex justify-end">
                        <button className="flex items-center gap-1 text-[10px] font-mono text-amber-400 hover:text-amber-300 transition-colors">
                          Execute AI Recommendation <ChevronRight className="h-3 w-3" />
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>
        </section>

        {/* FOOTER / SOVEREIGN COMPLIANCE */}
        <footer className="border-t border-neutral-900 pt-8 pb-12 flex flex-col md:flex-row justify-between items-center gap-4 text-xs font-mono text-slate-500">
          <div className="flex items-center gap-2">
            <Globe className="h-4 w-4 text-amber-500/40" />
            <span>Citibank Sovereign Wealth Division &copy; {new Date().getFullYear()}</span>
          </div>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-amber-400 transition-colors">Imperial Terms</a>
            <a href="#privacy" className="hover:text-amber-400 transition-colors">Quantum Privacy</a>
            <a href="#modern-treasury" className="hover:text-amber-400 transition-colors">Modern Treasury Integration</a>
          </div>
        </footer>

      </main>
    </div>
  );
}