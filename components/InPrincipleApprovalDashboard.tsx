import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Zap,
  Bot,
  Sparkles,
  TrendingUp,
  Clock,
  CheckCircle2,
  AlertTriangle,
  XCircle,
  FileText,
  Search,
  Filter,
  Plus,
  RefreshCw,
  Sliders,
  DollarSign,
  ChevronRight,
  User,
  ArrowUpRight,
  Download,
  Eye,
  Activity,
  Layers,
  Percent,
  Calendar,
  CreditCard,
  Building,
  CheckCircle,
  HelpCircle,
  FileCheck,
  SendHorizontal
} from 'lucide-react';

// --- Types & Interfaces ---

export type ProductType = 
  | 'UNSECURED_PERSONAL_LOAN' 
  | 'REVOLVING_CREDIT_LINE' 
  | 'DIGITAL_CREDIT_CARD' 
  | 'BNPL_ENTERPRISE_LIMIT'
  | 'FREELANCER_MICRO_LINE';

export type IPAStatus = 
  | 'INSTANT_APPROVED' 
  | 'CONDITIONAL_APPROVED' 
  | 'AGENT_PROCESSING' 
  | 'UNDERWRITER_REVIEW' 
  | 'DECLINED';

export interface AgentLog {
  agentName: string;
  stage: string;
  decision: 'PASSED' | 'FLAGGED' | 'OPTIMIZING' | 'APPROVED' | 'CALCULATING';
  confidence: number;
  message: string;
  timestamp: string;
}

export interface IPARequest {
  id: string;
  applicantName: string;
  applicantEmail: string;
  applicantAvatar?: string;
  productType: ProductType;
  requestedAmount: number;
  approvedAmount: number;
  creditScore: number;
  dtiRatio: number;
  monthlyIncome: number;
  status: IPAStatus;
  createdAt: string;
  expiryDate: string;
  interestRate: number;
  maxTenureMonths: number;
  recommendedTenure: number;
  riskBand: 'AAA_PRIME' | 'AA_NEAR_PRIME' | 'A_EXPANDED' | 'B_MODERATE' | 'C_HIGH_RISK';
  agentTelemetry: AgentLog[];
  conditions: string[];
}

export interface MetricCardProps {
  title: string;
  value: string | number;
  change: string;
  isPositive: boolean;
  icon: React.ComponentType<{ className?: string }>;
  sublabel?: string;
}

// --- Mock Dataset for Initial State ---

const INITIAL_IPA_REQUESTS: IPARequest[] = [
  {
    id: 'IPA-2025-9842',
    applicantName: 'Evelyn Vance',
    applicantEmail: 'evelyn.vance@vancetech.io',
    productType: 'UNSECURED_PERSONAL_LOAN',
    requestedAmount: 45000,
    approvedAmount: 45000,
    creditScore: 785,
    dtiRatio: 0.18,
    monthlyIncome: 14200,
    status: 'INSTANT_APPROVED',
    createdAt: '2 mins ago',
    expiryDate: '30 Days remaining',
    interestRate: 6.49,
    maxTenureMonths: 60,
    recommendedTenure: 36,
    riskBand: 'AAA_PRIME',
    agentTelemetry: [
      { agentName: 'Identity & Fraud Sentinel', stage: 'KYC & Biometrics', decision: 'PASSED', confidence: 99.8, message: 'Zero synthetic identity match. Facial liveness & SSN verified.', timestamp: '14:23:01' },
      { agentName: 'Open Banking Telemetry', stage: 'Cash Flow Analysis', decision: 'PASSED', confidence: 98.4, message: 'Avg 90-day net inflow is $14,200/mo. No NSF occurrences.', timestamp: '14:23:04' },
      { agentName: 'Autonomous Underwriter Prime', stage: 'Limit & Pricing Engine', decision: 'APPROVED', confidence: 99.1, message: 'Instant Approval granted for full requested $45k at prime tier.', timestamp: '14:23:09' }
    ],
    conditions: ['Instant disbursement ready upon signature', 'Direct debit auto-enroll verified']
  },
  {
    id: 'IPA-2025-9841',
    applicantName: 'Marcus Sterling',
    applicantEmail: 'm.sterling@strataform.com',
    productType: 'REVOLVING_CREDIT_LINE',
    requestedAmount: 75000,
    approvedAmount: 50000,
    creditScore: 712,
    dtiRatio: 0.34,
    monthlyIncome: 11500,
    status: 'CONDITIONAL_APPROVED',
    createdAt: '14 mins ago',
    expiryDate: '28 Days remaining',
    interestRate: 9.85,
    maxTenureMonths: 48,
    recommendedTenure: 24,
    riskBand: 'AA_NEAR_PRIME',
    agentTelemetry: [
      { agentName: 'Identity & Fraud Sentinel', stage: 'KYC & Biometrics', decision: 'PASSED', confidence: 97.5, message: 'Identity authenticated via Plaid IDV + Bureau cross-check.', timestamp: '14:11:10' },
      { agentName: 'Debt-to-Income Synthesizer', stage: 'DTI Computation', decision: 'FLAGGED', confidence: 92.1, message: 'DTI at 34% exceeds primary limit for 75k. Counter-offered 50k safe cap.', timestamp: '14:11:18' },
      { agentName: 'Autonomous Underwriter Prime', stage: 'Pre-Approval Packaging', decision: 'APPROVED', confidence: 95.0, message: 'IPA generated with $50,000 credit ceiling.', timestamp: '14:11:22' }
    ],
    conditions: ['Proof of Q4 bonus compensation required before drawdown >$35k', 'Accept adjusted cap of $50,000']
  },
  {
    id: 'IPA-2025-9839',
    applicantName: 'Aria Takahashi',
    applicantEmail: 'aria.takahashi@nexusdesign.co',
    productType: 'DIGITAL_CREDIT_CARD',
    requestedAmount: 20000,
    approvedAmount: 20000,
    creditScore: 810,
    dtiRatio: 0.12,
    monthlyIncome: 16800,
    status: 'INSTANT_APPROVED',
    createdAt: '42 mins ago',
    expiryDate: '30 Days remaining',
    interestRate: 13.25,
    maxTenureMonths: 12,
    recommendedTenure: 12,
    riskBand: 'AAA_PRIME',
    agentTelemetry: [
      { agentName: 'Autonomous Bureau Link', stage: 'Credit History Parse', decision: 'PASSED', confidence: 99.9, message: 'Flawless 10-year credit file. Zero late payments.', timestamp: '13:42:01' },
      { agentName: 'Reward Optimization Agent', stage: 'Perks Allocation', decision: 'OPTIMIZING', confidence: 96.5, message: 'Upgraded to Infinite Black Tier with 0% APR on 6-month transfers.', timestamp: '13:42:05' }
    ],
    conditions: ['Instant virtual card provisioning enabled in Apple/Google Wallet']
  },
  {
    id: 'IPA-2025-9835',
    applicantName: 'Derrick Holloway',
    applicantEmail: 'derrick.h@apexlogistics.io',
    productType: 'BNPL_ENTERPRISE_LIMIT',
    requestedAmount: 120000,
    approvedAmount: 0,
    creditScore: 638,
    dtiRatio: 0.46,
    monthlyIncome: 8900,
    status: 'UNDERWRITER_REVIEW',
    createdAt: '1 hour ago',
    expiryDate: 'Pending Review',
    interestRate: 15.75,
    maxTenureMonths: 36,
    recommendedTenure: 24,
    riskBand: 'C_HIGH_RISK',
    agentTelemetry: [
      { agentName: 'Risk Velocity Monitor', stage: 'Affordability Stress Test', decision: 'FLAGGED', confidence: 89.4, message: 'Requested line ($120k) represents 13.4x monthly revenue.', timestamp: '13:05:12' },
      { agentName: 'Autonomous Underwriter Prime', stage: 'Escalation Protocol', decision: 'CALCULATING', confidence: 84.0, message: 'Autonomous limit exceeded for automated approval. Route to Human Underwriter.', timestamp: '13:05:22' }
    ],
    conditions: ['Personal guarantee requirement pending', 'Audited 2024 P&L and balance sheet upload pending']
  },
  {
    id: 'IPA-2025-9828',
    applicantName: 'Seraphina Lin',
    applicantEmail: 's.lin@monolith.ai',
    productType: 'FREELANCER_MICRO_LINE',
    requestedAmount: 15000,
    approvedAmount: 15000,
    creditScore: 740,
    dtiRatio: 0.22,
    monthlyIncome: 9800,
    status: 'INSTANT_APPROVED',
    createdAt: '2 hours ago',
    expiryDate: '29 Days remaining',
    interestRate: 8.99,
    maxTenureMonths: 24,
    recommendedTenure: 18,
    riskBand: 'AA_NEAR_PRIME',
    agentTelemetry: [
      { agentName: 'Open Banking Telemetry', stage: '1099 Recurring Income Verifier', decision: 'PASSED', confidence: 96.8, message: 'Detected stable $9,800/mo freelance invoice stream across 4 clients.', timestamp: '12:15:30' },
      { agentName: 'Autonomous Underwriter Prime', stage: 'Micro-Line Sizing', decision: 'APPROVED', confidence: 98.1, message: 'Approved with dynamic revenue-linked drawdown terms.', timestamp: '12:15:38' }
    ],
    conditions: ['Plaid periodic account sync maintenance']
  }
];

export const InPrincipleApprovalDashboard: React.FC = () => {
  // --- States ---
  const [ipaRequests, setIpaRequests] = useState<IPARequest[]>(INITIAL_IPA_REQUESTS);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedProductFilter, setSelectedProductFilter] = useState<string>('ALL');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState<string>('ALL');
  const [selectedIPA, setSelectedIPA] = useState<IPARequest | null>(INITIAL_IPA_REQUESTS[0]);
  const [isNewIPAModalOpen, setIsNewIPAModalOpen] = useState<boolean>(false);
  const [isProcessingNewIPA, setIsProcessingNewIPA] = useState<boolean>(false);
  const [agentLiveFeed, setAgentLiveFeed] = useState<string[]>([]);
  const [notificationMessage, setNotificationMessage] = useState<string | null>(null);

  // New Application Wizard Form State
  const [newApplicantName, setNewApplicantName] = useState('');
  const [newApplicantEmail, setNewApplicantEmail] = useState('');
  const [newProductType, setNewProductType] = useState<ProductType>('UNSECURED_PERSONAL_LOAN');
  const [newRequestedAmount, setNewRequestedAmount] = useState<number>(35000);
  const [newMonthlyIncome, setNewMonthlyIncome] = useState<number>(12500);
  const [newCreditScoreEstimate, setNewCreditScoreEstimate] = useState<number>(760);

  // Dynamic calculation slider inside detail drawer
  const [customTenure, setCustomTenure] = useState<number>(36);

  useEffect(() => {
    if (selectedIPA) {
      setCustomTenure(selectedIPA.recommendedTenure || 36);
    }
  }, [selectedIPA]);

  // Flash Notification Helper
  const triggerNotification = (msg: string) => {
    setNotificationMessage(msg);
    setTimeout(() => {
      setNotificationMessage(null);
    }, 4000);
  };

  // Filtered Requests
  const filteredRequests = useMemo(() => {
    return ipaRequests.filter((item) => {
      const matchSearch =
        item.applicantName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        item.applicantEmail.toLowerCase().includes(searchQuery.toLowerCase());
      const matchProduct = selectedProductFilter === 'ALL' || item.productType === selectedProductFilter;
      const matchStatus = selectedStatusFilter === 'ALL' || item.status === selectedStatusFilter;
      return matchSearch && matchProduct && matchStatus;
    });
  }, [ipaRequests, searchQuery, selectedProductFilter, selectedStatusFilter]);

  // Aggregate Metrics
  const metrics = useMemo(() => {
    const totalVolume = ipaRequests.reduce((acc, curr) => acc + curr.approvedAmount, 0);
    const approvedCount = ipaRequests.filter((r) => r.status === 'INSTANT_APPROVED' || r.status === 'CONDITIONAL_APPROVED').length;
    const rate = ((approvedCount / ipaRequests.length) * 100).toFixed(1);
    const avgDecisionSeconds = '1.8s';

    return {
      activeIPACount: ipaRequests.length,
      totalVolumeFormatted: `$${(totalVolume / 1000).toFixed(1)}k`,
      autoApprovalRate: `${rate}%`,
      avgDecisionTime: avgDecisionSeconds,
    };
  }, [ipaRequests]);

  // Calculate monthly repayment formula: M = P * [r(1+r)^n] / [(1+r)^n - 1]
  const calculatedMonthlyRepayment = useMemo(() => {
    if (!selectedIPA || selectedIPA.approvedAmount === 0) return 0;
    const principal = selectedIPA.approvedAmount;
    const monthlyRate = (selectedIPA.interestRate / 100) / 12;
    const n = customTenure;
    if (monthlyRate === 0) return principal / n;
    const payment = (principal * (monthlyRate * Math.pow(1 + monthlyRate, n))) / (Math.pow(1 + monthlyRate, n) - 1);
    return Math.round(payment);
  }, [selectedIPA, customTenure]);

  // Handler: Run Autonomous IPA Evaluation Engine
  const handleInitiateIPA = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newApplicantName || !newApplicantEmail) return;

    setIsProcessingNewIPA(true);
    setAgentLiveFeed([]);

    const agentSteps = [
      'Agent 1 [KYC & Fraud Sentinel]: Querying Global LexisNexis & Biometric registers...',
      'Agent 1 [KYC & Fraud Sentinel]: Zero fraud indicators. Identity validated (Confidence: 99.4%).',
      'Agent 2 [Open Banking Cashflow Engine]: Synthesizing 120-day statement transaction vectors...',
      'Agent 2 [Open Banking Cashflow Engine]: Net recurring cashflow confirmed at $' + newMonthlyIncome.toLocaleString() + '/mo.',
      'Agent 3 [Neural Underwriting Core]: Calculating Debt-Service Coverage & dynamic stress tolerance...',
      'Agent 4 [Autonomous Packaging Agent]: Assembling In-Principle Approval Certificate & legal terms...'
    ];

    for (let i = 0; i < agentSteps.length; i++) {
      await new Promise((resolve) => setTimeout(resolve, 600));
      setAgentLiveFeed((prev) => [...prev, agentSteps[i]]);
    }

    // Determine algorithmic approval
    const dtiCalculated = parseFloat(((3200 / newMonthlyIncome)).toFixed(2));
    let approvalOutcome: IPAStatus = 'INSTANT_APPROVED';
    let grantedAmount = newRequestedAmount;
    let computedRate = 6.99;
    let riskBand: IPARequest['riskBand'] = 'AAA_PRIME';

    if (newCreditScoreEstimate < 650 || dtiCalculated > 0.45) {
      approvalOutcome = 'UNDERWRITER_REVIEW';
      grantedAmount = 0;
      riskBand = 'C_HIGH_RISK';
      computedRate = 16.5;
    } else if (newCreditScoreEstimate < 720 || newRequestedAmount > 60000) {
      approvalOutcome = 'CONDITIONAL_APPROVED';
      grantedAmount = Math.min(newRequestedAmount, 45000);
      riskBand = 'AA_NEAR_PRIME';
      computedRate = 9.49;
    }

    const newIPARecord: IPARequest = {
      id: `IPA-2025-${Math.floor(1000 + Math.random() * 9000)}`,
      applicantName: newApplicantName,
      applicantEmail: newApplicantEmail,
      productType: newProductType,
      requestedAmount: Number(newRequestedAmount),
      approvedAmount: grantedAmount,
      creditScore: Number(newCreditScoreEstimate),
      dtiRatio: dtiCalculated,
      monthlyIncome: Number(newMonthlyIncome),
      status: approvalOutcome,
      createdAt: 'Just now',
      expiryDate: '30 Days remaining',
      interestRate: computedRate,
      maxTenureMonths: 60,
      recommendedTenure: 36,
      riskBand: riskBand,
      agentTelemetry: [
        {
          agentName: 'Identity Sentinel Agent',
          stage: 'Biometric & KYC Validation',
          decision: 'PASSED',
          confidence: 99.4,
          message: 'Zero anomalies. Identity confirmed against national identity nexus.',
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        {
          agentName: 'Open Banking Synthesizer',
          stage: 'Income & Expense Telemetry',
          decision: 'PASSED',
          confidence: 97.8,
          message: `Verified stable monthly cashflows of $${newMonthlyIncome.toLocaleString()}.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        },
        {
          agentName: 'Autonomous Underwriter Prime',
          stage: 'Risk Model Evaluation',
          decision: approvalOutcome === 'INSTANT_APPROVED' ? 'APPROVED' : approvalOutcome === 'CONDITIONAL_APPROVED' ? 'OPTIMIZING' : 'FLAGGED',
          confidence: 98.2,
          message: `Decision synthesized: ${approvalOutcome} for amount $${grantedAmount.toLocaleString()} at ${computedRate}% APR.`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' })
        }
      ],
      conditions: approvalOutcome === 'INSTANT_APPROVED' 
        ? ['Pre-allocated capital valid for 30 calendar days', 'Direct API disbursement ready'] 
        : ['Manual bank statement verification requested', 'Income proof document match requirement']
    };

    setIpaRequests((prev) => [newIPARecord, ...prev]);
    setSelectedIPA(newIPARecord);
    setIsProcessingNewIPA(false);
    setIsNewIPAModalOpen(false);

    // Reset Form
    setNewApplicantName('');
    setNewApplicantEmail('');
    triggerNotification(`Autonomous IPA for ${newIPARecord.applicantName} generated successfully!`);
  };

  const getStatusBadge = (status: IPAStatus) => {
    switch (status) {
      case 'INSTANT_APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Instant Approved
          </span>
        );
      case 'CONDITIONAL_APPROVED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
            <Sparkles className="w-3.5 h-3.5" /> Conditional IPA
          </span>
        );
      case 'AGENT_PROCESSING':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <Bot className="w-3.5 h-3.5 animate-spin" /> Autonomous Processing
          </span>
        );
      case 'UNDERWRITER_REVIEW':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
            <AlertTriangle className="w-3.5 h-3.5" /> Underwriter Review
          </span>
        );
      case 'DECLINED':
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Declined
          </span>
        );
    }
  };

  const getProductLabel = (p: ProductType) => {
    switch (p) {
      case 'UNSECURED_PERSONAL_LOAN':
        return 'Personal Loan';
      case 'REVOLVING_CREDIT_LINE':
        return 'Revolving Credit Line';
      case 'DIGITAL_CREDIT_CARD':
        return 'Digital Credit Card';
      case 'BNPL_ENTERPRISE_LIMIT':
        return 'BNPL Enterprise Limit';
      case 'FREELANCER_MICRO_LINE':
        return 'Freelancer Micro-Line';
      default:
        return p;
    }
  };

  const getRiskBandBadge = (band: IPARequest['riskBand']) => {
    switch (band) {
      case 'AAA_PRIME':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-emerald-950 text-emerald-300 border border-emerald-800/40">Tier 1 • AAA Prime</span>;
      case 'AA_NEAR_PRIME':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-blue-950 text-blue-300 border border-blue-800/40">Tier 2 • AA Near-Prime</span>;
      case 'A_EXPANDED':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-indigo-950 text-indigo-300 border border-indigo-800/40">Tier 3 • A Expanded</span>;
      case 'B_MODERATE':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-amber-950 text-amber-300 border border-amber-800/40">Tier 4 • B Moderate</span>;
      case 'C_HIGH_RISK':
        return <span className="px-2 py-0.5 text-xs font-bold rounded bg-rose-950 text-rose-300 border border-rose-800/40">Tier 5 • High Risk</span>;
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 sm:p-6 lg:p-8 selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {notificationMessage && (
        <div className="fixed top-6 right-6 z-50 flex items-center gap-3 bg-gradient-to-r from-indigo-900/90 to-purple-900/90 border border-indigo-500/40 px-5 py-3.5 rounded-xl shadow-2xl backdrop-blur-md animate-in fade-in slide-in-from-top-4 duration-300">
          <Sparkles className="w-5 h-5 text-indigo-300 animate-pulse" />
          <span className="text-sm font-medium text-white">{notificationMessage}</span>
        </div>
      )}

      {/* Top Header */}
      <header className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4 border-b border-slate-800/80 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-indigo-500 to-cyan-400 p-0.5 shadow-lg shadow-indigo-500/20">
              <div className="h-full w-full bg-slate-950 rounded-[10px] flex items-center justify-center">
                <ShieldCheck className="w-5 h-5 text-cyan-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl font-bold tracking-tight text-white">In-Principle Approval (IPA) Command Engine</h1>
                <span className="bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs px-2.5 py-0.5 rounded-full font-semibold">
                  Autonomous Multi-Agent v4.8
                </span>
              </div>
              <p className="text-sm text-slate-400 mt-0.5">
                Real-time automated pre-underwriting, unsecured product risk-scoring & decision orchestrator
              </p>
            </div>
          </div>
        </div>

        {/* Header Action Buttons */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => {
              triggerNotification('Multi-agent telemetry models synchronized across live bureaus.');
            }}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-semibold bg-slate-900 hover:bg-slate-850 border border-slate-800 text-slate-300 hover:text-white transition-all shadow-sm"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Sync Bureau Telemetry
          </button>
          <button
            onClick={() => setIsNewIPAModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold bg-gradient-to-r from-indigo-500 via-indigo-600 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-600/40 transition-all cursor-pointer"
          >
            <Plus className="w-4 h-4" /> Run Autonomous IPA Evaluation
          </button>
        </div>
      </header>

      {/* KPI Overview Metrics Grid */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 h-24 w-24 bg-indigo-500/5 rounded-full blur-2xl group-hover:bg-indigo-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Active IPA Pipeline</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.activeIPACount} Facilities</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+18.4% from last week</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 h-24 w-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Pre-Approved Capital Volume</span>
            <div className="p-2 rounded-xl bg-cyan-500/10 text-cyan-400 border border-cyan-500/20">
              <DollarSign className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.totalVolumeFormatted}</div>
          <div className="flex items-center gap-1.5 text-xs text-slate-400 mt-2">
            <span>Aggregated pre-underwritten lines</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 h-24 w-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Zero-Touch IPA Rate</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.autoApprovalRate}</div>
          <div className="flex items-center gap-1.5 text-xs text-emerald-400 mt-2">
            <CheckCircle className="w-3.5 h-3.5" />
            <span>Autonomous agent convergence</span>
          </div>
        </div>

        <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4.5 backdrop-blur-sm relative overflow-hidden group hover:border-slate-700 transition-colors">
          <div className="absolute top-0 right-0 h-24 w-24 bg-purple-500/5 rounded-full blur-2xl group-hover:bg-purple-500/10 transition-all"></div>
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-medium uppercase tracking-wider text-slate-400">Decision Velocity</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 border border-purple-500/20">
              <Activity className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-bold text-white tracking-tight">{metrics.avgDecisionTime}</div>
          <div className="flex items-center gap-1.5 text-xs text-purple-300 mt-2">
            <Bot className="w-3.5 h-3.5" />
            <span>Multi-Agent sub-second validation</span>
          </div>
        </div>
      </section>

      {/* Main Workspace Layout (2-Column: Left Table / Right Interactive Inspection Panel) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Filterable Request Explorer (7 Columns) */}
        <section className="lg:col-span-7 flex flex-col gap-4">
          
          {/* Controls / Filter Bar */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col sm:flex-row gap-3 items-center justify-between">
            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search applicant, IPA ref, email..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            <div className="flex items-center gap-2 w-full sm:w-auto">
              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
                <Filter className="w-3.5 h-3.5 text-slate-400" />
                <select
                  value={selectedProductFilter}
                  onChange={(e) => setSelectedProductFilter(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Products</option>
                  <option value="UNSECURED_PERSONAL_LOAN">Personal Loan</option>
                  <option value="REVOLVING_CREDIT_LINE">Revolving Line</option>
                  <option value="DIGITAL_CREDIT_CARD">Credit Card</option>
                  <option value="BNPL_ENTERPRISE_LIMIT">BNPL Limit</option>
                  <option value="FREELANCER_MICRO_LINE">Freelancer Micro</option>
                </select>
              </div>

              <div className="flex items-center gap-1.5 bg-slate-950 border border-slate-800 rounded-xl px-2.5 py-1 text-xs">
                <select
                  value={selectedStatusFilter}
                  onChange={(e) => setSelectedStatusFilter(e.target.value)}
                  className="bg-transparent text-slate-300 focus:outline-none cursor-pointer"
                >
                  <option value="ALL">All Statuses</option>
                  <option value="INSTANT_APPROVED">Instant Approved</option>
                  <option value="CONDITIONAL_APPROVED">Conditional</option>
                  <option value="UNDERWRITER_REVIEW">Under Review</option>
                </select>
              </div>
            </div>
          </div>

          {/* List of IPA Requests */}
          <div className="bg-slate-900/60 border border-slate-800 rounded-2xl overflow-hidden divide-y divide-slate-800/80">
            <div className="px-5 py-3 bg-slate-900/90 text-xs font-semibold uppercase tracking-wider text-slate-400 grid grid-cols-12">
              <span className="col-span-5">Applicant & Product</span>
              <span className="col-span-3">Pre-Approved Cap</span>
              <span className="col-span-4 text-right">Autonomous Decision</span>
            </div>

            <div className="divide-y divide-slate-850 max-h-[640px] overflow-y-auto">
              {filteredRequests.length === 0 ? (
                <div className="p-12 text-center text-slate-500">
                  <FileText className="w-8 h-8 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">No IPA evaluations match your search filter criteria.</p>
                </div>
              ) : (
                filteredRequests.map((req) => {
                  const isSelected = selectedIPA?.id === req.id;
                  return (
                    <div
                      key={req.id}
                      onClick={() => setSelectedIPA(req)}
                      className={`grid grid-cols-12 px-5 py-4 items-center cursor-pointer transition-all ${
                        isSelected
                          ? 'bg-indigo-950/40 border-l-4 border-l-indigo-500'
                          : 'hover:bg-slate-850/50'
                      }`}
                    >
                      {/* Left: Applicant info */}
                      <div className="col-span-5 flex items-center gap-3">
                        <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-slate-800 to-slate-700 flex items-center justify-center font-bold text-xs text-indigo-300 border border-slate-700">
                          {req.applicantName.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-semibold text-white hover:text-indigo-300 transition-colors">
                              {req.applicantName}
                            </span>
                            <span className="text-[10px] font-mono text-slate-400">{req.id}</span>
                          </div>
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <span>{getProductLabel(req.productType)}</span>
                            <span>•</span>
                            <span className="text-slate-500">{req.createdAt}</span>
                          </div>
                        </div>
                      </div>

                      {/* Middle: Pre-Approved Amount */}
                      <div className="col-span-3">
                        <div className="text-sm font-bold text-white">
                          ${req.approvedAmount.toLocaleString()}
                        </div>
                        <div className="text-xs text-slate-400 flex items-center gap-1">
                          <span>Req: ${req.requestedAmount.toLocaleString()}</span>
                          {req.approvedAmount < req.requestedAmount && req.approvedAmount > 0 && (
                            <span className="text-[10px] text-amber-400 font-medium">(Capped)</span>
                          )}
                        </div>
                      </div>

                      {/* Right: Decision Status & Arrow */}
                      <div className="col-span-4 flex items-center justify-end gap-2">
                        {getStatusBadge(req.status)}
                        <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'text-indigo-400 translate-x-0.5' : 'text-slate-600'}`} />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Autonomous Real-time Pulse Feed */}
          <div className="bg-slate-900/40 border border-slate-800/60 rounded-2xl p-4">
            <div className="flex items-center justify-between mb-2.5">
              <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-slate-300">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                </span>
                Live Multi-Agent Autonomous Bus
              </div>
              <span className="text-[11px] text-slate-500">4 Active Underwriting Daemons</span>
            </div>
            <div className="text-xs text-slate-400 font-mono space-y-1 bg-slate-950/80 p-3 rounded-xl border border-slate-800/80">
              <div className="flex items-center justify-between text-slate-400">
                <span>[DEPOSIT-AI] Real-time transaction ingestion ready</span>
                <span className="text-emerald-400">STREAMING</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>[CREDIT-AGENT] Equifax & Experian 24ms round-trip webhook active</span>
                <span className="text-cyan-400">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between text-slate-400">
                <span>[OFFER-SYNTH] Dynamic APR curve calibrated for market base rate + 3.25%</span>
                <span className="text-purple-400">OPTIMAL</span>
              </div>
            </div>
          </div>
        </section>

        {/* Right Column: Selected IPA Decision Dossier & Instant Term Simulator (5 Columns) */}
        <section className="lg:col-span-5">
          {selectedIPA ? (
            <div className="bg-slate-900/90 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5 sticky top-4 shadow-xl backdrop-blur-md">
              
              {/* Header Details */}
              <div className="flex items-start justify-between border-b border-slate-800 pb-4">
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-lg font-bold text-white">{selectedIPA.applicantName}</h2>
                    {getRiskBandBadge(selectedIPA.riskBand)}
                  </div>
                  <div className="text-xs text-slate-400 mt-1 flex items-center gap-2">
                    <span>{selectedIPA.applicantEmail}</span>
                    <span>•</span>
                    <span className="font-mono text-slate-500">{selectedIPA.id}</span>
                  </div>
                </div>
                <button
                  onClick={() => triggerNotification(`Exporting In-Principle Approval Certificate for ${selectedIPA.id}...`)}
                  title="Download Formal IPA Letter"
                  className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white transition-colors border border-slate-700"
                >
                  <Download className="w-4 h-4" />
                </button>
              </div>

              {/* Status Banner */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-xs text-slate-400">Pre-Approval Validity</span>
                  <div className="text-sm font-semibold text-slate-200 mt-0.5 flex items-center gap-1.5">
                    <Clock className="w-3.5 h-3.5 text-indigo-400" />
                    {selectedIPA.expiryDate}
                  </div>
                </div>
                <div>{getStatusBadge(selectedIPA.status)}</div>
              </div>

              {/* Financial Health Scores */}
              <div className="grid grid-cols-3 gap-3">
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium">Credit Score</span>
                  <div className="text-base font-bold text-white mt-1">{selectedIPA.creditScore}</div>
                  <div className="text-[10px] text-emerald-400 font-medium">Equifax Verified</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium">DTI Ratio</span>
                  <div className="text-base font-bold text-white mt-1">{(selectedIPA.dtiRatio * 100).toFixed(0)}%</div>
                  <div className="text-[10px] text-slate-400">Target &lt; 40%</div>
                </div>
                <div className="p-3 rounded-xl bg-slate-950 border border-slate-800/80">
                  <span className="text-[11px] text-slate-400 font-medium">Monthly Inflow</span>
                  <div className="text-base font-bold text-white mt-1">${(selectedIPA.monthlyIncome / 1000).toFixed(1)}k</div>
                  <div className="text-[10px] text-cyan-400">Open Banking</div>
                </div>
              </div>

              {/* Interactive Term & Repayment Simulator */}
              {selectedIPA.approvedAmount > 0 ? (
                <div className="p-4 rounded-xl bg-gradient-to-b from-indigo-950/30 to-slate-950 border border-indigo-900/30 space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-indigo-300">
                      <Sliders className="w-3.5 h-3.5" /> Interactive Pre-Approved Sizing
                    </div>
                    <span className="text-xs font-mono text-emerald-400 font-semibold">{selectedIPA.interestRate}% Fixed APR</span>
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400">Tenure Selection:</span>
                      <span className="text-white font-semibold">{customTenure} Months</span>
                    </div>
                    <input
                      type="range"
                      min={6}
                      max={selectedIPA.maxTenureMonths}
                      step={6}
                      value={customTenure}
                      onChange={(e) => setCustomTenure(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                      <span>6 Mos</span>
                      <span>{selectedIPA.recommendedTenure} Mos (AI Optimized)</span>
                      <span>{selectedIPA.maxTenureMonths} Mos</span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-slate-800/80 flex items-center justify-between">
                    <div>
                      <span className="text-[11px] text-slate-400">Estimated Monthly Repayment</span>
                      <div className="text-xl font-extrabold text-white mt-0.5">
                        ${calculatedMonthlyRepayment.toLocaleString()} <span className="text-xs text-slate-400 font-normal">/ mo</span>
                      </div>
                    </div>
                    <button
                      onClick={() => triggerNotification(`Binding Offer created and dispatched to ${selectedIPA.applicantEmail}`)}
                      className="flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-bold bg-emerald-500 hover:bg-emerald-600 text-slate-950 transition-colors shadow-lg shadow-emerald-500/20"
                    >
                      <SendHorizontal className="w-3.5 h-3.5" /> Issue Final Offer
                    </button>
                  </div>
                </div>
              ) : (
                <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-800/30 text-xs text-amber-200">
                  <div className="font-semibold flex items-center gap-1.5 mb-1">
                    <AlertTriangle className="w-4 h-4 text-amber-400" /> Manual Underwriting Intervention Required
                  </div>
                  Autonomous model flag triggered due to high leverage multiplier. Additional collateral or secondary co-signer required for pre-approval release.
                </div>
              )}

              {/* Multi-Agent Reasoning Telemetry Trace */}
              <div className="space-y-3">
                <div className="flex items-center justify-between text-xs font-semibold uppercase tracking-wider text-slate-300">
                  <span className="flex items-center gap-1.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" /> Autonomous Agent Audit Trace
                  </span>
                  <span className="text-[10px] text-slate-500">{selectedIPA.agentTelemetry.length} Agents Synthesized</span>
                </div>

                <div className="space-y-2.5 max-h-52 overflow-y-auto pr-1">
                  {selectedIPA.agentTelemetry.map((agent, idx) => (
                    <div key={idx} className="p-2.5 rounded-xl bg-slate-950/70 border border-slate-800/60 text-xs">
                      <div className="flex items-center justify-between mb-1">
                        <span className="font-semibold text-slate-200">{agent.agentName}</span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-[10px] font-mono text-slate-500">{agent.timestamp}</span>
                          <span className="text-[10px] font-bold text-indigo-400 bg-indigo-500/10 px-1.5 py-0.2 rounded border border-indigo-500/20">
                            {agent.confidence}% Conf.
                          </span>
                        </div>
                      </div>
                      <p className="text-slate-400 text-[11px] leading-relaxed">{agent.message}</p>
                    </div>
                  ))}
                </div>
              </div>

              {/* Conditions Checklist */}
              {selectedIPA.conditions.length > 0 && (
                <div className="space-y-2 border-t border-slate-800 pt-3">
                  <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">IPA Contingent Conditions</span>
                  <div className="space-y-1.5">
                    {selectedIPA.conditions.map((cond, i) => (
                      <div key={i} className="flex items-center gap-2 text-xs text-slate-300">
                        <FileCheck className="w-3.5 h-3.5 text-cyan-400 flex-shrink-0" />
                        <span>{cond}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

            </div>
          ) : (
            <div className="h-full bg-slate-900/40 border border-slate-800 rounded-2xl p-8 flex flex-col items-center justify-center text-center text-slate-500">
              <Eye className="w-10 h-10 mb-3 opacity-30" />
              <p className="text-sm font-medium">Select an IPA application from the pipeline to inspect neural agent traces and configure loan structures.</p>
            </div>
          )}
        </section>
      </div>

      {/* Initiation Modal */}
      {isNewIPAModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-in fade-in duration-200">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-xl p-6 shadow-2xl overflow-hidden relative">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                  <Zap className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white">Instant IPA Evaluation Engine</h3>
                  <p className="text-xs text-slate-400">Launch autonomous agent fleet to underwrite unsecured credit line</p>
                </div>
              </div>
              <button
                disabled={isProcessingNewIPA}
                onClick={() => setIsNewIPAModalOpen(false)}
                className="text-slate-400 hover:text-white p-1 rounded-lg transition-colors"
              >
                ✕
              </button>
            </div>

            {!isProcessingNewIPA ? (
              <form onSubmit={handleInitiateIPA} className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Applicant Legal Name</label>
                    <input
                      required
                      type="text"
                      placeholder="e.g. Julian Henderson"
                      value={newApplicantName}
                      onChange={(e) => setNewApplicantName(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Applicant Email</label>
                    <input
                      required
                      type="email"
                      placeholder="e.g. julian@example.com"
                      value={newApplicantEmail}
                      onChange={(e) => setNewApplicantEmail(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Product Facility</label>
                    <select
                      value={newProductType}
                      onChange={(e) => setNewProductType(e.target.value as ProductType)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                    >
                      <option value="UNSECURED_PERSONAL_LOAN">Unsecured Personal Loan</option>
                      <option value="REVOLVING_CREDIT_LINE">Revolving Credit Line</option>
                      <option value="DIGITAL_CREDIT_CARD">Digital Credit Card</option>
                      <option value="BNPL_ENTERPRISE_LIMIT">BNPL Enterprise Facility</option>
                      <option value="FREELANCER_MICRO_LINE">Freelancer Micro-Line</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Requested Facility Limit ($)</label>
                    <input
                      required
                      type="number"
                      min={1000}
                      max={250000}
                      step={500}
                      value={newRequestedAmount}
                      onChange={(e) => setNewRequestedAmount(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Verified Monthly Inflow ($)</label>
                    <input
                      required
                      type="number"
                      min={1000}
                      value={newMonthlyIncome}
                      onChange={(e) => setNewMonthlyIncome(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1">Estimated Bureau Score</label>
                    <input
                      required
                      type="number"
                      min={500}
                      max={850}
                      value={newCreditScoreEstimate}
                      onChange={(e) => setNewCreditScoreEstimate(Number(e.target.value))}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>

                <div className="pt-4 border-t border-slate-800 flex justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsNewIPAModalOpen(false)}
                    className="px-4 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="flex items-center gap-2 px-5 py-2 rounded-xl text-xs font-bold bg-gradient-to-r from-indigo-500 to-cyan-500 hover:from-indigo-600 hover:to-cyan-600 text-white shadow-lg shadow-indigo-600/30 transition-all cursor-pointer"
                  >
                    <Zap className="w-4 h-4" /> Trigger Agent Pipeline
                  </button>
                </div>
              </form>
            ) : (
              <div className="py-8 px-4 flex flex-col items-center justify-center space-y-4">
                <div className="relative flex items-center justify-center">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-500/20 border-t-indigo-500 animate-spin"></div>
                  <Bot className="w-7 h-7 text-indigo-400 absolute" />
                </div>
                <div className="text-center">
                  <h4 className="text-sm font-bold text-white">Autonomous Multi-Agent Synthesis in Progress</h4>
                  <p className="text-xs text-slate-400 mt-1">Cross-referencing fraud heuristics, open-banking vectors & pricing engine</p>
                </div>
                <div className="w-full bg-slate-950 border border-slate-800 rounded-xl p-3 max-h-40 overflow-y-auto space-y-1 text-left font-mono text-[11px] text-slate-300">
                  {agentLiveFeed.map((log, idx) => (
                    <div key={idx} className="flex items-start gap-2">
                      <span className="text-indigo-400 font-bold">›</span>
                      <span>{log}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default InPrincipleApprovalDashboard;