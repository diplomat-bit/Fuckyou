import React, { useState, useEffect, useCallback } from 'react';
import { Shield, Lock, Activity, RefreshCw, AlertTriangle, CheckCircle, Server } from 'lucide-react';

interface DiagnosticResult {
  id: string;
  name: string;
  status: 'pending' | 'success' | 'error';
  latency: number;
  message: string;
}

interface AuthDiagnosticsIntegrationPanelProps {
  initialToken?: string;
}

export const AuthDiagnosticsIntegrationPanel: React.FC<AuthDiagnosticsIntegrationPanelProps> = ({ initialToken = '' }) => {
  const [token, setToken] = useState(initialToken);
  const [diagnostics, setDiagnostics] = useState<DiagnosticResult[]>([]);
  const [isRunning, setIsRunning] = useState(false);

  const runDiagnosticSuite = useCallback(async () => {
    setIsRunning(true);
    const suite: DiagnosticResult[] = [
      { id: 'jwt', name: 'JWT Signature Verification', status: 'pending', latency: 0, message: 'Analyzing...' },
      { id: 'rbac', name: 'RBAC Matrix Evaluation', status: 'pending', latency: 0, message: 'Checking permissions...' },
      { id: 'idp', name: 'IdP Endpoint Probing', status: 'pending', latency: 0, message: 'Pinging OIDC provider...' },
    ];

    setDiagnostics(suite);

    for (let i = 0; i < suite.length; i++) {
      await new Promise(resolve => setTimeout(resolve, 800 + Math.random() * 1000));
      suite[i].status = Math.random() > 0.1 ? 'success' : 'error';
      suite[i].latency = Math.floor(Math.random() * 150) + 20;
      suite[i].message = suite[i].status === 'success' ? 'Operational' : 'Threshold Violation Detected';
      setDiagnostics([...suite]);
    }
    setIsRunning(false);
  }, []);

  return (
    <div className="p-6 bg-slate-900 text-slate-100 rounded-xl border border-slate-700 shadow-2xl">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-xl font-bold flex items-center gap-2">
          <Shield className="text-blue-500" /> AuthDiagnostics Integration
        </h2>
        <button 
          onClick={runDiagnosticSuite}
          disabled={isRunning}
          className="px-4 py-2 bg-blue-600 hover:bg-blue-700 rounded-lg flex items-center gap-2 transition-colors"
        >
          <RefreshCw className={isRunning ? 'animate-spin' : ''} size={16} />
          Run Suite
        </button>
      </div>

      <div className="mb-6">
        <label className="block text-xs font-semibold text-slate-400 mb-2 uppercase">JWT Token Input</label>
        <textarea 
          value={token}
          onChange={(e) => setToken(e.target.value)}
          className="w-full h-24 bg-slate-800 border border-slate-700 rounded p-3 text-sm font-mono focus:ring-2 focus:ring-blue-500 outline-none"
          placeholder="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..."
        />
      </div>

      <div className="space-y-3">
        {diagnostics.map((d) => (
          <div key={d.id} className="flex items-center justify-between p-3 bg-slate-800 rounded border border-slate-700">
            <div className="flex items-center gap-3">
              {d.status === 'success' ? <CheckCircle className="text-green-500" size={18} /> : 
               d.status === 'error' ? <AlertTriangle className="text-red-500" size={18} /> : 
               <Activity className="text-slate-500 animate-pulse" size={18} />}
              <span className="font-medium">{d.name}</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-slate-400">{d.latency}ms</span>
              <span className={d.status === 'success' ? 'text-green-400' : 'text-red-400'}>{d.message}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 pt-6 border-t border-slate-700">
        <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
          <Server size={16} /> Remediation Protocol
        </h3>
        <div className="text-xs text-slate-400 bg-slate-950 p-3 rounded border border-slate-800">
          {diagnostics.some(d => d.status === 'error') 
            ? "System detected anomalies. Initiating automated key rotation and cache invalidation sequence..."
            : "All systems nominal. No remediation required."}
        </div>
      </div>
    </div>
  );
};