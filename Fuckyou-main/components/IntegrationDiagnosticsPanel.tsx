import React, { useState, useEffect, useContext } from 'react';
import { IntegrationContext } from '../context/IntegrationContext';
import { IntegrationStatus, IntegrationMetrics } from '../types/IntegrationTypes';

interface DiagnosticPanelProps {
  refreshInterval?: number;
}

export const IntegrationDiagnosticsPanel: React.FC<DiagnosticPanelProps> = ({ refreshInterval = 5000 }) => {
  const { integrations, updateIntegrationConfig, refreshStatus } = useContext(IntegrationContext);
  const [activeTab, setActiveTab] = useState<string>('overview');

  useEffect(() => {
    const interval = setInterval(refreshStatus, refreshInterval);
    return () => clearInterval(interval);
  }, [refreshInterval, refreshStatus]);

  const getStatusColor = (status: IntegrationStatus) => {
    switch (status) {
      case 'HEALTHY': return 'text-green-500';
      case 'DEGRADED': return 'text-yellow-500';
      case 'CRITICAL': return 'text-red-500';
      default: return 'text-gray-500';
    }
  };

  return (
    <div className="p-6 bg-slate-900 text-white rounded-xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold tracking-tight">Integration Diagnostics</h2>
        <button 
          onClick={refreshStatus}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-md text-sm font-medium transition-colors"
        >
          Force Sync
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {Object.entries(integrations).map(([key, data]) => (
          <div key={key} className="p-4 bg-slate-800 rounded-lg border border-slate-700 hover:border-blue-500 transition-all">
            <div className="flex justify-between items-start mb-2">
              <h3 className="font-semibold capitalize">{key.replace(/([A-Z])/g, ' $1')}</h3>
              <span className={`text-xs font-bold ${getStatusColor(data.status)}`}>
                {data.status}
              </span>
            </div>
            
            <div className="space-y-1 text-sm text-slate-400">
              <p>Latency: <span className="text-white">{data.metrics.latency}ms</span></p>
              <p>Uptime: <span className="text-white">{data.metrics.uptime}%</span></p>
              <p>Last Sync: <span className="text-white">{new Date(data.lastChecked).toLocaleTimeString()}</span></p>
            </div>

            <div className="mt-4 pt-4 border-t border-slate-700">
              <button 
                onClick={() => updateIntegrationConfig(key, { enabled: !data.config.enabled })}
                className={`w-full py-1 text-xs rounded ${data.config.enabled ? 'bg-red-900/30 text-red-400' : 'bg-green-900/30 text-green-400'}`}
              >
                {data.config.enabled ? 'Disable Integration' : 'Enable Integration'}
              </button>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-8 p-4 bg-black/20 rounded border border-slate-800">
        <h4 className="text-sm font-medium text-slate-500 mb-2 uppercase tracking-wider">System Health Log</h4>
        <div className="h-32 overflow-y-auto text-xs font-mono space-y-1">
          {Object.entries(integrations).map(([key, data]) => (
            <div key={`log-${key}`} className="flex gap-2">
              <span className="text-blue-400">[{new Date().toLocaleTimeString()}]</span>
              <span className="text-slate-300">{key} status updated to {data.status}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
