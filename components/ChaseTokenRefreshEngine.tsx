

// --- CONSOLIDATED FROM: ./components/chase/ChaseTokenRefreshEngine.tsx ---

import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  Shield,
  Key,
  RefreshCw,
  Clock,
  Activity,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Copy,
  Lock,
  Flame,
  Zap,
  Server,
  Terminal,
  Cpu,
  Radio,
  Sliders,
  History,
  TrendingDown,
  ArrowRightLeft,
  Info
} from 'lucide-react';

interface TokenSession {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  scope: string;
  expiresInSec: number;
  remainingSec: number;
  issuedAt: number;
  expiresAt: number;
  kid: string;
  jti: string;
  generation: number;
  status: 'ACTIVE' | 'DEGRADED' | 'EXPIRED' | 'ROTATING' | 'REVOKED';
}

interface RotationLog {
  id: string;
  timestamp: string;
  event: 'AUTO_REFRESH' | 'MANUAL_REFRESH' | 'JITTER_BACKOFF' | 'ROTATION_FAIL' | 'REVOKE';
  previousJti: string;
  newJti: string;
  latencyMs: number;
  jitterOffsetMs: number;
  httpStatus: number;
  traceId: string;
}

interface EngineMetrics {
  totalRotations: number;
  successfulRotations: number;
  failedRotations: number;
  avgLatencyMs: number;
  jitterBackoffEvents: number;
  tokenDegradationAlerts: number;
}

export const ChaseTokenRefreshEngine: React.FC = () => {
  // Configurable sliders
  const [tokenTtlSeconds, setTokenTtlSeconds] = useState<number>(30);
  const [renewalWindowThresholdPct, setRenewalWindowThresholdPct] = useState<number>(25); // renew when remaining <= 25%
  const [enableJitter, setEnableJitter] = useState<boolean>(true);
  const [jitterRangeMs, setJitterRangeMs] = useState<number>(450);
  const [isEngineRunning, setIsEngineRunning] = useState<boolean>(true);
  const [simulatedFailureRate, setSimulatedFailureRate] = useState<number>(0);
  const [copiedField, setCopiedField] = useState<string | null>(null);

  // Engine state
  const [session, setSession] = useState<TokenSession>(() => {
    const now = Date.now();
    const ttl = 30;
    return {
      accessToken: `cctk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      refreshToken: `ccrf_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      tokenType: 'Bearer',
      scope: 'card loyalty:pwp:enrollment merchant:read',
      expiresInSec: ttl,
      remainingSec: ttl,
      issuedAt: now,
      expiresAt: now + ttl * 1000,
      kid: 'jpmc-cc-auth-2025-v1',
      jti: `jti_chase_${Math.random().toString(36).substring(2, 10)}`,
      generation: 1,
      status: 'ACTIVE',
    };
  });

  const [logs, setLogs] = useState<RotationLog[]>([]);
  const [metrics, setMetrics] = useState<EngineMetrics>({
    totalRotations: 0,
    successfulRotations: 0,
    failedRotations: 0,
    avgLatencyMs: 42,
    jitterBackoffEvents: 0,
    tokenDegradationAlerts: 0,
  });

  const [activeTab, setActiveTab] = useState<'monitor' | 'jwt' | 'telemetry' | 'config'>('monitor');
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const rotationLockRef = useRef<boolean>(false);

  // Helper: generate trace-id
  const generateTraceId = useCallback(() => {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  }, []);

  // Perform Token Refresh (POST /api/identity/auth/v1/oauth2/refresh)
  const executeRefreshToken = useCallback(async (isManual = false) => {
    if (rotationLockRef.current) return;
    rotationLockRef.current = true;
    setIsRotating(true);

    const startTime = performance.now();
    const traceId = generateTraceId();
    const prevJti = session.jti;
    const jitterMs = enableJitter ? Math.floor(Math.random() * jitterRangeMs) : 0;

    // Simulate jitter backoff delay
    if (jitterMs > 0) {
      await new Promise((resolve) => setTimeout(resolve, jitterMs));
    }

    // Network latency simulation
    const simulatedNetworkTime = 40 + Math.floor(Math.random() * 60);
    await new Promise((resolve) => setTimeout(resolve, simulatedNetworkTime));

    const totalLatency = Math.round(performance.now() - startTime);

    // Evaluate simulated network/server failure
    const isError = Math.random() * 100 < simulatedFailureRate;

    if (isError) {
      const failLog: RotationLog = {
        id: `log_${Date.now()}`,
        timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
        event: 'ROTATION_FAIL',
        previousJti: prevJti,
        newJti: 'FAILED_RETAIN_OLD',
        latencyMs: totalLatency,
        jitterOffsetMs: jitterMs,
        httpStatus: 503,
        traceId,
      };

      setLogs((prev) => [failLog, ...prev.slice(0, 49)]);
      setMetrics((prev) => ({
        ...prev,
        totalRotations: prev.totalRotations + 1,
        failedRotations: prev.failedRotations + 1,
        tokenDegradationAlerts: prev.tokenDegradationAlerts + 1,
      }));

      setSession((prev) => ({
        ...prev,
        status: 'DEGRADED',
      }));

      rotationLockRef.current = false;
      setIsRotating(false);
      return;
    }

    // Success response
    const now = Date.now();
    const newJti = `jti_chase_${Math.random().toString(36).substring(2, 10)}`;
    const newAccessToken = `cctk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;
    const newRefreshToken = `ccrf_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`;

    const successLog: RotationLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
      event: isManual ? 'MANUAL_REFRESH' : jitterMs > 200 ? 'JITTER_BACKOFF' : 'AUTO_REFRESH',
      previousJti: prevJti,
      newJti,
      latencyMs: totalLatency,
      jitterOffsetMs: jitterMs,
      httpStatus: 200,
      traceId,
    };

    setLogs((prev) => [successLog, ...prev.slice(0, 49)]);

    setMetrics((prev) => {
      const newTotal = prev.totalRotations + 1;
      const newSuccessful = prev.successfulRotations + 1;
      const newAvgLatency = Math.round((prev.avgLatencyMs * prev.totalRotations + totalLatency) / newTotal);
      return {
        ...prev,
        totalRotations: newTotal,
        successfulRotations: newSuccessful,
        avgLatencyMs: newAvgLatency,
        jitterBackoffEvents: jitterMs > 200 ? prev.jitterBackoffEvents + 1 : prev.jitterBackoffEvents,
      };
    });

    setSession({
      accessToken: newAccessToken,
      refreshToken: newRefreshToken,
      tokenType: 'Bearer',
      scope: 'card loyalty:pwp:enrollment merchant:read',
      expiresInSec: tokenTtlSeconds,
      remainingSec: tokenTtlSeconds,
      issuedAt: now,
      expiresAt: now + tokenTtlSeconds * 1000,
      kid: 'jpmc-cc-auth-2025-v1',
      jti: newJti,
      generation: session.generation + 1,
      status: 'ACTIVE',
    });

    rotationLockRef.current = false;
    setIsRotating(false);
  }, [enableJitter, jitterRangeMs, simulatedFailureRate, tokenTtlSeconds, session.jti, session.generation, generateTraceId]);

  // Main Heartbeat / Sliding Window Timer Engine
  useEffect(() => {
    if (!isEngineRunning) return;

    const interval = setInterval(() => {
      setSession((prev) => {
        if (prev.status === 'REVOKED') return prev;

        const now = Date.now();
        const diffMs = prev.expiresAt - now;
        const remaining = Math.max(0, Math.ceil(diffMs / 1000));

        const windowThresholdSec = (tokenTtlSeconds * renewalWindowThresholdPct) / 100;

        // Trigger Auto-Refresh when within renewal sliding window threshold
        if (remaining <= windowThresholdSec && prev.status !== 'ROTATING' && !rotationLockRef.current && remaining > 0) {
          executeRefreshToken(false);
        } else if (remaining === 0 && prev.status !== 'EXPIRED') {
          return {
            ...prev,
            remainingSec: 0,
            status: 'EXPIRED',
          };
        }

        return {
          ...prev,
          remainingSec: remaining,
        };
      });
    }, 500);

    return () => clearInterval(interval);
  }, [isEngineRunning, tokenTtlSeconds, renewalWindowThresholdPct, executeRefreshToken]);

  // Emergency Revoke Token
  const handleRevoke = () => {
    setSession((prev) => ({
      ...prev,
      status: 'REVOKED',
      remainingSec: 0,
    }));

    const revokeLog: RotationLog = {
      id: `log_${Date.now()}`,
      timestamp: new Date().toISOString().split('T')[1].slice(0, 12),
      event: 'REVOKE',
      previousJti: session.jti,
      newJti: 'NONE_REVOKED',
      latencyMs: 12,
      jitterOffsetMs: 0,
      httpStatus: 200,
      traceId: generateTraceId(),
    };

    setLogs((prev) => [revokeLog, ...prev.slice(0, 49)]);
  };

  // Reset & Re-Issue
  const handleResetSession = () => {
    const now = Date.now();
    setSession({
      accessToken: `cctk_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      refreshToken: `ccrf_${Math.random().toString(36).substring(2, 15)}_${Math.random().toString(36).substring(2, 15)}`,
      tokenType: 'Bearer',
      scope: 'card loyalty:pwp:enrollment merchant:read',
      expiresInSec: tokenTtlSeconds,
      remainingSec: tokenTtlSeconds,
      issuedAt: now,
      expiresAt: now + tokenTtlSeconds * 1000,
      kid: 'jpmc-cc-auth-2025-v1',
      jti: `jti_chase_${Math.random().toString(36).substring(2, 10)}`,
      generation: 1,
      status: 'ACTIVE',
    });
  };

  const copyToClipboard = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const remainingPercent = Math.max(0, Math.min(100, (session.remainingSec / tokenTtlSeconds) * 100));
  const isThresholdTriggered = session.remainingSec <= (tokenTtlSeconds * renewalWindowThresholdPct) / 100;

  return (
    <div className="w-full bg-[#0a0f1d] text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-[#0d2040] via-[#112d59] to-[#0a1b33] p-6 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-blue-600/20 border border-blue-500/40 rounded-xl text-blue-400 shadow-inner">
            <Shield className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Chase Auth Token Refresh Engine
                <span className="text-xs px-2 py-0.5 rounded-full bg-blue-900/60 text-blue-300 border border-blue-700/50">
                  v2.4 Enterprise
                </span>
              </h2>
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Sliding-Window Refresh Token Rotation (RTR) • OAuth2 POST /api/identity/auth/v1/oauth2/refresh
            </p>
          </div>
        </div>

        {/* Live Engine Status Indicator */}
        <div className="flex items-center gap-3">
          <div className="flex items-center space-x-2 bg-slate-900/80 px-3.5 py-1.5 rounded-lg border border-slate-700/70">
            <span className="relative flex h-2.5 w-2.5">
              {isEngineRunning && session.status === 'ACTIVE' && (
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              )}
              <span
                className={`relative inline-flex rounded-full h-2.5 w-2.5 ${
                  session.status === 'ACTIVE'
                    ? 'bg-emerald-500'
                    : session.status === 'DEGRADED'
                    ? 'bg-amber-500'
                    : session.status === 'REVOKED'
                    ? 'bg-rose-500'
                    : 'bg-slate-500'
                }`}
              ></span>
            </span>
            <span className="text-xs font-semibold uppercase tracking-wider text-slate-200">
              {session.status}
            </span>
          </div>

          <button
            onClick={() => setIsEngineRunning(!isEngineRunning)}
            className={`px-3 py-1.5 rounded-lg text-xs font-medium border transition-all ${
              isEngineRunning
                ? 'bg-amber-500/10 text-amber-300 border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500/10 text-emerald-300 border-emerald-500/30 hover:bg-emerald-500/20'
            }`}
          >
            {isEngineRunning ? 'Pause Engine' : 'Resume Engine'}
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-[#0d1326] px-6">
        {[
          { id: 'monitor', label: 'Real-Time RTR Monitor', icon: Activity },
          { id: 'jwt', label: 'Token Payload & Crypto Inspect', icon: Key },
          { id: 'telemetry', label: 'Rotation Audit Stream', icon: History },
          { id: 'config', label: 'Jitter & SLA Configuration', icon: Sliders },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-3.5 text-xs font-medium border-b-2 transition-colors ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {/* TAB 1: REAL-TIME MONITOR */}
        {activeTab === 'monitor' && (
          <div className="space-y-6">
            {/* Top Cards: Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Total Rotations</p>
                  <p className="text-2xl font-bold text-white mt-1">{metrics.totalRotations}</p>
                  <span className="text-[10px] text-emerald-400">Gen #{session.generation} Current</span>
                </div>
                <div className="p-3 bg-blue-900/20 text-blue-400 rounded-lg border border-blue-800/40">
                  <ArrowRightLeft className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Avg Roundtrip Latency</p>
                  <p className="text-2xl font-bold text-white mt-1">{metrics.avgLatencyMs} ms</p>
                  <span className="text-[10px] text-slate-400">TLS 1.3 + JPMC Edge</span>
                </div>
                <div className="p-3 bg-indigo-900/20 text-indigo-400 rounded-lg border border-indigo-800/40">
                  <Zap className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Jitter Dampening Events</p>
                  <p className="text-2xl font-bold text-white mt-1">{metrics.jitterBackoffEvents}</p>
                  <span className="text-[10px] text-purple-400">Anti-Thundering Herd</span>
                </div>
                <div className="p-3 bg-purple-900/20 text-purple-400 rounded-lg border border-purple-800/40">
                  <Radio className="w-5 h-5" />
                </div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 flex items-center justify-between">
                <div>
                  <p className="text-xs text-slate-400">Degradation Alerts</p>
                  <p className="text-2xl font-bold text-white mt-1">{metrics.tokenDegradationAlerts}</p>
                  <span className="text-[10px] text-amber-400">Circuit breaker healthy</span>
                </div>
                <div className="p-3 bg-amber-900/20 text-amber-400 rounded-lg border border-amber-800/40">
                  <AlertTriangle className="w-5 h-5" />
                </div>
              </div>
            </div>

            {/* Sliding Window Token Lifetime Visualizer */}
            <div className="bg-slate-900/90 rounded-xl p-6 border border-slate-800 space-y-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <div className="flex items-center space-x-2">
                  <Clock className="w-5 h-5 text-blue-400" />
                  <span className="text-sm font-semibold text-white">Sliding Window Token Lifecycle</span>
                  <span className="text-xs text-slate-400">({session.remainingSec}s / {tokenTtlSeconds}s remaining)</span>
                </div>
                <div className="flex items-center space-x-2">
                  {isThresholdTriggered && session.status === 'ACTIVE' && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-500/20 text-amber-300 border border-amber-500/30 animate-pulse">
                      <Flame className="w-3 h-3 text-amber-400" />
                      <span>Renewal Window Open ({renewalWindowThresholdPct}%)</span>
                    </span>
                  )}
                  {isRotating && (
                    <span className="inline-flex items-center space-x-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30">
                      <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
                      <span>Rotating Bearer Token...</span>
                    </span>
                  )}
                </div>
              </div>

              {/* Progress Track */}
              <div className="w-full bg-slate-950 rounded-full h-4 p-0.5 border border-slate-800 relative overflow-hidden">
                {/* Renewal Threshold Marker Line */}
                <div
                  className="absolute top-0 bottom-0 w-0.5 bg-amber-400/70 z-10"
                  style={{ left: `${renewalWindowThresholdPct}%` }}
                  title="Automated Rotation Trigger Threshold"
                ></div>
                <div
                  className={`h-full rounded-full transition-all duration-500 ease-linear ${
                    remainingPercent > 50
                      ? 'bg-gradient-to-r from-blue-600 to-emerald-500'
                      : remainingPercent > 20
                      ? 'bg-gradient-to-r from-amber-500 to-blue-500'
                      : 'bg-gradient-to-r from-rose-600 to-amber-500'
                  }`}
                  style={{ width: `${remainingPercent}%` }}
                />
              </div>

              <div className="flex justify-between text-[11px] text-slate-400">
                <span>0s (Expired)</span>
                <span className="text-amber-400 font-mono">Trigger Threshold: {Math.round((tokenTtlSeconds * renewalWindowThresholdPct) / 100)}s</span>
                <span>Max TTL: {tokenTtlSeconds}s</span>
              </div>
            </div>

            {/* Active Credentials & Tokens Display */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
              {/* Access Token Card */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Key className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold text-slate-200">Access Token (2-Legged Bearer)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(session.accessToken, 'access')}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedField === 'access' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-emerald-300 break-all select-all">
                  {session.accessToken}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>Scope: {session.scope}</span>
                  <span>Type: {session.tokenType}</span>
                </div>
              </div>

              {/* Refresh Token Card */}
              <div className="bg-slate-900/60 p-4 rounded-xl border border-slate-800 space-y-2">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <Lock className="w-4 h-4 text-blue-400" />
                    <span className="text-xs font-semibold text-slate-200">Refresh Token (Sliding Rotation Hash)</span>
                  </div>
                  <button
                    onClick={() => copyToClipboard(session.refreshToken, 'refresh')}
                    className="p-1 hover:bg-slate-800 text-slate-400 hover:text-white rounded transition-colors text-xs flex items-center gap-1"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    {copiedField === 'refresh' ? 'Copied' : 'Copy'}
                  </button>
                </div>
                <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 font-mono text-xs text-blue-300 break-all select-all">
                  {session.refreshToken}
                </div>
                <div className="flex justify-between text-[10px] text-slate-400">
                  <span>JTI ID: {session.jti}</span>
                  <span>KID: {session.kid}</span>
                </div>
              </div>
            </div>

            {/* Quick Action Controller */}
            <div className="flex flex-wrap items-center justify-between bg-slate-900/40 p-4 rounded-xl border border-slate-800 gap-3">
              <div className="flex items-center space-x-3">
                <button
                  onClick={() => executeRefreshToken(true)}
                  disabled={isRotating || session.status === 'REVOKED'}
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center space-x-2 shadow-lg shadow-blue-600/20 transition-all cursor-pointer"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                  <span>Force Manual Refresh</span>
                </button>

                <button
                  onClick={handleResetSession}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all cursor-pointer"
                >
                  Reset Session
                </button>
              </div>

              <button
                onClick={handleRevoke}
                disabled={session.status === 'REVOKED'}
                className="px-4 py-2 bg-rose-600/20 hover:bg-rose-600/30 text-rose-300 border border-rose-500/40 rounded-lg text-xs font-semibold flex items-center space-x-2 transition-all cursor-pointer disabled:opacity-40"
              >
                <XCircle className="w-3.5 h-3.5" />
                <span>Emergency Token Revoke</span>
              </button>
            </div>
          </div>
        )}

        {/* TAB 2: JWT PAYLOAD & CRYPTO INSPECT */}
        {activeTab === 'jwt' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
              {/* Header */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-rose-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-rose-400 uppercase tracking-wider">HEADER: Algorithm & Key</span>
                  <span className="text-[10px] text-slate-400 font-mono">RS256</span>
                </div>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-rose-300 overflow-x-auto">
{JSON.stringify(
  {
    alg: 'RS256',
    typ: 'JWT',
    kid: session.kid,
    iss: 'https://api.chase.com/ccoauth',
  },
  null,
  2
)}
                </pre>
              </div>

              {/* Payload */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-purple-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">PAYLOAD: Enterprise Claims</span>
                  <span className="text-[10px] text-slate-400 font-mono">2-Legged OAuth</span>
                </div>
                <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-purple-300 overflow-x-auto">
{JSON.stringify(
  {
    sub: 'partner-app-pwp-client-78912',
    aud: 'https://api.chase.com/card/loyalty',
    jti: session.jti,
    scope: session.scope,
    client_id: 'chase_partner_merchant_rel_01',
    iat: Math.floor(session.issuedAt / 1000),
    exp: Math.floor(session.expiresAt / 1000),
    rot_gen: session.generation,
  },
  null,
  2
)}
                </pre>
              </div>

              {/* Signature */}
              <div className="bg-slate-900/80 p-5 rounded-xl border border-blue-900/40 space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-blue-400 uppercase tracking-wider">SIGNATURE: Verified</span>
                  <span className="text-[10px] text-emerald-400 font-mono flex items-center gap-1">
                    <CheckCircle2 className="w-3 h-3" /> JPMC Root CA
                  </span>
                </div>
                <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 text-[11px] font-mono text-blue-300 break-all">
                  SHA256withRSA(
                    <br />
                    &nbsp;&nbsp;base64UrlEncode(header) + "." +<br />
                    &nbsp;&nbsp;base64UrlEncode(payload),
                    <br />
                    &nbsp;&nbsp;[Chase Enterprise Private Key]
                    <br />) = 8fa9bc3...e4210d
                </div>
                <div className="text-[10px] text-slate-400 flex items-center gap-1">
                  <Info className="w-3 h-3 text-blue-400" />
                  Complies with FFIEC / NIST 800-63B continuous auth.
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: TELEMETRY & AUDIT STREAM */}
        {activeTab === 'telemetry' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                  Real-Time Rotation & Back-off Audit Log
                </h3>
              </div>
              <span className="text-[10px] text-slate-400">Retaining last 50 events</span>
            </div>

            <div className="bg-slate-950 rounded-xl border border-slate-800 overflow-hidden">
              <div className="max-h-96 overflow-y-auto divide-y divide-slate-850">
                {logs.length === 0 ? (
                  <div className="p-8 text-center text-slate-500 text-xs">
                    No token rotation events recorded yet. Watch the sliding window countdown or click Force Manual Refresh.
                  </div>
                ) : (
                  logs.map((log) => (
                    <div key={log.id} className="p-3.5 text-xs font-mono flex flex-wrap items-center justify-between gap-2 hover:bg-slate-900/50">
                      <div className="flex items-center space-x-3">
                        <span className="text-slate-500 text-[11px]">{log.timestamp}</span>
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.event === 'AUTO_REFRESH'
                              ? 'bg-blue-900/40 text-blue-300 border border-blue-800/50'
                              : log.event === 'JITTER_BACKOFF'
                              ? 'bg-purple-900/40 text-purple-300 border border-purple-800/50'
                              : log.event === 'ROTATION_FAIL'
                              ? 'bg-rose-900/40 text-rose-300 border border-rose-800/50'
                              : log.event === 'REVOKE'
                              ? 'bg-red-900/40 text-red-300 border border-red-800/50'
                              : 'bg-emerald-900/40 text-emerald-300 border border-emerald-800/50'
                          }`}
                        >
                          {log.event}
                        </span>
                        <span className="text-slate-300">{log.previousJti.slice(0, 16)}... &rarr; {log.newJti.slice(0, 16)}...</span>
                      </div>

                      <div className="flex items-center space-x-4 text-[11px]">
                        {log.jitterOffsetMs > 0 && (
                          <span className="text-purple-400">Jitter: +{log.jitterOffsetMs}ms</span>
                        )}
                        <span className="text-slate-400">Latency: {log.latencyMs}ms</span>
                        <span
                          className={`px-1.5 py-0.2 rounded font-bold ${
                            log.httpStatus === 200 ? 'text-emerald-400 bg-emerald-950/40' : 'text-rose-400 bg-rose-950/40'
                          }`}
                        >
                          HTTP {log.httpStatus}
                        </span>
                        <span className="text-slate-500 text-[10px] hidden md:inline">trace: {log.traceId.slice(0, 8)}</span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: CONFIGURATION & SLA PARAMETERS */}
        {activeTab === 'config' && (
          <div className="space-y-6 max-w-2xl mx-auto">
            <div className="bg-slate-900/60 p-5 rounded-xl border border-slate-800 space-y-5">
              <h3 className="text-sm font-semibold text-white flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Token Sliding Window Engine Parameters
              </h3>

              {/* Slider 1: TTL */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Simulated Access Token TTL</span>
                  <span className="font-mono text-blue-400 font-bold">{tokenTtlSeconds} Seconds</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="120"
                  step="5"
                  value={tokenTtlSeconds}
                  onChange={(e) => setTokenTtlSeconds(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-[10px] text-slate-500">
                  Production default is 3600s (1 hour). Scaled down for instantaneous demonstration.
                </p>
              </div>

              {/* Slider 2: Window Threshold % */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Sliding Window Renewal Trigger</span>
                  <span className="font-mono text-amber-400 font-bold">{renewalWindowThresholdPct}% Remaining</span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="50"
                  step="5"
                  value={renewalWindowThresholdPct}
                  onChange={(e) => setRenewalWindowThresholdPct(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-[10px] text-slate-500">
                  Refreshes proactive token renewal when remaining lifespan enters the lower threshold.
                </p>
              </div>

              {/* Jitter toggle & max ms */}
              <div className="space-y-3 pt-2 border-t border-slate-800">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-slate-200">Full Jitter Backoff</p>
                    <p className="text-[10px] text-slate-400">Prevents thundering-herd synchronization on gateway reconnect</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={enableJitter}
                    onChange={(e) => setEnableJitter(e.target.checked)}
                    className="w-4 h-4 accent-blue-600 rounded cursor-pointer"
                  />
                </div>

                {enableJitter && (
                  <div className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Max Jitter Delay Window</span>
                      <span className="font-mono text-purple-400">{jitterRangeMs} ms</span>
                    </div>
                    <input
                      type="range"
                      min="100"
                      max="1500"
                      step="50"
                      value={jitterRangeMs}
                      onChange={(e) => setJitterRangeMs(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-purple-500"
                    />
                  </div>
                )}
              </div>

              {/* Simulated Failure Rate */}
              <div className="space-y-2 pt-2 border-t border-slate-800">
                <div className="flex justify-between text-xs">
                  <span className="text-slate-300">Simulate Network / Edge Degradation Failure</span>
                  <span className="font-mono text-rose-400 font-bold">{simulatedFailureRate}%</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="80"
                  step="5"
                  value={simulatedFailureRate}
                  onChange={(e) => setSimulatedFailureRate(Number(e.target.value))}
                  className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-rose-500"
                />
                <p className="text-[10px] text-slate-500">
                  Injects 503 Service Unavailable downstream errors to test circuit degradation and recovery.
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Specs */}
      <div className="bg-[#080d1a] px-6 py-3 border-t border-slate-800/80 flex flex-wrap items-center justify-between text-[11px] text-slate-400 gap-2">
        <div className="flex items-center space-x-2">
          <Server className="w-3.5 h-3.5 text-blue-400" />
          <span>Endpoint: api.chase.com/card/loyalty/earn-rewards/enrollment/v1</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="flex items-center gap-1">
            <Cpu className="w-3 h-3 text-emerald-400" />
            <span>Worker: RTR-Engine-01</span>
          </span>
          <span className="text-slate-500">TLS 1.3 • HMAC-SHA256 • JPMC Tier-1</span>
        </div>
      </div>
    </div>
  );
};

export default ChaseTokenRefreshEngine;