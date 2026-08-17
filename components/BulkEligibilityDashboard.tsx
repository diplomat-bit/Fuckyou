import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  ArrowUpRight, 
  Coins, 
  Users, 
  CheckCircle2, 
  XCircle, 
  AlertTriangle, 
  Search, 
  SlidersHorizontal, 
  RefreshCw, 
  Download, 
  FileSpreadsheet, 
  Layers, 
  TrendingUp, 
  DollarSign, 
  HelpCircle, 
  Info,
  ChevronRight,
  Play,
  Sliders,
  Activity,
  Database,
  Check,
  X
} from 'lucide-react';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  Legend
} from 'recharts';

// ==========================================
// TYPES & INTERFACES
// ==========================================

export interface SourceAccount {
  id: string;
  accountNumber: string;
  name: string;
  bankName: string;
  balance: number;
  currency: string;
  type: 'Operating' | 'Payroll' | 'Treasury' | 'Escrow';
  routingNumber: string;
  status: 'Active' | 'Suspended' | 'Restricted';
}

export interface PayeeCombination {
  id: string;
  sourceAccountId: string;
  payeeName: string;
  payeeAccount: string;
  payeeRouting: string;
  payeeBank: string;
  amount: number;
  currency: string;
  paymentType: 'ACH' | 'Wire' | 'RTP';
  riskScore: number; // 0 to 100
  jurisdiction: 'Domestic' | 'International';
  category: 'Vendor' | 'Tax' | 'Payroll' | 'Intercompany';
  lastPaymentDate?: string;
}

export interface SimulationRules {
  maxTransactionLimit: number;
  maxRiskScore: number;
  allowInternational: boolean;
  requireActiveSource: boolean;
  enforceBalanceCheck: boolean;
  allowedPaymentTypes: ('ACH' | 'Wire' | 'RTP')[];
}

export interface SimulationResult {
  combinationId: string;
  eligible: boolean;
  reasons: string[];
  adjustedRiskScore: number;
  estimatedFee: number;
}

export interface AuditLog {
  timestamp: string;
  type: 'info' | 'warning' | 'success' | 'error';
  message: string;
}

// ==========================================
// MOCK DATA SERVICE
// ==========================================

const INITIAL_SOURCE_ACCOUNTS: SourceAccount[] = [
  { id: 'src-1', accountNumber: '•••• 8829', name: 'SVB Primary Operating', bankName: 'Silicon Valley Bank', balance: 12450000, currency: 'USD', type: 'Operating', routingNumber: '021000021', status: 'Active' },
  { id: 'src-2', accountNumber: '•••• 4412', name: 'Chase Payroll Account', bankName: 'JPMorgan Chase', balance: 1850000, currency: 'USD', type: 'Payroll', routingNumber: '021000022', status: 'Active' },
  { id: 'src-3', accountNumber: '•••• 9901', name: 'BoA Treasury Reserve', bankName: 'Bank of America', balance: 45000000, currency: 'USD', type: 'Treasury', routingNumber: '021000023', status: 'Active' },
  { id: 'src-4', accountNumber: '•••• 1105', name: 'Wells Fargo Escrow', bankName: 'Wells Fargo', balance: 750000, currency: 'USD', type: 'Escrow', routingNumber: '021000024', status: 'Restricted' },
  { id: 'src-5', accountNumber: '•••• 3388', name: 'Barclays UK Operating', bankName: 'Barclays', balance: 3200000, currency: 'GBP', type: 'Operating', routingNumber: '021000025', status: 'Active' },
];

const INITIAL_PAYEE_COMBINATIONS: PayeeCombination[] = [
  { id: 'comb-1', sourceAccountId: 'src-1', payeeName: 'Acme Global Logistics', payeeAccount: '•••• 5543', payeeRouting: '121000248', payeeBank: 'Citibank', amount: 450000, currency: 'USD', paymentType: 'Wire', riskScore: 12, jurisdiction: 'Domestic', category: 'Vendor', lastPaymentDate: '2024-02-15' },
  { id: 'comb-2', sourceAccountId: 'src-1', payeeName: 'Vertex Tax Solutions', payeeAccount: '•••• 1122', payeeRouting: '021000021', payeeBank: 'Chase', amount: 125000, currency: 'USD', paymentType: 'ACH', riskScore: 5, jurisdiction: 'Domestic', category: 'Tax', lastPaymentDate: '2024-01-10' },
  { id: 'comb-3', sourceAccountId: 'src-2', payeeName: 'Deel Contractor Hub', payeeAccount: '•••• 9081', payeeRouting: '021000018', payeeBank: 'SVB', amount: 1950000, currency: 'USD', paymentType: 'ACH', riskScore: 28, jurisdiction: 'International', category: 'Payroll', lastPaymentDate: '2024-02-28' },
  { id: 'comb-4', sourceAccountId: 'src-3', payeeName: 'Stripe Inc.', payeeAccount: '•••• 7766', payeeRouting: '121000248', payeeBank: 'Wells Fargo', amount: 8500000, currency: 'USD', paymentType: 'RTP', riskScore: 18, jurisdiction: 'Domestic', category: 'Vendor', lastPaymentDate: '2024-02-20' },
  { id: 'comb-5', sourceAccountId: 'src-4', payeeName: 'Apex Real Estate Holdings', payeeAccount: '•••• 3344', payeeRouting: '021000021', payeeBank: 'Chase', amount: 900000, currency: 'USD', paymentType: 'Wire', riskScore: 75, jurisdiction: 'Domestic', category: 'Vendor', lastPaymentDate: '2023-12-05' },
  { id: 'comb-6', sourceAccountId: 'src-1', payeeName: 'Shenzhen Tech Components', payeeAccount: '•••• 8877', payeeRouting: '998877665', payeeBank: 'Bank of China', amount: 1200000, currency: 'USD', paymentType: 'Wire', riskScore: 62, jurisdiction: 'International', category: 'Vendor', lastPaymentDate: '2024-02-01' },
  { id: 'comb-7', sourceAccountId: 'src-3', payeeName: 'Internal Treasury Sweep', payeeAccount: '•••• 4412', payeeRouting: '021000022', payeeBank: 'Chase', amount: 15000000, currency: 'USD', paymentType: 'RTP', riskScore: 2, jurisdiction: 'Domestic', category: 'Intercompany', lastPaymentDate: '2024-03-01' },
  { id: 'comb-8', sourceAccountId: 'src-5', payeeName: 'Eurozone Cloud Services', payeeAccount: '•••• 2211', payeeRouting: '443322110', payeeBank: 'Deutsche Bank', amount: 350000, currency: 'GBP', type: 'Operating', paymentType: 'Wire', riskScore: 45, jurisdiction: 'International', category: 'Vendor', lastPaymentDate: '2024-02-18' } as any,
  { id: 'comb-9', sourceAccountId: 'src-2', payeeName: 'Hedgehog Security Ltd', payeeAccount: '•••• 6655', payeeRouting: '021000021', payeeBank: 'Chase', amount: 45000, currency: 'USD', paymentType: 'ACH', riskScore: 88, jurisdiction: 'Domestic', category: 'Vendor' },
  { id: 'comb-10', sourceAccountId: 'src-3', payeeName: 'IRS Tax Payment', payeeAccount: '•••• 0000', payeeRouting: '000000000', payeeBank: 'Federal Reserve', amount: 4200000, currency: 'USD', paymentType: 'ACH', riskScore: 1, jurisdiction: 'Domestic', category: 'Tax', lastPaymentDate: '2024-03-15' }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function BulkEligibilityDashboard() {
  // --- State Management ---
  const [sourceAccounts, setSourceAccounts] = useState<SourceAccount[]>(INITIAL_SOURCE_ACCOUNTS);
  const [payeeCombinations, setPayeeCombinations] = useState<PayeeCombination[]>(INITIAL_PAYEE_COMBINATIONS);
  
  // Simulation Rules State
  const [rules, setRules] = useState<SimulationRules>({
    maxTransactionLimit: 10000000,
    maxRiskScore: 70,
    allowInternational: true,
    requireActiveSource: true,
    enforceBalanceCheck: true,
    allowedPaymentTypes: ['ACH', 'Wire', 'RTP']
  });

  // UI State
  const [selectedSourceId, setSelectedSourceId] = useState<string | null>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [statusFilter, setStatusFilter] = useState<string>('All');
  const [isSimulating, setIsSimulating] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([
    { timestamp: new Date().toLocaleTimeString(), type: 'info', message: 'Bulk Eligibility Engine initialized successfully.' },
    { timestamp: new Date().toLocaleTimeString(), type: 'success', message: 'Loaded 5 source accounts and 10 payee combinations.' }
  ]);
  const [activeTab, setActiveTab] = useState<'combinations' | 'analytics' | 'rules'>('combinations');

  // --- Helper: Add Audit Log ---
  const addLog = (type: 'info' | 'warning' | 'success' | 'error', message: string) => {
    setAuditLogs(prev => [
      { timestamp: new Date().toLocaleTimeString(), type, message },
      ...prev.slice(0, 49) // Keep last 50 logs
    ]);
  };

  // --- Simulation Engine ---
  const simulationResults = useMemo(() => {
    return payeeCombinations.reduce<Record<string, SimulationResult>>((acc, comb) => {
      const source = sourceAccounts.find(s => s.id === comb.sourceAccountId);
      const reasons: string[] = [];
      let eligible = true;

      // Rule 1: Source Account Status Check
      if (rules.requireActiveSource && source && source.status !== 'Active') {
        eligible = false;
        reasons.push(`Source account status is "${source.status}" (requires "Active")`);
      }

      // Rule 2: Balance Check
      if (rules.enforceBalanceCheck && source) {
        // Simple mock conversion for GBP to USD if needed, otherwise direct comparison
        const balance = source.balance;
        if (balance < comb.amount) {
          eligible = false;
          reasons.push(`Insufficient funds: Account balance is ${source.currency} ${balance.toLocaleString()} but transaction requires ${comb.currency} ${comb.amount.toLocaleString()}`);
        }
      }

      // Rule 3: Max Transaction Limit
      if (comb.amount > rules.maxTransactionLimit) {
        eligible = false;
        reasons.push(`Transaction amount exceeds maximum limit of $${rules.maxTransactionLimit.toLocaleString()}`);
      }

      // Rule 4: Max Risk Score
      if (comb.riskScore > rules.maxRiskScore) {
        eligible = false;
        reasons.push(`Risk score (${comb.riskScore}) exceeds maximum threshold of ${rules.maxRiskScore}`);
      }

      // Rule 5: International Jurisdiction Check
      if (!rules.allowInternational && comb.jurisdiction === 'International') {
        eligible = false;
        reasons.push('International transactions are restricted under current rules');
      }

      // Rule 6: Allowed Payment Types
      if (!rules.allowedPaymentTypes.includes(comb.paymentType)) {
        eligible = false;
        reasons.push(`Payment type "${comb.paymentType}" is not allowed`);
      }

      // Calculate dynamic estimated fee based on risk and payment type
      let baseFee = comb.paymentType === 'Wire' ? 25 : comb.paymentType === 'RTP' ? 1.5 : 0.5;
      if (comb.jurisdiction === 'International') baseFee += 45;
      const riskPremium = (comb.riskScore / 100) * (comb.amount * 0.001);
      const estimatedFee = baseFee + riskPremium;

      acc[comb.id] = {
        combinationId: comb.id,
        eligible,
        reasons,
        adjustedRiskScore: Math.min(100, Math.round(comb.riskScore * (comb.jurisdiction === 'International' ? 1.15 : 1.0))),
        estimatedFee
      };

      return acc;
    }, {});
  }, [payeeCombinations, sourceAccounts, rules]);

  // --- Trigger Simulation Run ---
  const runSimulation = () => {
    setIsSimulating(true);
    addLog('info', 'Re-running eligibility simulation across all combinations...');
    
    setTimeout(() => {
      setIsSimulating(false);
      const eligibleCount = Object.values(simulationResults).filter(r => r.eligible).length;
      const totalCount = payeeCombinations.length;
      addLog(
        eligibleCount === totalCount ? 'success' : 'warning',
        `Simulation complete. ${eligibleCount}/${totalCount} combinations passed eligibility criteria.`
      );
    }, 800);
  };

  // Run simulation on rule changes
  useEffect(() => {
    runSimulation();
  }, [rules]);

  // --- Computed Metrics ---
  const metrics = useMemo(() => {
    let totalValue = 0;
    let eligibleValue = 0;
    let totalFees = 0;
    let eligibleCount = 0;

    payeeCombinations.forEach(comb => {
      totalValue += comb.amount;
      const result = simulationResults[comb.id];
      if (result) {
        totalFees += result.estimatedFee;
        if (result.eligible) {
          eligibleValue += comb.amount;
          eligibleCount++;
        }
      }
    });

    const successRate = payeeCombinations.length > 0 
      ? (eligibleCount / payeeCombinations.length) * 100 
      : 0;

    return {
      totalValue,
      eligibleValue,
      totalFees,
      eligibleCount,
      successRate,
      totalCount: payeeCombinations.length
    };
  }, [payeeCombinations, simulationResults]);

  // --- Filtered Combinations ---
  const filteredCombinations = useMemo(() => {
    return payeeCombinations.filter(comb => {
      // Source Account Filter
      if (selectedSourceId && comb.sourceAccountId !== selectedSourceId) return false;

      // Search Query Filter
      if (searchQuery) {
        const query = searchQuery.toLowerCase();
        const matchesName = comb.payeeName.toLowerCase().includes(query);
        const matchesBank = comb.payeeBank.toLowerCase().includes(query);
        const matchesCategory = comb.category.toLowerCase().includes(query);
        if (!matchesName && !matchesBank && !matchesCategory) return false;
      }

      // Category Filter
      if (categoryFilter !== 'All' && comb.category !== categoryFilter) return false;

      // Status Filter (Eligible vs Ineligible)
      if (statusFilter !== 'All') {
        const isEligible = simulationResults[comb.id]?.eligible;
        if (statusFilter === 'Eligible' && !isEligible) return false;
        if (statusFilter === 'Ineligible' && isEligible) return false;
      }

      return true;
    });
  }, [payeeCombinations, selectedSourceId, searchQuery, categoryFilter, statusFilter, simulationResults]);

  // --- Chart Data Preparation ---
  const categoryChartData = useMemo(() => {
    const categories = ['Vendor', 'Tax', 'Payroll', 'Intercompany'];
    return categories.map(cat => {
      const items = payeeCombinations.filter(c => c.category === cat);
      const total = items.reduce((sum, c) => sum + c.amount, 0);
      const eligible = items.reduce((sum, c) => {
        const res = simulationResults[c.id];
        return res?.eligible ? sum + c.amount : sum;
      }, 0);

      return {
        name: cat,
        Total: total,
        Eligible: eligible
      };
    });
  }, [payeeCombinations, simulationResults]);

  const riskDistributionData = useMemo(() => {
    const ranges = [
      { name: 'Low (0-20)', count: 0 },
      { name: 'Medium (21-50)', count: 0 },
      { name: 'High (51-75)', count: 0 },
      { name: 'Critical (76+)', count: 0 }
    ];

    payeeCombinations.forEach(comb => {
      if (comb.riskScore <= 20) ranges[0].count++;
      else if (comb.riskScore <= 50) ranges[1].count++;
      else if (comb.riskScore <= 75) ranges[2].count++;
      else ranges[3].count++;
    });

    return ranges;
  }, [payeeCombinations]);

  // --- Handlers ---
  const handleRuleChange = (key: keyof SimulationRules, value: any) => {
    setRules(prev => ({ ...prev, [key]: value }));
    addLog('info', `Rule updated: ${key.replace(/([A-Z])/g, ' $1')} set to ${value}`);
  };

  const handlePaymentTypeToggle = (type: 'ACH' | 'Wire' | 'RTP') => {
    const current = [...rules.allowedPaymentTypes];
    const index = current.indexOf(type);
    if (index > -1) {
      if (current.length > 1) {
        current.splice(index, 1);
      } else {
        addLog('warning', 'At least one payment type must be allowed.');
        return;
      }
    } else {
      current.push(type);
    }
    handleRuleChange('allowedPaymentTypes', current);
  };

  const handleExport = () => {
    addLog('success', 'Exported eligibility report to CSV format.');
    // Mock download trigger
    alert('Exporting report: Bulk_Eligibility_Report_' + new Date().toISOString().split('T')[0] + '.csv');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      {/* --- TOP NAVIGATION BAR --- */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 border border-indigo-500/30 rounded-xl text-indigo-400 shadow-inner">
              <Shield className="w-7 h-7 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">Aegis Bulk Eligibility Engine</h1>
                <span className="px-2 py-0.5 text-[10px] font-semibold bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">
                  v2.4 Enterprise
                </span>
              </div>
              <p className="text-xs text-slate-400">Real-time multi-account liquidity & compliance routing simulator</p>
            </div>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button 
              onClick={runSimulation}
              disabled={isSimulating}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 active:bg-indigo-700 disabled:bg-indigo-800/50 text-white text-sm font-medium rounded-lg transition-all shadow-lg shadow-indigo-600/10"
            >
              <RefreshCw className={`w-4 h-4 ${isSimulating ? 'animate-spin' : ''}`} />
              {isSimulating ? 'Simulating...' : 'Run Simulation'}
            </button>
            <button 
              onClick={handleExport}
              className="flex-1 md:flex-none flex items-center justify-center gap-2 px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-sm font-medium rounded-lg border border-slate-700 transition-all"
            >
              <Download className="w-4 h-4" />
              Export Report
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto p-4 md:p-6 space-y-6">
        
        {/* --- METRICS DASHBOARD --- */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Metric 1: Total Value */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-600/5 rounded-full blur-2xl group-hover:bg-indigo-600/10 transition-all" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Batch Value</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  ${metrics.totalValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                <Coins className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-indigo-400 font-semibold">{metrics.totalCount}</span> total payment combinations
            </div>
          </div>

          {/* Metric 2: Eligible Value */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-600/5 rounded-full blur-2xl group-hover:bg-emerald-600/10 transition-all" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Eligible Liquidity</p>
                <h3 className="text-2xl font-bold text-emerald-400 mt-1">
                  ${metrics.eligibleValue.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-2 bg-emerald-500/10 border border-emerald-500/20 rounded-lg text-emerald-400">
                <ShieldCheck className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">
                {((metrics.eligibleValue / (metrics.totalValue || 1)) * 100).toFixed(1)}%
              </span> of total batch value cleared
            </div>
          </div>

          {/* Metric 3: Success Rate */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-amber-600/5 rounded-full blur-2xl group-hover:bg-amber-600/10 transition-all" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Eligibility Pass Rate</p>
                <h3 className="text-2xl font-bold text-white mt-1">
                  {metrics.successRate.toFixed(1)}%
                </h3>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                <Activity className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              <span className="text-emerald-400 font-semibold">{metrics.eligibleCount}</span> passed, 
              <span className="text-rose-400 font-semibold"> {metrics.totalCount - metrics.eligibleCount}</span> flagged
            </div>
          </div>

          {/* Metric 4: Estimated Fees */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-slate-700 transition-all">
            <div className="absolute top-0 right-0 w-24 h-24 bg-sky-600/5 rounded-full blur-2xl group-hover:bg-sky-600/10 transition-all" />
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Est. Routing Fees</p>
                <h3 className="text-2xl font-bold text-sky-400 mt-1">
                  ${metrics.totalFees.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </h3>
              </div>
              <div className="p-2 bg-sky-500/10 border border-sky-500/20 rounded-lg text-sky-400">
                <DollarSign className="w-5 h-5" />
              </div>
            </div>
            <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
              Avg. fee per transaction: <span className="text-sky-400 font-semibold">${(metrics.totalFees / (metrics.totalCount || 1)).toFixed(2)}</span>
            </div>
          </div>
        </section>

        {/* --- MAIN WORKSPACE LAYOUT --- */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* --- LEFT COLUMN: SOURCE ACCOUNTS (4 Cols) --- */}
          <section className="lg:col-span-4 space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex justify-between items-center mb-4">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Source Accounts</h2>
                </div>
                <span className="px-2 py-0.5 text-xs bg-slate-800 text-slate-300 rounded-full font-mono">
                  {sourceAccounts.length}
                </span>
              </div>

              <p className="text-xs text-slate-400 mb-4">
                Select a source account to filter combinations and view dedicated liquidity pools.
              </p>

              <div className="space-y-3 max-h-[480px] overflow-y-auto pr-1 custom-scrollbar">
                {/* "All Accounts" Selector */}
                <button
                  onClick={() => setSelectedSourceId(null)}
                  className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col gap-1 ${
                    selectedSourceId === null
                      ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                      : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                  }`}
                >
                  <div className="flex justify-between items-center">
                    <span className="text-xs font-semibold text-white">All Liquidity Pools</span>
                    {selectedSourceId === null && <Check className="w-4 h-4 text-indigo-400" />}
                  </div>
                  <div className="flex justify-between items-baseline mt-1">
                    <span className="text-lg font-bold text-slate-200">
                      ${sourceAccounts.reduce((sum, s) => sum + s.balance, 0).toLocaleString()}
                    </span>
                    <span className="text-[10px] text-slate-400">Combined Balance</span>
                  </div>
                </button>

                {/* Individual Accounts */}
                {sourceAccounts.map(account => {
                  const isSelected = selectedSourceId === account.id;
                  const accountCombinations = payeeCombinations.filter(c => c.sourceAccountId === account.id);
                  const totalAllocated = accountCombinations.reduce((sum, c) => sum + c.amount, 0);
                  const isOverdraft = account.balance < totalAllocated;

                  return (
                    <button
                      key={account.id}
                      onClick={() => setSelectedSourceId(account.id)}
                      className={`w-full text-left p-3.5 rounded-lg border transition-all flex flex-col gap-2 relative overflow-hidden ${
                        isSelected
                          ? 'bg-indigo-600/10 border-indigo-500/50 shadow-md shadow-indigo-950/50'
                          : 'bg-slate-950 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      {/* Status Indicator Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 ${
                        account.status === 'Active' ? 'bg-emerald-500' : 'bg-rose-500'
                      }`} />

                      <div className="flex justify-between items-start pl-1">
                        <div>
                          <h4 className="text-xs font-bold text-white truncate max-w-[180px]">{account.name}</h4>
                          <p className="text-[10px] text-slate-400">{account.bankName} • {account.accountNumber}</p>
                        </div>
                        <span className={`px-1.5 py-0.5 text-[9px] font-semibold rounded ${
                          account.status === 'Active' 
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' 
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}>
                          {account.status}
                        </span>
                      </div>

                      <div className="flex justify-between items-baseline mt-1 pl-1">
                        <div>
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider">Available Balance</p>
                          <span className="text-sm font-bold text-slate-200">
                            {account.currency} {account.balance.toLocaleString()}
                          </span>
                        </div>
                        <div className="text-right">
                          <p className="text-[9px] text-slate-400 uppercase tracking-wider">Allocated</p>
                          <span className={`text-xs font-semibold ${isOverdraft ? 'text-rose-400' : 'text-slate-300'}`}>
                            ${totalAllocated.toLocaleString()}
                          </span>
                        </div>
                      </div>

                      {/* Progress Bar for Allocation */}
                      <div className="w-full bg-slate-800 h-1 rounded-full overflow-hidden mt-1 pl-1">
                        <div 
                          className={`h-full rounded-full ${isOverdraft ? 'bg-rose-500' : 'bg-indigo-500'}`}
                          style={{ width: `${Math.min(100, (totalAllocated / account.balance) * 100)}%` }}
                        />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* --- SIMULATION RULES PANEL (INLINE FOR QUICK ACCESS) --- */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
              <div className="flex items-center gap-2 mb-4">
                <Sliders className="w-4 h-4 text-indigo-400" />
                <h2 className="text-sm font-semibold text-white uppercase tracking-wider">Simulation Rules</h2>
              </div>

              <div className="space-y-4">
                {/* Max Transaction Limit */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Max Transaction Limit</span>
                    <span className="text-indigo-400 font-mono font-semibold">
                      ${(rules.maxTransactionLimit / 1000000).toFixed(1)}M
                    </span>
                  </div>
                  <input 
                    type="range" 
                    min="500000" 
                    max="20000000" 
                    step="500000"
                    value={rules.maxTransactionLimit}
                    onChange={(e) => handleRuleChange('maxTransactionLimit', parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Max Risk Score */}
                <div>
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-slate-400">Max Risk Threshold</span>
                    <span className="text-indigo-400 font-mono font-semibold">{rules.maxRiskScore} / 100</span>
                  </div>
                  <input 
                    type="range" 
                    min="10" 
                    max="95" 
                    step="5"
                    value={rules.maxRiskScore}
                    onChange={(e) => handleRuleChange('maxRiskScore', parseInt(e.target.value))}
                    className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                  />
                </div>

                {/* Toggles */}
                <div className="space-y-2.5 pt-2 border-t border-slate-800">
                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Allow International Payees</span>
                    <input 
                      type="checkbox" 
                      checked={rules.allowInternational}
                      onChange={(e) => handleRuleChange('allowInternational', e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Require Active Source Account</span>
                    <input 
                      type="checkbox" 
                      checked={rules.requireActiveSource}
                      onChange={(e) => handleRuleChange('requireActiveSource', e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 w-4 h-4"
                    />
                  </label>

                  <label className="flex items-center justify-between cursor-pointer group">
                    <span className="text-xs text-slate-300 group-hover:text-white transition-colors">Enforce Balance Check</span>
                    <input 
                      type="checkbox" 
                      checked={rules.enforceBalanceCheck}
                      onChange={(e) => handleRuleChange('enforceBalanceCheck', e.target.checked)}
                      className="rounded border-slate-800 text-indigo-600 focus:ring-indigo-500 bg-slate-950 w-4 h-4"
                    />
                  </label>
                </div>

                {/* Payment Types */}
                <div className="pt-3 border-t border-slate-800">
                  <span className="text-xs text-slate-400 block mb-2">Allowed Payment Methods</span>
                  <div className="flex gap-2">
                    {(['ACH', 'Wire', 'RTP'] as const).map(type => {
                      const isAllowed = rules.allowedPaymentTypes.includes(type);
                      return (
                        <button
                          key={type}
                          onClick={() => handlePaymentTypeToggle(type)}
                          className={`flex-1 py-1.5 text-xs font-semibold rounded-md border transition-all ${
                            isAllowed 
                              ? 'bg-indigo-600/20 border-indigo-500/40 text-indigo-300' 
                              : 'bg-slate-950 border-slate-800 text-slate-500 hover:border-slate-700'
                          }`}
                        >
                          {type}
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* --- RIGHT COLUMN: WORKSPACE TABS & LISTS (8 Cols) --- */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 bg-slate-900 p-1 rounded-lg">
              <button
                onClick={() => setActiveTab('combinations')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'combinations'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Layers className="w-4 h-4" />
                Payee Combinations ({filteredCombinations.length})
              </button>
              <button
                onClick={() => setActiveTab('analytics')}
                className={`flex-1 flex items-center justify-center gap-2 py-2.5 text-xs font-medium rounded-md transition-all ${
                  activeTab === 'analytics'
                    ? 'bg-slate-800 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-4 h-4" />
                Analytics & Risk Distribution
              </button>
            </div>

            {/* --- TAB 1: COMBINATIONS LIST --- */}
            {activeTab === 'combinations' && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
                
                {/* Filters & Search Bar */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-col md:flex-row gap-3 justify-between items-center">
                  <div className="relative w-full md:w-72">
                    <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      placeholder="Search payee, bank, or category..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full pl-9 pr-4 py-2 bg-slate-950 border border-slate-800 rounded-lg text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-all"
                    />
                  </div>

                  <div className="flex gap-2 w-full md:w-auto">
                    {/* Category Filter */}
                    <select
                      value={categoryFilter}
                      onChange={(e) => setCategoryFilter(e.target.value)}
                      className="flex-1 md:flex-none bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Categories</option>
                      <option value="Vendor">Vendor</option>
                      <option value="Tax">Tax</option>
                      <option value="Payroll">Payroll</option>
                      <option value="Intercompany">Intercompany</option>
                    </select>

                    {/* Status Filter */}
                    <select
                      value={statusFilter}
                      onChange={(e) => setStatusFilter(e.target.value)}
                      className="flex-1 md:flex-none bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Eligible">Eligible Only</option>
                      <option value="Ineligible">Ineligible Only</option>
                    </select>
                  </div>
                </div>

                {/* Table / List View */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 bg-slate-950/50 text-[10px] font-semibold text-slate-400 uppercase tracking-wider">
                        <th className="py-3 px-4">Payee Details</th>
                        <th className="py-3 px-4">Source Account</th>
                        <th className="py-3 px-4 text-right">Amount</th>
                        <th className="py-3 px-4 text-center">Risk Score</th>
                        <th className="py-3 px-4 text-center">Method</th>
                        <th className="py-3 px-4 text-right">Eligibility Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-xs">
                      {filteredCombinations.length === 0 ? (
                        <tr>
                          <td colSpan={6} className="py-12 text-center text-slate-500">
                            <div className="flex flex-col items-center justify-center gap-2">
                              <AlertTriangle className="w-8 h-8 text-slate-600" />
                              <p className="text-sm font-medium">No matching combinations found</p>
                              <p className="text-xs text-slate-600">Try adjusting your filters or simulation rules.</p>
                            </div>
                          </td>
                        </tr>
                      ) : (
                        filteredCombinations.map(comb => {
                          const result = simulationResults[comb.id];
                          const source = sourceAccounts.find(s => s.id === comb.sourceAccountId);
                          
                          return (
                            <tr key={comb.id} className="hover:bg-slate-800/30 transition-colors group">
                              {/* Payee Details */}
                              <td className="py-3.5 px-4">
                                <div className="font-semibold text-white group-hover:text-indigo-400 transition-colors">
                                  {comb.payeeName}
                                </div>
                                <div className="text-[10px] text-slate-400 flex items-center gap-1.5 mt-0.5">
                                  <span className="px-1 bg-slate-800 rounded text-[9px] font-medium text-slate-300">
                                    {comb.category}
                                  </span>
                                  <span>•</span>
                                  <span>{comb.payeeBank}</span>
                                  <span>•</span>
                                  <span className={comb.jurisdiction === 'International' ? 'text-amber-400' : 'text-slate-400'}>
                                    {comb.jurisdiction}
                                  </span>
                                </div>
                              </td>

                              {/* Source Account */}
                              <td className="py-3.5 px-4">
                                <div className="text-slate-300 font-medium truncate max-w-[140px]">
                                  {source ? source.name : 'Unknown Source'}
                                </div>
                                <div className="text-[10px] text-slate-500">
                                  {source ? source.accountNumber : 'N/A'}
                                </div>
                              </td>

                              {/* Amount */}
                              <td className="py-3.5 px-4 text-right font-mono font-semibold text-white">
                                {comb.currency} {comb.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                              </td>

                              {/* Risk Score */}
                              <td className="py-3.5 px-4 text-center">
                                <div className="inline-flex flex-col items-center">
                                  <span className={`font-mono font-bold text-xs ${
                                    comb.riskScore > 70 ? 'text-rose-400' : comb.riskScore > 40 ? 'text-amber-400' : 'text-emerald-400'
                                  }`}>
                                    {comb.riskScore}
                                  </span>
                                  <div className="w-12 bg-slate-800 h-1 rounded-full overflow-hidden mt-1">
                                    <div 
                                      className={`h-full rounded-full ${
                                        comb.riskScore > 70 ? 'bg-rose-500' : comb.riskScore > 40 ? 'bg-amber-500' : 'bg-emerald-500'
                                      }`}
                                      style={{ width: `${comb.riskScore}%` }}
                                    />
                                  </div>
                                </div>
                              </td>

                              {/* Payment Method */}
                              <td className="py-3.5 px-4 text-center">
                                <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded font-mono text-[10px] font-semibold">
                                  {comb.paymentType}
                                </span>
                              </td>

                              {/* Eligibility Status */}
                              <td className="py-3.5 px-4 text-right">
                                {result?.eligible ? (
                                  <div className="inline-flex items-center gap-1.5 text-emerald-400 font-semibold">
                                    <CheckCircle2 className="w-4 h-4" />
                                    <span>Eligible</span>
                                  </div>
                                ) : (
                                  <div className="inline-flex flex-col items-end gap-0.5">
                                    <div className="inline-flex items-center gap-1.5 text-rose-400 font-semibold">
                                      <XCircle className="w-4 h-4" />
                                      <span>Flagged</span>
                                    </div>
                                    {result?.reasons && result.reasons.length > 0 && (
                                      <span className="text-[9px] text-rose-400/70 max-w-[180px] truncate block" title={result.reasons.join(', ')}>
                                        {result.reasons[0]}
                                      </span>
                                    )}
                                  </div>
                                )}
                              </td>
                            </tr>
                          );
                        })
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* --- TAB 2: ANALYTICS VIEW --- */}
            {activeTab === 'analytics' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                
                {/* Chart 1: Category Breakdown */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <Layers className="w-4 h-4 text-indigo-400" />
                    Liquidity Allocation by Category
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={categoryChartData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                          formatter={(value: any) => [`$${value.toLocaleString()}`, '']}
                        />
                        <Legend wrapperStyle={{ fontSize: '11px' }} />
                        <Bar dataKey="Total" fill="#4f46e5" radius={[4, 4, 0, 0]} />
                        <Bar dataKey="Eligible" fill="#10b981" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 2: Risk Distribution */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <ShieldAlert className="w-4 h-4 text-indigo-400" />
                    Risk Profile Distribution
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={riskDistributionData}
                          cx="50%"
                          cy="50%"
                          innerRadius={60}
                          outerRadius={80}
                          paddingAngle={5}
                          dataKey="count"
                        >
                          <Cell fill="#10b981" /> {/* Low */}
                          <Cell fill="#f59e0b" /> {/* Medium */}
                          <Cell fill="#ef4444" /> {/* High */}
                          <Cell fill="#7f1d1d" /> {/* Critical */}
                        </Pie>
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                        />
                        <Legend 
                          verticalAlign="bottom" 
                          height={36} 
                          wrapperStyle={{ fontSize: '11px' }}
                        />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Chart 3: Cumulative Liquidity Curve */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 md:col-span-2">
                  <h3 className="text-sm font-semibold text-white mb-4 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4 text-indigo-400" />
                    Cumulative Liquidity Clearance Curve
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart
                        data={payeeCombinations.map((c, i) => ({
                          index: `P-${i+1}`,
                          'Cumulative Total': payeeCombinations.slice(0, i + 1).reduce((sum, item) => sum + item.amount, 0),
                          'Cumulative Eligible': payeeCombinations.slice(0, i + 1).reduce((sum, item) => {
                            const res = simulationResults[item.id];
                            return res?.eligible ? sum + item.amount : sum;
                          }, 0)
                        }))}
                      >
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="index" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${(v / 1000000).toFixed(1)}M`} />
                        <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                        <Area type="monotone" dataKey="Cumulative Total" stroke="#4f46e5" fillOpacity={0.1} fill="#4f46e5" />
                        <Area type="monotone" dataKey="Cumulative Eligible" stroke="#10b981" fillOpacity={0.2} fill="#10b981" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>
            )}
          </section>
        </div>

        {/* --- BOTTOM SECTION: REAL-TIME AUDIT LOG CONSOLE --- */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl p-5">
          <div className="flex justify-between items-center mb-3">
            <div className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-indigo-400" />
              <h2 className="text-xs font-semibold text-white uppercase tracking-wider">Engine Audit Logs</h2>
            </div>
            <button 
              onClick={() => setAuditLogs([])}
              className="text-[10px] text-slate-500 hover:text-slate-300 transition-colors"
            >
              Clear Console
            </button>
          </div>

          <div className="bg-slate-950 rounded-lg p-4 h-36 overflow-y-auto font-mono text-[11px] space-y-2 border border-slate-800/60 custom-scrollbar">
            {auditLogs.length === 0 ? (
              <p className="text-slate-600 italic">Console is empty. Run simulations or adjust rules to generate logs.</p>
            ) : (
              auditLogs.map((log, index) => (
                <div key={index} className="flex items-start gap-2">
                  <span className="text-slate-600">[{log.timestamp}]</span>
                  <span className={`font-semibold ${
                    log.type === 'success' ? 'text-emerald-400' :
                    log.type === 'warning' ? 'text-amber-400' :
                    log.type === 'error' ? 'text-rose-400' : 'text-sky-400'
                  }`}>
                    {log.type.toUpperCase()}:
                  </span>
                  <span className="text-slate-300">{log.message}</span>
                </div>
              ))
            )}
          </div>
        </section>
      </main>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-900 bg-slate-950 py-8 px-6 mt-12">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-indigo-500" />
            <span>© {new Date().getFullYear()} Aegis Financial Technologies Inc. All rights reserved.</span>
          </div>
          <div className="flex gap-4">
            <a href="#" className="hover:text-slate-300 transition-colors">Security Policy</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">API Documentation</a>
            <span>•</span>
            <a href="#" className="hover:text-slate-300 transition-colors">System Status</a>
          </div>
        </div>
      </footer>
    </div>
  );
}