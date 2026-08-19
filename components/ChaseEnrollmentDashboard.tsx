

// --- CONSOLIDATED FROM: ./components/chase/ChaseEnrollmentDashboard.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import { ShieldCheck, RefreshCw, AlertCircle, CheckCircle2, Activity, CreditCard, UserCheck } from 'lucide-react';

interface EnrollmentResponse {
  enrollment: {
    enrollmentStatusName: 'AUTOENROLLED' | 'ENROLLED' | 'UN-ENROLLED' | 'OPTED_OUT' | 'OPTED_IN' | 'NOT_ENROLLED';
    enrollmentStatusDate: string;
  };
  product: {
    merchantDefinedProductCode: string;
  };
}

export default function ChaseEnrollmentDashboard() {
  const [status, setStatus] = useState<string>('LOADING');
  const [data, setData] = useState<EnrollmentResponse | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const addLog = (msg: string) => setLogs(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev].slice(0, 5));

  const fetchEnrollmentStatus = useCallback(async () => {
    setIsProcessing(true);
    addLog('Initiating health check /ping...');
    try {
      const response = await fetch('/api/card/loyalty/enrollment/status');
      const result = await response.json();
      setData(result);
      setStatus('ACTIVE');
      addLog('Enrollment status retrieved successfully.');
    } catch (err) {
      setStatus('ERROR');
      addLog('Critical: Failed to sync with Chase Loyalty Service.');
    } finally {
      setIsProcessing(false);
    }
  }, []);

  useEffect(() => { fetchEnrollmentStatus(); }, [fetchEnrollmentStatus]);

  const handleEnrollmentAction = async (action: 'POST' | 'PUT') => {
    setIsProcessing(true);
    addLog(`${action === 'POST' ? 'Enrolling' : 'Un-enrolling'} account...`);
    try {
      await fetch('/api/card/loyalty/enrollment', { method: action });
      await fetchEnrollmentStatus();
      addLog('Transaction confirmed by Chase Gateway.');
    } catch (err) {
      addLog('Transaction rejected by downstream systems.');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
      <header className="mb-8 flex items-center justify-between border-b border-slate-200 pb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-blue-900">Chase Pay with Points</h1>
          <p className="text-slate-500">Executive Loyalty Enrollment Dashboard</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`px-4 py-2 rounded-full text-sm font-semibold ${status === 'ACTIVE' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
            {status}
          </div>
          <button onClick={fetchEnrollmentStatus} className="p-2 hover:bg-slate-200 rounded-full transition-colors">
            <RefreshCw className={isProcessing ? 'animate-spin' : ''} />
          </button>
        </div>
      </header>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><UserCheck className="text-blue-600" /> Enrollment Controls</h2>
            <div className="flex gap-4">
              <button 
                onClick={() => handleEnrollmentAction('POST')}
                disabled={isProcessing}
                className="bg-blue-700 text-white px-6 py-3 rounded-xl font-medium hover:bg-blue-800 transition-all disabled:opacity-50"
              >
                Enroll Now
              </button>
              <button 
                onClick={() => handleEnrollmentAction('PUT')}
                disabled={isProcessing}
                className="bg-white border border-slate-300 px-6 py-3 rounded-xl font-medium hover:bg-slate-50 transition-all disabled:opacity-50"
              >
                Un-enroll
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2"><Activity className="text-blue-600" /> Real-time API Ledger</h2>
            <div className="bg-slate-900 text-slate-300 p-4 rounded-xl font-mono text-xs h-48 overflow-y-auto">
              {logs.map((log, i) => <div key={i} className="mb-1 border-b border-slate-800 pb-1">{log}</div>)}
            </div>
          </div>
        </div>

        <div className="bg-white p-6 rounded-2xl shadow-sm border border-slate-200">
          <h2 className="text-lg font-semibold mb-6 flex items-center gap-2"><CreditCard className="text-blue-600" /> Account Summary</h2>
          {data ? (
            <div className="space-y-4">
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Status</p>
                <p className="text-xl font-bold text-blue-900">{data.enrollment.enrollmentStatusName}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Product Code</p>
                <p className="text-lg font-medium">{data.product.merchantDefinedProductCode}</p>
              </div>
              <div className="p-4 bg-slate-50 rounded-xl">
                <p className="text-xs text-slate-500 uppercase font-bold">Last Modified</p>
                <p className="text-lg font-medium">{data.enrollment.enrollmentStatusDate}</p>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-40 text-slate-400">
              <ShieldCheck size={48} className="mb-2 opacity-20" />
              <p>Awaiting secure handshake...</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}