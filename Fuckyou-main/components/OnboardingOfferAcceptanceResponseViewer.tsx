import React from 'react';
import { CheckCircle2, Download, ArrowRight, FileText, Building2, Percent } from 'lucide-react';

interface OfferAcceptanceResponse {
  accountNumber: string;
  interbankOfferedRate: string;
  loanIndexRate: string;
  loanAmount: number;
  currency: string;
  timestamp: string;
}

interface OnboardingOfferAcceptanceResponseViewerProps {
  data: OfferAcceptanceResponse;
  onDownload: () => void;
  onNext: () => void;
}

export const OnboardingOfferAcceptanceResponseViewer: React.FC<OnboardingOfferAcceptanceResponseViewerProps> = ({
  data,
  onDownload,
  onNext,
}) => {
  return (
    <div className="w-full max-w-2xl mx-auto bg-white rounded-2xl shadow-xl border border-slate-100 overflow-hidden">
      <div className="bg-emerald-50 p-8 text-center border-b border-emerald-100">
        <div className="mx-auto w-16 h-16 bg-emerald-100 rounded-full flex items-center justify-center mb-4">
          <CheckCircle2 className="w-10 h-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-slate-900">Offer Accepted Successfully</h2>
        <p className="text-slate-600 mt-2">Your loan agreement has been processed and finalized.</p>
      </div>

      <div className="p-8 space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
              <Building2 className="w-4 h-4" />
              Account Number
            </div>
            <div className="text-lg font-mono font-semibold text-slate-900">{data.accountNumber}</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
              <Percent className="w-4 h-4" />
              Loan Index Rate
            </div>
            <div className="text-lg font-semibold text-slate-900">{data.loanIndexRate}%</div>
          </div>

          <div className="p-4 bg-slate-50 rounded-xl border border-slate-100">
            <div className="flex items-center gap-2 text-slate-500 mb-1 text-sm font-medium">
              <FileText className="w-4 h-4" />
              Interbank Offered Rate
            </div>
            <div className="text-lg font-semibold text-slate-900">{data.interbankOfferedRate}</div>
          </div>

          <div className="p-4 bg-emerald-50 rounded-xl border border-emerald-100">
            <div className="text-emerald-700 mb-1 text-sm font-medium">Total Loan Amount</div>
            <div className="text-2xl font-bold text-emerald-900">
              {new Intl.NumberFormat('en-US', { style: 'currency', currency: data.currency }).format(data.loanAmount)}
            </div>
          </div>
        </div>

        <div className="pt-6 border-t border-slate-100 flex flex-col sm:flex-row gap-4">
          <button
            onClick={onDownload}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-white border-2 border-slate-200 hover:border-slate-300 text-slate-700 font-semibold rounded-xl transition-all"
          >
            <Download className="w-5 h-5" />
            Download Receipt
          </button>
          <button
            onClick={onNext}
            className="flex-1 flex items-center justify-center gap-2 py-3 px-4 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold rounded-xl transition-all shadow-lg shadow-emerald-200"
          >
            Continue to Dashboard
            <ArrowRight className="w-5 h-5" />
          </button>
        </div>
      </div>

      <div className="px-8 py-4 bg-slate-50 text-center text-xs text-slate-400">
        Transaction processed on {new Date(data.timestamp).toLocaleString()}
      </div>
    </div>
  );
};