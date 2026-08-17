import React, { useState, useEffect, useCallback } from 'react';
import { 
  Shield, 
  Cpu, 
  Key, 
  Activity, 
  Lock, 
  RefreshCw, 
  CheckCircle, 
  AlertTriangle, 
  Globe, 
  TrendingUp, 
  Zap, 
  Fingerprint, 
  Layers, 
  DollarSign, 
  Sliders, 
  Terminal,
  ShieldAlert,
  Compass
} from 'lucide-react';

// Mock Data for the Ultra-Premium Dashboard
const INITIAL_KEYS = [
  { id: 'KEY-KYBER-1024-01', algorithm: 'CRYSTALS-Kyber (Post-Quantum)', strength: '128-bit Quantum Equivalent', status: 'Active', integrity: 100, lastRotated: '2 mins ago' },
  { id: 'KEY-DILITHIUM-05', algorithm: 'CRYSTALS-Dilithium (Signature)', strength: '256-bit Quantum Equivalent', status: 'Active', integrity: 100, lastRotated: '14 mins ago' },
  { id: 'KEY-SPHINCS-09', algorithm: 'SPHINCS+ (State-free Hash)', strength: '192-bit Quantum Equivalent', status: 'Standby', integrity: 99.99, lastRotated: '1 hour ago' },
];

const INITIAL_SESSIONS = [
  { id: 'SES-CB-MT-901', node: 'Citibank Sovereign Vault (Zurich)', ip: '10.240.89.12', status: 'Secured by AI', ping: '0.8ms', traffic: '4.2 TB/s' },
  { id: 'SES-CB-MT-402', node: 'Modern Treasury Ledger Node (New York)', ip: '10.12.199.45', status: 'Secured by AI', ping: '1.2ms', traffic: '8.9 TB/s' },
  { id: 'SES-CB-MT-118', node: 'Citibank Quantum Gateway (Tokyo)', ip: '10.88.2.109', status: 'Secured by AI', ping: '2.4ms', traffic: '1.7 TB/s' },
];

const SECURITY_LOGS = [
  { timestamp: '14:02:31.009', event: 'AI Threat Mitigation: Blocked multi-vector quantum decryption attempt on Ledger #8812', status: 'Mitigated', severity: 'Critical' },
  { timestamp: '14:01:15.882', event: 'Modern Treasury API: Automated compliance check passed (100% score)', status: 'Verified', severity: 'Info' },
  { timestamp: '13:59:44.120', event: 'Citibank Sovereign Bridge: Re-keyed quantum tunnel via Kyber-1024', status: 'Success', severity: 'Success' },
  { timestamp: '13:55:02.391', event: 'AI Sentinel: Continuous biometric verification active across all nodes', status: 'Active', severity: 'Info' },
];

export default function QuantumSecurityShield() {
  // State Management
  const [securityScore, setSecurityScore] = useState(99.9999998);
  const [isScanning, setIsScanning] = useState(false);
  const [isRotating, setIsRotating] = useState(false);
  const [keys, setKeys] = useState(INITIAL_KEYS);
  const [sessions, setSessions] = useState(INITIAL_SESSIONS);
  const [logs, setLogs] = useState(SECURITY_LOGS);
  const [activeTab, setActiveTab] = useState<'overview' | 'keys' | 'sessions' | 'compliance'>('overview');
  const [complianceScore, setComplianceScore] = useState(100);
  const [signingStatus, setSigningStatus] = useState('Fully Synchronized');
  const [systemLoad, setSystemLoad] = useState(14.2); // in PetaFLOPs

  // Simulate real-time fluctuations for high-end feel
  useEffect(() => {
    const interval = setInterval(() => {
      setSecurityScore(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.0000001;
        return parseFloat(Math.min(100, Math.max(99.9999990, prev + fluctuation)).toFixed(9));
      });
      setSystemLoad(prev => {
        const fluctuation = (Math.random() - 0.5) * 0.8;
        return parseFloat(Math.min(30, Math.max(5, prev + fluctuation)).toFixed(2));
      });
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Trigger AI Security Scan
  const handleAIScan = useCallback(() => {
    setIsScanning(true);
    const newLog = {
      timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 1000),
      event: 'AI-Powered Deep Scan initiated: Auditing Citibank Ledger & Modern Treasury pipelines...',
      status: 'Scanning',
      severity: 'Info'
    };
    setLogs(prev => [newLog, ...prev]);

    setTimeout(() => {
      setIsScanning(false);
      setSecurityScore(99.9999999);
      setComplianceScore(100);
      const completionLog = {
        timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 1000),
        event: 'AI Deep Scan Complete: 0 threats found. Quantum-resistant shields operating at 100% capacity.',
        status: 'Completed',
        severity: 'Success'
      };
      setLogs(prev => [completionLog, ...prev]);
    }, 2500);
  }, []);

  // Trigger Cryptographic Key Rotation
  const handleKeyRotation = useCallback(() => {
    setIsRotating(true);
    const rotationLog = {
      timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 1000),
      event: 'Initiating Post-Quantum Cryptographic Key Rotation (Kyber-1024 & Dilithium)...',
      status: 'Rotating',
      severity: 'Warning'
    };
    setLogs(prev => [rotationLog, ...prev]);

    setTimeout(() => {
      setIsRotating(false);
      setKeys(prev => prev.map(k => ({
        ...k,
        lastRotated: 'Just now',
        integrity: 100
      })));
      const successLog = {
        timestamp: new Date().toTimeString().split(' ')[0] + '.' + Math.floor(Math.random() * 1000),
        event: 'Key rotation successful. All Citibank-Modern Treasury tunnels re-encrypted.',
        status: 'Success',
        severity: 'Success'
      };
      setLogs(prev => [successLog, ...prev]);
    }, 2000);
  }, []);

  return (
    <div className="min-h-screen bg-[#0D0D0C] text-[#F3E5AB] font-sans selection:bg-[#D4AF37] selection:text-black overflow-x-hidden">
      {/* Top Ambient Glow */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[350px] bg-gradient-to-b from-[#D4AF37]/10 to-transparent rounded-full blur-[120px] pointer-events-none" />

      {/* Header */}
      <header className="relative border-b border-[#D4AF37]/15 bg-black/40 backdrop-blur-md px-8 py-6 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-6">
          {/* Brand Identity */}
          <div className="flex items-center gap-4">
            <div className="relative">
              <div className="absolute inset-0 bg-[#D4AF37]/20 rounded-full blur-md animate-pulse" />
              <div className="relative bg-gradient-to-br from-[#D4AF37] to-[#AA7C11] p-3 rounded-xl border border-[#D4AF37]/40 shadow-[0_0_20px_rgba(212,175,55,0.3)]">
                <Shield className="w-8 h-8 text-black stroke-[1.5]" />
              </div>
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-xs tracking-[0.3em] text-[#D4AF37]/60 uppercase font-semibold">Sovereign AI Security</span>
                <span className="px-2 py-0.5 text-[9px] tracking-wider bg-[#D4AF37]/10 text-[#D4AF37] border border-[#D4AF37]/30 rounded-full font-mono">QUANTUM-READY</span>
              </div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                CITIBANK <span className="text-[#D4AF37] font-light">×</span> MODERN TREASURY
              </h1>
            </div>
          </div>

          {/* Live AI Status & Quick Actions */}
          <div className="flex flex-wrap items-center gap-4">
            <div className="bg-[#1A1915] border border-[#D4AF37]/20 rounded-xl px-4 py-2 flex items-center gap-3">
              <div className="relative flex h-3 w-3">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#D4AF37] opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-[#D4AF37]"></span>
              </div>
              <div className="text-left">
                <p className="text-[10px] text-[#D4AF37]/50 uppercase tracking-wider font-mono">AI Sentinel Status</p>
                <p className="text-xs font-bold text-white">Active & Threat-Free</p>
              </div>
            </div>

            <button 
              onClick={handleAIScan}
              disabled={isScanning}
              className="relative group overflow-hidden bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] text-black font-semibold px-5 py-2.5 rounded-xl transition-all duration-300 hover:shadow-[0_0_25px_rgba(212,175,55,0.4)] disabled:opacity-50 flex items-center gap-2 text-sm"
            >
              <Cpu className={`w-4 h-4 ${isScanning ? 'animate-spin' : ''}`} />
              <span>{isScanning ? 'AI Deep Scanning...' : 'Trigger AI Quantum Scan'}</span>
            </button>
          </div>
        </div>
      </header>

      {/* Main Dashboard Layout */}
      <main className="relative max-w-7xl mx-auto px-6 py-10 z-10 space-y-8">
        
        {/* Hero Metrics Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* Quantum Security Score Gauge */}
          <div className="lg:col-span-2 bg-gradient-to-br from-[#161512] to-[#0D0D0C] border border-[#D4AF37]/20 rounded-2xl p-8 relative overflow-hidden shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-64 h-64 bg-[#D4AF37]/5 rounded-full blur-3xl pointer-events-none" />
            
            <div className="flex justify-between items-start mb-6">
              <div>
                <p className="text-xs tracking-[0.2em] text-[#D4AF37]/60 uppercase font-semibold">Real-Time Integrity</p>
                <h2 className="text-2xl font-bold text-white mt-1">Quantum Shield Health</h2>
              </div>
              <span className="text-xs font-mono text-[#D4AF37] bg-[#D4AF37]/10 px-3 py-1 rounded-full border border-[#D4AF37]/20">
                AI-Monitored
              </span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              {/* Circular Gauge */}
              <div className="relative flex justify-center items-center">
                <svg className="w-48 h-48 transform -rotate-90">
                  <circle cx="96" cy="96" r="80" stroke="rgba(212, 175, 55, 0.05)" strokeWidth="8" fill="transparent" />
                  <circle 
                    cx="96" 
                    cy="96" 
                    r="80" 
                    stroke="url(#goldGradient)" 
                    strokeWidth="8" 
                    fill="transparent" 
                    strokeDasharray={502}
                    strokeDashoffset={5}
                    className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="goldGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                      <stop offset="0%" stopColor="#D4AF37" />
                      <stop offset="100%" stopColor="#AA7C11" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="absolute text-center">
                  <p className="text-3xl font-extrabold text-white tracking-tight font-mono">99.99%</p>
                  <p className="text-[10px] text-[#D4AF37]/60 uppercase tracking-widest mt-1">Quantum Shield</p>
                </div>
              </div>

              {/* Detailed Metrics */}
              <div className="space-y-4">
                <div className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#D4AF37]/60">Sovereign Security Score</span>
                    <span className="font-mono text-white font-bold">{securityScore}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] h-full rounded-full" style={{ width: '99.9%' }} />
                  </div>
                </div>

                <div className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-4">
                  <div className="flex justify-between text-xs mb-1">
                    <span className="text-[#D4AF37]/60">Modern Treasury Compliance</span>
                    <span className="font-mono text-white font-bold">{complianceScore}%</span>
                  </div>
                  <div className="w-full bg-white/5 h-1.5 rounded-full overflow-hidden">
                    <div className="bg-gradient-to-r from-[#D4AF37] to-[#AA7C11] h-full rounded-full" style={{ width: '100%' }} />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-[#D4AF37]/50 uppercase">AI Compute Load</p>
                    <p className="text-sm font-bold text-white font-mono mt-1">{systemLoad} PFLOPS</p>
                  </div>
                  <div className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-3 text-center">
                    <p className="text-[10px] text-[#D4AF37]/50 uppercase">Signing Status</p>
                    <p className="text-xs font-bold text-emerald-400 mt-1 flex items-center justify-center gap-1">
                      <CheckCircle className="w-3 h-3" /> Active
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Modern Treasury Real-Time Compliance Card */}
          <div className="bg-gradient-to-br from-[#161512] to-[#0D0D0C] border border-[#D4AF37]/20 rounded-2xl p-8 relative overflow-hidden flex flex-col justify-between shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
            <div className="absolute top-0 right-0 w-48 h-48 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
            
            <div>
              <div className="flex justify-between items-start mb-6">
                <div>
                  <p className="text-xs tracking-[0.2em] text-[#D4AF37]/60 uppercase font-semibold">Modern Treasury Sync</p>
                  <h2 className="text-2xl font-bold text-white mt-1">Compliance & Ledger</h2>
                </div>
                <div className="p-2 bg-[#D4AF37]/10 rounded-lg border border-[#D4AF37]/20">
                  <Activity className="w-5 h-5 text-[#D4AF37]" />
                </div>
              </div>

              <div className="space-y-4">
                <div className="flex justify-between items-center py-2 border-b border-[#D4AF37]/10">
                  <span className="text-xs text-[#D4AF37]/70">Ledger Signing Status</span>
                  <span className="text-xs font-mono text-white font-bold bg-emerald-500/10 text-emerald-400 px-2.5 py-0.5 rounded-full border border-emerald-500/20">
                    {signingStatus}
                  </span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#D4AF37]/10">
                  <span className="text-xs text-[#D4AF37]/70">Citibank Sovereign Bridge</span>
                  <span className="text-xs font-mono text-white font-bold">Connected (Kyber-1024)</span>
                </div>
                <div className="flex justify-between items-center py-2 border-b border-[#D4AF37]/10">
                  <span className="text-xs text-[#D4AF37]/70">Compliance Audit Frequency</span>
                  <span className="text-xs font-mono text-white font-bold">Continuous (AI-Driven)</span>
                </div>
                <div className="flex justify-between items-center py-2">
                  <span className="text-xs text-[#D4AF37]/70">Active Ledger Sync ID</span>
                  <span className="text-xs font-mono text-[#D4AF37] font-bold">ledger_cb_mt_99x82f</span>
                </div>
              </div>
            </div>

            <div className="mt-6 pt-6 border-t border-[#D4AF37]/10 flex gap-3">
              <button 
                onClick={() => {
                  setSigningStatus('Re-Synchronizing...');
                  setTimeout(() => setSigningStatus('Fully Synchronized'), 1500);
                }}
                className="flex-1 bg-[#1A1915] hover:bg-[#22211B] text-[#D4AF37] border border-[#D4AF37]/30 font-semibold py-2 rounded-xl text-xs transition-all duration-300 flex items-center justify-center gap-2"
              >
                <RefreshCw className="w-3.5 h-3.5" />
                Sync Ledger
              </button>
              <button 
                onClick={() => alert('Initiating full compliance audit report download...')}
                className="flex-1 bg-gradient-to-r from-[#D4AF37]/10 to-[#AA7C11]/10 hover:from-[#D4AF37]/20 hover:to-[#AA7C11]/20 text-white border border-[#D4AF37]/30 font-semibold py-2 rounded-xl text-xs transition-all duration-300"
              >
                Audit Report
              </button>
            </div>
          </div>

        </div>

        {/* Navigation Tabs */}
        <div className="flex border-b border-[#D4AF37]/15 gap-2">
          <button 
            onClick={() => setActiveTab('overview')}
            className={`px-6 py-3 text-sm font-semibold tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'overview' ? 'border-[#D4AF37] text-white bg-[#D4AF37]/5' : 'border-transparent text-[#D4AF37]/60 hover:text-white'}`}
          >
            Overview & Logs
          </button>
          <button 
            onClick={() => setActiveTab('keys')}
            className={`px-6 py-3 text-sm font-semibold tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'keys' ? 'border-[#D4AF37] text-white bg-[#D4AF37]/5' : 'border-transparent text-[#D4AF37]/60 hover:text-white'}`}
          >
            Cryptographic Vault
          </button>
          <button 
            onClick={() => setActiveTab('sessions')}
            className={`px-6 py-3 text-sm font-semibold tracking-wider transition-all duration-300 border-b-2 ${activeTab === 'sessions' ? 'border-[#D4AF37] text-white bg-[#D4AF37]/5' : 'border-transparent text-[#D4AF37]/60 hover:text-white'}`}
          >
            Active AI Sessions
          </button>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          {/* Left/Center Column: Dynamic Tab Content */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === 'overview' && (
              <div className="space-y-6">
                {/* AI Threat Mitigation Logs */}
                <div className="bg-[#161512] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
                  <div className="flex justify-between items-center mb-6">
                    <div className="flex items-center gap-3">
                      <Terminal className="w-5 h-5 text-[#D4AF37]" />
                      <h3 className="text-lg font-bold text-white">AI Sentinel Security Logs</h3>
                    </div>
                    <span className="text-xs font-mono text-[#D4AF37]/60">Real-time Stream</span>
                  </div>

                  <div className="space-y-3 max-h-[350px] overflow-y-auto pr-2 custom-scrollbar">
                    {logs.map((log, idx) => (
                      <div key={idx} className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-4 flex items-start gap-4 hover:border-[#D4AF37]/30 transition-all duration-300">
                        <div className="mt-1">
                          {log.severity === 'Critical' ? (
                            <ShieldAlert className="w-5 h-5 text-red-500" />
                          ) : log.severity === 'Warning' ? (
                            <AlertTriangle className="w-5 h-5 text-amber-500" />
                          ) : log.severity === 'Success' ? (
                            <CheckCircle className="w-5 h-5 text-emerald-500" />
                          ) : (
                            <Compass className="w-5 h-5 text-blue-400" />
                          )}
                        </div>
                        <div className="flex-1">
                          <div className="flex justify-between items-center">
                            <span className="text-xs font-mono text-[#D4AF37]/50">{log.timestamp}</span>
                            <span className={`text-[10px] font-mono px-2 py-0.5 rounded-full ${
                              log.severity === 'Critical' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              log.severity === 'Warning' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                              log.severity === 'Success' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {log.status}
                            </span>
                          </div>
                          <p className="text-sm text-white mt-1.5 font-medium">{log.event}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Quick Stats Grid */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-[#161512] border border-[#D4AF37]/15 rounded-xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                      <Fingerprint className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#D4AF37]/60 uppercase">Biometric Auth</p>
                      <p className="text-lg font-bold text-white">Multi-Factor AI</p>
                    </div>
                  </div>
                  <div className="bg-[#161512] border border-[#D4AF37]/15 rounded-xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                      <Lock className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#D4AF37]/60 uppercase">Encryption Standard</p>
                      <p className="text-lg font-bold text-white">Post-Quantum</p>
                    </div>
                  </div>
                  <div className="bg-[#161512] border border-[#D4AF37]/15 rounded-xl p-5 flex items-center gap-4">
                    <div className="p-3 bg-[#D4AF37]/10 rounded-lg">
                      <Globe className="w-6 h-6 text-[#D4AF37]" />
                    </div>
                    <div>
                      <p className="text-xs text-[#D4AF37]/60 uppercase">Sovereign Nodes</p>
                      <p className="text-lg font-bold text-white">12 Global Vaults</p>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'keys' && (
              <div className="bg-[#161512] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Key className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Quantum-Resistant Key Vault</h3>
                      <p className="text-xs text-[#D4AF37]/60">Active cryptographic keys securing Citibank & Modern Treasury pipelines</p>
                    </div>
                  </div>
                  <button 
                    onClick={handleKeyRotation}
                    disabled={isRotating}
                    className="bg-[#1A1915] hover:bg-[#22211B] text-[#D4AF37] border border-[#D4AF37]/30 font-semibold px-4 py-2 rounded-xl text-xs transition-all duration-300 flex items-center gap-2 disabled:opacity-50"
                  >
                    <RefreshCw className={`w-3.5 h-3.5 ${isRotating ? 'animate-spin' : ''}`} />
                    Rotate All Keys
                  </button>
                </div>

                <div className="space-y-4">
                  {keys.map((key) => (
                    <div key={key.id} className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#D4AF37]/30 transition-all duration-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-mono">{key.id}</span>
                          <span className="text-[10px] bg-[#D4AF37]/10 text-[#D4AF37] px-2 py-0.5 rounded-full border border-[#D4AF37]/20 font-mono">
                            {key.status}
                          </span>
                        </div>
                        <p className="text-xs text-[#D4AF37]/70">{key.algorithm}</p>
                        <p className="text-[11px] text-[#D4AF37]/40 font-mono">Strength: {key.strength}</p>
                      </div>
                      <div className="text-right space-y-1 w-full md:w-auto">
                        <div className="flex justify-between md:justify-end items-center gap-4">
                          <span className="text-xs text-[#D4AF37]/60">Integrity Score</span>
                          <span className="text-sm font-bold text-white font-mono">{key.integrity}%</span>
                        </div>
                        <div className="flex justify-between md:justify-end items-center gap-4">
                          <span className="text-xs text-[#D4AF37]/60">Last Rotated</span>
                          <span className="text-xs text-white font-mono">{key.lastRotated}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'sessions' && (
              <div className="bg-[#161512] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] space-y-6">
                <div className="flex justify-between items-center">
                  <div className="flex items-center gap-3">
                    <Activity className="w-5 h-5 text-[#D4AF37]" />
                    <div>
                      <h3 className="text-lg font-bold text-white">Active AI-Secured Sessions</h3>
                      <p className="text-xs text-[#D4AF37]/60">Live connections between Citibank Sovereign Vaults and Modern Treasury Ledgers</p>
                    </div>
                  </div>
                  <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-3 py-1 rounded-full border border-emerald-500/20">
                    All Nodes Secure
                  </span>
                </div>

                <div className="space-y-4">
                  {sessions.map((session) => (
                    <div key={session.id} className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-5 flex flex-col md:flex-row justify-between items-start md:items-center gap-4 hover:border-[#D4AF37]/30 transition-all duration-300">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2">
                          <span className="text-sm font-bold text-white font-mono">{session.id}</span>
                          <span className="text-[10px] bg-emerald-500/10 text-emerald-400 px-2 py-0.5 rounded-full border border-emerald-500/20 font-mono">
                            {session.status}
                          </span>
                        </div>
                        <p className="text-xs text-white font-semibold">{session.node}</p>
                        <p className="text-[11px] text-[#D4AF37]/50 font-mono">IP: {session.ip}</p>
                      </div>
                      <div className="text-right space-y-1 w-full md:w-auto">
                        <div className="flex justify-between md:justify-end items-center gap-4">
                          <span className="text-xs text-[#D4AF37]/60">Latency</span>
                          <span className="text-sm font-bold text-emerald-400 font-mono">{session.ping}</span>
                        </div>
                        <div className="flex justify-between md:justify-end items-center gap-4">
                          <span className="text-xs text-[#D4AF37]/60">Throughput</span>
                          <span className="text-xs text-white font-mono">{session.traffic}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

          </div>

          {/* Right Column: Premium AI Security Insights */}
          <div className="space-y-6">
            
            {/* AI Threat Analysis Card */}
            <div className="bg-gradient-to-br from-[#161512] to-[#0D0D0C] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-[#D4AF37]/5 rounded-full blur-2xl pointer-events-none" />
              
              <div className="flex items-center gap-3 mb-6">
                <Zap className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-bold text-white">AI Threat Analysis</h3>
              </div>

              <div className="space-y-4">
                <div className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-4">
                  <p className="text-xs text-[#D4AF37]/60 uppercase">Quantum Attack Vector Risk</p>
                  <p className="text-xl font-bold text-white mt-1">0.0000%</p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Fully Mitigated by Kyber-1024
                  </p>
                </div>

                <div className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-4">
                  <p className="text-xs text-[#D4AF37]/60 uppercase">Modern Treasury API Integrity</p>
                  <p className="text-xl font-bold text-white mt-1">100.00%</p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Continuous AI Verification Active
                  </p>
                </div>

                <div className="bg-black/40 border border-[#D4AF37]/10 rounded-xl p-4">
                  <p className="text-xs text-[#D4AF37]/60 uppercase">Citibank Sovereign Vault Sync</p>
                  <p className="text-xl font-bold text-white mt-1">99.999%</p>
                  <p className="text-[10px] text-emerald-400 mt-1 flex items-center gap-1">
                    <CheckCircle className="w-3 h-3" /> Zero Packet Loss Detected
                  </p>
                </div>
              </div>
            </div>

            {/* Premium Sovereign Vault Status */}
            <div className="bg-gradient-to-br from-[#161512] to-[#0D0D0C] border border-[#D4AF37]/20 rounded-2xl p-6 shadow-[0_10px_30px_rgba(0,0,0,0.5)]">
              <div className="flex items-center gap-3 mb-6">
                <Layers className="w-5 h-5 text-[#D4AF37]" />
                <h3 className="text-lg font-bold text-white">Sovereign Vault Nodes</h3>
              </div>

              <div className="space-y-3">
                <div className="flex justify-between items-center p-3 bg-black/40 border border-[#D4AF37]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white font-medium">Zurich Sovereign Vault</span>
                  </div>
                  <span className="text-xs font-mono text-[#D4AF37]">Online</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 border border-[#D4AF37]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white font-medium">New York Sovereign Vault</span>
                  </div>
                  <span className="text-xs font-mono text-[#D4AF37]">Online</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 border border-[#D4AF37]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white font-medium">Tokyo Sovereign Vault</span>
                  </div>
                  <span className="text-xs font-mono text-[#D4AF37]">Online</span>
                </div>
                <div className="flex justify-between items-center p-3 bg-black/40 border border-[#D4AF37]/10 rounded-xl">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-emerald-400" />
                    <span className="text-xs text-white font-medium">London Sovereign Vault</span>
                  </div>
                  <span className="text-xs font-mono text-[#D4AF37]">Online</span>
                </div>
              </div>
            </div>

          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="relative border-t border-[#D4AF37]/15 bg-black/60 backdrop-blur-md py-8 px-8 mt-20 z-10">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-[#D4AF37]/50">
          <div className="flex items-center gap-2">
            <Shield className="w-4 h-4 text-[#D4AF37]" />
            <span>© {new Date().getFullYear()} Citibank Sovereign AI Security Suite. Powered by Modern Treasury.</span>
          </div>
          <div className="flex gap-6">
            <a href="#privacy" className="hover:text-white transition-colors">Quantum Security Protocol</a>
            <a href="#terms" className="hover:text-white transition-colors">Sovereign Compliance Standards</a>
            <a href="#support" className="hover:text-white transition-colors">AI Sentinel Support</a>
          </div>
        </div>
      </footer>
    </div>
  );
}