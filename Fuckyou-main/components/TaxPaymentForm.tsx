import React, { useState, useEffect } from 'react';
import { 
  FileText, 
  User, 
  Calendar, 
  CreditCard, 
  Info, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight, 
  HelpCircle,
  Building,
  Hash
} from 'lucide-react';

// --- Types & Interfaces ---

export type TaxIdentifierType = 'NIP' | 'PESEL' | 'REGON' | 'PASSPORT';

export type TaxPeriodType = 'M' | 'K' | 'R' | 'P'; // Monthly, Quarterly, Yearly, Half-Year/Other

export interface TaxDeclarationType {
  code: string;
  name: string;
  category: 'PIT' | 'CIT' | 'VAT' | 'PCC' | 'OTHER';
  description: string;
}

export interface TaxPaymentDetails {
  taxpayerIdType: TaxIdentifierType;
  taxpayerIdValue: string;
  declarationType: string;
  periodType: TaxPeriodType;
  periodValue: string; // e.g., "24M05" for May 2024, "24K02" for Q2 2024, "24R" for Year 2024
  periodYear: number;
  periodSubValue: string; // Month (01-12) or Quarter (01-04)
  obligationId?: string;
  amount: number;
  currency: string;
}

interface TaxPaymentFormProps {
  onSubmit?: (data: TaxPaymentDetails) => void;
  onCancel?: () => void;
  initialAmount?: number;
  currency?: string;
}

// --- Constants & Helpers ---

const DECLARATION_TYPES: TaxDeclarationType[] = [
  { code: 'PIT-37', name: 'PIT-37', category: 'PIT', description: 'Employment and personal income tax' },
  { code: 'PIT-36', name: 'PIT-36', category: 'PIT', description: 'Business and non-standard personal income tax' },
  { code: 'PIT-28', name: 'PIT-28', category: 'PIT', description: 'Lump-sum tax on registered income' },
  { code: 'PIT-11', name: 'PIT-11', category: 'PIT', description: 'Information on income and tax advances' },
  { code: 'CIT-8', name: 'CIT-8', category: 'CIT', description: 'Corporate income tax declaration' },
  { code: 'VAT-7', name: 'VAT-7 / VAT-7K', category: 'VAT', description: 'Value Added Tax monthly/quarterly declaration' },
  { code: 'VAT-UE', name: 'VAT-UE', category: 'VAT', description: 'EU transaction declaration' },
  { code: 'PCC-3', name: 'PCC-3', category: 'PCC', description: 'Tax on civil law transactions' },
  { code: 'PPE', name: 'PPE', category: 'OTHER', description: 'Flat-rate tax on registered income' },
];

const YEARS = Array.from({ length: 6 }, (_, i) => new Date().getFullYear() - i);

const MONTHS = [
  { value: '01', label: 'January (01)' },
  { value: '02', label: 'February (02)' },
  { value: '03', label: 'March (03)' },
  { value: '04', label: 'April (04)' },
  { value: '05', label: 'May (05)' },
  { value: '06', label: 'June (06)' },
  { value: '07', label: 'July (07)' },
  { value: '08', label: 'August (08)' },
  { value: '09', label: 'September (09)' },
  { value: '10', label: 'October (10)' },
  { value: '11', label: 'November (11)' },
  { value: '12', label: 'December (12)' },
];

const QUARTERS = [
  { value: '01', label: 'Q1 (First Quarter)' },
  { value: '02', label: 'Q2 (Second Quarter)' },
  { value: '03', label: 'Q3 (Third Quarter)' },
  { value: '04', label: 'Q4 (Fourth Quarter)' },
];

// Simple checksum validators for Polish tax identifiers
const validateNIP = (nip: string): boolean => {
  const clean = nip.replace(/[\s-]/g, '');
  if (clean.length !== 10 || !/^\d+$/.test(clean)) return false;
  const weights = [6, 5, 7, 2, 3, 4, 5, 6, 7];
  let sum = 0;
  for (let i = 0; i < 9; i++) {
    sum += parseInt(clean[i]) * weights[i];
  }
  return sum % 11 === parseInt(clean[9]);
};

const validatePESEL = (pesel: string): boolean => {
  const clean = pesel.replace(/[\s-]/g, '');
  if (clean.length !== 11 || !/^\d+$/.test(clean)) return false;
  const weights = [1, 3, 7, 9, 1, 3, 7, 9, 1, 3];
  let sum = 0;
  for (let i = 0; i < 10; i++) {
    sum += parseInt(clean[i]) * weights[i];
  }
  const control = (10 - (sum % 10)) % 10;
  return control === parseInt(clean[10]);
};

const validateREGON = (regon: string): boolean => {
  const clean = regon.replace(/[\s-]/g, '');
  if (clean.length !== 9 && clean.length !== 14) return false;
  if (!/^\d+$/.test(clean)) return false;
  
  if (clean.length === 9) {
    const weights = [8, 9, 2, 3, 4, 5, 6, 7];
    let sum = 0;
    for (let i = 0; i < 8; i++) {
      sum += parseInt(clean[i]) * weights[i];
    }
    let control = sum % 11;
    if (control === 10) control = 0;
    return control === parseInt(clean[8]);
  } else {
    const weights = [2, 4, 8, 5, 0, 9, 7, 3, 6, 1, 2, 4, 8];
    let sum = 0;
    for (let i = 0; i < 13; i++) {
      sum += parseInt(clean[i]) * weights[i];
    }
    let control = sum % 11;
    if (control === 10) control = 0;
    return control === parseInt(clean[13]);
  }
};

export default function TaxPaymentForm({
  onSubmit,
  onCancel,
  initialAmount = 0,
  currency = 'PLN'
}: TaxPaymentFormProps) {
  // --- Form State ---
  const [taxpayerIdType, setTaxpayerIdType] = useState<TaxIdentifierType>('NIP');
  const [taxpayerIdValue, setTaxpayerIdValue] = useState('');
  const [declarationType, setDeclarationType] = useState('PIT-37');
  const [periodType, setPeriodType] = useState<TaxPeriodType>('M');
  const [periodYear, setPeriodYear] = useState<number>(new Date().getFullYear());
  const [periodSubValue, setPeriodSubValue] = useState('01');
  const [obligationId, setObligationId] = useState('');
  const [amount, setAmount] = useState<number>(initialAmount);
  
  // --- UI & Validation State ---
  const [errors, setErrors] = useState<{ [key: string]: string }>({});
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [focusedField, setFocusedField] = useState<string | null>(null);

  // --- Auto-format Taxpayer ID based on type ---
  useEffect(() => {
    setTaxpayerIdValue('');
    setErrors((prev) => {
      const next = { ...prev };
      delete next.taxpayerIdValue;
      return next;
    });
  }, [taxpayerIdType]);

  // --- Generate Polish Tax Transfer Period Code ---
  // Format: YY [M/K/R/S/H] [Value]
  // e.g., 24M05 (May 2024), 24K02 (Q2 2024), 24R (Year 2024)
  const generatePeriodCode = (): string => {
    const shortYear = periodYear.toString().slice(-2);
    if (periodType === 'R') {
      return `${shortYear}R`;
    }
    const typeIndicator = periodType;
    return `${shortYear}${typeIndicator}${periodSubValue}`;
  };

  // --- Validation Logic ---
  const validateForm = (): boolean => {
    const newErrors: { [key: string]: string } = {};

    // Validate Taxpayer ID
    const cleanId = taxpayerIdValue.replace(/[\s-]/g, '');
    if (!cleanId) {
      newErrors.taxpayerIdValue = 'Taxpayer Identification Number is required';
    } else {
      if (taxpayerIdType === 'NIP' && !validateNIP(cleanId)) {
        newErrors.taxpayerIdValue = 'Invalid NIP format or checksum';
      } else if (taxpayerIdType === 'PESEL' && !validatePESEL(cleanId)) {
        newErrors.taxpayerIdValue = 'Invalid PESEL format or checksum';
      } else if (taxpayerIdType === 'REGON' && !validateREGON(cleanId)) {
        newErrors.taxpayerIdValue = 'Invalid REGON format or checksum';
      } else if (taxpayerIdType === 'PASSPORT' && cleanId.length < 5) {
        newErrors.taxpayerIdValue = 'Passport number is too short';
      }
    }

    // Validate Amount
    if (amount <= 0) {
      newErrors.amount = 'Amount must be greater than 0';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      const finalData: TaxPaymentDetails = {
        taxpayerIdType,
        taxpayerIdValue: taxpayerIdValue.replace(/[\s-]/g, ''),
        declarationType,
        periodType,
        periodValue: generatePeriodCode(),
        periodYear,
        periodSubValue,
        obligationId: obligationId || undefined,
        amount,
        currency
      };
      setIsSubmitted(true);
      if (onSubmit) {
        onSubmit(finalData);
      }
    }
  };

  const selectedDeclaration = DECLARATION_TYPES.find(d => d.code === declarationType);

  return (
    <div className="w-full max-w-4xl mx-auto bg-white dark:bg-slate-950 rounded-2xl border border-slate-100 dark:border-slate-900 shadow-xl overflow-hidden transition-all duration-300">
      {/* Header */}
      <div className="relative overflow-hidden bg-gradient-to-r from-indigo-600 to-violet-700 px-8 py-10 text-white">
        <div className="absolute top-0 right-0 -mt-4 -mr-4 w-40 h-40 bg-white/10 rounded-full blur-2xl pointer-events-none" />
        <div className="absolute bottom-0 left-0 -mb-10 -ml-10 w-60 h-60 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-6">
          <div>
            <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/20 backdrop-blur-md text-white mb-3">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Domestic Tax Transfer Flow
            </span>
            <h1 className="text-3xl font-bold tracking-tight">Tax Payment Details</h1>
            <p className="text-indigo-100 mt-1 text-sm md:text-base max-w-xl">
              Complete your domestic tax obligation payment. This form generates standard compliant tax transfer parameters.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-white/10 backdrop-blur-md p-4 rounded-xl border border-white/10 self-start md:self-auto">
            <div className="p-2 bg-white/10 rounded-lg">
              <CreditCard className="w-6 h-6 text-indigo-200" />
            </div>
            <div>
              <div className="text-xs text-indigo-200 uppercase tracking-wider font-medium">Total Amount</div>
              <div className="text-2xl font-bold">{amount.toLocaleString('en-US', { minimumFractionDigits: 2 })} {currency}</div>
            </div>
          </div>
        </div>
      </div>

      <form onSubmit={handleSubmit} className="p-8 space-y-8">
        {/* Section 1: Taxpayer Identification */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-900">
            <User className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Taxpayer Identification</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* ID Type Selector */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Identifier Type
              </label>
              <div className="grid grid-cols-2 gap-2">
                {(['NIP', 'PESEL', 'REGON', 'PASSPORT'] as TaxIdentifierType[]).map((type) => (
                  <button
                    key={type}
                    type="button"
                    onClick={() => setTaxpayerIdType(type)}
                    className={`py-2.5 px-3 text-sm font-medium rounded-xl border transition-all duration-200 flex items-center justify-center gap-2 ${
                      taxpayerIdType === type
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    {type === 'NIP' && <Building className="w-4 h-4" />}
                    {type === 'PESEL' && <User className="w-4 h-4" />}
                    {type === 'REGON' && <Hash className="w-4 h-4" />}
                    {type === 'PASSPORT' && <FileText className="w-4 h-4" />}
                    {type}
                  </button>
                ))}
              </div>
            </div>

            {/* ID Value Input */}
            <div className="md:col-span-2 space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Taxpayer Identification Number ({taxpayerIdType})</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">
                  {taxpayerIdType === 'NIP' && '10 digits'}
                  {taxpayerIdType === 'PESEL' && '11 digits'}
                  {taxpayerIdType === 'REGON' && '9 or 14 digits'}
                  {taxpayerIdType === 'PASSPORT' && 'Alphanumeric'}
                </span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={taxpayerIdValue}
                  onChange={(e) => setTaxpayerIdValue(e.target.value)}
                  onFocus={() => setFocusedField('taxpayerIdValue')}
                  onBlur={() => setFocusedField(null)}
                  placeholder={
                    taxpayerIdType === 'NIP' ? 'e.g., 5260250995' :
                    taxpayerIdType === 'PESEL' ? 'e.g., 90010112345' :
                    taxpayerIdType === 'REGON' ? 'e.g., 123456785' : 'e.g., Passport number'
                  }
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.taxpayerIdValue
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : focusedField === 'taxpayerIdValue'
                      ? 'border-indigo-500 focus:ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                />
                {errors.taxpayerIdValue ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-rose-500">
                    <AlertCircle className="w-5 h-5" />
                  </div>
                ) : taxpayerIdValue && !errors.taxpayerIdValue ? (
                  <div className="absolute right-3 top-1/2 -translate-y-1/2 text-emerald-500">
                    <CheckCircle2 className="w-5 h-5" />
                  </div>
                ) : null}
              </div>
              {errors.taxpayerIdValue && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.taxpayerIdValue}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Section 2: Tax Declaration & Period */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-900">
            <Calendar className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Declaration & Period</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Declaration Type */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Form / Declaration Symbol
              </label>
              <div className="relative">
                <select
                  value={declarationType}
                  onChange={(e) => setDeclarationType(e.target.value)}
                  className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200 appearance-none cursor-pointer"
                >
                  {DECLARATION_TYPES.map((decl) => (
                    <option key={decl.code} value={decl.code}>
                      {decl.code} - {decl.name}
                    </option>
                  ))}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 9l-7 7-7-7" />
                  </svg>
                </div>
              </div>
              {selectedDeclaration && (
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 flex items-start gap-1">
                  <Info className="w-3.5 h-3.5 text-indigo-500 shrink-0 mt-0.5" />
                  <span>{selectedDeclaration.description}</span>
                </p>
              )}
            </div>

            {/* Period Type Selection */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tax Period Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                {[
                  { type: 'M', label: 'Monthly' },
                  { type: 'K', label: 'Quarterly' },
                  { type: 'R', label: 'Yearly' }
                ].map((item) => (
                  <button
                    key={item.type}
                    type="button"
                    onClick={() => {
                      setPeriodType(item.type as TaxPeriodType);
                      setPeriodSubValue('01');
                    }}
                    className={`py-2.5 px-3 text-sm font-medium rounded-xl border transition-all duration-200 flex flex-col items-center justify-center gap-1 ${
                      periodType === item.type
                        ? 'border-indigo-600 bg-indigo-50/50 text-indigo-700 dark:border-indigo-500 dark:bg-indigo-950/30 dark:text-indigo-400 shadow-sm'
                        : 'border-slate-200 hover:border-slate-300 text-slate-600 dark:border-slate-800 dark:hover:border-slate-700 dark:text-slate-400'
                    }`}
                  >
                    <span className="text-xs opacity-75">{item.label}</span>
                    <span className="font-bold text-base">{item.type}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Period Values (Year, Month/Quarter) */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 bg-slate-50 dark:bg-slate-900/30 p-5 rounded-2xl border border-slate-100 dark:border-slate-900">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Tax Year
              </label>
              <select
                value={periodYear}
                onChange={(e) => setPeriodYear(parseInt(e.target.value))}
                className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              >
                {YEARS.map((year) => (
                  <option key={year} value={year}>
                    {year}
                  </option>
                ))}
              </select>
            </div>

            {periodType !== 'R' && (
              <div className="space-y-2 md:col-span-2">
                <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                  {periodType === 'M' ? 'Tax Month' : 'Tax Quarter'}
                </label>
                <select
                  value={periodSubValue}
                  onChange={(e) => setPeriodSubValue(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
                >
                  {periodType === 'M'
                    ? MONTHS.map((m) => (
                        <option key={m.value} value={m.value}>
                          {m.label}
                        </option>
                      ))
                    : QUARTERS.map((q) => (
                        <option key={q.value} value={q.value}>
                          {q.label}
                        </option>
                      ))}
                </select>
              </div>
            )}

            <div className={`flex flex-col justify-end ${periodType === 'R' ? 'md:col-span-2' : 'md:col-span-3'}`}>
              <div className="p-3 bg-indigo-50/50 dark:bg-indigo-950/20 rounded-xl border border-indigo-100/50 dark:border-indigo-900/30 flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HelpCircle className="w-4 h-4 text-indigo-500" />
                  <span className="text-xs font-medium text-slate-600 dark:text-slate-400">Generated Period Code:</span>
                </div>
                <span className="font-mono font-bold text-indigo-700 dark:text-indigo-400 bg-indigo-100/50 dark:bg-indigo-950/50 px-2.5 py-1 rounded text-sm">
                  {generatePeriodCode()}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Section 3: Payment Details */}
        <div className="space-y-6">
          <div className="flex items-center gap-2 pb-2 border-b border-slate-100 dark:border-slate-900">
            <CreditCard className="w-5 h-5 text-indigo-600 dark:text-indigo-400" />
            <h2 className="text-lg font-semibold text-slate-900 dark:text-slate-100">Payment Details</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300">
                Amount ({currency})
              </label>
              <div className="relative">
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={amount || ''}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  onFocus={() => setFocusedField('amount')}
                  onBlur={() => setFocusedField(null)}
                  placeholder="0.00"
                  className={`w-full px-4 py-3 rounded-xl border bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 transition-all duration-200 ${
                    errors.amount
                      ? 'border-rose-500 focus:ring-rose-500/20'
                      : focusedField === 'amount'
                      ? 'border-indigo-500 focus:ring-indigo-500/20'
                      : 'border-slate-200 dark:border-slate-800 hover:border-slate-300 dark:hover:border-slate-700'
                  }`}
                />
                <div className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium text-sm">
                  {currency}
                </div>
              </div>
              {errors.amount && (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" />
                  {errors.amount}
                </p>
              )}
            </div>

            {/* Obligation ID (Optional) */}
            <div className="space-y-2">
              <label className="block text-sm font-medium text-slate-700 dark:text-slate-300 flex justify-between">
                <span>Obligation ID / Decision Number</span>
                <span className="text-xs text-slate-400 dark:text-slate-500 font-normal">Optional</span>
              </label>
              <input
                type="text"
                value={obligationId}
                onChange={(e) => setObligationId(e.target.value)}
                placeholder="e.g., Dec-12345/2024"
                className="w-full px-4 py-3 rounded-xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 text-slate-900 dark:text-slate-100 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500/20 focus:border-indigo-500 transition-all duration-200"
              />
            </div>
          </div>
        </div>

        {/* Summary Panel */}
        <div className="bg-slate-50 dark:bg-slate-900/40 rounded-2xl p-6 border border-slate-100 dark:border-slate-900 space-y-4">
          <h3 className="text-sm font-semibold text-slate-900 dark:text-slate-100 uppercase tracking-wider">
            Tax Transfer Summary Preview
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div>
              <div className="text-slate-400 dark:text-slate-500 text-xs">Taxpayer ID</div>
              <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {taxpayerIdValue ? taxpayerIdValue.replace(/[\s-]/g, '') : '—'}
              </div>
            </div>
            <div>
              <div className="text-slate-400 dark:text-slate-500 text-xs">Form Symbol</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {declarationType}
              </div>
            </div>
            <div>
              <div className="text-slate-400 dark:text-slate-500 text-xs">Period Code</div>
              <div className="font-mono font-semibold text-slate-800 dark:text-slate-200 mt-0.5">
                {generatePeriodCode()}
              </div>
            </div>
            <div>
              <div className="text-slate-400 dark:text-slate-500 text-xs">Obligation ID</div>
              <div className="font-semibold text-slate-800 dark:text-slate-200 mt-0.5 truncate">
                {obligationId || '—'}
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col sm:flex-row items-center justify-end gap-4 pt-4 border-t border-slate-100 dark:border-slate-900">
          {onCancel && (
            <button
              type="button"
              onClick={onCancel}
              className="w-full sm:w-auto px-6 py-3 text-sm font-medium text-slate-600 hover:text-slate-800 dark:text-slate-400 dark:hover:text-slate-200 transition-colors duration-200"
            >
              Cancel
            </button>
          )}
          <button
            type="submit"
            className="w-full sm:w-auto px-8 py-3.5 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all duration-200 flex items-center justify-center gap-2 group"
          >
            Confirm & Proceed
            <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform duration-200" />
          </button>
        </div>
      </form>
    </div>
  );
}