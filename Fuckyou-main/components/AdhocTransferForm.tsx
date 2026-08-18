import React, { useState } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { 
  Globe, 
  Building2, 
  User, 
  MapPin, 
  CreditCard, 
  DollarSign, 
  HelpCircle, 
  ArrowRight, 
  CheckCircle2, 
  AlertCircle, 
  Loader2, 
  Info,
  FileText,
  ShieldCheck
} from 'lucide-react';

// ISO Country Codes for dropdown
const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'DE', name: 'Germany' },
  { code: 'FR', name: 'France' },
  { code: 'JP', name: 'Japan' },
  { code: 'CA', name: 'Canada' },
  { code: 'AU', name: 'Australia' },
  { code: 'SG', name: 'Singapore' },
  { code: 'CH', name: 'Switzerland' },
  { code: 'HK', name: 'Hong Kong' },
];

// Common SWIFT Currencies
const CURRENCIES = [
  { code: 'USD', symbol: '$', name: 'US Dollar' },
  { code: 'EUR', symbol: '€', name: 'Euro' },
  { code: 'GBP', symbol: '£', name: 'British Pound' },
  { code: 'CAD', symbol: 'C$', name: 'Canadian Dollar' },
  { code: 'JPY', symbol: '¥', name: 'Japanese Yen' },
  { code: 'AUD', symbol: 'A$', name: 'Australian Dollar' },
  { code: 'SGD', symbol: 'S$', name: 'Singapore Dollar' },
  { code: 'CHF', symbol: 'CHF', name: 'Swiss Franc' },
];

// SWIFT Purpose Codes (ISO 20022 standard subset)
const PURPOSE_CODES = [
  { code: 'GDDS', name: 'Purchase of Goods / Trade' },
  { code: 'SCVE', name: 'Services / Advisory' },
  { code: 'IPAY', name: 'Invoice Payment' },
  { code: 'REMT', name: 'Family Support / Remittance' },
  { code: 'PENS', name: 'Pension Payment' },
  { code: 'LOAN', name: 'Loan Repayment / Settlement' },
  { code: 'TREA', name: 'Treasury / Capital Transfer' },
];

// SWIFT/BIC Regex: 8 or 11 alphanumeric characters
const swiftRegex = /^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i;
// IBAN Regex: Standard international format
const ibanRegex = /^[A-Z]{2}[0-9]{2}[A-Z0-9]{4,30}$/i;

// Zod Validation Schema matching OpenAPI specifications for cross-border wires
const wireTransferSchema = z.object({
  payeeName: z.string()
    .min(3, 'Payee name must be at least 3 characters')
    .max(140, 'Payee name cannot exceed 140 characters')
    .regex(/^[a-zA-Z0-9\s\-\.\,\&\']+$/, 'Name contains invalid characters for SWIFT transmission'),
  
  payeeAddress: z.string()
    .min(5, 'Address must be at least 5 characters')
    .max(70, 'Address line cannot exceed 70 characters for SWIFT compliance'),
  
  payeeCity: z.string()
    .min(2, 'City is required')
    .max(35, 'City cannot exceed 35 characters'),
  
  payeeCountry: z.string()
    .length(2, 'Please select a valid country'),
  
  isIban: z.boolean().default(false),
  
  accountNumber: z.string().min(5, 'Account number or IBAN is required').max(34, 'Account number/IBAN is too long'),
  
  swiftCode: z.string()
    .regex(swiftRegex, 'Invalid SWIFT/BIC code format. Must be 8 or 11 alphanumeric characters'),
  
  bankName: z.string()
    .min(2, 'Bank name is required')
    .max(140, 'Bank name cannot exceed 140 characters'),
  
  bankAddress: z.string()
    .min(5, 'Bank address is required')
    .max(70, 'Bank address cannot exceed 70 characters'),
  
  amount: z.number({ invalid_type_error: 'Amount must be a valid number' })
    .positive('Amount must be greater than zero')
    .max(10000000, 'Amount exceeds maximum single transaction limit of 10,000,000'),
  
  currency: z.string().length(3, 'Please select a valid currency'),
  
  chargeBearer: z.enum(['SHA', 'OUR', 'BEN'], {
    errorMap: () => ({ message: 'Please select a valid charge bearer option' }),
  }),
  
  paymentReference: z.string()
    .max(35, 'Reference cannot exceed 35 characters for SWIFT compliance')
    .regex(/^[a-zA-Z0-9\s\-\/\?\:\(\)\.\,\'\+]*$/, 'Reference contains invalid SWIFT characters')
    .optional()
    .or(z.literal('')),
  
  purposeCode: z.string().min(4, 'Please select a purpose code for cross-border compliance'),
  
  agreeToTerms: z.literal(true, {
    errorMap: () => ({ message: 'You must accept the cross-border transfer terms and conditions' }),
  }),
}).superRefine((data, ctx) => {
  if (data.isIban && !ibanRegex.test(data.accountNumber)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      message: 'Invalid IBAN format for the selected option',
      path: ['accountNumber'],
    });
  }
});

type WireTransferFormValues = z.infer<typeof wireTransferSchema>;

export default function AdhocTransferForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [transferReceipt, setTransferReceipt] = useState<WireTransferFormValues | null>(null);
  const [activeTab, setActiveTab] = useState<'payee' | 'bank' | 'payment'>('payee');
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  const {
    register,
    handleSubmit,
    control,
    watch,
    setValue,
    trigger,
    formState: { errors, isValid },
  } = useForm<WireTransferFormValues>({
    resolver: zodResolver(wireTransferSchema),
    mode: 'onChange',
    defaultValues: {
      isIban: false,
      currency: 'USD',
      chargeBearer: 'SHA',
      agreeToTerms: undefined,
    },
  });

  const watchIsIban = watch('isIban');
  const watchCurrency = watch('currency');
  const watchAmount = watch('amount');

  const onSubmit = async (data: WireTransferFormValues) => {
    setIsSubmitting(true);
    // Simulate API validation and processing against OpenAPI schema
    await new Promise((resolve) => setTimeout(resolve, 2500));
    setIsSubmitting(false);
    setTransferReceipt(data);
  };

  const handleNextTab = async (currentTab: 'payee' | 'bank', nextTab: 'bank' | 'payment') => {
    let fieldsToValidate: Array<keyof WireTransferFormValues> = [];
    if (currentTab === 'payee') {
      fieldsToValidate = ['payeeName', 'payeeAddress', 'payeeCity', 'payeeCountry', 'accountNumber', 'isIban'];
    } else if (currentTab === 'bank') {
      fieldsToValidate = ['swiftCode', 'bankName', 'bankAddress'];
    }

    const isTabValid = await trigger(fieldsToValidate);
    if (isTabValid) {
      setActiveTab(nextTab);
    }
  };

  const resetForm = () => {
    setTransferReceipt(null);
    setActiveTab('payee');
  };

  return (
    <div className="max-w-4xl mx-auto my-8 p-1 bg-gradient-to-tr from-indigo-500 via-purple-500 to-pink-500 rounded-3xl shadow-2xl">
      <div className="bg-slate-900 text-slate-100 rounded-[22px] p-6 md:p-10 overflow-hidden relative">
        {/* Decorative Background Elements */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-500/10 rounded-full blur-3xl -z-10" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl -z-10" />

        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800 pb-6 mb-8">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm tracking-wider uppercase mb-1">
              <Globe className="w-4 h-4 animate-spin-slow" />
              <span>SWIFT / Cross-Border Network</span>
            </div>
            <h1 className="text-2xl md:text-3xl font-bold text-white tracking-tight">
              Adhoc Wire Transfer
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Initiate secure, real-time international wire transfers compliant with global banking standards.
            </p>
          </div>
          <div className="hidden md:flex items-center gap-2 bg-slate-800/80 border border-slate-700 px-4 py-2 rounded-xl">
            <ShieldCheck className="w-5 h-5 text-emerald-400" />
            <span className="text-xs font-medium text-slate-300">End-to-End Encrypted</span>
          </div>
        </div>

        {!transferReceipt ? (
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-8">
            {/* Step Navigation Tabs */}
            <div className="grid grid-cols-3 gap-2 p-1 bg-slate-950 rounded-xl border border-slate-800">
              <button
                type="button"
                onClick={() => setActiveTab('payee')}
                className={`py-3 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'payee'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <User className="w-4 h-4" />
                <span className="hidden sm:inline">1. Payee Details</span>
                <span className="sm:hidden">Payee</span>
              </button>
              <button
                type="button"
                onClick={() => handleNextTab('payee', 'bank')}
                className={`py-3 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'bank'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <Building2 className="w-4 h-4" />
                <span className="hidden sm:inline">2. Bank Details</span>
                <span className="sm:hidden">Bank</span>
              </button>
              <button
                type="button"
                onClick={async () => {
                  const isPayeeValid = await trigger(['payeeName', 'payeeAddress', 'payeeCity', 'payeeCountry', 'accountNumber']);
                  const isBankValid = await trigger(['swiftCode', 'bankName', 'bankAddress']);
                  if (isPayeeValid && isBankValid) {
                    setActiveTab('payment');
                  }
                }}
                className={`py-3 text-xs md:text-sm font-semibold rounded-lg transition-all duration-200 flex items-center justify-center gap-2 ${
                  activeTab === 'payment'
                    ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-600/20'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                }`}
              >
                <DollarSign className="w-4 h-4" />
                <span className="hidden sm:inline">3. Payment Info</span>
                <span className="sm:hidden">Payment</span>
              </button>
            </div>

            {/* TAB 1: PAYEE DETAILS */}
            {activeTab === 'payee' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 text-lg font-semibold text-white border-b border-slate-800 pb-2">
                  <User className="w-5 h-5 text-indigo-400" />
                  <h2>Beneficiary / Payee Information</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Payee Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Payee Full Name</label>
                    <div className="relative">
                      <input
                        type="text"
                        {...register('payeeName')}
                        placeholder="e.g. ACME Global Logistics Ltd"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    {errors.payeeName && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.payeeName.message}
                      </p>
                    )}
                  </div>

                  {/* Country Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Payee Country</label>
                    <select
                      {...register('payeeCountry')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Country</option>
                      {COUNTRIES.map((country) => (
                        <option key={country.code} value={country.code}>
                          {country.name} ({country.code})
                        </option>
                      ))}
                    </select>
                    {errors.payeeCountry && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.payeeCountry.message}
                      </p>
                    )}
                  </div>

                  {/* Payee Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300">Street Address</label>
                    <input
                      type="text"
                      {...register('payeeAddress')}
                      placeholder="e.g. 123 Financial District, Suite 400"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {errors.payeeAddress && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.payeeAddress.message}
                      </p>
                    )}
                  </div>

                  {/* Payee City */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">City / State</label>
                    <input
                      type="text"
                      {...register('payeeCity')}
                      placeholder="e.g. London"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {errors.payeeCity && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.payeeCity.message}
                      </p>
                    )}
                  </div>

                  {/* Account Number / IBAN Toggle & Input */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between">
                      <label className="block text-sm font-medium text-slate-300">
                        {watchIsIban ? 'IBAN' : 'Account Number'}
                      </label>
                      <div className="flex items-center gap-2">
                        <span className="text-xs text-slate-400">Use IBAN</span>
                        <Controller
                          name="isIban"
                          control={control}
                          render={({ field }) => (
                            <button
                              type="button"
                              onClick={() => {
                                field.onChange(!field.value);
                                setValue('accountNumber', ''); // Clear input on toggle
                              }}
                              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-300 focus:outline-none ${
                                field.value ? 'bg-indigo-600' : 'bg-slate-800'
                              }`}
                            >
                              <span
                                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-300 ${
                                  field.value ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          )}
                        />
                      </div>
                    </div>
                    <input
                      type="text"
                      {...register('accountNumber')}
                      placeholder={watchIsIban ? 'GB29 WEST 1234 5678 9012 34' : '123456789012'}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                    />
                    {errors.accountNumber && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.accountNumber.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-end pt-4">
                  <button
                    type="button"
                    onClick={() => handleNextTab('payee', 'bank')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Continue to Bank Details
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 2: BANK DETAILS */}
            {activeTab === 'bank' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 text-lg font-semibold text-white border-b border-slate-800 pb-2">
                  <Building2 className="w-5 h-5 text-indigo-400" />
                  <h2>Intermediary / Beneficiary Bank Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* SWIFT / BIC Code */}
                  <div className="space-y-2">
                    <div className="flex items-center gap-1.5">
                      <label className="block text-sm font-medium text-slate-300">SWIFT / BIC Code</label>
                      <button
                        type="button"
                        onMouseEnter={() => setShowTooltip('swift')}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                      {showTooltip === 'swift' && (
                        <div className="absolute z-20 bg-slate-950 border border-slate-800 text-xs text-slate-300 p-3 rounded-lg max-w-xs shadow-xl -mt-20 ml-6">
                          A SWIFT code (or BIC) is an 8 or 11 character code identifying the specific bank globally.
                        </div>
                      )}
                    </div>
                    <input
                      type="text"
                      {...register('swiftCode')}
                      placeholder="e.g. BOFAUS3NXXX"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all uppercase"
                    />
                    {errors.swiftCode && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.swiftCode.message}
                      </p>
                    )}
                  </div>

                  {/* Bank Name */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Bank Name</label>
                    <input
                      type="text"
                      {...register('bankName')}
                      placeholder="e.g. Bank of America, N.A."
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {errors.bankName && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.bankName.message}
                      </p>
                    )}
                  </div>

                  {/* Bank Address */}
                  <div className="space-y-2 md:col-span-2">
                    <label className="block text-sm font-medium text-slate-300">Bank Address</label>
                    <input
                      type="text"
                      {...register('bankAddress')}
                      placeholder="e.g. 100 North Tryon Street, Charlotte, NC"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {errors.bankAddress && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.bankAddress.message}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex justify-between pt-4">
                  <button
                    type="button"
                    onClick={() => setActiveTab('payee')}
                    className="border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="button"
                    onClick={() => handleNextTab('bank', 'payment')}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-6 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg shadow-indigo-600/20"
                  >
                    Continue to Payment Info
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            )}

            {/* TAB 3: PAYMENT INFO */}
            {activeTab === 'payment' && (
              <div className="space-y-6 animate-fadeIn">
                <div className="flex items-center gap-2 text-lg font-semibold text-white border-b border-slate-800 pb-2">
                  <DollarSign className="w-5 h-5 text-indigo-400" />
                  <h2>Transaction & Payment Details</h2>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Currency Selection */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Transfer Currency</label>
                    <select
                      {...register('currency')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      {CURRENCIES.map((curr) => (
                        <option key={curr.code} value={curr.code}>
                          {curr.code} - {curr.name} ({curr.symbol})
                        </option>
                      ))}
                    </select>
                    {errors.currency && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.currency.message}
                      </p>
                    )}
                  </div>

                  {/* Amount */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Transfer Amount</label>
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-semibold">
                          {CURRENCIES.find(c => c.code === watchCurrency)?.symbol || '$'}
                        </span>
                      </div>
                      <input
                        type="number"
                        step="any"
                        {...register('amount', { valueAsNumber: true })}
                        placeholder="0.00"
                        className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 pl-10 pr-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                      />
                    </div>
                    {errors.amount && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.amount.message}
                      </p>
                    )}
                  </div>

                  {/* Charge Bearer (SHA, OUR, BEN) */}
                  <div className="space-y-2 md:col-span-2">
                    <div className="flex items-center gap-1.5 mb-2">
                      <label className="block text-sm font-medium text-slate-300">Charge Bearer (SWIFT Field 71A)</label>
                      <button
                        type="button"
                        onMouseEnter={() => setShowTooltip('charges')}
                        onMouseLeave={() => setShowTooltip(null)}
                        className="text-slate-500 hover:text-slate-300 transition-colors"
                      >
                        <HelpCircle className="w-4 h-4" />
                      </button>
                      {showTooltip === 'charges' && (
                        <div className="absolute z-20 bg-slate-950 border border-slate-800 text-xs text-slate-300 p-3 rounded-lg max-w-xs shadow-xl -mt-24 ml-6">
                          <strong>SHA:</strong> Shared fees. You pay sending bank fees, payee pays receiving fees.<br />
                          <strong>OUR:</strong> You pay all transaction fees.<br />
                          <strong>BEN:</strong> Payee pays all transaction fees.
                        </div>
                      )}
                    </div>
                    <div className="grid grid-cols-3 gap-4">
                      {['SHA', 'OUR', 'BEN'].map((option) => (
                        <label
                          key={option}
                          className={`flex flex-col items-center justify-center p-4 rounded-xl border cursor-pointer transition-all ${
                            watch('chargeBearer') === option
                              ? 'bg-indigo-600/20 border-indigo-500 text-white'
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <input
                            type="radio"
                            value={option}
                            {...register('chargeBearer')}
                            className="sr-only"
                          />
                          <span className="font-bold text-sm">{option}</span>
                          <span className="text-[10px] text-slate-500 mt-1">
                            {option === 'SHA' ? 'Shared Fees' : option === 'OUR' ? 'Sender Pays' : 'Receiver Pays'}
                          </span>
                        </label>
                      ))}
                    </div>
                    {errors.chargeBearer && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.chargeBearer.message}
                      </p>
                    )}
                  </div>

                  {/* Purpose Code */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Purpose of Payment (Regulatory)</label>
                    <select
                      {...register('purposeCode')}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    >
                      <option value="">Select Purpose Code</option>
                      {PURPOSE_CODES.map((purpose) => (
                        <option key={purpose.code} value={purpose.code}>
                          {purpose.code} - {purpose.name}
                        </option>
                      ))}
                    </select>
                    {errors.purposeCode && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.purposeCode.message}
                      </p>
                    )}
                  </div>

                  {/* Payment Reference */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-slate-300">Payment Reference (Optional)</label>
                    <input
                      type="text"
                      {...register('paymentReference')}
                      placeholder="e.g. INV-2024-001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl py-3 px-4 text-white placeholder-slate-600 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                    {errors.paymentReference && (
                      <p className="text-rose-500 text-xs flex items-center gap-1 mt-1">
                        <AlertCircle className="w-3.5 h-3.5" /> {errors.paymentReference.message}
                      </p>
                    )}
                  </div>
                </div>

                {/* Terms & Conditions */}
                <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 space-y-3 mt-6">
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="agreeToTerms"
                      {...register('agreeToTerms')}
                      className="mt-1 rounded border-slate-800 bg-slate-950 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                    />
                    <label htmlFor="agreeToTerms" className="text-xs text-slate-400 leading-relaxed">
                      I authorize this adhoc cross-border wire transfer and acknowledge that exchange rates fluctuate. I certify that the payee details provided are accurate and comply with international anti-money laundering (AML) and counter-terrorist financing (CTF) regulations.
                    </label>
                  </div>
                  {errors.agreeToTerms && (
                    <p className="text-rose-500 text-xs flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.agreeToTerms.message}
                    </p>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex justify-between pt-4 border-t border-slate-800">
                  <button
                    type="button"
                    onClick={() => setActiveTab('bank')}
                    className="border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold px-6 py-3 rounded-xl transition-all"
                  >
                    Back
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting || !isValid}
                    className={`font-semibold px-8 py-3 rounded-xl flex items-center gap-2 transition-all shadow-lg ${
                      isValid && !isSubmitting
                        ? 'bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white shadow-indigo-600/20'
                        : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                    }`}
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-5 h-5 animate-spin" />
                        Processing SWIFT Wire...
                      </>
                    ) : (
                      <>
                        Submit Wire Transfer
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </div>
            )}
          </form>
        ) : (
          /* SUCCESS RECEIPT STATE */
          <div className="space-y-8 animate-fadeIn">
            <div className="text-center space-y-3 py-6">
              <div className="inline-flex items-center justify-center w-16 h-16 bg-emerald-500/10 text-emerald-400 rounded-full mb-2">
                <CheckCircle2 className="w-10 h-10" />
              </div>
              <h2 className="text-2xl md:text-3xl font-bold text-white">Transfer Initiated Successfully</h2>
              <p className="text-slate-400 max-w-md mx-auto text-sm">
                Your adhoc cross-border wire transfer has been validated against the OpenAPI schema and submitted to the SWIFT network.
              </p>
            </div>

            {/* Receipt Details */}
            <div className="bg-slate-950 border border-slate-800 rounded-2xl p-6 md:p-8 space-y-6">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <div className="flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  <span className="font-semibold text-white">Transaction Receipt</span>
                </div>
                <span className="text-xs bg-indigo-500/10 text-indigo-400 px-3 py-1 rounded-full font-mono">
                  REF: {Math.random().toString(36).substring(2, 11).toUpperCase()}
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-sm">
                {/* Payee Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Beneficiary Details</h4>
                  <div className="space-y-1">
                    <p className="text-white font-medium">{transferReceipt.payeeName}</p>
                    <p className="text-slate-400 text-xs">{transferReceipt.payeeAddress}, {transferReceipt.payeeCity}</p>
                    <p className="text-slate-400 text-xs">Country: {transferReceipt.payeeCountry}</p>
                    <p className="text-indigo-400 font-mono text-xs mt-1">
                      {transferReceipt.isIban ? 'IBAN' : 'Account'}: {transferReceipt.accountNumber}
                    </p>
                  </div>
                </div>

                {/* Bank Details */}
                <div className="space-y-3">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Receiving Bank</h4>
                  <div className="space-y-1">
                    <p className="text-white font-medium">{transferReceipt.bankName}</p>
                    <p className="text-slate-400 text-xs">{transferReceipt.bankAddress}</p>
                    <p className="text-indigo-400 font-mono text-xs mt-1">SWIFT/BIC: {transferReceipt.swiftCode}</p>
                  </div>
                </div>

                {/* Transaction Details */}
                <div className="space-y-3 md:col-span-2 border-t border-slate-800 pt-4">
                  <h4 className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Transfer Details</h4>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                    <div>
                      <span className="text-xs text-slate-500 block">Amount</span>
                      <span className="text-lg font-bold text-white">
                        {CURRENCIES.find(c => c.code === transferReceipt.currency)?.symbol || '$'}
                        {transferReceipt.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Currency</span>
                      <span className="text-sm font-semibold text-white">{transferReceipt.currency}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Charge Bearer</span>
                      <span className="text-sm font-semibold text-white">{transferReceipt.chargeBearer}</span>
                    </div>
                    <div>
                      <span className="text-xs text-slate-500 block">Purpose Code</span>
                      <span className="text-sm font-semibold text-white">{transferReceipt.purposeCode}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-4">
              <button
                onClick={resetForm}
                className="bg-indigo-600 hover:bg-indigo-500 text-white font-semibold px-8 py-3 rounded-xl transition-all shadow-lg shadow-indigo-600/20"
              >
                Initiate Another Transfer
              </button>
              <button
                onClick={() => window.print()}
                className="border border-slate-800 hover:bg-slate-800 text-slate-300 font-semibold px-8 py-3 rounded-xl transition-all"
              >
                Print Receipt
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}