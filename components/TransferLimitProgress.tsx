import React, { useState, useMemo } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  Info, 
  ArrowUpRight, 
  ShieldAlert, 
  HelpCircle,
  TrendingUp,
  Sliders,
  Zap
} from 'lucide-react';

export interface LimitDetail {
  used: number;
  limit: number;
  label: string;
  description: string;
  errorCode: string;
}

export interface TransferLimitProgressProps {
  dailyUsed?: number;
  dailyLimit?: number;
  monthlyUsed?: number;
  monthlyLimit?: number;
  fastUsed?: number;
  fastLimit?: number;
  currency?: string;
  warningThreshold?: number; // e.g., 0.85 for 85%
  onIncreaseLimitClick?: (limitType: 'daily' | 'monthly' | 'fast') => void;
  className?: string;
}

export const TransferLimitProgress: React.FC<TransferLimitProgressProps> = ({
  dailyUsed = 4250,
  dailyLimit = 5000,
  monthlyUsed = 12800,
  monthlyLimit = 15000,
  fastUsed = 1800,
  fastLimit = 2000,
  currency = 'USD',
  warningThreshold = 0.85,
  onIncreaseLimitClick,
  className = '',
}) => {
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0,
    }).format(value);
  };

  const limitsData = useMemo(() => {
    return [
      {
        id: 'daily' as const,
        label: 'Daily Transfer Limit',
        used: dailyUsed,
        limit: dailyLimit,
        description: 'Resets daily at 00:00 UTC. Applies to all outgoing transfers.',
        errorCode: 'dailyTransactionAmountLimitReached',
        icon: TrendingUp,
      },
      {
        id: 'monthly' as const,
        label: 'Monthly Transfer Limit',
        used: monthlyUsed,
        limit: monthlyLimit,
        description: 'Resets on the 1st of every calendar month.',
        errorCode: 'monthlyTransactionAmountLimitReached',
        icon: Sliders,
      },
      {
        id: 'fast' as const,
        label: 'FAST Transfer Limit',
        used: fastUsed,
        limit: fastLimit,
        description: 'Specific limit for Fast and Secure Transfers network.',
        errorCode: 'fastTransactionAmountLimitReached',
        icon: Zap,
      }
    ];
  }, [dailyUsed, dailyLimit, monthlyUsed, monthlyLimit, fastUsed, fastLimit]);

  // Calculate status and warnings
  const processedLimits = useMemo(() => {
    return limitsData.map((item) => {
      const percentage = item.limit > 0 ? (item.used / item.limit) * 100 : 0;
      const ratio = item.limit > 0 ? item.used / item.limit : 0;
      const isExceeded = ratio >= 1;
      const isNearLimit = ratio >= warningThreshold && ratio < 1;
      
      let statusColor = 'bg-emerald-500';
      let textColor = 'text-emerald-600 dark:text-emerald-400';
      let progressBg = 'bg-emerald-100 dark:bg-emerald-950/30';
      
      if (isExceeded) {
        statusColor = 'bg-rose-500';
        textColor = 'text-rose-600 dark:text-rose-400';
        progressBg = 'bg-rose-100 dark:bg-rose-950/30';
      } else if (isNearLimit) {
        statusColor = 'bg-amber-500';
        textColor = 'text-amber-600 dark:text-amber-400';
        progressBg = 'bg-amber-100 dark:bg-amber-950/30';
      }

      return {
        ...item,
        percentage: Math.min(percentage, 100),
        rawPercentage: percentage,
        isExceeded,
        isNearLimit,
        statusColor,
        textColor,
        progressBg,
      };
    });
  }, [limitsData, warningThreshold]);

  const criticalLimits = processedLimits.filter(l => l.isExceeded || l.isNearLimit);

  return (
    <div className={`w-full max-w-2xl bg-white dark:bg-slate-900 rounded-2xl border border-slate-100 dark:border-slate-800 shadow-sm overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="p-6 border-b border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-900 dark:text-white flex items-center gap-2">
            <span>Transfer Limits</span>
            <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-blue-50 dark:bg-blue-950/40 text-blue-600 dark:text-blue-400 border border-blue-100 dark:border-blue-900/30">
              Secure
            </span>
          </h3>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            Monitor your real-time transaction limits to prevent transfer failures.
          </p>
        </div>
        <div className="flex items-center gap-1.5 text-xs text-slate-400 dark:text-slate-500">
          <ShieldAlert className="w-4 h-4 text-slate-400" />
          <span>Bank-grade security limits</span>
        </div>
      </div>

      {/* Warning Banner if close to or exceeded limits */}
      {criticalLimits.length > 0 && (
        <div className="px-6 pt-4">
          <div className="p-4 rounded-xl bg-amber-50 dark:bg-amber-950/20 border border-amber-100 dark:border-amber-900/30 flex gap-3">
            <AlertTriangle className="w-5 h-5 text-amber-600 dark:text-amber-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold text-amber-900 dark:text-amber-300">
                Approaching or Exceeded Transfer Limits
              </h4>
              <div className="mt-1 text-xs text-amber-700 dark:text-amber-400 space-y-1">
                {criticalLimits.map((limit) => (
                  <p key={limit.id}>
                    {limit.isExceeded ? (
                      <span>
                        <strong>Critical:</strong> You have reached your {limit.label.toLowerCase()}. Future transfers will trigger a <code className="bg-amber-100 dark:bg-amber-900/40 px-1 py-0.5 rounded font-mono text-[10px]">{limit.errorCode}</code> error.
                      </span>
                    ) : (
                      <span>
                        <strong>Warning:</strong> You have utilized {limit.percentage.toFixed(0)}% of your {limit.label.toLowerCase()}.
                      </span>
                    )}
                  </p>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Limits Progress Bars */}
      <div className="p-6 space-y-6">
        {processedLimits.map((limit) => {
          const IconComponent = limit.icon;
          return (
            <div key={limit.id} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className={`p-1.5 rounded-lg ${limit.progressBg} ${limit.textColor}`}>
                    <IconComponent className="w-4 h-4" />
                  </div>
                  <span className="text-sm font-medium text-slate-700 dark:text-slate-300">
                    {limit.label}
                  </span>
                  <div className="relative">
                    <button
                      onMouseEnter={() => setActiveTooltip(limit.id)}
                      onMouseLeave={() => setActiveTooltip(null)}
                      onClick={() => setActiveTooltip(activeTooltip === limit.id ? null : limit.id)}
                      className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                      aria-label="Limit information"
                    >
                      <HelpCircle className="w-3.5 h-3.5" />
                    </button>
                    {activeTooltip === limit.id && (
                      <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-64 p-3 bg-slate-950 text-white text-xs rounded-lg shadow-xl z-10 leading-relaxed">
                        <p className="font-semibold mb-1">{limit.label}</p>
                        <p className="text-slate-300 mb-2">{limit.description}</p>
                        <div className="border-t border-slate-800 pt-1.5 mt-1.5 text-[10px] text-slate-400">
                          System Code: <code className="font-mono text-amber-400">{limit.errorCode}</code>
                        </div>
                        <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-950" />
                      </div>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-sm font-semibold text-slate-900 dark:text-white">
                    {formatCurrency(limit.used)}
                  </span>
                  <span className="text-xs text-slate-400 dark:text-slate-500">
                    {' '}of {formatCurrency(limit.limit)}
                  </span>
                </div>
              </div>

              {/* Progress Bar Track */}
              <div className="h-2.5 w-full bg-slate-100 dark:bg-slate-800 rounded-full overflow-hidden relative">
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-out ${limit.statusColor}`}
                  style={{ width: `${limit.percentage}%` }}
                />
              </div>

              {/* Status Indicator & Action */}
              <div className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-1">
                  {limit.isExceeded ? (
                    <span className="flex items-center gap-1 text-rose-600 dark:text-rose-400 font-medium">
                      <ShieldAlert className="w-3.5 h-3.5" /> Limit Exceeded
                    </span>
                  ) : limit.isNearLimit ? (
                    <span className="flex items-center gap-1 text-amber-600 dark:text-amber-400 font-medium">
                      <AlertTriangle className="w-3.5 h-3.5" /> Near Limit ({limit.percentage.toFixed(0)}%)
                    </span>
                  ) : (
                    <span className="flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-medium">
                      <CheckCircle2 className="w-3.5 h-3.5" /> Safe ({limit.percentage.toFixed(0)}% used)
                    </span>
                  )}
                </div>

                {onIncreaseLimitClick && (
                  <button
                    onClick={() => onIncreaseLimitClick(limit.id)}
                    className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium flex items-center gap-0.5 transition-colors"
                  >
                    Request Increase
                    <ArrowUpRight className="w-3 h-3" />
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer Info */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-950/40 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <Info className="w-4 h-4 text-slate-400 shrink-0" />
          <span>Limits are evaluated in real-time before processing transactions.</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="h-1.5 w-1.5 rounded-full bg-emerald-500" />
          <span className="text-xs text-slate-500 dark:text-slate-400">All systems operational</span>
        </div>
      </div>
    </div>
  );
};