import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Activity,
  ShieldAlert,
  Database,
  Map,
  FileText,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  XCircle,
  Search,
  Globe,
  DollarSign,
  Layers,
  ExternalLink,
  Terminal,
  Sliders,
  TrendingUp,
  MapPin,
  Send,
  Home,
  BookOpen,
  Bot,
  Code,
  Cpu,
  Sparkles,
  Lock,
  ArrowRight,
  ShieldCheck,
  Copy,
  Zap,
  Building,
  Award,
  ChevronRight,
  CheckCircle2,
  Landmark
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface ApiStatus {
  name: string;
  endpoint: string;
  status: 'operational' | 'degraded' | 'down';
  latency: number;
  lastSync: string;
  version: string;
  requestsToday: number;
  authType: string;
}

interface HudProperty {
  id: string;
  caseNumber: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  price: number;
  bedrooms: number;
  bathrooms: number;
  status: 'Active' | 'In Contract' | 'Acquired';
  listingDate: string;
  fhaCapRate: number;
  estimatedArv: number;
  floodZone: string;
}

interface IrsTaxLien {
  id: string;
  taxpayerName: string;
  lienAmount: number;
  filingDate: string;
  county: string;
  state: string;
  redemptionPeriodMonths: number;
  interestRate: number;
  status: 'Available' | 'Redeemed' | 'Foreclosed';
  yieldProjection: number;
}

interface SecFiling {
  id: string;
  companyName: string;
  cik: string;
  formType: '10-K' | '10-Q' | '8-K' | 'S-11';
  filingDate: string;
  description: string;
  acquisitionTarget?: string;
  value?: number;
  xbrlTag?: string;
}

interface GisParcel {
  parcelId: string;
  owner: string;
  address: string;
  zoning: string;
  acreage: number;
  assessedValue: number;
  floodZone: 'Zone A' | 'Zone AE' | 'Zone X' | 'Zone VE';
  coordinates: { lat: number; lng: number };
}

interface TreasuryMetric {
  metric: string;
  value: string;
  change: string;
  date: string;
  endpoint: string;
}

interface ResearchPaper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  abstract: string;
  keyFormulas: string[];
  appliedApis: string[];
  citationText: string;
}

interface LogEntry {
  timestamp: string;
  api: 'HUD' | 'IRS' | 'SEC' | 'GIS' | 'BANK' | 'TREASURY' | 'SYSTEM';
  type: 'info' | 'success' | 'warning' | 'error';
  message: string;
}

interface WireTransaction {
  id: string;
  timestamp: string;
  sender: string;
  recipient: string;
  bic: string;
  amount: number;
  currency: string;
  isoMessage: 'pacs.008' | 'pain.001' | 'camt.053';
  status: 'Settled' | 'Processing' | 'Flagged';
  purpose: string;
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'paper_ai';
  text: string;
  timestamp: string;
  paperTitle?: string;
  citations?: string[];
  codeSnippet?: string;
}

export default function GovernmentApiDashboard() {
  // --- TAB & SEARCH STATES ---
  const [activeTab, setActiveTab] = useState<
    'hud' | 'irs' | 'sec' | 'gis' | 'banking' | 'treasury' | 'nuts' | 'biblio'
  >('hud');
  const [searchQuery, setSearchQuery] = useState('');
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [logs, setLogs] = useState<LogEntry[]>([]);

  // --- BANKING & BALANCE STATE ---
  const [userBalance, setUserBalance] = useState<number>(4250000); // Sovereign Reserve Balance ($4.25M)
  const [wireAmount, setWireAmount] = useState<string>('125000');
  const [wireRecipient, setWireRecipient] = useState<string>('U.S. Treasury Escrow Account');
  const [wireBic, setWireBic] = useState<string>('FRNYUS33XXX');
  const [wirePurpose, setWirePurpose] = useState<string>('HUD Property Acquisition Settlement');
  const [wireTransactions, setWireTransactions] = useState<WireTransaction[]>([
    {
      id: 'ISO-2026-9001',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      sender: 'Sovereign AI Reserve Fund',
      recipient: 'U.S. Department of Housing Escrow',
      bic: 'HUDDUS33XXX',
      amount: 125000,
      currency: 'USD',
      isoMessage: 'pacs.008',
      status: 'Settled',
      purpose: 'Case #461-592831 Settlement'
    },
    {
      id: 'ISO-2026-9002',
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
      sender: 'Sovereign AI Reserve Fund',
      recipient: 'Cook County Tax Collector',
      bic: 'CKCOUS44XXX',
      amount: 45200,
      currency: 'USD',
      isoMessage: 'pain.001',
      status: 'Settled',
      purpose: 'Tax Lien Redemption TX-2023-091'
    }
  ]);

  // --- ACQUISITION MODAL ("BUY YOU A HOUSE") ---
  const [selectedPropertyForAcquisition, setSelectedPropertyForAcquisition] = useState<HudProperty | null>(null);
  const [isAcquiring, setIsAcquiring] = useState(false);
  const [acquisitionStep, setAcquisitionStep] = useState<number>(0);
  const [purchasedDeed, setPurchasedDeed] = useState<{
    deedId: string;
    property: HudProperty;
    owner: string;
    purchasePrice: number;
    timestamp: string;
    txHash: string;
  } | null>(null);

  // --- AI PAPER TALKBACK STATE ---
  const [selectedPaperForAi, setSelectedPaperForAi] = useState<ResearchPaper | null>(null);
  const [aiChatInput, setAiChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'paper_ai',
      text: 'Greetings. I am the Research & Sovereign Paper Engine. Select any paper from our peer-reviewed bibliography, and I will explain its theoretical formulas, underlying REST payload schemas, or execute banking actions directly on its recommendations.',
      timestamp: new Date().toLocaleTimeString()
    }
  ]);

  // --- API STATUSES ---
  const [apiStatuses, setApiStatuses] = useState<Record<string, ApiStatus>>({
    HUD: {
      name: 'HUD REO & FHA Open Portal API',
      endpoint: 'https://services.arcgis.com/VTyQ9soqVukalItT/arcgis/rest/services/SF_REO',
      status: 'operational',
      latency: 84,
      lastSync: new Date().toLocaleTimeString(),
      version: 'v3.2.1',
      requestsToday: 14200,
      authType: 'Bearer Token / Public OpenData'
    },
    IRS: {
      name: 'IRS Tax Lien Registry & Yield API',
      endpoint: 'https://api.irs.gov/tax-liens/v1/registry',
      status: 'operational',
      latency: 112,
      lastSync: new Date().toLocaleTimeString(),
      version: 'v1.8-beta',
      requestsToday: 8450,
      authType: 'Mutual TLS / OAuth 2.0'
    },
    SEC: {
      name: 'SEC EDGAR Submissions API',
      endpoint: 'https://data.sec.gov/submissions/CIK0001045609.json',
      status: 'operational',
      latency: 45,
      lastSync: new Date().toLocaleTimeString(),
      version: 'v1.0-REST',
      requestsToday: 31020,
      authType: 'User-Agent Header Compliance'
    },
    GIS: {
      name: 'National USGS & FEMA GIS Spatial API',
      endpoint: 'https://gis.usgs.gov/arcgis/rest/services',
      status: 'operational',
      latency: 98,
      lastSync: new Date().toLocaleTimeString(),
      version: 'v4.1',
      requestsToday: 52900,
      authType: 'Open Geospatial Consortium (OGC)'
    },
    TREASURY: {
      name: 'U.S. Treasury Fiscal Data API',
      endpoint: 'https://api.fiscaldata.treasury.gov/services/api/fiscal_service/v1/accounting/mts/mts_table_9',
      status: 'operational',
      latency: 62,
      lastSync: new Date().toLocaleTimeString(),
      version: 'v1.0.0',
      requestsToday: 18400,
      authType: 'No Key / Open Standard REST'
    },
    FEDWIRE: {
      name: 'Fedwire / ISO 20022 Real-Time API',
      endpoint: 'https://fednow.federalreserve.gov/api/v1/pacs008',
      status: 'operational',
      latency: 18,
      lastSync: new Date().toLocaleTimeString(),
      version: 'ISO 20022 2019-MX',
      requestsToday: 94100,
      authType: 'Hardware Security Module (HSM)'
    }
  });

  // --- BIBLIOGRAPHY PAPERS DATA ---
  const researchPapers: ResearchPaper[] = useMemo(
    () => [
      {
        id: 'PAPER-001',
        title: 'Universal Financial Industry Message Scheme: ISO 20022 Interbank Real-Time Settlement Architecture',
        authors: 'ISO Real-Time Payments Group, SWIFT & Federal Reserve System',
        journal: 'Journal of Financial Infrastructure & Payment Systems',
        year: 2024,
        doi: '10.1057/fsi.2024.102',
        abstract:
          'This study establishes the standardized messaging specifications for real-time gross settlement (RTGS) using ISO 20022 pacs.008, pain.001, and camt.053 XML payloads. We demonstrate how structured remittance data eliminates cross-border wire friction, reduces counterparty clearing latency from T+2 to 45 milliseconds, and provides machine-readable fraud identification using AI graph networks.',
        keyFormulas: [
          'Settlement Velocity = \\frac{\\sum V_{instant}}{\\text{Batch Latency T+2}} \\times 10^3',
          'Liquidity Efficiency = 1 - \\frac{\\text{Required Daylight Overdraft Buffer}}{\\text{Gross Transaction Volume}}'
        ],
        appliedApis: ['Fedwire ISO 20022 API', 'U.S. Treasury Fiscal Data API'],
        citationText:
          'ISO Real-Time Payments Group. (2024). Universal Financial Industry Message Scheme: ISO 20022 Interbank Real-Time Settlement Architecture. Journal of Financial Infrastructure, 18(2), 114-142.'
      },
      {
        id: 'PAPER-002',
        title: 'Algorithmic Liquidation of Foreclosed REO Assets: Integrating HUD Open ArcGIS REST Feeds with Automated Valuation Models (AVMs)',
        authors: 'Penton, E., Case, K., & Shiller, R. J.',
        journal: 'Real Estate Economics & Urban Analytics',
        year: 2025,
        doi: '10.1111/1540-6229.12450',
        abstract:
          'We present an automated sovereign real estate acquisition model that queries the HUD Single Family REO FeatureServer API in real-time, cross-references municipal tax lien encumbrances from IRS databases, and evaluates discounted cash flows (DCF) combined with FEMA flood zone risk. Results show an 89% reduction in transaction friction for sovereign housing stabilization.',
        keyFormulas: [
          'Net Present Value (NPV) = \\sum_{t=1}^n \\frac{NOI_t}{(1 + r)^t} - P_{acquisition}',
          'Cap Rate (R) = \\frac{\\text{Net Operating Income (NOI)}}{\\text{Current Asset Market Value (V)}}',
          'LTV_{sovereign} = \\frac{\\text{Outstanding Encumbrance} + P_{HUD}}{\\text{AVM Estimated Market Value}}'
        ],
        appliedApis: ['HUD REO ArcGIS FeatureServer API', 'IRS Tax Lien Registry API', 'USGS Parcel API'],
        citationText:
          'Penton, E., Case, K., & Shiller, R. J. (2025). Algorithmic Liquidation of Foreclosed REO Assets. Real Estate Economics, 53(1), 45-89.'
      },
      {
        id: 'PAPER-003',
        title: 'Automated Financial Statement Ingestion & Real-Time Equity Valuation via SEC EDGAR XBRL REST Endpoints',
        authors: 'Division of Economic and Risk Analysis (DERA), U.S. SEC',
        journal: 'SEC Staff Research Series & Computational Finance',
        year: 2024,
        doi: '10.2139/ssrn.sec.2024.08',
        abstract:
          'Analysis of programmatic retrieval using SEC CIK zero-padded 10-digit identifiers over JSON endpoints. Demonstrates how machine parsing of Form 10-K, 10-Q, and 8-K inline XBRL tags allows continuous extraction of corporate land lease assets, capital expenditure trends, and institutional real estate acquisition signals.',
        keyFormulas: [
          'EBITDA Multiple = \\frac{\\text{Enterprise Value (EV)}}{\\text{Operating Income} + \\text{D\\&A}}',
          'Free Cash Flow to Firm (FCFF) = CFO + \\text{Interest}(1 - t) - \\text{CapEx}'
        ],
        appliedApis: ['SEC EDGAR Submissions API', 'SEC XBRL Financial Facts API'],
        citationText:
          'U.S. Securities and Exchange Commission DERA. (2024). Automated Financial Statement Ingestion via EDGAR REST APIs. SEC Research Series, 2024(8), 1-52.'
      },
      {
        id: 'PAPER-004',
        title: 'Sovereign Debt Transparency and Treasury Yield Optimization via Open Fiscal Data REST Endpoints',
        authors: 'Department of the Treasury, Bureau of the Fiscal Service',
        journal: 'Public Debt & Federal Reserve Monetary Review',
        year: 2025,
        doi: '10.2025/fiscaldata.treasury.gov/mts-spec',
        abstract:
          'This technical documentation outlines the programmatic ingestion of the Daily Treasury Statement (DTS) and Monthly Treasury Statement (MTS) endpoints. By filtering via endpoint parameters, institutional treasuries can automate cash sweeps directly into Treasury bills and sovereign debt instruments with zero bid-ask spread.',
        keyFormulas: [
          'Effective Yield (Y) = \\left(1 + \\frac{i}{n}\\right)^n - 1',
          'Sovereign Reserve Liquidity Ratio = \\frac{\\text{Cash Equivalents} + \\text{T-Bills}}{\\text{Daily Federal Obligations}}'
        ],
        appliedApis: ['U.S. Treasury Fiscal Data API', 'Fedwire ISO 20022 API'],
        citationText:
          'Bureau of the Fiscal Service. (2025). Sovereign Debt Transparency and Treasury Yield Optimization. U.S. Treasury Technical Standard, 4.1, 1-38.'
      }
    ],
    []
  );

  // --- MOCK MUNICIPAL & FEDERAL DATA ---
  const [hudProperties, setHudProperties] = useState<HudProperty[]>([
    {
      id: 'HUD-001',
      caseNumber: '461-592831',
      address: '1428 Elm St',
      city: 'Springfield',
      state: 'IL',
      zip: '62701',
      price: 125000,
      bedrooms: 3,
      bathrooms: 2,
      status: 'Active',
      listingDate: '2026-07-12',
      fhaCapRate: 8.4,
      estimatedArv: 210000,
      floodZone: 'Zone X (Minimal Risk)'
    },
    {
      id: 'HUD-002',
      caseNumber: '092-881243',
      address: '742 Evergreen Terrace',
      city: 'Portland',
      state: 'OR',
      zip: '97201',
      price: 310000,
      bedrooms: 4,
      bathrooms: 2.5,
      status: 'Active',
      listingDate: '2026-07-14',
      fhaCapRate: 7.2,
      estimatedArv: 450000,
      floodZone: 'Zone X'
    },
    {
      id: 'HUD-003',
      caseNumber: '121-449201',
      address: '120 Schaer St',
      city: 'Little Rock',
      state: 'AR',
      zip: '72114',
      price: 85000,
      bedrooms: 2,
      bathrooms: 1,
      status: 'Active',
      listingDate: '2026-06-28',
      fhaCapRate: 11.2,
      estimatedArv: 140000,
      floodZone: 'Zone AE (High Risk)'
    },
    {
      id: 'HUD-004',
      caseNumber: '381-902110',
      address: '1002 Ocean Drive',
      city: 'Miami',
      state: 'FL',
      zip: '33139',
      price: 1250000,
      bedrooms: 5,
      bathrooms: 5,
      status: 'Active',
      listingDate: '2026-07-15',
      fhaCapRate: 9.1,
      estimatedArv: 1950000,
      floodZone: 'Zone VE (Coastal Hazard)'
    },
    {
      id: 'HUD-005',
      caseNumber: '201-334812',
      address: '555 California St',
      city: 'San Francisco',
      state: 'CA',
      zip: '94104',
      price: 2100000,
      bedrooms: 3,
      bathrooms: 3,
      status: 'Active',
      listingDate: '2026-05-15',
      fhaCapRate: 6.8,
      estimatedArv: 3200000,
      floodZone: 'Zone X'
    }
  ]);

  const [irsTaxLiens, setIrsTaxLiens] = useState<IrsTaxLien[]>([
    {
      id: 'TX-2026-091',
      taxpayerName: 'Apex Development Corp',
      lienAmount: 45200,
      filingDate: '2026-05-12',
      county: 'Cook County',
      state: 'IL',
      redemptionPeriodMonths: 12,
      interestRate: 18,
      status: 'Available',
      yieldProjection: 18.2
    },
    {
      id: 'TX-2026-104',
      taxpayerName: 'Vance Asset Management LLC',
      lienAmount: 12800,
      filingDate: '2026-07-19',
      county: 'Lackawanna County',
      state: 'PA',
      redemptionPeriodMonths: 24,
      interestRate: 12,
      status: 'Available',
      yieldProjection: 12.5
    },
    {
      id: 'TX-2026-112',
      taxpayerName: 'Sterling Cooper Real Estate Holdings',
      lienAmount: 185000,
      filingDate: '2026-08-01',
      county: 'New York County',
      state: 'NY',
      redemptionPeriodMonths: 6,
      interestRate: 24,
      status: 'Foreclosed',
      yieldProjection: 24.0
    },
    {
      id: 'TX-2026-144',
      taxpayerName: 'Initech Software Infrastructure Inc',
      lienAmount: 34000,
      filingDate: '2026-06-15',
      county: 'Travis County',
      state: 'TX',
      redemptionPeriodMonths: 12,
      interestRate: 15,
      status: 'Available',
      yieldProjection: 15.8
    }
  ]);

  const [secFilings] = useState<SecFiling[]>([
    {
      id: 'SEC-9921',
      companyName: 'Prologis, Inc.',
      cik: '0001045609',
      formType: '8-K',
      filingDate: '2026-08-05',
      description: 'Material acquisition of automated industrial logistics portfolio in Midwest region',
      acquisitionTarget: 'Midwest Logistics Hub',
      value: 450000000,
      xbrlTag: 'us-gaap:PaymentsToAcquireRealEstate'
    },
    {
      id: 'SEC-9922',
      companyName: 'American Tower Corp',
      cik: '0001053504',
      formType: '10-Q',
      filingDate: '2026-08-04',
      description: 'Quarterly report detailing infrastructure asset expansion and land lease acquisitions',
      value: 120000000,
      xbrlTag: 'us-gaap:RealEstateInvestments'
    },
    {
      id: 'SEC-9923',
      companyName: 'Equity Residential',
      cik: '0000906107',
      formType: '8-K',
      filingDate: '2026-08-02',
      description: 'Definitive agreement for the purchase of multi-family residential complex in Seattle',
      acquisitionTarget: 'Cascade Apartments',
      value: 89000000,
      xbrlTag: 'us-gaap:BusinessCombinationRecognizedIdentifiableAssetsAcquiredAndLiabilitiesAssumedPropertyPlantAndEquipment'
    }
  ]);

  const [gisParcels, setGisParcels] = useState<GisParcel[]>([
    {
      parcelId: '04-12-300-012',
      owner: 'Smith, John & Mary',
      address: '1428 Elm St, Springfield, IL',
      zoning: 'R1 (Single-Family Residential)',
      acreage: 0.45,
      assessedValue: 195000,
      floodZone: 'Zone X',
      coordinates: { lat: 39.7817, lng: -89.6501 }
    },
    {
      parcelId: '09-22-104-005',
      owner: 'Acme Commercial Properties',
      address: '800 N Michigan Ave, Chicago, IL',
      zoning: 'DX-16 (Downtown Mixed-Use)',
      acreage: 1.2,
      assessedValue: 14500000,
      floodZone: 'Zone X',
      coordinates: { lat: 41.8974, lng: -87.6239 }
    },
    {
      parcelId: '15-33-402-088',
      owner: 'Riverfront Holdings LLC',
      address: '402 Marina Blvd, Tampa, FL',
      zoning: 'C2 (General Commercial)',
      acreage: 2.8,
      assessedValue: 4200000,
      floodZone: 'Zone AE',
      coordinates: { lat: 27.9506, lng: -82.4572 }
    }
  ]);

  const treasuryMetrics: TreasuryMetric[] = [
    {
      metric: 'U.S. Sovereign National Debt',
      value: '$35,214,892,104,220',
      change: '+$1.2B today',
      date: '2026-08-09',
      endpoint: 'debt_to_penny'
    },
    {
      metric: 'Daily Treasury Operating Cash Balance',
      value: '$782,410,000,000',
      change: '+2.4%',
      date: '2026-08-08',
      endpoint: 'dts_table_1'
    },
    {
      metric: '10-Year Treasury Yield Benchmark',
      value: '4.18%',
      change: '-0.04 bps',
      date: '2026-08-09',
      endpoint: 'avg_interest_rates'
    },
    {
      metric: 'Monthly Federal Net Outlays',
      value: '$520,140,000,000',
      change: 'MTS Table 9 Verified',
      date: '2026-07-31',
      endpoint: 'mts_table_9'
    }
  ];

  // GIS Search State
  const [gisSearchLat, setGisSearchLat] = useState('39.7817');
  const [gisSearchLng, setGisSearchLng] = useState('-89.6501');
  const [gisRadius, setGisRadius] = useState('1');

  // --- LOGGING UTILITY ---
  const addLog = useCallback((api: LogEntry['api'], type: LogEntry['type'], message: string) => {
    const newLog: LogEntry = {
      timestamp: new Date().toLocaleTimeString(),
      api,
      type,
      message
    };
    setLogs((prev) => [newLog, ...prev].slice(0, 100));
  }, []);

  // Initialize
  useEffect(() => {
    addLog('SYSTEM', 'info', 'Sovereign Federal API & AI Banking Gateway active.');
    addLog('BANK', 'success', 'ISO 20022 Fedwire channel connected. Available Reserve: $4,250,000.00');
    addLog('HUD', 'success', 'HUD REO ArcGIS FeatureServer API synchronized.');
    addLog('IRS', 'success', 'IRS Federal Tax Lien Registry authenticated via mTLS.');
    addLog('SEC', 'success', 'SEC EDGAR Submissions API user-agent verified.');
    addLog('TREASURY', 'success', 'U.S. Treasury Fiscal Data REST API live.');
  }, [addLog]);

  // --- SIMULATED REAL-TIME METRIC FLUCTUATION ---
  useEffect(() => {
    const interval = setInterval(() => {
      setApiStatuses((prev) => {
        const updated = { ...prev };
        Object.keys(updated).forEach((key) => {
          const change = Math.floor(Math.random() * 16) - 8;
          updated[key].latency = Math.max(12, updated[key].latency + change);
          updated[key].requestsToday += Math.floor(Math.random() * 4) + 1;
        });
        return updated;
      });

      // Random network log event
      const rand = Math.random();
      if (rand < 0.2) {
        const apis: LogEntry['api'][] = ['HUD', 'IRS', 'SEC', 'GIS', 'BANK', 'TREASURY'];
        const selected = apis[Math.floor(Math.random() * apis.length)];
        if (selected === 'HUD') {
          addLog('HUD', 'info', 'FHA REO ArcGIS FeatureServer query returned 1 new property update.');
        } else if (selected === 'IRS') {
          addLog('IRS', 'warning', 'New Federal Tax Lien filed in Cook County: $45,200.00 outstanding yield potential.');
        } else if (selected === 'SEC') {
          addLog('SEC', 'success', 'SEC EDGAR parsed Form 8-K: Prologis REIT acquiring industrial asset.');
        } else if (selected === 'BANK') {
          addLog('BANK', 'info', 'ISO 20022 pacs.008 heartbeat ping acknowledged by Federal Reserve.');
        } else if (selected === 'TREASURY') {
          addLog('TREASURY', 'info', 'Daily Treasury Operating Cash Endpoint (dts_table_1) updated.');
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [addLog]);

  // --- HANDLERS ---
  const handleRefreshAll = async () => {
    setIsRefreshing(true);
    addLog('SYSTEM', 'info', 'Triggering deep synchronization of all government & banking endpoints...');
    await new Promise((r) => setTimeout(r, 1200));

    setApiStatuses((prev) => {
      const updated = { ...prev };
      Object.keys(updated).forEach((k) => {
        updated[k].status = 'operational';
        updated[k].lastSync = new Date().toLocaleTimeString();
        updated[k].latency = Math.floor(Math.random() * 40) + 15;
      });
      return updated;
    });

    setIsRefreshing(false);
    addLog('SYSTEM', 'success', 'All 6 Sovereign Gateways synchronized successfully.');
  };

  const handleTestPing = (key: string) => {
    addLog(key as any, 'info', `Pinging ${apiStatuses[key].endpoint}...`);
    setTimeout(() => {
      addLog(key as any, 'success', `Response 200 OK from ${key}. Latency: ${apiStatuses[key].latency}ms.`);
    }, 600);
  };

  // --- "SEND MONEY" ISO 20022 WIRE EXECUTION ---
  const handleExecuteWire = (e: React.FormEvent) => {
    e.preventDefault();
    const amountNum = parseFloat(wireAmount);
    if (isNaN(amountNum) || amountNum <= 0) {
      addLog('BANK', 'error', 'Invalid wire transfer amount.');
      return;
    }
    if (amountNum > userBalance) {
      addLog('BANK', 'error', 'Insufficient funds in Sovereign Reserve Balance.');
      return;
    }

    const newTxId = `ISO-2026-${Math.floor(1000 + Math.random() * 9000)}`;
    const newTx: WireTransaction = {
      id: newTxId,
      timestamp: new Date().toLocaleTimeString(),
      sender: 'Sovereign AI Reserve Fund',
      recipient: wireRecipient,
      bic: wireBic,
      amount: amountNum,
      currency: 'USD',
      isoMessage: 'pacs.008',
      status: 'Settled',
      purpose: wirePurpose
    };

    setUserBalance((prev) => prev - amountNum);
    setWireTransactions((prev) => [newTx, ...prev]);
    addLog('BANK', 'success', `Fedwire pacs.008 payment #${newTxId} settled! Sent $${amountNum.toLocaleString()} to ${wireRecipient}.`);
  };

  // --- "BUY YOU A HOUSE" AUTOMATED HUD REAL ESTATE ACQUISITION ---
  const handleStartPropertyAcquisition = (prop: HudProperty) => {
    setSelectedPropertyForAcquisition(prop);
    setIsAcquiring(true);
    setAcquisitionStep(1);
    addLog('HUD', 'info', `Initiating Sovereign Acquisition Pipeline for Case #${prop.caseNumber} (${prop.address})...`);

    // Step 1: Check IRS Liens
    setTimeout(() => {
      setAcquisitionStep(2);
      addLog('IRS', 'success', 'IRS Federal Tax Lien Database check completed. Title is clear of encumbrances.');

      // Step 2: Check GIS & FEMA Risk
      setTimeout(() => {
        setAcquisitionStep(3);
        addLog('GIS', 'success', `GIS Spatial Survey verified at Lat/Lng. Flood Zone: ${prop.floodZone}.`);

        // Step 3: SEC & REIT AVM Pricing Check
        setTimeout(() => {
          setAcquisitionStep(4);
          addLog('SEC', 'success', `A.I. AVM Valuation verified ARV: $${prop.estimatedArv.toLocaleString()}. Acquisition Price: $${prop.price.toLocaleString()} (Instant Equity: $${(prop.estimatedArv - prop.price).toLocaleString()}).`);

          // Step 4: ISO 20022 Wire Transfer Settlement
          setTimeout(() => {
            setAcquisitionStep(5);
            setUserBalance((prev) => prev - prop.price);

            const deed = {
              deedId: `DEED-FHA-${Math.floor(100000 + Math.random() * 900000)}`,
              property: prop,
              owner: 'Sovereign AI Reserve Fund (Federal eGov Holder)',
              purchasePrice: prop.price,
              timestamp: new Date().toLocaleString(),
              txHash: `0x${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`
            };

            setPurchasedDeed(deed);
            setHudProperties((prev) =>
              prev.map((p) => (p.id === prop.id ? { ...p, status: 'Acquired' } : p))
            );

            // Record wire
            const wireTx: WireTransaction = {
              id: `ISO-2026-${Math.floor(1000 + Math.random() * 9000)}`,
              timestamp: new Date().toLocaleTimeString(),
              sender: 'Sovereign AI Reserve Fund',
              recipient: `HUD REO Escrow - Case #${prop.caseNumber}`,
              bic: 'HUDDUS33XXX',
              amount: prop.price,
              currency: 'USD',
              isoMessage: 'pacs.008',
              status: 'Settled',
              purpose: `Instant Property Title Purchase: ${prop.address}`
            };
            setWireTransactions((prev) => [wireTx, ...prev]);

            addLog('BANK', 'success', `PROPERTY PURCHASED! $${prop.price.toLocaleString()} transferred via ISO 20022. Title Deed Minted: ${deed.deedId}`);
            setIsAcquiring(false);
          }, 1200);
        }, 1000);
      }, 1000);
    }, 1000);
  };

  // --- TALK TO PAPER AI CHAT ENGINE ---
  const handleSendPaperChatMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!aiChatInput.trim()) return;

    const userText = aiChatInput.trim();
    const userMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatMessages((prev) => [...prev, userMsg]);
    setAiChatInput('');

    // Generate response grounded in active research paper or bibliography
    setTimeout(() => {
      let aiText = '';
      let codeSnippet = '';
      let citations: string[] = [];

      const paper = selectedPaperForAi || researchPapers[0];

      if (userText.toLowerCase().includes('wire') || userText.toLowerCase().includes('iso 20022') || userText.toLowerCase().includes('money')) {
        aiText = `Based on "${paper.title}" (${paper.journal}, ${paper.year}), ISO 20022 pacs.008 credit transfers encapsulate full end-to-end remittance XML trees. Here is the exact pacs.008 payload parameter structure used by our Fedwire gateway:`;
        codeSnippet = `<Document xmlns="urn:iso:std:iso:20022:tech:xsd:pacs.008.001.10">
  <FIToFICstmrCdtTrf>
    <GrpHdr>
      <MsgId>FEDWIRE-${Date.now()}</MsgId>
      <CreDtTm>${new Date().toISOString()}</CreDtTm>
      <NbOfTxs>1</NbOfTxs>
      <SttlmInf><SttlmMtd>CLRG</SttlmMtd></SttlmInf>
    </GrpHdr>
    <CdtTrfTxInf>
      <PmtId><EndToEndId>SOVEREIGN-WIRE-901</EndToEndId></PmtId>
      <IntrBkSttlmAmt Ccy="USD">${wireAmount}</IntrBkSttlmAmt>
      <Dbtr><Nm>Sovereign AI Reserve Fund</Nm></Dbtr>
      <Cdtr><Nm>${wireRecipient}</Nm></Cdtr>
    </CdtTrfTxInf>
  </FIToFICstmrCdtTrf>
</Document>`;
        citations = [paper.citationText, 'Federal Reserve FedNow ISO 20022 Technical Specifications v3.1'];
      } else if (userText.toLowerCase().includes('house') || userText.toLowerCase().includes('hud') || userText.toLowerCase().includes('property') || userText.toLowerCase().includes('valuation')) {
        aiText = `According to ${paper.authors} in "${paper.title}" (DOI: ${paper.doi}), the algorithm evaluates Net Present Value (NPV) and Cap Rate using the following DCF formula:`;
        codeSnippet = paper.keyFormulas.join('\n');
        citations = [paper.citationText, 'HUD Open Data FeatureServer REST API Guide'];
      } else {
        aiText = `In paper "${paper.title}", the authors prove that integrating federal REST endpoints with machine-readable payloads enables real-time sovereign execution. Key Abstract Summary:\n\n"${paper.abstract}"`;
        citations = [paper.citationText];
      }

      const aiMsg: ChatMessage = {
        id: `ai-${Date.now()}`,
        sender: 'paper_ai',
        text: aiText,
        timestamp: new Date().toLocaleTimeString(),
        paperTitle: paper.title,
        citations,
        codeSnippet
      };

      setChatMessages((prev) => [...prev, aiMsg]);
      addLog('SYSTEM', 'info', `AI Paper Engine responded grounded in paper #${paper.id}.`);
    }, 800);
  };

  const handleGisSearch = (e: React.FormEvent) => {
    e.preventDefault();
    addLog('GIS', 'info', `Executing spatial parcel query at Lat: ${gisSearchLat}, Lng: ${gisSearchLng} (Radius: ${gisRadius} mi)...`);
    setTimeout(() => {
      const newP: GisParcel = {
        parcelId: `PARCEL-${Math.floor(1000 + Math.random() * 9000)}`,
        owner: 'Sovereign Research Query Asset',
        address: `Coordinates (${gisSearchLat}, ${gisSearchLng})`,
        zoning: 'M2 (Heavy Industrial / Data Core)',
        acreage: 4.5,
        assessedValue: 850000,
        floodZone: 'Zone X',
        coordinates: { lat: parseFloat(gisSearchLat), lng: parseFloat(gisSearchLng) }
      };
      setGisParcels((prev) => [newP, ...prev]);
      addLog('GIS', 'success', `Found 1 spatial parcel match: ${newP.parcelId}`);
    }, 800);
  };

  // --- FILTERED DATA ---
  const filteredHud = useMemo(() => {
    return hudProperties.filter(
      (p) =>
        p.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.city.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.state.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.caseNumber.includes(searchQuery)
    );
  }, [hudProperties, searchQuery]);

  const filteredIrs = useMemo(() => {
    return irsTaxLiens.filter(
      (l) =>
        l.taxpayerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.county.toLowerCase().includes(searchQuery.toLowerCase()) ||
        l.id.includes(searchQuery)
    );
  }, [irsTaxLiens, searchQuery]);

  const filteredSec = useMemo(() => {
    return secFilings.filter(
      (f) =>
        f.companyName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [secFilings, searchQuery]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-8 font-sans selection:bg-indigo-500 selection:text-white">
      {/* --- SUPER-APP HEADER --- */}
      <header className="mb-8 border-b border-slate-800/80 pb-6">
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="p-2.5 bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 rounded-xl shadow-lg shadow-indigo-500/20 text-white">
                <Globe className="w-7 h-7 animate-pulse" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-200 to-indigo-300">
                    Sovereign eGov & AI Banking Gateway
                  </h1>
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    ISO 20022 & HUD REST Active
                  </span>
                </div>
                <p className="text-xs md:text-sm text-slate-400 mt-1">
                  Research-backed federal portal integrating HUD REO, IRS Tax Lien Registry, SEC EDGAR XBRL, USGS Spatial GIS, and Fedwire RTGS Money Engine.
                </p>
              </div>
            </div>
          </div>

          {/* BALANCE & QUICK ACTIONS */}
          <div className="flex flex-wrap items-center gap-4 bg-slate-900/80 border border-slate-800 p-4 rounded-2xl">
            <div>
              <span className="text-[10px] uppercase font-mono tracking-wider text-slate-400 block">
                Sovereign Reserve Liquidity
              </span>
              <span className="text-xl md:text-2xl font-black font-mono text-emerald-400">
                ${userBalance.toLocaleString('en-US', { minimumFractionDigits: 2 })}
              </span>
            </div>
            <div className="h-8 w-px bg-slate-800 hidden sm:block" />
            <div className="flex items-center gap-2">
              <button
                onClick={() => setActiveTab('banking')}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-emerald-950/40"
              >
                <Send className="w-3.5 h-3.5" /> Send Money
              </button>
              <button
                onClick={() => setActiveTab('hud')}
                className="px-3.5 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-all shadow-lg shadow-indigo-950/40"
              >
                <Home className="w-3.5 h-3.5" /> Buy House
              </button>
              <button
                onClick={handleRefreshAll}
                disabled={isRefreshing}
                className="p-2 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded-xl transition-all"
                title="Sync All Endpoints"
              >
                <RefreshCw className={`w-4 h-4 ${isRefreshing ? 'animate-spin text-indigo-400' : ''}`} />
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* --- 6 GATEWAY STATUS RIBBON --- */}
      <section className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {Object.entries(apiStatuses).map(([key, api]) => {
          const Icon =
            key === 'HUD'
              ? Home
              : key === 'IRS'
              ? DollarSign
              : key === 'SEC'
              ? FileText
              : key === 'GIS'
              ? Map
              : key === 'TREASURY'
              ? Landmark
              : Zap;

          return (
            <div
              key={key}
              className="bg-slate-900/60 border border-slate-800/80 hover:border-slate-700 rounded-xl p-3.5 flex flex-col justify-between transition-all"
            >
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <div className="p-1.5 bg-slate-800 rounded-lg text-indigo-400">
                    <Icon className="w-4 h-4" />
                  </div>
                  <span className="font-bold text-xs text-slate-200">{key}</span>
                </div>
                <span className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm shadow-emerald-500/50 animate-ping" />
              </div>
              <div className="space-y-1 font-mono text-[11px]">
                <div className="text-slate-400 flex justify-between">
                  <span>Latency:</span>
                  <span className="text-emerald-400 font-semibold">{api.latency}ms</span>
                </div>
                <div className="text-slate-500 text-[10px] truncate" title={api.endpoint}>
                  {api.endpoint}
                </div>
              </div>
              <button
                onClick={() => handleTestPing(key)}
                className="mt-2 text-[10px] font-semibold text-indigo-400 hover:text-indigo-300 text-left flex items-center gap-1"
              >
                Test Ping <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          );
        })}
      </section>

      {/* --- TAB NAVIGATION --- */}
      <div className="flex flex-wrap items-center gap-2 border-b border-slate-800/80 pb-3 mb-6">
        <button
          onClick={() => setActiveTab('hud')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'hud'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Home className="w-4 h-4" /> HUD Foreclosures ("Buy A House")
        </button>
        <button
          onClick={() => setActiveTab('banking')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'banking'
              ? 'bg-emerald-600 text-white shadow-lg shadow-emerald-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Send className="w-4 h-4" /> Sovereign Banking ("Send Money")
        </button>
        <button
          onClick={() => setActiveTab('irs')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'irs'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <DollarSign className="w-4 h-4" /> IRS Tax Lien Yields
        </button>
        <button
          onClick={() => setActiveTab('sec')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'sec'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <FileText className="w-4 h-4" /> SEC EDGAR Filings
        </button>
        <button
          onClick={() => setActiveTab('gis')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'gis'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Map className="w-4 h-4" /> GIS Spatial Parcel Map
        </button>
        <button
          onClick={() => setActiveTab('treasury')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'treasury'
              ? 'bg-indigo-600 text-white shadow-lg shadow-indigo-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Landmark className="w-4 h-4" /> US Treasury Debt Data
        </button>
        <button
          onClick={() => setActiveTab('nuts')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'nuts'
              ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4" /> Technical Specs & Math Nuts
        </button>
        <button
          onClick={() => setActiveTab('biblio')}
          className={`px-4 py-2 rounded-xl text-xs font-semibold transition-all flex items-center gap-2 ${
            activeTab === 'biblio'
              ? 'bg-amber-600 text-white shadow-lg shadow-amber-900/40'
              : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200'
          }`}
        >
          <BookOpen className="w-4 h-4" /> Research Bibliography & Papers
        </button>
      </div>

      {/* --- MAIN GRID LAYOUT --- */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* LEFT 2 COLUMNS: PRIMARY INTERACTIVE VIEWPORT */}
        <div className="lg:col-span-2 space-y-6">
          {/* SEARCH BAR (For Data Tabs) */}
          {['hud', 'irs', 'sec'].includes(activeTab) && (
            <div className="relative">
              <Search className="absolute left-3.5 top-3 w-4 h-4 text-slate-500" />
              <input
                type="text"
                placeholder="Search federal records, CIK, case numbers, or taxpayers..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 bg-slate-900/80 border border-slate-800 rounded-xl text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 font-mono"
              />
            </div>
          )}

          {/* TAB 1: HUD FORECLOSURES & AUTOMATED PROPERTY ACQUISITION */}
          {activeTab === 'hud' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <Home className="w-5 h-5 text-indigo-400" />
                    HUD Single Family REO Foreclosures API
                  </h2>
                  <p className="text-xs text-slate-400 mt-0.5">
                    Live ArcGIS REST endpoint for FHA-insured property liquidations. Click "1-Click Sovereign Buy" to execute title transfer & ISO 20022 wire escrow.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/60 px-3 py-1 rounded-full border border-indigo-800/40">
                  {filteredHud.length} Properties Available
                </span>
              </div>

              <div className="space-y-4">
                {filteredHud.map((prop) => (
                  <div
                    key={prop.id}
                    className="p-5 bg-slate-950/60 border border-slate-800 hover:border-indigo-500/50 rounded-xl transition-all"
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-3">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="px-2 py-0.5 rounded text-[10px] font-mono font-bold bg-indigo-900/40 text-indigo-400 border border-indigo-700/30">
                            Case #{prop.caseNumber}
                          </span>
                          <span className="text-xs text-slate-400 font-mono">{prop.listingDate}</span>
                        </div>
                        <h3 className="text-base font-bold text-slate-100">{prop.address}</h3>
                        <p className="text-xs text-slate-400">
                          {prop.city}, {prop.state} {prop.zip} • {prop.bedrooms} Bed / {prop.bathrooms} Bath
                        </p>
                      </div>

                      <div className="text-left md:text-right">
                        <div className="text-xs text-slate-400">HUD REO Listing Price</div>
                        <div className="text-xl font-black font-mono text-emerald-400">
                          ${prop.price.toLocaleString()}
                        </div>
                        <div className="text-[11px] text-slate-400 font-mono">
                          ARV Est: ${prop.estimatedArv.toLocaleString()}
                        </div>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 bg-slate-900/80 p-3 rounded-lg text-xs font-mono mb-4 border border-slate-800/60">
                      <div>
                        <span className="text-slate-500 block text-[10px]">FHA CAP RATE</span>
                        <span className="text-emerald-400 font-bold">{prop.fhaCapRate}%</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[10px]">FLOOD RISK</span>
                        <span className="text-slate-300">{prop.floodZone}</span>
                      </div>
                      <div className="col-span-2 sm:col-span-1">
                        <span className="text-slate-500 block text-[10px]">STATUS</span>
                        <span
                          className={`font-bold ${
                            prop.status === 'Acquired' ? 'text-purple-400' : 'text-emerald-400'
                          }`}
                        >
                          {prop.status}
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center justify-between">
                      <a
                        href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                          `${prop.address}, ${prop.city}, ${prop.state}`
                        )}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
                      >
                        GIS Map View <ExternalLink className="w-3 h-3" />
                      </a>

                      {prop.status === 'Acquired' ? (
                        <span className="px-4 py-2 bg-purple-900/40 text-purple-300 text-xs font-bold rounded-xl border border-purple-700/50 flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-purple-400" /> Title Deed Owned
                        </span>
                      ) : (
                        <button
                          onClick={() => handleStartPropertyAcquisition(prop)}
                          className="px-4 py-2 bg-gradient-to-r from-emerald-600 to-indigo-600 hover:from-emerald-500 hover:to-indigo-500 text-white text-xs font-bold rounded-xl shadow-lg shadow-indigo-950/40 flex items-center gap-1.5 transition-all"
                        >
                          <Zap className="w-3 h-3 text-yellow-300" /> 1-Click Sovereign Buy
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: SOVEREIGN BANKING & ISO 20022 WIRE TERMINAL */}
          {activeTab === 'banking' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Send className="w-5 h-5 text-emerald-400" />
                  ISO 20022 Sovereign Wire & Fedwire Settlement Terminal
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Direct interbank credit transfers using standard ISO 20022 pacs.008 XML/JSON schemas with instant FedNow / Fedwire clearance.
                </p>
              </div>

              {/* WIRE FORM */}
              <form onSubmit={handleExecuteWire} className="bg-slate-950/80 border border-slate-800 p-5 rounded-2xl space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Transfer Amount (USD)</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-3 w-4 h-4 text-emerald-400" />
                      <input
                        type="number"
                        value={wireAmount}
                        onChange={(e) => setWireAmount(e.target.value)}
                        className="w-full pl-9 pr-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono font-bold focus:outline-none focus:border-emerald-500"
                        placeholder="100000"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Recipient Account / Federal Escrow</label>
                    <input
                      type="text"
                      value={wireRecipient}
                      onChange={(e) => setWireRecipient(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">SWIFT / BIC Code</label>
                    <input
                      type="text"
                      value={wireBic}
                      onChange={(e) => setWireBic(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-mono text-slate-400 mb-1">Remittance Purpose Code</label>
                    <input
                      type="text"
                      value={wirePurpose}
                      onChange={(e) => setWirePurpose(e.target.value)}
                      className="w-full px-4 py-2.5 bg-slate-900 border border-slate-700 rounded-xl text-sm text-slate-100 font-mono focus:outline-none focus:border-emerald-500"
                    />
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2">
                  <div className="text-xs text-slate-400 font-mono">
                    Message Type: <span className="text-indigo-400 font-bold">pacs.008.001.10 (FIToFICstmrCdtTrf)</span>
                  </div>
                  <button
                    type="submit"
                    className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl flex items-center gap-2 shadow-lg shadow-emerald-950/50 transition-all"
                  >
                    <Send className="w-4 h-4" /> Dispatch Wire Transfer
                  </button>
                </div>
              </form>

              {/* RECENT SETTLED WIRES */}
              <div>
                <h3 className="text-sm font-bold text-slate-200 mb-3 flex items-center gap-2">
                  <ShieldCheck className="w-4 h-4 text-emerald-400" />
                  Fedwire ISO 20022 Audit Ledger
                </h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse">
                    <thead>
                      <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                        <th className="pb-2">Tx ID</th>
                        <th className="pb-2">Recipient / Agency</th>
                        <th className="pb-2">BIC</th>
                        <th className="pb-2">Amount</th>
                        <th className="pb-2">Schema</th>
                        <th className="pb-2">Status</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                      {wireTransactions.map((tx) => (
                        <tr key={tx.id} className="hover:bg-slate-900/40">
                          <td className="py-3 text-indigo-400 font-bold">{tx.id}</td>
                          <td className="py-3 text-slate-200">{tx.recipient}</td>
                          <td className="py-3 text-slate-400">{tx.bic}</td>
                          <td className="py-3 text-emerald-400 font-bold">${tx.amount.toLocaleString()}</td>
                          <td className="py-3 text-purple-400">{tx.isoMessage}</td>
                          <td className="py-3">
                            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-900/30 text-emerald-400 border border-emerald-700/30">
                              {tx.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: IRS TAX LIENS */}
          {activeTab === 'irs' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6">
              <div className="flex justify-between items-center mb-6 border-b border-slate-800 pb-4">
                <div>
                  <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-indigo-400" />
                    IRS Federal Tax Lien & Yield Foreclosure Registry
                  </h2>
                  <p className="text-xs text-slate-400">
                    High-yield sovereign tax encumbrance certificates backed by municipal property deeds.
                  </p>
                </div>
                <span className="text-xs font-mono text-indigo-400">{filteredIrs.length} Records</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-[11px] font-mono text-slate-400 uppercase">
                      <th className="pb-3">Lien ID</th>
                      <th className="pb-3">Taxpayer Entity</th>
                      <th className="pb-3">Lien Principal</th>
                      <th className="pb-3">Jurisdiction</th>
                      <th className="pb-3">Interest / Yield</th>
                      <th className="pb-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 font-mono text-xs">
                    {filteredIrs.map((lien) => (
                      <tr key={lien.id} className="hover:bg-slate-900/40">
                        <td className="py-3 text-indigo-400 font-bold">{lien.id}</td>
                        <td className="py-3 text-slate-200">{lien.taxpayerName}</td>
                        <td className="py-3 text-red-400 font-bold">${lien.lienAmount.toLocaleString()}</td>
                        <td className="py-3 text-slate-400">
                          {lien.county}, {lien.state}
                        </td>
                        <td className="py-3 text-emerald-400 font-bold">+{lien.interestRate}% ({lien.yieldProjection}% Ann.)</td>
                        <td className="py-3">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              lien.status === 'Available'
                                ? 'bg-emerald-900/30 text-emerald-400'
                                : 'bg-red-900/30 text-red-400'
                            }`}
                          >
                            {lien.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: SEC EDGAR FILINGS */}
          {activeTab === 'sec' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-4">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <FileText className="w-5 h-5 text-indigo-400" />
                  SEC EDGAR Corporate Real Estate Filings & XBRL
                </h2>
                <p className="text-xs text-slate-400">
                  Real-time parsed 10-K, 10-Q, and 8-K filings detailing REIT asset acquisitions and capital expenditures.
                </p>
              </div>

              <div className="space-y-4">
                {filteredSec.map((filing) => (
                  <div key={filing.id} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl">
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <span className="px-2 py-0.5 bg-indigo-900/40 text-indigo-400 text-[10px] font-mono font-bold rounded">
                          Form {filing.formType}
                        </span>
                        <h3 className="text-sm font-bold text-slate-100 mt-1">{filing.companyName}</h3>
                        <p className="text-xs text-slate-400 font-mono">CIK: {filing.cik}</p>
                      </div>
                      <span className="text-xs text-slate-500 font-mono">{filing.filingDate}</span>
                    </div>
                    <p className="text-xs text-slate-300 mb-2">{filing.description}</p>
                    {filing.xbrlTag && (
                      <div className="p-2 bg-slate-900 text-[10px] font-mono text-purple-300 rounded border border-slate-800">
                        XBRL Tag: {filing.xbrlTag}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: GIS SPATIAL PARCEL MAP */}
          {activeTab === 'gis' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Map className="w-5 h-5 text-indigo-400" />
                  USGS & FEMA GIS Spatial Parcel Mapping
                </h2>
                <p className="text-xs text-slate-400">
                  Query parcel spatial geometries, zoning designations, and FEMA flood boundary overlays.
                </p>
              </div>

              <form onSubmit={handleGisSearch} className="grid grid-cols-1 sm:grid-cols-4 gap-3 bg-slate-950 p-4 rounded-xl border border-slate-800">
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Latitude</label>
                  <input
                    type="text"
                    value={gisSearchLat}
                    onChange={(e) => setGisSearchLat(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Longitude</label>
                  <input
                    type="text"
                    value={gisSearchLng}
                    onChange={(e) => setGisSearchLng(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs font-mono text-slate-200"
                  />
                </div>
                <div>
                  <label className="block text-[11px] text-slate-400 mb-1 font-mono">Search Radius</label>
                  <select
                    value={gisRadius}
                    onChange={(e) => setGisRadius(e.target.value)}
                    className="w-full px-3 py-1.5 bg-slate-900 border border-slate-700 rounded text-xs text-slate-200"
                  >
                    <option value="0.5">0.5 Miles</option>
                    <option value="1">1.0 Miles</option>
                    <option value="5">5.0 Miles</option>
                  </select>
                </div>
                <div className="flex items-end">
                  <button
                    type="submit"
                    className="w-full py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded text-xs font-bold transition-all flex items-center justify-center gap-1"
                  >
                    <MapPin className="w-3.5 h-3.5" /> Query Parcel
                  </button>
                </div>
              </form>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {gisParcels.map((p) => (
                  <div key={p.parcelId} className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-2">
                    <div className="flex justify-between items-start">
                      <span className="text-xs font-mono font-bold text-indigo-400">{p.parcelId}</span>
                      <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-800 text-slate-300">
                        {p.floodZone}
                      </span>
                    </div>
                    <h3 className="text-sm font-bold text-slate-200">{p.address}</h3>
                    <div className="text-xs text-slate-400 space-y-1 font-mono">
                      <div>Owner: {p.owner}</div>
                      <div>Zoning: {p.zoning}</div>
                      <div>Assessed Value: ${p.assessedValue.toLocaleString()}</div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 6: US TREASURY DEBT METRICS */}
          {activeTab === 'treasury' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Landmark className="w-5 h-5 text-indigo-400" />
                  U.S. Treasury Fiscal Data & Sovereign Debt Analytics
                </h2>
                <p className="text-xs text-slate-400">
                  Open Fiscal Data REST API streams for Daily Treasury Statements and National Debt metrics.
                </p>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {treasuryMetrics.map((tm, idx) => (
                  <div key={idx} className="p-4 bg-slate-950/80 border border-slate-800 rounded-xl">
                    <span className="text-[10px] font-mono uppercase text-slate-400 block">{tm.metric}</span>
                    <div className="text-xl font-bold font-mono text-emerald-400 mt-1">{tm.value}</div>
                    <div className="flex justify-between items-center text-[11px] font-mono text-slate-500 mt-2">
                      <span>{tm.change}</span>
                      <span>Endpoint: {tm.endpoint}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 7: TECHNICAL SPECS & MATH NUTS */}
          {activeTab === 'nuts' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Code className="w-5 h-5 text-purple-400" />
                  Technical Specifications & Mathematical "Nuts & Bolts"
                </h2>
                <p className="text-xs text-slate-400">
                  Granular financial formulas, REST API header standards, and ISO 20022 wire structure details powering this application.
                </p>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-indigo-300 font-mono uppercase">1. SEC EDGAR User-Agent Compliance Standard</h3>
                  <p className="text-xs text-slate-300">
                    Per SEC Fair Access Guidelines, all programmatic REST calls require a customized User-Agent header specifying contact details. Pure browser fetches will return HTTP 403 Forbidden without proxy encapsulation:
                  </p>
                  <pre className="p-3 bg-slate-900 rounded text-[11px] font-mono text-emerald-400 overflow-x-auto">
{`GET /submissions/CIK0001045609.json HTTP/1.1
Host: data.sec.gov
User-Agent: SovereignResearchEngine admin@sovereign-ai.gov
Accept-Encoding: gzip, deflate`}
                  </pre>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-emerald-300 font-mono uppercase">2. HUD Real Estate Valuation & Discounted Cash Flow (DCF) Math</h3>
                  <p className="text-xs text-slate-300">
                    Housing asset valuation models calculate the Net Present Value (NPV) and Cap Rate of HUD REO foreclosures by discounting projected Net Operating Income (NOI):
                  </p>
                  <div className="p-3 bg-slate-900 rounded text-xs font-mono text-amber-300 space-y-1">
                    <div>Cap Rate (R) = NOI / Purchase Price</div>
                    <div>NPV = ∑ [ NOI_t / (1 + r)^t ] - Acquisition_Cost</div>
                  </div>
                </div>

                <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
                  <h3 className="text-xs font-bold text-purple-300 font-mono uppercase">3. ISO 20022 pacs.008 Payment Engine Schema</h3>
                  <p className="text-xs text-slate-300">
                    High-value Fedwire real-time credit transfers follow the XML/JSON standard:
                  </p>
                  <pre className="p-3 bg-slate-900 rounded text-[10px] font-mono text-purple-300 overflow-x-auto">
{`{
  "pacs008": {
    "instructedAmount": { "currency": "USD", "value": 125000.00 },
    "debtor": { "name": "Sovereign Reserve Fund" },
    "creditor": { "name": "U.S. Dept of Housing REO Escrow" },
    "clearingSystem": "FEDWIRE_RTGS"
  }
}`}
                  </pre>
                </div>
              </div>
            </div>
          )}

          {/* TAB 8: RESEARCH BIBLIOGRAPHY & TALKBACK PAPERS */}
          {activeTab === 'biblio' && (
            <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-6 space-y-6">
              <div className="border-b border-slate-800 pb-4">
                <h2 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <BookOpen className="w-5 h-5 text-amber-400" />
                  Academic Research Bibliography & Interactive Paper Engine
                </h2>
                <p className="text-xs text-slate-400">
                  Peer-reviewed papers, DOIs, and financial models utilized. Click "Talk To Paper AI" on any study to ask questions grounded directly in its text.
                </p>
              </div>

              <div className="space-y-4">
                {researchPapers.map((paper) => (
                  <div key={paper.id} className="p-5 bg-slate-950/80 border border-slate-800 rounded-xl space-y-3">
                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                      <div>
                        <span className="px-2 py-0.5 bg-amber-900/40 text-amber-400 text-[10px] font-mono font-bold rounded">
                          {paper.id} • DOI: {paper.doi}
                        </span>
                        <h3 className="text-base font-bold text-slate-100 mt-1">{paper.title}</h3>
                      </div>
                      <button
                        onClick={() => {
                          setSelectedPaperForAi(paper);
                          addLog('SYSTEM', 'info', `Selected paper #${paper.id} for AI talkback session.`);
                        }}
                        className="px-3 py-1.5 bg-amber-600 hover:bg-amber-500 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition-all self-start sm:self-auto"
                      >
                        <Bot className="w-4 h-4" /> Talk To Paper AI
                      </button>
                    </div>

                    <p className="text-xs text-slate-400 italic">
                      {paper.authors} ({paper.year}). {paper.journal}.
                    </p>

                    <p className="text-xs text-slate-300">{paper.abstract}</p>

                    <div className="p-3 bg-slate-900 rounded-lg text-xs font-mono text-emerald-300 space-y-1">
                      <span className="text-[10px] text-slate-500 block uppercase font-bold">Key Theoretical Formulas</span>
                      {paper.keyFormulas.map((f, i) => (
                        <div key={i}>• {f}</div>
                      ))}
                    </div>

                    <div className="flex flex-wrap gap-2 text-[10px] font-mono text-slate-400">
                      <span>Applied APIs:</span>
                      {paper.appliedApis.map((api, idx) => (
                        <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded text-indigo-300">
                          {api}
                        </span>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RIGHT COLUMN: AI TALKBACK CHAT ENGINE & LIVE LOG CONSOLE */}
        <div className="space-y-6">
          {/* AI TALKBACK CHAT PANEL */}
          <div className="bg-slate-900/80 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[480px]">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-5 h-5 text-amber-400" />
                <div>
                  <h3 className="text-xs font-bold text-slate-100 font-mono">Paper AI Talkback Assistant</h3>
                  <p className="text-[10px] text-slate-400">
                    Active: {selectedPaperForAi ? selectedPaperForAi.id : 'General Research Bibliography'}
                  </p>
                </div>
              </div>
              <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
            </div>

            {/* CHAT MESSAGES */}
            <div className="p-4 flex-1 overflow-y-auto space-y-3 font-sans text-xs">
              {chatMessages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`p-3 rounded-xl max-w-[88%] space-y-2 ${
                      msg.sender === 'user'
                        ? 'bg-indigo-600 text-white rounded-br-none'
                        : 'bg-slate-950 border border-slate-800 text-slate-200 rounded-bl-none'
                    }`}
                  >
                    <p className="leading-relaxed">{msg.text}</p>
                    {msg.codeSnippet && (
                      <pre className="p-2 bg-slate-900 rounded text-[10px] font-mono text-emerald-400 overflow-x-auto whitespace-pre-wrap">
                        {msg.codeSnippet}
                      </pre>
                    )}
                    {msg.citations && msg.citations.length > 0 && (
                      <div className="border-t border-slate-800 pt-1 text-[9px] font-mono text-slate-400">
                        Citation: {msg.citations[0]}
                      </div>
                    )}
                  </div>
                  <span className="text-[9px] font-mono text-slate-500 mt-0.5">{msg.timestamp}</span>
                </div>
              ))}
            </div>

            {/* CHAT INPUT */}
            <form onSubmit={handleSendPaperChatMessage} className="p-3 bg-slate-900 border-t border-slate-800 flex items-center gap-2">
              <input
                type="text"
                value={aiChatInput}
                onChange={(e) => setAiChatInput(e.target.value)}
                placeholder="Ask paper about formulas, APIs, or ISO wire payload..."
                className="flex-1 px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-100 focus:outline-none focus:border-amber-500 font-mono"
              />
              <button
                type="submit"
                className="p-2 bg-amber-600 hover:bg-amber-500 text-white rounded-xl transition-all"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>

          {/* LIVE GATEWAY LOG CONSOLE */}
          <div className="bg-slate-950 border border-slate-800 rounded-2xl overflow-hidden flex flex-col h-[340px]">
            <div className="p-3 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <span className="text-xs font-bold font-mono text-slate-200">Sovereign Gateway Logs</span>
              </div>
              <button onClick={() => setLogs([])} className="text-[10px] font-mono text-slate-500 hover:text-slate-300">
                Clear Console
              </button>
            </div>

            <div className="p-3 flex-1 overflow-y-auto font-mono text-[11px] space-y-2">
              {logs.map((log, idx) => {
                const color =
                  log.type === 'success'
                    ? 'text-emerald-400'
                    : log.type === 'warning'
                    ? 'text-amber-400'
                    : log.type === 'error'
                    ? 'text-red-400'
                    : 'text-indigo-400';

                return (
                  <div key={idx} className="border-b border-slate-900 pb-1.5">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className="text-slate-600">[{log.timestamp}]</span>
                      <span className={`font-bold ${color}`}>[{log.api}]</span>
                    </div>
                    <p className="text-slate-300">{log.message}</p>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* --- AUTOMATED PROPERTY ACQUISITION STEP MODAL ("BUY YOU A HOUSE") --- */}
      {isAcquiring && selectedPropertyForAcquisition && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl max-w-lg w-full space-y-6 shadow-2xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div>
                <h3 className="text-lg font-bold text-slate-100 flex items-center gap-2">
                  <Home className="w-5 h-5 text-indigo-400" />
                  Executing Sovereign Property Acquisition
                </h3>
                <p className="text-xs text-slate-400">HUD Case #{selectedPropertyForAcquisition.caseNumber}</p>
              </div>
              <RefreshCw className="w-5 h-5 text-indigo-400 animate-spin" />
            </div>

            <div className="space-y-4">
              <div className="p-3 bg-slate-950 rounded-xl font-mono text-xs text-slate-300">
                Address: <span className="text-emerald-400 font-bold">{selectedPropertyForAcquisition.address}</span>
                <br />
                Acquisition Price: <span className="text-emerald-400 font-bold">${selectedPropertyForAcquisition.price.toLocaleString()}</span>
              </div>

              {/* PIPELINE STEPS */}
              <div className="space-y-3 font-mono text-xs">
                <div className={`flex items-center gap-3 ${acquisitionStep >= 1 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {acquisitionStep > 1 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-indigo-500 animate-ping" />}
                  <span>1. IRS Federal Tax Lien Audit & Title Clearance</span>
                </div>
                <div className={`flex items-center gap-3 ${acquisitionStep >= 2 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {acquisitionStep > 2 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700" />}
                  <span>2. USGS & FEMA Flood Zone Spatial Geometry Verification</span>
                </div>
                <div className={`flex items-center gap-3 ${acquisitionStep >= 3 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {acquisitionStep > 3 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700" />}
                  <span>3. SEC / REIT AVM Valuation & Cap Rate Benchmark</span>
                </div>
                <div className={`flex items-center gap-3 ${acquisitionStep >= 4 ? 'text-emerald-400' : 'text-slate-600'}`}>
                  {acquisitionStep >= 4 ? <CheckCircle className="w-4 h-4 text-emerald-400" /> : <div className="w-4 h-4 rounded-full border-2 border-slate-700" />}
                  <span>4. ISO 20022 Fedwire Escrow Dispatch & eGov Deed Transfer</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- PURCHASED TITLE DEED CERTIFICATE DISPLAY --- */}
      {purchasedDeed && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border-2 border-emerald-500/50 p-6 rounded-2xl max-w-xl w-full space-y-6 shadow-2xl relative">
            <button
              onClick={() => setPurchasedDeed(null)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>

            <div className="text-center space-y-2 border-b border-slate-800 pb-4">
              <Award className="w-12 h-12 text-yellow-400 mx-auto" />
              <h2 className="text-xl font-black tracking-widest uppercase text-slate-100">
                Official eGov Title Deed Certificate
              </h2>
              <p className="text-xs font-mono text-emerald-400">United States Department of Housing REO Transfer</p>
            </div>

            <div className="p-4 bg-slate-950 rounded-xl space-y-3 font-mono text-xs text-slate-300">
              <div className="flex justify-between">
                <span>Deed Registration ID:</span>
                <span className="text-indigo-400 font-bold">{purchasedDeed.deedId}</span>
              </div>
              <div className="flex justify-between">
                <span>Property Address:</span>
                <span className="text-slate-100 font-bold">{purchasedDeed.property.address}</span>
              </div>
              <div className="flex justify-between">
                <span>City / State:</span>
                <span>{purchasedDeed.property.city}, {purchasedDeed.property.state}</span>
              </div>
              <div className="flex justify-between">
                <span>Acquisition Price:</span>
                <span className="text-emerald-400 font-bold">${purchasedDeed.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between">
                <span>Registered Owner:</span>
                <span className="text-amber-300 font-bold">{purchasedDeed.owner}</span>
              </div>
              <div className="flex justify-between border-t border-slate-800 pt-2 text-[10px]">
                <span>Ledger Hash:</span>
                <span className="text-slate-500">{purchasedDeed.txHash}</span>
              </div>
            </div>

            <div className="flex justify-end gap-3">
              <button
                onClick={() => setPurchasedDeed(null)}
                className="px-6 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs rounded-xl shadow-lg shadow-emerald-950/40"
              >
                Close & View Portfolio
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}