import React from 'react';
import { Check, X, Info } from 'lucide-react';

interface Offer {
  id: string;
  providerName: string;
  interestRate: string;
  monthlyInstallment: string;
  totalCostOfCredit: string;
  benefits: string[];
  isRecommended?: boolean;
}

interface OnboardingOfferComparisonMatrixProps {
  offers: Offer[];
}

export const OnboardingOfferComparisonMatrix: React.FC<OnboardingOfferComparisonMatrixProps> = ({ offers }) => {
  return (
    <div className="w-full overflow-x-auto py-8 px-4">
      <table className="w-full border-collapse bg-white rounded-xl shadow-sm overflow-hidden">
        <thead>
          <tr>
            <th className="p-6 text-left text-sm font-semibold text-gray-500 uppercase tracking-wider">Features</th>
            {offers.map((offer) => (
              <th key={offer.id} className={`p-6 text-center ${offer.isRecommended ? 'bg-blue-50' : ''}`}>
                {offer.isRecommended && (
                  <span className="inline-block px-3 py-1 mb-2 text-xs font-bold text-blue-700 bg-blue-100 rounded-full">
                    Recommended
                  </span>
                )}
                <h3 className="text-lg font-bold text-gray-900">{offer.providerName}</h3>
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y divide-gray-100">
          <tr>
            <td className="p-6 text-sm font-medium text-gray-600">Interest Rate (APR)</td>
            {offers.map((offer) => (
              <td key={offer.id} className="p-6 text-center text-lg font-semibold text-gray-900">
                {offer.interestRate}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-6 text-sm font-medium text-gray-600">Monthly Installment</td>
            {offers.map((offer) => (
              <td key={offer.id} className="p-6 text-center text-lg font-semibold text-gray-900">
                {offer.monthlyInstallment}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-6 text-sm font-medium text-gray-600">Total Cost of Credit</td>
            {offers.map((offer) => (
              <td key={offer.id} className="p-6 text-center text-lg font-semibold text-gray-900">
                {offer.totalCostOfCredit}
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-6 text-sm font-medium text-gray-600">Key Benefits</td>
            {offers.map((offer) => (
              <td key={offer.id} className="p-6">
                <ul className="space-y-2">
                  {offer.benefits.map((benefit, idx) => (
                    <li key={idx} className="flex items-center text-sm text-gray-600">
                      <Check className="w-4 h-4 mr-2 text-green-500 flex-shrink-0" />
                      {benefit}
                    </li>
                  ))}
                </ul>
              </td>
            ))}
          </tr>
          <tr>
            <td className="p-6"></td>
            {offers.map((offer) => (
              <td key={offer.id} className="p-6 text-center">
                <button className={`w-full py-3 px-6 rounded-lg font-semibold transition-colors ${
                  offer.isRecommended 
                    ? 'bg-blue-600 text-white hover:bg-blue-700' 
                    : 'bg-gray-100 text-gray-900 hover:bg-gray-200'
                }`}>
                  Select Offer
                </button>
              </td>
            ))}
          </tr>
        </tbody>
      </table>
      <div className="mt-6 flex items-start gap-2 text-xs text-gray-400">
        <Info className="w-4 h-4 flex-shrink-0" />
        <p>Comparison based on standard credit profiles. Final rates may vary based on individual credit assessment and lender terms.</p>
      </div>
    </div>
  );
};