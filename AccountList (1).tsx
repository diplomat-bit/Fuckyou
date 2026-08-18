import React from 'react';

/**
 * Interface representing a customer's financial account, based on the OpenAPI spec.
 * Only fields relevant for UI display are included here.
 */
export interface CustomerAccount {
  id: string;
  externalId?: string; // Added for Plaid external ID
  name: string;
  institutionName?: string; // Added for institution name
  mask?: string; // Added for last 4 digits of account number
  balance?: number;
  type: string;
  subtype?: string; // Added for account subtype
  status?: string; // Added for account status (e.g., active, frozen)
  customerId: string;
  institutionId: string;
  balanceDate?: number;
  createdDate: number;
  currency: string;
  institutionLoginId: number;
  availableBalance?: number; // Added for available balance
  lastUpdated?: string; // Added for last updated timestamp
}

/**
 * Props for the AccountList component.
 */
interface AccountListProps {
  /** An array of customer accounts to display. */
  accounts: CustomerAccount[];
  /** A boolean to indicate if the account data is currently being fetched. */
  isLoading?: boolean;
  /** An error message string to display if fetching fails. */
  error?: string | null;
  /** Optional callback function to handle when a user selects an account. */
  onAccountSelect?: (accountId: string) => void;
}

/**
 * Formats a number into a currency string.
 * @param amount - The numerical amount.
 * @param currencyCode - The ISO 4217 currency code.
 * @returns A formatted currency string or 'N/A' if amount is undefined.
 */
const formatCurrency = (amount: number | undefined, currencyCode: string): string => {
  if (typeof amount !== 'number') {
    return 'N/A';
  }
  // Use 'en-US' locale for consistent formatting, but allow currency code to vary
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: currencyCode,
  }).format(amount);
};

/**
 * Formats a date string or timestamp into a human-readable date string.
 * @param dateInput - The date string or Unix timestamp in seconds.
 * @returns A formatted date string or 'N/A' if input is invalid.
 */
const formatDate = (dateInput: string | number | undefined): string => {
  if (typeof dateInput === 'undefined') {
    return 'N/A';
  }

  let date: Date;
  if (typeof dateInput === 'number') {
    // Assume timestamp is in seconds, convert to milliseconds
    date = new Date(dateInput * 1000);
  } else {
    // Assume dateInput is a string
    date = new Date(dateInput);
  }

  // Check if the date is valid
  if (isNaN(date.getTime())) {
    return 'N/A';
  }

  return date.toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
};

/**
 * Returns Tailwind CSS classes for styling the account status badge.
 * @param status - The status string of the account.
 * @returns A string of CSS classes.
 */
const getStatusColorClasses = (status: string): string => {
  switch (status?.toLowerCase()) {
    case 'active':
      return 'text-green-800 bg-green-100';
    case 'pending':
      return 'text-yellow-800 bg-yellow-100';
    case 'frozen': // Added case for frozen status
      return 'text-red-800 bg-red-100';
    case 'closed': // Added case for closed status
      return 'text-gray-800 bg-gray-200';
    default:
      return 'text-gray-800 bg-gray-100';
  }
};

/**
 * A UI component that displays a list of a customer's aggregated financial accounts.
 * It handles loading, error, and empty states.
 */
const AccountList: React.FC<AccountListProps> = ({ accounts, isLoading, error, onAccountSelect }) => {
  if (isLoading) {
    return (
      <div className="flex justify-center items-center p-10 bg-gray-50 rounded-lg">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
        <span className="ml-4 text-lg text-gray-600">Loading Accounts...</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-red-100 border-l-4 border-red-500 text-red-700 p-4 rounded-md" role="alert">
        <p className="font-bold">An Error Occurred</p>
        <p>{error}</p>
      </div>
    );
  }

  if (!accounts || accounts.length === 0) {
    return (
      <div className="text-center py-12 px-6 bg-gray-50 rounded-lg border-2 border-dashed border-gray-300">
        <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
          <path vectorEffect="non-scaling-stroke" strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 10h18M3 14h18m-9-4v8m-7 0h14a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
        </svg>
        <h3 className="mt-2 text-lg font-medium text-gray-900">No Linked Accounts</h3>
        <p className="mt-1 text-sm text-gray-500">
          Get started by linking a financial account.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white shadow-sm overflow-hidden sm:rounded-lg">
      <ul role="list" className="divide-y divide-gray-200">
        {accounts.map((account) => (
          <li
            key={account.id}
            onClick={() => onAccountSelect && onAccountSelect(account.id)}
            className={`block transition duration-150 ease-in-out ${onAccountSelect ? 'hover:bg-gray-50 cursor-pointer' : ''}`}
          >
            <div className="px-4 py-4 sm:px-6">
              <div className="flex items-center justify-between">
                <div className="truncate pr-4">
                  <div className="flex items-baseline text-sm">
                    <p className="font-medium text-indigo-600 truncate">{account.name}</p>
                    {account.status && ( // Conditionally render status badge
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ml-3 ${getStatusColorClasses(account.status)}`}>
                        {account.status.charAt(0).toUpperCase() + account.status.slice(1)}
                      </span>
                    )}
                  </div>
                  <div className="mt-2 flex items-center text-sm text-gray-500">
                    {/* Display institution name if available, otherwise account type */}
                    <p className="capitalize">{account.institutionName || account.type.replace(/([A-Z])/g, ' $1')}</p>
                    {/* Display mask if available */}
                    {account.mask && (
                      <>
                        <span className="mx-2" aria-hidden="true">·</span>
                        <p>ending in {account.mask}</p>
                      </>
                    )}
                  </div>
                </div>
                <div className="ml-5 flex-shrink-0 text-right">
                  <p className="text-lg font-semibold text-gray-900">
                    {formatCurrency(account.balance, account.currency)}
                  </p>
                  {/* Display available balance if different from current balance */}
                  {typeof account.availableBalance === 'number' && account.availableBalance !== account.balance && (
                    <p className="text-xs text-gray-500 mt-1">
                      Available: {formatCurrency(account.availableBalance, account.currency)}
                    </p>
                  )}
                  {/* Display last updated date if available */}
                  {account.lastUpdated && (
                    <p className="text-xs text-gray-500 mt-1">
                      Updated: {formatDate(account.lastUpdated)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default AccountList;