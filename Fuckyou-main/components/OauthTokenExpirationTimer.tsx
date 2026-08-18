import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { Clock, AlertTriangle, RefreshCw, CheckCircle, ShieldAlert } from 'lucide-react';

export interface OauthTokenExpirationTimerProps {
  /** The lifetime of the access token in seconds (e.g., 3600) */
  expiresIn: number;
  /** The timestamp when the token was issued/consented (ISO string, epoch milliseconds, or Date object) */
  consentedOn: string | number | Date;
  /** Threshold in seconds to trigger the warning state (defaults to 10% of expiresIn or 60s, whichever is larger) */
  warnThresholdSeconds?: number;
  /** Callback triggered when the token officially expires */
  onExpire?: () => void;
  /** Callback triggered when the user clicks the refresh button or auto-refresh is triggered */
  onRefresh?: () => Promise<void> | void;
  /** Whether to automatically trigger the onRefresh callback when warning threshold is reached */
  autoRefresh?: boolean;
  /** Custom class name for the container */
  className?: string;
}

export const OauthTokenExpirationTimer: React.FC<OauthTokenExpirationTimerProps> = ({
  expiresIn,
  consentedOn,
  warnThresholdSeconds,
  onExpire,
  onRefresh,
  autoRefresh = false,
  className = '',
}) => {
  const [timeLeft, setTimeLeft] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [hasExpiredTriggered, setHasExpiredTriggered] = useState<boolean>(false);
  const [hasRefreshTriggered, setHasRefreshTriggered] = useState<boolean>(false);

  // Parse consentedOn to a stable epoch timestamp
  const consentedTimeMs = useMemo(() => {
    if (!consentedOn) return Date.now();
    const parsed = new Date(consentedOn).getTime();
    return isNaN(parsed) ? Date.now() : parsed;
  }, [consentedOn]);

  // Calculate dynamic warning threshold
  const finalWarnThreshold = useMemo(() => {
    if (warnThresholdSeconds !== undefined) return warnThresholdSeconds;
    // Default to 10% of total lifetime, minimum 60 seconds (unless total lifetime is shorter)
    return Math.max(Math.min(expiresIn * 0.1, 300), Math.min(60, expiresIn));
  }, [expiresIn, warnThresholdSeconds]);

  // Calculate remaining time and update state
  const calculateTimeLeft = useCallback(() => {
    const now = Date.now();
    const elapsedSeconds = (now - consentedTimeMs) / 1000;
    const remaining = Math.max(0, expiresIn - elapsedSeconds);
    return Math.round(remaining);
  }, [consentedTimeMs, expiresIn]);

  // Initialize and run interval
  useEffect(() => {
    setTimeLeft(calculateTimeLeft());
    setHasExpiredTriggered(false);
    setHasRefreshTriggered(false);

    const interval = setInterval(() => {
      const remaining = calculateTimeLeft();
      setTimeLeft(remaining);

      // Handle expiration trigger
      if (remaining <= 0) {
        clearInterval(interval);
        if (onExpire && !hasExpiredTriggered) {
          onExpire();
          setHasExpiredTriggered(true);
        }
      }

      // Handle auto-refresh trigger
      if (
        autoRefresh &&
        onRefresh &&
        remaining <= finalWarnThreshold &&
        remaining > 0 &&
        !hasRefreshTriggered &&
        !isRefreshing
      ) {
        setHasRefreshTriggered(true);
        handleRefresh();
      }
    }, 1000);

    return () => clearInterval(interval);
  }, [calculateTimeLeft, finalWarnThreshold, autoRefresh, onRefresh, onExpire, hasExpiredTriggered, hasRefreshTriggered, isRefreshing]);

  const handleRefresh = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Failed to refresh OAuth token:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // UI Computations
  const percentageRemaining = Math.max(0, Math.min(100, (timeLeft / expiresIn) * 100));
  const isWarning = timeLeft <= finalWarnThreshold && timeLeft > 0;
  const isExpired = timeLeft <= 0;

  const formatTime = (seconds: number): string => {
    if (seconds <= 0) return '00:00';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = Math.floor(seconds % 60);

    const mStr = m.toString().padStart(2, '0');
    const sStr = s.toString().padStart(2, '0');

    if (h > 0) {
      return `${h}:${mStr}:${sStr}`;
    }
    return `${mStr}:${sStr}`;
  };

  // Determine color schemes based on status
  const getStatusColors = () => {
    if (isExpired) {
      return {
        bar: 'bg-rose-500',
        track: 'bg-rose-950/30',
        text: 'text-rose-500 dark:text-rose-400',
        border: 'border-rose-500/30',
        bg: 'bg-rose-500/5',
        badge: 'bg-rose-500/10 text-rose-500 border-rose-500/20',
      };
    }
    if (isWarning) {
      return {
        bar: 'bg-amber-500 animate-pulse',
        track: 'bg-amber-950/30',
        text: 'text-amber-500 dark:text-amber-400',
        border: 'border-amber-500/30',
        bg: 'bg-amber-500/5',
        badge: 'bg-amber-500/10 text-amber-500 border-amber-500/20',
      };
    }
    return {
      bar: 'bg-emerald-500',
      track: 'bg-emerald-950/30',
      text: 'text-emerald-500 dark:text-emerald-400',
      border: 'border-emerald-500/20',
      bg: 'bg-emerald-500/5',
      badge: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
    };
  };

  const colors = getStatusColors();

  return (
    <div
      className={`w-full max-w-md rounded-2xl border p-5 shadow-sm backdrop-blur-sm transition-all duration-300 ${colors.border} ${colors.bg} ${className}`}
    >
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2.5">
          <div className={`p-2 rounded-lg ${isExpired ? 'bg-rose-500/10' : isWarning ? 'bg-amber-500/10' : 'bg-emerald-500/10'}`}>
            {isExpired ? (
              <ShieldAlert className={`w-5 h-5 ${colors.text}`} />
            ) : isWarning ? (
              <AlertTriangle className={`w-5 h-5 ${colors.text}`} />
            ) : (
              <Clock className={`w-5 h-5 ${colors.text}`} />
            )}
          </div>
          <div>
            <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
              OAuth Session
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              {isExpired ? 'Token expired' : isWarning ? 'Expiring soon' : 'Token active'}
            </p>
          </div>
        </div>

        <span className={`text-xs font-medium px-2.5 py-1 rounded-full border ${colors.badge}`}>
          {isExpired ? 'Expired' : `${Math.round(percentageRemaining)}% left`}
        </span>
      </div>

      {/* Progress Bar */}
      <div className="relative w-full h-2.5 mb-4 rounded-full overflow-hidden bg-slate-100 dark:bg-slate-800">
        <div
          className={`h-full rounded-full transition-all duration-1000 ease-out ${colors.bar}`}
          style={{ width: `${percentageRemaining}%` }}
        />
      </div>

      {/* Timer & Action Row */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex flex-col">
          <span className="text-xs text-slate-400 dark:text-slate-500 uppercase tracking-wider font-semibold">
            Time Remaining
          </span>
          <span className={`text-2xl font-mono font-bold tracking-tight ${colors.text}`}>
            {formatTime(timeLeft)}
          </span>
        </div>

        {onRefresh && (
          <button
            onClick={handleRefresh}
            disabled={isRefreshing}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-medium transition-all duration-200 
              ${
                isWarning
                  ? 'bg-amber-500 hover:bg-amber-600 text-white shadow-lg shadow-amber-500/20'
                  : isExpired
                  ? 'bg-rose-500 hover:bg-rose-600 text-white shadow-lg shadow-rose-500/20'
                  : 'bg-slate-800 hover:bg-slate-900 dark:bg-slate-700 dark:hover:bg-slate-600 text-white'
              } 
              disabled:opacity-50 disabled:cursor-not-allowed active:scale-[0.98]`}
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
          </button>
        )}
      </div>

      {/* Warning Alert Banner */}
      {isWarning && !isExpired && (
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-amber-800 dark:text-amber-300 text-xs leading-relaxed">
          <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-amber-500" />
          <div>
            <span className="font-semibold">Security Warning:</span> Your session is about to expire. Save your work or refresh the token to prevent interruption.
          </div>
        </div>
      )}

      {/* Expired Alert Banner */}
      {isExpired && (
        <div className="mt-4 flex items-start gap-2.5 p-3 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-800 dark:text-rose-300 text-xs leading-relaxed">
          <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5 text-rose-500" />
          <div>
            <span className="font-semibold">Session Expired:</span> The access token has expired. Please refresh the token or re-authenticate to continue.
          </div>
        </div>
      )}
    </div>
  );
};