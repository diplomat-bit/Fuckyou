import React, { useState, useEffect, useContext, createContext, useMemo } from 'react';
import {
  Activity,
  AlertCircle,
  AlertTriangle,
  BarChart3,
  CheckCircle2,
  Clock,
  Cpu,
  Database,
  Download,
  Filter,
  HardDrive,
  Layers,
  RefreshCw,
  Search,
  Server,
  ShieldAlert,
  Sparkles,
  Terminal,
  Zap,
  ArrowUpDown,
  FileText,
  Radio
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES (Fallback / Integration Types)
// ============================================================================

export type HealthStatus = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE';

export interface QueryMetric {
  id: string;
  query: string;
  callCount: number;
  totalTimeMs: number;
  avgTimeMs: number;
  p95TimeMs: number;
  lockTimeMs: number;
  rowsAffected: number;
  indexScanRatio: number;
  cacheHitRatio: number;
  lastExecuted: string;
}

export interface TableStat {
  tableName: string;
  schemaName: string;
  rowCount: number;
  dataSizeMb: number;
  indexSizeMb: number;
  totalSizeMb: number;
  bloatPercentage: number;
  unusedIndexesCount: number;
  lastVacuum: string;
  lastAnalyze: string;
  seqScans: number;
  idxScans: number;
}

export interface ConnectionPoolStatus {
  activeConnections: number;
  idleConnections: number;
  waitingConnections: number;
  maxConnections: number;
  poolUtilizationPercentage: number;
  connectionErrors24h: number;
}

export interface DiagnosticLog {
  id: string;
  timestamp: string;
  severity: 'INFO' | 'WARN' | 'ERROR' | 'CRITICAL';
  component: string;
  message: string;
  details?: string;
  code?: string;
}

export interface DatabaseHealthMetrics {
  status: HealthStatus;
  uptimeSeconds: number;
  cpuUsagePercentage: number;
  memoryUsagePercentage: number;
  diskUsagePercentage: number;
  cacheHitRatioPercentage: number;
  replicationLagMs: number;
  transactionsPerSecond: number;
  deadlocks24h: number;
  activeLocks: number;
}

export interface DatabaseDiagnosticContextType {
  health: DatabaseHealthMetrics;
  queries: QueryMetric[];
  tableStats: TableStat[];
  connectionPool: ConnectionPoolStatus;
  logs: DiagnosticLog[];
  isLoading: boolean;
  isRefreshing: boolean;
  lastRefreshedAt: Date | null;
  autoRefreshEnabled: boolean;
  refreshIntervalMs: number;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setRefreshIntervalMs: (ms: number) => void;
  refreshDiagnostics: () => Promise<void>;
  runTableAnalyze: (tableName: string) => Promise<void>;
  killConnection: (connectionId: string) => Promise<boolean>;
  exportDiagnosticReport: (format: 'json' | 'csv') => void;
}

// ============================================================================
// CONTEXT CREATION & DEFAULT FALLBACK STATE
// ============================================================================

const defaultHealthMetrics: DatabaseHealthMetrics = {
  status: 'HEALTHY',
  uptimeSeconds: 1248920,
  cpuUsagePercentage: 24.5,
  memoryUsagePercentage: 61.2,
  diskUsagePercentage: 48.8,
  cacheHitRatioPercentage: 99.4,
  replicationLagMs: 12,
  transactionsPerSecond: 1420,
  deadlocks24h: 0,
  activeLocks: 14
};

const defaultConnectionPool: ConnectionPoolStatus = {
  activeConnections: 42,
  idleConnections: 18,
  waitingConnections: 0,
  maxConnections: 100,
  poolUtilizationPercentage: 60.0,
  connectionErrors24h: 1
};

const mockQueries: QueryMetric[] = [
  {
    id: 'q-1',
    query: 'SELECT * FROM sovereign_ledger WHERE tenant_id = $1 AND timestamp >= $2 ORDER BY sequence_num DESC LIMIT 100',
    callCount: 145020,
    totalTimeMs: 290040,
    avgTimeMs: 2.0,
    p95TimeMs: 4.8,
    lockTimeMs: 0.1,
    rowsAffected: 100,
    indexScanRatio: 99.8,
    cacheHitRatio: 98.9,
    lastExecuted: new Date(Date.now() - 5000).toISOString()
  },
  {
    id: 'q-2',
    query: 'UPDATE citi_account_balances SET balance = balance + $1, updated_at = NOW() WHERE account_id = $2',
    callCount: 89100,
    totalTimeMs: 445500,
    avgTimeMs: 5.0,
    p95TimeMs: 14.2,
    lockTimeMs: 1.2,
    rowsAffected: 1,
    indexScanRatio: 100.0,
    cacheHitRatio: 99.9,
    lastExecuted: new Date(Date.now() - 12000).toISOString()
  },
  {
    id: 'q-3',
    query: 'SELECT d.dossier_id, d.title, COUNT(v.verification_id) FROM dossiers d LEFT JOIN verifications v ON d.id = v.dossier_id GROUP BY d.dossier_id, d.title',
    callCount: 1240,
    totalTimeMs: 155000,
    avgTimeMs: 125.0,
    p95TimeMs: 410.5,
    lockTimeMs: 12.4,
    rowsAffected: 2400,
    indexScanRatio: 42.1,
    cacheHitRatio: 84.2,
    lastExecuted: new Date(Date.now() - 45000).toISOString()
  },
  {
    id: 'q-4',
    query: 'DELETE FROM audit_compliance_logs WHERE created_at < NOW() - INTERVAL \'90 days\' AND archived = true',
    callCount: 24,
    totalTimeMs: 18200,
    avgTimeMs: 758.3,
    p95TimeMs: 1850.0,
    lockTimeMs: 45.0,
    rowsAffected: 15420,
    indexScanRatio: 100.0,
    cacheHitRatio: 92.0,
    lastExecuted: new Date(Date.now() - 3600000).toISOString()
  }
];

const mockTableStats: TableStat[] = [
  {
    tableName: 'sovereign_ledger',
    schemaName: 'public',
    rowCount: 45200100,
    dataSizeMb: 8450.5,
    indexSizeMb: 3120.2,
    totalSizeMb: 11570.7,
    bloatPercentage: 4.2,
    unusedIndexesCount: 0,
    lastVacuum: new Date(Date.now() - 86400000 * 2).toISOString(),
    lastAnalyze: new Date(Date.now() - 3600000 * 4).toISOString(),
    seqScans: 120,
    idxScans: 4892010
  },
  {
    tableName: 'citi_account_balances',
    schemaName: 'public',
    rowCount: 1250000,
    dataSizeMb: 420.8,
    indexSizeMb: 185.4,
    totalSizeMb: 606.2,
    bloatPercentage: 8.5,
    unusedIndexesCount: 1,
    lastVacuum: new Date(Date.now() - 86400000).toISOString(),
    lastAnalyze: new Date(Date.now() - 3600000 * 2).toISOString(),
    seqScans: 15,
    idxScans: 981200
  },
  {
    tableName: 'audit_compliance_logs',
    schemaName: 'audit',
    rowCount: 18900000,
    dataSizeMb: 12400.0,
    indexSizeMb: 4100.0,
    totalSizeMb: 16500.0,
    bloatPercentage: 14.8,
    unusedIndexesCount: 2,
    lastVacuum: new Date(Date.now() - 86400000 * 5).toISOString(),
    lastAnalyze: new Date(Date.now() - 3600000 * 12).toISOString(),
    seqScans: 840,
    idxScans: 142000
  },
  {
    tableName: 'dossiers_metadata',
    schemaName: 'public',
    rowCount: 85200,
    dataSizeMb: 45.2,
    indexSizeMb: 18.1,
    totalSizeMb: 63.3,
    bloatPercentage: 2.1,
    unusedIndexesCount: 0,
    lastVacuum: new Date(Date.now() - 86400000 * 3).toISOString(),
    lastAnalyze: new Date(Date.now() - 3600000 * 1).toISOString(),
    seqScans: 45,
    idxScans: 310200
  }
];

const mockDiagnosticLogs: DiagnosticLog[] = [
  {
    id: 'log-101',
    timestamp: new Date(Date.now() - 120000).toISOString(),
    severity: 'INFO',
    component: 'Autovacuum',
    message: 'Automatic vacuum completed on table public.citi_account_balances.',
    details: 'Pages removed: 420, Tuples deleted: 15400, Elapsed time: 1.24s'
  },
  {
    id: 'log-102',
    timestamp: new Date(Date.now() - 480000).toISOString(),
    severity: 'WARN',
    component: 'Query Planner',
    message: 'Sequential scan detected on high cardinality table audit.audit_compliance_logs.',
    details: 'Query ID: q-3 executed sequentially scanning 18.9M rows due to missing composite index.'
  },
  {
    id: 'log-103',
    timestamp: new Date(Date.now() - 1800000).toISOString(),
    severity: 'INFO',
    component: 'ConnectionPool',
    message: 'Connection pool auto-scaled active workers limit dynamically.',
    details: 'Max limit: 100, Current active: 42, Available headroom: 58%'
  },
  {
    id: 'log-104',
    timestamp: new Date(Date.now() - 86400000).toISOString(),
    severity: 'ERROR',
    component: 'ReplicationEngine',
    message: 'Secondary node replica lag exceeded warning threshold of 50ms.',
    code: 'ERR_REP_LAG_HIGH',
    details: 'Replica node db-replica-02 lagged by 142ms during peak batch processing.'
  }
];

const DefaultContextState: DatabaseDiagnosticContextType = {
  health: defaultHealthMetrics,
  queries: mockQueries,
  tableStats: mockTableStats,
  connectionPool: defaultConnectionPool,
  logs: mockDiagnosticLogs,
  isLoading: false,
  isRefreshing: false,
  lastRefreshedAt: new Date(),
  autoRefreshEnabled: true,
  refreshIntervalMs: 10000,
  setAutoRefreshEnabled: () => {},
  setRefreshIntervalMs: () => {},
  refreshDiagnostics: async () => {},
  runTableAnalyze: async () => {},
  killConnection: async () => true,
  exportDiagnosticReport: () => {}
};

export const DatabaseDiagnosticContext = createContext<DatabaseDiagnosticContextType>(DefaultContextState);

export const useDatabaseDiagnostics = () => {
  return useContext(DatabaseDiagnosticContext);
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export const DatabaseDiagnosticPanel: React.FC = () => {
  const context = useContext(DatabaseDiagnosticContext);
  const {
    health = defaultHealthMetrics,
    queries = mockQueries,
    tableStats = mockTableStats,
    connectionPool = defaultConnectionPool,
    logs = mockDiagnosticLogs,
    isRefreshing,
    lastRefreshedAt,
    autoRefreshEnabled,
    setAutoRefreshEnabled,
    refreshDiagnostics,
    runTableAnalyze,
    exportDiagnosticReport
  } = context || DefaultContextState;

  const [activeTab, setActiveTab] = useState<'overview' | 'queries' | 'tables' | 'connections' | 'logs'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [severityFilter, setSeverityFilter] = useState<string>('ALL');
  const [selectedLogDetails, setSelectedLogDetails] = useState<DiagnosticLog | null>(null);
  const [analyzingTable, setAnalyzingTable] = useState<string | null>(null);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  // Auto clear local toast message
  useEffect(() => {
    if (localMessage) {
      const timer = setTimeout(() => setLocalMessage(null), 4000);
      return () => clearTimeout(timer);
    }
  }, [localMessage]);

  const handleManualRefresh = async () => {
    await refreshDiagnostics();
    setLocalMessage('Database diagnostics refreshed successfully.');
  };

  const handleRunAnalyze = async (tableName: string) => {
    setAnalyzingTable(tableName);
    try {
      await runTableAnalyze(tableName);
      setLocalMessage(`Table ANALYZED successfully for ${tableName}`);
    } catch {
      setLocalMessage(`Failed to execute ANALYZE on ${tableName}`);
    } finally {
      setAnalyzingTable(null);
    }
  };

  // Filtered queries
  const filteredQueries = useMemo(() => {
    if (!searchQuery.trim()) return queries;
    const term = searchQuery.toLowerCase();
    return queries.filter((q) => q.query.toLowerCase().includes(term) || q.id.toLowerCase().includes(term));
  }, [queries, searchQuery]);

  // Filtered tables
  const filteredTables = useMemo(() => {
    if (!searchQuery.trim()) return tableStats;
    const term = searchQuery.toLowerCase();
    return tableStats.filter((t) => t.tableName.toLowerCase().includes(term) || t.schemaName.toLowerCase().includes(term));
  }, [tableStats, searchQuery]);

  // Filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSearch =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.component.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesSeverity = severityFilter === 'ALL' || log.severity === severityFilter;
      return matchesSearch && matchesSeverity;
    });
  }, [logs, searchQuery, severityFilter]);

  const getStatusBadge = (status: HealthStatus) => {
    switch (status) {
      case 'HEALTHY':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
            Healthy
          </span>
        );
      case 'DEGRADED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
            Degraded
          </span>
        );
      case 'CRITICAL':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400" />
            Critical
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Radio className="w-3.5 h-3.5 text-slate-400" />
            Maintenance
          </span>
        );
    }
  };

  const formatBytes = (mb: number) => {
    if (mb >= 1024) return `${(mb / 1024).toFixed(2)} GB`;
    return `${mb.toFixed(1)} MB`;
  };

  const formatUptime = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    return `${days}d ${hours}h ${mins}m`;
  };

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* HEADER SECTION */}
      <div className="p-5 bg-slate-900/80 border-b border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-cyan-500/10 rounded-lg border border-cyan-500/20 text-cyan-400">
            <Database className="w-6 h-6" />
          </div>
          <div>
            <div className="flex items-center gap-2.5">
              <h2 className="text-xl font-bold tracking-tight text-white">Database Diagnostic Console</h2>
              {getStatusBadge(health.status)}
            </div>
            <p className="text-xs text-slate-400 mt-0.5">
              Real-time cluster telemetry, slow query profiling &amp; schema storage analyzer
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Auto Refresh Toggle */}
          <button
            onClick={() => setAutoRefreshEnabled(!autoRefreshEnabled)}
            className={`px-3 py-1.5 text-xs font-medium rounded-lg border transition-all flex items-center gap-1.5 ${
              autoRefreshEnabled
                ? 'bg-cyan-950/50 text-cyan-300 border-cyan-700/50'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:text-slate-200'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${autoRefreshEnabled ? 'text-cyan-400 animate-pulse' : 'text-slate-500'}`} />
            Auto Sync
          </button>

          {/* Refresh Action */}
          <button
            onClick={handleManualRefresh}
            disabled={isRefreshing}
            className="px-3.5 py-1.5 text-xs font-semibold text-slate-200 bg-slate-800 hover:bg-slate-700 active:bg-slate-900 border border-slate-700 rounded-lg transition flex items-center gap-1.5 disabled:opacity-50"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${isRefreshing ? 'animate-spin text-cyan-400' : ''}`} />
            Refresh
          </button>

          {/* Export Report Button */}
          <button
            onClick={() => exportDiagnosticReport('json')}
            className="px-3.5 py-1.5 text-xs font-semibold text-cyan-400 bg-cyan-500/10 hover:bg-cyan-500/20 border border-cyan-500/30 rounded-lg transition flex items-center gap-1.5"
          >
            <Download className="w-3.5 h-3.5" />
            Export Diagnostics
          </button>
        </div>
      </div>

      {/* TOAST / NOTIFICATION */}
      {localMessage && (
        <div className="px-5 py-2.5 bg-cyan-950/80 border-b border-cyan-800/50 text-cyan-200 text-xs flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="w-4 h-4 text-cyan-400" />
            <span>{localMessage}</span>
          </div>
          <button onClick={() => setLocalMessage(null)} className="text-cyan-400 hover:text-cyan-200 font-bold">
            &times;
          </button>
        </div>
      )}

      {/* METRIC OVERVIEW CARDS */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-5 bg-slate-900/40 border-b border-slate-800/80">
        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>TPS (Throughput)</span>
            <Activity className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{health.transactionsPerSecond.toLocaleString()}</span>
            <span className="text-xs text-emerald-400 font-semibold">+4.2%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Peak today: 2,410 tps</div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Buffer Cache Hit Ratio</span>
            <Zap className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{health.cacheHitRatioPercentage}%</span>
            <span className="text-xs text-emerald-400 font-semibold">Optimal</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">Shared buffers: 8 GB allocated</div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Active Connections</span>
            <Layers className="w-4 h-4 text-amber-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">
              {connectionPool.activeConnections} / {connectionPool.maxConnections}
            </span>
            <span className="text-xs text-slate-400">{connectionPool.poolUtilizationPercentage}%</span>
          </div>
          <div className="mt-2 text-[11px] text-slate-500">
            {connectionPool.idleConnections} idle, {connectionPool.waitingConnections} waiting
          </div>
        </div>

        <div className="p-4 bg-slate-900/90 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium">
            <span>Cluster Disk Usage</span>
            <HardDrive className="w-4 h-4 text-blue-400" />
          </div>
          <div className="mt-2 flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{health.diskUsagePercentage}%</span>
            <span className="text-xs text-slate-400">NVMe SSD</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div
              className={`h-full rounded-full ${
                health.diskUsagePercentage > 85
                  ? 'bg-rose-500'
                  : health.diskUsagePercentage > 70
                  ? 'bg-amber-500'
                  : 'bg-cyan-500'
              }`}
              style={{ width: `${health.diskUsagePercentage}%` }}
            />
          </div>
        </div>
      </div>

      {/* NAVIGATION TABS & FILTER BAR */}
      <div className="px-5 py-3 bg-slate-900/60 border-b border-slate-800 flex flex-wrap items-center justify-between gap-3">
        {/* Tabs */}
        <div className="flex items-center gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'overview'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('queries')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'queries'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Slow Queries ({queries.length})
          </button>
          <button
            onClick={() => setActiveTab('tables')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'tables'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Table Storage ({tableStats.length})
          </button>
          <button
            onClick={() => setActiveTab('connections')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'connections'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Connection Pool
          </button>
          <button
            onClick={() => setActiveTab('logs')}
            className={`px-3 py-1.5 text-xs font-medium rounded-md transition ${
              activeTab === 'logs'
                ? 'bg-slate-800 text-white shadow-sm'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            Logs &amp; Alerts
          </button>
        </div>

        {/* Search input for Queries / Tables / Logs */}
        {activeTab !== 'overview' && activeTab !== 'connections' && (
          <div className="relative flex-grow max-w-xs">
            <Search className="w-3.5 h-3.5 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder={`Search ${activeTab}...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-slate-950 text-xs text-slate-200 pl-8 pr-3 py-1.5 rounded-lg border border-slate-800 focus:outline-none focus:border-cyan-500/50"
            />
          </div>
        )}
      </div>

      {/* TAB CONTENT AREA */}
      <div className="p-5">
        {/* OVERVIEW TAB */}
        {activeTab === 'overview' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {/* Hardware / Resource Telemetry */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-cyan-400" /> Resource Utilization
                </h3>

                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>CPU Utilization</span>
                      <span className="font-mono text-slate-200">{health.cpuUsagePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-cyan-500 h-full" style={{ width: `${health.cpuUsagePercentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Memory Alloc (RAM)</span>
                      <span className="font-mono text-slate-200">{health.memoryUsagePercentage}%</span>
                    </div>
                    <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                      <div className="bg-emerald-500 h-full" style={{ width: `${health.memoryUsagePercentage}%` }} />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between text-xs text-slate-400 mb-1">
                      <span>Replication Lag</span>
                      <span className="font-mono text-slate-200">{health.replicationLagMs} ms</span>
                    </div>
                    <div className="text-[11px] text-slate-500">Multi-region read replica synchronously synced</div>
                  </div>
                </div>
              </div>

              {/* Database Engine Info */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Server className="w-4 h-4 text-emerald-400" /> Instance Status
                </h3>
                <div className="divide-y divide-slate-800/60 text-xs">
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Cluster Uptime</span>
                    <span className="font-mono text-slate-200">{formatUptime(health.uptimeSeconds)}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Active Row Locks</span>
                    <span className="font-mono text-slate-200">{health.activeLocks}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Deadlocks (24h)</span>
                    <span className="font-mono text-slate-200">{health.deadlocks24h}</span>
                  </div>
                  <div className="py-2 flex justify-between">
                    <span className="text-slate-400">Last Telemetry Refresh</span>
                    <span className="font-mono text-slate-400">
                      {lastRefreshedAt ? lastRefreshedAt.toLocaleTimeString() : 'N/A'}
                    </span>
                  </div>
                </div>
              </div>

              {/* System Quick Recommendations */}
              <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-amber-400" /> AI Diagnostic Advisory
                </h3>
                <div className="space-y-2 text-xs">
                  <div className="p-2.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-300">
                    <p className="font-semibold mb-0.5">Unused Index Overhead</p>
                    <p className="text-[11px] text-amber-400/80">
                      Table <code className="text-amber-200">audit_compliance_logs</code> has 2 unused indexes. Dropping them could save ~850MB write cache.
                    </p>
                  </div>
                  <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-300">
                    <p className="font-semibold mb-0.5">High Cache Hit Efficiency</p>
                    <p className="text-[11px] text-emerald-400/80">
                      Buffer pool efficiency is at {health.cacheHitRatioPercentage}%. Disk I/O pressure is nominal.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* SLOW QUERIES TAB */}
        {activeTab === 'queries' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Query Statement</th>
                    <th className="px-4 py-3 text-right">Calls</th>
                    <th className="px-4 py-3 text-right">Avg Time</th>
                    <th className="px-4 py-3 text-right">P95 Latency</th>
                    <th className="px-4 py-3 text-right">Index Scan %</th>
                    <th className="px-4 py-3 text-right">Cache Hit %</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredQueries.map((q) => (
                    <tr key={q.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 max-w-md truncate text-cyan-300" title={q.query}>
                        {q.query}
                      </td>
                      <td className="px-4 py-3 text-right text-slate-200">{q.callCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-200">{q.avgTimeMs.toFixed(1)} ms</td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`font-semibold ${
                            q.p95TimeMs > 200 ? 'text-rose-400' : q.p95TimeMs > 50 ? 'text-amber-400' : 'text-emerald-400'
                          }`}
                        >
                          {q.p95TimeMs.toFixed(1)} ms
                        </span>
                      </td>
                      <td className="px-4 py-3 text-right text-slate-300">{q.indexScanRatio.toFixed(1)}%</td>
                      <td className="px-4 py-3 text-right text-slate-300">{q.cacheHitRatio.toFixed(1)}%</td>
                    </tr>
                  ))}
                  {filteredQueries.length === 0 && (
                    <tr>
                      <td colSpan={6} className="text-center py-8 text-slate-500">
                        No queries matched your search filter.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* TABLES & STORAGE TAB */}
        {activeTab === 'tables' && (
          <div className="space-y-4">
            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Table Name</th>
                    <th className="px-4 py-3">Schema</th>
                    <th className="px-4 py-3 text-right">Est. Rows</th>
                    <th className="px-4 py-3 text-right">Data Size</th>
                    <th className="px-4 py-3 text-right">Index Size</th>
                    <th className="px-4 py-3 text-right">Total Size</th>
                    <th className="px-4 py-3 text-right">Bloat %</th>
                    <th className="px-4 py-3 text-center">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80 font-mono">
                  {filteredTables.map((tbl) => (
                    <tr key={`${tbl.schemaName}.${tbl.tableName}`} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 font-semibold text-slate-200">{tbl.tableName}</td>
                      <td className="px-4 py-3 text-slate-400">{tbl.schemaName}</td>
                      <td className="px-4 py-3 text-right text-slate-200">{tbl.rowCount.toLocaleString()}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{formatBytes(tbl.dataSizeMb)}</td>
                      <td className="px-4 py-3 text-right text-slate-400">{formatBytes(tbl.indexSizeMb)}</td>
                      <td className="px-4 py-3 text-right font-semibold text-cyan-300">
                        {formatBytes(tbl.totalSizeMb)}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`px-2 py-0.5 rounded text-[11px] ${
                            tbl.bloatPercentage > 10
                              ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                              : 'text-slate-400'
                          }`}
                        >
                          {tbl.bloatPercentage.toFixed(1)}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => handleRunAnalyze(tbl.tableName)}
                          disabled={analyzingTable === tbl.tableName}
                          className="px-2.5 py-1 text-[11px] font-sans font-medium text-slate-300 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded transition disabled:opacity-50"
                        >
                          {analyzingTable === tbl.tableName ? 'Analyzing...' : 'Run ANALYZE'}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CONNECTION POOL TAB */}
        {activeTab === 'connections' && (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-4">
                <h3 className="text-sm font-semibold text-slate-200">Connection Pool Utilization</h3>
                <div className="flex items-center justify-between text-xs text-slate-400">
                  <span>Capacity Used</span>
                  <span className="font-mono text-cyan-400 font-bold">
                    {connectionPool.activeConnections + connectionPool.idleConnections} / {connectionPool.maxConnections}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-3 rounded-full overflow-hidden flex">
                  <div
                    className="bg-cyan-500 h-full"
                    style={{
                      width: `${(connectionPool.activeConnections / connectionPool.maxConnections) * 100}%`
                    }}
                    title="Active Connections"
                  />
                  <div
                    className="bg-slate-600 h-full"
                    style={{
                      width: `${(connectionPool.idleConnections / connectionPool.maxConnections) * 100}%`
                    }}
                    title="Idle Connections"
                  />
                </div>
                <div className="flex items-center gap-4 text-xs">
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-cyan-500" />
                    <span className="text-slate-300">Active ({connectionPool.activeConnections})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-slate-600" />
                    <span className="text-slate-400">Idle ({connectionPool.idleConnections})</span>
                  </div>
                  <div className="flex items-center gap-1.5">
                    <div className="w-3 h-3 rounded-full bg-rose-500" />
                    <span className="text-slate-400">Waiting ({connectionPool.waitingConnections})</span>
                  </div>
                </div>
              </div>

              <div className="p-5 bg-slate-900/60 rounded-xl border border-slate-800 space-y-3">
                <h3 className="text-sm font-semibold text-slate-200">Pool Diagnostic Metrics</h3>
                <div className="divide-y divide-slate-800/80 text-xs">
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">24h Connection Errors</span>
                    <span className="font-mono text-slate-200">{connectionPool.connectionErrors24h}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Max Connection Limit</span>
                    <span className="font-mono text-slate-200">{connectionPool.maxConnections}</span>
                  </div>
                  <div className="py-2.5 flex justify-between">
                    <span className="text-slate-400">Pool Scaler Strategy</span>
                    <span className="text-cyan-400 font-medium">Dynamic AutoScale</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* LOGS & ALERTS TAB */}
        {activeTab === 'logs' && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-xs text-slate-400">Severity Filter:</span>
              {['ALL', 'INFO', 'WARN', 'ERROR', 'CRITICAL'].map((sev) => (
                <button
                  key={sev}
                  onClick={() => setSeverityFilter(sev)}
                  className={`px-2.5 py-1 rounded text-xs font-medium transition ${
                    severityFilter === sev
                      ? 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                      : 'bg-slate-900 text-slate-400 hover:text-slate-200 border border-slate-800'
                  }`}
                >
                  {sev}
                </button>
              ))}
            </div>

            <div className="overflow-x-auto rounded-lg border border-slate-800">
              <table className="w-full text-left text-xs text-slate-300">
                <thead className="bg-slate-900 text-slate-400 uppercase text-[10px] tracking-wider font-semibold border-b border-slate-800">
                  <tr>
                    <th className="px-4 py-3">Timestamp</th>
                    <th className="px-4 py-3">Severity</th>
                    <th className="px-4 py-3">Component</th>
                    <th className="px-4 py-3">Message</th>
                    <th className="px-4 py-3 text-center">Details</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/80">
                  {filteredLogs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-900/50 transition">
                      <td className="px-4 py-3 font-mono text-slate-400 text-[11px]">
                        {new Date(log.timestamp).toLocaleString()}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                            log.severity === 'CRITICAL' || log.severity === 'ERROR'
                              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                              : log.severity === 'WARN'
                              ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                              : 'bg-cyan-500/20 text-cyan-300 border border-cyan-500/30'
                          }`}
                        >
                          {log.severity}
                        </span>
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-300">{log.component}</td>
                      <td className="px-4 py-3 text-slate-200">{log.message}</td>
                      <td className="px-4 py-3 text-center">
                        {log.details && (
                          <button
                            onClick={() => setSelectedLogDetails(log)}
                            className="p-1 text-slate-400 hover:text-cyan-400 transition"
                            title="View log details"
                          >
                            <FileText className="w-4 h-4" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* LOG DETAILS MODAL */}
      {selectedLogDetails && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-xl w-full max-w-lg p-5 space-y-4 text-slate-200 shadow-2xl">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="font-bold text-sm text-white flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" /> Log Diagnostic Entry
              </h3>
              <button
                onClick={() => setSelectedLogDetails(null)}
                className="text-slate-400 hover:text-white font-bold"
              >
                &times;
              </button>
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-slate-400">Timestamp: </span>
                <span className="font-mono text-slate-200">{selectedLogDetails.timestamp}</span>
              </div>
              <div>
                <span className="text-slate-400">Component: </span>
                <span className="text-cyan-300">{selectedLogDetails.component}</span>
              </div>
              <div>
                <span className="text-slate-400">Message: </span>
                <p className="mt-1 text-slate-100 font-medium">{selectedLogDetails.message}</p>
              </div>
              {selectedLogDetails.details && (
                <div>
                  <span className="text-slate-400">Extended Details:</span>
                  <pre className="mt-1 p-3 bg-slate-950 rounded-lg text-slate-300 font-mono text-[11px] overflow-x-auto border border-slate-800">
                    {selectedLogDetails.details}
                  </pre>
                </div>
              )}
            </div>
            <div className="flex justify-end pt-2">
              <button
                onClick={() => setSelectedLogDetails(null)}
                className="px-4 py-1.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-lg transition"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DatabaseDiagnosticPanel;