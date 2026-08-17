import React, { useState } from 'react';
import { 
  User, 
  Building, 
  FileText, 
  Globe, 
  Check, 
  ArrowRight, 
  ArrowLeft, 
  AlertCircle, 
  Loader2, 
  Info, 
  CheckCircle2,
  ShieldCheck,
  Search,
  HelpCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export type PayeeType = 'INTERNAL_DOMESTIC' | 'EXTERNAL_DOMESTIC' | 'BILL_PAYMENT' | 'IBBS';

export interface PayeeFormData {
  // Common Fields
  payeeType: PayeeType | null;
  nickname: string;
  email: string;
  
  // Internal Domestic
  accountNumber: string;
  accountName: string;
  
  // External Domestic
  beneficiaryBankCode: string;
  beneficiaryBranchCode: string;
  externalAccountNumber: string;
  externalAccountName: string;
  
  // Bill Payment
  billerCode: string;
  customerReferenceNumber: string;
  utilityBillPaymentIndicator: boolean;
  
  // IBBS (International / Specialized)
  ibbsAccountNumberOrIban: string;
  ibbsSwiftBic: string;
  beneficiaryIndividualTaxNumber: string;
  beneficiaryAddress: string;
  beneficiaryCountry: string;
  beneficiaryCurrency: string;
}

const initialFormData: PayeeFormData = {
  payeeType: null,
  nickname: '',
  email: '',
  accountNumber: '',
  accountName: '',
  beneficiaryBankCode: '',
  beneficiaryBranchCode: '',
  externalAccountNumber: '',
  externalAccountName: '',
  billerCode: '',
  customerReferenceNumber: '',
  utilityBillPaymentIndicator: false,
  ibbsAccountNumberOrIban: '',
  ibbsSwiftBic: '',
  beneficiaryIndividualTaxNumber: '',
  beneficiaryAddress: '',
  beneficiaryCountry: 'US',
  beneficiaryCurrency: 'USD',
};

// --- MOCK DATA FOR SELECTS ---
const MOCK_BANKS = [
  { code: 'APEX01', name: 'Apex Global Bank' },
  { code: 'MERI02', name: 'Meridian Trust Bank' },
  { code: 'VORT03', name: 'Vortex Federal Union' },
  { code: 'NEXU04', name: 'Nexus Digital Bank' },
];

const MOCK_BILLERS = [
  { code: 'ELEC-992', name: 'Metro Power & Light', category: 'Utilities' },
  { code: 'WATR-441', name: 'City Water & Sewage', category: 'Utilities' },
  { code: 'TELC-102', name: 'Horizon Telecom & Fiber', category: 'Telecom' },
  { code: 'INS-8830', name: 'SafeGuard Health Insurance', category: 'Insurance' },
];

const MOCK_COUNTRIES = [
  { code: 'US', name: 'United States', currency: 'USD' },
  { code: 'GB', name: 'United Kingdom', currency: 'GBP' },
  { code: 'EU', name: 'Eurozone', currency: 'EUR' },
  { code: 'CA', name: 'Canada', currency: 'CAD' },
  { code: 'AU', name: 'Australia', currency: 'AUD' },
  { code: 'SG', name: 'Singapore', currency: 'SGD' },
  { code: 'JP', name: 'Japan', currency: 'JPY' },
];

export default function AddPayeeWizard() {
  // --- STATE ---
  const [step, setStep] = useState<number>(1);
  const [formData, setFormData] = useState<PayeeFormData>(initialFormData);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [submitSuccess, setSubmitSuccess] = useState<boolean | null>(null);
  const [createdPayeeId, setCreatedPayeeId] = useState<string>('');
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  // --- HANDLERS ---
  const handleTypeSelect = (type: PayeeType) => {
    setFormData((prev) => ({ 
      ...prev, 
      payeeType: type,
      // Reset type-specific fields when switching types
      accountNumber: '',
      accountName: '',
      beneficiaryBankCode: '',
      beneficiaryBranchCode: '',
      externalAccountNumber: '',
      externalAccountName: '',
      billerCode: '',
      customerReferenceNumber: '',
      utilityBillPaymentIndicator: false,
      ibbsAccountNumberOrIban: '',
      ibbsSwiftBic: '',
      beneficiaryIndividualTaxNumber: '',
      beneficiaryAddress: '',
    }));
    setErrors({});
    setStep(2);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    const val = type === 'checkbox' ? (e.target as HTMLInputElement).checked : value;
    
    setFormData((prev) => ({
      ...prev,
      [name]: val,
    }));

    // Clear error for this field when user types
    if (errors[name]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[name];
        return updated;
      });
    }
  };

  // --- VALIDATION ---
  const validateStep2 = (): boolean => {
    const newErrors: Record<string, string> = {};

    // Common validation
    if (!formData.nickname.trim()) newErrors.nickname = 'Nickname is required';
    if (formData.email && !/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    // Type-specific validation
    if (formData.payeeType === 'INTERNAL_DOMESTIC') {
      if (!formData.accountNumber.trim()) newErrors.accountNumber = 'Account number is required';
      if (!/^\d{8,12}$/.test(formData.accountNumber.trim())) {
        newErrors.accountNumber = 'Account number must be between 8 and 12 digits';
      }
      if (!formData.accountName.trim()) newErrors.accountName = 'Account name is required';
    }

    if (formData.payeeType === 'EXTERNAL_DOMESTIC') {
      if (!formData.externalAccountNumber.trim()) newErrors.externalAccountNumber = 'Account number is required';
      if (!formData.externalAccountName.trim()) newErrors.externalAccountName = 'Account name is required';
      if (!formData.beneficiaryBankCode) newErrors.beneficiaryBankCode = 'Please select a beneficiary bank';
      if (!formData.beneficiaryBranchCode.trim()) {
        newErrors.beneficiaryBranchCode = 'Branch code is required';
      } else if (!/^\d{3,6}$/.test(formData.beneficiaryBranchCode.trim())) {
        newErrors.beneficiaryBranchCode = 'Branch code must be 3 to 6 digits';
      }
    }

    if (formData.payeeType === 'BILL_PAYMENT') {
      if (!formData.billerCode) newErrors.billerCode = 'Please select a biller';
      if (!formData.customerReferenceNumber.trim()) {
        newErrors.customerReferenceNumber = 'Customer Reference Number (CRN) is required';
      }
    }

    if (formData.payeeType === 'IBBS') {
      if (!formData.ibbsAccountNumberOrIban.trim()) {
        newErrors.ibbsAccountNumberOrIban = 'IBAN or Account Number is required';
      }
      if (!formData.ibbsSwiftBic.trim()) {
        newErrors.ibbsSwiftBic = 'SWIFT/BIC code is required';
      } else if (!/^[A-Z]{6}[A-Z0-9]{2}([A-Z0-9]{3})?$/i.test(formData.ibbsSwiftBic.trim())) {
        newErrors.ibbsSwiftBic = 'Invalid SWIFT/BIC format';
      }
      if (!formData.beneficiaryIndividualTaxNumber.trim()) {
        newErrors.beneficiaryIndividualTaxNumber = 'Beneficiary Individual Tax Number is required';
      }
      if (!formData.beneficiaryAddress.trim()) {
        newErrors.beneficiaryAddress = 'Beneficiary physical address is required';
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNextStep = () => {
    if (step === 2) {
      if (validateStep2()) {
        setStep(3);
      }
    }
  };

  const handlePrevStep = () => {
    setStep((prev) => Math.max(1, prev - 1));
  };

  const handleSubmit = async () => {
    if (!termsAccepted) {
      setErrors((prev) => ({ ...prev, terms: 'You must accept the terms and conditions to proceed' }));
      return;
    }

    setIsSubmitting(true);
    
    // Simulate API call matching OpenAPI schema submission
    try {
      await new Promise((resolve) => setTimeout(resolve, 2000));
      
      // Generate a mock payee ID
      const randomId = 'PAY-' + Math.floor(100000 + Math.random() * 900000);
      setCreatedPayeeId(randomId);
      setSubmitSuccess(true);
      setStep(4);
    } catch (error) {
      setSubmitSuccess(false);
      setStep(4);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleReset = () => {
    setFormData(initialFormData);
    setErrors({});
    setTermsAccepted(false);
    setSubmitSuccess(null);
    setStep(1);
  };

  // --- RENDER HELPERS ---
  const renderStepIndicator = () => {
    const steps = [
      { number: 1, label: 'Payee Type' },
      { number: 2, label: 'Payee Details' },
      { number: 3, label: 'Review & Confirm' },
      { number: 4, label: 'Status' },
    ];

    return (
      <div className="mb-8">
        <div className="flex items-center justify-between max-w-xl mx-auto">
          {steps.map((s, idx) => (
            <React.Fragment key={s.number}>
              <div className="flex flex-col items-center relative">
                <div 
                  className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm transition-all duration-300 ${
                    step === s.number 
                      ? 'bg-blue-600 text-white ring-4 ring-blue-100' 
                      : step > s.number 
                        ? 'bg-emerald-500 text-white' 
                        : 'bg-gray-100 text-gray-500 border border-gray-200'
                  }`}
                >
                  {step > s.number ? <Check className="w-5 h-5" /> : s.number}
                </div>
                <span className={`text-xs mt-2 font-medium ${step === s.number ? 'text-blue-600 font-semibold' : 'text-gray-500'}`}>
                  {s.label}
                </span>
              </div>
              {idx < steps.length - 1 && (
                <div className={`flex-1 h-0.5 mx-2 -mt-5 transition-all duration-300 ${step > s.number ? 'bg-emerald-500' : 'bg-gray-200'}`} />
              )}
            </React.Fragment>
          ))}
        </div>
      </div>
    );
  };

  return (
    <div className="max-w-3xl mx-auto bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-slate-900 to-blue-950 px-8 py-6 text-white">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Add New Payee</h1>
            <p className="text-slate-300 text-sm mt-1">Set up secure transfers, bill payments, or international remittances.</p>
          </div>
          <div className="bg-white/10 p-2.5 rounded-xl backdrop-blur-sm">
            <ShieldCheck className="w-6 h-6 text-blue-400" />
          </div>
        </div>
      </div>

      {/* Main Content Area */}
      <div className="p-8">
        {renderStepIndicator()}

        {/* STEP 1: SELECT PAYEE TYPE */}
        {step === 1 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-md mx-auto mb-8">
              <h2 className="text-xl font-bold text-gray-900">What kind of payee are you adding?</h2>
              <p className="text-gray-500 text-sm mt-1">Select the destination type to dynamically load the required security and routing fields.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Internal Domestic */}
              <button
                onClick={() => handleTypeSelect('INTERNAL_DOMESTIC')}
                className="flex items-start p-5 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all duration-200 group"
              >
                <div className="p-3 rounded-lg bg-blue-50 text-blue-600 group-hover:bg-blue-100 mr-4">
                  <User className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-blue-700">Internal Domestic</h3>
                  <p className="text-xs text-gray-500 mt-1">Transfer to accounts held within our institution. Instant processing.</p>
                </div>
              </button>

              {/* External Domestic */}
              <button
                onClick={() => handleTypeSelect('EXTERNAL_DOMESTIC')}
                className="flex items-start p-5 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all duration-200 group"
              >
                <div className="p-3 rounded-lg bg-indigo-50 text-indigo-600 group-hover:bg-indigo-100 mr-4">
                  <Building className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-indigo-700">External Domestic</h3>
                  <p className="text-xs text-gray-500 mt-1">Transfer to other local banks using standard routing and bank codes.</p>
                </div>
              </button>

              {/* Bill Payment */}
              <button
                onClick={() => handleTypeSelect('BILL_PAYMENT')}
                className="flex items-start p-5 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all duration-200 group"
              >
                <div className="p-3 rounded-lg bg-amber-50 text-amber-600 group-hover:bg-amber-100 mr-4">
                  <FileText className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-amber-700">Bill Payment</h3>
                  <p className="text-xs text-gray-500 mt-1">Pay utilities, telecom, insurance, or registered corporate billers.</p>
                </div>
              </button>

              {/* IBBS */}
              <button
                onClick={() => handleTypeSelect('IBBS')}
                className="flex items-start p-5 rounded-xl border-2 border-gray-100 hover:border-blue-500 hover:bg-blue-50/30 text-left transition-all duration-200 group"
              >
                <div className="p-3 rounded-lg bg-purple-50 text-purple-600 group-hover:bg-purple-100 mr-4">
                  <Globe className="w-6 h-6" />
                </div>
                <div>
                  <h3 className="font-semibold text-gray-900 group-hover:text-purple-700">IBBS (International)</h3>
                  <p className="text-xs text-gray-500 mt-1">Cross-border wire transfers requiring SWIFT/BIC and tax identification.</p>
                </div>
              </button>
            </div>
          </div>
        )}

        {/* STEP 2: ENTER DETAILS */}
        {step === 2 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="flex items-center justify-between border-b border-gray-100 pb-4">
              <div>
                <span className="text-xs font-bold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full">
                  {formData.payeeType?.replace('_', ' ')}
                </span>
                <h2 className="text-lg font-bold text-gray-900 mt-2">Enter Payee Information</h2>
              </div>
              <button 
                onClick={() => setStep(1)}
                className="text-xs text-gray-500 hover:text-blue-600 flex items-center gap-1"
              >
                Change Type
              </button>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* --- DYNAMIC FIELDS BASED ON TYPE --- */}
              
              {/* INTERNAL DOMESTIC FIELDS */}
              {formData.payeeType === 'INTERNAL_DOMESTIC' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number *</label>
                    <input
                      type="text"
                      name="accountNumber"
                      value={formData.accountNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 1234567890"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.accountNumber ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.accountNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.accountNumber}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Account Name *</label>
                    <input
                      type="text"
                      name="accountName"
                      value={formData.accountName}
                      onChange={handleInputChange}
                      placeholder="e.g. Johnathan Doe"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.accountName ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.accountName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.accountName}</p>}
                  </div>
                </>
              )}

              {/* EXTERNAL DOMESTIC FIELDS */}
              {formData.payeeType === 'EXTERNAL_DOMESTIC' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Beneficiary Bank *</label>
                    <select
                      name="beneficiaryBankCode"
                      value={formData.beneficiaryBankCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.beneficiaryBankCode ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all bg-white`}
                    >
                      <option value="">Select Bank</option>
                      {MOCK_BANKS.map(bank => (
                        <option key={bank.code} value={bank.code}>{bank.name} ({bank.code})</option>
                      ))}
                    </select>
                    {errors.beneficiaryBankCode && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.beneficiaryBankCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Branch Code *</label>
                    <input
                      type="text"
                      name="beneficiaryBranchCode"
                      value={formData.beneficiaryBranchCode}
                      onChange={handleInputChange}
                      placeholder="e.g. 0123"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.beneficiaryBranchCode ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.beneficiaryBranchCode && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.beneficiaryBranchCode}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Account Number *</label>
                    <input
                      type="text"
                      name="externalAccountNumber"
                      value={formData.externalAccountNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. 987654321"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.externalAccountNumber ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.externalAccountNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.externalAccountNumber}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Account Name *</label>
                    <input
                      type="text"
                      name="externalAccountName"
                      value={formData.externalAccountName}
                      onChange={handleInputChange}
                      placeholder="e.g. Jane Smith"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.externalAccountName ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.externalAccountName && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.externalAccountName}</p>}
                  </div>
                </>
              )}

              {/* BILL PAYMENT FIELDS */}
              {formData.payeeType === 'BILL_PAYMENT' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Biller *</label>
                    <select
                      name="billerCode"
                      value={formData.billerCode}
                      onChange={handleInputChange}
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.billerCode ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all bg-white`}
                    >
                      <option value="">Select Biller</option>
                      {MOCK_BILLERS.map(biller => (
                        <option key={biller.code} value={biller.code}>{biller.name} ({biller.category})</option>
                      ))}
                    </select>
                    {errors.billerCode && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.billerCode}</p>}
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Customer Reference Number (CRN) *</label>
                    <input
                      type="text"
                      name="customerReferenceNumber"
                      value={formData.customerReferenceNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. CRN-99281-A"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.customerReferenceNumber ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.customerReferenceNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.customerReferenceNumber}</p>}
                  </div>

                  <div className="md:col-span-2 bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-start gap-3">
                    <input
                      type="checkbox"
                      id="utilityBillPaymentIndicator"
                      name="utilityBillPaymentIndicator"
                      checked={formData.utilityBillPaymentIndicator}
                      onChange={handleInputChange}
                      className="mt-1 h-4.5 w-4.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                    />
                    <div className="text-xs text-gray-600">
                      <label htmlFor="utilityBillPaymentIndicator" className="font-semibold text-gray-900 block cursor-pointer">
                        Utility Bill Payment Indicator
                      </label>
                      Check this box if this is a recurring utility bill. This flags the payee for priority processing and automated billing updates.
                    </div>
                  </div>
                </>
              )}

              {/* IBBS (INTERNATIONAL) FIELDS */}
              {formData.payeeType === 'IBBS' && (
                <>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">IBAN / Account Number *</label>
                    <input
                      type="text"
                      name="ibbsAccountNumberOrIban"
                      value={formData.ibbsAccountNumberOrIban}
                      onChange={handleInputChange}
                      placeholder="e.g. GB82 WEST 1234 5678 9012"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.ibbsAccountNumberOrIban ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.ibbsAccountNumberOrIban && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.ibbsAccountNumberOrIban}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">SWIFT / BIC Code *</label>
                    <input
                      type="text"
                      name="ibbsSwiftBic"
                      value={formData.ibbsSwiftBic}
                      onChange={handleInputChange}
                      placeholder="e.g. WESTGB2LXXX"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.ibbsSwiftBic ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.ibbsSwiftBic && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.ibbsSwiftBic}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Beneficiary Individual Tax Number *</label>
                    <input
                      type="text"
                      name="beneficiaryIndividualTaxNumber"
                      value={formData.beneficiaryIndividualTaxNumber}
                      onChange={handleInputChange}
                      placeholder="e.g. Tax ID / SSN / NIF"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.beneficiaryIndividualTaxNumber ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.beneficiaryIndividualTaxNumber && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.beneficiaryIndividualTaxNumber}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Country *</label>
                    <select
                      name="beneficiaryCountry"
                      value={formData.beneficiaryCountry}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all bg-white"
                    >
                      {MOCK_COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Preferred Currency *</label>
                    <select
                      name="beneficiaryCurrency"
                      value={formData.beneficiaryCurrency}
                      onChange={handleInputChange}
                      className="w-full px-4 py-2.5 rounded-lg border border-gray-300 focus:ring-4 focus:ring-blue-100 focus:outline-none transition-all bg-white"
                    >
                      {MOCK_COUNTRIES.map(c => (
                        <option key={c.code} value={c.currency}>{c.currency}</option>
                      ))}
                    </select>
                  </div>

                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Beneficiary Physical Address *</label>
                    <input
                      type="text"
                      name="beneficiaryAddress"
                      value={formData.beneficiaryAddress}
                      onChange={handleInputChange}
                      placeholder="Full street address, city, postal code"
                      className={`w-full px-4 py-2.5 rounded-lg border ${errors.beneficiaryAddress ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                    />
                    {errors.beneficiaryAddress && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.beneficiaryAddress}</p>}
                  </div>
                </>
              )}

              {/* --- COMMON FIELDS --- */}
              <div className="md:col-span-2 border-t border-gray-100 pt-6 mt-2">
                <h3 className="text-sm font-bold text-gray-900 mb-4">Payee Customization & Notifications</h3>
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Payee Nickname *</label>
                <input
                  type="text"
                  name="nickname"
                  value={formData.nickname}
                  onChange={handleInputChange}
                  placeholder="e.g. Landlord, Electric Bill"
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.nickname ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                />
                {errors.nickname && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.nickname}</p>}
              </div>

              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Notification Email (Optional)</label>
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleInputChange}
                  placeholder="e.g. payee@example.com"
                  className={`w-full px-4 py-2.5 rounded-lg border ${errors.email ? 'border-red-500 focus:ring-red-100' : 'border-gray-300 focus:ring-blue-100'} focus:outline-none focus:ring-4 transition-all`}
                />
                {errors.email && <p className="text-red-500 text-xs mt-1 flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.email}</p>}
              </div>
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleNextStep}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-100 transition-all"
              >
                Continue <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}

        {/* STEP 3: REVIEW & CONFIRM */}
        {step === 3 && (
          <div className="space-y-6 animate-fadeIn">
            <div className="text-center max-w-md mx-auto mb-6">
              <h2 className="text-xl font-bold text-gray-900">Review Payee Details</h2>
              <p className="text-gray-500 text-sm mt-1">Please double-check all routing numbers and account details before confirming.</p>
            </div>

            <div className="bg-slate-50 rounded-2xl border border-slate-100 overflow-hidden">
              {/* Header Summary */}
              <div className="bg-slate-900 text-white px-6 py-4 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Payee Type</span>
                  <h3 className="font-bold text-sm">{formData.payeeType?.replace('_', ' ')}</h3>
                </div>
                <div className="text-right">
                  <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Nickname</span>
                  <h3 className="font-bold text-sm text-blue-400">{formData.nickname}</h3>
                </div>
              </div>

              {/* Detail Grid */}
              <div className="p-6 grid grid-cols-1 md:grid-cols-2 gap-y-4 gap-x-6 text-sm">
                {formData.payeeType === 'INTERNAL_DOMESTIC' && (
                  <>
                    <div>
                      <span className="text-gray-500 block">Account Name</span>
                      <span className="font-semibold text-gray-900">{formData.accountName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Account Number</span>
                      <span className="font-mono font-semibold text-gray-900">{formData.accountNumber}</span>
                    </div>
                  </>
                )}

                {formData.payeeType === 'EXTERNAL_DOMESTIC' && (
                  <>
                    <div>
                      <span className="text-gray-500 block">Beneficiary Bank</span>
                      <span className="font-semibold text-gray-900">
                        {MOCK_BANKS.find(b => b.code === formData.beneficiaryBankCode)?.name || formData.beneficiaryBankCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Branch Code</span>
                      <span className="font-semibold text-gray-900">{formData.beneficiaryBranchCode}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Account Name</span>
                      <span className="font-semibold text-gray-900">{formData.externalAccountName}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Account Number</span>
                      <span className="font-mono font-semibold text-gray-900">{formData.externalAccountNumber}</span>
                    </div>
                  </>
                )}

                {formData.payeeType === 'BILL_PAYMENT' && (
                  <>
                    <div>
                      <span className="text-gray-500 block">Biller Name</span>
                      <span className="font-semibold text-gray-900">
                        {MOCK_BILLERS.find(b => b.code === formData.billerCode)?.name || formData.billerCode}
                      </span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Customer Reference Number (CRN)</span>
                      <span className="font-mono font-semibold text-gray-900">{formData.customerReferenceNumber}</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 block">Utility Bill Payment Indicator</span>
                      <span className="font-semibold text-gray-900">
                        {formData.utilityBillPaymentIndicator ? 'Yes (Priority Processing)' : 'No'}
                      </span>
                    </div>
                  </>
                )}

                {formData.payeeType === 'IBBS' && (
                  <>
                    <div>
                      <span className="text-gray-500 block">IBAN / Account Number</span>
                      <span className="font-mono font-semibold text-gray-900">{formData.ibbsAccountNumberOrIban}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">SWIFT / BIC Code</span>
                      <span className="font-mono font-semibold text-gray-900">{formData.ibbsSwiftBic}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Beneficiary Individual Tax Number</span>
                      <span className="font-mono font-semibold text-gray-900">{formData.beneficiaryIndividualTaxNumber}</span>
                    </div>
                    <div>
                      <span className="text-gray-500 block">Country & Currency</span>
                      <span className="font-semibold text-gray-900">{formData.beneficiaryCountry} ({formData.beneficiaryCurrency})</span>
                    </div>
                    <div className="md:col-span-2">
                      <span className="text-gray-500 block">Beneficiary Physical Address</span>
                      <span className="font-semibold text-gray-900">{formData.beneficiaryAddress}</span>
                    </div>
                  </>
                )}

                {formData.email && (
                  <div className="md:col-span-2 border-t border-slate-200 pt-4 mt-2">
                    <span className="text-gray-500 block">Notification Email</span>
                    <span className="font-semibold text-gray-900">{formData.email}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Terms and Conditions Checkbox */}
            <div className="space-y-3">
              <div className="flex items-start gap-3 p-4 rounded-xl border border-blue-100 bg-blue-50/40">
                <input
                  type="checkbox"
                  id="termsAccepted"
                  checked={termsAccepted}
                  onChange={(e) => {
                    setTermsAccepted(e.target.checked);
                    if (errors.terms) {
                      setErrors((prev) => {
                        const updated = { ...prev };
                        delete updated.terms;
                        return updated;
                      });
                    }
                  }}
                  className="mt-1 h-4.5 w-4.5 text-blue-600 border-gray-300 rounded focus:ring-blue-500"
                />
                <div className="text-xs text-gray-600">
                  <label htmlFor="termsAccepted" className="font-semibold text-gray-900 block cursor-pointer">
                    I authorize the creation of this payee profile
                  </label>
                  I certify that the account details provided are accurate. I understand that transfers made to incorrect account numbers or routing details may not be recoverable.
                </div>
              </div>
              {errors.terms && <p className="text-red-500 text-xs flex items-center gap-1"><AlertCircle className="w-3.5 h-3.5" /> {errors.terms}</p>}
            </div>

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between border-t border-gray-100 pt-6 mt-8">
              <button
                type="button"
                onClick={handlePrevStep}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all disabled:opacity-50"
              >
                <ArrowLeft className="w-4 h-4" /> Back
              </button>
              <button
                type="button"
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="flex items-center gap-2 px-6 py-2.5 rounded-lg bg-emerald-600 hover:bg-emerald-700 text-white font-semibold shadow-md shadow-emerald-100 transition-all disabled:opacity-70"
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" /> Creating Payee...
                  </>
                ) : (
                  <>
                    Confirm & Add Payee <Check className="w-4 h-4" />
                  </>
                )}
              </button>
            </div>
          </div>
        )}

        {/* STEP 4: STATUS / SUCCESS */}
        {step === 4 && (
          <div className="text-center py-8 space-y-6 animate-fadeIn">
            {submitSuccess ? (
              <div className="max-w-md mx-auto space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-emerald-100 text-emerald-600 mb-2">
                  <CheckCircle2 className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Payee Added Successfully!</h2>
                <p className="text-gray-500 text-sm">
                  <span className="font-semibold text-gray-900">{formData.nickname}</span> has been successfully registered. You can now initiate transfers to this payee immediately.
                </p>

                <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 text-left space-y-2 text-xs">
                  <div className="flex justify-between">
                    <span className="text-gray-500">Payee Reference ID:</span>
                    <span className="font-mono font-bold text-gray-900">{createdPayeeId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Status:</span>
                    <span className="font-semibold text-emerald-600 flex items-center gap-1">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" /> Active / Verified
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500">Security Check:</span>
                    <span className="text-gray-900 font-medium">Passed (AML/Sanctions Cleared)</span>
                  </div>
                </div>

                <div className="pt-6 flex flex-col sm:flex-row gap-3 justify-center">
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all text-sm"
                  >
                    Add Another Payee
                  </button>
                  <button
                    onClick={() => alert('Navigating to transfer page...')}
                    className="px-5 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-semibold shadow-md shadow-blue-100 transition-all text-sm"
                  >
                    Send Money Now
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-md mx-auto space-y-4">
                <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-red-100 text-red-600 mb-2">
                  <AlertCircle className="w-10 h-10" />
                </div>
                <h2 className="text-2xl font-bold text-gray-900">Failed to Add Payee</h2>
                <p className="text-gray-500 text-sm">
                  We encountered an issue while validating the payee details with the clearing network. Please verify the routing information and try again.
                </p>

                <div className="pt-6 flex gap-3 justify-center">
                  <button
                    onClick={() => setStep(3)}
                    className="px-5 py-2.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 font-medium transition-all text-sm"
                  >
                    Review Details
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-5 py-2.5 rounded-lg bg-red-600 hover:bg-red-700 text-white font-semibold shadow-md shadow-red-100 transition-all text-sm"
                  >
                    Start Over
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Footer Info */}
      <div className="bg-slate-50 px-8 py-4 border-t border-gray-100 flex items-center justify-between text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Info className="w-3.5 h-3.5 text-gray-400" /> Secure 256-bit SSL Encrypted Session
        </span>
        <span>Need help? Contact Support</span>
      </div>
    </div>
  );
}