import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

interface OnboardingContextType {
  controlFlowId: string | null;
  setControlFlowId: (id: string) => void;
  isSessionActive: boolean;
  resetSession: () => void;
}

const OnboardingContext = createContext<OnboardingContextType | undefined>(undefined);

export const OnboardingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [controlFlowId, setControlFlowIdState] = useState<string | null>(null);

  useEffect(() => {
    const savedId = sessionStorage.getItem('bank_control_flow_id');
    if (savedId) {
      setControlFlowIdState(savedId);
    }
  }, []);

  const setControlFlowId = (id: string) => {
    sessionStorage.setItem('bank_control_flow_id', id);
    setControlFlowIdState(id);
  };

  const resetSession = () => {
    sessionStorage.removeItem('bank_control_flow_id');
    setControlFlowIdState(null);
  };

  return (
    <OnboardingContext.Provider value={{ 
      controlFlowId, 
      setControlFlowId, 
      isSessionActive: !!controlFlowId,
      resetSession 
    }}>
      {children}
    </OnboardingContext.Provider>
  );
};

export const useOnboarding = () => {
  const context = useContext(OnboardingContext);
  if (!context) {
    throw new Error('useOnboarding must be used within an OnboardingProvider');
  }
  return context;
};

export const OnboardingControlFlowManager: React.FC = () => {
  const { controlFlowId, isSessionActive } = useOnboarding();

  if (!isSessionActive) return null;

  return (
    <div className="fixed bottom-4 right-4 z-50 bg-slate-900 text-emerald-400 p-3 rounded-lg border border-emerald-800 shadow-2xl font-mono text-xs">
      <div className="flex flex-col gap-1">
        <span className="text-slate-500 uppercase tracking-wider text-[10px]">Session Control Flow ID</span>
        <span className="font-bold">{controlFlowId || 'INITIALIZING...'}</span>
      </div>
    </div>
  );
};