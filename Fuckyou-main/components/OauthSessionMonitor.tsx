import React, { useState, useEffect, useCallback, useRef } from 'react';
import { 
  Shield, 
  RefreshCw, 
  Clock, 
  Activity, 
  AlertTriangle, 
  CheckCircle2, 
  XCircle, 
  Trash2, 
  Play, 
  Pause, 
  Key, 
  Database,
  ArrowUpRight,
  Copy,
  Check
} from 'lucide-react';

// Types & Interfaces
interface LogEntry {
  id: string;
  timestamp: Date;
  event: string;
  status: 'success' | 'error' | 'info' | 'warning';
  details?: string;
}

interface TokenState {
  accessToken: string;
  refreshToken: string;
  expiresIn: number; // in seconds
  maxAge: number; // initial max age in seconds
}

export default function OauthSessionMonitor() {
  // Mock Initial Token State
  const INITIAL_MAX_AGE = 300; // 5 minutes
  const [token, setToken] = useState<TokenState>({
    accessToken: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyN1c2VySWQiOiJ1c3JfMGFORzNoSms4OSIsImV4cCI6MTcwOTMwOTYwMH0...",
    refreshToken: "rfr_9a8b7c6d5e4f3g2h1i0j_secure_refresh_token_active...",
    expiresIn: INITIAL_MAX_AGE,
    maxAge: INITIAL_MAX_AGE
  });

  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [shouldFailNext, setShouldFailNext] = useState<boolean>(false);
  const [copiedType, setCopiedType] = useState<'access' | 'refresh' | null>(null);
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 120000),
      event: 'OAuth Session Initialized',
      status: 'success',
      details: 'Successfully authenticated via Authorization Code Flow with PKCE.'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 119000),
      event: 'Token Exchange Completed',
      status: 'info',
      details: 'Access token and Refresh token stored securely in memory state.'
    }
  ]);

  // Ref to keep track of logs for callback access without re-binding
  const logsRef = useRef<LogEntry[]>(logs);
  useEffect(() => {
    logsRef.current = logs;
  }, [logs]);

  // Helper to add logs
  const addLog = useCallback((event: string, status: LogEntry['status'], details?: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date(),
      event,
      status,
      details
    };
    setLogs(prev => [newLog, ...prev]);
  }, []);

  // Token Refresh Logic
  const handleRefresh = useCallback(async (isManual = false) => {
    if (isRefreshing) return;
    setIsRefreshing(true);
    addLog(
      isManual ? 'Manual Token Refresh Triggered' : 'Automatic Token Refresh Triggered', 
      'info', 
      'Initiating POST /oauth/token with refresh_token grant...'
    );

    // Simulate network latency
    await new Promise(resolve => setTimeout(resolve, 1500));

    if (shouldFailNext) {
      addLog('Token Refresh Failed', 'error', 'API Error 401: Invalid or revoked refresh token.');
      setShouldFailNext(false);
      setIsRefreshing(false);
      // Force token to expire to show error state
      setToken(prev => ({ ...prev, expiresIn: 0 }));
    } else {
      const newAccessToken = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyN1c2VySWQiOiJ1c3JfMGFORzNoSms4OSIsImV4cCI6" + Math.floor(Date.now() / 1000 + INITIAL_MAX_AGE) + "}_" + Math.random().toString(36).substring(2, 7);
      setToken(prev => ({
        ...prev,
        accessToken: newAccessToken,
        expiresIn: INITIAL_MAX_AGE
      }));
      addLog('Token Refreshed Successfully', 'success', 'New access token issued. Session lifetime extended.');
      setIsRefreshing(false);
    }
  }, [isRefreshing, shouldFailNext, addLog]);

  // Countdown Timer & Auto-Refresh Trigger
  useEffect(() => {
    const interval = setInterval(() => {
      setToken(prev => {
        if (prev.expiresIn <= 1) {
          // Token expired
          if (isAutoRefresh && !isRefreshing) {
            // Trigger auto refresh
            handleRefresh(false);
            return prev;
          }
          return { ...prev, expiresIn: 0 };
        }
        
        // Trigger auto-refresh slightly before expiration (e.g., at 30 seconds remaining)
        if (isAutoRefresh && prev.expiresIn === 30 && !isRefreshing) {
          handleRefresh(false);
        }

        return { ...prev, expiresIn: prev.expiresIn - 1 };
      });
    }, 1000);

    return () => clearInterval(interval);
  }, [isAutoRefresh, isRefreshing, handleRefresh]);

  // Copy to Clipboard Helper
  const copyToClipboard = (text: string, type: 'access' | 'refresh') => {
    navigator.clipboard.writeText(text);
    setCopiedType(type);
    addLog(`Copied ${type === 'access' ? 'Access Token' : 'Refresh Token'} to clipboard`, 'info');
    setTimeout(() => setCopiedType(null), 2000);
  };

  // Force Expiry Simulation
  const simulateExpiry = () => {
    setToken(prev => ({ ...prev, expiresIn: 10 }));
    addLog('Simulated Token Expiration', 'warning', 'Token lifetime set to 10 seconds to test auto-refresh trigger.');
  };

  // Clear Logs
  const clearLogs = () => {
    setLogs([]);
  };

  // Calculate Health Status
  const getHealthStatus = () => {
    const percentage = (token.expiresIn / token.maxAge) * 100;
    if (token.expiresIn === 0) return { label: 'Expired', color: 'text-red-500 bg-red-500/10 border-red-500/20', barColor: 'bg-red-500' };
    if (percentage < 20) return { label: 'Critical', color: 'text-rose-500 bg-rose-500/10 border-rose-500/20 animate-pulse', barColor: 'bg-rose-500' };
    if (percentage < 50) return { label: 'Expiring Soon', color: 'text-amber-500 bg-amber-500/10 border-amber-500/20', barColor: 'bg-amber-500' };
    return { label: 'Healthy', color: 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20', barColor: 'bg-emerald-500' };
  };

  const health = getHealthStatus();
  const expirationPercentage = (token.expiresIn / token.maxAge) * 100;

  // Format time helper
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-950 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 font-sans">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 bg-slate-900/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-500/10 border border-indigo-500/20 rounded-xl text-indigo-400">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h2 className="text-lg font-semibold tracking-tight">OAuth Session Monitor</h2>
            <p className="text-xs text-slate-400">Real-time token health, lifecycle tracking, and refresh diagnostics</p>
          </div>
        </div>
        <div className="flex items-center gap-2 self-start sm:self-center">
          <span className="flex h-2 w-2 relative">
            <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${token.expiresIn > 0 ? 'bg-emerald-400' : 'bg-red-400'}`}></span>
            <span className={`relative inline-flex rounded-full h-2 w-2 ${token.expiresIn > 0 ? 'bg-emerald-500' : 'bg-red-500'}`}></span>
          </span>
          <span className="text-xs font-medium text-slate-300">
            {token.expiresIn > 0 ? 'Session Active' : 'Session Expired'}
          </span>
        </div>
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-0 divide-y lg:divide-y-0 lg:divide-x divide-slate-800">
        
        {/* Left Column: Token Health & Controls */}
        <div className="lg:col-span-7 p-6 space-y-6">
          
          {/* Token Health Card */}
          <div className="bg-slate-900/40 border border-slate-800/80 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <Activity className="w-4 h-4 text-indigo-400" />
                Token Health Status
              </div>
              <span className={`text-xs px-2.5 py-1 rounded-full border font-semibold tracking-wide uppercase ${health.color}`}>
                {health.label}
              </span>
            </div>

            {/* Progress Bar */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs text-slate-400">
                <span>Time Remaining</span>
                <span className="font-mono font-semibold text-slate-200">{formatTime(token.expiresIn)}</span>
              </div>
              <div className="w-full h-2.5 bg-slate-800 rounded-full overflow-hidden">
                <div 
                  className={`h-full transition-all duration-1000 ease-linear ${health.barColor}`}
                  style={{ width: `${expirationPercentage}%` }}
                />
              </div>
              <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                <span>0s (Expired)</span>
                <span>Trigger Threshold (30s)</span>
                <span>{token.maxAge}s (Max)</span>
              </div>
            </div>
          </div>

          {/* Token Details */}
          <div className="space-y-3">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Key className="w-3.5 h-3.5" /> Active Credentials
            </h3>
            
            {/* Access Token */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-3 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-slate-400 font-medium mb-1">Access Token (JWT)</div>
                <div className="font-mono text-xs text-slate-300 truncate bg-slate-950/50 px-2 py-1.5 rounded border border-slate-900">
                  {token.accessToken}
                </div>
              </div>
              <button 
                onClick={() => copyToClipboard(token.accessToken, 'access')}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                title="Copy Access Token"
              >
                {copiedType === 'access' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>

            {/* Refresh Token */}
            <div className="bg-slate-900/30 border border-slate-800/60 rounded-lg p-3 flex items-center justify-between gap-4">
              <div className="min-w-0 flex-1">
                <div className="text-[11px] text-slate-400 font-medium mb-1">Refresh Token</div>
                <div className="font-mono text-xs text-slate-300 truncate bg-slate-950/50 px-2 py-1.5 rounded border border-slate-900">
                  {token.refreshToken}
                </div>
              </div>
              <button 
                onClick={() => copyToClipboard(token.refreshToken, 'refresh')}
                className="p-2 hover:bg-slate-800 rounded-lg text-slate-400 hover:text-slate-200 transition-colors shrink-0"
                title="Copy Refresh Token"
              >
                {copiedType === 'refresh' ? <Check className="w-4 h-4 text-emerald-400" /> : <Copy className="w-4 h-4" />}
              </button>
            </div>
          </div>

          {/* Interactive Controls */}
          <div className="space-y-3 pt-2">
            <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5" /> Simulation Controls
            </h3>
            
            <div className="grid grid-cols-2 gap-3">
              {/* Auto Refresh Toggle */}
              <button
                onClick={() => {
                  setIsAutoRefresh(!isAutoRefresh);
                  addLog(
                    `Automatic Refresh ${!isAutoRefresh ? 'Enabled' : 'Disabled'}`, 
                    !isAutoRefresh ? 'success' : 'warning',
                    !isAutoRefresh ? 'The system will automatically request a new token 30s before expiry.' : 'Automatic background token renewal is paused.'
                  );
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  isAutoRefresh 
                    ? 'bg-indigo-500/10 border-indigo-500/30 text-indigo-300 hover:bg-indigo-500/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                {isAutoRefresh ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                {isAutoRefresh ? 'Pause Auto-Refresh' : 'Enable Auto-Refresh'}
              </button>

              {/* Force Refresh Button */}
              <button
                onClick={() => handleRefresh(true)}
                disabled={isRefreshing}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-all disabled:opacity-50"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
                Force Refresh
              </button>

              {/* Simulate Expiry */}
              <button
                onClick={simulateExpiry}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl bg-slate-900 border border-slate-800 hover:bg-slate-800 text-slate-200 text-xs font-medium transition-all"
              >
                <Clock className="w-4 h-4 text-amber-400" />
                Simulate Expiry (10s)
              </button>

              {/* Simulate Error Toggle */}
              <button
                onClick={() => {
                  setShouldFailNext(!shouldFailNext);
                  addLog(
                    `Simulate Next Refresh Failure: ${!shouldFailNext ? 'ON' : 'OFF'}`, 
                    !shouldFailNext ? 'warning' : 'info',
                    !shouldFailNext ? 'The next token refresh attempt will return a simulated 401 Unauthorized error.' : 'Refresh attempts will succeed normally.'
                  );
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-xs font-medium transition-all ${
                  shouldFailNext 
                    ? 'bg-rose-500/10 border-rose-500/30 text-rose-300 hover:bg-rose-500/20' 
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:bg-slate-800'
                }`}
              >
                <AlertTriangle className={`w-4 h-4 ${shouldFailNext ? 'text-rose-400' : 'text-slate-400'}`} />
                {shouldFailNext ? 'Cancel Error Sim' : 'Simulate Error'}
              </button>
            </div>
          </div>

        </div>

        {/* Right Column: Diagnostic Logs */}
        <div className="lg:col-span-5 p-6 flex flex-col h-[480px] lg:h-auto">
          <div className="flex items-center justify-between mb-4 shrink-0">
            <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
              <Activity className="w-4 h-4 text-indigo-400" />
              Diagnostic Logs
            </div>
            <button 
              onClick={clearLogs}
              className="flex items-center gap-1 text-xs text-slate-500 hover:text-slate-300 transition-colors"
              title="Clear Logs"
            >
              <Trash2 className="w-3.5 h-3.5" />
              Clear
            </button>
          </div>

          {/* Logs Container */}
          <div className="flex-1 overflow-y-auto space-y-3 pr-1 scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
            {logs.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 text-slate-500">
                <Database className="w-8 h-8 mb-2 opacity-20" />
                <p className="text-xs">No diagnostic logs recorded yet.</p>
              </div>
            ) : (
              logs.map((log) => {
                const statusIcons = {
                  success: <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />,
                  error: <XCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />,
                  warning: <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />,
                  info: <ArrowUpRight className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
                };

                return (
                  <div 
                    key={log.id} 
                    className="p-3 rounded-lg bg-slate-900/40 border border-slate-800/60 flex gap-3 text-xs transition-all hover:border-slate-800"
                  >
                    {statusIcons[log.status]}
                    <div className="space-y-1 min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2">
                        <span className="font-semibold text-slate-200 truncate">{log.event}</span>
                        <span className="text-[10px] text-slate-500 font-mono shrink-0">
                          {log.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </span>
                      </div>
                      {log.details && (
                        <p className="text-slate-400 text-[11px] leading-relaxed break-words">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* Footer Status Bar */}
      <div className="px-6 py-3 bg-slate-900/80 border-t border-slate-800 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 text-[11px] text-slate-400">
        <div className="flex items-center gap-4">
          <span>Grant Type: <strong className="text-slate-300">Authorization Code (PKCE)</strong></span>
          <span className="hidden sm:inline text-slate-700">|</span>
          <span>Token Type: <strong className="text-slate-300">Bearer</strong></span>
        </div>
        <div className="font-mono text-slate-500">
          v1.4.2-secure
        </div>
      </div>
    </div>
  );
}