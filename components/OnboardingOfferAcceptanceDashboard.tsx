import React, { useState, useMemo } from 'react';
import { 
  Check, 
  X, 
  Info, 
  ArrowRight, 
  Sliders, 
  ShieldCheck, 
  FileText, 
  RefreshCw, 
  ChevronRight, 
  Sparkles, 
  TrendingUp, 
  Layers, 
  Send,
  HelpCircle,
  AlertCircle,
  CheckCircle2,
  Lock,
  Globe,
  Briefcase,
  CreditCard,
  Coins
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export type CurrencyCode = 'EUR' | 'GBP' | 'CHF';

export interface OfferProduct {
  id: string;
  type: 'primary' | 'counter' | 'cross-sell';
  category: 'loan' | 'revolving' | 'card' | 'treasury';
  title: string;
  description: string;
  baseAmount: number;
  minAmount?: number;
  maxAmount?: number;
  baseRate: number; // APR
  termMonths: number;
  minTerm?: number;
  maxTerm?: number;
  benefits: string[];
  fees: {
    origination: number;
    maintenance: number;
  };
}

export interface ApplicantProfile {
  id: string;
  companyName: string;
  jurisdiction: string;
  riskRating: 'Low' | 'Medium' | 'High';
  requestedAmount: number;
  preferredCurrency: CurrencyCode;
}

// ==========================================
// MOCK DATA
// ==========================================

const CURRENCY_SYMBOLS: Record<CurrencyCode, string> = {
  EUR: '€',
  GBP: '£',
  CHF: 'CHF'
};

const INITIAL_APPLICANT: ApplicantProfile = {
  id: "APP-EMEA-2024-9082",
  companyName: "Vanguard Logistics GmbH",
  jurisdiction: "Germany (DE)",
  riskRating: "Medium",
  requestedAmount: 250000,
  preferredCurrency: "EUR"
};

const INITIAL_OFFERS: OfferProduct[] = [
  {
    id: "off-primary-01",
    type: "primary",
    category: "loan",
    title: "Standard Term Loan",
    description: "Our standard amortizing term loan tailored for European mid-market expansion.",
    baseAmount: 200000,
    baseRate: 4.25,
    termMonths: 36,
    benefits: [
      "No early repayment penalties",
      "Fixed monthly installments",
      "Eligible for KfW ESG subsidy alignment"
    ],
    fees: {
      origination: 1500,
      maintenance: 50
    }
  },
  {
    id: "off-counter-02",
    type: "counter",
    category: "loan",
    title: "Optimized Counter-Offer",
    description: "A structured alternative offering a higher principal with a slightly adjusted variable rate.",
    baseAmount: 250000,
    minAmount: 150000,
    maxAmount: 300000,
    baseRate: 4.85,
    termMonths: 48,
    minTerm: 24,
    maxTerm: 60,
    benefits: [
      "Higher capital allocation matching your initial request",
      "Flexible amortization holiday for the first 3 months",
      "Interest-only option available for initial quarter"
    ],
    fees: {
      origination: 2000,
      maintenance: 75
    }
  },
  {
    id: "off-cross-card",
    type: "cross-sell",
    category: "card",
    title: "Corporate Platinum Visa",
    description: "Multi-currency corporate card with integrated expense management and high limits.",
    baseAmount: 25000,
    baseRate: 12.99,
    termMonths: 12,
    benefits: [
      "1.5% cashback on all EUR/GBP business transactions",
      "Zero FX markup fees across EEA jurisdictions",
      "Unlimited virtual cards for team members"
    ],
    fees: {
      origination: 0,
      maintenance: 25
    }
  },
  {
    id: "off-cross-treasury",
    type: "cross-sell",
    category: "treasury",
    title: "Smart Liquidity Buffer",
    description: "Pre-approved revolving credit line linked to your primary operating account.",
    baseAmount: 50000,
    baseRate: 5.50,
    termMonths: 24,
    benefits: [
      "Only pay interest on drawn funds",
      "Instant activation upon primary loan disbursement",
      "Automated sweep functionality to prevent overdrafts"
    ],
    fees: {
      origination: 500,
      maintenance: 15
    }
  }
];

export default function OnboardingOfferAcceptanceDashboard() {
  // State Management
  const [applicant] = useState<ApplicantProfile>(INITIAL_APPLICANT);
  const [offers, setOffers] = useState<OfferProduct[]>(INITIAL_OFFERS);
  const [selectedOfferIds, setSelectedOfferIds] = useState<string[]>(["off-primary-01"]);
  const [currency, setCurrency] = useState<CurrencyCode>("EUR");
  
  // Counter-offer customizers
  const counterOffer = offers.find(o => o.type === 'counter')!;
  const [counterAmount, setCounterAmount] = useState<number>(counterOffer.baseAmount);
  const [counterTerm, setCounterTerm] = useState<number>(counterOffer.termMonths);

  // UI States
  const [activeTab, setActiveTab] = useState<'compare' | 'api-payload' | 'compliance'>('compare');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);
  const [apiLogs, setApiLogs] = useState<string[]>([]);
  const [gdprConsent, setGdprConsent] = useState<boolean>(false);
  const [termsAccepted, setTermsAccepted] = useState<boolean>(false);

  // Currency conversion helper (simulated)
  const currencyMultiplier = useMemo(() => {
    switch (currency) {
      case 'GBP': return 0.86;
      case 'CHF': return 0.95;
      default: return 1.0;
    }
  }, [currency]);

  const formatCurrency = (amount: number) => {
    const converted = amount * currencyMultiplier;
    return new Intl.NumberFormat('de-DE', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(converted);
  };

  // Toggle offer selection
  const handleToggleOffer = (id: string) => {
    const targetOffer = offers.find(o => o.id === id);
    if (!targetOffer) return;

    setSelectedOfferIds(prev => {
      // If selecting primary, deselect counter-offer (and vice versa)
      if (targetOffer.type === 'primary') {
        return [...prev.filter(item => item !== 'off-counter-02'), id];
      }
      if (targetOffer.type === 'counter') {
        return [...prev.filter(item => item !== 'off-primary-01'), id];
      }
      // For cross-sells, toggle normally
      if (prev.includes(id)) {
        return prev.filter(item => item !== id);
      } else {
        return [...prev, id];
      }
    });

    logAction(`Toggled product selection: ${targetOffer.title} (${id})`);
  };

  const logAction = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setApiLogs(prev => [`[${timestamp}] ${message}`, ...prev.slice(0, 15)]);
  };

  // Calculate monthly payments
  const calculateMonthlyPayment = (amount: number, annualRate: number, termMonths: number) => {
    const monthlyRate = (annualRate / 100) / 12;
    if (monthlyRate === 0) return amount / termMonths;
    return (amount * monthlyRate * Math.pow(1 + monthlyRate, termMonths)) / (Math.pow(1 + monthlyRate, termMonths) - 1);
  };

  // Dynamic API Payload Generation
  const apiPayload = useMemo(() => {
    const selectedProductsPayload = selectedOfferIds.map(id => {
      const offer = offers.find(o => o.id === id)!;
      const isCounter = offer.type === 'counter';
      const finalAmount = isCounter ? counterAmount : offer.baseAmount;
      const finalTerm = isCounter ? counterTerm : offer.termMonths;
      
      return {
        productId: offer.id,
        productType: offer.type,
        category: offer.category,
        requestedCurrency: currency,
        configuredAmount: Math.round(finalAmount * currencyMultiplier),
        configuredTermMonths: finalTerm,
        appliedApr: offer.baseRate,
        fees: {
          originationFee: Math.round(offer.fees.origination * currencyMultiplier),
          monthlyMaintenanceFee: Math.round(offer.fees.maintenance * currencyMultiplier)
        }
      };
    });

    return {
      meta: {
        apiVersion: "v2.4-emea",
        timestamp: new Date().toISOString(),
        originatingJurisdiction: applicant.jurisdiction,
        complianceFramework: "GDPR-MIFID-II"
      },
      applicant: {
        id: applicant.id,
        companyName: applicant.companyName,
        riskRating: applicant.riskRating
      },
      selections: {
        totalSelectedProducts: selectedProductsPayload.length,
        products: selectedProductsPayload,
        aggregateExposure: selectedProductsPayload.reduce((sum, p) => sum + p.configuredAmount, 0)
      },
      consents: {
        gdprCompliant: gdprConsent,
        termsAndConditionsAccepted: termsAccepted,
        ipAddress: "193.168.1.42"
      }
    };
  }, [selectedOfferIds, offers, counterAmount, counterTerm, currency, currencyMultiplier, gdprConsent, termsAccepted, applicant]);

  // Handle Submit
  const handleSubmitAcceptance = async () => {
    if (!gdprConsent || !termsAccepted) {
      alert("Please accept the GDPR consent and Terms & Conditions to proceed.");
      return;
    }

    setIsSubmitting(true);
    logAction("Initiating secure handshake with EMEA credit decisioning engine...");
    
    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsSubmitting(false);
    setIsSubmitted(true);
    logAction("Success: Offer acceptance payload successfully ingested. Reference ID: TXN-EMEA-88291-A");
  };

  const resetForm = () => {
    setSelectedOfferIds(["off-primary-01"]);
    setCounterAmount(counterOffer.baseAmount);
    setCounterTerm(counterOffer.termMonths);
    setGdprConsent(false);
    setTermsAccepted(false);
    setIsSubmitted(false);
    logAction("Dashboard state reset to default primary offer.");
  };

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* Top Navigation / Header */}
      <header className="border-b border-slate-800 bg-slate-950/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 text-xs font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full flex items-center gap-1">
                <Globe className="w-3 h-3" /> EMEA Region
              </span>
              <span className="text-xs text-slate-500">•</span>
              <span className="text-xs text-slate-400 font-mono">ID: {applicant.id}</span>
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-white mt-1">
              Offer Acceptance Hub
            </h1>
            <p className="text-sm text-slate-400">
              Review, customize, and accept structured credit facilities for <span className="text-slate-200 font-semibold">{applicant.companyName}</span>
            </p>
          </div>

          {/* Currency Selector & Quick Stats */}
          <div className="flex flex-wrap items-center gap-3">
            <div className="bg-slate-900 border border-slate-800 rounded-lg p-1 flex gap-1">
              {(['EUR', 'GBP', 'CHF'] as CurrencyCode[]).map((cur) => (
                <button
                  key={cur}
                  onClick={() => {
                    setCurrency(cur);
                    logAction(`Switched display currency to ${cur}`);
                  }}
                  className={`px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                    currency === cur 
                      ? 'bg-indigo-600 text-white shadow-md' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {cur}
                </button>
              ))}
            </div>

            <div className="bg-slate-950 border border-slate-800 rounded-lg px-4 py-2 text-right hidden sm:block">
              <span className="text-[10px] text-slate-500 block uppercase tracking-wider font-semibold">Requested Capital</span>
              <span className="text-sm font-bold text-emerald-400">{formatCurrency(applicant.requestedAmount)}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* GDPR & Regulatory Banner */}
        <div className="mb-8 bg-gradient-to-r from-indigo-950/40 to-slate-900 border border-indigo-500/20 rounded-xl p-4 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
          <div className="flex items-start gap-3">
            <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 shrink-0 mt-0.5">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <h4 className="text-sm font-semibold text-slate-200">EU Regulatory Compliance Framework</h4>
              <p className="text-xs text-slate-400 mt-0.5">
                This offer is governed under MiFID II and GDPR regulations. All calculations are transparent, and your data is processed securely within the EEA.
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2 text-xs text-indigo-300 bg-indigo-500/10 px-3 py-1.5 rounded-lg border border-indigo-500/20">
            <Lock className="w-3.5 h-3.5" /> GDPR Compliant
          </div>
        </div>

        {/* Grid Container */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: Offer Selection & Customization (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-bold text-white flex items-center gap-2">
                <Layers className="w-5 h-5 text-indigo-400" /> Available Credit Facilities
              </h2>
              <span className="text-xs text-slate-400">Select one primary/counter offer + optional cross-sells</span>
            </div>

            {/* 1. Primary Offer Card */}
            {offers.filter(o => o.type === 'primary').map(offer => {
              const isSelected = selectedOfferIds.includes(offer.id);
              const monthlyPayment = calculateMonthlyPayment(offer.baseAmount, offer.baseRate, offer.termMonths);
              return (
                <div 
                  key={offer.id}
                  onClick={() => handleToggleOffer(offer.id)}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-300 cursor-pointer ${
                    isSelected 
                      ? 'bg-slate-950 border-indigo-500 shadow-lg shadow-indigo-500/10 ring-1 ring-indigo-500' 
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                  }`}
                >
                  {/* Selected Badge */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg flex items-center gap-1">
                      <Check className="w-3 h-3" /> Selected Primary
                    </div>
                  )}

                  <div className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div>
                        <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-indigo-500/10 text-indigo-400 rounded border border-indigo-500/20">
                          Recommended Base Offer
                        </span>
                        <h3 className="text-lg font-bold text-white mt-2">{offer.title}</h3>
                        <p className="text-xs text-slate-400 mt-1 max-w-md">{offer.description}</p>
                      </div>
                    </div>

                    {/* Key Metrics */}
                    <div className="grid grid-cols-3 gap-4 py-4 my-4 border-y border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Facility Limit</span>
                        <span className="text-lg font-bold text-white">{formatCurrency(offer.baseAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Interest Rate</span>
                        <span className="text-lg font-bold text-emerald-400">{offer.baseRate}% <span className="text-xs text-slate-500">APR</span></span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Term Duration</span>
                        <span className="text-lg font-bold text-white">{offer.termMonths} <span className="text-xs text-slate-500">Months</span></span>
                      </div>
                    </div>

                    {/* Benefits & Monthly Payment */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                      <ul className="space-y-1.5">
                        {offer.benefits.map((b, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" /> {b}
                          </li>
                        ))}
                      </ul>
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-right shrink-0 w-full md:w-auto">
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Est. Monthly Payment</span>
                        <span className="text-base font-bold text-white">{formatCurrency(monthlyPayment)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 2. Counter-Offer Card (With Interactive Sliders) */}
            {offers.filter(o => o.type === 'counter').map(offer => {
              const isSelected = selectedOfferIds.includes(offer.id);
              const monthlyPayment = calculateMonthlyPayment(counterAmount, offer.baseRate, counterTerm);
              return (
                <div 
                  key={offer.id}
                  className={`relative overflow-hidden rounded-xl border transition-all duration-300 ${
                    isSelected 
                      ? 'bg-slate-950 border-amber-500 shadow-lg shadow-amber-500/5 ring-1 ring-amber-500' 
                      : 'bg-slate-950/50 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {/* Selection Overlay Trigger */}
                  <div 
                    onClick={() => handleToggleOffer(offer.id)}
                    className="absolute top-0 left-0 right-0 h-14 cursor-pointer z-10 flex items-center justify-between px-6"
                  >
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider bg-amber-500/10 text-amber-400 rounded border border-amber-500/20">
                        Counter-Offer Option
                      </span>
                    </div>
                    {isSelected ? (
                      <span className="bg-amber-600 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1 rounded-bl-lg absolute top-0 right-0 flex items-center gap-1">
                        <Check className="w-3 h-3" /> Selected Counter
                      </span>
                    ) : (
                      <span className="text-xs text-amber-400 hover:text-amber-300 font-semibold flex items-center gap-1">
                        Switch to Counter-Offer <ChevronRight className="w-4 h-4" />
                      </span>
                    )}
                  </div>

                  <div className="p-6 pt-14">
                    <div className="mb-4">
                      <h3 className="text-lg font-bold text-white">{offer.title}</h3>
                      <p className="text-xs text-slate-400 mt-1">{offer.description}</p>
                    </div>

                    {/* Interactive Sliders (Enabled only if selected) */}
                    <div className={`p-4 rounded-lg border transition-all ${
                      isSelected ? 'bg-slate-900/60 border-slate-800' : 'bg-slate-900/20 border-slate-800/40 opacity-60 pointer-events-none'
                    }`}>
                      <div className="flex items-center gap-2 mb-4 text-xs font-semibold text-amber-400">
                        <Sliders className="w-4 h-4" /> Customize Counter-Offer Parameters
                      </div>

                      {/* Slider 1: Amount */}
                      <div className="space-y-2 mb-4">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Adjust Capital Amount</span>
                          <span className="font-bold text-white">{formatCurrency(counterAmount)}</span>
                        </div>
                        <input 
                          type="range" 
                          min={offer.minAmount} 
                          max={offer.maxAmount} 
                          step={10000}
                          value={counterAmount}
                          onChange={(e) => {
                            setCounterAmount(Number(e.target.value));
                            logAction(`Adjusted counter-offer amount to ${formatCurrency(Number(e.target.value))}`);
                          }}
                          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Min: {formatCurrency(offer.minAmount || 0)}</span>
                          <span>Max: {formatCurrency(offer.maxAmount || 0)}</span>
                        </div>
                      </div>

                      {/* Slider 2: Term */}
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span className="text-slate-400">Adjust Term Duration</span>
                          <span className="font-bold text-white">{counterTerm} Months</span>
                        </div>
                        <input 
                          type="range" 
                          min={offer.minTerm} 
                          max={offer.maxTerm} 
                          step={6}
                          value={counterTerm}
                          onChange={(e) => {
                            setCounterTerm(Number(e.target.value));
                            logAction(`Adjusted counter-offer term to ${e.target.value} months`);
                          }}
                          className="w-full accent-amber-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                        />
                        <div className="flex justify-between text-[10px] text-slate-500">
                          <span>Min: {offer.minTerm} Months</span>
                          <span>Max: {offer.maxTerm} Months</span>
                        </div>
                      </div>
                    </div>

                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-3 gap-4 py-4 my-4 border-y border-slate-800/60">
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Configured Limit</span>
                        <span className="text-base font-bold text-white">{formatCurrency(counterAmount)}</span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Interest Rate</span>
                        <span className="text-base font-bold text-amber-400">{offer.baseRate}% <span className="text-xs text-slate-500">APR</span></span>
                      </div>
                      <div>
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Configured Term</span>
                        <span className="text-base font-bold text-white">{counterTerm} <span className="text-xs text-slate-500">Months</span></span>
                      </div>
                    </div>

                    {/* Benefits & Monthly Payment */}
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 pt-2">
                      <ul className="space-y-1.5">
                        {offer.benefits.map((b, idx) => (
                          <li key={idx} className="text-xs text-slate-300 flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" /> {b}
                          </li>
                        ))}
                      </ul>
                      <div className="bg-slate-900/80 border border-slate-800 rounded-lg p-3 text-right shrink-0 w-full md:w-auto">
                        <span className="text-[10px] text-slate-500 block uppercase tracking-wider">Est. Monthly Payment</span>
                        <span className="text-base font-bold text-white">{formatCurrency(monthlyPayment)}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}

            {/* 3. Cross-Sell Suggestions */}
            <div className="space-y-4">
              <h3 className="text-sm font-bold text-slate-300 uppercase tracking-wider flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Recommended Cross-Sells & Add-ons
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {offers.filter(o => o.type === 'cross-sell').map(offer => {
                  const isSelected = selectedOfferIds.includes(offer.id);
                  return (
                    <div 
                      key={offer.id}
                      onClick={() => handleToggleOffer(offer.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between ${
                        isSelected 
                          ? 'bg-slate-950 border-emerald-500 shadow-md shadow-emerald-500/5 ring-1 ring-emerald-500' 
                          : 'bg-slate-950/40 border-slate-800 hover:border-slate-700 hover:bg-slate-950'
                      }`}
                    >
                      <div>
                        <div className="flex justify-between items-start">
                          <span className="p-1.5 bg-slate-900 rounded-lg text-slate-400">
                            {offer.category === 'card' ? <CreditCard className="w-4 h-4" /> : <Coins className="w-4 h-4" />}
                          </span>
                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center transition-all ${
                            isSelected ? 'bg-emerald-500 border-emerald-500 text-slate-950' : 'border-slate-700'
                          }`}>
                            {isSelected && <Check className="w-3.5 h-3.5 stroke-[3]" />}
                          </div>
                        </div>

                        <h4 className="text-sm font-bold text-white mt-3">{offer.title}</h4>
                        <p className="text-xs text-slate-400 mt-1 line-clamp-2">{offer.description}</p>
                      </div>

                      <div className="mt-4 pt-3 border-t border-slate-800/60 flex justify-between items-center">
                        <div>
                          <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Limit / Value</span>
                          <span className="text-xs font-bold text-white">{formatCurrency(offer.baseAmount)}</span>
                        </div>
                        <div className="text-right">
                          <span className="text-[9px] text-slate-500 block uppercase tracking-wider">Rate / Fee</span>
                          <span className="text-xs font-bold text-emerald-400">
                            {offer.category === 'card' ? `${offer.baseRate}% APR` : '0.8% Fee'}
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

          </div>

          {/* RIGHT COLUMN: Comparison, API Builder & Acceptance (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Tab Navigation for Right Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-1 flex">
              <button
                onClick={() => setActiveTab('compare')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'compare' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3.5 h-3.5" /> Summary & Compare
              </button>
              <button
                onClick={() => setActiveTab('api-payload')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'api-payload' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Send className="w-3.5 h-3.5" /> API Request Builder
              </button>
              <button
                onClick={() => setActiveTab('compliance')}
                className={`flex-1 py-2.5 text-xs font-semibold rounded-lg transition-all flex items-center justify-center gap-2 ${
                  activeTab === 'compliance' ? 'bg-slate-900 text-white border border-slate-800' : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> Legal & Terms
              </button>
            </div>

            {/* TAB CONTENT: Summary & Compare */}
            {activeTab === 'compare' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-6">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">Selected Facility Summary</h3>
                
                {/* Selected Products List */}
                <div className="space-y-3">
                  {selectedOfferIds.map(id => {
                    const offer = offers.find(o => o.id === id)!;
                    const isCounter = offer.type === 'counter';
                    const amount = isCounter ? counterAmount : offer.baseAmount;
                    const term = isCounter ? counterTerm : offer.termMonths;
                    return (
                      <div key={id} className="flex items-center justify-between p-3 bg-slate-900/60 border border-slate-800 rounded-lg">
                        <div className="flex items-center gap-2.5">
                          <span className={`w-2 h-2 rounded-full ${
                            offer.type === 'primary' ? 'bg-indigo-500' : offer.type === 'counter' ? 'bg-amber-500' : 'bg-emerald-500'
                          }`} />
                          <div>
                            <h4 className="text-xs font-bold text-white">{offer.title}</h4>
                            <span className="text-[10px] text-slate-500">{term} Months @ {offer.baseRate}% APR</span>
                          </div>
                        </div>
                        <span className="text-xs font-bold text-white">{formatCurrency(amount)}</span>
                      </div>
                    );
                  })}
                </div>

                {/* Aggregate Calculations */}
                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Combined Capital</span>
                    <span className="font-bold text-white">
                      {formatCurrency(
                        selectedOfferIds.reduce((sum, id) => {
                          const offer = offers.find(o => o.id === id)!;
                          return sum + (offer.type === 'counter' ? counterAmount : offer.baseAmount);
                        }, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Total Origination Fees</span>
                    <span className="font-bold text-white">
                      {formatCurrency(
                        selectedOfferIds.reduce((sum, id) => {
                          const offer = offers.find(o => o.id === id)!;
                          return sum + offer.fees.origination;
                        }, 0)
                      )}
                    </span>
                  </div>

                  <div className="flex justify-between text-xs">
                    <span className="text-slate-400">Monthly Maintenance Fees</span>
                    <span className="font-bold text-white">
                      {formatCurrency(
                        selectedOfferIds.reduce((sum, id) => {
                          const offer = offers.find(o => o.id === id)!;
                          return sum + offer.fees.maintenance;
                        }, 0)
                      )}
                    </span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center">
                    <div>
                      <span className="text-xs font-bold text-white block">Combined Monthly Payment</span>
                      <span className="text-[10px] text-slate-500">Estimated amortized total</span>
                    </div>
                    <span className="text-lg font-extrabold text-emerald-400">
                      {formatCurrency(
                        selectedOfferIds.reduce((sum, id) => {
                          const offer = offers.find(o => o.id === id)!;
                          const amount = offer.type === 'counter' ? counterAmount : offer.baseAmount;
                          const term = offer.type === 'counter' ? counterTerm : offer.termMonths;
                          return sum + calculateMonthlyPayment(amount, offer.baseRate, term);
                        }, 0)
                      )}
                    </span>
                  </div>
                </div>

                {/* Quick Comparison Matrix */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-4 space-y-3">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Comparison Matrix</span>
                  <div className="grid grid-cols-3 gap-2 text-center text-[10px] text-slate-400 border-b border-slate-800 pb-2">
                    <span className="text-left">Metric</span>
                    <span>Primary Offer</span>
                    <span>Counter-Offer</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <span className="text-left text-slate-400">Max Capital</span>
                    <span className="text-white font-semibold">{formatCurrency(200000)}</span>
                    <span className="text-amber-400 font-semibold">{formatCurrency(300000)}</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <span className="text-left text-slate-400">APR</span>
                    <span className="text-white font-semibold">4.25%</span>
                    <span className="text-amber-400 font-semibold">4.85%</span>
                  </div>
                  <div className="grid grid-cols-3 gap-2 text-center text-xs">
                    <span className="text-left text-slate-400">Max Term</span>
                    <span className="text-white font-semibold">36 Mo</span>
                    <span className="text-amber-400 font-semibold">60 Mo</span>
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: API Request Builder */}
            {activeTab === 'api-payload' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-bold text-white uppercase tracking-wider">API Request Builder</h3>
                    <p className="text-[10px] text-slate-500">Real-time payload generation for the EMEA decisioning engine</p>
                  </div>
                  <span className="px-2 py-0.5 text-[9px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded">
                    POST /v2/offers/accept
                  </span>
                </div>

                {/* JSON Payload Preview */}
                <div className="relative">
                  <pre className="bg-slate-900 text-slate-300 text-[11px] font-mono p-4 rounded-lg overflow-x-auto max-h-80 border border-slate-800/80 scrollbar-thin scrollbar-thumb-slate-800">
                    {JSON.stringify(apiPayload, null, 2)}
                  </pre>
                  <div className="absolute top-2 right-2 flex gap-1">
                    <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <span className="text-[9px] text-slate-500 font-mono">LIVE</span>
                  </div>
                </div>

                {/* API Logs */}
                <div className="space-y-2">
                  <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">Handshake Logs</span>
                  <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-3 h-24 overflow-y-auto font-mono text-[10px] text-slate-400 space-y-1">
                    {apiLogs.length === 0 ? (
                      <span className="text-slate-600 italic">No actions logged yet. Toggle products or adjust sliders to trigger events.</span>
                    ) : (
                      apiLogs.map((log, idx) => (
                        <div key={idx} className="truncate">{log}</div>
                      ))
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: Legal & Terms */}
            {activeTab === 'compliance' && (
              <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
                <h3 className="text-sm font-bold text-white uppercase tracking-wider">EMEA Legal Framework & Disclosures</h3>
                
                <div className="space-y-3 text-xs text-slate-400 max-h-64 overflow-y-auto pr-2 space-y-3">
                  <p>
                    <strong>1. Credit Facility Agreement:</strong> By accepting any of the structured credit facilities presented in this dashboard, you authorize Vanguard Logistics GmbH to initiate formal underwriting verification.
                  </p>
                  <p>
                    <strong>2. Interest Rates & Fees:</strong> Annual Percentage Rates (APR) are calculated based on current Euribor/Saron benchmarks. Origination fees are capitalized or deducted from the initial disbursement.
                  </p>
                  <p>
                    <strong>3. GDPR Compliance:</strong> Your data is processed in accordance with the General Data Protection Regulation (GDPR) (EU) 2016/679. You retain the right to access, rectify, or erase your personal data prior to final contract execution.
                  </p>
                  <p>
                    <strong>4. Cross-Border Disclosures:</strong> For facilities denominated in GBP or CHF, exchange rate fluctuations may impact the total repayment obligation in your local operating currency.
                  </p>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    <span className="text-xs text-slate-300 font-semibold">MiFID II Investor Protection Active</span>
                  </div>
                </div>
              </div>
            )}

            {/* Acceptance & Submission Panel */}
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-6 space-y-4">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider">Confirm & Accept Offer</h3>

              {/* Consent Checkboxes */}
              <div className="space-y-3">
                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={gdprConsent}
                    onChange={(e) => {
                      setGdprConsent(e.target.checked);
                      logAction(`GDPR Consent toggled: ${e.target.checked}`);
                    }}
                    className="mt-1 accent-indigo-600 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    I consent to the processing of my corporate credit data under the GDPR framework for EMEA credit decisioning.
                  </span>
                </label>

                <label className="flex items-start gap-3 cursor-pointer group">
                  <input 
                    type="checkbox" 
                    checked={termsAccepted}
                    onChange={(e) => {
                      setTermsAccepted(e.target.checked);
                      logAction(`Terms Acceptance toggled: ${e.target.checked}`);
                    }}
                    className="mt-1 accent-indigo-600 rounded border-slate-800 bg-slate-900 text-indigo-600 focus:ring-indigo-500"
                  />
                  <span className="text-xs text-slate-400 group-hover:text-slate-300 transition-colors">
                    I accept the terms of the credit facility, origination fees, and authorize the API payload generation.
                  </span>
                </label>
              </div>

              {/* Submit Button */}
              {!isSubmitted ? (
                <button
                  onClick={handleSubmitAcceptance}
                  disabled={isSubmitting || !gdprConsent || !termsAccepted}
                  className={`w-full py-3.5 px-4 rounded-xl font-bold text-sm transition-all flex items-center justify-center gap-2 ${
                    isSubmitting 
                      ? 'bg-slate-800 text-slate-500 cursor-not-allowed'
                      : gdprConsent && termsAccepted
                        ? 'bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white shadow-lg shadow-indigo-500/20'
                        : 'bg-slate-800 text-slate-400 cursor-not-allowed'
                  }`}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="w-4 h-4 animate-spin" /> Processing Handshake...
                    </>
                  ) : (
                    <>
                      Accept Selected Facilities <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              ) : (
                <div className="space-y-3">
                  <div className="bg-emerald-500/10 border border-emerald-500/20 rounded-xl p-4 text-center space-y-2">
                    <div className="w-10 h-10 bg-emerald-500/20 text-emerald-400 rounded-full flex items-center justify-center mx-auto">
                      <CheckCircle2 className="w-6 h-6" />
                    </div>
                    <h4 className="text-sm font-bold text-white">Offer Accepted Successfully</h4>
                    <p className="text-xs text-slate-400">
                      The API payload has been ingested. Your dedicated EMEA account manager will contact you within 2 business hours.
                    </p>
                  </div>
                  <button
                    onClick={resetForm}
                    className="w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-xs font-semibold text-slate-300 transition-all"
                  >
                    Reset Dashboard State
                  </button>
                </div>
              )}
            </div>

          </div>

        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-950 mt-16 py-8 px-6 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-center gap-4">
          <p>© 2024 EMEA Credit Decisioning Engine. All rights reserved.</p>
          <div className="flex gap-4">
            <a href="#privacy" className="hover:text-slate-300">Privacy Policy</a>
            <a href="#terms" className="hover:text-slate-300">Terms of Service</a>
            <a href="#support" className="hover:text-slate-300">Developer Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}