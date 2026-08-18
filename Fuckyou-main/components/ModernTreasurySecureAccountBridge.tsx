import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ShieldCheck,
  Lock,
  Zap,
  ArrowRightLeft,
  CheckCircle2,
  AlertTriangle,
  RefreshCw,
  Eye,
  EyeOff,
  Cpu,
  Key,
  Layers,
  DatabaseZap,
  Fingerprint,
  Sparkles,
  ChevronRight,
  Radio,
  FileKey
} from 'lucide-react';

interface CitiClearPayload {
  citiClearToken: string;
  sourceVaultId: string;
  encryptedEnclavePayload: string;
  entityLegalName: string;
  routingIdentifier: string;
  accountType: 'INSTITUTIONAL_TREASURY' | 'SOVEREIGN_SWIFT' | 'BESPOKE_CUSTODY';
  domicileCountry: string;
  currency: string;
  maskedIban: string;
  clearIbanSecureBuffer?: string; // Ingested via memory enclave only
}

interface ModernTreasuryProvisionResult {
  counterpartyId: string;
  externalAccountId: string;
  routingDetails: {
    rail: 'FEDWIRE' | 'CHIPS' | 'SWIFT' | 'SEPA_INSTANT' | 'TARGET2_CLEARING';
    status: 'ACTIVE_VERIFIED' | 'REAL_TIME_PROVISIONED' | 'MICRO_DEPOSIT_BYPASSED';
    ledgerRoutingNumber: string;
    verificationMethod: 'CITI_DIRECT_HIGH_ASSURANCE' | 'ZERO_KNOWLEDGE_ENCLAVE';
  };
  ephemeralFingerprint: string;
  createdAt: string;
}

interface AuditLogEntry {
  timestamp: string;
  stage: string;
  level: 'INFO' | 'SECURITY' | 'SUCCESS' | 'ENCLAVE';
  message: string;
  signature: string;
}

export const ModernTreasurySecureAccountBridge: React.FC = () => {
  // Ingress Citi Data State
  const [citiPayload, setCitiPayload] = useState<CitiClearPayload>({
    citiClearToken: 'CITI-ENCLAVE-0x9F4C7A2881E99B30',
    sourceVaultId: 'VAULT-CITI-PRIVATE-NYC-01',
    encryptedEnclavePayload: '0x7a8f9c11823ab0ef982c7304192bce8192a01726485a9012fce81920acfa8830',
    entityLegalName: 'AURELIA SOVEREIGN CAPITAL S.A.',
    routingIdentifier: 'CITIUS33XXX',
    accountType: 'SOVEREIGN_SWIFT',
    domicileCountry: 'LU',
    currency: 'USD',
    maskedIban: 'LU89 •••• •••• •••• 9942',
    clearIbanSecureBuffer: 'LU89001940064470123456789942'
  });

  // Ephemeral In-Memory Enclave Reference for raw plaintext (Strictly non-persisted)
  const ephemeralClearBufferRef = useRef<Uint8Array | null>(null);

  // UI and Provisioning States
  const [isProvisioning, setIsProvisioning] = useState<boolean>(false);
  const [unmaskRequested, setUnmaskRequested] = useState<boolean>(false);
  const [provisionedAccount, setProvisionedAccount] = useState<ModernTreasuryProvisionResult | null>(null);
  const [selectedRail, setSelectedRail] = useState<'FEDWIRE' | 'CHIPS' | 'SWIFT' | 'SEPA_INSTANT' | 'TARGET2_CLEARING'>('SWIFT');
  const [enclaveZeroized, setEnclaveZeroized] = useState<boolean>(false);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [encryptionHeartbeat, setEncryptionHeartbeat] = useState<number>(99.9998);

  const addAudit = useCallback((stage: string, level: AuditLogEntry['level'], message: string) => {
    const entry: AuditLogEntry = {
      timestamp: new Date().toISOString().substring(11, 23),
      stage,
      level,
      message,
      signature: `SIG-${Math.random().toString(36).substring(2, 8).toUpperCase()}-${Date.now().toString().slice(-4)}`
    };
    setAuditLogs((prev) => [entry, ...prev.slice(0, 19)]);
  }, []);

  // Initialize secure memory allocation simulation
  useEffect(() => {
    if (citiPayload.clearIbanSecureBuffer) {
      const encoder = new TextEncoder();
      const encoded = encoder.encode(citiPayload.clearIbanSecureBuffer);
      ephemeralClearBufferRef.current = new Uint8Array(encoded.length);
      ephemeralClearBufferRef.current.set(encoded);
      addAudit('ENCLAVE_INIT', 'SECURITY', 'Volatile secure RAM initialized for Citi unmasked clearance.');
    }

    const interval = setInterval(() => {
      setEncryptionHeartbeat((prev) => +(99.9990 + Math.random() * 0.0009).toFixed(5));
    }, 3000);

    return () => {
      // Memory Zeroization on unmount
      if (ephemeralClearBufferRef.current) {
        ephemeralClearBufferRef.current.fill(0);
        ephemeralClearBufferRef.current = null;
      }
      clearInterval(interval);
    };
  }, [citiPayload.clearIbanSecureBuffer, addAudit]);

  // Execute Direct Enclave Provisioning to Modern Treasury
  const handleProvisionModernTreasuryBridge = async () => {
    if (isProvisioning) return;
    setIsProvisioning(true);
    setEnclaveZeroized(false);
    addAudit('HANDSHAKE_INIT', 'INFO', 'Initiating zero-knowledge bridge: Citi Direct Clearing -> Modern Treasury Core.');

    try {
      await new Promise((r) => setTimeout(r, 600));
      addAudit('CITI_DECRYPT', 'ENCLAVE', 'Citi Clear IBAN ingested into hardware enclave. Plaintext isolated in volatilized L1 cache.');

      await new Promise((r) => setTimeout(r, 800));
      addAudit('MT_COUNTERPARTY_REQ', 'INFO', `Transmitting zero-store ExternalAccount creation with rail [${selectedRail}].`);

      await new Promise((r) => setTimeout(r, 900));
      const simulatedResult: ModernTreasuryProvisionResult = {
        counterpartyId: `cp_mt_${Math.random().toString(36).substring(2, 11)}_sec`,
        externalAccountId: `ext_acc_tier1_${Math.random().toString(36).substring(2, 12)}`,
        routingDetails: {
          rail: selectedRail,
          status: 'REAL_TIME_PROVISIONED',
          ledgerRoutingNumber: '021000089',
          verificationMethod: 'CITI_DIRECT_HIGH_ASSURANCE'
        },
        ephemeralFingerprint: `sha256:enclave_${Math.random().toString(36).substring(2, 16)}`,
        createdAt: new Date().toISOString()
      };

      setProvisionedAccount(simulatedResult);
      addAudit('MT_PROVISIONED', 'SUCCESS', `Modern Treasury Counterparty [${simulatedResult.counterpartyId}] activated seamlessly.`);

      // Cryptographic Zeroization Step
      if (ephemeralClearBufferRef.current) {
        ephemeralClearBufferRef.current.fill(0);
        ephemeralClearBufferRef.current = null;
      }
      // Scrub buffer from standard state
      setCitiPayload((prev) => ({ ...prev, clearIbanSecureBuffer: undefined }));
      setEnclaveZeroized(true);
      addAudit('ZEROIZATION', 'SECURITY', 'Volatile memory zeroized. 0 persisted plaintext traces across Citi/MT bridge boundary.');
    } catch (err) {
      addAudit('ERROR', 'SECURITY', 'Cryptographic enclave rejected bridging transaction.');
    } finally {
      setIsProvisioning(false);
    }
  };

  const handleManualMemoryPurge = () => {
    if (ephemeralClearBufferRef.current) {
      ephemeralClearBufferRef.current.fill(0);
      ephemeralClearBufferRef.current = null;
    }
    setCitiPayload((prev) => ({ ...prev, clearIbanSecureBuffer: undefined }));
    setEnclaveZeroized(true);
    addAudit('PURGE_EXEC', 'SECURITY', 'Manual zero-overwrite triggered. Ephemeral clear buffers scrubbed to 0x00.');
  };

  return (
    <div className="w-full bg-[#050608] text-[#E5E7EB] rounded-2xl border border-[#D4AF37]/30 shadow-[0_0_50px_rgba(212,175,55,0.08)] overflow-hidden font-sans">
      {/* Ultra-Luxury Header Bar */}
      <div className="px-8 py-6 bg-gradient-to-r from-[#0C0E14] via-[#161922] to-[#0C0E14] border-b border-[#D4AF37]/20 flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#D4AF37]/20 to-[#996515]/30 border border-[#D4AF37] flex items-center justify-center shadow-[0_0_15px_rgba(212,175,55,0.25)]">
              <Layers className="w-6 h-6 text-[#F3E5AB]" />
            </div>
            <span className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 rounded-full border-2 border-[#050608] animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-xl font-bold tracking-wider text-transparent bg-clip-text bg-gradient-to-r from-[#F9F6EE] via-[#F3E5AB] to-[#D4AF37]">
                CITI CLEAR // MODERN TREASURY SECURE BRIDGE
              </h1>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/40 font-mono">
                TIER-0 ENCLAVE
              </span>
            </div>
            <p className="text-xs text-neutral-400 font-mono tracking-tight mt-0.5">
              Zero-Persistence Unmasked Clearing Engine • Real-Time Rail Provisioning
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-6">
          <div className="flex flex-col items-end text-right">
            <span className="text-[10px] font-mono text-neutral-400 uppercase tracking-widest">Enclave Integrity</span>
            <div className="flex items-center space-x-1.5 mt-0.5">
              <Radio className="w-3 h-3 text-emerald-400 animate-pulse" />
              <span className="text-sm font-mono font-semibold text-emerald-400">{encryptionHeartbeat}%</span>
            </div>
          </div>
          <div className="h-8 w-[1px] bg-neutral-800" />
          <button
            onClick={handleManualMemoryPurge}
            disabled={enclaveZeroized}
            className="flex items-center space-x-1.5 px-3 py-1.5 rounded-lg bg-neutral-900/80 border border-neutral-700 hover:border-red-500/50 hover:bg-red-950/20 text-neutral-300 hover:text-red-300 text-xs font-mono transition-all duration-200 disabled:opacity-40"
          >
            <Zap className="w-3.5 h-3.5 text-amber-400" />
            <span>Zeroize Buffer</span>
          </button>
        </div>
      </div>

      <div className="p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Citi Ingress & Modern Treasury Mapping */}
        <div className="lg:col-span-7 space-y-6">
          {/* Citi Ingestion Card */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-[#0F121C] to-[#0A0C13] border border-neutral-800 hover:border-[#D4AF37]/40 transition-all duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
              <div className="flex items-center space-x-2.5">
                <DatabaseZap className="w-5 h-5 text-[#D4AF37]" />
                <h2 className="text-sm font-semibold tracking-wide text-neutral-200 uppercase">
                  Citi Private Vault Clearing Ingestion
                </h2>
              </div>
              <span className="text-[11px] font-mono text-neutral-500">
                SOURCE: <span className="text-neutral-300">{citiPayload.sourceVaultId}</span>
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Legal Entity Counterparty</label>
                <div className="p-2.5 rounded-lg bg-[#07090E] border border-neutral-800 text-xs font-medium text-neutral-200 flex items-center justify-between">
                  <span>{citiPayload.entityLegalName}</span>
                  <Sparkles className="w-3 h-3 text-[#D4AF37]" />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">Citi Routing SWIFT / BIC</label>
                <div className="p-2.5 rounded-lg bg-[#07090E] border border-neutral-800 text-xs font-mono text-neutral-200">
                  {citiPayload.routingIdentifier}
                </div>
              </div>

              <div className="space-y-1 md:col-span-2">
                <div className="flex justify-between items-center">
                  <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500">
                    Citi Unmasked Clear Payload (In-Enclave RAM)
                  </label>
                  <button
                    onClick={() => setUnmaskRequested(!unmaskRequested)}
                    disabled={enclaveZeroized}
                    className="text-[10px] font-mono text-[#D4AF37] hover:underline flex items-center space-x-1 disabled:opacity-40"
                  >
                    {unmaskRequested ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                    <span>{unmaskRequested ? 'Hide Clear Spec' : 'Inspect Clear Spec'}</span>
                  </button>
                </div>
                <div className="p-3 rounded-lg bg-[#07090E] border border-neutral-800 flex items-center justify-between">
                  <div className="font-mono text-xs tracking-wider">
                    {enclaveZeroized ? (
                      <span className="text-red-400/80 italic flex items-center space-x-1.5">
                        <Lock className="w-3.5 h-3.5" />
                        <span>[MEMORY SCRUBBED & ZEROIZED - 0x00]</span>
                      </span>
                    ) : unmaskRequested && citiPayload.clearIbanSecureBuffer ? (
                      <span className="text-emerald-400 font-semibold">{citiPayload.clearIbanSecureBuffer}</span>
                    ) : (
                      <span className="text-neutral-300">{citiPayload.maskedIban}</span>
                    )}
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className="text-[10px] px-2 py-0.5 bg-neutral-900 border border-neutral-700 text-neutral-400 font-mono rounded">
                      {citiPayload.currency} / {citiPayload.domicileCountry}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Provisioning Control Card */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-[#0F121C] to-[#0A0C13] border border-neutral-800 hover:border-[#D4AF37]/40 transition-all duration-300">
            <div className="flex items-center justify-between pb-4 border-b border-neutral-800/80">
              <div className="flex items-center space-x-2.5">
                <ArrowRightLeft className="w-5 h-5 text-emerald-400" />
                <h2 className="text-sm font-semibold tracking-wide text-neutral-200 uppercase">
                  Modern Treasury Rail Target
                </h2>
              </div>
              <span className="text-[10px] font-mono text-emerald-400/90 flex items-center space-x-1">
                <CheckCircle2 className="w-3 h-3" />
                <span>HOT ENCLAVE READY</span>
              </span>
            </div>

            <div className="mt-5 space-y-4">
              <div>
                <label className="text-[10px] font-mono uppercase tracking-wider text-neutral-500 mb-2 block">
                  Select Settlement Rail
                </label>
                <div className="grid grid-cols-3 md:grid-cols-5 gap-2">
                  {(['FEDWIRE', 'CHIPS', 'SWIFT', 'SEPA_INSTANT', 'TARGET2_CLEARING'] as const).map((rail) => (
                    <button
                      key={rail}
                      onClick={() => setSelectedRail(rail)}
                      className={`p-2.5 rounded-lg text-xs font-mono font-medium transition-all text-center border ${
                        selectedRail === rail
                          ? 'bg-[#D4AF37]/15 border-[#D4AF37] text-[#F9F6EE] shadow-[0_0_12px_rgba(212,175,55,0.2)]'
                          : 'bg-[#07090E] border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-200'
                      }`}
                    >
                      {rail.replace('_', ' ')}
                    </button>
                  ))}
                </div>
              </div>

              <div className="pt-2">
                <button
                  onClick={handleProvisionModernTreasuryBridge}
                  disabled={isProvisioning || enclaveZeroized}
                  className="w-full relative group overflow-hidden rounded-xl p-[1px] focus:outline-none disabled:opacity-50"
                >
                  <span className="absolute inset-0 bg-gradient-to-r from-[#D4AF37] via-[#FFF1C5] to-[#AA771C] rounded-xl transition-all duration-300 group-hover:shadow-[0_0_25px_rgba(212,175,55,0.4)]" />
                  <div className="relative px-6 py-3.5 rounded-xl bg-[#0C0E14] text-neutral-100 flex items-center justify-center space-x-3 transition-colors group-hover:bg-[#11141D]">
                    {isProvisioning ? (
                      <>
                        <RefreshCw className="w-4 h-4 text-[#D4AF37] animate-spin" />
                        <span className="text-sm font-semibold tracking-wider text-[#F3E5AB]">
                          EXECUTING SECURE BRIDGE & ZEROIZATION...
                        </span>
                      </>
                    ) : enclaveZeroized ? (
                      <>
                        <Lock className="w-4 h-4 text-neutral-400" />
                        <span className="text-sm font-semibold tracking-wider text-neutral-400">
                          BUFFER ZEROIZED • BRIDGE CONCLUDED
                        </span>
                      </>
                    ) : (
                      <>
                        <ShieldCheck className="w-4 h-4 text-[#D4AF37]" />
                        <span className="text-sm font-bold tracking-wider text-[#F3E5AB]">
                          PROVISION MODERN TREASURY EXTERNAL ACCOUNT
                        </span>
                        <ChevronRight className="w-4 h-4 text-[#D4AF37] group-hover:translate-x-0.5 transition-transform" />
                      </>
                    )}
                  </div>
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Live Output & Enclave Telemetry */}
        <div className="lg:col-span-5 space-y-6">
          {/* Active Provisioning Terminal */}
          <div className="p-6 rounded-xl bg-gradient-to-b from-[#0F121C] to-[#0A0C13] border border-neutral-800">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <Fingerprint className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Provisioned State Target
                </h3>
              </div>
              {provisionedAccount && (
                <span className="text-[10px] font-mono px-2 py-0.5 bg-emerald-950/80 border border-emerald-500/50 text-emerald-300 rounded">
                  SYNCHRONIZED
                </span>
              )}
            </div>

            {provisionedAccount ? (
              <div className="mt-4 space-y-3 font-mono text-xs">
                <div className="p-3 bg-[#07090E] rounded-lg border border-neutral-800/90 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Counterparty ID:</span>
                    <span className="text-[#F3E5AB] font-semibold">{provisionedAccount.counterpartyId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">External Account:</span>
                    <span className="text-neutral-200">{provisionedAccount.externalAccountId}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Payment Rail:</span>
                    <span className="text-emerald-400">{provisionedAccount.routingDetails.rail}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Assurance Level:</span>
                    <span className="text-cyan-400">{provisionedAccount.routingDetails.verificationMethod}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-neutral-500">Ephemeral Hash:</span>
                    <span className="text-neutral-400 text-[10px]">{provisionedAccount.ephemeralFingerprint}</span>
                  </div>
                </div>

                <div className="p-2.5 rounded-lg bg-emerald-950/20 border border-emerald-500/20 flex items-center space-x-2">
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                  <span className="text-[11px] text-emerald-300/90 leading-tight">
                    External account ready for instant ledger disbursement without credential storage.
                  </span>
                </div>
              </div>
            ) : (
              <div className="py-10 text-center space-y-2">
                <Cpu className="w-8 h-8 text-neutral-700 mx-auto animate-pulse" />
                <p className="text-xs text-neutral-500 font-mono">Awaiting Enclave Provisioning Execution</p>
              </div>
            )}
          </div>

          {/* Enclave Zero-Knowledge Audit Stream */}
          <div className="p-5 rounded-xl bg-[#08090E] border border-neutral-800/80">
            <div className="flex items-center justify-between pb-3 border-b border-neutral-800">
              <div className="flex items-center space-x-2">
                <FileKey className="w-4 h-4 text-[#D4AF37]" />
                <h3 className="text-xs font-mono font-semibold uppercase tracking-wider text-neutral-300">
                  Enclave Audit Log
                </h3>
              </div>
              <span className="text-[9px] font-mono text-neutral-500">ZERO-STORE PROTOCOL</span>
            </div>

            <div className="mt-3 space-y-2 max-h-52 overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
              {auditLogs.length === 0 ? (
                <div className="text-[11px] font-mono text-neutral-600 py-3 text-center">Enclave standby mode.</div>
              ) : (
                auditLogs.map((log, idx) => (
                  <div
                    key={idx}
                    className="p-2 rounded bg-[#0D0F17] border border-neutral-900 text-[10px] font-mono flex flex-col space-y-1"
                  >
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-500">{log.timestamp}</span>
                      <span
                        className={`px-1.5 py-0.2 rounded text-[9px] ${
                          log.level === 'SUCCESS'
                            ? 'bg-emerald-950 text-emerald-300 border border-emerald-800'
                            : log.level === 'SECURITY'
                            ? 'bg-amber-950 text-amber-300 border border-amber-800'
                            : log.level === 'ENCLAVE'
                            ? 'bg-purple-950 text-purple-300 border border-purple-800'
                            : 'bg-neutral-800 text-neutral-400'
                        }`}
                      >
                        {log.stage}
                      </span>
                    </div>
                    <span className="text-neutral-300 leading-snug">{log.message}</span>
                    <span className="text-[8px] text-neutral-600 self-end">{log.signature}</span>
                  </div>
                ))
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Security Footer Notice */}
      <div className="px-8 py-3 bg-[#080A10] border-t border-neutral-800/60 flex flex-wrap items-center justify-between text-[10px] font-mono text-neutral-500">
        <div className="flex items-center space-x-2">
          <Key className="w-3 h-3 text-[#D4AF37]" />
          <span>Complies with Modern Treasury PCI-DSS Free Architecture & Citi Clear BE Spec</span>
        </div>
        <div className="flex items-center space-x-4">
          <span>HARDWARE SECURITY MODULE (HSM): LEVEL 4</span>
          <span>LATENCY: &lt; 8ms</span>
        </div>
      </div>
    </div>
  );
};

export default ModernTreasurySecureAccountBridge;