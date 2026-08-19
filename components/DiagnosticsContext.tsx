

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/context/DiagnosticsContext.tsx ---

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface DiagnosticsState {
  reportId: string | null;
  status: 'idle' | 'loading' | 'success' | 'error';
  data: any | null;
  error: string | null;
}

interface DiagnosticsContextType {
  diagnostics: DiagnosticsState;
  setDiagnostics: React.Dispatch<React.SetStateAction<DiagnosticsState>>;
  fetchReport: (id: string) => Promise<void>;
}

const DiagnosticsContext = createContext<DiagnosticsContextType | undefined>(undefined);

export const DiagnosticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    reportId: null,
    status: 'idle',
    data: null,
    error: null,
  });

  const fetchReport = async (id: string) => {
    setDiagnostics((prev) => ({ ...prev, status: 'loading', reportId: id }));
    try {
      // Mock implementation of diagnostic data fetching
      const response = await new Promise((resolve) => 
        setTimeout(() => resolve({ id, timestamp: new Date().toISOString(), metrics: {} }), 500)
      );
      setDiagnostics({ reportId: id, status: 'success', data: response, error: null });
    } catch (err) {
      setDiagnostics({ reportId: id, status: 'error', data: null, error: 'Failed to fetch diagnostic report' });
    }
  };

  return (
    <DiagnosticsContext.Provider value={{ diagnostics, setDiagnostics, fetchReport }}>
      {children}
    </DiagnosticsContext.Provider>
  );
};

export const useDiagnostics = () => {
  const context = useContext(DiagnosticsContext);
  if (!context) {
    throw new Error('useDiagnostics must be used within a DiagnosticsProvider');
  }
  return context;
};