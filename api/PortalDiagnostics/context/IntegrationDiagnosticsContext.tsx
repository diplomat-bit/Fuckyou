import React, { createContext, useContext, useState, useCallback, ReactNode, useRef, useMemo } from 'react';
import { IntegrationDiagnostics } from '../services/IntegrationDiagnostics';
import { DiagnosticReport } from '../types/DiagnosticReport';
import { DiagnosticConfig } from '../config/DiagnosticConfig';

export type DiagnosticReportType = DiagnosticReport;

interface IntegrationDiagnosticsContextType {
  report: DiagnosticReportType | null;
  history: DiagnosticReportType[];
  loading: boolean;
  error: string | null;
  runDiagnostics: (target?: string, useRemoteApi?: boolean) => Promise<void>;
  updateConfig: (newConfig: Partial<DiagnosticConfig>) => Promise<void>;
  config: DiagnosticConfig;
  clearHistory: () => void;
  exportReport: (report: DiagnosticReportType) => void;
  cancelDiagnostics: () => void;
}

const IntegrationDiagnosticsContext = createContext<IntegrationDiagnosticsContextType | undefined>(undefined);

export const IntegrationDiagnosticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [report, setReport] = useState<DiagnosticReportType | null>(null);
  const [history, setHistory] = useState<DiagnosticReportType[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [config, setConfig] = useState<DiagnosticConfig>({
    timeout: 5000,
    retries: 3,
    retryAttempts: 3,
    verbose: false
  } as unknown as DiagnosticConfig);

  const abortControllerRef = useRef<AbortController | null>(null);
  const service = useMemo(() => new IntegrationDiagnostics(config as any), [config]);

  const runDiagnostics = useCallback(async (target: string = 'default', useRemoteApi: boolean = false) => {
    // Cancel any ongoing diagnostic run
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }

    abortControllerRef.current = new AbortController();
    setLoading(true);
    setError(null);

    try {
      let result: DiagnosticReportType;

      if (useRemoteApi) {
        // Call the integrated API route
        const response = await fetch('/api/portal-diagnostics/integration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({ target, config }),
          signal: abortControllerRef.current.signal,
        });

        if (!response.ok) {
          throw new Error(`API Error: ${response.statusText} (${response.status})`);
        }

        result = await response.json();
      } else {
        // Fallback to local execution service
        result = await service.execute();
      }

      setReport(result);
      setHistory((prev) => [result, ...prev].slice(0, 50)); // Keep last 50 runs
    } catch (err: any) {
      if (err.name === 'AbortError') {
        setError('Diagnostics run was cancelled.');
      } else {
        setError(err instanceof Error ? err.message : 'An unknown diagnostic error occurred');
      }
    } finally {
      setLoading(false);
      abortControllerRef.current = null;
    }
  }, [config, service]);

  const updateConfig = useCallback(async (newConfig: Partial<DiagnosticConfig>) => {
    const updated = { ...config, ...newConfig };
    setConfig(updated);

    try {
      // Sync configuration with the remote API route
      await fetch('/api/portal-diagnostics/config', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(updated),
      });
    } catch (err) {
      console.warn('Failed to sync diagnostic config with remote API:', err);
    }
  }, [config]);

  const cancelDiagnostics = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
    }
  }, []);

  const clearHistory = useCallback(() => {
    setHistory([]);
    setReport(null);
  }, []);

  const exportReport = useCallback((reportToExport: DiagnosticReportType) => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(reportToExport, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      const reportId = (reportToExport as any).id || (reportToExport as any).reportId || Date.now();
      downloadAnchor.setAttribute("download", `diagnostic_report_${reportId}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
    } catch (err) {
      console.error('Failed to export diagnostic report:', err);
    }
  }, []);

  return (
    <IntegrationDiagnosticsContext.Provider 
      value={{ 
        report, 
        history,
        loading, 
        error, 
        runDiagnostics, 
        updateConfig, 
        config,
        clearHistory,
        exportReport,
        cancelDiagnostics
      }}
    >
      {children}
    </IntegrationDiagnosticsContext.Provider>
  );
};

export const useIntegrationDiagnostics = () => {
  const context = useContext(IntegrationDiagnosticsContext);
  if (!context) {
    throw new Error('useIntegrationDiagnostics must be used within an IntegrationDiagnosticsProvider');
  }
  return context;
};