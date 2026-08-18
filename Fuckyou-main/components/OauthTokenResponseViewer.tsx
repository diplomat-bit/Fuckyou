import React, { useState, useEffect, useRef } from 'react';
import { 
  Copy, 
  Check, 
  Clock, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Database, 
  Key, 
  Shield, 
  Trash2, 
  Code, 
  Layers,
  AlertCircle
} from 'lucide-react';

export interface TokenEndpointResponse {
  access_token: string;
  expires_in: number;
  token_type?: string;
  scope?: string;
  refresh_token?: string;
  id_token?: string;
  [key: string]: any;
}

export interface OauthTokenResponseViewerProps {
  response: TokenEndpointResponse;
  onRefresh?: () => Promise<void> | void;
  onClear?: () => void;
  className?: string;
}

export default function OauthTokenResponseViewer({
  response,
  onRefresh,
  onClear,
  className = '',
}: OauthTokenResponseViewerProps) {
  const { access_token, expires_in, token_type, scope, refresh_token, id_token } = response;

  const [timeLeft, setTimeLeft] = useState<number>(expires_in);
  const [copiedField, setCopiedField] = useState<string | null>(null);
  const [showAccessToken, setShowAccessToken] = useState<boolean>(false);
  const [showRefreshToken, setShowRefreshToken] = useState<boolean>(false);
  const [showIdToken, setShowIdToken] = useState<boolean>(false);
  const [viewMode, setViewMode] = useState<'structured' | 'json'>('structured');
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);

  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Reset and start countdown when expires_in or access_token changes
  useEffect(() => {
    setTimeLeft(expires_in);

    if (timerRef.current) {
      clearInterval(timerRef.current);
    }

    if (expires_in > 0) {
      timerRef.current = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            if (timerRef.current) clearInterval(timerRef.current);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [expires_in, access_token]);

  const handleCopy = async (text: string, fieldName: string) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedField(fieldName);
      setTimeout(() => setCopiedField(null), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  const handleRefreshClick = async () => {
    if (!onRefresh || isRefreshing) return;
    setIsRefreshing(true);
    try {
      await onRefresh();
    } catch (error) {
      console.error('Failed to refresh token:', error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Format seconds to HH:MM:SS or MM:SS
  const formatTime = (seconds: number) => {
    if (seconds <= 0) return 'Expired';
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;

    const parts = [];
    if (h > 0) parts.push(h.toString().padStart(2, '0'));
    parts.push(m.toString().padStart(2, '0'));
    parts.push(s.toString().padStart(2, '0'));

    return parts.join(':');
  };

  const expirationPercentage = expires_in > 0 ? (timeLeft / expires_in) * 100 : 0;
  const isExpired = timeLeft <= 0;

  // Determine progress bar color
  const getProgressBarColor = () => {
    if (isExpired) return 'bg-rose-500';
    if (expirationPercentage < 15) return 'bg-rose-500 animate-pulse';
    if (expirationPercentage < 40) return 'bg-amber-500';
    return 'bg-emerald-500';
  };

  // Determine status badge color
  const getStatusBadge = () => {
    if (isExpired) {
      return (
        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/10 text-rose-400 border border-rose-500/20">
          <AlertCircle className="w-3.5 h-3.5" />
          Expired
        </span>
      );
    }
    return (
      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
        Active
      </span>
    );
  };

  return (
    <div className={`w-full max-w-4xl mx-auto bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden text-slate-100 ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-800 bg-slate-950/50 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg border border-indigo-500/20">
            <Shield className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-lg font-semibold text-white">OAuth Token Response</h3>
            <p className="text-xs text-slate-400">Inspect, monitor, and manage your active session tokens</p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto">
          {getStatusBadge()}
          
          <div className="h-4 w-px bg-slate-800 mx-1 hidden sm:block" />

          <div className="flex bg-slate-950 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('structured')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'structured'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Structured
            </button>
            <button
              onClick={() => setViewMode('json')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                viewMode === 'json'
                  ? 'bg-slate-800 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Code className="w-3.5 h-3.5" />
              Raw JSON
            </button>
          </div>
        </div>
      </div>

      {/* Countdown Timer Bar */}
      {expires_in > 0 && (
        <div className="w-full bg-slate-950 h-1.5 relative overflow-hidden">
          <div 
            className={`h-full transition-all duration-1000 ease-linear ${getProgressBarColor()}`}
            style={{ width: `${expirationPercentage}%` }}
          />
        </div>
      )}

      {/* Main Content Area */}
      <div className="p-6">
        {viewMode === 'structured' ? (
          <div className="space-y-6">
            {/* Top Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {/* Expiration Card */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 bg-amber-500/10 text-amber-400 rounded-lg">
                    <Clock className="w-5 h-5" />
                  </div>
                  <div>
                    <span className="text-xs text-slate-400 block">Time Remaining</span>
                    <span className={`text-lg font-mono font-bold ${isExpired ? 'text-rose-400' : 'text-white'}`}>
                      {formatTime(timeLeft)}
                    </span>
                  </div>
                </div>
                <span className="text-xs text-slate-500 font-mono">
                  of {expires_in}s
                </span>
              </div>

              {/* Token Type Card */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-blue-500/10 text-blue-400 rounded-lg">
                  <Key className="w-5 h-5" />
                </div>
                <div>
                  <span className="text-xs text-slate-400 block">Token Type</span>
                  <span className="text-lg font-semibold text-white capitalize">
                    {token_type || 'Bearer'}
                  </span>
                </div>
              </div>

              {/* Scope Card */}
              <div className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 flex items-center gap-3">
                <div className="p-2.5 bg-purple-500/10 text-purple-400 rounded-lg">
                  <Database className="w-5 h-5" />
                </div>
                <div className="overflow-hidden w-full">
                  <span className="text-xs text-slate-400 block">Granted Scope</span>
                  <span className="text-sm font-medium text-white block truncate" title={scope || 'No scopes requested'}>
                    {scope || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            {/* Token Fields */}
            <div className="space-y-4">
              {/* Access Token Field */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Access Token</label>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setShowAccessToken(!showAccessToken)}
                      className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                      title={showAccessToken ? "Hide Token" : "Show Token"}
                    >
                      {showAccessToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                    <button
                      onClick={() => handleCopy(access_token, 'access_token')}
                      className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
                    >
                      {copiedField === 'access_token' ? (
                        <>
                          <Check className="w-3.5 h-3.5 text-emerald-400" />
                          <span className="text-emerald-400">Copied</span>
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copy</span>
                        </>
                      )}
                    </button>
                  </div>
                </div>
                <div className="relative">
                  <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-sm text-slate-300 break-all min-h-[54px] flex items-center">
                    {showAccessToken ? (
                      access_token
                    ) : (
                      <span className="tracking-widest text-slate-600 select-none">
                        ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* ID Token Field (Optional) */}
              {id_token && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">ID Token (OIDC)</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowIdToken(!showIdToken)}
                        className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                        title={showIdToken ? "Hide Token" : "Show Token"}
                      >
                        {showIdToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(id_token, 'id_token')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
                      >
                        {copiedField === 'id_token' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-sm text-slate-300 break-all min-h-[54px] flex items-center">
                      {showIdToken ? (
                        id_token
                      ) : (
                        <span className="tracking-widest text-slate-600 select-none">
                          ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Refresh Token Field (Optional) */}
              {refresh_token && (
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Refresh Token</label>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => setShowRefreshToken(!showRefreshToken)}
                        className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                        title={showRefreshToken ? "Hide Token" : "Show Token"}
                      >
                        {showRefreshToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                      <button
                        onClick={() => handleCopy(refresh_token, 'refresh_token')}
                        className="flex items-center gap-1 px-2 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
                      >
                        {copiedField === 'refresh_token' ? (
                          <>
                            <Check className="w-3.5 h-3.5 text-emerald-400" />
                            <span className="text-emerald-400">Copied</span>
                          </>
                        ) : (
                          <>
                            <Copy className="w-3.5 h-3.5" />
                            <span>Copy</span>
                          </>
                        )}
                      </button>
                    </div>
                  </div>
                  <div className="relative">
                    <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3.5 font-mono text-sm text-slate-300 break-all min-h-[54px] flex items-center">
                      {showRefreshToken ? (
                        refresh_token
                      ) : (
                        <span className="tracking-widest text-slate-600 select-none">
                          ••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••••
                        </span>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        ) : (
          /* Raw JSON View */
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300 uppercase tracking-wider">Raw Response Payload</span>
              <button
                onClick={() => handleCopy(JSON.stringify(response, null, 2), 'raw_json')}
                className="flex items-center gap-1 px-2.5 py-1 text-xs text-slate-400 hover:text-slate-200 hover:bg-slate-800 rounded transition-all"
              >
                {copiedField === 'raw_json' ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-400" />
                    <span className="text-emerald-400">Copied Payload</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy JSON</span>
                  </>
                )}
              </button>
            </div>
            <pre className="w-full bg-slate-950 border border-slate-800 rounded-xl p-4 font-mono text-xs text-indigo-300 overflow-x-auto max-h-[350px] scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent">
              {JSON.stringify(response, null, 2)}
            </pre>
          </div>
        )}
      </div>

      {/* Footer Actions */}
      <div className="px-6 py-4 border-t border-slate-800 bg-slate-950/30 flex items-center justify-between gap-4">
        <div>
          {onClear && (
            <button
              onClick={onClear}
              className="flex items-center gap-1.5 px-3 py-2 text-xs font-medium text-rose-400 hover:text-rose-300 hover:bg-rose-500/10 rounded-lg transition-all"
            >
              <Trash2 className="w-4 h-4" />
              Clear Session
            </button>
          )}
        </div>

        {onRefresh && (
          <button
            onClick={handleRefreshClick}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-4 py-2 text-sm font-semibold text-white bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-600/50 disabled:cursor-not-allowed rounded-xl shadow-lg shadow-indigo-500/10 hover:shadow-indigo-500/20 transition-all"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin' : ''}`} />
            {isRefreshing ? 'Refreshing...' : 'Refresh Token'}
          </button>
        )}
      </div>
    </div>
  );
}