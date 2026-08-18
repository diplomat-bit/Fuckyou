import React, { useEffect, useState } from 'react';
import { DiagnosticReport, SystemStatus } from '../api/PortalDiagnostics/types/DiagnosticReport';
import { useDiagnostics } from '../api/PortalDiagnostics/context/DiagnosticsContext';

export const DiagnosticReportView: React.FC = () => {
  const { report, loading, error, refreshDiagnostics } = useDiagnostics();

  if (loading) return <div className="p-4 animate-pulse">Loading System Diagnostics...</div>;
  if (error) return <div className="p-4 text-red-500">Error loading diagnostics: {error.message}</div>;
  if (!report) return <div className="p-4">No diagnostic data available.</div>;

  return (
    <div className="p-6 space-y-6 bg-gray-900 text-white rounded-lg shadow-xl">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">System Diagnostic Report</h2>
        <button 
          onClick={refreshDiagnostics}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded transition-colors"
        >
          Refresh Metrics
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <StatusCard title="Database Health" status={report.databaseStatus} />
        <StatusCard title="Network Latency" status={report.networkStatus} />
        <StatusCard title="Security Integrity" status={report.securityStatus} />
      </div>

      <div className="bg-gray-800 p-4 rounded border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Resource Utilization</h3>
        <div className="space-y-2">
          {Object.entries(report.metrics).map(([key, value]) => (
            <div key={key} className="flex justify-between border-b border-gray-700 py-2">
              <span className="capitalize">{key.replace(/([A-Z])/g, ' $1')}</span>
              <span className="font-mono">{value}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-gray-800 p-4 rounded border border-gray-700">
        <h3 className="text-lg font-semibold mb-4">Bridge Health Logs</h3>
        <ul className="space-y-2">
          {report.bridgeHealth.map((bridge, idx) => (
            <li key={idx} className="flex items-center gap-3">
              <span className={`w-3 h-3 rounded-full ${bridge.active ? 'bg-green-500' : 'bg-red-500'}`} />
              <span>{bridge.name}</span>
              <span className="text-gray-400 text-sm ml-auto">{bridge.lastSync}</span>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

const StatusCard: React.FC<{ title: string; status: SystemStatus }> = ({ title, status }) => (
  <div className="p-4 bg-gray-800 rounded border border-gray-700">
    <h4 className="text-sm text-gray-400 uppercase">{title}</h4>
    <div className={`text-xl font-bold mt-2 ${status === 'HEALTHY' ? 'text-green-400' : 'text-yellow-400'}`}>
      {status}
    </div>
  </div>
);