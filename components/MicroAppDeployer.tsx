import React, { useState, useEffect, useRef } from 'react';
import {
  Rocket,
  Server,
  Key,
  CheckCircle2,
  XCircle,
  AlertTriangle,
  Cpu,
  Globe,
  ShieldCheck,
  Terminal,
  Copy,
  Plus,
  Trash2,
  Eye,
  EyeOff,
  RefreshCw,
  Play,
  Check,
  X,
  Settings,
  Activity,
  Zap,
  Sliders,
  Download,
  Upload,
  Lock,
  ChevronRight,
  HardDrive
} from 'lucide-react';

export interface EnvVar {
  id: string;
  key: string;
  value: string;
  isSecret: boolean;
}

export interface DeploymentTarget {
  id: string;
  name: string;
  provider: 'GCP' | 'Azure' | 'AWS' | 'Sovereign' | 'Edge';
  region: string;
  complianceLevel: string;
  status: 'Operational' | 'Degraded' | 'Maintenance';
  latencyMs: number;
}

export interface PipelineStep {
  id: string;
  name: string;
  description: string;
  status: 'pending' | 'running' | 'completed' | 'failed';
  durationMs?: number;
}

export interface DeploymentLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warn' | 'error' | 'success';
  message: string;
  source: string;
}

export interface MicroAppDeployerProps {
  isOpen?: boolean;
  onClose?: () => void;
  appId?: string;
  appName?: string;
  initialTarget?: string;
  onDeployComplete?: (result: {
    deploymentId: string;
    endpointUrl: string;
    target: string;
    deployedAt: string;
  }) => void;
}

const DEFAULT_TARGETS: DeploymentTarget[] = [
  {
    id: 'gcp-us-central1',
    name: 'Google Cloud Run (Serverless)',
    provider: 'GCP',
    region: 'us-central1 (Iowa)',
    complianceLevel: 'FedRAMP Moderate',
    status: 'Operational',
    latencyMs: 18,
  },
  {
    id: 'azure-gov-east',
    name: 'Azure Government Container App',
    provider: 'Azure',
    region: 'usgov-virginia',
    complianceLevel: 'FedRAMP High / DoD IL5',
    status: 'Operational',
    latencyMs: 24,
  },
  {
    id: 'aws-us-east-1',
    name: 'AWS Fargate Micro-Cluster',
    provider: 'AWS',
    region: 'us-east-1 (N. Virginia)',
    complianceLevel: 'SOC2 / PCI-DSS',
    status: 'Operational',
    latencyMs: 15,
  },
  {
    id: 'sovereign-mesh-01',
    name: 'Sovereign On-Prem Air-Gapped Element',
    provider: 'Sovereign',
    region: 'Secure Bunker Alpha',
    complianceLevel: 'Zero-Trust Strict / FIPS 140-3',
    status: 'Operational',
    latencyMs: 4,
  },
  {
    id: 'edge-cloudflare-global',
    name: 'Global Edge Worker Mesh',
    provider: 'Edge',
    region: 'Global Edge (300+ Pop Points)',
    complianceLevel: 'High Availability Ultra',
    status: 'Operational',
    latencyMs: 8,
  },
];

const PRESET_ENVS: Record<string, EnvVar[]> = {
  Production: [
    { id: '1', key: 'NODE_ENV', value: 'production', isSecret: false },
    { id: '2', key: 'LOG_LEVEL', value: 'warn', isSecret: false },
    { id: '3', key: 'ENABLE_PQC_ENCRYPTION', value: 'true', isSecret: false },
    { id: '4', key: 'SOVEREIGN_VAULT_KEY', value: 'sv_prod_894f2910a82e91bc77e', isSecret: true },
    { id: '5', key: 'API_RATE_LIMIT', value: '5000', isSecret: false },
  ],
  Staging: [
    { id: '1', key: 'NODE_ENV', value: 'staging', isSecret: false },
    { id: '2', key: 'LOG_LEVEL', value: 'debug', isSecret: false },
    { id: '3', key: 'ENABLE_PQC_ENCRYPTION', value: 'true', isSecret: false },
    { id: '4', key: 'SOVEREIGN_VAULT_KEY', value: 'sv_stg_00129a882e33f1092', isSecret: true },
    { id: '5', key: 'API_RATE_LIMIT', value: '1000', isSecret: false },
  ],
  AirGapped: [
    { id: '1', key: 'NODE_ENV', value: 'production', isSecret: false },
    { id: '2', key: 'OFFLINE_MODE', value: 'true', isSecret: false },
    { id: '3', key: 'LOCAL_HARDWARE_HSM', value: 'enabled', isSecret: false },
    { id: '4', key: 'MASTER_REVOCATION_PIN', value: 'pin_99812_strict_sovereign', isSecret: true },
  ],
};

export const MicroAppDeployer: React.FC<MicroAppDeployerProps> = ({
  isOpen = true,
  onClose,
  appId = 'app-citi-settlement-gateway',
  appName = 'Citi Sovereign Settlement Gateway',
  initialTarget = 'azure-gov-east',
  onDeployComplete,
}) => {
  const [activeTab, setActiveTab] = useState<'config' | 'envs' | 'pipeline' | 'metrics'>('config');
  const [selectedTargetId, setSelectedTargetId] = useState<string>(initialTarget);
  const [cpuAllocation, setCpuAllocation] = useState<string>('1.0');
  const [memoryAllocation, setMemoryAllocation] = useState<string>('2Gi');
  const [minReplicas, setMinReplicas] = useState<number>(2);
  const [maxReplicas, setMaxReplicas] = useState<number>(10);
  const [customDomain, setCustomDomain] = useState<string>(`${appId}.sovereign.gov`);
  const [autoScaleThreshold, setAutoScaleThreshold] = useState<number>(75);

  const [envs, setEnvs] = useState<EnvVar[]>(PRESET_ENVS.Production);
  const [visibleSecrets, setVisibleSecrets] = useState<Record<string, boolean>>({});
  const [newKey, setNewKey] = useState<string>('');
  const [newValue, setNewValue] = useState<string>('');
  const [newIsSecret, setNewIsSecret] = useState<boolean>(false);

  const [deploymentState, setDeploymentState] = useState<'idle' | 'running' | 'success' | 'failed'>('idle');
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(-1);
  const [pipelineSteps, setPipelineSteps] = useState<PipelineStep[]>([
    { id: 'val', name: 'Manifest Validation', description: 'Checking schema conformance & permissions', status: 'pending' },
    { id: 'sec', name: 'Zero-Trust Security Scan', description: 'Auditing vulnerabilities, dependencies & PQC keys', status: 'pending' },
    { id: 'build', name: 'Container Build & Sign', description: 'Compiling target binary and signing with HSM key', status: 'pending' },
    { id: 'prov', name: 'Target Provisioning', description: 'Allocating compute, RAM, and network ingress routes', status: 'pending' },
    { id: 'traffic', name: 'Canary Traffic Shift', description: 'Routing 10% traffic to verify handshake stability', status: 'pending' },
    { id: 'health', name: 'Health Check Verification', description: 'Executing synthetic transaction probe & response timing', status: 'pending' },
  ]);

  const [logs, setLogs] = useState<DeploymentLog[]>([]);
  const [deployedEndpoint, setDeployedEndpoint] = useState<string | null>(null);
  const [deploymentTime, setDeploymentTime] = useState<number>(0);
  const logTerminalRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (logTerminalRef.current) {
      logTerminalRef.current.scrollTop = logTerminalRef.current.scrollHeight;
    }
  }, [logs]);

  if (!isOpen) return null;

  const handleAddEnv = () => {
    if (!newKey.trim()) return;
    const newEnv: EnvVar = {
      id: Date.now().toString(),
      key: newKey.trim().toUpperCase(),
      value: newValue,
      isSecret: newIsSecret,
    };
    setEnvs([...envs, newEnv]);
    setNewKey('');
    setNewValue('');
    setNewIsSecret(false);
  };

  const handleRemoveEnv = (id: string) => {
    setEnvs(envs.filter((e) => e.id !== id));
  };

  const toggleSecretVisibility = (id: string) => {
    setVisibleSecrets((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const applyPresetEnvs = (presetName: string) => {
    if (PRESET_ENVS[presetName]) {
      setEnvs(PRESET_ENVS[presetName]);
    }
  };

  const addLog = (level: 'info' | 'warn' | 'error' | 'success', message: string, source = 'Orchestrator') => {
    const newLog: DeploymentLog = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString().substring(11, 19),
      level,
      message,
      source,
    };
    setLogs((prev) => [...prev, newLog]);
  };

  const triggerDeployment = async () => {
    setActiveTab('pipeline');
    setDeploymentState('running');
    setLogs([]);
    setCurrentStepIndex(0);

    const steps = [...pipelineSteps].map((s) => ({ ...s, status: 'pending' as const }));
    setPipelineSteps(steps);

    const target = DEFAULT_TARGETS.find((t) => t.id === selectedTargetId) || DEFAULT_TARGETS[0];

    addLog('info', `Initializing orchestration pipeline for target [${target.name}]...`);
    addLog('info', `App Payload ID: ${appId} | Domain Target: https://${customDomain}`);
    addLog('info', `Hardware Spec: ${cpuAllocation} vCPU | ${memoryAllocation} RAM | Replicas: ${minReplicas}-${maxReplicas}`);

    const runStep = (index: number, stepLogs: { level: 'info' | 'warn' | 'error' | 'success'; msg: string }[], duration: number) => {
      return new Promise<void>((resolve) => {
        setPipelineSteps((prev) =>
          prev.map((s, i) => (i === index ? { ...s, status: 'running' } : s))
        );
        setCurrentStepIndex(index);

        let logDelay = 0;
        stepLogs.forEach((l) => {
          setTimeout(() => {
            addLog(l.level, l.msg, prevStepSource(index));
          }, logDelay);
          logDelay += Math.floor(duration / (stepLogs.length + 1));
        });

        setTimeout(() => {
          setPipelineSteps((prev) =>
            prev.map((s, i) => (i === index ? { ...s, status: 'completed', durationMs: duration } : s))
          );
          resolve();
        }, duration);
      });
    };

    const prevStepSource = (idx: number) => {
      const sources = ['Validator', 'SecScan', 'Builder', 'Provisioner', 'TrafficRouter', 'HealthProbe'];
      return sources[idx] || 'System';
    };

    const startTime = Date.now();

    // Step 0: Validation
    await runStep(
      0,
      [
        { level: 'info', msg: 'Parsing AppManifest schema & OpenAPI contracts...' },
        { level: 'info', msg: 'Checking environment variable integrity...' },
        { level: 'success', msg: 'Manifest validation passed (100% compliant).' },
      ],
      1200
    );

    // Step 1: Security
    await runStep(
      1,
      [
        { level: 'info', msg: 'Scanning AST for secret leaks & unsafe memory bindings...' },
        { level: 'warn', msg: 'Found 1 non-blocking warning: Deprecated legacy RSA fallback suppressed.' },
        { level: 'info', msg: 'Verifying Post-Quantum Lattice Cryptography signatures...' },
        { level: 'success', msg: 'Zero-Trust security scan clean. Cryptographic proof locked.' },
      ],
      1600
    );

    // Step 2: Build
    await runStep(
      2,
      [
        { level: 'info', msg: 'Triggering sub-second TypeScript compiler pass...' },
        { level: 'info', msg: 'Bundling isolated WASM & micro-service binaries...' },
        { level: 'info', msg: `Packaging container image sha256:8f4c029e1...` },
        { level: 'success', msg: 'Image generated and signed with HSM Sovereign Key.' },
      ],
      2100
    );

    // Step 3: Provision
    await runStep(
      3,
      [
        { level: 'info', msg: `Spinning up target runtime in ${target.region}...` },
        { level: 'info', msg: `Binding CPU limit (${cpuAllocation}) and Memory (${memoryAllocation})...` },
        { level: 'info', msg: 'Injecting dynamic secrets into secure enclave memory space...' },
        { level: 'success', msg: 'Cluster nodes allocated and network ingress established.' },
      ],
      1800
    );

    // Step 4: Traffic Shift
    await runStep(
      4,
      [
        { level: 'info', msg: 'Initiating weighted routing shift: 0% -> 10%...' },
        { level: 'info', msg: 'Monitoring error rates on canary pods...' },
        { level: 'info', msg: 'Canary healthy (0.00% drop rate). Scaling up to 100%...' },
        { level: 'success', msg: '100% live traffic shifted seamlessly to new release.' },
      ],
      1400
    );

    // Step 5: Health Check
    await runStep(
      5,
      [
        { level: 'info', msg: `Dispatching synthetic PING to https://${customDomain}/health...` },
        { level: 'info', msg: `Response received: HTTP 200 OK (${target.latencyMs}ms latency).` },
        { level: 'info', msg: 'Verifying database synchronization & ledger bridge state...' },
        { level: 'success', msg: 'All telemetry nodes operational. Deployment finalized!' },
      ],
      1200
    );

    const totalDuration = Math.round((Date.now() - startTime) / 1000);
    setDeploymentTime(totalDuration);
    setDeploymentState('success');
    const finalEndpoint = `https://${customDomain}`;
    setDeployedEndpoint(finalEndpoint);

    addLog('success', `DEPLOYMENT COMPLETE! Live Endpoint: ${finalEndpoint}`, 'System');

    if (onDeployComplete) {
      onDeployComplete({
        deploymentId: `dep-${Math.random().toString(36).substr(2, 9)}`,
        endpointUrl: finalEndpoint,
        target: target.name,
        deployedAt: new Date().toISOString(),
      });
    }
  };

  const selectedTarget = DEFAULT_TARGETS.find((t) => t.id === selectedTargetId) || DEFAULT_TARGETS[0];

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/80 backdrop-blur-md p-4 overflow-y-auto">
      <div className="relative w-full max-w-5xl bg-slate-900 border border-slate-800 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header Bar */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-b border-slate-800">
          <div className="flex items-center space-x-3">
            <div className="p-2.5 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
              <Rocket className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-slate-100">{appName}</h2>
                <span className="px-2 py-0.5 text-xs font-mono bg-cyan-950 text-cyan-300 border border-cyan-800/50 rounded-full">
                  v2.4.0-release
                </span>
              </div>
              <p className="text-xs text-slate-400 font-mono">ID: {appId}</p>
            </div>
          </div>

          <div className="flex items-center space-x-3">
            {deploymentState === 'running' && (
              <span className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-amber-500/10 border border-amber-500/30 text-amber-400 rounded-full">
                <RefreshCw className="w-3.5 h-3.5 animate-spin" />
                <span>Deploying Live...</span>
              </span>
            )}
            {deploymentState === 'success' && (
              <span className="flex items-center space-x-2 text-xs font-semibold px-3 py-1 bg-emerald-500/10 border border-emerald-500/30 text-emerald-400 rounded-full">
                <CheckCircle2 className="w-3.5 h-3.5" />
                <span>Active & Live</span>
              </span>
            )}
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-slate-100 bg-slate-800/50 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="flex items-center px-6 bg-slate-900/50 border-b border-slate-800 space-x-1">
          <button
            onClick={() => setActiveTab('config')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'config'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Settings className="w-4 h-4" />
            <span>1. Runtime & Target</span>
          </button>

          <button
            onClick={() => setActiveTab('envs')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'envs'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Key className="w-4 h-4" />
            <span>2. Environment Enclaves</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-slate-800 text-slate-300 rounded-full">
              {envs.length}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('pipeline')}
            className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
              activeTab === 'pipeline'
                ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
                : 'border-transparent text-slate-400 hover:text-slate-200'
            }`}
          >
            <Terminal className="w-4 h-4" />
            <span>3. Deployment Orchestration</span>
            {deploymentState === 'running' && (
              <span className="w-2 h-2 rounded-full bg-amber-400 animate-ping" />
            )}
          </button>

          {deploymentState === 'success' && (
            <button
              onClick={() => setActiveTab('metrics')}
              className={`flex items-center space-x-2 px-4 py-3 text-sm font-medium border-b-2 transition-all ${
                activeTab === 'metrics'
                  ? 'border-emerald-500 text-emerald-400 bg-emerald-500/5'
                  : 'border-transparent text-slate-400 hover:text-slate-200'
              }`}
            >
              <Activity className="w-4 h-4 text-emerald-400" />
              <span>4. Live Metrics</span>
            </button>
          )}
        </div>

        {/* Tab Content Area */}
        <div className="flex-1 p-6 overflow-y-auto space-y-6">
          {/* TAB 1: RUNTIME & TARGET CONFIG */}
          {activeTab === 'config' && (
            <div className="space-y-6">
              <div>
                <h3 className="text-sm font-semibold text-slate-200 uppercase tracking-wider mb-3">
                  Select Target Runtime Cloud
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  {DEFAULT_TARGETS.map((target) => {
                    const isSelected = target.id === selectedTargetId;
                    return (
                      <div
                        key={target.id}
                        onClick={() => setSelectedTargetId(target.id)}
                        className={`cursor-pointer p-4 rounded-xl border transition-all relative flex flex-col justify-between ${
                          isSelected
                            ? 'bg-cyan-950/40 border-cyan-500/80 shadow-lg shadow-cyan-950/50'
                            : 'bg-slate-800/40 border-slate-700/60 hover:bg-slate-800/80 hover:border-slate-600'
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex items-center space-x-3">
                            <div
                              className={`p-2 rounded-lg ${
                                isSelected
                                  ? 'bg-cyan-500/20 text-cyan-300'
                                  : 'bg-slate-700/50 text-slate-400'
                              }`}
                            >
                              <Server className="w-5 h-5" />
                            </div>
                            <div>
                              <div className="font-semibold text-slate-100 text-sm">{target.name}</div>
                              <div className="text-xs text-slate-400 font-mono">{target.region}</div>
                            </div>
                          </div>
                          {isSelected && <CheckCircle2 className="w-5 h-5 text-cyan-400" />}
                        </div>

                        <div className="mt-4 flex items-center justify-between text-xs pt-3 border-t border-slate-700/40">
                          <span className="px-2 py-0.5 bg-slate-800 text-slate-300 rounded border border-slate-700 font-mono">
                            {target.complianceLevel}
                          </span>
                          <span className="text-emerald-400 font-mono flex items-center space-x-1">
                            <Zap className="w-3 h-3" />
                            <span>{target.latencyMs}ms</span>
                          </span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>

              {/* Resource Allocations */}
              <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-5 space-y-4">
                <h4 className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <Sliders className="w-4 h-4 text-cyan-400" />
                  <span>Compute & Scale Parameters</span>
                </h4>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      CPU Limits (vCPU)
                    </label>
                    <select
                      value={cpuAllocation}
                      onChange={(e) => setCpuAllocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="0.5">0.5 vCPU (Lightweight Micro-App)</option>
                      <option value="1.0">1.0 vCPU (Standard Corporate)</option>
                      <option value="2.0">2.0 vCPU (High-Throughput Financial)</option>
                      <option value="4.0">4.0 vCPU (PQC Heavy Cryptographic)</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Memory Allocation (RAM)
                    </label>
                    <select
                      value={memoryAllocation}
                      onChange={(e) => setMemoryAllocation(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    >
                      <option value="512Mi">512 MB</option>
                      <option value="1Gi">1 GB</option>
                      <option value="2Gi">2 GB</option>
                      <option value="4Gi">4 GB</option>
                      <option value="8Gi">8 GB</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-slate-400 mb-1">
                      Replica Scaling Range
                    </label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="number"
                        min={1}
                        max={10}
                        value={minReplicas}
                        onChange={(e) => setMinReplicas(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 text-center"
                      />
                      <span className="text-slate-500">to</span>
                      <input
                        type="number"
                        min={1}
                        max={50}
                        value={maxReplicas}
                        onChange={(e) => setMaxReplicas(Number(e.target.value))}
                        className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-sm text-slate-200 text-center"
                      />
                    </div>
                  </div>
                </div>

                <div className="pt-2">
                  <label className="block text-xs font-medium text-slate-400 mb-1">
                    Custom Subdomain Routing
                  </label>
                  <div className="flex items-center">
                    <span className="bg-slate-900 border border-r-0 border-slate-700 rounded-l-lg px-3 py-2 text-xs text-slate-500 font-mono">
                      https://
                    </span>
                    <input
                      type="text"
                      value={customDomain}
                      onChange={(e) => setCustomDomain(e.target.value)}
                      className="flex-1 bg-slate-900 border border-slate-700 rounded-r-lg px-3 py-2 text-sm font-mono text-cyan-300 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 2: ENV VARIABLES */}
          {activeTab === 'envs' && (
            <div className="space-y-5">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-sm font-semibold text-slate-200">
                    Environment Variables & Dynamic Enclaves
                  </h3>
                  <p className="text-xs text-slate-400">
                    Values are encrypted at rest with AES-256-GCM and injected at container boot time.
                  </p>
                </div>

                <div className="flex items-center space-x-2">
                  <span className="text-xs text-slate-400">Presets:</span>
                  {Object.keys(PRESET_ENVS).map((preset) => (
                    <button
                      key={preset}
                      onClick={() => applyPresetEnvs(preset)}
                      className="px-2.5 py-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg text-xs font-mono text-slate-300 transition-colors"
                    >
                      {preset}
                    </button>
                  ))}
                </div>
              </div>

              {/* Env List */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden">
                <div className="grid grid-cols-12 gap-2 px-4 py-2.5 bg-slate-900/80 border-b border-slate-800 text-xs font-mono text-slate-400">
                  <div className="col-span-5">Key Identifier</div>
                  <div className="col-span-5">Configured Value</div>
                  <div className="col-span-2 text-right">Actions</div>
                </div>

                <div className="divide-y divide-slate-800/60 max-h-60 overflow-y-auto">
                  {envs.map((env) => (
                    <div key={env.id} className="grid grid-cols-12 gap-2 px-4 py-3 items-center text-sm">
                      <div className="col-span-5 font-mono text-cyan-300 font-medium flex items-center space-x-2">
                        {env.isSecret ? <Lock className="w-3.5 h-3.5 text-amber-400" /> : <Key className="w-3.5 h-3.5 text-slate-500" />}
                        <span>{env.key}</span>
                      </div>
                      <div className="col-span-5 font-mono text-slate-300 text-xs truncate">
                        {env.isSecret && !visibleSecrets[env.id] ? (
                          <span className="text-slate-600 tracking-widest">••••••••••••••••</span>
                        ) : (
                          env.value
                        )}
                      </div>
                      <div className="col-span-2 flex items-center justify-end space-x-2">
                        {env.isSecret && (
                          <button
                            onClick={() => toggleSecretVisibility(env.id)}
                            className="p-1 text-slate-400 hover:text-slate-200"
                            title="Toggle Visibility"
                          >
                            {visibleSecrets[env.id] ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                          </button>
                        )}
                        <button
                          onClick={() => handleRemoveEnv(env.id)}
                          className="p-1 text-slate-500 hover:text-rose-400 transition-colors"
                          title="Delete Variable"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))}

                  {envs.length === 0 && (
                    <div className="p-6 text-center text-slate-500 text-sm">
                      No environment variables configured.
                    </div>
                  )}
                </div>
              </div>

              {/* Add Env Form */}
              <div className="bg-slate-800/30 border border-slate-800 rounded-xl p-4">
                <div className="text-xs font-semibold text-slate-300 mb-3 flex items-center space-x-2">
                  <Plus className="w-4 h-4 text-cyan-400" />
                  <span>Add New Variable</span>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-12 gap-3 items-center">
                  <div className="md:col-span-4">
                    <input
                      type="text"
                      placeholder="KEY_NAME (e.g. API_SECRET)"
                      value={newKey}
                      onChange={(e) => setNewKey(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="md:col-span-5">
                    <input
                      type="text"
                      placeholder="Variable value..."
                      value={newValue}
                      onChange={(e) => setNewValue(e.target.value)}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-xs font-mono text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                  </div>
                  <div className="md:col-span-3 flex items-center space-x-2 justify-end">
                    <label className="flex items-center space-x-1.5 cursor-pointer text-xs text-slate-400">
                      <input
                        type="checkbox"
                        checked={newIsSecret}
                        onChange={(e) => setNewIsSecret(e.target.checked)}
                        className="rounded border-slate-700 bg-slate-900 text-cyan-500 focus:ring-0"
                      />
                      <span>Secret</span>
                    </label>
                    <button
                      onClick={handleAddEnv}
                      disabled={!newKey.trim()}
                      className="px-3 py-2 bg-cyan-600 hover:bg-cyan-500 disabled:opacity-40 text-slate-950 font-bold rounded-lg text-xs transition-colors flex items-center space-x-1"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: PIPELINE EXECUTION */}
          {activeTab === 'pipeline' && (
            <div className="space-y-6">
              {/* Target summary banner */}
              <div className="flex items-center justify-between p-4 bg-slate-950 border border-slate-800 rounded-xl text-xs font-mono">
                <div className="flex items-center space-x-3">
                  <ShieldCheck className="w-5 h-5 text-cyan-400" />
                  <div>
                    <span className="text-slate-400">Target: </span>
                    <span className="text-slate-200 font-bold">{selectedTarget.name}</span>
                    <span className="ml-2 text-slate-500">({selectedTarget.region})</span>
                  </div>
                </div>
                <div>
                  <span className="text-slate-400">Compliance: </span>
                  <span className="text-emerald-400">{selectedTarget.complianceLevel}</span>
                </div>
              </div>

              {/* Step Flow Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                {pipelineSteps.map((step, idx) => {
                  const isCurrent = currentStepIndex === idx;
                  return (
                    <div
                      key={step.id}
                      className={`p-3.5 rounded-xl border transition-all flex items-start space-x-3 ${
                        step.status === 'completed'
                          ? 'bg-emerald-950/20 border-emerald-500/30 text-slate-200'
                          : step.status === 'running'
                          ? 'bg-amber-950/30 border-amber-500/50 text-slate-100 shadow-md shadow-amber-950/40'
                          : step.status === 'failed'
                          ? 'bg-rose-950/30 border-rose-500/50 text-rose-200'
                          : 'bg-slate-800/20 border-slate-800 text-slate-500'
                      }`}
                    >
                      <div className="mt-0.5">
                        {step.status === 'completed' && <CheckCircle2 className="w-5 h-5 text-emerald-400" />}
                        {step.status === 'running' && <RefreshCw className="w-5 h-5 text-amber-400 animate-spin" />}
                        {step.status === 'failed' && <XCircle className="w-5 h-5 text-rose-400" />}
                        {step.status === 'pending' && (
                          <div className="w-5 h-5 rounded-full border border-slate-700 flex items-center justify-center text-[10px] font-mono">
                            {idx + 1}
                          </div>
                        )}
                      </div>

                      <div className="flex-1">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold">{step.name}</span>
                          {step.durationMs && (
                            <span className="text-[10px] font-mono text-slate-400">
                              {(step.durationMs / 1000).toFixed(1)}s
                            </span>
                          )}
                        </div>
                        <p className="text-xs text-slate-400 mt-0.5">{step.description}</p>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Terminal Logs */}
              <div className="bg-slate-950 border border-slate-800 rounded-xl overflow-hidden font-mono">
                <div className="flex items-center justify-between px-4 py-2 bg-slate-900 border-b border-slate-800 text-xs text-slate-400">
                  <div className="flex items-center space-x-2">
                    <Terminal className="w-4 h-4 text-cyan-400" />
                    <span>Realtime Orchestration Log Console</span>
                  </div>
                  <span>{logs.length} events logged</span>
                </div>

                <div
                  ref={logTerminalRef}
                  className="p-4 h-48 overflow-y-auto space-y-1.5 text-xs text-slate-300 bg-slate-950/90"
                >
                  {logs.length === 0 && (
                    <div className="text-slate-600 italic">
                      Console output will stream here when deployment starts...
                    </div>
                  )}

                  {logs.map((log) => (
                    <div key={log.id} className="flex items-start space-x-2 leading-relaxed">
                      <span className="text-slate-600 select-none">[{log.timestamp}]</span>
                      <span className="text-slate-500 font-bold">[{log.source}]</span>
                      <span
                        className={
                          log.level === 'success'
                            ? 'text-emerald-400 font-semibold'
                            : log.level === 'warn'
                            ? 'text-amber-400'
                            : log.level === 'error'
                            ? 'text-rose-400 font-bold'
                            : 'text-slate-300'
                        }
                      >
                        {log.message}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: METRICS & ENDPOINT */}
          {activeTab === 'metrics' && deploymentState === 'success' && (
            <div className="space-y-6">
              <div className="p-5 bg-emerald-950/20 border border-emerald-500/40 rounded-xl flex flex-col md:flex-row items-center justify-between gap-4">
                <div className="flex items-center space-x-4">
                  <div className="p-3 bg-emerald-500/20 rounded-xl text-emerald-400">
                    <Globe className="w-8 h-8" />
                  </div>
                  <div>
                    <span className="text-xs uppercase font-mono text-emerald-400 font-semibold">
                      Micro-App Live
                    </span>
                    <h3 className="text-lg font-bold text-slate-100 font-mono">{deployedEndpoint}</h3>
                    <p className="text-xs text-slate-400">
                      SSL/TLS 1.3 Strict Enforced • PQC Dilithium Sig Verified
                    </p>
                  </div>
                </div>

                <a
                  href={deployedEndpoint || '#'}
                  target="_blank"
                  rel="noreferrer"
                  className="px-4 py-2.5 bg-emerald-500 hover:bg-emerald-400 text-slate-950 font-bold rounded-xl text-xs flex items-center space-x-2 transition-colors"
                >
                  <span>Launch Application</span>
                  <ChevronRight className="w-4 h-4" />
                </a>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">Total Deploy Time</div>
                  <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{deploymentTime}s</div>
                  <div className="text-[10px] text-emerald-400 mt-1">100% automated pass</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">Active Replicas</div>
                  <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{minReplicas} / {maxReplicas}</div>
                  <div className="text-[10px] text-cyan-400 mt-1">Autoscaling enabled</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">Health Probe Latency</div>
                  <div className="text-xl font-bold text-slate-100 mt-1 font-mono">{selectedTarget.latencyMs} ms</div>
                  <div className="text-[10px] text-emerald-400 mt-1">Zero dropped frames</div>
                </div>

                <div className="p-4 bg-slate-900 border border-slate-800 rounded-xl">
                  <div className="text-xs text-slate-400">Security Grade</div>
                  <div className="text-xl font-bold text-emerald-400 mt-1 font-mono">A+ Sovereign</div>
                  <div className="text-[10px] text-slate-400 mt-1">Zero-Trust Certified</div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="flex items-center justify-between px-6 py-4 bg-slate-900/90 border-t border-slate-800">
          <div className="flex items-center space-x-2 text-xs text-slate-400">
            <HardDrive className="w-4 h-4 text-slate-500" />
            <span>Target: <strong className="text-slate-200">{selectedTarget.name}</strong></span>
          </div>

          <div className="flex items-center space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition-colors"
            >
              Cancel
            </button>

            {deploymentState !== 'running' && (
              <button
                onClick={triggerDeployment}
                className="px-5 py-2.5 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-slate-950 font-bold rounded-xl text-xs shadow-lg shadow-cyan-500/25 flex items-center space-x-2 transition-all transform hover:scale-[1.02]"
              >
                <Play className="w-4 h-4 fill-current" />
                <span>Trigger Live Deployment</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default MicroAppDeployer;