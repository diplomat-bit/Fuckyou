import React, { useState, useMemo, useCallback } from 'react';
import {
  Server,
  Cpu,
  Globe,
  Activity,
  ShieldAlert,
  Zap,
  BarChart2,
  Save,
  RefreshCw,
  Sliders,
  Check,
  Cloud,
  Database,
  Copy,
  Download,
  Play,
  Sparkles,
  CheckCircle2,
  AlertTriangle,
  Gauge,
  Code,
  HardDrive,
  Lock,
  Layers,
  ArrowRightLeft,
  DollarSign
} from 'lucide-react';

export interface CloudDistribution {
  gcpGov: number;
  azureGov: number;
  awsGovCloud: number;
  sovereignOnPrem: number;
}

export interface ResourceLimits {
  cpuCoresPerReplica: number;
  memoryGbPerReplica: number;
  gpuUnitsPerReplica: number;
  pqcAcceleratorUnits: number;
}

export interface TriggerMetrics {
  targetCpuUtilization: number;
  targetMemoryUtilization: number;
  targetLatencyMs: number;
  queueDepthThreshold: number;
  scaleUpCooldownSec: number;
  scaleDownCooldownSec: number;
}

export interface AutoScalingPolicy {
  id: string;
  microAppName: string;
  description: string;
  minReplicas: number;
  maxReplicas: number;
  currentReplicas: number;
  strategy: 'weighted-mesh' | 'primary-failover' | 'latency-optimized' | 'cost-minimized';
  cloudDistribution: CloudDistribution;
  resourceLimits: ResourceLimits;
  triggers: TriggerMetrics;
  autoFailoverEnabled: boolean;
  quantumSecuredTunnel: boolean;
  status: 'active' | 'synced' | 'pending-deployment' | 'degraded';
  lastUpdated: string;
}

const DEFAULT_MICRO_APPS = [
  { id: 'app-001', name: 'citiconnect-integration-gateway', desc: 'Real-time SWIFT / ISO20022 message processor' },
  { id: 'app-002', name: 'pqc-crypto-bridge-simulator', desc: 'Post-Quantum cryptography key exchange & signing' },
  { id: 'app-003', name: 'b2b-routing-decryptor-validator', desc: 'Encrypted ABA routing & account hash validator' },
  { id: 'app-004', name: 'sovereign-identity-vault', desc: 'Zero-Knowledge voter & citizen identity verifier' },
  { id: 'app-005', name: 'modern-treasury-ledger-hub', desc: 'High-throughput double-entry balance syncer' },
  { id: 'app-006', name: 'military-fund-allocator', desc: 'EAC & Department of War emergency fund ledger' }
];

const PRESETS: Record<string, Partial<AutoScalingPolicy>> = {
  highAvailability: {
    minReplicas: 8,
    maxReplicas: 64,
    strategy: 'weighted-mesh',
    triggers: {
      targetCpuUtilization: 65,
      targetMemoryUtilization: 70,
      targetLatencyMs: 45,
      queueDepthThreshold: 120,
      scaleUpCooldownSec: 15,
      scaleDownCooldownSec: 300
    },
    cloudDistribution: { gcpGov: 30, azureGov: 30, awsGovCloud: 20, sovereignOnPrem: 20 },
    autoFailoverEnabled: true,
    quantumSecuredTunnel: true
  },
  costOptimized: {
    minReplicas: 2,
    maxReplicas: 16,
    strategy: 'cost-minimized',
    triggers: {
      targetCpuUtilization: 85,
      targetMemoryUtilization: 85,
      targetLatencyMs: 150,
      queueDepthThreshold: 500,
      scaleUpCooldownSec: 60,
      scaleDownCooldownSec: 600
    },
    cloudDistribution: { gcpGov: 50, azureGov: 30, awsGovCloud: 20, sovereignOnPrem: 0 },
    autoFailoverEnabled: false,
    quantumSecuredTunnel: false
  },
  militaryUltraLowLatency: {
    minReplicas: 12,
    maxReplicas: 128,
    strategy: 'latency-optimized',
    triggers: {
      targetCpuUtilization: 50,
      targetMemoryUtilization: 60,
      targetLatencyMs: 15,
      queueDepthThreshold: 50,
      scaleUpCooldownSec: 5,
      scaleDownCooldownSec: 180
    },
    cloudDistribution: { gcpGov: 25, azureGov: 25, awsGovCloud: 25, sovereignOnPrem: 25 },
    autoFailoverEnabled: true,
    quantumSecuredTunnel: true
  }
};

export const AutoScalingPolicyEditor: React.FC = () => {
  const [selectedAppId, setSelectedAppId] = useState<string>(DEFAULT_MICRO_APPS[0].id);
  const [activeTab, setActiveTab] = useState<'policy' | 'cloud-mesh' | 'resources' | 'simulation' | 'yaml'>('policy');
  const [isSaving, setIsSaving] = useState<boolean>(false);
  const [showToast, setShowToast] = useState<string | null>(null);

  // Simulation input state
  const [simulatedRps, setSimulatedRps] = useState<number>(4500);

  // Policy configuration state
  const [policy, setPolicy] = useState<AutoScalingPolicy>({
    id: 'asp-citiconnect-001',
    microAppName: DEFAULT_MICRO_APPS[0].name,
    description: DEFAULT_MICRO_APPS[0].desc,
    minReplicas: 4,
    maxReplicas: 32,
    currentReplicas: 6,
    strategy: 'weighted-mesh',
    cloudDistribution: {
      gcpGov: 35,
      azureGov: 35,
      awsGovCloud: 15,
      sovereignOnPrem: 15
    },
    resourceLimits: {
      cpuCoresPerReplica: 2.0,
      memoryGbPerReplica: 8.0,
      gpuUnitsPerReplica: 0,
      pqcAcceleratorUnits: 2
    },
    triggers: {
      targetCpuUtilization: 70,
      targetMemoryUtilization: 75,
      targetLatencyMs: 35,
      queueDepthThreshold: 200,
      scaleUpCooldownSec: 30,
      scaleDownCooldownSec: 300
    },
    autoFailoverEnabled: true,
    quantumSecuredTunnel: true,
    status: 'synced',
    lastUpdated: '2025-02-23T14:32:00Z'
  });

  // Handle micro-app switch
  const handleAppChange = (appId: string) => {
    setSelectedAppId(appId);
    const targetApp = DEFAULT_MICRO_APPS.find((a) => a.id === appId);
    if (targetApp) {
      setPolicy((prev) => ({
        ...prev,
        microAppName: targetApp.name,
        description: targetApp.desc
      }));
    }
  };

  // Apply quick preset
  const applyPreset = (presetKey: keyof typeof PRESETS) => {
    const presetData = PRESETS[presetKey];
    if (!presetData) return;
    setPolicy((prev) => ({
      ...prev,
      ...presetData,
      triggers: {
        ...prev.triggers,
        ...presetData.triggers
      },
      cloudDistribution: {
        ...prev.cloudDistribution,
        ...presetData.cloudDistribution
      },
      status: 'pending-deployment'
    }));
    triggerToast(`Applied '${presetKey}' preset policy specs.`);
  };

  // Toast Notification helper
  const triggerToast = (msg: string) => {
    setShowToast(msg);
    setTimeout(() => setShowToast(null), 3500);
  };

  // Cloud distribution slider adjuster to keep total equal to 100%
  const handleCloudDistributionChange = (key: keyof CloudDistribution, value: number) => {
    const clampedVal = Math.max(0, Math.min(100, value));
    const currentDist = { ...policy.cloudDistribution, [key]: clampedVal };
    const otherKeys = (Object.keys(currentDist) as (keyof CloudDistribution)[]).filter((k) => k !== key);
    const currentOthersSum = otherKeys.reduce((acc, k) => acc + currentDist[k], 0);

    const remainingToDistribute = 100 - clampedVal;

    if (currentOthersSum === 0) {
      const equalShare = remainingToDistribute / otherKeys.length;
      otherKeys.forEach((k) => {
        currentDist[k] = Math.round(equalShare);
      });
    } else {
      otherKeys.forEach((k) => {
        const ratio = currentDist[k] / currentOthersSum;
        currentDist[k] = Math.round(ratio * remainingToDistribute);
      });
    }

    // Fix rounding discrepancies
    const totalSum = Object.values(currentDist).reduce((a, b) => a + b, 0);
    if (totalSum !== 100 && otherKeys.length > 0) {
      currentDist[otherKeys[0]] += 100 - totalSum;
    }

    setPolicy((prev) => ({
      ...prev,
      cloudDistribution: currentDist,
      status: 'pending-deployment'
    }));
  };

  // Compute calculated metrics based on simulation RPS
  const simulationResults = useMemo(() => {
    const capacityPerReplicaRps = (policy.resourceLimits.cpuCoresPerReplica * 400) + (policy.resourceLimits.memoryGbPerReplica * 50);
    const neededReplicasRaw = Math.ceil(simulatedRps / Math.max(capacityPerReplicaRps, 100));
    const calculatedReplicas = Math.min(
      Math.max(neededReplicasRaw, policy.minReplicas),
      policy.maxReplicas
    );

    const estCpuUsage = Math.min(
      99,
      Math.round((simulatedRps / (calculatedReplicas * capacityPerReplicaRps)) * 100)
    );

    const hourlyCostPerReplica =
      policy.resourceLimits.cpuCoresPerReplica * 0.048 +
      policy.resourceLimits.memoryGbPerReplica * 0.007 +
      policy.resourceLimits.gpuUnitsPerReplica * 0.85 +
      policy.resourceLimits.pqcAcceleratorUnits * 0.15;

    const totalHourlyCost = calculatedReplicas * hourlyCostPerReplica;
    const monthlyCost = totalHourlyCost * 24 * 30.5;

    const latencyPenalty = estCpuUsage > 80 ? (estCpuUsage - 80) * 1.5 : 0;
    const estimatedLatencyMs = Math.round(policy.triggers.targetLatencyMs * 0.6 + latencyPenalty);

    const hitMaxCap = calculatedReplicas >= policy.maxReplicas && simulatedRps > calculatedReplicas * capacityPerReplicaRps;

    return {
      capacityPerReplicaRps,
      calculatedReplicas,
      estCpuUsage,
      totalHourlyCost,
      monthlyCost,
      estimatedLatencyMs,
      hitMaxCap
    };
  }, [simulatedRps, policy]);

  // Deployment simulator action
  const handleSaveAndDeploy = () => {
    setIsSaving(true);
    setTimeout(() => {
      setIsSaving(false);
      setPolicy((prev) => ({
        ...prev,
        status: 'synced',
        lastUpdated: new Date().toISOString()
      }));
      triggerToast(`Auto-scaling policy synced to Swarm Orchestrator & Multi-Cloud Mesh.`);
    }, 1200);
  };

  // Format policy to YAML-style string for code view
  const yamlOutput = useMemo(() => {
    return `apiVersion: autoscaling.federated.gov/v2
kind: MultiCloudScalingPolicy
metadata:
  name: ${policy.microAppName}-scaling-spec
  namespace: gov-financial-core
  labels:
    security.class: "top-secret-pqc"
    app.target: "${policy.microAppName}"
spec:
  replicas:
    min: ${policy.minReplicas}
    max: ${policy.maxReplicas}
  strategy: ${policy.strategy}
  quantumSecuredTunnel: ${policy.quantumSecuredTunnel}
  autoFailover: ${policy.autoFailoverEnabled}
  metrics:
    targetCPUUtilizationPercentage: ${policy.triggers.targetCpuUtilization}
    targetMemoryUtilizationPercentage: ${policy.triggers.targetMemoryUtilization}
    targetLatencySLA: ${policy.triggers.targetLatencyMs}ms
    queueDepthThreshold: ${policy.triggers.queueDepthThreshold}
  behavior:
    scaleUp:
      stabilizationWindowSeconds: ${policy.triggers.scaleUpCooldownSec}
    scaleDown:
      stabilizationWindowSeconds: ${policy.triggers.scaleDownCooldownSec}
  resourcesPerReplica:
    limits:
      cpu: "${policy.resourceLimits.cpuCoresPerReplica} Cores"
      memory: "${policy.resourceLimits.memoryGbPerReplica} GiB"
      gpu: ${policy.resourceLimits.gpuUnitsPerReplica}
      pqcAccelerators: ${policy.resourceLimits.pqcAcceleratorUnits}
  multiCloudMeshDistribution:
    gcpGovCloud: ${policy.cloudDistribution.gcpGov}%
    azureGovCloud: ${policy.cloudDistribution.azureGov}%
    awsGovCloud: ${policy.cloudDistribution.awsGovCloud}%
    sovereignOnPremNodes: ${policy.cloudDistribution.sovereignOnPrem}%`;
  }, [policy]);

  const copyYamlToClipboard = useCallback(() => {
    navigator.clipboard.writeText(yamlOutput);
    triggerToast('YAML deployment specification copied to clipboard.');
  }, [yamlOutput]);

  return (
    <div className="w-full bg-slate-950 text-slate-100 rounded-xl border border-slate-800 shadow-2xl overflow-hidden font-sans">
      {/* Toast Alert */}
      {showToast && (
        <div className="fixed bottom-6 right-6 z-50 bg-cyan-600 text-white px-5 py-3 rounded-lg shadow-2xl flex items-center space-x-3 border border-cyan-400 animate-bounce">
          <Sparkles className="w-5 h-5 text-yellow-300" />
          <span className="font-semibold text-sm">{showToast}</span>
        </div>
      )}

      {/* Header Banner */}
      <div className="bg-slate-900/90 border-b border-slate-800 p-5 md:p-6 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
        <div className="flex items-center space-x-4">
          <div className="p-3 bg-cyan-500/10 border border-cyan-500/30 rounded-xl text-cyan-400">
            <Sliders className="w-7 h-7" />
          </div>
          <div>
            <div className="flex items-center space-x-3">
              <h1 className="text-xl md:text-2xl font-bold tracking-tight text-white">
                Auto-Scaling Policy Editor
              </h1>
              <span
                className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                  policy.status === 'synced'
                    ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                    : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                }`}
              >
                <span
                  className={`w-2 h-2 rounded-full mr-1.5 ${
                    policy.status === 'synced' ? 'bg-emerald-400 animate-pulse' : 'bg-amber-400'
                  }`}
                />
                {policy.status.toUpperCase()}
              </span>
            </div>
            <p className="text-sm text-slate-400 mt-1">
              Configure replica bounds, multi-cloud mesh allocation, PQC acceleration, and SLA triggers.
            </p>
          </div>
        </div>

        {/* Micro-app Selector & Action Buttons */}
        <div className="flex flex-wrap items-center gap-3 w-full lg:w-auto justify-end">
          <div className="relative flex-1 sm:flex-none min-w-[240px]">
            <select
              value={selectedAppId}
              onChange={(e) => handleAppChange(e.target.value)}
              className="w-full bg-slate-800 border border-slate-700 text-slate-200 text-sm rounded-lg px-3 py-2 pr-8 focus:outline-none focus:border-cyan-500 appearance-none font-medium cursor-pointer"
            >
              {DEFAULT_MICRO_APPS.map((app) => (
                <option key={app.id} value={app.id}>
                  {app.name}
                </option>
              ))}
            </select>
            <div className="absolute right-3 top-2.5 text-slate-400 pointer-events-none text-xs">
              ▼
            </div>
          </div>

          <button
            onClick={handleSaveAndDeploy}
            disabled={isSaving}
            className="flex items-center space-x-2 bg-gradient-to-r from-cyan-500 to-blue-600 hover:from-cyan-400 hover:to-blue-500 text-white font-medium px-4 py-2 rounded-lg text-sm transition-all shadow-lg shadow-cyan-500/20 disabled:opacity-50"
          >
            {isSaving ? (
              <RefreshCw className="w-4 h-4 animate-spin" />
            ) : (
              <Save className="w-4 h-4" />
            )}
            <span>{isSaving ? 'Deploying...' : 'Save & Deploy Policy'}</span>
          </button>
        </div>
      </div>

      {/* Quick Presets Bar */}
      <div className="bg-slate-900/50 border-b border-slate-800/80 px-6 py-3 flex flex-wrap items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-2">
          <Zap className="w-4 h-4 text-amber-400" />
          <span className="font-semibold text-slate-300">Quick Policy Presets:</span>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <button
            onClick={() => applyPreset('highAvailability')}
            className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 hover:border-cyan-500/50 hover:bg-slate-700 text-slate-200 transition"
          >
            🛡️ High Availability (100% SLA)
          </button>
          <button
            onClick={() => applyPreset('militaryUltraLowLatency')}
            className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 hover:border-blue-500/50 hover:bg-slate-700 text-slate-200 transition"
          >
            ⚡ Military Low-Latency (&lt;15ms)
          </button>
          <button
            onClick={() => applyPreset('costOptimized')}
            className="px-3 py-1 rounded-md bg-slate-800 border border-slate-700 hover:border-emerald-500/50 hover:bg-slate-700 text-slate-200 transition"
          >
            💵 Cost Optimized Batch
          </button>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-slate-800 bg-slate-900/30 px-6 overflow-x-auto">
        <button
          onClick={() => setActiveTab('policy')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'policy'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Gauge className="w-4 h-4" />
          <span>Replica & SLA Triggers</span>
        </button>

        <button
          onClick={() => setActiveTab('cloud-mesh')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'cloud-mesh'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Globe className="w-4 h-4" />
          <span>Multi-Cloud Mesh Split</span>
        </button>

        <button
          onClick={() => setActiveTab('resources')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'resources'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Cpu className="w-4 h-4" />
          <span>Hardware & PQC Hardware Specs</span>
        </button>

        <button
          onClick={() => setActiveTab('simulation')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'simulation'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <BarChart2 className="w-4 h-4" />
          <span>Traffic & Cost Simulator</span>
        </button>

        <button
          onClick={() => setActiveTab('yaml')}
          className={`flex items-center space-x-2 py-3 px-4 text-sm font-medium border-b-2 transition whitespace-nowrap ${
            activeTab === 'yaml'
              ? 'border-cyan-500 text-cyan-400 bg-cyan-500/5'
              : 'border-transparent text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-4 h-4" />
          <span>Generated Spec (YAML)</span>
        </button>
      </div>

      {/* Main Content Area */}
      <div className="p-6">
        {/* TAB 1: Replica & SLA Triggers */}
        {activeTab === 'policy' && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Card: Pod Count & Scaling Strategy */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <Server className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-slate-200 text-base">Replica Bounds & Strategy</h3>
              </div>

              {/* Min Replicas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Minimum Replicas (Baseline)</span>
                  <span className="text-cyan-400 font-bold bg-slate-800 px-2.5 py-1 rounded text-xs">
                    {policy.minReplicas} Pods
                  </span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="32"
                  value={policy.minReplicas}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      minReplicas: val,
                      maxReplicas: Math.max(val + 1, prev.maxReplicas),
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-xs text-slate-500">
                  Guaranteed active pods distributed across connected government cloud regions.
                </p>
              </div>

              {/* Max Replicas */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Maximum Replicas (Burst Ceiling)</span>
                  <span className="text-cyan-400 font-bold bg-slate-800 px-2.5 py-1 rounded text-xs">
                    {policy.maxReplicas} Pods
                  </span>
                </div>
                <input
                  type="range"
                  min={policy.minReplicas + 1}
                  max="256"
                  value={policy.maxReplicas}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      maxReplicas: val,
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-xs text-slate-500">
                  Upper scaling ceiling to prevent runaway multi-cloud compute billing.
                </p>
              </div>

              {/* Scaling Strategy Selector */}
              <div className="space-y-2 pt-2">
                <label className="text-sm font-medium text-slate-300 block">
                  Mesh Load Distribution Strategy
                </label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { id: 'weighted-mesh', label: 'Weighted Mesh', desc: 'Active-Active proportional split' },
                    { id: 'primary-failover', label: 'Primary Failover', desc: 'Single cloud primary with spillover' },
                    { id: 'latency-optimized', label: 'Latency First', desc: 'Route requests to nearest low-ping node' },
                    { id: 'cost-minimized', label: 'Cost Minimized', desc: 'Prioritize lowest $/compute regions' }
                  ].map((strat) => (
                    <button
                      key={strat.id}
                      onClick={() =>
                        setPolicy((prev) => ({
                          ...prev,
                          strategy: strat.id as any,
                          status: 'pending-deployment'
                        }))
                      }
                      className={`p-3 rounded-lg text-left border transition text-xs ${
                        policy.strategy === strat.id
                          ? 'border-cyan-500 bg-cyan-500/10 text-cyan-300'
                          : 'border-slate-800 bg-slate-900/40 text-slate-400 hover:bg-slate-800/60'
                      }`}
                    >
                      <div className="font-semibold text-slate-200 mb-0.5">{strat.label}</div>
                      <div>{strat.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Security Toggles */}
              <div className="pt-2 border-t border-slate-800/80 space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Quantum-Secured Cross-Mesh Tunnel</div>
                    <div className="text-xs text-slate-500">Enforce Dilithium & Kyber-1024 encryption between pods</div>
                  </div>
                  <button
                    onClick={() =>
                      setPolicy((prev) => ({
                        ...prev,
                        quantumSecuredTunnel: !prev.quantumSecuredTunnel,
                        status: 'pending-deployment'
                      }))
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      policy.quantumSecuredTunnel ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>

                <div className="flex items-center justify-between">
                  <div>
                    <div className="text-sm font-medium text-slate-200">Automatic Failover Evacuation</div>
                    <div className="text-xs text-slate-500">Migrate pods if provider SLA drops below 99.9%</div>
                  </div>
                  <button
                    onClick={() =>
                      setPolicy((prev) => ({
                        ...prev,
                        autoFailoverEnabled: !prev.autoFailoverEnabled,
                        status: 'pending-deployment'
                      }))
                    }
                    className={`w-12 h-6 flex items-center rounded-full p-1 transition-colors ${
                      policy.autoFailoverEnabled ? 'bg-cyan-500 justify-end' : 'bg-slate-800 justify-start'
                    }`}
                  >
                    <div className="w-4 h-4 rounded-full bg-white shadow-md" />
                  </button>
                </div>
              </div>
            </div>

            {/* Right Card: SLA Metric Triggers */}
            <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-5 space-y-5">
              <div className="flex items-center space-x-3 border-b border-slate-800 pb-3">
                <Activity className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-slate-200 text-base">Scale Trigger Thresholds</h3>
              </div>

              {/* Target CPU Utilization */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Target CPU Utilization</span>
                  <span className="text-cyan-400 font-bold bg-slate-800 px-2.5 py-1 rounded text-xs">
                    {policy.triggers.targetCpuUtilization}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={policy.triggers.targetCpuUtilization}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      triggers: { ...prev.triggers, targetCpuUtilization: val },
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Target Memory Utilization */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Target Memory Utilization</span>
                  <span className="text-cyan-400 font-bold bg-slate-800 px-2.5 py-1 rounded text-xs">
                    {policy.triggers.targetMemoryUtilization}%
                  </span>
                </div>
                <input
                  type="range"
                  min="30"
                  max="95"
                  value={policy.triggers.targetMemoryUtilization}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      triggers: { ...prev.triggers, targetMemoryUtilization: val },
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Latency Threshold */}
              <div className="space-y-2">
                <div className="flex justify-between items-center text-sm">
                  <span className="text-slate-300 font-medium">Latency SLA Threshold</span>
                  <span className="text-cyan-400 font-bold bg-slate-800 px-2.5 py-1 rounded text-xs">
                    {policy.triggers.targetLatencyMs} ms
                  </span>
                </div>
                <input
                  type="range"
                  min="10"
                  max="300"
                  value={policy.triggers.targetLatencyMs}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      triggers: { ...prev.triggers, targetLatencyMs: val },
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
                <p className="text-xs text-slate-500">
                  Triggers immediate replica scale-up if p95 response time breaches threshold.
                </p>
              </div>

              {/* Stabilization Windows */}
              <div className="grid grid-cols-2 gap-4 pt-2">
                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Scale Up Cooldown</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={policy.triggers.scaleUpCooldownSec}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setPolicy((prev) => ({
                          ...prev,
                          triggers: { ...prev.triggers, scaleUpCooldownSec: val },
                          status: 'pending-deployment'
                        }));
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-xs text-slate-500">sec</span>
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-slate-400 font-medium">Scale Down Cooldown</label>
                  <div className="flex items-center space-x-2">
                    <input
                      type="number"
                      value={policy.triggers.scaleDownCooldownSec}
                      onChange={(e) => {
                        const val = parseInt(e.target.value) || 0;
                        setPolicy((prev) => ({
                          ...prev,
                          triggers: { ...prev.triggers, scaleDownCooldownSec: val },
                          status: 'pending-deployment'
                        }));
                      }}
                      className="w-full bg-slate-800 border border-slate-700 rounded-md px-3 py-1.5 text-sm text-slate-200 focus:outline-none focus:border-cyan-500"
                    />
                    <span className="text-xs text-slate-500">sec</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: Multi-Cloud Mesh Split */}
        {activeTab === 'cloud-mesh' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <Globe className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-slate-200 text-lg">
                    Federated Multi-Cloud Allocation (% Target Split)
                  </h3>
                  <p className="text-xs text-slate-400">
                    Distribute micro-app replicas across isolated government cloud enclaves. Must sum to 100%.
                  </p>
                </div>
              </div>
              <div className="text-right">
                <span className="text-xs text-slate-400">Total Mesh Allocation</span>
                <div className="text-xl font-bold text-emerald-400">
                  {Object.values(policy.cloudDistribution).reduce((a, b) => a + b, 0)}%
                </div>
              </div>
            </div>

            {/* Provider Allocation Sliders */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* GCP GovCloud */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-blue-400" />
                    <span className="font-semibold text-sm text-slate-200">GCP GovCloud (us-east4)</span>
                  </div>
                  <span className="font-bold text-blue-400 bg-blue-500/10 px-2.5 py-1 rounded border border-blue-500/20 text-xs">
                    {policy.cloudDistribution.gcpGov}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={policy.cloudDistribution.gcpGov}
                  onChange={(e) => handleCloudDistributionChange('gcpGov', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
                <p className="text-xs text-slate-500">
                  Primary host for BigQuery emulator and Vertex AI Proxy workers.
                </p>
              </div>

              {/* Azure Gov Enclave */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-sky-400" />
                    <span className="font-semibold text-sm text-slate-200">Azure Gov Enclave (usgov-virginia)</span>
                  </div>
                  <span className="font-bold text-sky-400 bg-sky-500/10 px-2.5 py-1 rounded border border-sky-500/20 text-xs">
                    {policy.cloudDistribution.azureGov}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={policy.cloudDistribution.azureGov}
                  onChange={(e) => handleCloudDistributionChange('azureGov', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-sky-500"
                />
                <p className="text-xs text-slate-500">
                  Dedicated FedRAMP High container runtime with Entra ID Sync.
                </p>
              </div>

              {/* AWS GovCloud */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <Cloud className="w-5 h-5 text-amber-400" />
                    <span className="font-semibold text-sm text-slate-200">AWS GovCloud (us-gov-west-1)</span>
                  </div>
                  <span className="font-bold text-amber-400 bg-amber-500/10 px-2.5 py-1 rounded border border-amber-500/20 text-xs">
                    {policy.cloudDistribution.awsGovCloud}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={policy.cloudDistribution.awsGovCloud}
                  onChange={(e) => handleCloudDistributionChange('awsGovCloud', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
                <p className="text-xs text-slate-500">
                  High-resilience backup cluster for critical treasury transaction queues.
                </p>
              </div>

              {/* Sovereign On-Prem Air-Gapped */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <div className="flex items-center space-x-2">
                    <ShieldAlert className="w-5 h-5 text-emerald-400" />
                    <span className="font-semibold text-sm text-slate-200">Sovereign Vault Nodes (On-Prem)</span>
                  </div>
                  <span className="font-bold text-emerald-400 bg-emerald-500/10 px-2.5 py-1 rounded border border-emerald-500/20 text-xs">
                    {policy.cloudDistribution.sovereignOnPrem}%
                  </span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={policy.cloudDistribution.sovereignOnPrem}
                  onChange={(e) => handleCloudDistributionChange('sovereignOnPrem', parseInt(e.target.value))}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
                <p className="text-xs text-slate-500">
                  Air-gapped hardware HSM modules & zero-trust local cryptographic verification.
                </p>
              </div>
            </div>

            {/* Visual Bar Breakdown */}
            <div className="space-y-2 pt-2">
              <label className="text-xs font-semibold text-slate-400 uppercase tracking-wider">
                Multi-Cloud Pod Allocation Preview
              </label>
              <div className="h-4 bg-slate-800 rounded-full overflow-hidden flex shadow-inner">
                <div
                  style={{ width: `${policy.cloudDistribution.gcpGov}%` }}
                  className="bg-blue-500 h-full transition-all duration-300"
                  title={`GCP: ${policy.cloudDistribution.gcpGov}%`}
                />
                <div
                  style={{ width: `${policy.cloudDistribution.azureGov}%` }}
                  className="bg-sky-400 h-full transition-all duration-300"
                  title={`Azure: ${policy.cloudDistribution.azureGov}%`}
                />
                <div
                  style={{ width: `${policy.cloudDistribution.awsGovCloud}%` }}
                  className="bg-amber-400 h-full transition-all duration-300"
                  title={`AWS: ${policy.cloudDistribution.awsGovCloud}%`}
                />
                <div
                  style={{ width: `${policy.cloudDistribution.sovereignOnPrem}%` }}
                  className="bg-emerald-400 h-full transition-all duration-300"
                  title={`Sovereign: ${policy.cloudDistribution.sovereignOnPrem}%`}
                />
              </div>
            </div>
          </div>
        )}

        {/* TAB 3: Hardware & PQC Hardware Specs */}
        {activeTab === 'resources' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center space-x-3 border-b border-slate-800 pb-4">
              <Cpu className="w-6 h-6 text-cyan-400" />
              <div>
                <h3 className="font-semibold text-slate-200 text-lg">Per-Replica Hardware Limits</h3>
                <p className="text-xs text-slate-400">
                  Specify cgroup CPU, memory, GPU slice, and Post-Quantum Hardware Accelerator units.
                </p>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* CPU Cores */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">vCPU Allocation</span>
                  <Cpu className="w-4 h-4 text-cyan-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {policy.resourceLimits.cpuCoresPerReplica}{' '}
                  <span className="text-xs text-slate-400 font-normal">Cores</span>
                </div>
                <input
                  type="range"
                  min="0.5"
                  max="16"
                  step="0.5"
                  value={policy.resourceLimits.cpuCoresPerReplica}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      resourceLimits: { ...prev.resourceLimits, cpuCoresPerReplica: val },
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-500"
                />
              </div>

              {/* Memory RAM */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">Memory Limit</span>
                  <HardDrive className="w-4 h-4 text-blue-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {policy.resourceLimits.memoryGbPerReplica}{' '}
                  <span className="text-xs text-slate-400 font-normal">GiB RAM</span>
                </div>
                <input
                  type="range"
                  min="1"
                  max="64"
                  step="1"
                  value={policy.resourceLimits.memoryGbPerReplica}
                  onChange={(e) => {
                    const val = parseFloat(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      resourceLimits: { ...prev.resourceLimits, memoryGbPerReplica: val },
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-blue-500"
                />
              </div>

              {/* GPU Slices */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">GPU Acceleration</span>
                  <Zap className="w-4 h-4 text-amber-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {policy.resourceLimits.gpuUnitsPerReplica}{' '}
                  <span className="text-xs text-slate-400 font-normal">A100 Slices</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="4"
                  step="1"
                  value={policy.resourceLimits.gpuUnitsPerReplica}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      resourceLimits: { ...prev.resourceLimits, gpuUnitsPerReplica: val },
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-amber-500"
                />
              </div>

              {/* PQC Accelerator */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800 space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-semibold text-slate-400 uppercase">PQC Hardware Unit</span>
                  <Lock className="w-4 h-4 text-emerald-400" />
                </div>
                <div className="text-2xl font-bold text-white">
                  {policy.resourceLimits.pqcAcceleratorUnits}{' '}
                  <span className="text-xs text-slate-400 font-normal">HSM Cores</span>
                </div>
                <input
                  type="range"
                  min="0"
                  max="8"
                  step="1"
                  value={policy.resourceLimits.pqcAcceleratorUnits}
                  onChange={(e) => {
                    const val = parseInt(e.target.value);
                    setPolicy((prev) => ({
                      ...prev,
                      resourceLimits: { ...prev.resourceLimits, pqcAcceleratorUnits: val },
                      status: 'pending-deployment'
                    }));
                  }}
                  className="w-full h-2 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
                />
              </div>
            </div>

            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-xl text-xs text-cyan-300 flex items-start space-x-3">
              <ShieldAlert className="w-5 h-5 text-cyan-400 shrink-0 mt-0.5" />
              <div>
                <strong className="font-semibold block mb-0.5">Post-Quantum Cryptography Enforcement</strong>
                Each active replica will be allocated dedicated memory space for Kyber-1024 lattice operations and
                Dilithium5 signature generation. Ensure PQC hardware units are allocated when deploying sovereign financial bridges.
              </div>
            </div>
          </div>
        )}

        {/* TAB 4: Traffic & Cost Simulator */}
        {activeTab === 'simulation' && (
          <div className="bg-slate-900/60 border border-slate-800 rounded-xl p-6 space-y-6">
            <div className="flex items-center justify-between border-b border-slate-800 pb-4">
              <div className="flex items-center space-x-3">
                <BarChart2 className="w-6 h-6 text-cyan-400" />
                <div>
                  <h3 className="font-semibold text-slate-200 text-lg">Real-Time Scaling & Cost Simulator</h3>
                  <p className="text-xs text-slate-400">
                    Test how current trigger thresholds respond to dynamic traffic spikes and estimate cloud expenditures.
                  </p>
                </div>
              </div>
            </div>

            {/* Load Input Slider */}
            <div className="bg-slate-900/80 p-5 rounded-xl border border-slate-800 space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-semibold text-slate-200 flex items-center space-x-2">
                  <Activity className="w-4 h-4 text-cyan-400" />
                  <span>Simulated Inbound Request Volume</span>
                </span>
                <span className="text-lg font-bold text-cyan-400 bg-slate-800 px-3 py-1 rounded">
                  {simulatedRps.toLocaleString()} RPS
                </span>
              </div>
              <input
                type="range"
                min="500"
                max="50000"
                step="500"
                value={simulatedRps}
                onChange={(e) => setSimulatedRps(parseInt(e.target.value))}
                className="w-full h-3 bg-slate-800 rounded-lg appearance-none cursor-pointer accent-cyan-400"
              />
              <div className="flex justify-between text-xs text-slate-500">
                <span>500 RPS (Idle baseline)</span>
                <span>25,000 RPS (Normal peak)</span>
                <span>50,000 RPS (Emergency surge)</span>
              </div>
            </div>

            {/* Simulation Results Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
              {/* Active Replicas */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-medium text-slate-400">Projected Replicas</div>
                <div className="text-3xl font-extrabold text-white mt-2 flex items-baseline space-x-2">
                  <span>{simulationResults.calculatedReplicas}</span>
                  <span className="text-xs font-normal text-slate-400">/ {policy.maxReplicas} max</span>
                </div>
                {simulationResults.hitMaxCap && (
                  <div className="mt-2 text-xs text-amber-400 flex items-center space-x-1">
                    <AlertTriangle className="w-3.5 h-3.5" />
                    <span>Max replica ceiling hit!</span>
                  </div>
                )}
              </div>

              {/* Projected CPU Load */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-medium text-slate-400">Avg CPU Utilization</div>
                <div className="text-3xl font-extrabold text-white mt-2">
                  {simulationResults.estCpuUsage}%
                </div>
                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    style={{ width: `${simulationResults.estCpuUsage}%` }}
                    className={`h-full ${
                      simulationResults.estCpuUsage > 85 ? 'bg-red-500' : 'bg-cyan-400'
                    }`}
                  />
                </div>
              </div>

              {/* Projected Response Time */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-medium text-slate-400">Projected p95 Latency</div>
                <div className="text-3xl font-extrabold text-white mt-2">
                  {simulationResults.estimatedLatencyMs}{' '}
                  <span className="text-xs font-normal text-slate-400">ms</span>
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  Target SLA: {policy.triggers.targetLatencyMs} ms
                </div>
              </div>

              {/* Monthly Cost Estimate */}
              <div className="bg-slate-900/80 p-4 rounded-xl border border-slate-800">
                <div className="text-xs font-medium text-slate-400">Est. Monthly Cloud Spend</div>
                <div className="text-3xl font-extrabold text-emerald-400 mt-2 flex items-center">
                  <DollarSign className="w-6 h-6 -mr-1" />
                  {Math.round(simulationResults.monthlyCost).toLocaleString()}
                </div>
                <div className="mt-2 text-xs text-slate-500">
                  ${simulationResults.totalHourlyCost.toFixed(2)} / hour
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 5: Generated Spec YAML View */}
        {activeTab === 'yaml' && (
          <div className="bg-slate-900/80 border border-slate-800 rounded-xl p-5 space-y-4">
            <div className="flex items-center justify-between border-b border-slate-800 pb-3">
              <div className="flex items-center space-x-2">
                <Code className="w-5 h-5 text-cyan-400" />
                <h3 className="font-semibold text-slate-200 text-sm">
                  Kubernetes Multi-Cloud Scaling CRD
                </h3>
              </div>
              <button
                onClick={copyYamlToClipboard}
                className="flex items-center space-x-1.5 bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs px-3 py-1.5 rounded-md border border-slate-700 transition"
              >
                <Copy className="w-3.5 h-3.5" />
                <span>Copy Specification</span>
              </button>
            </div>

            <pre className="bg-slate-950 p-4 rounded-lg text-emerald-400 font-mono text-xs overflow-x-auto border border-slate-800/80 leading-relaxed">
              {yamlOutput}
            </pre>
          </div>
        )}
      </div>

      {/* Footer / Status Bar */}
      <div className="bg-slate-900/90 border-t border-slate-800 p-4 px-6 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-slate-400">
        <div className="flex items-center space-x-4">
          <span className="flex items-center space-x-1">
            <CheckCircle2 className="w-4 h-4 text-emerald-400" />
            <span>FIPS 140-3 Validation Active</span>
          </span>
          <span className="hidden md:inline text-slate-700">|</span>
          <span className="hidden md:inline">Last Synced: {new Date(policy.lastUpdated).toLocaleTimeString()}</span>
        </div>

        <div className="flex items-center space-x-3">
          <span className="text-slate-500">Target Namespace:</span>
          <span className="bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded border border-slate-700">
            gov-financial-core
          </span>
        </div>
      </div>
    </div>
  );
};

export default AutoScalingPolicyEditor;