import React, { useState, useEffect, useRef } from 'react';

// Types & Interfaces
interface MicroApp {
  id: string;
  name: string;
  category: string;
  latency: number; // ms
  errorRate: number; // %
  memory: number; // MB
}

interface Thresholds {
  latency: number;
  errorRate: number;
  memory: number;
}

interface Alert {
  id: string;
  timestamp: string;
  appId: string;
  appName: string;
  metric: 'latency' | 'errorRate' | 'memory';
  value: number;
  threshold: number;
  severity: 'warning' | 'critical';
  status: 'active' | 'resolved';
  resolvedAt?: string;
}

interface WebhookPayload {
  event: 'thresholdExceeded';
  timestamp: string;
  alertId: string;
  appId: string;
  appName: string;
  metric: string;
  value: string;
  threshold: string;
  severity: string;
  payloadId: string;
}

const INITIAL_APPS: MicroApp[] = [
  { id: 'citi-gateway', name: 'CitiConnect Integration Gateway', category: 'Treasury', latency: 120, errorRate: 0.05, memory: 256 },
  { id: 'pqc-bridge', name: 'PQC Crypto Bridge Simulator', category: 'Security', latency: 240, errorRate: 0.1, memory: 412 },
  { id: 'modern-treasury', name: 'Modern Treasury Ledger Hub', category: 'Ledger', latency: 95, errorRate: 0.0, memory: 180 },
  { id: 'voter-portal', name: 'Voter Registration Portal', category: 'Government', latency: 180, errorRate: 0.4, memory: 310 },
  { id: 'alpaca-broker', name: 'Alpaca Broker View', category: 'Trading', latency: 150, errorRate: 0.2, memory: 290 },
  { id: 'azure-auditor', name: 'Azure AD App Auditor', category: 'Compliance', latency: 310, errorRate: 0.8, memory: 480 },
];

const DEFAULT_THRESHOLDS: Record<string, Thresholds> = {
  'citi-gateway': { latency: 250, errorRate: 2.0, memory: 512 },
  'pqc-bridge': { latency: 400, errorRate: 1.5, memory: 600 },
  'modern-treasury': { latency: 200, errorRate: 1.0, memory: 350 },
  'voter-portal': { latency: 350, errorRate: 3.0, memory: 512 },
  'alpaca-broker': { latency: 300, errorRate: 2.0, memory: 450 },
  'azure-auditor': { latency: 500, errorRate: 4.0, memory: 700 },
};

export default function AppMetricsAlertsConsole() {
  const [apps, setApps] = useState<MicroApp[]>(INITIAL_APPS);
  const [thresholds, setThresholds] = useState<Record<string, Thresholds>>(DEFAULT_THRESHOLDS);
  const [alerts, setAlerts] = useState<Alert[]>([]);
  const [webhookLogs, setWebhookLogs] = useState<WebhookPayload[]>([]);
  const [isSimulating, setIsSimulating] = useState<boolean>(true);
  const [selectedAppId, setSelectedAppId] = useState<string>('citi-gateway');
  const [activeTab, setActiveTab] = useState<'alerts' | 'webhooks' | 'thresholds'>('alerts');
  const [filterSeverity, setFilterSeverity] = useState<'all' | 'warning' | 'critical'>('all');
  const [filterStatus, setFilterStatus] = useState<'all' | 'active' | 'resolved'>('all');

  const simulationInterval = useRef<NodeJS.Timeout | null>(null);

  // Helper to generate random ID
  const generateId = () => Math.random().toString(36).substring(2, 11);

  // Helper to format timestamp
  const getTimestamp = () => new Date().toISOString();

  // Trigger a thresholdExceeded event-driven notification
  const triggerWebhookNotification = (alert: Alert) => {
    const payload: WebhookPayload = {
      event: 'thresholdExceeded',
      timestamp: getTimestamp(),
      alertId: alert.id,
      appId: alert.appId,
      appName: alert.appName,
      metric: alert.metric,
      value: alert.metric === 'latency' ? `${alert.value}ms` : alert.metric === 'errorRate' ? `${alert.value}%` : `${alert.value}MB`,
      threshold: alert.metric === 'latency' ? `${alert.threshold}ms` : alert.metric === 'errorRate' ? `${alert.threshold}%` : `${alert.threshold}MB`,
      severity: alert.severity,
      payloadId: `evt_${generateId()}`,
    };
    setWebhookLogs((prev) => [payload, ...prev].slice(0, 50)); // Keep last 50 logs
  };

  // Check metrics against thresholds and generate alerts
  const checkThresholds = (updatedApps: MicroApp[]) => {
    const newAlerts: Alert[] = [];

    updatedApps.forEach((app) => {
      const appThreshold = thresholds[app.id] || { latency: 300, errorRate: 2.0, memory: 512 };

      // Check Latency
      if (app.latency > appThreshold.latency) {
        const severity = app.latency > appThreshold.latency * 1.3 ? 'critical' : 'warning';
        newAlerts.push({
          id: `alt_${generateId()}`,
          timestamp: getTimestamp(),
          appId: app.id,
          appName: app.name,
          metric: 'latency',
          value: app.latency,
          threshold: appThreshold.latency,
          severity,
          status: 'active',
        });
      }

      // Check Error Rate
      if (app.errorRate > appThreshold.errorRate) {
        const severity = app.errorRate > appThreshold.errorRate * 1.5 ? 'critical' : 'warning';
        newAlerts.push({
          id: `alt_${generateId()}`,
          timestamp: getTimestamp(),
          appId: app.id,
          appName: app.name,
          metric: 'errorRate',
          value: parseFloat(app.errorRate.toFixed(2)),
          threshold: appThreshold.errorRate,
          severity,
          status: 'active',
        });
      }

      // Check Memory
      if (app.memory > appThreshold.memory) {
        const severity = app.memory > appThreshold.memory * 1.2 ? 'critical' : 'warning';
        newAlerts.push({
          id: `alt_${generateId()}`,
          timestamp: getTimestamp(),
          appId: app.id,
          appName: app.name,
          metric: 'memory',
          value: app.memory,
          threshold: appThreshold.memory,
          severity,
          status: 'active',
        });
      }
    });

    if (newAlerts.length > 0) {
      setAlerts((prev) => {
        // Filter out duplicates for the same app and metric that are already active
        const filteredNewAlerts = newAlerts.filter((newAlt) => {
          return !prev.some(
            (existingAlt) =>
              existingAlt.appId === newAlt.appId &&
              existingAlt.metric === newAlt.metric &&
              existingAlt.status === 'active'
          );
        });

        if (filteredNewAlerts.length === 0) return prev;

        // Trigger event-driven webhook simulation for each new alert
        filteredNewAlerts.forEach((alert) => triggerWebhookNotification(alert));

        return [...filteredNewAlerts, ...prev];
      });
    }
  };

  // Simulate real-time metric fluctuations
  useEffect(() => {
    if (isSimulating) {
      simulationInterval.current = setInterval(() => {
        setApps((prevApps) => {
          const updated = prevApps.map((app) => {
            // Random fluctuation with occasional spikes
            const spikeChance = Math.random() > 0.85;
            const latencyDelta = spikeChance ? Math.floor(Math.random() * 150) + 50 : Math.floor(Math.random() * 30) - 15;
            const errorDelta = spikeChance ? Math.random() * 2.5 : Math.random() * 0.4 - 0.2;
            const memoryDelta = Math.floor(Math.random() * 20) - 8;

            return {
              ...app,
              latency: Math.max(40, app.latency + latencyDelta),
              errorRate: Math.max(0, parseFloat((app.errorRate + errorDelta).toFixed(2))),
              memory: Math.max(100, app.memory + memoryDelta),
            };
          });

          // Check thresholds on the updated metrics
          checkThresholds(updated);
          return updated;
        });
      }, 3000);
    } else {
      if (simulationInterval.current) {
        clearInterval(simulationInterval.current);
      }
    }

    return () => {
      if (simulationInterval.current) clearInterval(simulationInterval.current);
    };
  }, [isSimulating, thresholds]);

  // Manual Spike Trigger for testing
  const triggerSpike = (appId: string) => {
    setApps((prevApps) => {
      const updated = prevApps.map((app) => {
        if (app.id === appId) {
          const appThreshold = thresholds[appId];
          return {
            ...app,
            latency: Math.floor(appThreshold.latency * 1.4),
            errorRate: parseFloat((appThreshold.errorRate * 1.6).toFixed(2)),
            memory: Math.floor(appThreshold.memory * 1.25),
          };
        }
        return app;
      });
      checkThresholds(updated);
      return updated;
    });
  };

  // Resolve an alert manually
  const resolveAlert = (alertId: string) => {
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.id === alertId
          ? { ...alt, status: 'resolved' as const, resolvedAt: getTimestamp() }
          : alt
      )
    );
  };

  // Resolve all active alerts
  const resolveAllAlerts = () => {
    setAlerts((prev) =>
      prev.map((alt) =>
        alt.status === 'active'
          ? { ...alt, status: 'resolved' as const, resolvedAt: getTimestamp() }
          : alt
      )
    );
  };

  // Clear alert history
  const clearAlertHistory = () => {
    setAlerts([]);
    setWebhookLogs([]);
  };

  // Update threshold handler
  const handleThresholdChange = (metric: keyof Thresholds, value: number) => {
    setThresholds((prev) => ({
      ...prev,
      [selectedAppId]: {
        ...prev[selectedAppId],
        [metric]: value,
      },
    }));
  };

  // Filtered Alerts
  const filteredAlerts = alerts.filter((alt) => {
    const matchesSeverity = filterSeverity === 'all' || alt.severity === filterSeverity;
    const matchesStatus = filterStatus === 'all' || alt.status === filterStatus;
    return matchesSeverity && matchesStatus;
  });

  // Count active alerts
  const activeAlertCount = alerts.filter((a) => a.status === 'active').length;
  const criticalAlertCount = alerts.filter((a) => a.status === 'active' && a.severity === 'critical').length;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pb-6 border-b border-slate-800 mb-8">
        <div>
          <div className="flex items-center gap-3">
            <span className="relative flex h-3 w-3">
              <span className={`animate-ping absolute inline-flex h-full w-full rounded-full opacity-75 ${isSimulating ? 'bg-emerald-400' : 'bg-amber-400'}`}></span>
              <span className={`relative inline-flex rounded-full h-3 w-3 ${isSimulating ? 'bg-emerald-500' : 'bg-amber-500'}`}></span>
            </span>
            <h1 className="text-2xl font-bold tracking-tight text-white">AppMetrics Alerts Console</h1>
          </div>
          <p className="text-sm text-slate-400 mt-1">
            Real-time micro-app telemetry & event-driven <code className="text-emerald-400 bg-slate-900 px-1.5 py-0.5 rounded text-xs">thresholdExceeded</code> webhook dispatcher.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSimulating(!isSimulating)}
            className={`px-4 py-2 rounded-lg font-medium text-sm transition-all flex items-center gap-2 ${
              isSimulating
                ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30 hover:bg-amber-500/20'
                : 'bg-emerald-500 text-slate-950 hover:bg-emerald-400'
            }`}
          >
            {isSimulating ? (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 9v6m4-6v6m7-3a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Pause Simulation
              </>
            ) : (
              <>
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M14.752 11.168l-3.197-2.132A1 1 0 0010 9.87v4.263a1 1 0 001.555.832l3.197-2.132a1 1 0 000-1.664z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                Start Simulation
              </>
            )}
          </button>

          <button
            onClick={() => triggerSpike(selectedAppId)}
            className="px-4 py-2 bg-rose-500/10 text-rose-400 border border-rose-500/30 hover:bg-rose-500/20 rounded-lg font-medium text-sm transition-all flex items-center gap-2"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
            Simulate Spike
          </button>

          <button
            onClick={resolveAllAlerts}
            className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg font-medium text-sm transition-all"
          >
            Resolve All
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active Alerts</p>
            <h3 className="text-3xl font-bold text-white mt-1">{activeAlertCount}</h3>
          </div>
          <div className={`p-3 rounded-lg ${activeAlertCount > 0 ? 'bg-amber-500/10 text-amber-400' : 'bg-slate-800 text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" /></svg>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Critical Breaches</p>
            <h3 className="text-3xl font-bold text-rose-500 mt-1">{criticalAlertCount}</h3>
          </div>
          <div className={`p-3 rounded-lg ${criticalAlertCount > 0 ? 'bg-rose-500/10 text-rose-400' : 'bg-slate-800 text-slate-400'}`}>
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Dispatched Events</p>
            <h3 className="text-3xl font-bold text-emerald-400 mt-1">{webhookLogs.length}</h3>
          </div>
          <div className="p-3 bg-emerald-500/10 text-emerald-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" /></svg>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Monitored Apps</p>
            <h3 className="text-3xl font-bold text-white mt-1">{apps.length}</h3>
          </div>
          <div className="p-3 bg-blue-500/10 text-blue-400 rounded-lg">
            <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2H6a2 2 0 01-2-2v-4zM14 16a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 01-2-2v-4z" /></svg>
          </div>
        </div>
      </section>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Live Micro-App Telemetry */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>
                Live Micro-App Telemetry
              </h2>
              <span className="text-xs text-slate-400 bg-slate-800 px-2.5 py-1 rounded-full">Updates every 3s</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {apps.map((app) => {
                const appThreshold = thresholds[app.id] || { latency: 300, errorRate: 2.0, memory: 512 };
                const isLatencyBreached = app.latency > appThreshold.latency;
                const isErrorBreached = app.errorRate > appThreshold.errorRate;
                const isMemoryBreached = app.memory > appThreshold.memory;
                const isAnyBreached = isLatencyBreached || isErrorBreached || isMemoryBreached;

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedAppId(app.id)}
                    className={`p-4 rounded-xl border transition-all cursor-pointer ${
                      selectedAppId === app.id
                        ? 'bg-slate-800/80 border-emerald-500/50 shadow-lg shadow-emerald-500/5'
                        : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-900/50'
                    }`}
                  >
                    <div className="flex justify-between items-start mb-3">
                      <div>
                        <span className="text-[10px] font-semibold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
                          {app.category}
                        </span>
                        <h4 className="text-sm font-bold text-white mt-1.5 line-clamp-1">{app.name}</h4>
                      </div>
                      {isAnyBreached && (
                        <span className="flex h-2 w-2 relative">
                          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-rose-400 opacity-75"></span>
                          <span className="relative inline-flex rounded-full h-2 w-2 bg-rose-500"></span>
                        </span>
                      )}
                    </div>

                    {/* Metrics Bars */}
                    <div className="space-y-3 mt-4">
                      {/* Latency */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Latency</span>
                          <span className={`font-mono font-medium ${isLatencyBreached ? 'text-rose-400' : 'text-slate-200'}`}>
                            {app.latency}ms <span className="text-slate-500 text-[10px]">/ {appThreshold.latency}ms</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isLatencyBreached ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (app.latency / appThreshold.latency) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Error Rate */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Error Rate</span>
                          <span className={`font-mono font-medium ${isErrorBreached ? 'text-rose-400' : 'text-slate-200'}`}>
                            {app.errorRate}% <span className="text-slate-500 text-[10px]">/ {appThreshold.errorRate}%</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isErrorBreached ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (app.errorRate / appThreshold.errorRate) * 100)}%` }}
                          />
                        </div>
                      </div>

                      {/* Memory */}
                      <div>
                        <div className="flex justify-between text-xs mb-1">
                          <span className="text-slate-400">Memory</span>
                          <span className={`font-mono font-medium ${isMemoryBreached ? 'text-rose-400' : 'text-slate-200'}`}>
                            {app.memory}MB <span className="text-slate-500 text-[10px]">/ {appThreshold.memory}MB</span>
                          </span>
                        </div>
                        <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                          <div
                            className={`h-full rounded-full transition-all duration-500 ${isMemoryBreached ? 'bg-rose-500' : 'bg-emerald-500'}`}
                            style={{ width: `${Math.min(100, (app.memory / appThreshold.memory) * 100)}%` }}
                          />
                        </div>
                      </div>
                    </div>

                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center text-[11px] text-slate-500">
                      <span>ID: {app.id}</span>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          triggerSpike(app.id);
                        }}
                        className="text-rose-400 hover:text-rose-300 font-medium transition-colors"
                      >
                        Force Spike
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Event-Driven Webhook Stream */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                  <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>
                  Event-Driven Webhook Stream
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">Simulated JSON payloads dispatched on <code className="text-emerald-400">thresholdExceeded</code> events.</p>
              </div>
              <button
                onClick={() => setWebhookLogs([])}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear Stream
              </button>
            </div>

            <div className="bg-slate-950 rounded-lg border border-slate-800 p-4 max-h-80 overflow-y-auto font-mono text-xs space-y-3">
              {webhookLogs.length === 0 ? (
                <div className="text-slate-500 text-center py-8">
                  No events dispatched yet. Trigger a spike or wait for simulation breaches to see live JSON payloads.
                </div>
              ) : (
                webhookLogs.map((log) => (
                  <div key={log.payloadId} className="border-b border-slate-900 pb-3 last:border-0 last:pb-0">
                    <div className="flex justify-between text-[10px] text-slate-500 mb-1">
                      <span className="text-emerald-400 font-semibold">EVENT: {log.event}</span>
                      <span>{log.timestamp}</span>
                    </div>
                    <pre className="text-slate-300 bg-slate-900/50 p-2.5 rounded border border-slate-800/50 overflow-x-auto">
                      {JSON.stringify(log, null, 2)}
                    </pre>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>

        {/* Right Column: Controls & Alerts Console */}
        <div className="space-y-6">
          
          {/* Threshold Configuration */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              Threshold Configuration
            </h2>

            <div className="mb-4">
              <label className="block text-xs font-medium text-slate-400 mb-1.5">Select Micro-App</label>
              <select
                value={selectedAppId}
                onChange={(e) => setSelectedAppId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-emerald-500"
              >
                {apps.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Threshold Sliders */}
            <div className="space-y-4 pt-2">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Latency Threshold</span>
                  <span className="text-emerald-400 font-mono font-medium">{thresholds[selectedAppId]?.latency}ms</span>
                </div>
                <input
                  type="range"
                  min="100"
                  max="1000"
                  step="50"
                  value={thresholds[selectedAppId]?.latency || 300}
                  onChange={(e) => handleThresholdChange('latency', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Error Rate Threshold</span>
                  <span className="text-emerald-400 font-mono font-medium">{thresholds[selectedAppId]?.errorRate}%</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="10.0"
                  step="0.5"
                  value={thresholds[selectedAppId]?.errorRate || 2.0}
                  onChange={(e) => handleThresholdChange('errorRate', parseFloat(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Memory Threshold</span>
                  <span className="text-emerald-400 font-mono font-medium">{thresholds[selectedAppId]?.memory}MB</span>
                </div>
                <input
                  type="range"
                  min="128"
                  max="1024"
                  step="64"
                  value={thresholds[selectedAppId]?.memory || 512}
                  onChange={(e) => handleThresholdChange('memory', parseInt(e.target.value))}
                  className="w-full accent-emerald-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Alerts Console Log */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col h-[480px]">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <svg className="w-5 h-5 text-emerald-400" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
                Alerts Console Log
              </h2>
              <button
                onClick={clearAlertHistory}
                className="text-xs text-slate-400 hover:text-white transition-colors"
              >
                Clear Log
              </button>
            </div>

            {/* Filters */}
            <div className="flex gap-2 mb-4">
              <select
                value={filterSeverity}
                onChange={(e: any) => setFilterSeverity(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Severities</option>
                <option value="warning">Warning</option>
                <option value="critical">Critical</option>
              </select>

              <select
                value={filterStatus}
                onChange={(e: any) => setFilterStatus(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none"
              >
                <option value="all">All Statuses</option>
                <option value="active">Active</option>
                <option value="resolved">Resolved</option>
              </select>
            </div>

            {/* Alerts List */}
            <div className="flex-1 overflow-y-auto space-y-3 pr-1">
              {filteredAlerts.length === 0 ? (
                <div className="text-slate-500 text-center py-12 text-sm">
                  No alerts match the current filters.
                </div>
              ) : (
                filteredAlerts.map((alert) => (
                  <div
                    key={alert.id}
                    className={`p-3.5 rounded-lg border transition-all ${
                      alert.status === 'resolved'
                        ? 'bg-slate-950/40 border-slate-800/60 opacity-60'
                        : alert.severity === 'critical'
                        ? 'bg-rose-500/5 border-rose-500/30'
                        : 'bg-amber-500/5 border-amber-500/30'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[9px] font-bold uppercase tracking-wider px-1.5 py-0.5 rounded ${
                              alert.status === 'resolved'
                                ? 'bg-slate-800 text-slate-400'
                                : alert.severity === 'critical'
                                ? 'bg-rose-500/20 text-rose-400'
                                : 'bg-amber-500/20 text-amber-400'
                            }`}
                          >
                            {alert.severity}
                          </span>
                          <span className="text-xs font-bold text-white line-clamp-1">{alert.appName}</span>
                        </div>
                        <p className="text-xs text-slate-300 mt-1.5">
                          Threshold exceeded: <span className="font-semibold text-white">{alert.metric}</span> reached{' '}
                          <span className="font-semibold text-rose-400">
                            {alert.value}
                            {alert.metric === 'latency' ? 'ms' : alert.metric === 'errorRate' ? '%' : 'MB'}
                          </span>{' '}
                          (limit: {alert.threshold}
                          {alert.metric === 'latency' ? 'ms' : alert.metric === 'errorRate' ? '%' : 'MB'})
                        </p>
                        <p className="text-[10px] text-slate-500 mt-1">
                          {new Date(alert.timestamp).toLocaleTimeString()}
                          {alert.resolvedAt && ` • Resolved at ${new Date(alert.resolvedAt).toLocaleTimeString()}`}
                        </p>
                      </div>

                      {alert.status === 'active' && (
                        <button
                          onClick={() => resolveAlert(alert.id)}
                          className="text-[10px] font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 px-2 py-1 rounded transition-colors shrink-0"
                        >
                          Resolve
                        </button>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}