import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Plus,
  Search,
  Filter,
  Sparkles,
  TrendingUp,
  ShieldCheck,
  AlertCircle,
  CreditCard,
  Layers,
  Settings2,
  CheckCircle2,
  Clock,
  ArrowUpRight,
  RefreshCw,
  SlidersHorizontal,
  Bot,
  Zap,
  Trash2,
  Edit3,
  Copy,
  Eye,
  X,
  ChevronRight,
  Download,
  Percent,
  DollarSign,
  Activity,
  FileSpreadsheet,
  AlertTriangle,
  Play,
  Pause,
  ChevronDown
} from 'lucide-react';

export type ProductCategory = 
  | 'PERSONAL_LOAN'
  | 'CREDIT_CARD'
  | 'REVOLVING_LINE'
  | 'BNPL'
  | 'MERCHANT_CASH_ADVANCE'
  | 'STUDENT_REFINANCE';

export type ProductStatus = 'ACTIVE' | 'DRAFT' | 'PAUSED' | 'AI_OPTIMIZING' | 'ARCHIVED';

export type RiskLevel = 'LOW' | 'BALANCED' | 'AGGRESSIVE' | 'CUSTOM';

export interface PricingTier {
  id: string;
  minCreditScore: number;
  maxCreditScore: number;
  baseApr: number;
  maxApr: number;
  originationFeePct: number;
  maxTermMonths: number;
  maxLimit: number;
}

export interface AIAgentRule {
  id: string;
  name: string;
  triggerCondition: string;
  autonomousAction: string;
  confidenceScore: number;
  isActive: boolean;
}

export interface UnsecuredProduct {
  id: string;
  code: string;
  name: string;
  category: ProductCategory;
  status: ProductStatus;
  riskTier: RiskLevel;
  minAmount: number;
  maxAmount: number;
  minApr: number;
  maxApr: number;
  avgApprovalRate: number;
  activeAccountsCount: number;
  portfolioVolume: number;
  currency: string;
  lastUpdated: string;
  pricingTiers: PricingTier[];
  aiRules: AIAgentRule[];
  description: string;
  requiresInstantIncomeVerification: boolean;
  instantApprovalThreshold: number;
  lossProvisionPct: number;
}

export interface FilterState {
  searchQuery: string;
  category: string;
  status: string;
  riskTier: string;
  sortBy: 'name' | 'portfolioVolume' | 'avgApprovalRate' | 'lastUpdated';
  sortOrder: 'asc' | 'desc';
}

const INITIAL_PRODUCTS: UnsecuredProduct[] = [
  {
    id: 'prod-001',
    code: 'PL-PRIME-2025',
    name: 'Apex Instant Personal Loan',
    category: 'PERSONAL_LOAN',
    status: 'ACTIVE',
    riskTier: 'LOW',
    minAmount: 2500,
    maxAmount: 50000,
    minApr: 5.99,
    maxApr: 18.49,
    avgApprovalRate: 68.4,
    activeAccountsCount: 14280,
    portfolioVolume: 184500000,
    currency: 'USD',
    lastUpdated: '2025-02-28T14:32:00Z',
    description: 'Fully automated algorithmic personal credit product with sub-minute automated disbursement.',
    requiresInstantIncomeVerification: true,
    instantApprovalThreshold: 720,
    lossProvisionPct: 1.25,
    pricingTiers: [
      { id: 't1', minCreditScore: 750, maxCreditScore: 850, baseApr: 5.99, maxApr: 8.99, originationFeePct: 0.0, maxTermMonths: 60, maxLimit: 50000 },
      { id: 't2', minCreditScore: 680, maxCreditScore: 749, baseApr: 9.49, maxApr: 13.99, originationFeePct: 1.5, maxTermMonths: 48, maxLimit: 35000 },
      { id: 't3', minCreditScore: 620, maxCreditScore: 679, baseApr: 14.25, maxApr: 18.49, originationFeePct: 3.0, maxTermMonths: 36, maxLimit: 15000 },
    ],
    aiRules: [
      { id: 'r1', name: 'Dynamic Yield Optimization', triggerCondition: 'Market 10Y Yield shifts > 15bps', autonomousAction: 'Adjust spread +12bps on Tier 2 & 3', confidenceScore: 0.96, isActive: true },
      { id: 'r2', name: 'Delinquency Guardrail', triggerCondition: '30-day roll rate exceeds 1.8%', autonomousAction: 'Tighten DTI threshold by 4%', confidenceScore: 0.91, isActive: true }
    ]
  },
  {
    id: 'prod-002',
    code: 'CC-BLACK-ALGO',
    name: 'Quantum Cash Signature Card',
    category: 'CREDIT_CARD',
    status: 'ACTIVE',
    riskTier: 'BALANCED',
    minAmount: 1000,
    maxAmount: 30000,
    minApr: 14.99,
    maxApr: 26.99,
    avgApprovalRate: 74.2,
    activeAccountsCount: 38920,
    portfolioVolume: 320800000,
    currency: 'USD',
    lastUpdated: '2025-03-01T09:15:00Z',
    description: 'Revolving line with AI-driven rewards boost and continuous risk re-scoring based on open banking telemetry.',
    requiresInstantIncomeVerification: false,
    instantApprovalThreshold: 660,
    lossProvisionPct: 2.4,
    pricingTiers: [
      { id: 't1', minCreditScore: 720, maxCreditScore: 850, baseApr: 14.99, maxApr: 18.99, originationFeePct: 0.0, maxTermMonths: 0, maxLimit: 30000 },
      { id: 't2', minCreditScore: 640, maxCreditScore: 719, baseApr: 19.99, maxApr: 26.99, originationFeePct: 0.0, maxTermMonths: 0, maxLimit: 12000 }
    ],
    aiRules: [
      { id: 'r3', name: 'Autonomous Line Enhancer', triggerCondition: '6 consecutive on-time payments + cash flow surge', autonomousAction: 'Bump credit limit 20% max $5,000', confidenceScore: 0.94, isActive: true }
    ]
  },
  {
    id: 'prod-003',
    code: 'LOC-SME-FLEX',
    name: 'FlexLine Business Unsecured Credit',
    category: 'REVOLVING_LINE',
    status: 'AI_OPTIMIZING',
    riskTier: 'BALANCED',
    minAmount: 5000,
    maxAmount: 150000,
    minApr: 7.49,
    maxApr: 21.0,
    avgApprovalRate: 52.1,
    activeAccountsCount: 5410,
    portfolioVolume: 412000000,
    currency: 'USD',
    lastUpdated: '2025-03-02T11:45:00Z',
    description: 'High-velocity operational capital backed by merchant processing ledger analysis and AI underwriting.',
    requiresInstantIncomeVerification: true,
    instantApprovalThreshold: 700,
    lossProvisionPct: 1.85,
    pricingTiers: [
      { id: 't1', minCreditScore: 700, maxCreditScore: 850, baseApr: 7.49, maxApr: 12.5, originationFeePct: 1.0, maxTermMonths: 24, maxLimit: 150000 },
      { id: 't2', minCreditScore: 620, maxCreditScore: 699, baseApr: 13.0, maxApr: 21.0, originationFeePct: 2.5, maxTermMonths: 12, maxLimit: 60000 }
    ],
    aiRules: [
      { id: 'r4', name: 'Real-Time Revenue Volatility Indexing', triggerCondition: 'Bank transaction run-rate drops >25%', autonomousAction: 'Temporarily lock draws > 50% utilization', confidenceScore: 0.98, isActive: true }
    ]
  },
  {
    id: 'prod-004',
    code: 'BNPL-MICRO-X',
    name: 'NanoPay Split-in-4 Zero APR',
    category: 'BNPL',
    status: 'ACTIVE',
    riskTier: 'AGGRESSIVE',
    minAmount: 50,
    maxAmount: 2500,
    minApr: 0.0,
    maxApr: 29.99,
    avgApprovalRate: 88.6,
    activeAccountsCount: 112000,
    portfolioVolume: 84600000,
    currency: 'USD',
    lastUpdated: '2025-03-01T20:10:00Z',
    description: 'Embedded POS instalment network with real-time biometric and behavioral fraud scoring.',
    requiresInstantIncomeVerification: false,
    instantApprovalThreshold: 580,
    lossProvisionPct: 3.1,
    pricingTiers: [
      { id: 't1', minCreditScore: 600, maxCreditScore: 850, baseApr: 0.0, maxApr: 0.0, originationFeePct: 0.0, maxTermMonths: 2, maxLimit: 2500 },
      { id: 't2', minCreditScore: 500, maxCreditScore: 599, baseApr: 19.99, maxApr: 29.99, originationFeePct: 2.0, maxTermMonths: 6, maxLimit: 800 }
    ],
    aiRules: [
      { id: 'r5', name: 'Cart Abandonment Risk Mitigator', triggerCondition: 'Checkout total > $1,200 & device trust < 80', autonomousAction: 'Require 35% upfront downpayment', confidenceScore: 0.89, isActive: true }
    ]
  }
];

export const UnsecuredProductManager: React.FC = () => {
  const [products, setProducts] = useState<UnsecuredProduct[]>(INITIAL_PRODUCTS);
  const [selectedProduct, setSelectedProduct] = useState<UnsecuredProduct | null>(null);
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [isAgentDrawerOpen, setIsAgentDrawerOpen] = useState(false);
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const [agentProgress, setAgentProgress] = useState(0);
  const [agentLog, setAgentLog] = useState<string[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'PERSONAL_LOAN' | 'CREDIT_CARD' | 'REVOLVING_LINE' | 'BNPL'>('all');
  const [notification, setNotification] = useState<{ message: string; type: 'success' | 'info' | 'warning' } | null>(null);

  // Filter & Search states
  const [filters, setFilters] = useState<FilterState>({
    searchQuery: '',
    category: 'ALL',
    status: 'ALL',
    riskTier: 'ALL',
    sortBy: 'portfolioVolume',
    sortOrder: 'desc'
  });

  // Modal / Form Wizard State
  const [formStep, setFormStep] = useState<1 | 2 | 3>(1);
  const [formData, setFormData] = useState<Partial<UnsecuredProduct>>({
    code: '',
    name: '',
    category: 'PERSONAL_LOAN',
    status: 'DRAFT',
    riskTier: 'BALANCED',
    minAmount: 1000,
    maxAmount: 25000,
    minApr: 7.99,
    maxApr: 24.99,
    currency: 'USD',
    description: '',
    requiresInstantIncomeVerification: true,
    instantApprovalThreshold: 680,
    lossProvisionPct: 1.5,
    pricingTiers: [
      {
        id: 'tier-default-1',
        minCreditScore: 700,
        maxCreditScore: 850,
        baseApr: 7.99,
        maxApr: 14.99,
        originationFeePct: 1.0,
        maxTermMonths: 48,
        maxLimit: 25000
      }
    ],
    aiRules: [
      {
        id: 'rule-default-1',
        name: 'Autonomous Yield Guard',
        triggerCondition: 'Benchmark Fed Rate moves > 25bps',
        autonomousAction: 'Auto-recalibrate Base APR spread',
        confidenceScore: 0.95,
        isActive: true
      }
    ]
  });

  const showNotification = (message: string, type: 'success' | 'info' | 'warning' = 'success') => {
    setNotification({ message, type });
    setTimeout(() => setNotification(null), 4500);
  };

  // KPIs calculation
  const portfolioKpis = useMemo(() => {
    const totalVolume = products.reduce((acc, p) => acc + p.portfolioVolume, 0);
    const totalAccounts = products.reduce((acc, p) => acc + p.activeAccountsCount, 0);
    const avgApr = products.reduce((acc, p) => acc + (p.minApr + p.maxApr) / 2, 0) / (products.length || 1);
    const avgApproval = products.reduce((acc, p) => acc + p.avgApprovalRate, 0) / (products.length || 1);
    const activeProducts = products.filter(p => p.status === 'ACTIVE').length;

    return {
      totalVolume,
      totalAccounts,
      avgApr: avgApr.toFixed(2),
      avgApproval: avgApproval.toFixed(1),
      activeProducts
    };
  }, [products]);

  // Filtered & Sorted products
  const filteredProducts = useMemo(() => {
    return products
      .filter((product) => {
        if (activeTab !== 'all' && product.category !== activeTab) return false;
        if (filters.category !== 'ALL' && product.category !== filters.category) return false;
        if (filters.status !== 'ALL' && product.status !== filters.status) return false;
        if (filters.riskTier !== 'ALL' && product.riskTier !== filters.riskTier) return false;
        if (filters.searchQuery) {
          const q = filters.searchQuery.toLowerCase();
          const matchName = product.name.toLowerCase().includes(q);
          const matchCode = product.code.toLowerCase().includes(q);
          const matchDesc = product.description.toLowerCase().includes(q);
          if (!matchName && !matchCode && !matchDesc) return false;
        }
        return true;
      })
      .sort((a, b) => {
        let valA: any = a[filters.sortBy];
        let valB: any = b[filters.sortBy];
        if (typeof valA === 'string') {
          return filters.sortOrder === 'asc' 
            ? valA.localeCompare(valB) 
            : valB.localeCompare(valA);
        }
        return filters.sortOrder === 'asc' ? valA - valB : valB - valA;
      });
  }, [products, activeTab, filters]);

  // Autonomous Agent Orchestration Simulation
  const runAutonomousAgentOptimization = () => {
    setIsAgentRunning(true);
    setAgentProgress(10);
    setAgentLog([
      'Initiating Autonomous Product Yield & Credit Risk Agent...',
      'Harvesting real-time macroeconomic indicators and secondary yield spreads...'
    ]);

    setTimeout(() => {
      setAgentProgress(35);
      setAgentLog(prev => [
        ...prev,
        'Analyzing 164,000+ real-time telemetry streams across unsecured lending cohorts...',
        'Synthesizing synthetic stress test matrix (1,000 Monte Carlo iterations)...'
      ]);
    }, 900);

    setTimeout(() => {
      setAgentProgress(70);
      setAgentLog(prev => [
        ...prev,
        'Risk optimization generated: +18 bps margin recapture on Tier 2 Personal Loans.',
        'Adjusted BNPL early-loss velocity threshold by -1.2%.'
      ]);
    }, 1800);

    setTimeout(() => {
      setAgentProgress(100);
      setAgentLog(prev => [
        ...prev,
        'Syncing new automated risk policy to live underwriting gateways...',
        'Execution completed. 4 products updated with autonomous risk-adjusted pricing.'
      ]);

      // Apply updates to state
      setProducts(prev =>
        prev.map(p => {
          if (p.status === 'ACTIVE' || p.status === 'AI_OPTIMIZING') {
            return {
              ...p,
              minApr: Number((p.minApr + 0.15).toFixed(2)),
              lastUpdated: new Date().toISOString(),
              status: 'ACTIVE'
            };
          }
          return p;
        })
      );

      setIsAgentRunning(false);
      showNotification('AI Agent successfully rebalanced product yield & underwriting policies!', 'success');
    }, 2800);
  };

  const handleOpenCreateModal = () => {
    setFormData({
      code: `UNSEC-${Math.floor(1000 + Math.random() * 9000)}`,
      name: '',
      category: 'PERSONAL_LOAN',
      status: 'DRAFT',
      riskTier: 'BALANCED',
      minAmount: 1000,
      maxAmount: 25000,
      minApr: 6.99,
      maxApr: 23.99,
      currency: 'USD',
      description: '',
      requiresInstantIncomeVerification: true,
      instantApprovalThreshold: 680,
      lossProvisionPct: 1.75,
      pricingTiers: [
        {
          id: 'tier-1',
          minCreditScore: 720,
          maxCreditScore: 850,
          baseApr: 6.99,
          maxApr: 11.99,
          originationFeePct: 0.5,
          maxTermMonths: 60,
          maxLimit: 25000
        },
        {
          id: 'tier-2',
          minCreditScore: 620,
          maxCreditScore: 719,
          baseApr: 12.99,
          maxApr: 23.99,
          originationFeePct: 2.5,
          maxTermMonths: 36,
          maxLimit: 12000
        }
      ],
      aiRules: [
        {
          id: 'rule-1',
          name: 'Real-time DTI Elasticity Guard',
          triggerCondition: 'Customer aggregate debt-to-income spikes above 42%',
          autonomousAction: 'Reduce pre-approved ceiling to $8,500',
          confidenceScore: 0.94,
          isActive: true
        }
      ]
    });
    setFormStep(1);
    setIsFormOpen(true);
  };

  const handleEditProduct = (product: UnsecuredProduct) => {
    setFormData({ ...product });
    setFormStep(1);
    setIsFormOpen(true);
  };

  const handleSaveProduct = () => {
    if (!formData.name || !formData.code) {
      showNotification('Please fill in required fields (Name and Product Code)', 'warning');
      return;
    }

    if (formData.id) {
      // Update existing
      setProducts(prev =>
        prev.map(p =>
          p.id === formData.id
            ? ({
                ...p,
                ...formData,
                lastUpdated: new Date().toISOString()
              } as UnsecuredProduct)
            : p
        )
      );
      showNotification(`Product "${formData.name}" successfully updated.`, 'success');
    } else {
      // Create new
      const newProduct: UnsecuredProduct = {
        id: `prod-${Date.now()}`,
        code: formData.code || 'PL-NEW',
        name: formData.name || 'Untitled Product',
        category: formData.category || 'PERSONAL_LOAN',
        status: (formData.status as ProductStatus) || 'ACTIVE',
        riskTier: formData.riskTier || 'BALANCED',
        minAmount: Number(formData.minAmount) || 1000,
        maxAmount: Number(formData.maxAmount) || 25000,
        minApr: Number(formData.minApr) || 7.99,
        maxApr: Number(formData.maxApr) || 24.99,
        avgApprovalRate: 65.0,
        activeAccountsCount: 0,
        portfolioVolume: 0,
        currency: formData.currency || 'USD',
        lastUpdated: new Date().toISOString(),
        description: formData.description || '',
        requiresInstantIncomeVerification: !!formData.requiresInstantIncomeVerification,
        instantApprovalThreshold: Number(formData.instantApprovalThreshold) || 680,
        lossProvisionPct: Number(formData.lossProvisionPct) || 1.5,
        pricingTiers: formData.pricingTiers || [],
        aiRules: formData.aiRules || []
      };

      setProducts(prev => [newProduct, ...prev]);
      showNotification(`New Unsecured Product "${newProduct.name}" deployed to catalogue.`, 'success');
    }

    setIsFormOpen(false);
  };

  const handleToggleProductStatus = (id: string) => {
    setProducts(prev =>
      prev.map(p => {
        if (p.id === id) {
          const nextStatus: ProductStatus = p.status === 'ACTIVE' ? 'PAUSED' : 'ACTIVE';
          return {
            ...p,
            status: nextStatus,
            lastUpdated: new Date().toISOString()
          };
        }
        return p;
      })
    );
  };

  const handleDeleteProduct = (id: string, name: string) => {
    if (window.confirm(`Are you sure you want to remove "${name}" from the active manager?`)) {
      setProducts(prev => prev.filter(p => p.id !== id));
      if (selectedProduct?.id === id) {
        setSelectedProduct(null);
      }
      showNotification(`Product "${name}" has been deleted.`, 'info');
    }
  };

  const handleDuplicateProduct = (prod: UnsecuredProduct) => {
    const duplicated: UnsecuredProduct = {
      ...prod,
      id: `prod-${Date.now()}`,
      code: `${prod.code}-COPY`,
      name: `${prod.name} (Clone)`,
      status: 'DRAFT',
      portfolioVolume: 0,
      activeAccountsCount: 0,
      lastUpdated: new Date().toISOString()
    };
    setProducts(prev => [duplicated, ...prev]);
    showNotification(`Cloned product created: ${duplicated.name}`, 'info');
  };

  const formatCurrency = (val: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(val);
  };

  const getStatusBadge = (status: ProductStatus) => {
    switch (status) {
      case 'ACTIVE':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-950/60 text-emerald-400 border border-emerald-800/60">
            <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            Live / Active
          </span>
        );
      case 'AI_OPTIMIZING':
        return (
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-950/60 text-indigo-300 border border-indigo-700/60">
            <Bot className="w-3 h-3 text-indigo-400 animate-spin" />
            AI Optimizing
          </span>
        );
      case 'PAUSED':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-950/60 text-amber-400 border border-amber-800/60">
            <Pause className="w-3 h-3" />
            Paused
          </span>
        );
      case 'DRAFT':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-300 border border-slate-700">
            <Clock className="w-3 h-3 text-slate-400" />
            Draft
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            {status}
          </span>
        );
    }
  };

  const getRiskBadge = (tier: RiskLevel) => {
    switch (tier) {
      case 'LOW':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-blue-950 text-blue-300 border border-blue-800/50">Low Risk (Prime)</span>;
      case 'BALANCED':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-cyan-950 text-cyan-300 border border-cyan-800/50">Balanced (Near-Prime)</span>;
      case 'AGGRESSIVE':
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-purple-950 text-purple-300 border border-purple-800/50">Growth (Subprime/Alt)</span>;
      default:
        return <span className="px-2 py-0.5 rounded text-[11px] font-medium bg-slate-800 text-slate-300">Custom</span>;
    }
  };

  return (
    <div className="w-full min-h-screen bg-slate-950 text-slate-100 p-4 sm:p-6 lg:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* Toast Notification */}
      {notification && (
        <div className="fixed top-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border bg-slate-900 border-indigo-500/40 text-slate-100 transition-all duration-300 transform translate-y-0">
          <div className="p-1 rounded-lg bg-indigo-500/20 text-indigo-400">
            <Sparkles className="w-5 h-5" />
          </div>
          <p className="text-sm font-medium">{notification.message}</p>
          <button onClick={() => setNotification(null)} className="text-slate-400 hover:text-slate-200">
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Top Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-6 border-b border-slate-800/80">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-indigo-600 to-violet-500 shadow-lg shadow-indigo-500/20">
              <CreditCard className="w-6 h-6 text-white" />
            </div>
            <div>
              <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-white flex items-center gap-2">
                Unsecured Product Manager
                <span className="text-xs font-semibold px-2.5 py-0.5 rounded-full bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                  AI Orchestrated
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Multi-channel product portfolio orchestration, autonomous risk bounds & automated yield tuning.
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 flex-wrap">
          <button
            onClick={runAutonomousAgentOptimization}
            disabled={isAgentRunning}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold transition-all duration-200 shadow-md ${
              isAgentRunning
                ? 'bg-slate-800 text-slate-400 cursor-not-allowed border border-slate-700'
                : 'bg-gradient-to-r from-violet-600 to-indigo-600 hover:from-violet-500 hover:to-indigo-500 text-white shadow-indigo-500/25 active:scale-95'
            }`}
          >
            <Bot className={`w-4 h-4 ${isAgentRunning ? 'animate-spin text-indigo-400' : ''}`} />
            {isAgentRunning ? 'Agent Rebalancing...' : 'Run Autonomous Re-Pricing'}
          </button>

          <button
            onClick={handleOpenCreateModal}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl text-sm font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-md shadow-emerald-600/20 active:scale-95 transition-all"
          >
            <Plus className="w-4 h-4" />
            Add New Product
          </button>
        </div>
      </div>

      {/* Autonomous Agent Live Banner / Feedback */}
      {isAgentRunning && (
        <div className="mt-6 p-4 rounded-2xl bg-gradient-to-r from-indigo-950/80 via-slate-900 to-violet-950/80 border border-indigo-500/40 shadow-xl">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center gap-2 text-indigo-300 text-sm font-semibold">
              <Zap className="w-4 h-4 text-amber-400 fill-amber-400 animate-pulse" />
              Autonomous Policy Agent Execution in Progress
            </div>
            <span className="text-xs font-mono text-indigo-300">{agentProgress}% complete</span>
          </div>
          <div className="w-full bg-slate-800/80 rounded-full h-2 overflow-hidden mb-3">
            <div
              className="bg-gradient-to-r from-indigo-500 to-violet-400 h-2 rounded-full transition-all duration-500"
              style={{ width: `${agentProgress}%` }}
            />
          </div>
          <div className="text-xs font-mono text-slate-300 space-y-1">
            {agentLog.slice(-2).map((log, idx) => (
              <div key={idx} className="flex items-center gap-2">
                <span className="text-indigo-400">›</span> {log}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* KPI Ribbon */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-4 mt-6">
        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Portfolio Exposure</span>
            <DollarSign className="w-4 h-4 text-emerald-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {formatCurrency(portfolioKpis.totalVolume)}
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <ArrowUpRight className="w-3 h-3" /> +14.2% vs last quarter
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Active Accounts</span>
            <Layers className="w-4 h-4 text-blue-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {portfolioKpis.totalAccounts.toLocaleString()}
          </div>
          <div className="text-[11px] text-blue-400 font-medium flex items-center gap-1 mt-1">
            Across {portfolioKpis.activeProducts} live product codes
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Weighted APR Index</span>
            <Percent className="w-4 h-4 text-violet-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {portfolioKpis.avgApr}%
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            AI risk-spread balanced
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>Avg Approval Ratio</span>
            <Activity className="w-4 h-4 text-amber-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-white tracking-tight">
            {portfolioKpis.avgApproval}%
          </div>
          <div className="text-[11px] text-emerald-400 font-medium flex items-center gap-1 mt-1">
            <CheckCircle2 className="w-3 h-3" /> Auto Underwritten 92%
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800/80 backdrop-blur col-span-2 lg:col-span-1">
          <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-1">
            <span>AI Guardrails</span>
            <ShieldCheck className="w-4 h-4 text-indigo-400" />
          </div>
          <div className="text-xl sm:text-2xl font-bold text-indigo-300 tracking-tight flex items-center gap-2">
            100%
            <span className="text-xs font-normal text-slate-400">Enforced</span>
          </div>
          <div className="text-[11px] text-slate-400 font-medium mt-1">
            Zero regulatory slippage
          </div>
        </div>
      </div>

      {/* Category Tabs & Quick Action Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mt-8 pb-4 border-b border-slate-800">
        <div className="flex items-center gap-2 overflow-x-auto pb-2 md:pb-0 scrollbar-none">
          {[
            { id: 'all', label: 'All Products' },
            { id: 'PERSONAL_LOAN', label: 'Personal Loans' },
            { id: 'CREDIT_CARD', label: 'Credit Cards' },
            { id: 'REVOLVING_LINE', label: 'Revolving Lines' },
            { id: 'BNPL', label: 'BNPL / POS' },
          ].map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800 border border-slate-800'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Search & Secondary Filters */}
        <div className="flex items-center gap-2.5">
          <div className="relative w-full md:w-64">
            <Search className="w-4 h-4 absolute left-3 top-2.5 text-slate-500" />
            <input
              type="text"
              placeholder="Search product, code, tier..."
              value={filters.searchQuery}
              onChange={(e) => setFilters(prev => ({ ...prev, searchQuery: e.target.value }))}
              className="w-full pl-9 pr-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="ACTIVE">Active</option>
            <option value="AI_OPTIMIZING">AI Optimizing</option>
            <option value="PAUSED">Paused</option>
            <option value="DRAFT">Draft</option>
          </select>

          <select
            value={filters.riskTier}
            onChange={(e) => setFilters(prev => ({ ...prev, riskTier: e.target.value }))}
            className="px-3 py-1.5 text-xs bg-slate-900 border border-slate-800 rounded-xl text-slate-300 focus:outline-none focus:border-indigo-500"
          >
            <option value="ALL">All Risk Tiers</option>
            <option value="LOW">Low (Prime)</option>
            <option value="BALANCED">Balanced</option>
            <option value="AGGRESSIVE">Aggressive</option>
          </select>
        </div>
      </div>

      {/* Main Content Area: Products Grid / Table */}
      <div className="mt-6">
        {filteredProducts.length === 0 ? (
          <div className="p-12 text-center rounded-2xl bg-slate-900/40 border border-dashed border-slate-800">
            <AlertCircle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
            <h3 className="text-base font-semibold text-slate-300">No Unsecured Products Match Query</h3>
            <p className="text-xs text-slate-500 mt-1 max-w-sm mx-auto">
              Try adjusting your filter settings or search query, or deploy a new unsecured lending product.
            </p>
            <button
              onClick={() => {
                setFilters({ searchQuery: '', category: 'ALL', status: 'ALL', riskTier: 'ALL', sortBy: 'portfolioVolume', sortOrder: 'desc' });
                setActiveTab('all');
              }}
              className="mt-4 px-4 py-2 text-xs font-semibold bg-slate-800 text-indigo-400 hover:bg-slate-700 rounded-xl"
            >
              Reset Filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-5">
            {filteredProducts.map((prod) => (
              <div
                key={prod.id}
                className="group relative flex flex-col justify-between p-5 rounded-2xl bg-slate-900/90 border border-slate-800/90 hover:border-indigo-500/50 hover:shadow-xl hover:shadow-indigo-500/5 transition-all duration-200"
              >
                <div>
                  {/* Card Header */}
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="font-mono text-[11px] text-indigo-400 font-semibold uppercase tracking-wider">
                          {prod.code}
                        </span>
                        {getRiskBadge(prod.riskTier)}
                      </div>
                      <h3 className="text-base font-bold text-white group-hover:text-indigo-300 transition-colors">
                        {prod.name}
                      </h3>
                    </div>
                    {getStatusBadge(prod.status)}
                  </div>

                  <p className="text-xs text-slate-400 mt-2 line-clamp-2 leading-relaxed">
                    {prod.description}
                  </p>

                  {/* Core Metrics */}
                  <div className="grid grid-cols-2 gap-3 my-4 p-3 rounded-xl bg-slate-950/70 border border-slate-800/80">
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase">APR Range</div>
                      <div className="text-sm font-semibold text-slate-100">
                        {prod.minApr}% - {prod.maxApr}%
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase">Credit Limit</div>
                      <div className="text-sm font-semibold text-slate-100">
                        {formatCurrency(prod.minAmount)} - {formatCurrency(prod.maxAmount)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase">Active Volume</div>
                      <div className="text-sm font-semibold text-emerald-400">
                        {formatCurrency(prod.portfolioVolume)}
                      </div>
                    </div>
                    <div>
                      <div className="text-[10px] text-slate-500 font-medium uppercase">Auto-Approve Cutoff</div>
                      <div className="text-sm font-semibold text-indigo-300">
                        Score ≥ {prod.instantApprovalThreshold}
                      </div>
                    </div>
                  </div>

                  {/* Pricing Tiers & Active Rules Summary */}
                  <div className="space-y-2">
                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <SlidersHorizontal className="w-3.5 h-3.5 text-slate-500" />
                        Pricing Tiers
                      </span>
                      <span className="font-mono text-slate-300">{prod.pricingTiers.length} Defined</span>
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400">
                      <span className="flex items-center gap-1.5">
                        <Bot className="w-3.5 h-3.5 text-indigo-400" />
                        AI Guardrails
                      </span>
                      <span className="font-mono text-indigo-300">
                        {prod.aiRules.filter(r => r.isActive).length} Active
                      </span>
                    </div>
                  </div>
                </div>

                {/* Actions Footer */}
                <div className="mt-5 pt-4 border-t border-slate-800/80 flex items-center justify-between gap-2">
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => handleToggleProductStatus(prod.id)}
                      title={prod.status === 'ACTIVE' ? 'Pause product' : 'Activate product'}
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      {prod.status === 'ACTIVE' ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 text-emerald-400" />}
                    </button>
                    <button
                      onClick={() => handleDuplicateProduct(prod)}
                      title="Clone product template"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      <Copy className="w-3.5 h-3.5" />
                    </button>
                    <button
                      onClick={() => handleDeleteProduct(prod.id, prod.name)}
                      title="Delete product"
                      className="p-1.5 rounded-lg bg-slate-800/80 hover:bg-rose-950/60 hover:text-rose-400 text-slate-400 transition-colors"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => {
                        setSelectedProduct(prod);
                        setIsAgentDrawerOpen(true);
                      }}
                      className="flex items-center gap-1 px-2.5 py-1.5 rounded-lg text-xs font-semibold bg-indigo-950/60 text-indigo-300 hover:bg-indigo-900/60 border border-indigo-700/50 transition-colors"
                    >
                      <Bot className="w-3.5 h-3.5 text-indigo-400" />
                      Agent AI
                    </button>
                    <button
                      onClick={() => handleEditProduct(prod)}
                      className="flex items-center gap-1 px-3 py-1.5 rounded-lg text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white transition-colors"
                    >
                      <Edit3 className="w-3.5 h-3.5" />
                      Configure
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* PRODUCT CREATION / EDIT MODAL (Multi-step Wizard) */}
      {isFormOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md">
          <div className="relative w-full max-w-3xl bg-slate-900 border border-slate-800 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]">
            {/* Modal Header */}
            <div className="p-6 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-white flex items-center gap-2">
                  <SlidersHorizontal className="w-5 h-5 text-indigo-400" />
                  {formData.id ? 'Configure Unsecured Product' : 'Create New Unsecured Product'}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Define automated bounds, yield matrix, and autonomous underwriter parameters.
                </p>
              </div>
              <button
                onClick={() => setIsFormOpen(false)}
                className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-slate-800"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Stepper Header */}
            <div className="grid grid-cols-3 border-b border-slate-800 bg-slate-950/50 text-xs">
              <button
                onClick={() => setFormStep(1)}
                className={`py-3 font-semibold text-center border-b-2 transition-colors ${
                  formStep === 1
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                1. General Parameters
              </button>
              <button
                onClick={() => setFormStep(2)}
                className={`py-3 font-semibold text-center border-b-2 transition-colors ${
                  formStep === 2
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                2. Pricing & Risk Tiers
              </button>
              <button
                onClick={() => setFormStep(3)}
                className={`py-3 font-semibold text-center border-b-2 transition-colors ${
                  formStep === 3
                    ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                    : 'border-transparent text-slate-400 hover:text-slate-300'
                }`}
              >
                3. AI Agent Guardrails
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-6 overflow-y-auto space-y-6 flex-1">
              {formStep === 1 && (
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Product Display Name *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. Apex Premier Personal Credit"
                        value={formData.name || ''}
                        onChange={e => setFormData({ ...formData, name: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Product Code / SKU *
                      </label>
                      <input
                        type="text"
                        placeholder="e.g. PL-APEX-2025"
                        value={formData.code || ''}
                        onChange={e => setFormData({ ...formData, code: e.target.value })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white font-mono uppercase focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Product Category
                      </label>
                      <select
                        value={formData.category}
                        onChange={e => setFormData({ ...formData, category: e.target.value as ProductCategory })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="PERSONAL_LOAN">Personal Loan</option>
                        <option value="CREDIT_CARD">Credit Card</option>
                        <option value="REVOLVING_LINE">Revolving Line of Credit</option>
                        <option value="BNPL">Buy Now Pay Later</option>
                        <option value="MERCHANT_CASH_ADVANCE">Merchant Cash Advance</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Risk Posture
                      </label>
                      <select
                        value={formData.riskTier}
                        onChange={e => setFormData({ ...formData, riskTier: e.target.value as RiskLevel })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="LOW">Low Risk (Prime 720+)</option>
                        <option value="BALANCED">Balanced (Near Prime 640-719)</option>
                        <option value="AGGRESSIVE">Aggressive (Subprime 580-639)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Lifecycle Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={e => setFormData({ ...formData, status: e.target.value as ProductStatus })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-slate-200 focus:outline-none focus:border-indigo-500"
                      >
                        <option value="ACTIVE">Active (Available)</option>
                        <option value="DRAFT">Draft</option>
                        <option value="PAUSED">Paused</option>
                        <option value="AI_OPTIMIZING">AI Optimizing</option>
                      </select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Min Principal / Limit ($)
                      </label>
                      <input
                        type="number"
                        value={formData.minAmount || ''}
                        onChange={e => setFormData({ ...formData, minAmount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                        Max Principal / Limit ($)
                      </label>
                      <input
                        type="number"
                        value={formData.maxAmount || ''}
                        onChange={e => setFormData({ ...formData, maxAmount: Number(e.target.value) })}
                        className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-300 mb-1.5">
                      Product Description
                    </label>
                    <textarea
                      rows={3}
                      placeholder="Enter customer and underwriter product overview..."
                      value={formData.description || ''}
                      onChange={e => setFormData({ ...formData, description: e.target.value })}
                      className="w-full px-3.5 py-2 text-sm bg-slate-950 border border-slate-800 rounded-xl text-white focus:outline-none focus:border-indigo-500"
                    />
                  </div>
                </div>
              )}

              {formStep === 2 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">Underwriting & APR Matrix</h4>
                      <p className="text-xs text-slate-400">Define risk grade cutoffs and automated fee schedule.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newTier: PricingTier = {
                          id: `tier-${Date.now()}`,
                          minCreditScore: 600,
                          maxCreditScore: 699,
                          baseApr: 14.99,
                          maxApr: 22.99,
                          originationFeePct: 2.0,
                          maxTermMonths: 36,
                          maxLimit: 10000
                        };
                        setFormData({
                          ...formData,
                          pricingTiers: [...(formData.pricingTiers || []), newTier]
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 rounded-xl border border-indigo-500/40"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add Tier
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.pricingTiers?.map((tier, index) => (
                      <div key={tier.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between text-xs font-semibold text-indigo-400">
                          <span>Tier #{index + 1} ({tier.minCreditScore} - {tier.maxCreditScore} FICO)</span>
                          {formData.pricingTiers && formData.pricingTiers.length > 1 && (
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  pricingTiers: formData.pricingTiers?.filter(t => t.id !== tier.id)
                                });
                              }}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          )}
                        </div>

                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
                          <div>
                            <label className="text-slate-400 block mb-1">Min Score</label>
                            <input
                              type="number"
                              value={tier.minCreditScore}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setFormData({
                                  ...formData,
                                  pricingTiers: formData.pricingTiers?.map(t => t.id === tier.id ? { ...t, minCreditScore: val } : t)
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 block mb-1">Max Score</label>
                            <input
                              type="number"
                              value={tier.maxCreditScore}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setFormData({
                                  ...formData,
                                  pricingTiers: formData.pricingTiers?.map(t => t.id === tier.id ? { ...t, maxCreditScore: val } : t)
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 block mb-1">Base APR (%)</label>
                            <input
                              type="number"
                              step="0.01"
                              value={tier.baseApr}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setFormData({
                                  ...formData,
                                  pricingTiers: formData.pricingTiers?.map(t => t.id === tier.id ? { ...t, baseApr: val } : t)
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                            />
                          </div>

                          <div>
                            <label className="text-slate-400 block mb-1">Max Ceiling ($)</label>
                            <input
                              type="number"
                              value={tier.maxLimit}
                              onChange={e => {
                                const val = Number(e.target.value);
                                setFormData({
                                  ...formData,
                                  pricingTiers: formData.pricingTiers?.map(t => t.id === tier.id ? { ...t, maxLimit: val } : t)
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-white"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 pt-2">
                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">Instant Income Check</div>
                        <div className="text-[11px] text-slate-400">Plaid / Open Banking requirement</div>
                      </div>
                      <input
                        type="checkbox"
                        checked={formData.requiresInstantIncomeVerification ?? true}
                        onChange={e => setFormData({ ...formData, requiresInstantIncomeVerification: e.target.checked })}
                        className="w-4 h-4 accent-indigo-600 rounded"
                      />
                    </div>

                    <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
                      <div>
                        <div className="text-xs font-semibold text-white">Instant Approval Cutoff</div>
                        <div className="text-[11px] text-slate-400">Minimum automated FICO</div>
                      </div>
                      <input
                        type="number"
                        value={formData.instantApprovalThreshold || 680}
                        onChange={e => setFormData({ ...formData, instantApprovalThreshold: Number(e.target.value) })}
                        className="w-20 px-2 py-1 bg-slate-900 border border-slate-800 rounded-lg text-right text-xs font-mono text-white"
                      />
                    </div>
                  </div>
                </div>
              )}

              {formStep === 3 && (
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h4 className="text-sm font-semibold text-white">AI Autonomous Agent Triggers</h4>
                      <p className="text-xs text-slate-400">Self-regulating policies that execute automatically on portfolio events.</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        const newRule: AIAgentRule = {
                          id: `rule-${Date.now()}`,
                          name: 'Custom Market Elasticity Guard',
                          triggerCondition: '30-day default rate changes by > 0.5%',
                          autonomousAction: 'Shift base rate spread by 25 bps',
                          confidenceScore: 0.92,
                          isActive: true
                        };
                        setFormData({
                          ...formData,
                          aiRules: [...(formData.aiRules || []), newRule]
                        });
                      }}
                      className="flex items-center gap-1 px-3 py-1.5 text-xs font-semibold bg-indigo-600/30 text-indigo-300 hover:bg-indigo-600/50 rounded-xl border border-indigo-500/40"
                    >
                      <Plus className="w-3.5 h-3.5" /> Add AI Guardrail
                    </button>
                  </div>

                  <div className="space-y-3">
                    {formData.aiRules?.map((rule) => (
                      <div key={rule.id} className="p-4 rounded-xl bg-slate-950 border border-slate-800 space-y-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            <Bot className="w-4 h-4 text-indigo-400" />
                            <input
                              type="text"
                              value={rule.name}
                              onChange={e => {
                                const val = e.target.value;
                                setFormData({
                                  ...formData,
                                  aiRules: formData.aiRules?.map(r => r.id === rule.id ? { ...r, name: val } : r)
                                });
                              }}
                              className="bg-transparent text-xs font-semibold text-white border-b border-transparent focus:border-indigo-500 focus:outline-none"
                            />
                          </div>
                          <div className="flex items-center gap-3">
                            <span className="text-[11px] font-mono text-emerald-400">
                              {(rule.confidenceScore * 100).toFixed(0)}% AI Conf.
                            </span>
                            <button
                              type="button"
                              onClick={() => {
                                setFormData({
                                  ...formData,
                                  aiRules: formData.aiRules?.filter(r => r.id !== rule.id)
                                });
                              }}
                              className="text-slate-500 hover:text-rose-400"
                            >
                              <Trash2 className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs">
                          <div>
                            <label className="text-slate-500 block mb-1">Trigger Condition</label>
                            <input
                              type="text"
                              value={rule.triggerCondition}
                              onChange={e => {
                                const val = e.target.value;
                                setFormData({
                                  ...formData,
                                  aiRules: formData.aiRules?.map(r => r.id === rule.id ? { ...r, triggerCondition: val } : r)
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
                            />
                          </div>
                          <div>
                            <label className="text-slate-500 block mb-1">Autonomous Execution</label>
                            <input
                              type="text"
                              value={rule.autonomousAction}
                              onChange={e => {
                                const val = e.target.value;
                                setFormData({
                                  ...formData,
                                  aiRules: formData.aiRules?.map(r => r.id === rule.id ? { ...r, autonomousAction: val } : r)
                                });
                              }}
                              className="w-full px-2.5 py-1.5 bg-slate-900 border border-slate-800 rounded-lg text-slate-300"
                            />
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Modal Footer */}
            <div className="p-4 border-t border-slate-800 bg-slate-900 flex items-center justify-between">
              <button
                type="button"
                onClick={() => {
                  if (formStep > 1) setFormStep((formStep - 1) as any);
                }}
                disabled={formStep === 1}
                className={`px-4 py-2 rounded-xl text-xs font-semibold ${
                  formStep === 1 ? 'opacity-0 pointer-events-none' : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                Previous
              </button>

              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setIsFormOpen(false)}
                  className="px-4 py-2 rounded-xl text-xs font-semibold bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>

                {formStep < 3 ? (
                  <button
                    type="button"
                    onClick={() => setFormStep((formStep + 1) as any)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold bg-indigo-600 hover:bg-indigo-500 text-white flex items-center gap-1"
                  >
                    Next Step <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <button
                    type="button"
                    onClick={handleSaveProduct}
                    className="px-5 py-2 rounded-xl text-xs font-semibold bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-600/20"
                  >
                    Deploy Product
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* AI AGENT DETAIL DRAWER */}
      {isAgentDrawerOpen && selectedProduct && (
        <div className="fixed inset-0 z-50 flex justify-end bg-slate-950/70 backdrop-blur-sm">
          <div className="w-full max-w-md bg-slate-900 border-l border-slate-800 h-full p-6 overflow-y-auto flex flex-col justify-between shadow-2xl">
            <div>
              <div className="flex items-center justify-between pb-4 border-b border-slate-800">
                <div className="flex items-center gap-2">
                  <div className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
                    <Bot className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-sm font-bold text-white">AI Copilot & Policy Underwriter</h3>
                    <p className="text-[11px] text-slate-400">{selectedProduct.name}</p>
                  </div>
                </div>
                <button
                  onClick={() => setIsAgentDrawerOpen(false)}
                  className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Real-time Health Metrics */}
              <div className="mt-6 space-y-4">
                <div className="p-4 rounded-2xl bg-indigo-950/40 border border-indigo-800/40">
                  <div className="flex items-center justify-between text-xs text-indigo-300 font-semibold mb-2">
                    <span>Autonomous Yield Optimization</span>
                    <span className="text-emerald-400">Active (99.8% Uptime)</span>
                  </div>
                  <p className="text-xs text-slate-300 leading-relaxed">
                    AI agent continuous underwriter is scanning incoming application cashflows, adjusting credit lines and APR tiers in micro-batches.
                  </p>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">
                    Active Agent Guardrails
                  </h4>
                  <div className="space-y-3">
                    {selectedProduct.aiRules.map((rule) => (
                      <div key={rule.id} className="p-3 rounded-xl bg-slate-900/80 border border-slate-800 text-xs">
                        <div className="flex items-center justify-between font-semibold text-slate-200 mb-1">
                          <span>{rule.name}</span>
                          <span className="text-indigo-400 text-[10px]">
                            {(rule.confidenceScore * 100).toFixed(0)}% Conf.
                          </span>
                        </div>
                        <div className="text-[11px] text-slate-400">
                          <span className="text-slate-500">Trigger:</span> {rule.triggerCondition}
                        </div>
                        <div className="text-[11px] text-emerald-400 mt-0.5">
                          <span className="text-slate-500">Action:</span> {rule.autonomousAction}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
                  <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-2">
                    Instant Simulation
                  </h4>
                  <button
                    onClick={() => {
                      showNotification(`Autonomous risk test simulated for ${selectedProduct.name}`, 'info');
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-xl transition-colors text-center"
                  >
                    Run 10,000 Portfolio Shock Test
                  </button>
                  <button
                    onClick={() => {
                      showNotification(`Yield curve recalculated for ${selectedProduct.code}`, 'success');
                    }}
                    className="w-full py-2 px-3 text-xs font-semibold bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-300 rounded-xl transition-colors border border-indigo-500/40 text-center"
                  >
                    Force Immediate Re-underwrite
                  </button>
                </div>
              </div>
            </div>

            <div className="pt-4 border-t border-slate-800">
              <button
                onClick={() => setIsAgentDrawerOpen(false)}
                className="w-full py-2.5 text-xs font-semibold bg-slate-800 hover:bg-slate-700 text-white rounded-xl"
              >
                Close Agent Console
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UnsecuredProductManager;