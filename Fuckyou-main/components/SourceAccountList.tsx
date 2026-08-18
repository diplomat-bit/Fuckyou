import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  CheckCircle2, 
  CreditCard, 
  Wallet, 
  TrendingUp, 
  Calendar, 
  X, 
  ChevronRight, 
  DollarSign, 
  Euro, 
  Coins,
  ArrowUpRight
} from 'lucide-react';

export interface Account {
  id: string;
  nickname: string;
  accountNumber: string;
  balance: number;
  currency: 'USD' | 'EUR' | 'GBP' | 'CAD';
  type: 'Checking' | 'Savings' | 'Credit Card' | 'Money Market';
  nextPaymentAmount: number;
  nextPaymentDate: string;
  limit?: number; // For credit cards or overdraft visualization
  colorTheme: 'indigo' | 'emerald' | 'amber' | 'rose';
}

interface SourceAccountListProps {
  onSelectAccount?: (account: Account) => void;
  selectedAccountId?: string;
  className?: string;
}

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    nickname: 'Primary Business Checking',
    accountNumber: '•••• 8842',
    balance: 142500.00,
    currency: 'USD',
    type: 'Checking',
    nextPaymentAmount: 1250.00,
    nextPaymentDate: '2024-11-15',
    colorTheme: 'indigo'
  },
  {
    id: 'acc-2',
    nickname: 'Global Treasury Savings',
    accountNumber: '•••• 3190',
    balance: 620450.75,
    currency: 'EUR',
    type: 'Savings',
    nextPaymentAmount: 0.00,
    nextPaymentDate: 'N/A',
    colorTheme: 'emerald'
  },
  {
    id: 'acc-3',
    nickname: 'Corporate Platinum Card',
    accountNumber: '•••• 5521',
    balance: 18450.00,
    currency: 'USD',
    type: 'Credit Card',
    nextPaymentAmount: 4500.00,
    nextPaymentDate: '2024-11-10',
    limit: 50000.00,
    colorTheme: 'rose'
  },
  {
    id: 'acc-4',
    nickname: 'UK Operations Wallet',
    accountNumber: '•••• 7741',
    balance: 89300.20,
    currency: 'GBP',
    type: 'Checking',
    nextPaymentAmount: 620.00,
    nextPaymentDate: '2024-11-18',
    colorTheme: 'indigo'
  },
  {
    id: 'acc-5',
    nickname: 'High-Yield Reserve',
    accountNumber: '•••• 9024',
    balance: 1054300.00,
    currency: 'USD',
    type: 'Money Market',
    nextPaymentAmount: 0.00,
    nextPaymentDate: 'N/A',
    colorTheme: 'amber'
  },
  {
    id: 'acc-6',
    nickname: 'Canadian Payroll Fund',
    accountNumber: '•••• 4412',
    balance: 43200.50,
    currency: 'CAD',
    type: 'Checking',
    nextPaymentAmount: 3100.00,
    nextPaymentDate: '2024-11-12',
    colorTheme: 'emerald'
  }
];

const CURRENCY_SYMBOLS: Record<string, string> = {
  USD: '$',
  EUR: '€',
  GBP: '£',
  CAD: 'CA$'
};

export default function SourceAccountList({ 
  onSelectAccount, 
  selectedAccountId: externalSelectedId,
  className = '' 
}: SourceAccountListProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCurrency, setSelectedCurrency] = useState<string>('ALL');
  const [internalSelectedId, setInternalSelectedId] = useState<string | null>(null);

  const activeSelectedId = externalSelectedId !== undefined ? externalSelectedId : internalSelectedId;

  // Filter logic
  const filteredAccounts = useMemo(() => {
    return MOCK_ACCOUNTS.filter(account => {
      const matchesSearch = 
        account.nickname.toLowerCase().includes(searchQuery.toLowerCase()) ||
        account.accountNumber.includes(searchQuery) ||
        account.type.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCurrency = selectedCurrency === 'ALL' || account.currency === selectedCurrency;

      return matchesSearch && matchesCurrency;
    });
  }, [searchQuery, selectedCurrency]);

  const handleSelect = (account: Account) => {
    if (externalSelectedId === undefined) {
      setInternalSelectedId(account.id);
    }
    if (onSelectAccount) {
      onSelectAccount(account);
    }
  };

  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  const getThemeClasses = (theme: string, isSelected: boolean) => {
    const base = "transition-all duration-300 rounded-2xl border p-5 relative overflow-hidden cursor-pointer ";
    if (isSelected) {
      switch (theme) {
        case 'indigo': return base + "bg-slate-900 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-2 ring-indigo-500/20";
        case 'emerald': return base + "bg-slate-900 border-emerald-500 shadow-lg shadow-emerald-500/10 ring-2 ring-emerald-500/20";
        case 'rose': return base + "bg-slate-900 border-rose-500 shadow-lg shadow-rose-500/10 ring-2 ring-rose-500/20";
        case 'amber': return base + "bg-slate-900 border-amber-500 shadow-lg shadow-amber-500/10 ring-2 ring-amber-500/20";
        default: return base + "bg-slate-900 border-slate-500";
      }
    }
    return base + "bg-slate-900/40 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80 shadow-sm";
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'Credit Card': return <CreditCard className="w-5 h-5 text-rose-400" />;
      case 'Savings': return <TrendingUp className="w-5 h-5 text-emerald-400" />;
      case 'Money Market': return <Coins className="w-5 h-5 text-amber-400" />;
      default: return <Wallet className="w-5 h-5 text-indigo-400" />;
    }
  };

  return (
    <div className={`flex flex-col h-full bg-slate-950 text-slate-100 rounded-3xl border border-slate-800/80 overflow-hidden shadow-2xl ${className}`}>
      {/* Header Section */}
      <div className="p-6 border-b border-slate-800/80 bg-slate-900/20 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h2 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              Source Accounts
              <span className="text-xs font-medium px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {filteredAccounts.length} Eligible
              </span>
            </h2>
            <p className="text-sm text-slate-400 mt-1">Select an account to initiate your transaction or view details.</p>
          </div>
          
          {/* Currency Quick Filters */}
          <div className="flex items-center gap-1.5 bg-slate-900 p-1 rounded-xl border border-slate-800">
            {['ALL', 'USD', 'EUR', 'GBP', 'CAD'].map((currency) => (
              <button
                key={currency}
                onClick={() => setSelectedCurrency(currency)}
                className={`px-3 py-1.5 text-xs font-semibold rounded-lg transition-all duration-200 ${
                  selectedCurrency === currency
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/10'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                {currency}
              </button>
            ))}
          </div>
        </div>

        {/* Search Bar */}
        <div className="mt-5 relative">
          <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by nickname, account number, or type..."
            className="block w-full pl-10 pr-10 py-2.5 bg-slate-900/60 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
          />
          {searchQuery && (
            <button 
              onClick={() => setSearchQuery('')}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-slate-400 hover:text-slate-200"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>
      </div>

      {/* Accounts List Grid */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
        {filteredAccounts.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {filteredAccounts.map((account) => {
              const isSelected = activeSelectedId === account.id;
              const hasLimit = account.limit !== undefined;
              const utilizationPercentage = hasLimit 
                ? Math.min((account.balance / (account.limit || 1)) * 100, 100) 
                : 0;

              return (
                <div
                  key={account.id}
                  onClick={() => handleSelect(account)}
                  className={getThemeClasses(account.colorTheme, isSelected)}
                >
                  {/* Selection Indicator */}
                  {isSelected && (
                    <div className="absolute top-4 right-4 z-10">
                      <CheckCircle2 className={`w-5 h-5 ${
                        account.colorTheme === 'indigo' ? 'text-indigo-400' :
                        account.colorTheme === 'emerald' ? 'text-emerald-400' :
                        account.colorTheme === 'rose' ? 'text-rose-400' : 'text-amber-400'
                      }`} />
                    </div>
                  )}

                  {/* Card Header */}
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50`}>
                        {getIcon(account.type)}
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-100 text-sm tracking-wide line-clamp-1">
                          {account.nickname}
                        </h3>
                        <p className="text-xs text-slate-400 font-mono mt-0.5">{account.accountNumber}</p>
                      </div>
                    </div>
                    <span className="text-xs font-medium px-2 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700/50">
                      {account.type}
                    </span>
                  </div>

                  {/* Balance Visualization */}
                  <div className="space-y-2">
                    <div className="flex items-baseline justify-between">
                      <span className="text-xs text-slate-400">Available Balance</span>
                      <span className="text-xs font-mono text-slate-500">{account.currency}</span>
                    </div>
                    <div className="text-2xl font-bold tracking-tight text-white">
                      {formatCurrency(account.balance, account.currency)}
                    </div>

                    {/* Progress Bar Visualization */}
                    {hasLimit ? (
                      <div className="space-y-1.5 pt-1">
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className="bg-rose-500 h-1.5 rounded-full transition-all duration-500" 
                            style={{ width: `${utilizationPercentage}%` }}
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-400">
                          <span>Limit: {formatCurrency(account.limit || 0, account.currency)}</span>
                          <span>{utilizationPercentage.toFixed(0)}% Utilized</span>
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-1.5 pt-1">
                        <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                          <div 
                            className={`h-1.5 rounded-full transition-all duration-500 ${
                              account.colorTheme === 'indigo' ? 'bg-indigo-500' :
                              account.colorTheme === 'emerald' ? 'bg-emerald-500' : 'bg-amber-500'
                            }`}
                            style={{ width: '75%' }} // Visual representation of liquidity allocation
                          />
                        </div>
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Liquidity Allocation</span>
                          <span>Optimal</span>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Card Footer / Next Payment Info */}
                  <div className="mt-5 pt-4 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                    <div className="flex items-center gap-1.5">
                      <Calendar className="w-3.5 h-3.5 text-slate-500" />
                      <span>Next Payment:</span>
                    </div>
                    <div className="text-right">
                      {account.nextPaymentAmount > 0 ? (
                        <span className="font-semibold text-slate-200">
                          {formatCurrency(account.nextPaymentAmount, account.currency)}
                          <span className="text-[10px] text-slate-500 font-normal block">
                            Due {account.nextPaymentDate}
                          </span>
                        </span>
                      ) : (
                        <span className="text-slate-500">No pending payments</span>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          /* Empty State */
          <div className="flex flex-col items-center justify-center py-16 px-4 text-center">
            <div className="p-4 rounded-full bg-slate-900 border border-slate-800 text-slate-500 mb-4">
              <Filter className="w-8 h-8" />
            </div>
            <h3 className="text-lg font-semibold text-slate-200">No accounts found</h3>
            <p className="text-sm text-slate-400 max-w-xs mt-1">
              We couldn't find any eligible source accounts matching your search criteria.
            </p>
            <button
              onClick={() => {
                setSearchQuery('');
                setSelectedCurrency('ALL');
              }}
              className="mt-4 px-4 py-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-semibold rounded-xl text-indigo-400 transition-all duration-200"
            >
              Reset Filters
            </button>
          </div>
        )}
      </div>

      {/* Footer Summary */}
      <div className="p-4 bg-slate-900/40 border-t border-slate-800/80 flex items-center justify-between text-xs text-slate-400">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span>Real-time balances synced</span>
        </div>
        <div className="flex items-center gap-1 hover:text-indigo-400 cursor-pointer transition-colors">
          <span>Manage Accounts</span>
          <ArrowUpRight className="w-3.5 h-3.5" />
        </div>
      </div>
    </div>
  );
}