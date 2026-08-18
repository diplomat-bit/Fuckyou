import React, { useState, useMemo } from "react";

// Custom SVG Icons for zero-dependency, high-performance rendering
const DollarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <line x1="12" y1="1" x2="12" y2="23"></line>
    <path d="M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6"></path>
  </svg>
);

const CalendarIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-indigo-400">
    <rect x="3" y="4" width="18" height="18" rx="2" ry="2"></rect>
    <line x1="16" y1="2" x2="16" y2="6"></line>
    <line x1="8" y1="2" x2="8" y2="6"></line>
    <line x1="3" y1="10" x2="21" y2="10"></line>
  </svg>
);

const ShieldIcon = ({ active }: { active: boolean }) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className={active ? "text-emerald-400 animate-pulse" : "text-slate-400"}>
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
  </svg>
);

const InfoIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-slate-400 hover:text-slate-200 transition-colors cursor-help">
    <circle cx="12" cy="12" r="10"></circle>
    <line x1="12" y1="16" x2="12" y2="12"></line>
    <line x1="12" y1="8" x2="12.01" y2="8"></line>
  </svg>
);

const ArrowRightIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
    <line x1="5" y1="12" x2="19" y2="12"></line>
    <polyline points="12 5 19 12 12 19"></polyline>
  </svg>
);

const CheckIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="text-emerald-400">
    <polyline points="20 6 9 17 4 12"></polyline>
  </svg>
);

export interface LoanSelectionData {
  loanAmount: number;
  tenorMonths: number;
  apr: number;
  handlingFee: number;
  monthlyFee: number;
  monthlyInsurancePremium: number;
  monthlyPaymentWithInsurance: number;
  monthlyPaymentWithoutInsurance: number;
  totalCostWithInsurance: number;
  totalCostWithoutInsurance: number;
  includeInsurance: boolean;
}

interface OnboardingLoanSelectionFormProps {
  minAmount?: number;
  maxAmount?: number;
  stepAmount?: number;
  minTenor?: number;
  maxTenor?: number;
  stepTenor?: number;
  onSelectionComplete?: (data: LoanSelectionData) => void;
}

export default function OnboardingLoanSelectionForm({
  minAmount = 2000,
  maxAmount = 50000,
  stepAmount = 500,
  minTenor = 6,
  maxTenor = 60,
  stepTenor = 6,
  onSelectionComplete,
}: OnboardingLoanSelectionFormProps) {
  // State variables
  const [loanAmount, setLoanAmount] = useState<number>(15000);
  const [tenor, setTenor] = useState<number>(24);
  const [includeInsurance, setIncludeInsurance] = useState<boolean>(true);
  const [activeTooltip, setActiveTooltip] = useState<string | null>(null);
  const [isSubmitted, setIsSubmitted] = useState<boolean>(false);

  // Dynamic APR calculation based on tenor (longer tenor = slightly higher risk/APR)
  const apr = useMemo(() => {
    if (tenor <= 12) return 8.99;
    if (tenor <= 24) return 10.49;
    if (tenor <= 36) return 11.99;
    if (tenor <= 48) return 12.99;
    return 13.99;
  }, [tenor]);

  // Financial Calculations
  const calculations = useMemo((): LoanSelectionData => {
    // 1. Handling Fee: 1.5% of loan amount (capped between $100 and $600)
    const rawHandlingFee = loanAmount * 0.015;
    const handlingFee = Math.min(Math.max(rawHandlingFee, 100), 600);

    // 2. Monthly Service/Account Fee
    const monthlyFee = 4.50;

    // 3. Monthly Insurance Premium: 0.08% of loan amount per month
    const monthlyInsurancePremium = loanAmount * 0.0008;

    // 4. Monthly Principal & Interest Payment (Amortization Formula)
    const monthlyRate = apr / 12 / 100;
    let monthlyPI = 0;
    if (monthlyRate === 0) {
      monthlyPI = loanAmount / tenor;
    } else {
      monthlyPI = (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, tenor)) / (Math.pow(1 + monthlyRate, tenor) - 1);
    }

    // 5. Total Monthly Payments
    const monthlyPaymentWithoutInsurance = monthlyPI + monthlyFee;
    const monthlyPaymentWithInsurance = monthlyPI + monthlyFee + monthlyInsurancePremium;

    // 6. Total Cost of Credit (Total Interest + Fees + Insurance)
    const totalInterest = (monthlyPI * tenor) - loanAmount;
    const totalCostWithoutInsurance = totalInterest + handlingFee + (monthlyFee * tenor);
    const totalCostWithInsurance = totalCostWithoutInsurance + (monthlyInsurancePremium * tenor);

    return {
      loanAmount,
      tenorMonths: tenor,
      apr,
      handlingFee,
      monthlyFee,
      monthlyInsurancePremium,
      monthlyPaymentWithInsurance,
      monthlyPaymentWithoutInsurance,
      totalCostWithInsurance,
      totalCostWithoutInsurance,
      includeInsurance,
    };
  }, [loanAmount, tenor, apr, includeInsurance]);

  const handleAmountChange = (val: number) => {
    const sanitized = Math.min(Math.max(val, minAmount), maxAmount);
    setLoanAmount(sanitized);
  };

  const handleTenorChange = (val: number) => {
    const sanitized = Math.min(Math.max(val, minTenor), maxTenor);
    setTenor(sanitized);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitted(true);
    if (onSelectionComplete) {
      onSelectionComplete(calculations);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0,
    }).format(value);
  };

  const formatCurrencyDecimals = (value: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(value);
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-950 text-slate-100 rounded-3xl border border-slate-800 shadow-2xl overflow-hidden transition-all duration-300">
      {isSubmitted ? (
        <div className="p-12 text-center flex flex-col items-center justify-center min-h-[550px] animate-fade-in">
          <div className="w-20 h-20 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center mb-6 shadow-lg shadow-emerald-500/10">
            <CheckIcon />
          </div>
          <h2 className="text-3xl font-bold tracking-tight text-white mb-3">Loan Configuration Saved!</h2>
          <p className="text-slate-400 max-w-md mx-auto mb-8 leading-relaxed">
            Your customized loan parameters have been locked in. We are preparing your personalized offer documents.
          </p>
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 w-full max-w-md text-left space-y-3 mb-8">
            <div className="flex justify-between text-sm"><span className="text-slate-400">Configured Amount:</span><span className="font-semibold text-white">{formatCurrency(calculations.loanAmount)}</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Repayment Period:</span><span className="font-semibold text-white">{calculations.tenorMonths} Months</span></div>
            <div className="flex justify-between text-sm"><span className="text-slate-400">Estimated APR:</span><span className="font-semibold text-emerald-400">{calculations.apr}%</span></div>
            <div className="flex justify-between text-sm border-t border-slate-800 pt-3"><span className="text-slate-400 font-medium">Monthly Installment:</span><span className="font-bold text-white">{formatCurrencyDecimals(calculations.includeInsurance ? calculations.monthlyPaymentWithInsurance : calculations.monthlyPaymentWithoutInsurance)}</span></div>
          </div>
          <button
            onClick={() => setIsSubmitted(false)}
            className="px-6 py-3 bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium rounded-xl transition-all duration-200 text-sm"
          >
            Modify Configuration
          </button>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Interactive Controls */}
          <div className="lg:col-span-7 p-8 lg:p-12 space-y-10 border-b lg:border-b-0 lg:border-r border-slate-800">
            <div>
              <span className="text-xs font-bold tracking-widest text-indigo-400 uppercase bg-indigo-500/10 px-3 py-1.5 rounded-full">Step 2: Loan Customization</span>
              <h1 className="text-3xl font-extrabold tracking-tight text-white mt-4">Configure Your Loan</h1>
              <p className="text-slate-400 mt-2 text-sm leading-relaxed">
                Adjust the sliders to find the perfect balance between your monthly commitment and the total cost of credit.
              </p>
            </div>

            {/* Slider 1: Loan Amount */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <DollarIcon />
                  Desired Loan Amount
                </label>
                <div className="relative flex items-center">
                  <span className="absolute left-3 text-slate-400 font-medium text-sm">$</span>
                  <input
                    type="number"
                    value={loanAmount}
                    onChange={(e) => handleAmountChange(Number(e.target.value))}
                    min={minAmount}
                    max={maxAmount}
                    className="w-32 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-1.5 pl-7 pr-3 text-right text-sm font-bold text-white transition-all"
                  />
                </div>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min={minAmount}
                  max={maxAmount}
                  step={stepAmount}
                  value={loanAmount}
                  onChange={(e) => setLoanAmount(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>{formatCurrency(minAmount)}</span>
                  <span>{formatCurrency(maxAmount)}</span>
                </div>
              </div>
            </div>

            {/* Slider 2: Tenor */}
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <label className="text-sm font-semibold text-slate-300 flex items-center gap-2">
                  <CalendarIcon />
                  Repayment Period (Tenor)
                </label>
                <div className="relative flex items-center">
                  <input
                    type="number"
                    value={tenor}
                    onChange={(e) => handleTenorChange(Number(e.target.value))}
                    min={minTenor}
                    max={maxTenor}
                    className="w-24 bg-slate-900 border border-slate-800 focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 rounded-xl py-1.5 px-3 text-right text-sm font-bold text-white transition-all"
                  />
                  <span className="ml-2 text-xs font-semibold text-slate-400">Months</span>
                </div>
              </div>
              <div className="relative pt-2">
                <input
                  type="range"
                  min={minTenor}
                  max={maxTenor}
                  step={stepTenor}
                  value={tenor}
                  onChange={(e) => setTenor(Number(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500 focus:outline-none"
                />
                <div className="flex justify-between text-xs text-slate-500 mt-2 font-medium">
                  <span>{minTenor} Months</span>
                  <span>{maxTenor} Months</span>
                </div>
              </div>
            </div>

            {/* Insurance Toggle Card */}
            <div className={`p-5 rounded-2xl border transition-all duration-300 ${includeInsurance ? "bg-emerald-950/20 border-emerald-500/30" : "bg-slate-900/40 border-slate-800"}`}>
              <div className="flex items-start justify-between gap-4">
                <div className="flex items-center gap-3">
                  <div className={`p-2.5 rounded-xl ${includeInsurance ? "bg-emerald-500/10" : "bg-slate-800"}`}>
                    <ShieldIcon active={includeInsurance} />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                      Comprehensive Loan Protection
                      <span className="text-xs font-normal text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full">Recommended</span>
                    </h3>
                    <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                      Covers outstanding balance in case of involuntary unemployment, disability, or critical illness.
                    </p>
                  </div>
                </div>
                <button
                  type="button"
                  onClick={() => setIncludeInsurance(!includeInsurance)}
                  className={`relative inline-flex h-6 w-11 shrink-0 cursor-pointer rounded-full border-2 border-transparent transition-colors duration-200 ease-in-out focus:outline-none ${includeInsurance ? "bg-emerald-500" : "bg-slate-700"}`}
                >
                  <span className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow ring-0 transition duration-200 ease-in-out ${includeInsurance ? "translate-x-5" : "translate-x-0"}`} />
                </button>
              </div>
            </div>
          </div>

          {/* Right Column: Dynamic Calculations & Summary */}
          <div className="lg:col-span-5 bg-slate-900/50 p-8 lg:p-12 flex flex-col justify-between space-y-8">
            <div>
              <h2 className="text-lg font-bold text-white mb-6">Payment Summary</h2>

              {/* Big Monthly Payment Display */}
              <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-6 text-center relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-emerald-500"></div>
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Estimated Monthly Payment</span>
                <div className="text-4xl font-extrabold text-white mt-2 tracking-tight">
                  {formatCurrencyDecimals(includeInsurance ? calculations.monthlyPaymentWithInsurance : calculations.monthlyPaymentWithoutInsurance)}
                </div>
                <div className="text-xs text-slate-500 mt-1">
                  Includes all interest, fees &amp; optional protection
                </div>
              </div>

              {/* Detailed Breakdown */}
              <div className="mt-8 space-y-4">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    Annual Percentage Rate (APR)
                    <span className="relative group" onMouseEnter={() => setActiveTooltip("apr")} onMouseLeave={() => setActiveTooltip(null)}>
                      <InfoIcon />
                      {activeTooltip === "apr" && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-xs text-slate-300 rounded-lg border border-slate-800 shadow-xl z-10 leading-normal">
                          The annual rate charged for borrowing, expressed as a single percentage.
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="font-bold text-emerald-400">{calculations.apr}%</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    One-off Handling Fee
                    <span className="relative group" onMouseEnter={() => setActiveTooltip("handling")} onMouseLeave={() => setActiveTooltip(null)}>
                      <InfoIcon />
                      {activeTooltip === "handling" && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-xs text-slate-300 rounded-lg border border-slate-800 shadow-xl z-10 leading-normal">
                          1.5% processing fee, capped between $100 and $600, capitalized into the loan.
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="font-semibold text-white">{formatCurrency(calculations.handlingFee)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    Monthly Service Fee
                    <span className="relative group" onMouseEnter={() => setActiveTooltip("service")} onMouseLeave={() => setActiveTooltip(null)}>
                      <InfoIcon />
                      {activeTooltip === "service" && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-xs text-slate-300 rounded-lg border border-slate-800 shadow-xl z-10 leading-normal">
                          Flat monthly account maintenance fee.
                        </span>
                      )}
                    </span>
                  </span>
                  <span className="font-semibold text-white">{formatCurrencyDecimals(calculations.monthlyFee)}</span>
                </div>

                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-400 flex items-center gap-1.5">
                    Monthly Insurance Premium
                    <span className="relative group" onMouseEnter={() => setActiveTooltip("insurance")} onMouseLeave={() => setActiveTooltip(null)}>
                      <InfoIcon />
                      {activeTooltip === "insurance" && (
                        <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-xs text-slate-300 rounded-lg border border-slate-800 shadow-xl z-10 leading-normal">
                          0.08% of loan amount per month for comprehensive protection.
                        </span>
                      )}
                    </span>
                  </span>
                  <span className={`font-semibold transition-colors duration-200 ${includeInsurance ? "text-white" : "text-slate-500 line-through"}`}>
                    {formatCurrencyDecimals(calculations.monthlyInsurancePremium)}
                  </span>
                </div>

                <div className="border-t border-slate-800/80 pt-4 space-y-3">
                  <div className="flex justify-between items-center text-xs text-slate-500">
                    <span>Total Cost of Credit (No Insurance)</span>
                    <span>{formatCurrency(calculations.totalCostWithoutInsurance)}</span>
                  </div>
                  <div className="flex justify-between items-center text-sm font-bold text-white">
                    <span className="flex items-center gap-1.5">
                      Total Cost of Credit
                      <span className="relative group" onMouseEnter={() => setActiveTooltip("totalCost")} onMouseLeave={() => setActiveTooltip(null)}>
                        <InfoIcon />
                        {activeTooltip === "totalCost" && (
                          <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 w-48 p-2 bg-slate-950 text-xs text-slate-300 rounded-lg border border-slate-800 shadow-xl z-10 leading-normal">
                            The total amount of interest, handling fees, and insurance premiums you will pay over the life of the loan.
                          </span>
                        )}
                      </span>
                    </span>
                    <span className="text-indigo-400">
                      {formatCurrency(includeInsurance ? calculations.totalCostWithInsurance : calculations.totalCostWithoutInsurance)}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              type="submit"
              className="w-full py-4 px-6 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-2xl shadow-lg shadow-indigo-500/20 hover:shadow-indigo-500/30 transition-all duration-200 flex items-center justify-center gap-2 group"
            >
              Proceed with Selection
              <span className="transform group-hover:translate-x-1 transition-transform duration-200">
                <ArrowRightIcon />
              </span>
            </button>
          </div>
        </form>
      )}
    </div>
  );
}