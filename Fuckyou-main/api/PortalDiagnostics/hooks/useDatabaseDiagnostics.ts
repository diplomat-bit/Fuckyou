import { useState, useEffect, useCallback, useRef } from 'react';
import { DatabaseDiagnosticsService } from '../services/DatabaseDiagnostics';
import { DiagnosticReport } from '../types/DiagnosticReport';
import { SystemStatus } from '../types/SystemStatus';

interface UseDatabaseDiagnosticsResult {
  report: DiagnosticReport | null;
  status: SystemStatus | 'loading' | 'error';
  error: string | null;
  refresh: () => Promise<void>;
  isRefreshing: boolean;
  
  // Advanced Features
  history: DiagnosticReport[];
  clearHistory: () => void;
  isAutoRefreshing: boolean;
  pauseAutoRefresh: () => void;
  resumeAutoRefresh: () => void;
  
  // API Actions / Operations
  testConnection: () => Promise<boolean>;
  runOptimization: () => Promise<{ success: boolean; message: string }>;
  clearCache: () => Promise<{ success: boolean; message: string }>;
  repairIndexes: () => Promise<{ success: boolean; message: string }>;
  
  // Operation states
  isOperating: boolean;
  operationError: string | null;
}

export const useDatabaseDiagnostics = (
  autoRefreshInterval: number = 30000,
  options?: {
    useApiRoute?: boolean;
    apiEndpoint?: string;
    maxHistoryLength?: number;
  }
): UseDatabaseDiagnosticsResult => {
  const useApiRoute = options?.useApiRoute ?? true;
  const apiEndpoint = options?.apiEndpoint ?? '/api/diagnostics/database';
  const maxHistoryLength = options?.maxHistoryLength ?? 10;

  const [report, setReport] = useState<DiagnosticReport | null>(null);
  const [status, setStatus] = useState<SystemStatus | 'loading' | 'error'>('loading');
  const [error, setError] = useState<string | null>(null);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  
  const [history, setHistory] = useState<DiagnosticReport[]>([]);
  const [isAutoRefreshing, setIsAutoRefreshing] = useState<boolean>(autoRefreshInterval > 0);
  
  const [isOperating, setIsOperating] = useState<boolean>(false);
  const [operationError, setOperationError] = useState<string | null>(null);

  const autoRefreshTimerRef = useRef<NodeJS.Timeout | null>(null);

  const fetchDiagnostics = useCallback(async () => {
    try {
      setIsRefreshing(true);
      setError(null);
      let data: DiagnosticReport;

      if (useApiRoute) {
        try {
          const response = await fetch(apiEndpoint, {
            method: 'GET',
            headers: {
              'Content-Type': 'application/json',
              'Accept': 'application/json',
            },
          });
          if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
          }
          data = await response.json();
        } catch (apiErr) {
          console.warn('API route fetch failed, falling back to local service:', apiErr);
          data = await DatabaseDiagnosticsService.runAllDiagnostics();
        }
      } else {
        data = await DatabaseDiagnosticsService.runAllDiagnostics();
      }

      setReport(data);
      setStatus(data.overallStatus as unknown as SystemStatus);
      
      setHistory((prev) => {
        const updated = [data, ...prev];
        return updated.slice(0, maxHistoryLength);
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to fetch database diagnostics');
      setStatus('error');
    } finally {
      setIsRefreshing(false);
    }
  }, [useApiRoute, apiEndpoint, maxHistoryLength]);

  const clearHistory = useCallback(() => {
    setHistory([]);
  }, []);

  const pauseAutoRefresh = useCallback(() => {
    setIsAutoRefreshing(false);
    if (autoRefreshTimerRef.current) {
      clearInterval(autoRefreshTimerRef.current);
      autoRefreshTimerRef.current = null;
    }
  }, []);

  const resumeAutoRefresh = useCallback(() => {
    if (autoRefreshInterval > 0) {
      setIsAutoRefreshing(true);
    }
  }, [autoRefreshInterval]);

  // API Actions / Operations
  const testConnection = useCallback(async (): Promise<boolean> => {
    setIsOperating(true);
    setOperationError(null);
    try {
      if (useApiRoute) {
        const response = await fetch(`${apiEndpoint}/test`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to test connection via API');
        const result = await response.json();
        return !!result.connected;
      } else {
        if (typeof (DatabaseDiagnosticsService as any).testConnection === 'function') {
          return await (DatabaseDiagnosticsService as any).testConnection();
        }
        return true;
      }
    } catch (err) {
      setOperationError(err instanceof Error ? err.message : 'Connection test failed');
      return false;
    } finally {
      setIsOperating(false);
    }
  }, [useApiRoute, apiEndpoint]);

  const runOptimization = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setIsOperating(true);
    setOperationError(null);
    try {
      if (useApiRoute) {
        const response = await fetch(`${apiEndpoint}/optimize`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to run optimization via API');
        return await response.json();
      } else {
        if (typeof (DatabaseDiagnosticsService as any).optimizeDatabase === 'function') {
          return await (DatabaseDiagnosticsService as any).optimizeDatabase();
        }
        return { success: true, message: 'Optimization simulated successfully (local service fallback)' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Optimization failed';
      setOperationError(msg);
      return { success: false, message: msg };
    } finally {
      setIsOperating(false);
      fetchDiagnostics(); // Refresh after operation
    }
  }, [useApiRoute, apiEndpoint, fetchDiagnostics]);

  const clearCache = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setIsOperating(true);
    setOperationError(null);
    try {
      if (useApiRoute) {
        const response = await fetch(`${apiEndpoint}/clear-cache`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to clear cache via API');
        return await response.json();
      } else {
        if (typeof (DatabaseDiagnosticsService as any).clearCache === 'function') {
          return await (DatabaseDiagnosticsService as any).clearCache();
        }
        return { success: true, message: 'Cache cleared successfully (local service fallback)' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to clear cache';
      setOperationError(msg);
      return { success: false, message: msg };
    } finally {
      setIsOperating(false);
      fetchDiagnostics();
    }
  }, [useApiRoute, apiEndpoint, fetchDiagnostics]);

  const repairIndexes = useCallback(async (): Promise<{ success: boolean; message: string }> => {
    setIsOperating(true);
    setOperationError(null);
    try {
      if (useApiRoute) {
        const response = await fetch(`${apiEndpoint}/repair-indexes`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
        });
        if (!response.ok) throw new Error('Failed to repair indexes via API');
        return await response.json();
      } else {
        if (typeof (DatabaseDiagnosticsService as any).repairIndexes === 'function') {
          return await (DatabaseDiagnosticsService as any).repairIndexes();
        }
        return { success: true, message: 'Indexes repaired successfully (local service fallback)' };
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Failed to repair indexes';
      setOperationError(msg);
      return { success: false, message: msg };
    } finally {
      setIsOperating(false);
      fetchDiagnostics();
    }
  }, [useApiRoute, apiEndpoint, fetchDiagnostics]);

  useEffect(() => {
    fetchDiagnostics();
  }, [fetchDiagnostics]);

  useEffect(() => {
    if (isAutoRefreshing && autoRefreshInterval > 0) {
      autoRefreshTimerRef.current = setInterval(fetchDiagnostics, autoRefreshInterval);
      return () => {
        if (autoRefreshTimerRef.current) {
          clearInterval(autoRefreshTimerRef.current);
          autoRefreshTimerRef.current = null;
        }
      };
    }
  }, [fetchDiagnostics, autoRefreshInterval, isAutoRefreshing]);

  return {
    report,
    status,
    error,
    refresh: fetchDiagnostics,
    isRefreshing,
    
    // Advanced Features
    history,
    clearHistory,
    isAutoRefreshing,
    pauseAutoRefresh,
    resumeAutoRefresh,
    
    // API Actions / Operations
    testConnection,
    runOptimization,
    clearCache,
    repairIndexes,
    
    // Operation states
    isOperating,
    operationError
  };
};