import React, { useState, useMemo, useEffect } from 'react';
import {
  RotateCcw,
  History,
  AlertTriangle,
  CheckCircle2,
  ShieldAlert,
  Server,
  GitCommit,
  Clock,
  ArrowLeftRight,
  Zap,
  Activity,
  ChevronRight,
  Search,
  Filter,
  Lock,
  Layers,
  Terminal,
  X,
  Play,
  Check,
  FileCode,
  Globe,
  Radio,
  BarChart3,
  RefreshCw,
  Cpu,
  Sliders
} from 'lucide-react';

interface DeploymentRecord {
  id: string;
  version: string;
  buildNumber: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  timestamp: string;
  status: 'active' | 'superseded' | 'rolled_back' | 'failed';
  healthScore: number;
  errorRate: number;
  latencyMs: number;
  environment: 'production' | 'staging' | 'government-cloud';
  breakingChanges: boolean;
  canaryPassed: boolean;
  configDiffCount: number;
  rollbackSafetyRating: 'HIGH' | 'MEDIUM' | 'RISKY' | 'BLOCKED';
}

interface MicroApp {
  id: string;
  name: string;
  category: string;
  activeVersion: string;
  targetRegion: string;
  replicaCount: number;
  uptime: string;
  deployments: DeploymentRecord[];
}

const MOCK_MICRO_APPS: MicroApp[] = [
  {
    id: 'app-citi-kyc',
    name: 'citi_account_kyc_risk_profiler',
    category: 'Fintech & Banking',
    activeVersion: 'v2.14.0',
    targetRegion: 'us-east-1 (Primary)',
    replicaCount: 12,
    uptime: '99.98%',
    deployments: [
      {
        id: 'dep-9081',
        version: 'v2.14.0',
        buildNumber: '#10482',
        commitHash: '8f3a11c',
        commitMessage: 'feat(kyc): add PQC signature validation & SAVE API bridge v3',
        author: 'sarah.chen@gov.sec',
        timestamp: '12 minutes ago',
        status: 'active',
        healthScore: 98,
        errorRate: 0.02,
        latencyMs: 42,
        environment: 'production',
        breakingChanges: false,
        canaryPassed: true,
        configDiffCount: 4,
        rollbackSafetyRating: 'HIGH',
      },
      {
        id: 'dep-9079',
        version: 'v2.13.5',
        buildNumber: '#10470',
        commitHash: '4b12e09',
        commitMessage: 'fix(risk): resolve memory leak in sovereign ID verifier pool',
        author: 'alex.mendoza@citi.io',
        timestamp: '18 hours ago',
        status: 'superseded',
        healthScore: 99,
        errorRate: 0.01,
        latencyMs: 38,
        environment: 'production',
        breakingChanges: false,
        canaryPassed: true,
        configDiffCount: 2,
        rollbackSafetyRating: 'HIGH',
      },
      {
        id: 'dep-9052',
        version: 'v2.13.0',
        buildNumber: '#10411',
        commitHash: '1c890aa',
        commitMessage: 'refactor(ledger): upgrade Modern Treasury SDK & zero-knowledge proofs',
        author: 'dave.k@treasury.gov',
        timestamp: '3 days ago',
        status: 'superseded',
        healthScore: 94,
        errorRate: 0.15,
        latencyMs: 65,
        environment: 'production',
        breakingChanges: true,
        canaryPassed: true,
        configDiffCount: 14,
        rollbackSafetyRating: 'MEDIUM',
      },
      {
        id: 'dep-9010',
        version: 'v2.12.9',
        buildNumber: '#10390',
        commitHash: '7e22100',
        commitMessage: 'chore(deps): hotfix security patch CVE-2024-9912',
        author: 'sec-bot@autodeploy',
        timestamp: '6 days ago',
        status: 'rolled_back',
        healthScore: 71,
        errorRate: 2.8,
        latencyMs: 240,
        environment: 'production',
        breakingChanges: false,
        canaryPassed: false,
        configDiffCount: 1,
        rollbackSafetyRating: 'RISKY',
      }
    ]
  },
  {
    id: 'app-pqc-crypto',
    name: 'pqc_crypto_bridge_simulator',
    category: 'Quantum Security',
    activeVersion: 'v4.0.2',
    targetRegion: 'azure-usgov-virginia',
    replicaCount: 32,
    uptime: '100.00%',
    deployments: [
      {
        id: 'dep-8820',
        version: 'v4.0.2',
        buildNumber: '#8891',
        commitHash: 'c991a0f',
        commitMessage: 'feat(pqc): Kyber-1024 hybrid key exchange implementation',
        author: 'marcus.v@defense.gov',
        timestamp: '1 hour ago',
        status: 'active',
        healthScore: 99,
        errorRate: 0.00,
        latencyMs: 14,
        environment: 'government-cloud',
        breakingChanges: false,
        canaryPassed: true,
        configDiffCount: 6,
        rollbackSafetyRating: 'HIGH',
      },
      {
        id: 'dep-8815',
        version: 'v4.0.1',
        buildNumber: '#8870',
        commitHash: '22b7d41',
        commitMessage: 'perf(crypto): SIMD optimization for Dilithium signatures',
        author: 'marcus.v@defense.gov',
        timestamp: '2 days ago',
        status: 'superseded',
        healthScore: 97,
        errorRate: 0.04,
        latencyMs: 19,
        environment: 'government-cloud',
        breakingChanges: false,
        canaryPassed: true,
        configDiffCount: 3,
        rollbackSafetyRating: 'HIGH',
      }
    ]
  },
  {
    id: 'app-b2b-liquidity',
    name: 'b2b_corporate_liquidity_forecaster',
    category: 'Core Finance',
    activeVersion: 'v1.8.9',
    targetRegion: 'gcp-us-central1',
    replicaCount: 8,
    uptime: '99.91%',
    deployments: [
      {
        id: 'dep-7701',
        version: 'v1.8.9',
        buildNumber: '#5410',
        commitHash: 'ee0182f',
        commitMessage: 'fix(cashflow): recalibrate high-yield sweep interest models',
        author: 'quant.team@citi.com',
        timestamp: '4 hours ago',
        status: 'active',
        healthScore: 92,
        errorRate: 0.42,
        latencyMs: 110,
        environment: 'production',
        breakingChanges: false,
        canaryPassed: true,
        configDiffCount: 8,
        rollbackSafetyRating: 'MEDIUM',
      },
      {
        id: 'dep-7688',
        version: 'v1.8.8',
        buildNumber: '#5392',
        commitHash: '321f8a9',
        commitMessage: 'feat(fed): FedNow instant liquidity routing adapter',
        author: 'quant.team@citi.com',
        timestamp: '1 day ago',
        status: 'superseded',
        healthScore: 100,
        errorRate: 0.00,
        latencyMs: 82,
        environment: 'production',
        breakingChanges: false,
        canaryPassed: true,
        configDiffCount: 5,
        rollbackSafetyRating: 'HIGH',
      }
    ]
  },
  {
    id: 'app-voter-reg',
    name: 'voter_registration_portal',
    category: 'Elections & Compliance',
    activeVersion: 'v3.2.1',
    targetRegion: 'us-east-2 (Gov Cluster)',
    replicaCount: 16,
    uptime: '99.99%',
    deployments: [
      {
        id: 'dep-6601',
        version: 'v3.2.1',
        buildNumber: '#3312',
        commitHash: '99120bc',
        commitMessage: 'security(audit): real-time voter roll purge metric syncing',
        author: 'elections.admin@fl.gov',
        timestamp: '30 minutes ago',
        status: 'active',
        healthScore: 96,
        errorRate: 0.08,
        latencyMs: 55,
        environment: 'production',
        breakingChanges: false,
        canaryPassed: true,
        configDiffCount: 2,
        rollbackSafetyRating: 'HIGH',
      },
      {
        id: 'dep-6580',
        version: 'v3.2.0',
        buildNumber: '#3290',
        commitHash: 'fa8802d',
        commitMessage: 'feat(citizenship): SAVE API automated verification worker',
        author: 'elections.admin@fl.gov',
        timestamp: '2 days ago',
        status: 'superseded',
        healthScore: 98,
        errorRate: 0.03,
        latencyMs: 48,
        environment: 'production',
        breakingChanges: true,
        canaryPassed: true,
        configDiffCount: 12,
        rollbackSafetyRating: 'MEDIUM',
      }
    ]
  }
];

export const DeploymentRollbackManager: React.FC = () => {
  const [selectedApp, setSelectedApp] = useState<MicroApp>(MOCK_MICRO_APPS[0]);
  const [searchQuery, setSearchQuery] = useState('');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('all');
  const [targetRollback, setTargetRollback] = useState<DeploymentRecord | null>(null);
  const [isDiffOpen, setIsDiffOpen] = useState(false);
  const [diffTarget, setDiffTarget] = useState<DeploymentRecord | null>(null);

  // Rollback Execution Modal State
  const [isRollbackExecuting, setIsRollbackExecuting] = useState(false);
  const [rollbackProgress, setRollbackProgress] = useState(0);
  const [rollbackStep, setRollbackStep] = useState<string>('Initiating rollback pipeline...');
  const [rollbackLogs, setRollbackLogs] = useState<string[]>([]);
  const [rollbackCompleted, setRollbackCompleted] = useState(false);

  // Fast-track settings
  const [drainTrafficImmediately, setDrainTrafficImmediately] = useState(true);
  const [bypassCanaryValidation, setBypassCanaryValidation] = useState(false);
  const [autoPurgeCache, setAutoPurgeCache] = useState(true);
  const [notifyOpsChannel, setNotifyOpsChannel] = useState(true);

  // Filtered micro-apps
  const filteredApps = useMemo(() => {
    return MOCK_MICRO_APPS.filter(app => {
      const matchesSearch = app.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            app.category.toLowerCase().includes(searchQuery.toLowerCase());
      return matchesSearch;
    });
  }, [searchQuery]);

  const activeDeployment = useMemo(() => {
    return selectedApp.deployments.find(d => d.status === 'active') || selectedApp.deployments[0];
  }, [selectedApp]);

  const historicalDeployments = useMemo(() => {
    return selectedApp.deployments.filter(d => d.id !== activeDeployment?.id);
  }, [selectedApp, activeDeployment]);

  // Execute Rollback Simulation
  const handleStartRollback = (deployment: DeploymentRecord) => {
    setTargetRollback(deployment);
    setIsRollbackExecuting(true);
    setRollbackProgress(10);
    setRollbackCompleted(false);
    setRollbackLogs([
      `[00:01.02] Operator initiated rollback to version ${deployment.version} (Build ${deployment.buildNumber})`,
      `[00:01.15] Target commit: ${deployment.commitHash} | Author: ${deployment.author}`,
      `[00:01.40] Validating deployment integrity & cryptographic hash checksum... PASS`
    ]);
  };

  useEffect(() => {
    if (!isRollbackExecuting || rollbackCompleted) return;

    const timer = setTimeout(() => {
      if (rollbackProgress < 30) {
        setRollbackProgress(35);
        setRollbackStep('Draining active HTTP/gRPC traffic from pods...');
        setRollbackLogs(prev => [
          ...prev,
          `[00:02.10] Traffic shift initiated: Routing 100% ingress traffic to safety standby nodes`,
          `[00:02.85] Connection draining in progress (Active connections: 412 -> 0)`
        ]);
      } else if (rollbackProgress < 60) {
        setRollbackProgress(65);
        setRollbackStep(`Reverting container image tags to ${targetRollback?.version}...`);
        setRollbackLogs(prev => [
          ...prev,
          `[00:04.20] Kubernetes Deployment patch applied to cluster region ${selectedApp.targetRegion}`,
          `[00:04.90] Rolling update: 12/12 pods terminated, replaced with target image SHA: ${targetRollback?.commitHash}`,
          `[00:05.30] ConfigMaps and Secrets restored to state at epoch of ${targetRollback?.timestamp}`
        ]);
      } else if (rollbackProgress < 90) {
        setRollbackProgress(90);
        setRollbackStep('Running automated smoke tests & health probes...');
        setRollbackLogs(prev => [
          ...prev,
          `[00:06.10] Executing post-rollback automated test suite...`,
          `[00:06.80] GET /healthz -> 200 OK (Latency: ${targetRollback?.latencyMs}ms)`,
          `[00:07.40] Database schema backward compatibility verified. Zero data lock violations.`
        ]);
      } else if (rollbackProgress < 100) {
        setRollbackProgress(100);
        setRollbackStep('Rollback completed successfully!');
        setRollbackLogs(prev => [
          ...prev,
          `[00:08.10] Traffic restored to newly activated version ${targetRollback?.version}`,
          `[00:08.25] Ops Channel notified (#incident-fasttrack). Audit event logged to Ledger.`,
          `[00:08.30] SUCCESS: Service ${selectedApp.name} successfully rolled back!`
        ]);
        setRollbackCompleted(true);
      }
    }, 1200);

    return () => clearTimeout(timer);
  }, [isRollbackExecuting, rollbackProgress, rollbackCompleted, targetRollback, selectedApp]);

  const handleFinishRollbackModal = () => {
    if (rollbackCompleted && targetRollback) {
      // Update local state to reflect new rollback
      const updatedDeployments = selectedApp.deployments.map(dep => {
        if (dep.id === targetRollback.id) {
          return { ...dep, status: 'active' as const };
        }
        if (dep.status === 'active') {
          return { ...dep, status: 'rolled_back' as const };
        }
        return dep;
      });

      const updatedApp = {
        ...selectedApp,
        activeVersion: targetRollback.version,
        deployments: updatedDeployments
      };

      setSelectedApp(updatedApp);
    }
    setIsRollbackExecuting(false);
    setTargetRollback(null);
    setRollbackProgress(0);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 p-4 md:p-6 font-sans">
      {/* Top Header Banner */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-rose-500/10 border border-rose-500/30 rounded-lg text-rose-400">
              <RotateCcw className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-white flex items-center gap-2">
                Deployment Rollback Manager
                <span className="text-xs px-2.5 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/30 font-mono">
                  FAST-TRACK ENGINE
                </span>
              </h1>
              <p className="text-sm text-slate-400 mt-0.5">
                Instant version rollback controller for enterprise micro-apps, treasury adapters, and government bridges.
              </p>
            </div>
          </div>
        </div>

        {/* Global Controls & Status */}
        <div className="flex items-center gap-3">
          <div className="bg-slate-900 border border-slate-800 rounded-lg px-3 py-2 text-xs flex items-center gap-3">
            <div className="flex items-center gap-1.5 text-slate-300">
              <ShieldAlert className="w-4 h-4 text-amber-400" />
              <span>Rollback Guard:</span>
              <span className="font-semibold text-emerald-400">ACTIVE</span>
            </div>
            <div className="h-4 w-px bg-slate-800" />
            <div className="flex items-center gap-1.5 text-slate-300">
              <Zap className="w-4 h-4 text-cyan-400" />
              <span>Avg Fast-Track Time:</span>
              <span className="font-mono font-semibold text-slate-100">8.2s</span>
            </div>
          </div>

          <button
            onClick={() => {}}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-2.5 rounded-lg border border-slate-700 font-medium transition-colors"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            Sync Cluster State
          </button>
        </div>
      </div>

      {/* Main Grid Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Left Column: Micro-Apps Directory */}
        <div className="lg:col-span-4 space-y-4">
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                <Layers className="w-4 h-4 text-indigo-400" />
                Target Micro-Apps
              </h2>
              <span className="text-xs text-slate-400 font-mono">
                {filteredApps.length} Deployed
              </span>
            </div>

            {/* Search Filter */}
            <div className="relative mb-3">
              <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
              <input
                type="text"
                placeholder="Search micro-app or category..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-lg pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500 transition-colors"
              />
            </div>

            {/* App List */}
            <div className="space-y-2 max-h-[620px] overflow-y-auto pr-1">
              {filteredApps.map((app) => {
                const isSelected = selectedApp.id === app.id;
                const activeDep = app.deployments.find(d => d.status === 'active');

                return (
                  <div
                    key={app.id}
                    onClick={() => setSelectedApp(app)}
                    className={`p-3.5 rounded-lg border text-left cursor-pointer transition-all ${
                      isSelected
                        ? 'bg-indigo-950/40 border-indigo-500/60 shadow-lg shadow-indigo-500/5'
                        : 'bg-slate-950/60 border-slate-800/80 hover:border-slate-700 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-400 uppercase tracking-wider">
                          {app.category}
                        </span>
                        <h3 className="text-xs font-mono font-bold text-slate-100 mt-1.5 truncate max-w-[200px]">
                          {app.name}
                        </h3>
                      </div>
                      <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 font-medium">
                        {app.activeVersion}
                      </span>
                    </div>

                    <div className="mt-3 flex items-center justify-between text-[11px] text-slate-400 border-t border-slate-800/60 pt-2 font-mono">
                      <div className="flex items-center gap-1.5">
                        <Server className="w-3 h-3 text-slate-500" />
                        <span className="truncate max-w-[130px]">{app.targetRegion}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Activity className="w-3 h-3 text-emerald-400" />
                        <span>{app.uptime}</span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Quick Safety Panel */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-4 space-y-3">
            <h3 className="text-xs font-semibold text-slate-300 flex items-center gap-2">
              <Sliders className="w-4 h-4 text-cyan-400" />
              Fast-Track Rollback Policies
            </h3>
            
            <div className="space-y-2 text-xs">
              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Drain ingress traffic immediately</span>
                <input
                  type="checkbox"
                  checked={drainTrafficImmediately}
                  onChange={(e) => setDrainTrafficImmediately(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Bypass manual canary staging window</span>
                <input
                  type="checkbox"
                  checked={bypassCanaryValidation}
                  onChange={(e) => setBypassCanaryValidation(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Auto-purge Redis & CDN cache layer</span>
                <input
                  type="checkbox"
                  checked={autoPurgeCache}
                  onChange={(e) => setAutoPurgeCache(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>

              <label className="flex items-center justify-between p-2 rounded bg-slate-950 border border-slate-800 cursor-pointer">
                <span className="text-slate-300">Post update to #incident-fasttrack</span>
                <input
                  type="checkbox"
                  checked={notifyOpsChannel}
                  onChange={(e) => setNotifyOpsChannel(e.target.checked)}
                  className="rounded border-slate-700 bg-slate-900 text-indigo-500 focus:ring-0"
                />
              </label>
            </div>
          </div>
        </div>

        {/* Right Column: Selected Micro-App Timeline & Rollback Actions */}
        <div className="lg:col-span-8 space-y-6">
          
          {/* Active Version Dashboard Card */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-slate-800/80 pb-4">
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-xs px-2.5 py-0.5 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 font-mono">
                    ACTIVE DEPLOYMENT
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    ID: {activeDeployment.id}
                  </span>
                </div>
                <h2 className="text-xl font-mono font-bold text-white mt-1">
                  {selectedApp.name}
                </h2>
                <p className="text-xs text-slate-400 mt-0.5">
                  Region: <span className="text-slate-200 font-mono">{selectedApp.targetRegion}</span> | Replicas: <span className="text-slate-200 font-mono">{selectedApp.replicaCount} pods</span>
                </p>
              </div>

              <div className="flex items-center gap-4 bg-slate-950 border border-slate-800 p-3 rounded-lg">
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Health Score</span>
                  <span className="text-lg font-bold font-mono text-emerald-400">{activeDeployment.healthScore}%</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">Error Rate</span>
                  <span className="text-lg font-bold font-mono text-cyan-400">{activeDeployment.errorRate}%</span>
                </div>
                <div className="h-8 w-px bg-slate-800" />
                <div className="text-right">
                  <span className="text-[10px] text-slate-500 font-mono uppercase block">p99 Latency</span>
                  <span className="text-lg font-bold font-mono text-slate-200">{activeDeployment.latencyMs}ms</span>
                </div>
              </div>
            </div>

            {/* Commit Detail box */}
            <div className="mt-4 p-3 bg-slate-950/80 rounded-lg border border-slate-800/80 text-xs flex flex-col md:flex-row md:items-center justify-between gap-3">
              <div className="flex items-start gap-2.5">
                <GitCommit className="w-4 h-4 text-indigo-400 mt-0.5 shrink-0" />
                <div>
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-emerald-400 font-semibold">{activeDeployment.version}</span>
                    <span className="font-mono text-slate-500">({activeDeployment.commitHash})</span>
                    <span className="text-slate-400">• {activeDeployment.timestamp}</span>
                  </div>
                  <p className="text-slate-300 font-mono mt-1 text-[11px]">
                    "{activeDeployment.commitMessage}"
                  </p>
                </div>
              </div>
              <div className="text-right shrink-0">
                <span className="text-[10px] text-slate-500 block">Deployed by</span>
                <span className="text-slate-300 font-mono text-xs">{activeDeployment.author}</span>
              </div>
            </div>
          </div>

          {/* Historical Deployments Timeline */}
          <div className="bg-slate-900/90 border border-slate-800 rounded-xl p-5">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 flex items-center gap-2">
                  <History className="w-4 h-4 text-amber-400" />
                  Historical Deployment Pipeline
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Select a target version below to inspect diffs or execute a fast-track rollback.
                </p>
              </div>
              
              <div className="flex items-center gap-2 text-xs font-mono text-slate-400">
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-emerald-400" /> Safe
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-amber-400" /> Config Shift
                </span>
                <span className="flex items-center gap-1">
                  <span className="w-2 h-2 rounded-full bg-rose-400" /> Breaking
                </span>
              </div>
            </div>

            <div className="space-y-4 relative before:absolute before:left-6 before:top-3 before:bottom-3 before:w-0.5 before:bg-slate-800">
              {selectedApp.deployments.map((dep, idx) => {
                const isActive = dep.status === 'active';
                const isRolledBack = dep.status === 'rolled_back';

                return (
                  <div
                    key={dep.id}
                    className={`relative pl-12 pr-4 py-4 rounded-xl border transition-all ${
                      isActive
                        ? 'bg-slate-900 border-indigo-500/40 shadow-md shadow-indigo-950/20'
                        : 'bg-slate-950/70 border-slate-800/80 hover:border-slate-700'
                    }`}
                  >
                    {/* Timeline Node Badge */}
                    <div
                      className={`absolute left-3.5 top-5 w-5 h-5 rounded-full flex items-center justify-center border text-[10px] font-bold ${
                        isActive
                          ? 'bg-indigo-500 border-indigo-300 text-slate-950'
                          : isRolledBack
                          ? 'bg-rose-500/20 border-rose-500 text-rose-400'
                          : 'bg-slate-800 border-slate-700 text-slate-400'
                      }`}
                    >
                      {idx + 1}
                    </div>

                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-white">
                            {dep.version}
                          </span>
                          <span className="text-xs font-mono text-slate-500">
                            Build {dep.buildNumber} ({dep.commitHash})
                          </span>

                          {isActive && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-indigo-500/10 text-indigo-400 border border-indigo-500/30">
                              CURRENT LIVE
                            </span>
                          )}

                          {isRolledBack && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-rose-500/10 text-rose-400 border border-rose-500/30">
                              PREVIOUSLY ROLLED BACK
                            </span>
                          )}

                          {dep.breakingChanges && (
                            <span className="px-2 py-0.5 rounded text-[10px] font-mono bg-amber-500/10 text-amber-400 border border-amber-500/30 flex items-center gap-1">
                              <AlertTriangle className="w-3 h-3" /> Breaking API
                            </span>
                          )}
                        </div>

                        <p className="text-xs text-slate-300 font-mono mt-1">
                          {dep.commitMessage}
                        </p>

                        <div className="flex items-center gap-4 text-[11px] text-slate-400 mt-2 font-mono">
                          <span>Author: <strong className="text-slate-300">{dep.author}</strong></span>
                          <span>•</span>
                          <span>Deployed {dep.timestamp}</span>
                          <span>•</span>
                          <span>Diffs: <strong className="text-slate-200">{dep.configDiffCount} keys</strong></span>
                        </div>
                      </div>

                      {/* Rollback & Diff Control Buttons */}
                      <div className="flex items-center gap-2 shrink-0">
                        <button
                          onClick={() => {
                            setDiffTarget(dep);
                            setIsDiffOpen(true);
                          }}
                          className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 border border-slate-700 text-xs font-mono flex items-center gap-1.5 transition-colors"
                        >
                          <FileCode className="w-3.5 h-3.5 text-cyan-400" />
                          View Diff
                        </button>

                        {!isActive && (
                          <button
                            onClick={() => handleStartRollback(dep)}
                            className="px-3.5 py-1.5 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold text-xs flex items-center gap-1.5 shadow-lg shadow-rose-950/50 transition-all hover:scale-[1.02] active:scale-[0.98]"
                          >
                            <RotateCcw className="w-3.5 h-3.5" />
                            Rollback To This
                          </button>
                        )}
                      </div>
                    </div>

                    {/* Metric Micro Bar */}
                    <div className="mt-3 grid grid-cols-4 gap-2 pt-2.5 border-t border-slate-800/50 text-[10px] font-mono">
                      <div>
                        <span className="text-slate-500 block">HEALTH SCORE</span>
                        <span className={`font-bold ${dep.healthScore > 95 ? 'text-emerald-400' : 'text-amber-400'}`}>
                          {dep.healthScore}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">ERROR RATE</span>
                        <span className={`font-bold ${dep.errorRate < 0.1 ? 'text-emerald-400' : 'text-rose-400'}`}>
                          {dep.errorRate}%
                        </span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">P99 LATENCY</span>
                        <span className="text-slate-200 font-bold">{dep.latencyMs}ms</span>
                      </div>
                      <div>
                        <span className="text-slate-500 block">SAFETY RATING</span>
                        <span
                          className={`font-bold ${
                            dep.rollbackSafetyRating === 'HIGH'
                              ? 'text-emerald-400'
                              : dep.rollbackSafetyRating === 'MEDIUM'
                              ? 'text-amber-400'
                              : 'text-rose-400'
                          }`}
                        >
                          {dep.rollbackSafetyRating}
                        </span>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      </div>

      {/* Config Diff Inspector Modal */}
      {isDiffOpen && diffTarget && (
        <div className="fixed inset-0 z-50 bg-slate-950/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-3xl w-full p-6 shadow-2xl relative">
            <button
              onClick={() => setIsDiffOpen(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="flex items-center gap-2 mb-4">
              <FileCode className="w-5 h-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-white font-mono">
                Configuration Diff: {activeDeployment.version} ➔ {diffTarget.version}
              </h3>
            </div>

            <p className="text-xs text-slate-400 mb-4">
              Comparing live parameters vs target rollback version ({diffTarget.commitHash}).
            </p>

            <div className="bg-slate-950 rounded-xl border border-slate-800 p-4 font-mono text-xs max-h-96 overflow-y-auto space-y-2">
              <div className="text-slate-500 pb-1 border-b border-slate-800">
                --- active/{selectedApp.name}.yaml ({activeDeployment.version})<br />
                +++ rollback/{selectedApp.name}.yaml ({diffTarget.version})
              </div>

              <div className="bg-emerald-500/10 text-emerald-400 p-2 rounded border border-emerald-500/20">
                + REPLICA_COUNT: "{selectedApp.replicaCount}"<br />
                + API_GATEWAY_TIMEOUT: "5000ms"<br />
                + MAX_CONCURRENT_TRANSACTIONS: "1500"
              </div>

              <div className="bg-rose-500/10 text-rose-400 p-2 rounded border border-rose-500/20">
                - API_GATEWAY_TIMEOUT: "12000ms"<br />
                - EXPERIMENTAL_PQC_ALGORITHM: "Kyber-1024-v3-beta"<br />
                - SAVE_API_RATE_LIMIT: "200req/sec"
              </div>

              <div className="text-slate-400 p-2">
                &nbsp;&nbsp;HEALTH_CHECK_INTERVAL: "5s"<br />
                &nbsp;&nbsp;SOVEREIGN_ID_VAULT_ENDPOINT: "https://vault.usgov.treasury.internal/v2"<br />
                &nbsp;&nbsp;ENCRYPTION_KEY_ROTATION_DAYS: "30"
              </div>
            </div>

            <div className="mt-6 flex justify-end gap-3">
              <button
                onClick={() => setIsDiffOpen(false)}
                className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold"
              >
                Close Inspector
              </button>
              <button
                onClick={() => {
                  setIsDiffOpen(false);
                  handleStartRollback(diffTarget);
                }}
                className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold flex items-center gap-1.5"
              >
                <RotateCcw className="w-4 h-4" />
                Proceed to Fast-Track Rollback
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Fast-Track Rollback Execution Modal */}
      {isRollbackExecuting && targetRollback && (
        <div className="fixed inset-0 z-50 bg-slate-950/90 backdrop-blur-md flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 rounded-2xl max-w-2xl w-full p-6 shadow-2xl relative overflow-hidden">
            
            {/* Animated Status Header */}
            <div className="flex items-center justify-between pb-4 border-b border-slate-800">
              <div className="flex items-center gap-3">
                <div className={`p-3 rounded-xl border ${rollbackCompleted ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400' : 'bg-rose-500/10 border-rose-500/30 text-rose-400 animate-pulse'}`}>
                  {rollbackCompleted ? <CheckCircle2 className="w-6 h-6" /> : <RotateCcw className="w-6 h-6 animate-spin" />}
                </div>
                <div>
                  <h3 className="text-lg font-bold text-white font-mono">
                    {rollbackCompleted ? 'Fast-Track Rollback Complete' : 'Executing Fast-Track Rollback'}
                  </h3>
                  <p className="text-xs text-slate-400">
                    Target App: <span className="text-slate-200 font-mono">{selectedApp.name}</span> ➔ Target Version: <span className="text-emerald-400 font-mono font-bold">{targetRollback.version}</span>
                  </p>
                </div>
              </div>

              <span className="text-xs font-mono px-3 py-1 rounded bg-slate-800 text-slate-300">
                {rollbackProgress}%
              </span>
            </div>

            {/* Progress Bar */}
            <div className="my-5">
              <div className="flex justify-between text-xs font-mono text-slate-400 mb-1.5">
                <span>Current Stage: <span className="text-indigo-400 font-semibold">{rollbackStep}</span></span>
                <span>{rollbackProgress}/100</span>
              </div>
              <div className="w-full bg-slate-950 rounded-full h-2.5 overflow-hidden border border-slate-800">
                <div
                  className={`h-full transition-all duration-500 ease-out ${
                    rollbackCompleted ? 'bg-emerald-500' : 'bg-gradient-to-r from-rose-500 to-indigo-500'
                  }`}
                  style={{ width: `${rollbackProgress}%` }}
                />
              </div>
            </div>

            {/* Live Terminal Output */}
            <div className="bg-slate-950 rounded-xl border border-slate-800/80 p-4 font-mono text-[11px] text-slate-300 h-56 overflow-y-auto space-y-1.5 shadow-inner">
              <div className="text-slate-500 flex items-center gap-1.5 border-b border-slate-800/80 pb-2 mb-2">
                <Terminal className="w-3.5 h-3.5 text-indigo-400" />
                <span>FAST_TRACK_ROLLBACK_LOGGER // CLUSTER_INGRESS</span>
              </div>
              {rollbackLogs.map((log, index) => (
                <div key={index} className="leading-relaxed">
                  {log.includes('SUCCESS') ? (
                    <span className="text-emerald-400 font-bold">{log}</span>
                  ) : log.includes('PASS') ? (
                    <span className="text-cyan-400">{log}</span>
                  ) : (
                    <span>{log}</span>
                  )}
                </div>
              ))}
            </div>

            {/* Modal Actions */}
            <div className="mt-6 flex justify-end">
              <button
                disabled={!rollbackCompleted}
                onClick={handleFinishRollbackModal}
                className={`px-5 py-2.5 rounded-xl font-semibold text-xs flex items-center gap-2 transition-all ${
                  rollbackCompleted
                    ? 'bg-emerald-500 hover:bg-emerald-400 text-slate-950 shadow-lg shadow-emerald-500/20 cursor-pointer'
                    : 'bg-slate-800 text-slate-500 cursor-not-allowed border border-slate-700'
                }`}
              >
                <Check className="w-4 h-4" />
                {rollbackCompleted ? 'Acknowledge & Close' : 'Rollback In Progress...'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default DeploymentRollbackManager;