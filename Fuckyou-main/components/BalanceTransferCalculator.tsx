import React, { useState, useMemo } from 'react';
import {
  TrendingDown,
  DollarSign,
  Percent,
  Calendar,
  Info,
  Plus,
  Trash2,
  AlertTriangle,
  BookOpen,
  BarChart2,
  Sliders,
  CheckCircle2,
  ArrowRight,
  Sparkles,
  HelpCircle,
  ChevronRight
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface DebtProfile {
  balance: number;
  apr: number;
  monthlyPayment: number;
}

interface TransferOffer {
  id: string;
  name: string;
  introApr: number;
  introMonths: number;
  feePercent: number;
  gotoApr: number;
  isCustom?: boolean;
}

interface AmortizationPoint {
  month: number;
  balance: number;
  interestPaid: number;
  feesPaid: number;
  cumulativeInterest: number;
}

interface SimulationResult {
  offerId: string;
  offerName: string;
  history: AmortizationPoint[];
  totalInterest: number;
  totalFees: number;
  totalPaid: number;
  monthsToPayoff: number;
  paidOff: boolean;
  savings: number;
  isBaseline: boolean;
}

export default function BalanceTransferCalculator() {
  // --- STATE ---
  const [debt, setDebt] = useState<DebtProfile>({
    balance: 12000,
    apr: 22.99,
    monthlyPayment: 400,
  });

  const [offers, setOffers] = useState<TransferOffer[]>([
    {
      id: 'offer-1',
      name: 'ClearPath 0% Promo',
      introApr: 0,
      introMonths: 18,
      feePercent: 3,
      gotoApr: 21.99,
    },
    {
      id: 'offer-2',
      name: 'FlexDebt Low APR Extended',
      introApr: 1.99,
      introMonths: 24,
      feePercent: 4,
      gotoApr: 23.99,
    },
  ]);

  const [customOffer, setCustomOffer] = useState<Omit<TransferOffer, 'id'>>({
    name: 'My Custom Offer',
    introApr: 0,
    introMonths: 12,
    feePercent: 3,
    gotoApr: 20.99,
  });

  const [activeTab, setActiveTab] = useState<'dashboard' | 'breakdown' | 'scenarios' | 'education'>('dashboard');
  
  // Stress Testing State
  const [stressTest, setStressTest] = useState({
    extraPayment: 100,
    unexpectedExpense: 0,
    expenseMonth: 6,
  });

  // --- SIMULATION ENGINE ---
  const runSimulation = (
    profile: DebtProfile,
    offer?: TransferOffer,
    extraPay: number = 0,
    unexpExpense: number = 0,
    unexpMonth: number = 0
  ): SimulationResult => {
    const startBalance = profile.balance;
    let currentBalance = startBalance;
    let totalFees = 0;

    if (offer) {
      const fee = startBalance * (offer.feePercent / 100);
      currentBalance += fee;
      totalFees = fee;
    }

    const history: AmortizationPoint[] = [
      {
        month: 0,
        balance: currentBalance,
        interestPaid: 0,
        feesPaid: totalFees,
        cumulativeInterest: 0,
      },
    ];

    let cumulativeInterest = 0;
    let month = 1;
    const maxMonths = 120; // 10-year cap to prevent infinite loops
    const basePayment = profile.monthlyPayment;

    while (currentBalance > 0.01 && month <= maxMonths) {
      // Apply unexpected expense if applicable
      if (month === unexpMonth && unexpExpense > 0) {
        currentBalance += unexpExpense;
      }

      // Determine active APR
      const currentApr = offer
        ? month <= offer.introMonths
          ? offer.introApr
          : offer.gotoApr
        : profile.apr;

      const monthlyInterestRate = currentApr / 100 / 12;
      const interestPaid = currentBalance * monthlyInterestRate;
      cumulativeInterest += interestPaid;

      // Calculate payment
      const totalAvailablePayment = basePayment + extraPay;
      const paymentThisMonth = Math.min(totalAvailablePayment, currentBalance + interestPaid);

      currentBalance = currentBalance + interestPaid - paymentThisMonth;

      if (currentBalance < 0) currentBalance = 0;

      history.push({
        month,
        balance: currentBalance,
        interestPaid,
        feesPaid: month === 1 ? totalFees : 0,
        cumulativeInterest,
      });

      month++;
    }

    const totalPaid = startBalance + cumulativeInterest + totalFees;

    return {
      offerId: offer ? offer.id : 'baseline',
      offerName: offer ? offer.name : 'Keep Current Card (No Transfer)',
      history,
      totalInterest: cumulativeInterest,
      totalFees,
      totalPaid,
      monthsToPayoff: month - 1,
      paidOff: currentBalance <= 0.01,
      savings: 0, // Will be calculated relative to baseline
      isBaseline: !offer,
    };
  };

  // Compute all simulations
  const simulations = useMemo(() => {
    // 1. Baseline
    const baseline = runSimulation(debt);
    
    // 2. Offers
    const results = offers.map((offer) => {
      const sim = runSimulation(debt, offer, stressTest.extraPayment, stressTest.unexpectedExpense, stressTest.expenseMonth);
      return {
        ...sim,
        savings: Math.max(0, baseline.totalPaid - sim.totalPaid),
      };
    });

    return [
      { ...baseline, savings: 0 },
      ...results,
    ];
  }, [debt, offers, stressTest]);

  const baselineSim = simulations[0];
  const activeOfferSims = simulations.slice(1);
  const bestOffer = [...activeOfferSims].sort((a, b) => b.savings - a.savings)[0];

  // --- HANDLERS ---
  const handleAddOffer = (e: React.FormEvent) => {
    e.preventDefault();
    const newOffer: TransferOffer = {
      ...customOffer,
      id: `custom-${Date.now()}`,
      isCustom: true,
    };
    setOffers([...offers, newOffer]);
    setCustomOffer({
      name: 'My Custom Offer',
      introApr: 0,
      introMonths: 12,
      feePercent: 3,
      gotoApr: 20.99,
    });
  };

  const handleDeleteOffer = (id: string) => {
    setOffers(offers.filter((o) => o.id !== id));
  };

  // --- CHART HELPERS ---
  const maxMonthsForChart = Math.min(
    120,
    Math.max(...simulations.map((s) => s.monthsToPayoff), 12)
  );

  const maxBalanceForChart = Math.max(
    ...simulations.flatMap((s) => s.history.map((h) => h.balance)),
    debt.balance
  );

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 font-sans antialiased">
      {/* Header Banner */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30">
              <TrendingDown className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                Smart Balance Transfer Optimizer
                <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  v2.4 Live
                </span>
              </h1>
              <p className="text-xs text-slate-400">Simulate, stress-test, and map your path to zero debt.</p>
            </div>
          </div>

          {bestOffer && bestOffer.savings > 0 && (
            <div className="flex items-center gap-3 bg-emerald-500/10 border border-emerald-500/20 rounded-xl px-4 py-2">
              <Sparkles className="w-5 h-5 text-emerald-400 animate-pulse" />
              <div>
                <p className="text-xs text-slate-400 font-medium">Max Potential Savings</p>
                <p className="text-sm font-bold text-emerald-400">
                  Save ${Math.round(bestOffer.savings).toLocaleString()} with {bestOffer.offerName}
                </p>
              </div>
            </div>
          )}
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: SIDEBAR INPUTS */}
          <section className="lg:col-span-4 space-y-6">
            
            {/* 1. Current Debt Profile */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <DollarSign className="w-4 h-4 text-indigo-400" />
                Current Debt Profile
              </h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Current Card Balance</label>
                  <div className="relative">
                    <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                    <input
                      type="number"
                      value={debt.balance}
                      onChange={(e) => setDebt({ ...debt, balance: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Current APR (%)</label>
                    <div className="relative">
                      <span className="absolute right-3 top-2.5 text-slate-500 text-sm">%</span>
                      <input
                        type="number"
                        step="0.01"
                        value={debt.apr}
                        onChange={(e) => setDebt({ ...debt, apr: Math.max(0, Number(e.target.value)) })}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-4 pr-8 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Monthly Payment</label>
                    <div className="relative">
                      <span className="absolute left-3 top-2.5 text-slate-500 text-sm">$</span>
                      <input
                        type="number"
                        value={debt.monthlyPayment}
                        onChange={(e) => setDebt({ ...debt, monthlyPayment: Math.max(10, Number(e.target.value)) })}
                        className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 pl-8 pr-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                      />
                    </div>
                  </div>
                </div>

                {debt.monthlyPayment < (debt.balance * (debt.apr / 100 / 12)) && (
                  <div className="flex gap-2 bg-amber-500/10 border border-amber-500/20 rounded-xl p-3 text-xs text-amber-400">
                    <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                    <p>Your monthly payment is less than the monthly interest. Your balance will grow over time.</p>
                  </div>
                )}
              </div>
            </div>

            {/* 2. Custom Offer Creator */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Create Custom Offer
              </h2>
              <form onSubmit={handleAddOffer} className="space-y-4">
                <div>
                  <label className="block text-xs text-slate-400 mb-1.5 font-medium">Offer Name</label>
                  <input
                    type="text"
                    required
                    value={customOffer.name}
                    onChange={(e) => setCustomOffer({ ...customOffer, name: e.target.value })}
                    className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    placeholder="e.g., Chase Slate Edge"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Intro APR (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customOffer.introApr}
                      onChange={(e) => setCustomOffer({ ...customOffer, introApr: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Intro Period (mo)</label>
                    <input
                      type="number"
                      value={customOffer.introMonths}
                      onChange={(e) => setCustomOffer({ ...customOffer, introMonths: Math.max(1, Number(e.target.value)) })}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Transfer Fee (%)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={customOffer.feePercent}
                      onChange={(e) => setCustomOffer({ ...customOffer, feePercent: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5 font-medium">Go-To APR (%)</label>
                    <input
                      type="number"
                      step="0.01"
                      value={customOffer.gotoApr}
                      onChange={(e) => setCustomOffer({ ...customOffer, gotoApr: Math.max(0, Number(e.target.value)) })}
                      className="w-full bg-slate-900/80 border border-slate-700 rounded-xl py-2 px-4 text-sm text-white focus:outline-none focus:border-indigo-500 transition"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-indigo-600 hover:bg-indigo-500 text-white font-medium py-2.5 px-4 rounded-xl text-sm transition flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/20"
                >
                  <Plus className="w-4 h-4" /> Add Offer to Compare
                </button>
              </form>
            </div>

            {/* 3. Active Offers List */}
            <div className="bg-slate-800/50 border border-slate-700/60 rounded-2xl p-6 backdrop-blur-sm">
              <h2 className="text-sm font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center justify-between">
                <span>Active Offers ({offers.length})</span>
                <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Simulated</span>
              </h2>
              <div className="space-y-3">
                {offers.map((offer) => (
                  <div
                    key={offer.id}
                    className="p-3.5 bg-slate-900/60 border border-slate-700/50 rounded-xl flex items-center justify-between gap-4 hover:border-slate-600 transition"
                  >
                    <div className="min-w-0">
                      <p className="text-sm font-semibold text-white truncate">{offer.name}</p>
                      <p className="text-xs text-slate-400 mt-0.5">
                        {offer.introApr}% for {offer.introMonths} mo • {offer.feePercent}% fee
                      </p>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      {offer.isCustom && (
                        <button
                          onClick={() => handleDeleteOffer(offer.id)}
                          className="p-1.5 text-slate-400 hover:text-rose-400 hover:bg-rose-500/10 rounded-lg transition"
                          title="Delete custom offer"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

          </section>

          {/* RIGHT COLUMN: TABS & MAIN VISUALIZATIONS */}
          <section className="lg:col-span-8 space-y-6">
            
            {/* Tab Navigation */}
            <div className="flex border-b border-slate-800 overflow-x-auto scrollbar-none">
              {[
                { id: 'dashboard', label: 'Comparison Dashboard', icon: BarChart2 },
                { id: 'breakdown', label: 'Detailed Breakdown', icon: Percent },
                { id: 'scenarios', label: 'Stress Testing', icon: Sliders },
                { id: 'education', label: 'Educational Guide', icon: BookOpen },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-5 py-3.5 border-b-2 text-sm font-medium whitespace-nowrap transition-all ${
                      isActive
                        ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                        : 'border-transparent text-slate-400 hover:text-slate-200 hover:bg-slate-800/30'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    {tab.label}
                  </button>
                );
              })}
            </div>

            {/* TAB CONTENT: 1. DASHBOARD */}
            {activeTab === 'dashboard' && (
              <div className="space-y-6">
                
                {/* Top Metrics Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                    <p className="text-xs text-slate-400 font-medium">Baseline Payoff Cost</p>
                    <p className="text-2xl font-bold text-white mt-1">
                      ${Math.round(baselineSim.totalPaid).toLocaleString()}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Includes ${Math.round(baselineSim.totalInterest).toLocaleString()} interest
                    </p>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5 border-l-4 border-l-emerald-500">
                    <p className="text-xs text-emerald-400 font-medium">Best Offer Savings</p>
                    <p className="text-2xl font-bold text-emerald-400 mt-1">
                      ${bestOffer ? Math.round(bestOffer.savings).toLocaleString() : '0'}
                    </p>
                    <p className="text-xs text-slate-400 mt-1">
                      With {bestOffer ? bestOffer.offerName : 'N/A'}
                    </p>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                    <p className="text-xs text-slate-400 font-medium">Payoff Speedup</p>
                    <p className="text-2xl font-bold text-indigo-400 mt-1">
                      {bestOffer ? `${baselineSim.monthsToPayoff - bestOffer.monthsToPayoff} Months` : '0 Months'}
                    </p>
                    <p className="text-xs text-slate-500 mt-1">
                      Faster path to debt freedom
                    </p>
                  </div>
                </div>

                {/* Trajectory Chart Card */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                    <div>
                      <h3 className="text-base font-semibold text-white">Debt Trajectory Over Time</h3>
                      <p className="text-xs text-slate-400">Visualizing balance reduction across different strategies</p>
                    </div>
                    {/* Legend */}
                    <div className="flex flex-wrap gap-3 text-xs">
                      {simulations.map((sim, idx) => (
                        <div key={sim.offerId} className="flex items-center gap-1.5">
                          <span
                            className="w-3 h-3 rounded-full"
                            style={{
                              backgroundColor:
                                idx === 0
                                  ? '#ef4444' // Red for baseline
                                  : idx === 1
                                  ? '#6366f1' // Indigo for offer 1
                                  : idx === 2
                                  ? '#10b981' // Emerald for offer 2
                                  : '#f59e0b', // Amber for others
                            }}
                          />
                          <span className="text-slate-300">{sim.offerName}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* SVG Line Chart */}
                  <div className="relative w-full h-64 sm:h-80">
                    <svg className="w-full h-full" viewBox="0 0 600 300" preserveAspectRatio="none">
                      {/* Grid Lines */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const y = 30 + ratio * 220;
                        const val = Math.round(maxBalanceForChart * (1 - ratio));
                        return (
                          <g key={i}>
                            <line x1="50" y1={y} x2="570" y2={y} stroke="#334155" strokeDasharray="4 4" strokeWidth="1" />
                            <text x="15" y={y + 4} fill="#94a3b8" fontSize="10" textAnchor="start">
                              ${val >= 1000 ? `${(val / 1000).toFixed(1)}k` : val}
                            </text>
                          </g>
                        );
                      })}

                      {/* X-Axis Labels (Months) */}
                      {[0, 0.25, 0.5, 0.75, 1].map((ratio, i) => {
                        const x = 50 + ratio * 520;
                        const monthVal = Math.round(maxMonthsForChart * ratio);
                        return (
                          <text key={i} x={x} y="275" fill="#94a3b8" fontSize="10" textAnchor="middle">
                            Mo {monthVal}
                          </text>
                        );
                      })}

                      {/* Paths */}
                      {simulations.map((sim, idx) => {
                        const color =
                          idx === 0
                            ? '#ef4444'
                            : idx === 1
                            ? '#6366f1'
                            : idx === 2
                            ? '#10b981'
                            : '#f59e0b';

                        // Generate SVG path points
                        const points = sim.history
                          .filter((h) => h.month <= maxMonthsForChart)
                          .map((h) => {
                            const x = 50 + (h.month / maxMonthsForChart) * 520;
                            const y = 250 - (h.balance / maxBalanceForChart) * 220;
                            return `${x},${y}`;
                          })
                          .join(' ');

                        return (
                          <polyline
                            key={sim.offerId}
                            fill="none"
                            stroke={color}
                            strokeWidth={idx === 0 ? '2' : '3'}
                            strokeDasharray={idx === 0 ? '4 4' : '0'}
                            points={points}
                          />
                        );
                      })}
                    </svg>
                  </div>
                </div>

                {/* Quick Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {activeOfferSims.map((sim) => (
                    <div
                      key={sim.offerId}
                      className="bg-slate-800/30 border border-slate-700/40 rounded-2xl p-5 flex flex-col justify-between"
                    >
                      <div>
                        <div className="flex items-center justify-between gap-2">
                          <h4 className="font-semibold text-white text-sm">{sim.offerName}</h4>
                          {sim.savings > 0 ? (
                            <span className="text-xs font-semibold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                              Save ${Math.round(sim.savings).toLocaleString()}
                            </span>
                          ) : (
                            <span className="text-xs font-semibold bg-rose-500/10 text-rose-400 px-2.5 py-0.5 rounded-full border border-rose-500/20">
                              No Savings
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-2">
                          Payoff in <strong className="text-slate-200">{sim.monthsToPayoff} months</strong> compared to{' '}
                          {baselineSim.monthsToPayoff} months baseline.
                        </p>
                      </div>

                      <div className="mt-4 pt-4 border-t border-slate-700/40 grid grid-cols-3 gap-2 text-center">
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase">Total Fees</p>
                          <p className="text-xs font-bold text-slate-300">${Math.round(sim.totalFees)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase">Total Interest</p>
                          <p className="text-xs font-bold text-slate-300">${Math.round(sim.totalInterest)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-slate-500 uppercase">Total Cost</p>
                          <p className="text-xs font-bold text-slate-300">${Math.round(sim.totalPaid)}</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB CONTENT: 2. DETAILED BREAKDOWN */}
            {activeTab === 'breakdown' && (
              <div className="space-y-6">
                
                {/* Cost Breakdown Bar Chart */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-white mb-2">Total Cost Breakdown</h3>
                  <p className="text-xs text-slate-400 mb-6">Comparing Principal, Fees, and Interest across all options</p>

                  <div className="space-y-5">
                    {simulations.map((sim, idx) => {
                      const total = sim.totalPaid;
                      const principalPercent = (debt.balance / total) * 100;
                      const feesPercent = (sim.totalFees / total) * 100;
                      const interestPercent = (sim.totalInterest / total) * 100;

                      return (
                        <div key={sim.offerId} className="space-y-2">
                          <div className="flex justify-between text-xs">
                            <span className="font-medium text-slate-300">{sim.offerName}</span>
                            <span className="text-slate-400">
                              Total: <strong className="text-white">${Math.round(total).toLocaleString()}</strong>
                            </span>
                          </div>
                          
                          {/* Stacked Bar */}
                          <div className="h-6 w-full bg-slate-900 rounded-lg overflow-hidden flex">
                            <div
                              style={{ width: `${principalPercent}%` }}
                              className="bg-emerald-600 h-full flex items-center justify-center text-[10px] font-bold text-white"
                              title={`Principal: $${debt.balance}`}
                            >
                              {principalPercent > 15 && 'Principal'}
                            </div>
                            {sim.totalFees > 0 && (
                              <div
                                style={{ width: `${feesPercent}%` }}
                                className="bg-indigo-500 h-full flex items-center justify-center text-[10px] font-bold text-white"
                                title={`Fees: $${Math.round(sim.totalFees)}`}
                              >
                                {feesPercent > 10 && 'Fee'}
                              </div>
                            )}
                            {sim.totalInterest > 0 && (
                              <div
                                style={{ width: `${interestPercent}%` }}
                                className="bg-rose-500 h-full flex items-center justify-center text-[10px] font-bold text-white"
                                title={`Interest: $${Math.round(sim.totalInterest)}`}
                              >
                                {interestPercent > 10 && 'Interest'}
                              </div>
                            )}
                          </div>
                        </div>
                      );
                    })}
                  </div>

                  {/* Legend */}
                  <div className="flex gap-4 mt-6 pt-4 border-t border-slate-700/40 text-xs justify-center">
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-emerald-600 rounded" />
                      <span className="text-slate-400">Original Principal</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-indigo-500 rounded" />
                      <span className="text-slate-400">Transfer Fees</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <span className="w-3 h-3 bg-rose-500 rounded" />
                      <span className="text-slate-400">Interest Paid</span>
                    </div>
                  </div>
                </div>

                {/* Detailed Comparison Table */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl overflow-hidden">
                  <div className="p-6 border-b border-slate-700/50">
                    <h3 className="text-base font-semibold text-white">Side-by-Side Comparison</h3>
                    <p className="text-xs text-slate-400">Granular financial metrics for each scenario</p>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="border-b border-slate-700/50 bg-slate-800/20 text-xs text-slate-400 uppercase tracking-wider">
                          <th className="py-3 px-6 font-medium">Strategy / Offer</th>
                          <th className="py-3 px-6 font-medium text-right">Payoff Time</th>
                          <th className="py-3 px-6 font-medium text-right">Total Interest</th>
                          <th className="py-3 px-6 font-medium text-right">Transfer Fee</th>
                          <th className="py-3 px-6 font-medium text-right">Total Cost</th>
                          <th className="py-3 px-6 font-medium text-right text-emerald-400">Net Savings</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-slate-700/40 text-sm">
                        {simulations.map((sim) => (
                          <tr key={sim.offerId} className="hover:bg-slate-800/20 transition">
                            <td className="py-4 px-6 font-medium text-white">{sim.offerName}</td>
                            <td className="py-4 px-6 text-right text-slate-300">{sim.monthsToPayoff} Months</td>
                            <td className="py-4 px-6 text-right text-slate-300">${Math.round(sim.totalInterest).toLocaleString()}</td>
                            <td className="py-4 px-6 text-right text-slate-300">${Math.round(sim.totalFees).toLocaleString()}</td>
                            <td className="py-4 px-6 text-right text-slate-300">${Math.round(sim.totalPaid).toLocaleString()}</td>
                            <td className="py-4 px-6 text-right font-semibold text-emerald-400">
                              {sim.isBaseline ? '-' : `$${Math.round(sim.savings).toLocaleString()}`}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

              </div>
            )}

            {/* TAB CONTENT: 3. STRESS TESTING */}
            {activeTab === 'scenarios' && (
              <div className="space-y-6">
                
                {/* Stress Test Controls */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-white mb-2">Custom Payoff Scenarios & Stress Testing</h3>
                  <p className="text-xs text-slate-400 mb-6">
                    Adjust variables to see how life events or extra payments impact your payoff timeline.
                  </p>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    {/* Extra Monthly Payment */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">Extra Monthly Payment</span>
                        <span className="text-indigo-400 font-bold">+${stressTest.extraPayment}/mo</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="1000"
                        step="25"
                        value={stressTest.extraPayment}
                        onChange={(e) => setStressTest({ ...stressTest, extraPayment: Number(e.target.value) })}
                        className="w-full accent-indigo-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500">Accelerates payoff & reduces post-promo interest.</p>
                    </div>

                    {/* Unexpected Expense */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">One-time Emergency Expense</span>
                        <span className="text-rose-400 font-bold">${stressTest.unexpectedExpense}</span>
                      </div>
                      <input
                        type="range"
                        min="0"
                        max="5000"
                        step="100"
                        value={stressTest.unexpectedExpense}
                        onChange={(e) => setStressTest({ ...stressTest, unexpectedExpense: Number(e.target.value) })}
                        className="w-full accent-rose-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer"
                      />
                      <p className="text-[10px] text-slate-500">Simulates an emergency charge added to the card.</p>
                    </div>

                    {/* Expense Month */}
                    <div className="space-y-2">
                      <div className="flex justify-between text-xs">
                        <span className="text-slate-300 font-medium">Emergency Month</span>
                        <span className="text-slate-300 font-bold">Month {stressTest.expenseMonth}</span>
                      </div>
                      <input
                        type="range"
                        min="1"
                        max="24"
                        step="1"
                        value={stressTest.expenseMonth}
                        disabled={stressTest.unexpectedExpense === 0}
                        onChange={(e) => setStressTest({ ...stressTest, expenseMonth: Number(e.target.value) })}
                        className="w-full accent-slate-500 bg-slate-700 h-1.5 rounded-lg appearance-none cursor-pointer disabled:opacity-30"
                      />
                      <p className="text-[10px] text-slate-500">When the emergency expense occurs.</p>
                    </div>
                  </div>
                </div>

                {/* Stress Test Results */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {simulations.map((sim) => (
                    <div
                      key={sim.offerId}
                      className={`p-5 rounded-2xl border transition ${
                        sim.isBaseline
                          ? 'bg-slate-800/20 border-slate-700/40'
                          : 'bg-slate-800/40 border-slate-700/60'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <h4 className="font-semibold text-white text-sm">{sim.offerName}</h4>
                        {sim.isBaseline ? (
                          <span className="text-[10px] bg-slate-700 text-slate-300 px-2 py-0.5 rounded-full">Baseline</span>
                        ) : (
                          <span className="text-[10px] bg-indigo-500/10 text-indigo-400 px-2 py-0.5 rounded-full border border-indigo-500/20">
                            Active Scenario
                          </span>
                        )}
                      </div>

                      <div className="space-y-3 text-xs">
                        <div className="flex justify-between">
                          <span className="text-slate-400">Payoff Timeline:</span>
                          <span className="text-slate-200 font-semibold">{sim.monthsToPayoff} Months</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Interest Paid:</span>
                          <span className="text-slate-200 font-semibold">${Math.round(sim.totalInterest).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between">
                          <span className="text-slate-400">Total Fees Paid:</span>
                          <span className="text-slate-200 font-semibold">${Math.round(sim.totalFees).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between pt-2 border-t border-slate-700/40">
                          <span className="text-slate-300 font-medium">Total Out-of-Pocket:</span>
                          <span className="text-white font-bold">${Math.round(sim.totalPaid).toLocaleString()}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

              </div>
            )}

            {/* TAB CONTENT: 4. EDUCATIONAL GUIDE */}
            {activeTab === 'education' && (
              <div className="space-y-6">
                
                {/* Intro Card */}
                <div className="bg-gradient-to-r from-indigo-900/40 to-slate-800/40 border border-indigo-500/20 rounded-2xl p-6">
                  <div className="flex items-start gap-4">
                    <div className="p-3 bg-indigo-600/20 text-indigo-400 rounded-xl border border-indigo-500/30 shrink-0">
                      <BookOpen className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-base font-semibold text-white">Mastering Balance Transfers</h3>
                      <p className="text-xs text-slate-300 mt-1 leading-relaxed">
                        A balance transfer can be an incredibly powerful tool to escape high-interest debt, but it requires strict discipline. If you don't pay off the balance before the promotional period ends, the "Go-To APR" can quickly erase your savings.
                      </p>
                    </div>
                  </div>
                </div>

                {/* Core Concepts Accordion/Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-indigo-400" />
                      How Balance Transfers Work
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      You open a new credit card with a 0% or low promotional APR on balance transfers. You transfer your existing high-interest debt to this new card. A transfer fee (typically 3% to 5%) is added to your new balance.
                    </p>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-rose-400" />
                      The "Go-To APR" Trap
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Once the promotional period (e.g., 12, 18, or 21 months) ends, any remaining balance is subject to the standard "Go-To APR," which is often very high (20%+). Always aim to pay off the balance completely before this date.
                    </p>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                      Calculating the Transfer Fee
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      If you transfer $10,000 with a 3% fee, $300 is immediately added to your balance, making your starting balance $10,300. Ensure the interest saved over the promo period is significantly higher than this fee.
                    </p>
                  </div>

                  <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-5">
                    <h4 className="font-semibold text-white text-sm flex items-center gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
                      Impact on Credit Score
                    </h4>
                    <p className="text-xs text-slate-400 mt-2 leading-relaxed">
                      Opening a new card triggers a hard inquiry, which may temporarily dip your score. However, increasing your overall credit limit will lower your credit utilization ratio, which can boost your score over time.
                    </p>
                  </div>
                </div>

                {/* Step-by-Step Checklist */}
                <div className="bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
                  <h3 className="text-base font-semibold text-white mb-4">Your Step-by-Step Action Plan</h3>
                  <div className="space-y-3">
                    {[
                      'Check your current credit score (most 0% offers require Good to Excellent credit).',
                      'Compare transfer fees vs. promotional lengths to find the optimal offer.',
                      'Apply for the chosen card and request the balance transfer during the application process.',
                      'Set up automatic payments to ensure you never miss a monthly payment.',
                      'Avoid making new purchases on the balance transfer card, as they may not qualify for the 0% rate.',
                    ].map((step, index) => (
                      <div key={index} className="flex items-start gap-3 text-xs text-slate-300">
                        <div className="p-1 bg-emerald-500/10 text-emerald-400 rounded-lg border border-emerald-500/20 shrink-0 mt-0.5">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        </div>
                        <p className="leading-relaxed">
                          <strong className="text-white">Step {index + 1}:</strong> {step}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>

              </div>
            )}

          </section>

        </div>
      </main>
    </div>
  );
}