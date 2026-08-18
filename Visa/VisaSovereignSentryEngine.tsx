import React, { useState, useEffect, useMemo, useCallback, useRef } from 'react';
import { 
  Shield, ShieldAlert, ShieldCheck, Cpu, Radio, Fingerprint, AlertTriangle, 
  CheckCircle2, Lock, Zap, Activity, Database, ArrowRight, Server, Globe, 
  ExternalLink, Sparkles, TrendingUp, TrendingDown, Clock, RefreshCw, 
  Play, Pause, AlertCircle, Check, X, Sliders, Terminal, Coins, ArrowUpRight
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, CartesianGrid, 
  Tooltip, Legend, LineChart, Line, BarChart, Bar 
} from 'recharts';

interface MetricPoint {
  timestamp: string;
  visaLatency: number;
  geminiLatency: number;
  ethGas: number;
  sovereignGas: number;
  tps: number;
  successRate: number;
}

interface LogEntry {
  id: string;
  timestamp: string;
  source: 'VISA' | 'GEMINI' | 'CRYPTO' | 'SENTRY';
  severity: 'INFO' | 'WARNING' | 'CRITICAL' | 'SUCCESS';
  message: string;
  hash: string;
}

interface SentryRule {
  id: string;
  name: string;
  condition: string;
  action: string;
  active: boolean;
  triggered: boolean;
}

export default function VisaSovereignSentryEngine() {
  // Sentry Engine State
  const [isMonitoring, setIsMonitoring] = useState<boolean>(true);
  const [visaStatus, setVisaStatus] = useState<'OPERATIONAL' | 'DEGRADED' | 'OUTAGE'>('OPERATIONAL');
  const [geminiStatus, setGeminiStatus] = useState<'OPERATIONAL' | 'DEGRADED' | 'OUTAGE'>('OPERATIONAL');
  const [autoMitigation, setAutoMitigation] = useState<boolean>(true);
  const [selectedChain, setSelectedChain] = useState<'ethereum' | 'sovereign'>('sovereign');
  
  // Live Metrics
  const [currentVisaLatency, setCurrentVisaLatency] = useState<number>(45);
  const [currentGeminiLatency, setCurrentGeminiLatency] = useState<number>(320);
  const [currentEthGas, setCurrentEthGas] = useState<number>(28);
  const [currentSovereignGas, setCurrentSovereignGas] = useState<number>(1.2);
  const [currentTps, setCurrentTps] = useState<number>(1850);
  const [currentSuccessRate, setCurrentSuccessRate] = useState<number>(99.95);
  
  // Historical Data
  const [metricsHistory, setMetricsHistory] = useState<MetricPoint[]>([]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  
  // Sentry Rules
  const [rules, setRules] = useState<SentryRule[]>([
    {
      id: 'rule-1',
      name: 'High Ethereum Gas Redirect',
      condition: 'Ethereum Gas > 80 Gwei',
      action: 'Route Visa settlement to Sovereign L2 Rollup',
      active: true,
      triggered: false
    },
    {
      id: 'rule-2',
      name: 'Gemini Latency Fallback',
      condition: 'Gemini Latency > 1200ms',
      action: 'Switch to local lightweight Llama-3-Sovereign model',
      active: true,
      triggered: false
    },
    {
      id: 'rule-3',
      name: 'Visa API Outage Mitigation',
      condition: 'Visa API Status == OUTAGE',
      action: 'Activate USDC/Sovereign stablecoin offline ledger mode',
      active: true,
      triggered: false
    },
    {
      id: 'rule-4',
      name: 'Throughput Spike Protection',
      condition: 'TPS > 4000',
      action: 'Enable dynamic gas pricing and transaction batching',
      active: false,
      triggered: false
    }
  ]);

  const terminalEndRef = useRef<HTMLDivElement>(null);

  // Helper to generate cryptographic-like hashes for logs
  const generateHash = () => {
    return '0x' + Array.from({ length: 40 }, () => 
      Math.floor(Math.random() * 16).toString(16)
    ).join('');
  };

  // Add Log Entry
  const addLog = useCallback((source: LogEntry['source'], severity: LogEntry['severity'], message: string) => {
    const newLog: LogEntry = {
      id: Math.random().toString(36).substring(2, 9),
      timestamp: new Date().toLocaleTimeString(),
      source,
      severity,
      message,
      hash: generateHash()
    };
    setLogs(prev => [newLog, ...prev].slice(0, 100));
  }, []);

  // Initialize Historical Data
  useEffect(() => {
    const initialData: MetricPoint[] = [];
    const now = new Date();
    for (let i = 15; i >= 0; i--) {
      const time = new Date(now.getTime() - i * 60000);
      initialData.push({
        timestamp: time.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' }),
        visaLatency: Math.floor(Math.random() * 15) + 40,
        geminiLatency: Math.floor(Math.random() * 100) + 280,
        ethGas: Math.floor(Math.random() * 10) + 25,
        sovereignGas: parseFloat((Math.random() * 0.4 + 1.0).toFixed(2)),
        tps: Math.floor(Math.random() * 300) + 1700,
        successRate: parseFloat((99.8 + Math.random() * 0.18).toFixed(2))
      });
    }
    setMetricsHistory(initialData);

    addLog('SENTRY', 'SUCCESS', 'Visa Sovereign Sentry Engine initialized successfully.');
    addLog('VISA', 'INFO', 'Established secure TLS 1.3 connection with Visa Developer Platform.');
    addLog('GEMINI', 'INFO', 'Connected to Gemini Live Portal API stream.');
    addLog('CRYPTO', 'INFO', 'Listening to Ethereum Mainnet and Sovereign L2 gas price feeds.');
  }, [addLog]);

  // Scroll terminal to bottom
  useEffect(() => {
    terminalEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [logs]);

  // Live Simulation Loop
  useEffect(() => {
    if (!isMonitoring) return;

    const interval = setInterval(() => {
      // 1. Calculate new metrics based on current statuses
      let visaLat = Math.floor(Math.random() * 10) + 40;
      if (visaStatus === 'DEGRADED') visaLat = Math.floor(Math.random() * 150) + 250;
      if (visaStatus === 'OUTAGE') visaLat = 0;

      let geminiLat = Math.floor(Math.random() * 80) + 280;
      if (geminiStatus === 'DEGRADED') geminiLat = Math.floor(Math.random() * 800) + 1100;
      if (geminiStatus === 'OUTAGE') geminiLat = 0;

      const ethGasVal = currentEthGas + Math.floor(Math.random() * 5) - 2;
      const sovGasVal = parseFloat((currentSovereignGas + (Math.random() * 0.1 - 0.05)).toFixed(2));
      
      let tpsVal = Math.floor(Math.random() * 200) + 1800;
      if (visaStatus === 'OUTAGE') tpsVal = Math.floor(Math.random() * 100) + 50; // Only offline ledger transactions

      let successRateVal = parseFloat((99.9 + Math.random() * 0.08).toFixed(2));
      if (visaStatus === 'DEGRADED') successRateVal = parseFloat((94.2 + Math.random() * 3).toFixed(2));
      if (visaStatus === 'OUTAGE') successRateVal = parseFloat((45.0 + Math.random() * 10).toFixed(2));

      // Update state
      setCurrentVisaLatency(visaLat);
      setCurrentGeminiLatency(geminiLat);
      setCurrentEthGas(Math.max(10, ethGasVal));
      setCurrentSovereignGas(Math.max(0.1, sovGasVal));
      setCurrentTps(tpsVal);
      setCurrentSuccessRate(successRateVal);

      // Update history
      const nowStr = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
      setMetricsHistory(prev => {
        const next = [...prev, {
          timestamp: nowStr,
          visaLatency: visaLat,
          geminiLatency: geminiLat,
          ethGas: Math.max(10, ethGasVal),
          sovereignGas: Math.max(0.1, sovGasVal),
          tps: tpsVal,
          successRate: successRateVal
        }];
        return next.slice(next.length - 16);
      });

      // 2. Sentry Rule Evaluation & Mitigation
      setRules(prevRules => {
        return prevRules.map(rule => {
          let shouldTrigger = false;

          if (rule.id === 'rule-1' && rule.active) {
            shouldTrigger = ethGasVal > 80;
          } else if (rule.id === 'rule-2' && rule.active) {
            shouldTrigger = geminiLat > 1200;
          } else if (rule.id === 'rule-3' && rule.active) {
            shouldTrigger = visaStatus === 'OUTAGE';
          } else if (rule.id === 'rule-4' && rule.active) {
            shouldTrigger = tpsVal > 4000;
          }

          if (shouldTrigger && !rule.triggered) {
            addLog('SENTRY', 'WARNING', `Rule Triggered: [${rule.name}] - Condition met: ${rule.condition}`);
            if (autoMitigation) {
              addLog('SENTRY', 'SUCCESS', `Auto-Mitigation Executed: ${rule.action}`);
            }
            return { ...rule, triggered: true };
          } else if (!shouldTrigger && rule.triggered) {
            addLog('SENTRY', 'INFO', `Rule Resolved: [${rule.name}] - Conditions returned to normal.`);
            return { ...rule, triggered: false };
          }

          return rule;
        });
      });

      // Random background logs
      if (Math.random() > 0.7) {
        const sources: LogEntry['source'][] = ['VISA', 'GEMINI', 'CRYPTO'];
        const randomSource = sources[Math.floor(Math.random() * sources.length)];
        if (randomSource === 'VISA' && visaStatus === 'OPERATIONAL') {
          addLog('VISA', 'INFO', `Processed batch settlement. Latency: ${visaLat}ms. TPS: ${tpsVal}`);
        } else if (randomSource === 'GEMINI' && geminiStatus === 'OPERATIONAL') {
          addLog('GEMINI', 'INFO', `Gemini Live Portal token generation throughput stable at ${Math.floor(Math.random() * 50) + 120} tokens/sec.`);
        } else if (randomSource === 'CRYPTO') {
          addLog('CRYPTO', 'INFO', `Gas price update: Ethereum Mainnet = ${ethGasVal} Gwei, Sovereign L2 = ${sovGasVal} Gwei.`);
        }
      }

    }, 3000);

    return () => clearInterval(interval);
  }, [isMonitoring, visaStatus, geminiStatus, currentEthGas, currentSovereignGas, autoMitigation, addLog]);

  // Manual Simulation Triggers
  const triggerVisaOutage = () => {
    if (visaStatus === 'OUTAGE') {
      setVisaStatus('OPERATIONAL');
      addLog('VISA', 'SUCCESS', 'Visa API connection restored to OPERATIONAL status.');
    } else {
      setVisaStatus('OUTAGE');
      addLog('VISA', 'CRITICAL', 'Visa API connection lost! Simulated network partition or gateway timeout.');
    }
  };

  const triggerGeminiDegradation = () => {
    if (geminiStatus === 'DEGRADED') {
      setGeminiStatus('OPERATIONAL');
      addLog('GEMINI', 'SUCCESS', 'Gemini model latency restored to normal parameters.');
    } else {
      setGeminiStatus('DEGRADED');
      addLog('GEMINI', 'WARNING', 'Gemini model latency spike detected. Simulated high queue load on Google Vertex AI.');
    }
  };

  const triggerGasSpike = () => {
    if (currentEthGas > 100) {
      setCurrentEthGas(28);
      addLog('CRYPTO', 'INFO', 'Ethereum gas prices normalized to 28 Gwei.');
    } else {
      setCurrentEthGas(145);
      addLog('CRYPTO', 'WARNING', 'Ethereum gas price spike detected! Gas surged to 145 Gwei due to high NFT minting activity.');
    }
  };

  const toggleRule = (id: string) => {
    setRules(prev => prev.map(r => r.id === id ? { ...r, active: !r.active } : r));
    const rule = rules.find(r => r.id === id);
    if (rule) {
      addLog('SENTRY', 'INFO', `Rule [${rule.name}] ${!rule.active ? 'enabled' : 'disabled'} manually.`);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-6 font-sans selection:bg-emerald-500 selection:text-slate-950">
      {/* Top Navigation / Header */}
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8 pb-6 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-emerald-500/10 border border-emerald-500/30 rounded-xl text-emerald-400 animate-pulse">
            <Shield className="w-8 h-8" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-2xl font-bold tracking-tight text-white">Visa Sovereign Sentry</h1>
              <span className="px-2 py-0.5 text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
                v2.4-PROD
              </span>
            </div>
            <p className="text-sm text-slate-400">
              Real-time monitoring engine for Visa API health, crypto gas prices, Gemini model latency, and transaction throughput.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          {/* Auto Mitigation Toggle */}
          <button 
            onClick={() => setAutoMitigation(!autoMitigation)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              autoMitigation 
                ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            <Zap className={`w-4 h-4 ${autoMitigation ? 'fill-emerald-400/20' : ''}`} />
            Auto-Mitigation: {autoMitigation ? 'ACTIVE' : 'DISABLED'}
          </button>

          {/* Monitoring Toggle */}
          <button 
            onClick={() => setIsMonitoring(!isMonitoring)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border text-sm font-medium transition-all ${
              isMonitoring 
                ? 'bg-blue-500/10 border-blue-500/30 text-blue-400' 
                : 'bg-slate-900 border-slate-800 text-slate-400 hover:text-slate-200'
            }`}
          >
            {isMonitoring ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
            {isMonitoring ? 'Monitoring Live' : 'Monitoring Paused'}
          </button>

          {/* Reset / Refresh */}
          <button 
            onClick={() => {
              setVisaStatus('OPERATIONAL');
              setGeminiStatus('OPERATIONAL');
              setCurrentEthGas(28);
              addLog('SENTRY', 'SUCCESS', 'Sentry Engine parameters reset to baseline.');
            }}
            className="p-2 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-xl text-slate-400 hover:text-white transition-all"
            title="Reset to Baseline"
          >
            <RefreshCw className="w-5 h-5" />
          </button>
        </div>
      </header>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6 mb-8">
        
        {/* KPI 1: Visa API Health */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Visa API Gateway</span>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              visaStatus === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              visaStatus === 'DEGRADED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
              'bg-rose-500/10 text-rose-400 border border-rose-500/20 animate-pulse'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                visaStatus === 'OPERATIONAL' ? 'bg-emerald-400' :
                visaStatus === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              {visaStatus}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {visaStatus === 'OUTAGE' ? '---' : `${currentVisaLatency}ms`}
            </span>
            <span className="text-xs text-slate-400">avg latency</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-400">
            <span>Endpoint: /v1/payments</span>
            <span className="text-slate-500">TLS 1.3 Secure</span>
          </div>
        </div>

        {/* KPI 2: Gemini Model Latency */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-violet-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Gemini Live Portal</span>
            <span className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-bold ${
              geminiStatus === 'OPERATIONAL' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
              geminiStatus === 'DEGRADED' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse' :
              'bg-rose-500/10 text-rose-400 border border-rose-500/20'
            }`}>
              <span className={`w-1.5 h-1.5 rounded-full ${
                geminiStatus === 'OPERATIONAL' ? 'bg-emerald-400' :
                geminiStatus === 'DEGRADED' ? 'bg-amber-400' : 'bg-rose-400'
              }`} />
              {geminiStatus}
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {geminiStatus === 'OUTAGE' ? '---' : `${currentGeminiLatency}ms`}
            </span>
            <span className="text-xs text-slate-400">inference time</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-400">
            <span>Model: Gemini 1.5 Pro</span>
            <span className="text-slate-500">Token Stream Active</span>
          </div>
        </div>

        {/* KPI 3: Crypto Gas Prices */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-amber-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Crypto Gas Price</span>
            <div className="flex bg-slate-950 p-0.5 rounded-lg border border-slate-800">
              <button 
                onClick={() => setSelectedChain('ethereum')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  selectedChain === 'ethereum' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                ETH
              </button>
              <button 
                onClick={() => setSelectedChain('sovereign')}
                className={`px-2 py-0.5 rounded text-[10px] font-semibold transition-all ${
                  selectedChain === 'sovereign' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 'text-slate-500 hover:text-slate-300'
                }`}
              >
                SOV L2
              </button>
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">
              {selectedChain === 'ethereum' ? `${currentEthGas} Gwei` : `${currentSovereignGas} Gwei`}
            </span>
            <span className="text-xs text-slate-400">
              {selectedChain === 'ethereum' ? 'Mainnet base fee' : 'Sovereign L2 fee'}
            </span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-400">
            <span>Est. Settlement Cost:</span>
            <span className="font-mono text-slate-300">
              {selectedChain === 'ethereum' 
                ? `$${(currentEthGas * 0.08).toFixed(2)}` 
                : `$${(currentSovereignGas * 0.001).toFixed(4)}`
              }
            </span>
          </div>
        </div>

        {/* KPI 4: Transaction Throughput */}
        <div className="bg-slate-900/50 border border-slate-800 rounded-2xl p-5 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/5 rounded-full blur-3xl pointer-events-none" />
          <div className="flex justify-between items-start mb-4">
            <span className="text-xs font-semibold text-slate-400 tracking-wider uppercase">Throughput & Success</span>
            <span className="flex items-center gap-1 text-xs font-semibold text-emerald-400">
              <TrendingUp className="w-3.5 h-3.5" />
              Live TPS
            </span>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-bold text-white">{currentTps}</span>
            <span className="text-xs text-slate-400">tx / sec</span>
          </div>
          <div className="mt-4 pt-4 border-t border-slate-800/60 flex justify-between items-center text-xs text-slate-400">
            <span>Success Rate:</span>
            <span className={`font-mono font-bold ${currentSuccessRate > 99 ? 'text-emerald-400' : currentSuccessRate > 95 ? 'text-amber-400' : 'text-rose-400'}`}>
              {currentSuccessRate}%
            </span>
          </div>
        </div>

      </div>

      {/* Charts & Sentry Rules Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart 1: Latency Comparison */}
        <div className="lg:col-span-2 bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="text-lg font-bold text-white">Latency Analytics</h3>
              <p className="text-xs text-slate-400">Real-time comparison of Visa API gateway vs Gemini Live Portal inference</p>
            </div>
            <div className="flex items-center gap-4 text-xs">
              <span className="flex items-center gap-1.5 text-blue-400">
                <span className="w-2 h-2 rounded-full bg-blue-400" />
                Visa API
              </span>
              <span className="flex items-center gap-1.5 text-violet-400">
                <span className="w-2 h-2 rounded-full bg-violet-400" />
                Gemini Model
              </span>
            </div>
          </div>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={metricsHistory} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorVisa" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorGemini" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8b5cf6" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#8b5cf6" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={10} />
                <YAxis stroke="#64748b" fontSize={10} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                  labelStyle={{ color: '#94a3b8', fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="visaLatency" stroke="#3b82f6" strokeWidth={2} fillOpacity={1} fill="url(#colorVisa)" name="Visa Latency (ms)" />
                <Area type="monotone" dataKey="geminiLatency" stroke="#8b5cf6" strokeWidth={2} fillOpacity={1} fill="url(#colorGemini)" name="Gemini Latency (ms)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Sentry Rules Panel */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col">
          <div className="mb-4">
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <Sliders className="w-5 h-5 text-emerald-400" />
              Sentry Rules Engine
            </h3>
            <p className="text-xs text-slate-400">Automated triggers for routing and fallback mitigation</p>
          </div>

          <div className="space-y-3.5 flex-1 overflow-y-auto max-h-[280px] pr-1">
            {rules.map(rule => (
              <div 
                key={rule.id} 
                className={`p-3.5 rounded-xl border transition-all ${
                  rule.triggered 
                    ? 'bg-rose-500/5 border-rose-500/30' 
                    : rule.active 
                      ? 'bg-slate-950/60 border-slate-800/80' 
                      : 'bg-slate-950/20 border-slate-900 text-slate-500'
                }`}
              >
                <div className="flex justify-between items-start gap-2 mb-1.5">
                  <span className={`text-sm font-semibold ${rule.triggered ? 'text-rose-400' : rule.active ? 'text-slate-200' : 'text-slate-500'}`}>
                    {rule.name}
                  </span>
                  <button 
                    onClick={() => toggleRule(rule.id)}
                    className={`text-[10px] font-bold px-2 py-0.5 rounded transition-all ${
                      rule.active 
                        ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 hover:bg-emerald-500/20' 
                        : 'bg-slate-800 text-slate-400 border border-slate-700 hover:bg-slate-700'
                    }`}
                  >
                    {rule.active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </div>
                <div className="flex flex-col gap-1 text-xs">
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-slate-500">If:</span>
                    <code className="font-mono bg-slate-900 px-1.5 py-0.5 rounded text-amber-400 text-[11px]">
                      {rule.condition}
                    </code>
                  </div>
                  <div className="flex items-center gap-1 text-slate-400">
                    <span className="text-slate-500">Then:</span>
                    <span className="text-slate-300">{rule.action}</span>
                  </div>
                </div>
                {rule.triggered && (
                  <div className="mt-2 flex items-center gap-1.5 text-xs text-rose-400 font-semibold animate-pulse">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    Rule Triggered & Mitigated
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

      </div>

      {/* Gas Trends & Simulation Controls */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-8">
        
        {/* Chart 2: Gas Price Trends */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h3 className="text-lg font-bold text-white">Gas Price Trends</h3>
              <p className="text-xs text-slate-400">Ethereum Mainnet vs Sovereign L2 Gas (Gwei)</p>
            </div>
            <span className="p-1.5 bg-amber-500/10 border border-amber-500/20 rounded-lg text-amber-400">
              <Coins className="w-4 h-4" />
            </span>
          </div>
          <div className="h-52">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={metricsHistory} margin={{ top: 5, right: 5, left: -25, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                <XAxis dataKey="timestamp" stroke="#64748b" fontSize={9} />
                <YAxis stroke="#64748b" fontSize={9} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0f172a', borderColor: '#334155', borderRadius: '12px' }}
                />
                <Line type="monotone" dataKey="ethGas" stroke="#f59e0b" strokeWidth={2} dot={false} name="Ethereum Gas" />
                <Line type="monotone" dataKey="sovereignGas" stroke="#10b981" strokeWidth={2} dot={false} name="Sovereign L2 Gas" />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Simulation Controls */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
          <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
            <Radio className="w-5 h-5 text-blue-400" />
            Sentry Simulation Lab
          </h3>
          <p className="text-xs text-slate-400 mb-4">Inject synthetic anomalies to test Sentry auto-mitigation rules</p>
          
          <div className="grid grid-cols-1 gap-3">
            {/* Visa Outage Trigger */}
            <button 
              onClick={triggerVisaOutage}
              className={`flex justify-between items-center p-3 rounded-xl border text-sm font-medium transition-all ${
                visaStatus === 'OUTAGE' 
                  ? 'bg-rose-500/10 border-rose-500/30 text-rose-400' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Server className="w-4 h-4" />
                Simulate Visa Outage
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${visaStatus === 'OUTAGE' ? 'bg-rose-500/20 text-rose-300' : 'bg-slate-800 text-slate-400'}`}>
                {visaStatus === 'OUTAGE' ? 'ACTIVE' : 'TRIGGER'}
              </span>
            </button>

            {/* Gemini Latency Trigger */}
            <button 
              onClick={triggerGeminiDegradation}
              className={`flex justify-between items-center p-3 rounded-xl border text-sm font-medium transition-all ${
                geminiStatus === 'DEGRADED' 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Cpu className="w-4 h-4" />
                Simulate Gemini Latency Spike
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${geminiStatus === 'DEGRADED' ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {geminiStatus === 'DEGRADED' ? 'ACTIVE' : 'TRIGGER'}
              </span>
            </button>

            {/* Gas Price Spike Trigger */}
            <button 
              onClick={triggerGasSpike}
              className={`flex justify-between items-center p-3 rounded-xl border text-sm font-medium transition-all ${
                currentEthGas > 100 
                  ? 'bg-amber-500/10 border-amber-500/30 text-amber-400' 
                  : 'bg-slate-950/60 border-slate-800 text-slate-300 hover:bg-slate-900'
              }`}
            >
              <span className="flex items-center gap-2">
                <Zap className="w-4 h-4" />
                Simulate Ethereum Gas Spike
              </span>
              <span className={`px-2 py-0.5 rounded text-xs ${currentEthGas > 100 ? 'bg-amber-500/20 text-amber-300' : 'bg-slate-800 text-slate-400'}`}>
                {currentEthGas > 100 ? 'ACTIVE' : 'TRIGGER'}
              </span>
            </button>
          </div>
        </div>

        {/* Sentry Security & Cryptographic Attestation */}
        <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6 flex flex-col justify-between">
          <div>
            <h3 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
              <Fingerprint className="w-5 h-5 text-emerald-400" />
              Sovereign Attestation
            </h3>
            <p className="text-xs text-slate-400 mb-4">
              Cryptographic proof of monitoring integrity. Every log and metric is hashed and anchored to the Sovereign Ledger.
            </p>
          </div>

          <div className="bg-slate-950 p-3.5 rounded-xl border border-slate-800/80 font-mono text-[11px] text-slate-400 space-y-2">
            <div className="flex justify-between">
              <span>Sentry Node ID:</span>
              <span className="text-emerald-400">node-visa-sentry-01</span>
            </div>
            <div className="flex justify-between">
              <span>Attestation Status:</span>
              <span className="text-emerald-400 flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5" /> Verified
              </span>
            </div>
            <div className="flex justify-between">
              <span>Active Ledger Anchor:</span>
              <span className="text-slate-300">Sovereign L2 Block #4,829,102</span>
            </div>
            <div className="pt-2 border-t border-slate-800/60 flex justify-between items-center">
              <span>Current Block Hash:</span>
              <span className="text-slate-500 text-[10px] truncate max-w-[120px]">
                0x8f3a2b1c9d8e7f6a5b4c3d2e1f0a9b8c7d6e5f4
              </span>
            </div>
          </div>
        </div>

      </div>

      {/* Real-time Audit Log Terminal */}
      <div className="bg-slate-900/40 border border-slate-800 rounded-2xl p-6">
        <div className="flex justify-between items-center mb-4">
          <div className="flex items-center gap-2">
            <Terminal className="w-5 h-5 text-emerald-400" />
            <h3 className="text-lg font-bold text-white">Real-time Sentry Audit Log</h3>
          </div>
          <span className="text-xs text-slate-500 font-mono">Live Stream Active</span>
        </div>

        <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs h-64 overflow-y-auto space-y-2.5">
          {logs.length === 0 ? (
            <div className="text-slate-600 text-center py-12">No logs recorded yet. Waiting for stream...</div>
          ) : (
            logs.map(log => (
              <div key={log.id} className="flex flex-col md:flex-row md:items-center justify-between gap-2 pb-2 border-b border-slate-900/60 last:border-0">
                <div className="flex items-start md:items-center gap-2 flex-1">
                  <span className="text-slate-500 text-[10px]">{log.timestamp}</span>
                  
                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold tracking-wider ${
                    log.source === 'VISA' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                    log.source === 'GEMINI' ? 'bg-violet-500/10 text-violet-400 border border-violet-500/20' :
                    log.source === 'CRYPTO' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                  }`}>
                    {log.source}
                  </span>

                  <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                    log.severity === 'CRITICAL' ? 'bg-rose-500/10 text-rose-400 border border-rose-500/20' :
                    log.severity === 'WARNING' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                    log.severity === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                    'bg-slate-800 text-slate-400'
                  }`}>
                    {log.severity}
                  </span>

                  <span className="text-slate-300 text-xs break-all">{log.message}</span>
                </div>
                <div className="text-[10px] text-slate-600 font-mono truncate max-w-[180px]" title="Cryptographic Log Hash">
                  {log.hash}
                </div>
              </div>
            ))
          )}
          <div ref={terminalEndRef} />
        </div>
      </div>
    </div>
  );
}