import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Shield, 
  Cpu, 
  RefreshCw, 
  Zap, 
  Lock, 
  Globe, 
  TrendingUp, 
  Coins, 
  ChevronRight, 
  Activity, 
  CheckCircle2, 
  AlertTriangle,
  Layers,
  Compass
} from 'lucide-react';

// --- TYPES & INTERFACES ---
interface LogEntry {
  id: string;
  timestamp: string;
  type: 'info' | 'success' | 'warning' | 'critical' | 'ai';
  message: string;
  node: string;
}

interface SovereignNode {
  id: string;
  name: string;
  location: string;
  latency: string;
  status: 'optimal' | 'degraded' | 'routing';
}

export default function TokenRefreshConsole() {
  // --- STATE ---
  const [accessTokenTimeLeft, setAccessTokenTimeLeft] = useState<number>(600); // 10 minutes in seconds
  const [refreshTokenTimeLeft, setRefreshTokenTimeLeft] = useState<number>(2592000); // 30 days in seconds
  const [isRotating, setIsRotating] = useState<boolean>(false);
  const [aiPredictiveTriggerTime, setAiPredictiveTriggerTime] = useState<number>(142); // AI decides to rotate at 2m 22s remaining
  const [selectedNode, setSelectedNode] = useState<string>('zurich-vault-01');
  const [modernTreasurySync, setModernTreasurySync] = useState<boolean>(true);
  const [sovereignBalance, setSovereignBalance] = useState<string>('12,840,291,405.00');
  const [logs, setLogs] = useState<LogEntry[]>([
    {
      id: '1',
      timestamp: new Date(Date.now() - 15000).toLocaleTimeString(),
      type: 'info',
      message: 'Citibank Private Ledger handshake established via Modern Treasury API.',
      node: 'Zurich Vault 01'
    },
    {
      id: '2',
      timestamp: new Date(Date.now() - 12000).toLocaleTimeString(),
      type: 'ai',
      message: 'AI Predictive Engine initialized. Analyzing sovereign client network jitter (0.04ms).',
      node: 'AI Core'
    },
    {
      id: '3',
      timestamp: new Date(Date.now() - 8000).toLocaleTimeString(),
      type: 'success',
      message: 'Quantum-resistant session keys verified by Citibank Custody Node.',
      node: 'New York Federal'
    }
  ]);

  // --- CONSTANTS ---
  const sovereignNodes: SovereignNode[] = [
    { id: 'zurich-vault-01', name: 'Zurich Vault Alpha', location: 'Switzerland', latency: '0.12 ms', status: 'optimal' },
    { id: 'singapore-sovereign-02', name: 'Singapore Sovereign Node', location: 'Singapore', latency: '0.45 ms', status: 'optimal' },
    { id: 'ny-fed-custody-09', name: 'NY Fed Custody Bridge', location: 'United States', latency: '0.89 ms', status: 'routing' },
    { id: 'london-bullion-04', name: 'London Bullion Ledger', location: 'United Kingdom', latency: '0.22 ms', status: 'optimal' }
  ];

  // --- TIMERS & EFFECTS ---
  useEffect(() => {
    const interval = setInterval(() => {
      // Decrement Access Token
      setAccessTokenTimeLeft((prev) => {
        if (prev <= 1) {
          triggerRotation('Auto-Expiry');
          return 600;
        }
        // AI Predictive Rotation Trigger
        if (prev === aiPredictiveTriggerTime) {
          triggerRotation('AI Predictive Engine');
        }
        return prev - 1;
      });

      // Decrement Refresh Token (simulated faster for visual feedback, but realistic scale)
      setRefreshTokenTimeLeft((prev) => (prev > 10 ? prev - 1 : 2592000));
    }, 1000);

    return () => clearInterval(interval);
  }, [aiPredictiveTriggerTime]);

  // --- LOGGING HELPER ---
  const addLog = (type: LogEntry['type'], message: string, nodeName?: string) => {
    const activeNode = nodeName || sovereignNodes.find(n => n.id === selectedNode)?.name || 'Global';
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      type,
      message,
      node: activeNode
    };
    setLogs(prev => [newLog, ...prev.slice(0, 19)]);
  };

  // --- ROTATION ACTION ---
  const triggerRotation = async (initiatedBy: string) => {
    if (isRotating) return;
    setIsRotating(true);
    addLog('ai', `Initiating pre-emptive token rotation. Triggered by: ${initiatedBy}.`, 'AI Core');
    
    // Step 1: Modern Treasury Ledger Lock
    await new Promise(resolve => setTimeout(resolve, 800));
    if (modernTreasurySync) {
      addLog('info', 'Modern Treasury: Locking ledger state for high-value sovereign balance sync.', 'Modern Treasury');
    }

    // Step 2: Citibank OAuth Handshake
    await new Promise(resolve => setTimeout(resolve, 1000));
    addLog('info', 'Citibank OAuth2: Requesting secure refresh handshake on /oauth2/refresh.', 'Citibank Gateway');

    // Step 3: Cryptographic Verification
    await new Promise(resolve => setTimeout(resolve, 900));
    addLog('success', 'Cryptographic proof verified. Rotating 30-day Refresh Token and 10-minute Access Token.', 'HSM Module');

    // Step 4: Finalize
    setAccessTokenTimeLeft(600);
    // Randomize next AI trigger point to simulate dynamic network condition analysis
    setAiPredictiveTriggerTime(Math.floor(Math.random() * 180) + 60); // between 1m and 4m
    setIsRotating(false);
    addLog('success', 'Session rotation complete. Zero-downtime state preserved for sovereign client.', 'AI Core');
    
    // Slightly fluctuate balance to simulate real-time high-yield interest accrual
    setSovereignBalance((prev) => {
      const current = parseFloat(prev.replace(/,/g, ''));
      const added = Math.random() * 1500.50;
      return (current + added).toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
    });
  };

  // --- FORMATTERS ---
  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  const formatDays = (seconds: number) => {
    const days = Math.floor(seconds / 86400);
    const hours = Math.floor((seconds % 86400) / 3600);
    return `${days}d ${hours}h remaining`;
  };

  // --- CALCULATED VALUES ---
  const accessTokenPercentage = (accessTokenTimeLeft / 600) * 100;
  const activeNodeDetails = sovereignNodes.find(n => n.id === selectedNode);

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-100 font-sans p-6 md:p-12 flex flex-col justify-between selection:bg-amber-500/30 selection:text-amber-200">
      
      {/* BACKGROUND GLOWS & GRID */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#1f1910_1px,transparent_1px),linear-gradient(to_bottom,#1f1910_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute bottom-10 right-1/4 w-96 h-96 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />

      {/* HEADER */}
      <header className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center border-b border-neutral-800/60 pb-8 gap-6">
        <div>
          <div className="flex items-center gap-3">
            <span className="px-2.5 py-1 text-[10px] font-mono tracking-widest uppercase bg-amber-500/10 text-amber-400 border border-amber-500/30 rounded-full">
              Sovereign Wealth Tier
            </span>
            <span className="flex items-center gap-1 text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded-full border border-emerald-500/20">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
              Active Sync
            </span>
          </div>
          <h1 className="text-3xl md:text-4xl font-light tracking-tight mt-3 text-neutral-100">
            CITIBANK <span className="font-semibold text-transparent bg-clip-text bg-gradient-to-r from-amber-400 via-yellow-200 to-emerald-400">AI CUSTODY</span>
          </h1>
          <p className="text-xs text-neutral-400 mt-1 font-mono tracking-wide">
            ENDPOINT: <span className="text-neutral-200">/oauth2/refresh</span> • SECURED BY MODERN TREASURY LEDGERS
          </p>
        </div>

        {/* SOVEREIGN BALANCE DISPLAY */}
        <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-xl p-4 backdrop-blur-md flex items-center gap-4 shadow-[0_4px_30px_rgba(0,0,0,0.4)]">
          <div className="p-3 bg-gradient-to-br from-amber-500/10 to-yellow-500/5 rounded-lg border border-amber-500/20">
            <Coins className="w-6 h-6 text-amber-400" />
          </div>
          <div>
            <p className="text-[10px] font-mono text-neutral-400 uppercase tracking-wider">Sovereign Ledger Balance (USD)</p>
            <p className="text-xl md:text-2xl font-mono font-bold text-neutral-100 tracking-tight">
              ${sovereignBalance}
            </p>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT GRID */}
      <main className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-8 my-12 items-stretch">
        
        {/* LEFT COLUMN: HIGH-FIDELITY COUNTDOWN & ROTATION CONTROLS (7 COLS) */}
        <section className="lg:col-span-7 flex flex-col gap-8">
          
          {/* THE CORE CONSOLE CARD */}
          <div className="bg-gradient-to-b from-neutral-900/80 to-neutral-950/90 border border-neutral-800 rounded-2xl p-6 md:p-8 shadow-[0_20px_50px_rgba(0,0,0,0.5)] backdrop-blur-xl flex flex-col justify-between relative overflow-hidden">
            <div className="absolute top-0 right-0 w-48 h-48 bg-amber-500/5 rounded-full blur-2xl pointer-events-none" />
            
            {/* Card Header */}
            <div className="flex justify-between items-start mb-8">
              <div>
                <h2 className="text-lg font-medium text-neutral-200 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-amber-400" />
                  Token Rotation Engine
                </h2>
                <p className="text-xs text-neutral-400 mt-1">
                  Predictive AI-driven rotation prevents session disruption for high-net-worth sovereign clients.
                </p>
              </div>
              <div className="flex items-center gap-2 bg-neutral-950 px-3 py-1.5 rounded-lg border border-neutral-800">
                <Cpu className="w-4 h-4 text-emerald-400 animate-pulse" />
                <span className="text-[10px] font-mono text-emerald-400 uppercase tracking-wider">AI Active</span>
              </div>
            </div>

            {/* TIMERS CONTAINER */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 my-4">
              
              {/* ACCESS TOKEN COUNTDOWN (10 MINS) */}
              <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-6 flex flex-col items-center justify-center relative group hover:border-amber-500/30 transition-all duration-500">
                <div className="absolute top-3 left-3 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
                  <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">Access Token</span>
                </div>

                {/* Circular Progress */}
                <div className="relative w-36 h-36 flex items-center justify-center my-4">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-neutral-800"
                      strokeWidth="6"
                      fill="transparent"
                    />
                    <circle
                      cx="72"
                      cy="72"
                      r="64"
                      className="stroke-amber-400 transition-all duration-1000 ease-linear"
                      strokeWidth="6"
                      fill="transparent"
                      strokeDasharray={402}
                      strokeDashoffset={402 - (402 * accessTokenPercentage) / 100}
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute flex flex-col items-center justify-center">
                    <span className="text-3xl font-mono font-bold text-neutral-100 tracking-tight">
                      {formatTime(accessTokenTimeLeft)}
                    </span>
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-wider mt-1">
                      Expiry Window
                    </span>
                  </div>
                </div>

                <div className="text-center">
                  <p className="text-xs text-neutral-300 font-mono">
                    AI Rotation Target: <span className="text-amber-400 font-semibold">{formatTime(aiPredictiveTriggerTime)}</span>
                  </p>
                  <p className="text-[10px] text-neutral-500 mt-1">
                    Pre-empts network latency & jitter
                  </p>
                </div>
              </div>

              {/* REFRESH TOKEN LIFESPAN (30 DAYS) */}
              <div className="bg-neutral-950/60 border border-neutral-800/60 rounded-xl p-6 flex flex-col justify-between relative group hover:border-emerald-500/30 transition-all duration-500">
                <div className="flex justify-between items-start">
                  <div className="flex items-center gap-1.5">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-[9px] font-mono text-neutral-400 uppercase tracking-widest">Refresh Token</span>
                  </div>
                  <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                    30 Days Max
                  </span>
                </div>

                <div className="my-6">
                  <p className="text-xs text-neutral-400 font-mono">LIFESPAN REMAINING</p>
                  <p className="text-2xl font-mono font-bold text-neutral-100 mt-1">
                    {formatDays(refreshTokenTimeLeft)}
                  </p>
                  
                  {/* Progress Bar */}
                  <div className="w-full bg-neutral-800 h-1.5 rounded-full mt-4 overflow-hidden">
                    <div 
                      className="bg-gradient-to-r from-emerald-500 to-teal-400 h-full rounded-full" 
                      style={{ width: `${(refreshTokenTimeLeft / 2592000) * 100}%` }}
                    />
                  </div>
                </div>

                <div className="border-t border-neutral-900 pt-3 flex justify-between items-center text-[10px] font-mono text-neutral-400">
                  <span>Status: SECURE</span>
                  <span>Type: ROTATING_REUSE</span>
                </div>
              </div>

            </div>

            {/* INTERACTIVE CONTROLS */}
            <div className="mt-8 pt-6 border-t border-neutral-800/60 flex flex-col sm:flex-row gap-4 items-center justify-between">
              <div className="flex items-center gap-3">
                <label className="relative inline-flex items-center cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={modernTreasurySync} 
                    onChange={(e) => {
                      setModernTreasurySync(e.target.checked);
                      addLog('info', `Modern Treasury Ledger Sync ${e.target.checked ? 'ENABLED' : 'DISABLED'}.`);
                    }}
                    className="sr-only peer" 
                  />
                  <div className="w-11 h-6 bg-neutral-800 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-neutral-400 after:border-neutral-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-amber-500 peer-checked:after:bg-neutral-950" />
                  <span className="ml-3 text-xs font-mono text-neutral-300">Modern Treasury Sync</span>
                </label>
              </div>

              <button
                onClick={() => triggerRotation('Manual Sovereign Override')}
                disabled={isRotating}
                className="w-full sm:w-auto px-6 py-3 bg-gradient-to-r from-amber-500 via-yellow-500 to-amber-600 text-neutral-950 font-mono text-xs font-bold uppercase tracking-wider rounded-xl shadow-[0_4px_20px_rgba(245,158,11,0.2)] hover:shadow-[0_4px_30px_rgba(245,158,11,0.4)] hover:scale-[1.02] active:scale-[0.98] transition-all duration-300 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
              >
                <RefreshCw className={`w-4 h-4 ${isRotating ? 'animate-spin' : ''}`} />
                {isRotating ? 'Rotating Sovereign Keys...' : 'Force AI-Secured Rotation'}
              </button>
            </div>

          </div>

          {/* AI PREDICTIVE INSIGHTS CARD */}
          <div className="bg-neutral-900/40 border border-neutral-800/80 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-medium text-neutral-200 flex items-center gap-2 mb-4">
              <Zap className="w-4 h-4 text-amber-400" />
              AI Predictive Engine Diagnostics
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/40">
                <p className="text-[10px] font-mono text-neutral-400 uppercase">Network Jitter Analysis</p>
                <p className="text-lg font-mono font-semibold text-emerald-400 mt-1">0.024 ms</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Ultra-low latency path active</p>
              </div>
              <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/40">
                <p className="text-[10px] font-mono text-neutral-400 uppercase">Optimal Rotation Window</p>
                <p className="text-lg font-mono font-semibold text-amber-400 mt-1">120s - 180s</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Calculated via machine learning</p>
              </div>
              <div className="bg-neutral-950/50 p-4 rounded-xl border border-neutral-800/40">
                <p className="text-[10px] font-mono text-neutral-400 uppercase">Downtime Probability</p>
                <p className="text-lg font-mono font-semibold text-neutral-100 mt-1">0.00000%</p>
                <p className="text-[9px] text-neutral-500 mt-0.5">Sovereign SLA guaranteed</p>
              </div>
            </div>
          </div>

        </section>

        {/* RIGHT COLUMN: SOVEREIGN NODES & LIVE CRYPTO LOGS (5 COLS) */}
        <section className="lg:col-span-5 flex flex-col gap-8">
          
          {/* SOVEREIGN NODE SELECTOR */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md">
            <h3 className="text-sm font-medium text-neutral-200 flex items-center gap-2 mb-4">
              <Globe className="w-4 h-4 text-amber-400" />
              Sovereign Custody Nodes
            </h3>
            <div className="flex flex-col gap-3">
              {sovereignNodes.map((node) => (
                <button
                  key={node.id}
                  onClick={() => {
                    setSelectedNode(node.id);
                    addLog('info', `Switched active custody routing to ${node.name}.`);
                  }}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-300 flex items-center justify-between ${
                    selectedNode === node.id
                      ? 'bg-amber-500/10 border-amber-500/40 shadow-[0_0_15px_rgba(245,158,11,0.05)]'
                      : 'bg-neutral-950/40 border-neutral-800/60 hover:border-neutral-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div className={`p-2 rounded-lg ${selectedNode === node.id ? 'bg-amber-500/20 text-amber-400' : 'bg-neutral-900 text-neutral-400'}`}>
                      <Compass className="w-4 h-4" />
                    </div>
                    <div>
                      <p className="text-xs font-semibold text-neutral-200">{node.name}</p>
                      <p className="text-[10px] text-neutral-400 font-mono">{node.location}</p>
                    </div>
                  </div>
                  <div className="text-right">
                    <span className="text-[10px] font-mono text-neutral-300 block">{node.latency}</span>
                    <span className={`inline-flex items-center gap-1 text-[9px] font-mono uppercase tracking-wider ${
                      node.status === 'optimal' ? 'text-emerald-400' : 'text-amber-400'
                    }`}>
                      <span className={`w-1 h-1 rounded-full ${node.status === 'optimal' ? 'bg-emerald-400' : 'bg-amber-400 animate-pulse'}`} />
                      {node.status}
                    </span>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* LIVE CRYPTOGRAPHIC LOG FEED */}
          <div className="bg-neutral-900/60 border border-neutral-800 rounded-2xl p-6 backdrop-blur-md flex-1 flex flex-col justify-between min-h-[350px]">
            <div>
              <div className="flex justify-between items-center mb-4">
                <h3 className="text-sm font-medium text-neutral-200 flex items-center gap-2">
                  <Activity className="w-4 h-4 text-amber-400" />
                  Live Cryptographic Handshake Log
                </h3>
                <span className="text-[9px] font-mono text-neutral-500 uppercase">Real-time</span>
              </div>

              {/* Log List */}
              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-neutral-800">
                {logs.map((log) => (
                  <div key={log.id} className="bg-neutral-950/80 border border-neutral-900 p-3 rounded-lg font-mono text-[11px] leading-relaxed">
                    <div className="flex justify-between items-center mb-1.5">
                      <span className="text-neutral-500">{log.timestamp}</span>
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold uppercase tracking-wider ${
                        log.type === 'success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                        log.type === 'ai' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                        log.type === 'warning' ? 'bg-yellow-500/10 text-yellow-400 border border-yellow-500/20' :
                        'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                      }`}>
                        {log.type}
                      </span>
                    </div>
                    <p className="text-neutral-300">{log.message}</p>
                    <div className="mt-1.5 text-[9px] text-neutral-500 flex items-center gap-1">
                      <span className="w-1 h-1 rounded-full bg-neutral-600" />
                      Node: <span className="text-neutral-400">{log.node}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-4 pt-4 border-t border-neutral-800/60 flex justify-between items-center text-[10px] font-mono text-neutral-500">
              <span>Active Session: SECURE_TLS_1.3</span>
              <span>FIPS 140-3 Level 4</span>
            </div>
          </div>

        </section>

      </main>

      {/* FOOTER */}
      <footer className="relative z-10 border-t border-neutral-800/60 pt-6 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-neutral-500 font-mono">
        <div className="flex items-center gap-2">
          <Lock className="w-3.5 h-3.5 text-amber-500/60" />
          <span>Citibank Private Ledger Sync Protocol v4.92 (AI-Enabled)</span>
        </div>
        <div className="flex items-center gap-6">
          <a href="#docs" className="hover:text-neutral-300 transition-colors">API Documentation</a>
          <a href="#security" className="hover:text-neutral-300 transition-colors">Sovereign Security SLA</a>
          <span className="text-neutral-700">|</span>
          <span className="text-amber-500/80">Ultra-High-Net-Worth Exclusive</span>
        </div>
      </footer>

    </div>
  );
}