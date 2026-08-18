import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import { DiagnosticReport } from '../types/DiagnosticReport';
import { SystemStatus, OperationalStatus, SubsystemStatus } from '../types/SystemStatus';
import { DatabaseDiagnosticsService } from '../services/DatabaseDiagnostics';

interface DatabaseDiagnosticContextType {
  reports: DiagnosticReport[];
  systemStatus: SubsystemStatus;
  isLoading: boolean;
  error: string | null;
  addReport: (report: DiagnosticReport) => void;
  updateSystemStatus: (status: SubsystemStatus) => void;
  clearReports: () => void;
  runDiagnosticCheck: () => Promise<void>;
}

const DatabaseDiagnosticContext = createContext<DatabaseDiagnosticContextType | undefined>(undefined);

export const DatabaseDiagnosticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [reports, setReports] = useState<DiagnosticReport[]>([]);
  const [systemStatus, setSystemStatus] = useState<SubsystemStatus>({
    status: OperationalStatus.UNKNOWN,
    latency: 0
  });
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const addReport = useCallback((report: DiagnosticReport) => {
    setReports((prev) => [report, ...prev].slice(0, 50));
  }, []);

  const updateSystemStatus = useCallback((status: SubsystemStatus) => {
    setSystemStatus(status);
  }, []);

  const clearReports = useCallback(() => {
    setReports([]);
  }, []);

  const runDiagnosticCheck = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await fetch('/api/diagnostics/database/check');
      if (!response.ok) throw new Error('Failed to run database diagnostic');
      const data = await response.json();
      
      addReport(data.report);
      updateSystemStatus(data.status);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [addReport, updateSystemStatus]);

  useEffect(() => {
    const fetchInitialStatus = async () => {
      try {
        const status = await new DatabaseDiagnosticsService().runDiagnostics();
        updateSystemStatus(status);
      } catch (err) {
        console.error('Failed to fetch initial status', err);
      }
    };
    fetchInitialStatus();
  }, [updateSystemStatus]);

  return (
    <DatabaseDiagnosticContext.Provider
      value={{
        reports,
        systemStatus,
        isLoading,
        error,
        addReport,
        updateSystemStatus,
        clearReports,
        runDiagnosticCheck
      }}
    >
      {children}
    </DatabaseDiagnosticContext.Provider>
  );
};

export const useDatabaseDiagnostic = (): DatabaseDiagnosticContextType => {
  const context = useContext(DatabaseDiagnosticContext);
  if (!context) {
    throw new Error('useDatabaseDiagnostic must be used within a DatabaseDiagnosticProvider');
  }
  return context;
};