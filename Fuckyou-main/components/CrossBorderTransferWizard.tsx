import React, { useState, useEffect } from 'react';
import {
  ArrowRight,
  Check,
  DollarSign,
  Globe,
  ShieldCheck,
  AlertCircle,
  Loader2,
  Download,
  Copy,
  RefreshCw,
  Send,
  User,
  Building,
  FileText,
  ArrowLeft,
  Info,
  CheckCircle2,
  ExternalLink,
  Lock
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface TransferFormData {
  senderName: string;
  senderAccount: string;
  receiverName: string;
  receiverCountry: string;
  receiverIban: string;
  receiverSwift: string;
  sourceCurrency: string;
  targetCurrency: string;
  amount: number;
  paymentMethod: 'bank' | 'instant' | 'stablecoin';
}

export interface TransferQuote {
  exchangeRate: number;
  fee: number;
  networkFee: number;
  guaranteedPayout: number;
  estimatedDelivery: string;
  rateExpiry: number; // timestamp
}

export interface TransactionReceipt {
  referenceId: string;
  timestamp: string;
  status: 'COMPLETED' | 'PENDING' | 'PROCESSING';
  blockchainTxHash?: string;
}

const CURRENCIES = [
  { code: 'USD', name: 'US Dollar', symbol: '$', flag: '🇺🇸', rate: 1.0 },
  { code: 'EUR', name: 'Euro', symbol: '€', flag: '🇪🇺', rate: 0.92 },
  { code: 'GBP', name: 'British Pound', symbol: '£', flag: '🇬🇧', rate: 0.79 },
  { code: 'JPY', name: 'Japanese Yen', symbol: '¥', flag: '🇯🇵', rate: 151.4 },
  { code: 'AUD', name: 'Australian Dollar', symbol: 'A$', flag: '🇦🇺', rate: 1.52 },
  { code: 'CAD', name: 'Canadian Dollar', symbol: 'C$', flag: '🇨🇦', rate: 1.36 },
  { code: 'SGD', name: 'Singapore Dollar', symbol: 'S$', flag: '🇸🇬', rate: 1.35 },
  { code: 'INR', name: 'Indian Rupee', symbol: '₹', flag: '🇮🇳', rate: 83.3 },
];

const COUNTRIES = [
  { code: 'US', name: 'United States' },
  { code: 'DE', name: 'Germany' },
  { code: 'GB', name: 'United Kingdom' },
  { code: 'JP', name: 'Japan' },
  { code: 'AU', name: 'Australia' },
  { code: 'CA', name: 'Canada' },
  { code: 'SG', name: 'Singapore' },
  { code: 'IN', name: 'India' },
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function CrossBorderTransferWizard() {
  const [step, setStep] = useState<1 | 2 | 3 | 4>(1);
  const [formData, setFormData] = useState<TransferFormData>({
    senderName: 'Acme Global Corp',
    senderAccount: 'US-8923-1102-9934',
    receiverName: '',
    receiverCountry: 'DE',
    receiverIban: '',
    receiverSwift: '',
    sourceCurrency: 'USD',
    targetCurrency: 'EUR',
    amount: 1000,
    paymentMethod: 'bank',
  });

  const [quote, setQuote] = useState<TransferQuote | null>(null);
  const [isCalculating, setIsCalculating] = useState(false);
  const [complianceStatus, setComplianceStatus] = useState<'idle' | 'checking' | 'passed' | 'failed'>('idle');
  const [twoFactorCode, setTwoFactorCode] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receipt, setReceipt] = useState<TransactionReceipt | null>(null);
  const [copied, setCopied] = useState(false);

  // Recalculate quote when amount or currencies change
  useEffect(() => {
    if (formData.amount > 0) {
      calculateQuote();
    }
  }, [formData.amount, formData.sourceCurrency, formData.targetCurrency, formData.paymentMethod]);

  const calculateQuote = () => {
    setIsCalculating(true);
    // Simulate API latency
    setTimeout(() => {
      const sourceRate = CURRENCIES.find(c => c.code === formData.sourceCurrency)?.rate || 1;
      const targetRate = CURRENCIES.find(c => c.code === formData.targetCurrency)?.rate || 1;
      
      // Base rate calculation
      const baseRate = targetRate / sourceRate;
      // Add a small spread (0.4%)
      const exchangeRate = baseRate * 0.996;
      
      let fee = 5.00; // flat fee
      let networkFee = 1.50;
      
      if (formData.paymentMethod === 'instant') {
        fee = 15.00;
      } else if (formData.paymentMethod === 'stablecoin') {
        fee = 2.00;
        networkFee = 0.80;
      }

      const guaranteedPayout = (formData.amount - fee - networkFee) * exchangeRate;

      setQuote({
        exchangeRate: parseFloat(exchangeRate.toFixed(6)),
        fee,
        networkFee,
        guaranteedPayout: parseFloat(guaranteedPayout.toFixed(2)),
        estimatedDelivery: formData.paymentMethod === 'instant' 
          ? 'Within 30 minutes' 
          : formData.paymentMethod === 'stablecoin' 
          ? 'Within 5 minutes' 
          : '1-2 Business Days',
        rateExpiry: Date.now() + 60000, // 1 minute expiry
      });
      setIsCalculating(false);
    }, 600);
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.receiverName || !formData.receiverIban || !formData.receiverSwift) {
      setError('Please fill in all required receiver details.');
      return;
    }
    setError(null);
    
    // Trigger compliance check simulation
    setStep(2);
    runComplianceCheck();
  };

  const runComplianceCheck = () => {
    setComplianceStatus('checking');
    setTimeout(() => {
      // 95% success rate simulation
      if (formData.amount > 500000) {
        setComplianceStatus('failed');
        setError('Transfer limit exceeded for standard compliance routing. Enhanced due diligence required.');
      } else {
        setComplianceStatus('passed');
      }
    }, 2000);
  };

  const handleConfirmTransfer = () => {
    if (twoFactorCode.length !== 6) {
      setError('Please enter a valid 6-digit security code.');
      return;
    }
    setError(null);
    setIsSubmitting(true);

    // Simulate blockchain/banking settlement
    setTimeout(() => {
      const isStablecoin = formData.paymentMethod === 'stablecoin';
      setReceipt({
        referenceId: 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase(),
        timestamp: new Date().toLocaleString(),
        status: isStablecoin ? 'COMPLETED' : 'PROCESSING',
        blockchainTxHash: isStablecoin ? '0x' + Math.random().toString(16).substring(2, 42) : undefined,
      });
      setIsSubmitting(false);
      setStep(4);
    }, 2500);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const resetWizard = () => {
    setStep(1);
    setFormData({
      senderName: 'Acme Global Corp',
      senderAccount: 'US-8923-1102-9934',
      receiverName: '',
      receiverCountry: 'DE',
      receiverIban: '',
      receiverSwift: '',
      sourceCurrency: 'USD',
      targetCurrency: 'EUR',
      amount: 1000,
      paymentMethod: 'bank',
    });
    setTwoFactorCode('');
    setReceipt(null);
    setError(null);
    setComplianceStatus('idle');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Header */}
      <header className="max-w-5xl w-full mx-auto flex justify-between items-center py-4 border-b border-slate-800/60">
        <div className="flex items-center gap-3">
          <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
            <Globe className="h-5 w-5 text-white animate-pulse" />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              AetherFlow
            </h1>
            <p className="text-xs text-slate-400">Cross-Border Settlement Engine</p>
          </div>
        </div>
        <div className="flex items-center gap-2 bg-slate-900/80 border border-slate-800 px-3 py-1.5 rounded-lg text-xs text-slate-300">
          <span className="h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
          <span>Liquidity Pools: Active</span>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="max-w-4xl w-full mx-auto my-8 flex-grow flex flex-col justify-center">
        
        {/* Stepper Progress Bar */}
        <div className="mb-8">
          <div className="flex justify-between items-center max-w-xl mx-auto relative">
            {/* Background Line */}
            <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-0.5 bg-slate-800 z-0" />
            {/* Active Progress Line */}
            <div 
              className="absolute left-0 top-1/2 -translate-y-1/2 h-0.5 bg-gradient-to-r from-indigo-500 to-violet-500 transition-all duration-500 z-0"
              style={{ width: `${((step - 1) / 3) * 100}%` }}
            />

            {[
              { label: 'Configure', icon: FileText },
              { label: 'Compliance', icon: ShieldCheck },
              { label: 'Authorize', icon: Lock },
              { label: 'Receipt', icon: CheckCircle2 }
            ].map((s, idx) => {
              const stepNum = idx + 1;
              const isActive = step === stepNum;
              const isCompleted = step > stepNum;
              const Icon = s.icon;

              return (
                <div key={s.label} className="flex flex-col items-center relative z-10">
                  <div className={`h-10 w-10 rounded-full flex items-center justify-center transition-all duration-300 border ${
                    isCompleted 
                      ? 'bg-indigo-600 border-indigo-500 text-white' 
                      : isActive 
                      ? 'bg-slate-900 border-indigo-500 text-indigo-400 shadow-lg shadow-indigo-500/10 scale-110' 
                      : 'bg-slate-950 border-slate-800 text-slate-500'
                  }`}>
                    {isCompleted ? <Check className="h-5 w-5" /> : <Icon className="h-5 w-5" />}
                  </div>
                  <span className={`text-[11px] mt-2 font-medium tracking-wide transition-colors duration-300 ${
                    isActive ? 'text-indigo-400 font-semibold' : isCompleted ? 'text-slate-300' : 'text-slate-500'
                  }`}>
                    {s.label}
                  </span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Error Alert Banner */}
        {error && (
          <div className="max-w-2xl mx-auto w-full mb-6 bg-rose-950/40 border border-rose-800/50 rounded-xl p-4 flex items-start gap-3 text-rose-200 animate-shake">
            <AlertCircle className="h-5 w-5 text-rose-400 shrink-0 mt-0.5" />
            <div className="flex-1">
              <h4 className="text-sm font-semibold">Transaction Alert</h4>
              <p className="text-xs text-rose-300/90 mt-0.5">{error}</p>
            </div>
            <button 
              onClick={() => setError(null)} 
              className="text-rose-400 hover:text-rose-300 text-xs font-medium"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Card Container */}
        <div className="max-w-2xl mx-auto w-full bg-slate-900/40 border border-slate-800/80 rounded-2xl shadow-2xl backdrop-blur-xl overflow-hidden">
          
          {/* STEP 1: FORM */}
          {step === 1 && (
            <form onSubmit={handleFormSubmit} className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Initiate Cross-Border Transfer</h2>
                <p className="text-xs text-slate-400 mt-1">Configure your global payment routing with real-time liquidity matching.</p>
              </div>

              {/* Amount & Currency Selector */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
                <div className="flex justify-between items-center">
                  <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Send Amount</label>
                  <span className="text-xs text-indigo-400 flex items-center gap-1">
                    <RefreshCw className={`h-3 w-3 ${isCalculating ? 'animate-spin' : ''}`} />
                    Live Rates
                  </span>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                  {/* Source Input */}
                  <div className="md:col-span-7 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 focus-within:border-indigo-500 transition-all">
                    <span className="text-slate-500 mr-2 font-medium">$</span>
                    <input
                      type="number"
                      value={formData.amount || ''}
                      onChange={(e) => setFormData({ ...formData, amount: parseFloat(e.target.value) || 0 })}
                      className="bg-transparent w-full text-lg font-semibold text-white focus:outline-none"
                      placeholder="0.00"
                      min="1"
                      required
                    />
                    <select
                      value={formData.sourceCurrency}
                      onChange={(e) => setFormData({ ...formData, sourceCurrency: e.target.value })}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs font-bold text-slate-200 focus:outline-none"
                    >
                      {CURRENCIES.map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code}</option>
                      ))}
                    </select>
                  </div>

                  {/* Arrow Divider */}
                  <div className="md:col-span-1 flex justify-center">
                    <ArrowRight className="h-5 w-5 text-slate-500 rotate-90 md:rotate-0" />
                  </div>

                  {/* Target Currency */}
                  <div className="md:col-span-4 flex items-center bg-slate-900 border border-slate-800 rounded-lg px-3 py-2.5">
                    <select
                      value={formData.targetCurrency}
                      onChange={(e) => setFormData({ ...formData, targetCurrency: e.target.value })}
                      className="bg-transparent w-full text-sm font-bold text-slate-200 focus:outline-none"
                    >
                      {CURRENCIES.filter(c => c.code !== formData.sourceCurrency).map(c => (
                        <option key={c.code} value={c.code}>{c.flag} {c.code} - {c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Real-time Quote Preview */}
                {quote && (
                  <div className="pt-3 border-t border-slate-800/60 flex flex-wrap justify-between items-center text-xs text-slate-400 gap-2">
                    <div>
                      Rate: <span className="text-slate-200 font-mono">1 {formData.sourceCurrency} = {quote.exchangeRate} {formData.targetCurrency}</span>
                    </div>
                    <div>
                      Est. Payout: <span className="text-emerald-400 font-bold font-mono">{quote.guaranteedPayout.toLocaleString()} {formData.targetCurrency}</span>
                    </div>
                  </div>
                )}
              </div>

              {/* Receiver Details */}
              <div className="space-y-4">
                <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider flex items-center gap-2">
                  <User className="h-4 w-4 text-indigo-400" />
                  Beneficiary Information
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Beneficiary Name</label>
                    <input
                      type="text"
                      value={formData.receiverName}
                      onChange={(e) => setFormData({ ...formData, receiverName: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="e.g. Global Logistics GmbH"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Destination Country</label>
                    <select
                      value={formData.receiverCountry}
                      onChange={(e) => setFormData({ ...formData, receiverCountry: e.target.value })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-indigo-500 transition-all"
                    >
                      {COUNTRIES.map(c => (
                        <option key={c.code} value={c.code}>{c.name}</option>
                      ))}
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">IBAN / Account Number</label>
                    <input
                      type="text"
                      value={formData.receiverIban}
                      onChange={(e) => setFormData({ ...formData, receiverIban: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="DE89 3704 0044 0532 0130 00"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      value={formData.receiverSwift}
                      onChange={(e) => setFormData({ ...formData, receiverSwift: e.target.value.toUpperCase() })}
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm font-mono text-white focus:outline-none focus:border-indigo-500 transition-all"
                      placeholder="DBEFDEBBXXX"
                      required
                    />
                  </div>
                </div>
              </div>

              {/* Settlement Method */}
              <div className="space-y-3">
                <label className="block text-xs font-bold text-slate-400 uppercase tracking-wider">Settlement Network</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                  {[
                    { id: 'bank', title: 'Standard SWIFT', desc: 'Low cost, standard delivery', speed: '1-2 Days' },
                    { id: 'instant', title: 'Aether Instant', desc: 'Real-time priority routing', speed: '30 Mins' },
                    { id: 'stablecoin', title: 'Stablecoin Rail', desc: 'USDC/EURC on-chain settlement', speed: '5 Mins' },
                  ].map((method) => (
                    <label
                      key={method.id}
                      className={`border rounded-xl p-3 flex flex-col justify-between cursor-pointer transition-all ${
                        formData.paymentMethod === method.id
                          ? 'bg-indigo-950/30 border-indigo-500/80 shadow-md shadow-indigo-500/5'
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <input
                        type="radio"
                        name="paymentMethod"
                        value={method.id}
                        checked={formData.paymentMethod === method.id}
                        onChange={() => setFormData({ ...formData, paymentMethod: method.id as any })}
                        className="sr-only"
                      />
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold text-white">{method.title}</span>
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-1.5 py-0.5 rounded font-medium">
                            {method.speed}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-400 mt-1 leading-relaxed">{method.desc}</p>
                      </div>
                    </label>
                  ))}
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                className="w-full bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2 group"
              >
                Continue to Compliance Review
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </form>
          )}

          {/* STEP 2: PREPROCESS REVIEW & COMPLIANCE */}
          {step === 2 && (
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Compliance & Pre-Route Validation</h2>
                <p className="text-xs text-slate-400 mt-1">Automated screening against global sanctions, AML, and routing validation.</p>
              </div>

              {/* Compliance Status Card */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-6 flex flex-col items-center justify-center text-center min-h-[200px]">
                {complianceStatus === 'checking' && (
                  <div className="space-y-4">
                    <Loader2 className="h-10 w-10 text-indigo-500 animate-spin mx-auto" />
                    <div>
                      <h3 className="text-sm font-semibold text-white">Running AML & Sanctions Screening</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md">
                        Checking beneficiary details against OFAC, EU Consolidated List, and PEP databases...
                      </p>
                    </div>
                    <div className="w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden mx-auto">
                      <div className="h-full bg-indigo-500 animate-infinite-loading" />
                    </div>
                  </div>
                )}

                {complianceStatus === 'passed' && (
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto">
                      <ShieldCheck className="h-6 w-6 text-emerald-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-emerald-400">Compliance Screening Passed</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md">
                        Beneficiary cleared. Routing path optimized via liquidity pool <span className="text-slate-200 font-mono">LP-EUR-09</span>.
                      </p>
                    </div>
                    <div className="inline-flex items-center gap-1.5 bg-emerald-950/40 border border-emerald-800/40 px-3 py-1 rounded-full text-[11px] text-emerald-300">
                      <span className="h-1.5 w-1.5 rounded-full bg-emerald-400" />
                      OFAC / PEP Clear
                    </div>
                  </div>
                )}

                {complianceStatus === 'failed' && (
                  <div className="space-y-4">
                    <div className="h-12 w-12 rounded-full bg-rose-500/10 border border-rose-500/30 flex items-center justify-center mx-auto">
                      <AlertCircle className="h-6 w-6 text-rose-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-semibold text-rose-400">Compliance Hold</h3>
                      <p className="text-xs text-slate-400 mt-1 max-w-md">
                        This transaction requires manual compliance review or enhanced due diligence.
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Quote Breakdown */}
              {quote && (
                <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-4 space-y-3">
                  <h3 className="text-xs font-bold text-slate-400 uppercase tracking-wider">Cost Breakdown</h3>
                  
                  <div className="space-y-2 text-xs">
                    <div className="flex justify-between">
                      <span className="text-slate-400">Transfer Amount</span>
                      <span className="text-slate-200 font-mono">{formData.amount.toLocaleString()} {formData.sourceCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Aether Network Fee</span>
                      <span className="text-slate-200 font-mono">-{quote.fee.toFixed(2)} {formData.sourceCurrency}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-400">Intermediary/Gas Fee</span>
                      <span className="text-slate-200 font-mono">-{quote.networkFee.toFixed(2)} {formData.sourceCurrency}</span>
                    </div>
                    <div className="border-t border-slate-800/60 my-2 pt-2 flex justify-between font-semibold">
                      <span className="text-slate-300">Net Exchange Rate</span>
                      <span className="text-indigo-400 font-mono">1 {formData.sourceCurrency} = {quote.exchangeRate} {formData.targetCurrency}</span>
                    </div>
                    <div className="flex justify-between text-sm font-bold border-t border-slate-800/60 pt-2">
                      <span className="text-white">Guaranteed Payout</span>
                      <span className="text-emerald-400 font-mono">{quote.guaranteedPayout.toLocaleString()} {formData.targetCurrency}</span>
                    </div>
                  </div>
                </div>
              )}

              {/* Navigation Actions */}
              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={() => setStep(1)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back to Form
                </button>
                
                <button
                  type="button"
                  disabled={complianceStatus !== 'passed'}
                  onClick={() => setStep(3)}
                  className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    complianceStatus === 'passed'
                      ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  Proceed to Authorization
                  <ArrowRight className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

          {/* STEP 3: CONFIRMATION & 2FA */}
          {step === 3 && (
            <div className="p-6 md:p-8 space-y-6">
              <div>
                <h2 className="text-xl font-bold text-white">Authorize Transaction</h2>
                <p className="text-xs text-slate-400 mt-1">Review final details and enter your security authorization code.</p>
              </div>

              {/* Summary Card */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 space-y-4">
                <div className="grid grid-cols-2 gap-4 text-xs">
                  <div>
                    <span className="text-slate-500 block">SENDER</span>
                    <span className="text-slate-200 font-semibold">{formData.senderName}</span>
                    <span className="text-slate-400 block font-mono text-[10px]">{formData.senderAccount}</span>
                  </div>
                  <div>
                    <span className="text-slate-500 block">BENEFICIARY</span>
                    <span className="text-slate-200 font-semibold">{formData.receiverName}</span>
                    <span className="text-slate-400 block font-mono text-[10px]">{formData.receiverIban}</span>
                  </div>
                </div>

                <div className="border-t border-slate-800/60 pt-3 flex justify-between items-center">
                  <div>
                    <span className="text-slate-500 text-[10px] block uppercase">Settlement Method</span>
                    <span className="text-xs font-semibold text-indigo-400 capitalize">{formData.paymentMethod} Rail</span>
                  </div>
                  <div className="text-right">
                    <span className="text-slate-500 text-[10px] block uppercase">Estimated Delivery</span>
                    <span className="text-xs font-semibold text-slate-200">{quote?.estimatedDelivery}</span>
                  </div>
                </div>
              </div>

              {/* 2FA Input */}
              <div className="bg-slate-950/40 border border-slate-800/60 rounded-xl p-6 space-y-4 text-center">
                <div className="h-10 w-10 rounded-full bg-indigo-500/10 border border-indigo-500/30 flex items-center justify-center mx-auto">
                  <Lock className="h-5 w-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-white">Enter 2FA Security Code</h3>
                  <p className="text-xs text-slate-400 mt-1">
                    Enter the 6-digit code from your authenticator app to authorize this transfer.
                  </p>
                </div>

                <div className="max-w-[200px] mx-auto">
                  <input
                    type="text"
                    maxLength={6}
                    value={twoFactorCode}
                    onChange={(e) => setTwoFactorCode(e.target.value.replace(/\D/g, ''))}
                    className="w-full bg-slate-900 border border-slate-800 rounded-lg py-2.5 text-center text-xl font-bold tracking-[0.5em] text-white focus:outline-none focus:border-indigo-500 transition-all"
                    placeholder="000000"
                  />
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3">
                <button
                  type="button"
                  disabled={isSubmitting}
                  onClick={() => setStep(2)}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <ArrowLeft className="h-4 w-4" />
                  Back
                </button>

                <button
                  type="button"
                  disabled={isSubmitting || twoFactorCode.length !== 6}
                  onClick={handleConfirmTransfer}
                  className={`flex-1 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2 ${
                    twoFactorCode.length === 6 && !isSubmitting
                      ? 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-500/20'
                      : 'bg-slate-800 text-slate-500 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Executing Settlement...
                    </>
                  ) : (
                    <>
                      <Send className="h-4 w-4" />
                      Authorize & Send
                    </>
                  )}
                </button>
              </div>
            </div>
          )}

          {/* STEP 4: RECEIPT */}
          {step === 4 && receipt && (
            <div className="p-6 md:p-8 space-y-6">
              {/* Success Header */}
              <div className="text-center space-y-3">
                <div className="h-14 w-14 rounded-full bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center mx-auto animate-bounce">
                  <Check className="h-8 w-8 text-emerald-400" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-white">Transfer Successfully Initiated</h2>
                  <p className="text-xs text-slate-400 mt-1">
                    Your transaction is being processed on the {formData.paymentMethod === 'stablecoin' ? 'blockchain' : 'global banking'} network.
                  </p>
                </div>
              </div>

              {/* Receipt Details Card */}
              <div className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-5 space-y-4">
                <div className="flex justify-between items-center border-b border-slate-800/60 pb-3">
                  <div>
                    <span className="text-[10px] text-slate-500 block">TRANSACTION REFERENCE</span>
                    <span className="text-xs font-mono font-bold text-slate-200 flex items-center gap-1.5">
                      {receipt.referenceId}
                      <button 
                        onClick={() => copyToClipboard(receipt.referenceId)} 
                        className="text-slate-500 hover:text-slate-300"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">STATUS</span>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      receipt.status === 'COMPLETED' 
                        ? 'bg-emerald-950/50 text-emerald-400 border border-emerald-800/40' 
                        : 'bg-amber-950/50 text-amber-400 border border-amber-800/40'
                    }`}>
                      {receipt.status}
                    </span>
                  </div>
                </div>

                {/* Transfer Amount Summary */}
                <div className="grid grid-cols-2 gap-4 py-2">
                  <div>
                    <span className="text-[10px] text-slate-500 block">SENT AMOUNT</span>
                    <span className="text-sm font-bold text-white font-mono">
                      {formData.amount.toLocaleString()} {formData.sourceCurrency}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] text-slate-500 block">ESTIMATED PAYOUT</span>
                    <span className="text-sm font-bold text-emerald-400 font-mono">
                      {quote?.guaranteedPayout.toLocaleString()} {formData.targetCurrency}
                    </span>
                  </div>
                </div>

                {/* Blockchain Tx Hash (if applicable) */}
                {receipt.blockchainTxHash && (
                  <div className="border-t border-slate-800/60 pt-3">
                    <span className="text-[10px] text-slate-500 block">BLOCKCHAIN TRANSACTION HASH</span>
                    <span className="text-[11px] font-mono text-indigo-400 flex items-center gap-1.5 break-all mt-0.5">
                      {receipt.blockchainTxHash}
                      <button 
                        onClick={() => copyToClipboard(receipt.blockchainTxHash || '')} 
                        className="text-slate-500 hover:text-slate-300 shrink-0"
                      >
                        <Copy className="h-3.5 w-3.5" />
                      </button>
                    </span>
                  </div>
                )}

                {/* Timeline Tracker */}
                <div className="border-t border-slate-800/60 pt-4 space-y-3">
                  <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Settlement Timeline</span>
                  <div className="space-y-3">
                    {[
                      { label: 'Transaction Authorized', desc: 'Funds locked in escrow pool', done: true },
                      { label: 'Compliance Clearance', desc: 'Sanctions & AML checks passed', done: true },
                      { label: 'Liquidity Settlement', desc: formData.paymentMethod === 'stablecoin' ? 'On-chain atomic swap completed' : 'SWIFT routing initiated', done: formData.paymentMethod === 'stablecoin' },
                      { label: 'Beneficiary Credited', desc: `Estimated delivery: ${quote?.estimatedDelivery}`, done: false },
                    ].map((step, idx) => (
                      <div key={idx} className="flex gap-3 items-start">
                        <div className={`h-4 w-4 rounded-full flex items-center justify-center shrink-0 mt-0.5 ${
                          step.done ? 'bg-emerald-500/20 text-emerald-400' : 'bg-slate-800 text-slate-600'
                        }`}>
                          <Check className="h-2.5 w-2.5" />
                        </div>
                        <div>
                          <h4 className={`text-xs font-semibold ${step.done ? 'text-slate-200' : 'text-slate-500'}`}>{step.label}</h4>
                          <p className="text-[10px] text-slate-400">{step.desc}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 bg-slate-950 border border-slate-800 hover:bg-slate-900 text-slate-300 font-semibold py-3 px-4 rounded-xl transition-all flex items-center justify-center gap-2"
                >
                  <Download className="h-4 w-4" />
                  Download Receipt PDF
                </button>

                <button
                  type="button"
                  onClick={resetWizard}
                  className="flex-1 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-semibold py-3 px-4 rounded-xl shadow-lg shadow-indigo-500/20 transition-all flex items-center justify-center gap-2"
                >
                  Initiate Another Transfer
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          )}

        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-5xl w-full mx-auto py-6 border-t border-slate-800/60 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <ShieldCheck className="h-4 w-4 text-indigo-500" />
          <span>Secured by Aether Shield Cryptographic Protocol</span>
        </div>
        <div className="flex gap-4">
          <a href="#" className="hover:text-slate-300 transition-colors">Liquidity Pools</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Developer API</a>
          <a href="#" className="hover:text-slate-300 transition-colors">Compliance Framework</a>
        </div>
      </footer>
    </div>
  );
}