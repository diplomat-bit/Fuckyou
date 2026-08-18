import React, { useState, useId } from 'react';
import { 
  ChevronDown, 
  Info, 
  Zap, 
  Briefcase, 
  Globe, 
  UserCheck, 
  Network,
  HelpCircle
} from 'lucide-react';

// ==========================================
// Types & Interfaces
// ==========================================

export interface ReferenceOption {
  value: string;
  label: string;
  description?: string;
  badge?: string;
  badgeColor?: string;
}

export interface PayeeReferenceValues {
  paymentPriority: string;
  transferPurpose: string;
  beneficiaryResidencyStatus: string;
  proxyAccountIdType: string;
  bankRoutingMethod: string;
}

export interface PayeeReferenceDataSelectorProps {
  value?: Partial<PayeeReferenceValues>;
  onChange?: (values: PayeeReferenceValues) => void;
  className?: string;
  layout?: 'grid' | 'stack';
  showHelperText?: boolean;
}

// ==========================================
// Simulated Reference Data
// ==========================================

export const PAYMENT_PRIORITIES: ReferenceOption[] = [
  { 
    value: 'HIGH', 
    label: 'High (Express / RTGS)', 
    description: 'Immediate settlement, higher processing fees apply.',
    badge: 'Fastest',
    badgeColor: 'bg-amber-100 text-amber-800 dark:bg-amber-900/30 dark:text-amber-400'
  },
  { 
    value: 'NORMAL', 
    label: 'Normal (Standard ACH)', 
    description: 'Standard clearing cycle, typically 1-2 business days.',
    badge: 'Popular',
    badgeColor: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-400'
  },
  { 
    value: 'LOW', 
    label: 'Low (Batch / Economy)', 
    description: 'Cost-effective for non-urgent bulk distributions.',
    badge: 'Eco',
    badgeColor: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/30 dark:text-emerald-400'
  }
];

export const TRANSFER_PURPOSES: ReferenceOption[] = [
  { value: 'SALA', label: 'Salary Payment', description: 'Monthly payroll distribution to employees.' },
  { value: 'SUPP', label: 'Supplier / Vendor Payment', description: 'Settlement of commercial invoices and trade services.' },
  { value: 'INTC', label: 'Intercompany Transfer', description: 'Funds movement between subsidiary or parent entities.' },
  { value: 'TAXS', label: 'Tax Payment', description: 'Remittance to national, state, or local tax authorities.' },
  { value: 'GPRO', label: 'General Procurement', description: 'Purchase of office supplies, utilities, or minor assets.' },
  { value: 'TREA', label: 'Treasury Management', description: 'Liquidity management, investments, or hedging operations.' },
  { value: 'OTHR', label: 'Other / Miscellaneous', description: 'Unclassified transactions requiring manual review.' }
];

export const RESIDENCY_STATUSES: ReferenceOption[] = [
  { value: 'RESIDENT', label: 'Resident Beneficiary', description: 'Tax resident in the destination jurisdiction.' },
  { value: 'NON_RESIDENT', label: 'Non-Resident Beneficiary', description: 'Subject to cross-border withholding taxes and compliance reporting.' }
];

export const PROXY_ACCOUNT_TYPES: ReferenceOption[] = [
  { value: 'EMAIL', label: 'Email Address', description: 'Registered digital wallet or alias email.' },
  { value: 'MOBILE', label: 'Mobile Phone Number', description: 'SMS-verified mobile proxy (e.g., PayNow, Pix, Zelle).' },
  { value: 'NATIONAL_ID', label: 'National Identification Number', description: 'Government-issued unique personal identifier.' },
  { value: 'BUSINESS_REG', label: 'Business Registration Number', description: 'Corporate tax or commercial registry identifier.' },
  { value: 'NONE', label: 'No Proxy (Direct Bank Details)', description: 'Standard routing using traditional account numbers.' }
];

export const BANK_ROUTING_METHODS: ReferenceOption[] = [
  { value: 'SWIFT_BIC', label: 'SWIFT / BIC Code', description: 'International standard for global financial messaging.' },
  { value: 'FEDWIRE', label: 'Fedwire Routing Number', description: '9-digit routing transit number for US domestic wire transfers.' },
  { value: 'ACH_ROUTING', label: 'ACH Routing Number', description: '9-digit routing transit number for US domestic direct deposits.' },
  { value: 'IBAN', label: 'IBAN (International Bank Account Number)', description: 'Standardized format for European and international accounts.' },
  { value: 'SORT_CODE', label: 'UK Sort Code', description: '6-digit code identifying the specific UK bank branch.' }
];

// ==========================================
// Main Component
// ==========================================

export const PayeeReferenceDataSelector: React.FC<PayeeReferenceDataSelectorProps> = ({
  value = {},
  onChange,
  className = '',
  layout = 'grid',
  showHelperText = true
}) => {
  // Internal state to manage values if component is uncontrolled
  const [internalValues, setInternalValues] = useState<PayeeReferenceValues>({
    paymentPriority: value.paymentPriority || 'NORMAL',
    transferPurpose: value.transferPurpose || 'SUPP',
    beneficiaryResidencyStatus: value.beneficiaryResidencyStatus || 'RESIDENT',
    proxyAccountIdType: value.proxyAccountIdType || 'NONE',
    bankRoutingMethod: value.bankRoutingMethod || 'SWIFT_BIC',
  });

  // Unique IDs for accessibility
  const priorityId = useId();
  const purposeId = useId();
  const residencyId = useId();
  const proxyId = useId();
  const routingId = useId();

  const currentValues = { ...internalValues, ...value };

  const handleSelectChange = (field: keyof PayeeReferenceValues, newValue: string) => {
    const updatedValues = {
      ...currentValues,
      [field]: newValue
    };
    setInternalValues(updatedValues);
    if (onChange) {
      onChange(updatedValues);
    }
  };

  // Helper to find selected option details
  const getSelectedOption = (options: ReferenceOption[], val: string) => {
    return options.find(opt => opt.value === val) || options[0];
  };

  return (
    <div className={`w-full bg-white dark:bg-slate-900 rounded-xl border border-slate-200 dark:border-slate-800 shadow-sm overflow-hidden ${className}`}>
      {/* Header */}
      <div className="px-6 py-4 border-b border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/50 flex items-center justify-between">
        <div>
          <h3 className="text-base font-semibold text-slate-900 dark:text-slate-100">
            Payee Reference & Routing Configuration
          </h3>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
            Configure transaction routing, priority, and compliance parameters.
          </p>
        </div>
        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-md bg-indigo-50 dark:bg-indigo-950/40 text-indigo-700 dark:text-indigo-300 text-xs font-medium border border-indigo-100 dark:border-indigo-900/50">
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
          Reference Data Active
        </span>
      </div>

      {/* Selectors Container */}
      <div className={`p-6 gap-6 ${layout === 'grid' ? 'grid grid-cols-1 md:grid-cols-2' : 'flex flex-col'}`}>
        
        {/* 1. Payment Priority */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label htmlFor={priorityId} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
              <Zap className="w-4 h-4 text-amber-500" />
              Payment Priority
            </label>
            {getSelectedOption(PAYMENT_PRIORITIES, currentValues.paymentPriority)?.badge && (
              <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full ${getSelectedOption(PAYMENT_PRIORITIES, currentValues.paymentPriority).badgeColor}`}>
                {getSelectedOption(PAYMENT_PRIORITIES, currentValues.paymentPriority).badge}
              </span>
            )}
          </div>
          <div className="relative">
            <select
              id={priorityId}
              value={currentValues.paymentPriority}
              onChange={(e) => handleSelectChange('paymentPriority', e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              {PAYMENT_PRIORITIES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {showHelperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{getSelectedOption(PAYMENT_PRIORITIES, currentValues.paymentPriority)?.description}</span>
            </p>
          )}
        </div>

        {/* 2. Transfer Purpose */}
        <div className="space-y-2">
          <label htmlFor={purposeId} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Briefcase className="w-4 h-4 text-indigo-500" />
            Transfer Purpose Code
          </label>
          <div className="relative">
            <select
              id={purposeId}
              value={currentValues.transferPurpose}
              onChange={(e) => handleSelectChange('transferPurpose', e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              {TRANSFER_PURPOSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.value} - {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {showHelperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{getSelectedOption(TRANSFER_PURPOSES, currentValues.transferPurpose)?.description}</span>
            </p>
          )}
        </div>

        {/* 3. Beneficiary Residency Status */}
        <div className="space-y-2">
          <label htmlFor={residencyId} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <UserCheck className="w-4 h-4 text-emerald-500" />
            Beneficiary Residency Status
          </label>
          <div className="relative">
            <select
              id={residencyId}
              value={currentValues.beneficiaryResidencyStatus}
              onChange={(e) => handleSelectChange('beneficiaryResidencyStatus', e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              {RESIDENCY_STATUSES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {showHelperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{getSelectedOption(RESIDENCY_STATUSES, currentValues.beneficiaryResidencyStatus)?.description}</span>
            </p>
          )}
        </div>

        {/* 4. Proxy Account ID Type */}
        <div className="space-y-2">
          <label htmlFor={proxyId} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Globe className="w-4 h-4 text-sky-500" />
            Proxy Account ID Type
          </label>
          <div className="relative">
            <select
              id={proxyId}
              value={currentValues.proxyAccountIdType}
              onChange={(e) => handleSelectChange('proxyAccountIdType', e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-800/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              {PROXY_ACCOUNT_TYPES.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {showHelperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{getSelectedOption(PROXY_ACCOUNT_TYPES, currentValues.proxyAccountIdType)?.description}</span>
            </p>
          )}
        </div>

        {/* 5. Bank Routing Method */}
        <div className="space-y-2 md:col-span-2">
          <label htmlFor={routingId} className="flex items-center gap-2 text-sm font-medium text-slate-700 dark:text-slate-300">
            <Network className="w-4 h-4 text-violet-500" />
            Bank Routing Method
          </label>
          <div className="relative">
            <select
              id={routingId}
              value={currentValues.bankRoutingMethod}
              onChange={(e) => handleSelectChange('bankRoutingMethod', e.target.value)}
              className="w-full pl-3 pr-10 py-2.5 bg-slate-50 dark:bg-slate-8/50 border border-slate-200 dark:border-slate-700 rounded-lg text-sm text-slate-900 dark:text-slate-100 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition-all appearance-none cursor-pointer"
            >
              {BANK_ROUTING_METHODS.map((opt) => (
                <option key={opt.value} value={opt.value}>
                  {opt.label}
                </option>
              ))}
            </select>
            <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-slate-400">
              <ChevronDown className="w-4 h-4" />
            </div>
          </div>
          {showHelperText && (
            <p className="text-xs text-slate-500 dark:text-slate-400 flex items-start gap-1.5 mt-1">
              <Info className="w-3.5 h-3.5 text-slate-400 shrink-0 mt-0.5" />
              <span>{getSelectedOption(BANK_ROUTING_METHODS, currentValues.bankRoutingMethod)?.description}</span>
            </p>
          )}
        </div>

      </div>

      {/* Footer / Summary */}
      <div className="px-6 py-4 bg-slate-50 dark:bg-slate-900/80 border-t border-slate-100 dark:border-slate-800 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
          <HelpCircle className="w-4 h-4 text-slate-400" />
          <span>Need help with routing codes? Contact treasury support.</span>
        </div>
        <div className="flex gap-2">
          <span className="text-xs font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
            Priority: {currentValues.paymentPriority}
          </span>
          <span className="text-xs font-mono bg-slate-200/60 dark:bg-slate-800 px-2 py-1 rounded text-slate-600 dark:text-slate-300">
            Routing: {currentValues.bankRoutingMethod}
          </span>
        </div>
      </div>
    </div>
  );
};