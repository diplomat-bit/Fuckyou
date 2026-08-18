import React, { useState, useMemo, useEffect } from 'react';
import {
  Server,
  Cpu,
  HardDrive,
  ToggleLeft,
  ToggleRight,
  RefreshCw,
  Search,
  Sliders,
  Download,
  Upload,
  ShieldCheck,
  AlertTriangle,
  CheckCircle2,
  Activity,
  Zap,
  Settings,
  Database,
  Lock,
  Layers,
  Terminal,
  Copy,
  Check,
  Eye,
  Edit3,
  Trash2,
  Plus
} from 'lucide-react';

interface FeatureFlag {
  id: string;
  key: string;
  name: string;
  description: string;
  category: 'core' | 'security' | 'banking' | 'ai' | 'compliance';
  enabled: boolean;
  environment: 'production' | 'staging' | 'all';
  updatedAt: string;
  updatedBy: string;
}

interface ServiceConfig {
  id: string;
  name: string;
  endpoint: string;
  timeoutMs: number;
  retryAttempts: number;
  mtlsRequired: boolean;
  pqcSecured: boolean;
  status: 'healthy' | 'degraded' | 'offline';
  latencyMs: number;
}

interface MemoryMetrics {
  heapUsedMb: number;
  heapTotalMb: number;
  externalMb: number;
  arrayBuffersMb: number;
  rssMb: number;
  cacheEntryCount: number;
  cacheHitRate: number;
  gcCount24h: number;
}

interface AuditLogEntry {
  id: string;
  timestamp: string;
  actor: string;
  action: string;
  target: string;
  oldValue: string;
  newValue: string;
  status: 'success' | 'warning' | 'failed';
}

const DEFAULT_FEATURE_FLAGS: FeatureFlag[] = [
  {
    id: 'ff-1',
    key: 'ENABLE_CITICONNECT_V2',
    name: 'CitiConnect v2 API Bridge',
    description: 'Enables mTLS high-throughput corporate treasury settlement pipeline for Citi accounts.',
    category: 'banking',
    enabled: true,
    environment: 'production',
    updatedAt: '2025-05-18 14:22:10 UTC',
    updatedBy: 'sec-ops-admin@sovereign.gov',
  },
  {
    id: 'ff-2',
    key: 'ENABLE_PQC_CRYPTO_SUITE',
    name: 'Post-Quantum Cryptography Engine',
    description: 'Enforces Dilithium / Kyber hybrid signatures for all cross-bank ledger state mutations.',
    category: 'security',
    enabled: true,
    environment: 'production',
    updatedAt: '2025-05-19 09:15:43 UTC',
    updatedBy: 'pqc-lead@defense.gov',
  },
  {
    id: 'ff-3',
    key: 'ENABLE_VERTEX_AI_COMPLIANCE_AGENT',
    name: 'Vertex AI Automated Compliance Audit',
    description: 'Real-time AI scanning of incoming CAMT.053 XML payloads against FinCEN and UCC rules.',
    category: 'ai',
    enabled: true,
    environment: 'all',
    updatedAt: '2025-05-17 18:04:00 UTC',
    updatedBy: 'ai-agent-factory@system.internal',
  },
  {
    id: 'ff-4',
    key: 'ENABLE_SAVE_API_VULN_SHIELD',
    name: 'SAVE API Hardened Firewall',
    description: 'Mitigates citizenship verification API response anomalies and prevents batch replay vectors.',
    category: 'compliance',
    enabled: true,
    environment: 'production',
    updatedAt: '2025-05-15 11:30:22 UTC',
    updatedBy: 'dhs-liaison@elections.gov',
  },
  {
    id: 'ff-5',
    key: 'ENABLE_ALPACA_COLLATERAL_ARBITRAGE',
    name: 'Alpaca Brokerage Liquidity Routing',
    description: 'Automated treasury sweep into short-duration T-Bill baskets and TQQQ hedge positions.',
    category: 'banking',
    enabled: false,
    environment: 'staging',
    updatedAt: '2025-05-12 08:11:05 UTC',
    updatedBy: 'treasury-desk@sovereign.gov',
  },
  {
    id: 'ff-6',
    key: 'ENABLE_ZERO_KNOWLEDGE_VOTER_PROOF',
    name: 'ZK-SNARK Sovereign ID Verification',
    description: 'Generates zero-knowledge proofs for Florida & Tribal voter roll verification without PII leakage.',
    category: 'core',
    enabled: true,
    environment: 'all',
    updatedAt: '2025-05-19 12:45:19 UTC',
    updatedBy: 'crypto-architect@sovereign.gov',
  },
  {
    id: 'ff-7',
    key: 'ENABLE_DEPARTMENT_OF_WAR_ARCHIVAL_SYNC',
    name: 'Dept of War Legacy Archives Bridge',
    description: 'Synchronizes historical military fund allocation audit records with active ledger.',
    category: 'core',
    enabled: false,
    environment: 'staging',
    updatedAt: '2025-05-10 16:20:00 UTC',
    updatedBy: 'archivist@war.gov',
  },
];

const DEFAULT_SERVICES: ServiceConfig[] = [
  {
    id: 'srv-1',
    name: 'Citi Connect Gateway',
    endpoint: 'https://api.citiconnect.treasury.internal/v2/swift',
    timeoutMs: 3500,
    retryAttempts: 3,
    mtlsRequired: true,
    pqcSecured: true,
    status: 'healthy',
    latencyMs: 42,
  },
  {
    id: 'srv-2',
    name: 'Modern Treasury Ledger Sync',
    endpoint: 'https://ledger.moderntreasury.gov/v1/reconcile',
    timeoutMs: 5000,
    retryAttempts: 2,
    mtlsRequired: true,
    pqcSecured: true,
    status: 'healthy',
    latencyMs: 88,
  },
  {
    id: 'srv-3',
    name: 'Vertex AI Gemini Proxy',
    endpoint: 'https://vertex-ai.cloud.google.internal/v1/predict',
    timeoutMs: 8000,
    retryAttempts: 1,
    mtlsRequired: false,
    pqcSecured: true,
    status: 'degraded',
    latencyMs: 310,
  },
  {
    id: 'srv-4',
    name: 'BigQuery Local Emulator Hub',
    endpoint: 'http://bigquery.emulator.internal:9050/data',
    timeoutMs: 2000,
    retryAttempts: 5,
    mtlsRequired: false,
    pqcSecured: false,
    status: 'healthy',
    latencyMs: 12,
  },
];

const INITIAL_AUDIT_LOGS: AuditLogEntry[] = [
  {
    id: 'log-101',
    timestamp: '2025-05-19 14:10:02',
    actor: 'admin@sovereign.gov',
    action: 'TOGGLE_FEATURE_FLAG',
    target: 'ENABLE_PQC_CRYPTO_SUITE',
    oldValue: 'disabled',
    newValue: 'enabled',
    status: 'success',
  },
  {
    id: 'log-102',
    timestamp: '2025-05-19 13:55:12',
    actor: 'auto-scaler@system',
    action: 'RESOURCE_ADJUSTMENT',
    target: 'CACHE_HEAP_MAX_LIMIT',
    oldValue: '1024MB',
    newValue: '2048MB',
    status: 'success',
  },
  {
    id: 'log-103',
    timestamp: '2025-05-19 11:22:40',
    actor: 'sys-diagnostics',
    action: 'GARBAGE_COLLECTION_PURGE',
    target: 'MemoryPool:L2Cache',
    oldValue: '1840MB',
    newValue: '612MB',
    status: 'success',
  },
];

export const EcosystemConfigView: React.FC = () => {
  const [activeTab, setActiveTab] = useState<'overview' | 'flags' | 'memory' | 'services' | 'audit'>('overview');
  const [flags, setFlags] = useState<FeatureFlag[]>(DEFAULT_FEATURE_FLAGS);
  const [services, setServices] = useState<ServiceConfig[]>(DEFAULT_SERVICES);
  const [logs, setLogs] = useState<AuditLogEntry[]>(INITIAL_AUDIT_LOGS);
  
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');

  const [isPurgingMemory, setIsPurgingMemory] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  // Memory Metrics State
  const [memory, setMemory] = useState<MemoryMetrics>({
    heapUsedMb: 684,
    heapTotalMb: 1536,
    externalMb: 142,
    arrayBuffersMb: 89,
    rssMb: 2150,
    cacheEntryCount: 42890,
    cacheHitRate: 98.4,
    gcCount24h: 38,
  });

  const [systemUptime, setSystemUptime] = useState('14d 08h 32m 11s');

  // Live memory simulation tick
  useEffect(() => {
    const interval = setInterval(() => {
      setMemory((prev) => {
        const delta = Math.floor(Math.random() * 9) - 4;
        const newUsed = Math.min(Math.max(prev.heapUsedMb + delta, 400), prev.heapTotalMb - 100);
        return {
          ...prev,
          heapUsedMb: newUsed,
          cacheEntryCount: prev.cacheEntryCount + Math.floor(Math.random() * 3) - 1,
        };
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const handleToggleFlag = (id: string) => {
    setFlags((prev) =>
      prev.map((flag) => {
        if (flag.id === id) {
          const updatedState = !flag.enabled;
          
          // Add audit log entry
          const newLog: AuditLogEntry = {
            id: `log-${Date.now()}`,
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            actor: 'current-operator@sovereign.gov',
            action: 'TOGGLE_FEATURE_FLAG',
            target: flag.key,
            oldValue: flag.enabled ? 'enabled' : 'disabled',
            newValue: updatedState ? 'enabled' : 'disabled',
            status: 'success',
          };
          setLogs((prevLogs) => [newLog, ...prevLogs]);

          return {
            ...flag,
            enabled: updatedState,
            updatedAt: new Date().toISOString().replace('T', ' ').substring(0, 19) + ' UTC',
          };
        }
        return flag;
      })
    );
  };

  const handlePurgeMemoryCache = () => {
    setIsPurgingMemory(true);
    setTimeout(() => {
      setMemory((prev) => ({
        ...prev,
        heapUsedMb: Math.max(380, prev.heapUsedMb - 250),
        cacheEntryCount: Math.floor(prev.cacheEntryCount * 0.4),
        gcCount24h: prev.gcCount24h + 1,
      }));
      setIsPurgingMemory(false);

      const newLog: AuditLogEntry = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        actor: 'operator@sovereign.gov',
        action: 'MANUAL_CACHE_PURGE',
        target: 'EcosystemConfigManager:HeapCache',
        oldValue: `${memory.heapUsedMb} MB`,
        newValue: `${Math.max(380, memory.heapUsedMb - 250)} MB`,
        status: 'success',
      };
      setLogs((prevLogs) => [newLog, ...prevLogs]);
    }, 800);
  };

  const handleRefreshDiagnostics = () => {
    setIsRefreshing(true);
    setTimeout(() => {
      setIsRefreshing(false);
    }, 600);
  };

  const handleCopyConfig = (key: string) => {
    navigator.clipboard.writeText(key);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleExportJSON = () => {
    const exportData = {
      timestamp: new Date().toISOString(),
      environment: 'production-east-1',
      system: {
        uptime: systemUptime,
        memory,
      },
      featureFlags: flags,
      serviceEndpoints: services,
    };
    const blob = new Blob([JSON.stringify(exportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `ecosystem-config-export-${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const filteredFlags = useMemo(() => {
    return flags.filter((flag) => {
      const matchesSearch =
        flag.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.key.toLowerCase().includes(searchQuery.toLowerCase()) ||
        flag.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = categoryFilter === 'all' || flag.category === categoryFilter;
      const matchesEnv = environmentFilter === 'all' || flag.environment === 'all' || flag.environment === environmentFilter;
      return matchesSearch && matchesCategory && matchesEnv;
    });
  }, [flags, searchQuery, categoryFilter, environmentFilter]);

  const activeFlagsCount = useMemo(() => flags.filter((f) => f.enabled).length, [flags]);
  const memoryUsagePercent = useMemo(() => Math.round((memory.heapUsedMb / memory.heapTotalMb) * 100), [memory]);

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-blue-600/20 text-blue-400 rounded-xl border border-blue-500/30">
              <Settings className="w-6 h-6 animate-spin-slow" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Ecosystem Config Manager
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  LIVE RUNTIME
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Central orchestrator dashboard for system settings, memory pools, post-quantum crypto toggles & service integrations.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={handleRefreshDiagnostics}
            disabled={isRefreshing}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition disabled:opacity-50"
          >
            <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-blue-400' : ''}`} />
            Sync Config
          </button>

          <button
            onClick={handleExportJSON}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white text-sm font-semibold rounded-lg shadow-lg shadow-blue-600/20 transition"
          >
            <Download className="w-4 h-4" />
            Export State
          </button>
        </div>
      </div>

      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 my-6">
        {/* Metric 1: Heap Memory */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Memory Heap Pool</span>
            <HardDrive className="w-4 h-4 text-cyan-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{memory.heapUsedMb} MB</span>
            <span className="text-xs text-slate-400">/ {memory.heapTotalMb} MB</span>
          </div>
          <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden mt-3">
            <div
              className={`h-full transition-all duration-500 ${
                memoryUsagePercent > 85 ? 'bg-rose-500' : memoryUsagePercent > 70 ? 'bg-amber-500' : 'bg-cyan-500'
              }`}
              style={{ width: `${memoryUsagePercent}%` }}
            />
          </div>
          <div className="flex justify-between items-center text-xs text-slate-400 mt-2">
            <span>Utilization: {memoryUsagePercent}%</span>
            <span>RSS: {memory.rssMb}MB</span>
          </div>
        </div>

        {/* Metric 2: Active Flags */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Feature Switches</span>
            <Sliders className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">{activeFlagsCount}</span>
            <span className="text-xs text-slate-400">/ {flags.length} Active</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-300">
            <ShieldCheck className="w-4 h-4 text-emerald-400" />
            <span>PQC & mTLS Enforcements Active</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Last toggle: 12m ago</div>
        </div>

        {/* Metric 3: Active Service Bridges */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">Services Gateway</span>
            <Server className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-white">
              {services.filter((s) => s.status === 'healthy').length}
            </span>
            <span className="text-xs text-slate-400">/ {services.length} Online</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-300">
            <Activity className="w-4 h-4 text-indigo-400" />
            <span>Avg Latency: 113ms</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">1 Degraded (Vertex AI)</div>
        </div>

        {/* Metric 4: System Uptime & Security */}
        <div className="p-4 bg-slate-900/80 rounded-xl border border-slate-800 flex flex-col justify-between">
          <div className="flex items-center justify-between text-slate-400 mb-2">
            <span className="text-xs font-semibold uppercase tracking-wider">System Status</span>
            <Zap className="w-4 h-4 text-amber-400" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-extrabold text-emerald-400">99.998%</span>
          </div>
          <div className="flex items-center gap-2 mt-3 text-xs text-slate-300">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>Uptime: {systemUptime}</span>
          </div>
          <div className="text-xs text-slate-500 mt-1">Audit log integrity verified</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 gap-1 overflow-x-auto mb-6">
        {[
          { id: 'overview', label: 'Overview & Matrix', icon: Layers },
          { id: 'flags', label: `Feature Flags (${flags.length})`, icon: Sliders },
          { id: 'memory', label: 'Memory & Cache Pool', icon: Cpu },
          { id: 'services', label: 'Service Integrations', icon: Server },
          { id: 'audit', label: 'Audit Trail Logs', icon: Terminal },
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-semibold border-b-2 transition whitespace-nowrap ${
                isActive
                  ? 'border-blue-500 text-blue-400 bg-blue-500/10'
                  : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
              }`}
            >
              <Icon className="w-4 h-4" />
              {tab.label}
            </button>
          );
        })}
      </div>

      {/* TAB CONTENT 1: OVERVIEW */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Column */}
          <div className="lg:col-span-2 space-y-6">
            {/* Quick Status Box */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
                <ShieldCheck className="w-5 h-5 text-emerald-400" />
                Ecosystem Runtime Health
              </h2>
              <p className="text-sm text-slate-400 mb-4">
                All critical banking, compliance, and post-quantum encryption subsystems are actively configured and synchronized.
              </p>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">CitiConnect mTLS</div>
                    <div className="text-sm font-medium text-slate-200">Enforced / Active</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Post-Quantum Cryptography</div>
                    <div className="text-sm font-medium text-slate-200">Dilithium5 Hybrid Enabled</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-amber-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Vertex AI Audit Agent</div>
                    <div className="text-sm font-medium text-slate-200">Rate Limit: 88% Capacity</div>
                  </div>
                </div>

                <div className="p-3 bg-slate-950/60 rounded-xl border border-slate-800/80 flex items-center gap-3">
                  <div className="w-3 h-3 rounded-full bg-emerald-400" />
                  <div>
                    <div className="text-xs font-semibold text-slate-400">Memory Pressure</div>
                    <div className="text-sm font-medium text-slate-200">Normal (44% Heap)</div>
                  </div>
                </div>
              </div>
            </div>

            {/* Critical Feature Flags Quick Toggle List */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Sliders className="w-4 h-4 text-blue-400" />
                  High-Impact System Flags
                </h3>
                <button
                  onClick={() => setActiveTab('flags')}
                  className="text-xs text-blue-400 hover:underline font-medium"
                >
                  View All ({flags.length}) →
                </button>
              </div>

              <div className="space-y-3">
                {flags.slice(0, 4).map((flag) => (
                  <div
                    key={flag.id}
                    className="p-3.5 bg-slate-950/50 hover:bg-slate-950 rounded-xl border border-slate-800/80 flex items-center justify-between gap-4 transition"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className="text-sm font-semibold text-slate-200 truncate">{flag.name}</span>
                        <span className="text-[10px] uppercase font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-400">
                          {flag.category}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 truncate">{flag.description}</p>
                    </div>

                    <button
                      onClick={() => handleToggleFlag(flag.id)}
                      className="focus:outline-none transition transform active:scale-95"
                      title={flag.enabled ? 'Click to Disable' : 'Click to Enable'}
                    >
                      {flag.enabled ? (
                        <ToggleRight className="w-8 h-8 text-emerald-400" />
                      ) : (
                        <ToggleLeft className="w-8 h-8 text-slate-600" />
                      )}
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Memory Action Box */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h3 className="text-md font-bold text-white mb-2 flex items-center gap-2">
                <Cpu className="w-5 h-5 text-cyan-400" />
                Live Heap & Cache Engine
              </h3>
              <p className="text-xs text-slate-400 mb-4">
                Real-time V8 heap metrics and L2 response cache management.
              </p>

              <div className="space-y-2 mb-4 text-xs">
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Cache Entries</span>
                  <span className="font-mono text-slate-200">{memory.cacheEntryCount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Cache Hit Ratio</span>
                  <span className="font-mono text-emerald-400">{memory.cacheHitRate}%</span>
                </div>
                <div className="flex justify-between py-1 border-b border-slate-800">
                  <span className="text-slate-400">Array Buffers</span>
                  <span className="font-mono text-slate-200">{memory.arrayBuffersMb} MB</span>
                </div>
                <div className="flex justify-between py-1">
                  <span className="text-slate-400">24h GC Sweeps</span>
                  <span className="font-mono text-slate-200">{memory.gcCount24h}</span>
                </div>
              </div>

              <button
                onClick={handlePurgeMemoryCache}
                disabled={isPurgingMemory}
                className="w-full py-2.5 px-4 bg-cyan-600/20 hover:bg-cyan-600/30 text-cyan-300 text-xs font-bold rounded-xl border border-cyan-500/30 transition flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isPurgingMemory ? 'animate-spin' : ''}`} />
                {isPurgingMemory ? 'Purging L2 Cache...' : 'Trigger Garbage Collection'}
              </button>
            </div>

            {/* Quick Audit Log Snippet */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-md font-bold text-white flex items-center gap-2">
                  <Terminal className="w-4 h-4 text-indigo-400" />
                  Recent Config Activity
                </h3>
              </div>
              <div className="space-y-2 font-mono text-xs">
                {logs.slice(0, 3).map((log) => (
                  <div key={log.id} className="p-2.5 bg-slate-950/70 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500 mb-1">{log.timestamp}</div>
                    <div className="text-slate-300 font-semibold truncate">{log.action}</div>
                    <div className="text-slate-400 truncate">Target: {log.target}</div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 2: FEATURE FLAGS */}
      {activeTab === 'flags' && (
        <div className="space-y-6">
          {/* Search & Filter Bar */}
          <div className="p-4 bg-slate-900 rounded-2xl border border-slate-800 flex flex-col sm:flex-row gap-3 justify-between items-center">
            <div className="relative w-full sm:w-96">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-3" />
              <input
                type="text"
                placeholder="Search feature flags by key, name, description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-slate-950 text-slate-200 text-sm rounded-xl border border-slate-800 focus:outline-none focus:border-blue-500"
              />
            </div>

            <div className="flex flex-wrap items-center gap-2 w-full sm:w-auto">
              <select
                value={categoryFilter}
                onChange={(e) => setCategoryFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 text-slate-300 text-sm rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="all">All Categories</option>
                <option value="core">Core Platform</option>
                <option value="security">Security & PQC</option>
                <option value="banking">Banking & Citi</option>
                <option value="ai">AI Agents</option>
                <option value="compliance">Compliance</option>
              </select>

              <select
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value)}
                className="px-3 py-2 bg-slate-950 text-slate-300 text-sm rounded-xl border border-slate-800 focus:outline-none"
              >
                <option value="all">All Environments</option>
                <option value="production">Production</option>
                <option value="staging">Staging</option>
              </select>
            </div>
          </div>

          {/* Feature Flags Table */}
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm">
                <thead className="bg-slate-950/80 text-slate-400 text-xs font-semibold uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3.5 px-4">Feature Switch Name</th>
                    <th className="py-3.5 px-4">Key ID</th>
                    <th className="py-3.5 px-4">Category</th>
                    <th className="py-3.5 px-4">Env</th>
                    <th className="py-3.5 px-4">Last Modified</th>
                    <th className="py-3.5 px-4 text-right">Toggle Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFlags.map((flag) => (
                    <tr key={flag.id} className="hover:bg-slate-950/40 transition">
                      <td className="py-4 px-4">
                        <div className="font-semibold text-slate-100">{flag.name}</div>
                        <div className="text-xs text-slate-400 max-w-md mt-0.5">{flag.description}</div>
                      </td>
                      <td className="py-4 px-4 font-mono text-xs text-slate-300">
                        <div className="flex items-center gap-1.5">
                          <span>{flag.key}</span>
                          <button
                            onClick={() => handleCopyConfig(flag.key)}
                            className="text-slate-500 hover:text-slate-300"
                            title="Copy Key"
                          >
                            {copiedKey === flag.key ? (
                              <Check className="w-3.5 h-3.5 text-emerald-400" />
                            ) : (
                              <Copy className="w-3.5 h-3.5" />
                            )}
                          </button>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-xs font-semibold px-2.5 py-1 rounded-full bg-slate-800 text-slate-300 border border-slate-700">
                          {flag.category}
                        </span>
                      </td>
                      <td className="py-4 px-4">
                        <span
                          className={`text-xs font-bold px-2.5 py-0.5 rounded ${
                            flag.environment === 'production'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}
                        >
                          {flag.environment}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-xs text-slate-400">
                        <div>{flag.updatedAt}</div>
                        <div className="text-slate-500 text-[11px] truncate max-w-[140px]">{flag.updatedBy}</div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <button
                          onClick={() => handleToggleFlag(flag.id)}
                          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border transition text-xs font-bold"
                          style={{
                            borderColor: flag.enabled ? 'rgba(16, 185, 129, 0.3)' : 'rgba(100, 116, 139, 0.3)',
                            backgroundColor: flag.enabled ? 'rgba(16, 185, 129, 0.1)' : 'rgba(15, 23, 42, 0.6)',
                            color: flag.enabled ? '#34d399' : '#94a3b8',
                          }}
                        >
                          {flag.enabled ? (
                            <>
                              <ToggleRight className="w-5 h-5 text-emerald-400" />
                              ACTIVE
                            </>
                          ) : (
                            <>
                              <ToggleLeft className="w-5 h-5 text-slate-500" />
                              DISABLED
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {filteredFlags.length === 0 && (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                        No feature flags matched your search filter criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 3: MEMORY & CACHE POOL */}
      {activeTab === 'memory' && (
        <div className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Visual Gauge Panel */}
            <div className="p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h3 className="text-md font-bold text-white mb-1 flex items-center gap-2">
                <HardDrive className="w-5 h-5 text-cyan-400" />
                V8 Memory Allocation Breakdown
              </h3>
              <p className="text-xs text-slate-400 mb-6">Live V8 isolate heap segments and RSS bounds.</p>

              <div className="space-y-4">
                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">Heap Used ({memory.heapUsedMb} MB)</span>
                    <span className="text-cyan-400">{memoryUsagePercent}%</span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-cyan-500 h-full transition-all duration-500"
                      style={{ width: `${memoryUsagePercent}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">External Memory ({memory.externalMb} MB)</span>
                    <span className="text-indigo-400">
                      {Math.round((memory.externalMb / memory.heapTotalMb) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-indigo-500 h-full transition-all duration-500"
                      style={{ width: `${(memory.externalMb / memory.heapTotalMb) * 100}%` }}
                    />
                  </div>
                </div>

                <div>
                  <div className="flex justify-between text-xs font-semibold mb-1">
                    <span className="text-slate-300">ArrayBuffers ({memory.arrayBuffersMb} MB)</span>
                    <span className="text-purple-400">
                      {Math.round((memory.arrayBuffersMb / memory.heapTotalMb) * 100)}%
                    </span>
                  </div>
                  <div className="w-full bg-slate-950 h-3 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="bg-purple-500 h-full transition-all duration-500"
                      style={{ width: `${(memory.arrayBuffersMb / memory.heapTotalMb) * 100}%` }}
                    />
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-4 border-t border-slate-800 flex justify-between items-center text-xs">
                <span className="text-slate-400">Resident Set Size (RSS):</span>
                <span className="font-mono text-slate-200 font-bold">{memory.rssMb} MB</span>
              </div>
            </div>

            {/* Cache Control Panel */}
            <div className="lg:col-span-2 p-6 bg-slate-900 rounded-2xl border border-slate-800">
              <h3 className="text-md font-bold text-white mb-2 flex items-center justify-between">
                <span className="flex items-center gap-2">
                  <Database className="w-5 h-5 text-emerald-400" />
                  Ecosystem Cache Manager
                </span>
                <button
                  onClick={handlePurgeMemoryCache}
                  disabled={isPurgingMemory}
                  className="px-3 py-1.5 bg-rose-500/20 hover:bg-rose-500/30 text-rose-300 text-xs font-semibold rounded-lg border border-rose-500/30 transition flex items-center gap-1.5"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Flush All Caches
                </button>
              </h3>
              <p className="text-xs text-slate-400 mb-6">
                Active memory cache stores routing tables, mTLS session tickets, and CAMT statement indexes.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-semibold mb-1">CitiConnect Pre-Baked Tokens</div>
                  <div className="text-xl font-bold text-white mb-2">12,400 Entries</div>
                  <div className="text-xs text-emerald-400">99.2% Hit Rate</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-semibold mb-1">PQC Key Handshake Buffer</div>
                  <div className="text-xl font-bold text-white mb-2">8,192 Keys</div>
                  <div className="text-xs text-cyan-400">Hybrid Kyber-1024</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-semibold mb-1">SAVE API Cache TTL</div>
                  <div className="text-xl font-bold text-white mb-2">300 seconds</div>
                  <div className="text-xs text-slate-400">Auto-invalidating</div>
                </div>

                <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                  <div className="text-xs text-slate-400 font-semibold mb-1">BigQuery Local Emulator Index</div>
                  <div className="text-xl font-bold text-white mb-2">22,298 Objects</div>
                  <div className="text-xs text-emerald-400">Zero Disk Spills</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 4: SERVICES INTEGRATION */}
      {activeTab === 'services' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Server className="w-5 h-5 text-indigo-400" />
                Configured Integration Endpoints
              </h3>
              <span className="text-xs text-slate-400">{services.length} Endpoints Active</span>
            </div>

            <div className="divide-y divide-slate-800">
              {services.map((srv) => (
                <div key={srv.id} className="p-4 sm:p-6 hover:bg-slate-950/40 transition flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div className="space-y-1">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-white text-base">{srv.name}</span>
                      <span
                        className={`text-[10px] font-bold uppercase px-2 py-0.5 rounded ${
                          srv.status === 'healthy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {srv.status}
                      </span>
                    </div>
                    <div className="font-mono text-xs text-slate-400 flex items-center gap-2">
                      <span>{srv.endpoint}</span>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-4 text-xs text-slate-300">
                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <Lock className="w-3.5 h-3.5 text-blue-400" />
                      <span>mTLS: {srv.mtlsRequired ? 'Required' : 'Disabled'}</span>
                    </div>

                    <div className="flex items-center gap-1.5 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
                      <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
                      <span>PQC: {srv.pqcSecured ? 'Active' : 'Off'}</span>
                    </div>

                    <div className="bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 font-mono">
                      <span>Latency: </span>
                      <span className={srv.latencyMs > 200 ? 'text-amber-400 font-bold' : 'text-emerald-400 font-bold'}>
                        {srv.latencyMs}ms
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* TAB CONTENT 5: AUDIT LOGS */}
      {activeTab === 'audit' && (
        <div className="space-y-6">
          <div className="bg-slate-900 rounded-2xl border border-slate-800 overflow-hidden">
            <div className="p-4 border-b border-slate-800 flex justify-between items-center">
              <h3 className="text-md font-bold text-white flex items-center gap-2">
                <Terminal className="w-5 h-5 text-slate-400" />
                Immutable Configuration Audit Trail
              </h3>
              <span className="text-xs text-slate-400">{logs.length} Total Records</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead className="bg-slate-950/80 text-slate-400 uppercase tracking-wider border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Timestamp (UTC)</th>
                    <th className="py-3 px-4">Actor</th>
                    <th className="py-3 px-4">Action</th>
                    <th className="py-3 px-4">Target Key</th>
                    <th className="py-3 px-4">Old State</th>
                    <th className="py-3 px-4">New State</th>
                    <th className="py-3 px-4">Result</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {logs.map((log) => (
                    <tr key={log.id} className="hover:bg-slate-950/40">
                      <td className="py-3 px-4 text-slate-400 whitespace-nowrap">{log.timestamp}</td>
                      <td className="py-3 px-4 text-blue-400">{log.actor}</td>
                      <td className="py-3 px-4 text-slate-200 font-bold">{log.action}</td>
                      <td className="py-3 px-4 text-amber-300">{log.target}</td>
                      <td className="py-3 px-4 text-slate-400">{log.oldValue}</td>
                      <td className="py-3 px-4 text-emerald-400 font-bold">{log.newValue}</td>
                      <td className="py-3 px-4">
                        <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded border border-emerald-500/20 text-[10px]">
                          {log.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EcosystemConfigView;