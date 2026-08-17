import React, { useState, useEffect, useMemo } from 'react';
import { 
  Shield, 
  ShieldCheck, 
  ShieldAlert, 
  Lock, 
  Unlock, 
  Key, 
  Fingerprint, 
  Clock, 
  AlertTriangle, 
  FileText, 
  CheckCircle2, 
  XCircle, 
  RefreshCw, 
  Eye, 
  EyeOff, 
  Cpu, 
  ExternalLink, 
  Zap, 
  Send,
  Building,
  UserCheck,
  Terminal,
  Activity,
  Award
} from 'lucide-react';

interface Signer {
  id: string;
  name: string;
  role: string;
  division: string;
  institution: 'Citibank Private Capital' | 'Modern Treasury Orchestration' | 'Sovereign Wealth Custody';
  fido2KeyId: string;
  status: 'PENDING' | 'AUTHORIZED' | 'REJECTED';
  timestamp?: string;
  ipAddress: string;
  securityClearance: 'TIER-1 SOVEREIGN' | 'EXECUTIVE DESK' | 'TREASURY ADMIN';
}

interface EphemeralUnmaskRequest {
  requestId: string;
  internalAccountId: string;
  counterpartyId: string;
  legalEntity: string;
  maskedIban: string;
  unmaskedIban: string;
  maskedRouting: string;
  unmaskedRouting: string;
  currency: string;
  amountAllocated: string;
  pipelineDestination: string;
  riskScore: number;
  dualCustodyThreshold: number;
  approvedCount: number;
  initialTtlSeconds: number;
  remainingTtl: number;
  status: 'AWAITING_APPROVALS' | 'UNMASKED_ACTIVE' | 'EXPIRED_SHREDDED' | 'REVOKED';
  hardwareSessionToken: string;
  sha256Signature: string;
}

const INITIAL_SIGNERS: Signer[] = [
  {
    id: 'SIG-0941-CITI',
    name: 'Lord Alistair Sterling-Vane',
    role: 'Managing Director, Global Interbank Settlements',
    division: 'Citibank N.A. London Ultra-Prime',
    institution: 'Citibank Private Capital',
    fido2KeyId: 'YUBI-ENT-9941-X90',
    status: 'AUTHORIZED',
    timestamp: '2025-03-30T10:14:02.192Z',
    ipAddress: '199.167.211.4 (Citi Dedicated Sovereign Fibernet)',
    securityClearance: 'TIER-1 SOVEREIGN',
  },
  {
    id: 'SIG-8812-MT',
    name: 'Dr. Evelyn Vasquez-Chen',
    role: 'Chief Treasury Architect & Cryptographic Controller',
    division: 'Automated Pipeline Operations',
    institution: 'Modern Treasury Orchestration',
    fido2KeyId: 'FIDO2-PRO-MT-8812',
    status: 'PENDING',
    ipAddress: '12.202.94.101 (Direct Direct-Connect Equinix LD4)',
    securityClearance: 'EXECUTIVE DESK',
  },
  {
    id: 'SIG-4001-ESC',
    name: 'Ambassador Henrik Von Berg',
    role: 'Chief Compliance & Sanctions Officer',
    division: 'High-Value Regulatory Oversight Desk',
    institution: 'Sovereign Wealth Custody',
    fido2KeyId: 'TITAN-HW-SEC-4001',
    status: 'PENDING',
    ipAddress: '204.79.197.200 (Zurich Vault Node 04)',
    securityClearance: 'TIER-1 SOVEREIGN',
  }
];

const INITIAL_REQUEST: EphemeralUnmaskRequest = {
  requestId: 'REQ-CITI-MT-883921-ALPHA',
  internalAccountId: 'ia_citi_svrn_9099238411',
  counterpartyId: 'cp_qatar_invest_auth_77312',
  legalEntity: 'State of Qatar Supreme Investment Authority / QIA Vault 09',
  maskedIban: 'QA98 QNBA •••• •••• •••• •••• 9921',
  unmaskedIban: 'QA98 QNBA 0000 0012 8847 9012 9921',
  maskedRouting: 'QNBAQAQA•••',
  unmaskedRouting: 'QNBAQAQADOH',
  currency: 'USD',
  amountAllocated: '$485,000,000.00 USD',
  pipelineDestination: 'Modern Treasury Ledger Pipeline -> Fedwire ISO20022 High-Value RTGS (Citi Clearing Gateway NY)',
  riskScore: 99.98,
  dualCustodyThreshold: 2,
  approvedCount: 1,
  initialTtlSeconds: 180,
  remainingTtl: 180,
  status: 'AWAITING_APPROVALS',
  hardwareSessionToken: '0xFA91C4B8923E8472910AF73B550198EBC94812395721DFBA837201948572A90F',
  sha256Signature: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
};

export const ModernTreasuryUnmaskingPolicyEngine: React.FC = () => {
  const [request, setRequest] = useState<EphemeralUnmaskRequest>(INITIAL_REQUEST);
  const [signers, setSigners] = useState<Signer[]>(INITIAL_SIGNERS);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'policy' | 'cryptographic_audit' | 'pipeline_injection'>('policy');
  const [auditLogs, setAuditLogs] = useState<string[]>([
    '[SYSTEM_INIT] Dual-Custody Sovereign Policy Engine activated for Modern Treasury Payment Rails.',
    '[CITI_HSM] Hardware Security Module SafeNet Luna 7 connected to Citibank Core Clearing.',
    '[SIGNER_1] Lord Alistair Sterling-Vane authenticated via FIDO2 Level 3 Hardware Key (YUBI-ENT-9941-X90).',
    '[QUORUM_PROGRESS] 1 of 2 required signatures committed to ledger node.'
  ]);
  const [manualAccountInject, setManualAccountInject] = useState<string>('');
  const [hasInjectedToPipeline, setHasInjectedToPipeline] = useState<boolean>(false);

  // Time-to-Live Engine
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (request.status === 'UNMASKED_ACTIVE' && request.remainingTtl > 0) {
      timer = setInterval(() => {
        setRequest(prev => {
          if (prev.remainingTtl <= 1) {
            return {
              ...prev,
              remainingTtl: 0,
              status: 'EXPIRED_SHREDDED'
            };
          }
          return {
            ...prev,
            remainingTtl: prev.remainingTtl - 1
          };
        });
      }, 1000);
    } else if (request.status === 'UNMASKED_ACTIVE' && request.remainingTtl === 0) {
      setRequest(prev => ({ ...prev, status: 'EXPIRED_SHREDDED' }));
      appendAuditLog('[SECURITY_CRITICAL] Ephemeral TTL expired. In-memory unmasked cleartext cryptographic keys shredded.');
    }
    return () => clearInterval(timer);
  }, [request.status, request.remainingTtl]);

  const appendAuditLog = (msg: string) => {
    const timestamp = new Date().toISOString();
    setAuditLogs(prev => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  };

  const handleAuthorizeSigner = (signerId: string) => {
    setIsProcessing(true);
    setTimeout(() => {
      let updatedApproved = request.approvedCount;
      const updatedSigners = signers.map(s => {
        if (s.id === signerId && s.status !== 'AUTHORIZED') {
          updatedApproved += 1;
          appendAuditLog(`[HSM_SIGNED] Signature accepted from ${s.name} (${s.role}) using token ${s.fido2KeyId}.`);
          return {
            ...s,
            status: 'AUTHORIZED' as const,
            timestamp: new Date().toISOString()
          };
        }
        return s;
      });

      const isQuorumReached = updatedApproved >= request.dualCustodyThreshold;
      
      setSigners(updatedSigners);
      setRequest(prev => ({
        ...prev,
        approvedCount: updatedApproved,
        status: isQuorumReached ? 'UNMASKED_ACTIVE' : prev.status,
        remainingTtl: isQuorumReached ? prev.initialTtlSeconds : prev.remainingTtl
      }));

      if (isQuorumReached) {
        appendAuditLog('[QUORUM_REACHED] Dual-Custody Multi-Sig Threshold MET. Clear account details decrypted into memory with 180s TTL.');
      }

      setIsProcessing(false);
    }, 900);
  };

  const handleRevokeOrShred = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setRequest(prev => ({
        ...prev,
        status: 'REVOKED',
        remainingTtl: 0
      }));
      appendAuditLog('[EMERGENCY_OVERRIDE] Treasury Administrator manually triggered cryptographic session shredding.');
      setIsProcessing(false);
    }, 600);
  };

  const handleResetSession = () => {
    setRequest({
      ...INITIAL_REQUEST,
      remainingTtl: 180,
      status: 'AWAITING_APPROVALS',
      approvedCount: 1
    });
    setSigners(INITIAL_SIGNERS);
    setHasInjectedToPipeline(false);
    appendAuditLog('[POLICY_RESET] Initiated new Dual-Custody challenge lifecycle.');
  };

  const handlePipelineInjection = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setHasInjectedToPipeline(true);
      appendAuditLog(`[MODERN_TREASURY_DISPATCH] Raw clear payload ${request.unmaskedIban} injected to Modern Treasury Payment Order /v1/payment_orders pipeline.`);
      appendAuditLog('[CITIBANK_CLEARING] Citi Private Bank NY Fedwire ISO20022 High-Priority acknowledgement received. Settlement queue locked.');
      setIsProcessing(false);
    }, 1200);
  };

  const formatTtl = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const isUnmasked = request.status === 'UNMASKED_ACTIVE';

  return (
    <div className="min-h-screen bg-[#030712] text-slate-100 font-sans p-4 md:p-8 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Opulent Header Bar */}
      <header className="border-b border-amber-500/20 pb-6 mb-8 backdrop-blur-md">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center space-x-4">
            <div className="relative">
              <div className="w-14 h-14 rounded-xl bg-gradient-to-br from-amber-400 via-amber-600 to-amber-950 p-[1.5px] shadow-[0_0_25px_rgba(217,119,6,0.35)]">
                <div className="w-full h-full bg-[#070b14] rounded-xl flex items-center justify-center">
                  <Shield className="w-7 h-7 text-amber-400" />
                </div>
              </div>
              <div className="absolute -bottom-1 -right-1 w-4 h-4 bg-emerald-500 rounded-full border-2 border-[#030712] animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-[10px] tracking-[0.25em] uppercase font-bold px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-amber-400">
                  Citibank Sovereign Core × Modern Treasury
                </span>
                <span className="text-[10px] tracking-[0.2em] uppercase font-semibold px-2 py-0.5 rounded bg-blue-500/10 border border-blue-500/30 text-blue-400">
                  FIPS 140-3 L4 Hardware Custody
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight text-white mt-1">
                Dual-Custody Unmasking & Policy Execution Console
              </h1>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Session: <span className="text-amber-300">{request.requestId}</span> | Multi-Sig Gate: Modern Treasury Cleartext Dispatch Pipeline
              </p>
            </div>
          </div>

          <div className="flex items-center space-x-3 w-full md:w-auto justify-end">
            <button 
              onClick={handleResetSession}
              className="flex items-center space-x-2 px-3.5 py-2 text-xs font-semibold uppercase tracking-wider text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-lg transition-all shadow-sm"
            >
              <RefreshCw className="w-3.5 h-3.5" />
              <span>Reset Policy State</span>
            </button>
            <div className="bg-gradient-to-r from-amber-500/20 to-amber-600/10 border border-amber-500/30 rounded-lg px-4 py-2 text-right">
              <span className="block text-[9px] uppercase tracking-widest text-amber-400/90 font-mono">Protected Value Tier</span>
              <span className="text-base font-bold text-amber-200 tracking-tight">{request.amountAllocated}</span>
            </div>
          </div>
        </div>
      </header>

      {/* Main Orchestration Interface */}
      <main className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 flex-1">
        {/* Left Column: Unmasking Status & Sensitive Payload Gateway */}
        <section className="lg:col-span-7 space-y-6 flex flex-col">
          {/* Status & TTL Security Meter */}
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#090d16]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl relative overflow-hidden backdrop-blur-xl">
            <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-6">
              <div className="flex items-center space-x-3">
                <div className={`p-2.5 rounded-lg border ${
                  request.status === 'UNMASKED_ACTIVE'
                    ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-400'
                    : request.status === 'EXPIRED_SHREDDED' || request.status === 'REVOKED'
                    ? 'bg-rose-950/40 border-rose-500/50 text-rose-400'
                    : 'bg-amber-950/40 border-amber-500/50 text-amber-400'
                }`}>
                  {request.status === 'UNMASKED_ACTIVE' ? <Unlock className="w-5 h-5" /> : <Lock className="w-5 h-5" />}
                </div>
                <div>
                  <div className="text-xs uppercase font-mono tracking-wider text-slate-400">Policy Authorization Status</div>
                  <div className="text-lg font-bold tracking-tight text-white flex items-center gap-2">
                    {request.status === 'UNMASKED_ACTIVE' && <span className="text-emerald-400 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> QUORUM ATTAINED — CLEARTEXT REVEALED</span>}
                    {request.status === 'AWAITING_APPROVALS' && <span className="text-amber-400 flex items-center gap-1.5"><Clock className="w-4 h-4" /> AWAITING DUAL-SIGNATURE CONFIRMATION</span>}
                    {request.status === 'EXPIRED_SHREDDED' && <span className="text-rose-400 flex items-center gap-1.5"><AlertTriangle className="w-4 h-4" /> TTL EXPIRED & MEMORY SHREDDED</span>}
                    {request.status === 'REVOKED' && <span className="text-rose-400 flex items-center gap-1.5"><XCircle className="w-4 h-4" /> SESSION MANUALLY REVOKED</span>}
                  </div>
                </div>
              </div>

              {/* TTL Countdown Clock */}
              <div className="text-right">
                <span className="text-[10px] uppercase font-mono tracking-widest text-slate-400 block">Cryptographic TTL</span>
                <div className={`text-2xl font-mono font-black ${
                  request.remainingTtl > 60 
                    ? 'text-emerald-400' 
                    : request.remainingTtl > 0 
                    ? 'text-amber-400 animate-pulse' 
                    : 'text-slate-600'
                }`}>
                  {formatTtl(request.remainingTtl)}
                </div>
              </div>
            </div>

            {/* Target Account Unmask Matrix */}
            <div className="space-y-4">
              <div className="bg-black/50 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex justify-between items-center text-xs font-mono text-slate-400 pb-2 border-b border-slate-800/60">
                  <span>Target Counterparty Entity:</span>
                  <span className="text-amber-300 font-semibold">{request.legalEntity}</span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Account / IBAN Section */}
                  <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>IBAN / Clear Identifier</span>
                      {isUnmasked ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <div className={`text-sm font-mono tracking-wider font-bold ${isUnmasked ? 'text-emerald-300 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/30' : 'text-slate-500 select-none'}`}>
                      {isUnmasked ? request.unmaskedIban : request.maskedIban}
                    </div>
                  </div>

                  {/* Routing / SWIFT BIC Section */}
                  <div className="bg-slate-900/60 p-3.5 rounded-lg border border-slate-800">
                    <div className="flex items-center justify-between text-[11px] font-mono text-slate-400 mb-1">
                      <span>Routing / SWIFT BIC</span>
                      {isUnmasked ? <Eye className="w-3.5 h-3.5 text-emerald-400" /> : <EyeOff className="w-3.5 h-3.5 text-slate-500" />}
                    </div>
                    <div className={`text-sm font-mono tracking-wider font-bold ${isUnmasked ? 'text-emerald-300 bg-emerald-950/20 px-2 py-1 rounded border border-emerald-500/30' : 'text-slate-500 select-none'}`}>
                      {isUnmasked ? request.unmaskedRouting : request.maskedRouting}
                    </div>
                  </div>
                </div>

                <div className="text-[11px] font-mono text-slate-400 pt-1 flex justify-between items-center">
                  <span>Routing Destination:</span>
                  <span className="text-blue-400 font-semibold">{request.pipelineDestination}</span>
                </div>
              </div>

              {/* Action Buttons & Guardrails */}
              <div className="flex flex-col sm:flex-row items-center gap-3 pt-2">
                <button
                  onClick={handleRevokeOrShred}
                  disabled={request.status === 'EXPIRED_SHREDDED' || request.status === 'REVOKED' || isProcessing}
                  className="w-full sm:w-1/2 py-3 px-4 bg-rose-950/40 hover:bg-rose-900/60 border border-rose-700/50 text-rose-300 font-semibold text-xs rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-lg shadow-rose-950/20"
                >
                  <AlertTriangle className="w-4 h-4 text-rose-400" />
                  <span>Immediate Ephemeral Shred</span>
                </button>

                <button
                  onClick={handlePipelineInjection}
                  disabled={!isUnmasked || hasInjectedToPipeline || isProcessing}
                  className="w-full sm:w-1/2 py-3 px-4 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-bold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center space-x-2 transition-all disabled:opacity-30 disabled:cursor-not-allowed shadow-[0_0_20px_rgba(245,158,11,0.35)]"
                >
                  {isProcessing ? (
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                  ) : hasInjectedToPipeline ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-black" />
                      <span>Injected to Modern Treasury</span>
                    </>
                  ) : (
                    <>
                      <Send className="w-4 h-4 text-black" />
                      <span>Inject to MT Payment Pipeline</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>

          {/* Real-time Policy & Cryptographic Audit Console */}
          <div className="flex-1 bg-[#090d16] border border-slate-800/90 rounded-2xl p-5 flex flex-col shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3 mb-3">
              <div className="flex items-center space-x-2">
                <Terminal className="w-4 h-4 text-amber-400" />
                <span className="text-xs font-mono font-bold tracking-wider uppercase text-slate-200">
                  Immutable Cryptographic Audit Trail (Citi SafeNet HSM × Modern Treasury Webhook Stream)
                </span>
              </div>
              <div className="flex items-center space-x-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-[10px] font-mono text-emerald-400">HSM LIVE</span>
              </div>
            </div>

            <div className="flex-1 min-h-[160px] max-h-[220px] overflow-y-auto font-mono text-[11px] space-y-1.5 pr-2 select-text scrollbar-thin scrollbar-thumb-slate-700">
              {auditLogs.map((log, index) => (
                <div key={index} className="text-slate-400 leading-relaxed font-mono hover:text-amber-200 transition-colors">
                  {log}
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* Right Column: Multi-Sig Executive Custodians */}
        <section className="lg:col-span-5 space-y-6 flex flex-col">
          <div className="bg-gradient-to-b from-[#0f172a]/90 to-[#070b14]/90 border border-slate-800 rounded-2xl p-6 shadow-2xl flex flex-col justify-between">
            <div>
              <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
                <div className="flex items-center space-x-2.5">
                  <UserCheck className="w-5 h-5 text-amber-400" />
                  <div>
                    <h2 className="text-sm font-bold uppercase tracking-wider text-white">Dual-Custody Quorum Policy</h2>
                    <span className="text-[11px] font-mono text-slate-400">Required: {request.dualCustodyThreshold} of {signers.length} Executive Signers</span>
                  </div>
                </div>
                <div className="px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-full text-xs font-mono font-bold text-amber-300">
                  {request.approvedCount} / {request.dualCustodyThreshold} SIGNED
                </div>
              </div>

              {/* List of Signers */}
              <div className="space-y-3.5">
                {signers.map((signer) => {
                  const isApproved = signer.status === 'AUTHORIZED';
                  return (
                    <div 
                      key={signer.id}
                      className={`p-4 rounded-xl border transition-all ${
                        isApproved
                          ? 'bg-emerald-950/20 border-emerald-500/40 shadow-inner'
                          : 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                      }`}
                    >
                      <div className="flex items-start justify-between">
                        <div className="space-y-1">
                          <div className="flex items-center space-x-2">
                            <span className="text-xs font-bold text-white tracking-wide">{signer.name}</span>
                            <span className="text-[9px] uppercase font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300 border border-slate-700">
                              {signer.securityClearance}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 font-medium">{signer.role}</p>
                          <p className="text-[10px] text-amber-400/80 font-mono">{signer.division} • {signer.institution}</p>
                        </div>
                        
                        <div>
                          {isApproved ? (
                            <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-[10px] font-mono font-bold text-emerald-400">
                              <CheckCircle2 className="w-3 h-3" />
                              <span>COMMITTED</span>
                            </span>
                          ) : (
                            <button
                              onClick={() => handleAuthorizeSigner(signer.id)}
                              disabled={isProcessing || request.status === 'EXPIRED_SHREDDED' || request.status === 'REVOKED'}
                              className="inline-flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-amber-500 hover:bg-amber-400 text-black text-xs font-bold uppercase tracking-wider transition-all disabled:opacity-40 disabled:cursor-not-allowed shadow-md shadow-amber-500/20"
                            >
                              <Fingerprint className="w-3.5 h-3.5 text-black" />
                              <span>Sign FIDO2</span>
                            </button>
                          )}
                        </div>
                      </div>

                      <div className="mt-3 pt-2.5 border-t border-slate-800/80 flex items-center justify-between text-[10px] font-mono text-slate-500">
                        <span>FIDO2 Token: <span className="text-slate-300">{signer.fido2KeyId}</span></span>
                        <span>{signer.timestamp ? new Date(signer.timestamp).toLocaleTimeString() : 'Awaiting challenge'}</span>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Hardware & Cryptographic Envelope Specs */}
            <div className="mt-6 pt-4 border-t border-slate-800 text-xs font-mono space-y-2 text-slate-400 bg-black/40 p-3.5 rounded-xl border border-slate-800">
              <div className="flex justify-between">
                <span>Hardware Session Nonce:</span>
                <span className="text-slate-200 truncate max-w-[200px]">{request.hardwareSessionToken}</span>
              </div>
              <div className="flex justify-between">
                <span>SHA-256 Envelope Digest:</span>
                <span className="text-slate-200 truncate max-w-[200px]">{request.sha256Signature}</span>
              </div>
              <div className="flex justify-between">
                <span>Modern Treasury Webhook:</span>
                <span className="text-emerald-400">mTLS Verified / HMAC-SHA256 Signed</span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Luxurious Institutional Footer */}
      <footer className="max-w-7xl mx-auto w-full pt-8 mt-8 border-t border-slate-800/60 flex flex-col md:flex-row items-center justify-between text-xs text-slate-500 font-mono gap-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
          <span>Citibank Sovereign Core Node London (LCH/CREST Gateway) connected with Modern Treasury Production VPC via AWS Direct Connect.</span>
        </div>
        <div className="flex items-center space-x-4">
          <span className="hover:text-amber-400 cursor-pointer">Security Policy v8.4.1</span>
          <span>•</span>
          <span className="hover:text-amber-400 cursor-pointer">Citi FIPS 140-3 Manual</span>
          <span>•</span>
          <span className="hover:text-amber-400 cursor-pointer">MT Ledger Enclave #9910</span>
        </div>
      </footer>
    </div>
  );
};

export default ModernTreasuryUnmaskingPolicyEngine;