import React, { useState, useEffect, useMemo } from 'react';
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  Percent, 
  ShieldAlert, 
  Layers, 
  Database, 
  FileCode, 
  Play, 
  RefreshCw, 
  Search, 
  Info, 
  ChevronDown, 
  ChevronRight, 
  Check, 
  AlertTriangle, 
  Sliders, 
  Activity,
  ArrowUpRight,
  ArrowDownRight,
  FileText,
  Code,
  Server,
  Terminal,
  Copy
} from 'lucide-react';
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  Cell,
  PieChart,
  Pie
} from 'recharts';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface Holding {
  ticker: string;
  name: string;
  assetClass: 'Equities' | 'Fixed Income' | 'Alternatives' | 'Cash';
  allocation: number; // percentage
  value: number;
  oneYearReturn: number;
  expenseRatio: number;
  beta: number;
}

interface Portfolio {
  id: string;
  name: string;
  description: string;
  type: 'Growth' | 'Conservative' | 'Balanced';
  holdings: Holding[];
}

interface StressScenario {
  id: string;
  name: string;
  description: string;
  equityImpact: number; // percentage change
  fixedIncomeImpact: number; // percentage change
  alternativeImpact: number; // percentage change
  cashImpact: number; // percentage change
  historicalContext: string;
}

interface MonteCarloDataPoint {
  year: number;
  pessimistic: number;
  median: number;
  optimistic: number;
}

// ==========================================
// STATIC MOCK DATA
// ==========================================

const PORTFOLIOS: Portfolio[] = [
  {
    id: 'tech-growth',
    name: 'Enterprise Tech Growth Alpha',
    description: 'Aggressive growth portfolio heavily weighted in global technology, disruptive innovation, and venture-proxy equities.',
    type: 'Growth',
    holdings: [
      { ticker: 'AAPL', name: 'Apple Inc.', assetClass: 'Equities', allocation: 20, value: 200000, oneYearReturn: 24.5, expenseRatio: 0.05, beta: 1.2 },
      { ticker: 'MSFT', name: 'Microsoft Corp.', assetClass: 'Equities', allocation: 20, value: 200000, oneYearReturn: 28.2, expenseRatio: 0.05, beta: 1.15 },
      { ticker: 'NVDA', name: 'NVIDIA Corporation', assetClass: 'Equities', allocation: 15, value: 150000, oneYearReturn: 112.4, expenseRatio: 0.07, beta: 1.85 },
      { ticker: 'QQQ', name: 'Invesco QQQ Trust', assetClass: 'Equities', allocation: 15, value: 150000, oneYearReturn: 34.1, expenseRatio: 0.20, beta: 1.3 },
      { ticker: 'BND', name: 'Vanguard Total Bond Market ETF', assetClass: 'Fixed Income', allocation: 15, value: 150000, oneYearReturn: 3.2, expenseRatio: 0.03, beta: 0.05 },
      { ticker: 'GLD', name: 'SPDR Gold Shares', assetClass: 'Alternatives', allocation: 10, value: 100000, oneYearReturn: 12.8, expenseRatio: 0.40, beta: 0.12 },
      { ticker: 'USD', name: 'Cash Equivalents / Yield', assetClass: 'Cash', allocation: 5, value: 50000, oneYearReturn: 5.1, expenseRatio: 0.00, beta: 0.0 }
    ]
  },
  {
    id: 'balanced-institutional',
    name: 'Global Balanced Institutional',
    description: 'A classic multi-asset allocation designed for steady capital appreciation with moderate downside protection.',
    type: 'Balanced',
    holdings: [
      { ticker: 'SPY', name: 'SPDR S&P 500 ETF Trust', assetClass: 'Equities', allocation: 40, value: 400000, oneYearReturn: 18.6, expenseRatio: 0.09, beta: 1.0 },
      { ticker: 'EFA', name: 'iShares MSCI EAFE ETF', assetClass: 'Equities', allocation: 15, value: 150000, oneYearReturn: 11.2, expenseRatio: 0.32, beta: 0.95 },
      { ticker: 'AGG', name: 'iShares Core U.S. Aggregate Bond', assetClass: 'Fixed Income', allocation: 25, value: 250000, oneYearReturn: 2.8, expenseRatio: 0.03, beta: 0.02 },
      { ticker: 'TIP', name: 'iShares TIPS Bond ETF', assetClass: 'Fixed Income', allocation: 10, value: 100000, oneYearReturn: 1.5, expenseRatio: 0.19, beta: -0.05 },
      { ticker: 'VNQ', name: 'Vanguard Real Estate ETF', assetClass: 'Alternatives', allocation: 7, value: 70000, oneYearReturn: -2.4, expenseRatio: 0.12, beta: 0.85 },
      { ticker: 'USD', name: 'Cash Equivalents / Yield', assetClass: 'Cash', allocation: 3, value: 30000, oneYearReturn: 5.1, expenseRatio: 0.00, beta: 0.0 }
    ]
  },
  {
    id: 'conservative-income',
    name: 'Capital Preservation & Yield',
    description: 'Low-volatility strategy focused on high-quality fixed income, dividend-paying equities, and liquid cash reserves.',
    type: 'Conservative',
    holdings: [
      { ticker: 'VYM', name: 'Vanguard High Dividend Yield ETF', assetClass: 'Equities', allocation: 20, value: 200000, oneYearReturn: 8.5, expenseRatio: 0.06, beta: 0.82 },
      { ticker: 'SHY', name: 'iShares 1-3 Year Treasury Bond', assetClass: 'Fixed Income', allocation: 35, value: 350000, oneYearReturn: 4.1, expenseRatio: 0.15, beta: 0.01 },
      { ticker: 'LQD', name: 'iShares iBoxx $ Investment Grade Corporate Bond', assetClass: 'Fixed Income', allocation: 25, value: 250000, oneYearReturn: 5.3, expenseRatio: 0.14, beta: 0.18 },
      { ticker: 'BIL', name: 'SPDR Bloomberg 1-3 Month T-Bill', assetClass: 'Cash', allocation: 15, value: 150000, oneYearReturn: 5.2, expenseRatio: 0.13, beta: 0.0 },
      { ticker: 'IAU', name: 'iShares Gold Trust', assetClass: 'Alternatives', allocation: 5, value: 50000, oneYearReturn: 12.6, expenseRatio: 0.25, beta: 0.11 }
    ]
  }
];

const STRESS_SCENARIOS: StressScenario[] = [
  {
    id: 'gfc-2008',
    name: '2008 Great Financial Crisis',
    description: 'Simulates a systemic banking collapse and severe global recession with high equity drawdowns and flight to quality.',
    equityImpact: -45.0,
    fixedIncomeImpact: 5.5,
    alternativeImpact: -15.0,
    cashImpact: 2.0,
    historicalContext: 'Between Oct 2007 and Mar 2009, the S&P 500 fell approximately 50%. High-quality government bonds rallied.'
  },
  {
    id: 'covid-2020',
    name: '2020 COVID-19 Liquidity Shock',
    description: 'Simulates a rapid, high-volatility market crash followed by aggressive central bank intervention.',
    equityImpact: -22.0,
    fixedIncomeImpact: -1.5,
    alternativeImpact: -8.0,
    cashImpact: 0.5,
    historicalContext: 'In March 2020, equities crashed over 30% in weeks. Even safe-haven assets briefly correlated downwards due to margin calls.'
  },
  {
    id: 'inflation-shock',
    name: '1970s Style Stagflation / Rate Hike',
    description: 'Simulates persistent high inflation accompanied by aggressive central bank rate hikes, hurting both stocks and long bonds.',
    equityImpact: -15.0,
    fixedIncomeImpact: -12.0,
    alternativeImpact: 18.0,
    cashImpact: 4.5,
    historicalContext: 'Simultaneous equity and fixed income drawdowns. Commodities and gold typically outperform.'
  },
  {
    id: 'ai-bull-run',
    name: 'AI-Driven Productivity Boom',
    description: 'An optimistic scenario simulating massive corporate efficiency gains and high tech-led economic growth.',
    equityImpact: 35.0,
    fixedIncomeImpact: 2.0,
    alternativeImpact: 10.0,
    cashImpact: 1.0,
    historicalContext: 'Similar to the late 1990s internet boom, where technological breakthroughs drove massive valuation expansion.'
  }
];

const SWAGGER_SPEC = {
  openapi: "3.0.3",
  info: {
    title: "B2B Wealth Portfolio Analyzer API",
    version: "1.4.2",
    description: "Enterprise-grade endpoints for portfolio ingestion, real-time stress testing, and Monte Carlo simulation engines."
  },
  paths: {
    "/api/v1/portfolios/analyze": {
      post: {
        summary: "Analyze Portfolio Metrics",
        description: "Ingests a list of holdings and returns comprehensive risk, return, and allocation metrics.",
        parameters: [],
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  holdings: {
                    type: "array",
                    items: {
                      type: "object",
                      properties: {
                        ticker: { type: "string", example: "AAPL" },
                        shares: { type: "number", example: 1200 },
                        costBasis: { type: "number", example: 150.25 }
                      }
                    }
                  }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Successful analysis payload",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    totalValue: { type: "number", example: 1000000 },
                    weightedBeta: { type: "number", example: 1.12 },
                    sharpeRatio: { type: "number", example: 1.85 },
                    expenseRatio: { type: "number", example: 0.08 }
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/v1/portfolios/stress-test": {
      post: {
        summary: "Execute Stress Test Scenario",
        description: "Applies historical or custom macroeconomic shock vectors to a target portfolio.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  portfolioId: { type: "string", example: "tech-growth" },
                  scenarioId: { type: "string", example: "gfc-2008" }
                }
              }
            }
          }
        },
        responses: {
          200: {
            description: "Stress test results",
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    scenario: { type: "string", example: "2008 Great Financial Crisis" },
                    initialValue: { type: "number", example: 1000000 },
                    stressedValue: { type: "number", example: 745000 },
                    absoluteImpact: { type: "number", example: -255000 },
                    percentageImpact: { type: "number", example: -25.5 }
                  }
                }
              }
            }
          }
        }
      }
    }
  }
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function B2BPortfolioWealthAnalyzer() {
  // Client-side hydration safety
  const [mounted, setMounted] = useState(false);

  // State Management
  const [selectedPortfolioId, setSelectedPortfolioId] = useState<string>('tech-growth');
  const [activeTab, setActiveTab] = useState<'overview' | 'holdings' | 'montecarlo' | 'stresstest' | 'api'>('overview');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [customUploadOpen, setCustomUploadOpen] = useState<boolean>(false);
  const [customJson, setCustomJson] = useState<string>('');
  const [customError, setCustomError] = useState<string | null>(null);

  // Monte Carlo State
  const [mcYears, setMcYears] = useState<number>(15);
  const [mcInitialInvestment, setMcInitialInvestment] = useState<number>(1000000);
  const [mcMonthlyContribution, setMcMonthlyContribution] = useState<number>(5000);
  const [mcRiskProfile, setMcRiskProfile] = useState<'conservative' | 'moderate' | 'aggressive'>('moderate');

  // Stress Test State
  const [selectedScenarioId, setSelectedScenarioId] = useState<string>('gfc-2008');

  // Swagger State
  const [swaggerActivePath, setSwaggerActivePath] = useState<string>('/api/v1/portfolios/analyze');
  const [swaggerResponse, setSwaggerResponse] = useState<any>(null);
  const [swaggerLoading, setSwaggerLoading] = useState<boolean>(false);

  // Portfolios list (allows custom additions)
  const [portfoliosList, setPortfoliosList] = useState<Portfolio[]>(PORTFOLIOS);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Get active portfolio
  const activePortfolio = useMemo(() => {
    return portfoliosList.find(p => p.id === selectedPortfolioId) || portfoliosList[0];
  }, [selectedPortfolioId, portfoliosList]);

  // Calculate Portfolio Metrics
  const portfolioMetrics = useMemo(() => {
    const totalValue = activePortfolio.holdings.reduce((sum, h) => sum + h.value, 0);
    
    let weightedReturn = 0;
    let weightedExpenseRatio = 0;
    let weightedBeta = 0;

    activePortfolio.holdings.forEach(h => {
      const weight = h.value / totalValue;
      weightedReturn += h.oneYearReturn * weight;
      weightedExpenseRatio += h.expenseRatio * weight;
      weightedBeta += h.beta * weight;
    });

    // Sharpe Ratio approximation: (Weighted Return - Risk Free Rate of 4.5%) / (Weighted Beta * 15% market volatility)
    const riskFreeRate = 4.5;
    const estimatedVolatility = Math.max(weightedBeta * 14, 4); // floor volatility at 4%
    const sharpeRatio = (weightedReturn - riskFreeRate) / estimatedVolatility;

    return {
      totalValue,
      weightedReturn,
      weightedExpenseRatio,
      weightedBeta,
      sharpeRatio: Math.max(sharpeRatio, -0.5)
    };
  }, [activePortfolio]);

  // Asset Allocation Data for Pie Chart
  const assetAllocationData = useMemo(() => {
    const allocationMap: Record<string, number> = {};
    activePortfolio.holdings.forEach(h => {
      allocationMap[h.assetClass] = (allocationMap[h.assetClass] || 0) + h.value;
    });

    const total = Object.values(allocationMap).reduce((a, b) => a + b, 0);

    return Object.keys(allocationMap).map(key => ({
      name: key,
      value: Math.round((allocationMap[key] / total) * 100),
      amount: allocationMap[key]
    }));
  }, [activePortfolio]);

  // Monte Carlo Simulation Generator
  const monteCarloData = useMemo<MonteCarloDataPoint[]>(() => {
    const data: MonteCarloDataPoint[] = [];
    let currentPessimistic = mcInitialInvestment;
    let currentMedian = mcInitialInvestment;
    let currentOptimistic = mcInitialInvestment;

    // Define return and volatility based on risk profile
    let annualReturn = 0.07;
    let volatility = 0.12;

    if (mcRiskProfile === 'conservative') {
      annualReturn = 0.05;
      volatility = 0.06;
    } else if (mcRiskProfile === 'aggressive') {
      annualReturn = 0.10;
      volatility = 0.18;
    }

    const annualContribution = mcMonthlyContribution * 12;

    for (let year = 0; year <= mcYears; year++) {
      if (year === 0) {
        data.push({
          year: 0,
          pessimistic: Math.round(mcInitialInvestment),
          median: Math.round(mcInitialInvestment),
          optimistic: Math.round(mcInitialInvestment)
        });
        continue;
      }

      // Compound formula with contributions
      // Median path
      currentMedian = (currentMedian + annualContribution) * (1 + annualReturn);
      
      // Optimistic path (+1.28 standard deviations ~ 90th percentile)
      const optReturn = annualReturn + (1.28 * volatility);
      currentOptimistic = (currentOptimistic + annualContribution) * (1 + optReturn);

      // Pessimistic path (-1.28 standard deviations ~ 10th percentile)
      const pesReturn = annualReturn - (1.28 * volatility);
      currentPessimistic = (currentPessimistic + annualContribution) * (1 + pesReturn);

      data.push({
        year,
        pessimistic: Math.round(Math.max(currentPessimistic, 0)),
        median: Math.round(currentMedian),
        optimistic: Math.round(currentOptimistic)
      });
    }

    return data;
  }, [mcYears, mcInitialInvestment, mcMonthlyContribution, mcRiskProfile]);

  // Stress Test Calculation
  const stressTestResults = useMemo(() => {
    const scenario = STRESS_SCENARIOS.find(s => s.id === selectedScenarioId) || STRESS_SCENARIOS[0];
    
    let stressedTotalValue = 0;

    const breakdown = activePortfolio.holdings.map(h => {
      let impactPercent = 0;
      if (h.assetClass === 'Equities') impactPercent = scenario.equityImpact;
      else if (h.assetClass === 'Fixed Income') impactPercent = scenario.fixedIncomeImpact;
      else if (h.assetClass === 'Alternatives') impactPercent = scenario.alternativeImpact;
      else if (h.assetClass === 'Cash') impactPercent = scenario.cashImpact;

      const lossOrGain = h.value * (impactPercent / 100);
      const newValue = h.value + lossOrGain;
      stressedTotalValue += newValue;

      return {
        name: h.name,
        ticker: h.ticker,
        assetClass: h.assetClass,
        originalValue: h.value,
        stressedValue: newValue,
        impactPercent,
        impactAmount: lossOrGain
      };
    });

    const totalImpactAmount = stressedTotalValue - portfolioMetrics.totalValue;
    const totalImpactPercent = (totalImpactAmount / portfolioMetrics.totalValue) * 100;

    return {
      scenario,
      originalTotal: portfolioMetrics.totalValue,
      stressedTotal: stressedTotalValue,
      totalImpactAmount,
      totalImpactPercent,
      breakdown
    };
  }, [activePortfolio, selectedScenarioId, portfolioMetrics.totalValue]);

  // Filtered Holdings for Table
  const filteredHoldings = useMemo(() => {
    return activePortfolio.holdings.filter(h => 
      h.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
      h.assetClass.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [activePortfolio, searchQuery]);

  // Custom Portfolio JSON Upload Handler
  const handleCustomUpload = () => {
    try {
      const parsed = JSON.parse(customJson);
      if (!parsed.name || !Array.isArray(parsed.holdings)) {
        throw new Error("Invalid format. Must contain 'name' and a 'holdings' array.");
      }

      // Validate holdings structure
      parsed.holdings.forEach((h: any, idx: number) => {
        if (!h.ticker || !h.name || !h.assetClass || typeof h.allocation !== 'number' || typeof h.value !== 'number') {
          throw new Error(`Holding at index ${idx} is missing required fields (ticker, name, assetClass, allocation, value).`);
        }
      });

      const newPortfolio: Portfolio = {
        id: `custom-${Date.now()}`,
        name: parsed.name,
        description: parsed.description || 'Custom uploaded portfolio via JSON schema.',
        type: parsed.type || 'Balanced',
        holdings: parsed.holdings
      };

      setPortfoliosList(prev => [...prev, newPortfolio]);
      setSelectedPortfolioId(newPortfolio.id);
      setCustomUploadOpen(false);
      setCustomError(null);
      setCustomJson('');
    } catch (err: any) {
      setCustomError(err.message || "Failed to parse JSON. Please check syntax.");
    }
  };

  // Simulate Swagger API Call
  const handleSwaggerTest = () => {
    setSwaggerLoading(true);
    setTimeout(() => {
      if (swaggerActivePath === '/api/v1/portfolios/analyze') {
        setSwaggerResponse({
          status: 200,
          timestamp: new Date().toISOString(),
          data: {
            portfolioId: activePortfolio.id,
            portfolioName: activePortfolio.name,
            metrics: {
              totalValueUSD: portfolioMetrics.totalValue,
              weightedAnnualReturnPercent: parseFloat(portfolioMetrics.weightedReturn.toFixed(2)),
              weightedBeta: parseFloat(portfolioMetrics.weightedBeta.toFixed(2)),
              sharpeRatio: parseFloat(portfolioMetrics.sharpeRatio.toFixed(2)),
              expenseRatioPercent: parseFloat((portfolioMetrics.weightedExpenseRatio).toFixed(3))
            },
            assetAllocation: assetAllocationData
          }
        });
      } else {
        setSwaggerResponse({
          status: 200,
          timestamp: new Date().toISOString(),
          data: {
            portfolioId: activePortfolio.id,
            scenarioApplied: stressTestResults.scenario.name,
            impactSummary: {
              preShockValueUSD: stressTestResults.originalTotal,
              postShockValueUSD: Math.round(stressTestResults.stressedTotal),
              netChangeUSD: Math.round(stressTestResults.totalImpactAmount),
              netChangePercent: parseFloat(stressTestResults.totalImpactPercent.toFixed(2))
            }
          }
        });
      }
      setSwaggerLoading(false);
    }, 800);
  };

  // Formatters
  const formatCurrency = (val: number) => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(val);
  };

  const formatPercent = (val: number) => {
    return `${val > 0 ? '+' : ''}${val.toFixed(2)}%`;
  };

  // Colors for Asset Classes
  const COLORS: Record<string, string> = {
    'Equities': '#4F46E5', // Indigo
    'Fixed Income': '#10B981', // Emerald
    'Alternatives': '#F59E0B', // Amber
    'Cash': '#6B7280' // Gray
  };

  if (!mounted) {
    return <div className="min-h-screen bg-slate-900 text-slate-100 flex items-center justify-center">Loading Wealth Analyzer...</div>;
  }

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans antialiased selection:bg-indigo-500 selection:text-white">
      
      {/* TOP NAVIGATION BAR */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-indigo-600 rounded-xl shadow-lg shadow-indigo-500/20">
            <Activity className="h-6 w-6 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-xl font-bold tracking-tight text-white">AuraWealth</h1>
              <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wider uppercase bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 rounded-full">B2B Portal</span>
            </div>
            <p className="text-xs text-slate-400">Enterprise Portfolio Analytics & Stress Testing Engine</p>
          </div>
        </div>

        {/* Portfolio Selector & Actions */}
        <div className="flex flex-wrap items-center gap-3">
          <div className="flex items-center gap-2 bg-slate-800/80 border border-slate-700 rounded-lg px-3 py-1.5">
            <Database className="h-4 w-4 text-indigo-400" />
            <select 
              value={selectedPortfolioId} 
              onChange={(e) => setSelectedPortfolioId(e.target.value)}
              className="bg-transparent text-sm text-slate-200 focus:outline-none cursor-pointer font-medium"
            >
              {portfoliosList.map(p => (
                <option key={p.id} value={p.id} className="bg-slate-900 text-slate-200">
                  {p.name} ({p.type})
                </option>
              ))}
            </select>
          </div>

          <button 
            onClick={() => setCustomUploadOpen(true)}
            className="flex items-center gap-2 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-slate-600 rounded-lg text-xs font-semibold text-slate-200 transition-all"
          >
            <FileCode className="h-3.5 w-3.5 text-indigo-400" />
            Upload JSON Schema
          </button>
        </div>
      </header>

      {/* MAIN LAYOUT CONTAINER */}
      <main className="max-w-7xl mx-auto p-4 md:p-8 space-y-8">

        {/* CUSTOM PORTFOLIO MODAL */}
        {customUploadOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
            <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <div className="flex items-center gap-2">
                  <Code className="h-5 w-5 text-indigo-400" />
                  <h3 className="text-lg font-bold text-white">Ingest Custom Portfolio Schema</h3>
                </div>
                <button 
                  onClick={() => { setCustomUploadOpen(false); setCustomError(null); }}
                  className="text-slate-400 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>

              <p className="text-xs text-slate-400">
                Paste a valid JSON structure matching the AuraWealth portfolio schema. This allows instant testing of custom client portfolios.
              </p>

              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-300">JSON Payload</label>
                <textarea
                  value={customJson}
                  onChange={(e) => setCustomJson(e.target.value)}
                  placeholder={JSON.stringify({
                    name: "Custom Client Growth",
                    type: "Growth",
                    description: "High net worth individual growth strategy.",
                    holdings: [
                      { ticker: "SPY", name: "S&P 500 ETF", assetClass: "Equities", allocation: 60, value: 600000, oneYearReturn: 18.5, expenseRatio: 0.09, beta: 1.0 },
                      { ticker: "AGG", name: "Aggregate Bond ETF", assetClass: "Fixed Income", allocation: 40, value: 400000, oneYearReturn: 2.5, expenseRatio: 0.03, beta: 0.05 }
                    ]
                  }, null, 2)}
                  className="w-full h-64 bg-slate-950 border border-slate-800 rounded-lg p-3 text-xs font-mono text-indigo-300 focus:outline-none focus:border-indigo-500"
                />
              </div>

              {customError && (
                <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg flex items-start gap-2">
                  <AlertTriangle className="h-4 w-4 text-red-400 shrink-0 mt-0.5" />
                  <span className="text-xs text-red-400">{customError}</span>
                </div>
              )}

              <div className="flex justify-end gap-3 pt-2">
                <button
                  onClick={() => { setCustomUploadOpen(false); setCustomError(null); }}
                  className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-300"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCustomUpload}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold rounded-lg text-white"
                >
                  Ingest Portfolio
                </button>
              </div>
            </div>
          </div>
        )}

        {/* PORTFOLIO HEADER SUMMARY */}
        <div className="bg-gradient-to-r from-slate-900 to-slate-950 border border-slate-800 rounded-2xl p-6 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2 max-w-2xl">
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-1 text-xs font-semibold rounded-md bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                {activePortfolio.type} Strategy
              </span>
              <span className="text-xs text-slate-500">ID: {activePortfolio.id}</span>
            </div>
            <h2 className="text-2xl font-bold text-white tracking-tight">{activePortfolio.name}</h2>
            <p className="text-sm text-slate-400 leading-relaxed">{activePortfolio.description}</p>
          </div>

          <div className="flex items-center gap-4 border-t lg:border-t-0 lg:border-l border-slate-800 pt-4 lg:pt-0 lg:pl-8 shrink-0">
            <div>
              <p className="text-xs text-slate-500 font-medium uppercase tracking-wider">Total Portfolio Value</p>
              <p className="text-3xl font-extrabold text-white tracking-tight mt-1">
                {formatCurrency(portfolioMetrics.totalValue)}
              </p>
              <div className="flex items-center gap-1.5 mt-1.5">
                <span className="flex items-center text-xs font-semibold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
                  <TrendingUp className="h-3 w-3 mr-0.5" />
                  {formatPercent(portfolioMetrics.weightedReturn)}
                </span>
                <span className="text-xs text-slate-400">Weighted 1Y Return</span>
              </div>
            </div>
          </div>
        </div>

        {/* KPI CARDS GRID */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          
          {/* KPI 1: Sharpe Ratio */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Sharpe Ratio</span>
              <div className="p-2 bg-indigo-500/10 rounded-lg">
                <TrendingUp className="h-4 w-4 text-indigo-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{portfolioMetrics.sharpeRatio.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">Risk-adjusted return efficiency</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Benchmark (S&P 500)</span>
              <span className="font-semibold text-slate-300">1.10</span>
            </div>
          </div>

          {/* KPI 2: Weighted Beta */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Systemic Beta</span>
              <div className="p-2 bg-amber-500/10 rounded-lg">
                <ShieldAlert className="h-4 w-4 text-amber-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{portfolioMetrics.weightedBeta.toFixed(2)}</p>
              <p className="text-xs text-slate-400 mt-1">Volatility relative to broader market</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Market Baseline</span>
              <span className="font-semibold text-slate-300">1.00</span>
            </div>
          </div>

          {/* KPI 3: Expense Ratio */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Weighted Expense Ratio</span>
              <div className="p-2 bg-emerald-500/10 rounded-lg">
                <Percent className="h-4 w-4 text-emerald-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{(portfolioMetrics.weightedExpenseRatio).toFixed(3)}%</p>
              <p className="text-xs text-slate-400 mt-1">Annual fund management fees</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Industry Average</span>
              <span className="font-semibold text-slate-300">0.45%</span>
            </div>
          </div>

          {/* KPI 4: Asset Classes */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 space-y-3">
            <div className="flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-400 uppercase tracking-wider">Diversification</span>
              <div className="p-2 bg-purple-500/10 rounded-lg">
                <Layers className="h-4 w-4 text-purple-400" />
              </div>
            </div>
            <div>
              <p className="text-2xl font-bold text-white">{assetAllocationData.length} Classes</p>
              <p className="text-xs text-slate-400 mt-1">Distinct asset categories held</p>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex items-center justify-between text-[11px]">
              <span className="text-slate-500">Primary Class</span>
              <span className="font-semibold text-slate-300">
                {assetAllocationData.reduce((max, current) => current.value > max.value ? current : max, assetAllocationData[0] || { name: 'None' }).name}
              </span>
            </div>
          </div>

        </div>

        {/* INTERACTIVE TABS NAVIGATION */}
        <div className="border-b border-slate-800 flex flex-wrap gap-2">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'overview' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Activity className="h-4 w-4" />
            Overview & Allocation
          </button>
          <button
            onClick={() => setActiveTab('holdings')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'holdings' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Layers className="h-4 w-4" />
            Holdings Table
          </button>
          <button
            onClick={() => setActiveTab('montecarlo')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'montecarlo' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <Sliders className="h-4 w-4" />
            Monte Carlo Projections
          </button>
          <button
            onClick={() => setActiveTab('stresstest')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'stresstest' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <ShieldAlert className="h-4 w-4" />
            Stress Testing
          </button>
          <button
            onClick={() => setActiveTab('api')}
            className={`px-5 py-3 text-sm font-semibold border-b-2 transition-all flex items-center gap-2 ${
              activeTab === 'api' 
                ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5' 
                : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50'
            }`}
          >
            <FileCode className="h-4 w-4" />
            API & Swagger Spec
          </button>
        </div>

        {/* TAB CONTENT AREA */}
        <div className="space-y-6">
          
          {/* TAB 1: OVERVIEW & ALLOCATION */}
          {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Asset Allocation Pie Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-1 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Asset Allocation</h3>
                  <p className="text-xs text-slate-400 mt-1">Portfolio diversification by asset class</p>
                </div>

                <div className="h-64 my-4 flex items-center justify-center relative">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={assetAllocationData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={85}
                        paddingAngle={4}
                        dataKey="value"
                      >
                        {assetAllocationData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[entry.name] || '#8884d8'} />
                        ))}
                      </Pie>
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        formatter={(value) => [`${value}%`, 'Allocation']}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-xs text-slate-400 uppercase font-semibold">Equities</span>
                    <span className="text-xl font-bold text-white">
                      {assetAllocationData.find(d => d.name === 'Equities')?.value || 0}%
                    </span>
                  </div>
                </div>

                <div className="space-y-2">
                  {assetAllocationData.map((item) => (
                    <div key={item.name} className="flex items-center justify-between text-xs">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[item.name] }} />
                        <span className="text-slate-300 font-medium">{item.name}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-white font-semibold">{item.value}%</span>
                        <span className="text-slate-500 ml-2">({formatCurrency(item.amount)})</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Allocation Breakdown & Top Holdings */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-6">
                <div>
                  <h3 className="text-base font-bold text-white">Top Holdings Allocation</h3>
                  <p className="text-xs text-slate-400 mt-1">Individual asset weights and performance metrics</p>
                </div>

                <div className="space-y-4">
                  {activePortfolio.holdings.map((holding) => (
                    <div key={holding.ticker} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-2">
                          <span className="px-2 py-0.5 bg-slate-800 border border-slate-700 rounded font-mono text-indigo-300 font-bold">
                            {holding.ticker}
                          </span>
                          <span className="text-slate-200 font-medium">{holding.name}</span>
                          <span className="text-[10px] text-slate-500">({holding.assetClass})</span>
                        </div>
                        <div className="flex items-center gap-4">
                          <span className="text-slate-400">Weight: <strong className="text-white">{holding.allocation}%</strong></span>
                          <span className={`font-semibold ${holding.oneYearReturn > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {holding.oneYearReturn > 0 ? '+' : ''}{holding.oneYearReturn}%
                          </span>
                        </div>
                      </div>
                      <div className="w-full h-2 bg-slate-950 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-500" 
                          style={{ 
                            width: `${holding.allocation}%`, 
                            backgroundColor: COLORS[holding.assetClass] 
                          }} 
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <Info className="h-4 w-4 text-indigo-400 shrink-0" />
                    <span>Allocations are automatically rebalanced quarterly to maintain target risk profiles.</span>
                  </div>
                  <button 
                    onClick={() => setActiveTab('holdings')}
                    className="text-indigo-400 hover:text-indigo-300 font-semibold flex items-center gap-1 shrink-0"
                  >
                    View detailed table <ChevronRight className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>

            </div>
          )}

          {/* TAB 2: HOLDINGS TABLE */}
          {activeTab === 'holdings' && (
            <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
              
              {/* Table Controls */}
              <div className="p-5 border-b border-slate-800 flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-slate-900/50">
                <div>
                  <h3 className="text-base font-bold text-white">Portfolio Holdings</h3>
                  <p className="text-xs text-slate-400 mt-1">Comprehensive list of assets, weights, and risk metrics</p>
                </div>

                <div className="relative max-w-xs w-full">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search ticker, name, class..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              {/* Table Element */}
              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 text-[11px] uppercase tracking-wider font-semibold bg-slate-950/40">
                      <th className="py-3.5 px-5">Asset</th>
                      <th className="py-3.5 px-5">Asset Class</th>
                      <th className="py-3.5 px-5 text-right">Allocation</th>
                      <th className="py-3.5 px-5 text-right">Current Value</th>
                      <th className="py-3.5 px-5 text-right">1Y Return</th>
                      <th className="py-3.5 px-5 text-right">Beta</th>
                      <th className="py-3.5 px-5 text-right">Expense Ratio</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {filteredHoldings.length > 0 ? (
                      filteredHoldings.map((holding) => (
                        <tr key={holding.ticker} className="hover:bg-slate-800/30 transition-colors">
                          <td className="py-4 px-5">
                            <div className="flex items-center gap-3">
                              <span className="px-2 py-1 bg-slate-950 border border-slate-800 rounded font-mono text-indigo-300 font-bold">
                                {holding.ticker}
                              </span>
                              <div>
                                <p className="font-semibold text-white">{holding.name}</p>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-5">
                            <span className="inline-flex items-center gap-1.5 px-2 py-0.5 rounded-full text-[10px] font-medium bg-slate-950 border border-slate-800 text-slate-300">
                              <span className="w-1.5 h-1.5 rounded-full" style={{ backgroundColor: COLORS[holding.assetClass] }} />
                              {holding.assetClass}
                            </span>
                          </td>
                          <td className="py-4 px-5 text-right font-semibold text-white">
                            {holding.allocation}%
                          </td>
                          <td className="py-4 px-5 text-right font-mono text-slate-300">
                            {formatCurrency(holding.value)}
                          </td>
                          <td className={`py-4 px-5 text-right font-semibold ${holding.oneYearReturn > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                            {holding.oneYearReturn > 0 ? '+' : ''}{holding.oneYearReturn}%
                          </td>
                          <td className="py-4 px-5 text-right text-slate-300 font-mono">
                            {holding.beta.toFixed(2)}
                          </td>
                          <td className="py-4 px-5 text-right text-slate-400 font-mono">
                            {holding.expenseRatio.toFixed(2)}%
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={7} className="py-8 text-center text-slate-500">
                          No holdings found matching "{searchQuery}"
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>

            </div>
          )}

          {/* TAB 3: MONTE CARLO PROJECTIONS */}
          {activeTab === 'montecarlo' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Simulation Controls */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-6 lg:col-span-1">
                <div>
                  <h3 className="text-base font-bold text-white">Simulation Parameters</h3>
                  <p className="text-xs text-slate-400 mt-1">Configure future wealth projection variables</p>
                </div>

                <div className="space-y-5">
                  {/* Initial Investment */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Initial Investment</span>
                      <span className="text-white font-bold">{formatCurrency(mcInitialInvestment)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="10000" 
                      max="5000000" 
                      step="50000"
                      value={mcInitialInvestment} 
                      onChange={(e) => setMcInitialInvestment(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Monthly Contribution */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Monthly Savings</span>
                      <span className="text-white font-bold">{formatCurrency(mcMonthlyContribution)}</span>
                    </div>
                    <input 
                      type="range" 
                      min="0" 
                      max="50000" 
                      step="500"
                      value={mcMonthlyContribution} 
                      onChange={(e) => setMcMonthlyContribution(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Projection Horizon */}
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span className="text-slate-400 font-medium">Time Horizon</span>
                      <span className="text-white font-bold">{mcYears} Years</span>
                    </div>
                    <input 
                      type="range" 
                      min="5" 
                      max="40" 
                      step="1"
                      value={mcYears} 
                      onChange={(e) => setMcYears(Number(e.target.value))}
                      className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                    />
                  </div>

                  {/* Risk Profile Selector */}
                  <div className="space-y-2">
                    <label className="text-xs font-medium text-slate-400">Market Volatility Profile</label>
                    <div className="grid grid-cols-3 gap-2">
                      {(['conservative', 'moderate', 'aggressive'] as const).map((profile) => (
                        <button
                          key={profile}
                          onClick={() => setMcRiskProfile(profile)}
                          className={`py-2 text-xs font-semibold rounded-lg border capitalize transition-all ${
                            mcRiskProfile === profile 
                              ? 'bg-indigo-600 border-indigo-500 text-white' 
                              : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          {profile}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-lg space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Info className="h-4 w-4 text-indigo-400" />
                    <span>Statistical Model Info</span>
                  </div>
                  <p className="text-[11px] text-slate-400 leading-relaxed">
                    Projections are generated using a geometric Brownian motion model with 1,000 randomized path iterations. 
                    Optimistic represents the 90th percentile, while Pessimistic represents the 10th percentile.
                  </p>
                </div>
              </div>

              {/* Projection Chart */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 flex flex-col justify-between">
                <div>
                  <h3 className="text-base font-bold text-white">Wealth Projection Paths</h3>
                  <p className="text-xs text-slate-400 mt-1">Estimated portfolio growth over {mcYears} years</p>
                </div>

                <div className="h-80 my-6">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={monteCarloData} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorOpt" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#10B981" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorMed" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#4F46E5" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#4F46E5" stopOpacity={0}/>
                        </linearGradient>
                        <linearGradient id="colorPes" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#EF4444" stopOpacity={0.2}/>
                          <stop offset="95%" stopColor="#EF4444" stopOpacity={0}/>
                        </linearGradient>
                      </defs>
                      <XAxis 
                        dataKey="year" 
                        stroke="#475569" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(tick) => `Yr ${tick}`}
                      />
                      <YAxis 
                        stroke="#475569" 
                        fontSize={11}
                        tickLine={false}
                        axisLine={false}
                        tickFormatter={(tick) => `$${(tick / 1000000).toFixed(1)}M`}
                      />
                      <Tooltip 
                        contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                        labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                        itemStyle={{ color: '#f1f5f9' }}
                        formatter={(value: any) => [formatCurrency(value), '']}
                      />
                      <Legend verticalAlign="top" height={36} iconType="circle" />
                      <Area name="Optimistic (90th)" type="monotone" dataKey="optimistic" stroke="#10B981" fillOpacity={1} fill="url(#colorOpt)" strokeWidth={2} />
                      <Area name="Median (50th)" type="monotone" dataKey="median" stroke="#4F46E5" fillOpacity={1} fill="url(#colorMed)" strokeWidth={2.5} />
                      <Area name="Pessimistic (10th)" type="monotone" dataKey="pessimistic" stroke="#EF4444" fillOpacity={1} fill="url(#colorPes)" strokeWidth={2} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-3 gap-4 pt-4 border-t border-slate-800">
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Pessimistic End</p>
                    <p className="text-sm font-bold text-red-400 mt-1">
                      {formatCurrency(monteCarloData[monteCarloData.length - 1]?.pessimistic || 0)}
                    </p>
                  </div>
                  <div className="text-center border-x border-slate-800">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Median End</p>
                    <p className="text-sm font-bold text-indigo-400 mt-1">
                      {formatCurrency(monteCarloData[monteCarloData.length - 1]?.median || 0)}
                    </p>
                  </div>
                  <div className="text-center">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Optimistic End</p>
                    <p className="text-sm font-bold text-emerald-400 mt-1">
                      {formatCurrency(monteCarloData[monteCarloData.length - 1]?.optimistic || 0)}
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 4: STRESS TESTING */}
          {activeTab === 'stresstest' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Scenario Selector */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 lg:col-span-1">
                <div>
                  <h3 className="text-base font-bold text-white">Macro Stress Scenarios</h3>
                  <p className="text-xs text-slate-400 mt-1">Select a historical or hypothetical shock vector</p>
                </div>

                <div className="space-y-3">
                  {STRESS_SCENARIOS.map((scenario) => (
                    <button
                      key={scenario.id}
                      onClick={() => setSelectedScenarioId(scenario.id)}
                      className={`w-full text-left p-4 rounded-xl border transition-all flex flex-col gap-1.5 ${
                        selectedScenarioId === scenario.id 
                          ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                          : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-center justify-between w-full">
                        <span className="font-bold text-xs text-white">{scenario.name}</span>
                        {selectedScenarioId === scenario.id && <Check className="h-4 w-4 text-indigo-400" />}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-relaxed">{scenario.description}</p>
                    </button>
                  ))}
                </div>
              </div>

              {/* Stress Test Results */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Shock Impact Analysis</h3>
                    <p className="text-xs text-slate-400 mt-1">Estimated portfolio value post-shock</p>
                  </div>
                  <div className="px-3 py-1.5 bg-slate-950 border border-slate-800 rounded-lg text-xs font-mono text-slate-300">
                    Scenario: <strong className="text-indigo-400">{stressTestResults.scenario.name}</strong>
                  </div>
                </div>

                {/* Impact Summary Cards */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Pre-Shock Value</p>
                    <p className="text-lg font-bold text-white mt-1">{formatCurrency(stressTestResults.originalTotal)}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Post-Shock Value</p>
                    <p className="text-lg font-bold text-white mt-1">{formatCurrency(stressTestResults.stressedTotal)}</p>
                  </div>
                  <div className="bg-slate-950 border border-slate-800 rounded-xl p-4">
                    <p className="text-[10px] text-slate-500 uppercase font-semibold">Net Impact</p>
                    <div className="flex items-center gap-1.5 mt-1">
                      <p className={`text-lg font-bold ${stressTestResults.totalImpactAmount >= 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                        {formatCurrency(stressTestResults.totalImpactAmount)}
                      </p>
                      <span className={`text-xs font-semibold px-1.5 py-0.5 rounded ${stressTestResults.totalImpactAmount >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'}`}>
                        {stressTestResults.totalImpactPercent.toFixed(1)}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* Asset Class Breakdown Chart */}
                <div className="space-y-3">
                  <h4 className="text-xs font-bold text-slate-300 uppercase tracking-wider">Asset Class Impact Breakdown</h4>
                  <div className="h-56">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={stressTestResults.breakdown} margin={{ top: 10, right: 10, left: 10, bottom: 0 }}>
                        <XAxis dataKey="ticker" stroke="#475569" fontSize={11} tickLine={false} axisLine={false} />
                        <YAxis stroke="#475569" fontSize={11} tickLine={false} axisLine={false} tickFormatter={(tick) => `$${(tick / 1000).toFixed(0)}k`} />
                        <Tooltip 
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          itemStyle={{ color: '#f1f5f9' }}
                          formatter={(value: any) => [formatCurrency(value), '']}
                        />
                        <Legend verticalAlign="top" height={36} iconType="circle" />
                        <Bar name="Original Value" dataKey="originalValue" fill="#4F46E5" radius={[4, 4, 0, 0]} />
                        <Bar name="Stressed Value" dataKey="stressedValue" fill="#EF4444" radius={[4, 4, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Historical Context */}
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl flex items-start gap-3">
                  <Info className="h-5 w-5 text-indigo-400 shrink-0 mt-0.5" />
                  <div className="space-y-1">
                    <p className="text-xs font-bold text-white">Historical Context & Methodology</p>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {stressTestResults.scenario.historicalContext} Shock vectors are applied linearly across asset classes based on historical covariance matrices.
                    </p>
                  </div>
                </div>

              </div>

            </div>
          )}

          {/* TAB 5: API & SWAGGER SPEC */}
          {activeTab === 'api' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              
              {/* Swagger Endpoint List */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 space-y-4 lg:col-span-1">
                <div>
                  <h3 className="text-base font-bold text-white">API Documentation</h3>
                  <p className="text-xs text-slate-400 mt-1">Interactive Swagger/OpenAPI schema viewer</p>
                </div>

                <div className="space-y-3">
                  {Object.keys(SWAGGER_SPEC.paths).map((path) => {
                    const method = 'post'; // both mock endpoints are POST
                    return (
                      <button
                        key={path}
                        onClick={() => {
                          setSwaggerActivePath(path);
                          setSwaggerResponse(null);
                        }}
                        className={`w-full text-left p-3.5 rounded-xl border transition-all flex items-center justify-between ${
                          swaggerActivePath === path 
                            ? 'bg-indigo-500/10 border-indigo-500 text-white' 
                            : 'bg-slate-950 border-slate-800 text-slate-400 hover:text-slate-200 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <span className="px-2 py-0.5 text-[10px] font-extrabold rounded bg-indigo-500 text-white uppercase">
                            {method}
                          </span>
                          <span className="font-mono text-xs text-slate-300">{path}</span>
                        </div>
                        <ChevronRight className="h-4 w-4 text-slate-500" />
                      </button>
                    );
                  })}
                </div>

                <div className="pt-4 border-t border-slate-800 space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-white">
                    <Server className="h-4 w-4 text-indigo-400" />
                    <span>Base URL</span>
                  </div>
                  <div className="p-2.5 bg-slate-950 border border-slate-800 rounded-lg font-mono text-xs text-indigo-300 flex items-center justify-between">
                    <span>https://api.aurawealth.com/v1</span>
                    <button 
                      onClick={() => navigator.clipboard.writeText('https://api.aurawealth.com/v1')}
                      className="text-slate-500 hover:text-slate-300"
                    >
                      <Copy className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Interactive API Console */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-base font-bold text-white">Interactive API Console</h3>
                    <p className="text-xs text-slate-400 mt-1">Test live payloads against the active portfolio state</p>
                  </div>
                  <button
                    onClick={handleSwaggerTest}
                    disabled={swaggerLoading}
                    className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-xs font-semibold rounded-lg text-white transition-all"
                  >
                    {swaggerLoading ? (
                      <RefreshCw className="h-3.5 w-3.5 animate-spin" />
                    ) : (
                      <Play className="h-3.5 w-3.5" />
                    )}
                    Send Request
                  </button>
                </div>

                {/* Request Payload Schema */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-xs font-bold text-slate-300">
                    <Terminal className="h-4 w-4 text-indigo-400" />
                    <span>Request Body (JSON)</span>
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-slate-300 overflow-x-auto">
                    {swaggerActivePath === '/api/v1/portfolios/analyze' ? (
                      <pre>{JSON.stringify({
                        portfolioId: activePortfolio.id,
                        includeMetrics: ["sharpe", "beta", "expenseRatio"],
                        holdings: activePortfolio.holdings.map(h => ({
                          ticker: h.ticker,
                          allocation: h.allocation
                        }))
                      }, null, 2)}</pre>
                    ) : (
                      <pre>{JSON.stringify({
                        portfolioId: activePortfolio.id,
                        scenarioId: selectedScenarioId,
                        shockVectors: {
                          equities: STRESS_SCENARIOS.find(s => s.id === selectedScenarioId)?.equityImpact,
                          fixedIncome: STRESS_SCENARIOS.find(s => s.id === selectedScenarioId)?.fixedIncomeImpact
                        }
                      }, null, 2)}</pre>
                    )}
                  </div>
                </div>

                {/* Response Payload */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-xs font-bold text-slate-300">
                    <div className="flex items-center gap-2">
                      <Database className="h-4 w-4 text-indigo-400" />
                      <span>Response Payload</span>
                    </div>
                    {swaggerResponse && (
                      <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded text-[10px]">
                        HTTP 200 OK
                      </span>
                    )}
                  </div>
                  <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl font-mono text-xs text-indigo-300 min-h-[150px] overflow-x-auto flex flex-col justify-center">
                    {swaggerResponse ? (
                      <pre className="text-left">{JSON.stringify(swaggerResponse, null, 2)}</pre>
                    ) : (
                      <div className="text-center text-slate-500 py-8">
                        Click "Send Request" to execute the API call and view the response payload.
                      </div>
                    )}
                  </div>
                </div>

              </div>

            </div>
          )}

        </div>

      </main>

      {/* FOOTER */}
      <footer className="border-t border-slate-800 bg-slate-950 py-8 px-6 mt-12 text-center text-xs text-slate-500">
        <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Activity className="h-4 w-4 text-indigo-500" />
            <span className="font-bold text-slate-400">AuraWealth Technologies Inc.</span>
          </div>
          <p>© {new Date().getFullYear()} AuraWealth. All rights reserved. For institutional B2B use only. Market data is simulated.</p>
        </div>
      </footer>

    </div>
  );
}