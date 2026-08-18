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
  resetDiagnostics: () => void;
}

const DiagnosticsContext = createContext<DiagnosticsContextType | undefined>(undefined);

export const DiagnosticsProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [diagnostics, setDiagnostics] = useState<DiagnosticsState>({
    reportId: null,
    status: 'idle',
    data: null,
    error: null,
  });

  const resetDiagnostics = () => {
    setDiagnostics({
      reportId: null,
      status: 'idle',
      data: null,
      error: null,
    });
  };

  return (
    <DiagnosticsContext.Provider value={{ diagnostics, setDiagnostics, resetDiagnostics }}>
      {children}
    </DiagnosticsContext.Provider>
  );
};

export const useDiagnostics = () => {
  const context = useContext(DiagnosticsContext);
  if (context === undefined) {
    throw new Error('useDiagnostics must be used within a DiagnosticsProvider');
  }
  return context;
};