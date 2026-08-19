

// --- CONSOLIDATED FROM: ./pipelines/Pipeline26_LobbyingInfluence.tsx ---

import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  DollarSign,
  TrendingUp,
  FileText,
  AlertTriangle,
  Search,
  Filter,
  Play,
  RotateCcw,
  CheckCircle2,
  Clock,
  Layers,
  Network,
  Share2,
  ExternalLink,
  ChevronRight,
  ChevronDown,
  Building2,
  Scale,
  Zap,
  Activity,
  ArrowRight,
  Briefcase,
  Sliders,
  Sparkles,
  BarChart3,
  Flame,
  PieChart,
  UserCheck,
  Award
} from 'lucide-react';

// --- Types & Interfaces ---

export type Sector = 'Tech' | 'Healthcare' | 'Defense' | 'Energy' | 'Finance' | 'Agribusiness';

export interface LobbyistFiling {
  id: string;
  clientName: string;
  lobbyingFirm: string;
  quarter: string;
  year: number;
  amount: number;
  sector: Sector;
  targetAgencies: string[];
  targetBills: string[];
  lobbyists: { name: string; formerGovRole?: string }[];
  status: 'Audited' | 'Flagged' | 'Processed';
  influenceScore: number; // 0 - 100
}

export interface BillInfluence {
  billId: string;
  title: string;
  sponsor: string;
  sponsorParty: 'D' | 'R' | 'I';
  committee: string;
  lobbyingTotal: number;
  originalTextSummary: string;
  modifiedClauseText: string;
  similarityToLobbyistDraft: number; // Percentage
  status: 'In Committee' | 'Passed House' | 'Passed Senate' | 'Enacted' | 'Stalled';
  topBackers: { name: string; spend: number }[];
}

export interface RevolvingDoorProfile {
  id: string;
  personName: string;
  formerOffice: string;
  formerRole: string;
  departureYear: number;
  currentFirm: string;
  clientsRepresented: string[];
  coolOffCompliance: 'Compliant' | 'Review Required' | 'Violation Detected';
  riskScore: number;
}

export interface GraphNode {
  id: string;
  label: string;
  type: 'Client' | 'Firm' | 'Lawmaker' | 'Agency' | 'Bill';
  sector?: Sector;
  spend?: number;
  x: number;
  y: number;
  radius: number;
}

export interface GraphLink {
  source: string;
  target: string;
  amount?: number;
  type: 'Employs' | 'Donated' | 'Targeted' | 'Sponsored' | 'Influenced';
}

// --- Sample Seed Data ---

const SAMPLE_FILINGS: LobbyistFiling[] = [
  {
    id: 'LD-2024-8891',
    clientName: 'Apex Quantum Cloud Corp',
    lobbyingFirm: 'Capitol Hill Strategies LLC',
    quarter: 'Q3',
    year: 2024,
    amount: 1450000,
    sector: 'Tech',
    targetAgencies: ['FTC', 'DoC', 'NIST'],
    targetBills: ['HR-6029: AI Frontier Governance Act', 'S-4112: Cloud Sovereign Standards'],
    lobbyists: [
      { name: 'Arthur Vance', formerGovRole: 'Senior Counsel, House Tech Subcommittee' },
      { name: 'Elena Rostova', formerGovRole: 'Chief of Staff, Sen. Commerce Comm.' }
    ],
    status: 'Flagged',
    influenceScore: 92
  },
  {
    id: 'LD-2024-4102',
    clientName: 'BioVanguard Therapeutics',
    lobbyingFirm: 'Beltway Health Partners',
    quarter: 'Q3',
    year: 2024,
    amount: 2800000,
    sector: 'Healthcare',
    targetAgencies: ['FDA', 'HHS', 'CMS'],
    targetBills: ['HR-7401: Biosimilar Fast-Track & Patent Protection'],
    lobbyists: [
      { name: 'Marcus Sterling', formerGovRole: 'Deputy Director, FDA Policy Office' },
      { name: 'Sarah Chen' }
    ],
    status: 'Audited',
    influenceScore: 88
  },
  {
    id: 'LD-2024-3990',
    clientName: 'Titanium Defense Dynamics',
    lobbyingFirm: 'Potomac Defense Advisors',
    quarter: 'Q3',
    year: 2024,
    amount: 3200000,
    sector: 'Defense',
    targetAgencies: ['DoD', 'DARPA', 'USAF'],
    targetBills: ['S-4900: FY25 National Defense Procurement Act'],
    lobbyists: [
      { name: 'Gen. David Kingsley (Ret.)', formerGovRole: 'Under Sec. Defense for Acquisition' },
      { name: 'Harrison Price' }
    ],
    status: 'Processed',
    influenceScore: 95
  },
  {
    id: 'LD-2024-5119',
    clientName: 'CleanPeak Global Energy',
    lobbyingFirm: 'GreenStone Public Affairs',
    quarter: 'Q3',
    year: 2024,
    amount: 980000,
    sector: 'Energy',
    targetAgencies: ['DOE', 'FERC', 'EPA'],
    targetBills: ['HR-5120: Grid Interconnection Reform & Subsidies'],
    lobbyists: [
      { name: 'Claire Montgomery', formerGovRole: 'FERC Legal Counsel' }
    ],
    status: 'Processed',
    influenceScore: 74
  },
  {
    id: 'LD-2024-1184',
    clientName: 'Meridian Capital Alliance',
    lobbyingFirm: 'Vanguard Global Advocacy',
    quarter: 'Q3',
    year: 2024,
    amount: 1950000,
    sector: 'Finance',
    targetAgencies: ['SEC', 'CFTC', 'Treasury'],
    targetBills: ['S-3391: Digital Asset Market Structure Act'],
    lobbyists: [
      { name: 'Julian Walsh', formerGovRole: 'SEC Division of Trading & Markets' },
      { name: 'Nadia Thorne' }
    ],
    status: 'Flagged',
    influenceScore: 86
  }
];

const SAMPLE_BILLS: BillInfluence[] = [
  {
    billId: 'HR-6029',
    title: 'AI Frontier Safety & Commercial Compute Licensing Act',
    sponsor: 'Rep. Katherine Miller',
    sponsorParty: 'D',
    committee: 'House Committee on Science, Space, and Technology',
    lobbyingTotal: 6400000,
    originalTextSummary: 'Strict mandatory third-party evaluations for any foundation model exceeding 10^25 FLOPs prior to public deployment.',
    modifiedClauseText: 'Self-certification permitted under tiered sandbox frameworks; threshold raised to 10^27 FLOPs with compliance grace periods.',
    similarityToLobbyistDraft: 89.4,
    status: 'In Committee',
    topBackers: [
      { name: 'Apex Quantum Cloud Corp', spend: 1450000 },
      { name: 'OmniAI Group', spend: 1200000 },
      { name: 'Silicon Alliance PAC', spend: 950000 }
    ]
  },
  {
    billId: 'HR-7401',
    title: 'Biosimilar Fast-Track & Patent Protection Act',
    sponsor: 'Rep. Gregory Vance',
    sponsorParty: 'R',
    committee: 'House Energy and Commerce Committee',
    lobbyingTotal: 8900000,
    originalTextSummary: 'Immediate entry of biosimilar alternatives after 7 years of reference biological exclusivity.',
    modifiedClauseText: 'Patent dance term extensions granted for additional molecular formulation modifications, maintaining 12-year window.',
    similarityToLobbyistDraft: 94.2,
    status: 'Passed House',
    topBackers: [
      { name: 'BioVanguard Therapeutics', spend: 2800000 },
      { name: 'PharmaCore Global', spend: 2100000 },
      { name: 'LifeSciences Coalition', spend: 1500000 }
    ]
  },
  {
    billId: 'S-3391',
    title: 'Digital Asset Market Structure & Clarity Act',
    sponsor: 'Sen. Richard Albright',
    sponsorParty: 'R',
    committee: 'Senate Banking, Housing, and Urban Affairs',
    lobbyingTotal: 5100000,
    originalTextSummary: 'Dual jurisdiction requiring all algorithmic and reserve-backed tokens to undergo SEC asset registration.',
    modifiedClauseText: 'Grants primary regulatory purview to CFTC with safe harbor provisions for decentralized autonomous organizations.',
    similarityToLobbyistDraft: 82.6,
    status: 'In Committee',
    topBackers: [
      { name: 'Meridian Capital Alliance', spend: 1950000 },
      { name: 'Crypto FinTech Forum', spend: 1600000 }
    ]
  }
];

const REVOLVING_DOOR_DATA: RevolvingDoorProfile[] = [
  {
    id: 'RD-01',
    personName: 'Arthur Vance',
    formerOffice: 'House Committee on Science & Technology',
    formerRole: 'Senior Staff Director & Chief Tech Counsel',
    departureYear: 2023,
    currentFirm: 'Capitol Hill Strategies LLC',
    clientsRepresented: ['Apex Quantum Cloud Corp', 'Sovereign Data Systems'],
    coolOffCompliance: 'Review Required',
    riskScore: 91
  },
  {
    id: 'RD-02',
    personName: 'Gen. David Kingsley (Ret.)',
    formerOffice: 'Office of the Under Secretary of Defense for Acquisition',
    formerRole: 'Under Secretary of Defense',
    departureYear: 2022,
    currentFirm: 'Potomac Defense Advisors',
    clientsRepresented: ['Titanium Defense Dynamics', 'AeroSpace Next Gen'],
    coolOffCompliance: 'Compliant',
    riskScore: 78
  },
  {
    id: 'RD-03',
    personName: 'Marcus Sterling',
    formerOffice: 'Food and Drug Administration (FDA)',
    formerRole: 'Associate Commissioner for Policy',
    departureYear: 2023,
    currentFirm: 'Beltway Health Partners',
    clientsRepresented: ['BioVanguard Therapeutics', 'GenTech Biologics'],
    coolOffCompliance: 'Violation Detected',
    riskScore: 96
  },
  {
    id: 'RD-04',
    personName: 'Julian Walsh',
    formerOffice: 'Securities and Exchange Commission (SEC)',
    formerRole: 'Assistant Director, FinTech Innovation Unit',
    departureYear: 2024,
    currentFirm: 'Vanguard Global Advocacy',
    clientsRepresented: ['Meridian Capital Alliance'],
    coolOffCompliance: 'Review Required',
    riskScore: 84
  }
];

// --- Network Graph Seed Elements ---

const INITIAL_NODES: GraphNode[] = [
  { id: 'C_Apex', label: 'Apex Quantum Cloud', type: 'Client', sector: 'Tech', spend: 1450000, x: 120, y: 140, radius: 24 },
  { id: 'C_Bio', label: 'BioVanguard Ther.', type: 'Client', sector: 'Healthcare', spend: 2800000, x: 120, y: 280, radius: 28 },
  { id: 'C_Titan', label: 'Titanium Defense', type: 'Client', sector: 'Defense', spend: 3200000, x: 120, y: 420, radius: 30 },
  
  { id: 'F_CapHill', label: 'Capitol Hill Strat.', type: 'Firm', x: 340, y: 150, radius: 20 },
  { id: 'F_Beltway', label: 'Beltway Health', type: 'Firm', x: 340, y: 280, radius: 22 },
  { id: 'F_Potomac', label: 'Potomac Defense', type: 'Firm', x: 340, y: 410, radius: 22 },
  
  { id: 'L_Miller', label: 'Rep. K. Miller', type: 'Lawmaker', x: 570, y: 120, radius: 18 },
  { id: 'L_Vance', label: 'Rep. G. Vance', type: 'Lawmaker', x: 570, y: 270, radius: 18 },
  { id: 'A_FDA', label: 'FDA / HHS', type: 'Agency', x: 570, y: 380, radius: 18 },
  { id: 'A_DoD', label: 'DoD Acquisition', type: 'Agency', x: 570, y: 480, radius: 18 },

  { id: 'B_HR6029', label: 'HR-6029 (AI Act)', type: 'Bill', x: 760, y: 150, radius: 22 },
  { id: 'B_HR7401', label: 'HR-7401 (Bio Pharma)', type: 'Bill', x: 760, y: 310, radius: 24 }
];

const INITIAL_LINKS: GraphLink[] = [
  { source: 'C_Apex', target: 'F_CapHill', amount: 1450000, type: 'Employs' },
  { source: 'C_Bio', target: 'F_Beltway', amount: 2800000, type: 'Employs' },
  { source: 'C_Titan', target: 'F_Potomac', amount: 3200000, type: 'Employs' },

  { source: 'F_CapHill', target: 'L_Miller', amount: 12500, type: 'Donated' },
  { source: 'F_Beltway', target: 'L_Vance', amount: 35000, type: 'Donated' },
  { source: 'F_Beltway', target: 'A_FDA', amount: 0, type: 'Targeted' },
  { source: 'F_Potomac', target: 'A_DoD', amount: 0, type: 'Targeted' },

  { source: 'L_Miller', target: 'B_HR6029', amount: 0, type: 'Sponsored' },
  { source: 'F_CapHill', target: 'B_HR6029', amount: 0, type: 'Influenced' },
  { source: 'L_Vance', target: 'B_HR7401', amount: 0, type: 'Sponsored' },
  { source: 'F_Beltway', target: 'B_HR7401', amount: 0, type: 'Influenced' }
];

// --- Main Component ---

export default function Pipeline26_LobbyingInfluence() {
  // Pipeline Operational States
  const [pipelineState, setPipelineState] = useState<'IDLE' | 'INGESTING' | 'ANALYZING' | 'RESOLVING' | 'COMPLETED'>('IDLE');
  const [pipelineProgress, setPipelineProgress] = useState<number>(100);
  const [activeTab, setActiveTab] = useState<'network' | 'bills' | 'revolving' | 'filings' | 'diagnostics'>('network');
  
  // Filter States
  const [selectedSector, setSelectedSector] = useState<string>('ALL');
  const [minSpendThreshold, setMinSpendThreshold] = useState<number>(0);
  const [searchQuery, setSearchQuery] = useState<string>('');
  
  // Interactive Selection States
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(INITIAL_NODES[0]);
  const [selectedBill, setSelectedBill] = useState<BillInfluence | null>(SAMPLE_BILLS[0]);
  const [selectedFiling, setSelectedFiling] = useState<LobbyistFiling | null>(SAMPLE_FILINGS[0]);

  // Graph Canvas & Simulation Settings
  const [highlightRevolvingDoorOnly, setHighlightRevolvingDoorOnly] = useState<boolean>(false);
  const [graphZoom, setGraphZoom] = useState<number>(1);
  const canvasRef = useRef<HTMLDivElement>(null);

  // Pipeline Execution Simulation
  const runPipelineExecution = () => {
    setPipelineState('INGESTING');
    setPipelineProgress(15);

    setTimeout(() => {
      setPipelineState('ANALYZING');
      setPipelineProgress(52);
    }, 1100);

    setTimeout(() => {
      setPipelineState('RESOLVING');
      setPipelineProgress(84);
    }, 2200);

    setTimeout(() => {
      setPipelineState('COMPLETED');
      setPipelineProgress(100);
    }, 3200);
  };

  // Filtered filings
  const filteredFilings = useMemo(() => {
    return SAMPLE_FILINGS.filter(f => {
      const sectorMatch = selectedSector === 'ALL' || f.sector === selectedSector;
      const spendMatch = f.amount >= minSpendThreshold;
      const searchMatch = searchQuery.trim() === '' || 
        f.clientName.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.lobbyingFirm.toLowerCase().includes(searchQuery.toLowerCase()) ||
        f.targetBills.some(b => b.toLowerCase().includes(searchQuery.toLowerCase()));
      return sectorMatch && spendMatch && searchMatch;
    });
  }, [selectedSector, minSpendThreshold, searchQuery]);

  // Total Metrics Calculation
  const metrics = useMemo(() => {
    const totalSpend = SAMPLE_FILINGS.reduce((acc, curr) => acc + curr.amount, 0);
    const avgSimilarity = (SAMPLE_BILLS.reduce((acc, curr) => acc + curr.similarityToLobbyistDraft, 0) / SAMPLE_BILLS.length).toFixed(1);
    const revolvingCount = REVOLVING_DOOR_DATA.length;
    const flaggedItems = SAMPLE_FILINGS.filter(f => f.status === 'Flagged').length + 
      REVOLVING_DOOR_DATA.filter(r => r.coolOffCompliance !== 'Compliant').length;

    return { totalSpend, avgSimilarity, revolvingCount, flaggedItems };
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-slate-950 text-slate-100 font-sans selection:bg-amber-500/30">
      
      {/* --- Top Header & Pipeline Control Strip --- */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30 px-6 py-4">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-xl bg-gradient-to-tr from-amber-600/30 to-amber-500/10 border border-amber-500/30 text-amber-400 shadow-lg shadow-amber-950/40">
              <Scale className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl font-bold tracking-tight text-white">
                  Pipeline #26: Lobbying & Legislative Influence Engine
                </h1>
                <span className="px-2 py-0.5 text-xs font-semibold rounded-full bg-amber-500/10 text-amber-400 border border-amber-500/20">
                  v3.4 Production
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Continuous LD-2 / FEC Ingestion • Semantic Clause Matching • Shadow Network Extraction
              </p>
            </div>
          </div>

          {/* Action Trigger & Execution Status */}
          <div className="flex items-center gap-4">
            <div className="hidden lg:flex flex-col items-end">
              <div className="flex items-center gap-2">
                <span className="inline-block w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
                <span className="text-xs font-medium text-slate-300">
                  Status: {pipelineState === 'IDLE' ? 'System Ready' : pipelineState}
                </span>
              </div>
              <span className="text-[11px] text-slate-500 font-mono">Last Sync: 4 mins ago (SOPR feed)</span>
            </div>

            <button
              onClick={runPipelineExecution}
              disabled={pipelineState !== 'IDLE' && pipelineState !== 'COMPLETED'}
              className="flex items-center gap-2 px-4 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-slate-950 font-semibold text-sm rounded-lg shadow-md shadow-amber-900/30 disabled:opacity-50 transition-all cursor-pointer active:scale-95"
            >
              {pipelineState === 'IDLE' || pipelineState === 'COMPLETED' ? (
                <>
                  <Play className="w-4 h-4 fill-current" /> Run Influence Synthesis
                </>
              ) : (
                <>
                  <RotateCcw className="w-4 h-4 animate-spin" /> Processing Stage...
                </>
              )}
            </button>
          </div>
        </div>

        {/* Progress Bar (Visible during execution) */}
        {pipelineState !== 'IDLE' && (
          <div className="mt-3 w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-amber-500 to-emerald-400 transition-all duration-500 ease-out"
              style={{ width: `${pipelineProgress}%` }}
            />
          </div>
        )}
      </header>

      {/* --- Main Dashboard Body --- */}
      <div className="flex-1 flex flex-col p-6 space-y-6 max-w-[1600px] w-full mx-auto">
        
        {/* Top Summary Cards */}
        <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>ACTIVE DISCLOSURE VOLUME</span>
              <DollarSign className="w-4 h-4 text-emerald-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              ${(metrics.totalSpend / 1000000).toFixed(2)}M
            </div>
            <div className="mt-2 text-[11px] text-emerald-400 flex items-center gap-1 font-medium">
              <TrendingUp className="w-3.5 h-3.5" /> +18.4% compared to prior congress cycle
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>AVG. CLAUSE SYNGRUENCE</span>
              <Sparkles className="w-4 h-4 text-amber-400" />
            </div>
            <div className="text-2xl font-bold text-amber-400 tracking-tight">
              {metrics.avgSimilarity}%
            </div>
            <div className="mt-2 text-[11px] text-slate-400 flex items-center gap-1">
              <span>Semantic match with lobby draft texts</span>
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>REVOLVING DOOR OPERATIVES</span>
              <UserCheck className="w-4 h-4 text-cyan-400" />
            </div>
            <div className="text-2xl font-bold text-white tracking-tight">
              {metrics.revolvingCount} Registered
            </div>
            <div className="mt-2 text-[11px] text-cyan-400 flex items-center gap-1 font-medium">
              <Award className="w-3.5 h-3.5" /> Former Senate/Agency high officials
            </div>
          </div>

          <div className="p-4 rounded-xl bg-slate-900/60 border border-slate-800 hover:border-slate-700 transition">
            <div className="flex items-center justify-between text-slate-400 text-xs font-medium mb-2">
              <span>RISK & VIOLATION ALERTS</span>
              <AlertTriangle className="w-4 h-4 text-rose-400" />
            </div>
            <div className="text-2xl font-bold text-rose-400 tracking-tight">
              {metrics.flaggedItems} Items Flagged
            </div>
            <div className="mt-2 text-[11px] text-rose-400/80 flex items-center gap-1 font-mono">
              Cooling-off & Undisclosed Meeting flags
            </div>
          </div>
        </section>

        {/* --- Primary Workspace Tabs & Filter Bar --- */}
        <section className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden shadow-xl">
          <div className="flex flex-wrap items-center justify-between border-b border-slate-800 bg-slate-900/90 px-4 py-3 gap-4">
            
            {/* Tabs */}
            <div className="flex items-center gap-1 bg-slate-950/60 p-1 rounded-lg border border-slate-800">
              <button
                onClick={() => setActiveTab('network')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'network'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Network className="w-3.5 h-3.5" /> Influence Graph
              </button>

              <button
                onClick={() => setActiveTab('bills')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'bills'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Scale className="w-3.5 h-3.5" /> Bill Clause Diff
              </button>

              <button
                onClick={() => setActiveTab('revolving')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'revolving'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Briefcase className="w-3.5 h-3.5" /> Revolving Door Registry
              </button>

              <button
                onClick={() => setActiveTab('filings')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'filings'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <FileText className="w-3.5 h-3.5" /> LD-2 Ingestion Feed
              </button>

              <button
                onClick={() => setActiveTab('diagnostics')}
                className={`flex items-center gap-2 px-3 py-1.5 rounded-md text-xs font-medium transition ${
                  activeTab === 'diagnostics'
                    ? 'bg-amber-500/20 text-amber-300 border border-amber-500/30'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Activity className="w-3.5 h-3.5" /> Pipeline Telemetry
              </button>
            </div>

            {/* Quick Global Filters */}
            <div className="flex flex-wrap items-center gap-3">
              {/* Sector Dropdown */}
              <div className="flex items-center gap-1.5 text-xs text-slate-400">
                <Filter className="w-3.5 h-3.5 text-slate-500" />
                <select
                  value={selectedSector}
                  onChange={(e) => setSelectedSector(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 rounded-md px-2.5 py-1 text-xs focus:outline-none focus:border-amber-500"
                >
                  <option value="ALL">All Sectors</option>
                  <option value="Tech">Tech / AI</option>
                  <option value="Healthcare">Healthcare / Pharma</option>
                  <option value="Defense">Defense / Aerospace</option>
                  <option value="Energy">Energy / Utilities</option>
                  <option value="Finance">Finance / Fintech</option>
                </select>
              </div>

              {/* Search Bar */}
              <div className="relative">
                <Search className="w-3.5 h-3.5 absolute left-2.5 top-1/2 -translate-y-1/2 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search firms, bills, agents..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 text-slate-200 pl-8 pr-3 py-1 rounded-md text-xs placeholder:text-slate-600 focus:outline-none focus:border-amber-500 w-44 md:w-56"
                />
              </div>
            </div>
          </div>

          {/* TAB 1: INFLUENCE NETWORK GRAPH VIEW */}
          {activeTab === 'network' && (
            <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[580px]">
              {/* SVG / Visual Graph Area */}
              <div className="lg:col-span-8 p-4 bg-slate-950/80 relative flex flex-col items-center justify-center overflow-hidden border-b lg:border-b-0 lg:border-r border-slate-800">
                {/* Visualizer Header Controls */}
                <div className="absolute top-4 left-4 z-10 flex items-center gap-2">
                  <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 bg-slate-900/90 px-2.5 py-1 rounded border border-slate-800">
                    Topology: Multi-Echelon Influence Path
                  </span>
                  <button
                    onClick={() => setHighlightRevolvingDoorOnly(!highlightRevolvingDoorOnly)}
                    className={`text-xs px-2.5 py-1 rounded border transition ${
                      highlightRevolvingDoorOnly
                        ? 'bg-rose-500/20 text-rose-300 border-rose-500/40'
                        : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                    }`}
                  >
                    {highlightRevolvingDoorOnly ? '★ Revolving Door Highlighted' : 'Filter Revolving Nodes'}
                  </button>
                </div>

                <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                  <button
                    onClick={() => setGraphZoom(prev => Math.max(0.8, prev - 0.1))}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs px-2"
                  >
                    -
                  </button>
                  <span className="text-[11px] font-mono text-slate-400">{Math.round(graphZoom * 100)}%</span>
                  <button
                    onClick={() => setGraphZoom(prev => Math.min(1.4, prev + 0.1))}
                    className="p-1 rounded bg-slate-900 border border-slate-800 text-slate-400 hover:text-white text-xs px-2"
                  >
                    +
                  </button>
                </div>

                {/* SVG Graph Visualization */}
                <div className="w-full h-full min-h-[480px] flex items-center justify-center relative select-none">
                  <svg
                    className="w-full h-full max-w-[850px] max-h-[500px] transition-transform duration-200"
                    viewBox="0 0 850 550"
                    style={{ transform: `scale(${graphZoom})` }}
                  >
                    <defs>
                      <linearGradient id="linkGrad" x1="0%" y1="0%" x2="100%" y2="0%">
                        <stop offset="0%" stopColor="#f59e0b" stopOpacity="0.6" />
                        <stop offset="100%" stopColor="#38bdf8" stopOpacity="0.8" />
                      </linearGradient>
                      <marker
                        id="arrow"
                        viewBox="0 0 10 10"
                        refX="16"
                        refY="5"
                        markerWidth="6"
                        markerHeight="6"
                        orient="auto-start-reverse"
                      >
                        <path d="M 0 0 L 10 5 L 0 10 z" fill="#64748b" />
                      </marker>
                    </defs>

                    {/* Render Links */}
                    {INITIAL_LINKS.map((link, idx) => {
                      const src = INITIAL_NODES.find(n => n.id === link.source);
                      const dst = INITIAL_NODES.find(n => n.id === link.target);
                      if (!src || !dst) return null;
                      return (
                        <g key={`link-${idx}`} className="group">
                          <line
                            x1={src.x}
                            y1={src.y}
                            x2={dst.x}
                            y2={dst.y}
                            stroke={link.type === 'Donated' ? '#10b981' : link.type === 'Influenced' ? '#f59e0b' : '#334155'}
                            strokeWidth={link.amount && link.amount > 1000000 ? '2.5' : '1.5'}
                            strokeDasharray={link.type === 'Targeted' ? '4,4' : undefined}
                            markerEnd="url(#arrow)"
                            className="transition-all duration-300 group-hover:stroke-amber-400"
                          />
                          {link.amount && link.amount > 0 && (
                            <text
                              x={(src.x + dst.x) / 2}
                              y={(src.y + dst.y) / 2 - 4}
                              fill="#94a3b8"
                              fontSize="9"
                              fontFamily="monospace"
                              textAnchor="middle"
                            >
                              ${(link.amount / 1000).toFixed(0)}k
                            </text>
                          )}
                        </g>
                      );
                    })}

                    {/* Render Nodes */}
                    {INITIAL_NODES.map((node) => {
                      const isSelected = selectedNode?.id === node.id;
                      let fillColor = '#1e293b';
                      let strokeColor = '#475569';

                      if (node.type === 'Client') {
                        fillColor = '#172554';
                        strokeColor = '#3b82f6';
                      } else if (node.type === 'Firm') {
                        fillColor = '#451a03';
                        strokeColor = '#f59e0b';
                      } else if (node.type === 'Lawmaker') {
                        fillColor = '#064e3b';
                        strokeColor = '#10b981';
                      } else if (node.type === 'Bill') {
                        fillColor = '#4c0519';
                        strokeColor = '#f43f5e';
                      } else if (node.type === 'Agency') {
                        fillColor = '#3b0764';
                        strokeColor = '#a855f7';
                      }

                      return (
                        <g
                          key={node.id}
                          className="cursor-pointer transition-transform hover:scale-110"
                          onClick={() => setSelectedNode(node)}
                        >
                          <circle
                            cx={node.x}
                            cy={node.y}
                            r={node.radius}
                            fill={fillColor}
                            stroke={isSelected ? '#fbbf24' : strokeColor}
                            strokeWidth={isSelected ? 3 : 1.5}
                            className="transition-all drop-shadow"
                          />
                          <text
                            x={node.x}
                            y={node.y + 4}
                            textAnchor="middle"
                            fill="#f8fafc"
                            fontSize="10"
                            fontWeight={isSelected ? 'bold' : 'normal'}
                            pointerEvents="none"
                          >
                            {node.label.length > 14 ? `${node.label.substring(0, 12)}..` : node.label}
                          </text>
                          <text
                            x={node.x}
                            y={node.y + node.radius + 12}
                            textAnchor="middle"
                            fill="#64748b"
                            fontSize="8"
                            fontFamily="monospace"
                            pointerEvents="none"
                          >
                            [{node.type}]
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>

                {/* Graph Legend */}
                <div className="w-full flex flex-wrap items-center justify-between gap-4 mt-2 pt-3 border-t border-slate-900 text-[11px] text-slate-400">
                  <div className="flex items-center gap-3">
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-blue-600 inline-block"/> Client Entity</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-amber-600 inline-block"/> Lobbying Firm</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-emerald-600 inline-block"/> Lawmaker / PAC</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-purple-600 inline-block"/> Regulatory Agency</span>
                    <span className="flex items-center gap-1"><span className="w-2.5 h-2.5 rounded-full bg-rose-600 inline-block"/> Target Bill</span>
                  </div>
                  <span className="font-mono text-slate-500">Nodes clickable for forensic dossier</span>
                </div>
              </div>

              {/* Node Inspector Sidebar */}
              <div className="lg:col-span-4 p-5 bg-slate-900/60 flex flex-col justify-between">
                {selectedNode ? (
                  <div className="space-y-4">
                    <div className="border-b border-slate-800 pb-3">
                      <div className="flex items-center justify-between mb-1">
                        <span className="text-[10px] font-mono uppercase text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {selectedNode.type} Entity Node
                        </span>
                        <span className="text-xs font-mono text-slate-400">ID: {selectedNode.id}</span>
                      </div>
                      <h3 className="text-lg font-bold text-white mt-1">{selectedNode.label}</h3>
                      {selectedNode.sector && (
                        <p className="text-xs text-slate-400">Sector: <span className="text-slate-200 font-medium">{selectedNode.sector}</span></p>
                      )}
                    </div>

                    <div className="space-y-3 text-xs">
                      {selectedNode.spend && (
                        <div className="bg-slate-950 p-3 rounded-lg border border-slate-800 flex justify-between items-center">
                          <span className="text-slate-400">Total Tracked Outlay</span>
                          <span className="text-emerald-400 font-mono font-bold text-sm">
                            ${selectedNode.spend.toLocaleString()}
                          </span>
                        </div>
                      )}

                      <div className="p-3 bg-slate-950 rounded-lg border border-slate-800 space-y-2">
                        <span className="font-semibold text-slate-300 flex items-center gap-1.5">
                          <Activity className="w-3.5 h-3.5 text-amber-400" /> Echelon Path Correlations
                        </span>
                        <div className="text-slate-400 text-[11px] leading-relaxed">
                          Connected to <strong>3 downstream committee markups</strong> and <strong>2 revolving door operatives</strong> with active clearance.
                        </div>
                      </div>

                      <div>
                        <span className="text-[11px] uppercase font-semibold text-slate-400 block mb-1.5">
                          Targeted Legislative Initiatives
                        </span>
                        <div className="space-y-1.5">
                          <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] flex justify-between">
                            <span className="text-slate-300">HR-6029 AI Frontier Safety</span>
                            <span className="text-amber-400 font-semibold">92% Match</span>
                          </div>
                          <div className="p-2 rounded bg-slate-950/70 border border-slate-800 text-[11px] flex justify-between">
                            <span className="text-slate-300">S-4112 Sovereign Cloud Stds</span>
                            <span className="text-emerald-400 font-semibold">74% Match</span>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-center py-16 text-slate-500 text-sm">
                    Select any node from the influence topology map to view full dossier.
                  </div>
                )}

                <div className="pt-4 border-t border-slate-800 mt-4">
                  <button
                    onClick={() => setActiveTab('bills')}
                    className="w-full flex items-center justify-center gap-2 py-2 bg-slate-800 hover:bg-slate-700 text-xs font-semibold rounded-lg text-slate-200 transition"
                  >
                    Inspect Bill Modifications <ChevronRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: BILL CLAUSE DIFF & SEMANTIC MATCHING */}
          {activeTab === 'bills' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Scale className="w-5 h-5 text-amber-400" /> Legislative Semantic Diff Engine
                  </h3>
                  <p className="text-xs text-slate-400">
                    Comparing statutory language as introduced against lobbyist position papers and markups.
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <span className="text-xs text-slate-400">Select Bill:</span>
                  <select
                    className="bg-slate-950 border border-slate-800 text-slate-200 text-xs rounded px-2 py-1.5 focus:border-amber-500"
                    onChange={(e) => {
                      const b = SAMPLE_BILLS.find(x => x.billId === e.target.value);
                      if (b) setSelectedBill(b);
                    }}
                    value={selectedBill?.billId}
                  >
                    {SAMPLE_BILLS.map(b => (
                      <option key={b.billId} value={b.billId}>
                        {b.billId}: {b.title.substring(0, 30)}...
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              {selectedBill && (
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                  {/* Bill Details & Metadata */}
                  <div className="lg:col-span-4 space-y-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-3">
                      <div className="flex justify-between items-start">
                        <span className="text-xs font-mono font-bold text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
                          {selectedBill.billId}
                        </span>
                        <span className="text-xs px-2 py-0.5 rounded bg-blue-500/10 text-blue-400 border border-blue-500/20">
                          {selectedBill.status}
                        </span>
                      </div>

                      <h4 className="text-sm font-semibold text-white">{selectedBill.title}</h4>
                      
                      <div className="text-xs text-slate-400 space-y-1">
                        <div>Sponsor: <span className="text-slate-200 font-medium">{selectedBill.sponsor} ({selectedBill.sponsorParty})</span></div>
                        <div>Committee: <span className="text-slate-200 font-medium">{selectedBill.committee}</span></div>
                        <div>Total Lobby Spend Attributed: <span className="text-emerald-400 font-mono font-bold">${(selectedBill.lobbyingTotal / 1000000).toFixed(2)}M</span></div>
                      </div>
                    </div>

                    {/* Top Spend Backers */}
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <h5 className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-3">
                        Primary Corporate Backers
                      </h5>
                      <div className="space-y-2">
                        {selectedBill.topBackers.map((backer, idx) => (
                          <div key={idx} className="flex items-center justify-between text-xs p-2 rounded bg-slate-900 border border-slate-800">
                            <span className="text-slate-300">{backer.name}</span>
                            <span className="text-emerald-400 font-mono font-semibold">${(backer.spend / 1000000).toFixed(2)}M</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Visual Clause Diff Viewer */}
                  <div className="lg:col-span-8 space-y-4">
                    <div className="p-4 bg-slate-950 rounded-xl border border-slate-800">
                      <div className="flex items-center justify-between mb-4">
                        <span className="text-xs font-semibold text-slate-300 flex items-center gap-2">
                          <Sparkles className="w-4 h-4 text-amber-400" /> Clause Shift & Semantic Congruence
                        </span>
                        <div className="flex items-center gap-1.5">
                          <span className="text-xs text-slate-400">Match Confidence:</span>
                          <span className="text-xs font-bold text-amber-400 font-mono bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/30">
                            {selectedBill.similarityToLobbyistDraft}%
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Original Proposed Text */}
                        <div className="p-3 bg-rose-950/20 border border-rose-900/40 rounded-lg space-y-2">
                          <div className="text-[11px] font-mono text-rose-400 font-bold uppercase flex items-center gap-1">
                            <span>- Original Introduced Clause</span>
                          </div>
                          <p className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded border border-rose-950">
                            "{selectedBill.originalTextSummary}"
                          </p>
                        </div>

                        {/* Amended Clause After Lobbying */}
                        <div className="p-3 bg-emerald-950/20 border border-emerald-900/40 rounded-lg space-y-2">
                          <div className="text-[11px] font-mono text-emerald-400 font-bold uppercase flex items-center gap-1">
                            <span>+ Adopted Committee Amendment</span>
                          </div>
                          <p className="text-xs text-slate-200 font-mono leading-relaxed bg-slate-950/60 p-2.5 rounded border border-emerald-950">
                            "{selectedBill.modifiedClauseText}"
                          </p>
                        </div>
                      </div>

                      <div className="mt-4 p-3 bg-slate-900 rounded-lg border border-slate-800 text-xs text-slate-400 flex items-start gap-2">
                        <AlertTriangle className="w-4 h-4 text-amber-400 flex-shrink-0 mt-0.5" />
                        <div>
                          <strong className="text-slate-200">AI Model Assessment:</strong> The amended statutory language removes mandatory pre-clearance liability and aligns word-for-word with white papers submitted during Q2 committee consultations by corporate PAC representatives.
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 3: REVOLVING DOOR REGISTRY */}
          {activeTab === 'revolving' && (
            <div className="p-6 space-y-6">
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-4">
                <div>
                  <h3 className="text-base font-bold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-amber-400" /> Former Government Officials in Private Practice
                  </h3>
                  <p className="text-xs text-slate-400">
                    Automated cross-referencing between congressional staff rosters, agency appointment books, and Form LD-2 registrations.
                  </p>
                </div>

                <div className="text-xs font-mono text-slate-400 bg-slate-950 px-3 py-1.5 rounded border border-slate-800">
                  Cooling-off Period Rule: 18 U.S.C. § 207
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-2 gap-4">
                {REVOLVING_DOOR_DATA.map((person) => {
                  const isViolation = person.coolOffCompliance === 'Violation Detected';
                  const isReview = person.coolOffCompliance === 'Review Required';

                  return (
                    <div
                      key={person.id}
                      className={`p-4 rounded-xl border bg-slate-950 transition-all ${
                        isViolation
                          ? 'border-rose-800/80 hover:border-rose-600'
                          : isReview
                          ? 'border-amber-800/80 hover:border-amber-600'
                          : 'border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div>
                          <h4 className="text-base font-bold text-white">{person.personName}</h4>
                          <p className="text-xs text-slate-400 font-medium mt-0.5">
                            Now at: <span className="text-amber-400 font-semibold">{person.currentFirm}</span>
                          </p>
                        </div>

                        <span
                          className={`text-[11px] font-semibold px-2.5 py-0.5 rounded-full border ${
                            isViolation
                              ? 'bg-rose-500/10 text-rose-400 border-rose-500/30 animate-pulse'
                              : isReview
                              ? 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                              : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                          }`}
                        >
                          {person.coolOffCompliance}
                        </span>
                      </div>

                      <div className="mt-3 p-2.5 rounded-lg bg-slate-900/80 border border-slate-800/80 space-y-1 text-xs">
                        <div className="text-slate-400">
                          Former Role: <span className="text-slate-200">{person.formerRole}</span>
                        </div>
                        <div className="text-slate-400">
                          Department: <span className="text-slate-200">{person.formerOffice}</span>
                        </div>
                        <div className="text-slate-400">
                          Departure Year: <span className="text-slate-200 font-mono">{person.departureYear}</span>
                        </div>
                      </div>

                      <div className="mt-3">
                        <span className="text-[11px] font-semibold uppercase text-slate-500 tracking-wider block mb-1">
                          Current Clients Represented
                        </span>
                        <div className="flex flex-wrap gap-1.5">
                          {person.clientsRepresented.map((client, i) => (
                            <span key={i} className="text-[11px] bg-slate-900 text-slate-300 px-2 py-0.5 rounded border border-slate-800">
                              {client}
                            </span>
                          ))}
                        </div>
                      </div>

                      <div className="mt-3 pt-3 border-t border-slate-900 flex items-center justify-between text-xs">
                        <span className="text-slate-500">Influence Risk Index</span>
                        <span className="font-mono font-bold text-rose-400">{person.riskScore}/100</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 4: LD-2 INGESTION FEED */}
          {activeTab === 'filings' && (
            <div className="p-6 space-y-4">
              <div className="flex items-center justify-between border-b border-slate-800 pb-3">
                <h3 className="text-base font-bold text-white flex items-center gap-2">
                  <FileText className="w-5 h-5 text-amber-400" /> Disclosed Lobbying Reports (Form LD-2 / FEC Ingestion)
                </h3>
                <span className="text-xs text-slate-400 font-mono">
                  Showing {filteredFilings.length} matching disclosures
                </span>
              </div>

              <div className="overflow-x-auto rounded-lg border border-slate-800">
                <table className="w-full text-left text-xs text-slate-300">
                  <thead className="bg-slate-950 text-slate-400 uppercase font-mono text-[10px] border-b border-slate-800">
                    <tr>
                      <th className="px-4 py-3">Filing ID</th>
                      <th className="px-4 py-3">Client Entity</th>
                      <th className="px-4 py-3">Lobbying Firm</th>
                      <th className="px-4 py-3">Sector</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Targeted Bills</th>
                      <th className="px-4 py-3">Score</th>
                      <th className="px-4 py-3 text-right">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 bg-slate-900/40">
                    {filteredFilings.map((filing) => (
                      <tr key={filing.id} className="hover:bg-slate-800/40 transition cursor-pointer" onClick={() => setSelectedFiling(filing)}>
                        <td className="px-4 py-3 font-mono text-amber-400 font-semibold">{filing.id}</td>
                        <td className="px-4 py-3 font-medium text-white">{filing.clientName}</td>
                        <td className="px-4 py-3 text-slate-300">{filing.lobbyingFirm}</td>
                        <td className="px-4 py-3">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-slate-800 text-slate-300">
                            {filing.sector}
                          </span>
                        </td>
                        <td className="px-4 py-3 font-mono font-semibold text-emerald-400">
                          ${filing.amount.toLocaleString()}
                        </td>
                        <td className="px-4 py-3 max-w-[200px] truncate text-slate-400">
                          {filing.targetBills.join(', ')}
                        </td>
                        <td className="px-4 py-3 font-mono font-bold text-amber-400">
                          {filing.influenceScore}
                        </td>
                        <td className="px-4 py-3 text-right">
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold ${
                            filing.status === 'Flagged'
                              ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                              : 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          }`}>
                            {filing.status}
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 5: PIPELINE TELEMETRY & DIAGNOSTICS */}
          {activeTab === 'diagnostics' && (
            <div className="p-6 space-y-6">
              <h3 className="text-base font-bold text-white flex items-center gap-2 border-b border-slate-800 pb-3">
                <Activity className="w-5 h-5 text-amber-400" /> Ingestion & Analysis Engine Pipeline Stages
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
                {[
                  { stage: '1. Ingestion Feed', source: 'Senate SOPR & FEC XML API', status: 'Healthy', latency: '340ms' },
                  { stage: '2. Entity Disambiguation', source: 'NER & PAC Alias Linking', status: 'Healthy', latency: '820ms' },
                  { stage: '3. Revolving Door Scan', source: 'Gov Directory 18 USC §207', status: 'Healthy', latency: '410ms' },
                  { stage: '4. Clause Semantic Match', source: 'Transformer Vector Diff', status: 'Healthy', latency: '1240ms' },
                  { stage: '5. Influence Graph Synthesis', source: 'GraphDB Neo4j Cluster', status: 'Synchronized', latency: '190ms' }
                ].map((st, i) => (
                  <div key={i} className="p-4 bg-slate-950 rounded-xl border border-slate-800 space-y-2">
                    <span className="text-[10px] font-mono uppercase text-slate-500">Stage 0{i + 1}</span>
                    <h4 className="text-xs font-bold text-white">{st.stage}</h4>
                    <p className="text-[11px] text-slate-400">{st.source}</p>
                    <div className="pt-2 border-t border-slate-900 flex justify-between items-center text-[10px] font-mono">
                      <span className="text-emerald-400 flex items-center gap-1">
                        <CheckCircle2 className="w-3 h-3" /> {st.status}
                      </span>
                      <span className="text-slate-500">{st.latency}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="p-4 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-slate-400 space-y-2">
                <div className="text-slate-200 font-bold uppercase tracking-wider text-[11px]">
                  Real-time Pipeline Log Stream
                </div>
                <div className="h-36 overflow-y-auto space-y-1 select-text bg-slate-900/60 p-3 rounded border border-slate-800">
                  <div>[2025-02-24T18:42:01Z] [INGEST] Parsed 420 LD-2 quarterly reports from Senate Office of Public Records.</div>
                  <div>[2025-02-24T18:42:03Z] [ENTITY_RESOLVER] Resolved 14 new shell LLCs to parent defense contractors.</div>
                  <div>[2025-02-24T18:42:05Z] [NLP_DIFF] Discovered 89.4% verbatim match on HR-6029 Section 4(c) with Tech PAC draft.</div>
                  <div>[2025-02-24T18:42:07Z] [REVOLVING] Flagged Arthur Vance (Former Senior Counsel) lobbying former committee colleagues within 14-month window.</div>
                  <div className="text-emerald-400">[2025-02-24T18:42:09Z] [GRAPH_INDEX] Topology cache updated with 120 nodes and 340 influence edges.</div>
                </div>
              </div>
            </div>
          )}
        </section>
      </div>

      {/* --- Footer Status Bar --- */}
      <footer className="border-t border-slate-800 bg-slate-950 px-6 py-3 text-xs text-slate-500 flex flex-wrap items-center justify-between gap-4 mt-auto">
        <div className="flex items-center gap-3">
          <span className="flex items-center gap-1.5 text-slate-400">
            <span className="w-2 h-2 rounded-full bg-emerald-500" /> Continuous Monitoring Active
          </span>
          <span className="hidden sm:inline text-slate-700">•</span>
          <span className="hidden sm:inline">Senate Office of Public Records (SOPR) + FEC Direct Stream</span>
        </div>
        <div className="flex items-center gap-4 font-mono text-[11px]">
          <span>Influence Graph Engine v3.4.1</span>
          <span>Pipeline #26 / 50</span>
        </div>
      </footer>
    </div>
  );
}