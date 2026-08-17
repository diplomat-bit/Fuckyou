import React, { useState } from 'react';
import { AlertCircle, RefreshCcw, CheckCircle2, XCircle } from 'lucide-react';

interface ErrorCode {
  id: string;
  label: string;
  description: string;
  severity: 'warning' | 'error' | 'critical';
}

const ERROR_CODES: ErrorCode[] = [
  { id: 'invalidProductCode', label: 'Invalid Product Code', description: 'The provided product identifier does not exist in the EMEA catalog.', severity: 'error' },
  { id: 'applicationRejected', label: 'Application Rejected', description: 'The credit application failed automated underwriting criteria.', severity: 'critical' },
  { id: 'exceededApprovedCreditLimit', label: 'Credit Limit Exceeded', description: 'The requested amount exceeds the customer\'s current approved credit ceiling.', severity: 'warning' },
  { id: 'productAgreementExpired', label: 'Agreement Expired', description: 'The underlying product agreement has reached its end-of-life date.', severity: 'error' },
];

export default function OnboardingOfferErrorSimulator() {
  const [activeError, setActiveError] = useState<ErrorCode | null>(null);

  const handleSimulate = (error: ErrorCode) => {
    setActiveError(error);
  };

  const getSeverityStyles = (severity: string) => {
    switch (severity) {
      case 'critical': return 'bg-red-50 border-red-200 text-red-800';
      case 'error': return 'bg-orange-50 border-orange-200 text-orange-800';
      case 'warning': return 'bg-yellow-50 border-yellow-200 text-yellow-800';
      default: return 'bg-blue-50 border-blue-200 text-blue-800';
    }
  };

  return (
    <div className="p-6 bg-white rounded-xl border border-slate-200 shadow-sm max-w-2xl mx-auto">
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-slate-900">EMEA API Error Simulator</h2>
        <p className="text-sm text-slate-500">Trigger specific API responses to test UI error handling states.</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-8">
        {ERROR_CODES.map((error) => (
          <button
            key={error.id}
            onClick={() => handleSimulate(error)}
            className="flex items-center gap-3 p-3 text-left border border-slate-200 rounded-lg hover:border-indigo-500 hover:bg-indigo-50 transition-all duration-200"
          >
            <AlertCircle className="w-4 h-4 text-slate-400" />
            <span className="text-sm font-medium text-slate-700">{error.label}</span>
          </button>
        ))}
      </div>

      {activeError && (
        <div className={`p-4 rounded-lg border ${getSeverityStyles(activeError.severity)} animate-in fade-in slide-in-from-top-2`}>
          <div className="flex items-start gap-3">
            <XCircle className="w-5 h-5 mt-0.5 flex-shrink-0" />
            <div>
              <h3 className="font-bold text-sm uppercase tracking-wider">{activeError.label}</h3>
              <p className="text-sm mt-1 opacity-90">{activeError.description}</p>
              <div className="mt-4 flex gap-2">
                <button 
                  onClick={() => setActiveError(null)}
                  className="text-xs font-semibold px-3 py-1.5 bg-white/50 rounded hover:bg-white transition-colors"
                >
                  Dismiss
                </button>
                <button 
                  onClick={() => window.location.reload()}
                  className="flex items-center gap-1 text-xs font-semibold px-3 py-1.5 bg-white/50 rounded hover:bg-white transition-colors"
                >
                  <RefreshCcw className="w-3 h-3" /> Retry Request
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {!activeError && (
        <div className="flex items-center justify-center p-8 border-2 border-dashed border-slate-100 rounded-lg text-slate-400">
          <div className="text-center">
            <CheckCircle2 className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No active errors. System status: Operational.</p>
          </div>
        </div>
      )}
    </div>
  );
}