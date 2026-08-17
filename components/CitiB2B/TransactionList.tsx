import React, { useState, useMemo } from 'react';

// ==========================================
// TypeScript Interfaces (Citi OpenAPI Schema)
// ==========================================

export type DebitCreditMemo = 'DEBIT' | 'CREDIT';
export type BuySellIndicatorType = 'BUY' | 'SELL' | 'NONE';

export interface SecurityIdentifier {
  symbol?: string;
  cusip?: string;
}

export interface CheckingAccountTransaction {
  accountId: string;
  checkNumber?: number;
  currencyCode: string;
  debitCreditMemo?: DebitCreditMemo;
  displayAccountNumber?: string;
  transactionAmount: number;
  transactionDate: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionId?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionType?: 'DEPOSIT' | 'PAYMENT' | 'TRANSFER' | 'WITHDRAWAL_OR_DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND_AND_INTEREST' | 'FEES' | 'ADJUSTMENTS' | 'TRANSACTION_VOID' | 'FEE_WAIVED' | 'OTHER';
}

export interface SavingsAccountTransaction {
  accountId: string;
  checkNumber?: number;
  currencyCode: string;
  debitCreditMemo?: DebitCreditMemo;
  displayAccountNumber?: string;
  transactionAmount: number;
  transactionDate: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionId?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionType?: 'DEPOSIT' | 'PAYMENT' | 'TRANSFER' | 'WITHDRAWAL_OR_DEPOSIT' | 'WITHDRAWAL' | 'DIVIDEND_AND_INTEREST' | 'FEES' | 'ADJUSTMENTS' | 'TRANSACTION_VOID' | 'FEE_WAIVED' | 'OTHER';
}

export interface CreditCardAccountTransaction {
  accountId: string;
  currencyCode: string;
  debitCreditMemo?: DebitCreditMemo;
  displayAccountNumber?: string;
  foreignCurrency?: number;
  merchantCategory?: string;
  merchantDescription?: string;
  merchantCountry?: string;
  transactionDate: string;
  transactionPostingDate?: string;
  transactionId?: string;
  transactionAmount: number;
  transactionDescription?: string;
  transactionStatus: 'PENDING' | 'BILLED' | 'UNBILLED' | 'UNPROCESSED_PAYMENTS';
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCES' | 'FEES' | 'INTEREST_CHARGES' | 'ADJUSTMENT' | 'CREDIT';
  memberName?: string;
}

export interface LoanAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  transactionDate: string;
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCE' | 'FEE' | 'INTEREST_CHARGED' | 'PURCHASE_CREDIT' | 'CREDIT';
  transactionAmount: number;
  debitCreditMemo?: DebitCreditMemo;
  transactionId?: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionPostingDate?: string;
  currencyCode: string;
  checkNumber?: string;
}

export interface LineOfCreditAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  transactionDate: string;
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCE' | 'FEE' | 'INTEREST_CHARGED' | 'PURCHASE_CREDIT' | 'CREDIT';
  transactionAmount: number;
  debitCreditMemo?: DebitCreditMemo;
  transactionId?: string;
  transactionDescription?: string;
  transactionDescriptionExtension?: string;
  transactionStatus?: 'PENDING' | 'POSTED';
  transactionPostingDate?: string;
  currencyCode: string;
  checkNumber?: string;
}

export interface BrokerageAccountTransaction {
  accountId: string;
  displayAccountNumber?: string;
  currencyCode: string;
  securityIdentifier?: SecurityIdentifier;
  assetClass?: string;
  assetType?: string;
  buySellIndicator?: BuySellIndicatorType;
  longActivityDescription: string;
  netAmount?: number;
  priceAmount?: number;
  principalAmount?: number;
  quantity?: number;
  settlementDate?: string;
  shortActivityDescription: string;
  tradeNumber?: string;
  tradeTransactionFlag?: string;
  transactionDateTime: string;
  transactionId: string;
  transactionType: 'PAYMENT' | 'PURCHASE' | 'CASH_ADVANCES' | 'FEES' | 'INTEREST_CHARGES' | 'PURCHASE_CREDIT' | 'CREDIT' | 'WITHDRAWAL_OR_DEPOSIT' | 'SECURITY_TRANSACTION' | 'DIVIDEND_AND_INTEREST' | 'OTHER' | 'COMMON_STOCK_TRANSACTION' | 'PREFERRED_STOCK_TRANSACTION' | 'OPTIONS_TRANSACTION' | 'MUTUAL_FUND_TRANSACTION' | 'BOND_TRANSACTION' | 'CERTIFICATE_OF_DEPOSIT_TRANSACTION' | 'ADJUSTMENTS';
}

export interface GetAccountTransactionsResp {
  checkingAccountTransactions?: CheckingAccountTransaction[];
  savingsAccountTransactions?: SavingsAccountTransaction[];
  creditCardAccountTransactions?: CreditCardAccountTransaction[];
  loanAccountTransactions?: LoanAccountTransaction[];
  lineOfCreditAccountTransactions?: LineOfCreditAccountTransaction[];
  brokerageAccountTransactions?: BrokerageAccountTransaction[];
}

// ==========================================
// Normalized Transaction Interface for UI
// ==========================================

export interface NormalizedTransaction {
  id: string;
  category: 'Checking' | 'Savings' | 'Credit Card' | 'Loan' | 'Line of Credit' | 'Brokerage';
  date: string; // YYYY-MM-DD
  amount: number;
  currency: string;
  description: string;
  status: string;
  type: string;
  debitCredit?: 'DEBIT' | 'CREDIT';
  raw: any;
}

// ==========================================
// Mock Data matching OpenAPI Examples
// ==========================================

const MOCK_TRANSACTIONS: GetAccountTransactionsResp = {
  checkingAccountTransactions: [
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      checkNumber: 1007,
      currencyCode: "USD",
      debitCreditMemo: "DEBIT",
      displayAccountNumber: "XXXXX1035",
      transactionAmount: 12.22,
      transactionDate: "2026-03-15",
      transactionDescription: "AUTOMATED PHONE + TRANSFER FROM March 15 10:35 5058",
      transactionDescriptionExtension: "TELEPHONE Reference# 545226",
      transactionId: "0507777777777000001519171200001",
      transactionStatus: "POSTED",
      transactionType: "PAYMENT"
    },
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      debitCreditMemo: "CREDIT",
      displayAccountNumber: "XXXXX1035",
      transactionAmount: 1500.00,
      transactionDate: "2026-03-10",
      transactionDescription: "DIRECT DEPOSIT CITI PAYROLL",
      transactionId: "0507777777777000001519171200002",
      transactionStatus: "POSTED",
      transactionType: "DEPOSIT"
    }
  ],
  savingsAccountTransactions: [
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      debitCreditMemo: "DEBIT",
      displayAccountNumber: "XXXXX1035",
      transactionAmount: 244.22,
      transactionDate: "2026-03-12",
      transactionDescription: "PRE-AUTHORIZED TRANSFER TO CHECKING PLUS",
      transactionDescriptionExtension: "OTHER DECREASE",
      transactionId: "0507777777777000001519171200003",
      transactionStatus: "POSTED",
      transactionType: "TRANSFER"
    }
  ],
  creditCardAccountTransactions: [
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      debitCreditMemo: "DEBIT",
      displayAccountNumber: "XXXXX1035",
      foreignCurrency: 22.16,
      merchantCategory: "4411",
      merchantDescription: "CRUISE LINES",
      merchantCountry: "SAN FRANCISCO CA",
      transactionDate: "2026-03-14",
      transactionPostingDate: "2026-03-15",
      transactionId: "172470002",
      transactionAmount: 50.55,
      transactionDescription: "PRE-AUTHORIZED TRANSFER TO CreditCard",
      transactionStatus: "BILLED",
      transactionType: "PURCHASE",
      memberName: "ISLASHERNANDEZ,WERNER"
    },
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      currencyCode: "USD",
      debitCreditMemo: "CREDIT",
      displayAccountNumber: "XXXXX1035",
      transactionDate: "2026-03-08",
      transactionPostingDate: "2026-03-09",
      transactionId: "172470001",
      transactionAmount: 200.00,
      transactionDescription: "ONLINE PAYMENT THANK YOU",
      transactionStatus: "BILLED",
      transactionType: "PAYMENT"
    }
  ],
  loanAccountTransactions: [
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      displayAccountNumber: "XXXXX1035",
      transactionDate: "2026-03-01",
      transactionType: "PAYMENT",
      transactionAmount: 400.00,
      debitCreditMemo: "CREDIT",
      transactionId: "464684877",
      transactionDescription: "Loan payment for the month of March",
      transactionDescriptionExtension: "TELEPHONE Reference# 545226",
      transactionStatus: "POSTED",
      transactionPostingDate: "2026-03-02",
      currencyCode: "USD",
      checkNumber: "1007"
    }
  ],
  lineOfCreditAccountTransactions: [
    {
      accountId: "da549a7cc86472ee05272c7bd0a4483f57174f2110e7ad961a267995031fda66c6d5475de467a65739750107b621e5a01be7cc0dc085a825fa384795904293f6",
      displayAccountNumber: "XXXXX1035",
      transactionDate: "2026-03-05",
      transactionType: "PURCHASE",
      transactionAmount: 120.00,
      debitCreditMemo: "DEBIT",
      transactionId: "464684878",
      transactionDescription: "Line of Credit Drawdown",
      transactionStatus: "POSTED",
      transactionPostingDate: "2026-03-06",
      currencyCode: "USD"
    }
  ],
  brokerageAccountTransactions: [
    {
      accountId: "c09d172a-d244-4324-bba9-b03b8aa17a76-INV",
      displayAccountNumber: "XXXXX1035",
      currencyCode: "USD",
      securityIdentifier: {
        symbol: "C",
        cusip: "172967GD7"
      },
      assetClass: "CURRENCY",
      assetType: "CORPDEBT",
      buySellIndicator: "SELL",
      longActivityDescription: "Sold 100 Shares of C @ $61.0",
      netAmount: 6100.00,
      priceAmount: 61.00,
      principalAmount: 6100.00,
      quantity: 100,
      settlementDate: "2026-03-18",
      shortActivityDescription: "Shares sold",
      tradeNumber: "2788888886",
      tradeTransactionFlag: "true",
      transactionDateTime: "2026-03-16T14:30:00.000Z",
      transactionId: "7688682459",
      transactionType: "SECURITY_TRANSACTION"
    }
  ]
};

// ==========================================
// Helper Functions
// ==========================================

const normalizeTransactions = (resp: GetAccountTransactionsResp): NormalizedTransaction[] => {
  const list: NormalizedTransaction[] = [];

  resp.checkingAccountTransactions?.forEach((t, index) => {
    list.push({
      id: t.transactionId || `checking-${index}`,
      category: 'Checking',
      date: t.transactionDate,
      amount: t.transactionAmount,
      currency: t.currencyCode,
      description: t.transactionDescription || 'No description',
      status: t.transactionStatus || 'POSTED',
      type: t.transactionType || 'OTHER',
      debitCredit: t.debitCreditMemo,
      raw: t
    });
  });

  resp.savingsAccountTransactions?.forEach((t, index) => {
    list.push({
      id: t.transactionId || `savings-${index}`,
      category: 'Savings',
      date: t.transactionDate,
      amount: t.transactionAmount,
      currency: t.currencyCode,
      description: t.transactionDescription || 'No description',
      status: t.transactionStatus || 'POSTED',
      type: t.transactionType || 'OTHER',
      debitCredit: t.debitCreditMemo,
      raw: t
    });
  });

  resp.creditCardAccountTransactions?.forEach((t, index) => {
    list.push({
      id: t.transactionId || `cc-${index}`,
      category: 'Credit Card',
      date: t.transactionDate,
      amount: t.transactionAmount,
      currency: t.currencyCode,
      description: t.transactionDescription || t.merchantDescription || 'No description',
      status: t.transactionStatus,
      type: t.transactionType,
      debitCredit: t.debitCreditMemo || (t.transactionType === 'PAYMENT' || t.transactionType === 'CREDIT' || t.transactionType === 'ADJUSTMENT' ? 'CREDIT' : 'DEBIT'),
      raw: t
    });
  });

  resp.loanAccountTransactions?.forEach((t, index) => {
    list.push({
      id: t.transactionId || `loan-${index}`,
      category: 'Loan',
      date: t.transactionDate,
      amount: t.transactionAmount,
      currency: t.currencyCode,
      description: t.transactionDescription || 'No description',
      status: t.transactionStatus || 'POSTED',
      type: t.transactionType,
      debitCredit: t.debitCreditMemo,
      raw: t
    });
  });

  resp.lineOfCreditAccountTransactions?.forEach((t, index) => {
    list.push({
      id: t.transactionId || `loc-${index}`,
      category: 'Line of Credit',
      date: t.transactionDate,
      amount: t.transactionAmount,
      currency: t.currencyCode,
      description: t.transactionDescription || 'No description',
      status: t.transactionStatus || 'POSTED',
      type: t.transactionType,
      debitCredit: t.debitCreditMemo,
      raw: t
    });
  });

  resp.brokerageAccountTransactions?.forEach((t, index) => {
    list.push({
      id: t.transactionId || `brokerage-${index}`,
      category: 'Brokerage',
      date: t.transactionDateTime.split('T')[0],
      amount: t.netAmount || t.principalAmount || (t.priceAmount && t.quantity ? t.priceAmount * t.quantity : 0),
      currency: t.currencyCode,
      description: t.longActivityDescription || t.shortActivityDescription || 'No description',
      status: 'POSTED',
      type: t.transactionType,
      debitCredit: t.buySellIndicator === 'SELL' ? 'CREDIT' : t.buySellIndicator === 'BUY' ? 'DEBIT' : undefined,
      raw: t
    });
  });

  return list.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
};

const formatCurrency = (amount: number, currency: string) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currency || 'USD'
  }).format(amount);
};

// ==========================================
// Main Component
// ==========================================

interface TransactionListProps {
  transactions?: GetAccountTransactionsResp;
  onFilterChange?: (filters: {
    startDate: string;
    endDate: string;
    category: string;
    type: string;
    status: string;
  }) => void;
}

export const TransactionList: React.FC<TransactionListProps> = ({
  transactions = MOCK_TRANSACTIONS,
  onFilterChange
}) => {
  // Filter States
  const [startDate, setStartDate] = useState<string>('');
  const [endDate, setEndDate] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [searchQuery, setSearchQuery] = useState<string>('');

  // Detail Modal State
  const [selectedTx, setSelectedTx] = useState<NormalizedTransaction | null>(null);

  // Normalize all transactions
  const allNormalized = useMemo(() => normalizeTransactions(transactions), [transactions]);

  // Extract unique transaction types dynamically based on category
  const availableTypes = useMemo(() => {
    const types = new Set<string>();
    allNormalized.forEach(tx => {
      if (selectedCategory === 'All' || tx.category === selectedCategory) {
        if (tx.type) types.add(tx.type);
      }
    });
    return Array.from(types);
  }, [allNormalized, selectedCategory]);

  // Extract unique statuses dynamically based on category
  const availableStatuses = useMemo(() => {
    const statuses = new Set<string>();
    allNormalized.forEach(tx => {
      if (selectedCategory === 'All' || tx.category === selectedCategory) {
        if (tx.status) statuses.add(tx.status);
      }
    });
    return Array.from(statuses);
  }, [allNormalized, selectedCategory]);

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return allNormalized.filter(tx => {
      // Date Range Filter
      if (startDate && tx.date < startDate) return false;
      if (endDate && tx.date > endDate) return false;

      // Category Filter
      if (selectedCategory !== 'All' && tx.category !== selectedCategory) return false;

      // Transaction Type Filter
      if (selectedType !== 'All' && tx.type !== selectedType) return false;

      // Status Filter
      if (selectedStatus !== 'All' && tx.status !== selectedStatus) return false;

      // Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesDesc = tx.description.toLowerCase().includes(query);
        const matchesId = tx.id.toLowerCase().includes(query);
        const matchesAmount = tx.amount.toString().includes(query);
        if (!matchesDesc && !matchesId && !matchesAmount) return false;
      }

      return true;
    });
  }, [allNormalized, startDate, endDate, selectedCategory, selectedType, selectedStatus, searchQuery]);

  // Summary Metrics
  const summary = useMemo(() => {
    let totalDebits = 0;
    let totalCredits = 0;
    filteredTransactions.forEach(tx => {
      if (tx.debitCredit === 'DEBIT') {
        totalDebits += tx.amount;
      } else if (tx.debitCredit === 'CREDIT') {
        totalCredits += tx.amount;
      } else {
        // Fallback logic if debitCredit is undefined
        if (tx.amount < 0) {
          totalDebits += Math.abs(tx.amount);
        } else {
          totalCredits += tx.amount;
        }
      }
    });
    return {
      debits: totalDebits,
      credits: totalCredits,
      net: totalCredits - totalDebits,
      count: filteredTransactions.length
    };
  }, [filteredTransactions]);

  const handleResetFilters = () => {
    setStartDate('');
    setEndDate('');
    setSelectedCategory('All');
    setSelectedType('All');
    setSelectedStatus('All');
    setSearchQuery('');
  };

  return (
    <div className="w-full max-w-7xl mx-auto p-4 md:p-6 bg-gray-50 min-h-screen text-gray-800 font-sans">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl md:text-3xl font-bold text-gray-900">Citi B2B Account Transactions</h1>
        <p className="text-sm text-gray-500 mt-1">
          Retrieve and analyze transaction data across checking, savings, credit card, loan, line of credit, and brokerage accounts.
        </p>
      </div>

      {/* Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Transactions</div>
          <div className="text-2xl font-bold text-gray-900 mt-1">{summary.count}</div>
          <div className="text-xs text-gray-500 mt-1">Filtered results</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Credits</div>
          <div className="text-2xl font-bold text-emerald-600 mt-1">{formatCurrency(summary.credits, 'USD')}</div>
          <div className="text-xs text-emerald-500 mt-1">Inflow</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Total Debits</div>
          <div className="text-2xl font-bold text-rose-600 mt-1">{formatCurrency(summary.debits, 'USD')}</div>
          <div className="text-xs text-rose-500 mt-1">Outflow</div>
        </div>
        <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
          <div className="text-xs font-semibold text-gray-400 uppercase tracking-wider">Net Cash Flow</div>
          <div className={`text-2xl font-bold mt-1 ${summary.net >= 0 ? 'text-emerald-600' : 'text-rose-600'}`}>
            {formatCurrency(summary.net, 'USD')}
          </div>
          <div className="text-xs text-gray-500 mt-1">Credits - Debits</div>
        </div>
      </div>

      {/* Filter Panel */}
      <div className="bg-white p-4 md:p-6 rounded-xl shadow-sm border border-gray-200 mb-6">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 mb-4 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2">
            <svg className="w-5 h-5 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 4a1 1 0 011-1h16a1 1 0 011 1v2.586a1 1 0 01-.293.707l-6.414 6.414a1 1 0 00-.293.707V17l-4 4v-6.586a1 1 0 00-.293-.707L3.293 7.293A1 1 0 013 6.586V4z" />
            </svg>
            <h2 className="text-lg font-semibold text-gray-900">Filter Transactions</h2>
          </div>
          <button
            onClick={handleResetFilters}
            className="text-sm text-blue-600 hover:text-blue-800 font-medium transition-colors self-start lg:self-auto"
          >
            Reset Filters
          </button>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {/* Search */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">Search</label>
            <input
              type="text"
              placeholder="Search description, ID, amount..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            />
          </div>

          {/* Date Range */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">Date Range</label>
            <div className="flex items-center gap-2">
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
              <span className="text-gray-400 text-xs">to</span>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
              />
            </div>
          </div>

          {/* Category */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">Account Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => {
                setSelectedCategory(e.target.value);
                setSelectedType('All');
                setSelectedStatus('All');
              }}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="All">All Categories</option>
              <option value="Checking">Checking</option>
              <option value="Savings">Savings</option>
              <option value="Credit Card">Credit Card</option>
              <option value="Loan">Loan</option>
              <option value="Line of Credit">Line of Credit</option>
              <option value="Brokerage">Brokerage</option>
            </select>
          </div>

          {/* Transaction Type */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">Transaction Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="All">All Types</option>
              {availableTypes.map(type => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </div>

          {/* Status */}
          <div className="flex flex-col">
            <label className="text-xs font-semibold text-gray-500 mb-1">Status</label>
            <select
              value={selectedStatus}
              onChange={(e) => setSelectedStatus(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm bg-white"
            >
              <option value="All">All Statuses</option>
              {availableStatuses.map(status => (
                <option key={status} value={status}>{status}</option>
              ))}
            </select>
          </div>
        </div>
      </div>

      {/* Transactions Table */}
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50 border-b border-gray-200 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4">Category</th>
                <th className="px-6 py-4">Description</th>
                <th className="px-6 py-4">Type</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4 text-right">Amount</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-sm">
              {filteredTransactions.length > 0 ? (
                filteredTransactions.map((tx) => (
                  <tr
                    key={tx.id}
                    onClick={() => setSelectedTx(tx)}
                    className="hover:bg-blue-50/40 transition-colors cursor-pointer"
                  >
                    <td className="px-6 py-4 whitespace-nowrap text-gray-600 font-medium">
                      {tx.date}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        tx.category === 'Checking' ? 'bg-blue-100 text-blue-800' :
                        tx.category === 'Savings' ? 'bg-indigo-100 text-indigo-800' :
                        tx.category === 'Credit Card' ? 'bg-purple-100 text-purple-800' :
                        tx.category === 'Loan' ? 'bg-amber-100 text-amber-800' :
                        tx.category === 'Line of Credit' ? 'bg-orange-100 text-orange-800' :
                        'bg-teal-100 text-teal-800'
                      }`}>
                        {tx.category}
                      </span>
                    </td>
                    <td className="px-6 py-4 max-w-xs md:max-w-md truncate font-semibold text-gray-900">
                      {tx.description}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-gray-500 text-xs font-mono">
                      {tx.type}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                        tx.status === 'PENDING' ? 'bg-yellow-100 text-yellow-800' :
                        tx.status === 'POSTED' || tx.status === 'BILLED' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                        {tx.status}
                      </span>
                    </td>
                    <td className={`px-6 py-4 whitespace-nowrap text-right font-bold ${
                      tx.debitCredit === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'
                    }`}>
                      {tx.debitCredit === 'CREDIT' ? '+' : '-'}{formatCurrency(tx.amount, tx.currency)}
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                    <svg className="w-12 h-12 mx-auto text-gray-300 mb-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <p className="text-base font-medium">No transactions found</p>
                    <p className="text-xs text-gray-400 mt-1">Try adjusting your filters or search query.</p>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Detail Modal */}
      {selectedTx && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/50 flex items-center justify-center p-4 backdrop-blur-sm">
          <div className="bg-white rounded-2xl shadow-xl max-w-lg w-full overflow-hidden border border-gray-100 animate-in fade-in zoom-in-95 duration-150">
            {/* Modal Header */}
            <div className="px-6 py-4 bg-gray-50 border-b border-gray-100 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                  selectedTx.category === 'Checking' ? 'bg-blue-100 text-blue-800' :
                  selectedTx.category === 'Savings' ? 'bg-indigo-100 text-indigo-800' :
                  selectedTx.category === 'Credit Card' ? 'bg-purple-100 text-purple-800' :
                  selectedTx.category === 'Loan' ? 'bg-amber-100 text-amber-800' :
                  selectedTx.category === 'Line of Credit' ? 'bg-orange-100 text-orange-800' :
                  'bg-teal-100 text-teal-800'
                }`}>
                  {selectedTx.category}
                </span>
                <h3 className="text-lg font-bold text-gray-900">Transaction Details</h3>
              </div>
              <button
                onClick={() => setSelectedTx(null)}
                className="text-gray-400 hover:text-gray-600 transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 space-y-4 max-h-[70vh] overflow-y-auto">
              <div className="text-center pb-4 border-b border-gray-100">
                <div className="text-xs text-gray-400 uppercase font-semibold tracking-wider">Amount</div>
                <div className={`text-3xl font-extrabold mt-1 ${
                  selectedTx.debitCredit === 'CREDIT' ? 'text-emerald-600' : 'text-gray-900'
                }`}>
                  {selectedTx.debitCredit === 'CREDIT' ? '+' : '-'}{formatCurrency(selectedTx.amount, selectedTx.currency)}
                </div>
                <div className="text-sm text-gray-500 mt-1">{selectedTx.description}</div>
              </div>

              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <span className="block text-xs text-gray-400 font-semibold uppercase">Transaction Date</span>
                  <span className="font-medium text-gray-900">{selectedTx.date}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-semibold uppercase">Status</span>
                  <span className="font-medium text-gray-900">{selectedTx.status}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-semibold uppercase">Type</span>
                  <span className="font-medium text-gray-900">{selectedTx.type}</span>
                </div>
                <div>
                  <span className="block text-xs text-gray-400 font-semibold uppercase">Transaction ID</span>
                  <span className="font-mono text-xs text-gray-900 break-all">{selectedTx.id}</span>
                </div>
                {selectedTx.raw.displayAccountNumber && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Account Number</span>
                    <span className="font-medium text-gray-900">{selectedTx.raw.displayAccountNumber}</span>
                  </div>
                )}
                {selectedTx.raw.checkNumber && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Check Number</span>
                    <span className="font-medium text-gray-900">{selectedTx.raw.checkNumber}</span>
                  </div>
                )}
                {selectedTx.raw.merchantCategory && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Merchant Category (MCC)</span>
                    <span className="font-medium text-gray-900">{selectedTx.raw.merchantCategory}</span>
                  </div>
                )}
                {selectedTx.raw.merchantCountry && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Merchant Location</span>
                    <span className="font-medium text-gray-900">{selectedTx.raw.merchantCountry}</span>
                  </div>
                )}
                {selectedTx.raw.memberName && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Authorized User</span>
                    <span className="font-medium text-gray-900">{selectedTx.raw.memberName}</span>
                  </div>
                )}
                {selectedTx.raw.securityIdentifier && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Security Identifier</span>
                    <span className="font-medium text-gray-900">
                      {selectedTx.raw.securityIdentifier.symbol && `Symbol: ${selectedTx.raw.securityIdentifier.symbol}`}
                      {selectedTx.raw.securityIdentifier.cusip && ` (CUSIP: ${selectedTx.raw.securityIdentifier.cusip})`}
                    </span>
                  </div>
                )}
                {selectedTx.raw.quantity && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Quantity</span>
                    <span className="font-medium text-gray-900">{selectedTx.raw.quantity}</span>
                  </div>
                )}
                {selectedTx.raw.priceAmount && (
                  <div>
                    <span className="block text-xs text-gray-400 font-semibold uppercase">Price per Share</span>
                    <span className="font-medium text-gray-900">{formatCurrency(selectedTx.raw.priceAmount, selectedTx.currency)}</span>
                  </div>
                )}
              </div>

              {selectedTx.raw.transactionDescriptionExtension && (
                <div className="pt-4 border-t border-gray-100">
                  <span className="block text-xs text-gray-400 font-semibold uppercase">Additional Info</span>
                  <p className="text-sm text-gray-600 mt-1">{selectedTx.raw.transactionDescriptionExtension}</p>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="px-6 py-4 bg-gray-50 border-t border-gray-100 flex justify-end">
              <button
                onClick={() => setSelectedTx(null)}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};