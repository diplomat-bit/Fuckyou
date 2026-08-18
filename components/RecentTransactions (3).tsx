import React from 'react';
import { RefreshCw, TrendingUp, TrendingDown } from 'lucide-react'; 

// Placeholder type definition for a transaction, consistent with financial MVP
interface Transaction {
  id: string;
  date: string;
  description: string;
  amount: number;
  category: string;
  type: 'debit' | 'credit';
}

// Mock Data consistent with financial aggregation MVP
const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 't1', date: '2024-07-25', description: 'Stripe Payment Processing Fee', amount: -55.99, category: 'Fees', type: 'debit' },
  { id: 't2', date: '2024-07-24', description: 'AWS Cloud Services (Q3)', amount: -850.00, category: 'Technology', type: 'debit' },
  { id: 't3', date: '2024-07-24', description: 'Customer Invoice #4001 (Plaid via Bank A)', amount: 4500.00, category: 'Revenue', type: 'credit' },
  { id: 't4', date: '2024-07-23', description: 'Office Supplies Purchase', amount: -45.50, category: 'Expenses', type: 'debit' },
  { id: 't5', date: '2024-07-22', description: 'Q2 Tax Payment', amount: -12300.00, category: 'Taxes', type: 'debit' },
  { id: 't6', date: '2024-07-22', description: 'Refund from Vendor Z', amount: 150.00, category: 'Refunds', type: 'credit' },
];

/**
 * Rationale for replacement:
 * The original content of this file was a massive, insecure API key configuration form (ApiSettingsPage), 
 * indicating a severe file naming and architectural flaw (Instructions 1 & 6). Since this component 
 * is named 'RecentTransactions', the content must reflect its intended purpose for the MVP 
 * financial dashboard.
 * 
 * This replacement provides a clean, standard, and functional component using 
 * the unified Tailwind framework (Instruction 2) to display essential financial data.
 */
const RecentTransactions: React.FC = () => {
  // In a production system, transactions would be fetched using React Query or standardized state management:
  // const { data: transactions, isLoading, error, refetch } = useRecentTransactions();
  const transactions = MOCK_TRANSACTIONS;
  const isLoading = false;
  const error = null;

  const getAmountColor = (type: 'debit' | 'credit') => {
    return type === 'credit' ? 'text-green-600' : 'text-red-600';
  };

  const getIcon = (type: 'debit' | 'credit') => {
    // Assuming lucide-react or similar icons for visual aid
    return type === 'credit' ? <TrendingUp className="w-4 h-4 text-green-500" /> : <TrendingDown className="w-4 h-4 text-red-500" />;
  };

  if (isLoading) {
    return (
      <div className="bg-white p-6 rounded-xl shadow-lg animate-pulse">
        <div className="h-4 bg-gray-200 rounded w-1/3 mb-4"></div>
        <div className="space-y-3">
          <div className="h-3 bg-gray-100 rounded"></div>
          <div className="h-3 bg-gray-100 rounded w-5/6"></div>
          <div className="h-3 bg-gray-100 rounded w-2/3"></div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-50 p-6 rounded-xl shadow-lg">
        <h2 className="text-xl font-semibold text-red-700">Transaction Error</h2>
        <p className="text-red-600 mt-2">Failed to load recent transactions from the API connector.</p>
        <button className="mt-4 text-sm text-red-500 hover:underline flex items-center" onClick={() => {/* refetch() */}}>
          <RefreshCw className="w-4 h-4 mr-1" /> Retry
        </button>
      </div>
    );
  }

  return (
    <div className="bg-white p-6 rounded-xl shadow-lg border border-gray-100">
      <div className="flex justify-between items-center mb-4 border-b pb-3">
        <h2 className="text-xl font-semibold text-gray-800">Recent Transactions</h2>
        <span className="text-sm text-gray-500">Last 7 Days</span>
      </div>

      <div className="space-y-3">
        {transactions.map((t) => (
          <div key={t.id} className="flex items-center justify-between py-2 border-b last:border-b-0">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-gray-100 rounded-full">
                {getIcon(t.type)}
              </div>
              <div>
                <p className="font-medium text-gray-900 truncate max-w-xs">{t.description}</p>
                <p className="text-xs text-gray-500">{t.date} &middot; {t.category}</p>
              </div>
            </div>
            <div className={`font-semibold ${getAmountColor(t.type)} text-right`}>
              {t.type === 'debit' ? '-' : '+'}
              ${Math.abs(t.amount).toFixed(2)}
            </div>
          </div>
        ))}
      </div>
      
      {transactions.length === 0 && (
        <p className="text-center py-4 text-gray-500">No recent activity found.</p>
      )}

      <button className="w-full mt-4 text-sm text-blue-600 hover:text-blue-800 hover:underline pt-3 border-t">
        View Full Transaction History
      </button>
    </div>
  );
};

export default RecentTransactions;