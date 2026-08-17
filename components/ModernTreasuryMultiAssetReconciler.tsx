import React, { useState, useEffect, useMemo, useCallback } from 'react';
import {
  Layers,
  ArrowRightLeft,
  ShieldCheck,
  Zap,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Cpu,
  Lock,
  Unlock,
  TrendingUp,
  FileSpreadsheet,
  Building2,
  Vault,
  Clock,
  Sparkles,
  Database,
  ChevronRight,
  Search,
  SlidersHorizontal,
  DollarSign
} from 'lucide-react';

export interface TenorSpecification {
  id: string;
  instrumentType: 'FIXED_TERM_DEPOSIT' | 'COMMERCIAL_PAPER' | 'REPO_COLLATERAL' | 'SWIFT_GPI_ESCROW';
  tenorDays: number;
  maturityTimestamp: string;
  yieldBps: number;
  accruedInterestUsd: number;
  principalAmountUsd: number;
  isdaNettingEligible: boolean;
}

export interface GranularBalanceAttributes {
  clearedBalanceUsd: number;
  floatAmountUsd: number;
  holdAmountUsd: number;
  overdraftLimitUsd: number;
  daylightOverdraftUtilizedUsd: number;
  unsettledInflowUsd: number;
  unsettledOutflowUsd: number;
}

export interface CitiAssetRecord {
  citiAccountId: string;
  accountNumberMasked: string;
  currency: 'USD' | 'EUR' | 'GBP' | 'CHF' | 'SGD' | 'AED';
  legalEntity: string;
  branchBic: string;
  balances: GranularBalanceAttributes;
  tenorProfile?: TenorSpecification;
  lastIngestedAt: string;
  reconciliationState: 'RECONCILED' | 'DISCREPANCY' | 'PENDING_AI_RESOLVE' | 'UNMATCHED';
}

export interface ModernTreasuryLedgerTarget {
  ledgerAccountId: string;
  internalAccountId: string;
  ledgerId: string;
  accountCategory: 'assets' | 'liabilities' | 'equity';
  postedBalanceUsd: number;
  pendingBalanceUsd: number;
  availableBalanceUsd: number;
  lockVersion: number;
  lastSyncedTransactionId: string;
  metadata: {
    citiSyncReference: string;
    daylightTier: string;
    settlementRoutingKey: string;
  };
}

export interface ReconciliationDiscrepancy {
  id: string;
  timestamp: string;
  citiAccountId: string;
  ledgerAccountId: string;
  metric: 'HOLD_COLLATERAL' | 'FLOAT_LATENCY' | 'TENOR_ACCRUAL' | 'OVERDRAFT_BREACH' | 'PRINCIPAL_MISMATCH';
  varianceUsd: number;
  varianceBps: number;
  aiSuggestedFix: string;
  confidenceScore: number;
  resolved: boolean;
}

const MOCK_CITI_ASSETS: CitiAssetRecord[] = [
  {
    citiAccountId: 'CITI-NY-88942-X1',
    accountNumberMasked: '•••••••• 9402',
    currency: 'USD',
    legalEntity: 'Citibank N.A. Private Sovereign Custody',
    branchBic: 'CITIUS33XXX',
    balances: {
      clearedBalanceUsd: 1420500900.50,
      floatAmountUsd: 48120000.00,
      holdAmountUsd: 12500000.00,
      overdraftLimitUsd: 500000000.00,
      daylightOverdraftUtilizedUsd: 18450000.00,
      unsettledInflowUsd: 34000000.00,
      unsettledOutflowUsd: 12000000.00
    },
    tenorProfile: {
      id: 'TNR-9941-USD',
      instrumentType: 'FIXED_TERM_DEPOSIT',
      tenorDays: 90,
      maturityTimestamp: '2025-06-30T16:00:00Z',
      yieldBps: 542,
      accruedInterestUsd: 3420800.22,
      principalAmountUsd: 1400000000.00,
      isdaNettingEligible: true
    },
    lastIngestedAt: '2025-03-29T14:48:12Z',
    reconciliationState: 'RECONCILED'
  },
  {
    citiAccountId: 'CITI-LDN-77301-G8',
    accountNumberMasked: '•••••••• 7731',
    currency: 'GBP',
    legalEntity: 'Citigroup Global Markets Ltd. Vault London',
    branchBic: 'CITIGB2LXXX',
    balances: {
      clearedBalanceUsd: 875200340.10,
      floatAmountUsd: 15400000.00,
      holdAmountUsd: 45000000.00,
      overdraftLimitUsd: 250000000.00,
      daylightOverdraftUtilizedUsd: 0.00,
      unsettledInflowUsd: 8200000.00,
      unsettledOutflowUsd: 91000000.00
    },
    tenorProfile: {
      id: 'TNR-6623-GBP',
      instrumentType: 'REPO_COLLATERAL',
      tenorDays: 30,
      maturityTimestamp: '2025-04-15T11:00:00Z',
      yieldBps: 488,
      accruedInterestUsd: 1120400.00,
      principalAmountUsd: 830000000.00,
      isdaNettingEligible: true
    },
    lastIngestedAt: '2025-03-29T14:50:00Z',
    reconciliationState: 'DISCREPANCY'
  },
  {
    citiAccountId: 'CITI-ZUR-44109-C2',
    accountNumberMasked: '•••••••• 4410',
    currency: 'CHF',
    legalEntity: 'Citibank (Switzerland) AG Private Wealth',
    branchBic: 'CITICHZZXXX',
    balances: {
      clearedBalanceUsd: 2150880120.90,
      floatAmountUsd: 3100000.00,
      holdAmountUsd: 80000000.00,
      overdraftLimitUsd: 1000000000.00,
      daylightOverdraftUtilizedUsd: 4200000.00,
      unsettledInflowUsd: 19000000.00,
      unsettledOutflowUsd: 5000000.00
    },
    tenorProfile: {
      id: 'TNR-0104-CHF',
      instrumentType: 'COMMERCIAL_PAPER',
      tenorDays: 180,
      maturityTimestamp: '2025-09-28T09:00:00Z',
      yieldBps: 182,
      accruedInterestUsd: 5890000.45,
      principalAmountUsd: 2000000000.00,
      isdaNettingEligible: false
    },
    lastIngestedAt: '2025-03-29T14:49:33Z',
    reconciliationState: 'PENDING_AI_RESOLVE'
  }
];

const MOCK_LEDGER_TARGETS: Record<string, ModernTreasuryLedgerTarget> = {
  'CITI-NY-88942-X1': {
    ledgerAccountId: 'la_01HR889XYZ9910',
    internalAccountId: 'ia_citi_ny_prime_01',
    ledgerId: 'led_sovereign_alpha_2025',
    accountCategory: 'assets',
    postedBalanceUsd: 1420500900.50,
    pendingBalanceUsd: 48120000.00,
    availableBalanceUsd: 1408000900.50,
    lockVersion: 849,
    lastSyncedTransactionId: 'ltx_994829100234',
    metadata: {
      citiSyncReference: 'CITI-NY-88942-X1',
      daylightTier: 'TIER_1_UNRESTRICTED',
      settlementRoutingKey: 'FEDWIRE_INSTANT_DIRECT'
    }
  },
  'CITI-LDN-77301-G8': {
    ledgerAccountId: 'la_01HR773GB88210',
    internalAccountId: 'ia_citi_ldn_repo_02',
    ledgerId: 'led_sovereign_alpha_2025',
    accountCategory: 'assets',
    postedBalanceUsd: 865200340.10, // 10,000,000 disparity in hold vs posted
    pendingBalanceUsd: 15400000.00,
    availableBalanceUsd: 820200340.10,
    lockVersion: 412,
    lastSyncedTransactionId: 'ltx_773199480112',
    metadata: {
      citiSyncReference: 'CITI-LDN-77301-G8',
      daylightTier: 'TIER_2_CAPPED',
      settlementRoutingKey: 'CHAPS_DIRECT_CREST'
    }
  },
  'CITI-ZUR-44109-C2': {
    ledgerAccountId: 'la_01HR441CH33901',
    internalAccountId: 'ia_citi_zur_cp_09',
    ledgerId: 'led_sovereign_alpha_2025',
    accountCategory: 'assets',
    postedBalanceUsd: 2150880120.90,
    pendingBalanceUsd: 3100000.00,
    availableBalanceUsd: 2070880120.90,
    lockVersion: 1204,
    lastSyncedTransactionId: 'ltx_441093882001',
    metadata: {
      citiSyncReference: 'CITI-ZUR-44109-C2',
      daylightTier: 'TIER_1_UNRESTRICTED',
      settlementRoutingKey: 'SIC_SWISS_SETTLE'
    }
  }
};

const INITIAL_DISCREPANCIES: ReconciliationDiscrepancy[] = [
  {
    id: 'DISC-2025-081',
    timestamp: '2025-03-29T14:45:00Z',
    citiAccountId: 'CITI-LDN-77301-G8',
    ledgerAccountId: 'la_01HR773GB88210',
    metric: 'HOLD_COLLATERAL',
    varianceUsd: -10000000.00,
    varianceBps: 114.2,
    aiSuggestedFix: 'Post compensating Modern Treasury Ledger Transaction debit to Collateral Escrow Sub-Ledger. Auto-generate Ledger Entry #LE-88491.',
    confidenceScore: 0.9984,
    resolved: false
  },
  {
    id: 'DISC-2025-082',
    timestamp: '2025-03-29T14:48:30Z',
    citiAccountId: 'CITI-ZUR-44109-C2',
    ledgerAccountId: 'la_01HR441CH33901',
    metric: 'TENOR_ACCRUAL',
    varianceUsd: 142900.12,
    varianceBps: 0.66,
    aiSuggestedFix: 'Recognize Swiss CP fractional tenor interest delta into Modern Treasury Pending Ledger Entries via ISIN CH092810488.',
    confidenceScore: 0.9941,
    resolved: false
  }
];

export const ModernTreasuryMultiAssetReconciler: React.FC = () => {
  const [citiAssets, setCitiAssets] = useState<CitiAssetRecord[]>(MOCK_CITI_ASSETS);
  const [ledgerTargets, setLedgerTargets] = useState<Record<string, ModernTreasuryLedgerTarget>>(MOCK_LEDGER_TARGETS);
  const [discrepancies, setDiscrepancies] = useState<ReconciliationDiscrepancy[]>(INITIAL_DISCREPANCIES);
  const [selectedAccountId, setSelectedAccountId] = useState<string>('CITI-NY-88942-X1');
  const [isAiSynthesizing, setIsAiSynthesizing] = useState<boolean>(false);
  const [isLedgerLocked, setIsLedgerLocked] = useState<boolean>(true);
  const [autoSyncActive, setAutoSyncActive] = useState<boolean>(true);
  const [telemetryPulse, setTelemetryPulse] = useState<number>(0);
  const [lastReconRunTime, setLastReconRunTime] = useState<string>(new Date().toISOString());

  // Simulated live telemetry pulses
  useEffect(() => {
    if (!autoSyncActive) return;
    const interval = setInterval(() => {
      setTelemetryPulse((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, [autoSyncActive]);

  const activeAsset = useMemo(() => {
    return citiAssets.find((a) => a.citiAccountId === selectedAccountId) || citiAssets[0];
  }, [citiAssets, selectedAccountId]);

  const activeLedger = useMemo(() => {
    return ledgerTargets[activeAsset.citiAccountId];
  }, [ledgerTargets, activeAsset]);

  const totalVaultValueUsd = useMemo(() => {
    return citiAssets.reduce((sum, asset) => sum + asset.balances.clearedBalanceUsd + asset.balances.floatAmountUsd, 0);
  }, [citiAssets]);

  const totalDiscrepancyUsd = useMemo(() => {
    return discrepancies.filter((d) => !d.resolved).reduce((sum, d) => sum + Math.abs(d.varianceUsd), 0);
  }, [discrepancies]);

  const executeAiAutoBalance = useCallback((discrepancyId: string) => {
    setIsAiSynthesizing(true);
    setTimeout(() => {
      setDiscrepancies((prev) =>
        prev.map((disc) => {
          if (disc.id !== discrepancyId) return disc;
          return { ...disc, resolved: true };
        })
      );

      // Mutate ledger target for demo correctness
      setLedgerTargets((prev) => {
        const disc = discrepancies.find((d) => d.id === discrepancyId);
        if (!disc) return prev;
        const target = prev[disc.citiAccountId];
        if (!target) return prev;

        return {
          ...prev,
          [disc.citiAccountId]: {
            ...target,
            postedBalanceUsd: target.postedBalanceUsd - disc.varianceUsd,
            lockVersion: target.lockVersion + 1,
            lastSyncedTransactionId: `ltx_ai_fixed_${Math.random().toString(36).substring(2, 9)}`
          }
        };
      });

      setCitiAssets((prev) =>
        prev.map((asset) => {
          const disc = discrepancies.find((d) => d.id === discrepancyId);
          if (asset.citiAccountId === disc?.citiAccountId) {
            return { ...asset, reconciliationState: 'RECONCILED' };
          }
          return asset;
        })
      );

      setIsAiSynthesizing(false);
      setLastReconRunTime(new Date().toISOString());
    }, 1200);
  }, [discrepancies]);

  const runFullBespokeSync = () => {
    setIsAiSynthesizing(true);
    setTimeout(() => {
      setDiscrepancies((prev) => prev.map((d) => ({ ...d, resolved: true })));
      setCitiAssets((prev) =>
        prev.map((a) => ({
          ...a,
          reconciliationState: 'RECONCILED',
          lastIngestedAt: new Date().toISOString()
        }))
      );
      setIsAiSynthesizing(false);
      setLastReconRunTime(new Date().toISOString());
    }, 1800);
  };

  const formatCurrency = (val: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    }).format(val);
  };

  return (
    <div className="w-full min-h-screen bg-[#07090e] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Banner: Sovereign Tier Header */}
      <header className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-[#0e121e] via-[#111728] to-[#0a0d17] border border-amber-500/20 p-6 md:p-8 shadow-[0_0_50px_rgba(217,119,6,0.08)] mb-8">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none -mr-20 -mt-20" />
        <div className="absolute bottom-0 left-1/3 w-80 h-80 bg-blue-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-mono font-medium tracking-wider uppercase bg-amber-400/10 text-amber-300 border border-amber-400/30">
                <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
                Citibank Sovereign AI Engine × Modern Treasury
              </span>
              <span className="inline-flex items-center gap-1 text-xs font-mono text-emerald-400 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                Ledger Ver. 4.908.2
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white flex items-center gap-3">
              Multi-Asset Reconciliation Engine
            </h1>
            <p className="text-sm text-slate-400 mt-1 max-w-3xl">
              Synchronizing granular institutional Citibank balances (tenors, float latency, collateral holds, daylight overdraft allocations) into immutable Modern Treasury double-entry ledger instances with AI arbitration.
            </p>
          </div>

          {/* Action Bar */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setIsLedgerLocked(!isLedgerLocked)}
              className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide border transition-all ${
                isLedgerLocked
                  ? 'bg-red-950/30 text-rose-300 border-rose-500/30 hover:bg-rose-950/50'
                  : 'bg-emerald-950/30 text-emerald-300 border-emerald-500/30 hover:bg-emerald-950/50'
              }`}
            >
              {isLedgerLocked ? <Lock className="w-3.5 h-3.5" /> : <Unlock className="w-3.5 h-3.5" />}
              {isLedgerLocked ? 'LEDGER IMMUTABLE LOCK' : 'LEDGER WRITABLE'}
            </button>

            <button
              onClick={() => setAutoSyncActive(!autoSyncActive)}
              className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-semibold tracking-wide bg-slate-800/80 hover:bg-slate-700/80 text-slate-200 border border-slate-700 transition-all shadow-inner"
            >
              <Zap className={`w-3.5 h-3.5 ${autoSyncActive ? 'text-amber-400 fill-amber-400' : 'text-slate-400'}`} />
              {autoSyncActive ? 'LIVE WS STREAM' : 'PAUSED'}
            </button>

            <button
              onClick={runFullBespokeSync}
              disabled={isAiSynthesizing}
              className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider bg-gradient-to-r from-amber-500 via-amber-600 to-yellow-600 hover:from-amber-400 hover:to-yellow-500 text-slate-950 shadow-[0_0_20px_rgba(245,158,11,0.4)] transition-all transform active:scale-95 disabled:opacity-50"
            >
              <RefreshCw className={`w-4 h-4 ${isAiSynthesizing ? 'animate-spin' : ''}`} />
              {isAiSynthesizing ? 'Arbitrating with AI...' : 'Reconcile All Feeds'}
            </button>
          </div>
        </div>

        {/* Global Metric Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-8 pt-6 border-t border-slate-800/70">
          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3.5 border border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Vault className="w-3.5 h-3.5 text-amber-400" /> Aggregate Under Custody
            </span>
            <div className="text-lg md:text-xl font-bold text-white mt-1">
              {formatCurrency(totalVaultValueUsd)}
            </div>
            <div className="text-[10px] text-emerald-400 font-mono mt-0.5">+0.42% 24h Tenor Accrual</div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3.5 border border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <AlertTriangle className="w-3.5 h-3.5 text-rose-400" /> Active Discrepancies
            </span>
            <div className="text-lg md:text-xl font-bold text-rose-300 mt-1">
              {formatCurrency(totalDiscrepancyUsd)}
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              {discrepancies.filter((d) => !d.resolved).length} Pending AI Arbitrations
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3.5 border border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-blue-400" /> MT Ledger Health
            </span>
            <div className="text-lg md:text-xl font-bold text-blue-300 mt-1">
              99.998% Fidelity
            </div>
            <div className="text-[10px] text-slate-400 font-mono mt-0.5">
              Pulse #{telemetryPulse} | Latency: 4ms
            </div>
          </div>

          <div className="bg-slate-900/60 backdrop-blur-md rounded-xl p-3.5 border border-slate-800">
            <span className="text-[11px] font-mono uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
              <Clock className="w-3.5 h-3.5 text-purple-400" /> Last Sync Cycle
            </span>
            <div className="text-sm md:text-base font-bold text-slate-200 mt-1 truncate">
              {new Date(lastReconRunTime).toLocaleTimeString()} UTC
            </div>
            <div className="text-[10px] text-slate-500 font-mono mt-0.5">Dual-sign Hash: SHA-512-MT</div>
          </div>
        </div>
      </header>

      {/* Main Content Grid: Account Selector / Citi Details / Modern Treasury Ledger View */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Account Navigation & Quick Feeds (4 Cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-sm font-bold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                <Building2 className="w-4 h-4 text-amber-400" />
                Citi Prime Custody Nodes
              </h2>
              <span className="text-xs font-mono text-slate-500">3 Institutional Feeds</span>
            </div>

            <div className="space-y-3">
              {citiAssets.map((asset) => {
                const isSelected = asset.citiAccountId === selectedAccountId;
                return (
                  <button
                    key={asset.citiAccountId}
                    onClick={() => setSelectedAccountId(asset.citiAccountId)}
                    className={`w-full text-left p-4 rounded-xl border transition-all relative overflow-hidden ${
                      isSelected
                        ? 'bg-gradient-to-r from-amber-500/10 via-slate-800/80 to-slate-900 border-amber-500/40 shadow-[0_0_20px_rgba(245,158,11,0.1)]'
                        : 'bg-slate-900/40 border-slate-800 hover:bg-slate-800/60 hover:border-slate-700'
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute left-0 top-0 bottom-0 w-1 bg-amber-400" />
                    )}
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-xs text-amber-400/90 font-bold">
                        {asset.citiAccountId}
                      </span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded-full border ${
                          asset.reconciliationState === 'RECONCILED'
                            ? 'bg-emerald-950/50 text-emerald-400 border-emerald-500/30'
                            : asset.reconciliationState === 'DISCREPANCY'
                            ? 'bg-rose-950/50 text-rose-400 border-rose-500/30'
                            : 'bg-amber-950/50 text-amber-300 border-amber-500/30'
                        }`}
                      >
                        {asset.reconciliationState}
                      </span>
                    </div>

                    <div className="text-sm font-semibold text-slate-200 mt-2 truncate">
                      {asset.legalEntity}
                    </div>

                    <div className="flex items-center justify-between text-xs text-slate-400 mt-3 pt-2 border-t border-slate-800/60">
                      <span>Cleared:</span>
                      <span className="font-mono text-slate-100 font-medium">
                        {formatCurrency(asset.balances.clearedBalanceUsd, asset.currency)}
                      </span>
                    </div>

                    {asset.tenorProfile && (
                      <div className="flex items-center justify-between text-[11px] text-amber-300/80 mt-1 font-mono">
                        <span>{asset.tenorProfile.instrumentType}</span>
                        <span>{asset.tenorProfile.tenorDays}D @ {(asset.tenorProfile.yieldBps / 100).toFixed(2)}%</span>
                      </div>
                    )}
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Arbitration Engine Desk */}
          <div className="bg-gradient-to-b from-[#0f1422] to-[#090d16] rounded-2xl border border-indigo-500/30 p-5 shadow-2xl relative overflow-hidden">
            <div className="absolute top-0 right-0 w-40 h-40 bg-indigo-500/5 rounded-full blur-2xl pointer-events-none" />
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                  <Cpu className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-xs font-bold uppercase tracking-wider text-indigo-200">
                    Citibank AI Arbiter
                  </h3>
                  <span className="text-[10px] text-indigo-400/80">Neural Ledger Balancing</span>
                </div>
              </div>
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-950/40 px-2 py-0.5 rounded border border-emerald-500/20">
                ACTIVE
              </span>
            </div>

            <div className="space-y-3">
              {discrepancies.map((disc) => (
                <div
                  key={disc.id}
                  className={`p-3.5 rounded-xl border text-xs transition-all ${
                    disc.resolved
                      ? 'bg-slate-900/40 border-slate-800 text-slate-500'
                      : 'bg-indigo-950/30 border-indigo-500/40 text-slate-200'
                  }`}
                >
                  <div className="flex items-center justify-between font-mono text-[11px] mb-1.5">
                    <span className="font-bold text-amber-300">{disc.metric}</span>
                    <span className={disc.resolved ? 'text-slate-500' : 'text-rose-400 font-bold'}>
                      {formatCurrency(disc.varianceUsd)} ({disc.varianceBps} bps)
                    </span>
                  </div>

                  <p className="text-[11px] text-slate-300 leading-relaxed mb-3">
                    {disc.aiSuggestedFix}
                  </p>

                  <div className="flex items-center justify-between pt-2 border-t border-indigo-900/40 text-[10px]">
                    <span className="font-mono text-indigo-300">
                      Confidence: {(disc.confidenceScore * 100).toFixed(2)}%
                    </span>
                    {!disc.resolved ? (
                      <button
                        onClick={() => executeAiAutoBalance(disc.id)}
                        disabled={isAiSynthesizing}
                        className="px-3 py-1 bg-indigo-600 hover:bg-indigo-500 text-white rounded font-bold transition-all shadow-md active:scale-95 disabled:opacity-50"
                      >
                        Auto-Post MT Entry
                      </button>
                    ) : (
                      <span className="flex items-center gap-1 text-emerald-400 font-bold">
                        <CheckCircle2 className="w-3 h-3" /> Reconciled
                      </span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Center/Right Column: Detailed Dual-Sync Matrix (8 Cols) */}
        <div className="lg:col-span-8 space-y-6">
          {/* Synchronized Account Header */}
          <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-6 shadow-xl relative">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-5">
              <div>
                <div className="text-xs font-mono text-amber-400 uppercase tracking-wider">
                  Active Asset Target
                </div>
                <div className="text-2xl font-black text-white mt-0.5">
                  {activeAsset.legalEntity}
                </div>
                <div className="flex items-center gap-3 text-xs font-mono text-slate-400 mt-1">
                  <span>BIC: <strong className="text-slate-200">{activeAsset.branchBic}</strong></span>
                  <span>•</span>
                  <span>Mask: <strong className="text-slate-200">{activeAsset.accountNumberMasked}</strong></span>
                  <span>•</span>
                  <span>MT Ledger ID: <strong className="text-indigo-300">{activeLedger?.ledgerId}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2 bg-slate-900 p-2 rounded-xl border border-slate-800">
                <div className="text-right px-3">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Lock Version</div>
                  <div className="text-sm font-mono font-bold text-amber-300">v{activeLedger?.lockVersion}</div>
                </div>
                <div className="h-8 w-[1px] bg-slate-800" />
                <div className="text-right px-3">
                  <div className="text-[10px] font-mono uppercase text-slate-400">Daylight Cap</div>
                  <div className="text-sm font-mono font-bold text-emerald-400">{activeLedger?.metadata.daylightTier}</div>
                </div>
              </div>
            </div>

            {/* Granular Field Reconciliation Table */}
            <div className="mt-6">
              <h3 className="text-xs font-mono uppercase tracking-widest text-slate-400 mb-3 flex items-center gap-2">
                <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
                Granular Balance & Tenor Vector Comparison
              </h3>

              <div className="overflow-x-auto">
                <table className="w-full text-left border-collapse font-mono text-xs">
                  <thead>
                    <tr className="border-b border-slate-800 text-slate-400 bg-slate-900/50">
                      <th className="p-3">Component Attribute</th>
                      <th className="p-3 text-amber-300">Citibank Feed (Ingested)</th>
                      <th className="p-3 text-blue-300">Modern Treasury Ledger</th>
                      <th className="p-3 text-right">Variance / Delta</th>
                      <th className="p-3 text-center">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {/* Cleared vs Posted */}
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-sans font-medium text-slate-200">
                        Cleared / Posted Balance
                        <div className="text-[10px] font-mono text-slate-500">Immediate liquidity available for wire settlement</div>
                      </td>
                      <td className="p-3 text-slate-100 font-bold">
                        {formatCurrency(activeAsset.balances.clearedBalanceUsd)}
                      </td>
                      <td className="p-3 text-slate-100 font-bold">
                        {formatCurrency(activeLedger?.postedBalanceUsd || 0)}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {(() => {
                          const delta = (activeLedger?.postedBalanceUsd || 0) - activeAsset.balances.clearedBalanceUsd;
                          return (
                            <span className={delta === 0 ? 'text-slate-500' : 'text-rose-400 font-bold'}>
                              {delta === 0 ? '$0.00' : formatCurrency(delta)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-center">
                        {(activeLedger?.postedBalanceUsd || 0) === activeAsset.balances.clearedBalanceUsd ? (
                          <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                            <CheckCircle2 className="w-3 h-3" /> MATCH
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 text-rose-400 text-[10px]">
                            <AlertTriangle className="w-3 h-3" /> DELTA
                          </span>
                        )}
                      </td>
                    </tr>

                    {/* Float Amount */}
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-sans font-medium text-slate-200">
                        In-Transit Float (ACH / Swift GPI)
                        <div className="text-[10px] font-mono text-slate-500">Unsettled clearing float mapped to Pending Balances</div>
                      </td>
                      <td className="p-3 text-slate-100 font-bold">
                        {formatCurrency(activeAsset.balances.floatAmountUsd)}
                      </td>
                      <td className="p-3 text-slate-100 font-bold">
                        {formatCurrency(activeLedger?.pendingBalanceUsd || 0)}
                      </td>
                      <td className="p-3 text-right font-mono">
                        {(() => {
                          const delta = (activeLedger?.pendingBalanceUsd || 0) - activeAsset.balances.floatAmountUsd;
                          return (
                            <span className={delta === 0 ? 'text-slate-500' : 'text-amber-400 font-bold'}>
                              {delta === 0 ? '$0.00' : formatCurrency(delta)}
                            </span>
                          );
                        })()}
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> MATCH
                        </span>
                      </td>
                    </tr>

                    {/* Collateral Hold Amount */}
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-sans font-medium text-slate-200">
                        Regulatory & Escrow Holds
                        <div className="text-[10px] font-mono text-slate-500">Pledged asset collateral under ISDA Master Agreement</div>
                      </td>
                      <td className="p-3 text-amber-200 font-bold">
                        {formatCurrency(activeAsset.balances.holdAmountUsd)}
                      </td>
                      <td className="p-3 text-slate-400 font-mono">
                        [Ledger Encumbered Hold]
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        -
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-blue-400 text-[10px]">
                          <ShieldCheck className="w-3 h-3" /> PLEDGED
                        </span>
                      </td>
                    </tr>

                    {/* Daylight Overdraft Limits */}
                    <tr className="hover:bg-slate-800/30 transition-colors">
                      <td className="p-3 font-sans font-medium text-slate-200">
                        Overdraft Allocation & Intraday Peak
                        <div className="text-[10px] font-mono text-slate-500">
                          Utilized: {formatCurrency(activeAsset.balances.daylightOverdraftUtilizedUsd)} / Limit: {formatCurrency(activeAsset.balances.overdraftLimitUsd)}
                        </div>
                      </td>
                      <td className="p-3 text-slate-100 font-bold">
                        {formatCurrency(activeAsset.balances.overdraftLimitUsd)}
                      </td>
                      <td className="p-3 text-indigo-300 font-mono">
                        {activeLedger?.metadata.settlementRoutingKey}
                      </td>
                      <td className="p-3 text-right font-mono text-slate-400">
                        Daylight Cap Active
                      </td>
                      <td className="p-3 text-center">
                        <span className="inline-flex items-center gap-1 text-emerald-400 text-[10px]">
                          <CheckCircle2 className="w-3 h-3" /> SYNCED
                        </span>
                      </td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>

            {/* Tenor Profile Breakdown if applicable */}
            {activeAsset.tenorProfile && (
              <div className="mt-6 p-4 rounded-xl bg-slate-900/80 border border-slate-800">
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs font-mono uppercase text-amber-400 font-bold flex items-center gap-1.5">
                    <TrendingUp className="w-3.5 h-3.5" /> Granular Tenor & Yield Specification
                  </span>
                  <span className="text-[10px] font-mono bg-amber-400/10 text-amber-300 px-2 py-0.5 rounded border border-amber-400/20">
                    ID: {activeAsset.tenorProfile.id}
                  </span>
                </div>

                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 text-xs font-mono">
                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Maturity Date</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {new Date(activeAsset.tenorProfile.maturityTimestamp).toLocaleDateString()}
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Term / Duration</div>
                    <div className="font-bold text-slate-200 mt-0.5">
                      {activeAsset.tenorProfile.tenorDays} Calendar Days
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Fixed Yield BPS</div>
                    <div className="font-bold text-emerald-400 mt-0.5">
                      +{activeAsset.tenorProfile.yieldBps} bps ({ (activeAsset.tenorProfile.yieldBps / 100).toFixed(2) }%)
                    </div>
                  </div>

                  <div className="bg-slate-950/60 p-2.5 rounded-lg border border-slate-800">
                    <div className="text-[10px] text-slate-500">Accrued Interest</div>
                    <div className="font-bold text-amber-300 mt-0.5">
                      {formatCurrency(activeAsset.tenorProfile.accruedInterestUsd)}
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Real-time Modern Treasury Ledger Transaction Log Inspector */}
          <div className="bg-[#0b0e17] rounded-2xl border border-slate-800 p-6 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 flex items-center gap-2">
                  <Database className="w-4 h-4 text-blue-400" />
                  Modern Treasury Live Ledger Transactions
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  Double-entry posted transactions auto-synthesized from Citibank SWIFT MT940/CAMT.053 feeds
                </p>
              </div>

              <span className="text-[11px] font-mono text-slate-400 bg-slate-900 px-3 py-1 rounded-lg border border-slate-800">
                Ledger Ref: <strong className="text-slate-200">{activeLedger?.ledgerAccountId}</strong>
              </span>
            </div>

            <div className="space-y-2.5 font-mono text-xs">
              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                  <div>
                    <div className="font-bold text-slate-200">{activeLedger?.lastSyncedTransactionId}</div>
                    <div className="text-[10px] text-slate-500">ISDA Collateral Sync • Daylight Settlement</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-emerald-400">+CR $50,000,000.00</div>
                  <div className="text-[10px] text-slate-500">Posted • 2025-03-29 14:48 UTC</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-blue-400" />
                  <div>
                    <div className="font-bold text-slate-200">ltx_citi_tenor_accrual_9041</div>
                    <div className="text-[10px] text-slate-500">Tenor Interest Accrual Recalibration</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-amber-300">+CR $3,420,800.22</div>
                  <div className="text-[10px] text-slate-500">Posted • 2025-03-29 12:00 UTC</div>
                </div>
              </div>

              <div className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 flex items-center justify-between opacity-80">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 rounded-full bg-slate-500" />
                  <div>
                    <div className="font-bold text-slate-300">ltx_swift_escrow_hold_1109</div>
                    <div className="text-[10px] text-slate-500">CHAPS Gross Margin Lock (Escrow Reserve)</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="font-bold text-rose-300">-DR $12,500,000.00</div>
                  <div className="text-[10px] text-slate-500">Posted • 2025-03-29 09:15 UTC</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ModernTreasuryMultiAssetReconciler;