import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Sparkles,
  TrendingUp,
  Shield,
  ArrowUpRight,
  ArrowDownRight,
  RefreshCw,
  Cpu,
  Layers,
  Globe2,
  Lock,
  CheckCircle2,
  Sliders,
  DollarSign,
  PieChart,
  Landmark,
  ChevronRight,
  AlertCircle,
  ExternalLink,
  Flame,
  Binary
} from 'lucide-react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface DualCurrencyDeposit {
  id: string;
  contractRef: string;
  baseCurrency: 'USD' | 'EUR' | 'GBP' | 'AUD' | 'SGD' | 'CHF';
  alternateCurrency: 'USD' | 'EUR' | 'GBP' | 'AUD' | 'SGD' | 'CNH' | 'JPY';
  principalAmount: number;
  strikeRate: number;
  spotRateCurrent: number;
  spotRateAtInception: number;
  customerInterestRate: number; // e.g. 14.85% p.a.
  benchmarkSOFR: number; // e.g. 5.32%
  spreadAlpha: number; // customer - benchmark
  tenorDays: number;
  fixingDate: string;
  maturityDate: string;
  daysRemaining: number;
  disposalAccountId: string;
  modernTreasuryLedgerAccount: string;
  status: 'ACTIVE_CONVERGED' | 'ACTIVE_OTM' | 'FIXING_PENDING' | 'SETTLED';
  aiQuantumProbabilityOTM: number; // 0-100%
  projectedReturnAlternate: number;
  projectedReturnBase: number;
}

export interface CallDepositAccount {
  id: string;
  citiAccountNumber: string;
  mtLedgerId: string;
  currency: string;
  currentBalance: number;
  availableBalance: number;
  tierYieldRate: number;
  autoSweepThreshold: number;
  sweepEnabled: boolean;
  benchmarkSpread: number;
  accruedInterestMTD: number;
  lastInterestPaid: string;
  routingCode: string;
  jurisdiction: 'CITI_PRIVATE_HK' | 'CITI_PRIVATE_SG' | 'CITI_PRIVATE_NY' | 'CITI_PRIVATE_CH';
}

export interface SouthboundQuotaMetrics {
  totalAllocatedQuota: number; // in RMB
  utilizedQuota: number;
  remainingQuota: number;
  regulatoryBody: 'HKMA / PBOC Sovereign Interlink';
  lastRebalanceTimestamp: string;
  complianceHash: string;
  quantumUtilizationTrend: 'ACCELERATING' | 'STABLE' | 'SATURATED';
}

export interface DisposalAccount {
  id: string;
  alias: string;
  bankName: string;
  ibanSwift: string;
  currency: string;
  isCitiInternal: boolean;
  mtCounterpartyId: string;
  verificationLevel: 'SOVEREIGN_TIER_4' | 'MULTI_SIG_EXECUTIVE';
}

// ============================================================================
// MOCK DATA (High Net Worth Citi Private / Modern Treasury Sovereign Tier)
// ============================================================================

const MOCK_DUAL_CURRENCIES: DualCurrencyDeposit[] = [
  {
    id: 'DCI-CPB-90281-X',
    contractRef: 'CITI-DCI-2025-08992-UHNW',
    baseCurrency: 'USD',
    alternateCurrency: 'SGD',
    principalAmount: 25000000.00,
    strikeRate: 1.3280,
    spotRateCurrent: 1.3412,
    spotRateAtInception: 1.3450,
    customerInterestRate: 16.40,
    benchmarkSOFR: 5.31,
    spreadAlpha: 11.09,
    tenorDays: 21,
    fixingDate: '2025-03-24T14:00:00Z',
    maturityDate: '2025-03-26T10:00:00Z',
    daysRemaining: 6,
    disposalAccountId: 'DISP-SG-CITI-01',
    modernTreasuryLedgerAccount: 'mt_la_9920194810283',
    status: 'ACTIVE_OTM',
    aiQuantumProbabilityOTM: 88.4,
    projectedReturnBase: 25235890.41,
    projectedReturnAlternate: 33513262.46,
  },
  {
    id: 'DCI-CPB-44102-Y',
    contractRef: 'CITI-DCI-2025-11029-SOV',
    baseCurrency: 'USD',
    alternateCurrency: 'CNH',
    principalAmount: 50000000.00,
    strikeRate: 7.1850,
    spotRateCurrent: 7.2340,
    spotRateAtInception: 7.2410,
    customerInterestRate: 18.25,
    benchmarkSOFR: 5.31,
    spreadAlpha: 12.94,
    tenorDays: 14,
    fixingDate: '2025-03-21T09:30:00Z',
    maturityDate: '2025-03-23T11:00:00Z',
    daysRemaining: 3,
    disposalAccountId: 'DISP-HK-CITI-09',
    modernTreasuryLedgerAccount: 'mt_la_7718290038174',
    status: 'ACTIVE_OTM',
    aiQuantumProbabilityOTM: 92.1,
    projectedReturnBase: 50350000.00,
    projectedReturnAlternate: 361765000.00,
  },
  {
    id: 'DCI-CPB-12890-Z',
    contractRef: 'CITI-DCI-2025-03481-ULTRA',
    baseCurrency: 'EUR',
    alternateCurrency: 'USD',
    principalAmount: 40000000.00,
    strikeRate: 1.0720,
    spotRateCurrent: 1.0715,
    spotRateAtInception: 1.0820,
    customerInterestRate: 14.10,
    benchmarkSOFR: 3.75,
    spreadAlpha: 10.35,
    tenorDays: 30,
    fixingDate: '2025-04-02T15:00:00Z',
    maturityDate: '2025-04-04T12:00:00Z',
    daysRemaining: 15,
    disposalAccountId: 'DISP-CH-CITI-04',
    modernTreasuryLedgerAccount: 'mt_la_5510293847162',
    status: 'ACTIVE_CONVERGED',
    aiQuantumProbabilityOTM: 49.3,
    projectedReturnBase: 40463561.64,
    projectedReturnAlternate: 43376938.08,
  },
];

const MOCK_CALL_DEPOSITS: CallDepositAccount[] = [
  {
    id: 'CALL-ACC-01',
    citiAccountNumber: 'CITI-PRIV-HK-8899-2311',
    mtLedgerId: 'mt_ledg_citi_vault_hk_01',
    currency: 'USD',
    currentBalance: 112500000.00,
    availableBalance: 87500000.00,
    tierYieldRate: 6.45,
    benchmarkSpread: 1.14,
    autoSweepThreshold: 10000000.00,
    sweepEnabled: true,
    accruedInterestMTD: 489210.45,
    lastInterestPaid: '2025-02-28',
    routingCode: 'CITIHKAX',
    jurisdiction: 'CITI_PRIVATE_HK',
  },
  {
    id: 'CALL-ACC-02',
    citiAccountNumber: 'CITI-PRIV-SG-4412-9902',
    mtLedgerId: 'mt_ledg_citi_vault_sg_09',
    currency: 'SGD',
    currentBalance: 84000000.00,
    availableBalance: 84000000.00,
    tierYieldRate: 5.15,
    benchmarkSpread: 1.35,
    autoSweepThreshold: 5000000.00,
    sweepEnabled: true,
    accruedInterestMTD: 298104.22,
    lastInterestPaid: '2025-02-28',
    routingCode: 'CITISGSG',
    jurisdiction: 'CITI_PRIVATE_SG',
  },
];

const MOCK_DISPOSAL_ACCOUNTS: DisposalAccount[] = [
  {
    id: 'DISP-SG-CITI-01',
    alias: 'Citi SG Sovereign Liquidity Pool IV',
    bankName: 'Citibank N.A. Singapore Branch',
    ibanSwift: 'CITISGSGXXX-9982001',
    currency: 'USD/SGD Multi-Clear',
    isCitiInternal: true,
    mtCounterpartyId: 'cprty_citi_sg_sov_pool',
    verificationLevel: 'SOVEREIGN_TIER_4',
  },
  {
    id: 'DISP-HK-CITI-09',
    alias: 'Citi HK Greater Bay Area Connect Hub',
    bankName: 'Citibank (Hong Kong) Limited',
    ibanSwift: 'CITIHKAX-0091823',
    currency: 'USD/CNH Cross-Clear',
    isCitiInternal: true,
    mtCounterpartyId: 'cprty_citi_gba_hub',
    verificationLevel: 'SOVEREIGN_TIER_4',
  },
  {
    id: 'DISP-CH-CITI-04',
    alias: 'Citi Geneva Alpine Vault Disbursal',
    bankName: 'Citibank (Switzerland) AG',
    ibanSwift: 'CITICHZZ-8827104',
    currency: 'EUR/CHF/USD Ultra',
    isCitiInternal: true,
    mtCounterpartyId: 'cprty_citi_ch_vault',
    verificationLevel: 'MULTI_SIG_EXECUTIVE',
  }
];

const MOCK_SOUTHBOUND_QUOTA: SouthboundQuotaMetrics = {
  totalAllocatedQuota: 1500000000.00, // 1.5 Billion RMB
  utilizedQuota: 1184500000.00,
  remainingQuota: 315500000.00,
  regulatoryBody: 'HKMA / PBOC Sovereign Interlink',
  lastRebalanceTimestamp: '2025-03-18T11:45:00Z',
  complianceHash: '0x8f2d9410bcae2847d8329e1104efbc908126e7a2b91',
  quantumUtilizationTrend: 'ACCELERATING',
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function SovereignPremiumDepositMatrix() {
  const [deposits, setDeposits] = useState<DualCurrencyDeposit[]>(MOCK_DUAL_CURRENCIES);
  const [callAccounts, setCallAccounts] = useState<CallDepositAccount[]>(MOCK_CALL_DEPOSITS);
  const [selectedDepositId, setSelectedDepositId] = useState<string>(MOCK_DUAL_CURRENCIES[0].id);
  const [quota, setQuota] = useState<SouthboundQuotaMetrics>(MOCK_SOUTHBOUND_QUOTA);
  const [isSimulatingAI, setIsSimulatingAI] = useState(false);
  const [aiQuantumFactor, setAiQuantumFactor] = useState<number>(1.042);
  const [showSweepModal, setShowSweepModal] = useState<boolean>(false);
  const [livePulse, setLivePulse] = useState<boolean>(true);

  // Active selected deposit
  const selectedDeposit = useMemo(() => {
    return deposits.find((d) => d.id === selectedDepositId) || deposits[0];
  }, [deposits, selectedDepositId]);

  // Aggregate Metrics
  const totalDCIInvestedUSD = useMemo(() => {
    return deposits.reduce((acc, curr) => {
      if (curr.baseCurrency === 'USD') return acc + curr.principalAmount;
      if (curr.baseCurrency === 'EUR') return acc + curr.principalAmount * 1.08;
      return acc + curr.principalAmount;
    }, 0);
  }, [deposits]);

  const totalCallLiquidityUSD = useMemo(() => {
    return callAccounts.reduce((acc, curr) => {
      if (curr.currency === 'USD') return acc + curr.currentBalance;
      if (curr.currency === 'SGD') return acc + curr.currentBalance * 0.75;
      return acc + curr.currentBalance;
    }, 0);
  }, [callAccounts]);

  const aggregateWeightedYield = useMemo(() => {
    let totalYieldUSD = 0;
    deposits.forEach((d) => {
      const amtUSD = d.baseCurrency === 'USD' ? d.principalAmount : d.principalAmount * 1.08;
      totalYieldUSD += amtUSD * (d.customerInterestRate / 100);
    });
    return (totalYieldUSD / totalDCIInvestedUSD) * 100;
  }, [deposits, totalDCIInvestedUSD]);

  // Trigger simulated AI Quantum Optimizations
  const triggerQuantumRebalance = useCallback(() => {
    setIsSimulatingAI(true);
    setTimeout(() => {
      setDeposits((prev) =>
        prev.map((item) => {
          const delta = (Math.random() * 0.004 - 0.002);
          const newProb = Math.min(99.8, Math.max(12.0, item.aiQuantumProbabilityOTM + (Math.random() * 4 - 2)));
          return {
            ...item,
            spotRateCurrent: +(item.spotRateCurrent + delta).toFixed(4),
            aiQuantumProbabilityOTM: +newProb.toFixed(1),
          };
        })
      );
      setAiQuantumFactor(+(1.03 + Math.random() * 0.03).toFixed(4));
      setIsSimulatingAI(false);
    }, 850);
  }, []);

  // Live Pulse ticker simulator
  useEffect(() => {
    const interval = setInterval(() => {
      setLivePulse((p) => !p);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 p-4 md:p-8 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* ================= HEADER: CITIBANK PRIVATE & MODERN TREASURY OMNI-BANNER ================= */}
      <header className="relative overflow-hidden rounded-3xl bg-gradient-to-r from-slate-950 via-[#0a1128] to-slate-950 border border-amber-500/20 p-6 md:p-8 shadow-2xl mb-8">
        <div className="absolute top-0 right-0 -mt-12 -mr-12 w-96 h-96 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute bottom-0 left-1/3 -mb-10 w-72 h-72 bg-blue-600/10 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="px-3 py-1 rounded-full bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 text-amber-300 text-xs font-semibold tracking-widest uppercase flex items-center gap-1.5 shadow-inner">
                <Shield className="w-3.5 h-3.5 text-amber-400" />
                Citibank Sovereign Private Banking Matrix
              </div>
              <div className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/30 text-blue-400 text-xs font-mono tracking-wider flex items-center gap-1.5">
                <Layers className="w-3.5 h-3.5 text-blue-400" />
                Modern Treasury Dual Ledger Active
              </div>
              <span className="flex h-2.5 w-2.5 relative">
                <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${livePulse ? 'bg-emerald-400' : 'bg-amber-400'} opacity-75`} />
                <span className={`relative inline-flex rounded-full h-2.5 w-2.5 ${livePulse ? 'bg-emerald-500' : 'bg-amber-500'}`} />
              </span>
            </div>

            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Premium Deposit <span className="text-transparent bg-clip-text bg-gradient-to-r from-amber-200 via-amber-400 to-yellow-500">&amp; Call Sovereign Matrix</span>
            </h1>
            <p className="text-sm md:text-base text-slate-400 max-w-3xl">
              High-frequency dual currency yield arbitrage, algorithmic FX strike risk mapping, and HKMA/PBOC Southbound cross-border liquidity conduits.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={triggerQuantumRebalance}
              disabled={isSimulatingAI}
              className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-slate-950 font-bold text-sm shadow-lg shadow-amber-500/20 hover:brightness-110 active:scale-95 transition duration-150 disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${isSimulatingAI ? 'animate-spin' : ''}`} />
              {isSimulatingAI ? 'Simulating Quantum Tensors...' : 'Trigger AI Yield Optimization'}
            </button>

            <button
              onClick={() => setShowSweepModal(!showSweepModal)}
              className="flex items-center gap-2 px-4 py-3 rounded-2xl bg-slate-900 border border-slate-700 hover:border-amber-500/50 text-slate-200 font-medium text-sm transition duration-150 backdrop-blur-md"
            >
              <Sliders className="w-4 h-4 text-amber-400" />
              Sweep Config
            </button>
          </div>
        </div>

        {/* Global Matrix Stat Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/80">
          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Total DCI Placed</div>
            <div className="text-2xl font-bold text-white mt-1">
              ${(totalDCIInvestedUSD / 1_000_000).toFixed(2)}M <span className="text-xs font-normal text-amber-400">USD Equiv.</span>
            </div>
            <div className="text-[11px] text-emerald-400 flex items-center gap-1 mt-1 font-mono">
              <TrendingUp className="w-3 h-3" /> +$12.5M vs previous cycle
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Call Deposit Liquidity</div>
            <div className="text-2xl font-bold text-white mt-1">
              ${(totalCallLiquidityUSD / 1_000_000).toFixed(2)}M <span className="text-xs font-normal text-blue-400">Instant Clean</span>
            </div>
            <div className="text-[11px] text-blue-300 flex items-center gap-1 mt-1 font-mono">
              <Layers className="w-3 h-3 text-blue-400" /> Modern Treasury Vault Sync OK
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Weighted Alpha Yield</div>
            <div className="text-2xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-amber-300 to-amber-500 mt-1">
              {aggregateWeightedYield.toFixed(2)}% <span className="text-xs font-normal text-slate-300">p.a.</span>
            </div>
            <div className="text-[11px] text-amber-300 flex items-center gap-1 mt-1 font-mono">
              <Sparkles className="w-3 h-3 text-amber-400" /> +{aiQuantumFactor}x Sovereign Benchmark
            </div>
          </div>

          <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-800 backdrop-blur-md">
            <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Southbound Quota Headroom</div>
            <div className="text-2xl font-bold text-white mt-1">
              ¥{(quota.remainingQuota / 1_000_000).toFixed(1)}M <span className="text-xs font-normal text-amber-400">RMB</span>
            </div>
            <div className="text-[11px] text-amber-400 flex items-center gap-1 mt-1 font-mono">
              <Globe2 className="w-3 h-3" /> {( (quota.utilizedQuota / quota.totalAllocatedQuota) * 100 ).toFixed(1)}% Capacity Filled
            </div>
          </div>
        </div>
      </header>

      {/* ================= MAIN 3-PANEL INTERACTIVE GRID ================= */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        {/* LEFT COLUMN: ACTIVE DUAL-CURRENCY INVESTMENTS (DCI) (7 Cols) */}
        <div className="xl:col-span-7 space-y-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <Landmark className="w-5 h-5 text-amber-400" />
              <h2 className="text-xl font-bold text-white tracking-wide">Dual Currency Premium Matrix</h2>
            </div>
            <span className="text-xs font-mono text-slate-400 bg-slate-900 px-3 py-1.5 rounded-lg border border-slate-800">
              Active Contracts: {deposits.length}
            </span>
          </div>

          {/* DCI Cards */}
          <div className="space-y-4">
            {deposits.map((item) => {
              const isSelected = item.id === selectedDeposit.id;
              const isOTM = item.spotRateCurrent > item.strikeRate; // for EUR/USD or USD/SGD direction
              const strikeDistancePercent = (((item.spotRateCurrent - item.strikeRate) / item.strikeRate) * 100).toFixed(2);

              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedDepositId(item.id)}
                  className={`cursor-pointer transition-all duration-200 rounded-3xl p-5 md:p-6 border backdrop-blur-xl relative overflow-hidden ${
                    isSelected
                      ? 'bg-gradient-to-br from-slate-900 via-slate-900/90 to-[#121c38] border-amber-500/70 shadow-2xl shadow-amber-500/10 ring-1 ring-amber-500/40'
                      : 'bg-slate-950/70 border-slate-800/90 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  {/* Glowing corner indicator */}
                  {isSelected && (
                    <div className="absolute top-0 right-0 bg-gradient-to-l from-amber-500 to-transparent w-32 h-1.5" />
                  )}

                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="space-y-1">
                      <div className="flex items-center gap-3">
                        <span className="font-mono text-xs px-2.5 py-0.5 rounded bg-slate-800 text-amber-300 font-semibold border border-slate-700">
                          {item.contractRef}
                        </span>
                        <span className="text-xs font-mono text-slate-400 flex items-center gap-1">
                          Fixing in {item.daysRemaining} days
                        </span>
                      </div>

                      <div className="text-2xl font-extrabold text-white flex items-center gap-3 pt-1">
                        <span>{item.baseCurrency} / {item.alternateCurrency}</span>
                        <span className="text-xs font-normal text-slate-400 bg-slate-800/80 px-2.5 py-1 rounded-full border border-slate-700">
                          Tenor: {item.tenorDays}D
                        </span>
                      </div>
                    </div>

                    <div className="flex items-center gap-6 self-start md:self-auto">
                      <div className="text-right">
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Client Yield</div>
                        <div className="text-2xl font-black text-amber-400 flex items-center gap-1">
                          {item.customerInterestRate.toFixed(2)}%
                          <span className="text-xs font-normal text-slate-400">p.a.</span>
                        </div>
                      </div>
                      <div className="h-10 w-px bg-slate-800" />
                      <div className="text-right">
                        <div className="text-xs font-mono text-slate-400 uppercase tracking-wider">Spread vs SOFR</div>
                        <div className="text-lg font-bold text-emerald-400 flex items-center gap-0.5 justify-end">
                          <ArrowUpRight className="w-4 h-4" />
                          +{item.spreadAlpha.toFixed(2)}%
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Pricing and Strike Grid */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5 pt-4 border-t border-slate-800/80 text-sm">
                    <div>
                      <span className="text-xs text-slate-500 block">Principal Placed</span>
                      <span className="font-semibold text-slate-200">
                        {item.baseCurrency} {item.principalAmount.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block">Strike Rate</span>
                      <span className="font-mono font-bold text-amber-300">{item.strikeRate.toFixed(4)}</span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block">Current Spot FX</span>
                      <span className="font-mono text-slate-200 flex items-center gap-1">
                        {item.spotRateCurrent.toFixed(4)}
                        <span className={`text-[10px] ${+strikeDistancePercent >= 0 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          ({strikeDistancePercent}%)
                        </span>
                      </span>
                    </div>

                    <div>
                      <span className="text-xs text-slate-500 block">AI Probability (Retain Base)</span>
                      <div className="flex items-center gap-2">
                        <div className="w-full bg-slate-800 rounded-full h-2 overflow-hidden">
                          <div
                            className={`h-full rounded-full ${item.aiQuantumProbabilityOTM > 70 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' : 'bg-gradient-to-r from-amber-500 to-rose-500'}`}
                            style={{ width: `${item.aiQuantumProbabilityOTM}%` }}
                          />
                        </div>
                        <span className="font-mono text-xs font-bold text-slate-300">
                          {item.aiQuantumProbabilityOTM}%
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* ================= CALL DEPOSIT SWEEP LEDGER (Modern Treasury Connected) ================= */}
          <div className="pt-4 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Layers className="w-5 h-5 text-blue-400" />
                <h3 className="text-lg font-bold text-white tracking-wide">Call Deposit Vaults (Modern Treasury Sweep)</h3>
              </div>
              <span className="text-xs font-mono text-blue-400 bg-blue-950/40 border border-blue-800/50 px-3 py-1 rounded-lg">
                T+0 Immediate Settlement
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {callAccounts.map((call) => (
                <div key={call.id} className="p-5 rounded-2xl bg-slate-950/90 border border-slate-800 hover:border-slate-700 transition duration-150 space-y-4">
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="text-xs font-mono text-slate-400">{call.citiAccountNumber}</div>
                      <div className="text-xl font-extrabold text-white mt-0.5">
                        {call.currency} {call.currentBalance.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-[11px] font-mono text-slate-500 flex items-center gap-1 mt-1">
                        <Lock className="w-3 h-3 text-slate-400" /> MT Ledger: {call.mtLedgerId}
                      </span>
                    </div>

                    <div className="text-right">
                      <span className="px-2.5 py-1 rounded-full text-xs font-semibold bg-blue-500/10 border border-blue-500/30 text-blue-300">
                        {call.tierYieldRate.toFixed(2)}% p.a.
                      </span>
                      <div className="text-[11px] text-slate-400 mt-1 font-mono">
                        +{call.benchmarkSpread.toFixed(2)}% spread
                      </div>
                    </div>
                  </div>

                  <div className="p-3 rounded-xl bg-slate-900/80 border border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Accrued Interest MTD:</span>
                    <span className="text-emerald-400 font-bold">
                      +{call.currency} {call.accruedInterestMTD.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                    </span>
                  </div>

                  <div className="flex items-center justify-between pt-1 text-xs">
                    <div className="flex items-center gap-1.5 text-slate-300">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                      Auto-Sweep Active (&gt; ${(call.autoSweepThreshold / 1_000_000).toFixed(0)}M)
                    </div>
                    <span className="text-slate-500 font-mono">{call.jurisdiction}</span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* RIGHT COLUMN: AI QUANTUM PROJECTION, DISPOSAL ROUTER, SOUTHBOUND (5 Cols) */}
        <div className="xl:col-span-5 space-y-6">
          {/* AI Quantum Simulator Payoff Curve */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-slate-950 via-slate-900 to-[#070e1e] border border-amber-500/30 shadow-2xl relative">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h3 className="text-lg font-bold text-white">Quantum Payoff Simulator</h3>
              </div>
              <span className="text-xs font-mono text-amber-300 bg-amber-500/10 border border-amber-500/20 px-2.5 py-1 rounded-full">
                Contract: {selectedDeposit.contractRef.split('-')[2]}
              </span>
            </div>

            {/* Selected Payoff Summary */}
            <div className="mt-5 space-y-4">
              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase">Scenario A: Spot stays above strike ({selectedDeposit.strikeRate})</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-300">Principal + Maximum Interest:</span>
                  <span className="text-lg font-mono font-black text-emerald-400">
                    {selectedDeposit.baseCurrency} {selectedDeposit.projectedReturnBase.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-emerald-400 h-full" style={{ width: `${selectedDeposit.aiQuantumProbabilityOTM}%` }} />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>AI Probability: {selectedDeposit.aiQuantumProbabilityOTM}%</span>
                  <span className="text-emerald-400 font-bold">Base Repayment Guaranteed</span>
                </div>
              </div>

              <div className="p-4 rounded-2xl bg-slate-900/90 border border-slate-800 space-y-3">
                <div className="text-xs font-mono text-slate-400 uppercase">Scenario B: Spot breaches strike at fixing</div>
                <div className="flex items-baseline justify-between">
                  <span className="text-sm font-semibold text-slate-300">Alternate Currency Conversion:</span>
                  <span className="text-lg font-mono font-black text-amber-400">
                    {selectedDeposit.alternateCurrency} {selectedDeposit.projectedReturnAlternate.toLocaleString(undefined, { minimumFractionDigits: 2 })}
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full overflow-hidden">
                  <div className="bg-amber-400 h-full" style={{ width: `${(100 - selectedDeposit.aiQuantumProbabilityOTM).toFixed(1)}%` }} />
                </div>
                <div className="text-[11px] text-slate-400 flex justify-between font-mono">
                  <span>AI Risk Probability: {(100 - selectedDeposit.aiQuantumProbabilityOTM).toFixed(1)}%</span>
                  <span className="text-amber-400 font-bold">Automatic Disposal Account Route</span>
                </div>
              </div>
            </div>

            {/* Disposal Account Routing Box */}
            <div className="mt-5 p-4 rounded-2xl bg-[#091122] border border-blue-900/40 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="font-semibold text-blue-300 uppercase tracking-wider flex items-center gap-1.5">
                  <Globe2 className="w-3.5 h-3.5" /> Designated Disposal Route
                </span>
                <span className="text-[11px] font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-800 px-2 py-0.5 rounded">
                  Pre-Cleared Tier-4
                </span>
              </div>

              {(() => {
                const disp = MOCK_DISPOSAL_ACCOUNTS.find((a) => a.id === selectedDeposit.disposalAccountId) || MOCK_DISPOSAL_ACCOUNTS[0];
                return (
                  <div className="space-y-1 text-xs">
                    <div className="text-slate-200 font-bold text-sm">{disp.alias}</div>
                    <div className="text-slate-400 font-mono">{disp.bankName} // {disp.ibanSwift}</div>
                    <div className="text-slate-500 font-mono flex items-center gap-2 pt-1">
                      <span>Modern Treasury Counterparty:</span>
                      <span className="text-blue-400">{disp.mtCounterpartyId}</span>
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>

          {/* ================= CROSS-BORDER SOUTHBOUND CONNECT QUOTA ================= */}
          <div className="p-6 rounded-3xl bg-slate-950/90 border border-slate-800 space-y-5">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Flame className="w-5 h-5 text-amber-500" />
                <h3 className="text-lg font-bold text-white">Southbound Wealth Quota</h3>
              </div>
              <span className="text-xs font-mono text-amber-400 bg-amber-950/30 border border-amber-800/40 px-2.5 py-1 rounded-md">
                HKMA / PBOC Verified
              </span>
            </div>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Total Sovereign Ceiling:</span>
                <span className="font-mono font-bold text-slate-200">¥{(quota.totalAllocatedQuota / 1_000_000).toLocaleString()}M RMB</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-slate-400">Utilized Channel:</span>
                <span className="font-mono font-bold text-amber-400">¥{(quota.utilizedQuota / 1_000_000).toLocaleString()}M RMB</span>
              </div>

              {/* Progress meter */}
              <div className="w-full bg-slate-800 rounded-full h-3 overflow-hidden mt-2">
                <div
                  className="bg-gradient-to-r from-amber-500 via-yellow-400 to-amber-600 h-full rounded-full transition-all duration-500"
                  style={{ width: `${(quota.utilizedQuota / quota.totalAllocatedQuota) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-3.5 rounded-xl bg-slate-900 border border-slate-800/90 space-y-2">
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Quantum Utilization Trend:</span>
                <span className="text-emerald-400 font-bold">{quota.quantumUtilizationTrend}</span>
              </div>
              <div className="flex items-center justify-between text-xs font-mono">
                <span className="text-slate-500">Compliance Protocol Hash:</span>
                <span className="text-slate-400 truncate max-w-[180px]">{quota.complianceHash}</span>
              </div>
            </div>

            <div className="flex gap-2">
              <button className="w-full py-2.5 rounded-xl bg-slate-900 border border-slate-700 hover:border-amber-500 text-xs font-bold text-slate-200 flex items-center justify-center gap-2 transition duration-150">
                <Binary className="w-3.5 h-3.5 text-amber-400" />
                Audit Ledger Trail
              </button>
              <button className="w-full py-2.5 rounded-xl bg-gradient-to-r from-amber-500/20 to-amber-600/20 border border-amber-500/40 hover:bg-amber-500/30 text-xs font-bold text-amber-300 flex items-center justify-center gap-2 transition duration-150">
                <ArrowUpRight className="w-3.5 h-3.5" />
                Request Quota Boost
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ================= MODAL: AUTO-SWEEP / MODERN TREASURY MULTI-LEDGER SETTINGS ================= */}
      {showSweepModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
          <div className="max-w-md w-full rounded-3xl bg-slate-950 border border-amber-500/40 p-6 space-y-6 shadow-2xl relative">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                <Sliders className="w-5 h-5 text-amber-400" />
                Sweep &amp; Settlement Routing
              </h3>
              <button
                onClick={() => setShowSweepModal(false)}
                className="text-slate-400 hover:text-white text-sm font-mono px-2 py-1 bg-slate-900 rounded"
              >
                ✕
              </button>
            </div>

            <p className="text-xs text-slate-400">
              Configure autonomous Modern Treasury liquidity sweeps from Citibank Call Accounts into overnight institutional yield pools.
            </p>

            <div className="space-y-4">
              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Target Balance Retained (USD)</label>
                <input
                  type="text"
                  defaultValue="$10,000,000.00"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-white font-mono text-sm focus:outline-none focus:border-amber-500"
                />
              </div>

              <div>
                <label className="text-xs font-mono text-slate-400 block mb-1">Modern Treasury Ledger Target</label>
                <input
                  type="text"
                  defaultValue="mt_ledger_citi_sovereign_main_01"
                  className="w-full px-4 py-2.5 bg-slate-900 border border-slate-800 rounded-xl text-amber-300 font-mono text-xs focus:outline-none focus:border-amber-500"
                />
              </div>

              <div className="p-3 rounded-xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-300 flex items-start gap-2">
                <AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />
                <span>Sweeps occur at 17:00 EST daily with zero slippage and instantaneous multi-currency ledger journal reconciliation.</span>
              </div>
            </div>

            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowSweepModal(false)}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 text-slate-950 font-bold text-sm shadow-lg hover:brightness-110"
              >
                Save Sweep Directives
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ================= FOOTER / CRYPTOGRAPHIC AUDIT ================= */}
      <footer className="mt-12 pt-6 border-t border-slate-900 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs font-mono text-slate-500">
        <div className="flex items-center gap-2">
          <Shield className="w-4 h-4 text-amber-500/60" />
          <span>Citibank N.A. Institutional Clients Group // Modern Treasury Global Rail Protocol 8.4</span>
        </div>
        <div className="flex items-center gap-4">
          <span>Encrypted Session: TLS 1.3 / Quantum Resilient AES-256</span>
          <span className="text-amber-500/80">CITI-UHNW-TIER-1</span>
        </div>
      </footer>
    </div>
  );
}