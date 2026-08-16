import React, { useState, useMemo } from 'react';
import {
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ScatterChart,
  Scatter,
  ZAxis
} from 'recharts';
import {
  Search,
  Download,
  Filter,
  Calculator,
  Users,
  DollarSign,
  Percent,
  Calendar,
  TrendingUp,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  ArrowUpDown,
  Info,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface Customer {
  id: string;
  name: string;
  creditScore: number;
  existingDebt: number;
  balanceTransferred: number;
  currentApr: number;
  promoApr: number;
  promoDuration: number;
  promoFee: number;
  issuer: string;
  savings: number;
  state: string;
}

interface FilterState {
  search: string;
  minCreditScore: number;
  maxCreditScore: number;
  minDebt: number;
  maxDebt: number;
  issuers: string[];
  promoDuration: string;
}

// --- STATIC MOCK DATA GENERATION ---
const STATES = ['NY', 'CA', 'TX', 'FL', 'IL', 'PA', 'OH', 'GA', 'NC', 'MI'];
const ISSUERS = ['Chase', 'Citi', 'Amex', 'Discover', 'Capital One'];
const FIRST_NAMES = ['James', 'Mary', 'John', 'Patricia', 'Robert', 'Jennifer', 'Michael', 'Elizabeth', 'William', 'Linda', 'David', 'Barbara', 'Richard', 'Susan', 'Joseph', 'Jessica', 'Thomas', 'Sarah', 'Charles', 'Karen'];
const LAST_NAMES = ['Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin'];

const generateMockCustomers = (): Customer[] => {
  const customers: Customer[] = [];
  let seed = 1337; // Simple LCG for reproducible mock data
  const random = () => {
    const x = Math.sin(seed++) * 10000;
    return x - Math.floor(x);
  };

  for (let i = 1; i <= 120; i++) {
    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const creditScore = Math.floor(random() * (850 - 580) + 580);
    const existingDebt = Math.floor(random() * (25000 - 3000) + 3000);
    // Balance transferred is typically 60% to 95% of existing debt
    const balanceTransferred = Math.floor(existingDebt * (random() * (0.95 - 0.60) + 0.60));
    const currentApr = Math.round((random() * (29.99 - 16.99) + 16.99) * 100) / 100;
    const promoApr = random() > 0.8 ? 1.99 : 0.0; // 80% get 0% APR
    const promoDuration = [12, 15, 18, 21][Math.floor(random() * 4)];
    const promoFee = random() > 0.5 ? 3 : 5; // 3% or 5% transfer fee
    const issuer = ISSUERS[Math.floor(random() * ISSUERS.length)];
    const state = STATES[Math.floor(random() * STATES.length)];

    // Calculate estimated savings:
    // Interest saved over promo duration minus the transfer fee
    const monthlyCurrentRate = (currentApr / 100) / 12;
    const monthlyPromoRate = (promoApr / 100) / 12;
    
    // Simple interest approximation for comparison over the promo period
    let currentInterest = 0;
    let promoInterest = 0;
    let tempCurrentBalance = balanceTransferred;
    let tempPromoBalance = balanceTransferred;
    
    // Assume a standard payment of 3% of balance or $50 (whichever is higher) to simulate payoff
    for (let m = 0; m < promoDuration; m++) {
      const currentIntPayment = tempCurrentBalance * monthlyCurrentRate;
      currentInterest += currentIntPayment;
      const currentPay = Math.max(tempCurrentBalance * 0.03, 50);
      tempCurrentBalance = Math.max(0, tempCurrentBalance + currentIntPayment - currentPay);

      const promoIntPayment = tempPromoBalance * monthlyPromoRate;
      promoInterest += promoIntPayment;
      const promoPay = Math.max(tempPromoBalance * 0.03, 50);
      tempPromoBalance = Math.max(0, tempPromoBalance + promoIntPayment - promoPay);
    }

    const feeCost = balanceTransferred * (promoFee / 100);
    const savings = Math.round((currentInterest - promoInterest) - feeCost);

    customers.push({
      id: `CUST-${1000 + i}`,
      name: `${firstName} ${lastName}`,
      creditScore,
      existingDebt,
      balanceTransferred,
      currentApr,
      promoApr,
      promoDuration,
      promoFee,
      issuer,
      savings: savings > 0 ? savings : 0,
      state
    });
  }
  return customers;
};

const MOCK_CUSTOMERS = generateMockCustomers();

const COLORS = ['#4F46E5', '#06B6D4', '#10B981', '#F59E0B', '#EF4444', '#8B5CF6'];

export default function BalanceTransferAnalytics() {
  // --- STATE ---
  const [filters, setFilters] = useState<FilterState>({
    search: '',
    minCreditScore: 580,
    maxCreditScore: 850,
    minDebt: 3000,
    maxDebt: 25000,
    issuers: [],
    promoDuration: 'All'
  });

  const [sortField, setSortField] = useState<keyof Customer>('savings');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 8;

  // Calculator State
  const [calcBalance, setCalcBalance] = useState<number>(10000);
  const [calcCurrentApr, setCalcCurrentApr] = useState<number>(22.99);
  const [calcPromoApr, setCalcPromoApr] = useState<number>(0);
  const [calcPromoFee, setCalcPromoFee] = useState<number>(3);
  const [calcPromoDuration, setCalcPromoDuration] = useState<number>(15);
  const [calcMonthlyPayment, setCalcMonthlyPayment] = useState<number>(400);

  // --- FILTER LOGIC ---
  const filteredCustomers = useMemo(() => {
    return MOCK_CUSTOMERS.filter((cust) => {
      const matchesSearch = cust.name.toLowerCase().includes(filters.search.toLowerCase()) ||
                            cust.id.toLowerCase().includes(filters.search.toLowerCase()) ||
                            cust.state.toLowerCase().includes(filters.search.toLowerCase());
      const matchesCredit = cust.creditScore >= filters.minCreditScore && cust.creditScore <= filters.maxCreditScore;
      const matchesDebt = cust.existingDebt >= filters.minDebt && cust.existingDebt <= filters.maxDebt;
      const matchesIssuer = filters.issuers.length === 0 || filters.issuers.includes(cust.issuer);
      const matchesDuration = filters.promoDuration === 'All' || cust.promoDuration === parseInt(filters.promoDuration);

      return matchesSearch && matchesCredit && matchesDebt && matchesIssuer && matchesDuration;
    });
  }, [filters]);

  // --- SORT LOGIC ---
  const sortedCustomers = useMemo(() => {
    const sorted = [...filteredCustomers];
    sorted.sort((a, b) => {
      let aVal = a[sortField];
      let bVal = b[sortField];

      if (typeof aVal === 'string') {
        return sortOrder === 'asc' 
          ? (aVal as string).localeCompare(bVal as string)
          : (bVal as string).localeCompare(aVal as string);
      } else {
        return sortOrder === 'asc'
          ? (aVal as number) - (bVal as number)
          : (bVal as number) - (aVal as number);
      }
    });
    return sorted;
  }, [filteredCustomers, sortField, sortOrder]);

  // --- PAGINATION LOGIC ---
  const paginatedCustomers = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    return sortedCustomers.slice(startIndex, startIndex + itemsPerPage);
  }, [sortedCustomers, currentPage]);

  const totalPages = Math.ceil(sortedCustomers.length / itemsPerPage);

  // --- KPI CALCULATIONS ---
  const kpis = useMemo(() => {
    const totalCount = filteredCustomers.length;
    if (totalCount === 0) return { count: 0, avgCredit: 0, avgBalance: 0, totalSavings: 0, avgDuration: 0 };

    const sumCredit = filteredCustomers.reduce((acc, curr) => acc + curr.creditScore, 0);
    const sumBalance = filteredCustomers.reduce((acc, curr) => acc + curr.balanceTransferred, 0);
    const sumSavings = filteredCustomers.reduce((acc, curr) => acc + curr.savings, 0);
    const sumDuration = filteredCustomers.reduce((acc, curr) => acc + curr.promoDuration, 0);

    return {
      count: totalCount,
      avgCredit: Math.round(sumCredit / totalCount),
      avgBalance: Math.round(sumBalance / totalCount),
      totalSavings: sumSavings,
      avgDuration: Math.round((sumDuration / totalCount) * 10) / 10
    };
  }, [filteredCustomers]);

  // --- CHART DATA PREPARATION ---
  
  // 1. Pie Chart: Issuer Distribution
  const issuerData = useMemo(() => {
    const counts: { [key: string]: number } = {};
    filteredCustomers.forEach(c => {
      counts[c.issuer] = (counts[c.issuer] || 0) + 1;
    });
    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [filteredCustomers]);

  // 2. Bar Chart: Avg Savings by Credit Score Tier
  const savingsByTierData = useMemo(() => {
    const tiers = [
      { name: 'Excellent (720-850)', min: 720, max: 850, sum: 0, count: 0 },
      { name: 'Good (660-719)', min: 660, max: 719, sum: 0, count: 0 },
      { name: 'Fair (600-659)', min: 600, max: 659, sum: 0, count: 0 },
      { name: 'Poor (580-599)', min: 580, max: 599, sum: 0, count: 0 }
    ];

    filteredCustomers.forEach(c => {
      const tier = tiers.find(t => c.creditScore >= t.min && c.creditScore <= t.max);
      if (tier) {
        tier.sum += c.savings;
        tier.count += 1;
      }
    });

    return tiers.map(t => ({
      tier: t.name,
      avgSavings: t.count > 0 ? Math.round(t.sum / t.count) : 0,
      count: t.count
    }));
  }, [filteredCustomers]);

  // 3. Histogram: Balance Transferred Distribution
  const balanceDistributionData = useMemo(() => {
    const bins = [
      { range: '$0 - $5k', min: 0, max: 5000, count: 0 },
      { range: '$5k - $10k', min: 5001, max: 10000, count: 0 },
      { range: '$10k - $15k', min: 10001, max: 15000, count: 0 },
      { range: '$15k - $20k', min: 15001, max: 20000, count: 0 },
      { range: '$20k+', min: 20001, max: 999999, count: 0 }
    ];

    filteredCustomers.forEach(c => {
      const bin = bins.find(b => c.balanceTransferred >= b.min && c.balanceTransferred <= b.max);
      if (bin) bin.count += 1;
    });

    return bins;
  }, [filteredCustomers]);

  // 4. Scatter Plot: Credit Score vs Balance Transferred
  const scatterData = useMemo(() => {
    return filteredCustomers.map(c => ({
      creditScore: c.creditScore,
      balanceTransferred: c.balanceTransferred,
      savings: c.savings,
      name: c.name
    }));
  }, [filteredCustomers]);

  // --- CALCULATOR SIMULATION LOGIC ---
  const calcResults = useMemo(() => {
    const monthlyCurrentRate = (calcCurrentApr / 100) / 12;
    const monthlyPromoRate = (calcPromoApr / 100) / 12;
    const feeCost = calcBalance * (calcPromoFee / 100);

    // Scenario A: Keep on Current Card
    let currentBalance = calcBalance;
    let currentInterestPaid = 0;
    let currentMonths = 0;
    const maxMonths = 360; // 30 year cap to prevent infinite loops

    while (currentBalance > 0 && currentMonths < maxMonths) {
      const interest = currentBalance * monthlyCurrentRate;
      if (calcMonthlyPayment <= interest) {
        // Payment doesn't cover interest
        currentMonths = -1; // Infinite indicator
        break;
      }
      const payment = Math.min(calcMonthlyPayment, currentBalance + interest);
      currentInterestPaid += interest;
      currentBalance = currentBalance + interest - payment;
      currentMonths++;
    }

    // Scenario B: Transfer to New Card
    // The fee is typically added to the transferred balance
    let promoBalance = calcBalance + feeCost;
    let promoInterestPaid = 0;
    let promoMonths = 0;

    while (promoBalance > 0 && promoMonths < maxMonths) {
      const activeRate = promoMonths < calcPromoDuration ? monthlyPromoRate : monthlyCurrentRate;
      const interest = promoBalance * activeRate;
      if (calcMonthlyPayment <= interest) {
        promoMonths = -1;
        break;
      }
      const payment = Math.min(calcMonthlyPayment, promoBalance + interest);
      promoInterestPaid += interest;
      promoBalance = promoBalance + interest - payment;
      promoMonths++;
    }

    const totalCostCurrent = currentMonths === -1 ? Infinity : currentInterestPaid;
    const totalCostPromo = promoMonths === -1 ? Infinity : (promoInterestPaid + feeCost);
    const netSavings = (currentMonths === -1 || promoMonths === -1) ? 0 : (totalCostCurrent - totalCostPromo);

    return {
      currentMonths,
      currentInterestPaid: Math.round(currentInterestPaid),
      promoMonths,
      promoInterestPaid: Math.round(promoInterestPaid),
      feeCost: Math.round(feeCost),
      netSavings: Math.round(netSavings),
      isCurrentInfinite: currentMonths === -1,
      isPromoInfinite: promoMonths === -1
    };
  }, [calcBalance, calcCurrentApr, calcPromoApr, calcPromoFee, calcPromoDuration, calcMonthlyPayment]);

  // --- HANDLERS ---
  const handleSort = (field: keyof Customer) => {
    if (sortField === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortOrder('desc');
    }
    setCurrentPage(1);
  };

  const toggleIssuer = (issuer: string) => {
    setFilters(prev => {
      const exists = prev.issuers.includes(issuer);
      const newIssuers = exists 
        ? prev.issuers.filter(i => i !== issuer)
        : [...prev.issuers, issuer];
      return { ...prev, issuers: newIssuers };
    });
    setCurrentPage(1);
  };

  const resetFilters = () => {
    setFilters({
      search: '',
      minCreditScore: 580,
      maxCreditScore: 850,
      minDebt: 3000,
      maxDebt: 25000,
      issuers: [],
      promoDuration: 'All'
    });
    setCurrentPage(1);
  };

  const exportToCSV = () => {
    const headers = ['Customer ID', 'Name', 'Credit Score', 'Existing Debt', 'Balance Transferred', 'Current APR (%)', 'Promo APR (%)', 'Promo Duration (months)', 'Promo Fee (%)', 'Issuer', 'Estimated Savings ($)', 'State'];
    const rows = sortedCustomers.map(c => [
      c.id,
      c.name,
      c.creditScore,
      c.existingDebt,
      c.balanceTransferred,
      c.currentApr,
      c.promoApr,
      c.promoDuration,
      c.promoFee,
      c.issuer,
      c.savings,
      c.state
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(','), ...rows.map(e => e.join(','))].join('\n');
    
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `balance_transfer_analytics_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col lg:flex-row">
      
      {/* --- SIDEBAR FILTERS --- */}
      <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shrink-0">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-5 w-5 text-indigo-600" />
            <h2 className="text-lg font-semibold text-slate-900">Filters</h2>
          </div>
          <button 
            onClick={resetFilters}
            className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1 transition-colors"
          >
            <RefreshCw className="h-3 w-3" /> Reset All
          </button>
        </div>

        <hr className="border-slate-100" />

        {/* Search Input */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Search Customer</label>
          <div className="relative">
            <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search name, ID, state..."
              value={filters.search}
              onChange={(e) => { setFilters(prev => ({ ...prev, search: e.target.value })); setCurrentPage(1); }}
              className="w-full pl-9 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
            />
          </div>
        </div>

        {/* Credit Score Range */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Credit Score</label>
            <span className="text-xs font-medium text-indigo-600">{filters.minCreditScore} - {filters.maxCreditScore}</span>
          </div>
          <div className="flex gap-2">
            <input
              type="range"
              min="580"
              max="850"
              value={filters.minCreditScore}
              onChange={(e) => { setFilters(prev => ({ ...prev, minCreditScore: parseInt(e.target.value) })); setCurrentPage(1); }}
              className="w-full accent-indigo-600"
            />
            <input
              type="range"
              min="580"
              max="850"
              value={filters.maxCreditScore}
              onChange={(e) => { setFilters(prev => ({ ...prev, maxCreditScore: parseInt(e.target.value) })); setCurrentPage(1); }}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* Existing Debt Range */}
        <div className="flex flex-col gap-2">
          <div className="flex justify-between items-center">
            <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Existing Debt</label>
            <span className="text-xs font-medium text-indigo-600">
              ${filters.minDebt.toLocaleString()} - ${filters.maxDebt.toLocaleString()}
            </span>
          </div>
          <div className="flex gap-2">
            <input
              type="range"
              min="3000"
              max="25000"
              step="500"
              value={filters.minDebt}
              onChange={(e) => { setFilters(prev => ({ ...prev, minDebt: parseInt(e.target.value) })); setCurrentPage(1); }}
              className="w-full accent-indigo-600"
            />
            <input
              type="range"
              min="3000"
              max="25000"
              step="500"
              value={filters.maxDebt}
              onChange={(e) => { setFilters(prev => ({ ...prev, maxDebt: parseInt(e.target.value) })); setCurrentPage(1); }}
              className="w-full accent-indigo-600"
            />
          </div>
        </div>

        {/* Card Issuers */}
        <div className="flex flex-col gap-2">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Card Issuers</label>
          <div className="flex flex-wrap gap-2">
            {ISSUERS.map((issuer) => {
              const isSelected = filters.issuers.includes(issuer);
              return (
                <button
                  key={issuer}
                  onClick={() => toggleIssuer(issuer)}
                  className={`px-3 py-1.5 rounded-full text-xs font-medium border transition-all ${
                    isSelected 
                      ? 'bg-indigo-50 border-indigo-300 text-indigo-700 shadow-sm' 
                      : 'bg-white border-slate-200 text-slate-600 hover:bg-slate-50'
                  }`}
                >
                  {issuer}
                </button>
              );
            })}
          </div>
        </div>

        {/* Promo Duration */}
        <div className="flex flex-col gap-1.5">
          <label className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Promo Duration</label>
          <select
            value={filters.promoDuration}
            onChange={(e) => { setFilters(prev => ({ ...prev, promoDuration: e.target.value })); setCurrentPage(1); }}
            className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
          >
            <option value="All">All Durations</option>
            <option value="12">12 Months</option>
            <option value="15">15 Months</option>
            <option value="18">18 Months</option>
            <option value="21">21 Months</option>
          </select>
        </div>

        <div className="mt-auto pt-6 border-t border-slate-100 hidden lg:block">
          <div className="bg-slate-50 rounded-xl p-4 border border-slate-100">
            <div className="flex gap-2 items-start">
              <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
              <p className="text-xs text-slate-500 leading-relaxed">
                This dashboard visualizes simulated customer balance transfer data. Adjust filters to analyze specific segments and credit tiers.
              </p>
            </div>
          </div>
        </div>
      </aside>

      {/* --- MAIN CONTENT AREA --- */}
      <main className="flex-1 p-6 lg:p-8 overflow-y-auto max-w-7xl mx-auto w-full space-y-8">
        
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl lg:text-3xl font-bold text-slate-900 tracking-tight">Balance Transfer Analytics</h1>
            <p className="text-sm text-slate-500 mt-1">Monitor customer savings, portfolio distribution, and simulate transfer scenarios.</p>
          </div>
          <button
            onClick={exportToCSV}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-medium rounded-lg shadow-sm transition-colors"
          >
            <Download className="h-4 w-4" /> Export Filtered Data (CSV)
          </button>
        </div>

        {/* --- KPI CARDS --- */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          
          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-indigo-50 rounded-lg text-indigo-600">
              <Users className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Customers</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{kpis.count}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-emerald-50 rounded-lg text-emerald-600">
              <TrendingUp className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Credit Score</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{kpis.avgCredit}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-cyan-50 rounded-lg text-cyan-600">
              <DollarSign className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Transferred</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">${kpis.avgBalance.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-amber-50 rounded-lg text-amber-600">
              <Percent className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Est. Savings</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">${kpis.totalSavings.toLocaleString()}</h3>
            </div>
          </div>

          <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex items-center gap-4">
            <div className="p-3 bg-purple-50 rounded-lg text-purple-600">
              <Calendar className="h-6 w-6" />
            </div>
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Avg Promo Term</p>
              <h3 className="text-xl font-bold text-slate-900 mt-0.5">{kpis.avgDuration} mo</h3>
            </div>
          </div>

        </div>

        {/* --- VISUALIZATIONS GRID --- */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          
          {/* Chart 1: Avg Savings by Credit Score Tier */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Average Savings by Credit Score Tier</h3>
              <p className="text-xs text-slate-500">How much customers save on average based on credit health.</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={savingsByTierData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="tier" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} tickFormatter={(v) => `$${v}`} />
                  <Tooltip 
                    formatter={(value: any) => [`$${value.toLocaleString()}`, 'Avg Savings']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF' }}
                  />
                  <Bar dataKey="avgSavings" fill="#4F46E5" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 2: Issuer Distribution */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Card Issuer Distribution</h3>
              <p className="text-xs text-slate-500">Breakdown of original card issuers for transferred balances.</p>
            </div>
            <div className="h-72 w-full flex flex-col sm:flex-row items-center justify-center gap-4">
              <div className="h-full w-full sm:w-1/2">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={issuerData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {issuerData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [value, 'Customers']}
                      contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="flex flex-col gap-2 w-full sm:w-1/2">
                {issuerData.map((entry, index) => (
                  <div key={entry.name} className="flex items-center justify-between text-sm">
                    <div className="flex items-center gap-2">
                      <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[index % COLORS.length] }} />
                      <span className="text-slate-600 font-medium">{entry.name}</span>
                    </div>
                    <span className="text-slate-900 font-semibold">{entry.value} ({Math.round((entry.value / kpis.count) * 100 || 0)}%)</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Chart 3: Balance Transferred Distribution */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Balance Transferred Distribution</h3>
              <p className="text-xs text-slate-500">Frequency of balance transfer amounts across the portfolio.</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={balanceDistributionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#F1F5F9" />
                  <XAxis dataKey="range" tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <YAxis tick={{ fill: '#64748B', fontSize: 11 }} axisLine={false} tickLine={false} />
                  <Tooltip 
                    formatter={(value: any) => [value, 'Customers']}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF' }}
                  />
                  <Bar dataKey="count" fill="#06B6D4" radius={[4, 4, 0, 0]} maxBarSize={50} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>

          {/* Chart 4: Credit Score vs Balance Transferred */}
          <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-sm flex flex-col">
            <div className="mb-4">
              <h3 className="text-base font-semibold text-slate-900">Credit Score vs. Balance Transferred</h3>
              <p className="text-xs text-slate-500">Scatter analysis mapping credit scores against transfer sizes.</p>
            </div>
            <div className="h-72 w-full">
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#F1F5F9" />
                  <XAxis 
                    type="number" 
                    dataKey="creditScore" 
                    name="Credit Score" 
                    domain={[550, 850]} 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <YAxis 
                    type="number" 
                    dataKey="balanceTransferred" 
                    name="Balance Transferred" 
                    unit="$" 
                    tick={{ fill: '#64748B', fontSize: 11 }}
                    axisLine={false}
                    tickLine={false}
                  />
                  <ZAxis type="number" dataKey="savings" range={[40, 400]} name="Savings" unit="$" />
                  <Tooltip 
                    cursor={{ strokeDasharray: '3 3' }}
                    contentStyle={{ backgroundColor: '#1E293B', borderRadius: '8px', border: 'none', color: '#FFF' }}
                    formatter={(value: any, name: any) => {
                      if (name === 'Balance Transferred' || name === 'Savings') return [`$${value.toLocaleString()}`, name];
                      return [value, name];
                    }}
                  />
                  <Scatter name="Customers" data={scatterData} fill="#10B981" fillOpacity={0.7} />
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

        </div>

        {/* --- CUSTOMER EXPLORER TABLE --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h3 className="text-base font-semibold text-slate-900">Customer Explorer</h3>
              <p className="text-xs text-slate-500">Detailed list of customers matching current filter criteria.</p>
            </div>
            <div className="text-xs text-slate-500 font-medium">
              Showing {Math.min(sortedCustomers.length, (currentPage - 1) * itemsPerPage + 1)}-
              {Math.min(sortedCustomers.length, currentPage * itemsPerPage)} of {sortedCustomers.length} customers
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-slate-50 border-b border-slate-100 text-xs font-semibold text-slate-500 uppercase tracking-wider">
                  <th className="py-3.5 px-6">
                    <button onClick={() => handleSort('id')} className="flex items-center gap-1 hover:text-slate-800">
                      ID <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-6">
                    <button onClick={() => handleSort('name')} className="flex items-center gap-1 hover:text-slate-800">
                      Name <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-6">
                    <button onClick={() => handleSort('creditScore')} className="flex items-center gap-1 hover:text-slate-800">
                      Credit Score <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-6">
                    <button onClick={() => handleSort('balanceTransferred')} className="flex items-center gap-1 hover:text-slate-800">
                      Transferred <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-6">
                    <button onClick={() => handleSort('currentApr')} className="flex items-center gap-1 hover:text-slate-800">
                      Current APR <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-6">Promo Offer</th>
                  <th className="py-3.5 px-6">
                    <button onClick={() => handleSort('issuer')} className="flex items-center gap-1 hover:text-slate-800">
                      Issuer <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                  <th className="py-3.5 px-6 text-right">
                    <button onClick={() => handleSort('savings')} className="flex items-center gap-1 hover:text-slate-800 ml-auto">
                      Est. Savings <ArrowUpDown className="h-3 w-3" />
                    </button>
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-sm text-slate-600">
                {paginatedCustomers.length > 0 ? (
                  paginatedCustomers.map((cust) => (
                    <tr key={cust.id} className="hover:bg-slate-50/80 transition-colors">
                      <td className="py-3.5 px-6 font-mono text-xs text-slate-500">{cust.id}</td>
                      <td className="py-3.5 px-6 font-medium text-slate-900">
                        {cust.name} <span className="text-xs text-slate-400 font-normal">({cust.state})</span>
                      </td>
                      <td className="py-3.5 px-6">
                        <span className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-semibold ${
                          cust.creditScore >= 720 ? 'bg-emerald-50 text-emerald-700' :
                          cust.creditScore >= 660 ? 'bg-blue-50 text-blue-700' :
                          cust.creditScore >= 600 ? 'bg-amber-50 text-amber-700' : 'bg-rose-50 text-rose-700'
                        }`}>
                          {cust.creditScore}
                        </span>
                      </td>
                      <td className="py-3.5 px-6 font-medium text-slate-900">${cust.balanceTransferred.toLocaleString()}</td>
                      <td className="py-3.5 px-6">{cust.currentApr}%</td>
                      <td className="py-3.5 px-6 text-xs">
                        <div className="font-medium text-slate-800">{cust.promoApr}% APR for {cust.promoDuration} mo</div>
                        <div className="text-slate-400">{cust.promoFee}% fee</div>
                      </td>
                      <td className="py-3.5 px-6">{cust.issuer}</td>
                      <td className="py-3.5 px-6 text-right font-semibold text-emerald-600">${cust.savings.toLocaleString()}</td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan={8} className="py-8 text-center text-slate-400">
                      No customers match the selected filters.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="p-4 border-t border-slate-100 flex items-center justify-between bg-slate-50/50">
              <button
                onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                disabled={currentPage === 1}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                <ChevronLeft className="h-3.5 w-3.5" /> Previous
              </button>
              <span className="text-xs text-slate-500 font-medium">
                Page {currentPage} of {totalPages}
              </span>
              <button
                onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                disabled={currentPage === totalPages}
                className="inline-flex items-center gap-1 px-3 py-1.5 border border-slate-200 rounded-lg text-xs font-medium bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 disabled:pointer-events-none transition-colors"
              >
                Next <ChevronRight className="h-3.5 w-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* --- INTERACTIVE BALANCE TRANSFER CALCULATOR --- */}
        <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="p-6 border-b border-slate-100 flex items-center gap-2">
            <Calculator className="h-5 w-5 text-indigo-600" />
            <div>
              <h3 className="text-base font-semibold text-slate-900">Interactive Balance Transfer Calculator</h3>
              <p className="text-xs text-slate-500">Simulate custom scenarios to compare payoff timelines and interest savings.</p>
            </div>
          </div>

          <div className="p-6 grid grid-cols-1 lg:grid-cols-12 gap-8">
            
            {/* Inputs (Left) */}
            <div className="lg:col-span-5 space-y-4">
              <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2">Scenario Inputs</h4>
              
              <div className="grid grid-cols-2 gap-4">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">Current Balance ($)</label>
                  <input
                    type="number"
                    value={calcBalance}
                    onChange={(e) => setCalcBalance(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">Current APR (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcCurrentApr}
                    onChange={(e) => setCalcCurrentApr(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">Promo APR (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={calcPromoApr}
                    onChange={(e) => setCalcPromoApr(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">Promo Fee (%)</label>
                  <input
                    type="number"
                    value={calcPromoFee}
                    onChange={(e) => setCalcPromoFee(Math.max(0, parseFloat(e.target.value) || 0))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  />
                </div>
                <div className="flex flex-col gap-1.5">
                  <label className="text-xs font-medium text-slate-500">Duration (mo)</label>
                  <select
                    value={calcPromoDuration}
                    onChange={(e) => setCalcPromoDuration(parseInt(e.target.value))}
                    className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                  >
                    <option value="12">12 mo</option>
                    <option value="15">15 mo</option>
                    <option value="18">18 mo</option>
                    <option value="21">21 mo</option>
                  </select>
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-xs font-medium text-slate-500">Target Monthly Payment ($)</label>
                <input
                  type="number"
                  value={calcMonthlyPayment}
                  onChange={(e) => setCalcMonthlyPayment(Math.max(0, parseFloat(e.target.value) || 0))}
                  className="w-full px-3 py-2 text-sm bg-slate-50 border border-slate-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:bg-white transition-all"
                />
                <p className="text-[11px] text-slate-400">Higher payments accelerate payoff and maximize savings.</p>
              </div>
            </div>

            {/* Results (Right) */}
            <div className="lg:col-span-7 flex flex-col justify-between gap-6">
              <div>
                <h4 className="text-sm font-semibold text-slate-900 uppercase tracking-wider border-b border-slate-100 pb-2 mb-4">Comparison Analysis</h4>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  
                  {/* Current Card Card */}
                  <div className="p-4 rounded-xl border border-slate-200 bg-slate-50/50">
                    <h5 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Keep Current Card</h5>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Payoff Time:</span>
                        <span className="font-semibold text-slate-900">
                          {calcResults.isCurrentInfinite ? 'Never (increase payment)' : `${calcResults.currentMonths} months`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Total Interest:</span>
                        <span className="font-semibold text-slate-900">
                          {calcResults.isCurrentInfinite ? 'N/A' : `$${calcResults.currentInterestPaid.toLocaleString()}`}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Transfer Card Card */}
                  <div className="p-4 rounded-xl border border-indigo-100 bg-indigo-50/30">
                    <h5 className="text-xs font-bold text-indigo-600 uppercase tracking-wider">Transfer to New Card</h5>
                    <div className="mt-3 space-y-2">
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Payoff Time:</span>
                        <span className="font-semibold text-slate-900">
                          {calcResults.isPromoInfinite ? 'Never' : `${calcResults.promoMonths} months`}
                        </span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Upfront Fee ({calcPromoFee}%):</span>
                        <span className="font-semibold text-slate-900">${calcResults.feeCost.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between text-sm">
                        <span className="text-slate-500">Promo Interest:</span>
                        <span className="font-semibold text-slate-900">${calcResults.promoInterestPaid.toLocaleString()}</span>
                      </div>
                    </div>
                  </div>

                </div>
              </div>

              {/* Net Savings Banner */}
              <div className={`p-4 rounded-xl flex items-center gap-4 border ${
                calcResults.netSavings > 0 
                  ? 'bg-emerald-50 border-emerald-100 text-emerald-800' 
                  : 'bg-amber-50 border-amber-100 text-amber-800'
              }`}>
                {calcResults.netSavings > 0 ? (
                  <CheckCircle className="h-8 w-8 text-emerald-600 shrink-0" />
                ) : (
                  <AlertCircle className="h-8 w-8 text-amber-600 shrink-0" />
                )}
                <div>
                  <h4 className="text-sm font-bold">
                    {calcResults.netSavings > 0 
                      ? `Estimated Net Savings: $${calcResults.netSavings.toLocaleString()}` 
                      : 'No Savings Detected'}
                  </h4>
                  <p className="text-xs opacity-90 mt-0.5">
                    {calcResults.netSavings > 0 
                      ? `By transferring, you pay off the balance faster and save on high interest charges, even after the upfront transfer fee.`
                      : 'Adjust the monthly payment or APR inputs. If the payment is too low, the balance may not be paid off before the promo ends.'}
                  </p>
                </div>
              </div>

            </div>

          </div>
        </div>

      </main>
    </div>
  );
}