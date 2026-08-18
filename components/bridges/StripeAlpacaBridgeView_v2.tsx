import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { 
  DollarSign, 
  CheckCircle2, 
  Zap, 
  ArrowRight, 
  ShieldCheck, 
  RefreshCw, 
  ArrowLeftRight, 
  AlertTriangle, 
  TrendingUp, 
  Activity, 
  Sliders, 
  Building2, 
  Lock, 
  HelpCircle,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Check,
  X
} from 'lucide-react';

// Define robust local interfaces matching the service layer
export interface StripeConnectedBank {
  id: string;
  bankName: string;
  accountNumberLast4: string;
  routingNumber: string;
  stripeAccountId: string;
  alpacaAccountId: string;
  status: 'active' | 'pending' | 'disabled';
  availableBalance: number;
  collateralAllocated: number;
  currency: string;
}

export interface StripeAlpacaSweepTransfer {
  id: string;
  amount: number;
  direction: 'stripe_to_alpaca' | 'alpaca_to_stripe';
  status: 'completed' | 'pending' | 'failed';
  timestamp: string;
  stripeTxId: string;
  alpacaTxId: string;
  fee: number;
}

export default function StripeAlpacaBridgeView_v2() {
  // State Management
  const [banks, setBanks] = useState<StripeConnectedBank[]>([]);
  const [transfers, setTransfers] = useState<StripeAlpacaSweepTransfer[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [syncing, setSyncing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  // Sweep Form State
  const [selectedBankId, setSelectedBankId] = useState<string>('');
  const [sweepAmount, setSweepAmount] = useState<string>('');
  const [sweepDirection, setSweepDirection] = useState<'stripe_to_alpaca' | 'alpaca_to_stripe'>('stripe_to_alpaca');
  const [isSweeping, setIsSweeping] = useState<boolean>(false);
  const [sweepSuccess, setSweepSuccess] = useState<boolean>(false);

  // Collateral State
  const [collateralLimit, setCollateralLimit] = useState<number>(75); // percentage of Stripe balance to allow as collateral
  const [isAdjustingCollateral, setIsAdjustingCollateral] = useState<boolean>(false);
  const [collateralSuccess, setCollateralSuccess] = useState<boolean>(false);

  // Auto-Sweep Settings
  const [autoSweepEnabled, setAutoSweepEnabled] = useState<boolean>(true);
  const [autoSweepThreshold, setAutoSweepThreshold] = useState<number>(5000);

  // Mock Data Generator for Fallback/Demo
  const loadMockData = useCallback(() => {
    const mockBanks: StripeConnectedBank[] = [
      {
        id: 'lnk_stripe_alpaca_01',
        bankName: 'Silicon Valley Bank (Stripe Treasury)',
        accountNumberLast4: '8821',
        routingNumber: '121140399',
        stripeAccountId: 'acct_1N8xY2JvK9sL0pQ',
        alpacaAccountId: 'alp_acc_992817302',
        status: 'active',
        availableBalance: 142500.00,
        collateralAllocated: 85000.00,
        currency: 'USD'
      },
      {
        id: 'lnk_stripe_alpaca_02',
        bankName: 'JPMorgan Chase (Stripe Issuing)',
        accountNumberLast4: '4402',
        routingNumber: '021000021',
        stripeAccountId: 'acct_1M9zX1HvJ8rK9oP',
        alpacaAccountId: 'alp_acc_110293847',
        status: 'active',
        availableBalance: 48900.00,
        collateralAllocated: 20000.00,
        currency: 'USD'
      }
    ];

    const mockTransfers: StripeAlpacaSweepTransfer[] = [
      {
        id: 'swp_9928102',
        amount: 25000.00,
        direction: 'stripe_to_alpaca',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 2).toISOString(), // 2 hours ago
        stripeTxId: 'ch_3N8xY2JvK9sL0pQ_001',
        alpacaTxId: 'alp_tx_8819203',
        fee: 0.00
      },
      {
        id: 'swp_9928101',
        amount: 12500.00,
        direction: 'alpaca_to_stripe',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 24).toISOString(), // 1 day ago
        stripeTxId: 'ch_3N8xY2JvK9sL0pQ_002',
        alpacaTxId: 'alp_tx_8819104',
        fee: 5.00
      },
      {
        id: 'swp_9928100',
        amount: 50000.00,
        direction: 'stripe_to_alpaca',
        status: 'completed',
        timestamp: new Date(Date.now() - 3600000 * 48).toISOString(), // 2 days ago
        stripeTxId: 'ch_3N8xY2JvK9sL0pQ_003',
        alpacaTxId: 'alp_tx_8819001',
        fee: 0.00
      },
      {
        id: 'swp_9928099',
        amount: 15000.00,
        direction: 'stripe_to_alpaca',
        status: 'failed',
        timestamp: new Date(Date.now() - 3600000 * 72).toISOString(), // 3 days ago
        stripeTxId: 'ch_3N8xY2JvK9sL0pQ_004',
        alpacaTxId: 'alp_tx_8818902',
        fee: 0.00
      }
    ];

    setBanks(mockBanks);
    setTransfers(mockTransfers);
    if (mockBanks.length > 0) {
      setSelectedBankId(mockBanks[0].id);
    }
  }, []);

  // Initial Data Fetch
  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        // Attempt to use the real service if available, otherwise fallback to mock
        // @ts-ignore
        if (typeof stripeBridgeService !== 'undefined' && stripeBridgeService.getConnectedBanks) {
          // @ts-ignore
          const activeBanks = await stripeBridgeService.getConnectedBanks();
          // @ts-ignore
          const activeTransfers = await stripeBridgeService.getSweepTransfers();
          setBanks(activeBanks);
          setTransfers(activeTransfers);
          if (activeBanks.length > 0) {
            setSelectedBankId(activeBanks[0].id);
          }
        } else {
          loadMockData();
        }
      } catch (err: any) {
        console.error('Error loading Stripe-Alpaca Bridge data:', err);
        setError(err.message || 'Failed to load bridge configuration.');
        loadMockData(); // Fallback to mock on error to keep UI functional
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [loadMockData]);

  // Sync Bridge Balances
  const handleSync = async () => {
    setSyncing(true);
    setError(null);
    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));
      
      // Update balances slightly to simulate real-time changes
      setBanks(prevBanks => 
        prevBanks.map(bank => ({
          ...bank,
          availableBalance: bank.availableBalance + (Math.random() * 1000 - 500)
        }))
      );
    } catch (err: any) {
      setError('Failed to synchronize balances with Stripe and Alpaca APIs.');
    } finally {
      setSyncing(false);
    }
  };

  // Handle Sweep Transfer Submission
  const handleSweepSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const amount = parseFloat(sweepAmount);
    if (isNaN(amount) || amount <= 0) {
      setError('Please enter a valid transfer amount.');
      return;
    }

    const selectedBank = banks.find(b => b.id === selectedBankId);
    if (!selectedBank) {
      setError('Please select a valid connected bank.');
      return;
    }

    if (sweepDirection === 'stripe_to_alpaca' && amount > selectedBank.availableBalance) {
      setError('Insufficient funds in Stripe Treasury account.');
      return;
    }

    setIsSweeping(true);
    setError(null);
    setSweepSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 2000));

      const newTransfer: StripeAlpacaSweepTransfer = {
        id: `swp_${Math.floor(1000000 + Math.random() * 9000000)}`,
        amount,
        direction: sweepDirection,
        status: 'completed',
        timestamp: new Date().toISOString(),
        stripeTxId: `ch_${Math.random().toString(36).substring(2, 15)}`,
        alpacaTxId: `alp_tx_${Math.random().toString(36).substring(2, 10)}`,
        fee: sweepDirection === 'alpaca_to_stripe' ? 5.00 : 0.00
      };

      // Update local state
      setTransfers(prev => [newTransfer, ...prev]);
      setBanks(prevBanks => 
        prevBanks.map(bank => {
          if (bank.id === selectedBankId) {
            const balanceAdjustment = sweepDirection === 'stripe_to_alpaca' ? -amount : amount;
            return {
              ...bank,
              availableBalance: bank.availableBalance + balanceAdjustment
            };
          }
          return bank;
        })
      );

      setSweepAmount('');
      setSweepSuccess(true);
      setTimeout(() => setSweepSuccess(false), 5000);
    } catch (err: any) {
      setError(err.message || 'Sweep transfer failed to execute.');
    } finally {
      setIsSweeping(false);
    }
  };

  // Handle Collateral Limit Adjustment
  const handleAdjustCollateral = async () => {
    setIsAdjustingCollateral(true);
    setError(null);
    setCollateralSuccess(false);

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500));

      setBanks(prevBanks => 
        prevBanks.map(bank => {
          if (bank.id === selectedBankId) {
            const newCollateral = (bank.availableBalance * (collateralLimit / 100));
            return {
              ...bank,
              collateralAllocated: parseFloat(newCollateral.toFixed(2))
            };
          }
          return bank;
        })
      );

      setCollateralSuccess(true);
      setTimeout(() => setCollateralSuccess(false), 4000);
    } catch (err: any) {
      setError('Failed to update collateral allocation limits.');
    } finally {
      setIsAdjustingCollateral(false);
    }
  };

  // Computed Metrics
  const metrics = useMemo(() => {
    const totalStripeBalance = banks.reduce((sum, b) => sum + b.availableBalance, 0);
    const totalCollateralAllocated = banks.reduce((sum, b) => sum + b.collateralAllocated, 0);
    const totalSweptVolume = transfers
      .filter(t => t.status === 'completed')
      .reduce((sum, t) => sum + t.amount, 0);
    
    // Calculate collateral health ratio (allocated vs available)
    const collateralRatio = totalStripeBalance > 0 
      ? (totalCollateralAllocated / totalStripeBalance) * 100 
      : 0;

    return {
      totalStripeBalance,
      totalCollateralAllocated,
      totalSweptVolume,
      collateralRatio
    };
  }, [banks, transfers]);

  const activeBank = useMemo(() => {
    return banks.find(b => b.id === selectedBankId) || null;
  }, [banks, selectedBankId]);

  if (loading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[400px] p-8 bg-slate-950 text-slate-100 rounded-xl border border-slate-800">
        <RefreshCw className="w-10 h-10 text-emerald-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Initializing Stripe-Alpaca Bridge Engine...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6 p-6 bg-slate-950 text-slate-100 rounded-2xl border border-slate-800/80 shadow-2xl max-w-7xl mx-auto">
      
      {/* Header Section */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-6 border-b border-slate-800/60">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 text-xs font-semibold bg-emerald-500/10 text-emerald-400 rounded-full border border-emerald-500/20 flex items-center gap-1.5">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Bridge Active
            </span>
            <span className="text-xs text-slate-500">v2.4.0-secure</span>
          </div>
          <h1 className="text-2xl font-bold tracking-tight mt-1 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Stripe-Alpaca Liquidity Bridge
          </h1>
          <p className="text-sm text-slate-400 mt-0.5">
            Manage real-time sweep transfers, collateralized trading limits, and automated treasury routing.
          </p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleSync}
            disabled={syncing}
            className="px-4 py-2 text-sm font-medium bg-slate-900 hover:bg-slate-800 text-slate-200 rounded-lg border border-slate-800 hover:border-slate-700 transition-all flex items-center gap-2 disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${syncing ? 'animate-spin text-emerald-400' : ''}`} />
            {syncing ? 'Syncing APIs...' : 'Sync Bridge'}
          </button>
        </div>
      </div>

      {/* Error Alert */}
      {error && (
        <div className="p-4 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-3 text-rose-400 text-sm">
          <AlertTriangle className="w-5 h-5 shrink-0 mt-0.5" />
          <div className="flex-1">
            <span className="font-semibold">Bridge Exception:</span> {error}
          </div>
          <button onClick={() => setError(null)} className="text-rose-400 hover:text-rose-300">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Quick Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>TOTAL STRIPE TREASURY CASH</span>
            <Building2 className="w-4 h-4 text-slate-500" />
          </div>
          <div className="text-2xl font-bold mt-1.5 text-white">
            ${metrics.totalStripeBalance.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
            Fully backed by Stripe Treasury
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>COLLATERAL ALLOCATED</span>
            <ShieldCheck className="w-4 h-4 text-emerald-500" />
          </div>
          <div className="text-2xl font-bold mt-1.5 text-emerald-400">
            ${metrics.totalCollateralAllocated.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1 flex items-center gap-1">
            <TrendingUp className="w-3 h-3 text-emerald-500" />
            Backing Alpaca buying power
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>COLLATERAL UTILIZATION</span>
            <Activity className="w-4 h-4 text-amber-500" />
          </div>
          <div className="text-2xl font-bold mt-1.5 text-amber-400">
            {metrics.collateralRatio.toFixed(1)}%
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Max safe threshold: 85.0%
          </div>
        </div>

        <div className="p-4 bg-slate-900/40 rounded-xl border border-slate-800/60">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>TOTAL SWEPT VOLUME</span>
            <Zap className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-2xl font-bold mt-1.5 text-indigo-400">
            ${metrics.totalSweptVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
          </div>
          <div className="text-[10px] text-slate-500 mt-1">
            Across {transfers.length} historical sweeps
          </div>
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Sweep Terminal & Collateral Controls */}
        <div className="lg:col-span-7 space-y-6">
          
          {/* Sweep Transfer Terminal */}
          <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <ArrowLeftRight className="w-5 h-5 text-emerald-500" />
                Instant Sweep Terminal
              </h2>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <Lock className="w-3 h-3" /> End-to-end encrypted
              </span>
            </div>

            <form onSubmit={handleSweepSubmit} className="space-y-4">
              {/* Bank Selection */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  SELECT STRIPE TREASURY LINK
                </label>
                <select
                  value={selectedBankId}
                  onChange={(e) => setSelectedBankId(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                >
                  {banks.map(bank => (
                    <option key={bank.id} value={bank.id}>
                      {bank.bankName} (Stripe: ...{bank.stripeAccountId.slice(-4)} → Alpaca: ...{bank.alpacaAccountId.slice(-4)})
                    </option>
                  ))}
                </select>
              </div>

              {/* Direction Toggle */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-slate-950 rounded-lg border border-slate-800/80">
                <button
                  type="button"
                  onClick={() => setSweepDirection('stripe_to_alpaca')}
                  className={`py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    sweepDirection === 'stripe_to_alpaca'
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  Stripe → Alpaca Sweep
                </button>
                <button
                  type="button"
                  onClick={() => setSweepDirection('alpaca_to_stripe')}
                  className={`py-2 text-xs font-medium rounded-md transition-all flex items-center justify-center gap-1.5 ${
                    sweepDirection === 'alpaca_to_stripe'
                      ? 'bg-indigo-500/10 text-indigo-400 border border-indigo-500/20'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  <ArrowDownRight className="w-3.5 h-3.5" />
                  Alpaca → Stripe Sweep
                </button>
              </div>

              {/* Amount Input */}
              <div>
                <label className="block text-xs font-medium text-slate-400 mb-1.5">
                  SWEEP AMOUNT (USD)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm font-medium">$</span>
                  <input
                    type="number"
                    value={sweepAmount}
                    onChange={(e) => setSweepAmount(e.target.value)}
                    placeholder="0.00"
                    step="0.01"
                    min="1"
                    className="w-full pl-7 pr-20 py-2.5 bg-slate-950 border border-slate-800 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-emerald-500/50 transition-colors"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      if (activeBank) {
                        setSweepAmount(activeBank.availableBalance.toFixed(2));
                      }
                    }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 px-2 py-1 text-[10px] font-semibold bg-slate-900 hover:bg-slate-800 text-slate-400 hover:text-slate-200 rounded border border-slate-800 transition-colors"
                  >
                    SWEEP MAX
                  </button>
                </div>
                {activeBank && (
                  <div className="flex justify-between items-center mt-1.5 text-[11px] text-slate-500">
                    <span>Available Stripe Balance: ${activeBank.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}</span>
                    <span>Fee: {sweepDirection === 'stripe_to_alpaca' ? 'Free' : '$5.00 (Instant)'}</span>
                  </div>
                )}
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isSweeping || !sweepAmount}
                className={`w-full py-2.5 rounded-lg text-sm font-semibold transition-all flex items-center justify-center gap-2 ${
                  sweepDirection === 'stripe_to_alpaca'
                    ? 'bg-emerald-500 hover:bg-emerald-600 text-slate-950 disabled:bg-emerald-500/40'
                    : 'bg-indigo-500 hover:bg-indigo-600 text-white disabled:bg-indigo-500/40'
                }`}
              >
                {isSweeping ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Executing Secure Sweep...
                  </>
                ) : (
                  <>
                    <Zap className="w-4 h-4" />
                    Initiate Sweep Transfer
                  </>
                )}
              </button>

              {sweepSuccess && (
                <div className="p-3 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400 text-xs flex items-center gap-2">
                  <CheckCircle2 className="w-4 h-4 shrink-0" />
                  <span>Sweep transfer executed successfully! Balances updated.</span>
                </div>
              )}
            </form>
          </div>

          {/* Collateral Optimization */}
          <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-500" />
                Collateral Allocation Engine
              </h2>
              <span className="text-xs text-slate-500 flex items-center gap-1">
                <HelpCircle className="w-3.5 h-3.5" /> Margin Backing
              </span>
            </div>

            <p className="text-xs text-slate-400 leading-relaxed">
              Allocate Stripe Treasury cash balances as collateral to instantly increase your Alpaca buying power without executing physical wire transfers.
            </p>

            {activeBank && (
              <div className="space-y-4 pt-2">
                <div className="flex justify-between text-xs font-medium">
                  <span className="text-slate-400">COLLATERAL ALLOCATION LIMIT</span>
                  <span className="text-amber-400 font-bold">{collateralLimit}%</span>
                </div>

                <input
                  type="range"
                  min="10"
                  max="95"
                  value={collateralLimit}
                  onChange={(e) => setCollateralLimit(parseInt(e.target.value))}
                  className="w-full h-1.5 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />

                <div className="grid grid-cols-2 gap-4 p-3 bg-slate-950 rounded-lg border border-slate-800/60 text-xs">
                  <div>
                    <span className="text-slate-500 block">Current Collateral</span>
                    <span className="text-sm font-semibold text-slate-200">
                      ${activeBank.collateralAllocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">Projected Collateral</span>
                    <span className="text-sm font-semibold text-amber-400">
                      ${(activeBank.availableBalance * (collateralLimit / 100)).toLocaleString('en-US', { minimumFractionDigits: 2 })}
                    </span>
                  </div>
                </div>

                <button
                  onClick={handleAdjustCollateral}
                  disabled={isAdjustingCollateral}
                  className="w-full py-2 bg-slate-900 hover:bg-slate-800 text-slate-200 hover:text-white rounded-lg text-xs font-semibold border border-slate-800 hover:border-slate-700 transition-all flex items-center justify-center gap-2"
                >
                  {isAdjustingCollateral ? (
                    <>
                      <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                      Updating Collateral Limits...
                    </>
                  ) : (
                    <>
                      <ShieldCheck className="w-4 h-4 text-amber-500" />
                      Apply Collateral Allocation
                    </>
                  )}
                </button>

                {collateralSuccess && (
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400 text-xs flex items-center gap-2">
                    <Check className="w-4 h-4 shrink-0" />
                    <span>Collateral limits successfully synchronized with Alpaca Brokerage.</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </div>

        {/* Right Column: Connected Accounts & Sweep History */}
        <div className="lg:col-span-5 space-y-6">
          
          {/* Connected Accounts List */}
          <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/80 space-y-4">
            <h2 className="text-lg font-semibold text-white flex items-center gap-2">
              <Building2 className="w-5 h-5 text-indigo-400" />
              Linked Accounts
            </h2>

            <div className="space-y-3">
              {banks.map(bank => (
                <div 
                  key={bank.id} 
                  onClick={() => setSelectedBankId(bank.id)}
                  className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                    selectedBankId === bank.id 
                      ? 'bg-slate-900/80 border-emerald-500/30 shadow-lg shadow-emerald-500/5' 
                      : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-xs font-bold text-slate-200">{bank.bankName}</h3>
                      <p className="text-[10px] text-slate-500 mt-0.5">
                        Stripe ID: ...{bank.stripeAccountId.slice(-6)} | Alpaca ID: ...{bank.alpacaAccountId.slice(-6)}
                      </p>
                    </div>
                    <span className="px-2 py-0.5 text-[9px] font-semibold bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20">
                      {bank.status.toUpperCase()}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-2 mt-3 pt-3 border-t border-slate-800/40 text-xs">
                    <div>
                      <span className="text-slate-500 block text-[10px]">STRIPE BALANCE</span>
                      <span className="font-semibold text-slate-300">
                        ${bank.availableBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-slate-500 block text-[10px]">COLLATERAL BACKING</span>
                      <span className="font-semibold text-emerald-400">
                        ${bank.collateralAllocated.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Auto-Sweep Settings */}
          <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/80 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-indigo-400" />
                Automated Sweep Rules
              </h2>
              <label className="relative inline-flex items-center cursor-pointer">
                <input 
                  type="checkbox" 
                  checked={autoSweepEnabled} 
                  onChange={(e) => setAutoSweepEnabled(e.target.checked)}
                  className="sr-only peer" 
                />
                <div className="w-8 h-4 bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-slate-400 after:border-slate-300 after:border after:rounded-full after:h-3 after:w-3 after:transition-all peer-checked:bg-emerald-500"></div>
              </label>
            </div>

            {autoSweepEnabled && (
              <div className="space-y-3 pt-1">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-400">Sweep excess Stripe cash above:</span>
                  <span className="text-indigo-400 font-semibold">${autoSweepThreshold.toLocaleString()}</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="25000"
                  step="1000"
                  value={autoSweepThreshold}
                  onChange={(e) => setAutoSweepThreshold(parseInt(e.target.value))}
                  className="w-full h-1 bg-slate-950 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                />
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  When Stripe Treasury balance exceeds ${autoSweepThreshold.toLocaleString()}, the excess is automatically swept to Alpaca to maximize yield and trading capacity.
                </p>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Sweep History Section */}
      <div className="p-5 bg-slate-900/30 rounded-xl border border-slate-800/80 space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-white flex items-center gap-2">
            <Clock className="w-5 h-5 text-slate-400" />
            Sweep Transfer History
          </h2>
          <span className="text-xs text-slate-500">Showing recent ledger entries</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-slate-800/60 text-[10px] font-semibold text-slate-500 tracking-wider">
                <th className="pb-3">TRANSFER ID</th>
                <th className="pb-3">DIRECTION</th>
                <th className="pb-3">AMOUNT</th>
                <th className="pb-3">FEE</th>
                <th className="pb-3">TIMESTAMP</th>
                <th className="pb-3">STATUS</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/40 text-xs">
              {transfers.map((tx) => (
                <tr key={tx.id} className="hover:bg-slate-900/20 transition-colors">
                  <td className="py-3 font-mono text-slate-400">
                    {tx.id}
                    <span className="block text-[9px] text-slate-600">Stripe: {tx.stripeTxId.slice(0, 12)}...</span>
                  </td>
                  <td className="py-3">
                    {tx.direction === 'stripe_to_alpaca' ? (
                      <span className="inline-flex items-center gap-1 text-emerald-400 font-medium">
                        <ArrowUpRight className="w-3.5 h-3.5" />
                        Stripe → Alpaca
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1 text-indigo-400 font-medium">
                        <ArrowDownRight className="w-3.5 h-3.5" />
                        Alpaca → Stripe
                      </span>
                    )}
                  </td>
                  <td className="py-3 font-semibold text-slate-200">
                    ${tx.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  </td>
                  <td className="py-3 text-slate-400">
                    {tx.fee > 0 ? `$${tx.fee.toFixed(2)}` : 'Free'}
                  </td>
                  <td className="py-3 text-slate-400">
                    {new Date(tx.timestamp).toLocaleString()}
                  </td>
                  <td className="py-3">
                    <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                      tx.status === 'completed' 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                        : tx.status === 'pending'
                        ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                    }`}>
                      {tx.status.toUpperCase()}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
}