import React, { useState, useEffect, useMemo } from 'react';
import { 
  Users, 
  BookOpen, 
  ArrowLeftRight, 
  Plus, 
  CheckCircle2, 
  Clock, 
  AlertCircle, 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Building, 
  RefreshCw,
  Search,
  X,
  Info,
  ArrowUpRight,
  ArrowDownLeft,
  Layers,
  ShieldCheck,
  FileText
} from 'lucide-react';

// ==========================================
// Interfaces & Types
// ==========================================

interface Counterparty {
  id: string;
  name: string;
  email: string;
  created_at: string;
  accounts_count: number;
  status: 'active' | 'inactive';
}

interface InternalAccount {
  id: string;
  name: string;
  connection_id: string;
  currency: string;
  ledger_balance: number;
  available_balance: number;
  account_number_last4: string;
  routing_number: string;
  bank_name: string;
}

interface LedgerAccount {
  id: string;
  name: string;
  normal_balance: 'debit' | 'credit';
  ledger_id: string;
  pending_balance: number;
  posted_balance: number;
  available_balance: number;
  description: string;
}

interface LedgerEntry {
  id: string;
  ledger_account_id: string;
  ledger_account_name?: string;
  amount: number; // in cents
  direction: 'debit' | 'credit';
}

interface LedgerTransaction {
  id: string;
  description: string;
  status: 'pending' | 'posted' | 'archived';
  effective_at: string;
  posted_at?: string;
  ledger_id: string;
  ledger_entries: LedgerEntry[];
}

// ==========================================
// Mock Data (Fallback & Demo)
// ==========================================

const MOCK_COUNTERPARTIES: Counterparty[] = [
  { id: 'cpty_1j8f92k', name: 'Acme Corporation', email: 'treasury@acme.com', created_at: '2026-01-15T10:00:00Z', accounts_count: 2, status: 'active' },
  { id: 'cpty_2k9s83l', name: 'Globex Logistics', email: 'finance@globex.com', created_at: '2026-02-01T14:30:00Z', accounts_count: 1, status: 'active' },
  { id: 'cpty_3m0w74p', name: 'Initech Software', email: 'billing@initech.com', created_at: '2026-02-10T09:15:00Z', accounts_count: 3, status: 'active' },
  { id: 'cpty_4n1v63q', name: 'Umbrella Corp', email: 'ap@umbrellacorp.com', created_at: '2026-02-15T16:45:00Z', accounts_count: 1, status: 'inactive' },
];

const MOCK_INTERNAL_ACCOUNTS: InternalAccount[] = [
  { 
    id: 'ia_92k83j1', 
    name: 'Citi Operating Account', 
    connection_id: 'conn_citi_direct_01', 
    currency: 'USD', 
    ledger_balance: 125000000, // $1,250,000.00
    available_balance: 124500000, 
    account_number_last4: '8824', 
    routing_number: '021000021', 
    bank_name: 'Citibank, N.A.' 
  },
  { 
    id: 'ia_83j291k', 
    name: 'Citi Payroll Clearing', 
    connection_id: 'conn_citi_direct_01', 
    currency: 'USD', 
    ledger_balance: 45000000, // $450,000.00
    available_balance: 45000000, 
    account_number_last4: '1105', 
    routing_number: '021000021', 
    bank_name: 'Citibank, N.A.' 
  },
  { 
    id: 'ia_74k302l', 
    name: 'Citi Treasury Reserve', 
    connection_id: 'conn_citi_direct_02', 
    currency: 'USD', 
    ledger_balance: 500000000, // $5,000,000.00
    available_balance: 500000000, 
    account_number_last4: '9942', 
    routing_number: '021000021', 
    bank_name: 'Citibank, N.A.' 
  },
];

const MOCK_LEDGER_ACCOUNTS: LedgerAccount[] = [
  { id: 'la_cash_01', name: 'Cash & Cash Equivalents', normal_balance: 'debit', ledger_id: 'led_main_01', pending_balance: 670000000, posted_balance: 670000000, available_balance: 670000000, description: 'Primary cash asset account' },
  { id: 'la_ar_01', name: 'Accounts Receivable', normal_balance: 'debit', ledger_id: 'led_main_01', pending_balance: 15000000, posted_balance: 15000000, available_balance: 15000000, description: 'Outstanding customer invoices' },
  { id: 'la_ap_01', name: 'Accounts Payable', normal_balance: 'credit', ledger_id: 'led_main_01', pending_balance: 5000000, posted_balance: 5000000, available_balance: 5000000, description: 'Short-term obligations to vendors' },
  { id: 'la_cust_wallets', name: 'Customer Virtual Wallets', normal_balance: 'credit', ledger_id: 'led_main_01', pending_balance: 680000000, posted_balance: 680000000, available_balance: 680000000, description: 'Pooled customer liability balances' },
];

const MOCK_LEDGER_TRANSACTIONS: LedgerTransaction[] = [
  {
    id: 'lt_1029384',
    description: 'Funding Operating Account from Reserve',
    status: 'posted',
    effective_at: '2026-02-16T08:00:00Z',
    posted_at: '2026-02-16T08:05:00Z',
    ledger_id: 'led_main_01',
    ledger_entries: [
      { id: 'le_1', ledger_account_id: 'la_cash_01', ledger_account_name: 'Cash & Cash Equivalents', amount: 50000000, direction: 'debit' },
      { id: 'le_2', ledger_account_id: 'la_cust_wallets', ledger_account_name: 'Customer Virtual Wallets', amount: 50000000, direction: 'credit' }
    ]
  },
  {
    id: 'lt_5647382',
    description: 'Vendor Payout - Acme Corp Invoice #1092',
    status: 'posted',
    effective_at: '2026-02-15T14:20:00Z',
    posted_at: '2026-02-15T14:22:00Z',
    ledger_id: 'led_main_01',
    ledger_entries: [
      { id: 'le_3', ledger_account_id: 'la_ap_01', ledger_account_name: 'Accounts Payable', amount: 1250000, direction: 'debit' },
      { id: 'le_4', ledger_account_id: 'la_cash_01', ledger_account_name: 'Cash & Cash Equivalents', amount: 1250000, direction: 'credit' }
    ]
  },
  {
    id: 'lt_9081726',
    description: 'Customer Deposit - Globex Logistics',
    status: 'pending',
    effective_at: '2026-02-17T09:00:00Z',
    ledger_id: 'led_main_01',
    ledger_entries: [
      { id: 'le_5', ledger_account_id: 'la_cash_01', ledger_account_name: 'Cash & Cash Equivalents', amount: 4500000, direction: 'debit' },
      { id: 'le_6', ledger_account_id: 'la_cust_wallets', ledger_account_name: 'Customer Virtual Wallets', amount: 4500000, direction: 'credit' }
    ]
  }
];

// Helper to format currency (cents to USD string)
const formatUSD = (cents: number) => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD'
  }).format(cents / 100);
};

export default function ModernTreasuryLedgerView() {
  // Navigation & UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'counterparties' | 'internal' | 'ledgers' | 'transactions'>('overview');
  const [searchQuery, setSearchQuery] = useState('');
  const [isDemoMode, setIsDemoMode] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Data States
  const [counterparties, setCounterparties] = useState<Counterparty[]>([]);
  const [internalAccounts, setInternalAccounts] = useState<InternalAccount[]>([]);
  const [ledgerAccounts, setLedgerAccounts] = useState<LedgerAccount[]>([]);
  const [ledgerTransactions, setLedgerTransactions] = useState<LedgerTransaction[]>([]);

  // Modals
  const [showTxModal, setShowTxModal] = useState(false);
  const [showCptyModal, setShowCounterpartyModal] = useState(false);

  // Form States - New Transaction
  const [txDescription, setTxDescription] = useState('');
  const [txStatus, setTxStatus] = useState<'pending' | 'posted'>('posted');
  const [txEntries, setTxEntries] = useState<Array<{ ledger_account_id: string; direction: 'debit' | 'credit'; amount: string }>>([
    { ledger_account_id: '', direction: 'debit', amount: '' },
    { ledger_account_id: '', direction: 'credit', amount: '' }
  ]);

  // Form States - New Counterparty
  const [cptyName, setCptyName] = useState('');
  const [cptyEmail, setCptyEmail] = useState('');

  // ==========================================
  // API Integration & Data Fetching
  // ==========================================

  const fetchData = async () => {
    setIsLoading(true);
    setError(null);
    try {
      // Attempt to fetch from seed file's Modern Treasury endpoints
      const [cptyRes, iaRes, laRes, txRes] = await Promise.all([
        fetch('/api/modern-treasury/counterparties').then(r => r.ok ? r.json() : Promise.reject('Failed to fetch counterparties')),
        fetch('/api/modern-treasury/internal-accounts').then(r => r.ok ? r.json() : Promise.reject('Failed to fetch internal accounts')),
        fetch('/api/modern-treasury/ledger-accounts').then(r => r.ok ? r.json() : Promise.reject('Failed to fetch ledger accounts')),
        fetch('/api/modern-treasury/ledger-transactions').then(r => r.ok ? r.json() : Promise.reject('Failed to fetch ledger transactions'))
      ]);

      setCounterparties(cptyRes);
      setInternalAccounts(iaRes);
      setLedgerAccounts(laRes);
      setLedgerTransactions(txRes);
      setIsDemoMode(false);
    } catch (err) {
      console.warn('Modern Treasury API endpoints offline. Falling back to high-fidelity demo data.', err);
      // Fallback to mock data
      setCounterparties(MOCK_COUNTERPARTIES);
      setInternalAccounts(MOCK_INTERNAL_ACCOUNTS);
      setLedgerAccounts(MOCK_LEDGER_ACCOUNTS);
      setLedgerTransactions(MOCK_LEDGER_TRANSACTIONS);
      setIsDemoMode(true);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  // ==========================================
  // Form Handlers
  // ==========================================

  const handleAddTxEntry = () => {
    setTxEntries([...txEntries, { ledger_account_id: '', direction: 'debit', amount: '' }]);
  };

  const handleRemoveTxEntry = (index: number) => {
    if (txEntries.length <= 2) return; // Keep at least double-entry
    setTxEntries(txEntries.filter((_, i) => i !== index));
  };

  const handleTxEntryChange = (index: number, field: string, value: string) => {
    const updated = [...txEntries];
    updated[index] = { ...updated[index], [field]: value };
    setTxEntries(updated);
  };

  // Double-entry validation
  const txValidation = useMemo(() => {
    let totalDebits = 0;
    let totalCredits = 0;
    let hasEmptyAccount = false;
    let hasInvalidAmount = false;

    txEntries.forEach(entry => {
      if (!entry.ledger_account_id) hasEmptyAccount = true;
      const parsedAmount = parseFloat(entry.amount) || 0;
      if (parsedAmount <= 0) hasInvalidAmount = true;

      const amountInCents = Math.round(parsedAmount * 100);
      if (entry.direction === 'debit') {
        totalDebits += amountInCents;
      } else {
        totalCredits += amountInCents;
      }
    });

    const isBalanced = totalDebits === totalCredits && totalDebits > 0;
    const difference = Math.abs(totalDebits - totalCredits);

    return {
      totalDebits,
      totalCredits,
      isBalanced,
      difference,
      hasEmptyAccount,
      hasInvalidAmount,
      isValid: isBalanced && !hasEmptyAccount && !hasInvalidAmount && txDescription.trim().length > 0
    };
  }, [txEntries, txDescription]);

  const handleCreateTransaction = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!txValidation.isValid) return;

    const payload = {
      description: txDescription,
      status: txStatus,
      ledger_entries: txEntries.map(entry => ({
        ledger_account_id: entry.ledger_account_id,
        amount: Math.round(parseFloat(entry.amount) * 100),
        direction: entry.direction
      }))
    };

    setIsLoading(true);
    try {
      if (isDemoMode) {
        // Simulate local creation in demo mode
        const newTx: LedgerTransaction = {
          id: `lt_${Math.random().toString(36).substr(2, 9)}`,
          description: txDescription,
          status: txStatus,
          effective_at: new Date().toISOString(),
          posted_at: txStatus === 'posted' ? new Date().toISOString() : undefined,
          ledger_id: 'led_main_01',
          ledger_entries: payload.ledger_entries.map((entry, idx) => ({
            id: `le_new_${idx}`,
            ledger_account_id: entry.ledger_account_id,
            ledger_account_name: ledgerAccounts.find(la => la.id === entry.ledger_account_id)?.name || 'Unknown Account',
            amount: entry.amount,
            direction: entry.direction
          }))
        };

        // Update ledger account balances locally
        const updatedLedgerAccounts = ledgerAccounts.map(la => {
          const entriesForAccount = payload.ledger_entries.filter(e => e.ledger_account_id === la.id);
          let pendingDiff = 0;
          let postedDiff = 0;

          entriesForAccount.forEach(entry => {
            const isDebit = entry.direction === 'debit';
            const isNormalDebit = la.normal_balance === 'debit';
            const multiplier = (isDebit === isNormalDebit) ? 1 : -1;
            
            pendingDiff += entry.amount * multiplier;
            if (txStatus === 'posted') {
              postedDiff += entry.amount * multiplier;
            }
          });

          return {
            ...la,
            pending_balance: la.pending_balance + pendingDiff,
            posted_balance: la.posted_balance + postedDiff,
            available_balance: la.available_balance + postedDiff
          };
        });

        setLedgerTransactions([newTx, ...ledgerTransactions]);
        setLedgerAccounts(updatedLedgerAccounts);
        setShowTxModal(false);
        resetTxForm();
      } else {
        // Real API call
        const res = await fetch('/api/modern-treasury/ledger-transactions', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create ledger transaction');
        await fetchData();
        setShowTxModal(false);
        resetTxForm();
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const resetTxForm = () => {
    setTxDescription('');
    setTxStatus('posted');
    setTxEntries([
      { ledger_account_id: '', direction: 'debit', amount: '' },
      { ledger_account_id: '', direction: 'credit', amount: '' }
    ]);
  };

  const handleCreateCounterparty = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!cptyName.trim() || !cptyEmail.trim()) return;

    const payload = { name: cptyName, email: cptyEmail };
    setIsLoading(true);

    try {
      if (isDemoMode) {
        const newCpty: Counterparty = {
          id: `cpty_${Math.random().toString(36).substr(2, 9)}`,
          name: cptyName,
          email: cptyEmail,
          created_at: new Date().toISOString(),
          accounts_count: 0,
          status: 'active'
        };
        setCounterparties([newCpty, ...counterparties]);
        setShowCounterpartyModal(false);
        setCptyName('');
        setCptyEmail('');
      } else {
        const res = await fetch('/api/modern-treasury/counterparties', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        });
        if (!res.ok) throw new Error('Failed to create counterparty');
        await fetchData();
        setShowCounterpartyModal(false);
        setCptyName('');
        setCptyEmail('');
      }
    } catch (err: any) {
      setError(err.message || 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  // ==========================================
  // Filtered Lists
  // ==========================================

  const filteredCounterparties = useMemo(() => {
    return counterparties.filter(c => 
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.id.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [counterparties, searchQuery]);

  const filteredTransactions = useMemo(() => {
    return ledgerTransactions.filter(t => 
      t.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
      t.ledger_entries.some(e => e.ledger_account_name?.toLowerCase().includes(searchQuery.toLowerCase()))
    );
  }, [ledgerTransactions, searchQuery]);

  // ==========================================
  // Render Helpers
  // ==========================================

  const renderStatusBadge = (status: string) => {
    switch (status) {
      case 'posted':
      case 'active':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-emerald-100 text-emerald-800">
            <CheckCircle2 className="w-3 h-3 mr-1" />
            {status.toUpperCase()}
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-800">
            <Clock className="w-3 h-3 mr-1" />
            PENDING
          </span>
        );
      case 'inactive':
      case 'archived':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-800">
            <AlertCircle className="w-3 h-3 mr-1" />
            {status.toUpperCase()}
          </span>
        );
      default:
        return null;
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans">
      {/* Top Navigation Bar */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="bg-blue-600 text-white p-2 rounded-lg shadow-md">
                <Layers className="w-6 h-6" />
              </div>
              <div>
                <h1 className="text-lg font-bold text-slate-900 tracking-tight">Citi B2B Ledger</h1>
                <p className="text-xs text-slate-500 font-medium">Modern Treasury Integration Engine</p>
              </div>
            </div>

            <div className="flex items-center space-x-4">
              {isDemoMode && (
                <span className="inline-flex items-center px-3 py-1 rounded-md text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-200">
                  <Info className="w-3.5 h-3.5 mr-1.5" />
                  Demo Mode (API Offline)
                </span>
              )}
              <button 
                onClick={fetchData}
                className="p-2 text-slate-500 hover:text-slate-700 hover:bg-slate-100 rounded-full transition-colors"
                title="Refresh Data"
              >
                <RefreshCw className={`w-5 h-5 ${isLoading ? 'animate-spin' : ''}`} />
              </button>
              <div className="h-6 w-px bg-slate-200" />
              <div className="flex items-center space-x-2">
                <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center text-blue-700 font-bold text-sm">
                  CT
                </div>
                <span className="text-sm font-medium text-slate-700 hidden md:inline-block">Citi Treasury Admin</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Layout Container */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Error Banner */}
        {error && (
          <div className="mb-6 bg-red-50 border-l-4 border-red-500 p-4 rounded-r-lg shadow-sm flex justify-between items-start">
            <div className="flex">
              <AlertCircle className="w-5 h-5 text-red-500 mr-3 mt-0.5" />
              <div>
                <h3 className="text-sm font-semibold text-red-800">Integration Error</h3>
                <p className="text-xs text-red-700 mt-1">{error}</p>
              </div>
            </div>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-600">
              <X className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Tab Navigation & Search */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex space-x-1 bg-slate-200/80 p-1 rounded-xl self-start">
            <button
              onClick={() => { setActiveTab('overview'); setSearchQuery(''); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'overview' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Overview</span>
            </button>
            <button
              onClick={() => { setActiveTab('counterparties'); setSearchQuery(''); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'counterparties' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Users className="w-4 h-4" />
              <span>Counterparties</span>
            </button>
            <button
              onClick={() => { setActiveTab('internal'); setSearchQuery(''); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'internal' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <Building className="w-4 h-4" />
              <span>Internal Accounts</span>
            </button>
            <button
              onClick={() => { setActiveTab('ledgers'); setSearchQuery(''); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'ledgers' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Ledger Accounts</span>
            </button>
            <button
              onClick={() => { setActiveTab('transactions'); setSearchQuery(''); }}
              className={`flex items-center space-x-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
                activeTab === 'transactions' ? 'bg-white text-blue-700 shadow-sm' : 'text-slate-600 hover:text-slate-900'
              }`}
            >
              <ArrowLeftRight className="w-4 h-4" />
              <span>Transactions</span>
            </button>
          </div>

          {/* Search Bar (Hidden on Overview) */}
          {activeTab !== 'overview' && activeTab !== 'internal' && activeTab !== 'ledgers' && (
            <div className="relative w-full md:w-72">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                type="text"
                placeholder={`Search ${activeTab}...`}
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-white border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent shadow-sm transition-all"
              />
            </div>
          )}
        </div>

        {/* ==========================================
            TAB: OVERVIEW
            ========================================== */}
        {activeTab === 'overview' && (
          <div className="space-y-8">
            {/* Summary Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Total Cash Assets</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {formatUSD(internalAccounts.reduce((acc, curr) => acc + curr.ledger_balance, 0))}
                  </h3>
                  <p className="text-xs text-emerald-600 font-medium mt-1 flex items-center">
                    <TrendingUp className="w-3 h-3 mr-1" />
                    Across {internalAccounts.length} Internal Accounts
                  </p>
                </div>
                <div className="bg-blue-50 text-blue-600 p-3 rounded-xl">
                  <DollarSign className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ledger Liabilities</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {formatUSD(
                      ledgerAccounts
                        .filter(la => la.normal_balance === 'credit')
                        .reduce((acc, curr) => acc + curr.posted_balance, 0)
                    )}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Customer Wallets & Payables
                  </p>
                </div>
                <div className="bg-purple-50 text-purple-600 p-3 rounded-xl">
                  <Layers className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Active Counterparties</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {counterparties.filter(c => c.status === 'active').length}
                  </h3>
                  <p className="text-xs text-slate-500 font-medium mt-1">
                    Out of {counterparties.length} total registered
                  </p>
                </div>
                <div className="bg-emerald-50 text-emerald-600 p-3 rounded-xl">
                  <Users className="w-6 h-6" />
                </div>
              </div>

              <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm flex items-center justify-between">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Transactions</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">
                    {ledgerTransactions.filter(t => t.status === 'pending').length}
                  </h3>
                  <p className="text-xs text-amber-600 font-medium mt-1 flex items-center">
                    <Clock className="w-3.5 h-3.5 mr-1" />
                    Awaiting settlement
                  </p>
                </div>
                <div className="bg-amber-50 text-amber-600 p-3 rounded-xl">
                  <ArrowLeftRight className="w-6 h-6" />
                </div>
              </div>
            </div>

            {/* Quick Actions & Recent Activity */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Recent Transactions */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 lg:col-span-2">
                <div className="flex justify-between items-center mb-6">
                  <div>
                    <h3 className="text-base font-bold text-slate-900">Recent Ledger Transactions</h3>
                    <p className="text-xs text-slate-500">Double-entry ledger records</p>
                  </div>
                  <button 
                    onClick={() => setActiveTab('transactions')}
                    className="text-xs font-semibold text-blue-600 hover:text-blue-800 transition-colors"
                  >
                    View All
                  </button>
                </div>

                <div className="space-y-4">
                  {ledgerTransactions.slice(0, 3).map((tx) => (
                    <div key={tx.id} className="p-4 rounded-xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
                      <div className="flex justify-between items-start mb-3">
                        <div>
                          <h4 className="text-sm font-semibold text-slate-900">{tx.description}</h4>
                          <p className="text-xs text-slate-500 mt-0.5">ID: {tx.id} • {new Date(tx.effective_at).toLocaleDateString()}</p>
                        </div>
                        {renderStatusBadge(tx.status)}
                      </div>
                      <div className="border-t border-slate-200/60 pt-3 space-y-1.5">
                        {tx.ledger_entries.map((entry, idx) => (
                          <div key={idx} className="flex justify-between text-xs">
                            <span className="text-slate-600 flex items-center">
                              {entry.direction === 'debit' ? (
                                <ArrowDownLeft className="w-3 h-3 text-emerald-500 mr-1.5" />
                              ) : (
                                <ArrowUpRight className="w-3 h-3 text-blue-500 mr-1.5" />
                              )}
                              {entry.ledger_account_name || entry.ledger_account_id}
                            </span>
                            <span className={`font-semibold ${entry.direction === 'debit' ? 'text-emerald-700' : 'text-blue-700'}`}>
                              {entry.direction === 'debit' ? '+' : '-'}{formatUSD(entry.amount)}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Quick Actions Panel */}
              <div className="bg-white rounded-2xl border border-slate-200 shadow-sm p-6 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-slate-900 mb-1">Ledger Operations</h3>
                  <p className="text-xs text-slate-500 mb-6">Initiate double-entry transactions and manage counterparties.</p>

                  <div className="space-y-3">
                    <button
                      onClick={() => setShowTxModal(true)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-blue-500 hover:bg-blue-50/30 transition-all group text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-blue-50 text-blue-600 p-2.5 rounded-lg group-hover:bg-blue-100 transition-colors">
                          <BookOpen className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Create Ledger Transaction</p>
                          <p className="text-xs text-slate-500">Post balanced debits & credits</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-blue-600 transition-colors" />
                    </button>

                    <button
                      onClick={() => setShowCounterpartyModal(true)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-slate-200 hover:border-emerald-500 hover:bg-emerald-50/30 transition-all group text-left"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="bg-emerald-50 text-emerald-600 p-2.5 rounded-lg group-hover:bg-emerald-100 transition-colors">
                          <Users className="w-5 h-5" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">Add Counterparty</p>
                          <p className="text-xs text-slate-500">Register external business entity</p>
                        </div>
                      </div>
                      <Plus className="w-5 h-5 text-slate-400 group-hover:text-emerald-600 transition-colors" />
                    </button>
                  </div>
                </div>

                <div className="mt-6 pt-6 border-t border-slate-100 bg-slate-50 -mx-6 -mb-6 p-6 rounded-b-2xl flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-blue-600 flex-shrink-0" />
                  <p className="text-xs text-slate-500 leading-relaxed">
                    All ledger transactions are immutable and strictly adhere to double-entry accounting standards.
                  </p>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: COUNTERPARTIES
            ========================================== */}
        {activeTab === 'counterparties' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Modern Treasury Counterparties</h3>
                <p className="text-xs text-slate-500">External entities authorized for payments and ledgering</p>
              </div>
              <button
                onClick={() => setShowCounterpartyModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Add Counterparty</span>
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Name</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Email</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Linked Accounts</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Created At</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {filteredCounterparties.map((cpty) => (
                    <tr key={cpty.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-slate-900">{cpty.name}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{cpty.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600">{cpty.email}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{cpty.accounts_count} accounts</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500">
                        {new Date(cpty.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">{renderStatusBadge(cpty.status)}</td>
                    </tr>
                  ))}
                  {filteredCounterparties.length === 0 && (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-slate-500">
                        <Users className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                        <p className="text-sm font-medium">No counterparties found matching "{searchQuery}"</p>
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: INTERNAL ACCOUNTS
            ========================================== */}
        {activeTab === 'internal' && (
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-2xl border border-slate-200 shadow-sm">
              <h3 className="text-base font-bold text-slate-900">Internal Bank Accounts</h3>
              <p className="text-xs text-slate-500 mt-0.5">Your organization's accounts connected via Modern Treasury</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {internalAccounts.map((account) => (
                <div key={account.id} className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden flex flex-col justify-between">
                  <div className="p-6 border-b border-slate-100">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="text-base font-bold text-slate-900">{account.name}</h4>
                        <p className="text-xs text-slate-500 mt-0.5">{account.bank_name}</p>
                      </div>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold bg-blue-50 text-blue-700 border border-blue-100">
                        {account.currency}
                      </span>
                    </div>

                    <div className="mt-6 space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Account Number</span>
                        <span className="font-mono text-slate-700 font-semibold">•••• {account.account_number_last4}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Routing Number</span>
                        <span className="font-mono text-slate-700 font-semibold">{account.routing_number}</span>
                      </div>
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-500">Connection ID</span>
                        <span className="font-mono text-slate-500">{account.connection_id}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-50 p-6 space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Ledger Balance</span>
                      <span className="text-base font-bold text-slate-900">{formatUSD(account.ledger_balance)}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Balance</span>
                      <span className="text-sm font-semibold text-slate-700">{formatUSD(account.available_balance)}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: LEDGER ACCOUNTS
            ========================================== */}
        {activeTab === 'ledgers' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200">
              <h3 className="text-base font-bold text-slate-900">Chart of Ledger Accounts</h3>
              <p className="text-xs text-slate-500">Double-entry sub-ledger accounts tracking virtual balances</p>
            </div>

            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-slate-200 text-left">
                <thead className="bg-slate-50">
                  <tr>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Account Name</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">ID</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Normal Balance</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Pending Balance</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Posted Balance</th>
                    <th className="px-6 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider">Available Balance</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-200">
                  {ledgerAccounts.map((la) => (
                    <tr key={la.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-semibold text-slate-900">{la.name}</div>
                        <div className="text-xs text-slate-500 mt-0.5">{la.description}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 font-mono">{la.id}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                          la.normal_balance === 'debit' ? 'bg-emerald-50 text-emerald-700 border border-emerald-100' : 'bg-blue-50 text-blue-700 border border-blue-100'
                        }`}>
                          {la.normal_balance.toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{formatUSD(la.pending_balance)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 font-bold">{formatUSD(la.posted_balance)}</td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-600 font-medium">{formatUSD(la.available_balance)}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB: TRANSACTIONS
            ========================================== */}
        {activeTab === 'transactions' && (
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center">
              <div>
                <h3 className="text-base font-bold text-slate-900">Ledger Transactions</h3>
                <p className="text-xs text-slate-500">Double-entry transaction history</p>
              </div>
              <button
                onClick={() => setShowTxModal(true)}
                className="flex items-center space-x-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-xl text-sm font-semibold shadow-sm transition-colors"
              >
                <Plus className="w-4 h-4" />
                <span>Create Transaction</span>
              </button>
            </div>

            <div className="divide-y divide-slate-200">
              {filteredTransactions.map((tx) => (
                <div key={tx.id} className="p-6 hover:bg-slate-50/50 transition-colors">
                  <div className="flex flex-col md:flex-row md:justify-between md:items-start gap-4 mb-4">
                    <div>
                      <div className="flex items-center space-x-3">
                        <h4 className="text-sm font-bold text-slate-900">{tx.description}</h4>
                        {renderStatusBadge(tx.status)}
                      </div>
                      <p className="text-xs text-slate-500 mt-1 font-mono">
                        Transaction ID: {tx.id} • Effective: {new Date(tx.effective_at).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-slate-400">Ledger ID</p>
                      <p className="text-xs font-mono text-slate-600 mt-0.5">{tx.ledger_id}</p>
                    </div>
                  </div>

                  {/* Ledger Entries Table */}
                  <div className="bg-slate-50 rounded-xl border border-slate-100 overflow-hidden">
                    <table className="min-w-full divide-y divide-slate-200 text-left">
                      <thead className="bg-slate-100/80">
                        <tr>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Ledger Account</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Direction</th>
                          <th className="px-4 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider text-right">Amount</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-200/60">
                        {tx.ledger_entries.map((entry, idx) => (
                          <tr key={idx}>
                            <td className="px-4 py-2.5 text-xs font-medium text-slate-700">
                              {entry.ledger_account_name || entry.ledger_account_id}
                              <span className="text-[10px] text-slate-400 font-mono ml-2">({entry.ledger_account_id})</span>
                            </td>
                            <td className="px-4 py-2.5 text-xs">
                              <span className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                                entry.direction === 'debit' ? 'bg-emerald-50 text-emerald-700' : 'bg-blue-50 text-blue-700'
                              }`}>
                                {entry.direction.toUpperCase()}
                              </span>
                            </td>
                            <td className={`px-4 py-2.5 text-xs font-bold text-right ${
                              entry.direction === 'debit' ? 'text-emerald-700' : 'text-blue-700'
                            }`}>
                              {entry.direction === 'debit' ? '+' : '-'}{formatUSD(entry.amount)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}

              {filteredTransactions.length === 0 && (
                <div className="px-6 py-12 text-center text-slate-500">
                  <ArrowLeftRight className="w-8 h-8 mx-auto text-slate-300 mb-2" />
                  <p className="text-sm font-medium">No transactions found matching "{searchQuery}"</p>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* ==========================================
          MODAL: CREATE LEDGER TRANSACTION
          ========================================== */}
      {showTxModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-2xl overflow-hidden flex flex-col max-h-[90vh]">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">New Ledger Transaction</h3>
                <p className="text-xs text-slate-500">Create a balanced double-entry transaction</p>
              </div>
              <button onClick={() => setShowTxModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateTransaction} className="p-6 space-y-6 overflow-y-auto flex-1">
              {/* Description */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Description</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Customer Wallet Funding"
                  value={txDescription}
                  onChange={(e) => setTxDescription(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              {/* Status */}
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Status</label>
                <div className="flex space-x-4">
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="txStatus"
                      checked={txStatus === 'posted'}
                      onChange={() => setTxStatus('posted')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Posted (Settled immediately)</span>
                  </label>
                  <label className="flex items-center space-x-2 text-sm font-medium text-slate-700 cursor-pointer">
                    <input
                      type="radio"
                      name="txStatus"
                      checked={txStatus === 'pending'}
                      onChange={() => setTxStatus('pending')}
                      className="text-blue-600 focus:ring-blue-500"
                    />
                    <span>Pending (Awaiting settlement)</span>
                  </label>
                </div>
              </div>

              {/* Ledger Entries */}
              <div className="space-y-4">
                <div className="flex justify-between items-center">
                  <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider">Ledger Entries</label>
                  <button
                    type="button"
                    onClick={handleAddTxEntry}
                    className="flex items-center space-x-1 text-xs font-semibold text-blue-600 hover:text-blue-800"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    <span>Add Entry</span>
                  </button>
                </div>

                <div className="space-y-3">
                  {txEntries.map((entry, idx) => (
                    <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                      {/* Account Select */}
                      <div className="flex-1">
                        <select
                          required
                          value={entry.ledger_account_id}
                          onChange={(e) => handleTxEntryChange(idx, 'ledger_account_id', e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="">Select Ledger Account...</option>
                          {ledgerAccounts.map(la => (
                            <option key={la.id} value={la.id}>{la.name} ({la.normal_balance})</option>
                          ))}
                        </select>
                      </div>

                      {/* Direction */}
                      <div className="w-28">
                        <select
                          value={entry.direction}
                          onChange={(e) => handleTxEntryChange(idx, 'direction', e.target.value as 'debit' | 'credit')}
                          className="w-full px-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="debit">Debit (+)</option>
                          <option value="credit">Credit (-)</option>
                        </select>
                      </div>

                      {/* Amount */}
                      <div className="w-32 relative">
                        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 font-semibold">$</span>
                        <input
                          type="number"
                          step="0.01"
                          required
                          placeholder="0.00"
                          value={entry.amount}
                          onChange={(e) => handleTxEntryChange(idx, 'amount', e.target.value)}
                          className="w-full pl-7 pr-3 py-2 bg-white border border-slate-200 rounded-lg text-xs focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>

                      {/* Remove Button */}
                      <button
                        type="button"
                        disabled={txEntries.length <= 2}
                        onClick={() => handleRemoveTxEntry(idx)}
                        className="text-slate-400 hover:text-red-500 disabled:opacity-30 disabled:hover:text-slate-400 p-1"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>

              {/* Double-Entry Validation Summary */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Total Debits:</span>
                  <span className="text-emerald-700">{formatUSD(txValidation.totalDebits)}</span>
                </div>
                <div className="flex justify-between text-xs font-semibold text-slate-600">
                  <span>Total Credits:</span>
                  <span className="text-blue-700">{formatUSD(txValidation.totalCredits)}</span>
                </div>
                <div className="border-t border-slate-200 pt-2 flex justify-between items-center">
                  <span className="text-xs font-bold text-slate-700">Status:</span>
                  {txValidation.isBalanced ? (
                    <span className="inline-flex items-center text-xs font-bold text-emerald-700">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Balanced
                    </span>
                  ) : (
                    <span className="inline-flex items-center text-xs font-bold text-red-600">
                      <AlertCircle className="w-4 h-4 mr-1" /> Unbalanced (Diff: {formatUSD(txValidation.difference)})
                    </span>
                  )}
                </div>
              </div>

              {/* Submit / Cancel */}
              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowTxModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!txValidation.isValid || isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Post Transaction</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ==========================================
          MODAL: ADD COUNTERPARTY
          ========================================== */}
      {showCptyModal && (
        <div className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl border border-slate-200 w-full max-w-md overflow-hidden">
            <div className="p-6 border-b border-slate-200 flex justify-between items-center bg-slate-50">
              <div>
                <h3 className="text-base font-bold text-slate-900">Add Counterparty</h3>
                <p className="text-xs text-slate-500">Register a new external business entity</p>
              </div>
              <button onClick={() => setShowCounterpartyModal(false)} className="text-slate-400 hover:text-slate-600">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateCounterparty} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Business Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Acme Corp"
                  value={cptyName}
                  onChange={(e) => setCptyName(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Email Address</label>
                <input
                  type="email"
                  required
                  placeholder="e.g. treasury@acme.com"
                  value={cptyEmail}
                  onChange={(e) => setCptyEmail(e.target.value)}
                  className="w-full px-4 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-slate-100">
                <button
                  type="button"
                  onClick={() => setShowCounterpartyModal(false)}
                  className="px-4 py-2 border border-slate-200 rounded-xl text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!cptyName.trim() || !cptyEmail.trim() || isLoading}
                  className="px-5 py-2 bg-blue-600 hover:bg-blue-700 disabled:bg-slate-300 text-white rounded-xl text-sm font-semibold shadow-sm transition-colors flex items-center space-x-2"
                >
                  {isLoading ? (
                    <RefreshCw className="w-4 h-4 animate-spin" />
                  ) : (
                    <span>Add Counterparty</span>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}