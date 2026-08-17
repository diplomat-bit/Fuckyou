import React, { useState, useEffect, useMemo } from 'react';
import { 
  ArrowRightLeft, 
  CheckCircle2, 
  ShieldCheck, 
  History, 
  Users, 
  Search, 
  Plus, 
  ArrowUpRight, 
  ArrowDownLeft, 
  CreditCard, 
  Calendar, 
  Info, 
  AlertCircle, 
  Download, 
  Share2, 
  ChevronRight, 
  Lock, 
  RefreshCw,
  DollarSign,
  Check,
  X,
  FileText,
  TrendingUp,
  Building,
  User,
  HelpCircle
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Account {
  id: string;
  accountNumber: string;
  routingNumber: string;
  name: string;
  type: 'Checking' | 'Savings' | 'Money Market';
  balance: number;
  availableBalance: number;
  currency: string;
}

interface Payee {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  routingNumber: string;
  type: 'Individual' | 'Business';
  email?: string;
  nickname?: string;
  isSaved: boolean;
}

interface TransferRecord {
  id: string;
  sourceAccountId: string;
  sourceAccountName: string;
  payeeName: string;
  payeeAccountNumber: string;
  bankName: string;
  amount: number;
  reference: string;
  category: string;
  date: string;
  status: 'Completed' | 'Pending' | 'Failed' | 'Processing';
  type: 'Instant' | 'Standard' | 'Scheduled';
  transactionId: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const MOCK_ACCOUNTS: Account[] = [
  {
    id: 'acc-1',
    accountNumber: '•••• 4829',
    routingNumber: '021000021',
    name: 'Premium Business Checking',
    type: 'Checking',
    balance: 142500.50,
    availableBalance: 138000.00,
    currency: 'USD'
  },
  {
    id: 'acc-2',
    accountNumber: '•••• 8831',
    routingNumber: '021000021',
    name: 'Corporate High-Yield Savings',
    type: 'Savings',
    balance: 620450.75,
    availableBalance: 620450.75,
    currency: 'USD'
  },
  {
    id: 'acc-3',
    accountNumber: '•••• 1092',
    routingNumber: '121000248',
    name: 'Operating Liquidity Fund',
    type: 'Money Market',
    balance: 45000.00,
    availableBalance: 45000.00,
    currency: 'USD'
  }
];

const MOCK_PAYEES: Payee[] = [
  {
    id: 'payee-1',
    name: 'Acme Corporation',
    bankName: 'Chase Bank',
    accountNumber: '•••• 9921',
    routingNumber: '021000021',
    type: 'Business',
    email: 'billing@acme.com',
    nickname: 'Acme Main Vendor',
    isSaved: true
  },
  {
    id: 'payee-2',
    name: 'Sarah Jenkins',
    bankName: 'Bank of America',
    accountNumber: '•••• 4412',
    routingNumber: '121000248',
    type: 'Individual',
    email: 'sarah.j@designstudio.io',
    nickname: 'Lead Designer Contractor',
    isSaved: true
  },
  {
    id: 'payee-3',
    name: 'Apex Utilities Group',
    bankName: 'Wells Fargo',
    accountNumber: '•••• 7732',
    routingNumber: '121122334',
    type: 'Business',
    email: 'payments@apexutilities.com',
    nickname: 'HQ Electricity & Water',
    isSaved: true
  },
  {
    id: 'payee-4',
    name: 'DevFlow Software LLC',
    bankName: 'Silicon Valley Bank',
    accountNumber: '•••• 5541',
    routingNumber: '121122444',
    type: 'Business',
    email: 'finance@devflow.io',
    nickname: 'SaaS Subscriptions',
    isSaved: true
  }
];

const MOCK_HISTORY: TransferRecord[] = [
  {
    id: 'tx-101',
    sourceAccountId: 'acc-1',
    sourceAccountName: 'Premium Business Checking',
    payeeName: 'Acme Corporation',
    payeeAccountNumber: '•••• 9921',
    bankName: 'Chase Bank',
    amount: 12500.00,
    reference: 'Invoice #INV-2024-089',
    category: 'Vendor Payment',
    date: '2024-10-24 14:32',
    status: 'Completed',
    type: 'Instant',
    transactionId: 'TXN-88291-A9'
  },
  {
    id: 'tx-102',
    sourceAccountId: 'acc-1',
    sourceAccountName: 'Premium Business Checking',
    payeeName: 'Sarah Jenkins',
    payeeAccountNumber: '•••• 4412',
    bankName: 'Bank of America',
    amount: 4200.00,
    reference: 'October Design Retainer',
    category: 'Contractor Fees',
    date: '2024-10-22 09:15',
    status: 'Completed',
    type: 'Standard',
    transactionId: 'TXN-11029-B2'
  },
  {
    id: 'tx-103',
    sourceAccountId: 'acc-2',
    sourceAccountName: 'Corporate High-Yield Savings',
    payeeName: 'Apex Utilities Group',
    payeeAccountNumber: '•••• 7732',
    bankName: 'Wells Fargo',
    amount: 850.30,
    reference: 'HQ Utility Bill Sep-Oct',
    category: 'Utilities',
    date: '2024-10-18 16:45',
    status: 'Completed',
    type: 'Standard',
    transactionId: 'TXN-99301-C4'
  },
  {
    id: 'tx-104',
    sourceAccountId: 'acc-3',
    sourceAccountName: 'Operating Liquidity Fund',
    payeeName: 'DevFlow Software LLC',
    payeeAccountNumber: '•••• 5541',
    bankName: 'Silicon Valley Bank',
    amount: 1500.00,
    reference: 'Enterprise License Renewal',
    category: 'Software & SaaS',
    date: '2024-10-15 11:00',
    status: 'Completed',
    type: 'Instant',
    transactionId: 'TXN-44920-D1'
  }
];

export default function DomesticTransferDashboard() {
  // ==========================================
  // STATE MANAGEMENT
  // ==========================================
  const [accounts, setAccounts] = useState<Account[]>(MOCK_ACCOUNTS);
  const [payees, setPayees] = useState<Payee[]>(MOCK_PAYEES);
  const [history, setHistory] = useState<TransferRecord[]>(MOCK_HISTORY);

  // Active Tab: 'transfer' | 'history' | 'payees'
  const [activeTab, setActiveTab] = useState<'transfer' | 'history' | 'payees'>('transfer');

  // Transfer Form States
  const [selectedSourceAccount, setSelectedSourceAccount] = useState<Account>(MOCK_ACCOUNTS[0]);
  const [isAdhocPayee, setIsAdhocPayee] = useState<boolean>(false);
  const [selectedPayee, setSelectedPayee] = useState<Payee | null>(MOCK_PAYEES[0]);
  
  // Adhoc Payee Form States
  const [adhocName, setAdhocName] = useState('');
  const [adhocBankName, setAdhocBankName] = useState('');
  const [adhocAccountNumber, setAdhocAccountNumber] = useState('');
  const [adhocRoutingNumber, setAdhocRoutingNumber] = useState('');
  const [adhocType, setAdhocType] = useState<'Individual' | 'Business'>('Business');
  const [adhocEmail, setAdhocEmail] = useState('');
  const [saveAdhocPayee, setSaveAdhocPayee] = useState(false);

  // Transfer Details
  const [amount, setAmount] = useState<string>('');
  const [reference, setReference] = useState<string>('');
  const [category, setCategory] = useState<string>('Vendor Payment');
  const [transferType, setTransferType] = useState<'Instant' | 'Standard' | 'Scheduled'>('Instant');
  const [scheduledDate, setScheduledDate] = useState<string>('');

  // Search & Filters
  const [payeeSearchQuery, setPayeeSearchQuery] = useState('');
  const [historySearchQuery, setHistorySearchQuery] = useState('');
  const [historyStatusFilter, setHistoryStatusFilter] = useState<string>('All');

  // Flow Control & MFA
  const [currentStep, setCurrentStep] = useState<'input' | 'review' | 'mfa' | 'receipt'>('input');
  const [mfaCode, setMfaCode] = useState<string[]>(['', '', '', '', '', '']);
  const [mfaTimer, setMfaTimer] = useState<number>(59);
  const [mfaError, setMfaError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [generatedReceipt, setGeneratedReceipt] = useState<TransferRecord | null>(null);

  // Validation Errors
  const [formErrors, setFormErrors] = useState<{ [key: string]: string }>({});

  // ==========================================
  // EFFECTS & UTILS
  // ==========================================
  useEffect(() => {
    let interval: NodeJS.Timeout;
    if (currentStep === 'mfa' && mfaTimer > 0) {
      interval = setInterval(() => {
        setMfaTimer((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [currentStep, mfaTimer]);

  const resetMfaTimer = () => {
    setMfaTimer(59);
    setMfaError(null);
    setMfaCode(['', '', '', '', '', '']);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD'
    }).format(value);
  };

  // Filtered Payees
  const filteredPayees = useMemo(() => {
    return payees.filter(p => 
      p.name.toLowerCase().includes(payeeSearchQuery.toLowerCase()) ||
      p.bankName.toLowerCase().includes(payeeSearchQuery.toLowerCase()) ||
      p.nickname?.toLowerCase().includes(payeeSearchQuery.toLowerCase())
    );
  }, [payees, payeeSearchQuery]);

  // Filtered History
  const filteredHistory = useMemo(() => {
    return history.filter(h => {
      const matchesSearch = 
        h.payeeName.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        h.reference.toLowerCase().includes(historySearchQuery.toLowerCase()) ||
        h.transactionId.toLowerCase().includes(historySearchQuery.toLowerCase());
      
      const matchesStatus = historyStatusFilter === 'All' || h.status === historyStatusFilter;
      
      return matchesSearch && matchesStatus;
    });
  }, [history, historySearchQuery, historyStatusFilter]);

  // ==========================================
  // VALIDATION & SUBMISSION FLOW
  // ==========================================
  const validateForm = () => {
    const errors: { [key: string]: string } = {};
    const numericAmount = parseFloat(amount);

    if (!amount || isNaN(numericAmount) || numericAmount <= 0) {
      errors.amount = 'Please enter a valid transfer amount.';
    } else if (numericAmount > selectedSourceAccount.availableBalance) {
      errors.amount = 'Amount exceeds available balance in the selected account.';
    }

    if (numericAmount > 100000) {
      errors.amount = 'Amount exceeds single transaction limit of $100,000.00.';
    }

    if (isAdhocPayee) {
      if (!adhocName.trim()) errors.adhocName = 'Payee name is required.';
      if (!adhocBankName.trim()) errors.adhocBankName = 'Bank name is required.';
      if (!adhocAccountNumber.trim() || adhocAccountNumber.length < 4) {
        errors.adhocAccountNumber = 'Enter a valid account number.';
      }
      if (!adhocRoutingNumber.trim() || adhocRoutingNumber.length !== 9) {
        errors.adhocRoutingNumber = 'Routing number must be exactly 9 digits.';
      }
    } else {
      if (!selectedPayee) {
        errors.payee = 'Please select a payee.';
      }
    }

    if (transferType === 'Scheduled' && !scheduledDate) {
      errors.scheduledDate = 'Please select a future date for scheduled transfer.';
    }

    if (!reference.trim()) {
      errors.reference = 'Please provide a reference or memo for this transfer.';
    }

    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleProceedToReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      setCurrentStep('review');
    }
  };

  const handleInitiateMFA = () => {
    setCurrentStep('mfa');
    resetMfaTimer();
  };

  const handleMfaChange = (index: number, value: string) => {
    if (isNaN(Number(value))) return;
    const newMfaCode = [...mfaCode];
    newMfaCode[index] = value.substring(value.length - 1);
    setMfaCode(newMfaCode);

    // Auto-focus next input
    if (value && index < 5) {
      const nextInput = document.getElementById(`mfa-input-${index + 1}`);
      nextInput?.focus();
    }
  };

  const handleMfaKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !mfaCode[index] && index > 0) {
      const prevInput = document.getElementById(`mfa-input-${index - 1}`);
      prevInput?.focus();
    }
  };

  const handleVerifyMFA = () => {
    const codeString = mfaCode.join('');
    if (codeString.length < 6) {
      setMfaError('Please enter the complete 6-digit verification code.');
      return;
    }

    // Simulate verification check (e.g., code is '123456' or just any 6 digits for demo)
    setIsProcessing(true);
    setMfaError(null);

    setTimeout(() => {
      setIsProcessing(false);
      
      // Create final transfer record
      const finalPayeeName = isAdhocPayee ? adhocName : selectedPayee!.name;
      const finalBankName = isAdhocPayee ? adhocBankName : selectedPayee!.bankName;
      const finalAccountNumber = isAdhocPayee 
        ? `•••• ${adhocAccountNumber.slice(-4)}` 
        : selectedPayee!.accountNumber;

      const newRecord: TransferRecord = {
        id: `tx-${Math.floor(Math.random() * 90000) + 10000}`,
        sourceAccountId: selectedSourceAccount.id,
        sourceAccountName: selectedSourceAccount.name,
        payeeName: finalPayeeName,
        payeeAccountNumber: finalAccountNumber,
        bankName: finalBankName,
        amount: parseFloat(amount),
        reference: reference,
        category: category,
        date: new Date().toISOString().replace('T', ' ').substring(0, 16),
        status: transferType === 'Scheduled' ? 'Pending' : 'Completed',
        type: transferType,
        transactionId: `TXN-${Math.floor(Math.random() * 900000) + 100000}-US`
      };

      // Update balances
      setAccounts(prev => prev.map(acc => {
        if (acc.id === selectedSourceAccount.id) {
          return {
            ...acc,
            balance: acc.balance - parseFloat(amount),
            availableBalance: acc.availableBalance - parseFloat(amount)
          };
        }
        return acc;
      }));

      // Save payee if adhoc and checked
      if (isAdhocPayee && saveAdhocPayee) {
        const newPayee: Payee = {
          id: `payee-${Date.now()}`,
          name: adhocName,
          bankName: adhocBankName,
          accountNumber: `•••• ${adhocAccountNumber.slice(-4)}`,
          routingNumber: adhocRoutingNumber,
          type: adhocType,
          email: adhocEmail || undefined,
          isSaved: true
        };
        setPayees(prev => [newPayee, ...prev]);
      }

      // Add to history
      setHistory(prev => [newRecord, ...prev]);
      setGeneratedReceipt(newRecord);
      setCurrentStep('receipt');
    }, 2000);
  };

  const handleResetForm = () => {
    setAmount('');
    setReference('');
    setCategory('Vendor Payment');
    setTransferType('Instant');
    setScheduledDate('');
    setIsAdhocPayee(false);
    setAdhocName('');
    setAdhocBankName('');
    setAdhocAccountNumber('');
    setAdhocRoutingNumber('');
    setAdhocEmail('');
    setSaveAdhocPayee(false);
    setFormErrors({});
    setCurrentStep('input');
  };

  // Quick Stats
  const totalTransferredToday = useMemo(() => {
    return history
      .filter(h => h.status === 'Completed')
      .reduce((sum, h) => sum + h.amount, 0);
  }, [history]);

  const dailyLimitRemaining = 250000 - totalTransferredToday;

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* ==========================================
          TOP NAVIGATION BAR
          ========================================== */}
      <header className="border-b border-slate-800 bg-slate-950 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-20 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <ArrowRightLeft className="h-6 w-6" />
            </div>
            <div>
              <span className="text-xs font-semibold tracking-wider text-indigo-400 uppercase">Apex Global Bank</span>
              <h1 className="text-xl font-bold text-white tracking-tight">Domestic Transfer Portal</h1>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></span>
              <span className="text-xs text-slate-400 font-medium">Secured with 256-bit SSL</span>
            </div>
            <div className="flex items-center space-x-1 bg-slate-900 p-1 rounded-xl border border-slate-800">
              <button 
                onClick={() => { setActiveTab('transfer'); handleResetForm(); }}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'transfer' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                New Transfer
              </button>
              <button 
                onClick={() => setActiveTab('history')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'history' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Transfer History
              </button>
              <button 
                onClick={() => setActiveTab('payees')}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeTab === 'payees' ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' : 'text-slate-400 hover:text-slate-200'}`}
              >
                Manage Payees
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ==========================================
          MAIN CONTENT CONTAINER
          ========================================== */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* ==========================================
            DASHBOARD STATS BANNER
            ========================================== */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Daily Limit Remaining</span>
              <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                <TrendingUp className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(dailyLimitRemaining)}</div>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <span>Total Daily Limit: {formatCurrency(250000)}</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Total Transferred Today</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-400">
                <ArrowUpRight className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">{formatCurrency(totalTransferredToday)}</div>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <span>Across {history.filter(h => h.status === 'Completed').length} completed transactions</span>
            </div>
          </div>

          <div className="bg-gradient-to-br from-slate-950 to-slate-900 border border-slate-800 rounded-2xl p-6 relative overflow-hidden shadow-xl">
            <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl"></div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-sm font-medium text-slate-400">Pending Approvals</span>
              <div className="p-2 bg-amber-500/10 rounded-lg text-amber-400">
                <ClockIcon className="h-5 w-5" />
              </div>
            </div>
            <div className="text-2xl font-bold text-white">
              {history.filter(h => h.status === 'Pending').length}
            </div>
            <div className="mt-2 flex items-center text-xs text-slate-500">
              <span>Requires secondary authorization</span>
            </div>
          </div>
        </div>

        {/* ==========================================
            TAB 1: TRANSFER FLOW
            ========================================== */}
        {activeTab === 'transfer' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* LEFT COLUMN: FORM & STEPS (8 COLS) */}
            <div className="lg:col-span-8 space-y-6">
              
              {/* STEP INDICATOR */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-4 flex items-center justify-between">
                <div className="flex items-center space-x-8 mx-auto">
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 'input' ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>1</div>
                    <span className={`text-sm font-medium ${currentStep === 'input' ? 'text-white' : 'text-slate-500'}`}>Details</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-700" />
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 'review' ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>2</div>
                    <span className={`text-sm font-medium ${currentStep === 'review' ? 'text-white' : 'text-slate-500'}`}>Review</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-700" />
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 'mfa' ? 'bg-indigo-600 text-white ring-4 ring-indigo-500/20' : 'bg-slate-800 text-slate-400'}`}>3</div>
                    <span className={`text-sm font-medium ${currentStep === 'mfa' ? 'text-white' : 'text-slate-500'}`}>Security</span>
                  </div>
                  <ChevronRight className="h-4 w-4 text-slate-700" />
                  <div className="flex items-center space-x-2">
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold ${currentStep === 'receipt' ? 'bg-emerald-600 text-white ring-4 ring-emerald-500/20' : 'bg-slate-800 text-slate-400'}`}>4</div>
                    <span className={`text-sm font-medium ${currentStep === 'receipt' ? 'text-emerald-400' : 'text-slate-500'}`}>Receipt</span>
                  </div>
                </div>
              </div>

              {/* STEP 1: INPUT FORM */}
              {currentStep === 'input' && (
                <form onSubmit={handleProceedToReview} className="space-y-6">
                  
                  {/* SOURCE ACCOUNT SELECTOR */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-4">
                      <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <CreditCard className="h-5 w-5 text-indigo-400" />
                        <span>1. Select Source Account</span>
                      </h2>
                      <span className="text-xs text-slate-500">Debited immediately upon approval</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {accounts.map((acc) => (
                        <div 
                          key={acc.id}
                          onClick={() => setSelectedSourceAccount(acc)}
                          className={`cursor-pointer p-4 rounded-xl border transition-all relative ${
                            selectedSourceAccount.id === acc.id 
                              ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20' 
                              : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                          }`}
                        >
                          {selectedSourceAccount.id === acc.id && (
                            <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-0.5">
                              <Check className="h-3 w-3" />
                            </div>
                          )}
                          <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider">{acc.type}</span>
                          <h3 className="font-bold text-white text-sm mt-1 truncate">{acc.name}</h3>
                          <p className="text-xs text-slate-400 mt-0.5">{acc.accountNumber}</p>
                          <div className="mt-4 pt-3 border-t border-slate-800/60">
                            <span className="text-xs text-slate-500 block">Available Balance</span>
                            <span className="text-base font-bold text-white">{formatCurrency(acc.availableBalance)}</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* PAYEE SELECTION (SAVED VS ADHOC) */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-lg font-semibold text-white flex items-center space-x-2">
                        <Users className="h-5 w-5 text-indigo-400" />
                        <span>2. Payee Information</span>
                      </h2>
                      
                      <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800">
                        <button
                          type="button"
                          onClick={() => setIsAdhocPayee(false)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${!isAdhocPayee ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          Saved Payee
                        </button>
                        <button
                          type="button"
                          onClick={() => setIsAdhocPayee(true)}
                          className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${isAdhocPayee ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'}`}
                        >
                          One-Time / Adhoc
                        </button>
                      </div>
                    </div>

                    {/* SAVED PAYEE SELECTOR */}
                    {!isAdhocPayee ? (
                      <div className="space-y-4">
                        <div className="relative">
                          <Search className="absolute left-3.5 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="text"
                            placeholder="Search saved payees by name, bank, or nickname..."
                            value={payeeSearchQuery}
                            onChange={(e) => setPayeeSearchQuery(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-10 pr-4 py-3 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                          />
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-60 overflow-y-auto pr-1">
                          {filteredPayees.map((payee) => (
                            <div
                              key={payee.id}
                              onClick={() => setSelectedPayee(payee)}
                              className={`cursor-pointer p-4 rounded-xl border transition-all flex items-start space-x-3 relative ${
                                selectedPayee?.id === payee.id 
                                  ? 'bg-indigo-600/10 border-indigo-500 ring-2 ring-indigo-500/20' 
                                  : 'bg-slate-900 border-slate-800 hover:border-slate-700'
                              }`}
                            >
                              <div className="p-2 bg-slate-800 rounded-lg text-slate-400 mt-0.5">
                                {payee.type === 'Business' ? <Building className="h-4 w-4" /> : <User className="h-4 w-4" />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <h4 className="font-bold text-white text-sm truncate">{payee.name}</h4>
                                <p className="text-xs text-slate-400 truncate">{payee.bankName} • {payee.accountNumber}</p>
                                {payee.nickname && (
                                  <span className="inline-block mt-1.5 px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-medium">
                                    {payee.nickname}
                                  </span>
                                )}
                              </div>
                              {selectedPayee?.id === payee.id && (
                                <div className="absolute top-3 right-3 bg-indigo-600 text-white rounded-full p-0.5">
                                  <Check className="h-3 w-3" />
                                </div>
                              )}
                            </div>
                          ))}
                          {filteredPayees.length === 0 && (
                            <div className="col-span-2 text-center py-8 text-slate-500 text-sm">
                              No saved payees found matching your search.
                            </div>
                          )}
                        </div>
                        {formErrors.payee && (
                          <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{formErrors.payee}</span>
                          </p>
                        )}
                      </div>
                    ) : (
                      /* ADHOC PAYEE FORM */
                      <div className="space-y-4">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payee Legal Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. John Doe or Acme Corp"
                              value={adhocName}
                              onChange={(e) => setAdhocName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {formErrors.adhocName && <p className="text-xs text-rose-500 mt-1">{formErrors.adhocName}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Destination Bank Name *</label>
                            <input
                              type="text"
                              placeholder="e.g. JPMorgan Chase"
                              value={adhocBankName}
                              onChange={(e) => setAdhocBankName(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {formErrors.adhocBankName && <p className="text-xs text-rose-500 mt-1">{formErrors.adhocBankName}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Account Number *</label>
                            <input
                              type="password"
                              placeholder="Enter full account number"
                              value={adhocAccountNumber}
                              onChange={(e) => setAdhocAccountNumber(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {formErrors.adhocAccountNumber && <p className="text-xs text-rose-500 mt-1">{formErrors.adhocAccountNumber}</p>}
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Routing Number (9 Digits) *</label>
                            <input
                              type="text"
                              maxLength={9}
                              placeholder="Enter 9-digit ABA routing number"
                              value={adhocRoutingNumber}
                              onChange={(e) => setAdhocRoutingNumber(e.target.value.replace(/\D/g, ''))}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                            {formErrors.adhocRoutingNumber && <p className="text-xs text-rose-500 mt-1">{formErrors.adhocRoutingNumber}</p>}
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payee Type</label>
                            <div className="flex space-x-4 mt-2">
                              <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name="adhocType"
                                  checked={adhocType === 'Business'}
                                  onChange={() => setAdhocType('Business')}
                                  className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                                />
                                <span>Business</span>
                              </label>
                              <label className="flex items-center space-x-2 text-sm text-slate-300 cursor-pointer">
                                <input
                                  type="radio"
                                  name="adhocType"
                                  checked={adhocType === 'Individual'}
                                  onChange={() => setAdhocType('Individual')}
                                  className="text-indigo-600 focus:ring-indigo-500 bg-slate-900 border-slate-800"
                                />
                                <span>Individual</span>
                              </label>
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payee Email (Optional)</label>
                            <input
                              type="email"
                              placeholder="For payment notification receipt"
                              value={adhocEmail}
                              onChange={(e) => setAdhocEmail(e.target.value)}
                              className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                            />
                          </div>
                        </div>

                        <div className="pt-2">
                          <label className="flex items-center space-x-2.5 text-sm text-slate-300 cursor-pointer">
                            <input
                              type="checkbox"
                              checked={saveAdhocPayee}
                              onChange={(e) => setSaveAdhocPayee(e.target.checked)}
                              className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-indigo-500 h-4 w-4"
                            />
                            <span>Save this payee to my secure directory for future transfers</span>
                          </label>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* TRANSFER DETAILS */}
                  <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                    <h2 className="text-lg font-semibold text-white flex items-center space-x-2 mb-6">
                      <DollarSign className="h-5 w-5 text-indigo-400" />
                      <span>3. Transfer Details</span>
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Amount (USD) *</label>
                        <div className="relative">
                          <span className="absolute left-4 top-3.5 text-slate-400 font-semibold text-lg">$</span>
                          <input
                            type="text"
                            placeholder="0.00"
                            value={amount}
                            onChange={(e) => {
                              // Allow only numbers and single decimal point
                              const val = e.target.value;
                              if (/^\d*\.?\d{0,2}$/.test(val)) {
                                setAmount(val);
                              }
                            }}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-8 pr-4 py-3.5 text-lg font-bold text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        {formErrors.amount && (
                          <p className="text-xs text-rose-500 flex items-center space-x-1 mt-1">
                            <AlertCircle className="h-3.5 w-3.5" />
                            <span>{formErrors.amount}</span>
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Transfer Speed / Type</label>
                        <div className="grid grid-cols-3 gap-2">
                          <button
                            type="button"
                            onClick={() => setTransferType('Instant')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              transferType === 'Instant' 
                                ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="block text-xs font-bold">Instant</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Real-time</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTransferType('Standard')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              transferType === 'Standard' 
                                ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="block text-xs font-bold">Standard</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">1-2 Days</span>
                          </button>
                          <button
                            type="button"
                            onClick={() => setTransferType('Scheduled')}
                            className={`p-3 rounded-xl border text-center transition-all ${
                              transferType === 'Scheduled' 
                                ? 'bg-indigo-600/10 border-indigo-500 text-white' 
                                : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                            }`}
                          >
                            <span className="block text-xs font-bold">Scheduled</span>
                            <span className="text-[10px] text-slate-500 block mt-0.5">Future Date</span>
                          </button>
                        </div>
                      </div>
                    </div>

                    {transferType === 'Scheduled' && (
                      <div className="mt-4">
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Schedule Date *</label>
                        <div className="relative">
                          <Calendar className="absolute left-4 top-3.5 h-4 w-4 text-slate-500" />
                          <input
                            type="date"
                            value={scheduledDate}
                            onChange={(e) => setScheduledDate(e.target.value)}
                            className="w-full bg-slate-900 border border-slate-800 rounded-xl pl-11 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                          />
                        </div>
                        {formErrors.scheduledDate && <p className="text-xs text-rose-500 mt-1">{formErrors.scheduledDate}</p>}
                      </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Payment Category</label>
                        <select
                          value={category}
                          onChange={(e) => setCategory(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option>Vendor Payment</option>
                          <option>Contractor Fees</option>
                          <option>Utilities</option>
                          <option>Software & SaaS</option>
                          <option>Rent & Lease</option>
                          <option>Payroll</option>
                          <option>Other Operating Expense</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1.5">Reference / Memo *</label>
                        <input
                          type="text"
                          placeholder="e.g. Invoice #INV-2024-089"
                          value={reference}
                          onChange={(e) => setReference(e.target.value)}
                          className="w-full bg-slate-900 border border-slate-800 rounded-xl px-4 py-3 text-sm text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {formErrors.reference && <p className="text-xs text-rose-500 mt-1">{formErrors.reference}</p>}
                      </div>
                    </div>
                  </div>

                  {/* SUBMIT BUTTON */}
                  <div className="flex justify-end">
                    <button
                      type="submit"
                      className="px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
                    >
                      <span>Review Transfer Details</span>
                      <ChevronRight className="h-5 w-5" />
                    </button>
                  </div>
                </form>
              )}

              {/* STEP 2: REVIEW DETAILS */}
              {currentStep === 'review' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
                  <div>
                    <h2 className="text-xl font-bold text-white">Review Transfer Details</h2>
                    <p className="text-sm text-slate-400 mt-1">Please verify all transaction details below before initiating security verification.</p>
                  </div>

                  <div className="border-t border-b border-slate-800 py-6 space-y-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Source Account</span>
                        <span className="text-sm font-bold text-white block mt-1">{selectedSourceAccount.name}</span>
                        <span className="text-xs text-slate-400">{selectedSourceAccount.accountNumber}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Destination Payee</span>
                        <span className="text-sm font-bold text-white block mt-1">
                          {isAdhocPayee ? adhocName : selectedPayee?.name}
                        </span>
                        <span className="text-xs text-slate-400">
                          {isAdhocPayee ? adhocBankName : selectedPayee?.bankName} • {isAdhocPayee ? `•••• ${adhocAccountNumber.slice(-4)}` : selectedPayee?.accountNumber}
                        </span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-900">
                      <div>
                        <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Transfer Type / Speed</span>
                        <span className="text-sm font-bold text-white block mt-1">{transferType}</span>
                        <span className="text-xs text-slate-400">
                          {transferType === 'Instant' ? 'Processed immediately' : transferType === 'Standard' ? '1-2 business days' : `Scheduled for ${scheduledDate}`}
                        </span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">Category & Reference</span>
                        <span className="text-sm font-bold text-white block mt-1">{category}</span>
                        <span className="text-xs text-slate-400">{reference}</span>
                      </div>
                    </div>
                  </div>

                  <div className="bg-slate-900 p-4 rounded-xl flex items-center justify-between">
                    <div>
                      <span className="text-xs text-slate-400 block">Transfer Amount</span>
                      <span className="text-2xl font-black text-white mt-1">{formatCurrency(parseFloat(amount))}</span>
                    </div>
                    <div className="text-right">
                      <span className="text-xs text-slate-400 block">Transaction Fee</span>
                      <span className="text-sm font-bold text-emerald-400 mt-1">Free (Waived)</span>
                    </div>
                  </div>

                  <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-xl p-4 flex items-start space-x-3">
                    <Lock className="h-5 w-5 text-indigo-400 mt-0.5 flex-shrink-0" />
                    <div className="text-xs text-indigo-300 leading-relaxed">
                      By clicking "Confirm & Verify", you authorize Apex Global Bank to debit your account for the amount specified above. This transaction is protected by multi-factor authentication.
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <button
                      type="button"
                      onClick={() => setCurrentStep('input')}
                      className="px-6 py-3 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-all"
                    >
                      Back to Edit
                    </button>
                    <button
                      type="button"
                      onClick={handleInitiateMFA}
                      className="px-8 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center space-x-2"
                    >
                      <ShieldCheck className="h-5 w-5" />
                      <span>Confirm & Verify</span>
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 3: MFA VERIFICATION */}
              {currentStep === 'mfa' && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-xl max-w-md mx-auto space-y-6 text-center">
                  <div className="mx-auto w-16 h-16 bg-indigo-600/10 border border-indigo-500/30 rounded-full flex items-center justify-center text-indigo-400">
                    <ShieldCheck className="h-8 w-8" />
                  </div>

                  <div>
                    <h2 className="text-xl font-bold text-white">Security Verification</h2>
                    <p className="text-sm text-slate-400 mt-1.5">
                      We sent a 6-digit verification code to your registered mobile number ending in <span className="text-white font-semibold">•••• 9021</span>.
                    </p>
                  </div>

                  {/* OTP INPUTS */}
                  <div className="flex justify-center space-x-2">
                    {mfaCode.map((digit, index) => (
                      <input
                        key={index}
                        id={`mfa-input-${index}`}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) => handleMfaChange(index, e.target.value)}
                        onKeyDown={(e) => handleMfaKeyDown(index, e)}
                        className="w-12 h-14 bg-slate-900 border border-slate-800 rounded-xl text-center text-xl font-bold text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    ))}
                  </div>

                  {mfaError && (
                    <p className="text-xs text-rose-500 flex items-center justify-center space-x-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>{mfaError}</span>
                    </p>
                  )}

                  <div className="text-xs text-slate-500">
                    {mfaTimer > 0 ? (
                      <span>Resend code in <span className="text-indigo-400 font-semibold">{mfaTimer}s</span></span>
                    ) : (
                      <button 
                        type="button" 
                        onClick={resetMfaTimer}
                        className="text-indigo-400 hover:text-indigo-300 font-semibold underline"
                      >
                        Resend Code
                      </button>
                    )}
                  </div>

                  <div className="pt-4 space-y-3">
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={handleVerifyMFA}
                      className="w-full py-3.5 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/20 transition-all flex items-center justify-center space-x-2"
                    >
                      {isProcessing ? (
                        <>
                          <RefreshCw className="h-5 w-5 animate-spin" />
                          <span>Processing Transfer...</span>
                        </>
                      ) : (
                        <>
                          <Lock className="h-4 w-4" />
                          <span>Verify & Authorize</span>
                        </>
                      )}
                    </button>
                    <button
                      type="button"
                      disabled={isProcessing}
                      onClick={() => setCurrentStep('review')}
                      className="w-full py-3 bg-slate-900 hover:bg-slate-800 text-slate-400 font-semibold rounded-xl transition-all"
                    >
                      Cancel
                    </button>
                  </div>
                </div>
              )}

              {/* STEP 4: RECEIPT VIEW */}
              {currentStep === 'receipt' && generatedReceipt && (
                <div className="bg-slate-950 border border-slate-800 rounded-2xl p-8 shadow-xl space-y-6 relative overflow-hidden">
                  <div className="absolute top-0 left-0 right-0 h-1.5 bg-emerald-500"></div>
                  
                  <div className="text-center space-y-2">
                    <div className="mx-auto w-14 h-14 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400">
                      <CheckCircle2 className="h-8 w-8" />
                    </div>
                    <h2 className="text-2xl font-bold text-white">Transfer Successful</h2>
                    <p className="text-sm text-slate-400">Your domestic transfer has been processed successfully.</p>
                  </div>

                  {/* RECEIPT CARD */}
                  <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4">
                    <div className="flex justify-between items-center border-b border-slate-800/60 pb-4">
                      <div>
                        <span className="text-xs text-slate-500 block">Transaction ID</span>
                        <span className="text-sm font-mono font-bold text-white">{generatedReceipt.transactionId}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs text-slate-500 block">Date & Time</span>
                        <span className="text-sm font-medium text-white">{generatedReceipt.date}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <span className="text-xs text-slate-500 block">Source Account</span>
                        <span className="text-sm font-semibold text-white">{generatedReceipt.sourceAccountName}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Recipient Payee</span>
                        <span className="text-sm font-semibold text-white">{generatedReceipt.payeeName}</span>
                        <span className="text-xs text-slate-400 block">{generatedReceipt.bankName} • {generatedReceipt.payeeAccountNumber}</span>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 pt-4 border-t border-slate-800/60">
                      <div>
                        <span className="text-xs text-slate-500 block">Transfer Type</span>
                        <span className="text-sm font-semibold text-white">{generatedReceipt.type}</span>
                      </div>
                      <div>
                        <span className="text-xs text-slate-500 block">Reference / Memo</span>
                        <span className="text-sm font-semibold text-white">{generatedReceipt.reference}</span>
                      </div>
                    </div>

                    <div className="pt-4 border-t border-slate-800/60 flex justify-between items-center">
                      <span className="text-sm font-bold text-white">Total Amount Debited</span>
                      <span className="text-xl font-black text-emerald-400">{formatCurrency(generatedReceipt.amount)}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-4">
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={() => window.print()}
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-all flex items-center space-x-2 text-sm"
                      >
                        <Download className="h-4 w-4" />
                        <span>Download PDF</span>
                      </button>
                      <button
                        type="button"
                        className="px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-slate-300 font-semibold rounded-xl transition-all flex items-center space-x-2 text-sm"
                      >
                        <Share2 className="h-4 w-4" />
                        <span>Share Receipt</span>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={handleResetForm}
                      className="px-6 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all text-sm"
                    >
                      Make Another Transfer
                    </button>
                  </div>
                </div>
              )}

            </div>

            {/* RIGHT COLUMN: QUICK INFO & LIMITS (4 COLS) */}
            <div className="lg:col-span-4 space-y-6">
              
              {/* SECURITY BADGE */}
              <div className="bg-gradient-to-br from-indigo-950/40 to-slate-950 border border-indigo-500/20 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400">
                    <ShieldCheck className="h-6 w-6" />
                  </div>
                  <div>
                    <h3 className="font-bold text-white text-sm">Apex Security Shield</h3>
                    <p className="text-xs text-indigo-300">Active protection enabled</p>
                  </div>
                </div>
                <p className="text-xs text-slate-400 leading-relaxed">
                  All domestic transfers are monitored by our real-time fraud detection system. Transactions exceeding $10,000 may require secondary approval from your organization's administrator.
                </p>
              </div>

              {/* DOMESTIC TRANSFER GUIDELINES */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
                <h3 className="font-bold text-white text-sm flex items-center space-x-2">
                  <Info className="h-4 w-4 text-indigo-400" />
                  <span>Transfer Guidelines</span>
                </h3>
                
                <div className="space-y-3 text-xs">
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                    <p className="text-slate-400"><strong className="text-slate-200">Instant Transfers:</strong> Processed via FedNow or RTP network. Funds typically arrive in recipient's account within seconds.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                    <p className="text-slate-400"><strong className="text-slate-200">Standard ACH:</strong> Processed in batches. Settlement occurs in 1-2 business days.</p>
                  </div>
                  <div className="flex items-start space-x-2">
                    <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 mt-1.5 flex-shrink-0"></span>
                    <p className="text-slate-400"><strong className="text-slate-200">Cut-off Times:</strong> Standard transfers initiated after 5:00 PM EST will begin processing the next business day.</p>
                  </div>
                </div>
              </div>

              {/* QUICK HELP / SUPPORT */}
              <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl">
                <h3 className="font-bold text-white text-sm mb-3 flex items-center space-x-2">
                  <HelpCircle className="h-4 w-4 text-indigo-400" />
                  <span>Need Assistance?</span>
                </h3>
                <p className="text-xs text-slate-400 leading-relaxed mb-4">
                  Have questions about routing numbers, limits, or pending transfers? Our dedicated treasury support team is available 24/7.
                </p>
                <button className="w-full py-2.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold rounded-xl text-xs transition-all">
                  Contact Treasury Support
                </button>
              </div>

            </div>
          </div>
        )}

        {/* ==========================================
            TAB 2: TRANSFER HISTORY
            ========================================== */}
        {activeTab === 'history' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Transfer History</h2>
                <p className="text-sm text-slate-400 mt-1">View and track all domestic transfers initiated from your accounts.</p>
              </div>

              {/* FILTERS */}
              <div className="flex flex-col sm:flex-row gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search history..."
                    value={historySearchQuery}
                    onChange={(e) => setHistorySearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <select
                  value={historyStatusFilter}
                  onChange={(e) => setHistoryStatusFilter(e.target.value)}
                  className="bg-slate-900 border border-slate-800 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                >
                  <option value="All">All Statuses</option>
                  <option value="Completed">Completed</option>
                  <option value="Pending">Pending</option>
                  <option value="Failed">Failed</option>
                </select>
              </div>
            </div>

            {/* HISTORY TABLE */}
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs font-semibold text-slate-400 uppercase tracking-wider">
                    <th className="py-4 px-4">Recipient / Payee</th>
                    <th className="py-4 px-4">Source Account</th>
                    <th className="py-4 px-4">Date</th>
                    <th className="py-4 px-4">Type</th>
                    <th className="py-4 px-4">Reference</th>
                    <th className="py-4 px-4">Amount</th>
                    <th className="py-4 px-4 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-900 text-sm">
                  {filteredHistory.map((record) => (
                    <tr key={record.id} className="hover:bg-slate-900/40 transition-colors">
                      <td className="py-4 px-4">
                        <div className="font-bold text-white">{record.payeeName}</div>
                        <div className="text-xs text-slate-400">{record.bankName} • {record.payeeAccountNumber}</div>
                      </td>
                      <td className="py-4 px-4 text-slate-300">
                        {record.sourceAccountName}
                      </td>
                      <td className="py-4 px-4 text-slate-400">
                        {record.date}
                      </td>
                      <td className="py-4 px-4">
                        <span className="px-2.5 py-1 bg-slate-900 text-slate-300 rounded-lg text-xs font-medium border border-slate-800">
                          {record.type}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-slate-400 max-w-xs truncate">
                        {record.reference}
                      </td>
                      <td className="py-4 px-4 font-bold text-white">
                        {formatCurrency(record.amount)}
                      </td>
                      <td className="py-4 px-4 text-right">
                        <span className={`inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold ${
                          record.status === 'Completed' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          record.status === 'Pending' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                          'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${
                            record.status === 'Completed' ? 'bg-emerald-400' :
                            record.status === 'Pending' ? 'bg-amber-400' :
                            'bg-rose-400'
                          }`}></span>
                          <span>{record.status}</span>
                        </span>
                      </td>
                    </tr>
                  ))}
                  {filteredHistory.length === 0 && (
                    <tr>
                      <td colSpan={7} className="text-center py-12 text-slate-500">
                        No transfer records found matching your criteria.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* ==========================================
            TAB 3: MANAGE PAYEES
            ========================================== */}
        {activeTab === 'payees' && (
          <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
              <div>
                <h2 className="text-xl font-bold text-white">Saved Payees Directory</h2>
                <p className="text-sm text-slate-400 mt-1">Manage your verified domestic payees for faster, secure transfers.</p>
              </div>

              <div className="flex gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-3 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search payees..."
                    value={payeeSearchQuery}
                    onChange={(e) => setPayeeSearchQuery(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  />
                </div>

                <button 
                  onClick={() => { setIsAdhocPayee(true); setActiveTab('transfer'); setCurrentStep('input'); }}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl text-sm transition-all flex items-center space-x-2"
                >
                  <Plus className="h-4 w-4" />
                  <span>Add New Payee</span>
                </button>
              </div>
            </div>

            {/* PAYEES GRID */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {filteredPayees.map((payee) => (
                <div key={payee.id} className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between relative hover:border-slate-700 transition-all">
                  <div className="flex items-start space-x-3">
                    <div className="p-3 bg-slate-800 rounded-xl text-slate-400">
                      {payee.type === 'Business' ? <Building className="h-5 w-5" /> : <User className="h-5 w-5" />}
                    </div>
                    <div className="min-w-0">
                      <h3 className="font-bold text-white text-base truncate">{payee.name}</h3>
                      <p className="text-xs text-slate-400 mt-0.5">{payee.bankName}</p>
                      {payee.nickname && (
                        <span className="inline-block mt-2 px-2 py-0.5 bg-slate-800 text-slate-400 rounded text-[10px] font-medium">
                          {payee.nickname}
                        </span>
                      )}
                    </div>
                  </div>

                  <div className="mt-6 pt-4 border-t border-slate-800/60 space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Account Number</span>
                      <span className="text-slate-300 font-mono">{payee.accountNumber}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Routing Number</span>
                      <span className="text-slate-300 font-mono">{payee.routingNumber}</span>
                    </div>
                    {payee.email && (
                      <div className="flex justify-between">
                        <span className="text-slate-500">Email</span>
                        <span className="text-slate-300 truncate max-w-[180px]">{payee.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="mt-6 flex space-x-2">
                    <button 
                      onClick={() => {
                        setSelectedPayee(payee);
                        setIsAdhocPayee(false);
                        setActiveTab('transfer');
                        setCurrentStep('input');
                      }}
                      className="flex-1 py-2 bg-indigo-600/10 hover:bg-indigo-600 text-indigo-400 hover:text-white font-semibold rounded-lg text-xs transition-all text-center"
                    >
                      Send Money
                    </button>
                    <button 
                      onClick={() => {
                        setPayees(prev => prev.filter(p => p.id !== payee.id));
                      }}
                      className="px-3 py-2 bg-slate-800 hover:bg-rose-950/30 text-slate-400 hover:text-rose-400 rounded-lg text-xs transition-all"
                      title="Delete Payee"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              ))}
              {filteredPayees.length === 0 && (
                <div className="col-span-full text-center py-12 text-slate-500">
                  No saved payees found. Add a payee to get started.
                </div>
              )}
            </div>
          </div>
        )}

      </main>
    </div>
  );
}

// ==========================================
// HELPER COMPONENT: ClockIcon
// ==========================================
function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  );
}