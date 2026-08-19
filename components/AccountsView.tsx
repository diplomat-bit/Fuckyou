import React, { useState, useEffect } from 'react';

/**
 * QUANTUM FINANCIAL - ELITE BUSINESS BANKING DEMO
 * CORE ACCOUNT VIEW
 */

// --- TYPES & INTERFACES ---

export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  currency: string;
  status: 'active' | 'frozen' | 'pending';
  type: 'checking' | 'savings' | 'treasury' | 'investment';
  customerId: string;
  institutionId: string;
  institutionLoginId: number;
  createdDate: number;
  balanceDate: number;
  routingNumber: string;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
  status: 'completed' | 'pending' | 'flagged';
  reference: string;
}

// --- MOCK DATA ---

const MOCK_ACCOUNTS: CustomerAccount[] = [
  { id: 'qf-001', name: 'Global Operating Account', accountNumberDisplay: '...9921', balance: 2450000.75, currency: 'USD', status: 'active', type: 'checking', customerId: 'corp-77', institutionId: 'qf-main', institutionLoginId: 101, createdDate: 1609459200, balanceDate: Date.now(), routingNumber: '021000021' },
  { id: 'qf-002', name: 'Strategic Reserve (Treasury)', accountNumberDisplay: '...4432', balance: 15750000.00, currency: 'USD', status: 'active', type: 'treasury', customerId: 'corp-77', institutionId: 'qf-main', institutionLoginId: 101, createdDate: 1612137600, balanceDate: Date.now(), routingNumber: '021000021' },
  { id: 'qf-003', name: 'Euro Liquidity Pool', accountNumberDisplay: '...1109', balance: 850000.00, currency: 'EUR', status: 'active', type: 'checking', customerId: 'corp-77', institutionId: 'qf-main', institutionLoginId: 101, createdDate: 1622505600, balanceDate: Date.now(), routingNumber: '021000021' },
];

const MOCK_TRANSACTIONS: Transaction[] = [
  { id: 'tx-101', amount: -12500.00, date: '2023-11-01', description: 'AWS Cloud Infrastructure', category: 'Technology', type: 'debit', status: 'completed', reference: 'REF-99281' },
  { id: 'tx-102', amount: 450000.00, date: '2023-10-31', description: 'Inbound Wire: Global Sales', category: 'Revenue', type: 'credit', status: 'completed', reference: 'REF-99282' },
  { id: 'tx-103', amount: -5400.50, date: '2023-10-30', description: 'Corporate Travel - Amex', category: 'Operations', type: 'debit', status: 'completed', reference: 'REF-99283' },
  { id: 'tx-104', amount: -250000.00, date: '2023-10-29', description: 'Payroll Disbursement', category: 'Human Resources', type: 'debit', status: 'flagged', reference: 'REF-99284' },
];

// --- SUB-COMPONENTS ---

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
  <div className="flex flex-col items-center justify-center p-12">
    <div className="relative">
      <div className="w-16 h-16 border-4 border-cyan-900/30 rounded-full"></div>
      <div className="absolute top-0 left-0 w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin"></div>
    </div>
    {text && <p className="mt-4 text-cyan-500 font-medium animate-pulse uppercase tracking-widest text-xs">{text}</p>}
  </div>
);

// --- MAIN VIEW COMPONENT ---

const AccountsView: React.FC = () => {
  const [accounts] = useState<CustomerAccount[]>(MOCK_ACCOUNTS);
  const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(MOCK_ACCOUNTS[0]);
  const [transactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const init = async () => {
      await new Promise(r => setTimeout(r, 800));
      setIsLoading(false);
    };
    init();
  }, []);

  if (isLoading) return (
    <div className="min-h-screen bg-[#05070a] flex items-center justify-center">
      <LoadingSpinner text="Loading Account Data..." />
    </div>
  );

  return (
    <div className="min-h-screen bg-[#05070a] text-gray-300 font-sans selection:bg-cyan-500/30">
      
      <nav className="border-b border-gray-800 bg-gray-900/50 backdrop-blur-md sticky top-0 z-40">
        <div className="max-w-[1600px] mx-auto px-6 h-20 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-xl flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-xl">Q</span>
            </div>
            <div>
              <h1 className="text-white font-bold tracking-tighter text-lg leading-none">QUANTUM</h1>
              <p className="text-[10px] text-cyan-500 font-bold tracking-[0.2em] uppercase">Financial Accounts</p>
            </div>
          </div>
        </div>
      </nav>

      <main className="max-w-[1600px] mx-auto p-6 grid grid-cols-12 gap-6">
        
        <div className="col-span-12 lg:col-span-4 space-y-6">
          <section className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-5 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Accounts</h3>
            </div>
            <div className="p-2 space-y-1">
              {accounts.map(acc => (
                <button 
                  key={acc.id}
                  onClick={() => setSelectedAccount(acc)}
                  className={`w-full text-left p-4 rounded-xl transition-all ${selectedAccount?.id === acc.id ? 'bg-cyan-600/10 border border-cyan-500/30' : 'hover:bg-gray-800/50 border border-transparent'}`}
                >
                  <div className="text-white font-bold truncate">{acc.name}</div>
                  <div className="mt-2 text-xl font-mono font-bold text-white">
                    {acc.currency === 'EUR' ? '€' : '$'}{acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </div>
                </button>
              ))}
            </div>
          </section>
        </div>

        <div className="col-span-12 lg:col-span-8 space-y-6">
          {selectedAccount && (
            <section className="bg-gradient-to-br from-gray-900 to-black border border-gray-800 rounded-3xl p-8 shadow-2xl">
              <h2 className="text-3xl font-black text-white mb-2">{selectedAccount.name}</h2>
              <div className="flex items-baseline gap-3">
                <span className="text-4xl font-mono font-bold text-white">
                  {selectedAccount.currency === 'EUR' ? '€' : '$'}{selectedAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </span>
              </div>
            </section>
          )}

          <section className="bg-gray-900 border border-gray-800 rounded-2xl overflow-hidden shadow-xl">
            <div className="p-6 border-b border-gray-800">
              <h3 className="text-sm font-bold text-white uppercase tracking-widest">Transaction Ledger</h3>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-black/20">
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Date</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest">Description</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase tracking-widest text-right">Amount</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-800">
                  {transactions.map(tx => (
                    <tr key={tx.id} className="hover:bg-white/[0.02]">
                      <td className="p-4 text-xs font-mono text-gray-500">{tx.date}</td>
                      <td className="p-4 text-sm font-bold text-white">{tx.description}</td>
                      <td className={`p-4 text-right font-mono font-bold ${tx.type === 'credit' ? 'text-green-500' : 'text-white'}`}>
                        {tx.type === 'credit' ? '+' : '-'}{Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>
        </div>
      </main>

      <footer className="fixed bottom-0 w-full bg-gray-900/80 backdrop-blur-md border-t border-gray-800 px-6 py-2 flex justify-between items-center">
        <div className="text-[9px] font-bold text-gray-600 uppercase tracking-[0.3em]">
          Quantum Financial Account View
        </div>
      </footer>
    </div>
  );
};

export default AccountsView;

// --- CONSOLIDATED FROM: AccountsView_1.tsx ---


import React, { useState, useEffect, useCallback } from 'react';
import AccountList from './AccountList';
import AccountDetails from './AccountDetails';
import TransactionList from './TransactionList'; // Assuming TransactionList is available or we create a mock

// Mock Data Types
export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  currency: string;
  status: string;
  type: string;
  customerId: string;
  institutionId: string;
  institutionLoginId: number;
  createdDate: number;
  balanceDate: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
}

// Mock Data
const MOCK_ACCOUNTS: CustomerAccount[] = [
    { id: '1', name: 'Main Checking', accountNumberDisplay: '...1234', balance: 12500.50, currency: 'USD', status: 'active', type: 'checking', customerId: 'c1', institutionId: 'i1', institutionLoginId: 1, createdDate: 1625097600, balanceDate: 1679000000 },
    { id: '2', name: 'Savings', accountNumberDisplay: '...5678', balance: 50000.00, currency: 'USD', status: 'active', type: 'savings', customerId: 'c1', institutionId: 'i1', institutionLoginId: 1, createdDate: 1625097600, balanceDate: 1679000000 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', amount: -50.00, date: '2023-10-27', description: 'Grocery Store', category: 'Food', type: 'debit' },
    { id: 't2', amount: 1500.00, date: '2023-10-26', description: 'Paycheck', category: 'Income', type: 'credit' },
    { id: 't3', amount: -120.00, date: '2023-10-25', description: 'Electric Bill', category: 'Utilities', type: 'debit' },
];

// Self-Contained Sub-Components

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
        {text && <p className="text-gray-400">{text}</p>}
    </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-2">{message}</p>
        {onRetry && <button onClick={onRetry} className="text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition">Retry</button>}
    </div>
);

const PageHeader: React.FC<{ title: string; subtitle?: string; buttonText?: string; onButtonClick?: () => void }> = ({ title, subtitle, buttonText, onButtonClick }) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {buttonText && onButtonClick && (
            <button onClick={onButtonClick} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition shadow-lg">
                {buttonText}
            </button>
        )}
    </div>
);


const AccountsView: React.FC = () => {
    const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [accountsError, setAccountsError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);

    useEffect(() => {
        // Simulate fetching accounts
        const fetchAccounts = async () => {
            setIsLoadingAccounts(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                setAccounts(MOCK_ACCOUNTS);
                if (MOCK_ACCOUNTS.length > 0) setSelectedAccount(MOCK_ACCOUNTS[0]);
            } catch (err) {
                setAccountsError("Failed to load accounts.");
            } finally {
                setIsLoadingAccounts(false);
            }
        };
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            setIsLoadingTransactions(true);
            // Simulate fetching transactions
            setTimeout(() => {
                setTransactions(MOCK_TRANSACTIONS);
                setIsLoadingTransactions(false);
            }, 600);
        }
    }, [selectedAccount]);

    const handleSelectAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (account) setSelectedAccount(account);
    };

    if (isLoadingAccounts) return <LoadingSpinner text="Loading financial accounts..." />;
    if (accountsError) return <ErrorMessage message={accountsError} onRetry={() => window.location.reload()} />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader 
                title="Accounts Overview" 
                subtitle="Manage your connected financial institutions."
                buttonText="Link New Account"
                onButtonClick={() => alert("Link flow initiated.")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Account List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Accounts</h3>
                        <AccountList accounts={accounts} onAccountSelect={handleSelectAccount} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedAccount ? (
                        <>
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <AccountDetails accountId={selectedAccount.id} customerId={selectedAccount.customerId} />
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                                {isLoadingTransactions ? (
                                    <LoadingSpinner />
                                ) : (
                                    <TransactionList transactions={transactions} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl border border-gray-700 text-gray-500">
                            Select an account to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsView;


// --- CONSOLIDATED FROM: AccountsView (1).tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import AccountList from './AccountList';
import AccountDetails from './AccountDetails';
import TransactionList from './TransactionList'; // Assuming TransactionList is available

// Data Types
export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  currency: string;
  status: string;
  type: string;
  customerId: string;
  institutionId: string;
  institutionLoginId: number;
  createdDate: number;
  balanceDate: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
}

// --- Internal Generative-Data Functions ---

const generateRandomString = (length: number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateAccounts = (count: number): CustomerAccount[] => {
    const accountTypes = ['Checking', 'Savings', 'Investment', 'Credit Card', 'Loan'];
    const accountNames = ['Main', 'Primary', 'Growth', 'College Fund', 'Rainy Day'];
    
    return Array.from({ length: count }, () => {
        const type = accountTypes[Math.floor(Math.random() * accountTypes.length)];
        const name = `${accountNames[Math.floor(Math.random() * accountNames.length)]} ${type}`;
        return {
            id: generateRandomString(10),
            accountNumberDisplay: '...' + Math.floor(1000 + Math.random() * 9000),
            name: name,
            balance: parseFloat((Math.random() * 50000 + 500).toFixed(2)),
            currency: 'USD',
            status: 'active',
            type: type.toLowerCase().replace(' ', ''),
            customerId: `c-${generateRandomString(4)}`,
            institutionId: `i-${generateRandomString(4)}`,
            institutionLoginId: Math.floor(Math.random() * 100),
            createdDate: Date.now() - Math.floor(Math.random() * 31536000000), // up to a year ago
            balanceDate: Date.now(),
        };
    });
};

const generateTransactions = (count: number): Transaction[] => {
    const descriptions = [
        'Grocery Store', 'Paycheck', 'Electric Bill', 'Amazon.com', 'Netflix', 'Gas Station', 'Restaurant', 'Online Transfer'
    ];
    const categories = [
        'Food', 'Income', 'Utilities', 'Shopping', 'Entertainment', 'Transport', 'Dining', 'Transfers'
    ];

    return Array.from({ length: count }, () => {
        const isCredit = Math.random() > 0.7;
        const amount = isCredit 
            ? parseFloat((Math.random() * 2000 + 500).toFixed(2))
            : parseFloat((-1 * (Math.random() * 200 + 5)).toFixed(2));
        
        const date = new Date(Date.now() - Math.floor(Math.random() * 2592000000)); // up to 30 days ago
        
        const descIndex = Math.floor(Math.random() * descriptions.length);

        return {
            id: generateRandomString(12),
            amount: amount,
            date: date.toISOString().split('T')[0],
            description: descriptions[descIndex],
            category: categories[descIndex],
            type: isCredit ? 'credit' : 'debit',
        };
    });
};


// --- Self-Contained Sub-Components ---

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
        {text && <p className="text-gray-400">{text}</p>}
    </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-2">{message}</p>
        {onRetry && <button onClick={onRetry} className="text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition">Retry</button>}
    </div>
);

const PageHeader: React.FC<{ title: string; subtitle?: string; buttonText?: string; onButtonClick?: () => void }> = ({ title, subtitle, buttonText, onButtonClick }) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {buttonText && onButtonClick && (
            <button onClick={onButtonClick} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition shadow-lg">
                {buttonText}
            </button>
        )}
    </div>
);


const AccountsView: React.FC = () => {
    const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [accountsError, setAccountsError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);

    const fetchAccounts = useCallback(async () => {
        setIsLoadingAccounts(true);
        setAccountsError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            const generatedAccounts = generateAccounts(Math.floor(Math.random() * 5) + 2); // Generate 2-6 accounts
            if (generatedAccounts.length === 0) {
                // This branch is theoretically unreachable due to Math.floor(Math.random() * 5) + 2 always being >= 2
                // but kept for robustness as a general error handling pattern.
                throw new Error("No accounts found for this profile.");
            }
            setAccounts(generatedAccounts);
            setSelectedAccount(generatedAccounts[0]);
        } catch (err) {
            setAccountsError(err instanceof Error ? err.message : "Failed to load accounts.");
        } finally {
            setIsLoadingAccounts(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (selectedAccount) {
                setIsLoadingTransactions(true);
                try {
                    await new Promise(resolve => setTimeout(resolve, 600));
                    const generatedTransactions = generateTransactions(Math.floor(Math.random() * 15) + 5);
                    setTransactions(generatedTransactions);
                } finally {
                    setIsLoadingTransactions(false);
                }
            } else {
                // Clear transactions if no account is selected
                setTransactions([]);
            }
        };
        fetchTransactions();
    }, [selectedAccount]);

    const handleSelectAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (account) {
            setSelectedAccount(account);
        } else {
            // Optionally handle case where accountId is not found (e.g., log error, deselect current)
            // For now, if not found, it just won't update selectedAccount.
        }
    };

    if (isLoadingAccounts) return <LoadingSpinner text="Loading financial accounts..." />;
    if (accountsError) return <ErrorMessage message={accountsError} onRetry={fetchAccounts} />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader 
                title="Citibankdemobusinessinc Accounts" 
                subtitle="Unified view of your financial ecosystem."
                buttonText="Link New Account"
                onButtonClick={() => alert("Link flow initiated.")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Account List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Accounts</h3>
                        <AccountList accounts={accounts} onAccountSelect={handleSelectAccount} selectedAccountId={selectedAccount?.id} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedAccount ? (
                        <>
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                {/* Assuming AccountDetails component takes accountId and customerId for internal logic or simple display.
                                    If it needs the full account object, the prop should be `account={selectedAccount}`
                                    and AccountDetails.tsx would need to be updated accordingly.
                                    Sticking to the original interpretation of props for this file. */}
                                <AccountDetails accountId={selectedAccount.id} customerId={selectedAccount.customerId} />
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                                {isLoadingTransactions ? (
                                    <LoadingSpinner />
                                ) : (
                                    <TransactionList transactions={transactions} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl border border-gray-700 text-gray-500">
                            Select an account to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsView;

// --- CONSOLIDATED FROM: AccountsView (1)_1.tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import AccountList from './AccountList';
import AccountDetails from './AccountDetails';
import TransactionList from './TransactionList'; // Assuming TransactionList is available

// Data Types
export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  currency: string;
  status: string;
  type: string;
  customerId: string;
  institutionId: string;
  institutionLoginId: number;
  createdDate: number;
  balanceDate: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
}

// --- Internal Generative-Data Functions ---

const generateRandomString = (length: number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateAccounts = (count: number): CustomerAccount[] => {
    const accountTypes = ['Checking', 'Savings', 'Investment', 'Credit Card', 'Loan'];
    const accountNames = ['Main', 'Primary', 'Growth', 'College Fund', 'Rainy Day'];
    
    return Array.from({ length: count }, () => {
        const type = accountTypes[Math.floor(Math.random() * accountTypes.length)];
        const name = `${accountNames[Math.floor(Math.random() * accountNames.length)]} ${type}`;
        return {
            id: generateRandomString(10),
            accountNumberDisplay: '...' + Math.floor(1000 + Math.random() * 9000),
            name: name,
            balance: parseFloat((Math.random() * 50000 + 500).toFixed(2)),
            currency: 'USD',
            status: 'active',
            type: type.toLowerCase().replace(' ', ''),
            customerId: `c-${generateRandomString(4)}`,
            institutionId: `i-${generateRandomString(4)}`,
            institutionLoginId: Math.floor(Math.random() * 100),
            createdDate: Date.now() - Math.floor(Math.random() * 31536000000), // up to a year ago
            balanceDate: Date.now(),
        };
    });
};

const generateTransactions = (count: number): Transaction[] => {
    const descriptions = [
        'Grocery Store', 'Paycheck', 'Electric Bill', 'Amazon.com', 'Netflix', 'Gas Station', 'Restaurant', 'Online Transfer'
    ];
    const categories = [
        'Food', 'Income', 'Utilities', 'Shopping', 'Entertainment', 'Transport', 'Dining', 'Transfers'
    ];

    return Array.from({ length: count }, () => {
        const isCredit = Math.random() > 0.7;
        const amount = isCredit 
            ? parseFloat((Math.random() * 2000 + 500).toFixed(2))
            : parseFloat((-1 * (Math.random() * 200 + 5)).toFixed(2));
        
        const date = new Date(Date.now() - Math.floor(Math.random() * 2592000000)); // up to 30 days ago
        
        const descIndex = Math.floor(Math.random() * descriptions.length);

        return {
            id: generateRandomString(12),
            amount: amount,
            date: date.toISOString().split('T')[0],
            description: descriptions[descIndex],
            category: categories[descIndex],
            type: isCredit ? 'credit' : 'debit',
        };
    });
};


// --- Self-Contained Sub-Components ---

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
        {text && <p className="text-gray-400">{text}</p>}
    </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-2">{message}</p>
        {onRetry && <button onClick={onRetry} className="text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition">Retry</button>}
    </div>
);

const PageHeader: React.FC<{ title: string; subtitle?: string; buttonText?: string; onButtonClick?: () => void }> = ({ title, subtitle, buttonText, onButtonClick }) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {buttonText && onButtonClick && (
            <button onClick={onButtonClick} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition shadow-lg">
                {buttonText}
            </button>
        )}
    </div>
);


const AccountsView: React.FC = () => {
    const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [accountsError, setAccountsError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);

    const fetchAccounts = useCallback(async () => {
        setIsLoadingAccounts(true);
        setAccountsError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            const generatedAccounts = generateAccounts(Math.floor(Math.random() * 5) + 2); // Generate 2-6 accounts
            if (generatedAccounts.length === 0) {
                throw new Error("No accounts found for this profile.");
            }
            setAccounts(generatedAccounts);
            setSelectedAccount(generatedAccounts[0]);
        } catch (err) {
            setAccountsError(err instanceof Error ? err.message : "Failed to load accounts.");
        } finally {
            setIsLoadingAccounts(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (selectedAccount) {
                setIsLoadingTransactions(true);
                try {
                    await new Promise(resolve => setTimeout(resolve, 600));
                    const generatedTransactions = generateTransactions(Math.floor(Math.random() * 15) + 5);
                    setTransactions(generatedTransactions);
                } finally {
                    setIsLoadingTransactions(false);
                }
            }
        };
        fetchTransactions();
    }, [selectedAccount]);

    const handleSelectAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (account) setSelectedAccount(account);
    };

    if (isLoadingAccounts) return <LoadingSpinner text="Loading financial accounts..." />;
    if (accountsError) return <ErrorMessage message={accountsError} onRetry={fetchAccounts} />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader 
                title="Citibankdemobusinessinc Accounts" 
                subtitle="Unified view of your financial ecosystem."
                buttonText="Link New Account"
                onButtonClick={() => alert("Link flow initiated.")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Account List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Accounts</h3>
                        <AccountList accounts={accounts} onAccountSelect={handleSelectAccount} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedAccount ? (
                        <>
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <AccountDetails accountId={selectedAccount.id} customerId={selectedAccount.customerId} />
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                                {isLoadingTransactions ? (
                                    <LoadingSpinner />
                                ) : (
                                    <TransactionList transactions={transactions} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl border border-gray-700 text-gray-500">
                            Select an account to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsView;

// --- CONSOLIDATED FROM: ./valid_tsx/AccountsView.tsx ---


import React, { useState, useEffect, useCallback } from 'react';
import AccountList from './AccountList';
import AccountDetails from './AccountDetails';
import TransactionList from './TransactionList'; // Assuming TransactionList is available or we create a mock

// Mock Data Types
export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  currency: string;
  status: string;
  type: string;
  customerId: string;
  institutionId: string;
  institutionLoginId: number;
  createdDate: number;
  balanceDate: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
}

// Mock Data
const MOCK_ACCOUNTS: CustomerAccount[] = [
    { id: '1', name: 'Main Checking', accountNumberDisplay: '...1234', balance: 12500.50, currency: 'USD', status: 'active', type: 'checking', customerId: 'c1', institutionId: 'i1', institutionLoginId: 1, createdDate: 1625097600, balanceDate: 1679000000 },
    { id: '2', name: 'Savings', accountNumberDisplay: '...5678', balance: 50000.00, currency: 'USD', status: 'active', type: 'savings', customerId: 'c1', institutionId: 'i1', institutionLoginId: 1, createdDate: 1625097600, balanceDate: 1679000000 },
];

const MOCK_TRANSACTIONS: Transaction[] = [
    { id: 't1', amount: -50.00, date: '2023-10-27', description: 'Grocery Store', category: 'Food', type: 'debit' },
    { id: 't2', amount: 1500.00, date: '2023-10-26', description: 'Paycheck', category: 'Income', type: 'credit' },
    { id: 't3', amount: -120.00, date: '2023-10-25', description: 'Electric Bill', category: 'Utilities', type: 'debit' },
];

// Self-Contained Sub-Components

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
        {text && <p className="text-gray-400">{text}</p>}
    </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-2">{message}</p>
        {onRetry && <button onClick={onRetry} className="text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition">Retry</button>}
    </div>
);

const PageHeader: React.FC<{ title: string; subtitle?: string; buttonText?: string; onButtonClick?: () => void }> = ({ title, subtitle, buttonText, onButtonClick }) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {buttonText && onButtonClick && (
            <button onClick={onButtonClick} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition shadow-lg">
                {buttonText}
            </button>
        )}
    </div>
);


const AccountsView: React.FC = () => {
    const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [accountsError, setAccountsError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);

    useEffect(() => {
        // Simulate fetching accounts
        const fetchAccounts = async () => {
            setIsLoadingAccounts(true);
            try {
                await new Promise(resolve => setTimeout(resolve, 800));
                setAccounts(MOCK_ACCOUNTS);
                if (MOCK_ACCOUNTS.length > 0) setSelectedAccount(MOCK_ACCOUNTS[0]);
            } catch (err) {
                setAccountsError("Failed to load accounts.");
            } finally {
                setIsLoadingAccounts(false);
            }
        };
        fetchAccounts();
    }, []);

    useEffect(() => {
        if (selectedAccount) {
            setIsLoadingTransactions(true);
            // Simulate fetching transactions
            setTimeout(() => {
                setTransactions(MOCK_TRANSACTIONS);
                setIsLoadingTransactions(false);
            }, 600);
        }
    }, [selectedAccount]);

    const handleSelectAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (account) setSelectedAccount(account);
    };

    if (isLoadingAccounts) return <LoadingSpinner text="Loading financial accounts..." />;
    if (accountsError) return <ErrorMessage message={accountsError} onRetry={() => window.location.reload()} />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader 
                title="Accounts Overview" 
                subtitle="Manage your connected financial institutions."
                buttonText="Link New Account"
                onButtonClick={() => alert("Link flow initiated.")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Account List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Accounts</h3>
                        <AccountList accounts={accounts} onAccountSelect={handleSelectAccount} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedAccount ? (
                        <>
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <AccountDetails accountId={selectedAccount.id} customerId={selectedAccount.customerId} />
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                                {isLoadingTransactions ? (
                                    <LoadingSpinner />
                                ) : (
                                    <TransactionList transactions={transactions} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl border border-gray-700 text-gray-500">
                            Select an account to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsView;


// --- CONSOLIDATED FROM: ./valid_tsx/AccountsView (1).tsx ---

import React, { useState, useEffect, useCallback } from 'react';
import AccountList from './AccountList';
import AccountDetails from './AccountDetails';
import TransactionList from './TransactionList'; // Assuming TransactionList is available

// Data Types
export interface CustomerAccount {
  id: string;
  accountNumberDisplay: string;
  name: string;
  balance: number;
  currency: string;
  status: string;
  type: string;
  customerId: string;
  institutionId: string;
  institutionLoginId: number;
  createdDate: number;
  balanceDate: number;
}

export interface Transaction {
  id: string;
  amount: number;
  date: string;
  description: string;
  category: string;
  type: 'credit' | 'debit';
}

// --- Internal Generative-Data Functions ---

const generateRandomString = (length: number) => {
    const characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let result = '';
    for (let i = 0; i < length; i++) {
        result += characters.charAt(Math.floor(Math.random() * characters.length));
    }
    return result;
};

const generateAccounts = (count: number): CustomerAccount[] => {
    const accountTypes = ['Checking', 'Savings', 'Investment', 'Credit Card', 'Loan'];
    const accountNames = ['Main', 'Primary', 'Growth', 'College Fund', 'Rainy Day'];
    
    return Array.from({ length: count }, () => {
        const type = accountTypes[Math.floor(Math.random() * accountTypes.length)];
        const name = `${accountNames[Math.floor(Math.random() * accountNames.length)]} ${type}`;
        return {
            id: generateRandomString(10),
            accountNumberDisplay: '...' + Math.floor(1000 + Math.random() * 9000),
            name: name,
            balance: parseFloat((Math.random() * 50000 + 500).toFixed(2)),
            currency: 'USD',
            status: 'active',
            type: type.toLowerCase().replace(' ', ''),
            customerId: `c-${generateRandomString(4)}`,
            institutionId: `i-${generateRandomString(4)}`,
            institutionLoginId: Math.floor(Math.random() * 100),
            createdDate: Date.now() - Math.floor(Math.random() * 31536000000), // up to a year ago
            balanceDate: Date.now(),
        };
    });
};

const generateTransactions = (count: number): Transaction[] => {
    const descriptions = [
        'Grocery Store', 'Paycheck', 'Electric Bill', 'Amazon.com', 'Netflix', 'Gas Station', 'Restaurant', 'Online Transfer'
    ];
    const categories = [
        'Food', 'Income', 'Utilities', 'Shopping', 'Entertainment', 'Transport', 'Dining', 'Transfers'
    ];

    return Array.from({ length: count }, () => {
        const isCredit = Math.random() > 0.7;
        const amount = isCredit 
            ? parseFloat((Math.random() * 2000 + 500).toFixed(2))
            : parseFloat((-1 * (Math.random() * 200 + 5)).toFixed(2));
        
        const date = new Date(Date.now() - Math.floor(Math.random() * 2592000000)); // up to 30 days ago
        
        const descIndex = Math.floor(Math.random() * descriptions.length);

        return {
            id: generateRandomString(12),
            amount: amount,
            date: date.toISOString().split('T')[0],
            description: descriptions[descIndex],
            category: categories[descIndex],
            type: isCredit ? 'credit' : 'debit',
        };
    });
};


// --- Self-Contained Sub-Components ---

const LoadingSpinner: React.FC<{ text?: string }> = ({ text }) => (
    <div className="flex flex-col items-center justify-center p-10">
        <div className="animate-spin rounded-full h-10 w-10 border-t-2 border-b-2 border-cyan-500 mb-3"></div>
        {text && <p className="text-gray-400">{text}</p>}
    </div>
);

const ErrorMessage: React.FC<{ message: string; onRetry?: () => void }> = ({ message, onRetry }) => (
    <div className="p-4 bg-red-900/20 border border-red-500/50 rounded-lg text-center">
        <p className="text-red-400 mb-2">{message}</p>
        {onRetry && <button onClick={onRetry} className="text-sm text-white bg-red-600 px-3 py-1 rounded hover:bg-red-500 transition">Retry</button>}
    </div>
);

const PageHeader: React.FC<{ title: string; subtitle?: string; buttonText?: string; onButtonClick?: () => void }> = ({ title, subtitle, buttonText, onButtonClick }) => (
    <div className="flex justify-between items-center mb-6 pb-4 border-b border-gray-700">
        <div>
            <h1 className="text-2xl font-bold text-white">{title}</h1>
            {subtitle && <p className="text-gray-400 text-sm mt-1">{subtitle}</p>}
        </div>
        {buttonText && onButtonClick && (
            <button onClick={onButtonClick} className="px-4 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg font-medium transition shadow-lg">
                {buttonText}
            </button>
        )}
    </div>
);


const AccountsView: React.FC = () => {
    const [accounts, setAccounts] = useState<CustomerAccount[]>([]);
    const [isLoadingAccounts, setIsLoadingAccounts] = useState<boolean>(true);
    const [accountsError, setAccountsError] = useState<string | null>(null);
    const [selectedAccount, setSelectedAccount] = useState<CustomerAccount | null>(null);
    const [transactions, setTransactions] = useState<Transaction[]>([]);
    const [isLoadingTransactions, setIsLoadingTransactions] = useState<boolean>(false);

    const fetchAccounts = useCallback(async () => {
        setIsLoadingAccounts(true);
        setAccountsError(null);
        try {
            await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network delay
            const generatedAccounts = generateAccounts(Math.floor(Math.random() * 5) + 2); // Generate 2-6 accounts
            if (generatedAccounts.length === 0) {
                throw new Error("No accounts found for this profile.");
            }
            setAccounts(generatedAccounts);
            setSelectedAccount(generatedAccounts[0]);
        } catch (err) {
            setAccountsError(err instanceof Error ? err.message : "Failed to load accounts.");
        } finally {
            setIsLoadingAccounts(false);
        }
    }, []);

    useEffect(() => {
        fetchAccounts();
    }, [fetchAccounts]);

    useEffect(() => {
        const fetchTransactions = async () => {
            if (selectedAccount) {
                setIsLoadingTransactions(true);
                try {
                    await new Promise(resolve => setTimeout(resolve, 600));
                    const generatedTransactions = generateTransactions(Math.floor(Math.random() * 15) + 5);
                    setTransactions(generatedTransactions);
                } finally {
                    setIsLoadingTransactions(false);
                }
            }
        };
        fetchTransactions();
    }, [selectedAccount]);

    const handleSelectAccount = (accountId: string) => {
        const account = accounts.find(a => a.id === accountId);
        if (account) setSelectedAccount(account);
    };

    if (isLoadingAccounts) return <LoadingSpinner text="Loading financial accounts..." />;
    if (accountsError) return <ErrorMessage message={accountsError} onRetry={fetchAccounts} />;

    return (
        <div className="p-6 max-w-7xl mx-auto">
            <PageHeader 
                title="Citibankdemobusinessinc Accounts" 
                subtitle="Unified view of your financial ecosystem."
                buttonText="Link New Account"
                onButtonClick={() => alert("Link flow initiated.")}
            />

            <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                {/* Account List Sidebar */}
                <div className="lg:col-span-1 space-y-4">
                    <div className="bg-gray-800 rounded-xl border border-gray-700 p-4">
                        <h3 className="text-lg font-semibold text-white mb-4">Your Accounts</h3>
                        <AccountList accounts={accounts} onAccountSelect={handleSelectAccount} />
                    </div>
                </div>

                {/* Main Content */}
                <div className="lg:col-span-3 space-y-6">
                    {selectedAccount ? (
                        <>
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <AccountDetails accountId={selectedAccount.id} customerId={selectedAccount.customerId} />
                            </div>
                            
                            <div className="bg-gray-800 rounded-xl border border-gray-700 p-6">
                                <h3 className="text-lg font-semibold text-white mb-4">Recent Transactions</h3>
                                {isLoadingTransactions ? (
                                    <LoadingSpinner />
                                ) : (
                                    <TransactionList transactions={transactions} />
                                )}
                            </div>
                        </>
                    ) : (
                        <div className="flex items-center justify-center h-64 bg-gray-800 rounded-xl border border-gray-700 text-gray-500">
                            Select an account to view details.
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default AccountsView;