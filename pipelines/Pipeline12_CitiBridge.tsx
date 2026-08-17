import React, { useState, useEffect, useCallback } from 'react';

interface CitiBridgeData {
  status: 'connected' | 'disconnected' | 'syncing' | 'error';
  lastSync: string | null;
  transactionCount: number;
}

const Pipeline12_CitiBridge: React.FC = () => {
  const [data, setData] = useState<CitiBridgeData>({
    status: 'disconnected',
    lastSync: null,
    transactionCount: 0,
  });

  const initiateBridgeConnection = useCallback(async () => {
    setData((prev) => ({ ...prev, status: 'syncing' }));
    try {
      // Simulated API call to Citi Bridge Gateway
      const response = await new Promise<{ count: number }>((resolve) =>
        setTimeout(() => resolve({ count: Math.floor(Math.random() * 1000) }), 1500)
      );

      setData({
        status: 'connected',
        lastSync: new Date().toISOString(),
        transactionCount: response.count,
      });
    } catch (error) {
      setData((prev) => ({ ...prev, status: 'error' }));
    }
  }, []);

  useEffect(() => {
    initiateBridgeConnection();
  }, [initiateBridgeConnection]);

  return (
    <div className="pipeline-container p-6 bg-white rounded-lg shadow-md border border-gray-200">
      <h2 className="text-xl font-bold mb-4 text-blue-900">Pipeline 12: CitiBridge Connectivity</h2>
      
      <div className="grid grid-cols-2 gap-4">
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Connection Status</p>
          <span className={`font-semibold ${data.status === 'connected' ? 'text-green-600' : 'text-red-600'}`}>
            {data.status.toUpperCase()}
          </span>
        </div>
        
        <div className="p-4 bg-gray-50 rounded">
          <p className="text-sm text-gray-500">Transaction Volume</p>
          <span className="font-semibold text-gray-800">{data.transactionCount}</span>
        </div>
      </div>

      <div className="mt-4 text-xs text-gray-400">
        Last Sync: {data.lastSync || 'Never'}
      </div>

      <button 
        onClick={initiateBridgeConnection}
        disabled={data.status === 'syncing'}
        className="mt-6 w-full py-2 px-4 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-gray-400 transition-colors"
      >
        {data.status === 'syncing' ? 'Synchronizing...' : 'Refresh CitiBridge Data'}
      </button>
    </div>
  );
};

export default Pipeline12_CitiBridge;