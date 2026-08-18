import React, { useState, useMemo } from 'react';
import { callGemini } from '../services/geminiService';
import { 
  ShieldCheck, 
  ShieldAlert, 
  CreditCard, 
  MapPin, 
  HelpCircle, 
  Loader2, 
  CheckCircle2, 
  AlertTriangle, 
  RefreshCw, 
  Info, 
  ArrowRight, 
  Sparkles,
  Lock,
  Globe,
  FileText,
  Check,
  ChevronRight
} from 'lucide-react';

// Interfaces
interface BillingAddress {
  street: string;
  city: string;
  state: string;
  zip: string;
  country: string;
}

interface CardDetails {
  cardNumber: string;
  cardholderName: string;
  expiryDate: string;
  cvv: string;
  address: BillingAddress;
}

interface EligibilityResult {
  eligible: boolean;
  bin: string;
  cardProduct: string;
  issuer: string;
  cardType: 'Commercial' | 'Consumer' | 'Unknown';
  virtualSupport: 'Supported' | 'Unsupported' | 'Restricted';
  pushToCard: boolean;
  tokenization: boolean;
  avsStatus: 'Matched' | 'Partial Match' | 'Failed';
  failureReason?: string;
}

// Mock BIN Database for realistic local evaluation
const MOCK_BIN_DATABASE: Record<string, { product: string; issuer: string; type: 'Commercial' | 'Consumer'; virtual: 'Supported' | 'Unsupported' | 'Restricted'; push: boolean; token: boolean }> = {
  '414720': { product: 'Visa Signature Business', issuer: 'Chase Bank', type: 'Commercial', virtual: 'Supported', push: true, token: true },
  '400011': { product: 'Visa Corporate Classic', issuer: 'Wells Fargo', type: 'Commercial', virtual: 'Supported', push: true, token: true },
  '422315': { product: 'Visa Business Debit', issuer: 'Bank of America', type: 'Commercial', virtual: 'Restricted', push: true, token: true },
  '453200': { product: 'Visa Classic Consumer', issuer: 'Citibank', type: 'Consumer', virtual: 'Unsupported', push: false, token: true },
  '491600': { product: 'Visa Gold Consumer', issuer: 'Capital One', type: 'Consumer', virtual: 'Unsupported', push: false, token: true },
};

export default function VisaEligibilityChecker() {
  // Form State
  const [cardDetails, setCardDetails] = useState<CardDetails>({
    cardNumber: '',
    cardholderName: '',
    expiryDate: '',
    cvv: '',
    address: {
      street: '',
      city: '',
      state: '',
      zip: '',
      country: 'US'
    }
  });

  // UI & Processing State
  const [isChecking, setIsChecking] = useState(false);
  const [checkStep, setCheckStep] = useState<string>('');
  const [result, setResult] = useState<EligibilityResult | null>(null);
  const [troubleshooting, setTroubleshooting] = useState<string>('');
  const [isLoadingTroubleshooting, setIsLoadingTroubleshooting] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Luhn Algorithm Validation
  const validateLuhn = (num: string): boolean => {
    const sanitized = num.replace(/\D/g, '');
    if (sanitized.length < 13 || sanitized.length > 19) return false;
    let sum = 0;
    let shouldDouble = false;
    for (let i = sanitized.length - 1; i >= 0; i--) {
      let digit = parseInt(sanitized.charAt(i), 10);
      if (shouldDouble) {
        digit *= 2;
        if (digit > 9) digit -= 9;
      }
      sum += digit;
      shouldDouble = !shouldDouble;
    }
    return sum % 10 === 0;
  };

  // Input Handlers with Auto-formatting
  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 16);
    const formatted = value.replace(/(\d{4})(?=\d)/g, '$1 ').trim();
    setCardDetails(prev => ({ ...prev, cardNumber: formatted }));
    if (errors.cardNumber) {
      setErrors(prev => {
        const copy = { ...prev };
        delete copy.cardNumber;
        return copy;
      });
    }
  };

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, '').slice(0, 4);
    if (value.length >= 2) {
      value = `${value.slice(0, 2)}/${value.slice(2)}`;
    }
    setCardDetails(prev => ({ ...prev, expiryDate: value }));
  };

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, '').slice(0, 4);
    setCardDetails(prev => ({ ...prev, cvv: value }));
  };

  const handleAddressChange = (field: keyof BillingAddress, value: string) => {
    setCardDetails(prev => ({
      ...prev,
      address: {
        ...prev.address,
        [field]: value
      }
    }));
  };

  // Form Validation
  const validateForm = (): boolean => {
    const newErrors: Record<string, string> = {};
    const cleanCard = cardDetails.cardNumber.replace(/\s/g, '');

    if (!cleanCard) {
      newErrors.cardNumber = 'Card number is required';
    } else if (cleanCard.charAt(0) !== '4') {
      newErrors.cardNumber = 'Only Visa cards (starting with 4) are supported for VCS';
    } else if (!validateLuhn(cleanCard)) {
      newErrors.cardNumber = 'Invalid card number (Luhn checksum failed)';
    }

    if (!cardDetails.cardholderName.trim()) {
      newErrors.cardholderName = 'Cardholder name is required';
    }

    if (!/^\d{2}\/\d{2}$/.test(cardDetails.expiryDate)) {
      newErrors.expiryDate = 'Invalid expiry (MM/YY)';
    }

    if (cardDetails.cvv.length < 3) {
      newErrors.cvv = 'Invalid CVV';
    }

    if (!cardDetails.address.street.trim()) newErrors.street = 'Street address is required';
    if (!cardDetails.address.city.trim()) newErrors.city = 'City is required';
    if (!cardDetails.address.state.trim()) newErrors.state = 'State is required';
    if (!cardDetails.address.zip.trim()) newErrors.zip = 'ZIP code is required';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Run Eligibility Check
  const checkEligibility = async () => {
    if (!validateForm()) return;

    setIsChecking(true);
    setResult(null);
    setTroubleshooting('');
    
    const cleanCard = cardDetails.cardNumber.replace(/\s/g, '');
    const bin = cleanCard.slice(0, 6);

    try {
      setCheckStep('Validating Luhn checksum and card structure...');
      await new Promise(resolve => setTimeout(resolve, 800));

      setCheckStep('Querying Visa Commercial Solutions (VCS) BIN registry...');
      await new Promise(resolve => setTimeout(resolve, 1000));

      setCheckStep('Verifying Billing Address via AVS (Address Verification Service)...');
      await new Promise(resolve => setTimeout(resolve, 800));

      // Evaluate BIN
      const binData = MOCK_BIN_DATABASE[bin];
      
      // Simulate AVS check
      let avsStatus: 'Matched' | 'Partial Match' | 'Failed' = 'Matched';
      if (cardDetails.address.zip.length !== 5) {
        avsStatus = 'Partial Match';
      }
      if (cardDetails.address.street.toLowerCase().includes('fail')) {
        avsStatus = 'Failed';
      }

      if (binData) {
        const isEligible = binData.type === 'Commercial' && avsStatus !== 'Failed';
        let failureReason = undefined;

        if (binData.type !== 'Commercial') {
          failureReason = 'Card is classified as a Consumer product. Visa Commercial Solutions (VCS) require a valid Commercial, Corporate, or Business BIN.';
        } else if (avsStatus === 'Failed') {
          failureReason = 'AVS (Address Verification Service) validation failed. The billing address provided does not match the issuer records.';
        }

        setResult({
          eligible: isEligible,
          bin,
          cardProduct: binData.product,
          issuer: binData.issuer,
          cardType: binData.type,
          virtualSupport: binData.virtual,
          pushToCard: binData.push,
          tokenization: binData.token,
          avsStatus,
          failureReason
        });

        // If ineligible, trigger Gemini troubleshooting automatically
        if (!isEligible) {
          getGeminiTroubleshooting(bin, binData.product, binData.type, avsStatus, failureReason || '');
        }
      } else {
        // Unknown BIN
        setResult({
          eligible: false,
          bin,
          cardProduct: 'Unknown Visa Product',
          issuer: 'Unknown Issuer',
          cardType: 'Unknown',
          virtualSupport: 'Restricted',
          pushToCard: false,
          tokenization: true,
          avsStatus,
          failureReason: 'The BIN is not registered in the VCS Commercial database. Consumer or unclassified cards are ineligible.'
        });
        getGeminiTroubleshooting(bin, 'Unknown Visa Product', 'Unknown', avsStatus, 'BIN not found in commercial registry.');
      }
    } catch (err) {
      console.error(err);
      setErrors({ global: 'An error occurred while communicating with the Visa network.' });
    } finally {
      setIsChecking(false);
      setCheckStep('');
    }
  };

  // Gemini Troubleshooting Integration
  const getGeminiTroubleshooting = async (
    bin: string, 
    product: string, 
    type: string, 
    avs: string, 
    reason: string
  ) => {
    setIsLoadingTroubleshooting(true);
    try {
      const prompt = `
        You are a Visa Commercial Solutions (VCS) Integration Architect. 
        A corporate client attempted to register a card for virtual card provisioning, but it failed eligibility.
        
        Analyze the failure details:
        - BIN: ${bin}
        - Card Product: ${product}
        - Card Type: ${type}
        - AVS Status: ${avs}
        - System Failure Reason: ${reason}
        - Billing Address Provided: ${cardDetails.address.street}, ${cardDetails.address.city}, ${cardDetails.address.state} ${cardDetails.address.zip}
        
        Provide a highly professional, commercial-grade troubleshooting guide. 
        Explain:
        1. Why this specific card failed (e.g., consumer vs commercial rules, or AVS mismatch).
        2. Actionable steps the treasury or finance team must take to resolve this (e.g., contacting their commercial account manager, provisioning a commercial credit line, or correcting AVS details).
        3. Alternative Visa Commercial products that support virtual solutions.
        
        Keep the tone authoritative, helpful, and enterprise-focused. Format with clean markdown.
      `;
      const response = await callGemini(prompt);
      setTroubleshooting(response);
    } catch (err) {
      console.error(err);
      setTroubleshooting('Failed to generate AI troubleshooting guide. Please contact Visa Commercial Support.');
    } finally {
      setIsLoadingTroubleshooting(false);
    }
  };

  // Demo Presets for Quick Testing
  const applyPreset = (presetType: 'eligible' | 'consumer' | 'avs_fail') => {
    switch (presetType) {
      case 'eligible':
        setCardDetails({
          cardNumber: '4147 2000 1234 5678',
          cardholderName: 'Acme Corp Treasury',
          expiryDate: '12/28',
          cvv: '123',
          address: {
            street: '100 Metro Parkway',
            city: 'New York',
            state: 'NY',
            zip: '10001',
            country: 'US'
          }
        });
        break;
      case 'consumer':
        setCardDetails({
          cardNumber: '4532 0012 3456 7890',
          cardholderName: 'John Doe',
          expiryDate: '09/26',
          cvv: '456',
          address: {
            street: '742 Evergreen Terrace',
            city: 'Springfield',
            state: 'IL',
            zip: '62704',
            country: 'US'
          }
        });
        break;
      case 'avs_fail':
        setCardDetails({
          cardNumber: '4000 1199 8877 6655',
          cardholderName: 'Global Logistics Inc',
          expiryDate: '05/27',
          cvv: '987',
          address: {
            street: 'FAIL STREET 12',
            city: 'San Francisco',
            state: 'CA',
            zip: '94103',
            country: 'US'
          }
        });
        break;
    }
    setResult(null);
    setTroubleshooting('');
    setErrors({});
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 flex flex-col justify-between">
      <div className="max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between border-b border-slate-800 pb-6">
          <div>
            <div className="flex items-center gap-2 text-blue-400 font-semibold text-sm tracking-wider uppercase">
              <ShieldCheck className="w-4 h-4" />
              Visa Commercial Solutions
            </div>
            <h1 className="text-3xl font-bold tracking-tight mt-1">VCS Eligibility Checker</h1>
            <p className="text-slate-400 mt-1">Verify card eligibility for virtual card solutions, push-to-card capabilities, and tokenization.</p>
          </div>
          
          {/* Demo Presets */}
          <div className="mt-4 md:mt-0 flex flex-wrap gap-2">
            <button 
              onClick={() => applyPreset('eligible')}
              className="px-3 py-1.5 text-xs font-medium bg-emerald-950/50 text-emerald-400 border border-emerald-800/50 rounded-lg hover:bg-emerald-900/50 transition"
            >
              Preset: Eligible Commercial
            </button>
            <button 
              onClick={() => applyPreset('consumer')}
              className="px-3 py-1.5 text-xs font-medium bg-amber-950/50 text-amber-400 border border-amber-800/50 rounded-lg hover:bg-amber-900/50 transition"
            >
              Preset: Ineligible Consumer
            </button>
            <button 
              onClick={() => applyPreset('avs_fail')}
              className="px-3 py-1.5 text-xs font-medium bg-rose-950/50 text-rose-400 border border-rose-800/50 rounded-lg hover:bg-rose-900/50 transition"
            >
              Preset: AVS Failure
            </button>
          </div>
        </div>

        {/* Main Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Form & Card Preview */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Visual Card Preview */}
            <div className="relative h-56 w-full rounded-2xl bg-gradient-to-br from-blue-900 via-indigo-950 to-slate-900 p-6 shadow-2xl border border-slate-800 flex flex-col justify-between overflow-hidden">
              <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl -z-10" />
              
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs text-slate-400 uppercase tracking-widest">Commercial Credit</p>
                  <p className="text-lg font-bold tracking-wider text-white mt-1">
                    {cardDetails.cardholderName || 'ACME CORP TREASURY'}
                  </p>
                </div>
                <div className="text-right">
                  <span className="text-2xl font-extrabold italic text-blue-400">VISA</span>
                  <span className="block text-[10px] text-slate-400 tracking-widest uppercase">Commercial</span>
                </div>
              </div>

              <div className="space-y-4">
                {/* Chip & Contactless */}
                <div className="flex items-center justify-between">
                  <div className="w-10 h-8 bg-amber-500/20 rounded-md border border-amber-500/30 flex items-center justify-center">
                    <div className="w-6 h-5 border border-amber-500/40 rounded-sm" />
                  </div>
                  <Globe className="w-5 h-5 text-slate-500" />
                </div>

                {/* Card Number */}
                <p className="text-xl font-mono tracking-widest text-white">
                  {cardDetails.cardNumber || '4147 2000 1234 5678'}
                </p>

                {/* Expiry & CVV */}
                <div className="flex gap-6 text-xs font-mono">
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">Expires</span>
                    <span className="text-slate-200">{cardDetails.expiryDate || 'MM/YY'}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block text-[9px] uppercase">CVV</span>
                    <span className="text-slate-200">{cardDetails.cvv || '•••'}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Form */}
            <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <CreditCard className="w-5 h-5 text-blue-400" />
                Card Information
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Card Number</label>
                  <input 
                    type="text"
                    value={cardDetails.cardNumber}
                    onChange={handleCardNumberChange}
                    placeholder="4147 2000 1234 5678"
                    className={`w-full bg-slate-950 border ${errors.cardNumber ? 'border-rose-500' : 'border-slate-800'} rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition font-mono`}
                  />
                  {errors.cardNumber && <p className="text-rose-500 text-xs mt-1">{errors.cardNumber}</p>}
                </div>

                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Cardholder Name</label>
                  <input 
                    type="text"
                    value={cardDetails.cardholderName}
                    onChange={(e) => setCardDetails(prev => ({ ...prev, cardholderName: e.target.value }))}
                    placeholder="Acme Corp Treasury"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                  {errors.cardholderName && <p className="text-rose-500 text-xs mt-1">{errors.cardholderName}</p>}
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Expiry Date</label>
                    <input 
                      type="text"
                      value={cardDetails.expiryDate}
                      onChange={handleExpiryChange}
                      placeholder="MM/YY"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition font-mono"
                    />
                    {errors.expiryDate && <p className="text-rose-500 text-xs mt-1">{errors.expiryDate}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">CVV</label>
                    <input 
                      type="password"
                      value={cardDetails.cvv}
                      onChange={handleCvvChange}
                      placeholder="•••"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition font-mono"
                    />
                    {errors.cvv && <p className="text-rose-500 text-xs mt-1">{errors.cvv}</p>}
                  </div>
                </div>
              </div>

              <h2 className="text-lg font-semibold flex items-center gap-2 pt-4 border-t border-slate-800">
                <MapPin className="w-5 h-5 text-blue-400" />
                Billing Address (AVS)
              </h2>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-medium text-slate-400 mb-1">Street Address</label>
                  <input 
                    type="text"
                    value={cardDetails.address.street}
                    onChange={(e) => handleAddressChange('street', e.target.value)}
                    placeholder="100 Metro Parkway"
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                  />
                  {errors.street && <p className="text-rose-500 text-xs mt-1">{errors.street}</p>}
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <div className="col-span-2">
                    <label className="block text-xs font-medium text-slate-400 mb-1">City</label>
                    <input 
                      type="text"
                      value={cardDetails.address.city}
                      onChange={(e) => handleAddressChange('city', e.target.value)}
                      placeholder="New York"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    {errors.city && <p className="text-rose-500 text-xs mt-1">{errors.city}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">State</label>
                    <input 
                      type="text"
                      value={cardDetails.address.state}
                      onChange={(e) => handleAddressChange('state', e.target.value)}
                      placeholder="NY"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                    />
                    {errors.state && <p className="text-rose-500 text-xs mt-1">{errors.state}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">ZIP / Postal Code</label>
                    <input 
                      type="text"
                      value={cardDetails.address.zip}
                      onChange={(e) => handleAddressChange('zip', e.target.value)}
                      placeholder="10001"
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition font-mono"
                    />
                    {errors.zip && <p className="text-rose-500 text-xs mt-1">{errors.zip}</p>}
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">Country</label>
                    <select 
                      value={cardDetails.address.country}
                      onChange={(e) => handleAddressChange('country', e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-blue-500 transition"
                    >
                      <option value="US">United States</option>
                      <option value="CA">Canada</option>
                      <option value="GB">United Kingdom</option>
                    </select>
                  </div>
                </div>
              </div>

              {errors.global && (
                <div className="p-3 bg-rose-950/30 border border-rose-800/50 rounded-lg text-rose-400 text-xs flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  {errors.global}
                </div>
              )}

              <button
                onClick={checkEligibility}
                disabled={isChecking}
                className="w-full mt-4 bg-blue-600 hover:bg-blue-500 disabled:bg-slate-800 disabled:text-slate-500 text-white font-semibold py-2.5 px-4 rounded-lg transition flex items-center justify-center gap-2 shadow-lg shadow-blue-900/20"
              >
                {isChecking ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Checking Eligibility...
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    Verify VCS Eligibility
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Right Column: Results & Gemini Troubleshooting */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Checking Progress Overlay */}
            {isChecking && (
              <div className="bg-slate-900/30 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-12 h-12 text-blue-500 animate-spin" />
                <p className="text-lg font-medium text-slate-200">Visa Network Handshake</p>
                <p className="text-sm text-slate-400 animate-pulse">{checkStep}</p>
              </div>
            )}

            {/* Idle State */}
            {!isChecking && !result && (
              <div className="bg-slate-900/20 border border-dashed border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center min-h-[400px] text-center space-y-4">
                <div className="w-16 h-16 bg-slate-900 rounded-full flex items-center justify-center border border-slate-800">
                  <CreditCard className="w-8 h-8 text-slate-500" />
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-slate-300">Awaiting Card Verification</h3>
                  <p className="text-sm text-slate-500 max-w-md mt-1">
                    Enter card details or select a demo preset to run the Visa Commercial Solutions eligibility check.
                  </p>
                </div>
              </div>
            )}

            {/* Results Panel */}
            {!isChecking && result && (
              <div className="space-y-6">
                
                {/* Eligibility Status Banner */}
                <div className={`p-6 rounded-2xl border ${
                  result.eligible 
                    ? 'bg-emerald-950/30 border-emerald-800/50 text-emerald-400' 
                    : 'bg-rose-950/30 border-rose-800/50 text-rose-400'
                } flex flex-col md:flex-row items-start md:items-center justify-between gap-4`}>
                  <div className="flex items-start gap-4">
                    <div className={`p-3 rounded-xl ${
                      result.eligible ? 'bg-emerald-500/10' : 'bg-rose-500/10'
                    }`}>
                      {result.eligible ? (
                        <CheckCircle2 className="w-8 h-8" />
                      ) : (
                        <ShieldAlert className="w-8 h-8" />
                      )}
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        {result.eligible ? 'Eligible for VCS' : 'Ineligible for VCS'}
                      </h3>
                      <p className="text-sm text-slate-300 mt-1">
                        {result.eligible 
                          ? 'This card meets all Visa Commercial Solutions requirements for virtual provisioning.' 
                          : result.failureReason}
                      </p>
                    </div>
                  </div>
                  
                  {result.eligible && (
                    <span className="px-3 py-1 bg-emerald-500/20 text-emerald-300 text-xs font-semibold rounded-full uppercase tracking-wider">
                      Approved
                    </span>
                  )}
                </div>

                {/* Technical Specifications Grid */}
                <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <h3 className="text-lg font-semibold flex items-center gap-2 border-b border-slate-800 pb-3">
                    <Info className="w-5 h-5 text-blue-400" />
                    Technical Specifications
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    
                    {/* Card Metadata */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">BIN (Bank Identification Number)</span>
                        <span className="font-mono font-semibold text-slate-200">{result.bin}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Card Product</span>
                        <span className="font-semibold text-slate-200">{result.cardProduct}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Issuer</span>
                        <span className="font-semibold text-slate-200">{result.issuer}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Classification</span>
                        <span className={`font-semibold ${result.cardType === 'Commercial' ? 'text-blue-400' : 'text-amber-400'}`}>
                          {result.cardType}
                        </span>
                      </div>
                    </div>

                    {/* Capabilities */}
                    <div className="space-y-3">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Virtual Card Provisioning</span>
                        <span className={`font-semibold ${
                          result.virtualSupport === 'Supported' ? 'text-emerald-400' : 
                          result.virtualSupport === 'Restricted' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {result.virtualSupport}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Push-to-Card (Visa Direct)</span>
                        <span className="font-semibold text-slate-200">
                          {result.pushToCard ? 'Enabled' : 'Disabled'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Tokenization Support</span>
                        <span className="font-semibold text-slate-200">
                          {result.tokenization ? 'Active' : 'Inactive'}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">AVS Verification</span>
                        <span className={`font-semibold ${
                          result.avsStatus === 'Matched' ? 'text-emerald-400' : 
                          result.avsStatus === 'Partial Match' ? 'text-amber-400' : 'text-rose-400'
                        }`}>
                          {result.avsStatus}
                        </span>
                      </div>
                    </div>

                  </div>
                </div>

                {/* Gemini Troubleshooting Panel */}
                {!result.eligible && (
                  <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-6 space-y-4">
                    <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                      <h3 className="text-lg font-semibold flex items-center gap-2 text-blue-400">
                        <Sparkles className="w-5 h-5" />
                        Gemini Integration Troubleshooting
                      </h3>
                      <span className="text-xs bg-blue-950 text-blue-400 px-2 py-1 rounded border border-blue-800/50 flex items-center gap-1">
                        <Lock className="w-3 h-3" /> Secure AI Analysis
                      </span>
                    </div>

                    {isLoadingTroubleshooting ? (
                      <div className="flex flex-col items-center justify-center py-12 space-y-3">
                        <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                        <p className="text-sm text-slate-400">Generating tailored resolution steps...</p>
                      </div>
                    ) : (
                      <div className="prose prose-invert max-w-none text-sm text-slate-300 space-y-4 leading-relaxed">
                        {troubleshooting ? (
                          <div className="whitespace-pre-wrap font-sans">
                            {troubleshooting}
                          </div>
                        ) : (
                          <p className="text-slate-500 italic">No troubleshooting guide generated.</p>
                        )}
                      </div>
                    )}
                  </div>
                )}

              </div>
            )}

          </div>

        </div>

      </div>

      {/* Footer */}
      <div className="max-w-7xl mx-auto w-full border-t border-slate-900 mt-12 pt-6 flex flex-col md:flex-row justify-between items-center text-xs text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <span className="font-bold text-slate-400">VISA</span>
          <span>Commercial Solutions Portal</span>
        </div>
        <div className="flex gap-6">
          <a href="#docs" className="hover:text-slate-300 transition">VCS API Documentation</a>
          <a href="#privacy" className="hover:text-slate-300 transition">Data Privacy & Security</a>
          <a href="#support" className="hover:text-slate-300 transition">Enterprise Support</a>
        </div>
      </div>
    </div>
  );
}