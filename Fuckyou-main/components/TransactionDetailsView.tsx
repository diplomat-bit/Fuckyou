import React, { useState, useMemo, useEffect } from 'react';
import { 
  Shield, 
  Sparkles, 
  Anchor, 
  Gem, 
  Crown, 
  Filter, 
  Search, 
  ArrowUpRight, 
  ArrowDownLeft, 
  Cpu, 
  TrendingUp, 
  Layers, 
  CheckCircle2, 
  AlertTriangle, 
  Clock, 
  Globe, 
  DollarSign,
  ChevronRight,
  SlidersHorizontal,
  Activity
} from 'lucide-react';

// --- TYPES & INTERFACES ---
export interface Transaction {
  id: string;
  title: string;
  amount: number;
  currency: string;
  date: string;
  type: 'DEBIT' | 'CREDIT';
  category: 'Superyacht' | 'Sovereign Debt' | 'Fine Art' | 'Aerospace' | 'Megastructure' | 'Private Island' | 'AI Compute Cluster';
  modernTreasuryStatus: 'processing' | 'completed' | 'reconciled' | 'pending_approval' | 'failed';
  modernTreasuryLedgerId: string;
  citibankRef: string;
  aiRiskScore: number; // 0 to 100 (lower is safer)
  aiRiskAnalysis: {
    amlStatus: 'CLEARED' | 'FLAGGED' | 'MANUAL_REVIEW';
    geopoliticalRisk: 'Negligible' | 'Low' | 'Moderate' | 'High';
    liquidityImpact: string;
    counterpartyVerification: string;
    regulatoryCompliance: string;
  };
  description: string;
  location: string;
  counterparty: string;
}

interface TransactionDetailsViewProps {
  accountId?: string;
}

// --- ULTRA-LUXURY MOCK DATA ---
const MOCK_TRANSACTIONS: Transaction[] = [
  {
    id: "TXN-9081-MT",
    title: "Superyacht 'Aurelia' Custom Refit & Heliport Integration",
    amount: 142500000,
    currency: "USD",
    date: "2024-11-15T14:30:00Z",
    type: "DEBIT",
    category: "Superyacht",
    modernTreasuryStatus: "reconciled",
    modernTreasuryLedgerId: "ledger_entry_88f9a2c1",
    citibankRef: "CITI-FEDWIRE-9920182-X",
    aiRiskScore: 12,
    aiRiskAnalysis: {
      amlStatus: "CLEARED",
      geopoliticalRisk: "Negligible",
      liquidityImpact: "0.001% of total liquid reserves. No stress detected.",
      counterpartyVerification: "Lürssen Shipyard AG (Verified via Modern Treasury KYC)",
      regulatoryCompliance: "Jones Act & EU Maritime Safety Compliant"
    },
    description: "Final milestone payment for hull extension, titanium heliport reinforcement, and quantum-encrypted satellite array installation.",
    location: "Monaco Harbor / Hamburg",
    counterparty: "Lürssen Shipyard AG"
  },
  {
    id: "TXN-7721-MT",
    title: "Sovereign Bond Purchase - Kingdom of Monaco Series A-9",
    amount: 2500000000,
    currency: "EUR",
    date: "2024-11-14T09:15:00Z",
    type: "DEBIT",
    category: "Sovereign Debt",
    modernTreasuryStatus: "completed",
    modernTreasuryLedgerId: "ledger_entry_11a2b3c4",
    citibankRef: "CITI-CHIPS-8830192-M",
    aiRiskScore: 4,
    aiRiskAnalysis: {
      amlStatus: "CLEARED",
      geopoliticalRisk: "Negligible",
      liquidityImpact: "Strategic sovereign asset reallocation. Yield optimized at 4.85% tax-free.",
      counterpartyVerification: "Ministry of Finance & Economy, Monaco",
      regulatoryCompliance: "ECB Sovereign Issuance Framework Compliant"
    },
    description: "Acquisition of ultra-exclusive, zero-coupon sovereign bonds backed by state-owned real estate portfolios.",
    location: "Monte Carlo, Monaco",
    counterparty: "Banque Centrale de Monaco"
  },
  {
    id: "TXN-4412-MT",
    title: "Picasso 'Femme au chignon' Private Acquisition",
    amount: 185000000,
    currency: "USD",
    date: "2024-11-12T18:45:00Z",
    type: "DEBIT",
    category: "Fine Art",
    modernTreasuryStatus: "completed",
    modernTreasuryLedgerId: "ledger_entry_55d6e7f8",
    citibankRef: "CITI-SWIFT-7720193-A",
    aiRiskScore: 28,
    aiRiskAnalysis: {
      amlStatus: "CLEARED",
      geopoliticalRisk: "Low",
      liquidityImpact: "Alternative asset diversification. Art market index correlation: 0.12.",
      counterpartyVerification: "Sotheby's Private Treaty Division",
      regulatoryCompliance: "Interpol Stolen Art Database Checked - 100% Clear"
    },
    description: "Off-market acquisition of the 1938 masterpiece. Includes climate-controlled transport via armored air-freight and Lloyd's of London ultra-tier insurance.",
    location: "Geneva Free Port, Switzerland",
    counterparty: "Sotheby's Holdings Inc."
  },
  {
    id: "TXN-3309-MT",
    title: "Lunar Helium-3 Mining Rights Deposit",
    amount: 500000000,
    currency: "USD",
    date: "2024-11-10T11:00:00Z",
    type: "DEBIT",
    category: "Aerospace",
    modernTreasuryStatus: "processing",
    modernTreasuryLedgerId: "ledger_entry_99c8b7a6",
    citibankRef: "CITI-WIRE-4410293-S",
    aiRiskScore: 65,
    aiRiskAnalysis: {
      amlStatus: "MANUAL_REVIEW",
      geopoliticalRisk: "Moderate",
      liquidityImpact: "High-risk speculative venture. Capital locked for 120 months.",
      counterpartyVerification: "Artemis Resource Consortium (Pending Deep AI Audit)",
      regulatoryCompliance: "Outer Space Treaty of 1967 Compliance Verified"
    },
    description: "Escrow deposit for exclusive mining rights in the Mare Tranquillitatis sector of the Moon. Managed via Modern Treasury multi-sig escrow ledger.",
    location: "Kennedy Space Center / Lunar Orbit",
    counterparty: "Artemis Resource Consortium"
  },
  {
    id: "TXN-1102-MT",
    title: "Neom Mirror Line Penthouse Construction Milestone",
    amount: 320000000,
    currency: "USD",
    date: "2024-11-08T08:30:00Z",
    type: "DEBIT",
    category: "Megastructure",
    modernTreasuryStatus: "pending_approval",
    modernTreasuryLedgerId: "ledger_entry_33e4f5g6",
    citibankRef: "CITI-WIRE-1102938-N",
    aiRiskScore: 42,
    aiRiskAnalysis: {
      amlStatus: "CLEARED",
      geopoliticalRisk: "Moderate",
      liquidityImpact: "Real estate allocation. Projected ROI: 18.5% per annum upon completion.",
      counterpartyVerification: "NEOM Development Authority",
      regulatoryCompliance: "KSA Royal Decree Investment Framework Compliant"
    },
    description: "Tranche 4 payment for the structural engineering of the triple-tier sky-mansion suspended at 450 meters.",
    location: "Tabuk Province, Saudi Arabia",
    counterparty: "NEOM Joint Venture Corp"
  },
  {
    id: "TXN-5541-MT",
    title: "NVIDIA H200 AI GPU Cluster Acquisition (10,000 Nodes)",
    amount: 450000000,
    currency: "USD",
    date: "2024-11-05T16:00:00Z",
    type: "DEBIT",
    category: "AI Compute Cluster",
    modernTreasuryStatus: "reconciled",
    modernTreasuryLedgerId: "ledger_entry_22b3c4d5",
    citibankRef: "CITI-SWIFT-5540192-G",
    aiRiskScore: 18,
    aiRiskAnalysis: {
      amlStatus: "CLEARED",
      geopoliticalRisk: "Low",
      liquidityImpact: "Infrastructure asset. Instantly collateralized for Citibank credit line expansion.",
      counterpartyVerification: "NVIDIA Corporation Direct Sales",
      regulatoryCompliance: "US Bureau of Industry and Security (BIS) Export Cleared"
    },
    description: "Direct purchase of next-generation AI compute cluster to power the Private Family Office's predictive wealth algorithms.",
    location: "Santa Clara, California / Reykjavik Data Center",
    counterparty: "NVIDIA Corporation"
  },
  {
    id: "TXN-8890-MT",
    title: "Sovereign Wealth Fund Dividend Distribution",
    amount: 1200000000,
    currency: "USD",
    date: "2024-11-01T07:00:00Z",
    type: "CREDIT",
    category: "Sovereign Debt",
    modernTreasuryStatus: "reconciled",
    modernTreasuryLedgerId: "ledger_entry_77a8b9c0",
    citibankRef: "CITI-ACH-8890123-D",
    aiRiskScore: 2,
    aiRiskAnalysis: {
      amlStatus: "CLEARED",
      geopoliticalRisk: "Negligible",
      liquidityImpact: "Inflow. Increases liquid cash reserves by 8.2%.",
      counterpartyVerification: "Abu Dhabi Investment Authority (ADIA)",
      regulatoryCompliance: "FATF Compliant Sovereign Inflow"
    },
    description: "Bi-annual dividend distribution from sovereign wealth fund co-investments.",
    location: "Abu Dhabi, UAE",
    counterparty: "Abu Dhabi Investment Authority"
  }
];

export default function TransactionDetailsView({ accountId = "ACT-CITI-AI-9999" }: TransactionDetailsViewProps) {
  const [transactions, setTransactions] = useState<Transaction[]>(MOCK_TRANSACTIONS);
  const [selectedTxnId, setSelectedTxnId] = useState<string>(MOCK_TRANSACTIONS[0].id);
  const [searchQuery, setSearchQuery] = useState('');
  const [categoryFilter, setCategoryFilter] = useState<string>('All');
  const [riskFilter, setRiskFilter] = useState<string>('All');
  const [isAiAnalyzing, setIsAiAnalyzing] = useState(false);
  const [aiInsightMessage, setAiInsightMessage] = useState<string>("");

  // Find selected transaction
  const selectedTxn = useMemo(() => {
    return transactions.find(t => t.id === selectedTxnId) || transactions[0];
  }, [transactions, selectedTxnId]);

  // Filtered transactions
  const filteredTransactions = useMemo(() => {
    return transactions.filter(t => {
      const matchesSearch = t.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            t.counterparty.toLowerCase().includes(searchQuery.toLowerCase());
      
      const matchesCategory = categoryFilter === 'All' || t.category === categoryFilter;
      
      let matchesRisk = true;
      if (riskFilter === 'Low') matchesRisk = t.aiRiskScore <= 20;
      else if (riskFilter === 'Medium') matchesRisk = t.aiRiskScore > 20 && t.aiRiskScore <= 50;
      else if (riskFilter === 'High') matchesRisk = t.aiRiskScore > 50;

      return matchesSearch && matchesCategory && matchesRisk;
    });
  }, [transactions, searchQuery, categoryFilter, riskFilter]);

  // Simulate AI Risk Engine recalculation
  const triggerAiRecalculation = () => {
    setIsAiAnalyzing(true);
    setAiInsightMessage("Initializing Citibank AI Risk Engine v9.4...");
    
    setTimeout(() => {
      setAiInsightMessage("Scanning global sanctions lists, maritime tracking, and real-time sovereign bond yields...");
    }, 1200);

    setTimeout(() => {
      // Slightly randomize risk scores to simulate real-time AI analysis
      setTransactions(prev => prev.map(t => {
        const variance = Math.floor(Math.random() * 7) - 3; // -3 to +3
        const newScore = Math.max(1, Math.min(99, t.aiRiskScore + variance));
        return {
          ...t,
          aiRiskScore: newScore
        };
      }));
      setIsAiAnalyzing(false);
      setAiInsightMessage("");
    }, 2500);
  };

  // Format currency helper
  const formatCurrency = (value: number, currency: string) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: currency,
      maximumFractionDigits: 0
    }).format(value);
  };

  // Get status badge colors
  const getStatusBadge = (status: Transaction['modernTreasuryStatus']) => {
    switch (status) {
      case 'reconciled':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-emerald-950/80 text-emerald-400 border border-emerald-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Reconciled</span>;
      case 'completed':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-blue-950/80 text-blue-400 border border-blue-500/30 flex items-center gap-1.5"><CheckCircle2 className="w-3.5 h-3.5" /> Completed</span>;
      case 'processing':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-amber-950/80 text-amber-400 border border-amber-500/30 flex items-center gap-1.5 animate-pulse"><Clock className="w-3.5 h-3.5" /> Processing</span>;
      case 'pending_approval':
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-purple-950/80 text-purple-400 border border-purple-500/30 flex items-center gap-1.5"><SlidersHorizontal className="w-3.5 h-3.5" /> Pending Approval</span>;
      default:
        return <span className="px-3 py-1 text-xs font-semibold rounded-full bg-rose-950/80 text-rose-400 border border-rose-500/30 flex items-center gap-1.5"><AlertTriangle className="w-3.5 h-3.5" /> Failed</span>;
    }
  };

  // Get risk score color
  const getRiskColor = (score: number) => {
    if (score <= 20) return 'text-emerald-400';
    if (score <= 50) return 'text-amber-400';
    return 'text-rose-400';
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-amber-500 selection:text-black">
      {/* Top Luxury Header */}
      <header className="border-b border-amber-500/20 bg-gradient-to-b from-neutral-950 to-black px-8 py-6 sticky top-0 z-50 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs tracking-[0.3em] text-amber-500 font-bold uppercase">
              <Crown className="w-4 h-4 text-amber-500 animate-pulse" />
              Citibank Private Client × Modern Treasury AI
            </div>
            <h1 className="text-3xl font-extrabold tracking-tight text-white mt-1 flex items-center gap-3">
              Sovereign & Ultra-Asset Ledger
              <span className="text-xs bg-gradient-to-r from-amber-500 to-yellow-300 text-black px-2.5 py-1 rounded font-mono font-bold uppercase tracking-wider">
                AI-Risk Engine v9.4
              </span>
            </h1>
            <p className="text-xs text-slate-400 mt-1 font-mono">
              Account: <span className="text-amber-400">{accountId}</span> • Security Clearance: Tier-1 Sovereign
            </p>
          </div>

          <div className="flex items-center gap-3">
            <button 
              onClick={triggerAiRecalculation}
              disabled={isAiAnalyzing}
              className="relative overflow-hidden group px-5 py-2.5 rounded-lg bg-gradient-to-r from-amber-500 to-yellow-600 text-black font-bold text-sm tracking-wide transition-all hover:shadow-[0_0_20px_rgba(245,158,11,0.4)] disabled:opacity-50 flex items-center gap-2"
            >
              <Cpu className={`w-4 h-4 ${isAiAnalyzing ? 'animate-spin' : ''}`} />
              {isAiAnalyzing ? 'Recalculating Risk...' : 'Trigger AI Risk Audit'}
            </button>
            <div className="bg-neutral-900 border border-neutral-800 px-4 py-2 rounded-lg text-right hidden sm:block">
              <div className="text-[10px] text-slate-400 uppercase tracking-wider font-mono">Total Liquid Reserves</div>
              <div className="text-lg font-bold text-emerald-400 font-mono">$14,802,910,400.00</div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Grid */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        
        {/* AI Status Banner */}
        {isAiAnalyzing && (
          <div className="mb-6 p-4 rounded-xl bg-gradient-to-r from-amber-950/40 via-neutral-900 to-amber-950/40 border border-amber-500/30 animate-pulse flex items-center gap-4">
            <div className="p-2 bg-amber-500/20 rounded-lg">
              <Sparkles className="w-6 h-6 text-amber-400 animate-spin" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-amber-400 font-mono">AI Risk Engine Recalculating...</h4>
              <p className="text-xs text-slate-300 font-mono mt-0.5">{aiInsightMessage}</p>
            </div>
          </div>
        )}

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Left Column: Filters & Transaction List (7 Cols) */}
          <div className="lg:col-span-7 space-y-6">
            
            {/* Advanced Filters Card */}
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-5 shadow-2xl">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center gap-2 text-sm font-bold text-white uppercase tracking-wider">
                  <Filter className="w-4 h-4 text-amber-500" />
                  Advanced Asset Filters
                </div>
                <span className="text-xs text-slate-400 font-mono">{filteredTransactions.length} Assets Found</span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {/* Search */}
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text" 
                    placeholder="Search transactions, IDs..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg pl-9 pr-4 py-2 text-sm text-white placeholder-slate-500 focus:outline-none focus:border-amber-500/50 transition-colors"
                  />
                </div>

                {/* Category Filter */}
                <div>
                  <select
                    value={categoryFilter}
                    onChange={(e) => setCategoryFilter(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  >
                    <option value="All">All Categories</option>
                    <option value="Superyacht">Superyachts</option>
                    <option value="Sovereign Debt">Sovereign Debt</option>
                    <option value="Fine Art">Fine Art</option>
                    <option value="Aerospace">Aerospace</option>
                    <option value="Megastructure">Megastructures</option>
                    <option value="AI Compute Cluster">AI Compute Clusters</option>
                  </select>
                </div>

                {/* Risk Filter */}
                <div>
                  <select
                    value={riskFilter}
                    onChange={(e) => setRiskFilter(e.target.value)}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-amber-500/50 transition-colors"
                  >
                    <option value="All">All Risk Levels</option>
                    <option value="Low">Low Risk (0-20)</option>
                    <option value="Medium">Medium Risk (21-50)</option>
                    <option value="High">High Risk (51+)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Transaction List */}
            <div className="space-y-3 overflow-y-auto max-h-[650px] pr-2 scrollbar-thin scrollbar-thumb-neutral-800">
              {filteredTransactions.length === 0 ? (
                <div className="text-center py-12 bg-neutral-950 border border-neutral-800 rounded-2xl">
                  <AlertTriangle className="w-12 h-12 text-amber-500/50 mx-auto mb-3" />
                  <p className="text-slate-400 font-mono text-sm">No ultra-luxury transactions match your criteria.</p>
                </div>
              ) : (
                filteredTransactions.map((txn) => {
                  const isSelected = txn.id === selectedTxnId;
                  return (
                    <div
                      key={txn.id}
                      onClick={() => setSelectedTxnId(txn.id)}
                      className={`group relative cursor-pointer p-5 rounded-xl border transition-all duration-300 ${
                        isSelected 
                          ? 'bg-gradient-to-r from-neutral-900 to-neutral-950 border-amber-500/60 shadow-[0_0_15px_rgba(245,158,11,0.15)]' 
                          : 'bg-neutral-950 border-neutral-800 hover:border-neutral-700 hover:bg-neutral-900/50'
                      }`}
                    >
                      {/* Left Accent Bar */}
                      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl transition-colors ${
                        isSelected ? 'bg-amber-500' : 'bg-transparent group-hover:bg-neutral-700'
                      }`} />

                      <div className="flex justify-between items-start gap-4">
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider bg-amber-500/10 px-2 py-0.5 rounded">
                              {txn.category}
                            </span>
                            <span className="text-[10px] font-mono text-slate-500">
                              {txn.id}
                            </span>
                          </div>
                          <h3 className="text-sm font-bold text-white group-hover:text-amber-400 transition-colors line-clamp-1">
                            {txn.title}
                          </h3>
                          <p className="text-xs text-slate-400 font-mono">
                            Counterparty: <span className="text-slate-200">{txn.counterparty}</span>
                          </p>
                        </div>

                        <div className="text-right space-y-1.5">
                          <div className={`text-base font-mono font-bold flex items-center justify-end gap-1 ${
                            txn.type === 'CREDIT' ? 'text-emerald-400' : 'text-white'
                          }`}>
                            {txn.type === 'CREDIT' ? (
                              <ArrowDownLeft className="w-4 h-4 text-emerald-400" />
                            ) : (
                              <ArrowUpRight className="w-4 h-4 text-slate-400" />
                            )}
                            {formatCurrency(txn.amount, txn.currency)}
                          </div>
                          <div className="flex items-center justify-end gap-2">
                            <span className="text-[10px] font-mono text-slate-500">
                              AI Risk: <span className={`font-bold ${getRiskColor(txn.aiRiskScore)}`}>{txn.aiRiskScore}%</span>
                            </span>
                            <span className="w-1.5 h-1.5 rounded-full bg-neutral-700" />
                            <span className="text-[10px] font-mono text-slate-400">
                              {new Date(txn.date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                            </span>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Right Column: Deep AI Risk & Modern Treasury Ledger Details (5 Cols) */}
          <div className="lg:col-span-5 space-y-6">
            
            {/* Selected Transaction Detail Card */}
            <div className="bg-gradient-to-b from-neutral-950 to-black border border-neutral-800 rounded-2xl p-6 shadow-2xl space-y-6 sticky top-28">
              
              {/* Header */}
              <div className="border-b border-neutral-800 pb-4">
                <div className="flex justify-between items-start mb-2">
                  <span className="text-xs font-mono text-amber-500 uppercase tracking-widest flex items-center gap-1">
                    <Crown className="w-3.5 h-3.5" /> Ultra-Asset Ledger Detail
                  </span>
                  {getStatusBadge(selectedTxn.modernTreasuryStatus)}
                </div>
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  {selectedTxn.title}
                </h2>
                <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                  {selectedTxn.description}
                </p>
              </div>

              {/* Financial Summary */}
              <div className="grid grid-cols-2 gap-4 bg-neutral-900/50 p-4 rounded-xl border border-neutral-800/60">
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Transaction Value</span>
                  <span className="text-lg font-bold text-white font-mono">
                    {formatCurrency(selectedTxn.amount, selectedTxn.currency)}
                  </span>
                </div>
                <div>
                  <span className="text-[10px] text-slate-400 uppercase tracking-wider font-mono block">Asset Category</span>
                  <span className="text-sm font-bold text-amber-400 flex items-center gap-1.5 mt-1">
                    {selectedTxn.category === 'Superyacht' && <Anchor className="w-4 h-4" />}
                    {selectedTxn.category === 'Fine Art' && <Gem className="w-4 h-4" />}
                    {selectedTxn.category === 'Sovereign Debt' && <Globe className="w-4 h-4" />}
                    {selectedTxn.category === 'Aerospace' && <TrendingUp className="w-4 h-4" />}
                    {selectedTxn.category === 'Megastructure' && <Layers className="w-4 h-4" />}
                    {selectedTxn.category === 'AI Compute Cluster' && <Cpu className="w-4 h-4" />}
                    {selectedTxn.category}
                  </span>
                </div>
              </div>

              {/* AI Risk Engine Deep Analysis */}
              <div className="bg-neutral-900/30 border border-amber-500/20 rounded-xl p-5 space-y-4 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
                
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-amber-400 uppercase tracking-wider font-mono">
                    <Sparkles className="w-4 h-4 text-amber-400 animate-pulse" />
                    Citibank AI Risk Assessment
                  </div>
                  <div className="flex items-center gap-1.5 bg-neutral-900 px-2.5 py-1 rounded border border-neutral-800">
                    <span className="text-[10px] text-slate-400 font-mono">Risk Score:</span>
                    <span className={`text-xs font-mono font-bold ${getRiskColor(selectedTxn.aiRiskScore)}`}>
                      {selectedTxn.aiRiskScore}/100
                    </span>
                  </div>
                </div>

                {/* Risk Meter */}
                <div className="space-y-1">
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full overflow-hidden">
                    <div 
                      className={`h-full rounded-full transition-all duration-1000 ${
                        selectedTxn.aiRiskScore <= 20 ? 'bg-emerald-500' : selectedTxn.aiRiskScore <= 50 ? 'bg-amber-500' : 'bg-rose-500'
                      }`}
                      style={{ width: `${selectedTxn.aiRiskScore}%` }}
                    />
                  </div>
                  <div className="flex justify-between text-[9px] text-slate-500 font-mono">
                    <span>Sovereign Safe</span>
                    <span>Moderate Risk</span>
                    <span>High Exposure</span>
                  </div>
                </div>

                {/* AI Risk Details */}
                <div className="space-y-2.5 text-xs font-mono pt-2">
                  <div className="flex justify-between border-b border-neutral-800/50 pb-1.5">
                    <span className="text-slate-400">AML/Sanctions Status:</span>
                    <span className={`font-bold ${selectedTxn.aiRiskAnalysis.amlStatus === 'CLEARED' ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {selectedTxn.aiRiskAnalysis.amlStatus}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/50 pb-1.5">
                    <span className="text-slate-400">Geopolitical Risk Index:</span>
                    <span className="text-slate-200 font-bold">{selectedTxn.aiRiskAnalysis.geopoliticalRisk}</span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/50 pb-1.5">
                    <span className="text-slate-400">Counterparty Verification:</span>
                    <span className="text-slate-200 text-right max-w-[200px] truncate" title={selectedTxn.aiRiskAnalysis.counterpartyVerification}>
                      {selectedTxn.aiRiskAnalysis.counterpartyVerification}
                    </span>
                  </div>
                  <div className="flex justify-between border-b border-neutral-800/50 pb-1.5">
                    <span className="text-slate-400">Regulatory Compliance:</span>
                    <span className="text-slate-200 text-right max-w-[200px] truncate" title={selectedTxn.aiRiskAnalysis.regulatoryCompliance}>
                      {selectedTxn.aiRiskAnalysis.regulatoryCompliance}
                    </span>
                  </div>
                  <div className="pt-1">
                    <span className="text-slate-400 block mb-1">Liquidity Impact Analysis:</span>
                    <p className="text-slate-300 text-[11px] leading-relaxed bg-neutral-900/80 p-2.5 rounded border border-neutral-800">
                      {selectedTxn.aiRiskAnalysis.liquidityImpact}
                    </p>
                  </div>
                </div>
              </div>

              {/* Modern Treasury Ledger Integration */}
              <div className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-5 space-y-3">
                <div className="flex items-center gap-2 text-xs font-bold text-slate-300 uppercase tracking-wider font-mono">
                  <Activity className="w-4 h-4 text-blue-400" />
                  Modern Treasury Ledger Sync
                </div>

                <div className="space-y-2 text-xs font-mono">
                  <div className="flex justify-between">
                    <span className="text-slate-500">Ledger Entry ID:</span>
                    <span className="text-slate-300 select-all">{selectedTxn.modernTreasuryLedgerId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Citibank Wire Ref:</span>
                    <span className="text-slate-300 select-all">{selectedTxn.citibankRef}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Execution Location:</span>
                    <span className="text-slate-300">{selectedTxn.location}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-slate-500">Settlement Protocol:</span>
                    <span className="text-amber-500 font-bold">Fedwire Real-Time (RTGS)</span>
                  </div>
                </div>

                <div className="pt-2 border-t border-neutral-800/60 flex items-center justify-between text-[10px] text-slate-500">
                  <span>Last Synced: Just Now</span>
                  <span className="flex items-center gap-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                    Citibank Node Connected
                  </span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button className="w-full py-3 rounded-lg bg-neutral-900 hover:bg-neutral-800 border border-neutral-800 text-white font-bold text-xs tracking-wider uppercase transition-colors">
                  Download Audit PDF
                </button>
                <button className="w-full py-3 rounded-lg bg-amber-500 hover:bg-amber-600 text-black font-bold text-xs tracking-wider uppercase transition-colors">
                  Initiate Recall Wire
                </button>
              </div>

            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-neutral-900 bg-neutral-950 py-8 px-8 mt-16">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-mono">
          <div>
            © {new Date().getFullYear()} Citibank Private Client. Powered by Modern Treasury Ledger AI.
          </div>
          <div className="flex gap-6">
            <a href="#terms" className="hover:text-amber-500 transition-colors">Sovereign Compliance Terms</a>
            <a href="#privacy" className="hover:text-amber-500 transition-colors">Quantum Encryption Protocol</a>
            <a href="#support" className="hover:text-amber-500 transition-colors">Elite Concierge Desk</a>
          </div>
        </div>
      </footer>
    </div>
  );
}