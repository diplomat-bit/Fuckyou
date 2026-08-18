import React, { useState, useMemo } from 'react';
import {
  ArrowRightLeft,
  CheckCircle2,
  AlertCircle,
  Search,
  Send,
  History,
  UserCheck,
  Plus,
  Info,
  RefreshCw,
  Download,
  FileText,
  TrendingUp,
  ShieldCheck,
  Clock,
  DollarSign,
  ChevronRight,
  HelpCircle,
  Check,
  X
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Beneficiary {
  id: string;
  name: string;
  iban: string;
  bic: string;
  bankName: string;
  isFavorite?: boolean;
  avatarColor: string;
}

interface TransferRecord {
  id: string;
  beneficiaryName: string;
  iban: string;
  amount: number;
  currency: string;
  reference: string;
  type: 'Standard' | 'Instant' | 'Standing Order';
  status: 'Completed' | 'Pending' | 'Processing' | 'Failed';
  date: string;
}

interface EligibilityStatus {
  iban: string;
  isValid: boolean;
  bankName?: string;
  country?: string;
  supportsInstant: boolean;
  sepaDirectDebit: boolean;
  clearingChannel: string;
  error?: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const MOCK_BENEFICIARIES: Beneficiary[] = [
  { id: '1', name: 'Acme Corp Europe', iban: 'DE89370400440532013000', bic: 'DBREDEDDXXX', bankName: 'Deutsche Bank', isFavorite: true, avatarColor: 'bg-blue-500' },
  { id: '2', name: 'Elena Rostova', iban: 'FR7630006000011234567890123', bic: 'BNPAFRPPXXX', bankName: 'BNP Paribas', isFavorite: true, avatarColor: 'bg-emerald-500' },
  { id: '3', name: 'Global Logistics Ltd', iban: 'NL43ABNA0417123456', bic: 'ABNANL2AXXX', bankName: 'ABN AMRO', isFavorite: false, avatarColor: 'bg-indigo-500' },
  { id: '4', name: 'Tech Solutions GmbH', iban: 'AT121200000012345678', bic: 'RZBAATWWXXX', bankName: 'Raiffeisen Bank International', isFavorite: false, avatarColor: 'bg-purple-500' },
];

const INITIAL_TRANSFERS: TransferRecord[] = [
  { id: 'TX-9081', beneficiaryName: 'Acme Corp Europe', iban: 'DE89370400440532013000', amount: 12450.00, currency: 'EUR', reference: 'INV-2024-089', type: 'Instant', status: 'Completed', date: '2024-04-18 14:32' },
  { id: 'TX-9082', beneficiaryName: 'Elena Rostova', iban: 'FR7630006000011234567890123', amount: 450.00, currency: 'EUR', reference: 'Monthly Rent', type: 'Standing Order', status: 'Completed', date: '2024-04-15 09:00' },
  { id: 'TX-9083', beneficiaryName: 'Global Logistics Ltd', iban: 'NL43ABNA0417123456', amount: 8900.00, currency: 'EUR', reference: 'Shipping fees Q1', type: 'Standard', status: 'Pending', date: '2024-04-18 16:10' },
  { id: 'TX-9084', beneficiaryName: 'Tech Solutions GmbH', iban: 'AT121200000012345678', amount: 3100.00, currency: 'EUR', reference: 'Consulting services', type: 'Instant', status: 'Processing', date: '2024-04-18 17:05' },
];

// ==========================================
// MAIN WORKSPACE COMPONENT
// ==========================================

export default function SepaTransferWorkspace() {
  // Tabs: 'transfer' | 'adhoc' | 'eligibility' | 'history'
  const [activeTab, setActiveTab] = useState<'transfer' | 'adhoc' | 'eligibility' | 'history'>('transfer');
  
  // Shared State
  const [transfers, setTransfers] = useState<TransferRecord[]>(INITIAL_TRANSFERS);
  const [prefilledTransfer, setPrefilledTransfer] = useState<{
    name: string;
    iban: string;
    bic: string;
    amount?: string;
    reference?: string;
  } | null>(null);

  // Daily Limit State (Mocking 50,000 EUR daily limit)
  const dailyLimit = 50000;
  const spentToday = useMemo(() => {
    return transfers
      .filter(tx => tx.status !== 'Failed' && tx.date.startsWith('2024-04-18'))
      .reduce((sum, tx) => sum + tx.amount, 0);
  }, [transfers]);

  // Handle pre-filling from eligibility check
  const handleInitiateTransfer = (data: { name: string; iban: string; bic: string }) => {
    setPrefilledTransfer({
      name: data.name || 'Verified Beneficiary',
      iban: data.iban,
      bic: data.bic,
    });
    setActiveTab('transfer');
  };

  // Handle adding a new transfer to history
  const handleAddTransfer = (newTx: Omit<TransferRecord, 'id' | 'date' | 'status'>) => {
    const tx: TransferRecord = {
      ...newTx,
      id: `TX-${Math.floor(1000 + Math.random() * 9000)}`,
      date: new Date().toISOString().replace('T', ' ').substring(0, 16),
      status: newTx.type === 'Instant' ? 'Completed' : 'Pending'
    };
    setTransfers([tx, ...transfers]);
    // Clear prefilled state after use
    setPrefilledTransfer(null);
    // Switch to history tab to see the result
    setActiveTab('history');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 font-sans">
      {/* Header */}
      <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between h-16 items-center">
            <div className="flex items-center space-x-3">
              <div className="p-2 bg-indigo-600 rounded-lg text-white">
                <ArrowRightLeft className="h-6 w-6" />
              </div>
              <div>
                <h1 className="text-xl font-bold text-slate-900">SEPA Transfer Workspace</h1>
                <p className="text-xs text-slate-500">Unified Eurozone Payments & Verification Hub</p>
              </div>
            </div>
            
            {/* Quick Stats */}
            <div className="hidden md:flex items-center space-x-6">
              <div className="text-right">
                <span className="text-xs text-slate-400 block">Daily Limit Progress</span>
                <div className="flex items-center space-x-2 mt-1">
                  <div className="w-32 bg-slate-200 rounded-full h-2">
                    <div 
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-500" 
                      style={{ width: `${Math.min((spentToday / dailyLimit) * 100, 100)}%` }}
                    ></div>
                  </div>
                  <span className="text-xs font-semibold text-slate-700">
                    {spentToday.toLocaleString('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })} / {dailyLimit.toLocaleString('en-US', { style: 'currency', currency: 'EUR', maximumFractionDigits: 0 })}
                  </span>
                </div>
              </div>
              <div className="h-8 w-px bg-slate-200"></div>
              <div className="flex items-center space-x-2 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-full text-xs font-medium border border-emerald-100">
                <ShieldCheck className="h-4 w-4" />
                <span>SEPA Instant Enabled</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Workspace Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Sidebar / Navigation & Quick Actions */}
          <div className="lg:col-span-3 space-y-6">
            {/* Navigation Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <p className="text-xs font-semibold text-slate-400 uppercase tracking-wider px-3 mb-3">Workspace Navigation</p>
              <nav className="space-y-1">
                <button
                  onClick={() => { setActiveTab('transfer'); setPrefilledTransfer(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'transfer'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Send className="h-4 w-4" />
                    <span>Standard Transfer</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === 'transfer' ? 'rotate-90' : ''}`} />
                </button>

                <button
                  onClick={() => { setActiveTab('adhoc'); setPrefilledTransfer(null); }}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'adhoc'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <Plus className="h-4 w-4" />
                    <span>Quick Adhoc Transfer</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === 'adhoc' ? 'rotate-90' : ''}`} />
                </button>

                <button
                  onClick={() => setActiveTab('eligibility')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'eligibility'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <UserCheck className="h-4 w-4" />
                    <span>Eligibility & IBAN Check</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === 'eligibility' ? 'rotate-90' : ''}`} />
                </button>

                <button
                  onClick={() => setActiveTab('history')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium transition-all ${
                    activeTab === 'history'
                      ? 'bg-indigo-50 text-indigo-700'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <History className="h-4 w-4" />
                    <span>Transfer History</span>
                  </div>
                  <ChevronRight className={`h-4 w-4 transition-transform ${activeTab === 'history' ? 'rotate-90' : ''}`} />
                </button>
              </nav>
            </div>

            {/* Quick Stats Card */}
            <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-2xl p-5 shadow-md relative overflow-hidden">
              <div className="absolute -right-6 -bottom-6 opacity-10">
                <ArrowRightLeft className="w-32 h-32" />
              </div>
              <h3 className="text-sm font-semibold text-slate-400">Workspace Summary</h3>
              <div className="mt-4 space-y-4">
                <div>
                  <span className="text-xs text-slate-400 block">Total Outflow (Today)</span>
                  <span className="text-2xl font-bold text-white">
                    {spentToday.toLocaleString('en-US', { style: 'currency', currency: 'EUR' })}
                  </span>
                </div>
                <div className="grid grid-cols-2 gap-2 pt-2 border-t border-slate-700">
                  <div>
                    <span className="text-[10px] text-slate-400 block">Active Transfers</span>
                    <span className="text-sm font-semibold text-emerald-400">
                      {transfers.filter(t => t.status === 'Processing' || t.status === 'Pending').length} Pending
                    </span>
                  </div>
                  <div>
                    <span className="text-[10px] text-slate-400 block">Success Rate</span>
                    <span className="text-sm font-semibold text-indigo-300">99.8%</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Help / Info Card */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 shadow-sm">
              <div className="flex items-start space-x-3">
                <Info className="h-5 w-5 text-indigo-500 shrink-0 mt-0.5" />
                <div>
                  <h4 className="text-xs font-semibold text-slate-900">SEPA Instant Rule</h4>
                  <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                    SEPA Instant transfers process within 10 seconds, 24/7/365, up to a maximum limit of €100,000 per transaction.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Content Area */}
          <div className="lg:col-span-9 space-y-6">
            {/* Dynamic Workspace View */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden min-h-[600px] flex flex-col">
              
              {/* Tab Header Banner */}
              <div className="bg-slate-50 border-b border-slate-200 px-6 py-4 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-900">
                    {activeTab === 'transfer' && 'Standard SEPA Transfer'}
                    {activeTab === 'adhoc' && 'Quick Adhoc Transfer'}
                    {activeTab === 'eligibility' && 'SEPA Eligibility & IBAN Verifier'}
                    {activeTab === 'history' && 'Transfer History & Audit Log'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    {activeTab === 'transfer' && 'Initiate standard, scheduled, or recurring SEPA payments.'}
                    {activeTab === 'adhoc' && 'Send quick, one-off payments to new or un-saved beneficiaries.'}
                    {activeTab === 'eligibility' && 'Verify IBAN format, bank details, and SEPA Instant capabilities.'}
                    {activeTab === 'history' && 'Track, filter, and export all outgoing SEPA transactions.'}
                  </p>
                </div>
                
                {/* Contextual Action Button */}
                {activeTab === 'history' && (
                  <button 
                    onClick={() => {
                      const csvContent = "data:text/csv;charset=utf-8," 
                        + ["ID,Beneficiary,IBAN,Amount,Type,Status,Date"].join(",") + "\n"
                        + transfers.map(t => `${t.id},"${t.beneficiaryName}",${t.iban},${t.amount},${t.type},${t.status},"${t.date}"`).join("\n");
                      const encodedUri = encodeURI(csvContent);
                      const link = document.createElement("a");
                      link.setAttribute("href", encodedUri);
                      link.setAttribute("download", "sepa_transfers_export.csv");
                      document.body.appendChild(link);
                      link.click();
                      document.body.removeChild(link);
                    }}
                    className="flex items-center space-x-2 bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 px-3 py-1.5 rounded-lg text-xs font-medium transition-all shadow-sm"
                  >
                    <Download className="h-3.5 w-3.5" />
                    <span>Export CSV</span>
                  </button>
                )}
              </div>

              {/* Tab Content Switcher */}
              <div className="p-6 flex-1 flex flex-col">
                {activeTab === 'transfer' && (
                  <SepaTransferForm 
                    prefilled={prefilledTransfer} 
                    onSubmit={handleAddTransfer} 
                    beneficiaries={MOCK_BENEFICIARIES}
                  />
                )}

                {activeTab === 'adhoc' && (
                  <AdhocTransferForm 
                    onSubmit={handleAddTransfer} 
                  />
                )}

                {activeTab === 'eligibility' && (
                  <EligibilityChecker 
                    onInitiateTransfer={handleInitiateTransfer} 
                  />
                )}

                {activeTab === 'history' && (
                  <TransferHistory 
                    transfers={transfers} 
                  />
                )}
              </div>
            </div>
          </div>

        </div>
      </main>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: STANDARD SEPA TRANSFER FORM
// ==========================================

interface SepaTransferFormProps {
  prefilled: { name: string; iban: string; bic: string; amount?: string; reference?: string } | null;
  onSubmit: (tx: Omit<TransferRecord, 'id' | 'date' | 'status'>) => void;
  beneficiaries: Beneficiary[];
}

function SepaTransferForm({ prefilled, onSubmit, beneficiaries }: SepaTransferFormProps) {
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>('');
  const [customName, setCustomName] = useState('');
  const [customIban, setCustomIban] = useState('');
  const [customBic, setCustomBic] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [transferType, setTransferType] = useState<'Standard' | 'Instant' | 'Standing Order'>('Instant');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  // Handle prefilled data from eligibility check
  React.useEffect(() => {
    if (prefilled) {
      setSelectedBeneficiaryId('custom');
      setCustomName(prefilled.name);
      setCustomIban(prefilled.iban);
      setCustomBic(prefilled.bic);
      if (prefilled.amount) setAmount(prefilled.amount);
      if (prefilled.reference) setReference(prefilled.reference);
    }
  }, [prefilled]);

  const selectedBeneficiary = useMemo(() => {
    return beneficiaries.find(b => b.id === selectedBeneficiaryId);
  }, [selectedBeneficiaryId, beneficiaries]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    const finalName = selectedBeneficiary ? selectedBeneficiary.name : customName;
    const finalIban = selectedBeneficiary ? selectedBeneficiary.iban : customIban;
    const finalBic = selectedBeneficiary ? selectedBeneficiary.bic : customBic;

    if (!finalName || !finalIban || !finalBic || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    if (parseFloat(amount) <= 0) {
      setError('Amount must be greater than 0.');
      return;
    }

    setIsSubmitting(true);

    // Simulate API call delay
    setTimeout(() => {
      onSubmit({
        beneficiaryName: finalName,
        iban: finalIban,
        currency: 'EUR',
        amount: parseFloat(amount),
        reference: reference || 'N/A',
        type: transferType,
      });
      setIsSubmitting(false);
      // Reset form
      setSelectedBeneficiaryId('');
      setCustomName('');
      setCustomIban('');
      setCustomBic('');
      setAmount('');
      setReference('');
    }, 1200);
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 max-w-2xl mx-auto w-full">
      {error && (
        <div className="p-4 bg-rose-50 border border-rose-200 rounded-xl flex items-center space-x-3 text-rose-700 text-sm">
          <AlertCircle className="h-5 w-5 shrink-0" />
          <span>{error}</span>
        </div>
      )}

      {/* Beneficiary Selection */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">Select Beneficiary</label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {beneficiaries.map((b) => (
            <button
              key={b.id}
              type="button"
              onClick={() => {
                setSelectedBeneficiaryId(b.id);
                setError('');
              }}
              className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
                selectedBeneficiaryId === b.id
                  ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                  : 'border-slate-200 hover:border-slate-300 bg-white'
              }`}
            >
              <div className={`w-10 h-10 rounded-full ${b.avatarColor} flex items-center justify-center text-white font-bold text-sm`}>
                {b.name.split(' ').map(n => n[0]).join('').substring(0, 2)}
              </div>
              <div className="overflow-hidden">
                <p className="text-sm font-semibold text-slate-900 truncate">{b.name}</p>
                <p className="text-xs text-slate-500 truncate">{b.bankName}</p>
                <p className="text-[10px] text-slate-400 truncate mt-0.5">{b.iban}</p>
              </div>
            </button>
          ))}

          <button
            type="button"
            onClick={() => {
              setSelectedBeneficiaryId('custom');
              setCustomName('');
              setCustomIban('');
              setCustomBic('');
            }}
            className={`p-4 rounded-xl border text-left transition-all flex items-center space-x-3 ${
              selectedBeneficiaryId === 'custom'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-sm border border-dashed border-slate-300">
              <Plus className="h-5 w-5" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-900">New Beneficiary</p>
              <p className="text-xs text-slate-500">Enter custom IBAN & BIC</p>
            </div>
          </button>
        </div>
      </div>

      {/* Custom Beneficiary Fields */}
      {selectedBeneficiaryId === 'custom' && (
        <div className="p-5 bg-slate-50 rounded-2xl border border-slate-200 space-y-4 animate-fadeIn">
          <h3 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Beneficiary Details</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Full Name / Company</label>
              <input
                type="text"
                value={customName}
                onChange={(e) => setCustomName(e.target.value)}
                placeholder="e.g. John Doe"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">IBAN</label>
              <input
                type="text"
                value={customIban}
                onChange={(e) => setCustomIban(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                placeholder="e.g. DE89..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
            <div className="md:col-span-2">
              <label className="block text-xs font-medium text-slate-600 mb-1">BIC (SWIFT)</label>
              <input
                type="text"
                value={customBic}
                onChange={(e) => setCustomBic(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                placeholder="e.g. DBREDEDDXXX"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>
          </div>
        </div>
      )}

      {/* Transfer Details */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Amount (EUR)</label>
          <div className="relative">
            <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
              <span className="text-slate-400 text-sm">€</span>
            </div>
            <input
              type="number"
              step="0.01"
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              placeholder="0.00"
              className="w-full pl-8 pr-3 py-2.5 border border-slate-200 rounded-xl text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              required
            />
          </div>
        </div>

        <div>
          <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider mb-1">Payment Reference</label>
          <input
            type="text"
            value={reference}
            onChange={(e) => setReference(e.target.value)}
            placeholder="e.g. Invoice #102"
            className="w-full px-3 py-2.5 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>
      </div>

      {/* Transfer Type Selector */}
      <div className="space-y-2">
        <label className="block text-xs font-semibold text-slate-500 uppercase tracking-wider">SEPA Transfer Type</label>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <button
            type="button"
            onClick={() => setTransferType('Instant')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              transferType === 'Instant'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-indigo-600 bg-indigo-100 px-2 py-0.5 rounded">Instant</span>
              <Clock className="h-4 w-4 text-indigo-600" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-900">SEPA Instant</p>
              <p className="text-xs text-slate-500 mt-0.5">Settles in 10 seconds. 24/7 availability.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTransferType('Standard')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              transferType === 'Standard'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-slate-600 bg-slate-100 px-2 py-0.5 rounded">Standard</span>
              <ArrowRightLeft className="h-4 w-4 text-slate-600" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-900">SEPA Credit Transfer</p>
              <p className="text-xs text-slate-500 mt-0.5">Settles next business day. Standard routing.</p>
            </div>
          </button>

          <button
            type="button"
            onClick={() => setTransferType('Standing Order')}
            className={`p-4 rounded-xl border text-left transition-all flex flex-col justify-between ${
              transferType === 'Standing Order'
                ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-600/20'
                : 'border-slate-200 hover:border-slate-300 bg-white'
            }`}
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-xs font-bold text-purple-600 bg-purple-100 px-2 py-0.5 rounded">Recurring</span>
              <RefreshCw className="h-4 w-4 text-purple-600" />
            </div>
            <div className="mt-4">
              <p className="text-sm font-semibold text-slate-900">Standing Order</p>
              <p className="text-xs text-slate-500 mt-0.5">Set up automated recurring monthly payments.</p>
            </div>
          </button>
        </div>
      </div>

      {/* Submit Button */}
      <div className="pt-4">
        <button
          type="submit"
          disabled={isSubmitting}
          className="w-full bg-indigo-600 hover:bg-indigo-700 text-white font-semibold py-3 px-4 rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
        >
          {isSubmitting ? (
            <>
              <RefreshCw className="h-5 w-5 animate-spin" />
              <span>Processing SEPA Routing...</span>
            </>
          ) : (
            <>
              <Send className="h-5 w-5" />
              <span>Authorize & Send Payment</span>
            </>
          )}
        </button>
      </div>
    </form>
  );
}

// ==========================================
// SUB-COMPONENT: ADHOC TRANSFER FORM
// ==========================================

interface AdhocTransferFormProps {
  onSubmit: (tx: Omit<TransferRecord, 'id' | 'date' | 'status'>) => void;
}

function AdhocTransferForm({ onSubmit }: AdhocTransferFormProps) {
  const [name, setName] = useState('');
  const [iban, setIban] = useState('');
  const [bic, setBic] = useState('');
  const [amount, setAmount] = useState('');
  const [reference, setReference] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState('');

  const handleQuickAmount = (val: number) => {
    setAmount(val.toString());
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!name || !iban || !amount) {
      setError('Please fill in all required fields.');
      return;
    }

    setIsSubmitting(true);

    // Simulate quick adhoc processing
    setTimeout(() => {
      onSubmit({
        beneficiaryName: name,
        iban: iban,
        currency: 'EUR',
        amount: parseFloat(amount),
        reference: reference || 'Adhoc Transfer',
        type: 'Instant',
      });
      setIsSubmitting(false);
    }, 1000);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 max-w-5xl mx-auto w-full">
      {/* Left Column: Form */}
      <div className="lg:col-span-7 space-y-6">
        <div className="bg-slate-50 p-5 rounded-2xl border border-slate-200">
          <h3 className="text-sm font-bold text-slate-800 mb-4 flex items-center space-x-2">
            <Plus className="h-4 w-4 text-indigo-600" />
            <span>One-Off Recipient Details</span>
          </h3>

          <form onSubmit={handleSubmit} className="space-y-4">
            {error && (
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg flex items-center space-x-2 text-rose-700 text-xs">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">Recipient Name</label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Max Mustermann"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">IBAN</label>
              <input
                type="text"
                value={iban}
                onChange={(e) => setIban(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                placeholder="e.g. DE89 3704 0044..."
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                required
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-600 mb-1">BIC (Optional - Auto-routed if blank)</label>
              <input
                type="text"
                value={bic}
                onChange={(e) => setBic(e.target.value.toUpperCase().replace(/\s+/g, ''))}
                placeholder="e.g. DBREDEDDXXX"
                className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Amount (EUR)</label>
                <input
                  type="number"
                  step="0.01"
                  value={amount}
                  onChange={(e) => setAmount(e.target.value)}
                  placeholder="0.00"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm font-semibold focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                  required
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-slate-600 mb-1">Reference</label>
                <input
                  type="text"
                  value={reference}
                  onChange={(e) => setReference(e.target.value)}
                  placeholder="e.g. Dinner split"
                  className="w-full px-3 py-2 border border-slate-200 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full bg-slate-900 hover:bg-slate-800 text-white font-semibold py-2.5 px-4 rounded-xl transition-all flex items-center justify-center space-x-2 disabled:opacity-50"
            >
              {isSubmitting ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Send className="h-4 w-4" />
              )}
              <span>Send Instant Adhoc Payment</span>
            </button>
          </form>
        </div>
      </div>

      {/* Right Column: Quick Presets & Info */}
      <div className="lg:col-span-5 space-y-6">
        {/* Quick Amount Presets */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200">
          <h4 className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-3">Quick Amount Presets</h4>
          <div className="grid grid-cols-3 gap-2">
            {[10, 25, 50, 100, 250, 500].map((val) => (
              <button
                key={val}
                type="button"
                onClick={() => handleQuickAmount(val)}
                className="py-2 px-3 border border-slate-200 hover:border-indigo-500 hover:bg-indigo-50/30 rounded-lg text-sm font-semibold text-slate-700 transition-all text-center"
              >
                €{val}
              </button>
            ))}
          </div>
        </div>

        {/* Security Notice */}
        <div className="bg-amber-50/50 border border-amber-200 rounded-2xl p-5 space-y-3">
          <div className="flex items-center space-x-2 text-amber-800">
            <ShieldCheck className="h-5 w-5 shrink-0" />
            <h4 className="text-sm font-bold">Adhoc Safety Check</h4>
          </div>
          <p className="text-xs text-amber-700 leading-relaxed">
            Adhoc transfers bypass your saved beneficiary list. Please double-check the IBAN. Once authorized via your 2FA device, SEPA Instant transfers cannot be recalled or reversed.
          </p>
        </div>
      </div>
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: ELIGIBILITY & IBAN CHECKER
// ==========================================

interface EligibilityCheckerProps {
  onInitiateTransfer: (data: { name: string; iban: string; bic: string }) => void;
}

function EligibilityChecker({ onInitiateTransfer }: EligibilityCheckerProps) {
  const [ibanInput, setIbanInput] = useState('');
  const [isChecking, setIsChecking] = useState(false);
  const [result, setResult] = useState<EligibilityStatus | null>(null);

  const handleCheck = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ibanInput) return;

    setIsChecking(true);
    setResult(null);

    // Simulate IBAN validation and SEPA routing lookup
    setTimeout(() => {
      const cleanIban = ibanInput.toUpperCase().replace(/\s+/g, '');
      const countryCode = cleanIban.substring(0, 2);
      
      // Simple mock validation rules
      const isValidLength = cleanIban.length >= 15 && cleanIban.length <= 34;
      const knownCountries = ['DE', 'FR', 'NL', 'AT', 'ES', 'IT', 'BE', 'IE'];
      const isSupportedCountry = knownCountries.includes(countryCode);

      if (isValidLength && isSupportedCountry) {
        // Mock successful lookup
        const bankNames: Record<string, string> = {
          DE: 'Deutsche Bank AG',
          FR: 'Société Générale',
          NL: 'ING Bank N.V.',
          AT: 'Erste Group Bank AG',
          ES: 'Banco Santander S.A.',
          IT: 'Intesa Sanpaolo S.p.A.',
          BE: 'KBC Bank NV',
          IE: 'Bank of Ireland'
        };

        setResult({
          iban: cleanIban,
          isValid: true,
          bankName: bankNames[countryCode] || 'Eurozone Clearing Bank',
          country: countryCode,
          supportsInstant: countryCode !== 'IE', // Mocking Ireland as non-instant for variety
          sepaDirectDebit: true,
          clearingChannel: countryCode === 'DE' || countryCode === 'FR' ? 'EBA CLEARING (STEP2)' : 'TARGET Instant Payment Settlement (TIPS)'
        });
      } else {
        setResult({
          iban: cleanIban,
          isValid: false,
          supportsInstant: false,
          sepaDirectDebit: false,
          clearingChannel: 'None',
          error: !isSupportedCountry 
            ? `Country code "${countryCode}" is not a registered SEPA zone member or not supported in this workspace.`
            : 'Invalid IBAN format or checksum failure.'
        });
      }
      setIsChecking(false);
    }, 1500);
  };

  return (
    <div className="max-w-3xl mx-auto w-full space-y-6">
      {/* Search Form */}
      <form onSubmit={handleCheck} className="space-y-4">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="h-5 w-5 text-slate-400" />
          </div>
          <input
            type="text"
            value={ibanInput}
            onChange={(e) => setIbanInput(e.target.value)}
            placeholder="Enter Eurozone IBAN (e.g. DE89 3704 0044...)"
            className="w-full pl-11 pr-32 py-3.5 border border-slate-200 rounded-2xl text-sm font-mono focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 shadow-sm"
            required
          />
          <div className="absolute inset-y-2 right-2">
            <button
              type="submit"
              disabled={isChecking}
              className="h-full bg-indigo-600 hover:bg-indigo-700 text-white px-4 rounded-xl text-xs font-semibold transition-all flex items-center space-x-1.5 disabled:opacity-50"
            >
              {isChecking ? (
                <RefreshCw className="h-3.5 w-3.5 animate-spin" />
              ) : (
                <span>Verify Routing</span>
              )}
            </button>
          </div>
        </div>
        <p className="text-[11px] text-slate-400 text-center">
          Supports all 36 SEPA countries including UK, Switzerland, and EEA members.
        </p>
      </form>

      {/* Results Display */}
      {result && (
        <div className="bg-slate-50 rounded-2xl border border-slate-200 p-6 space-y-6 animate-fadeIn">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Verification Result</h3>
              <p className="text-xs font-mono text-slate-600 mt-1 break-all">{result.iban}</p>
            </div>
            <span className={`px-3 py-1 rounded-full text-xs font-bold flex items-center space-x-1 ${
              result.isValid ? 'bg-emerald-100 text-emerald-800' : 'bg-rose-100 text-rose-800'
            }`}>
              {result.isValid ? (
                <>
                  <Check className="h-3.5 w-3.5" />
                  <span>Valid SEPA IBAN</span>
                </>
              ) : (
                <>
                  <X className="h-3.5 w-3.5" />
                  <span>Invalid IBAN</span>
                </>
              )}
            </span>
          </div>

          {result.isValid ? (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-slate-200">
              {/* Bank Details */}
              <div className="space-y-3">
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Institution / Bank</span>
                  <span className="text-sm font-bold text-slate-800">{result.bankName}</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Country Jurisdiction</span>
                  <span className="text-sm font-semibold text-slate-700">{result.country} (Eurozone)</span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 block uppercase font-semibold">Clearing Channel</span>
                  <span className="text-xs font-mono text-slate-600 bg-slate-200/60 px-2 py-1 rounded inline-block mt-1">
                    {result.clearingChannel}
                  </span>
                </div>
              </div>

              {/* Capabilities */}
              <div className="space-y-3 bg-white p-4 rounded-xl border border-slate-200">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-2">Supported Schemes</h4>
                
                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">SEPA Credit Transfer (SCT)</span>
                  <span className="text-emerald-600 font-bold flex items-center space-x-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>Supported</span>
                  </span>
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">SEPA Instant Credit Transfer (SCT Inst)</span>
                  {result.supportsInstant ? (
                    <span className="text-emerald-600 font-bold flex items-center space-x-1">
                      <Check className="h-3.5 w-3.5" />
                      <span>Supported (10s)</span>
                    </span>
                  ) : (
                    <span className="text-amber-600 font-bold flex items-center space-x-1">
                      <AlertCircle className="h-3.5 w-3.5" />
                      <span>Standard Only</span>
                    </span>
                  )}
                </div>

                <div className="flex items-center justify-between text-xs">
                  <span className="text-slate-600">SEPA Direct Debit (SDD)</span>
                  <span className="text-emerald-600 font-bold flex items-center space-x-1">
                    <Check className="h-3.5 w-3.5" />
                    <span>Core & B2B</span>
                  </span>
                </div>
              </div>

              {/* Action Button to prefill */}
              <div className="md:col-span-2 pt-4 border-t border-slate-200 flex justify-end">
                <button
                  onClick={() => onInitiateTransfer({
                    name: result.bankName || 'Verified Beneficiary',
                    iban: result.iban,
                    bic: result.country ? `${result.country}XXXXXX` : 'GENERICXXX'
                  })}
                  className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center space-x-2 shadow-sm"
                >
                  <Send className="h-3.5 w-3.5" />
                  <span>Transfer to this Verified IBAN</span>
                </button>
              </div>
            </div>
          ) : (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl text-rose-700 text-xs flex items-start space-x-2">
              <AlertCircle className="h-4 w-4 shrink-0 mt-0.5" />
              <div>
                <p className="font-bold">Routing Verification Failed</p>
                <p className="mt-1 leading-relaxed">{result.error}</p>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

// ==========================================
// SUB-COMPONENT: TRANSFER HISTORY & AUDIT LOG
// ==========================================

interface TransferHistoryProps {
  transfers: TransferRecord[];
}

function TransferHistory({ transfers }: TransferHistoryProps) {
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState<string>('All');

  const filteredTransfers = useMemo(() => {
    return transfers.filter(tx => {
      const matchesSearch = 
        tx.beneficiaryName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.iban.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.reference.toLowerCase().includes(searchTerm.toLowerCase()) ||
        tx.id.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesStatus = statusFilter === 'All' || tx.status === statusFilter;

      return matchesSearch && matchesStatus;
    });
  }, [transfers, searchTerm, statusFilter]);

  return (
    <div className="space-y-4 w-full">
      {/* Filters Bar */}
      <div className="flex flex-col sm:flex-row gap-3 justify-between items-center">
        {/* Search */}
        <div className="relative w-full sm:w-72">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <Search className="h-4 w-4 text-slate-400" />
          </div>
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by name, IBAN, ref..."
            className="w-full pl-9 pr-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500"
          />
        </div>

        {/* Status Filter */}
        <div className="flex items-center space-x-2 w-full sm:w-auto justify-end">
          <span className="text-xs text-slate-500">Status:</span>
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-2 border border-slate-200 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 bg-white"
          >
            <option value="All">All Statuses</option>
            <option value="Completed">Completed</option>
            <option value="Pending">Pending</option>
            <option value="Processing">Processing</option>
            <option value="Failed">Failed</option>
          </select>
        </div>
      </div>

      {/* Table / List */}
      <div className="border border-slate-200 rounded-2xl overflow-hidden bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-slate-50 border-b border-slate-200 text-[10px] font-bold text-slate-400 uppercase tracking-wider">
                <th className="py-3 px-4">Transaction ID</th>
                <th className="py-3 px-4">Beneficiary</th>
                <th className="py-3 px-4">Type</th>
                <th className="py-3 px-4">Amount</th>
                <th className="py-3 px-4">Status</th>
                <th className="py-3 px-4">Date</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 text-xs">
              {filteredTransfers.length > 0 ? (
                filteredTransfers.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="py-3.5 px-4 font-mono font-semibold text-slate-600">{tx.id}</td>
                    <td className="py-3.5 px-4">
                      <div>
                        <p className="font-bold text-slate-900">{tx.beneficiaryName}</p>
                        <p className="text-[10px] text-slate-400 font-mono truncate max-w-[180px]">{tx.iban}</p>
                        <p className="text-[10px] text-slate-500 italic mt-0.5">Ref: {tx.reference}</p>
                      </div>
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        tx.type === 'Instant' 
                          ? 'bg-indigo-50 text-indigo-700 border border-indigo-100' 
                          : tx.type === 'Standing Order'
                          ? 'bg-purple-50 text-purple-700 border border-purple-100'
                          : 'bg-slate-100 text-slate-700'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 font-bold text-slate-900">
                      {tx.amount.toLocaleString('en-US', { style: 'currency', currency: tx.currency })}
                    </td>
                    <td className="py-3.5 px-4">
                      <span className={`inline-flex items-center space-x-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                        tx.status === 'Completed' ? 'bg-emerald-50 text-emerald-700' :
                        tx.status === 'Pending' ? 'bg-amber-50 text-amber-700' :
                        tx.status === 'Processing' ? 'bg-blue-50 text-blue-700' :
                        'bg-rose-50 text-rose-700'
                      }`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${
                          tx.status === 'Completed' ? 'bg-emerald-500' :
                          tx.status === 'Pending' ? 'bg-amber-500' :
                          tx.status === 'Processing' ? 'bg-blue-500' :
                          'bg-rose-500'
                        }`} />
                        <span>{tx.status}</span>
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-500 whitespace-nowrap">{tx.date}</td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={6} className="py-8 text-center text-slate-400">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <FileText className="h-8 w-8 text-slate-300" />
                      <p className="text-sm">No transfers found matching the criteria.</p>
                    </div>
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}