import React, { useState, useEffect } from 'react';

interface IngestionStatus {
  status: 'idle' | 'running' | 'completed' | 'error';
  progress: number;
  lastSync: string | null;
  error: string | null;
}

const Pipeline01_DataIngestion: React.FC = () => {
  const [ingestionState, setIngestionState] = useState<IngestionStatus>({
    status: 'idle',
    progress: 0,
    lastSync: null,
    error: null,
  });

  const runIngestionPipeline = async () => {
    setIngestionState({ status: 'running', progress: 0, lastSync: null, error: null });

    try {
      // Simulate API call to financial data provider
      const steps = ['Connecting to API', 'Fetching Market Data', 'Normalizing Schema', 'Validating Integrity', 'Persisting to DB'];
      
      for (let i = 0; i < steps.length; i++) {
        await new Promise((resolve) => setTimeout(resolve, 800));
        setIngestionState((prev) => ({
          ...prev,
          progress: Math.round(((i + 1) / steps.length) * 100),
        }));
      }

      setIngestionState({
        status: 'completed',
        progress: 100,
        lastSync: new Date().toISOString(),
        error: null,
      });
    } catch (err) {
      setIngestionState({
        status: 'error',
        progress: 0,
        lastSync: null,
        error: err instanceof Error ? err.message : 'Unknown ingestion error',
      });
    }
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4">Pipeline 01: Automated Data Ingestion</h2>
      <div className="mb-4">
        <p className="text-sm text-gray-600">Status: <span className="font-semibold uppercase">{ingestionState.status}</span></p>
        <div className="w-full bg-gray-200 rounded-full h-2.5 mt-2">
          <div 
            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" 
            style={{ width: `${ingestionState.progress}%` }}
          ></div>
        </div>
      </div>
      
      <button
        onClick={runIngestionPipeline}
        disabled={ingestionState.status === 'running'}
        className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400"
      >
        {ingestionState.status === 'running' ? 'Ingesting...' : 'Start Ingestion'}
      </button>

      {ingestionState.lastSync && (
        <p className="mt-4 text-xs text-green-600">Last successful sync: {ingestionState.lastSync}</p>
      )}
      
      {ingestionState.error && (
        <p className="mt-4 text-xs text-red-600">Error: {ingestionState.error}</p>
      )}
    </div>
  );
};

export default Pipeline01_DataIngestion;