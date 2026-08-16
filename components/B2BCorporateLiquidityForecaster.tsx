import React, { useState, useMemo } from 'react';
import {
  LayoutDashboard,
  TrendingUp,
  ShieldAlert,
  BellRing,
  DollarSign,
  TrendingDown,
  Plus,
  Trash2,
  CheckCircle,
  AlertTriangle,
  RefreshCw,
  Sliders,
  Download,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
  Calendar,
  Briefcase,
  Globe,
  Info,
  Check
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine
} from 'recharts';

// --- TYPES & INTERFACES ---
interface CashFlowMonth {
  month: string;
  baseInflow: number;
  baseOutflow: number;
}

interface DynamicForecastMonth {
  month: string;
  inflow: number;
  outflow: number;
  netFlow: number;
  endingCash: number;
  baseEndingCash: number;
}

interface Scenario {
  id: string;
  name: string;
  description: string;
  revenueModifier: number; // multiplier, e.g. 0.7 for -30%
  opexModifier: number;    // multiplier, e.g. 1.15 for +15%
  arDelayDays: number;     // days of delay
  apDelayDays: number;     // days of delay
  color: string;
}

interface ActionItem {
  id: string;
  title: string;
  description: string;
  impactType: 'inflow' | 'outflow' | 'deferral';
  impactValue: number;
  monthTrigger: number; // 1-indexed month
  costOfCapital: number; // percentage
  active: boolean;
  category: 'Financing' | 'Operations' | 'Working Capital';
}

interface SubsidiaryBalance {
  name: string;
  currency: string;
  balanceUSD: number;
  localBalance: number;
  status: 'Optimal' | 'Surplus' | 'Deficit';
}

// --- CONSTANTS & INITIAL DATA ---
const CURRENCIES = [
  { code: 'USD', symbol: '$', rate: 1.0 },
  { code: 'EUR', symbol: '€', rate: 0.92 },
  { code: 'GBP', symbol: '£', rate: 0.79 },
  { code: 'SGD', symbol: 'S$', rate: 1.34 }
];

const INITIAL_SUBSIDIARIES: SubsidiaryBalance[] = [
  { name: 'US Corporate HQ', currency: 'USD', balanceUSD: 8500000, localBalance: 8500000, status: 'Optimal' },
  { name: 'Europe Logistics Ltd', currency: 'EUR', balanceUSD: 3800000, localBalance: 3496000, status: 'Surplus' },
  { name: 'APAC Manufacturing Inc', currency: 'SGD', balanceUSD: 2100000, localBalance: 2814000, status: 'Optimal' },
  { name: 'UK Sales Corp', currency: 'GBP', balanceUSD: 900000, localBalance: 711000, status: 'Deficit' },
  { name: 'LATAM Operations', currency: 'USD', balanceUSD: 700000, localBalance: 700000, status: 'Deficit' }
];

const BASE_CASH_FLOWS: CashFlowMonth[] = [
  { month: 'Jan', baseInflow: 4200000, baseOutflow: 3800000 },
  { month: 'Feb', baseInflow: 4500000, baseOutflow: 3900000 },
  { month: 'Mar', baseInflow: 4800000, baseOutflow: 4100000 },
  { month: 'Apr', baseInflow: 4400000, baseOutflow: 4000000 },
  { month: 'May', baseInflow: 4600000, baseOutflow: 4200000 },
  { month: 'Jun', baseInflow: 5000000, baseOutflow: 4500000 },
  { month: 'Jul', baseInflow: 5200000, baseOutflow: 4600000 },
  { month: 'Aug', baseInflow: 4900000, baseOutflow: 4400000 },
  { month: 'Sep', baseInflow: 5100000, baseOutflow: 4500000 },
  { month: 'Oct', baseInflow: 5300000, baseOutflow: 4700000 },
  { month: 'Nov', baseInflow: 5500000, baseOutflow: 4800000 },
  { month: 'Dec', baseInflow: 5800000, baseOutflow: 5000000 }
];

const SCENARIOS: Scenario[] = [
  {
    id: 'base',
    name: 'Base Case',
    description: 'Standard operating plan with projected organic growth.',
    revenueModifier: 1.0,
    opexModifier: 1.0,
    arDelayDays: 0,
    apDelayDays: 0,
    color: '#6366f1' // Indigo
  },
  {
    id: 'recession',
    name: 'Severe Recession',
    description: '30% drop in customer demand, delayed collections (+20 days AR).',
    revenueModifier: 0.7,
    opexModifier: 1.05,
    arDelayDays: 20,
    apDelayDays: 5,
    color: '#f43f5e' // Rose
  },
  {
    id: 'supply_chain',
    name: 'Supply Chain Shock',
    description: '20% spike in operating costs, delayed supplier payments (+15 days AP).',
    revenueModifier: 0.95,
    opexModifier: 1.2,
    arDelayDays: 5,
    apDelayDays: 15,
    color: '#f59e0b' // Amber
  },
  {
    id: 'expansion',
    name: 'Rapid Expansion',
    description: '25% surge in sales, requiring 10% additional operational spend.',
    revenueModifier: 1.25,
    opexModifier: 1.1,
    arDelayDays: -5,
    apDelayDays: 0,
    color: '#10b981' // Emerald
  }
];

const INITIAL_ACTIONS: ActionItem[] = [
  {
    id: 'revolver',
    title: 'Draw Revolving Credit Line',
    description: 'Inject $3.0M liquidity immediately. Cost of capital: 6.5% APR.',
    impactType: 'inflow',
    impactValue: 3000000,
    monthTrigger: 2,
    costOfCapital: 6.5,
    active: false,
    category: 'Financing'
  },
  {
    id: 'ar_factoring',
    title: 'Factor Outstanding AR',
    description: 'Sell $1.5M of high-quality receivables at a 3% discount fee.',
    impactType: 'inflow',
    impactValue: 1455000,
    monthTrigger: 1,
    costOfCapital: 3.0,
    active: false,
    category: 'Working Capital'
  },
  {
    id: 'capex_deferral',
    title: 'Defer Q3 Warehouse Expansion',
    description: 'Postpone non-essential capital expenditure, saving $2.0M in Month 6.',
    impactType: 'deferral',
    impactValue: 2000000,
    monthTrigger: 6,
    costOfCapital: 0,
    active: false,
    category: 'Operations'
  },
  {
    id: 'supplier_renegotiation',
    title: 'Extend Supplier Payment Terms',
    description: 'Negotiate Net-60 terms with key vendors, shifting $800k outflows out by 1 month.',
    impactType: 'outflow',
    impactValue: -800000,
    monthTrigger: 3,
    costOfCapital: 1.5,
    active: false,
    category: 'Working Capital'
  }
];

export default function B2BCorporateLiquidityForecaster() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'dashboard' | 'forecaster' | 'scenarios' | 'alerts'>('dashboard');
  const [selectedCurrency, setSelectedCurrency] = useState(CURRENCIES[0]);
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('base');
  
  // Forecaster Controls
  const [growthRate, setGrowthRate] = useState<number>(5); // % MoM growth adjustment
  const [arDelay, setArDelay] = useState<number>(0); // days
  const [apDelay, setApDelay] = useState<number>(0); // days
  
  // Stress Test Custom Controls
  const [customRevenueDrop, setCustomRevenueDrop] = useState<number>(0); // %
  const [customOpexSpike, setCustomOpexSpike] = useState<number>(0); // %
  
  // Actions State
  const [actions, setActions] = useState<ActionItem[]>(INITIAL_ACTIONS);
  
  // Alerts State (Simulated dismissals)
  const [dismissedAlerts, setDismissedAlerts] = useState<string[]>([]);

  // --- HELPER FUNCTIONS ---
  const formatCurrency = (value: number) => {
    const converted = value * selectedCurrency.rate;
    if (Math.abs(converted) >= 1_000_000) {
      return `${selectedCurrency.symbol}${(converted / 1_000_000).toFixed(2)}M`;
    } else if (Math.abs(converted) >= 1_000) {
      return `${selectedCurrency.symbol}${(converted / 1_000).toFixed(0)}k`;
    }
    return `${selectedCurrency.symbol}${converted.toFixed(0)}`;
  };

  const formatFullCurrency = (value: number) => {
    const converted = value * selectedCurrency.rate;
    return `${selectedCurrency.symbol}${converted.toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
  };

  // --- CORE CALCULATION ENGINE ---
  const forecastData = useMemo(() => {
    const selectedScenario = SCENARIOS.find(s => s.id === selectedScenarioId) || SCENARIOS[0];
    
    // Base starting cash across all subsidiaries
    let currentCash = INITIAL_SUBSIDIARIES.reduce((sum, sub) => sum + sub.balanceUSD, 0);
    let baseCurrentCash = currentCash;
    
    const results: DynamicForecastMonth[] = [];
    
    // Temporary array to track shifted cash flows due to AR/AP delays
    const arDeferredInflows = new Array(12).fill(0);
    const apDeferredOutflows = new Array(12).fill(0);

    BASE_CASH_FLOWS.forEach((item, index) => {
      // 1. Apply Scenario Modifiers
      let inflow = item.baseInflow * selectedScenario.revenueModifier;
      let outflow = item.baseOutflow * selectedScenario.opexModifier;

      // 2. Apply Custom Stress Controls (only if custom scenario or added on top)
      if (selectedScenarioId === 'base') {
        inflow *= (1 - customRevenueDrop / 100);
        outflow *= (1 + customOpexSpike / 100);
      }

      // 3. Apply Interactive Forecaster Sliders (Growth Rate)
      const growthMultiplier = 1 + (growthRate / 100) * (index / 11);
      inflow *= growthMultiplier;

      // 4. Apply AR / AP Delay Logic
      // AR Delay: shifts a portion of inflow to the next month
      const totalArDelayDays = arDelay + selectedScenario.arDelayDays;
      if (totalArDelayDays > 0) {
        const shiftRatio = Math.min(totalArDelayDays / 30, 0.8); // Max 80% shift
        const shiftedAmount = inflow * shiftRatio;
        inflow -= shiftedAmount;
        if (index + 1 < 12) {
          arDeferredInflows[index + 1] += shiftedAmount;
        }
      }
      // Add previously deferred AR
      inflow += arDeferredInflows[index];

      // AP Delay: shifts a portion of outflow to the next month
      const totalApDelayDays = apDelay + selectedScenario.apDelayDays;
      if (totalApDelayDays > 0) {
        const shiftRatio = Math.min(totalApDelayDays / 30, 0.8);
        const shiftedAmount = outflow * shiftRatio;
        outflow -= shiftedAmount;
        if (index + 1 < 12) {
          apDeferredOutflows[index + 1] += shiftedAmount;
        }
      }
      // Add previously deferred AP
      outflow += apDeferredOutflows[index];

      // 5. Apply Executed Action Items
      actions.forEach(action => {
        if (action.active && action.monthTrigger === index + 1) {
          if (action.impactType === 'inflow') {
            inflow += action.impactValue;
          } else if (action.impactType === 'outflow') {
            outflow += action.impactValue; // negative value reduces outflow
          } else if (action.impactType === 'deferral') {
            outflow -= action.impactValue; // deferral reduces outflow in trigger month
          }
        }
        
        // Apply ongoing costs of actions (e.g., interest on revolver)
        if (action.active && action.id === 'revolver' && index + 1 > action.monthTrigger) {
          const monthlyInterest = (action.impactValue * (action.costOfCapital / 100)) / 12;
          outflow += monthlyInterest;
        }
      });

      // 6. Calculate Net & Ending Balances
      const netFlow = inflow - outflow;
      currentCash += netFlow;

      // Calculate Base Ending Cash (without actions or custom stress, for comparison)
      const baseNetFlow = item.baseInflow - item.baseOutflow;
      baseCurrentCash += baseNetFlow;

      results.push({
        month: item.month,
        inflow: Math.round(inflow),
        outflow: Math.round(outflow),
        netFlow: Math.round(netFlow),
        endingCash: Math.round(currentCash),
        baseEndingCash: Math.round(baseCurrentCash)
      });
    });

    return results;
  }, [selectedScenarioId, growthRate, arDelay, apDelay, customRevenueDrop, customOpexSpike, actions]);

  // --- DERIVED METRICS ---
  const totalCurrentLiquidity = useMemo(() => {
    return INITIAL_SUBSIDIARIES.reduce((sum, sub) => sum + sub.balanceUSD, 0);
  }, []);

  const endingLiquidity = useMemo(() => {
    if (forecastData.length === 0) return 0;
    return forecastData[forecastData.length - 1].endingCash;
  }, [forecastData]);

  const netLiquidityChange = endingLiquidity - totalCurrentLiquidity;

  const averageMonthlyInflow = useMemo(() => {
    return forecastData.reduce((sum, m) => sum + m.inflow, 0) / forecastData.length;
  }, [forecastData]);

  const averageMonthlyOutflow = useMemo(() => {
    return forecastData.reduce((sum, m) => sum + m.outflow, 0) / forecastData.length;
  }, [forecastData]);

  const runwayMonths = useMemo(() => {
    if (averageMonthlyOutflow === 0) return 999;
    const runway = endingLiquidity / averageMonthlyOutflow;
    return runway > 24 ? '24+' : runway.toFixed(1);
  }, [endingLiquidity, averageMonthlyOutflow]);

  const minimumCashPoint = useMemo(() => {
    return Math.min(...forecastData.map(m => m.endingCash));
  }, [forecastData]);

  const isBreachPredicted = minimumCashPoint < 5000000; // $5M is the corporate minimum reserve threshold

  // --- ALERTS GENERATOR ---
  const generatedAlerts = useMemo(() => {
    const alertsList = [];

    if (isBreachPredicted) {
      const breachMonth = forecastData.find(m => m.endingCash < 5000000);
      alertsList.push({
        id: 'breach_warning',
        severity: 'critical' as const,
        title: 'Liquidity Reserve Breach Predicted',
        message: `Ending cash is projected to drop below the $5.0M minimum reserve threshold in ${breachMonth?.month || 'future months'}. Current minimum point: ${formatCurrency(minimumCashPoint)}.`,
        actionRequired: 'Activate credit lines or defer planned CapEx immediately.'
      });
    }

    const highArDelay = arDelay + (SCENARIOS.find(s => s.id === selectedScenarioId)?.arDelayDays || 0);
    if (highArDelay >= 15) {
      alertsList.push({
        id: 'ar_delay_warning',
        severity: 'warning' as const,
        title: 'Significant AR Collection Delay',
        message: `Average collection delay is currently at ${highArDelay} days. This is locking up approximately ${formatCurrency(averageMonthlyInflow * (highArDelay / 30) * 0.4)} in working capital.`,
        actionRequired: 'Consider AR factoring or offering early payment discounts.'
      });
    }

    const activeFinancingCount = actions.filter(a => a.active && a.category === 'Financing').length;
    if (activeFinancingCount > 1) {
      alertsList.push({
        id: 'leverage_warning',
        severity: 'info' as const,
        title: 'Increased Leverage & Capital Cost',
        message: 'Multiple financing actions are active. This will increase your interest expense and impact long-term net margins.',
        actionRequired: 'Review cost of capital vs operational ROI.'
      });
    }

    // Subsidiary specific alert simulation
    alertsList.push({
      id: 'subsidiary_deficit',
      severity: 'warning' as const,
      title: 'Subsidiary Funding Deficit',
      message: 'UK Sales Corp and LATAM Operations are currently operating below their local liquidity buffers.',
      actionRequired: 'Initiate intercompany liquidity sweep or localized credit draw.'
    });

    return alertsList.filter(alert => !dismissedAlerts.includes(alert.id));
  }, [isBreachPredicted, minimumCashPoint, arDelay, selectedScenarioId, actions, dismissedAlerts, averageMonthlyInflow]);

  // --- HANDLERS ---
  const toggleAction = (id: string) => {
    setActions(prev => prev.map(act => act.id === id ? { ...act, active: !act.active } : act));
  };

  const resetForecaster = () => {
    setGrowthRate(5);
    setArDelay(0);
    setApDelay(0);
    setCustomRevenueDrop(0);
    setCustomOpexSpike(0);
    setSelectedScenarioId('base');
    setActions(INITIAL_ACTIONS);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans flex flex-col">
      
      {/* --- HEADER --- */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-indigo-600 rounded-lg text-white">
              <Layers className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white">B2B Corporate Liquidity Forecaster</h1>
              <p className="text-xs text-slate-400">Enterprise-grade multi-scenario cash flow modeling & stress testing</p>
            </div>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
          {/* Currency Selector */}
          <div className="flex items-center bg-slate-800 rounded-lg p-1 border border-slate-700 text-xs">
            <span className="px-2 text-slate-400 flex items-center gap-1">
              <Globe className="h-3.5 w-3.5" /> Currency:
            </span>
            {CURRENCIES.map(curr => (
              <button
                key={curr.code}
                onClick={() => setSelectedCurrency(curr)}
                className={`px-2.5 py-1 rounded-md font-medium transition-all ${
                  selectedCurrency.code === curr.code
                    ? 'bg-indigo-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                {curr.code}
              </button>
            ))}
          </div>

          {/* Global Reset */}
          <button
            onClick={resetForecaster}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-all"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Reset Model
          </button>

          {/* Export Report */}
          <button
            onClick={() => alert('Generating comprehensive PDF/Excel liquidity report...')}
            className="flex items-center gap-1.5 px-3 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-lg shadow-indigo-900/20 transition-all"
          >
            <Download className="h-3.5 w-3.5" /> Export Report
          </button>
        </div>
      </header>

      <div className="flex flex-1 flex-col lg:flex-row">
        
        {/* --- SIDEBAR NAVIGATION --- */}
        <aside className="w-full lg:w-64 bg-slate-900/40 border-r border-slate-800 p-4 flex flex-col justify-between gap-6">
          <div className="space-y-6">
            <div>
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">Navigation</p>
              <nav className="space-y-1">
                <button
                  onClick={() => setActiveTab('dashboard')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'dashboard'
                      ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Consolidated Dashboard
                </button>
                <button
                  onClick={() => setActiveTab('forecaster')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'forecaster'
                      ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <TrendingUp className="h-4 w-4" />
                  Cash Flow Forecaster
                </button>
                <button
                  onClick={() => setActiveTab('scenarios')}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'scenarios'
                      ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <ShieldAlert className="h-4 w-4" />
                  Scenario & Stress Tester
                </button>
                <button
                  onClick={() => setActiveTab('alerts')}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeTab === 'alerts'
                      ? 'bg-indigo-600/15 text-indigo-400 border-l-2 border-indigo-500'
                      : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
                  }`}
                >
                  <span className="flex items-center gap-3">
                    <BellRing className="h-4 w-4" />
                    Smart Alerts
                  </span>
                  {generatedAlerts.length > 0 && (
                    <span className={`px-1.5 py-0.5 text-[10px] font-bold rounded-full ${
                      isBreachPredicted ? 'bg-rose-500 text-white' : 'bg-amber-500 text-slate-950'
                    }`}>
                      {generatedAlerts.length}
                    </span>
                  )}
                </button>
              </nav>
            </div>

            {/* Quick Scenario Selector in Sidebar */}
            <div className="border-t border-slate-800 pt-4">
              <p className="text-[10px] font-semibold uppercase tracking-wider text-slate-500 px-3 mb-2">Active Scenario</p>
              <div className="space-y-1.5">
                {SCENARIOS.map(sc => (
                  <button
                    key={sc.id}
                    onClick={() => setSelectedScenarioId(sc.id)}
                    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all border ${
                      selectedScenarioId === sc.id
                        ? 'bg-slate-800 border-slate-700 text-white font-medium'
                        : 'border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-2">
                      <span className="h-2 w-2 rounded-full" style={{ backgroundColor: sc.color }} />
                      {sc.name}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar Footer - Liquidity Health Index */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-3.5 space-y-3">
            <div className="flex justify-between items-center">
              <span className="text-xs text-slate-400 font-medium">Liquidity Health</span>
              <span className={`text-xs font-bold ${isBreachPredicted ? 'text-rose-400' : 'text-emerald-400'}`}>
                {isBreachPredicted ? 'Critical Risk' : 'Strong'}
              </span>
            </div>
            <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
              <div
                className={`h-full transition-all duration-500 ${isBreachPredicted ? 'bg-rose-500' : 'bg-emerald-500'}`}
                style={{ width: isBreachPredicted ? '35%' : '85%' }}
              />
            </div>
            <p className="text-[10px] text-slate-500 leading-relaxed">
              {isBreachPredicted
                ? 'Action required. Cash reserves projected to fall below $5.0M threshold.'
                : 'All entities maintain sufficient liquidity buffers for the next 12 months.'}
            </p>
          </div>
        </aside>

        {/* --- MAIN CONTENT AREA --- */}
        <main className="flex-1 p-6 space-y-6 overflow-y-auto">
          
          {/* --- TOP KPI CARDS --- */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            
            {/* Card 1: Total Current Cash */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Total Current Cash</span>
                <h3 className="text-2xl font-bold text-white">{formatFullCurrency(totalCurrentLiquidity)}</h3>
                <span className="text-[10px] text-slate-500">Consolidated across 5 entities</span>
              </div>
              <div className="p-3 bg-indigo-500/10 text-indigo-400 rounded-lg">
                <DollarSign className="h-6 w-6" />
              </div>
            </div>

            {/* Card 2: Projected Ending Cash */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Projected Ending Cash (12M)</span>
                <h3 className="text-2xl font-bold text-white">{formatFullCurrency(endingLiquidity)}</h3>
                <div className="flex items-center gap-1">
                  {netLiquidityChange >= 0 ? (
                    <span className="text-[10px] text-emerald-400 flex items-center font-medium">
                      <ArrowUpRight className="h-3 w-3" /> +{formatCurrency(netLiquidityChange)}
                    </span>
                  ) : (
                    <span className="text-[10px] text-rose-400 flex items-center font-medium">
                      <ArrowDownRight className="h-3 w-3" /> {formatCurrency(netLiquidityChange)}
                    </span>
                  )}
                  <span className="text-[10px] text-slate-500">vs current</span>
                </div>
              </div>
              <div className={`p-3 rounded-lg ${netLiquidityChange >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'}`}>
                <TrendingUp className="h-6 w-6" />
              </div>
            </div>

            {/* Card 3: Average Monthly Net Flow */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Avg Monthly Net Flow</span>
                <h3 className="text-2xl font-bold text-white">
                  {formatFullCurrency(averageMonthlyInflow - averageMonthlyOutflow)}
                </h3>
                <div className="text-[10px] text-slate-500 flex gap-2">
                  <span className="text-emerald-400">In: {formatCurrency(averageMonthlyInflow)}</span>
                  <span className="text-rose-400">Out: {formatCurrency(averageMonthlyOutflow)}</span>
                </div>
              </div>
              <div className="p-3 bg-amber-500/10 text-amber-400 rounded-lg">
                <Sliders className="h-6 w-6" />
              </div>
            </div>

            {/* Card 4: Cash Runway */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex items-center justify-between">
              <div className="space-y-1">
                <span className="text-xs text-slate-400 font-medium">Cash Runway</span>
                <h3 className="text-2xl font-bold text-white">{runwayMonths} Months</h3>
                <span className="text-[10px] text-slate-500">Based on avg monthly outflow</span>
              </div>
              <div className="p-3 bg-teal-500/10 text-teal-400 rounded-lg">
                <Calendar className="h-6 w-6" />
              </div>
            </div>

          </div>

          {/* --- TAB CONTENT --- */}

          {/* TAB 1: CONSOLIDATED DASHBOARD */}
          {activeTab === 'dashboard' && (
            <div className="space-y-6">
              
              {/* Main Chart: Cash Position Trend */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Consolidated Cash Position Trend</h3>
                    <p className="text-xs text-slate-400">12-month forward projection including active scenario and strategic actions</p>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-indigo-500" />
                      <span className="text-slate-300">Projected Cash</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-3 w-3 rounded-full bg-slate-600" />
                      <span className="text-slate-400">Base Plan</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="h-0.5 w-4 bg-rose-500 border-t border-dashed" />
                      <span className="text-rose-400">Min Reserve ($5M)</span>
                    </div>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={forecastData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorCash" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                          <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis
                        stroke="#64748b"
                        fontSize={11}
                        tickFormatter={(v) => formatCurrency(v)}
                      />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                        formatter={(value: any) => [formatFullCurrency(Number(value)), 'Cash Balance']}
                      />
                      <ReferenceLine y={5000000} stroke="#f43f5e" strokeDasharray="3 3" label={{ value: 'Min Reserve', fill: '#f43f5e', fontSize: 10, position: 'top' }} />
                      <Area type="monotone" dataKey="endingCash" stroke="#6366f1" strokeWidth={2.5} fillOpacity={1} fill="url(#colorCash)" name="Projected Cash" />
                      <Line type="monotone" dataKey="baseEndingCash" stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" dot={false} name="Base Plan" />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Bottom Grid: Subsidiary Breakdown & Quick Actions */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                
                {/* Subsidiary Balances */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 lg:col-span-2">
                  <div className="flex justify-between items-center mb-4">
                    <div>
                      <h3 className="text-base font-bold text-white">Subsidiary Liquidity Breakdown</h3>
                      <p className="text-xs text-slate-400">Current balances and localized health status</p>
                    </div>
                    <span className="text-xs text-indigo-400 font-medium hover:underline cursor-pointer">Manage Entities</span>
                  </div>

                  <div className="overflow-x-auto">
                    <table className="w-full text-left text-xs">
                      <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-wider">
                        <tr>
                          <th className="p-3 rounded-l-lg">Entity Name</th>
                          <th className="p-3">Local Balance</th>
                          <th className="p-3">Balance (USD)</th>
                          <th className="p-3">Allocation %</th>
                          <th className="p-3 rounded-r-lg text-right">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-800">
                        {INITIAL_SUBSIDIARIES.map((sub, idx) => {
                          const pct = ((sub.balanceUSD / totalCurrentLiquidity) * 100).toFixed(1);
                          return (
                            <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                              <td className="p-3 font-medium text-white">{sub.name}</td>
                              <td className="p-3 text-slate-300">
                                {sub.localBalance.toLocaleString()} {sub.currency}
                              </td>
                              <td className="p-3 text-slate-300 font-semibold">
                                {formatFullCurrency(sub.balanceUSD)}
                              </td>
                              <td className="p-3">
                                <div className="flex items-center gap-2">
                                  <div className="w-12 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                                    <div className="bg-indigo-500 h-full" style={{ width: `${pct}%` }} />
                                  </div>
                                  <span className="text-slate-400 text-[10px]">{pct}%</span>
                                </div>
                              </td>
                              <td className="p-3 text-right">
                                <span className={`px-2 py-0.5 rounded-full text-[10px] font-medium ${
                                  sub.status === 'Surplus' ? 'bg-emerald-500/10 text-emerald-400' :
                                  sub.status === 'Optimal' ? 'bg-indigo-500/10 text-indigo-400' :
                                  'bg-rose-500/10 text-rose-400'
                                }`}>
                                  {sub.status}
                                </span>
                              </td>
                            </tr>
                          );
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* Quick Action Center Panel */}
                <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 flex flex-col justify-between">
                  <div>
                    <div className="flex justify-between items-center mb-4">
                      <h3 className="text-base font-bold text-white">Liquidity Levers</h3>
                      <span className="text-[10px] bg-indigo-600/20 text-indigo-400 px-2 py-0.5 rounded-full font-semibold">
                        {actions.filter(a => a.active).length} Active
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mb-4">
                      Toggle strategic actions to immediately simulate their impact on your 12-month cash runway.
                    </p>

                    <div className="space-y-3">
                      {actions.map(action => (
                        <div
                          key={action.id}
                          onClick={() => toggleAction(action.id)}
                          className={`p-3 rounded-lg border cursor-pointer transition-all flex items-start gap-3 ${
                            action.active
                              ? 'bg-indigo-600/10 border-indigo-500/50 text-white'
                              : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                          }`}
                        >
                          <div className={`mt-0.5 p-1 rounded ${action.active ? 'bg-indigo-600 text-white' : 'bg-slate-700 text-slate-400'}`}>
                            {action.active ? <Check className="h-3.5 w-3.5" /> : <Plus className="h-3.5 w-3.5" />}
                          </div>
                          <div className="space-y-0.5">
                            <div className="flex justify-between items-center">
                              <span className="text-xs font-bold text-slate-200">{action.title}</span>
                              <span className="text-[10px] text-indigo-400 font-semibold">
                                +{formatCurrency(action.impactValue)}
                              </span>
                            </div>
                            <p className="text-[10px] text-slate-400 line-clamp-1">{action.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  <button
                    onClick={() => setActiveTab('alerts')}
                    className="w-full mt-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-2"
                  >
                    Go to Action Center &rarr;
                  </button>
                </div>

              </div>

            </div>
          )}

          {/* TAB 2: CASH FLOW FORECASTER */}
          {activeTab === 'forecaster' && (
            <div className="space-y-6">
              
              {/* Interactive Controls Panel */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <Sliders className="h-5 w-5 text-indigo-400" />
                  Interactive Forecast Parameters
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  
                  {/* Growth Rate Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">MoM Revenue Growth Rate</span>
                      <span className="text-indigo-400 font-bold">{growthRate > 0 ? `+${growthRate}` : growthRate}%</span>
                    </div>
                    <input
                      type="range"
                      min="-20"
                      max="20"
                      value={growthRate}
                      onChange={(e) => setGrowthRate(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-indigo-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>-20% (Decline)</span>
                      <span>0% (Flat)</span>
                      <span>+20% (Aggressive)</span>
                    </div>
                  </div>

                  {/* AR Delay Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">AR Collection Delay</span>
                      <span className="text-amber-400 font-bold">+{arDelay} Days</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={arDelay}
                      onChange={(e) => setArDelay(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Immediate</span>
                      <span>45 Days</span>
                      <span>90 Days</span>
                    </div>
                  </div>

                  {/* AP Delay Slider */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">AP Payment Extension</span>
                      <span className="text-emerald-400 font-bold">+{apDelay} Days</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="90"
                      value={apDelay}
                      onChange={(e) => setApDelay(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>Standard</span>
                      <span>45 Days</span>
                      <span>90 Days</span>
                    </div>
                  </div>

                </div>
              </div>

              {/* Inflow vs Outflow Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                  <div>
                    <h3 className="text-base font-bold text-white">Inflow vs Outflow vs Net Cash Flow</h3>
                    <p className="text-xs text-slate-400">Monthly breakdown of operational cash movements</p>
                  </div>
                </div>

                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={forecastData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Legend textAnchor="middle" wrapperStyle={{ fontSize: '12px' }} />
                      <Bar dataKey="inflow" fill="#10b981" name="Total Inflow" radius={[4, 4, 0, 0]} />
                      <Bar dataKey="outflow" fill="#f43f5e" name="Total Outflow" radius={[4, 4, 0, 0]} />
                      <Line type="monotone" dataKey="netFlow" stroke="#f59e0b" strokeWidth={2.5} name="Net Cash Flow" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Monthly Forecast Table */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-4">Detailed Monthly Forecast Table</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead className="bg-slate-800/50 text-slate-400 uppercase text-[10px] tracking-wider">
                      <tr>
                        <th className="p-3 rounded-l-lg">Month</th>
                        <th className="p-3 text-right">Projected Inflow</th>
                        <th className="p-3 text-right">Projected Outflow</th>
                        <th className="p-3 text-right">Net Cash Flow</th>
                        <th className="p-3 text-right rounded-r-lg">Ending Cash Balance</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {forecastData.map((row, idx) => (
                        <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                          <td className="p-3 font-medium text-white">{row.month}</td>
                          <td className="p-3 text-right text-emerald-400 font-medium">{formatFullCurrency(row.inflow)}</td>
                          <td className="p-3 text-right text-rose-400 font-medium">{formatFullCurrency(row.outflow)}</td>
                          <td className={`p-3 text-right font-bold ${row.netFlow >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                            {row.netFlow >= 0 ? '+' : ''}{formatFullCurrency(row.netFlow)}
                          </td>
                          <td className={`p-3 text-right font-bold ${row.endingCash < 5000000 ? 'text-rose-400' : 'text-white'}`}>
                            {formatFullCurrency(row.endingCash)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

            </div>
          )}

          {/* TAB 3: SCENARIO PLANNER & STRESS TESTER */}
          {activeTab === 'scenarios' && (
            <div className="space-y-6">
              
              {/* Scenario Cards Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SCENARIOS.map(sc => {
                  const isSelected = selectedScenarioId === sc.id;
                  return (
                    <div
                      key={sc.id}
                      onClick={() => setSelectedScenarioId(sc.id)}
                      className={`p-5 rounded-xl border cursor-pointer transition-all flex flex-col justify-between h-48 ${
                        isSelected
                          ? 'bg-slate-900 border-2 shadow-lg'
                          : 'bg-slate-900/50 border-slate-800 hover:border-slate-700'
                      }`}
                      style={{ borderColor: isSelected ? sc.color : undefined }}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-xs font-bold uppercase tracking-wider text-slate-400">Scenario</span>
                          <span className="h-3 w-3 rounded-full" style={{ backgroundColor: sc.color }} />
                        </div>
                        <h4 className="text-base font-bold text-white">{sc.name}</h4>
                        <p className="text-xs text-slate-400 line-clamp-3">{sc.description}</p>
                      </div>

                      <div className="border-t border-slate-800/80 pt-3 flex justify-between items-center text-[10px] text-slate-400">
                        <span>Rev: {sc.revenueModifier * 100}%</span>
                        <span>OpEx: {sc.opexModifier * 100}%</span>
                        <span>AR: +{sc.arDelayDays}d</span>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Custom Stress Test Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="flex justify-between items-center mb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Custom Stress Test Overlay</h3>
                    <p className="text-xs text-slate-400">Apply custom macroeconomic shocks to the Base Case scenario</p>
                  </div>
                  {selectedScenarioId !== 'base' && (
                    <span className="text-xs text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded-lg font-medium">
                      Switch to Base Case to enable custom stress
                    </span>
                  )}
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Custom Revenue Drop */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Custom Revenue Drop (Shock)</span>
                      <span className="text-rose-400 font-bold">-{customRevenueDrop}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="50"
                      disabled={selectedScenarioId !== 'base'}
                      value={customRevenueDrop}
                      onChange={(e) => setCustomRevenueDrop(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-rose-500 disabled:opacity-30"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0% (No Shock)</span>
                      <span>25% (Moderate)</span>
                      <span>50% (Severe Shock)</span>
                    </div>
                  </div>

                  {/* Custom OpEx Spike */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Custom OpEx Inflation Spike</span>
                      <span className="text-amber-400 font-bold">+{customOpexSpike}%</span>
                    </div>
                    <input
                      type="range"
                      min="0"
                      max="30"
                      disabled={selectedScenarioId !== 'base'}
                      value={customOpexSpike}
                      onChange={(e) => setCustomOpexSpike(Number(e.target.value))}
                      className="w-full h-1.5 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500 disabled:opacity-30"
                    />
                    <div className="flex justify-between text-[10px] text-slate-500">
                      <span>0% (Stable)</span>
                      <span>15% (High Inflation)</span>
                      <span>30% (Hyper Inflation)</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Scenario Comparison Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-4">Scenario Comparison: Cash Position</h3>
                <div className="h-80 w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <LineChart data={forecastData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                      <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                      <YAxis stroke="#64748b" fontSize={11} tickFormatter={(v) => formatCurrency(v)} />
                      <Tooltip
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                      />
                      <Legend textAnchor="middle" wrapperStyle={{ fontSize: '12px' }} />
                      <Line type="monotone" dataKey="endingCash" stroke="#6366f1" strokeWidth={3} name="Selected Scenario Cash" />
                      <Line type="monotone" dataKey="baseEndingCash" stroke="#475569" strokeWidth={1.5} strokeDasharray="4 4" name="Base Plan Cash" />
                    </LineChart>
                  </ResponsiveContainer>
                </div>
              </div>

            </div>
          )}

          {/* TAB 4: SMART ALERTS & ACTION CENTER */}
          {activeTab === 'alerts' && (
            <div className="space-y-6">
              
              {/* Alerts List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <h3 className="text-base font-bold text-white mb-4 flex items-center gap-2">
                  <BellRing className="h-5 w-5 text-indigo-400" />
                  Active Liquidity Alerts
                </h3>

                {generatedAlerts.length === 0 ? (
                  <div className="p-8 text-center space-y-3">
                    <div className="inline-flex p-3 bg-emerald-500/10 text-emerald-400 rounded-full">
                      <CheckCircle className="h-8 w-8" />
                    </div>
                    <h4 className="text-sm font-bold text-white">All Systems Clear</h4>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      No liquidity breaches or working capital inefficiencies detected under the current parameters.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {generatedAlerts.map(alert => (
                      <div
                        key={alert.id}
                        className={`p-4 rounded-xl border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 transition-all ${
                          alert.severity === 'critical'
                            ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
                            : alert.severity === 'warning'
                            ? 'bg-amber-500/10 border-amber-500/30 text-amber-200'
                            : 'bg-indigo-500/10 border-indigo-500/30 text-indigo-200'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div className="mt-1">
                            {alert.severity === 'critical' ? (
                              <AlertTriangle className="h-5 w-5 text-rose-400" />
                            ) : alert.severity === 'warning' ? (
                              <AlertTriangle className="h-5 w-5 text-amber-400" />
                            ) : (
                              <Info className="h-5 w-5 text-indigo-400" />
                            )}
                          </div>
                          <div className="space-y-1">
                            <h4 className="text-sm font-bold text-white">{alert.title}</h4>
                            <p className="text-xs text-slate-300 leading-relaxed">{alert.message}</p>
                            <p className="text-[11px] text-slate-400 font-medium">
                              <span className="text-slate-200">Recommendation:</span> {alert.actionRequired}
                            </p>
                          </div>
                        </div>

                        <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                          <button
                            onClick={() => setDismissedAlerts(prev => [...prev, alert.id])}
                            className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-lg text-xs font-medium border border-slate-700 transition-all"
                          >
                            Dismiss
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Action Center / Strategic Levers */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-5">
                <div className="mb-6">
                  <h3 className="text-base font-bold text-white">Strategic Liquidity Action Center</h3>
                  <p className="text-xs text-slate-400">
                    Execute pre-approved corporate actions to optimize working capital or inject emergency funding.
                  </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {actions.map(action => (
                    <div
                      key={action.id}
                      className={`p-5 rounded-xl border transition-all flex flex-col justify-between gap-4 ${
                        action.active
                          ? 'bg-indigo-600/10 border-indigo-500 text-white'
                          : 'bg-slate-800/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      <div className="space-y-2">
                        <div className="flex justify-between items-start">
                          <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded-full font-semibold">
                            {action.category}
                          </span>
                          <span className="text-xs font-bold text-indigo-400">
                            Impact: +{formatCurrency(action.impactValue)}
                          </span>
                        </div>
                        <h4 className="text-sm font-bold text-white">{action.title}</h4>
                        <p className="text-xs text-slate-400 leading-relaxed">{action.description}</p>
                      </div>

                      <div className="border-t border-slate-800/80 pt-4 flex justify-between items-center">
                        <div className="text-[10px] text-slate-400">
                          <span>Cost of Capital: </span>
                          <span className="text-slate-200 font-semibold">{action.costOfCapital}%</span>
                        </div>
                        <button
                          onClick={() => toggleAction(action.id)}
                          className={`px-4 py-1.5 rounded-lg text-xs font-bold transition-all ${
                            action.active
                              ? 'bg-rose-600 hover:bg-rose-500 text-white'
                              : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                          }`}
                        >
                          {action.active ? 'Deactivate Lever' : 'Execute Lever'}
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>
          )}

        </main>
      </div>

      {/* --- FOOTER --- */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-4 text-center text-xs text-slate-500">
        <p>&copy; {new Date().getFullYear()} B2B Corporate Liquidity Forecaster. All rights reserved. Confidential Enterprise System.</p>
      </footer>

    </div>
  );
}