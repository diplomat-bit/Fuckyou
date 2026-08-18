import React, { useState, useMemo, useEffect } from 'react';
import {
  Search, FileText, Download, ExternalLink, Filter, CheckCircle,
  AlertTriangle, Clock, Info, ChevronRight, ChevronLeft, Building,
  User, DollarSign, TrendingUp, ShieldAlert, RefreshCw, FileSpreadsheet,
  TrendingDown, BarChart3, Activity, ShieldCheck, Cpu, Sparkles,
  ArrowUpRight, ArrowDownRight, Layers, Check, Play
} from 'lucide-react';
import {
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid,
  Tooltip, Legend, BarChart, Bar, Cell, PieChart, Pie
} from 'recharts';

// --- TYPES & INTERFACES ---
interface SecFiling {
  id: string;
  ticker: string;
  companyName: string;
  formType: '10-K' | '10-Q' | '8-K' | 'Form 4';
  filingDate: string;
  reportingPeriod: string;
  title: string;
  url: string;
  sentimentScore: number; // -1.0 to 1.0
  riskLevel: 'Low' | 'Medium' | 'High' | 'Critical';
  keyDisclosures: string[];
  financialHighlights?: {
    revenue: number; // in USD
    netIncome: number; // in USD
    eps: number; // in USD
    revenueGrowthYoy: number; // percentage
  };
}

interface InsiderTrade {
  id: string;
  ticker: string;
  companyName: string;
  insiderName: string;
  relationship: string; // e.g., CEO, CFO, 10% Owner, Director
  transactionType: 'Buy' | 'Sell' | 'Option Exercise';
  sharesTraded: number;
  sharePrice: number;
  totalValue: number; // USD
  sharesOwnedPostTransaction: number;
  transactionDate: string;
  filingDate: string;
  isPlannedTrade: boolean; // 10b5-1 plan
}

interface AIAnalysisReport {
  filingId: string;
  summary: string;
  redFlags: { severity: 'High' | 'Medium' | 'Low'; description: string }[];
  opportunities: string[];
  accountingPoliciesAudit: string;
  insiderSentimentAnalysis: string;
  regulatoryRiskScore: number; // 0 to 100
}

// --- MOCK DATA ---
const MOCK_FILINGS: SecFiling[] = [
  {
    id: 'filing-001',
    ticker: 'C',
    companyName: 'Citigroup Inc.',
    formType: '10-K',
    filingDate: '2025-02-24',
    reportingPeriod: '2024-12-31',
    title: 'Annual Report for the Fiscal Year Ended December 31, 2024',
    url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/831001/000083100125000042/c-20241231.htm',
    sentimentScore: 0.15,
    riskLevel: 'High',
    keyDisclosures: [
      'Increased regulatory capital requirements under Basel III endgame rules.',
      'Restructuring charges of $1.2B related to organizational simplification.',
      'Exposure to commercial real estate (CRE) loan defaults in metropolitan hubs.',
      'Expansion of digital asset custody pilot and cross-border blockchain settlement.'
    ],
    financialHighlights: {
      revenue: 78500000000,
      netIncome: 12500000000,
      eps: 6.12,
      revenueGrowthYoy: 3.2
    }
  },
  {
    id: 'filing-002',
    ticker: 'GS',
    companyName: 'Goldman Sachs Group, Inc.',
    formType: '10-Q',
    filingDate: '2025-01-15',
    reportingPeriod: '2024-09-30',
    title: 'Quarterly Report for the Period Ended September 30, 2024',
    url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/886982/000088698224000098/gs-20240930.htm',
    sentimentScore: 0.45,
    riskLevel: 'Medium',
    keyDisclosures: [
      'Surge in investment banking debt underwriting fees (+24% YoY).',
      'Strategic wind-down of consumer lending partnerships.',
      'Provisions for credit losses decreased to $120M.'
    ],
    financialHighlights: {
      revenue: 12700000000,
      netIncome: 2990000000,
      eps: 8.40,
      revenueGrowthYoy: 7.5
    }
  },
  {
    id: 'filing-003',
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    formType: '8-K',
    filingDate: '2025-02-18',
    reportingPeriod: '2025-02-18',
    title: 'Current Report: Entry into a Material Definitive Agreement / Regulation FD Disclosure',
    url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/1318605/000119312525045123/tsla-8k.htm',
    sentimentScore: -0.10,
    riskLevel: 'High',
    keyDisclosures: [
      'New regulatory investigation opened by NHTSA regarding Full Self-Driving (FSD) Beta v12.5.',
      'Secured $2.5B credit facility backed by Gigafactory Shanghai assets.',
      'Departure of Senior VP of Powertrain and Energy Engineering.'
    ]
  },
  {
    id: 'filing-004',
    ticker: 'MSFT',
    companyName: 'Microsoft Corp',
    formType: '10-K',
    filingDate: '2024-07-28',
    reportingPeriod: '2024-06-30',
    title: 'Annual Report for the Fiscal Year Ended June 30, 2024',
    url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/789019/000156459024008123/msft-10k.htm',
    sentimentScore: 0.68,
    riskLevel: 'Low',
    keyDisclosures: [
      'Azure cloud revenue growth sustained at 31% constant currency.',
      'Capital expenditures of $14B in Q4 primarily driven by AI infrastructure.',
      'Integration of Activision Blizzard completed, contributing $2.1B to gaming revenue.'
    ],
    financialHighlights: {
      revenue: 245100000000,
      netIncome: 88100000000,
      eps: 11.80,
      revenueGrowthYoy: 15.8
    }
  },
  {
    id: 'filing-005',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    formType: '10-Q',
    filingDate: '2025-02-01',
    reportingPeriod: '2024-12-28',
    title: 'Quarterly Report for the Period Ended December 28, 2024',
    url: 'https://www.sec.gov/ix?doc=/Archives/edgar/data/320193/000032019325000006/aapl-20241228.htm',
    sentimentScore: 0.32,
    riskLevel: 'Low',
    keyDisclosures: [
      'Record Services revenue of $24.2B, up 12% YoY.',
      'Supply chain diversification efforts in India and Vietnam accelerating.',
      'Antitrust litigation in EU and US DOJ posing potential operational headwinds.'
    ],
    financialHighlights: {
      revenue: 119580000000,
      netIncome: 33920000000,
      eps: 2.18,
      revenueGrowthYoy: 8.9
    }
  }
];

const MOCK_INSIDER_TRADES: InsiderTrade[] = [
  {
    id: 'trade-001',
    ticker: 'C',
    companyName: 'Citigroup Inc.',
    insiderName: 'Fraser Jane',
    relationship: 'CEO & Director',
    transactionType: 'Buy',
    sharesTraded: 15000,
    sharePrice: 62.45,
    totalValue: 936750,
    sharesOwnedPostTransaction: 345210,
    transactionDate: '2025-02-26',
    filingDate: '2025-02-28',
    isPlannedTrade: false
  },
  {
    id: 'trade-002',
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    insiderName: 'Musk Elon',
    relationship: 'CEO & 10% Owner',
    transactionType: 'Sell',
    sharesTraded: 1200000,
    sharePrice: 198.50,
    totalValue: 238200000,
    sharesOwnedPostTransaction: 411000000,
    transactionDate: '2025-02-10',
    filingDate: '2025-02-12',
    isPlannedTrade: true
  },
  {
    id: 'trade-003',
    ticker: 'MSFT',
    companyName: 'Microsoft Corp',
    insiderName: 'Nadella Satya',
    relationship: 'CEO & Chairman',
    transactionType: 'Sell',
    sharesTraded: 50000,
    sharePrice: 415.20,
    totalValue: 20760000,
    sharesOwnedPostTransaction: 812450,
    transactionDate: '2025-01-22',
    filingDate: '2025-01-24',
    isPlannedTrade: true
  },
  {
    id: 'trade-004',
    ticker: 'GS',
    companyName: 'Goldman Sachs Group, Inc.',
    insiderName: 'Solomon David M',
    relationship: 'CEO & Chairman',
    transactionType: 'Option Exercise',
    sharesTraded: 22500,
    sharePrice: 310.15,
    totalValue: 6978375,
    sharesOwnedPostTransaction: 185400,
    transactionDate: '2025-01-18',
    filingDate: '2025-01-20',
    isPlannedTrade: false
  },
  {
    id: 'trade-005',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    insiderName: 'Cook Timothy D',
    relationship: 'CEO & Director',
    transactionType: 'Sell',
    sharesTraded: 180000,
    sharePrice: 182.30,
    totalValue: 32814000,
    sharesOwnedPostTransaction: 3280000,
    transactionDate: '2025-02-05',
    filingDate: '2025-02-07',
    isPlannedTrade: true
  },
  {
    id: 'trade-006',
    ticker: 'C',
    companyName: 'Citigroup Inc.',
    insiderName: 'Mason Mark A',
    relationship: 'CFO',
    transactionType: 'Buy',
    sharesTraded: 5000,
    sharePrice: 61.80,
    totalValue: 309000,
    sharesOwnedPostTransaction: 98450,
    transactionDate: '2025-02-25',
    filingDate: '2025-02-27',
    isPlannedTrade: false
  }
];

const MOCK_AI_REPORTS: Record<string, AIAnalysisReport> = {
  'filing-001': {
    filingId: 'filing-001',
    summary: 'Citigroup\'s 2024 10-K reveals a bank in deep transition. While core revenues remain stable, the massive $1.2B restructuring charge and elevated Basel III capital requirements compress near-term ROE. The digital asset custody expansion is a forward-looking hedge against traditional payment rail disruption.',
    redFlags: [
      { severity: 'High', description: 'Commercial Real Estate (CRE) exposure in metropolitan areas shows rising delinquency rates.' },
      { severity: 'Medium', description: 'Restructuring execution risks could delay projected $2.5B in annual run-rate savings.' },
      { severity: 'Low', description: 'Slight increase in operational risk capital allocation due to legacy consent orders.' }
    ],
    opportunities: [
      'First-mover advantage in institutional digital asset custody.',
      'Simplified corporate structure reduces redundant middle-office costs by 15% starting Q3 2025.'
    ],
    accountingPoliciesAudit: 'Conservative revenue recognition on structured products. Loan loss reserves (CECL) adjusted upward by 8% to account for macroeconomic uncertainty, indicating prudent risk management.',
    insiderSentimentAnalysis: 'Strong bullish signal. CEO Jane Fraser and CFO Mark Mason executed significant open-market purchases immediately following the filing, indicating high confidence in the turnaround timeline.',
    regulatoryRiskScore: 78
  },
  'filing-003': {
    filingId: 'filing-003',
    summary: 'Tesla\'s 8-K highlights immediate regulatory and executive headwinds. The NHTSA investigation into FSD v12.5 introduces significant legal and reputational risk, potentially delaying autonomous taxi commercialization timelines.',
    redFlags: [
      { severity: 'High', description: 'NHTSA FSD investigation could lead to a mandatory recall or software rollback.' },
      { severity: 'High', description: 'Departure of Senior VP of Powertrain indicates potential friction in next-gen platform development.' }
    ],
    opportunities: [
      'Gigafactory Shanghai credit facility provides cheap liquidity to fund regional expansion without diluting equity.'
    ],
    accountingPoliciesAudit: 'Not applicable for this 8-K, but disclosure transparency regarding regulatory inquiries is minimal, raising governance concerns.',
    insiderSentimentAnalysis: 'Bearish. Elon Musk continues systematic sales under 10b5-1 plans, though still retaining the vast majority of his stake.',
    regulatoryRiskScore: 85
  }
};

export default function SecFilingViewer_v2() {
  // --- STATE ---
  const [activeTab, setActiveTab] = useState<'filings' | 'insider' | 'ai-auditor'>('filings');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilingType, setSelectedFilingType] = useState<string>('All');
  const [selectedFiling, setSelectedFiling] = useState<SecFiling | null>(MOCK_FILINGS[0]);
  const [selectedTrade, setSelectedTrade] = useState<InsiderTrade | null>(MOCK_INSIDER_TRADES[0]);
  
  // AI Auditor State
  const [auditorFilingId, setAuditorFilingId] = useState<string>(MOCK_FILINGS[0].id);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [currentReport, setCurrentReport] = useState<AIAnalysisReport | null>(MOCK_AI_REPORTS['filing-001']);

  // --- FILTERED DATA ---
  const filteredFilings = useMemo(() => {
    return MOCK_FILINGS.filter(filing => {
      const matchesSearch = filing.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            filing.companyName.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            filing.title.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesType = selectedFilingType === 'All' || filing.formType === selectedFilingType;
      return matchesSearch && matchesType;
    });
  }, [searchTerm, selectedFilingType]);

  const filteredTrades = useMemo(() => {
    return MOCK_INSIDER_TRADES.filter(trade => {
      return trade.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
             trade.insiderName.toLowerCase().includes(searchTerm.toLowerCase()) ||
             trade.companyName.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [searchTerm]);

  // --- CHART DATA PREPARATION ---
  const insiderVolumeData = useMemo(() => {
    // Group trades by ticker for visualization
    const dataMap: Record<string, { ticker: string; Buy: number; Sell: number; Exercise: number }> = {};
    MOCK_INSIDER_TRADES.forEach(trade => {
      if (!dataMap[trade.ticker]) {
        dataMap[trade.ticker] = { ticker: trade.ticker, Buy: 0, Sell: 0, Exercise: 0 };
      }
      if (trade.transactionType === 'Buy') {
        dataMap[trade.ticker].Buy += trade.totalValue;
      } else if (trade.transactionType === 'Sell') {
        dataMap[trade.ticker].Sell += trade.totalValue;
      } else {
        dataMap[trade.ticker].Exercise += trade.totalValue;
      }
    });
    return Object.values(dataMap);
  }, []);

  const sentimentDistributionData = useMemo(() => {
    return MOCK_FILINGS.map(f => ({
      name: f.ticker,
      sentiment: f.sentimentScore,
      risk: f.riskLevel === 'Low' ? 1 : f.riskLevel === 'Medium' ? 2 : f.riskLevel === 'High' ? 3 : 4
    }));
  }, []);

  // --- HANDLERS ---
  const handleTriggerAIAnalysis = (filingId: string) => {
    setIsAnalyzing(true);
    // Simulate API delay
    setTimeout(() => {
      const report = MOCK_AI_REPORTS[filingId] || {
        filingId,
        summary: `Automated analysis for ${filingId}. The filing indicates standard operational metrics with no major structural anomalies detected. Balance sheet leverage remains within historical standard deviations.`,
        redFlags: [{ severity: 'Low', description: 'Standard macroeconomic headwinds cited in forward-looking statements.' }],
        opportunities: ['Sustained operational efficiency gains.'],
        accountingPoliciesAudit: 'Consistent application of GAAP principles.',
        insiderSentimentAnalysis: 'Neutral. No significant insider transactions detected within the 30-day filing window.',
        regulatoryRiskScore: 35
      };
      setCurrentReport(report);
      setIsAnalyzing(false);
    }, 1200);
  };

  useEffect(() => {
    if (auditorFilingId) {
      // Auto-load report if it exists in mock data, otherwise clear
      setCurrentReport(MOCK_AI_REPORTS[auditorFilingId] || null);
    }
  }, [auditorFilingId]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-indigo-400 text-sm font-semibold tracking-wider uppercase mb-1">
            <ShieldCheck className="w-4 h-4" />
            Sovereign Intelligence & Regulatory Oversight
          </div>
          <h1 className="text-3xl font-bold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SEC Filing & Insider Trading Auditor
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time corporate disclosure analysis, insider transaction tracking, and AI-powered accounting audits.
          </p>
        </div>

        {/* Tab Switcher */}
        <div className="flex bg-slate-900 p-1 rounded-lg border border-slate-800 self-stretch md:self-auto">
          <button
            onClick={() => setActiveTab('filings')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'filings'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-4 h-4" />
            Corporate Filings
          </button>
          <button
            onClick={() => setActiveTab('insider')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'insider'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <User className="w-4 h-4" />
            Insider Trading
          </button>
          <button
            onClick={() => setActiveTab('ai-auditor')}
            className={`flex-1 md:flex-none px-4 py-2 rounded-md text-sm font-medium transition-all flex items-center justify-center gap-2 ${
              activeTab === 'ai-auditor'
                ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/30'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Cpu className="w-4 h-4" />
            AI Disclosure Auditor
          </button>
        </div>
      </div>

      {/* Global Search & Filter Bar */}
      <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-4 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-500 w-4 h-4" />
          <input
            type="text"
            placeholder="Search by ticker, company name, insider name, or filing keyword..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-10 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
          />
        </div>

        {activeTab === 'filings' && (
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="text-slate-400 w-4 h-4 shrink-0" />
            <select
              value={selectedFilingType}
              onChange={(e) => setSelectedFilingType(e.target.value)}
              className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-300 focus:outline-none focus:border-indigo-500 w-full md:w-40"
            >
              <option value="All">All Forms</option>
              <option value="10-K">Form 10-K</option>
              <option value="10-Q">Form 10-Q</option>
              <option value="8-K">Form 8-K</option>
            </select>
          </div>
        )}

        <div className="text-xs text-slate-500 self-end md:self-center">
          Showing {activeTab === 'filings' ? filteredFilings.length : filteredTrades.length} records
        </div>
      </div>

      {/* MAIN CONTENT AREA */}
      {activeTab === 'filings' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Filings List */}
          <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 max-h-[750px] overflow-y-auto">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Recent SEC Filings
            </h2>
            {filteredFilings.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No filings match your search criteria.
              </div>
            ) : (
              filteredFilings.map((filing) => (
                <div
                  key={filing.id}
                  onClick={() => setSelectedFiling(filing)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedFiling?.id === filing.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 bg-slate-800 text-indigo-400 rounded text-xs font-bold">
                        {filing.formType}
                      </span>
                      <span className="font-bold text-slate-200 text-sm">{filing.ticker}</span>
                    </div>
                    <span className="text-xs text-slate-500">{filing.filingDate}</span>
                  </div>
                  <h3 className="text-sm font-medium text-slate-300 line-clamp-2 mb-2">
                    {filing.companyName}
                  </h3>
                  <div className="flex items-center justify-between text-xs">
                    <span className="text-slate-500">Period: {filing.reportingPeriod}</span>
                    <span
                      className={`px-2 py-0.5 rounded-full font-medium ${
                        filing.riskLevel === 'Critical' || filing.riskLevel === 'High'
                          ? 'bg-red-950/50 text-red-400 border border-red-900/50'
                          : filing.riskLevel === 'Medium'
                          ? 'bg-amber-950/50 text-amber-400 border border-amber-900/50'
                          : 'bg-emerald-950/50 text-emerald-400 border border-emerald-900/50'
                      }`}
                    >
                      {filing.riskLevel} Risk
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Filing Details & Analytics */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {selectedFiling ? (
              <>
                {/* Detail Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span className="px-2.5 py-1 bg-indigo-900/50 text-indigo-300 rounded-md text-xs font-bold border border-indigo-800/50">
                          Form {selectedFiling.formType}
                        </span>
                        <h2 className="text-2xl font-bold text-white">{selectedFiling.ticker}</h2>
                        <span className="text-slate-400 text-sm">| {selectedFiling.companyName}</span>
                      </div>
                      <p className="text-slate-400 text-xs">{selectedFiling.title}</p>
                    </div>

                    <a
                      href={selectedFiling.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center gap-2 px-3.5 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 rounded-lg text-xs font-medium transition-colors border border-slate-700"
                    >
                      View SEC EDGAR
                      <ExternalLink className="w-3.5 h-3.5" />
                    </a>
                  </div>

                  {/* Quick Stats Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Filing Date</div>
                      <div className="text-sm font-semibold text-slate-200">{selectedFiling.filingDate}</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Reporting Period</div>
                      <div className="text-sm font-semibold text-slate-200">{selectedFiling.reportingPeriod}</div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Disclosure Sentiment</div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`text-sm font-bold ${
                            selectedFiling.sentimentScore > 0.2
                              ? 'text-emerald-400'
                              : selectedFiling.sentimentScore < 0
                              ? 'text-red-400'
                              : 'text-amber-400'
                          }`}
                        >
                          {selectedFiling.sentimentScore > 0 ? '+' : ''}
                          {selectedFiling.sentimentScore.toFixed(2)}
                        </span>
                        <span className="text-[10px] text-slate-500">(-1 to +1)</span>
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Risk Classification</div>
                      <div className="flex items-center gap-1.5">
                        <span
                          className={`w-2 h-2 rounded-full ${
                            selectedFiling.riskLevel === 'Critical' || selectedFiling.riskLevel === 'High'
                              ? 'bg-red-500'
                              : selectedFiling.riskLevel === 'Medium'
                              ? 'bg-amber-500'
                              : 'bg-emerald-500'
                          }`}
                        />
                        <span className="text-sm font-semibold text-slate-200">{selectedFiling.riskLevel}</span>
                      </div>
                    </div>
                  </div>

                  {/* Financial Highlights (if available) */}
                  {selectedFiling.financialHighlights && (
                    <div className="mb-6 bg-slate-950/60 border border-slate-800/60 rounded-xl p-4">
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-2">
                        <Activity className="w-3.5 h-3.5 text-indigo-400" />
                        Financial Highlights
                      </h3>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase">Total Revenue</div>
                          <div className="text-lg font-bold text-slate-100">
                            ${(selectedFiling.financialHighlights.revenue / 1e9).toFixed(2)}B
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase">Net Income</div>
                          <div className="text-lg font-bold text-slate-100">
                            ${(selectedFiling.financialHighlights.netIncome / 1e9).toFixed(2)}B
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase">Diluted EPS</div>
                          <div className="text-lg font-bold text-slate-100">
                            ${selectedFiling.financialHighlights.eps.toFixed(2)}
                          </div>
                        </div>
                        <div>
                          <div className="text-slate-500 text-[10px] uppercase">YoY Growth</div>
                          <div className="flex items-center gap-1 text-lg font-bold text-emerald-400">
                            <ArrowUpRight className="w-4 h-4" />
                            {selectedFiling.financialHighlights.revenueGrowthYoy}%
                          </div>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Key Disclosures & Risk Factors */}
                  <div className="space-y-4">
                    <div>
                      <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2 flex items-center gap-2">
                        <AlertTriangle className="w-3.5 h-3.5 text-amber-400" />
                        Key Disclosures & Risk Factors
                      </h3>
                      <ul className="space-y-2">
                        {selectedFiling.keyDisclosures.map((disclosure, idx) => (
                          <li key={idx} className="flex items-start gap-2.5 text-sm text-slate-300 bg-slate-950/40 p-2.5 rounded border border-slate-900">
                            <span className="text-indigo-400 font-mono text-xs mt-0.5">[{idx + 1}]</span>
                            <span>{disclosure}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>

                  {/* Action to AI Auditor */}
                  <div className="mt-6 pt-6 border-t border-slate-800 flex justify-between items-center">
                    <div className="text-xs text-slate-500 flex items-center gap-1.5">
                      <Info className="w-3.5 h-3.5" />
                      Deep audit available for this filing.
                    </div>
                    <button
                      onClick={() => {
                        setAuditorFilingId(selectedFiling.id);
                        setActiveTab('ai-auditor');
                        handleTriggerAIAnalysis(selectedFiling.id);
                      }}
                      className="flex items-center gap-2 px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold transition-all shadow-lg shadow-indigo-900/20"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                      Run AI Audit Report
                    </button>
                  </div>
                </div>

                {/* Sentiment & Risk Distribution Chart */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    Filing Sentiment & Risk Matrix
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <AreaChart data={sentimentDistributionData}>
                        <defs>
                          <linearGradient id="colorSentiment" x1="0" y1="0" x2="0" y2="1">
                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3}/>
                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0}/>
                          </linearGradient>
                        </defs>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="name" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                        />
                        <Area type="monotone" dataKey="sentiment" stroke="#6366f1" fillOpacity={1} fill="url(#colorSentiment)" name="Sentiment Score" />
                        <Area type="monotone" dataKey="risk" stroke="#f43f5e" fillOpacity={0} name="Risk Level (1-4)" />
                      </AreaChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                Select a filing from the list to view detailed disclosures and financial highlights.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'insider' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Insider Trades List */}
          <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 max-h-[750px] overflow-y-auto">
            <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-2 px-1">
              Form 4 Insider Transactions
            </h2>
            {filteredTrades.length === 0 ? (
              <div className="text-center py-8 text-slate-500 text-sm">
                No insider trades match your search.
              </div>
            ) : (
              filteredTrades.map((trade) => (
                <div
                  key={trade.id}
                  onClick={() => setSelectedTrade(trade)}
                  className={`p-4 rounded-lg border transition-all cursor-pointer ${
                    selectedTrade?.id === trade.id
                      ? 'bg-indigo-950/40 border-indigo-500/50 shadow-md shadow-indigo-950/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900/80'
                  }`}
                >
                  <div className="flex justify-between items-start gap-2 mb-2">
                    <div className="flex items-center gap-2">
                      <span
                        className={`px-2 py-0.5 rounded text-xs font-bold ${
                          trade.transactionType === 'Buy'
                            ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/30'
                            : trade.transactionType === 'Sell'
                            ? 'bg-rose-950 text-rose-400 border border-rose-900/30'
                            : 'bg-blue-950 text-blue-400 border border-blue-900/30'
                        }`}
                      >
                        {trade.transactionType}
                      </span>
                      <span className="font-bold text-slate-200 text-sm">{trade.ticker}</span>
                    </div>
                    <span className="text-xs text-slate-500">{trade.transactionDate}</span>
                  </div>
                  <h3 className="text-sm font-semibold text-slate-200 mb-1">
                    {trade.insiderName}
                  </h3>
                  <p className="text-xs text-slate-400 mb-2">{trade.relationship}</p>
                  <div className="flex items-center justify-between text-xs border-t border-slate-800/60 pt-2 mt-2">
                    <span className="text-slate-500">Value:</span>
                    <span className="font-bold text-slate-300">
                      ${trade.totalValue.toLocaleString()}
                    </span>
                  </div>
                </div>
              ))
            )}
          </div>

          {/* Right Column: Insider Trade Details & Volume Chart */}
          <div className="lg:col-span-2 flex flex-col gap-6">
            {selectedTrade ? (
              <>
                {/* Detail Card */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                  <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4 mb-6">
                    <div>
                      <div className="flex items-center gap-3 mb-1">
                        <span
                          className={`px-2.5 py-1 rounded-md text-xs font-bold border ${
                            selectedTrade.transactionType === 'Buy'
                              ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/50'
                              : selectedTrade.transactionType === 'Sell'
                              ? 'bg-rose-950/50 text-rose-300 border-rose-800/50'
                              : 'bg-blue-950/50 text-blue-300 border-blue-800/50'
                          }`}
                        >
                          {selectedTrade.transactionType}
                        </span>
                        <h2 className="text-2xl font-bold text-white">{selectedTrade.ticker}</h2>
                        <span className="text-slate-400 text-sm">| {selectedTrade.companyName}</span>
                      </div>
                      <p className="text-slate-400 text-xs">Form 4 Insider Ownership Disclosure</p>
                    </div>

                    <div className="flex items-center gap-2">
                      {selectedTrade.isPlannedTrade && (
                        <span className="px-2.5 py-1 bg-slate-800 text-slate-400 rounded-lg text-xs font-medium border border-slate-700 flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          10b5-1 Planned
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Insider Profile */}
                  <div className="flex items-center gap-4 bg-slate-950/50 border border-slate-800/60 rounded-xl p-4 mb-6">
                    <div className="w-12 h-12 rounded-full bg-indigo-950/50 border border-indigo-800/50 flex items-center justify-center text-indigo-400 font-bold text-lg">
                      {selectedTrade.insiderName.charAt(0)}
                    </div>
                    <div>
                      <h3 className="text-base font-bold text-slate-100">{selectedTrade.insiderName}</h3>
                      <p className="text-xs text-slate-400">{selectedTrade.relationship}</p>
                    </div>
                  </div>

                  {/* Transaction Metrics Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Shares Traded</div>
                      <div className="text-sm font-semibold text-slate-200">
                        {selectedTrade.sharesTraded.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Share Price</div>
                      <div className="text-sm font-semibold text-slate-200">
                        ${selectedTrade.sharePrice.toFixed(2)}
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Total Transaction Value</div>
                      <div className="text-sm font-bold text-indigo-400">
                        ${selectedTrade.totalValue.toLocaleString()}
                      </div>
                    </div>
                    <div className="bg-slate-950 border border-slate-800/80 rounded-lg p-3">
                      <div className="text-slate-500 text-xs mb-1">Shares Owned Post-Trade</div>
                      <div className="text-sm font-semibold text-slate-200">
                        {selectedTrade.sharesOwnedPostTransaction.toLocaleString()}
                      </div>
                    </div>
                  </div>

                  {/* Dates & Compliance */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs text-slate-400 bg-slate-950/30 p-4 rounded-lg border border-slate-900">
                    <div className="flex justify-between py-1 border-b border-slate-900 sm:border-none">
                      <span>Transaction Date:</span>
                      <span className="font-medium text-slate-200">{selectedTrade.transactionDate}</span>
                    </div>
                    <div className="flex justify-between py-1">
                      <span>SEC Filing Date:</span>
                      <span className="font-medium text-slate-200">{selectedTrade.filingDate}</span>
                    </div>
                  </div>
                </div>

                {/* Insider Trading Volume Chart */}
                <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6">
                  <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                    <BarChart3 className="w-4 h-4 text-indigo-400" />
                    Insider Trading Volume by Ticker (USD)
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={insiderVolumeData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                        <XAxis dataKey="ticker" stroke="#94a3b8" />
                        <YAxis stroke="#94a3b8" />
                        <Tooltip
                          contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '8px' }}
                          labelStyle={{ color: '#f8fafc', fontWeight: 'bold' }}
                          formatter={(value: any) => [`$${Number(value).toLocaleString()}`, '']}
                        />
                        <Legend />
                        <Bar dataKey="Buy" fill="#10b981" name="Insider Buys" />
                        <Bar dataKey="Sell" fill="#f43f5e" name="Insider Sells" />
                        <Bar dataKey="Exercise" fill="#3b82f6" name="Option Exercises" />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-12 text-center text-slate-500">
                Select an insider transaction from the list to view detailed Form 4 metrics.
              </div>
            )}
          </div>
        </div>
      )}

      {activeTab === 'ai-auditor' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column: Select Filing for Audit */}
          <div className="lg:col-span-1 bg-slate-900/30 border border-slate-800 rounded-xl p-4 flex flex-col gap-4">
            <div>
              <h2 className="text-sm font-semibold text-slate-400 uppercase tracking-wider mb-3">
                Select Filing to Audit
              </h2>
              <div className="space-y-2">
                {MOCK_FILINGS.map((filing) => (
                  <div
                    key={filing.id}
                    onClick={() => setAuditorFilingId(filing.id)}
                    className={`p-3 rounded-lg border transition-all cursor-pointer flex justify-between items-center ${
                      auditorFilingId === filing.id
                        ? 'bg-indigo-950/40 border-indigo-500/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div>
                      <div className="flex items-center gap-2 mb-1">
                        <span className="px-1.5 py-0.5 bg-slate-800 text-indigo-400 rounded text-[10px] font-bold">
                          {filing.formType}
                        </span>
                        <span className="font-bold text-slate-200 text-sm">{filing.ticker}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-1">{filing.companyName}</p>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-500" />
                  </div>
                ))}
              </div>
            </div>

            <button
              onClick={() => handleTriggerAIAnalysis(auditorFilingId)}
              disabled={isAnalyzing}
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-sm font-semibold transition-all shadow-lg shadow-indigo-900/20"
            >
              {isAnalyzing ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  Analyzing Disclosures...
                </>
              ) : (
                <>
                  <Play className="w-4 h-4" />
                  Generate AI Audit Report
                </>
              )}
            </button>
          </div>

          {/* Right Column: AI Audit Report Output */}
          <div className="lg:col-span-2">
            {isAnalyzing ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-12 flex flex-col items-center justify-center text-center h-full min-h-[400px]">
                <div className="relative mb-4">
                  <div className="w-16 h-16 rounded-full border-4 border-indigo-900/30 border-t-indigo-500 animate-spin" />
                  <Cpu className="w-6 h-6 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2" />
                </div>
                <h3 className="text-lg font-bold text-slate-200 mb-2">Sovereign AI Auditor Active</h3>
                <p className="text-slate-400 text-sm max-w-md">
                  Parsing SEC filing text, cross-referencing insider trading patterns, and evaluating accounting policy risk metrics...
                </p>
              </div>
            ) : currentReport ? (
              <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6">
                {/* Report Header */}
                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slate-800 pb-4">
                  <div>
                    <div className="flex items-center gap-2 text-indigo-400 text-xs font-semibold tracking-wider uppercase mb-1">
                      <Sparkles className="w-3.5 h-3.5" />
                      AI-Generated Audit Report
                    </div>
                    <h2 className="text-xl font-bold text-white">
                      Disclosure Audit: {MOCK_FILINGS.find(f => f.id === currentReport.filingId)?.ticker}
                    </h2>
                  </div>

                  <div className="flex items-center gap-3 bg-slate-950 border border-slate-800 rounded-lg px-4 py-2">
                    <div className="text-right">
                      <div className="text-[10px] text-slate-500 uppercase">Regulatory Risk</div>
                      <div className="text-sm font-bold text-slate-200">{currentReport.regulatoryRiskScore}/100</div>
                    </div>
                    <div
                      className={`w-3 h-3 rounded-full ${
                        currentReport.regulatoryRiskScore > 75
                          ? 'bg-red-500'
                          : currentReport.regulatoryRiskScore > 40
                          ? 'bg-amber-500'
                          : 'bg-emerald-500'
                      }`}
                    />
                  </div>
                </div>

                {/* Summary */}
                <div>
                  <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                    Executive Summary
                  </h3>
                  <p className="text-sm text-slate-300 leading-relaxed bg-slate-950/40 p-4 rounded-lg border border-slate-900">
                    {currentReport.summary}
                  </p>
                </div>

                {/* Red Flags & Opportunities */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-red-400" />
                      Identified Red Flags
                    </h3>
                    <div className="space-y-2">
                      {currentReport.redFlags.map((flag, idx) => (
                        <div key={idx} className="p-3 bg-red-950/20 border border-red-900/30 rounded-lg flex gap-2.5">
                          <span
                            className={`px-1.5 py-0.5 rounded text-[9px] font-bold shrink-0 h-fit ${
                              flag.severity === 'High'
                                ? 'bg-red-900 text-red-200'
                                : flag.severity === 'Medium'
                                ? 'bg-amber-900 text-amber-200'
                                : 'bg-slate-800 text-slate-300'
                            }`}
                          >
                            {flag.severity}
                          </span>
                          <p className="text-xs text-slate-300">{flag.description}</p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                      <CheckCircle className="w-4 h-4 text-emerald-400" />
                      Strategic Opportunities
                    </h3>
                    <div className="space-y-2">
                      {currentReport.opportunities.map((opp, idx) => (
                        <div key={idx} className="p-3 bg-emerald-950/20 border border-emerald-900/30 rounded-lg flex gap-2">
                          <Check className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                          <p className="text-xs text-slate-300">{opp}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                {/* Accounting Policies & Insider Sentiment */}
                <div className="space-y-4 border-t border-slate-800 pt-6">
                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Accounting Policies & GAAP Compliance Audit
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded border border-slate-900">
                      {currentReport.accountingPoliciesAudit}
                    </p>
                  </div>

                  <div>
                    <h3 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
                      Insider Sentiment Correlation
                    </h3>
                    <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 p-3 rounded border border-slate-900">
                      {currentReport.insiderSentimentAnalysis}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="bg-slate-900/20 border border-slate-800 rounded-xl p-12 text-center text-slate-500 h-full min-h-[400px] flex flex-col items-center justify-center">
                <Cpu className="w-12 h-12 text-slate-700 mb-3" />
                <h3 className="text-base font-bold text-slate-400 mb-1">No Audit Report Loaded</h3>
                <p className="text-xs text-slate-500 max-w-xs">
                  Select a filing from the left panel and click "Generate AI Audit Report" to run deep regulatory analysis.
                </p>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}