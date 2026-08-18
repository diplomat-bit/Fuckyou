import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';

// Currency definitions with flags, symbols, and base rates relative to USD
interface Currency {
  code: string;
  name: string;
  symbol: string;
  flag: string;
  baseRate: number; // 1 USD = X Currency
}

const CURRENCIES: Record<string, Currency> = {
  USD: { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', baseRate: 1.0 },
  EUR: { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', baseRate: 0.92 },
  GBP: { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', baseRate: 0.79 },
  JPY: { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', baseRate: 151.4 },
  AUD: { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', baseRate: 1.52 },
  CAD: { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', baseRate: 1.36 },
  CHF: { code: 'CHF', name: 'Swiss Franc', symbol: 'CHF', flag: '🇨🇭', baseRate: 0.90 },
  CNY: { code: 'CNY', name: 'Chinese Yuan', symbol: '¥', flag: '🇨🇳', baseRate: 7.23 },
  INR: { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', baseRate: 83.35 },
  SGD: { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', baseRate: 1.35 },
};

// Custom SVG Icons to avoid external dependency issues
const Icons = {
  ArrowUpDown: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21 16-4 4-4-4"/><path d="M17 20V4"/><path d="m3 8 4-4 4 4"/><path d="M7 4v16"/></svg>
  ),
  TrendingUp: ({ className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
  ),
  TrendingDown: ({ className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className={className}><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>
  ),
  Info: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><path d="M12 16v-4"/><path d="M12 8h.01"/></svg>
  ),
  Zap: ({ className = "" }) => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={className}><polygon points="13 2 3 14 12 14 11 22 21 10 12 10 13 2"/></svg>
  ),
  Clock: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
  ),
  Check: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12"/></svg>
  ),
  Globe: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>
  ),
  AlertCircle: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
  ),
  Sparkles: () => (
    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"/></svg>
  )
};

export default function FxRateCalculator() {
  // State
  const [fromCurr, setFromCurr] = useState<string>('USD');
  const [toCurr, setToCurr] = useState<string>('EUR');
  const [amount, setAmount] = useState<number>(1000);
  const [rates, setRates] = useState<Record<string, number>>(
    Object.keys(CURRENCIES).reduce((acc, key) => ({ ...acc, [key]: CURRENCIES[key].baseRate }), {})
  );
  const [rateHistory, setRateHistory] = useState<number[]>([]);
  const [timeframe, setTimeframe] = useState<'1H' | '1D' | '1W'>('1D');
  const [rateTrend, setRateTrend] = useState<'up' | 'down' | 'stable'>('stable');
  const [rateChangePercent, setRateChangePercent] = useState<number>(0.12);
  const [countdown, setCountdown] = useState<number>(30);
  const [isTransferring, setIsTransferring] = useState<boolean>(false);
  const [transferSuccess, setTransferSuccess] = useState<boolean>(false);
  const [transferSpeed, setTransferSpeed] = useState<'standard' | 'instant'>('instant');
  const [alertEmail, setAlertEmail] = useState<string>('');
  const [alertCreated, setAlertCreated] = useState<boolean>(false);

  // Generate initial mock history based on selected pair
  const generateHistory = useCallback((from: string, to: string, pointsCount = 20) => {
    const baseFrom = CURRENCIES[from].baseRate;
    const baseTo = CURRENCIES[to].baseRate;
    const currentCrossRate = baseTo / baseFrom;
    
    const history: number[] = [];
    let tempRate = currentCrossRate * 0.985; // Start slightly lower
    
    for (let i = 0; i < pointsCount; i++) {
      // Create a realistic random walk with an upward or downward bias
      const change = (Math.random() - 0.48) * 0.004 * tempRate;
      tempRate += change;
      history.push(tempRate);
    }
    // Ensure the last point matches the current live rate
    history[history.length - 1] = currentCrossRate;
    return history;
  }, []);

  // Initialize and update history when currency pair changes
  useEffect(() => {
    const points = timeframe === '1H' ? 15 : timeframe === '1D' ? 24 : 30;
    setRateHistory(generateHistory(fromCurr, toCurr, points));
  }, [fromCurr, toCurr, timeframe, generateHistory]);

  // Live rate fluctuation simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setRates(prevRates => {
        const updated = { ...prevRates };
        // Fluctuate each rate slightly (up to 0.08%)
        Object.keys(updated).forEach(key => {
          if (key !== 'USD') {
            const fluctuation = 1 + (Math.random() - 0.5) * 0.0016;
            updated[key] = Number((updated[key] * fluctuation).toFixed(4));
          }
        });
        return updated;
      });

      // Update countdown
      setCountdown(prev => {
        if (prev <= 1) {
          return 30; // Reset rate lock
        }
        return prev - 1;
      });
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  // Calculate current cross rate
  const currentRate = useMemo(() => {
    const fromRate = rates[fromCurr] || 1;
    const toRate = rates[toCurr] || 1;
    return toRate / fromRate;
  }, [rates, fromCurr, toCurr]);

  // Append new rate to history and determine trend
  useEffect(() => {
    setRateHistory(prev => {
      if (prev.length === 0) return [currentRate];
      const nextHistory = [...prev.slice(1), currentRate];
      
      const prevRate = prev[prev.length - 1];
      if (currentRate > prevRate) {
        setRateTrend('up');
        setRateChangePercent(Number(((currentRate - prevRate) / prevRate * 100).toFixed(3)));
      } else if (currentRate < prevRate) {
        setRateTrend('down');
        setRateChangePercent(Number(((prevRate - currentRate) / prevRate * 100).toFixed(3)));
      }
      return nextHistory;
    });
  }, [currentRate]);

  // Swap currencies
  const handleSwap = () => {
    const temp = fromCurr;
    setFromCurr(toCurr);
    setToCurr(temp);
  };

  // Calculations
  const feeRate = transferSpeed === 'instant' ? 0.005 : 0.002; // 0.5% or 0.2%
  const fixedFee = 1.50; // in source currency
  const feeInSource = (amount * feeRate) + fixedFee;
  const amountToConvert = Math.max(0, amount - feeInSource);
  const convertedAmount = amountToConvert * currentRate;
  const deliveryDate = useMemo(() => {
    const date = new Date();
    if (transferSpeed === 'instant') {
      return 'Within 10 minutes';
    } else {
      date.setDate(date.getDate() + 1);
      return date.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' });
    }
  }, [transferSpeed]);

  // SVG Chart Path calculations
  const chartPath = useMemo(() => {
    if (rateHistory.length < 2) return '';
    const width = 500;
    const height = 160;
    const padding = 10;
    
    const min = Math.min(...rateHistory);
    const max = Math.max(...rateHistory);
    const range = max - min || 1;

    const points = rateHistory.map((val, index) => {
      const x = padding + (index / (rateHistory.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    return `M ${points.join(' L ')}`;
  }, [rateHistory]);

  const chartAreaPath = useMemo(() => {
    if (rateHistory.length < 2) return '';
    const width = 500;
    const height = 160;
    const padding = 10;
    
    const min = Math.min(...rateHistory);
    const max = Math.max(...rateHistory);
    const range = max - min || 1;

    const points = rateHistory.map((val, index) => {
      const x = padding + (index / (rateHistory.length - 1)) * (width - padding * 2);
      const y = height - padding - ((val - min) / range) * (height - padding * 2);
      return `${x},${y}`;
    });

    const firstX = padding;
    const lastX = width - padding;
    const bottomY = height;

    return `M ${firstX},${bottomY} L ${points.join(' L ')} L ${lastX},${bottomY} Z`;
  }, [rateHistory]);

  const handleTransferSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (amount <= 0) return;
    setIsTransferring(true);
    setTimeout(() => {
      setIsTransferring(false);
      setTransferSuccess(true);
    }, 2000);
  };

  const handleAlertSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alertEmail) return;
    setAlertCreated(true);
    setTimeout(() => setAlertCreated(false), 5000);
    setAlertEmail('');
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-4 md:p-6 bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-2 height-2 w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              Live Market Rates
            </span>
            <span className="text-xs text-slate-400 flex items-center gap-1">
              <Icons.Clock />
              Rates update in {countdown}s
            </span>
          </div>
          <h1 className="text-2xl md:text-3xl font-bold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Global FX Transfer Hub
          </h1>
          <p className="text-sm text-slate-400 mt-1">
            Simulate real-time currency fluctuations and execute instant cross-border transfers.
          </p>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 p-1.5 rounded-xl border border-slate-800">
          {(['1H', '1D', '1W'] as const).map((t) => (
            <button
              key={t}
              onClick={() => setTimeframe(t)}
              className={`px-3 py-1.5 text-xs font-medium rounded-lg transition-all duration-200 ${
                timeframe === t
                  ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
              }`}
            >
              {t}
            </button>
          ))}
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mt-8">
        
        {/* Left Column: Interactive Calculator */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800/80 backdrop-blur-sm">
            <h2 className="text-lg font-semibold text-slate-200 mb-4 flex items-center gap-2">
              <Icons.Sparkles />
              Transfer Calculator
            </h2>

            <div className="space-y-4 relative">
              {/* Source Currency Input */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 focus-within:border-indigo-500 transition-all">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>You send</span>
                  <span>Balance: $10,000.00</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <input
                    type="number"
                    value={amount || ''}
                    onChange={(e) => setAmount(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="bg-transparent text-2xl font-bold text-white focus:outline-none w-full [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    placeholder="0.00"
                  />
                  <select
                    value={fromCurr}
                    onChange={(e) => setFromCurr(e.target.value)}
                    className="bg-slate-800 text-white font-semibold py-2 px-3 rounded-lg border border-slate-700 focus:outline-none cursor-pointer hover:bg-slate-750"
                  >
                    {Object.keys(CURRENCIES).map((code) => (
                      <option key={code} value={code}>
                        {CURRENCIES[code].flag} {code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  {CURRENCIES[fromCurr].name}
                </div>
              </div>

              {/* Swap Button */}
              <div className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2 z-10">
                <button
                  onClick={handleSwap}
                  className="p-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-full border-4 border-slate-950 shadow-xl transition-all duration-200 hover:scale-110 active:scale-95"
                  title="Swap Currencies"
                >
                  <Icons.ArrowUpDown />
                </button>
              </div>

              {/* Destination Currency Input */}
              <div className="bg-slate-900/90 p-4 rounded-xl border border-slate-800 focus-within:border-indigo-500 transition-all pt-6">
                <div className="flex justify-between text-xs text-slate-400 mb-1">
                  <span>Recipient gets</span>
                  <span>Guaranteed Rate</span>
                </div>
                <div className="flex items-center justify-between gap-4">
                  <div className="text-2xl font-bold text-emerald-400">
                    {convertedAmount.toLocaleString('en-US', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <select
                    value={toCurr}
                    onChange={(e) => setToCurr(e.target.value)}
                    className="bg-slate-800 text-white font-semibold py-2 px-3 rounded-lg border border-slate-700 focus:outline-none cursor-pointer hover:bg-slate-750"
                  >
                    {Object.keys(CURRENCIES).map((code) => (
                      <option key={code} value={code}>
                        {CURRENCIES[code].flag} {code}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="text-xs text-slate-500 mt-1 flex justify-between">
                  <span>{CURRENCIES[toCurr].name}</span>
                  <span>1 {fromCurr} = {currentRate.toFixed(4)} {toCurr}</span>
                </div>
              </div>
            </div>

            {/* Fee & Speed Selection */}
            <div className="mt-6 space-y-4">
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setTransferSpeed('instant')}
                  className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                    transferSpeed === 'instant'
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
                    <Icons.Zap className={transferSpeed === 'instant' ? 'text-amber-400' : 'text-slate-400'} />
                    Instant Transfer
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Delivery: ~10 mins • Fee: 0.5%</div>
                </button>

                <button
                  type="button"
                  onClick={() => setTransferSpeed('standard')}
                  className={`flex-1 p-3 rounded-xl border text-left transition-all ${
                    transferSpeed === 'standard'
                      ? 'bg-indigo-600/10 border-indigo-500 text-white'
                      : 'bg-slate-900/40 border-slate-800 text-slate-400 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex items-center gap-1.5 font-semibold text-sm text-white">
                    <Icons.Clock />
                    Standard Transfer
                  </div>
                  <div className="text-xs text-slate-400 mt-1">Delivery: Tomorrow • Fee: 0.2%</div>
                </button>
              </div>

              {/* Fee Breakdown Accordion */}
              <div className="bg-slate-900/60 rounded-xl p-4 border border-slate-800 text-xs space-y-2.5">
                <div className="flex justify-between text-slate-400">
                  <span>Transfer Fee</span>
                  <span>{CURRENCIES[fromCurr].symbol}{feeInSource.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Amount to Convert</span>
                  <span>{CURRENCIES[fromCurr].symbol}{amountToConvert.toFixed(2)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Guaranteed Rate (30s)</span>
                  <span>{currentRate.toFixed(5)}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Estimated Delivery</span>
                  <span className="text-indigo-400 font-medium">{deliveryDate}</span>
                </div>
                <div className="pt-2.5 border-t border-slate-800 flex justify-between text-sm font-semibold text-slate-200">
                  <span>Total Cost to Send</span>
                  <span>{CURRENCIES[fromCurr].symbol}{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={handleTransferSubmit}
              disabled={isTransferring || amount <= 0}
              className="w-full mt-6 py-4 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 hover:shadow-indigo-600/30 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-base"
            >
              {isTransferring ? (
                <>
                  <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Processing Transfer...
                </>
              ) : (
                <>
                  <Icons.Globe />
                  Execute {fromCurr} to {toCurr} Transfer
                </>
              )}
            </button>
          </div>
        </div>

        {/* Right Column: Live Chart & Market Insights */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Live Chart Card */}
          <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800/80 backdrop-blur-sm flex flex-col justify-between h-full min-h-[380px]">
            <div>
              <div className="flex justify-between items-start">
                <div>
                  <div className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Live Exchange Rate</div>
                  <div className="text-3xl font-bold text-white mt-1 flex items-baseline gap-2">
                    {currentRate.toFixed(4)}
                    <span className="text-xs text-slate-400 font-normal">{toCurr} per 1 {fromCurr}</span>
                  </div>
                </div>
                
                <div className={`flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold ${
                  rateTrend === 'up' 
                    ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                    : rateTrend === 'down'
                    ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    : 'bg-slate-800 text-slate-400'
                }`}>
                  {rateTrend === 'up' ? <Icons.TrendingUp /> : rateTrend === 'down' ? <Icons.TrendingDown /> : null}
                  {rateTrend === 'up' ? '+' : rateTrend === 'down' ? '-' : ''}{rateChangePercent}%
                </div>
              </div>

              {/* SVG Sparkline Chart */}
              <div className="mt-6 relative h-40 w-full bg-slate-950/50 rounded-xl border border-slate-800/50 overflow-hidden">
                <svg className="w-full h-full" viewBox="0 0 500 160" preserveAspectRatio="none">
                  <defs>
                    <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="0%" stopColor="#4f46e5" stopOpacity="0.25" />
                      <stop offset="100%" stopColor="#4f46e5" stopOpacity="0.0" />
                    </linearGradient>
                  </defs>
                  
                  {/* Area under line */}
                  <path
                    d={chartAreaPath}
                    fill="url(#chartGradient)"
                  />
                  
                  {/* Line */}
                  <path
                    d={chartPath}
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />

                  {/* Glowing end dot */}
                  {rateHistory.length > 0 && (
                    <circle
                      cx={500 - 10}
                      cy={160 - 10 - ((rateHistory[rateHistory.length - 1] - Math.min(...rateHistory)) / (Math.max(...rateHistory) - Math.min(...rateHistory) || 1)) * (160 - 20)}
                      r="5"
                      fill="#818cf8"
                      className="animate-ping"
                    />
                  )}
                </svg>
                
                {/* Chart Grid Overlay Labels */}
                <div className="absolute top-2 left-3 text-[10px] text-slate-500 font-mono">
                  Max: {Math.max(...rateHistory).toFixed(4)}
                </div>
                <div className="absolute bottom-2 left-3 text-[10px] text-slate-500 font-mono">
                  Min: {Math.min(...rateHistory).toFixed(4)}
                </div>
              </div>
            </div>

            {/* Market Stats Grid */}
            <div className="grid grid-cols-2 gap-3 mt-6 pt-6 border-t border-slate-800/60">
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">24h High</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">
                  {(currentRate * 1.004).toFixed(4)}
                </div>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">24h Low</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">
                  {(currentRate * 0.996).toFixed(4)}
                </div>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Market Volatility</div>
                <div className="text-sm font-semibold text-emerald-400 mt-0.5 flex items-center gap-1">
                  Low <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                </div>
              </div>
              <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/40">
                <div className="text-[10px] text-slate-500 uppercase tracking-wider">Interbank Spread</div>
                <div className="text-sm font-semibold text-slate-200 mt-0.5">
                  0.01% (Excellent)
                </div>
              </div>
            </div>
          </div>

          {/* Rate Alert Signup */}
          <div className="bg-slate-900/40 rounded-2xl p-6 border border-slate-800/80 backdrop-blur-sm">
            <h3 className="text-sm font-semibold text-slate-200 mb-2 flex items-center gap-2">
              <Icons.Info />
              Set Rate Alert
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              We'll email you when the {fromCurr} to {toCurr} rate crosses your target threshold.
            </p>
            <form onSubmit={handleAlertSubmit} className="flex gap-2">
              <input
                type="email"
                required
                value={alertEmail}
                onChange={(e) => setAlertEmail(e.target.value)}
                placeholder="Enter your email"
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500 flex-1"
              />
              <button
                type="submit"
                className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold px-4 py-2 rounded-xl transition-all"
              >
                Alert Me
              </button>
            </form>
            {alertCreated && (
              <div className="mt-3 text-xs text-emerald-400 flex items-center gap-1.5 animate-fade-in">
                <Icons.Check /> Rate alert successfully configured!
              </div>
            )}
          </div>

        </div>
      </div>

      {/* Success Modal Overlay */}
      {transferSuccess && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-md flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-8 max-w-md w-full text-center shadow-2xl relative overflow-hidden">
            <div className="absolute -top-10 -left-10 w-40 h-40 bg-indigo-600/10 rounded-full blur-3xl" />
            <div className="absolute -bottom-10 -right-10 w-40 h-40 bg-emerald-600/10 rounded-full blur-3xl" />
            
            <div className="w-16 h-16 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto mb-6">
              <Icons.Check />
            </div>

            <h3 className="text-xl font-bold text-white mb-2">Transfer Initiated Successfully!</h3>
            <p className="text-sm text-slate-400 mb-6">
              Your cross-border transfer of <span className="text-slate-200 font-semibold">{CURRENCIES[fromCurr].symbol}{amount.toLocaleString()}</span> is on its way.
            </p>

            <div className="bg-slate-950/60 rounded-2xl p-4 border border-slate-800 text-left text-xs space-y-3 mb-6">
              <div className="flex justify-between">
                <span className="text-slate-500">You Sent</span>
                <span className="text-slate-200 font-medium">{CURRENCIES[fromCurr].symbol}{amount.toFixed(2)} {fromCurr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Recipient Receives</span>
                <span className="text-emerald-400 font-bold">{CURRENCIES[toCurr].symbol}{convertedAmount.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} {toCurr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Exchange Rate Locked</span>
                <span className="text-slate-200 font-mono">1 {fromCurr} = {currentRate.toFixed(5)} {toCurr}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Estimated Delivery</span>
                <span className="text-indigo-400 font-semibold">{deliveryDate}</span>
              </div>
            </div>

            <button
              onClick={() => setTransferSuccess(false)}
              className="w-full py-3 bg-slate-800 hover:bg-slate-750 text-white font-semibold rounded-xl transition-all"
            >
              Close Window
            </button>
          </div>
        </div>
      )}

    </div>
  );
}