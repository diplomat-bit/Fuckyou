import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, 
  Filter, 
  Check, 
  Link2, 
  ArrowRight, 
  Globe, 
  AlertCircle, 
  Info, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Zap, 
  CheckCircle2, 
  HelpCircle, 
  RefreshCw, 
  ChevronRight, 
  ShieldCheck,
  Coins,
  Building2,
  ArrowLeftRight
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export interface Payee {
  id: string;
  name: string;
  entityName: string;
  category: string;
  currency: string;
  eligibleSourceAccountIds: string[];
  status: 'Active' | 'Pending' | 'Suspended';
  limit: number;
  avatarUrl?: string;
  riskScore: 'Low' | 'Medium' | 'High';
  lastTransactionDate?: string;
}

export interface SourceAccount {
  id: string;
  name: string;
  bankName: string;
  accountNumber: string;
  balance: number;
  currency: string;
  type: 'Checking' | 'Savings' | 'Treasury' | 'Multi-Currency';
  status: 'Active' | 'Inactive';
}

export interface ConnectionRule {
  id: string;
  payeeId: string;
  sourceAccountId: string;
  autoApproveLimit: number;
  requiresDualApproval: boolean;
  preferredRoute: boolean;
}

// --- MOCK DATA ---
const MOCK_SOURCE_ACCOUNTS: SourceAccount[] = [
  { id: 'sa-1', name: 'SVB Operating Account', bankName: 'Silicon Valley Bank', accountNumber: '•••• 4829', balance: 12450800.50, currency: 'USD', type: 'Checking', status: 'Active' },
  { id: 'sa-2', name: 'Barclays Treasury', bankName: 'Barclays PLC', accountNumber: '•••• 9012', balance: 8450000.00, currency: 'GBP', type: 'Treasury', status: 'Active' },
  { id: 'sa-3', name: 'Deutsche Bank Euro Pool', bankName: 'Deutsche Bank', accountNumber: '•••• 3344', balance: 6120450.20, currency: 'EUR', type: 'Multi-Currency', status: 'Active' },
  { id: 'sa-4', name: 'Chase Operating', bankName: 'JPMorgan Chase', accountNumber: '•••• 7711', balance: 3200150.00, currency: 'USD', type: 'Checking', status: 'Active' },
  { id: 'sa-5', name: 'HSBC HK Treasury', bankName: 'HSBC Holdings', accountNumber: '•••• 5566', balance: 15800000.00, currency: 'HKD', type: 'Treasury', status: 'Active' },
  { id: 'sa-6', name: 'Tokyo MUFG Operating', bankName: 'MUFG Bank', accountNumber: '•••• 8822', balance: 450000000, currency: 'JPY', type: 'Checking', status: 'Active' },
];

const MOCK_PAYEES: Payee[] = [
  { id: 'p-1', name: 'Acme Global Logistics', entityName: 'Acme Corp LLC', category: 'Supply Chain', currency: 'USD', eligibleSourceAccountIds: ['sa-1', 'sa-4'], status: 'Active', limit: 500000, riskScore: 'Low', lastTransactionDate: '2023-10-24' },
  { id: 'p-2', name: 'EuroTech Solutions', entityName: 'EuroTech GmbH', category: 'IT Services', currency: 'EUR', eligibleSourceAccountIds: ['sa-3'], status: 'Active', limit: 250000, riskScore: 'Low', lastTransactionDate: '2023-10-22' },
  { id: 'p-3', name: 'Apex Marketing Group', entityName: 'Apex Media Ltd', category: 'Marketing', currency: 'GBP', eligibleSourceAccountIds: ['sa-2', 'sa-3'], status: 'Active', limit: 120000, riskScore: 'Medium', lastTransactionDate: '2023-10-19' },
  { id: 'p-4', name: 'Nippon Steel Corp', entityName: 'Nippon Steel KK', category: 'Manufacturing', currency: 'JPY', eligibleSourceAccountIds: ['sa-6'], status: 'Active', limit: 2000000, riskScore: 'Low', lastTransactionDate: '2023-10-15' },
  { id: 'p-5', name: 'Global Cloud Hosting', entityName: 'Cloud Infrastructure Inc', category: 'SaaS', currency: 'USD', eligibleSourceAccountIds: ['sa-1', 'sa-3', 'sa-4'], status: 'Active', limit: 1000000, riskScore: 'Low', lastTransactionDate: '2023-10-25' },
  { id: 'p-6', name: 'Shenzhen Assembly Partners', entityName: 'Shenzhen Mfg Ltd', category: 'Hardware', currency: 'HKD', eligibleSourceAccountIds: ['sa-5'], status: 'Pending', limit: 750000, riskScore: 'High', lastTransactionDate: '2023-09-30' },
  { id: 'p-7', name: 'Vanguard Legal Services', entityName: 'Vanguard LLP', category: 'Legal', currency: 'USD', eligibleSourceAccountIds: ['sa-4'], status: 'Active', limit: 50000, riskScore: 'Medium', lastTransactionDate: '2023-10-01' },
];

const MOCK_RULES: ConnectionRule[] = [
  { id: 'r-1', payeeId: 'p-1', sourceAccountId: 'sa-1', autoApproveLimit: 100000, requiresDualApproval: false, preferredRoute: true },
  { id: 'r-2', payeeId: 'p-1', sourceAccountId: 'sa-4', autoApproveLimit: 50000, requiresDualApproval: true, preferredRoute: false },
  { id: 'r-3', payeeId: 'p-2', sourceAccountId: 'sa-3', autoApproveLimit: 150000, requiresDualApproval: false, preferredRoute: true },
  { id: 'r-4', payeeId: 'p-3', sourceAccountId: 'sa-2', autoApproveLimit: 80000, requiresDualApproval: false, preferredRoute: true },
  { id: 'r-5', payeeId: 'p-5', sourceAccountId: 'sa-1', autoApproveLimit: 500000, requiresDualApproval: true, preferredRoute: true },
];

export default function PayeeCombinationList() {
  // --- STATE ---
  const [payees, setPayees] = useState<Payee[]>(MOCK_PAYEES);
  const [sourceAccounts, setSourceAccounts] = useState<SourceAccount[]>(MOCK_SOURCE_ACCOUNTS);
  const [rules, setRules] = useState<ConnectionRule[]>(MOCK_RULES);

  const [selectedPayeeId, setSelectedPayeeId] = useState<string | null>('p-1');
  const [selectedSourceAccountId, setSelectedSourceAccountId] = useState<string | null>(null);
  
  const [hoveredPayeeId, setHoveredPayeeId] = useState<string | null>(null);
  const [hoveredSourceAccountId, setHoveredSourceAccountId] = useState<string | null>(null);

  const [payeeSearch, setPayeeSearch] = useState('');
  const [sourceSearch, setSourceSearch] = useState('');
  const [currencyFilter, setCurrencyFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');

  // Interactive simulation state
  const [simulationAmount, setSimulationAmount] = useState<string>('25000');
  const [simulationResult, setSimulationResult] = useState<{
    allowed: boolean;
    message: string;
    requiresApproval: boolean;
    routeType: 'Preferred' | 'Standard' | 'None';
  } | null>(null);

  // --- REFS FOR SVG CONNECTIONS ---
  const containerRef = useRef<HTMLDivElement>(null);
  const payeeRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const sourceRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});
  const [svgPaths, setSvgPaths] = useState<Array<{ path: string; active: boolean; id: string }>>([]);

  // --- CURRENCIES LIST ---
  const currencies = useMemo(() => {
    const all = new Set([...payees.map(p => p.currency), ...sourceAccounts.map(s => s.currency)]);
    return ['All', ...Array.from(all)];
  }, [payees, sourceAccounts]);

  // --- FILTERED DATA ---
  const filteredPayees = useMemo(() => {
    return payees.filter(p => {
      const matchesSearch = p.name.toLowerCase().includes(payeeSearch.toLowerCase()) || 
                            p.entityName.toLowerCase().includes(payeeSearch.toLowerCase()) ||
                            p.category.toLowerCase().includes(payeeSearch.toLowerCase());
      const matchesCurrency = currencyFilter === 'All' || p.currency === currencyFilter;
      const matchesRisk = riskFilter === 'All' || p.riskScore === riskFilter;
      return matchesSearch && matchesCurrency && matchesRisk;
    });
  }, [payees, payeeSearch, currencyFilter, riskFilter]);

  const filteredSourceAccounts = useMemo(() => {
    return sourceAccounts.filter(sa => {
      const matchesSearch = sa.name.toLowerCase().includes(sourceSearch.toLowerCase()) || 
                            sa.bankName.toLowerCase().includes(sourceSearch.toLowerCase()) ||
                            sa.accountNumber.includes(sourceSearch);
      const matchesCurrency = currencyFilter === 'All' || sa.currency === currencyFilter;
      return matchesSearch && matchesCurrency;
    });
  }, [sourceAccounts, sourceSearch, currencyFilter]);

  // --- INTERACTIVE HIGHLIGHT LOGIC ---
  const activePayeeId = hoveredPayeeId || selectedPayeeId;
  const activeSourceAccountId = hoveredSourceAccountId || selectedSourceAccountId;

  // Determine which source accounts are linked to the active payee
  const linkedSourceAccountIds = useMemo(() => {
    if (!activePayeeId) return [];
    const payee = payees.find(p => p.id === activePayeeId);
    return payee ? payee.eligibleSourceAccountIds : [];
  }, [activePayeeId, payees]);

  // Determine which payees are linked to the active source account
  const linkedPayeeIds = useMemo(() => {
    if (!activeSourceAccountId) return [];
    return payees
      .filter(p => p.eligibleSourceAccountIds.includes(activeSourceAccountId))
      .map(p => p.id);
  }, [activeSourceAccountId, payees]);

  // --- SIMULATION ENGINE ---
  useEffect(() => {
    if (!selectedPayeeId || !selectedSourceAccountId) {
      setSimulationResult(null);
      return;
    }

    const payee = payees.find(p => p.id === selectedPayeeId);
    const source = sourceAccounts.find(s => s.id === selectedSourceAccountId);

    if (!payee || !source) return;

    const amount = parseFloat(simulationAmount) || 0;

    // Check currency compatibility
    const currencyMismatch = payee.currency !== source.currency;
    
    // Check eligibility
    const isEligible = payee.eligibleSourceAccountIds.includes(source.id);

    if (!isEligible) {
      setSimulationResult({
        allowed: false,
        message: `Incompatible Route: ${payee.name} is not authorized to receive funds from ${source.name}.`,
        requiresApproval: false,
        routeType: 'None'
      });
      return;
    }

    if (amount > payee.limit) {
      setSimulationResult({
        allowed: false,
        message: `Limit Exceeded: Transaction amount exceeds the maximum payee limit of ${formatCurrency(payee.limit, payee.currency)}.`,
        requiresApproval: false,
        routeType: 'None'
      });
      return;
    }

    if (amount > source.balance) {
      setSimulationResult({
        allowed: false,
        message: `Insufficient Funds: Source account balance is ${formatCurrency(source.balance, source.currency)}.`,
        requiresApproval: false,
        routeType: 'None'
      });
      return;
    }

    // Find specific rule
    const rule = rules.find(r => r.payeeId === payee.id && r.sourceAccountId === source.id);
    const requiresDual = rule ? rule.requiresDualApproval || amount > rule.autoApproveLimit : amount > 100000;
    const isPreferred = rule ? rule.preferredRoute : false;

    let msg = `Route Authorized. `;
    if (currencyMismatch) {
      msg += `Note: Cross-currency conversion from ${source.currency} to ${payee.currency} will apply.`;
    } else {
      msg += `Direct ${source.currency} transfer route verified.`;
    }

    setSimulationResult({
      allowed: true,
      message: msg,
      requiresApproval: requiresDual,
      routeType: isPreferred ? 'Preferred' : 'Standard'
    });

  }, [selectedPayeeId, selectedSourceAccountId, simulationAmount, payees, sourceAccounts, rules]);

  // --- DYNAMIC SVG PATH GENERATOR ---
  // Calculates coordinates between payee list items and source account list items
  const updateConnections = () => {
    if (!containerRef.current) return;

    const containerRect = containerRef.current.getBoundingClientRect();
    const paths: Array<{ path: string; active: boolean; id: string }> = [];

    payees.forEach(payee => {
      const payeeEl = payeeRefs.current[payee.id];
      if (!payeeEl) return;

      const payeeRect = payeeEl.getBoundingClientRect();
      const startX = payeeRect.right - containerRect.left;
      const startY = payeeRect.top + payeeRect.height / 2 - containerRect.top;

      payee.eligibleSourceAccountIds.forEach(saId => {
        const sourceEl = sourceRefs.current[saId];
        if (!sourceEl) return;

        const sourceRect = sourceEl.getBoundingClientRect();
        const endX = sourceRect.left - containerRect.left;
        const endY = sourceRect.top + sourceRect.height / 2 - containerRect.top;

        // Control points for smooth cubic bezier curve
        const cp1X = startX + (endX - startX) * 0.4;
        const cp1Y = startY;
        const cp2X = startX + (endX - startX) * 0.6;
        const cp2Y = endY;

        const path = `M ${startX} ${startY} C ${cp1X} ${cp1Y}, ${cp2X} ${cp2Y}, ${endX} ${endY}`;
        
        // Determine if this connection is currently active/highlighted
        const isActive = 
          (activePayeeId === payee.id) || 
          (activeSourceAccountId === saId) ||
          (selectedPayeeId === payee.id && selectedSourceAccountId === saId);

        // Only draw if it matches filters or is active to avoid clutter
        const payeeVisible = filteredPayees.some(p => p.id === payee.id);
        const sourceVisible = filteredSourceAccounts.some(s => s.id === saId);

        if (payeeVisible && sourceVisible) {
          paths.push({
            id: `${payee.id}-${saId}`,
            path,
            active: isActive
          });
        }
      });
    });

    setSvgPaths(paths);
  };

  // Trigger path updates on layout changes, scrolls, or selections
  useEffect(() => {
    updateConnections();
    window.addEventListener('resize', updateConnections);
    
    // Small timeout to ensure DOM elements have fully rendered and positioned
    const timer = setTimeout(updateConnections, 100);

    return () => {
      window.removeEventListener('resize', updateConnections);
      clearTimeout(timer);
    };
  }, [filteredPayees, filteredSourceAccounts, activePayeeId, activeSourceAccountId, selectedPayeeId, selectedSourceAccountId]);

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      minimumFractionDigits: 2
    }).format(value);
  };

  const getRiskBadgeColor = (risk: string) => {
    switch (risk) {
      case 'Low': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Medium': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'High': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  const getStatusBadgeColor = (status: string) => {
    switch (status) {
      case 'Active': return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      case 'Pending': return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'Suspended': return 'bg-rose-500/10 text-rose-400 border-rose-500/20';
      default: return 'bg-slate-500/10 text-slate-400 border-slate-500/20';
    }
  };

  // --- RENDER ---
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 lg:p-10 font-sans selection:bg-indigo-500/30 selection:text-indigo-200">
      
      {/* HEADER SECTION */}
      <header className="mb-8 border-b border-slate-800/60 pb-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-1">
              <Layers className="w-4 h-4 animate-pulse" />
              <span>Autonomous Treasury Engine</span>
            </div>
            <h1 className="text-3xl lg:text-4xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              Payee &amp; Source Account Matrix
            </h1>
            <p className="text-slate-400 mt-1 text-sm lg:text-base max-w-3xl">
              Visualize complex multi-currency relationships, verify transaction routing rules, and simulate real-time compliance checks across global entities.
            </p>
          </div>
          
          {/* Quick Stats */}
          <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-3 rounded-xl shadow-inner">
            <div className="px-3 py-1 border-r border-slate-800 text-center">
              <span className="block text-xs text-slate-500 font-medium uppercase">Payees</span>
              <span className="text-lg font-bold text-indigo-400">{payees.length}</span>
            </div>
            <div className="px-3 py-1 border-r border-slate-800 text-center">
              <span className="block text-xs text-slate-500 font-medium uppercase">Sources</span>
              <span className="text-lg font-bold text-emerald-400">{sourceAccounts.length}</span>
            </div>
            <div className="px-3 py-1 text-center">
              <span className="block text-xs text-slate-500 font-medium uppercase">Active Routes</span>
              <span className="text-lg font-bold text-violet-400">
                {payees.reduce((acc, curr) => acc + curr.eligibleSourceAccountIds.length, 0)}
              </span>
            </div>
          </div>
        </div>

        {/* GLOBAL FILTERS */}
        <div className="mt-6 flex flex-wrap items-center gap-3 bg-slate-900/40 p-3 rounded-xl border border-slate-800/50">
          <div className="flex items-center gap-2 text-xs text-slate-400 font-semibold uppercase tracking-wider px-2">
            <Filter className="w-3.5 h-3.5 text-indigo-400" />
            <span>Global Filters:</span>
          </div>
          
          {/* Currency Filter */}
          <div className="flex items-center gap-1.5">
            <span className="text-xs text-slate-500">Currency:</span>
            <div className="flex gap-1 bg-slate-950 p-1 rounded-lg border border-slate-800">
              {currencies.map(curr => (
                <button
                  key={curr}
                  onClick={() => setCurrencyFilter(curr)}
                  className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                    currencyFilter === curr 
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-900/30' 
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
                  }`}
                >
                  {curr}
                </button>
              ))}
            </div>
          </div>

          {/* Risk Filter */}
          <div className="flex items-center gap-1.5 ml-auto md:ml-0">
            <span className="text-xs text-slate-500">Risk Profile:</span>
            <select
              value={riskFilter}
              onChange={(e) => setRiskFilter(e.target.value)}
              className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            >
              <option value="All">All Risks</option>
              <option value="Low">Low Risk</option>
              <option value="Medium">Medium Risk</option>
              <option value="High">High Risk</option>
            </select>
          </div>

          {/* Reset Button */}
          {(currencyFilter !== 'All' || riskFilter !== 'All' || payeeSearch !== '' || sourceSearch !== '') && (
            <button
              onClick={() => {
                setCurrencyFilter('All');
                setRiskFilter('All');
                setPayeeSearch('');
                setSourceSearch('');
              }}
              className="flex items-center gap-1 text-xs text-indigo-400 hover:text-indigo-300 transition-colors ml-auto"
            >
              <RefreshCw className="w-3 h-3" />
              Reset Filters
            </button>
          )}
        </div>
      </header>

      {/* MAIN WORKSPACE */}
      <div ref={containerRef} className="relative grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* SVG CONNECTIONS LAYER (Absolute positioned behind elements) */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none z-0 hidden lg:block">
          <defs>
            <linearGradient id="grad-active" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#6366f1" stopOpacity="0.8" />
              <stop offset="50%" stopColor="#a855f7" stopOpacity="0.8" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.8" />
            </linearGradient>
            <linearGradient id="grad-inactive" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#334155" stopOpacity="0.15" />
              <stop offset="100%" stopColor="#334155" stopOpacity="0.15" />
            </linearGradient>
            <filter id="glow" x="-10%" y="-10%" width="120%" height="120%">
              <feDropShadow dx="0" dy="0" stdDeviation="4" floodColor="#818cf8" floodOpacity="0.5" />
            </filter>
          </defs>
          
          {/* Draw inactive lines first so they sit underneath */}
          {svgPaths.filter(p => !p.active).map(p => (
            <path
              key={p.id}
              d={p.path}
              fill="none"
              stroke="url(#grad-inactive)"
              strokeWidth="1.5"
              className="transition-all duration-500"
            />
          ))}

          {/* Draw active lines with glow */}
          {svgPaths.filter(p => p.active).map(p => (
            <path
              key={p.id}
              d={p.path}
              fill="none"
              stroke="url(#grad-active)"
              strokeWidth="3"
              filter="url(#glow)"
              strokeDasharray="8, 4"
              className="transition-all duration-500 animate-[dash_30s_linear_infinite]"
              style={{ strokeDashoffset: 100 }}
            />
          ))}
        </svg>

        {/* LEFT COLUMN: PAYEES LIST */}
        <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-indigo-500 animate-ping" />
              <h2 className="text-lg font-bold text-slate-200">Payees</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredPayees.length} of {payees.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search payees, categories..."
              value={payeeSearch}
              onChange={(e) => setPayeeSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
            />
          </div>

          {/* Payees Scrollable Container */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredPayees.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No payees match the criteria.</p>
              </div>
            ) : (
              filteredPayees.map(payee => {
                const isSelected = selectedPayeeId === payee.id;
                const isHovered = hoveredPayeeId === payee.id;
                const isLinkedToActiveSource = activeSourceAccountId 
                  ? payee.eligibleSourceAccountIds.includes(activeSourceAccountId) 
                  : false;

                return (
                  <div
                    key={payee.id}
                    ref={el => { payeeRefs.current[payee.id] = el; }}
                    onMouseEnter={() => setHoveredPayeeId(payee.id)}
                    onMouseLeave={() => setHoveredPayeeId(null)}
                    onClick={() => {
                      setSelectedPayeeId(payee.id);
                      // Auto-select first eligible source account if current selection is not eligible
                      if (payee.eligibleSourceAccountIds.length > 0) {
                        if (!payee.eligibleSourceAccountIds.includes(selectedSourceAccountId || '')) {
                          setSelectedSourceAccountId(payee.eligibleSourceAccountIds[0]);
                        }
                      } else {
                        setSelectedSourceAccountId(null);
                      }
                    }}
                    className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-indigo-950/30 border-indigo-500/80 shadow-lg shadow-indigo-950/20' 
                        : isHovered
                        ? 'bg-slate-800/40 border-slate-700/80'
                        : isLinkedToActiveSource
                        ? 'bg-emerald-950/10 border-emerald-500/40'
                        : 'bg-slate-900/30 border-slate-800/60'
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isSelected && (
                      <div className="absolute left-0 top-3 bottom-3 w-1 bg-indigo-500 rounded-r-md" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                          {payee.name}
                          {payee.status === 'Pending' && (
                            <span className="w-1.5 h-1.5 rounded-full bg-amber-500" />
                          )}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5">{payee.entityName}</p>
                      </div>
                      
                      {/* Currency Badge */}
                      <span className="bg-slate-950 border border-slate-800 text-indigo-400 font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                        {payee.currency}
                      </span>
                    </div>

                    {/* Meta Details */}
                    <div className="mt-3 flex flex-wrap items-center gap-2 text-[11px]">
                      <span className="text-slate-400 bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/50">
                        {payee.category}
                      </span>
                      <span className={`px-2 py-0.5 rounded border ${getRiskBadgeColor(payee.riskScore)}`}>
                        {payee.riskScore} Risk
                      </span>
                      <span className="text-slate-500 ml-auto">
                        Limit: {formatCurrency(payee.limit, payee.currency)}
                      </span>
                    </div>

                    {/* Connection Indicator Dots */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="flex items-center gap-1">
                        <Link2 className="w-3 h-3 text-indigo-400" />
                        {payee.eligibleSourceAccountIds.length} Eligible Sources
                      </span>
                      {payee.lastTransactionDate && (
                        <span>Last: {payee.lastTransactionDate}</span>
                      )}
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

        {/* CENTER COLUMN: INTERACTIVE CONNECTION HUB */}
        <div className="lg:col-span-4 flex flex-col gap-6 z-10">
          
          {/* CONNECTION STATUS CARD */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <h2 className="text-lg font-bold text-slate-200 mb-4 flex items-center gap-2">
              <ArrowLeftRight className="w-5 h-5 text-indigo-400" />
              <span>Route Analyzer</span>
            </h2>

            {selectedPayeeId ? (
              <div className="space-y-4">
                {/* Selected Payee Summary */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-indigo-400 font-semibold uppercase tracking-wider block mb-1">Selected Payee</span>
                  {(() => {
                    const payee = payees.find(p => p.id === selectedPayeeId);
                    if (!payee) return null;
                    return (
                      <div>
                        <div className="flex justify-between items-center">
                          <span className="font-bold text-slate-200 text-sm">{payee.name}</span>
                          <span className="text-xs font-mono text-indigo-400 bg-indigo-950/40 px-1.5 py-0.5 rounded border border-indigo-900/30">{payee.currency}</span>
                        </div>
                        <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-400">
                          <span>Limit: {formatCurrency(payee.limit, payee.currency)}</span>
                          <span>•</span>
                          <span className={`px-1.5 py-0.2 rounded text-[10px] border ${getStatusBadgeColor(payee.status)}`}>{payee.status}</span>
                        </div>
                      </div>
                    );
                  })()}
                </div>

                {/* Connection Bridge Graphic */}
                <div className="flex items-center justify-center py-2">
                  <div className="h-px bg-gradient-to-r from-indigo-500/20 via-indigo-500 to-emerald-500/20 flex-1" />
                  <div className="bg-slate-950 border border-slate-800 p-2 rounded-full mx-3 shadow-lg">
                    <Zap className={`w-5 h-5 ${selectedSourceAccountId ? 'text-amber-400 animate-pulse' : 'text-slate-600'}`} />
                  </div>
                  <div className="h-px bg-gradient-to-r from-emerald-500/20 via-emerald-500 to-indigo-500/20 flex-1" />
                </div>

                {/* Selected Source Summary */}
                <div className="bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80">
                  <span className="text-[10px] text-emerald-400 font-semibold uppercase tracking-wider block mb-1">Selected Source Account</span>
                  {selectedSourceAccountId ? (
                    (() => {
                      const source = sourceAccounts.find(s => s.id === selectedSourceAccountId);
                      if (!source) return null;
                      return (
                        <div>
                          <div className="flex justify-between items-center">
                            <span className="font-bold text-slate-200 text-sm">{source.name}</span>
                            <span className="text-xs font-mono text-emerald-400 bg-emerald-950/40 px-1.5 py-0.5 rounded border border-emerald-900/30">{source.currency}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1.5 text-xs text-slate-400">
                            <span>{source.bankName}</span>
                            <span className="font-mono text-slate-500">{source.accountNumber}</span>
                          </div>
                        </div>
                      );
                    })()
                  ) : (
                    <div className="text-center py-2 text-xs text-slate-500 italic">
                      Select a source account on the right to analyze route
                    </div>
                  )}
                </div>

                {/* Route Rule Details */}
                {selectedSourceAccountId && (
                  <div className="bg-slate-950/40 p-3 rounded-xl border border-slate-800/50 text-xs space-y-2">
                    <div className="flex justify-between text-slate-400">
                      <span>Route Status:</span>
                      {(() => {
                        const payee = payees.find(p => p.id === selectedPayeeId);
                        const isEligible = payee?.eligibleSourceAccountIds.includes(selectedSourceAccountId);
                        return isEligible ? (
                          <span className="text-emerald-400 font-semibold flex items-center gap-1">
                            <CheckCircle2 className="w-3.5 h-3.5" /> Authorized
                          </span>
                        ) : (
                          <span className="text-rose-400 font-semibold flex items-center gap-1">
                            <AlertCircle className="w-3.5 h-3.5" /> Unauthorized
                          </span>
                        );
                      })()}
                    </div>

                    {(() => {
                      const rule = rules.find(r => r.payeeId === selectedPayeeId && r.sourceAccountId === selectedSourceAccountId);
                      if (!rule) return null;
                      return (
                        <>
                          <div className="flex justify-between text-slate-400">
                            <span>Auto-Approve Limit:</span>
                            <span className="text-slate-200 font-medium">
                              {formatCurrency(rule.autoApproveLimit, 'USD')}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Dual Approval Required:</span>
                            <span className="text-slate-200 font-medium">
                              {rule.requiresDualApproval ? 'Yes' : 'No'}
                            </span>
                          </div>
                          <div className="flex justify-between text-slate-400">
                            <span>Preferred Route:</span>
                            <span className={`font-semibold ${rule.preferredRoute ? 'text-indigo-400' : 'text-slate-500'}`}>
                              {rule.preferredRoute ? 'Yes (Optimized)' : 'No'}
                            </span>
                          </div>
                        </>
                      );
                    })()}
                  </div>
                )}
              </div>
            ) : (
              <div className="text-center py-12 text-slate-500">
                <Info className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                <p className="text-sm">Select a payee to begin route analysis.</p>
              </div>
            )}
          </div>

          {/* SIMULATION ENGINE CARD */}
          {selectedPayeeId && selectedSourceAccountId && (
            <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-5 backdrop-blur-md shadow-xl">
              <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                <TrendingUp className="w-4 h-4 text-indigo-400" />
                <span>Real-time Route Simulator</span>
              </h3>

              <div className="space-y-3">
                <div>
                  <label className="block text-xs text-slate-400 mb-1">Simulation Amount</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2 text-slate-500 text-sm font-mono">$</span>
                    <input
                      type="number"
                      value={simulationAmount}
                      onChange={(e) => setSimulationAmount(e.target.value)}
                      className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-7 pr-3 py-1.5 text-sm text-slate-200 font-mono focus:outline-none focus:ring-1 focus:ring-indigo-500"
                    />
                  </div>
                </div>

                {simulationResult && (
                  <div className={`p-3.5 rounded-xl border text-xs ${
                    simulationResult.allowed 
                      ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300' 
                      : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
                  }`}>
                    <div className="flex items-start gap-2">
                      {simulationResult.allowed ? (
                        <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                      ) : (
                        <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                      )}
                      <div>
                        <p className="font-semibold">
                          {simulationResult.allowed ? 'Simulation Passed' : 'Simulation Blocked'}
                        </p>
                        <p className="text-slate-400 mt-1 text-[11px] leading-relaxed">
                          {simulationResult.message}
                        </p>
                      </div>
                    </div>

                    {simulationResult.allowed && (
                      <div className="mt-3 pt-2.5 border-t border-emerald-500/20 flex flex-wrap gap-2 items-center justify-between text-[10px]">
                        <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                          Route: {simulationResult.routeType}
                        </span>
                        {simulationResult.requiresApproval ? (
                          <span className="bg-amber-500/10 text-amber-400 px-2 py-0.5 rounded border border-amber-500/20">
                            Requires Dual Approval
                          </span>
                        ) : (
                          <span className="bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded border border-emerald-500/20">
                            Auto-Approve Eligible
                          </span>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* LEGEND & HELP */}
          <div className="bg-slate-900/30 border border-slate-800/50 rounded-2xl p-4 text-xs text-slate-400 space-y-2">
            <h4 className="font-semibold text-slate-300 flex items-center gap-1.5">
              <HelpCircle className="w-3.5 h-3.5 text-indigo-400" />
              Matrix Guide
            </h4>
            <p className="text-[11px] leading-relaxed">
              Hover over any payee or source account to highlight its active relationships. Click to lock the selection and run compliance simulations.
            </p>
            <div className="flex flex-wrap gap-3 pt-1 text-[10px]">
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-indigo-500" /> Payee Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-emerald-500" /> Source Selected
              </span>
              <span className="flex items-center gap-1">
                <span className="w-2 h-2 rounded-full bg-amber-500" /> Pending Status
              </span>
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: SOURCE ACCOUNTS LIST */}
        <div className="lg:col-span-4 bg-slate-900/50 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-sm z-10">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              <h2 className="text-lg font-bold text-slate-200">Source Accounts</h2>
            </div>
            <span className="text-xs text-slate-500 font-medium">
              Showing {filteredSourceAccounts.length} of {sourceAccounts.length}
            </span>
          </div>

          {/* Search Input */}
          <div className="relative mb-4">
            <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
            <input
              type="text"
              placeholder="Search bank, account #..."
              value={sourceSearch}
              onChange={(e) => setSourceSearch(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/50 transition-all"
            />
          </div>

          {/* Source Accounts Scrollable Container */}
          <div className="space-y-3 max-h-[600px] overflow-y-auto pr-1 custom-scrollbar">
            {filteredSourceAccounts.length === 0 ? (
              <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                <AlertCircle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                <p className="text-sm text-slate-500">No source accounts match the criteria.</p>
              </div>
            ) : (
              filteredSourceAccounts.map(sa => {
                const isSelected = selectedSourceAccountId === sa.id;
                const isHovered = hoveredSourceAccountId === sa.id;
                const isLinkedToActivePayee = activePayeeId 
                  ? payees.find(p => p.id === activePayeeId)?.eligibleSourceAccountIds.includes(sa.id) 
                  : false;

                return (
                  <div
                    key={sa.id}
                    ref={el => { sourceRefs.current[sa.id] = el; }}
                    onMouseEnter={() => setHoveredSourceAccountId(sa.id)}
                    onMouseLeave={() => setHoveredSourceAccountId(null)}
                    onClick={() => setSelectedSourceAccountId(sa.id)}
                    className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer select-none ${
                      isSelected 
                        ? 'bg-emerald-950/30 border-emerald-500/80 shadow-lg shadow-emerald-950/20' 
                        : isHovered
                        ? 'bg-slate-800/40 border-slate-700/80'
                        : isLinkedToActivePayee
                        ? 'bg-indigo-950/10 border-indigo-500/40'
                        : 'bg-slate-900/30 border-slate-800/60'
                    }`}
                  >
                    {/* Active Indicator Bar */}
                    {isSelected && (
                      <div className="absolute right-0 top-3 bottom-3 w-1 bg-emerald-500 rounded-l-md" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h3 className="font-semibold text-slate-200 text-sm flex items-center gap-1.5">
                          {sa.name}
                        </h3>
                        <p className="text-xs text-slate-500 mt-0.5 flex items-center gap-1">
                          <Building2 className="w-3 h-3 text-slate-600" />
                          {sa.bankName}
                        </p>
                      </div>
                      
                      {/* Currency Badge */}
                      <span className="bg-slate-950 border border-slate-800 text-emerald-400 font-mono text-xs font-bold px-2 py-0.5 rounded-md">
                        {sa.currency}
                      </span>
                    </div>

                    {/* Balance Display */}
                    <div className="mt-3 flex items-baseline justify-between">
                      <span className="text-xs text-slate-500">Available Balance</span>
                      <span className="text-sm font-bold text-slate-100 font-mono">
                        {formatCurrency(sa.balance, sa.currency)}
                      </span>
                    </div>

                    {/* Meta Details */}
                    <div className="mt-3 pt-2.5 border-t border-slate-800/50 flex items-center justify-between text-[10px] text-slate-500">
                      <span className="bg-slate-950/60 px-2 py-0.5 rounded border border-slate-800/50">
                        {sa.type}
                      </span>
                      <span className="font-mono">{sa.accountNumber}</span>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>

      </div>

      {/* CUSTOM SCROLLBAR STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(15, 23, 42, 0.3);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(148, 163, 184, 0.1);
          border-radius: 8px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(148, 163, 184, 0.2);
        }
        @keyframes dash {
          to {
            stroke-dashoffset: -1000;
          }
        }
      `}</style>

    </div>
  );
}