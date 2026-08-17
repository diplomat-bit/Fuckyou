import React, { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  ShieldAlert,
  ShieldCheck,
  Cpu,
  KeyRound,
  Fingerprint,
  Activity,
  Globe,
  Radio,
  Lock,
  Unlock,
  AlertTriangle,
  FileCheck2,
  Terminal,
  Zap,
  RefreshCw,
  Eye,
  Sliders,
  CheckCircle2,
  XCircle,
  Database,
  Crosshair,
  Server,
  Layers,
  ChevronRight,
  HardDrive
} from 'lucide-react';

interface JWESealValidation {
  algorithm: 'ECDH-ES+A256KW' | 'RSA-OAEP-256' | 'KYBER-1024-PQ' | 'A256GCM';
  keyFingerprint: string;
  enclaveHardwareId: string;
  signatureVerified: boolean;
  tamperEntropyScore: number;
  jwsHeaderValidation: 'PASSED' | 'REVOKED' | 'INVALID_MAC';
}

interface ClientTelemetry {
  ipAddress: string;
  asnOrg: string;
  geoCoords: [number, number];
  locationName: string;
  deviceEnclaveType: 'Apple Secure Enclave' | 'Titan M2 HSM' | 'AWS Nitro Enclave' | 'YubiHSM2 Auth';
  biometricAttestationLevel: 'L3_QUANTUM_BIOMETRIC' | 'L2_FIDO2_WEBAUTHN' | 'L1_FALLBACK_PIN';
  velocityPerMinute: number;
}

interface DecryptionAuditPacket {
  id: string;
  timestamp: string;
  targetLedger: 'Citi Private Bank Sovereign Ledger' | 'Modern Treasury Real-Time Wire Rails' | 'Federal Reserve FedNow Core' | 'Euroclear Tier-1 Custody';
  resourceType: 'Ultra-High-Net-Worth PII' | 'SWIFT MT103 Full Payload' | 'Account Number Token Matrix' | 'Treasury Vault Salt Seed';
  recordsRequested: number;
  client: ClientTelemetry;
  cryptoSeal: JWESealValidation;
  threatLevel: 'NOMINAL' | 'ELEVATED' | 'CRITICAL_INTERCEPT' | 'TAMPER_EVICTED';
  aiNeuralVerdict: {
    riskScore: number;
    anomalyIndicators: string[];
    actionTaken: 'ALLOW_TRANSPARENT' | 'REQUIRE_MULTI_SIG' | 'HSM_CIRCUIT_QUENCH' | 'DYNAMIC_WATERMARK_CHALLENGE';
    confidenceRate: number;
  };
}

const INITIAL_AUDIT_STREAM: DecryptionAuditPacket[] = [
  {
    id: 'AUDIT-DEC-99482-PQ',
    timestamp: new Date(Date.now() - 1400).toISOString(),
    targetLedger: 'Citi Private Bank Sovereign Ledger',
    resourceType: 'Ultra-High-Net-Worth PII',
    recordsRequested: 250,
    client: {
      ipAddress: '198.51.100.84',
      asnOrg: 'AS396982 CITI-GLOBAL-PRIVATE-NET',
      geoCoords: [40.7128, -74.006],
      locationName: 'New York, USA (Tribeca Enclave 01)',
      deviceEnclaveType: 'Apple Secure Enclave',
      biometricAttestationLevel: 'L3_QUANTUM_BIOMETRIC',
      velocityPerMinute: 14
    },
    cryptoSeal: {
      algorithm: 'KYBER-1024-PQ',
      keyFingerprint: 'SHA256:7e98a1f2b4c890de78fa10984ba176c49e',
      enclaveHardwareId: 'HSM-SEC-NODE-NY-09',
      signatureVerified: true,
      tamperEntropyScore: 0.002,
      jwsHeaderValidation: 'PASSED'
    },
    threatLevel: 'NOMINAL',
    aiNeuralVerdict: {
      riskScore: 4.2,
      anomalyIndicators: ['Known Executive BGP Node', 'Post-Quantum Handshake Verified'],
      actionTaken: 'ALLOW_TRANSPARENT',
      confidenceRate: 99.98
    }
  },
  {
    id: 'AUDIT-DEC-99483-XC',
    timestamp: new Date(Date.now() - 4200).toISOString(),
    targetLedger: 'Modern Treasury Real-Time Wire Rails',
    resourceType: 'SWIFT MT103 Full Payload',
    recordsRequested: 14200,
    client: {
      ipAddress: '203.0.113.195',
      asnOrg: 'AS13335 CLOUDFLARENET-ANON-RELAY',
      geoCoords: [1.3521, 103.8198],
      locationName: 'Singapore (Proxy Relay Mesh)',
      deviceEnclaveType: 'Titan M2 HSM',
      biometricAttestationLevel: 'L1_FALLBACK_PIN',
      velocityPerMinute: 884
    },
    cryptoSeal: {
      algorithm: 'ECDH-ES+A256KW',
      keyFingerprint: 'SHA256:4b91aa1283c749910d8ef732890041bc',
      enclaveHardwareId: 'UNKNOWN-VIRTUALIZED-INSTANCE',
      signatureVerified: false,
      tamperEntropyScore: 0.891,
      jwsHeaderValidation: 'REVOKED'
    },
    threatLevel: 'CRITICAL_INTERCEPT',
    aiNeuralVerdict: {
      riskScore: 98.7,
      anomalyIndicators: [
        'Unmasking Velocity Exceeded (884 req/min > 120 threshold)',
        'JWS Key Revoked at Central Key Distribution Center',
        'Device Hardware Attestation Mismatch'
      ],
      actionTaken: 'HSM_CIRCUIT_QUENCH',
      confidenceRate: 99.99
    }
  },
  {
    id: 'AUDIT-DEC-99484-FL',
    timestamp: new Date(Date.now() - 8900).toISOString(),
    targetLedger: 'Federal Reserve FedNow Core',
    resourceType: 'Account Number Token Matrix',
    recordsRequested: 1800,
    client: {
      ipAddress: '157.240.241.35',
      asnOrg: 'AS16509 AMAZON-02-DEDICATED',
      geoCoords: [51.5074, -0.1278],
      locationName: 'London, UK (Mayfair Terminal 04)',
      deviceEnclaveType: 'AWS Nitro Enclave',
      biometricAttestationLevel: 'L2_FIDO2_WEBAUTHN',
      velocityPerMinute: 62
    },
    cryptoSeal: {
      algorithm: 'RSA-OAEP-256',
      keyFingerprint: 'SHA256:99f84ba32014cc9204128ba7f098aa33',
      enclaveHardwareId: 'HSM-LDN-NITRO-441',
      signatureVerified: true,
      tamperEntropyScore: 0.142,
      jwsHeaderValidation: 'PASSED'
    },
    threatLevel: 'ELEVATED',
    aiNeuralVerdict: {
      riskScore: 42.6,
      anomalyIndicators: ['Cross-Border Vault Decryption', 'High Burst Rate on FedNow Matrix'],
      actionTaken: 'REQUIRE_MULTI_SIG',
      confidenceRate: 97.4
    }
  }
];

export const QuantumDecryptionAuditor: React.FC = () => {
  const [auditPackets, setAuditPackets] = useState<DecryptionAuditPacket[]>(INITIAL_AUDIT_STREAM);
  const [selectedPacket, setSelectedPacket] = useState<DecryptionAuditPacket>(INITIAL_AUDIT_STREAM[0]);
  const [isSimulatingLiveStream, setIsSimulatingLiveStream] = useState<boolean>(true);
  const [enforceStrictJWE, setEnforceStrictJWE] = useState<boolean>(true);
  const [unmaskVelocityCeiling, setUnmaskVelocityCeiling] = useState<number>(150);
  const [quenchedKeysCount, setQuenchedKeysCount] = useState<number>(14);
  const [terminalLog, setTerminalLog] = useState<string[]>([
    '[INIT] Quantum Decryption Engine initialized on Citi-Modern-Treasury cryptographic backbone.',
    '[HSM] Dilithium-3 & Kyber-1024 Hardware Enclave active.',
    '[MONITOR] Unmasking telemetry listener binding on Port 8443 (mTLS v1.3 strict).'
  ]);

  const pushTerminalLog = useCallback((msg: string) => {
    setTerminalLog(prev => [`[${new Date().toLocaleTimeString()}] ${msg}`, ...prev.slice(0, 18)]);
  }, []);

  // Generate real-time synthetic cryptographic inspection events
  useEffect(() => {
    if (!isSimulatingLiveStream) return;

    const interval = setInterval(() => {
      const isAnomaly = Math.random() > 0.65;
      const targetLedgers: DecryptionAuditPacket['targetLedger'][] = [
        'Citi Private Bank Sovereign Ledger',
        'Modern Treasury Real-Time Wire Rails',
        'Federal Reserve FedNow Core',
        'Euroclear Tier-1 Custody'
      ];
      const resources: DecryptionAuditPacket['resourceType'][] = [
        'Ultra-High-Net-Worth PII',
        'SWIFT MT103 Full Payload',
        'Account Number Token Matrix',
        'Treasury Vault Salt Seed'
      ];

      const newVelocity = isAnomaly ? Math.floor(Math.random() * 800 + 160) : Math.floor(Math.random() * 45 + 5);
      const entropy = isAnomaly ? Number((Math.random() * 0.5 + 0.5).toFixed(4)) : Number((Math.random() * 0.05).toFixed(4));
      const riskScore = isAnomaly ? Number((Math.random() * 30 + 70).toFixed(1)) : Number((Math.random() * 15).toFixed(1));

      const newPacket: DecryptionAuditPacket = {
        id: `AUDIT-DEC-${Math.floor(Math.random() * 90000 + 10000)}-${isAnomaly ? 'SEC_WARN' : 'VERIFIED'}`,
        timestamp: new Date().toISOString(),
        targetLedger: targetLedgers[Math.floor(Math.random() * targetLedgers.length)],
        resourceType: resources[Math.floor(Math.random() * resources.length)],
        recordsRequested: isAnomaly ? Math.floor(Math.random() * 20000 + 5000) : Math.floor(Math.random() * 400 + 10),
        client: {
          ipAddress: `${Math.floor(Math.random() * 200 + 20)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}.${Math.floor(Math.random() * 255)}`,
          asnOrg: isAnomaly ? 'AS9009 PROXY-HOSTING-NETWORK' : 'AS396982 CITI-SWIFT-CORE',
          geoCoords: [
            Number((Math.random() * 140 - 70).toFixed(4)),
            Number((Math.random() * 360 - 180).toFixed(4))
          ],
          locationName: isAnomaly ? 'Zurich, Switzerland (Untrusted Dark ASN)' : 'Geneva, Switzerland (Citi Vault Alpha)',
          deviceEnclaveType: isAnomaly ? 'Titan M2 HSM' : 'Apple Secure Enclave',
          biometricAttestationLevel: isAnomaly ? 'L1_FALLBACK_PIN' : 'L3_QUANTUM_BIOMETRIC',
          velocityPerMinute: newVelocity
        },
        cryptoSeal: {
          algorithm: isAnomaly ? 'A256GCM' : 'KYBER-1024-PQ',
          keyFingerprint: `SHA256:${Math.random().toString(16).substring(2, 10)}${Math.random().toString(16).substring(2, 10)}`,
          enclaveHardwareId: isAnomaly ? 'REVOKED-NITRO-INSTANCE-09' : 'CITI-HSM-VAULT-PRIMARY-01',
          signatureVerified: !isAnomaly,
          tamperEntropyScore: entropy,
          jwsHeaderValidation: isAnomaly ? 'INVALID_MAC' : 'PASSED'
        },
        threatLevel: isAnomaly ? (newVelocity > 400 ? 'CRITICAL_INTERCEPT' : 'ELEVATED') : 'NOMINAL',
        aiNeuralVerdict: {
          riskScore,
          anomalyIndicators: isAnomaly
            ? ['Sudden Unmasking Spike', 'JWE Tamper Entropy Drift', 'Asymmetric Device Handshake Failure']
            : ['Continuous Attestation Satisfied', 'Deterministic Token Mapping'],
          actionTaken: isAnomaly
            ? (newVelocity > 400 ? 'HSM_CIRCUIT_QUENCH' : 'REQUIRE_MULTI_SIG')
            : 'ALLOW_TRANSPARENT',
          confidenceRate: Number((Math.random() * 2 + 98).toFixed(2))
        }
      };

      setAuditPackets(prev => [newPacket, ...prev.slice(0, 24)]);
      if (isAnomaly) {
        pushTerminalLog(`[THREAT DETECTED] Packet ${newPacket.id} intercepted. Risk Score: ${riskScore} | Action: ${newPacket.aiNeuralVerdict.actionTaken}`);
        if (newPacket.aiNeuralVerdict.actionTaken === 'HSM_CIRCUIT_QUENCH') {
          setQuenchedKeysCount(c => c + 1);
        }
      }
    }, 4500);

    return () => clearInterval(interval);
  }, [isSimulatingLiveStream, pushTerminalLog]);

  const totalDecryptedRecords = useMemo(() => {
    return auditPackets.reduce((acc, p) => acc + p.recordsRequested, 4829100);
  }, [auditPackets]);

  const activeThreatsCount = useMemo(() => {
    return auditPackets.filter(p => p.threatLevel === 'CRITICAL_INTERCEPT' || p.threatLevel === 'ELEVATED').length;
  }, [auditPackets]);

  const avgQuantumRisk = useMemo(() => {
    if (!auditPackets.length) return 0;
    const sum = auditPackets.reduce((acc, p) => acc + p.aiNeuralVerdict.riskScore, 0);
    return Number((sum / auditPackets.length).toFixed(1));
  }, [auditPackets]);

  const handleInstantQuench = () => {
    setQuenchedKeysCount(c => c + 1);
    pushTerminalLog(`[MANUAL OVERRIDE] Operator invoked emergency HSM Circuit Quench on active cipher pipeline.`);
    setAuditPackets(prev =>
      prev.map(p =>
        p.id === selectedPacket.id
          ? {
              ...p,
              threatLevel: 'TAMPER_EVICTED',
              aiNeuralVerdict: {
                ...p.aiNeuralVerdict,
                actionTaken: 'HSM_CIRCUIT_QUENCH',
                riskScore: 100
              }
            }
          : p
      )
    );
  };

  return (
    <div className="w-full min-h-screen bg-[#02050A] text-slate-100 p-4 md:p-8 font-sans selection:bg-amber-500/30 selection:text-amber-200">
      {/* Top Header / Sovereign Shield Banner */}
      <header className="border-b border-amber-500/20 pb-6 mb-8 flex flex-col xl:flex-row xl:items-center justify-between gap-6 relative overflow-hidden">
        <div className="absolute -top-24 -left-24 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -top-24 right-1/4 w-80 h-80 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none" />

        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-widest bg-amber-500/10 border border-amber-500/30 text-amber-400 uppercase font-semibold flex items-center gap-1.5 shadow-[0_0_12px_rgba(245,158,11,0.15)]">
              <ShieldAlert className="w-3.5 h-3.5 animate-pulse text-amber-400" />
              CITI ULTRA-SOVEREIGN // MODERN TREASURY HSMS
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[11px] font-mono tracking-widest bg-cyan-500/10 border border-cyan-500/30 text-cyan-400 uppercase font-semibold">
              POST-QUANTUM KYBER-1024 ACTIVE
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold tracking-tight text-white font-serif flex items-center gap-3">
            Quantum Decryption Auditor <span className="text-amber-400 font-sans font-light text-xl">| Enclave Compliance Radar</span>
          </h1>
          <p className="text-slate-400 text-sm mt-1 max-w-3xl">
            Autonomous multi-layer AI compliance inspecting batch unmasking velocity anomalies, JWS/JWE cryptographic seal integrity, zero-trust hardware device signatures, and sovereign ledger data unmask authorizations.
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <button
            onClick={() => setIsSimulatingLiveStream(!isSimulatingLiveStream)}
            className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider font-semibold flex items-center gap-2 border transition-all duration-300 ${
              isSimulatingLiveStream
                ? 'bg-emerald-950/40 border-emerald-500/50 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.2)]'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Radio className={`w-3.5 h-3.5 ${isSimulatingLiveStream ? 'animate-ping text-emerald-400' : ''}`} />
            {isSimulatingLiveStream ? 'RADAR TELEMETRY LIVE' : 'FEED PAUSED'}
          </button>

          <button
            onClick={() => setEnforceStrictJWE(!enforceStrictJWE)}
            className={`px-4 py-2 rounded-lg text-xs font-mono tracking-wider font-semibold flex items-center gap-2 border transition-all duration-300 ${
              enforceStrictJWE
                ? 'bg-cyan-950/40 border-cyan-500/50 text-cyan-300 shadow-[0_0_15px_rgba(6,182,212,0.2)]'
                : 'bg-slate-900 border-slate-700 text-slate-400'
            }`}
          >
            <Lock className="w-3.5 h-3.5" />
            {enforceStrictJWE ? 'STRICT JWE/JWS ENFORCED' : 'RELAXED CIPHER MODE'}
          </button>

          <button
            onClick={handleInstantQuench}
            className="px-4 py-2 rounded-lg text-xs font-mono tracking-wider font-bold uppercase bg-rose-600/20 hover:bg-rose-600/30 border border-rose-500/50 text-rose-300 shadow-[0_0_20px_rgba(244,63,94,0.25)] flex items-center gap-2 transition-all"
          >
            <Zap className="w-3.5 h-3.5 text-rose-400 animate-bounce" />
            EMERGENCY HSM QUENCH
          </button>
        </div>
      </header>

      {/* Sovereign Key Metrics Grid */}
      <section className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        <div className="bg-[#050B14] border border-amber-500/20 rounded-xl p-5 relative overflow-hidden shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Total Unmasked Records</p>
              <h3 className="text-2xl font-bold font-mono text-white mt-1">
                {totalDecryptedRecords.toLocaleString()}
              </h3>
              <p className="text-[11px] text-amber-400/80 mt-1 flex items-center gap-1 font-mono">
                <ShieldCheck className="w-3 h-3 text-amber-400" />
                Ledger Vault Cryptographic Verified
              </p>
            </div>
            <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Database className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-gradient-to-r from-amber-500 to-yellow-300 h-full w-4/5 animate-pulse" />
          </div>
        </div>

        <div className="bg-[#050B14] border border-cyan-500/20 rounded-xl p-5 relative overflow-hidden shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-400">AI Risk Index</p>
              <h3 className="text-2xl font-bold font-mono text-cyan-300 mt-1">{avgQuantumRisk} / 100</h3>
              <p className="text-[11px] text-cyan-400/80 mt-1 flex items-center gap-1 font-mono">
                <Cpu className="w-3 h-3" />
                Neural Real-Time Heuristics
              </p>
            </div>
            <div className="p-3 bg-cyan-500/10 border border-cyan-500/20 rounded-lg text-cyan-400">
              <Activity className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className={`h-full transition-all duration-500 ${
                avgQuantumRisk > 50
                  ? 'bg-rose-500'
                  : avgQuantumRisk > 25
                  ? 'bg-amber-400'
                  : 'bg-emerald-400'
              }`}
              style={{ width: `${avgQuantumRisk}%` }}
            />
          </div>
        </div>

        <div className="bg-[#050B14] border border-rose-500/20 rounded-xl p-5 relative overflow-hidden shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-400">Active Interceptions</p>
              <h3 className="text-2xl font-bold font-mono text-rose-400 mt-1">{activeThreatsCount} Threats</h3>
              <p className="text-[11px] text-rose-400/80 mt-1 flex items-center gap-1 font-mono">
                <AlertTriangle className="w-3 h-3" />
                Velocity / Seal Tamper Warnings
              </p>
            </div>
            <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-lg text-rose-400">
              <Crosshair className="w-5 h-5 animate-pulse" />
            </div>
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full mt-4 overflow-hidden">
            <div
              className="bg-rose-500 h-full"
              style={{ width: `${(activeThreatsCount / (auditPackets.length || 1)) * 100}%` }}
            />
          </div>
        </div>

        <div className="bg-[#050B14] border border-indigo-500/20 rounded-xl p-5 relative overflow-hidden shadow-lg backdrop-blur-md">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-xs uppercase font-mono tracking-wider text-slate-400">HSM Quenched Keys</p>
              <h3 className="text-2xl font-bold font-mono text-indigo-300 mt-1">{quenchedKeysCount} Isolated</h3>
              <p className="text-[11px] text-indigo-400/80 mt-1 flex items-center gap-1 font-mono">
                <KeyRound className="w-3 h-3" />
                Hardware Zero-Trust Isolation
              </p>
            </div>
            <div className="p-3 bg-indigo-500/10 border border-indigo-500/20 rounded-lg text-indigo-400">
              <Server className="w-5 h-5" />
            </div>
          </div>
          <div className="w-full bg-slate-800/60 h-1.5 rounded-full mt-4 overflow-hidden">
            <div className="bg-indigo-500 h-full w-full opacity-60" />
          </div>
        </div>
      </section>

      {/* Main Cryptographic Audit Workspace */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Column: Live Unmasking Batch Audit Stream */}
        <div className="lg:col-span-7 space-y-6">
          <div className="bg-[#050B14] border border-slate-800 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800/80">
              <div className="flex items-center gap-2">
                <Layers className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold uppercase tracking-wider text-white font-mono">
                  Decrypt & Batch Unmask Authorization Radar
                </h2>
              </div>
              <span className="text-xs font-mono text-slate-400">
                Displaying last {auditPackets.length} stream events
              </span>
            </div>

            <div className="mt-4 space-y-3 max-h-[580px] overflow-y-auto pr-1">
              <AnimatePresence>
                {auditPackets.map(packet => {
                  const isSelected = selectedPacket?.id === packet.id;
                  const isCritical = packet.threatLevel === 'CRITICAL_INTERCEPT' || packet.threatLevel === 'TAMPER_EVICTED';
                  const isElevated = packet.threatLevel === 'ELEVATED';

                  return (
                    <motion.div
                      key={packet.id}
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      onClick={() => setSelectedPacket(packet)}
                      className={`p-4 rounded-lg border transition-all cursor-pointer relative overflow-hidden ${
                        isSelected
                          ? 'border-amber-400 bg-amber-950/20 shadow-[0_0_20px_rgba(245,158,11,0.15)]'
                          : isCritical
                          ? 'border-rose-500/40 bg-rose-950/10 hover:border-rose-400'
                          : isElevated
                          ? 'border-yellow-500/40 bg-yellow-950/10 hover:border-yellow-400'
                          : 'border-slate-800/80 bg-[#08101C]/60 hover:border-slate-700'
                      }`}
                    >
                      {isSelected && (
                        <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400" />
                      )}

                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <span
                            className={`w-2 h-2 rounded-full ${
                              isCritical
                                ? 'bg-rose-500 animate-ping'
                                : isElevated
                                ? 'bg-amber-400'
                                : 'bg-emerald-400'
                            }`}
                          />
                          <span className="font-mono text-xs font-bold text-white tracking-wide">
                            {packet.id}
                          </span>
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800/80 text-slate-300 border border-slate-700">
                            {packet.targetLedger}
                          </span>
                        </div>

                        <div className="flex items-center gap-2">
                          <span
                            className={`text-[10px] font-mono font-semibold px-2 py-0.5 rounded border uppercase ${
                              isCritical
                                ? 'bg-rose-500/20 border-rose-500/40 text-rose-300'
                                : isElevated
                                ? 'bg-amber-500/20 border-amber-500/40 text-amber-300'
                                : 'bg-emerald-500/20 border-emerald-500/40 text-emerald-300'
                            }`}
                          >
                            {packet.threatLevel.replace('_', ' ')}
                          </span>
                          <span className="text-xs font-mono text-slate-400">
                            {packet.recordsRequested.toLocaleString()} recs
                          </span>
                        </div>
                      </div>

                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-3 text-[11px] font-mono text-slate-400 pt-2 border-t border-slate-800/50">
                        <div>
                          <span className="text-slate-500 block">Payload:</span>
                          <span className="text-slate-200 truncate block">{packet.resourceType}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Cipher Seal:</span>
                          <span className="text-slate-200">{packet.cryptoSeal.algorithm}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Origin ASN:</span>
                          <span className="text-slate-200 truncate block">{packet.client.locationName.split('(')[0]}</span>
                        </div>
                        <div>
                          <span className="text-slate-500 block">Neural Risk:</span>
                          <span
                            className={`font-bold ${
                              packet.aiNeuralVerdict.riskScore > 50 ? 'text-rose-400' : 'text-emerald-400'
                            }`}
                          >
                            {packet.aiNeuralVerdict.riskScore}%
                          </span>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          </div>

          {/* Velocity Ceiling & Anomaly Policy Tuning Panel */}
          <div className="bg-[#050B14] border border-slate-800 rounded-xl p-5">
            <div className="flex items-center gap-2 mb-4">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-mono">
                Decryption Velocity & Enclave Policy Radar Controls
              </h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">Unmasking Velocity Ceiling:</span>
                  <span className="text-amber-400 font-bold">{unmaskVelocityCeiling} req/min</span>
                </div>
                <input
                  type="range"
                  min="50"
                  max="1000"
                  step="25"
                  value={unmaskVelocityCeiling}
                  onChange={e => setUnmaskVelocityCeiling(Number(e.target.value))}
                  className="w-full accent-amber-400 bg-slate-800 h-1.5 rounded-lg cursor-pointer"
                />
                <p className="text-[10px] text-slate-500 font-mono">
                  Threshold for auto-triggering HSM cryptographic pipeline quench upon mass ledger export.
                </p>
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-xs font-mono">
                  <span className="text-slate-400">JWS Header Tamper Tolerance:</span>
                  <span className="text-emerald-400 font-bold">ZERO (0.000% DRIFT)</span>
                </div>
                <div className="h-1.5 bg-slate-800 rounded-lg overflow-hidden flex">
                  <div className="bg-emerald-500 h-full w-full" />
                </div>
                <p className="text-[10px] text-slate-500 font-mono">
                  Post-quantum signatures require zero-divergence Kyber-1024 polynomial root verification.
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deep Cryptographic Inspection Sentinel */}
        <div className="lg:col-span-5 space-y-6">
          <div className="bg-[#050B14] border border-amber-500/30 rounded-xl p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <KeyRound className="w-4 h-4 text-amber-400" />
                <h3 className="text-sm font-semibold uppercase tracking-wider text-white font-mono">
                  Cryptographic Seal & Device Attestation
                </h3>
              </div>
              <span className="text-[10px] font-mono text-amber-400/80 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/20">
                JOSE / JWE COMPLIANT
              </span>
            </div>

            {selectedPacket ? (
              <div className="mt-4 space-y-4">
                {/* AI Neural Risk Score Card */}
                <div className="p-3.5 rounded-lg bg-gradient-to-br from-slate-900 to-[#0B1528] border border-slate-800">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-mono text-slate-400">AI Risk Assessment</span>
                    <span
                      className={`text-xs font-mono font-bold px-2 py-0.5 rounded ${
                        selectedPacket.aiNeuralVerdict.riskScore > 50
                          ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {selectedPacket.aiNeuralVerdict.riskScore > 50 ? 'HIGH RISK DETECTED' : 'CRYPTOGRAPHICALLY SOUND'}
                    </span>
                  </div>

                  <div className="flex items-baseline gap-2">
                    <span className="text-3xl font-extrabold font-mono text-white">
                      {selectedPacket.aiNeuralVerdict.riskScore}
                    </span>
                    <span className="text-xs font-mono text-slate-500">/ 100 Risk Index</span>
                  </div>

                  <div className="mt-3 space-y-1">
                    <span className="text-[11px] font-mono text-slate-400 block font-semibold">Heuristic Anomalies:</span>
                    {selectedPacket.aiNeuralVerdict.anomalyIndicators.map((indicator, idx) => (
                      <div key={idx} className="flex items-center gap-2 text-xs font-mono text-slate-300">
                        <ChevronRight className="w-3 h-3 text-amber-400 flex-shrink-0" />
                        <span>{indicator}</span>
                      </div>
                    ))}
                  </div>

                  <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-400">Recommended Action:</span>
                    <span className="text-amber-400 font-bold">{selectedPacket.aiNeuralVerdict.actionTaken}</span>
                  </div>
                </div>

                {/* Cryptographic Seal Breakdown */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                    JWS/JWE Enclave Seal Parameters
                  </span>

                  <div className="p-3 bg-[#08101C] rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex justify-between">
                      <span className="text-slate-500">Seal Algorithm:</span>
                      <span className="text-cyan-300 font-semibold">{selectedPacket.cryptoSeal.algorithm}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Enclave Hardware:</span>
                      <span className="text-slate-200">{selectedPacket.cryptoSeal.enclaveHardwareId}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Key Fingerprint:</span>
                      <span className="text-slate-400 truncate max-w-[200px]" title={selectedPacket.cryptoSeal.keyFingerprint}>
                        {selectedPacket.cryptoSeal.keyFingerprint}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-slate-500">JWS Header Integrity:</span>
                      <span
                        className={`flex items-center gap-1 font-bold ${
                          selectedPacket.cryptoSeal.jwsHeaderValidation === 'PASSED'
                            ? 'text-emerald-400'
                            : 'text-rose-400'
                        }`}
                      >
                        {selectedPacket.cryptoSeal.jwsHeaderValidation === 'PASSED' ? (
                          <CheckCircle2 className="w-3.5 h-3.5" />
                        ) : (
                          <XCircle className="w-3.5 h-3.5" />
                        )}
                        {selectedPacket.cryptoSeal.jwsHeaderValidation}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Tamper Entropy Score:</span>
                      <span
                        className={`font-mono font-bold ${
                          selectedPacket.cryptoSeal.tamperEntropyScore > 0.3 ? 'text-rose-400' : 'text-emerald-400'
                        }`}
                      >
                        {selectedPacket.cryptoSeal.tamperEntropyScore}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Client Device & Geolocation Telemetry */}
                <div className="space-y-2">
                  <span className="text-xs font-mono uppercase text-slate-400 font-semibold block">
                    ClientDetails Signature & Geo Origin
                  </span>

                  <div className="p-3 bg-[#08101C] rounded-lg border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-500 flex items-center gap-1.5">
                        <Globe className="w-3.5 h-3.5 text-slate-400" />
                        Origin Coordinates:
                      </span>
                      <span className="text-slate-200">
                        {selectedPacket.client.geoCoords[0].toFixed(2)}°, {selectedPacket.client.geoCoords[1].toFixed(2)}°
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Facility / Node:</span>
                      <span className="text-slate-200 truncate max-w-[200px]" title={selectedPacket.client.locationName}>
                        {selectedPacket.client.locationName}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Device Hardware Root:</span>
                      <span className="text-cyan-300 font-semibold">{selectedPacket.client.deviceEnclaveType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-slate-500">Biometric Seed:</span>
                      <span className="text-amber-300">{selectedPacket.client.biometricAttestationLevel}</span>
                    </div>
                    <div className="flex justify-between items-center pt-1 border-t border-slate-800/60">
                      <span className="text-slate-500">Unmasking Velocity:</span>
                      <span
                        className={`font-bold ${
                          selectedPacket.client.velocityPerMinute > unmaskVelocityCeiling
                            ? 'text-rose-400 font-extrabold animate-pulse'
                            : 'text-slate-200'
                        }`}
                      >
                        {selectedPacket.client.velocityPerMinute} req/min
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              <div className="py-16 text-center text-slate-500 font-mono text-xs">
                Select an audit packet from the radar to inspect full post-quantum cryptographic parameters.
              </div>
            )}
          </div>

          {/* Enclave Security Terminal Stream */}
          <div className="bg-[#030712] border border-slate-800 rounded-xl p-4 font-mono text-[11px] shadow-xl">
            <div className="flex items-center justify-between pb-2 mb-3 border-b border-slate-800 text-slate-400">
              <div className="flex items-center gap-2">
                <Terminal className="w-3.5 h-3.5 text-emerald-400" />
                <span className="uppercase text-xs tracking-wider text-slate-200">HSM Audit Event Terminal</span>
              </div>
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            </div>

            <div className="space-y-1.5 max-h-44 overflow-y-auto text-slate-400 leading-relaxed">
              {terminalLog.map((log, index) => (
                <div
                  key={index}
                  className={`${
                    log.includes('[THREAT DETECTED]')
                      ? 'text-rose-400 font-bold'
                      : log.includes('[MANUAL OVERRIDE]')
                      ? 'text-amber-400 font-bold'
                      : 'text-slate-400'
                  }`}
                >
                  {log}
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Footer Sovereignty Seal */}
      <footer className="mt-8 pt-4 border-t border-slate-800/80 flex flex-col md:flex-row items-center justify-between text-xs font-mono text-slate-500 gap-4">
        <div className="flex items-center gap-2">
          <HardDrive className="w-4 h-4 text-amber-500/80" />
          <span>FIPS 140-3 LEVEL 4 HSM CLUSTER // CITIBANK N.A. CRYPTOGRAPHIC VAULT</span>
        </div>
        <div className="flex items-center gap-4">
          <span className="hover:text-slate-400 cursor-pointer">MODERN TREASURY LEDGER SYNC: OK</span>
          <span className="hover:text-slate-400 cursor-pointer">QUANTUM RESISTANCE: STRICT-KYBER</span>
          <span className="text-emerald-400 font-semibold">ALL SEALS VALIDATED</span>
        </div>
      </footer>
    </div>
  );
};

export default QuantumDecryptionAuditor;