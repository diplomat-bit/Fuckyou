import React from 'react';
import { Activity, ArrowDownCircle, ArrowUpCircle, ChevronDown, ChevronUp, Clock } from 'lucide-react';

const formatCurrency = (amount: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
        style: 'currency',
        currency: currency.toUpperCase(),
    }).format(amount / 100);
};

const formatDate = (ts: number) => new Date(ts * 1000).toLocaleString();

const getStatusColor = (status: string) => {
  switch (status) {
    case 'open':
      return 'bg-blue-900/30 text-blue-400 border-blue-500/50';
    case 'posted':
      return 'bg-green-900/30 text-green-400 border-green-500/50';
    case 'void':
      return 'bg-gray-800 text-gray-400 border-gray-700';
    default:
      return 'bg-gray-800 text-gray-400 border-gray-700';
  }
};

const TransactionDetails = ({ transaction }: { transaction: any }) => {
  return (
    <div className="mt-4 p-4 bg-gray-900/50 rounded-lg border border-gray-700 space-y-3 text-sm">
      <div className="flex justify-between">
          <span className="text-gray-400">Transaction ID</span>
          <span className="text-white font-mono">{transaction.id}</span>
      </div>
      <div className="flex justify-between">
          <span className="text-gray-400">Financial Account</span>
          <span className="text-white font-mono">{transaction.financial_account}</span>
      </div>
      <div className="flex justify-between">
          <span className="text-gray-400">Status</span>
          <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(transaction.status)}`}>{transaction.status}</span>
      </div>
      <div className="flex justify-between">
          <span className="text-gray-400">Created</span>
          <span className="text-white">{formatDate(transaction.created)}</span>
      </div>
      
      <div className="pt-3 border-t border-gray-800">
        <p className="text-xs font-bold text-gray-500 uppercase mb-2 text-white">Balance Impact</p>
        <div className="grid grid-cols-3 gap-2">
             <div className="p-2 bg-gray-800 rounded">
                <span className="text-[10px] text-gray-500 block">Cash</span>
                <span className="text-white font-mono">{formatCurrency(transaction.balance_impact?.cash || 0, transaction.currency)}</span>
             </div>
             <div className="p-2 bg-gray-800 rounded">
                <span className="text-[10px] text-gray-500 block">Inbound</span>
                <span className="text-white font-mono">{formatCurrency(transaction.balance_impact?.inbound_pending || 0, transaction.currency)}</span>
             </div>
             <div className="p-2 bg-gray-800 rounded">
                <span className="text-[10px] text-gray-500 block">Outbound</span>
                <span className="text-white font-mono">{formatCurrency(transaction.balance_impact?.outbound_pending || 0, transaction.currency)}</span>
             </div>
        </div>
      </div>
    </div>
  );
};

export const TreasuryTransactionList = ({
  transactions,
  title = 'Treasury Transactions',
  emptyMessage = 'No transactions found in this financial account.',
}: {
  transactions: any[];
  title?: string;
  emptyMessage?: string;
}) => {
  const [expandedId, setExpandedId] = React.useState<string | null>(null);

  if (!transactions || transactions.length === 0) {
    return (
      <div className="p-10 text-center bg-gray-800/50 rounded-xl border border-gray-700">
        <Clock className="w-12 h-12 text-gray-600 mx-auto mb-3" />
        <h3 className="text-lg font-medium text-gray-300">{title}</h3>
        <p className="mt-1 text-sm text-gray-500">{emptyMessage}</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h3 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
          <Activity className="text-cyan-400" /> {title}
      </h3>
      <div className="space-y-2">
        {transactions.map((transaction) => {
          const isCredit = (transaction.amount || 0) >= 0;
          const isExpanded = expandedId === transaction.id;

          return (
            <div key={transaction.id} className="bg-gray-800/50 border border-gray-700 rounded-xl overflow-hidden hover:border-gray-600 transition-colors">
              <div 
                className="p-4 cursor-pointer flex items-center justify-between"
                onClick={() => setExpandedId(isExpanded ? null : transaction.id)}
              >
                <div className="flex items-center space-x-4">
                  {isCredit ? (
                    <ArrowDownCircle className="h-8 w-8 text-green-500" />
                  ) : (
                    <ArrowUpCircle className="h-8 w-8 text-red-500" />
                  )}
                  <div className="min-w-0 text-left">
                    <p className="text-sm font-bold text-white truncate">{transaction.description || 'Transaction'}</p>
                    <div className="flex items-center space-x-2 mt-0.5">
                      <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold border ${getStatusColor(transaction.status)}`}>
                        {transaction.status.toUpperCase()}
                      </span>
                    </div>
                  </div>
                </div>
                <div className="flex items-center gap-4">
                    <div className="text-right">
                        <p className={`text-sm font-bold ${isCredit ? 'text-green-400' : 'text-white'}`}>
                            {formatCurrency(transaction.amount || 0, transaction.currency || 'usd')}
                        </p>
                        <p className="text-[10px] text-gray-500">{formatDate(transaction.created)}</p>
                    </div>
                    {isExpanded ? <ChevronUp className="text-gray-500" /> : <ChevronDown className="text-gray-500" />}
                </div>
              </div>
              {isExpanded && (
                <div className="px-4 pb-4 animate-in slide-in-from-top-2 duration-200">
                    <TransactionDetails transaction={transaction} />
                </div>
              )}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default TreasuryTransactionList;