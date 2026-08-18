import React, { useState, useEffect } from 'react';
import { 
  Calendar, 
  RefreshCw, 
  ArrowRightLeft, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  HelpCircle,
  ArrowRight,
  Clock,
  FileText
} from 'lucide-react';

export type PaymentFrequency = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'YEARLY';

export interface Account {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  type: 'SAVINGS' | 'CHECKING' | 'CREDIT';
}

export interface StandingInstructionInput {
  sourceAccountId: string;
  destinationAccountId: string;
  amount: number;
  frequency: PaymentFrequency;
  startDate: string;
  endDate?: string;
  isPerpetual: boolean;
  maxOccurrences?: number;
  description?: string;
}

interface StandingInstructionFormProps {
  accounts?: Account[];
  onSubmit?: (data: StandingInstructionInput) => Promise<void> | void;
  isLoading?: boolean;
  successMessage?: string;
  errorMessage?: string;
  initialValues?: Partial<StandingInstructionInput>;
}

const DEFAULT_ACCOUNTS: Account[] = [
  { id: 'acc-1', name: 'Primary Checking', accountNumber: '•••• 4829', balance: 5420.50, type: 'CHECKING' },
  { id: 'acc-2', name: 'High-Yield Savings', accountNumber: '•••• 8812', balance: 24150.75, type: 'SAVINGS' },
  { id: 'acc-3', name: 'Emergency Fund', accountNumber: '•••• 9011', balance: 10000.00, type: 'SAVINGS' },
  { id: 'acc-4', name: 'Investment Cash', accountNumber: '•••• 3341', balance: 1250.00, type: 'CHECKING' }
];

export default function StandingInstructionForm({
  accounts = DEFAULT_ACCOUNTS,
  onSubmit,
  isLoading = false,
  successMessage = 'Standing instruction configured successfully!',
  errorMessage = 'Failed to configure standing instruction. Please check your inputs.',
  initialValues
}: StandingInstructionFormProps) {
  // Form State
  const [sourceAccountId, setSourceAccountId] = useState(initialValues?.sourceAccountId || accounts[0]?.id || '');
  const [destinationAccountId, setDestinationAccountId] = useState(initialValues?.destinationAccountId || accounts[1]?.id || '');
  const [amount, setAmount] = useState<string>(initialValues?.amount?.toString() || '');
  const [frequency, setFrequency] = useState<PaymentFrequency>(initialValues?.frequency || 'MONTHLY');
  const [startDate, setStartDate] = useState(initialValues?.startDate || new Date().toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(initialValues?.endDate || '');
  const [isPerpetual, setIsPerpetual] = useState(initialValues?.isPerpetual ?? true);
  const [maxOccurrences, setMaxOccurrences] = useState<string>(initialValues?.maxOccurrences?.toString() || '12');
  const [description, setDescription] = useState(initialValues?.description || '');

  // UI Status State
  const [formStatus, setFormStatus] = useState<'idle' | 'submitting' | 'success' | 'error'>('idle');
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [customError, setCustomError] = useState<string | null>(null);

  // Sync external loading state
  useEffect(() => {
    if (isLoading) {
      setFormStatus('submitting');
    } else if (formStatus === 'submitting') {
      setFormStatus('success');
    }
  }, [isLoading]);

  // Get selected accounts for summary/validation
  const selectedSourceAccount = accounts.find(a => a.id === sourceAccountId);
  const selectedDestAccount = accounts.find(a => a.id === destinationAccountId);

  // Validation logic
  const validateForm = (): boolean => {
    const errors: Record<string, string> = {};
    const numAmount = parseFloat(amount);

    if (!sourceAccountId) {
      errors.sourceAccountId = 'Source account is required';
    }
    if (!destinationAccountId) {
      errors.destinationAccountId = 'Destination account is required';
    }
    if (sourceAccountId === destinationAccountId) {
      errors.destinationAccountId = 'Source and destination accounts must be different';
    }
    if (!amount || isNaN(numAmount) || numAmount <= 0) {
      errors.amount = 'Please enter a valid amount greater than 0';
    }
    if (selectedSourceAccount && numAmount > selectedSourceAccount.balance) {
      errors.amount = `Insufficient funds. Available balance: $${selectedSourceAccount.balance.toLocaleString()}`;
    }
    if (!startDate) {
      errors.startDate = 'Start date is required';
    } else {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (new Date(startDate) < today) {
        errors.startDate = 'Start date cannot be in the past';
      }
    }
    if (!isPerpetual) {
      if (!endDate && !maxOccurrences) {
        errors.endDate = 'Either an end date or maximum occurrences must be specified';
      }
      if (endDate && startDate && new Date(endDate) <= new Date(startDate)) {
        errors.endDate = 'End date must be after the start date';
      }
      if (maxOccurrences && (parseInt(maxOccurrences) <= 0 || isNaN(parseInt(maxOccurrences)))) {
        errors.maxOccurrences = 'Occurrences must be 1 or more';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setCustomError(null);

    if (!validateForm()) {
      return;
    }

    setFormStatus('submitting');

    const payload: StandingInstructionInput = {
      sourceAccountId,
      destinationAccountId,
      amount: parseFloat(amount),
      frequency,
      startDate,
      isPerpetual,
      description: description.trim() || undefined,
      ...(isPerpetual ? {} : {
        endDate: endDate || undefined,
        maxOccurrences: maxOccurrences ? parseInt(maxOccurrences) : undefined
      })
    };

    try {
      if (onSubmit) {
        await onSubmit(payload);
      } else {
        // Simulate API call if no handler provided
        await new Promise(resolve => setTimeout(resolve, 1500));
      }
      setFormStatus('success');
    } catch (err: any) {
      setFormStatus('error');
      setCustomError(err?.message || errorMessage);
    }
  };

  const resetForm = () => {
    setSourceAccountId(accounts[0]?.id || '');
    setDestinationAccountId(accounts[1]?.id || '');
    setAmount('');
    setFrequency('MONTHLY');
    setStartDate(new Date().toISOString().split('T')[0]);
    setEndDate('');
    setIsPerpetual(true);
    setMaxOccurrences('12');
    setDescription('');
    setValidationErrors({});
    setFormStatus('idle');
    setCustomError(null);
  };

  const frequencies: { value: PaymentFrequency; label: string; desc: string }[] = [
    { value: 'DAILY', label: 'Daily', desc: 'Every day' },
    { value: 'WEEKLY', label: 'Weekly', desc: 'Every 7 days' },
    { value: 'BIWEEKLY', label: 'Bi-Weekly', desc: 'Every 14 days' },
    { value: 'MONTHLY', label: 'Monthly', desc: 'Once a month' },
    { value: 'QUARTERLY', label: 'Quarterly', desc: 'Every 3 months' },
    { value: 'YEARLY', label: 'Yearly', desc: 'Once a year' },
  ];

  return (
    <div className="w-full max-w-3xl mx-auto bg-white rounded-2xl border border-slate-100 shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-8 text-white relative overflow-hidden">
        <div className="absolute -right-10 -top-10 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-2xl pointer-events-none" />
        
        <div className="relative flex items-center space-x-4">
          <div className="p-3 bg-white/10 backdrop-blur-md rounded-xl border border-white/20">
            <RefreshCw className="w-6 h-6 text-white animate-spin-slow" />
          </div>
          <div>
            <h2 className="text-2xl font-bold tracking-tight">Set Up Standing Instruction</h2>
            <p className="text-indigo-100 text-sm mt-1">Configure automated, recurring transfers between accounts effortlessly.</p>
          </div>
        </div>
      </div>

      {formStatus === 'success' ? (
        <div className="p-8 text-center flex flex-col items-center justify-center min-h-[400px] animate-fade-in">
          <div className="w-16 h-16 bg-emerald-50 rounded-full flex items-center justify-center mb-4 border border-emerald-100">
            <CheckCircle2 className="w-10 h-10 text-emerald-500" />
          </div>
          <h3 className="text-xl font-bold text-slate-900">Instruction Configured!</h3>
          <p className="text-slate-500 mt-2 max-w-md">
            Your recurring transfer of <strong className="text-slate-800">${parseFloat(amount).toFixed(2)}</strong> from <strong className="text-slate-800">{selectedSourceAccount?.name}</strong> to <strong className="text-slate-800">{selectedDestAccount?.name}</strong> has been successfully scheduled.
          </p>

          <div className="mt-6 p-4 bg-slate-50 rounded-xl border border-slate-100 text-left w-full max-w-md space-y-2 text-sm text-slate-600">
            <div className="flex justify-between"><span className="font-medium">Frequency:</span> <span>{frequency}</span></div>
            <div className="flex justify-between"><span className="font-medium">Start Date:</span> <span>{startDate}</span></div>
            <div className="flex justify-between">
              <span className="font-medium">Duration:</span> 
              <span>{isPerpetual ? 'Perpetual (Until Cancelled)' : endDate ? `Until ${endDate}` : `${maxOccurrences} occurrences`}</span>
            </div>
            {description && <div className="flex justify-between"><span className="font-medium">Memo:</span> <span className="truncate max-w-[200px]">{description}</span></div>}
          </div>

          <button
            onClick={resetForm}
            className="mt-8 px-6 py-2.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-md hover:shadow-lg transition-all duration-200 text-sm"
          >
            Set Up Another Instruction
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-6">
          {/* Error Banner */}
          {(formStatus === 'error' || Object.keys(validationErrors).length > 0) && (
            <div className="p-4 bg-rose-50 border border-rose-100 rounded-xl flex items-start space-x-3 text-rose-800 animate-shake">
              <AlertCircle className="w-5 h-5 mt-0.5 flex-shrink-0 text-rose-500" />
              <div className="text-sm">
                <span className="font-semibold">Please correct the following errors:</span>
                <ul className="list-disc list-inside mt-1 space-y-1 text-rose-700">
                  {customError && <li>{customError}</li>}
                  {Object.values(validationErrors).map((err, idx) => (
                    <li key={idx}>{err}</li>
                  ))}
                </ul>
              </div>
            </div>
          )}

          {/* Account Selection Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Source Account */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center">
                <span className="w-1.5 h-1.5 bg-indigo-500 rounded-full mr-2"></span>
                Source Account
              </label>
              <div className="relative">
                <select
                  value={sourceAccountId}
                  onChange={(e) => {
                    setSourceAccountId(e.target.value);
                    if (validationErrors.sourceAccountId) {
                      setValidationErrors(prev => ({ ...prev, sourceAccountId: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 border ${validationErrors.sourceAccountId ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all appearance-none text-slate-800 font-medium`}
                >
                  <option value="" disabled>Select source account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <ArrowRightLeft className="w-4 h-4 rotate-90 md:rotate-0" />
                </div>
              </div>
              {selectedSourceAccount && (
                <div className="flex justify-between items-center px-2 text-xs text-slate-500">
                  <span>Available Balance:</span>
                  <span className="font-semibold text-slate-700">${selectedSourceAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>

            {/* Destination Account */}
            <div className="space-y-2">
              <label className="block text-sm font-semibold text-slate-700 flex items-center">
                <span className="w-1.5 h-1.5 bg-violet-500 rounded-full mr-2"></span>
                Destination Account
              </label>
              <div className="relative">
                <select
                  value={destinationAccountId}
                  onChange={(e) => {
                    setDestinationAccountId(e.target.value);
                    if (validationErrors.destinationAccountId) {
                      setValidationErrors(prev => ({ ...prev, destinationAccountId: '' }));
                    }
                  }}
                  className={`w-full px-4 py-3 bg-slate-50 border ${validationErrors.destinationAccountId ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all appearance-none text-slate-800 font-medium`}
                >
                  <option value="" disabled>Select destination account</option>
                  {accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.name} ({acc.accountNumber})
                    </option>
                  ))}
                </select>
                <div className="pointer-events-none absolute inset-y-0 right-0 flex items-center px-4 text-slate-500">
                  <ArrowRight className="w-4 h-4" />
                </div>
              </div>
              {selectedDestAccount && (
                <div className="flex justify-between items-center px-2 text-xs text-slate-500">
                  <span>Current Balance:</span>
                  <span className="font-semibold text-slate-700">${selectedDestAccount.balance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
                </div>
              )}
            </div>
          </div>

          {/* Amount Input */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700">Transfer Amount</label>
            <div className="relative rounded-xl shadow-sm">
              <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                <DollarSign className="h-5 w-5 text-slate-400" />
              </div>
              <input
                type="number"
                step="0.01"
                min="0.01"
                value={amount}
                onChange={(e) => {
                  setAmount(e.target.value);
                  if (validationErrors.amount) {
                    setValidationErrors(prev => ({ ...prev, amount: '' }));
                  }
                }}
                placeholder="0.00"
                className={`w-full pl-10 pr-4 py-3 bg-slate-50 border ${validationErrors.amount ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-lg font-semibold text-slate-800`}
              />
            </div>
          </div>

          {/* Frequency Selector */}
          <div className="space-y-3">
            <label className="block text-sm font-semibold text-slate-700 flex items-center justify-between">
              <span>Payment Frequency</span>
              <span className="text-xs text-indigo-600 font-medium flex items-center">
                <Clock className="w-3 h-3 mr-1" /> Recurring Schedule
              </span>
            </label>
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
              {frequencies.map((freq) => {
                const isSelected = frequency === freq.value;
                return (
                  <button
                    key={freq.value}
                    type="button"
                    onClick={() => setFrequency(freq.value)}
                    className={`p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected 
                        ? 'border-indigo-600 bg-indigo-50/50 ring-2 ring-indigo-500/20' 
                        : 'border-slate-200 bg-white hover:bg-slate-50'
                    }`}
                  >
                    <div className={`text-sm font-bold ${isSelected ? 'text-indigo-700' : 'text-slate-800'}`}>
                      {freq.label}
                    </div>
                    <div className="text-xs text-slate-400 mt-0.5">{freq.desc}</div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Date & Duration Configuration */}
          <div className="p-5 bg-slate-50 rounded-2xl border border-slate-100 space-y-5">
            <h4 className="text-sm font-bold text-slate-800 flex items-center">
              <Calendar className="w-4 h-4 mr-2 text-indigo-500" />
              Schedule & Duration
            </h4>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Start Date */}
              <div className="space-y-2">
                <label className="block text-xs font-semibold text-slate-600">Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => {
                    setStartDate(e.target.value);
                    if (validationErrors.startDate) {
                      setValidationErrors(prev => ({ ...prev, startDate: '' }));
                    }
                  }}
                  className={`w-full px-4 py-2.5 bg-white border ${validationErrors.startDate ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:outline-none focus:ring-2 text-slate-700 text-sm`}
                />
              </div>

              {/* Perpetual Toggle */}
              <div className="flex flex-col justify-end pb-1">
                <label className="relative flex items-center cursor-pointer select-none py-2">
                  <input
                    type="checkbox"
                    checked={isPerpetual}
                    onChange={(e) => {
                      setIsPerpetual(e.target.checked);
                      setValidationErrors(prev => ({ ...prev, endDate: '', maxOccurrences: '' }));
                    }}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-indigo-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[10px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  <span className="ml-3 text-sm font-semibold text-slate-700">Perpetual (Run indefinitely)</span>
                </label>
              </div>
            </div>

            {/* Conditional End Date / Occurrences */}
            {!isPerpetual && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2 border-t border-slate-200/60 animate-fade-in">
                {/* End Date */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 flex items-center">
                    End Date <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => {
                      setEndDate(e.target.value);
                      if (validationErrors.endDate) {
                        setValidationErrors(prev => ({ ...prev, endDate: '' }));
                      }
                    }}
                    className={`w-full px-4 py-2.5 bg-white border ${validationErrors.endDate ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:outline-none focus:ring-2 text-slate-700 text-sm`}
                  />
                </div>

                {/* Max Occurrences */}
                <div className="space-y-2">
                  <label className="block text-xs font-semibold text-slate-600 flex items-center">
                    Number of Occurrences <span className="text-slate-400 font-normal ml-1">(Optional)</span>
                  </label>
                  <input
                    type="number"
                    min="1"
                    value={maxOccurrences}
                    onChange={(e) => {
                      setMaxOccurrences(e.target.value);
                      if (validationErrors.maxOccurrences) {
                        setValidationErrors(prev => ({ ...prev, maxOccurrences: '' }));
                      }
                    }}
                    placeholder="e.g. 12"
                    className={`w-full px-4 py-2.5 bg-white border ${validationErrors.maxOccurrences ? 'border-rose-300 focus:ring-rose-500' : 'border-slate-200 focus:ring-indigo-500'} rounded-xl focus:outline-none focus:ring-2 text-slate-700 text-sm`}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Description / Memo */}
          <div className="space-y-2">
            <label className="block text-sm font-semibold text-slate-700 flex items-center">
              <FileText className="w-4 h-4 mr-1.5 text-slate-400" />
              Memo / Description <span className="text-slate-400 font-normal ml-1">(Optional)</span>
            </label>
            <input
              type="text"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="e.g. Monthly Rent, Savings Allocation"
              className="w-full px-4 py-3 bg-slate-50 border border-slate-200 focus:ring-indigo-500 rounded-xl focus:outline-none focus:ring-2 focus:bg-white transition-all text-slate-700 text-sm"
            />
          </div>

          {/* Submit Button */}
          <div className="pt-4">
            <button
              type="submit"
              disabled={formStatus === 'submitting'}
              className={`w-full py-4 px-6 text-white font-bold rounded-xl shadow-lg transition-all duration-200 flex items-center justify-center space-x-2 ${
                formStatus === 'submitting'
                  ? 'bg-indigo-400 cursor-not-allowed'
                  : 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-700 hover:to-violet-700 hover:shadow-indigo-500/20'
              }`}
            >
              {formStatus === 'submitting' ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  <span>Configuring Instruction...</span>
                </>
              ) : (
                <>
                  <RefreshCw className="w-5 h-5" />
                  <span>Authorize Standing Instruction</span>
                </>
              )}
            </button>
          </div>
        </form>
      )}

      {/* Footer Info */}
      <div className="bg-slate-50 px-6 py-4 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
        <span className="flex items-center">
          <Info className="w-3.5 h-3.5 mr-1 text-indigo-500" />
          Funds will be debited automatically on scheduled dates.
        </span>
        <span className="hidden sm:inline-block">Secure 256-bit Encrypted Transfer</span>
      </div>
    </div>
  );
}