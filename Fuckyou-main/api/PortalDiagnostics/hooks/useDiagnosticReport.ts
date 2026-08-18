import { useState, useEffect, useCallback, useRef } from 'react';
import { DiagnosticReport } from '../types/DiagnosticReport';
import { SystemStatus } from '../types/SystemStatus';
import { OperationalStatus } from '../types/OperationalStatus';

// Extended types for enhanced features
export interface DiagnosticConfig {
  enableCpuScan: boolean;
  enableMemoryScan: boolean;
  enableNetworkScan: boolean;
  enableDatabaseScan: boolean;
  scanIntervalMs: number;
  alertThreshold: 'low' | 'medium' | 'high' | 'critical';
}

interface UseDiagnosticReportResult {
  report: DiagnosticReport | null;
  history: DiagnosticReport[];
  loading: boolean;
  error: Error | null;
  isPolling: boolean;
  refetch: () => Promise<void>;
  triggerDiagnosticRun: (options?: Partial<DiagnosticConfig>) => Promise<DiagnosticReport>;
  updateDiagnosticConfig: (config: Partial<DiagnosticConfig>) => Promise<DiagnosticConfig>;
  clearDiagnosticHistory: () => Promise<void>;
  pausePolling: () => void;
  resumePolling: () => void;
}

/**
 * Client-side React Hook for managing, fetching, and orchestrating Portal Diagnostics.
 * Features built-in polling, history tracking, manual triggers, configuration updates,
 * and robust error recovery.
 */
export const useDiagnosticReport = (
  pollInterval: number = 5000,
  maxHistoryLength: number = 20
): UseDiagnosticReportResult => {
  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [history, setHistory] = useState<DiagnosticReport[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<Error | null>(null);
  const [isPolling, setIsPolling] = useState<boolean>(true);

  const pollIntervalRef = useRef<number>(pollInterval);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync poll interval ref
  useEffect(() => {
    pollIntervalRef.current = pollInterval;
  }, [pollInterval]);

  // Fetch current diagnostic report
  const fetchReport = useCallback(async () => {
    try {
      const response = await fetch('/api/diagnostics/report', {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
          'X-Diagnostic-Source': 'PortalDiagnostics-Client',
          'X-Requested-With': 'XMLHttpRequest'
        }
      });

      if (!response.ok) {
        throw new Error(`Diagnostic fetch failed: ${response.statusText} (${response.status})`);
      }

      const data: DiagnosticReport = await response.json();
      
      setReport(data);
      setHistory((prev) => {
        const updated = [data, ...prev];
        return updated.slice(0, maxHistoryLength);
      });
      setError(null);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Unknown diagnostic error'));
    } finally {
      setLoading(false);
    }
  }, [maxHistoryLength]);

  // Trigger an active diagnostic run
  const triggerDiagnosticRun = useCallback(async (options?: Partial<DiagnosticConfig>): Promise<DiagnosticReport> => {
    setLoading(true);
    try {
      const response = await fetch('/api/diagnostics/trigger', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'X-Diagnostic-Source': 'PortalDiagnostics-Client'
        },
        body: JSON.stringify(options || {})
      });

      if (!response.ok) {
        throw new Error(`Failed to trigger diagnostic run: ${response.statusText}`);
      }

      const data: DiagnosticReport = await response.json();
      setReport(data);
      setHistory((prev) => [data, ...prev].slice(0, maxHistoryLength));
      setError(null);
      return data;
    } catch (err) {
      const errorObj = err instanceof Error ? err : new Error('Failed to trigger diagnostic run');
      setError(errorObj);
      throw errorObj;
    } finally {
      setLoading(false);
    }
  }, [maxHistoryLength]);

  // Update diagnostic configuration
  const updateDiagnosticConfig = useCallback(async (config: Partial<DiagnosticConfig>): Promise<DiagnosticConfig> => {
    try {
      const response = await fetch('/api/diagnostics/config', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'X-Diagnostic-Source': 'PortalDiagnostics-Client'
        },
        body: JSON.stringify(config)
      });

      if (!response.ok) {
        throw new Error(`Failed to update diagnostic configuration: ${response.statusText}`);
      }

      return await response.json();
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to update diagnostic configuration');
    }
  }, []);

  // Clear diagnostic history
  const clearDiagnosticHistory = useCallback(async (): Promise<void> => {
    try {
      const response = await fetch('/api/diagnostics/history', {
        method: 'DELETE',
        headers: {
          'X-Diagnostic-Source': 'PortalDiagnostics-Client'
        }
      });

      if (!response.ok) {
        throw new Error(`Failed to clear diagnostic history: ${response.statusText}`);
      }

      setHistory([]);
    } catch (err) {
      throw err instanceof Error ? err : new Error('Failed to clear diagnostic history');
    }
  }, []);

  const pausePolling = useCallback(() => {
    setIsPolling(false);
  }, []);

  const resumePolling = useCallback(() => {
    setIsPolling(true);
  }, []);

  // Polling management effect
  useEffect(() => {
    fetchReport();

    if (isPolling) {
      timerRef.current = setInterval(fetchReport, pollIntervalRef.current);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [fetchReport, isPolling]);

  return {
    report,
    history,
    loading,
    error,
    isPolling,
    refetch: fetchReport,
    triggerDiagnosticRun,
    updateDiagnosticConfig,
    clearDiagnosticHistory,
    pausePolling,
    resumePolling
  };
};

// ============================================================================
// BACKEND API ROUTE HANDLERS (Next.js / Node.js compatible)
// ============================================================================

// In-memory store for mock/serverless execution
let currentConfig: DiagnosticConfig = {
  enableCpuScan: true,
  enableMemoryScan: true,
  enableNetworkScan: true,
  enableDatabaseScan: true,
  scanIntervalMs: 5000,
  alertThreshold: 'medium'
};

let diagnosticHistory: DiagnosticReport[] = [];

/**
 * Generates a mock diagnostic report based on current configuration and system state.
 */
export function generateDiagnosticReport(config: DiagnosticConfig): DiagnosticReport {
  const timestamp = new Date().toISOString();
  const cpuUsage = config.enableCpuScan ? Math.floor(Math.random() * 40) + 20 : 0;
  const memoryUsage = config.enableMemoryScan ? Math.floor(Math.random() * 30) + 50 : 0;
  const latency = config.enableNetworkScan ? Math.floor(Math.random() * 120) + 10 : 0;
  const dbStatus = config.enableDatabaseScan ? 'connected' : 'disabled';

  const status: SystemStatus = {
    status: (cpuUsage > 85 || memoryUsage > 90 ? 'critical' : cpuUsage > 70 || memoryUsage > 80 ? 'warning' : 'healthy') as OperationalStatus,
    details: {
      cpu: `${cpuUsage}%`,
      memory: `${memoryUsage}%`,
      database: dbStatus,
      networkLatency: `${latency}ms`
    }
  };

  return {
    reportId: `diag_${Math.random().toString(36).substr(2, 9)}`,
    timestamp,
    status,
    metrics: {
      cpuUsage,
      memoryUsage,
      latency,
      activeConnections: Math.floor(Math.random() * 500) + 50,
      errorRate: Math.random() * 0.05
    },
    checks: [
      { name: 'CPU Load Check', status: cpuUsage > 80 ? 'fail' : 'pass', message: `CPU is at ${cpuUsage}%` },
      { name: 'Memory Allocation', status: memoryUsage > 85 ? 'fail' : 'pass', message: `Memory is at ${memoryUsage}%` },
      { name: 'Database Connection Pool', status: dbStatus === 'connected' ? 'pass' : 'fail', message: `Database status: ${dbStatus}` },
      { name: 'Network Gateway Latency', status: latency > 100 ? 'warn' : 'pass', message: `Latency is ${latency}ms` }
    ]
  };
}

/**
 * Unified API Router for Portal Diagnostics.
 * Can be integrated directly into Next.js API routes or Express middleware.
 */
export async function handleDiagnosticApiRequest(req: { method: string; url: string; body?: any }) {
  const url = new URL(req.url, 'http://localhost');
  const pathname = url.pathname;

  // GET /api/diagnostics/report
  if (pathname === '/api/diagnostics/report' && req.method === 'GET') {
    const report = generateDiagnosticReport(currentConfig);
    diagnosticHistory.unshift(report);
    if (diagnosticHistory.length > 50) diagnosticHistory.pop();
    return { status: 200, data: report };
  }

  // POST /api/diagnostics/trigger
  if (pathname === '/api/diagnostics/trigger' && req.method === 'POST') {
    const customConfig = { ...currentConfig, ...(req.body || {}) };
    const report = generateDiagnosticReport(customConfig);
    diagnosticHistory.unshift(report);
    return { status: 200, data: report };
  }

  // PUT /api/diagnostics/config
  if (pathname === '/api/diagnostics/config' && req.method === 'PUT') {
    currentConfig = { ...currentConfig, ...(req.body || {}) };
    return { status: 200, data: currentConfig };
  }

  // GET /api/diagnostics/config
  if (pathname === '/api/diagnostics/config' && req.method === 'GET') {
    return { status: 200, data: currentConfig };
  }

  // DELETE /api/diagnostics/history
  if (pathname === '/api/diagnostics/history' && req.method === 'DELETE') {
    diagnosticHistory = [];
    return { status: 200, data: { message: 'Diagnostic history cleared successfully' } };
  }

  // GET /api/diagnostics/history
  if (pathname === '/api/diagnostics/history' && req.method === 'GET') {
    return { status: 200, data: diagnosticHistory };
  }

  return { status: 404, data: { error: 'Diagnostic route not found' } };
}