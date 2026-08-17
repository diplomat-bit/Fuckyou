import React from 'react';
import { CheckCircle, AlertCircle, ArrowRight, CreditCard, Tag } from 'lucide-react';

interface DecisionResult {
  status: 'APPROVED' | 'DECLINED' | 'COUNTER_OFFER';
  creditLimit?: number;
  counterOfferLimit?: number;
  reason?: string;
  crossSellOffers?: Array<{
    title: string;
    description: string;
    icon?: React.ReactNode;
  }>;
}

interface IpaDecisionResultViewProps {
  result: DecisionResult;
}

export const IpaDecisionResultView: React.FC<IpaDecisionResultViewProps> = ({ result }) => {
  const formatCurrency = (amount: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(amount);

  return (
    <div className="w-full max-w-2xl mx-auto p-6 bg-white rounded-xl shadow-sm border border-slate-200">
      <div className="flex items-center gap-3 mb-6">
        {result.status === 'APPROVED' ? (
          <div className="p-2 bg-green-100 text-green-700 rounded-full"><CheckCircle size={24} /></div>
        ) : (
          <div className="p-2 bg-amber-100 text-amber-700 rounded-full"><AlertCircle size={24} /></div>
        )}
        <h2 className="text-xl font-bold text-slate-900">
          {result.status === 'APPROVED' ? 'Application Approved' : 
           result.status === 'COUNTER_OFFER' ? 'Counter-Offer Available' : 'Application Update'}
        </h2>
      </div>

      <div className="space-y-6">
        {result.creditLimit && (
          <div className="p-4 bg-slate-50 rounded-lg border border-slate-100">
            <p className="text-sm text-slate-500 uppercase tracking-wider font-semibold">Approved Credit Limit</p>
            <p className="text-3xl font-bold text-slate-900">{formatCurrency(result.creditLimit)}</p>
          </div>
        )}

        {result.counterOfferLimit && (
          <div className="p-4 bg-blue-50 rounded-lg border border-blue-100">
            <p className="text-sm text-blue-700 font-semibold">Alternative Offer</p>
            <p className="text-2xl font-bold text-blue-900">{formatCurrency(result.counterOfferLimit)}</p>
            <button className="mt-2 flex items-center gap-2 text-sm font-medium text-blue-600 hover:text-blue-800">
              Accept Counter-Offer <ArrowRight size={16} />
            </button>
          </div>
        )}

        {result.reason && (
          <p className="text-slate-600 text-sm italic">Note: {result.reason}</p>
        )}

        {result.crossSellOffers && result.crossSellOffers.length > 0 && (
          <div className="pt-6 border-t border-slate-100">
            <h3 className="text-sm font-bold text-slate-900 mb-4 flex items-center gap-2">
              <Tag size={16} /> Recommended for you
            </h3>
            <div className="grid gap-3">
              {result.crossSellOffers.map((offer, idx) => (
                <div key={idx} className="flex items-start gap-3 p-3 rounded-lg border border-slate-200 hover:border-indigo-200 transition-colors">
                  <div className="mt-1 text-indigo-600"><CreditCard size={20} /></div>
                  <div>
                    <p className="text-sm font-semibold text-slate-900">{offer.title}</p>
                    <p className="text-xs text-slate-500">{offer.description}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};