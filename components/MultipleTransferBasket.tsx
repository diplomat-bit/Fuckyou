import React, { useState, useMemo } from 'react';
import { 
  Plus, 
  Trash2, 
  Edit2, 
  CheckCircle2, 
  AlertTriangle, 
  XCircle, 
  ArrowRightLeft, 
  Send, 
  DollarSign, 
  FileText, 
  Layers, 
  Copy, 
  Check, 
  AlertCircle,
  ArrowRight,
  HelpCircle,
  Sparkles,
  RefreshCw
} from 'lucide-react';

// --- TYPES & INTERFACES ---

export type TransferType = 'INTERNAL' | 'EXTERNAL';

export interface Transfer {
  id: string;
  type: TransferType;
  sourceAccountId: string;
  sourceAccountName: string;
  destinationAccount: string;
  destinationName: string;
  routingNumber?: string; // Required for External
  amount: number;
  currency: string;
  reference: string;
  category: string;
}

export interface Account {
  id: string;
  name: string;
  balance: number;
  accountNumber: string;
  currency: string;
}

export interface ValidationError {
  field: string;
  message: string;
  severity: 'error' | 'warning';
}

// --- MOCK DATA BASED ON OPENAPI SCHEMAS ---

const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Corporate Checking (*4321)', balance: 124500.00, accountNumber: '123456784321', currency: 'USD' },
  { id: 'acc-2', name: 'High-Yield Savings (*9876)', balance: 450200.00, accountNumber: '876543219876', currency: 'USD' },
  { id: 'acc-3', name: 'Payroll Reserve (*5544)', balance: 85000.00, accountNumber: '554433221100', currency: 'USD' },
];

const CATEGORIES = ['Payroll', 'Vendor Payment', 'Tax', 'Rent/Lease', 'Intercompany', 'Utilities', 'Other'];

const INITIAL_FORM_STATE: Omit<Transfer, 'id'> = {
  type: 'INTERNAL',
  sourceAccountId: MOCK_ACCOUNTS[0].id,
  sourceAccountName: MOCK_ACCOUNTS[0].name,
  destinationAccount: '',
  destinationName: '',
  routingNumber: '',
  amount: 0,
  currency: 'USD',
  reference: '',
  category: 'Vendor Payment',
};

// --- VALIDATION ENGINE (OpenAPI Schema Rules) ---
// Simulates schema constraints:
// - Amount must be > 0 and <= $100,000 per transaction (External limit)
// - Routing number must be exactly 9 digits (External only)
// - Account number must be between 8 and 17 digits
// - Reference must be <= 35 characters (Fedwire/ACH standard)
// - Warning if balance is exceeded by single or cumulative transfers

const validateTransfer = (transfer: Omit<Transfer, 'id'> | Transfer, sourceAccount?: Account, cumulativeAmountForSource = 0): ValidationError[] => {
  const errors: ValidationError[] = [];

  // Amount validations
  if (!transfer.amount || transfer.amount <= 0) {
    errors.push({ field: 'amount', message: 'Amount must be greater than 0.', severity: 'error' });
  } else if (transfer.type === 'EXTERNAL' && transfer.amount > 50000) {
    errors.push({ field: 'amount', message: 'External transfers exceed single limit of $50,000.', severity: 'warning' });
  } else if (transfer.amount > 100000) {
    errors.push({ field: 'amount', message: 'Transfer exceeds maximum allowable single transaction limit ($100,000).', severity: 'error' });
  }

  // Source Account validation
  if (!transfer.sourceAccountId) {
    errors.push({ field: 'sourceAccountId', message: 'Source account is required.', severity: 'error' });
  } else if (sourceAccount) {
    const totalNeeded = transfer.amount + cumulativeAmountForSource;
    if (totalNeeded > sourceAccount.balance) {
      errors.push({ 
        field: 'amount', 
        message: `Insufficient funds. Required: $${totalNeeded.toLocaleString()}, Available: $${sourceAccount.balance.toLocaleString()}`, 
        severity: 'error' 
      });
    }
  }

  // Destination validations
  if (!transfer.destinationAccount.trim()) {
    errors.push({ field: 'destinationAccount', message: 'Destination account number is required.', severity: 'error' });
  } else if (!/^\d{8,17}$/.test(transfer.destinationAccount.trim())) {
    errors.push({ field: 'destinationAccount', message: 'Account number must be between 8 and 17 digits.', severity: 'error' });
  }

  if (!transfer.destinationName.trim()) {
    errors.push({ field: 'destinationName', message: 'Beneficiary name is required.', severity: 'error' });
  }

  // Routing Number validations (External only)
  if (transfer.type === 'EXTERNAL') {
    if (!transfer.routingNumber?.trim()) {
      errors.push({ field: 'routingNumber', message: 'Routing number is required for external transfers.', severity: 'error' });
    } else if (!/^\d{9}$/.test(transfer.routingNumber.trim())) {
      errors.push({ field: 'routingNumber', message: 'Routing number must be exactly 9 digits.', severity: 'error' });
    }
  }

  // Reference validations
  if (!transfer.reference.trim()) {
    errors.push({ field: 'reference', message: 'Reference/Memo is required.', severity: 'error' });
  } else if (transfer.reference.length > 35) {
    errors.push({ field: 'reference', message: 'Reference exceeds standard 35-character limit.', severity: 'warning' });
  }

  return errors;
};

export default function MultipleTransferBasket() {
  // --- STATE ---
  const [basket, setBasket] = useState<Transfer[]>([
    {
      id: 'tx-1',
      type: 'INTERNAL',
      sourceAccountId: 'acc-1',
      sourceAccountName: 'Corporate Checking (*4321)',
      destinationAccount: '876543219876',
      destinationName: 'High-Yield Savings (*9876)',
      amount: 15000,
      currency: 'USD',
      reference: 'Q3 Internal Rebalance',
      category: 'Intercompany'
    },
    {
      id: 'tx-2',
      type: 'EXTERNAL',
      sourceAccountId: 'acc-1',
      sourceAccountName: 'Corporate Checking (*4321)',
      destinationAccount: '9988776655',
      destinationName: 'Acme Supplies Inc',
      routingNumber: '123456789',
      amount: 42500,
      currency: 'USD',
      reference: 'Inv-2024-0899',
      category: 'Vendor Payment'
    }
  ]);

  const [form, setForm] = useState<Omit<Transfer, 'id'>>(INITIAL_FORM_STATE);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [isSubmittingBatch, setIsSubmittingBatch] = useState(false);
  const [batchSuccess, setBatchSuccess] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState<'ALL' | 'INTERNAL' | 'EXTERNAL'>('ALL');

  // --- HANDLERS ---

  const handleSourceAccountChange = (accountId: string) => {
    const selected = MOCK_ACCOUNTS.find(a => a.id === accountId);
    if (selected) {
      setForm(prev => ({
        ...prev,
        sourceAccountId: selected.id,
        sourceAccountName: selected.name
      }));
    }
  };

  const handleAddOrUpdateTransfer = (e: React.FormEvent) => {
    e.preventDefault();

    // Calculate cumulative amount for this source account excluding current editing item
    const cumulativeAmount = basket
      .filter(t => t.sourceAccountId === form.sourceAccountId && t.id !== editingId)
      .reduce((sum, t) => sum + t.amount, 0);

    const sourceAcc = MOCK_ACCOUNTS.find(a => a.id === form.sourceAccountId);
    const errors = validateTransfer(form, sourceAcc, cumulativeAmount);
    const hasErrors = errors.some(err => err.severity === 'error');

    if (hasErrors) {
      alert('Please resolve all validation errors before adding to the basket.');
      return;
    }

    if (editingId) {
      // Update existing
      setBasket(prev => prev.map(item => item.id === editingId ? { ...form, id: editingId } : item));
      setEditingId(null);
    } else {
      // Add new
      const newTransfer: Transfer = {
        ...form,
        id: `tx-${Date.now()}`
      };
      setBasket(prev => [...prev, newTransfer]);
    }

    // Reset Form
    setForm({
      ...INITIAL_FORM_STATE,
      sourceAccountId: form.sourceAccountId, // Keep last selected source account for convenience
      sourceAccountName: form.sourceAccountName
    });
  };

  const handleEdit = (transfer: Transfer) => {
    setEditingId(transfer.id);
    setForm({
      type: transfer.type,
      sourceAccountId: transfer.sourceAccountId,
      sourceAccountName: transfer.sourceAccountName,
      destinationAccount: transfer.destinationAccount,
      destinationName: transfer.destinationName,
      routingNumber: transfer.routingNumber || '',
      amount: transfer.amount,
      currency: transfer.currency,
      reference: transfer.reference,
      category: transfer.category
    });
  };

  const handleDelete = (id: string) => {
    setBasket(prev => prev.filter(item => item.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm(INITIAL_FORM_STATE);
    }
  };

  const handleDuplicate = (transfer: Transfer) => {
    const duplicated: Transfer = {
      ...transfer,
      id: `tx-${Date.now()}`,
      reference: `${transfer.reference} (Copy)`
    };
    setBasket(prev => [...prev, duplicated]);
  };

  const handleClearBasket = () => {
    if (confirm('Are you sure you want to clear all transfers from the basket?')) {
      setBasket([]);
    }
  };

  const handleExecuteBatch = () => {
    if (basket.length === 0) return;
    
    // Final validation check on all items
    const hasAnyErrors = basket.some(t => {
      const sourceAcc = MOCK_ACCOUNTS.find(a => a.id === t.sourceAccountId);
      const cumulativeAmount = basket
        .filter(item => item.sourceAccountId === t.sourceAccountId && item.id !== t.id)
        .reduce((sum, item) => sum + item.amount, 0);
      return validateTransfer(t, sourceAcc, cumulativeAmount).some(e => e.severity === 'error');
    });

    if (hasAnyErrors) {
      alert('Cannot execute batch. One or more transfers contain validation errors.');
      return;
    }

    setIsSubmittingBatch(true);
    setTimeout(() => {
      setIsSubmittingBatch(false);
      setBatchSuccess(true);
      setBasket([]);
    }, 2500);
  };

  // --- COMPUTED PROPERTIES ---

  const basketWithValidation = useMemo(() => {
    return basket.map(t => {
      const sourceAcc = MOCK_ACCOUNTS.find(a => a.id === t.sourceAccountId);
      // Calculate cumulative amount of other transfers using the same source account
      const cumulativeAmount = basket
        .filter(item => item.sourceAccountId === t.sourceAccountId && item.id !== t.id)
        .reduce((sum, item) => sum + item.amount, 0);

      const errors = validateTransfer(t, sourceAcc, cumulativeAmount);
      return {
        ...t,
        errors,
        isValid: !errors.some(e => e.severity === 'error'),
        hasWarnings: errors.some(e => e.severity === 'warning')
      };
    });
  }, [basket]);

  const filteredBasket = useMemo(() => {
    return basketWithValidation.filter(t => {
      const matchesSearch = 
        t.destinationName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.destinationAccount.includes(searchQuery) ||
        t.reference.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesType = filterType === 'ALL' || t.type === filterType;

      return matchesSearch && matchesType;
    });
  }, [basketWithValidation, searchQuery, filterType]);

  const totals = useMemo(() => {
    return basket.reduce((acc, t) => {
      acc.totalAmount += t.amount;
      acc.count += 1;
      if (t.type === 'INTERNAL') acc.internalCount += 1;
      else acc.externalCount += 1;
      return acc;
    }, { totalAmount: 0, count: 0, internalCount: 0, externalCount: 0 });
  }, [basket]);

  const currentFormErrors = useMemo(() => {
    const sourceAcc = MOCK_ACCOUNTS.find(a => a.id === form.sourceAccountId);
    const cumulativeAmount = basket
      .filter(t => t.sourceAccountId === form.sourceAccountId && t.id !== editingId)
      .reduce((sum, t) => sum + t.amount, 0);
    return validateTransfer(form, sourceAcc, cumulativeAmount);
  }, [form, basket, editingId]);

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-6 lg:p-12 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="max-w-7xl mx-auto mb-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6 border-b border-slate-800 pb-8">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-3 py-1 text-xs font-semibold tracking-wider text-indigo-400 bg-indigo-950/60 border border-indigo-800 rounded-full uppercase">
              Treasury Operations
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-950/40 px-2 py-1 rounded-full border border-emerald-900">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              OpenAPI v3.1 Compliant
            </span>
          </div>
          <h1 className="text-4xl font-extrabold tracking-tight text-white bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            Multiple Transfer Basket
          </h1>
          <p className="text-slate-400 mt-2 max-w-2xl text-sm md:text-base">
            Build, validate, and execute batch domestic payments. Real-time validation against liquidity limits and clearing network schemas.
          </p>
        </div>

        <div className="flex items-center gap-4">
          <div className="bg-slate-800/80 border border-slate-700 rounded-xl p-4 flex items-center gap-4 shadow-xl backdrop-blur-sm">
            <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-lg border border-indigo-500/30">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs text-slate-400 uppercase tracking-wider font-medium">Active Batch</div>
              <div className="text-xl font-bold text-white">{totals.count} Transfers</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace */}
      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Builder */}
        <section className="lg:col-span-5 space-y-6">
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl p-6 shadow-2xl backdrop-blur-md relative overflow-hidden">
            <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500"></div>
            
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-white flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-indigo-400" />
                {editingId ? 'Edit Transfer' : 'Create Transfer'}
              </h2>
              {editingId && (
                <button 
                  onClick={() => { setEditingId(null); setForm(INITIAL_FORM_STATE); }}
                  className="text-xs text-slate-400 hover:text-white underline"
                >
                  Cancel Edit
                </button>
              )}
            </div>

            <form onSubmit={handleAddOrUpdateTransfer} className="space-y-5">
              {/* Transfer Type Toggle */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Transfer Type</label>
                <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/80 rounded-xl border border-slate-700">
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'INTERNAL', routingNumber: '' }))}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      form.type === 'INTERNAL' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <ArrowRightLeft className="w-4 h-4" />
                    Internal Book
                  </button>
                  <button
                    type="button"
                    onClick={() => setForm(prev => ({ ...prev, type: 'EXTERNAL' }))}
                    className={`py-2.5 px-4 rounded-lg text-sm font-medium transition-all duration-200 flex items-center justify-center gap-2 ${
                      form.type === 'EXTERNAL' 
                        ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20' 
                        : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                    }`}
                  >
                    <Send className="w-4 h-4" />
                    External ACH/Wire
                  </button>
                </div>
              </div>

              {/* Source Account */}
              <div>
                <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Source Account</label>
                <select
                  value={form.sourceAccountId}
                  onChange={(e) => handleSourceAccountChange(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                >
                  {MOCK_ACCOUNTS.map(acc => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} — ${acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </option>
                  ))}
                </select>
              </div>

              {/* Destination Details */}
              <div className="space-y-4 p-4 bg-slate-900/40 border border-slate-700/50 rounded-xl">
                <h3 className="text-xs font-bold text-indigo-400 uppercase tracking-wider">Beneficiary Details</h3>
                
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5">Beneficiary Name</label>
                  <input
                    type="text"
                    placeholder="e.g. Acme Corp or John Doe"
                    value={form.destinationName}
                    onChange={(e) => setForm(prev => ({ ...prev, destinationName: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Account Number</label>
                    <input
                      type="text"
                      placeholder="8-17 digits"
                      value={form.destinationAccount}
                      onChange={(e) => setForm(prev => ({ ...prev, destinationAccount: e.target.value }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  {form.type === 'EXTERNAL' && (
                    <div>
                      <label className="block text-xs text-slate-400 mb-1.5">Routing Number (9 Digits)</label>
                      <input
                        type="text"
                        placeholder="Routing Transit"
                        value={form.routingNumber}
                        onChange={(e) => setForm(prev => ({ ...prev, routingNumber: e.target.value }))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3.5 py-2 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Amount & Category */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Amount (USD)</label>
                  <div className="relative">
                    <span className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-500 font-medium">$</span>
                    <input
                      type="number"
                      placeholder="0.00"
                      value={form.amount || ''}
                      onChange={(e) => setForm(prev => ({ ...prev, amount: parseFloat(e.target.value) || 0 }))}
                      className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-8 pr-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">Category</label>
                  <select
                    value={form.category}
                    onChange={(e) => setForm(prev => ({ ...prev, category: e.target.value }))}
                    className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                  >
                    {CATEGORIES.map(cat => (
                      <option key={cat} value={cat}>{cat}</option>
                    ))}
                  </select>
                </div>
              </div>

              {/* Reference */}
              <div>
                <div className="flex justify-between items-center mb-2">
                  <label className="block text-xs font-semibold text-slate-400 uppercase tracking-wider">Payment Reference</label>
                  <span className={`text-[10px] ${form.reference.length > 35 ? 'text-amber-400' : 'text-slate-500'}`}>
                    {form.reference.length}/35 chars
                  </span>
                </div>
                <input
                  type="text"
                  placeholder="e.g. Invoice #1024-A"
                  value={form.reference}
                  onChange={(e) => setForm(prev => ({ ...prev, reference: e.target.value }))}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
              </div>

              {/* Real-time Form Validation Feedback */}
              {currentFormErrors.length > 0 && (
                <div className="p-4 bg-slate-900/90 border border-slate-700/50 rounded-xl space-y-2">
                  <div className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                    <AlertCircle className="w-4 h-4 text-indigo-400" />
                    Live Schema Validation
                  </div>
                  <ul className="space-y-1.5">
                    {currentFormErrors.map((err, idx) => (
                      <li key={idx} className="flex items-start gap-2 text-xs">
                        {err.severity === 'error' ? (
                          <XCircle className="w-3.5 h-3.5 text-rose-500 shrink-0 mt-0.5" />
                        ) : (
                          <AlertTriangle className="w-3.5 h-3.5 text-amber-500 shrink-0 mt-0.5" />
                        )}
                        <span className={err.severity === 'error' ? 'text-rose-200' : 'text-amber-200'}>
                          {err.message}
                        </span>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={currentFormErrors.some(e => e.severity === 'error')}
                className={`w-full py-3.5 px-4 rounded-xl font-semibold text-sm transition-all duration-200 flex items-center justify-center gap-2 ${
                  currentFormErrors.some(e => e.severity === 'error')
                    ? 'bg-slate-700 text-slate-400 cursor-not-allowed'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white shadow-lg shadow-indigo-600/30 active:scale-[0.98]'
                }`}
              >
                {editingId ? (
                  <>
                    <RefreshCw className="w-4 h-4" />
                    Update Transfer in Basket
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4" />
                    Add Transfer to Basket
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Quick Info Card */}
          <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 text-xs text-slate-400 space-y-3">
            <div className="flex items-center gap-2 text-slate-300 font-semibold">
              <HelpCircle className="w-4 h-4 text-indigo-400" />
              Clearing Network Rules
            </div>
            <p>
              Internal transfers clear instantly with zero fees. External transfers are routed via ACH (same-day settlement if submitted before 2:00 PM EST) or Fedwire.
            </p>
            <div className="flex gap-4 text-[11px] text-slate-500">
              <div>• Max Single ACH: $50,000</div>
              <div>• Max Daily Limit: $500,000</div>
            </div>
          </div>
        </section>

        {/* Right Column: Basket List & Summary */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Batch Success State */}
          {batchSuccess && (
            <div className="bg-emerald-950/40 border border-emerald-800/80 rounded-2xl p-6 text-center space-y-4 relative overflow-hidden">
              <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/10 to-transparent pointer-events-none"></div>
              <div className="w-12 h-12 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto border border-emerald-500/30">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-lg font-bold text-white">Batch Executed Successfully</h3>
                <p className="text-slate-400 text-sm mt-1">
                  All transfers have been submitted to the clearing network. Transaction hashes and receipts have been generated.
                </p>
              </div>
              <button 
                onClick={() => setBatchSuccess(false)}
                className="px-4 py-2 bg-emerald-800 hover:bg-emerald-700 text-white text-xs font-semibold rounded-lg transition-colors"
              >
                Dismiss
              </button>
            </div>
          )}

          {/* Basket List Card */}
          <div className="bg-slate-800/50 border border-slate-700/80 rounded-2xl shadow-2xl backdrop-blur-md overflow-hidden flex flex-col min-h-[500px]">
            
            {/* Basket Header */}
            <div className="p-6 border-b border-slate-700/80 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-800/30">
              <div>
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  Transfer Basket
                  <span className="text-xs font-normal text-slate-400 bg-slate-900 px-2.5 py-1 rounded-full border border-slate-700">
                    {filteredBasket.length} of {basket.length} items
                  </span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">Review and manage pending batch transactions.</p>
              </div>

              {basket.length > 0 && (
                <button
                  onClick={handleClearBasket}
                  className="text-xs text-rose-400 hover:text-rose-300 flex items-center gap-1.5 transition-colors self-start sm:self-auto"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  Clear Basket
                </button>
              )}
            </div>

            {/* Filters & Search */}
            <div className="p-4 border-b border-slate-700/50 bg-slate-900/40 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                <input
                  type="text"
                  placeholder="Search by beneficiary, account, reference..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-3.5 pr-10 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:ring-1 focus:ring-indigo-500 focus:border-transparent"
                />
              </div>

              <div className="flex gap-1 bg-slate-900 p-1 rounded-xl border border-slate-700">
                {(['ALL', 'INTERNAL', 'EXTERNAL'] as const).map((type) => (
                  <button
                    key={type}
                    onClick={() => setFilterType(type)}
                    className={`px-3 py-1.5 rounded-lg text-[11px] font-medium transition-all ${
                      filterType === type 
                        ? 'bg-slate-800 text-white shadow-sm' 
                        : 'text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* Basket Items List */}
            <div className="flex-1 overflow-y-auto max-h-[450px] divide-y divide-slate-800/60">
              {filteredBasket.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 px-6 text-center">
                  <div className="w-16 h-16 bg-slate-900 text-slate-600 rounded-full flex items-center justify-center mb-4 border border-slate-800">
                    <Layers className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-slate-300">No transfers in basket</h3>
                  <p className="text-xs text-slate-500 mt-1 max-w-xs">
                    {searchQuery || filterType !== 'ALL' 
                      ? 'No transfers match your active search filters.' 
                      : 'Use the form on the left to build and add transfers to this batch.'}
                  </p>
                </div>
              ) : (
                filteredBasket.map((item) => (
                  <div 
                    key={item.id} 
                    className={`p-5 transition-all duration-150 hover:bg-slate-800/30 flex flex-col md:flex-row md:items-center justify-between gap-4 ${
                      editingId === item.id ? 'bg-indigo-950/20 border-l-2 border-indigo-500' : ''
                    }`}
                  >
                    {/* Left: Transfer Info */}
                    <div className="space-y-2.5 flex-1">
                      <div className="flex items-center gap-2 flex-wrap">
                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold tracking-wider uppercase ${
                          item.type === 'INTERNAL' 
                            ? 'bg-teal-950/60 text-teal-400 border border-teal-900' 
                            : 'bg-purple-950/60 text-purple-400 border border-purple-900'
                        }`}>
                          {item.type}
                        </span>
                        <span className="text-xs text-slate-400 font-medium">
                          From: {item.sourceAccountName.split(' (*')[0]}
                        </span>
                        <ArrowRight className="w-3 h-3 text-slate-600" />
                        <span className="text-xs text-white font-semibold">
                          To: {item.destinationName}
                        </span>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-x-4 gap-y-1 text-xs text-slate-400">
                        <div>
                          <span className="text-slate-500">Account:</span> {item.destinationAccount}
                        </div>
                        {item.routingNumber && (
                          <div>
                            <span className="text-slate-500">Routing:</span> {item.routingNumber}
                          </div>
                        )}
                        <div>
                          <span className="text-slate-500">Category:</span> {item.category}
                        </div>
                      </div>

                      <div className="flex items-center gap-2 text-xs">
                        <span className="text-slate-500">Ref:</span>
                        <span className="text-slate-300 italic">"{item.reference}"</span>
                      </div>

                      {/* Validation Badges */}
                      <div className="flex flex-wrap gap-2 pt-1">
                        {item.isValid && !item.hasWarnings && (
                          <span className="flex items-center gap-1 text-[10px] text-emerald-400 bg-emerald-950/30 px-2 py-0.5 rounded border border-emerald-900">
                            <CheckCircle2 className="w-3 h-3" /> Validated
                          </span>
                        )}
                        {item.errors.map((err, idx) => (
                          <span 
                            key={idx} 
                            className={`flex items-center gap-1 text-[10px] px-2 py-0.5 rounded border ${
                              err.severity === 'error' 
                                ? 'text-rose-400 bg-rose-950/30 border-rose-900' 
                                : 'text-amber-400 bg-amber-950/30 border-amber-900'
                            }`}
                          >
                            {err.severity === 'error' ? <XCircle className="w-3 h-3" /> : <AlertTriangle className="w-3 h-3" />}
                            {err.message}
                          </span>
                        ))}
                      </div>
                    </div>

                    {/* Right: Amount & Actions */}
                    <div className="flex md:flex-col items-end justify-between md:justify-center gap-3 shrink-0 border-t md:border-t-0 pt-3 md:pt-0 border-slate-800">
                      <div className="text-right">
                        <div className="text-lg font-bold text-white">
                          ${item.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </div>
                        <div className="text-[10px] text-slate-500 uppercase tracking-wider">{item.currency}</div>
                      </div>

                      <div className="flex items-center gap-1.5">
                        <button
                          onClick={() => handleEdit(item)}
                          title="Edit Transfer"
                          className="p-2 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        >
                          <Edit2 className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDuplicate(item)}
                          title="Duplicate Transfer"
                          className="p-2 bg-slate-900 hover:bg-slate-700 text-slate-400 hover:text-white rounded-lg border border-slate-700 transition-colors"
                        >
                          <Copy className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(item.id)}
                          title="Delete Transfer"
                          className="p-2 bg-slate-900 hover:bg-rose-950/50 text-slate-400 hover:text-rose-400 rounded-lg border border-slate-700 hover:border-rose-900 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>

            {/* Summary Footer Panel */}
            {basket.length > 0 && (
              <div className="p-6 bg-slate-900 border-t border-slate-700/80 space-y-6">
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Amount</div>
                    <div className="text-lg font-extrabold text-white mt-1">
                      ${totals.totalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </div>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Total Count</div>
                    <div className="text-lg font-extrabold text-white mt-1">{totals.count}</div>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">Internal Book</div>
                    <div className="text-lg font-extrabold text-teal-400 mt-1">{totals.internalCount}</div>
                  </div>

                  <div className="bg-slate-800/40 p-3.5 rounded-xl border border-slate-800">
                    <div className="text-[10px] text-slate-500 uppercase tracking-wider font-semibold">External ACH</div>
                    <div className="text-lg font-extrabold text-purple-400 mt-1">{totals.externalCount}</div>
                  </div>
                </div>

                {/* Action Bar */}
                <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                    All items validated against OpenAPI schema rules.
                  </div>

                  <button
                    onClick={handleExecuteBatch}
                    disabled={isSubmittingBatch || basketWithValidation.some(t => !t.isValid)}
                    className={`w-full sm:w-auto px-8 py-4 rounded-xl font-bold text-sm transition-all duration-200 flex items-center justify-center gap-3 shadow-xl ${
                      basketWithValidation.some(t => !t.isValid)
                        ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                        : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-indigo-600/20 active:scale-[0.98]'
                    }`}
                  >
                    {isSubmittingBatch ? (
                      <>
                        <RefreshCw className="w-4 h-4 animate-spin" />
                        Processing Batch Clearing...
                      </>
                    ) : (
                      <>
                        <Send className="w-4 h-4" />
                        Execute Batch ({totals.count} Payments)
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>
    </div>
  );
}