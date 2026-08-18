import React, { useState, useEffect, useContext, useMemo } from 'react';
import { 
  CreditCard, 
  Shield, 
  AlertTriangle, 
  TrendingUp, 
  RefreshCw, 
  Sliders, 
  Zap, 
  DollarSign, 
  Percent, 
  Activity, 
  ShieldAlert, 
  CheckCircle2, 
  Play, 
  Pause, 
  Info, 
  ArrowRight, 
  Lock, 
  Unlock, 
  Database, 
  Eye, 
  MessageSquare, 
  BarChart3, 
  SlidersHorizontal, 
  Check, 
  X,
  TrendingDown,
  Sparkles,
  Cpu
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
  PieChart, 
  Pie, 
  Cell, 
  ReferenceLine 
} from 'recharts';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';

interface CollateralAsset {
  symbol: string;
  name: string;
  type: 'stock' | 'crypto';
  amount: number;
  price: number;
  value: number;
  volatility: 'Low' | 'Medium' | 'High';
  collateralWeight: number; // LTV multiplier (e.g., 0.8 for blue chips, 0.5 for crypto)
  isEnabled: boolean;
}

export default function VisaAlpacaCollateralBridge() {
  const dataContext = useContext(DataContext);
  
  // State for Alpaca Portfolio Collateral
  const [assets, setAssets] = useState<CollateralAsset[]>([
    { symbol: 'BTC', name: 'Bitcoin', type: 'crypto', amount: 1.45, price: 96500, value: 139925, volatility: 'High', collateralWeight: 0.60, isEnabled: true },
    { symbol: 'ETH', name: 'Ethereum', type: 'crypto', amount: 12.8, price: 2750, value: 35200, volatility: 'High', collateralWeight: 0.55, isEnabled: true },
    { symbol: 'AAPL', name: 'Apple Inc.', type: 'stock', amount: 150, price: 242.50, value: 36375, volatility: 'Low', collateralWeight: 0.85, isEnabled: true },
    { symbol: 'TSLA', name: 'Tesla Inc.', type: 'stock', amount: 85, price: 268.20, value: 22797, volatility: 'High', collateralWeight: 0.70, isEnabled: true },
    { symbol: 'MSFT', name: 'Microsoft Corp.', type: 'stock', amount: 90, price: 415.80, value: 37422, volatility: 'Low', collateralWeight: 0.85, isEnabled: true },
    { symbol: 'SOL', name: 'Solana', type: 'crypto', amount: 110, price: 185.40, value: 20394, volatility: 'High', collateralWeight: 0.45, isEnabled: false },
  ]);

  // Configuration States
  const [targetLtv, setTargetLtv] = useState<number>(50); // Target Loan-to-Value %
  const [marginCallLtv, setMarginCallLtv] = useState<number>(80); // Margin Call Trigger LTV %
  const [liquidationLtv, setLiquidationLtv] = useState<number>(90); // Liquidation Trigger LTV %
  const [isAutoLiquidationEnabled, setIsAutoLiquidationEnabled] = useState<boolean>(true);
  const [visaCardNumber, setVisaCardNumber] = useState<string>('4532 •••• •••• 8892');
  const [visaStatus, setVisaStatus] = useState<'Active' | 'Frozen' | 'Margin_Call'>('Active');
  
  // Spending States
  const [currentSpending, setCurrentSpending] = useState<number>(42500);
  const [simulatedMarketDrop, setSimulatedMarketDrop] = useState<number>(0); // % drop in market prices
  
  // AI Risk Assessment States
  const [aiAnalysis, setAiAnalysis] = useState<string>('');
  const [isAiLoading, setIsAiLoading] = useState<boolean>(false);
  const [riskScore, setRiskScore] = useState<'Low' | 'Moderate' | 'High' | 'Critical'>('Moderate');

  // Logs & History
  const [logs, setLogs] = useState<Array<{ timestamp: string; type: 'info' | 'warning' | 'danger' | 'success'; message: string }>>([
    { timestamp: new Date(Date.now() - 3600000 * 4).toLocaleTimeString(), type: 'success', message: 'Visa spending limit synchronized with Alpaca portfolio.' },
    { timestamp: new Date(Date.now() - 3600000 * 3).toLocaleTimeString(), type: 'info', message: 'Rebalanced collateral weights: AAPL LTV weight adjusted to 85%.' },
    { timestamp: new Date(Date.now() - 3600000 * 2).toLocaleTimeString(), type: 'info', message: 'Visa transaction of $1,250 approved at "Sovereign Cloud Services".' },
  ]);

  // Calculations
  const totals = useMemo(() => {
    let totalPortfolioValue = 0;
    let totalCollateralValue = 0; // Weighted collateral value
    
    assets.forEach(asset => {
      const currentPrice = asset.price * (1 - simulatedMarketDrop / 100);
      const currentValue = asset.amount * currentPrice;
      totalPortfolioValue += currentValue;
      
      if (asset.isEnabled) {
        totalCollateralValue += currentValue * asset.collateralWeight;
      }
    });

    // Max spending limit based on target LTV of the weighted collateral value
    const maxSpendingLimit = totalCollateralValue * (targetLtv / 100);
    const currentLtv = totalCollateralValue > 0 ? (currentSpending / totalCollateralValue) * 100 : 0;
    
    // Determine status
    let status: 'Active' | 'Frozen' | 'Margin_Call' = 'Active';
    if (currentLtv >= liquidationLtv) {
      status = 'Frozen';
    } else if (currentLtv >= marginCallLtv) {
      status = 'Margin_Call';
    }

    return {
      portfolioValue: totalPortfolioValue,
      collateralValue: totalCollateralValue,
      maxSpendingLimit,
      currentLtv,
      status
    };
  }, [assets, targetLtv, marginCallLtv, liquidationLtv, currentSpending, simulatedMarketDrop]);

  // Sync Visa Status with calculations
  useEffect(() => {
    setVisaStatus(totals.status);
    
    // Trigger automated liquidation warning/action
    if (totals.currentLtv >= marginCallLtv && totals.currentLtv < liquidationLtv) {
      addLog('warning', `MARGIN CALL WARNING: Current LTV is ${totals.currentLtv.toFixed(1)}%. Please reduce spending or add collateral.`);
    } else if (totals.currentLtv >= liquidationLtv) {
      if (isAutoLiquidationEnabled) {
        addLog('danger', `LIQUIDATION TRIGGERED: LTV reached ${totals.currentLtv.toFixed(1)}%. Automatically liquidating Alpaca assets to cover Visa balance.`);
        handleAutoLiquidation();
      } else {
        addLog('danger', `CRITICAL MARGIN BREACH: LTV is ${totals.currentLtv.toFixed(1)}%. Visa card frozen. Auto-liquidation is disabled!`);
      }
    }
  }, [totals.currentLtv, marginCallLtv, liquidationLtv]);

  const addLog = (type: 'info' | 'warning' | 'danger' | 'success', message: string) => {
    setLogs(prev => [{ timestamp: new Date().toLocaleTimeString(), type, message }, ...prev]);
  };

  // Automated Liquidation Simulation
  const handleAutoLiquidation = () => {
    // Liquidate assets starting from highest volatility / crypto to bring LTV back to target LTV
    let debtToPay = currentSpending - (totals.collateralValue * (targetLtv / 100));
    if (debtToPay <= 0) return;

    addLog('info', `Initiating automated liquidation of $${debtToPay.toLocaleString(undefined, {maximumFractionDigits: 2})} to restore target LTV.`);

    const updatedAssets = [...assets];
    // Sort by volatility (High first) and type (Crypto first)
    const liquidationOrder = [...updatedAssets]
      .filter(a => a.isEnabled && a.value > 0)
      .sort((a, b) => {
        if (a.type === 'crypto' && b.type !== 'crypto') return -1;
        if (a.type !== 'crypto' && b.type === 'crypto') return 1;
        return b.volatility === 'High' ? 1 : -1;
      });

    let liquidatedAmount = 0;
    liquidationOrder.forEach(target => {
      if (debtToPay <= 0) return;
      
      const assetIndex = updatedAssets.findIndex(a => a.symbol === target.symbol);
      const asset = updatedAssets[assetIndex];
      const assetCurrentValue = asset.amount * asset.price * (1 - simulatedMarketDrop / 100);
      
      if (assetCurrentValue <= debtToPay) {
        // Liquidate entire asset
        liquidatedAmount += assetCurrentValue;
        debtToPay -= assetCurrentValue;
        addLog('success', `Liquidated 100% of ${asset.symbol} (${asset.amount.toFixed(4)} units) for $${assetCurrentValue.toLocaleString(undefined, {maximumFractionDigits: 2})}`);
        updatedAssets[assetIndex] = { ...asset, amount: 0, value: 0 };
      } else {
        // Liquidate partial asset
        const fractionToLiquidate = debtToPay / assetCurrentValue;
        const amountToLiquidate = asset.amount * fractionToLiquidate;
        liquidatedAmount += debtToPay;
        addLog('success', `Liquidated partial ${asset.symbol} (${amountToLiquidate.toFixed(4)} units) for $${debtToPay.toLocaleString(undefined, {maximumFractionDigits: 2})}`);
        updatedAssets[assetIndex] = { 
          ...asset, 
          amount: asset.amount - amountToLiquidate,
          value: (asset.amount - amountToLiquidate) * asset.price * (1 - simulatedMarketDrop / 100)
        };
        debtToPay = 0;
      }
    });

    setAssets(updatedAssets);
    setCurrentSpending(prev => Math.max(0, prev - liquidatedAmount));
    setSimulatedMarketDrop(0); // Reset market drop after liquidation
    addLog('success', `Auto-liquidation complete. Target LTV restored.`);
  };

  // Toggle asset collateral status
  const toggleAsset = (symbol: string) => {
    setAssets(prev => prev.map(asset => {
      if (asset.symbol === symbol) {
        const nextState = !asset.isEnabled;
        addLog('info', `${asset.symbol} has been ${nextState ? 'enabled' : 'disabled'} as Visa collateral.`);
        return { ...asset, isEnabled: nextState };
      }
      return asset;
    }));
  };

  // Trigger Gemini AI Risk Analysis
  const runAiRiskAnalysis = async () => {
    setIsAiLoading(true);
    try {
      const prompt = `
        Analyze this portfolio used as collateral for a Visa credit line:
        Assets: ${JSON.stringify(assets.map(a => ({ symbol: a.symbol, value: a.value, volatility: a.volatility, weight: a.collateralWeight, enabled: a.isEnabled })))}
        Current Target LTV: ${targetLtv}%
        Margin Call LTV: ${marginCallLtv}%
        Liquidation LTV: ${liquidationLtv}%
        Current Spending: $${currentSpending}
        
        Provide a concise risk assessment. Rate the risk (Low, Moderate, High, Critical). Suggest optimal LTV limits and highlight any concentration risks (e.g., too much crypto collateral). Format with clean markdown.
      `;
      
      const response = await callGemini(prompt);
      setAiAnalysis(response);
      
      // Simple heuristic to set risk score based on response
      if (response.toLowerCase().includes('critical')) setRiskScore('Critical');
      else if (response.toLowerCase().includes('high')) setRiskScore('High');
      else if (response.toLowerCase().includes('moderate')) setRiskScore('Moderate');
      else setRiskScore('Low');
      
      addLog('success', 'Gemini AI Risk Assessment updated.');
    } catch (error) {
      console.error(error);
      setAiAnalysis('Failed to generate AI risk analysis. Please check your Gemini API configuration.');
    } finally {
      setIsAiLoading(false);
    }
  };

  // Chart Data: Simulate LTV scenarios
  const chartData = useMemo(() => {
    return [
      { name: 'Current', LTV: totals.currentLtv, Limit: totals.maxSpendingLimit, Spending: currentSpending },
      { name: 'Market -10%', LTV: totals.currentLtv * 1.11, Limit: totals.maxSpendingLimit * 0.9, Spending: currentSpending },
      { name: 'Market -25%', LTV: totals.currentLtv * 1.33, Limit: totals.maxSpendingLimit * 0.75, Spending: currentSpending },
      { name: 'Market -50%', LTV: totals.currentLtv * 2.0, Limit: totals.maxSpendingLimit * 0.5, Spending: currentSpending },
    ];
  }, [totals, currentSpending]);

  return (
    <div className="p-6 bg-slate-950 text-slate-100 min-h-screen space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center border-b border-slate-800 pb-6 gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold border border-blue-500/20 uppercase tracking-wider">
              Visa Bridge
            </span>
            <span className="px-2.5 py-1 rounded-md bg-emerald-500/10 text-emerald-400 text-xs font-semibold border border-emerald-500/20 uppercase tracking-wider">
              Alpaca Custody
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Visa Alpaca Collateral Bridge
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Leverage your stock and crypto portfolios for instant Visa spending power with automated margin protection.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button 
            onClick={runAiRiskAnalysis}
            disabled={isAiLoading}
            className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white rounded-lg font-medium text-sm transition-all shadow-lg shadow-indigo-500/10 disabled:opacity-50"
          >
            {isAiLoading ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
            AI Risk Advisor
          </button>
          <button 
            onClick={() => {
              setSimulatedMarketDrop(0);
              addLog('info', 'Market simulation reset to baseline.');
            }}
            className="flex items-center gap-2 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg font-medium text-sm transition-all"
          >
            <RefreshCw className="w-4 h-4" />
            Reset Market
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {/* Portfolio Value */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl" />
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-400">Alpaca Portfolio Value</p>
            <Database className="w-5 h-5 text-blue-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-white">
            ${totals.portfolioValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <div className="flex items-center gap-1.5 mt-2 text-xs">
            {simulatedMarketDrop > 0 ? (
              <span className="text-rose-400 flex items-center gap-0.5">
                <TrendingDown className="w-3.5 h-3.5" /> -{simulatedMarketDrop}% Simulated Drop
              </span>
            ) : (
              <span className="text-emerald-400 flex items-center gap-0.5">
                <TrendingUp className="w-3.5 h-3.5" /> Live Market Feed
              </span>
            )}
          </div>
        </div>

        {/* Weighted Collateral */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-400">Weighted Collateral Value</p>
            <Shield className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-white">
            ${totals.collateralValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Adjusted for asset-specific LTV weights
          </p>
        </div>

        {/* Visa Spending Limit */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl" />
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-400">Visa Spending Limit</p>
            <CreditCard className="w-5 h-5 text-violet-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-white">
            ${totals.maxSpendingLimit.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </p>
          <p className="text-xs text-slate-500 mt-2">
            Based on {targetLtv}% Target LTV
          </p>
        </div>

        {/* Current LTV Health */}
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl" />
          <div className="flex justify-between items-start">
            <p className="text-sm font-medium text-slate-400">Current LTV Health</p>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <p className="text-2xl font-bold mt-2 text-white">
            {totals.currentLtv.toFixed(1)}%
          </p>
          <div className="mt-2">
            {totals.currentLtv < marginCallLtv ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                SAFE HEALTH
              </span>
            ) : totals.currentLtv < liquidationLtv ? (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
                MARGIN CALL WARNING
              </span>
            ) : (
              <span className="px-2 py-0.5 rounded text-[10px] font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                LIQUIDATION BREACH
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Collateral Configurator & Asset List */}
        <div className="lg:col-span-2 space-y-6">
          
          {/* Collateral Configurator */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Sliders className="w-5 h-5 text-blue-400" />
                <h2 className="text-lg font-semibold text-white">Collateral & LTV Parameters</h2>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Auto-Liquidation</span>
                <button 
                  onClick={() => setIsAutoLiquidationEnabled(!isAutoLiquidationEnabled)}
                  className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${isAutoLiquidationEnabled ? 'bg-blue-600' : 'bg-slate-800'}`}
                >
                  <span className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${isAutoLiquidationEnabled ? 'translate-x-6' : 'translate-x-1'}`} />
                </button>
              </div>
            </div>

            <div className="space-y-6">
              {/* Target LTV Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">Target LTV (Spending Limit)</span>
                  <span className="text-blue-400 font-semibold">{targetLtv}%</span>
                </div>
                <input 
                  type="range" 
                  min="10" 
                  max="70" 
                  value={targetLtv} 
                  onChange={(e) => setTargetLtv(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Determines your maximum Visa spending limit relative to your weighted collateral. Recommended: &lt; 50%.
                </p>
              </div>

              {/* Margin Call LTV Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">Margin Call Threshold</span>
                  <span className="text-amber-400 font-semibold">{marginCallLtv}%</span>
                </div>
                <input 
                  type="range" 
                  min="50" 
                  max="85" 
                  value={marginCallLtv} 
                  onChange={(e) => setMarginCallLtv(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-slate-500">
                  LTV level at which you receive warnings and Visa spending is restricted to prevent liquidation.
                </p>
              </div>

              {/* Liquidation LTV Slider */}
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-slate-300 font-medium">Liquidation Threshold</span>
                  <span className="text-rose-400 font-semibold">{liquidationLtv}%</span>
                </div>
                <input 
                  type="range" 
                  min="75" 
                  max="95" 
                  value={liquidationLtv} 
                  onChange={(e) => setLiquidationLtv(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-xs text-slate-500">
                  LTV level at which automated liquidation of Alpaca assets is triggered to pay down Visa balance.
                </p>
              </div>
            </div>
          </div>

          {/* Alpaca Collateral Assets */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-2">
                <Database className="w-5 h-5 text-emerald-400" />
                <h2 className="text-lg font-semibold text-white">Alpaca Portfolio Assets</h2>
              </div>
              <span className="text-xs text-slate-400">
                {assets.filter(a => a.isEnabled).length} of {assets.length} Assets Enabled as Collateral
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                    <th className="pb-3">Asset</th>
                    <th className="pb-3">Type</th>
                    <th className="pb-3 text-right">Balance</th>
                    <th className="pb-3 text-right">Price</th>
                    <th className="pb-3 text-right">Value</th>
                    <th className="pb-3 text-center">LTV Weight</th>
                    <th className="pb-3 text-center">Collateral</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50 text-sm">
                  {assets.map((asset) => {
                    const currentPrice = asset.price * (1 - simulatedMarketDrop / 100);
                    const currentValue = asset.amount * currentPrice;
                    return (
                      <tr key={asset.symbol} className={`hover:bg-slate-900/20 transition-colors ${!asset.isEnabled ? 'opacity-50' : ''}`}>
                        <td className="py-4 font-medium text-white">
                          <div className="flex flex-col">
                            <span>{asset.symbol}</span>
                            <span className="text-xs text-slate-500">{asset.name}</span>
                          </div>
                        </td>
                        <td className="py-4">
                          <span className={`px-2 py-0.5 rounded text-xs font-medium ${asset.type === 'crypto' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' : 'bg-blue-500/10 text-blue-400 border border-blue-500/20'}`}>
                            {asset.type}
                          </span>
                        </td>
                        <td className="py-4 text-right font-mono">
                          {asset.amount.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 4 })}
                        </td>
                        <td className="py-4 text-right font-mono">
                          ${currentPrice.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 text-right font-mono text-white">
                          ${currentValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                        </td>
                        <td className="py-4 text-center font-mono text-emerald-400">
                          {(asset.collateralWeight * 100).toFixed(0)}%
                        </td>
                        <td className="py-4 text-center">
                          <button 
                            onClick={() => toggleAsset(asset.symbol)}
                            className={`px-3 py-1 rounded-md text-xs font-medium transition-all ${asset.isEnabled ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'}`}
                          >
                            {asset.isEnabled ? 'Active' : 'Disabled'}
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

        </div>

        {/* Right Column: Visa Card, Simulation & AI Risk Advisor */}
        <div className="space-y-6">
          
          {/* Visa Card Display */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-slate-800 rounded-xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-48 h-48 bg-blue-500/10 rounded-full blur-3xl" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-violet-500/10 rounded-full blur-3xl" />
            
            <div className="flex justify-between items-start mb-8">
              <div className="flex items-center gap-2">
                <CreditCard className="w-6 h-6 text-blue-400" />
                <span className="text-sm font-semibold tracking-wider text-slate-300">SOVEREIGN VISA</span>
              </div>
              <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${
                visaStatus === 'Active' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                visaStatus === 'Margin_Call' ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' :
                'bg-rose-500/10 text-rose-400 border-rose-500/20'
              }`}>
                {visaStatus.replace('_', ' ')}
              </span>
            </div>

            <div className="space-y-4">
              <div className="text-xl font-mono tracking-widest text-white">
                {visaCardNumber}
              </div>
              
              <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/80">
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Current Spending</p>
                  <p className="text-lg font-bold text-white">${currentSpending.toLocaleString()}</p>
                </div>
                <div>
                  <p className="text-[10px] uppercase tracking-wider text-slate-500">Available Limit</p>
                  <p className="text-lg font-bold text-emerald-400">
                    ${Math.max(0, totals.maxSpendingLimit - currentSpending).toLocaleString(undefined, { maximumFractionDigits: 0 })}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Market Simulation Terminal */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
            <div className="flex items-center gap-2 mb-4">
              <Activity className="w-5 h-5 text-amber-400" />
              <h2 className="text-lg font-semibold text-white">Stress Test Simulator</h2>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Simulate market volatility to test automated margin calls and liquidation thresholds.
            </p>

            <div className="space-y-4">
              {/* Market Drop Buttons */}
              <div className="grid grid-cols-3 gap-2">
                {[10, 25, 40].map((drop) => (
                  <button
                    key={drop}
                    onClick={() => {
                      setSimulatedMarketDrop(drop);
                      addLog('warning', `Simulating a -${drop}% market crash on Alpaca portfolio.`);
                    }}
                    className={`py-2 px-3 rounded-lg text-xs font-semibold border transition-all ${
                      simulatedMarketDrop === drop 
                        ? 'bg-rose-500/20 text-rose-400 border-rose-500/40' 
                        : 'bg-slate-800/50 text-slate-300 border-slate-700 hover:bg-slate-800'
                    }`}
                  >
                    -{drop}% Drop
                  </button>
                ))}
              </div>

              {/* Spending Adjuster */}
              <div className="space-y-2 pt-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Simulate Visa Spending</span>
                  <span className="text-white font-mono">${currentSpending.toLocaleString()}</span>
                </div>
                <input 
                  type="range" 
                  min="10000" 
                  max="150000" 
                  step="5000"
                  value={currentSpending} 
                  onChange={(e) => setCurrentSpending(Number(e.target.value))}
                  className="w-full h-1 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* Quick Actions */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={() => {
                    setCurrentSpending(0);
                    addLog('success', 'Visa balance paid off in full.');
                  }}
                  className="flex-1 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Pay Off Balance
                </button>
                <button
                  onClick={handleAutoLiquidation}
                  disabled={totals.currentLtv < marginCallLtv}
                  className="flex-1 py-2 bg-rose-600 hover:bg-rose-500 disabled:bg-slate-800 disabled:text-slate-500 text-white rounded-lg text-xs font-semibold transition-all"
                >
                  Force Liquidation
                </button>
              </div>
            </div>
          </div>

          {/* AI Risk Advisor Panel */}
          {aiAnalysis && (
            <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Sparkles className="w-5 h-5 text-violet-400" />
                  <h2 className="text-lg font-semibold text-white">AI Risk Advisor</h2>
                </div>
                <span className={`px-2 py-0.5 rounded text-xs font-bold ${
                  riskScore === 'Low' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                  riskScore === 'Moderate' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                  riskScore === 'High' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                }`}>
                  {riskScore} Risk
                </span>
              </div>

              <div className="text-xs text-slate-300 leading-relaxed max-h-48 overflow-y-auto pr-2 space-y-2">
                {aiAnalysis.split('\n').map((line, i) => (
                  <p key={i}>{line}</p>
                ))}
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Bottom Section: Chart & Logs */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Scenario Chart */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-xl p-6">
          <div className="flex items-center gap-2 mb-6">
            <BarChart3 className="w-5 h-5 text-blue-400" />
            <h2 className="text-lg font-semibold text-white">LTV Stress Test Scenarios</h2>
          </div>

          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={chartData}>
                <defs>
                  <linearGradient id="colorLtv" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="name" stroke="#64748b" fontSize={12} />
                <YAxis stroke="#64748b" fontSize={12} unit="%" />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#1e293b', color: '#f8fafc' }}
                  itemStyle={{ color: '#3b82f6' }}
                />
                <Legend />
                <Area type="monotone" dataKey="LTV" stroke="#3b82f6" fillOpacity={1} fill="url(#colorLtv)" name="Simulated LTV %" />
                <ReferenceLine y={marginCallLtv} stroke="#f59e0b" strokeDasharray="3 3" label={{ value: 'Margin Call', fill: '#f59e0b', position: 'insideBottomRight' }} />
                <ReferenceLine y={liquidationLtv} stroke="#ef4444" strokeDasharray="3 3" label={{ value: 'Liquidation', fill: '#ef4444', position: 'insideTopRight' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Bridge Activity Logs */}
        <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-6 flex flex-col h-[350px]">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Cpu className="w-5 h-5 text-violet-400" />
              <h2 className="text-lg font-semibold text-white">Bridge Activity Logs</h2>
            </div>
            <button 
              onClick={() => setLogs([])}
              className="text-xs text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear Logs
            </button>
          </div>

          <div className="flex-1 overflow-y-auto space-y-3 pr-2">
            {logs.length === 0 ? (
              <div className="text-center text-slate-500 text-xs py-12">
                No recent bridge activity.
              </div>
            ) : (
              logs.map((log, index) => (
                <div key={index} className="text-xs border-b border-slate-800/50 pb-2">
                  <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                    <span>{log.timestamp}</span>
                    <span className={`uppercase font-semibold ${
                      log.type === 'success' ? 'text-emerald-400' :
                      log.type === 'warning' ? 'text-amber-400' :
                      log.type === 'danger' ? 'text-rose-400' : 'text-blue-400'
                    }`}>
                      {log.type}
                    </span>
                  </div>
                  <p className="text-slate-300 leading-relaxed">{log.message}</p>
                </div>
              ))
            )}
          </div>
        </div>

      </div>
    </div>
  );
}