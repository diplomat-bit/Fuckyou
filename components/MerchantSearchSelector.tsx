import React, { useState, useMemo } from 'react';
import {
  Search,
  Check,
  ChevronRight,
  Info,
  Calendar,
  RefreshCw,
  X,
  Landmark,
  Phone,
  Tv,
  Flame,
  Droplet,
  Shield,
  DollarSign,
  AlertCircle,
  ArrowLeft,
  HelpCircle
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface Merchant {
  id: string;
  name: string;
  localName?: string;
  category: 'Utilities' | 'Telecom' | 'Government' | 'Insurance' | 'Finance' | 'Other';
  logoBg: string;
  icon: React.ComponentType<{ className?: string }>;
  refLabel: string;
  refPlaceholder: string;
  refPattern: string; // Regex string for validation
  refHelpText: string;
  averageProcessingTime: string;
}

export interface BillDetails {
  merchant: Merchant;
  referenceNumber: string;
  amount: number;
  dueDate?: string;
  isRecurring: boolean;
  recurringInterval?: 'weekly' | 'monthly' | 'quarterly';
  memo?: string;
}

interface MerchantSearchSelectorProps {
  onCancel?: () => void;
  onConfirm?: (details: BillDetails) => void;
  className?: string;
}

// ==========================================
// MOCK DATA
// ==========================================

const MERCHANTS: Merchant[] = [
  {
    id: 'm1',
    name: 'Metro Electricity Board',
    localName: 'MEB Power & Light',
    category: 'Utilities',
    logoBg: 'bg-amber-100 text-amber-600 dark:bg-amber-950/40 dark:text-amber-400',
    icon: Flame,
    refLabel: 'Account Number',
    refPlaceholder: 'ELE-123456789',
    refPattern: '^ELE-\\d{9}$',
    refHelpText: 'Found at the top-right corner of your monthly utility bill.',
    averageProcessingTime: 'Instant'
  },
  {
    id: 'm2',
    name: 'AquaFlow Water District',
    localName: 'City Water Supply',
    category: 'Utilities',
    logoBg: 'bg-blue-100 text-blue-600 dark:bg-blue-950/40 dark:text-blue-400',
    icon: Droplet,
    refLabel: 'Consumer Number',
    refPlaceholder: 'WTR-987654',
    refPattern: '^WTR-\\d{6}$',
    refHelpText: 'Enter the 6-digit consumer number printed on your water card.',
    averageProcessingTime: 'Within 24 hours'
  },
  {
    id: 'm3',
    name: 'Horizon Telecom',
    localName: 'Horizon Mobile & Fiber',
    category: 'Telecom',
    logoBg: 'bg-purple-100 text-purple-600 dark:bg-purple-950/40 dark:text-purple-400',
    icon: Phone,
    refLabel: 'Subscriber ID / Phone Number',
    refPlaceholder: '0912345678',
    refPattern: '^\\d{10}$',
    refHelpText: 'Enter your 10-digit registered mobile or broadband number.',
    averageProcessingTime: 'Instant'
  },
  {
    id: 'm4',
    name: 'Apex Cable & Streaming',
    localName: 'Apex TV',
    category: 'Telecom',
    logoBg: 'bg-red-100 text-red-600 dark:bg-red-950/40 dark:text-red-400',
    icon: Tv,
    refLabel: 'Smartcard Number',
    refPlaceholder: 'SC-88776655',
    refPattern: '^SC-\\d{8}$',
    refHelpText: '8-digit number found on your physical decoder smartcard.',
    averageProcessingTime: 'Within 2 hours'
  },
  {
    id: 'm5',
    name: 'Internal Revenue Authority',
    localName: 'IRA Tax Portal',
    category: 'Government',
    logoBg: 'bg-emerald-100 text-emerald-600 dark:bg-emerald-950/40 dark:text-emerald-400',
    icon: Landmark,
    refLabel: 'Taxpayer Identification Number (TIN)',
    refPlaceholder: 'TIN-999-888-777',
    refPattern: '^TIN-\\d{3}-\\d{3}-\\d{3}$',
    refHelpText: 'Your unique 9-digit tax identification number.',
    averageProcessingTime: '1-2 business days'
  },
  {
    id: 'm6',
    name: 'Shield Alliance Insurance',
    localName: 'Shield Life & Health',
    category: 'Insurance',
    logoBg: 'bg-indigo-100 text-indigo-600 dark:bg-indigo-950/40 dark:text-indigo-400',
    icon: Shield,
    refLabel: 'Policy Number',
    refPlaceholder: 'POL-554433221',
    refPattern: '^POL-\\d{9}$',
    refHelpText: 'Enter your active 9-digit policy number without spaces.',
    averageProcessingTime: 'Within 12 hours'
  }
];

const CATEGORIES: ('All' | Merchant['category'])[] = [
  'All',
  'Utilities',
  'Telecom',
  'Government',
  'Insurance'
];

export default function MerchantSearchSelector({
  onCancel,
  onConfirm,
  className = ''
}: MerchantSearchSelectorProps) {
  // State Management
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<'All' | Merchant['category']>('All');
  const [selectedMerchant, setSelectedMerchant] = useState<Merchant | null>(null);

  // Form State
  const [refNumber, setRefNumber] = useState('');
  const [amount, setAmount] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [isRecurring, setIsRecurring] = useState(false);
  const [recurringInterval, setRecurringInterval] = useState<'weekly' | 'monthly' | 'quarterly'>('monthly');
  const [memo, setMemo] = useState('');

  // Validation & UI States
  const [errors, setErrors] = useState<{ refNumber?: string; amount?: string }>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  // Filtered Merchants
  const filteredMerchants = useMemo(() => {
    return MERCHANTS.filter((merchant) => {
      const matchesCategory = selectedCategory === 'All' || merchant.category === selectedCategory;
      const matchesSearch =
        merchant.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        (merchant.localName && merchant.localName.toLowerCase().includes(searchQuery.toLowerCase())) ||
        merchant.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesCategory && matchesSearch;
    });
  }, [searchQuery, selectedCategory]);

  // Handle Merchant Selection
  const handleSelectMerchant = (merchant: Merchant) => {
    setSelectedMerchant(merchant);
    setRefNumber('');
    setAmount('');
    setDueDate('');
    setIsRecurring(false);
    setErrors({});
  };

  // Validation Logic
  const validateForm = (): boolean => {
    const newErrors: { refNumber?: string; amount?: string } = {};

    if (!selectedMerchant) return false;

    // Validate Reference Number
    const regex = new RegExp(selectedMerchant.refPattern);
    if (!refNumber) {
      newErrors.refNumber = `${selectedMerchant.refLabel} is required.`;
    } else if (!regex.test(refNumber)) {
      newErrors.refNumber = `Invalid format. Expected format: ${selectedMerchant.refPlaceholder}`;
    }

    // Validate Amount
    const parsedAmount = parseFloat(amount);
    if (!amount) {
      newErrors.amount = 'Payment amount is required.';
    } else if (isNaN(parsedAmount) || parsedAmount <= 0) {
      newErrors.amount = 'Please enter a valid positive amount.';
    } else if (parsedAmount > 50000) {
      newErrors.amount = 'Maximum single transaction limit is $50,000.';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle Form Submission
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm() || !selectedMerchant) return;

    setIsSubmitting(true);

    // Simulate API processing
    setTimeout(() => {
      setIsSubmitting(false);
      setShowSuccess(true);

      if (onConfirm) {
        onConfirm({
          merchant: selectedMerchant,
          referenceNumber: refNumber,
          amount: parseFloat(amount),
          dueDate: dueDate || undefined,
          isRecurring,
          recurringInterval: isRecurring ? recurringInterval : undefined,
          memo: memo || undefined
        });
      }
    }, 1500);
  };

  const handleReset = () => {
    setSelectedMerchant(null);
    setRefNumber('');
    setAmount('');
    setDueDate('');
    setIsRecurring(false);
    setMemo('');
    setErrors({});
    setShowSuccess(false);
  };

  return (
    <div className={`w-full max-w-4xl mx-auto bg-white dark:bg-slate-900 rounded-2xl shadow-xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300 ${className}`}>
      {/* Header */}
      <div className="px-6 py-5 border-b border-slate-100 dark:border-slate-800 flex items-center justify-between bg-slate-50/50 dark:bg-slate-900/50">
        <div>
          <h2 className="text-xl font-bold text-slate-900 dark:text-white">Bill Payment Payee</h2>
          <p className="text-sm text-slate-500 dark:text-slate-400 mt-1">
            {selectedMerchant ? 'Configure payment details and schedule' : 'Search and select a registered merchant to pay'}
          </p>
        </div>
        {onCancel && !selectedMerchant && (
          <button
            onClick={onCancel}
            className="p-2 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        )}
      </div>

      <div className="flex flex-col md:flex-row min-h-[500px]">
        {/* STEP 1: MERCHANT SELECTOR (Left Panel / Full Width if no selection) */}
        <div className={`p-6 flex-1 transition-all duration-300 ${selectedMerchant ? 'hidden md:block md:max-w-sm border-r border-slate-100 dark:border-slate-800 bg-slate-50/30 dark:bg-slate-900/10' : 'w-full'}`}>
          {selectedMerchant ? (
            // Mini-view of selected merchant when form is active
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 dark:text-slate-500">Selected Payee</span>
                <button
                  onClick={handleReset}
                  className="text-xs font-medium text-indigo-600 hover:text-indigo-700 dark:text-indigo-400 dark:hover:text-indigo-300 flex items-center gap-1"
                >
                  <ArrowLeft className="w-3 h-3" /> Change
                </button>
              </div>

              <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-white dark:bg-slate-950 shadow-sm flex items-start gap-3">
                <div className={`p-3 rounded-lg shrink-0 ${selectedMerchant.logoBg}`}>
                  <selectedMerchant.icon className="w-6 h-6" />
                </div>
                <div className="min-w-0">
                  <h4 className="font-semibold text-slate-900 dark:text-white truncate">{selectedMerchant.name}</h4>
                  {selectedMerchant.localName && (
                    <p className="text-xs text-slate-500 dark:text-slate-400 truncate mt-0.5">{selectedMerchant.localName}</p>
                  )}
                  <span className="inline-block mt-2 px-2 py-0.5 text-[10px] font-medium rounded bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300">
                    {selectedMerchant.category}
                  </span>
                </div>
              </div>

              <div className="space-y-3 text-xs text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/40 p-4 rounded-xl">
                <div className="flex justify-between">
                  <span>Processing Time:</span>
                  <span className="font-medium text-slate-700 dark:text-slate-300">{selectedMerchant.averageProcessingTime}</span>
                </div>
                <div className="flex justify-between">
                  <span>Network Status:</span>
                  <span className="font-medium text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> Operational
                  </span>
                </div>
              </div>
            </div>
          ) : (
            // Full Search & Selection Interface
            <div className="space-y-6">
              {/* Search Input */}
              <div className="relative">
                <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                <input
                  type="text"
                  placeholder="Search by merchant name, alias, or category..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-11 pr-10 py-3 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                />
                {searchQuery && (
                  <button
                    onClick={() => setSearchQuery('')}
                    className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 rounded-full hover:bg-slate-200 dark:hover:bg-slate-800"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>

              {/* Category Filter Tabs */}
              <div className="flex gap-1.5 overflow-x-auto pb-2 scrollbar-none -mx-2 px-2">
                {CATEGORIES.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`px-3.5 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-all ${
                      selectedCategory === cat
                        ? 'bg-indigo-600 text-white shadow-sm'
                        : 'bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 hover:bg-slate-200 dark:hover:bg-slate-700'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Merchant List */}
              <div className="space-y-2 max-h-[380px] overflow-y-auto pr-1">
                {filteredMerchants.length > 0 ? (
                  filteredMerchants.map((merchant) => {
                    const IconComponent = merchant.icon;
                    return (
                      <button
                        key={merchant.id}
                        onClick={() => handleSelectMerchant(merchant)}
                        className="w-full text-left p-3.5 rounded-xl border border-slate-100 dark:border-slate-800/60 hover:border-indigo-100 dark:hover:border-indigo-950/50 hover:bg-indigo-50/30 dark:hover:bg-indigo-950/10 flex items-center justify-between transition-all group"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <div className={`p-2.5 rounded-lg shrink-0 transition-transform group-hover:scale-105 ${merchant.logoBg}`}>
                            <IconComponent className="w-5 h-5" />
                          </div>
                          <div className="min-w-0">
                            <h4 className="font-medium text-slate-900 dark:text-white truncate group-hover:text-indigo-600 dark:group-hover:text-indigo-400 transition-colors">
                              {merchant.name}
                            </h4>
                            {merchant.localName && (
                              <p className="text-xs text-slate-400 dark:text-slate-500 truncate mt-0.5">
                                {merchant.localName}
                              </p>
                            )}
                          </div>
                        </div>
                        <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-indigo-500 group-hover:translate-x-0.5 transition-all shrink-0 ml-2" />
                      </button>
                    );
                  })
                ) : (
                  <div className="text-center py-12 px-4">
                    <HelpCircle className="w-10 h-10 text-slate-300 dark:text-slate-700 mx-auto mb-3" />
                    <p className="text-sm font-medium text-slate-600 dark:text-slate-400">No merchants found</p>
                    <p className="text-xs text-slate-400 dark:text-slate-500 mt-1">Try adjusting your search query or category filter.</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* STEP 2: BILL DETAILS FORM (Right Panel / Full Width if selected) */}
        <div className="flex-1 p-6 bg-white dark:bg-slate-900">
          {selectedMerchant ? (
            showSuccess ? (
              /* Success State */
              <div className="h-full flex flex-col items-center justify-center text-center py-8 animate-fade-in">
                <div className="w-16 h-16 bg-emerald-100 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-full flex items-center justify-center mb-4 shadow-inner">
                  <Check className="w-8 h-8 stroke-[3]" />
                </div>
                <h3 className="text-xl font-bold text-slate-900 dark:text-white">Payment Configured!</h3>
                <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-sm">
                  Your bill payment details for <span className="font-semibold text-slate-800 dark:text-slate-200">{selectedMerchant.name}</span> have been successfully validated and saved.
                </p>

                <div className="mt-6 p-4 bg-slate-50 dark:bg-slate-950 rounded-xl border border-slate-100 dark:border-slate-800 w-full max-w-md text-left space-y-2.5 text-sm">
                  <div className="flex justify-between">
                    <span className="text-slate-400">Reference:</span>
                    <span className="font-mono font-medium text-slate-800 dark:text-slate-200">{refNumber}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-400">Amount:</span>
                    <span className="font-semibold text-slate-800 dark:text-slate-200">${parseFloat(amount).toFixed(2)}</span>
                  </div>
                  {dueDate && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Due Date:</span>
                      <span className="font-medium text-slate-800 dark:text-slate-200">{dueDate}</span>
                    </div>
                  )}
                  {isRecurring && (
                    <div className="flex justify-between">
                      <span className="text-slate-400">Schedule:</span>
                      <span className="font-medium text-indigo-600 dark:text-indigo-400 capitalize">Recurring ({recurringInterval})</span>
                    </div>
                  )}
                </div>

                <div className="mt-8 flex gap-3 w-full max-w-md">
                  <button
                    onClick={handleReset}
                    className="flex-1 py-2.5 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-medium hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Setup Another
                  </button>
                </div>
              </div>
            ) : (
              /* Active Form */
              <form onSubmit={handleSubmit} className="space-y-6">
                {/* Mobile Back Button */}
                <button
                  type="button"
                  onClick={() => setSelectedMerchant(null)}
                  className="md:hidden flex items-center gap-1.5 text-xs font-medium text-indigo-600 dark:text-indigo-400 mb-4"
                >
                  <ArrowLeft className="w-3.5 h-3.5" /> Back to Merchant List
                </button>

                <h3 className="text-lg font-bold text-slate-900 dark:text-white hidden md:block">Configure Bill Details</h3>

                {/* Reference Number Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    {selectedMerchant.refLabel} <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      placeholder={selectedMerchant.refPlaceholder}
                      value={refNumber}
                      onChange={(e) => setRefNumber(e.target.value)}
                      className={`w-full px-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        errors.refNumber ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.refNumber ? (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.refNumber}
                    </p>
                  ) : (
                    <p className="text-xs text-slate-400 dark:text-slate-500 flex items-start gap-1 mt-1">
                      <Info className="w-3.5 h-3.5 shrink-0 mt-0.5 text-slate-400" />
                      <span>{selectedMerchant.refHelpText}</span>
                    </p>
                  )}
                </div>

                {/* Amount Input */}
                <div className="space-y-2">
                  <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                    Payment Amount <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <div className="absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400 dark:text-slate-500 font-medium">
                      <DollarSign className="w-4 h-4" />
                    </div>
                    <input
                      type="number"
                      step="0.01"
                      placeholder="0.00"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      className={`w-full pl-9 pr-4 py-3 bg-slate-50 dark:bg-slate-950 border rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all ${
                        errors.amount ? 'border-red-500 focus:ring-red-500' : 'border-slate-200 dark:border-slate-800'
                      }`}
                    />
                  </div>
                  {errors.amount && (
                    <p className="text-xs text-red-500 flex items-center gap-1 mt-1">
                      <AlertCircle className="w-3.5 h-3.5" /> {errors.amount}
                    </p>
                  )}
                  {/* Quick Amount Selectors */}
                  <div className="flex gap-2 mt-2">
                    {['25', '50', '100', '250'].map((val) => (
                      <button
                        key={val}
                        type="button"
                        onClick={() => setAmount(val)}
                        className="px-3 py-1 text-xs font-medium rounded-lg border border-slate-200 dark:border-slate-800 text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                      >
                        ${val}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Due Date & Memo Grid */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300 flex items-center gap-1.5">
                      <Calendar className="w-4 h-4 text-slate-400" /> Due Date <span className="text-xs font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="date"
                      value={dueDate}
                      onChange={(e) => setDueDate(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                      Memo / Note <span className="text-xs font-normal text-slate-400">(Optional)</span>
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. Home electricity"
                      value={memo}
                      onChange={(e) => setMemo(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-50 dark:bg-slate-950 border border-slate-200 dark:border-slate-800 rounded-xl text-slate-900 dark:text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                    />
                  </div>
                </div>

                {/* Recurring Payment Toggle */}
                <div className="p-4 rounded-xl border border-slate-100 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-950/30 space-y-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-start gap-2.5">
                      <RefreshCw className={`w-5 h-5 mt-0.5 ${isRecurring ? 'text-indigo-600 dark:text-indigo-400 animate-spin-slow' : 'text-slate-400'}`} />
                      <div>
                        <label className="block text-sm font-semibold text-slate-800 dark:text-slate-200">
                          Set as Recurring Payment
                        </label>
                        <p className="text-xs text-slate-400 dark:text-slate-500">
                          Automatically pay this bill on a scheduled basis.
                        </p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={isRecurring}
                        onChange={(e) => setIsRecurring(e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-200 dark:bg-slate-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all dark:border-slate-600 peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {isRecurring && (
                    <div className="pt-3 border-t border-slate-200/60 dark:border-slate-800/60 flex items-center gap-4 animate-fade-in">
                      <span className="text-xs font-medium text-slate-500 dark:text-slate-400">Repeat Interval:</span>
                      <div className="flex gap-2">
                        {(['weekly', 'monthly', 'quarterly'] as const).map((interval) => (
                          <button
                            key={interval}
                            type="button"
                            onClick={() => setRecurringInterval(interval)}
                            className={`px-3 py-1 rounded-lg text-xs font-medium capitalize transition-all ${
                              recurringInterval === interval
                                ? 'bg-indigo-50 dark:bg-indigo-950/40 text-indigo-600 dark:text-indigo-400 border border-indigo-200 dark:border-indigo-900'
                                : 'border border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-slate-800'
                            }`}
                          >
                            {interval}
                          </button>
                        ))}
                      </div>
                    </div>
                  )}
                </div>

                {/* Action Buttons */}
                <div className="flex gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
                  <button
                    type="button"
                    onClick={handleReset}
                    className="flex-1 py-3 border border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-300 rounded-xl text-sm font-semibold hover:bg-slate-50 dark:hover:bg-slate-800 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="flex-1 py-3 bg-indigo-600 hover:bg-indigo-700 text-white rounded-xl text-sm font-semibold shadow-lg shadow-indigo-600/10 hover:shadow-indigo-600/20 transition-all flex items-center justify-center gap-2 disabled:opacity-70 disabled:cursor-not-allowed"
                  >
                    {isSubmitting ? (
                      <>
                        <svg className="animate-spin h-4 w-4 text-white" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                        Validating...
                      </>
                    ) : (
                      'Confirm & Proceed'
                    )}
                  </button>
                </div>
              </form>
            )
          ) : (
            /* Empty State (When no merchant is selected) */
            <div className="h-full flex flex-col items-center justify-center text-center py-12 px-4">
              <div className="w-16 h-16 bg-indigo-50 dark:bg-indigo-950/30 text-indigo-500 dark:text-indigo-400 rounded-full flex items-center justify-center mb-4">
                <Landmark className="w-8 h-8" />
              </div>
              <h3 className="text-lg font-bold text-slate-900 dark:text-white">No Merchant Selected</h3>
              <p className="text-sm text-slate-500 dark:text-slate-400 mt-2 max-w-xs">
                Please select a registered merchant from the list on the left to configure your bill payment details.
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}