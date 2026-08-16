import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  Terminal,
  Play,
  Pause,
  RefreshCw,
  Download,
  Filter,
  CheckCircle,
  XCircle,
  AlertTriangle,
  Clock,
  Activity,
  Cpu,
  Layers,
  Search,
  Copy,
  Trash2,
  Wifi,
  WifiOff,
  Server,
  Zap,
  ShieldCheck,
  Maximize2,
  Minimize2,
  ChevronRight,
  ChevronDown,
  Info,
  Radio,
  FileText,
  Sliders,
  Check,
  ArrowDown
} from 'lucide-react';

// --- TYPES & INTERFACES ---

export type LogLevel = 'INFO' | 'WARN' | 'ERROR' | 'DEBUG' | 'BUILD' | 'SECURITY' | 'PQC';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: LogLevel;
  source: string;
  message: string;
  metadata?: Record<string, any>;
  stageId?: string;
}

export type DeploymentStageId =
  | 'queued'
  | 'security_audit'
  | 'ast_parse'
  | 'dependency_resolver'
  | 'container_build'
  | 'pqc_signing'
  | 'edge_deploy'
  | 'health_check';

export type StageStatus = 'pending' | 'in_progress' | 'completed' | 'failed' | 'skipped';

export interface DeploymentStage {
  id: DeploymentStageId;
  name: string;
  status: StageStatus;
  durationMs?: number;
  error?: string;
  description: string;
}

export interface MicroAppBuild {
  buildId: string;
  appName: string;
  appPath: string;
  version: string;
  commitHash: string;
  initiatedBy: string;
  startTime: string;
  endTime?: string;
  status: 'ACTIVE' | 'SUCCESS' | 'FAILED' | 'CANCELLED';
  environment: 'production' | 'staging' | 'sovereign-sandbox';
  stages: DeploymentStage[];
  memoryPeakMb?: number;
  cpuPeakPercent?: number;
  artifacts?: string[];
}

// Sample Apps matching repo structure
const MOCK_MICRO_APPS = [
  { id: 'pqc_crypto_bridge_simulator', name: 'PQC Crypto Bridge Simulator', path: 'apps/pqc_crypto_bridge_simulator' },
  { id: 'citi_account_anomaly_detector', name: 'Citi Account Anomaly Detector', path: 'apps/citi_account_anomaly_detector' },
  { id: 'voter_registration_portal', name: 'Voter Registration Portal', path: 'apps/voter_registration_portal' },
  { id: 'military_fund_allocator', name: 'Military Fund Allocator', path: 'apps/military_fund_allocator' },
  { id: 'balance_transfer_disbursement_orchestrator', name: 'Balance Transfer Orchestrator', path: 'apps/balance_transfer_disbursement_orchestrator' },
  { id: 'cross_cloud_federation_manager', name: 'Cross Cloud Federation Manager', path: 'apps/cross_cloud_federation_manager' },
  { id: 'azure_ad_app_auditor', name: 'Azure AD App Auditor', path: 'apps/azure_ad_app_auditor' },
  { id: 'b2b_routing_decryptor_validator', name: 'B2B Routing Decryptor', path: 'apps/b2b_routing_decryptor_validator' },
];

// Initial stages blueprint
const INITIAL_STAGES: DeploymentStage[] = [
  { id: 'queued', name: 'Queue Entry', status: 'completed', durationMs: 120, description: 'Ingested into global deployment pipeline' },
  { id: 'security_audit', name: 'Security & FedRAMP Scan', status: 'completed', durationMs: 1450, description: 'SAST & Zero-Knowledge compliance check' },
  { id: 'ast_parse', name: 'AST & Schema Validation', status: 'completed', durationMs: 820, description: 'Checking OpenAPI and CAMT053 schema specs' },
  { id: 'dependency_resolver', name: 'Dependency Resolution', status: 'completed', durationMs: 2100, description: 'Resolving sovereign APIs & AppRegistry bridges' },
  { id: 'container_build', name: 'Sub-second Container Build', status: 'in_progress', durationMs: undefined, description: 'Compiling Bun/TSX edge artifact' },
  { id: 'pqc_signing', name: 'PQC Lattice Signature', status: 'pending', durationMs: undefined, description: 'Kyber1024 quantum-proof validation' },
  { id: 'edge_deploy', name: 'Global Edge Sync', status: 'pending', durationMs: undefined, description: 'Deploying to 35 sector edge nodes' },
  { id: 'health_check', name: 'Synthetic Health Ping', status: 'pending', durationMs: undefined, description: 'Verifying REST & FAPI latency' },
];

const HISTORICAL_BUILDS: MicroAppBuild[] = [
  {
    buildId: 'bld-09281-pqc',
    appName: 'PQC Crypto Bridge Simulator',
    appPath: 'apps/pqc_crypto_bridge_simulator',
    version: 'v2.4.12',
    commitHash: '8f3a91c',
    initiatedBy: 'sec-admin@sovereign.gov',
    startTime: new Date(Date.now() - 3600000 * 2).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 2 + 14500).toISOString(),
    status: 'SUCCESS',
    environment: 'production',
    memoryPeakMb: 142,
    cpuPeakPercent: 38,
    artifacts: ['pqc_bridge.wasm', 'signature_verifier.bin'],
    stages: INITIAL_STAGES.map(s => ({ ...s, status: 'completed', durationMs: Math.floor(Math.random() * 800) + 200 }))
  },
  {
    buildId: 'bld-08110-citi',
    appName: 'Citi Account Anomaly Detector',
    appPath: 'apps/citi_account_anomaly_detector',
    version: 'v1.0.8',
    commitHash: '1a94e02',
    initiatedBy: 'ci-bot@citiconnect.com',
    startTime: new Date(Date.now() - 3600000 * 12).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 12 + 18200).toISOString(),
    status: 'SUCCESS',
    environment: 'sovereign-sandbox',
    memoryPeakMb: 210,
    cpuPeakPercent: 62,
    artifacts: ['anomaly_detector.py', 'rules_engine.so'],
    stages: INITIAL_STAGES.map(s => ({ ...s, status: 'completed', durationMs: Math.floor(Math.random() * 900) + 300 }))
  },
  {
    buildId: 'bld-07742-voter',
    appName: 'Voter Registration Portal',
    appPath: 'apps/voter_registration_portal',
    version: 'v3.1.0-rc1',
    commitHash: '77bc11f',
    initiatedBy: 'elections-lead@state.fl.gov',
    startTime: new Date(Date.now() - 3600000 * 24).toISOString(),
    endTime: new Date(Date.now() - 3600000 * 24 + 8100).toISOString(),
    status: 'FAILED',
    environment: 'staging',
    memoryPeakMb: 310,
    cpuPeakPercent: 91,
    artifacts: [],
    stages: INITIAL_STAGES.map((s, idx) => {
      if (idx < 3) return { ...s, status: 'completed', durationMs: 400 };
      if (idx === 3) return { ...s, status: 'failed', error: 'Dependency mismatch: SAVE API v3 payload failed validation', durationMs: 1200 };
      return { ...s, status: 'pending' };
    })
  }
];

export const DeploymentStreamViewer: React.FC = () => {
  // --- STATE ---
  const [selectedApp, setSelectedApp] = useState(MOCK_MICRO_APPS[0]);
  const [sseEndpoint, setSseEndpoint] = useState<string>('/api/deployments/stream');
  const [isConnected, setIsConnected] = useState<boolean>(true);
  const [isPaused, setIsPaused] = useState<boolean>(false);
  const [autoScroll, setAutoScroll] = useState<boolean>(true);
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedLevels, setSelectedLevels] = useState<LogLevel[]>([
    'INFO',
    'WARN',
    'ERROR',
    'BUILD',
    'SECURITY',
    'PQC'
  ]);
  const [logs, setLogs] = useState<LogEntry[]>([]);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [activeTab, setActiveTab] = useState<'stream' | 'stages' | 'history' | 'artifacts'>('stream');
  
  // Pipeline & active build state
  const [currentBuild, setCurrentBuild] = useState<MicroAppBuild>({
    buildId: `bld-${Math.floor(10000 + Math.random() * 90000)}-live`,
    appName: MOCK_MICRO_APPS[0].name,
    appPath: MOCK_MICRO_APPS[0].path,
    version: 'v4.2.0-deploy',
    commitHash: Math.random().toString(36).substring(2, 9),
    initiatedBy: 'operator@sovereign-mesh.io',
    startTime: new Date().toISOString(),
    status: 'ACTIVE',
    environment: 'production',
    stages: INITIAL_STAGES,
    memoryPeakMb: 128,
    cpuPeakPercent: 24,
    artifacts: ['build_bundle.js', 'manifest.json', 'pqc_seal.sig']
  });

  const logContainerRef = useRef<HTMLDivElement>(null);
  const streamEventSourceRef = useRef<EventSource | null>(null);

  // --- INITIAL LOG GENERATION & SSE SIMULATION ---
  const generateInitialLogs = useCallback(() => {
    const app = selectedApp.id;
    const initialMsgs: LogEntry[] = [
      {
        id: 'msg-1',
        timestamp: new Date(Date.now() - 15000).toISOString(),
        level: 'SYSTEM',
        source: 'DeploymentOrchestrator',
        message: `Initializing Build Stream for target micro-app: ${selectedApp.name}`,
        metadata: { path: selectedApp.path, env: 'production', node: 'us-east-dc1' }
      },
      {
        id: 'msg-2',
        timestamp: new Date(Date.now() - 14000).toISOString(),
        level: 'BUILD',
        source: 'AppManifestParser',
        message: 'Parsing manifest from EcosystemConfig.ts...',
        metadata: { status: 'parsed_ok', permissions: ['IDENTITY_READ', 'TREASURY_WRITE'] }
      },
      {
        id: 'msg-3',
        timestamp: new Date(Date.now() - 12000).toISOString(),
        level: 'SECURITY',
        source: 'SecurityScanner',
        message: 'FedRAMP High baseline scan initiated. Checking NIST 800-53 controls.',
      },
      {
        id: 'msg-4',
        timestamp: new Date(Date.now() - 10000).toISOString(),
        level: 'PQC',
        source: 'PQCBridge',
        message: 'Generating Kyber-1024 post-quantum keypair for build provenance verification.',
        metadata: { latticeRank: 4, securityCategory: 5 }
      },
      {
        id: 'msg-5',
        timestamp: new Date(Date.now() - 8000).toISOString(),
        level: 'INFO',
        source: 'DependencyResolver',
        message: 'Binding internal modules: ModernTreasury, CitiSovereignLedger, VertexAIProxy.',
      },
      {
        id: 'msg-6',
        timestamp: new Date(Date.now() - 5000).toISOString(),
        level: 'BUILD',
        source: 'ContainerCompiler',
        message: 'Executing Bun target build: output bundle size ~1.84 MB',
      }
    ];
    setLogs(initialMsgs);
  }, [selectedApp]);

  useEffect(() => {
    generateInitialLogs();
  }, [generateInitialLogs]);

  // Real or Simulated SSE Stream effect
  useEffect(() => {
    if (!isConnected || isPaused) return;

    let realSse: EventSource | null = null;

    // Attempt real SSE connection if endpoint exists, otherwise fallback to mock emitter
    try {
      if (window.EventSource && sseEndpoint.startsWith('http')) {
        realSse = new EventSource(`${sseEndpoint}?app=${selectedApp.id}`);
        streamEventSourceRef.current = realSse;

        realSse.onmessage = (event) => {
          try {
            const data = JSON.parse(event.data);
            setLogs((prev) => [...prev, data]);
          } catch {
            setLogs((prev) => [
              ...prev,
              {
                id: `log-${Date.now()}`,
                timestamp: new Date().toISOString(),
                level: 'INFO',
                source: 'SSE',
                message: event.data
              }
            ]);
          }
        };

        realSse.onerror = () => {
          console.warn('SSE Disconnected, reverting to dynamic stream simulation.');
          realSse?.close();
        };
      }
    } catch (e) {
      // Fallback
    }

    // Mock Stream Interval (simulates live deployment logs coming in over SSE)
    const mockInterval = setInterval(() => {
      const sources = ['ContainerCompiler', 'PQCBridge', 'VaultEngine', 'EdgeDispatcher', 'HealthCheckAgent'];
      const levels: LogLevel[] = ['INFO', 'BUILD', 'PQC', 'DEBUG', 'WARN'];
      const randomLevel = levels[Math.floor(Math.random() * levels.length)];
      const randomSource = sources[Math.floor(Math.random() * sources.length)];

      const sampleMessages = [
        `Streaming layer chunk #${Math.floor(Math.random() * 899) + 100} to edge nodes...`,
        `Cryptographic signature validated against HSM root key 0x7F9A...`,
        `Injected runtime environment bindings for ${selectedApp.id}`,
        `Ping latency: ${Math.floor(Math.random() * 15) + 4}ms across 35 military & banking sectors.`,
        `Verifying Zero-Knowledge proof circuit for sovereign identity gate...`,
        `Sub-second compilation cycle complete. Memory delta: +${(Math.random() * 2).toFixed(2)}MB`
      ];

      const newLog: LogEntry = {
        id: `log-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
        timestamp: new Date().toISOString(),
        level: randomLevel,
        source: randomSource,
        message: sampleMessages[Math.floor(Math.random() * sampleMessages.length)],
        metadata: Math.random() > 0.6 ? { latencyMs: Math.floor(Math.random() * 20), sector: 'US-EAST' } : undefined
      };

      setLogs((prev) => {
        // Keep max 500 logs in memory for performance
        const updated = [...prev, newLog];
        return updated.length > 500 ? updated.slice(updated.length - 500) : updated;
      });

      // Progressively advance stages
      setCurrentBuild((prev) => {
        const stageToUpdate = prev.stages.find((s) => s.status === 'in_progress');
        if (!stageToUpdate) {
          const nextPending = prev.stages.find((s) => s.status === 'pending');
          if (nextPending) {
            return {
              ...prev,
              stages: prev.stages.map((s) => (s.id === nextPending.id ? { ...s, status: 'in_progress' } : s))
            };
          } else {
            // All completed
            return { ...prev, status: 'SUCCESS', endTime: new Date().toISOString() };
          }
        } else {
          // Finish current stage randomly
          if (Math.random() > 0.5) {
            return {
              ...prev,
              stages: prev.stages.map((s) =>
                s.id === stageToUpdate.id ? { ...s, status: 'completed', durationMs: Math.floor(Math.random() * 1200) + 300 } : s
              )
            };
          }
        }
        return prev;
      });
    }, 2400);

    return () => {
      clearInterval(mockInterval);
      if (realSse) realSse.close();
    };
  }, [isConnected, isPaused, sseEndpoint, selectedApp]);

  // --- AUTO SCROLL TERMINAL ---
  useEffect(() => {
    if (autoScroll && logContainerRef.current) {
      logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
    }
  }, [logs, autoScroll]);

  const handleScroll = () => {
    if (!logContainerRef.current) return;
    const { scrollTop, scrollHeight, clientHeight } = logContainerRef.current;
    const isAtBottom = scrollHeight - scrollTop - clientHeight < 40;
    if (!isAtBottom && autoScroll) {
      setAutoScroll(false);
    } else if (isAtBottom && !autoScroll) {
      setAutoScroll(true);
    }
  };

  // --- ACTIONS ---
  const handleAppChange = (app: typeof MOCK_MICRO_APPS[0]) => {
    setSelectedApp(app);
    setCurrentBuild({
      buildId: `bld-${Math.floor(10000 + Math.random() * 90000)}-live`,
      appName: app.name,
      appPath: app.path,
      version: 'v4.2.0-deploy',
      commitHash: Math.random().toString(36).substring(2, 9),
      initiatedBy: 'operator@sovereign-mesh.io',
      startTime: new Date().toISOString(),
      status: 'ACTIVE',
      environment: 'production',
      stages: INITIAL_STAGES.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'pending'
      })),
      memoryPeakMb: 110,
      cpuPeakPercent: 18,
      artifacts: ['bundle.js', 'manifest.json']
    });
  };

  const triggerRebuild = () => {
    generateInitialLogs();
    setCurrentBuild((prev) => ({
      ...prev,
      buildId: `bld-${Math.floor(10000 + Math.random() * 90000)}-retrigger`,
      startTime: new Date().toISOString(),
      endTime: undefined,
      status: 'ACTIVE',
      stages: INITIAL_STAGES.map((s, idx) => ({
        ...s,
        status: idx === 0 ? 'completed' : idx === 1 ? 'in_progress' : 'pending'
      }))
    }));
  };

  const clearLogs = () => {
    setLogs([]);
  };

  const toggleLevelFilter = (level: LogLevel) => {
    setSelectedLevels((prev) =>
      prev.includes(level) ? prev.filter((l) => l !== level) : [...prev, level]
    );
  };

  const exportLogsFormatted = (format: 'txt' | 'json') => {
    let textContent = '';
    if (format === 'json') {
      textContent = JSON.stringify(logs, null, 2);
    } else {
      textContent = logs
        .map((l) => `[${l.timestamp}] [${l.level}] [${l.source}]: ${l.message}`)
        .join('\n');
    }

    const blob = new Blob([textContent], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `deployment-${selectedApp.id}-${Date.now()}.${format}`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // --- FILTERED LOGS ---
  const filteredLogs = useMemo(() => {
    return logs.filter((log) => {
      const levelMatches = selectedLevels.includes(log.level);
      const queryMatches =
        !searchQuery ||
        log.message.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.source.toLowerCase().includes(searchQuery.toLowerCase()) ||
        log.level.toLowerCase().includes(searchQuery.toLowerCase());
      return levelMatches && queryMatches;
    });
  }, [logs, selectedLevels, searchQuery]);

  // Calculations for metrics
  const errorCount = useMemo(() => logs.filter((l) => l.level === 'ERROR').length, [logs]);
  const warnCount = useMemo(() => logs.filter((l) => l.level === 'WARN').length, [logs]);
  const completedStages = currentBuild.stages.filter((s) => s.status === 'completed').length;
  const progressPercent = Math.round((completedStages / currentBuild.stages.length) * 100);

  // Styling helper for log level badge
  const getLogLevelStyle = (level: LogLevel) => {
    switch (level) {
      case 'ERROR':
        return 'bg-red-950/80 text-red-400 border-red-800/60';
      case 'WARN':
        return 'bg-amber-950/80 text-amber-400 border-amber-800/60';
      case 'SECURITY':
        return 'bg-purple-950/80 text-purple-300 border-purple-800/60';
      case 'PQC':
        return 'bg-emerald-950/80 text-emerald-300 border-emerald-800/60';
      case 'BUILD':
        return 'bg-blue-950/80 text-blue-300 border-blue-800/60';
      case 'DEBUG':
        return 'bg-zinc-800 text-zinc-400 border-zinc-700';
      case 'INFO':
      default:
        return 'bg-cyan-950/80 text-cyan-300 border-cyan-800/60';
    }
  };

  return (
    <div
      className={`flex flex-col bg-slate-950 text-slate-100 font-sans border border-slate-800 rounded-xl overflow-hidden shadow-2xl transition-all duration-300 ${
        isFullscreen ? 'fixed inset-0 z-50 rounded-none border-none' : 'w-full h-[880px]'
      }`}
    >
      {/* ================= HEADER / TOOLBAR ================= */}
      <div className="bg-slate-900/90 border-b border-slate-800 px-4 py-3 flex flex-wrap items-center justify-between gap-3 backdrop-blur-md">
        {/* App & Connection Selector */}
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-cyan-950/60 rounded-lg border border-cyan-800/50 text-cyan-400">
            <Radio className="w-5 h-5 animate-pulse" />
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <select
                value={selectedApp.id}
                onChange={(e) => {
                  const target = MOCK_MICRO_APPS.find((a) => a.id === e.target.value);
                  if (target) handleAppChange(target);
                }}
                className="bg-slate-950 text-slate-100 border border-slate-700 text-sm font-semibold rounded-md px-2.5 py-1 focus:outline-none focus:ring-2 focus:ring-cyan-500 hover:border-slate-600 transition"
              >
                {MOCK_MICRO_APPS.map((app) => (
                  <option key={app.id} value={app.id}>
                    {app.name} ({app.path})
                  </option>
                ))}
              </select>

              <span
                className={`inline-flex items-center px-2 py-0.5 rounded text-xs font-mono font-medium border ${
                  currentBuild.status === 'ACTIVE'
                    ? 'bg-amber-950/50 text-amber-300 border-amber-800/60'
                    : currentBuild.status === 'SUCCESS'
                    ? 'bg-emerald-950/50 text-emerald-300 border-emerald-800/60'
                    : 'bg-red-950/50 text-red-300 border-red-800/60'
                }`}
              >
                {currentBuild.status}
              </span>
            </div>

            <div className="flex items-center space-x-2 text-xs text-slate-400 font-mono mt-0.5">
              <span>Build ID: {currentBuild.buildId}</span>
              <span>•</span>
              <span>Commit: {currentBuild.commitHash}</span>
              <span>•</span>
              <span className="text-cyan-400">{currentBuild.environment}</span>
            </div>
          </div>
        </div>

        {/* SSE Stream Status & Controls */}
        <div className="flex items-center space-x-2 flex-wrap">
          {/* SSE Connection Switch */}
          <button
            onClick={() => setIsConnected(!isConnected)}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isConnected
                ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60 hover:bg-emerald-900/50'
                : 'bg-red-950/40 text-red-300 border-red-800/60 hover:bg-red-900/50'
            }`}
            title={isConnected ? 'Disconnect SSE Stream' : 'Connect SSE Stream'}
          >
            {isConnected ? <Wifi className="w-3.5 h-3.5" /> : <WifiOff className="w-3.5 h-3.5" />}
            <span>{isConnected ? 'SSE Active' : 'Disconnected'}</span>
          </button>

          {/* Pause Stream */}
          <button
            onClick={() => setIsPaused(!isPaused)}
            className={`flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium border transition ${
              isPaused
                ? 'bg-amber-950/40 text-amber-300 border-amber-800/60 hover:bg-amber-900/50'
                : 'bg-slate-800 text-slate-300 border-slate-700 hover:bg-slate-700'
            }`}
          >
            {isPaused ? <Play className="w-3.5 h-3.5 text-amber-400" /> : <Pause className="w-3.5 h-3.5" />}
            <span>{isPaused ? 'Resume' : 'Pause'}</span>
          </button>

          {/* Trigger Re-build */}
          <button
            onClick={triggerRebuild}
            className="flex items-center space-x-1 px-3 py-1.5 rounded-lg text-xs font-medium bg-cyan-600 hover:bg-cyan-500 text-white transition border border-cyan-400/30"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Deploy Build</span>
          </button>

          {/* Fullscreen Toggle */}
          <button
            onClick={() => setIsFullscreen(!isFullscreen)}
            className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800 transition"
            title={isFullscreen ? 'Exit Fullscreen' : 'Fullscreen'}
          >
            {isFullscreen ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
          </button>
        </div>
      </div>

      {/* ================= PIPELINE STAGE SUMMARY BAR ================= */}
      <div className="bg-slate-900/60 border-b border-slate-800/80 px-4 py-2.5">
        <div className="flex items-center justify-between mb-1.5 text-xs text-slate-300">
          <div className="flex items-center space-x-2 font-mono">
            <Layers className="w-4 h-4 text-cyan-400" />
            <span className="font-semibold text-slate-200">Pipeline Pipeline Progress:</span>
            <span className="text-cyan-300">{progressPercent}%</span>
            <span className="text-slate-500">
              ({completedStages}/{currentBuild.stages.length} Stages)
            </span>
          </div>

          <div className="flex items-center space-x-4 font-mono text-xs">
            <div className="flex items-center space-x-1 text-slate-400">
              <Cpu className="w-3.5 h-3.5 text-cyan-400" />
              <span>CPU Peak: {currentBuild.cpuPeakPercent}%</span>
            </div>
            <div className="flex items-center space-x-1 text-slate-400">
              <Activity className="w-3.5 h-3.5 text-purple-400" />
              <span>Mem Peak: {currentBuild.memoryPeakMb} MB</span>
            </div>
          </div>
        </div>

        {/* Visual Stage Stepper */}
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-8 gap-1.5">
          {currentBuild.stages.map((stage, idx) => {
            const isCompleted = stage.status === 'completed';
            const isInProgress = stage.status === 'in_progress';
            const isFailed = stage.status === 'failed';

            return (
              <div
                key={stage.id}
                className={`flex flex-col justify-between p-2 rounded border text-xs relative overflow-hidden transition-all ${
                  isCompleted
                    ? 'bg-slate-950/80 border-emerald-900/60 text-slate-300'
                    : isInProgress
                    ? 'bg-slate-900 border-cyan-500 text-cyan-200 shadow-md shadow-cyan-950'
                    : isFailed
                    ? 'bg-red-950/40 border-red-800/80 text-red-300'
                    : 'bg-slate-950/40 border-slate-800/60 text-slate-500'
                }`}
              >
                {/* Progress bar background for in_progress */}
                {isInProgress && (
                  <div className="absolute inset-0 bg-cyan-950/40 animate-pulse pointer-events-none" />
                )}

                <div className="flex items-center justify-between mb-1 relative z-10">
                  <span className="font-mono text-[10px] text-slate-400">0{idx + 1}</span>
                  {isCompleted && <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />}
                  {isInProgress && <RefreshCw className="w-3.5 h-3.5 text-cyan-400 animate-spin" />}
                  {isFailed && <XCircle className="w-3.5 h-3.5 text-red-400" />}
                  {stage.status === 'pending' && <Clock className="w-3.5 h-3.5 text-slate-600" />}
                </div>

                <div className="font-medium truncate text-[11px] relative z-10" title={stage.name}>
                  {stage.name}
                </div>

                <div className="text-[10px] font-mono text-slate-500 mt-1 relative z-10">
                  {stage.durationMs ? `${stage.durationMs}ms` : isInProgress ? 'running...' : 'queued'}
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ================= TAB NAVIGATION & FILTERS BAR ================= */}
      <div className="bg-slate-900/40 border-b border-slate-800 px-4 py-2 flex flex-wrap items-center justify-between gap-2">
        {/* Tabs */}
        <div className="flex items-center space-x-1">
          <button
            onClick={() => setActiveTab('stream')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'stream'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Terminal className="w-3.5 h-3.5" />
            <span>Live SSE Logs</span>
            <span className="ml-1.5 px-1.5 py-0.2 rounded-full bg-slate-800 text-[10px] text-slate-300 font-mono">
              {filteredLogs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('stages')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'stages'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Sliders className="w-3.5 h-3.5" />
            <span>Pipeline Details</span>
          </button>

          <button
            onClick={() => setActiveTab('history')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'history'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Historical Builds</span>
          </button>

          <button
            onClick={() => setActiveTab('artifacts')}
            className={`flex items-center space-x-1.5 px-3 py-1.5 rounded-md text-xs font-medium transition ${
              activeTab === 'artifacts'
                ? 'bg-cyan-950/80 text-cyan-300 border border-cyan-800/80'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50'
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Artifacts ({currentBuild.artifacts?.length || 0})</span>
          </button>
        </div>

        {/* Filter / Search Bar (Only shown in 'stream' tab) */}
        {activeTab === 'stream' && (
          <div className="flex items-center space-x-2 flex-wrap">
            {/* Search Box */}
            <div className="relative">
              <Search className="w-3.5 h-3.5 absolute left-2.5 top-2 text-slate-500" />
              <input
                type="text"
                placeholder="Search stream..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-slate-950 text-slate-200 text-xs border border-slate-700 rounded-md pl-8 pr-3 py-1 w-44 focus:outline-none focus:ring-1 focus:ring-cyan-500 font-mono"
              />
            </div>

            {/* Level Selector Badges */}
            <div className="flex items-center space-x-1">
              {(['INFO', 'BUILD', 'SECURITY', 'PQC', 'WARN', 'ERROR'] as LogLevel[]).map((lvl) => {
                const active = selectedLevels.includes(lvl);
                return (
                  <button
                    key={lvl}
                    onClick={() => toggleLevelFilter(lvl)}
                    className={`text-[10px] font-mono px-2 py-0.5 rounded border transition ${
                      active
                        ? getLogLevelStyle(lvl)
                        : 'bg-slate-950 text-slate-600 border-slate-800 hover:text-slate-400'
                    }`}
                  >
                    {lvl}
                  </button>
                );
              })}
            </div>

            {/* Actions: Clear / Export */}
            <div className="flex items-center space-x-1 pl-2 border-l border-slate-800">
              <button
                onClick={clearLogs}
                className="p-1 rounded text-slate-400 hover:text-red-400 hover:bg-slate-800 transition"
                title="Clear Terminal Logs"
              >
                <Trash2 className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => exportLogsFormatted('txt')}
                className="p-1 rounded text-slate-400 hover:text-cyan-300 hover:bg-slate-800 transition"
                title="Download Logs (TXT)"
              >
                <Download className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ================= MAIN CONTENT AREA ================= */}
      <div className="flex-1 bg-slate-950 overflow-hidden relative flex flex-col">
        {/* --- TAB 1: STREAM LOG TERMINAL --- */}
        {activeTab === 'stream' && (
          <div className="flex-1 flex flex-col h-full relative">
            {/* Terminal Window */}
            <div
              ref={logContainerRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-4 font-mono text-xs leading-relaxed space-y-1 select-text scrollbar-thin scrollbar-thumb-slate-800 scrollbar-track-transparent"
            >
              {filteredLogs.length === 0 ? (
                <div className="flex flex-col items-center justify-center h-full text-slate-600 space-y-2 py-12">
                  <Terminal className="w-8 h-8 text-slate-700" />
                  <p>No build logs match the active filter criteria.</p>
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div key={log.id} className="flex items-start space-x-2 group hover:bg-slate-900/50 py-0.5 px-1 rounded transition">
                    {/* Timestamp */}
                    <span className="text-slate-600 shrink-0 select-none">
                      {new Date(log.timestamp).toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}
                    </span>

                    {/* Level Badge */}
                    <span className={`px-1.5 py-0.2 rounded border text-[10px] font-semibold shrink-0 ${getLogLevelStyle(log.level)}`}>
                      {log.level}
                    </span>

                    {/* Source Module */}
                    <span className="text-cyan-400 font-semibold shrink-0">
                      [{log.source}]:
                    </span>

                    {/* Message Body */}
                    <span className={`flex-1 break-all ${log.level === 'ERROR' ? 'text-red-300' : log.level === 'WARN' ? 'text-amber-200' : 'text-slate-200'}`}>
                      {log.message}
                    </span>

                    {/* Metadata preview if exists */}
                    {log.metadata && (
                      <span className="text-[10px] text-slate-500 bg-slate-900 border border-slate-800 px-1.5 py-0.5 rounded font-mono truncate max-w-xs">
                        {JSON.stringify(log.metadata)}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Jump to bottom float button if autoScroll is paused */}
            {!autoScroll && (
              <button
                onClick={() => {
                  setAutoScroll(true);
                  if (logContainerRef.current) {
                    logContainerRef.current.scrollTop = logContainerRef.current.scrollHeight;
                  }
                }}
                className="absolute bottom-4 right-6 bg-cyan-600 text-slate-950 font-semibold text-xs px-3 py-1.5 rounded-full shadow-lg hover:bg-cyan-400 flex items-center space-x-1 transition z-20"
              >
                <ArrowDown className="w-3.5 h-3.5" />
                <span>Resume Auto-Scroll</span>
              </button>
            )}
          </div>
        )}

        {/* --- TAB 2: PIPELINE STAGES DETAILED LIST --- */}
        {activeTab === 'stages' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              <span>Micro-App Build & Deployment Execution Plan</span>
            </h3>

            <div className="space-y-3">
              {currentBuild.stages.map((stage, i) => (
                <div
                  key={stage.id}
                  className="bg-slate-900/80 border border-slate-800 rounded-lg p-4 flex items-start justify-between space-x-4"
                >
                  <div className="flex items-start space-x-3">
                    <div className="mt-0.5">
                      {stage.status === 'completed' && <CheckCircle className="w-5 h-5 text-emerald-400" />}
                      {stage.status === 'in_progress' && <RefreshCw className="w-5 h-5 text-cyan-400 animate-spin" />}
                      {stage.status === 'failed' && <XCircle className="w-5 h-5 text-red-400" />}
                      {stage.status === 'pending' && <Clock className="w-5 h-5 text-slate-600" />}
                    </div>
                    <div>
                      <h4 className="text-sm font-medium text-slate-200">
                        {i + 1}. {stage.name}
                      </h4>
                      <p className="text-xs text-slate-400 mt-0.5">{stage.description}</p>
                      {stage.error && (
                        <div className="mt-2 text-xs bg-red-950/60 border border-red-800 text-red-300 p-2 rounded font-mono">
                          Error: {stage.error}
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="text-right shrink-0">
                    <span
                      className={`inline-block text-[11px] font-mono px-2 py-0.5 rounded border uppercase ${
                        stage.status === 'completed'
                          ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                          : stage.status === 'in_progress'
                          ? 'bg-cyan-950/40 text-cyan-300 border-cyan-800/60'
                          : stage.status === 'failed'
                          ? 'bg-red-950/40 text-red-300 border-red-800/60'
                          : 'bg-slate-950 text-slate-600 border-slate-800'
                      }`}
                    >
                      {stage.status}
                    </span>
                    <div className="text-xs font-mono text-slate-500 mt-1">
                      {stage.durationMs ? `${stage.durationMs} ms` : '--'}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 3: HISTORICAL BUILDS --- */}
        {activeTab === 'history' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <Clock className="w-4 h-4 text-cyan-400" />
              <span>Historical Builds & Execution Audit</span>
            </h3>

            <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg overflow-hidden bg-slate-900/40">
              {HISTORICAL_BUILDS.map((bld) => (
                <div key={bld.buildId} className="p-4 flex items-center justify-between hover:bg-slate-900/80 transition">
                  <div>
                    <div className="flex items-center space-x-2">
                      <span className="font-mono text-sm font-medium text-slate-200">{bld.buildId}</span>
                      <span
                        className={`text-[10px] font-mono px-2 py-0.5 rounded border ${
                          bld.status === 'SUCCESS'
                            ? 'bg-emerald-950/40 text-emerald-300 border-emerald-800/60'
                            : 'bg-red-950/40 text-red-300 border-red-800/60'
                        }`}
                      >
                        {bld.status}
                      </span>
                    </div>
                    <div className="text-xs text-slate-400 mt-1">
                      App: <span className="text-slate-200">{bld.appName}</span> | Initiated by: {bld.initiatedBy}
                    </div>
                    <div className="text-xs text-slate-500 font-mono mt-0.5">
                      Started: {new Date(bld.startTime).toLocaleString()}
                    </div>
                  </div>

                  <div className="flex items-center space-x-3">
                    <div className="text-right text-xs font-mono text-slate-400">
                      <div>Mem Peak: {bld.memoryPeakMb} MB</div>
                      <div>CPU Peak: {bld.cpuPeakPercent}%</div>
                    </div>

                    <button
                      onClick={() => {
                        setSelectedApp(
                          MOCK_MICRO_APPS.find((a) => a.name === bld.appName) || MOCK_MICRO_APPS[0]
                        );
                        setCurrentBuild(bld);
                        setActiveTab('stream');
                      }}
                      className="px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs rounded border border-slate-700 transition"
                    >
                      Inspect Logs
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* --- TAB 4: ARTIFACTS --- */}
        {activeTab === 'artifacts' && (
          <div className="flex-1 overflow-y-auto p-6 space-y-4">
            <h3 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
              <FileText className="w-4 h-4 text-cyan-400" />
              <span>Compiled Output & Post-Quantum Provenance Artifacts</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {currentBuild.artifacts?.map((artifact, i) => (
                <div key={i} className="bg-slate-900/80 border border-slate-800 p-3.5 rounded-lg flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <FileText className="w-5 h-5 text-cyan-400" />
                    <div>
                      <div className="text-xs font-mono font-medium text-slate-200">{artifact}</div>
                      <div className="text-[10px] text-slate-500 font-mono">SHA-256: e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855</div>
                    </div>
                  </div>

                  <button
                    onClick={() => alert(`Downloading artifact: ${artifact}`)}
                    className="p-1.5 text-slate-400 hover:text-cyan-300 hover:bg-slate-800 rounded transition"
                  >
                    <Download className="w-4 h-4" />
                  </button>
                </div>
              ))}
            </div>
          </div>
        )}
      </div>

      {/* ================= FOOTER / STATUS BAR ================= */}
      <div className="bg-slate-900/90 border-t border-slate-800 px-4 py-2 flex items-center justify-between text-xs text-slate-400 font-mono">
        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-1.5">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-emerald-400 animate-ping' : 'bg-red-500'}`} />
            <span>SSE Gateway: {isConnected ? 'Streaming' : 'Offline'}</span>
          </div>
          <span>Total Stream Buffer: {logs.length} entries</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-amber-400">{warnCount} Warnings</span>
          <span className="text-red-400">{errorCount} Errors</span>
          <span className="text-slate-600">|</span>
          <span className="text-slate-300">Sovereign Mesh Micro-App Engine v4.2</span>
        </div>
      </div>
    </div>
  );
};

export default DeploymentStreamViewer;
