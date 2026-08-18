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