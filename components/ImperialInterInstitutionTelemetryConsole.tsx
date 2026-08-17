"use client";

import React, { useState, useEffect, useMemo, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Radio,
  Shield,
  ShieldAlert,
  ShieldCheck,
  Cpu,
  Globe,
  MapPin,
  TowerControl as CellTower,
  Wifi,
  Key,
  Fingerprint,
  Activity,
  Terminal,
  RefreshCw,
  AlertTriangle,
  FileX2,
  Lock,
  Layers,
  Sparkles,
  ChevronRight,
  Database,
  Satellite,
  Compass,
  Zap,
  Sliders,
  Binary
} from "lucide-react";

interface TelemetryPacket {
  id: string;
  timestamp: string;
  standingInstructionId: string;
  accountReference: string;
  institution: "CITIBANK_GLOBAL" | "MODERN_TREASURY_LEDGER" | "IMPERIAL_SOVEREIGN_RESERVE";
  cancellationValueUSD: number;
  reasonCode: string;
  clientDetails: {
    rsaApplicationKeyFingerprint: string;
    rsaKeyLength: number;
    quantumLatticeSignature: string;
    devicePrint: {
      hardwareEntropyHash: string;
      canvasFingerprint: string;
      tpmSiliconUid: string;
      webGlRenderer: string;
      osKernelRelease: string;
      batteryLevelPercent: number;
      isRootedOrJailbroken: boolean;
    };
    cellularTelemetry: {
      towerId: string;
      eNodeBId: string;
      cellId: number;
      mccMnc: string;
      carrier: string;
      technology: "5G_NR_SA" | "5G_NSA" | "4G_LTE_ADVANCED" | "SAT_LEO_LINK";
      signalMetrics: {
        rsrpDbm: number;
        rsrqDb: number;
        sinrDb: number;
        asuLevel: number;
      };
    };
    geoCoordinates: {
      latitude: number;
      longitude: number;
      altitudeMeters: number;
      accuracyRadiusMeters: number;
      dilutionOfPrecision: number;
      geoHash: string;
      jurisdiction: string;
    };
  };
  aiRiskScore: number;
  aiClassification: "BENIGN_HIGH_NET_WORTH" | "SUSPICIOUS_GEO_DRIFT" | "RSA_KEY_TAMPER" | "ANOMALOUS_CANCELLATION";
  aiConfidenceIndex: number;
  verificationStatus: "VERIFIED_SECURE" | "FLAGGED_INSPECTION" | "CRYPTOGRAPHIC_HOLD" | "AUTONOMOUSLY_QUARANTINED";
  auditTrailHash: string;
}

const MOCK_TELEMETRY_STREAM: TelemetryPacket[] = [
  {
    id: "TEL-99482-XQ7",
    timestamp: new Date(Date.now() - 1000 * 14).toISOString(),
    standingInstructionId: "SI-CITI-PTP-88492049-LUX",
    accountReference: "CITI-PVT-OAK-00049281-CH",
    institution: "CITIBANK_GLOBAL",
    cancellationValueUSD: 450000000.0,
    reasonCode: "PTP_REVOCATION_STRATEGIC_ASSET_ALLOCATION",
    clientDetails: {
      rsaApplicationKeyFingerprint: "SHA256:4f:9a:1c:e8:99:d2:3a:b1:77:88:cc:ee:22:11:44:aa:66:33:bb:99:00:ff:dd:ee:55:aa:bb:cc:dd:ee:ff",
      rsaKeyLength: 4096,
      quantumLatticeSignature: "KYBER-1024-v3-SIG:909f182d8c38fa9012cdfe3892ab18392ef89c381920abce89df",
      devicePrint: {
        hardwareEntropyHash: "0x9F82A4B8C1E0D3F59274182903847291",
        canvasFingerprint: "CANVAS_ENTROPY_CRC32_0x82AB19FC",
        tpmSiliconUid: "TPM2.0-ST33HTPH2E32-SECURE-ENCLAVE-00892",
        webGlRenderer: "Apple M3 Max Custom GPU Enclave GL-4.6",
        osKernelRelease: "Darwin 24.3.0 xnu-11215.81.4~1/RELEASE_ARM64_T6030",
        batteryLevelPercent: 98,
        isRootedOrJailbroken: false
      },
      cellularTelemetry: {
        towerId: "GVA-TWR-8910-EON",
        eNodeBId: "ENB-74892",
        cellId: 104829,
        mccMnc: "228-01 (Swisscom Enterprise Diamond Node)",
        carrier: "Swisscom Corporate Sovereign Tier-1",
        technology: "5G_NR_SA",
        signalMetrics: {
          rsrpDbm: -68.4,
          rsrqDb: -8.1,
          sinrDb: 28.6,
          asuLevel: 82
        }
      },
      geoCoordinates: {
        latitude: 46.204391,
        longitude: 6.143158,
        altitudeMeters: 382.4,
        accuracyRadiusMeters: 0.8,
        dilutionOfPrecision: 0.72,
        geoHash: "u0hq6h",
        jurisdiction: "Geneva, Switzerland (Confederatio Helvetica)"
      }
    },
    aiRiskScore: 0.012,
    aiClassification: "BENIGN_HIGH_NET_WORTH",
    aiConfidenceIndex: 99.98,
    verificationStatus: "VERIFIED_SECURE",
    auditTrailHash: "0x892a00fe18274bca99283716ddeeaa8892716354892019284726152435364758"
  },
  {
    id: "TEL-99483-MT1",
    timestamp: new Date(Date.now() - 1000 * 62).toISOString(),
    standingInstructionId: "SI-MT-PTP-77192044-FEDWIRE",
    accountReference: "MT-LEDGER-CORP-991823-DELAWARE",
    institution: "MODERN_TREASURY_LEDGER",
    cancellationValueUSD: 82000000.0,
    reasonCode: "PTP_REVOCATION_LIQUIDITY_SWEEP_REBALANCE",
    clientDetails: {
      rsaApplicationKeyFingerprint: "SHA256:1a:2b:3c:4d:5e:6f:7a:8b:9c:0d:1e:2f:3a:4b:5c:6d:7e:8f:9a:0b:1c:2d:3e:4f:5a:6b:7c:8d:9e:0f:1a:2b",
      rsaKeyLength: 4096,
      quantumLatticeSignature: "KYBER-1024-v3-SIG:4411ee33aa882299bb00ccdd112233445566778899aabbccddeeff0011223344",
      devicePrint: {
        hardwareEntropyHash: "0x112233445566778899AABBCCDDEEFF00",
        canvasFingerprint: "CANVAS_ENTROPY_CRC32_0x1192AC44",
        tpmSiliconUid: "TPM2.0-INFINEON-SLB9670VQ2.0",
        webGlRenderer: "NVIDIA RTX 6000 Ada Sovereign Vault GL-4.6",
        osKernelRelease: "Linux 6.6.14-hardened-enterprise-rt",
        batteryLevelPercent: 100,
        isRootedOrJailbroken: false
      },
      cellularTelemetry: {
        towerId: "NYC-MAN-441-ATT",
        eNodeBId: "ENB-99214",
        cellId: 449210,
        mccMnc: "310-410 (AT&T FirstNet Direct)",
        carrier: "AT&T Ultra-Low Latency Treasury Direct",
        technology: "5G_NR_SA",
        signalMetrics: {
          rsrpDbm: -72.1,
          rsrqDb: -9.4,
          sinrDb: 24.2,
          asuLevel: 78
        }
      },
      geoCoordinates: {
        latitude: 40.712776,
        longitude: -74.005974,
        altitudeMeters: 45.2,
        accuracyRadiusMeters: 1.2,
        dilutionOfPrecision: 0.81,
        geoHash: "dr5reg",
        jurisdiction: "New York, United States (Wall Street Financial District)"
      }
    },
    aiRiskScore: 0.045,
    aiClassification: "BENIGN_HIGH_NET_WORTH",
    aiConfidenceIndex: 99.45,
    verificationStatus: "VERIFIED_SECURE",
    auditTrailHash: "0xfa77129038472918374920194827163546372819039485726154382910485726"
  },
  {
    id: "TEL-99484-ANO",
    timestamp: new Date(Date.now() - 1000 * 125).toISOString(),
    standingInstructionId: "SI-CITI-PTP-00192847-HK",
    accountReference: "CITI-HK-WEALTH-77281920-HKG",
    institution: "CITIBANK_GLOBAL",
    cancellationValueUSD: 1250000000.0,
    reasonCode: "PTP_REVOCATION_IMMEDIATE_SOVEREIGN_DISSOLUTION",
    clientDetails: {
      rsaApplicationKeyFingerprint: "SHA256:ee:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:ff:00:11:22:33:44:55:66:77:88:99:aa:bb:cc:dd:ee:00",
      rsaKeyLength: 2048,
      quantumLatticeSignature: "KYBER-1024-v3-SIG:FAIL_INSUFFICIENT_ENTROPY_00000000000000000000000000000000",
      devicePrint: {
        hardwareEntropyHash: "0xDEADBEEFCAFE00000000000000000000",
        canvasFingerprint: "CANVAS_SPOOFED_GENERIC_DRIVER_V2",
        tpmSiliconUid: "EMULATED_QEMU_VIRTUAL_TPM_MOD_DETECTED",
        webGlRenderer: "Generic Mesa Software Rasterizer (Virtual Pipe)",
        osKernelRelease: "Linux 5.15.0-generic-emulated-docker",
        batteryLevelPercent: 50,
        isRootedOrJailbroken: true
      },
      cellularTelemetry: {
        towerId: "UNKNOWN-IMSI-CATCHER-SIMULATOR-99",
        eNodeBId: "ENB-SPOOF-001",
        cellId: 999999,
        mccMnc: "001-01 (Test / Unknown Network)",
        carrier: "Unregistered Base Transceiver Station",
        technology: "4G_LTE_ADVANCED",
        signalMetrics: {
          rsrpDbm: -115.8,
          rsrqDb: -19.4,
          sinrDb: -4.2,
          asuLevel: 14
        }
      },
      geoCoordinates: {
        latitude: 22.319303,
        longitude: 114.169361,
        altitudeMeters: -12.0,
        accuracyRadiusMeters: 450.0,
        dilutionOfPrecision: 6.8,
        geoHash: "wecp4k",
        jurisdiction: "Kowloon, Hong Kong SAR (Geo-Fence Anomaly Detected)"
      }
    },
    aiRiskScore: 0.984,
    aiClassification: "RSA_KEY_TAMPER",
    aiConfidenceIndex: 99.99,
    verificationStatus: "AUTONOMOUSLY_QUARANTINED",
    auditTrailHash: "0xcc882200119933884477556611223344556677889900aabbccddeeff00112233"
  }
];

export default function ImperialInterInstitutionTelemetryConsole() {
  const [packets, setPackets] = useState<TelemetryPacket[]>(MOCK_TELEMETRY_STREAM);
  const [selectedPacketId, setSelectedPacketId] = useState<string>(MOCK_TELEMETRY_STREAM[0].id);
  const [isLiveStreamActive, setIsLiveStreamActive] = useState<boolean>(true);
  const [activeTab, setActiveTab] = useState<"DEEP_HEADER" | "DEVICE_PRINT" | "CELL_TOWER" | "GEO_RADAR" | "AI_NEURAL_AUDIT">("DEEP_HEADER");
  const [overrideModalOpen, setOverrideModalOpen] = useState<boolean>(false);
  const [actionLog, setActionLog] = useState<string[]>([]);
  const [searchQuery, setSearchQuery] = useState<string>("");

  const activePacket = useMemo(() => {
    return packets.find((p) => p.id === selectedPacketId) || packets[0];
  }, [packets, selectedPacketId]);

  // Append action log
  const logAction = useCallback((msg: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setActionLog((prev) => [`[${timestamp}] ${msg}`, ...prev.slice(0, 49)]);
  }, []);

  // Simulated live telemetry feed
  useEffect(() => {
    if (!isLiveStreamActive) return;

    const interval = setInterval(() => {
      const randomDriftRSRP = -65 - Math.floor(Math.random() * 20);
      const randomSINR = 22 + Math.floor(Math.random() * 10);
      const newPacketId = `TEL-${Math.floor(10000 + Math.random() * 90000)}-${Math.random().toString(36).substring(2, 5).toUpperCase()}`;

      const generatedPacket: TelemetryPacket = {
        id: newPacketId,
        timestamp: new Date().toISOString(),
        standingInstructionId: `SI-CITI-PTP-${Math.floor(10000000 + Math.random() * 90000000)}-SOV`,
        accountReference: `CITI-CORP-ULTRA-${Math.floor(100000 + Math.random() * 900000)}-ZUR`,
        institution: Math.random() > 0.4 ? "CITIBANK_GLOBAL" : "MODERN_TREASURY_LEDGER",
        cancellationValueUSD: Math.floor(10000000 + Math.random() * 900000000),
        reasonCode: "PTP_REVOCATION_AUTOMATED_TREASURY_REBALANCE",
        clientDetails: {
          rsaApplicationKeyFingerprint: `SHA256:${Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join(":")}`,
          rsaKeyLength: 4096,
          quantumLatticeSignature: `KYBER-1024-v3-SIG:${Math.random().toString(36).substring(2, 15)}${Math.random().toString(36).substring(2, 15)}`,
          devicePrint: {
            hardwareEntropyHash: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("").toUpperCase()}`,
            canvasFingerprint: `CANVAS_ENTROPY_CRC32_0x${Math.floor(Math.random() * 0xffffffff).toString(16).toUpperCase()}`,
            tpmSiliconUid: "TPM2.0-SOVEREIGN-SECURE-ENCLAVE-V4",
            webGlRenderer: "Apple M3 Ultra Custom Sovereign Core GL-4.6",
            osKernelRelease: "Darwin 24.3.0 Sovereign RT",
            batteryLevelPercent: Math.floor(80 + Math.random() * 20),
            isRootedOrJailbroken: false
          },
          cellularTelemetry: {
            towerId: `ZUR-TWR-${Math.floor(1000 + Math.random() * 9000)}-SOV`,
            eNodeBId: `ENB-${Math.floor(10000 + Math.random() * 90000)}`,
            cellId: Math.floor(100000 + Math.random() * 900000),
            mccMnc: "228-01 (Swisscom Enterprise Sovereign Core)",
            carrier: "Swisscom Sovereign High-Speed Core",
            technology: "5G_NR_SA",
            signalMetrics: {
              rsrpDbm: randomDriftRSRP,
              rsrqDb: -7.5 - Math.random() * 3,
              sinrDb: randomSINR,
              asuLevel: Math.floor(70 + Math.random() * 25)
            }
          },
          geoCoordinates: {
            latitude: 47.3769 + (Math.random() - 0.5) * 0.01,
            longitude: 8.5417 + (Math.random() - 0.5) * 0.01,
            altitudeMeters: 410.0 + Math.random() * 10,
            accuracyRadiusMeters: 0.6 + Math.random() * 0.4,
            dilutionOfPrecision: 0.65 + Math.random() * 0.2,
            geoHash: "u0qj9v",
            jurisdiction: "Zurich Financial Hub, Switzerland"
          }
        },
        aiRiskScore: Math.random() * 0.03,
        aiClassification: "BENIGN_HIGH_NET_WORTH",
        aiConfidenceIndex: 99.97,
        verificationStatus: "VERIFIED_SECURE",
        auditTrailHash: `0x${Array.from({ length: 32 }, () => Math.floor(Math.random() * 256).toString(16).padStart(2, "0")).join("")}`
      };

      setPackets((prev) => [generatedPacket, ...prev.slice(0, 19)]);
      logAction(`Live PTP Cancellation Ingested: ${generatedPacket.id} ($${(generatedPacket.cancellationValueUSD / 1e6).toFixed(1)}M)`);
    }, 9000);

    return () => clearInterval(interval);
  }, [isLiveStreamActive, logAction]);

  const filteredPackets = useMemo(() => {
    return packets.filter(
      (p) =>
        p.id.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.standingInstructionId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.accountReference.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.institution.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [packets, searchQuery]);

  const formatUSD = (amount: number) => {
    return new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "USD",
      maximumFractionDigits: 0
    }).format(amount);
  };

  const getStatusBadge = (status: TelemetryPacket["verificationStatus"]) => {
    switch (status) {
      case "VERIFIED_SECURE":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-emerald-950/80 border border-emerald-500/40 text-emerald-300 shadow-[0_0_15px_rgba(16,185,129,0.25)]">
            <ShieldCheck className="w-3.5 h-3.5 text-emerald-400" />
            VERIFIED SECURE
          </span>
        );
      case "AUTONOMOUSLY_QUARANTINED":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-rose-950/80 border border-rose-500/40 text-rose-300 shadow-[0_0_15px_rgba(244,63,94,0.3)]">
            <ShieldAlert className="w-3.5 h-3.5 text-rose-400 animate-pulse" />
            AUTONOMOUSLY QUARANTINED
          </span>
        );
      case "CRYPTOGRAPHIC_HOLD":
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-amber-950/80 border border-amber-500/40 text-amber-300 shadow-[0_0_15px_rgba(245,158,11,0.25)]">
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            CRYPTOGRAPHIC HOLD
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-cyan-950/80 border border-cyan-500/40 text-cyan-300">
            <AlertTriangle className="w-3.5 h-3.5 text-cyan-400" />
            FLAGGED INSPECTION
          </span>
        );
    }
  };

  const handleEnforceManualSanction = () => {
    setPackets((prev) =>
      prev.map((p) =>
        p.id === activePacket.id
          ? {
              ...p,
              verificationStatus: "AUTONOMOUSLY_QUARANTINED",
              aiClassification: "RSA_KEY_TAMPER",
              aiRiskScore: 0.999
            }
          : p
      )
    );
    logAction(`MANUAL INTERVENTION: Quarantined cancellation packet ${activePacket.id} for ${activePacket.accountReference}`);
    setOverrideModalOpen(false);
  };

  const handleAuthorizeInstruction = () => {
    setPackets((prev) =>
      prev.map((p) =>
        p.id === activePacket.id
          ? {
              ...p,
              verificationStatus: "VERIFIED_SECURE",
              aiRiskScore: 0.001
            }
          : p
      )
    );
    logAction(`MANUAL INTERVENTION: Certified and Released cancellation packet ${activePacket.id}`);
    setOverrideModalOpen(false);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans p-4 lg:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Imperial Top Ribbon */}
      <div className="relative mb-8 rounded-2xl bg-gradient-to-r from-[#0c0f17] via-[#141a29] to-[#0c0f17] border border-amber-500/30 shadow-[0_0_40px_rgba(217,119,6,0.1)] overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-amber-500/10 via-transparent to-transparent pointer-events-none" />
        <div className="relative p-6 sm:p-8 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="flex h-3 w-3 relative">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-amber-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-amber-500"></span>
              </span>
              <div className="flex items-center gap-2">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-wider bg-gradient-to-r from-amber-200 via-yellow-100 to-amber-400 bg-clip-text text-transparent uppercase">
                  Imperial Telemetry Console
                </h1>
                <span className="text-[10px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-500/20 text-amber-300 border border-amber-500/40">
                  Citibank + Modern Treasury PTP
                </span>
              </div>
            </div>
            <p className="text-xs sm:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Real-time deep-packet cryptographic telemetry for Pass-Through-Payment (PTP) standing instruction cancellations.
              Continuous validation of RSA Application Keys, Hardware Enclave devicePrints, Cellular Base Station IDs, and Nanometer-Precision Geo-Spatial coordinates.
            </p>
          </div>

          {/* Quick Metrics Header */}
          <div className="flex flex-wrap items-center gap-3 sm:gap-4">
            <div className="bg-black/60 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <Radio className="w-4 h-4 text-emerald-400 animate-pulse" />
              <div>
                <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">Feed Status</div>
                <div className="text-xs font-mono font-bold text-emerald-400 flex items-center gap-1.5">
                  LIVE 5G/SAT DUAL LINK
                </div>
              </div>
            </div>

            <div className="bg-black/60 backdrop-blur-md border border-slate-800 px-4 py-2.5 rounded-xl flex items-center gap-3">
              <Cpu className="w-4 h-4 text-amber-400" />
              <div>
                <div className="text-[10px] text-slate-400 tracking-wider uppercase font-semibold">AI Neural Core</div>
                <div className="text-xs font-mono font-bold text-amber-300">
                  ACTIVE (99.98% CONF.)
                </div>
              </div>
            </div>

            <button
              onClick={() => setIsLiveStreamActive(!isLiveStreamActive)}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition-all duration-200 flex items-center gap-2 border ${
                isLiveStreamActive
                  ? "bg-amber-500/20 border-amber-500/50 text-amber-300 hover:bg-amber-500/30"
                  : "bg-slate-800/80 border-slate-700 text-slate-400 hover:bg-slate-800"
              }`}
            >
              <RefreshCw className={`w-3.5 h-3.5 ${isLiveStreamActive ? "animate-spin" : ""}`} />
              {isLiveStreamActive ? "STREAM ACTIVE" : "PAUSED"}
            </button>
          </div>
        </div>
      </div>

      {/* Main Diagnostic Workspace */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: PTP Standing Instruction Queue (4 Cols) */}
        <div className="xl:col-span-4 space-y-4">
          <div className="bg-[#0b0e16] border border-slate-800/80 rounded-2xl p-4 shadow-xl flex flex-col h-[820px]">
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-2">
                <FileX2 className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-bold uppercase tracking-wider text-slate-200">
                  PTP Cancellation Ingest
                </h2>
              </div>
              <span className="text-xs font-mono bg-slate-900 border border-slate-800 text-slate-400 px-2 py-0.5 rounded">
                {filteredPackets.length} PACKETS
              </span>
            </div>

            {/* Filter Search */}
            <div className="py-3">
              <input
                type="text"
                placeholder="Filter by account, instruction, ID..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full px-3 py-2 text-xs bg-black/50 border border-slate-800 rounded-lg text-slate-200 placeholder-slate-500 focus:outline-none focus:border-amber-500/50"
              />
            </div>

            {/* Packet List */}
            <div className="flex-1 overflow-y-auto space-y-2.5 pr-1 custom-scrollbar">
              {filteredPackets.map((pkt) => {
                const isSelected = pkt.id === activePacket.id;
                return (
                  <div
                    key={pkt.id}
                    onClick={() => setSelectedPacketId(pkt.id)}
                    className={`p-3.5 rounded-xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? "bg-gradient-to-r from-amber-950/40 via-amber-900/20 to-transparent border-amber-500/60 shadow-[0_0_20px_rgba(217,119,6,0.15)]"
                        : "bg-slate-900/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-900/70"
                    }`}
                  >
                    {isSelected && (
                      <div className="absolute top-0 left-0 bottom-0 w-1 bg-amber-400" />
                    )}

                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-mono font-bold text-amber-200">
                            {pkt.id}
                          </span>
                          <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-slate-800 text-slate-300">
                            {pkt.institution === "CITIBANK_GLOBAL" ? "CITI" : "MODERN_TREASURY"}
                          </span>
                        </div>
                        <div className="text-[11px] font-mono text-slate-400 mt-1 truncate max-w-[200px]">
                          {pkt.standingInstructionId}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-xs font-mono font-extrabold text-amber-300">
                          {formatUSD(pkt.cancellationValueUSD)}
                        </div>
                        <div className="text-[10px] text-slate-500 mt-1">
                          {new Date(pkt.timestamp).toLocaleTimeString()}
                        </div>
                      </div>
                    </div>

                    <div className="mt-3 flex items-center justify-between pt-2 border-t border-slate-800/60">
                      <div className="flex items-center gap-1.5 text-[10px] text-slate-400">
                        <MapPin className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[120px]">{pkt.clientDetails.geoCoordinates.jurisdiction}</span>
                      </div>
                      <div>{getStatusBadge(pkt.verificationStatus)}</div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Micro Live Log Terminal Footer */}
            <div className="mt-4 pt-3 border-t border-slate-800/80">
              <div className="flex items-center gap-2 mb-1.5 text-[10px] font-mono text-slate-400">
                <Terminal className="w-3 h-3 text-amber-400" />
                <span>INTER-INSTITUTION AUDIT STREAM</span>
              </div>
              <div className="bg-black/80 rounded-lg p-2.5 font-mono text-[10px] h-24 overflow-y-auto space-y-1 text-slate-400 border border-slate-800/60">
                {actionLog.length === 0 ? (
                  <div className="text-slate-600 italic">Listening on Citibank SWIFTNet & Modern Treasury Webhook Bus...</div>
                ) : (
                  actionLog.map((log, index) => (
                    <div key={index} className="text-slate-300 truncate">
                      {log}
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Column: Deep Telemetry Diagnostic Inspector (8 Cols) */}
        <div className="xl:col-span-8 space-y-6">
          
          {/* Active Packet Header Bar */}
          <div className="bg-[#0b0e16] border border-amber-500/30 rounded-2xl p-5 shadow-2xl relative overflow-hidden">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
              <div className="space-y-1">
                <div className="flex items-center gap-3">
                  <h3 className="text-lg font-mono font-bold text-slate-100 flex items-center gap-2">
                    <Layers className="w-5 h-5 text-amber-400" />
                    {activePacket.standingInstructionId}
                  </h3>
                  {getStatusBadge(activePacket.verificationStatus)}
                </div>
                <div className="text-xs text-slate-400 font-mono flex items-center gap-4 flex-wrap">
                  <span>ACCT: <strong className="text-slate-200">{activePacket.accountReference}</strong></span>
                  <span>CANCEL VALUE: <strong className="text-amber-300">{formatUSD(activePacket.cancellationValueUSD)}</strong></span>
                  <span>REASON: <strong className="text-slate-200">{activePacket.reasonCode}</strong></span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => setOverrideModalOpen(true)}
                  className="px-4 py-2 bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-black font-extrabold text-xs rounded-xl shadow-[0_0_20px_rgba(245,158,11,0.3)] transition-all flex items-center gap-2"
                >
                  <Sliders className="w-3.5 h-3.5" />
                  SOVEREIGN OVERRIDE
                </button>
              </div>
            </div>

            {/* Navigation Tabs */}
            <div className="flex items-center gap-2 mt-6 overflow-x-auto border-b border-slate-800 pb-2">
              {[
                { id: "DEEP_HEADER", label: "ClientDetails & RSA", icon: Key },
                { id: "DEVICE_PRINT", label: "DevicePrint Harvester", icon: Fingerprint },
                { id: "CELL_TOWER", label: "Cellular & Signal RF", icon: CellTower },
                { id: "GEO_RADAR", label: "Precision Geolocation", icon: Satellite },
                { id: "AI_NEURAL_AUDIT", label: "AI Neural Risk Matrix", icon: Sparkles }
              ].map((tab) => {
                const IconComponent = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`flex items-center gap-2 px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition-all ${
                      isActive
                        ? "bg-amber-500/20 text-amber-300 border border-amber-500/40 shadow-[0_0_15px_rgba(217,119,6,0.15)]"
                        : "text-slate-400 hover:text-slate-200 hover:bg-slate-900/60"
                    }`}
                  >
                    <IconComponent className={`w-3.5 h-3.5 ${isActive ? "text-amber-400" : "text-slate-500"}`} />
                    {tab.label}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Tab Content Display Area */}
          <div className="bg-[#0b0e16] border border-slate-800/80 rounded-2xl p-6 shadow-2xl min-h-[520px]">
            <AnimatePresence mode="wait">
              {/* TAB 1: CLIENT DETAILS & RSA */}
              {activeTab === "DEEP_HEADER" && (
                <motion.div
                  key="deep-header"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Key className="w-4 h-4 text-amber-400" />
                      ClientDetails Application Header & Cryptographic Attestation
                    </h4>
                    <span className="text-xs font-mono text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                      FIPS 140-3 LEVEL 4 CERTIFIED
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                      <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        RSA Application Key Fingerprint
                      </div>
                      <div className="font-mono text-xs text-amber-300 break-all bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {activePacket.clientDetails.rsaApplicationKeyFingerprint}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Key Modulus Length:</span>
                        <span className="font-mono font-bold text-slate-200">
                          {activePacket.clientDetails.rsaKeyLength} Bits (Prime RSA-OAEP)
                        </span>
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800/80 p-4 rounded-xl space-y-3">
                      <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider">
                        Post-Quantum Kyber-1024 Lattice Signature
                      </div>
                      <div className="font-mono text-xs text-cyan-300 break-all bg-slate-950 p-3 rounded-lg border border-slate-800">
                        {activePacket.clientDetails.quantumLatticeSignature}
                      </div>
                      <div className="flex items-center justify-between text-xs text-slate-400">
                        <span>Quantum Resistance Grade:</span>
                        <span className="font-mono font-bold text-emerald-400">NIST PQC ROUND-4 HARDENED</span>
                      </div>
                    </div>
                  </div>

                  {/* Inter-institution Multi-Hop Trace */}
                  <div className="bg-black/40 border border-slate-800/80 p-4 rounded-xl space-y-3">
                    <div className="text-[11px] uppercase font-bold text-slate-400 tracking-wider flex items-center justify-between">
                      <span>Inter-Institution PTP Transit Routing</span>
                      <span className="text-amber-400 font-mono text-[10px]">E2E ZERO-TRUST ENCLAVE</span>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Source Client Node</div>
                        <div className="text-xs font-mono font-bold text-slate-200">Enclave Agent v4.19</div>
                        <div className="text-[10px] text-emerald-400">Mutual TLS 1.3 Verified</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Citibank Host Gateway</div>
                        <div className="text-xs font-mono font-bold text-slate-200">Citi-Direct API Shield</div>
                        <div className="text-[10px] text-emerald-400">RSA Header Verified</div>
                      </div>
                      <div className="p-3 rounded-lg bg-slate-900/60 border border-slate-800 text-center space-y-1">
                        <div className="text-[10px] text-slate-500 font-bold uppercase">Modern Treasury Ledger</div>
                        <div className="text-xs font-mono font-bold text-slate-200">MT Real-Time Engine</div>
                        <div className="text-[10px] text-amber-300">PTP Revocation Pending</div>
                      </div>
                    </div>
                  </div>

                  {/* Audit Hash */}
                  <div className="p-3 rounded-xl bg-gradient-to-r from-amber-950/30 to-black border border-amber-500/20 flex items-center justify-between">
                    <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                      <Binary className="w-4 h-4 text-amber-400" />
                      <span>TELEMETRY IMMUTABLE AUDIT HASH:</span>
                    </div>
                    <div className="font-mono text-xs text-amber-300 truncate max-w-sm">
                      {activePacket.auditTrailHash}
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 2: DEVICE PRINT HARVESTER */}
              {activeTab === "DEVICE_PRINT" && (
                <motion.div
                  key="device-print"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Fingerprint className="w-4 h-4 text-amber-400" />
                      Hardware Silicon Entropy & OS Telemetry Fingerprint
                    </h4>
                    <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-md">
                      SILICON PUF LEVEL ACTIVE
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <div className="text-[11px] uppercase font-bold text-slate-400">Silicon TPM 2.0 UID</div>
                      <div className="text-xs font-mono font-bold text-slate-100 bg-slate-950 p-2.5 rounded border border-slate-800">
                        {activePacket.clientDetails.devicePrint.tpmSiliconUid}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <div className="text-[11px] uppercase font-bold text-slate-400">Hardware Entropy Digest</div>
                      <div className="text-xs font-mono font-bold text-cyan-300 bg-slate-950 p-2.5 rounded border border-slate-800">
                        {activePacket.clientDetails.devicePrint.hardwareEntropyHash}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <div className="text-[11px] uppercase font-bold text-slate-400">Canvas Entropy Hash</div>
                      <div className="text-xs font-mono font-bold text-slate-100 bg-slate-950 p-2.5 rounded border border-slate-800">
                        {activePacket.clientDetails.devicePrint.canvasFingerprint}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-2.5">
                      <div className="text-[11px] uppercase font-bold text-slate-400">WebGL GPU Enclave</div>
                      <div className="text-xs font-mono font-bold text-slate-100 bg-slate-950 p-2.5 rounded border border-slate-800">
                        {activePacket.clientDetails.devicePrint.webGlRenderer}
                      </div>
                    </div>
                  </div>

                  {/* Device Integrity Indicators */}
                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="bg-black/40 border border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">OS Kernel Release</div>
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {activePacket.clientDetails.devicePrint.osKernelRelease}
                      </div>
                    </div>

                    <div className="bg-black/40 border border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Battery State</div>
                      <div className="text-xs font-mono font-bold text-emerald-400">
                        {activePacket.clientDetails.devicePrint.batteryLevelPercent}% CHARGED (DC PLUGGED)
                      </div>
                    </div>

                    <div className="bg-black/40 border border-slate-800 p-4 rounded-xl text-center space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Root / Jailbreak Status</div>
                      <div className={`text-xs font-mono font-bold ${activePacket.clientDetails.devicePrint.isRootedOrJailbroken ? "text-rose-400" : "text-emerald-400"}`}>
                        {activePacket.clientDetails.devicePrint.isRootedOrJailbroken ? "COMPROMISED (ROOT DETECTED)" : "CLEAN (ENCLAVE INTACT)"}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 3: CELL TOWER & SIGNAL RF */}
              {activeTab === "CELL_TOWER" && (
                <motion.div
                  key="cell-tower"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <CellTower className="w-4 h-4 text-amber-400" />
                      Cellular Triangulation & RF Telemetry Spectrum
                    </h4>
                    <span className="text-xs font-mono text-cyan-300 bg-cyan-950/60 border border-cyan-500/30 px-2.5 py-1 rounded-md">
                      {activePacket.clientDetails.cellularTelemetry.technology}
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Base Station ID</div>
                      <div className="text-xs font-mono font-bold text-amber-300">
                        {activePacket.clientDetails.cellularTelemetry.towerId}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">eNodeB / gNodeB</div>
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {activePacket.clientDetails.cellularTelemetry.eNodeBId}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Sector Cell ID</div>
                      <div className="text-xs font-mono font-bold text-slate-200">
                        {activePacket.clientDetails.cellularTelemetry.cellId}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1 text-center">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Carrier & MCC/MNC</div>
                      <div className="text-xs font-mono font-bold text-slate-200 truncate">
                        {activePacket.clientDetails.cellularTelemetry.mccMnc}
                      </div>
                    </div>
                  </div>

                  {/* Signal Strength RF Gauge Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">RSRP (Power)</span>
                        <span className="font-mono font-bold text-amber-300">{activePacket.clientDetails.cellularTelemetry.signalMetrics.rsrpDbm} dBm</span>
                      </div>
                      <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-amber-400 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(10, 140 + activePacket.clientDetails.cellularTelemetry.signalMetrics.rsrpDbm))}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">RSRQ (Quality)</span>
                        <span className="font-mono font-bold text-cyan-300">{activePacket.clientDetails.cellularTelemetry.signalMetrics.rsrqDb} dB</span>
                      </div>
                      <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-cyan-400 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(10, 30 + activePacket.clientDetails.cellularTelemetry.signalMetrics.rsrqDb * 2))}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">SINR (Signal/Noise)</span>
                        <span className="font-mono font-bold text-emerald-400">{activePacket.clientDetails.cellularTelemetry.signalMetrics.sinrDb} dB</span>
                      </div>
                      <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-emerald-400 h-full rounded-full transition-all"
                          style={{
                            width: `${Math.min(100, Math.max(10, (activePacket.clientDetails.cellularTelemetry.signalMetrics.sinrDb / 35) * 100))}%`
                          }}
                        />
                      </div>
                    </div>

                    <div className="bg-slate-900/60 border border-slate-800 p-4 rounded-xl space-y-2">
                      <div className="flex justify-between items-center text-xs">
                        <span className="text-slate-400">ASU Level</span>
                        <span className="font-mono font-bold text-yellow-300">{activePacket.clientDetails.cellularTelemetry.signalMetrics.asuLevel}</span>
                      </div>
                      <div className="w-full bg-black h-2 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className="bg-yellow-400 h-full rounded-full transition-all"
                          style={{
                            width: `${(activePacket.clientDetails.cellularTelemetry.signalMetrics.asuLevel / 99) * 100}%`
                          }}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="bg-black/60 border border-slate-800 p-4 rounded-xl flex items-center justify-between text-xs">
                    <div className="text-slate-400">Carrier Service Provider:</div>
                    <div className="font-mono font-bold text-slate-100">{activePacket.clientDetails.cellularTelemetry.carrier}</div>
                  </div>
                </motion.div>
              )}

              {/* TAB 4: PRECISION GEOLOCATION */}
              {activeTab === "GEO_RADAR" && (
                <motion.div
                  key="geo-radar"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Globe className="w-4 h-4 text-amber-400" />
                      Centimeter-Precision GNSS & Sovereign Geo-Fence Radar
                    </h4>
                    <span className="text-xs font-mono text-emerald-300 bg-emerald-950/60 border border-emerald-500/30 px-2.5 py-1 rounded-md">
                      DOP: {activePacket.clientDetails.geoCoordinates.dilutionOfPrecision} (OPTIMAL)
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Latitude & Longitude</div>
                      <div className="text-sm font-mono font-bold text-amber-300">
                        {activePacket.clientDetails.geoCoordinates.latitude.toFixed(6)}° N, {activePacket.clientDetails.geoCoordinates.longitude.toFixed(6)}° E
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Altitude & GeoHash</div>
                      <div className="text-sm font-mono font-bold text-cyan-300">
                        {activePacket.clientDetails.geoCoordinates.altitudeMeters}m MSL / {activePacket.clientDetails.geoCoordinates.geoHash}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-4 rounded-xl space-y-1">
                      <div className="text-[10px] text-slate-400 uppercase font-bold">Horizontal Accuracy Radius</div>
                      <div className="text-sm font-mono font-bold text-emerald-400">
                        ±{activePacket.clientDetails.geoCoordinates.accuracyRadiusMeters} meters (RTK Fix)
                      </div>
                    </div>
                  </div>

                  {/* Simulated Radar Visualizer */}
                  <div className="relative h-64 bg-[#05070e] rounded-2xl border border-amber-500/20 overflow-hidden flex items-center justify-center">
                    <div className="absolute inset-0 bg-[radial-gradient(#1e293b_1px,transparent_1px)] [background-size:16px_16px] opacity-30" />
                    
                    {/* Concentric Radar Rings */}
                    <div className="absolute w-48 h-48 rounded-full border border-amber-500/20 animate-pulse" />
                    <div className="absolute w-32 h-32 rounded-full border border-amber-500/30" />
                    <div className="absolute w-16 h-16 rounded-full border border-amber-500/40" />

                    {/* Sweeper Line */}
                    <div className="absolute w-48 h-48 rounded-full border border-transparent border-t-amber-400/50 animate-spin" style={{ animationDuration: "6s" }} />

                    {/* Target Blip */}
                    <div className="relative z-10 flex flex-col items-center">
                      <div className="w-4 h-4 bg-amber-400 rounded-full shadow-[0_0_20px_#f59e0b] animate-ping" />
                      <div className="mt-2 text-[10px] font-mono font-bold text-amber-200 bg-black/80 px-2 py-1 rounded border border-amber-500/40">
                        {activePacket.clientDetails.geoCoordinates.jurisdiction}
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}

              {/* TAB 5: AI NEURAL RISK MATRIX */}
              {activeTab === "AI_NEURAL_AUDIT" && (
                <motion.div
                  key="ai-neural-audit"
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  transition={{ duration: 0.2 }}
                  className="space-y-6"
                >
                  <div className="flex items-center justify-between">
                    <h4 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
                      <Sparkles className="w-4 h-4 text-amber-400" />
                      AI Neural Threat Assessment & Anomaly Vector Analysis
                    </h4>
                    <span className="text-xs font-mono text-amber-300 bg-amber-950/60 border border-amber-500/30 px-2.5 py-1 rounded-md">
                      CONFIDENCE: {activePacket.aiConfidenceIndex}%
                    </span>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="bg-black/60 border border-slate-800 p-5 rounded-2xl space-y-4">
                      <div className="flex justify-between items-center">
                        <span className="text-xs text-slate-400 font-bold uppercase">Computed Anomaly Risk Score</span>
                        <span className={`text-lg font-mono font-extrabold ${activePacket.aiRiskScore > 0.5 ? "text-rose-400" : "text-emerald-400"}`}>
                          {(activePacket.aiRiskScore * 100).toFixed(2)}%
                        </span>
                      </div>

                      <div className="w-full bg-slate-900 h-3 rounded-full overflow-hidden border border-slate-800">
                        <div
                          className={`h-full rounded-full transition-all ${
                            activePacket.aiRiskScore > 0.5 ? "bg-rose-500" : "bg-emerald-500"
                          }`}
                          style={{ width: `${activePacket.aiRiskScore * 100}%` }}
                        />
                      </div>

                      <div className="text-xs text-slate-300 leading-relaxed pt-2">
                        {activePacket.aiRiskScore > 0.5 ? (
                          <span className="text-rose-300">
                            <strong>CRITICAL WARNING:</strong> Neural model detected signature entropy spoofing and anomalous cell tower carrier identifiers inconsistent with authenticated standing instruction provenance.
                          </span>
                        ) : (
                          <span className="text-emerald-300">
                            <strong>ALL VECTORS VERIFIED:</strong> Hardware TPM silicon UID aligns perfectly with historical Citibank wealth enclaves. Cellular tower signal geometry matches verified corporate coordinates.
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="bg-black/60 border border-slate-800 p-5 rounded-2xl space-y-3">
                      <div className="text-xs text-slate-400 font-bold uppercase">Neural Sub-System Evaluations</div>
                      
                      <div className="space-y-2 font-mono text-xs">
                        <div className="flex justify-between items-center p-2 rounded bg-slate-950/80 border border-slate-800">
                          <span className="text-slate-400">RSA Key Pair Integrity:</span>
                          <span className={activePacket.aiClassification === "RSA_KEY_TAMPER" ? "text-rose-400 font-bold" : "text-emerald-400 font-bold"}>
                            {activePacket.aiClassification === "RSA_KEY_TAMPER" ? "COMPROMISED" : "PASSED (4096-BIT)"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-2 rounded bg-slate-950/80 border border-slate-800">
                          <span className="text-slate-400">Cellular Base Station Spoofing:</span>
                          <span className={activePacket.clientDetails.cellularTelemetry.technology === "4G_LTE_ADVANCED" ? "text-amber-400 font-bold" : "text-emerald-400 font-bold"}>
                            {activePacket.clientDetails.cellularTelemetry.technology === "4G_LTE_ADVANCED" ? "SUSPECT BTS DETECTED" : "VERIFIED 5G SA CORE"}
                          </span>
                        </div>

                        <div className="flex justify-between items-center p-2 rounded bg-slate-950/80 border border-slate-800">
                          <span className="text-slate-400">Geo-Drift Velocity Analysis:</span>
                          <span className="text-emerald-400 font-bold">0.02 m/s (STATIC SECURE)</span>
                        </div>
                      </div>
                    </div>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>

      {/* SOVEREIGN OVERRIDE MODAL */}
      <AnimatePresence>
        {overrideModalOpen && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#0e121c] border border-amber-500/40 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-[0_0_50px_rgba(217,119,6,0.2)] space-y-6"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-3 bg-amber-500/20 rounded-2xl border border-amber-500/40">
                    <ShieldAlert className="w-6 h-6 text-amber-400" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-slate-100">Sovereign PTP Authority Override</h3>
                    <p className="text-xs text-slate-400">Standing Instruction Telemetry Governance</p>
                  </div>
                </div>
                <button
                  onClick={() => setOverrideModalOpen(false)}
                  className="text-slate-500 hover:text-slate-300 text-lg font-bold"
                >
                  ✕
                </button>
              </div>

              <div className="bg-black/60 p-4 rounded-xl border border-slate-800 text-xs font-mono space-y-1.5 text-slate-300">
                <div>INSTRUCTION: <span className="text-amber-300">{activePacket.standingInstructionId}</span></div>
                <div>VALUE: <span className="text-amber-300 font-bold">{formatUSD(activePacket.cancellationValueUSD)}</span></div>
                <div>INSTITUTION: <span className="text-slate-200">{activePacket.institution}</span></div>
              </div>

              <p className="text-xs text-slate-400 leading-relaxed">
                Executing an override will cryptographically countersign or immediately quarantine the pass-through payment instruction cancellation across both Citibank and Modern Treasury clearing ledgers.
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleAuthorizeInstruction}
                  className="w-full py-3 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-black font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] flex items-center justify-center gap-2"
                >
                  <ShieldCheck className="w-4 h-4" />
                  CERTIFY & EXECUTE
                </button>

                <button
                  onClick={handleEnforceManualSanction}
                  className="w-full py-3 px-4 rounded-xl bg-rose-600 hover:bg-rose-500 text-white font-extrabold text-xs transition-all shadow-[0_0_20px_rgba(244,63,94,0.3)] flex items-center justify-center gap-2"
                >
                  <Lock className="w-4 h-4" />
                  ENFORCE QUARANTINE
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}