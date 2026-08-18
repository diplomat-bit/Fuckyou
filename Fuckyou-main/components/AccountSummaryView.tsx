import React, { useState, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  TrendingUp, 
  Coins, 
  Globe, 
  Cpu, 
  Layers, 
  ArrowUpRight, 
  RefreshCw, 
  DollarSign, 
  Lock, 
  Briefcase, 
  Compass, 
  Activity,
  ChevronRight,
  Zap
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface AccountBalance {
  usd: number;
  gbp: number;
  goldOunces: number;
}

interface AIMetrics {
  predictedYield24h: number; // percentage
  arbitrageOpportunityUsd: number;
  quantumRiskScore: number; // 1-100 (lower is safer)
  liquidityScore: number; // 1-100
  aiRecommendation: string;
}

interface Account {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'investment' | 'trust' | 'custody' | 'escrow';
  accountNumber: string;
  modernTreasuryLedgerId: string;
  virtualRoutingNumber: string;
  balances: AccountBalance;
  aiMetrics: AIMetrics;
  status: 'Synchronized' | 'Optimizing' | 'Settling' | 'Secured';
  tier: 'Sovereign' | 'Imperial' | 'Gilded' | 'Quantum';
}

// ============================================================================
// MOCK DATA (Sovereign Wealth / Ultra-High-Net-Worth Scale)
// ============================================================================

const INITIAL_ACCOUNTS: Account[] = [
  {
    id: 'act-citi-001',
    name: 'Citi Sovereign Private Checking',
    type: 'checking',
    accountNumber: 'US-CITI-9999-8888-001',
    modernTreasuryLedgerId: 'ledger_chk_90210_ultra',
    virtualRoutingNumber: 'RTN-MODERN-TR-001',
    balances: {
      usd: 1250000000, // $1.25 Billion
      gbp: 980000000,
      goldOunces: 612500
    },
    aiMetrics: {
      predictedYield24h: 0.042,
      arbitrageOpportunityUsd: 1420000,
      quantumRiskScore: 3,
      liquidityScore: 99,
      aiRecommendation: 'Route $120M to London bullion desk via Modern Treasury RTGS to capture 4.2bp spread.'
    },
    status: 'Synchronized',
    tier: 'Sovereign'
  },
  {
    id: 'act-citi-002',
    name: 'Citi Imperial Yield Savings',
    type: 'savings',
    accountNumber: 'US-CITI-9999-8888-002',
    modernTreasuryLedgerId: 'ledger_sav_7777_gilded',
    virtualRoutingNumber: 'RTN-MODERN-TR-002',
    balances: {
      usd: 3450000000, // $3.45 Billion
      gbp: 2710000000,
      goldOunces: 1690000
    },
    aiMetrics: {
      predictedYield24h: 0.085,
      arbitrageOpportunityUsd: 3890000,
      quantumRiskScore: 8,
      liquidityScore: 95,
      aiRecommendation: 'Sweep excess liquidity into overnight tokenized treasury bills.'
    },
    status: 'Optimizing',
    tier: 'Imperial'
  },
  {
    id: 'act-citi-003',
    name: 'Quantum AI Alpha Investment Portfolio',
    type: 'investment',
    accountNumber: 'US-CITI-9999-8888-003',
    modernTreasuryLedgerId: 'ledger_inv_8888_quantum',
    virtualRoutingNumber: 'RTN-MODERN-TR-003',
    balances: {
      usd: 8900000000, // $8.9 Billion
      gbp: 6980000000,
      goldOunces: 4360000
    },
    aiMetrics: {
      predictedYield24h: 0.245,
      arbitrageOpportunityUsd: 18450000,
      quantumRiskScore: 18,
      liquidityScore: 82,
      aiRecommendation: 'AI model predicts 1.2% surge in gold-backed digital assets. Maintain overweight stance.'
    },
    status: 'Synchronized',
    tier: 'Quantum'
  },
  {
    id: 'act-citi-004',
    name: 'Dynasty Perpetual Trust Account',
    type: 'trust',
    accountNumber: 'US-CITI-9999-8888-004',
    modernTreasuryLedgerId: 'ledger_tru_1111_dynasty',
    virtualRoutingNumber: 'RTN-MODERN-TR-004',
    balances: {
      usd: 15000000000, // $15 Billion
      gbp: 11760000000,
      goldOunces: 7350000
    },
    aiMetrics: {
      predictedYield24h: 0.015,
      arbitrageOpportunityUsd: 450000,
      quantumRiskScore: 1,
      liquidityScore: 40,
      aiRecommendation: 'Generational wealth preservation active. Zero-risk yield optimization engaged.'
    },
    status: 'Secured',
    tier: 'Sovereign'
  },
  {
    id: 'act-citi-005',
    name: 'Aurum Global Custody Vault',
    type: 'custody',
    accountNumber: 'US-CITI-9999-8888-005',
    modernTreasuryLedgerId: 'ledger_cus_5555_aurum',
    virtualRoutingNumber: 'RTN-MODERN-TR-005',
    balances: {
      usd: 22400000000, // $22.4 Billion
      gbp: 17560000000,
      goldOunces: 10980000 // Massive gold reserves
    },
    aiMetrics: {
      predictedYield24h: 0.005,
      arbitrageOpportunityUsd: 0,
      quantumRiskScore: 0,
      liquidityScore: 10,
      aiRecommendation: 'Physical gold custody verified via real-time satellite ledger tracking.'
    },
    status: 'Secured',
    tier: 'Gilded'
  },
  {
    id: 'act-citi-006',
    name: 'Modern Treasury Sovereign Escrow',
    type: 'escrow',
    accountNumber: 'US-CITI-9999-8888-006',
    modernTreasuryLedgerId: 'ledger_esc_4444_sovereign',
    virtualRoutingNumber: 'RTN-MODERN-TR-006',
    balances: {
      usd: 4500000000, // $4.5 Billion
      gbp: 3530000000,
      goldOunces: 2205000
    },
    aiMetrics: {
      predictedYield24h: 0.098,
      arbitrageOpportunityUsd: 2100000,
      quantumRiskScore: 2,
      liquidityScore: 90,
      aiRecommendation: 'Cross-border M&A settlement pending. Auto-routing via Modern Treasury virtual accounts.'
    },
    status: 'Settling',
    tier: 'Quantum'
  }
];

export default function AccountSummaryView() {
  const [accounts, setAccounts] = useState<Account[]>(INITIAL_ACCOUNTS);
  const [selectedCurrency, setSelectedCurrency] = useState<'USD' | 'GBP' | 'XAU'>('USD');
  const [isOptimizingAll, setIsOptimizingAll] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedAccountType, setSelectedAccountType] = useState<string>('all');
  const [systemLog, setSystemLog] = useState<string[]>([
    'System initialized: Citi Private Sovereign AI v4.9.2',
    'Modern Treasury ledger connection: SECURE & SYNCHRONIZED',
    'Quantum yield optimization engine: ACTIVE'
  ]);

  // Calculate Totals
  const totalUsd = accounts.reduce((sum, acc) => sum + acc.balances.usd, 0);
  const totalGbp = accounts.reduce((sum, acc) => sum + acc.balances.gbp, 0);
  const totalGold = accounts.reduce((sum, acc) => sum + acc.balances.goldOunces, 0);

  // AI Arbitrage Total
  const totalArbitrage = accounts.reduce((sum, acc) => sum + acc.aiMetrics.arbitrageOpportunityUsd, 0);

  // Formatters
  const formatCurrency = (value: number, currency: 'USD' | 'GBP' | 'XAU') => {
    if (currency === 'USD') {
      return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);
    } else if (currency === 'GBP') {
      return new Intl.NumberFormat('en-GB', { style: 'currency', currency: 'GBP', maximumFractionDigits: 0 }).format(value);
    } else {
      return `${new Intl.NumberFormat('en-US', { maximumFractionDigits: 2 }).format(value)} oz Gold`;
    }
  };

  const formatValueBySelected = (balances: AccountBalance) => {
    if (selectedCurrency === 'USD') return formatCurrency(balances.usd, 'USD');
    if (selectedCurrency === 'GBP') return formatCurrency(balances.gbp, 'GBP');
    return formatCurrency(balances.goldOunces, 'XAU');
  };

  // Simulate AI Optimization
  const handleOptimizeAll = () => {
    setIsOptimizingAll(true);
    setSystemLog(prev => [
      `[${new Date().toLocaleTimeString()}] Initiating global AI portfolio rebalancing...`,
      ...prev
    ]);

    setTimeout(() => {
      setAccounts(prevAccounts => 
        prevAccounts.map(acc => ({
          ...acc,
          status: 'Optimizing',
          balances: {
            usd: acc.balances.usd * 1.0002, // Simulate instant micro-yield
            gbp: acc.balances.gbp * 1.0001,
            goldOunces: acc.balances.goldOunces + 12.5
          },
          aiMetrics: {
            ...acc.aiMetrics,
            predictedYield24h: acc.aiMetrics.predictedYield24h + 0.005,
            arbitrageOpportunityUsd: Math.max(0, acc.aiMetrics.arbitrageOpportunityUsd - 150000)
          }
        }))
      );
      setIsOptimizingAll(false);
      setSystemLog(prev => [
        `[${new Date().toLocaleTimeString()}] Modern Treasury ledger updated. Real-time settlement complete.`,
        `[${new Date().toLocaleTimeString()}] AI Optimization complete. Generated $1,420,500 in micro-arbitrage.`,
        ...prev
      ]);
    }, 2000);
  };

  // Filter accounts
  const filteredAccounts = accounts.filter(acc => {
    const matchesSearch = acc.name.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          acc.accountNumber.includes(searchQuery) ||
                          acc.modernTreasuryLedgerId.includes(searchQuery);
    const matchesType = selectedAccountType === 'all' || acc.type === selectedAccountType;
    return matchesSearch && matchesType;
  });

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Premium Glow Bar */}
      <div className="h-1.5 bg-gradient-to-r from-amber-600 via-yellow-400 to-amber-700 w-full shadow-[0_0_20px_rgba(245,158,11,0.5)]" />

      {/* Header */}
      <header className="border-b border-neutral-900 bg-neutral-950/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4">
          {/* Brand */}
          <div className="flex items-center gap-3">
            <div className="relative">
              <div className="absolute -inset-1 rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 opacity-75 blur" />
              <div className="relative bg-neutral-950 p-2.5 rounded-full border border-amber-500/30">
                <Shield className="w-6 h-6 text-amber-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-[0.3em] text-amber-500 font-bold uppercase">Citibank Private Elite</span>
                <span className="bg-amber-500/10 text-amber-400 text-[9px] font-mono px-1.5 py-0.5 rounded border border-amber-500/20">AI-QUANTUM</span>
              </div>
              <h1 className="text-xl font-semibold tracking-tight text-white">Sovereign Ledger Console</h1>
            </div>
          </div>

          {/* Modern Treasury Sync Status */}
          <div className="flex items-center gap-4">
            <div className="bg-neutral-900/90 border border-neutral-800 rounded-lg px-4 py-2 flex items-center gap-3">
              <div className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-neutral-400 uppercase tracking-wider font-mono">Modern Treasury Ledger</p>
                <p className="text-xs font-semibold text-emerald-400">Connected &amp; Settled (RTGS)</p>
              </div>
            </div>

            {/* Currency Switcher */}
            <div className="bg-neutral-900 p-1 rounded-lg border border-neutral-800 flex gap-1">
              {(['USD', 'GBP', 'XAU'] as const).map((curr) => (
                <button
                  key={curr}
                  onClick={() => setSelectedCurrency(curr)}
                  className={`px-3 py-1 rounded text-xs font-mono transition-all ${
                    selectedCurrency === curr
                      ? 'bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold shadow-lg'
                      : 'text-neutral-400 hover:text-white hover:bg-neutral-800'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 space-y-8">
        
        {/* Sovereign Wealth Overview Banner */}
        <section className="relative overflow-hidden rounded-2xl border border-amber-500/20 bg-gradient-to-b from-neutral-900 to-neutral-950 p-8 shadow-[0_0_50px_rgba(0,0,0,0.8)]">
          <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 -mb-12 -ml-12 w-96 h-96 bg-yellow-600/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 grid grid-cols-1 lg:grid-cols-3 gap-8 items-center">
            {/* Total Net Worth */}
            <div className="space-y-2">
              <div className="flex items-center gap-2 text-neutral-400">
                <Globe className="w-4 h-4 text-amber-500" />
                <span className="text-xs uppercase tracking-widest font-mono">Consolidated Sovereign Net Worth</span>
              </div>
              <div className="text-4xl lg:text-5xl font-extrabold tracking-tight text-white font-mono">
                {selectedCurrency === 'USD' && formatCurrency(totalUsd, 'USD')}
                {selectedCurrency === 'GBP' && formatCurrency(totalGbp, 'GBP')}
                {selectedCurrency === 'XAU' && formatCurrency(totalGold, 'XAU')}
              </div>
              <p className="text-xs text-neutral-500 font-mono">
                Multi-currency backing: {formatCurrency(totalUsd, 'USD')} | {formatCurrency(totalGbp, 'GBP')} | {formatCurrency(totalGold, 'XAU')}
              </p>
            </div>

            {/* AI Yield & Arbitrage Metrics */}
            <div className="grid grid-cols-2 gap-4 border-y lg:border-y-0 lg:border-x border-neutral-800 py-6 lg:py-0 lg:px-8">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <Sparkles className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-[10px] uppercase tracking-wider font-mono">AI Arbitrage Pool</span>
                </div>
                <p className="text-xl font-bold text-amber-400 font-mono">
                  {formatCurrency(totalArbitrage, 'USD')}
                </p>
                <p className="text-[10px] text-neutral-500">Instant routing available</p>
              </div>

              <div className="space-y-1">
                <div className="flex items-center gap-1.5 text-neutral-400">
                  <TrendingUp className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-[10px] uppercase tracking-wider font-mono">Avg Quantum Yield</span>
                </div>
                <p className="text-xl font-bold text-emerald-400 font-mono">
                  +0.082% <span className="text-xs font-normal text-neutral-400">/ 24h</span>
                </p>
                <p className="text-[10px] text-neutral-500">Sovereign-grade risk profile</p>
              </div>
            </div>

            {/* AI Optimization Trigger */}
            <div className="flex flex-col sm:flex-row lg:flex-col gap-3 justify-end">
              <button
                onClick={handleOptimizeAll}
                disabled={isOptimizingAll}
                className="relative group overflow-hidden rounded-xl p-[1px] focus:outline-none transition-all transform active:scale-95"
              >
                <span className="absolute inset-0 bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 rounded-xl animate-pulse" />
                <div className="relative px-6 py-3 bg-neutral-950 rounded-[11px] transition-all group-hover:bg-neutral-900 flex items-center justify-center gap-2">
                  {isOptimizingAll ? (
                    <>
                      <RefreshCw className="w-4 h-4 text-amber-400 animate-spin" />
                      <span className="text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">Rebalancing Ledger...</span>
                    </>
                  ) : (
                    <>
                      <Cpu className="w-4 h-4 text-amber-400" />
                      <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">Trigger AI Optimization</span>
                    </>
                  )}
                </div>
              </button>

              <div className="text-center lg:text-right">
                <span className="text-[10px] text-neutral-500 font-mono">
                  Last optimized: Just now via Modern Treasury API
                </span>
              </div>
            </div>
          </div>
        </section>

        {/* Filters & Search */}
        <div className="flex flex-col md:flex-row gap-4 justify-between items-center bg-neutral-900/40 p-4 rounded-xl border border-neutral-900">
          <div className="flex flex-wrap gap-2">
            {['all', 'checking', 'savings', 'investment', 'trust', 'custody', 'escrow'].map((type) => (
              <button
                key={type}
                onClick={() => setSelectedAccountType(type)}
                className={`px-3 py-1.5 rounded-lg text-xs font-mono uppercase tracking-wider transition-all ${
                  selectedAccountType === type
                    ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                    : 'text-neutral-400 hover:text-white border border-transparent'
                }`}
              >
                {type}
              </button>
            ))}
          </div>

          <div className="w-full md:w-72 relative">
            <input
              type="text"
              placeholder="Search ledger accounts..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-neutral-950 border border-neutral-800 rounded-lg px-4 py-2 text-xs text-neutral-200 placeholder-neutral-500 focus:outline-none focus:border-amber-500/50 font-mono"
            />
          </div>
        </div>

        {/* Account Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {filteredAccounts.map((account) => (
            <div 
              key={account.id}
              className="group relative rounded-xl border border-neutral-900 bg-neutral-950 p-6 hover:border-amber-500/30 transition-all duration-300 shadow-lg hover:shadow-[0_0_30px_rgba(245,158,11,0.05)]"
            >
              {/* Top Row: Account Name & Tier */}
              <div className="flex justify-between items-start gap-4 mb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono uppercase tracking-widest text-amber-500">
                      {account.tier} Tier
                    </span>
                    <span className="w-1 h-1 rounded-full bg-neutral-700" />
                    <span className="text-[10px] font-mono text-neutral-500 uppercase">
                      {account.type}
                    </span>
                  </div>
                  <h3 className="text-lg font-bold text-white group-hover:text-amber-400 transition-colors mt-1">
                    {account.name}
                  </h3>
                </div>

                <span className={`px-2.5 py-1 rounded-full text-[10px] font-mono font-semibold ${
                  account.status === 'Synchronized' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  account.status === 'Optimizing' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
                  account.status === 'Settling' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  'bg-purple-500/10 text-purple-400 border border-purple-500/20'
                }`}>
                  {account.status}
                </span>
              </div>

              {/* Balances Section */}
              <div className="grid grid-cols-3 gap-4 bg-neutral-900/50 p-4 rounded-lg border border-neutral-900 mb-4">
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-mono">USD Balance</p>
                  <p className="text-sm font-bold text-white font-mono mt-0.5">
                    {formatCurrency(account.balances.usd, 'USD')}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-mono">GBP Balance</p>
                  <p className="text-sm font-bold text-neutral-300 font-mono mt-0.5">
                    {formatCurrency(account.balances.gbp, 'GBP')}
                  </p>
                </div>
                <div>
                  <p className="text-[9px] text-neutral-500 uppercase tracking-wider font-mono">Gold Reserve</p>
                  <p className="text-sm font-bold text-amber-500 font-mono mt-0.5">
                    {formatCurrency(account.balances.goldOunces, 'XAU')}
                  </p>
                </div>
              </div>

              {/* Modern Treasury Ledger Metadata */}
              <div className="space-y-1.5 text-xs font-mono text-neutral-400 border-b border-neutral-900 pb-4 mb-4">
                <div className="flex justify-between">
                  <span className="text-neutral-500">Ledger Account ID:</span>
                  <span className="text-neutral-300 select-all">{account.modernTreasuryLedgerId}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Virtual Routing:</span>
                  <span className="text-neutral-300 select-all">{account.virtualRoutingNumber}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-500">Citi Account Number:</span>
                  <span className="text-neutral-300 select-all">{account.accountNumber}</span>
                </div>
              </div>

              {/* AI Valuation Metrics */}
              <div className="space-y-3">
                <div className="flex items-center gap-1.5">
                  <Cpu className="w-3.5 h-3.5 text-amber-400" />
                  <span className="text-xs font-bold text-white uppercase tracking-wider">AI Valuation &amp; Routing Metrics</span>
                </div>

                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-neutral-900/30 p-2 rounded border border-neutral-900">
                    <p className="text-[8px] text-neutral-500 uppercase font-mono">Est. 24h Yield</p>
                    <p className="text-xs font-bold text-emerald-400 font-mono mt-0.5">
                      +{account.aiMetrics.predictedYield24h}%
                    </p>
                  </div>
                  <div className="bg-neutral-900/30 p-2 rounded border border-neutral-900">
                    <p className="text-[8px] text-neutral-500 uppercase font-mono">Arbitrage Opp</p>
                    <p className="text-xs font-bold text-amber-400 font-mono mt-0.5">
                      {formatCurrency(account.aiMetrics.arbitrageOpportunityUsd, 'USD')}
                    </p>
                  </div>
                  <div className="bg-neutral-900/30 p-2 rounded border border-neutral-900">
                    <p className="text-[8px] text-neutral-500 uppercase font-mono">Quantum Risk</p>
                    <p className="text-xs font-bold text-red-400 font-mono mt-0.5">
                      {account.aiMetrics.quantumRiskScore}/100
                    </p>
                  </div>
                </div>

                {/* AI Recommendation Alert */}
                <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3 flex gap-2.5 items-start">
                  <Sparkles className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                  <p className="text-[11px] text-neutral-300 leading-relaxed">
                    <strong className="text-amber-400 font-semibold">AI Recommendation:</strong> {account.aiMetrics.aiRecommendation}
                  </p>
                </div>
              </div>

              {/* Hover Action Indicator */}
              <div className="absolute bottom-4 right-6 opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1 text-xs text-amber-400 font-mono">
                <span>Inspect Ledger</span>
                <ChevronRight className="w-3 h-3" />
              </div>
            </div>
          ))}
        </div>

        {/* Modern Treasury Real-Time Ledger Logs */}
        <section className="bg-neutral-950 border border-neutral-900 rounded-xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-500" />
              <h3 className="text-sm font-bold text-white uppercase tracking-wider font-mono">
                Modern Treasury Ledger Event Stream
              </h3>
            </div>
            <span className="text-[10px] font-mono text-neutral-500">
              Real-time WebSocket Connection Active
            </span>
          </div>

          <div className="bg-neutral-900/50 rounded-lg p-4 border border-neutral-900 font-mono text-xs space-y-2 max-h-48 overflow-y-auto">
            {systemLog.map((log, idx) => (
              <div key={idx} className="flex gap-2 text-neutral-400">
                <span className="text-amber-500/70 select-none">&gt;</span>
                <p className="leading-relaxed">{log}</p>
              </div>
            ))}
          </div>
        </section>

        {/* Luxury Footer Note */}
        <footer className="text-center py-8 border-t border-neutral-900 space-y-2">
          <p className="text-xs text-neutral-500 font-mono">
            Citibank Private Sovereign AI is reserved exclusively for clients holding sovereign wealth status or assets exceeding $1B USD.
          </p>
          <p className="text-[10px] text-neutral-600 font-mono">
            All transactions are routed instantly via Modern Treasury virtual accounts and settled on-chain or via RTGS. Subject to quantum risk modeling.
          </p>
        </footer>

      </main>
    </div>
  );
}