import React, { useState, useMemo, useEffect, useCallback } from "react";
import {
  ShieldAlert,
  Globe2,
  Landmark,
  Zap,
  TrendingUp,
  CheckCircle,
  Lock,
  ArrowUpRight,
  DollarSign,
  Building,
  FileText,
  Activity,
  Sliders,
  Search,
  AlertTriangle,
  Play,
  RefreshCw,
  Target,
  Skull,
  Briefcase,
  Scale,
  ChevronRight,
  X,
  Info
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  BarChart,
  Bar,
  LineChart,
  Line
} from "recharts";

// --- TYPES ---
interface TakeoverTarget {
  id: string;
  name: string;
  ticker: string;
  sector: string;
  marketCap: number; // in Billions
  sovereignStake: number; // percentage
  infiltrationProgress: number; // percentage
  status: "Infiltration" | "Proxy Fight" | "Tender Offer" | "Consolidation" | "Acquired";
  cabalAffiliation: string;
  alignmentScore: number; // 1-100
  riskLevel: "Low" | "Medium" | "High" | "Critical";
  boardSeatsControlled: number;
  totalBoardSeats: number;
  description: string;
}

interface CapitalTrajectoryPoint {
  month: string;
  deployedCapital: number; // in Billions
  acquiredAssets: number; // in Billions
  leverageRatio: number;
  projectedReturn: number; // percentage
}

interface TakeoverLog {
  id: string;
  timestamp: string;
  targetName: string;
  action: string;
  status: "SUCCESS" | "PENDING" | "FAILED" | "WARNING";
  details: string;
}

// --- INITIAL MOCK DATA ---
const INITIAL_TARGETS: TakeoverTarget[] = [
  {
    id: "target-1",
    name: "Aegis Global Defense",
    ticker: "AEGD",
    sector: "Aerospace & Defense",
    marketCap: 142.5,
    sovereignStake: 14.8,
    infiltrationProgress: 68,
    status: "Proxy Fight",
    cabalAffiliation: "Military-Industrial Complex",
    alignmentScore: 42,
    riskLevel: "High",
    boardSeatsControlled: 3,
    totalBoardSeats: 11,
    description: "Primary contractor for global security systems. High resistance from legacy board members aligned with traditional defense lobbies."
  },
  {
    id: "target-2",
    name: "Apex Energy Corp",
    ticker: "APEC",
    sector: "Energy & Infrastructure",
    marketCap: 289.2,
    sovereignStake: 31.4,
    infiltrationProgress: 45,
    status: "Tender Offer",
    cabalAffiliation: "Fossil Fuel Cartel",
    alignmentScore: 58,
    riskLevel: "Critical",
    boardSeatsControlled: 4,
    totalBoardSeats: 15,
    description: "Global energy conglomerate. Hostile tender offer initiated at $85/share. Facing regulatory scrutiny from antitrust commissions."
  },
  {
    id: "target-3",
    name: "OmniMedia Syndicate",
    ticker: "OMSD",
    sector: "Communication Services",
    marketCap: 95.4,
    sovereignStake: 51.2,
    infiltrationProgress: 92,
    status: "Consolidation",
    cabalAffiliation: "Legacy Media Trust",
    alignmentScore: 88,
    riskLevel: "Low",
    boardSeatsControlled: 8,
    totalBoardSeats: 9,
    description: "Massive media network. Sovereign control established. Currently restructuring editorial boards to align with sovereign narrative protocols."
  },
  {
    id: "target-4",
    name: "Veritas BioTech",
    ticker: "VRTS",
    sector: "Healthcare & Genetics",
    marketCap: 180.8,
    sovereignStake: 8.2,
    infiltrationProgress: 18,
    status: "Infiltration",
    cabalAffiliation: "Pharma Hegemony",
    alignmentScore: 31,
    riskLevel: "High",
    boardSeatsControlled: 0,
    totalBoardSeats: 12,
    description: "Pioneering gene-editing and longevity therapies. Stealth accumulation of shares via shell companies and secondary market liquidity swarms."
  },
  {
    id: "target-5",
    name: "Krypton Logistics",
    ticker: "KLOG",
    sector: "Supply Chain & Transport",
    marketCap: 64.1,
    sovereignStake: 100,
    infiltrationProgress: 100,
    status: "Acquired",
    cabalAffiliation: "Independent",
    alignmentScore: 100,
    riskLevel: "Low",
    boardSeatsControlled: 10,
    totalBoardSeats: 10,
    description: "Fully integrated into the Sovereign Global Ledger. Supply chain routing optimized via quantum-secured smart contracts."
  }
];

const INITIAL_TRAJECTORY: CapitalTrajectoryPoint[] = [
  { month: "Jan", deployedCapital: 12.5, acquiredAssets: 15.0, leverageRatio: 1.2, projectedReturn: 14.2 },
  { month: "Feb", deployedCapital: 18.2, acquiredAssets: 22.4, leverageRatio: 1.4, projectedReturn: 15.1 },
  { month: "Mar", deployedCapital: 25.0, acquiredAssets: 31.8, leverageRatio: 1.5, projectedReturn: 16.5 },
  { month: "Apr", deployedCapital: 35.8, acquiredAssets: 48.2, leverageRatio: 1.8, projectedReturn: 18.0 },
  { month: "May", deployedCapital: 42.1, acquiredAssets: 60.5, leverageRatio: 2.1, projectedReturn: 19.4 },
  { month: "Jun", deployedCapital: 55.0, acquiredAssets: 85.2, leverageRatio: 2.5, projectedReturn: 22.1 },
  { month: "Jul", deployedCapital: 72.4, acquiredAssets: 112.0, leverageRatio: 2.8, projectedReturn: 24.8 }
];

const INITIAL_LOGS: TakeoverLog[] = [
  {
    id: "log-1",
    timestamp: "10:42:15 AM",
    targetName: "Apex Energy Corp",
    action: "Liquidity Swarm Deployment",
    status: "SUCCESS",
    details: "Deployed $4.2B block purchase through decentralized liquidity pools, bypassing dark pool detection."
  },
  {
    id: "log-2",
    timestamp: "09:15:32 AM",
    targetName: "Aegis Global Defense",
    action: "Proxy Solicitation",
    status: "WARNING",
    details: "Institutional Shareholder Services (ISS) issued a mixed recommendation on sovereign board nominees."
  },
  {
    id: "log-3",
    timestamp: "Yesterday",
    targetName: "Veritas BioTech",
    action: "Stealth Accumulation",
    status: "PENDING",
    details: "Acquiring shares via offshore entities. Current aggregate holding reached 8.2% threshold."
  },
  {
    id: "log-4",
    timestamp: "2 days ago",
    targetName: "OmniMedia Syndicate",
    action: "Board Restructuring",
    status: "SUCCESS",
    details: "Successfully replaced legacy CEO with Sovereign-aligned executive. Restructuring underway."
  }
];

export default function SovereignMarketTakeoverDashboard_v2() {
  // --- STATE ---
  const [targets, setTargets] = useState<TakeoverTarget[]>(INITIAL_TARGETS);
  const [trajectory, setTrajectory] = useState<CapitalTrajectoryPoint[]>(INITIAL_TRAJECTORY);
  const [logs, setLogs] = useState<TakeoverLog[]>(INITIAL_LOGS);
  const [selectedTarget, setSelectedTarget] = useState<TakeoverTarget | null>(INITIAL_TARGETS[0]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("ALL");
  const [leverageMultiplier, setLeverageMultiplier] = useState<number>(2.5);
  const [swarmSize, setSwarmSize] = useState<number>(5.0); // in Billions
  const [isSimulating, setIsSimulating] = useState(false);
  const [activeTab, setActiveTab] = useState<"targets" | "trajectory" | "intelligence">("targets");

  // --- STATS CALCULATIONS ---
  const stats = useMemo(() => {
    const totalMarketCapAcquired = targets
      .filter(t => t.status === "Acquired" || t.status === "Consolidation")
      .reduce((sum, t) => sum + t.marketCap, 0);
    
    const totalCapitalDeployed = trajectory[trajectory.length - 1]?.deployedCapital || 0;
    const averageInfiltration = Math.round(
      targets.reduce((sum, t) => sum + t.infiltrationProgress, 0) / targets.length
    );
    
    const activeProxyFights = targets.filter(t => t.status === "Proxy Fight").length;

    return {
      totalMarketCapAcquired,
      totalCapitalDeployed,
      averageInfiltration,
      activeProxyFights
    };
  }, [targets, trajectory]);

  // --- FILTERED TARGETS ---
  const filteredTargets = useMemo(() => {
    return targets.filter(t => {
      const matchesSearch = t.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.ticker.toLowerCase().includes(searchTerm.toLowerCase()) ||
                            t.cabalAffiliation.toLowerCase().includes(searchTerm.toLowerCase());
      const matchesStatus = statusFilter === "ALL" || t.status === statusFilter;
      return matchesSearch && matchesStatus;
    });
  }, [targets, searchTerm, statusFilter]);

  // --- ACTIONS ---
  const handleDeploySwarm = useCallback((targetId: string) => {
    setTargets(prev => prev.map(t => {
      if (t.id === targetId) {
        const newStake = Math.min(100, t.sovereignStake + parseFloat((swarmSize / t.marketCap * 100).toFixed(1)));
        const newInfiltration = Math.min(100, Math.round(t.infiltrationProgress + (swarmSize * 1.5)));
        let newStatus = t.status;
        if (newStake >= 100) newStatus = "Acquired";
        else if (newStake >= 50) newStatus = "Consolidation";
        else if (newStake >= 30) newStatus = "Tender Offer";
        else if (newStake >= 15) newStatus = "Proxy Fight";

        // Add log
        const newLog: TakeoverLog = {
          id: `log-${Date.now()}`,
          timestamp: new Date().toLocaleTimeString(),
          targetName: t.name,
          action: "Liquidity Swarm Deployed",
          status: "SUCCESS",
          details: `Injected $${swarmSize}B capital. Sovereign stake increased to ${newStake}%. Infiltration at ${newInfiltration}%.`
        };
        setLogs(l => [newLog, ...l]);

        return {
          ...t,
          sovereignStake: newStake,
          infiltrationProgress: newInfiltration,
          status: newStatus
        };
      }
      return t;
    }));
  }, [swarmSize]);

  const handleTriggerAudit = useCallback((targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    // Simulate regulatory audit impact
    const alignmentImpact = Math.max(1, target.alignmentScore - 10);
    const infiltrationImpact = Math.min(100, target.infiltrationProgress + 8);

    setTargets(prev => prev.map(t => {
      if (t.id === targetId) {
        return {
          ...t,
          alignmentScore: alignmentImpact,
          infiltrationProgress: infiltrationImpact
        };
      }
      return t;
    }));

    const newLog: TakeoverLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      targetName: target.name,
      action: "Regulatory Audit Triggered",
      status: "WARNING",
      details: `Initiated SEC/CFTC compliance probe on legacy board members. Alignment score dropped to ${alignmentImpact}%.`
    };
    setLogs(l => [newLog, ...l]);
  }, [targets]);

  const handleExecuteTenderOffer = useCallback((targetId: string) => {
    const target = targets.find(t => t.id === targetId);
    if (!target) return;

    setTargets(prev => prev.map(t => {
      if (t.id === targetId) {
        const newStake = Math.min(100, t.sovereignStake + 15);
        const newInfiltration = Math.min(100, t.infiltrationProgress + 10);
        return {
          ...t,
          sovereignStake: newStake,
          infiltrationProgress: newInfiltration,
          status: newStake >= 50 ? "Consolidation" : "Tender Offer"
        };
      }
      return t;
    }));

    const newLog: TakeoverLog = {
      id: `log-${Date.now()}`,
      timestamp: new Date().toLocaleTimeString(),
      targetName: target.name,
      action: "Tender Offer Escalation",
      status: "SUCCESS",
      details: `Escalated public tender offer. Acquired additional block of shares. Current stake at ${Math.min(100, target.sovereignStake + 15)}%.`
    };
    setLogs(l => [newLog, ...l]);
  }, [targets]);

  // --- SIMULATE CAPITAL TRAJECTORY ---
  const runTrajectorySimulation = () => {
    setIsSimulating(true);
    setTimeout(() => {
      setTrajectory(prev => {
        const lastPoint = prev[prev.length - 1];
        const nextMonthNum = prev.length + 1;
        const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
        const nextMonth = months[(months.indexOf(lastPoint.month) + 1) % 12];

        const addedCapital = parseFloat((swarmSize * leverageMultiplier).toFixed(1));
        const newDeployed = parseFloat((lastPoint.deployedCapital + addedCapital).toFixed(1));
        const newAssets = parseFloat((lastPoint.acquiredAssets + (addedCapital * 1.35)).toFixed(1));
        const newReturn = parseFloat((lastPoint.projectedReturn + (leverageMultiplier * 0.8)).toFixed(1));

        return [
          ...prev,
          {
            month: nextMonth,
            deployedCapital: newDeployed,
            acquiredAssets: newAssets,
            leverageRatio: leverageMultiplier,
            projectedReturn: newReturn
          }
        ];
      });
      setIsSimulating(false);

      const newLog: TakeoverLog = {
        id: `log-${Date.now()}`,
        timestamp: new Date().toLocaleTimeString(),
        targetName: "Global Portfolio",
        action: "Trajectory Simulation Run",
        status: "SUCCESS",
        details: `Projected capital deployment expanded with leverage multiplier of ${leverageMultiplier}x.`
      };
      setLogs(l => [newLog, ...l]);
    }, 800);
  };

  // Sync selected target details if targets array updates
  useEffect(() => {
    if (selectedTarget) {
      const updated = targets.find(t => t.id === selectedTarget.id);
      if (updated) setSelectedTarget(updated);
    }
  }, [targets]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* HEADER */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-3">
            <div className="p-2 bg-emerald-500/10 rounded-lg border border-emerald-500/30 text-emerald-400">
              <Globe2 className="w-8 h-8 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl md:text-3xl font-bold tracking-tight bg-gradient-to-r bg-clip-text text-transparent from-emerald-400 via-cyan-400 to-blue-500">
                Sovereign Market Takeover Dashboard
              </h1>
              <p className="text-slate-400 text-sm">
                Hostile Takeover Orchestrator & Capital Trajectory Engine • v2.4.0
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-3 bg-slate-900/80 border border-slate-800 p-2 rounded-xl">
          <div className="text-right">
            <span className="text-xs text-slate-500 block uppercase tracking-wider font-semibold">System Status</span>
            <span className="text-emerald-400 text-sm font-mono flex items-center gap-1.5 justify-end">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping" />
              ACTIVE INFILTRATION
            </span>
          </div>
        </div>
      </header>

      {/* TOP LEVEL STATS */}
      <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-emerald-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-emerald-500/5 rounded-full blur-2xl group-hover:bg-emerald-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-sm font-medium">Total Assets Acquired</span>
            <Landmark className="w-5 h-5 text-emerald-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            ${stats.totalMarketCapAcquired.toFixed(1)}B
          </div>
          <p className="text-xs text-emerald-400 mt-1 flex items-center gap-1">
            <ArrowUpRight className="w-3.5 h-3.5" />
            +12.4% from last quarter
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-cyan-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-cyan-500/5 rounded-full blur-2xl group-hover:bg-cyan-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-sm font-medium">Capital Deployed</span>
            <DollarSign className="w-5 h-5 text-cyan-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            ${stats.totalCapitalDeployed.toFixed(1)}B
          </div>
          <p className="text-xs text-slate-400 mt-1">
            Leverage Factor: <span className="text-cyan-400 font-mono">{leverageMultiplier}x</span>
          </p>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-amber-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 rounded-full blur-2xl group-hover:bg-amber-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-sm font-medium">Avg Infiltration Progress</span>
            <Activity className="w-5 h-5 text-amber-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {stats.averageInfiltration}%
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-2 overflow-hidden">
            <div 
              className="bg-gradient-to-r from-amber-500 to-emerald-500 h-full rounded-full transition-all duration-500"
              style={{ width: `${stats.averageInfiltration}%` }}
            />
          </div>
        </div>

        <div className="bg-slate-900/50 border border-slate-800/80 rounded-xl p-5 relative overflow-hidden group hover:border-rose-500/30 transition-all">
          <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full blur-2xl group-hover:bg-rose-500/10 transition-all" />
          <div className="flex justify-between items-start mb-3">
            <span className="text-slate-400 text-sm font-medium">Active Proxy Campaigns</span>
            <Target className="w-5 h-5 text-rose-400" />
          </div>
          <div className="text-2xl font-bold text-slate-100 font-mono">
            {stats.activeProxyFights}
          </div>
          <p className="text-xs text-rose-400 mt-1 flex items-center gap-1">
            <ShieldAlert className="w-3.5 h-3.5" />
            High resistance sectors detected
          </p>
        </div>
      </section>

      {/* NAVIGATION TABS */}
      <div className="flex border-b border-slate-800 mb-6 gap-2">
        <button
          onClick={() => setActiveTab("targets")}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "targets"
              ? "border-emerald-500 text-emerald-400 bg-emerald-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <Building className="w-4 h-4" />
          Takeover Targets
        </button>
        <button
          onClick={() => setActiveTab("trajectory")}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "trajectory"
              ? "border-cyan-500 text-cyan-400 bg-cyan-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <TrendingUp className="w-4 h-4" />
          Capital Trajectory Engine
        </button>
        <button
          onClick={() => setActiveTab("intelligence")}
          className={`px-4 py-2.5 font-medium text-sm transition-all border-b-2 flex items-center gap-2 ${
            activeTab === "intelligence"
              ? "border-amber-500 text-amber-400 bg-amber-500/5"
              : "border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-900/50"
          }`}
        >
          <Skull className="w-4 h-4" />
          Cabal Intelligence
        </button>
      </div>

      {/* MAIN CONTENT GRID */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT/MIDDLE COLUMN: MAIN TAB VIEW */}
        <div className="lg:col-span-2 space-y-6">
          
          {activeTab === "targets" && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
              {/* FILTERS */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div className="relative w-full sm:w-72">
                  <Search className="absolute left-3 top-2.5 w-4 h-4 text-slate-500" />
                  <input
                    type="text"
                    placeholder="Search targets, tickers, cabals..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-4 py-2 text-sm text-slate-200 placeholder-slate-500 focus:outline-none focus:border-emerald-500/50"
                  />
                </div>

                <div className="flex items-center gap-2 w-full sm:w-auto">
                  <span className="text-xs text-slate-500 uppercase font-semibold whitespace-nowrap">Status:</span>
                  <select
                    value={statusFilter}
                    onChange={(e) => setStatusFilter(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-1.5 text-sm text-slate-300 focus:outline-none focus:border-emerald-500/50 w-full sm:w-auto"
                  >
                    <option value="ALL">All Statuses</option>
                    <option value="Infiltration">Infiltration</option>
                    <option value="Proxy Fight">Proxy Fight</option>
                    <option value="Tender Offer">Tender Offer</option>
                    <option value="Consolidation">Consolidation</option>
                    <option value="Acquired">Acquired</option>
                  </select>
                </div>
              </div>

              {/* TARGETS LIST */}
              <div className="space-y-3">
                {filteredTargets.length === 0 ? (
                  <div className="text-center py-12 border border-dashed border-slate-800 rounded-xl">
                    <AlertTriangle className="w-8 h-8 text-slate-600 mx-auto mb-2" />
                    <p className="text-slate-400 text-sm">No takeover targets match your criteria.</p>
                  </div>
                ) : (
                  filteredTargets.map((target) => {
                    const isSelected = selectedTarget?.id === target.id;
                    return (
                      <div
                        key={target.id}
                        onClick={() => setSelectedTarget(target)}
                        className={`p-4 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 ${
                          isSelected
                            ? "bg-slate-800/40 border-emerald-500/50 shadow-lg shadow-emerald-500/5"
                            : "bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/20"
                        }`}
                      >
                        <div className="space-y-1">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-slate-200">{target.name}</span>
                            <span className="text-xs font-mono bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {target.ticker}
                            </span>
                            <span className={`text-[10px] uppercase tracking-wider font-bold px-2 py-0.5 rounded-full ${
                              target.status === "Acquired" ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20" :
                              target.status === "Consolidation" ? "bg-cyan-500/10 text-cyan-400 border border-cyan-500/20" :
                              target.status === "Tender Offer" ? "bg-amber-500/10 text-amber-400 border border-amber-500/20" :
                              target.status === "Proxy Fight" ? "bg-rose-500/10 text-rose-400 border border-rose-500/20" :
                              "bg-slate-800 text-slate-400"
                            }`}>
                              {target.status}
                            </span>
                          </div>
                          <div className="text-xs text-slate-400 flex flex-wrap gap-x-4 gap-y-1">
                            <span>Sector: <strong className="text-slate-300">{target.sector}</strong></span>
                            <span>Market Cap: <strong className="text-slate-300">${target.marketCap}B</strong></span>
                            <span>Cabal: <strong className="text-slate-300">{target.cabalAffiliation}</strong></span>
                          </div>
                        </div>

                        <div className="flex items-center gap-6 w-full sm:w-auto justify-between sm:justify-end border-t border-slate-800/50 sm:border-t-0 pt-3 sm:pt-0">
                          <div className="text-right space-y-1">
                            <span className="text-xs text-slate-500 block">Sovereign Stake</span>
                            <span className="text-sm font-mono font-bold text-emerald-400">
                              {target.sovereignStake}%
                            </span>
                          </div>

                          <div className="w-28 space-y-1">
                            <div className="flex justify-between text-[10px] text-slate-500">
                              <span>Infiltration</span>
                              <span>{target.infiltrationProgress}%</span>
                            </div>
                            <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                              <div
                                className={`h-full rounded-full transition-all duration-500 ${
                                  target.infiltrationProgress > 75 ? "bg-emerald-500" :
                                  target.infiltrationProgress > 40 ? "bg-cyan-500" :
                                  "bg-amber-500"
                                }`}
                                style={{ width: `${target.infiltrationProgress}%` }}
                              />
                            </div>
                          </div>

                          <ChevronRight className={`w-5 h-5 text-slate-500 transition-transform ${isSelected ? "rotate-90 text-emerald-400" : ""}`} />
                        </div>
                      </div>
                    );
                  })
                )}
              </div>
            </div>
          )}

          {activeTab === "trajectory" && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 space-y-6">
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                  <h3 className="text-lg font-bold text-slate-200">Capital Trajectory Simulation</h3>
                  <p className="text-xs text-slate-400">Projecting asset accumulation against deployed sovereign capital</p>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={runTrajectorySimulation}
                    disabled={isSimulating}
                    className="bg-cyan-600 hover:bg-cyan-500 disabled:bg-slate-800 text-slate-950 font-bold text-xs px-4 py-2 rounded-lg flex items-center gap-2 transition-all"
                  >
                    {isSimulating ? (
                      <RefreshCw className="w-4 h-4 animate-spin" />
                    ) : (
                      <Play className="w-4 h-4" />
                    )}
                    Simulate Next Month
                  </button>
                </div>
              </div>

              {/* CHART */}
              <div className="h-80 w-full bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={trajectory} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorDeployed" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                      </linearGradient>
                      <linearGradient id="colorAssets" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#10b981" stopOpacity={0.2}/>
                        <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                    <XAxis dataKey="month" stroke="#64748b" fontSize={11} />
                    <YAxis stroke="#64748b" fontSize={11} unit="B" />
                    <Tooltip 
                      contentStyle={{ backgroundColor: "#0f172a", borderColor: "#334155", color: "#f1f5f9" }}
                      labelStyle={{ color: "#94a3b8" }}
                    />
                    <Legend verticalAlign="top" height={36} iconType="circle" />
                    <Area 
                      type="monotone" 
                      name="Deployed Capital ($B)" 
                      dataKey="deployedCapital" 
                      stroke="#06b6d4" 
                      fillOpacity={1} 
                      fill="url(#colorDeployed)" 
                    />
                    <Area 
                      type="monotone" 
                      name="Acquired Assets ($B)" 
                      dataKey="acquiredAssets" 
                      stroke="#10b981" 
                      fillOpacity={1} 
                      fill="url(#colorAssets)" 
                    />
                  </AreaChart>
                </ResponsiveContainer>
              </div>

              {/* SIMULATION CONTROLS */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-slate-950/40 border border-slate-800/80 rounded-xl p-5">
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Sliders className="w-3.5 h-3.5 text-cyan-400" />
                      Leverage Multiplier
                    </label>
                    <span className="text-sm font-mono font-bold text-cyan-400">{leverageMultiplier}x</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="10.0"
                    step="0.5"
                    value={leverageMultiplier}
                    onChange={(e) => setLeverageMultiplier(parseFloat(e.target.value))}
                    className="w-full accent-cyan-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    Higher leverage accelerates asset acquisition but increases regulatory exposure and volatility risk.
                  </p>
                </div>

                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-3.5 h-3.5 text-emerald-400" />
                      Swarm Size (Capital Injection)
                    </label>
                    <span className="text-sm font-mono font-bold text-emerald-400">${swarmSize}B</span>
                  </div>
                  <input
                    type="range"
                    min="1.0"
                    max="20.0"
                    step="1.0"
                    value={swarmSize}
                    onChange={(e) => setSwarmSize(parseFloat(e.target.value))}
                    className="w-full accent-emerald-500 bg-slate-800 h-1.5 rounded-lg appearance-none cursor-pointer"
                  />
                  <p className="text-[11px] text-slate-500">
                    The volume of capital deployed in a single market takeover action. Larger swarms trigger faster board alignment.
                  </p>
                </div>
              </div>
            </div>
          )}

          {activeTab === "intelligence" && (
            <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6 space-y-6">
              <div>
                <h3 className="text-lg font-bold text-slate-200">Cabal Alignment & Resistance Matrix</h3>
                <p className="text-xs text-slate-400">Analyzing legacy power structures resisting sovereign integration</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {targets.map(t => (
                  <div key={t.id} className="bg-slate-950/50 border border-slate-800/80 rounded-xl p-4 space-y-3">
                    <div className="flex justify-between items-start">
                      <div>
                        <h4 className="font-bold text-slate-200 text-sm">{t.name}</h4>
                        <span className="text-[10px] text-slate-500 font-mono">{t.cabalAffiliation}</span>
                      </div>
                      <span className={`text-xs font-mono px-2 py-0.5 rounded ${
                        t.alignmentScore > 70 ? "bg-emerald-500/10 text-emerald-400" :
                        t.alignmentScore > 40 ? "bg-amber-500/10 text-amber-400" :
                        "bg-rose-500/10 text-rose-400"
                      }`}>
                        Alignment: {t.alignmentScore}%
                      </span>
                    </div>

                    <div className="space-y-1">
                      <div className="flex justify-between text-xs text-slate-400">
                        <span>Board Resistance</span>
                        <span className="font-mono">{100 - t.alignmentScore}%</span>
                      </div>
                      <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                        <div 
                          className="bg-rose-500 h-full rounded-full"
                          style={{ width: `${100 - t.alignmentScore}%` }}
                        />
                      </div>
                    </div>

                    <p className="text-xs text-slate-400 italic">
                      &ldquo;{t.description}&rdquo;
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* REAL-TIME AUDIT LOGS */}
          <div className="bg-slate-900/30 border border-slate-800 rounded-xl p-6">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-sm font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
                <FileText className="w-4 h-4 text-emerald-400" />
                Sovereign Takeover Audit Trail
              </h3>
              <span className="text-xs text-slate-500 font-mono">Real-time updates</span>
            </div>

            <div className="space-y-3 max-h-60 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-slate-800">
              {logs.map((log) => (
                <div key={log.id} className="bg-slate-950/40 border border-slate-800/60 rounded-lg p-3 text-xs space-y-1">
                  <div className="flex justify-between items-center">
                    <span className="font-semibold text-slate-300">{log.targetName}</span>
                    <span className="text-slate-500 font-mono">{log.timestamp}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-bold px-1.5 py-0.5 rounded ${
                      log.status === "SUCCESS" ? "bg-emerald-500/10 text-emerald-400" :
                      log.status === "WARNING" ? "bg-amber-500/10 text-amber-400" :
                      "bg-rose-500/10 text-rose-400"
                    }`}>
                      {log.status}
                    </span>
                    <span className="text-slate-400 font-medium">{log.action}</span>
                  </div>
                  <p className="text-slate-500 mt-1">{log.details}</p>
                </div>
              ))}
            </div>
          </div>

        </div>

        {/* RIGHT COLUMN: TARGET DETAILS & ACTIONS */}
        <div className="space-y-6">
          
          {selectedTarget ? (
            <div className="bg-slate-900/40 border border-slate-800 rounded-xl p-6 space-y-6 sticky top-6">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="text-xl font-bold text-slate-100">{selectedTarget.name}</h3>
                  <span className="text-xs font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded mt-1 inline-block">
                    {selectedTarget.ticker} • {selectedTarget.sector}
                  </span>
                </div>
                <button 
                  onClick={() => setSelectedTarget(null)}
                  className="text-slate-500 hover:text-slate-300 p-1 rounded-lg hover:bg-slate-800"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* TARGET METRICS */}
              <div className="grid grid-cols-2 gap-4 bg-slate-950/50 border border-slate-800/80 rounded-xl p-4">
                <div>
                  <span className="text-xs text-slate-500 block">Market Cap</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">${selectedTarget.marketCap}B</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Risk Profile</span>
                  <span className={`text-sm font-bold flex items-center gap-1.5 ${
                    selectedTarget.riskLevel === "Critical" ? "text-rose-500" :
                    selectedTarget.riskLevel === "High" ? "text-amber-500" :
                    selectedTarget.riskLevel === "Medium" ? "text-cyan-500" :
                    "text-emerald-500"
                  }`}>
                    <ShieldAlert className="w-4 h-4" />
                    {selectedTarget.riskLevel}
                  </span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Sovereign Stake</span>
                  <span className="text-lg font-bold text-emerald-400 font-mono">{selectedTarget.sovereignStake}%</span>
                </div>
                <div>
                  <span className="text-xs text-slate-500 block">Board Seats</span>
                  <span className="text-lg font-bold text-slate-200 font-mono">
                    {selectedTarget.boardSeatsControlled} / {selectedTarget.totalBoardSeats}
                  </span>
                </div>
              </div>

              {/* INFILTRATION PROGRESS */}
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-semibold text-slate-400">
                  <span>Infiltration Progress</span>
                  <span className="text-emerald-400 font-mono">{selectedTarget.infiltrationProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 border border-slate-800 h-3 rounded-full overflow-hidden p-0.5">
                  <div
                    className="bg-gradient-to-r from-amber-500 via-cyan-500 to-emerald-500 h-full rounded-full transition-all duration-500"
                    style={{ width: `${selectedTarget.infiltrationProgress}%` }}
                  />
                </div>
              </div>

              {/* DESCRIPTION */}
              <div className="space-y-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-500">Strategic Assessment</h4>
                <p className="text-xs text-slate-300 leading-relaxed bg-slate-950/30 border border-slate-800/50 rounded-lg p-3">
                  {selectedTarget.description}
                </p>
              </div>

              {/* ACTIONS PANEL */}
              <div className="space-y-3 pt-4 border-t border-slate-800">
                <h4 className="text-xs font-bold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                  <Sliders className="w-3.5 h-3.5 text-emerald-400" />
                  Sovereign Intervention Controls
                </h4>

                <button
                  onClick={() => handleDeploySwarm(selectedTarget.id)}
                  disabled={selectedTarget.status === "Acquired"}
                  className="w-full bg-emerald-600 hover:bg-emerald-500 disabled:bg-slate-800 disabled:text-slate-500 text-slate-950 font-bold text-xs py-3 rounded-xl flex items-center justify-center gap-2 transition-all"
                >
                  <Zap className="w-4 h-4" />
                  Deploy Liquidity Swarm (${swarmSize}B)
                </button>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    onClick={() => handleTriggerAudit(selectedTarget.id)}
                    disabled={selectedTarget.status === "Acquired"}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Scale className="w-3.5 h-3.5 text-amber-400" />
                    Trigger Audit
                  </button>

                  <button
                    onClick={() => handleExecuteTenderOffer(selectedTarget.id)}
                    disabled={selectedTarget.status === "Acquired"}
                    className="bg-slate-950 hover:bg-slate-900 border border-slate-800 text-slate-300 font-semibold text-xs py-2.5 rounded-lg flex items-center justify-center gap-1.5 transition-all"
                  >
                    <Briefcase className="w-3.5 h-3.5 text-cyan-400" />
                    Tender Offer
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slate-900/20 border border-slate-800 border-dashed rounded-xl p-8 text-center space-y-3 sticky top-6">
              <Building className="w-12 h-12 text-slate-700 mx-auto" />
              <h3 className="text-slate-300 font-bold">No Target Selected</h3>
              <p className="text-xs text-slate-500 max-w-xs mx-auto">
                Select a takeover target from the list to view strategic assessment, board control metrics, and execute sovereign interventions.
              </p>
            </div>
          )}

          {/* AI STRATEGIC DIRECTIVE */}
          <div className="bg-gradient-to-br from-slate-900 to-slate-950 border border-emerald-500/20 rounded-xl p-5 space-y-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl" />
            
            <div className="flex items-center gap-2">
              <div className="p-1.5 bg-emerald-500/10 rounded-lg text-emerald-400 border border-emerald-500/20">
                <Activity className="w-4 h-4" />
              </div>
              <h4 className="text-xs font-bold uppercase tracking-wider text-slate-300">AI Strategic Directive</h4>
            </div>

            <div className="space-y-3 text-xs">
              <p className="text-slate-300 leading-relaxed">
                &ldquo;Stealth accumulation of <strong className="text-emerald-400">Veritas BioTech (VRTS)</strong> is highly recommended. Legacy board members are currently distracted by a secondary proxy fight in the energy sector. Deploying a <strong className="text-cyan-400">$5B liquidity swarm</strong> now will secure key board seats before the next shareholder meeting.&rdquo;
              </p>
              
              <div className="flex items-center gap-2 text-[10px] text-slate-500 bg-slate-950/50 p-2 rounded border border-slate-800/50">
                <Info className="w-3.5 h-3.5 text-cyan-400 shrink-0" />
                <span>Confidence Score: <strong className="text-emerald-400">94.8%</strong> • Projected Takeover Speed: <strong className="text-slate-300">Fast</strong></span>
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
}