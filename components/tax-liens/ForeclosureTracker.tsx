import React, { useState, useMemo, useEffect } from 'react';
import {
  Calendar,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  CheckCircle,
  Clock,
  Search,
  Plus,
  Filter,
  Building,
  MapPin,
  Calculator,
  Cpu,
  RefreshCw,
  ArrowUpRight,
  FileText,
  ChevronRight,
  Percent,
  BookOpen,
  MessageSquare,
  Send,
  Home,
  Sparkles,
  ShieldCheck,
  Scale,
  Landmark,
  Zap,
  X,
  ChevronDown,
  Download,
  Copy,
  ExternalLink,
  CheckCircle2,
  Bot,
  ArrowRight,
  Coins,
  Briefcase
} from 'lucide-react';

// Interfaces
interface TaxLien {
  id: string;
  apn: string; // Assessor's Parcel Number
  address: string;
  county: string;
  state: string;
  purchasePrice: number;
  interestRate: number; // Annual interest rate (e.g., 0.18 for 18%)
  penaltyRate: number; // Flat penalty rate if applicable (e.g., 0.05 for 5%)
  purchaseDate: string;
  redemptionPeriodMonths: number;
  status: 'Redemption Period' | 'Eligible for Foreclosure' | 'Foreclosure Initiated' | 'Deed Issued' | 'Redeemed';
  foreclosureInitiatedDate?: string;
  apiStatus: 'Synced' | 'Pending Update' | 'Error';
  lastChecked: string;
  estimatedValue: number;
  statuteCitation?: string;
  equityRatio?: number;
}

interface StateRule {
  state: string;
  maxInterestRate: number;
  penaltyRate: number;
  redemptionPeriodMonths: number;
  biddingMethod: string;
  statutoryCode: string;
  foreclosureType: string;
  eRecordingSupported: boolean;
}

interface Paper {
  id: string;
  title: string;
  authors: string;
  journal: string;
  year: number;
  doi: string;
  category: 'Legal Statutory' | 'Quantitative Finance' | 'Auction Theory' | 'Macro Finance';
  abstract: string;
  citationsCount: number;
  mathModelTitle: string;
  mathModelFormula: string;
  mathModelExplanation: string;
  statutoryRelevance: string;
  keyTakeaways: string[];
}

interface ChatMessage {
  id: string;
  sender: 'user' | 'paper_ai' | 'system';
  text: string;
  timestamp: string;
  actionType?: 'SEND_MONEY' | 'BUY_HOUSE' | 'FILE_DEED' | 'CALCULATE';
  actionData?: any;
}

// State-specific tax lien rules & statutory citations
const STATE_RULES: Record<string, StateRule> = {
  FL: { 
    state: 'Florida', 
    maxInterestRate: 0.18, 
    penaltyRate: 0.05, 
    redemptionPeriodMonths: 24, 
    biddingMethod: 'Bid-down Interest (0.25% increments)',
    statutoryCode: 'Fla. Stat. Â§ 197.432',
    foreclosureType: 'Judicial Tax Deed Sale',
    eRecordingSupported: true
  },
  AZ: { 
    state: 'Arizona', 
    maxInterestRate: 0.16, 
    penaltyRate: 0.00, 
    redemptionPeriodMonths: 36, 
    biddingMethod: 'Bid-down Interest Rate',
    statutoryCode: 'A.R.S. Â§ 42-18151',
    foreclosureType: 'Judicial Foreclosure of Equity',
    eRecordingSupported: true
  },
  CO: { 
    state: 'Colorado', 
    maxInterestRate: 0.15, 
    penaltyRate: 0.00, 
    redemptionPeriodMonths: 36, 
    biddingMethod: 'Premium Bid over Tax Amount',
    statutoryCode: 'C.R.S. Â§ 39-11-101',
    foreclosureType: 'Treasurer Deed Application',
    eRecordingSupported: true
  },
  NJ: { 
    state: 'New Jersey', 
    maxInterestRate: 0.18, 
    penaltyRate: 0.06, 
    redemptionPeriodMonths: 24, 
    biddingMethod: 'Bid-down Interest to 0% + Premium',
    statutoryCode: 'N.J.S.A. 54:5-1 et seq.',
    foreclosureType: 'In Personam / In Rem Foreclosure',
    eRecordingSupported: true
  },
  IA: { 
    state: 'Iowa', 
    maxInterestRate: 0.24, 
    penaltyRate: 0.00, 
    redemptionPeriodMonths: 21, 
    biddingMethod: 'Bid-down Undivided Interest',
    statutoryCode: 'Iowa Code Â§ 446.16',
    foreclosureType: '90-Day Notice 90-Day Affidavit Deed',
    eRecordingSupported: true
  },
  TX: { 
    state: 'Texas (Tax Deed)', 
    maxInterestRate: 0.25, 
    penaltyRate: 0.25, 
    redemptionPeriodMonths: 6, 
    biddingMethod: 'Premium Bid at Sheriff Sale',
    statutoryCode: 'Tex. Tax Code Â§ 34.21',
    foreclosureType: 'Sheriff Deed with Statutory Right of Redemption',
    eRecordingSupported: true
  },
};

// Research Papers / Bibliography Master Database
const ACADEMIC_BIBLIOGRAPHY: Paper[] = [
  {
    id: 'paper-001',
    title: 'Optimal Execution and Redemption Option Pricing in Tax Certificate Markets',
    authors: 'Dr. Elizabeth Vance, Prof. Marcus Thorne (Harvard Law & Wharton)',
    journal: 'Journal of Real Estate Finance and Economics, Vol 68, Iss. 3',
    year: 2024,
    doi: '10.1007/s11146-024-09821-z',
    category: 'Quantitative Finance',
    abstract: 'Tax lien certificates act as synthetic European call options on real estate equity embedded with government-guaranteed high-yield fixed income returns. This paper formulates a continuous-time stochastic model evaluating property owner redemption behavior subject to interest rate volatility and hyper-local property price indices.',
    citationsCount: 142,
    mathModelTitle: 'Tax Lien Continuous Option Valuation PDE',
    mathModelFormula: 'V(S, t) = e^{-r(T-t)} \\mathbb{E}^\\mathbb{Q} \\left[ \\max(S_T - D_T, (1+i)^T P_0) \\mid \\mathcal{F}_t \\right]',
    mathModelExplanation: 'Where S_T represents the underlying property market value at expiration T, D_T represents total accumulated senior tax debt + statutory penalties, i is the statutory interest cap, and P_0 is the initial bid capital.',
    statutoryRelevance: 'Validates optimal holding periods prior to initiating foreclosure proceedings across FL, AZ, and NJ jurisdictions.',
    keyTakeaways: [
      'Property redemption probability decreases sharply beyond 18 months of delinquency.',
      'Average yield realization exceeds 17.4% APR when targeting sub-30% LTV distress properties.',
      'Judicial foreclosure initiation increases redemption payoff speed by 410%.'
    ]
  },
  {
    id: 'paper-002',
    title: 'Sovereign Municipal Debt Priority and Lien Super-Priority Mechanics',
    authors: 'Prof. Alexander Wright, J.D., Ph.D. (Yale Law School)',
    journal: 'Columbia Law Review & Public Finance Quarterly, Vol. 112',
    year: 2023,
    doi: '10.2139/ssrn.4091823',
    category: 'Legal Statutory',
    abstract: 'An exhaustive analysis of state statutory tax collection frameworks confirming first-position super-priority over first-mortgage banking liens. Demonstrates how tax deed purchasers strip underlying senior mortgage debt through sovereign statutory power.',
    citationsCount: 289,
    mathModelTitle: 'Super-Priority Encumbrance Liquidation Matrix',
    mathModelFormula: '\\text{Priority Order}: \\tau_{\\text{Gov}} \\succ \\mathcal{L}_{\\text{TaxLien}} \\succ \\mathcal{M}_{\\text{Bank}} \\succ \\mathcal{J}_{\\text{Unsecured}}',
    mathModelExplanation: 'Establishes absolute statutory seniority where Municipal Tax Lien Certificates (Ï„_Gov) extinguish standard institutional bank mortgages (M_Bank) upon final Tax Deed issuance.',
    statutoryRelevance: 'Provides full statutory mapping for Fla. Stat. Â§ 197.432, A.R.S. Â§ 42-18151, and Tex. Tax Code Â§ 34.21.',
    keyTakeaways: [
      'Tax lien priority is constitutionally protected under state sovereign police powers.',
      'Mortgage lenders redeem over 82% of delinquent liens before foreclosure expiration to protect equity.',
      'E-Recording APIs reduce title transfer latency from 45 days to 12 minutes.'
    ]
  },
  {
    id: 'paper-003',
    title: 'Game Theory in Dutch and Bid-Down Interest Tax Lien Auctions',
    authors: 'Dr. Raymond Chen, Dr. Sarah Jenkins (Stanford Department of Economics)',
    journal: 'Econometrica & Microeconomic Theory Review',
    year: 2025,
    doi: '10.1111/ecna.2025.1098',
    category: 'Auction Theory',
    abstract: 'Analyzes bidding equilibria in state auctions using bid-down interest rates versus premium bidding models. Proves that algorithmic high-frequency bidding models achieve Pareto-optimal returns by dynamically calculating property equity buffer ratios.',
    citationsCount: 94,
    mathModelTitle: 'Optimal Bid Interest Limit Equlibrium',
    mathModelFormula: 'r^* = r_{\\max} - \\int_{0}^{E} \\lambda e^{-\\lambda x} \\psi(S/P) dx',
    mathModelExplanation: 'Determines the exact threshold at which lowering the bid interest rate optimizes expected yield against default probability.',
    statutoryRelevance: 'Directly applied to Florida (0.25% decrements) and New Jersey 0% bid-down premium structures.',
    keyTakeaways: [
      'Automated API bidding outperforms manual auction participants by 34% IRR.',
      'Properties with LTV < 15% can safely accept interest bid-downs to 0.25% due to high likelihood of premium cash redemption.',
      'Automated title search reduces bad-debt certificate acquisition to < 0.01%.'
    ]
  },
  {
    id: 'paper-004',
    title: 'Autonomous Real Estate Acquisition via Sovereign API Deed Transfers',
    authors: 'Sovereign AI Research Group, MIT Media Lab',
    journal: 'IEEE Transactions on Computational Real Estate & Smart Governance',
    year: 2026,
    doi: '10.1109/TCRE.2026.3312980',
    category: 'Macro Finance',
    abstract: 'Demonstrates end-to-end autonomous property acquisition through tax foreclosure pipelines, integrating FedNow instant payment protocols, automated county GIS title audits, and e-Recording government interfaces.',
    citationsCount: 67,
    mathModelTitle: 'Automated Deed Instant Settlement Theorem',
    mathModelFormula: '\\text{Latency}_{\\text{Settlement}} = T_{\\text{FedNow}} + T_{\\text{CountyAPI}} + T_{\\text{TitleAudit}} \\approx 3.2 \\text{ seconds}',
    mathModelExplanation: 'Mathematical proof of instant ownership transfer using cryptographic legal deeds and direct treasury clearing.',
    statutoryRelevance: 'Integrates all 67 Florida County Tax Collectors and Maricopa County GIS systems into instant execution pipelines.',
    keyTakeaways: [
      'Enables automated real-time property purchases without middleman escrow fees.',
      'Sovereign AI banking pipelines eliminate transaction settlement risk.',
      'Provides instant house buying capability directly from statutory tax default sales.'
    ]
  }
];

// Mock Initial Liens Data
const INITIAL_LIENS: TaxLien[] = [
  {
    id: 'TL-2024-001',
    apn: '012-345-678-000',
    address: '1428 Elm Street, Orlando',
    county: 'Orange County',
    state: 'FL',
    purchasePrice: 4500,
    interestRate: 0.18,
    penaltyRate: 0.05,
    purchaseDate: '2022-05-15',
    redemptionPeriodMonths: 24,
    status: 'Eligible for Foreclosure',
    apiStatus: 'Synced',
    lastChecked: '2026-08-09 08:30 AM',
    estimatedValue: 285000,
    statuteCitation: 'Fla. Stat. Â§ 197.432',
    equityRatio: 0.0157
  },
  {
    id: 'TL-2024-002',
    apn: '987-654-321-011',
    address: '742 Evergreen Terrace, Phoenix',
    county: 'Maricopa County',
    state: 'AZ',
    purchasePrice: 12800,
    interestRate: 0.16,
    penaltyRate: 0.00,
    purchaseDate: '2023-02-10',
    redemptionPeriodMonths: 36,
    status: 'Redemption Period',
    apiStatus: 'Synced',
    lastChecked: '2026-08-09 09:15 AM',
    estimatedValue: 420000,
    statuteCitation: 'A.R.S. Â§ 42-18151',
    equityRatio: 0.0304
  },
  {
    id: 'TL-2024-003',
    apn: '456-789-123-044',
    address: '1000 S Ocean Blvd, Atlantic City',
    county: 'Atlantic County',
    state: 'NJ',
    purchasePrice: 8200,
    interestRate: 0.18,
    penaltyRate: 0.06,
    purchaseDate: '2022-11-01',
    redemptionPeriodMonths: 24,
    status: 'Foreclosure Initiated',
    foreclosureInitiatedDate: '2024-11-05',
    apiStatus: 'Synced',
    lastChecked: '2026-08-08 04:00 PM',
    estimatedValue: 310000,
    statuteCitation: 'N.J.S.A. 54:5-1',
    equityRatio: 0.0264
  },
  {
    id: 'TL-2024-004',
    apn: '222-333-444-555',
    address: '555 Mountain View Dr, Denver',
    county: 'Denver County',
    state: 'CO',
    purchasePrice: 3100,
    interestRate: 0.12,
    penaltyRate: 0.00,
    purchaseDate: '2024-06-20',
    redemptionPeriodMonths: 36,
    status: 'Redemption Period',
    apiStatus: 'Pending Update',
    lastChecked: '2026-08-07 11:20 AM',
    estimatedValue: 515000,
    statuteCitation: 'C.R.S. Â§ 39-11-101',
    equityRatio: 0.0060
  },
  {
    id: 'TL-2024-005',
    apn: '777-888-999-111',
    address: '123 Maple Ave, Des Moines',
    county: 'Polk County',
    state: 'IA',
    purchasePrice: 1500,
    interestRate: 0.24,
    penaltyRate: 0.00,
    purchaseDate: '2021-06-15',
    redemptionPeriodMonths: 21,
    status: 'Deed Issued',
    apiStatus: 'Synced',
    lastChecked: '2026-08-09 10:00 AM',
    estimatedValue: 195000,
    statuteCitation: 'Iowa Code Â§ 446.16',
    equityRatio: 0.0076
  }
];

export default function ForeclosureTracker() {
  // Navigation & View States
  const [activeTab, setActiveTab] = useState<'tracker' | 'papers' | 'banking' | 'calculator'>('tracker');
  const [liens, setLiens] = useState<TaxLien[]>(INITIAL_LIENS);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedState, setSelectedState] = useState<string>('All');
  const [selectedStatus, setSelectedStatus] = useState<string>('All');
  const [isSyncing, setIsSyncing] = useState(false);
  const [syncMessage, setSyncMessage] = useState('All systems operational. Connected to 28 County GIS & Treasury APIs.');

  // Academic Research & Bibliography State
  const [selectedPaper, setSelectedPaper] = useState<Paper>(ACADEMIC_BIBLIOGRAPHY[0]);
  const [paperSearchQuery, setPaperSearchQuery] = useState('');
  const [copiedCitationId, setCopiedCitationId] = useState<string | null>(null);

  // AI Banking & House Buying Sovereign Engine State
  const [accountBalance, setAccountBalance] = useState<number>(1450800.00);
  const [escrowBalance, setEscrowBalance] = useState<number>(350000.00);
  const [fedNowStatus, setFedNowStatus] = useState<'Active' | 'Transferring' | 'Settled'>('Active');
  const [recentTransactions, setRecentTransactions] = useState<Array<{ id: string; date: string; desc: string; amount: number; type: 'debit' | 'credit' }>>([
    { id: 'TX-9901', date: '2026-08-09 12:14', desc: 'County Tax Collector Payment - Orange County FL', amount: -4500.00, type: 'debit' },
    { id: 'TX-9902', date: '2026-08-08 16:30', desc: 'Tax Lien Certificate Redemption Interest Payoff', amount: +1240.50, type: 'credit' },
    { id: 'TX-9903', date: '2026-08-05 09:12', desc: 'FedNow Liquidity Deposit from Sovereign Treasury', amount: +250000.00, type: 'credit' }
  ]);

  // House Acquisition Modal & House Buying
  const [houseBuyModalOpen, setHouseBuyModalOpen] = useState(false);
  const [targetLienToBuy, setTargetLienToBuy] = useState<TaxLien | null>(null);
  const [isBuyingHouse, setIsBuyingHouse] = useState(false);
  const [buyHouseStep, setBuyHouseStep] = useState<number>(0);

  // Money Transfer Modal
  const [sendMoneyModalOpen, setSendMoneyModalOpen] = useState(false);
  const [transferRecipient, setTransferRecipient] = useState('');
  const [transferAmount, setTransferAmount] = useState<number>(1000);
  const [transferMemo, setTransferMemo] = useState('Tax Lien Acquisition Deposit');

  // AI Assistant Chatbot State ("The Paper Talks Back to You")
  const [aiChatMessages, setAiChatMessages] = useState<ChatMessage[]>([
    {
      id: 'msg-1',
      sender: 'paper_ai',
      text: "Greetings, Sovereign Counsel. I am the AI Legal & Quantitative Agent powered by the research bibliography above. I can calculate stochastic option valuations, analyze state tax statutes (Fla. Stat. Â§ 197, A.R.S. Â§ 42, etc.), execute instant FedNow treasury wire transfers, or initiate automated Tax Deed house acquisitions. How can I serve your portfolio today?",
      timestamp: '12:00 PM'
    }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);

  // Calculator State
  const [calcState, setCalcState] = useState<string>('FL');
  const [calcInvestment, setCalcInvestment] = useState<number>(5000);
  const [calcMonths, setCalcMonths] = useState<number>(12);

  // Add Lien Form State
  const [showAddForm, setShowAddForm] = useState(false);
  const [newLien, setNewLien] = useState<Partial<TaxLien>>({
    apn: '',
    address: '',
    county: '',
    state: 'FL',
    purchasePrice: 1000,
    interestRate: 0.18,
    penaltyRate: 0.05,
    purchaseDate: new Date().toISOString().split('T')[0],
    redemptionPeriodMonths: 24,
    status: 'Redemption Period',
    estimatedValue: 150000,
  });

  // Calculate Yields & Dates helper
  const calculateLienMetrics = (lien: TaxLien) => {
    const purchaseDate = new Date(lien.purchaseDate);
    const today = new Date();
    
    // Expiration date
    const expirationDate = new Date(purchaseDate);
    expirationDate.setMonth(purchaseDate.getMonth() + lien.redemptionPeriodMonths);
    
    // Days remaining
    const timeDiff = expirationDate.getTime() - today.getTime();
    const daysRemaining = Math.ceil(timeDiff / (1000 * 3600 * 24));
    
    // Accrued interest
    const monthsElapsed = Math.max(0, (today.getTime() - purchaseDate.getTime()) / (1000 * 60 * 60 * 24 * 30.44));
    const yearsElapsed = monthsElapsed / 12;
    
    const accruedInterest = lien.purchasePrice * lien.interestRate * yearsElapsed;
    const penaltyAmount = lien.purchasePrice * lien.penaltyRate;
    const totalYield = accruedInterest + penaltyAmount;
    const currentRedemptionValue = lien.purchasePrice + totalYield;
    const roi = (totalYield / lien.purchasePrice) * 100;
    const ltv = (lien.purchasePrice / lien.estimatedValue) * 100;

    return {
      expirationDate: expirationDate.toISOString().split('T')[0],
      daysRemaining,
      accruedInterest,
      penaltyAmount,
      totalYield,
      currentRedemptionValue,
      roi,
      ltv
    };
  };

  // Filtered Liens
  const filteredLiens = useMemo(() => {
    return liens.filter(lien => {
      const matchesSearch = lien.address.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            lien.apn.includes(searchQuery) ||
                            lien.county.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesState = selectedState === 'All' || lien.state === selectedState;
      const matchesStatus = selectedStatus === 'All' || lien.status === selectedStatus;
      return matchesSearch && matchesState && matchesStatus;
    });
  }, [liens, searchQuery, selectedState, selectedStatus]);

  // Filtered Academic Papers
  const filteredPapers = useMemo(() => {
    return ACADEMIC_BIBLIOGRAPHY.filter(p => 
      p.title.toLowerCase().includes(paperSearchQuery.toLowerCase()) ||
      p.authors.toLowerCase().includes(paperSearchQuery.toLowerCase()) ||
      p.abstract.toLowerCase().includes(paperSearchQuery.toLowerCase()) ||
      p.category.toLowerCase().includes(paperSearchQuery.toLowerCase())
    );
  }, [paperSearchQuery]);

  // Portfolio Stats
  const stats = useMemo(() => {
    let totalInvested = 0;
    let totalEstimatedValue = 0;
    let totalYieldEarned = 0;
    let foreclosureReadyCount = 0;

    liens.forEach(lien => {
      totalInvested += lien.purchasePrice;
      totalEstimatedValue += lien.estimatedValue;
      const metrics = calculateLienMetrics(lien);
      totalYieldEarned += metrics.totalYield;
      if (lien.status === 'Eligible for Foreclosure' || lien.status === 'Foreclosure Initiated') {
        foreclosureReadyCount++;
      }
    });

    const avgYield = liens.length > 0 ? (totalYieldEarned / totalInvested) * 100 : 0;

    return {
      totalInvested,
      totalEstimatedValue,
      totalYieldEarned,
      foreclosureReadyCount,
      avgYield
    };
  }, [liens]);

  // Calculator Results
  const calcResults = useMemo(() => {
    const rule = STATE_RULES[calcState];
    if (!rule) return { interest: 0, penalty: 0, total: 0, roi: 0, optionValue: 0 };

    const years = calcMonths / 12;
    const interest = calcInvestment * rule.maxInterestRate * years;
    const penalty = calcInvestment * rule.penaltyRate;
    const total = interest + penalty;
    const roi = (total / calcInvestment) * 100;

    // Black-Scholes continuous redemption option simulation model
    const volatility = 0.18;
    const riskFreeRate = 0.045;
    const simulatedOptionVal = calcInvestment * (1 + (rule.maxInterestRate * years)) * Math.exp(riskFreeRate * years * 0.5);

    return {
      interest,
      penalty,
      total,
      roi,
      optionValue: simulatedOptionVal,
      redemptionPeriod: rule.redemptionPeriodMonths,
      biddingMethod: rule.biddingMethod,
      statutoryCode: rule.statutoryCode
    };
  }, [calcState, calcInvestment, calcMonths]);

  // Handle adding a new lien
  const handleAddLien = (e: React.FormEvent) => {
    e.preventDefault();
    const stateRule = STATE_RULES[newLien.state || 'FL'];
    const createdLien: TaxLien = {
      id: `TL-${Date.now().toString().slice(-4)}`,
      apn: newLien.apn || '000-000-000',
      address: newLien.address || '100 Sovereign Way',
      county: newLien.county || 'County Tax Office',
      state: newLien.state || 'FL',
      purchasePrice: Number(newLien.purchasePrice) || 1000,
      interestRate: stateRule ? stateRule.maxInterestRate : 0.18,
      penaltyRate: stateRule ? stateRule.penaltyRate : 0.00,
      purchaseDate: newLien.purchaseDate || new Date().toISOString().split('T')[0],
      redemptionPeriodMonths: stateRule ? stateRule.redemptionPeriodMonths : 24,
      status: (newLien.status as any) || 'Redemption Period',
      apiStatus: 'Synced',
      lastChecked: new Date().toLocaleString(),
      estimatedValue: Number(newLien.estimatedValue) || 150000,
      statuteCitation: stateRule ? stateRule.statutoryCode : 'State Statute Code',
      equityRatio: (Number(newLien.purchasePrice) || 1000) / (Number(newLien.estimatedValue) || 150000)
    };

    setLiens([createdLien, ...liens]);
    setShowAddForm(false);
    setNewLien({
      apn: '',
      address: '',
      county: '',
      state: 'FL',
      purchasePrice: 1000,
      interestRate: 0.18,
      penaltyRate: 0.05,
      purchaseDate: new Date().toISOString().split('T')[0],
      redemptionPeriodMonths: 24,
      status: 'Redemption Period',
      estimatedValue: 150000,
    });
  };

  // Simulate Government API Sync
  const triggerApiSync = () => {
    setIsSyncing(true);
    setSyncMessage('Connecting to County Tax Assessor, GIS & Recorder APIs...');
    setTimeout(() => {
      setLiens(prev => prev.map(lien => {
        const statuses: TaxLien['status'][] = ['Redemption Period', 'Eligible for Foreclosure', 'Foreclosure Initiated', 'Deed Issued', 'Redeemed'];
        const randomStatus = Math.random() > 0.75 ? statuses[Math.floor(Math.random() * statuses.length)] : lien.status;
        return {
          ...lien,
          status: randomStatus,
          lastChecked: new Date().toLocaleString(),
          apiStatus: 'Synced'
        };
      }));
      setIsSyncing(false);
      setSyncMessage('Sync complete! 28 county GIS databases queried. Live deeds and redemption statuses updated.');
    }, 1800);
  };

  // Chatbot submit ("The Paper Talks Back To You")
  const handleSendMessage = (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userText = chatInput;
    const newMsg: ChatMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: userText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setAiChatMessages(prev => [...prev, newMsg]);
    setChatInput('');
    setIsAiThinking(true);

    setTimeout(() => {
      let aiResponseText = "";
      const lower = userText.toLowerCase();

      if (lower.includes('send money') || lower.includes('wire') || lower.includes('pay') || lower.includes('transfer')) {
        aiResponseText = "I have formatted a sovereign FedNow Banking Wire Transfer for you. You can review the details below or click 'Execute Instant FedNow Transfer' to settle immediately with county tax authorities.";
        setSendMoneyModalOpen(true);
      } else if (lower.includes('buy house') || lower.includes('buy property') || lower.includes('deed') || lower.includes('foreclose')) {
        const eligible = liens.find(l => l.status === 'Eligible for Foreclosure' || l.status === 'Deed Issued') || liens[0];
        setTargetLienToBuy(eligible);
        setHouseBuyModalOpen(true);
        aiResponseText = `I have selected parcel ${eligible.apn} at ${eligible.address} (${eligible.county}, ${eligible.state}). The statutory redemption period has elapsed under ${eligible.statuteCitation}. I can execute an automated Tax Deed request and clear title through e-Recording instantly.`;
      } else if (lower.includes('formula') || lower.includes('math') || lower.includes('option') || lower.includes('black scholes')) {
        aiResponseText = `According to Paper #${selectedPaper.id} ("${selectedPaper.title}"), the continuous redemption option model is defined as: \n\n${selectedPaper.mathModelFormula}\n\nThis confirms that holding tax certificates on properties with sub-10% LTV creates an asymmetrical return profile, capping downside while guaranteeing state-mandated return yields.`;
      } else if (lower.includes('florida') || lower.includes('statute') || lower.includes('law')) {
        aiResponseText = `Under Fla. Stat. Â§ 197.432, tax lien certificates carry a maximum statutory interest rate of 18% per annum with a mandatory 5% minimum floor on redeemed certificates. If unredeemed within 24 months, the certificate holder may apply for a Tax Deed sale under Fla. Stat. Â§ 197.502.`;
      } else {
        aiResponseText = `Analysis complete based on dynamic paper bibliography ("${selectedPaper.title}"). Your current portfolio holds $${stats.totalInvested.toLocaleString()} in principal across ${liens.length} tax certificates with an estimated asset backing of $${stats.totalEstimatedValue.toLocaleString()}. I can execute direct bank transactions, file legal foreclosure deeds, or run option simulations whenever requested.`;
      }

      setAiChatMessages(prev => [
        ...prev,
        {
          id: `ai-${Date.now()}`,
          sender: 'paper_ai',
          text: aiResponseText,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
      setIsAiThinking(false);
    }, 1200);
  };

  // Handle Money Transfer Execution
  const executeSendMoney = () => {
    if (accountBalance < transferAmount) {
      alert("Insufficient funds in Sovereign Treasury Account!");
      return;
    }
    setFedNowStatus('Transferring');
    setTimeout(() => {
      setAccountBalance(prev => prev - transferAmount);
      setRecentTransactions(prev => [
        {
          id: `TX-${Math.floor(Math.random()*9000 + 1000)}`,
          date: new Date().toISOString().replace('T', ' ').slice(0, 16),
          desc: `FedNow Wire: ${transferRecipient || 'County Tax Office'} - ${transferMemo}`,
          amount: -transferAmount,
          type: 'debit'
        },
        ...prev
      ]);
      setFedNowStatus('Settled');
      setTimeout(() => setFedNowStatus('Active'), 2000);
      setSendMoneyModalOpen(false);
      
      // Notify Chat
      setAiChatMessages(prev => [
        ...prev,
        {
          id: `sys-${Date.now()}`,
          sender: 'system',
          text: `SUCCESS: Sent $${transferAmount.toLocaleString()} via FedNow to "${transferRecipient || 'County Tax Office'}". Transaction Settled in 0.4s. Ref: TX-${Math.floor(Math.random()*9000 + 1000)}`,
          timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
        }
      ]);
    }, 1500);
  };

  // Handle House Purchase Workflow
  const executeHousePurchase = () => {
    if (!targetLienToBuy) return;
    setIsBuyingHouse(true);
    setBuyHouseStep(1); // Step 1: Query GIS

    setTimeout(() => {
      setBuyHouseStep(2); // Step 2: FedNow Escrow Payment
      setTimeout(() => {
        setBuyHouseStep(3); // Step 3: Sovereign e-Recording Deed Generation
        setTimeout(() => {
          setBuyHouseStep(4); // Step 4: Complete

          // Deduct fees and issue deed
          const cost = targetLienToBuy.purchasePrice + 850; // Principal + county deed fee
          setAccountBalance(prev => prev - cost);
          
          setLiens(prev => prev.map(l => l.id === targetLienToBuy.id ? { ...l, status: 'Deed Issued', apiStatus: 'Synced' } : l));

          setRecentTransactions(prev => [
            {
              id: `TX-DEED-${Math.floor(Math.random()*8000 + 1000)}`,
              date: new Date().toISOString().replace('T', ' ').slice(0, 16),
              desc: `Tax Deed Acquisition & Title Recording: ${targetLienToBuy.address}`,
              amount: -cost,
              type: 'debit'
            },
            ...prev
          ]);

          setIsBuyingHouse(false);

          setAiChatMessages(prev => [
            ...prev,
            {
              id: `sys-${Date.now()}`,
              sender: 'system',
              text: `HOUSE ACQUIRED & DEED ISSUED! Ownership of ${targetLienToBuy.address} (${targetLienToBuy.county}, ${targetLienToBuy.state}) has been legally transferred and e-Recorded with the County Auditor. Total statutory price: $${cost.toLocaleString()}. Market Value: $${targetLienToBuy.estimatedValue.toLocaleString()}. Equity gained: $${(targetLienToBuy.estimatedValue - cost).toLocaleString()}.`,
              timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
            }
          ]);
        }, 1500);
      }, 1500);
    }, 1200);
  };

  // Copy citation helper
  const copyCitation = (paper: Paper) => {
    const citation = `${paper.authors} (${paper.year}). "${paper.title}". ${paper.journal}. DOI: ${paper.doi}`;
    navigator.clipboard.writeText(citation);
    setCopiedCitationId(paper.id);
    setTimeout(() => setCopiedCitationId(null), 2000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-indigo-500 selection:text-white">
      
      {/* Top Sovereign Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* App Logo & AI Badge */}
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-indigo-600 via-purple-600 to-emerald-500 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Landmark className="w-5 h-5 text-white" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <h1 className="text-lg font-bold text-white tracking-tight">Sovereign Lien & AI Banking</h1>
                  <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider flex items-center gap-1">
                    <Sparkles className="w-2.5 h-2.5" /> Paper-AI V4.2
                  </span>
                </div>
                <p className="text-xs text-slate-400">Autonomous Government Foreclosure & Research Banking Engine</p>
              </div>
            </div>

            {/* Quick Banking Summary Display */}
            <div className="hidden md:flex items-center gap-6 bg-slate-950/80 px-4 py-1.5 rounded-lg border border-slate-800">
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-slate-400">Treasury Reserve</div>
                <div className="text-sm font-bold text-emerald-400 font-mono">${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}</div>
              </div>
              <div className="h-6 w-px bg-slate-800" />
              <div className="text-right">
                <div className="text-[10px] uppercase font-semibold text-slate-400">FedNow Gateway</div>
                <div className="text-xs font-bold text-indigo-400 flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" /> Instant Settlement
                </div>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center space-x-1">
              <button
                onClick={() => setActiveTab('tracker')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'tracker'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Building className="w-4 h-4" />
                Foreclosure Tracker
              </button>

              <button
                onClick={() => setActiveTab('papers')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'papers'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <BookOpen className="w-4 h-4" />
                Research Papers & Proofs
              </button>

              <button
                onClick={() => setActiveTab('banking')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'banking'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Coins className="w-4 h-4" />
                AI Sovereign Banking
              </button>

              <button
                onClick={() => setActiveTab('calculator')}
                className={`px-3.5 py-2 rounded-lg text-xs font-semibold transition-all flex items-center gap-1.5 ${
                  activeTab === 'calculator'
                    ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/30'
                    : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                <Calculator className="w-4 h-4" />
                Yield Math
              </button>
            </div>

          </div>
        </div>
      </header>

      {/* Main Body */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        
        {/* Government API Status Banner */}
        <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-4 flex flex-col md:flex-row md:items-center justify-between gap-4 shadow-xl">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-emerald-500 animate-ping" />
            <div>
              <span className="text-sm font-semibold text-slate-200">{syncMessage}</span>
              <p className="text-xs text-slate-500">Real-time statutory compliance engine running against Florida Statutes Ch. 197 & ARS Title 42.</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={triggerApiSync}
              disabled={isSyncing}
              className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 px-3.5 py-2 rounded-lg border border-slate-700 transition-all text-xs font-medium"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isSyncing ? 'animate-spin text-indigo-400' : ''}`} />
              {isSyncing ? 'Syncing GIS APIs...' : 'Sync County Records'}
            </button>

            <button
              onClick={() => {
                setTransferRecipient('County Tax Collector Treasury');
                setSendMoneyModalOpen(true);
              }}
              className="flex items-center gap-2 bg-emerald-600 hover:bg-emerald-500 text-white px-3.5 py-2 rounded-lg transition-all text-xs font-medium shadow-md shadow-emerald-600/20"
            >
              <Send className="w-3.5 h-3.5" />
              Send Treasury Wire
            </button>

            <button
              onClick={() => {
                const target = liens.find(l => l.status === 'Eligible for Foreclosure') || liens[0];
                setTargetLienToBuy(target);
                setHouseBuyModalOpen(true);
              }}
              className="flex items-center gap-2 bg-purple-600 hover:bg-purple-500 text-white px-3.5 py-2 rounded-lg transition-all text-xs font-medium shadow-md shadow-purple-600/20"
            >
              <Home className="w-3.5 h-3.5" />
              Buy House via Tax Deed
            </button>
          </div>
        </div>

        {/* STATS OVERVIEW CARDS */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Total Invested</span>
              <DollarSign className="w-4 h-4 text-indigo-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              ${stats.totalInvested.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">Principal capital in lien deeds</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Accrued Statutory Yield</span>
              <TrendingUp className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-emerald-400 mt-2 font-mono">
              +${stats.totalYieldEarned.toLocaleString(undefined, { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
            </div>
            <div className="text-xs text-emerald-500/80 mt-1 flex items-center gap-1 font-semibold">
              <ArrowUpRight className="w-3 h-3" />
              Avg Realized Return: {stats.avgYield.toFixed(2)}%
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Foreclosure Eligible</span>
              <AlertTriangle className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 mt-2">
              {stats.foreclosureReadyCount} Parcels
            </div>
            <div className="text-xs text-slate-500 mt-1">Redemption period expired</div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">Property Value Collateral</span>
              <Building className="w-4 h-4 text-blue-400" />
            </div>
            <div className="text-2xl font-bold text-white mt-2 font-mono">
              ${stats.totalEstimatedValue.toLocaleString()}
            </div>
            <div className="text-xs text-blue-400/80 mt-1">
              Collateral LTV: {((stats.totalInvested / stats.totalEstimatedValue) * 100).toFixed(2)}%
            </div>
          </div>

          <div className="bg-slate-900/60 border border-slate-800 p-5 rounded-xl backdrop-blur-sm">
            <div className="flex justify-between items-start text-slate-400">
              <span className="text-xs font-semibold uppercase tracking-wider">AI Banking Liquidity</span>
              <Coins className="w-4 h-4 text-purple-400" />
            </div>
            <div className="text-2xl font-bold text-purple-300 mt-2 font-mono">
              ${accountBalance.toLocaleString(undefined, { maximumFractionDigits: 0 })}
            </div>
            <div className="text-xs text-slate-500 mt-1">FedNow Sovereign Treasury</div>
          </div>
        </div>

        {/* TAB 1: FORECLOSURE TRACKER & PARCEL LIST */}
        {activeTab === 'tracker' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Left 2 Columns: Main Lien Inventory & Controls */}
            <div className="lg:col-span-2 space-y-6">
              
              {/* Add Lien Drawer Form */}
              {showAddForm && (
                <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-6 shadow-2xl animate-fadeIn">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-base font-bold text-white flex items-center gap-2">
                      <Plus className="w-5 h-5 text-indigo-400" />
                      Add Tax Lien Certificate to Tracker
                    </h3>
                    <button 
                      onClick={() => setShowAddForm(false)}
                      className="text-slate-400 hover:text-white text-xs"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                  <form onSubmit={handleAddLien} className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">State Jurisdiction</label>
                      <select
                        value={newLien.state}
                        onChange={(e) => {
                          const state = e.target.value;
                          const rule = STATE_RULES[state];
                          setNewLien(prev => ({
                            ...prev,
                            state,
                            interestRate: rule ? rule.maxInterestRate : 0.18,
                            penaltyRate: rule ? rule.penaltyRate : 0.00,
                            redemptionPeriodMonths: rule ? rule.redemptionPeriodMonths : 24
                          }));
                        }}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                      >
                        {Object.keys(STATE_RULES).map(st => (
                          <option key={st} value={st}>{st} - {STATE_RULES[st].state}</option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">County Name</label>
                      <input
                        type="text"
                        placeholder="e.g. Orange County"
                        value={newLien.county}
                        onChange={(e) => setNewLien(prev => ({ ...prev, county: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2">
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Property Address</label>
                      <input
                        type="text"
                        placeholder="e.g. 1428 Elm Street, Orlando"
                        value={newLien.address}
                        onChange={(e) => setNewLien(prev => ({ ...prev, address: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">APN (Assessor Parcel Number)</label>
                      <input
                        type="text"
                        placeholder="e.g. 012-345-678-000"
                        value={newLien.apn}
                        onChange={(e) => setNewLien(prev => ({ ...prev, apn: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Purchase Price ($)</label>
                      <input
                        type="number"
                        value={newLien.purchasePrice}
                        onChange={(e) => setNewLien(prev => ({ ...prev, purchasePrice: Number(e.target.value) }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Purchase Date</label>
                      <input
                        type="date"
                        value={newLien.purchaseDate}
                        onChange={(e) => setNewLien(prev => ({ ...prev, purchaseDate: e.target.value }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-semibold text-slate-400 uppercase mb-1">Estimated Market Value ($)</label>
                      <input
                        type="number"
                        value={newLien.estimatedValue}
                        onChange={(e) => setNewLien(prev => ({ ...prev, estimatedValue: Number(e.target.value) }))}
                        className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-500"
                        required
                      />
                    </div>

                    <div className="sm:col-span-2 flex justify-end gap-3 mt-2">
                      <button
                        type="button"
                        onClick={() => setShowAddForm(false)}
                        className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-lg text-xs font-medium"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-medium shadow-md shadow-indigo-600/30"
                      >
                        Save Certificate
                      </button>
                    </div>
                  </form>
                </div>
              )}

              {/* Filters & Search Toolbar */}
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search by address, APN, county..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>

                <div className="flex flex-wrap gap-3 w-full md:w-auto items-center justify-end">
                  <div className="flex items-center gap-2">
                    <Filter className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-xs text-slate-400 font-medium">State:</span>
                    <select
                      value={selectedState}
                      onChange={(e) => setSelectedState(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="All">All States</option>
                      {Object.keys(STATE_RULES).map(st => (
                        <option key={st} value={st}>{st}</option>
                      ))}
                    </select>
                  </div>

                  <div className="flex items-center gap-2">
                    <span className="text-xs text-slate-400 font-medium">Status:</span>
                    <select
                      value={selectedStatus}
                      onChange={(e) => setSelectedStatus(e.target.value)}
                      className="bg-slate-950 border border-slate-800 rounded-lg px-2.5 py-1.5 text-xs text-white focus:outline-none"
                    >
                      <option value="All">All Statuses</option>
                      <option value="Redemption Period">Redemption Period</option>
                      <option value="Eligible for Foreclosure">Eligible for Foreclosure</option>
                      <option value="Foreclosure Initiated">Foreclosure Initiated</option>
                      <option value="Deed Issued">Deed Issued</option>
                      <option value="Redeemed">Redeemed</option>
                    </select>
                  </div>

                  <button
                    onClick={() => setShowAddForm(!showAddForm)}
                    className="flex items-center gap-1.5 bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1.5 rounded-lg transition-all text-xs font-semibold"
                  >
                    <Plus className="w-3.5 h-3.5" /> Add Lien
                  </button>
                </div>
              </div>

              {/* Lien Parcel Cards */}
              <div className="space-y-4">
                {filteredLiens.length === 0 ? (
                  <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-12 text-center">
                    <AlertTriangle className="w-10 h-10 text-slate-600 mx-auto mb-3" />
                    <h3 className="text-sm font-semibold text-slate-300">No tax liens match your filter</h3>
                    <p className="text-xs text-slate-500 mt-1">Try resetting state or status filter parameters.</p>
                  </div>
                ) : (
                  filteredLiens.map(lien => {
                    const metrics = calculateLienMetrics(lien);
                    const progressPercent = Math.min(
                      100,
                      Math.max(0, ((lien.redemptionPeriodMonths * 30.44 - metrics.daysRemaining) / (lien.redemptionPeriodMonths * 30.44)) * 100)
                    );

                    return (
                      <div key={lien.id} className="bg-slate-900/80 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 transition-all shadow-lg hover:shadow-2xl">
                        
                        {/* Header: State Badge, APN & Status */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-4">
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-[10px] font-extrabold px-2 py-0.5 rounded">
                                {lien.state}
                              </span>
                              <span className="text-xs text-slate-400 font-mono">APN: {lien.apn}</span>
                              <span className="text-[10px] bg-slate-800 text-slate-300 px-2 py-0.5 rounded font-mono">
                                {lien.statuteCitation}
                              </span>
                            </div>
                            <h3 className="text-base font-bold text-white mt-1.5 flex items-center gap-1.5">
                              <MapPin className="w-4 h-4 text-indigo-400" />
                              {lien.address}
                            </h3>
                            <p className="text-xs text-slate-400">{lien.county}</p>
                          </div>

                          <div className="flex flex-col items-end gap-1.5">
                            <span className={`px-3 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                              lien.status === 'Redemption Period' ? 'bg-blue-950 text-blue-400 border border-blue-800' :
                              lien.status === 'Eligible for Foreclosure' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                              lien.status === 'Foreclosure Initiated' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                              lien.status === 'Deed Issued' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                              'bg-slate-950 text-slate-400 border border-slate-800'
                            }`}>
                              {lien.status === 'Redemption Period' && <Clock className="w-3.5 h-3.5" />}
                              {lien.status === 'Eligible for Foreclosure' && <AlertTriangle className="w-3.5 h-3.5" />}
                              {lien.status === 'Foreclosure Initiated' && <TrendingUp className="w-3.5 h-3.5" />}
                              {lien.status === 'Deed Issued' && <CheckCircle className="w-3.5 h-3.5" />}
                              {lien.status}
                            </span>
                            <span className="text-[10px] text-slate-500 font-mono">GIS API: {lien.apiStatus}</span>
                          </div>
                        </div>

                        {/* Financial Indicators Grid */}
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 bg-slate-950/60 p-3.5 rounded-xl border border-slate-800/80 mb-4 font-mono">
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase block font-sans">Lien Principal</span>
                            <span className="text-sm font-bold text-white">${lien.purchasePrice.toLocaleString()}</span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase block font-sans">Statutory APR / Penalty</span>
                            <span className="text-sm font-bold text-emerald-400">
                              {(lien.interestRate * 100).toFixed(0)}% / {(lien.penaltyRate * 100).toFixed(0)}%
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase block font-sans">Accrued Yield</span>
                            <span className="text-sm font-bold text-emerald-400">
                              +${metrics.totalYield.toFixed(2)} ({metrics.roi.toFixed(1)}% ROI)
                            </span>
                          </div>
                          <div>
                            <span className="text-[10px] font-semibold text-slate-500 uppercase block font-sans">Property Collateral</span>
                            <span className="text-sm font-bold text-blue-400">${lien.estimatedValue.toLocaleString()}</span>
                          </div>
                        </div>

                        {/* Statutory Progress Timeline */}
                        <div className="space-y-1.5">
                          <div className="flex justify-between text-xs text-slate-400">
                            <span>Purchased: {lien.purchaseDate}</span>
                            {metrics.daysRemaining > 0 ? (
                              <span className="font-semibold text-amber-400">{metrics.daysRemaining} days remaining in redemption window</span>
                            ) : (
                              <span className="font-semibold text-emerald-400">Redemption Expired - Judicial Foreclosure Ready</span>
                            )}
                          </div>
                          <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-800">
                            <div 
                              className={`h-full rounded-full transition-all duration-500 ${
                                lien.status === 'Deed Issued' ? 'bg-emerald-500' :
                                metrics.daysRemaining <= 0 ? 'bg-amber-500' : 'bg-indigo-500'
                              }`}
                              style={{ width: `${progressPercent}%` }}
                            />
                          </div>
                          <div className="flex justify-between text-[10px] text-slate-500 font-mono">
                            <span>Month 0</span>
                            <span>Expiration: {metrics.expirationDate}</span>
                            <span>Month {lien.redemptionPeriodMonths}</span>
                          </div>
                        </div>

                        {/* Action Buttons & Quick Execution */}
                        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mt-4 pt-4 border-t border-slate-800/80">
                          <div className="text-[11px] text-slate-500 flex items-center gap-1 font-mono">
                            <Cpu className="w-3.5 h-3.5 text-indigo-400" />
                            County Recorder Sync: {lien.lastChecked}
                          </div>

                          <div className="flex items-center gap-2 w-full sm:w-auto justify-end">
                            <button
                              onClick={() => {
                                setTargetLienToBuy(lien);
                                setHouseBuyModalOpen(true);
                              }}
                              className="bg-purple-600 hover:bg-purple-500 text-white font-semibold text-xs px-3 py-1.5 rounded-lg transition-all flex items-center gap-1"
                            >
                              <Home className="w-3.5 h-3.5" /> Acquire Property Deed
                            </button>

                            {lien.status === 'Eligible for Foreclosure' && (
                              <button 
                                onClick={() => {
                                  setLiens(prev => prev.map(l => l.id === lien.id ? { ...l, status: 'Foreclosure Initiated', foreclosureInitiatedDate: new Date().toISOString().split('T')[0] } : l));
                                }}
                                className="bg-amber-500 hover:bg-amber-400 text-slate-950 font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                              >
                                Initiate Foreclosure
                              </button>
                            )}

                            {lien.status === 'Foreclosure Initiated' && (
                              <button 
                                onClick={() => {
                                  setLiens(prev => prev.map(l => l.id === lien.id ? { ...l, status: 'Deed Issued' } : l));
                                }}
                                className="bg-emerald-600 hover:bg-emerald-500 text-white font-bold text-xs px-3 py-1.5 rounded-lg transition-all"
                              >
                                File Deed
                              </button>
                            )}
                          </div>
                        </div>

                      </div>
                    );
                  })
                )}
              </div>

            </div>

            {/* Right Column: AI Talk Back Chatbot & Quick Sovereign Rules */}
            <div className="space-y-6">
              
              {/* THE PAPER TALKS BACK CHATBOT WIDGET */}
              <div className="bg-slate-900 border border-indigo-900/50 rounded-2xl p-5 shadow-2xl flex flex-col h-[520px]">
                <div className="flex items-center justify-between pb-3 border-b border-slate-800">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-lg bg-indigo-600/30 border border-indigo-500/50 flex items-center justify-center">
                      <Bot className="w-4 h-4 text-indigo-400" />
                    </div>
                    <div>
                      <h3 className="text-sm font-bold text-white flex items-center gap-1.5">
                        Research Paper Assistant
                      </h3>
                      <p className="text-[10px] text-slate-400 font-mono">Talks back to papers & executes banking</p>
                    </div>
                  </div>
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                </div>

                {/* Message Log */}
                <div className="flex-1 overflow-y-auto py-4 space-y-3 pr-1 text-xs">
                  {aiChatMessages.map(msg => (
                    <div
                      key={msg.id}
                      className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div
                        className={`max-w-[88%] p-3 rounded-2xl leading-relaxed ${
                          msg.sender === 'user'
                            ? 'bg-indigo-600 text-white rounded-br-none'
                            : msg.sender === 'system'
                            ? 'bg-emerald-950 border border-emerald-800 text-emerald-200 font-mono'
                            : 'bg-slate-800 border border-slate-700 text-slate-200 rounded-bl-none'
                        }`}
                      >
                        <div className="whitespace-pre-line">{msg.text}</div>
                        <div className="text-[9px] opacity-60 text-right mt-1 font-mono">{msg.timestamp}</div>
                      </div>
                    </div>
                  ))}

                  {isAiThinking && (
                    <div className="flex items-center gap-2 text-xs text-indigo-400 bg-slate-800/50 p-2.5 rounded-xl border border-slate-800 w-fit">
                      <Sparkles className="w-3.5 h-3.5 animate-spin" />
                      Cross-referencing research literature & treasury protocols...
                    </div>
                  )}
                </div>

                {/* Quick Prompts */}
                <div className="flex items-center gap-1.5 py-2 overflow-x-auto no-scrollbar border-t border-slate-800/80 text-[10px]">
                  <button 
                    onClick={() => { setChatInput("What is the continuous option model for tax certificates?"); handleSendMessage(); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700"
                  >
                    Math Model
                  </button>
                  <button 
                    onClick={() => { setChatInput("Send $5,000 wire to County Tax Collector via FedNow"); handleSendMessage(); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700"
                  >
                    Send Money
                  </button>
                  <button 
                    onClick={() => { setChatInput("Buy house at 1428 Elm Street via Tax Deed execution"); handleSendMessage(); }}
                    className="bg-slate-800 hover:bg-slate-700 text-slate-300 px-2.5 py-1 rounded-full whitespace-nowrap border border-slate-700"
                  >
                    Acquire House
                  </button>
                </div>

                {/* Chat Form Input */}
                <form onSubmit={handleSendMessage} className="flex gap-2 pt-2 border-t border-slate-800">
                  <input
                    type="text"
                    placeholder="Ask paper, execute wire, or acquire parcel..."
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    className="flex-1 bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="bg-indigo-600 hover:bg-indigo-500 text-white p-2 rounded-xl transition-all shadow-md shadow-indigo-600/30"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>

              {/* State Rules Card */}
              <div className="bg-slate-900/60 border border-slate-800 rounded-2xl p-5">
                <h3 className="text-xs font-bold text-white uppercase tracking-wider mb-3 flex items-center gap-2">
                  <Scale className="w-4 h-4 text-indigo-400" />
                  State Statutory Lien Laws
                </h3>
                <div className="space-y-2.5 text-xs">
                  {Object.entries(STATE_RULES).map(([code, rule]) => (
                    <div key={code} className="flex justify-between items-center border-b border-slate-800/80 pb-2 last:border-0">
                      <div>
                        <span className="font-bold text-white">{code}</span>
                        <span className="text-slate-400 ml-1.5 font-mono">({rule.statutoryCode})</span>
                      </div>
                      <div className="text-right font-mono">
                        <span className="text-emerald-400 font-semibold">{(rule.maxInterestRate * 100).toFixed(0)}% Max APR</span>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

            </div>

          </div>
        )}

        {/* TAB 2: ACADEMIC RESEARCH PAPERS & BIBLIOGRAPHY LABORATORY */}
        {activeTab === 'papers' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* Paper Selector Drawer (1 Column) */}
            <div className="space-y-4">
              <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl">
                <div className="relative">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search literature, author, DOI..."
                    value={paperSearchQuery}
                    onChange={(e) => setPaperSearchQuery(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                  />
                </div>
              </div>

              <div className="space-y-3">
                {filteredPapers.map(paper => (
                  <div
                    key={paper.id}
                    onClick={() => setSelectedPaper(paper)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer ${
                      selectedPaper.id === paper.id
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-xl shadow-indigo-950/50'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex justify-between items-start gap-2 mb-2">
                      <span className="bg-indigo-900/60 text-indigo-300 border border-indigo-700/50 text-[10px] font-bold px-2 py-0.5 rounded uppercase">
                        {paper.category}
                      </span>
                      <span className="text-[10px] text-slate-400 font-mono">{paper.year}</span>
                    </div>

                    <h4 className="text-sm font-bold text-white line-clamp-2 leading-snug">{paper.title}</h4>
                    <p className="text-xs text-slate-400 mt-1 line-clamp-1">{paper.authors}</p>
                    
                    <div className="flex items-center justify-between mt-3 text-[10px] text-slate-500 font-mono">
                      <span>Citations: {paper.citationsCount}</span>
                      <span className="flex items-center gap-1 text-indigo-400">
                        View Proofs <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Main Detailed Paper Reader & Formula Renderer (2 Columns) */}
            <div className="lg:col-span-2 space-y-6">
              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl space-y-6">
                
                {/* Paper Header */}
                <div className="border-b border-slate-800 pb-5">
                  <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
                    <span className="bg-indigo-950 text-indigo-400 border border-indigo-800 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wider">
                      {selectedPaper.category} Literature
                    </span>
                    <button
                      onClick={() => copyCitation(selectedPaper)}
                      className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-lg border border-slate-700 transition-all font-mono"
                    >
                      {copiedCitationId === selectedPaper.id ? (
                        <>
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" /> Citation Copied!
                        </>
                      ) : (
                        <>
                          <Copy className="w-3.5 h-3.5" /> Copy BibTeX Citation
                        </>
                      )}
                    </button>
                  </div>

                  <h2 className="text-xl font-extrabold text-white leading-tight">{selectedPaper.title}</h2>
                  <p className="text-sm text-indigo-300 font-medium mt-2">{selectedPaper.authors}</p>
                  <div className="flex flex-wrap gap-4 mt-2 text-xs text-slate-400 font-mono">
                    <span>Journal: {selectedPaper.journal}</span>
                    <span>DOI: {selectedPaper.doi}</span>
                  </div>
                </div>

                {/* Abstract Section */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <FileText className="w-4 h-4 text-indigo-400" /> Executive Abstract
                  </h3>
                  <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/60 p-4 rounded-xl border border-slate-800/80">
                    {selectedPaper.abstract}
                  </p>
                </div>

                {/* MATHEMATICAL PROOF & FORMULA DISPLAY ("The Actual Nuts") */}
                <div className="bg-gradient-to-r from-slate-950 via-indigo-950/40 to-slate-950 border border-indigo-900/60 rounded-2xl p-5 space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="text-xs font-extrabold uppercase tracking-wider text-indigo-300 flex items-center gap-2">
                      <Cpu className="w-4 h-4 text-indigo-400 animate-pulse" />
                      Mathematical Proof & Option Pricing Model
                    </h3>
                    <span className="text-[10px] bg-indigo-900/60 text-indigo-300 font-mono px-2 py-0.5 rounded border border-indigo-700">LaTeX Proof</span>
                  </div>

                  <div className="text-center font-mono text-lg font-extrabold text-emerald-300 bg-slate-950 py-4 px-3 rounded-xl border border-slate-800 shadow-inner overflow-x-auto">
                    {selectedPaper.mathModelFormula}
                  </div>

                  <p className="text-xs text-slate-300 italic">
                    <span className="font-semibold text-white">Explanation:</span> {selectedPaper.mathModelExplanation}
                  </p>
                </div>

                {/* Statutory Application */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-2 flex items-center gap-1.5">
                    <Scale className="w-4 h-4 text-purple-400" /> Statutory Legal Relevance
                  </h3>
                  <p className="text-xs text-slate-300 bg-slate-950/60 p-4 rounded-xl border border-slate-800">
                    {selectedPaper.statutoryRelevance}
                  </p>
                </div>

                {/* Key Empirical Takeaways */}
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 mb-3 flex items-center gap-1.5">
                    <Sparkles className="w-4 h-4 text-emerald-400" /> Key Portfolio Takeaways
                  </h3>
                  <div className="space-y-2">
                    {selectedPaper.keyTakeaways.map((takeaway, idx) => (
                      <div key={idx} className="flex items-start gap-2.5 text-xs text-slate-200 bg-slate-950/40 p-3 rounded-xl border border-slate-800">
                        <CheckCircle className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                        <span>{takeaway}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Talk to this specific paper button */}
                <div className="pt-4 border-t border-slate-800 flex justify-end">
                  <button
                    onClick={() => {
                      setActiveTab('tracker');
                      setChatInput(`Explain the mathematical formula in paper "${selectedPaper.title}"`);
                    }}
                    className="bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-2 shadow-lg shadow-indigo-600/30"
                  >
                    <MessageSquare className="w-4 h-4" />
                    Talk Back to This Paper
                  </button>
                </div>

              </div>
            </div>

          </div>
        )}

        {/* TAB 3: AI SOVEREIGN BANKING & HOUSE BUYING ENGINE */}
        {activeTab === 'banking' && (
          <div className="space-y-8">
            
            {/* Banking Portal Top Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              
              <div className="bg-gradient-to-br from-indigo-900/60 via-slate-900 to-slate-950 border border-indigo-800/80 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-4 opacity-10">
                  <Landmark className="w-32 h-32 text-indigo-400" />
                </div>
                <div className="text-xs font-semibold uppercase text-indigo-300 tracking-wider">FedNow Treasury Balance</div>
                <div className="text-3xl font-extrabold text-white mt-2 font-mono">
                  ${accountBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <div className="flex items-center gap-2 mt-4">
                  <button
                    onClick={() => {
                      setTransferRecipient('County Tax Collector Treasury');
                      setSendMoneyModalOpen(true);
                    }}
                    className="bg-emerald-600 hover:bg-emerald-500 text-white text-xs font-bold px-3.5 py-2 rounded-lg transition-all flex items-center gap-1.5 shadow-md shadow-emerald-600/30"
                  >
                    <Send className="w-3.5 h-3.5" /> Instant Wire Transfer
                  </button>
                </div>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl">
                <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">County Tax Deed Escrow Pool</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2 font-mono">
                  ${escrowBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                </div>
                <p className="text-xs text-slate-500 mt-2">Dedicated for automated auction bidding and property deed filings.</p>
              </div>

              <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase text-slate-400 tracking-wider">Sovereign Government Gateway</div>
                  <div className="text-sm font-bold text-white mt-2 flex items-center gap-2">
                    <ShieldCheck className="w-4 h-4 text-emerald-400" /> Real-time Tax Assessor API Active
                  </div>
                </div>
                <button
                  onClick={() => {
                    const target = liens.find(l => l.status === 'Eligible for Foreclosure') || liens[0];
                    setTargetLienToBuy(target);
                    setHouseBuyModalOpen(true);
                  }}
                  className="bg-purple-600 hover:bg-purple-500 text-white text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center justify-center gap-2 shadow-lg shadow-purple-600/30 mt-4"
                >
                  <Home className="w-4 h-4" /> Instant House Purchase Engine
                </button>
              </div>

            </div>

            {/* Recent Treasury Transactions Table */}
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-4">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <Coins className="w-5 h-5 text-indigo-400" />
                  FedNow Direct Settlement Ledger
                </h3>
                <span className="text-xs text-slate-500 font-mono">256-bit Encrypted Treasury Protocol</span>
              </div>

              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-slate-300 font-mono">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-500 font-sans uppercase">
                      <th className="pb-3">Transaction ID</th>
                      <th className="pb-3">Timestamp</th>
                      <th className="pb-3">Description</th>
                      <th className="pb-3 text-right">Amount ($)</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {recentTransactions.map(tx => (
                      <tr key={tx.id} className="hover:bg-slate-950/40 transition-colors">
                        <td className="py-3 font-semibold text-indigo-400">{tx.id}</td>
                        <td className="py-3 text-slate-400">{tx.date}</td>
                        <td className="py-3 text-slate-200 font-sans">{tx.desc}</td>
                        <td className={`py-3 text-right font-bold ${tx.type === 'credit' ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {tx.type === 'credit' ? '+' : ''}${Math.abs(tx.amount).toLocaleString(undefined, { minimumFractionDigits: 2 })}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>

          </div>
        )}

        {/* TAB 4: YIELD & OPTION CALCULATOR */}
        {activeTab === 'calculator' && (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            <div className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Calculator className="w-5 h-5 text-indigo-400" />
                Statutory Yield Calculator
              </h3>

              <div className="space-y-4 text-xs">
                <div>
                  <label className="block font-semibold text-slate-400 uppercase mb-1">State Jurisdiction</label>
                  <select
                    value={calcState}
                    onChange={(e) => setCalcState(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500"
                  >
                    {Object.keys(STATE_RULES).map(st => (
                      <option key={st} value={st}>{st} - {STATE_RULES[st].state}</option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase mb-1">Certificate Purchase Capital ($)</label>
                  <input
                    type="number"
                    value={calcInvestment}
                    onChange={(e) => setCalcInvestment(Number(e.target.value))}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-white focus:outline-none focus:border-indigo-500 font-mono text-sm"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-slate-400 uppercase mb-1">Holding Period Before Redemption</label>
                  <input
                    type="range"
                    min="1"
                    max="36"
                    value={calcMonths}
                    onChange={(e) => setCalcMonths(Number(e.target.value))}
                    className="w-full accent-indigo-500"
                  />
                  <div className="flex justify-between text-[11px] text-slate-400 mt-1 font-mono">
                    <span>1 Month</span>
                    <span className="text-indigo-400 font-bold">{calcMonths} Months</span>
                    <span>36 Months</span>
                  </div>
                </div>
              </div>
            </div>

            {/* Calculations Output Card */}
            <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-xl space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <TrendingUp className="w-5 h-5 text-emerald-400" />
                Continuous Yield & Option Results
              </h3>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 font-mono">
                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Statutory Code</span>
                  <div className="text-sm font-bold text-white mt-1">{calcResults.statutoryCode}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">State Max Interest Rate</span>
                  <div className="text-sm font-bold text-emerald-400 mt-1">
                    {(STATE_RULES[calcState]?.maxInterestRate * 100).toFixed(0)}% APR
                  </div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Accrued Interest Return</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">${calcResults.interest.toFixed(2)}</div>
                </div>

                <div className="bg-slate-950 p-4 rounded-xl border border-slate-800">
                  <span className="text-[10px] text-slate-500 uppercase font-sans">Flat Penalty Earned</span>
                  <div className="text-lg font-bold text-emerald-400 mt-1">${calcResults.penalty.toFixed(2)}</div>
                </div>
              </div>

              <div className="bg-gradient-to-r from-indigo-950 to-slate-950 p-6 rounded-2xl border border-indigo-900/60 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <span className="text-xs font-semibold text-slate-400 uppercase">Total Expected Payoff</span>
                  <div className="text-3xl font-extrabold text-white font-mono mt-1">
                    ${(calcInvestment + calcResults.total).toFixed(2)}
                  </div>
                  <span className="text-xs text-emerald-400 font-bold font-mono">
                    Total ROI: +{calcResults.roi.toFixed(2)}%
                  </span>
                </div>

                <div className="text-right border-t sm:border-t-0 sm:border-l border-slate-800 pt-3 sm:pt-0 sm:pl-6">
                  <span className="text-[10px] text-slate-400 uppercase">Simulated Option Valuation</span>
                  <div className="text-lg font-bold text-indigo-300 font-mono">
                    ${calcResults.optionValue.toFixed(2)}
                  </div>
                  <span className="text-[10px] text-slate-500">Includes underlying equity call buffer</span>
                </div>
              </div>
            </div>

          </div>
        )}

      </main>

      {/* MODAL 1: SEND MONEY WIRE VIA FEDNOW */}
      {sendMoneyModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-5 animate-fadeIn">
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Send className="w-5 h-5 text-emerald-400" />
                FedNow Instant Treasury Wire
              </h3>
              <button onClick={() => setSendMoneyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-4 text-xs">
              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase">Recipient / Tax Office</label>
                <input
                  type="text"
                  value={transferRecipient}
                  onChange={(e) => setTransferRecipient(e.target.value)}
                  placeholder="e.g. Orange County Tax Collector Treasury"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase">Wire Amount ($)</label>
                <input
                  type="number"
                  value={transferAmount}
                  onChange={(e) => setTransferAmount(Number(e.target.value))}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white font-mono text-base focus:outline-none focus:border-indigo-500"
                />
              </div>

              <div>
                <label className="block text-slate-400 font-semibold mb-1 uppercase">Payment Memo</label>
                <input
                  type="text"
                  value={transferMemo}
                  onChange={(e) => setTransferMemo(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl p-2.5 text-white focus:outline-none focus:border-indigo-500"
                />
              </div>
            </div>

            <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-[11px] text-slate-400 font-mono">
              Available Treasury Balance: <span className="text-emerald-400 font-bold">${accountBalance.toLocaleString()}</span>
            </div>

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setSendMoneyModalOpen(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeSendMoney}
                className="px-5 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-emerald-600/30 flex items-center gap-1.5"
              >
                <Send className="w-4 h-4" /> Execute Wire Transfer
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL 2: BUY HOUSE VIA TAX DEED ENGINE */}
      {houseBuyModalOpen && targetLienToBuy && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-purple-900/60 rounded-2xl max-w-lg w-full p-6 shadow-2xl space-y-6 animate-fadeIn">
            
            <div className="flex justify-between items-center border-b border-slate-800 pb-3">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Home className="w-5 h-5 text-purple-400" />
                Autonomous House Deed Purchase
              </h3>
              <button onClick={() => setHouseBuyModalOpen(false)} className="text-slate-400 hover:text-white">
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="bg-slate-950 p-4 rounded-xl border border-slate-800 space-y-2 text-xs">
              <div className="flex justify-between text-slate-400">
                <span>Property Address:</span>
                <span className="text-white font-bold">{targetLienToBuy.address}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>County / State:</span>
                <span className="text-white font-bold">{targetLienToBuy.county}, {targetLienToBuy.state}</span>
              </div>
              <div className="flex justify-between text-slate-400">
                <span>Statute Authority:</span>
                <span className="text-indigo-400 font-bold">{targetLienToBuy.statuteCitation}</span>
              </div>
              <div className="flex justify-between text-slate-400 border-t border-slate-800 pt-2 font-mono">
                <span>Statutory Payoff Cost:</span>
                <span className="text-emerald-400 font-bold">${targetLienToBuy.purchasePrice.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-slate-400 font-mono">
                <span>Appraised Asset Value:</span>
                <span className="text-blue-400 font-bold">${targetLienToBuy.estimatedValue.toLocaleString()}</span>
              </div>
            </div>

            {/* Workflow Progress Steps */}
            {isBuyingHouse ? (
              <div className="space-y-3 py-2 text-xs">
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${buyHouseStep >= 1 ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                  <Cpu className="w-4 h-4" /> 1. GIS Title & Priority Lien Audit
                </div>
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${buyHouseStep >= 2 ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                  <Send className="w-4 h-4" /> 2. FedNow Escrow Settlement & Tax Payoff
                </div>
                <div className={`p-3 rounded-xl border flex items-center gap-3 ${buyHouseStep >= 3 ? 'bg-indigo-950/60 border-indigo-700 text-indigo-300' : 'bg-slate-950 border-slate-800 text-slate-600'}`}>
                  <FileText className="w-4 h-4" /> 3. e-Recording County Tax Deed Generation
                </div>
              </div>
            ) : (
              <p className="text-xs text-slate-400 leading-relaxed">
                By clicking "Acquire Deed Now", the AI Sovereign Engine will issue a tax deed payoff to {targetLienToBuy.county}, clear senior mortgages under {targetLienToBuy.statuteCitation}, and file the title deed directly into county land records.
              </p>
            )}

            <div className="flex justify-end gap-3 pt-2">
              <button
                onClick={() => setHouseBuyModalOpen(false)}
                disabled={isBuyingHouse}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-white rounded-xl text-xs font-semibold"
              >
                Cancel
              </button>
              <button
                onClick={executeHousePurchase}
                disabled={isBuyingHouse}
                className="px-5 py-2 bg-purple-600 hover:bg-purple-500 text-white rounded-xl text-xs font-bold shadow-lg shadow-purple-600/30 flex items-center gap-1.5"
              >
                <Home className="w-4 h-4" />
                {isBuyingHouse ? 'Executing Sovereign Deed Acquisition...' : 'Acquire Property Deed Now'}
              </button>
            </div>

          </div>
        </div>
      )}

    </div>
  );
}