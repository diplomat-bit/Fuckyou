import React, { useState, useEffect, useId } from 'react';
import {
  Crown,
  ShieldCheck,
  Radio,
  Sparkles,
  Cpu,
  Send,
  Terminal,
  CheckCircle2,
  Lock,
  FileText,
  Globe2,
  Zap,
  RefreshCw,
  AlertTriangle,
  Key,
  Satellite,
  Layers,
  Award,
  Hash,
  ChevronRight,
  ShieldAlert,
  ArrowUpRight,
  Copy,
  Check
} from 'lucide-react';

interface OutageIncident {
  id: string;
  codename: string;
  system: string;
  affectedRails: string[];
  severity: 'CLASS_1_CATASTROPHIC' | 'CLASS_2_IMPERIAL_DEVIATION' | 'CLASS_3_VELOCITY_LATENCY';
  impactedAUM: string;
  estimatedResolution: string;
  originNode: string;
  citibankCorrelationId: string;
  modernTreasuryLedgerId: string;
  timestamp: string;
}

interface DispatchChannel {
  id: string;
  name: string;
  protocol: string;
  encryption: string;
  latency: string;
  icon: React.ElementType;
  status: 'ONLINE' | 'ARMED' | 'STANDBY';
}

interface DispatchLog {
  id: string;
  timestamp: string;
  tier: string;
  recipientsCount: number;
  channels: string[];
  signatureHash: string;
  quantumSeal: string;
  status: 'DELIVERED_ACKNOWLEDGED' | 'IN_TRANSIT_ORBITAL' | 'VERIFIED_ENCLAVE';
}

export const ImperialOutageNotificationHub: React.FC = () => {
  const compId = useId();

  // Mock Active Incidents
  const incidents: OutageIncident[] = [
    {
      id: 'INC-SOV-8891-X',
      codename: 'PROJECT AETHELRED // CITIGROUP INTER-LEDGER DESYNC',
      system: 'Citi Velocity Ultra-High-Value Clearing & Settlement Rail',
      affectedRails: ['SWIFT FedNow Sovereign Gateway', 'CHIPS Direct Settlement', 'Modern Treasury Dual-Custody Ledger'],
      severity: 'CLASS_2_IMPERIAL_DEVIATION',
      impactedAUM: '$84,290,000,000.00 USD',
      estimatedResolution: '< 14 Minutes (Quantum Failover Initiated)',
      originNode: 'ZURICH-VAULT-PRIMARY-09',
      citibankCorrelationId: 'CITI-NY-9910-AUM-773',
      modernTreasuryLedgerId: 'led_track_9981a82bcfe0912',
      timestamp: new Date().toISOString()
    },
    {
      id: 'INC-QNT-0042-Z',
      codename: 'CHRONOS SHIELD // CROSS-BORDER ATOMIC SWAP HOLD',
      system: 'Modern Treasury Sovereign Liquidity Engine & Citi Private Enclave',
      affectedRails: ['Fedwire High-Priority RTGS', 'Hong Kong Monetary Authority CHATS Bridge'],
      severity: 'CLASS_3_VELOCITY_LATENCY',
      impactedAUM: '$218,500,000,000.00 USD',
      estimatedResolution: '< 6 Minutes (Re-routing via Singapore Orbital)',
      originNode: 'SINGAPORE-APEX-DATA-01',
      citibankCorrelationId: 'CITI-SG-4402-SOV-102',
      modernTreasuryLedgerId: 'led_dyn_881903fa89bca11',
      timestamp: new Date(Date.now() - 3600000).toISOString()
    }
  ];

  const channels: DispatchChannel[] = [
    { id: 'sat', name: 'Orbital Iridium Stratum-1 Satellite', protocol: 'Mil-STD 188-164A', encryption: 'Post-Quantum Dilithium-5', latency: '42ms', icon: Satellite, status: 'ONLINE' },
    { id: 'bbg', name: 'Bloomberg B-PIPE Sovereign Wire', protocol: 'Direct Dark Fiber Feed', encryption: 'AES-GCM-512 Prime', latency: '2.1ms', icon: Terminal, status: 'ARMED' },
    { id: 'swift', name: 'SWIFT MT096 / Pacs.002 VIP Rail', protocol: 'ISO 20022 High-Priority', encryption: 'Hardware HSM Signed', latency: '12ms', icon: ShieldCheck, status: 'ONLINE' },
    { id: 'signal', name: 'Imperial Concierge Cryptographic Pager', protocol: 'Zero-Knowledge Relay v4', encryption: 'Ed25519 Curve448 Dual-Key', latency: '110ms', icon: Radio, status: 'ONLINE' }
  ];

  const [selectedIncident, setSelectedIncident] = useState<OutageIncident>(incidents[0]);
  const [targetTier, setTargetTier] = useState<'TIER_0_SOVEREIGN' | 'TIER_1_FAMILY_OFFICE' | 'TIER_VIP_INSTITUTIONAL'>('TIER_0_SOVEREIGN');
  const [briefTone, setBriefTone] = useState<'SOVEREIGN_DIPLOMATIC' | 'ASSURED_TACTICAL' | 'EXECUTIVE_MINIMALIST'>('SOVEREIGN_DIPLOMATIC');
  const [isSynthesizing, setIsSynthesizing] = useState<boolean>(false);
  const [executiveBrief, setExecutiveBrief] = useState<string>('');
  const [selectedChannels, setSelectedChannels] = useState<string[]>(['sat', 'bbg', 'swift', 'signal']);
  const [isBroadcasting, setIsBroadcasting] = useState<boolean>(false);
  const [broadcastProgress, setBroadcastProgress] = useState<number>(0);
  const [broadcastComplete, setBroadcastComplete] = useState<boolean>(false);
  const [copiedSig, setCopiedSig] = useState<boolean>(false);
  const [quantumSignature, setQuantumSignature] = useState<string>('');

  // Initial executive brief generation
  useEffect(() => {
    generateBrief(selectedIncident, targetTier, briefTone);
  }, [selectedIncident, targetTier, briefTone]);

  const generateBrief = (incident: OutageIncident, tier: string, tone: string) => {
    setIsSynthesizing(true);
    setTimeout(() => {
      let tierLabel = 'His Serene Highness & Sovereign Trustees';
      if (tier === 'TIER_1_FAMILY_OFFICE') tierLabel = 'Principal Family Office Managing Directors';
      if (tier === 'TIER_VIP_INSTITUTIONAL') tierLabel = 'Chief Investment Officers & Treasurers';

      let toneText = '';
      if (tone === 'SOVEREIGN_DIPLOMATIC') {
        toneText = `We write under privileged sovereign protocol to apprise you of an isolated synchronization buffer within our Tier-1 Citibank liquidity bridge and Modern Treasury orchestration grid. All principal capital and off-balance sheet collateral vaults remain 100% physically ring-fenced and cryptographically intact. High-priority redundant failovers are engaging across our Geneva and London sovereign data enclaves.`;
      } else if (tone === 'ASSURED_TACTICAL') {
        toneText = `SYSTEM LATENCY CONCURRENT WITH SCHEDULED LEDGER ARBITRAGE. No capital impairment. Dual-HSM signature routing active. Modern Treasury reconciliation pipelines are operating over fallback Zurich optical conduits. Estimated nominal state restoration in ${incident.estimatedResolution}.`;
      } else {
        toneText = `Citigroup & Modern Treasury joint advisory: Inter-rail latency detected on ${incident.affectedRails.join(', ')}. Principal exposure: ZERO. Capital protection protocols active. Real-time ledger parity will be restored automatically.`;
      }

      const generated = `[PRIVATE & STRICTLY CONFIDENTIAL // IMPERIAL TIER DISPATCH]
ATTN: ${tierLabel}

INCIDENT IDENTIFIER: ${incident.id} (${incident.codename})
CORRELATION HASH: ${incident.citibankCorrelationId} // ${incident.modernTreasuryLedgerId}
AFFECTED LIQUIDITY VOLUME: ${incident.impactedAUM}

EXECUTIVE SUMMARY:
${toneText}

SECURITY & RISK ASSESSMENT:
• Physical Enclave Integrity: 100.000% (No unauthorized egress)
• Modern Treasury Immutable Ledger State: VERIFIED & SEALED
• Citibank Prime Clearing Continuity: Switched to Secondary Hot Standby
• Expected Resolution Timeframe: ${incident.estimatedResolution}

Your dedicated Imperial Sovereign Concierge desk has locked your primary liquidity lines with zero slippage guarantees.`;

      setExecutiveBrief(generated);
      setQuantumSignature(`0x${Array.from({ length: 64 }, () => Math.floor(Math.random() * 16).toString(16)).join('').toUpperCase()}`);
      setIsSynthesizing(false);
    }, 450);
  };

  const handleChannelToggle = (id: string) => {
    if (selectedChannels.includes(id)) {
      setSelectedChannels(selectedChannels.filter(c => c !== id));
    } else {
      setSelectedChannels([...selectedChannels, id]);
    }
  };

  const handleBroadcast = () => {
    setIsBroadcasting(true);
    setBroadcastProgress(0);
    setBroadcastComplete(false);

    const interval = setInterval(() => {
      setBroadcastProgress(prev => {
        if (prev >= 100) {
          clearInterval(interval);
          setIsBroadcasting(false);
          setBroadcastComplete(true);
          return 100;
        }
        return prev + 25;
      });
    }, 300);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedSig(true);
    setTimeout(() => setCopiedSig(false), 2000);
  };

  return (
    <div className="min-h-screen bg-[#050608] text-slate-100 font-sans p-4 md:p-8 selection:bg-amber-500/30 selection:text-amber-200">
      {/* Imperial Gold & Obsidian Header */}
      <header className="border-b border-amber-950/40 pb-6 mb-8 bg-gradient-to-r from-[#090b10] via-[#0d1017] to-[#07080c] rounded-2xl p-6 shadow-2xl border relative overflow-hidden">
        <div className="absolute top-0 right-0 w-96 h-96 bg-amber-600/5 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-10 -left-10 w-72 h-72 bg-emerald-600/5 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="flex items-center gap-4">
            <div className="p-3.5 bg-gradient-to-br from-amber-400/20 via-amber-600/10 to-transparent border border-amber-500/40 rounded-xl shadow-inner shadow-amber-500/20">
              <Crown className="w-8 h-8 text-amber-400 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-3">
                <span className="text-[11px] font-mono tracking-widest text-amber-400 font-semibold uppercase bg-amber-950/60 px-2.5 py-0.5 rounded border border-amber-700/50">
                  CITIBANK PRIVATE BANK × MODERN TREASURY
                </span>
                <span className="text-[10px] font-mono tracking-wider text-emerald-400 bg-emerald-950/50 border border-emerald-800/40 px-2 py-0.5 rounded flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  QUANTUM ENCLAVE LIVE
                </span>
              </div>
              <h1 className="text-2xl md:text-3xl font-serif tracking-tight text-white mt-1">
                Imperial Outage & Crisis Briefing Hub
              </h1>
              <p className="text-sm text-slate-400 font-light">
                Autonomous AI synthesis & cryptographically signed multi-channel dispatch for Sovereign Wealth & Ultra-Prime partners.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 bg-black/40 border border-slate-800/80 p-3 rounded-xl backdrop-blur-md">
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-500">Security Clearance</div>
              <div className="text-xs font-semibold text-amber-300 font-mono">LEVEL 5 // SOVEREIGN PRIVILEGED</div>
            </div>
            <div className="h-8 w-px bg-slate-800" />
            <div className="text-right">
              <div className="text-[10px] font-mono uppercase text-slate-500">Dual HSM Status</div>
              <div className="text-xs font-semibold text-emerald-400 font-mono flex items-center gap-1">
                <Lock className="w-3 h-3" /> VERIFIED
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* Main Grid Architecture */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* Left Column: Telemetry & Active Incident Monitor */}
        <div className="lg:col-span-4 space-y-6">
          
          {/* Active Incidents Panel */}
          <div className="bg-[#0b0d13] border border-slate-800/90 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4 pb-2 border-b border-slate-800/60">
              <div className="flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                <h2 className="text-sm font-semibold tracking-wider uppercase text-slate-200 font-mono">
                  Active Disruption Feeds
                </h2>
              </div>
              <span className="text-[10px] font-mono bg-amber-950/80 text-amber-400 px-2 py-0.5 rounded border border-amber-800/50">
                {incidents.length} MONITORED
              </span>
            </div>

            <div className="space-y-3">
              {incidents.map(inc => (
                <div
                  key={inc.id}
                  onClick={() => setSelectedIncident(inc)}
                  className={`p-3.5 rounded-lg border cursor-pointer transition-all duration-200 ${
                    selectedIncident.id === inc.id
                      ? 'bg-gradient-to-r from-amber-950/30 to-slate-900/80 border-amber-500/60 shadow-lg shadow-amber-950/20'
                      : 'bg-black/30 border-slate-800/60 hover:border-slate-700 hover:bg-slate-900/40'
                  }`}
                >
                  <div className="flex items-center justify-between text-xs mb-1.5">
                    <span className="font-mono font-bold text-amber-300">{inc.id}</span>
                    <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded ${
                      inc.severity === 'CLASS_1_CATASTROPHIC'
                        ? 'bg-rose-950 text-rose-300 border border-rose-800'
                        : 'bg-amber-950 text-amber-300 border border-amber-800'
                    }`}>
                      {inc.severity.replace(/_/g, ' ')}
                    </span>
                  </div>
                  <div className="text-xs font-medium text-slate-200 mb-1">{inc.codename}</div>
                  <div className="text-[11px] text-slate-400 flex items-center gap-1.5 mb-2 font-mono">
                    <Zap className="w-3 h-3 text-amber-400" />
                    {inc.system}
                  </div>
                  <div className="flex justify-between items-center text-[10px] font-mono text-slate-500 pt-2 border-t border-slate-800/50">
                    <span>AUM: <strong className="text-slate-300">{inc.impactedAUM}</strong></span>
                    <span>ETA: <strong className="text-emerald-400">{inc.estimatedResolution}</strong></span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Infrastructure Routing Metadata */}
          <div className="bg-[#0b0d13] border border-slate-800/90 rounded-xl p-5 shadow-xl font-mono text-xs">
            <h3 className="text-xs font-semibold uppercase text-slate-300 tracking-wider mb-4 flex items-center gap-2">
              <Layers className="w-4 h-4 text-sky-400" />
              Sovereign Rail Telemetry
            </h3>
            
            <div className="space-y-2.5">
              <div className="flex justify-between p-2 rounded bg-black/40 border border-slate-800/50">
                <span className="text-slate-500">Citi Correlation Hash:</span>
                <span className="text-amber-300 font-medium">{selectedIncident.citibankCorrelationId}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-black/40 border border-slate-800/50">
                <span className="text-slate-500">Modern Treasury Ledger:</span>
                <span className="text-sky-300 font-medium">{selectedIncident.modernTreasuryLedgerId}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-black/40 border border-slate-800/50">
                <span className="text-slate-500">Origin Physical Node:</span>
                <span className="text-emerald-300 font-medium">{selectedIncident.originNode}</span>
              </div>
              <div className="flex justify-between p-2 rounded bg-black/40 border border-slate-800/50">
                <span className="text-slate-500">Zero-Loss Vault Seal:</span>
                <span className="text-purple-300 font-medium">LOCKED (AIR-GAPPED)</span>
              </div>
            </div>
          </div>

          {/* Dispatch Multi-Channel Protocols */}
          <div className="bg-[#0b0d13] border border-slate-800/90 rounded-xl p-5 shadow-xl">
            <h3 className="text-xs font-semibold uppercase text-slate-300 font-mono tracking-wider mb-3 flex items-center justify-between">
              <span className="flex items-center gap-2">
                <Globe2 className="w-4 h-4 text-emerald-400" />
                Ultra-Secure Push Rails
              </span>
              <span className="text-[10px] text-slate-500 font-mono">{selectedChannels.length}/4 ARMED</span>
            </h3>

            <div className="space-y-2.5">
              {channels.map(chan => {
                const isSelected = selectedChannels.includes(chan.id);
                const IconComponent = chan.icon;
                return (
                  <div
                    key={chan.id}
                    onClick={() => handleChannelToggle(chan.id)}
                    className={`p-3 rounded-lg border flex items-center justify-between cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-slate-900/90 border-emerald-500/50 text-white'
                        : 'bg-black/30 border-slate-800/50 text-slate-500 opacity-60'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div className={`p-1.5 rounded ${isSelected ? 'bg-emerald-500/20 text-emerald-300' : 'bg-slate-800 text-slate-400'}`}>
                        <IconComponent className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-xs font-medium">{chan.name}</div>
                        <div className="text-[10px] font-mono text-slate-400">{chan.protocol} • {chan.encryption}</div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="text-[10px] font-mono text-emerald-400">{chan.latency}</div>
                      <div className={`text-[9px] font-mono font-bold ${isSelected ? 'text-emerald-300' : 'text-slate-600'}`}>
                        {isSelected ? 'ARMED' : 'OFFLINE'}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

        {/* Right Column: AI Briefing Synthesizer & Cryptographic Dispatcher */}
        <div className="lg:col-span-8 space-y-6">

          {/* Synthesizer Control Deck */}
          <div className="bg-[#0b0d13] border border-slate-800/90 rounded-xl p-6 shadow-xl relative">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-5 mb-5 border-b border-slate-800/80 gap-4">
              <div className="flex items-center gap-2.5">
                <Sparkles className="w-5 h-5 text-amber-400" />
                <h2 className="text-base font-serif tracking-tight text-white font-medium">
                  Autonomous AI Crisis Synthesis Engine
                </h2>
              </div>

              <button
                onClick={() => generateBrief(selectedIncident, targetTier, briefTone)}
                disabled={isSynthesizing}
                className="flex items-center gap-2 text-xs font-mono px-3.5 py-1.5 rounded-lg bg-amber-950/40 border border-amber-600/40 hover:bg-amber-900/40 text-amber-300 transition-colors disabled:opacity-50"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isSynthesizing ? 'animate-spin' : ''}`} />
                {isSynthesizing ? 'SYNTHESIZING...' : 'RE-GENERATE MEMO'}
              </button>
            </div>

            {/* Target Tier & Tone Matrix */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
                  Recipient Sovereign Tier
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'TIER_0_SOVEREIGN', label: 'Sovereign ($50B+)' },
                    { id: 'TIER_1_FAMILY_OFFICE', label: 'Family Office ($10B+)' },
                    { id: 'TIER_VIP_INSTITUTIONAL', label: 'Prime Inst. VIP' }
                  ].map(t => (
                    <button
                      key={t.id}
                      onClick={() => setTargetTier(t.id as any)}
                      className={`text-[10px] font-mono py-2 px-2 rounded border transition-all text-center ${
                        targetTier === t.id
                          ? 'bg-amber-500/20 border-amber-500/80 text-amber-200 font-bold'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-slate-400 block mb-2 font-semibold">
                  Diplomatic AI Tone Filter
                </label>
                <div className="grid grid-cols-3 gap-1.5">
                  {[
                    { id: 'SOVEREIGN_DIPLOMATIC', label: 'Diplomatic VIP' },
                    { id: 'ASSURED_TACTICAL', label: 'Tactical Direct' },
                    { id: 'EXECUTIVE_MINIMALIST', label: 'Minimal Legal' }
                  ].map(tone => (
                    <button
                      key={tone.id}
                      onClick={() => setBriefTone(tone.id as any)}
                      className={`text-[10px] font-mono py-2 px-2 rounded border transition-all text-center ${
                        briefTone === tone.id
                          ? 'bg-sky-500/20 border-sky-500/80 text-sky-200 font-bold'
                          : 'bg-black/40 border-slate-800 text-slate-400 hover:border-slate-700'
                      }`}
                    >
                      {tone.label}
                    </button>
                  ))}
                </div>
              </div>
            </div>

            {/* Generated Briefing Terminal Window */}
            <div className="relative rounded-lg border border-slate-700/80 bg-[#050609] overflow-hidden shadow-inner">
              <div className="flex items-center justify-between px-4 py-2 bg-slate-900/80 border-b border-slate-800 text-[11px] font-mono text-slate-400">
                <div className="flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5 text-amber-400" />
                  <span>PREVIEW: EXECUTIVE_MEMO_DISPATCH.asc</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[10px] text-emerald-400">AES-GCM ENCRYPTED</span>
                </div>
              </div>

              <div className="p-5 font-mono text-xs text-slate-300 leading-relaxed whitespace-pre-line min-h-[220px] select-text">
                {isSynthesizing ? (
                  <div className="flex flex-col items-center justify-center py-14 space-y-3">
                    <Cpu className="w-8 h-8 text-amber-400 animate-spin" />
                    <span className="text-xs font-mono text-amber-300 tracking-wider">
                      SYNTHESIZING EXECUTIVE CRISIS BRIEFING VIA CITI PRIVILEGED LLM...
                    </span>
                  </div>
                ) : (
                  executiveBrief
                )}
              </div>
            </div>

            {/* Cryptographic Verification Seal Footer */}
            <div className="mt-4 p-3.5 rounded-lg bg-black/60 border border-slate-800/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-2 text-xs font-mono">
                <Key className="w-4 h-4 text-emerald-400 flex-shrink-0" />
                <div className="overflow-hidden">
                  <div className="text-[10px] text-slate-500 uppercase tracking-wider">Ed25519 Sovereign Quantum Signature</div>
                  <div className="text-emerald-400 font-bold truncate max-w-sm sm:max-w-md md:max-w-lg">
                    {quantumSignature || '0xGENERATING...'}
                  </div>
                </div>
              </div>

              <button
                onClick={() => copyToClipboard(quantumSignature)}
                className="flex items-center gap-1.5 text-[11px] font-mono px-3 py-1.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors self-start sm:self-auto flex-shrink-0"
              >
                {copiedSig ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                {copiedSig ? 'COPIED' : 'COPY HASH'}
              </button>
            </div>

            {/* Dispatch Action Panel */}
            <div className="mt-6 pt-5 border-t border-slate-800/80 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse" />
                <div className="text-xs font-mono text-slate-400">
                  Target Rails: <strong className="text-slate-200">{selectedChannels.length} Channels Armed</strong> | Recipient Vaults: <strong className="text-amber-300">41 Sovereign Entities</strong>
                </div>
              </div>

              <button
                onClick={handleBroadcast}
                disabled={isBroadcasting || isSynthesizing || selectedChannels.length === 0}
                className="w-full sm:w-auto px-8 py-3.5 rounded-xl bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 hover:from-amber-400 hover:to-amber-600 text-black font-semibold font-mono text-xs uppercase tracking-widest transition-all shadow-lg shadow-amber-900/40 hover:shadow-amber-500/20 active:scale-95 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                {isBroadcasting ? (
                  <>
                    <RefreshCw className="w-4 h-4 animate-spin text-black" />
                    BROADCASTING ({broadcastProgress}%)
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 text-black" />
                    DISPATCH CRYPTOGRAPHIC BROADCAST
                  </>
                )}
              </button>
            </div>

            {/* Broadcast Confirmation Banner */}
            {broadcastComplete && (
              <div className="mt-4 p-4 rounded-xl bg-emerald-950/60 border border-emerald-500/60 flex items-center justify-between text-emerald-200 text-xs font-mono animate-in fade-in slide-in-from-top duration-300">
                <div className="flex items-center gap-3">
                  <CheckCircle2 className="w-5 h-5 text-emerald-400 flex-shrink-0" />
                  <div>
                    <span className="font-bold">BROADCAST TRANSMITTED & ACKNOWLEDGED:</span> 41 High-Net-Worth Sovereign Terminals Verified. Modern Treasury Dual-Ledger receipts generated.
                  </div>
                </div>
                <span className="text-[10px] text-emerald-400 border border-emerald-700/50 bg-emerald-900/50 px-2 py-1 rounded">
                  200 OK
                </span>
              </div>
            )}
          </div>

          {/* Historical Cryptographic Dispatch Audit Log */}
          <div className="bg-[#0b0d13] border border-slate-800/90 rounded-xl p-5 shadow-xl">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-semibold uppercase text-slate-300 font-mono tracking-wider flex items-center gap-2">
                <Award className="w-4 h-4 text-amber-400" />
                Verified Imperial Dispatch Archive (Immutable Modern Treasury Rail)
              </h3>
              <span className="text-[10px] font-mono text-slate-500">AIR-GAP SYNCED</span>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left font-mono text-xs">
                <thead>
                  <tr className="border-b border-slate-800 text-slate-500 text-[10px]">
                    <th className="pb-2 font-normal">DISPATCH ID</th>
                    <th className="pb-2 font-normal">TIER / AUDIENCE</th>
                    <th className="pb-2 font-normal">CHANNELS</th>
                    <th className="pb-2 font-normal">SIGNATURE SEAL</th>
                    <th className="pb-2 font-normal text-right">STATUS</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/50">
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-2.5 text-slate-300 font-bold">DSP-9982-SWIFT</td>
                    <td className="py-2.5 text-amber-300">Sovereign Wealth ($50B+)</td>
                    <td className="py-2.5 text-slate-400">Satellite, B-PIPE, SWIFT</td>
                    <td className="py-2.5 text-emerald-400 text-[10px]">0x89F1...B01A</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                        ACKNOWLEDGED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-2.5 text-slate-300 font-bold">DSP-8821-ENCL</td>
                    <td className="py-2.5 text-sky-300">Family Office Tier 1</td>
                    <td className="py-2.5 text-slate-400">Concierge Pager, SWIFT</td>
                    <td className="py-2.5 text-emerald-400 text-[10px]">0x43E0...66C9</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[10px] bg-emerald-950/80 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                        ACKNOWLEDGED
                      </span>
                    </td>
                  </tr>
                  <tr className="hover:bg-slate-900/30">
                    <td className="py-2.5 text-slate-300 font-bold">DSP-7719-ORB</td>
                    <td className="py-2.5 text-purple-300">Citi Prime Institutional</td>
                    <td className="py-2.5 text-slate-400">B-PIPE Direct Wire</td>
                    <td className="py-2.5 text-emerald-400 text-[10px]">0x19A2...FF31</td>
                    <td className="py-2.5 text-right">
                      <span className="text-[10px] bg-slate-800 text-slate-400 border border-slate-700 px-2 py-0.5 rounded">
                        ARCHIVED
                      </span>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};

export default ImperialOutageNotificationHub;