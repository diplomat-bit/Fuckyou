import React, { useState, useEffect } from 'react';
import { 
  CreditCard, 
  ShieldCheck, 
  MapPin, 
  DollarSign, 
  CheckCircle2, 
  AlertCircle, 
  Info, 
  BookOpen, 
  TrendingUp,
  Check,
  ChevronRight,
  HelpCircle
} from 'lucide-react';

// Define interfaces for form state
interface Address {
  street: string;
  apartment: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
}

interface CreditSelectionFormData {
  embossName: string;
  requestedLimit: number;
  allowAutoIncrease: boolean;
  billingAddress: Address;
  deliveryAddressSameAsBilling: boolean;
  deliveryAddress: Address;
  enrollCreditShield: boolean;
  requireAtmAccess: boolean;
  requireChequeBook: boolean;
}

interface FormErrors {
  embossName?: string;
  requestedLimit?: string;
  billingAddress?: { [key in keyof Address]?: string };
  deliveryAddress?: { [key in keyof Address]?: string };
}

export default function OnboardingCreditSelectionForm() {
  // Initial State
  const [formData, setFormData] = useState<CreditSelectionFormData>({
    embossName: '',
    requestedLimit: 5000,
    allowAutoIncrease: true,
    billingAddress: {
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    deliveryAddressSameAsBilling: true,
    deliveryAddress: {
      street: '',
      apartment: '',
      city: '',
      state: '',
      zipCode: '',
      country: 'United States',
    },
    enrollCreditShield: true,
    requireAtmAccess: false,
    requireChequeBook: false,
  });

  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);

  // Sync delivery address if "same as billing" is checked
  useEffect(() => {
    if (formData.deliveryAddressSameAsBilling) {
      setFormData(prev => ({
        ...prev,
        deliveryAddress: { ...prev.billingAddress }
      }));
    }
  }, [formData.billingAddress, formData.deliveryAddressSameAsBilling]);

  // Validation
  const validateForm = (): boolean => {
    const newErrors: FormErrors = {};
    
    // Emboss Name validation (A-Z, spaces, max 19 chars)
    const nameRegex = /^[A-Za-z\s]{2,19}$/;
    if (!formData.embossName) {
      newErrors.embossName = 'Emboss name is required';
    } else if (!nameRegex.test(formData.embossName)) {
      newErrors.embossName = 'Name must be 2-19 characters, letters and spaces only';
    }

    // Limit validation
    if (formData.requestedLimit < 1000 || formData.requestedLimit > 50000) {
      newErrors.requestedLimit = 'Limit must be between $1,000 and $50,000';
    }

    // Address validation helper
    const validateAddress = (addr: Address) => {
      const addrErrors: { [key in keyof Address]?: string } = {};
      if (!addr.street.trim()) addrErrors.street = 'Street address is required';
      if (!addr.city.trim()) addrErrors.city = 'City is required';
      if (!addr.state.trim()) addrErrors.state = 'State/Province is required';
      if (!addr.zipCode.trim()) addrErrors.zipCode = 'ZIP/Postal code is required';
      return Object.keys(addrErrors).length > 0 ? addrErrors : null;
    };

    const billingErrors = validateAddress(formData.billingAddress);
    if (billingErrors) {
      newErrors.billingAddress = billingErrors;
    }

    if (!formData.deliveryAddressSameAsBilling) {
      const deliveryErrors = validateAddress(formData.deliveryAddress);
      if (deliveryErrors) {
        newErrors.deliveryAddress = deliveryErrors;
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handlers
  const handleInputChange = (field: keyof CreditSelectionFormData, value: any) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    // Clear error on change
    if (errors[field as keyof FormErrors]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleAddressChange = (
    type: 'billingAddress' | 'deliveryAddress',
    field: keyof Address,
    value: string
  ) => {
    setFormData(prev => ({
      ...prev,
      [type]: {
        ...prev[type],
        [field]: value
      }
    }));
    // Clear nested error
    if (errors[type]) {
      setErrors(prev => ({
        ...prev,
        [type]: {
          ...prev[type],
          [field]: undefined
        }
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstErrorEl = document.querySelector('[data-error="true"]');
      if (firstErrorEl) {
        firstErrorEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    setIsSubmitting(true);
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1800));
    setIsSubmitting(false);
    setIsSubmitted(true);
  };

  if (isSubmitted) {
    return (
      <div className="max-w-3xl mx-auto my-12 bg-white dark:bg-slate-900 rounded-3xl shadow-2xl border border-slate-100 dark:border-slate-800 overflow-hidden transition-all duration-300">
        <div className="p-8 md:p-12 text-center flex flex-col items-center">
          <div className="w-20 h-20 bg-emerald-50 dark:bg-emerald-950/30 rounded-full flex items-center justify-center mb-6 animate-bounce">
            <CheckCircle2 className="w-12 h-12 text-emerald-500" />
          </div>
          <h2 className="text-3xl font-bold text-slate-900 dark:text-white mb-3">
            Configuration Saved Successfully!
          </h2>
          <p className="text-slate-500 dark:text-slate-400 max-w-md mb-8">
            Your credit card preferences, limits, and delivery details have been securely registered. We are preparing your custom card now.
          </p>
          
          {/* Summary Card */}
          <div className="w-full max-w-md bg-slate-50 dark:bg-slate-800/50 rounded-2xl p-6 text-left border border-slate-100 dark:border-slate-800 mb-8">
            <h3 className="font-semibold text-slate-800 dark:text-slate-200 mb-4 border-b border-slate-200 dark:border-slate-700 pb-2">
              Selection Summary
            </h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Emboss Name:</span>
                <span className="font-medium text-slate-900 dark:text-white uppercase tracking-wider">{formData.embossName}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Credit Limit:</span>
                <span className="font-medium text-slate-900 dark:text-white">${formData.requestedLimit.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Credit Shield:</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.enrollCreditShield ? 'Enrolled' : 'Declined'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">ATM Access:</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.requireAtmAccess ? 'Enabled' : 'Disabled'}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500 dark:text-slate-400">Cheque Book:</span>
                <span className="font-medium text-slate-900 dark:text-white">{formData.requireChequeBook ? 'Requested' : 'Not Requested'}</span>
              </div>
            </div>
          </div>

          <button 
            onClick={() => setIsSubmitted(false)}
            className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 text-white font-semibold rounded-xl shadow-lg shadow-indigo-500/20 transition-all duration-200"
          >
            Modify Configuration
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-5xl mx-auto my-8 px-4">
      {/* Header */}
      <div className="mb-8 text-center md:text-left">
        <h1 className="text-3xl md:text-4xl font-extrabold text-slate-900 dark:text-white tracking-tight">
          Configure Your Credit Parameters
        </h1>
        <p className="mt-2 text-slate-600 dark:text-slate-400 max-w-2xl">
          Customize your card's physical appearance, set your desired credit limits, configure security features, and specify delivery preferences.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Form Inputs */}
        <div className="lg:col-span-7 space-y-8">
          
          {/* Section 1: Card Customization */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 bg-indigo-50 dark:bg-indigo-950/50 rounded-lg text-indigo-600 dark:text-indigo-400">
                <CreditCard className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Card Customization</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">How your name will appear on the physical card</p>
              </div>
            </div>

            <div className="space-y-2" data-error={!!errors.embossName}>
              <label className="block text-sm font-semibold text-slate-700 dark:text-slate-300">
                Emboss Name <span className="text-rose-500">*</span>
              </label>
              <input
                type="text"
                maxLength={19}
                value={formData.embossName}
                onChange={(e) => handleInputChange('embossName', e.target.value.toUpperCase())}
                placeholder="JOHN H. SMITH"
                className={`w-full px-4 py-3 rounded-xl border ${
                  errors.embossName 
                    ? 'border-rose-500 focus:ring-rose-500/20' 
                    : 'border-slate-200 dark:border-slate-700 focus:ring-indigo-500/20'
                } bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-4 transition-all uppercase tracking-wider font-mono`}
              />
              {errors.embossName ? (
                <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                  <AlertCircle className="w-3.5 h-3.5" /> {errors.embossName}
                </p>
              ) : (
                <p className="text-xs text-slate-400 dark:text-slate-500">
                  Maximum 19 characters. Standard English letters and spaces only.
                </p>
              )}
            </div>
          </div>

          {/* Section 2: Credit Limit Configuration */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-emerald-50 dark:bg-emerald-950/50 rounded-lg text-emerald-600 dark:text-emerald-400">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-lg font-bold text-slate-900 dark:text-white">Credit Limit</h2>
                  <p className="text-xs text-slate-500 dark:text-slate-400">Request your preferred spending power</p>
                </div>
              </div>
              <span className="text-2xl font-extrabold text-indigo-600 dark:text-indigo-400 font-mono">
                ${formData.requestedLimit.toLocaleString()}
              </span>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <div className="flex justify-between text-xs text-slate-400 dark:text-slate-500 font-medium">
                  <span>Min: $1,000</span>
                  <span>Max: $50,000</span>
                </div>
                <input
                  type="range"
                  min="1000"
                  max="50000"
                  step="500"
                  value={formData.requestedLimit}
                  onChange={(e) => handleInputChange('requestedLimit', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-200 dark:bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-600 dark:accent-indigo-400"
                />
              </div>

              {/* Auto Increase Consent */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="allowAutoIncrease"
                  checked={formData.allowAutoIncrease}
                  onChange={(e) => handleInputChange('allowAutoIncrease', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div className="space-y-1">
                  <label htmlFor="allowAutoIncrease" className="text-sm font-semibold text-slate-800 dark:text-slate-200 flex items-center gap-1.5 cursor-pointer">
                    Automatic Credit Limit Increases
                    <TrendingUp className="w-4 h-4 text-emerald-500" />
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                    Consent to periodic automatic reviews and limit increases based on your account performance without requiring manual applications.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Section 3: Addresses */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 bg-amber-50 dark:bg-amber-950/50 rounded-lg text-amber-600 dark:text-amber-400">
                <MapPin className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Address Details</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Billing and physical card delivery locations</p>
              </div>
            </div>

            {/* Billing Address */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Billing Address</h3>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="md:col-span-2 space-y-1" data-error={!!errors.billingAddress?.street}>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Street Address *</label>
                  <input
                    type="text"
                    value={formData.billingAddress.street}
                    onChange={(e) => handleAddressChange('billingAddress', 'street', e.target.value)}
                    placeholder="123 Financial Way"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {errors.billingAddress?.street && <p className="text-xs text-rose-500">{errors.billingAddress.street}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Apartment, Suite, etc. (Optional)</label>
                  <input
                    type="text"
                    value={formData.billingAddress.apartment}
                    onChange={(e) => handleAddressChange('billingAddress', 'apartment', e.target.value)}
                    placeholder="Suite 400"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                </div>

                <div className="space-y-1" data-error={!!errors.billingAddress?.city}>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">City *</label>
                  <input
                    type="text"
                    value={formData.billingAddress.city}
                    onChange={(e) => handleAddressChange('billingAddress', 'city', e.target.value)}
                    placeholder="New York"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {errors.billingAddress?.city && <p className="text-xs text-rose-500">{errors.billingAddress.city}</p>}
                </div>

                <div className="space-y-1" data-error={!!errors.billingAddress?.state}>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">State / Province *</label>
                  <input
                    type="text"
                    value={formData.billingAddress.state}
                    onChange={(e) => handleAddressChange('billingAddress', 'state', e.target.value)}
                    placeholder="NY"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {errors.billingAddress?.state && <p className="text-xs text-rose-500">{errors.billingAddress.state}</p>}
                </div>

                <div className="space-y-1" data-error={!!errors.billingAddress?.zipCode}>
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ZIP / Postal Code *</label>
                  <input
                    type="text"
                    value={formData.billingAddress.zipCode}
                    onChange={(e) => handleAddressChange('billingAddress', 'zipCode', e.target.value)}
                    placeholder="10001"
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  />
                  {errors.billingAddress?.zipCode && <p className="text-xs text-rose-500">{errors.billingAddress.zipCode}</p>}
                </div>

                <div className="space-y-1">
                  <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Country *</label>
                  <select
                    value={formData.billingAddress.country}
                    onChange={(e) => handleAddressChange('billingAddress', 'country', e.target.value)}
                    className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                  >
                    <option value="United States">United States</option>
                    <option value="Canada">Canada</option>
                    <option value="United Kingdom">United Kingdom</option>
                    <option value="Australia">Australia</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Delivery Address Toggle */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-800">
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="deliveryAddressSameAsBilling"
                  checked={formData.deliveryAddressSameAsBilling}
                  onChange={(e) => handleInputChange('deliveryAddressSameAsBilling', e.target.checked)}
                  className="h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <label htmlFor="deliveryAddressSameAsBilling" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                  Deliver physical card to my billing address
                </label>
              </div>
            </div>

            {/* Delivery Address (Conditional) */}
            {!formData.deliveryAddressSameAsBilling && (
              <div className="space-y-4 pt-4 border-t border-slate-100 dark:border-slate-800 animate-fadeIn">
                <h3 className="text-sm font-bold text-slate-800 dark:text-slate-200 uppercase tracking-wider">Delivery Address</h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="md:col-span-2 space-y-1" data-error={!!errors.deliveryAddress?.street}>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Street Address *</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.street}
                      onChange={(e) => handleAddressChange('deliveryAddress', 'street', e.target.value)}
                      placeholder="456 Delivery Blvd"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {errors.deliveryAddress?.street && <p className="text-xs text-rose-500">{errors.deliveryAddress.street}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Apartment, Suite, etc. (Optional)</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.apartment}
                      onChange={(e) => handleAddressChange('deliveryAddress', 'apartment', e.target.value)}
                      placeholder="Apt 2B"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                  </div>

                  <div className="space-y-1" data-error={!!errors.deliveryAddress?.city}>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">City *</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.city}
                      onChange={(e) => handleAddressChange('deliveryAddress', 'city', e.target.value)}
                      placeholder="Brooklyn"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {errors.deliveryAddress?.city && <p className="text-xs text-rose-500">{errors.deliveryAddress.city}</p>}
                  </div>

                  <div className="space-y-1" data-error={!!errors.deliveryAddress?.state}>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">State / Province *</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.state}
                      onChange={(e) => handleAddressChange('deliveryAddress', 'state', e.target.value)}
                      placeholder="NY"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {errors.deliveryAddress?.state && <p className="text-xs text-rose-500">{errors.deliveryAddress.state}</p>}
                  </div>

                  <div className="space-y-1" data-error={!!errors.deliveryAddress?.zipCode}>
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">ZIP / Postal Code *</label>
                    <input
                      type="text"
                      value={formData.deliveryAddress.zipCode}
                      onChange={(e) => handleAddressChange('deliveryAddress', 'zipCode', e.target.value)}
                      placeholder="11201"
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    />
                    {errors.deliveryAddress?.zipCode && <p className="text-xs text-rose-500">{errors.deliveryAddress.zipCode}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-slate-600 dark:text-slate-400">Country *</label>
                    <select
                      value={formData.deliveryAddress.country}
                      onChange={(e) => handleAddressChange('deliveryAddress', 'country', e.target.value)}
                      className="w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-700 bg-slate-50 dark:bg-slate-800/50 text-slate-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-indigo-500/20"
                    >
                      <option value="United States">United States</option>
                      <option value="Canada">Canada</option>
                      <option value="United Kingdom">United Kingdom</option>
                      <option value="Australia">Australia</option>
                    </select>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Section 4: Additional Features */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-100 dark:border-slate-800 pb-4">
              <div className="p-2 bg-purple-50 dark:bg-purple-950/50 rounded-lg text-purple-600 dark:text-purple-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-slate-900 dark:text-white">Security & Add-ons</h2>
                <p className="text-xs text-slate-500 dark:text-slate-400">Protect your balance and configure physical access</p>
              </div>
            </div>

            {/* Credit Shield Insurance */}
            <div className="p-4 bg-indigo-50/40 dark:bg-indigo-950/10 rounded-2xl border border-indigo-100/50 dark:border-indigo-900/30 space-y-3">
              <div className="flex items-start justify-between">
                <div className="flex items-start space-x-3">
                  <input
                    type="checkbox"
                    id="enrollCreditShield"
                    checked={formData.enrollCreditShield}
                    onChange={(e) => handleInputChange('enrollCreditShield', e.target.checked)}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                  />
                  <div>
                    <label htmlFor="enrollCreditShield" className="text-sm font-bold text-slate-900 dark:text-white flex items-center gap-1.5 cursor-pointer">
                      Enroll in Credit Shield Insurance
                      <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-100 dark:bg-indigo-900 text-indigo-800 dark:text-indigo-300 rounded-full">
                        Recommended
                      </span>
                    </label>
                    <p className="text-xs text-slate-500 dark:text-slate-400 mt-1 leading-relaxed">
                      Protects your outstanding balance in the event of involuntary loss of employment, critical illness, or temporary disability. Only 0.89% of your outstanding balance monthly.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setActiveTooltip(activeTooltip === 'shield' ? null : 'shield')}
                  className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 transition-colors"
                >
                  <HelpCircle className="w-4 h-4" />
                </button>
              </div>
              
              {activeTooltip === 'shield' && (
                <div className="text-xs bg-white dark:bg-slate-800 p-3 rounded-lg border border-slate-100 dark:border-slate-700 text-slate-600 dark:text-slate-300 animate-fadeIn">
                  <strong>How it works:</strong> If you experience a covered life event, Credit Shield will pay off your minimum monthly payment or full outstanding balance up to $25,000. You can cancel anytime.
                </div>
              )}
            </div>

            {/* ATM & Cheque Book Requirements */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* ATM Access */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="requireAtmAccess"
                  checked={formData.requireAtmAccess}
                  onChange={(e) => handleInputChange('requireAtmAccess', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <label htmlFor="requireAtmAccess" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer">
                    Enable ATM Cash Advance
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Allows physical cash withdrawals at ATMs globally. Cash advance fees apply.
                  </p>
                </div>
              </div>

              {/* Cheque Book */}
              <div className="p-4 bg-slate-50 dark:bg-slate-800/40 rounded-xl border border-slate-100 dark:border-slate-800 flex items-start space-x-3">
                <input
                  type="checkbox"
                  id="requireChequeBook"
                  checked={formData.requireChequeBook}
                  onChange={(e) => handleInputChange('requireChequeBook', e.target.checked)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-indigo-600 focus:ring-indigo-500"
                />
                <div>
                  <label htmlFor="requireChequeBook" className="text-sm font-semibold text-slate-800 dark:text-slate-200 cursor-pointer flex items-center gap-1.5">
                    Request Cheque Book
                    <BookOpen className="w-3.5 h-3.5 text-slate-400" />
                  </label>
                  <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
                    Receive a complimentary 25-page cheque book linked directly to your credit line.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-4 bg-indigo-600 hover:bg-indigo-700 disabled:bg-indigo-400 text-white font-bold rounded-2xl shadow-xl shadow-indigo-500/20 transition-all duration-200 flex items-center justify-center space-x-2 text-lg"
          >
            {isSubmitting ? (
              <>
                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                <span>Securing Configuration...</span>
              </>
            ) : (
              <>
                <span>Confirm & Continue</span>
                <ChevronRight className="w-5 h-5" />
              </>
            )}
          </button>

        </div>

        {/* Right Column: Live Card Preview & Summary */}
        <div className="lg:col-span-5 space-y-6 lg:sticky lg:top-8 self-start">
          
          {/* Live Card Preview */}
          <div className="bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 rounded-3xl p-6 shadow-2xl border border-slate-800 relative overflow-hidden aspect-[1.586/1] flex flex-col justify-between text-white">
            {/* Decorative background glow */}
            <div className="absolute -right-10 -top-10 w-40 h-40 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-purple-500/10 rounded-full blur-3xl pointer-events-none" />

            {/* Card Header */}
            <div className="flex justify-between items-start z-10">
              <div>
                <span className="text-xs font-bold tracking-widest text-indigo-300 uppercase">Apex Premium</span>
                <div className="h-1 w-8 bg-indigo-400 rounded-full mt-1" />
              </div>
              <div className="w-12 h-8 bg-white/10 rounded-md backdrop-blur-sm flex items-center justify-center border border-white/10">
                <span className="text-[10px] font-extrabold tracking-wider text-white/80">VISA</span>
              </div>
            </div>

            {/* Card Chip */}
            <div className="w-10 h-8 bg-gradient-to-br from-amber-300 to-amber-500 rounded-md relative overflow-hidden shadow-inner z-10">
              <div className="absolute inset-0 grid grid-cols-3 gap-0.5 p-1 opacity-40">
                {[...Array(9)].map((_, i) => (
                  <div key={i} className="border border-slate-900/30 rounded-sm" />
                ))}
              </div>
            </div>

            {/* Card Details */}
            <div className="space-y-4 z-10">
              {/* Card Number Placeholder */}
              <div className="text-lg md:text-xl font-mono tracking-[0.2em] text-slate-100">
                ••••  ••••  ••••  4029
              </div>

              {/* Cardholder & Expiry */}
              <div className="flex justify-between items-end">
                <div className="space-y-0.5 max-w-[70%]">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Cardholder Name</span>
                  <span className="text-sm font-mono tracking-wider uppercase truncate block min-h-[20px]">
                    {formData.embossName || 'YOUR NAME HERE'}
                  </span>
                </div>
                <div className="text-right">
                  <span className="text-[9px] text-slate-400 uppercase tracking-wider block">Expires</span>
                  <span className="text-sm font-mono tracking-wider block">12/29</span>
                </div>
              </div>
            </div>
          </div>

          {/* Live Summary Panel */}
          <div className="bg-white dark:bg-slate-900 rounded-2xl p-6 shadow-sm border border-slate-100 dark:border-slate-800/80 space-y-4">
            <h3 className="font-bold text-slate-900 dark:text-white text-base">Configuration Overview</h3>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Requested Limit</span>
                <span className="font-semibold text-slate-900 dark:text-white">${formData.requestedLimit.toLocaleString()}</span>
              </div>
              
              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Credit Shield Protection</span>
                <span className={`font-semibold ${formData.enrollCreditShield ? 'text-emerald-600 dark:text-emerald-400' : 'text-slate-400'}`}>
                  {formData.enrollCreditShield ? 'Enrolled' : 'Declined'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">ATM Cash Access</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formData.requireAtmAccess ? 'Enabled' : 'Disabled'}
                </span>
              </div>

              <div className="flex justify-between py-2 border-b border-slate-50 dark:border-slate-800/50">
                <span className="text-slate-500 dark:text-slate-400">Cheque Book</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formData.requireChequeBook ? 'Requested' : 'None'}
                </span>
              </div>

              <div className="flex justify-between py-2">
                <span className="text-slate-500 dark:text-slate-400">Delivery Method</span>
                <span className="font-semibold text-slate-900 dark:text-white">
                  {formData.deliveryAddressSameAsBilling ? 'Standard Billing Address' : 'Alternative Address'}
                </span>
              </div>
            </div>

            {/* Security Notice */}
            <div className="p-3 bg-slate-50 dark:bg-slate-800/50 rounded-xl flex items-start space-x-2.5 text-xs text-slate-500 dark:text-slate-400">
              <Info className="w-4 h-4 text-indigo-500 shrink-0 mt-0.5" />
              <span>
                All configurations are encrypted end-to-end. Final credit limit approval is subject to standard credit bureau verification.
              </span>
            </div>
          </div>

        </div>

      </form>
    </div>
  );
}