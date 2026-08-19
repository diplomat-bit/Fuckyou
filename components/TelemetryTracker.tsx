

// --- CONSOLIDATED FROM: ./components/CitiB2B/TelemetryTracker.tsx ---

import React, { useState, useEffect, useMemo, useCallback } from 'react';

interface AuditLog {
  id: string;
  timestamp: string;
  method: string;
  path: string;
  statusCode: number;
  latencyMs: number;
  clientId: string;
  uuid: string;
  ipAddress?: string;
  userAgent?: string;
  requestHeaders?: Record<string, string>;
  requestBody?: any;
  responseBody?: any;
  gitHubActor?: string;
  gitHubRepo?: string;
  gitHubWorkflow?: string;
  gitHubAction?: string;
  gitHubSha?: string;
  gitHubRef?: string;
  gitHubRunId?: string;
}

export default function TelemetryTracker() {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [isLive, setIsLive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'overview' | 'request' | 'response' | 'github'>('overview');

  // Filters state
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [endpointFilter, setEndpointFilter] = useState<string>('all');
  const [actorFilter, setActorFilter] = useState<string>('all');
  const [timeFilter, setTimeFilter] = useState<string>('all');

  // Generate mock logs for fallback/development
  const generateMockLogs = useCallback((): AuditLog[] => {
    const endpoints = [
      { path: '/accounts/details', method: 'GET' },
      { path: '/accounts/8035a60debb671e89bd451c9ad0f283e8f1b8868dd4dc65520ceb7bdfeb4142999f574c9db37917ef0edfae296745142543e3ad2bc034887f37212ecbde83ee0/transactions', method: 'GET' },
      { path: '/accounts/da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6/encrypt/accountRoutingNumber', method: 'GET' }
    ];
    const statuses = [200, 200, 200, 200, 400, 401, 403, 404, 500];
    const actors = ['diplomat-citi', 'github-actions[bot]', 'developer-john', 'citi-partner-sync'];
    const clientIds = ['client_id_prod_098f', 'client_id_sandbox_4a2c', 'client_id_test_886b'];

    return Array.from({ length: 30 }).map((_, index) => {
      const endpoint = endpoints[Math.floor(Math.random() * endpoints.length)];
      const statusCode = statuses[Math.floor(Math.random() * statuses.length)];
      const clientId = clientIds[Math.floor(Math.random() * clientIds.length)];
      const actor = actors[Math.floor(Math.random() * actors.length)];
      const latency = Math.floor(Math.random() * 450) + 30;
      const uuid = Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
      const timestamp = new Date(Date.now() - index * 1000 * 60 * 8).toISOString();

      return {
        id: `log-${index}-${Date.now()}`,
        timestamp,
        method: endpoint.method,
        path: endpoint.path,
        statusCode,
        latencyMs: latency,
        clientId,
        uuid: `${uuid.slice(0, 8)}-${uuid.slice(8, 12)}-${uuid.slice(12, 16)}-${uuid.slice(16, 20)}-${uuid.slice(20)}`,
        ipAddress: `192.168.1.${Math.floor(Math.random() * 254) + 1}`,
        userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36',
        requestHeaders: {
          'Authorization': 'Bearer KGNsaWVudF9pZDpjbGllbnRfc2VjcmV0KQ==',
          'Accept': 'application/json',
          'X-IBM-Client-Id': clientId,
          'X-GitHub-Event': 'workflow_dispatch'
        },
        requestBody: endpoint.path.includes('transactions') ? { transactionFromDate: '2026-01-01', transactionToDate: '2026-02-15' } : null,
        responseBody: statusCode === 200 ? {
          status: 'success',
          accountGroupDetails: [
            {
              accountGroup: 'CHECKING',
              checkingAccountsDetails: [
                {
                  accountId: 'da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6',
                  productName: 'Business Checking',
                  accountStatus: 'ACTIVE',
                  balanceType: 'ASSET',
                  currencyCode: 'USD',
                  displayAccountNumber: 'XXXXXX9594',
                  currentBalance: 10000.25,
                  availableBalance: 15000.25
                }
              ]
            }
          ]
        } : {
          errors: [
            {
              type: statusCode === 401 ? 'error' : statusCode === 403 ? 'error' : 'invalid',
              code: statusCode === 401 ? 'unAuthorized' : statusCode === 403 ? 'accessNotConfigured' : 'invalidRequest',
              details: statusCode === 401 ? 'Authorization credentials are missing or invalid' : 'The request operation is not configured to access this resource'
            }
          ]
        },
        gitHubActor: actor,
        gitHubRepo: 'citi-b2b-integration',
        gitHubWorkflow: 'B2B API Telemetry Sync',
        gitHubAction: 'sync-telemetry',
        gitHubSha: 'a1b2c3d4e5f6g7h8i9j0',
        gitHubRef: 'refs/heads/main',
        gitHubRunId: `${Math.floor(Math.random() * 1000000000)}`
      };
    });
  }, []);

  // Fetch logs from server.ts GitHub Audit Logger endpoint
  const fetchLogs = useCallback(async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/audit-logs');
      if (!response.ok) {
        throw new Error('Failed to fetch audit logs from server');
      }
      const data = await response.json();
      setLogs(data);
      setError(null);
    } catch (err: any) {
      console.warn('Backend audit log endpoint unavailable, using mock telemetry data.', err);
      // Fallback to mock logs for demonstration
      if (logs.length === 0) {
        setLogs(generateMockLogs());
      }
    } finally {
      setLoading(false);
    }
  }, [logs.length, generateMockLogs]);

  // Polling for live updates
  useEffect(() => {
    fetchLogs();
    if (!isLive) return;

    const interval = setInterval(() => {
      fetchLogs();
    }, 5000);

    return () => clearInterval(interval);
  }, [isLive, fetchLogs]);

  // Clear logs
  const clearLogs = async () => {
    if (window.confirm('Are you sure you want to clear all audit logs?')) {
      try {
        await fetch('/api/audit-logs', { method: 'DELETE' });
        setLogs([]);
        setSelectedLog(null);
      } catch (err) {
        // If backend fails, just clear local state
        setLogs([]);
        setSelectedLog(null);
      }
    }
  };

  // Copy to clipboard helper
  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    alert('Copied to clipboard!');
  };

  // Filtered logs calculation
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      // Search query filter
      const matchesSearch =
        log.clientId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.uuid.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (log.gitHubActor && log.gitHubActor.toLowerCase().includes(searchQuery.toLowerCase()));

      // Status filter
      const matchesStatus =
        statusFilter === 'all' ||
        (statusFilter === '2xx' && log.statusCode >= 200 && log.statusCode < 300) ||
        (statusFilter === '4xx' && log.statusCode >= 400 && log.statusCode < 500) ||
        (statusFilter === '5xx' && log.statusCode >= 500);

      // Endpoint filter
      const matchesEndpoint =
        endpointFilter === 'all' ||
        (endpointFilter === 'details' && log.path.includes('/details')) ||
        (endpointFilter === 'transactions' && log.path.includes('/transactions')) ||
        (endpointFilter === 'routing' && log.path.includes('/encrypt/accountRoutingNumber'));

      // Actor filter
      const matchesActor =
        actorFilter === 'all' || log.gitHubActor === actorFilter;

      // Time filter
      let matchesTime = true;
      if (timeFilter !== 'all') {
        const logTime = new Date(log.timestamp).getTime();
        const now = Date.now();
        if (timeFilter === '15m') matchesTime = now - logTime <= 15 * 60 * 1000;
        else if (timeFilter === '1h') matchesTime = now - logTime <= 60 * 60 * 1000;
        else if (timeFilter === '24h') matchesTime = now - logTime <= 24 * 60 * 60 * 1000;
      }

      return matchesSearch && matchesStatus && matchesEndpoint && matchesActor && matchesTime;
    });
  }, [logs, searchQuery, statusFilter, endpointFilter, actorFilter, timeFilter]);

  // Metrics calculations
  const metrics = useMemo(() => {
    if (filteredLogs.length === 0) {
      return { total: 0, successRate: 0, avgLatency: 0, errorCount: 0 };
    }
    const total = filteredLogs.length;
    const successCount = filteredLogs.filter((l) => l.statusCode >= 200 && l.statusCode < 300).length;
    const errorCount = filteredLogs.filter((l) => l.statusCode >= 400).length;
    const totalLatency = filteredLogs.reduce((acc, curr) => acc + curr.latencyMs, 0);

    return {
      total,
      successRate: Math.round((successCount / total) * 100),
      avgLatency: Math.round(totalLatency / total),
      errorCount
    };
  }, [filteredLogs]);

  // Unique actors for filter dropdown
  const uniqueActors = useMemo(() => {
    const actors = new Set<string>();
    logs.forEach((log) => {
      if (log.gitHubActor) actors.add(log.gitHubActor);
    });
    return Array.from(actors);
  }, [logs]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
              </svg>
            </span>
            <h1 className="text-2xl font-bold tracking-tight">Citi B2B API Telemetry & Audit Logs</h1>
          </div>
          <p className="text-slate-400 text-sm mt-1">
            Real-time monitoring of B2B Accounts & Transactions API requests integrated with GitHub Audit Logger.
          </p>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button
            onClick={() => setIsLive(!isLive)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium border transition-all ${
              isLive
                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30 hover:bg-emerald-500/20'
                : 'bg-slate-800 text-slate-400 border-slate-700 hover:bg-slate-700'
            }`}
          >
            <span className={`w-2 h-2 rounded-full ${isLive ? 'bg-emerald-400 animate-pulse' : 'bg-slate-500'}`} />
            {isLive ? 'Live Polling' : 'Polling Paused'}
          </button>

          <button
            onClick={fetchLogs}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-slate-300 transition-all"
            title="Refresh Logs"
          >
            <svg className={`w-5 h-5 ${loading ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 15H15.61" />
            </svg>
          </button>

          <button
            onClick={clearLogs}
            className="px-3 py-2 bg-red-950/30 hover:bg-red-900/30 border border-red-900/40 text-red-400 rounded-lg text-sm font-medium transition-all"
          >
            Clear Logs
          </button>
        </div>
      </div>

      {/* Metrics Dashboard */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Total Requests</p>
            <h3 className="text-2xl font-bold mt-1">{metrics.total}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Success Rate</p>
            <h3 className={`text-2xl font-bold mt-1 ${metrics.successRate >= 90 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metrics.successRate}%
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${metrics.successRate >= 90 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-amber-500/10 text-amber-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Avg Latency</p>
            <h3 className={`text-2xl font-bold mt-1 ${metrics.avgLatency < 200 ? 'text-emerald-400' : 'text-amber-400'}`}>
              {metrics.avgLatency} ms
            </h3>
          </div>
          <div className="p-3 bg-purple-500/10 text-purple-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
        </div>

        <div className="bg-slate-800/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">Failed Requests</p>
            <h3 className={`text-2xl font-bold mt-1 ${metrics.errorCount > 0 ? 'text-red-400' : 'text-slate-400'}`}>
              {metrics.errorCount}
            </h3>
          </div>
          <div className={`p-3 rounded-lg ${metrics.errorCount > 0 ? 'bg-red-500/10 text-red-400' : 'bg-slate-700/30 text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
            </svg>
          </div>
        </div>
      </div>

      {/* Filters Panel */}
      <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          {/* Search */}
          <div className="relative">
            <span className="absolute inset-y-0 left-0 flex items-center pl-3 pointer-events-none text-slate-500">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
            </span>
            <input
              type="text"
              placeholder="Search Client ID, UUID, Actor..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-all"
            />
          </div>

          {/* Status Filter */}
          <div>
            <select
              value={statusFilter}
              onChange={(e) => setStatusFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="all">All Status Codes</option>
              <option value="2xx">Success (2xx)</option>
              <option value="4xx">Client Error (4xx)</option>
              <option value="5xx">Server Error (5xx)</option>
            </select>
          </div>

          {/* Endpoint Filter */}
          <div>
            <select
              value={endpointFilter}
              onChange={(e) => setEndpointFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="all">All Endpoints</option>
              <option value="details">/accounts/details</option>
              <option value="transactions">/accounts/&#123;id&#125;/transactions</option>
              <option value="routing">/accounts/&#123;id&#125;/encrypt/routing</option>
            </select>
          </div>

          {/* GitHub Actor Filter */}
          <div>
            <select
              value={actorFilter}
              onChange={(e) => setActorFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="all">All GitHub Actors</option>
              {uniqueActors.map((actor) => (
                <option key={actor} value={actor}>
                  {actor}
                </option>
              ))}
            </select>
          </div>

          {/* Time Filter */}
          <div>
            <select
              value={timeFilter}
              onChange={(e) => setTimeFilter(e.target.value)}
              className="w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-lg text-sm text-slate-200 focus:outline-none focus:border-blue-500 transition-all"
            >
              <option value="all">All Time</option>
              <option value="15m">Last 15 Minutes</option>
              <option value="1h">Last Hour</option>
              <option value="24h">Last 24 Hours</option>
            </select>
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 items-start">
        {/* Logs Table */}
        <div className="lg:col-span-2 bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden">
          <div className="px-5 py-4 border-b border-slate-800 flex justify-between items-center bg-slate-800/20">
            <h2 className="font-semibold text-slate-200 flex items-center gap-2">
              <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
              Audit Trail ({filteredLogs.length} logs)
            </h2>
            {loading && <span className="text-xs text-blue-400 animate-pulse">Syncing...</span>}
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider bg-slate-900/30">
                  <th className="py-3 px-4">Status</th>
                  <th className="py-3 px-4">Method & Path</th>
                  <th className="py-3 px-4">Client ID</th>
                  <th className="py-3 px-4">Latency</th>
                  <th className="py-3 px-4">GitHub Actor</th>
                  <th className="py-3 px-4 text-right">Time</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredLogs.length === 0 ? (
                  <tr>
                    <td colSpan={6} className="py-8 text-center text-slate-500 text-sm">
                      No audit logs match the selected filters.
                    </td>
                  </tr>
                ) : (
                  filteredLogs.map((log) => {
                    const isSuccess = log.statusCode >= 200 && log.statusCode < 300;
                    const isClientError = log.statusCode >= 400 && log.statusCode < 500;
                    const isServerError = log.statusCode >= 500;

                    return (
                      <tr
                        key={log.id}
                        onClick={() => setSelectedLog(log)}
                        className={`hover:bg-slate-700/30 cursor-pointer transition-all ${
                          selectedLog?.id === log.id ? 'bg-blue-600/10 border-l-2 border-l-blue-500' : ''
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <span
                            className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                              isSuccess
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : isClientError
                                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                                : 'bg-red-500/10 text-red-400 border border-red-500/20'
                            }`}
                          >
                            {log.statusCode}
                          </span>
                        </td>
                        <td className="py-3.5 px-4">
                          <div className="flex flex-col max-w-xs md:max-w-md">
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-blue-400 uppercase">{log.method}</span>
                              <span className="text-sm font-medium text-slate-200 truncate" title={log.path}>
                                {log.path}
                              </span>
                            </div>
                            <span className="text-[10px] text-slate-500 font-mono truncate mt-0.5">
                              UUID: {log.uuid}
                            </span>
                          </div>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-300 font-mono">
                          {log.clientId.replace('client_id_', '')}
                        </td>
                        <td className="py-3.5 px-4 text-sm">
                          <span
                            className={`font-medium ${
                              log.latencyMs < 150
                                ? 'text-emerald-400'
                                : log.latencyMs < 350
                                ? 'text-amber-400'
                                : 'text-red-400'
                            }`}
                          >
                            {log.latencyMs}ms
                          </span>
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-300">
                          {log.gitHubActor ? (
                            <div className="flex items-center gap-1.5">
                              <svg className="w-4 h-4 text-slate-400" fill="currentColor" viewBox="0 0 24 24">
                                <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                              </svg>
                              <span className="truncate max-w-[100px]">{log.gitHubActor}</span>
                            </div>
                          ) : (
                            <span className="text-slate-600">-</span>
                          )}
                        </td>
                        <td className="py-3.5 px-4 text-sm text-slate-400 text-right font-mono">
                          {new Date(log.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Log Inspector Panel */}
        <div className="bg-slate-800/40 border border-slate-800 rounded-xl overflow-hidden min-h-[500px]">
          {selectedLog ? (
            <div className="flex flex-col h-full">
              {/* Inspector Header */}
              <div className="p-5 border-b border-slate-800 bg-slate-800/20">
                <div className="flex justify-between items-start gap-2">
                  <div>
                    <span className="text-[10px] font-bold uppercase tracking-wider text-blue-400">Request Inspector</span>
                    <h3 className="font-bold text-lg text-slate-100 flex items-center gap-2 mt-1">
                      <span className="text-xs font-mono bg-blue-600/20 text-blue-400 px-2 py-0.5 rounded">
                        {selectedLog.method}
                      </span>
                      <span className="truncate max-w-[180px]" title={selectedLog.path}>
                        {selectedLog.path.split('/').pop()}
                      </span>
                    </h3>
                  </div>
                  <button
                    onClick={() => setSelectedLog(null)}
                    className="text-slate-400 hover:text-slate-200 p-1 hover:bg-slate-700 rounded"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>

                {/* Quick Stats */}
                <div className="grid grid-cols-3 gap-2 mt-4 pt-4 border-t border-slate-800/60 text-center">
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Status</span>
                    <span className={`text-sm font-bold ${selectedLog.statusCode < 300 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {selectedLog.statusCode}
                    </span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Latency</span>
                    <span className="text-sm font-bold text-purple-400">{selectedLog.latencyMs}ms</span>
                  </div>
                  <div className="bg-slate-900/40 p-2 rounded border border-slate-800">
                    <span className="text-[10px] text-slate-500 block uppercase">Client</span>
                    <span className="text-sm font-bold text-slate-300 truncate block px-1">
                      {selectedLog.clientId.replace('client_id_', '')}
                    </span>
                  </div>
                </div>
              </div>

              {/* Inspector Tabs */}
              <div className="flex border-b border-slate-800 bg-slate-900/20">
                {(['overview', 'request', 'response', 'github'] as const).map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`flex-1 py-2.5 text-xs font-semibold uppercase tracking-wider border-b-2 transition-all ${
                      activeTab === tab
                        ? 'border-blue-500 text-blue-400 bg-blue-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    {tab}
                  </button>
                ))}
              </div>

              {/* Inspector Content */}
              <div className="p-5 flex-1 overflow-y-auto max-h-[550px] text-sm">
                {activeTab === 'overview' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Request Metadata</h4>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-500">Timestamp:</span>
                          <span className="text-slate-300">{new Date(selectedLog.timestamp).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center">
                          <span className="text-slate-500">Request UUID:</span>
                          <div className="flex items-center gap-1">
                            <span className="text-slate-300 truncate max-w-[120px]" title={selectedLog.uuid}>
                              {selectedLog.uuid}
                            </span>
                            <button onClick={() => copyToClipboard(selectedLog.uuid)} className="text-blue-400 hover:text-blue-300">
                              <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 5H6a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2v-1M8 5a2 2 0 002 2h2a2 2 0 002-2M8 5a2 2 0 012-2h2a2 2 0 012 2m0 0h2a2 2 0 012 2v3m2 4H10m0 0l3-3m-3 3l3 3" />
                              </svg>
                            </button>
                          </div>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">IP Address:</span>
                          <span className="text-slate-300">{selectedLog.ipAddress || 'N/A'}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-500">User Agent:</span>
                          <span className="text-slate-300 truncate max-w-[150px]" title={selectedLog.userAgent}>
                            {selectedLog.userAgent || 'N/A'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {selectedLog.gitHubActor && (
                      <div>
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">GitHub Context Summary</h4>
                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 space-y-2 font-mono text-xs">
                          <div className="flex justify-between">
                            <span className="text-slate-500">Actor:</span>
                            <span className="text-blue-400 font-semibold">{selectedLog.gitHubActor}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Repository:</span>
                            <span className="text-slate-300">{selectedLog.gitHubRepo}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-slate-500">Workflow:</span>
                            <span className="text-slate-300 truncate max-w-[150px]" title={selectedLog.gitHubWorkflow}>
                              {selectedLog.gitHubWorkflow}
                            </span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}

                {activeTab === 'request' && (
                  <div className="space-y-4">
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Headers</h4>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                        {selectedLog.requestHeaders ? (
                          Object.entries(selectedLog.requestHeaders).map(([key, val]) => (
                            <div key={key} className="py-1 border-b border-slate-800/40 last:border-0">
                              <span className="text-blue-400">{key}:</span> <span className="text-slate-300 break-all">{val}</span>
                            </div>
                          ))
                        ) : (
                          <span className="text-slate-500">No headers logged</span>
                        )}
                      </div>
                    </div>

                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payload / Query Params</h4>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto">
                        {selectedLog.requestBody ? (
                          <pre className="text-slate-300">{JSON.stringify(selectedLog.requestBody, null, 2)}</pre>
                        ) : (
                          <span className="text-slate-500">No request body payload</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'response' && (
                  <div className="space-y-4">
                    <div>
                      <div className="flex justify-between items-center mb-1.5">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Response Body</h4>
                        <button
                          onClick={() => copyToClipboard(JSON.stringify(selectedLog.responseBody, null, 2))}
                          className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
                        >
                          Copy JSON
                        </button>
                      </div>
                      <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 font-mono text-xs overflow-x-auto max-h-[350px]">
                        {selectedLog.responseBody ? (
                          <pre className="text-slate-300">{JSON.stringify(selectedLog.responseBody, null, 2)}</pre>
                        ) : (
                          <span className="text-slate-500">No response body logged</span>
                        )}
                      </div>
                    </div>
                  </div>
                )}

                {activeTab === 'github' && (
                  <div className="space-y-4">
                    {selectedLog.gitHubActor ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-3 p-3 bg-slate-900/30 border border-slate-800 rounded-lg">
                          <svg className="w-8 h-8 text-slate-300" fill="currentColor" viewBox="0 0 24 24">
                            <path fillRule="evenodd" clipRule="evenodd" d="M12 2C6.477 2 2 6.484 2 12.017c0 4.425 2.865 8.18 6.839 9.504.5.092.682-.217.682-.483 0-.237-.008-.868-.013-1.703-2.782.605-3.369-1.343-3.369-1.343-.454-1.158-1.11-1.466-1.11-1.466-.908-.62.069-.608.069-.608 1.003.07 1.531 1.032 1.531 1.032.892 1.53 2.341 1.088 2.91.832.092-.647.35-1.088.636-1.338-2.22-.253-4.555-1.113-4.555-4.951 0-1.093.39-1.988 1.029-2.688-.103-.253-.446-1.272.098-2.65 0 0 .84-.27 2.75 1.026A9.564 9.564 0 0112 6.844c.85.004 1.705.115 2.504.337 1.909-1.296 2.747-1.027 2.747-1.027.546 1.379.202 2.398.1 2.651.64.7 1.028 1.595 1.028 2.688 0 3.848-2.339 4.695-4.566 4.943.359.309.678.92.678 1.855 0 1.338-.012 2.419-.012 2.747 0 .268.18.58.688.482A10.019 10.019 0 0022 12.017C22 6.484 17.522 2 12 2z" />
                          </svg>
                          <div>
                            <h5 className="font-bold text-slate-200">{selectedLog.gitHubActor}</h5>
                            <p className="text-xs text-slate-400">Triggered via GitHub Actions</p>
                          </div>
                        </div>

                        <div className="bg-slate-900/50 border border-slate-800 rounded-lg p-3 space-y-3 font-mono text-xs">
                          <div>
                            <span className="text-slate-500 block">Repository:</span>
                            <span className="text-slate-200">{selectedLog.gitHubRepo}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Workflow Name:</span>
                            <span className="text-slate-200">{selectedLog.gitHubWorkflow}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Action:</span>
                            <span className="text-slate-200">{selectedLog.gitHubAction}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Commit SHA:</span>
                            <span className="text-slate-300 break-all">{selectedLog.gitHubSha}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Git Ref:</span>
                            <span className="text-slate-300">{selectedLog.gitHubRef}</span>
                          </div>
                          <div>
                            <span className="text-slate-500 block">Run ID:</span>
                            <span className="text-slate-300">{selectedLog.gitHubRunId}</span>
                          </div>
                        </div>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-slate-500">
                        <svg className="w-12 h-12 mx-auto text-slate-600 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.828 10.172a4 4 0 00-5.656 0l-4 4a4 4 0 105.656 5.656l1.102-1.101m-.758-4.899a4 4 0 005.656 0l4-4a4 4 0 00-5.656-5.656l-1.1 1.1" />
                        </svg>
                        <p className="text-sm">No GitHub Actions context associated with this request.</p>
                        <p className="text-xs text-slate-600 mt-1">This request was initiated directly outside of a CI/CD workflow.</p>
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-center p-8 text-slate-500 min-h-[500px]">
              <svg className="w-16 h-12 text-slate-700 mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
              </svg>
              <h3 className="font-semibold text-slate-300 text-base">No Log Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs mt-1">
                Select an API request from the audit trail to inspect full headers, payloads, responses, and GitHub workflow telemetry.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}