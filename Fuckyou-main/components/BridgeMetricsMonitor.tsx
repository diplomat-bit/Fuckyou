import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  Clock,
  Zap,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  RefreshCw,
  Server,
  BarChart3,
  TrendingUp,
  Search,
  Filter,
  ShieldCheck,
  Cpu,
  Layers,
  Radio,
  Download,
  Play,
  Pause,
  Maximize2,
  Gauge,
  Workflow
} from 'lucide-react';

interface BridgeTarget {
  id: string;
  name: string;
  type: 'citi_ledger' | 'azure_gov' | 'alpaca_broker' | 'modern_treasury' | 'pqc_vault' | 'vertex_ai';
  endpoint: string;
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
  p95Ms: number;
  p99Ms: number;
  successRate: number;
  throughputOps: number;
  activeStreams: number;
  lastHeartbeat: string;
  region: string;
}

interface LatencyPoint {
  time: string;
  p50: number;
  p95: number;
  p99: number;
  throughput: number;
}

interface MetricErrorLog {
  id: string;
  timestamp: string;
  targetId: string;
  targetName: string;
  code: string;
  message: string;
  severity: 'critical' | 'warning' | 'info';
  latencyAttempt: number;
}

const INITIAL_TARGETS: BridgeTarget[] = [
  {
    id: 'trg-01',
    name: 'Citi Sovereign Ledger Bridge',
    type: 'citi_ledger',
    endpoint: 'https://api.citiconnect.sovereign.internal/v2/dispatch',
    status: 'healthy',
    latencyMs: 12.4,
    p95Ms: 24.1,
    p99Ms: 41.8,
    successRate: 99.98,
    throughputOps: 1420,
    activeStreams: 32,
    lastHeartbeat: '2s ago',
    region: 'us-east-1'
  },
  {
    id: 'trg-02',
    name: 'Azure Gov FedRAMP High Mesh',
    type: 'azure_gov',
    endpoint: 'https://gov.azure.us-servicebus.internal/bridge',
    status: 'healthy',
    latencyMs: 18.2,
    p95Ms: 31.5,
    p99Ms: 58.2,
    successRate: 99.92,
    throughputOps: 890,
    activeStreams: 18,
    lastHeartbeat: '1s ago',
    region: 'usgov-virginia'
  },
  {
    id: 'trg-03',
    name: 'Alpaca Prime Settlement Engine',
    type: 'alpaca_broker',
    endpoint: 'https://trade-api.alpaca.markets/v2/orders/batch',
    status: 'degraded',
    latencyMs: 84.6,
    p95Ms: 142.0,
    p99Ms: 280.5,
    successRate: 97.45,
    throughputOps: 410,
    activeStreams: 8,
    lastHeartbeat: '4s ago',
    region: 'us-east-2'
  },
  {
    id: 'trg-04',
    name: 'Modern Treasury Ledger Hub',
    type: 'modern_treasury',
    endpoint: 'https://api.moderntreasury.com/v1/ledger_entries',
    status: 'healthy',
    latencyMs: 22.1,
    p95Ms: 38.4,
    p99Ms: 64.1,
    successRate: 99.89,
    throughputOps: 630,
    activeStreams: 14,
    lastHeartbeat: '2s ago',
    region: 'us-west-2'
  },
  {
    id: 'trg-05',
    name: 'PQC Lattice Shield Vault',
    type: 'pqc_vault',
    endpoint: 'https://pqc-sec.gov.internal/v1/quantum/verify',
    status: 'healthy',
    latencyMs: 8.7,
    p95Ms: 15.2,
    p99Ms: 22.9,
    successRate: 100.0,
    throughputOps: 3120,
    activeStreams: 64,
    lastHeartbeat: '1s ago',
    region: 'us-central-1'
  },
  {
    id: 'trg-06',
    name: 'Vertex AI Risk Model Dispatcher',
    type: 'vertex_ai',
    endpoint: 'https://vertexai.googleapis.com/v1/projects/gov-prod/models/risk',
    status: 'offline',
    latencyMs: 0,
    p95Ms: 0,
    p99Ms: 0,
    successRate: 0.0,
    throughputOps: 0,
    activeStreams: 0,
    lastHeartbeat: '312s ago',
    region: 'us-central1'
  }
];

const GENERATE_HISTORICAL_LATENCY = (): LatencyPoint[] => {
  const times = ['12:00', '12:05', '12:10', '12:15', '12:20', '12:25', '12:30', '12:35', '12:40', '12:45', '12:50', '12:55'];
  return times.map((t) => {
    const baseP50 = 14 + Math.floor(Math.random() * 6);
    const baseP95 = baseP50 + 12 + Math.floor(Math.random() * 10);
    const baseP99 = baseP95 + 20 + Math.floor(Math.random() * 25);
    const ops = 5000 + Math.floor(Math.random() * 2000);
    return {
      time: t,
      p50: baseP50,
      p95: baseP95,
      p99: baseP99,
      throughput: ops
    };
  });
};

const INITIAL_LOGS: MetricErrorLog[] = [
  {
    id: 'log-101',
    timestamp: '12:54:12.420',
    targetId: 'trg-03',
    targetName: 'Alpaca Prime Settlement Engine',
    code: 'HTTP_504_GATEWAY_TIMEOUT',
    message: 'Upstream order router socket read timeout after 1500ms',
    severity: 'warning',
    latencyAttempt: 1502
  },
  {
    id: 'log-102',
    timestamp: '12:51:08.112',
    targetId: 'trg-06',
    targetName: 'Vertex AI Risk Model Dispatcher',
    code: 'CONN_REFUSED_ENDPOINT_OFFLINE',
    message: 'Failed to establish mTLS handshake: Service Unavailable',
    severity: 'critical',
    latencyAttempt: 0
  },
  {
    id: 'log-103',
    timestamp: '12:48:33.901',
    targetId: 'trg-03',
    targetName: 'Alpaca Prime Settlement Engine',
    code: 'RATE_LIMIT_EXCEEDED_RETRY',
    message: 'HTTP 429 Too Many Requests - Automatic backoff triggered',
    severity: 'warning',
    latencyAttempt: 340
  },
  {
    id: 'log-104',
    timestamp: '12:42:19.005',
    targetId: 'trg-02',
    targetName: 'Azure Gov FedRAMP High Mesh',
    code: 'JWT_NONCE_REPLAY_ATTEMPT',
    message: 'Security validation rejected non-sequential ticket ID',
    severity: 'info',
    latencyAttempt: 19
  }
];

export const BridgeMetricsMonitor: React.FC = () => {
  const [targets, setTargets] = useState<BridgeTarget[]>(INITIAL_TARGETS);
  const [latencyHistory, setLatencyHistory] = useState<LatencyPoint[]>(GENERATE_HISTORICAL_LATENCY());
  const [errorLogs, setErrorLogs] = useState<MetricErrorLog[]>(INITIAL_LOGS);
  const [isLiveStreaming, setIsLiveStreaming] = useState<boolean>(true);
  const [selectedTimeframe, setSelectedTimeframe] = useState<'15m' | '1h' | '6h' | '24h'>('1h');
  const [selectedSeverity, setSelectedSeverity] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedTargetId, setSelectedTargetId] = useState<string | null>(null);
  const [isProbing, setIsProbing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'overview' | 'targets' | 'latency' | 'errors'>('overview');

  // Real-time telemetry simulation generator
  useEffect(() => {
    if (!isLiveStreaming) return;

    const interval = setInterval(() => {
      setTargets((prev) =>
        prev.map((target) => {
          if (target.status === 'offline') return target;
          const jitter = (Math.random() - 0.48) * 3;
          const newLatency = Math.max(4, +(target.latencyMs + jitter).toFixed(1));
          const newP95 = +(newLatency * 1.6 + Math.random() * 4).toFixed(1);
          const newP99 = +(newP95 * 1.5 + Math.random() * 8).toFixed(1);
          const opsJitter = Math.floor((Math.random() - 0.5) * 40);
          const newThroughput = Math.max(10, target.throughputOps + opsJitter);

          return {
            ...target,
            latencyMs: newLatency,
            p95Ms: newP95,
            p99Ms: newP99,
            throughputOps: newThroughput,
            lastHeartbeat: '0s ago'
          };
        })
      );

      // Append new time point to chart
      const now = new Date();
      const timeStr = now.toTimeString().split(' ')[0].substring(0, 5);
      setLatencyHistory((prev) => {
        const last = prev[prev.length - 1];
        const newP50 = Math.max(10, Math.floor(last.p50 + (Math.random() - 0.5) * 3));
        const newP95 = Math.max(newP50 + 8, Math.floor(last.p95 + (Math.random() - 0.5) * 5));
        const newP99 = Math.max(newP95 + 15, Math.floor(last.p99 + (Math.random() - 0.5) * 8));
        const newOps = Math.max(3000, Math.floor(last.throughput + (Math.random() - 0.5) * 200));

        const updated = [...prev.slice(1), { time: timeStr, p50: newP50, p95: newP95, p99: newP99, throughput: newOps }];
        return updated;
      });
    }, 2500);

    return () => clearInterval(interval);
  }, [isLiveStreaming]);

  // Calculated Aggregate Stats
  const aggregateMetrics = useMemo(() => {
    const activeTargets = targets.filter((t) => t.status !== 'offline');
    const totalOps = targets.reduce((acc, t) => acc + t.throughputOps, 0);
    const avgLatency =
      activeTargets.length > 0
        ? +(activeTargets.reduce((acc, t) => acc + t.latencyMs, 0) / activeTargets.length).toFixed(1)
        : 0;
    const avgP95 =
      activeTargets.length > 0
        ? +(activeTargets.reduce((acc, t) => acc + t.p95Ms, 0) / activeTargets.length).toFixed(1)
        : 0;
    const aggregateSuccess =
      activeTargets.length > 0
        ? +(activeTargets.reduce((acc, t) => acc + t.successRate, 0) / activeTargets.length).toFixed(2)
        : 0;
    const healthyCount = targets.filter((t) => t.status === 'healthy').length;
    const degradedCount = targets.filter((t) => t.status === 'degraded').length;
    const offlineCount = targets.filter((t) => t.status === 'offline').length;

    return {
      totalOps,
      avgLatency,
      avgP95,
      aggregateSuccess,
      healthyCount,
      degradedCount,
      offlineCount,
      totalTargets: targets.length
    };
  }, [targets]);

  const filteredLogs = useMemo(() => {
    return errorLogs.filter((log) => {
      const matchesSearch =
        log.targetName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = selectedSeverity === 'all' || log.severity === selectedSeverity;
      const matchesTarget = !selectedTargetId || log.targetId === selectedTargetId;
      return matchesSearch && matchesSeverity && matchesTarget;
    });
  }, [errorLogs, searchQuery, selectedSeverity, selectedTargetId]);

  const handleTriggerProbe = useCallback(() => {
    setIsProbing(true);
    setTimeout(() => {
      setTargets((prev) =>
        prev.map((t) => ({
          ...t,
          lastHeartbeat: '0s ago',
          status: t.id === 'trg-06' ? 'offline' : t.latencyMs > 60 ? 'degraded' : 'healthy'
        }))
      );
      setIsProbing(false);
    }, 1200);
  }, []);

  const handleExportCSV = () => {
    const headers = ['Timestamp', 'Target Name', 'Code', 'Severity', 'Message', 'Latency (ms)'];
    const rows = errorLogs.map((l) => [
      l.timestamp,
      `"${l.targetName}"`,
      l.code,
      l.severity,
      `"${l.message}"`,
      l.latencyAttempt
    ]);
    const csvContent = 'data:text/csv;charset=utf-8,' + [headers.join(','), ...rows.map((e) => e.join(','))].join('\n');
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `bridge_metrics_report_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // SVG Chart Dimensions & Helpers
  const chartHeight = 180;
  const chartWidth = 600;
  const maxLatencyVal = useMemo(() => {
    return Math.max(...latencyHistory.map((d) => d.p99)) * 1.15 || 100;
  }, [latencyHistory]);

  const getY = (val: number) => chartHeight - (val / maxLatencyVal) * chartHeight;
  const getX = (idx: number) => (idx / (latencyHistory.length - 1)) * chartWidth;

  const p50Points = latencyHistory.map((d, i) => `${getX(i)},${getY(d.p50)}`).join(' ');
  const p95Points = latencyHistory.map((d, i) => `${getX(i)},${getY(d.p95)}`).join(' ');
  const p99Points = latencyHistory.map((d, i) => `${getX(i)},${getY(d.p99)}`).join(' ');

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans">
      {/* Top Bar Navigation & Actions */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <span className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/20 text-indigo-400">
              <Workflow className="w-6 h-6" />
            </span>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Bridge Dispatch Metrics & Telemetry
                <span className="text-xs font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  LIVE V3.4
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Real-time dispatch latency distribution, throughput capacity, and target endpoint health monitoring.
              </p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsLiveStreaming(!isLiveStreaming)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium transition-all border ${
              isLiveStreaming
                ? 'bg-emerald-950/40 border-emerald-500/40 text-emerald-300 hover:bg-emerald-900/50'
                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
            }`}
          >
            {isLiveStreaming ? (
              <>
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                <Pause className="w-3.5 h-3.5" /> Streaming
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 text-slate-400" /> Paused
              </>
            )}
          </button>

          <button
            onClick={handleTriggerProbe}
            disabled={isProbing}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-indigo-600 hover:bg-indigo-500 text-white border border-indigo-500/50 shadow-sm transition-all disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isProbing ? 'animate-spin' : ''}`} />
            {isProbing ? 'Probing Target Endpoints...' : 'Probe Target Mesh'}
          </button>

          <button
            onClick={handleExportCSV}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-medium bg-slate-800 hover:bg-slate-700 border border-slate-700 text-slate-200 transition-all"
          >
            <Download className="w-3.5 h-3.5" /> Export Logs
          </button>
        </div>
      </div>

      {/* Aggregate KPI Header Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Execution Throughput</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {aggregateMetrics.totalOps.toLocaleString()} <span className="text-xs font-normal text-slate-400">ops/s</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+8.4% capacity headroom</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Mean Latency (p50 / p95)</span>
            <Clock className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {aggregateMetrics.avgLatency}ms{' '}
              <span className="text-xs font-normal text-indigo-300">/ p95: {aggregateMetrics.avgP95}ms</span>
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 font-medium">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            <span>Within 50ms SLA baseline</span>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Bridge Success Rate</span>
            <Gauge className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono">
              {aggregateMetrics.aggregateSuccess}%
            </div>
          </div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400">
            <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
              <div
                className="bg-emerald-500 h-1.5 rounded-full"
                style={{ width: `${aggregateMetrics.aggregateSuccess}%` }}
              ></div>
            </div>
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-4 flex flex-col justify-between backdrop-blur-sm">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Target Endpoint Mesh</span>
            <Server className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="my-2">
            <div className="text-2xl font-extrabold text-white font-mono flex items-baseline gap-2">
              <span>{aggregateMetrics.healthyCount}</span>
              <span className="text-xs text-slate-400 font-normal">/ {aggregateMetrics.totalTargets} Active</span>
            </div>
          </div>
          <div className="flex items-center gap-3 text-xs">
            <span className="flex items-center gap-1 text-emerald-400">
              <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
              {aggregateMetrics.healthyCount} Healthy
            </span>
            {aggregateMetrics.degradedCount > 0 && (
              <span className="flex items-center gap-1 text-amber-400">
                <span className="w-2 h-2 rounded-full bg-amber-500"></span>
                {aggregateMetrics.degradedCount} Degraded
              </span>
            )}
            {aggregateMetrics.offlineCount > 0 && (
              <span className="flex items-center gap-1 text-rose-400">
                <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                {aggregateMetrics.offlineCount} Offline
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Primary Dashboard Navigation Tabs */}
      <div className="flex items-center justify-between border-b border-slate-800 mb-6">
        <div className="flex gap-1">
          <button
            onClick={() => setActiveTab('overview')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'overview'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <BarChart3 className="w-4 h-4" /> Telemetry Overview
          </button>
          <button
            onClick={() => setActiveTab('targets')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'targets'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Server className="w-4 h-4" /> Target Health Matrix
            <span className="px-1.5 py-0.2 rounded-full bg-slate-800 text-slate-300 text-[10px]">
              {targets.length}
            </span>
          </button>
          <button
            onClick={() => setActiveTab('errors')}
            className={`flex items-center gap-2 px-4 py-2.5 text-xs font-semibold border-b-2 transition-all ${
              activeTab === 'errors'
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <AlertTriangle className="w-4 h-4" /> Dispatch Exception Logs
            {errorLogs.length > 0 && (
              <span className="px-1.5 py-0.2 rounded-full bg-rose-500/20 text-rose-300 text-[10px] border border-rose-500/30">
                {errorLogs.length}
              </span>
            )}
          </button>
        </div>

        <div className="hidden sm:flex items-center gap-2">
          <span className="text-xs text-slate-400 font-medium">Window:</span>
          {(['15m', '1h', '6h', '24h'] as const).map((tf) => (
            <button
              key={tf}
              onClick={() => setSelectedTimeframe(tf)}
              className={`px-2.5 py-1 text-xs rounded-md transition-all ${
                selectedTimeframe === tf
                  ? 'bg-slate-800 text-white font-medium border border-slate-700'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              {tf}
            </button>
          ))}
        </div>
      </div>

      {/* TAB 1: OVERVIEW & REAL-TIME GRAPH */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Latency Graph */}
          <div className="lg:col-span-2 bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 mb-6">
              <div>
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <TrendingUp className="w-4 h-4 text-indigo-400" /> Dispatch Latency Percentiles (p50 / p95 / p99)
                </h3>
                <p className="text-xs text-slate-400">Dynamic dispatch times across all bridged operational routes</p>
              </div>
              <div className="flex items-center gap-4 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-0.5 bg-emerald-400 inline-block rounded"></span> p50
                </span>
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-2.5 h-0.5 bg-indigo-400 inline-block rounded"></span> p95
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-0.5 bg-amber-400 inline-block rounded"></span> p99
                </span>
              </div>
            </div>

            {/* SVG Visual Telemetry Graph */}
            <div className="w-full overflow-x-auto">
              <div className="min-w-[500px]">
                <svg
                  viewBox={`0 0 ${chartWidth} ${chartHeight}`}
                  className="w-full h-48 overflow-visible"
                >
                  {/* Grid Lines */}
                  {[0, 0.25, 0.5, 0.75, 1].map((ratio, idx) => {
                    const yVal = chartHeight * ratio;
                    return (
                      <line
                        key={idx}
                        x1="0"
                        y1={yVal}
                        x2={chartWidth}
                        y2={yVal}
                        stroke="#334155"
                        strokeDasharray="3 3"
                        strokeWidth="0.5"
                      />
                    );
                  })}

                  {/* Lines */}
                  <polyline
                    fill="none"
                    stroke="#10b981"
                    strokeWidth="2"
                    strokeLinecap="round"
                    points={p50Points}
                  />
                  <polyline
                    fill="none"
                    stroke="#6366f1"
                    strokeWidth="2"
                    strokeLinecap="round"
                    points={p95Points}
                  />
                  <polyline
                    fill="none"
                    stroke="#f59e0b"
                    strokeWidth="2"
                    strokeLinecap="round"
                    points={p99Points}
                  />

                  {/* Data Points */}
                  {latencyHistory.map((pt, idx) => (
                    <g key={idx} className="group cursor-pointer">
                      <circle cx={getX(idx)} cy={getY(pt.p95)} r="3" className="fill-indigo-400" />
                      <circle cx={getX(idx)} cy={getY(pt.p99)} r="3" className="fill-amber-400" />
                    </g>
                  ))}
                </svg>

                {/* X Axis Time Labels */}
                <div className="flex justify-between text-[10px] font-mono text-slate-500 mt-2 px-1">
                  {latencyHistory.map((item, idx) => (
                    <span key={idx}>{item.time}</span>
                  ))}
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 grid grid-cols-3 gap-4 text-center">
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Lowest p50</span>
                <span className="text-sm font-bold text-emerald-400 font-mono">
                  {Math.min(...latencyHistory.map((d) => d.p50))} ms
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Peak p95 Spike</span>
                <span className="text-sm font-bold text-indigo-400 font-mono">
                  {Math.max(...latencyHistory.map((d) => d.p95))} ms
                </span>
              </div>
              <div>
                <span className="text-[11px] text-slate-400 block mb-1">Max p99 Latency</span>
                <span className="text-sm font-bold text-amber-400 font-mono">
                  {Math.max(...latencyHistory.map((d) => d.p99))} ms
                </span>
              </div>
            </div>
          </div>

          {/* Target Health Quick List */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-base font-semibold text-white flex items-center gap-2">
                  <Radio className="w-4 h-4 text-cyan-400" /> Target Status Overview
                </h3>
                <button
                  onClick={() => setActiveTab('targets')}
                  className="text-xs text-indigo-400 hover:text-indigo-300 font-medium"
                >
                  View All &rarr;
                </button>
              </div>

              <div className="space-y-3">
                {targets.map((target) => (
                  <div
                    key={target.id}
                    onClick={() => {
                      setSelectedTargetId(target.id);
                      setActiveTab('targets');
                    }}
                    className="p-3 rounded-lg bg-slate-950/60 border border-slate-800/80 hover:border-slate-700 cursor-pointer transition-all flex items-center justify-between"
                  >
                    <div className="min-w-0 pr-2">
                      <div className="text-xs font-semibold text-slate-200 truncate">{target.name}</div>
                      <div className="text-[10px] text-slate-400 font-mono truncate">{target.endpoint}</div>
                    </div>

                    <div className="flex items-center gap-3 shrink-0">
                      <div className="text-right">
                        <div className="text-xs font-mono font-bold text-white">
                          {target.status === 'offline' ? '—' : `${target.latencyMs}ms`}
                        </div>
                        <div className="text-[10px] text-slate-400 font-mono">
                          {target.throughputOps > 0 ? `${target.throughputOps} ops/s` : '0 ops/s'}
                        </div>
                      </div>

                      <span
                        className={`w-2.5 h-2.5 rounded-full ${
                          target.status === 'healthy'
                            ? 'bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]'
                            : target.status === 'degraded'
                            ? 'bg-amber-500 shadow-[0_0_8px_rgba(245,158,11,0.5)]'
                            : 'bg-rose-500 shadow-[0_0_8px_rgba(244,63,94,0.5)]'
                        }`}
                      ></span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
              <span>Auto-Failover Protection</span>
              <span className="text-emerald-400 font-medium flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> ACTIVE
              </span>
            </div>
          </div>
        </div>
      )}

      {/* TAB 2: TARGET HEALTH MATRIX */}
      {activeTab === 'targets' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {targets.map((target) => (
              <div
                key={target.id}
                className={`bg-slate-900/90 border rounded-xl p-5 transition-all shadow-md ${
                  selectedTargetId === target.id
                    ? 'border-indigo-500 ring-1 ring-indigo-500/50'
                    : 'border-slate-800 hover:border-slate-700'
                }`}
              >
                <div className="flex items-start justify-between mb-3">
                  <div>
                    <span className="text-[10px] font-mono uppercase tracking-wider text-indigo-400 px-2 py-0.5 rounded bg-indigo-500/10 border border-indigo-500/20">
                      {target.type.replace('_', ' ')}
                    </span>
                    <h3 className="text-sm font-bold text-white mt-2">{target.name}</h3>
                  </div>

                  <span
                    className={`px-2 py-0.5 rounded-full text-[10px] font-semibold flex items-center gap-1 border ${
                      target.status === 'healthy'
                        ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                        : target.status === 'degraded'
                        ? 'bg-amber-500/10 border-amber-500/30 text-amber-400'
                        : 'bg-rose-500/10 border-rose-500/30 text-rose-400'
                    }`}
                  >
                    {target.status === 'healthy' && <CheckCircle2 className="w-3 h-3" />}
                    {target.status === 'degraded' && <AlertTriangle className="w-3 h-3" />}
                    {target.status === 'offline' && <XCircle className="w-3 h-3" />}
                    {target.status.toUpperCase()}
                  </span>
                </div>

                <div className="text-[11px] font-mono text-slate-400 bg-slate-950 p-2 rounded border border-slate-800/80 mb-4 truncate">
                  {target.endpoint}
                </div>

                <div className="grid grid-cols-2 gap-3 pt-2 border-t border-slate-800/80 text-xs">
                  <div>
                    <span className="text-slate-500 text-[10px] block">Mean Latency</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {target.status === 'offline' ? 'N/A' : `${target.latencyMs} ms`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">p95 / p99 Target</span>
                    <span className="font-mono font-semibold text-slate-200">
                      {target.status === 'offline' ? 'N/A' : `${target.p95Ms}ms / ${target.p99Ms}ms`}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Success Rate</span>
                    <span className={`font-mono font-semibold ${target.successRate > 99 ? 'text-emerald-400' : target.successRate > 95 ? 'text-amber-400' : 'text-rose-400'}`}>
                      {target.successRate}%
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 text-[10px] block">Active Streams</span>
                    <span className="font-mono font-semibold text-slate-200">{target.activeStreams} sockets</span>
                  </div>
                </div>

                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-400">
                  <span>Heartbeat: {target.lastHeartbeat}</span>
                  <span className="font-mono text-slate-500">{target.region}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* TAB 3: ERROR LOGS & DISPATCH EXCEPTIONS */}
      {activeTab === 'errors' && (
        <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5 shadow-xl">
          {/* Filters Bar */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 mb-5 pb-4 border-b border-slate-800">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search error codes, messages, or targets..."
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
              />
            </div>

            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Severity:</span>
                <select
                  value={selectedSeverity}
                  onChange={(e) => setSelectedSeverity(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                >
                  <option value="all">All Severities</option>
                  <option value="critical">Critical</option>
                  <option value="warning">Warning</option>
                  <option value="info">Info</option>
                </select>
              </div>

              {selectedTargetId && (
                <button
                  onClick={() => setSelectedTargetId(null)}
                  className="text-xs text-indigo-400 hover:text-indigo-300 underline"
                >
                  Clear Target Filter
                </button>
              )}
            </div>
          </div>

          {/* Logs Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 font-medium">
                  <th className="py-2.5 px-3">Timestamp</th>
                  <th className="py-2.5 px-3">Target Endpoint</th>
                  <th className="py-2.5 px-3">Severity</th>
                  <th className="py-2.5 px-3">Error Code</th>
                  <th className="py-2.5 px-3">Message Summary</th>
                  <th className="py-2.5 px-3 text-right">Attempt Latency</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.length > 0 ? (
                  filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3 px-3 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-3 font-semibold text-white whitespace-nowrap">{log.targetName}</td>
                      <td className="py-3 px-3">
                        <span
                          className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === 'critical'
                              ? 'bg-rose-500/10 border border-rose-500/30 text-rose-400'
                              : log.severity === 'warning'
                              ? 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
                              : 'bg-blue-500/10 border border-blue-500/30 text-blue-400'
                          }`}
                        >
                          {log.severity.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-3 px-3 text-indigo-300 font-bold">{log.code}</td>
                      <td className="py-3 px-3 text-slate-300 font-sans max-w-xs truncate">{log.message}</td>
                      <td className="py-3 px-3 text-right text-slate-400">
                        {log.latencyAttempt > 0 ? `${log.latencyAttempt} ms` : '—'}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 font-sans">
                      No matching dispatch exceptions or error events recorded.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default BridgeMetricsMonitor;