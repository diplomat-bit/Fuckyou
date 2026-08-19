

// --- CONSOLIDATED FROM: ./components/CitiB2B/AccountGroupSelector.tsx ---

import React from 'react';

export type AccountGroupType =
  | 'CHECKING'
  | 'SAVINGS'
  | 'CREDITCARD'
  | 'LOAN'
  | 'LINEOFCREDIT'
  | 'BROKERAGE'
  | 'RETIREMENT';

export interface GroupBalance {
  localCurrencyCode?: string;
  localCurrencyBalanceAmount?: number;
}

export interface AccountGroupDetails {
  accountGroup: AccountGroupType;
  checkingAccountsDetails?: any[];
  savingsAccountsDetails?: any[];
  creditCardAccountsDetails?: any[];
  loanAccountsDetails?: any[];
  lineOfCreditAccountsDetails?: any[];
  brokerageAccountsDetails?: any[];
  retirementAccountsDetails?: any[];
  totalCurrentBalance?: GroupBalance;
  totalAvailableBalance?: GroupBalance;
}

interface AccountGroupSelectorProps {
  groups: AccountGroupDetails[];
  selectedGroup: AccountGroupType | 'ALL';
  onSelectGroup: (group: AccountGroupType | 'ALL') => void;
}

const groupConfig: Record<
  AccountGroupType | 'ALL',
  {
    label: string;
    colorClass: string;
    activeColorClass: string;
    icon: React.ReactNode;
  }
> = {
  ALL: {
    label: 'All Accounts',
    colorClass: 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white',
    activeColorClass: 'border-slate-600 bg-slate-50 ring-2 ring-slate-600 ring-offset-2 text-slate-900',
    icon: (
      <svg className="w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" />
      </svg>
    ),
  },
  CHECKING: {
    label: 'Checking',
    colorClass: 'border-blue-100 hover:border-blue-200 text-blue-700 bg-white',
    activeColorClass: 'border-blue-600 bg-blue-50 ring-2 ring-blue-600 ring-offset-2 text-blue-900',
    icon: (
      <svg className="w-5 h-5 text-blue-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
      </svg>
    ),
  },
  SAVINGS: {
    label: 'Savings',
    colorClass: 'border-green-100 hover:border-green-200 text-green-700 bg-white',
    activeColorClass: 'border-green-600 bg-green-50 ring-2 ring-green-600 ring-offset-2 text-green-900',
    icon: (
      <svg className="w-5 h-5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  CREDITCARD: {
    label: 'Credit Card',
    colorClass: 'border-purple-100 hover:border-purple-200 text-purple-700 bg-white',
    activeColorClass: 'border-purple-600 bg-purple-50 ring-2 ring-purple-600 ring-offset-2 text-purple-900',
    icon: (
      <svg className="w-5 h-5 text-purple-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z" />
      </svg>
    ),
  },
  LOAN: {
    label: 'Loans',
    colorClass: 'border-amber-100 hover:border-amber-200 text-amber-700 bg-white',
    activeColorClass: 'border-amber-600 bg-amber-50 ring-2 ring-amber-600 ring-offset-2 text-amber-900',
    icon: (
      <svg className="w-5 h-5 text-amber-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
  },
  LINEOFCREDIT: {
    label: 'Line of Credit',
    colorClass: 'border-indigo-100 hover:border-indigo-200 text-indigo-700 bg-white',
    activeColorClass: 'border-indigo-600 bg-indigo-50 ring-2 ring-indigo-600 ring-offset-2 text-indigo-900',
    icon: (
      <svg className="w-5 h-5 text-indigo-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
      </svg>
    ),
  },
  BROKERAGE: {
    label: 'Brokerage',
    colorClass: 'border-teal-100 hover:border-teal-200 text-teal-700 bg-white',
    activeColorClass: 'border-teal-600 bg-teal-50 ring-2 ring-teal-600 ring-offset-2 text-teal-900',
    icon: (
      <svg className="w-5 h-5 text-teal-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 12l3-3 3 3 4-4M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />
      </svg>
    ),
  },
  RETIREMENT: {
    label: 'Retirement',
    colorClass: 'border-rose-100 hover:border-rose-200 text-rose-700 bg-white',
    activeColorClass: 'border-rose-600 bg-rose-50 ring-2 ring-rose-600 ring-offset-2 text-rose-900',
    icon: (
      <svg className="w-5 h-5 text-rose-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
      </svg>
    ),
  },
};

export const AccountGroupSelector: React.FC<AccountGroupSelectorProps> = ({
  groups = [],
  selectedGroup,
  onSelectGroup,
}) => {
  const formatCurrency = (amount?: number, currencyCode?: string) => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currencyCode || 'USD',
    }).format(amount);
  };

  const getAccountCount = (group: AccountGroupDetails): number => {
    switch (group.accountGroup) {
      case 'CHECKING':
        return group.checkingAccountsDetails?.length || 0;
      case 'SAVINGS':
        return group.savingsAccountsDetails?.length || 0;
      case 'CREDITCARD':
        return group.creditCardAccountsDetails?.length || 0;
      case 'LOAN':
        return group.loanAccountsDetails?.length || 0;
      case 'LINEOFCREDIT':
        return group.lineOfCreditAccountsDetails?.length || 0;
      case 'BROKERAGE':
        return group.brokerageAccountsDetails?.length || 0;
      case 'RETIREMENT':
        return group.retirementAccountsDetails?.length || 0;
      default:
        return 0;
    }
  };

  // Calculate totals for the "ALL" card
  const totalAccountsCount = groups.reduce((sum, g) => sum + getAccountCount(g), 0);
  const totalCurrentBalanceAmount = groups.reduce(
    (sum, g) => sum + (g.totalCurrentBalance?.localCurrencyBalanceAmount || 0),
    0
  );
  const totalAvailableBalanceAmount = groups.reduce(
    (sum, g) => sum + (g.totalAvailableBalance?.localCurrencyBalanceAmount || 0),
    0
  );
  const commonCurrencyCode = groups[0]?.totalCurrentBalance?.localCurrencyCode || 'USD';

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold text-slate-900">Filter by Account Type</h2>
        <span className="text-xs text-slate-500 font-medium">
          {totalAccountsCount} Total {totalAccountsCount === 1 ? 'Account' : 'Accounts'}
        </span>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* "ALL" Accounts Card */}
        <button
          onClick={() => onSelectGroup('ALL')}
          className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
            selectedGroup === 'ALL' ? groupConfig.ALL.activeColorClass : groupConfig.ALL.colorClass
          }`}
        >
          <div className="flex items-start justify-between w-full mb-3">
            <div className="p-2 rounded-lg bg-slate-100">
              {groupConfig.ALL.icon}
            </div>
            <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
              {totalAccountsCount}
            </span>
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">{groupConfig.ALL.label}</h3>
            <div className="mt-2 space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Current:</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(totalCurrentBalanceAmount, commonCurrencyCode)}
                </span>
              </div>
              <div className="flex justify-between text-xs">
                <span className="text-slate-500">Total Available:</span>
                <span className="font-medium text-slate-900">
                  {formatCurrency(totalAvailableBalanceAmount, commonCurrencyCode)}
                </span>
              </div>
            </div>
          </div>
        </button>

        {/* Dynamic Group Cards */}
        {groups.map((group) => {
          const type = group.accountGroup;
          const config = groupConfig[type] || {
            label: type,
            colorClass: 'border-slate-200 hover:border-slate-300 text-slate-700 bg-white',
            activeColorClass: 'border-slate-600 bg-slate-50 ring-2 ring-slate-600 ring-offset-2 text-slate-900',
            icon: null,
          };
          const count = getAccountCount(group);
          const isSelected = selectedGroup === type;

          return (
            <button
              key={type}
              onClick={() => onSelectGroup(type)}
              className={`flex flex-col justify-between p-4 rounded-xl border text-left transition-all duration-200 ${
                isSelected ? config.activeColorClass : config.colorClass
              }`}
            >
              <div className="flex items-start justify-between w-full mb-3">
                <div className="p-2 rounded-lg bg-slate-50">
                  {config.icon}
                </div>
                <span className="text-xs font-semibold px-2 py-1 rounded-full bg-slate-100 text-slate-600">
                  {count}
                </span>
              </div>
              <div className="w-full">
                <h3 className="text-sm font-semibold text-slate-900">{config.label}</h3>
                <div className="mt-2 space-y-1">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-500">Current:</span>
                    <span className="font-medium text-slate-900">
                      {formatCurrency(
                        group.totalCurrentBalance?.localCurrencyBalanceAmount,
                        group.totalCurrentBalance?.localCurrencyCode
                      )}
                    </span>
                  </div>
                  {group.totalAvailableBalance && (
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-500">Available:</span>
                      <span className="font-medium text-slate-900">
                        {formatCurrency(
                          group.totalAvailableBalance?.localCurrencyBalanceAmount,
                          group.totalAvailableBalance?.localCurrencyCode
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            </button>
          );
        })}
      </div>
    </div>
  );
};