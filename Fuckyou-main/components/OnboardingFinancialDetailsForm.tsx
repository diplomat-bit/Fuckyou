import React, { useState, useMemo } from "react";
import {
  DollarSign,
  TrendingUp,
  Car,
  Plane,
  Briefcase,
  Calendar,
  ChevronRight,
  ChevronLeft,
  CheckCircle2,
  AlertCircle,
  Info,
  Coins,
  Wallet,
  ArrowRight,
  ShieldCheck,
  Sparkles,
  Compass,
  Activity
} from "lucide-react";

// Types & Interfaces
interface FinancialDetails {
  fixedIncome: number;
  fixedCurrency: string;
  fixedFrequency: "monthly" | "annually";
  variableIncome: number;
  variableCurrency: string;
  variableFrequency: "monthly" | "annually";
  
  rentMortgage: number;
  utilities: number;
  groceries: number;
  lifestyle: number;
  debtRepayments: number;
  
  ownsCar: boolean;
  carBrand: string;
  carYear: string;
  carEstimatedValue: number;
  
  traveledAbroad: boolean;
  travelDestination: string;
  travelYear: string;
  travelPurpose: "leisure" | "business" | "education" | "other";
}

interface OnboardingFinancialDetailsFormProps {
  onSubmit?: (data: FinancialDetails) => void;
  onBack?: () => void;
  initialData?: Partial<FinancialDetails>;
}

const CURRENCIES = [
  { code: "USD", symbol: "$", label: "US Dollar" },
  { code: "EUR", symbol: "€", label: "Euro" },
  { code: "GBP", symbol: "£", label: "British Pound" },
  { code: "JPY", symbol: "¥", label: "Japanese Yen" },
  { code: "AUD", symbol: "A$", label: "Australian Dollar" },
  { code: "CAD", symbol: "C$", label: "Canadian Dollar" },
];

const CAR_BRANDS = [
  "Tesla", "BMW", "Mercedes-Benz", "Audi", "Porsche", "Lexus", 
  "Toyota", "Honda", "Ford", "Hyundai", "Kia", "Land Rover", "Other"
];

const TRAVEL_PURPOSES = [
  { value: "leisure", label: "Leisure & Vacation" },
  { value: "business", label: "Business & Networking" },
  { value: "education", label: "Education & Training" },
  { value: "other", label: "Other" }
];

export default function OnboardingFinancialDetailsForm({
  onSubmit,
  onBack,
  initialData
}: OnboardingFinancialDetailsFormProps) {
  // Form Steps: 0 = Income, 1 = Expenses, 2 = Surrogate Wealth, 3 = Review & Submit
  const [step, setStep] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Form State
  const [formData, setFormData] = useState<FinancialDetails>({
    fixedIncome: initialData?.fixedIncome ?? 5000,
    fixedCurrency: initialData?.fixedCurrency ?? "USD",
    fixedFrequency: initialData?.fixedFrequency ?? "monthly",
    variableIncome: initialData?.variableIncome ?? 1200,
    variableCurrency: initialData?.variableCurrency ?? "USD",
    variableFrequency: initialData?.variableFrequency ?? "monthly",
    
    rentMortgage: initialData?.rentMortgage ?? 1500,
    utilities: initialData?.utilities ?? 300,
    groceries: initialData?.groceries ?? 450,
    lifestyle: initialData?.lifestyle ?? 600,
    debtRepayments: initialData?.debtRepayments ?? 200,
    
    ownsCar: initialData?.ownsCar ?? false,
    carBrand: initialData?.carBrand ?? "",
    carYear: initialData?.carYear ?? "",
    carEstimatedValue: initialData?.carEstimatedValue ?? 0,
    
    traveledAbroad: initialData?.traveledAbroad ?? false,
    travelDestination: initialData?.travelDestination ?? "",
    travelYear: initialData?.travelYear ?? "",
    travelPurpose: initialData?.travelPurpose ?? "leisure",
  });

  // Validation Errors State
  const [errors, setErrors] = useState<Record<string, string>>({});

  // Calculations
  const totals = useMemo(() => {
    const fixedMonthly = formData.fixedFrequency === "annually" ? formData.fixedIncome / 12 : formData.fixedIncome;
    const variableMonthly = formData.variableFrequency === "annually" ? formData.variableIncome / 12 : formData.variableIncome;
    const totalMonthlyIncome = fixedMonthly + variableMonthly;
    
    const totalMonthlyExpenses = 
      Number(formData.rentMortgage) + 
      Number(formData.utilities) + 
      Number(formData.groceries) + 
      Number(formData.lifestyle) + 
      Number(formData.debtRepayments);
      
    const netMonthlySavings = totalMonthlyIncome - totalMonthlyExpenses;
    const savingsRate = totalMonthlyIncome > 0 ? (netMonthlySavings / totalMonthlyIncome) * 100 : 0;

    return {
      totalMonthlyIncome,
      totalMonthlyExpenses,
      netMonthlySavings,
      savingsRate
    };
  }, [formData]);

  // Handle Input Changes
  const handleChange = (field: keyof FinancialDetails, value: any) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors((prev) => {
        const updated = { ...prev };
        delete updated[field];
        return updated;
      });
    }
  };

  // Step Validation
  const validateStep = (currentStep: number): boolean => {
    const newErrors: Record<string, string> = {};

    if (currentStep === 0) {
      if (formData.fixedIncome < 0) newErrors.fixedIncome = "Income cannot be negative";
      if (formData.variableIncome < 0) newErrors.variableIncome = "Variable income cannot be negative";
    } else if (currentStep === 1) {
      if (formData.rentMortgage < 0) newErrors.rentMortgage = "Cannot be negative";
      if (formData.utilities < 0) newErrors.utilities = "Cannot be negative";
      if (formData.groceries < 0) newErrors.groceries = "Cannot be negative";
      if (formData.lifestyle < 0) newErrors.lifestyle = "Cannot be negative";
      if (formData.debtRepayments < 0) newErrors.debtRepayments = "Cannot be negative";
    } else if (currentStep === 2) {
      if (formData.ownsCar) {
        if (!formData.carBrand) newErrors.carBrand = "Please select a car brand";
        if (!formData.carYear) newErrors.carYear = "Please enter manufacture year";
        const yearNum = parseInt(formData.carYear);
        if (isNaN(yearNum) || yearNum < 1900 || yearNum > new Date().getFullYear() + 1) {
          newErrors.carYear = "Please enter a valid year";
        }
      }
      if (formData.traveledAbroad) {
        if (!formData.travelDestination.trim()) newErrors.travelDestination = "Please enter destination";
        if (!formData.travelYear) newErrors.travelYear = "Please enter travel year";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep(step)) {
      setStep((prev) => prev + 1);
    }
  };

  const handlePrev = () => {
    setStep((prev) => Math.max(0, prev - 1));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateStep(step)) return;

    setIsSubmitting(true);
    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500));
    setIsSubmitting(false);
    setIsSuccess(true);
    if (onSubmit) {
      onSubmit(formData);
    }
  };

  const stepsConfig = [
    { title: "Income Details", desc: "Your revenue streams" },
    { title: "Monthly Expenses", desc: "Your regular outgoings" },
    { title: "Surrogate Wealth", desc: "Lifestyle indicators" },
    { title: "Review & Verify", desc: "Confirm your profile" }
  ];

  return (
    <div className="w-full max-w-4xl mx-auto bg-slate-900 text-slate-100 rounded-3xl shadow-2xl border border-slate-800 overflow-hidden transition-all duration-300">
      {/* Header Banner */}
      <div className="relative bg-gradient-to-r from-indigo-600 via-purple-600 to-pink-600 p-8 text-white overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-transparent via-black/10 to-black/40 pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <span className="px-3 py-1 text-xs font-semibold tracking-wider uppercase bg-white/20 rounded-full backdrop-blur-md">
              Step {step + 1} of {stepsConfig.length}
            </span>
            <h1 className="text-3xl font-extrabold tracking-tight mt-2">
              Financial Profile
            </h1>
            <p className="text-indigo-100 text-sm mt-1 max-w-md">
              Help us tailor your premium experience by securely analyzing your financial ecosystem.
            </p>
          </div>
          <div className="flex items-center gap-3 bg-black/20 backdrop-blur-md p-3 rounded-2xl border border-white/10">
            <ShieldCheck className="w-8 h-8 text-emerald-400 shrink-0" />
            <div className="text-xs">
              <p className="font-semibold text-white">Bank-Grade Security</p>
              <p className="text-slate-300">256-bit SSL Encryption</p>
            </div>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="relative mt-8 h-2 w-full bg-white/10 rounded-full overflow-hidden">
          <div
            className="absolute top-0 left-0 h-full bg-gradient-to-r from-emerald-400 to-teal-300 transition-all duration-500 ease-out"
            style={{ width: `${((step + 1) / stepsConfig.length) * 100}%` }}
          />
        </div>

        {/* Step Indicators */}
        <div className="grid grid-cols-4 gap-2 mt-4 text-center text-xs font-medium">
          {stepsConfig.map((s, idx) => (
            <div
              key={idx}
              className={`transition-all duration-300 ${
                idx <= step ? "text-white font-semibold" : "text-white/40"
              }`}
            >
              <span className="hidden md:inline">{s.title}</span>
              <span className="md:hidden">Step {idx + 1}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Main Form Body */}
      <div className="p-6 md:p-10">
        {isSuccess ? (
          <div className="text-center py-12 px-4 animate-fade-in">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-emerald-500/10 text-emerald-400 mb-6 border border-emerald-500/20">
              <CheckCircle2 className="w-10 h-10" />
            </div>
            <h2 className="text-2xl font-bold text-white mb-2">Financial Profile Verified!</h2>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
              Your financial details have been securely processed. We have customized your investment limits and premium tier access.
            </p>
            <div className="bg-slate-800/50 border border-slate-700/50 rounded-2xl p-6 max-w-lg mx-auto text-left mb-8">
              <h3 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-indigo-400" /> Calculated Insights
              </h3>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-xs text-slate-500">Est. Monthly Savings</p>
                  <p className="text-lg font-bold text-emerald-400">
                    {formData.fixedCurrency} {totals.netMonthlySavings.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  </p>
                </div>
                <div>
                  <p className="text-xs text-slate-500">Savings Rate</p>
                  <p className="text-lg font-bold text-indigo-400">
                    {totals.savingsRate.toFixed(1)}%
                  </p>
                </div>
              </div>
            </div>
            <button
              onClick={() => {
                setIsSuccess(false);
                setStep(0);
              }}
              className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20"
            >
              Restart Onboarding
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* STEP 1: INCOME DETAILS */}
            {step === 0 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                    <Coins className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Income Streams</h2>
                    <p className="text-xs text-slate-400">Provide your primary and secondary sources of income.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Fixed Income Card */}
                  <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-slate-300">Fixed / Base Income</label>
                      <span className="text-xs text-indigo-400 font-semibold flex items-center gap-1">
                        <Wallet className="w-3.5 h-3.5" /> Guaranteed
                      </span>
                    </div>
                    
                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">
                          {CURRENCIES.find(c => c.code === formData.fixedCurrency)?.symbol || "$"}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.fixedIncome || ""}
                        onChange={(e) => handleChange("fixedIncome", Number(e.target.value))}
                        className="block w-full pl-8 pr-12 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <select
                          value={formData.fixedCurrency}
                          onChange={(e) => handleChange("fixedCurrency", e.target.value)}
                          className="bg-transparent text-slate-400 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                              {c.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {errors.fixedIncome && (
                      <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.fixedIncome}</p>
                    )}

                    {/* Frequency Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleChange("fixedFrequency", "monthly")}
                        className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.fixedFrequency === "monthly"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("fixedFrequency", "annually")}
                        className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.fixedFrequency === "annually"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Annually
                      </button>
                    </div>
                  </div>

                  {/* Variable Income Card */}
                  <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-4 hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-center">
                      <label className="block text-sm font-medium text-slate-300">Variable / Bonus Income</label>
                      <span className="text-xs text-purple-400 font-semibold flex items-center gap-1">
                        <TrendingUp className="w-3.5 h-3.5" /> Performance
                      </span>
                    </div>

                    <div className="relative">
                      <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                        <span className="text-slate-500 font-medium">
                          {CURRENCIES.find(c => c.code === formData.variableCurrency)?.symbol || "$"}
                        </span>
                      </div>
                      <input
                        type="number"
                        value={formData.variableIncome || ""}
                        onChange={(e) => handleChange("variableIncome", Number(e.target.value))}
                        className="block w-full pl-8 pr-12 py-3 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-all"
                        placeholder="0.00"
                      />
                      <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
                        <select
                          value={formData.variableCurrency}
                          onChange={(e) => handleChange("variableCurrency", e.target.value)}
                          className="bg-transparent text-slate-400 text-xs font-semibold focus:outline-none cursor-pointer"
                        >
                          {CURRENCIES.map((c) => (
                            <option key={c.code} value={c.code} className="bg-slate-900 text-white">
                              {c.code}
                            </option>
                          ))}
                        </select>
                      </div>
                    </div>
                    {errors.variableIncome && (
                      <p className="text-xs text-rose-400 flex items-center gap-1"><AlertCircle className="w-3 h-3" /> {errors.variableIncome}</p>
                    )}

                    {/* Frequency Toggle */}
                    <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900/60 rounded-lg border border-slate-800">
                      <button
                        type="button"
                        onClick={() => handleChange("variableFrequency", "monthly")}
                        className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.variableFrequency === "monthly"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Monthly
                      </button>
                      <button
                        type="button"
                        onClick={() => handleChange("variableFrequency", "annually")}
                        className={`py-1.5 text-xs font-medium rounded-md transition-all ${
                          formData.variableFrequency === "annually"
                            ? "bg-indigo-600 text-white shadow-sm"
                            : "text-slate-400 hover:text-slate-200"
                        }`}
                      >
                        Annually
                      </button>
                    </div>
                  </div>
                </div>

                {/* Quick Summary Banner */}
                <div className="bg-indigo-950/30 border border-indigo-500/20 rounded-2xl p-4 flex items-start gap-3">
                  <Info className="w-5 h-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="text-xs text-indigo-200">
                    <p className="font-semibold">Why we ask for this</p>
                    <p className="mt-0.5 text-slate-400">
                      Your total monthly income helps us determine your debt-to-income ratio and unlock premium investment products tailored to your cash flow.
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 2: EXPENSES DETAILS */}
            {step === 1 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
                    <DollarSign className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Monthly Expenses</h2>
                    <p className="text-xs text-slate-400">Estimate your average monthly outgoings across key categories.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Left Column: Inputs */}
                  <div className="space-y-4">
                    {/* Rent / Mortgage */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-slate-400">Rent / Mortgage</label>
                        <span className="text-xs text-slate-300 font-semibold">${formData.rentMortgage}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="50"
                        value={formData.rentMortgage}
                        onChange={(e) => handleChange("rentMortgage", Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Utilities */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-slate-400">Utilities & Bills</label>
                        <span className="text-xs text-slate-300 font-semibold">${formData.utilities}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="20"
                        value={formData.utilities}
                        onChange={(e) => handleChange("utilities", Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Groceries */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-slate-400">Groceries & Food</label>
                        <span className="text-xs text-slate-300 font-semibold">${formData.groceries}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1500"
                        step="50"
                        value={formData.groceries}
                        onChange={(e) => handleChange("groceries", Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Lifestyle */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-slate-400">Lifestyle & Entertainment</label>
                        <span className="text-xs text-slate-300 font-semibold">${formData.lifestyle}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={formData.lifestyle}
                        onChange={(e) => handleChange("lifestyle", Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>

                    {/* Debt Repayments */}
                    <div>
                      <div className="flex justify-between mb-1">
                        <label className="text-xs font-medium text-slate-400">Debt & Loan Repayments</label>
                        <span className="text-xs text-slate-300 font-semibold">${formData.debtRepayments}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="2000"
                        step="50"
                        value={formData.debtRepayments}
                        onChange={(e) => handleChange("debtRepayments", Number(e.target.value))}
                        className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  </div>

                  {/* Right Column: Visualizer Card */}
                  <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-300 mb-4">Expense Breakdown</h3>
                      <div className="space-y-3">
                        {[
                          { label: "Housing", val: formData.rentMortgage, color: "bg-indigo-500" },
                          { label: "Utilities", val: formData.utilities, color: "bg-sky-500" },
                          { label: "Groceries", val: formData.groceries, color: "bg-emerald-500" },
                          { label: "Lifestyle", val: formData.lifestyle, color: "bg-pink-500" },
                          { label: "Debt", val: formData.debtRepayments, color: "bg-amber-500" },
                        ].map((item, idx) => {
                          const pct = totals.totalMonthlyExpenses > 0 ? (item.val / totals.totalMonthlyExpenses) * 100 : 0;
                          return (
                            <div key={idx} className="space-y-1">
                              <div className="flex justify-between text-xs">
                                <span className="text-slate-400">{item.label}</span>
                                <span className="text-slate-300 font-medium">{pct.toFixed(0)}%</span>
                              </div>
                              <div className="w-full h-1.5 bg-slate-900 rounded-full overflow-hidden">
                                <div className={`h-full ${item.color}`} style={{ width: `${pct}%` }} />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>

                    <div className="border-t border-slate-800 pt-4 mt-6">
                      <div className="flex justify-between items-center">
                        <div>
                          <p className="text-xs text-slate-500">Total Monthly Expenses</p>
                          <p className="text-2xl font-bold text-white">
                            ${totals.totalMonthlyExpenses.toLocaleString()}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-xs text-slate-500">Net Savings</p>
                          <p className={`text-lg font-bold ${totals.netMonthlySavings >= 0 ? "text-emerald-400" : "text-rose-400"}`}>
                            ${totals.netMonthlySavings.toLocaleString()}
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* STEP 3: SURROGATE WEALTH */}
            {step === 2 && (
              <div className="space-y-8 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                    <Sparkles className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Surrogate Wealth Indicators</h2>
                    <p className="text-xs text-slate-400">Alternative indicators to help verify creditworthiness and lifestyle tier.</p>
                  </div>
                </div>

                {/* Car Ownership Section */}
                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-500/10 text-indigo-400 rounded-lg">
                        <Car className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Vehicle Ownership</h3>
                        <p className="text-xs text-slate-400">Do you own a registered motor vehicle?</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.ownsCar}
                        onChange={(e) => handleChange("ownsCar", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {formData.ownsCar && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/60 animate-fade-in">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Car Brand</label>
                        <select
                          value={formData.carBrand}
                          onChange={(e) => handleChange("carBrand", e.target.value)}
                          className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          <option value="">Select Brand</option>
                          {CAR_BRANDS.map((brand) => (
                            <option key={brand} value={brand}>{brand}</option>
                          ))}
                        </select>
                        {errors.carBrand && <p className="text-xs text-rose-400 mt-1">{errors.carBrand}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Manufacture Year</label>
                        <input
                          type="number"
                          placeholder="e.g. 2021"
                          value={formData.carYear}
                          onChange={(e) => handleChange("carYear", e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.carYear && <p className="text-xs text-rose-400 mt-1">{errors.carYear}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Estimated Value (USD)</label>
                        <input
                          type="number"
                          placeholder="e.g. 35000"
                          value={formData.carEstimatedValue || ""}
                          onChange={(e) => handleChange("carEstimatedValue", Number(e.target.value))}
                          className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Travel Section */}
                <div className="bg-slate-800/40 border border-slate-800 rounded-2xl p-6 space-y-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-pink-500/10 text-pink-400 rounded-lg">
                        <Plane className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-semibold text-white">Recent International Travel</h3>
                        <p className="text-xs text-slate-400">Have you traveled abroad in the last 24 months?</p>
                      </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                      <input
                        type="checkbox"
                        checked={formData.traveledAbroad}
                        onChange={(e) => handleChange("traveledAbroad", e.target.checked)}
                        className="sr-only peer"
                      />
                      <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-slate-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                    </label>
                  </div>

                  {formData.traveledAbroad && (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800/60 animate-fade-in">
                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Most Recent Destination</label>
                        <input
                          type="text"
                          placeholder="e.g. France, Japan"
                          value={formData.travelDestination}
                          onChange={(e) => handleChange("travelDestination", e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.travelDestination && <p className="text-xs text-rose-400 mt-1">{errors.travelDestination}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Year of Travel</label>
                        <input
                          type="number"
                          placeholder="e.g. 2023"
                          value={formData.travelYear}
                          onChange={(e) => handleChange("travelYear", e.target.value)}
                          className="block w-full px-3 py-2 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        />
                        {errors.travelYear && <p className="text-xs text-rose-400 mt-1">{errors.travelYear}</p>}
                      </div>

                      <div>
                        <label className="block text-xs font-medium text-slate-400 mb-1">Primary Purpose</label>
                        <select
                          value={formData.travelPurpose}
                          onChange={(e) => handleChange("travelPurpose", e.target.value)}
                          className="block w-full px-3 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
                        >
                          {TRAVEL_PURPOSES.map((p) => (
                            <option key={p.value} value={p.value}>{p.label}</option>
                          ))}
                        </select>
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}

            {/* STEP 4: REVIEW & SUBMIT */}
            {step === 3 && (
              <div className="space-y-6 animate-fade-in">
                <div className="flex items-center gap-3 border-b border-slate-800 pb-4">
                  <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-lg">
                    <ShieldCheck className="w-6 h-6" />
                  </div>
                  <div>
                    <h2 className="text-xl font-semibold text-white">Review Financial Profile</h2>
                    <p className="text-xs text-slate-400">Please verify all details before submitting for verification.</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  {/* Income Summary */}
                  <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-indigo-400 font-semibold text-sm">
                      <Coins className="w-4 h-4" /> Income Summary
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Fixed Income:</span>
                        <span className="text-white font-medium">
                          {formData.fixedCurrency} {formData.fixedIncome.toLocaleString()} ({formData.fixedFrequency})
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Variable Income:</span>
                        <span className="text-white font-medium">
                          {formData.variableCurrency} {formData.variableIncome.toLocaleString()} ({formData.variableFrequency})
                        </span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between font-semibold text-slate-200">
                        <span>Est. Monthly Total:</span>
                        <span>${totals.totalMonthlyIncome.toLocaleString(undefined, { maximumFractionDigits: 0 })}</span>
                      </div>
                    </div>
                  </div>

                  {/* Expenses Summary */}
                  <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-pink-400 font-semibold text-sm">
                      <Wallet className="w-4 h-4" /> Expenses Summary
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Housing:</span>
                        <span className="text-white font-medium">${formData.rentMortgage}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Lifestyle & Bills:</span>
                        <span className="text-white font-medium">${formData.lifestyle + formData.utilities}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between font-semibold text-slate-200">
                        <span>Est. Monthly Total:</span>
                        <span>${totals.totalMonthlyExpenses.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                  {/* Surrogate Wealth Summary */}
                  <div className="bg-slate-800/30 border border-slate-800 rounded-2xl p-5 space-y-3">
                    <div className="flex items-center gap-2 text-purple-400 font-semibold text-sm">
                      <Sparkles className="w-4 h-4" /> Lifestyle Indicators
                    </div>
                    <div className="space-y-2 text-xs">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Owns Vehicle:</span>
                        <span className="text-white font-medium">{formData.ownsCar ? `Yes (${formData.carBrand})` : "No"}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Recent Travel:</span>
                        <span className="text-white font-medium">{formData.traveledAbroad ? `Yes (${formData.travelDestination})` : "No"}</span>
                      </div>
                      <div className="border-t border-slate-800 pt-2 flex justify-between font-semibold text-slate-200">
                        <span>Profile Tier:</span>
                        <span className="text-indigo-400">Premium Candidate</span>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Consent & Verification Checkbox */}
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 flex items-start gap-3">
                  <input
                    type="checkbox"
                    id="consent"
                    required
                    className="mt-1 rounded border-slate-700 bg-slate-800 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-900"
                  />
                  <label htmlFor="consent" className="text-xs text-slate-400 leading-relaxed">
                    I declare that the financial information provided is accurate and complete to the best of my knowledge. I understand this information is used solely for onboarding verification and premium tier customization.
                  </label>
                </div>
              </div>
            )}

            {/* Navigation Buttons */}
            <div className="flex items-center justify-between pt-6 border-t border-slate-800">
              <button
                type="button"
                onClick={step === 0 ? onBack : handlePrev}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-slate-400 hover:text-white transition-colors"
              >
                <ChevronLeft className="w-4 h-4" /> Back
              </button>

              {step < 3 ? (
                <button
                  type="button"
                  onClick={handleNext}
                  className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white font-semibold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20"
                >
                  Continue <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex items-center gap-2 px-8 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold rounded-xl transition-all duration-200 shadow-lg shadow-indigo-600/20 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isSubmitting ? (
                    <>
                      <Activity className="w-4 h-4 animate-spin" /> Verifying...
                    </>
                  ) : (
                    <>
                      Submit Profile <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>
              )}
            </div>
          </form>
        )}
      </div>
    </div>
  );
}