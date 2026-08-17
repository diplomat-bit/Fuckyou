import React, { useState, useEffect } from 'react';

// ==========================================
// TypeScript Interfaces
// ==========================================

export interface AlpacaAccount {
  id: string;
  account_number: string;
  status: string;
  currency: string;
  cash: string;
  portfolio_value: string;
  pattern_day_trader: boolean;
  trading_blocked: boolean;
  transact_blocked: boolean;
  created_at: string;
  trade_suspended_by_user: boolean;
  multiplier: string;
  shorting_enabled: boolean;
  equity: string;
  last_equity: string;
  long_market_value: string;
  short_market_value: string;
  initial_margin: string;
  maintenance_margin: string;
  last_maintenance_margin: string;
  daytrade_count: number;
  sma: string;
  buying_power: string;
  daytrading_buying_power: string;
  regt_buying_power: string;
}

export interface AlpacaPosition {
  asset_id: string;
  symbol: string;
  exchange: string;
  asset_class: string;
  avg_entry_price: string;
  qty: string;
  qty_available: string;
  side: string;
  market_value: string;
  cost_basis: string;
  unrealized_pl: string;
  unrealized_plpc: string;
  unrealized_intraday_pl: string;
  unrealized_intraday_plpc: string;
  current_price: string;
  lastday_price: string;
  change_today: string;
}

export interface OrderFormState {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  limit_price: string;
  time_in_force: 'day' | 'gtc';
}

// ==========================================
// Mock Data for Fallback / Demo Mode
// ==========================================

const MOCK_ACCOUNT: AlpacaAccount = {
  id: "e6c69915-bcc7-4335-b655-c62f949d691b",
  account_number: "PA3Y7X8Z9W",
  status: "ACTIVE",
  currency: "USD",
  cash: "45230.50",
  portfolio_value: "125430.75",
  pattern_day_trader: false,
  trading_blocked: false,
  transact_blocked: false,
  created_at: "2023-01-15T08:00:00Z",
  trade_suspended_by_user: false,
  multiplier: "4",
  shorting_enabled: true,
  equity: "125430.75",
  last_equity: "124100.20",
  long_market_value: "80200.25",
  short_market_value: "0.00",
  initial_margin: "40100.13",
  maintenance_margin: "24060.08",
  last_maintenance_margin: "23800.00",
  daytrade_count: 1,
  sma: "45000.00",
  buying_power: "180922.00",
  daytrading_buying_power: "180922.00",
  regt_buying_power: "90461.00"
};

const MOCK_POSITIONS: AlpacaPosition[] = [
  {
    asset_id: "a0e1e353-1a3e-42cf-a8ea-3a9746eec58c",
    symbol: "AAPL",
    exchange: "NASDAQ",
    asset_class: "us_equity",
    avg_entry_price: "175.50",
    qty: "150",
    qty_available: "150",
    side: "long",
    market_value: "28350.00",
    cost_basis: "26325.00",
    unrealized_pl: "2025.00",
    unrealized_plpc: "0.0769",
    unrealized_intraday_pl: "350.00",
    unrealized_intraday_plpc: "0.0125",
    current_price: "189.00",
    lastday_price: "186.67",
    change_today: "0.0125"
  },
  {
    asset_id: "b6b84568-6c01-4981-a80f-09da9a20bbed",
    symbol: "MSFT",
    exchange: "NASDAQ",
    asset_class: "us_equity",
    avg_entry_price: "380.20",
    qty: "80",
    qty_available: "80",
    side: "long",
    market_value: "33200.00",
    cost_basis: "30416.00",
    unrealized_pl: "2784.00",
    unrealized_plpc: "0.0915",
    unrealized_intraday_pl: "-120.00",
    unrealized_intraday_plpc: "-0.0036",
    current_price: "415.00",
    lastday_price: "416.50",
    change_today: "-0.0036"
  },
  {
    asset_id: "7cd684f4-8a78-49b0-91ec-6a35d38739ba",
    symbol: "TSLA",
    exchange: "NASDAQ",
    asset_class: "us_equity",
    avg_entry_price: "220.00",
    qty: "50",
    qty_available: "50",
    side: "long",
    market_value: "9250.00",
    cost_basis: "11000.00",
    unrealized_pl: "-1750.00",
    unrealized_plpc: "-0.1591",
    unrealized_intraday_pl: "150.00",
    unrealized_intraday_plpc: "0.0165",
    current_price: "185.00",
    lastday_price: "182.00",
    change_today: "0.0165"
  },
  {
    asset_id: "47ee738b-3f1a-4fc7-ab11-37e4822b007e",
    symbol: "NVDA",
    exchange: "NASDAQ",
    asset_class: "us_equity",
    avg_entry_price: "450.00",
    qty: "20",
    qty_available: "20",
    side: "long",
    market_value: "17400.00",
    cost_basis: "9000.00",
    unrealized_pl: "8400.00",
    unrealized_plpc: "0.9333",
    unrealized_intraday_pl: "820.00",
    unrealized_intraday_plpc: "0.0494",
    current_price: "870.00",
    lastday_price: "829.00",
    change_today: "0.0494"
  }
];

export default function AlpacaPositionsView() {
  // State Management
  const [account, setAccount] = useState<AlpacaAccount | null>(null);
  const [positions, setPositions] = useState<AlpacaPosition[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [isDemoMode, setIsDemoMode] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'positions' | 'order' | 'account'>('overview');
  
  // Search & Filter State
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [filterType, setFilterType] = useState<'all' | 'gainers' | 'losers'>('all');
  const [sortBy, setSorting] = useState<'symbol' | 'value' | 'pl'>('symbol');

  // Order Form State
  const [orderForm, setOrderForm] = useState<OrderFormState>({
    symbol: '',
    qty: 1,
    side: 'buy',
    type: 'market',
    limit_price: '',
    time_in_force: 'day'
  });
  const [orderSubmitting, setOrderSubmitting] = useState<boolean>(false);
  const [orderFeedback, setOrderFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Position Closing State
  const [closingSymbol, setClosingSymbol] = useState<string | null>(null);

  // Fetch Data from API
  const fetchData = async (forceDemo: boolean = false) => {
    setLoading(true);
    setError(null);
    
    if (isDemoMode || forceDemo) {
      setTimeout(() => {
        setAccount(MOCK_ACCOUNT);
        setPositions(MOCK_POSITIONS);
        setLoading(false);
      }, 600);
      return;
    }

    try {
      // Fetch account details
      const accountRes = await fetch('/api/alpaca/account');
      if (!accountRes.ok) {
        throw new Error(`Failed to fetch account details: ${accountRes.statusText}`);
      }
      const accountData = await accountRes.json();

      // Fetch positions
      const positionsRes = await fetch('/api/alpaca/positions');
      if (!positionsRes.ok) {
        throw new Error(`Failed to fetch positions: ${positionsRes.statusText}`);
      }
      const positionsData = await positionsRes.json();

      setAccount(accountData);
      setPositions(positionsData);
    } catch (err: any) {
      console.error('Alpaca API Error:', err);
      setError(err.message || 'Could not connect to Alpaca endpoints. Please ensure your backend server is running and configured.');
      // Auto fallback to demo mode so the user can interact with the UI
      setIsDemoMode(true);
      setAccount(MOCK_ACCOUNT);
      setPositions(MOCK_POSITIONS);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isDemoMode]);

  // Handle Order Submission
  const handleOrderSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setOrderSubmitting(true);
    setOrderFeedback(null);

    if (!orderForm.symbol) {
      setOrderFeedback({ type: 'error', message: 'Please enter a ticker symbol.' });
      setOrderSubmitting(false);
      return;
    }

    if (orderForm.qty <= 0) {
      setOrderFeedback({ type: 'error', message: 'Quantity must be greater than 0.' });
      setOrderSubmitting(false);
      return;
    }

    if (isDemoMode) {
      setTimeout(() => {
        // Simulate order execution in demo mode
        const newPositionPrice = orderForm.type === 'limit' ? parseFloat(orderForm.limit_price) || 150 : 150;
        const newMarketValue = newPositionPrice * orderForm.qty;
        
        const existingIndex = positions.findIndex(p => p.symbol.toUpperCase() === orderForm.symbol.toUpperCase());
        let updatedPositions = [...positions];

        if (orderForm.side === 'buy') {
          if (existingIndex >= 0) {
            const existing = positions[existingIndex];
            const oldQty = parseFloat(existing.qty);
            const newQty = oldQty + orderForm.qty;
            const oldCost = parseFloat(existing.cost_basis);
            const newCost = oldCost + (newPositionPrice * orderForm.qty);
            const avgPrice = newCost / newQty;

            updatedPositions[existingIndex] = {
              ...existing,
              qty: newQty.toString(),
              qty_available: newQty.toString(),
              avg_entry_price: avgPrice.toFixed(2),
              market_value: (newQty * newPositionPrice).toString(),
              cost_basis: newCost.toFixed(2),
              current_price: newPositionPrice.toFixed(2),
              unrealized_pl: ((newQty * newPositionPrice) - newCost).toFixed(2),
              unrealized_plpc: (((newQty * newPositionPrice) - newCost) / newCost).toFixed(4)
            };
          } else {
            updatedPositions.push({
              asset_id: Math.random().toString(36).substring(2, 15),
              symbol: orderForm.symbol.toUpperCase(),
              exchange: 'NASDAQ',
              asset_class: 'us_equity',
              avg_entry_price: newPositionPrice.toFixed(2),
              qty: orderForm.qty.toString(),
              qty_available: orderForm.qty.toString(),
              side: 'long',
              market_value: newMarketValue.toFixed(2),
              cost_basis: newMarketValue.toFixed(2),
              unrealized_pl: '0.00',
              unrealized_plpc: '0.0000',
              unrealized_intraday_pl: '0.00',
              unrealized_intraday_plpc: '0.0000',
              current_price: newPositionPrice.toFixed(2),
              lastday_price: newPositionPrice.toFixed(2),
              change_today: '0.0000'
            });
          }
        } else {
          // Sell order
          if (existingIndex >= 0) {
            const existing = positions[existingIndex];
            const oldQty = parseFloat(existing.qty);
            if (oldQty < orderForm.qty) {
              setOrderFeedback({ type: 'error', message: `Insufficient shares. You only hold ${oldQty} shares of ${existing.symbol}.` });
              setOrderSubmitting(false);
              return;
            }
            const newQty = oldQty - orderForm.qty;
            if (newQty === 0) {
              updatedPositions = updatedPositions.filter((_, idx) => idx !== existingIndex);
            } else {
              const avgPrice = parseFloat(existing.avg_entry_price);
              const newCost = newQty * avgPrice;
              updatedPositions[existingIndex] = {
                ...existing,
                qty: newQty.toString(),
                qty_available: newQty.toString(),
                market_value: (newQty * newPositionPrice).toString(),
                cost_basis: newCost.toFixed(2),
                unrealized_pl: ((newQty * newPositionPrice) - newCost).toFixed(2),
                unrealized_plpc: (((newQty * newPositionPrice) - newCost) / newCost).toFixed(4)
              };
            }
          } else {
            setOrderFeedback({ type: 'error', message: `You do not hold any shares of ${orderForm.symbol.toUpperCase()} to sell.` });
            setOrderSubmitting(false);
            return;
          }
        }

        // Update account cash and portfolio value
        if (account) {
          const orderCost = newPositionPrice * orderForm.qty;
          const cashChange = orderForm.side === 'buy' ? -orderCost : orderCost;
          const newCash = parseFloat(account.cash) + cashChange;
          
          setAccount({
            ...account,
            cash: newCash.toFixed(2),
            portfolio_value: (newCash + updatedPositions.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0)).toFixed(2),
            buying_power: (parseFloat(account.buying_power) + (cashChange * 4)).toFixed(2) // assuming 4x leverage
          });
        }

        setPositions(updatedPositions);
        setOrderFeedback({
          type: 'success',
          message: `Successfully executed ${orderForm.side.toUpperCase()} order for ${orderForm.qty} shares of ${orderForm.symbol.toUpperCase()}!`
        });
        setOrderForm({
          symbol: '',
          qty: 1,
          side: 'buy',
          type: 'market',
          limit_price: '',
          time_in_force: 'day'
        });
        setOrderSubmitting(false);
      }, 800);
      return;
    }

    try {
      const response = await fetch('/api/alpaca/orders', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          symbol: orderForm.symbol.toUpperCase(),
          qty: orderForm.qty,
          side: orderForm.side,
          type: orderForm.type,
          time_in_force: orderForm.time_in_force,
          limit_price: orderForm.type === 'limit' ? parseFloat(orderForm.limit_price) : undefined
        })
      });

      if (!response.ok) {
        const errData = await response.json().catch(() => ({}));
        throw new Error(errData.message || `Failed to submit order: ${response.statusText}`);
      }

      setOrderFeedback({
        type: 'success',
        message: `Order submitted successfully! Ticker: ${orderForm.symbol.toUpperCase()}`
      });
      
      // Reset form
      setOrderForm({
        symbol: '',
        qty: 1,
        side: 'buy',
        type: 'market',
        limit_price: '',
        time_in_force: 'day'
      });
      
      // Refresh data to reflect pending orders or updated cash
      fetchData();
    } catch (err: any) {
      setOrderFeedback({ type: 'error', message: err.message || 'Failed to submit order.' });
    } finally {
      setOrderSubmitting(false);
    }
  };

  // Handle Closing a Position
  const handleClosePosition = async (symbol: string) => {
    setClosingSymbol(symbol);
    
    if (isDemoMode) {
      setTimeout(() => {
        const positionToClose = positions.find(p => p.symbol === symbol);
        if (positionToClose && account) {
          const proceeds = parseFloat(positionToClose.market_value);
          const newCash = parseFloat(account.cash) + proceeds;
          const updatedPositions = positions.filter(p => p.symbol !== symbol);
          
          setAccount({
            ...account,
            cash: newCash.toFixed(2),
            portfolio_value: (newCash + updatedPositions.reduce((sum, pos) => sum + parseFloat(pos.market_value), 0)).toFixed(2),
            buying_power: (parseFloat(account.buying_power) + (proceeds * 4)).toFixed(2)
          });
          setPositions(updatedPositions);
        }
        setClosingSymbol(null);
      }, 800);
      return;
    }

    try {
      const response = await fetch(`/api/alpaca/positions/${symbol}`, {
        method: 'DELETE'
      });

      if (!response.ok) {
        throw new Error(`Failed to close position: ${response.statusText}`);
      }

      fetchData();
    } catch (err: any) {
      alert(err.message || `Failed to close position for ${symbol}`);
    } finally {
      setClosingSymbol(null);
    }
  };

  // Helper Formatters
  const formatCurrency = (value: string | number | undefined) => {
    if (value === undefined || value === null) return '$0.00';
    const num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '$0.00';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(num);
  };

  const formatPercent = (value: string | number | undefined, isDecimal: boolean = true) => {
    if (value === undefined || value === null) return '0.00%';
    let num = typeof value === 'string' ? parseFloat(value) : value;
    if (isNaN(num)) return '0.00%';
    if (isDecimal) {
      num = num * 100;
    }
    return `${num >= 0 ? '+' : ''}${num.toFixed(2)}%`;
  };

  // Calculations
  const totalUnrealizedPL = positions.reduce((sum, pos) => sum + parseFloat(pos.unrealized_pl), 0);
  const totalCostBasis = positions.reduce((sum, pos) => sum + parseFloat(pos.cost_basis), 0);
  const totalPLPercent = totalCostBasis > 0 ? (totalUnrealizedPL / totalCostBasis) : 0;

  const dailyChange = account ? parseFloat(account.equity) - parseFloat(account.last_equity) : 0;
  const dailyChangePercent = account && parseFloat(account.last_equity) > 0 
    ? (dailyChange / parseFloat(account.last_equity)) 
    : 0;

  // Filter & Sort Positions
  const filteredPositions = positions
    .filter(pos => {
      const matchesSearch = pos.symbol.toLowerCase().includes(searchTerm.toLowerCase());
      const pl = parseFloat(pos.unrealized_pl);
      if (filterType === 'gainers') return matchesSearch && pl > 0;
      if (filterType === 'losers') return matchesSearch && pl < 0;
      return matchesSearch;
    })
    .sort((a, b) => {
      if (sortBy === 'symbol') return a.symbol.localeCompare(b.symbol);
      if (sortBy === 'value') return parseFloat(b.market_value) - parseFloat(a.market_value);
      if (sortBy === 'pl') return parseFloat(b.unrealized_pl) - parseFloat(a.unrealized_pl);
      return 0;
    });

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Top Navigation / Header */}
      <header className="bg-blue-950 text-white shadow-md border-b border-blue-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-5 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-3">
              <span className="bg-blue-600 text-white text-xs font-bold px-2.5 py-1 rounded-full uppercase tracking-wider">
                Citi B2B Partner Portal
              </span>
              <span className={`text-xs font-semibold px-2.5 py-1 rounded-full uppercase tracking-wider ${isDemoMode ? 'bg-amber-500 text-amber-950' : 'bg-emerald-500 text-emerald-950'}`}>
                {isDemoMode ? 'Demo Mode' : 'Alpaca Live API'}
              </span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight mt-1 flex items-center gap-2">
              Alpaca Trading Dashboard
            </h1>
            <p className="text-blue-200 text-sm mt-0.5">
              Integrate institutional liquidity and automated execution endpoints seamlessly.
            </p>
          </div>

          <div className="flex items-center gap-3 self-start md:self-auto">
            {/* Demo Mode Toggle */}
            <button
              onClick={() => setIsDemoMode(!isDemoMode)}
              className={`px-4 py-2 rounded-lg text-xs font-semibold transition-all duration-200 border ${
                isDemoMode 
                  ? 'bg-amber-500/10 border-amber-500 text-amber-400 hover:bg-amber-500/20' 
                  : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
              }`}
            >
              {isDemoMode ? 'Switch to API Mode' : 'Switch to Demo Mode'}
            </button>

            {/* Refresh Button */}
            <button
              onClick={() => fetchData()}
              disabled={loading}
              className="bg-blue-800 hover:bg-blue-700 text-white p-2.5 rounded-lg transition-colors duration-200 disabled:opacity-50 flex items-center justify-center"
              title="Refresh Portfolio Data"
            >
              <svg className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H16V10h5" />
              </svg>
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && !isDemoMode && (
          <div className="mb-6 bg-rose-50 border-l-4 border-rose-500 p-4 rounded-r-xl shadow-sm flex items-start gap-3">
            <div className="text-rose-500 mt-0.5">
              <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 24">
                <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
              </svg>
            </div>
            <div className="flex-1">
              <h3 className="text-sm font-bold text-rose-900">API Connection Warning</h3>
              <p className="text-xs text-rose-700 mt-1">{error}</p>
              <button 
                onClick={() => setIsDemoMode(true)} 
                className="mt-2 text-xs font-semibold text-rose-900 underline hover:text-rose-950"
              >
                Activate Demo Mode to explore the interface with mock data
              </button>
            </div>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="flex border-b border-slate-200 mb-8 overflow-x-auto">
          <button
            onClick={() => setActiveTab('overview')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === 'overview'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('positions')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all duration-200 whitespace-nowrap flex items-center gap-2 ${
              activeTab === 'positions'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            Open Positions
            <span className="bg-slate-200 text-slate-700 text-xs px-2 py-0.5 rounded-full font-bold">
              {positions.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('order')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === 'order'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            Place Order
          </button>
          <button
            onClick={() => setActiveTab('account')}
            className={`py-3 px-6 font-semibold text-sm border-b-2 transition-all duration-200 whitespace-nowrap ${
              activeTab === 'account'
                ? 'border-blue-900 text-blue-900'
                : 'border-transparent text-slate-500 hover:text-slate-800 hover:border-slate-300'
            }`}
          >
            Account Details
          </button>
        </div>

        {/* Loading State */}
        {loading ? (
          <div className="flex flex-col items-center justify-center py-20">
            <div className="w-12 h-12 border-4 border-blue-900 border-t-transparent rounded-full animate-spin mb-4"></div>
            <p className="text-slate-500 text-sm font-medium">Fetching portfolio metrics from Alpaca...</p>
          </div>
        ) : (
          <>
            {/* ==========================================
                TAB: OVERVIEW
                ========================================== */}
            {activeTab === 'overview' && (
              <div className="space-y-8">
                {/* Metric Cards Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {/* Portfolio Value */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Net Equity</span>
                      <span className="p-1.5 bg-blue-50 text-blue-900 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {formatCurrency(account?.portfolio_value)}
                      </h3>
                      <div className="flex items-center gap-1.5 mt-1">
                        <span className={`text-xs font-bold flex items-center ${dailyChange >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                          {dailyChange >= 0 ? '▲' : '▼'} {formatCurrency(Math.abs(dailyChange))} ({formatPercent(dailyChangePercent, false)})
                        </span>
                        <span className="text-slate-400 text-[10px] font-medium">TODAY</span>
                      </div>
                    </div>
                  </div>

                  {/* Buying Power */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Buying Power</span>
                      <span className="p-1.5 bg-purple-50 text-purple-900 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {formatCurrency(account?.buying_power)}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 font-medium">
                        Leverage Multiplier: {account?.multiplier}x
                      </p>
                    </div>
                  </div>

                  {/* Cash Balance */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cash Balance</span>
                      <span className="p-1.5 bg-emerald-50 text-emerald-900 rounded-lg">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className="text-2xl font-bold text-slate-900">
                        {formatCurrency(account?.cash)}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 font-medium">
                        Settled & ready to trade
                      </p>
                    </div>
                  </div>

                  {/* Total Unrealized P&L */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Total Return</span>
                      <span className={`p-1.5 rounded-lg ${totalUnrealizedPL >= 0 ? 'bg-emerald-50 text-emerald-900' : 'bg-rose-50 text-rose-900'}`}>
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </span>
                    </div>
                    <div className="mt-4">
                      <h3 className={`text-2xl font-bold ${totalUnrealizedPL >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                        {formatCurrency(totalUnrealizedPL)}
                      </h3>
                      <p className="text-slate-400 text-xs mt-1 font-medium">
                        All-time: <span className={totalUnrealizedPL >= 0 ? 'text-emerald-600 font-bold' : 'text-rose-600 font-bold'}>{formatPercent(totalPLPercent, false)}</span>
                      </p>
                    </div>
                  </div>
                </div>

                {/* Overview Grid: Allocation & Top Positions */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                  {/* Portfolio Allocation */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-1">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Asset Allocation</h3>
                    {positions.length === 0 ? (
                      <div className="text-center py-12 text-slate-400 text-sm">
                        No open positions to calculate allocation.
                      </div>
                    ) : (
                      <div className="space-y-4">
                        {positions.map(pos => {
                          const weight = (parseFloat(pos.market_value) / parseFloat(account?.portfolio_value || '1')) * 100;
                          return (
                            <div key={pos.symbol} className="space-y-1">
                              <div className="flex justify-between text-xs font-semibold">
                                <span className="text-slate-700">{pos.symbol}</span>
                                <span className="text-slate-500">{weight.toFixed(1)}%</span>
                              </div>
                              <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden">
                                <div 
                                  className="bg-blue-900 h-full rounded-full" 
                                  style={{ width: `${weight}%` }}
                                ></div>
                              </div>
                            </div>
                          );
                        })}
                        <div className="pt-4 border-t border-slate-100 space-y-2">
                          <div className="flex justify-between text-xs font-medium text-slate-500">
                            <span>Total Stock Value</span>
                            <span>{formatCurrency(positions.reduce((sum, p) => sum + parseFloat(p.market_value), 0))}</span>
                          </div>
                          <div className="flex justify-between text-xs font-medium text-slate-500">
                            <span>Cash Reserve</span>
                            <span>{formatCurrency(account?.cash)}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Top Holdings / Mini Positions List */}
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                    <div className="flex items-center justify-between mb-4">
                      <h3 className="text-base font-bold text-slate-900">Top Holdings</h3>
                      <button 
                        onClick={() => setActiveTab('positions')} 
                        className="text-xs font-bold text-blue-900 hover:underline"
                      >
                        View All Positions
                      </button>
                    </div>

                    {positions.length === 0 ? (
                      <div className="text-center py-16 text-slate-400 text-sm">
                        No open positions. Use the "Place Order" tab to buy assets.
                      </div>
                    ) : (
                      <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-slate-100">
                          <thead>
                            <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider">
                              <th className="pb-3">Asset</th>
                              <th className="pb-3 text-right">Market Value</th>
                              <th className="pb-3 text-right">Current Price</th>
                              <th className="pb-3 text-right">Total Return</th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-sm">
                            {positions.slice(0, 3).map(pos => {
                              const pl = parseFloat(pos.unrealized_pl);
                              return (
                                <tr key={pos.symbol} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="py-3.5 font-semibold text-slate-900">
                                    <div className="flex items-center gap-2">
                                      <span className="bg-slate-100 text-slate-800 text-xs font-bold px-2 py-1 rounded">
                                        {pos.symbol}
                                      </span>
                                      <span className="text-xs text-slate-400 font-normal">{pos.exchange}</span>
                                    </div>
                                  </td>
                                  <td className="py-3.5 text-right font-medium text-slate-900">
                                    {formatCurrency(pos.market_value)}
                                  </td>
                                  <td className="py-3.5 text-right font-medium text-slate-900">
                                    {formatCurrency(pos.current_price)}
                                  </td>
                                  <td className={`py-3.5 text-right font-bold ${pl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                    {formatCurrency(pl)} ({formatPercent(pos.unrealized_plpc)})
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                TAB: POSITIONS
                ========================================== */}
            {activeTab === 'positions' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                {/* Table Controls */}
                <div className="p-5 border-b border-slate-100 bg-slate-50/50 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  {/* Search */}
                  <div className="relative max-w-xs w-full">
                    <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-400">
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </span>
                    <input
                      type="text"
                      placeholder="Search symbol..."
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 text-sm bg-white border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 focus:border-transparent"
                    />
                  </div>

                  {/* Filters */}
                  <div className="flex items-center gap-4 self-end sm:self-auto">
                    <div className="flex bg-slate-200/60 p-1 rounded-lg text-xs font-semibold">
                      <button
                        onClick={() => setFilterType('all')}
                        className={`px-3 py-1.5 rounded-md transition-all ${filterType === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        All
                      </button>
                      <button
                        onClick={() => setFilterType('gainers')}
                        className={`px-3 py-1.5 rounded-md transition-all ${filterType === 'gainers' ? 'bg-white text-emerald-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Gainers
                      </button>
                      <button
                        onClick={() => setFilterType('losers')}
                        className={`px-3 py-1.5 rounded-md transition-all ${filterType === 'losers' ? 'bg-white text-rose-600 shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
                      >
                        Losers
                      </button>
                    </div>

                    <select
                      value={sortBy}
                      onChange={(e) => setSorting(e.target.value as any)}
                      className="bg-white border border-slate-200 rounded-lg text-xs font-semibold py-2 px-3 focus:outline-none focus:ring-2 focus:ring-blue-900"
                    >
                      <option value="symbol">Sort: Symbol</option>
                      <option value="value">Sort: Market Value</option>
                      <option value="pl">Sort: Total Return</option>
                    </select>
                  </div>
                </div>

                {/* Positions Table */}
                {filteredPositions.length === 0 ? (
                  <div className="text-center py-20 text-slate-400 text-sm">
                    No positions match your search criteria.
                  </div>
                ) : (
                  <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-slate-100">
                      <thead>
                        <tr className="text-left text-xs font-bold text-slate-400 uppercase tracking-wider bg-slate-50/30">
                          <th className="px-6 py-4">Asset</th>
                          <th className="px-6 py-4 text-right">Market Value</th>
                          <th className="px-6 py-4 text-right">Position Size</th>
                          <th className="px-6 py-4 text-right">Current Price</th>
                          <th className="px-6 py-4 text-right">Total Return</th>
                          <th className="px-6 py-4 text-right">Today's Return</th>
                          <th className="px-6 py-4 text-center">Actions</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-sm">
                        {filteredPositions.map(pos => {
                          const pl = parseFloat(pos.unrealized_pl);
                          const intradayPl = parseFloat(pos.unrealized_intraday_pl);
                          const isClosing = closingSymbol === pos.symbol;

                          return (
                            <tr key={pos.symbol} className="hover:bg-slate-50/50 transition-colors">
                              {/* Asset */}
                              <td className="px-6 py-4 font-semibold text-slate-900">
                                <div className="flex items-center gap-2">
                                  <span className="bg-blue-50 text-blue-900 text-xs font-bold px-2.5 py-1 rounded-md">
                                    {pos.symbol}
                                  </span>
                                  <div className="flex flex-col">
                                    <span className="text-xs text-slate-400 font-normal">{pos.exchange}</span>
                                  </div>
                                </div>
                              </td>

                              {/* Market Value */}
                              <td className="px-6 py-4 text-right font-medium text-slate-900">
                                {formatCurrency(pos.market_value)}
                              </td>

                              {/* Position Size */}
                              <td className="px-6 py-4 text-right text-slate-500">
                                <div className="font-medium text-slate-900">{pos.qty} shares</div>
                                <div className="text-xs">Avg: {formatCurrency(pos.avg_entry_price)}</div>
                              </td>

                              {/* Current Price */}
                              <td className="px-6 py-4 text-right text-slate-500">
                                <div className="font-medium text-slate-900">{formatCurrency(pos.current_price)}</div>
                                <div className={`text-xs font-semibold ${parseFloat(pos.change_today) >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                  {formatPercent(pos.change_today)}
                                </div>
                              </td>

                              {/* Total Return */}
                              <td className={`px-6 py-4 text-right font-bold ${pl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                <div>{formatCurrency(pl)}</div>
                                <div className="text-xs font-semibold">{formatPercent(pos.unrealized_plpc)}</div>
                              </td>

                              {/* Today's Return */}
                              <td className={`px-6 py-4 text-right font-bold ${intradayPl >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
                                <div>{formatCurrency(intradayPl)}</div>
                                <div className="text-xs font-semibold">{formatPercent(pos.unrealized_intraday_plpc)}</div>
                              </td>

                              {/* Actions */}
                              <td className="px-6 py-4 text-center">
                                <button
                                  onClick={() => handleClosePosition(pos.symbol)}
                                  disabled={isClosing}
                                  className="bg-rose-50 hover:bg-rose-100 text-rose-600 hover:text-rose-700 text-xs font-bold px-3 py-1.5 rounded-lg transition-colors duration-200 disabled:opacity-50"
                                >
                                  {isClosing ? 'Closing...' : 'Liquidate'}
                                </button>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                )}
              </div>
            )}

            {/* ==========================================
                TAB: PLACE ORDER
                ========================================== */}
            {activeTab === 'order' && (
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Order Form */}
                <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm lg:col-span-2">
                  <h3 className="text-base font-bold text-slate-900 mb-6">New Order Ticket</h3>
                  
                  {orderFeedback && (
                    <div className={`mb-6 p-4 rounded-lg text-sm font-medium ${
                      orderFeedback.type === 'success' ? 'bg-emerald-50 text-emerald-800 border border-emerald-200' : 'bg-rose-50 text-rose-800 border border-rose-200'
                    }`}>
                      {orderFeedback.message}
                    </div>
                  )}

                  <form onSubmit={handleOrderSubmit} className="space-y-6">
                    {/* Side Toggle */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Side</label>
                      <div className="grid grid-cols-2 gap-4">
                        <button
                          type="button"
                          onClick={() => setOrderForm({ ...orderForm, side: 'buy' })}
                          className={`py-3 rounded-lg font-bold text-sm border transition-all ${
                            orderForm.side === 'buy'
                              ? 'bg-emerald-50 border-emerald-500 text-emerald-700 ring-2 ring-emerald-500/20'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          BUY (Long)
                        </button>
                        <button
                          type="button"
                          onClick={() => setOrderForm({ ...orderForm, side: 'sell' })}
                          className={`py-3 rounded-lg font-bold text-sm border transition-all ${
                            orderForm.side === 'sell'
                              ? 'bg-rose-50 border-rose-500 text-rose-700 ring-2 ring-rose-500/20'
                              : 'bg-white border-slate-200 text-slate-500 hover:bg-slate-50'
                          }`}
                        >
                          SELL (Short)
                        </button>
                      </div>
                    </div>

                    {/* Symbol & Qty */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Ticker Symbol</label>
                        <input
                          type="text"
                          placeholder="e.g. AAPL, MSFT"
                          value={orderForm.symbol}
                          onChange={(e) => setOrderForm({ ...orderForm, symbol: e.target.value.toUpperCase() })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                          required
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Quantity</label>
                        <input
                          type="number"
                          min="1"
                          value={orderForm.qty}
                          onChange={(e) => setOrderForm({ ...orderForm, qty: parseInt(e.target.value) || 0 })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                          required
                        />
                      </div>
                    </div>

                    {/* Order Type & Limit Price */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Order Type</label>
                        <select
                          value={orderForm.type}
                          onChange={(e) => setOrderForm({ ...orderForm, type: e.target.value as any })}
                          className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900 bg-white"
                        >
                          <option value="market">Market Order</option>
                          <option value="limit">Limit Order</option>
                        </select>
                      </div>
                      {orderForm.type === 'limit' && (
                        <div>
                          <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Limit Price ($)</label>
                          <input
                            type="number"
                            step="0.01"
                            placeholder="0.00"
                            value={orderForm.limit_price}
                            onChange={(e) => setOrderForm({ ...orderForm, limit_price: e.target.value })}
                            className="w-full px-4 py-2.5 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-900"
                            required={orderForm.type === 'limit'}
                          />
                        </div>
                      )}
                    </div>

                    {/* Time in Force */}
                    <div>
                      <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider mb-2">Time in Force</label>
                      <div className="flex gap-4">
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="time_in_force"
                            value="day"
                            checked={orderForm.time_in_force === 'day'}
                            onChange={() => setOrderForm({ ...orderForm, time_in_force: 'day' })}
                            className="text-blue-900 focus:ring-blue-900"
                          />
                          Day (End of session)
                        </label>
                        <label className="flex items-center gap-2 text-sm font-medium text-slate-700 cursor-pointer">
                          <input
                            type="radio"
                            name="time_in_force"
                            value="gtc"
                            checked={orderForm.time_in_force === 'gtc'}
                            onChange={() => setOrderForm({ ...orderForm, time_in_force: 'gtc' })}
                            className="text-blue-900 focus:ring-blue-900"
                          />
                          GTC (Good 'Til Canceled)
                        </label>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={orderSubmitting}
                      className={`w-full py-3.5 rounded-lg font-bold text-white transition-colors duration-200 flex items-center justify-center gap-2 ${
                        orderForm.side === 'buy' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-rose-600 hover:bg-rose-700'
                      } disabled:opacity-50`}
                    >
                      {orderSubmitting ? (
                        <>
                          <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                          Executing Order...
                        </>
                      ) : (
                        `Submit ${orderForm.side.toUpperCase()} Order`
                      )}
                    </button>
                  </form>
                </div>

                {/* Order Summary / Buying Power Info */}
                <div className="space-y-6">
                  <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm">
                    <h3 className="text-base font-bold text-slate-900 mb-4">Buying Power Summary</h3>
                    <div className="space-y-3 text-sm">
                      <div className="flex justify-between">
                        <span className="text-slate-500">Cash Balance</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(account?.cash)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Buying Power</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(account?.buying_power)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">Daytrading Buying Power</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(account?.daytrading_buying_power)}</span>
                      </div>
                      <div className="pt-3 border-t border-slate-100 flex justify-between text-xs text-slate-400">
                        <span>Leverage Multiplier</span>
                        <span>{account?.multiplier}x</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-blue-50 p-6 rounded-xl border border-blue-100">
                    <h4 className="text-sm font-bold text-blue-900 mb-2">B2B Liquidity Integration</h4>
                    <p className="text-xs text-blue-700 leading-relaxed">
                      This order ticket routes directly to Alpaca's institutional execution endpoints. Orders are processed in real-time with sub-millisecond latency. Ensure your partner API keys are securely stored in the environment variables.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* ==========================================
                TAB: ACCOUNT DETAILS
                ========================================== */}
            {activeTab === 'account' && (
              <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100 bg-slate-50/50">
                  <h3 className="text-base font-bold text-slate-900">Alpaca Account Configuration</h3>
                  <p className="text-xs text-slate-500 mt-1">Detailed parameters and regulatory status of your trading account.</p>
                </div>
                <div className="p-6 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                  {/* Account Status */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Status & Identity</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Account ID</span>
                        <span className="font-mono text-xs text-slate-700">{account?.id}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Account Number</span>
                        <span className="font-semibold text-slate-900">{account?.account_number}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Status</span>
                        <span className="bg-emerald-50 text-emerald-700 text-xs font-bold px-2 py-0.5 rounded uppercase">
                          {account?.status}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Currency</span>
                        <span className="font-semibold text-slate-900">{account?.currency}</span>
                      </div>
                    </div>
                  </div>

                  {/* Margins & Leverage */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Margins & Leverage</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Initial Margin</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(account?.initial_margin)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Maintenance Margin</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(account?.maintenance_margin)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Last Maintenance Margin</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(account?.last_maintenance_margin)}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Special Memorandum Account (SMA)</span>
                        <span className="font-semibold text-slate-900">{formatCurrency(account?.sma)}</span>
                      </div>
                    </div>
                  </div>

                  {/* Regulatory & Restrictions */}
                  <div className="space-y-4">
                    <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Regulatory & Restrictions</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Pattern Day Trader</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${account?.pattern_day_trader ? 'bg-amber-50 text-amber-700' : 'bg-slate-100 text-slate-700'}`}>
                          {account?.pattern_day_trader ? 'YES' : 'NO'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Day Trade Count</span>
                        <span className="font-semibold text-slate-900">{account?.daytrade_count}</span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Shorting Enabled</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${account?.shorting_enabled ? 'bg-emerald-50 text-emerald-700' : 'bg-rose-50 text-rose-700'}`}>
                          {account?.shorting_enabled ? 'ENABLED' : 'DISABLED'}
                        </span>
                      </div>
                      <div className="flex justify-between py-1 border-b border-slate-50">
                        <span className="text-slate-500">Trading Blocked</span>
                        <span className={`text-xs font-bold px-2 py-0.5 rounded ${account?.trading_blocked ? 'bg-rose-50 text-rose-700' : 'bg-emerald-50 text-emerald-700'}`}>
                          {account?.trading_blocked ? 'BLOCKED' : 'ACTIVE'}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </main>
    </div>
  );
}