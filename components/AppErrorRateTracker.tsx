import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  AlertTriangle,
  RefreshCw,
  Filter,
  Search,
  ShieldAlert,
  Terminal,
  Activity,
  Download,
  Trash2,
  CheckCircle2,
  ChevronRight,
  ChevronDown,
  Zap,
  Bug,
  Clock,
  Cpu,
  BarChart2,
  AlertCircle,
  XCircle,
  Play
} from 'lucide-react';

export interface ErrorEvent {
  id: string;
  timestamp: string;
  errorCode: string;
  severity: 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW';
  service: string;
  message: string;
  stackTrace?: string;
  metadata?: Record<string, any>;
  resolved?: boolean;
}

export interface MetricSummary {
  totalRequests: number;
  totalErrors: number;
  errorRatePercentage: number;
  criticalErrorsCount: number;
  dominantErrorCode: string;
  avgLatencyMs: number;
  uptimePercentage: number;
}

const DEFAULT_ERROR_CODES = [
  'EXECUTION_ERROR',
  'SAVE_API_TIMEOUT',
  'OAUTH_INVALID_TOKEN',
  'CITI_BRIDGE_DISCONNECT',
  'FAPI_CONFORMANCE_FAIL',
  'PQC_VERIFY_ERR',
  'RATE_LIMIT_EXCEEDED',
  'VAULT_DECRYPTION_FAIL'
];

const DEFAULT_SERVICES = [
  'AppMetricsCollector',
  'AuthManager',
  'CitiConnectGateway',
  'ModernTreasuryBridge',
  'SovereignIdCrypto',
  'VertexAIProxy',
  'ComputeOrchestrator'
];

export const AppErrorRateTracker: React.FC = () => {
  const [isAutoRefresh, setIsAutoRefresh] = useState<boolean>(true);
  const [refreshInterval, setRefreshInterval] = useState<number>(3000);
  const [selectedSeverity, setSelectedSeverity] = useState<string>('ALL');
  const [selectedErrorCode, setSelectedErrorCode] = useState<string>('ALL');
  const [selectedService, setSelectedService] = useState<string>('ALL');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [expandedLogId, setExpandedLogId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'stream' | 'breakdown' | 'simulator'>('stream');

  // Core metrics & log state
  const [logs, setLogs] = useState<ErrorEvent[]>(() => [
    {
      id: 'err-109283-a',
      timestamp: new Date(Date.now() - 120000).toISOString(),
      errorCode: 'EXECUTION_ERROR',
      severity: 'CRITICAL',
      service: 'ComputeOrchestrator',
      message: 'Kernel execution panic in zero-knowledge proof processing engine.',
      stackTrace: 'Error: Kernel execution panic at ZKEngine.wasm:0x00412a\n  at VectorCollapseProtocol.execute (vector_collapse.ts:184)\n  at AppMetricsCollector.dispatch (AppMetricsCollector.ts:92)\n  at processTicksAndRejections (node:internal/process/task_queues:95)',
      metadata: { threadId: 14, payloadSizeKB: 2048, executionTimeMs: 4200, traceId: 'tr-zk-99218' },
      resolved: false
    },
    {
      id: 'err-109282-b',
      timestamp: new Date(Date.now() - 340000).toISOString(),
      errorCode: 'SAVE_API_TIMEOUT',
      severity: 'HIGH',
      service: 'CitiConnectGateway',
      message: 'SAVE API V1 gateway endpoint failed to respond within 5000ms SLA limit.',
      stackTrace: 'TimeoutError: Connection timed out after 5000ms\n  at GatewayClient.post (government-gateway.ts:204)\n  at async AppMetricsCollector.ingest (AppMetricsCollector.ts:45)',
      metadata: { targetUri: 'https://api.dhs.gov/save/v1/verify', statusCode: 504, retryAttempts: 3 },
      resolved: true
    },
    {
      id: 'err-109281-c',
      timestamp: new Date(Date.now() - 890000).toISOString(),
      errorCode: 'FAPI_CONFORMANCE_FAIL',
      severity: 'HIGH',
      service: 'AuthManager',
      message: 'Financial-grade API interaction security token lacks valid JWS signature header.',
      stackTrace: 'SecurityError: Invalid JWS header algorithm parameters\n  at FapiValidator.verify (OpenBankingFapiView.ts:88)\n  at AuthManager.validateSession (AuthManager.ts:122)',
      metadata: { callerIp: '192.168.4.12', clientCertPresent: true, certThumbprint: 'a89f...33e1' },
      resolved: false
    },
    {
      id: 'err-109280-d',
      timestamp: new Date(Date.now() - 1420000).toISOString(),
      errorCode: 'PQC_VERIFY_ERR',
      severity: 'MEDIUM',
      service: 'SovereignIdCrypto',
      message: 'Post-Quantum Kyber-1024 key encapsulation exchange mismatch detected.',
      stackTrace: 'CryptoError: Kyber1024 decapsulation checksum failure\n  at PqcCryptoBridge.decrypt (pqc_crypto_bridge_simulator/app.py:112)',
      metadata: { algorithm: 'Kyber1024-Falcon512', keyId: 'sec-key-8812' },
      resolved: false
    },
    {
      id: 'err-109279-e',
      timestamp: new Date(Date.now() - 2100000).toISOString(),
      errorCode: 'EXECUTION_ERROR',
      severity: 'LOW',
      service: 'AppMetricsCollector',
      message: 'Secondary buffer flush exceeded soft warning threshold of 50ms.',
      stackTrace: 'Warning: Metrics flush high latency\n  at AppMetricsCollector.flush (AppMetricsCollector.ts:230)',
      metadata: { bufferSize: 1042, latencyMs: 84 },
      resolved: true
    }
  ]);

  const [totalRequests, setTotalRequests] = useState<number>(14250);

  // Generate random error event for simulation/live stream
  const generateSimulatedError = useCallback((forcedCode?: string) => {
    const code = forcedCode || DEFAULT_ERROR_CODES[Math.floor(Math.random() * DEFAULT_ERROR_CODES.length)];
    const service = DEFAULT_SERVICES[Math.floor(Math.random() * DEFAULT_SERVICES.length)];
    const severities: ('CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW')[] = ['CRITICAL', 'HIGH', 'MEDIUM', 'LOW'];
    const severity = severities[Math.floor(Math.random() * severities.length)];

    const newLog: ErrorEvent = {
      id: `err-${Math.floor(100000 + Math.random() * 900000)}-${Math.random().toString(36).substring(2, 5)}`,
      timestamp: new Date().toISOString(),
      errorCode: code,
      severity: severity,
      service: service,
      message: `Automated alert captured by AppMetricsCollector: ${code} in subsystem [${service}].`,
      stackTrace: `Error: Simulated execution fault [${code}]\n  at ${service}.process (service-runtime.ts:${Math.floor(Math.random() * 300) + 10})\n  at AppMetricsCollector.intercept (AppMetricsCollector.ts:114)`,
      metadata: {
        nodeEnv: 'production',
        cpuUtilization: `${(Math.random() * 30 + 70).toFixed(1)}%`,
        activeThreads: Math.floor(Math.random() * 64),
        requestTraceId: `req-${Math.random().toString(36).substring(2, 9)}`
      },
      resolved: false
    };

    setLogs((prev) => [newLog, ...prev.slice(0, 99)]);
    setTotalRequests((prev) => prev + Math.floor(Math.random() * 15) + 5);
  }, []);

  // Timer for auto-refresh simulation
  useEffect(() => {
    if (!isAutoRefresh) return;
    const interval = setInterval(() => {
      // 30% chance to inject a log per interval tick
      if (Math.random() < 0.35) {
        generateSimulatedError();
      } else {
        setTotalRequests((prev) => prev + Math.floor(Math.random() * 8) + 1);
      }
    }, refreshInterval);

    return () => clearInterval(interval);
  }, [isAutoRefresh, refreshInterval, generateSimulatedError]);

  // Derived filtered logs
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const matchesSeverity = selectedSeverity === 'ALL' || log.severity === selectedSeverity;
      const matchesCode = selectedErrorCode === 'ALL' || log.errorCode === selectedErrorCode;
      const matchesService = selectedService === 'ALL' || log.service === selectedService;
      const matchesSearch =
        searchQuery === '' ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.errorCode.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.service.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.id.toLowerCase().includes(searchQuery.toLowerCase());

      return matchesSeverity && matchesCode && matchesService && matchesSearch;
    });
  }, [logs, selectedSeverity, selectedErrorCode, selectedService, searchQuery]);

  // Aggregated Metrics
  const metrics: MetricSummary = useMemo(() => {
    const totalErrors = logs.length;
    const errorRatePercentage = totalRequests > 0 ? (totalErrors / totalRequests) * 100 : 0;
    const criticalErrorsCount = logs.filter((l) => l.severity === 'CRITICAL' && !l.resolved).length;

    // Dominant error code calculation
    const codeCounts: Record<string, number> = {};
    logs.forEach((l) => {
      codeCounts[l.errorCode] = (codeCounts[l.errorCode] || 0) + 1;
    });

    let maxCode = 'N/A';
    let maxCount = 0;
    Object.entries(codeCounts).forEach(([code, count]) => {
      if (count > maxCount) {
        maxCount = count;
        maxCode = code;
      }
    });

    return {
      totalRequests,
      totalErrors,
      errorRatePercentage,
      criticalErrorsCount,
      dominantErrorCode: maxCode,
      avgLatencyMs: Math.round(142 + Math.random() * 15),
      uptimePercentage: Number((100 - errorRatePercentage * 0.5).toFixed(3))
    };
  }, [logs, totalRequests]);

  // Breakdown by Error Code
  const errorCodeBreakdown = useMemo(() => {
    const map: Record<string, { count: number; criticals: number }> = {};
    logs.forEach((l) => {
      if (!map[l.errorCode]) {
        map[l.errorCode] = { count: 0, criticals: 0 };
      }
      map[l.errorCode].count += 1;
      if (l.severity === 'CRITICAL') {
        map[l.errorCode].criticals += 1;
      }
    });

    return Object.entries(map)
      .map(([code, data]) => ({
        code,
        count: data.count,
        criticals: data.criticals,
        percentage: ((data.count / (logs.length || 1)) * 100).toFixed(1)
      }))
      .sort((a, b) => b.count - a.count);
  }, [logs]);

  const handleClearLogs = () => {
    setLogs([]);
  };

  const handleToggleResolve = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setLogs((prev) =>
      prev.map((l) => (l.id === id ? { ...l, resolved: !l.resolved } : l))
    );
  };

  const handleExportJSON = () => {
    const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(logs, null, 2));
    const downloadAnchor = document.createElement('a');
    downloadAnchor.setAttribute("href", dataStr);
    downloadAnchor.setAttribute("download", `app_error_rate_report_${new Date().toISOString().slice(0, 10)}.json`);
    document.body.appendChild(downloadAnchor);
    downloadAnchor.click();
    downloadAnchor.remove();
  };

  const getSeverityBadgeClass = (severity: ErrorEvent['severity']) => {
    switch (severity) {
      case 'CRITICAL':
        return 'bg-red-500/20 text-red-400 border-red-500/40';
      case 'HIGH':
        return 'bg-orange-500/20 text-orange-400 border-orange-500/40';
      case 'MEDIUM':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/40';
      case 'LOW':
        return 'bg-blue-500/20 text-blue-400 border-blue-500/40';
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans">
      {/* Top Header */}
      <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-red-950/80 border border-red-800/60 rounded-xl text-red-400 shadow-lg shadow-red-950/40">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                App Error Rate Tracker
                <span className="text-xs font-mono font-normal px-2.5 py-0.5 rounded-full bg-slate-800 border border-slate-700 text-slate-300">
                  AppMetricsCollector v2.4
                </span>
              </h1>
              <p className="text-slate-400 text-sm mt-0.5">
                Real-time error tracking, exception code telemetry, and stack trace analyzer
              </p>
            </div>
          </div>
        </div>

        {/* Global Toolbar */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => generateSimulatedError('EXECUTION_ERROR')}
            className="flex items-center gap-2 px-3.5 py-2 bg-red-600/20 hover:bg-red-600/30 border border-red-500/40 text-red-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Bug className="w-4 h-4" />
            Inject EXECUTION_ERROR
          </button>

          <button
            onClick={() => generateSimulatedError()}
            className="flex items-center gap-2 px-3.5 py-2 bg-indigo-600/20 hover:bg-indigo-600/30 border border-indigo-500/40 text-indigo-300 rounded-lg text-xs font-medium transition-colors"
          >
            <Play className="w-3.5 h-3.5" />
            Simulate Exception
          </button>

          <div className="flex items-center gap-2 bg-slate-900 border border-slate-800 rounded-lg px-3 py-1.5 text-xs">
            <span className="text-slate-400">Auto-refresh:</span>
            <button
              onClick={() => setIsAutoRefresh(!isAutoRefresh)}
              className={`px-2 py-0.5 rounded font-mono font-semibold transition-colors ${
                isAutoRefresh
                  ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                  : 'bg-slate-800 text-slate-500'
              }`}
            >
              {isAutoRefresh ? 'ACTIVE' : 'PAUSED'}
            </button>
            <select
              value={refreshInterval}
              onChange={(e) => setRefreshInterval(Number(e.target.value))}
              className="bg-slate-800 text-slate-300 border border-slate-700 rounded px-1.5 py-0.5 text-xs focus:outline-none"
            >
              <option value={1000}>1s</option>
              <option value={3000}>3s</option>
              <option value={5000}>5s</option>
            </select>
          </div>

          <button
            onClick={handleExportJSON}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 rounded-lg transition-colors"
            title="Export JSON telemetry report"
          >
            <Download className="w-4 h-4" />
          </button>

          <button
            onClick={handleClearLogs}
            className="p-2 bg-slate-900 hover:bg-red-950/40 border border-slate-800 hover:border-red-900/50 text-slate-400 hover:text-red-400 rounded-lg transition-colors"
            title="Clear all local error logs"
          >
            <Trash2 className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm relative overflow-hidden">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Error Rate</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">
                {metrics.errorRatePercentage.toFixed(2)}%
              </h3>
            </div>
            <div className={`p-2 rounded-lg ${metrics.errorRatePercentage > 2 ? 'bg-red-950 text-red-400' : 'bg-emerald-950 text-emerald-400'}`}>
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="mt-3 flex items-center gap-2 text-xs text-slate-400 font-mono">
            <span>{metrics.totalErrors} errors</span>
            <span>/</span>
            <span>{metrics.totalRequests.toLocaleString()} requests</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                metrics.errorRatePercentage > 3 ? 'bg-red-500' : metrics.errorRatePercentage > 1 ? 'bg-amber-500' : 'bg-emerald-500'
              }`}
              style={{ width: `${Math.min(metrics.errorRatePercentage * 10, 100)}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Critical Unresolved</p>
              <h3 className="text-2xl font-bold font-mono text-red-400 mt-1">
                {metrics.criticalErrorsCount}
              </h3>
            </div>
            <div className="p-2 bg-red-950/60 border border-red-900/40 text-red-400 rounded-lg">
              <AlertTriangle className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-1.5">
            <Clock className="w-3.5 h-3.5 text-slate-500" />
            Requires immediate developer triage
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">Dominant Exception</p>
              <h3 className="text-lg font-bold font-mono text-indigo-300 mt-1 truncate max-w-[180px]">
                {metrics.dominantErrorCode}
              </h3>
            </div>
            <div className="p-2 bg-indigo-950/60 border border-indigo-900/40 text-indigo-400 rounded-lg">
              <BarChart2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 font-mono">
            Captured by AppMetricsCollector
          </p>
        </div>

        <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-slate-400 text-xs uppercase tracking-wider font-semibold">System SLA Availability</p>
              <h3 className="text-2xl font-bold font-mono text-emerald-400 mt-1">
                {metrics.uptimePercentage}%
              </h3>
            </div>
            <div className="p-2 bg-emerald-950/60 border border-emerald-900/40 text-emerald-400 rounded-lg">
              <CheckCircle2 className="w-5 h-5" />
            </div>
          </div>
          <p className="text-xs text-slate-400 mt-3 flex items-center gap-2">
            <Cpu className="w-3.5 h-3.5 text-slate-500" />
            Avg Response Latency: <span className="font-mono text-slate-200">{metrics.avgLatencyMs}ms</span>
          </p>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 mb-6">
        <button
          onClick={() => setActiveTab('stream')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'stream'
              ? 'border-red-500 text-red-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Terminal className="w-4 h-4" />
          Live Exception Log ({filteredLogs.length})
        </button>
        <button
          onClick={() => setActiveTab('breakdown')}
          className={`flex items-center gap-2 px-4 py-2.5 font-medium text-sm border-b-2 transition-colors ${
            activeTab === 'breakdown'
              ? 'border-red-500 text-red-400 bg-slate-900/50'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          Error Code Distribution
        </button>
      </div>

      {/* Tab 1: Live Exception Log */}
      {activeTab === 'stream' && (
        <div className="space-y-4">
          {/* Filters Bar */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 flex flex-col lg:flex-row gap-3 justify-between items-center">
            {/* Search Input */}
            <div className="relative w-full lg:w-80">
              <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-slate-500" />
              <input
                type="text"
                placeholder="Search error code, service, or stack..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-slate-700"
              />
            </div>

            {/* Select Dropdowns */}
            <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto">
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5" />
                <span>Filters:</span>
              </div>

              {/* Severity Filter */}
              <select
                value={selectedSeverity}
                onChange={(e) => setSelectedSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-700"
              >
                <option value="ALL">All Severities</option>
                <option value="CRITICAL">CRITICAL</option>
                <option value="HIGH">HIGH</option>
                <option value="MEDIUM">MEDIUM</option>
                <option value="LOW">LOW</option>
              </select>

              {/* Error Code Filter */}
              <select
                value={selectedErrorCode}
                onChange={(e) => setSelectedErrorCode(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-700 max-w-[180px] truncate"
              >
                <option value="ALL">All Error Codes</option>
                {DEFAULT_ERROR_CODES.map((code) => (
                  <option key={code} value={code}>
                    {code}
                  </option>
                ))}
              </select>

              {/* Service Filter */}
              <select
                value={selectedService}
                onChange={(e) => setSelectedService(e.target.value)}
                className="bg-slate-950 border border-slate-800 text-slate-300 rounded-lg px-2.5 py-1.5 text-xs focus:outline-none focus:border-slate-700 max-w-[180px] truncate"
              >
                <option value="ALL">All Services</option>
                {DEFAULT_SERVICES.map((srv) => (
                  <option key={srv} value={srv}>
                    {srv}
                  </option>
                ))}
              </select>
            </div>
          </div>

          {/* Logs List Table / Feed */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl overflow-hidden shadow-sm">
            {filteredLogs.length === 0 ? (
              <div className="py-16 text-center text-slate-500">
                <AlertCircle className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm font-medium">No error events matching current filter conditions.</p>
                <p className="text-xs mt-1">Try resetting filters or injecting a simulated error.</p>
              </div>
            ) : (
              <div className="divide-y divide-slate-800/80 font-mono text-xs">
                {filteredLogs.map((log) => {
                  const isExpanded = expandedLogId === log.id;
                  return (
                    <div
                      key={log.id}
                      className={`transition-colors ${
                        log.resolved ? 'opacity-60 bg-slate-950/40' : 'hover:bg-slate-800/40'
                      }`}
                    >
                      {/* Event Row Summary */}
                      <div
                        onClick={() => setExpandedLogId(isExpanded ? null : log.id)}
                        className="p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 cursor-pointer select-none"
                      >
                        <div className="flex items-start md:items-center gap-3">
                          <button className="mt-0.5 md:mt-0 text-slate-500 hover:text-slate-300">
                            {isExpanded ? <ChevronDown className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                          </button>

                          <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${getSeverityBadgeClass(log.severity)}`}>
                            {log.severity}
                          </span>

                          <span className="font-semibold text-red-300 px-2 py-0.5 bg-red-950/40 border border-red-900/30 rounded">
                            {log.errorCode}
                          </span>

                          <span className="text-slate-400 hidden sm:inline">[{log.service}]</span>

                          <p className="text-slate-200 truncate max-w-xs md:max-w-md lg:max-w-xl font-sans">
                            {log.message}
                          </p>
                        </div>

                        <div className="flex items-center gap-3 text-slate-400 text-[11px] ml-7 md:ml-0">
                          <span className="text-slate-500">{new Date(log.timestamp).toLocaleTimeString()}</span>

                          <button
                            onClick={(e) => handleToggleResolve(log.id, e)}
                            className={`px-2 py-1 rounded text-[10px] font-sans border transition-colors ${
                              log.resolved
                                ? 'bg-emerald-950/60 border-emerald-800/60 text-emerald-400'
                                : 'bg-slate-800 border-slate-700 text-slate-300 hover:bg-slate-700'
                            }`}
                          >
                            {log.resolved ? 'RESOLVED' : 'MARK RESOLVED'}
                          </button>
                        </div>
                      </div>

                      {/* Expanded Drawer Details */}
                      {isExpanded && (
                        <div className="bg-slate-950 p-4 border-t border-slate-800/80 space-y-4 font-mono text-xs">
                          <div>
                            <span className="text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
                              Stack Trace:
                            </span>
                            <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-red-300/90 overflow-x-auto whitespace-pre-wrap font-mono leading-relaxed">
                              {log.stackTrace || 'No stack trace provided for this event.'}
                            </pre>
                          </div>

                          {log.metadata && (
                            <div>
                              <span className="text-slate-500 uppercase text-[10px] tracking-wider block mb-1">
                                Metadata Context Payload:
                              </span>
                              <pre className="p-3 bg-slate-900/90 border border-slate-800 rounded-lg text-indigo-300/90 overflow-x-auto font-mono">
                                {JSON.stringify(log.metadata, null, 2)}
                              </pre>
                            </div>
                          )}

                          <div className="flex justify-between items-center text-[11px] text-slate-500 pt-2 border-t border-slate-900 font-sans">
                            <span>Event ID: <code className="text-slate-400 font-mono">{log.id}</code></span>
                            <span>Captured by AppMetricsCollector</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>
      )}

      {/* Tab 2: Error Code Distribution */}
      {activeTab === 'breakdown' && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Breakdown Table */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm">
            <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
              <Zap className="w-4 h-4 text-amber-400" />
              Error Frequency by Code
            </h3>

            <div className="space-y-4">
              {errorCodeBreakdown.map((item) => (
                <div key={item.code} className="space-y-1.5">
                  <div className="flex justify-between items-center text-xs font-mono">
                    <span className="font-semibold text-slate-200">{item.code}</span>
                    <span className="text-slate-400">
                      {item.count} events ({item.percentage}%)
                    </span>
                  </div>
                  <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden flex">
                    <div
                      className="bg-red-500 h-full"
                      style={{ width: `${item.percentage}%` }}
                    />
                  </div>
                  {item.criticals > 0 && (
                    <p className="text-[10px] text-red-400 font-sans">
                      ⚠️ Contains {item.criticals} critical severity events
                    </p>
                  )}
                </div>
              ))}
            </div>
          </div>

          {/* Diagnostic Recommendation Box */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 shadow-sm flex flex-col justify-between">
            <div>
              <h3 className="text-base font-bold text-white mb-3 flex items-center gap-2">
                <Cpu className="w-4 h-4 text-indigo-400" />
                AppMetricsCollector Diagnostic Engine
              </h3>
              <p className="text-xs text-slate-300 leading-relaxed mb-4">
                Automated heuristic evaluation suggests focusing on high-frequency exception codes and API integration bridges.
              </p>

              <div className="space-y-2.5 text-xs font-sans">
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-red-400 block mb-1">EXECUTION_ERROR Mitigation</span>
                  <p className="text-slate-400">
                    Verify WebAssembly memory allocations in ZKEngine and check worker thread concurrency caps.
                  </p>
                </div>
                <div className="p-3 bg-slate-950 border border-slate-800 rounded-lg">
                  <span className="font-semibold text-amber-400 block mb-1">SAVE_API_TIMEOUT Mitigation</span>
                  <p className="text-slate-400">
                    Review DHS government gateway proxy retry backoff strategies and exponential timeouts.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-4 border-t border-slate-800 text-xs text-slate-500 flex justify-between items-center font-mono">
              <span>Telemetry sync: ACTIVE</span>
              <span>Buffer health: 100%</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppErrorRateTracker;