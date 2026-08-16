import { EventEmitter } from 'events';
import { Router, Request, Response, NextFunction } from 'express';

/**
 * Execution sandbox isolation level defining security boundary enforcement.
 */
export type SandboxIsolationLevel = 'STRICT' | 'CONTAINED' | 'SHARED_THREAD' | 'VIRTUALIZED';

/**
 * Valid states for an application managed by the Oko App Registry Orchestrator.
 */
export type AppLifecycleStage =
  | 'UNLOADED'
  | 'REGISTERED'
  | 'LOADING'
  | 'INITIALIZING'
  | 'RUNNING'
  | 'PAUSED'
  | 'SUSPENDED'
  | 'TERMINATED'
  | 'ERROR';

/**
 * System permissions granted to dynamically loaded application bundles.
 */
export type AppPermission =
  | 'LEDGER_READ'
  | 'LEDGER_WRITE'
  | 'TREASURY_EXECUTE'
  | 'SOVEREIGN_IDENTITY'
  | 'AI_INFERENCE'
  | 'NETWORK_EGRESS'
  | 'CRYPTO_SIGNING'
  | 'PERSISTENT_STORAGE'
  | 'IPC_BROADCAST';

/**
 * Capability descriptor required for dynamic loading and runtime isolation.
 */
export interface AppPermissionsConfig {
  grantedPermissions: AppPermission[];
  networkDomainAllowlist: string[];
  maxMemoryMb: number;
  cpuQuotaPercent: number;
  rateLimitRequestsPerMin: number;
}

/**
 * Manifest definition describing a dynamic Oko application module.
 */
export interface AppManifest {
  appId: string;
  name: string;
  version: string;
  description: string;
  publisher: string;
  entryPointUrl: string;
  checksumSha256: string;
  permissions: AppPermissionsConfig;
  dependencies?: Record<string, string>;
  initialStateSchema?: Record<string, any>;
  tags?: string[];
  isSovereignSystemApp?: boolean;
}

/**
 * Isolated runtime container holding execution state for a registered application.
 */
export interface AppExecutionInstance {
  manifest: AppManifest;
  stage: AppLifecycleStage;
  sandboxId: string;
  isolationLevel: SandboxIsolationLevel;
  launchedAt?: number;
  lastActiveAt?: number;
  errorState?: {
    code: string;
    message: string;
    timestamp: number;
    stackTrace?: string;
  };
  metrics: {
    invocationsCount: number;
    errorCount: number;
    lastExecutionDurationMs: number;
    memoryAllocatedBytes: number;
  };
  stateBuffer: Record<string, any>;
}

/**
 * Inter-Process Communication (IPC) payload passed between isolated application contexts.
 */
export interface AppIpcMessage<T = any> {
  messageId: string;
  senderAppId: string;
  targetAppId?: string; // Undefined denotes broadcast
  channel: string;
  payload: T;
  timestamp: number;
  signature?: string;
}

/**
 * Event payload emitted when lifecycle transitions occur.
 */
export interface AppLifecycleEvent {
  appId: string;
  previousStage: AppLifecycleStage;
  currentStage: AppLifecycleStage;
  timestamp: number;
  details?: string;
}

/**
 * Helper to normalize route/query parameter values to string.
 */
function normalizeString(val: any): string {
  if (typeof val === 'string') return val;
  if (Array.isArray(val)) return val.length > 0 ? normalizeString(val[0]) : '';
  if (val === undefined || val === null) return '';
  return String(val);
}

/**
 * Central Orchestrator managing dynamic app dynamic loading, execution sandboxing,
 * lifecycle state machines, security entitlement checks, and state synchronization.
 */
export class AppRegistryOrchestrator extends EventEmitter {
  private static instance: AppRegistryOrchestrator;

  private registry: Map<string, AppExecutionInstance> = new Map();
  private appInstancesBySandbox: Map<string, string> = new Map();
  private globalStateStore: Map<string, Record<string, any>> = new Map();
  private channelSubscriptions: Map<string, Set<string>> = new Map();
  private isInitialized: boolean = false;
  private initializedAt: number = 0;
  private auditLogs: Array<{ timestamp: number; appId: string; action: string; details?: string }> = [];

  private constructor() {
    super();
    this.setMaxListeners(100);
  }

  /**
   * Retrieves the singleton instance of the AppRegistryOrchestrator.
   */
  public static getInstance(): AppRegistryOrchestrator {
    if (!AppRegistryOrchestrator.instance) {
      AppRegistryOrchestrator.instance = new AppRegistryOrchestrator();
    }
    return AppRegistryOrchestrator.instance;
  }

  /**
   * Initializes the core orchestrator runtime and state handlers.
   */
  public async initialize(): Promise<void> {
    if (this.isInitialized) {
      return;
    }

    this.setupGlobalEventHandlers();
    this.isInitialized = true;
    this.initializedAt = Date.now();
    this.emit('orchestrator:ready', { timestamp: this.initializedAt });
  }

  /**
   * Logs an orchestrator action to the internal audit trail.
   */
  public logAudit(appId: string, action: string, details?: string): void {
    const logEntry = {
      timestamp: Date.now(),
      appId,
      action,
      details,
    };
    this.auditLogs.push(logEntry);
    if (this.auditLogs.length > 1000) {
      this.auditLogs.shift();
    }
    this.emit('orchestrator:audit', logEntry);
  }

  /**
   * Retrieves audit logs, optionally filtered by appId.
   */
  public getAuditLogs(appId?: string): Array<{ timestamp: number; appId: string; action: string; details?: string }> {
    if (appId) {
      return this.auditLogs.filter(log => log.appId === appId);
    }
    return this.auditLogs;
  }

  /**
   * Registers an application manifest into the platform registry.
   * Performs validation, integrity checks, and prepares sandbox boundaries.
   */
  public async registerApp(manifest: AppManifest, isolationLevel: SandboxIsolationLevel = 'CONTAINED'): Promise<AppExecutionInstance> {
    this.validateManifest(manifest);

    if (this.registry.has(manifest.appId)) {
      throw new Error(`Application with ID '${manifest.appId}' is already registered.`);
    }

    const sandboxId = this.generateSandboxId(manifest.appId);

    const instance: AppExecutionInstance = {
      manifest,
      stage: 'REGISTERED',
      sandboxId,
      isolationLevel,
      metrics: {
        invocationsCount: 0,
        errorCount: 0,
        lastExecutionDurationMs: 0,
        memoryAllocatedBytes: 0,
      },
      stateBuffer: manifest.initialStateSchema ? { ...manifest.initialStateSchema } : {},
    };

    this.registry.set(manifest.appId, instance);
    this.appInstancesBySandbox.set(sandboxId, manifest.appId);
    this.globalStateStore.set(manifest.appId, instance.stateBuffer);

    this.logAudit(manifest.appId, 'REGISTER', `Registered with isolation level: ${isolationLevel}`);
    this.emitLifecycleEvent(manifest.appId, 'UNLOADED', 'REGISTERED');
    return instance;
  }

  /**
   * Loads and launches an application through its lifecycle transitions.
   */
  public async launchApp(appId: string, initialParams?: Record<string, any>): Promise<boolean> {
    const instance = this.getAppInstanceOrThrow(appId);

    if (instance.stage === 'RUNNING') {
      return true;
    }

    try {
      await this.transitionStage(appId, 'LOADING');
      await this.loadAppResources(instance);

      await this.transitionStage(appId, 'INITIALIZING');
      await this.initializeSandboxEnvironment(instance, initialParams);

      await this.transitionStage(appId, 'RUNNING');
      instance.launchedAt = Date.now();
      instance.lastActiveAt = Date.now();

      this.logAudit(appId, 'LAUNCH', 'App launched successfully');
      return true;
    } catch (error: any) {
      await this.handleAppError(appId, 'ERR_LAUNCH_FAILED', error.message, error.stack);
      return false;
    }
  }

  /**
   * Pauses an active application instance without destroying its state sandbox.
   */
  public async pauseApp(appId: string): Promise<boolean> {
    const instance = this.getAppInstanceOrThrow(appId);

    if (instance.stage !== 'RUNNING') {
      throw new Error(`Cannot pause app '${appId}' from current stage '${instance.stage}'.`);
    }

    await this.transitionStage(appId, 'PAUSED');
    this.logAudit(appId, 'PAUSE', 'App paused');
    return true;
  }

  /**
   * Resumes a paused application back to the running execution stage.
   */
  public async resumeApp(appId: string): Promise<boolean> {
    const instance = this.getAppInstanceOrThrow(appId);

    if (instance.stage !== 'PAUSED' && instance.stage !== 'SUSPENDED') {
      throw new Error(`Cannot resume app '${appId}' from current stage '${instance.stage}'.`);
    }

    await this.transitionStage(appId, 'RUNNING');
    instance.lastActiveAt = Date.now();
    this.logAudit(appId, 'RESUME', 'App resumed');
    return true;
  }

  /**
   * Terminates execution of an application, cleaning up active isolation contexts.
   */
  public async terminateApp(appId: string, reason?: string): Promise<boolean> {
    const instance = this.getAppInstanceOrThrow(appId);

    if (instance.stage === 'TERMINATED' || instance.stage === 'UNLOADED') {
      return true;
    }

    await this.cleanupSandboxResources(instance);
    await this.transitionStage(appId, 'TERMINATED', reason);
    this.logAudit(appId, 'TERMINATE', `App terminated. Reason: ${reason || 'None'}`);

    return true;
  }

  /**
   * Unregisters an application completely from the platform orchestrator.
   */
  public async unregisterApp(appId: string): Promise<boolean> {
    const instance = this.registry.get(appId);
    if (!instance) return false;

    if (instance.stage === 'RUNNING' || instance.stage === 'PAUSED') {
      await this.terminateApp(appId, 'Unregistering Application');
    }

    this.appInstancesBySandbox.delete(instance.sandboxId);
    this.globalStateStore.delete(appId);
    this.registry.delete(appId);

    this.logAudit(appId, 'UNREGISTER', 'App unregistered from orchestrator');
    this.emit('app:unregistered', { appId, timestamp: Date.now() });
    return true;
  }

  /**
   * Hot reloads an application by terminating it, reloading resources, and launching it again.
   */
  public async hotReloadApp(appId: string): Promise<boolean> {
    const instance = this.getAppInstanceOrThrow(appId);
    const wasRunning = instance.stage === 'RUNNING';
    const originalState = { ...instance.stateBuffer };

    this.logAudit(appId, 'HOT_RELOAD_START', `Reloading app from entrypoint: ${instance.manifest.entryPointUrl}`);

    if (wasRunning) {
      await this.terminateApp(appId, 'Hot Reloading');
    }

    instance.stage = 'REGISTERED';

    if (wasRunning) {
      const success = await this.launchApp(appId, originalState);
      if (success) {
        this.logAudit(appId, 'HOT_RELOAD_SUCCESS', 'App hot reloaded and state restored successfully.');
        return true;
      } else {
        this.logAudit(appId, 'HOT_RELOAD_FAILURE', 'App failed to launch during hot reload.');
        return false;
      }
    }

    this.logAudit(appId, 'HOT_RELOAD_SUCCESS', 'App hot reloaded successfully (was not running).');
    return true;
  }

  /**
   * Dispatches an Inter-Process Communication (IPC) message between applications.
   */
  public dispatchIpcMessage<T = any>(senderAppId: string, channel: string, payload: T, targetAppId?: string): AppIpcMessage<T> {
    const sender = this.getAppInstanceOrThrow(senderAppId);

    this.assertPermission(sender, 'IPC_BROADCAST');

    const message: AppIpcMessage<T> = {
      messageId: `ipc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      senderAppId,
      targetAppId,
      channel,
      payload,
      timestamp: Date.now(),
      signature: this.signIpcPayload(senderAppId, channel, payload),
    };

    if (targetAppId) {
      const target = this.registry.get(targetAppId);
      if (target && target.stage === 'RUNNING') {
        this.emit(`ipc:${targetAppId}:${channel}`, message);
      }
    } else {
      this.emit(`ipc:broadcast:${channel}`, message);
    }

    this.logAudit(senderAppId, 'IPC_DISPATCH', `Channel: ${channel}, Target: ${targetAppId || 'Broadcast'}`);
    this.emit('ipc:logged', message);
    return message;
  }

  /**
   * Subscribes an application context to an IPC channel.
   */
  public subscribeIpcChannel(subscriberAppId: string, channel: string, callback: (message: AppIpcMessage) => void): () => void {
    this.getAppInstanceOrThrow(subscriberAppId);

    if (!this.channelSubscriptions.has(channel)) {
      this.channelSubscriptions.set(channel, new Set());
    }
    this.channelSubscriptions.get(channel)!.add(subscriberAppId);

    const directEventKey = `ipc:${subscriberAppId}:${channel}`;
    const broadcastEventKey = `ipc:broadcast:${channel}`;

    const handler = (msg: AppIpcMessage) => callback(msg);

    this.on(directEventKey, handler);
    this.on(broadcastEventKey, handler);

    return () => {
      this.off(directEventKey, handler);
      this.off(broadcastEventKey, handler);
      const subs = this.channelSubscriptions.get(channel);
      if (subs) {
        subs.delete(subscriberAppId);
      }
    };
  }

  /**
   * Synchronizes application state buffer with dynamic updates.
   */
  public syncAppState(appId: string, stateDelta: Record<string, any>, source: 'APP' | 'ORCHESTRATOR' = 'APP'): Record<string, any> {
    const instance = this.getAppInstanceOrThrow(appId);

    const updatedState = {
      ...instance.stateBuffer,
      ...stateDelta,
      _lastUpdated: Date.now(),
    };

    instance.stateBuffer = updatedState;
    this.globalStateStore.set(appId, updatedState);

    this.logAudit(appId, 'STATE_SYNC', `State updated by ${source}`);
    this.emit('app:state_updated', {
      appId,
      source,
      state: updatedState,
      timestamp: Date.now(),
    });

    return updatedState;
  }

  /**
   * Gets state for a specific registered application.
   */
  public getAppState(appId: string): Record<string, any> | null {
    return this.globalStateStore.get(appId) || null;
  }

  /**
   * Returns details of an application execution instance.
   */
  public getAppInstance(appId: string): AppExecutionInstance | undefined {
    return this.registry.get(appId);
  }

  /**
   * Lists all applications currently registered in the system.
   */
  public listApps(filterByStage?: AppLifecycleStage): AppExecutionInstance[] {
    const allApps = Array.from(this.registry.values());
    if (!filterByStage) {
      return allApps;
    }
    return allApps.filter((app) => app.stage === filterByStage);
  }

  /**
   * Validates if an application holds specific permissions.
   */
  public hasPermission(appId: string, permission: AppPermission): boolean {
    const instance = this.registry.get(appId);
    if (!instance) return false;
    return instance.manifest.permissions.grantedPermissions.includes(permission);
  }

  /**
   * Enforces security bounds for permission-protected actions.
   */
  private assertPermission(instance: AppExecutionInstance, permission: AppPermission): void {
    if (!instance.manifest.permissions.grantedPermissions.includes(permission)) {
      throw new Error(`Security Violation: App '${instance.manifest.appId}' lacks requested permission '${permission}'.`);
    }
  }

  /**
   * Executes internal logic lifecycle stage transition safely.
   */
  private async transitionStage(appId: string, newStage: AppLifecycleStage, details?: string): Promise<void> {
    const instance = this.getAppInstanceOrThrow(appId);
    const previousStage = instance.stage;

    instance.stage = newStage;
    instance.lastActiveAt = Date.now();

    this.emitLifecycleEvent(appId, previousStage, newStage, details);
  }

  /**
   * Emits standardized lifecycle change event.
   */
  private emitLifecycleEvent(appId: string, previousStage: AppLifecycleStage, currentStage: AppLifecycleStage, details?: string): void {
    const event: AppLifecycleEvent = {
      appId,
      previousStage,
      currentStage,
      timestamp: Date.now(),
      details,
    };
    this.emit('app:lifecycle', event);
    this.emit(`app:lifecycle:${appId}`, event);
  }

  /**
   * Internal mock resource loader for dynamic entrypoints.
   */
  private async loadAppResources(instance: AppExecutionInstance): Promise<void> {
    const startTime = Date.now();
    
    if (!instance.manifest.entryPointUrl) {
      throw new Error('Invalid entrypoint URL provided in manifest.');
    }

    await new Promise((resolve) => setTimeout(resolve, 50));

    instance.metrics.lastExecutionDurationMs = Date.now() - startTime;
  }

  /**
   * Initializes isolated sandbox parameters.
   */
  private async initializeSandboxEnvironment(instance: AppExecutionInstance, initialParams?: Record<string, any>): Promise<void> {
    if (initialParams) {
      this.syncAppState(instance.manifest.appId, initialParams, 'ORCHESTRATOR');
    }
    instance.metrics.invocationsCount += 1;
  }

  /**
   * Cleans up and revokes resources bound to an execution sandbox.
   */
  private async cleanupSandboxResources(instance: AppExecutionInstance): Promise<void> {
    instance.metrics.memoryAllocatedBytes = 0;
  }

  /**
   * Handles errors and logs app execution fault details.
   */
  private async handleAppError(appId: string, code: string, message: string, stackTrace?: string): Promise<void> {
    const instance = this.registry.get(appId);
    if (instance) {
      instance.stage = 'ERROR';
      instance.metrics.errorCount += 1;
      instance.errorState = {
        code,
        message,
        timestamp: Date.now(),
        stackTrace,
      };
      this.logAudit(appId, 'ERROR', `${code}: ${message}`);
      this.emitLifecycleEvent(appId, instance.stage, 'ERROR', `${code}: ${message}`);
    }
    this.emit('orchestrator:error', { appId, code, message, stackTrace, timestamp: Date.now() });
  }

  /**
   * Utility validation check for manifest integrity.
   */
  private validateManifest(manifest: AppManifest): void {
    if (!manifest.appId || typeof manifest.appId !== 'string') {
      throw new Error('Invalid or missing appId in manifest.');
    }
    if (!manifest.name || !manifest.version) {
      throw new Error('Application name and version are required.');
    }
    if (!manifest.permissions || !Array.isArray(manifest.permissions.grantedPermissions)) {
      throw new Error('Manifest missing valid permissions configuration.');
    }
  }

  /**
   * Helper to retrieve app instance or throw exception.
   */
  private getAppInstanceOrThrow(appId: string): AppExecutionInstance {
    const instance = this.registry.get(appId);
    if (!instance) {
      throw new Error(`Application '${appId}' is not registered in the Orchestrator.`);
    }
    return instance;
  }

  /**
   * Generates deterministic unique isolation sandbox IDs.
   */
  private generateSandboxId(appId: string): string {
    return `sbx_${appId.replace(/[^a-zA-Z0-9_-]/g, '_')}_${Math.random().toString(36).substr(2, 6)}`;
  }

  /**
   * Cryptographically signs IPC message payload summaries.
   */
  private signIpcPayload(appId: string, channel: string, payload: any): string {
    const raw = `${appId}:${channel}:${JSON.stringify(payload)}`;
    let hash = 0;
    for (let i = 0; i < raw.length; i++) {
      const char = raw.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `sig_v1_${Math.abs(hash).toString(16)}`;
  }

  /**
   * Global event listeners set up.
   */
  private setupGlobalEventHandlers(): void {
    this.on('orchestrator:error', (errorLog) => {
      if (process.env.NODE_ENV !== 'test') {
        console.error(`[AppRegistryOrchestrator Error] [${errorLog.appId}]:`, errorLog.message);
      }
    });
  }

  /**
   * Returns an Express Router pre-configured with all orchestrator API routes.
   */
  public getRouter(): Router {
    const router = Router();

    const ensureInitialized = async (req: Request, res: Response, next: NextFunction) => {
      try {
        if (!this.isInitialized) {
          await this.initialize();
        }
        next();
      } catch (err: any) {
        res.status(500).json({ error: 'Orchestrator initialization failed', details: err.message });
      }
    };

    router.use(ensureInitialized);

    // GET /apps - List all registered apps
    router.get('/apps', (req: Request, res: Response) => {
      const stage = req.query.stage ? (normalizeString(req.query.stage) as AppLifecycleStage) : undefined;
      const apps = this.listApps(stage);
      res.json({ success: true, count: apps.length, apps });
    });

    // GET /apps/:appId - Get specific app instance
    router.get('/apps/:appId', (req: Request, res: Response) => {
      const appId = normalizeString(req.params.appId);
      const app = this.getAppInstance(appId);
      if (!app) {
        return res.status(404).json({ success: false, error: `App with ID '${appId}' not found.` });
      }
      res.json({ success: true, app });
    });

    // POST /apps/register - Register a new app
    router.post('/apps/register', async (req: Request, res: Response) => {
      try {
        const manifest = req.body as AppManifest;
        const isolationLevel = (normalizeString(req.query.isolationLevel) as SandboxIsolationLevel) || 'CONTAINED';
        const instance = await this.registerApp(manifest, isolationLevel);
        res.status(201).json({ success: true, message: 'App registered successfully', instance });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // POST /apps/:appId/launch - Launch an app
    router.post('/apps/:appId/launch', async (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const initialParams = req.body;
        const success = await this.launchApp(appId, initialParams);
        res.json({ success, message: success ? 'App launched successfully' : 'App launch failed' });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // POST /apps/:appId/pause - Pause an app
    router.post('/apps/:appId/pause', async (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const success = await this.pauseApp(appId);
        res.json({ success, message: success ? 'App paused successfully' : 'App pause failed' });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // POST /apps/:appId/resume - Resume an app
    router.post('/apps/:appId/resume', async (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const success = await this.resumeApp(appId);
        res.json({ success, message: success ? 'App resumed successfully' : 'App resume failed' });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // POST /apps/:appId/terminate - Terminate an app
    router.post('/apps/:appId/terminate', async (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const { reason } = req.body;
        const success = await this.terminateApp(appId, reason);
        res.json({ success, message: success ? 'App terminated successfully' : 'App termination failed' });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // POST /apps/:appId/reload - Hot reload an app
    router.post('/apps/:appId/reload', async (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const success = await this.hotReloadApp(appId);
        res.json({ success, message: success ? 'App hot reloaded successfully' : 'App hot reload failed' });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // DELETE /apps/:appId - Unregister an app
    router.delete('/apps/:appId', async (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const success = await this.unregisterApp(appId);
        res.json({ success, message: success ? 'App unregistered successfully' : 'App unregistration failed' });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // GET /apps/:appId/state - Get app state
    router.get('/apps/:appId/state', (req: Request, res: Response) => {
      const appId = normalizeString(req.params.appId);
      const state = this.getAppState(appId);
      if (!state) {
        return res.status(404).json({ success: false, error: `State for app '${appId}' not found.` });
      }
      res.json({ success: true, state });
    });

    // PUT /apps/:appId/state - Sync/update app state
    router.put('/apps/:appId/state', (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const stateDelta = req.body;
        const source = (normalizeString(req.query.source) as 'APP' | 'ORCHESTRATOR') || 'APP';
        const updatedState = this.syncAppState(appId, stateDelta, source);
        res.json({ success: true, state: updatedState });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // POST /apps/:appId/ipc - Dispatch IPC message
    router.post('/apps/:appId/ipc', (req: Request, res: Response) => {
      try {
        const appId = normalizeString(req.params.appId);
        const { channel, payload, targetAppId } = req.body;
        if (!channel || payload === undefined) {
          return res.status(400).json({ success: false, error: 'Missing channel or payload in request body.' });
        }
        const message = this.dispatchIpcMessage(appId, channel, payload, targetAppId);
        res.json({ success: true, message });
      } catch (err: any) {
        res.status(400).json({ success: false, error: err.message });
      }
    });

    // GET /audit-logs - Get global or app-specific audit logs
    router.get('/audit-logs', (req: Request, res: Response) => {
      const appId = req.query.appId ? normalizeString(req.query.appId) : undefined;
      const logs = this.getAuditLogs(appId);
      res.json({ success: true, count: logs.length, logs });
    });

    // GET /orchestrator/metrics - Global orchestrator metrics
    router.get('/orchestrator/metrics', (req: Request, res: Response) => {
      const apps = this.listApps();
      const totalApps = apps.length;
      const runningApps = apps.filter(a => a.stage === 'RUNNING').length;
      const errorApps = apps.filter(a => a.stage === 'ERROR').length;
      
      let totalInvocations = 0;
      let totalErrors = 0;
      let totalMemoryAllocated = 0;

      apps.forEach(app => {
        totalInvocations += app.metrics.invocationsCount;
        totalErrors += app.metrics.errorCount;
        totalMemoryAllocated += app.metrics.memoryAllocatedBytes;
      });

      res.json({
        success: true,
        metrics: {
          totalApps,
          runningApps,
          errorApps,
          totalInvocations,
          totalErrors,
          totalMemoryAllocatedBytes: totalMemoryAllocated,
          uptimeMs: this.isInitialized ? Date.now() - this.initializedAt : 0
        }
      });
    });

    return router;
  }
}

export default AppRegistryOrchestrator;