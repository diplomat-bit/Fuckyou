import React, { useState, useMemo } from 'react';
import { 
  Search, 
  Filter, 
  AlertTriangle, 
  CheckCircle, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Settings, 
  Sliders, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Plus, 
  Trash2, 
  Edit3, 
  ShieldAlert, 
  RefreshCw, 
  Download, 
  Info, 
  ChevronRight, 
  Briefcase, 
  CreditCard,
  Check,
  X,
  HelpCircle,
  SlidersHorizontal
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Transaction {
  id: string;
  date: string;
  merchant: string;
  mcc: string;
  amount: number;
  currency: string;
  category: string;
  status: 'Categorized' | 'Uncategorized' | 'Pending';
  riskScore: number;
  account: string;
  notes: string;
  anomalyReason?: string;
}

interface MCCRule {
  id: string;
  mcc: string;
  merchantPattern: string;
  category: string;
  confidence: number;
  autoApprove: boolean;
}

// --- INITIAL MOCK DATA ---
const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-1001', date: '2024-10-24', merchant: 'Amazon Web Services', mcc: '7372', amount: 14250.00, currency: 'USD', category: 'Cloud Infrastructure', status: 'Categorized', riskScore: 12, account: 'Operating Account (US)', notes: 'Monthly production hosting fee' },
  { id: 'TXN-1002', date: '2024-10-24', merchant: 'Stripe Transfer', mcc: '6012', amount: 85400.15, currency: 'USD', category: 'Internal Transfer', status: 'Categorized', riskScore: 5, account: 'Operating Account (US)', notes: 'Daily merchant payout settlement' },
  { id: 'TXN-1003', date: '2024-10-23', merchant: 'Unknown Entity LLC', mcc: '7399', amount: 45000.00, currency: 'USD', category: 'Uncategorized', status: 'Uncategorized', riskScore: 88, account: 'Treasury Reserve (UK)', notes: 'Unscheduled advisory payment', anomalyReason: 'Unusually high amount for new vendor with high-risk MCC' },
  { id: 'TXN-1004', date: '2024-10-22', merchant: 'Google Ads', mcc: '7311', amount: 8200.00, currency: 'USD', category: 'Marketing & Advertising', status: 'Categorized', riskScore: 15, account: 'Operating Account (US)', notes: 'Q4 Search campaign spend' },
  { id: 'TXN-1005', date: '2024-10-22', merchant: 'Deel Payroll', mcc: '7399', amount: 125000.00, currency: 'USD', category: 'Payroll & HR', status: 'Categorized', riskScore: 8, account: 'Payroll Account (EU)', notes: 'International contractor payments' },
  { id: 'TXN-1006', date: '2024-10-21', merchant: 'Uber Trip', mcc: '4121', amount: 42.50, currency: 'USD', category: 'Travel & Meals', status: 'Categorized', riskScore: 3, account: 'Operating Account (US)', notes: 'Client dinner transport' },
  { id: 'TXN-1007', date: '2024-10-20', merchant: 'Shell Oil Corp', mcc: '5541', amount: 1200.00, currency: 'USD', category: 'Uncategorized', status: 'Pending', riskScore: 65, account: 'Operating Account (US)', notes: 'Bulk fleet refueling', anomalyReason: 'Transaction amount exceeds historical average for fuel category by 400%' },
  { id: 'TXN-1008', date: '2024-10-19', merchant: 'Slack Technologies', mcc: '7372', amount: 3400.00, currency: 'USD', category: 'SaaS & Software', status: 'Categorized', riskScore: 10, account: 'Operating Account (US)', notes: 'Annual enterprise license renewal' },
  { id: 'TXN-1009', date: '2024-10-18', merchant: 'WeWork Management', mcc: '6513', amount: 12500.00, currency: 'USD', category: 'Rent & Real Estate', status: 'Categorized', riskScore: 18, account: 'Operating Account (US)', notes: 'NYC HQ hotdesks & private offices' },
  { id: 'TXN-1010', date: '2024-10-17', merchant: 'ACME Hardware Corp', mcc: '5251', amount: 9800.00, currency: 'USD', category: 'Uncategorized', status: 'Uncategorized', riskScore: 72, account: 'Venture Capital Fund', notes: 'Office renovation supplies', anomalyReason: 'Mismatched MCC for Venture Capital Fund account guidelines' },
  { id: 'TXN-1011', date: '2024-10-16', merchant: 'Zoom Video', mcc: '7372', amount: 450.00, currency: 'USD', category: 'SaaS & Software', status: 'Categorized', riskScore: 4, account: 'Operating Account (US)', notes: 'Monthly video conferencing plan' },
  { id: 'TXN-1012', date: '2024-10-15', merchant: 'Deloitte Advisory', mcc: '7392', amount: 35000.00, currency: 'USD', category: 'Professional Services', status: 'Categorized', riskScore: 22, account: 'Treasury Reserve (UK)', notes: 'Tax restructuring consultation' }
];

const INITIAL_MCC_RULES: MCCRule[] = [
  { id: 'R-1', mcc: '7372', merchantPattern: 'AWS|Amazon Web Services|Slack|Zoom', category: 'SaaS & Software', confidence: 98, autoApprove: true },
  { id: 'R-2', mcc: '7311', merchantPattern: 'Google Ads|Facebook Ads|LinkedIn', category: 'Marketing & Advertising', confidence: 95, autoApprove: true },
  { id: 'R-3', mcc: '7399', merchantPattern: 'Deel|Gusto|Rippling', category: 'Payroll & HR', confidence: 92, autoApprove: true },
  { id: 'R-4', mcc: '4121', merchantPattern: 'Uber|Lyft|Taxi', category: 'Travel & Meals', confidence: 89, autoApprove: false },
  { id: 'R-5', mcc: '6513', merchantPattern: 'WeWork|Regus', category: 'Rent & Real Estate', confidence: 94, autoApprove: true }
];

const CATEGORIES = [
  'Cloud Infrastructure',
  'Internal Transfer',
  'Marketing & Advertising',
  'Payroll & HR',
  'Travel & Meals',
  'SaaS & Software',
  'Rent & Real Estate',
  'Professional Services',
  'Uncategorized'
];

const ACCOUNTS = [
  'All Accounts',
  'Operating Account (US)',
  'Treasury Reserve (UK)',
  'Payroll Account (EU)',
  'Venture Capital Fund'
];

export default function B2BTransactionCategorizer() {
  // --- STATE ---
  const [transactions, setTransactions] = useState<Transaction[]>(INITIAL_TRANSACTIONS);
  const [mccRules, setMccRules] = useState<MCCRule[]>(INITIAL_MCC_RULES);
  const [activeTab, setActiveTab] = useState<'treasury' | 'ledger' | 'anomalies' | 'rules'>('treasury');
  
  // Sidebar Filters
  const [selectedAccount, setSelectedAccount] = useState<string>('All Accounts');
  const [dateRange, setDateRange] = useState<string>('30d');
  const [riskThreshold, setRiskThreshold] = useState<number>(50);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');

  // Selected Transaction for Investigation Panel
  const [selectedTxnId, setSelectedTxnId] = useState<string | null>('TXN-1003');

  // New Rule Form State
  const [newRuleMcc, setNewRuleMcc] = useState('');
  const [newRulePattern, setNewRulePattern] = useState('');
  const [newRuleCategory, setNewRuleCategory] = useState(CATEGORIES[0]);
  const [newRuleAuto, setNewRuleAuto] = useState(true);

  // Notification Toast State
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const triggerToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 4000);
  };

  // --- FILTERED TRANSACTIONS ---
  const filteredTransactions = useMemo(() => {
    return transactions.filter(txn => {
      const matchesAccount = selectedAccount === 'All Accounts' || txn.account === selectedAccount;
      const matchesCategory = categoryFilter === 'All' || txn.category === categoryFilter;
      const matchesSearch = txn.merchant.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            txn.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            txn.mcc.includes(searchQuery) ||
                            (txn.notes && txn.notes.toLowerCase().includes(searchQuery.toLowerCase()));
      
      // Simple date range simulation
      const matchesDate = true; // In mock, we keep all for display

      return matchesAccount && matchesCategory && matchesSearch && matchesDate;
    });
  }, [transactions, selectedAccount, categoryFilter, searchQuery]);

  // --- METRICS CALCULATIONS ---
  const metrics = useMemo(() => {
    const totalVolume = filteredTransactions.reduce((sum, t) => sum + t.amount, 0);
    const anomaliesCount = filteredTransactions.filter(t => t.riskScore >= riskThreshold).length;
    const categorizedCount = filteredTransactions.filter(t => t.status === 'Categorized').length;
    const categorizationRate = filteredTransactions.length > 0 
      ? Math.round((categorizedCount / filteredTransactions.length) * 100) 
      : 0;
    const activeAccountsCount = new Set(filteredTransactions.map(t => t.account)).size;

    return {
      totalVolume,
      anomaliesCount,
      categorizationRate,
      activeAccountsCount
    };
  }, [filteredTransactions, riskThreshold]);

  // --- ACTIONS ---
  const handleReclassify = (txnId: string, newCategory: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        const isUncategorized = newCategory === 'Uncategorized';
        return { 
          ...t, 
          category: newCategory, 
          status: isUncategorized ? 'Uncategorized' : 'Categorized',
          // If reclassified, lower the risk score if it was flagged for categorization issues
          riskScore: isUncategorized ? t.riskScore : Math.max(5, t.riskScore - 40)
        };
      }
      return t;
    }));
    triggerToast(`Transaction ${txnId} reclassified to ${newCategory}`, 'success');
  };

  const handleApproveAnomaly = (txnId: string) => {
    setTransactions(prev => prev.map(t => {
      if (t.id === txnId) {
        return { ...t, riskScore: 10, anomalyReason: undefined };
      }
      return t;
    }));
    triggerToast(`Anomaly cleared for transaction ${txnId}`, 'success');
  };

  const handleAddRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newRuleMcc || !newRulePattern) {
      triggerToast('Please fill in all rule fields', 'error');
      return;
    }

    const newRule: MCCRule = {
      id: `R-${Date.now()}`,
      mcc: newRuleMcc,
      merchantPattern: newRulePattern,
      category: newRuleCategory,
      confidence: 95,
      autoApprove: newRuleAuto
    };

    setMccRules(prev => [newRule, ...prev]);
    
    // Auto-apply rule to existing uncategorized transactions
    let appliedCount = 0;
    setTransactions(prev => prev.map(t => {
      const patternRegex = new RegExp(newRulePattern, 'i');
      if (t.status === 'Uncategorized' && (t.mcc === newRuleMcc || patternRegex.test(t.merchant))) {
        appliedCount++;
        return {
          ...t,
          category: newRuleCategory,
          status: 'Categorized',
          riskScore: Math.max(5, t.riskScore - 30)
        };
      }
      return t;
    }));

    setNewRuleMcc('');
    setNewRulePattern('');
    triggerToast(`Rule added! Applied to ${appliedCount} matching transactions.`, 'success');
  };

  const handleDeleteRule = (id: string) => {
    setMccRules(prev => prev.filter(r => r.id !== id));
    triggerToast('Categorization rule deleted', 'info');
  };

  const selectedTxnDetails = transactions.find(t => t.id === selectedTxnId);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* --- TOAST NOTIFICATION --- */}
      {toast && (
        <div className="fixed bottom-5 right-5 z-50 flex items-center gap-3 px-4 py-3 rounded-xl shadow-2xl border border-slate-800 bg-slate-900 animate-bounce">
          <div className={`w-2 h-2 rounded-full ${toast.type === 'success' ? 'bg-emerald-500' : toast.type === 'error' ? 'bg-rose-500' : 'bg-indigo-500'}`} />
          <p className="text-sm font-medium text-slate-200">{toast.message}</p>
          <button onClick={() => setToast(null)} className="text-slate-400 hover:text-slate-200 ml-2">
            <X size={14} />
          </button>
        </div>
      )}

      {/* --- HEADER --- */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-40 px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <div className="bg-gradient-to-tr from-indigo-600 to-violet-500 p-2.5 rounded-xl shadow-lg shadow-indigo-500/20">
            <Layers className="text-white" size={22} />
          </div>
          <div>
            <h1 className="text-lg font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Apex Ledger AI
            </h1>
            <p className="text-xs text-slate-400 font-medium">B2B Multi-Account Categorizer & Anomaly Detector</p>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="hidden md:flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800 text-xs text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>AI Engine v2.4 Active</span>
          </div>
          <button 
            onClick={() => {
              setTransactions(INITIAL_TRANSACTIONS);
              setMccRules(INITIAL_MCC_RULES);
              triggerToast('Dashboard reset to initial state', 'info');
            }}
            className="p-2 text-slate-400 hover:text-white hover:bg-slate-800 rounded-lg transition-all"
            title="Reset Data"
          >
            <RefreshCw size={18} />
          </button>
        </div>
      </header>

      {/* --- MAIN LAYOUT --- */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* --- SIDEBAR CONTROLS --- */}
        <aside className="w-80 border-r border-slate-800 bg-slate-900/40 p-6 flex flex-col gap-6 overflow-y-auto shrink-0 hidden lg:flex">
          <div className="flex items-center gap-2 text-slate-300 font-semibold text-sm uppercase tracking-wider">
            <SlidersHorizontal size={16} className="text-indigo-400" />
            <span>Control Panel</span>
          </div>

          {/* Account Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Account Scope</label>
            <div className="flex flex-col gap-1">
              {ACCOUNTS.map(acc => (
                <button
                  key={acc}
                  onClick={() => setSelectedAccount(acc)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-sm transition-all flex items-center justify-between ${
                    selectedAccount === acc 
                      ? 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/30 font-medium' 
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200 border border-transparent'
                  }`}
                >
                  <span className="truncate">{acc}</span>
                  {selectedAccount === acc && <Check size={14} />}
                </button>
              ))}
            </div>
          </div>

          {/* Date Range Selector */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Date Range</label>
            <div className="grid grid-cols-3 gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {['7d', '30d', '90d'].map(range => (
                <button
                  key={range}
                  onClick={() => setDateRange(range)}
                  className={`py-1 text-xs font-medium rounded-md transition-all ${
                    dateRange === range 
                      ? 'bg-slate-800 text-white shadow-sm' 
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {range.toUpperCase()}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Threshold Slider */}
          <div className="flex flex-col gap-2 bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
            <div className="flex items-center justify-between">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                <ShieldAlert size={14} className="text-amber-500" />
                <span>Risk Threshold</span>
              </label>
              <span className="text-xs font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                {riskThreshold}%
              </span>
            </div>
            <input 
              type="range" 
              min="10" 
              max="90" 
              value={riskThreshold} 
              onChange={(e) => setRiskThreshold(Number(e.target.value))}
              className="w-full accent-indigo-500 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 leading-relaxed">
              Transactions with a risk score above this threshold will trigger real-time anomaly alerts.
            </p>
          </div>

          {/* Category Filter */}
          <div className="flex flex-col gap-2">
            <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Category Filter</label>
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
            >
              <option value="All">All Categories</option>
              {CATEGORIES.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          {/* Quick Stats Summary */}
          <div className="mt-auto pt-4 border-t border-slate-800/60 text-xs text-slate-500 flex flex-col gap-1">
            <div className="flex justify-between">
              <span>Total Transactions:</span>
              <span className="text-slate-300 font-medium">{filteredTransactions.length}</span>
            </div>
            <div className="flex justify-between">
              <span>Uncategorized:</span>
              <span className="text-amber-500 font-medium">
                {filteredTransactions.filter(t => t.status === 'Uncategorized').length}
              </span>
            </div>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 flex flex-col overflow-y-auto bg-slate-950/20">
          
          {/* --- METRIC CARDS --- */}
          <section className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 p-6">
            
            {/* Metric 1: Total Volume */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Total Volume</span>
                <span className="text-2xl font-bold text-white">
                  ${metrics.totalVolume.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                </span>
                <span className="text-[10px] text-emerald-400 flex items-center gap-1 mt-1">
                  <ArrowUpRight size={12} /> +14.2% from last month
                </span>
              </div>
              <div className="bg-indigo-500/10 p-3 rounded-xl border border-indigo-500/20 text-indigo-400">
                <DollarSign size={22} />
              </div>
            </div>

            {/* Metric 2: Flagged Anomalies */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Flagged Anomalies</span>
                <span className={`text-2xl font-bold ${metrics.anomaliesCount > 0 ? 'text-rose-400' : 'text-slate-300'}`}>
                  {metrics.anomaliesCount}
                </span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  At risk threshold &gt; {riskThreshold}%
                </span>
              </div>
              <div className={`p-3 rounded-xl border ${
                metrics.anomaliesCount > 0 
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400' 
                  : 'bg-slate-800 border-slate-700 text-slate-400'
              }`}>
                <AlertTriangle size={22} />
              </div>
            </div>

            {/* Metric 3: Categorization Rate */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Categorization Rate</span>
                <span className="text-2xl font-bold text-white">{metrics.categorizationRate}%</span>
                <div className="w-28 bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
                  <div 
                    className="bg-emerald-500 h-full rounded-full transition-all duration-500" 
                    style={{ width: `${metrics.categorizationRate}%` }}
                  />
                </div>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20 text-emerald-400">
                <CheckCircle size={22} />
              </div>
            </div>

            {/* Metric 4: Active Accounts */}
            <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 flex items-center justify-between hover:border-slate-700/80 transition-all">
              <div className="flex flex-col gap-1">
                <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Active Accounts</span>
                <span className="text-2xl font-bold text-white">{metrics.activeAccountsCount}</span>
                <span className="text-[10px] text-slate-400 flex items-center gap-1 mt-1">
                  Across multiple currencies
                </span>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl border border-amber-500/20 text-amber-400">
                <Briefcase size={22} />
              </div>
            </div>

          </section>

          {/* --- TABS NAVIGATION --- */}
          <div className="px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/20">
            <div className="flex gap-6">
              {[
                { id: 'treasury', label: 'Treasury Dashboard', icon: TrendingUp },
                { id: 'ledger', label: 'Transaction Ledger', icon: CreditCard },
                { id: 'anomalies', label: 'Anomaly Investigation', icon: ShieldAlert },
                { id: 'rules', label: 'MCC & Rules Engine', icon: Settings }
              ].map(tab => {
                const Icon = tab.icon;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 py-4 text-sm font-medium border-b-2 transition-all relative ${
                      activeTab === tab.id 
                        ? 'border-indigo-500 text-indigo-400 font-semibold' 
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <Icon size={16} />
                    <span>{tab.label}</span>
                    {tab.id === 'anomalies' && metrics.anomaliesCount > 0 && (
                      <span className="absolute -top-1 -right-2 bg-rose-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                        {metrics.anomaliesCount}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Mobile Filter Trigger Indicator */}
            <div className="lg:hidden flex items-center gap-2 text-xs text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              <Sliders size={14} />
              <span>Filters Active</span>
            </div>
          </div>

          {/* --- TAB CONTENT --- */}
          <div className="p-6 flex-1 flex flex-col gap-6">
            
            {/* ==================== TAB 1: TREASURY DASHBOARD ==================== */}
            {activeTab === 'treasury' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Chart 1: Volume Trend (Custom SVG Area Chart) */}
                <div className="xl:col-span-2 bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Daily Transaction Volume Trend</h3>
                      <p className="text-xs text-slate-400">Aggregated daily cash flows across selected accounts</p>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-slate-400">
                      <span className="w-2.5 h-2.5 rounded-full bg-indigo-500" />
                      <span>Outflow</span>
                    </div>
                  </div>

                  {/* Custom SVG Area Chart */}
                  <div className="h-64 w-full relative mt-4">
                    <svg className="w-full h-full" viewBox="0 0 600 200" preserveAspectRatio="none">
                      <defs>
                        <linearGradient id="chartGrad" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="0%" stopColor="#6366f1" stopOpacity="0.4" />
                          <stop offset="100%" stopColor="#6366f1" stopOpacity="0.0" />
                        </linearGradient>
                      </defs>
                      {/* Grid Lines */}
                      <line x1="0" y1="40" x2="600" y2="40" stroke="#1e293b" strokeDasharray="4" />
                      <line x1="0" y1="100" x2="600" y2="100" stroke="#1e293b" strokeDasharray="4" />
                      <line x1="0" y1="160" x2="600" y2="160" stroke="#1e293b" strokeDasharray="4" />
                      
                      {/* Area Path */}
                      <path 
                        d="M 0 180 Q 100 120 200 150 T 400 60 T 600 100 L 600 200 L 0 200 Z" 
                        fill="url(#chartGrad)" 
                      />
                      {/* Line Path */}
                      <path 
                        d="M 0 180 Q 100 120 200 150 T 400 60 T 600 100" 
                        fill="none" 
                        stroke="#6366f1" 
                        strokeWidth="3" 
                      />

                      {/* Data Points */}
                      <circle cx="200" cy="150" r="5" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
                      <circle cx="400" cy="60" r="5" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
                      <circle cx="600" cy="100" r="5" fill="#6366f1" stroke="#0f172a" strokeWidth="2" />
                    </svg>
                    
                    {/* Chart Labels */}
                    <div className="absolute bottom-0 left-0 right-0 flex justify-between text-[10px] text-slate-500 pt-2">
                      <span>Oct 15</span>
                      <span>Oct 18</span>
                      <span>Oct 21</span>
                      <span>Oct 24</span>
                    </div>
                  </div>
                </div>

                {/* Chart 2: Category Breakdown (Custom Horizontal Bar Chart) */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                  <div>
                    <h3 className="text-sm font-semibold text-slate-200">Category Allocation</h3>
                    <p className="text-xs text-slate-400">Distribution of expenses by category</p>
                  </div>

                  <div className="flex flex-col gap-4 mt-2">
                    {CATEGORIES.slice(0, 5).map((cat, idx) => {
                      const totalCatAmount = filteredTransactions
                        .filter(t => t.category === cat)
                        .reduce((sum, t) => sum + t.amount, 0);
                      const percentage = metrics.totalVolume > 0 
                        ? Math.round((totalCatAmount / metrics.totalVolume) * 100) 
                        : 0;

                      const colors = ['bg-indigo-500', 'bg-emerald-500', 'bg-amber-500', 'bg-rose-500', 'bg-sky-500'];

                      return (
                        <div key={cat} className="flex flex-col gap-1.5">
                          <div className="flex justify-between text-xs">
                            <span className="text-slate-300 font-medium">{cat}</span>
                            <span className="text-slate-400 font-semibold">
                              ${totalCatAmount.toLocaleString('en-US', { maximumFractionDigits: 0 })} ({percentage}%)
                            </span>
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden">
                            <div 
                              className={`${colors[idx % colors.length]} h-full rounded-full`} 
                              style={{ width: `${percentage}%` }}
                            />
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>

                {/* Bottom Row: Recent Anomalies & Quick Actions */}
                <div className="xl:col-span-3 grid grid-cols-1 lg:grid-cols-2 gap-6">
                  
                  {/* Recent Flagged Anomalies */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">High-Risk Anomalies</h3>
                        <p className="text-xs text-slate-400">Transactions requiring immediate review</p>
                      </div>
                      <button 
                        onClick={() => setActiveTab('anomalies')}
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        View All <ChevronRight size={14} />
                      </button>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                      {filteredTransactions.filter(t => t.riskScore >= riskThreshold).slice(0, 3).map(txn => (
                        <div 
                          key={txn.id} 
                          onClick={() => {
                            setSelectedTxnId(txn.id);
                            setActiveTab('anomalies');
                          }}
                          className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/60 hover:border-rose-500/30 cursor-pointer transition-all"
                        >
                          <div className="flex items-center gap-3">
                            <div className="bg-rose-500/10 p-2 rounded-lg text-rose-400">
                              <AlertTriangle size={16} />
                            </div>
                            <div>
                              <p className="text-xs font-semibold text-slate-200">{txn.merchant}</p>
                              <p className="text-[10px] text-slate-400">{txn.account} • MCC {txn.mcc}</p>
                            </div>
                          </div>
                          <div className="text-right">
                            <p className="text-xs font-bold text-rose-400">${txn.amount.toLocaleString()}</p>
                            <span className="text-[9px] bg-rose-500/10 text-rose-400 px-1.5 py-0.5 rounded border border-rose-500/20">
                              Risk: {txn.riskScore}%
                            </span>
                          </div>
                        </div>
                      ))}
                      {filteredTransactions.filter(t => t.riskScore >= riskThreshold).length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          No active anomalies detected above the current threshold.
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Quick Categorization Helper */}
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Quick Categorization Queue</h3>
                      <p className="text-xs text-slate-400">Uncategorized transactions matching active rules</p>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                      {filteredTransactions.filter(t => t.status === 'Uncategorized').slice(0, 3).map(txn => {
                        // Find matching rule
                        const matchingRule = mccRules.find(r => r.mcc === txn.mcc);
                        return (
                          <div 
                            key={txn.id} 
                            className="flex items-center justify-between p-3 rounded-xl bg-slate-950/80 border border-slate-800/60"
                          >
                            <div className="flex items-center gap-3">
                              <div className="bg-amber-500/10 p-2 rounded-lg text-amber-400">
                                <HelpCircle size={16} />
                              </div>
                              <div>
                                <p className="text-xs font-semibold text-slate-200">{txn.merchant}</p>
                                <p className="text-[10px] text-slate-400">MCC {txn.mcc} • Amount: ${txn.amount.toLocaleString()}</p>
                              </div>
                            </div>
                            <div className="flex items-center gap-2">
                              {matchingRule ? (
                                <button
                                  onClick={() => handleReclassify(txn.id, matchingRule.category)}
                                  className="text-[10px] bg-indigo-600 hover:bg-indigo-500 text-white px-2.5 py-1.5 rounded-lg font-medium transition-all"
                                >
                                  Auto-Apply: {matchingRule.category}
                                </button>
                              ) : (
                                <select
                                  onChange={(e) => handleReclassify(txn.id, e.target.value)}
                                  className="bg-slate-900 border border-slate-800 text-[10px] text-slate-300 rounded-lg px-2 py-1.5 focus:outline-none focus:border-indigo-500"
                                  defaultValue=""
                                >
                                  <option value="" disabled>Assign Category</option>
                                  {CATEGORIES.filter(c => c !== 'Uncategorized').map(c => (
                                    <option key={c} value={c}>{c}</option>
                                  ))}
                                </select>
                              )}
                            </div>
                          </div>
                        );
                      })}
                      {filteredTransactions.filter(t => t.status === 'Uncategorized').length === 0 && (
                        <div className="text-center py-8 text-slate-500 text-xs">
                          All transactions are fully categorized!
                        </div>
                      )}
                    </div>
                  </div>

                </div>

              </div>
            )}

            {/* ==================== TAB 2: TRANSACTION LEDGER ==================== */}
            {activeTab === 'ledger' && (
              <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl flex flex-col overflow-hidden">
                
                {/* Ledger Header / Search & Filters */}
                <div className="p-4 border-b border-slate-800 bg-slate-900/60 flex flex-col md:flex-row gap-4 items-center justify-between">
                  <div className="relative w-full md:w-80">
                    <Search className="absolute left-3 top-2.5 text-slate-500" size={16} />
                    <input
                      type="text"
                      placeholder="Search merchant, ID, MCC..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 transition-all placeholder:text-slate-600"
                    />
                  </div>

                  <div className="flex items-center gap-3 w-full md:w-auto justify-end">
                    <button 
                      onClick={() => {
                        // Simple CSV export simulation
                        const headers = 'ID,Date,Merchant,MCC,Amount,Category,Status,Account\n';
                        const rows = filteredTransactions.map(t => 
                          `"${t.id}","${t.date}","${t.merchant}","${t.mcc}",${t.amount},"${t.category}","${t.status}","${t.account}"`
                        ).join('\n');
                        const blob = new Blob([headers + rows], { type: 'text/csv' });
                        const url = window.URL.createObjectURL(blob);
                        const a = document.createElement('a');
                        a.setAttribute('href', url);
                        a.setAttribute('download', `Apex_Ledger_Export.csv`);
                        a.click();
                        triggerToast('CSV Export initiated', 'success');
                      }}
                      className="flex items-center gap-2 bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 px-4 py-2 rounded-xl text-xs font-medium transition-all"
                    >
                      <Download size={14} />
                      <span>Export CSV</span>
                    </button>
                  </div>
                </div>

                {/* Ledger Table */}
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/40">
                        <th className="py-3.5 px-6">Transaction ID</th>
                        <th className="py-3.5 px-6">Date</th>
                        <th className="py-3.5 px-6">Merchant / MCC</th>
                        <th className="py-3.5 px-6">Account</th>
                        <th className="py-3.5 px-6 text-right">Amount</th>
                        <th className="py-3.5 px-6">Category</th>
                        <th className="py-3.5 px-6">Status</th>
                        <th className="py-3.5 px-6 text-center">Risk</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 text-sm">
                      {filteredTransactions.map(txn => (
                        <tr 
                          key={txn.id} 
                          className={`hover:bg-slate-900/30 transition-all ${
                            txn.riskScore >= riskThreshold ? 'bg-rose-500/5' : ''
                          }`}
                        >
                          <td className="py-4 px-6 font-mono text-xs text-slate-400">{txn.id}</td>
                          <td className="py-4 px-6 text-slate-300">{txn.date}</td>
                          <td className="py-4 px-6">
                            <div className="flex flex-col">
                              <span className="font-semibold text-slate-200">{txn.merchant}</span>
                              <span className="text-xs text-slate-500">MCC {txn.mcc}</span>
                            </div>
                          </td>
                          <td className="py-4 px-6 text-slate-400 text-xs">{txn.account}</td>
                          <td className="py-4 px-6 text-right font-bold text-slate-200">
                            ${txn.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                          </td>
                          <td className="py-4 px-6">
                            <select
                              value={txn.category}
                              onChange={(e) => handleReclassify(txn.id, e.target.value)}
                              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1.5 focus:outline-none focus:border-indigo-500 transition-all"
                            >
                              {CATEGORIES.map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                              ))}
                            </select>
                          </td>
                          <td className="py-4 px-6">
                            <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold border ${
                              txn.status === 'Categorized' 
                                ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                                : txn.status === 'Pending'
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                                : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                            }`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${
                                txn.status === 'Categorized' ? 'bg-emerald-400' : txn.status === 'Pending' ? 'bg-amber-400' : 'bg-rose-400'
                              }`} />
                              {txn.status}
                            </span>
                          </td>
                          <td className="py-4 px-6 text-center">
                            <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                              txn.riskScore >= riskThreshold 
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' 
                                : 'bg-slate-800 text-slate-400'
                            }`}>
                              {txn.riskScore}%
                            </span>
                          </td>
                        </tr>
                      ))}
                      {filteredTransactions.length === 0 && (
                        <tr>
                          <td colSpan={8} className="text-center py-12 text-slate-500">
                            No transactions match the current filters.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>

              </div>
            )}

            {/* ==================== TAB 3: ANOMALY INVESTIGATION CENTER ==================== */}
            {activeTab === 'anomalies' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Panel: Flagged Transactions List */}
                <div className="xl:col-span-2 flex flex-col gap-4">
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Flagged Transactions Queue</h3>
                      <p className="text-xs text-slate-400">Real-time risk engine detections requiring manual sign-off</p>
                    </div>

                    <div className="flex flex-col gap-3 mt-2">
                      {transactions.filter(t => t.riskScore >= riskThreshold).map(txn => (
                        <div 
                          key={txn.id}
                          onClick={() => setSelectedTxnId(txn.id)}
                          className={`flex items-center justify-between p-4 rounded-xl border transition-all cursor-pointer ${
                            selectedTxnId === txn.id 
                              ? 'bg-indigo-600/10 border-indigo-500/50 shadow-lg shadow-indigo-500/5' 
                              : 'bg-slate-950/80 border-slate-800/60 hover:border-slate-700'
                          }`}
                        >
                          <div className="flex items-center gap-4">
                            <div className="bg-rose-500/10 p-2.5 rounded-xl text-rose-400">
                              <AlertTriangle size={18} />
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="font-semibold text-slate-200 text-sm">{txn.merchant}</span>
                                <span className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded font-mono">
                                  {txn.id}
                                </span>
                              </div>
                              <p className="text-xs text-slate-400 mt-0.5">{txn.account} • MCC {txn.mcc}</p>
                            </div>
                          </div>
                          <div className="text-right flex items-center gap-4">
                            <div>
                              <p className="text-sm font-bold text-rose-400">${txn.amount.toLocaleString()}</p>
                              <p className="text-[10px] text-slate-500">{txn.date}</p>
                            </div>
                            <div className="bg-rose-500/10 text-rose-400 border border-rose-500/20 px-2.5 py-1 rounded-lg text-xs font-bold">
                              {txn.riskScore}% Risk
                            </div>
                          </div>
                        </div>
                      ))}
                      {transactions.filter(t => t.riskScore >= riskThreshold).length === 0 && (
                        <div className="text-center py-12 text-slate-500 text-sm">
                          No active anomalies detected above the current threshold.
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Right Panel: Investigation & Action Panel */}
                <div className="flex flex-col gap-4">
                  {selectedTxnDetails ? (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-6 sticky top-24">
                      <div className="flex items-center justify-between border-b border-slate-800/60 pb-4">
                        <div>
                          <span className="text-[10px] font-bold text-indigo-400 uppercase tracking-wider">Investigation File</span>
                          <h3 className="text-sm font-semibold text-slate-200">{selectedTxnDetails.id}</h3>
                        </div>
                        <span className="text-xs text-slate-400">{selectedTxnDetails.date}</span>
                      </div>

                      {/* Risk Score Indicator */}
                      <div className="bg-slate-950 p-4 rounded-xl border border-slate-800/80 flex items-center justify-between">
                        <div>
                          <p className="text-xs text-slate-400">Risk Assessment Score</p>
                          <p className="text-lg font-bold text-rose-400 mt-0.5">{selectedTxnDetails.riskScore}% High Risk</p>
                        </div>
                        <div className="w-12 h-12 rounded-full border-4 border-rose-500/20 flex items-center justify-center relative">
                          <span className="text-xs font-bold text-rose-400">{selectedTxnDetails.riskScore}</span>
                        </div>
                      </div>

                      {/* Anomaly Reason */}
                      <div className="flex flex-col gap-1.5">
                        <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                          <Info size={14} className="text-amber-500" />
                          <span>Anomaly Reason</span>
                        </span>
                        <p className="text-xs text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/60 leading-relaxed">
                          {selectedTxnDetails.anomalyReason || 'No specific anomaly reason provided. Flagged due to general risk threshold settings.'}
                        </p>
                      </div>

                      {/* Transaction Details */}
                      <div className="flex flex-col gap-3 text-xs">
                        <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                          <span className="text-slate-500">Merchant:</span>
                          <span className="text-slate-300 font-medium">{selectedTxnDetails.merchant}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                          <span className="text-slate-500">MCC Code:</span>
                          <span className="text-slate-300 font-medium">{selectedTxnDetails.mcc}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                          <span className="text-slate-500">Account:</span>
                          <span className="text-slate-300 font-medium">{selectedTxnDetails.account}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                          <span className="text-slate-500">Amount:</span>
                          <span className="text-slate-200 font-bold">${selectedTxnDetails.amount.toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between py-1.5 border-b border-slate-800/40">
                          <span className="text-slate-500">Current Category:</span>
                          <span className="text-slate-300 font-medium">{selectedTxnDetails.category}</span>
                        </div>
                      </div>

                      {/* Action Buttons */}
                      <div className="flex flex-col gap-2 mt-2">
                        <button
                          onClick={() => handleApproveAnomaly(selectedTxnDetails.id)}
                          className="w-full bg-emerald-600 hover:bg-emerald-500 text-white py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2"
                        >
                          <Check size={16} />
                          <span>Dismiss Anomaly & Approve</span>
                        </button>
                        
                        <div className="grid grid-cols-2 gap-2">
                          <select
                            onChange={(e) => handleReclassify(selectedTxnDetails.id, e.target.value)}
                            className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-xl px-3 py-2.5 focus:outline-none focus:border-indigo-500 transition-all"
                            defaultValue=""
                          >
                            <option value="" disabled>Reclassify</option>
                            {CATEGORIES.filter(c => c !== 'Uncategorized').map(c => (
                              <option key={c} value={c}>{c}</option>
                            ))}
                          </select>

                          <button
                            onClick={() => {
                              triggerToast(`Transaction ${selectedTxnDetails.id} held for audit`, 'info');
                            }}
                            className="bg-slate-950 hover:bg-slate-800 text-slate-300 border border-slate-800 py-2.5 rounded-xl text-xs font-semibold transition-all"
                          >
                            Hold for Audit
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 text-center py-12 text-slate-500 text-xs">
                      Select a flagged transaction to begin investigation.
                    </div>
                  )}
                </div>

              </div>
            )}

            {/* ==================== TAB 4: MCC & CATEGORIZATION RULES ==================== */}
            {activeTab === 'rules' && (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Panel: Rules List */}
                <div className="xl:col-span-2 flex flex-col gap-4">
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="text-sm font-semibold text-slate-200">Active Categorization Rules</h3>
                        <p className="text-xs text-slate-400">Rules mapping Merchant Category Codes (MCC) and patterns to target categories</p>
                      </div>
                    </div>

                    <div className="overflow-x-auto mt-2">
                      <table className="w-full text-left border-collapse">
                        <thead>
                          <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider bg-slate-950/40">
                            <th className="py-3 px-4">MCC</th>
                            <th className="py-3 px-4">Merchant Pattern</th>
                            <th className="py-3 px-4">Target Category</th>
                            <th className="py-3 px-4 text-center">Confidence</th>
                            <th className="py-3 px-4 text-center">Auto-Approve</th>
                            <th className="py-3 px-4 text-right">Actions</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-800/60 text-xs">
                          {mccRules.map(rule => (
                            <tr key={rule.id} className="hover:bg-slate-900/30 transition-all">
                              <td className="py-3.5 px-4 font-mono font-semibold text-indigo-400">{rule.mcc}</td>
                              <td className="py-3.5 px-4 text-slate-300 font-medium">{rule.merchantPattern}</td>
                              <td className="py-3.5 px-4">
                                <span className="bg-slate-950 px-2.5 py-1 rounded-lg border border-slate-800 text-slate-300">
                                  {rule.category}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className="text-emerald-400 font-semibold">{rule.confidence}%</span>
                              </td>
                              <td className="py-3.5 px-4 text-center">
                                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold ${
                                  rule.autoApprove 
                                    ? 'bg-emerald-500/10 text-emerald-400' 
                                    : 'bg-slate-800 text-slate-400'
                                }`}>
                                  {rule.autoApprove ? 'Yes' : 'No'}
                                </span>
                              </td>
                              <td className="py-3.5 px-4 text-right">
                                <button 
                                  onClick={() => handleDeleteRule(rule.id)}
                                  className="text-slate-500 hover:text-rose-400 p-1 transition-all"
                                  title="Delete Rule"
                                >
                                  <Trash2 size={14} />
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                </div>

                {/* Right Panel: Add New Rule Form */}
                <div className="flex flex-col gap-4">
                  <div className="bg-slate-900/40 border border-slate-800/80 rounded-2xl p-6 flex flex-col gap-4">
                    <div>
                      <h3 className="text-sm font-semibold text-slate-200">Create Categorization Rule</h3>
                      <p className="text-xs text-slate-400">Define new mapping logic for the AI engine</p>
                    </div>

                    <form onSubmit={handleAddRule} className="flex flex-col gap-4 mt-2">
                      {/* MCC Input */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">MCC Code</label>
                        <input
                          type="text"
                          placeholder="e.g. 7372"
                          value={newRuleMcc}
                          onChange={(e) => setNewRuleMcc(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      {/* Merchant Pattern */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Merchant Pattern (Regex/Text)</label>
                        <input
                          type="text"
                          placeholder="e.g. AWS|Amazon Web Services"
                          value={newRulePattern}
                          onChange={(e) => setNewRulePattern(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                        />
                      </div>

                      {/* Target Category */}
                      <div className="flex flex-col gap-1.5">
                        <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Target Category</label>
                        <select
                          value={newRuleCategory}
                          onChange={(e) => setNewRuleCategory(e.target.value)}
                          className="bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-300 focus:outline-none focus:border-indigo-500 transition-all"
                        >
                          {CATEGORIES.filter(c => c !== 'Uncategorized').map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                          ))}
                        </select>
                      </div>

                      {/* Auto Approve Toggle */}
                      <div className="flex items-center justify-between bg-slate-950 p-3 rounded-xl border border-slate-800/60">
                        <div>
                          <p className="text-xs font-semibold text-slate-300">Auto-Approve</p>
                          <p className="text-[10px] text-slate-500">Skip manual review queue</p>
                        </div>
                        <input
                          type="checkbox"
                          checked={newRuleAuto}
                          onChange={(e) => setNewRuleAuto(e.target.checked)}
                          className="w-4 h-4 accent-indigo-500 rounded cursor-pointer"
                        />
                      </div>

                      <button
                        type="submit"
                        className="w-full bg-indigo-600 hover:bg-indigo-500 text-white py-2.5 rounded-xl text-xs font-semibold transition-all flex items-center justify-center gap-2 mt-2"
                      >
                        <Plus size={16} />
                        <span>Create & Apply Rule</span>
                      </button>
                    </form>
                  </div>
                </div>

              </div>
            )}

          </div>
        </main>

      </div>
    </div>
  );
}