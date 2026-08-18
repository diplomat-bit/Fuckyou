import React, { useState, useMemo, useEffect, useRef } from 'react';
import {
  FileText,
  Search,
  Building2,
  TrendingUp,
  AlertTriangle,
  CheckCircle2,
  GitCompare,
  Layers,
  Download,
  Bookmark,
  Sparkles,
  Filter,
  Clock,
  ArrowUpRight,
  ArrowDownRight,
  Eye,
  BookOpen,
  BarChart3,
  PieChart,
  ShieldAlert,
  DollarSign,
  Calendar,
  ChevronRight,
  ChevronDown,
  Hash,
  ExternalLink,
  RefreshCw,
  Cpu,
  Zap,
  SplitSquareVertical,
  Activity,
  Maximize2,
  FileCheck,
  UserCheck,
  Briefcase
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export type SecFormType = '10-K' | '10-Q' | '8-K' | 'DEF 14A' | 'Form 4' | '13F';

export interface SecFilingSummary {
  id: string;
  ticker: string;
  companyName: string;
  cik: string;
  formType: SecFormType;
  fiscalPeriod: string;
  filingDate: string;
  reportDate: string;
  sizeBytes: string;
  auditor: string;
  auditorOpinion: 'Unqualified' | 'Qualified' | 'Adverse';
  aiRiskScore: number; // 0 - 100
  sentimentScore: number; // -1.0 to 1.0
  wordCount: number;
  highlightSummary: string;
  itemsCovered: string[];
}

export interface FilingSection {
  id: string;
  itemKey: string;
  title: string;
  category: 'Overview' | 'Risk' | 'Financial' | 'Governance' | 'Operations';
  content: string;
  subsections?: { title: string; content: string }[];
  aiNotes?: string[];
  riskTags?: string[];
}

export interface XbrlMetric {
  tag: string;
  name: string;
  fy2022: number;
  fy2023: number;
  fy2024: number;
  unit: string;
  category: 'Income' | 'Balance' | 'CashFlow' | 'KPI';
}

export interface RiskDeltaItem {
  category: string;
  title: string;
  type: 'NEW' | 'MODIFIED' | 'REMOVED' | 'UNCHANGED';
  deltaSummary: string;
  severity: 'HIGH' | 'MEDIUM' | 'LOW';
  confidenceScore: number;
}

export interface InsiderTransaction {
  id: string;
  reportingOwner: string;
  officerTitle: string;
  transactionDate: string;
  transactionCode: 'P (Purchase)' | 'S (Sale)' | 'M (Option Exercise)' | 'A (Grant)';
  shares: number;
  pricePerShare: number;
  totalValue: number;
  sharesOwnedFollowing: number;
}

// --- MOCK DATABASE ---
const MOCK_COMPANIES = [
  { ticker: 'NVDA', name: 'NVIDIA Corporation', cik: '0001045810', industry: 'Semiconductors' },
  { ticker: 'AAPL', name: 'Apple Inc.', cik: '0000320193', industry: 'Consumer Electronics' },
  { ticker: 'MSFT', name: 'Microsoft Corporation', cik: '0000789019', industry: 'Cloud & Software' },
  { ticker: 'AMZN', name: 'Amazon.com Inc.', cik: '0001018724', industry: 'E-Commerce & Cloud' },
  { ticker: 'TSLA', name: 'Tesla, Inc.', cik: '0001318605', industry: 'Automotive & Clean Energy' }
];

const MOCK_FILINGS: SecFilingSummary[] = [
  {
    id: 'nvda-10k-2024',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    cik: '0001045810',
    formType: '10-K',
    fiscalPeriod: 'FY 2024 (Annual)',
    filingDate: '2024-02-21',
    reportDate: '2024-01-28',
    sizeBytes: '14.2 MB',
    auditor: 'PricewaterhouseCoopers LLP',
    auditorOpinion: 'Unqualified',
    aiRiskScore: 42,
    sentimentScore: 0.78,
    wordCount: 88450,
    highlightSummary: 'Massive Compute & Networking segment expansion driven by generative AI acceleration. Supply chain concentration risks highlighted regarding specialized packaging (CoWoS).',
    itemsCovered: ['Item 1. Business', 'Item 1A. Risk Factors', 'Item 7. MD&A', 'Item 8. Financial Statements']
  },
  {
    id: 'nvda-10q-q3-2024',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    cik: '0001045810',
    formType: '10-Q',
    fiscalPeriod: 'Q3 2025',
    filingDate: '2024-11-20',
    reportDate: '2024-10-27',
    sizeBytes: '5.8 MB',
    auditor: 'PricewaterhouseCoopers LLP',
    auditorOpinion: 'Unqualified',
    aiRiskScore: 38,
    sentimentScore: 0.84,
    wordCount: 34120,
    highlightSummary: 'Data Center quarterly revenue surpassed $30.8B. Detailed export control constraints and updated licensing requirements for specified high-performance architectures.',
    itemsCovered: ['Part I - Item 1. Financials', 'Part I - Item 2. MD&A', 'Part II - Item 1A. Risk Factors']
  },
  {
    id: 'nvda-8k-2024-10',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    cik: '0001045810',
    formType: '8-K',
    fiscalPeriod: 'Current Event',
    filingDate: '2024-10-15',
    reportDate: '2024-10-14',
    sizeBytes: '420 KB',
    auditor: 'PricewaterhouseCoopers LLP',
    auditorOpinion: 'Unqualified',
    aiRiskScore: 18,
    sentimentScore: 0.65,
    wordCount: 2150,
    highlightSummary: 'Entry into a Material Definitive Agreement: Expansion of multi-year strategic enterprise AI cloud compute consortium.',
    itemsCovered: ['Item 1.01 Entry into Material Agreement', 'Item 9.01 Financial Exhibits']
  },
  {
    id: 'nvda-form4-2024-11',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    cik: '0001045810',
    formType: 'Form 4',
    fiscalPeriod: 'Ownership',
    filingDate: '2024-11-12',
    reportDate: '2024-11-10',
    sizeBytes: '84 KB',
    auditor: 'N/A',
    auditorOpinion: 'Unqualified',
    aiRiskScore: 12,
    sentimentScore: 0.10,
    wordCount: 940,
    highlightSummary: 'Scheduled Rule 10b5-1 executive trading plan execution by Chief Financial Officer.',
    itemsCovered: ['Table I - Non-Derivative Securities Beneficially Owned']
  },
  {
    id: 'aapl-10k-2024',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    cik: '0000320193',
    formType: '10-K',
    fiscalPeriod: 'FY 2024 (Annual)',
    filingDate: '2024-10-31',
    reportDate: '2024-09-28',
    sizeBytes: '11.4 MB',
    auditor: 'Ernst & Young LLP',
    auditorOpinion: 'Unqualified',
    aiRiskScore: 28,
    sentimentScore: 0.62,
    wordCount: 74200,
    highlightSummary: 'Services revenue hit all-time record. Disclosures reflect ongoing DMA compliance in the EU and regulatory scrutiny on App Store commission structures.',
    itemsCovered: ['Item 1. Business', 'Item 1A. Risk Factors', 'Item 7. MD&A', 'Item 8. Financial Statements']
  },
  {
    id: 'msft-10k-2024',
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    cik: '0000789019',
    formType: '10-K',
    fiscalPeriod: 'FY 2024 (Annual)',
    filingDate: '2024-07-30',
    reportDate: '2024-06-30',
    sizeBytes: '12.8 MB',
    auditor: 'Deloitte & Touche LLP',
    auditorOpinion: 'Unqualified',
    aiRiskScore: 31,
    sentimentScore: 0.75,
    wordCount: 82100,
    highlightSummary: 'Intelligent Cloud segment grew 20% YoY. Expanded disclosure on AI capital expenditures, power grid availability, and infrastructure depreciation schedules.',
    itemsCovered: ['Item 1. Business', 'Item 1A. Risk Factors', 'Item 7. MD&A', 'Item 8. Financial Statements']
  }
];

const MOCK_SECTIONS: FilingSection[] = [
  {
    id: 'item-1',
    itemKey: 'Item 1',
    title: 'Business',
    category: 'Overview',
    content: `NVIDIA pioneered accelerated computing to tackle challenges that ordinary computers cannot solve. Our invention of the GPU in 1999 sparked the growth of the PC gaming market, redefined computer graphics, and ignited the era of modern AI. 

We specialize in markets where our hardware, software, and networking scale to meet extraordinary computational complexity. Our operations comprise two primary reporting segments:
1. Compute & Networking: Includes our Data Center accelerated computing platforms, quantum computing simulations, enterprise AI software architectures (NVIDIA AI Enterprise), and high-throughput networking platforms (Quantum InfiniBand and Spectrum-X Ethernet).
2. Graphics: Includes GeForce GPUs for gaming and streaming, GeForce NOW game streaming service, Quadro/NVIDIA RTX GPUs for enterprise design, and automotive cockpit systems.

Our full-stack approach combines processors, systems, interconnects, acceleration libraries, and domain-specific SDKs to maximize efficiency across hyperscale cloud providers, enterprise data centers, and sovereign AI clusters.`
  },
  {
    id: 'item-1a',
    itemKey: 'Item 1A',
    title: 'Risk Factors',
    category: 'Risk',
    riskTags: ['Export Restrictions', 'Foundry Dependency', 'Hyperscaler Concentration', 'Geopolitical'],
    aiNotes: [
      'Identified +340 words regarding advanced packaging (CoWoS) lead times.',
      'Revised geopolitical risk language regarding East Asia supply chain concentration.',
      'New clause regarding evolving energy consumption standards for enterprise data centers.'
    ],
    content: `Our operations and financial performance are subject to diverse risks, including but not limited to the following key considerations:

1. Geopolitical Uncertainties and Trade Restrictions:
The U.S. government has enacted export controls impacting high-performance integrated circuits, including our A100, H100, A800, and H800 architectures destined for certain geographic jurisdictions. Any further expansion of licensing constraints, threshold revisions, or retaliatory tariffs could materially impair Data Center revenue and disrupt our product development roadmap.

2. Manufacturing and Advanced Packaging Reliance:
We rely on third-party foundries, predominantly Taiwan Semiconductor Manufacturing Company (TSMC), for wafer fabrication, advanced wafer-level packaging (such as Chip-on-Wafer-on-Substrate / CoWoS), and testing. Any capacity bottleneck, natural disaster, power outage, or geopolitical escalation impacting these key facilities would severely hinder our ability to fulfill surging customer demand.

3. Concentration of Large Hyperscale Customers:
A significant percentage of our Compute & Networking revenue is concentrated among a select group of hyperscale cloud service providers. Changes in their capital expenditure cycles, custom silicon initiatives (ASIC development), or procurement schedules could lead to significant volatility in quarterly operating results.`
  },
  {
    id: 'item-7',
    itemKey: 'Item 7',
    title: "Management's Discussion & Analysis (MD&A)",
    category: 'Operations',
    aiNotes: [
      'Gross margin expanded to 72.7% from 56.9% in prior fiscal year.',
      'R&D expenditure grew 18% YoY reflecting next-gen Blackwell architecture tape-outs.'
    ],
    content: `Overview of Financial Performance:
Fiscal Year 2024 revenue surged 126% to $60.92 billion, compared to $26.97 billion in Fiscal Year 2023. This exponential expansion was driven primarily by our Data Center platform, which recorded revenue of $47.53 billion, up 217% year-over-year.

Gross Margin:
Gross margin for FY 2024 increased to 72.7% from 56.9% in FY 2023, reflecting favorable product mix toward high-margin Data Center architectures and lower component inventory write-downs compared to the prior fiscal year.

Operating Expenses:
Research and development expenses totaled $8.68 billion, up 18%, driven by increased compensation costs and compute infrastructure investments to support next-generation architectures (including Blackwell and future generative AI platforms). Sales, general, and administrative expenses increased to $2.65 billion.

Liquidity and Capital Resources:
Cash, cash equivalents, and marketable securities totaled $25.98 billion at the close of Fiscal Year 2024. We generated $28.09 billion in cash flow from operations, reflecting robust working capital velocity and cash collections.`
  },
  {
    id: 'item-8',
    itemKey: 'Item 8',
    title: 'Financial Statements & Supplementary Data',
    category: 'Financial',
    content: `CONSOLIDATED STATEMENTS OF INCOME (in millions, except per share data):
- Revenue: $60,922 (FY24) | $26,974 (FY23) | $26,914 (FY22)
- Cost of Revenue: $16,621 (FY24) | $11,618 (FY23) | $9,439 (FY22)
- Gross Profit: $44,301 (FY24) | $15,356 (FY23) | $17,475 (FY22)
- Operating Expenses (R&D + SG&A): $11,329 (FY24) | $11,132 (FY23) | $7,432 (FY22)
- Operating Income: $32,972 (FY24) | $4,224 (FY23) | $10,043 (FY22)
- Net Income: $29,760 (FY24) | $4,368 (FY23) | $9,752 (FY22)
- Diluted Earnings Per Share: $11.93 (FY24) | $1.74 (FY23) | $3.85 (FY22)`
  },
  {
    id: 'item-9a',
    itemKey: 'Item 9A',
    title: 'Controls and Procedures',
    category: 'Governance',
    content: `Evaluation of Disclosure Controls and Procedures:
Under the supervision and with the participation of our management, including our Chief Executive Officer and Chief Financial Officer, we evaluated the effectiveness of our disclosure controls and procedures (as defined in Rules 13a-15(e) and 15d-15(e) under the Exchange Act) as of January 28, 2024. Based on this evaluation, our CEO and CFO concluded that our disclosure controls and procedures were effective at reasonable assurance levels.`
  }
];

const MOCK_XBRL_METRICS: XbrlMetric[] = [
  { tag: 'us-gaap:Revenues', name: 'Total Revenue', fy2022: 26914, fy2023: 26974, fy2024: 60922, unit: '$ Millions', category: 'Income' },
  { tag: 'us-gaap:GrossProfit', name: 'Gross Profit', fy2022: 17475, fy2023: 15356, fy2024: 44301, unit: '$ Millions', category: 'Income' },
  { tag: 'us-gaap:OperatingIncomeLoss', name: 'Operating Income', fy2022: 10043, fy2023: 4224, fy2024: 32972, unit: '$ Millions', category: 'Income' },
  { tag: 'us-gaap:NetIncomeLoss', name: 'Net Income', fy2022: 9752, fy2023: 4368, fy2024: 29760, unit: '$ Millions', category: 'Income' },
  { tag: 'us-gaap:CashAndCashEquivalentsAtCarryingValue', name: 'Cash & Short-term Investments', fy2022: 19901, fy2023: 13296, fy2024: 25984, unit: '$ Millions', category: 'Balance' },
  { tag: 'us-gaap:AssetsCurrent', name: 'Total Current Assets', fy2022: 28829, fy2023: 23073, fy2024: 44345, unit: '$ Millions', category: 'Balance' },
  { tag: 'us-gaap:StockholdersEquity', name: 'Total Stockholders Equity', fy2022: 26612, fy2023: 22101, fy2024: 42978, unit: '$ Millions', category: 'Balance' },
  { tag: 'us-gaap:NetCashProvidedByUsedInOperatingActivities', name: 'Operating Cash Flow', fy2022: 11079, fy2023: 5641, fy2024: 28090, unit: '$ Millions', category: 'CashFlow' },
  { tag: 'custom:GrossMarginPercent', name: 'Gross Margin %', fy2022: 64.9, fy2023: 56.9, fy2024: 72.7, unit: '%', category: 'KPI' },
  { tag: 'custom:DataCenterRevenue', name: 'Data Center Segment Revenue', fy2022: 10613, fy2023: 15005, fy2024: 47530, unit: '$ Millions', category: 'KPI' }
];

const MOCK_RISK_DELTAS: RiskDeltaItem[] = [
  {
    category: 'Supply Chain & Manufacturing',
    title: 'Advanced Packaging (CoWoS) Capacity Allocation',
    type: 'NEW',
    deltaSummary: 'Added dedicated disclosure regarding specialized packaging substrate availability and single-vendor constraints.',
    severity: 'HIGH',
    confidenceScore: 96
  },
  {
    category: 'Regulatory & Geopolitical',
    title: 'Export Control Licensing Thresholds',
    type: 'MODIFIED',
    deltaSummary: 'Expanded scope of jurisdictions affected by updated Bureau of Industry and Security (BIS) compute-density rules.',
    severity: 'HIGH',
    confidenceScore: 98
  },
  {
    category: 'Customer Concentration',
    title: 'Hyperscale Custom Silicon (In-house ASICs)',
    type: 'MODIFIED',
    deltaSummary: 'Elevated threat level of hyperscale clients designing proprietary workload accelerators.',
    severity: 'MEDIUM',
    confidenceScore: 91
  },
  {
    category: 'Cryptocurrency Volatility',
    title: 'Mining GPU Demand Fluctuation',
    type: 'REMOVED',
    deltaSummary: 'De-emphasized references to crypto-mining cyclical spikes due to transition to proof-of-stake algorithms.',
    severity: 'LOW',
    confidenceScore: 94
  }
];

const MOCK_INSIDER_TRADES: InsiderTransaction[] = [
  {
    id: 'tx-1',
    reportingOwner: 'Huang Jen-Hsun',
    officerTitle: 'President and CEO',
    transactionDate: '2024-11-08',
    transactionCode: 'S (Sale)',
    shares: 120000,
    pricePerShare: 145.20,
    totalValue: 17424000,
    sharesOwnedFollowing: 75400000
  },
  {
    id: 'tx-2',
    reportingOwner: 'Kress Colette',
    officerTitle: 'EVP & Chief Financial Officer',
    transactionDate: '2024-10-28',
    transactionCode: 'S (Sale)',
    shares: 30000,
    pricePerShare: 141.50,
    totalValue: 4245000,
    sharesOwnedFollowing: 3624000
  },
  {
    id: 'tx-3',
    reportingOwner: 'Shoquist Debora C.',
    officerTitle: 'EVP, Operations',
    transactionDate: '2024-10-15',
    transactionCode: 'M (Option Exercise)',
    shares: 25000,
    pricePerShare: 12.50,
    totalValue: 312500,
    sharesOwnedFollowing: 1845000
  }
];

export default function Pipeline33_SecFilingViewer() {
  // --- STATE ---
  const [selectedTicker, setSelectedTicker] = useState<string>('NVDA');
  const [selectedFilingId, setSelectedFilingId] = useState<string>('nvda-10k-2024');
  const [activeSectionId, setActiveSectionId] = useState<string>('item-1a');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [activeTab, setActiveTab] = useState<'content' | 'xbrl' | 'risks' | 'insider' | 'aiSummary'>('content');
  const [filterFormType, setFilterFormType] = useState<string>('ALL');
  const [isDiffMode, setIsDiffMode] = useState<boolean>(false);
  const [bookmarkedFilings, setBookmarkedFilings] = useState<string[]>(['nvda-10k-2024']);
  const [highlightKeyword, setHighlightKeyword] = useState<string>('packaging');
  const [isAiSynthesizing, setIsAiSynthesizing] = useState<boolean>(false);
  const [aiCustomPrompt, setAiCustomPrompt] = useState<string>('');
  const [aiCustomResponse, setAiCustomResponse] = useState<string | null>(null);

  // Active filing derivation
  const activeFiling = useMemo(() => {
    return MOCK_FILINGS.find(f => f.id === selectedFilingId) || MOCK_FILINGS[0];
  }, [selectedFilingId]);

  // Filtered filings list
  const filteredFilings = useMemo(() => {
    return MOCK_FILINGS.filter(f => {
      const matchTicker = f.ticker === selectedTicker;
      const matchType = filterFormType === 'ALL' || f.formType === filterFormType;
      return matchTicker && matchType;
    });
  }, [selectedTicker, filterFormType]);

  // Active section derivation
  const activeSection = useMemo(() => {
    return MOCK_SECTIONS.find(s => s.id === activeSectionId) || MOCK_SECTIONS[0];
  }, [activeSectionId]);

  // Toggle bookmark
  const toggleBookmark = (id: string) => {
    setBookmarkedFilings(prev => 
      prev.includes(id) ? prev.filter(x => x !== id) : [...prev, id]
    );
  };

  // AI Prompt handler
  const handleAiAsk = () => {
    if (!aiCustomPrompt.trim()) return;
    setIsAiSynthesizing(true);
    setTimeout(() => {
      setIsAiSynthesizing(false);
      setAiCustomResponse(
        `[SEC Extraction Model v4.8 Analysis for ${activeFiling.ticker} (${activeFiling.formType})]\n\nQuery: "${aiCustomPrompt}"\n\nResult:\nBased on ${activeFiling.fiscalPeriod} disclosures (Item 1A and Item 7 MD&A), the filing indicates high sensitivity to cross-border compute trade regulations, with direct material references in Note 14 (Contingencies). Gross margins improved to 72.7% primarily via Data Center SKU mix acceleration.`
      );
    }, 900);
  };

  // Highlight helper in text content
  const renderHighlightedContent = (text: string, highlight: string) => {
    if (!highlight.trim()) return text;
    const regex = new RegExp(`(${highlight})`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => 
      regex.test(part) ? (
        <mark key={i} className="bg-amber-400/30 text-amber-200 px-1 py-0.5 rounded font-medium border border-amber-500/40">
          {part}
        </mark>
      ) : (
        part
      )
    );
  };

  return (
    <div className="flex flex-col h-screen w-full bg-slate-950 text-slate-100 font-sans overflow-hidden">
      {/* ── TOP HEADER / TICKER BAR ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-slate-800 bg-slate-900/90 backdrop-blur shrink-0">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 p-2 rounded-lg text-slate-950">
            <FileCheck className="w-5 h-5 font-bold" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs font-mono uppercase tracking-widest text-cyan-400 bg-cyan-950/60 px-2 py-0.5 rounded border border-cyan-800/60">
                Pipeline #33
              </span>
              <h1 className="text-lg font-bold text-white tracking-tight">
                SEC EDGAR Filing Viewer & NLP Synthesizer
              </h1>
            </div>
            <p className="text-xs text-slate-400">
              Interactive XBRL parsing, Item 1A delta redlining & sentiment decomposition
            </p>
          </div>
        </div>

        {/* Company Quick-Select Bar */}
        <div className="flex items-center space-x-2 bg-slate-950/80 p-1 rounded-lg border border-slate-800">
          <Building2 className="w-4 h-4 text-slate-400 ml-2" />
          {MOCK_COMPANIES.map(comp => (
            <button
              key={comp.ticker}
              onClick={() => {
                setSelectedTicker(comp.ticker);
                const firstForTicker = MOCK_FILINGS.find(f => f.ticker === comp.ticker);
                if (firstForTicker) setSelectedFilingId(firstForTicker.id);
              }}
              className={`px-3 py-1 text-xs font-semibold rounded-md transition-all ${
                selectedTicker === comp.ticker
                  ? 'bg-cyan-600 text-white shadow-md shadow-cyan-950'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-850'
              }`}
            >
              {comp.ticker}
            </button>
          ))}
        </div>

        {/* Global Controls / Status */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-2 text-xs bg-slate-900 border border-slate-800 px-3 py-1.5 rounded-md">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span className="text-slate-300 font-mono">EDGAR Feed: Live (SEC API v2)</span>
          </div>
          <button 
            onClick={() => toggleBookmark(activeFiling.id)}
            className={`p-2 rounded-md border transition-all ${
              bookmarkedFilings.includes(activeFiling.id)
                ? 'bg-amber-500/20 border-amber-500/50 text-amber-300'
                : 'border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
            title="Bookmark this filing"
          >
            <Bookmark className="w-4 h-4" />
          </button>
          <a
            href={`https://www.sec.gov/edgar/browse/?CIK=${activeFiling.cik}`}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center space-x-1 text-xs text-slate-300 hover:text-cyan-400 border border-slate-800 px-3 py-1.5 rounded-md bg-slate-900 transition-colors"
          >
            <span>Official EDGAR</span>
            <ExternalLink className="w-3.5 h-3.5 ml-1" />
          </a>
        </div>
      </header>

      {/* ── META SUMMARY BANNER ── */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-6 py-2.5 flex items-center justify-between text-xs shrink-0">
        <div className="flex items-center space-x-6">
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Company:</span>
            <span className="font-semibold text-slate-200">{activeFiling.companyName}</span>
            <span className="font-mono text-cyan-400 bg-cyan-950/40 px-1.5 py-0.5 rounded border border-cyan-800/40">
              CIK: {activeFiling.cik}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Form:</span>
            <span className="font-bold text-amber-300 bg-amber-950/40 px-2 py-0.5 rounded border border-amber-800/40 font-mono">
              {activeFiling.formType}
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Period:</span>
            <span className="text-slate-200 font-mono">{activeFiling.fiscalPeriod}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Filing Date:</span>
            <span className="text-slate-200 font-mono">{activeFiling.filingDate}</span>
          </div>
          <div className="flex items-center space-x-2">
            <span className="text-slate-400">Auditor Opinion:</span>
            <span className="flex items-center text-emerald-400">
              <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
              {activeFiling.auditorOpinion}
            </span>
          </div>
        </div>

        <div className="flex items-center space-x-5">
          <div className="flex items-center space-x-1.5">
            <ShieldAlert className="w-4 h-4 text-amber-400" />
            <span className="text-slate-400">AI Risk Score:</span>
            <span className={`font-mono font-bold ${activeFiling.aiRiskScore > 40 ? 'text-amber-400' : 'text-emerald-400'}`}>
              {activeFiling.aiRiskScore}/100
            </span>
          </div>
          <div className="flex items-center space-x-1.5">
            <TrendingUp className="w-4 h-4 text-cyan-400" />
            <span className="text-slate-400">Sentiment Tone:</span>
            <span className="font-mono font-bold text-cyan-300">
              +{activeFiling.sentimentScore.toFixed(2)} (Bullish/Expansive)
            </span>
          </div>
        </div>
      </div>

      {/* ── MAIN WORKSPACE ── */}
      <div className="flex flex-1 overflow-hidden">
        
        {/* ── LEFT PANE: Filing List & Document Sections (280px) ── */}
        <aside className="w-72 border-r border-slate-800 bg-slate-950 flex flex-col shrink-0">
          
          {/* Filings Selector header */}
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400">
                Filings Archive
              </span>
              <div className="flex space-x-1">
                {['ALL', '10-K', '10-Q', '8-K'].map(ft => (
                  <button
                    key={ft}
                    onClick={() => setFilterFormType(ft)}
                    className={`px-1.5 py-0.5 text-[10px] rounded font-mono ${
                      filterFormType === ft
                        ? 'bg-slate-700 text-cyan-300 font-bold'
                        : 'text-slate-500 hover:text-slate-300'
                    }`}
                  >
                    {ft}
                  </button>
                ))}
              </div>
            </div>

            <div className="space-y-1.5 max-h-48 overflow-y-auto pr-1">
              {filteredFilings.map(filing => {
                const isSelected = filing.id === activeFiling.id;
                return (
                  <div
                    key={filing.id}
                    onClick={() => setSelectedFilingId(filing.id)}
                    className={`p-2 rounded-md cursor-pointer border text-xs transition-all ${
                      isSelected
                        ? 'bg-slate-900 border-cyan-500/60 shadow-sm'
                        : 'bg-slate-950 border-slate-800/80 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="font-bold text-slate-100 flex items-center">
                        <FileText className="w-3.5 h-3.5 mr-1 text-cyan-400" />
                        {filing.formType}
                      </span>
                      <span className="font-mono text-[10px] text-slate-400">{filing.filingDate}</span>
                    </div>
                    <p className="text-[11px] text-slate-400 truncate">{filing.fiscalPeriod}</p>
                    <div className="flex items-center justify-between mt-1 text-[10px] text-slate-500">
                      <span>{filing.sizeBytes}</span>
                      <span className="text-emerald-400 font-mono">Audited</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Section Directory */}
          <div className="flex-1 flex flex-col overflow-hidden p-3">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center">
                <Layers className="w-3.5 h-3.5 mr-1 text-slate-400" />
                Table of Contents
              </span>
              <span className="text-[10px] text-slate-500">{MOCK_SECTIONS.length} items</span>
            </div>

            <div className="flex-1 overflow-y-auto space-y-1 pr-1">
              {MOCK_SECTIONS.map(sec => {
                const isActive = sec.id === activeSection.id;
                return (
                  <button
                    key={sec.id}
                    onClick={() => {
                      setActiveSectionId(sec.id);
                      setActiveTab('content');
                    }}
                    className={`w-full text-left p-2 rounded-md text-xs transition-all flex items-start justify-between ${
                      isActive
                        ? 'bg-cyan-950/50 border border-cyan-600/60 text-cyan-200'
                        : 'hover:bg-slate-900 border border-transparent text-slate-400 hover:text-slate-200'
                    }`}
                  >
                    <div>
                      <div className="font-semibold text-slate-200">{sec.itemKey}</div>
                      <div className="text-[11px] text-slate-400 leading-tight mt-0.5">{sec.title}</div>
                    </div>
                    {sec.riskTags && (
                      <span className="px-1.5 py-0.5 text-[9px] font-bold rounded bg-amber-950/80 text-amber-300 border border-amber-800">
                        {sec.riskTags.length} risks
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Bottom quick stats */}
          <div className="p-3 border-t border-slate-800 bg-slate-900/40 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Auditor:</span>
              <span className="text-slate-200 truncate ml-2">{activeFiling.auditor.split(' ')[0]}</span>
            </div>
            <div className="flex justify-between">
              <span>Total Words:</span>
              <span className="text-slate-200 font-mono">{activeFiling.wordCount.toLocaleString()}</span>
            </div>
          </div>
        </aside>

        {/* ── CENTER / RIGHT CONTENT VIEWER ── */}
        <main className="flex-1 flex flex-col bg-slate-950 overflow-hidden">
          
          {/* Navigation Tabs & In-Document Search */}
          <div className="border-b border-slate-800 bg-slate-900/70 px-4 py-2 flex items-center justify-between shrink-0">
            <div className="flex space-x-1">
              <button
                onClick={() => setActiveTab('content')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'content'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-3.5 h-3.5" />
                <span>Document View</span>
              </button>

              <button
                onClick={() => setActiveTab('xbrl')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'xbrl'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BarChart3 className="w-3.5 h-3.5" />
                <span>XBRL Financials</span>
              </button>

              <button
                onClick={() => setActiveTab('risks')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'risks'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <ShieldAlert className="w-3.5 h-3.5" />
                <span>Risk Redline Delta</span>
                <span className="bg-amber-500/20 text-amber-300 text-[10px] px-1 rounded-full font-mono">
                  {MOCK_RISK_DELTAS.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab('insider')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'insider'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <UserCheck className="w-3.5 h-3.5" />
                <span>Insider Activity</span>
              </button>

              <button
                onClick={() => setActiveTab('aiSummary')}
                className={`flex items-center space-x-1.5 px-3 py-1.5 text-xs font-semibold rounded-md transition-all ${
                  activeTab === 'aiSummary'
                    ? 'bg-cyan-600 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Sparkles className="w-3.5 h-3.5 text-cyan-300" />
                <span>AI Synthesis</span>
              </button>
            </div>

            {/* In-text keyword finder */}
            <div className="flex items-center space-x-2">
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Highlight keywords in filing..."
                  value={highlightKeyword}
                  onChange={(e) => setHighlightKeyword(e.target.value)}
                  className="w-56 bg-slate-950 border border-slate-800 rounded-md pl-8 pr-3 py-1 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                />
              </div>
              <button
                onClick={() => setIsDiffMode(!isDiffMode)}
                className={`px-2.5 py-1 text-xs font-mono rounded border flex items-center space-x-1 transition-all ${
                  isDiffMode 
                    ? 'bg-amber-950/60 border-amber-500 text-amber-300' 
                    : 'border-slate-800 text-slate-400 hover:text-slate-200'
                }`}
                title="Toggle YoY visual comparison view"
              >
                <GitCompare className="w-3.5 h-3.5" />
                <span>Diff Mode</span>
              </button>
            </div>
          </div>

          {/* Tab 1: DOCUMENT CONTENT VIEW */}
          {activeTab === 'content' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                
                {/* Header of the Active Section */}
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2 text-xs font-mono text-cyan-400 uppercase tracking-wider">
                    <span>{activeSection.category}</span>
                    <span>•</span>
                    <span>{activeSection.itemKey}</span>
                  </div>
                  <h2 className="text-2xl font-bold text-white mt-1">{activeSection.title}</h2>
                  
                  {/* Risk Tags if available */}
                  {activeSection.riskTags && (
                    <div className="flex flex-wrap gap-1.5 mt-3">
                      {activeSection.riskTags.map(tag => (
                        <span 
                          key={tag} 
                          onClick={() => setHighlightKeyword(tag.split(' ')[0].toLowerCase())}
                          className="cursor-pointer bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs px-2.5 py-0.5 rounded-full border border-slate-700 flex items-center"
                        >
                          <Hash className="w-3 h-3 mr-1 text-amber-400" />
                          {tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* AI Annotations callout */}
                {activeSection.aiNotes && activeSection.aiNotes.length > 0 && (
                  <div className="bg-cyan-950/30 border border-cyan-800/60 rounded-lg p-4 space-y-2">
                    <div className="flex items-center space-x-2 text-xs font-bold text-cyan-300 uppercase tracking-wider">
                      <Sparkles className="w-4 h-4 text-cyan-400" />
                      <span>SEC Copilot Section Insights</span>
                    </div>
                    <ul className="space-y-1.5">
                      {activeSection.aiNotes.map((note, idx) => (
                        <li key={idx} className="text-xs text-slate-300 flex items-start space-x-2">
                          <span className="text-cyan-400 font-bold">•</span>
                          <span>{note}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {/* Main Text Content Body */}
                <div className="bg-slate-900/40 border border-slate-800/80 rounded-lg p-6 font-serif text-slate-300 leading-relaxed text-sm whitespace-pre-line shadow-inner">
                  {renderHighlightedContent(activeSection.content, highlightKeyword)}
                </div>

                {/* Diff Redline View if enabled */}
                {isDiffMode && (
                  <div className="bg-slate-900 border border-amber-500/40 rounded-lg p-4 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-2 text-xs font-bold text-amber-300 uppercase">
                        <GitCompare className="w-4 h-4" />
                        <span>Year-Over-Year Redline Delta (vs. FY2023)</span>
                      </div>
                      <span className="text-[11px] text-slate-400 font-mono">Similarity Score: 87.4%</span>
                    </div>
                    <div className="p-3 bg-slate-950 rounded font-mono text-xs space-y-1">
                      <p className="text-red-400 bg-red-950/40 p-1 rounded line-through">
                        - [Prior Clause]: Export limitations were primarily constrained to A100 architectures with memory bandwidth limits of 600 GB/s.
                      </p>
                      <p className="text-emerald-400 bg-emerald-950/40 p-1 rounded">
                        + [New Added Clause]: Export controls now encompass broad total processing performance (TPP) metrics above 4800, directly affecting H800 and custom regional SKUs.
                      </p>
                    </div>
                  </div>
                )}

              </div>
            </div>
          )}

          {/* Tab 2: XBRL FINANCIALS */}
          {activeTab === 'xbrl' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-5xl mx-auto space-y-6">
                
                <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                  <div>
                    <h2 className="text-xl font-bold text-white">Extracted XBRL Standardized Financials</h2>
                    <p className="text-xs text-slate-400">
                      Standardized US-GAAP taxonomy mapped from 10-K interactive data exhibits.
                    </p>
                  </div>
                  <button 
                    onClick={() => alert('Exporting XBRL normalized model to CSV...')}
                    className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 text-xs px-3 py-1.5 rounded-md text-slate-200"
                  >
                    <Download className="w-3.5 h-3.5 text-cyan-400" />
                    <span>Export CSV</span>
                  </button>
                </div>

                {/* Financial Table */}
                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
                  <table className="w-full text-left text-xs border-collapse">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 font-mono uppercase text-[11px]">
                        <th className="p-3">US-GAAP XBRL Element</th>
                        <th className="p-3">Category</th>
                        <th className="p-3 text-right">FY 2022</th>
                        <th className="p-3 text-right">FY 2023</th>
                        <th className="p-3 text-right">FY 2024</th>
                        <th className="p-3 text-right">YoY Growth</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800 font-mono">
                      {MOCK_XBRL_METRICS.map(metric => {
                        const yoyGrowth = ((metric.fy2024 - metric.fy2023) / metric.fy2023) * 100;
                        const isPositive = yoyGrowth >= 0;
                        return (
                          <tr key={metric.tag} className="hover:bg-slate-850/60 transition-colors">
                            <td className="p-3">
                              <div className="font-semibold text-slate-200">{metric.name}</div>
                              <div className="text-[10px] text-slate-500 font-mono">{metric.tag}</div>
                            </td>
                            <td className="p-3">
                              <span className="px-2 py-0.5 rounded text-[10px] font-sans bg-slate-800 text-slate-300">
                                {metric.category}
                              </span>
                            </td>
                            <td className="p-3 text-right text-slate-400">
                              {metric.fy2022.toLocaleString()} {metric.unit === '%' ? '%' : ''}
                            </td>
                            <td className="p-3 text-right text-slate-300">
                              {metric.fy2023.toLocaleString()} {metric.unit === '%' ? '%' : ''}
                            </td>
                            <td className="p-3 text-right font-bold text-white">
                              {metric.fy2024.toLocaleString()} {metric.unit === '%' ? '%' : ''}
                            </td>
                            <td className="p-3 text-right">
                              <span className={`inline-flex items-center px-1.5 py-0.5 rounded text-[10px] ${
                                isPositive ? 'bg-emerald-950/60 text-emerald-300' : 'bg-red-950/60 text-red-300'
                              }`}>
                                {isPositive ? '+' : ''}{yoyGrowth.toFixed(1)}%
                              </span>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>

                {/* Visual Ratio breakdown */}
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 uppercase">Gross Margin Evolution</div>
                    <div className="text-2xl font-bold text-emerald-400 font-mono mt-1">72.7%</div>
                    <div className="text-[11px] text-slate-400 mt-1">Expanded +1,580 bps YoY</div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 uppercase">Data Center Mix</div>
                    <div className="text-2xl font-bold text-cyan-400 font-mono mt-1">78.0%</div>
                    <div className="text-[11px] text-slate-400 mt-1">$47.53B of total $60.92B revenue</div>
                  </div>
                  <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-lg">
                    <div className="text-xs text-slate-400 uppercase">Operating Cash Conversion</div>
                    <div className="text-2xl font-bold text-amber-400 font-mono mt-1">94.3%</div>
                    <div className="text-[11px] text-slate-400 mt-1">Operating Cash / Net Income</div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* Tab 3: RISK REDLINE DELTA */}
          {activeTab === 'risks' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="border-b border-slate-800 pb-4">
                  <h2 className="text-xl font-bold text-white">Item 1A Risk Factor Delta Radar</h2>
                  <p className="text-xs text-slate-400">
                    Automated NLP semantic comparison isolating new, modified, and omitted disclosures.
                  </p>
                </div>

                <div className="space-y-3">
                  {MOCK_RISK_DELTAS.map((risk, idx) => {
                    const badgeColor = 
                      risk.type === 'NEW' ? 'bg-red-950/80 text-red-300 border-red-800' :
                      risk.type === 'MODIFIED' ? 'bg-amber-950/80 text-amber-300 border-amber-800' :
                      'bg-slate-800 text-slate-400 border-slate-700';

                    return (
                      <div key={idx} className="p-4 bg-slate-900/60 border border-slate-800 rounded-lg space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-2">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${badgeColor}`}>
                              {risk.type}
                            </span>
                            <span className="text-xs font-semibold text-slate-400">{risk.category}</span>
                          </div>
                          <span className="text-xs font-mono text-cyan-400">Confidence: {risk.confidenceScore}%</span>
                        </div>
                        <h3 className="text-sm font-bold text-slate-100">{risk.title}</h3>
                        <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-3 rounded border border-slate-850">
                          {risk.deltaSummary}
                        </p>
                      </div>
                    );
                  })}
                </div>

              </div>
            </div>
          )}

          {/* Tab 4: INSIDER ACTIVITY (FORM 4s) */}
          {activeTab === 'insider' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-5xl mx-auto space-y-6">
                
                <div className="border-b border-slate-800 pb-4 flex justify-between items-center">
                  <div>
                    <h2 className="text-xl font-bold text-white">Beneficial Ownership & Insider Transactions</h2>
                    <p className="text-xs text-slate-400">
                      SEC Form 4 filings extracted for Key Executives and Board Members.
                    </p>
                  </div>
                  <span className="text-xs font-mono text-cyan-400 bg-cyan-950/40 px-2.5 py-1 rounded border border-cyan-800/40">
                    Rule 10b5-1 Monitored
                  </span>
                </div>

                <div className="border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
                  <table className="w-full text-left text-xs border-collapse font-mono">
                    <thead>
                      <tr className="bg-slate-900 border-b border-slate-800 text-slate-400 uppercase text-[11px] font-sans">
                        <th className="p-3">Reporting Insider</th>
                        <th className="p-3">Role / Title</th>
                        <th className="p-3">Date</th>
                        <th className="p-3">Tx Type</th>
                        <th className="p-3 text-right">Shares</th>
                        <th className="p-3 text-right">Price</th>
                        <th className="p-3 text-right">Total Value</th>
                        <th className="p-3 text-right">Remaining Shares</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800">
                      {MOCK_INSIDER_TRADES.map(trade => (
                        <tr key={trade.id} className="hover:bg-slate-850/60 transition-colors">
                          <td className="p-3 font-semibold text-white font-sans">{trade.reportingOwner}</td>
                          <td className="p-3 text-slate-400 font-sans">{trade.officerTitle}</td>
                          <td className="p-3 text-slate-300">{trade.transactionDate}</td>
                          <td className="p-3">
                            <span className="px-2 py-0.5 rounded text-[10px] bg-slate-800 text-amber-300 border border-slate-700">
                              {trade.transactionCode}
                            </span>
                          </td>
                          <td className="p-3 text-right text-slate-300">{trade.shares.toLocaleString()}</td>
                          <td className="p-3 text-right text-slate-300">${trade.pricePerShare.toFixed(2)}</td>
                          <td className="p-3 text-right font-bold text-white">
                            ${(trade.totalValue / 1e6).toFixed(2)}M
                          </td>
                          <td className="p-3 text-right text-slate-400">{trade.sharesOwnedFollowing.toLocaleString()}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

              </div>
            </div>
          )}

          {/* Tab 5: AI SYNTHESIS & QUERY */}
          {activeTab === 'aiSummary' && (
            <div className="flex-1 overflow-y-auto p-6 space-y-6">
              <div className="max-w-4xl mx-auto space-y-6">
                
                <div className="border-b border-slate-800 pb-4">
                  <div className="flex items-center space-x-2 text-cyan-400 text-xs font-mono uppercase">
                    <Sparkles className="w-4 h-4" />
                    <span>Automated Filing Synthesis</span>
                  </div>
                  <h2 className="text-xl font-bold text-white mt-1">AI Executive Briefing</h2>
                  <p className="text-xs text-slate-400">
                    Comprehensive synthesis of disclosures, management tone, guidance nuances, and footnoted commitments.
                  </p>
                </div>

                {/* Overall Filing AI Summary Card */}
                <div className="bg-slate-900/60 border border-slate-800 rounded-lg p-5 space-y-4">
                  <h3 className="text-sm font-bold text-slate-200 flex items-center">
                    <Activity className="w-4 h-4 mr-2 text-cyan-400" />
                    Key Executive Highlights for {activeFiling.fiscalPeriod}
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed font-sans">
                    {activeFiling.highlightSummary}
                  </p>
                </div>

                {/* Ask AI interactive Prompt */}
                <div className="bg-slate-900 border border-cyan-800/40 rounded-lg p-5 space-y-4">
                  <div className="flex items-center justify-between">
                    <h3 className="text-sm font-bold text-cyan-300 flex items-center">
                      <Cpu className="w-4 h-4 mr-2 text-cyan-400" />
                      Ask Questions on {activeFiling.ticker} ({activeFiling.formType})
                    </h3>
                    <span className="text-[10px] text-slate-400 font-mono">Model: FinancialNLP-v4.8</span>
                  </div>

                  <div className="flex space-x-2">
                    <input
                      type="text"
                      placeholder="e.g. Extract contractual purchase commitments or supplier concentration numbers..."
                      value={aiCustomPrompt}
                      onChange={(e) => setAiCustomPrompt(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAiAsk()}
                      className="flex-1 bg-slate-950 border border-slate-700 rounded-md px-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-cyan-500"
                    />
                    <button
                      onClick={handleAiAsk}
                      disabled={isAiSynthesizing}
                      className="bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-semibold px-4 py-2 rounded-md flex items-center space-x-1.5 transition-all disabled:opacity-50"
                    >
                      {isAiSynthesizing ? (
                        <>
                          <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                          <span>Analyzing...</span>
                        </>
                      ) : (
                        <>
                          <Zap className="w-3.5 h-3.5" />
                          <span>Synthesize</span>
                        </>
                      )}
                    </button>
                  </div>

                  {/* AI Response output */}
                  {aiCustomResponse && (
                    <div className="bg-slate-950 p-4 rounded-md border border-cyan-900/60 font-mono text-xs text-cyan-200 whitespace-pre-line leading-relaxed">
                      {aiCustomResponse}
                    </div>
                  )}

                  {/* Suggested Queries */}
                  <div className="flex flex-wrap gap-2 pt-2">
                    <span className="text-[11px] text-slate-400">Suggested queries:</span>
                    {[
                      'Summarize TSMC foundry concentration',
                      'What are the stock buyback authorizations?',
                      'Break down R&D headcount vs Capex'
                    ].map((sug, i) => (
                      <button
                        key={i}
                        onClick={() => {
                          setAiCustomPrompt(sug);
                        }}
                        className="text-[11px] bg-slate-800 hover:bg-slate-700 text-slate-300 px-2 py-0.5 rounded border border-slate-700 transition-colors"
                      >
                        {sug}
                      </button>
                    ))}
                  </div>
                </div>

              </div>
            </div>
          )}

        </main>
      </div>

      {/* ── BOTTOM FOOTER ── */}
      <footer className="h-8 border-t border-slate-800 bg-slate-950 px-6 flex items-center justify-between text-[11px] text-slate-500 shrink-0 font-mono">
        <div className="flex items-center space-x-4">
          <span>SEC Form: {activeFiling.formType} ({activeFiling.ticker})</span>
          <span>•</span>
          <span>Accession: 0001045810-24-000029</span>
          <span>•</span>
          <span>XBRL Validated</span>
        </div>
        <div className="flex items-center space-x-3">
          <span>Pipeline 33 • SEC Filing Analytics Engine</span>
          <span>Latency: 28ms</span>
        </div>
      </footer>
    </div>
  );
}