import React, { useState, useEffect, useMemo, useCallback, useRef } from "react";
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
  Landmark,
  Filter,
  Download,
  Gavel,
  Info,
  Plus,
  X,
  Radio,
  ChevronDown,
  ChevronUp
} from "lucide-react";

// ==========================================
// MOCK DATA GENERATORS & TYPES
// ==========================================

interface GISParcel {
  id: string;
  apn: string; // Assessor's Parcel Number
  address: string;
  owner: string;
  zoning: string;
  acres: number;
  marketValue: number;
  assessedValue: number;
  taxOwed: number;
  lienStatus: "None" | "Active Lien" | "Foreclosure Pending" | "Redeemed";
  coordinates: { lat: number; lng: number };
  yearBuilt: number;
  lastSalePrice: number;
  lastSaleDate: string;
}

interface SECFiling {
  id: string;
  company: string;
  ticker: string;
  formType: "10-K" | "10-Q" | "8-K" | "Form 4";
  filedDate: string;
  periodOfReport: string;
  cik: string;
  status: "Verified" | "Under Review" | "Flagged";
  revenue: number;
  netIncome: number;
  assets: number;
  liabilities: number;
  summary: string;
}

interface IRSTaxReturn {
  id: string;
  taxYear: number;
  entityName: string;
  ein: string;
  formType: "1120" | "1120-S" | "1065" | "990";
  grossReceipts: number;
  taxableIncome: number;
  taxLiability: number;
  creditsClaimed: number;
  status: "Draft" | "Pending" | "Accepted" | "Rejected" | "Under Audit";
  submissionDate: string;
  auditRiskScore: number; // 0 - 100
}

interface ApiEndpointStatus {
  name: string;
  agency: string;
  url: string;
  status: "Operational" | "Degraded" | "Offline";
  latency: number; // ms
  uptime: number; // %
  rateLimit: string;
}

const INITIAL_PARCELS: GISParcel[] = [
  {
    id: "P-90812",
    apn: "514-022-19-00",
    address: "1200 Brickell Ave, Miami, FL 33131",
    owner: "Sovereign Wealth Holdings LLC",
    zoning: "T6-36a-O (High Density Commercial)",
    acres: 2.4,
    marketValue: 45000000,
    assessedValue: 41200000,
    taxOwed: 741600,
    lienStatus: "None",
    coordinates: { lat: 25.7601, lng: -80.1919 },
    yearBuilt: 2015,
    lastSalePrice: 38500000,
    lastSaleDate: "2021-04-12"
  },
  {
    id: "P-44102",
    apn: "302-115-04-12",
    address: "450 SW 2nd Ave, Fort Lauderdale, FL 33301",
    owner: "Citibank Sovereign Trust",
    zoning: "RAC-CC (Regional Activity Center)",
    acres: 1.8,
    marketValue: 28500000,
    assessedValue: 26000000,
    taxOwed: 468000,
    lienStatus: "Active Lien",
    coordinates: { lat: 26.1184, lng: -80.1441 },
    yearBuilt: 2008,
    lastSalePrice: 22000000,
    lastSaleDate: "2018-11-30"
  },
  {
    id: "P-11092",
    apn: "104-008-33-50",
    address: "801 S Figueroa St, Los Angeles, CA 90017",
    owner: "Pacific Arbitrage Fund",
    zoning: "LAC2 (Commercial Zone)",
    acres: 3.1,
    marketValue: 89000000,
    assessedValue: 84500000,
    taxOwed: 1014000,
    lienStatus: "Foreclosure Pending",
    coordinates: { lat: 34.0481, lng: -118.2611 },
    yearBuilt: 2019,
    lastSalePrice: 78000000,
    lastSaleDate: "2020-01-15"
  },
  {
    id: "P-77210",
    apn: "088-412-09-11",
    address: "100 Wall St, New York, NY 10005",
    owner: "Cabal Asset Management",
    zoning: "C5-5 (Restricted Central Commercial)",
    acres: 0.9,
    marketValue: 125000000,
    assessedValue: 118000000,
    taxOwed: 2360000,
    lienStatus: "None",
    coordinates: { lat: 40.7042, lng: -74.0079 },
    yearBuilt: 1969,
    lastSalePrice: 110000000,
    lastSaleDate: "2015-08-22"
  },
  {
    id: "P-33219",
    apn: "210-099-15-44",
    address: "1500 K St NW, Washington, DC 20005",
    owner: "Federal Lobbying Headquarters Inc",
    zoning: "C-4 (Downtown Commercial)",
    acres: 1.2,
    marketValue: 52000000,
    assessedValue: 49500000,
    taxOwed: 915750,
    lienStatus: "Redeemed",
    coordinates: { lat: 38.9025, lng: -77.0342 },
    yearBuilt: 1995,
    lastSalePrice: 46000000,
    lastSaleDate: "2012-06-05"
  }
];

const INITIAL_FILINGS: SECFiling[] = [
  {
    id: "SEC-0001193125-24-001",
    company: "Citigroup Inc.",
    ticker: "C",
    formType: "10-K",
    filedDate: "2024-02-23",
    periodOfReport: "2023-12-31",
    cik: "0000831001",
    status: "Verified",
    revenue: 78500000000,
    netIncome: 9200000000,
    assets: 2400000000000,
    liabilities: 2210000000000,
    summary: "Annual report detailing global consumer banking operations, institutional clients group performance, and comprehensive risk exposure to sovereign debt markets."
  },
  {
    id: "SEC-0000200406-24-002",
    company: "Goldman Sachs Group, Inc.",
    ticker: "GS",
    formType: "10-Q",
    filedDate: "2024-05-08",
    periodOfReport: "2024-03-31",
    cik: "0000886982",
    status: "Verified",
    revenue: 14210000000,
    netIncome: 4130000000,
    assets: 1640000000000,
    liabilities: 1520000000000,
    summary: "Quarterly report highlighting strong investment banking fees, fixed income market-making surges, and strategic asset management reallocation."
  },
  {
    id: "SEC-0001104659-24-005",
    company: "Lockheed Martin Corp",
    ticker: "LMT",
    formType: "8-K",
    filedDate: "2024-06-15",
    periodOfReport: "2024-06-14",
    cik: "0000936468",
    status: "Flagged",
    revenue: 67500000000,
    netIncome: 6900000000,
    assets: 54000000000,
    liabilities: 47000000000,
    summary: "Material definitive agreement announcement regarding a major defense contract modification with the Department of Defense for advanced aerospace systems."
  },
  {
    id: "SEC-0000320193-24-003",
    company: "Apple Inc.",
    ticker: "AAPL",
    formType: "10-K",
    filedDate: "2023-10-31",
    periodOfReport: "2023-09-30",
    cik: "0000320193",
    status: "Verified",
    revenue: 383285000000,
    netIncome: 96995000000,
    assets: 352583000000,
    liabilities: 290437000000,
    summary: "Annual report showcasing record services revenue, global hardware supply chain resilience, and massive capital return program execution."
  }
];

const INITIAL_TAX_RETURNS: IRSTaxReturn[] = [
  {
    id: "TX-2023-001",
    taxYear: 2023,
    entityName: "Sovereign Tech Systems Corp",
    ein: "12-3456789",
    formType: "1120",
    grossReceipts: 12500000,
    taxableIncome: 2400000,
    taxLiability: 504000,
    creditsClaimed: 45000,
    status: "Accepted",
    submissionDate: "2024-03-15",
    auditRiskScore: 12
  },
  {
    id: "TX-2023-002",
    taxYear: 2023,
    entityName: "Cabal Real Estate Holdings",
    ein: "98-7654321",
    formType: "1065",
    grossReceipts: 45000000,
    taxableIncome: 8900000,
    taxLiability: 0, // Pass-through
    creditsClaimed: 120000,
    status: "Under Audit",
    submissionDate: "2024-04-10",
    auditRiskScore: 78
  },
  {
    id: "TX-2023-003",
    taxYear: 2023,
    entityName: "Global Philanthropy Foundation",
    ein: "45-0987654",
    formType: "990",
    grossReceipts: 8500000,
    taxableIncome: 0, // Tax-exempt
    taxLiability: 0,
    creditsClaimed: 0,
    status: "Pending",
    submissionDate: "2024-05-01",
    auditRiskScore: 35
  },
  {
    id: "TX-2023-004",
    taxYear: 2023,
    entityName: "Quantum Arbitrage Inc",
    ein: "33-4455667",
    formType: "1120-S",
    grossReceipts: 98000000,
    taxableIncome: 18500000,
    taxLiability: 3885000,
    creditsClaimed: 450000,
    status: "Draft",
    submissionDate: "N/A",
    auditRiskScore: 55
  }
];

const INITIAL_API_STATUS: ApiEndpointStatus[] = [
  {
    name: "IRS Modernized e-File (MeF)",
    agency: "IRS",
    url: "https://api.irs.gov/mef/v11/submissions",
    status: "Operational",
    latency: 142,
    uptime: 99.95,
    rateLimit: "10,000 req/hr"
  },
  {
    name: "SEC EDGAR Public Query",
    agency: "SEC",
    url: "https://data.sec.gov/submissions/CIK{cik}.json",
    status: "Operational",
    latency: 88,
    uptime: 99.98,
    rateLimit: "10 req/sec"
  },
  {
    name: "USGS GIS Parcel Mapping",
    agency: "USGS",
    url: "https://services.nationalmap.gov/arcgis/rest/services",
    status: "Degraded",
    latency: 450,
    uptime: 98.4,
    rateLimit: "Unlimited"
  },
  {
    name: "HUD Housing & Urban Dev",
    agency: "HUD",
    url: "https://api.huduser.gov/portal/ushmc/v1.0",
    status: "Operational",
    latency: 195,
    uptime: 99.7,
    rateLimit: "5,000 req/day"
  },
  {
    name: "Federal Reserve Financial Data",
    agency: "FED",
    url: "https://api.stlouisfed.org/fred/series",
    status: "Operational",
    latency: 110,
    uptime: 99.99,
    rateLimit: "120 req/min"
  }
];

export default function GovernmentApiDashboard_v2() {
  // State Management
  const [activeTab, setActiveTab] = useState<"gis" | "sec" | "irs" | "gateway">("gis");
  const [parcels, setParcels] = useState<GISParcel[]>(INITIAL_PARCELS);
  const [filings, setFilings] = useState<SECFiling[]>(INITIAL_FILINGS);
  const [taxReturns, setTaxReturns] = useState<IRSTaxReturn[]>(INITIAL_TAX_RETURNS);
  const [apiStatuses, setApiStatuses] = useState<ApiEndpointStatus[]>(INITIAL_API_STATUS);

  // Search & Filter States
  const [gisSearch, setGisSearch] = useState("");
  const [gisLienFilter, setGisLienFilter] = useState<string>("All");
  const [secSearch, setSecSearch] = useState("");
  const [secFormFilter, setSecFormFilter] = useState<string>("All");
  const [irsSearch, setIrsSearch] = useState("");
  const [irsStatusFilter, setIrsStatusFilter] = useState<string>("All");

  // Selected Item Details Modals
  const [selectedParcel, setSelectedParcel] = useState<GISParcel | null>(INITIAL_PARCELS[0]);
  const [selectedFiling, setSelectedFiling] = useState<SECFiling | null>(INITIAL_FILINGS[0]);
  const [selectedTaxReturn, setSelectedTaxReturn] = useState<IRSTaxReturn | null>(INITIAL_TAX_RETURNS[0]);

  // Interactive Map Simulation State
  const [mapZoom, setMapZoom] = useState<number>(12);
  const [mapCenter, setMapCenter] = useState<{ lat: number; lng: number }>({ lat: 25.7601, lng: -80.1919 });
  const [isDrawing, setIsDrawing] = useState(false);
  const [drawnArea, setDrawnArea] = useState<string | null>(null);

  // AI Assistant Chat State
  const [chatInput, setChatInput] = useState("");
  const [chatMessages, setChatMessages] = useState<Array<{ sender: "user" | "ai"; text: string; timestamp: string }>>([
    {
      sender: "ai",
      text: "Welcome to the Sovereign Government API Gateway. I can help you analyze GIS land parcels, cross-reference SEC corporate filings, or run IRS tax compliance audits. What would you like to investigate?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);

  // Live Terminal Logs
  const [terminalLogs, setTerminalLogs] = useState<string[]>([
    "[SYSTEM] Initializing Federal API Gateway Handshake...",
    "[IRS] Connected to Modernized e-File (MeF) Production Environment.",
    "[SEC] EDGAR API connection established. Rate limit: 10 req/sec.",
    "[GIS] USGS Spatial Server connected. Warning: High latency detected on node US-EAST-1.",
    "[SYSTEM] Ready for sovereign intelligence queries."
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll terminal logs
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [terminalLogs]);

  // Simulate Live API Latency Fluctuations
  useEffect(() => {
    const interval = setInterval(() => {
      setApiStatuses((prev) =>
        prev.map((api) => {
          const change = Math.floor(Math.random() * 31) - 15; // -15ms to +15ms
          const newLatency = Math.max(20, api.latency + change);
          let newStatus = api.status;
          if (newLatency > 400) newStatus = "Degraded";
          else if (newLatency < 350 && api.status === "Degraded") newStatus = "Operational";
          return { ...api, latency: newLatency, status: newStatus };
        })
      );

      // Randomly add a terminal log
      const agencies = ["IRS", "SEC", "GIS", "HUD", "FED"];
      const randomAgency = agencies[Math.floor(Math.random() * agencies.length)];
      const randomEvents = [
        `Queried endpoint successfully. Status 200 OK.`,
        `Rate limit check passed. Remaining quota: 94%.`,
        `Synchronized ledger state with federal node.`,
        `Latency spike detected on regional gateway.`
      ];
      const randomEvent = randomEvents[Math.floor(Math.random() * randomEvents.length)];
      addLog(`[${randomAgency}] ${randomEvent}`);
    }, 8000);

    return () => clearInterval(interval);
  }, []);

  const addLog = (msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setTerminalLogs((prev) => [...prev, `[${timestamp}] ${msg}`].slice(-50)); // Keep last 50 logs
  };

  // Filtered Data Computations
  const filteredParcels = useMemo(() => {
    return parcels.filter((p) => {
      const matchesSearch =
        p.address.toLowerCase().includes(gisSearch.toLowerCase()) ||
        p.owner.toLowerCase().includes(gisSearch.toLowerCase()) ||
        p.apn.includes(gisSearch);
      const matchesLien = gisLienFilter === "All" || p.lienStatus === gisLienFilter;
      return matchesSearch && matchesLien;
    });
  }, [parcels, gisSearch, gisLienFilter]);

  const filteredFilings = useMemo(() => {
    return filings.filter((f) => {
      const matchesSearch =
        f.company.toLowerCase().includes(secSearch.toLowerCase()) ||
        f.ticker.toLowerCase().includes(secSearch.toLowerCase()) ||
        f.cik.includes(secSearch);
      const matchesForm = secFormFilter === "All" || f.formType === secFormFilter;
      return matchesSearch && matchesForm;
    });
  }, [filings, secSearch, secFormFilter]);

  const filteredTaxReturns = useMemo(() => {
    return taxReturns.filter((t) => {
      const matchesSearch =
        t.entityName.toLowerCase().includes(irsSearch.toLowerCase()) ||
        t.ein.includes(irsSearch);
      const matchesStatus = irsStatusFilter === "All" || t.status === irsStatusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [taxReturns, irsSearch, irsStatusFilter]);

  // Interactive Map Actions
  const handleParcelClick = (parcel: GISParcel) => {
    setSelectedParcel(parcel);
    setMapCenter(parcel.coordinates);
    setMapZoom(15);
    addLog(`[GIS] Map centered on APN: ${parcel.apn} (${parcel.address})`);
  };

  const triggerDrawTool = () => {
    setIsDrawing(true);
    addLog("[GIS] Drawing tool activated. Click on map to define custom boundary.");
    setTimeout(() => {
      setIsDrawing(false);
      setDrawnArea("Polygon (4 vertices, 12.4 Acres)");
      addLog("[GIS] Custom boundary drawn. Found 2 intersecting parcels.");
    }, 3000);
  };

  const clearDrawnArea = () => {
    setDrawnArea(null);
    addLog("[GIS] Custom boundary cleared.");
  };

  // IRS Tax Filing Actions
  const handleCreateTaxReturn = () => {
    const newReturn: IRSTaxReturn = {
      id: `TX-2023-00${taxReturns.length + 1}`,
      taxYear: 2023,
      entityName: "New Sovereign Venture Corp",
      ein: "44-9988776",
      formType: "1120",
      grossReceipts: 5000000,
      taxableIncome: 850000,
      taxLiability: 178500,
      creditsClaimed: 15000,
      status: "Draft",
      submissionDate: "N/A",
      auditRiskScore: Math.floor(Math.random() * 40) + 10
    };
    setTaxReturns([newReturn, ...taxReturns]);
    setSelectedTaxReturn(newReturn);
    addLog(`[IRS] Created new tax return draft for ${newReturn.entityName}`);
  };

  const handleFileTaxReturn = (id: string) => {
    setTaxReturns((prev) =>
      prev.map((t) => {
        if (t.id === id) {
          addLog(`[IRS] Submitting Form ${t.formType} for ${t.entityName} to IRS MeF Gateway...`);
          return {
            ...t,
            status: "Pending",
            submissionDate: new Date().toISOString().split("T")[0]
          };
        }
        return t;
      })
    );

    // Simulate IRS acceptance after 4 seconds
    setTimeout(() => {
      setTaxReturns((prev) =>
        prev.map((t) => {
          if (t.id === id) {
            addLog(`[IRS] MeF Gateway Response: Form ${t.formType} for ${t.entityName} ACCEPTED. Receipt ID: MeF-REC-${Math.floor(Math.random() * 900000 + 100000)}`);
            return { ...t, status: "Accepted" };
          }
          return t;
        })
      );
    }, 4000);
  };

  // SEC Filing Actions
  const handleFetchSecFilings = () => {
    addLog("[SEC] Querying EDGAR database for recent financial filings...");
    // Simulate fetching a new filing
    setTimeout(() => {
      const newFiling: SECFiling = {
        id: `SEC-0001209191-24-00${filings.length + 1}`,
        company: "Raytheon Technologies Corp",
        ticker: "RTX",
        formType: "10-Q",
        filedDate: new Date().toISOString().split("T")[0],
        periodOfReport: "2024-03-31",
        cik: "0000101829",
        status: "Verified",
        revenue: 19300000000,
        netIncome: 1700000000,
        assets: 162000000000,
        liabilities: 88000000000,
        summary: "Quarterly report detailing defense systems backlog, commercial aviation recovery, and capital expenditure on advanced missile defense systems."
      };
      setFilings([newFiling, ...filings]);
      setSelectedFiling(newFiling);
      addLog(`[SEC] Successfully parsed and ingested SEC filing for ${newFiling.company} (${newFiling.ticker})`);
    }, 1500);
  };

  // AI Assistant Chat Logic
  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setChatMessages((prev) => [...prev, { sender: "user", text: userMsg, timestamp: new Date().toLocaleTimeString() }]);
    setChatInput("");
    setIsAiTyping(true);

    // Simulate AI response based on keywords
    setTimeout(() => {
      let aiResponse = "I have processed your query. Let me cross-reference our federal databases to find the relevant information.";
      const lowerMsg = userMsg.toLowerCase();

      if (lowerMsg.includes("parcel") || lowerMsg.includes("gis") || lowerMsg.includes("land")) {
        aiResponse = `I found ${parcels.length} active GIS parcels in our database. The highest value parcel is located at ${parcels[3].address} owned by ${parcels[3].owner}, valued at $${(parcels[3].marketValue / 1000000).toFixed(1)}M. There is currently an active tax lien on ${parcels[1].address} for $${parcels[1].taxOwed.toLocaleString()}.`;
      } else if (lowerMsg.includes("sec") || lowerMsg.includes("filing") || lowerMsg.includes("revenue")) {
        aiResponse = `Analyzing SEC EDGAR filings. Citigroup Inc. (Ticker: C) filed its 10-K on ${filings[0].filedDate} reporting a total revenue of $${(filings[0].revenue / 1000000000).toFixed(1)}B and net income of $${(filings[0].netIncome / 1000000000).toFixed(1)}B. I have flagged Lockheed Martin's 8-K filing due to unusual contract modifications.`;
      } else if (lowerMsg.includes("tax") || lowerMsg.includes("irs") || lowerMsg.includes("audit")) {
        aiResponse = `IRS MeF Gateway is fully operational. We have ${taxReturns.filter(t => t.status === "Under Audit").length} entity currently under audit: ${taxReturns.find(t => t.status === "Under Audit")?.entityName}. Their audit risk score is evaluated at ${taxReturns.find(t => t.status === "Under Audit")?.auditRiskScore}/100 due to high R&D tax credits claimed relative to gross receipts.`;
      } else if (lowerMsg.includes("cabal") || lowerMsg.includes("conspiracy") || lowerMsg.includes("lobby")) {
        aiResponse = `Cross-referencing GIS parcel owners with SEC filings. Cabal Asset Management (owner of 100 Wall St) has direct financial ties to several lobbying entities registered in Washington DC. I recommend initiating a joint SEC-IRS audit on their pass-through real estate entities.`;
      }

      setChatMessages((prev) => [...prev, { sender: "ai", text: aiResponse, timestamp: new Date().toLocaleTimeString() }]);
      setIsAiTyping(false);
      addLog(`[AI Assistant] Responded to query: "${userMsg.substring(0, 20)}..."`);
    }, 1500);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50 px-6 py-4 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-500/10 border border-emerald-500/30 rounded-lg text-emerald-400">
            <Landmark className="w-6 h-6" />
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight flex items-center gap-2">
              Sovereign Government API Gateway
              <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                v2.4-PROD
              </span>
            </h1>
            <p className="text-xs text-slate-400">
              Unified Federal Intelligence Portal: IRS MeF, SEC EDGAR, & USGS GIS Spatial Systems
            </p>
          </div>
        </div>

        {/* Live Status Bar */}
        <div className="flex flex-wrap items-center gap-4 text-xs font-mono">
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">IRS MeF:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span className="text-slate-400">SEC EDGAR:</span>
            <span className="text-emerald-400 font-bold">ONLINE</span>
          </div>
          <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-md border border-slate-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-amber-500"></span>
            </span>
            <span className="text-slate-400">USGS GIS:</span>
            <span className="text-amber-400 font-bold">DEGRADED</span>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <div className="flex-1 grid grid-cols-1 xl:grid-cols-4 gap-6 p-6">
        
        {/* Left Column: Navigation & AI Assistant */}
        <div className="xl:col-span-1 flex flex-col gap-6">
          
          {/* Tab Navigation Card */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 shadow-xl">
            <h2 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 px-2">
              Federal Subsystems
            </h2>
            <nav className="flex flex-col gap-1">
              <button
                onClick={() => setActiveTab("gis")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "gis"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Map className="w-4 h-4" />
                  <span>USGS GIS Property Map</span>
                </div>
                <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-mono">
                  {parcels.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("sec")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "sec"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <FileText className="w-4 h-4" />
                  <span>SEC EDGAR Filings</span>
                </div>
                <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-mono">
                  {filings.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("irs")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "irs"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Landmark className="w-4 h-4" />
                  <span>IRS Tax Compliance</span>
                </div>
                <span className="text-xs bg-slate-950 px-2 py-0.5 rounded text-slate-400 font-mono">
                  {taxReturns.length}
                </span>
              </button>

              <button
                onClick={() => setActiveTab("gateway")}
                className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-all ${
                  activeTab === "gateway"
                    ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                    : "text-slate-300 hover:bg-slate-800/50 hover:text-white border border-transparent"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Activity className="w-4 h-4" />
                  <span>API Gateway Monitor</span>
                </div>
                <span className="text-xs bg-emerald-500/20 text-emerald-400 px-2 py-0.5 rounded font-mono">
                  99.2%
                </span>
              </button>
            </nav>
          </div>

          {/* AI Sovereign Assistant Chat */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl flex-1 flex flex-col overflow-hidden shadow-xl min-h-[350px]">
            <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Bot className="w-4 h-4 text-emerald-400" />
                <span className="text-sm font-semibold">Sovereign GovAgent</span>
              </div>
              <span className="flex h-2 w-2 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 p-4 overflow-y-auto space-y-4 text-xs max-h-[400px]">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col max-w-[85%] rounded-lg p-3 ${
                    msg.sender === "user"
                      ? "bg-slate-800 text-slate-100 ml-auto border border-slate-700"
                      : "bg-emerald-950/30 text-emerald-300 mr-auto border border-emerald-900/50"
                  }`}
                >
                  <p className="leading-relaxed">{msg.text}</p>
                  <span className="text-[10px] text-slate-500 mt-1 self-end font-mono">
                    {msg.timestamp}
                  </span>
                </div>
              ))}
              {isAiTyping && (
                <div className="bg-emerald-950/30 text-emerald-300 mr-auto border border-emerald-900/50 rounded-lg p-3 flex items-center gap-2 max-w-[85%]">
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.2s]"></span>
                  <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full animate-bounce [animation-delay:0.4s]"></span>
                </div>
              )}
            </div>

            {/* Chat Input */}
            <form onSubmit={handleSendMessage} className="p-3 border-t border-slate-800 bg-slate-950 flex gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask GovAgent to audit or search..."
                className="flex-1 bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-100 placeholder-slate-500"
              />
              <button
                type="submit"
                className="p-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg transition-colors"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>

        {/* Center & Right Columns: Active Subsystem View */}
        <div className="xl:col-span-3 flex flex-col gap-6">
          
          {/* USGS GIS Property Map Subsystem */}
          {activeTab === "gis" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Interactive Map Simulator */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex flex-wrap items-center justify-between gap-4">
                  <div className="flex items-center gap-2">
                    <Map className="w-5 h-5 text-emerald-400" />
                    <h3 className="font-semibold text-sm">USGS Spatial Parcel Map (Fort Lauderdale / Miami)</h3>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={triggerDrawTool}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors"
                    >
                      <Layers className="w-3.5 h-3.5 text-emerald-400" />
                      Draw Boundary
                    </button>
                    {drawnArea && (
                      <button
                        onClick={clearDrawnArea}
                        className="p-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/30 text-red-400 rounded-lg transition-colors"
                        title="Clear Boundary"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>
                </div>

                {/* Simulated Map Canvas */}
                <div className="relative flex-1 min-h-[400px] bg-slate-950 flex items-center justify-center overflow-hidden">
                  {/* Grid Background */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_right,#1e293b_1px,transparent_1px),linear-gradient(to_bottom,#1e293b_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_50%,#000_70%,transparent_100%)] opacity-40"></div>

                  {/* Simulated Land Parcels */}
                  <div className="absolute inset-0 p-8 flex items-center justify-center">
                    <div className="relative w-full h-full max-w-md max-h-md border border-slate-800/50 rounded-full flex items-center justify-center">
                      {/* Concentric rings */}
                      <div className="absolute w-3/4 h-3/4 border border-slate-800/30 rounded-full"></div>
                      <div className="absolute w-1/2 h-1/2 border border-slate-800/20 rounded-full"></div>

                      {/* Parcel Markers */}
                      {parcels.map((p) => {
                        // Map coordinates to relative positions
                        const left = `${((p.coordinates.lng + 80.2) * 1000) % 80 + 10}%`;
                        const top = `${((p.coordinates.lat - 25.7) * 1000) % 80 + 10}%`;

                        const isSelected = selectedParcel?.id === p.id;

                        return (
                          <button
                            key={p.id}
                            onClick={() => handleParcelClick(p)}
                            style={{ left, top }}
                            className={`absolute p-2 rounded-lg border transition-all transform hover:scale-110 flex flex-col items-center gap-1 ${
                              isSelected
                                ? "bg-emerald-500/20 border-emerald-400 text-emerald-400 z-20 shadow-lg shadow-emerald-500/10"
                                : p.lienStatus === "Active Lien"
                                ? "bg-amber-500/10 border-amber-500/40 text-amber-400"
                                : p.lienStatus === "Foreclosure Pending"
                                ? "bg-red-500/10 border-red-500/40 text-red-400"
                                : "bg-slate-900/80 border-slate-700 text-slate-300"
                            }`}
                          >
                            <MapPin className="w-4 h-4" />
                            <span className="text-[9px] font-mono bg-slate-950/90 px-1 rounded border border-slate-800">
                              {p.apn}
                            </span>
                          </button>
                        );
                      })}

                      {/* Simulated Drawn Area */}
                      {drawnArea && (
                        <div className="absolute w-48 h-48 border-2 border-dashed border-emerald-500 bg-emerald-500/5 rounded-xl animate-pulse flex items-center justify-center">
                          <span className="text-[10px] font-mono text-emerald-400 bg-slate-950 px-2 py-1 rounded border border-emerald-500/30">
                            Custom Boundary Active
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Map Controls Overlay */}
                  <div className="absolute bottom-4 left-4 bg-slate-900/90 border border-slate-800 rounded-lg p-2 flex flex-col gap-1 text-[10px] font-mono">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-emerald-500 rounded-sm"></span>
                      <span>Clear / Sovereign Owned</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-amber-500 rounded-sm"></span>
                      <span>Active Tax Lien</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 bg-red-500 rounded-sm"></span>
                      <span>Foreclosure Pending</span>
                    </div>
                  </div>

                  <div className="absolute bottom-4 right-4 bg-slate-900/90 border border-slate-800 rounded-lg px-3 py-1.5 text-xs font-mono flex items-center gap-3">
                    <span>Zoom: {mapZoom}x</span>
                    <span>Lat: {mapCenter.lat.toFixed(4)}</span>
                    <span>Lng: {mapCenter.lng.toFixed(4)}</span>
                  </div>
                </div>
              </div>

              {/* Parcel Details & Search */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Database className="w-4 h-4 text-emerald-400" />
                    Land Registry Search
                  </h3>
                </div>

                {/* Search & Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={gisSearch}
                      onChange={(e) => setGisSearch(e.target.value)}
                      placeholder="Search APN, Owner, Address..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Lien Status:</span>
                    <select
                      value={gisLienFilter}
                      onChange={(e) => setGisLienFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-emerald-500 text-slate-300"
                    >
                      <option value="All">All</option>
                      <option value="None">None</option>
                      <option value="Active Lien">Active Lien</option>
                      <option value="Foreclosure Pending">Foreclosure Pending</option>
                      <option value="Redeemed">Redeemed</option>
                    </select>
                  </div>
                </div>

                {/* Parcel List */}
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[200px] pr-1">
                  {filteredParcels.map((p) => (
                    <button
                      key={p.id}
                      onClick={() => handleParcelClick(p)}
                      className={`w-full text-left p-2.5 rounded-lg border transition-all flex justify-between items-center ${
                        selectedParcel?.id === p.id
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div className="truncate pr-2">
                        <div className="text-xs font-mono font-bold">{p.apn}</div>
                        <div className="text-[10px] text-slate-400 truncate">{p.address}</div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </button>
                  ))}
                  {filteredParcels.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500">No parcels match filters.</div>
                  )}
                </div>

                {/* Selected Parcel Details Card */}
                {selectedParcel && (
                  <div className="bg-slate-950 border border-slate-800 rounded-lg p-3 space-y-3 text-xs">
                    <div className="flex justify-between items-start border-b border-slate-800 pb-2">
                      <div>
                        <span className="text-[10px] text-slate-500 font-mono">APN: {selectedParcel.apn}</span>
                        <h4 className="font-bold text-slate-200">{selectedParcel.address}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                        selectedParcel.lienStatus === "None"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : selectedParcel.lienStatus === "Active Lien"
                          ? "bg-amber-500/10 border-amber-500/20 text-amber-400"
                          : "bg-red-500/10 border-red-500/20 text-red-400"
                      }`}>
                        {selectedParcel.lienStatus}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 font-mono text-[11px]">
                      <div>
                        <span className="text-slate-500 block text-[9px]">OWNER</span>
                        <span className="text-slate-300 truncate block">{selectedParcel.owner}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">ZONING</span>
                        <span className="text-slate-300 block">{selectedParcel.zoning}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">MARKET VALUE</span>
                        <span className="text-emerald-400 font-bold">${selectedParcel.marketValue.toLocaleString()}</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block text-[9px]">TAX OWED</span>
                        <span className="text-red-400 font-bold">${selectedParcel.taxOwed.toLocaleString()}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 flex justify-between items-center text-[10px] text-slate-400">
                      <span>Acres: {selectedParcel.acres}</span>
                      <span>Built: {selectedParcel.yearBuilt}</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* SEC EDGAR Filings Subsystem */}
          {activeTab === "sec" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Filings List & Search */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <FileText className="w-4 h-4 text-emerald-400" />
                    SEC EDGAR Database
                  </h3>
                  <button
                    onClick={handleFetchSecFilings}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Fetch Recent Filings"
                  >
                    <RefreshCw className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={secSearch}
                      onChange={(e) => setSecSearch(e.target.value)}
                      placeholder="Search Ticker, Company, CIK..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Form Type:</span>
                    <select
                      value={secFormFilter}
                      onChange={(e) => setSecFormFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-emerald-500 text-slate-300"
                    >
                      <option value="All">All Forms</option>
                      <option value="10-K">10-K (Annual)</option>
                      <option value="10-Q">10-Q (Quarterly)</option>
                      <option value="8-K">8-K (Material Event)</option>
                    </select>
                  </div>
                </div>

                {/* Filings List */}
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] pr-1">
                  {filteredFilings.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFiling(f)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                        selectedFiling?.id === f.id
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold bg-slate-900 px-1.5 py-0.5 rounded border border-slate-800 text-slate-200">
                            {f.ticker}
                          </span>
                          <span className="text-xs font-bold text-slate-300 truncate max-w-[120px]">{f.company}</span>
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Form {f.formType} • {f.filedDate}
                        </div>
                      </div>
                      <ChevronRight className="w-4 h-4 flex-shrink-0" />
                    </button>
                  ))}
                  {filteredFilings.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500">No filings match filters.</div>
                  )}
                </div>
              </div>

              {/* Filing Detail Viewer */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl">
                {selectedFiling ? (
                  <>
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            SEC EDGAR INGESTED
                          </span>
                          <span className="text-xs font-mono text-slate-500">CIK: {selectedFiling.cik}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">
                          {selectedFiling.company} ({selectedFiling.ticker})
                        </h3>
                        <p className="text-xs text-slate-400">
                          Filing ID: {selectedFiling.id} • Filed on {selectedFiling.filedDate}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${
                          selectedFiling.status === "Verified"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : "bg-red-500/10 border-red-500/20 text-red-400"
                        }`}>
                          {selectedFiling.status}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300">
                          Form {selectedFiling.formType}
                        </span>
                      </div>
                    </div>

                    {/* Financial Highlights Extracted */}
                    <div>
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-3 flex items-center gap-1.5">
                        <TrendingUp className="w-4 h-4 text-emerald-400" />
                        Extracted Financial Statement Highlights
                      </h4>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                          <span className="text-[10px] text-slate-500 font-mono block">REVENUE</span>
                          <span className="text-sm font-bold text-slate-200 font-mono">
                            ${(selectedFiling.revenue / 1000000000).toFixed(2)}B
                          </span>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                          <span className="text-[10px] text-slate-500 font-mono block">NET INCOME</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">
                            ${(selectedFiling.netIncome / 1000000000).toFixed(2)}B
                          </span>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                          <span className="text-[10px] text-slate-500 font-mono block">TOTAL ASSETS</span>
                          <span className="text-sm font-bold text-slate-200 font-mono">
                            ${(selectedFiling.assets / 1000000000).toFixed(2)}B
                          </span>
                        </div>
                        <div className="bg-slate-950 border border-slate-800 rounded-lg p-3">
                          <span className="text-[10px] text-slate-500 font-mono block">TOTAL LIABILITIES</span>
                          <span className="text-sm font-bold text-red-400 font-mono">
                            ${(selectedFiling.liabilities / 1000000000).toFixed(2)}B
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Filing Summary */}
                    <div className="space-y-2">
                      <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                        <BookOpen className="w-4 h-4 text-emerald-400" />
                        Executive Summary & Risk Disclosures
                      </h4>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 text-xs text-slate-300 leading-relaxed">
                        {selectedFiling.summary}
                      </div>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <Download className="w-4 h-4" />
                        Download Full XBRL
                      </button>
                      <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors">
                        <ExternalLink className="w-4 h-4" />
                        View on SEC EDGAR
                      </button>
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                    <FileText className="w-12 h-12 mb-2 text-slate-700" />
                    <p className="text-sm">Select an SEC filing to view extracted intelligence.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* IRS Tax Compliance Subsystem */}
          {activeTab === "irs" && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Tax Returns List & Search */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 flex flex-col gap-4 shadow-xl">
                <div className="flex items-center justify-between">
                  <h3 className="font-semibold text-sm flex items-center gap-2">
                    <Landmark className="w-4 h-4 text-emerald-400" />
                    IRS MeF Submissions
                  </h3>
                  <button
                    onClick={handleCreateTaxReturn}
                    className="p-1.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1 transition-colors"
                    title="Draft New Return"
                  >
                    <Plus className="w-3.5 h-3.5 text-emerald-400" />
                  </button>
                </div>

                {/* Search & Filters */}
                <div className="space-y-2">
                  <div className="relative">
                    <Search className="absolute left-2.5 top-2.5 w-4 h-4 text-slate-500" />
                    <input
                      type="text"
                      value={irsSearch}
                      onChange={(e) => setIrsSearch(e.target.value)}
                      placeholder="Search Entity, EIN..."
                      className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs focus:outline-none focus:border-emerald-500 text-slate-100"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] text-slate-400 font-mono">Status:</span>
                    <select
                      value={irsStatusFilter}
                      onChange={(e) => setIrsStatusFilter(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-[10px] focus:outline-none focus:border-emerald-500 text-slate-300"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Draft">Draft</option>
                      <option value="Pending">Pending</option>
                      <option value="Accepted">Accepted</option>
                      <option value="Under Audit">Under Audit</option>
                    </select>
                  </div>
                </div>

                {/* Tax Returns List */}
                <div className="flex-1 overflow-y-auto space-y-2 max-h-[350px] pr-1">
                  {filteredTaxReturns.map((t) => (
                    <button
                      key={t.id}
                      onClick={() => setSelectedTaxReturn(t)}
                      className={`w-full text-left p-3 rounded-lg border transition-all flex justify-between items-center ${
                        selectedTaxReturn?.id === t.id
                          ? "bg-emerald-500/10 border-emerald-500/30 text-emerald-400"
                          : "bg-slate-950 border-slate-800 hover:border-slate-700 text-slate-300"
                      }`}
                    >
                      <div>
                        <div className="text-xs font-bold text-slate-200">{t.entityName}</div>
                        <div className="text-[10px] text-slate-500 mt-1 font-mono">
                          Form {t.formType} • EIN: {t.ein}
                        </div>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                        t.status === "Accepted"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : t.status === "Under Audit"
                          ? "bg-red-500/10 border-red-500/20 text-red-400"
                          : "bg-slate-800 border-slate-700 text-slate-400"
                      }`}>
                        {t.status}
                      </span>
                    </button>
                  ))}
                  {filteredTaxReturns.length === 0 && (
                    <div className="text-center py-6 text-xs text-slate-500">No tax returns match filters.</div>
                  )}
                </div>
              </div>

              {/* Tax Return Detail Viewer */}
              <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col gap-6 shadow-xl">
                {selectedTaxReturn ? (
                  <>
                    <div className="flex flex-wrap justify-between items-start gap-4 border-b border-slate-800 pb-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-xs font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 px-2 py-0.5 rounded">
                            IRS MeF SUBMISSION
                          </span>
                          <span className="text-xs font-mono text-slate-500">EIN: {selectedTaxReturn.ein}</span>
                        </div>
                        <h3 className="text-lg font-bold text-slate-100">
                          {selectedTaxReturn.entityName}
                        </h3>
                        <p className="text-xs text-slate-400">
                          Submission ID: {selectedTaxReturn.id} • Tax Year: {selectedTaxReturn.taxYear}
                        </p>
                      </div>

                      <div className="flex items-center gap-2">
                        <span className={`px-2.5 py-1 rounded-full text-xs font-mono border ${
                          selectedTaxReturn.status === "Accepted"
                            ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                            : selectedTaxReturn.status === "Under Audit"
                            ? "bg-red-500/10 border-red-500/20 text-red-400"
                            : "bg-slate-800 border-slate-700 text-slate-300"
                        }`}>
                          {selectedTaxReturn.status}
                        </span>
                        <span className="px-2.5 py-1 bg-slate-800 border border-slate-700 rounded-full text-xs font-mono text-slate-300">
                          Form {selectedTaxReturn.formType}
                        </span>
                      </div>
                    </div>

                    {/* Financial Data & Calculations */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono block">GROSS RECEIPTS</span>
                        <span className="text-base font-bold text-slate-200 font-mono">
                          ${selectedTaxReturn.grossReceipts.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono block">TAXABLE INCOME</span>
                        <span className="text-base font-bold text-slate-200 font-mono">
                          ${selectedTaxReturn.taxableIncome.toLocaleString()}
                        </span>
                      </div>
                      <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-1">
                        <span className="text-[10px] text-slate-500 font-mono block">TAX LIABILITY</span>
                        <span className="text-base font-bold text-red-400 font-mono">
                          ${selectedTaxReturn.taxLiability.toLocaleString()}
                        </span>
                      </div>
                    </div>

                    {/* Audit Risk Assessment */}
                    <div className="bg-slate-950 border border-slate-800 rounded-lg p-4 space-y-3">
                      <div className="flex justify-between items-center">
                        <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                          <ShieldAlert className="w-4 h-4 text-amber-400" />
                          Audit Risk Assessment
                        </h4>
                        <span className={`px-2 py-0.5 rounded text-xs font-mono font-bold ${
                          selectedTaxReturn.auditRiskScore > 70
                            ? "bg-red-500/10 text-red-400 border border-red-500/20"
                            : selectedTaxReturn.auditRiskScore > 40
                            ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                            : "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                        }`}>
                          Score: {selectedTaxReturn.auditRiskScore}/100
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 rounded-full h-2 overflow-hidden">
                        <div
                          style={{ width: `${selectedTaxReturn.auditRiskScore}%` }}
                          className={`h-full rounded-full ${
                            selectedTaxReturn.auditRiskScore > 70
                              ? "bg-red-500"
                              : selectedTaxReturn.auditRiskScore > 40
                              ? "bg-amber-500"
                              : "bg-emerald-500"
                          }`}
                        ></div>
                      </div>

                      <p className="text-[11px] text-slate-400 leading-relaxed">
                        {selectedTaxReturn.auditRiskScore > 70
                          ? "WARNING: High audit risk detected. Discrepancies in pass-through real estate deductions and high R&D tax credits claimed relative to gross receipts exceed standard industry thresholds."
                          : selectedTaxReturn.auditRiskScore > 40
                          ? "MODERATE RISK: Standard deductions applied. Minor flags raised on international transaction disclosures. Recommended to review Form 5471 attachments."
                          : "LOW RISK: Tax return parameters align perfectly with historical entity filings and industry benchmarks. Safe for immediate electronic filing."}
                      </p>
                    </div>

                    {/* Action Buttons */}
                    <div className="flex justify-end gap-3 pt-4 border-t border-slate-800">
                      <button className="px-4 py-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-medium flex items-center gap-1.5 transition-colors">
                        <FileCode className="w-4 h-4" />
                        Export XML Schema
                      </button>
                      {selectedTaxReturn.status === "Draft" && (
                        <button
                          onClick={() => handleFileTaxReturn(selectedTaxReturn.id)}
                          className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-slate-950 rounded-lg text-xs font-bold flex items-center gap-1.5 transition-colors"
                        >
                          <Send className="w-4 h-4" />
                          File Electronically (MeF)
                        </button>
                      )}
                    </div>
                  </>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 py-12">
                    <Landmark className="w-12 h-12 mb-2 text-slate-700" />
                    <p className="text-sm">Select a tax return to view submission details.</p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* API Gateway Monitor Subsystem */}
          {activeTab === "gateway" && (
            <div className="space-y-6">
              {/* Endpoint Status Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {apiStatuses.map((api, idx) => (
                  <div key={idx} className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3 shadow-xl">
                    <div className="flex justify-between items-start">
                      <div>
                        <span className="text-[10px] font-mono text-slate-500 bg-slate-950 px-2 py-0.5 rounded border border-slate-800">
                          {api.agency}
                        </span>
                        <h4 className="font-bold text-xs text-slate-200 mt-1.5">{api.name}</h4>
                      </div>
                      <span className={`px-2 py-0.5 rounded text-[9px] font-mono border ${
                        api.status === "Operational"
                          ? "bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
                          : "bg-amber-500/10 border-amber-500/20 text-amber-400"
                      }`}>
                        {api.status}
                      </span>
                    </div>

                    <div className="space-y-1 text-[11px] font-mono">
                      <div className="flex justify-between">
                        <span className="text-slate-500">LATENCY</span>
                        <span className={api.latency > 300 ? "text-amber-400" : "text-emerald-400"}>
                          {api.latency} ms
                        </span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">UPTIME</span>
                        <span className="text-slate-300">{api.uptime}%</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-slate-500">RATE LIMIT</span>
                        <span className="text-slate-300">{api.rateLimit}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800 text-[9px] text-slate-500 truncate font-mono">
                      {api.url}
                    </div>
                  </div>
                ))}
              </div>

              {/* Live Terminal Logs */}
              <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col shadow-xl">
                <div className="p-4 border-b border-slate-800 bg-slate-900/50 flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <Terminal className="w-4 h-4 text-emerald-400" />
                    <span className="text-xs font-semibold">Live Gateway Handshake Logs</span>
                  </div>
                  <span className="text-[10px] font-mono text-slate-500">
                    Auto-refreshing • SSL Secured
                  </span>
                </div>
                <div className="p-4 bg-slate-950 font-mono text-xs text-emerald-500/90 space-y-1.5 h-64 overflow-y-auto">
                  {terminalLogs.map((log, idx) => (
                    <div key={idx} className="leading-relaxed">
                      {log}
                    </div>
                  ))}
                  <div ref={terminalEndRef} />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/50 px-6 py-4 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500">
        <div className="flex items-center gap-2">
          <Lock className="w-4 h-4 text-emerald-500/50" />
          <span>Sovereign Cryptographic Handshake Active (AES-256-GCM)</span>
        </div>
        <div className="flex items-center gap-4">
          <a href="#terms" className="hover:text-slate-300 transition-colors">Federal Compliance</a>
          <a href="#privacy" className="hover:text-slate-300 transition-colors">Security Policy</a>
          <span>© {new Date().getFullYear()} Sovereign Intelligence Group</span>
        </div>
      </footer>
    </div>
  );
}