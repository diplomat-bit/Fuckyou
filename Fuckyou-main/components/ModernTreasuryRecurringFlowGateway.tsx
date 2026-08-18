import React, { useState, useEffect, useMemo, useCallback } from 'react';

// --- ENTERPRISE LUXE DESIGN SYSTEM & ICONS (SVG-Based for Zero-Dependency Resilience) ---

const LuxuryIcons = {
  Vault: () => (
    <svg className="w-5 h-5 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="3" width="18" height="18" rx="2" stroke="currentColor" />
      <circle cx="12" cy="12" r="4" stroke="currentColor" />
      <path d="M12 8v1m0 6v1M8 12h1m6 0h1" strokeLinecap="round" />
    </svg>
  ),
  CitiPulse: () => (
    <svg className="w-5 h-5 text-blue-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M4 15s1-1 4-1 5 2 8 2 4-1 4-1V3s-1 1-4 1-5-2-8-2-4 1-4 1v12z" stroke="currentColor" />
      <path d="M4 22v-7" strokeLinecap="round" />
    </svg>
  ),
  ModernTreasurySync: () => (
    <svg className="w-5 h-5 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" stroke="currentColor" strokeLinecap="round" />
      <path d="M3 3v5h5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
      <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" stroke="currentColor" strokeLinecap="round" />
      <path d="M16 21h5v-5" stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  LockFreeze: () => (
    <svg className="w-5 h-5 text-rose-500 animate-pulse" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <rect x="3" y="11" width="18" height="11" rx="2" ry="2" stroke="currentColor" />
      <path d="M7 11V7a5 5 0 0 1 10 0v4" stroke="currentColor" />
      <path d="M12 15v3" strokeLinecap="round" />
    </svg>
  ),
  AiBrain: () => (
    <svg className="w-5 h-5 text-purple-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
      <path d="M9.5 2A2.5 2.5 0 0 1 12 4.5v15a2.5 2.5 0 0 1-4.96.44 2.5 2.5 0 0 1-2.96-3.08 3 3 0 0 1-.34-5.58 2.5 2.5 0 0 1 1.32-4.24 2.5 2.5 0 0 1 4.44-2.04" stroke="currentColor" />
      <path d="M14.5 2A2.5 2.5 0 0 0 12 4.5v15a2.5 2.5 0 0 0 4.96.44 2.5 2.5 0 0 0 2.96-3.08 3 3 0 0 0 .34-5.58 2.5 2.5 0 0 0-1.32-4.24 2.5 2.5 0 0 0-4.44-2.04" stroke="currentColor" />
    </svg>
  ),
  CheckDouble: () => (
    <svg className="w-4 h-4 text-emerald-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="M18 6 7 17l-5-5" strokeLinecap="round" strokeLinejoin="round" />
      <path d="m22 10-7.5 7.5L13 16" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  ),
  WarningDiamond: () => (
    <svg className="w-4 h-4 text-amber-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
      <path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" />
      <line x1="12" y1="9" x2="12" y2="13" />
      <line x1="12" y1="17" x2="12.01" y2="17" />
    </svg>
  )
};

// --- DATA CONTRACTS: CITI PTP & MODERN TREASURY UNIFIED MODEL ---

export type CitiPtpMandateStatus = 'ACTIVE' | 'PENDING_VALIDATION' | 'TERMINATION_TRIGGERED' | 'FROZEN' | 'CANCELLED';
export type MtRecurringCadence = 'DAILY' | 'WEEKLY' | 'BIWEEKLY' | 'MONTHLY' | 'QUARTERLY' | 'INTRA_DAY_SWEEP';

export interface CitiStandingInstruction {
  ptpMandateId: string;
  citiAccountRef: string;
  citiClearingZone: 'CHIPS' | 'FEDWIRE' | 'TARGET2' | 'CITICONNECT_DIRECT';
  maxThresholdAmount: number;
  currency: string;
  instructedPartyIban: string;
  creditorName: string;
  purposeCode: string;
  status: CitiPtpMandateStatus;
  lastExecutionTimestamp: string;
  nextExecutionDate: string;
}

export interface ModernTreasurySchedule {
  scheduleId: string;
  ledgerId: string;
  originatingAccountId: string;
  receivingAccountId: string;
  cadence: MtRecurringCadence;
  expectedSequenceCount: number;
  accumulatedSettledAmount: number;
  holdLockActive: boolean;
  ledgerAccountHoldId?: string;
  reconciliationStatus: 'OPTIMIZED' | 'SYNCED' | 'OUT_OF_SYNC' | 'HOLD_ENGAGED';
}

export interface AIYieldEngineResult {
  confidenceScore: number;
  recommendedSweepWindowUtc: string;
  estimatedSlippageBps: number;
  arbitrageYieldAnnualized: number;
  aiHeuristicNote: string;
}

export interface FlowAuditRecord {
  id: string;
  timestamp: string;
  eventType: 'MANDATE_SYNC' | 'SEQUENCE_DISPATCH' | 'LEDGER_HOLD_SET' | 'AI_OPTIMIZATION_EVENT' | 'KILL_SWITCH_ACTIVE';
  details: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
}

// --- INITIAL ULTRA-TIER CORP TREASURY MOCK DATA ---

const INITIAL_CITI_INSTRUCTION: CitiStandingInstruction = {
  ptpMandateId: 'CITI-PTP-994029-GLOBAL-ALPHA',
  citiAccountRef: 'CITI-NY-TREASURY-00088921-USD',
  citiClearingZone: 'CITICONNECT_DIRECT',
  maxThresholdAmount: 250000000.00, // $250M Ultra Liquidity Pipe
  currency: 'USD',
  instructedPartyIban: 'US33CITI00088921987654321',
  creditorName: 'Sovereign Wealth Liquidity Trust XI',
  purposeCode: 'INTC - Intra-Group Treasury Settlement',
  status: 'ACTIVE',
  lastExecutionTimestamp: new Date(Date.now() - 3600000 * 14).toISOString(),
  nextExecutionDate: new Date(Date.now() + 3600000 * 10).toISOString(),
};

const INITIAL_MT_SCHEDULE: ModernTreasurySchedule = {
  scheduleId: 'sched_mt_01h8x9p_quantum_recurr',
  ledgerId: 'led_9948201_apex_prime',
  originatingAccountId: 'acc_citi_vault_mirror_primary',
  receivingAccountId: 'acc_sovereign_target_clearing',
  cadence: 'INTRA_DAY_SWEEP',
  expectedSequenceCount: 142,
  accumulatedSettledAmount: 18750000000.00, // $18.75 Billion settled
  holdLockActive: false,
  reconciliationStatus: 'OPTIMIZED',
};

// --- COMPONENT IMPLEMENTATION ---

export const ModernTreasuryRecurringFlowGateway: React.FC = () => {
  // Master Synchronized State
  const [citiMandate, setCitiMandate] = useState<CitiStandingInstruction>(INITIAL_CITI_INSTRUCTION);
  const [mtSchedule, setMtSchedule] = useState<ModernTreasurySchedule>(INITIAL_MT_SCHEDULE);
  const [isSyncing, setIsSyncing] = useState<boolean>(false);
  const [isAiOptimizing, setIsAiOptimizing] = useState<boolean>(false);
  const [isTerminatingHold, setIsTerminatingHold] = useState<boolean>(false);
  
  // High-End AI Prediction Matrix
  const [aiMetrics, setAiMetrics] = useState<AIYieldEngineResult>({
    confidenceScore: 99.87,
    recommendedSweepWindowUtc: '14:30:00 - 15:15:00 UTC (Fedwire Cutoff Buffer)',
    estimatedSlippageBps: 0.012,
    arbitrageYieldAnnualized: 5.482,
    aiHeuristicNote: 'Optimal balance retention achieved via Citi PTP real-time balance polling with zero Modern Treasury ledger friction.'
  });

  // Dynamic Audit Ledger Trail
  const [auditLogs, setAuditLogs] = useState<FlowAuditRecord[]>([
    {
      id: 'aud_init_001',
      timestamp: new Date(Date.now() - 7200000).toLocaleTimeString(),
      eventType: 'MANDATE_SYNC',
      details: 'Citi PTP Standing Instructions validated via CitiConnect SOAP/XML API & MT JSON Gateway.',
      status: 'SUCCESS'
    },
    {
      id: 'aud_init_002',
      timestamp: new Date(Date.now() - 3600000).toLocaleTimeString(),
      eventType: 'AI_OPTIMIZATION_EVENT',
      details: 'Neural Routing Engine detected optimal CHIPS/Fedwire spread. Scheduled expected payment seq #143.',
      status: 'SUCCESS'
    }
  ]);

  const addAuditLog = useCallback((type: FlowAuditRecord['eventType'], details: string, status: FlowAuditRecord['status']) => {
    const newLog: FlowAuditRecord = {
      id: `aud_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`,
      timestamp: new Date().toLocaleTimeString(),
      eventType: type,
      details,
      status
    };
    setAuditLogs(prev => [newLog, ...prev.slice(0, 14)]);
  }, []);

  // Formatter for Ultra-High Currency Values
  const formatCurrency = (val: number, curr = 'USD') => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: curr,
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }).format(val);
  };

  // Sync Citi Mandate to Modern Treasury
  const handleSynchronizePtpToMt = async () => {
    setIsSyncing(true);
    addAuditLog('MANDATE_SYNC', 'Initiating handshake between Citi PTP engine & Modern Treasury Recurring Schedules...', 'WARNING');
    
    setTimeout(() => {
      setMtSchedule(prev => ({
        ...prev,
        reconciliationStatus: 'SYNCED',
        expectedSequenceCount: prev.expectedSequenceCount + 1
      }));
      setIsSyncing(false);
      addAuditLog('MANDATE_SYNC', 'Synchronized Citi Mandate [CITI-PTP-994029] with MT Schedule [sched_mt_01h8x9p]. 0 Drift detected.', 'SUCCESS');
    }, 1200);
  };

  // Autonomous AI Optimization Routine
  const handleTriggerAiOptimization = async () => {
    setIsAiOptimizing(true);
    addAuditLog('AI_OPTIMIZATION_EVENT', 'AI Agent recalculating Citi multi-currency intraday yield curve vs MT expected settlement buffers.', 'WARNING');

    setTimeout(() => {
      setAiMetrics({
        confidenceScore: 99.94,
        recommendedSweepWindowUtc: '17:00:00 - 17:45:00 UTC (End-of-Day Multi-Vault Sweep)',
        estimatedSlippageBps: 0.008,
        arbitrageYieldAnnualized: 5.514,
        aiHeuristicNote: 'Predictive liquidity spike avoided. Shifted Modern Treasury trigger delta by +42ms for zero-reserve impact.'
      });
      setIsAiOptimizing(false);
      addAuditLog('AI_OPTIMIZATION_EVENT', 'Neural Treasury Matrix locked new optimal execution corridor with 99.94% precision confidence.', 'SUCCESS');
    }, 1500);
  };

  // Emergency Mandate Termination + Ledger Freeze Protocol
  const handleTerminateMandateAndLockLedger = async () => {
    setIsTerminatingHold(true);
    addAuditLog('KILL_SWITCH_ACTIVE', 'EXECUTING MANDATE TERMINATION PROTOCOL. Emitting instant stop signal to CitiConnect PTP & Freezing Modern Treasury Ledger Hold Account.', 'CRITICAL');

    setTimeout(() => {
      setCitiMandate(prev => ({
        ...prev,
        status: 'FROZEN'
      }));
      setMtSchedule(prev => ({
        ...prev,
        holdLockActive: true,
        reconciliationStatus: 'HOLD_ENGAGED',
        ledgerAccountHoldId: `lhold_${Math.random().toString(36).substring(2, 11)}_immutable`
      }));
      setIsTerminatingHold(false);
      addAuditLog('LEDGER_HOLD_SET', 'Modern Treasury Ledger Hold locked all outbound debit sweeps. Citi PTP mandate marked FROZEN. All standing payment orders paused in expected state.', 'CRITICAL');
    }, 1800);
  };

  // Reset / Re-arm System
  const handleRearmMandate = () => {
    setCitiMandate(prev => ({ ...prev, status: 'ACTIVE' }));
    setMtSchedule(prev => ({
      ...prev,
      holdLockActive: false,
      reconciliationStatus: 'OPTIMIZED',
      ledgerAccountHoldId: undefined
    }));
    addAuditLog('MANDATE_SYNC', 'System re-armed. Citi PTP active. Modern Treasury ledger hold released. Autonomous sweeps restored.', 'SUCCESS');
  };

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-[#06080F] via-[#0A0E1A] to-[#04060A] text-slate-100 font-sans p-4 sm:p-6 lg:p-8 flex flex-col gap-6 selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* --- TOP LUXURY HUD HEADER --- */}
      <header className="w-full bg-[#0D1322]/80 backdrop-blur-xl border border-amber-500/20 rounded-2xl p-6 shadow-2xl shadow-amber-950/20 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 relative overflow-hidden">
        <div className="absolute -right-16 -top-16 w-64 h-64 bg-amber-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -left-16 -bottom-16 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none" />

        <div className="flex items-center gap-4 z-10">
          <div className="p-3 bg-gradient-to-br from-amber-500/20 via-blue-500/10 to-transparent border border-amber-400/40 rounded-xl shadow-inner shadow-amber-400/20">
            <LuxuryIcons.Vault />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase tracking-widest px-2 py-0.5 rounded bg-gradient-to-r from-amber-500/20 to-blue-500/20 border border-amber-400/30 text-amber-300 font-semibold">
                Bespoke Tier-1 Gateway
              </span>
              <span className="inline-flex items-center gap-1 text-[11px] text-emerald-400 font-mono">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                LIVE BRIDGE
              </span>
            </div>
            <h1 className="text-2xl lg:text-3xl font-extrabold tracking-tight text-transparent bg-clip-text bg-gradient-to-r from-amber-100 via-slate-100 to-amber-200 mt-1">
              Citi PTP <span className="text-amber-400">&</span> Modern Treasury Flow Gateway
            </h1>
            <p className="text-xs text-slate-400 tracking-wide font-mono mt-0.5">
              SYNCHRONIZED STANDING INSTRUCTIONS • RECURRING SEQUENCES • LEDGER HOLDS
            </p>
          </div>
        </div>

        {/* Global KPI Badges */}
        <div className="flex flex-wrap items-center gap-3 z-10">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <div className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">Cumulative Settled Vol</div>
            <div className="text-base font-bold text-amber-300 font-mono">{formatCurrency(mtSchedule.accumulatedSettledAmount)}</div>
          </div>
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl px-4 py-2 text-right">
            <div className="text-[10px] text-slate-400 tracking-wider font-mono uppercase">Mandate Cap</div>
            <div className="text-base font-bold text-blue-300 font-mono">{formatCurrency(citiMandate.maxThresholdAmount)}</div>
          </div>
        </div>
      </header>

      {/* --- STATUS BANNER IF FROZEN / HOLD ENGAGED --- */}
      {mtSchedule.holdLockActive && (
        <div className="w-full bg-gradient-to-r from-rose-950/80 via-rose-900/40 to-slate-950/80 border border-rose-500/50 rounded-xl p-4 flex flex-col sm:flex-row items-center justify-between gap-4 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex items-center gap-3">
            <LuxuryIcons.LockFreeze />
            <div>
              <div className="text-sm font-bold text-rose-200 uppercase tracking-wide">
                MANDATE TERMINATION PROTOCOL ACTIVE — MODERN TREASURY LEDGER HOLD ENGAGED
              </div>
              <div className="text-xs text-rose-300/80 font-mono">
                Hold Identifier: <span className="text-white font-semibold">{mtSchedule.ledgerAccountHoldId}</span> • All downstream recurring sequences are locked.
              </div>
            </div>
          </div>
          <button
            onClick={handleRearmMandate}
            className="px-4 py-2 bg-gradient-to-r from-rose-600 to-amber-600 hover:from-rose-500 hover:to-amber-500 text-white text-xs font-semibold uppercase tracking-wider rounded-lg shadow-lg shadow-rose-950/50 transition-all cursor-pointer whitespace-nowrap active:scale-95"
          >
            Disengage Hold & Re-Arm
          </button>
        </div>
      )}

      {/* --- MAIN SPLIT ARCHITECTURE DISPLAY (CITI PTP vs MODERN TREASURY) --- */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">

        {/* LEFT COLUMN: CITIBANK STANDING INSTRUCTIONS (PTP) */}
        <section className="lg:col-span-6 bg-[#0B0F19]/90 border border-blue-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-blue-500/10">
              <div className="flex items-center gap-2">
                <LuxuryIcons.CitiPulse />
                <h2 className="text-base font-bold tracking-wide text-slate-100 uppercase">
                  Citi Periodic Transfer Payment (PTP)
                </h2>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                citiMandate.status === 'ACTIVE'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-rose-500/10 border-rose-500/40 text-rose-300 animate-pulse'
              }`}>
                ● {citiMandate.status}
              </span>
            </div>

            {/* Mandate Details Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">PTP Mandate ID</div>
                <div className="text-xs font-mono font-semibold text-blue-300 mt-1 truncate">{citiMandate.ptpMandateId}</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Clearing Zone</div>
                <div className="text-xs font-mono font-semibold text-slate-200 mt-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-blue-400" />
                  {citiMandate.citiClearingZone}
                </div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Source Account Ref</div>
                <div className="text-xs font-mono text-slate-300 mt-1 truncate">{citiMandate.citiAccountRef}</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Creditor / Beneficiary</div>
                <div className="text-xs font-semibold text-amber-200 mt-1 truncate">{citiMandate.creditorName}</div>
              </div>

              <div className="sm:col-span-2 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Instructed Party IBAN</div>
                <div className="text-xs font-mono text-emerald-300 mt-1 tracking-wider">{citiMandate.instructedPartyIban}</div>
              </div>

              <div className="sm:col-span-2 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Next Instruction Dispatch</div>
                  <div className="text-xs font-mono text-slate-200 mt-0.5">{new Date(citiMandate.nextExecutionDate).toUTCString()}</div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Purpose Category</div>
                  <div className="text-xs font-mono text-slate-300 mt-0.5">{citiMandate.purposeCode}</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleSynchronizePtpToMt}
              disabled={isSyncing || citiMandate.status === 'FROZEN'}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-blue-600/30 to-blue-500/20 hover:from-blue-600/50 hover:to-blue-500/40 border border-blue-400/40 rounded-xl text-blue-200 text-xs font-semibold tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              <LuxuryIcons.ModernTreasurySync />
              {isSyncing ? 'Synchronizing Direct Rails...' : 'Sync to MT Schedule'}
            </button>
          </div>
        </section>

        {/* RIGHT COLUMN: MODERN TREASURY RECURRING SCHEDULE & LEDGER */}
        <section className="lg:col-span-6 bg-[#0B0F19]/90 border border-emerald-500/20 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl shadow-xl flex flex-col justify-between">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-2xl pointer-events-none" />

          <div>
            {/* Header */}
            <div className="flex items-center justify-between pb-4 border-b border-emerald-500/10">
              <div className="flex items-center gap-2">
                <LuxuryIcons.ModernTreasurySync />
                <h2 className="text-base font-bold tracking-wide text-slate-100 uppercase">
                  Modern Treasury Recurring Pipeline
                </h2>
              </div>
              <span className={`text-[11px] font-mono font-bold px-2.5 py-1 rounded-full border ${
                mtSchedule.reconciliationStatus === 'OPTIMIZED' || mtSchedule.reconciliationStatus === 'SYNCED'
                  ? 'bg-emerald-500/10 border-emerald-500/40 text-emerald-300'
                  : 'bg-amber-500/10 border-amber-500/40 text-amber-300'
              }`}>
                {mtSchedule.reconciliationStatus}
              </span>
            </div>

            {/* MT Schedule Data Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-5">
              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">MT Schedule ID</div>
                <div className="text-xs font-mono font-semibold text-emerald-300 mt-1 truncate">{mtSchedule.scheduleId}</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Ledger Master ID</div>
                <div className="text-xs font-mono font-semibold text-slate-200 mt-1 truncate">{mtSchedule.ledgerId}</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Execution Cadence</div>
                <div className="text-xs font-mono text-purple-300 font-semibold mt-1">{mtSchedule.cadence}</div>
              </div>

              <div className="p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Sequence Sequence Count</div>
                <div className="text-xs font-mono font-bold text-amber-300 mt-1">#{mtSchedule.expectedSequenceCount} Dispatches</div>
              </div>

              <div className="sm:col-span-2 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80">
                <div className="text-[10px] text-slate-400 uppercase font-mono">Ledger Account Routing Target</div>
                <div className="text-xs font-mono text-slate-300 mt-1 truncate flex items-center justify-between">
                  <span>{mtSchedule.originatingAccountId}</span>
                  <span className="text-slate-500 font-sans">➔</span>
                  <span className="text-emerald-300">{mtSchedule.receivingAccountId}</span>
                </div>
              </div>

              <div className="sm:col-span-2 p-3.5 bg-slate-900/60 rounded-xl border border-slate-800/80 flex items-center justify-between">
                <div>
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Ledger Hold Lock Mechanism</div>
                  <div className="text-xs font-mono mt-0.5 flex items-center gap-1.5">
                    {mtSchedule.holdLockActive ? (
                      <span className="text-rose-400 font-bold flex items-center gap-1">
                        <LuxuryIcons.LockFreeze /> LOCKED ({mtSchedule.ledgerAccountHoldId})
                      </span>
                    ) : (
                      <span className="text-emerald-400 font-bold flex items-center gap-1">
                        <LuxuryIcons.CheckDouble /> UNLOCKED / PERMISSIVE
                      </span>
                    )}
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-[10px] text-slate-400 uppercase font-mono">Sequence Validation</div>
                  <div className="text-xs font-mono text-emerald-300 mt-0.5">Automated 2-Way Ledger Sync</div>
                </div>
              </div>
            </div>
          </div>

          {/* Action Row: Emergency Mandate Terminate + Ledger Lock */}
          <div className="mt-6 pt-4 border-t border-slate-800 flex items-center justify-between gap-3">
            <button
              onClick={handleTerminateMandateAndLockLedger}
              disabled={isTerminatingHold || mtSchedule.holdLockActive}
              className="flex-1 py-2.5 px-4 bg-gradient-to-r from-rose-900/40 to-rose-700/30 hover:from-rose-800/60 hover:to-rose-600/50 border border-rose-500/40 rounded-xl text-rose-200 text-xs font-bold tracking-wide uppercase flex items-center justify-center gap-2 transition-all cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed active:scale-98"
            >
              <LuxuryIcons.LockFreeze />
              {isTerminatingHold ? 'Freezing Mandate & Ledger...' : 'Terminate Mandate & Hold Ledger'}
            </button>
          </div>
        </section>
      </div>

      {/* --- AI NEURAL ROUTING & PREDICTIVE LIQUIDITY ENGINE --- */}
      <section className="w-full bg-[#0D1322]/80 backdrop-blur-xl border border-purple-500/20 rounded-2xl p-6 relative overflow-hidden shadow-2xl">
        <div className="absolute top-0 right-1/4 w-96 h-96 bg-purple-500/5 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4 pb-4 border-b border-purple-500/10">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-purple-500/10 border border-purple-400/30 rounded-xl">
              <LuxuryIcons.AiBrain />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100 uppercase tracking-wide flex items-center gap-2">
                AI Neural Liquidity Matrix & Arbitrage Routing
                <span className="text-[10px] font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30 px-2 py-0.5 rounded">
                  MODEL: CITI-TREASURY-LLM-ULTRA
                </span>
              </h3>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Monte Carlo standing instruction frequency predictor & slippage compression engine
              </p>
            </div>
          </div>

          <button
            onClick={handleTriggerAiOptimization}
            disabled={isAiOptimizing}
            className="py-2 px-4 bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold uppercase tracking-wider rounded-xl shadow-lg shadow-purple-950/40 transition-all cursor-pointer disabled:opacity-40 active:scale-95 whitespace-nowrap"
          >
            {isAiOptimizing ? 'Re-optimizing Weights...' : 'Run Neural Yield Engine'}
          </button>
        </div>

        {/* AI Metrics Breakdown */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-5">
          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Neural Confidence</div>
            <div className="text-xl font-extrabold text-purple-300 font-mono mt-1">{aiMetrics.confidenceScore}%</div>
            <div className="text-[10px] text-slate-500 mt-1">Tolerance threshold ±0.02%</div>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Annualized Yield Arbitrage</div>
            <div className="text-xl font-extrabold text-amber-300 font-mono mt-1">+{aiMetrics.arbitrageYieldAnnualized}%</div>
            <div className="text-[10px] text-slate-500 mt-1">Over baseline Fed Funds sweep</div>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Estimated Slippage Impact</div>
            <div className="text-xl font-extrabold text-emerald-400 font-mono mt-1">{aiMetrics.estimatedSlippageBps} bps</div>
            <div className="text-[10px] text-slate-500 mt-1">Zero-reserve drag guarantee</div>
          </div>

          <div className="p-4 bg-slate-900/60 rounded-xl border border-slate-800">
            <div className="text-[10px] text-slate-400 uppercase font-mono">Recommended Sweep Window</div>
            <div className="text-xs font-bold text-slate-200 font-mono mt-2 truncate">{aiMetrics.recommendedSweepWindowUtc}</div>
            <div className="text-[10px] text-slate-500 mt-1">Automated dispatch trigger</div>
          </div>
        </div>

        {/* AI Commentary Bar */}
        <div className="mt-4 p-3.5 bg-purple-950/20 border border-purple-500/30 rounded-xl flex items-start gap-3">
          <span className="text-purple-400 font-mono text-xs font-bold">AI HEURISTIC:</span>
          <span className="text-xs text-purple-200 font-mono">{aiMetrics.aiHeuristicNote}</span>
        </div>
      </section>

      {/* --- REAL-TIME AUDIT TRAIL & TELEMETRY LOGS --- */}
      <section className="w-full bg-[#080C14]/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl">
        <div className="flex items-center justify-between pb-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse" />
            <h3 className="text-sm font-bold uppercase tracking-wider text-slate-200 font-mono">
              Immutable Real-Time Telemetry & Ledger Event Stream
            </h3>
          </div>
          <span className="text-[10px] text-slate-500 font-mono">ISO 20022 / MT JSON Compliant Stream</span>
        </div>

        <div className="divide-y divide-slate-800/60 mt-2 max-h-60 overflow-y-auto font-mono text-xs pr-2">
          {auditLogs.map((log) => (
            <div key={log.id} className="py-3 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-2 hover:bg-slate-900/40 px-2 rounded-lg transition-colors">
              <div className="flex items-start sm:items-center gap-3">
                <span className={`text-[10px] px-2 py-0.5 rounded font-bold ${
                  log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/30' :
                  log.status === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/30' :
                  'bg-rose-500/10 text-rose-400 border border-rose-500/30'
                }`}>
                  {log.eventType}
                </span>
                <span className="text-slate-300 text-xs">{log.details}</span>
              </div>
              <span className="text-[11px] text-slate-500 whitespace-nowrap">{log.timestamp}</span>
            </div>
          ))}
        </div>
      </section>

      {/* --- FOOTER COMPLIANCE HUD --- */}
      <footer className="w-full py-4 px-6 bg-[#0A0D18]/60 border border-slate-800/80 rounded-xl flex flex-col sm:flex-row items-center justify-between text-[11px] font-mono text-slate-500 gap-2">
        <div>
          CITIBANK N.A. GLOBAL TREASURY • MODERN TREASURY ENTERPRISE LEDGER PLATFORM
        </div>
        <div className="flex items-center gap-4">
          <span>HIGH-AVAILABILITY: 99.999%</span>
          <span>CHIPS ID: 0089</span>
          <span>FEDWIRE ROUTING: 021000089</span>
        </div>
      </footer>

    </div>
  );
};

export default ModernTreasuryRecurringFlowGateway;