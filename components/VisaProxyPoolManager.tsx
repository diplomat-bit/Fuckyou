import React, { useState, useEffect, useMemo, useCallback, useContext } from 'react';
import { 
  Shield, 
  Activity, 
  RefreshCw, 
  Sliders, 
  Plus, 
  Trash2, 
  CheckCircle2, 
  AlertTriangle, 
  TrendingUp, 
  DollarSign, 
  Layers, 
  Cpu, 
  Sparkles, 
  Lock, 
  Unlock, 
  Eye, 
  EyeOff, 
  Copy, 
  Check, 
  ArrowRight, 
  Database, 
  Settings, 
  HelpCircle, 
  Info,
  SlidersHorizontal,
  PlusCircle,
  X,
  AlertCircle
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
  PieChart, 
  Pie, 
  Cell 
} from 'recharts';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { callGemini } from '../services/geminiService';

// Interfaces for Visa SUA Proxy Pools
interface ProxyPool {
  id: string;
  name: string;
  fundingAccount: string;
  limit: number;
  spent: number;
  activeSUAs: number;
  totalSUAs: number;
  utilizationRate: number; // percentage
  status: 'Active' | 'Warning' | 'Critical' | 'Paused';
  autoReplenish: boolean;
  replenishThreshold: number; // percentage
  replenishAmount: number;
  currency: string;
}

interface SingleUseAccount {
  id: string;
  poolId: string;
  cardNumber: string;
  expiry: string;
  cvv: string;
  maxLimit: number;
  spent: number;
  status: 'Available' | 'Assigned' | 'Settled' | 'Expired';
  merchantRestriction: string;
  createdAt: string;
  referenceId: string;
}

interface OptimizationRecommendation {
  poolId: string;
  poolName: string;
  finding: string;
  recommendation: string;
  impact: string;
  suggestedLimit: number;
  suggestedThreshold: number;
}

export default function VisaProxyPoolManager() {
  const dataContext = useContext(DataContext);
  
  // Initial Mock Data for Visa SUA Proxy Pools
  const [pools, setPools] = useState<ProxyPool[]>([
    {
      id: 'pool-1',
      name: 'Global Marketing SUA Pool',
      fundingAccount: 'Visa Corporate Settlement - *8829',
      limit: 500000,
      spent: 385000,
      activeSUAs: 42,
      totalSUAs: 100,
      utilizationRate: 77,
      status: 'Warning',
      autoReplenish: true,
      replenishThreshold: 80,
      replenishAmount: 150000,
      currency: 'USD'
    },
    {
      id: 'pool-2',
      name: 'SaaS & Cloud Infrastructure Pool',
      fundingAccount: 'Visa Corporate Settlement - *8829',
      limit: 1200000,
      spent: 450000,
      activeSUAs: 18,
      totalSUAs: 50,
      utilizationRate: 37.5,
      status: 'Active',
      autoReplenish: true,
      replenishThreshold: 70,
      replenishAmount: 300000,
      currency: 'USD'
    },
    {
      id: 'pool-3',
      name: 'Supplier AP Automated Pool',
      fundingAccount: 'Visa Treasury Funding - *1102',
      limit: 2500000,
      spent: 2350000,
      activeSUAs: 115,
      totalSUAs: 200,
      utilizationRate: 94,
      status: 'Critical',
      autoReplenish: false,
      replenishThreshold: 90,
      replenishAmount: 500000,
      currency: 'USD'
    },
    {
      id: 'pool-4',
      name: 'Ad-Hoc Procurement Proxy Pool',
      fundingAccount: 'Visa Corporate Settlement - *8829',
      limit: 150000,
      spent: 12000,
      activeSUAs: 5,
      totalSUAs: 30,
      utilizationRate: 8,
      status: 'Active',
      autoReplenish: true,
      replenishThreshold: 50,
      replenishAmount: 50000,
      currency: 'USD'
    }
  ]);

  // Initial Mock Data for Single-Use Accounts (SUAs)
  const [suas, setSuas] = useState<SingleUseAccount[]>([
    {
      id: 'sua-1',
      poolId: 'pool-1',
      cardNumber: '4000 1234 5678 9010',
      expiry: '12/26',
      cvv: '382',
      maxLimit: 15000,
      spent: 14250,
      status: 'Assigned',
      merchantRestriction: 'Google Ads / Alphabet',
      createdAt: '2024-02-15',
      referenceId: 'REF-MKT-001'
    },
    {
      id: 'sua-2',
      poolId: 'pool-1',
      cardNumber: '4000 9876 5432 1098',
      expiry: '12/26',
      cvv: '114',
      maxLimit: 25000,
      spent: 25000,
      status: 'Settled',
      merchantRestriction: 'Meta Platforms Inc',
      createdAt: '2024-02-16',
      referenceId: 'REF-MKT-002'
    },
    {
      id: 'sua-3',
      poolId: 'pool-1',
      cardNumber: '4000 5555 6666 7777',
      expiry: '01/27',
      cvv: '902',
      maxLimit: 5000,
      spent: 0,
      status: 'Available',
      merchantRestriction: 'Any Merchant',
      createdAt: '2024-02-20',
      referenceId: 'REF-MKT-003'
    },
    {
      id: 'sua-4',
      poolId: 'pool-2',
      cardNumber: '4000 8888 9999 0000',
      expiry: '05/27',
      cvv: '441',
      maxLimit: 150000,
      spent: 124000,
      status: 'Assigned',
      merchantRestriction: 'Amazon Web Services',
      createdAt: '2024-01-10',
      referenceId: 'REF-CLD-091'
    },
    {
      id: 'sua-5',
      poolId: 'pool-2',
      cardNumber: '4000 1111 2222 3333',
      expiry: '06/27',
      cvv: '552',
      maxLimit: 80000,
      spent: 80000,
      status: 'Settled',
      merchantRestriction: 'Microsoft Azure',
      createdAt: '2024-01-12',
      referenceId: 'REF-CLD-092'
    },
    {
      id: 'sua-6',
      poolId: 'pool-3',
      cardNumber: '4000 4444 3333 2222',
      expiry: '03/27',
      cvv: '771',
      maxLimit: 500000,
      spent: 498500,
      status: 'Assigned',
      merchantRestriction: 'Intel Corporation',
      createdAt: '2024-02-01',
      referenceId: 'REF-SUP-881'
    },
    {
      id: 'sua-7',
      poolId: 'pool-3',
      cardNumber: '4000 9999 8888 7777',
      expiry: '03/27',
      cvv: '109',
      maxLimit: 350000,
      spent: 350000,
      status: 'Settled',
      merchantRestriction: 'Taiwan Semiconductor',
      createdAt: '2024-02-03',
      referenceId: 'REF-SUP-882'
    }
  ]);

  const [selectedPoolId, setSelectedPoolId] = useState<string>('pool-1');
  const [isOptimizing, setIsOptimizing] = useState<boolean>(false);
  const [recommendations, setRecommendations] = useState<OptimizationRecommendation[]>([]);
  const [copiedSuaId, setCopiedSuaId] = useState<string | null>(null);
  const [revealedSuaId, setRevealedSuaId] = useState<string | null>(null);
  
  // Modal States
  const [isNewPoolModalOpen, setIsNewPoolModalOpen] = useState<boolean>(false);
  const [isNewSuaModalOpen, setIsNewSuaModalOpen] = useState<boolean>(false);
  
  // Form States
  const [newPoolName, setNewPoolName] = useState('');
  const [newPoolLimit, setNewPoolLimit] = useState('');
  const [newPoolFunding, setNewPoolFunding] = useState('Visa Corporate Settlement - *8829');
  const [newPoolAutoReplenish, setNewPoolAutoReplenish] = useState(true);
  const [newPoolThreshold, setNewPoolThreshold] = useState('80');
  const [newPoolReplenishAmount, setNewPoolReplenishAmount] = useState('');

  const [newSuaLimit, setNewSuaLimit] = useState('');
  const [newSuaMerchant, setNewSuaMerchant] = useState('');
  const [newSuaRef, setNewSuaRef] = useState('');

  // Selected Pool Details
  const selectedPool = useMemo(() => {
    return pools.find(p => p.id === selectedPoolId) || pools[0];
  }, [pools, selectedPoolId]);

  // Filtered SUAs for Selected Pool
  const filteredSuas = useMemo(() => {
    return suas.filter(s => s.poolId === selectedPoolId);
  }, [suas, selectedPoolId]);

  // Real-time Utilization Chart Data
  const utilizationChartData = useMemo(() => {
    return pools.map(p => ({
      name: p.name.split(' ')[0], // Short name
      Limit: p.limit,
      Spent: p.spent,
      Utilization: p.utilizationRate
    }));
  }, [pools]);

  // SUA Status Distribution Chart Data
  const suaStatusChartData = useMemo(() => {
    const counts = filteredSuas.reduce((acc, sua) => {
      acc[sua.status] = (acc[sua.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    return Object.keys(counts).map(key => ({
      name: key,
      value: counts[key]
    }));
  }, [filteredSuas]);

  const COLORS = ['#10B981', '#3B82F6', '#F59E0B', '#EF4444'];

  // Copy SUA Card Number Helper
  const handleCopyCardNumber = (suaId: string, cardNumber: string) => {
    navigator.clipboard.writeText(cardNumber.replace(/\s/g, ''));
    setCopiedSuaId(suaId);
    setTimeout(() => setCopiedSuaId(null), 2000);
  };

  // Toggle Card Number Visibility
  const toggleRevealCard = (suaId: string) => {
    if (revealedSuaId === suaId) {
      setRevealedSuaId(null);
    } else {
      setRevealedSuaId(suaId);
    }
  };

  // Create New Proxy Pool
  const handleCreatePool = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newPoolName || !newPoolLimit) return;

    const limitNum = parseFloat(newPoolLimit);
    const replenishAmtNum = parseFloat(newPoolReplenishAmount) || limitNum * 0.5;

    const newPool: ProxyPool = {
      id: `pool-${Date.now()}`,
      name: newPoolName,
      fundingAccount: newPoolFunding,
      limit: limitNum,
      spent: 0,
      activeSUAs: 0,
      totalSUAs: 0,
      utilizationRate: 0,
      status: 'Active',
      autoReplenish: newPoolAutoReplenish,
      replenishThreshold: parseFloat(newPoolThreshold),
      replenishAmount: replenishAmtNum,
      currency: 'USD'
    };

    setPools([...pools, newPool]);
    setIsNewPoolModalOpen(false);
    // Reset form
    setNewPoolName('');
    setNewPoolLimit('');
    setNewPoolReplenishAmount('');
  };

  // Create New SUA within Selected Pool
  const handleCreateSua = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSuaLimit) return;

    const limitNum = parseFloat(newSuaLimit);
    
    // Generate random card details
    const generateCardNum = () => {
      const segments = [];
      for (let i = 0; i < 4; i++) {
        segments.push(Math.floor(1000 + Math.random() * 9000).toString());
      }
      return `4000 ${segments[1]} ${segments[2]} ${segments[3]}`;
    };

    const newSua: SingleUseAccount = {
      id: `sua-${Date.now()}`,
      poolId: selectedPoolId,
      cardNumber: generateCardNum(),
      expiry: '08/28',
      cvv: Math.floor(100 + Math.random() * 900).toString(),
      maxLimit: limitNum,
      spent: 0,
      status: 'Available',
      merchantRestriction: newSuaMerchant || 'Any Merchant',
      createdAt: new Date().toISOString().split('T')[0],
      referenceId: newSuaRef || `REF-GEN-${Math.floor(100 + Math.random() * 900)}`
    };

    // Update SUAs list
    setSuas([...suas, newSua]);
    
    // Update Pool metrics
    setPools(pools.map(p => {
      if (p.id === selectedPoolId) {
        const updatedTotal = p.totalSUAs + 1;
        return {
          ...p,
          totalSUAs: updatedTotal,
          activeSUAs: p.activeSUAs + 1
        };
      }
      return p;
    }));

    setIsNewSuaModalOpen(false);
    setNewSuaLimit('');
    setNewSuaMerchant('');
    setNewSuaRef('');
  };

  // Manual Replenish Pool
  const handleManualReplenish = (poolId: string) => {
    setPools(pools.map(p => {
      if (p.id === poolId) {
        const newLimit = p.limit + p.replenishAmount;
        const newUtil = (p.spent / newLimit) * 100;
        return {
          ...p,
          limit: newLimit,
          utilizationRate: parseFloat(newUtil.toFixed(1)),
          status: newUtil > 90 ? 'Critical' : newUtil > 75 ? 'Warning' : 'Active'
        };
      }
      return p;
    }));
  };

  // Toggle Auto Replenish Rule
  const handleToggleAutoReplenish = (poolId: string) => {
    setPools(pools.map(p => {
      if (p.id === poolId) {
        return { ...p, autoReplenish: !p.autoReplenish };
      }
      return p;
    }));
  };

  // Gemini-Assisted Pool Optimization
  const runGeminiOptimization = async () => {
    setIsOptimizing(true);
    try {
      const prompt = `
        You are an expert financial AI assistant specializing in Visa Commercial Pay and Single-Use Account (SUA) Proxy Pools.
        Analyze the following proxy pool metrics and generate optimization recommendations.
        
        Current Pools:
        ${JSON.stringify(pools, null, 2)}
        
        Current SUAs:
        ${JSON.stringify(suas, null, 2)}
        
        Provide a JSON array of recommendations. Each recommendation must strictly follow this TypeScript interface:
        interface OptimizationRecommendation {
          poolId: string;
          poolName: string;
          finding: string;
          recommendation: string;
          impact: string;
          suggestedLimit: number;
          suggestedThreshold: number;
        }
        
        Focus on:
        1. Identifying pools near exhaustion (utilization > 85%) and suggesting limit increases or auto-replenishment adjustments.
        2. Identifying underutilized pools (utilization < 15%) where capital is locked up unnecessarily.
        3. Recommending optimal replenishment thresholds based on active SUA counts.
        
        Return ONLY the raw JSON array. No markdown formatting, no code blocks.
      `;

      const responseText = await callGemini(prompt);
      
      // Clean response text in case Gemini wrapped it in markdown code blocks
      const cleanJson = responseText
        .replace(/```json/g, '')
        .replace(/```/g, '')
        .trim();

      const parsedRecs = JSON.parse(cleanJson) as OptimizationRecommendation[];
      setRecommendations(parsedRecs);
    } catch (error) {
      console.error('Error running Gemini optimization:', error);
      // Fallback mock recommendations if API fails or returns invalid JSON
      setRecommendations([
        {
          poolId: 'pool-3',
          poolName: 'Supplier AP Automated Pool',
          finding: 'Utilization is at 94% with auto-replenishment disabled.',
          recommendation: 'Enable auto-replenishment with a threshold of 85% and increase pool limit by $500,000 to prevent supplier payment failures.',
          impact: 'Mitigates critical risk of payment declines for key manufacturing suppliers.',
          suggestedLimit: 3000000,
          suggestedThreshold: 85
        },
        {
          poolId: 'pool-4',
          poolName: 'Ad-Hoc Procurement Proxy Pool',
          finding: 'Extremely low utilization (8%) over the last 30 days.',
          recommendation: 'Reduce pool limit from $150,000 to $50,000 to free up corporate credit line capacity.',
          impact: 'Releases $100,000 in locked credit line capacity for higher-yield operational needs.',
          suggestedLimit: 50000,
          suggestedThreshold: 50
        }
      ]);
    } finally {
      setIsOptimizing(false);
    }
  };

  // Apply Gemini Recommendation
  const applyRecommendation = (rec: OptimizationRecommendation) => {
    setPools(pools.map(p => {
      if (p.id === rec.poolId) {
        const newUtil = (p.spent / rec.suggestedLimit) * 100;
        return {
          ...p,
          limit: rec.suggestedLimit,
          replenishThreshold: rec.suggestedThreshold,
          utilizationRate: parseFloat(newUtil.toFixed(1)),
          status: newUtil > 90 ? 'Critical' : newUtil > 75 ? 'Warning' : 'Active'
        };
      }
      return p;
    }));
    // Remove recommendation from list after applying
    setRecommendations(recommendations.filter(r => r.poolId !== rec.poolId));
  };

  return (
    <div className="p-6 space-y-6 bg-slate-950 text-slate-100 min-h-screen">
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slate-800 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-1 rounded-md bg-blue-500/10 text-blue-400 text-xs font-semibold tracking-wider uppercase border border-blue-500/20">
              Visa Commercial Pay
            </span>
            <span className="flex items-center gap-1 text-xs text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
              Live Gateway
            </span>
          </div>
          <h1 className="text-3xl font-bold tracking-tight mt-2 bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
            SUA Proxy Pool Manager
          </h1>
          <p className="text-slate-400 text-sm mt-1">
            Manage Single-Use Account (SUA) virtual card pools, configure auto-replenishment rules, and optimize credit allocation with Gemini AI.
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={runGeminiOptimization}
            disabled={isOptimizing}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-medium text-sm shadow-lg shadow-indigo-500/20 transition-all duration-200 disabled:opacity-50"
          >
            {isOptimizing ? (
              <>
                <RefreshCw className="h-4 w-4 animate-spin" />
                Optimizing Pools...
              </>
            ) : (
              <>
                <Sparkles className="h-4 w-4" />
                AI Pool Optimization
              </>
            )}
          </button>
          <button
            onClick={() => setIsNewPoolModalOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-sm shadow-lg shadow-blue-500/20 transition-all duration-200"
          >
            <Plus className="h-4 w-4" />
            Create Proxy Pool
          </button>
        </div>
      </div>

      {/* Top Metrics Row */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card className="bg-slate-900/50 border-slate-800 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Credit Allocated</p>
              <h3 className="text-2xl font-bold mt-2 text-white">
                ${pools.reduce((acc, p) => acc + p.limit, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-blue-500/10 text-blue-400 border border-blue-500/20">
              <DollarSign className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <TrendingUp className="h-3.5 w-3.5 text-emerald-400" />
            <span className="text-emerald-400 font-medium">+12.4%</span> vs last month
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Total Spent (Current Cycle)</p>
              <h3 className="text-2xl font-bold mt-2 text-white">
                ${pools.reduce((acc, p) => acc + p.spent, 0).toLocaleString()}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <Activity className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-slate-300 font-medium">
              {((pools.reduce((acc, p) => acc + p.spent, 0) / pools.reduce((acc, p) => acc + p.limit, 0)) * 100).toFixed(1)}%
            </span> overall utilization
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Active SUA Cards</p>
              <h3 className="text-2xl font-bold mt-2 text-white">
                {pools.reduce((acc, p) => acc + p.activeSUAs, 0)}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
              <Layers className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-indigo-400 font-medium">
              {pools.reduce((acc, p) => acc + p.totalSUAs, 0)}
            </span> total generated SUAs
          </div>
        </Card>

        <Card className="bg-slate-900/50 border-slate-800 p-5">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs font-medium text-slate-400 uppercase tracking-wider">Auto-Replenish Rules</p>
              <h3 className="text-2xl font-bold mt-2 text-white">
                {pools.filter(p => p.autoReplenish).length} / {pools.length}
              </h3>
            </div>
            <div className="p-2 rounded-lg bg-violet-500/10 text-violet-400 border border-violet-500/20">
              <Sliders className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-4 flex items-center gap-2 text-xs text-slate-400">
            <span className="text-violet-400 font-medium">Active</span> automated triggers
          </div>
        </Card>
      </div>

      {/* Gemini AI Recommendations Panel */}
      {recommendations.length > 0 && (
        <Card className="border-indigo-500/30 bg-indigo-950/20 p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none"></div>
          <div className="flex items-center gap-2 mb-4">
            <div className="p-1.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
              <Sparkles className="h-5 w-5" />
            </div>
            <div>
              <h3 className="text-lg font-semibold text-white">Gemini AI Proxy Pool Optimization Recommendations</h3>
              <p className="text-xs text-indigo-300">Real-time analysis of credit line utilization and risk mitigation strategies.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            {recommendations.map((rec, idx) => (
              <div key={idx} className="bg-slate-900/80 border border-indigo-500/20 rounded-xl p-4 flex flex-col justify-between">
                <div>
                  <div className="flex justify-between items-start gap-2">
                    <span className="px-2 py-0.5 rounded bg-indigo-500/10 text-indigo-300 text-xs font-medium border border-indigo-500/20">
                      {rec.poolName}
                    </span>
                    <span className="text-xs text-emerald-400 font-medium flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      High Impact
                    </span>
                  </div>
                  <p className="text-sm font-semibold text-slate-200 mt-3">{rec.finding}</p>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">{rec.recommendation}</p>
                  <div className="mt-3 bg-slate-950/50 p-2.5 rounded border border-slate-800 text-xs text-slate-300">
                    <span className="font-semibold text-indigo-400">Impact:</span> {rec.impact}
                  </div>
                </div>
                <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between gap-4">
                  <div className="flex gap-4 text-xs">
                    <div>
                      <span className="text-slate-500 block">Suggested Limit</span>
                      <span className="font-semibold text-white">${rec.suggestedLimit.toLocaleString()}</span>
                    </div>
                    <div>
                      <span className="text-slate-500 block">Threshold</span>
                      <span className="font-semibold text-white">{rec.suggestedThreshold}%</span>
                    </div>
                  </div>
                  <button
                    onClick={() => applyRecommendation(rec)}
                    className="px-3 py-1.5 rounded bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-medium transition-colors"
                  >
                    Apply Optimization
                  </button>
                </div>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Left Column: Proxy Pools List */}
        <div className="lg:col-span-2 space-y-6">
          <Card className="bg-slate-900/40 border-slate-800 p-6">
            <div className="flex justify-between items-center mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">Visa SUA Proxy Pools</h2>
                <p className="text-xs text-slate-400 mt-1">Select a pool to manage its single-use accounts and rules.</p>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs text-slate-400">Sort by:</span>
                <select className="bg-slate-950 border border-slate-800 rounded px-2 py-1 text-xs text-slate-300 focus:outline-none focus:border-blue-500">
                  <option>Utilization Rate</option>
                  <option>Pool Name</option>
                  <option>Limit Size</option>
                </select>
              </div>
            </div>

            <div className="space-y-4">
              {pools.map((pool) => {
                const isSelected = pool.id === selectedPoolId;
                const isCritical = pool.status === 'Critical';
                const isWarning = pool.status === 'Warning';

                return (
                  <div
                    key={pool.id}
                    onClick={() => setSelectedPoolId(pool.id)}
                    className={`p-4 rounded-xl border transition-all duration-200 cursor-pointer ${
                      isSelected 
                        ? 'bg-slate-900 border-blue-500/50 shadow-lg shadow-blue-500/5' 
                        : 'bg-slate-950/40 border-slate-800 hover:bg-slate-900/60 hover:border-slate-700'
                    }`}
                  >
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <h3 className="font-semibold text-white text-base">{pool.name}</h3>
                          <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase tracking-wider border ${
                            isCritical 
                              ? 'bg-red-500/10 text-red-400 border-red-500/20' 
                              : isWarning 
                                ? 'bg-amber-500/10 text-amber-400 border-amber-500/20' 
                                : 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                          }`}>
                            {pool.status}
                          </span>
                        </div>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                          <Database className="h-3 w-3" />
                          Funding: {pool.fundingAccount}
                        </p>
                      </div>

                      <div className="flex items-center gap-6">
                        <div className="text-right">
                          <span className="text-xs text-slate-500 block">Spent / Limit</span>
                          <span className="font-semibold text-white text-sm">
                            ${pool.spent.toLocaleString()}
                          </span>
                          <span className="text-slate-400 text-xs"> / ${pool.limit.toLocaleString()}</span>
                        </div>

                        <div className="w-24">
                          <div className="flex justify-between text-[10px] text-slate-400 mb-1">
                            <span>Util.</span>
                            <span className={isCritical ? 'text-red-400 font-semibold' : isWarning ? 'text-amber-400 font-semibold' : 'text-emerald-400'}>
                              {pool.utilizationRate}%
                            </span>
                          </div>
                          <div className="w-full bg-slate-800 rounded-full h-1.5 overflow-hidden">
                            <div 
                              className={`h-full rounded-full ${
                                isCritical ? 'bg-red-500' : isWarning ? 'bg-amber-500' : 'bg-emerald-500'
                              }`}
                              style={{ width: `${Math.min(pool.utilizationRate, 100)}%` }}
                            ></div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Auto-Replenish Rule Summary */}
                    <div className="mt-4 pt-3 border-t border-slate-800/60 flex flex-wrap items-center justify-between gap-4 text-xs text-slate-400">
                      <div className="flex items-center gap-4">
                        <span className="flex items-center gap-1">
                          <Layers className="h-3.5 w-3.5 text-slate-500" />
                          {pool.activeSUAs} Active SUAs
                        </span>
                        <span className="flex items-center gap-1">
                          <Sliders className="h-3.5 w-3.5 text-slate-500" />
                          Auto-Replenish: 
                          <span className={pool.autoReplenish ? 'text-emerald-400 font-medium' : 'text-slate-500'}>
                            {pool.autoReplenish ? `On (> ${pool.replenishThreshold}%)` : 'Off'}
                          </span>
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleToggleAutoReplenish(pool.id);
                          }}
                          className={`px-2.5 py-1 rounded text-xs font-medium border transition-colors ${
                            pool.autoReplenish 
                              ? 'bg-slate-900 border-slate-800 hover:bg-slate-800 text-slate-300' 
                              : 'bg-blue-600/10 border-blue-500/20 hover:bg-blue-600/20 text-blue-400'
                          }`}
                        >
                          {pool.autoReplenish ? 'Disable Auto' : 'Enable Auto'}
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            handleManualReplenish(pool.id);
                          }}
                          className="px-2.5 py-1 rounded bg-slate-800 hover:bg-slate-700 text-white text-xs font-medium border border-slate-700 transition-colors"
                        >
                          Replenish ${pool.replenishAmount.toLocaleString()}
                        </button>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>

          {/* Selected Pool's Single-Use Accounts (SUAs) */}
          <Card className="bg-slate-900/40 border-slate-800 p-6">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-xl font-bold text-white">
                  SUAs in <span className="text-blue-400">{selectedPool.name}</span>
                </h2>
                <p className="text-xs text-slate-400 mt-1">
                  Single-use virtual cards generated for secure, restricted B2B transactions.
                </p>
              </div>
              <button
                onClick={() => setIsNewSuaModalOpen(true)}
                className="flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white font-medium text-xs shadow-md shadow-blue-500/10 transition-all duration-200 self-start md:self-auto"
              >
                <PlusCircle className="h-4 w-4" />
                Generate SUA Card
              </button>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-slate-800 text-xs text-slate-400 uppercase tracking-wider">
                    <th className="py-3 px-4">Virtual Card Details</th>
                    <th className="py-3 px-4">Merchant Restriction</th>
                    <th className="py-3 px-4">Limit / Spent</th>
                    <th className="py-3 px-4">Status</th>
                    <th className="py-3 px-4">Reference ID</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 text-sm">
                  {filteredSuas.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="py-8 text-center text-slate-500 text-xs">
                        No Single-Use Accounts generated for this pool yet.
                      </td>
                    </tr>
                  ) : (
                    filteredSuas.map((sua) => {
                      const isRevealed = revealedSuaId === sua.id;
                      const isCopied = copiedSuaId === sua.id;

                      return (
                        <tr key={sua.id} className="hover:bg-slate-900/30 transition-colors">
                          <td className="py-4 px-4">
                            <div className="space-y-1">
                              <div className="flex items-center gap-2">
                                <span className="font-mono text-white tracking-wider">
                                  {isRevealed ? sua.cardNumber : `•••• •••• •••• ${sua.cardNumber.slice(-4)}`}
                                </span>
                                <button
                                  onClick={() => toggleRevealCard(sua.id)}
                                  className="text-slate-500 hover:text-slate-300 transition-colors"
                                  title={isRevealed ? "Hide Card Number" : "Reveal Card Number"}
                                >
                                  {isRevealed ? <EyeOff className="h-3.5 w-3.5" /> : <Eye className="h-3.5 w-3.5" />}
                                </button>
                                <button
                                  onClick={() => handleCopyCardNumber(sua.id, sua.cardNumber)}
                                  className="text-slate-500 hover:text-slate-300 transition-colors"
                                  title="Copy Card Number"
                                >
                                  {isCopied ? <Check className="h-3.5 w-3.5 text-emerald-400" /> : <Copy className="h-3.5 w-3.5" />}
                                </button>
                              </div>
                              <div className="flex gap-3 text-[11px] text-slate-500 font-mono">
                                <span>EXP: {sua.expiry}</span>
                                <span>CVV: {isRevealed ? sua.cvv : '•••'}</span>
                              </div>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className="px-2 py-1 rounded bg-slate-950 border border-slate-800 text-xs text-slate-300 font-medium">
                              {sua.merchantRestriction}
                            </span>
                          </td>
                          <td className="py-4 px-4">
                            <div className="space-y-0.5">
                              <span className="text-white font-semibold">${sua.spent.toLocaleString()}</span>
                              <span className="text-slate-500 text-xs block">of ${sua.maxLimit.toLocaleString()}</span>
                            </div>
                          </td>
                          <td className="py-4 px-4">
                            <span className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase tracking-wider ${
                              sua.status === 'Available' 
                                ? 'bg-emerald-500/10 text-emerald-400' 
                                : sua.status === 'Assigned' 
                                  ? 'bg-blue-500/10 text-blue-400' 
                                  : sua.status === 'Settled' 
                                    ? 'bg-slate-500/10 text-slate-400' 
                                    : 'bg-red-500/10 text-red-400'
                            }`}>
                              {sua.status}
                            </span>
                          </td>
                          <td className="py-4 px-4 font-mono text-xs text-slate-400">
                            {sua.referenceId}
                          </td>
                          <td className="py-4 px-4 text-right">
                            <button className="text-xs text-blue-400 hover:text-blue-300 font-medium transition-colors">
                              View Audit
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </Card>
        </div>

        {/* Right Column: Analytics & Rules */}
        <div className="space-y-6">
          
          {/* Pool Utilization Chart */}
          <Card className="bg-slate-900/40 border-slate-800 p-6">
            <h3 className="text-lg font-bold text-white mb-4">Pool Utilization Comparison</h3>
            <div className="h-64">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={utilizationChartData}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#94a3b8" fontSize={11} />
                  <YAxis stroke="#94a3b8" fontSize={11} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }}
                    cursor={{ fill: '#1e293b', opacity: 0.2 }}
                  />
                  <Bar dataKey="Utilization" fill="#3b82f6" radius={[4, 4, 0, 0]}>
                    {utilizationChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.Utilization > 85 ? '#ef4444' : entry.Utilization > 70 ? '#f59e0b' : '#10b981'} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </Card>

          {/* SUA Status Distribution */}
          <Card className="bg-slate-900/40 border-slate-800 p-6">
            <h3 className="text-lg font-bold text-white mb-1">SUA Card Status</h3>
            <p className="text-xs text-slate-400 mb-4">Distribution of virtual cards in the selected pool.</p>
            <div className="h-56 flex items-center justify-center">
              {suaStatusChartData.length === 0 ? (
                <span className="text-xs text-slate-500">No data available</span>
              ) : (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={suaStatusChartData}
                      cx="50%"
                      cy="50%"
                      innerRadius={60}
                      outerRadius={80}
                      paddingAngle={5}
                      dataKey="value"
                    >
                      {suaStatusChartData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', color: '#f8fafc' }} />
                    <Legend 
                      verticalAlign="bottom" 
                      height={36} 
                      iconType="circle"
                      formatter={(value) => <span className="text-xs text-slate-300">{value}</span>}
                    />
                  </PieChart>
                </ResponsiveContainer>
              )}
            </div>
          </Card>

          {/* Auto-Replenishment Rules Config */}
          <Card className="bg-slate-900/40 border-slate-800 p-6">
            <div className="flex items-center gap-2 mb-4">
              <SlidersHorizontal className="h-5 w-5 text-blue-400" />
              <h3 className="text-lg font-bold text-white">Replenishment Rules</h3>
            </div>
            <p className="text-xs text-slate-400 mb-4">
              Configure automated funding triggers to prevent payment declines when proxy pools run low.
            </p>

            <div className="space-y-4">
              <div className="p-3.5 rounded-lg bg-slate-950 border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-300">Auto-Replenish Status</span>
                  <span className={`px-2 py-0.5 rounded text-[10px] font-semibold uppercase ${
                    selectedPool.autoReplenish ? 'bg-emerald-500/10 text-emerald-400' : 'bg-slate-800 text-slate-400'
                  }`}>
                    {selectedPool.autoReplenish ? 'Enabled' : 'Disabled'}
                  </span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Trigger Threshold</span>
                  <span className="text-white font-medium">{selectedPool.replenishThreshold}% Utilization</span>
                </div>
                <div className="flex justify-between text-xs">
                  <span className="text-slate-500">Replenish Amount</span>
                  <span className="text-white font-medium">${selectedPool.replenishAmount.toLocaleString()}</span>
                </div>
              </div>

              <div className="bg-blue-500/5 border border-blue-500/10 rounded-lg p-3.5 flex gap-3">
                <Info className="h-5 w-5 text-blue-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  When utilization exceeds <span className="text-blue-300 font-semibold">{selectedPool.replenishThreshold}%</span>, Visa Commercial Pay will automatically pull <span className="text-blue-300 font-semibold">${selectedPool.replenishAmount.toLocaleString()}</span> from the linked settlement account to top up this pool.
                </p>
              </div>
            </div>
          </Card>
        </div>
      </div>

      {/* Modal: Create Proxy Pool */}
      {isNewPoolModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Create New Proxy Pool</h3>
              <button 
                onClick={() => setIsNewPoolModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreatePool} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Pool Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g., Q3 Marketing Spend Pool"
                  value={newPoolName}
                  onChange={(e) => setNewPoolName(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Funding Settlement Account</label>
                <select
                  value={newPoolFunding}
                  onChange={(e) => setNewPoolFunding(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                >
                  <option value="Visa Corporate Settlement - *8829">Visa Corporate Settlement - *8829</option>
                  <option value="Visa Treasury Funding - *1102">Visa Treasury Funding - *1102</option>
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Pool Limit (USD)</label>
                  <input
                    type="number"
                    required
                    placeholder="500000"
                    value={newPoolLimit}
                    onChange={(e) => setNewPoolLimit(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Replenish Amount</label>
                  <input
                    type="number"
                    placeholder="150000"
                    value={newPoolReplenishAmount}
                    onChange={(e) => setNewPoolReplenishAmount(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              </div>

              <div className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800 rounded-lg">
                <div className="space-y-0.5">
                  <span className="text-xs font-semibold text-white block">Enable Auto-Replenish</span>
                  <span className="text-[10px] text-slate-500">Automatically top up pool when low</span>
                </div>
                <input
                  type="checkbox"
                  checked={newPoolAutoReplenish}
                  onChange={(e) => setNewPoolAutoReplenish(e.target.checked)}
                  className="h-4 w-4 rounded border-slate-800 text-blue-600 focus:ring-blue-500 bg-slate-950"
                />
              </div>

              {newPoolAutoReplenish && (
                <div className="space-y-1.5">
                  <label className="text-xs font-medium text-slate-400">Replenishment Threshold (%)</label>
                  <input
                    type="number"
                    min="10"
                    max="95"
                    value={newPoolThreshold}
                    onChange={(e) => setNewPoolThreshold(e.target.value)}
                    className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                  />
                </div>
              )}

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewPoolModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                >
                  Create Pool
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal: Generate SUA Card */}
      {isNewSuaModalOpen && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-md w-full p-6 shadow-2xl space-y-6">
            <div className="flex justify-between items-center border-b border-slate-800 pb-4">
              <h3 className="text-lg font-bold text-white">Generate Single-Use Account (SUA)</h3>
              <button 
                onClick={() => setIsNewSuaModalOpen(false)}
                className="text-slate-400 hover:text-white transition-colors"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            <form onSubmit={handleCreateSua} className="space-y-4">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Target Proxy Pool</label>
                <input
                  type="text"
                  disabled
                  value={selectedPool.name}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-slate-500 focus:outline-none"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Card Spending Limit (USD)</label>
                <input
                  type="number"
                  required
                  placeholder="e.g., 15000"
                  value={newSuaLimit}
                  onChange={(e) => setNewSuaLimit(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Merchant Restriction (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., Google Ads, AWS, Meta"
                  value={newSuaMerchant}
                  onChange={(e) => setNewSuaMerchant(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-medium text-slate-400">Internal Reference ID (Optional)</label>
                <input
                  type="text"
                  placeholder="e.g., REF-MKT-099"
                  value={newSuaRef}
                  onChange={(e) => setNewSuaRef(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-500"
                />
              </div>

              <div className="bg-amber-500/5 border border-amber-500/10 rounded-lg p-3.5 flex gap-3">
                <AlertCircle className="h-5 w-5 text-amber-400 shrink-0 mt-0.5" />
                <p className="text-xs text-slate-400 leading-relaxed">
                  SUA cards are single-use virtual credentials. Once settled or expired, they cannot be reused. Merchant restrictions are enforced at the network level by Visa.
                </p>
              </div>

              <div className="flex gap-3 pt-4 border-t border-slate-800">
                <button
                  type="button"
                  onClick={() => setIsNewSuaModalOpen(false)}
                  className="flex-1 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 text-sm font-medium transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="flex-1 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-sm font-medium transition-colors"
                >
                  Generate Card
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}