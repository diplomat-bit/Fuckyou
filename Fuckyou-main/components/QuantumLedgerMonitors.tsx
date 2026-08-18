'use client';

import React, { useState, useEffect, useMemo, useId } from 'react';
import {
  ShieldAlert,
  Sliders,
  TrendingUp,
  TrendingDown,
  AlertTriangle,
  Zap,
  Activity,
  Plus,
  ArrowUpRight,
  Sparkles,
  RefreshCw,
  Eye,
  CheckCircle2,
  XCircle,
  Database,
  Cpu,
  Layers,
  ChevronRight,
  Search,
  Filter
} from 'lucide-react';

interface LedgerAccountBalanceMonitor {
  id: string;
  ledger_account_id: string;
  account_name: string;
  currency: string;
  balance_lower_bound: number | null;
  balance_upper_bound: number | null;
  current_balance: number;
  direction: 'credit' | 'debit' | 'both';
  status: 'active' | 'triggered' | 'archived';
  created_at: string;
  updated_at: string;
  ai_risk_score: number;
  ai_verdict: string;
  projected_breach_hours: number | null;
  sovereign_tier: 'Crown Sovereign' | 'Imperial Reserve' | 'Institutional Prime';
}

interface HistoricalDataPoint {
  time: string;
  balance: number;
  predicted: number;
  upperBound: number;
  lowerBound: number;
}

export default function QuantumLedgerMonitors() {
  const gradientId = useId();
  const [monitors, setMonitors] = useState<LedgerAccountBalanceMonitor[]>([
    {
      id: 'lbm_citigold_99841',
      ledger_account_id: 'la_sovereign_sg_882',
      account_name: 'Citibank Singapore Sovereign Vault Alpha',
      currency: 'USD',
      balance_lower_bound: 2500000000,
      balance_upper_bound: 7500000000,
      current_balance: 4892400120,
      direction: 'both',
      status: 'active',
      created_at: '2025-01-15T08:30:00Z',
      updated_at: '2025-03-30T14:22:11Z',
      ai_risk_score: 98.4,
      ai_verdict: 'Optimum Liquidity Equilibrium. Modern Treasury auto-sweep dormant.',
      projected_breach_hours: null,
      sovereign_tier: 'Crown Sovereign'
    },
    {
      id: 'lbm_citigold_88194',
      ledger_account_id: 'la_zurich_bullion_001',
      account_name: 'Citi Private Bank Zurich Bullion Reserve #4',
      currency: 'CHF',
      balance_lower_bound: 1200000000,
      balance_upper_bound: 3500000000,
      current_balance: 1195000000,
      direction: 'credit',
      status: 'triggered',
      created_at: '2025-02-01T11:00:00Z',
      updated_at: '2025-03-30T15:45:00Z',
      ai_risk_score: 34.2,
      ai_verdict: 'CRITICAL BREACH: Sub-threshold by 5M CHF. Quantum auto-rebalance armed.',
      projected_breach_hours: 0,
      sovereign_tier: 'Imperial Reserve'
    },
    {
      id: 'lbm_citigold_44712',
      ledger_account_id: 'la_tokyo_arbitrage_099',
      account_name: 'Citi Quantum Synthetic Arbitrage Ledger',
      currency: 'JPY',
      balance_lower_bound: 500000000000,
      balance_upper_bound: 1500000000000,
      current_balance: 1420000000000,
      direction: 'debit',
      status: 'active',
      created_at: '2025-02-18T04:15:00Z',
      updated_at: '2025-03-30T15:58:19Z',
      ai_risk_score: 79.8,
      ai_verdict: 'Approaching Upper Resistance. Recommending Modern Treasury ledger slice.',
      projected_breach_hours: 3.4,
      sovereign_tier: 'Crown Sovereign'
    },
    {
      id: 'lbm_citigold_11902',
      ledger_account_id: 'la_london_petrodollar_77',
      account_name: 'Citi Treasury London High-Yield Petrodollar',
      currency: 'GBP',
      balance_lower_bound: 850000000,
      balance_upper_bound: 2500000000,
      current_balance: 1870420000,
      direction: 'both',
      status: 'active',
      created_at: '2025-03-01T09:00:00Z',
      updated_at: '2025-03-30T12:10:00Z',
      ai_risk_score: 94.1,
      ai_verdict: 'Zero entropy detected. Continuous cross-ledger reconciliation optimal.',
      projected_breach_hours: null,
      sovereign_tier: 'Institutional Prime'
    }
  ]);

  const [selectedMonitorId, setSelectedMonitorId] = useState<string>('lbm_citigold_99841');
  const [filterQuery, setFilterQuery] = useState('');
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [isCreating, setIsCreating] = useState(false);
  const [isRebalancing, setIsRebalancing] = useState(false);

  // Form State for creating new monitor
  const [newAccountId, setNewAccountId] = useState('la_dubai_sovereign_011');
  const [newAccountName, setNewAccountName] = useState('Citi Private Bank Emirates Vault');
  const [newCurrency, setNewCurrency] = useState('USD');
  const [newLowerBound, setNewLowerBound] = useState('1000000000');
  const [newUpperBound, setNewUpperBound] = useState('5000000000');
  const [newDirection, setNewDirection] = useState<'credit' | 'debit' | 'both'>('both');

  const selectedMonitor = useMemo(() => {
    return monitors.find(m => m.id === selectedMonitorId) || monitors[0];
  }, [monitors, selectedMonitorId]);

  // Synthetic Historical Curve for Interactive Chart
  const chartData: HistoricalDataPoint[] = useMemo(() => {
    if (!selectedMonitor) return [];
    const base = selectedMonitor.current_balance;
    const lower = selectedMonitor.balance_lower_bound || base * 0.5;
    const upper = selectedMonitor.balance_upper_bound || base * 1.5;
    const volatility = (upper - lower) * 0.04;

    const points: HistoricalDataPoint[] = [];
    const timestamps = ['00:00', '03:00', '06:00', '09:00', '12:00', '15:00', '18:00 (EST)', '21:00 (AI Proj)', '23:59 (AI Proj)'];

    timestamps.forEach((time, index) => {
      const noise = (Math.sin(index * 1.4) * 0.5 + Math.cos(index * 0.8) * 0.5) * volatility;
      const val = base - (4 - index) * (volatility * 0.6) + noise;
      const predictedVal = index >= 6 ? val + (Math.sin(index) * volatility * 1.2) : val;
      points.push({
        time,
        balance: index <= 6 ? val : val,
        predicted: predictedVal,
        upperBound: upper,
        lowerBound: lower
      });
    });
    return points;
  }, [selectedMonitor]);

  const filteredMonitors = useMemo(() => {
    return monitors.filter(m => {
      const matchesSearch = m.account_name.toLowerCase().includes(filterQuery.toLowerCase()) ||
                            m.ledger_account_id.toLowerCase().includes(filterQuery.toLowerCase()) ||
                            m.id.toLowerCase().includes(filterQuery.toLowerCase());
      const matchesStatus = filterStatus === 'all' || m.status === filterStatus;
      return matchesSearch && matchesStatus;
    });
  }, [monitors, filterQuery, filterStatus]);

  const formatCurrency = (val: number | null, curr: string) => {
    if (val === null) return '∞ UNRESTRICTED';
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      notation: 'compact',
      maximumFractionDigits: 3
    }).format(val);
  };

  const handleCreateMonitor = (e: React.FormEvent) => {
    e.preventDefault();
    const created: LedgerAccountBalanceMonitor = {
      id: `lbm_citi_${Math.random().toString(36).substr(2, 6)}`,
      ledger_account_id: newAccountId,
      account_name: newAccountName,
      currency: newCurrency,
      balance_lower_bound: newLowerBound ? parseFloat(newLowerBound) : null,
      balance_upper_bound: newUpperBound ? parseFloat(newUpperBound) : null,
      current_balance: newLowerBound ? parseFloat(newLowerBound) * 1.25 : 2000000000,
      direction: newDirection,
      status: 'active',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
      ai_risk_score: 96.5,
      ai_verdict: 'Quantum Ledger Neural Bridge established. Thresholds calibrated.',
      projected_breach_hours: null,
      sovereign_tier: 'Crown Sovereign'
    };

    setMonitors([created, ...monitors]);
    setSelectedMonitorId(created.id);
    setIsCreating(false);
  };

  const handleSimulateAutonomousIntervention = () => {
    setIsRebalancing(true);
    setTimeout(() => {
      setMonitors(prev =>
        prev.map(m => {
          if (m.id === selectedMonitorId) {
            return {
              ...m,
              status: 'active',
              current_balance: m.balance_lower_bound ? m.balance_lower_bound * 1.4 : m.current_balance * 1.1,
              ai_risk_score: 99.1,
              ai_verdict: 'Autonomous Modern Treasury Liquidity Bridge executed. Equilibrium restored.',
              projected_breach_hours: null,
              updated_at: new Date().toISOString()
            };
          }
          return m;
        })
      );
      setIsRebalancing(false);
    }, 1800);
  };

  // SVG dimensions for chart
  const svgWidth = 800;
  const svgHeight = 260;
  const padding = { top: 20, right: 30, bottom: 40, left: 70 };
  const chartW = svgWidth - padding.left - padding.right;
  const chartH = svgHeight - padding.top - padding.bottom;

  const minVal = useMemo(() => {
    if (!chartData.length) return 0;
    const allVals = chartData.flatMap(d => [d.balance, d.predicted, d.lowerBound, d.upperBound]);
    return Math.min(...allVals) * 0.95;
  }, [chartData]);

  const maxVal = useMemo(() => {
    if (!chartData.length) return 100;
    const allVals = chartData.flatMap(d => [d.balance, d.predicted, d.lowerBound, d.upperBound]);
    return Math.max(...allVals) * 1.05;
  }, [chartData]);

  const getY = (v: number) => {
    return padding.top + chartH - ((v - minVal) / (maxVal - minVal)) * chartH;
  };

  const getX = (idx: number) => {
    return padding.left + (idx / (chartData.length - 1)) * chartW;
  };

  const balancePoints = chartData.map((d, i) => `${getX(i)},${getY(d.balance)}`).join(' ');
  const upperLineY = chartData[0] ? getY(chartData[0].upperBound) : 0;
  const lowerLineY = chartData[0] ? getY(chartData[0].lowerBound) : 0;

  return (
    <div className="min-h-screen bg-[#030712] text-[#F3F4F6] font-sans antialiased selection:bg-[#D4AF37] selection:text-black p-4 sm:p-6 lg:p-10 relative overflow-hidden">
      {/* Background Ambient Luxury Gradients */}
      <div className="absolute top-0 right-1/4 w-[600px] h-[600px] bg-gradient-to-br from-[#D4AF37]/10 via-[#0A2540]/30 to-transparent blur-3xl pointer-events-none rounded-full" />
      <div className="absolute -bottom-20 left-10 w-[500px] h-[500px] bg-gradient-to-tr from-[#1E3A8A]/20 via-[#D4AF37]/5 to-transparent blur-3xl pointer-events-none rounded-full" />

      {/* Outer Luxury Shell */}
      <div className="max-w-[1600px] mx-auto relative z-10 space-y-6">

        {/* Global Citibank Sovereign Header */}
        <header className="border border-[#D4AF37]/30 bg-gradient-to-r from-[#0b0f19]/90 via-[#111827]/80 to-[#0b0f19]/90 backdrop-blur-2xl rounded-2xl p-6 sm:p-8 shadow-[0_0_50px_rgba(212,175,55,0.08)]">
          <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div className="space-y-2">
              <div className="flex items-center space-x-3">
                <div className="h-9 w-9 rounded-xl bg-gradient-to-tr from-[#D4AF37] to-[#F5E050] flex items-center justify-center shadow-[0_0_20px_rgba(212,175,55,0.4)]">
                  <Database className="h-5 w-5 text-black" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] tracking-[0.25em] font-semibold text-[#D4AF37] uppercase">Citi Private Sovereign Syndicate</span>
                    <span className="px-2 py-0.5 rounded-full text-[9px] font-bold bg-[#D4AF37]/20 text-[#F5E050] border border-[#D4AF37]/40 tracking-wider">MODERN TREASURY LEDGER V4</span>
                  </div>
                  <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-white flex items-center gap-3">
                    Quantum Ledger Balance Monitors
                    <Sparkles className="w-5 h-5 text-[#D4AF37] animate-pulse" />
                  </h1>
                </div>
              </div>
              <p className="text-xs sm:text-sm text-neutral-400 max-w-3xl leading-relaxed">
                Autonomous real-time surveillance over Modern Treasury Ledgers (<code className="text-[#D4AF37] bg-black/40 px-1.5 py-0.5 rounded">/api/ledger_account_balance_monitors</code>). Powered by Citi Vanguard AI with sub-millisecond neural threshold triggers.
              </p>
            </div>

            {/* Top Level Metric Badges */}
            <div className="flex flex-wrap items-center gap-4">
              <div className="bg-black/60 border border-[#D4AF37]/20 rounded-xl px-4 py-3 min-w-[140px]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Monitored AUM</div>
                <div className="text-lg font-bold text-[#F5E050] font-mono tracking-tight">$84,921,840,000</div>
              </div>
              <div className="bg-black/60 border border-[#D4AF37]/20 rounded-xl px-4 py-3 min-w-[120px]">
                <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Quantum Feeds</div>
                <div className="text-lg font-bold text-emerald-400 font-mono flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-emerald-400 animate-ping inline-block" />
                  ONLINE
                </div>
              </div>
              <button
                onClick={() => setIsCreating(true)}
                className="group relative inline-flex items-center gap-2 px-5 py-3 rounded-xl font-semibold text-xs tracking-wider uppercase overflow-hidden bg-gradient-to-r from-[#D4AF37] via-[#F3E5AB] to-[#AA7C11] text-black shadow-[0_0_25px_rgba(212,175,55,0.35)] hover:shadow-[0_0_35px_rgba(212,175,55,0.6)] transition-all duration-300 transform active:scale-95"
              >
                <Plus className="w-4 h-4 text-black stroke-[3]" />
                <span>Initialize Monitor</span>
              </button>
            </div>
          </div>
        </header>

        {/* Main Grid: 2 Column Workspace */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">

          {/* Left Column: Ledger Monitor Stream (5 Cols) */}
          <div className="xl:col-span-5 space-y-4">
            <div className="bg-[#0B0F17]/90 border border-white/10 rounded-2xl p-4 shadow-xl backdrop-blur-xl space-y-4">
              
              {/* Search & Filtering Bar */}
              <div className="flex flex-col sm:flex-row gap-2">
                <div className="relative flex-1">
                  <Search className="absolute left-3 top-2.5 h-4 w-4 text-neutral-500" />
                  <input
                    type="text"
                    value={filterQuery}
                    onChange={(e) => setFilterQuery(e.target.value)}
                    placeholder="Search account, ledger ID, monitor ID..."
                    className="w-full pl-9 pr-4 py-2 bg-black/50 border border-white/10 rounded-xl text-xs text-white placeholder-neutral-500 focus:outline-none focus:border-[#D4AF37] transition"
                  />
                </div>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4 text-[#D4AF37]" />
                  <select
                    value={filterStatus}
                    onChange={(e) => setFilterStatus(e.target.value)}
                    className="bg-black/70 border border-white/10 text-xs text-neutral-300 rounded-xl px-3 py-2 focus:outline-none focus:border-[#D4AF37]"
                  >
                    <option value="all">All States</option>
                    <option value="active">Active</option>
                    <option value="triggered">Breached/Triggered</option>
                    <option value="archived">Archived</option>
                  </select>
                </div>
              </div>

              {/* Monitor Cards List */}
              <div className="space-y-3 max-h-[680px] overflow-y-auto pr-1">
                {filteredMonitors.map((m) => {
                  const isSelected = m.id === selectedMonitor.id;
                  const isTriggered = m.status === 'triggered';

                  return (
                    <div
                      key={m.id}
                      onClick={() => setSelectedMonitorId(m.id)}
                      className={`relative p-4 rounded-xl border transition-all duration-300 cursor-pointer overflow-hidden ${
                        isSelected
                          ? 'border-[#D4AF37] bg-gradient-to-r from-[#D4AF37]/10 via-[#161f30] to-[#0d131f] shadow-[0_0_20px_rgba(212,175,55,0.15)]'
                          : 'border-white/5 bg-black/40 hover:border-white/20 hover:bg-black/60'
                      }`}
                    >
                      {/* Top Accent Pill */}
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="space-y-0.5">
                          <span className="text-[9px] font-mono tracking-widest text-[#D4AF37] uppercase">{m.sovereign_tier}</span>
                          <h3 className="text-sm font-bold text-white leading-tight">{m.account_name}</h3>
                          <div className="text-[10px] font-mono text-neutral-400">{m.ledger_account_id}</div>
                        </div>
                        <div className="flex flex-col items-end gap-1">
                          <span
                            className={`px-2 py-0.5 rounded-md text-[9px] font-mono font-bold uppercase tracking-wider ${
                              isTriggered
                                ? 'bg-red-500/20 text-red-400 border border-red-500/40 animate-pulse'
                                : 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                            }`}
                          >
                            {m.status}
                          </span>
                          <span className="text-[9px] text-neutral-500 font-mono">{m.direction.toUpperCase()} BOUNDS</span>
                        </div>
                      </div>

                      {/* Financial Value Row */}
                      <div className="mt-3 pt-3 border-t border-white/5 flex items-center justify-between">
                        <div>
                          <div className="text-[9px] uppercase tracking-wider text-neutral-400">Current Ledger Balance</div>
                          <div className="text-base font-bold text-white font-mono">{formatCurrency(m.current_balance, m.currency)}</div>
                        </div>
                        <div className="text-right">
                          <div className="text-[9px] uppercase tracking-wider text-neutral-400">AI Risk Rating</div>
                          <div className="text-xs font-mono font-semibold text-[#F5E050] flex items-center gap-1 justify-end">
                            <Cpu className="w-3 h-3 text-[#D4AF37]" />
                            {m.ai_risk_score}%
                          </div>
                        </div>
                      </div>

                      {/* Threshold Band Preview */}
                      <div className="mt-2 text-[10px] font-mono text-neutral-400 flex items-center justify-between">
                        <span>L: {formatCurrency(m.balance_lower_bound, m.currency)}</span>
                        <ChevronRight className="w-3 h-3 text-neutral-600" />
                        <span>U: {formatCurrency(m.balance_upper_bound, m.currency)}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>

          {/* Right Column: Deep Sovereign Telemetry & Controls (7 Cols) */}
          <div className="xl:col-span-7 space-y-6">

            {/* Active Monitor Master Control View */}
            <div className="bg-[#0B0F17]/90 border border-[#D4AF37]/30 rounded-2xl p-6 shadow-2xl backdrop-blur-xl relative overflow-hidden">
              
              {/* Top Banner with ID and Action */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-6 border-b border-white/10 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-[10px] font-mono tracking-widest text-[#D4AF37] uppercase">MODERN TREASURY MONITOR ID</span>
                    <span className="text-[11px] font-mono bg-black/60 px-2 py-0.5 rounded border border-[#D4AF37]/30 text-white">{selectedMonitor.id}</span>
                  </div>
                  <h2 className="text-xl font-black text-white mt-1">{selectedMonitor.account_name}</h2>
                </div>

                <div className="flex items-center gap-3">
                  <button
                    onClick={handleSimulateAutonomousIntervention}
                    disabled={isRebalancing}
                    className="flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-to-r from-amber-600/30 to-[#D4AF37]/30 border border-[#D4AF37]/50 text-xs font-semibold text-[#F5E050] hover:bg-[#D4AF37]/20 transition disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRebalancing ? 'animate-spin' : ''}`} />
                    <span>{isRebalancing ? 'Rebalancing Ledger...' : 'Trigger AI Auto-Sweep'}</span>
                  </button>
                </div>
              </div>

              {/* Real-time Balances & Gold Threshold Limits */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-6">
                <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Floor Threshold</div>
                  <div className="text-sm sm:text-base font-bold text-red-400 font-mono mt-1">
                    {formatCurrency(selectedMonitor.balance_lower_bound, selectedMonitor.currency)}
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-1">Modern Treasury Auto-Deficit Lock</div>
                </div>

                <div className="bg-black/60 border border-[#D4AF37]/40 rounded-xl p-4 shadow-[0_0_15px_rgba(212,175,55,0.1)]">
                  <div className="text-[10px] text-[#D4AF37] uppercase tracking-widest font-mono flex items-center justify-between">
                    <span>Live Balance</span>
                    <Activity className="w-3.5 h-3.5 text-emerald-400 animate-pulse" />
                  </div>
                  <div className="text-lg sm:text-xl font-extrabold text-white font-mono mt-1">
                    {formatCurrency(selectedMonitor.current_balance, selectedMonitor.currency)}
                  </div>
                  <div className="text-[9px] text-emerald-400 mt-1 flex items-center gap-1 font-mono">
                    <TrendingUp className="w-3 h-3" /> +1.84% Citi Settlement Stream
                  </div>
                </div>

                <div className="bg-black/50 border border-white/10 rounded-xl p-4">
                  <div className="text-[10px] text-neutral-400 uppercase tracking-widest font-mono">Ceiling Threshold</div>
                  <div className="text-sm sm:text-base font-bold text-blue-400 font-mono mt-1">
                    {formatCurrency(selectedMonitor.balance_upper_bound, selectedMonitor.currency)}
                  </div>
                  <div className="text-[9px] text-neutral-500 mt-1">Sovereign Surplus Sweep Gateway</div>
                </div>
              </div>

              {/* Dynamic Interactive SVG Gold-Plated Chart */}
              <div className="bg-black/80 border border-white/10 rounded-xl p-4 relative">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <Sliders className="w-3.5 h-3.5 text-[#D4AF37]" />
                    <span className="text-[11px] font-mono uppercase tracking-wider text-neutral-300">Balance Trajectory &amp; Neural Confidence Tube</span>
                  </div>
                  <div className="flex items-center gap-3 text-[9px] font-mono">
                    <span className="flex items-center gap-1 text-[#D4AF37]">
                      <span className="h-1.5 w-4 bg-[#D4AF37] inline-block rounded" /> Real Ledger
                    </span>
                    <span className="flex items-center gap-1 text-cyan-400">
                      <span className="h-1.5 w-4 bg-cyan-400 inline-block rounded border-dashed" /> AI Predictive
                    </span>
                  </div>
                </div>

                <div className="w-full overflow-x-auto">
                  <svg viewBox={`0 0 ${svgWidth} ${svgHeight}`} className="w-full h-auto min-w-[500px]">
                    <defs>
                      <linearGradient id={gradientId} x1="0" y1="0" x2="0" y2="1">
                        <stop offset="0%" stopColor="#D4AF37" stopOpacity="0.4" />
                        <stop offset="100%" stopColor="#D4AF37" stopOpacity="0.0" />
                      </linearGradient>
                    </defs>

                    {/* Grid Lines */}
                    <line x1={padding.left} y1={padding.top} x2={svgWidth - padding.right} y2={padding.top} stroke="#222" strokeDasharray="3 3" />
                    <line x1={padding.left} y1={padding.top + chartH / 2} x2={svgWidth - padding.right} y2={padding.top + chartH / 2} stroke="#222" strokeDasharray="3 3" />
                    <line x1={padding.left} y1={padding.top + chartH} x2={svgWidth - padding.right} y2={padding.top + chartH} stroke="#222" />

                    {/* Upper Threshold Marker Line */}
                    {selectedMonitor.balance_upper_bound && (
                      <g>
                        <line
                          x1={padding.left}
                          y1={upperLineY}
                          x2={svgWidth - padding.right}
                          y2={upperLineY}
                          stroke="#3B82F6"
                          strokeDasharray="4 4"
                          strokeWidth="1.5"
                        />
                        <text x={padding.left + 8} y={upperLineY - 6} fill="#60A5FA" fontSize="9" fontFamily="monospace">
                          UPPER THRESHOLD LIMIT
                        </text>
                      </g>
                    )}

                    {/* Lower Threshold Marker Line */}
                    {selectedMonitor.balance_lower_bound && (
                      <g>
                        <line
                          x1={padding.left}
                          y1={lowerLineY}
                          x2={svgWidth - padding.right}
                          y2={lowerLineY}
                          stroke="#EF4444"
                          strokeDasharray="4 4"
                          strokeWidth="1.5"
                        />
                        <text x={padding.left + 8} y={lowerLineY + 14} fill="#F87171" fontSize="9" fontFamily="monospace">
                          FLOOR COLLATERAL BOUND
                        </text>
                      </g>
                    )}

                    {/* Chart Area Fill */}
                    {chartData.length > 0 && (
                      <polygon
                        points={`
                          ${getX(0)},${getY(chartData[0].balance)} 
                          ${chartData.map((d, i) => `${getX(i)},${getY(d.balance)}`).join(' ')} 
                          ${getX(chartData.length - 1)},${padding.top + chartH} 
                          ${getX(0)},${padding.top + chartH}
                        `}
                        fill={`url(#${gradientId})`}
                      />
                    )}

                    {/* Polyline: Actual Balance */}
                    <polyline
                      fill="none"
                      stroke="#D4AF37"
                      strokeWidth="2.5"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      points={balancePoints}
                    />

                    {/* Points and Labels */}
                    {chartData.map((d, idx) => {
                      const cx = getX(idx);
                      const cy = getY(d.balance);
                      return (
                        <g key={idx}>
                          <circle cx={cx} cy={cy} r="4" fill="#0A0F1D" stroke="#D4AF37" strokeWidth="2" />
                          <text
                            x={cx}
                            y={svgHeight - 10}
                            fill="#6B7280"
                            fontSize="8.5"
                            fontFamily="monospace"
                            textAnchor="middle"
                          >
                            {d.time}
                          </text>
                        </g>
                      );
                    })}
                  </svg>
                </div>
              </div>

              {/* Citi AI Vanguard Neural Directive Panel */}
              <div className="mt-6 border border-[#D4AF37]/30 bg-gradient-to-br from-[#101826] to-[#0B0F17] rounded-xl p-4 relative">
                <div className="flex items-start gap-3">
                  <div className="p-2 rounded-lg bg-[#D4AF37]/20 border border-[#D4AF37]/40 text-[#F5E050] mt-0.5">
                    <Zap className="w-4 h-4 animate-pulse" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h4 className="text-xs font-bold uppercase tracking-wider text-[#F5E050]">Citi Vanguard AI Diagnostics</h4>
                      <span className="px-1.5 py-0.2 bg-[#D4AF37]/20 rounded text-[9px] font-mono text-[#D4AF37]">LLM-SYNDICATE-9</span>
                    </div>
                    <p className="text-xs text-neutral-300 leading-relaxed font-sans">{selectedMonitor.ai_verdict}</p>
                    <div className="pt-2 flex flex-wrap gap-4 text-[10px] font-mono text-neutral-400">
                      <div>Directional Guard: <span className="text-white font-bold">{selectedMonitor.direction.toUpperCase()}</span></div>
                      <div>Reconciliation Interval: <span className="text-white font-bold">120ms</span></div>
                      <div>Modern Treasury Hook: <span className="text-emerald-400 font-bold">CONNECTED</span></div>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* REST API & Webhook Payload Specimen */}
            <div className="bg-black/60 border border-white/10 rounded-2xl p-5 font-mono text-xs text-neutral-300">
              <div className="flex items-center justify-between pb-3 border-b border-white/5">
                <span className="text-[10px] text-[#D4AF37] uppercase tracking-widest">Modern Treasury API Specimen</span>
                <span className="text-[9px] bg-neutral-800 px-2 py-0.5 rounded text-neutral-400">POST /api/ledger_account_balance_monitors</span>
              </div>
              <pre className="mt-3 p-3 bg-black/80 rounded-xl overflow-x-auto text-[11px] text-amber-200/90 leading-relaxed border border-white/5">
{`{
  "id": "${selectedMonitor.id}",
  "ledger_account_id": "${selectedMonitor.ledger_account_id}",
  "balance_lower_bound": ${selectedMonitor.balance_lower_bound},
  "balance_upper_bound": ${selectedMonitor.balance_upper_bound},
  "direction": "${selectedMonitor.direction}",
  "live_mode": true,
  "sovereign_metadata": {
    "citi_syndicate_id": "CS-99401-NY",
    "ai_governance": "AUTONOMOUS_INTERVENTION_ENABLED"
  }
}`}
              </pre>
            </div>

          </div>
        </div>

        {/* Modal: New Sovereign Monitor Initialization */}
        {isCreating && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <div className="bg-[#0D131F] border border-[#D4AF37]/50 rounded-2xl max-w-xl w-full p-6 shadow-[0_0_50px_rgba(212,175,55,0.2)] relative space-y-6">
              
              <div className="flex items-center justify-between pb-4 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#D4AF37]" />
                  <h3 className="text-lg font-bold text-white">Initialize Ledger Account Monitor</h3>
                </div>
                <button
                  onClick={() => setIsCreating(false)}
                  className="text-neutral-400 hover:text-white transition"
                >
                  <XCircle className="w-5 h-5" />
                </button>
              </div>

              <form onSubmit={handleCreateMonitor} className="space-y-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Ledger Account ID</label>
                  <input
                    type="text"
                    required
                    value={newAccountId}
                    onChange={(e) => setNewAccountId(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="la_..."
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Account Descriptive Tag</label>
                  <input
                    type="text"
                    required
                    value={newAccountName}
                    onChange={(e) => setNewAccountName(e.target.value)}
                    className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    placeholder="Citi Private Bank Account..."
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Currency</label>
                    <select
                      value={newCurrency}
                      onChange={(e) => setNewCurrency(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="USD">USD ($)</option>
                      <option value="CHF">CHF (Fr)</option>
                      <option value="EUR">EUR (€)</option>
                      <option value="GBP">GBP (£)</option>
                      <option value="JPY">JPY (¥)</option>
                      <option value="AED">AED (د.إ)</option>
                    </select>
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Directional Filter</label>
                    <select
                      value={newDirection}
                      onChange={(e) => setNewDirection(e.target.value as any)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                    >
                      <option value="both">Both (Credit &amp; Debit)</option>
                      <option value="credit">Credit Only</option>
                      <option value="debit">Debit Only</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Floor Bound (Lower Limit)</label>
                    <input
                      type="number"
                      value={newLowerBound}
                      onChange={(e) => setNewLowerBound(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. 1000000000"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-400">Ceiling Bound (Upper Limit)</label>
                    <input
                      type="number"
                      value={newUpperBound}
                      onChange={(e) => setNewUpperBound(e.target.value)}
                      className="w-full bg-black/60 border border-white/15 rounded-xl px-3.5 py-2.5 text-xs text-white focus:outline-none focus:border-[#D4AF37]"
                      placeholder="e.g. 5000000000"
                    />
                  </div>
                </div>

                <div className="pt-4 flex items-center justify-end gap-3">
                  <button
                    type="button"
                    onClick={() => setIsCreating(false)}
                    className="px-4 py-2 rounded-xl text-xs font-semibold text-neutral-400 hover:text-white transition"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 rounded-xl text-xs font-bold bg-gradient-to-r from-[#D4AF37] to-[#F5E050] text-black shadow-[0_0_20px_rgba(212,175,55,0.4)] hover:brightness-110 transition"
                  >
                    Establish Gold-Plated Monitor
                  </button>
                </div>
              </form>
            </div>
          </div>
        )}

      </div>
    </div>
  );
}