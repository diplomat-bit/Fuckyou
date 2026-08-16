import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  Clock,
  AlertTriangle,
  Cpu,
  HardDrive,
  Server,
  TrendingUp,
  TrendingDown,
  RefreshCw,
  Zap,
  CheckCircle2,
  XCircle,
  BarChart3,
  ShieldCheck,
  Sliders,
  Download,
  Search,
  Filter,
  Database,
  Layers,
  Terminal,
  Play,
  Pause,
  ArrowUpRight,
  Radio,
  Wifi,
  Globe,
  Settings
} from 'lucide-react';

// --- Interfaces ---
export interface TelemetryPoint {
  timestamp: string;
  timeLabel: string;
  rps: number;
  p50Latency: number;
  p95Latency: number;
  p99Latency: number;
  errorRate: number;
  cpuUsage: number;
  memoryUsage: number;
  status2xx: number;
  status4xx: number;
  status5xx: number;
}

export interface MicroserviceNode {
  id: string;
  name: string;
  cluster: string;
  region: string;
  status: 'healthy' | 'degraded' | 'critical';
  rps: number;
  avgLatencyMs: number;
  errorRatePercent: number;
  cpuPct: number;
  memoryMb: number;
  uptimePct: number;
  instances: number;
}

export interface TelemetryAlert {
  id: string;
  timestamp: string;
  service: string;
  severity: 'info' | 'warning' | 'error' | 'critical';
  message: string;
  traceId: string;
}

// --- Initial Mock Data Generators ---
const SERVICES_LIST: Omit<MicroserviceNode, 'rps' | 'avgLatencyMs' | 'errorRatePercent' | 'cpuPct' | 'memoryMb'>[] = [
  { id: 'srv-01', name: 'CitiConnect Gateway', cluster: 'prod-us-east-1', region: 'us-east-1', status: 'healthy', uptimePct: 99.98, instances: 12 },
  { id: 'srv-02', name: 'Modern Treasury Ledger Hub', cluster: 'prod-us-east-1', region: 'us-east-1', status: 'healthy', uptimePct: 99.99, instances: 8 },
  { id: 'srv-03', name: 'Vertex AI Proxy', cluster: 'prod-ai-west-2', region: 'us-west-2', status: 'healthy', uptimePct: 99.91, instances: 24 },
  { id: 'srv-04', name: 'PQC Crypto Bridge Simulator', cluster: 'gov-cloud-east', region: 'us-gov-east-1', status: 'degraded', uptimePct: 98.45, instances: 4 },
  { id: 'srv-05', name: 'B2B Cash Flow Stress Tester', cluster: 'prod-us-east-1', region: 'us-east-1', status: 'healthy', uptimePct: 100.0, instances: 6 },
  { id: 'srv-06', name: 'Azure AD App Auditor', cluster: 'corp-auth-mesh', region: 'eu-central-1', status: 'healthy', uptimePct: 99.95, instances: 10 },
  { id: 'srv-07', name: 'Voter Registration Portal', cluster: 'gov-cloud-west', region: 'us-gov-west-1', status: 'healthy', uptimePct: 99.99, instances: 16 },
  { id: 'srv-08', name: 'BigQuery Emulator & Sync', cluster: 'data-analytics-01', region: 'us-east-1', status: 'healthy', uptimePct: 99.87, instances: 6 }
];

const INITIAL_ALERTS: TelemetryAlert[] = [
  { id: 'alt-101', timestamp: 'Just now', service: 'PQC Crypto Bridge Simulator', severity: 'warning', message: 'Entropy pool depth dropped below 15% threshold during key exchange batch', traceId: 'tr-992a01bf' },
  { id: 'alt-102', timestamp: '2m ago', service: 'CitiConnect Gateway', severity: 'info', message: 'mTLS certificate rotation completed successfully for peer node citi-auth-9', traceId: 'tr-4410e28c' },
  { id: 'alt-103', timestamp: '5m ago', service: 'Vertex AI Proxy', severity: 'warning', message: 'Token throughput spike detected on model endpoint gemini-1.5-pro', traceId: 'tr-1109aef8' },
  { id: 'alt-104', timestamp: '12m ago', service: 'Modern Treasury Ledger Hub', severity: 'error', message: 'CAMT.053 reconciliation timeout on secondary webhook pipeline', traceId: 'tr-8831c090' },
  { id: 'alt-105', timestamp: '18m ago', service: 'Azure AD App Auditor', severity: 'info', message: 'Graph API token cache re-indexed with zero cache misses', traceId: 'tr-3381a17b' }
];

export const AppMetricsDashboard: React.FC = () => {
  // --- States ---
  const [refreshInterval, setRefreshInterval] = useState<number>(3000); // ms
  const [isLive, setIsLive] = useState<boolean>(true);
  const [selectedServiceFilter, setSelectedServiceFilter] = useState<string>('all');
  const [selectedRegionFilter, setSelectedRegionFilter] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [telemetryHistory, setTelemetryHistory] = useState<TelemetryPoint[]>([]);
  const [services, setServices] = useState<MicroserviceNode[]>([]);
  const [alerts, setAlerts] = useState<TelemetryAlert[]>(INITIAL_ALERTS);
  const [selectedNode, setSelectedNode] = useState<MicroserviceNode | null>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'traces' | 'resources'>('overview');

  // --- Initialize Time Series Data ---
  useEffect(() => {
    const points: TelemetryPoint[] = [];
    const now = Date.now();
    for (let i = 20; i >= 0; i--) {
      const time = new Date(now - i * 10000);
      const timeLabel = time.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });
      const baseRps = 1420 + Math.floor(Math.sin(i * 0.5) * 200) + Math.floor(Math.random() * 80);
      points.push({
        timestamp: time.toISOString(),
        timeLabel,
        rps: baseRps,
        p50Latency: 14 + Math.floor(Math.random() * 6),
        p95Latency: 42 + Math.floor(Math.random() * 18),
        p99Latency: 110 + Math.floor(Math.random() * 35),
        errorRate: Number((0.08 + Math.random() * 0.12).toFixed(2)),
        cpuUsage: 48 + Math.floor(Math.sin(i * 0.3) * 15) + Math.floor(Math.random() * 5),
        memoryUsage: 64 + Math.floor(Math.random() * 4),
        status2xx: Math.floor(baseRps * 0.985),
        status4xx: Math.floor(baseRps * 0.012),
        status5xx: Math.floor(baseRps * 0.003)
      });
    }
    setTelemetryHistory(points);

    // Initial Service Status
    const initialServices: MicroserviceNode[] = SERVICES_LIST.map((s) => ({
      ...s,
      rps: Math.floor(120 + Math.random() * 400),
      avgLatencyMs: Math.floor(12 + Math.random() * 40),
      errorRatePercent: Number((Math.random() * 0.25).toFixed(2)),
      cpuPct: Math.floor(30 + Math.random() * 45),
      memoryMb: Math.floor(512 + Math.random() * 2048)
    }));
    setServices(initialServices);
  }, []);

  // --- Live Dynamic Data Update Loop ---
  useEffect(() => {
    if (!isLive || refreshInterval === 0) return;

    const interval = setInterval(() => {
      const now = new Date();
      const timeLabel = now.toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' });

      setTelemetryHistory((prev) => {
        const last = prev[prev.length - 1] || { rps: 1500, p50Latency: 16, p95Latency: 48, p99Latency: 120, errorRate: 0.1, cpuUsage: 50, memoryUsage: 65 };
        const deltaRps = Math.floor((Math.random() - 0.48) * 120);
        const newRps = Math.max(800, Math.min(3200, last.rps + deltaRps));
        const newP50 = Math.max(8, Math.min(40, last.p50Latency + Math.floor((Math.random() - 0.5) * 4)));
        const newP95 = Math.max(25, Math.min(120, newP50 * 2.8 + Math.floor(Math.random() * 15)));
        const newP99 = Math.max(60, Math.min(350, newP95 * 2.2 + Math.floor(Math.random() * 25)));
        const newErr = Number(Math.max(0.01, Math.min(2.5, last.errorRate + (Math.random() - 0.52) * 0.08)).toFixed(2));
        const newCpu = Math.max(20, Math.min(95, last.cpuUsage + Math.floor((Math.random() - 0.5) * 6)));
        const newMem = Math.max(40, Math.min(92, last.memoryUsage + Math.floor((Math.random() - 0.48) * 2)));

        const newPoint: TelemetryPoint = {
          timestamp: now.toISOString(),
          timeLabel,
          rps: newRps,
          p50Latency: newP50,
          p95Latency: newP95,
          p99Latency: newP99,
          errorRate: newErr,
          cpuUsage: newCpu,
          memoryUsage: newMem,
          status2xx: Math.floor(newRps * (1 - newErr / 100)),
          status4xx: Math.floor(newRps * (newErr / 100) * 0.7),
          status5xx: Math.floor(newRps * (newErr / 100) * 0.3)
        };

        const updated = [...prev.slice(1), newPoint];
        return updated;
      });

      // Fluctuate Microservices Metrics
      setServices((prevServices) =>
        prevServices.map((node) => {
          const cpuDelta = Math.floor((Math.random() - 0.5) * 8);
          const rpsDelta = Math.floor((Math.random() - 0.5) * 30);
          const newCpu = Math.max(15, Math.min(98, node.cpuPct + cpuDelta));
          const isDegraded = newCpu > 85 || node.errorRatePercent > 1.2;

          return {
            ...node,
            cpuPct: newCpu,
            rps: Math.max(20, node.rps + rpsDelta),
            avgLatencyMs: Math.max(5, node.avgLatencyMs + Math.floor((Math.random() - 0.5) * 4)),
            errorRatePercent: Number(Math.max(0, node.errorRatePercent + (Math.random() - 0.51) * 0.05).toFixed(2)),
            status: isDegraded ? 'degraded' : node.status === 'degraded' && newCpu < 75 ? 'healthy' : node.status
          };
        })
      );

      // Occasionally generate dynamic telemetry log
      if (Math.random() < 0.25) {
        const randomSrv = SERVICES_LIST[Math.floor(Math.random() * SERVICES_LIST.length)].name;
        const severities: TelemetryAlert['severity'][] = ['info', 'info', 'warning', 'error'];
        const chosenSev = severities[Math.floor(Math.random() * severities.length)];
        const sampleMsgs = {
          info: 'Automated pod autoscaling trigger evaluated: operational headroom optimal',
          warning: 'High connection pool utilization observed on primary DB read-replica',
          error: 'Transient RPC connection timeout to external bank authorization endpoint',
          critical: 'Hardware Security Module (HSM) key latency exceeded 500ms limit'
        };

        const newAlert: TelemetryAlert = {
          id: `alt-${Date.now().toString().slice(-4)}`,
          timestamp: timeLabel,
          service: randomSrv,
          severity: chosenSev,
          message: sampleMsgs[chosenSev],
          traceId: `tr-${Math.random().toString(16).substring(2, 10)}`
        };

        setAlerts((prev) => [newAlert, ...prev.slice(0, 24)]);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isLive, refreshInterval]);

  // --- Aggregate Computations ---
  const latestMetrics = useMemo(() => {
    if (telemetryHistory.length === 0) {
      return { rps: 0, p50Latency: 0, p95Latency: 0, p99Latency: 0, errorRate: 0, cpuUsage: 0, memoryUsage: 0 };
    }
    return telemetryHistory[telemetryHistory.length - 1];
  }, [telemetryHistory]);

  const aggregateRpsTrend = useMemo(() => {
    if (telemetryHistory.length < 2) return 0;
    const curr = telemetryHistory[telemetryHistory.length - 1].rps;
    const prev = telemetryHistory[telemetryHistory.length - 2].rps;
    return Number((((curr - prev) / prev) * 100).toFixed(1));
  }, [telemetryHistory]);

  const filteredServices = useMemo(() => {
    return services.filter((srv) => {
      const matchesSearch = srv.name.toLowerCase().includes(searchQuery.toLowerCase()) || srv.cluster.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesService = selectedServiceFilter === 'all' || srv.id === selectedServiceFilter;
      const matchesRegion = selectedRegionFilter === 'all' || srv.region === selectedRegionFilter;
      return matchesSearch && matchesService && matchesRegion;
    });
  }, [services, searchQuery, selectedServiceFilter, selectedRegionFilter]);

  // Helper for Exporting JSON
  const handleExportTelemetry = useCallback(() => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify({ telemetryHistory, services, alerts }, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `telemetry_export_${new Date().toISOString().slice(0, 19)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  }, [telemetryHistory, services, alerts]);

  // SVG Line Chart Drawer
  const renderAreaChart = (
    data: TelemetryPoint[],
    dataKey: 'rps' | 'p95Latency' | 'cpuUsage' | 'errorRate',
    strokeColor: string,
    fillGradientId: string,
    maxYVal?: number
  ) => {
    if (!data || data.length === 0) return null;

    const height = 180;
    const width = 600;
    const padding = 20;

    const values = data.map((d) => d[dataKey] as number);
    const maxVal = maxYVal || Math.max(...values, 1) * 1.15;
    const minVal = 0;

    const pointsCoordinates = data.map((d, index) => {
      const x = padding + (index / (data.length - 1)) * (width - padding * 2);
      const y = height - padding - (( (d[dataKey] as number) - minVal) / (maxVal - minVal)) * (height - padding * 2);
      return { x, y };
    });

    const dPath = pointsCoordinates.reduce((acc, pt, idx) => {
      return idx === 0 ? `M ${pt.x},${pt.y}` : `${acc} L ${pt.x},${pt.y}`;
    }, '');

    const areaPath = `${dPath} L ${pointsCoordinates[pointsCoordinates.length - 1].x},${height - padding} L ${pointsCoordinates[0].x},${height - padding} Z`;

    return (
      <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-full overflow-visible">
        <defs>
          <linearGradient id={fillGradientId} x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={strokeColor} stopOpacity={0.35} />
            <stop offset="100%" stopColor={strokeColor} stopOpacity={0.0} />
          </linearGradient>
        </defs>

        {/* Grid lines */}
        {[0, 0.25, 0.5, 0.75, 1].map((pct) => {
          const y = height - padding - pct * (height - padding * 2);
          return (
            <line key={pct} x1={padding} y1={y} x2={width - padding} y2={y} stroke="#334155" strokeDasharray="3 3" strokeOpacity={0.5} />
          );
        })}

        {/* Area Fill */}
        <path d={areaPath} fill={`url(#${fillGradientId})`} />

        {/* Line */}
        <path d={dPath} fill="none" stroke={strokeColor} strokeWidth={2.5} strokeLinecap="round" strokeLinejoin="round" />

        {/* Live Pulse on Last Point */}
        {pointsCoordinates.length > 0 && (
          <g transform={`translate(${pointsCoordinates[pointsCoordinates.length - 1].x}, ${pointsCoordinates[pointsCoordinates.length - 1].y})`}>
            <circle r={5} fill={strokeColor} className="animate-ping opacity-75" />
            <circle r={4} fill={strokeColor} stroke="#0f172a" strokeWidth={2} />
          </g>
        )}
      </svg>
    );
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans antialiased selection:bg-cyan-500 selection:text-slate-950">
      {/* --- Top Header Navigation & Live Controls --- */}
      <header className="mb-8 flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-cyan-600 to-blue-600 text-white shadow-lg shadow-cyan-500/20">
              <Activity className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
                Telemetry & System Performance Dashboard
              </h1>
              <p className="text-sm text-slate-400 mt-0.5 flex items-center gap-2">
                <span>Real-time microservice latency, global RPS, request errors, and infrastructure health</span>
                <span className="inline-block w-1.5 h-1.5 rounded-full bg-slate-600" />
                <span className="text-cyan-400 font-mono text-xs">v4.18.2-prod</span>
              </p>
            </div>
          </div>
        </div>

        {/* Live Controller Toolbar */}
        <div className="flex flex-wrap items-center gap-3 bg-slate-900/90 border border-slate-800 p-2 rounded-2xl backdrop-blur-md">
          {/* Live Indicator Toggle */}
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold transition-all ${
              isLive
                ? 'bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 shadow-sm shadow-emerald-500/20'
                : 'bg-amber-500/10 border border-amber-500/30 text-amber-400'
            }`}
          >
            {isLive ? (
              <>
                <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span>STREAMING LIVE</span>
              </>
            ) : (
              <>
                <Pause className="w-4 h-4 text-amber-400" />
                <span>STREAM PAUSED</span>
              </>
            )}
          </button>

          {/* Refresh Frequency Selector */}
          <div className="flex items-center gap-1.5 bg-slate-950/60 border border-slate-800 px-2.5 py-1.5 rounded-xl text-xs">
            <Clock className="w-3.5 h-3.5 text-slate-400" />
            <span className="text-slate-400 text-[11px]">Interval:</span>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer"
            >
              <option value={1000} className="bg-slate-900 text-slate-200">1.0s</option>
              <option value={3000} className="bg-slate-900 text-slate-200">3.0s</option>
              <option value={5000} className="bg-slate-900 text-slate-200">5.0s</option>
              <option value={10000} className="bg-slate-900 text-slate-200">10.0s</option>
            </select>
          </div>

          {/* Data Export Button */}
          <button
            onClick={handleExportTelemetry}
            className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-200 border border-slate-700 transition-colors"
            title="Export raw telemetry history as JSON"
          >
            <Download className="w-3.5 h-3.5 text-cyan-400" />
            <span className="hidden sm:inline">Export JSON</span>
          </button>
        </div>
      </header>

      {/* --- Key Metrics Overview Cards --- */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {/* Total RPS Card */}
        <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Global Throughput</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
              {latestMetrics.rps.toLocaleString()} <span className="text-sm font-sans font-normal text-slate-400">req/s</span>
            </div>
            <div className={`flex items-center text-xs font-medium ${aggregateRpsTrend >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
              {aggregateRpsTrend >= 0 ? <TrendingUp className="w-3.5 h-3.5 mr-0.5" /> : <TrendingDown className="w-3.5 h-3.5 mr-0.5" />}
              {Math.abs(aggregateRpsTrend)}%
            </div>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Peak capacity: 10,000 rps</span>
            <span className="text-cyan-400 font-mono">{((latestMetrics.rps / 10000) * 100).toFixed(1)}% load</span>
          </div>
        </div>

        {/* p95 Request Latency */}
        <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">p95 Request Latency</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Clock className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
              {latestMetrics.p95Latency} <span className="text-sm font-sans font-normal text-slate-400">ms</span>
            </div>
            <span className="text-xs font-mono text-slate-400">
              p50: <strong className="text-slate-200">{latestMetrics.p50Latency}ms</strong>
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>SLA Limit: &lt;150ms</span>
            <span className="text-emerald-400 font-mono">p99: {latestMetrics.p99Latency}ms</span>
          </div>
        </div>

        {/* Error Rate */}
        <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">HTTP Error Rate</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 border border-rose-500/20">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
              {latestMetrics.errorRate}%
            </div>
            <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${latestMetrics.errorRate < 0.5 ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'}`}>
              {latestMetrics.errorRate < 0.5 ? 'Nominal' : 'Elevated'}
            </span>
          </div>
          <div className="mt-3 text-[11px] text-slate-500 flex items-center justify-between">
            <span>Success: {(100 - latestMetrics.errorRate).toFixed(2)}%</span>
            <span className="text-slate-400 font-mono">{latestMetrics.status5xx} 5xx errors/s</span>
          </div>
        </div>

        {/* Infrastructure Utilization */}
        <div className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-2xl p-5 backdrop-blur-sm transition-all shadow-lg">
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">Cluster CPU / RAM</span>
            <div className="p-2 rounded-xl bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Cpu className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline justify-between">
            <div className="text-2xl md:text-3xl font-extrabold text-white font-mono tracking-tight">
              {latestMetrics.cpuUsage}%
            </div>
            <span className="text-xs font-mono text-slate-400">
              RAM: <strong className="text-slate-200">{latestMetrics.memoryUsage}%</strong>
            </span>
          </div>
          {/* Progress Bar */}
          <div className="mt-3 w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
            <div
              className="bg-gradient-to-r from-cyan-500 to-amber-500 h-full transition-all duration-500"
              style={{ width: `${latestMetrics.cpuUsage}%` }}
            />
          </div>
        </div>
      </section>

      {/* --- Main Dashboard View Tabs --- */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab('overview')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'overview'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart3 className="w-4 h-4" />
          <span>Metrics & Charts</span>
        </button>
        <button
          onClick={() => setActiveTab('services')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'services'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Server className="w-4 h-4" />
          <span>Services Matrix ({services.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('traces')}
          className={`flex items-center gap-2 px-4 py-2.5 text-sm font-semibold border-b-2 transition-all ${
            activeTab === 'traces'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          <span>Real-time Traces & Logs</span>
          {alerts.filter((a) => a.severity === 'error' || a.severity === 'warning').length > 0 && (
            <span className="px-1.5 py-0.5 text-[10px] bg-rose-500/20 text-rose-400 rounded-full font-mono">
              {alerts.filter((a) => a.severity === 'error' || a.severity === 'warning').length}
            </span>
          )}
        </button>
      </div>

      {/* --- TAB 1: OVERVIEW CHARTS --- */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
          {/* Latency Percentiles Chart */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Clock className="w-4 h-4 text-cyan-400" />
                  <span>Request Latency Profile (ms)</span>
                </h3>
                <p className="text-xs text-slate-400">p50, p95, and p99 distribution over time</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-cyan-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-cyan-400 inline-block" /> p95
                </span>
              </div>
            </div>
            <div className="h-52 w-full">
              {renderAreaChart(telemetryHistory, 'p95Latency', '#22d3ee', 'grad-latency')}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Min: {Math.min(...telemetryHistory.map((t) => t.p95Latency || 0))}ms</span>
              <span>Avg: {(telemetryHistory.reduce((a, b) => a + b.p95Latency, 0) / (telemetryHistory.length || 1)).toFixed(1)}ms</span>
              <span>Max: {Math.max(...telemetryHistory.map((t) => t.p95Latency || 0))}ms</span>
            </div>
          </div>

          {/* Global RPS Chart */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Zap className="w-4 h-4 text-emerald-400" />
                  <span>Throughput Trend (Requests / Sec)</span>
                </h3>
                <p className="text-xs text-slate-400">Aggregated payload volume across all API routes</p>
              </div>
              <div className="flex items-center gap-3 text-xs font-mono">
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 inline-block" /> RPS
                </span>
              </div>
            </div>
            <div className="h-52 w-full">
              {renderAreaChart(telemetryHistory, 'rps', '#34d399', 'grad-rps')}
            </div>
            <div className="mt-4 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
              <span>Lowest: {Math.min(...telemetryHistory.map((t) => t.rps || 0))} req/s</span>
              <span>Peak: {Math.max(...telemetryHistory.map((t) => t.rps || 0))} req/s</span>
            </div>
          </div>

          {/* HTTP Status Breakdown Chart */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>HTTP Response Code Distribution</span>
                </h3>
                <p className="text-xs text-slate-400">Proportion of 2xx, 4xx, and 5xx status codes</p>
              </div>
            </div>

            <div className="space-y-4 my-2">
              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-emerald-400 font-semibold flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" /> 2xx Success Responses
                  </span>
                  <span className="text-slate-300">{latestMetrics.status2xx} req/s</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full transition-all duration-300"
                    style={{ width: `${Math.min(100, (latestMetrics.status2xx / (latestMetrics.rps || 1)) * 100)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-amber-400 font-semibold flex items-center gap-1">
                    <AlertTriangle className="w-3.5 h-3.5" /> 4xx Client Errors (Validation, Auth)
                  </span>
                  <span className="text-slate-300">{latestMetrics.status4xx} req/s</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-amber-500 h-full transition-all duration-300"
                    style={{ width: `${Math.max(2, (latestMetrics.status4xx / (latestMetrics.rps || 1)) * 100 * 10)}%` }}
                  />
                </div>
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1.5 font-mono">
                  <span className="text-rose-400 font-semibold flex items-center gap-1">
                    <XCircle className="w-3.5 h-3.5" /> 5xx Server Faults (Uncaught Exception, Timeout)
                  </span>
                  <span className="text-slate-300">{latestMetrics.status5xx} req/s</span>
                </div>
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden">
                  <div
                    className="bg-rose-500 h-full transition-all duration-300"
                    style={{ width: `${Math.max(1, (latestMetrics.status5xx / (latestMetrics.rps || 1)) * 100 * 20)}%` }}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Cluster CPU Load Trend */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-md">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-amber-400" />
                  <span>Aggregated CPU Utilization (%)</span>
                </h3>
                <p className="text-xs text-slate-400">Cluster-wide core capacity usage across pods</p>
              </div>
              <span className="text-xs font-mono text-amber-400 font-bold">{latestMetrics.cpuUsage}%</span>
            </div>
            <div className="h-52 w-full">
              {renderAreaChart(telemetryHistory, 'cpuUsage', '#f59e0b', 'grad-cpu', 100)}
            </div>
          </div>
        </div>
      )}

      {/* --- TAB 2: SERVICES MATRIX TABLE --- */}
      {(activeTab === 'services' || activeTab === 'overview') && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl mb-8">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
            <div>
              <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                <Server className="w-5 h-5 text-cyan-400" />
                <span>Microservice Node Health Matrix</span>
              </h2>
              <p className="text-xs text-slate-400">Detailed health, memory footprint, and RPS breakdown per service</p>
            </div>

            {/* Filter controls */}
            <div className="flex flex-wrap items-center gap-2.5">
              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                <input
                  type="text"
                  placeholder="Filter by name..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-cyan-500 w-44"
                />
              </div>

              {/* Region Selector */}
              <select
                value={selectedRegionFilter}
                onChange={(e) => setSelectedRegionFilter(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-1.5 text-xs text-slate-300 focus:outline-none cursor-pointer"
              >
                <option value="all">All Regions</option>
                <option value="us-east-1">us-east-1</option>
                <option value="us-west-2">us-west-2</option>
                <option value="us-gov-east-1">us-gov-east-1</option>
                <option value="us-gov-west-1">us-gov-west-1</option>
                <option value="eu-central-1">eu-central-1</option>
              </select>
            </div>
          </div>

          {/* Service Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-[11px] uppercase tracking-wider text-slate-400 bg-slate-950/40">
                  <th className="py-3 px-4 font-semibold">Service Name</th>
                  <th className="py-3 px-4 font-semibold">Cluster / Region</th>
                  <th className="py-3 px-4 font-semibold">Status</th>
                  <th className="py-3 px-4 font-semibold text-right">Throughput</th>
                  <th className="py-3 px-4 font-semibold text-right">Avg Latency</th>
                  <th className="py-3 px-4 font-semibold text-right">CPU Load</th>
                  <th className="py-3 px-4 font-semibold text-right">RAM (MB)</th>
                  <th className="py-3 px-4 font-semibold text-center">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                {filteredServices.length === 0 ? (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-500 font-sans">
                      No matching microservices found. Try adjusting filters.
                    </td>
                  </tr>
                ) : (
                  filteredServices.map((node) => (
                    <tr
                      key={node.id}
                      className="hover:bg-slate-800/40 transition-colors group cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <td className="py-3.5 px-4 font-sans font-semibold text-slate-200 flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full bg-cyan-400" />
                        {node.name}
                      </td>
                      <td className="py-3.5 px-4 text-slate-400 font-sans">
                        <div className="text-slate-300 text-xs">{node.cluster}</div>
                        <div className="text-[10px] text-slate-500 flex items-center gap-1">
                          <Globe className="w-3 h-3 text-slate-500" /> {node.region}
                        </div>
                      </td>
                      <td className="py-3.5 px-4">
                        <span
                          className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[11px] font-sans font-medium capitalize border ${
                            node.status === 'healthy'
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              node.status === 'healthy' ? 'bg-emerald-400' : 'bg-amber-400 animate-ping'
                            }`}
                          />
                          {node.status}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-200">
                        {node.rps} <span className="text-slate-500 text-[10px]">rps</span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <span className={node.avgLatencyMs > 50 ? 'text-amber-400 font-bold' : 'text-slate-300'}>
                          {node.avgLatencyMs} ms
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <span className={node.cpuPct > 80 ? 'text-rose-400 font-bold' : 'text-slate-300'}>
                            {node.cpuPct}%
                          </span>
                          <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                            <div
                              className={`h-full ${node.cpuPct > 80 ? 'bg-rose-500' : 'bg-cyan-500'}`}
                              style={{ width: `${node.cpuPct}%` }}
                            />
                          </div>
                        </div>
                      </td>
                      <td className="py-3.5 px-4 text-right text-slate-400">{node.memoryMb} MB</td>
                      <td className="py-3.5 px-4 text-center font-sans">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedNode(node);
                          }}
                          className="px-2.5 py-1 text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg border border-slate-700 transition-colors"
                        >
                          Details
                        </button>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </section>
      )}

      {/* --- TAB 3: TRACES & ALERTS LOG STREAM --- */}
      {activeTab === 'traces' && (
        <section className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5 backdrop-blur-sm shadow-xl">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-slate-100 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-cyan-400" />
              <span>Live Distributed Telemetry Stream</span>
            </h2>
            <span className="text-xs text-slate-400 font-mono">
              Showing last {alerts.length} ingested log spans
            </span>
          </div>

          <div className="bg-slate-950 border border-slate-800/90 rounded-xl p-4 font-mono text-xs space-y-2.5 max-h-[500px] overflow-y-auto">
            {alerts.map((alt) => (
              <div
                key={alt.id}
                className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 p-2.5 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/50 transition-colors"
              >
                <div className="flex items-start sm:items-center gap-2.5">
                  <span
                    className={`px-2 py-0.5 rounded text-[10px] uppercase font-bold tracking-wider ${
                      alt.severity === 'critical'
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : alt.severity === 'error'
                        ? 'bg-rose-500/10 text-rose-300'
                        : alt.severity === 'warning'
                        ? 'bg-amber-500/10 text-amber-400'
                        : 'bg-cyan-500/10 text-cyan-400'
                    }`}
                  >
                    {alt.severity}
                  </span>
                  <span className="text-slate-400 text-[11px]">{alt.timestamp}</span>
                  <span className="text-slate-300 font-semibold text-xs">[{alt.service}]</span>
                  <span className="text-slate-200 font-sans text-xs">{alt.message}</span>
                </div>
                <div className="flex items-center gap-2 text-[10px] text-slate-500 self-end sm:self-auto">
                  <span>trace:</span>
                  <span className="text-cyan-400 hover:underline cursor-pointer">{alt.traceId}</span>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {/* --- SERVICE INSPECTION MODAL --- */}
      {selectedNode && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-lg w-full p-6 shadow-2xl relative animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => setSelectedNode(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-100 text-sm p-1 rounded-lg bg-slate-800"
            >
              ✕
            </button>

            <div className="flex items-center gap-3 mb-4">
              <div className="p-3 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
                <Server className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-slate-100">{selectedNode.name}</h3>
                <p className="text-xs text-slate-400 font-mono">ID: {selectedNode.id} • {selectedNode.cluster}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 mb-6 font-mono text-xs">
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Active Instances</div>
                <div className="text-base font-bold text-slate-200 mt-1">{selectedNode.instances} pods</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Uptime Score</div>
                <div className="text-base font-bold text-emerald-400 mt-1">{selectedNode.uptimePct}%</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Current RPS</div>
                <div className="text-base font-bold text-cyan-400 mt-1">{selectedNode.rps} req/s</div>
              </div>
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800">
                <div className="text-slate-400 text-[10px] uppercase">Latency</div>
                <div className="text-base font-bold text-slate-200 mt-1">{selectedNode.avgLatencyMs} ms</div>
              </div>
            </div>

            <div className="flex items-center justify-end gap-3 pt-4 border-t border-slate-800">
              <button
                onClick={() => setSelectedNode(null)}
                className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 transition-colors"
              >
                Close Window
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppMetricsDashboard;