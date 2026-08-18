import React, { useState, useMemo } from 'react';
import { 
  TrendingUp, 
  Settings, 
  Users, 
  Percent, 
  Database, 
  Download, 
  Play, 
  Info, 
  Layers, 
  DollarSign, 
  Activity, 
  Code,
  CheckCircle,
  RefreshCw,
  Sliders,
  HelpCircle
} from 'lucide-react';

// --- TypeScript Interfaces ---
interface Account {
  id: string;
  name: string;
  volume: number; // in USD
  currentRate: number; // in %
  riskScore: 'Low' | 'Medium' | 'High';
}

interface ParameterState {
  baseRate: number;
  riskPremiumLow: number;
  riskPremiumMed: number;
  riskPremiumHigh: number;
  targetMargin: number;
  volumeThreshold: number;
  maxDiscount: number;
  costOfDebt: number;
  costOfEquity: number;
  debtRatio: number; // in %
  taxRate: number; // in %
}

export default function B2BInterestRateOptimizer() {
  // --- State Management ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'accounts' | 'wacc' | 'api'>('dashboard');
  
  const [params, setParams] = useState<ParameterState>({
    baseRate: 4.5,
    riskPremiumLow: 1.0,
    riskPremiumMed: 2.5,
    riskPremiumHigh: 4.5,
    targetMargin: 1.75,
    volumeThreshold: 2000000, // $2M
    maxDiscount: 1.5, // up to 1.5% discount for high volume
    costOfDebt: 5.5,
    costOfEquity: 11.0,
    debtRatio: 45, // 45% debt
    taxRate: 21, // 21% corporate tax
  });

  const [accounts, setAccounts] = useState<Account[]>([
    { id: '1', name: 'Acme Corporation', volume: 4500000, currentRate: 8.5, riskScore: 'Low' },
    { id: '2', name: 'Globex Industries', volume: 1200000, currentRate: 9.2, riskScore: 'Medium' },
    { id: '3', name: 'Initech LLC', volume: 450000, currentRate: 10.5, riskScore: 'High' },
    { id: '4', name: 'Umbrella Corp', volume: 8500000, currentRate: 7.8, riskScore: 'Low' },
    { id: '5', name: 'Hooli Inc', volume: 3100000, currentRate: 8.9, riskScore: 'Medium' },
    { id: '6', name: 'Stark Enterprises', volume: 12500000, currentRate: 7.2, riskScore: 'Low' },
    { id: '7', name: 'Soylent Green Co', volume: 850000, currentRate: 9.8, riskScore: 'High' },
    { id: '8', name: 'Tyrell Corp', volume: 6200000, currentRate: 8.1, riskScore: 'Medium' },
  ]);

  // API Explorer Interactive State
  const [apiVolume, setApiVolume] = useState<number>(3500000);
  const [apiRisk, setApiRisk] = useState<'Low' | 'Medium' | 'High'>('Medium');

  // --- Calculations ---
  
  // WACC Calculation: (D/V * Rd * (1 - T)) + (E/V * Re)
  const wacc = useMemo(() => {
    const wd = params.debtRatio / 100;
    const we = 1 - wd;
    const rd = params.costOfDebt / 100;
    const re = params.costOfEquity / 100;
    const t = params.taxRate / 100;
    
    const costOfDebtPostTax = rd * (1 - t);
    const calculatedWacc = (wd * costOfDebtPostTax) + (we * re);
    return calculatedWacc * 100; // Return as percentage
  }, [params.debtRatio, params.costOfDebt, params.costOfEquity, params.taxRate]);

  // Helper function to calculate optimized rate for a single account
  const calculateOptimizedRate = (volume: number, riskScore: 'Low' | 'Medium' | 'High') => {
    // 1. Determine Risk Premium
    let riskPremium = params.riskPremiumMed;
    if (riskScore === 'Low') riskPremium = params.riskPremiumLow;
    if (riskScore === 'High') riskPremium = params.riskPremiumHigh;

    // 2. Base Rate + Risk Premium + Target Margin
    const rawRate = params.baseRate + riskPremium + params.targetMargin;

    // 3. Calculate Volume Discount (Linear scaling up to volumeThreshold)
    const discountFactor = Math.min(1, volume / params.volumeThreshold);
    const volumeDiscount = discountFactor * params.maxDiscount;

    // 4. Apply discount but floor at WACC (Hurdle Rate) + small buffer (e.g., 0.5%)
    const floorRate = wacc + 0.5;
    const optimized = Math.max(floorRate, rawRate - volumeDiscount);

    return parseFloat(optimized.toFixed(2));
  };

  // Processed Accounts Data
  const optimizedAccounts = useMemo(() => {
    return accounts.map(acc => {
      const optimizedRate = calculateOptimizedRate(acc.volume, acc.riskScore);
      const currentInterest = (acc.volume * (acc.currentRate / 100));
      const optimizedInterest = (acc.volume * (optimizedRate / 100));
      const deltaInterest = optimizedInterest - currentInterest;
      
      return {
        ...acc,
        optimizedRate,
        currentInterest,
        optimizedInterest,
        deltaInterest,
      };
    });
  }, [accounts, params, wacc]);

  // Dashboard Metrics
  const metrics = useMemo(() => {
    const totalVolume = accounts.reduce((sum, acc) => sum + acc.volume, 0);
    const avgCurrentRate = accounts.reduce((sum, acc) => sum + acc.currentRate, 0) / accounts.length;
    const avgOptimizedRate = optimizedAccounts.reduce((sum, acc) => sum + acc.optimizedRate, 0) / optimizedAccounts.length;
    
    const totalCurrentInterest = optimizedAccounts.reduce((sum, acc) => sum + acc.currentInterest, 0);
    const totalOptimizedInterest = optimizedAccounts.reduce((sum, acc) => sum + acc.optimizedInterest, 0);
    const netRevenueChange = totalOptimizedInterest - totalCurrentInterest;

    return {
      totalVolume,
      avgCurrentRate,
      avgOptimizedRate,
      totalCurrentInterest,
      totalOptimizedInterest,
      netRevenueChange,
    };
  }, [optimizedAccounts, accounts]);

  // --- CSV Export ---
  const exportToCSV = () => {
    const headers = ['Account Name', 'Volume (USD)', 'Risk Profile', 'Current Rate (%)', 'Optimized Rate (%)', 'Current Annual Interest ($)', 'Optimized Annual Interest ($)', 'Net Change ($)'];
    const rows = optimizedAccounts.map(acc => [
      acc.name,
      acc.volume,
      acc.riskScore,
      acc.currentRate,
      acc.optimizedRate,
      acc.currentInterest.toFixed(2),
      acc.optimizedInterest.toFixed(2),
      acc.deltaInterest.toFixed(2)
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "b2b_interest_rate_optimization.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- Reset Parameters ---
  const resetParameters = () => {
    setParams({
      baseRate: 4.5,
      riskPremiumLow: 1.0,
      riskPremiumMed: 2.5,
      riskPremiumHigh: 4.5,
      targetMargin: 1.75,
      volumeThreshold: 2000000,
      maxDiscount: 1.5,
      costOfDebt: 5.5,
      costOfEquity: 11.0,
      debtRatio: 45,
      taxRate: 21,
    });
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans flex flex-col">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-950/50 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col sm:flex-row justify-between items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="bg-indigo-600 p-2 rounded-lg text-white shadow-lg shadow-indigo-500/20">
            <TrendingUp className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              B2B Interest Rate Optimizer
              <span className="text-xs bg-indigo-500/20 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/30">Enterprise v2.4</span>
            </h1>
            <p className="text-xs text-slate-400">Dynamic pricing engine & capital cost alignment tool</p>
          </div>
        </div>
        
        <div className="flex items-center gap-2 bg-slate-900 p-1 rounded-lg border border-slate-800">
          <button 
            onClick={() => setActiveTab('dashboard')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'dashboard' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Dashboard
          </button>
          <button 
            onClick={() => setActiveTab('accounts')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'accounts' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Account Manager
          </button>
          <button 
            onClick={() => setActiveTab('wacc')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'wacc' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            WACC Analysis
          </button>
          <button 
            onClick={() => setActiveTab('api')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'api' ? 'bg-indigo-600 text-white shadow' : 'text-slate-400 hover:text-slate-200'}`}
          >
            API Explorer
          </button>
        </div>
      </header>

      {/* Main Content Area */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 p-6 max-w-[1600px] mx-auto w-full">
        
        {/* Left Sidebar: Parameter Control Panel */}
        <aside className="xl:col-span-1 bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col gap-6 h-fit">
          <div className="flex justify-between items-center border-b border-slate-800 pb-4">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <Settings className="h-4 w-4 text-indigo-400" />
              Optimization Parameters
            </h2>
            <button 
              onClick={resetParameters}
              className="text-xs text-slate-400 hover:text-indigo-400 flex items-center gap-1 transition-colors"
              title="Reset to default values"
            >
              <RefreshCw className="h-3 w-3" /> Reset
            </button>
          </div>

          {/* Section 1: Base Rates */}
          <div className="space-y-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Percent className="h-3 w-3" /> Base & Margin
            </h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Base Rate (SOFR/Libor)</span>
                <span className="font-mono text-indigo-400">{params.baseRate}%</span>
              </div>
              <input 
                type="range" min="1" max="10" step="0.1" 
                value={params.baseRate} 
                onChange={(e) => setParams({...params, baseRate: parseFloat(e.target.value)})}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Target Margin</span>
                <span className="font-mono text-indigo-400">{params.targetMargin}%</span>
              </div>
              <input 
                type="range" min="0.5" max="5" step="0.05" 
                value={params.targetMargin} 
                onChange={(e) => setParams({...params, targetMargin: parseFloat(e.target.value)})}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Section 2: Risk Premiums */}
          <div className="space-y-4 border-t border-slate-800/60 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Sliders className="h-3 w-3" /> Risk Premiums
            </h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Low Risk Premium</span>
                <span className="font-mono text-emerald-400">{params.riskPremiumLow}%</span>
              </div>
              <input 
                type="range" min="0" max="3" step="0.1" 
                value={params.riskPremiumLow} 
                onChange={(e) => setParams({...params, riskPremiumLow: parseFloat(e.target.value)})}
                className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Medium Risk Premium</span>
                <span className="font-mono text-amber-400">{params.riskPremiumMed}%</span>
              </div>
              <input 
                type="range" min="1" max="5" step="0.1" 
                value={params.riskPremiumMed} 
                onChange={(e) => setParams({...params, riskPremiumMed: parseFloat(e.target.value)})}
                className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">High Risk Premium</span>
                <span className="font-mono text-rose-400">{params.riskPremiumHigh}%</span>
              </div>
              <input 
                type="range" min="2" max="8" step="0.1" 
                value={params.riskPremiumHigh} 
                onChange={(e) => setParams({...params, riskPremiumHigh: parseFloat(e.target.value)})}
                className="w-full accent-rose-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Section 3: Volume Discounts */}
          <div className="space-y-4 border-t border-slate-800/60 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <Layers className="h-3 w-3" /> Volume Incentives
            </h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Discount Threshold</span>
                <span className="font-mono text-indigo-400">${(params.volumeThreshold / 1000000).toFixed(1)}M</span>
              </div>
              <input 
                type="range" min="500000" max="10000000" step="500000" 
                value={params.volumeThreshold} 
                onChange={(e) => setParams({...params, volumeThreshold: parseInt(e.target.value)})}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Max Volume Discount</span>
                <span className="font-mono text-indigo-400">{params.maxDiscount}%</span>
              </div>
              <input 
                type="range" min="0" max="3" step="0.1" 
                value={params.maxDiscount} 
                onChange={(e) => setParams({...params, maxDiscount: parseFloat(e.target.value)})}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>
          </div>

          {/* Section 4: Capital Structure (WACC Inputs) */}
          <div className="space-y-4 border-t border-slate-800/60 pt-4">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
              <DollarSign className="h-3 w-3" /> Capital Structure
            </h3>
            
            <div>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-slate-300">Debt Ratio</span>
                <span className="font-mono text-indigo-400">{params.debtRatio}%</span>
              </div>
              <input 
                type="range" min="10" max="90" step="5" 
                value={params.debtRatio} 
                onChange={(e) => setParams({...params, debtRatio: parseInt(e.target.value)})}
                className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
              />
            </div>

            <div className="grid grid-cols-2 gap-2">
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Cost of Debt</label>
                <input 
                  type="number" step="0.1" value={params.costOfDebt}
                  onChange={(e) => setParams({...params, costOfDebt: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
              <div>
                <label className="block text-[10px] text-slate-400 mb-1">Cost of Equity</label>
                <input 
                  type="number" step="0.1" value={params.costOfEquity}
                  onChange={(e) => setParams({...params, costOfEquity: parseFloat(e.target.value) || 0})}
                  className="w-full bg-slate-900 border border-slate-800 rounded px-2 py-1 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>
          </div>

          {/* Hurdle Rate Indicator */}
          <div className="mt-auto bg-slate-900/80 border border-slate-800/80 rounded-xl p-3 flex items-center justify-between">
            <div>
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">WACC Hurdle Rate</span>
              <span className="text-lg font-bold text-indigo-400 font-mono">{wacc.toFixed(2)}%</span>
            </div>
            <div className="text-right">
              <span className="text-[10px] text-slate-400 uppercase tracking-wider block">Min Lending Floor</span>
              <span className="text-sm font-semibold text-slate-300 font-mono">{(wacc + 0.5).toFixed(2)}%</span>
            </div>
          </div>
        </aside>

        {/* Right Main Panel: Interactive Tabs */}
        <main className="xl:col-span-3 flex flex-col gap-6">
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              {/* KPI Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-400">Avg Optimized Rate</span>
                    <span className="bg-indigo-500/10 text-indigo-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                      vs {metrics.avgCurrentRate.toFixed(2)}% Current
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-white font-mono">{metrics.avgOptimizedRate.toFixed(2)}%</span>
                    <p className="text-[10px] text-slate-500 mt-1">Weighted average across portfolio</p>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-400">WACC Hurdle Rate</span>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded">
                      Active
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-emerald-400 font-mono">{wacc.toFixed(2)}%</span>
                    <p className="text-[10px] text-slate-500 mt-1">Minimum cost of capital floor</p>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-400">Total Portfolio Volume</span>
                    <span className="text-slate-500 text-xs font-mono">USD</span>
                  </div>
                  <div className="mt-2">
                    <span className="text-2xl font-bold text-white font-mono">${(metrics.totalVolume / 1000000).toFixed(2)}M</span>
                    <p className="text-[10px] text-slate-500 mt-1">Across {accounts.length} active accounts</p>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-xl p-4 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <span className="text-xs font-medium text-slate-400">Net Revenue Impact</span>
                    <span className={`text-[10px] font-semibold px-2 py-0.5 rounded ${metrics.netRevenueChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                      {metrics.netRevenueChange >= 0 ? '+' : ''}{((metrics.netRevenueChange / metrics.totalCurrentInterest) * 100).toFixed(1)}%
                    </span>
                  </div>
                  <div className="mt-2">
                    <span className={`text-2xl font-bold font-mono ${metrics.netRevenueChange >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                      {metrics.netRevenueChange >= 0 ? '+' : ''}${Math.abs(metrics.netRevenueChange).toLocaleString(undefined, {maximumFractionDigits: 0})}
                    </span>
                    <p className="text-[10px] text-slate-500 mt-1">Annualized interest delta</p>
                  </div>
                </div>
              </div>

              {/* Interactive SVG Chart: Rate vs Volume Curve */}
              <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-semibold text-slate-200">Dynamic Pricing Curve</h3>
                    <p className="text-xs text-slate-400">Visualizing optimized interest rates relative to deal volume and risk profiles</p>
                  </div>
                  <div className="flex gap-4 text-xs">
                    <span className="flex items-center gap-1.5 text-emerald-400">
                      <span className="w-3 h-3 rounded-full bg-emerald-500 inline-block"></span> Low Risk
                    </span>
                    <span className="flex items-center gap-1.5 text-amber-400">
                      <span className="w-3 h-3 rounded-full bg-amber-500 inline-block"></span> Med Risk
                    </span>
                    <span className="flex items-center gap-1.5 text-rose-400">
                      <span className="w-3 h-3 rounded-full bg-rose-500 inline-block"></span> High Risk
                    </span>
                    <span className="flex items-center gap-1.5 text-slate-400">
                      <span className="w-3 h-0.5 border-t-2 border-dashed border-slate-500 inline-block"></span> Hurdle Floor
                    </span>
                  </div>
                </div>

                {/* Responsive SVG Chart Container */}
                <div className="w-full h-72 bg-slate-950/60 rounded-xl border border-slate-800/80 relative p-4">
                  <svg className="w-full h-full overflow-visible" viewBox="0 0 800 250" preserveAspectRatio="none">
                    {/* Grid Lines */}
                    <line x1="50" y1="20" x2="780" y2="20" stroke="#1e293b" strokeWidth="1" />
                    <line x1="50" y1="70" x2="780" y2="70" stroke="#1e293b" strokeWidth="1" />
                    <line x1="50" y1="120" x2="780" y2="120" stroke="#1e293b" strokeWidth="1" />
                    <line x1="50" y1="170" x2="780" y2="170" stroke="#1e293b" strokeWidth="1" />
                    <line x1="50" y1="220" x2="780" y2="220" stroke="#334155" strokeWidth="1.5" />

                    {/* Y-Axis Labels (Rates 2% to 12%) */}
                    <text x="15" y="25" fill="#64748b" className="text-[10px] font-mono">12.0%</text>
                    <text x="15" y="75" fill="#64748b" className="text-[10px] font-mono">9.5%</text>
                    <text x="15" y="125" fill="#64748b" className="text-[10px] font-mono">7.0%</text>
                    <text x="15" y="175" fill="#64748b" className="text-[10px] font-mono">4.5%</text>
                    <text x="15" y="225" fill="#64748b" className="text-[10px] font-mono">2.0%</text>

                    {/* X-Axis Labels (Volume $0 to $10M) */}
                    <text x="50" y="242" fill="#64748b" className="text-[10px] font-mono">$0</text>
                    <text x="232" y="242" fill="#64748b" className="text-[10px] font-mono">$2.5M</text>
                    <text x="415" y="242" fill="#64748b" className="text-[10px] font-mono">$5.0M</text>
                    <text x="597" y="242" fill="#64748b" className="text-[10px] font-mono">$7.5M</text>
                    <text x="780" y="242" fill="#64748b" className="text-[10px] font-mono">$10M+</text>

                    {/* Hurdle Rate Line (Dashed) */}
                    {(() => {
                      const hurdleY = 220 - (((wacc + 0.5) - 2) / 10) * 200;
                      return (
                        <g>
                          <line 
                            x1="50" y1={hurdleY} x2="780" y2={hurdleY} 
                            stroke="#6366f1" strokeWidth="1.5" strokeDasharray="4 4" 
                          />
                          <text x="710" y={hurdleY - 6} fill="#818cf8" className="text-[9px] font-semibold">
                            Floor: {(wacc + 0.5).toFixed(2)}%
                          </text>
                        </g>
                      );
                    })()}

                    {/* Dynamic Curves (Low, Med, High Risk) */}
                    {['Low', 'Medium', 'High'].map((risk) => {
                      const points: string[] = [];
                      const steps = 20;
                      for (let i = 0; i <= steps; i++) {
                        const vol = (i / steps) * 10000000; // up to 10M
                        const rate = calculateOptimizedRate(vol, risk as 'Low' | 'Medium' | 'High');
                        
                        // Map vol (0 to 10M) to X (50 to 780)
                        const x = 50 + (vol / 10000000) * 730;
                        // Map rate (2% to 12%) to Y (220 to 20)
                        const y = 220 - ((rate - 2) / 10) * 200;
                        points.push(`${x},${y}`);
                      }

                      let strokeColor = '#f43f5e'; // High
                      if (risk === 'Low') strokeColor = '#10b981';
                      if (risk === 'Medium') strokeColor = '#f59e0b';

                      return (
                        <polyline
                          key={risk}
                          fill="none"
                          stroke={strokeColor}
                          strokeWidth="2.5"
                          points={points.join(' ')}
                          className="transition-all duration-300"
                        />
                      );
                    })}

                    {/* Plot Account Nodes */}
                    {optimizedAccounts.map((acc) => {
                      // Map vol (0 to 10M) to X (50 to 780)
                      const x = 50 + (Math.min(acc.volume, 10000000) / 10000000) * 730;
                      // Map rate (2% to 12%) to Y (220 to 20)
                      const y = 220 - ((acc.optimizedRate - 2) / 10) * 200;

                      let nodeColor = 'fill-rose-500';
                      if (acc.riskScore === 'Low') nodeColor = 'fill-emerald-500';
                      if (acc.riskScore === 'Medium') nodeColor = 'fill-amber-500';

                      return (
                        <g key={acc.id} className="group cursor-pointer">
                          <circle 
                            cx={x} cy={y} r="6" 
                            className={`${nodeColor} stroke-slate-900 stroke-2 hover:r-8 transition-all`} 
                          />
                          {/* Tooltip on hover */}
                          <title>{`${acc.name}\nVol: $${(acc.volume/1000000).toFixed(2)}M\nRate: ${acc.optimizedRate}%`}</title>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Quick Simulator & Insights */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="lg:col-span-2 bg-slate-950/40 border border-slate-800 rounded-2xl p-5">
                  <h3 className="text-sm font-semibold text-slate-200 mb-3 flex items-center gap-2">
                    <Activity className="h-4 w-4 text-indigo-400" />
                    Optimization Insights
                  </h3>
                  <div className="space-y-3 text-xs text-slate-300">
                    <div className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                      <CheckCircle className="h-4 w-4 text-emerald-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200 block">Capital Cost Alignment</span>
                        Your minimum lending floor is set to <strong className="text-indigo-400">{(wacc + 0.5).toFixed(2)}%</strong> (WACC + 50bps buffer). This ensures all optimized rates preserve capital efficiency and cover hurdle requirements.
                      </div>
                    </div>
                    <div className="flex items-start gap-2.5 bg-slate-900/60 p-3 rounded-lg border border-slate-800/50">
                      <Info className="h-4 w-4 text-indigo-400 shrink-0 mt-0.5" />
                      <div>
                        <span className="font-semibold text-slate-200 block">Volume Discount Impact</span>
                        Accounts exceeding <strong className="text-indigo-400">${(params.volumeThreshold/1000000).toFixed(1)}M</strong> in volume receive up to <strong className="text-indigo-400">{params.maxDiscount}%</strong> discount, scaling linearly to incentivize larger deal sizes.
                      </div>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200 mb-2">Portfolio Health</h3>
                    <p className="text-xs text-slate-400 mb-4">Current vs. Optimized yield comparison</p>
                  </div>
                  <div className="space-y-3">
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Current Yield</span>
                        <span className="font-mono text-slate-200">{metrics.avgCurrentRate.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-slate-500 h-full" style={{ width: `${(metrics.avgCurrentRate / 12) * 100}%` }}></div>
                      </div>
                    </div>
                    <div>
                      <div className="flex justify-between text-xs mb-1">
                        <span className="text-slate-400">Optimized Yield</span>
                        <span className="font-mono text-indigo-400">{metrics.avgOptimizedRate.toFixed(2)}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                        <div className="bg-indigo-500 h-full" style={{ width: `${(metrics.avgOptimizedRate / 12) * 100}%` }}></div>
                      </div>
                    </div>
                  </div>
                  <div className="text-[10px] text-slate-500 mt-4 text-center">
                    Optimized yield is aligned with current market risk premiums.
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ACCOUNT MANAGER */}
          {activeTab === 'accounts' && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-base font-semibold text-slate-200">B2B Account Portfolio</h3>
                  <p className="text-xs text-slate-400">Manage individual accounts, view optimized rates, and export data</p>
                </div>
                <button 
                  onClick={exportToCSV}
                  className="bg-indigo-600 hover:bg-indigo-500 text-white px-4 py-2 rounded-lg text-xs font-semibold flex items-center gap-2 transition-colors shadow-lg shadow-indigo-500/10"
                >
                  <Download className="h-3.5 w-3.5" /> Export Portfolio (CSV)
                </button>
              </div>

              {/* Account Table */}
              <div className="overflow-x-auto border border-slate-800 rounded-xl">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="bg-slate-900/80 border-b border-slate-800 text-xs font-semibold text-slate-400">
                      <th className="p-4">Account Name</th>
                      <th className="p-4">Deal Volume</th>
                      <th className="p-4">Risk Profile</th>
                      <th className="p-4">Current Rate</th>
                      <th className="p-4">Optimized Rate</th>
                      <th className="p-4 text-right">Annual Revenue Delta</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {optimizedAccounts.map((acc) => {
                      const isRateIncreased = acc.optimizedRate > acc.currentRate;
                      return (
                        <tr key={acc.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="p-4 font-medium text-slate-200">{acc.name}</td>
                          <td className="p-4 font-mono text-slate-300">${acc.volume.toLocaleString()}</td>
                          <td className="p-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                              acc.riskScore === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              acc.riskScore === 'Medium' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                            }`}>
                              {acc.riskScore}
                            </span>
                          </td>
                          <td className="p-4 font-mono text-slate-400">{acc.currentRate.toFixed(2)}%</td>
                          <td className="p-4 font-mono text-indigo-400 font-semibold">{acc.optimizedRate.toFixed(2)}%</td>
                          <td className={`p-4 font-mono text-right font-semibold ${isRateIncreased ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {isRateIncreased ? '+' : ''}${acc.deltaInterest.toLocaleString(undefined, {maximumFractionDigits: 0})}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: WACC ANALYSIS */}
          {activeTab === 'wacc' && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-200">Weighted Average Cost of Capital (WACC)</h3>
                <p className="text-xs text-slate-400">Understand how capital structure and funding costs define your lending hurdle rate</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* WACC Formula Breakdown */}
                <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">WACC Formula & Inputs</h4>
                  
                  <div className="bg-slate-950/80 p-4 rounded-lg border border-slate-800 font-mono text-xs text-slate-300 space-y-2">
                    <div className="text-indigo-400 font-semibold">WACC = (E/V × Re) + (D/V × Rd × (1 - T))</div>
                    <div className="text-[10px] text-slate-500">
                      Where: E/V = Equity Ratio, Re = Cost of Equity, D/V = Debt Ratio, Rd = Cost of Debt, T = Corporate Tax Rate
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 block">Equity Component</span>
                      <div className="bg-slate-950/40 p-3 rounded border border-slate-800/80">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Weight (E/V)</span>
                          <span className="font-mono text-slate-200">{100 - params.debtRatio}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Cost of Equity (Re)</span>
                          <span className="font-mono text-slate-200">{params.costOfEquity}%</span>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-2">
                      <span className="text-xs text-slate-400 block">Debt Component (Post-Tax)</span>
                      <div className="bg-slate-950/40 p-3 rounded border border-slate-800/80">
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Weight (D/V)</span>
                          <span className="font-mono text-slate-200">{params.debtRatio}%</span>
                        </div>
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Cost of Debt (Rd)</span>
                          <span className="font-mono text-slate-200">{(params.costOfDebt * (1 - params.taxRate / 100)).toFixed(2)}% <span className="text-[10px] text-slate-500">(Tax Shielded)</span></span>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Hurdle Gauge */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between items-center text-center">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Calculated Hurdle</h4>
                    <p className="text-[10px] text-slate-500">Minimum yield required to cover capital costs</p>
                  </div>

                  <div className="relative flex items-center justify-center my-4">
                    {/* Simple SVG Gauge */}
                    <svg className="w-36 h-36 transform -rotate-90">
                      <circle cx="72" cy="72" r="60" stroke="#1e293b" strokeWidth="10" fill="transparent" />
                      <circle 
                        cx="72" cy="72" r="60" stroke="#6366f1" strokeWidth="10" fill="transparent" 
                        strokeDasharray={2 * Math.PI * 60}
                        strokeDashoffset={2 * Math.PI * 60 * (1 - wacc / 15)} // scaled up to 15% max
                        strokeLinecap="round"
                        className="transition-all duration-500"
                      />
                    </svg>
                    <div className="absolute flex flex-col items-center justify-center">
                      <span className="text-2xl font-bold text-white font-mono">{wacc.toFixed(2)}%</span>
                      <span className="text-[10px] text-slate-400 uppercase tracking-wider">WACC</span>
                    </div>
                  </div>

                  <div className="text-xs text-slate-300">
                    Lending Floor: <strong className="text-indigo-400">{(wacc + 0.5).toFixed(2)}%</strong>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: API EXPLORER */}
          {activeTab === 'api' && (
            <div className="bg-slate-950/40 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div>
                <h3 className="text-base font-semibold text-slate-200">Developer API Explorer</h3>
                <p className="text-xs text-slate-400">Integrate the interest rate optimization engine directly into your CRM or Loan Origination System</p>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Interactive Request Builder */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 space-y-4">
                  <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <Sliders className="h-3.5 w-3.5 text-indigo-400" />
                    Interactive Request Builder
                  </h4>

                  <div className="space-y-3">
                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Deal Volume (USD)</label>
                      <input 
                        type="number" 
                        value={apiVolume} 
                        onChange={(e) => setApiVolume(parseInt(e.target.value) || 0)}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs text-slate-300 mb-1">Risk Profile</label>
                      <select 
                        value={apiRisk} 
                        onChange={(e) => setApiRisk(e.target.value as 'Low' | 'Medium' | 'High')}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="Low">Low Risk</option>
                        <option value="Medium">Medium Risk</option>
                        <option value="High">High Risk</option>
                      </select>
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-3 rounded-lg border border-slate-800/80 space-y-2">
                    <span className="text-[10px] text-slate-400 uppercase tracking-wider block">cURL Request</span>
                    <pre className="text-[10px] text-slate-300 font-mono overflow-x-auto whitespace-pre-wrap">
                      {`curl -X POST https://api.lending-engine.internal/v1/optimize \\
  -H "Authorization: Bearer tkn_982347" \\
  -H "Content-Type: application/json" \\
  -d '{
    "volume": ${apiVolume},
    "risk_profile": "${apiRisk.toLowerCase()}"
  }'`}
                    </pre>
                  </div>
                </div>

                {/* Live JSON Response */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-center mb-3">
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-emerald-400" />
                      Live JSON Response
                    </h4>
                    <span className="bg-emerald-500/10 text-emerald-400 text-[10px] font-semibold px-2 py-0.5 rounded flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> 200 OK
                    </span>
                  </div>

                  <pre className="bg-slate-950 p-4 rounded-lg border border-slate-800 font-mono text-xs text-emerald-400 overflow-x-auto flex-1">
                    {JSON.stringify({
                      status: "success",
                      timestamp: new Date().toISOString(),
                      data: {
                        requested_volume: apiVolume,
                        risk_profile: apiRisk,
                        pricing_metrics: {
                          base_rate: params.baseRate,
                          risk_premium: apiRisk === 'Low' ? params.riskPremiumLow : apiRisk === 'High' ? params.riskPremiumHigh : params.riskPremiumMed,
                          target_margin: params.targetMargin,
                          volume_discount_applied: parseFloat(Math.min(params.maxDiscount, (apiVolume / params.volumeThreshold) * params.maxDiscount).toFixed(2)),
                        },
                        hurdle_rates: {
                          wacc: parseFloat(wacc.toFixed(2)),
                          minimum_lending_floor: parseFloat((wacc + 0.5).toFixed(2))
                        },
                        optimized_interest_rate: calculateOptimizedRate(apiVolume, apiRisk)
                      }
                    }, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          )}

        </main>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950/30 py-4 px-6 text-center text-xs text-slate-500 mt-auto">
        &copy; {new Date().getFullYear()} B2B Interest Rate Optimizer. All rights reserved. Internal Treasury & Risk Management Tool.
      </footer>
    </div>
  );
}