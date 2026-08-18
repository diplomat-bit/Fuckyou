import React, { useState, useEffect } from 'react';
import { 
  X, 
  Copy, 
  Check, 
  Globe, 
  Building2, 
  FileText, 
  CreditCard, 
  Calendar, 
  User, 
  MapPin, 
  ArrowRight, 
  Trash2, 
  Edit3, 
  History, 
  ShieldCheck,
  Info,
  ExternalLink,
  AlertCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---

export type PayeeType = 'SWIFT' | 'DOMESTIC' | 'BILL_PAY' | 'CITI_GLOBAL';

export interface BasePayee {
  id: string;
  name: string;
  nickname?: string;
  type: PayeeType;
  accountNumber: string;
  currency: string;
  status: 'Active' | 'Pending' | 'Suspended';
  lastUsedDate?: string;
  createdDate: string;
  email?: string;
}

export interface SwiftPayee extends BasePayee {
  type: 'SWIFT';
  swiftBic: string;
  bankName: string;
  bankAddress: {
    street: string;
    city: string;
    country: string;
  };
  intermediaryBank?: {
    swiftBic: string;
    bankName: string;
    accountNumber?: string;
  };
  chargeBearer: 'SHA' | 'OUR' | 'BEN'; // Shared, Sender, Beneficiary
}

export interface DomesticPayee extends BasePayee {
  type: 'DOMESTIC';
  routingNumber: string;
  taxId?: string; // Tax registration code (e.g., IBBS, CNPJ, etc.)
  bankName: string;
  branchCode?: string;
  accountType: 'Checking' | 'Savings' | 'Corporate';
}

export interface BillPayee extends BasePayee {
  type: 'BILL_PAY';
  billerCategory: string;
  billerCode: string;
  subscriberReference: string;
  paymentLimit: number;
  autoPayEnabled: boolean;
  nextDueDate?: string;
}

export interface CitiGlobalPayee extends BasePayee {
  type: 'CITI_GLOBAL';
  citiBranchCode: string;
  countryCode: string;
  destinationCountry: string;
  instantTransferEligible: boolean;
  address: {
    street: string;
    city: string;
    state?: string;
    postalCode: string;
    country: string;
  };
}

export type PayeeDetails = SwiftPayee | DomesticPayee | BillPayee | CitiGlobalPayee;

interface PayeeDetailsModalProps {
  isOpen: boolean;
  onClose: () => void;
  payee: PayeeDetails | null;
  onEdit?: (payee: PayeeDetails) => void;
  onDelete?: (payee: PayeeDetails) => void;
  onSendMoney?: (payee: PayeeDetails) => void;
  onViewHistory?: (payee: PayeeDetails) => void;
}

// --- HELPER COMPONENTS ---

const DetailRow: React.FC<{
  label: string;
  value: string | React.ReactNode;
  copyable?: boolean;
  copyValue?: string;
}> = ({ label, value, copyable = false, copyValue }) => {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    const textToCopy = copyValue || (typeof value === 'string' ? value : '');
    if (!textToCopy) return;
    try {
      await navigator.clipboard.writeText(textToCopy);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy text: ', err);
    }
  };

  return (
    <div className="flex justify-between items-start py-3 border-b border-slate-100 dark:border-slate-800/60 last:border-0 group">
      <div className="flex flex-col pr-4">
        <span className="text-xs font-medium text-slate-400 dark:text-slate-500 uppercase tracking-wider mb-0.5">
          {label}
        </span>
        <span className="text-sm font-semibold text-slate-800 dark:text-slate-200 break-all">
          {value}
        </span>
      </div>
      {copyable && (
        <button
          onClick={handleCopy}
          className="p-1.5 rounded-lg text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 opacity-0 group-hover:opacity-100 focus:opacity-100"
          title="Copy to clipboard"
        >
          {copied ? (
            <Check className="w-4 h-4 text-emerald-500" />
          ) : (
            <Copy className="w-4 h-4" />
          )}
        </button>
      )}
    </div>
  );
};

const SectionHeader: React.FC<{ title: string; icon: React.ReactNode }> = ({ title, icon }) => (
  <div className="flex items-center gap-2 mt-6 mb-3 pb-2 border-b border-slate-200 dark:border-slate-800">
    <span className="text-slate-500 dark:text-slate-400">{icon}</span>
    <h3 className="text-xs font-bold text-slate-500 dark:text-slate-400 uppercase tracking-widest">
      {title}
    </h3>
  </div>
);

// --- MAIN COMPONENT ---

export const PayeeDetailsModal: React.FC<PayeeDetailsModalProps> = ({
  isOpen,
  onClose,
  payee,
  onEdit,
  onDelete,
  onSendMoney,
  onViewHistory,
}) => {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen || !payee) return null;

  // Get initials for avatar
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .slice(0, 2)
      .join('')
      .toUpperCase();
  };

  // Get badge colors based on status
  const getStatusBadge = (status: PayeeDetails['status']) => {
    const styles = {
      Active: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/30 dark:text-emerald-400 dark:border-emerald-900/50',
      Pending: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/30 dark:text-amber-400 dark:border-amber-900/50',
      Suspended: 'bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-950/30 dark:text-rose-400 dark:border-rose-900/50',
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[status]}`}>
        <span className={`w-1.5 h-1.5 rounded-full mr-1.5 ${
          status === 'Active' ? 'bg-emerald-500' : status === 'Pending' ? 'bg-amber-500' : 'bg-rose-500'
        }`} />
        {status}
      </span>
    );
  };

  // Get badge colors based on payee type
  const getTypeBadge = (type: PayeeType) => {
    const config = {
      SWIFT: { label: 'SWIFT / Wire', style: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/30 dark:text-blue-400 dark:border-blue-900/50' },
      DOMESTIC: { label: 'Domestic Transfer', style: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/30 dark:text-purple-400 dark:border-purple-900/50' },
      BILL_PAY: { label: 'Bill Payment', style: 'bg-orange-50 text-orange-700 border-orange-200 dark:bg-orange-950/30 dark:text-orange-400 dark:border-orange-900/50' },
      CITI_GLOBAL: { label: 'Citi Global Transfer', style: 'bg-cyan-50 text-cyan-700 border-cyan-200 dark:bg-cyan-950/30 dark:text-cyan-400 dark:border-cyan-900/50' },
    };
    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border ${config[type].style}`}>
        {config[type].label}
      </span>
    );
  };

  // Dynamic Section Renderers
  const renderSwiftDetails = (p: SwiftPayee) => (
    <>
      <SectionHeader title="Bank Routing Details" icon={<Building2 className="w-4 h-4" />} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DetailRow label="SWIFT / BIC Code" value={p.swiftBic} copyable />
        <DetailRow label="Bank Name" value={p.bankName} />
        <DetailRow 
          label="Bank Address" 
          value={`${p.bankAddress.street}, ${p.bankAddress.city}, ${p.bankAddress.country}`} 
        />
        <DetailRow label="Charge Bearer" value={`${p.chargeBearer} (${
          p.chargeBearer === 'SHA' ? 'Shared Costs' : p.chargeBearer === 'OUR' ? 'Sender Pays' : 'Beneficiary Pays'
        })`} />
      </div>

      {p.intermediaryBank && (
        <>
          <SectionHeader title="Intermediary Bank Details" icon={<Globe className="w-4 h-4" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
            <DetailRow label="Intermediary SWIFT" value={p.intermediaryBank.swiftBic} copyable />
            <DetailRow label="Intermediary Bank Name" value={p.intermediaryBank.bankName} />
            {p.intermediaryBank.accountNumber && (
              <DetailRow label="Intermediary Account" value={p.intermediaryBank.accountNumber} copyable />
            )}
          </div>
        </>
      )}
    </>
  );

  const renderDomesticDetails = (p: DomesticPayee) => (
    <>
      <SectionHeader title="Domestic Routing & Tax Details" icon={<FileText className="w-4 h-4" />} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DetailRow label="Routing / Sort Code" value={p.routingNumber} copyable />
        <DetailRow label="Bank Name" value={p.bankName} />
        {p.branchCode && <DetailRow label="Branch Code" value={p.branchCode} />}
        <DetailRow label="Account Type" value={p.accountType} />
        {p.taxId && (
          <DetailRow 
            label="Tax Registration Code (IBBS/CNPJ)" 
            value={p.taxId} 
            copyable 
          />
        )}
      </div>
    </>
  );

  const renderBillPayDetails = (p: BillPayee) => (
    <>
      <SectionHeader title="Merchant & Biller Details" icon={<CreditCard className="w-4 h-4" />} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DetailRow label="Biller Category" value={p.billerCategory} />
        <DetailRow label="Biller Code" value={p.billerCode} copyable />
        <DetailRow label="Subscriber Reference" value={p.subscriberReference} copyable />
        <DetailRow 
          label="Daily Payment Limit" 
          value={new Intl.NumberFormat('en-US', { style: 'currency', currency: p.currency }).format(p.paymentLimit)} 
        />
        <DetailRow 
          label="Auto-Pay Status" 
          value={
            <span className={`inline-flex items-center gap-1.5 font-semibold ${p.autoPayEnabled ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
              <span className={`w-2 h-2 rounded-full ${p.autoPayEnabled ? 'bg-emerald-500' : 'bg-slate-300 dark:bg-slate-600'}`} />
              {p.autoPayEnabled ? 'Enabled' : 'Disabled'}
            </span>
          } 
        />
        {p.nextDueDate && (
          <DetailRow label="Next Due Date" value={new Date(p.nextDueDate).toLocaleDateString('en-US', { dateStyle: 'medium' })} />
        )}
      </div>
    </>
  );

  const renderCitiGlobalDetails = (p: CitiGlobalPayee) => (
    <>
      <SectionHeader title="Citi Global Transfer Details" icon={<Globe className="w-4 h-4" />} />
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
        <DetailRow label="Citi Branch Code" value={p.citiBranchCode} copyable />
        <DetailRow label="Destination Country" value={`${p.destinationCountry} (${p.countryCode})`} />
        <DetailRow 
          label="Instant Transfer" 
          value={
            p.instantTransferEligible ? (
              <span className="inline-flex items-center gap-1 text-emerald-600 dark:text-emerald-400 font-semibold">
                <ShieldCheck className="w-4 h-4" /> Eligible (Instant & Free)
              </span>
            ) : (
              <span className="text-slate-400">Standard Processing</span>
            )
          } 
        />
      </div>

      <SectionHeader title="Global Address Details" icon={<MapPin className="w-4 h-4" />} />
      <div className="bg-slate-50 dark:bg-slate-900/40 p-4 rounded-xl border border-slate-100 dark:border-slate-800/80">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
          <DetailRow label="Street Address" value={p.address.street} />
          <DetailRow label="City" value={p.address.city} />
          {p.address.state && <DetailRow label="State / Region" value={p.address.state} />}
          <DetailRow label="Postal / ZIP Code" value={p.address.postalCode} copyable />
          <DetailRow label="Country" value={p.address.country} />
        </div>
      </div>
    </>
  );

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 md:p-10 overflow-y-auto">
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity duration-300"
        onClick={onClose}
      />

      {/* Modal Container */}
      <div className="relative w-full max-w-3xl bg-white dark:bg-slate-950 rounded-2xl shadow-2xl border border-slate-200 dark:border-slate-800/80 overflow-hidden transform transition-all duration-300 flex flex-col my-auto">
        
        {/* Top Decorative Bar */}
        <div className="h-1.5 w-full bg-gradient-to-r from-blue-600 via-indigo-500 to-cyan-500" />

        {/* Close Button */}
        <button
          onClick={onClose}
          className="absolute top-4 right-4 p-2 rounded-full text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-900 transition-all duration-200 z-10"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header / Hero Section */}
        <div className="p-6 sm:p-8 border-b border-slate-100 dark:border-slate-900 bg-slate-50/50 dark:bg-slate-900/20">
          <div className="flex flex-col sm:flex-row sm:items-center gap-5">
            {/* Avatar */}
            <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white text-xl font-bold shadow-lg shadow-indigo-500/20 shrink-0">
              {getInitials(payee.name)}
            </div>

            {/* Payee Identity */}
            <div className="flex-1 min-w-0">
              <div className="flex flex-wrap items-center gap-2 mb-1.5">
                <h2 className="text-xl sm:text-2xl font-bold text-slate-900 dark:text-white tracking-tight truncate">
                  {payee.name}
                </h2>
                {getStatusBadge(payee.status)}
              </div>
              
              {payee.nickname && (
                <p className="text-sm text-slate-500 dark:text-slate-400 font-medium mb-2">
                  Known as: <span className="text-slate-700 dark:text-slate-300 font-semibold">"{payee.nickname}"</span>
                </p>
              )}

              <div className="flex flex-wrap gap-2 items-center">
                {getTypeBadge(payee.type)}
                <span className="text-xs text-slate-400 dark:text-slate-500">•</span>
                <span className="text-xs font-semibold text-slate-500 dark:text-slate-400">
                  Added on {new Date(payee.createdDate).toLocaleDateString('en-US', { dateStyle: 'medium' })}
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Modal Body (Scrollable) */}
        <div className="p-6 sm:p-8 max-h-[60vh] overflow-y-auto custom-scrollbar">
          
          {/* Core Account Details */}
          <SectionHeader title="Core Account Information" icon={<User className="w-4 h-4" />} />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6">
            <DetailRow 
              label="Account / IBAN Number" 
              value={payee.accountNumber} 
              copyable 
            />
            <DetailRow 
              label="Preferred Currency" 
              value={`${payee.currency} (${payee.currency === 'USD' ? '$' : payee.currency === 'EUR' ? '€' : payee.currency === 'GBP' ? '£' : payee.currency})`} 
            />
            {payee.email && (
              <DetailRow label="Notification Email" value={payee.email} copyable />
            )}
            {payee.lastUsedDate && (
              <DetailRow 
                label="Last Transaction Date" 
                value={new Date(payee.lastUsedDate).toLocaleDateString('en-US', { dateStyle: 'medium' })} 
              />
            )}
          </div>

          {/* Dynamic Type-Specific Sections */}
          {payee.type === 'SWIFT' && renderSwiftDetails(payee as SwiftPayee)}
          {payee.type === 'DOMESTIC' && renderDomesticDetails(payee as DomesticPayee)}
          {payee.type === 'BILL_PAY' && renderBillPayDetails(payee as BillPayee)}
          {payee.type === 'CITI_GLOBAL' && renderCitiGlobalDetails(payee as CitiGlobalPayee)}

          {/* Security / Compliance Notice */}
          <div className="mt-8 p-4 rounded-xl bg-blue-50/50 dark:bg-blue-950/10 border border-blue-100/80 dark:border-blue-900/30 flex gap-3">
            <Info className="w-5 h-5 text-blue-600 dark:text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-800/90 dark:text-blue-300/90 leading-relaxed">
              <span className="font-bold">Security Verification:</span> This payee is verified for secure transfers. Any modifications to these details will require multi-factor authentication (MFA) and may trigger a temporary 24-hour cooling-off period for high-value transactions.
            </div>
          </div>
        </div>

        {/* Modal Footer / Action Bar */}
        <div className="p-6 bg-slate-50 dark:bg-slate-900/40 border-t border-slate-100 dark:border-slate-900 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          
          {/* Left Side: Danger Zone / Secondary Actions */}
          <div className="flex items-center gap-2 order-2 sm:order-1">
            {onDelete && (
              <button
                onClick={() => onDelete(payee)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-rose-600 hover:text-rose-700 hover:bg-rose-50 dark:hover:bg-rose-950/20 transition-all duration-200"
              >
                <Trash2 className="w-4 h-4" />
                Delete Payee
              </button>
            )}
            {onViewHistory && (
              <button
                onClick={() => onViewHistory(payee)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200"
              >
                <History className="w-4 h-4" />
                History
              </button>
            )}
          </div>

          {/* Right Side: Primary Actions */}
          <div className="flex items-center gap-3 order-1 sm:order-2">
            {onEdit && (
              <button
                onClick={() => onEdit(payee)}
                className="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold text-slate-700 dark:text-slate-200 bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:bg-slate-50 dark:hover:bg-slate-750 shadow-sm transition-all duration-200"
              >
                <Edit3 className="w-4 h-4" />
                Edit Details
              </button>
            )}
            {onSendMoney && (
              <button
                onClick={() => onSendMoney(payee)}
                className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all duration-200"
              >
                Send Funds
                <ArrowRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

      </div>
    </div>
  );
};