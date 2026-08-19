

// --- CONSOLIDATED FROM: ./pipelines/Pipeline02_SecurityAudit.tsx ---

import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, FileText, Loader2, CheckCircle } from 'lucide-react';

interface AuditResult {
  id: string;
  timestamp: string;
  status: 'passed' | 'failed' | 'warning';
  vulnerabilities: number;
  reportUrl: string;
}

const Pipeline02_SecurityAudit: React.FC = () => {
  const [isScanning, setIsScanning] = useState(false);
  const [auditHistory, setAuditHistory] = useState<AuditResult[]>([]);
  const [progress, setProgress] = useState(0);

  const runSecurityAudit = async () => {
    setIsScanning(true);
    setProgress(0);

    // Simulate security scanning pipeline steps
    const steps = ['Dependency Check', 'Static Analysis', 'Secret Scanning', 'Compliance Audit'];
    
    for (let i = 0; i <= steps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 800));
      setProgress((i / steps.length) * 100);
    }

    const newResult: AuditResult = {
      id: `SEC-${Math.floor(Math.random() * 10000)}`,
      timestamp: new Date().toISOString(),
      status: 'passed',
      vulnerabilities: 0,
      reportUrl: '/reports/audit-latest.pdf'
    };

    setAuditHistory([newResult, ...auditHistory]);
    setIsScanning(false);
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-white rounded-xl shadow-md">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-800 flex items-center gap-2">
            <ShieldCheck className="text-blue-600" />
            Pipeline 02: Security Audit
          </h1>
          <p className="text-gray-500">Automated vulnerability scanning and compliance reporting.</p>
        </div>
        <button
          onClick={runSecurityAudit}
          disabled={isScanning}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition-colors flex items-center gap-2"
        >
          {isScanning ? <Loader2 className="animate-spin" /> : 'Run Audit'}
        </button>
      </div>

      {isScanning && (
        <div className="mb-6">
          <div className="w-full bg-gray-200 rounded-full h-2.5">
            <div className="bg-blue-600 h-2.5 rounded-full transition-all duration-500" style={{ width: `${progress}%` }}></div>
          </div>
          <p className="text-sm text-gray-600 mt-2">Scanning infrastructure and dependencies...</p>
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <table className="w-full text-left">
          <thead className="bg-gray-50">
            <tr>
              <th className="p-4 font-semibold text-gray-700">Audit ID</th>
              <th className="p-4 font-semibold text-gray-700">Timestamp</th>
              <th className="p-4 font-semibold text-gray-700">Status</th>
              <th className="p-4 font-semibold text-gray-700">Report</th>
            </tr>
          </thead>
          <tbody>
            {auditHistory.map((audit) => (
              <tr key={audit.id} className="border-t">
                <td className="p-4 font-mono text-sm">{audit.id}</td>
                <td className="p-4 text-gray-600">{new Date(audit.timestamp).toLocaleString()}</td>
                <td className="p-4">
                  <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-bold flex items-center w-fit gap-1">
                    <CheckCircle size={12} /> {audit.status.toUpperCase()}
                  </span>
                </td>
                <td className="p-4">
                  <a href={audit.reportUrl} className="text-blue-600 hover:underline flex items-center gap-1">
                    <FileText size={16} /> View PDF
                  </a>
                </td>
              </tr>
            ))}
            {auditHistory.length === 0 && (
              <tr>
                <td colSpan={4} className="p-8 text-center text-gray-400">No audit history found. Run a scan to begin.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Pipeline02_SecurityAudit;