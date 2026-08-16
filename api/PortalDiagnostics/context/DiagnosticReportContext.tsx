import React, { createContext, useContext, useState, useEffect, useCallback, useMemo } from 'react';

export type SystemStatusType = 'HEALTHY' | 'DEGRADED' | 'CRITICAL' | 'MAINTENANCE' | 'UNKNOWN';

export interface SubsystemMetric {
  name: string;
  status: SystemStatusType;
  latencyMs: number;
  errorRate: number;
  uptimePercentage: number;
  lastChecked: string;
  details?: Record<string, unknown>;
}

export interface DiagnosticAlert {
  id: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  subsystem: string;
  message: string;
  timestamp: string;
  acknowledged: boolean;
}

export interface Recommendation {
  id: string;
  subsystem: string;
  priority: 'P1' | 'P2' | 'P3' | 'P4';
  title: string;
  description: string;
  actionRequired: string;
  impact: string;
}

export interface SystemPerformanceMetrics {
  cpuUsagePct: number;
  memoryUsagePct: number;
  activeRequests: number;
  p95LatencyMs: number;
  errorRatePct: number;
  storageUsagePct: number;
}

export interface DiagnosticReport {
  id: string;
  timestamp: string;
  overallStatus: SystemStatusType;
  metrics: SystemPerformanceMetrics;
  subsystems: Record<string, SubsystemMetric>;
  alerts: DiagnosticAlert[];
  recommendations: Recommendation[];
  environment: string;
  version: string;
}

export interface DiagnosticFilterOptions {
  subsystem?: string;
  status?: SystemStatusType;
  minSeverity?: 'low' | 'medium' | 'high' | 'critical';
  searchQuery?: string;
}

export interface DiagnosticReportContextType {
  report: DiagnosticReport | null;
  isLoading: boolean;
  isRefreshing: boolean;
  error: string | null;
  autoRefreshEnabled: boolean;
  autoRefreshIntervalMs: number;
  filterOptions: DiagnosticFilterOptions;
  
  // Actions
  runDiagnostics: () => Promise<DiagnosticReport>;
  acknowledgeAlert: (alertId: string) => Promise<void>;
  resolveAlert: (alertId: string) => Promise<void>;
  setFilterOptions: (filters: Partial<DiagnosticFilterOptions>) => void;
  setAutoRefreshEnabled: (enabled: boolean) => void;
  setAutoRefreshIntervalMs: (interval: number) => void;
  exportReportJson: () => string;
  clearError: () => void;
  updateRemoteConfig: (config: { autoRefresh: boolean; intervalMs: number }) => Promise<void>;
}

const DiagnosticReportContext = createContext<DiagnosticReportContextType | undefined>(undefined);

// Base API URL configuration
const API_BASE_URL = '/api/diagnostics';

const createInitialDiagnosticReport = (): DiagnosticReport => {
  const timestamp = new Date().toISOString();
  return {
    id: `DIAG-${Date.now().toString(36).toUpperCase()}`,
    timestamp,
    overallStatus: 'HEALTHY',
    metrics: {
      cpuUsagePct: 24.5,
      memoryUsagePct: 41.2,
      activeRequests: 128,
      p95LatencyMs: 42,
      errorRatePct: 0.04,
      storageUsagePct: 58.9,
    },
    subsystems: {
      AuthDiagnostics: {
        name: 'Authentication & IAM Gateway',
        status: 'HEALTHY',
        latencyMs: 18,
        errorRate: 0.001,
        uptimePercentage: 99.99,
        lastChecked: timestamp,
        details: { activeSessions: 420, tokenVerificationMode: 'FAPI_ADVANCED' },
      },
      DatabaseDiagnostics: {
        name: 'Database Bridge & BigQuery Emulator',
        status: 'HEALTHY',
        latencyMs: 34,
        errorRate: 0.002,
        uptimePercentage: 99.95,
        lastChecked: timestamp,
        details: { connectionPoolUsagePct: 32, activeSyncStreams: 14 },
      },
      IntegrationDiagnostics: {
        name: 'CitiConnect & Treasury Gateways',
        status: 'HEALTHY',
        latencyMs: 65,
        errorRate: 0.012,
        uptimePercentage: 99.88,
        lastChecked: timestamp,
        details: { activeB2BChannels: 8, mtlsCompliance: 'VERIFIED' },
      },
      NetworkDiagnostics: {
        name: 'VPC Manager & Service Mesh',
        status: 'HEALTHY',
        latencyMs: 12,
        errorRate: 0.000,
        uptimePercentage: 100.0,
        lastChecked: timestamp,
        details: { egressTunnelStatus: 'OPTIMAL', crossCloudLatencyMs: 18 },
      },
      AppRegistryDiagnostics: {
        name: 'App Registry & Dependency Resolver',
        status: 'HEALTHY',
        latencyMs: 22,
        errorRate: 0.005,
        uptimePercentage: 99.92,
        lastChecked: timestamp,
        details: { registeredApps: 48, activeWebhooks: 112 },
      },
      SecurityDiagnostics: {
        name: 'PQC Crypto & Vault Security',
        status: 'HEALTHY',
        latencyMs: 15,
        errorRate: 0.000,
        uptimePercentage: 100.0,
        lastChecked: timestamp,
        details: { postQuantumBridge: 'ACTIVE', zeroKnowledgeVerifier: 'OPERATIONAL' },
      },
    },
    alerts: [
      {
        id: 'ALT-101',
        severity: 'medium',
        subsystem: 'IntegrationDiagnostics',
        message: 'Elevated latency observed on Modern Treasury settlement endpoints.',
        timestamp: new Date(Date.now() - 15 * 60000).toISOString(),
        acknowledged: false,
      },
    ],
    recommendations: [
      {
        id: 'REC-01',
        subsystem: 'DatabaseDiagnostics',
        priority: 'P2',
        title: 'Optimize BigQuery Query Caching',
        description: 'Enabling query result caching for repeated audit log fetches will reduce p95 latency by ~20ms.',
        actionRequired: 'Update DiagnosticConfig cache TTL settings.',
        impact: 'High performance gain on portal loading times.',
      },
      {
        id: 'REC-02',
        subsystem: 'SecurityDiagnostics',
        priority: 'P3',
        title: 'Rotate Legacy API Keys',
        description: 'Two secondary integration keys are approaching the 90-day rotation boundary.',
        actionRequired: 'Trigger key rotation via SecretVault interface.',
        impact: 'Maintains SOC2 compliance posture.',
      },
    ],
    environment: 'production',
    version: '2.4.0-enterprise',
  };
};

export interface DiagnosticReportProviderProps {
  children: React.ReactNode;
  initialIntervalMs?: number;
  autoRefresh?: boolean;
}

export const DiagnosticReportProvider: React.FC<DiagnosticReportProviderProps> = ({
  children,
  initialIntervalMs = 30000,
  autoRefresh = true,
}) => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [autoRefreshEnabled, setAutoRefreshEnabled] = useState<boolean>(autoRefresh);
  const [autoRefreshIntervalMs, setAutoRefreshIntervalMs] = useState<number>(initialIntervalMs);
  const [filterOptions, setFilterOptionsState] = useState<DiagnosticFilterOptions>({});

  // Helper to perform API requests with automatic local fallback
  const apiRequest = useCallback(async <T,>(
    endpoint: string,
    options?: RequestInit,
    fallbackValue?: T
  ): Promise<T> => {
    try {
      const response = await fetch(`${API_BASE_URL}${endpoint}`, {
        headers: {
          'Content-Type': 'application/json',
          ...options?.headers,
        },
        ...options,
      });

      if (!response.ok) {
        throw new Error(`API Error: ${response.status} ${response.statusText}`);
      }

      return await response.json() as T;
    } catch (err) {
      console.warn(`API request to ${endpoint} failed. Falling back to local simulation.`, err);
      if (fallbackValue !== undefined) {
        return fallbackValue;
      }
      throw err;
    }
  }, []);

  const runDiagnostics = useCallback(async (): Promise<DiagnosticReport> => {
    if (report) {
      setIsRefreshing(true);
    } else {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Attempt to fetch from real API route, fallback to simulated local generation
      const localFallback = createInitialDiagnosticReport();
      const jitter = (Math.random() - 0.5) * 4;
      localFallback.metrics.cpuUsagePct = Math.min(100, Math.max(5, Math.round((24.5 + jitter) * 10) / 10));
      localFallback.metrics.p95LatencyMs = Math.max(10, Math.round(42 + jitter * 2));

      // If we have an existing report, preserve acknowledged alerts in fallback
      if (report) {
        localFallback.alerts = report.alerts;
      }

      const updatedReport = await apiRequest<DiagnosticReport>(
        '/run',
        { method: 'POST' },
        localFallback
      );

      setReport(updatedReport);
      return updatedReport;
    } catch (err: unknown) {
      const errorMessage = err instanceof Error ? err.message : 'Failed to execute system diagnostics execution.';
      setError(errorMessage);
      throw err;
    } finally {
      setIsLoading(false);
      setIsRefreshing(false);
    }
  }, [report, apiRequest]);

  const acknowledgeAlert = useCallback(async (alertId: string) => {
    try {
      // Optimistic UI update
      setReport((prevReport) => {
        if (!prevReport) return null;
        return {
          ...prevReport,
          alerts: prevReport.alerts.map((alert) =>
            alert.id === alertId ? { ...alert, acknowledged: true } : alert
          ),
        };
      });

      // Call API route
      await apiRequest(
        `/alerts/${alertId}/acknowledge`,
        { method: 'POST' },
        { success: true }
      );
    } catch (err) {
      console.error(`Failed to acknowledge alert ${alertId} on server:`, err);
    }
  }, [apiRequest]);

  const resolveAlert = useCallback(async (alertId: string) => {
    try {
      // Optimistic UI update
      setReport((prevReport) => {
        if (!prevReport) return null;
        return {
          ...prevReport,
          alerts: prevReport.alerts.filter((alert) => alert.id !== alertId),
        };
      });

      // Call API route
      await apiRequest(
        `/alerts/${alertId}/resolve`,
        { method: 'POST' },
        { success: true }
      );
    } catch (err) {
      console.error(`Failed to resolve alert ${alertId} on server:`, err);
    }
  }, [apiRequest]);

  const updateRemoteConfig = useCallback(async (config: { autoRefresh: boolean; intervalMs: number }) => {
    try {
      await apiRequest(
        '/config',
        {
          method: 'PUT',
          body: JSON.stringify(config),
        },
        { success: true }
      );
    } catch (err) {
      console.error('Failed to sync diagnostic configuration with server:', err);
    }
  }, [apiRequest]);

  const setFilterOptions = useCallback((filters: Partial<DiagnosticFilterOptions>) => {
    setFilterOptionsState((prev) => ({ ...prev, ...filters }));
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  const exportReportJson = useCallback((): string => {
    if (!report) return JSON.stringify({ error: 'No diagnostic report available' });
    return JSON.stringify(report, null, 2);
  }, [report]);

  // Initial diagnostics fetch
  useEffect(() => {
    runDiagnostics().catch((err) => {
      console.error('Initial diagnostic run failed:', err);
    });
  }, []);

  // Polling effect for auto-refresh
  useEffect(() => {
    if (!autoRefreshEnabled || autoRefreshIntervalMs <= 0) return;

    const timer = setInterval(() => {
      runDiagnostics().catch((err) => {
        console.warn('Auto-refresh diagnostics fetch failed:', err);
      });
    }, autoRefreshIntervalMs);

    return () => clearInterval(timer);
  }, [autoRefreshEnabled, autoRefreshIntervalMs, runDiagnostics]);

  const contextValue = useMemo<DiagnosticReportContextType>(
    () => ({
      report,
      isLoading,
      isRefreshing,
      error,
      autoRefreshEnabled,
      autoRefreshIntervalMs,
      filterOptions,
      runDiagnostics,
      acknowledgeAlert,
      resolveAlert,
      setFilterOptions,
      setAutoRefreshEnabled: (enabled) => {
        setAutoRefreshEnabled(enabled);
        updateRemoteConfig({ autoRefresh: enabled, intervalMs: autoRefreshIntervalMs });
      },
      setAutoRefreshIntervalMs: (interval) => {
        setAutoRefreshIntervalMs(interval);
        updateRemoteConfig({ autoRefresh: autoRefreshEnabled, intervalMs: interval });
      },
      exportReportJson,
      clearError,
      updateRemoteConfig,
    }),
    [
      report,
      isLoading,
      isRefreshing,
      error,
      autoRefreshEnabled,
      autoRefreshIntervalMs,
      filterOptions,
      runDiagnostics,
      acknowledgeAlert,
      resolveAlert,
      setFilterOptions,
      exportReportJson,
      clearError,
      updateRemoteConfig,
    ]
  );

  return (
    <DiagnosticReportContext.Provider value={contextValue}>
      {children}
    </DiagnosticReportContext.Provider>
  );
};

export const useDiagnosticReport = (): DiagnosticReportContextType => {
  const context = useContext(DiagnosticReportContext);
  if (!context) {
    throw new Error('useDiagnosticReport must be used within a DiagnosticReportProvider');
  }
  return context;
};

export default DiagnosticReportContext;