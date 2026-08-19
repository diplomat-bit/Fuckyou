

// --- CONSOLIDATED FROM: ./components/bridges/StripeAlpacaBridgeView.tsx ---

import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRight, 
  TrendingUp, 
  Settings, 
  RefreshCw, 
  DollarSign, 
  Shield, 
  Zap, 
  CheckCircle, 
  AlertTriangle, 
  Sliders, 
  Activity, 
  Layers, 
  Wallet, 
  Building, 
  ArrowUpRight, 
  HelpCircle,
  Play,
  Pause,
  Clock,
  ChevronRight,
  Info,
  Database,
  Link2,
  Lock,
  SlidersHorizontal,
  TrendingDown,
  Check,
  X
} from 'lucide-react';

// Types & Interfaces
interface TransferLog {
  id: string;
  date: string;
  stripePayoutId: string;
  alpacaTxId: string;
  amount: number;
  strategy: string;
  status: 'completed' | 'processing' | 'failed';
  fee: number;
}

interface Strategy {
  id: string;
  name: string;
  apy: number;
  risk: 'Low' | 'Moderate' | 'High';
  description: string;
  allocation: string;
  color: string;
  glowColor: string;
}

export default function StripeAlpacaBridgeView() {
  // State Management
  const [activeTab, setActiveTab] = useState<'dashboard' | 'rules' | 'strategies' | 'history' | 'api'>('dashboard');
  const [autoRouteEnabled, setAutoRouteEnabled] = useState<boolean>(true);
  const [routingPercentage, setRoutingPercentage] = useState<number>(60);
  const [minThreshold, setMinThreshold] = useState<number>(1000);
  const [selectedStrategy, setSelectedStrategy] = useState<string>('mmf');
  const [manualTransferAmount, setManualTransferAmount] = useState<string>('');
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [showApiKeys, setShowApiKeys] = useState<boolean>(false);
  const [stripeLiveBalance, setStripeLiveBalance] = useState({ available: 14850.42, pending: 8420.10 });
  const [alpacaLiveBalance, setAlpacaLiveBalance] = useState({ totalValue: 42150.80, buyingPower: 12400.50, yieldEarned: 1840.22 });
  const [monthlyStripeVolume, setMonthlyStripeVolume] = useState<number>(25000);
  
  // API Keys State (Mocked)
  const [stripeApiKey, setStripeApiKey] = useState<string>('sk_live_51Nz...8s9A');
  const [alpacaApiKey, setAlpacaApiKey] = useState<string>('PKAM...8F2D');
  const [webhookSecret, setWebhookSecret] = useState<string>('whsec_5f8...e2a1');

  // Notification Settings
  const [notifySlack, setNotifySlack] = useState<boolean>(true);
  const [notifyEmail, setNotifyEmail] = useState<boolean>(true);

  // Mock Strategies
  const strategies: Strategy[] = [
    {
      id: 'mmf',
      name: 'Sovereign Treasury Yield (T-Bills)',
      apy: 5.25,
      risk: 'Low',
      description: 'Routes funds into short-term US Treasury Bills and high-yield Money Market Funds via Alpaca Cash Management.',
      allocation: '100% Short-Term Government Debt',
      color: 'text-emerald-400 border-emerald-500/30 bg-emerald-950/20',
      glowColor: 'rgba(16, 185, 129, 0.15)'
    },
    {
      id: 'dividend',
      name: 'S&P 500 Dividend Growth',
      apy: 8.40,
      risk: 'Moderate',
      description: 'Invests in high-quality dividend-paying equities with automated dividend reinvestment (DRIP) enabled.',
      allocation: '80% Dividend Aristocrats, 20% Cash',
      color: 'text-blue-400 border-blue-500/30 bg-blue-950/20',
      glowColor: 'rgba(59, 130, 246, 0.15)'
    },
    {
      id: 'tqqq',
      name: 'TQQQ AI Quant Strategy',
      apy: 24.80,
      risk: 'High',
      description: 'Leveraged momentum strategy trading TQQQ/SQQQ based on neural network trend-following signals.',
      allocation: 'Dynamic Leveraged ETFs (TQQQ/SQQQ)',
      color: 'text-violet-400 border-violet-500/30 bg-violet-950/20',
      glowColor: 'rgba(139, 92, 246, 0.15)'
    },
    {
      id: 'rwa',
      name: 'RWA Tokenized Real Estate',
      apy: 11.20,
      risk: 'Moderate',
      description: 'Allocates payouts directly to tokenized real estate assets and yield-bearing land trusts via Alpaca RWA.',
      allocation: '60% Commercial Debt, 40% Equity Tokens',
      color: 'text-amber-400 border-amber-500/30 bg-amber-950/20',
      glowColor: 'rgba(245, 158, 11, 0.15)'
    }
  ];

  // Mock Transfer History
  const [transfers, setTransfers] = useState<TransferLog[]>([
    {
      id: 'TR-9082',
      date: '2026-08-15 14:22',
      stripePayoutId: 'po_1NzA8s9A8s9D',
      alpacaTxId: 'ou_8f2d8f2d8f2d',
      amount: 4500.00,
      strategy: 'Sovereign Treasury Yield',
      status: 'completed',
      fee: 0.00
    },
    {
      id: 'TR-8911',
      date: '2026-08-08 09:15',
      stripePayoutId: 'po_1NzM2k8s9A2x',
      alpacaTxId: 'ou_9a1f9a1f9a1f',
      amount: 3200.00,
      strategy: 'Sovereign Treasury Yield',
      status: 'completed',
      fee: 0.00
    },
    {
      id: 'TR-8754',
      date: '2026-08-01 11:45',
      stripePayoutId: 'po_1NzK1j8s9A1z',
      alpacaTxId: 'ou_3c4d3c4d3c4d',
      amount: 5100.00,
      strategy: 'TQQQ AI Quant Strategy',
      status: 'completed',
      fee: 0.00
    },
    {
      id: 'TR-8602',
      date: '2026-07-25 16:30',
      stripePayoutId: 'po_1NzJ9h8s9A0y',
      alpacaTxId: 'ou_5e6f5e6f5e6f',
      amount: 2800.00,
      strategy: 'S&P 500 Dividend Growth',
      status: 'completed',
      fee: 0.00
    }
  ]);

  // Dynamic Yield Projection Calculations
  const projectionData = useMemo(() => {
    const selectedStratObj = strategies.find(s => s.id === selectedStrategy) || strategies[0];
    const rate = selectedStratObj.apy / 100;
    const monthlyContribution = (monthlyStripeVolume * (routingPercentage / 100));
    
    const data = [];
    let bridgeBalance = alpacaLiveBalance.totalValue;
    let standardBalance = alpacaLiveBalance.totalValue;

    for (let month = 0; month <= 12; month++) {
      if (month > 0) {
        // Bridge compounding monthly
        bridgeBalance = (bridgeBalance + monthlyContribution) * (1 + rate / 12);
        // Standard bank account compounding at 0.05% APY
        standardBalance = (standardBalance + monthlyContribution) * (1 + 0.0005 / 12);
      }
      data.push({
        month: `M${month}`,
        bridge: Math.round(bridgeBalance),
        standard: Math.round(standardBalance),
        yieldEarned: Math.round(bridgeBalance - standardBalance)
      });
    }
    return data;
  }, [selectedStrategy, routingPercentage, monthlyStripeVolume, alpacaLiveBalance.totalValue]);

  // Handle Manual Transfer Simulation
  const handleManualTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(manualTransferAmount);
    if (isNaN(amount) || amount <= 0 || amount > stripeLiveBalance.available) return;

    setIsTransferring(true);
    setTransferSuccess(false);

    setTimeout(() => {
      setIsTransferring(false);
      setTransferSuccess(true);
      
      // Update balances
      setStripeLiveBalance(prev => ({
        ...prev,
        available: prev.available - amount
      }));
      setAlpacaLiveBalance(prev => ({
        ...prev,
        totalValue: prev.totalValue + amount,
        buyingPower: prev.buyingPower + amount
      }));

      // Add to transfer history
      const selectedStratObj = strategies.find(s => s.id === selectedStrategy) || strategies[0];
      const newTransfer: TransferLog = {
        id: `TR-${Math.floor(1000 + Math.random() * 9000)}`,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        stripePayoutId: 'po_manual_' + Math.random().toString(36).substring(2, 10),
        alpacaTxId: 'ou_manual_' + Math.random().toString(36).substring(2, 10),
        amount: amount,
        strategy: selectedStratObj.name,
        status: 'completed',
        fee: 0.00
      };
      setTransfers(prev => [newTransfer, ...prev]);
      setManualTransferAmount('');

      // Clear success message after 4 seconds
      setTimeout(() => setTransferSuccess(false), 4000);
    }, 2500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-emerald-500/30 selection:text-emerald-200">
      {/* Header Section */}
      <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4 mb-8 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <div className="p-2 bg-gradient-to-tr from-emerald-500/20 to-blue-500/20 rounded-xl border border-emerald-500/30 shadow-lg shadow-emerald-500/5">
              <Link2 className="w-6 h-6 text-emerald-400 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-extrabold tracking-tight bg-gradient-to-r from-emerald-400 via-teal-300 to-blue-400 bg-clip-text text-transparent">
                Stripe - Alpaca Yield Bridge
              </h1>
              <p className="text-xs text-slate-400 font-mono">MERCHANT LIQUIDITY ROUTING ENGINE</p>
            </div>
          </div>
          <p className="text-sm text-slate-400 max-w-2xl">
            Automate the routing of Stripe payout balances directly into yield-generating Alpaca brokerage accounts. Maximize idle capital efficiency with institutional-grade precision.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-300">Stripe Webhook:</span>
            <span className="text-emerald-400 font-semibold">Active</span>
          </div>
          <div className="flex items-center gap-2 px-3 py-1.5 bg-slate-900/80 border border-slate-800 rounded-full text-xs font-mono">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping"></span>
            <span className="text-slate-300">Alpaca API:</span>
            <span className="text-emerald-400 font-semibold">Connected</span>
          </div>
          <button 
            onClick={() => setAutoRouteEnabled(!autoRouteEnabled)}
            className={`flex items-center gap-2 px-4 py-1.5 rounded-full text-xs font-bold transition-all duration-300 shadow-md ${
              autoRouteEnabled 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/20' 
                : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {autoRouteEnabled ? <Play className="w-3.5 h-3.5 fill-current" /> : <Pause className="w-3.5 h-3.5 fill-current" />}
            {autoRouteEnabled ? 'AUTO-ROUTE ACTIVE' : 'AUTO-ROUTE PAUSED'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800/60 mb-8 overflow-x-auto scrollbar-none">
        {[
          { id: 'dashboard', label: 'Dashboard', icon: Activity },
          { id: 'rules', label: 'Routing Rules', icon: SlidersHorizontal },
          { id: 'strategies', label: 'Yield Strategies', icon: TrendingUp },
          { id: 'history', label: 'Transfer Ledger', icon: Clock },
          { id: 'api', label: 'API & Webhooks', icon: Settings }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-6 py-3 border-b-2 text-sm font-medium transition-all duration-200 whitespace-nowrap ${
                isActive 
                  ? 'border-emerald-500 text-emerald-400 bg-gradient-to-t from-emerald-950/10 to-transparent' 
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className={`w-4 h-4 ${isActive ? 'text-emerald-400' : 'text-slate-400'}`} />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left 2 Columns: Dynamic Tab Content */}
        <div className="lg:col-span-2 space-y-8">
          
          {/* TAB: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <>
              {/* Balance Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Stripe Card */}
                <div className="relative overflow-hidden bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md hover:border-slate-700/80 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-blue-500/10 rounded-lg border border-blue-500/20">
                        <Building className="w-4 h-4 text-blue-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-400">STRIPE MERCHANT ACCOUNT</span>
                    </div>
                    <span className="text-xs font-mono text-blue-400 bg-blue-950/30 px-2 py-0.5 rounded border border-blue-500/20">Live Balance</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <span className="text-xs text-slate-400">Available Payout Balance</span>
                    <h3 className="text-3xl font-bold text-slate-100">${stripeLiveBalance.available.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block">Pending Balance</span>
                      <span className="text-slate-300 font-semibold">${stripeLiveBalance.pending.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Next Auto-Payout</span>
                      <span className="text-blue-400 font-semibold">Tonight 23:59 UTC</span>
                    </div>
                  </div>
                </div>

                {/* Alpaca Card */}
                <div className="relative overflow-hidden bg-slate-900/50 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md hover:border-slate-700/80 transition-all duration-300">
                  <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none"></div>
                  <div className="flex justify-between items-start mb-4">
                    <div className="flex items-center gap-2">
                      <div className="p-1.5 bg-emerald-500/10 rounded-lg border border-emerald-500/20">
                        <Wallet className="w-4 h-4 text-emerald-400" />
                      </div>
                      <span className="text-xs font-mono text-slate-400">ALPACA BROKERAGE ACCOUNT</span>
                    </div>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">Yield Active</span>
                  </div>
                  <div className="space-y-1 mb-4">
                    <span className="text-xs text-slate-400">Total Portfolio Value</span>
                    <h3 className="text-3xl font-bold text-slate-100">${alpacaLiveBalance.totalValue.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</h3>
                  </div>
                  <div className="flex justify-between items-center pt-4 border-t border-slate-800/60 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block">Buying Power</span>
                      <span className="text-slate-300 font-semibold">${alpacaLiveBalance.buyingPower.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-slate-500 block">Total Yield Earned</span>
                      <span className="text-emerald-400 font-semibold flex items-center gap-1 justify-end">
                        <TrendingUp className="w-3 h-3" />
                        ${alpacaLiveBalance.yieldEarned.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Interactive Yield Projection Chart */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
                <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-emerald-400" />
                      12-Month Yield Projection
                    </h3>
                    <p className="text-xs text-slate-400">Simulated growth comparing standard bank holding vs. active yield routing</p>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-3 h-3 rounded bg-emerald-500"></span>
                      <span className="text-slate-300">Yield Bridge</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs font-mono">
                      <span className="w-3 h-3 rounded bg-slate-600"></span>
                      <span className="text-slate-400">Standard Bank</span>
                    </div>
                  </div>
                </div>

                {/* SVG Line Chart */}
                <div className="relative h-64 w-full bg-slate-950/40 rounded-xl border border-slate-800/60 p-4 overflow-hidden">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 500 200" preserveAspectRatio="none">
                    <defs>
                      <linearGradient id="bridgeGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#10b981" stopOpacity="0.2" />
                        <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
                      </linearGradient>
                      <linearGradient id="standardGrad" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#64748b" stopOpacity="0.1" />
                        <stop offset="100%" stopColor="#64748b" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1="0" y1="50" x2="500" y2="50" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="100" x2="500" y2="100" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />
                    <line x1="0" y1="150" x2="500" y2="150" stroke="#1e293b" strokeWidth="0.5" strokeDasharray="4 4" />

                    {/* Standard Bank Path */}
                    <path
                      d={`M ${projectionData.map((d, i) => {
                        const x = (i / 12) * 500;
                        const maxVal = Math.max(...projectionData.map(x => x.bridge));
                        const minVal = alpacaLiveBalance.totalValue;
                        const y = 180 - ((d.standard - minVal) / (maxVal - minVal)) * 150;
                        return `${x} ${y}`;
                      }).join(' L ')}`}
                      fill="none"
                      stroke="#64748b"
                      strokeWidth="2"
                      strokeDasharray="3 3"
                    />
                    <path
                      d={`M 0 180 L ${projectionData.map((d, i) => {
                        const x = (i / 12) * 500;
                        const maxVal = Math.max(...projectionData.map(x => x.bridge));
                        const minVal = alpacaLiveBalance.totalValue;
                        const y = 180 - ((d.standard - minVal) / (maxVal - minVal)) * 150;
                        return `${x} ${y}`;
                      }).join(' L ')} L 500 180 Z`}
                      fill="url(#standardGrad)"
                    />

                    {/* Yield Bridge Path */}
                    <path
                      d={`M ${projectionData.map((d, i) => {
                        const x = (i / 12) * 500;
                        const maxVal = Math.max(...projectionData.map(x => x.bridge));
                        const minVal = alpacaLiveBalance.totalValue;
                        const y = 180 - ((d.bridge - minVal) / (maxVal - minVal)) * 150;
                        return `${x} ${y}`;
                      }).join(' L ')}`}
                      fill="none"
                      stroke="#10b981"
                      strokeWidth="3"
                    />
                    <path
                      d={`M 0 180 L ${projectionData.map((d, i) => {
                        const x = (i / 12) * 500;
                        const maxVal = Math.max(...projectionData.map(x => x.bridge));
                        const minVal = alpacaLiveBalance.totalValue;
                        const y = 180 - ((d.bridge - minVal) / (maxVal - minVal)) * 150;
                        return `${x} ${y}`;
                      }).join(' L ')} L 500 180 Z`}
                      fill="url(#bridgeGrad)"
                    />

                    {/* Interactive Dots */}
                    {projectionData.map((d, i) => {
                      if (i === 0 || i === 6 || i === 12) {
                        const x = (i / 12) * 500;
                        const maxVal = Math.max(...projectionData.map(x => x.bridge));
                        const minVal = alpacaLiveBalance.totalValue;
                        const yBridge = 180 - ((d.bridge - minVal) / (maxVal - minVal)) * 150;
                        return (
                          <g key={i}>
                            <circle cx={x} cy={yBridge} r="5" fill="#10b981" stroke="#020617" strokeWidth="2" />
                            <text x={x - 15} y={yBridge - 12} fill="#cbd5e1" fontSize="9" fontFamily="monospace">
                              ${Math.round(d.bridge / 1000)}k
                            </text>
                          </g>
                        );
                      }
                      return null;
                    })}
                  </svg>

                  {/* X-Axis Labels */}
                  <div className="absolute bottom-1 left-4 right-4 flex justify-between text-[10px] font-mono text-slate-500">
                    <span>Month 0</span>
                    <span>Month 3</span>
                    <span>Month 6</span>
                    <span>Month 9</span>
                    <span>Month 12</span>
                  </div>
                </div>

                {/* Projection Controls */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6 pt-6 border-t border-slate-800/60">
                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-mono">EST. MONTHLY STRIPE VOLUME</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2 text-slate-500 text-sm">$</span>
                      <input 
                        type="number" 
                        value={monthlyStripeVolume}
                        onChange={(e) => setMonthlyStripeVolume(Number(e.target.value))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-1.5 pl-7 pr-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-xs text-slate-400 block mb-2 font-mono">ROUTING ALLOCATION ({routingPercentage}%)</label>
                    <input 
                      type="range" 
                      min="10" 
                      max="100" 
                      step="5"
                      value={routingPercentage}
                      onChange={(e) => setRoutingPercentage(Number(e.target.value))}
                      className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer mt-3"
                    />
                  </div>

                  <div className="bg-emerald-950/10 border border-emerald-500/20 rounded-xl p-3 flex flex-col justify-center">
                    <span className="text-[10px] text-emerald-400 font-mono uppercase tracking-wider">Projected Yield Gain (1 Year)</span>
                    <span className="text-xl font-bold text-emerald-300">
                      +${projectionData[12].yieldEarned.toLocaleString('en-US')}
                    </span>
                    <span className="text-[10px] text-slate-400">vs holding in standard bank account</span>
                  </div>
                </div>
              </div>

              {/* Manual Transfer Bridge */}
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-100 mb-2 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-400" />
                  Instant Manual Bridge Transfer
                </h3>
                <p className="text-xs text-slate-400 mb-6">
                  Bypass the automated schedule and route a specific amount from your Stripe Available Balance directly into your Alpaca Yield Strategy.
                </p>

                <form onSubmit={handleManualTransfer} className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="text-xs text-slate-400 block mb-2 font-mono">TRANSFER AMOUNT (USD)</label>
                      <div className="relative">
                        <span className="absolute left-3 top-3 text-slate-500">$</span>
                        <input 
                          type="number" 
                          placeholder="0.00"
                          max={stripeLiveBalance.available}
                          value={manualTransferAmount}
                          onChange={(e) => setManualTransferAmount(e.target.value)}
                          className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-8 pr-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                        />
                      </div>
                      <span className="text-[10px] text-slate-500 mt-1 block">
                        Max available: ${stripeLiveBalance.available.toLocaleString()}
                      </span>
                    </div>

                    <div>
                      <label className="text-xs text-slate-400 block mb-2 font-mono">TARGET STRATEGY</label>
                      <select 
                        value={selectedStrategy}
                        onChange={(e) => setSelectedStrategy(e.target.value)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-3 text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50"
                      >
                        {strategies.map(strat => (
                          <option key={strat.id} value={strat.id}>{strat.name} ({strat.apy}% APY)</option>
                        ))}
                      </select>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Shield className="w-4 h-4 text-emerald-400" />
                      <span>Zero-fee instant settlement via Alpaca Funding Wallets</span>
                    </div>

                    <button
                      type="submit"
                      disabled={isTransferring || !manualTransferAmount || parseFloat(manualTransferAmount) <= 0}
                      className="flex items-center gap-2 px-6 py-2.5 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold rounded-xl transition-all duration-200 shadow-lg shadow-emerald-500/10"
                    >
                      {isTransferring ? (
                        <>
                          <RefreshCw className="w-4 h-4 animate-spin" />
                          Bridging Funds...
                        </>
                      ) : (
                        <>
                          <span>Initiate Bridge Transfer</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                {/* Success Message */}
                {transferSuccess && (
                  <div className="mt-4 p-4 bg-emerald-950/30 border border-emerald-500/30 rounded-xl flex items-start gap-3 animate-fadeIn">
                    <CheckCircle className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                    <div>
                      <h4 className="text-sm font-bold text-emerald-300">Bridge Transfer Initiated Successfully</h4>
                      <p className="text-xs text-slate-400 mt-1">
                        Funds have been debited from Stripe and are being routed to your Alpaca brokerage account. Settlement is expected within 15 minutes.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </>
          )}

          {/* TAB: ROUTING RULES */}
          {activeTab === 'rules' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">Automated Routing Rules</h3>
                <p className="text-xs text-slate-400">Configure how and when Stripe payout balances are swept into Alpaca.</p>
              </div>

              <div className="space-y-6">
                {/* Rule 1: Auto-Route Toggle */}
                <div className="flex items-center justify-between p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl">
                  <div>
                    <h4 className="text-sm font-bold text-slate-200">Enable Automated Sweeps</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Automatically sweep Stripe payouts based on your rules.</p>
                  </div>
                  <button 
                    onClick={() => setAutoRouteEnabled(!autoRouteEnabled)}
                    className={`w-12 h-6 rounded-full p-1 transition-colors duration-200 focus:outline-none ${
                      autoRouteEnabled ? 'bg-emerald-500' : 'bg-slate-800'
                    }`}
                  >
                    <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ${
                      autoRouteEnabled ? 'translate-x-6' : 'translate-x-0'
                    }`} />
                  </button>
                </div>

                {/* Rule 2: Routing Percentage */}
                <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Sweep Percentage</h4>
                      <p className="text-xs text-slate-400 mt-0.5">The percentage of each Stripe payout to route to Alpaca.</p>
                    </div>
                    <span className="text-lg font-mono font-bold text-emerald-400">{routingPercentage}%</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="100" 
                    step="5"
                    value={routingPercentage}
                    onChange={(e) => setRoutingPercentage(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>10% (Conservative)</span>
                    <span>50% (Balanced)</span>
                    <span>100% (Max Yield)</span>
                  </div>
                </div>

                {/* Rule 3: Minimum Threshold */}
                <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-sm font-bold text-slate-200">Minimum Retained Balance</h4>
                      <p className="text-xs text-slate-400 mt-0.5">Always keep this minimum amount in Stripe for refunds/chargebacks.</p>
                    </div>
                    <span className="text-sm font-mono font-bold text-slate-200">${minThreshold.toLocaleString()}</span>
                  </div>
                  <input 
                    type="range" 
                    min="0" 
                    max="5000" 
                    step="250"
                    value={minThreshold}
                    onChange={(e) => setMinThreshold(Number(e.target.value))}
                    className="w-full accent-emerald-500 h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer"
                  />
                  <div className="flex justify-between text-[10px] font-mono text-slate-500">
                    <span>$0 (No buffer)</span>
                    <span>$2,500 (Standard buffer)</span>
                    <span>$5,000 (High buffer)</span>
                  </div>
                </div>

                {/* Rule 4: Notification Settings */}
                <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-3">
                  <h4 className="text-sm font-bold text-slate-200">Bridge Notifications</h4>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Slack Alerts on successful sweeps</span>
                    <button 
                      onClick={() => setNotifySlack(!notifySlack)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                        notifySlack ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ${
                        notifySlack ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-xs text-slate-400">Email Reports (Weekly digest)</span>
                    <button 
                      onClick={() => setNotifyEmail(!notifyEmail)}
                      className={`w-10 h-5 rounded-full p-0.5 transition-colors duration-200 focus:outline-none ${
                        notifyEmail ? 'bg-emerald-500' : 'bg-slate-800'
                      }`}
                    >
                      <div className={`w-4 h-4 rounded-full bg-slate-950 transition-transform duration-200 ${
                        notifyEmail ? 'translate-x-5' : 'translate-x-0'
                      }`} />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: YIELD STRATEGIES */}
          {activeTab === 'strategies' && (
            <div className="space-y-6">
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
                <h3 className="text-lg font-bold text-slate-100 mb-1">Yield Generation Strategies</h3>
                <p className="text-xs text-slate-400">Select the target strategy for routed funds. Strategies are managed automatically via Alpaca Broker API.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {strategies.map((strat) => {
                  const isSelected = selectedStrategy === strat.id;
                  return (
                    <div 
                      key={strat.id}
                      onClick={() => setSelectedStrategy(strat.id)}
                      className={`relative overflow-hidden border rounded-2xl p-6 cursor-pointer transition-all duration-300 hover:scale-[1.01] ${
                        isSelected 
                          ? `border-emerald-500 bg-emerald-950/10 shadow-lg shadow-emerald-500/5` 
                          : 'border-slate-800/80 bg-slate-900/30 hover:border-slate-700'
                      }`}
                      style={{
                        boxShadow: isSelected ? `0 10px 30px -10px ${strat.glowColor}` : 'none'
                      }}
                    >
                      <div className="flex justify-between items-start mb-4">
                        <span className={`text-xs font-mono px-2.5 py-1 rounded-full border ${
                          strat.risk === 'Low' ? 'text-emerald-400 border-emerald-500/20 bg-emerald-950/30' :
                          strat.risk === 'Moderate' ? 'text-blue-400 border-blue-500/20 bg-blue-950/30' :
                          'text-violet-400 border-violet-500/20 bg-violet-950/30'
                        }`}>
                          {strat.risk} Risk
                        </span>
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block font-mono">TARGET APY</span>
                          <span className="text-2xl font-extrabold text-slate-100 font-mono">{strat.apy}%</span>
                        </div>
                      </div>

                      <h4 className="text-base font-bold text-slate-200 mb-2">{strat.name}</h4>
                      <p className="text-xs text-slate-400 mb-4 leading-relaxed">{strat.description}</p>

                      <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center text-[11px] font-mono">
                        <div>
                          <span className="text-slate-500 block">ALLOCATION</span>
                          <span className="text-slate-300">{strat.allocation}</span>
                        </div>
                        {isSelected && (
                          <span className="flex items-center gap-1 text-emerald-400 font-bold">
                            <Check className="w-4 h-4" /> ACTIVE
                          </span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB: TRANSFER LEDGER */}
          {activeTab === 'history' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
              <div className="flex justify-between items-center mb-6">
                <div>
                  <h3 className="text-lg font-bold text-slate-100">Bridge Transfer Ledger</h3>
                  <p className="text-xs text-slate-400">Historical record of all Stripe payouts routed to Alpaca brokerage accounts.</p>
                </div>
                <button 
                  onClick={() => {
                    // Simulate refresh
                  }}
                  className="p-2 bg-slate-950 border border-slate-800 rounded-xl hover:border-slate-700 text-slate-400 hover:text-slate-200 transition-all duration-200"
                >
                  <RefreshCw className="w-4 h-4" />
                </button>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-mono text-slate-500 uppercase tracking-wider">
                      <th className="pb-3 font-medium">Transfer ID</th>
                      <th className="pb-3 font-medium">Date / Time</th>
                      <th className="pb-3 font-medium">Stripe Payout</th>
                      <th className="pb-3 font-medium">Strategy</th>
                      <th className="pb-3 font-medium text-right">Amount</th>
                      <th className="pb-3 font-medium text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/40 text-xs font-mono">
                    {transfers.map((tx) => (
                      <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors duration-150">
                        <td className="py-3.5 text-slate-300 font-bold">{tx.id}</td>
                        <td className="py-3.5 text-slate-400">{tx.date}</td>
                        <td className="py-3.5 text-slate-500">{tx.stripePayoutId}</td>
                        <td className="py-3.5 text-slate-300">{tx.strategy}</td>
                        <td className="py-3.5 text-right text-slate-100 font-bold">${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</td>
                        <td className="py-3.5 text-right">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-950/30 text-emerald-400 border border-emerald-500/20">
                            <span className="w-1 h-1 rounded-full bg-emerald-400"></span>
                            {tx.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB: API & WEBHOOKS */}
          {activeTab === 'api' && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-100 mb-1">API & Webhook Configuration</h3>
                <p className="text-xs text-slate-400">Manage your secure credentials and webhook endpoints for real-time payout listening.</p>
              </div>

              <div className="space-y-4">
                {/* Stripe API Key */}
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-mono">STRIPE REST API KEY (RESTRICTED)</label>
                  <div className="relative">
                    <input 
                      type={showApiKeys ? "text" : "password"} 
                      value={stripeApiKey}
                      onChange={(e) => setStripeApiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-12 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                    <button 
                      type="button"
                      onClick={() => setShowApiKeys(!showApiKeys)}
                      className="absolute right-3 top-2.5 text-xs text-slate-400 hover:text-slate-200 font-mono"
                    >
                      {showApiKeys ? "HIDE" : "SHOW"}
                    </button>
                  </div>
                </div>

                {/* Alpaca API Key */}
                <div>
                  <label className="text-xs text-slate-400 block mb-2 font-mono">ALPACA BROKER API KEY</label>
                  <div className="relative">
                    <input 
                      type={showApiKeys ? "text" : "password"} 
                      value={alpacaApiKey}
                      onChange={(e) => setAlpacaApiKey(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-12 text-xs text-slate-200 focus:outline-none focus:border-emerald-500/50 font-mono"
                    />
                    <Lock className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
                  </div>
                </div>

                {/* Webhook Endpoint */}
                <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-3">
                  <div className="flex justify-between items-center">
                    <h4 className="text-xs font-bold text-slate-200 font-mono">STRIPE WEBHOOK ENDPOINT</h4>
                    <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-500/20">Listening</span>
                  </div>
                  <p className="text-xs text-slate-400">
                    Configure this endpoint in your Stripe Dashboard to listen for <code className="text-emerald-400 font-mono">payout.created</code> and <code className="text-emerald-400 font-mono">payout.paid</code> events.
                  </p>
                  <div className="flex gap-2">
                    <input 
                      type="text" 
                      readOnly 
                      value="https://api.sovereign.nexus/v1/bridges/stripe-alpaca/webhook"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-3 text-xs text-slate-400 font-mono focus:outline-none"
                    />
                    <button 
                      onClick={() => navigator.clipboard.writeText("https://api.sovereign.nexus/v1/bridges/stripe-alpaca/webhook")}
                      className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-bold rounded-xl transition-colors duration-150"
                    >
                      Copy
                    </button>
                  </div>
                </div>

                {/* Alpaca Funding Wallet Details */}
                <div className="p-4 bg-slate-950/40 border border-slate-800/60 rounded-xl space-y-3">
                  <h4 className="text-xs font-bold text-slate-200 font-mono">ALPACA FUNDING WALLET (ACH/WIRE)</h4>
                  <p className="text-xs text-slate-400">
                    Your unique virtual funding wallet details for direct routing via Alpaca Broker API.
                  </p>
                  <div className="grid grid-cols-2 gap-4 text-xs font-mono">
                    <div>
                      <span className="text-slate-500 block">Bank Name</span>
                      <span className="text-slate-300">BMO Harris Bank</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Routing Number</span>
                      <span className="text-slate-300">071000288</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Account Number</span>
                      <span className="text-slate-300">1636877</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Special Instructions (FFC)</span>
                      <span className="text-emerald-400 font-bold">FFC LPCA-SOV-9921</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Right Column: Bridge Status & Health + Live Flow Visualizer */}
        <div className="space-y-8">
          
          {/* Bridge Status & Health */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Bridge Health & Status
            </h3>

            <div className="space-y-4">
              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Bridge Engine Status</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping"></span>
                  OPERATIONAL
                </span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Last Sweep Event</span>
                <span className="text-slate-300">Today, 14:22 UTC</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Total Routed Volume</span>
                <span className="text-emerald-400 font-bold">$154,800.00</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Average Settlement Time</span>
                <span className="text-slate-300">12 Minutes</span>
              </div>

              <div className="flex justify-between items-center text-xs font-mono">
                <span className="text-slate-400">Active Strategy</span>
                <span className="text-blue-400 font-bold">Treasury Yield (T-Bills)</span>
              </div>
            </div>
          </div>

          {/* Live Flow Visualizer */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md relative overflow-hidden">
            <h3 className="text-base font-bold text-slate-100 mb-4 flex items-center gap-2">
              <Activity className="w-5 h-5 text-emerald-400" />
              Live Flow Visualizer
            </h3>

            <div className="relative flex flex-col items-center justify-center py-8 space-y-6">
              {/* Stripe Node */}
              <div className="z-10 flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-slate-950 border border-blue-500/30 shadow-lg shadow-blue-500/5">
                <Building className="w-8 h-8 text-blue-400 mb-1" />
                <span className="text-[10px] font-mono text-slate-400">Stripe</span>
                <span className="text-[10px] font-mono text-blue-400 font-bold">${stripeLiveBalance.available > 1000 ? `${Math.round(stripeLiveBalance.available / 1000)}k` : stripeLiveBalance.available}</span>
              </div>

              {/* Flow Line (Vertical) */}
              <div className="absolute top-16 bottom-16 w-0.5 bg-gradient-to-b from-blue-500 via-emerald-500 to-violet-500 opacity-40"></div>

              {/* Animated Pulse Dot */}
              {autoRouteEnabled && (
                <div className="absolute w-3 h-3 rounded-full bg-emerald-400 shadow-lg shadow-emerald-500/50 animate-bounce" style={{ animationDuration: '2s' }}></div>
              )}

              {/* Bridge Engine Node */}
              <div className="z-10 flex flex-col items-center justify-center w-16 h-16 rounded-full bg-slate-950 border border-emerald-500/40 shadow-lg shadow-emerald-500/5">
                <Link2 className="w-6 h-6 text-emerald-400 animate-spin" style={{ animationDuration: '10s' }} />
                <span className="text-[8px] font-mono text-slate-500 mt-1">BRIDGE</span>
              </div>

              {/* Alpaca Node */}
              <div className="z-10 flex flex-col items-center justify-center w-24 h-24 rounded-2xl bg-slate-950 border border-violet-500/30 shadow-lg shadow-violet-500/5">
                <Wallet className="w-8 h-8 text-violet-400 mb-1" />
                <span className="text-[10px] font-mono text-slate-400">Alpaca</span>
                <span className="text-[10px] font-mono text-violet-400 font-bold">${alpacaLiveBalance.totalValue > 1000 ? `${Math.round(alpacaLiveBalance.totalValue / 1000)}k` : alpacaLiveBalance.totalValue}</span>
              </div>
            </div>

            <div className="text-center text-[11px] font-mono text-slate-500 mt-2">
              {autoRouteEnabled ? (
                <span className="text-emerald-400">Sweeping {routingPercentage}% of payouts to Alpaca</span>
              ) : (
                <span className="text-slate-400">Automated sweeps are currently paused</span>
              )}
            </div>
          </div>

          {/* Security & Compliance Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-base font-bold text-slate-100 mb-3 flex items-center gap-2">
              <Shield className="w-5 h-5 text-emerald-400" />
              Security & Compliance
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed mb-4">
              All transfers are routed through secure, encrypted channels using Stripe Connect and Alpaca Broker API. Funds are held in SIPC-insured brokerage accounts up to $500,000.
            </p>
            <div className="flex items-center gap-2 text-[10px] font-mono text-slate-500">
              <Lock className="w-3.5 h-3.5 text-emerald-400" />
              <span>AES-256 Encryption & OAuth 2.0 Protocol</span>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}