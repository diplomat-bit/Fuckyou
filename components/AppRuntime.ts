

// --- CONSOLIDATED FROM: ./api/AppRegistry/types/AppRuntime.ts ---

export type RuntimeLifecycleStatus =
  | 'idle'
  | 'initializing'
  | 'bootstrapping'
  | 'running'
  | 'paused'
  | 'degraded'
  | 'draining'
  | 'terminating'
  | 'terminated'
  | 'failed'
  | 'sandboxed'
  | 'quarantined';

export type IsolationLevel =
  | 'none'
  | 'process'
  | 'chroot'
  | 'container'
  | 'wasm'
  | 'gvisor'
  | 'hypervisor'
  | 'secure_enclave';

export type ResourceUnit = 'bytes' | 'kilobytes' | 'megabytes' | 'gigabytes' | 'percentage' | 'millicores' | 'count';

export interface CPUMetrics {
  usagePercent: number;
  userTimeMs: number;
  systemTimeMs: number;
  coreCount: number;
  allocatedMillicores: number;
  throttledCycles: number;
  throttledTimeMs: number;
  loadAverage: [number, number, number];
}

export interface MemoryMetrics {
  heapTotalBytes: number;
  heapUsedBytes: number;
  rssBytes: number;
  externalBytes: number;
  arrayBuffersBytes: number;
  limitBytes: number;
  usagePercent: number;
  swapBytes: number;
  pageFaults: {
    minor: number;
    major: number;
  };
}

export interface IOMetrics {
  readOperations: number;
  writeOperations: number;
  bytesRead: number;
  bytesWritten: number;
  readLatencyMs: number;
  writeLatencyMs: number;
  openFileDescriptors: number;
  maxFileDescriptors: number;
}

export interface NetworkMetrics {
  packetsReceived: number;
  packetsSent: number;
  bytesReceived: number;
  bytesSent: number;
  activeConnections: number;
  droppedPackets: number;
  errorsRx: number;
  errorsTx: number;
  ingressBandwidthBps: number;
  egressBandwidthBps: number;
}

export interface GPUMetrics {
  deviceIndex: number;
  gpuName: string;
  vramTotalBytes: number;
  vramUsedBytes: number;
  computeUtilizationPercent: number;
  memoryUtilizationPercent: number;
  temperatureCelsius: number;
  powerUsageWatts: number;
}

export interface ResourceUtilizationSnapshot {
  timestamp: number;
  cpu: CPUMetrics;
  memory: MemoryMetrics;
  io: IOMetrics;
  network: NetworkMetrics;
  gpu?: GPUMetrics;
}

export interface ResourceLimits {
  maxMemoryBytes: number;
  maxCpuMillicores: number;
  maxFileDescriptors: number;
  maxProcesses: number;
  maxBandwidthBps: number;
  maxDiskUsageBytes: number;
  maxExecutionTimeMs?: number;
}

export interface MetricLatencyPercentiles {
  p50: number;
  p75: number;
  p90: number;
  p95: number;
  p99: number;
  p999: number;
}

export interface ExecutionMetrics {
  totalInvocations: number;
  activeExecutions: number;
  successfulExecutions: number;
  failedExecutions: number;
  timedOutExecutions: number;
  throughputRps: number;
  errorRatePercentage: number;
  executionDurationMs: MetricLatencyPercentiles;
  queueWaitTimeMs: MetricLatencyPercentiles;
  coldStartTimeMs?: number;
  lastInvocationTimestamp: number;
  lastErrorTimestamp?: number;
  lastErrorDetails?: {
    code: string;
    message: string;
    stackTrace?: string;
  };
}

export interface FileSystemMount {
  sourcePath: string;
  targetPath: string;
  readOnly: boolean;
  type: 'bind' | 'tmpfs' | 'volume' | 'overlay';
  options?: string[];
}

export interface NetworkEgressRule {
  protocol: 'tcp' | 'udp' | 'icmp' | 'all';
  destinationCidr?: string;
  destinationHost?: string;
  portRange?: {
    start: number;
    end: number;
  };
  action: 'allow' | 'deny' | 'audit';
}

export interface NetworkIngressRule {
  protocol: 'tcp' | 'udp' | 'all';
  sourcePortRange?: {
    start: number;
    end: number;
  };
  allowedSources?: string[];
  action: 'allow' | 'deny';
}

export interface NetworkPolicy {
  allowLoopback: boolean;
  allowOutboundInternet: boolean;
  dnsServers: string[];
  ingressRules: NetworkIngressRule[];
  egressRules: NetworkEgressRule[];
}

export interface SecurityCapabilities {
  add: string[];
  drop: string[];
}

export interface SeccompProfile {
  defaultAction: 'SCMP_ACT_ERRNO' | 'SCMP_ACT_KILL' | 'SCMP_ACT_TRAP' | 'SCMP_ACT_ALLOW';
  allowedSyscalls: string[];
  blockedSyscalls: string[];
}

export interface SandboxConfig {
  isolationLevel: IsolationLevel;
  chrootDir?: string;
  workingDirectory: string;
  environmentVariables: Record<string, string>;
  limits: ResourceLimits;
  filesystem: {
    mounts: FileSystemMount[];
    rootReadOnly: boolean;
    maskedPaths: string[];
    readOnlyPaths: string[];
  };
  network: NetworkPolicy;
  security: {
    capabilities: SecurityCapabilities;
    seccomp: SeccompProfile;
    allowPrivilegeEscalation: boolean;
    readOnlyAppDirectory: boolean;
    maskedDeviceNodes: boolean;
    enableSovereignEnclave?: boolean;
  };
  timeoutSettings: {
    initializationTimeoutMs: number;
    executionTimeoutMs: number;
    shutdownGracePeriodMs: number;
  };
}

export interface ProcessInformation {
  pid: number;
  ppid: number;
  uid: number;
  gid: number;
  command: string;
  arguments: string[];
  environment: Record<string, string>;
  startedAt: number;
  cpuAffinity: number[];
}

export interface RuntimeHealthCheck {
  id: string;
  name: string;
  status: 'healthy' | 'unhealthy' | 'degraded';
  lastCheckedAt: number;
  latencyMs: number;
  consecutiveFailures: number;
  message?: string;
  details?: Record<string, unknown>;
}

export interface AppRuntimeSnapshot {
  appId: string;
  instanceId: string;
  tenantId: string;
  status: RuntimeLifecycleStatus;
  process?: ProcessInformation;
  currentUtilization: ResourceUtilizationSnapshot;
  executionMetrics: ExecutionMetrics;
  sandbox: SandboxConfig;
  healthChecks: RuntimeHealthCheck[];
  activeThreadsCount: number;
  eventLoopLagMs: number;
  uptimeSeconds: number;
  updatedAt: number;
}

export type AppRuntime = AppRuntimeSnapshot;

export interface RuntimeStatusChangeEvent {
  appId: string;
  instanceId: string;
  previousStatus: RuntimeLifecycleStatus;
  newStatus: RuntimeLifecycleStatus;
  reason: string;
  timestamp: number;
  metadata?: Record<string, unknown>;
}

export interface RuntimeQuotaViolationEvent {
  appId: string;
  instanceId: string;
  resourceType: 'cpu' | 'memory' | 'io' | 'network' | 'timeout';
  threshold: number;
  actual: number;
  actionTaken: 'warn' | 'throttle' | 'quarantine' | 'terminate';
  timestamp: number;
}

export interface RuntimeControlCommand {
  commandId: string;
  appId: string;
  instanceId: string;
  action: 'start' | 'stop' | 'pause' | 'resume' | 'restart' | 'quarantine' | 'purge_cache';
  payload?: Record<string, unknown>;
  issuedBy: string;
  issuedAt: number;
}

// ============================================================================
// API ROUTING & RUNTIME MANAGEMENT ENGINE IMPLEMENTATION
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';

/**
 * In-Memory Database for App Runtimes
 */
class AppRuntimeStore {
  private runtimes: Map<string, AppRuntimeSnapshot> = new Map();
  private eventLog: Array<RuntimeStatusChangeEvent | RuntimeQuotaViolationEvent> = [];

  constructor() {
    // Seed with a default high-performance secure runtime for demonstration
    this.seedDefaultRuntime();
  }

  public get(appId: string): AppRuntimeSnapshot | undefined {
    return this.runtimes.get(appId);
  }

  public set(appId: string, snapshot: AppRuntimeSnapshot): void {
    this.runtimes.set(appId, snapshot);
  }

  public delete(appId: string): boolean {
    return this.runtimes.delete(appId);
  }

  public list(): AppRuntimeSnapshot[] {
    return Array.from(this.runtimes.values());
  }

  public logEvent(event: RuntimeStatusChangeEvent | RuntimeQuotaViolationEvent): void {
    this.eventLog.push(event);
    if (this.eventLog.length > 1000) {
      this.eventLog.shift(); // Keep log size bounded
    }
  }

  public getEvents(appId?: string): Array<RuntimeStatusChangeEvent | RuntimeQuotaViolationEvent> {
    if (appId) {
      return this.eventLog.filter(e => e.appId === appId);
    }
    return this.eventLog;
  }

  private seedDefaultRuntime() {
    const defaultAppId = 'app-citibank-core-ledger';
    const defaultSnapshot: AppRuntimeSnapshot = {
      appId: defaultAppId,
      instanceId: 'inst-99f8a2bc-4d11-4b8e-8901-776655443322',
      tenantId: 'tenant-citi-global-001',
      status: 'running',
      process: {
        pid: 4102,
        ppid: 1,
        uid: 1001,
        gid: 1001,
        command: 'node',
        arguments: ['dist/index.js', '--secure-enclave=true'],
        environment: { NODE_ENV: 'production', PORT: '8080' },
        startedAt: Date.now() - 3600000, // 1 hour ago
        cpuAffinity: [0, 1, 2, 3]
      },
      currentUtilization: this.generateMockUtilization(),
      executionMetrics: {
        totalInvocations: 142050,
        activeExecutions: 12,
        successfulExecutions: 142038,
        failedExecutions: 12,
        timedOutExecutions: 0,
        throughputRps: 39.4,
        errorRatePercentage: 0.0084,
        executionDurationMs: { p50: 1.2, p75: 2.1, p90: 4.5, p95: 8.2, p99: 15.4, p999: 42.1 },
        queueWaitTimeMs: { p50: 0.1, p75: 0.2, p90: 0.4, p95: 0.8, p99: 1.5, p999: 5.0 },
        coldStartTimeMs: 124,
        lastInvocationTimestamp: Date.now() - 50
      },
      sandbox: {
        isolationLevel: 'secure_enclave',
        workingDirectory: '/app',
        environmentVariables: { SECURE_MODE: 'true' },
        limits: {
          maxMemoryBytes: 1024 * 1024 * 1024 * 2, // 2GB
          maxCpuMillicores: 4000,
          maxFileDescriptors: 10000,
          maxProcesses: 64,
          maxBandwidthBps: 100000000, // 100 Mbps
          maxDiskUsageBytes: 1024 * 1024 * 1024 * 10 // 10GB
        },
        filesystem: {
          mounts: [
            { sourcePath: '/var/secure/keys', targetPath: '/keys', readOnly: true, type: 'bind' }
          ],
          rootReadOnly: true,
          maskedPaths: ['/proc/sys', '/sys'],
          readOnlyPaths: ['/usr', '/bin']
        },
        network: {
          allowLoopback: true,
          allowOutboundInternet: false,
          dnsServers: ['1.1.1.1', '8.8.8.8'],
          ingressRules: [
            { protocol: 'tcp', sourcePortRange: { start: 8080, end: 8080 }, allowedSources: ['10.0.0.0/8'], action: 'allow' }
          ],
          egressRules: [
            { protocol: 'tcp', destinationCidr: '10.1.0.0/16', portRange: { start: 443, end: 443 }, action: 'allow' }
          ]
        },
        security: {
          capabilities: { add: [], drop: ['ALL'] },
          seccomp: {
            defaultAction: 'SCMP_ACT_ERRNO',
            allowedSyscalls: ['read', 'write', 'exit', 'epoll_wait'],
            blockedSyscalls: ['fork', 'execve']
          },
          allowPrivilegeEscalation: false,
          readOnlyAppDirectory: true,
          maskedDeviceNodes: true,
          enableSovereignEnclave: true
        },
        timeoutSettings: {
          initializationTimeoutMs: 5000,
          executionTimeoutMs: 30000,
          shutdownGracePeriodMs: 15000
        }
      },
      healthChecks: [
        { id: 'hc-1', name: 'Database Connection', status: 'healthy', lastCheckedAt: Date.now() - 10000, latencyMs: 2, consecutiveFailures: 0 },
        { id: 'hc-2', name: 'Enclave Attestation', status: 'healthy', lastCheckedAt: Date.now() - 10000, latencyMs: 15, consecutiveFailures: 0 }
      ],
      activeThreadsCount: 8,
      eventLoopLagMs: 0.42,
      uptimeSeconds: 3600,
      updatedAt: Date.now()
    };

    this.runtimes.set(defaultAppId, defaultSnapshot);
  }

  public generateMockUtilization(): ResourceUtilizationSnapshot {
    return {
      timestamp: Date.now(),
      cpu: {
        usagePercent: 14.2,
        userTimeMs: 450200,
        systemTimeMs: 120400,
        coreCount: 4,
        allocatedMillicores: 4000,
        throttledCycles: 0,
        throttledTimeMs: 0,
        loadAverage: [0.15, 0.12, 0.08]
      },
      memory: {
        heapTotalBytes: 128 * 1024 * 1024,
        heapUsedBytes: 84 * 1024 * 1024,
        rssBytes: 210 * 1024 * 1024,
        externalBytes: 12 * 1024 * 1024,
        arrayBuffersBytes: 4 * 1024 * 1024,
        limitBytes: 2 * 1024 * 1024 * 1024,
        usagePercent: 10.5,
        swapBytes: 0,
        pageFaults: { minor: 1420, major: 0 }
      },
      io: {
        readOperations: 450,
        writeOperations: 1200,
        bytesRead: 4500000,
        bytesWritten: 12400000,
        readLatencyMs: 0.8,
        writeLatencyMs: 1.2,
        openFileDescriptors: 14,
        maxFileDescriptors: 10000
      },
      network: {
        packetsReceived: 840200,
        packetsSent: 839100,
        bytesReceived: 142050000,
        bytesSent: 184020000,
        activeConnections: 12,
        droppedPackets: 0,
        errorsRx: 0,
        errorsTx: 0,
        ingressBandwidthBps: 124000,
        egressBandwidthBps: 156000
      },
      gpu: {
        deviceIndex: 0,
        gpuName: 'NVIDIA H100 Tensor Core (Virtual)',
        vramTotalBytes: 80 * 1024 * 1024 * 1024,
        vramUsedBytes: 4 * 1024 * 1024 * 1024,
        computeUtilizationPercent: 5.4,
        memoryUtilizationPercent: 5.0,
        temperatureCelsius: 42,
        powerUsageWatts: 75
      }
    };
  }
}

export const runtimeStore = new AppRuntimeStore();

// ============================================================================
// EXPRESS ROUTER FOR APP RUNTIME MANAGEMENT
// ============================================================================

const router = Router();

/**
 * GET /api/runtime
 * List all active application runtimes
 */
router.get('/', (req: Request, res: Response) => {
  try {
    const runtimes = runtimeStore.list();
    res.status(200).json({
      success: true,
      count: runtimes.length,
      data: runtimes
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/runtime/:appId
 * Get detailed runtime snapshot for a specific application
 */
router.get('/:appId', (req: Request, res: Response) => {
  try {
    const appId = Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId;
    const snapshot = runtimeStore.get(appId as string);

    if (!snapshot) {
      return res.status(404).json({
        success: false,
        error: `Runtime snapshot for application '${appId}' not found.`
      });
    }

    // Dynamically update utilization metrics to simulate real-time tracking
    snapshot.currentUtilization = runtimeStore.generateMockUtilization();
    snapshot.uptimeSeconds = Math.floor((Date.now() - (snapshot.process?.startedAt || Date.now())) / 1000);
    snapshot.updatedAt = Date.now();

    res.status(200).json({
      success: true,
      data: snapshot
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/runtime/:appId/control
 * Send control commands to start, stop, pause, resume, restart, or quarantine a runtime
 */
router.post('/:appId/control', (req: Request, res: Response) => {
  try {
    const appId = (Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId) as string;
    const { action, payload, issuedBy } = req.body;

    if (!action) {
      return res.status(400).json({ success: false, error: 'Missing required field: action' });
    }

    const snapshot = runtimeStore.get(appId);
    if (!snapshot && action !== 'start') {
      return res.status(404).json({ success: false, error: `Runtime for application '${appId}' does not exist.` });
    }

    const commandId = `cmd-${Math.random().toString(36).substr(2, 9)}`;
    const command: RuntimeControlCommand = {
      commandId,
      appId,
      instanceId: snapshot?.instanceId || `inst-${Math.random().toString(36).substr(2, 9)}`,
      action,
      payload,
      issuedBy: issuedBy || 'system-orchestrator',
      issuedAt: Date.now()
    };

    let previousStatus: RuntimeLifecycleStatus = snapshot?.status || 'idle';
    let newStatus: RuntimeLifecycleStatus = previousStatus;

    switch (action) {
      case 'start':
        if (snapshot && snapshot.status === 'running') {
          return res.status(400).json({ success: false, error: 'Application is already running.' });
        }
        newStatus = 'initializing';
        break;
      case 'stop':
        newStatus = 'terminating';
        break;
      case 'pause':
        if (snapshot?.status !== 'running') {
          return res.status(400).json({ success: false, error: 'Only running applications can be paused.' });
        }
        newStatus = 'paused';
        break;
      case 'resume':
        if (snapshot?.status !== 'paused') {
          return res.status(400).json({ success: false, error: 'Only paused applications can be resumed.' });
        }
        newStatus = 'running';
        break;
      case 'restart':
        newStatus = 'bootstrapping';
        break;
      case 'quarantine':
        newStatus = 'quarantined';
        break;
      case 'purge_cache':
        // No status change, just clear cache
        break;
      default:
        return res.status(400).json({ success: false, error: `Invalid control action: ${action}` });
    }

    // Apply state changes
    if (action === 'start' && !snapshot) {
      // Create new runtime snapshot
      const newSnapshot: AppRuntimeSnapshot = {
        appId,
        instanceId: command.instanceId,
        tenantId: (payload?.tenantId as string) || 'tenant-default',
        status: 'running',
        process: {
          pid: Math.floor(Math.random() * 10000) + 2000,
          ppid: 1,
          uid: 1000,
          gid: 1000,
          command: 'node',
          arguments: [],
          environment: {},
          startedAt: Date.now(),
          cpuAffinity: [0, 1]
        },
        currentUtilization: runtimeStore.generateMockUtilization(),
        executionMetrics: {
          totalInvocations: 0,
          activeExecutions: 0,
          successfulExecutions: 0,
          failedExecutions: 0,
          timedOutExecutions: 0,
          throughputRps: 0,
          errorRatePercentage: 0,
          executionDurationMs: { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0, p999: 0 },
          queueWaitTimeMs: { p50: 0, p75: 0, p90: 0, p95: 0, p99: 0, p999: 0 },
          lastInvocationTimestamp: 0
        },
        sandbox: {
          isolationLevel: (payload?.isolationLevel as IsolationLevel) || 'container',
          workingDirectory: '/app',
          environmentVariables: {},
          limits: {
            maxMemoryBytes: 512 * 1024 * 1024,
            maxCpuMillicores: 1000,
            maxFileDescriptors: 1024,
            maxProcesses: 16,
            maxBandwidthBps: 10000000,
            maxDiskUsageBytes: 1024 * 1024 * 1024
          },
          filesystem: { mounts: [], rootReadOnly: false, maskedPaths: [], readOnlyPaths: [] },
          network: { allowLoopback: true, allowOutboundInternet: true, dnsServers: [], ingressRules: [], egressRules: [] },
          security: {
            capabilities: { add: [], drop: [] },
            seccomp: { defaultAction: 'SCMP_ACT_ALLOW', allowedSyscalls: [], blockedSyscalls: [] },
            allowPrivilegeEscalation: true,
            readOnlyAppDirectory: false,
            maskedDeviceNodes: false
          },
          timeoutSettings: { initializationTimeoutMs: 10000, executionTimeoutMs: 30000, shutdownGracePeriodMs: 5000 }
        },
        healthChecks: [],
        activeThreadsCount: 1,
        eventLoopLagMs: 0.1,
        uptimeSeconds: 0,
        updatedAt: Date.now()
      };
      runtimeStore.set(appId, newSnapshot);
    } else if (snapshot) {
      snapshot.status = newStatus;
      if (newStatus === 'terminating') {
        setTimeout(() => {
          snapshot.status = 'terminated';
          snapshot.process = undefined;
          runtimeStore.logEvent({
            appId,
            instanceId: snapshot.instanceId,
            previousStatus: 'terminating',
            newStatus: 'terminated',
            reason: 'Graceful shutdown completed',
            timestamp: Date.now()
          });
        }, 1000);
      } else if (newStatus === 'bootstrapping') {
        setTimeout(() => {
          snapshot.status = 'running';
          if (snapshot.process) {
            snapshot.process.startedAt = Date.now();
          }
          runtimeStore.logEvent({
            appId,
            instanceId: snapshot.instanceId,
            previousStatus: 'bootstrapping',
            newStatus: 'running',
            reason: 'Restart bootstrap completed',
            timestamp: Date.now()
          });
        }, 1500);
      }
      snapshot.updatedAt = Date.now();
    }

    // Log status change event
    const statusEvent: RuntimeStatusChangeEvent = {
      appId,
      instanceId: command.instanceId,
      previousStatus,
      newStatus,
      reason: `Control command executed: ${action} by ${command.issuedBy}`,
      timestamp: Date.now(),
      metadata: { commandId, payload }
    };
    runtimeStore.logEvent(statusEvent);

    res.status(200).json({
      success: true,
      message: `Control command '${action}' dispatched successfully.`,
      commandId,
      currentStatus: newStatus,
      event: statusEvent
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * GET /api/runtime/:appId/events
 * Retrieve lifecycle and quota violation events for an application
 */
router.get('/:appId/events', (req: Request, res: Response) => {
  try {
    const appId = (Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId) as string;
    const events = runtimeStore.getEvents(appId);
    res.status(200).json({
      success: true,
      count: events.length,
      data: events
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/runtime/:appId/sandbox
 * Dynamically update sandbox configuration and security policies
 */
router.post('/:appId/sandbox', (req: Request, res: Response) => {
  try {
    const appId = (Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId) as string;
    const newSandboxConfig = req.body as Partial<SandboxConfig>;

    const snapshot = runtimeStore.get(appId);
    if (!snapshot) {
      return res.status(404).json({ success: false, error: `Runtime for application '${appId}' not found.` });
    }

    snapshot.sandbox = {
      ...snapshot.sandbox,
      ...newSandboxConfig,
      security: {
        ...snapshot.sandbox.security,
        ...(newSandboxConfig.security || {})
      },
      limits: {
        ...snapshot.sandbox.limits,
        ...(newSandboxConfig.limits || {})
      }
    };
    snapshot.updatedAt = Date.now();

    res.status(200).json({
      success: true,
      message: 'Sandbox configuration updated successfully.',
      data: snapshot.sandbox
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

/**
 * POST /api/runtime/:appId/simulate-violation
 * Simulate a resource quota violation (for testing auto-scaling, throttling, and quarantine triggers)
 */
router.post('/:appId/simulate-violation', (req: Request, res: Response) => {
  try {
    const appId = (Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId) as string;
    const { resourceType, threshold, actual, actionTaken } = req.body;

    const snapshot = runtimeStore.get(appId);
    if (!snapshot) {
      return res.status(404).json({ success: false, error: `Runtime for application '${appId}' not found.` });
    }

    const violationEvent: RuntimeQuotaViolationEvent = {
      appId,
      instanceId: snapshot.instanceId,
      resourceType: resourceType || 'memory',
      threshold: threshold || 1024 * 1024 * 1024,
      actual: actual || 1024 * 1024 * 1024 * 1.2,
      actionTaken: actionTaken || 'throttle',
      timestamp: Date.now()
    };

    runtimeStore.logEvent(violationEvent);

    if (actionTaken === 'quarantine') {
      snapshot.status = 'quarantined';
    } else if (actionTaken === 'terminate') {
      snapshot.status = 'failed';
    } else if (actionTaken === 'throttle') {
      snapshot.status = 'degraded';
    }
    snapshot.updatedAt = Date.now();

    res.status(200).json({
      success: true,
      message: `Quota violation simulated. Action taken: ${actionTaken}`,
      event: violationEvent,
      currentStatus: snapshot.status
    });
  } catch (error: any) {
    res.status(500).json({ success: false, error: error.message });
  }
});

export { router as AppRuntimeRouter };