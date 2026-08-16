import React, { useState, useMemo } from 'react';
import {
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  DollarSign,
  Percent,
  Calendar,
  Download,
  RefreshCw,
  Search,
  Sliders,
  FileText,
  Layers,
  ArrowUpRight,
  ArrowDownRight,
  ShieldAlert,
  CheckCircle2,
  HelpCircle,
  Info
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from 'recharts';

// --- TYPES & INTERFACES ---
interface StressParameters {
  revenueHaircut: number;      // % reduction in inflows
  paymentDelay: number;        // days of delay (0 to 90)
  creditDefaultRate: number;   // % of outstanding invoices defaulting
  interestRateIncrease: number;// % increase in debt service costs
  recoveryRate: number;        // % recovered from defaulted invoices
}

interface MonthlyData {
  month: string;
  baselineInflow: number;
  baselineOutflow: number;
  stressedInflow: number;
  stressedOutflow: number;
  baselineNet: number;
  stressedNet: number;
  baselineCumulative: number;
  stressedCumulative: number;
}

interface Invoice {
  id: string;
  client: string;
  amount: number;
  dueDate: string;
  riskCategory: 'Low' | 'Medium' | 'High';
  probabilityOfDefault: number; // %
}

interface Transaction {
  id: string;
  date: string;
  description: string;
  category: string;
  type: 'Inflow' | 'Outflow';
  amount: number;
  status: 'Cleared' | 'Pending' | 'Delayed';
}

// --- CONSTANTS & INITIAL MOCK DATA ---
const INITIAL_PARAMETERS: StressParameters = {
  revenueHaircut: 15,
  paymentDelay: 30,
  creditDefaultRate: 8,
  interestRateIncrease: 2.5,
  recoveryRate: 40,
};

const BASELINE_MONTHS = [
  { name: 'Month 1', inflow: 180000, outflow: 130000 },
  { name: 'Month 2', inflow: 195000, outflow: 135000 },
  { name: 'Month 3', inflow: 210000, outflow: 140000 },
  { name: 'Month 4', inflow: 175000, outflow: 138000 },
  { name: 'Month 5', inflow: 220000, outflow: 145000 },
  { name: 'Month 6', inflow: 240000, outflow: 150000 },
];

const INITIAL_INVOICES: Invoice[] = [
  { id: 'INV-2024-001', client: 'Acme Corp', amount: 45000, dueDate: '2024-11-15', riskCategory: 'Low', probabilityOfDefault: 2 },
  { id: 'INV-2024-002', client: 'Globex Industries', amount: 68000, dueDate: '2024-11-20', riskCategory: 'Medium', probabilityOfDefault: 12 },
  { id: 'INV-2024-003', client: 'Initech LLC', amount: 32000, dueDate: '2024-11-28', riskCategory: 'Low', probabilityOfDefault: 4 },
  { id: 'INV-2024-004', client: 'Umbrella Corp', amount: 85000, dueDate: '2024-12-05', riskCategory: 'High', probabilityOfDefault: 28 },
  { id: 'INV-2024-005', client: 'Hooli Inc', amount: 55000, dueDate: '2024-12-12', riskCategory: 'Medium', probabilityOfDefault: 15 },
  { id: 'INV-2024-006', client: 'Veer Group', amount: 40000, dueDate: '2024-12-20', riskCategory: 'High', probabilityOfDefault: 35 },
];

const INITIAL_TRANSACTIONS: Transaction[] = [
  { id: 'TXN-101', date: '2024-11-01', description: 'SaaS Subscription Revenue', category: 'Sales', type: 'Inflow', amount: 45000, status: 'Cleared' },
  { id: 'TXN-102', date: '2024-11-02', description: 'Office Rent Payment', category: 'Facilities', type: 'Outflow', amount: 12000, status: 'Cleared' },
  { id: 'TXN-103', date: '2024-11-04', description: 'AWS Cloud Infrastructure', category: 'Technology', type: 'Outflow', amount: 8500, status: 'Cleared' },
  { id: 'TXN-104', date: '2024-11-08', description: 'Enterprise License - TechCorp', category: 'Sales', type: 'Inflow', amount: 68000, status: 'Pending' },
  { id: 'TXN-105', date: '2024-11-10', description: 'Bi-weekly Payroll', category: 'HR & Payroll', type: 'Outflow', amount: 65000, status: 'Cleared' },
  { id: 'TXN-106', date: '2024-11-12', description: 'Marketing Agency Retainer', category: 'Marketing', type: 'Outflow', amount: 15000, status: 'Pending' },
  { id: 'TXN-107', date: '2024-11-14', description: 'Consulting Services Inflow', category: 'Services', type: 'Inflow', amount: 25000, status: 'Delayed' },
  { id: 'TXN-108', date: '2024-11-18', description: 'Tax Installment Payment', category: 'Finance', type: 'Outflow', amount: 18000, status: 'Pending' },
];

export default function B2BCashFlowStressTester() {
  // --- STATE ---
  const [params, setParams] = useState<StressParameters>(INITIAL_PARAMETERS);
  const [activeTab, setActiveTab] = useState<'liquidity' | 'portfolio' | 'ledger' | 'report'>('liquidity');
  const [startingCash, setStartingCash] = useState<number>(350000);
  const [ledgerSearch, setLedgerSearch] = useState<string>('');
  const [ledgerFilter, setLedgerFilter] = useState<'All' | 'Inflow' | 'Outflow'>('All');
  const [invoices, setInvoices] = useState<Invoice[]>(INITIAL_INVOICES);

  // --- PARAMETER HANDLERS ---
  const handleParamChange = (key: keyof StressParameters, value: number) => {
    setParams((prev) => ({ ...prev, [key]: value }));
  };

  const resetParameters = () => {
    setParams(INITIAL_PARAMETERS);
    setStartingCash(350000);
  };

  // --- CALCULATIONS & DERIVED STATE ---
  const totalOutstandingInvoices = useMemo(() => {
    return invoices.reduce((sum, inv) => sum + inv.amount, 0);
  }, [invoices]);

  // Calculate stress impact on cash flow projections
  const projectionData = useMemo<MonthlyData[]>(() => {
    let currentBaselineCumulative = startingCash;
    let currentStressedCumulative = startingCash;

    return BASELINE_MONTHS.map((m, index) => {
      const baselineInflow = m.inflow;
      const baselineOutflow = m.outflow;

      // Apply revenue haircut and payment delay impact
      // Payment delay shifts a portion of inflows to subsequent periods
      const delayFactor = Math.min(params.paymentDelay / 90, 0.5); // Max 50% delay impact
      const haircutFactor = params.revenueHaircut / 100;
      
      let stressedInflow = baselineInflow * (1 - haircutFactor);
      // Simulate cash flow delay: push some cash out of current month
      stressedInflow = stressedInflow * (1 - delayFactor);
      
      // If not the first month, recover some delayed cash from previous month
      if (index > 0) {
        const previousStressedInflowBase = BASELINE_MONTHS[index - 1].inflow * (1 - haircutFactor);
        stressedInflow += previousStressedInflowBase * delayFactor * 0.8; // 80% recovery of delayed cash
      }

      // Apply interest rate increase to outflows (simulating variable rate debt)
      const interestImpact = 1 + (params.interestRateIncrease / 100) * 0.15; // 15% of outflows are interest-sensitive
      const stressedOutflow = baselineOutflow * interestImpact;

      const baselineNet = baselineInflow - baselineOutflow;
      const stressedNet = stressedInflow - stressedOutflow;

      currentBaselineCumulative += baselineNet;
      currentStressedCumulative += stressedNet;

      return {
        month: m.name,
        baselineInflow,
        baselineOutflow,
        stressedInflow: Math.round(stressedInflow),
        stressedOutflow: Math.round(stressedOutflow),
        baselineNet,
        stressedNet: Math.round(stressedNet),
        baselineCumulative: currentBaselineCumulative,
        stressedCumulative: Math.round(currentStressedCumulative),
      };
    });
  }, [startingCash, params]);

  // Calculate portfolio default loss
  const portfolioLoss = useMemo(() => {
    return invoices.reduce((sum, inv) => {
      // Base probability adjusted by the global credit default rate parameter
      const adjustedPD = Math.min(inv.probabilityOfDefault * (1 + params.creditDefaultRate / 10), 100) / 100;
      const lossGivenDefault = 1 - params.recoveryRate / 100;
      return sum + inv.amount * adjustedPD * lossGivenDefault;
    }, 0);
  }, [invoices, params.creditDefaultRate, params.recoveryRate]);

  // Final metrics
  const finalBaselineCash = projectionData[projectionData.length - 1].baselineCumulative;
  const finalStressedCash = projectionData[projectionData.length - 1].stressedCumulative - portfolioLoss;
  const cashDelta = finalStressedCash - finalBaselineCash;
  const cashDeltaPercent = (cashDelta / finalBaselineCash) * 100;

  const totalStressedInflows = projectionData.reduce((sum, m) => sum + m.stressedInflow, 0);
  const totalStressedOutflows = projectionData.reduce((sum, m) => sum + m.stressedOutflow, 0);
  const netStressedCashFlow = totalStressedInflows - totalStressedOutflows;

  // Liquidity Ratio (Stressed Ending Cash / Total Stressed Outflows)
  const liquidityRatio = finalStressedCash / Math.max(totalStressedOutflows, 1);

  // Risk Rating Calculation
  const riskRating = useMemo(() => {
    if (liquidityRatio < 0.8 || finalStressedCash < 50000) {
      return { label: 'CRITICAL', color: 'text-red-600 bg-red-50 border-red-200', barColor: '#DC2626', desc: 'Severe liquidity shortage. Immediate capital injection or drastic cost reduction required.' };
    } else if (liquidityRatio < 1.2 || cashDeltaPercent < -30) {
      return { label: 'HIGH', color: 'text-orange-600 bg-orange-50 border-orange-200', barColor: '#EA580C', desc: 'High risk of technical insolvency under stress. Tighten credit terms and defer non-essential CapEx.' };
    } else if (liquidityRatio < 1.8 || cashDeltaPercent < -15) {
      return { label: 'MEDIUM', color: 'text-yellow-600 bg-yellow-50 border-yellow-200', barColor: '#CA8A04', desc: 'Moderate vulnerability. Monitor working capital closely and optimize collection cycles.' };
    } else {
      return { label: 'LOW', color: 'text-green-600 bg-green-50 border-green-200', barColor: '#16A34A', desc: 'Strong balance sheet resilience. Adequate buffers to absorb simulated shocks.' };
    }
  }, [liquidityRatio, finalStressedCash, cashDeltaPercent]);

  // --- HANDLERS ---
  const handleAddInvoice = () => {
    const clientNames = ['Delta Corp', 'Apex Systems', 'Zenith Ltd', 'Nova Retail', 'Quantum Tech'];
    const randomClient = clientNames[Math.floor(Math.random() * clientNames.length)];
    const randomAmount = Math.floor(Math.random() * 50000) + 15000;
    const randomPD = Math.floor(Math.random() * 40) + 5;
    const riskCat = randomPD > 25 ? 'High' : randomPD > 10 ? 'Medium' : 'Low';
    
    const newInvoice: Invoice = {
      id: `INV-2024-00${invoices.length + 1}`,
      client: randomClient,
      amount: randomAmount,
      dueDate: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      riskCategory: riskCat,
      probabilityOfDefault: randomPD
    };

    setInvoices([...invoices, newInvoice]);
  };

  const handleRemoveInvoice = (id: string) => {
    setInvoices(invoices.filter(inv => inv.id !== id));
  };

  // --- CSV EXPORT ---
  const exportToCSV = () => {
    let csvContent = "data:text/csv;charset=utf-8,";
    csvContent += "Month,Baseline Inflow,Baseline Outflow,Stressed Inflow,Stressed Outflow,Baseline Cumulative Cash,Stressed Cumulative Cash\n";
    
    projectionData.forEach((row) => {
      csvContent += `${row.month},${row.baselineInflow},${row.baselineOutflow},${row.stressedInflow},${row.stressedOutflow},${row.baselineCumulative},${row.stressedCumulative}\n`;
    });

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "B2B_Cash_Flow_Stress_Test_Report.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // --- FILTERED LEDGER ---
  const filteredTransactions = useMemo(() => {
    return INITIAL_TRANSACTIONS.filter((txn) => {
      const matchesSearch = txn.description.toLowerCase().includes(ledgerSearch.toLowerCase()) ||
                            txn.category.toLowerCase().includes(ledgerSearch.toLowerCase());
      const matchesFilter = ledgerFilter === 'All' || txn.type === ledgerFilter;
      return matchesSearch && matchesFilter;
    });
  }, [ledgerSearch, ledgerFilter]);

  // --- FORMATTERS ---
  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      maximumFractionDigits: 0,
    }).format(value);
  };

  return (
    <div className="min-h-screen bg-slate-50 text-slate-800 flex flex-col font-sans">
      {/* Top Header */}
      <header className="bg-white border-b border-slate-200 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 sticky top-0 z-10 shadow-sm">
        <div>
          <div className="flex items-center gap-2">
            <ShieldAlert className="h-6 w-6 text-indigo-600" />
            <h1 className="text-xl font-bold text-slate-900 tracking-tight">B2B Cash Flow Stress Tester</h1>
          </div>
          <p className="text-xs text-slate-500 mt-0.5">Simulate macroeconomic shocks, payment delays, and counterparty credit defaults on corporate liquidity.</p>
        </div>
        <div className="flex items-center gap-3 w-full md:w-auto">
          <div className="flex items-center gap-2 bg-slate-100 px-3 py-1.5 rounded-lg border border-slate-200 text-xs font-medium text-slate-700">
            <span>Starting Cash:</span>
            <input
              type="number"
              value={startingCash}
              onChange={(e) => setStartingCash(Math.max(0, parseInt(e.target.value) || 0))}
              className="w-24 bg-white border border-slate-300 rounded px-1.5 py-0.5 text-right font-semibold text-slate-900 focus:outline-none focus:ring-1 focus:ring-indigo-500"
            />
          </div>
          <button
            onClick={exportToCSV}
            className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-700 text-white text-xs font-semibold px-3 py-2 rounded-lg transition-colors shadow-sm"
          >
            <Download className="h-3.5 w-3.5" />
            Export CSV
          </button>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 flex flex-col lg:flex-row">
        
        {/* Left Sidebar - Stress Parameters */}
        <aside className="w-full lg:w-80 bg-white border-r border-slate-200 p-6 flex flex-col gap-6 shrink-0">
          <div className="flex justify-between items-center">
            <h2 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sliders className="h-4 w-4 text-slate-500" />
              Stress Parameters
            </h2>
            <button
              onClick={resetParameters}
              className="text-xs text-indigo-600 hover:text-indigo-800 font-medium flex items-center gap-1"
            >
              <RefreshCw className="h-3 w-3" />
              Reset
            </button>
          </div>

          <div className="space-y-5">
            {/* Parameter 1: Revenue Haircut */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Revenue Haircut
                  <span className="group relative cursor-pointer">
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg z-20 leading-normal">
                      Simulates a sudden drop in sales volume or contract values.
                    </span>
                  </span>
                </span>
                <span className="font-bold text-indigo-600">{params.revenueHaircut}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="50"
                step="1"
                value={params.revenueHaircut}
                onChange={(e) => handleParamChange('revenueHaircut', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (Baseline)</span>
                <span>50% (Severe)</span>
              </div>
            </div>

            {/* Parameter 2: Payment Delay */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Payment Delay (Days)
                  <span className="group relative cursor-pointer">
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg z-20 leading-normal">
                      Delays incoming customer payments, shifting cash inflows outward.
                    </span>
                  </span>
                </span>
                <span className="font-bold text-indigo-600">{params.paymentDelay} Days</span>
              </div>
              <input
                type="range"
                min="0"
                max="90"
                step="15"
                value={params.paymentDelay}
                onChange={(e) => handleParamChange('paymentDelay', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0 Days</span>
                <span>90 Days</span>
              </div>
            </div>

            {/* Parameter 3: Credit Default Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Credit Default Rate
                  <span className="group relative cursor-pointer">
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg z-20 leading-normal">
                      Increases the probability of outstanding invoices becoming uncollectible.
                    </span>
                  </span>
                </span>
                <span className="font-bold text-indigo-600">{params.creditDefaultRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="30"
                step="1"
                value={params.creditDefaultRate}
                onChange={(e) => handleParamChange('creditDefaultRate', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0%</span>
                <span>30% (Crisis)</span>
              </div>
            </div>

            {/* Parameter 4: Interest Rate Increase */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Interest Rate Hike
                  <span className="group relative cursor-pointer">
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg z-20 leading-normal">
                      Simulates rising debt service costs on variable-rate credit lines.
                    </span>
                  </span>
                </span>
                <span className="font-bold text-indigo-600">+{params.interestRateIncrease}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="10"
                step="0.5"
                value={params.interestRateIncrease}
                onChange={(e) => handleParamChange('interestRateIncrease', parseFloat(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0%</span>
                <span>+10%</span>
              </div>
            </div>

            {/* Parameter 5: Recovery Rate */}
            <div className="space-y-2">
              <div className="flex justify-between text-xs">
                <span className="font-semibold text-slate-700 flex items-center gap-1">
                  Default Recovery Rate
                  <span className="group relative cursor-pointer">
                    <HelpCircle className="h-3 w-3 text-slate-400" />
                    <span className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:block w-48 bg-slate-900 text-white text-[10px] p-2 rounded shadow-lg z-20 leading-normal">
                      The percentage of defaulted invoice value recovered through collection efforts.
                    </span>
                  </span>
                </span>
                <span className="font-bold text-indigo-600">{params.recoveryRate}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={params.recoveryRate}
                onChange={(e) => handleParamChange('recoveryRate', parseInt(e.target.value))}
                className="w-full h-1.5 bg-slate-200 rounded-lg appearance-none cursor-pointer accent-indigo-600"
              />
              <div className="flex justify-between text-[10px] text-slate-400">
                <span>0% (No Recovery)</span>
                <span>100% (Full Recovery)</span>
              </div>
            </div>
          </div>

          {/* Quick Scenario Presets */}
          <div className="mt-auto pt-6 border-t border-slate-100">
            <h3 className="text-xs font-bold text-slate-500 uppercase tracking-wider mb-3">Scenario Presets</h3>
            <div className="grid grid-cols-2 gap-2">
              <button
                onClick={() => setParams({ revenueHaircut: 5, paymentDelay: 15, creditDefaultRate: 2, interestRateIncrease: 1, recoveryRate: 60 })}
                className="text-[11px] font-semibold bg-slate-100 hover:bg-slate-200 text-slate-700 py-1.5 px-2 rounded text-center transition-colors"
              >
                Mild Recession
              </button>
              <button
                onClick={() => setParams({ revenueHaircut: 25, paymentDelay: 45, creditDefaultRate: 12, interestRateIncrease: 4, recoveryRate: 30 })}
                className="text-[11px] font-semibold bg-orange-50 hover:bg-orange-100 text-orange-700 py-1.5 px-2 rounded text-center transition-colors"
              >
                Credit Crunch
              </button>
              <button
                onClick={() => setParams({ revenueHaircut: 40, paymentDelay: 60, creditDefaultRate: 20, interestRateIncrease: 6, recoveryRate: 15 })}
                className="text-[11px] font-semibold bg-red-50 hover:bg-red-100 text-red-700 py-1.5 px-2 rounded text-center transition-colors col-span-2"
              >
                Systemic Liquidity Crisis
              </button>
            </div>
          </div>
        </aside>

        {/* Right Main Content Area */}
        <main className="flex-1 p-6 flex flex-col gap-6 overflow-y-auto">
          
          {/* Metric Cards Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
            
            {/* Card 1: Ending Cash */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Projected Ending Cash</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(finalStressedCash)}</h3>
                </div>
                <div className="p-2 bg-indigo-50 rounded-lg text-indigo-600">
                  <DollarSign className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Baseline: {formatCurrency(finalBaselineCash)}</span>
                <span className={`flex items-center gap-0.5 font-semibold ${cashDelta >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                  {cashDelta >= 0 ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                  {cashDeltaPercent.toFixed(1)}%
                </span>
              </div>
            </div>

            {/* Card 2: Net Cash Flow */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Stressed Net Cash Flow</p>
                  <h3 className={`text-2xl font-bold mt-1 ${netStressedCashFlow >= 0 ? 'text-slate-900' : 'text-red-600'}`}>
                    {formatCurrency(netStressedCashFlow)}
                  </h3>
                </div>
                <div className={`p-2 rounded-lg ${netStressedCashFlow >= 0 ? 'bg-green-50 text-green-600' : 'bg-red-50 text-red-600'}`}>
                  {netStressedCashFlow >= 0 ? <TrendingUp className="h-5 w-5" /> : <TrendingDown className="h-5 w-5" />}
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Inflows: {formatCurrency(totalStressedInflows)}</span>
                <span className="text-slate-500">Outflows: {formatCurrency(totalStressedOutflows)}</span>
              </div>
            </div>

            {/* Card 3: Portfolio Default Loss */}
            <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-semibold text-slate-500 uppercase tracking-wider">Expected Credit Loss</p>
                  <h3 className="text-2xl font-bold text-slate-900 mt-1">{formatCurrency(portfolioLoss)}</h3>
                </div>
                <div className="p-2 bg-orange-50 rounded-lg text-orange-600">
                  <AlertTriangle className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                <span className="text-slate-500">Outstanding: {formatCurrency(totalOutstandingInvoices)}</span>
                <span className="text-slate-500 font-semibold text-orange-600">
                  {((portfolioLoss / Math.max(totalOutstandingInvoices, 1)) * 100).toFixed(1)}% Loss Rate
                </span>
              </div>
            </div>

            {/* Card 4: Risk Rating */}
            <div className={`p-5 rounded-xl border shadow-sm flex flex-col justify-between transition-colors ${riskRating.color}`}>
              <div className="flex justify-between items-start">
                <div>
                  <p className="text-xs font-bold uppercase tracking-wider opacity-80">Liquidity Risk Rating</p>
                  <h3 className="text-2xl font-black mt-1 tracking-wide">{riskRating.label}</h3>
                </div>
                <div className="p-2 bg-white/80 rounded-lg shadow-sm">
                  <ShieldAlert className="h-5 w-5" />
                </div>
              </div>
              <div className="mt-4 pt-3 border-t border-white/40 flex items-center justify-between text-xs">
                <span className="font-medium">Liquidity Ratio: {liquidityRatio.toFixed(2)}x</span>
                <span className="font-semibold underline cursor-pointer" onClick={() => setActiveTab('report')}>View Report</span>
              </div>
            </div>

          </div>

          {/* Tabbed Navigation */}
          <div className="bg-white rounded-xl border border-slate-200 shadow-sm flex-1 flex flex-col overflow-hidden">
            <div className="flex border-b border-slate-200 bg-slate-50/50 px-4 pt-2 overflow-x-auto">
              <button
                onClick={() => setActiveTab('liquidity')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'liquidity'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <TrendingUp className="h-4 w-4" />
                Liquidity Projections
              </button>
              <button
                onClick={() => setActiveTab('portfolio')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'portfolio'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Layers className="h-4 w-4" />
                Asset & Credit Portfolio
              </button>
              <button
                onClick={() => setActiveTab('ledger')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'ledger'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <Calendar className="h-4 w-4" />
                Transaction Ledger
              </button>
              <button
                onClick={() => setActiveTab('report')}
                className={`flex items-center gap-2 px-4 py-3 text-xs font-bold border-b-2 transition-all whitespace-nowrap ${
                  activeTab === 'report'
                    ? 'border-indigo-600 text-indigo-600'
                    : 'border-transparent text-slate-500 hover:text-slate-800'
                }`}
              >
                <FileText className="h-4 w-4" />
                Stress Test Report
              </button>
            </div>

            {/* Tab Content Area */}
            <div className="p-6 flex-1 overflow-y-auto">
              
              {/* TAB 1: LIQUIDITY PROJECTIONS */}
              {activeTab === 'liquidity' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Cumulative Cash Balance Projection</h3>
                      <p className="text-xs text-slate-500">Comparing baseline cash trajectory against stressed scenario over a 6-month horizon.</p>
                    </div>
                    <div className="flex items-center gap-4 text-xs">
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-indigo-600 rounded-full"></span>
                        <span className="font-medium text-slate-600">Baseline</span>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <span className="w-3 h-3 bg-rose-500 rounded-full"></span>
                        <span className="font-medium text-slate-600">Stressed</span>
                      </div>
                    </div>
                  </div>

                  {/* Chart */}
                  <div className="h-80 w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <defs>
                          <linearGradient id="colorBaseline" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#4f46e5" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#4f46e5" stopOpacity={0}/>
                          </linearGradient>
                          <linearGradient id="colorStressed" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#f43f5e" stopOpacity={0.1}/>
                            <stop offset="95%" stopColor="#f43f5e" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                        <XAxis dataKey="month" stroke="#94a3b8" fontSize={11} />
                        <YAxis stroke="#94a3b8" fontSize={11} tickFormatter={(v) => `$${v/1000}k`} />
                        <Tooltip formatter={(value: number) => [formatCurrency(value), '']} />
                        <Area type="monotone" dataKey="baselineCumulative" stroke="#4f46e5" strokeWidth={2.5} fillOpacity={1} fill="url(#colorBaseline)" name="Baseline Cash" />
                        <Area type="monotone" dataKey="stressedCumulative" stroke="#f43f5e" strokeWidth={2.5} fillOpacity={1} fill="url(#colorStressed)" name="Stressed Cash" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>

                  {/* Projection Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                          <th className="p-3">Month</th>
                          <th className="p-3 text-right">Baseline Inflow</th>
                          <th className="p-3 text-right">Stressed Inflow</th>
                          <th className="p-3 text-right">Baseline Outflow</th>
                          <th className="p-3 text-right">Stressed Outflow</th>
                          <th className="p-3 text-right">Stressed Net</th>
                          <th className="p-3 text-right">Stressed Cash Balance</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {projectionData.map((row, idx) => (
                          <tr key={idx} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 font-semibold text-slate-900">{row.month}</td>
                            <td className="p-3 text-right text-slate-600">{formatCurrency(row.baselineInflow)}</td>
                            <td className="p-3 text-right text-indigo-600 font-medium">{formatCurrency(row.stressedInflow)}</td>
                            <td className="p-3 text-right text-slate-600">{formatCurrency(row.baselineOutflow)}</td>
                            <td className="p-3 text-right text-rose-600 font-medium">{formatCurrency(row.stressedOutflow)}</td>
                            <td className={`p-3 text-right font-bold ${row.stressedNet >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                              {formatCurrency(row.stressedNet)}
                            </td>
                            <td className="p-3 text-right font-bold text-slate-900">{formatCurrency(row.stressedCumulative)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 2: ASSET & CREDIT PORTFOLIO */}
              {activeTab === 'portfolio' && (
                <div className="space-y-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Accounts Receivable & Credit Risk</h3>
                      <p className="text-xs text-slate-500">Manage outstanding invoices and simulate counterparty default probabilities.</p>
                    </div>
                    <button
                      onClick={handleAddInvoice}
                      className="bg-indigo-50 hover:bg-indigo-100 text-indigo-600 text-xs font-bold px-3 py-2 rounded-lg transition-colors border border-indigo-200"
                    >
                      + Add Mock Invoice
                    </button>
                  </div>

                  {/* Invoice Grid / Risk Breakdown */}
                  <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    
                    {/* Left: Invoice List */}
                    <div className="lg:col-span-2 space-y-3">
                      <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">Outstanding Invoices</h4>
                      <div className="border border-slate-200 rounded-lg overflow-hidden max-h-96 overflow-y-auto">
                        <table className="w-full text-left border-collapse">
                          <thead>
                            <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600 sticky top-0">
                              <th className="p-3">Invoice ID</th>
                              <th className="p-3">Client</th>
                              <th className="p-3 text-right">Amount</th>
                              <th className="p-3 text-center">Risk Cat</th>
                              <th className="p-3 text-right">Base PD</th>
                              <th className="p-3 text-right">Stressed PD</th>
                              <th className="p-3"></th>
                            </tr>
                          </thead>
                          <tbody className="divide-y divide-slate-100 text-xs">
                            {invoices.map((inv) => {
                              const stressedPD = Math.min(inv.probabilityOfDefault * (1 + params.creditDefaultRate / 10), 100);
                              return (
                                <tr key={inv.id} className="hover:bg-slate-50/50 transition-colors">
                                  <td className="p-3 font-mono text-slate-500">{inv.id}</td>
                                  <td className="p-3 font-semibold text-slate-900">{inv.client}</td>
                                  <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(inv.amount)}</td>
                                  <td className="p-3 text-center">
                                    <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                      inv.riskCategory === 'High' ? 'bg-red-50 text-red-600' :
                                      inv.riskCategory === 'Medium' ? 'bg-yellow-50 text-yellow-600' :
                                      'bg-green-50 text-green-600'
                                    }`}>
                                      {inv.riskCategory}
                                    </span>
                                  </td>
                                  <td className="p-3 text-right text-slate-500">{inv.probabilityOfDefault}%</td>
                                  <td className="p-3 text-right font-bold text-rose-600">{stressedPD.toFixed(1)}%</td>
                                  <td className="p-3 text-right">
                                    <button
                                      onClick={() => handleRemoveInvoice(inv.id)}
                                      className="text-red-500 hover:text-red-700 font-bold"
                                    >
                                      ✕
                                    </button>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                        </table>
                      </div>
                    </div>

                    {/* Right: Credit Risk Summary */}
                    <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-4">Credit Risk Analysis</h4>
                        
                        <div className="space-y-4">
                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">Total Outstanding Portfolio</span>
                              <span className="font-bold text-slate-900">{formatCurrency(totalOutstandingInvoices)}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div className="bg-indigo-600 h-full" style={{ width: '100%' }}></div>
                            </div>
                          </div>

                          <div>
                            <div className="flex justify-between text-xs mb-1">
                              <span className="text-slate-500">Expected Credit Loss (ECL)</span>
                              <span className="font-bold text-rose-600">{formatCurrency(portfolioLoss)}</span>
                            </div>
                            <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                              <div
                                className="bg-rose-500 h-full"
                                style={{ width: `${Math.min((portfolioLoss / Math.max(totalOutstandingInvoices, 1)) * 100, 100)}%` }}
                              ></div>
                            </div>
                          </div>

                          <div className="pt-4 border-t border-slate-200 space-y-2 text-xs">
                            <div className="flex justify-between">
                              <span className="text-slate-500">Global Default Multiplier:</span>
                              <span className="font-semibold text-slate-800">{(1 + params.creditDefaultRate / 10).toFixed(1)}x</span>
                            </div>
                            <div className="flex justify-between">
                              <span className="text-slate-500">Recovery Rate:</span>
                              <span className="font-semibold text-slate-800">{params.recoveryRate}%</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 bg-white p-3 rounded-lg border border-slate-200 text-[11px] text-slate-500 leading-relaxed flex gap-2">
                        <Info className="h-4 w-4 text-indigo-500 shrink-0 mt-0.5" />
                        <span>
                          Expected Credit Loss is calculated using: <code className="font-mono bg-slate-100 px-1 rounded">Exposure * Stressed PD * (1 - Recovery Rate)</code>.
                        </span>
                      </div>
                    </div>

                  </div>
                </div>
              )}

              {/* TAB 3: TRANSACTION LEDGER */}
              {activeTab === 'ledger' && (
                <div className="space-y-6">
                  <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Upcoming & Recent Transactions</h3>
                      <p className="text-xs text-slate-500">Filter and search through the operational ledger to identify high-risk cash events.</p>
                    </div>
                    
                    {/* Search & Filter Controls */}
                    <div className="flex flex-col sm:flex-row gap-2 w-full md:w-auto">
                      <div className="relative flex-1 sm:flex-initial">
                        <Search className="absolute left-2.5 top-2.5 h-4 w-4 text-slate-400" />
                        <input
                          type="text"
                          placeholder="Search transactions..."
                          value={ledgerSearch}
                          onChange={(e) => setLedgerSearch(e.target.value)}
                          className="pl-9 pr-4 py-2 w-full sm:w-64 bg-white border border-slate-300 rounded-lg text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                        />
                      </div>
                      <select
                        value={ledgerFilter}
                        onChange={(e) => setLedgerFilter(e.target.value as any)}
                        className="bg-white border border-slate-300 rounded-lg px-3 py-2 text-xs focus:outline-none focus:ring-1 focus:ring-indigo-500"
                      >
                        <option value="All">All Types</option>
                        <option value="Inflow">Inflows</option>
                        <option value="Outflow">Outflows</option>
                      </select>
                    </div>
                  </div>

                  {/* Ledger Table */}
                  <div className="border border-slate-200 rounded-lg overflow-hidden">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-slate-50 border-b border-slate-200 text-xs font-bold text-slate-600">
                          <th className="p-3">Date</th>
                          <th className="p-3">Description</th>
                          <th className="p-3">Category</th>
                          <th className="p-3">Type</th>
                          <th className="p-3 text-right">Amount</th>
                          <th className="p-3 text-center">Status</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-100 text-xs">
                        {filteredTransactions.map((txn) => (
                          <tr key={txn.id} className="hover:bg-slate-50/50 transition-colors">
                            <td className="p-3 text-slate-500 font-mono">{txn.date}</td>
                            <td className="p-3 font-semibold text-slate-900">{txn.description}</td>
                            <td className="p-3 text-slate-600">{txn.category}</td>
                            <td className="p-3">
                              <span className={`flex items-center gap-1 font-medium ${txn.type === 'Inflow' ? 'text-green-600' : 'text-red-600'}`}>
                                {txn.type === 'Inflow' ? <ArrowUpRight className="h-3.5 w-3.5" /> : <ArrowDownRight className="h-3.5 w-3.5" />}
                                {txn.type}
                              </span>
                            </td>
                            <td className="p-3 text-right font-bold text-slate-800">{formatCurrency(txn.amount)}</td>
                            <td className="p-3 text-center">
                              <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                                txn.status === 'Cleared' ? 'bg-green-50 text-green-600' :
                                txn.status === 'Pending' ? 'bg-yellow-50 text-yellow-600' :
                                'bg-red-50 text-red-600'
                              }`}>
                                {txn.status}
                              </span>
                            </td>
                          </tr>
                        ))}
                        {filteredTransactions.length === 0 && (
                          <tr>
                            <td colSpan={6} className="p-8 text-center text-slate-400 text-xs">
                              No transactions found matching the criteria.
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {/* TAB 4: STRESS TEST REPORT */}
              {activeTab === 'report' && (
                <div className="space-y-6">
                  <div className="flex justify-between items-center">
                    <div>
                      <h3 className="text-base font-bold text-slate-900">Executive Stress Test Report</h3>
                      <p className="text-xs text-slate-500">Comprehensive analysis of corporate liquidity resilience under simulated macroeconomic shocks.</p>
                    </div>
                    <span className={`px-3 py-1 rounded-full text-xs font-bold border ${riskRating.color}`}>
                      Risk Level: {riskRating.label}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    
                    {/* Left: Scenario Summary */}
                    <div className="md:col-span-2 space-y-6">
                      <div className="bg-slate-50 p-5 rounded-xl border border-slate-200 space-y-4">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Simulated Shock Parameters</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 text-xs">
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-500 block">Revenue Haircut</span>
                            <span className="font-bold text-slate-900 text-sm">{params.revenueHaircut}%</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-500 block">Payment Delay</span>
                            <span className="font-bold text-slate-900 text-sm">{params.paymentDelay} Days</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-500 block">Credit Default Rate</span>
                            <span className="font-bold text-slate-900 text-sm">{params.creditDefaultRate}%</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-500 block">Interest Rate Hike</span>
                            <span className="font-bold text-slate-900 text-sm">+{params.interestRateIncrease}%</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-500 block">Recovery Rate</span>
                            <span className="font-bold text-slate-900 text-sm">{params.recoveryRate}%</span>
                          </div>
                          <div className="bg-white p-3 rounded-lg border border-slate-100">
                            <span className="text-slate-500 block">Starting Cash</span>
                            <span className="font-bold text-slate-900 text-sm">{formatCurrency(startingCash)}</span>
                          </div>
                        </div>
                      </div>

                      {/* Impact Breakdown */}
                      <div className="space-y-3">
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">Liquidity Impact Breakdown</h4>
                        <div className="border border-slate-200 rounded-lg overflow-hidden text-xs">
                          <div className="grid grid-cols-3 bg-slate-50 p-3 font-bold text-slate-600 border-b border-slate-200">
                            <span>Metric</span>
                            <span className="text-right">Baseline</span>
                            <span className="text-right">Stressed</span>
                          </div>
                          <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                            <span className="text-slate-600">Total Cash Inflows</span>
                            <span className="text-right font-medium">{formatCurrency(projectionData.reduce((sum, m) => sum + m.baselineInflow, 0))}</span>
                            <span className="text-right font-bold text-rose-600">{formatCurrency(totalStressedInflows)}</span>
                          </div>
                          <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                            <span className="text-slate-600">Total Cash Outflows</span>
                            <span className="text-right font-medium">{formatCurrency(projectionData.reduce((sum, m) => sum + m.baselineOutflow, 0))}</span>
                            <span className="text-right font-bold text-rose-600">{formatCurrency(totalStressedOutflows)}</span>
                          </div>
                          <div className="grid grid-cols-3 p-3 border-b border-slate-100">
                            <span className="text-slate-600">Expected Credit Loss</span>
                            <span className="text-right font-medium">$0</span>
                            <span className="text-right font-bold text-rose-600">{formatCurrency(portfolioLoss)}</span>
                          </div>
                          <div className="grid grid-cols-3 p-3 bg-slate-50/50 font-bold">
                            <span className="text-slate-900">Ending Cash Balance</span>
                            <span className="text-right text-slate-900">{formatCurrency(finalBaselineCash)}</span>
                            <span className="text-right text-indigo-600">{formatCurrency(finalStressedCash)}</span>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Right: Recommendations */}
                    <div className="bg-white p-5 rounded-xl border border-slate-200 shadow-sm flex flex-col justify-between">
                      <div>
                        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider mb-3">Strategic Recommendations</h4>
                        <p className="text-xs text-slate-500 mb-4">{riskRating.desc}</p>
                        
                        <div className="space-y-3">
                          <div className="flex gap-2.5 items-start text-xs">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800 block">Optimize Receivables</span>
                              <span className="text-slate-500">Implement stricter credit terms and offer early payment discounts to accelerate inflows.</span>
                            </div>
                          </div>
                          <div className="flex gap-2.5 items-start text-xs">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800 block">Establish Credit Lines</span>
                              <span className="text-slate-500">Secure committed revolving credit facilities while market conditions are favorable.</span>
                            </div>
                          </div>
                          <div className="flex gap-2.5 items-start text-xs">
                            <CheckCircle2 className="h-4 w-4 text-indigo-600 shrink-0 mt-0.5" />
                            <div>
                              <span className="font-bold text-slate-800 block">Defer CapEx</span>
                              <span className="text-slate-500">Identify non-essential capital expenditures that can be paused in a stress event.</span>
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="mt-6 pt-4 border-t border-slate-100">
                        <button
                          onClick={exportToCSV}
                          className="w-full bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold py-2.5 rounded-lg transition-colors text-center block"
                        >
                          Download Full Audit Trail
                        </button>
                      </div>
                    </div>

                  </div>
                </div>
              )}

            </div>
          </div>

        </main>
      </div>
    </div>
  );
}