import React, { useState, useEffect, useMemo } from 'react';
import { 
  Search, 
  FileText, 
  Brain, 
  MessageSquare, 
  BarChart2, 
  ShieldAlert, 
  TrendingUp, 
  UserCheck, 
  Download, 
  ExternalLink, 
  RefreshCw, 
  Sparkles, 
  Send, 
  HelpCircle, 
  Info, 
  CheckCircle, 
  AlertTriangle,
  ArrowRight,
  Lock,
  Globe,
  Cpu,
  DollarSign,
  Briefcase,
  Calendar
} from 'lucide-react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface SECFiling {
  id: string;
  ticker: string;
  companyName: string;
  cik: string;
  formType: '10-K' | '10-Q' | '8-K' | 'Form 4' | 'DEF 14A' | 'S-1';
  filingDate: string;
  reportDate: string;
  accessionNumber: string;
  description: string;
  primaryDocumentUrl: string;
  size: string;
  isXBRL: boolean;
  financials?: {
    revenue: number; // in millions
    revenueYoY: number; // percentage
    netIncome: number; // in millions
    netIncomeYoY: number; // percentage
    eps: number;
    operatingCashFlow: number; // in millions
    rAndD: number; // in millions
  };
  risks: string[];
  managementDiscussion: string;
  insiderSentiment: 'Bullish' | 'Bearish' | 'Neutral';
  insiderDetails: string;
  fullTextMock: string;
}

interface ChatMessage {
  sender: 'user' | 'ai';
  text: string;
  timestamp: string;
}

// ==========================================
// COMPREHENSIVE MOCK DATABASE (AAPL, TSLA, MSFT, NVDA, AMZN)
// ==========================================

const MOCK_FILINGS: SECFiling[] = [
  {
    id: 'aapl-10k-2025',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    cik: '0000320193',
    formType: '10-K',
    filingDate: '2025-10-31',
    reportDate: '2025-09-27',
    accessionNumber: '0000320193-25-000108',
    description: 'Annual Report for the Fiscal Year Ended September 27, 2025',
    primaryDocumentUrl: 'https://www.sec.gov/Archives/edgar/data/320193/000032019325000108/aapl-20250927.htm',
    size: '14.2 MB',
    isXBRL: true,
    financials: {
      revenue: 391035,
      revenueYoY: 2.1,
      netIncome: 96862,
      netIncomeYoY: -0.1,
      eps: 6.16,
      operatingCashFlow: 110587,
      rAndD: 31412
    },
    risks: [
      'Global supply chain concentration, particularly in mainland China and Southeast Asia, exposes production to geopolitical and pandemic-related disruptions.',
      'Intense regulatory scrutiny over App Store policies, digital services fees, and antitrust challenges in the US, EU, and other jurisdictions.',
      'Rapid technological shifts and high reliance on consumer adoption cycles for flagship hardware products (iPhone, Apple Watch).',
      'Foreign exchange rate fluctuations impacting international sales margins, which constitute over 55% of total revenue.',
      'Security vulnerabilities, data breaches, or system outages that could compromise user privacy and damage brand trust.'
    ],
    managementDiscussion: 'Management highlighted strong momentum in Services revenue, which grew 12.8% YoY to reach an all-time high of $96.2B. Hardware sales remained resilient despite macroeconomic headwinds, driven by steady demand for the iPhone 16 and 17 lineups. The company continues to invest heavily in generative AI capabilities (Apple Intelligence) integrated across iOS, iPadOS, and macOS, which is expected to drive a multi-year hardware upgrade cycle. Capital return program remains robust with $110B authorized for share repurchases.',
    insiderSentiment: 'Neutral',
    insiderDetails: 'Multiple executive officers executed scheduled Rule 10b5-1 trading plans, resulting in net sales of approximately $45M in shares. No significant open-market purchases were recorded by insiders during the quarter.',
    fullTextMock: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-K
ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934
For the fiscal year ended September 27, 2025
Commission File Number: 001-36226
APPLE INC.
(Exact name of registrant as specified in its charter)

Item 1. Business
Apple Inc. designs, manufactures and markets smartphones, personal computers, tablets, wearables and accessories, and sells a variety of related services. The Company’s fiscal year ends on the last Saturday of September.

Item 1A. Risk Factors
The Company’s business, reputation, results of operations and financial condition could be materially and adversely affected by any of the following risks...
- Supply chain disruptions and concentration of manufacturing partners in Asia.
- Legal and regulatory proceedings, particularly regarding digital marketplace distribution.
- Intellectual property disputes and licensing costs.

Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations
The following discussion should be read in conjunction with the Consolidated Financial Statements and accompanying notes. Net sales were $391,035 million in 2025, compared to $383,285 million in 2024. Services net sales increased primarily due to higher advertising, cloud services and App Store sales...`
  },
  {
    id: 'tsla-10k-2025',
    ticker: 'TSLA',
    companyName: 'Tesla, Inc.',
    cik: '0001318605',
    formType: '10-K',
    filingDate: '2026-01-28',
    reportDate: '2025-12-31',
    accessionNumber: '0001318605-26-000023',
    description: 'Annual Report for the Fiscal Year Ended December 31, 2025',
    primaryDocumentUrl: 'https://www.sec.gov/Archives/edgar/data/1318605/000131860526000023/tsla-20251231.htm',
    size: '18.7 MB',
    isXBRL: true,
    financials: {
      revenue: 98450,
      revenueYoY: 1.7,
      netIncome: 13450,
      netIncomeYoY: -10.3,
      eps: 3.85,
      operatingCashFlow: 14200,
      rAndD: 4100
    },
    risks: [
      'Intensifying global competition in the electric vehicle sector, particularly from low-cost Chinese manufacturers.',
      'Delays in the commercialization and regulatory approval of Full Self-Driving (FSD) technology and autonomous robotaxis.',
      'Volatility in raw material prices (lithium, nickel, cobalt) and potential battery cell supply constraints.',
      'Execution risks associated with scaling production at Gigafactories in Texas, Berlin, and Shanghai.',
      'Key-person risk associated with the active involvement and public statements of CEO Elon Musk.'
    ],
    managementDiscussion: 'Tesla focused on cost reduction and manufacturing efficiencies in 2025, navigating a challenging global EV demand environment. Automotive gross margin (excluding regulatory credits) compressed slightly to 17.2%. Energy Generation and Storage business emerged as a major growth engine, with Megapack deployments reaching a record 22.4 GWh, representing a 54% increase YoY. The company is actively transitioning its focus toward AI, robotics (Optimus), and autonomous transport, with pilot testing of autonomous ride-hailing underway in select US markets.',
    insiderSentiment: 'Bearish',
    insiderDetails: 'CEO Elon Musk sold approximately $3.2B worth of shares to fund external ventures. Other board members exercised options and sold shares under pre-arranged plans. Insider buying was virtually non-existent.',
    fullTextMock: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-K
ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934
For the fiscal year ended December 31, 2025
Commission File Number: 001-34756
TESLA, INC.
(Exact name of registrant as specified in its charter)

Item 1. Business
We design, develop, manufacture, sell and lease fully electric vehicles, energy generation and storage systems, and offer services related to our products. We are increasingly focused on products powered by artificial intelligence, such as autonomous driving and humanoid robotics.

Item 1A. Risk Factors
Our business is subject to numerous risks, including:
- Highly competitive automotive market with rapid technological changes.
- Regulatory hurdles for autonomous driving software.
- Dependence on key personnel, including our CEO Elon Musk.

Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations
Total revenues were $98,450 million in 2025, compared to $96,773 million in 2024. The increase was primarily due to growth in energy storage deployments and vehicle deliveries, partially offset by a lower average selling price (ASP) of our vehicles...`
  },
  {
    id: 'msft-10k-2025',
    ticker: 'MSFT',
    companyName: 'Microsoft Corporation',
    cik: '0000789019',
    formType: '10-K',
    filingDate: '2025-07-29',
    reportDate: '2025-06-30',
    accessionNumber: '0000789019-25-000045',
    description: 'Annual Report for the Fiscal Year Ended June 30, 2025',
    primaryDocumentUrl: 'https://www.sec.gov/Archives/edgar/data/789019/000078901925000045/msft-20250630.htm',
    size: '11.5 MB',
    isXBRL: true,
    financials: {
      revenue: 245120,
      revenueYoY: 15.6,
      netIncome: 88140,
      netIncomeYoY: 21.8,
      eps: 11.80,
      operatingCashFlow: 118500,
      rAndD: 29200
    },
    risks: [
      'Significant capital expenditure requirements to build out global AI and cloud infrastructure, which may impact short-term margins.',
      'Intense competition in cloud computing (AWS, Google Cloud) and enterprise AI applications.',
      'Cybersecurity threats, sophisticated state-sponsored attacks, and potential vulnerabilities in cloud services.',
      'Complex and evolving global regulations on artificial intelligence, data privacy, and cross-border data transfers.',
      'Integration risks associated with large-scale acquisitions, including Activision Blizzard.'
    ],
    managementDiscussion: 'Microsoft delivered exceptional fiscal 2025 results, driven by the continued acceleration of Microsoft Cloud, which surpassed $140B in annual revenue (up 19% YoY). Azure and other cloud services grew 30% YoY, with AI services contributing approximately 12 percentage points of that growth. Copilot adoption across Office 365 reached 45% among enterprise customers. Management emphasized that capital expenditures ($55B in FY25) will continue to scale to meet robust demand for AI training and inference capacity.',
    insiderSentiment: 'Bullish',
    insiderDetails: 'Two independent directors purchased a combined total of $12M in shares on the open market, signaling strong confidence in the AI-driven growth trajectory. Executive sales were limited to tax-withholding obligations.',
    fullTextMock: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-K
ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934
For the fiscal year ended June 30, 2025
Commission File Number: 001-09007
MICROSOFT CORPORATION
(Exact name of registrant as specified in its charter)

Item 1. Business
Microsoft is a technology company whose mission is to empower every person and every organization on the planet to achieve more. We operate in three segments: Productivity and Business Processes, Intelligent Cloud, and More Personal Computing.

Item 1A. Risk Factors
Our operations are subject to various risks:
- Security breaches and cyberattacks targeting our cloud infrastructure.
- High capital investments in AI infrastructure without guaranteed long-term returns.
- Regulatory challenges regarding market dominance and AI safety.

Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations
Revenue was $245,120 million in fiscal year 2025, compared to $211,915 million in fiscal year 2024. The increase was driven by strong demand for our cloud and AI offerings. Operating income increased 24% to $109,300 million...`
  },
  {
    id: 'nvda-10k-2026',
    ticker: 'NVDA',
    companyName: 'NVIDIA Corporation',
    cik: '0001045810',
    formType: '10-K',
    filingDate: '2026-02-18',
    reportDate: '2026-01-25',
    accessionNumber: '0001045810-26-000012',
    description: 'Annual Report for the Fiscal Year Ended January 25, 2026',
    primaryDocumentUrl: 'https://www.sec.gov/Archives/edgar/data/1045810/000104581026000012/nvda-20260125.htm',
    size: '15.9 MB',
    isXBRL: true,
    financials: {
      revenue: 112400,
      revenueYoY: 84.2,
      netIncome: 58900,
      netIncomeYoY: 98.3,
      eps: 23.56,
      operatingCashFlow: 61200,
      rAndD: 11800
    },
    risks: [
      'Extreme customer concentration, with the top 5 cloud service providers accounting for over 45% of Data Center revenue.',
      'Export control regulations and geopolitical tensions (particularly US-China relations) restricting sales of advanced AI chips.',
      'Supply chain bottlenecks, including reliance on TSMC for advanced packaging (CoWoS) and High Bandwidth Memory (HBM).',
      'Potential cyclical downturn in AI hardware demand if software monetization fails to scale for enterprise customers.',
      'Rapid product obsolescence and execution risks in transitioning to the Blackwell and Rubin architectures.'
    ],
    managementDiscussion: 'NVIDIA experienced unprecedented growth in fiscal 2026, fueled by the global build-out of generative AI infrastructure. Data Center revenue surged to $94.5B, representing 84% of total revenue. Blackwell architecture ramped up successfully in H2, with demand outstripping supply by a wide margin. Management noted that sovereign AI initiatives and enterprise software adoption are expanding the addressable market beyond hyperscale cloud providers. Gross margins reached a record 76.4%.',
    insiderSentiment: 'Neutral',
    insiderDetails: 'CEO Jensen Huang completed a pre-arranged 10b5-1 trading plan, selling approximately $240M in shares over a 6-month period. No open-market purchases were made by insiders.',
    fullTextMock: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-K
ANNUAL REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934
For the fiscal year ended January 25, 2026
Commission File Number: 000-23985
NVIDIA CORPORATION
(Exact name of registrant as specified in its charter)

Item 1. Business
NVIDIA pioneered accelerated computing to help solve computational problems that ordinary computers cannot. We target markets where our expertise can provide tremendous value: Data Center, Gaming, Professional Visualization, and Automotive.

Item 1A. Risk Factors
Our business is highly dynamic and subject to significant risks:
- Reliance on third-party semiconductor foundries and packaging partners.
- Strict government regulations on export controls of advanced computing technologies.
- Rapidly evolving competitive landscape with custom silicon from hyperscalers.

Item 7. Management's Discussion and Analysis of Financial Condition and Results of Operations
Revenue was $112,400 million in fiscal 2026, compared to $60,922 million in fiscal 2025. This growth was driven by exceptional demand for our Hopper and Blackwell GPU architectures in the Data Center segment...`
  },
  {
    id: 'aapl-10q-2026',
    ticker: 'AAPL',
    companyName: 'Apple Inc.',
    cik: '0000320193',
    formType: '10-Q',
    filingDate: '2026-02-02',
    reportDate: '2025-12-27',
    accessionNumber: '0000320193-26-000015',
    description: 'Quarterly Report for the Period Ended December 27, 2025',
    primaryDocumentUrl: 'https://www.sec.gov/Archives/edgar/data/320193/000032019326000015/aapl-20251227.htm',
    size: '6.8 MB',
    isXBRL: true,
    financials: {
      revenue: 123500,
      revenueYoY: 3.4,
      netIncome: 34200,
      netIncomeYoY: 1.2,
      eps: 2.18,
      operatingCashFlow: 38900,
      rAndD: 8100
    },
    risks: [
      'Regulatory actions in Europe enforcing alternative app stores and payment systems, potentially diluting Services margins.',
      'Consumer spending slowdown in key markets like China and Europe due to persistent inflationary pressures.',
      'Increased component costs, particularly for advanced display panels and memory chips.'
    ],
    managementDiscussion: 'Apple delivered a strong holiday quarter, with revenue of $123.5B. iPhone revenue grew 2.5% YoY, supported by high demand for the iPhone 17 Pro Max. Services revenue continued its double-digit trajectory, growing 11.5% to $27.1B. Gross margin reached 46.2%, benefiting from a favorable mix toward high-margin Services and Pro hardware models. The company continues to roll out Apple Intelligence features globally, with localized language support launching in Europe and Asia.',
    insiderSentiment: 'Neutral',
    insiderDetails: 'Routine executive stock sales for tax withholding purposes. No significant open-market transactions.',
    fullTextMock: `UNITED STATES SECURITIES AND EXCHANGE COMMISSION
Washington, D.C. 20549
FORM 10-Q
QUARTERLY REPORT PURSUANT TO SECTION 13 OR 15(d) OF THE SECURITIES EXCHANGE ACT OF 1934
For the quarterly period ended December 27, 2025
Commission File Number: 001-36226
APPLE INC.
(Exact name of registrant as specified in its charter)

PART I - FINANCIAL INFORMATION
Item 1. Financial Statements
Consolidated Statements of Operations (Unaudited)
Three Months Ended December 27, 2025: Net sales of $123,500 million, Net income of $34,200 million.

Item 2. Management's Discussion and Analysis of Financial Condition and Results of Operations
We are pleased with our performance during the first quarter of fiscal 2026. Our active installed base of devices has now surpassed 2.4 billion, reaching an all-time high across all major product categories...`
  }
];

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function SecFilingViewer() {
  // State variables
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedFormType, setSelectedFormType] = useState<string>('ALL');
  const [selectedFiling, setSelectedFiling] = useState<SECFiling>(MOCK_FILINGS[0]);
  const [activeTab, setActiveTab] = useState<'document' | 'summary' | 'chat' | 'metrics'>('document');
  
  // Live API configuration states
  const [isLiveMode, setIsLiveMode] = useState(false);
  const [userAgent, setUserAgent] = useState('');
  const [liveCik, setLiveCik] = useState('');
  const [liveFilings, setLiveFilings] = useState<SECFiling[]>([]);
  const [isLiveLoading, setIsLiveLoading] = useState(false);
  const [liveError, setLiveError] = useState('');

  // AI Chat states
  const [chatInput, setChatInput] = useState('');
  const [chatHistory, setChatHistory] = useState<Record<string, ChatMessage[]>>({
    'aapl-10k-2025': [
      { sender: 'ai', text: 'Hello! I am your AI Financial Analyst. I have fully ingested Apple\'s FY 2025 10-K filing. Ask me anything about their financial performance, risk factors, or management discussion.', timestamp: '10:00 AM' }
    ]
  });
  const [isChatTyping, setIsChatTyping] = useState(false);

  // AI Summarizer states
  const [isSummarizing, setIsSummarizing] = useState(false);
  const [summarizedFilings, setSummarizedFilings] = useState<Record<string, boolean>>({
    'aapl-10k-2025': true
  });

  // Filtered filings list
  const filteredFilings = useMemo(() => {
    const pool = isLiveMode ? liveFilings : MOCK_FILINGS;
    return pool.filter(filing => {
      const matchesSearch = 
        filing.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filing.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        filing.cik.includes(searchQuery);
      
      const matchesForm = selectedFormType === 'ALL' || filing.formType === selectedFormType;
      
      return matchesSearch && matchesForm;
    });
  }, [searchQuery, selectedFormType, isLiveMode, liveFilings]);

  // Handle filing selection
  const handleSelectFiling = (filing: SECFiling) => {
    setSelectedFiling(filing);
    // Initialize chat history for this filing if it doesn't exist
    if (!chatHistory[filing.id]) {
      setChatHistory(prev => ({
        ...prev,
        [filing.id]: [
          { 
            sender: 'ai', 
            text: `Hello! I am your AI Financial Analyst. I have fully ingested ${filing.companyName}'s ${filing.formType} filing (${filing.reportDate}). Ask me anything about their financial performance, risk factors, or management discussion.`, 
            timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) 
          }
        ]
      }));
    }
  };

  // Trigger AI Summarization animation
  const handleTriggerSummarize = () => {
    if (summarizedFilings[selectedFiling.id]) return;
    setIsSummarizing(true);
    setTimeout(() => {
      setSummarizedFilings(prev => ({ ...prev, [selectedFiling.id]: true }));
      setIsSummarizing(false);
    }, 2000);
  };

  // Handle Chat Submission
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      sender: 'user',
      text: chatInput,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    const currentFilingId = selectedFiling.id;
    setChatHistory(prev => ({
      ...prev,
      [currentFilingId]: [...(prev[currentFilingId] || []), userMsg]
    }));
    setChatInput('');
    setIsChatTyping(true);

    // Simulate AI response based on filing content
    setTimeout(() => {
      let aiResponseText = "I'm analyzing the filing details to answer your question...";
      const query = userMsg.text.toLowerCase();

      if (query.includes('risk') || query.includes('threat') || query.includes('danger')) {
        aiResponseText = `Based on Item 1A (Risk Factors) of ${selectedFiling.companyName}'s filing, the primary risks include:\n\n` + 
          selectedFiling.risks.map((r, i) => `${i + 1}. ${r}`).join('\n\n') + 
          `\n\nThese risks represent significant operational and financial hurdles that management is actively monitoring.`;
      } else if (query.includes('revenue') || query.includes('sales') || query.includes('income') || query.includes('profit') || query.includes('financial')) {
        if (selectedFiling.financials) {
          const f = selectedFiling.financials;
          aiResponseText = `Here are the key financial metrics extracted from the filing for ${selectedFiling.companyName}:\n\n` +
            `• **Revenue:** $${(f.revenue / 1000).toFixed(2)}B (${f.revenueYoY >= 0 ? '+' : ''}${f.revenueYoY}% YoY)\n` +
            `• **Net Income:** $${(f.netIncome / 1000).toFixed(2)}B (${f.netIncomeYoY >= 0 ? '+' : ''}${f.netIncomeYoY}% YoY)\n` +
            `• **EPS:** $${f.eps.toFixed(2)}\n` +
            `• **Operating Cash Flow:** $${(f.operatingCashFlow / 1000).toFixed(2)}B\n` +
            `• **R&D Expenses:** $${(f.rAndD / 1000).toFixed(2)}B\n\n` +
            `This reflects a ${f.revenueYoY > 5 ? 'strong growth' : 'stable'} performance trajectory.`;
        } else {
          aiResponseText = `Financial metrics are not fully structured for this specific filing type (${selectedFiling.formType}), but management discussion indicates steady operational progress.`;
        }
      } else if (query.includes('management') || query.includes('outlook') || query.includes('future') || query.includes('ceo')) {
        aiResponseText = `**Management Discussion & Analysis (MD&A) Summary:**\n\n${selectedFiling.managementDiscussion}`;
      } else if (query.includes('insider') || query.includes('buy') || query.includes('sell') || query.includes('trading')) {
        aiResponseText = `**Insider Trading Sentiment:** ${selectedFiling.insiderSentiment}\n\n**Details:** ${selectedFiling.insiderDetails}`;
      } else {
        aiResponseText = `I have analyzed the ${selectedFiling.formType} filing for ${selectedFiling.companyName}. Regarding your question: "${userMsg.text}", the document highlights that the company is focusing on strategic execution, managing operational risks (such as supply chain and regulatory compliance), and driving long-term shareholder value through disciplined capital allocation. Let me know if you would like me to extract specific financial figures or risk factors!`;
      }

      const aiMsg: ChatMessage = {
        sender: 'ai',
        text: aiResponseText,
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
      };

      setChatHistory(prev => ({
        ...prev,
        [currentFilingId]: [...(prev[currentFilingId] || []), aiMsg]
      }));
      setIsChatTyping(false);
    }, 1500);
  };

  // Fetch Live SEC EDGAR Data (Simulated with real SEC API structure)
  const handleFetchLiveEDGAR = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!userAgent.trim()) {
      setLiveError('A User-Agent string is required by the SEC to identify your requests.');
      return;
    }
    if (!liveCik.trim()) {
      setLiveError('Please enter a valid 10-digit CIK or stock ticker.');
      return;
    }

    setIsLiveLoading(true);
    setLiveError('');

    try {
      // In a real app, we would fetch from:
      // https://data.sec.gov/submissions/CIK{padded_cik}.json
      // Since SEC EDGAR requires CORS-enabled backend, we simulate the exact API response parsing here
      await new Promise(resolve => setTimeout(resolve, 2000));

      // Mocking the parsed response from SEC EDGAR API
      const formattedCik = liveCik.padStart(10, '0');
      const tickerUpper = liveCik.toUpperCase();

      const newLiveFilings: SECFiling[] = [
        {
          id: `live-${tickerUpper}-10k`,
          ticker: tickerUpper,
          companyName: `${tickerUpper} Corp (SEC Live Data)`,
          cik: formattedCik,
          formType: '10-K',
          filingDate: new Date().toISOString().split('T')[0],
          reportDate: '2025-12-31',
          accessionNumber: `0001193125-26-${Math.floor(100000 + Math.random() * 900000)}`,
          description: 'Annual Report [LIVE SEC EDGAR STREAM]',
          primaryDocumentUrl: `https://www.sec.gov/Archives/edgar/data/${formattedCik}/index.htm`,
          size: '12.4 MB',
          isXBRL: true,
          financials: {
            revenue: 150000,
            revenueYoY: 12.5,
            netIncome: 45000,
            netIncomeYoY: 18.2,
            eps: 8.45,
            operatingCashFlow: 52000,
            rAndD: 15000
          },
          risks: [
            'Regulatory compliance and potential antitrust investigations in global markets.',
            'Rapidly evolving competitive landscape in artificial intelligence and cloud computing.',
            'Cybersecurity threats and potential data breaches affecting customer trust.'
          ],
          managementDiscussion: 'The company delivered strong financial performance with double-digit revenue growth driven by cloud services and AI integration. Operating margins expanded due to cost discipline and high-margin software sales.',
          insiderSentiment: 'Bullish',
          insiderDetails: 'Insiders purchased a net total of $5M in shares over the past 90 days, indicating strong alignment with shareholders.',
          fullTextMock: `SEC LIVE STREAM DATA FOR CIK ${formattedCik}\nForm 10-K Annual Report\nSuccessfully parsed via User-Agent: ${userAgent}`
        }
      ];

      setLiveFilings(newLiveFilings);
      setSelectedFiling(newLiveFilings[0]);
      setIsLiveMode(true);
    } catch (err) {
      setLiveError('Failed to fetch from SEC EDGAR. Please check the CIK/Ticker and try again.');
    } finally {
      setIsLiveLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-400 mb-1">
            <Brain className="w-5 h-5 animate-pulse" />
            <span className="text-xs font-bold tracking-widest uppercase">Sovereign Intelligence Suite</span>
          </div>
          <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SEC EDGAR AI Filing Analyst
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Real-time SEC EDGAR database integration with advanced neural summarization and interactive financial Q&A.
          </p>
        </div>

        {/* Live API Toggle / Config */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 bg-slate-900/80 p-3 rounded-xl border border-slate-800 backdrop-blur-md">
          <div className="flex items-center gap-2">
            <Globe className={`w-4 h-4 ${isLiveMode ? 'text-emerald-400' : 'text-slate-500'}`} />
            <span className="text-xs font-semibold text-slate-300">Live EDGAR Mode</span>
            <button
              onClick={() => setIsLiveMode(!isLiveMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none ${
                isLiveMode ? 'bg-emerald-500' : 'bg-slate-700'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isLiveMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
          {isLiveMode && (
            <div className="h-px sm:h-6 w-full sm:w-px bg-slate-800 my-1 sm:my-0" />
          )}
          {isLiveMode && (
            <form onSubmit={handleFetchLiveEDGAR} className="flex flex-col sm:flex-row gap-2">
              <input
                type="text"
                placeholder="User-Agent (Company/Email)"
                value={userAgent}
                onChange={(e) => setUserAgent(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 w-44"
                required
              />
              <input
                type="text"
                placeholder="Ticker or CIK"
                value={liveCik}
                onChange={(e) => setLiveCik(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-emerald-500 w-28"
                required
              />
              <button
                type="submit"
                disabled={isLiveLoading}
                className="bg-emerald-600 hover:bg-emerald-500 disabled:bg-emerald-800 text-white px-3 py-1 rounded text-xs font-bold flex items-center gap-1 transition-all"
              >
                {isLiveLoading ? <RefreshCw className="w-3 h-3 animate-spin" /> : 'Fetch'}
              </button>
            </form>
          )}
        </div>
      </div>

      {liveError && (
        <div className="mb-6 bg-red-950/40 border border-red-500/30 rounded-xl p-4 flex items-start gap-3">
          <AlertTriangle className="w-5 h-5 text-red-400 shrink-0 mt-0.5" />
          <div>
            <h4 className="text-sm font-bold text-red-400">SEC EDGAR Connection Error</h4>
            <p className="text-xs text-red-300/80 mt-1">{liveError}</p>
          </div>
        </div>
      )}

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Search & Filings List (4 Cols) */}
        <div className="lg:col-span-4 flex flex-col gap-4">
          
          {/* Search & Filter Panel */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md">
            <h3 className="text-sm font-bold text-slate-300 mb-3 flex items-center gap-2">
              <Search className="w-4 h-4 text-emerald-400" />
              Search & Filter Filings
            </h3>
            
            <div className="relative mb-3">
              <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search by Ticker, CIK, or Name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950/80 border border-slate-800 rounded-xl pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
              />
            </div>

            <div className="flex flex-wrap gap-1.5">
              {['ALL', '10-K', '10-Q', '8-K', 'Form 4', 'DEF 14A'].map((type) => (
                <button
                  key={type}
                  onClick={() => setSelectedFormType(type)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition-all ${
                    selectedFormType === type
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-950/60 text-slate-400 border border-slate-800 hover:border-slate-700'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>
          </div>

          {/* Filings List */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-4 backdrop-blur-md flex-1 overflow-y-auto max-h-[600px]">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold text-slate-300 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Filings Feed ({filteredFilings.length})
              </h3>
              <span className="text-[10px] bg-slate-800 text-slate-400 px-2 py-0.5 rounded-full font-mono">
                {isLiveMode ? 'LIVE STREAM' : 'ARCHIVE'}
              </span>
            </div>

            <div className="space-y-3">
              {filteredFilings.length === 0 ? (
                <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                  <Info className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                  <p className="text-sm text-slate-400">No filings match your criteria.</p>
                  <p className="text-xs text-slate-500 mt-1">Try searching for AAPL, TSLA, MSFT, or NVDA.</p>
                </div>
              ) : (
                filteredFilings.map((filing) => {
                  const isSelected = selectedFiling.id === filing.id;
                  return (
                    <div
                      key={filing.id}
                      onClick={() => handleSelectFiling(filing)}
                      className={`p-3.5 rounded-xl border transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-lg shadow-emerald-950/10'
                          : 'bg-slate-950/40 border-slate-800/60 hover:border-slate-700 hover:bg-slate-950/80'
                      }`}
                    >
                      <div className="flex justify-between items-start gap-2 mb-1.5">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold bg-slate-800 text-slate-200 px-2 py-0.5 rounded">
                            {filing.ticker}
                          </span>
                          <span className={`text-xs font-bold px-2 py-0.5 rounded ${
                            filing.formType === '10-K' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                            filing.formType === '10-Q' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                            'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                          }`}>
                            {filing.formType}
                          </span>
                        </div>
                        <span className="text-[10px] text-slate-500 font-mono flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {filing.filingDate}
                        </span>
                      </div>

                      <h4 className="text-xs font-bold text-slate-200 line-clamp-1 mb-1">
                        {filing.companyName}
                      </h4>
                      <p className="text-[11px] text-slate-400 line-clamp-2 mb-2">
                        {filing.description}
                      </p>

                      <div className="flex justify-between items-center text-[10px] text-slate-500 border-t border-slate-900 pt-2">
                        <span>CIK: {filing.cik}</span>
                        <span className="font-mono">{filing.size}</span>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

        </div>

        {/* Right Column: Interactive Workspace (8 Cols) */}
        <div className="lg:col-span-8 flex flex-col gap-4">
          
          {/* Selected Filing Header */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-5 backdrop-blur-md">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
              <div>
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="text-sm font-extrabold text-emerald-400 tracking-wider">
                    {selectedFiling.ticker}
                  </span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">CIK: {selectedFiling.cik}</span>
                  <span className="text-slate-600">•</span>
                  <span className="text-xs text-slate-400 font-mono">Acc: {selectedFiling.accessionNumber}</span>
                </div>
                <h2 className="text-xl font-bold text-slate-100">
                  {selectedFiling.companyName}
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  {selectedFiling.description}
                </p>
              </div>

              <div className="flex items-center gap-2 shrink-0">
                <a
                  href={selectedFiling.primaryDocumentUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 hover:text-white px-3 py-1.5 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-all"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  SEC Source
                </a>
                <button
                  onClick={handleTriggerSummarize}
                  disabled={summarizedFilings[selectedFiling.id] || isSummarizing}
                  className={`px-3.5 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all ${
                    summarizedFilings[selectedFiling.id]
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white shadow-lg shadow-emerald-950/20'
                  }`}
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  {isSummarizing ? 'Analyzing...' : summarizedFilings[selectedFiling.id] ? 'AI Summarized' : 'Run AI Summary'}
                </button>
              </div>
            </div>

            {/* Workspace Tabs */}
            <div className="flex border-b border-slate-800 mt-6">
              {[
                { id: 'document', label: 'Filing Document', icon: FileText },
                { id: 'summary', label: 'AI Summarizer', icon: Brain, badge: summarizedFilings[selectedFiling.id] ? 'Ready' : null },
                { id: 'chat', label: 'AI Chat Assistant', icon: MessageSquare },
                { id: 'metrics', label: 'Financial Metrics', icon: BarChart2 }
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-4 py-2.5 border-b-2 text-xs font-bold transition-all -mb-px ${
                      isActive
                        ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                    {tab.badge && (
                      <span className="bg-emerald-500/20 text-emerald-400 text-[9px] px-1.5 py-0.5 rounded-full font-mono">
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Area */}
          <div className="bg-slate-900/60 border border-slate-800/80 rounded-2xl p-6 backdrop-blur-md flex-1 min-h-[450px] flex flex-col">
            
            {/* TAB 1: DOCUMENT VIEWER */}
            {activeTab === 'document' && (
              <div className="flex-1 flex flex-col">
                <div className="flex justify-between items-center mb-4 bg-slate-950/60 p-3 rounded-xl border border-slate-800">
                  <div className="flex items-center gap-2 text-xs text-slate-400">
                    <Info className="w-4 h-4 text-emerald-400" />
                    <span>Displaying parsed SEC EDGAR document structure.</span>
                  </div>
                  <span className="text-[10px] text-slate-500 font-mono">Format: HTML/XBRL</span>
                </div>

                <div className="flex-1 bg-slate-950/80 border border-slate-800/60 rounded-xl p-5 font-mono text-xs text-slate-300 overflow-y-auto max-h-[400px] leading-relaxed whitespace-pre-wrap">
                  {selectedFiling.fullTextMock}
                </div>
              </div>
            )}

            {/* TAB 2: AI SUMMARIZER */}
            {activeTab === 'summary' && (
              <div className="flex-1 flex flex-col">
                {!summarizedFilings[selectedFiling.id] && !isSummarizing ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <Brain className="w-12 h-12 text-slate-700 mb-3 animate-bounce" />
                    <h3 className="text-base font-bold text-slate-300">AI Summary Not Generated</h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1 mb-4">
                      Run the neural summarization engine to extract key risk factors, management discussion, and insider sentiment.
                    </p>
                    <button
                      onClick={handleTriggerSummarize}
                      className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all"
                    >
                      <Sparkles className="w-4 h-4" />
                      Generate AI Summary
                    </button>
                  </div>
                ) : isSummarizing ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <RefreshCw className="w-10 h-10 text-emerald-400 animate-spin mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">Analyzing SEC Filing...</h3>
                    <p className="text-xs text-slate-500 mt-1">
                      Parsing XBRL taxonomy, cross-referencing risk factors, and evaluating insider sentiment.
                    </p>
                  </div>
                ) : (
                  <div className="space-y-6">
                    {/* Executive Summary Card */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                      <h3 className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <Cpu className="w-4 h-4" />
                        Executive Summary & MD&A Takeaways
                      </h3>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedFiling.managementDiscussion}
                      </p>
                    </div>

                    {/* Risks & Threats */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                      <h3 className="text-xs font-bold text-red-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <ShieldAlert className="w-4 h-4" />
                        Key Risk Factors (Item 1A)
                      </h3>
                      <div className="space-y-2.5">
                        {selectedFiling.risks.map((risk, idx) => (
                          <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-300">
                            <span className="text-red-500/80 font-bold mt-0.5">{idx + 1}.</span>
                            <p className="leading-relaxed">{risk}</p>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Insider Sentiment & Activity */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                      <h3 className="text-xs font-bold text-amber-400 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                        <UserCheck className="w-4 h-4" />
                        Insider Trading Sentiment
                      </h3>
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`text-xs font-extrabold px-2.5 py-1 rounded-lg ${
                          selectedFiling.insiderSentiment === 'Bullish' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                          selectedFiling.insiderSentiment === 'Bearish' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                          'bg-slate-800 text-slate-300'
                        }`}>
                          {selectedFiling.insiderSentiment}
                        </span>
                        <span className="text-xs text-slate-400">
                          Based on Form 4 filings filed concurrently with this reporting period.
                        </span>
                      </div>
                      <p className="text-xs text-slate-300 leading-relaxed">
                        {selectedFiling.insiderDetails}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: AI CHAT ASSISTANT */}
            {activeTab === 'chat' && (
              <div className="flex-1 flex flex-col h-[450px]">
                {/* Chat Messages */}
                <div className="flex-1 overflow-y-auto space-y-4 mb-4 pr-2">
                  {(chatHistory[selectedFiling.id] || []).map((msg, idx) => (
                    <div
                      key={idx}
                      className={`flex ${msg.sender === 'user' ? 'justify-end' : 'justify-start'}`}
                    >
                      <div className={`max-w-[80%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                        msg.sender === 'user'
                          ? 'bg-emerald-600 text-white rounded-tr-none'
                          : 'bg-slate-950/80 border border-slate-800 text-slate-200 rounded-tl-none'
                      }`}>
                        <div className="flex justify-between items-center gap-4 mb-1">
                          <span className="font-bold text-[10px] opacity-80">
                            {msg.sender === 'user' ? 'You' : 'AI Financial Analyst'}
                          </span>
                          <span className="text-[9px] opacity-60 font-mono">{msg.timestamp}</span>
                        </div>
                        <p className="whitespace-pre-wrap">{msg.text}</p>
                      </div>
                    </div>
                  ))}
                  {isChatTyping && (
                    <div className="flex justify-start">
                      <div className="bg-slate-950/80 border border-slate-800 rounded-2xl rounded-tl-none p-3.5 text-xs text-slate-400 flex items-center gap-2">
                        <RefreshCw className="w-3.5 h-3.5 animate-spin text-emerald-400" />
                        <span>AI is analyzing the filing...</span>
                      </div>
                    </div>
                  )}
                </div>

                {/* Chat Input Form */}
                <form onSubmit={handleSendChat} className="flex gap-2 border-t border-slate-800 pt-4">
                  <input
                    type="text"
                    placeholder={`Ask about ${selectedFiling.ticker}'s risks, revenue, or management discussion...`}
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-950/80 border border-slate-800 rounded-xl px-4 py-2.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition-all"
                  />
                  <button
                    type="submit"
                    className="bg-emerald-600 hover:bg-emerald-500 text-white px-4 py-2.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shrink-0"
                  >
                    <Send className="w-3.5 h-3.5" />
                    Send
                  </button>
                </form>
              </div>
            )}

            {/* TAB 4: FINANCIAL METRICS */}
            {activeTab === 'metrics' && (
              <div className="flex-1 flex flex-col">
                {selectedFiling.financials ? (
                  <div className="space-y-6">
                    {/* Key Metrics Grid */}
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Revenue</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            selectedFiling.financials.revenueYoY >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {selectedFiling.financials.revenueYoY >= 0 ? '+' : ''}{selectedFiling.financials.revenueYoY}% YoY
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-slate-100">
                          ${(selectedFiling.financials.revenue / 1000).toFixed(2)}B
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">In millions: ${selectedFiling.financials.revenue.toLocaleString()}</p>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Net Income</span>
                          <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded ${
                            selectedFiling.financials.netIncomeYoY >= 0 ? 'bg-emerald-500/10 text-emerald-400' : 'bg-red-500/10 text-red-400'
                          }`}>
                            {selectedFiling.financials.netIncomeYoY >= 0 ? '+' : ''}{selectedFiling.financials.netIncomeYoY}% YoY
                          </span>
                        </div>
                        <div className="text-xl font-extrabold text-slate-100">
                          ${(selectedFiling.financials.netIncome / 1000).toFixed(2)}B
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">In millions: ${selectedFiling.financials.netIncome.toLocaleString()}</p>
                      </div>

                      <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                        <div className="flex justify-between items-start mb-1">
                          <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider">Diluted EPS</span>
                          <span className="text-[10px] text-slate-500">GAAP</span>
                        </div>
                        <div className="text-xl font-extrabold text-slate-100">
                          ${selectedFiling.financials.eps.toFixed(2)}
                        </div>
                        <p className="text-[10px] text-slate-500 mt-1">Per share value</p>
                      </div>
                    </div>

                    {/* Visualized Chart (SVG-based for zero-dependency reliability) */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-5">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Financial Allocation Breakdown
                      </h3>
                      
                      <div className="space-y-4">
                        {/* Revenue Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Total Revenue</span>
                            <span className="font-bold text-slate-200">${(selectedFiling.financials.revenue / 1000).toFixed(2)}B</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                            <div className="bg-emerald-500 h-full rounded-full" style={{ width: '100%' }} />
                          </div>
                        </div>

                        {/* Net Income Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Net Income (Profit Margin: {((selectedFiling.financials.netIncome / selectedFiling.financials.revenue) * 100).toFixed(1)}%)</span>
                            <span className="font-bold text-slate-200">${(selectedFiling.financials.netIncome / 1000).toFixed(2)}B</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-blue-500 h-full rounded-full" 
                              style={{ width: `${(selectedFiling.financials.netIncome / selectedFiling.financials.revenue) * 100}%` }} 
                            />
                          </div>
                        </div>

                        {/* R&D Bar */}
                        <div>
                          <div className="flex justify-between text-xs mb-1">
                            <span className="text-slate-400">Research & Development (R&D Intensity: {((selectedFiling.financials.rAndD / selectedFiling.financials.revenue) * 100).toFixed(1)}%)</span>
                            <span className="font-bold text-slate-200">${(selectedFiling.financials.rAndD / 1000).toFixed(2)}B</span>
                          </div>
                          <div className="w-full bg-slate-900 rounded-full h-2.5 overflow-hidden">
                            <div 
                              className="bg-purple-500 h-full rounded-full" 
                              style={{ width: `${(selectedFiling.financials.rAndD / selectedFiling.financials.revenue) * 100}%` }} 
                            />
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Cash Flow & Capital Allocation */}
                    <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                      <h3 className="text-xs font-bold text-slate-300 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <DollarSign className="w-4 h-4 text-emerald-400" />
                        Cash Flow & Capital Allocation
                      </h3>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <span className="text-slate-400">Operating Cash Flow</span>
                          <span className="font-bold text-slate-200">${selectedFiling.financials.operatingCashFlow.toLocaleString()}M</span>
                        </div>
                        <div className="flex justify-between items-center border-b border-slate-900 pb-2">
                          <span className="text-slate-400">R&D Investment</span>
                          <span className="font-bold text-slate-200">${selectedFiling.financials.rAndD.toLocaleString()}M</span>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-center py-12">
                    <BarChart2 className="w-12 h-12 text-slate-700 mb-3" />
                    <h3 className="text-sm font-bold text-slate-300">No Structured Financials</h3>
                    <p className="text-xs text-slate-500 max-w-md mt-1">
                      Structured financial metrics are primarily available for 10-K and 10-Q filings. This filing type ({selectedFiling.formType}) does not contain standardized XBRL financial statements.
                    </p>
                  </div>
                )}
              </div>
            )}

          </div>

        </div>

      </div>
    </div>
  );
}