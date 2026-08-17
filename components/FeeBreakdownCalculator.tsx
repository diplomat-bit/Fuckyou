import React, { useState, useEffect, useMemo } from 'react';
import { 
  Info, 
  ArrowRight, 
  RefreshCw, 
  TrendingUp, 
  ShieldCheck, 
  HelpCircle, 
  Coins, 
  CreditCard, 
  ArrowDownRight, 
  ArrowUpRight,
  Clock,
  CheckCircle2,
  AlertCircle
} from 'lucide-react';

// Types for the Preprocess Response
export interface FeeDetail {
  name: string;
  amount: number;
  currency: string;
  description: string;
  type: 'fixed' | 'percentage' | 'network';
}

export interface PreprocessResponse {
  sourceAmount: number;
  sourceCurrency: string;
  targetAmount: number;
  targetCurrency: string;
  exchangeRate: number;
  realExchangeRate: number;
  markupPercentage: number;
  fees: FeeDetail[];
  totalFees: number;
  debitAmount: number; // Total cost to user
  creditAmount: number; // Total received by recipient
  estimatedDelivery: string;
  rateGuaranteeSeconds: number;
}

interface FeeBreakdownCalculatorProps {
  initialAmount?: number;
  sourceCurrency?: string;
  targetCurrency?: string;
  onCalculationComplete?: (data: PreprocessResponse) => void;
  className?: string;
}

export default function FeeBreakdownCalculator({
  initialAmount = 1000,
  sourceCurrency = 'EUR',
  targetCurrency = 'GBP',
  onCalculationComplete,
  className = ''
}: FeeBreakdownCalculatorProps) {
  // State
  const [amount, setAmount] = useState<number>(initialAmount);
  const [srcCurrency, setSrcCurrency] = useState<string>(sourceCurrency);
  const [tgtCurrency, setTgtCurrency] = useState<string>(targetCurrency);
  const [isCalculating, setIsCalculating] = useState<boolean>(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [timeLeft, setTimeLeft] = useState<number>(60);
  const [showDetails, setShowDetails] = useState<boolean>(true);

  // Mock exchange rates and fee structures for calculation
  const currencyConfig: Record<string, { symbol: string; rateToEUR: number }> = {
    EUR: { symbol: '€', rateToEUR: 1.0 },
    GBP: { symbol: '£', rateToEUR: 1.17 },
    USD: { symbol: '$', rateToEUR: 0.92 },
    CHF: { symbol: 'CHF', rateToEUR: 1.04 },
    PLN: { symbol: 'zł', rateToEUR: 0.23 },
  };

  // Countdown timer for rate guarantee
  useEffect(() => {
    if (timeLeft <= 0) {
      setTimeLeft(60); // Reset timer
      return;
    }
    const timer = setTimeout(() => setTimeLeft(timeLeft - 1), 1000);
    return () => clearTimeout(timer);
  }, [timeLeft]);

  // Calculate preprocess response dynamically based on inputs
  const preprocessData = useMemo<PreprocessResponse>(() => {
    const srcRate = currencyConfig[srcCurrency]?.rateToEUR || 1;
    const tgtRate = currencyConfig[tgtCurrency]?.rateToEUR || 1;
    
    // Base exchange rate calculation
    const baseRate = srcRate / tgtRate;
    const markupPercentage = 0.0035; // 0.35% FX markup
    const exchangeRate = baseRate * (1 - markupPercentage);
    
    // Fee calculations
    const sepaFee: FeeDetail = {
      name: 'SEPA Transfer Fee',
      amount: srcCurrency === 'EUR' ? 0.50 : 0.50 * (1 / srcRate),
      currency: srcCurrency,
      description: 'Standard SEPA network processing fee.',
      type: 'network'
    };

    const serviceFee: FeeDetail = {
      name: 'Platform Service Fee',
      amount: amount * 0.0015, // 0.15%
      currency: srcCurrency,
      description: 'Secure processing and platform maintenance fee.',
      type: 'percentage'
    };

    const fxMarkupFee: FeeDetail = {
      name: 'Exchange Rate Spread',
      amount: amount * markupPercentage,
      currency: srcCurrency,
      description: 'Interbank rate variance and currency conversion cost.',
      type: 'fixed'
    };

    const fees = [sepaFee, serviceFee, fxMarkupFee];
    const totalFees = fees.reduce((sum, fee) => sum + fee.amount, 0);
    const debitAmount = amount;
    const creditAmount = (amount - totalFees) * exchangeRate;

    return {
      sourceAmount: amount,
      sourceCurrency: srcCurrency,
      targetAmount: Number(creditAmount.toFixed(2)),
      targetCurrency: tgtCurrency,
      exchangeRate: Number(exchangeRate.toFixed(6)),
      realExchangeRate: Number(baseRate.toFixed(6)),
      markupPercentage: markupPercentage * 100,
      fees,
      totalFees: Number(totalFees.toFixed(2)),
      debitAmount: Number(debitAmount.toFixed(2)),
      creditAmount: Number(creditAmount.toFixed(2)),
      estimatedDelivery: 'Within 24 hours (SEPA Instant)',
      rateGuaranteeSeconds: timeLeft
    };
  }, [amount, srcCurrency, tgtCurrency, timeLeft]);

  // Trigger callback when calculation updates
  useEffect(() => {
    if (onCalculationComplete) {
      onCalculationComplete(preprocessData);
    }
  }, [preprocessData, onCalculationComplete]);

  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = parseFloat(e.target.value);
    setAmount(isNaN(val) ? 0 : val);
  };

  const formatCurrency = (value: number, currency: string) => {
    const symbol = currencyConfig[currency]?.symbol || currency;
    return `${symbol}${value.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
  };

  return (
    <div className={`w-full max-w-2xl mx-auto bg-slate-900 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-950 to-slate-900">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              <Coins className="w-5 h-5 text-emerald-400" />
              SEPA Fee Breakdown
            </h2>
            <p className="text-xs text-slate-400 mt-1">Real-time transparent pricing & routing analysis</p>
          </div>
          <div className="flex items-center gap-2 bg-slate-800/80 px-3 py-1.5 rounded-full border border-slate-700/50">
            <Clock className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span className="text-xs font-mono text-slate-300">Rate locked: {timeLeft}s</span>
          </div>
        </div>
      </div>

      {/* Interactive Input Panel */}
      <div className="p-6 bg-slate-950/50 border-b border-slate-800/60">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* Source Input */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800 focus-within:border-emerald-500/50 transition-all">
            <label className="block text-xs font-medium text-slate-400 mb-1">You Send (Debit)</label>
            <div className="flex items-center justify-between">
              <input
                type="number"
                value={amount || ''}
                onChange={handleAmountChange}
                className="bg-transparent text-2xl font-bold text-white focus:outline-none w-2/3 [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                placeholder="0.00"
              />
              <select
                value={srcCurrency}
                onChange={(e) => setSrcCurrency(e.target.value)}
                className="bg-slate-800 text-white font-semibold rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none text-sm cursor-pointer hover:bg-slate-750"
              >
                {Object.keys(currencyConfig).map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
          </div>

          {/* Target Output */}
          <div className="bg-slate-900/90 p-4 rounded-2xl border border-slate-800/80 relative">
            <label className="block text-xs font-medium text-slate-400 mb-1">Recipient Receives (Credit)</label>
            <div className="flex items-center justify-between">
              <span className="text-2xl font-bold text-emerald-400">
                {formatCurrency(preprocessData.creditAmount, tgtCurrency)}
              </span>
              <select
                value={tgtCurrency}
                onChange={(e) => setTgtCurrency(e.target.value)}
                className="bg-slate-800 text-white font-semibold rounded-xl px-3 py-1.5 border border-slate-700 focus:outline-none text-sm cursor-pointer hover:bg-slate-750"
              >
                {Object.keys(currencyConfig).filter(c => c !== srcCurrency).map((cur) => (
                  <option key={cur} value={cur}>{cur}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        {/* Exchange Rate Banner */}
        <div className="mt-4 flex flex-wrap items-center justify-between gap-3 bg-emerald-950/20 border border-emerald-900/30 rounded-xl p-3 text-xs">
          <div className="flex items-center gap-2 text-emerald-400">
            <TrendingUp className="w-4 h-4" />
            <span className="font-medium">
              1 {srcCurrency} = {preprocessData.exchangeRate} {tgtCurrency}
            </span>
            <span className="text-slate-500">|</span>
            <span className="text-slate-400">
              Real Rate: 1 {srcCurrency} = {preprocessData.realExchangeRate} {tgtCurrency}
            </span>
          </div>
          <div className="text-slate-400 flex items-center gap-1">
            <span>Includes {preprocessData.markupPercentage}% FX markup</span>
            <div className="relative inline-block">
              <button 
                onMouseEnter={() => setActiveTooltip('markup')}
                onMouseLeave={() => setActiveTooltip(null)}
                className="text-slate-500 hover:text-slate-300 focus:outline-none"
              >
                <HelpCircle className="w-3.5 h-3.5" />
              </button>
              {activeTooltip === 'markup' && (
                <div className="absolute bottom-full right-0 mb-2 w-48 bg-slate-800 text-slate-200 text-[10px] p-2 rounded-lg shadow-xl border border-slate-700 z-10">
                  A small spread is added to the interbank rate to cover liquidity risk and conversion costs.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Fee Breakdown Details */}
      <div className="p-6 space-y-6">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider">Cost Breakdown</h3>
          <button 
            onClick={() => setShowDetails(!showDetails)}
            className="text-xs text-emerald-400 hover:text-emerald-300 font-medium transition-colors"
          >
            {showDetails ? 'Hide Details' : 'Show Details'}
          </button>
        </div>

        {showDetails && (
          <div className="space-y-3 transition-all duration-300">
            {preprocessData.fees.map((fee, idx) => (
              <div 
                key={idx} 
                className="flex items-center justify-between p-3 rounded-xl bg-slate-900/40 border border-slate-800/50 hover:border-slate-700/50 transition-all"
              >
                <div className="flex items-start gap-3">
                  <div className="mt-0.5 p-1.5 rounded-lg bg-slate-800 text-slate-400">
                    {fee.type === 'network' ? <CreditCard className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <span className="text-sm font-medium text-slate-200">{fee.name}</span>
                      <div className="relative inline-block">
                        <button 
                          onMouseEnter={() => setActiveTooltip(fee.name)}
                          onMouseLeave={() => setActiveTooltip(null)}
                          className="text-slate-500 hover:text-slate-300 focus:outline-none"
                        >
                          <Info className="w-3.5 h-3.5" />
                        </button>
                        {activeTooltip === fee.name && (
                          <div className="absolute bottom-full left-0 mb-2 w-56 bg-slate-800 text-slate-200 text-[10px] p-2 rounded-lg shadow-xl border border-slate-700 z-10">
                            {fee.description}
                          </div>
                        )}
                      </div>
                    </div>
                    <span className="text-xs text-slate-500">{fee.type === 'percentage' ? 'Variable rate' : 'Fixed rate'}</span>
                  </div>
                </div>
                <span className="text-sm font-semibold text-slate-300">
                  {formatCurrency(fee.amount, fee.currency)}
                </span>
              </div>
            ))}
          </div>
        )}

        {/* Total Fee Summary Bar */}
        <div className="bg-slate-950 p-4 rounded-2xl border border-slate-800/80 space-y-3">
          <div className="flex items-center justify-between text-sm">
            <span className="text-slate-400">Total Transfer Fees</span>
            <span className="font-bold text-white">{formatCurrency(preprocessData.totalFees, srcCurrency)}</span>
          </div>
          
          {/* Visual Progress Bar of Fees vs Total */}
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
            <div 
              className="bg-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${Math.min(100, (preprocessData.totalFees / preprocessData.sourceAmount) * 100 || 0)}%` }}
            />
          </div>
          <div className="flex justify-between text-[10px] text-slate-500">
            <span>Fees: {((preprocessData.totalFees / preprocessData.sourceAmount) * 100 || 0).toFixed(2)}% of transfer</span>
            <span>Principal: {((1 - (preprocessData.totalFees / preprocessData.sourceAmount)) * 100 || 100).toFixed(2)}%</span>
          </div>
        </div>

        {/* Debit & Credit Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* Debit Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Total Debit (You Pay)</span>
              <span className="text-lg font-bold text-white">{formatCurrency(preprocessData.debitAmount, srcCurrency)}</span>
            </div>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400">
              <ArrowUpRight className="w-5 h-5" />
            </div>
          </div>

          {/* Credit Card */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 p-4 rounded-2xl border border-slate-800 flex items-center justify-between">
            <div>
              <span className="text-xs text-slate-400 block mb-1">Total Credit (Received)</span>
              <span className="text-lg font-bold text-emerald-400">{formatCurrency(preprocessData.creditAmount, tgtCurrency)}</span>
            </div>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400">
              <ArrowDownRight className="w-5 h-5" />
            </div>
          </div>
        </div>
      </div>

      {/* Footer / Trust Badges */}
      <div className="p-4 bg-slate-950 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <ShieldCheck className="w-4 h-4 text-emerald-500" />
          <span>Guaranteed delivery: <strong className="text-slate-300">{preprocessData.estimatedDelivery}</strong></span>
        </div>
        <div className="flex items-center gap-1.5">
          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" />
          <span>SEPA Instant Routing Active</span>
        </div>
      </div>
    </div>
  );
}