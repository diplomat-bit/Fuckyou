import React, { useState, useMemo, useEffect, useCallback } from 'react';
import {
  CreditCard,
  BookOpen,
  ShieldCheck,
  Sparkles,
  DollarSign,
  AlertCircle,
  CheckCircle2,
  ArrowRight,
  RefreshCw,
  Sliders,
  HelpCircle,
  Send,
  Info,
  Lock,
  Settings2,
  ChevronDown,
  Building,
  Check,
  Zap,
  TrendingDown,
  Wallet
} from 'lucide-react';

export interface ReadyCreditConfig {
  requestedLimit: number;
  interestRate: number;
  tenureMonths: number;
  purpose: string;
  autoRepaymentType: 'minimum' | 'full' | 'fixed_percentage';
  fixedPercentageValue?: number;
  linkedSettlementAccount: string;
  
  // ATM Card Configuration
  requiresAtmCard: boolean;
  atmConfig: {
    cardType: 'virtual_and_physical' | 'physical_only' | 'virtual_only';
    embossedName: string;
    dailyAtmWithdrawalLimit: number;
    dailyPosLimit: number;
    overseasUsageEnabled: boolean;
    contactlessPayment: boolean;
    cardDesignId: string;
    deliveryAddressType: 'registered' | 'alternate';
    alternateAddress?: string;
  };

  // Cheque Book Configuration
  requiresChequeBook: boolean;
  chequeConfig: {
    numberOfBooks: number;
    leavesPerBook: 25 | 50 | 100;
    personalizedName: string;
    bearerCrossedByDefault: boolean;
    urgentDispatch: boolean;
    dispatchNotificationSms: boolean;
    specialInstructions?: string;
  };

  // Autonomous Agent Preferences
  aiAutoTuningEnabled: boolean;
  aiRiskTolerance: 'conservative' | 'balanced' | 'aggressive';
}

export interface ReadyCreditProductFormProps {
  initialData?: Partial<ReadyCreditConfig>;
  customerProfile?: {
    id: string;
    fullName: string;
    monthlyIncome: number;
    riskScore: number;
    existingAccounts: Array<{ id: string; label: string; balance: number }>;
  };
  onSubmit?: (data: ReadyCreditConfig) => void | Promise<void>;
  onAgentRecommendationApply?: (agentSuggestion: Partial<ReadyCreditConfig>) => void;
  readOnly?: boolean;
}

const DEFAULT_ACCOUNTS = [
  { id: 'acc_01_checking', label: 'Premier Multi-Currency Checking (...8821)', balance: 42500 },
  { id: 'acc_02_wealth', label: 'Treasury High-Yield Reserve (...3109)', balance: 128900 },
  { id: 'acc_03_operating', label: 'Direct Operating Cash Hub (...9044)', balance: 14200 }
];

const CARD_DESIGNS = [
  { id: 'obsidian_metal', name: 'Obsidian Matte Metal', color: 'from-zinc-900 via-slate-900 to-black', border: 'border-zinc-700' },
  { id: 'aurora_emerald', name: 'Aurora Prime Emerald', color: 'from-emerald-950 via-teal-900 to-slate-900', border: 'border-emerald-700/50' },
  { id: 'titanium_silver', name: 'Brushed Titanium Silver', color: 'from-slate-700 via-zinc-800 to-neutral-900', border: 'border-slate-500/50' }
];

export const ReadyCreditProductForm: React.FC<ReadyCreditProductFormProps> = ({
  initialData,
  customerProfile = {
    id: 'cust_tier1_9942',
    fullName: 'Alexander Vance',
    monthlyIncome: 18500,
    riskScore: 785,
    existingAccounts: DEFAULT_ACCOUNTS
  },
  onSubmit,
  onAgentRecommendationApply,
  readOnly = false
}) => {
  // Form State
  const [formData, setFormData] = useState<ReadyCreditConfig>({
    requestedLimit: initialData?.requestedLimit ?? 25000,
    interestRate: initialData?.interestRate ?? 8.99,
    tenureMonths: initialData?.tenureMonths ?? 36,
    purpose: initialData?.purpose ?? 'Working Capital & Liquidity Buffer',
    autoRepaymentType: initialData?.autoRepaymentType ?? 'minimum',
    fixedPercentageValue: initialData?.fixedPercentageValue ?? 10,
    linkedSettlementAccount: initialData?.linkedSettlementAccount ?? customerProfile.existingAccounts[0]?.id ?? '',
    requiresAtmCard: initialData?.requiresAtmCard ?? true,
    atmConfig: {
      cardType: initialData?.atmConfig?.cardType ?? 'virtual_and_physical',
      embossedName: initialData?.atmConfig?.embossedName ?? customerProfile.fullName.toUpperCase(),
      dailyAtmWithdrawalLimit: initialData?.atmConfig?.dailyAtmWithdrawalLimit ?? 3000,
      dailyPosLimit: initialData?.atmConfig?.dailyPosLimit ?? 10000,
      overseasUsageEnabled: initialData?.atmConfig?.overseasUsageEnabled ?? true,
      contactlessPayment: initialData?.atmConfig?.contactlessPayment ?? true,
      cardDesignId: initialData?.atmConfig?.cardDesignId ?? 'obsidian_metal',
      deliveryAddressType: initialData?.atmConfig?.deliveryAddressType ?? 'registered',
      alternateAddress: initialData?.atmConfig?.alternateAddress ?? ''
    },
    requiresChequeBook: initialData?.requiresChequeBook ?? true,
    chequeConfig: {
      numberOfBooks: initialData?.chequeConfig?.numberOfBooks ?? 2,
      leavesPerBook: initialData?.chequeConfig?.leavesPerBook ?? 50,
      personalizedName: initialData?.chequeConfig?.personalizedName ?? customerProfile.fullName,
      bearerCrossedByDefault: initialData?.chequeConfig?.bearerCrossedByDefault ?? true,
      urgentDispatch: initialData?.chequeConfig?.urgentDispatch ?? false,
      dispatchNotificationSms: initialData?.chequeConfig?.dispatchNotificationSms ?? true,
      specialInstructions: initialData?.chequeConfig?.specialInstructions ?? ''
    },
    aiAutoTuningEnabled: initialData?.aiAutoTuningEnabled ?? true,
    aiRiskTolerance: initialData?.aiRiskTolerance ?? 'balanced'
  });

  // UI state
  const [activeTab, setActiveTab] = useState<'credit' | 'atm' | 'cheque' | 'agent'>('credit');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [agentThinking, setAgentThinking] = useState(false);
  const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
  const [aiInsightBanner, setAiInsightBanner] = useState<string | null>(
    'AI Autonomous Credit Model suggests raising daily POS to $15,000 for emergency liquidity based on recent cash outflow analysis.'
  );

  // Computed Values
  const maxAllowableLimit = useMemo(() => {
    return Math.round((customerProfile.monthlyIncome * 4.5) / 1000) * 1000;
  }, [customerProfile.monthlyIncome]);

  const estimatedMinRepayment = useMemo(() => {
    const monthlyInterest = (formData.requestedLimit * (formData.interestRate / 100)) / 12;
    const principalPortion = formData.requestedLimit * 0.015; // standard 1.5%
    return Math.max(50, Math.round(monthlyInterest + principalPortion));
  }, [formData.requestedLimit, formData.interestRate]);

  // Validation
  const validateForm = useCallback((): boolean => {
    const errors: Record<string, string> = {};

    if (formData.requestedLimit < 1000) {
      errors.requestedLimit = 'Minimum credit line is $1,000.';
    } else if (formData.requestedLimit > maxAllowableLimit * 1.5) {
      errors.requestedLimit = `Limit exceeds maximum ceiling threshold of $${(maxAllowableLimit * 1.5).toLocaleString()}.`;
    }

    if (formData.requiresAtmCard) {
      if (!formData.atmConfig.embossedName.trim()) {
        errors.embossedName = 'Embossed name is required for ATM card generation.';
      } else if (formData.atmConfig.embossedName.length > 26) {
        errors.embossedName = 'Embossed name cannot exceed 26 characters.';
      }

      if (formData.atmConfig.dailyAtmWithdrawalLimit > formData.requestedLimit) {
        errors.dailyAtmWithdrawalLimit = 'ATM daily limit cannot exceed total assigned credit line.';
      }
    }

    if (formData.requiresChequeBook) {
      if (!formData.chequeConfig.personalizedName.trim()) {
        errors.chequePersonalizedName = 'Cheque bearer/account title is mandatory.';
      }
      if (formData.chequeConfig.numberOfBooks < 1 || formData.chequeConfig.numberOfBooks > 10) {
        errors.numberOfBooks = 'Select between 1 and 10 cheque books.';
      }
    }

    setValidationErrors(errors);
    return Object.keys(errors).length === 0;
  }, [formData, maxAllowableLimit]);

  // Trigger Autonomous Agent Optimization
  const handleRunAiAgentOptimization = () => {
    setAgentThinking(true);
    setTimeout(() => {
      const optimalLimit = Math.min(maxAllowableLimit, 35000);
      const updatedAtm = {
        ...formData.atmConfig,
        dailyAtmWithdrawalLimit: 4000,
        dailyPosLimit: 12000,
        contactlessPayment: true
      };
      const updatedCheque = {
        ...formData.chequeConfig,
        numberOfBooks: 2,
        leavesPerBook: 50 as const,
        bearerCrossedByDefault: true
      };

      setFormData(prev => ({
        ...prev,
        requestedLimit: optimalLimit,
        interestRate: 7.85, // Discounter preferred rate
        atmConfig: updatedAtm,
        chequeConfig: updatedCheque
      }));

      setAiInsightBanner(
        'Autonomous Agent optimized interest rate from 8.99% to 7.85% (Prime Tier Tier-1 Discount) and balanced daily limits for optimal solvency.'
      );
      setAgentThinking(false);

      if (onAgentRecommendationApply) {
        onAgentRecommendationApply({
          requestedLimit: optimalLimit,
          interestRate: 7.85,
          atmConfig: updatedAtm,
          chequeConfig: updatedCheque
        });
      }
    }, 1100);
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsSubmitting(true);
    try {
      if (onSubmit) {
        await onSubmit(formData);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="w-full max-w-5xl mx-auto bg-slate-950 border border-slate-800 text-slate-100 rounded-2xl shadow-2xl overflow-hidden font-sans">
      {/* Header bar with Autonomous AI Agent indicator */}
      <div className="border-b border-slate-800 bg-gradient-to-r from-slate-900 via-slate-900/90 to-indigo-950/40 p-6">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-3 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400">
              <Zap className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Ready Credit Facility Builder</h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                  Instant Liquidity
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Configure credit limits, ATM card issuing, and personalized cheque facilities.
              </p>
            </div>
          </div>

          {/* Autonomous Agent quick action badge */}
          <button
            type="button"
            onClick={handleRunAiAgentOptimization}
            disabled={agentThinking || readOnly}
            className="flex items-center gap-2 px-4 py-2 bg-indigo-950/60 hover:bg-indigo-900/60 border border-indigo-500/40 text-indigo-200 rounded-xl text-xs font-medium transition-all duration-200 hover:shadow-indigo-500/10 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed group"
          >
            {agentThinking ? (
              <RefreshCw className="w-4 h-4 animate-spin text-indigo-400" />
            ) : (
              <Sparkles className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" />
            )}
            <span>{agentThinking ? 'Optimizing Liquidity...' : 'Autonomous Agent AI Tune'}</span>
          </button>
        </div>

        {/* AI Notification Banner if available */}
        {aiInsightBanner && (
          <div className="mt-4 p-3 rounded-xl bg-indigo-900/30 border border-indigo-500/30 flex items-start gap-3 text-xs text-indigo-200 animate-fadeIn">
            <Sparkles className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
            <div className="flex-1 leading-relaxed">{aiInsightBanner}</div>
            <button
              onClick={() => setAiInsightBanner(null)}
              className="text-slate-400 hover:text-white text-xs font-mono ml-2"
            >
              ✕
            </button>
          </div>
        )}

        {/* Navigation Tabs */}
        <div className="flex items-center gap-2 mt-6 overflow-x-auto pb-1 no-scrollbar border-b border-slate-800/80">
          {[
            { id: 'credit', label: '1. Credit Line & Rate', icon: DollarSign },
            { id: 'atm', label: '2. ATM / Debit Card', icon: CreditCard },
            { id: 'cheque', label: '3. Cheque Book Facility', icon: BookOpen },
            { id: 'agent', label: '4. Autonomous Rules', icon: Settings2 }
          ].map(tab => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id as any)}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-lg text-sm font-medium transition-all whitespace-nowrap ${
                  isActive
                    ? 'bg-indigo-600/20 text-indigo-300 border border-indigo-500/40 shadow-inner'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
                }`}
              >
                <Icon className={`w-4 h-4 ${isActive ? 'text-indigo-400' : 'text-slate-500'}`} />
                <span>{tab.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      <form onSubmit={handleFormSubmit}>
        <div className="p-6 space-y-8">
          {/* TAB 1: CREDIT LINE CONFIGURATION */}
          {activeTab === 'credit' && (
            <div className="space-y-6">
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Main limit controller */}
                <div className="lg:col-span-2 space-y-6 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                  <div>
                    <div className="flex justify-between items-baseline mb-2">
                      <label className="text-sm font-semibold text-slate-200 flex items-center gap-1.5">
                        <span>Requested Credit Facility Limit</span>
                        <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                      </label>
                      <span className="text-2xl font-mono font-bold text-emerald-400">
                        ${formData.requestedLimit.toLocaleString()}
                      </span>
                    </div>

                    <input
                      type="range"
                      min={2000}
                      max={Math.max(maxAllowableLimit, 50000)}
                      step={500}
                      value={formData.requestedLimit}
                      disabled={readOnly}
                      onChange={e =>
                        setFormData({ ...formData, requestedLimit: Number(e.target.value) })
                      }
                      className="w-full h-2 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />

                    <div className="flex justify-between text-xs text-slate-500 mt-2 font-mono">
                      <span>Min: $2,000</span>
                      <span>Recommended: ${maxAllowableLimit.toLocaleString()}</span>
                      <span>Max: ${(Math.max(maxAllowableLimit, 50000)).toLocaleString()}</span>
                    </div>
                    {validationErrors.requestedLimit && (
                      <p className="mt-2 text-xs text-rose-400 flex items-center gap-1">
                        <AlertCircle className="w-3.5 h-3.5" />
                        {validationErrors.requestedLimit}
                      </p>
                    )}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Primary Facility Purpose
                      </label>
                      <select
                        value={formData.purpose}
                        disabled={readOnly}
                        onChange={e => setFormData({ ...formData, purpose: e.target.value })}
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option>Working Capital & Liquidity Buffer</option>
                        <option>Short-Term Investment Financing</option>
                        <option>Executive Personal Contingency</option>
                        <option>Debt Consolidation & Restructuring</option>
                        <option>Commercial Inventory Bridge</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Repayment Execution Mandate
                      </label>
                      <select
                        value={formData.autoRepaymentType}
                        disabled={readOnly}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            autoRepaymentType: e.target.value as any
                          })
                        }
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 transition-colors"
                      >
                        <option value="minimum">Auto-Pay Minimum (1.5% + Interest)</option>
                        <option value="full">Auto-Pay Full Statement Balance (0% Interest Rollover)</option>
                        <option value="fixed_percentage">Fixed Custom Percentage Balance</option>
                      </select>
                    </div>
                  </div>

                  {formData.autoRepaymentType === 'fixed_percentage' && (
                    <div className="p-3.5 bg-slate-800/50 rounded-xl border border-slate-700/60">
                      <div className="flex justify-between items-center text-xs text-slate-300 mb-2">
                        <span>Custom Monthly Repayment Rate</span>
                        <span className="font-mono font-bold text-indigo-400">
                          {formData.fixedPercentageValue}% of used limit
                        </span>
                      </div>
                      <input
                        type="range"
                        min={5}
                        max={100}
                        step={5}
                        value={formData.fixedPercentageValue || 10}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            fixedPercentageValue: Number(e.target.value)
                          })
                        }
                        className="w-full h-1.5 bg-slate-700 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                      />
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                      Linked Cash Settlement Account
                    </label>
                    <select
                      value={formData.linkedSettlementAccount}
                      disabled={readOnly}
                      onChange={e =>
                        setFormData({ ...formData, linkedSettlementAccount: e.target.value })
                      }
                      className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                    >
                      {customerProfile.existingAccounts.map(acc => (
                        <option key={acc.id} value={acc.id}>
                          {acc.label} — [Available: ${acc.balance.toLocaleString()}]
                        </option>
                      ))}
                    </select>
                  </div>
                </div>

                {/* Live Simulation Card */}
                <div className="bg-gradient-to-br from-slate-900 via-indigo-950/40 to-slate-900 p-6 rounded-2xl border border-indigo-500/20 flex flex-col justify-between">
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-bold uppercase tracking-wider text-indigo-400">
                        Facility Summary
                      </span>
                      <ShieldCheck className="w-4 h-4 text-emerald-400" />
                    </div>

                    <div className="space-y-3 pt-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Nominal APR</span>
                        <span className="font-mono font-semibold text-white">
                          {formData.interestRate}%
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Daily Rest Interest</span>
                        <span className="font-mono font-semibold text-slate-200">
                          {((formData.interestRate / 365)).toFixed(4)}% / day
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Est. Min Monthly Due</span>
                        <span className="font-mono font-bold text-amber-400">
                          ${estimatedMinRepayment.toLocaleString()}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-400">Annual Card / Facility Fee</span>
                        <span className="font-mono font-semibold text-emerald-400">
                          WAIVED (Year 1)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 bg-slate-900/80 rounded-xl border border-slate-800 text-xs text-slate-400 space-y-1">
                      <div className="flex items-center gap-1.5 text-slate-300 font-medium">
                        <TrendingDown className="w-3.5 h-3.5 text-emerald-400" />
                        <span>Interest Saved when unutilized:</span>
                      </div>
                      <p>
                        Zero interest incurred until funds are drawn via ATM, Cheque, or Transfer.
                      </p>
                    </div>
                  </div>

                  <div className="pt-4 mt-4 border-t border-slate-800/80 text-[11px] text-slate-500 flex items-center gap-1.5">
                    <Lock className="w-3 h-3 text-slate-400" />
                    <span>Backed by Autonomous Credit Guard v4.2</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ATM / DEBIT CARD SETTINGS */}
          {activeTab === 'atm' && (
            <div className="space-y-6">
              {/* Enable Card Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                    <CreditCard className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Physical & Virtual ATM Card Access</h3>
                    <p className="text-xs text-slate-400">
                      Enable direct ATM cash withdrawal and Point of Sale (POS/Merchant) debit capabilities.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresAtmCard}
                    disabled={readOnly}
                    onChange={e => setFormData({ ...formData, requiresAtmCard: e.target.checked })}
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                </label>
              </div>

              {formData.requiresAtmCard ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Card Customization Form */}
                  <div className="lg:col-span-2 space-y-5 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Embossed Name on Card
                      </label>
                      <input
                        type="text"
                        value={formData.atmConfig.embossedName}
                        maxLength={26}
                        disabled={readOnly}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            atmConfig: {
                              ...formData.atmConfig,
                              embossedName: e.target.value.toUpperCase()
                            }
                          })
                        }
                        placeholder="FIRSTNAME LASTNAME"
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 font-mono tracking-wider focus:outline-none focus:border-indigo-500"
                      />
                      {validationErrors.embossedName && (
                        <p className="mt-1 text-xs text-rose-400">{validationErrors.embossedName}</p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Daily ATM Cash Withdrawal Limit
                        </label>
                        <select
                          value={formData.atmConfig.dailyAtmWithdrawalLimit}
                          disabled={readOnly}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              atmConfig: {
                                ...formData.atmConfig,
                                dailyAtmWithdrawalLimit: Number(e.target.value)
                              }
                            })
                          }
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          <option value={1000}>$1,000 / Day</option>
                          <option value={2000}>$2,000 / Day</option>
                          <option value={3000}>$3,000 / Day</option>
                          <option value={5000}>$5,000 / Day</option>
                          <option value={10000}>$10,000 / Day (VIP)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Daily POS / Merchant Limit
                        </label>
                        <select
                          value={formData.atmConfig.dailyPosLimit}
                          disabled={readOnly}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              atmConfig: {
                                ...formData.atmConfig,
                                dailyPosLimit: Number(e.target.value)
                              }
                            })
                          }
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-indigo-500 font-mono"
                        >
                          <option value={2000}>$2,000 / Day</option>
                          <option value={5000}>$5,000 / Day</option>
                          <option value={10000}>$10,000 / Day</option>
                          <option value={20000}>$20,000 / Day</option>
                          <option value={50000}>$50,000 / Day (Executive)</option>
                        </select>
                      </div>
                    </div>

                    {/* Card Features Toggles */}
                    <div className="pt-3 border-t border-slate-800 grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.atmConfig.contactlessPayment}
                          disabled={readOnly}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              atmConfig: {
                                ...formData.atmConfig,
                                contactlessPayment: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-700 border-slate-600"
                        />
                        <span className="text-xs text-slate-200">Contactless NFC / PayWave</span>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.atmConfig.overseasUsageEnabled}
                          disabled={readOnly}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              atmConfig: {
                                ...formData.atmConfig,
                                overseasUsageEnabled: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-indigo-600 focus:ring-0 bg-slate-700 border-slate-600"
                        />
                        <span className="text-xs text-slate-200">Worldwide ATM Cash Access</span>
                      </label>
                    </div>

                    {/* Card Theme Picker */}
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Select Card Edition
                      </label>
                      <div className="grid grid-cols-3 gap-3">
                        {CARD_DESIGNS.map(design => (
                          <button
                            key={design.id}
                            type="button"
                            onClick={() =>
                              setFormData({
                                ...formData,
                                atmConfig: { ...formData.atmConfig, cardDesignId: design.id }
                              })
                            }
                            className={`p-3 rounded-xl border text-left transition-all ${
                              formData.atmConfig.cardDesignId === design.id
                                ? 'border-indigo-500 bg-indigo-950/40 shadow-md ring-1 ring-indigo-500'
                                : 'border-slate-800 bg-slate-900/60 hover:border-slate-700'
                            }`}
                          >
                            <div
                              className={`h-6 w-full rounded bg-gradient-to-r ${design.color} mb-2 border ${design.border}`}
                            />
                            <p className="text-[11px] font-medium text-slate-200 truncate">
                              {design.name}
                            </p>
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Realtime Card Holographic Preview */}
                  <div className="flex flex-col items-center justify-start gap-4">
                    <div className="w-full max-w-[320px] aspect-[1.586/1] rounded-2xl p-5 bg-gradient-to-br from-slate-900 via-indigo-950 to-black border border-indigo-500/30 shadow-2xl relative flex flex-col justify-between overflow-hidden">
                      {/* Chip & Logo */}
                      <div className="flex justify-between items-start">
                        <div className="w-10 h-8 rounded-md bg-gradient-to-br from-amber-200 to-yellow-500 border border-amber-600/50 flex items-center justify-center shadow">
                          <div className="w-6 h-5 border border-amber-800/40 rounded-sm" />
                        </div>
                        <div className="text-right">
                          <span className="text-xs font-black italic tracking-widest text-indigo-400">
                            READY CREDIT
                          </span>
                          <span className="block text-[8px] tracking-widest text-slate-400 uppercase">
                            Autonomous Line
                          </span>
                        </div>
                      </div>

                      {/* Card Number & Contactless */}
                      <div className="space-y-1 my-auto">
                        <div className="text-sm sm:text-base font-mono tracking-widest text-slate-200 drop-shadow">
                          •••• •••• •••• 9842
                        </div>
                        <div className="flex items-center gap-2 text-[9px] text-slate-400 font-mono">
                          <span>EXP 12/29</span>
                          <span>CVV •••</span>
                        </div>
                      </div>

                      {/* Embossed Name & Brand */}
                      <div className="flex justify-between items-end">
                        <span className="text-xs font-mono font-semibold tracking-wider text-slate-200 uppercase truncate max-w-[170px]">
                          {formData.atmConfig.embossedName || 'VALUED CARDMEMBER'}
                        </span>
                        <div className="flex -space-x-2">
                          <div className="w-5 h-5 rounded-full bg-rose-500/80 backdrop-blur-sm" />
                          <div className="w-5 h-5 rounded-full bg-amber-500/80 backdrop-blur-sm" />
                        </div>
                      </div>
                    </div>

                    <p className="text-[11px] text-slate-500 text-center">
                      Physical card dispatched via express courier within 48 business hours.
                    </p>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-400">
                  <CreditCard className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">ATM Card Service is currently toggled off.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    You can still draw credit funds directly to your linked settlement account online.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: CHEQUE BOOK FACILITY */}
          {activeTab === 'cheque' && (
            <div className="space-y-6">
              {/* Cheque Book Toggle */}
              <div className="flex items-center justify-between p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center gap-3">
                  <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    <BookOpen className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-white">Cheque Book Issuance</h3>
                    <p className="text-xs text-slate-400">
                      Issue personalized cheques directly debited against your Ready Credit facility line.
                    </p>
                  </div>
                </div>
                <label className="relative inline-flex items-center cursor-pointer">
                  <input
                    type="checkbox"
                    checked={formData.requiresChequeBook}
                    disabled={readOnly}
                    onChange={e =>
                      setFormData({ ...formData, requiresChequeBook: e.target.checked })
                    }
                    className="sr-only peer"
                  />
                  <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-emerald-600"></div>
                </label>
              </div>

              {formData.requiresChequeBook ? (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                  {/* Cheque Parameters */}
                  <div className="lg:col-span-2 space-y-5 bg-slate-900/60 p-6 rounded-2xl border border-slate-800">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Cheque Signatory / Personalized Title
                      </label>
                      <input
                        type="text"
                        value={formData.chequeConfig.personalizedName}
                        disabled={readOnly}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            chequeConfig: {
                              ...formData.chequeConfig,
                              personalizedName: e.target.value
                            }
                          })
                        }
                        placeholder="Alexander Vance"
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-4 py-2.5 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 font-medium"
                      />
                      {validationErrors.chequePersonalizedName && (
                        <p className="mt-1 text-xs text-rose-400">
                          {validationErrors.chequePersonalizedName}
                        </p>
                      )}
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Quantity of Cheque Books
                        </label>
                        <select
                          value={formData.chequeConfig.numberOfBooks}
                          disabled={readOnly}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              chequeConfig: {
                                ...formData.chequeConfig,
                                numberOfBooks: Number(e.target.value)
                              }
                            })
                          }
                          className="w-full bg-slate-800/90 border border-slate-700 rounded-xl px-3.5 py-2.5 text-sm text-slate-200 focus:outline-none focus:border-emerald-500 font-mono"
                        >
                          <option value={1}>1 Book (Complimentary)</option>
                          <option value={2}>2 Books (Standard Executive)</option>
                          <option value={3}>3 Books</option>
                          <option value={5}>5 Books (Commercial Pack)</option>
                        </select>
                      </div>

                      <div>
                        <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                          Leaves per Cheque Book
                        </label>
                        <div className="grid grid-cols-3 gap-2">
                          {[25, 50, 100].map(count => (
                            <button
                              key={count}
                              type="button"
                              onClick={() =>
                                setFormData({
                                  ...formData,
                                  chequeConfig: {
                                    ...formData.chequeConfig,
                                    leavesPerBook: count as any
                                  }
                                })
                              }
                              className={`py-2 px-3 rounded-xl text-xs font-mono font-semibold transition-colors border ${
                                formData.chequeConfig.leavesPerBook === count
                                  ? 'bg-emerald-600/30 border-emerald-500 text-emerald-300'
                                  : 'bg-slate-800/60 border-slate-700 text-slate-400 hover:text-slate-200'
                              }`}
                            >
                              {count} Leaves
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>

                    <div className="space-y-3 pt-2">
                      <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.chequeConfig.bearerCrossedByDefault}
                          disabled={readOnly}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              chequeConfig: {
                                ...formData.chequeConfig,
                                bearerCrossedByDefault: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-slate-700 border-slate-600"
                        />
                        <div>
                          <span className="text-xs font-medium text-slate-200 block">
                            Cross Cheque ("Account Payee Only") Pre-Printed
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Prevents unauthorized cash counter encashment; guarantees funds are deposited to payee bank.
                          </span>
                        </div>
                      </label>

                      <label className="flex items-center gap-3 p-3 bg-slate-800/40 rounded-xl border border-slate-800 cursor-pointer hover:bg-slate-800/70 transition-colors">
                        <input
                          type="checkbox"
                          checked={formData.chequeConfig.urgentDispatch}
                          disabled={readOnly}
                          onChange={e =>
                            setFormData({
                              ...formData,
                              chequeConfig: {
                                ...formData.chequeConfig,
                                urgentDispatch: e.target.checked
                              }
                            })
                          }
                          className="w-4 h-4 rounded text-emerald-600 focus:ring-0 bg-slate-700 border-slate-600"
                        />
                        <div>
                          <span className="text-xs font-medium text-slate-200 block">
                            Priority High-Security Armored Dispatch (+24hr Delivery)
                          </span>
                          <span className="text-[11px] text-slate-400">
                            Signature verification on delivery with instant digital SMS tracking.
                          </span>
                        </div>
                      </label>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 uppercase tracking-wider mb-2">
                        Special Instructions / Dispatch Notes (Optional)
                      </label>
                      <textarea
                        rows={2}
                        value={formData.chequeConfig.specialInstructions}
                        disabled={readOnly}
                        onChange={e =>
                          setFormData({
                            ...formData,
                            chequeConfig: {
                              ...formData.chequeConfig,
                              specialInstructions: e.target.value
                            }
                          })
                        }
                        placeholder="e.g. Deliver to building concierge with authorization code."
                        className="w-full bg-slate-800/90 border border-slate-700 rounded-xl p-3 text-xs text-slate-200 focus:outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>

                  {/* Cheque Sheet Preview */}
                  <div className="space-y-4">
                    <div className="w-full bg-slate-100 text-slate-900 rounded-xl p-4 shadow-lg border border-slate-300 font-mono text-[11px] relative overflow-hidden">
                      {/* Watermark */}
                      <div className="absolute inset-0 flex items-center justify-center opacity-5 pointer-events-none text-3xl font-black rotate-[-15deg] select-none">
                        READY CREDIT FACILITY
                      </div>

                      {/* Header */}
                      <div className="flex justify-between items-start border-b border-slate-300 pb-2 mb-3">
                        <div>
                          <div className="font-bold text-xs">NOVA APEX BANK</div>
                          <div className="text-[9px] text-slate-500">Autonomous Ready Credit Line</div>
                        </div>
                        <div className="text-right">
                          <div className="border border-slate-400 px-2 py-0.5 rounded text-[10px]">
                            DATE: DD / MM / YYYY
                          </div>
                        </div>
                      </div>

                      {/* Payee line */}
                      <div className="space-y-2 mb-4">
                        <div className="flex items-center gap-1 border-b border-slate-400 border-dotted pb-0.5">
                          <span className="font-sans font-semibold text-slate-600 text-[10px]">PAY:</span>
                          <span className="text-slate-400 italic">SAMPLE PAYEE NAME</span>
                        </div>
                        <div className="flex items-center justify-between border-b border-slate-400 border-dotted pb-0.5">
                          <div className="flex items-center gap-1">
                            <span className="font-sans font-semibold text-slate-600 text-[10px]">AMOUNT:</span>
                            <span className="text-slate-400 italic">TEN THOUSAND DOLLARS</span>
                          </div>
                          <div className="border border-slate-400 bg-white px-2 py-0.5 font-bold">
                            $ 10,000.00
                          </div>
                        </div>
                      </div>

                      {/* Signatory line */}
                      <div className="flex justify-between items-end pt-2">
                        <div className="text-[9px] text-slate-500">
                          {formData.chequeConfig.bearerCrossedByDefault && (
                            <span className="inline-block border-l-2 border-r-2 border-slate-700 px-1 font-bold">
                              // A/C PAYEE ONLY //
                            </span>
                          )}
                        </div>
                        <div className="text-right">
                          <div className="w-32 border-b border-slate-800 mb-1" />
                          <div className="text-[9px] font-sans uppercase font-bold text-slate-700 truncate max-w-[140px]">
                            {formData.chequeConfig.personalizedName || 'AUTHORIZED SIGNATORY'}
                          </div>
                        </div>
                      </div>

                      {/* MICR Encoding line */}
                      <div className="mt-4 pt-2 border-t border-slate-200 text-center tracking-widest text-[9px] font-mono text-slate-600">
                        ⑆004182⑆ 021000089⑆ 9942008129⑈ 01
                      </div>
                    </div>

                    <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800 text-xs space-y-2">
                      <div className="flex justify-between">
                        <span className="text-slate-400">Total Leaves Ordered:</span>
                        <span className="font-mono font-bold text-white">
                          {formData.chequeConfig.numberOfBooks * formData.chequeConfig.leavesPerBook} Cheques
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-400">Clearing Engine:</span>
                        <span className="font-mono text-emerald-400">Automated AI Signature Verification</span>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-slate-900/40 rounded-2xl border border-slate-800/60 text-slate-400">
                  <BookOpen className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                  <p className="text-sm">Cheque facility is omitted for this facility profile.</p>
                  <p className="text-xs text-slate-500 mt-1">
                    You can request cheque books at any time post activation.
                  </p>
                </div>
              )}
            </div>
          )}

          {/* TAB 4: AUTONOMOUS RULES */}
          {activeTab === 'agent' && (
            <div className="space-y-6">
              <div className="p-6 bg-slate-900/60 rounded-2xl border border-slate-800 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Sparkles className="w-5 h-5 text-indigo-400" />
                      Autonomous Liquidity & Repayment Agent
                    </h3>
                    <p className="text-xs text-slate-400 mt-1">
                      Our autonomous agent monitors cash-flow fluctuations in real time to prevent overdraft fees and minimize interest drag.
                    </p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={formData.aiAutoTuningEnabled}
                      disabled={readOnly}
                      onChange={e =>
                        setFormData({ ...formData, aiAutoTuningEnabled: e.target.checked })
                      }
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-slate-700 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-indigo-600"></div>
                  </label>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  {[
                    {
                      id: 'conservative',
                      title: 'Conservative Guard',
                      desc: 'Prioritizes rapid debt clearance and restricts POS bursts.'
                    },
                    {
                      id: 'balanced',
                      title: 'Balanced Optimizer',
                      desc: 'Maintains optimal cash liquidity with adaptive repayment schedule.'
                    },
                    {
                      id: 'aggressive',
                      title: 'Yield Maximizer',
                      desc: 'Keeps cash in high-yield reserves until final statement cut-off date.'
                    }
                  ].map(policy => (
                    <button
                      key={policy.id}
                      type="button"
                      onClick={() =>
                        setFormData({ ...formData, aiRiskTolerance: policy.id as any })
                      }
                      className={`p-4 rounded-xl text-left border transition-all ${
                        formData.aiRiskTolerance === policy.id
                          ? 'bg-indigo-950/50 border-indigo-500 shadow-lg ring-1 ring-indigo-500/50'
                          : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80'
                      }`}
                    >
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-sm font-bold text-slate-100">{policy.title}</span>
                        {formData.aiRiskTolerance === policy.id && (
                          <Check className="w-4 h-4 text-indigo-400" />
                        )}
                      </div>
                      <p className="text-xs text-slate-400">{policy.desc}</p>
                    </button>
                  ))}
                </div>

                <div className="p-4 bg-indigo-950/20 rounded-xl border border-indigo-500/20 text-xs text-slate-300 space-y-2">
                  <div className="font-semibold text-indigo-300 flex items-center gap-1.5">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" />
                    Autonomous Policy Execution Guarantees
                  </div>
                  <ul className="list-disc list-inside space-y-1 text-slate-400 pl-1">
                    <li>Continuous balance sweep between checking accounts and credit facility.</li>
                    <li>Zero unnotified limit reductions; 100% transparency dashboard.</li>
                    <li>Emergency block on cheque clears if counterfeit patterns are detected.</li>
                  </ul>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Footer */}
        <div className="p-6 bg-slate-900/90 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2 text-xs text-slate-400">
            <Info className="w-4 h-4 text-slate-500" />
            <span>Instant approval available for Tier 1 verified accounts.</span>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto">
            {activeTab !== 'credit' && (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'agent') setActiveTab('cheque');
                  else if (activeTab === 'cheque') setActiveTab('atm');
                  else if (activeTab === 'atm') setActiveTab('credit');
                }}
                className="px-4 py-2.5 rounded-xl border border-slate-700 text-slate-300 hover:bg-slate-800 text-sm font-medium transition-colors"
              >
                Previous
              </button>
            )}

            {activeTab !== 'agent' ? (
              <button
                type="button"
                onClick={() => {
                  if (activeTab === 'credit') setActiveTab('atm');
                  else if (activeTab === 'atm') setActiveTab('cheque');
                  else if (activeTab === 'cheque') setActiveTab('agent');
                }}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-sm font-medium transition-colors"
              >
                <span>Continue</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || readOnly}
                className="flex-1 sm:flex-initial flex items-center justify-center gap-2 px-6 py-2.5 rounded-xl bg-gradient-to-r from-indigo-600 to-indigo-500 hover:from-indigo-500 hover:to-indigo-400 text-white text-sm font-semibold shadow-lg shadow-indigo-600/25 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    <span>Provisioning Facility...</span>
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4" />
                    <span>Submit & Issue Facility</span>
                  </>
                )}
              </button>
            )}
          </div>
        </div>
      </form>
    </div>
  );
};

export default ReadyCreditProductForm;