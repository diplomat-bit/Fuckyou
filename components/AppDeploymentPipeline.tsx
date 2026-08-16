import React, { useState, useEffect, useMemo, useRef } from 'react';
import {
  Play,
  RotateCcw,
  CheckCircle2,
  XCircle,
  Clock,
  Terminal,
  ShieldCheck,
  GitBranch,
  GitCommit,
  Server,
  RefreshCw,
  Cpu,
  Filter,
  Search,
  ChevronRight,
  AlertTriangle,
  Lock,
  Eye,
  EyeOff,
  Layers,
  ExternalLink,
  Download,
  Zap,
  Check,
  Copy,
  Settings,
  Activity,
  Box,
  FileCode,
  Sliders
} from 'lucide-react';

// --- TYPES ---
export type DeploymentStatus = 'success' | 'failed' | 'in_progress' | 'queued' | 'rolled_back' | 'idle';
export type StageStatus = 'success' | 'failed' | 'running' | 'queued' | 'skipped';
export type Environment = 'Production' | 'Staging' | 'Sandbox' | 'GovCloud';

export interface PipelineStage {
  id: string;
  name: string;
  status: StageStatus;
  durationSec: number;
  logs: string[];
}

export interface BuildHistoryItem {
  id: string;
  buildNumber: number;
  environment: Environment;
  branch: string;
  commitHash: string;
  commitMessage: string;
  author: string;
  timestamp: string;
  durationSec: number;
  status: DeploymentStatus;
  canRollback: boolean;
}

export interface AppConfig {
  id: string;
  name: string;
  category: string;
  repository: string;
  defaultBranch: string;
  activeEnvironment: Environment;
  lastDeployed: string;
  status: DeploymentStatus;
  currentBuildNumber: number;
  cluster: string;
  replicas: number;
  healthScore: number;
  stages: PipelineStage[];
  history: BuildHistoryItem[];
  envVars: { key: string; value: string; isSecret: boolean }[];
}

// --- MOCK INITIAL DATA ---
const INITIAL_APPS: AppConfig[] = [
  {
    id: 'citi-gateway-service',
    name: 'CitiConnect Integration Gateway',
    category: 'Core Banking API',
    repository: 'github.com/sovereign-org/citiconnect-gateway',
    defaultBranch: 'main',
    activeEnvironment: 'Production',
    lastDeployed: '10 minutes ago',
    status: 'success',
    currentBuildNumber: 412,
    cluster: 'us-east-prod-k8s-01',
    replicas: 12,
    healthScore: 99.8,
    stages: [
      {
        id: 'source',
        name: 'Source & Linter',
        status: 'success',
        durationSec: 18,
        logs: [
          '[INFO] Cloning repository commit hash e8f2a11...',
          '[INFO] Running ESLint v8.42.0...',
          '[SUCCESS] 0 errors, 0 warnings found.'
        ]
      },
      {
        id: 'build',
        name: 'Container Build',
        status: 'success',
        durationSec: 45,
        logs: [
          '[INFO] Docker buildkit initialized.',
          '[INFO] Building image: registry.internal/citi-gateway:v4.1.2',
          '[INFO] Exporting layers and pushing to artifact vault...',
          '[SUCCESS] Image digest: sha256:8f2a0b12c98d7211'
        ]
      },
      {
        id: 'security',
        name: 'FedRAMP & SAST Scan',
        status: 'success',
        durationSec: 32,
        logs: [
          '[INFO] Initiating SonarQube & Trivy vulnerability scan...',
          '[INFO] Checking FAPI 2.0 Security Compliance & JWE/JWS Key Vault...',
          '[SUCCESS] No High or Critical CVEs found. Compliance verified.'
        ]
      },
      {
        id: 'test',
        name: 'Integration Test Suite',
        status: 'success',
        durationSec: 64,
        logs: [
          '[INFO] Provisioning mock Citi UK Payments sandbox API...',
          '[INFO] Running 142 e2e test cases...',
          '[SUCCESS] All tests passed (142/142).'
        ]
      },
      {
        id: 'deploy',
        name: 'Kubernetes Rolling Deploy',
        status: 'success',
        durationSec: 25,
        logs: [
          '[INFO] Applying Helm release citi-gateway-v412...',
          '[INFO] Scaling deployment 12/12 pods healthy.',
          '[SUCCESS] Zero-downtime canary rollout completed.'
        ]
      }
    ],
    history: [
      {
        id: 'b-412',
        buildNumber: 412,
        environment: 'Production',
        branch: 'main',
        commitHash: 'e8f2a11',
        commitMessage: 'fix(fapi): strict mTLS verification for Citi B2B endpoints',
        author: 'DevSecOps Team',
        timestamp: '2025-02-28 14:32:10',
        durationSec: 184,
        status: 'success',
        canRollback: false
      },
      {
        id: 'b-411',
        buildNumber: 411,
        environment: 'Production',
        branch: 'main',
        commitHash: 'c90b3e2',
        commitMessage: 'feat(iso20022): add CAMT.053 XML statement parser handler',
        author: 'Alex Vance',
        timestamp: '2025-02-27 09:15:22',
        durationSec: 192,
        status: 'success',
        canRollback: true
      },
      {
        id: 'b-410',
        buildNumber: 410,
        environment: 'Production',
        branch: 'patch-v4',
        commitHash: '7a12d99',
        commitMessage: 'perf(redis): cache routing number resolution queries',
        author: 'Elena Rostova',
        timestamp: '2025-02-26 18:04:00',
        durationSec: 140,
        status: 'failed',
        canRollback: false
      }
    ],
    envVars: [
      { key: 'CITI_OAUTH_CLIENT_ID', value: 'citi-app-prod-98124', isSecret: false },
      { key: 'CITI_PRIVATE_KEY_PEM', value: '-----BEGIN RSA PRIVATE KEY-----\nMIIEowIBAAKCAQEA...', isSecret: true },
      { key: 'REDIS_CLUSTER_URL', value: 'rediss://redis-cluster.internal:6379', isSecret: false },
      { key: 'FEDRAMP_COMPLIANCE_MODE', value: 'STRICT_HIGH', isSecret: false }
    ]
  },
  {
    id: 'sovereign-id-verifier',
    name: 'Sovereign ID Cryptography Engine',
    category: 'Identity & Zero-Knowledge',
    repository: 'github.com/sovereign-org/sovereign-zk-id',
    defaultBranch: 'main',
    activeEnvironment: 'GovCloud',
    lastDeployed: '1 hour ago',
    status: 'success',
    currentBuildNumber: 189,
    cluster: 'gov-us-west-k8s-03',
    replicas: 8,
    healthScore: 100.0,
    stages: [
      {
        id: 'source',
        name: 'Source & Linter',
        status: 'success',
        durationSec: 12,
        logs: ['[INFO] Pulling branch main...', '[SUCCESS] Rust cargo clippy check passed.']
      },
      {
        id: 'build',
        name: 'WASM & Microservice Compilation',
        status: 'success',
        durationSec: 88,
        logs: ['[INFO] Compiling circom ZK circuits...', '[SUCCESS] Binary generated successfully.']
      },
      {
        id: 'security',
        name: 'PQC Quantum Audit',
        status: 'success',
        durationSec: 40,
        logs: ['[INFO] Verifying Dilithium & Kyber quantum-safe signatures...', '[SUCCESS] Verifier verified.']
      },
      {
        id: 'test',
        name: 'ZK Proof Verification Suite',
        status: 'success',
        durationSec: 50,
        logs: ['[INFO] Testing 50,000 voter ID proofs...', '[SUCCESS] Zero failures.']
      },
      {
        id: 'deploy',
        name: 'Enclave Deployment',
        status: 'success',
        durationSec: 30,
        logs: ['[INFO] Deploying enclave binary to AWS Nitro Enclaves...', '[SUCCESS] Live.']
      }
    ],
    history: [
      {
        id: 'b-189',
        buildNumber: 189,
        environment: 'GovCloud',
        branch: 'main',
        commitHash: '3f99aa1',
        commitMessage: 'feat(zkp): upgrade snarkjs verifier to circuit v2',
        author: 'Dr. Marcus Vance',
        timestamp: '2025-02-28 13:00:15',
        durationSec: 220,
        status: 'success',
        canRollback: true
      }
    ],
    envVars: [
      { key: 'ZK_VERIFYING_KEY_PATH', value: '/etc/keys/voter_zk_v2.key', isSecret: false },
      { key: 'ENCLAVE_CID', value: '16', isSecret: false }
    ]
  },
  {
    id: 'modern-treasury-bridge',
    name: 'Modern Treasury Ledger Bridge',
    category: 'Ledger & Settlement',
    repository: 'github.com/sovereign-org/modern-treasury-bridge',
    defaultBranch: 'main',
    activeEnvironment: 'Production',
    lastDeployed: 'Failed 4 hours ago',
    status: 'failed',
    currentBuildNumber: 94,
    cluster: 'us-east-prod-k8s-02',
    replicas: 4,
    healthScore: 82.5,
    stages: [
      {
        id: 'source',
        name: 'Source & Linter',
        status: 'success',
        durationSec: 15,
        logs: ['[INFO] Checkout commit 99ab210...', '[SUCCESS] Prettier & ESLint clean.']
      },
      {
        id: 'build',
        name: 'Container Build',
        status: 'success',
        durationSec: 42,
        logs: ['[INFO] Docker image built successfully.']
      },
      {
        id: 'security',
        name: 'Security Scan',
        status: 'success',
        durationSec: 20,
        logs: ['[INFO] Dependency scan finished.']
      },
      {
        id: 'test',
        name: 'Reconciliation Tests',
        status: 'failed',
        durationSec: 55,
        logs: [
          '[INFO] Testing double-entry ledger settlement idempotency...',
          '[ERROR] AssertFailed: Ledger mismatch detected in ledger_account_9022!',
          '[ERROR] Expected balance delta $0.00, received -$12,450.00',
          '[FATAL] Test pipeline aborted due to failure in LedgerReconcilerSpec.ts'
        ]
      },
      {
        id: 'deploy',
        name: 'Kubernetes Rolling Deploy',
        status: 'skipped',
        durationSec: 0,
        logs: ['[SKIPPED] Previous stage failed.']
      }
    ],
    history: [
      {
        id: 'b-94',
        buildNumber: 94,
        environment: 'Production',
        branch: 'main',
        commitHash: '99ab210',
        commitMessage: 'refactor(treasury): async webhook ledger sync handler',
        author: 'Sarah Chen',
        timestamp: '2025-02-28 10:11:04',
        durationSec: 132,
        status: 'failed',
        canRollback: false
      },
      {
        id: 'b-93',
        buildNumber: 93,
        environment: 'Production',
        branch: 'main',
        commitHash: '11fe432',
        commitMessage: 'chore: bump modern-treasury SDK to v3.12.0',
        author: 'Sarah Chen',
        timestamp: '2025-02-25 16:20:00',
        durationSec: 150,
        status: 'success',
        canRollback: true
      }
    ],
    envVars: [
      { key: 'TREASURY_API_KEY', value: 'live_sk_89127391823', isSecret: true },
      { key: 'LEDGER_ORG_ID', value: 'org_sovereign_global', isSecret: false }
    ]
  },
  {
    id: 'voter-registration-api',
    name: 'Florida Voter Registration Sync',
    category: 'Government Gateway',
    repository: 'github.com/sovereign-org/fl-voter-gateway',
    defaultBranch: 'main',
    activeEnvironment: 'Staging',
    lastDeployed: '3 days ago',
    status: 'idle',
    currentBuildNumber: 62,
    cluster: 'fl-state-gov-k8s',
    replicas: 6,
    healthScore: 98.0,
    stages: [
      { id: 'source', name: 'Source & Linter', status: 'success', durationSec: 10, logs: ['OK'] },
      { id: 'build', name: 'Container Build', status: 'success', durationSec: 30, logs: ['OK'] },
      { id: 'security', name: 'FedRAMP Scan', status: 'success', durationSec: 25, logs: ['OK'] },
      { id: 'test', name: 'Integration Tests', status: 'success', durationSec: 40, logs: ['OK'] },
      { id: 'deploy', name: 'Cluster Deploy', status: 'success', durationSec: 20, logs: ['OK'] }
    ],
    history: [
      {
        id: 'b-62',
        buildNumber: 62,
        environment: 'Staging',
        branch: 'main',
        commitHash: '42b109c',
        commitMessage: 'feat: add Save API non-citizen voter roll sync',
        author: 'DHS Integration Bot',
        timestamp: '2025-02-25 11:00:00',
        durationSec: 125,
        status: 'success',
        canRollback: true
      }
    ],
    envVars: [{ key: 'SAVE_API_ENDPOINT', value: 'https://save.dhs.gov/api/v2', isSecret: false }]
  }
];

export const AppDeploymentPipeline: React.FC = () => {
  // --- STATE ---
  const [apps, setApps] = useState<AppConfig[]>(INITIAL_APPS);
  const [selectedAppId, setSelectedAppId] = useState<string>('citi-gateway-service');
  const [activeTab, setActiveTab] = useState<'pipeline' | 'logs' | 'history' | 'env' | 'metrics'>('pipeline');
  const [environmentFilter, setEnvironmentFilter] = useState<string>('All');
  const [searchTerm, setSearchTerm] = useState<string>('');

  // Execution simulation state
  const [isBuilding, setIsBuilding] = useState<boolean>(false);
  const [buildProgressStageIndex, setBuildProgressStageIndex] = useState<number>(-1);
  const [triggerBranch, setTriggerBranch] = useState<string>('main');
  const [showTriggerModal, setShowTriggerModal] = useState<boolean>(false);
  const [showRollbackModal, setShowRollbackModal] = useState<boolean>(false);
  const [rollbackTarget, setRollbackTarget] = useState<BuildHistoryItem | null>(null);

  // Logs viewer state
  const [logFilter, setLogFilter] = useState<string>('');
  const [autoScrollLogs, setAutoScrollLogs] = useState<boolean>(true);
  const [showSecrets, setShowSecrets] = useState<{ [key: string]: boolean }>({});
  const [newEnvKey, setNewEnvKey] = useState<string>('');
  const [newEnvVal, setNewEnvVal] = useState<string>('');
  const [newEnvSecret, setNewEnvSecret] = useState<boolean>(false);
  const [copiedNotification, setCopiedNotification] = useState<boolean>(false);

  const logsEndRef = useRef<HTMLDivElement>(null);

  // Selected App Object
  const currentApp = useMemo(() => {
    return apps.find((a) => a.id === selectedAppId) || apps[0];
  }, [apps, selectedAppId]);

  // Combined logs for current app stages
  const currentAppLogs = useMemo(() => {
    if (!currentApp) return [];
    return currentApp.stages.flatMap((stage) =>
      stage.logs.map((log) => `[${stage.name.toUpperCase()}] ${log}`)
    );
  }, [currentApp]);

  // Filtered Apps
  const filteredApps = useMemo(() => {
    return apps.filter((app) => {
      const matchesEnv = environmentFilter === 'All' || app.activeEnvironment === environmentFilter;
      const matchesSearch =
        app.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        app.category.toLowerCase().includes(searchTerm.toLowerCase());
      return matchesEnv && matchesSearch;
    });
  }, [apps, environmentFilter, searchTerm]);

  // Scroll logs
  useEffect(() => {
    if (autoScrollLogs && logsEndRef.current && activeTab === 'logs') {
      logsEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [currentAppLogs, activeTab, autoScrollLogs]);

  // Trigger Mock Build Animation
  const handleTriggerBuild = () => {
    setShowTriggerModal(false);
    setIsBuilding(true);
    setBuildProgressStageIndex(0);

    // Reset stages for selected app
    setApps((prevApps) =>
      prevApps.map((app) => {
        if (app.id !== currentApp.id) return app;
        const newBuildNum = app.currentBuildNumber + 1;
        return {
          ...app,
          status: 'in_progress',
          currentBuildNumber: newBuildNum,
          stages: app.stages.map((stage, idx) => ({
            ...stage,
            status: idx === 0 ? 'running' : 'queued',
            logs: idx === 0 ? [`[INIT] Triggering deployment for branch ${triggerBranch}...`] : []
          }))
        };
      })
    );

    // Progressive step timer simulation
    let currentStage = 0;
    const interval = setInterval(() => {
      currentStage++;
      if (currentStage < currentApp.stages.length) {
        setBuildProgressStageIndex(currentStage);
        setApps((prevApps) =>
          prevApps.map((app) => {
            if (app.id !== currentApp.id) return app;
            return {
              ...app,
              stages: app.stages.map((s, idx) => {
                if (idx < currentStage) {
                  return {
                    ...s,
                    status: 'success',
                    logs: [...s.logs, `[SUCCESS] Stage ${s.name} completed in ${s.durationSec}s.`]
                  };
                }
                if (idx === currentStage) {
                  return {
                    ...s,
                    status: 'running',
                    logs: [`[INFO] Starting stage execution: ${s.name}...`]
                  };
                }
                return s;
              })
            };
          })
        );
      } else {
        clearInterval(interval);
        setIsBuilding(false);
        setBuildProgressStageIndex(-1);
        // Complete build
        setApps((prevApps) =>
          prevApps.map((app) => {
            if (app.id !== currentApp.id) return app;
            const newHistoryItem: BuildHistoryItem = {
              id: `b-${app.currentBuildNumber}`,
              buildNumber: app.currentBuildNumber,
              environment: app.activeEnvironment,
              branch: triggerBranch,
              commitHash: Math.random().toString(36).substring(2, 9),
              commitMessage: `manual deployment triggered on ${triggerBranch}`,
              author: 'Ops Console Admin',
              timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
              durationSec: 165,
              status: 'success',
              canRollback: true
            };
            return {
              ...app,
              status: 'success',
              lastDeployed: 'Just now',
              stages: app.stages.map((s) => ({
                ...s,
                status: 'success',
                logs: [...s.logs, `[COMPLETED] Verification clean.`]
              })),
              history: [newHistoryItem, ...app.history]
            };
          })
        );
      }
    }, 2500);
  };

  // Rollback Action
  const handleRollback = () => {
    if (!rollbackTarget) return;
    setShowRollbackModal(false);
    setIsBuilding(true);

    setTimeout(() => {
      setIsBuilding(false);
      setApps((prevApps) =>
        prevApps.map((app) => {
          if (app.id !== currentApp.id) return app;
          const rollbackBuildNum = app.currentBuildNumber + 1;
          const rollbackHistoryItem: BuildHistoryItem = {
            id: `b-${rollbackBuildNum}`,
            buildNumber: rollbackBuildNum,
            environment: app.activeEnvironment,
            branch: rollbackTarget.branch,
            commitHash: rollbackTarget.commitHash,
            commitMessage: `[ROLLBACK] Reverted to build #${rollbackTarget.buildNumber} (${rollbackTarget.commitHash})`,
            author: 'Rollback Dispatcher',
            timestamp: new Date().toISOString().replace('T', ' ').substring(0, 19),
            durationSec: 45,
            status: 'rolled_back',
            canRollback: false
          };
          return {
            ...app,
            status: 'success',
            lastDeployed: 'Just now (Rolled back)',
            currentBuildNumber: rollbackBuildNum,
            history: [rollbackHistoryItem, ...app.history]
          };
        })
      );
    }, 2000);
  };

  // Add Env Variable
  const handleAddEnvVar = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newEnvKey.trim()) return;
    setApps((prev) =>
      prev.map((app) => {
        if (app.id !== currentApp.id) return app;
        return {
          ...app,
          envVars: [...app.envVars, { key: newEnvKey.toUpperCase(), value: newEnvVal, isSecret: newEnvSecret }]
        };
      })
    );
    setNewEnvKey('');
    setNewEnvVal('');
    setNewEnvSecret(false);
  };

  // Copy Logs to Clipboard
  const handleCopyLogs = () => {
    const text = currentAppLogs.join('\n');
    navigator.clipboard.writeText(text);
    setCopiedNotification(true);
    setTimeout(() => setCopiedNotification(false), 2000);
  };

  // Helper status color badges
  const getStatusBadge = (status: DeploymentStatus | StageStatus) => {
    switch (status) {
      case 'success':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
            <CheckCircle2 className="w-3.5 h-3.5" /> Success
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
            <XCircle className="w-3.5 h-3.5" /> Failed
          </span>
        );
      case 'in_progress':
      case 'running':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20 animate-pulse">
            <RefreshCw className="w-3.5 h-3.5 animate-spin" /> In Progress
          </span>
        );
      case 'queued':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            <Clock className="w-3.5 h-3.5" /> Queued
          </span>
        );
      case 'rolled_back':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-purple-500/10 text-purple-400 border border-purple-500/20">
            <RotateCcw className="w-3.5 h-3.5" /> Rolled Back
          </span>
        );
      case 'skipped':
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-800 text-slate-500 border border-slate-700">
            Skipped
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-slate-500/10 text-slate-400 border border-slate-500/20">
            Idle
          </span>
        );
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 font-sans p-4 md:p-6 space-y-6">
      {/* HEADER BAR */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/80 border border-slate-800 p-5 rounded-2xl backdrop-blur-md shadow-xl">
        <div className="space-y-1">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-gradient-to-br from-indigo-500/20 to-cyan-500/20 rounded-xl border border-indigo-500/30 text-indigo-400">
              <Layers className="w-6 h-6" />
            </div>
            <div>
              <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
                App Deployment Pipeline & Orchestrator
                <span className="text-xs font-mono font-normal px-2 py-0.5 rounded bg-indigo-950 text-indigo-300 border border-indigo-800/50">
                  v2.4.0-FedRAMP
                </span>
              </h1>
              <p className="text-sm text-slate-400">
                Trigger builds, view live container logs, audit FedRAMP compliance, and execute automated rollbacks.
              </p>
            </div>
          </div>
        </div>

        {/* Global Deployment Metrics */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div className="bg-slate-950/60 border border-slate-800/80 px-3.5 py-2 rounded-xl text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Total Builds Today</span>
            <div className="text-lg font-bold text-slate-100 font-mono mt-0.5">38</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 px-3.5 py-2 rounded-xl text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Success Rate</span>
            <div className="text-lg font-bold text-emerald-400 font-mono mt-0.5">97.4%</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 px-3.5 py-2 rounded-xl text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Avg Build Time</span>
            <div className="text-lg font-bold text-cyan-400 font-mono mt-0.5">2m 45s</div>
          </div>
          <div className="bg-slate-950/60 border border-slate-800/80 px-3.5 py-2 rounded-xl text-center">
            <span className="text-xs text-slate-400 uppercase tracking-wider font-semibold">Active Services</span>
            <div className="text-lg font-bold text-indigo-400 font-mono mt-0.5">{apps.length}</div>
          </div>
        </div>
      </div>

      {/* MAIN GRID CONTENT */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* SIDEBAR / APP REGISTRY SELECTOR (4 COLS) */}
        <div className="lg:col-span-4 bg-slate-900/60 border border-slate-800 rounded-2xl p-4 flex flex-col gap-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold uppercase tracking-wider text-slate-300 flex items-center gap-2">
              <Box className="w-4 h-4 text-indigo-400" />
              Registered Apps ({filteredApps.length})
            </h2>
            <div className="flex items-center gap-2">
              <Filter className="w-3.5 h-3.5 text-slate-400" />
              <select
                className="bg-slate-950 border border-slate-800 text-xs text-slate-300 rounded-lg px-2.5 py-1 focus:outline-none focus:border-indigo-500"
                value={environmentFilter}
                onChange={(e) => setEnvironmentFilter(e.target.value)}
              >
                <option value="All">All Envs</option>
                <option value="Production">Production</option>
                <option value="GovCloud">GovCloud</option>
                <option value="Staging">Staging</option>
                <option value="Sandbox">Sandbox</option>
              </select>
            </div>
          </div>

          {/* Search box */}
          <div className="relative">
            <Search className="w-4 h-4 text-slate-500 absolute left-3 top-2.5" />
            <input
              type="text"
              placeholder="Search apps or categories..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl pl-9 pr-3 py-2 text-xs text-slate-200 placeholder-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* App List */}
          <div className="space-y-2.5 overflow-y-auto max-h-[600px] pr-1">
            {filteredApps.map((app) => {
              const isSelected = app.id === currentApp.id;
              return (
                <button
                  key={app.id}
                  onClick={() => setSelectedAppId(app.id)}
                  className={`w-full text-left p-3.5 rounded-xl border transition-all duration-200 flex flex-col gap-2 ${
                    isSelected
                      ? 'bg-indigo-950/40 border-indigo-500/60 ring-1 ring-indigo-500/50 shadow-lg shadow-indigo-950/50'
                      : 'bg-slate-950/40 border-slate-800/80 hover:border-slate-700 hover:bg-slate-950/80'
                  }`}
                >
                  <div className="flex items-start justify-between">
                    <div>
                      <div className="font-semibold text-sm text-slate-100 flex items-center gap-1.5">
                        {app.name}
                      </div>
                      <div className="text-xs text-slate-400 flex items-center gap-2 mt-0.5">
                        <span>{app.category}</span>
                        <span>•</span>
                        <span className="font-mono text-slate-500">#{app.currentBuildNumber}</span>
                      </div>
                    </div>
                    {getStatusBadge(app.status)}
                  </div>

                  <div className="flex items-center justify-between text-xs text-slate-400 pt-2 border-t border-slate-800/60 mt-1">
                    <span className="flex items-center gap-1 font-mono text-[11px] text-slate-400">
                      <Server className="w-3 h-3 text-slate-500" />
                      {app.activeEnvironment}
                    </span>
                    <span className="text-[11px] text-slate-400">{app.lastDeployed}</span>
                  </div>
                </button>
              );
            })}

            {filteredApps.length === 0 && (
              <div className="p-8 text-center text-slate-500 text-xs">No matching application pipelines found.</div>
            )}
          </div>
        </div>

        {/* MAIN DISPLAY / PIPELINE DETAILS CONSOLE (8 COLS) */}
        <div className="lg:col-span-8 bg-slate-900/60 border border-slate-800 rounded-2xl p-5 flex flex-col gap-5">
          {/* TOP APP HEADER BAR */}
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-4 border-b border-slate-800">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-bold text-white">{currentApp.name}</h2>
                <span className="text-xs font-mono bg-slate-800 px-2 py-0.5 rounded text-slate-300">
                  {currentApp.activeEnvironment}
                </span>
              </div>
              <div className="flex items-center gap-4 text-xs text-slate-400 font-mono">
                <span className="flex items-center gap-1">
                  <GitBranch className="w-3.5 h-3.5 text-indigo-400" /> {currentApp.defaultBranch}
                </span>
                <span className="flex items-center gap-1">
                  <GitCommit className="w-3.5 h-3.5 text-cyan-400" /> {currentApp.history[0]?.commitHash || 'head'}
                </span>
                <span className="flex items-center gap-1 text-slate-400">
                  <Activity className="w-3.5 h-3.5 text-emerald-400" /> {currentApp.healthScore}% Healthy
                </span>
              </div>
            </div>

            {/* ACTION BUTTONS */}
            <div className="flex items-center gap-2.5">
              <button
                disabled={isBuilding}
                onClick={() => setShowRollbackModal(true)}
                className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-50 text-slate-200 border border-slate-700 text-xs font-semibold rounded-xl flex items-center gap-1.5 transition-colors"
              >
                <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
                Rollback
              </button>

              <button
                disabled={isBuilding}
                onClick={() => setShowTriggerModal(true)}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white text-xs font-semibold rounded-xl flex items-center gap-2 shadow-lg shadow-indigo-600/30 transition-all"
              >
                {isBuilding ? (
                  <>
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                    Deploying...
                  </>
                ) : (
                  <>
                    <Play className="w-3.5 h-3.5 fill-current" />
                    Trigger Deploy
                  </>
                )}
              </button>
            </div>
          </div>

          {/* PIPELINE VISUAL STAGE FLOW */}
          <div className="bg-slate-950/80 border border-slate-800 p-4 rounded-xl">
            <div className="flex items-center justify-between mb-3">
              <span className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-amber-400" />
                Active Pipeline Execution Flow (Build #{currentApp.currentBuildNumber})
              </span>
              <span className="text-xs text-slate-400 font-mono">
                {currentApp.stages.reduce((acc, stage) => acc + stage.durationSec, 0)}s total run duration
              </span>
            </div>

            {/* Horizontal Stages */}
            <div className="grid grid-cols-1 sm:grid-cols-5 gap-2 relative">
              {currentApp.stages.map((stage, idx) => {
                const isCurrentActive = buildProgressStageIndex === idx;
                return (
                  <div
                    key={stage.id}
                    className={`relative p-3 rounded-xl border flex flex-col justify-between transition-all ${
                      isCurrentActive
                        ? 'bg-indigo-950/60 border-indigo-500 shadow-md ring-1 ring-indigo-500/50'
                        : stage.status === 'success'
                        ? 'bg-slate-900/90 border-emerald-500/30'
                        : stage.status === 'failed'
                        ? 'bg-slate-900/90 border-rose-500/30'
                        : 'bg-slate-900/40 border-slate-800 opacity-70'
                    }`}
                  >
                    <div>
                      <div className="flex items-center justify-between mb-1.5">
                        <span className="text-[11px] font-mono font-medium text-slate-400">Step 0{idx + 1}</span>
                        {getStatusBadge(stage.status)}
                      </div>
                      <div className="text-xs font-semibold text-slate-200 line-clamp-1">{stage.name}</div>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400 font-mono">
                      <span>{stage.durationSec}s</span>
                      <ChevronRight className="w-3 h-3 text-slate-600" />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* TAB NAVIGATION */}
          <div className="flex items-center border-b border-slate-800 gap-1 overflow-x-auto">
            <button
              onClick={() => setActiveTab('pipeline')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'pipeline'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Layers className="w-3.5 h-3.5" />
              Stage Status & Details
            </button>
            <button
              onClick={() => setActiveTab('logs')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'logs'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Terminal className="w-3.5 h-3.5" />
              Live Output Terminal
            </button>
            <button
              onClick={() => setActiveTab('history')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'history'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Clock className="w-3.5 h-3.5" />
              Build History ({currentApp.history.length})
            </button>
            <button
              onClick={() => setActiveTab('env')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'env'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Lock className="w-3.5 h-3.5" />
              Environment Secrets ({currentApp.envVars.length})
            </button>
            <button
              onClick={() => setActiveTab('metrics')}
              className={`px-4 py-2.5 text-xs font-semibold flex items-center gap-2 border-b-2 transition-colors whitespace-nowrap ${
                activeTab === 'metrics'
                  ? 'border-indigo-500 text-indigo-400 bg-indigo-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Sliders className="w-3.5 h-3.5" />
              Cluster Metrics
            </button>
          </div>

          {/* TAB 1: STAGE DETAILS */}
          {activeTab === 'pipeline' && (
            <div className="space-y-4">
              <div className="space-y-3">
                {currentApp.stages.map((stage, idx) => (
                  <div
                    key={stage.id}
                    className="bg-slate-950/60 border border-slate-800/80 rounded-xl p-4 flex flex-col gap-3"
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-7 h-7 rounded-lg bg-slate-900 border border-slate-800 flex items-center justify-center font-mono text-xs font-bold text-slate-300">
                          {idx + 1}
                        </div>
                        <div>
                          <h4 className="text-sm font-semibold text-slate-200">{stage.name}</h4>
                          <span className="text-xs text-slate-400 font-mono">
                            Duration: {stage.durationSec} seconds
                          </span>
                        </div>
                      </div>
                      {getStatusBadge(stage.status)}
                    </div>

                    {/* Stage Mini Logs View */}
                    <div className="bg-slate-950 border border-slate-900 rounded-lg p-3 font-mono text-[11px] text-slate-300 space-y-1">
                      {stage.logs.length > 0 ? (
                        stage.logs.map((log, lIdx) => (
                          <div
                            key={lIdx}
                            className={`flex items-start gap-2 ${
                              log.includes('[ERROR]') || log.includes('[FATAL]')
                                ? 'text-rose-400 font-semibold'
                                : log.includes('[SUCCESS]')
                                ? 'text-emerald-400'
                                : 'text-slate-400'
                            }`}
                          >
                            <span className="text-slate-600 select-none">&gt;</span>
                            <span>{log}</span>
                          </div>
                        ))
                      ) : (
                        <div className="text-slate-600 italic">No logs generated for this step yet...</div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 2: LIVE OUTPUT TERMINAL */}
          {activeTab === 'logs' && (
            <div className="bg-slate-950 border border-slate-800 rounded-xl p-4 flex flex-col gap-3 font-mono text-xs">
              <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-slate-800">
                <div className="flex items-center gap-2 text-slate-400">
                  <Terminal className="w-4 h-4 text-emerald-400" />
                  <span>Terminal Console Stream - {currentApp.name}</span>
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="text"
                    placeholder="Filter console log output..."
                    value={logFilter}
                    onChange={(e) => setLogFilter(e.target.value)}
                    className="bg-slate-900 border border-slate-800 rounded-lg px-2.5 py-1 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    onClick={handleCopyLogs}
                    className="p-1.5 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg text-slate-300 transition-colors flex items-center gap-1 text-xs px-2"
                    title="Copy output"
                  >
                    {copiedNotification ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                    {copiedNotification ? 'Copied' : 'Copy'}
                  </button>
                  <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer pl-2">
                    <input
                      type="checkbox"
                      checked={autoScrollLogs}
                      onChange={(e) => setAutoScrollLogs(e.target.checked)}
                      className="rounded bg-slate-900 border-slate-800 text-indigo-600 focus:ring-0"
                    />
                    Auto-scroll
                  </label>
                </div>
              </div>

              {/* Log Output Box */}
              <div className="bg-slate-950 rounded-lg p-3 min-h-[350px] max-h-[450px] overflow-y-auto space-y-1 text-slate-300">
                {currentAppLogs
                  .filter((log) => log.toLowerCase().includes(logFilter.toLowerCase()))
                  .map((log, index) => (
                    <div
                      key={index}
                      className={`leading-relaxed flex items-start gap-2 ${
                        log.includes('[ERROR]') || log.includes('[FATAL]')
                          ? 'text-rose-400 font-semibold bg-rose-950/20 px-1 rounded'
                          : log.includes('[SUCCESS]')
                          ? 'text-emerald-400'
                          : log.includes('[INIT]')
                          ? 'text-amber-300'
                          : 'text-slate-300'
                      }`}
                    >
                      <span className="text-slate-600 text-[10px] select-none">{index + 1}</span>
                      <span>{log}</span>
                    </div>
                  ))}
                <div ref={logsEndRef} />
              </div>
            </div>
          )}

          {/* TAB 3: BUILD HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-4">
              <div className="overflow-x-auto border border-slate-800 rounded-xl bg-slate-950/60">
                <table className="w-full text-left border-collapse">
                  <thead>
                    <tr className="border-b border-slate-800 text-xs font-semibold uppercase text-slate-400 bg-slate-900/50">
                      <th className="p-3.5">Build #</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5">Branch / Commit</th>
                      <th className="p-3.5">Author</th>
                      <th className="p-3.5">Timestamp</th>
                      <th className="p-3.5">Duration</th>
                      <th className="p-3.5 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60 text-xs font-mono">
                    {currentApp.history.map((item) => (
                      <tr key={item.id} className="hover:bg-slate-900/40 transition-colors">
                        <td className="p-3.5 font-bold text-slate-200">#{item.buildNumber}</td>
                        <td className="p-3.5">{getStatusBadge(item.status)}</td>
                        <td className="p-3.5">
                          <div className="font-sans font-semibold text-slate-200 line-clamp-1">
                            {item.commitMessage}
                          </div>
                          <div className="text-slate-500 text-[11px] flex items-center gap-2 mt-0.5">
                            <span className="text-indigo-400 flex items-center gap-1">
                              <GitBranch className="w-3 h-3" /> {item.branch}
                            </span>
                            <span>•</span>
                            <span className="text-slate-400">{item.commitHash}</span>
                          </div>
                        </td>
                        <td className="p-3.5 text-slate-300 font-sans">{item.author}</td>
                        <td className="p-3.5 text-slate-400">{item.timestamp}</td>
                        <td className="p-3.5 text-slate-400">{item.durationSec}s</td>
                        <td className="p-3.5 text-right">
                          {item.canRollback && (
                            <button
                              onClick={() => {
                                setRollbackTarget(item);
                                setShowRollbackModal(true);
                              }}
                              className="px-2.5 py-1 bg-amber-500/10 hover:bg-amber-500/20 text-amber-300 border border-amber-500/30 rounded-lg text-xs font-sans font-semibold transition-colors flex items-center gap-1 ml-auto"
                            >
                              <RotateCcw className="w-3 h-3" /> Rollback
                            </button>
                          )}
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 4: ENVIRONMENT SECRETS CONFIG */}
          {activeTab === 'env' && (
            <div className="space-y-5">
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4">
                <h3 className="text-sm font-semibold text-white mb-1 flex items-center gap-2">
                  <Lock className="w-4 h-4 text-indigo-400" />
                  Environment Variables & Secrets Vault
                </h3>
                <p className="text-xs text-slate-400 mb-4">
                  Encrypted vault stored in HashiCorp Vault / Azure Key Vault. Injected at container runtime.
                </p>

                <div className="space-y-2.5">
                  {currentApp.envVars.map((env, i) => {
                    const isVisible = showSecrets[env.key];
                    return (
                      <div
                        key={i}
                        className="flex items-center justify-between p-3 bg-slate-950 border border-slate-800/80 rounded-xl text-xs font-mono"
                      >
                        <div className="flex items-center gap-3">
                          <span className="font-bold text-indigo-300">{env.key}</span>
                          {env.isSecret && (
                            <span className="text-[10px] uppercase font-semibold px-1.5 py-0.5 rounded bg-rose-500/10 text-rose-400 border border-rose-500/20">
                              Secret
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-3">
                          <span className="text-slate-400 max-w-[280px] truncate">
                            {env.isSecret && !isVisible ? '••••••••••••••••••••••••' : env.value}
                          </span>
                          {env.isSecret && (
                            <button
                              onClick={() =>
                                setShowSecrets((prev) => ({ ...prev, [env.key]: !prev[env.key] }))
                              }
                              className="p-1 text-slate-400 hover:text-slate-200 transition-colors"
                            >
                              {isVisible ? <EyeOff className="w-3.5 h-3.5" /> : <Eye className="w-3.5 h-3.5" />}
                            </button>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Add Variable Form */}
              <form onSubmit={handleAddEnvVar} className="bg-slate-950/40 border border-slate-800/80 rounded-xl p-4 space-y-3">
                <h4 className="text-xs font-semibold text-slate-300 uppercase tracking-wider">
                  Add Vault Key / Parameter
                </h4>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <input
                    type="text"
                    placeholder="KEY_NAME"
                    value={newEnvKey}
                    onChange={(e) => setNewEnvKey(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <input
                    type="text"
                    placeholder="Value"
                    value={newEnvVal}
                    onChange={(e) => setNewEnvVal(e.target.value)}
                    className="bg-slate-950 border border-slate-800 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 placeholder-slate-600 focus:outline-none focus:border-indigo-500"
                  />
                  <div className="flex items-center justify-between gap-2">
                    <label className="flex items-center gap-1.5 text-xs text-slate-400 cursor-pointer">
                      <input
                        type="checkbox"
                        checked={newEnvSecret}
                        onChange={(e) => setNewEnvSecret(e.target.checked)}
                        className="rounded bg-slate-950 border-slate-800 text-indigo-600 focus:ring-0"
                      />
                      Mask Secret
                    </label>
                    <button
                      type="submit"
                      className="px-3 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-lg transition-colors"
                    >
                      Save Key
                    </button>
                  </div>
                </div>
              </form>
            </div>
          )}

          {/* TAB 5: METRICS & CANARY */}
          {activeTab === 'metrics' && (
            <div className="space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Active Replicas</span>
                  <div className="text-2xl font-bold font-mono text-slate-100">{currentApp.replicas} Pods</div>
                  <span className="text-[11px] text-emerald-400">Target HPA 100% satisfied</span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Target Cluster</span>
                  <div className="text-base font-bold font-mono text-indigo-300 truncate">{currentApp.cluster}</div>
                  <span className="text-[11px] text-slate-400">AWS GovCloud / EKS</span>
                </div>
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-1">
                  <span className="text-xs text-slate-400 uppercase font-semibold">Post-Deploy Error Rate</span>
                  <div className="text-2xl font-bold font-mono text-emerald-400">0.02%</div>
                  <span className="text-[11px] text-slate-400">Threshold &lt; 0.5%</span>
                </div>
              </div>

              {/* Traffic Splitter / Canary Controller */}
              <div className="bg-slate-950/60 border border-slate-800 rounded-xl p-4 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <h4 className="text-sm font-semibold text-white">Istio Canary Traffic Controller</h4>
                    <p className="text-xs text-slate-400">
                      Weighted routing between Active Stable v4.1.1 and New Deployment v{currentApp.currentBuildNumber}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20 text-xs font-mono font-bold">
                    100% Target Active
                  </span>
                </div>

                <div className="space-y-2 pt-2">
                  <div className="flex justify-between text-xs font-mono text-slate-400">
                    <span>Stable Target (0%)</span>
                    <span>Canary Target (100%)</span>
                  </div>
                  <input
                    type="range"
                    min="0"
                    max="100"
                    defaultValue="100"
                    className="w-full accent-indigo-500 bg-slate-800 rounded-lg h-2 cursor-pointer"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* TRIGGER BUILD MODAL */}
      {showTriggerModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <Play className="w-4 h-4 text-indigo-400" /> Trigger Manual Pipeline
              </h3>
              <button
                onClick={() => setShowTriggerModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Target Application</label>
                <input
                  type="text"
                  disabled
                  value={currentApp.name}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-400 font-mono"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-300 mb-1">Select Branch or Tag</label>
                <select
                  value={triggerBranch}
                  onChange={(e) => setTriggerBranch(e.target.value)}
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-xs text-slate-200 font-mono focus:outline-none focus:border-indigo-500"
                >
                  <option value="main">main (production release)</option>
                  <option value="staging">staging (integration test)</option>
                  <option value="patch-v4.2">patch-v4.2 (hotfix)</option>
                </select>
              </div>

              <div className="p-3 bg-amber-500/10 border border-amber-500/20 rounded-xl flex items-start gap-2 text-xs text-amber-300">
                <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <span>
                  Deploying to <strong className="text-white">{currentApp.activeEnvironment}</strong>. Full FedRAMP
                  SAST scans and automated unit tests will execute prior to cluster rollout.
                </span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowTriggerModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleTriggerBuild}
                className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-indigo-600/30"
              >
                Start Deployment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ROLLBACK CONFIRMATION MODAL */}
      {showRollbackModal && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-slate-900 border border-slate-800 w-full max-w-md rounded-2xl p-6 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <RotateCcw className="w-4 h-4 text-amber-400" /> Execute Emergency Rollback
              </h3>
              <button
                onClick={() => setShowRollbackModal(false)}
                className="text-slate-400 hover:text-white text-sm"
              >
                ✕
              </button>
            </div>

            <div className="space-y-3">
              <p className="text-xs text-slate-300">
                You are about to revert <strong className="text-white">{currentApp.name}</strong> on{' '}
                <span className="text-indigo-400 font-mono">{currentApp.activeEnvironment}</span> back to previous build:
              </p>

              <div className="p-3 bg-slate-950 border border-slate-800 rounded-xl space-y-1 font-mono text-xs">
                <div className="text-indigo-300 font-bold">
                  Build #{rollbackTarget ? rollbackTarget.buildNumber : currentApp.history[1]?.buildNumber || 'N/A'}
                </div>
                <div className="text-slate-400">
                  Commit: {rollbackTarget ? rollbackTarget.commitHash : currentApp.history[1]?.commitHash || 'prev'}
                </div>
                <div className="text-slate-300 font-sans mt-1">
                  "{rollbackTarget ? rollbackTarget.commitMessage : currentApp.history[1]?.commitMessage || 'Stable release'}"
                </div>
              </div>

              <div className="p-3 bg-rose-500/10 border border-rose-500/20 rounded-xl flex items-start gap-2 text-xs text-rose-300">
                <ShieldCheck className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                <span>Zero-downtime Pod replace strategy will be initiated. Reverts image tag within 30s.</span>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-800">
              <button
                onClick={() => setShowRollbackModal(false)}
                className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-semibold rounded-xl transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleRollback}
                className="px-4 py-2 bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold rounded-xl transition-colors shadow-lg shadow-rose-600/30"
              >
                Confirm Rollback
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AppDeploymentPipeline;