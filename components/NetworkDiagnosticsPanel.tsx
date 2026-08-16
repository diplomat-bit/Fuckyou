import React, { useEffect, useState } from 'react';
import { useNetworkDiagnostics } from '../context/NetworkDiagnosticsContext';
import { NetworkStatus, DiagnosticReport } from '../api/PortalDiagnostics/types/DiagnosticReport';

export const NetworkDiagnosticsPanel: React.FC = () => {
  const { report, loading, error, refresh } = useNetworkDiagnostics();
  const [localStatus, setLocalStatus] = useState<NetworkStatus | null>(null);

  useEffect(() => {
    if (report) {
      setLocalStatus(report.status);
    }
  }, [report]);

  if (loading) return <div className="p-4 animate-pulse">Loading Network Diagnostics...</div>;
  if (error) return <div className="p-4 text-red-500">Error: {error.message}</div>;
  if (!report) return <div className="p-4">No diagnostic data available.</div>;

  return (
    <div className="bg-slate-900 text-white p-6 rounded-xl shadow-2xl border border-slate-700">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-xl font-bold tracking-tight">Network Diagnostics</h2>
        <button 
          onClick={refresh}
          className="px-3 py-1 bg-blue-600 hover:bg-blue-500 rounded text-sm transition-colors"
        >
          Refresh
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-xs uppercase">System Health</p>
          <p className={`text-2xl font-mono ${localStatus === 'HEALTHY' ? 'text-green-400' : 'text-yellow-400'}`}>
            {localStatus}
          </p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-xs uppercase">Avg Latency</p>
          <p className="text-2xl font-mono">{report.metrics.avgLatencyMs}ms</p>
        </div>
        <div className="bg-slate-800 p-4 rounded-lg border border-slate-700">
          <p className="text-slate-400 text-xs uppercase">Active Endpoints</p>
          <p className="text-2xl font-mono">{report.metrics.activeEndpoints}</p>
        </div>
      </div>

      <div className="space-y-2">
        <h3 className="text-sm font-semibold text-slate-400 uppercase">Endpoint Breakdown</h3>
        {report.endpoints.map((ep) => (
          <div key={ep.id} className="flex justify-between items-center bg-slate-800/50 p-3 rounded border border-slate-700/50">
            <span className="font-mono text-sm">{ep.name}</span>
            <div className="flex items-center gap-3">
              <span className="text-xs text-slate-500">{ep.latency}ms</span>
              <span className={`w-2 h-2 rounded-full ${ep.status === 'UP' ? 'bg-green-500' : 'bg-red-500'}`} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
