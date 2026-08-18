import React, { useState, useEffect, useRef, useCallback } from 'react';

// ==========================================
// TYPES & INTERFACES
// ==========================================

interface LogEntry {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success' | 'critical';
  message: string;
  subsystem: string;
}

interface SubsystemStatus {
  id: string;
  name: string;
  path: string;
  status: 'nominal' | 'degraded' | 'compromised' | 'offline';
  latency: number; // ms
  integrityScore: number; // percentage
  category: 'financial' | 'security' | 'infrastructure' | 'archives';
}

interface DiagnosticMetric {
  cpuUsage: number;
  memoryUsage: number;
  networkThroughput: number;
  activeConnections: number;
}

// ==========================================
// INITIAL MOCK DATA (Reflecting Project Tree)
// ==========================================

const INITIAL_SUBSYSTEMS: SubsystemStatus[] = [
  { id: 'ucc-loophole', name: 'UCC Financial Loophole Engine', path: '00_Master_Compiled_Executive_Order/Dossier_01_UCC_Financial_Loophole.md', status: 'nominal', latency: 42, integrityScore: 99.8, category: 'financial' },
  { id: 'save-api', name: 'SAVE API Gateway', path: '00_Master_Compiled_Executive_Order/Dossier_02_SAVE_API_Vulnerabilities.md', status: 'degraded', latency: 185, integrityScore: 84.2, category: 'security' },
  { id: 'mtls-bank', name: 'mTLS AI Bank Architecture', path: 'Combined_sLegislative_Bill/dossiers/mtls_ai_bank_architecture.md', status: 'nominal', latency: 18, integrityScore: 100.0, category: 'financial' },
  { id: 'sovereign-id', name: 'Sovereign ID Cryptography', path: 'Combined_sLegislative_Bill/dossiers/sovereign_id_cryptography.md', status: 'nominal', latency: 29, integrityScore: 99.9, category: 'security' },
  { id: 'war-archives', name: 'Department of War Archival Access', path: '00_Master_Compiled_Executive_Order/Dossier_10_Department_of_War_Archival_Access.md', status: 'offline', latency: 0, integrityScore: 0.0, category: 'archives' },
  { id: 'citi-bridge', name: 'Citi Sovereign Ledger Bridge', path: 'clarity/part17_citi_sovereign_ledger_bridge.ts', status: 'nominal', latency: 55, integrityScore: 98.7, category: 'financial' },
  { id: 'secret-vault', name: 'Google Secret Vault Shim', path: 'Google/SecretVault.ts', status: 'nominal', latency: 12, integrityScore: 100.0, category: 'infrastructure' },
  { id: 'vector-collapse', name: 'Vector Collapse Protocol', path: '00_Master_Compiled_Executive_Order/Dossier_13_Vector_Collapse_Protocol.md', status: 'nominal', latency: 5, integrityScore: 100.0, category: 'security' }
];

const INITIAL_LOGS: LogEntry[] = [
  { id: '1', timestamp: '10:42:01', level: 'info', message: 'Sovereign Diagnostic Console initialized.', subsystem: 'SYSTEM' },
  { id: '2', timestamp: '10:42:03', level: 'success', message: 'mTLS Handshake established with Citibank Demo Business Structure.', subsystem: 'citi-bridge' },
  { id: '3', timestamp: '10:42:05', level: 'warn', message: 'SAVE API Vulnerability detected: Rate limit threshold exceeded on endpoint /v1/verify.', subsystem: 'save-api' },
  { id: '4', timestamp: '10:42:10', level: 'error', message: 'Department of War Archival Access connection timed out. Route unreachable.', subsystem: 'war-archives' }
];

// ==========================================
// CUSTOM INLINE SVG ICONS (To avoid external dependency issues)
// ==========================================

const Icons = {
  Shield: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
    </svg>
  ),
  Activity: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M13 10V3L4 14h7v7l9-11h-7z" />
    </svg>
  ),
  Terminal: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 9l3 3-3 3m5 0h3M5 20h14a2 2 0 002-2V6a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
    </svg>
  ),
  Alert: () => (
    <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
    </svg>
  ),
  Lock: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
    </svg>
  ),
  Unlock: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M8 11V7a4 4 0 118 0m-4 8v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2z" />
    </svg>
  ),
  Refresh: () => (
    <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
      <path strokeLinecap="round" strokeLinejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 1121.21 7.89M9 11l3-3 3 3m-3-3v12" />
    </svg>
  )
};

// ==========================================
// MAIN COMPONENT
// ==========================================

export default function DiagnosticAuthConsole() {
  // Authentication State
  const [diagnosticKey, setDiagnosticKey] = useState('');
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [authError, setAuthError] = useState('');
  const [isAuthenticating, setIsAuthenticating] = useState(false);

  // Console Navigation & View State
  const [activeTab, setActiveTab] = useState<'overview' | 'subsystems' | 'overrides' | 'logs'>('overview');
  const [subsystems, setSubsystems] = useState<SubsystemStatus[]>(INITIAL_SUBSYSTEMS);
  const [logs, setLogs] = useState<LogEntry[]>(INITIAL_LOGS);
  const [logFilter, setLogFilter] = useState<string>('all');
  
  // Diagnostic Execution State
  const [isScanning, setIsScanning] = useState(false);
  const [scanProgress, setScanProgress] = useState(0);
  const [currentScanItem, setCurrentScanItem] = useState('');

  // Emergency Override State
  const [overrideCode, setOverrideCode] = useState('');
  const [isOverrideActive, setIsOverrideActive] = useState(false);
  const [overrideError, setOverrideError] = useState('');

  // Live Metrics Simulation
  const [metrics, setMetrics] = useState<DiagnosticMetric>({
    cpuUsage: 24.5,
    memoryUsage: 61.2,
    networkThroughput: 142.8,
    activeConnections: 18
  });

  const logEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll logs
  useEffect(() => {
    if (logEndRef.current) {
      logEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [logs]);

  // Simulate live metrics fluctuation
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => ({
        cpuUsage: Math.max(10, Math.min(95, +(prev.cpuUsage + (Math.random() * 10 - 5)).toFixed(1))),
        memoryUsage: Math.max(40, Math.min(98, +(prev.memoryUsage + (Math.random() * 2 - 1)).toFixed(1))),
        networkThroughput: Math.max(50, Math.min(500, +(prev.networkThroughput + (Math.random() * 40 - 20)).toFixed(1))),
        activeConnections: Math.max(5, Math.min(100, prev.activeConnections + (Math.random() > 0.7 ? 1 : Math.random() < 0.3 ? -1 : 0)))
      }));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  // Helper to append logs
  const addLog = useCallback((message: string, level: LogEntry['level'] = 'info', subsystem: string = 'SYSTEM') => {
    const now = new Date();
    const timestamp = now.toTimeString().split(' ')[0];
    const newLog: LogEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp,
      level,
      message,
      subsystem
    };
    setLogs(prev => [...prev, newLog]);
  }, []);

  // Handle Cryptographic Key Authentication
  const handleAuthenticate = (e: React.FormEvent) => {
    e.preventDefault();
    if (!diagnosticKey.trim()) {
      setAuthError('Cryptographic key cannot be empty.');
      return;
    }

    setIsAuthenticating(true);
    setAuthError('');

    // Simulate cryptographic verification delay
    setTimeout(() => {
      // Accept any key containing 'SOVEREIGN' or 'ADMIN' or '00_MASTER' for demo purposes
      const isValid = diagnosticKey.toUpperCase().includes('SOVEREIGN') || 
                      diagnosticKey.toUpperCase().includes('ADMIN') || 
                      diagnosticKey.toUpperCase().includes('00_MASTER') ||
                      diagnosticKey === 'citi-secure-2024';

      if (isValid) {
        setIsAuthenticated(true);
        addLog('Sovereign Cryptographic Key verified successfully. Access granted.', 'success', 'AUTH');
        addLog('Session established under Executive Order 00_Master_Compiled_Executive_Order.', 'info', 'AUTH');
      } else {
        setAuthError('Invalid Cryptographic Key. Access Denied.');
        addLog(`Failed authentication attempt using key: ${diagnosticKey.substring(0, 8)}...`, 'critical', 'AUTH');
      }
      setIsAuthenticating(false);
    }, 1500);
  };

  // Run Full System Diagnostics
  const runDiagnostics = async () => {
    if (isScanning) return;
    setIsScanning(true);
    setScanProgress(0);
    addLog('Initiating comprehensive system diagnostics across all tree nodes...', 'info', 'DIAG');

    const steps = [
      { name: 'Verifying Google Secret Vault Shims...', subsystem: 'secret-vault', status: 'nominal' },
      { name: 'Auditing UCC Financial Loophole compliance (Dossier 01)...', subsystem: 'ucc-loophole', status: 'nominal' },
      { name: 'Scanning SAVE API Vulnerabilities (Dossier 02)...', subsystem: 'save-api', status: 'degraded' },
      { name: 'Testing mTLS AI Bank Architecture handshake...', subsystem: 'mtls-bank', status: 'nominal' },
      { name: 'Validating Sovereign ID Cryptography ledger sync...', subsystem: 'sovereign-id', status: 'nominal' },
      { name: 'Probing Department of War Archival Access (Dossier 10)...', subsystem: 'war-archives', status: 'offline' },
      { name: 'Checking Citi Sovereign Ledger Bridge (part17)...', subsystem: 'citi-bridge', status: 'nominal' },
      { name: 'Evaluating Vector Collapse Protocol readiness (Dossier 13)...', subsystem: 'vector-collapse', status: 'nominal' }
    ];

    for (let i = 0; i < steps.length; i++) {
      const step = steps[i];
      setCurrentScanItem(step.name);
      addLog(`Scanning: ${step.name}`, 'info', step.subsystem);
      
      // Simulate network latency
      await new Promise(resolve => setTimeout(resolve, 800));
      
      // Update subsystem status dynamically based on scan
      setSubsystems(prev => prev.map(sub => {
        if (sub.id === step.subsystem) {
          return {
            ...sub,
            latency: step.status === 'offline' ? 0 : Math.floor(Math.random() * 50) + 15,
            integrityScore: step.status === 'nominal' ? 99 + Math.random() : step.status === 'degraded' ? 80 + Math.random() * 5 : 0,
            status: step.status as SubsystemStatus['status']
          };
        }
        return sub;
      }));

      if (step.status === 'nominal') {
        addLog(`Subsystem [${step.subsystem}] is NOMINAL. Integrity verified.`, 'success', step.subsystem);
      } else if (step.status === 'degraded') {
        addLog(`Subsystem [${step.subsystem}] is DEGRADED. Vulnerabilities detected.`, 'warn', step.subsystem);
      } else {
        addLog(`Subsystem [${step.subsystem}] is OFFLINE. Critical connection failure.`, 'error', step.subsystem);
      }

      setScanProgress(Math.round(((i + 1) / steps.length) * 100));
    }

    setIsScanning(false);
    setCurrentScanItem('');
    addLog('System diagnostics completed. Review degraded/offline nodes immediately.', 'warn', 'DIAG');
  };

  // Handle Emergency Override Activation
  const handleEmergencyOverride = (e: React.FormEvent) => {
    e.preventDefault();
    if (overrideCode !== 'VECTOR-COLLAPSE-99') {
      setOverrideError('Invalid Emergency Authorization Code.');
      addLog('UNAUTHORIZED EMERGENCY OVERRIDE ATTEMPT DETECTED.', 'critical', 'OVERRIDE');
      return;
    }

    setIsOverrideActive(true);
    setOverrideError('');
    addLog('EMERGENCY OVERRIDE ACTIVATED. VECTOR COLLAPSE PROTOCOL ENGAGED.', 'critical', 'OVERRIDE');
    addLog('All non-essential outbound API connections severed. Local sandbox isolated.', 'warn', 'OVERRIDE');
    
    // Force all subsystems to degraded/offline except security
    setSubsystems(prev => prev.map(sub => {
      if (sub.id === 'vector-collapse' || sub.id === 'secret-vault') {
        return { ...sub, status: 'nominal', integrityScore: 100 };
      }
      return { ...sub, status: 'offline', latency: 0, integrityScore: 0 };
    }));
  };

  // Reset Override
  const resetOverride = () => {
    setIsOverrideActive(false);
    setOverrideCode('');
    addLog('Emergency override disengaged. Restoring standard routing protocols.', 'success', 'OVERRIDE');
    setSubsystems(INITIAL_SUBSYSTEMS);
  };

  // Filtered Logs
  const filteredLogs = logs.filter(log => {
    if (logFilter === 'all') return true;
    return log.level === logFilter;
  });

  // ==========================================
  // RENDER: UNAUTHORIZED SCREEN
  // ==========================================
  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-100 flex items-center justify-center p-4 font-mono selection:bg-emerald-500 selection:text-black">
        {/* Cyberpunk Grid Background */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#0f172a_1px,transparent_1px),linear-gradient(to_bottom,#0f172a_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none" />

        <div className="relative w-full max-w-md border border-emerald-500/30 bg-slate-900/80 backdrop-blur-md p-8 rounded-lg shadow-2xl shadow-emerald-950/20">
          {/* Top Warning Bar */}
          <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-emerald-500 via-teal-500 to-emerald-600 rounded-t-lg" />

          <div className="flex flex-col items-center text-center mb-8">
            <div className="p-4 bg-emerald-950/50 border border-emerald-500/30 rounded-full text-emerald-400 mb-4 animate-pulse">
              <Icons.Shield />
            </div>
            <h1 className="text-xl font-bold tracking-wider text-emerald-400 uppercase">Sovereign Diagnostic Console</h1>
            <p className="text-xs text-slate-400 mt-2">
              Authorized Personnel Only. Access governed by Executive Order 00_Master_Compiled_Executive_Order.
            </p>
          </div>

          <form onSubmit={handleAuthenticate} className="space-y-6">
            <div>
              <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                Cryptographic Diagnostic Key
              </label>
              <div className="relative">
                <input
                  type="password"
                  value={diagnosticKey}
                  onChange={(e) => setDiagnosticKey(e.target.value)}
                  placeholder="Enter Sovereign Key..."
                  className="w-full bg-slate-950 border border-slate-800 focus:border-emerald-500/50 focus:ring-1 focus:ring-emerald-500/30 rounded px-4 py-3 text-sm text-emerald-300 placeholder-slate-600 outline-none transition-all font-mono"
                  disabled={isAuthenticating}
                />
                <div className="absolute right-3 top-3.5 text-slate-600">
                  <Icons.Lock />
                </div>
              </div>
              {authError && (
                <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                  <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                  {authError}
                </p>
              )}
            </div>

            <button
              type="submit"
              disabled={isAuthenticating}
              className="w-full bg-emerald-600 hover:bg-emerald-500 active:bg-emerald-700 text-slate-950 font-bold py-3 px-4 rounded text-sm uppercase tracking-wider transition-all flex items-center justify-center gap-2 disabled:opacity-50"
            >
              {isAuthenticating ? (
                <>
                  <span className="w-4 h-4 border-2 border-slate-950 border-t-transparent rounded-full animate-spin" />
                  Verifying Signature...
                </>
              ) : (
                <>
                  <Icons.Unlock />
                  Authenticate Console
                </>
              )}
            </button>
          </form>

          <div className="mt-8 pt-6 border-t border-slate-800/60 text-center">
            <span className="text-[10px] text-slate-500 uppercase tracking-widest">
              System Status: Secure Sandbox Active
            </span>
          </div>
        </div>
      </div>
    );
  }

  // ==========================================
  // RENDER: AUTHORIZED CONSOLE
  // ==========================================
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-mono flex flex-col selection:bg-emerald-500 selection:text-black">
      {/* Top Navigation Header */}
      <header className="border-b border-slate-800 bg-slate-900/50 backdrop-blur px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-emerald-950/50 border border-emerald-500/30 rounded text-emerald-400">
            <Icons.Shield />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h1 className="text-sm font-bold tracking-wider text-emerald-400 uppercase">Sovereign Diagnostic Console</h1>
              <span className="text-[10px] bg-emerald-950 text-emerald-400 border border-emerald-500/30 px-1.5 py-0.5 rounded uppercase font-bold">
                v4.2.1
              </span>
            </div>
            <p className="text-xs text-slate-400">Active Session: Executive Order Master Node</p>
          </div>
        </div>

        {/* Live Metrics Bar */}
        <div className="flex flex-wrap items-center gap-6 text-xs text-slate-400">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>CPU: <strong className="text-slate-200">{metrics.cpuUsage}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-teal-500" />
            <span>MEM: <strong className="text-slate-200">{metrics.memoryUsage}%</strong></span>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-500" />
            <span>NET: <strong className="text-slate-200">{metrics.networkThroughput} MB/s</strong></span>
          </div>
          <button 
            onClick={() => setIsAuthenticated(false)}
            className="text-xs bg-slate-800 hover:bg-rose-950 hover:text-rose-400 border border-slate-700 hover:border-rose-900 px-3 py-1.5 rounded transition-all uppercase tracking-wider"
          >
            Lock Console
          </button>
        </div>
      </header>

      {/* Main Workspace Grid */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-6 p-6">
        
        {/* Left Sidebar: Navigation & Quick Actions */}
        <div className="lg:col-span-3 flex flex-col gap-6">
          {/* Navigation Card */}
          <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-4 flex flex-col gap-2">
            <span className="text-xs uppercase tracking-widest text-slate-500 mb-2 px-2">Console Navigation</span>
            
            <button
              onClick={() => setActiveTab('overview')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                activeTab === 'overview' 
                  ? 'bg-emerald-950/40 text-emerald-400 border-l-2 border-emerald-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icons.Shield />
              <span>Overview & Metrics</span>
            </button>

            <button
              onClick={() => setActiveTab('subsystems')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                activeTab === 'subsystems' 
                  ? 'bg-emerald-950/40 text-emerald-400 border-l-2 border-emerald-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icons.Activity />
              <span>Subsystem Nodes</span>
            </button>

            <button
              onClick={() => setActiveTab('logs')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                activeTab === 'logs' 
                  ? 'bg-emerald-950/40 text-emerald-400 border-l-2 border-emerald-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icons.Terminal />
              <span>Live Terminal Logs</span>
            </button>

            <button
              onClick={() => setActiveTab('overrides')}
              className={`w-full flex items-center gap-3 px-3 py-2.5 rounded text-sm transition-all ${
                activeTab === 'overrides' 
                  ? 'bg-rose-950/30 text-rose-400 border-l-2 border-rose-500' 
                  : 'text-slate-400 hover:bg-slate-800/50 hover:text-slate-200'
              }`}
            >
              <Icons.Alert />
              <span>Emergency Overrides</span>
            </button>
          </div>

          {/* Quick Diagnostics Trigger */}
          <div className="border border-slate-800 bg-slate-900/30 rounded-lg p-4 flex flex-col gap-4">
            <div>
              <h3 className="text-xs uppercase tracking-widest text-slate-400 font-bold">System Integrity Scan</h3>
              <p className="text-[11px] text-slate-500 mt-1">Triggers a real-time audit of all files and API endpoints in the tree.</p>
            </div>

            {isScanning ? (
              <div className="space-y-2">
                <div className="flex justify-between text-xs">
                  <span className="text-emerald-400 animate-pulse">Scanning...</span>
                  <span className="text-slate-400">{scanProgress}%</span>
                </div>
                <div className="w-full bg-slate-950 h-1.5 rounded-full overflow-hidden border border-slate-800">
                  <div className="bg-emerald-500 h-full transition-all duration-300" style={{ width: `${scanProgress}%` }} />
                </div>
                <p className="text-[10px] text-slate-400 truncate">{currentScanItem}</p>
              </div>
            ) : (
              <button
                onClick={runDiagnostics}
                className="w-full bg-slate-800 hover:bg-slate-700 text-emerald-400 border border-emerald-500/30 hover:border-emerald-500/50 py-2.5 px-4 rounded text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
              >
                <Icons.Refresh />
                Run Full Diagnostics
              </button>
            )}
          </div>
        </div>

        {/* Right Main Panel: Dynamic Content */}
        <div className="lg:col-span-9 flex flex-col gap-6">
          
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-6">
              {/* System Status Banner */}
              <div className={`border p-6 rounded-lg flex flex-col md:flex-row items-start md:items-center justify-between gap-4 ${
                isOverrideActive 
                  ? 'bg-rose-950/20 border-rose-500/30 text-rose-400' 
                  : 'bg-emerald-950/10 border-emerald-500/20 text-emerald-400'
              }`}>
                <div>
                  <h2 className="text-lg font-bold uppercase tracking-wider">
                    {isOverrideActive ? 'CRITICAL: EMERGENCY OVERRIDE ACTIVE' : 'SYSTEM STATUS: NOMINAL'}
                  </h2>
                  <p className="text-xs text-slate-400 mt-1">
                    {isOverrideActive 
                      ? 'Vector Collapse Protocol engaged. Standard routing disabled. Local sandbox isolated.' 
                      : 'All core systems operational. Minor latency detected on SAVE API Gateway.'}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`w-3 h-3 rounded-full animate-ping ${isOverrideActive ? 'bg-rose-500' : 'bg-emerald-500'}`} />
                  <span className="text-xs uppercase tracking-widest font-bold">
                    {isOverrideActive ? 'SECURE ISOLATION' : 'ONLINE'}
                  </span>
                </div>
              </div>

              {/* Subsystem Grid Summary */}
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                {subsystems.slice(0, 4).map(sub => (
                  <div key={sub.id} className="border border-slate-800 bg-slate-900/20 p-4 rounded-lg flex flex-col justify-between gap-3">
                    <div>
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-bold text-slate-300 truncate max-w-[150px]">{sub.name}</span>
                        <span className={`w-2 h-2 rounded-full ${
                          sub.status === 'nominal' ? 'bg-emerald-500' : sub.status === 'degraded' ? 'bg-amber-500' : 'bg-rose-500'
                        }`} />
                      </div>
                      <p className="text-[10px] text-slate-500 truncate mt-1">{sub.path}</p>
                    </div>
                    <div className="flex items-end justify-between mt-2">
                      <div>
                        <span className="text-[10px] text-slate-500 uppercase block">Latency</span>
                        <span className="text-xs text-slate-300">{sub.latency > 0 ? `${sub.latency}ms` : 'N/A'}</span>
                      </div>
                      <div className="text-right">
                        <span className="text-[10px] text-slate-500 uppercase block">Integrity</span>
                        <span className="text-xs text-slate-300">{sub.integrityScore.toFixed(1)}%</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Quick Terminal Preview */}
              <div className="border border-slate-800 bg-slate-900/40 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3 border-b border-slate-800 pb-2">
                  <span className="text-xs uppercase tracking-widest text-slate-400">Live Terminal Feed</span>
                  <button onClick={() => setActiveTab('logs')} className="text-[10px] text-emerald-400 hover:underline uppercase">
                    View Full Terminal
                  </button>
                </div>
                <div className="bg-slate-950 p-3 rounded border border-slate-900 h-48 overflow-y-auto font-mono text-xs space-y-1.5">
                  {logs.slice(-6).map(log => (
                    <div key={log.id} className="flex items-start gap-2">
                      <span className="text-slate-600">[{log.timestamp}]</span>
                      <span className={`uppercase font-bold text-[10px] px-1 rounded ${
                        log.level === 'success' ? 'bg-emerald-950 text-emerald-400' :
                        log.level === 'warn' ? 'bg-amber-950 text-amber-400' :
                        log.level === 'error' ? 'bg-rose-950 text-rose-400' :
                        log.level === 'critical' ? 'bg-red-900 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-slate-500">[{log.subsystem}]</span>
                      <span className="text-slate-300 flex-1">{log.message}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: SUBSYSTEMS */}
          {activeTab === 'subsystems' && (
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-emerald-400">Subsystem Registry</h2>
                  <p className="text-xs text-slate-400">Real-time status of all files, compliance engines, and API bridges.</p>
                </div>
                <button 
                  onClick={runDiagnostics}
                  className="bg-slate-800 hover:bg-slate-700 text-xs text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded transition-all uppercase tracking-wider"
                >
                  Re-Scan All
                </button>
              </div>

              <div className="border border-slate-800 bg-slate-900/20 rounded-lg overflow-hidden">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 bg-slate-900/50 text-xs uppercase tracking-widest text-slate-400">
                      <th className="p-4">Subsystem Node</th>
                      <th className="p-4">Tree Path Reference</th>
                      <th className="p-4">Status</th>
                      <th className="p-4 text-right">Latency</th>
                      <th className="p-4 text-right">Integrity Score</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs">
                    {subsystems.map(sub => (
                      <tr key={sub.id} className="hover:bg-slate-900/30 transition-all">
                        <td className="p-4 font-bold text-slate-200">{sub.name}</td>
                        <td className="p-4 text-slate-500 font-mono text-[11px] max-w-xs truncate" title={sub.path}>
                          {sub.path}
                        </td>
                        <td className="p-4">
                          <span className={`inline-flex items-center gap-1.5 px-2 py-0.5 rounded text-[10px] uppercase font-bold ${
                            sub.status === 'nominal' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' :
                            sub.status === 'degraded' ? 'bg-amber-950 text-amber-400 border border-amber-500/20' :
                            sub.status === 'compromised' ? 'bg-rose-950 text-rose-400 border border-rose-500/20' :
                            'bg-slate-900 text-slate-500 border border-slate-800'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${
                              sub.status === 'nominal' ? 'bg-emerald-500' :
                              sub.status === 'degraded' ? 'bg-amber-500' :
                              sub.status === 'compromised' ? 'bg-rose-500' : 'bg-slate-600'
                            }`} />
                            {sub.status}
                          </span>
                        </td>
                        <td className="p-4 text-right text-slate-300 font-mono">
                          {sub.latency > 0 ? `${sub.latency} ms` : 'OFFLINE'}
                        </td>
                        <td className="p-4 text-right font-mono">
                          <span className={sub.integrityScore > 95 ? 'text-emerald-400' : sub.integrityScore > 80 ? 'text-amber-400' : 'text-rose-500'}>
                            {sub.integrityScore.toFixed(1)}%
                          </span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: TERMINAL LOGS */}
          {activeTab === 'logs' && (
            <div className="space-y-4 flex-1 flex flex-col">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-base font-bold uppercase tracking-wider text-emerald-400">Live Terminal Logs</h2>
                  <p className="text-xs text-slate-400">Cryptographically signed system events and diagnostic outputs.</p>
                </div>

                {/* Log Filters */}
                <div className="flex flex-wrap gap-2">
                  {['all', 'info', 'success', 'warn', 'error', 'critical'].map(filter => (
                    <button
                      key={filter}
                      onClick={() => setLogFilter(filter)}
                      className={`px-2.5 py-1 rounded text-[10px] uppercase font-bold tracking-wider border transition-all ${
                        logFilter === filter
                          ? 'bg-emerald-950 text-emerald-400 border-emerald-500/40'
                          : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200'
                      }`}
                    >
                      {filter}
                    </button>
                  ))}
                </div>
              </div>

              {/* Terminal Window */}
              <div className="flex-1 border border-slate-800 bg-slate-950 rounded-lg p-4 flex flex-col min-h-[400px]">
                <div className="flex items-center justify-between border-b border-slate-900 pb-2 mb-3 text-[10px] text-slate-500">
                  <span>SESSION_ID: SECURE_SANDBOX_NODE_A</span>
                  <span>LOG_COUNT: {filteredLogs.length}</span>
                </div>

                <div className="flex-1 overflow-y-auto space-y-2 font-mono text-xs pr-2 max-h-[450px]">
                  {filteredLogs.map(log => (
                    <div key={log.id} className="flex items-start gap-2 hover:bg-slate-900/30 py-0.5 px-1 rounded transition-all">
                      <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                      <span className={`uppercase font-bold text-[9px] px-1.5 py-0.5 rounded select-none ${
                        log.level === 'success' ? 'bg-emerald-950 text-emerald-400 border border-emerald-500/20' :
                        log.level === 'warn' ? 'bg-amber-950 text-amber-400 border border-amber-500/20' :
                        log.level === 'error' ? 'bg-rose-950 text-rose-400 border border-rose-500/20' :
                        log.level === 'critical' ? 'bg-red-900 text-white' : 'bg-slate-800 text-slate-400'
                      }`}>
                        {log.level}
                      </span>
                      <span className="text-slate-500 select-none">[{log.subsystem}]</span>
                      <span className="text-slate-300 flex-1">{log.message}</span>
                    </div>
                  ))}
                  <div ref={logEndRef} />
                </div>

                <div className="mt-4 pt-3 border-t border-slate-900 flex items-center justify-between">
                  <button
                    onClick={() => setLogs([])}
                    className="text-[10px] text-slate-500 hover:text-rose-400 uppercase tracking-wider transition-all"
                  >
                    Clear Terminal Buffer
                  </button>
                  <span className="text-[10px] text-slate-600 uppercase">
                    Secure Log Stream Active
                  </span>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: EMERGENCY OVERRIDES */}
          {activeTab === 'overrides' && (
            <div className="space-y-6">
              <div>
                <h2 className="text-base font-bold uppercase tracking-wider text-rose-500">Emergency Overrides</h2>
                <p className="text-xs text-slate-400">High-risk administrative actions to isolate systems or trigger emergency protocols.</p>
              </div>

              {/* Warning Banner */}
              <div className="border border-rose-500/30 bg-rose-950/10 p-6 rounded-lg flex items-start gap-4">
                <div className="p-3 bg-rose-950/50 border border-rose-500/30 rounded text-rose-400 shrink-0">
                  <Icons.Alert />
                </div>
                <div>
                  <h3 className="text-sm font-bold uppercase tracking-wider text-rose-400">CRITICAL WARNING</h3>
                  <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                    Executing emergency overrides will disrupt standard routing, sever active API connections with Citibank, 
                    and isolate the Sovereign ID Cryptography ledger. These actions are logged directly to the 
                    <strong className="text-slate-200"> Department of War Archival Access</strong> audit trail.
                  </p>
                </div>
              </div>

              {/* Override Control Panel */}
              <div className="border border-slate-800 bg-slate-900/20 rounded-lg p-6">
                {isOverrideActive ? (
                  <div className="space-y-4 text-center py-6">
                    <div className="inline-block p-4 bg-rose-950/50 border border-rose-500/30 rounded-full text-rose-500 animate-bounce mb-2">
                      <Icons.Alert />
                    </div>
                    <h3 className="text-lg font-bold text-rose-500 uppercase tracking-widest">VECTOR COLLAPSE PROTOCOL ENGAGED</h3>
                    <p className="text-xs text-slate-400 max-w-md mx-auto">
                      All external API bridges are offline. The system is running in isolated local sandbox mode.
                    </p>
                    <button
                      onClick={resetOverride}
                      className="mt-4 bg-emerald-600 hover:bg-emerald-500 text-slate-950 font-bold py-2.5 px-6 rounded text-xs uppercase tracking-wider transition-all"
                    >
                      Disengage Override & Restore Systems
                    </button>
                  </div>
                ) : (
                  <form onSubmit={handleEmergencyOverride} className="space-y-4">
                    <div>
                      <label className="block text-xs uppercase tracking-widest text-slate-400 mb-2">
                        Emergency Authorization Code
                      </label>
                      <input
                        type="password"
                        value={overrideCode}
                        onChange={(e) => setOverrideCode(e.target.value)}
                        placeholder="Enter Code (e.g., VECTOR-COLLAPSE-99)..."
                        className="w-full bg-slate-950 border border-slate-800 focus:border-rose-500/50 focus:ring-1 focus:ring-rose-500/30 rounded px-4 py-3 text-sm text-rose-400 placeholder-slate-700 outline-none transition-all font-mono"
                      />
                      {overrideError && (
                        <p className="text-xs text-rose-500 mt-2 flex items-center gap-1">
                          <span className="inline-block w-1.5 h-1.5 bg-rose-500 rounded-full animate-ping" />
                          {overrideError}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        className="w-full bg-rose-600 hover:bg-rose-500 active:bg-rose-700 text-slate-950 font-bold py-3 px-4 rounded text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2"
                      >
                        <Icons.Alert />
                        Engage Vector Collapse Protocol
                      </button>
                    </div>
                  </form>
                )}
              </div>

              {/* Protocol Reference List */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-slate-800 bg-slate-900/10 p-4 rounded-lg">
                  <h4 className="text-xs font-bold uppercase text-slate-300 mb-1">Dossier 13: Vector Collapse</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Designed to immediately sever all outbound connections to modern-treasury, stripe, and alpaca API endpoints in the event of a sovereign ledger compromise.
                  </p>
                </div>
                <div className="border border-slate-800 bg-slate-900/10 p-4 rounded-lg">
                  <h4 className="text-xs font-bold uppercase text-slate-300 mb-1">Dossier 12: Task Force Sunset</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed">
                    Gracefully de-provisions all active service principals and rotates cryptographic keys across the Google Cloud and Azure Gov compliance environments.
                  </p>
                </div>
              </div>
            </div>
          )}

        </div>
      </div>

      {/* Footer Status Bar */}
      <footer className="border-t border-slate-800 bg-slate-900/30 px-6 py-3 flex flex-col sm:flex-row items-center justify-between gap-2 text-[10px] text-slate-500">
        <span>Sovereign Diagnostic Console Node: SECURE_LOCAL_SANDBOX</span>
        <span className="uppercase tracking-widest">
          Governed by Executive Order 00_Master_Compiled_Executive_Order
        </span>
      </footer>
    </div>
  );
}