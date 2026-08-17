import React, { useState, useEffect, useId } from 'react';
import {
  ShieldAlert,
  ShieldCheck,
  KeyRound,
  Cpu,
  Fingerprint,
  Lock,
  Unlock,
  AlertTriangle,
  FileCheck2,
  RefreshCw,
  Zap,
  Terminal,
  Activity,
  Award,
  Layers,
  Database,
  ArrowRightLeft,
  XCircle,
  CheckCircle2,
  HelpCircle,
  Flame,
  Globe,
  Sliders,
  DollarSign
} from 'lucide-react';

interface StandingInstruction {
  instructionId: string;
  standingOrderId: string;
  modernTreasuryLedgerId: string;
  citiOmniAccountId: string;
  beneficiaryName: string;
  beneficiaryBic: string;
  beneficiaryIban: string;
  amount: number;
  currency: string;
  frequency: 'DAILY' | 'WEEKLY' | 'FORTNIGHTLY' | 'MONTHLY' | 'QUARTERLY' | 'BIANNUAL' | 'ANNUAL' | 'SOVEREIGN_TRANCHE';
  nextExecutionDate: string;
  settlementRail: 'CITI_CHIPS_DIRECT' | 'FEDNOW_HIGH_VALUE' | 'TARGET2_SOVEREIGN' | 'SWIFT_GPI_INSTANT';
  riskScore: number;
  allocatedPortfolioYieldBps: number;
  mandateStatus: 'ACTIVE_RECURRING' | 'SUSPENDED_REVIEW' | 'PENDING_TERMINATION';
  tierClassification: 'ULTRA_HNW_SOVEREIGN' | 'INSTITUTIONAL_PRIME' | 'GLOBAL_RESERVE_TIER_0';
}

interface DualAuthParty {
  role: 'PRIMARY_SOVEREIGN_OFFICER' | 'CITI_AI_GUARDIAN_AGENT';
  identity: string;
  keyFingerprint: string;
  status: 'PENDING' | 'AUTHENTICATED' | 'CHALLENGE_FAILED';
  authMethod: 'YUBIKEY_BIO_5C' | 'QUANTUM_ENTANGLED_TOKEN' | 'NEURAL_CIPHER_VOICE';
  timestamp?: string;
  signature?: string;
}

interface SimulatedErrorScenario {
  code: number;
  label: string;
  citiErrorCode: string;
  modernTreasuryCode: string;
  description: string;
  mitigationProtocol: string;
}

const ERROR_SCENARIOS: SimulatedErrorScenario[] = [
  {
    code: 200,
    label: '200 OK - Sovereign Deletion Cleared',
    citiErrorCode: 'CITI_TERM_SUCCESS_000',
    modernTreasuryCode: 'mt_standing_rule_deleted_v3',
    description: 'Standing instruction cleanly decoupled across Citi Global Ledger and Modern Treasury Sovereign Gateway.',
    mitigationProtocol: 'Instant archival and unreserved asset collateral release.'
  },
  {
    code: 400,
    label: '400 Bad Request - Payload Schema Malformed',
    citiErrorCode: 'CITI_SCHEM_400_INVALID_DIGEST',
    modernTreasuryCode: 'mt_invalid_parameter_instruction_id',
    description: 'Missing cryptographic nonce or unaligned ISO20022 camt.054 deletion envelope parameters.',
    mitigationProtocol: 'Re-sign the raw payload using the 8192-bit Citi Sovereign Signature Engine.'
  },
  {
    code: 401,
    label: '401 Unauthorized - Gold Token Revoked',
    citiErrorCode: 'CITI_AUTH_401_TOKEN_EXP_OR_CORRUPT',
    modernTreasuryCode: 'mt_auth_unauthorized_bearer',
    description: 'Hardware Enclave session token decayed. The HSM Master Key must be refreshed via physical biometric tap.',
    mitigationProtocol: 'Re-challenge hardware enclave keypair and initiate secondary biometrics.'
  },
  {
    code: 403,
    label: '403 Forbidden - Dual Sovereign Hold Active',
    citiErrorCode: 'CITI_SEC_403_DUAL_KEY_ABSENT',
    modernTreasuryCode: 'mt_rule_policy_veto_enforced',
    description: 'Secondary Citi Autonomous Risk AI or Board-level Sovereign Trustee did not sign the irrevocable termination mandate.',
    mitigationProtocol: 'Invoke Tier-0 Escrow override with Citi Executive Wealth Desk physical authorization.'
  },
  {
    code: 404,
    label: '404 Not Found - Instruction Void or Expired',
    citiErrorCode: 'CITI_RECORD_404_ORPHAN_INSTRUCTION',
    modernTreasuryCode: 'mt_resource_not_found_standing_order',
    description: 'The standing instruction UUID cannot be indexed in Citi Global Clearing or Modern Treasury sync buffer.',
    mitigationProtocol: 'Query Citi Global Archive Cold-Storage clusters or verify instruction state.'
  },
  {
    code: 422,
    label: '422 Unprocessable - Liquidity Covenant Violation',
    citiErrorCode: 'CITI_COV_422_MIN_COLLATERAL_LOCKED',
    modernTreasuryCode: 'mt_ledger_lockup_rule_active',
    description: 'Standing order deletion violates an active $500M+ syndicate pledge or sovereign debt liquidity baseline.',
    mitigationProtocol: 'Release underlying syndicated repo contracts or offset portfolio margin in Citi Velocity.'
  },
  {
    code: 500,
    label: '500 Internal Server Error - Quantum Mainframe Drift',
    citiErrorCode: 'CITI_CORE_500_QUANTUM_MAINFRAME_SYNC_FAIL',
    modernTreasuryCode: 'mt_gateway_upstream_timeout_500',
    description: 'Cross-continental optical fiber relay desynchronized during atomic rollback between London and New York nodes.',
    mitigationProtocol: 'Re-route telemetry packet via Tokyo Sovereign Quantum Optical trunk and retry.'
  }
];

export const CitiRepeatingPaymentTerminationGateway: React.FC = () => {
  const componentId = useId();

  // Selected Target Instruction
  const [selectedInstruction, setSelectedInstruction] = useState<StandingInstruction>({
    instructionId: 'CITI-SOV-ORD-994827104-X9',
    standingOrderId: 'SO_GOLD_RECUR_0091823',
    modernTreasuryLedgerId: 'mt_ldg_884910284756',
    citiOmniAccountId: 'CITI-PB-OMNI-00088194-LUX',
    beneficiaryName: 'AURELIA DYNATRONICS SOVEREIGN FOUNDATION',
    beneficiaryBic: 'CITIUS33XXX',
    beneficiaryIban: 'US89CITI0008819400099482',
    amount: 25000000.00,
    currency: 'USD',
    frequency: 'MONTHLY',
    nextExecutionDate: '2025-04-01T00:00:00Z',
    settlementRail: 'CITI_CHIPS_DIRECT',
    riskScore: 99.4,
    allocatedPortfolioYieldBps: 485,
    mandateStatus: 'ACTIVE_RECURRING',
    tierClassification: 'GLOBAL_RESERVE_TIER_0'
  });

  // Dual Authorization State
  const [partyA, setPartyA] = useState<DualAuthParty>({
    role: 'PRIMARY_SOVEREIGN_OFFICER',
    identity: 'LORD_STERLING_PRIVATE_OFFICE_01',
    keyFingerprint: 'SHA512:9A8B:77C2:104E:F890:4BBD:9912:AA45:E01F:9981',
    status: 'AUTHENTICATED',
    authMethod: 'YUBIKEY_BIO_5C',
    timestamp: new Date().toISOString(),
    signature: 'SIG_SOV_A_0x99FF812A45C9921B'
  });

  const [partyB, setPartyB] = useState<DualAuthParty>({
    role: 'CITI_AI_GUARDIAN_AGENT',
    identity: 'CITI_NEURAL_SENTINEL_V4.9',
    keyFingerprint: 'SHA512:FF01:33B9:98A1:0024:DDE1:4519:7710:BB9A:512A',
    status: 'PENDING',
    authMethod: 'QUANTUM_ENTANGLED_TOKEN'
  });

  // Cryptographic & Simulation States
  const [simulatedErrorCode, setSimulatedErrorCode] = useState<number>(200);
  const [customReason, setCustomReason] = useState<string>('STRATEGIC_TREASURY_REBALANCING_TIER0_MIGRATION');
  const [cryptographicNonce, setCryptographicNonce] = useState<string>('0x8f7d99a1c4b2e3f59012');
  const [isExecuting, setIsExecuting] = useState<boolean>(false);
  const [executionLogs, setExecutionLogs] = useState<string[]>([]);
  const [terminalResult, setTerminalResult] = useState<{
    status: 'IDLE' | 'SUCCESS' | 'FAILURE';
    httpCode?: number;
    errorDetails?: SimulatedErrorScenario;
    receiptId?: string;
    unlockedLiquidity?: number;
  }>({ status: 'IDLE' });

  // Refresh Nonce on Mount
  useEffect(() => {
    const randomHex = Array.from({ length: 20 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    setCryptographicNonce(`0x${randomHex}`);
  }, []);

  const handleAuthorizePartyB = () => {
    setPartyB({
      ...partyB,
      status: 'AUTHENTICATED',
      timestamp: new Date().toISOString(),
      signature: `SIG_AI_GUARDIAN_${Math.random().toString(36).substring(2, 12).toUpperCase()}`
    });
  };

  const handleRevokePartyB = () => {
    setPartyB({
      ...partyB,
      status: 'PENDING',
      timestamp: undefined,
      signature: undefined
    });
  };

  const handleExecuteTermination = async () => {
    setIsExecuting(true);
    setTerminalResult({ status: 'IDLE' });
    setExecutionLogs([]);

    const pushLog = (msg: string) => {
      setExecutionLogs(prev => [...prev, `[${new Date().toISOString().substring(11, 23)}] ${msg}`]);
    };

    pushLog('INITIATING ATOMIC TERMINATION PROTOCOL FOR STANDING INSTRUCTION...');
    await new Promise(r => setTimeout(r, 450));
    pushLog(`RESOLVING CITI PRIVATE OMNI LEDGER: ${selectedInstruction.citiOmniAccountId}`);
    await new Promise(r => setTimeout(r, 400));
    pushLog(`CROSS-CHECKING MODERN TREASURY LEDGER SYNC ID: ${selectedInstruction.modernTreasuryLedgerId}`);
    await new Promise(r => setTimeout(r, 500));
    pushLog(`VALIDATING DUAL-KEY ENCLAVE SIGNATURES [PARTY A: ${partyA.status}] [PARTY B: ${partyB.status}]`);
    await new Promise(r => setTimeout(r, 450));

    // Check Dual Auth
    if (partyA.status !== 'AUTHENTICATED' || partyB.status !== 'AUTHENTICATED') {
      pushLog('ABORTED: DUAL-KEY SOVEREIGN CONSENSUS INCOMPLETE. TERMINATION REJECTED.');
      const scenario = ERROR_SCENARIOS.find(s => s.code === 403)!;
      setTerminalResult({
        status: 'FAILURE',
        httpCode: 403,
        errorDetails: scenario
      });
      setIsExecuting(false);
      return;
    }

    pushLog(`SIMULATION ROUTING INJECTOR: CODE ${simulatedErrorCode} TARGETED.`);
    await new Promise(r => setTimeout(r, 600));

    const activeScenario = ERROR_SCENARIOS.find(s => s.code === simulatedErrorCode) || ERROR_SCENARIOS[0];

    if (simulatedErrorCode === 200) {
      pushLog('EMITTING IRREVOCABLE CITI ISO20022 CAMT.056 CANCELLATION TELEGRAM...');
      await new Promise(r => setTimeout(r, 500));
      pushLog('MODERN TREASURY WEBHOOK DISPATCHED: event=standing_order.deleted payload=verified');
      await new Promise(r => setTimeout(r, 400));
      pushLog('RELEASING $25,000,000.00 RECURRING COLLATERAL RESERVATION TO SOVEREIGN TREASURY BALANCE.');
      await new Promise(r => setTimeout(r, 300));
      pushLog('TERMINATION COMPLETED. LEDGER SEALED WITH 8192-BIT QUANTUM HASH.');

      setSelectedInstruction(prev => ({
        ...prev,
        mandateStatus: 'PENDING_TERMINATION'
      }));

      setTerminalResult({
        status: 'SUCCESS',
        httpCode: 200,
        receiptId: `CITI-TERM-REC-${Math.floor(100000000 + Math.random() * 900000000)}`,
        unlockedLiquidity: selectedInstruction.amount
      });
    } else {
      pushLog(`INTERCEPTED ERROR RESPONSE: [HTTP ${activeScenario.code}] ${activeScenario.citiErrorCode}`);
      pushLog(`DIAGNOSTIC FAULT: ${activeScenario.description}`);
      pushLog(`RECOVERY PROTOCOL: ${activeScenario.mitigationProtocol}`);

      setTerminalResult({
        status: 'FAILURE',
        httpCode: activeScenario.code,
        errorDetails: activeScenario
      });
    }

    setIsExecuting(false);
  };

  return (
    <div className="min-h-screen bg-[#07090E] text-slate-100 p-4 md:p-8 font-sans antialiased selection:bg-[#D4AF37] selection:text-black">
      {/* Background Subtle Luxury Accents */}
      <div className="fixed inset-0 pointer-events-none bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(212,175,55,0.08),rgba(255,255,255,0))]" />
      
      {/* Top Sovereign Header */}
      <header className="relative max-w-7xl mx-auto mb-8 border-b border-[#D4AF37]/30 pb-6 backdrop-blur-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-[#1C2333] via-[#0E131F] to-[#05070B] border border-[#D4AF37] flex items-center justify-center shadow-[0_0_25px_rgba(212,175,55,0.2)]">
                <Flame className="w-7 h-7 text-[#D4AF37] animate-pulse" />
              </div>
              <div className="absolute -bottom-1 -right-1 bg-emerald-500 w-3.5 h-3.5 rounded-full border-2 border-[#07090E]" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[11px] font-mono tracking-widest text-[#D4AF37] uppercase bg-[#D4AF37]/10 px-2 py-0.5 rounded border border-[#D4AF37]/30">
                  CITIBANK PRIVATE WEALTH + MODERN TREASURY
                </span>
                <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                  <Activity className="w-3 h-3 animate-spin" /> ENCLAVE LIVE
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-white mt-1 font-bold">
                Standing Instruction Termination & De-registration Gateway
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Target Endpoint: <span className="text-slate-200">DELETE /v3/citi/standing-instructions/{"{instruction_id}"}</span>
              </p>
            </div>
          </div>

          {/* Realtime Telemetry Pill */}
          <div className="flex items-center gap-3 bg-[#0E131F]/80 border border-[#D4AF37]/20 rounded-lg p-3 shadow-inner">
            <div className="text-right">
              <div className="text-[10px] font-mono text-slate-400 uppercase">Sovereign Reserve Liquidity</div>
              <div className="text-lg font-mono font-bold text-[#D4AF37]">$1,482,900,000.00</div>
            </div>
            <div className="h-8 w-px bg-slate-700" />
            <Globe className="w-6 h-6 text-[#D4AF37]" />
          </div>
        </div>
      </header>

      {/* Main Grid Interface */}
      <main className="relative max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Target Instruction & Modern Treasury Bridge (7 cols) */}
        <section className="lg:col-span-7 space-y-6">
          
          {/* Standing Order Deep Inspection Card */}
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-6 relative overflow-hidden backdrop-blur-xl shadow-2xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
                  Target Standing Mandate Dossier
                </h2>
              </div>
              <span className={`px-2.5 py-1 text-xs font-mono rounded-full font-medium ${
                selectedInstruction.mandateStatus === 'ACTIVE_RECURRING'
                  ? 'bg-amber-500/10 text-amber-300 border border-amber-500/30'
                  : 'bg-rose-500/10 text-rose-300 border border-rose-500/30'
              }`}>
                {selectedInstruction.mandateStatus}
              </span>
            </div>

            {/* Instruction Metadata */}
            <div className="mt-5 grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="p-3.5 bg-[#05070B]/80 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">INSTRUCTION REFERENCE</div>
                <div className="text-sm font-mono text-white font-semibold mt-1 break-all">
                  {selectedInstruction.instructionId}
                </div>
                <div className="text-[11px] font-mono text-[#D4AF37] mt-0.5">
                  Standing Order ID: {selectedInstruction.standingOrderId}
                </div>
              </div>

              <div className="p-3.5 bg-[#05070B]/80 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">MODERN TREASURY LEDGER SYNC</div>
                <div className="text-sm font-mono text-cyan-400 font-semibold mt-1 flex items-center gap-1.5">
                  <Database className="w-3.5 h-3.5" />
                  {selectedInstruction.modernTreasuryLedgerId}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Omni Account: {selectedInstruction.citiOmniAccountId}
                </div>
              </div>

              <div className="p-3.5 bg-[#05070B]/80 rounded-xl border border-slate-800/80 md:col-span-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-mono text-slate-400">BENEFICIARY SOVEREIGN ENTITY</span>
                  <span className="text-[10px] font-mono text-emerald-400">{selectedInstruction.settlementRail}</span>
                </div>
                <div className="text-base font-serif text-slate-100 font-bold mt-1">
                  {selectedInstruction.beneficiaryName}
                </div>
                <div className="text-xs font-mono text-slate-400 mt-1 flex flex-wrap gap-4">
                  <span>BIC: <span className="text-slate-200">{selectedInstruction.beneficiaryBic}</span></span>
                  <span>IBAN: <span className="text-slate-200">{selectedInstruction.beneficiaryIban}</span></span>
                </div>
              </div>

              <div className="p-3.5 bg-[#05070B]/80 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">TRANCHE RECURRING AMOUNT</div>
                <div className="text-2xl font-mono text-emerald-400 font-bold mt-1">
                  ${selectedInstruction.amount.toLocaleString('en-US', { minimumFractionDigits: 2 })}
                  <span className="text-xs text-slate-400 ml-1 font-normal">{selectedInstruction.currency}</span>
                </div>
                <div className="text-[11px] font-mono text-amber-300 mt-0.5">
                  Cadence: {selectedInstruction.frequency}
                </div>
              </div>

              <div className="p-3.5 bg-[#05070B]/80 rounded-xl border border-slate-800/80">
                <div className="text-[10px] font-mono text-slate-400">SCHEDULED NEXT EXECUTION</div>
                <div className="text-sm font-mono text-white font-medium mt-1">
                  {new Date(selectedInstruction.nextExecutionDate).toUTCString()}
                </div>
                <div className="text-[11px] font-mono text-slate-400 mt-0.5">
                  Yield Drag: -{selectedInstruction.allocatedPortfolioYieldBps} bps/yr
                </div>
              </div>
            </div>

            {/* Termination Reason Prompt */}
            <div className="mt-5 pt-4 border-t border-slate-800">
              <label className="block text-xs font-mono text-[#D4AF37] uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Sliders className="w-3.5 h-3.5" /> Irrevocable Cancellation Justification (ISO-20022 Audit Trail)
              </label>
              <select
                value={customReason}
                onChange={(e) => setCustomReason(e.target.value)}
                className="w-full bg-[#05070B] border border-slate-700 rounded-lg px-3 py-2.5 text-sm font-mono text-slate-200 focus:outline-none focus:border-[#D4AF37]"
              >
                <option value="STRATEGIC_TREASURY_REBALANCING_TIER0_MIGRATION">
                  STRATEGIC_TREASURY_REBALANCING_TIER0_MIGRATION (Collateral reallocation)
                </option>
                <option value="MANDATE_EXPIRATION_SYNDICATE_FULFILLED">
                  MANDATE_EXPIRATION_SYNDICATE_FULFILLED (Syndicated loan tranche closed)
                </option>
                <option value="SECURITY_ANOMALY_DEFENSIVE_LOCKDOWN">
                  SECURITY_ANOMALY_DEFENSIVE_LOCKDOWN (Defensive cold-storage quarantine)
                </option>
                <option value="SOVEREIGN_FORCE_MAJEURE_DISSOLUTION">
                  SOVEREIGN_FORCE_MAJEURE_DISSOLUTION (Treaty/Regulatory divestment)
                </option>
              </select>
            </div>
          </div>

          {/* Error Simulation Diagnostics Studio */}
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-amber-400" />
                <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
                  Simulated Error State Diagnosis & Sandbox
                </h2>
              </div>
              <span className="text-[10px] font-mono text-slate-400 bg-slate-800 px-2 py-0.5 rounded">
                RFC-7807 Compliant
              </span>
            </div>

            <p className="text-xs text-slate-400 mt-3 font-mono leading-relaxed">
              Inject synthetic error states directly into the Citibank Core Gateway & Modern Treasury webhook harness to verify system-level fault tolerance, collateral unrolling, and atomic ledger rollback.
            </p>

            {/* Error Buttons */}
            <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
              {ERROR_SCENARIOS.map((scenario) => {
                const isSelected = simulatedErrorCode === scenario.code;
                const isSuccess = scenario.code === 200;
                return (
                  <button
                    key={scenario.code}
                    onClick={() => setSimulatedErrorCode(scenario.code)}
                    className={`px-3 py-2.5 rounded-lg text-left border transition-all text-xs font-mono flex flex-col justify-between ${
                      isSelected
                        ? isSuccess
                          ? 'bg-emerald-950/40 border-emerald-500 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                          : 'bg-rose-950/40 border-rose-500 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.2)]'
                        : 'bg-[#05070B] border-slate-800 text-slate-400 hover:border-slate-700 hover:text-slate-200'
                    }`}
                  >
                    <span className="font-bold">{scenario.code} {isSuccess ? 'PASS' : 'ERR'}</span>
                    <span className="text-[10px] opacity-75 truncate">{scenario.citiErrorCode}</span>
                  </button>
                );
              })}
            </div>

            {/* Scenario Deep Dive Box */}
            {(() => {
              const active = ERROR_SCENARIOS.find(s => s.code === simulatedErrorCode) || ERROR_SCENARIOS[0];
              return (
                <div className="mt-4 p-3.5 bg-[#05070B] rounded-xl border border-slate-800 text-xs font-mono space-y-2">
                  <div className="flex items-center justify-between text-slate-300">
                    <span className="text-[#D4AF37] font-semibold">{active.label}</span>
                    <span className="text-[10px] text-slate-500">{active.modernTreasuryCode}</span>
                  </div>
                  <p className="text-slate-400 text-[11px] leading-relaxed">{active.description}</p>
                  <div className="pt-2 border-t border-slate-800/80 text-[11px] text-amber-300/90 flex items-start gap-1.5">
                    <ShieldAlert className="w-3.5 h-3.5 flex-shrink-0 mt-0.5 text-amber-400" />
                    <span>Mitigation: {active.mitigationProtocol}</span>
                  </div>
                </div>
              );
            })()}
          </div>
        </section>

        {/* Right Column: High-Security Two-Party Authorization & Live Execution Gateway (5 cols) */}
        <section className="lg:col-span-5 space-y-6">
          
          {/* Dual Authorization Panel */}
          <div className="bg-[#0B0F19]/90 border border-slate-800 rounded-2xl p-6 backdrop-blur-xl shadow-2xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-sm font-semibold tracking-wider text-slate-200 uppercase font-mono">
                  Two-Party Sovereign Enclave
                </h2>
              </div>
              <div className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/30">
                <Lock className="w-3 h-3" /> MULTI-SIG 2/2
              </div>
            </div>

            {/* Party A Card */}
            <div className="mt-5 p-4 rounded-xl bg-[#05070B] border border-slate-800 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-950/40 border border-emerald-500/50 flex items-center justify-center">
                    <Fingerprint className="w-5 h-5 text-emerald-400" />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">PARTY A (PRIMARY SOVEREIGN)</div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{partyA.identity}</div>
                  </div>
                </div>
                <span className="px-2 py-0.5 bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 text-[10px] font-mono rounded">
                  VERIFIED
                </span>
              </div>
              <div className="mt-3 text-[10px] font-mono text-slate-500 break-all">
                Key Fingerprint: <span className="text-slate-400">{partyA.keyFingerprint}</span>
              </div>
              <div className="mt-1 text-[10px] font-mono text-emerald-500/80">
                Signature: {partyA.signature}
              </div>
            </div>

            {/* Party B Card */}
            <div className="mt-4 p-4 rounded-xl bg-[#05070B] border border-slate-800 relative">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-lg border flex items-center justify-center ${
                    partyB.status === 'AUTHENTICATED'
                      ? 'bg-emerald-950/40 border-emerald-500/50'
                      : 'bg-amber-950/40 border-amber-500/50'
                  }`}>
                    <Cpu className={`w-5 h-5 ${partyB.status === 'AUTHENTICATED' ? 'text-emerald-400' : 'text-amber-400 animate-pulse'}`} />
                  </div>
                  <div>
                    <div className="text-[10px] font-mono text-slate-400">PARTY B (CITI AI SENTINEL)</div>
                    <div className="text-xs font-mono font-bold text-slate-200 mt-0.5">{partyB.identity}</div>
                  </div>
                </div>
                <span className={`px-2 py-0.5 text-[10px] font-mono rounded border ${
                  partyB.status === 'AUTHENTICATED'
                    ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/30'
                    : 'bg-amber-500/10 text-amber-400 border-amber-500/30'
                }`}>
                  {partyB.status}
                </span>
              </div>

              <div className="mt-3 text-[10px] font-mono text-slate-500 break-all">
                Key Fingerprint: <span className="text-slate-400">{partyB.keyFingerprint}</span>
              </div>

              {partyB.status === 'AUTHENTICATED' ? (
                <div className="mt-2 flex items-center justify-between">
                  <span className="text-[10px] font-mono text-emerald-500/80">
                    Signature: {partyB.signature}
                  </span>
                  <button
                    onClick={handleRevokePartyB}
                    className="text-[10px] font-mono text-rose-400 hover:underline"
                  >
                    Revoke Consent
                  </button>
                </div>
              ) : (
                <div className="mt-3">
                  <button
                    onClick={handleAuthorizePartyB}
                    className="w-full py-2 bg-gradient-to-r from-amber-500/20 to-[#D4AF37]/20 hover:from-amber-500/30 hover:to-[#D4AF37]/30 border border-[#D4AF37]/40 text-[#D4AF37] rounded-lg text-xs font-mono font-semibold transition-all shadow-[0_0_15px_rgba(212,175,55,0.1)] flex items-center justify-center gap-2"
                  >
                    <Unlock className="w-3.5 h-3.5" /> Execute Autonomous AI Risk Sign-off
                  </button>
                </div>
              )}
            </div>

            {/* Cryptographic Pre-flight Payload Stamp */}
            <div className="mt-4 p-3 bg-[#05070B] rounded-xl border border-slate-800 text-[11px] font-mono text-slate-400 space-y-1">
              <div className="flex justify-between">
                <span>Cryptographic Enclave Nonce:</span>
                <span className="text-slate-200">{cryptographicNonce}</span>
              </div>
              <div className="flex justify-between">
                <span>Modern Treasury Idempotency Hash:</span>
                <span className="text-slate-200">idemp_sov_88194a001c</span>
              </div>
            </div>

            {/* Live Dispatch Button */}
            <div className="mt-6">
              <button
                disabled={isExecuting}
                onClick={handleExecuteTermination}
                className={`w-full py-3.5 rounded-xl font-mono text-xs uppercase tracking-widest font-bold transition-all shadow-xl flex items-center justify-center gap-2 ${
                  isExecuting
                    ? 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                    : 'bg-gradient-to-r from-rose-700 via-red-600 to-amber-600 text-white hover:brightness-110 border border-rose-500/40 shadow-[0_0_30px_rgba(225,29,72,0.3)] active:scale-[0.98]'
                }`}
              >
                {isExecuting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-amber-300" />
                    DECOUPLING CITIBANK STANDING INSTRUCTION...
                  </>
                ) : (
                  <>
                    <XCircle className="w-4 h-4 text-white" />
                    DISPATCH IRREVOCABLE STANDING INSTRUCTION TERMINATION
                  </>
                )}
              </button>
            </div>
          </div>

          {/* Terminal & Diagnostic Output Window */}
          <div className="bg-[#05070B] border border-slate-800 rounded-2xl p-5 font-mono shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800 text-xs text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-[#D4AF37]" />
                <span>TELEMETRY & ENCLAVE DISPATCH CONSOLE</span>
              </div>
              <span className="text-[10px] text-slate-500">PORT: 443 TLS 1.3</span>
            </div>

            {/* Console Log Stream */}
            <div className="mt-3 h-44 overflow-y-auto space-y-1.5 text-[11px] text-slate-300 pr-1 scrollbar-thin scrollbar-thumb-slate-800">
              {executionLogs.length === 0 ? (
                <div className="text-slate-600 italic mt-12 text-center">
                  Standby. Awaiting two-party cryptographic challenge signature...
                </div>
              ) : (
                executionLogs.map((log, index) => (
                  <div key={index} className="leading-tight font-mono">
                    <span className="text-[#D4AF37] select-none">{'> '}</span>
                    {log}
                  </div>
                ))
              )}
            </div>

            {/* Terminal Result Card */}
            {terminalResult.status !== 'IDLE' && (
              <div className={`mt-4 p-4 rounded-xl border transition-all ${
                terminalResult.status === 'SUCCESS'
                  ? 'bg-emerald-950/30 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-950/30 border-rose-500/50 text-rose-200'
              }`}>
                <div className="flex items-start gap-3">
                  {terminalResult.status === 'SUCCESS' ? (
                    <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0 mt-0.5" />
                  ) : (
                    <XCircle className="w-5 h-5 text-rose-400 flex-shrink-0 mt-0.5" />
                  )}
                  <div className="space-y-1 text-xs">
                    <div className="font-bold flex items-center gap-2">
                      <span>HTTP {terminalResult.httpCode}</span>
                      <span>•</span>
                      <span>
                        {terminalResult.status === 'SUCCESS'
                          ? 'MANDATE TERMINATED & COLLATERAL RESTORED'
                          : terminalResult.errorDetails?.citiErrorCode}
                      </span>
                    </div>

                    {terminalResult.status === 'SUCCESS' && (
                      <>
                        <div className="text-[11px] opacity-90">
                          Receipt UUID: <span className="font-mono text-white">{terminalResult.receiptId}</span>
                        </div>
                        <div className="text-[11px] text-emerald-400 font-bold">
                          Freed Collateral: +${terminalResult.unlockedLiquidity?.toLocaleString('en-US', { minimumFractionDigits: 2 })} USD
                        </div>
                      </>
                    )}

                    {terminalResult.status === 'FAILURE' && terminalResult.errorDetails && (
                      <>
                        <div className="text-[11px] opacity-90 leading-relaxed">
                          {terminalResult.errorDetails.description}
                        </div>
                        <div className="text-[10px] text-amber-300 font-semibold pt-1">
                          Remediation: {terminalResult.errorDetails.mitigationProtocol}
                        </div>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>
      </main>

      {/* Footer Sovereign Seal */}
      <footer className="relative max-w-7xl mx-auto mt-8 pt-4 border-t border-slate-800/80 text-center text-xs font-mono text-slate-500 flex flex-col sm:flex-row items-center justify-between gap-2">
        <div>
          CITIBANK N.A. GLOBAL WEALTH MANAGEMENT • MODERN TREASURY MULTI-LEDGER BRIDGE
        </div>
        <div className="flex items-center gap-3 text-slate-400">
          <span>ISO 20022 STANDARDS</span>
          <span>•</span>
          <span>FIPS 140-3 LEVEL 4 HSM</span>
          <span>•</span>
          <span className="text-[#D4AF37]">ZERO-LOSS ATOMIC COMMIT</span>
        </div>
      </footer>
    </div>
  );
};

export default CitiRepeatingPaymentTerminationGateway;