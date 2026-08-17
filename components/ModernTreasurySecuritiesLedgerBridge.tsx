import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  ShieldCheck,
  Layers,
  Cpu,
  TrendingUp,
  RefreshCw,
  AlertTriangle,
  CheckCircle2,
  DollarSign,
  Building2,
  Lock,
  Scale,
  Terminal,
  ArrowUpRight,
  ArrowDownRight,
  Activity,
  FileCheck,
  Boxes,
  Database,
  Search,
  Sliders,
  ChevronRight,
  Sparkles,
  Zap,
  Landmark,
  Compass
} from 'lucide-react';

interface SecurityHolding {
  id: string;
  ticker: string;
  name: string;
  cusip: string;
  assetClass: 'Sovereign Debt' | 'Ultra-Cap Equity' | 'Private Institutional' | 'Tokenized Bullion';
  currency: 'USD' | 'EUR' | 'CHF' | 'GBP';
  units: {
    pending: number;
    confirmed: number;
    assigned: number;
    settled: number;
    total: number;
  };
  unitNAV: number;
  navChange24h: number;
  custodian: 'Citibank N.A. London' | 'Citibank Sovereign Custody NY' | 'Citi Private Bank Zurich';
  mtLedgerAccountId: string;
  lastBalancingTimestamp: string;
  reconciliationStatus: 'OPTIMAL' | 'REBALANCING' | 'DRIFT_DETECTED' | 'LOCKED';
}

interface ModernTreasuryLedgerEntry {
  id: string;
  transactionRef: string;
  citiClearingRef: string;
  securityId: string;
  ticker: string;
  type: 'CREDIT' | 'DEBIT';
  accountType: 'SETTLEMENT_ESCROW' | 'ACTIVE_PORTFOLIO' | 'COLLATERAL_LOCKED' | 'CLEARING_TRANSIT';
  amount: number;
  unitsImpacted: number;
  stateTransition: string;
  timestamp: string;
  aiVerificationHash: string;
  status: 'POSTED' | 'PENDING_MATCH' | 'ARCHIVED';
}

interface NAVHistoryPoint {
  time: string;
  nav: number;
  driftBps: number;
}

const INITIAL_SECURITIES: SecurityHolding[] = [
  {
    id: 'SEC-BRK-001',
    ticker: 'BRK.A-INST',
    name: 'Berkshire Hathaway Cl A (Sovereign Depository)',
    cusip: '084670-70-1',
    assetClass: 'Ultra-Cap Equity',
    currency: 'USD',
    units: {
      pending: 45,
      confirmed: 120,
      assigned: 85,
      settled: 2450,
      total: 2700,
    },
    unitNAV: 628450.00,
    navChange24h: 1.42,
    custodian: 'Citibank Sovereign Custody NY',
    mtLedgerAccountId: 'mt_la_9948_brk_alpha',
    lastBalancingTimestamp: '2025-02-23T14:48:12Z',
    reconciliationStatus: 'OPTIMAL',
  },
  {
    id: 'SEC-UST-30Y',
    ticker: 'UST-30Y-STRIP',
    name: 'US Treasury 30-Year Zero-Coupon STRIPS (Bespoke Series IV)',
    cusip: '912810-SV-9',
    assetClass: 'Sovereign Debt',
    currency: 'USD',
    units: {
      pending: 12500,
      confirmed: 35000,
      assigned: 15000,
      settled: 890000,
      total: 952500,
    },
    unitNAV: 984.75,
    navChange24h: -0.18,
    custodian: 'Citibank Sovereign Custody NY',
    mtLedgerAccountId: 'mt_la_7721_ust_strips',
    lastBalancingTimestamp: '2025-02-23T14:50:00Z',
    reconciliationStatus: 'OPTIMAL',
  },
  {
    id: 'SEC-SPX-N',
    ticker: 'SPCX-N-PREF',
    name: 'SpaceX Series N Super-Preferred Sovereign Allocation',
    cusip: '848574-NX-3',
    assetClass: 'Private Institutional',
    currency: 'USD',
    units: {
      pending: 5000,
      confirmed: 12000,
      assigned: 25000,
      settled: 158000,
      total: 200000,
    },
    unitNAV: 1485.20,
    navChange24h: 3.84,
    custodian: 'Citibank N.A. London',
    mtLedgerAccountId: 'mt_la_3319_spcx_n',
    lastBalancingTimestamp: '2025-02-23T14:35:10Z',
    reconciliationStatus: 'DRIFT_DETECTED',
  },
  {
    id: 'SEC-GLD-CITI',
    ticker: 'XAU-CITI-PHYS',
    name: 'Citi 99.99% Allocated Fine Gold Bullion Vault Receipts',
    cusip: 'CT9999-AU-0',
    assetClass: 'Tokenized Bullion',
    currency: 'USD',
    units: {
      pending: 0,
      confirmed: 150,
      assigned: 300,
      settled: 14550,
      total: 15000,
    },
    unitNAV: 2984.60,
    navChange24h: 0.95,
    custodian: 'Citi Private Bank Zurich',
    mtLedgerAccountId: 'mt_la_1104_xau_vault',
    lastBalancingTimestamp: '2025-02-23T14:51:30Z',
    reconciliationStatus: 'OPTIMAL',
  },
];

const INITIAL_LEDGER_ENTRIES: ModernTreasuryLedgerEntry[] = [
  {
    id: 'MT-TX-880914',
    transactionRef: 'mt_ltx_880914_brk_settle',
    citiClearingRef: 'CITI-NY-FEDWIRE-992019488',
    securityId: 'SEC-BRK-001',
    ticker: 'BRK.A-INST',
    type: 'CREDIT',
    accountType: 'ACTIVE_PORTFOLIO',
    amount: 157112500.00,
    unitsImpacted: 250,
    stateTransition: 'CONFIRMED → SETTLED',
    timestamp: '2025-02-23T14:48:12Z',
    aiVerificationHash: '0x94fba8c9e42109aaee84918237190dcae',
    status: 'POSTED',
  },
  {
    id: 'MT-TX-880915',
    transactionRef: 'mt_ltx_880915_ust_alloc',
    citiClearingRef: 'CITI-DTC-MBS-4491028',
    securityId: 'SEC-UST-30Y',
    ticker: 'UST-30Y-STRIP',
    type: 'DEBIT',
    accountType: 'COLLATERAL_LOCKED',
    amount: 14771250.00,
    unitsImpacted: 15000,
    stateTransition: 'SETTLED → ASSIGNED',
    timestamp: '2025-02-23T14:50:00Z',
    aiVerificationHash: '0x33e8ca12800192abbc149021948aeef11',
    status: 'POSTED',
  },
  {
    id: 'MT-TX-880916',
    transactionRef: 'mt_ltx_880916_spcx_ingest',
    citiClearingRef: 'CITI-LON-CREST-77192834',
    securityId: 'SEC-SPX-N',
    ticker: 'SPCX-N-PREF',
    type: 'CREDIT',
    accountType: 'CLEARING_TRANSIT',
    amount: 7426000.00,
    unitsImpacted: 5000,
    stateTransition: 'INTENT → PENDING',
    timestamp: '2025-02-23T14:35:10Z',
    aiVerificationHash: '0x718dfb2019eec8102934812301fedca02',
    status: 'PENDING_MATCH',
  },
];

export const ModernTreasurySecuritiesLedgerBridge: React.FC = () => {
  const [securities, setSecurities] = useState<SecurityHolding[]>(INITIAL_SECURITIES);
  const [ledgerEntries, setLedgerEntries] = useState<ModernTreasuryLedgerEntry[]>(INITIAL_LEDGER_ENTRIES);
  const [selectedSecurity, setSelectedSecurity] = useState<SecurityHolding>(INITIAL_SECURITIES[0]);
  const [isAiBalancing, setIsAiBalancing] = useState<boolean>(false);
  const [isSyncingModernTreasury, setIsSyncingModernTreasury] = useState<boolean>(false);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [filterClass, setFilterClass] = useState<string>('ALL');
  const [neuralAuditLog, setNeuralAuditLog] = useState<string[]>([
    '[INIT] Citibank-Modern Treasury Sovereign Ledger Gateway instantiated.',
    '[TELEMETRY] Double-entry balancing matrix synced with Citi WorldLink & DTC Direct Link.',
    '[AI-GUARD] Real-time NAV drift detection verified: Variance < 0.00018 bps.',
  ]);

  // Aggregate Portfolio Calculations
  const portfolioSummary = useMemo(() => {
    let totalPortfolioValuation = 0;
    let totalSettledValuation = 0;
    let totalAssignedValuation = 0;
    let totalPendingValuation = 0;

    securities.forEach((sec) => {
      const settledVal = sec.units.settled * sec.unitNAV;
      const assignedVal = sec.units.assigned * sec.unitNAV;
      const pendingVal = sec.units.pending * sec.unitNAV;
      const totalVal = sec.units.total * sec.unitNAV;

      totalPortfolioValuation += totalVal;
      totalSettledValuation += settledVal;
      totalAssignedValuation += assignedVal;
      totalPendingValuation += pendingVal;
    });

    const settledRatio = totalPortfolioValuation > 0 ? (totalSettledValuation / totalPortfolioValuation) * 100 : 0;

    return {
      totalPortfolioValuation,
      totalSettledValuation,
      totalAssignedValuation,
      totalPendingValuation,
      settledRatio,
    };
  }, [securities]);

  // Dynamic NAV live micro-tick simulation
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurities((prev) =>
        prev.map((sec) => {
          const delta = (Math.random() - 0.49) * (sec.unitNAV * 0.0004);
          const newNAV = Math.max(1, Number((sec.unitNAV + delta).toFixed(2)));
          return {
            ...sec,
            unitNAV: newNAV,
          };
        })
      );
    }, 4500);

    return () => clearInterval(interval);
  }, []);

  // Format currency with luxury precision
  const formatUSD = useCallback((val: number, precision = 2) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
      minimumFractionDigits: precision,
      maximumFractionDigits: precision,
    }).format(val);
  }, []);

  // Trigger Modern Treasury Live Auto-Reconciliation Engine
  const triggerAiAutoRebalance = () => {
    setIsAiBalancing(true);
    const timestamp = new Date().toISOString().substring(11, 19);

    setNeuralAuditLog((prev) => [
      `[${timestamp}] [AI-AUDIT] Initiating Modern Treasury Ledger auto-balancing protocol...`,
      `[${timestamp}] [CITI-CORE] Querying multi-jurisdictional clearing balances (Fedwire, CREST, Euroclear)...`,
      ...prev.slice(0, 15),
    ]);

    setTimeout(() => {
      setSecurities((prev) =>
        prev.map((sec) => {
          if (sec.units.pending > 0 || sec.reconciliationStatus === 'DRIFT_DETECTED') {
            const resolvedUnits = sec.units.pending;
            return {
              ...sec,
              units: {
                ...sec.units,
                pending: 0,
                confirmed: 0,
                settled: sec.units.settled + resolvedUnits + sec.units.confirmed,
                total: sec.units.total,
              },
              reconciliationStatus: 'OPTIMAL',
              lastBalancingTimestamp: new Date().toISOString(),
            };
          }
          return sec;
        })
      );

      const newTx: ModernTreasuryLedgerEntry = {
        id: `MT-TX-${Math.floor(100000 + Math.random() * 900000)}`,
        transactionRef: `mt_ltx_ai_settle_${Date.now().toString().slice(-6)}`,
        citiClearingRef: `CITI-GLOBAL-SETTLE-${Math.floor(1000000 + Math.random() * 9000000)}`,
        securityId: selectedSecurity.id,
        ticker: selectedSecurity.ticker,
        type: 'CREDIT',
        accountType: 'ACTIVE_PORTFOLIO',
        amount: selectedSecurity.units.pending * selectedSecurity.unitNAV || 54200000,
        unitsImpacted: selectedSecurity.units.pending || 1500,
        stateTransition: 'AI AUTO-BALANCED: PENDING → SETTLED FINALITY',
        timestamp: new Date().toISOString(),
        aiVerificationHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 16).toString(16)).join('')}`,
        status: 'POSTED',
      };

      setLedgerEntries((prev) => [newTx, ...prev]);
      setIsAiBalancing(false);

      setNeuralAuditLog((prev) => [
        `[${new Date().toISOString().substring(11, 19)}] [SUCCESS] Modern Treasury v2 Ledger Balanced: Zero-Drift Finality Reached.`,
        ...prev,
      ]);
    }, 2200);
  };

  // State Transition Action (Simulated Unit Settlement pipeline)
  const handleTransitionUnits = (holdingId: string, transitionType: 'CONFIRM_PENDING' | 'SETTLE_CONFIRMED' | 'ASSIGN_COLLATERAL') => {
    setSecurities((prev) =>
      prev.map((item) => {
        if (item.id !== holdingId) return item;

        const updated = { ...item };
        if (transitionType === 'CONFIRM_PENDING' && updated.units.pending > 0) {
          const shift = Math.ceil(updated.units.pending / 2);
          updated.units.pending -= shift;
          updated.units.confirmed += shift;
        } else if (transitionType === 'SETTLE_CONFIRMED' && updated.units.confirmed > 0) {
          const shift = updated.units.confirmed;
          updated.units.confirmed = 0;
          updated.units.settled += shift;
        } else if (transitionType === 'ASSIGN_COLLATERAL' && updated.units.settled > 50) {
          const shift = 50;
          updated.units.settled -= shift;
          updated.units.assigned += shift;
        }

        updated.lastBalancingTimestamp = new Date().toISOString();
        return updated;
      })
    );

    const logStamp = new Date().toISOString().substring(11, 19);
    setNeuralAuditLog((prev) => [
      `[${logStamp}] [STATE-TRANSITION] Holding ${holdingId} executed ${transitionType}. Verified via Modern Treasury ledger ledger_entries.create()`,
      ...prev.slice(0, 15),
    ]);
  };

  const filteredSecurities = useMemo(() => {
    return securities.filter((s) => {
      const matchesSearch =
        s.ticker.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.cusip.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesClass = filterClass === 'ALL' || s.assetClass === filterClass;
      return matchesSearch && matchesClass;
    });
  }, [securities, searchQuery, filterClass]);

  return (
    <div className="min-h-screen bg-[#07090e] text-[#e2e8f0] font-sans antialiased selection:bg-amber-500 selection:text-black p-4 sm:p-6 lg:p-8">
      {/* Top Sovereign Institutional Status Bar */}
      <div className="max-w-7xl mx-auto mb-8 border-b border-amber-500/20 pb-6 flex flex-col xl:flex-row xl:items-center xl:justify-between gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="flex h-3 w-3 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-3 w-3 bg-emerald-500"></span>
            </span>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-amber-400/90 flex items-center gap-1.5">
              <Landmark className="w-4 h-4 text-amber-400" />
              Citibank Global Wealth & Sovereign Custody
            </span>
            <span className="text-slate-600 text-xs">/</span>
            <span className="text-xs uppercase tracking-[0.25em] font-semibold text-cyan-400/90 flex items-center gap-1.5">
              <Database className="w-3.5 h-3.5 text-cyan-400" />
              Modern Treasury Real-Time Ledger Core
            </span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extralight tracking-tight text-white mt-2 flex items-center gap-3">
            Securities Ledger Bridge
            <span className="text-xs tracking-widest font-mono uppercase bg-amber-500/10 text-amber-300 border border-amber-500/30 px-2.5 py-1 rounded">
              v9.4.0 Sovereign Grade
            </span>
          </h1>
          <p className="text-sm text-slate-400 max-w-2xl mt-1">
            Automated double-entry unit state machine: Pending, Confirmed, Assigned & Settled ledgers synced across Citi Clearing & Modern Treasury programmatic accounts.
          </p>
        </div>

        {/* Global Key Metrics Badges */}
        <div className="flex flex-wrap items-center gap-4">
          <div className="bg-[#0e131f] border border-slate-800/80 rounded-xl px-5 py-3 shadow-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono flex items-center justify-between">
              Total Managed NAV
              <span className="text-emerald-400 flex items-center text-[10px]">
                <ArrowUpRight className="w-3 h-3" /> +1.28%
              </span>
            </div>
            <div className="text-2xl font-light text-white font-mono mt-0.5">
              {formatUSD(portfolioSummary.totalPortfolioValuation)}
            </div>
          </div>

          <div className="bg-[#0e131f] border border-slate-800/80 rounded-xl px-5 py-3 shadow-2xl backdrop-blur-md">
            <div className="text-[10px] uppercase tracking-wider text-slate-400 font-mono">
              Ledger Settlement Ratio
            </div>
            <div className="text-2xl font-light text-amber-400 font-mono mt-0.5 flex items-center gap-2">
              {portfolioSummary.settledRatio.toFixed(2)}%
              <span className="text-[10px] font-normal text-slate-400 font-sans">Finality Lock</span>
            </div>
          </div>

          <button
            onClick={triggerAiAutoRebalance}
            disabled={isAiBalancing}
            className={`relative overflow-hidden group px-6 py-3.5 rounded-xl font-medium text-xs uppercase tracking-widest transition-all duration-300 flex items-center gap-2.5 shadow-lg ${
              isAiBalancing
                ? 'bg-amber-500/20 text-amber-200 border border-amber-500/40 cursor-wait'
                : 'bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-black font-semibold shadow-amber-500/20 hover:shadow-amber-500/40'
            }`}
          >
            <Sparkles className={`w-4 h-4 ${isAiBalancing ? 'animate-spin' : ''}`} />
            {isAiBalancing ? 'Rebalancing Ledgers...' : 'AI Auto-Rebalance'}
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Securities Units Ledger Breakdown (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Unit States Multi-Bucket Monitor */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            <div className="bg-[#0c101a] border border-cyan-500/20 rounded-xl p-4 relative overflow-hidden">
              <div className="text-[11px] font-mono uppercase tracking-wider text-cyan-400 flex items-center gap-1.5">
                <Activity className="w-3.5 h-3.5" />
                Pending Units
              </div>
              <div className="text-xl font-semibold text-white font-mono mt-2">
                {securities.reduce((acc, c) => acc + c.units.pending, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {formatUSD(portfolioSummary.totalPendingValuation)} in transit
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none text-cyan-400">
                <Boxes className="w-16 h-16" />
              </div>
            </div>

            <div className="bg-[#0c101a] border border-blue-500/20 rounded-xl p-4 relative overflow-hidden">
              <div className="text-[11px] font-mono uppercase tracking-wider text-blue-400 flex items-center gap-1.5">
                <FileCheck className="w-3.5 h-3.5" />
                Confirmed Lock
              </div>
              <div className="text-xl font-semibold text-white font-mono mt-2">
                {securities.reduce((acc, c) => acc + c.units.confirmed, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                Pre-matched Clearing DTC
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none text-blue-400">
                <ShieldCheck className="w-16 h-16" />
              </div>
            </div>

            <div className="bg-[#0c101a] border border-purple-500/20 rounded-xl p-4 relative overflow-hidden">
              <div className="text-[11px] font-mono uppercase tracking-wider text-purple-400 flex items-center gap-1.5">
                <Lock className="w-3.5 h-3.5" />
                Assigned Margin
              </div>
              <div className="text-xl font-semibold text-white font-mono mt-2">
                {securities.reduce((acc, c) => acc + c.units.assigned, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {formatUSD(portfolioSummary.totalAssignedValuation)} pledged
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none text-purple-400">
                <Scale className="w-16 h-16" />
              </div>
            </div>

            <div className="bg-[#0c101a] border border-emerald-500/20 rounded-xl p-4 relative overflow-hidden">
              <div className="text-[11px] font-mono uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <CheckCircle2 className="w-3.5 h-3.5" />
                Settled Finality
              </div>
              <div className="text-xl font-semibold text-white font-mono mt-2">
                {securities.reduce((acc, c) => acc + c.units.settled, 0).toLocaleString()}
              </div>
              <div className="text-[10px] text-slate-400 mt-1 truncate">
                {formatUSD(portfolioSummary.totalSettledValuation)} MT ledgered
              </div>
              <div className="absolute right-0 bottom-0 translate-x-2 translate-y-2 opacity-5 pointer-events-none text-emerald-400">
                <Landmark className="w-16 h-16" />
              </div>
            </div>
          </div>

          {/* Search and Asset Class Filter */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 bg-[#0c101a] border border-slate-800 p-4 rounded-xl">
            <div className="relative w-full sm:w-80">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                placeholder="Search CUSIP, Ticker, Asset..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-[#131824] border border-slate-700/80 rounded-lg pl-9 pr-3 py-1.5 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/70"
              />
            </div>
            <div className="flex items-center gap-2 overflow-x-auto w-full sm:w-auto">
              {['ALL', 'Sovereign Debt', 'Ultra-Cap Equity', 'Private Institutional', 'Tokenized Bullion'].map(
                (filter) => (
                  <button
                    key={filter}
                    onClick={() => setFilterClass(filter)}
                    className={`text-[11px] font-mono px-3 py-1.5 rounded-lg whitespace-nowrap transition-all ${
                      filterClass === filter
                        ? 'bg-amber-500/20 text-amber-300 border border-amber-500/40 font-semibold'
                        : 'bg-[#131824] text-slate-400 hover:text-white border border-slate-800'
                    }`}
                  >
                    {filter}
                  </button>
                )
              )}
            </div>
          </div>

          {/* Securities Master Ledger Table */}
          <div className="bg-[#0c101a] border border-slate-800 rounded-xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <span className="text-xs uppercase tracking-wider font-semibold text-white">
                  Programmatic Securities Ledger
                </span>
                <span className="text-[10px] text-slate-500 font-mono">
                  ({filteredSecurities.length} Sovereign Assets Active)
                </span>
              </div>
              <span className="text-[10px] font-mono text-slate-400 flex items-center gap-1">
                Modern Treasury Double-Entry sync:
                <span className="text-emerald-400 font-bold">ONLINE</span>
              </span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead className="bg-[#080b12] text-slate-400 font-mono text-[10px] uppercase border-b border-slate-800">
                  <tr>
                    <th className="py-3 px-4">Asset / CUSIP</th>
                    <th className="py-3 px-4 text-right">NAV (Mark-to-Market)</th>
                    <th className="py-3 px-4 text-center">Unit State Breakdown</th>
                    <th className="py-3 px-4 text-right">Position Valuation</th>
                    <th className="py-3 px-4 text-center">Status</th>
                    <th className="py-3 px-4 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60 font-mono">
                  {filteredSecurities.map((sec) => {
                    const totalVal = sec.units.total * sec.unitNAV;
                    const isSelected = selectedSecurity.id === sec.id;

                    return (
                      <tr
                        key={sec.id}
                        onClick={() => setSelectedSecurity(sec)}
                        className={`cursor-pointer transition-colors ${
                          isSelected
                            ? 'bg-amber-500/5 hover:bg-amber-500/10'
                            : 'hover:bg-slate-800/30'
                        }`}
                      >
                        <td className="py-3.5 px-4">
                          <div className="font-sans font-bold text-white flex items-center gap-2">
                            {sec.ticker}
                            <span className="text-[9px] font-mono font-normal bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded">
                              {sec.assetClass}
                            </span>
                          </div>
                          <div className="text-[10px] text-slate-400 truncate max-w-[200px] font-sans">
                            {sec.name}
                          </div>
                          <div className="text-[9px] text-slate-500 font-mono mt-0.5">
                            CUSIP: {sec.cusip} • {sec.custodian}
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono">
                          <div className="text-white font-medium">{formatUSD(sec.unitNAV)}</div>
                          <div
                            className={`text-[10px] flex items-center justify-end gap-0.5 ${
                              sec.navChange24h >= 0 ? 'text-emerald-400' : 'text-rose-400'
                            }`}
                          >
                            {sec.navChange24h >= 0 ? '+' : ''}
                            {sec.navChange24h.toFixed(2)}%
                          </div>
                        </td>

                        <td className="py-3.5 px-4">
                          <div className="flex flex-col gap-1 w-48 mx-auto">
                            {/* Visual Unit State Stack Bar */}
                            <div className="h-2 w-full bg-slate-800 rounded-full overflow-hidden flex">
                              <div
                                style={{ width: `${(sec.units.settled / sec.units.total) * 100}%` }}
                                className="bg-emerald-500 h-full"
                                title={`Settled: ${sec.units.settled}`}
                              />
                              <div
                                style={{ width: `${(sec.units.assigned / sec.units.total) * 100}%` }}
                                className="bg-purple-500 h-full"
                                title={`Assigned: ${sec.units.assigned}`}
                              />
                              <div
                                style={{ width: `${(sec.units.confirmed / sec.units.total) * 100}%` }}
                                className="bg-blue-500 h-full"
                                title={`Confirmed: ${sec.units.confirmed}`}
                              />
                              <div
                                style={{ width: `${(sec.units.pending / sec.units.total) * 100}%` }}
                                className="bg-cyan-500 h-full"
                                title={`Pending: ${sec.units.pending}`}
                              />
                            </div>
                            <div className="flex justify-between text-[9px] text-slate-400">
                              <span className="text-cyan-400">P:{sec.units.pending}</span>
                              <span className="text-blue-400">C:{sec.units.confirmed}</span>
                              <span className="text-purple-400">A:{sec.units.assigned}</span>
                              <span className="text-emerald-400">S:{sec.units.settled}</span>
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 px-4 text-right font-mono font-medium text-amber-300">
                          {formatUSD(totalVal)}
                        </td>

                        <td className="py-3.5 px-4 text-center">
                          <span
                            className={`inline-flex items-center px-2 py-0.5 rounded-full text-[9px] font-mono uppercase tracking-wider ${
                              sec.reconciliationStatus === 'OPTIMAL'
                                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                                : sec.reconciliationStatus === 'DRIFT_DETECTED'
                                ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                            }`}
                          >
                            {sec.reconciliationStatus}
                          </span>
                        </td>

                        <td className="py-3.5 px-4 text-right">
                          <div className="flex items-center justify-end gap-1.5">
                            {sec.units.pending > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTransitionUnits(sec.id, 'CONFIRM_PENDING');
                                }}
                                title="Move 50% Pending to Confirmed"
                                className="px-2 py-1 bg-cyan-950/60 hover:bg-cyan-900 border border-cyan-700/50 rounded text-[10px] text-cyan-300 transition"
                              >
                                Confirm
                              </button>
                            )}
                            {sec.units.confirmed > 0 && (
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  handleTransitionUnits(sec.id, 'SETTLE_CONFIRMED');
                                }}
                                title="Settle All Confirmed to Ledger Finality"
                                className="px-2 py-1 bg-emerald-950/60 hover:bg-emerald-900 border border-emerald-700/50 rounded text-[10px] text-emerald-300 transition"
                              >
                                Settle
                              </button>
                            )}
                            <button
                              onClick={(e) => {
                                e.stopPropagation();
                                handleTransitionUnits(sec.id, 'ASSIGN_COLLATERAL');
                              }}
                              title="Assign 50 Settled units to Collateral"
                              className="px-2 py-1 bg-purple-950/60 hover:bg-purple-900 border border-purple-700/50 rounded text-[10px] text-purple-300 transition"
                            >
                              Assign
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>

          {/* Double Entry Modern Treasury Ledger Journal */}
          <div className="bg-[#0c101a] border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-cyan-400" />
                <h2 className="text-xs uppercase tracking-wider font-semibold text-white">
                  Modern Treasury Automated Journal Entries
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-500">
                Ledger Bridge Sync: Live REST v2 Webhook active
              </span>
            </div>

            <div className="space-y-2.5">
              {ledgerEntries.map((tx) => (
                <div
                  key={tx.id}
                  className="bg-[#080b12] border border-slate-800/80 rounded-lg p-3 flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs"
                >
                  <div className="space-y-0.5">
                    <div className="flex items-center gap-2 font-mono">
                      <span className="text-slate-300 font-semibold">{tx.ticker}</span>
                      <span className="text-[10px] text-slate-500">{tx.transactionRef}</span>
                      <span
                        className={`text-[9px] px-1.5 py-0.2 rounded uppercase ${
                          tx.type === 'CREDIT'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {tx.type} • {tx.accountType}
                      </span>
                    </div>
                    <div className="text-[11px] text-slate-400 font-sans flex items-center gap-2">
                      <span>{tx.stateTransition}</span>
                      <span className="text-slate-600">•</span>
                      <span className="font-mono text-[10px] text-slate-500">
                        Citi Ref: {tx.citiClearingRef}
                      </span>
                    </div>
                  </div>

                  <div className="flex items-center gap-4 w-full md:w-auto justify-between md:justify-end">
                    <div className="text-right font-mono">
                      <div className="text-white font-medium">{formatUSD(tx.amount)}</div>
                      <div className="text-[10px] text-slate-500">
                        {tx.unitsImpacted.toLocaleString()} Units Affected
                      </div>
                    </div>
                    <div className="text-right">
                      <span className="inline-flex items-center gap-1 text-[9px] font-mono text-emerald-400 bg-emerald-950/40 border border-emerald-800/40 px-2 py-0.5 rounded">
                        <CheckCircle2 className="w-2.5 h-2.5" />
                        {tx.status}
                      </span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Right Column: AI Sentinel, Holding Deep-Dive & Modern Treasury Ledger Config (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          {/* Selected Asset Deep Dive Card */}
          <div className="bg-[#0c101a] border border-amber-500/30 rounded-xl p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 p-4 opacity-10 pointer-events-none">
              <Landmark className="w-24 h-24 text-amber-400" />
            </div>

            <div className="text-[10px] uppercase font-mono tracking-widest text-amber-400 mb-1">
              Active Focus Ledger Asset
            </div>
            <h3 className="text-xl font-light text-white">{selectedSecurity.ticker}</h3>
            <p className="text-xs text-slate-400 mt-0.5">{selectedSecurity.name}</p>

            <div className="mt-4 pt-4 border-t border-slate-800/80 space-y-3 font-mono text-xs">
              <div className="flex justify-between">
                <span className="text-slate-500">Modern Treasury Account:</span>
                <span className="text-slate-300 font-mono text-[11px]">
                  {selectedSecurity.mtLedgerAccountId}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Global Custodian:</span>
                <span className="text-slate-300 font-sans text-[11px] text-right">
                  {selectedSecurity.custodian}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">NAV per Security Unit:</span>
                <span className="text-amber-400 font-bold">
                  {formatUSD(selectedSecurity.unitNAV)}
                </span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-500">Current Position Aggregate:</span>
                <span className="text-white font-bold">
                  {formatUSD(selectedSecurity.units.total * selectedSecurity.unitNAV)}
                </span>
              </div>
            </div>

            {/* Quick Transition Trigger Buttons for Selected Asset */}
            <div className="mt-5 grid grid-cols-2 gap-2">
              <button
                onClick={() => handleTransitionUnits(selectedSecurity.id, 'CONFIRM_PENDING')}
                disabled={selectedSecurity.units.pending === 0}
                className="w-full py-2 bg-[#131824] hover:bg-[#1a2233] disabled:opacity-40 disabled:cursor-not-allowed border border-cyan-800/40 rounded-lg text-cyan-300 text-[11px] font-mono tracking-wide transition"
              >
                Confirm Pending ({selectedSecurity.units.pending})
              </button>
              <button
                onClick={() => handleTransitionUnits(selectedSecurity.id, 'SETTLE_CONFIRMED')}
                disabled={selectedSecurity.units.confirmed === 0}
                className="w-full py-2 bg-[#131824] hover:bg-[#1a2233] disabled:opacity-40 disabled:cursor-not-allowed border border-emerald-800/40 rounded-lg text-emerald-300 text-[11px] font-mono tracking-wide transition"
              >
                Settle Units ({selectedSecurity.units.confirmed})
              </button>
            </div>
          </div>

          {/* AI Autonomous Ledger Sentinel Panel */}
          <div className="bg-[#0c101a] border border-slate-800 rounded-xl p-5 shadow-2xl">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2">
                <Cpu className="w-4 h-4 text-amber-400" />
                <h3 className="text-xs uppercase tracking-wider font-semibold text-white">
                  Citi Neural Balancing Sentinel
                </h3>
              </div>
              <span className="h-2 w-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="text-[11px] text-slate-400 mb-3 font-sans">
              Autonomous reconciliation comparing Modern Treasury double-entry ledger against Citibank Fedwire & Euroclear gross settlement records.
            </div>

            <div className="bg-[#07090e] border border-slate-800 rounded-lg p-3 font-mono text-[10px] space-y-1.5 h-48 overflow-y-auto custom-scrollbar">
              {neuralAuditLog.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.includes('[SUCCESS]')
                      ? 'text-emerald-400'
                      : log.includes('[AI-AUDIT]')
                      ? 'text-amber-300'
                      : log.includes('[STATE-TRANSITION]')
                      ? 'text-cyan-300'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>

            <div className="mt-4 pt-3 border-t border-slate-800 flex items-center justify-between text-xs font-mono">
              <span className="text-slate-500">Autonomous Drift Target:</span>
              <span className="text-emerald-400 font-bold">&lt; 0.0001% Margin</span>
            </div>
          </div>

          {/* Institutional Compliance & Multi-Tier Verification Box */}
          <div className="bg-gradient-to-br from-[#0c101a] to-[#121826] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 text-xs font-semibold text-white uppercase tracking-wider mb-2">
              <ShieldCheck className="w-4 h-4 text-emerald-400" />
              Sovereign Ledger Assurance
            </div>
            <p className="text-[11px] text-slate-400 leading-relaxed">
              Every unit state alteration generates an immutable cryptographic verification hash anchored to Citibank Ultra-High Net Worth Clearing ledgers and Modern Treasury ledger transaction receipts.
            </p>
            <div className="mt-3 flex items-center justify-between text-[10px] font-mono text-slate-500">
              <span>Modern Treasury API: v2.48</span>
              <span>Citi Connect API: 4.12</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTreasurySecuritiesLedgerBridge;