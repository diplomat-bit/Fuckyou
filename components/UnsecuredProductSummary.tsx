import React, { useState } from 'react';
import {
  ShieldCheck,
  CheckCircle2,
  DollarSign,
  Calendar,
  Percent,
  ArrowRight,
  ChevronLeft,
  Download,
  Bot,
  AlertCircle,
  FileText,
  Lock,
  Sparkles,
  Layers,
  HelpCircle,
  Clock,
  Landmark
} from 'lucide-react';

export interface UnsecuredProductDetails {
  id: string;
  name: string;
  category: 'Personal Loan' | 'Line of Credit' | 'Credit Card' | 'Merchant Advance' | 'Autonomous Growth Capital';
  requestedAmount: number;
  approvedAmount: number;
  interestRate: number; // e.g. 7.49 (%)
  termMonths: number;
  monthlyPayment: number;
  originationFee: number;
  totalInterest: number;
  totalRepayment: number;
  disbursementTimeframe: string; // e.g. "Instant (Under 5 mins)"
  repaymentFrequency: 'Monthly' | 'Bi-Weekly' | 'Weekly';
  repaymentStartDate: string;
  earlyPayoffPenalty: boolean;
  creditTier: string;
}

export interface ApplicantInfo {
  fullName: string;
  email: string;
  phone: string;
  maskedBank: string; // e.g. "Chase Premier Checking (**** 4892)"
  routingMasked: string;
  autoPayEnrolled: boolean;
  creditScoreSnapshot: number;
}

export interface AgentVerificationInsight {
  agentName: string;
  modelIdentifier: string;
  confidenceScore: number; // 0 - 100
  riskLevel: 'Ultra Low' | 'Low' | 'Moderate' | 'Elevated';
  underwritingSummary: string;
  automatedGuarantees: string[];
}

export interface UnsecuredProductSummaryProps {
  product?: UnsecuredProductDetails;
  applicant?: ApplicantInfo;
  agentInsight?: AgentVerificationInsight;
  onConfirm?: (summaryData: { acceptedTerms: boolean; autopay: boolean }) => void;
  onBack?: () => void;
  onDownloadSummary?: () => void;
  isLoading?: boolean;
  className?: string;
}

const DEFAULT_PRODUCT: UnsecuredProductDetails = {
  id: 'PROD-UNSEC-8924',
  name: 'Quantum Precision Unsecured Term Facility',
  category: 'Autonomous Growth Capital',
  requestedAmount: 35000,
  approvedAmount: 35000,
  interestRate: 6.85,
  termMonths: 36,
  monthlyPayment: 1078.24,
  originationFee: 350.0,
  totalInterest: 3816.64,
  totalRepayment: 38816.64,
  disbursementTimeframe: 'Instant AI Wire (2 mins)',
  repaymentFrequency: 'Monthly',
  repaymentStartDate: 'October 15, 2025',
  earlyPayoffPenalty: false,
  creditTier: 'Tier 1 (Prime Executive)'
};

const DEFAULT_APPLICANT: ApplicantInfo = {
  fullName: 'Alexander Vance, MD',
  email: 'alex.vance@sentinel-ai.dev',
  phone: '+1 (555) 839-2041',
  maskedBank: 'JPMorgan Chase Business Advantage (**** 9401)',
  routingMasked: '••••0210',
  autoPayEnrolled: true,
  creditScoreSnapshot: 792
};

const DEFAULT_AGENT_INSIGHT: AgentVerificationInsight = {
  agentName: 'Aegis Sentinel Autonomous Underwriter v4.9',
  modelIdentifier: 'AS-FIN-ENGINE-ALPHA',
  confidenceScore: 99.4,
  riskLevel: 'Ultra Low',
  underwritingSummary:
    'Continuous ledger cross-validation complete. Zero collateral required with prime probability of 99.4% repayment consistency.',
  automatedGuarantees: [
    'Fixed Interest Protection: Rate cannot fluctuate',
    'Zero Prepayment Penalties: Pay early with total fee waiver',
    'Autonomous Instant Liquidity Pipeline cleared'
  ]
};

export const UnsecuredProductSummary: React.FC<UnsecuredProductSummaryProps> = ({
  product = DEFAULT_PRODUCT,
  applicant = DEFAULT_APPLICANT,
  agentInsight = DEFAULT_AGENT_INSIGHT,
  onConfirm,
  onBack,
  onDownloadSummary,
  isLoading = false,
  className = ''
}) => {
  const [agreedToTerms, setAgreedToTerms] = useState<boolean>(false);
  const [agreedToAutoPay, setAgreedToAutoPay] = useState<boolean>(applicant.autoPayEnrolled);
  const [activeTab, setActiveTab] = useState<'summary' | 'breakdown' | 'agent-log'>('summary');
  const [validationError, setValidationError] = useState<string | null>(null);

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 2
    }).format(val);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!agreedToTerms) {
      setValidationError('Please review and agree to the loan agreement and disclosures.');
      return;
    }
    setValidationError(null);
    if (onConfirm) {
      onConfirm({
        acceptedTerms: agreedToTerms,
        autopay: agreedToAutoPay
      });
    }
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Ultra Low':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'Low':
        return 'bg-blue-500/15 text-blue-400 border-blue-500/30';
      case 'Moderate':
        return 'bg-amber-500/15 text-amber-400 border-amber-500/30';
      default:
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
    }
  };

  return (
    <div
      className={`w-full max-w-5xl mx-auto bg-slate-950 text-slate-100 border border-slate-800/80 rounded-2xl shadow-2xl overflow-hidden font-sans ${className}`}
    >
      {/* Header Bar */}
      <header className="relative bg-gradient-to-r from-slate-900 via-indigo-950/60 to-slate-900 px-6 py-6 border-b border-slate-800">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold uppercase tracking-wider bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                <Sparkles className="w-3 h-3 text-indigo-400" /> Final Pre-Submission Summary
              </span>
              <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
                ID: {product.id}
              </span>
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-2">
              {product.name}
            </h1>
            <p className="text-sm text-slate-400 mt-0.5">
              Unsecured Autonomous Credit Facility &bull; No collateral pledging required.
            </p>
          </div>

          <div className="flex items-center gap-2.5">
            {onDownloadSummary && (
              <button
                type="button"
                onClick={onDownloadSummary}
                className="inline-flex items-center gap-1.5 px-3 py-2 text-xs font-medium rounded-lg bg-slate-900/90 text-slate-300 hover:text-white border border-slate-700 hover:border-slate-600 transition-colors shadow-sm"
              >
                <Download className="w-4 h-4 text-slate-400" /> Export PDF
              </button>
            )}
            <div className="px-3.5 py-2 rounded-xl bg-indigo-950/80 border border-indigo-700/50 flex items-center gap-2.5">
              <Bot className="w-5 h-5 text-cyan-400 animate-pulse" />
              <div>
                <div className="text-[10px] uppercase font-bold tracking-wider text-cyan-300">
                  AI Underwriter Conf.
                </div>
                <div className="text-sm font-black text-white">{agentInsight.confidenceScore}%</div>
              </div>
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <nav className="flex items-center gap-1 mt-6 border-b border-slate-800 -mb-6 text-sm">
          <button
            type="button"
            onClick={() => setActiveTab('summary')}
            className={`pb-2.5 px-3.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'summary'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-4 h-4" /> Overview &amp; Key Figures
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('breakdown')}
            className={`pb-2.5 px-3.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'breakdown'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <FileText className="w-4 h-4" /> Amortization &amp; Fees
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('agent-log')}
            className={`pb-2.5 px-3.5 font-medium border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'agent-log'
                ? 'border-indigo-500 text-indigo-400'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Bot className="w-4 h-4" /> Autonomous Agent Verdict
          </button>
        </nav>
      </header>

      {/* Main Body */}
      <form onSubmit={handleSubmit} className="p-6 md:p-8 space-y-8">
        {/* TAB 1: Summary View */}
        {activeTab === 'summary' && (
          <div className="space-y-6">
            {/* Highlights Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-indigo-400">
                  <DollarSign className="w-12 h-12" />
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Approved Amount
                </div>
                <div className="text-2xl font-black text-emerald-400 mt-1">
                  {formatCurrency(product.approvedAmount)}
                </div>
                <div className="text-xs text-slate-500 mt-1">Zero Security / Unsecured</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-cyan-400">
                  <Percent className="w-12 h-12" />
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Fixed APR Rate
                </div>
                <div className="text-2xl font-black text-cyan-300 mt-1">
                  {product.interestRate.toFixed(2)}%
                </div>
                <div className="text-xs text-slate-500 mt-1">Locked for {product.termMonths} months</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-indigo-400">
                  <Calendar className="w-12 h-12" />
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Estimated Installment
                </div>
                <div className="text-2xl font-black text-white mt-1">
                  {formatCurrency(product.monthlyPayment)}
                </div>
                <div className="text-xs text-indigo-400 mt-1 font-medium">{product.repaymentFrequency} auto-draw</div>
              </div>

              <div className="p-4 rounded-xl bg-slate-900/90 border border-slate-800 relative overflow-hidden">
                <div className="absolute top-0 right-0 p-3 opacity-10 text-emerald-400">
                  <Clock className="w-12 h-12" />
                </div>
                <div className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                  Funding Velocity
                </div>
                <div className="text-lg font-bold text-white mt-1.5 flex items-center gap-1.5">
                  <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
                  {product.disbursementTimeframe}
                </div>
                <div className="text-xs text-slate-500 mt-1">Instant via FedNow / RTP</div>
              </div>
            </div>

            {/* Applicant & Account Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Account Destination */}
              <div className="p-5 rounded-xl bg-slate-900/60 border border-slate-800/90 space-y-3">
                <div className="flex items-center justify-between">
                  <h3 className="text-sm font-bold tracking-wide uppercase text-slate-300 flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-indigo-400" /> Disbursement &amp; Repayment Target
                  </h3>
                  <span className="text-[11px] px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-semibold">
                    Verified Direct
                  </span>
                </div>
                <div className="space-y-2 text-sm text-slate-300 pt-1">
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Borrower:</span>
                    <span className="font-semibold text-white">{applicant.fullName}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">Target Bank Account:</span>
                    <span className="font-mono text-slate-200">{applicant.maskedBank}</span>
                  </div>
                  <div className="flex justify-between py-1 border-b border-slate-800/60">
                    <span className="text-slate-400">First Installment Due:</span>
                    <span className="font-medium text-white">{product.repaymentStartDate}</span>
                  </div>
                  <div className="flex justify-between py-1">
                    <span className="text-slate-400">Prepayment Penalty:</span>
                    <span className="font-semibold text-emerald-400">
                      {product.earlyPayoffPenalty ? 'Standard Terms' : '0.00% (No Penalty)'}
                    </span>
                  </div>
                </div>
              </div>

              {/* AI Agent Underwriting Summary Card */}
              <div className="p-5 rounded-xl bg-indigo-950/20 border border-indigo-900/40 relative overflow-hidden">
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-bold tracking-wide uppercase text-indigo-300 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-indigo-400" /> Risk &amp; Autonomous Audit
                  </h3>
                  <span
                    className={`text-xs px-2.5 py-0.5 rounded-full border font-semibold ${getRiskBadgeColor(
                      agentInsight.riskLevel
                    )}`}
                  >
                    Risk: {agentInsight.riskLevel}
                  </span>
                </div>
                <p className="text-xs text-slate-300 leading-relaxed mb-4">
                  {agentInsight.underwritingSummary}
                </p>
                <div className="space-y-1.5">
                  {agentInsight.automatedGuarantees.map((guarantee, idx) => (
                    <div key={idx} className="flex items-center gap-2 text-xs text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400 shrink-0" />
                      <span>{guarantee}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Full Breakdown & Amortization */}
        {activeTab === 'breakdown' && (
          <div className="space-y-6">
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5">
              <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                <FileText className="w-5 h-5 text-indigo-400" /> Detailed Cost Structure
              </h3>
              <div className="divide-y divide-slate-800 text-sm">
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400">Principal Loan Amount</span>
                  <span className="font-semibold text-white">{formatCurrency(product.approvedAmount)}</span>
                </div>
                <div className="py-3 flex justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-slate-400">One-Time Origination Deductible</span>
                    <HelpCircle className="w-3.5 h-3.5 text-slate-500" />
                  </div>
                  <span className="text-slate-300">
                    {product.originationFee > 0 ? formatCurrency(product.originationFee) : '$0.00 (Waived)'}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400">Net Disbursed Capital to Account</span>
                  <span className="font-bold text-emerald-400">
                    {formatCurrency(product.approvedAmount - product.originationFee)}
                  </span>
                </div>
                <div className="py-3 flex justify-between">
                  <span className="text-slate-400">Total Interest Payable ({product.termMonths} Mos)</span>
                  <span className="text-slate-300">{formatCurrency(product.totalInterest)}</span>
                </div>
                <div className="py-3 flex justify-between bg-slate-950/60 px-3 rounded-lg mt-2">
                  <span className="font-bold text-white">Total Lifetime Outlay (Principal + Interest)</span>
                  <span className="font-black text-indigo-300 text-base">
                    {formatCurrency(product.totalRepayment)}
                  </span>
                </div>
              </div>
            </div>

            <div className="p-4 rounded-xl bg-slate-900/40 border border-slate-800 flex items-start gap-3 text-xs text-slate-400 leading-relaxed">
              <Lock className="w-4 h-4 text-indigo-400 shrink-0 mt-0.5" />
              <div>
                <strong className="text-slate-200">Truth in Lending Act (TILA) Notice:</strong> This loan carries a
                fixed annual percentage rate (APR) of {product.interestRate}%. Total repayment calculation is based on
                making {product.termMonths} consecutive monthly payments of {formatCurrency(product.monthlyPayment)}.
                There are no hidden recurring administrative, monthly account, or early redemption surcharges.
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Agent Verdict Log */}
        {activeTab === 'agent-log' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <Bot className="w-4 h-4 text-cyan-400" /> {agentInsight.agentName}
                </h3>
                <span className="text-xs text-slate-400">Model Engine: {agentInsight.modelIdentifier}</span>
              </div>
              <span className="px-2.5 py-1 rounded bg-cyan-500/10 text-cyan-400 border border-cyan-500/20 text-xs font-mono">
                Audit Pass #9822-AU
              </span>
            </div>

            <div className="font-mono text-xs bg-slate-950 p-4 rounded-lg border border-slate-800/80 text-slate-300 space-y-2 leading-relaxed">
              <p className="text-emerald-400">
                [AGENT CHECK] Primary Identity &amp; Credit Bureau Cross-Validation: OK (Credit: {applicant.creditScoreSnapshot})
              </p>
              <p className="text-indigo-300">
                [AGENT CHECK] Bank Direct Rails &amp; Automated Clearing Stream: Validated (Target: {applicant.maskedBank})
              </p>
              <p className="text-cyan-300">
                [AGENT DECISION] Rate Lock Enforced at {product.interestRate}% APR. Zero Collateral Pledge Requirement confirmed.
              </p>
              <p className="text-slate-400">
                [TIMESTAMPS] Automated Instant Disbursement Window: Guaranteed {product.disbursementTimeframe} upon signature.
              </p>
            </div>
          </div>
        )}

        {/* Agreements & Checkboxes */}
        <div className="pt-4 border-t border-slate-800 space-y-4">
          {validationError && (
            <div className="p-3.5 rounded-lg bg-rose-500/10 border border-rose-500/30 flex items-center gap-2.5 text-rose-300 text-xs font-medium">
              <AlertCircle className="w-4 h-4 shrink-0 text-rose-400" />
              {validationError}
            </div>
          )}

          <div className="space-y-3">
            {/* Auto-pay agreement */}
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={agreedToAutoPay}
                onChange={(e) => setAgreedToAutoPay(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 focus:ring-1"
              />
              <span className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors">
                <strong>Enable AI Automated Direct Debit (Autopay):</strong> Automatically debit{' '}
                {formatCurrency(product.monthlyPayment)} on the repayment schedule from{' '}
                <span className="font-medium text-slate-200">{applicant.maskedBank}</span> to guarantee 0.25% APR rebate preservation.
              </span>
            </label>

            {/* Terms and conditions agreement */}
            <label className="flex items-start gap-3 cursor-pointer group select-none">
              <input
                type="checkbox"
                checked={agreedToTerms}
                onChange={(e) => {
                  setAgreedToTerms(e.target.checked);
                  if (validationError) setValidationError(null);
                }}
                className="mt-0.5 w-4 h-4 rounded border-slate-700 bg-slate-900 text-indigo-600 focus:ring-indigo-500 focus:ring-offset-slate-950 focus:ring-1"
              />
              <span className="text-xs text-slate-300 group-hover:text-slate-200 transition-colors">
                I hereby accept the{' '}
                <span className="underline decoration-indigo-400 text-indigo-300 hover:text-indigo-200">
                  Unsecured Credit Facility Agreement
                </span>
                , E-Sign Disclosures, and verify all personal/commercial banking credentials are accurate for binding
                execution.
              </span>
            </label>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-4 border-t border-slate-800">
          <button
            type="button"
            onClick={onBack}
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl border border-slate-700 bg-slate-900 text-slate-300 hover:bg-slate-850 hover:text-white font-medium text-sm transition-colors disabled:opacity-50"
          >
            <ChevronLeft className="w-4 h-4" /> Edit Configuration
          </button>

          <button
            type="submit"
            disabled={isLoading}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-2.5 px-8 py-3 rounded-xl bg-gradient-to-r from-indigo-600 via-indigo-500 to-cyan-500 hover:from-indigo-500 hover:to-cyan-400 text-white font-bold text-sm tracking-wide shadow-lg shadow-indigo-500/25 transition-all transform active:scale-98 disabled:opacity-50 disabled:pointer-events-none"
          >
            {isLoading ? (
              <>
                <svg
                  className="animate-spin h-4 w-4 text-white"
                  xmlns="http://www.w3.org/2000/svg"
                  fill="none"
                  viewBox="0 0 24 24"
                >
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path
                    className="opacity-75"
                    fill="currentColor"
                    d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                  ></path>
                </svg>
                Autonomous Agent Executing...
              </>
            ) : (
              <>
                Confirm &amp; Disburse Capital
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UnsecuredProductSummary;