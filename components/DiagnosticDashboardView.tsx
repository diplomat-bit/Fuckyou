import React, { useState, useEffect, useMemo } from 'react';

// ==========================================
// TYPE DEFINITIONS (Aligned with PortalDiagnostics)
// ==========================================

export interface ServiceStatus {
  id: string;
  name: string;
  category: 'auth' | 'database' | 'integration' | 'network';
  status: 'healthy' | 'warning' | 'critical' | 'unknown';
  latencyMs: number;
  lastChecked: string;
  details?: string;
}

export interface SystemMetrics {
  cpuUsage: number;
  memoryUsage: number;
  diskUsage: number;
  activeConnections: number;
  uptimeSeconds: number;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  triggeredBy: string;
  overallStatus: 'pass' | 'fail' | 'warning';
  checksRun: number;
  failures: string[];
  recommendations: string[];
}

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'debug';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface DiagnosticSystemContextType {
  systemStatus: {
    metrics: SystemMetrics;
    services: ServiceStatus[];
    overallHealth: 'healthy' | 'warning' | 'critical';
  };
  reports: DiagnosticReport[];
  logs: LogEntry[];
  isLoading: boolean;
  error: string | null;
  triggerDiagnosticRun: (serviceId?: string) => Promise<void>;
  clearLogs: () => void;
  addLog: (level: LogEntry['level'], source: string, message: string) => void;
}

// ==========================================
// FALLBACK / MOCK CONTEXT FOR ROBUSTNESS
// ==========================================

const mockInitialServices: ServiceStatus[] = [
  { id: 'auth-azure-ad', name: 'Azure AD Authenticator', category: 'auth', status: 'healthy', latencyMs: 42, lastChecked: new Date().toISOString() },
  { id: 'auth-session', name: 'Session Token Vault', category: 'auth', status: 'healthy', latencyMs: 12, lastChecked: new Date().toISOString() },
  { id: 'db-bigquery', name: 'BigQuery Analytics Emulator', category: 'database', status: 'healthy', latencyMs: 120, lastChecked: new Date().toISOString() },
  { id: 'db-astradb', name: 'AstraDB Cassandra Cluster', category: 'database', status: 'warning', latencyMs: 340, lastChecked: new Date().toISOString(), details: 'High latency detected in US-East replication' },
  { id: 'db-postgres', name: 'Sovereign Ledger DB', category: 'database', status: 'healthy', latencyMs: 18, lastChecked: new Date().toISOString() },
  { id: 'int-alpaca', name: 'Alpaca Brokerage Bridge', category: 'integration', status: 'healthy', latencyMs: 85, lastChecked: new Date().toISOString() },
  { id: 'int-citi', name: 'Citi Sovereign Ledger Gateway', category: 'integration', status: 'critical', latencyMs: 0, lastChecked: new Date().toISOString(), details: 'mTLS Handshake Timeout (Error 504)' },
  { id: 'int-stripe', name: 'Stripe Treasury Pipeline', category: 'integration', status: 'healthy', latencyMs: 95, lastChecked: new Date().toISOString() },
  { id: 'net-vpn', name: 'FedRAMP Secure Gateway', category: 'network', status: 'healthy', latencyMs: 28, lastChecked: new Date().toISOString() },
  { id: 'net-dns', name: 'Internal Service Mesh DNS', category: 'network', status: 'healthy', latencyMs: 4, lastChecked: new Date().toISOString() },
];

const mockInitialLogs: LogEntry[] = [
  { id: '1', timestamp: new Date(Date.now() - 60000 * 10).toISOString(), level: 'info', source: 'AuthManager', message: 'Successfully rotated internal service principal credentials.' },
  { id: '2', timestamp: new Date(Date.now() - 60000 * 8).toISOString(), level: 'warn', source: 'BigQueryEmulator', message: 'Query execution time exceeded soft limit of 2000ms.' },
  { id: '3', timestamp: new Date(Date.now() - 60000 * 5).toISOString(), level: 'error', source: 'CitiGateway', message: 'mTLS connection failed: Remote certificate rejected by peer.' },
  { id: '4', timestamp: new Date(Date.now() - 60000 * 3).toISOString(), level: 'info', source: 'AlpacaBrokerView', message: 'Streaming market data connection re-established.' },
  { id: '5', timestamp: new Date(Date.now() - 60000 * 1).toISOString(), level: 'debug', source: 'ComplianceEngine', message: 'Evaluating transaction TX-90812 against UCC Financial Loophole rules.' },
];

const mockInitialReports: DiagnosticReport[] = [
  {
    id: 'REP-001',
    timestamp: new Date(Date.now() - 3600000).toISOString(),
    triggeredBy: 'System Scheduler',
    overallStatus: 'warning',
    checksRun: 24,
    failures: ['Citi Sovereign Ledger Gateway connection timeout'],
    recommendations: ['Verify mTLS client certificates', 'Check route table for Citi Gateway subnet']
  },
  {
    id: 'REP-002',
    timestamp: new Date(Date.now() - 7200000).toISOString(),
    triggeredBy: 'Admin (admin@sovereign.gov)',
    overallStatus: 'pass',
    checksRun: 24,
    failures: [],
    recommendations: []
  }
];

// Create Context
export const DiagnosticSystemContext = React.createContext<DiagnosticSystemContextType | undefined>(undefined);

export const DiagnosticSystemProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [services, setServices] = useState<ServiceStatus[]>(mockInitialServices);
  const [logs, setLogs] = useState<LogEntry[]>(mockInitialLogs);
  const [reports, setReports] = useState<DiagnosticReport[]>(mockInitialReports);
  const [metrics, setMetrics] = useState<SystemMetrics>({
    cpuUsage: 42.5,
    memoryUsage: 68.1,
    diskUsage: 51.2,
    activeConnections: 142,
    uptimeSeconds: 86400 * 3 + 14200,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Simulate real-time metric updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        ...prev,
        cpuUsage: Math.max(5, Math.min(99, +(prev.cpuUsage + (Math.random() * 10 - 5)).toFixed(1))),
        memoryUsage: Math.max(10, Math.min(99, +(prev.memoryUsage + (Math.random() * 2 - 1)).toFixed(1))),
        activeConnections: Math.max(10, prev.activeConnections + Math.floor(Math.random() * 7 - 3)),
        uptimeSeconds: prev.uptimeSeconds + 5,
      }));
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  const addLog = (level: LogEntry['level'], source: string, message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      level,
      source,
      message,
    };
    setLogs(prev => [newLog, ...prev].slice(0, 200)); // Keep last 200 logs
  };

  const triggerDiagnosticRun = async (serviceId?: string) => {
    setIsLoading(true);
    addLog('info', 'DiagnosticsOrchestrator', serviceId ? `Starting targeted diagnostic run for: ${serviceId}` : 'Starting full system diagnostic run...');
    
    await new Promise(resolve => setTimeout(resolve, 1500));

    try {
      if (serviceId) {
        // Targeted run
        setServices(prev => prev.map(s => {
          if (s.id === serviceId) {
            const isNowHealthy = Math.random() > 0.2;
            const latency = isNowHealthy ? Math.floor(Math.random() * 100) + 10 : 0;
            addLog(
              isNowHealthy ? 'info' : 'error',
              s.name,
              isNowHealthy ? `Diagnostic check passed. Latency: ${latency}ms` : 'Diagnostic check failed: Connection refused.'
            );
            return {
              ...s,
              status: isNowHealthy ? 'healthy' : 'critical',
              latencyMs: latency,
              lastChecked: new Date().toISOString(),
              details: isNowHealthy ? undefined : 'Connection refused during diagnostic ping.'
            };
          }
          return s;
        }));
      } else {
        // Full run
        let failedCount = 0;
        const updatedServices = services.map(s => {
          // Keep Citi failing for demo consistency unless resolved, but randomize others slightly
          if (s.id === 'int-citi') {
            failedCount++;
            return s;
          }
          const roll = Math.random();
          let status: ServiceStatus['status'] = 'healthy';
          let details: string | undefined = undefined;
          if (roll > 0.95) {
            status = 'critical';
            details = 'Service health check failed.';
            failedCount++;
          } else if (roll > 0.85) {
            status = 'warning';
            details = 'High response latency detected.';
          }
          return {
            ...s,
            status,
            latencyMs: status === 'critical' ? 0 : Math.floor(Math.random() * 150) + 10,
            lastChecked: new Date().toISOString(),
            details
          };
        });

        setServices(updatedServices);

        const newReport: DiagnosticReport = {
          id: `REP-${Math.floor(Math.random() * 900) + 100}`,
          timestamp: new Date().toISOString(),
          triggeredBy: 'Manual Trigger (Admin)',
          overallStatus: failedCount > 1 ? 'fail' : failedCount === 1 ? 'warning' : 'pass',
          checksRun: updatedServices.length,
          failures: updatedServices.filter(s => s.status === 'critical').map(s => `${s.name}: ${s.details || 'Unknown error'}`),
          recommendations: failedCount > 0 ? ['Review network routing rules', 'Verify API keys and mTLS certificates'] : []
        };

        setReports(prev => [newReport, ...prev]);
        addLog(
          newReport.overallStatus === 'pass' ? 'info' : 'warn',
          'DiagnosticsOrchestrator',
          `Full diagnostic run completed. Status: ${newReport.overallStatus.toUpperCase()}. Passed ${newReport.checksRun - failedCount}/${newReport.checksRun} checks.`
        );
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred during diagnostics.');
      addLog('error', 'DiagnosticsOrchestrator', `Diagnostic run aborted: ${err.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  const clearLogs = () => setLogs([]);

  const overallHealth = useMemo(() => {
    const criticals = services.filter(s => s.status === 'critical').length;
    const warnings = services.filter(s => s.status === 'warning').length;
    if (criticals > 0) return 'critical';
    if (warnings > 0) return 'warning';
    return 'healthy';
  }, [services]);

  return (
    <DiagnosticSystemContext.Provider value={{
      systemStatus: { metrics, services, overallHealth },
      reports,
      logs,
      isLoading,
      error,
      triggerDiagnosticRun,
      clearLogs,
      addLog
    }}>
      {children}
    </DiagnosticSystemContext.Provider>
  );
};

export const useDiagnosticSystem = () => {
  const context = React.useContext(DiagnosticSystemContext);
  if (!context) {
    // Return mock context if used outside provider to prevent crashes
    return {
      systemStatus: {
        metrics: { cpuUsage: 45, memoryUsage: 60, diskUsage: 50, activeConnections: 120, uptimeSeconds: 3600 },
        services: mockInitialServices,
        overallHealth: 'warning' as const
      },
      reports: mockInitialReports,
      logs: mockInitialLogs,
      isLoading: false,
      error: null,
      triggerDiagnosticRun: async () => {},
      clearLogs: () => {},
      addLog: () => {}
    };
  }
  return context;
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export const DiagnosticDashboardView: React.FC = () => {
  const { systemStatus, reports, logs, isLoading, triggerDiagnosticRun, clearLogs } = useDiagnosticSystem();
  const [activeTab, setActiveTab] = useState<'overview' | 'services' | 'reports' | 'logs'>('overview');
  const [logFilter, setLogFilter] = useState<string>('all');
  const [logSearch, setLogSearch] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');

  const filteredServices = useMemo(() => {
    if (selectedCategory === 'all') return systemStatus.services;
    return systemStatus.services.filter(s => s.category === selectedCategory);
  }, [systemStatus.services, selectedCategory]);

  const filteredLogs = useMemo(() => {
    return logs.filter(log => {
      const matchesLevel = logFilter === 'all' || log.level === logFilter;
      const matchesSearch = log.message.toLowerCase().includes(logSearch.toLowerCase()) ||
                            log.source.toLowerCase().includes(logSearch.toLowerCase());
      return matchesLevel && matchesSearch;
    });
  }, [logs, logFilter, logSearch]);

  const formatUptime = (seconds: number) => {
    const d = Math.floor(seconds / (3600 * 24));
    const h = Math.floor((seconds % (3600 * 24)) / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    return `${d}d ${h}h ${m}m ${s}s`;
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Top Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800 mb-6">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="text-2xl font-bold tracking-tight text-white">Sovereign Portal Diagnostics</h1>
            <span className={`px-2.5 py-1 rounded-full text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5 ${
              systemStatus.overallHealth === 'healthy' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              systemStatus.overallHealth === 'warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <span className={`w-2 h-2 rounded-full ${
                systemStatus.overallHealth === 'healthy' ? 'bg-emerald-400 animate-pulse' :
                systemStatus.overallHealth === 'warning' ? 'bg-amber-400 animate-pulse' :
                'bg-rose-400 animate-pulse'
              }`} />
              {systemStatus.overallHealth}
            </span>
          </div>
          <p className="text-slate-400 text-sm mt-1">Real-time system health, compliance verification, and audit trail logs.</p>
        </div>

        <div className="flex items-center gap-3">
          <button
            onClick={() => triggerDiagnosticRun()}
            disabled={isLoading}
            className={`px-4 py-2 rounded-lg text-sm font-medium transition-all flex items-center gap-2 ${
              isLoading 
                ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                : 'bg-blue-600 hover:bg-blue-500 text-white shadow-lg shadow-blue-600/20'
            }`}
          >
            {isLoading ? (
              <svg className="animate-spin h-4 w-4 text-slate-500" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
              </svg>
            ) : (
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H16" />
              </svg>
            )}
            {isLoading ? 'Running Diagnostics...' : 'Run Full Diagnostics'}
          </button>
        </div>
      </header>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 mb-6 overflow-x-auto">
        {(['overview', 'services', 'reports', 'logs'] as const).map((tab) => (
          <button
            key={tab}
            onClick={() => setActiveTab(tab)}
            className={`px-5 py-3 text-sm font-medium border-b-2 transition-all whitespace-nowrap capitalize ${
              activeTab === tab
                ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:border-slate-700'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* TAB CONTENT */}
      {activeTab === 'overview' && (
        <div className="space-y-6">
          {/* Metrics Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {/* CPU Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm font-medium">CPU Utilization</span>
                <span className="text-xs text-slate-500">Real-time</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{systemStatus.metrics.cpuUsage}%</span>
              </div>
              <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    systemStatus.metrics.cpuUsage > 85 ? 'bg-rose-500' : systemStatus.metrics.cpuUsage > 60 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${systemStatus.metrics.cpuUsage}%` }}
                />
              </div>
            </div>

            {/* Memory Card */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm font-medium">Memory Allocation</span>
                <span className="text-xs text-slate-500">Active</span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{systemStatus.metrics.memoryUsage}%</span>
              </div>
              <div className="mt-3 w-full bg-slate-800 rounded-full h-1.5">
                <div 
                  className={`h-1.5 rounded-full transition-all duration-500 ${
                    systemStatus.metrics.memoryUsage > 90 ? 'bg-rose-500' : systemStatus.metrics.memoryUsage > 75 ? 'bg-amber-500' : 'bg-emerald-500'
                  }`}
                  style={{ width: `${systemStatus.metrics.memoryUsage}%` }}
                />
              </div>
            </div>

            {/* Active Connections */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm font-medium">Active Connections</span>
                <span className="text-xs text-emerald-400 flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" /> Live
                </span>
              </div>
              <div className="mt-4 flex items-baseline gap-2">
                <span className="text-3xl font-bold text-white">{systemStatus.metrics.activeConnections}</span>
                <span className="text-slate-500 text-xs">sockets</span>
              </div>
              <p className="text-xs text-slate-500 mt-3">Distributed across 35 sectors</p>
            </div>

            {/* System Uptime */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-start">
                <span className="text-slate-400 text-sm font-medium">System Uptime</span>
                <span className="text-xs text-slate-500">Continuous</span>
              </div>
              <div className="mt-4">
                <span className="text-lg font-bold text-white block truncate">{formatUptime(systemStatus.metrics.uptimeSeconds)}</span>
              </div>
              <p className="text-xs text-slate-500 mt-4">Last deployment: 3 days ago</p>
            </div>
          </div>

          {/* Main Overview Grid */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Service Status Summary */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Critical Infrastructure Status</h3>
                <button 
                  onClick={() => setActiveTab('services')} 
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  View All Services &rarr;
                </button>
              </div>
              <div className="divide-y divide-slate-800">
                {systemStatus.services.slice(0, 5).map((service) => (
                  <div key={service.id} className="py-3 flex items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="text-sm font-medium text-slate-200 truncate">{service.name}</p>
                      <p className="text-xs text-slate-500 capitalize">{service.category} &bull; Latency: {service.latencyMs}ms</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                        service.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                        service.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {service.status}
                      </span>
                      <button
                        onClick={() => triggerDiagnosticRun(service.id)}
                        className="p-1 hover:bg-slate-800 rounded text-slate-400 hover:text-slate-200"
                        title="Test Service"
                      >
                        <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Quick Diagnostic Reports */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-lg font-semibold text-white">Recent Reports</h3>
                <button 
                  onClick={() => setActiveTab('reports')} 
                  className="text-xs text-blue-400 hover:text-blue-300 font-medium"
                >
                  All Reports &rarr;
                </button>
              </div>
              <div className="space-y-4">
                {reports.slice(0, 3).map((report) => (
                  <div key={report.id} className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-xs font-mono text-slate-500">{report.id}</span>
                        <p className="text-xs text-slate-400">{new Date(report.timestamp).toLocaleTimeString()}</p>
                      </div>
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold uppercase ${
                        report.overallStatus === 'pass' ? 'bg-emerald-500/10 text-emerald-400' :
                        report.overallStatus === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {report.overallStatus}
                      </span>
                    </div>
                    <p className="text-xs text-slate-300 mt-2">Checks Run: {report.checksRun}</p>
                    {report.failures.length > 0 && (
                      <p className="text-[11px] text-rose-400 mt-1 truncate">Fail: {report.failures[0]}</p>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Live Log Stream Preview */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-lg font-semibold text-white">Live Log Stream</h3>
              <button 
                onClick={() => setActiveTab('logs')} 
                className="text-xs text-blue-400 hover:text-blue-300 font-medium"
              >
                Open Log Console &rarr;
              </button>
            </div>
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs space-y-2 max-h-60 overflow-y-auto border border-slate-800">
              {logs.slice(0, 5).map((log) => (
                <div key={log.id} className="flex items-start gap-2 text-slate-300">
                  <span className="text-slate-500">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
                  <span className={`font-bold uppercase ${
                    log.level === 'error' ? 'text-rose-500' :
                    log.level === 'warn' ? 'text-amber-500' :
                    log.level === 'debug' ? 'text-blue-400' : 'text-emerald-400'
                  }`}>{log.level}</span>
                  <span className="text-slate-400">[{log.source}]</span>
                  <span className="flex-1 break-all">{log.message}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'services' && (
        <div className="space-y-6">
          {/* Category Filter */}
          <div className="flex gap-2 overflow-x-auto pb-2">
            {['all', 'auth', 'database', 'integration', 'network'].map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-medium border transition-all capitalize whitespace-nowrap ${
                  selectedCategory === cat
                    ? 'bg-blue-600 border-blue-500 text-white'
                    : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Services Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredServices.map((service) => (
              <div key={service.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <h4 className="font-semibold text-white text-base">{service.name}</h4>
                    <span className={`px-2 py-0.5 rounded text-xs font-medium capitalize ${
                      service.status === 'healthy' ? 'bg-emerald-500/10 text-emerald-400' :
                      service.status === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                      'bg-rose-500/10 text-rose-400'
                    }`}>
                      {service.status}
                    </span>
                  </div>
                  <p className="text-xs text-slate-500 mt-1 uppercase tracking-wider font-mono">{service.category}</p>
                  
                  {service.details && (
                    <p className="text-xs text-slate-400 bg-slate-950 p-2.5 rounded border border-slate-800 mt-3 font-mono">
                      {service.details}
                    </p>
                  )}
                </div>

                <div className="mt-6 pt-4 border-t border-slate-800 flex justify-between items-center text-xs text-slate-400">
                  <div>
                    <p>Latency: <span className="font-mono text-slate-200">{service.latencyMs}ms</span></p>
                    <p className="text-[10px] text-slate-500">Checked: {new Date(service.lastChecked).toLocaleTimeString()}</p>
                  </div>
                  <button
                    onClick={() => triggerDiagnosticRun(service.id)}
                    className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded font-medium transition-all"
                  >
                    Test Ping
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'reports' && (
        <div className="space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <h3 className="text-lg font-semibold text-white mb-4">Diagnostic Run History</h3>
            <div className="space-y-4">
              {reports.map((report) => (
                <div key={report.id} className="border border-slate-800 rounded-lg p-4 bg-slate-950">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2 pb-3 border-b border-slate-800">
                    <div>
                      <span className="text-xs font-mono text-blue-400 font-bold">{report.id}</span>
                      <p className="text-xs text-slate-500">{new Date(report.timestamp).toLocaleString()}</p>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="text-xs text-slate-400">Triggered by: <strong className="text-slate-300">{report.triggeredBy}</strong></span>
                      <span className={`px-2 py-0.5 rounded text-xs font-bold uppercase ${
                        report.overallStatus === 'pass' ? 'bg-emerald-500/10 text-emerald-400' :
                        report.overallStatus === 'warning' ? 'bg-amber-500/10 text-amber-400' :
                        'bg-rose-500/10 text-rose-400'
                      }`}>
                        {report.overallStatus}
                      </span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3 text-xs">
                    <div>
                      <p className="text-slate-400 font-medium">Checks Executed: <span className="text-white font-mono">{report.checksRun}</span></p>
                      {report.failures.length > 0 ? (
                        <div className="mt-2">
                          <p className="text-rose-400 font-medium">Failures ({report.failures.length}):</p>
                          <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1">
                            {report.failures.map((fail, idx) => (
                              <li key={idx} className="truncate">{fail}</li>
                            ))}
                          </ul>
                        </div>
                      ) : (
                        <p className="text-emerald-400 font-medium mt-2">All checks passed successfully.</p>
                      )}
                    </div>

                    <div>
                      {report.recommendations.length > 0 && (
                        <div>
                          <p className="text-amber-400 font-medium">Recommended Actions:</p>
                          <ul className="list-disc list-inside text-slate-300 space-y-1 mt-1">
                            {report.recommendations.map((rec, idx) => (
                              <li key={idx}>{rec}</li>
                            ))}
                          </ul>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {activeTab === 'logs' && (
        <div className="space-y-4">
          {/* Log Controls */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col md:flex-row gap-4 justify-between items-center">
            <div className="flex flex-wrap gap-2 w-full md:w-auto">
              {['all', 'info', 'warn', 'error', 'debug'].map((level) => (
                <button
                  key={level}
                  onClick={() => setLogFilter(level)}
                  className={`px-3 py-1 rounded text-xs font-medium capitalize border transition-all ${
                    logFilter === level
                      ? 'bg-blue-600 border-blue-500 text-white'
                      : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {level}
                </button>
              ))}
            </div>

            <div className="flex gap-3 w-full md:w-auto">
              <input
                type="text"
                placeholder="Search logs..."
                value={logSearch}
                onChange={(e) => setLogSearch(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 flex-1 md:w-64"
              />
              <button
                onClick={clearLogs}
                className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded text-xs font-medium transition-all"
              >
                Clear Logs
              </button>
            </div>
          </div>

          {/* Log Console */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
            <div className="bg-slate-950 rounded-lg p-4 font-mono text-xs space-y-2 max-h-[500px] overflow-y-auto border border-slate-800">
              {filteredLogs.length > 0 ? (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start gap-2 text-slate-300 hover:bg-slate-900/50 py-0.5 px-1 rounded">
                    <span className="text-slate-500">[{new Date(log.timestamp).toISOString()}]</span>
                    <span className={`font-bold uppercase ${
                      log.level === 'error' ? 'text-rose-500' :
                      log.level === 'warn' ? 'text-amber-500' :
                      log.level === 'debug' ? 'text-blue-400' : 'text-emerald-400'
                    }`}>{log.level}</span>
                    <span className="text-slate-400">[{log.source}]</span>
                    <span className="flex-1 break-all">{log.message}</span>
                  </div>
                ))
              ) : (
                <div className="text-center py-8 text-slate-500">No logs found matching the criteria.</div>
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};