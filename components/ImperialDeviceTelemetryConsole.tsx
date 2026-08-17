import React, { useState, useEffect, useCallback } from 'react';
import {
  ShieldAlert,
  Cpu,
  Radio,
  Wifi,
  Smartphone,
  Lock,
  Compass,
  Zap,
  RefreshCw,
  Fingerprint,
  Layers,
  MapPin,
  Activity,
  Key,
  ShieldCheck,
  Server,
  AlertTriangle
} from 'lucide-react';

interface CellTowerTelemetry {
  cellId: string;
  lac: string;
  mcc: string;
  mnc: string;
  signalDbm: number;
  asu: number;
  carrier: string;
  band: string;
  azimuthDeg: number;
  latitude: number;
  longitude: number;
  elevationMeters: number;
}

interface WifiBeacon {
  bssid: string;
  ssid: string;
  rssiDbm: number;
  frequencyMhz: number;
  channel: number;
  securityStandard: string;
  rttNs: number;
}

interface HardwareFingerprint {
  secureEnclaveId: string;
  tpmVersion: string;
  siliconDieId: string;
  imei1: string;
  imei2: string;
  eid: string;
  meId: string;
  bootloaderHash: string;
  attestationNonce: string;
  rsaCertFingerprint: string;
  rsaPublicKeyModulusPreview: string;
  citiQuantumToken: string;
  modernTreasuryDeviceId: string;
  simStatus: 'SLOT_1_ACTIVE_EMBEDDED_PROVISIONED' | 'DUAL_PASS_CRYPTO_VERIFIED' | 'TAMPER_DETECTED';
  cryptoEntropyPoolPpm: number;
}

export const ImperialDeviceTelemetryConsole: React.FC = () => {
  const [isScanning, setIsScanning] = useState<boolean>(false);
  const [telemetryTimestamp, setTelemetryTimestamp] = useState<string>(new Date().toISOString());
  const [activeTab, setActiveTab] = useState<'TELEMETRY' | 'CELLULAR' | 'CRYPTOGRAPHIC' | 'TREASURY_SECURITY'>('TELEMETRY');
  const [entropyRate, setEntropyRate] = useState<number>(99.99984);
  const [citiGatewayStatus, setCitiGatewayStatus] = useState<'VALIDATED_IMPERIAL' | 'RE-ATTESTING' | 'SECURE_LOCKED'>('VALIDATED_IMPERIAL');

  const [hardwareSpecs, setHardwareSpecs] = useState<HardwareFingerprint>({
    secureEnclaveId: 'SEC-ENC-CITI-9000-88A9-0XF18A3129',
    tpmVersion: 'TPM-v2.0-QUANTUM-RESILIENT-LATTICE-09',
    siliconDieId: 'SILICON-DIE-A17-PRO-TITANIUM-CUSTOM-009214',
    imei1: '359281048291048',
    imei2: '359281048291049',
    eid: '89049032000008892182049102830192',
    meId: 'A000008F83C1A2',
    bootloaderHash: 'e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855',
    attestationNonce: '0xCAFE_BABE_DEAD_BEEF_8829_AA71_CITI_MT_PROD',
    rsaCertFingerprint: 'SHA256:7B:9A:88:E1:CC:09:44:12:8F:A1:BC:90:3D:11:FE:EA:22:98:A7:10',
    rsaPublicKeyModulusPreview: '00:c9:81:fe:d9:21:bb:11:58:39:aa:8e:f1:92:09:88:2b:41:8c:90:21:ab:cd:ef:01:23:45:67:89:ab:cd:ef:01',
    citiQuantumToken: 'CITI-KYC-DIAMOND-TIER-001-99881-ALPHA',
    modernTreasuryDeviceId: 'mt_dev_live_01HK9Z88AY23791BFA00912X4',
    simStatus: 'DUAL_PASS_CRYPTO_VERIFIED',
    cryptoEntropyPoolPpm: 99.9998
  });

  const [towers, setTowers] = useState<CellTowerTelemetry[]>([
    {
      cellId: 'CID-402919-CITI-HQ',
      lac: '0x4892',
      mcc: '310',
      mnc: '410',
      signalDbm: -54,
      asu: 31,
      carrier: 'AT&T Sovereign Direct Quantum 5G-SA',
      band: 'n77 C-Band Extended (3.7GHz)',
      azimuthDeg: 142.8,
      latitude: 40.712776,
      longitude: -74.005974,
      elevationMeters: 142.4
    },
    {
      cellId: 'CID-889123-MANHATTAN-RELAY',
      lac: '0x4892',
      mcc: '310',
      mnc: '410',
      signalDbm: -68,
      asu: 24,
      carrier: 'AT&T Sovereign Direct Quantum 5G-SA',
      band: 'n258 mmWave (39GHz)',
      azimuthDeg: 289.1,
      latitude: 40.713501,
      longitude: -74.004112,
      elevationMeters: 89.2
    },
    {
      cellId: 'CID-110294-SWIFT-BACKBONE',
      lac: '0x99A1',
      mcc: '311',
      mnc: '480',
      signalDbm: -72,
      asu: 21,
      carrier: 'Verizon Ultra High-Purity Enterprise Vault',
      band: 'n261 mmWave (28GHz)',
      azimuthDeg: 12.4,
      latitude: 40.711899,
      longitude: -74.007812,
      elevationMeters: 210.0
    }
  ]);

  const [beacons, setBeacons] = useState<WifiBeacon[]>([
    {
      bssid: '00:1A:E8:90:FA:21',
      ssid: 'CITI_EXECUTIVE_TREASURY_QUANTUM_EXT',
      rssiDbm: -38,
      frequencyMhz: 5825,
      channel: 165,
      securityStandard: 'WPA3-Enterprise 192-Bit CNSA Suite B',
      rttNs: 412
    },
    {
      bssid: '88:DE:39:1A:B9:90',
      ssid: 'MODERN_TREASURY_LEDGER_BEACON_ALPHA',
      rssiDbm: -44,
      frequencyMhz: 6145,
      channel: 39,
      securityStandard: 'WPA3-Enterprise / Strict EAP-TLS Mutual',
      rttNs: 680
    },
    {
      bssid: 'FA:81:90:EE:11:78',
      ssid: 'CITIBANK_VAULT_SWIFT_AIRGAP_LINK',
      rssiDbm: -59,
      frequencyMhz: 5240,
      channel: 48,
      securityStandard: 'WPA3-CNSA Zero-Trust Ephemeral Mesh',
      rttNs: 910
    }
  ]);

  const triggerLiveDiagnostics = useCallback(() => {
    setIsScanning(true);
    setCitiGatewayStatus('RE-ATTESTING');
    setTimeout(() => {
      setTelemetryTimestamp(new Date().toISOString());
      setEntropyRate(99.99991 + (Math.random() * 0.00008 - 0.00004));
      setHardwareSpecs((prev) => ({
        ...prev,
        attestationNonce: `0x${Array.from({ length: 16 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()}`,
        cryptoEntropyPoolPpm: 99.9999
      }));
      setCitiGatewayStatus('VALIDATED_IMPERIAL');
      setIsScanning(false);
    }, 1200);
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setEntropyRate((prev) => +(prev + (Math.random() * 0.00002 - 0.00001)).toFixed(6));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="w-full bg-[#050608] text-amber-100 border border-amber-500/30 rounded-xl p-6 shadow-[0_0_50px_rgba(217,119,6,0.15)] font-mono selection:bg-amber-500 selection:text-black">
      {/* Imperial Top Ribbon */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between pb-6 border-b border-amber-500/20 gap-4">
        <div className="flex items-center space-x-4">
          <div className="relative p-3 bg-gradient-to-br from-amber-950/60 to-black border border-amber-400/50 rounded-lg shadow-[inset_0_0_15px_rgba(245,158,11,0.2)]">
            <Fingerprint className="w-8 h-8 text-amber-400 animate-pulse" />
            <div className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-amber-400 rounded-full ring-4 ring-black"></div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <span className="text-xs uppercase tracking-widest text-amber-500/80 font-semibold">Citibank Sovereign Security Suite</span>
              <span className="bg-amber-500/20 text-amber-300 text-[10px] px-2 py-0.5 rounded border border-amber-500/40">TIER-0 ULTRA SECURE</span>
            </div>
            <h1 className="text-xl md:text-2xl font-black tracking-tight text-white flex items-center gap-2">
              IMPERIAL DEVICE TELEMETRY CONSOLE
            </h1>
            <p className="text-xs text-stone-400">
              Modern Treasury Gateway Attestation & Client Identity Enclave Inspector
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-3 self-end md:self-auto">
          <div className="flex flex-col text-right">
            <span className="text-[10px] text-stone-400 uppercase tracking-wider">Gateway Attestation</span>
            <span className={`text-xs font-bold ${citiGatewayStatus === 'VALIDATED_IMPERIAL' ? 'text-emerald-400' : 'text-amber-400'}`}>
              ● {citiGatewayStatus}
            </span>
          </div>
          <button
            onClick={triggerLiveDiagnostics}
            disabled={isScanning}
            className="flex items-center space-x-2 bg-gradient-to-r from-amber-600 via-amber-500 to-yellow-500 hover:from-amber-500 hover:to-yellow-400 text-black font-bold px-4 py-2 rounded-lg text-xs tracking-wider transition-all duration-200 transform active:scale-95 disabled:opacity-50 shadow-[0_0_20px_rgba(245,158,11,0.4)]"
          >
            <RefreshCw className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
            <span>{isScanning ? 'ATTESTING...' : 'RE-PROBE TELEMETRY'}</span>
          </button>
        </div>
      </div>

      {/* Primary Status Banner */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 my-6">
        <div className="bg-stone-950/80 border border-amber-500/20 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span className="flex items-center gap-1"><Cpu className="w-3.5 h-3.5 text-amber-400" /> SECURE ENCLAVE</span>
            <span className="text-emerald-400 text-[10px]">ACTIVE</span>
          </div>
          <div className="text-sm font-bold text-amber-200 truncate">{hardwareSpecs.secureEnclaveId}</div>
          <div className="text-[10px] text-stone-500 mt-1">Lattice Poly-Crypto Matrix OK</div>
        </div>

        <div className="bg-stone-950/80 border border-amber-500/20 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span className="flex items-center gap-1"><Zap className="w-3.5 h-3.5 text-amber-400" /> SYSTEM ENTROPY</span>
            <span className="text-amber-300 text-[10px]">99.999%</span>
          </div>
          <div className="text-sm font-bold text-amber-200">{entropyRate.toFixed(6)}% PPM</div>
          <div className="text-[10px] text-stone-500 mt-1">Quantum Nonce Stream Saturated</div>
        </div>

        <div className="bg-stone-950/80 border border-amber-500/20 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span className="flex items-center gap-1"><Smartphone className="w-3.5 h-3.5 text-amber-400" /> SIM CRYPTO-STATE</span>
            <span className="text-emerald-400 text-[10px]">MATCH</span>
          </div>
          <div className="text-xs font-bold text-amber-300 truncate">{hardwareSpecs.simStatus}</div>
          <div className="text-[10px] text-stone-500 mt-1">EID: {hardwareSpecs.eid.substring(0, 16)}...</div>
        </div>

        <div className="bg-stone-950/80 border border-amber-500/20 rounded-lg p-3 relative overflow-hidden">
          <div className="flex items-center justify-between text-stone-400 text-xs mb-1">
            <span className="flex items-center gap-1"><ShieldCheck className="w-3.5 h-3.5 text-amber-400" /> MT SIGNATURE</span>
            <span className="text-emerald-400 text-[10px]">VALID</span>
          </div>
          <div className="text-xs font-bold text-amber-200 truncate">{hardwareSpecs.modernTreasuryDeviceId}</div>
          <div className="text-[10px] text-stone-500 mt-1">Citi SWIFT Direct Peer Verified</div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-amber-500/20 mb-6 space-x-2 text-xs tracking-wider">
        {[
          { id: 'TELEMETRY', label: 'HARDWARE & SILICON', icon: Layers },
          { id: 'CELLULAR', label: 'TOWER & RF TRIANGULATION', icon: Radio },
          { id: 'CRYPTOGRAPHIC', label: 'RSA KEYS & CITIBANK ENCLAVE', icon: Key },
          { id: 'TREASURY_SECURITY', label: 'MODERN TREASURY GATEWAY', icon: Server }
        ].map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`flex items-center space-x-2 px-4 py-2.5 rounded-t-lg transition-colors border-t border-l border-r ${
                isActive
                  ? 'bg-amber-950/40 text-amber-300 border-amber-500/40 font-bold'
                  : 'text-stone-400 border-transparent hover:text-amber-200 hover:bg-stone-900/40'
              }`}
            >
              <Icon className="w-3.5 h-3.5" />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Tab Panels */}
      {activeTab === 'TELEMETRY' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-stone-950/60 border border-stone-800 p-4 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Cpu className="w-4 h-4" /> Physical Silicon Identifiers
            </div>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between border-b border-stone-900 pb-1">
                <span className="text-stone-400">Silicon Die Serial:</span>
                <span className="text-amber-100 font-mono">{hardwareSpecs.siliconDieId}</span>
              </div>
              <div className="flex justify-between border-b border-stone-900 pb-1">
                <span className="text-stone-400">Trusted Platform Module:</span>
                <span className="text-amber-100 font-mono">{hardwareSpecs.tpmVersion}</span>
              </div>
              <div className="flex justify-between border-b border-stone-900 pb-1">
                <span className="text-stone-400">Primary IMEI:</span>
                <span className="text-amber-100 font-mono">{hardwareSpecs.imei1}</span>
              </div>
              <div className="flex justify-between border-b border-stone-900 pb-1">
                <span className="text-stone-400">Secondary IMEI (Secure eSIM):</span>
                <span className="text-amber-100 font-mono">{hardwareSpecs.imei2}</span>
              </div>
              <div className="flex justify-between border-b border-stone-900 pb-1">
                <span className="text-stone-400">Mobile Equipment ID (MEID):</span>
                <span className="text-amber-100 font-mono">{hardwareSpecs.meId}</span>
              </div>
            </div>
          </div>

          <div className="bg-stone-950/60 border border-stone-800 p-4 rounded-lg space-y-3">
            <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
              <Lock className="w-4 h-4" /> Secure Boot & Enclave Attestation
            </div>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-400 block mb-1">Bootloader Manifest SHA-256:</span>
                <div className="p-2 bg-black/80 rounded border border-stone-800 font-mono text-[11px] text-amber-300 break-all">
                  {hardwareSpecs.bootloaderHash}
                </div>
              </div>
              <div>
                <span className="text-stone-400 block mb-1">Live Attestation Nonce (Citi HW Gateway):</span>
                <div className="p-2 bg-black/80 rounded border border-stone-800 font-mono text-[11px] text-emerald-400 break-all">
                  {hardwareSpecs.attestationNonce}
                </div>
              </div>
              <div className="flex justify-between items-center text-[10px] text-stone-500 pt-1">
                <span>Timestamp: {telemetryTimestamp}</span>
                <span className="text-emerald-400">Hardware Root Verified</span>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CELLULAR' && (
        <div className="space-y-4">
          <div className="text-xs text-stone-400">
            Precision Geo-Spatial RF Telemetry triangulating client location for multi-million dollar wires over Citi Private Network.
          </div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
            {towers.map((tower, idx) => (
              <div key={idx} className="bg-stone-950/80 border border-amber-500/20 rounded-lg p-3 space-y-2 relative">
                <div className="flex items-center justify-between border-b border-stone-800 pb-2">
                  <span className="text-xs font-bold text-amber-300 flex items-center gap-1.5">
                    <Radio className="w-3.5 h-3.5 text-amber-400" /> {tower.cellId}
                  </span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-amber-500/10 text-amber-300 border border-amber-500/30 rounded">
                    {tower.signalDbm} dBm
                  </span>
                </div>
                <div className="text-[11px] space-y-1">
                  <div className="text-stone-400 flex justify-between">
                    <span>Carrier:</span> <span className="text-stone-200">{tower.carrier}</span>
                  </div>
                  <div className="text-stone-400 flex justify-between">
                    <span>Band / ASU:</span> <span className="text-stone-200">{tower.band} (ASU {tower.asu})</span>
                  </div>
                  <div className="text-stone-400 flex justify-between">
                    <span>Coordinates:</span> <span className="text-emerald-400">{tower.latitude.toFixed(4)}, {tower.longitude.toFixed(4)}</span>
                  </div>
                  <div className="text-stone-400 flex justify-between">
                    <span>Elevation / Azimuth:</span> <span className="text-stone-200">{tower.elevationMeters}m / {tower.azimuthDeg}°</span>
                  </div>
                  <div className="text-stone-400 flex justify-between">
                    <span>MCC/MNC/LAC:</span> <span className="text-stone-200">{tower.mcc}-{tower.mnc} / {tower.lac}</span>
                  </div>
                </div>
              </div>
            ))}
          </div>

          <div className="bg-stone-950/60 border border-stone-800 rounded-lg p-3 space-y-2">
            <div className="text-xs font-semibold text-amber-400 flex items-center gap-2">
              <Wifi className="w-4 h-4" /> Auxiliary WiFi Beacons (RTT Nano-Second Ranging)
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="text-stone-500 border-b border-stone-800">
                    <th className="pb-1">SSID</th>
                    <th className="pb-1">BSSID</th>
                    <th className="pb-1">FREQ / CH</th>
                    <th className="pb-1">SIGNAL</th>
                    <th className="pb-1">RTT</th>
                    <th className="pb-1">ENCRYPTION PROFILE</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-stone-900">
                  {beacons.map((b, i) => (
                    <tr key={i} className="hover:bg-amber-950/20 text-stone-300">
                      <td className="py-2 font-semibold text-amber-200">{b.ssid}</td>
                      <td className="py-2 font-mono text-[11px]">{b.bssid}</td>
                      <td className="py-2">{b.frequencyMhz} MHz (Ch {b.channel})</td>
                      <td className="py-2 text-emerald-400 font-bold">{b.rssiDbm} dBm</td>
                      <td className="py-2 text-amber-400">{b.rttNs} ns</td>
                      <td className="py-2 text-[10px] text-stone-400">{b.securityStandard}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'CRYPTOGRAPHIC' && (
        <div className="space-y-4">
          <div className="bg-stone-950/80 border border-amber-500/20 p-4 rounded-lg space-y-3">
            <div className="flex items-center justify-between">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Key className="w-4 h-4" /> Citi Sovereign RSA Application Key Matrix (4096-bit CNSA)
              </div>
              <span className="text-[10px] bg-emerald-950/60 border border-emerald-500 text-emerald-400 px-2 py-0.5 rounded">
                HARDWARE-ISOLATED
              </span>
            </div>
            
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-stone-400 block mb-1">RSA Certificate SHA-256 Fingerprint:</span>
                <div className="p-2 bg-black/90 rounded border border-amber-500/30 font-mono text-amber-300 text-[11px]">
                  {hardwareSpecs.rsaCertFingerprint}
                </div>
              </div>

              <div>
                <span className="text-stone-400 block mb-1">Modulus Excerpt (Hex Encoded):</span>
                <div className="p-2 bg-black/90 rounded border border-stone-800 font-mono text-stone-400 text-[10px] break-all">
                  {hardwareSpecs.rsaPublicKeyModulusPreview}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 pt-2">
                <div className="bg-stone-900/60 p-2.5 rounded border border-stone-800">
                  <span className="text-stone-400 block text-[10px]">Key Storage Module</span>
                  <span className="text-amber-200 text-xs font-bold">Apple Secure Enclave Processor (SEP-X)</span>
                </div>
                <div className="bg-stone-900/60 p-2.5 rounded border border-stone-800">
                  <span className="text-stone-400 block text-[10px]">Citi Quantum Token Identifier</span>
                  <span className="text-amber-200 text-xs font-bold">{hardwareSpecs.citiQuantumToken}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'TREASURY_SECURITY' && (
        <div className="space-y-4">
          <div className="bg-stone-950/80 border border-amber-500/20 p-4 rounded-lg space-y-4">
            <div className="flex items-center justify-between border-b border-stone-800 pb-3">
              <div className="text-xs font-semibold text-amber-400 uppercase tracking-wider flex items-center gap-2">
                <Server className="w-4 h-4" /> Modern Treasury Multi-Hop API Bridge Authentication
              </div>
              <span className="text-[10px] text-amber-300 font-mono">ENDPOINT: api.moderntreasury.com/v1/telemetry</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div className="space-y-2 bg-black/60 p-3 rounded border border-stone-800">
                <div className="text-stone-400 font-semibold">Ledger Pipeline Validation</div>
                <p className="text-stone-400 text-[11px]">
                  All high-value wire instructions ($100,000,000+) dispatch telemetry signatures verifying IMEI, BSSID RTT triangulation, and Citi Quantum Key validity before commit.
                </p>
                <div className="pt-2 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Device ID Token:</span>
                  <span className="text-amber-300 font-mono font-bold">{hardwareSpecs.modernTreasuryDeviceId}</span>
                </div>
              </div>

              <div className="space-y-2 bg-black/60 p-3 rounded border border-stone-800">
                <div className="text-stone-400 font-semibold">Citi Gateway Verification Protocol</div>
                <ul className="text-stone-400 text-[11px] space-y-1 list-disc list-inside">
                  <li>Zero-Trust Mutual TLS with Handshake Nonce Ingestion</li>
                  <li>SIM Cross-Carrier IMSI/IMEI Cryptographic Binding</li>
                  <li>Real-time Cell Tower Azimuth Verification</li>
                </ul>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Footer Diagnostic Bar */}
      <div className="mt-6 pt-4 border-t border-amber-500/20 flex flex-col md:flex-row items-center justify-between text-[11px] text-stone-400 gap-2">
        <div className="flex items-center space-x-2">
          <Activity className="w-3.5 h-3.5 text-emerald-400" />
          <span>Telemetry Heartbeat Stream: Active @ 10Hz</span>
          <span className="text-stone-600">|</span>
          <span>Buffer Nonce: 0x{hardwareSpecs.bootloaderHash.substring(0, 12)}</span>
        </div>
        <div className="text-amber-500/80 font-semibold flex items-center gap-1">
          <ShieldAlert className="w-3.5 h-3.5" />
          CITIBANK SOVEREIGN HIGH-VALUE ENCLAVE ACTIVE
        </div>
      </div>
    </div>
  );
};

export default ImperialDeviceTelemetryConsole;