

// --- CONSOLIDATED FROM: ./components/chase/ChaseHealthTelemetryMonitor.tsx ---

import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  Activity,
  AlertTriangle,
  CheckCircle2,
  Clock,
  Database,
  Flame,
  Globe,
  HardDrive,
  HelpCircle,
  Pause,
  Play,
  RefreshCw,
  Server,
  ShieldAlert,
  ShieldCheck,
  TrendingDown,
  TrendingUp,
  Wifi,
  Zap
} from 'lucide-react';

interface PingTelemetrySample {
  id: string;
  timestamp: string;
  epochMs: number;
  statusCode: number;
  latencyMs: number;
  traceId: string;
  edgeNode: string;
  channel: 'WEB' | 'MOBILE_APP' | 'MOBILE_WEB' | 'API_GATEWAY';
  status: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE' | 'OUTAGE';
  serviceErrorCode?: string;
  externalErrorCode?: string;
  message?: string;
}

interface CircuitBreakerState {
  status: 'CLOSED' | 'OPEN' | 'HALF_OPEN';
  failureCount: number;
  lastFailureTime: number | null;
  recoveryThresholdMs: number;
}

interface MaintenanceWindowNotice {
  code: '9102' | '9103' | '9116';
  title: string;
  description: string;
  impactLevel: 'CRITICAL' | 'HIGH' | 'MODERATE';
  timestamp: string;
}

const EDGE_NODES = ['US-EAST-1 (NYC-MRM)', 'US-EAST-2 (OHIO-CORE)', 'US-WEST-1 (SFO-GW)', 'EU-WEST-1 (LON-HUB)'];
const CHANNELS: ('WEB' | 'MOBILE_APP' | 'MOBILE_WEB' | 'API_GATEWAY')[] = ['WEB', 'MOBILE_APP', 'MOBILE_WEB', 'API_GATEWAY'];

const BUSINESS_ERROR_CATALOG: Record<string, { label: string; description: string; remediation: string; category: 'BUSINESS' | 'DOWNSTREAM' | 'AUTH' }> = {
  '601': {
    label: 'Account Not Eligible',
    description: 'The target card account does not meet rewards loyalty criteria or tier prerequisites.',
    remediation: 'Verify customer card product tier with Merchant Relationship Manager (MRM).',
    category: 'BUSINESS',
  },
  '101': {
    label: 'Account Not Found',
    description: 'Universal Unique Identifier (UUID) or external account token was not located in Enterprise Customer Store.',
    remediation: 'Validate 128-bit UUID format and ensure PCI token registration is finalized.',
    category: 'BUSINESS',
  },
  '104': {
    label: 'Enrollment Not Found',
    description: 'No active Pay with Points record exists for the supplied account reference.',
    remediation: 'Initiate POST enrollment sequence or verify auto-enrollment eligibility table.',
    category: 'BUSINESS',
  },
  '179': {
    label: 'Multiple Accounts Found',
    description: 'Ambiguous correlation ID mapped to multiple cardholder portfolio records.',
    remediation: 'Ensure external-account-identifier has 1:1 binding before invoking /enrollments.',
    category: 'BUSINESS',
  },
  '9102': {
    label: 'Service Unavailable (Downstream Core)',
    description: 'Downstream Chase Loyalty & Rewards Core ledger is executing scheduled batch replication.',
    remediation: 'Engage circuit breaker; queue outbound partner requests to avoid 503 storming.',
    category: 'DOWNSTREAM',
  },
  '9103': {
    label: 'Maintenance Window Active',
    description: 'CLPWPE Engine under transient upgrade window.',
    remediation: 'Display partner graceful fallback and retry with exponential backoff (jittered).',
    category: 'DOWNSTREAM',
  },
  '9116': {
    label: 'Unable to Delete Membership',
    description: 'Internal server fault during un-enrollment lock release in customer enterprise system.',
    remediation: 'Check 2-legged OAuth scope `card` and idempotency trace-id integrity.',
    category: 'DOWNSTREAM',
  },
};

export const ChaseHealthTelemetryMonitor: React.FC = () => {
  const [telemetryHistory, setTelemetryHistory] = useState<PingTelemetrySample[]>([]);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [pollingFrequencyMs, setPollingFrequencyMs] = useState<number>(3000);
  const [circuitBreaker, setCircuitBreaker] = useState<CircuitBreakerState>({
    status: 'CLOSED',
    failureCount: 0,
    lastFailureTime: null,
    recoveryThresholdMs: 15000,
  });

  const [activeMaintenanceAlert, setActiveMaintenanceAlert] = useState<MaintenanceWindowNotice | null>(null);
  const [selectedErrorDiagnosis, setSelectedErrorDiagnosis] = useState<string | null>('601');
  const [syntheticProbeActive, setSyntheticProbeActive] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'BUSINESS_DIAGNOSTICS' | 'GATEWAY_TOPOLOGY' | 'HEALTH_MAP'>('TELEMETRY');

  const generateSyntheticTraceId = (): string => {
    return Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
  };

  const executePingProbe = useCallback(() => {
    const epochMs = Date.now();
    const isoTimestamp = new Date(epochMs).toISOString();
    const traceId = generateSyntheticTraceId();
    const edgeNode = EDGE_NODES[Math.floor(Math.random() * EDGE_NODES.length)];
    const channel = CHANNELS[Math.floor(Math.random() * CHANNELS.length)];

    // Simulation bias towards high availability with realistic enterprise jitter
    const roll = Math.random();
    let statusCode = 200;
    let latencyMs = Math.floor(22 + Math.random() * 38);
    let status: 'HEALTHY' | 'DEGRADED' | 'MAINTENANCE' | 'OUTAGE' = 'HEALTHY';
    let serviceErrorCode: string | undefined = undefined;
    let externalErrorCode: string | undefined = undefined;
    let message: string | undefined = 'Request processed successfully. Gateway status nominal.';

    if (roll > 0.96) {
      // 503 Maintenance window / 9102 / 9103
      statusCode = 503;
      latencyMs = Math.floor(180 + Math.random() * 320);
      status = 'MAINTENANCE';
      serviceErrorCode = Math.random() > 0.5 ? '9102' : '9103';
      externalErrorCode = 'DOWNSTREAM_CORE_LOCK';
      message = 'Service is temporarily unavailable. Batch reconciliation in progress.';
    } else if (roll > 0.91) {
      // 409 Conflict logic
      statusCode = 409;
      latencyMs = Math.floor(80 + Math.random() * 95);
      status = 'DEGRADED';
      const conflictKeys = ['601', '101', '104', '179'];
      serviceErrorCode = conflictKeys[Math.floor(Math.random() * conflictKeys.length)];
      externalErrorCode = `CLPWPE_ERR_${serviceErrorCode}`;
      message = BUSINESS_ERROR_CATALOG[serviceErrorCode]?.description || 'Business constraint violation.';
    } else if (roll > 0.88) {
      // 500 or 504
      statusCode = roll > 0.90 ? 504 : 500;
      latencyMs = Math.floor(650 + Math.random() * 1200);
      status = 'OUTAGE';
      serviceErrorCode = '9116';
      externalErrorCode = 'MEMBERSHIP_MUTEX_TIMEOUT';
      message = 'Internal downstream timeout occurred between API gateway and Core.';
    } else if (roll > 0.82) {
      // Degraded latency
      latencyMs = Math.floor(140 + Math.random() * 190);
      status = 'DEGRADED';
    }

    const sample: PingTelemetrySample = {
      id: `sample-${epochMs}-${Math.random().toString(36).substring(2, 6)}`,
      timestamp: isoTimestamp,
      epochMs,
      statusCode,
      latencyMs,
      traceId,
      edgeNode,
      channel,
      status,
      serviceErrorCode,
      externalErrorCode,
      message,
    };

    setTelemetryHistory((prev) => [sample, ...prev.slice(0, 49)]);

    // Update Circuit Breaker Evaluation
    setCircuitBreaker((prev) => {
      if (statusCode >= 500) {
        const newFailureCount = prev.failureCount + 1;
        const shouldTrip = newFailureCount >= 3;
        if (shouldTrip && !activeMaintenanceAlert) {
          setActiveMaintenanceAlert({
            code: (serviceErrorCode as '9102' | '9103' | '9116') || '9102',
            title: 'Downstream Core Exception Detected',
            description: message || 'CLPWPE Service reported persistent 5xx threshold failures.',
            impactLevel: 'CRITICAL',
            timestamp: new Date().toLocaleTimeString(),
          });
        }
        return {
          ...prev,
          failureCount: newFailureCount,
          lastFailureTime: epochMs,
          status: shouldTrip ? 'OPEN' : prev.status,
        };
      } else {
        return {
          ...prev,
          failureCount: Math.max(0, prev.failureCount - 1),
          status: prev.status === 'OPEN' && prev.failureCount === 0 ? 'CLOSED' : prev.status,
        };
      }
    });
  }, [activeMaintenanceAlert]);

  useEffect(() => {
    // Initial bootstrap samples
    for (let i = 0; i < 15; i++) {
      executePingProbe();
    }
  }, []);

  useEffect(() => {
    if (!isLiveStreaming) return;
    const interval = setInterval(() => {
      executePingProbe();
    }, pollingFrequencyMs);
    return () => clearInterval(interval);
  }, [isLiveStreaming, pollingFrequencyMs, executePingProbe]);

  // Aggregate Metrics
  const telemetryStats = useMemo(() => {
    if (telemetryHistory.length === 0) {
      return {
        avgLatency: 0,
        successRate: 100,
        p99Latency: 0,
        totalRequests: 0,
        errorCount: 0,
        maintenanceCount: 0,
      };
    }

    const total = telemetryHistory.length;
    const totalLatency = telemetryHistory.reduce((acc, s) => acc + s.latencyMs, 0);
    const avgLatency = Math.round(totalLatency / total);
    const successes = telemetryHistory.filter((s) => s.statusCode === 200).length;
    const successRate = ((successes / total) * 100).toFixed(1);

    const sortedLatency = [...telemetryHistory].map((s) => s.latencyMs).sort((a, b) => a - b);
    const p99Index = Math.floor(sortedLatency.length * 0.99);
    const p99Latency = sortedLatency[p99Index] || sortedLatency[sortedLatency.length - 1];

    const errorCount = telemetryHistory.filter((s) => s.statusCode >= 400 && s.statusCode < 500).length;
    const maintenanceCount = telemetryHistory.filter((s) => s.statusCode >= 500).length;

    return {
      avgLatency,
      successRate,
      p99Latency,
      totalRequests: total,
      errorCount,
      maintenanceCount,
    };
  }, [telemetryHistory]);

  const triggerManualSyntheticProbe = () => {
    setSyntheticProbeActive(true);
    setTimeout(() => {
      executePingProbe();
      setSyntheticProbeActive(false);
    }, 450);
  };

  const handleResetCircuitBreaker = () => {
    setCircuitBreaker({
      status: 'CLOSED',
      failureCount: 0,
      lastFailureTime: null,
      recoveryThresholdMs: 15000,
    });
    setActiveMaintenanceAlert(null);
  };

  return (
    <div className="w-full bg-[#0a1118] border border-[#1e293b] rounded-xl shadow-2xl text-slate-100 overflow-hidden font-sans">
      {/* Top Header & Mission Control Bar */}
      <div className="bg-gradient-to-r from-[#0d1c2e] via-[#091522] to-[#0d1c2e] border-b border-[#1e2f47] p-5">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-[#0060f0]/20 border border-[#0060f0]/40 text-[#4da2ff]">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl font-bold tracking-tight text-white">Chase CLPWPE Telemetry & Health Stream</h1>
                <span className="px-2.5 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                  API Gateway v1.0.0 Live
                </span>
              </div>
              <p className="text-xs text-slate-400 mt-0.5 flex items-center gap-2">
                <span>BasePath: <code className="text-sky-300 font-mono">/card/loyalty/earn-rewards/enrollment/v1</code></span>
                <span>•</span>
                <span>Host: <code className="text-sky-300 font-mono">api.chase.com</code></span>
                <span>•</span>
                <span>2-Legged OAuth Target</span>
              </p>
            </div>
          </div>

          {/* Real-time Streaming Controls */}
          <div className="flex items-center gap-3 w-full lg:w-auto justify-end">
            <div className="flex items-center bg-[#132235] border border-[#23354d] rounded-lg p-1 text-xs">
              <button
                onClick={() => setPollingFrequencyMs(1000)}
                className={`px-2.5 py-1 rounded font-medium transition ${pollingFrequencyMs === 1000 ? 'bg-[#0060f0] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                1s Fast
              </button>
              <button
                onClick={() => setPollingFrequencyMs(3000)}
                className={`px-2.5 py-1 rounded font-medium transition ${pollingFrequencyMs === 3000 ? 'bg-[#0060f0] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                3s Normal
              </button>
              <button
                onClick={() => setPollingFrequencyMs(5000)}
                className={`px-2.5 py-1 rounded font-medium transition ${pollingFrequencyMs === 5000 ? 'bg-[#0060f0] text-white shadow' : 'text-slate-400 hover:text-white'}`}
              >
                5s Eco
              </button>
            </div>

            <button
              onClick={() => setIsLiveStreaming(!isLiveStreaming)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition ${
                isLiveStreaming
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-300 hover:bg-amber-500/20'
                  : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-300 hover:bg-emerald-500/20'
              }`}
            >
              {isLiveStreaming ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Stream
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Resume Stream
                </>
              )}
            </button>

            <button
              onClick={triggerManualSyntheticProbe}
              disabled={syntheticProbeActive}
              className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-semibold bg-[#0060f0] hover:bg-[#0051cb] text-white border border-[#3b82f6]/50 shadow-lg shadow-blue-500/20 active:scale-95 transition disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${syntheticProbeActive ? 'animate-spin' : ''}`} />
              Probe /ping
            </button>
          </div>
        </div>

        {/* Global Nav Tabs */}
        <div className="flex items-center gap-2 mt-5 border-t border-[#1a2c42] pt-4 overflow-x-auto">
          <button
            onClick={() => setActiveTab('TELEMETRY')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'TELEMETRY'
                ? 'bg-[#1e3450] text-[#60a5fa] border border-[#2b4a70]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#132235]'
            }`}
          >
            <Activity className="w-3.5 h-3.5" />
            Live /ping Stream
          </button>
          <button
            onClick={() => setActiveTab('BUSINESS_DIAGNOSTICS')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'BUSINESS_DIAGNOSTICS'
                ? 'bg-[#1e3450] text-[#60a5fa] border border-[#2b4a70]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#132235]'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            409 Conflict & 9102/9103 Engine
          </button>
          <button
            onClick={() => setActiveTab('GATEWAY_TOPOLOGY')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'GATEWAY_TOPOLOGY'
                ? 'bg-[#1e3450] text-[#60a5fa] border border-[#2b4a70]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#132235]'
            }`}
          >
            <Globe className="w-3.5 h-3.5" />
            Edge Gateways & Channels
          </button>
          <button
            onClick={() => setActiveTab('HEALTH_MAP')}
            className={`flex items-center gap-2 px-3.5 py-1.5 text-xs font-semibold rounded-md transition ${
              activeTab === 'HEALTH_MAP'
                ? 'bg-[#1e3450] text-[#60a5fa] border border-[#2b4a70]'
                : 'text-slate-400 hover:text-slate-200 hover:bg-[#132235]'
            }`}
          >
            <Database className="w-3.5 h-3.5" />
            Enterprise Resilience Matrix
          </button>
        </div>
      </div>

      {/* Maintenance & Circuit Breaker Warning Banner */}
      {circuitBreaker.status === 'OPEN' && (
        <div className="bg-gradient-to-r from-red-950/80 via-red-900/60 to-red-950/80 border-b border-red-700/50 p-4 px-6 flex flex-col md:flex-row items-center justify-between gap-4 text-red-200">
          <div className="flex items-center gap-3">
            <AlertTriangle className="w-6 h-6 text-red-400 animate-bounce" />
            <div>
              <div className="font-bold text-sm text-red-100 flex items-center gap-2">
                CIRCUIT BREAKER ENGAGED (STATE: OPEN)
                <span className="px-2 py-0.5 text-[10px] font-mono bg-red-800/80 text-white rounded">CODE: 9102/9103 ACTIVE</span>
              </div>
              <p className="text-xs text-red-300">
                CLPWPE service is experiencing downstream timeout thresholds (&gt;3 consecutive 5xx errors). Automated fallback traffic throttling engaged to protect core loyalty ledger.
              </p>
            </div>
          </div>
          <button
            onClick={handleResetCircuitBreaker}
            className="px-3 py-1.5 bg-red-600 hover:bg-red-500 text-white text-xs font-bold rounded-lg transition shadow flex items-center gap-1.5 whitespace-nowrap"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Reset Circuit Breaker
          </button>
        </div>
      )}

      {/* KPI Telemetry Header */}
      <div className="p-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 bg-[#0c1622] border-b border-[#1b2a3d]">
        {/* Metric 1: Average Latency */}
        <div className="bg-[#111e2e] border border-[#1e334d] p-4 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Health Latency (/ping)</span>
            <Clock className="w-4 h-4 text-sky-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white font-mono">{telemetryStats.avgLatency}</span>
            <span className="text-xs text-slate-400 font-mono">ms avg</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#1d3047] pt-2">
            <span>P99: <strong className="text-slate-200 font-mono">{telemetryStats.p99Latency}ms</strong></span>
            <span className="flex items-center text-emerald-400 font-medium">
              <TrendingDown className="w-3 h-3 mr-0.5" /> Nominal
            </span>
          </div>
        </div>

        {/* Metric 2: Uptime & SLA */}
        <div className="bg-[#111e2e] border border-[#1e334d] p-4 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Gateway SLA Integrity</span>
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-emerald-400 font-mono">{telemetryStats.successRate}%</span>
            <span className="text-xs text-emerald-500/80 font-mono">200 OK</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#1d3047] pt-2">
            <span>Target: <strong className="text-slate-200 font-mono">99.95%</strong></span>
            <span className="text-slate-300 font-mono">{telemetryStats.totalRequests} Probes</span>
          </div>
        </div>

        {/* Metric 3: Circuit Breaker Status */}
        <div className="bg-[#111e2e] border border-[#1e334d] p-4 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Circuit Breaker</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span
              className={`text-xl font-black font-mono ${
                circuitBreaker.status === 'CLOSED'
                  ? 'text-emerald-400'
                  : circuitBreaker.status === 'HALF_OPEN'
                  ? 'text-amber-400'
                  : 'text-rose-400'
              }`}
            >
              {circuitBreaker.status}
            </span>
            <span className="text-xs text-slate-400">({circuitBreaker.failureCount} errs)</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#1d3047] pt-2">
            <span>Threshold: <strong className="text-slate-200 font-mono">3 FAILS</strong></span>
            <span className="text-slate-400">Auto-heal 15s</span>
          </div>
        </div>

        {/* Metric 4: Conflict & Error Monitor */}
        <div className="bg-[#111e2e] border border-[#1e334d] p-4 rounded-xl relative overflow-hidden">
          <div className="flex justify-between items-start">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">409 & 503 Incidents</span>
            <Flame className="w-4 h-4 text-rose-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-rose-300 font-mono">
              {telemetryStats.errorCount + telemetryStats.maintenanceCount}
            </span>
            <span className="text-xs text-rose-400/80 font-mono">anomalies</span>
          </div>
          <div className="mt-2 flex items-center justify-between text-[11px] text-slate-400 border-t border-[#1d3047] pt-2">
            <span>409 Biz: <strong className="text-amber-300 font-mono">{telemetryStats.errorCount}</strong></span>
            <span>503 Sys: <strong className="text-rose-400 font-mono">{telemetryStats.maintenanceCount}</strong></span>
          </div>
        </div>
      </div>

      {/* Main Tab Switcher Contents */}
      <div className="p-6">
        {activeTab === 'TELEMETRY' && (
          <div className="space-y-6">
            {/* Real-time Latency Chart Visualizer */}
            <div className="bg-[#0f1b2b] border border-[#1f3148] rounded-xl p-5">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-sm font-bold text-slate-200 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-[#38bdf8]" />
                    Real-Time Response Latency Histogram (Last 50 Probes)
                  </h3>
                  <p className="text-xs text-slate-400">Tracking latency jitter (ms), gateway overhead, and HTTP status spectrum.</p>
                </div>
                <div className="flex items-center gap-3 text-xs">
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" /> 200 OK (&lt;100ms)
                  </span>
                  <span className="flex items-center gap-1 text-amber-400">
                    <span className="w-2 h-2 rounded-full bg-amber-400" /> 409 Conflict
                  </span>
                  <span className="flex items-center gap-1 text-rose-400">
                    <span className="w-2 h-2 rounded-full bg-rose-400" /> 500 / 503 Outage
                  </span>
                </div>
              </div>

              {/* Graphical Bar Histogram */}
              <div className="h-32 w-full flex items-end gap-1 pt-4 border-b border-[#223650] pb-1">
                {telemetryHistory.slice(0, 40).reverse().map((sample, idx) => {
                  const normalizedHeight = Math.min(100, Math.max(12, (sample.latencyMs / 400) * 100));
                  let barColor = 'bg-emerald-500 hover:bg-emerald-400';
                  if (sample.statusCode === 409) barColor = 'bg-amber-500 hover:bg-amber-400';
                  if (sample.statusCode >= 500) barColor = 'bg-rose-500 hover:bg-rose-400';

                  return (
                    <div
                      key={sample.id || idx}
                      className="flex-1 group relative flex flex-col items-center h-full justify-end"
                    >
                      <div
                        style={{ height: `${normalizedHeight}%` }}
                        className={`w-full rounded-t-sm transition-all duration-300 ${barColor}`}
                      />
                      {/* Tooltip on hover */}
                      <div className="absolute bottom-full mb-2 hidden group-hover:flex flex-col items-start bg-[#050b12] border border-[#2b4466] text-[10px] text-white p-2 rounded shadow-2xl z-30 pointer-events-none whitespace-nowrap font-mono">
                        <span className="font-bold text-sky-300">Status: {sample.statusCode} ({sample.latencyMs}ms)</span>
                        <span className="text-slate-400">Trace: {sample.traceId.substring(0, 10)}...</span>
                        <span className="text-slate-400">Node: {sample.edgeNode}</span>
                        {sample.serviceErrorCode && (
                          <span className="text-rose-400 font-semibold">ErrCode: {sample.serviceErrorCode}</span>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
              <div className="flex justify-between items-center text-[10px] text-slate-500 font-mono mt-2">
                <span>T - 40 samples</span>
                <span>Current Real-time Probe Edge</span>
              </div>
            </div>

            {/* Live Streaming Telemetry Table */}
            <div className="bg-[#0f1b2b] border border-[#1f3148] rounded-xl overflow-hidden shadow-lg">
              <div className="p-4 bg-[#142337] border-b border-[#21354f] flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Server className="w-4 h-4 text-sky-400" />
                  <span className="text-sm font-bold text-white">Live Endpoint Execution Feed</span>
                  <span className="text-xs px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono">
                    GET /ping &amp; /merchants/.../enrollments
                  </span>
                </div>
                <span className="text-xs text-slate-400 font-mono">Latest 50 Operations</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs font-mono">
                  <thead className="bg-[#0a131f] text-slate-400 border-b border-[#1e3048]">
                    <tr>
                      <th className="p-3">Timestamp</th>
                      <th className="p-3">Trace ID (128-bit)</th>
                      <th className="p-3">HTTP Status</th>
                      <th className="p-3">Latency</th>
                      <th className="p-3">Edge Gateway</th>
                      <th className="p-3">Channel Type</th>
                      <th className="p-3">Diagnostics / Error Code</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-[#17273c] text-slate-300">
                    {telemetryHistory.map((sample) => {
                      const isSuccess = sample.statusCode === 200;
                      const isConflict = sample.statusCode === 409;
                      const isServerErr = sample.statusCode >= 500;

                      return (
                        <tr key={sample.id} className="hover:bg-[#152438]/60 transition">
                          <td className="p-3 text-slate-400">
                            {new Date(sample.epochMs).toLocaleTimeString()}
                          </td>
                          <td className="p-3 font-mono text-sky-400">
                            <span className="cursor-pointer hover:underline" title={sample.traceId}>
                              {sample.traceId.substring(0, 8)}...{sample.traceId.substring(24)}
                            </span>
                          </td>
                          <td className="p-3">
                            <span
                              className={`px-2 py-0.5 rounded text-[11px] font-bold inline-flex items-center gap-1 ${
                                isSuccess
                                  ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30'
                                  : isConflict
                                  ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30'
                                  : 'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                              }`}
                            >
                              {isSuccess ? (
                                <CheckCircle2 className="w-3 h-3" />
                              ) : (
                                <AlertTriangle className="w-3 h-3" />
                              )}
                              {sample.statusCode}
                            </span>
                          </td>
                          <td className="p-3 font-semibold text-slate-200">
                            <span
                              className={
                                sample.latencyMs > 150
                                  ? 'text-amber-400'
                                  : sample.latencyMs > 400
                                  ? 'text-rose-400'
                                  : 'text-emerald-400'
                              }
                            >
                              {sample.latencyMs}ms
                            </span>
                          </td>
                          <td className="p-3 text-slate-400">{sample.edgeNode}</td>
                          <td className="p-3">
                            <span className="px-1.5 py-0.5 bg-[#192b42] text-sky-200 rounded text-[10px]">
                              {sample.channel}
                            </span>
                          </td>
                          <td className="p-3">
                            {sample.serviceErrorCode ? (
                              <span className="flex items-center gap-1.5 text-amber-300 font-semibold">
                                <span className="px-1.5 py-0.5 bg-amber-950/80 border border-amber-700/50 rounded text-[10px]">
                                  ERR {sample.serviceErrorCode}
                                </span>
                                <span className="text-[11px] truncate max-w-[200px] text-slate-300">
                                  {BUSINESS_ERROR_CATALOG[sample.serviceErrorCode]?.label || sample.message}
                                </span>
                              </span>
                            ) : (
                              <span className="text-emerald-400/80 text-[11px]">Nominal (Pass-through)</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* Tab 2: Business Error Diagnostics (409 & 9102/9103) */}
        {activeTab === 'BUSINESS_DIAGNOSTICS' && (
          <div className="space-y-6">
            <div className="bg-[#0f1b2b] border border-[#1f3148] p-5 rounded-xl">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <ShieldAlert className="w-5 h-5 text-amber-400" />
                    CLPWPE Business Error Reason Catalog (HTTP 409 &amp; 503)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comprehensive troubleshooting matrix for enrollment constraints, down-level core exceptions, and maintenance procedures.
                  </p>
                </div>
                <span className="px-2.5 py-1 text-xs bg-amber-500/10 border border-amber-500/30 text-amber-300 rounded-md font-mono">
                  Swagger 2.0 Spec Compliant
                </span>
              </div>

              {/* Interactive Code Selector */}
              <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-2 mb-6">
                {Object.keys(BUSINESS_ERROR_CATALOG).map((code) => {
                  const item = BUSINESS_ERROR_CATALOG[code];
                  const isSelected = selectedErrorDiagnosis === code;
                  return (
                    <button
                      key={code}
                      onClick={() => setSelectedErrorDiagnosis(code)}
                      className={`p-3 rounded-lg border text-left transition flex flex-col justify-between ${
                        isSelected
                          ? 'bg-[#18304f] border-[#3b82f6] text-white shadow-lg'
                          : 'bg-[#122033] border-[#1d314a] text-slate-300 hover:border-[#2a4569]'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-black font-mono text-sky-400">{code}</span>
                        <span
                          className={`text-[9px] px-1 rounded font-bold ${
                            item.category === 'BUSINESS'
                              ? 'bg-amber-500/20 text-amber-300'
                              : item.category === 'DOWNSTREAM'
                              ? 'bg-rose-500/20 text-rose-300'
                              : 'bg-purple-500/20 text-purple-300'
                          }`}
                        >
                          {item.category}
                        </span>
                      </div>
                      <div className="text-[11px] font-semibold mt-1.5 truncate">{item.label}</div>
                    </button>
                  );
                })}
              </div>

              {/* Selected Error Inspection Card */}
              {selectedErrorDiagnosis && BUSINESS_ERROR_CATALOG[selectedErrorDiagnosis] && (
                <div className="bg-[#142337] border border-[#233a57] rounded-xl p-5 space-y-4">
                  <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-2 border-b border-[#21354f] pb-3">
                    <div>
                      <span className="text-xs text-sky-400 font-mono font-bold uppercase">
                        Service Error Diagnostic Code: #{selectedErrorDiagnosis}
                      </span>
                      <h4 className="text-lg font-bold text-white mt-0.5">
                        {BUSINESS_ERROR_CATALOG[selectedErrorDiagnosis].label}
                      </h4>
                    </div>
                    <span className="px-3 py-1 bg-red-500/10 border border-red-500/30 text-red-300 font-mono text-xs rounded-full self-start sm:self-auto">
                      Category: {BUSINESS_ERROR_CATALOG[selectedErrorDiagnosis].category}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-[#0b1420] p-4 rounded-lg border border-[#1b2c42]">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <HelpCircle className="w-3.5 h-3.5 text-amber-400" />
                        Root Cause Description
                      </h5>
                      <p className="text-xs text-slate-200 leading-relaxed mt-2">
                        {BUSINESS_ERROR_CATALOG[selectedErrorDiagnosis].description}
                      </p>
                    </div>

                    <div className="bg-[#0b1420] p-4 rounded-lg border border-[#1b2c42]">
                      <h5 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1 flex items-center gap-1.5">
                        <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                        Prescribed Remediation Step
                      </h5>
                      <p className="text-xs text-slate-200 leading-relaxed mt-2">
                        {BUSINESS_ERROR_CATALOG[selectedErrorDiagnosis].remediation}
                      </p>
                    </div>
                  </div>

                  {/* Synthetic JSON Error Schema Mock */}
                  <div className="bg-[#080d14] p-4 rounded-lg border border-[#172538] font-mono text-xs text-slate-300">
                    <div className="text-slate-500 text-[11px] mb-2">// Response payload received from CLPWPE Gateway:</div>
                    <pre className="text-sky-300 overflow-x-auto">
{JSON.stringify(
  {
    serviceErrorCode: selectedErrorDiagnosis,
    externalErrorCode: `CLPWPE_${selectedErrorDiagnosis}_EXCEPTION`,
    errorDescription: BUSINESS_ERROR_CATALOG[selectedErrorDiagnosis].description,
    remediationAction: BUSINESS_ERROR_CATALOG[selectedErrorDiagnosis].remediation,
    traceId: '7f9c2d1b84e035aa910c2834b6f98a21',
  },
  null,
  2
)}
                    </pre>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Tab 3: Gateway Topology */}
        {activeTab === 'GATEWAY_TOPOLOGY' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-[#0f1b2b] border border-[#1f3148] p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Globe className="w-4 h-4 text-sky-400" />
                Active Multi-Region Edge Hubs
              </h3>
              <div className="space-y-3">
                {EDGE_NODES.map((node, i) => (
                  <div
                    key={node}
                    className="p-3 rounded-lg bg-[#142337] border border-[#1f354f] flex items-center justify-between"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
                      <div>
                        <div className="text-xs font-bold text-white font-mono">{node}</div>
                        <div className="text-[10px] text-slate-400">Throughput: {1800 + i * 420} req/sec</div>
                      </div>
                    </div>
                    <span className="text-xs font-mono font-bold text-emerald-400">
                      {24 + i * 8}ms
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-[#0f1b2b] border border-[#1f3148] p-5 rounded-xl">
              <h3 className="text-sm font-bold text-white flex items-center gap-2 mb-4">
                <Wifi className="w-4 h-4 text-purple-400" />
                Digital Channel Distribution (channel-type header)
              </h3>
              <div className="space-y-3">
                {CHANNELS.map((ch, idx) => {
                  const shares = [42, 31, 15, 12];
                  return (
                    <div key={ch} className="p-3 rounded-lg bg-[#142337] border border-[#1f354f]">
                      <div className="flex justify-between items-center text-xs mb-1.5">
                        <span className="font-bold text-slate-200 font-mono">{ch}</span>
                        <span className="text-sky-400 font-mono font-bold">{shares[idx]}% Traffic</span>
                      </div>
                      <div className="w-full bg-[#0a1320] h-2 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${shares[idx]}%` }}
                          className="h-full bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full"
                        />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}

        {/* Tab 4: Health Map */}
        {activeTab === 'HEALTH_MAP' && (
          <div className="bg-[#0f1b2b] border border-[#1f3148] p-5 rounded-xl space-y-4">
            <h3 className="text-sm font-bold text-white flex items-center gap-2">
              <HardDrive className="w-4 h-4 text-emerald-400" />
              Core Infrastructure Dependency Health Map
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
              <div className="p-4 rounded-lg bg-[#122236] border border-[#1d3450]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">OAuth 2.0 Auth Server</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">api-sandbox.chase.com/ccoauth/token</p>
                <div className="mt-3 text-xs text-emerald-400 font-semibold">Operational (18ms)</div>
              </div>

              <div className="p-4 rounded-lg bg-[#122236] border border-[#1d3450]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">MRM Relationship Manager</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">Reward Product Code (RPC) Lookup</p>
                <div className="mt-3 text-xs text-emerald-400 font-semibold">Operational (32ms)</div>
              </div>

              <div className="p-4 rounded-lg bg-[#122236] border border-[#1d3450]">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-slate-200">Core Points Ledger DB</span>
                  <span className="w-2 h-2 rounded-full bg-emerald-400" />
                </div>
                <p className="text-[11px] text-slate-400 font-mono">CLPWPE Transaction Sync</p>
                <div className="mt-3 text-xs text-emerald-400 font-semibold">Nominal (45ms)</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Footer System Status Bar */}
      <div className="bg-[#080e16] border-t border-[#1a2b40] p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400 font-mono">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1 text-emerald-400">
            <span className="w-2 h-2 rounded-full bg-emerald-400" />
            Ping Monitor Active
          </span>
          <span>•</span>
          <span>Security: Common 2-Legged OAuth (`card` scope)</span>
        </div>
        <div className="text-slate-500">
          RNB_DEV_Leads@restricted.chase.com &copy; JPMorgan Chase &amp; Co.
        </div>
      </div>
    </div>
  );
};

export default ChaseHealthTelemetryMonitor;