import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Shield, 
  ShieldAlert, 
  ShieldCheck, 
  AlertTriangle, 
  Activity, 
  RefreshCw, 
  Cpu, 
  Database, 
  Lock, 
  Globe, 
  DollarSign, 
  Users, 
  Zap, 
  Search, 
  Filter, 
  Play, 
  ArrowRight, 
  Check, 
  X, 
  FileText, 
  TrendingUp, 
  AlertCircle,
  Fingerprint,
  Terminal,
  Sliders,
  Eye,
  Clock,
  CheckCircle2,
  HelpCircle,
  Network,
  Coins,
  Pause,
  Plus,
  SlidersHorizontal
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
  Line, 
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import { callGemini } from '../services/geminiService';

// Interfaces
interface VisaTransaction {
  id: string;
  timestamp: string;
  cardNumber: string;
  amount: number;
  currency: string;
  merchant: string;
  location: string;
  ipAddress: string;
  deviceId: string;
  blockchainAddress?: string;
  blockchainRiskScore?: number;
  behavioralScore: number; // 0-100
  overallRiskScore: number; // 0-100
  status: 'APPROVED' | 'FLAGGED' | 'BLOCKED';
  fraudIndicators: string[];
}

interface BlockchainRiskProfile {
  address: string;
  chain: 'Ethereum' | 'Bitcoin' | 'Solana';
  riskScore: number;
  category: 'Low' | 'Medium' | 'High' | 'Critical';
  lastActive: string;
  totalTransactions: number;
  associatedEntities: string[];
  flaggedMixerInteractions: boolean;
}

interface GeminiAnalysisResult {
  riskAssessment: string;
  blockchainCorrelation: string;
  behavioralAnomaly: string;
  recommendedAction: 'APPROVE' | 'CHALLENGE_MFA' | 'FREEZE_CARD' | 'BLOCK_AND_REPORT';
  confidenceScore: number;
  mitigationSteps: string[];
}

// Initial Mock Data
const INITIAL_TRANSACTIONS: VisaTransaction[] = [
  {
    id: "TX-90812",
    timestamp: "2025-03-02 14:23:11",
    cardNumber: "Visa Infinite **** 8821",
    amount: 12500.00,
    currency: "USD",
    merchant: "Coinbase Prime Settlement",
    location: "San Francisco, CA, USA",
    ipAddress: "192.142.33.9",
    deviceId: "DV-9012-X",
    blockchainAddress: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B",
    blockchainRiskScore: 12,
    behavioralScore: 15,
    overallRiskScore: 18,
    status: 'APPROVED',
    fraudIndicators: []
  },
  {
    id: "TX-90813",
    timestamp: "2025-03-02 14:24:05",
    cardNumber: "Visa Platinum **** 4309",
    amount: 4200.00,
    currency: "EUR",
    merchant: "Tornado Cash Relayer Bridge",
    location: "Zürich, Switzerland",
    ipAddress: "185.220.101.5",
    deviceId: "DV-4412-Z",
    blockchainAddress: "0x8571335EC7ab88b098defB751B7401B5f6d1476B",
    blockchainRiskScore: 94,
    behavioralScore: 82,
    overallRiskScore: 89,
    status: 'BLOCKED',
    fraudIndicators: ["High Blockchain Risk", "Known Mixer Association", "Impossible Travel Velocity"]
  },
  {
    id: "TX-90814",
    timestamp: "2025-03-02 14:25:44",
    cardNumber: "Visa Signature **** 1102",
    amount: 850.00,
    currency: "USD",
    merchant: "Luxury Watches Inc",
    location: "Dubai, UAE",
    ipAddress: "91.74.122.18",
    deviceId: "DV-8891-A",
    blockchainAddress: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    blockchainRiskScore: 45,
    behavioralScore: 60,
    overallRiskScore: 52,
    status: 'FLAGGED',
    fraudIndicators: ["Unusual Location Hop", "High Value Retail"]
  },
  {
    id: "TX-90815",
    timestamp: "2025-03-02 14:27:01",
    cardNumber: "Visa Debit **** 5541",
    amount: 45.50,
    currency: "USD",
    merchant: "Starbucks Coffee",
    location: "Seattle, WA, USA",
    ipAddress: "67.181.204.11",
    deviceId: "DV-1022-M",
    blockchainAddress: undefined,
    blockchainRiskScore: undefined,
    behavioralScore: 5,
    overallRiskScore: 4,
    status: 'APPROVED',
    fraudIndicators: []
  },
  {
    id: "TX-90816",
    timestamp: "2025-03-02 14:28:19",
    cardNumber: "Visa Business **** 9900",
    amount: 18900.00,
    currency: "USD",
    merchant: "Binance OTC Desk",
    location: "Singapore",
    ipAddress: "210.14.15.112",
    deviceId: "DV-9901-B",
    blockchainAddress: "0x3fC91A3afd05726240424020eb1f121202147415",
    blockchainRiskScore: 68,
    behavioralScore: 40,
    overallRiskScore: 58,
    status: 'FLAGGED',
    fraudIndicators: ["Large Crypto Bridge Settlement", "New Device ID"]
  }
];

const MOCK_BLOCKCHAIN_PROFILES: Record<string, BlockchainRiskProfile> = {
  "0x71C7656EC7ab88b098defB751B7401B5f6d1476B": {
    address: "0x71C7656EC7ab88b098defB751B7401B5f6d1476B",
    chain: "Ethereum",
    riskScore: 12,
    category: "Low",
    lastActive: "2025-03-02 14:20:00",
    totalTransactions: 1420,
    associatedEntities: ["Coinbase", "Uniswap V3 LP"],
    flaggedMixerInteractions: false
  },
  "0x8571335EC7ab88b098defB751B7401B5f6d1476B": {
    address: "0x8571335EC7ab88b098defB751B7401B5f6d1476B",
    chain: "Ethereum",
    riskScore: 94,
    category: "Critical",
    lastActive: "2025-03-02 14:24:00",
    totalTransactions: 45,
    associatedEntities: ["Tornado Cash", "Hacked Protocol Deployer"],
    flaggedMixerInteractions: true
  },
  "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh": {
    address: "bc1qxy2kgdygjrsqtzq2n0yrf2493p83kkfjhx0wlh",
    chain: "Bitcoin",
    riskScore: 45,
    category: "Medium",
    lastActive: "2025-03-02 13:11:05",
    totalTransactions: 89,
    associatedEntities: ["Wasabi Wallet", "Unknown Peer-to-Peer"],
    flaggedMixerInteractions: true
  }
};

export default function VisaFraudShieldGemini() {
  // State
  const [transactions, setTransactions] = useState<VisaTransaction[]>(INITIAL_TRANSACTIONS);
  const [selectedTx, setSelectedTx] = useState<VisaTransaction | null>(INITIAL_TRANSACTIONS[1]);
  const [blockchainSearch, setBlockchainSearch] = useState("");
  const [searchedProfile, setSearchedProfile] = useState<BlockchainRiskProfile | null>(null);
  const [isStreaming, setIsStreaming] = useState(true);
  const [analyzingTxId, setAnalyzingTxId] = useState<string | null>(null);
  const [geminiAnalysis, setGeminiAnalysis] = useState<GeminiAnalysisResult | null>(null);
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  
  // Rule Engine Weights
  const [telemetryWeight, setTelemetryWeight] = useState(40);
  const [blockchainWeight, setBlockchainWeight] = useState(35);
  const [behavioralWeight, setBehavioralWeight] = useState(25);

  // Custom Simulation Inputs
  const [simAmount, setSimAmount] = useState("5000");
  const [simMerchant, setSimMerchant] = useState("Kraken Exchange");
  const [simLocation, setSimLocation] = useState("Kiev, Ukraine");
  const [simBlockchain, setSimBlockchain] = useState("0x9999999EC7ab88b098defB751B7401B5f6d1476B");
  const [simBlockchainRisk, setSimBlockchainRisk] = useState("75");

  // Auto-scroll ref for terminal logs
  const terminalEndRef = useRef<HTMLDivElement>(null);
  const [logs, setLogs] = useState<string[]>([
    "[SYSTEM] Visa Fraud Shield Gemini initialized.",
    "[SYSTEM] Connected to Visa Transaction Telemetry Stream.",
    "[SYSTEM] Connected to Blockchain Risk Oracle.",
    "[AI] Gemini Cognitive Engine ready for real-time inference."
  ]);

  const addLog = useCallback((msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toLocaleTimeString()}] ${msg}`]);
  }, []);

  useEffect(() => {
    if (terminalEndRef.current) {
      terminalEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Real-time Stream Simulation
  useEffect(() => {
    if (!isStreaming) return;

    const interval = setInterval(() => {
      const merchants = ["LocalBitcoins OTC", "Apple Store Online", "Metamask Swap", "Unknown Merchant", "Walmart", "Tornado Cash Relayer"];
      const locations = ["London, UK", "Moscow, Russia", "New York, NY, USA", "Lagos, Nigeria", "Tokyo, Japan"];
      const currencies = ["USD", "EUR", "GBP"];
      const chains = ["Ethereum", "Bitcoin", "Solana"];
      
      const randomMerchant = merchants[Math.floor(Math.random() * merchants.length)];
      const randomLocation = locations[Math.floor(Math.random() * locations.length)];
      const randomCurrency = currencies[Math.floor(Math.random() * currencies.length)];
      const randomAmount = Math.floor(Math.random() * 15000) + 10;
      
      const hasCrypto = Math.random() > 0.3;
      const mockAddress = hasCrypto ? `0x${Math.random().toString(16).substring(2, 10)}...${Math.random().toString(16).substring(2, 6)}` : undefined;
      const mockBlockchainRisk = hasCrypto ? Math.floor(Math.random() * 100) : undefined;
      const mockBehavioralScore = Math.floor(Math.random() * 100);
      
      // Calculate overall risk score based on weights
      const telemetryRisk = randomAmount > 10000 ? 80 : (randomAmount > 5000 ? 50 : 20);
      const bRisk = mockBlockchainRisk || 0;
      const calculatedRisk = Math.round(
        (telemetryRisk * (telemetryWeight / 100)) + 
        (bRisk * (blockchainWeight / 100)) + 
        (mockBehavioralScore * (behavioralWeight / 100))
      );

      let status: 'APPROVED' | 'FLAGGED' | 'BLOCKED' = 'APPROVED';
      const indicators: string[] = [];

      if (calculatedRisk > 75) {
        status = 'BLOCKED';
        indicators.push("Critical Risk Threshold Exceeded");
      } else if (calculatedRisk > 45) {
        status = 'FLAGGED';
        indicators.push("Elevated Risk Profile");
      }

      if (randomAmount > 10000) indicators.push("High Value Transaction");
      if (bRisk > 70) indicators.push("High Risk Blockchain Association");
      if (mockBehavioralScore > 75) indicators.push("Anomalous Behavioral Pattern");

      const newTx: VisaTransaction = {
        id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
        timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
        cardNumber: `Visa Infinite **** ${Math.floor(Math.random() * 9000) + 1000}`,
        amount: randomAmount,
        currency: randomCurrency,
        merchant: randomMerchant,
        location: randomLocation,
        ipAddress: `${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
        deviceId: `DV-${Math.floor(Math.random() * 9000) + 1000}-Y`,
        blockchainAddress: mockAddress,
        blockchainRiskScore: mockBlockchainRisk,
        behavioralScore: mockBehavioralScore,
        overallRiskScore: calculatedRisk,
        status,
        fraudIndicators: indicators
      };

      setTransactions(prev => [newTx, ...prev.slice(0, 19)]);
      addLog(`New transaction ${newTx.id} received from ${newTx.merchant} (${newTx.location}) - Risk: ${newTx.overallRiskScore}%`);
    }, 8000);

    return () => clearInterval(interval);
  }, [isStreaming, telemetryWeight, blockchainWeight, behavioralWeight, addLog]);

  // Trigger Gemini Analysis
  const analyzeWithGemini = async (tx: VisaTransaction) => {
    setAnalyzingTxId(tx.id);
    setGeminiAnalysis(null);
    addLog(`Initiating Gemini Cognitive Analysis for ${tx.id}...`);
    
    try {
      const prompt = `
        You are the Visa Fraud Shield Gemini AI, an advanced cognitive security agent.
        Analyze the following Visa transaction telemetry, blockchain risk profile, and user behavioral patterns:
        
        Transaction ID: ${tx.id}
        Merchant: ${tx.merchant}
        Amount: ${tx.currency} ${tx.amount}
        Location: ${tx.location}
        IP Address: ${tx.ipAddress}
        Device ID: ${tx.deviceId}
        Linked Blockchain Address: ${tx.blockchainAddress || 'N/A'}
        Blockchain Risk Score: ${tx.blockchainRiskScore !== undefined ? tx.blockchainRiskScore + '%' : 'N/A'}
        User Behavioral Score (0-100, higher is riskier): ${tx.behavioralScore}
        Current System Risk Score: ${tx.overallRiskScore}%
        Current Status: ${tx.status}
        Triggered Indicators: ${tx.fraudIndicators.join(', ')}
        
        Provide a comprehensive fraud analysis in JSON format with the following keys:
        1. "riskAssessment": A detailed explanation of why this transaction is risky or safe.
        2. "blockchainCorrelation": Analysis of the crypto-to-fiat bridge risk if a blockchain address is present.
        3. "behavioralAnomaly": Evaluation of the user's behavioral patterns (e.g., velocity, location hops).
        4. "recommendedAction": One of "APPROVE", "CHALLENGE_MFA", "FREEZE_CARD", "BLOCK_AND_REPORT".
        5. "confidenceScore": A percentage (0-100) representing your confidence in this assessment.
        6. "mitigationSteps": An array of actionable steps for the fraud operations team.
        
        Return ONLY the raw JSON object. Do not include markdown formatting or backticks.
      `;
      
      const responseText = await callGemini(prompt);
      let parsed: GeminiAnalysisResult;
      try {
        const cleanText = responseText.replace(/```json/g, '').replace(/```/g, '').trim();
        parsed = JSON.parse(cleanText);
      } catch (e) {
        // Fallback parser if Gemini returns non-JSON or slightly malformed JSON
        parsed = {
          riskAssessment: responseText,
          blockchainCorrelation: tx.blockchainAddress ? "Detected active crypto-to-fiat bridge with elevated risk profile." : "No blockchain correlation detected.",
          behavioralAnomaly: "Anomalous velocity or device fingerprint detected.",
          recommendedAction: tx.overallRiskScore > 75 ? "FREEZE_CARD" : "CHALLENGE_MFA",
          confidenceScore: 88,
          mitigationSteps: ["Initiate out-of-band verification", "Flag linked wallet address", "Review historical device logs"]
        };
      }
      
      setGeminiAnalysis(parsed);
      addLog(`Gemini analysis completed for ${tx.id}. Recommendation: ${parsed.recommendedAction} (Confidence: ${parsed.confidenceScore}%)`);
    } catch (error) {
      console.error("Gemini analysis failed:", error);
      addLog(`[ERROR] Gemini analysis failed for ${tx.id}. Utilizing local fallback heuristics.`);
      setGeminiAnalysis({
        riskAssessment: "Local fallback: High risk transaction detected via heuristic engine. Blockchain risk score is elevated.",
        blockchainCorrelation: "Active bridge detected with high risk score.",
        behavioralAnomaly: "Behavioral score indicates high deviation from baseline.",
        recommendedAction: tx.overallRiskScore > 75 ? "FREEZE_CARD" : "CHALLENGE_MFA",
        confidenceScore: 75,
        mitigationSteps: ["Perform manual review", "Contact cardholder immediately"]
      });
    } finally {
      setAnalyzingTxId(null);
    }
  };

  // Trigger analysis when selected transaction changes
  useEffect(() => {
    if (selectedTx) {
      analyzeWithGemini(selectedTx);
    }
  }, [selectedTx]);

  // Blockchain Address Search
  const handleBlockchainSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (!blockchainSearch) return;

    addLog(`Querying blockchain risk oracle for address: ${blockchainSearch}`);
    const profile = MOCK_BLOCKCHAIN_PROFILES[blockchainSearch];
    
    if (profile) {
      setSearchedProfile(profile);
      addLog(`Profile found for ${blockchainSearch}. Risk Score: ${profile.riskScore}% (${profile.category})`);
    } else {
      // Generate dynamic mock profile
      const randomRisk = Math.floor(Math.random() * 100);
      const categories: ('Low' | 'Medium' | 'High' | 'Critical')[] = ['Low', 'Medium', 'High', 'Critical'];
      const category = randomRisk > 80 ? 'Critical' : (randomRisk > 50 ? 'High' : (randomRisk > 25 ? 'Medium' : 'Low'));
      
      const newProfile: BlockchainRiskProfile = {
        address: blockchainSearch,
        chain: blockchainSearch.startsWith("bc1") ? "Bitcoin" : "Ethereum",
        riskScore: randomRisk,
        category,
        lastActive: new Date().toISOString().replace('T', ' ').substring(0, 19),
        totalTransactions: Math.floor(Math.random() * 500) + 1,
        associatedEntities: randomRisk > 50 ? ["Unknown Mixer", "High-Risk Exchange"] : ["Uniswap", "Safe Wallet"],
        flaggedMixerInteractions: randomRisk > 60
      };
      setSearchedProfile(newProfile);
      addLog(`Generated dynamic risk profile for ${blockchainSearch}. Risk Score: ${randomRisk}%`);
    }
  };

  // Manual Transaction Simulation
  const handleSimulateTransaction = () => {
    const amountNum = parseFloat(simAmount) || 100;
    const bRiskNum = parseInt(simBlockchainRisk) || 0;
    const mockBehavioralScore = Math.floor(Math.random() * 100);
    
    const calculatedRisk = Math.round(
      ((amountNum > 10000 ? 90 : 40) * (telemetryWeight / 100)) + 
      (bRiskNum * (blockchainWeight / 100)) + 
      (mockBehavioralScore * (behavioralWeight / 100))
    );

    let status: 'APPROVED' | 'FLAGGED' | 'BLOCKED' = 'APPROVED';
    const indicators: string[] = ["Manual Simulation Trigger"];

    if (calculatedRisk > 75) {
      status = 'BLOCKED';
      indicators.push("Critical Risk Threshold Exceeded");
    } else if (calculatedRisk > 45) {
      status = 'FLAGGED';
      indicators.push("Elevated Risk Profile");
    }

    const newTx: VisaTransaction = {
      id: `TX-${Math.floor(Math.random() * 90000) + 10000}`,
      timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
      cardNumber: "Visa Infinite **** 9999",
      amount: amountNum,
      currency: "USD",
      merchant: simMerchant,
      location: simLocation,
      ipAddress: "198.51.100.42",
      deviceId: "DV-SIM-99",
      blockchainAddress: simBlockchain || undefined,
      blockchainRiskScore: simBlockchain ? bRiskNum : undefined,
      behavioralScore: mockBehavioralScore,
      overallRiskScore: calculatedRisk,
      status,
      fraudIndicators: indicators
    };

    setTransactions(prev => [newTx, ...prev]);
    setSelectedTx(newTx);
    addLog(`Simulated transaction ${newTx.id} injected successfully.`);
  };

  // Filtered Transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(tx => {
      const matchesSearch = tx.merchant.toLowerCase().includes(searchQuery.toLowerCase()) || 
                            tx.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            (tx.blockchainAddress && tx.blockchainAddress.toLowerCase().includes(searchQuery.toLowerCase()));
      const matchesStatus = statusFilter === "ALL" || tx.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [transactions, searchQuery, statusFilter]);

  // Chart Data
  const riskDistributionData = useMemo(() => {
    const ranges = [
      { name: '0-20 (Low)', count: 0 },
      { name: '21-50 (Med)', count: 0 },
      { name: '51-75 (High)', count: 0 },
      { name: '76-100 (Crit)', count: 0 }
    ];
    transactions.forEach(tx => {
      if (tx.overallRiskScore <= 20) ranges[0].count++;
      else if (tx.overallRiskScore <= 50) ranges[1].count++;
      else if (tx.overallRiskScore <= 75) ranges[2].count++;
      else ranges[3].count++;
    });
    return ranges;
  }, [transactions]);

  const statusPieData = useMemo(() => {
    const counts = { APPROVED: 0, FLAGGED: 0, BLOCKED: 0 };
    transactions.forEach(tx => {
      counts[tx.status]++;
    });
    return [
      { name: 'Approved', value: counts.APPROVED, color: '#10B981' },
      { name: 'Flagged', value: counts.FLAGGED, color: '#F59E0B' },
      { name: 'Blocked', value: counts.BLOCKED, color: '#EF4444' }
    ];
  }, [transactions]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans">
      {/* Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2.5 rounded-lg shadow-lg shadow-blue-500/20">
            <Shield className="w-8 h-8 text-white" />
          </div>
          <div>
            <h1 className="text-2xl font-bold tracking-tight flex items-center gap-2">
              Visa Fraud Shield <span className="text-blue-500 font-semibold">Gemini</span>
            </h1>
            <p className="text-sm text-slate-400">
              Cognitive AI-driven fraud detection analyzing Visa telemetry, blockchain risk, and behavioral patterns.
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3 self-stretch md:self-auto">
          <button 
            onClick={() => setIsStreaming(!isStreaming)}
            className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium text-sm transition-all ${
              isStreaming 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                : 'bg-slate-800 text-slate-300 border border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isStreaming ? <Activity className="w-4 h-4 animate-pulse" /> : <Pause className="w-4 h-4" />}
            {isStreaming ? 'Live Streaming' : 'Stream Paused'}
          </button>
          <button 
            onClick={() => {
              setTransactions(INITIAL_TRANSACTIONS);
              setSelectedTx(INITIAL_TRANSACTIONS[1]);
              addLog("Reset transaction stream to baseline.");
            }}
            className="p-2 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
            title="Reset Stream"
          >
            <RefreshCw className="w-4 h-4 text-slate-300" />
          </button>
        </div>
      </header>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Analyzed</p>
            <h3 className="text-2xl font-bold mt-1">{transactions.length}</h3>
            <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
              <Activity className="w-3 h-3" /> Real-time ingestion active
            </p>
          </div>
          <div className="bg-blue-500/10 p-3 rounded-lg">
            <Database className="w-6 h-6 text-blue-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Blocked Transactions</p>
            <h3 className="text-2xl font-bold mt-1 text-red-400">
              {transactions.filter(t => t.status === 'BLOCKED').length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Auto-mitigated by rule engine
            </p>
          </div>
          <div className="bg-red-500/10 p-3 rounded-lg">
            <ShieldAlert className="w-6 h-6 text-red-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Flagged for Review</p>
            <h3 className="text-2xl font-bold mt-1 text-amber-400">
              {transactions.filter(t => t.status === 'FLAGGED').length}
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Pending Gemini cognitive audit
            </p>
          </div>
          <div className="bg-amber-500/10 p-3 rounded-lg">
            <AlertTriangle className="w-6 h-6 text-amber-400" />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800 rounded-xl p-5 flex items-center justify-between">
          <div>
            <p className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Avg Risk Score</p>
            <h3 className="text-2xl font-bold mt-1 text-indigo-400">
              {Math.round(transactions.reduce((acc, t) => acc + t.overallRiskScore, 0) / transactions.length)}%
            </h3>
            <p className="text-xs text-slate-400 mt-1">
              Across all telemetry vectors
            </p>
          </div>
          <div className="bg-indigo-500/10 p-3 rounded-lg">
            <Cpu className="w-6 h-6 text-indigo-400" />
          </div>
        </div>
      </div>

      {/* Main Dashboard Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Telemetry Stream & Analytics */}
        <div className="lg:col-span-7 flex flex-col gap-6">
          
          {/* Live Telemetry Stream */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-[500px]">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
              <h2 className="text-lg font-semibold flex items-center gap-2">
                <Activity className="w-5 h-5 text-blue-400" />
                Visa Telemetry Stream
              </h2>
              
              <div className="flex items-center gap-2 w-full sm:w-auto">
                <div className="relative flex-1 sm:flex-initial">
                  <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text" 
                    placeholder="Search Tx ID, Merchant..." 
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500 w-full sm:w-48"
                  />
                </div>
                <select 
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-xs text-slate-200 focus:outline-none focus:border-blue-500"
                >
                  <option value="ALL">All Status</option>
                  <option value="APPROVED">Approved</option>
                  <option value="FLAGGED">Flagged</option>
                  <option value="BLOCKED">Blocked</option>
                </select>
              </div>
            </div>

            {/* Transaction List */}
            <div className="flex-1 overflow-y-auto pr-1 space-y-2">
              {filteredTransactions.length === 0 ? (
                <div className="h-full flex flex-col items-center justify-center text-slate-500 gap-2">
                  <AlertCircle className="w-8 h-8" />
                  <p className="text-sm">No transactions match the filter criteria.</p>
                </div>
              ) : (
                filteredTransactions.map((tx) => {
                  const isSelected = selectedTx?.id === tx.id;
                  return (
                    <div 
                      key={tx.id}
                      onClick={() => setSelectedTx(tx)}
                      className={`p-3.5 rounded-lg border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 ${
                        isSelected 
                          ? 'bg-blue-600/10 border-blue-500/50 shadow-md shadow-blue-500/5' 
                          : 'bg-slate-950/50 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/20'
                      }`}
                    >
                      <div className="flex items-start gap-3">
                        <div className={`p-2 rounded-lg mt-0.5 ${
                          tx.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400' :
                          tx.status === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400' :
                          'bg-red-500/10 text-red-400'
                        }`}>
                          {tx.status === 'APPROVED' ? <ShieldCheck className="w-4 h-4" /> :
                           tx.status === 'FLAGGED' ? <AlertTriangle className="w-4 h-4" /> :
                           <ShieldAlert className="w-4 h-4" />}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-mono text-xs font-bold text-slate-300">{tx.id}</span>
                            <span className="text-[10px] text-slate-500">{tx.timestamp}</span>
                          </div>
                          <h4 className="text-sm font-semibold text-slate-200 mt-0.5">{tx.merchant}</h4>
                          <p className="text-xs text-slate-400 flex items-center gap-1 mt-0.5">
                            <Globe className="w-3 h-3 text-slate-500" /> {tx.location}
                            {tx.blockchainAddress && (
                              <span className="bg-indigo-500/10 text-indigo-400 text-[9px] px-1.5 py-0.5 rounded flex items-center gap-1 ml-2">
                                <Coins className="w-2.5 h-2.5" /> Crypto Bridge
                              </span>
                            )}
                          </p>
                        </div>
                      </div>

                      <div className="flex sm:flex-col items-end justify-between w-full sm:w-auto border-t sm:border-t-0 border-slate-800 pt-2 sm:pt-0">
                        <span className="text-sm font-bold text-slate-100">
                          {tx.currency} {tx.amount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </span>
                        <div className="flex items-center gap-2 mt-1">
                          <span className="text-[10px] text-slate-400">Risk Score:</span>
                          <span className={`text-xs font-bold ${
                            tx.overallRiskScore > 75 ? 'text-red-400' :
                            tx.overallRiskScore > 45 ? 'text-amber-400' :
                            'text-emerald-400'
                          }`}>
                            {tx.overallRiskScore}%
                          </span>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Analytics Charts */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Risk Distribution */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Sliders className="w-4 h-4 text-blue-400" />
                Risk Distribution Profile
              </h3>
              <div className="h-48">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={riskDistributionData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="name" stroke="#94a3b8" fontSize={10} />
                    <YAxis stroke="#94a3b8" fontSize={10} />
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                      labelStyle={{ color: '#94a3b8' }}
                    />
                    <Bar dataKey="count" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                      {riskDistributionData.map((entry, index) => {
                        const colors = ['#10b981', '#f59e0b', '#f97316', '#ef4444'];
                        return <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />;
                      })}
                    </Bar>
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </div>

            {/* Status Breakdown */}
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
                <Fingerprint className="w-4 h-4 text-blue-400" />
                Mitigation Status Breakdown
              </h3>
              <div className="h-48 flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={statusPieData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {statusPieData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155' }}
                    />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value, entry: any) => (
                        <span className="text-xs text-slate-300">{value} ({entry.payload.value})</span>
                      )}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>

          {/* Live System Logs */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col h-48">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Terminal className="w-4 h-4 text-blue-400" />
              Cognitive Shield Event Logs
            </h3>
            <div className="flex-1 bg-slate-950 rounded-lg p-3 font-mono text-[11px] text-slate-400 overflow-y-auto space-y-1 border border-slate-800">
              {logs.map((log, i) => (
                <div key={i} className="leading-relaxed">
                  <span className="text-blue-500">&gt;</span> {log}
                </div>
              ))}
              <div ref={terminalEndRef} />
            </div>
          </div>

        </div>

        {/* Right Column: Gemini AI Copilot & Blockchain Lookup */}
        <div className="lg:col-span-5 flex flex-col gap-6">
          
          {/* Gemini AI Copilot Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5 flex flex-col min-h-[550px]">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4 mb-4">
              <div className="flex items-center gap-2">
                <div className="bg-indigo-500/10 p-1.5 rounded-lg">
                  <Cpu className="w-5 h-5 text-indigo-400" />
                </div>
                <div>
                  <h3 className="text-base font-semibold text-slate-200">Gemini Cognitive Copilot</h3>
                  <p className="text-xs text-slate-400">Real-time deep transaction analysis</p>
                </div>
              </div>
              {selectedTx && (
                <button 
                  onClick={() => analyzeWithGemini(selectedTx)}
                  disabled={analyzingTxId === selectedTx.id}
                  className="flex items-center gap-1.5 px-3 py-1 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white rounded-lg text-xs font-medium transition-all"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${analyzingTxId === selectedTx.id ? 'animate-spin' : ''}`} />
                  Re-Analyze
                </button>
              )}
            </div>

            {/* Selected Transaction Summary */}
            {selectedTx ? (
              <div className="flex-1 flex flex-col gap-4">
                <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                  <div className="flex justify-between items-start mb-2">
                    <div>
                      <span className="text-[10px] text-slate-500 uppercase tracking-wider font-bold">Selected Transaction</span>
                      <h4 className="text-sm font-bold text-slate-200 mt-0.5">{selectedTx.id}</h4>
                    </div>
                    <span className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                      selectedTx.status === 'APPROVED' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      selectedTx.status === 'FLAGGED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-red-500/10 text-red-400 border border-red-500/20'
                    }`}>
                      {selectedTx.status}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs mt-3 border-t border-slate-900 pt-3">
                    <div>
                      <span className="text-slate-500">Merchant:</span>
                      <p className="font-semibold text-slate-300 mt-0.5">{selectedTx.merchant}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Amount:</span>
                      <p className="font-semibold text-slate-300 mt-0.5">{selectedTx.currency} {selectedTx.amount.toLocaleString()}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">Location:</span>
                      <p className="font-semibold text-slate-300 mt-0.5">{selectedTx.location}</p>
                    </div>
                    <div>
                      <span className="text-slate-500">IP Address:</span>
                      <p className="font-semibold text-slate-300 mt-0.5">{selectedTx.ipAddress}</p>
                    </div>
                  </div>

                  {selectedTx.blockchainAddress && (
                    <div className="mt-3 bg-indigo-950/30 border border-indigo-900/30 rounded p-2.5">
                      <div className="flex justify-between items-center">
                        <span className="text-[10px] text-indigo-400 font-semibold flex items-center gap-1">
                          <Coins className="w-3 h-3" /> Linked Blockchain Address
                        </span>
                        <span className="text-[10px] text-slate-400">Risk: {selectedTx.blockchainRiskScore}%</span>
                      </div>
                      <p className="font-mono text-[10px] text-slate-300 mt-1 truncate">{selectedTx.blockchainAddress}</p>
                    </div>
                  )}
                </div>

                {/* Gemini Analysis Output */}
                {analyzingTxId === selectedTx.id ? (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-400 gap-3 py-12">
                    <div className="relative">
                      <div className="w-12 h-12 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                      <Cpu className="w-5 h-5 text-indigo-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                    </div>
                    <p className="text-sm font-medium animate-pulse">Gemini is synthesizing telemetry vectors...</p>
                  </div>
                ) : geminiAnalysis ? (
                  <div className="flex-1 flex flex-col gap-4">
                    {/* Recommended Action Banner */}
                    <div className={`p-3.5 rounded-lg border flex items-center justify-between ${
                      geminiAnalysis.recommendedAction === 'APPROVE' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                      geminiAnalysis.recommendedAction === 'CHALLENGE_MFA' ? 'bg-amber-500/10 border-amber-500/20 text-amber-400' :
                      'bg-red-500/10 border-red-500/20 text-red-400'
                    }`}>
                      <div className="flex items-center gap-2.5">
                        {geminiAnalysis.recommendedAction === 'APPROVE' ? <ShieldCheck className="w-5 h-5" /> :
                         geminiAnalysis.recommendedAction === 'CHALLENGE_MFA' ? <AlertTriangle className="w-5 h-5" /> :
                         <ShieldAlert className="w-5 h-5" />}
                        <div>
                          <span className="text-[10px] uppercase tracking-wider font-bold opacity-80">Gemini Recommendation</span>
                          <h4 className="text-sm font-bold mt-0.5">{geminiAnalysis.recommendedAction.replace(/_/g, ' ')}</h4>
                        </div>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] opacity-80 block">Confidence</span>
                        <span className="text-sm font-bold">{geminiAnalysis.confidenceScore}%</span>
                      </div>
                    </div>

                    {/* Detailed Assessment */}
                    <div className="space-y-3 text-xs">
                      <div>
                        <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-indigo-400" /> Risk Assessment
                        </h5>
                        <p className="text-slate-400 mt-1 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800/50">
                          {geminiAnalysis.riskAssessment}
                        </p>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div>
                          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
                            <Coins className="w-3.5 h-3.5 text-indigo-400" /> Crypto Bridge Risk
                          </h5>
                          <p className="text-slate-400 mt-1 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800/50">
                            {geminiAnalysis.blockchainCorrelation}
                          </p>
                        </div>
                        <div>
                          <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
                            <Users className="w-3.5 h-3.5 text-indigo-400" /> Behavioral Anomaly
                          </h5>
                          <p className="text-slate-400 mt-1 leading-relaxed bg-slate-950/50 p-2.5 rounded border border-slate-800/50">
                            {geminiAnalysis.behavioralAnomaly}
                          </p>
                        </div>
                      </div>

                      <div>
                        <h5 className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Sliders className="w-3.5 h-3.5 text-indigo-400" /> Recommended Mitigation Steps
                        </h5>
                        <ul className="mt-1.5 space-y-1.5">
                          {geminiAnalysis.mitigationSteps.map((step, idx) => (
                            <li key={idx} className="flex items-start gap-2 text-slate-400">
                              <span className="bg-indigo-500/20 text-indigo-400 rounded-full w-4 h-4 flex items-center justify-center text-[10px] font-bold shrink-0 mt-0.5">
                                {idx + 1}
                              </span>
                              <span>{step}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2 py-12">
                    <AlertCircle className="w-8 h-8" />
                    <p className="text-sm">No analysis available for this transaction.</p>
                  </div>
                )}
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-500 gap-2">
                <Shield className="w-12 h-12 text-slate-700" />
                <p className="text-sm">Select a transaction from the stream to begin cognitive analysis.</p>
              </div>
            )}
          </div>

          {/* Blockchain Risk Lookup */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Network className="w-4 h-4 text-blue-400" />
              Blockchain Risk Oracle Lookup
            </h3>
            <form onSubmit={handleBlockchainSearch} className="flex gap-2 mb-4">
              <input 
                type="text" 
                placeholder="Enter BTC/ETH Address..." 
                value={blockchainSearch}
                onChange={(e) => setBlockchainSearch(e.target.value)}
                className="flex-1 bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
              <button 
                type="submit"
                className="px-4 py-2 bg-blue-600 hover:bg-blue-500 text-white rounded-lg text-xs font-medium transition-all"
              >
                Query
              </button>
            </form>

            {searchedProfile && (
              <div className="bg-slate-950 p-4 rounded-lg border border-slate-800 text-xs">
                <div className="flex justify-between items-center mb-3">
                  <span className="font-bold text-slate-300">{searchedProfile.chain} Address Profile</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                    searchedProfile.category === 'Low' ? 'bg-emerald-500/10 text-emerald-400' :
                    searchedProfile.category === 'Medium' ? 'bg-amber-500/10 text-amber-400' :
                    'bg-red-500/10 text-red-400'
                  }`}>
                    {searchedProfile.category} Risk
                  </span>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Risk Score:</span>
                    <span className="font-semibold text-slate-300">{searchedProfile.riskScore}%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Total Transactions:</span>
                    <span className="font-semibold text-slate-300">{searchedProfile.totalTransactions}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Mixer Interactions:</span>
                    <span className={`font-semibold ${searchedProfile.flaggedMixerInteractions ? 'text-red-400' : 'text-emerald-400'}`}>
                      {searchedProfile.flaggedMixerInteractions ? 'Yes (Flagged)' : 'None Detected'}
                    </span>
                  </div>
                  <div>
                    <span className="text-slate-500 block mb-1">Associated Entities:</span>
                    <div className="flex flex-wrap gap-1.5">
                      {searchedProfile.associatedEntities.map((ent, idx) => (
                        <span key={idx} className="bg-slate-900 px-2 py-0.5 rounded text-[10px] text-slate-300 border border-slate-800">
                          {ent}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Rule Engine Configurator */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-4 flex items-center gap-2">
              <SlidersHorizontal className="w-4 h-4 text-blue-400" />
              Cognitive Risk Weight Configurator
            </h3>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Visa Telemetry Weight</span>
                  <span className="font-bold text-blue-400">{telemetryWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={telemetryWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setTelemetryWeight(val);
                    // Adjust other weights to sum to 100
                    const remaining = 100 - val;
                    setBlockchainWeight(Math.round(remaining * 0.6));
                    setBehavioralWeight(Math.round(remaining * 0.4));
                  }}
                  className="w-full accent-blue-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">Blockchain Risk Weight</span>
                  <span className="font-bold text-indigo-400">{blockchainWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={blockchainWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setBlockchainWeight(val);
                    const remaining = 100 - val;
                    setTelemetryWeight(Math.round(remaining * 0.6));
                    setBehavioralWeight(Math.round(remaining * 0.4));
                  }}
                  className="w-full accent-indigo-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>

              <div>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-400">User Behavioral Weight</span>
                  <span className="font-bold text-purple-400">{behavioralWeight}%</span>
                </div>
                <input 
                  type="range" 
                  min="0" 
                  max="100" 
                  value={behavioralWeight}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setBehavioralWeight(val);
                    const remaining = 100 - val;
                    setTelemetryWeight(Math.round(remaining * 0.5));
                    setBlockchainWeight(Math.round(remaining * 0.5));
                  }}
                  className="w-full accent-purple-500 bg-slate-950 h-1.5 rounded-lg appearance-none cursor-pointer"
                />
              </div>
            </div>
          </div>

          {/* Manual Simulation Panel */}
          <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-5">
            <h3 className="text-sm font-semibold text-slate-300 mb-3 flex items-center gap-2">
              <Plus className="w-4 h-4 text-blue-400" />
              Simulate Custom Telemetry
            </h3>
            <div className="grid grid-cols-2 gap-3 text-xs mb-3">
              <div>
                <label className="text-slate-500 block mb-1">Amount (USD)</label>
                <input 
                  type="number" 
                  value={simAmount}
                  onChange={(e) => setSimAmount(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Merchant</label>
                <input 
                  type="text" 
                  value={simMerchant}
                  onChange={(e) => setSimMerchant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Location</label>
                <input 
                  type="text" 
                  value={simLocation}
                  onChange={(e) => setSimLocation(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
              <div>
                <label className="text-slate-500 block mb-1">Blockchain Risk Score</label>
                <input 
                  type="number" 
                  min="0"
                  max="100"
                  value={simBlockchainRisk}
                  onChange={(e) => setSimBlockchainRisk(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500"
                />
              </div>
            </div>
            <div className="mb-4">
              <label className="text-slate-500 block mb-1">Linked Wallet Address (Optional)</label>
              <input 
                type="text" 
                value={simBlockchain}
                onChange={(e) => setSimBlockchain(e.target.value)}
                placeholder="0x..."
                className="w-full bg-slate-950 border border-slate-800 rounded px-2.5 py-1.5 text-slate-200 focus:outline-none focus:border-blue-500 font-mono"
              />
            </div>
            <button 
              onClick={handleSimulateTransaction}
              className="w-full py-2 bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 text-white rounded-lg text-xs font-semibold transition-all flex items-center justify-center gap-1.5"
            >
              <Play className="w-3.5 h-3.5" /> Inject Simulated Transaction
            </button>
          </div>

        </div>

      </div>
    </div>
  );
}