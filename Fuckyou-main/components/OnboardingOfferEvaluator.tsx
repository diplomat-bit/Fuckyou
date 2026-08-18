import React, { useState, useMemo } from 'react';
import { 
  ShieldCheck, 
  AlertTriangle, 
  XCircle, 
  Percent, 
  Calendar, 
  Shield, 
  Sparkles, 
  ArrowRight, 
  Info, 
  Check, 
  TrendingUp, 
  CreditCard, 
  Gift, 
  DollarSign, 
  FileText, 
  HelpCircle,
  ChevronRight,
  ThumbsUp,
  Activity,
  UserCheck
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface CreditDecision {
  status: 'APPROVED' | 'CONDITIONAL' | 'COUNTER_OFFER' | 'REJECTED';
  score: number;
  scoreRating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  maxApprovedAmount: number;
  minApprovedAmount: number;
  baseInterestRate: number; // Annual rate (e.g., 0.089 for 8.9%)
  processingFeeRate: number; // e.g., 0.015 for 1.5%
  insuranceRateAnnual: number; // e.g., 0.012 for 1.2%
}

interface CounterOffer {
  id: string;
  title: string;
  description: string;
  amount: number;
  tenorMonths: number;
  interestRate: number;
  reason: string;
  badge?: string;
}

interface CrossSellOffer {
  id: string;
  type: 'CREDIT_CARD' | 'INSURANCE' | 'SAVINGS' | 'INVESTMENT';
  title: string;
  description: string;
  benefit: string;
  estimatedValue: string;
  icon: React.ReactNode;
  ctaText: string;
}

interface CreditInsight {
  type: 'positive' | 'warning' | 'info';
  title: string;
  description: string;
}

// --- MOCK INITIAL DATA ---
const mockDecision: CreditDecision = {
  status: 'APPROVED',
  score: 745,
  scoreRating: 'Excellent',
  maxApprovedAmount: 35000,
  minApprovedAmount: 5000,
  baseInterestRate: 0.079, // 7.9%
  processingFeeRate: 0.012, // 1.2%
  insuranceRateAnnual: 0.015, // 1.5%
};

const mockCounterOffers: CounterOffer[] = [
  {
    id: 'co-1',
    title: 'Extended Tenor Safety Net',
    description: 'Lower your monthly commitment by extending the repayment window.',
    amount: 35000,
    tenorMonths: 72,
    interestRate: 0.084,
    reason: 'Reduces Debt-to-Income ratio by 12%',
    badge: 'Most Popular'
  },
  {
    id: 'co-2',
    title: 'Rapid Payoff Discount',
    description: 'Get our absolute lowest interest rate by opting for a shorter term.',
    amount: 25000,
    tenorMonths: 24,
    interestRate: 0.065,
    reason: 'Saves $2,410 in total interest payments',
    badge: 'Best Value'
  }
];

const mockCrossSells: CrossSellOffer[] = [
  {
    id: 'cs-1',
    type: 'CREDIT_CARD',
    title: 'Apex Platinum Credit Card',
    description: 'Pre-approved with a $10,000 limit. 0% APR for the first 15 months.',
    benefit: 'Earn 50,000 bonus points ($500 value) after spending $3,000 in 3 months.',
    estimatedValue: '$500 Welcome Bonus',
    icon: <CreditCard className="w-5 h-5 text-indigo-600" />,
    ctaText: 'Add to Package'
  },
  {
    id: 'cs-2',
    type: 'SAVINGS',
    title: 'High-Yield Wealth Builder',
    description: 'Automate your loan payments from this account and unlock a bonus yield.',
    benefit: 'Earn 4.85% APY + 0.25% interest rate discount on your active loan.',
    estimatedValue: '0.25% Loan Discount',
    icon: <TrendingUp className="w-5 h-5 text-emerald-600" />,
    ctaText: 'Open Account'
  },
  {
    id: 'cs-3',
    type: 'INSURANCE',
    title: 'Income Protection Plus',
    description: 'Covers your monthly loan installments in the event of involuntary job loss or disability.',
    benefit: 'Peace of mind with zero-deductible immediate activation.',
    estimatedValue: 'Full Payment Coverage',
    icon: <Shield className="w-5 h-5 text-blue-600" />,
    ctaText: 'Learn More'
  }
];

const mockInsights: CreditInsight[] = [
  {
    type: 'positive',
    title: 'Excellent Payment History',
    description: 'Your 99.8% on-time payment record across active accounts heavily influenced this premium rate.'
  },
  {
    type: 'info',
    title: 'Credit Utilization is Optimal',
    description: 'Your revolving credit utilization is currently at 14%, which is well below the recommended 30% threshold.'
  },
  {
    type: 'warning',
    title: 'Recent Hard Inquiries',
    description: 'You have 2 hard inquiries in the last 6 months. Avoiding further applications will help stabilize your score.'
  }
];

export default function OnboardingOfferEvaluator() {
  // --- STATE ---
  const [loanAmount, setLoanAmount] = useState<number>(20000);
  const [tenor, setTenor] = useState<number>(36); // months
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<'standard' | 'counters' | 'crossSells'>('standard');
  const [isSubmitting, setIsSubmitting] = useState<boolean>(false);
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  const [selectedCrossSells, setSelectedCrossSells] = useState<string[]>([]);
  const [showTooltip, setShowTooltip] = useState<string | null>(null);

  // --- CALCULATIONS ---
  const loanCalculations = useMemo(() => {
    // Adjust interest rate slightly based on tenor (longer tenor = slightly higher risk/rate)
    const tenorPremium = (tenor - 12) * 0.0005; // +0.05% for every 12 months above 12m
    const annualRate = mockDecision.baseInterestRate + tenorPremium;
    const monthlyRate = annualRate / 12;
    
    // Standard Amortization Formula: P * (r * (1+r)^n) / ((1+r)^n - 1)
    const baseInstallment = 
      (loanAmount * (monthlyRate * Math.pow(1 + monthlyRate, tenor))) / 
      (Math.pow(1 + monthlyRate, tenor) - 1);

    // Insurance calculation (optional)
    const monthlyInsuranceRate = mockDecision.insuranceRateAnnual / 12;
    const insuranceInstallment = includeInsurance ? loanAmount * monthlyInsuranceRate : 0;
    
    const totalMonthlyInstallment = baseInstallment + insuranceInstallment;
    const totalPayments = totalMonthlyInstallment * tenor;
    const totalInterest = (baseInstallment * tenor) - loanAmount;
    const totalInsurancePaid = insuranceInstallment * tenor;
    
    // Processing Fee (one-time, usually deducted from payout or added to loan)
    const processingFee = loanAmount * mockDecision.processingFeeRate;
    
    // Approximate APR calculation: (Total Interest + Fees + Insurance) / Loan Amount / Years
    const years = tenor / 12;
    const totalFinanceCharges = totalInterest + processingFee + totalInsurancePaid;
    const apr = (totalFinanceCharges / loanAmount) / years;

    return {
      annualRate: annualRate * 100,
      monthlyRate,
      baseInstallment,
      insuranceInstallment,
      totalMonthlyInstallment,
      totalPayments,
      totalInterest,
      totalInsurancePaid,
      processingFee,
      apr: apr * 100
    };
  }, [loanAmount, tenor, includeInsurance]);

  // --- HANDLERS ---
  const handleCrossSellToggle = (id: string) => {
    setSelectedCrossSells(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleAcceptOffer = () => {
    setIsSubmitting(true);
    setTimeout(() => {
      setIsSubmitting(false);
      setIsSuccess(true);
    }, 2000);
  };

  const handleApplyCounterOffer = (offer: CounterOffer) => {
    setLoanAmount(offer.amount);
    setTenor(offer.tenorMonths);
    setActiveTab('standard');
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 font-sans antialiased p-4 md:p-8">
      <div className="max-w-7xl mx-auto space-y-8">
        
        {/* HEADER SECTION */}
        <header className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 bg-white p-6 rounded-2xl border border-slate-100 shadow-sm">
          <div>
            <div className="flex items-center gap-2 text-indigo-600 font-semibold text-sm uppercase tracking-wider">
              <Sparkles className="w-4 h-4" />
              <span>AI-Powered Credit Decisioning</span>
            </div>
            <h1 className="text-3xl font-bold text-slate-900 mt-1">Your Personalized Loan Offer</h1>
            <p className="text-slate-500 mt-1">Review your approved credit options, customize your terms, and explore exclusive cross-sell benefits.</p>
          </div>
          <div className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100 self-start md:self-center">
            <div className="w-10 h-10 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs text-slate-400 font-medium">Verified Applicant</div>
              <div className="text-sm font-semibold text-slate-700">Alex Morgan</div>
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: DECISION & CONFIGURATOR (8 COLS) */}
          <div className="lg:col-span-8 space-y-8">
            
            {/* DECISION STATUS & SCORE GAUGE */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm overflow-hidden">
              <div className="p-6 md:p-8 border-b border-slate-100 bg-gradient-to-r from-slate-50 to-white">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                  
                  {/* Status Badge */}
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl border border-emerald-100">
                      <ShieldCheck className="w-8 h-8" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="text-xs font-bold uppercase tracking-wider px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800">
                          Approved
                        </span>
                        <span className="text-xs text-slate-400">• Updated just now</span>
                      </div>
                      <h2 className="text-2xl font-bold text-slate-900 mt-1">Congratulations!</h2>
                      <p className="text-slate-500 text-sm mt-0.5">You qualify for our premium tier interest rates based on your excellent credit profile.</p>
                    </div>
                  </div>

                  {/* Score Gauge */}
                  <div className="flex items-center gap-4 bg-white p-4 rounded-xl border border-slate-100 shadow-sm self-start md:self-auto">
                    <div className="relative flex items-center justify-center">
                      {/* Simple SVG Semi-Circle Gauge */}
                      <svg className="w-20 h-20 transform -rotate-90">
                        <circle cx="40" cy="40" r="34" stroke="#f1f5f9" strokeWidth="6" fill="transparent" />
                        <circle 
                          cx="40" 
                          cy="40" 
                          r="34" 
                          stroke="#10b981" 
                          strokeWidth="6" 
                          fill="transparent" 
                          strokeDasharray={2 * Math.PI * 34}
                          strokeDashoffset={((850 - mockDecision.score) / 850) * (2 * Math.PI * 34)}
                          strokeLinecap="round"
                        />
                      </svg>
                      <div className="absolute flex flex-col items-center justify-center">
                        <span className="text-lg font-bold text-slate-800">{mockDecision.score}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Score</span>
                      </div>
                    </div>
                    <div>
                      <div className="text-xs text-slate-400 font-medium">Credit Tier</div>
                      <div className="text-base font-bold text-emerald-600">{mockDecision.scoreRating}</div>
                      <div className="text-[11px] text-slate-500">Low Risk Profile</div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Quick Stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-y md:divide-y-0 divide-slate-100 bg-slate-50/50">
                <div className="p-4 text-center">
                  <div className="text-xs text-slate-400 font-medium">Max Approved</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">${mockDecision.maxApprovedAmount.toLocaleString()}</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-xs text-slate-400 font-medium">Min Approved</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">${mockDecision.minApprovedAmount.toLocaleString()}</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-xs text-slate-400 font-medium">Base Interest Rate</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">{(mockDecision.baseInterestRate * 100).toFixed(2)}%</div>
                </div>
                <div className="p-4 text-center">
                  <div className="text-xs text-slate-400 font-medium">Processing Fee</div>
                  <div className="text-lg font-bold text-slate-800 mt-0.5">{(mockDecision.processingFeeRate * 100).toFixed(1)}%</div>
                </div>
              </div>
            </section>

            {/* TABS FOR OFFER TYPES */}
            <div className="flex border-b border-slate-200">
              <button
                onClick={() => setActiveTab('standard')}
                className={`pb-4 px-6 font-semibold text-sm transition-all border-b-2 ${
                  activeTab === 'standard' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                Standard Offer Configurator
              </button>
              <button
                onClick={() => setActiveTab('counters')}
                className={`pb-4 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'counters' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>Counter-Offers</span>
                <span className="bg-amber-100 text-amber-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {mockCounterOffers.length} Available
                </span>
              </button>
              <button
                onClick={() => setActiveTab('crossSells')}
                className={`pb-4 px-6 font-semibold text-sm transition-all border-b-2 flex items-center gap-2 ${
                  activeTab === 'crossSells' 
                    ? 'border-indigo-600 text-indigo-600' 
                    : 'border-transparent text-slate-400 hover:text-slate-600'
                }`}
              >
                <span>Exclusive Bundles</span>
                <span className="bg-indigo-100 text-indigo-800 text-[10px] font-bold px-2 py-0.5 rounded-full">
                  {mockCrossSells.length} Offers
                </span>
              </button>
            </div>

            {/* TAB CONTENT: STANDARD CONFIGURATOR */}
            {activeTab === 'standard' && (
              <div className="space-y-8">
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-8">
                  
                  {/* Loan Amount Slider */}
                  <div className="space-y-4">
                    <div className="flex justify-between items-center">
                      <label className="text-sm font-semibold text-slate-700 flex items-center gap-1.5">
                        Desired Loan Amount
                        <button 
                          onMouseEnter={() => setShowTooltip('amount')}
                          onMouseLeave={() => setShowTooltip(null)}
                          className="text-slate-400 hover:text-slate-600 relative"
                        >
                          <Info className="w-4 h-4" />
                          {showTooltip === 'amount' && (
                            <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10 font-normal">
                              Choose any amount within your pre-approved limit.
                            </span>
                          )}
                        </button>
                      </label>
                      <span className="text-2xl font-extrabold text-indigo-600">
                        ${loanAmount.toLocaleString()}
                      </span>
                    </div>
                    <input 
                      type="range" 
                      min={mockDecision.minApprovedAmount} 
                      max={mockDecision.maxApprovedAmount} 
                      step={500}
                      value={loanAmount}
                      onChange={(e) => setLoanAmount(Number(e.target.value))}
                      className="w-full h-2 bg-slate-100 rounded-lg appearance-none cursor-pointer accent-indigo-600"
                    />
                    <div className="flex justify-between text-xs text-slate-400 font-medium">
                      <span>Min: ${mockDecision.minApprovedAmount.toLocaleString()}</span>
                      <span>Max: ${mockDecision.maxApprovedAmount.toLocaleString()}</span>
                    </div>
                  </div>

                  {/* Tenor Selector */}
                  <div className="space-y-4">
                    <label className="text-sm font-semibold text-slate-700 block">
                      Repayment Term (Tenor)
                    </label>
                    <div className="grid grid-cols-5 gap-3">
                      {[12, 24, 36, 48, 60].map((months) => (
                        <button
                          key={months}
                          onClick={() => setTenor(months)}
                          className={`py-3 px-2 rounded-xl border text-center transition-all ${
                            tenor === months 
                              ? 'border-indigo-600 bg-indigo-50/50 text-indigo-600 font-bold shadow-sm' 
                              : 'border-slate-200 hover:border-slate-300 text-slate-600 font-medium'
                          }`}
                        >
                          <div className="text-base">{months}</div>
                          <div className="text-[10px] uppercase tracking-wider text-slate-400 mt-0.5">Months</div>
                        </button>
                      ))}
                    </div>
                  </div>

                  {/* Insurance Toggle */}
                  <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex items-center justify-between gap-4">
                    <div className="flex items-start gap-3">
                      <div className="p-2 bg-indigo-100 text-indigo-600 rounded-lg mt-0.5">
                        <Shield className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="text-sm font-semibold text-slate-800 flex items-center gap-1.5">
                          Add Loan Protection Insurance
                          <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-1.5 py-0.5 rounded">Recommended</span>
                        </div>
                        <p className="text-xs text-slate-500 mt-0.5">
                          Protects your credit score and covers payments in case of unexpected job loss or illness. Just ${(loanCalculations.insuranceInstallment).toFixed(2)}/mo.
                        </p>
                      </div>
                    </div>
                    <button
                      onClick={() => setIncludeInsurance(!includeInsurance)}
                      className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${
                        includeInsurance ? 'bg-indigo-600' : 'bg-slate-200'
                      }`}
                    >
                      <span
                        className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${
                          includeInsurance ? 'translate-x-5' : 'translate-x-0'
                        }`}
                      />
                    </button>
                  </div>

                </div>

                {/* DETAILED LOAN BREAKDOWN */}
                <div className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 md:p-8 space-y-6">
                  <h3 className="text-lg font-bold text-slate-900">Payment Breakdown</h3>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Monthly Installment Card */}
                    <div className="bg-gradient-to-br from-indigo-50 to-slate-50 p-6 rounded-2xl border border-indigo-100/50 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-indigo-600 uppercase tracking-wider">Monthly Installment</span>
                        <div className="text-3xl font-extrabold text-slate-900 mt-1">
                          ${loanCalculations.totalMonthlyInstallment.toFixed(2)}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-indigo-100/50 space-y-1.5 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>Principal & Interest:</span>
                          <span className="font-medium text-slate-700">${loanCalculations.baseInstallment.toFixed(2)}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Insurance Protection:</span>
                          <span className="font-medium text-slate-700">
                            {includeInsurance ? `$${loanCalculations.insuranceInstallment.toFixed(2)}` : 'Excluded'}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Rates Card */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Interest & APR</span>
                        <div className="flex items-baseline gap-2 mt-1">
                          <span className="text-2xl font-bold text-slate-800">{loanCalculations.annualRate.toFixed(2)}%</span>
                          <span className="text-xs text-slate-400">Interest Rate</span>
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-500">
                        <div className="flex justify-between items-center">
                          <span className="flex items-center gap-1">
                            Effective APR
                            <button 
                              onMouseEnter={() => setShowTooltip('apr')}
                              onMouseLeave={() => setShowTooltip(null)}
                              className="text-slate-400 hover:text-slate-600 relative"
                            >
                              <HelpCircle className="w-3 h-3" />
                              {showTooltip === 'apr' && (
                                <span className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 w-48 p-2 bg-slate-800 text-white text-xs rounded shadow-lg z-10 font-normal">
                                  Annual Percentage Rate includes interest, processing fees, and insurance.
                                </span>
                              )}
                            </button>
                          </span>
                          <span className="font-bold text-indigo-600">{loanCalculations.apr.toFixed(2)}%</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Processing Fee:</span>
                          <span className="font-medium text-slate-700">${loanCalculations.processingFee.toFixed(2)}</span>
                        </div>
                      </div>
                    </div>

                    {/* Total Cost Card */}
                    <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 flex flex-col justify-between">
                      <div>
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Cost of Loan</span>
                        <div className="text-2xl font-bold text-slate-800 mt-1">
                          ${loanCalculations.totalPayments.toLocaleString(undefined, {maximumFractionDigits: 2})}
                        </div>
                      </div>
                      <div className="mt-4 pt-4 border-t border-slate-200/60 space-y-1.5 text-xs text-slate-500">
                        <div className="flex justify-between">
                          <span>Total Interest Paid:</span>
                          <span className="font-medium text-slate-700">${loanCalculations.totalInterest.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                        </div>
                        <div className="flex justify-between">
                          <span>Total Insurance Paid:</span>
                          <span className="font-medium text-slate-700">${loanCalculations.totalInsurancePaid.toLocaleString(undefined, {maximumFractionDigits: 2})}</span>
                        </div>
                      </div>
                    </div>

                  </div>
                </div>
              </div>
            )}

            {/* TAB CONTENT: COUNTER-OFFERS */}
            {activeTab === 'counters' && (
              <div className="space-y-6">
                <div className="bg-amber-50 border border-amber-200 rounded-2xl p-6 flex items-start gap-4">
                  <AlertTriangle className="w-6 h-6 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-amber-900">Alternative Structuring Options</h4>
                    <p className="text-sm text-amber-800 mt-1">
                      Our underwriting engine generated these alternative offers to optimize your approval odds, lower your monthly commitment, or maximize interest savings.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {mockCounterOffers.map((offer) => {
                    // Calculate monthly payment for counter offer
                    const monthlyRate = offer.interestRate / 12;
                    const baseInstallment = (offer.amount * (monthlyRate * Math.pow(1 + monthlyRate, offer.tenorMonths))) / (Math.pow(1 + monthlyRate, offer.tenorMonths) - 1);
                    
                    return (
                      <div 
                        key={offer.id} 
                        className="bg-white rounded-2xl border border-slate-100 shadow-sm hover:shadow-md transition-all p-6 flex flex-col justify-between relative overflow-hidden"
                      >
                        {offer.badge && (
                          <span className="absolute top-0 right-0 bg-indigo-600 text-white text-[10px] font-bold px-3 py-1 rounded-bl-xl">
                            {offer.badge}
                          </span>
                        )}
                        <div>
                          <h4 className="font-bold text-slate-900 text-lg pr-20">{offer.title}</h4>
                          <p className="text-xs text-slate-500 mt-1">{offer.description}</p>
                          
                          <div className="grid grid-cols-2 gap-4 my-6 bg-slate-50 p-4 rounded-xl border border-slate-100">
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Loan Amount</div>
                              <div className="text-lg font-bold text-slate-800">${offer.amount.toLocaleString()}</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Term</div>
                              <div className="text-lg font-bold text-slate-800">{offer.tenorMonths} Months</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Interest Rate</div>
                              <div className="text-lg font-bold text-emerald-600">{(offer.interestRate * 100).toFixed(2)}%</div>
                            </div>
                            <div>
                              <div className="text-[10px] text-slate-400 uppercase font-semibold">Est. Monthly</div>
                              <div className="text-lg font-bold text-slate-800">${baseInstallment.toFixed(2)}</div>
                            </div>
                          </div>

                          <div className="flex items-center gap-2 text-xs text-indigo-600 bg-indigo-50/50 p-2.5 rounded-lg border border-indigo-100/30">
                            <ThumbsUp className="w-4 h-4 shrink-0" />
                            <span><strong>Benefit:</strong> {offer.reason}</span>
                          </div>
                        </div>

                        <button
                          onClick={() => handleApplyCounterOffer(offer)}
                          className="mt-6 w-full py-2.5 px-4 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-sm rounded-xl transition-all flex items-center justify-center gap-2"
                        >
                          <span>Apply This Structure</span>
                          <ArrowRight className="w-4 h-4" />
                        </button>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {/* TAB CONTENT: CROSS-SELLS */}
            {activeTab === 'crossSells' && (
              <div className="space-y-6">
                <div className="bg-indigo-50 border border-indigo-100 rounded-2xl p-6 flex items-start gap-4">
                  <Gift className="w-6 h-6 text-indigo-600 shrink-0 mt-0.5" />
                  <div>
                    <h4 className="font-bold text-indigo-900">Exclusive Bundle & Save Offers</h4>
                    <p className="text-sm text-indigo-800 mt-1">
                      Combine your loan with any of these pre-approved financial products to unlock interest rate discounts, cash bonuses, and enhanced protection.
                    </p>
                  </div>
                </div>

                <div className="space-y-4">
                  {mockCrossSells.map((offer) => {
                    const isSelected = selectedCrossSells.includes(offer.id);
                    return (
                      <div 
                        key={offer.id}
                        className={`bg-white rounded-2xl border p-6 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6 ${
                          isSelected ? 'border-indigo-600 ring-1 ring-indigo-600 bg-indigo-50/10' : 'border-slate-100 hover:border-slate-200'
                        }`}
                      >
                        <div className="flex items-start gap-4">
                          <div className="p-3 bg-slate-50 rounded-xl border border-slate-100 shrink-0">
                            {offer.icon}
                          </div>
                          <div>
                            <div className="flex items-center gap-2">
                              <h4 className="font-bold text-slate-900">{offer.title}</h4>
                              <span className="bg-emerald-100 text-emerald-800 text-[9px] font-bold px-2 py-0.5 rounded-full">
                                Pre-Approved
                              </span>
                            </div>
                            <p className="text-xs text-slate-500 mt-1">{offer.description}</p>
                            <div className="mt-3 flex items-center gap-1.5 text-xs text-indigo-600 font-semibold">
                              <Sparkles className="w-3.5 h-3.5" />
                              <span>{offer.benefit}</span>
                            </div>
                          </div>
                        </div>

                        <div className="flex flex-row md:flex-col items-center md:items-end justify-between md:justify-center gap-4 shrink-0 border-t md:border-t-0 pt-4 md:pt-0 border-slate-100">
                          <div className="text-left md:text-right">
                            <div className="text-[10px] text-slate-400 uppercase font-semibold">Estimated Value</div>
                            <div className="text-sm font-bold text-emerald-600">{offer.estimatedValue}</div>
                          </div>
                          <button
                            onClick={() => handleCrossSellToggle(offer.id)}
                            className={`py-2 px-4 rounded-xl font-semibold text-xs transition-all flex items-center gap-1.5 ${
                              isSelected 
                                ? 'bg-indigo-600 text-white hover:bg-indigo-700' 
                                : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                            }`}
                          >
                            {isSelected ? <Check className="w-3.5 h-3.5" /> : null}
                            <span>{isSelected ? 'Added to Bundle' : offer.ctaText}</span>
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

          </div>

          {/* RIGHT COLUMN: CREDIT INSIGHTS & SUMMARY (4 COLS) */}
          <div className="lg:col-span-4 space-y-8">
            
            {/* CREDIT INSIGHTS */}
            <section className="bg-white rounded-2xl border border-slate-100 shadow-sm p-6 space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="font-bold text-slate-900 flex items-center gap-2">
                  <Activity className="w-5 h-5 text-indigo-600" />
                  <span>Credit Insights</span>
                </h3>
                <span className="text-xs text-slate-400 font-medium">AI Analysis</span>
              </div>

              <div className="space-y-4">
                {mockInsights.map((insight, idx) => (
                  <div key={idx} className="flex gap-3 items-start">
                    {insight.type === 'positive' && (
                      <div className="w-2 h-2 rounded-full bg-emerald-500 shrink-0 mt-1.5" />
                    )}
                    {insight.type === 'info' && (
                      <div className="w-2 h-2 rounded-full bg-blue-500 shrink-0 mt-1.5" />
                    )}
                    {insight.type === 'warning' && (
                      <div className="w-2 h-2 rounded-full bg-amber-500 shrink-0 mt-1.5" />
                    )}
                    <div>
                      <h4 className="text-xs font-bold text-slate-800">{insight.title}</h4>
                      <p className="text-[11px] text-slate-500 mt-0.5 leading-relaxed">{insight.description}</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="pt-4 border-t border-slate-100">
                <div className="bg-slate-50 p-3.5 rounded-xl border border-slate-100 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-emerald-600" />
                    <span className="text-xs font-semibold text-slate-700">Score Impact Simulation</span>
                  </div>
                  <span className="text-xs font-bold text-emerald-600">+15 pts expected</span>
                </div>
                <p className="text-[10px] text-slate-400 mt-2 text-center">
                  Maintaining on-time payments on this loan is projected to increase your score within 6 months.
                </p>
              </div>
            </section>

            {/* PACKAGE SUMMARY & CHECKOUT */}
            <section className="bg-slate-900 text-white rounded-2xl shadow-xl p-6 space-y-6 relative overflow-hidden">
              {/* Decorative background glow */}
              <div className="absolute -top-24 -right-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
              
              <h3 className="font-bold text-lg flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" />
                <span>Package Summary</span>
              </h3>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400">Base Loan Amount</span>
                  <span className="font-semibold">${loanAmount.toLocaleString()}</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400">Repayment Term</span>
                  <span className="font-semibold">{tenor} Months</span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400">Interest Rate (APR)</span>
                  <span className="font-semibold text-emerald-400">
                    {loanCalculations.annualRate.toFixed(2)}% ({loanCalculations.apr.toFixed(2)}% APR)
                  </span>
                </div>
                <div className="flex justify-between border-b border-slate-800 pb-3">
                  <span className="text-slate-400">Loan Protection</span>
                  <span className="font-semibold">
                    {includeInsurance ? 'Included' : 'Excluded'}
                  </span>
                </div>

                {/* Selected Cross-Sells */}
                {selectedCrossSells.length > 0 && (
                  <div className="space-y-2 pt-1">
                    <span className="text-xs font-semibold text-indigo-400 uppercase tracking-wider block">Bundled Add-ons</span>
                    {selectedCrossSells.map(id => {
                      const item = mockCrossSells.find(cs => cs.id === id);
                      return (
                        <div key={id} className="flex justify-between text-xs bg-slate-800/50 p-2 rounded border border-slate-800">
                          <span className="text-slate-300 truncate max-w-[180px]">{item?.title}</span>
                          <span className="font-semibold text-emerald-400">Pre-Approved</span>
                        </div>
                      );
                    })}
                  </div>
                )}

                {/* Final Monthly Payment */}
                <div className="pt-4 flex justify-between items-baseline">
                  <span className="text-base font-bold">Total Monthly</span>
                  <div className="text-right">
                    <div className="text-3xl font-extrabold text-indigo-400">
                      ${loanCalculations.totalMonthlyInstallment.toFixed(2)}
                    </div>
                    <span className="text-[10px] text-slate-400">Includes all selected options</span>
                  </div>
                </div>
              </div>

              {/* CTA BUTTONS */}
              <div className="space-y-3 pt-4">
                <button
                  onClick={handleAcceptOffer}
                  disabled={isSubmitting}
                  className="w-full py-4 px-6 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white font-bold rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  {isSubmitting ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>
                      <span>Accept & Sign Agreement</span>
                      <ArrowRight className="w-5 h-5" />
                    </>
                  )}
                </button>
                <button className="w-full py-3 px-6 bg-transparent hover:bg-slate-800 text-slate-400 hover:text-white font-semibold text-sm rounded-xl transition-all">
                  Download Offer PDF
                </button>
              </div>

              <p className="text-[10px] text-slate-500 text-center mt-4">
                By clicking "Accept & Sign Agreement", you agree to our digital disclosure terms and authorize a soft credit pull to finalize the contract.
              </p>
            </section>

          </div>

        </div>

      </div>

      {/* SUCCESS MODAL */}
      {isSuccess && (
        <div className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-3xl max-w-md w-full p-8 text-center shadow-2xl border border-slate-100 animate-in fade-in zoom-in-95 duration-200">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto mb-6">
              <ShieldCheck className="w-10 h-10" />
            </div>
            <h3 className="text-2xl font-bold text-slate-900">Offer Accepted!</h3>
            <p className="text-slate-500 text-sm mt-2">
              Your loan package has been successfully locked in. We are preparing your digital signature documents.
            </p>

            <div className="bg-slate-50 p-4 rounded-2xl border border-slate-100 my-6 space-y-2 text-left text-xs">
              <div className="flex justify-between">
                <span className="text-slate-400">Loan Amount:</span>
                <span className="font-bold text-slate-800">${loanAmount.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Monthly Installment:</span>
                <span className="font-bold text-slate-800">${loanCalculations.totalMonthlyInstallment.toFixed(2)}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">Bundled Add-ons:</span>
                <span className="font-bold text-slate-800">{selectedCrossSells.length} Products</span>
              </div>
            </div>

            <button
              onClick={() => setIsSuccess(false)}
              className="w-full py-3 px-6 bg-slate-900 hover:bg-slate-800 text-white font-bold rounded-xl transition-all"
            >
              Go to Dashboard
            </button>
          </div>
        </div>
      )}

    </div>
  );
}