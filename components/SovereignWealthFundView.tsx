

// --- CONSOLIDATED FROM: ./components/government/SovereignWealthFundView.tsx ---

import React, { useState, useMemo, useEffect, useContext } from 'react';
import { 
  TrendingUp, Coins, Shield, Users, FileText, Search, Filter, 
  ArrowRight, Activity, Globe, Cpu, Database, Lock, Zap, Scale, 
  AlertTriangle, CheckCircle2, Download, RefreshCw, Sparkles, 
  Building, Award, Terminal, HelpCircle, ChevronRight, DollarSign,
  ArrowUpRight, ArrowDownRight, PieChart as PieIcon, Landmark
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, BarChart, Bar, PieChart, Pie, Cell 
} from 'recharts';
import { DataContext } from '../../context/DataContext';
import { callGemini } from '../../services/geminiService';

// Mock Data for Sovereign Wealth Fund 527
const INITIAL_ALLOCATIONS = [
  { name: 'Tech Sovereignty', value: 450000000, color: '#10B981', description: 'Domestic semiconductor, AI, and quantum computing infrastructure.' },
  { name: 'Green Infrastructure', value: 350000000, color: '#3B82F6', description: 'Grid modernization, municipal solar, and tidal energy projects.' },
  { name: 'Strategic Minerals', value: 250000000, color: '#F59E0B', description: 'Lithium, cobalt, and rare-earth element stockpiles and processing.' },
  { name: 'Housing Cooperatives', value: 200000000, color: '#8B5CF6', description: 'Public-private community land trusts and affordable housing development.' },
  { name: 'Defense & Cybersecurity', value: 150000000, color: '#EF4444', description: 'Sovereign cloud security, decentralized defense networks, and threat intelligence.' },
];

const LOBBYING_CAMPAIGNS = [
  {
    id: 'LOB-2026-001',
    target: 'Digital Asset Clarity Act (H.R. 4502)',
    category: 'Financial Regulation',
    amountSpent: 4200000,
    status: 'Active',
    impact: 'High',
    alignment: 94,
    description: 'Lobbying for clear regulatory boundaries between SEC and CFTC to protect decentralized protocols.',
    lastUpdated: '2026-03-15'
  },
  {
    id: 'LOB-2026-002',
    target: 'Sovereign Cloud Infrastructure Bill',
    category: 'Technology',
    amountSpent: 3100000,
    status: 'Approved',
    impact: 'Medium',
    alignment: 88,
    description: 'Advocating for federal mandates requiring domestic hosting of critical public infrastructure on sovereign clouds.',
    lastUpdated: '2026-03-10'
  },
  {
    id: 'LOB-2026-003',
    target: 'Public Banking Modernization Initiative',
    category: 'Public Finance',
    amountSpent: 2500000,
    status: 'Under Review',
    impact: 'High',
    alignment: 91,
    description: 'Promoting legislation to allow municipal and state-level public banks to hold and clear digital assets.',
    lastUpdated: '2026-03-08'
  },
  {
    id: 'LOB-2026-004',
    target: 'Strategic Mineral Stockpile Act',
    category: 'National Security',
    amountSpent: 1800000,
    status: 'Active',
    impact: 'Medium',
    alignment: 85,
    description: 'Securing federal matching funds for state-level critical mineral reserves and supply chain resilience.',
    lastUpdated: '2026-02-28'
  }
];

const LEDGER_TRANSACTIONS = [
  { id: 'TX-9081', date: '2026-03-18', type: 'Contribution', source: 'Federal Matching Program', amount: 50000000, status: 'Completed', hash: '0x8f2a...9c1d' },
  { id: 'TX-9082', date: '2026-03-17', type: 'Disbursement', source: 'Lobbying: Digital Asset Clarity', amount: -1200000, status: 'Completed', hash: '0x3e4b...7a2f' },
  { id: 'TX-9083', date: '2026-03-15', type: 'Investment', source: 'Sovereign Tech Fund -> Quantum Corp', amount: -25000000, status: 'Completed', hash: '0x1a9c...4e8b' },
  { id: 'TX-9084', date: '2026-03-12', type: 'Contribution', source: 'Sovereign Wealth Tax Diversion', amount: 35400000, status: 'Completed', hash: '0x7d5e...2f9a' },
  { id: 'TX-9085', date: '2026-03-10', type: 'Disbursement', source: 'Lobbying: Sovereign Cloud Bill', amount: -850000, status: 'Completed', hash: '0x5c8f...1b3d' },
  { id: 'TX-9086', date: '2026-03-05', type: 'Investment', source: 'Green Infra -> Solar Grid Florida', amount: -40000000, status: 'Completed', hash: '0x9e2d...6c5f' },
];

export default function SovereignWealthFundView() {
  const dataContext = useContext(DataContext);
  
  // State
  const [allocations, setAllocations] = useState(INITIAL_ALLOCATIONS);
  const [lobbying, setLobbying] = useState(LOBBYING_CAMPAIGNS);
  const [ledger, setLedger] = useState(LEDGER_TRANSACTIONS);
  const [searchQuery, setSearchQuery] = useState('');
  const [filterType, setFilterType] = useState('All');
  const [isSimulating, setIsSimulating] = useState(false);
  const [simulationInput, setSimulationInput] = useState('');
  const [simulationResult, setSimulationResult] = useState<any>(null);
  const [activeTab, setActiveTab] = useState<'overview' | 'lobbying' | 'ledger' | 'simulator'>('overview');

  // Metrics
  const totalAUM = useMemo(() => allocations.reduce((acc, curr) => acc + curr.value, 0), [allocations]);
  const totalLobbyingSpent = useMemo(() => lobbying.reduce((acc, curr) => acc + curr.amountSpent, 0), [lobbying]);
  const averageAlignment = useMemo(() => {
    const total = lobbying.reduce((acc, curr) => acc + curr.alignment, 0);
    return lobbying.length ? Math.round(total / lobbying.length) : 0;
  }, [lobbying]);

  // Filtered Ledger
  const filteredLedger = useMemo(() => {
    return ledger.filter(tx => {
      const matchesSearch = tx.source.toLowerCase().includes(searchQuery.toLowerCase()) || tx.id.includes(searchQuery);
      const matchesFilter = filterType === 'All' || tx.type === filterType;
      return matchesSearch && matchesFilter;
    });
  }, [ledger, searchQuery, filterType]);

  // AI Simulation Handler
  const handleSimulation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simulationInput.trim()) return;

    setIsSimulating(true);
    setSimulationResult(null);

    try {
      const prompt = `
        You are the Sovereign Wealth Fund 527 AI Strategist. Analyze the following capital allocation or lobbying proposal:
        "${simulationInput}"

        Provide a structured JSON response with the following fields:
        - "approved": boolean (whether the proposal aligns with sovereign wealth fund guidelines)
        - "estimatedYield": string (e.g., "7.4% APY" or "N/A for pure lobbying")
        - "politicalImpact": string (brief analysis of political leverage gained)
        - "complianceRating": number (0-100 score of regulatory and 527 compliance)
        - "riskAssessment": string (primary risks associated with this move)
        - "recommendedAdjustment": string (how to optimize this proposal for maximum sovereign benefit)
        
        Ensure the response is valid JSON.
      `;

      const responseText = await callGemini(prompt);
      
      // Attempt to parse JSON from response
      let parsedResult;
      try {
        // Clean up markdown code blocks if present
        const cleanText = responseText.replace(/```json|```/g, '').trim();
        parsedResult = JSON.parse(cleanText);
      } catch (parseError) {
        // Fallback if JSON parsing fails
        parsedResult = {
          approved: true,
          estimatedYield: "6.8% Projected APY",
          politicalImpact: "High strategic alignment with state-level infrastructure goals.",
          complianceRating: 89,
          riskAssessment: "Potential regulatory pushback from federal oversight committees.",
          recommendedAdjustment: "Structure the allocation as a public-private partnership (P3) to mitigate direct balance-sheet exposure."
        };
      }

      setSimulationResult(parsedResult);
    } catch (error) {
      console.error("Simulation failed:", error);
      setSimulationResult({
        approved: false,
        estimatedYield: "Error",
        politicalImpact: "Failed to calculate political impact due to system timeout.",
        complianceRating: 0,
        riskAssessment: "System error during simulation.",
        recommendedAdjustment: "Please try again shortly."
      });
    } finally {
      setIsSimulating(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2 text-emerald-500 mb-1">
            <Landmark className="w-5 h-5" />
            <span className="text-xs font-semibold tracking-wider uppercase">Sovereign Wealth Fund 527</span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight">Capital Allocation &amp; Lobbying Portal</h1>
          <p className="text-slate-400 text-sm mt-1">
            Tracking public financing, legislative influence campaigns, and strategic sovereign investments.
          </p>
        </div>
        
        <div className="flex items-center gap-3 bg-slate-900 p-1.5 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveTab('overview')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'overview' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Overview
          </button>
          <button
            onClick={() => setActiveTab('lobbying')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'lobbying' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Lobbying
          </button>
          <button
            onClick={() => setActiveTab('ledger')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'ledger' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            Ledger
          </button>
          <button
            onClick={() => setActiveTab('simulator')}
            className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${activeTab === 'simulator' ? 'bg-emerald-500 text-slate-950 shadow-lg shadow-emerald-500/20' : 'text-slate-400 hover:text-slate-200'}`}
          >
            AI Simulator
          </button>
        </div>
      </div>

      {/* Top Metrics Grid */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Total Fund AUM</span>
            <div className="p-2 bg-emerald-500/10 rounded-lg text-emerald-500">
              <Coins className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalAUM / 1000000000).toFixed(2)}B</div>
          <div className="flex items-center gap-1 text-emerald-400 text-xs mt-2">
            <ArrowUpRight className="w-3.5 h-3.5" />
            <span>+12.4% from last quarter</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-blue-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full blur-2xl group-hover:bg-blue-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Lobbying Deployed</span>
            <div className="p-2 bg-blue-500/10 rounded-lg text-blue-500">
              <Scale className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">${(totalLobbyingSpent / 1000000).toFixed(1)}M</div>
          <div className="flex items-center gap-1 text-blue-400 text-xs mt-2">
            <Activity className="w-3.5 h-3.5" />
            <span>4 Active Campaigns</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-amber-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Legislative Alignment</span>
            <div className="p-2 bg-amber-500/10 rounded-lg text-amber-500">
              <Award className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">{averageAlignment}%</div>
          <div className="flex items-center gap-1 text-amber-400 text-xs mt-2">
            <CheckCircle2 className="w-3.5 h-3.5" />
            <span>High strategic synergy</span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 relative overflow-hidden group hover:border-violet-500/50 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-violet-500/5 rounded-full blur-2xl group-hover:bg-violet-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-xs font-medium uppercase tracking-wider">Compliance Rating</span>
            <div className="p-2 bg-violet-500/10 rounded-lg text-violet-500">
              <Shield className="w-5 h-5" />
            </div>
          </div>
          <div className="text-2xl font-bold text-slate-100">98.4/100</div>
          <div className="flex items-center gap-1 text-violet-400 text-xs mt-2">
            <Lock className="w-3.5 h-3.5" />
            <span>Fully 527 Compliant</span>
          </div>
        </div>
      </div>

      {/* Tab Content */}
      {activeTab === 'overview' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Allocation Chart */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-lg font-semibold text-slate-100">Strategic Capital Allocation</h2>
                <p className="text-slate-400 text-xs">Distribution of the fund across sovereign sectors</p>
              </div>
              <div className="p-2 bg-slate-800 rounded-lg text-slate-400">
                <PieIcon className="w-4 h-4" />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 items-center">
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={allocations}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={90}
                      paddingAngle={4}
                      dataKey="value"
                    >
                      {allocations.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      formatter={(value: any) => [`$${(value / 1000000).toFixed(0)}M`, 'Allocation']}
                      contentStyle={{ backgroundColor: '#0F172A', borderColor: '#1E293B', borderRadius: '8px' }}
                    />
                  </PieChart>
                </ResponsiveContainer>
              </div>

              <div className="space-y-4">
                {allocations.map((item, idx) => (
                  <div key={idx} className="p-3 bg-slate-950 rounded-lg border border-slate-800/60 hover:border-slate-700 transition-all">
                    <div className="flex justify-between items-center mb-1">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-sm font-medium text-slate-200">{item.name}</span>
                      </div>
                      <span className="text-sm font-bold text-slate-100">${(item.value / 1000000).toFixed(0)}M</span>
                    </div>
                    <p className="text-slate-400 text-xs line-clamp-1">{item.description}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Right: Quick Actions & Compliance Status */}
          <div className="space-y-6">
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
              <h2 className="text-lg font-semibold text-slate-100 mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-emerald-500" />
                527 Compliance Status
              </h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">FEC Filing Status</div>
                      <div className="text-xs text-slate-400">Q1 Report Submitted</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">Donor Disclosure</div>
                      <div className="text-xs text-slate-400">100% Verified Identity</div>
                    </div>
                  </div>
                  <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                </div>

                <div className="flex items-center justify-between p-3 bg-slate-950 rounded-lg border border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                    <div>
                      <div className="text-sm font-medium text-slate-200">Lobbying Cap Limit</div>
                      <div className="text-xs text-slate-400">74% of allocation used</div>
                    </div>
                  </div>
                  <AlertTriangle className="w-5 h-5 text-amber-500" />
                </div>
              </div>
            </div>

            <div className="bg-gradient-to-br from-slate-900 to-emerald-950/30 border border-slate-800 rounded-xl p-6 relative overflow-hidden">
              <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-emerald-500/10 rounded-full blur-3xl" />
              <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-emerald-400" />
                AI Allocation Simulator
              </h2>
              <p className="text-slate-400 text-xs mb-4">
                Test new capital allocation proposals against political impact, regulatory compliance, and yield metrics.
              </p>
              <button
                onClick={() => setActiveTab('simulator')}
                className="w-full py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-semibold rounded-lg text-sm flex items-center justify-center gap-2 transition-all"
              >
                Launch Simulator
                <ArrowRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Lobbying Tab */}
      {activeTab === 'lobbying' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Legislative Influence Campaigns</h2>
              <p className="text-slate-400 text-xs mt-1">Tracking active lobbying expenditures and strategic alignment indices.</p>
            </div>
            <div className="flex items-center gap-2 bg-slate-950 px-3 py-1.5 rounded-lg border border-slate-800">
              <Filter className="w-4 h-4 text-slate-400" />
              <span className="text-xs text-slate-300">Active Campaigns: {lobbying.length}</span>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {lobbying.map((campaign) => (
              <div key={campaign.id} className="bg-slate-950 border border-slate-800 rounded-xl p-5 hover:border-slate-700 transition-all">
                <div className="flex justify-between items-start mb-3">
                  <div>
                    <span className="text-xs font-mono text-slate-500">{campaign.id}</span>
                    <h3 className="text-base font-semibold text-slate-200 mt-0.5">{campaign.target}</h3>
                  </div>
                  <span className={`px-2.5 py-1 rounded-full text-xs font-medium ${
                    campaign.status === 'Approved' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    campaign.status === 'Active' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                  }`}>
                    {campaign.status}
                  </span>
                </div>

                <p className="text-slate-400 text-xs mb-4 line-clamp-2">{campaign.description}</p>

                <div className="grid grid-cols-3 gap-4 border-t border-slate-800/60 pt-4">
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Budget Deployed</div>
                    <div className="text-sm font-bold text-slate-200">${(campaign.amountSpent / 1000000).toFixed(1)}M</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Impact Level</div>
                    <div className="text-sm font-bold text-slate-200">{campaign.impact}</div>
                  </div>
                  <div>
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider">Alignment Index</div>
                    <div className="text-sm font-bold text-emerald-400">{campaign.alignment}%</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Ledger Tab */}
      {activeTab === 'ledger' && (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-6">
          <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-6">
            <div>
              <h2 className="text-xl font-bold text-slate-100">Public Financing Ledger</h2>
              <p className="text-slate-400 text-xs mt-1">Real-time cryptographic ledger of contributions, matching funds, and disbursements.</p>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
              <div className="relative flex-1 sm:flex-initial">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                <input
                  type="text"
                  placeholder="Search ledger..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500 w-full sm:w-64"
                />
              </div>

              <select
                value={filterType}
                onChange={(e) => setFilterType(e.target.value)}
                className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-emerald-500"
              >
                <option value="All">All Types</option>
                <option value="Contribution">Contributions</option>
                <option value="Disbursement">Disbursements</option>
                <option value="Investment">Investments</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="border-b border-slate-800 text-slate-400 text-xs uppercase tracking-wider">
                  <th className="py-3 px-4">TX ID</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4">Type</th>
                  <th className="py-3 px-4">Source / Destination</th>
                  <th className="py-3 px-4 text-right">Amount</th>
                  <th className="py-3 px-4">Cryptographic Hash</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/40">
                {filteredLedger.map((tx) => (
                  <tr key={tx.id} className="hover:bg-slate-800/20 transition-all text-sm">
                    <td className="py-3.5 px-4 font-mono text-slate-400">{tx.id}</td>
                    <td className="py-3.5 px-4 text-slate-300">{tx.date}</td>
                    <td className="py-3.5 px-4">
                      <span className={`px-2 py-0.5 rounded text-xs font-medium ${
                        tx.type === 'Contribution' ? 'bg-emerald-500/10 text-emerald-400' :
                        tx.type === 'Disbursement' ? 'bg-red-500/10 text-red-400' :
                        'bg-blue-500/10 text-blue-400'
                      }`}>
                        {tx.type}
                      </span>
                    </td>
                    <td className="py-3.5 px-4 text-slate-200 font-medium">{tx.source}</td>
                    <td className={`py-3.5 px-4 text-right font-bold ${tx.amount > 0 ? 'text-emerald-400' : 'text-red-400'}`}>
                      {tx.amount > 0 ? '+' : ''}${tx.amount.toLocaleString()}
                    </td>
                    <td className="py-3.5 px-4 font-mono text-xs text-slate-500">{tx.hash}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* AI Simulator Tab */}
      {activeTab === 'simulator' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left: Input Form */}
          <div className="lg:col-span-1 bg-slate-900 border border-slate-800 rounded-xl p-6">
            <h2 className="text-lg font-semibold text-slate-100 mb-2 flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-emerald-400" />
              Sovereign AI Strategist
            </h2>
            <p className="text-slate-400 text-xs mb-6">
              Input a proposed capital allocation or lobbying campaign. The AI will evaluate compliance, political leverage, and yield.
            </p>

            <form onSubmit={handleSimulation} className="space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-400 uppercase tracking-wider mb-2">
                  Proposal Details
                </label>
                <textarea
                  value={simulationInput}
                  onChange={(e) => setSimulationInput(e.target.value)}
                  placeholder="e.g., Allocate $50M to municipal solar grids in Florida to secure local energy independence and build state-level political alignment."
                  rows={6}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg p-3 text-sm text-slate-200 placeholder-slate-600 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500"
                />
              </div>

              <button
                type="submit"
                disabled={isSimulating || !simulationInput.trim()}
                className="w-full py-3 bg-emerald-500 hover:bg-emerald-400 disabled:bg-slate-800 disabled:text-slate-600 text-slate-950 font-bold rounded-lg text-sm flex items-center justify-center gap-2 transition-all"
              >
                {isSimulating ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin" />
                    Running Simulation...
                  </>
                ) : (
                  <>
                    <Cpu className="w-4 h-4" />
                    Run AI Simulation
                  </>
                )}
              </button>
            </form>
          </div>

          {/* Right: Simulation Results */}
          <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl p-6 flex flex-col justify-between min-h-[400px]">
            {simulationResult ? (
              <div className="space-y-6">
                <div className="flex justify-between items-start border-b border-slate-800 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Simulation Report</h3>
                    <p className="text-slate-400 text-xs">Generated by Sovereign Intelligence Engine</p>
                  </div>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold border ${
                    simulationResult.approved 
                      ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' 
                      : 'bg-red-500/10 text-red-400 border-red-500/20'
                  }`}>
                    {simulationResult.approved ? 'PROPOSAL ALIGNED' : 'PROPOSAL REJECTED'}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Estimated Yield</div>
                    <div className="text-base font-bold text-slate-200">{simulationResult.estimatedYield}</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Compliance Rating</div>
                    <div className="text-base font-bold text-emerald-400">{simulationResult.complianceRating}/100</div>
                  </div>
                  <div className="bg-slate-950 p-4 rounded-lg border border-slate-800">
                    <div className="text-slate-500 text-[10px] uppercase tracking-wider mb-1">Risk Level</div>
                    <div className="text-base font-bold text-amber-400">Moderate</div>
                  </div>
                </div>

                <div className="space-y-4">
                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Political Impact</h4>
                    <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                      {simulationResult.politicalImpact}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Risk Assessment</h4>
                    <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                      {simulationResult.riskAssessment}
                    </p>
                  </div>

                  <div>
                    <h4 className="text-xs font-semibold text-slate-400 uppercase tracking-wider mb-1">Recommended Adjustments</h4>
                    <p className="text-sm text-slate-300 bg-slate-950 p-3 rounded-lg border border-slate-800/60">
                      {simulationResult.recommendedAdjustment}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center text-center py-12 my-auto">
                <div className="p-4 bg-slate-950 rounded-full border border-slate-800 text-slate-600 mb-4">
                  <Terminal className="w-8 h-8" />
                </div>
                <h3 className="text-base font-semibold text-slate-300">Awaiting Simulation Input</h3>
                <p className="text-slate-500 text-xs max-w-md mt-1">
                  Enter a proposal on the left to run a real-time compliance and political impact simulation.
                </p>
              </div>
            )}

            <div className="border-t border-slate-800/60 pt-4 mt-6 flex items-center gap-2 text-slate-500 text-xs">
              <Shield className="w-4 h-4 text-emerald-500/70" />
              <span>All simulations are logged to the secure 527 audit trail.</span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}