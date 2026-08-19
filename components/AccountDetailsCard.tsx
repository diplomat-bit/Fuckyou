

// --- CONSOLIDATED FROM: ./components/CitiB2B/AccountDetailsCard.tsx ---

import React, { useState } from 'react';

export type AccountStatus = 'ACTIVE' | 'INACTIVE' | 'CLOSED';
export type BalanceType = 'ASSET' | 'LIABILITY';
export type AccountGroup = 'CHECKING' | 'SAVINGS' | 'CREDITCARD' | 'LOAN' | 'LINEOFCREDIT' | 'BROKERAGE' | 'RETIREMENT';

export interface CheckingAccountDetails {
  accountId: string;
  accountStatus: AccountStatus;
  balanceType: BalanceType;
  currencyCode: string;
  displayAccountNumber: string;
  productName: string;
  accountNickname?: string;
  accountDescription?: string;
  currentBalance?: number;
  availableBalance?: number;
}

export interface SavingsAccountDetails {
  accountId: string;
  accountStatus: AccountStatus;
  balanceType: BalanceType;
  currencyCode: string;
  displayAccountNumber: string;
  productName: string;
  accountNickname?: string;
  accountDescription?: string;
  currentBalance?: number;
  availableBalance?: number;
  maturityDate?: string;
  maturityTerm?: string;
}

export interface CreditCardAccountDetails {
  accountId: string;
  accountStatus: AccountStatus;
  balanceType: BalanceType;
  currencyCode: string;
  displayAccountNumber: string;
  productName: string;
  accountDescription?: string;
  availableCredit?: number;
  creditLimit?: number;
  purchasesAPR?: number;
  minimumDueAmount?: number;
  paymentDueDate?: string;
  currentBalance?: number;
  lastStatementBalance?: number;
  lastStatementDate?: string;
  advancesAPR?: number;
  cashAdvanceLimit?: number;
  cashAdvanceAvailableAmount?: number;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
  ctdPurchaseBalanceAmount?: number;
  purchaseSpendLimitAmount?: number;
  remainingPurchaseSpendAmount?: number;
}

export interface LoanAccountDetails {
  accountId: string;
  balanceType: BalanceType;
  currencyCode: string;
  displayAccountNumber: string;
  productName: string;
  accountDescription?: string;
  accountNickname?: string;
  currentBalanceAmount?: number;
  creditAvailableAmount?: number;
  paymentDueAmount?: number;
  paymentDueDate?: string;
  autoPayFlag?: boolean;
  lastPaymentAmount?: number;
  lastPaymentDate?: string;
}

export interface LineOfCreditAccountDetails {
  accountId: string;
  accountStatus: AccountStatus;
  balanceType: BalanceType;
  currencyCode: string;
  displayAccountNumber: string;
  productName: string;
  accountDescription?: string;
  accountNickname?: string;
  creditAvailableAmount?: number;
  currentBalanceAmount?: number;
  paymentDueAmount?: number;
  lastPaymentAmount?: number;
}

export interface AccountHolding {
  currencyCode: string;
  cusip: string;
  holdingCategory: 'Fixed Income' | 'Cash, Money Funds, Bank Deposits' | 'Mutual Funds' | 'Equities' | 'Others';
  quantity?: number;
  securityName?: string;
  asOfDateTime?: string;
  assetClass?: 'FIXED INCOME' | 'CASH' | 'MUTUAL FUND' | 'EQUITY' | 'OTHER';
  symbol?: string;
  price?: number;
  totalValueAmount?: number;
  changeInPercent?: number;
  changeInPrice?: number;
  changeInValue?: number;
  previousPrice?: number;
}

export interface BrokerageAccountDetails {
  accountId: string;
  accountRegistrationType: string;
  accountTradingCapableFlag: boolean;
  balanceType: BalanceType;
  displayAccountNumber: string;
  productName?: string;
  accountDescription?: string;
  brokerageAccountTransactionTypes?: string[];
  accountHoldings?: AccountHolding[];
  totalPortfolioBalanceAmount?: number;
  currencyCode?: string;
}

export interface RetirementPlanComponent {
  componentName: string;
  currencyCode: string;
  totalValueAmount: number;
  currentTerms?: string;
  interestPaidYTD?: number;
  nextMaturityDate?: string;
}

export interface RetirementAccountDetails {
  accountId: string;
  accountStatus: 'ACTIVE';
  balanceType: BalanceType;
  displayAccountNumber: string;
  productName: string;
  accountDescription?: string;
  accountValue?: number;
  asOfDateTime?: string;
  retirementPlanComponents?: RetirementPlanComponent[];
  currencyCode?: string;
}

export type AccountDetailsCardProps =
  | { group: 'CHECKING'; data: CheckingAccountDetails }
  | { group: 'SAVINGS'; data: SavingsAccountDetails }
  | { group: 'CREDITCARD'; data: CreditCardAccountDetails }
  | { group: 'LOAN'; data: LoanAccountDetails }
  | { group: 'LINEOFCREDIT'; data: LineOfCreditAccountDetails }
  | { group: 'BROKERAGE'; data: BrokerageAccountDetails }
  | { group: 'RETIREMENT'; data: RetirementAccountDetails };

export const AccountDetailsCard: React.FC<AccountDetailsCardProps> = (props) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const { group, data } = props;

  const formatCurrency = (amount: number | undefined, currency: string = 'USD') => {
    if (amount === undefined || amount === null) return '—';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
    }).format(amount);
  };

  const getStatusBadgeColor = (status: AccountStatus | undefined) => {
    switch (status) {
      case 'ACTIVE':
        return 'bg-green-50 text-green-700 border-green-200';
      case 'INACTIVE':
        return 'bg-amber-50 text-amber-700 border-amber-200';
      case 'CLOSED':
        return 'bg-rose-50 text-red-700 border-rose-200';
      default:
        return 'bg-slate-50 text-slate-600 border-slate-200';
    }
  };

  const getBalanceTypeBadgeColor = (type: BalanceType) => {
    return type === 'ASSET'
      ? 'bg-blue-50 text-blue-700 border-blue-200'
      : 'bg-purple-50 text-purple-700 border-purple-200';
  };

  const renderChecking = (acc: CheckingAccountDetails) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Current Balance</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(acc.currentBalance, acc.currencyCode)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Available Balance</p>
          <p className="text-xl font-semibold text-emerald-600">{formatCurrency(acc.availableBalance, acc.currencyCode)}</p>
        </div>
      </div>
      {acc.accountDescription && (
        <p className="text-sm text-slate-600 italic bg-slate-50 p-2.5 rounded-lg">{acc.accountDescription}</p>
      )}
    </div>
  );

  const renderSavings = (acc: SavingsAccountDetails) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Current Balance</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(acc.currentBalance, acc.currencyCode)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Available Balance</p>
          <p className="text-xl font-semibold text-emerald-600">{formatCurrency(acc.availableBalance, acc.currencyCode)}</p>
        </div>
      </div>
      {(acc.maturityDate || acc.maturityTerm) && (
        <div className="grid grid-cols-2 gap-4 bg-slate-50 p-3 rounded-lg text-sm">
          {acc.maturityTerm && (
            <div>
              <span className="text-slate-500 block">Maturity Term</span>
              <span className="font-semibold text-slate-800">{acc.maturityTerm}</span>
            </div>
          )}
          {acc.maturityDate && (
            <div>
              <span className="text-slate-500 block">Maturity Date</span>
              <span className="font-semibold text-slate-800">{acc.maturityDate}</span>
            </div>
          )}
        </div>
      )}
      {acc.accountDescription && (
        <p className="text-sm text-slate-600 italic bg-slate-50 p-2.5 rounded-lg">{acc.accountDescription}</p>
      )}
    </div>
  );

  const renderCreditCard = (acc: CreditCardAccountDetails) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Current Balance Owed</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(acc.currentBalance, acc.currencyCode)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Available Credit</p>
          <p className="text-xl font-semibold text-emerald-600">{formatCurrency(acc.availableCredit, acc.currencyCode)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-slate-500 block">Credit Limit</span>
          <span className="font-semibold text-slate-800">{formatCurrency(acc.creditLimit, acc.currencyCode)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Minimum Due</span>
          <span className="font-semibold text-slate-800 text-rose-600">{formatCurrency(acc.minimumDueAmount, acc.currencyCode)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Payment Due Date</span>
          <span className="font-semibold text-slate-800">{acc.paymentDueDate || '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Purchases APR</span>
          <span className="font-semibold text-slate-800">{acc.purchasesAPR ? `${acc.purchasesAPR}%` : '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Last Statement Balance</span>
          <span className="font-semibold text-slate-800">{formatCurrency(acc.lastStatementBalance, acc.currencyCode)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Last Statement Date</span>
          <span className="font-semibold text-slate-800">{acc.lastStatementDate || '—'}</span>
        </div>
      </div>

      {/* Collapsible Advanced Credit Card Details */}
      <div className="border-t border-slate-100 pt-3">
        <button
          onClick={() => setIsExpanded(!isExpanded)}
          className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 focus:outline-none"
        >
          {isExpanded ? 'Hide Advanced Details' : 'Show Advanced Details'}
          <svg
            className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
          </svg>
        </button>

        {isExpanded && (
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm mt-3 bg-slate-50 p-3 rounded-lg animate-fadeIn">
            <div>
              <span className="text-slate-500 block">Advances APR</span>
              <span className="font-semibold text-slate-800">{acc.advancesAPR ? `${acc.advancesAPR}%` : '—'}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cash Advance Limit</span>
              <span className="font-semibold text-slate-800">{formatCurrency(acc.cashAdvanceLimit, acc.currencyCode)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Cash Advance Available</span>
              <span className="font-semibold text-slate-800">{formatCurrency(acc.cashAdvanceAvailableAmount, acc.currencyCode)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Last Payment Amount</span>
              <span className="font-semibold text-slate-800">{formatCurrency(acc.lastPaymentAmount, acc.currencyCode)}</span>
            </div>
            <div>
              <span className="text-slate-500 block">Last Payment Date</span>
              <span className="font-semibold text-slate-800">{acc.lastPaymentDate || '—'}</span>
            </div>
            {acc.ctdPurchaseBalanceAmount !== undefined && (
              <div>
                <span className="text-slate-500 block">CTD Purchase Balance</span>
                <span className="font-semibold text-slate-800">{formatCurrency(acc.ctdPurchaseBalanceAmount, acc.currencyCode)}</span>
              </div>
            )}
            {acc.purchaseSpendLimitAmount !== undefined && (
              <div>
                <span className="text-slate-500 block">Purchase Spend Limit</span>
                <span className="font-semibold text-slate-800">{formatCurrency(acc.purchaseSpendLimitAmount, acc.currencyCode)}</span>
              </div>
            )}
            {acc.remainingPurchaseSpendAmount !== undefined && (
              <div>
                <span className="text-slate-500 block">Remaining Spend Limit</span>
                <span className="font-semibold text-slate-800">{formatCurrency(acc.remainingPurchaseSpendAmount, acc.currencyCode)}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );

  const renderLoan = (acc: LoanAccountDetails) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Outstanding Balance</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(acc.currentBalanceAmount, acc.currencyCode)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Next Payment Due</p>
          <p className="text-xl font-semibold text-rose-600">{formatCurrency(acc.paymentDueAmount, acc.currencyCode)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
        <div>
          <span className="text-slate-500 block">Payment Due Date</span>
          <span className="font-semibold text-slate-800">{acc.paymentDueDate || '—'}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Auto Pay Status</span>
          <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium mt-1 ${
            acc.autoPayFlag ? 'bg-green-100 text-green-800' : 'bg-slate-100 text-slate-800'
          }`}>
            {acc.autoPayFlag ? 'Enabled' : 'Disabled'}
          </span>
        </div>
        <div>
          <span className="text-slate-500 block">Credit Available</span>
          <span className="font-semibold text-slate-800">{formatCurrency(acc.creditAvailableAmount, acc.currencyCode)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Last Payment Amount</span>
          <span className="font-semibold text-slate-800">{formatCurrency(acc.lastPaymentAmount, acc.currencyCode)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Last Payment Date</span>
          <span className="font-semibold text-slate-800">{acc.lastPaymentDate || '—'}</span>
        </div>
      </div>
    </div>
  );

  const renderLineOfCredit = (acc: LineOfCreditAccountDetails) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Current Balance Owed</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(acc.currentBalanceAmount, acc.currencyCode)}</p>
        </div>
        <div className="text-right">
          <p className="text-sm font-medium text-slate-500">Credit Available</p>
          <p className="text-xl font-semibold text-emerald-600">{formatCurrency(acc.creditAvailableAmount, acc.currencyCode)}</p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4 text-sm">
        <div>
          <span className="text-slate-500 block">Minimum Payment Due</span>
          <span className="font-semibold text-slate-800 text-rose-600">{formatCurrency(acc.paymentDueAmount, acc.currencyCode)}</span>
        </div>
        <div>
          <span className="text-slate-500 block">Last Payment Amount</span>
          <span className="font-semibold text-slate-800">{formatCurrency(acc.lastPaymentAmount, acc.currencyCode)}</span>
        </div>
      </div>
    </div>
  );

  const renderBrokerage = (acc: BrokerageAccountDetails) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Total Portfolio Value</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(acc.totalPortfolioBalanceAmount, acc.currencyCode || 'USD')}</p>
        </div>
        <div className="text-right text-sm">
          <span className="text-slate-500 block">Registration Type</span>
          <span className="font-semibold text-slate-800">{acc.accountRegistrationType}</span>
        </div>
      </div>

      <div className="flex justify-between items-center text-sm bg-slate-50 p-3 rounded-lg">
        <div>
          <span className="text-slate-500">Trading Status: </span>
          <span className={`font-semibold ${acc.accountTradingCapableFlag ? 'text-green-600' : 'text-slate-500'}`}>
            {acc.accountTradingCapableFlag ? 'Trading Capable' : 'View Only'}
          </span>
        </div>
        {acc.brokerageAccountTransactionTypes && acc.brokerageAccountTransactionTypes.length > 0 && (
          <div className="text-xs text-slate-500">
            Types: {acc.brokerageAccountTransactionTypes.join(', ')}
          </div>
        )}
      </div>

      {acc.accountHoldings && acc.accountHoldings.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 focus:outline-none"
          >
            {isExpanded ? 'Hide Holdings' : `View Holdings (${acc.accountHoldings.length})`}
            <svg
              className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 max-h-60 overflow-y-auto pr-1 animate-fadeIn">
              {acc.accountHoldings.map((holding, idx) => (
                <div key={idx} className="bg-slate-50 p-2.5 rounded border border-slate-100 text-xs flex justify-between items-center">
                  <div>
                    <p className="font-semibold text-slate-800">{holding.securityName || 'Unknown Security'}</p>
                    <p className="text-slate-500">
                      {holding.symbol ? `${holding.symbol} • ` : ''}CUSIP: {holding.cusip} • {holding.holdingCategory}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-slate-900">{formatCurrency(holding.totalValueAmount, holding.currencyCode)}</p>
                    <p className="text-slate-500">Qty: {holding.quantity || 0} @ {formatCurrency(holding.price, holding.currencyCode)}</p>
                    {holding.changeInPercent !== undefined && (
                      <span className={`font-medium ${holding.changeInPercent >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        {holding.changeInPercent >= 0 ? '+' : ''}{holding.changeInPercent}%
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const renderRetirement = (acc: RetirementAccountDetails) => (
    <div className="space-y-4">
      <div className="flex justify-between items-baseline border-b border-slate-100 pb-4">
        <div>
          <p className="text-sm font-medium text-slate-500">Total Account Value</p>
          <p className="text-3xl font-bold text-slate-900">{formatCurrency(acc.accountValue, acc.currencyCode || 'USD')}</p>
        </div>
        {acc.asOfDateTime && (
          <div className="text-right text-xs text-slate-400">
            As of: {new Date(acc.asOfDateTime).toLocaleDateString()}
          </div>
        )}
      </div>

      {acc.retirementPlanComponents && acc.retirementPlanComponents.length > 0 && (
        <div className="border-t border-slate-100 pt-3">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-xs font-semibold text-blue-600 hover:text-blue-800 flex items-center gap-1 focus:outline-none"
          >
            {isExpanded ? 'Hide Plan Components' : `View Plan Components (${acc.retirementPlanComponents.length})`}
            <svg
              className={`w-3 h-3 transform transition-transform ${isExpanded ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {isExpanded && (
            <div className="mt-3 space-y-2 animate-fadeIn">
              {acc.retirementPlanComponents.map((comp, idx) => (
                <div key={idx} className="bg-slate-50 p-3 rounded border border-slate-100 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-800">{comp.componentName}</span>
                    <span className="font-bold text-slate-900">{formatCurrency(comp.totalValueAmount, comp.currencyCode)}</span>
                  </div>
                  {(comp.currentTerms || comp.interestPaidYTD !== undefined || comp.nextMaturityDate) && (
                    <div className="grid grid-cols-3 gap-2 text-slate-500 pt-1 border-t border-slate-200/60">
                      {comp.currentTerms && (
                        <div>
                          <span>Terms: </span>
                          <span className="font-medium text-slate-700">{comp.currentTerms}</span>
                        </div>
                      )}
                      {comp.interestPaidYTD !== undefined && (
                        <div>
                          <span>YTD Interest: </span>
                          <span className="font-medium text-slate-700">{formatCurrency(comp.interestPaidYTD, comp.currencyCode)}</span>
                        </div>
                      )}
                      {comp.nextMaturityDate && (
                        <div>
                          <span>Maturity: </span>
                          <span className="font-medium text-slate-700">{comp.nextMaturityDate}</span>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );

  const getAccountStatus = (): AccountStatus | undefined => {
    if (group === 'LOAN') return 'ACTIVE'; // Loans do not explicitly have status in schema, default to ACTIVE
    return (data as any).accountStatus;
  };

  const getNickname = (): string | undefined => {
    return (data as any).accountNickname;
  };

  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm hover:shadow-md transition-shadow duration-200 overflow-hidden max-w-2xl w-full">
      {/* Card Header */}
      <div className="bg-slate-50/50 px-6 py-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-lg font-bold text-slate-800">{data.productName}</h3>
            {getNickname() && (
              <span className="text-xs font-medium text-slate-500 bg-slate-100 px-2 py-0.5 rounded">
                {getNickname()}
              </span>
            )}
          </div>
          <p className="text-xs font-mono text-slate-400 mt-0.5">
            Account: {data.displayAccountNumber}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getStatusBadgeColor(getAccountStatus())}`}>
            {getAccountStatus() || 'ACTIVE'}
          </span>
          <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${getBalanceTypeBadgeColor(data.balanceType)}`}>
            {data.balanceType}
          </span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-6">
        {group === 'CHECKING' && renderChecking(data as CheckingAccountDetails)}
        {group === 'SAVINGS' && renderSavings(data as SavingsAccountDetails)}
        {group === 'CREDITCARD' && renderCreditCard(data as CreditCardAccountDetails)}
        {group === 'LOAN' && renderLoan(data as LoanAccountDetails)}
        {group === 'LINEOFCREDIT' && renderLineOfCredit(data as LineOfCreditAccountDetails)}
        {group === 'BROKERAGE' && renderBrokerage(data as BrokerageAccountDetails)}
        {group === 'RETIREMENT' && renderRetirement(data as RetirementAccountDetails)}
      </div>
    </div>
  );
};