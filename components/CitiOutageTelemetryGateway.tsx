import React, { useState, useEffect, useCallback, useMemo } from 'react';
import {
  ShieldAlert,
  Radio,
  Cpu,
  Fingerprint,
  KeyRound,
  Navigation,
  Activity,
  Zap,
  Globe2,
  Lock,
  Unlock,
  AlertTriangle,
  Server,
  Layers,
  Terminal,
  Crosshair,
  Satellite,
  Compass,
  CheckCircle2,
  RefreshCw,
  Eye,
  Sliders,
  Send,
  Database,
  Wifi,
  Workflow
} from 'lucide-react';

interface TelemetryProfile {
  deviceFingerprint: string;
  simIccid: string;
  imsi: string;
  cellTowerId: string;
  mccMnc: string;
  signalStrengthDbm: number;
  latitude: number;
  longitude: number;
  altitudeMeters: number;
  geohash: string;
  rsaAppKeyThumbprint: string;
  rsaSignature: string;
  psd2Endpoint: string;
  psd2FallbackActive: boolean;
  userAgentPayload: string;
  quantumEntropyHash: string;
}

interface PSD2OutageMetric {
  endpoint: string;
  slaTargetMs: number;
  currentLatencyMs: number;
  uptime90d: number;
  outageStatus: 'NOMINAL' | 'DEGRADED' | 'OUTAGE_FALLBACK' | 'ISOLATED';
  lastHealthCheck: string;
  mttrMinutes: number;
}

export const CitiOutageTelemetryGateway: React.FC = () => {
  const [telemetry, setTelemetry] = useState<TelemetryProfile>({
    deviceFingerprint: 'CITI-TITANIUM-FP-9981-AE20-4109-88BC-0019C3AA817F',
    simIccid: '89014103211118510720F',
    imsi: '310410098765432',
    cellTowerId: 'eNodeB-NYC-WALLST-9092-CELL-04',
    mccMnc: '310-410 (US AT&T Sovereign Dedicated)',
    signalStrengthDbm: -61,
    latitude: 40.7061,
    longitude: -74.0092,
    altitudeMeters: 142.8,
    geohash: 'dr5regw3s2',
    rsaAppKeyThumbprint: 'RSA4096:9E:FC:21:40:B8:33:0A:12:F1:C9:88:EE:74:90:3A:D2:8C:FE:01',
    rsaSignature: '0x9BF811E73C00A892EF401128D8A78311B90382E477C98AA3112E5587DFBC9201...',
    psd2Endpoint: 'https://api.citigroup.imperial/psd2/v3/aisp/accounts/telemetry-validate',
    psd2FallbackActive: false,
    userAgentPayload: 'CitiBespokeImperial/11.04.2 (iOS 18.3.1; iPhone16,2 Sovereign-Enclave-v9)',
    quantumEntropyHash: '0x88f219c00aa18e472091bcaf093817a6'
  });

  const [psd2Matrix, setPsd2Matrix] = useState<PSD2OutageMetric[]>([
    {
      endpoint: '/psd2/v3/aisp/accounts',
      slaTargetMs: 120,
      currentLatencyMs: 84,
      uptime90d: 99.999,
      outageStatus: 'NOMINAL',
      lastHealthCheck: 'T-00:00:03',
      mttrMinutes: 0.8
    },
    {
      endpoint: '/psd2/v3/pisp/payment-initiation',
      slaTargetMs: 250,
      currentLatencyMs: 312,
      uptime90d: 99.982,
      outageStatus: 'DEGRADED',
      lastHealthCheck: 'T-00:00:01',
      mttrMinutes: 2.1
    },
    {
      endpoint: '/psd2/v3/cbpii/funds-confirmation',
      slaTargetMs: 100,
      currentLatencyMs: 92,
      uptime90d: 99.999,
      outageStatus: 'NOMINAL',
      lastHealthCheck: 'T-00:00:04',
      mttrMinutes: 0.4
    },
    {
      endpoint: '/psd2/v3/fallback/dedicated-interface',
      slaTargetMs: 400,
      currentLatencyMs: 1240,
      uptime90d: 99.450,
      outageStatus: 'OUTAGE_FALLBACK',
      lastHealthCheck: 'T-00:00:00',
      mttrMinutes: 14.6
    }
  ]);

  const [isInjecting, setIsInjecting] = useState<boolean>(false);
  const [aiNeuralAnalyzing, setAiNeuralAnalyzing] = useState<boolean>(false);
  const [liveStreamActive, setLiveStreamActive] = useState<boolean>(true);
  const [auditLogs, setAuditLogs] = useState<string[]>([
    '[INIT] Sovereign PSD2 Outage Telemetry Gateway v9.41 online.',
    '[SECURITY] HSM Client RSA-4096 key ring securely validated.',
    '[TELEMETRY] Cell Tower Triangulation precision: ±0.42m.'
  ]);

  const addLog = useCallback((msg: string) => {
    setAuditLogs((prev) => [`[${new Date().toISOString().substring(11, 19)}] ${msg}`, ...prev.slice(0, 18)]);
  }, []);

  // Periodic Telemetry Fluctuation Simulator
  useEffect(() => {
    if (!liveStreamActive) return;
    const interval = setInterval(() => {
      setTelemetry((prev) => {
        const dLat = (Math.random() - 0.5) * 0.00008;
        const dLon = (Math.random() - 0.5) * 0.00008;
        const dSignal = Math.floor((Math.random() - 0.5) * 4);
        return {
          ...prev,
          latitude: +(prev.latitude + dLat).toFixed(6),
          longitude: +(prev.longitude + dLon).toFixed(6),
          signalStrengthDbm: Math.min(-45, Math.max(-85, prev.signalStrengthDbm + dSignal)),
          quantumEntropyHash: '0x' + Math.floor(Math.random() * 1e16).toString(16).padStart(16, '0') + Math.floor(Math.random() * 1e16).toString(16).padStart(16, '0')
        };
      });
    }, 2400);
    return () => clearInterval(interval);
  }, [liveStreamActive]);

  const handleRegenerateEntropy = () => {
    const newFp = `CITI-TITANIUM-FP-${Math.floor(1000 + Math.random() * 9000)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
    const newIccid = `89014103${Math.floor(100000000000 + Math.random() * 900000000000)}F`;
    const newSig = '0x' + Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('');
    
    setTelemetry((prev) => ({
      ...prev,
      deviceFingerprint: newFp,
      simIccid: newIccid,
      rsaSignature: newSig
    }));
    addLog(`CLIENT_DETAILS re-synthesized: FP=${newFp}`);
  };

  const handleInjectTelemetryHeader = async () => {
    setIsInjecting(true);
    addLog(`INJECTING CLIENT_DETAILS headers into PSD2 Gateway Target: ${telemetry.psd2Endpoint}...`);
    
    setTimeout(() => {
      setIsInjecting(false);
      addLog(`SUCCESS: 200 OK — Header Signature verified by Citi Sovereign Enclave.`);
    }, 1200);
  };

  const handleRunAiDiagnostics = () => {
    setAiNeuralAnalyzing(true);
    addLog(`AI DIAGNOSTIC: Triggering Claude-3.5 PSD2 Regulatory Contingency Engine...`);

    setTimeout(() => {
      setAiNeuralAnalyzing(false);
      setPsd2Matrix((prev) =>
        prev.map((item) => {
          if (item.outageStatus === 'OUTAGE_FALLBACK') {
            return {
              ...item,
              currentLatencyMs: 140,
              outageStatus: 'NOMINAL',
              lastHealthCheck: 'T-00:00:00'
            };
          }
          return item;
        })
      );
      addLog(`AI RESOLUTION: Fallback routing bypassed. Primary AISP latency stabilized at 84ms.`);
    }, 1800);
  };

  const simulatedHeadersJson = useMemo(() => {
    return JSON.stringify(
      {
        'X-Citi-Client-Device-Fingerprint': telemetry.deviceFingerprint,
        'X-Citi-SIM-ICCID': telemetry.simIccid,
        'X-Citi-SIM-IMSI': telemetry.imsi,
        'X-Citi-Cell-Tower-Id': telemetry.cellTowerId,
        'X-Citi-Cell-Network': telemetry.mccMnc,
        'X-Citi-Signal-dBm': `${telemetry.signalStrengthDbm} dBm`,
        'X-Citi-GPS-Telemetry': `${telemetry.latitude}, ${telemetry.longitude} (Alt: ${telemetry.altitudeMeters}m)`,
        'X-Citi-Geohash': telemetry.geohash,
        'X-Citi-App-RSA-Thumbprint': telemetry.rsaAppKeyThumbprint,
        'X-Citi-Signature-Payload': telemetry.rsaSignature,
        'X-Citi-PSD2-Fallback-Active': telemetry.psd2FallbackActive ? 'TRUE' : 'FALSE',
        'X-Citi-Quantum-Entropy': telemetry.quantumEntropyHash,
        'User-Agent': telemetry.userAgentPayload
      },
      null,
      2
    );
  }, [telemetry]);

  return (
    <div className="w-full min-h-screen bg-[#07090E] text-slate-100 p-4 md:p-8 font-sans selection:bg-[#D4AF37] selection:text-black">
      {/* Header Banner - Ultra Luxury Gold / Titanium aesthetic */}
      <div className="relative border border-[#D4AF37]/30 bg-gradient-to-r from-[#0C1017] via-[#121824] to-[#0A0D14] rounded-2xl p-6 mb-8 shadow-2xl backdrop-blur-3xl overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-radial-gold opacity-10 blur-3xl pointer-events-none" />
        <div className="absolute -left-10 -bottom-10 w-80 h-80 bg-[#1e3a8a] opacity-15 blur-3xl pointer-events-none" />
        
        <div className="relative z-10 flex flex-col lg:flex-row justify-between items-start lg:items-center gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 text-xs font-black tracking-widest uppercase bg-[#D4AF37]/15 text-[#D4AF37] border border-[#D4AF37]/40 rounded-full flex items-center gap-1.5 shadow-[0_0_12px_rgba(212,175,55,0.25)]">
                <Radio className="w-3.5 h-3.5 animate-pulse text-[#D4AF37]" />
                Citi Sovereign Security Grid
              </span>
              <span className="px-2.5 py-0.5 text-xs font-mono font-medium text-emerald-400 bg-emerald-950/60 border border-emerald-500/30 rounded-md">
                PSD2 RTS Art. 32/33 COMPLIANT
              </span>
            </div>
            <h1 className="text-2xl md:text-4xl font-extrabold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white via-slate-100 to-[#D4AF37]">
              Imperial Outage & ClientDetails Telemetry Gateway
            </h1>
            <p className="text-xs md:text-sm text-slate-400 max-w-3xl leading-relaxed">
              Granular inspection, cryptographic synthesis, and hardware-bound injection of <code className="text-[#D4AF37] font-mono">clientDetails</code> headers for Tier-0 PSD2 dedicated interfaces and emergency fallback contingency routing.
            </p>
          </div>

          {/* Quick Actions */}
          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={handleRegenerateEntropy}
              className="px-4 py-2.5 rounded-xl border border-slate-700 hover:border-[#D4AF37] bg-slate-900/80 hover:bg-[#D4AF37]/10 text-slate-200 hover:text-[#D4AF37] text-xs font-bold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-lg"
            >
              <RefreshCw className="w-4 h-4" />
              Re-Synthesize Keys
            </button>
            <button
              onClick={handleRunAiDiagnostics}
              disabled={aiNeuralAnalyzing}
              className="px-4 py-2.5 rounded-xl border border-[#D4AF37]/50 bg-gradient-to-r from-[#D4AF37] to-[#B8860B] text-black hover:brightness-110 text-xs font-extrabold uppercase tracking-wider transition-all duration-200 flex items-center gap-2 shadow-[0_0_20px_rgba(212,175,55,0.3)] disabled:opacity-50"
            >
              <Cpu className={`w-4 h-4 ${aiNeuralAnalyzing ? 'animate-spin' : ''}`} />
              {aiNeuralAnalyzing ? 'Neural Healing...' : 'AI Auto-Remediate'}
            </button>
          </div>
        </div>
      </div>

      {/* Main Grid Matrix */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-6">
        
        {/* Left Column: Device & Carrier Radio Telemetry (5 cols) */}
        <div className="xl:col-span-5 space-y-6">
          
          {/* Card: Cellular & Spatial Telemetry */}
          <div className="bg-[#0D121C]/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl relative overflow-hidden backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                  <Satellite className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide uppercase">Cellular & GPS Triangulation</h2>
                  <p className="text-[11px] text-slate-400">Layer-1 Physical SIM & Tower Telemetry Headers</p>
                </div>
              </div>
              <button 
                onClick={() => setLiveStreamActive(!liveStreamActive)}
                className={`px-2.5 py-1 rounded text-[10px] font-mono font-bold tracking-widest uppercase transition-colors ${liveStreamActive ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/40' : 'bg-rose-500/20 text-rose-300 border border-rose-500/40'}`}
              >
                {liveStreamActive ? '● LIVE SYNC' : '○ PAUSED'}
              </button>
            </div>

            <div className="space-y-4 font-mono text-xs">
              <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Fingerprint className="w-3.5 h-3.5 text-[#D4AF37]" /> SIM ICCID</span>
                  <span className="text-slate-100 font-bold">{telemetry.simIccid}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Radio className="w-3.5 h-3.5 text-[#D4AF37]" /> IMSI Identity</span>
                  <span className="text-slate-100">{telemetry.imsi}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Wifi className="w-3.5 h-3.5 text-cyan-400" /> Carrier / MNC</span>
                  <span className="text-cyan-300">{telemetry.mccMnc}</span>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Server className="w-3.5 h-3.5 text-amber-400" /> Base Station ID</span>
                  <span className="text-amber-200">{telemetry.cellTowerId}</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Activity className="w-3.5 h-3.5 text-emerald-400" /> Signal Attenuation</span>
                  <div className="flex items-center gap-2">
                    <div className="w-20 bg-slate-800 h-1.5 rounded-full overflow-hidden">
                      <div 
                        className="bg-emerald-400 h-full rounded-full" 
                        style={{ width: `${Math.max(10, 100 - (Math.abs(telemetry.signalStrengthDbm) - 40) * 1.5)}%` }} 
                      />
                    </div>
                    <span className="text-emerald-400 font-bold">{telemetry.signalStrengthDbm} dBm</span>
                  </div>
                </div>
              </div>

              <div className="p-3 bg-black/40 rounded-xl border border-slate-800/80 space-y-2">
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Navigation className="w-3.5 h-3.5 text-indigo-400" /> GPS Lat / Long</span>
                  <span className="text-indigo-200">{telemetry.latitude}° N, {telemetry.longitude}° W</span>
                </div>
                <div className="flex justify-between items-center text-slate-400">
                  <span className="flex items-center gap-1.5"><Compass className="w-3.5 h-3.5 text-indigo-400" /> Geohash & Altitude</span>
                  <span className="text-slate-300">{telemetry.geohash} (Alt: {telemetry.altitudeMeters}m)</span>
                </div>
              </div>
            </div>
          </div>

          {/* Card: Cryptographic RSA Enclave Verification */}
          <div className="bg-[#0D121C]/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-5">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                  <KeyRound className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide uppercase">RSA App Key Enclave</h2>
                  <p className="text-[11px] text-slate-400">Hardware Keystore PSD2 Telemetry Signature</p>
                </div>
              </div>
              <span className="px-2 py-0.5 text-[10px] font-mono text-[#D4AF37] bg-[#D4AF37]/10 border border-[#D4AF37]/30 rounded">
                RSA-4096 HW-BOUND
              </span>
            </div>

            <div className="space-y-3 font-mono text-xs">
              <div>
                <label className="text-[11px] text-slate-400 font-sans font-semibold mb-1 block">
                  X-Citi-App-RSA-Thumbprint
                </label>
                <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg text-slate-300 break-all select-all text-[11px]">
                  {telemetry.rsaAppKeyThumbprint}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-sans font-semibold mb-1 block">
                  X-Citi-Signature-Payload (SHA-512 with RSA)
                </label>
                <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg text-[#D4AF37]/90 break-all select-all text-[11px]">
                  {telemetry.rsaSignature}
                </div>
              </div>
              <div>
                <label className="text-[11px] text-slate-400 font-sans font-semibold mb-1 block">
                  Quantum Entropy State
                </label>
                <div className="p-2.5 bg-black/60 border border-slate-800 rounded-lg text-cyan-400 text-[11px] flex items-center justify-between">
                  <span>{telemetry.quantumEntropyHash}</span>
                  <Zap className="w-3.5 h-3.5 text-cyan-400 animate-pulse" />
                </div>
              </div>
            </div>
          </div>

        </div>

        {/* Right Column: PSD2 Outage Query Matrix & Live Header Console (7 cols) */}
        <div className="xl:col-span-7 space-y-6">
          
          {/* Card: PSD2 Outage & Dedicated Fallback Health Monitor */}
          <div className="bg-[#0D121C]/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-indigo-500/10 border border-indigo-500/30 text-indigo-400">
                  <Workflow className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide uppercase">PSD2 Outage & Contingency SLA Monitor</h2>
                  <p className="text-[11px] text-slate-400">Citibank Europe plc PSD2 RTS Article 32 & 33 Dedicated Interface Grid</p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-ping" />
                <span className="text-xs font-mono text-emerald-400">CORE ONLINE</span>
              </div>
            </div>

            {/* Outage Matrix Table */}
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs font-mono">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-400 text-[11px]">
                    <th className="pb-2.5 font-sans font-semibold">PSD2 API Endpoint</th>
                    <th className="pb-2.5 font-sans font-semibold">SLA Latency</th>
                    <th className="pb-2.5 font-sans font-semibold">90-Day Uptime</th>
                    <th className="pb-2.5 font-sans font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {psd2Matrix.map((item, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30 transition-colors">
                      <td className="py-3 text-slate-200 font-semibold">{item.endpoint}</td>
                      <td className="py-3">
                        <span className={item.currentLatencyMs > item.slaTargetMs ? 'text-rose-400 font-bold' : 'text-emerald-400'}>
                          {item.currentLatencyMs}ms
                        </span>
                        <span className="text-slate-500 text-[10px]"> / {item.slaTargetMs}ms</span>
                      </td>
                      <td className="py-3 text-slate-300">{item.uptime90d}%</td>
                      <td className="py-3">
                        {item.outageStatus === 'NOMINAL' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-emerald-400 bg-emerald-950/60 border border-emerald-500/40 rounded">
                            NOMINAL
                          </span>
                        )}
                        {item.outageStatus === 'DEGRADED' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-amber-400 bg-amber-950/60 border border-amber-500/40 rounded animate-pulse">
                            DEGRADED
                          </span>
                        )}
                        {item.outageStatus === 'OUTAGE_FALLBACK' && (
                          <span className="px-2 py-0.5 text-[10px] font-bold text-rose-400 bg-rose-950/60 border border-rose-500/40 rounded animate-pulse">
                            FALLBACK ACTIVE
                          </span>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            {/* Fallback Toggle Switch */}
            <div className="mt-4 pt-4 border-t border-slate-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <AlertTriangle className={`w-5 h-5 ${telemetry.psd2FallbackActive ? 'text-rose-400' : 'text-slate-500'}`} />
                <div>
                  <span className="text-xs font-bold text-slate-200">Force PSD2 Emergency Contingency Fallback Mode</span>
                  <p className="text-[11px] text-slate-400">Routes AISP/PISP traffic via sovereign corporate online fallback UI</p>
                </div>
              </div>
              <button
                onClick={() => {
                  setTelemetry((p) => ({ ...p, psd2FallbackActive: !p.psd2FallbackActive }));
                  addLog(`CONTINGENCY: Fallback mode toggled to: ${!telemetry.psd2FallbackActive ? 'ACTIVATED' : 'DEACTIVATED'}`);
                }}
                className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all ${
                  telemetry.psd2FallbackActive
                    ? 'bg-rose-600 text-white shadow-[0_0_15px_rgba(225,29,72,0.4)]'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                {telemetry.psd2FallbackActive ? 'FALLBACK ENGAGED' : 'ENGAGE FALLBACK'}
              </button>
            </div>
          </div>

          {/* Card: Live Synthetic clientDetails Inspection & Injection Console */}
          <div className="bg-[#0D121C]/90 border border-slate-800 hover:border-slate-700 rounded-2xl p-6 shadow-xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-slate-800/80 pb-4 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-lg bg-[#D4AF37]/10 border border-[#D4AF37]/30 text-[#D4AF37]">
                  <Terminal className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-white tracking-wide uppercase">ClientDetails Header Injection Payload</h2>
                  <p className="text-[11px] text-slate-400">Live JSON Payload Transmitted with PSD2 Telemetry Requests</p>
                </div>
              </div>
              <button
                onClick={handleInjectTelemetryHeader}
                disabled={isInjecting}
                className="px-4 py-1.5 rounded-xl border border-[#D4AF37]/60 bg-[#D4AF37] hover:bg-[#B8860B] text-black font-extrabold text-xs uppercase tracking-wider transition-all duration-150 flex items-center gap-1.5 shadow-[0_0_15px_rgba(212,175,55,0.3)] disabled:opacity-50"
              >
                <Send className="w-3.5 h-3.5" />
                {isInjecting ? 'Injecting...' : 'Inject Headers'}
              </button>
            </div>

            {/* Code Mirror Style View */}
            <div className="relative">
              <pre className="p-4 bg-black/80 rounded-xl border border-slate-800 text-emerald-400 text-xs font-mono overflow-x-auto max-h-64 leading-relaxed scrollbar-thin scrollbar-thumb-slate-800">
                {simulatedHeadersJson}
              </pre>
            </div>
          </div>

          {/* Card: Sovereign Audit Logs */}
          <div className="bg-[#0D121C]/90 border border-slate-800 rounded-2xl p-4 shadow-xl backdrop-blur-xl">
            <div className="flex items-center gap-2 text-slate-400 text-xs font-bold uppercase tracking-wider mb-2">
              <Activity className="w-4 h-4 text-[#D4AF37]" />
              Sovereign Telemetry Event Stream
            </div>
            <div className="space-y-1 font-mono text-[11px] text-slate-300 max-h-28 overflow-y-auto">
              {auditLogs.map((log, i) => (
                <div key={i} className="leading-tight flex items-start gap-1.5">
                  <span className="text-slate-600 select-none">&gt;</span>
                  <span className={i === 0 ? 'text-[#D4AF37] font-semibold' : 'text-slate-400'}>{log}</span>
                </div>
              ))}
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default CitiOutageTelemetryGateway;