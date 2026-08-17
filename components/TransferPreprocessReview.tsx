import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  ArrowRight, 
  RefreshCw, 
  Clock, 
  Info, 
  CheckCircle2, 
  AlertTriangle, 
  ArrowLeft, 
  ShieldCheck,
  TrendingUp,
  DollarSign,
  HelpCircle
} from 'lucide-react';

interface TransferPreprocessReviewProps {
  senderCurrency?: string;
  receiverCurrency?: string;
  sendAmount?: number;
  receiveAmount?: number;
  exchangeRate?: number;
  transferFee?: number;
  rateValiditySeconds?: number;
  onConfirm?: () => void;
  onCancel?: () => void;
  onRateRefresh?: () => Promise<{ exchangeRate: number; receiveAmount: number }>;
}

export default function TransferPreprocessReview({
  senderCurrency = 'USD',
  receiverCurrency = 'EUR',
  sendAmount = 1000.00,
  receiveAmount = 915.50,
  exchangeRate = 0.9155,
  transferFee = 3.50,
  rateValiditySeconds = 30,
  onConfirm = () => alert('Transfer Confirmed!'),
  onCancel = () => alert('Transfer Cancelled'),
  onRateRefresh
}: TransferPreprocessReviewProps) {
  // State Management
  const [timeLeft, setTimeLeft] = useState(rateValiditySeconds);
  const [isExpired, setIsExpired] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [currentRate, setCurrentRate] = useState(exchangeRate);
  const [currentReceiveAmount, setCurrentReceiveAmount] = useState(receiveAmount);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Start Countdown Timer
  const startTimer = useCallback(() => {
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeLeft(rateValiditySeconds);
    setIsExpired(false);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          if (timerRef.current) clearInterval(timerRef.current);
          setIsExpired(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }, [rateValiditySeconds]);

  useEffect(() => {
    startTimer();
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [startTimer]);

  // Handle Rate Refresh
  const handleRefresh = async () => {
    setIsRefreshing(true);
    try {
      if (onRateRefresh) {
        const data = await onRateRefresh();
        setCurrentRate(data.exchangeRate);
        setCurrentReceiveAmount(data.receiveAmount);
      } else {
        // Simulate API call for refreshing rate
        await new Promise((resolve) => setTimeout(resolve, 1200));
        const fluctuation = (Math.random() - 0.5) * 0.01;
        const newRate = parseFloat((exchangeRate + fluctuation).toFixed(4));
        setCurrentRate(newRate);
        setCurrentReceiveAmount(parseFloat(((sendAmount - transferFee) * newRate).toFixed(2)));
      }
      startTimer();
    } catch (error) {
      console.error('Failed to refresh rate', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Handle Confirm Submit
  const handleConfirm = async () => {
    if (isExpired) return;
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1500));
      onConfirm();
    } catch (error) {
      console.error(error);
    } finally {
      setIsSubmitting(false);
    }
  };

  // Circular Progress Calculations
  const radius = 18;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (timeLeft / rateValiditySeconds) * circumference;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 md:p-8 selection:bg-indigo-500 selection:text-white">
      <div className="w-full max-w-xl bg-slate-900/80 backdrop-blur-xl border border-slate-800 rounded-3xl shadow-2xl overflow-hidden relative">
        
        {/* Decorative Background Glows */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

        {/* Header */}
        <div className="p-6 md:p-8 border-b border-slate-800/60 flex items-center justify-between">
          <button 
            onClick={onCancel}
            className="flex items-center gap-2 text-sm text-slate-400 hover:text-slate-200 transition-colors group"
          >
            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
            Back
          </button>
          <div className="flex items-center gap-2 bg-slate-800/40 px-3 py-1.5 rounded-full border border-slate-700/50">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">Secure Review</span>
          </div>
        </div>

        {/* Main Content */}
        <div className="p-6 md:p-8 space-y-6">
          
          {/* Title & Subtitle */}
          <div className="text-center space-y-1">
            <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Review Your Transfer
            </h2>
            <p className="text-sm text-slate-400">
              Verify your transaction details before confirming your transfer.
            </p>
          </div>

          {/* Conversion Visual Card */}
          <div className="bg-slate-950/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between relative overflow-hidden">
            <div className="space-y-1">
              <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">You Send</span>
              <div className="flex items-baseline gap-1.5">
                <span className="text-2xl font-bold text-white">{sendAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-sm font-semibold text-slate-400">{senderCurrency}</span>
              </div>
            </div>

            <div className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-800 border border-slate-700 text-indigo-400 shadow-lg z-10">
              <ArrowRight className="w-5 h-5" />
            </div>

            <div className="space-y-1 text-right">
              <span className="text-xs font-semibold text-emerald-400 uppercase tracking-wider">They Receive</span>
              <div className="flex items-baseline gap-1.5 justify-end">
                <span className="text-2xl font-bold text-white">{currentReceiveAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                <span className="text-sm font-semibold text-slate-400">{receiverCurrency}</span>
              </div>
            </div>
          </div>

          {/* Detailed Breakdown */}
          <div className="space-y-3.5">
            <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider px-1">Transaction Breakdown</h3>
            
            <div className="bg-slate-950/40 border border-slate-800/50 rounded-2xl p-5 space-y-4">
              
              {/* Send Amount Row */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  Source Amount
                  <button 
                    onMouseEnter={() => setShowTooltip('source')}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </span>
                <span className="font-medium text-slate-200">
                  {sendAmount.toFixed(2)} {senderCurrency}
                </span>
              </div>

              {/* Fee Row */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  Transfer Fee
                  <button 
                    onMouseEnter={() => setShowTooltip('fee')}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </span>
                <span className="font-medium text-slate-200">
                  {transferFee > 0 ? `${transferFee.toFixed(2)} ${senderCurrency}` : 'Free'}
                </span>
              </div>

              {/* Divider */}
              <div className="border-t border-slate-800/60 my-2" />

              {/* Exchange Rate Row with Countdown */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400 flex items-center gap-1.5">
                  Guaranteed Rate
                  <button 
                    onMouseEnter={() => setShowTooltip('rate')}
                    onMouseLeave={() => setShowTooltip(null)}
                    className="text-slate-500 hover:text-slate-300 transition-colors"
                  >
                    <HelpCircle className="w-3.5 h-3.5" />
                  </button>
                </span>
                
                <div className="flex items-center gap-2.5">
                  <span className={`font-mono font-semibold transition-colors ${isExpired ? 'text-rose-400 line-through' : 'text-emerald-400'}`}>
                    1 {senderCurrency} = {currentRate} {receiverCurrency}
                  </span>

                  {/* Countdown Timer Circle */}
                  {!isExpired && (
                    <div className="relative w-6 h-6 flex items-center justify-center" title={`${timeLeft}s remaining`}>
                      <svg className="w-full h-full transform -rotate-90">
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          className="stroke-slate-800 fill-none"
                          strokeWidth="2"
                        />
                        <circle
                          cx="12"
                          cy="12"
                          r={radius}
                          className="stroke-indigo-500 fill-none transition-all duration-1000 ease-linear"
                          strokeWidth="2"
                          strokeDasharray={circumference}
                          strokeDashoffset={strokeDashoffset}
                        />
                      </svg>
                      <span className="absolute text-[9px] font-bold text-slate-300">{timeLeft}</span>
                    </div>
                  )}
                </div>
              </div>

              {/* Total to Convert Row */}
              <div className="flex justify-between items-center text-sm">
                <span className="text-slate-400">Amount Converted</span>
                <span className="font-medium text-slate-200">
                  {(sendAmount - transferFee).toFixed(2)} {senderCurrency}
                </span>
              </div>

            </div>
          </div>

          {/* Tooltip Display Area */}
          {showTooltip && (
            <div className="bg-indigo-950/40 border border-indigo-800/30 rounded-xl p-3 text-xs text-indigo-200 transition-all duration-200">
              {showTooltip === 'source' && "The total amount debited from your funding source."}
              {showTooltip === 'fee' && "Our transparent flat fee to process this transaction. No hidden markups."}
              {showTooltip === 'rate' && "The real-time mid-market exchange rate locked in for your transfer."}
            </div>
          )}

          {/* Expiration Warning Banner */}
          {isExpired && (
            <div className="bg-rose-950/30 border border-rose-900/40 rounded-2xl p-4 flex items-start gap-3 animate-pulse">
              <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
              <div className="space-y-1">
                <h4 className="text-sm font-semibold text-rose-200">Exchange Rate Expired</h4>
                <p className="text-xs text-rose-300/80 leading-relaxed">
                  The guaranteed rate has expired due to market volatility. Please refresh the rate to proceed with your transfer.
                </p>
              </div>
            </div>
          )}

          {/* Rate Validity Info */}
          {!isExpired && (
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 bg-slate-950/30 py-2.5 rounded-xl border border-slate-800/40">
              <Clock className="w-3.5 h-3.5 text-indigo-400" />
              <span>Rate guaranteed for {timeLeft} more seconds</span>
            </div>
          )}

        </div>

        {/* Footer Actions */}
        <div className="p-6 md:p-8 bg-slate-950/40 border-t border-slate-800/60 flex flex-col sm:flex-row gap-3">
          <button
            onClick={onCancel}
            disabled={isSubmitting || isRefreshing}
            className="w-full sm:w-1/3 py-3.5 px-4 rounded-2xl border border-slate-800 text-slate-300 font-semibold text-sm hover:bg-slate-900 hover:text-white transition-all disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Cancel
          </button>

          {isExpired ? (
            <button
              onClick={handleRefresh}
              disabled={isRefreshing}
              className="w-full sm:w-2/3 py-3.5 px-4 rounded-2xl bg-indigo-600 hover:bg-indigo-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-80"
            >
              <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
              {isRefreshing ? 'Fetching Latest Rate...' : 'Refresh Exchange Rate'}
            </button>
          ) : (
            <button
              onClick={handleConfirm}
              disabled={isSubmitting || isRefreshing}
              className="w-full sm:w-2/3 py-3.5 px-4 rounded-2xl bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold text-sm transition-all shadow-lg shadow-indigo-600/20 flex items-center justify-center gap-2 disabled:opacity-80 disabled:cursor-not-allowed"
            >
              {isSubmitting ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Processing Transfer...
                </>
              ) : (
                <>
                  <CheckCircle2 className="w-4 h-4" />
                  Confirm & Send Money
                </>
              )}
            </button>
          )}
        </div>

      </div>
    </div>
  );
}