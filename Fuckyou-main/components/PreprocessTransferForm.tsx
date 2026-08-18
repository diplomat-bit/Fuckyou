import React, { useState, useEffect } from 'react';
import { 
  ArrowRight, 
  CheckCircle2, 
  AlertTriangle, 
  Info, 
  Calendar, 
  DollarSign, 
  Globe, 
  RefreshCw, 
  ShieldCheck, 
  User, 
  CreditCard, 
  FileText, 
  HelpCircle,
  ArrowLeftRight,
  Send,
  Check
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Account {
  id: string;
  accountNumber: string;
  accountName: string;
  balance: number;
  currency: string;
  bankName: string;
  country: string;
}

export interface Payee {
  id: string;
  name: string;
  accountNumber: string;
  routingNumber?: string;
  swiftBic: string;
  bankName: string;
  bankAddress: string;
  country: string;
  currency: string;
}

export interface PreprocessRequest {
  sourceAccountId: string;
  payeeId: string;
  amount: number;
  currency: string;
  chargeBearer: 'OUR' | 'BEN' | 'SHA';
  scheduleType: 'IMMEDIATE' | 'SCHEDULED' | 'RECURRING';
  scheduledDate?: string;
  recurrenceFrequency?: 'WEEKLY' | 'MONTHLY' | 'QUARTERLY';
  purposeOfPayment: string;
}

export interface PreprocessResponse {
  success: boolean;
  transactionToken: string;
  fxRate: number;
  sourceAmount: number;
  targetAmount: number;
  fees: {
    transferFee: number;
    fxMarkup: number;
    correspondentBankFee: number;
    totalFees: number;
  };
  estimatedDelivery: string;
  complianceCheck: {
    status: 'PASSED' | 'WARNING' | 'FAILED';
    message: string;
    requiresDocumentation: boolean;
  };
  chargeBearer: 'OUR' | 'BEN' | 'SHA';
}

// ==========================================
// MOCK DATA SERVICE (Fallback & Simulation)
// ==========================================

const MOCK_ACCOUNTS: Account[] = [
  { id: 'acc-1', accountNumber: 'US893704000923847293', accountName: 'Corporate Operating Account', balance: 1245000.00, currency: 'USD', bankName: 'Apex Global Bank', country: 'United States' },
  { id: 'acc-2', accountNumber: 'GB21BARC200394827394', accountName: 'UK Subsidiary Treasury', balance: 450000.00, currency: 'GBP', bankName: 'Barclays PLC', country: 'United Kingdom' },
  { id: 'acc-3', accountNumber: 'DE493704004405320192', accountName: 'EU Payroll Reserve', balance: 890000.00, currency: 'EUR', bankName: 'Deutsche Bank AG', country: 'Germany' },
  { id: 'acc-4', accountNumber: 'SG11UOB8930291827301', accountName: 'APAC Expansion Fund', balance: 2100000.00, currency: 'SGD', bankName: 'United Overseas Bank', country: 'Singapore' }
];

const MOCK_PAYEES: Payee[] = [
  { id: 'pay-1', name: 'Tokyo Electronics Corp', accountNumber: 'JP3900010002938475', swiftBic: 'BOTKJPJTXXX', bankName: 'MUFG Bank, Ltd.', bankAddress: '7-1, Marunouchi 2-chome, Chiyoda-ku', country: 'Japan', currency: 'JPY' },
  { id: 'pay-2', name: 'Munich Auto Parts GmbH', accountNumber: 'DE893704004409988776', swiftBic: 'DEUTDEDBXXX', bankName: 'Deutsche Bank AG', bankAddress: 'Taunusanlage 12, Frankfurt', country: 'Germany', currency: 'EUR' },
  { id: 'pay-3', name: 'London Consulting Group', accountNumber: 'GB44LLOY309281726354', swiftBic: 'LOYDGB2LXXX', bankName: 'Lloyds Bank PLC', bankAddress: '25 Gresham Street, London', country: 'United Kingdom', currency: 'GBP' },
  { id: 'pay-4', name: 'Sydney Logistics Ltd', accountNumber: 'AU12WESP0392817263', swiftBic: 'WPACAU2SXXX', bankName: 'Westpac Banking Corporation', bankAddress: '275 Kent Street, Sydney', country: 'Australia', currency: 'AUD' }
];

const FX_RATES: Record<string, Record<string, number>> = {
  USD: { EUR: 0.92, GBP: 0.79, JPY: 151.45, SGD: 1.34, AUD: 1.52, USD: 1.0 },
  GBP: { USD: 1.27, EUR: 1.17, JPY: 191.80, SGD: 1.70, AUD: 1.93, GBP: 1.0 },
  EUR: { USD: 1.09, GBP: 0.86, JPY: 164.20, SGD: 1.46, AUD: 1.65, EUR: 1.0 },
  SGD: { USD: 0.75, EUR: 0.69, GBP: 0.59, JPY: 112.80, AUD: 1.13, SGD: 1.0 }
};

const MockDataService = {
  getAccounts: async (): Promise<Account[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_ACCOUNTS), 600));
  },
  getPayees: async (): Promise<Payee[]> => {
    return new Promise((resolve) => setTimeout(() => resolve(MOCK_PAYEES), 600));
  },
  preprocessTransfer: async (request: PreprocessRequest): Promise<PreprocessResponse> => {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        const sourceAcc = MOCK_ACCOUNTS.find(a => a.id === request.sourceAccountId);
        const payee = MOCK_PAYEES.find(p => p.id === request.payeeId);

        if (!sourceAcc || !payee) {
          reject(new Error("Invalid source account or payee selection."));
          return;
        }

        // Calculate FX Rate
        const sourceCurr = sourceAcc.currency;
        const targetCurr = request.currency;
        const baseRate = FX_RATES[sourceCurr]?.[targetCurr] || 1.0;
        const fxRate = baseRate * 0.995; // Apply a small spread

        const sourceAmount = request.amount;
        const targetAmount = sourceAmount * fxRate;

        // Calculate Fees based on Charge Bearer
        let transferFee = 15.00; // Base wire fee in Source Currency
        let fxMarkup = sourceAmount * 0.005; // 0.5% FX markup
        let correspondentBankFee = 25.00; // Standard intermediary fee

        if (request.chargeBearer === 'BEN') {
          // Recipient pays all fees, deducted from target amount
          transferFee = 0;
          fxMarkup = 0;
        } else if (request.chargeBearer === 'OUR') {
          // Sender pays all fees
          correspondentBankFee = 35.00; // Guaranteed delivery fee
        } else {
          // Shared
          correspondentBankFee = 12.50;
        }

        const totalFees = transferFee + fxMarkup + correspondentBankFee;

        // Compliance simulation
        let complianceStatus: 'PASSED' | 'WARNING' | 'FAILED' = 'PASSED';
        let complianceMessage = 'Sanctions screening and AML checks passed successfully.';
        let requiresDocs = false;

        if (sourceAmount > 500000) {
          complianceStatus = 'WARNING';
          complianceMessage = 'High-value transaction requires secondary treasury authorization and supporting invoice documentation.';
          requiresDocs = true;
        } else if (sourceAmount > 100000) {
          complianceStatus = 'WARNING';
          complianceMessage = 'Standard compliance review triggered. No immediate action required.';
        }

        resolve({
          success: true,
          transactionToken: `TXN-PRE-${Math.random().toString(36).substring(2, 11).toUpperCase()}`,
          fxRate,
          sourceAmount,
          targetAmount,
          fees: {
            transferFee,
            fxMarkup,
            correspondentBankFee,
            totalFees
          },
          estimatedDelivery: new Date(Date.now() + 86400000 * 2).toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' }),
          complianceCheck: {
            status: complianceStatus,
            message: complianceMessage,
            requiresDocumentation: requiresDocs
          },
          chargeBearer: request.chargeBearer
        });
      }, 1500);
    });
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function PreprocessTransferForm() {
  // State Management
  const [accounts, setAccounts] = useState<Account[]>([]);
  const [payees, setPayees] = useState<Payee[]>([]);
  const [loadingData, setLoadingData] = useState<boolean>(true);
  const [submitting, setSubmitting] = useState<boolean>(false);
  const [step, setStep] = useState<1 | 2>(1); // 1: Form, 2: Preprocess Review

  // Form Fields
  const [sourceAccountId, setSourceAccountId] = useState<string>('');
  const [payeeId, setPayeeId] = useState<string>('');
  const [amount, setAmount] = useState<string>('');
  const [currency, setCurrency] = useState<string>('USD');
  const [chargeBearer, setChargeBearer] = useState<'OUR' | 'BEN' | 'SHA'>('SHA');
  const [scheduleType, setScheduleType] = useState<'IMMEDIATE' | 'SCHEDULED' | 'RECURRING'>('IMMEDIATE');
  const [scheduledDate, setScheduledDate] = useState<string>('');
  const [recurrenceFrequency, setRecurrenceFrequency] = useState<'WEEKLY' | 'MONTHLY' | 'QUARTERLY'>('MONTHLY');
  const [purposeOfPayment, setPurposeOfPayment] = useState<string>('');

  // Validation & Results
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [preprocessResult, setPreprocessResult] = useState<PreprocessResponse | null>(null);
  const [apiError, setApiError] = useState<string | null>(null);

  // Load Initial Data
  useEffect(() => {
    async function fetchData() {
      try {
        const [fetchedAccounts, fetchedPayees] = await Promise.all([
          MockDataService.getAccounts(),
          MockDataService.getPayees()
        ]);
        setAccounts(fetchedAccounts);
        setPayees(fetchedPayees);
        
        // Set default selections
        if (fetchedAccounts.length > 0) setSourceAccountId(fetchedAccounts[0].id);
        if (fetchedPayees.length > 0) {
          setPayeeId(fetchedPayees[0].id);
          setCurrency(fetchedPayees[0].currency);
        }
      } catch (err) {
        setApiError('Failed to load accounts or payees. Please refresh the page.');
      } finally {
        setLoadingData(false);
      }
    }
    fetchData();
  }, []);

  // Auto-update currency when payee changes
  useEffect(() => {
    const selectedPayee = payees.find(p => p.id === payeeId);
    if (selectedPayee) {
      setCurrency(selectedPayee.currency);
    }
  }, [payeeId, payees]);

  // Derived Values
  const selectedAccount = accounts.find(a => a.id === sourceAccountId);
  const selectedPayee = payees.find(p => p.id === payeeId);

  // Live FX Rate Preview (Simple calculation for UI feedback before submission)
  const getLiveRatePreview = () => {
    if (!selectedAccount || !currency) return null;
    const baseRate = FX_RATES[selectedAccount.currency]?.[currency] || 1.0;
    return baseRate;
  };

  const liveRate = getLiveRatePreview();

  // Validation Logic
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};

    if (!sourceAccountId) newErrors.sourceAccountId = 'Source account is required.';
    if (!payeeId) newErrors.payeeId = 'Payee is required.';
    
    const numAmount = parseFloat(amount);
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount.';
    } else if (selectedAccount && numAmount > selectedAccount.balance && selectedAccount.currency === currency) {
      newErrors.amount = `Insufficient funds. Available balance is ${selectedAccount.balance.toLocaleString()} ${selectedAccount.currency}.`;
    }

    if (!purposeOfPayment.trim()) {
      newErrors.purposeOfPayment = 'Purpose of payment is required for regulatory compliance.';
    }

    if (scheduleType === 'SCHEDULED' && !scheduledDate) {
      newErrors.scheduledDate = 'Please select a future date for the transfer.';
    } else if (scheduleType === 'SCHEDULED' && scheduledDate) {
      const selected = new Date(scheduledDate);
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected < today) {
        newErrors.scheduledDate = 'Scheduled date cannot be in the past.';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Preprocess API Trigger
  const handlePreprocess = async (e: React.FormEvent) => {
    e.preventDefault();
    setApiError(null);

    if (!validateForm()) return;

    setSubmitting(true);
    try {
      const payload: PreprocessRequest = {
        sourceAccountId,
        payeeId,
        amount: parseFloat(amount),
        currency,
        chargeBearer,
        scheduleType,
        scheduledDate: scheduleType === 'SCHEDULED' ? scheduledDate : undefined,
        recurrenceFrequency: scheduleType === 'RECURRING' ? recurrenceFrequency : undefined,
        purposeOfPayment
      };

      const response = await MockDataService.preprocessTransfer(payload);
      setPreprocessResult(response);
      setStep(2); // Move to review step
    } catch (err: any) {
      setApiError(err.message || 'An error occurred during transaction preprocessing.');
    } finally {
      setSubmitting(false);
    }
  };

  if (loadingData) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[500px] bg-slate-900 text-white rounded-2xl border border-slate-800 p-8">
        <RefreshCw className="w-12 h-12 text-indigo-500 animate-spin mb-4" />
        <p className="text-slate-400 font-medium">Loading secure transfer systems...</p>
      </div>
    );
  }

  return (
    <div className="w-full max-w-6xl mx-auto bg-slate-950 text-slate-100 rounded-2xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-950 via-slate-900 to-emerald-950 p-6 border-b border-slate-800">
        <div className="absolute top-4 right-4 flex items-center gap-2 bg-slate-900/80 backdrop-blur border border-slate-700 px-3 py-1 rounded-full text-xs text-slate-300">
          <ShieldCheck className="w-4 h-4 text-emerald-400" />
          <span>End-to-End Encrypted</span>
        </div>
        <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-3">
          <ArrowLeftRight className="w-7 h-7 text-indigo-400" />
          Cross-Border Wire Transfer
        </h1>
        <p className="text-slate-400 text-sm mt-1 max-w-2xl">
          Initiate secure international SWIFT & SEPA transfers with real-time compliance screening, guaranteed FX rates, and transparent fee structures.
        </p>

        {/* Progress Steps */}
        <div className="flex items-center gap-4 mt-6 text-xs font-semibold">
          <div className={`flex items-center gap-2 pb-2 border-b-2 transition-all duration-300 ${step === 1 ? 'border-indigo-500 text-indigo-400' : 'border-emerald-500 text-emerald-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 1 ? 'bg-indigo-500 text-white' : 'bg-emerald-500 text-slate-950'}`}>
              {step > 1 ? <Check className="w-3 h-3" /> : '1'}
            </span>
            <span>Transaction Details</span>
          </div>
          <div className="h-[1px] w-12 bg-slate-800 mb-2" />
          <div className={`flex items-center gap-2 pb-2 border-b-2 transition-all duration-300 ${step === 2 ? 'border-indigo-500 text-indigo-400' : 'border-transparent text-slate-500'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${step === 2 ? 'bg-indigo-500 text-white' : 'bg-slate-800 text-slate-400'}`}>
              2
            </span>
            <span>Preprocess & Compliance Review</span>
          </div>
        </div>
      </div>

      {apiError && (
        <div className="m-6 p-4 bg-rose-950/40 border border-rose-800/60 rounded-xl flex items-start gap-3 text-rose-200 text-sm">
          <AlertTriangle className="w-5 h-5 text-rose-400 shrink-0 mt-0.5" />
          <div>
            <span className="font-semibold">System Error:</span> {apiError}
          </div>
        </div>
      )}

      {step === 1 ? (
        <form onSubmit={handlePreprocess} className="p-6 lg:p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          {/* Left Column: Form Inputs */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* Section 1: Source Account */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <CreditCard className="w-4 h-4 text-indigo-400" />
                Source Account
              </label>
              <div className="relative">
                <select
                  value={sourceAccountId}
                  onChange={(e) => setSourceAccountId(e.target.value)}
                  className={`w-full bg-slate-900 border ${errors.sourceAccountId ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3.5 text-slate-100 appearance-none cursor-pointer transition-all`}
                >
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.accountName} ({acc.currency}) - {acc.accountNumber.substring(0, 8)}... Balance: {acc.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })} {acc.currency}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
              {errors.sourceAccountId && <p className="text-rose-400 text-xs mt-1">{errors.sourceAccountId}</p>}
              
              {selectedAccount && (
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-3 flex justify-between items-center text-xs text-slate-400">
                  <span>Bank: <strong className="text-slate-300">{selectedAccount.bankName}</strong></span>
                  <span>Country: <strong className="text-slate-300">{selectedAccount.country}</strong></span>
                </div>
              )}
            </div>

            {/* Section 2: Payee Selection */}
            <div className="space-y-3">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <User className="w-4 h-4 text-indigo-400" />
                Beneficiary / Payee
              </label>
              <div className="relative">
                <select
                  value={payeeId}
                  onChange={(e) => setPayeeId(e.target.value)}
                  className={`w-full bg-slate-900 border ${errors.payeeId ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3.5 text-slate-100 appearance-none cursor-pointer transition-all`}
                >
                  {payees.map((payee) => (
                    <option key={payee.id} value={payee.id}>
                      {payee.name} ({payee.country}) - SWIFT: {payee.swiftBic}
                    </option>
                  ))}
                </select>
                <div className="absolute inset-y-0 right-4 flex items-center pointer-events-none text-slate-400">
                  ▼
                </div>
              </div>
              {errors.payeeId && <p className="text-rose-400 text-xs mt-1">{errors.payeeId}</p>}

              {selectedPayee && (
                <div className="bg-slate-900/50 border border-slate-800/60 rounded-xl p-4 space-y-2 text-xs text-slate-400">
                  <div className="grid grid-cols-2 gap-2">
                    <div>Bank Name: <strong className="text-slate-300">{selectedPayee.bankName}</strong></div>
                    <div>SWIFT/BIC: <strong className="text-slate-300">{selectedPayee.swiftBic}</strong></div>
                    <div className="col-span-2">Bank Address: <strong className="text-slate-300">{selectedPayee.bankAddress}</strong></div>
                    <div className="col-span-2">Account Number / IBAN: <strong className="text-slate-300">{selectedPayee.accountNumber}</strong></div>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Amount & Currency */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <DollarSign className="w-4 h-4 text-indigo-400" />
                  Transfer Amount
                </label>
                <div className="relative">
                  <input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.amount ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl pl-10 pr-4 py-3.5 text-slate-100 transition-all`}
                  />
                  <div className="absolute inset-y-0 left-3.5 flex items-center pointer-events-none text-slate-500 font-semibold">
                    {selectedAccount?.currency === 'USD' ? '$' : selectedAccount?.currency === 'EUR' ? '€' : selectedAccount?.currency === 'GBP' ? '£' : '¤'}
                  </div>
                </div>
                {errors.amount && <p className="text-rose-400 text-xs mt-1">{errors.amount}</p>}
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Globe className="w-4 h-4 text-indigo-400" />
                  Destination Currency
                </label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3.5 text-slate-100 cursor-pointer transition-all"
                >
                  <option value="USD">USD - US Dollar</option>
                  <option value="EUR">EUR - Euro</option>
                  <option value="GBP">GBP - British Pound</option>
                  <option value="JPY">JPY - Japanese Yen</option>
                  <option value="SGD">SGD - Singapore Dollar</option>
                  <option value="AUD">AUD - Australian Dollar</option>
                </select>
              </div>
            </div>

            {/* Section 4: Charge Bearer & Purpose */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                    <HelpCircle className="w-4 h-4 text-indigo-400" />
                    Charge Bearer
                  </label>
                  <span className="text-[10px] text-slate-500 cursor-help underline decoration-dotted">What is this?</span>
                </div>
                <div className="grid grid-cols-3 gap-2">
                  {(['SHA', 'OUR', 'BEN'] as const).map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setChargeBearer(type)}
                      className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                        chargeBearer === type
                          ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                          : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] text-slate-500 leading-relaxed">
                  {chargeBearer === 'SHA' && 'Shared: You pay local bank fees, recipient pays intermediary fees.'}
                  {chargeBearer === 'OUR' && 'Sender Pays All: You cover all intermediary and recipient bank fees.'}
                  {chargeBearer === 'BEN' && 'Recipient Pays All: All fees are deducted from the final transfer amount.'}
                </p>
              </div>

              <div className="space-y-3">
                <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <FileText className="w-4 h-4 text-indigo-400" />
                  Purpose of Payment
                </label>
                <input
                  type="text"
                  placeholder="e.g., Invoice #2024-99A, Software Services"
                  value={purposeOfPayment}
                  onChange={(e) => setPurposeOfPayment(e.target.value)}
                  className={`w-full bg-slate-900 border ${errors.purposeOfPayment ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3.5 text-slate-100 transition-all`}
                />
                {errors.purposeOfPayment && <p className="text-rose-400 text-xs mt-1">{errors.purposeOfPayment}</p>}
              </div>
            </div>

            {/* Section 5: Scheduling */}
            <div className="bg-slate-900/30 border border-slate-800/80 rounded-xl p-5 space-y-4">
              <label className="block text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Calendar className="w-4 h-4 text-indigo-400" />
                Scheduling Options
              </label>
              <div className="grid grid-cols-3 gap-3">
                {(['IMMEDIATE', 'SCHEDULED', 'RECURRING'] as const).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setScheduleType(type)}
                    className={`py-2.5 px-3 rounded-xl border text-xs font-semibold transition-all ${
                      scheduleType === type
                        ? 'bg-indigo-600/20 border-indigo-500 text-indigo-300'
                        : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                    }`}
                  >
                    {type.charAt(0) + type.slice(1).toLowerCase()}
                  </button>
                ))}
              </div>

              {scheduleType === 'SCHEDULED' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-xs text-slate-400">Execution Date</label>
                  <input
                    type="date"
                    value={scheduledDate}
                    onChange={(e) => setScheduledDate(e.target.value)}
                    className={`w-full bg-slate-900 border ${errors.scheduledDate ? 'border-rose-500' : 'border-slate-800'} focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-100 transition-all`}
                  />
                  {errors.scheduledDate && <p className="text-rose-400 text-xs mt-1">{errors.scheduledDate}</p>}
                </div>
              )}

              {scheduleType === 'RECURRING' && (
                <div className="space-y-2 animate-fadeIn">
                  <label className="block text-xs text-slate-400">Recurrence Frequency</label>
                  <select
                    value={recurrenceFrequency}
                    onChange={(e) => setRecurrenceFrequency(e.target.value as any)}
                    className="w-full bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl px-4 py-3 text-slate-100 cursor-pointer transition-all"
                  >
                    <option value="WEEKLY">Weekly</option>
                    <option value="MONTHLY">Monthly</option>
                    <option value="QUARTERLY">Quarterly</option>
                  </select>
                </div>
              )}
            </div>

          </div>

          {/* Right Column: Live FX & Summary Card */}
          <div className="lg:col-span-4 space-y-6">
            <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6 sticky top-6">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
                Live FX & Fee Preview
              </h3>

              {selectedAccount && selectedPayee && (
                <div className="space-y-4">
                  {/* FX Rate Widget */}
                  <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 flex flex-col items-center justify-center text-center relative overflow-hidden">
                    <div className="absolute top-0 left-0 w-1 h-full bg-indigo-500" />
                    <span className="text-[10px] uppercase tracking-widest text-slate-500 font-bold">Indicative Exchange Rate</span>
                    <div className="flex items-center gap-2 mt-1">
                      <span className="text-lg font-bold text-white">1 {selectedAccount.currency}</span>
                      <ArrowRight className="w-4 h-4 text-indigo-400" />
                      <span className="text-lg font-bold text-emerald-400">
                        {liveRate ? liveRate.toFixed(4) : '1.0000'} {currency}
                      </span>
                    </div>
                    <span className="text-[9px] text-slate-500 mt-1">Mid-market rate updated 1 min ago</span>
                  </div>

                  {/* Live Calculation */}
                  <div className="space-y-3 text-sm">
                    <div className="flex justify-between text-slate-400">
                      <span>You Send:</span>
                      <span className="font-semibold text-slate-200">
                        {amount ? parseFloat(amount).toLocaleString(undefined, { minimumFractionDigits: 2 }) : '0.00'} {selectedAccount.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Estimated FX Rate:</span>
                      <span className="font-semibold text-slate-200">
                        ~ {liveRate ? liveRate.toFixed(4) : '1.0000'}
                      </span>
                    </div>
                    <div className="h-[1px] bg-slate-800/60 my-2" />
                    <div className="flex justify-between text-slate-300 font-medium">
                      <span>Estimated Recipient Gets:</span>
                      <span className="font-bold text-emerald-400 text-base">
                        {amount && liveRate 
                          ? (parseFloat(amount) * liveRate).toLocaleString(undefined, { minimumFractionDigits: 2 }) 
                          : '0.00'}{' '}
                        {currency}
                      </span>
                    </div>
                  </div>

                  {/* Security & Compliance Badges */}
                  <div className="space-y-2.5 pt-4 border-t border-slate-800/60">
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <ShieldCheck className="w-4 h-4 text-emerald-500 shrink-0" />
                      <span>SWIFT gpi Instant Tracking Enabled</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <Info className="w-4 h-4 text-indigo-400 shrink-0" />
                      <span>Subject to standard AML screening</span>
                    </div>
                  </div>
                </div>
              )}

              <button
                type="submit"
                disabled={submitting}
                className="w-full bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800/50 disabled:text-slate-400 text-white font-semibold py-4 px-6 rounded-xl transition-all duration-200 flex items-center justify-center gap-2 shadow-lg shadow-indigo-950/50"
              >
                {submitting ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Preprocessing Wire...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Preprocess & Validate</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      ) : (
        /* STEP 2: PREPROCESS REVIEW SCREEN */
        preprocessResult && (
          <div className="p-6 lg:p-8 space-y-8 animate-fadeIn">
            <div className="bg-emerald-950/20 border border-emerald-800/40 rounded-2xl p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="flex items-start gap-4">
                <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Transaction Preprocessed Successfully</h3>
                  <p className="text-slate-400 text-sm mt-0.5">
                    All compliance checks passed. Rates and fees are locked for the next <strong className="text-emerald-400">10:00 minutes</strong>.
                  </p>
                </div>
              </div>
              <div className="bg-slate-900 border border-slate-800 px-4 py-2.5 rounded-xl text-xs font-mono text-slate-300">
                Token: {preprocessResult.transactionToken}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
              {/* Left Column: Detailed Breakdown */}
              <div className="lg:col-span-8 space-y-6">
                
                {/* Transfer Summary Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
                    Transfer Details
                  </h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">Source Account</span>
                      <p className="text-sm font-semibold text-slate-200">{selectedAccount?.accountName}</p>
                      <p className="text-xs font-mono text-slate-400">{selectedAccount?.accountNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">Beneficiary / Payee</span>
                      <p className="text-sm font-semibold text-slate-200">{selectedPayee?.name}</p>
                      <p className="text-xs font-mono text-slate-400">{selectedPayee?.accountNumber}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">Destination Bank</span>
                      <p className="text-sm font-semibold text-slate-200">{selectedPayee?.bankName}</p>
                      <p className="text-xs text-slate-400">{selectedPayee?.bankAddress}</p>
                    </div>
                    <div className="space-y-1">
                      <span className="text-xs text-slate-500">SWIFT / BIC Code</span>
                      <p className="text-sm font-semibold text-slate-200 font-mono">{selectedPayee?.swiftBic}</p>
                    </div>
                  </div>
                </div>

                {/* Compliance & Delivery Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-400 border-b border-slate-800 pb-3">
                    Compliance & Delivery Status
                  </h4>

                  <div className="space-y-4">
                    <div className={`p-4 rounded-xl border flex items-start gap-3 ${
                      preprocessResult.complianceCheck.status === 'PASSED' 
                        ? 'bg-emerald-950/20 border-emerald-800/40 text-emerald-200' 
                        : 'bg-amber-950/20 border-amber-800/40 text-amber-200'
                    }`}>
                      {preprocessResult.complianceCheck.status === 'PASSED' ? (
                        <ShieldCheck className="w-5 h-5 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertTriangle className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
                      )}
                      <div className="text-xs space-y-1">
                        <p className="font-bold">Compliance Status: {preprocessResult.complianceCheck.status}</p>
                        <p className="text-slate-400 leading-relaxed">{preprocessResult.complianceCheck.message}</p>
                        {preprocessResult.complianceCheck.requiresDocumentation && (
                          <div className="mt-2 p-2 bg-slate-900/80 border border-slate-800 rounded-lg text-slate-300">
                            ⚠️ Supporting invoice/contract must be uploaded before final execution.
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex justify-between items-center bg-slate-900/60 border border-slate-800/80 rounded-xl p-4 text-xs">
                      <span className="text-slate-400">Estimated Delivery:</span>
                      <span className="font-bold text-slate-200">{preprocessResult.estimatedDelivery}</span>
                    </div>
                  </div>
                </div>

              </div>

              {/* Right Column: Financial Breakdown */}
              <div className="lg:col-span-4 space-y-6">
                <div className="bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <h4 className="text-sm font-bold uppercase tracking-wider text-slate-300 border-b border-slate-800 pb-3">
                    Guaranteed Cost Breakdown
                  </h4>

                  <div className="space-y-4 text-xs">
                    <div className="flex justify-between text-slate-400">
                      <span>Transfer Amount:</span>
                      <span className="font-semibold text-slate-200">
                        {preprocessResult.sourceAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedAccount?.currency}
                      </span>
                    </div>
                    <div className="flex justify-between text-slate-400">
                      <span>Guaranteed FX Rate:</span>
                      <span className="font-semibold text-slate-200">
                        {preprocessResult.fxRate.toFixed(5)}
                      </span>
                    </div>
                    
                    <div className="h-[1px] bg-slate-800/60 my-2" />
                    
                    <div className="space-y-2">
                      <span className="text-slate-500 font-semibold uppercase tracking-wider text-[10px]">Fees (Source Currency)</span>
                      <div className="flex justify-between text-slate-400">
                        <span>Wire Transfer Fee:</span>
                        <span>{preprocessResult.fees.transferFee.toFixed(2)} {selectedAccount?.currency}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>FX Markup (0.5%):</span>
                        <span>{preprocessResult.fees.fxMarkup.toFixed(2)} {selectedAccount?.currency}</span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Correspondent Bank Fee:</span>
                        <span>{preprocessResult.fees.correspondentBankFee.toFixed(2)} {selectedAccount?.currency}</span>
                      </div>
                      <div className="flex justify-between text-slate-300 font-semibold pt-1 border-t border-slate-800/40">
                        <span>Total Fees:</span>
                        <span>{preprocessResult.fees.totalFees.toFixed(2)} {selectedAccount?.currency}</span>
                      </div>
                    </div>

                    <div className="h-[1px] bg-slate-800/60 my-2" />

                    <div className="bg-slate-950 border border-slate-800/80 rounded-xl p-4 space-y-2">
                      <div className="flex justify-between text-slate-400">
                        <span>Total Debit Amount:</span>
                        <span className="font-bold text-slate-200">
                          {(preprocessResult.sourceAmount + (preprocessResult.chargeBearer === 'OUR' ? preprocessResult.fees.totalFees : 0)).toLocaleString(undefined, { minimumFractionDigits: 2 })} {selectedAccount?.currency}
                        </span>
                      </div>
                      <div className="flex justify-between text-slate-400">
                        <span>Recipient Receives:</span>
                        <span className="font-bold text-emerald-400 text-sm">
                          {preprocessResult.targetAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })} {currency}
                        </span>
                      </div>
                    </div>
                  </div>

                  <div className="flex gap-3">
                    <button
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all text-xs text-center"
                    >
                      Edit Details
                    </button>
                    <button
                      type="button"
                      onClick={() => alert('Transfer Confirmed & Submitted to Treasury Queue!')}
                      className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white font-semibold py-3 px-4 rounded-xl transition-all text-xs text-center shadow-lg shadow-emerald-950/50"
                    >
                      Confirm & Send
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )
      )}
    </div>
  );
}