

// --- CONSOLIDATED FROM: ./api/AppRegistry/AppLifecycleManager.ts ---

import { EventEmitter } from 'events';
import express, { Router, Request, Response } from 'express';

export type AppState =
  | 'uninitialized'
  | 'initializing'
  | 'initialized'
  | 'starting'
  | 'running'
  | 'degraded'
  | 'unhealthy'
  | 'reloading'
  | 'stopping'
  | 'stopped'
  | 'failed';

export interface AppHealthCheckResult {
  status: 'healthy' | 'degraded' | 'unhealthy';
  timestamp: number;
  latencyMs: number;
  details?: Record<string, unknown>;
  error?: string;
}

export interface AppManifest {
  id: string;
  name: string;
  version: string;
  description?: string;
  dependencies?: string[];
  healthCheckIntervalMs?: number;
  healthCheckTimeoutMs?: number;
  shutdownTimeoutMs?: number;
  metadata?: Record<string, unknown>;
  autoRecovery?: {
    enabled: boolean;
    maxAttempts?: number;
    backoffMs?: number;
  };
}

export interface LoggerLike {
  info(message: string, ...args: unknown[]): void;
  warn(message: string, ...args: unknown[]): void;
  error(message: string, ...args: unknown[]): void;
  debug(message: string, ...args: unknown[]): void;
}

export interface AppContext {
  appId: string;
  manifest: AppManifest;
  state: AppState;
  config: Record<string, unknown>;
  logger: LoggerLike;
}

export interface AppHooks {
  onInit?: (context: AppContext) => Promise<void>;
  onStart?: (context: AppContext) => Promise<void>;
  onHealthCheck?: (context: AppContext) => Promise<AppHealthCheckResult>;
  onReload?: (context: AppContext, newConfig?: Record<string, unknown>) => Promise<void>;
  onStop?: (context: AppContext) => Promise<void>;
}

export interface MicroAppRegistration {
  manifest: AppManifest;
  hooks: AppHooks;
  config?: Record<string, unknown>;
}

export interface AppMetrics {
  bootTimeMs?: number;
  reloadTimeMs?: number;
  averageHealthCheckLatencyMs: number;
  totalHealthChecks: number;
  failedHealthChecks: number;
  totalRestarts: number;
}

export interface AuditLogEntry {
  timestamp: number;
  appId: string;
  event: string;
  details?: Record<string, unknown>;
}

interface InternalAppEntry {
  manifest: AppManifest;
  hooks: AppHooks;
  state: AppState;
  config: Record<string, unknown>;
  lastHealthResult?: AppHealthCheckResult;
  healthTimer?: NodeJS.Timeout;
  registeredAt: number;
  startedAt?: number;
  consecutiveFailures: number;
  healthHistory: AppHealthCheckResult[];
  metrics: AppMetrics;
}

export class AppLifecycleManager extends EventEmitter {
  private static instance: AppLifecycleManager | null = null;
  private apps: Map<string, InternalAppEntry> = new Map();
  private logger: LoggerLike;
  private isShuttingDown: boolean = false;
  private auditTrail: AuditLogEntry[] = [];
  private startTime: number = Date.now();
  private maxAuditTrailSize: number = 200;
  private maxHealthHistorySize: number = 15;

  private constructor(logger?: LoggerLike) {
    super();
    this.logger = logger || {
      info: (msg, ...args) => console.log(`[AppLifecycleManager][INFO] ${msg}`, ...args),
      warn: (msg, ...args) => console.warn(`[AppLifecycleManager][WARN] ${msg}`, ...args),
      error: (msg, ...args) => console.error(`[AppLifecycleManager][ERROR] ${msg}`, ...args),
      debug: (msg, ...args) => console.debug(`[AppLifecycleManager][DEBUG] ${msg}`, ...args),
    };
  }

  public static getInstance(logger?: LoggerLike): AppLifecycleManager {
    if (!AppLifecycleManager.instance) {
      AppLifecycleManager.instance = new AppLifecycleManager(logger);
    }
    return AppLifecycleManager.instance;
  }

  /**
   * Register a new micro-app into the lifecycle manager.
   */
  public registerApp(registration: MicroAppRegistration): void {
    const { manifest, hooks, config = {} } = registration;

    if (this.apps.has(manifest.id)) {
      throw new Error(`Micro-app with ID '${manifest.id}' is already registered.`);
    }

    const entry: InternalAppEntry = {
      manifest: {
        healthCheckIntervalMs: 15000,
        healthCheckTimeoutMs: 5000,
        shutdownTimeoutMs: 10000,
        dependencies: [],
        autoRecovery: {
          enabled: true,
          maxAttempts: 3,
          backoffMs: 5000,
        },
        ...manifest,
      },
      hooks,
      state: 'uninitialized',
      config,
      registeredAt: Date.now(),
      consecutiveFailures: 0,
      healthHistory: [],
      metrics: {
        averageHealthCheckLatencyMs: 0,
        totalHealthChecks: 0,
        failedHealthChecks: 0,
        totalRestarts: 0,
      },
    };

    this.apps.set(manifest.id, entry);
    this.logAudit(manifest.id, 'registered', { name: manifest.name, version: manifest.version });
    this.logger.info(`Registered micro-app '${manifest.id}' (${manifest.name} v${manifest.version})`);
    this.emit('appRegistered', manifest.id, entry.manifest);
  }

  /**
   * Retrieve state of a specific app.
   */
  public getAppState(appId: string): AppState | undefined {
    return this.apps.get(appId)?.state;
  }

  /**
   * Retrieve full details of registered apps.
   */
  public getAppDetails(appId: string): Omit<InternalAppEntry, 'healthTimer'> | undefined {
    const entry = this.apps.get(appId);
    if (!entry) return undefined;
    const { healthTimer, ...rest } = entry;
    return rest;
  }

  /**
   * Get list of all registered app IDs.
   */
  public getAllAppIds(): string[] {
    return Array.from(this.apps.keys());
  }

  /**
   * Initialize and start a registered micro-app including its dependencies.
   */
  public async bootApp(appId: string): Promise<void> {
    const entry = this.apps.get(appId);
    if (!entry) {
      throw new Error(`Cannot boot unknown app '${appId}'`);
    }

    if (entry.state === 'running') {
      this.logger.debug(`App '${appId}' is already running.`);
      return;
    }

    const bootStart = Date.now();

    // Resolve dependencies first
    for (const depId of entry.manifest.dependencies || []) {
      const depEntry = this.apps.get(depId);
      if (!depEntry) {
        throw new Error(`Dependency '${depId}' for app '${appId}' is missing from registry.`);
      }
      if (depEntry.state !== 'running') {
        this.logger.info(`Booting dependency '${depId}' for '${appId}'...`);
        await this.bootApp(depId);
      }
    }

    // Initialize Phase
    await this.transitionState(appId, 'initializing');
    const context = this.createContext(entry);

    try {
      if (entry.hooks.onInit) {
        await entry.hooks.onInit(context);
      }
      await this.transitionState(appId, 'initialized');

      // Start Phase
      await this.transitionState(appId, 'starting');
      if (entry.hooks.onStart) {
        await entry.hooks.onStart(context);
      }

      entry.startedAt = Date.now();
      entry.metrics.bootTimeMs = Date.now() - bootStart;
      await this.transitionState(appId, 'running');

      this.startHealthChecks(appId);
      this.logAudit(appId, 'booted', { bootTimeMs: entry.metrics.bootTimeMs });
      this.logger.info(`Micro-app '${appId}' successfully booted in ${entry.metrics.bootTimeMs}ms.`);
    } catch (error: any) {
      this.logger.error(`Failed to boot micro-app '${appId}':`, error);
      await this.transitionState(appId, 'failed');
      this.logAudit(appId, 'boot_failed', { error: error?.message || String(error) });
      await this.handleAppFailure(appId, error?.message || String(error));
      throw error;
    }
  }

  /**
   * Boot all registered micro-apps in topological order according to dependencies.
   */
  public async bootAll(): Promise<void> {
    this.logger.info('Initiating boot process for all registered micro-apps...');
    const order = this.resolveDependencyTree();

    for (const appId of order) {
      try {
        await this.bootApp(appId);
      } catch (err) {
        this.logger.error(`Boot order interrupted by failure in app '${appId}'`, err);
        throw err;
      }
    }
  }

  /**
   * Hot-reload a micro-app by re-running initialization and reload hooks with optional updated config.
   */
  public async hotReloadApp(appId: string, newConfig?: Record<string, unknown>): Promise<void> {
    const entry = this.apps.get(appId);
    if (!entry) {
      throw new Error(`Cannot hot-reload unknown app '${appId}'`);
    }

    const reloadStart = Date.now();
    this.logger.info(`Initiating hot-reload for micro-app '${appId}'...`);
    const previousState = entry.state;
    await this.transitionState(appId, 'reloading');

    if (newConfig) {
      entry.config = { ...entry.config, ...newConfig };
    }

    const context = this.createContext(entry);

    try {
      if (entry.hooks.onReload) {
        await entry.hooks.onReload(context, newConfig);
      } else {
        // Fallback reload strategy: re-trigger onInit
        if (entry.hooks.onInit) {
          await entry.hooks.onInit(context);
        }
      }

      entry.metrics.reloadTimeMs = Date.now() - reloadStart;
      await this.transitionState(appId, 'running');
      this.logAudit(appId, 'reloaded', { reloadTimeMs: entry.metrics.reloadTimeMs });
      this.logger.info(`Micro-app '${appId}' hot-reloaded successfully in ${entry.metrics.reloadTimeMs}ms.`);
      this.emit('appReloaded', appId);
    } catch (error: any) {
      this.logger.error(`Hot-reload failed for micro-app '${appId}':`, error);
      await this.transitionState(appId, previousState === 'running' ? 'degraded' : 'failed');
      this.logAudit(appId, 'reload_failed', { error: error?.message || String(error) });
      throw error;
    }
  }

  /**
   * Run manual health check on an app.
   */
  public async checkHealth(appId: string): Promise<AppHealthCheckResult> {
    const entry = this.apps.get(appId);
    if (!entry) {
      throw new Error(`Cannot check health for unknown app '${appId}'`);
    }

    const startTime = Date.now();
    const context = this.createContext(entry);

    let result: AppHealthCheckResult;

    try {
      if (entry.hooks.onHealthCheck) {
        const timeoutPromise = new Promise<never>((_, reject) =>
          setTimeout(
            () => reject(new Error('Health check timed out')),
            entry.manifest.healthCheckTimeoutMs || 5000
          )
        );

        result = await Promise.race([entry.hooks.onHealthCheck(context), timeoutPromise]);
      } else {
        result = {
          status: 'healthy',
          timestamp: Date.now(),
          latencyMs: Date.now() - startTime,
          details: { message: 'Default auto-pass health check' },
        };
      }
    } catch (err: any) {
      result = {
        status: 'unhealthy',
        timestamp: Date.now(),
        latencyMs: Date.now() - startTime,
        error: err?.message || String(err),
      };
    }

    entry.lastHealthResult = result;
    
    // Update health history
    entry.healthHistory.unshift(result);
    if (entry.healthHistory.length > this.maxHealthHistorySize) {
      entry.healthHistory.pop();
    }

    // Update metrics
    entry.metrics.totalHealthChecks++;
    if (result.status === 'unhealthy') {
      entry.metrics.failedHealthChecks++;
    }
    entry.metrics.averageHealthCheckLatencyMs = Math.round(
      (entry.metrics.averageHealthCheckLatencyMs * (entry.metrics.totalHealthChecks - 1) + result.latencyMs) /
        entry.metrics.totalHealthChecks
    );

    if (result.status === 'unhealthy') {
      entry.consecutiveFailures++;
      this.logAudit(appId, 'health_unhealthy', { error: result.error, consecutiveFailures: entry.consecutiveFailures });
      if (entry.consecutiveFailures >= 3 && entry.state === 'running') {
        await this.transitionState(appId, 'unhealthy');
        await this.handleAppFailure(appId, result.error || 'Consecutive health check failures');
      }
    } else if (result.status === 'degraded' && entry.state === 'running') {
      await this.transitionState(appId, 'degraded');
      this.logAudit(appId, 'health_degraded', { details: result.details });
    } else if (result.status === 'healthy') {
      if (entry.state === 'degraded' || entry.state === 'unhealthy') {
        this.logAudit(appId, 'health_recovered', { latencyMs: result.latencyMs });
        await this.transitionState(appId, 'running');
      }
      entry.consecutiveFailures = 0;
    }

    this.emit('healthCheckCompleted', appId, result);
    return result;
  }

  /**
   * Gracefully stop a running micro-app.
   */
  public async stopApp(appId: string): Promise<void> {
    const entry = this.apps.get(appId);
    if (!entry) return;

    if (entry.state === 'stopped' || entry.state === 'stopping') {
      return;
    }

    this.stopHealthChecks(appId);
    await this.transitionState(appId, 'stopping');

    const context = this.createContext(entry);

    try {
      if (entry.hooks.onStop) {
        const timeout = entry.manifest.shutdownTimeoutMs || 10000;
        const stopPromise = entry.hooks.onStop(context);
        const timeoutPromise = new Promise<void>((_, reject) =>
          setTimeout(() => reject(new Error(`Shutdown timed out after ${timeout}ms`)), timeout)
        );

        await Promise.race([stopPromise, timeoutPromise]);
      }
      await this.transitionState(appId, 'stopped');
      this.logAudit(appId, 'stopped');
      this.logger.info(`Micro-app '${appId}' stopped gracefully.`);
    } catch (error: any) {
      this.logger.error(`Error while stopping micro-app '${appId}':`, error);
      await this.transitionState(appId, 'failed');
      this.logAudit(appId, 'stop_failed', { error: error?.message || String(error) });
    }
  }

  /**
   * Gracefully shutdown all apps in reverse dependency order.
   */
  public async shutdownAll(): Promise<void> {
    if (this.isShuttingDown) return;
    this.isShuttingDown = true;
    this.logger.info('Initiating graceful shutdown of all micro-apps...');

    const order = this.resolveDependencyTree().reverse();

    for (const appId of order) {
      try {
        await this.stopApp(appId);
      } catch (err) {
        this.logger.error(`Error during shutdown sequence for '${appId}'`, err);
      }
    }

    this.logger.info('All micro-apps shut down.');
    this.isShuttingDown = false;
  }

  /**
   * Retrieve the audit trail.
   */
  public getAuditTrail(): AuditLogEntry[] {
    return this.auditTrail;
  }

  /**
   * Start health check polling for an app.
   */
  private startHealthChecks(appId: string): void {
    const entry = this.apps.get(appId);
    if (!entry) return;

    this.stopHealthChecks(appId);

    const interval = entry.manifest.healthCheckIntervalMs || 15000;
    entry.healthTimer = setInterval(async () => {
      if (entry.state === 'running' || entry.state === 'degraded' || entry.state === 'unhealthy') {
        await this.checkHealth(appId);
      }
    }, interval);
  }

  /**
   * Stop health check polling for an app.
   */
  private stopHealthChecks(appId: string): void {
    const entry = this.apps.get(appId);
    if (entry && entry.healthTimer) {
      clearInterval(entry.healthTimer);
      entry.healthTimer = undefined;
    }
  }

  /**
   * Helper to create AppContext.
   */
  private createContext(entry: InternalAppEntry): AppContext {
    return {
      appId: entry.manifest.id,
      manifest: entry.manifest,
      state: entry.state,
      config: entry.config,
      logger: this.logger,
    };
  }

  /**
   * Handle state transitions and emit stateChange events.
   */
  private async transitionState(appId: string, newState: AppState): Promise<void> {
    const entry = this.apps.get(appId);
    if (!entry) return;

    const oldState = entry.state;
    entry.state = newState;
    this.logger.debug(`App '${appId}' state transition: ${oldState} -> ${newState}`);
    this.emit('stateChange', appId, oldState, newState);
  }

  /**
   * Log an event to the audit trail.
   */
  private logAudit(appId: string, event: string, details?: Record<string, unknown>): void {
    this.auditTrail.unshift({
      timestamp: Date.now(),
      appId,
      event,
      details,
    });
    if (this.auditTrail.length > this.maxAuditTrailSize) {
      this.auditTrail.pop();
    }
  }

  /**
   * Handle auto-recovery for failed apps.
   */
  private async handleAppFailure(appId: string, reason: string): Promise<void> {
    const entry = this.apps.get(appId);
    if (!entry) return;

    const recoveryConfig = entry.manifest.autoRecovery;
    if (!recoveryConfig || !recoveryConfig.enabled) {
      return;
    }

    const maxAttempts = recoveryConfig.maxAttempts ?? 3;
    if (entry.consecutiveFailures > maxAttempts) {
      this.logger.error(`App '${appId}' exceeded maximum auto-recovery attempts (${maxAttempts}). Manual intervention required.`);
      this.logAudit(appId, 'recovery_exhausted', { reason, maxAttempts });
      return;
    }

    const backoff = (recoveryConfig.backoffMs ?? 5000) * entry.consecutiveFailures;
    this.logger.warn(`App '${appId}' failed. Scheduling auto-recovery attempt #${entry.consecutiveFailures} in ${backoff}ms...`);
    this.logAudit(appId, 'recovery_scheduled', { attempt: entry.consecutiveFailures, backoffMs: backoff });

    setTimeout(async () => {
      try {
        this.logger.info(`Executing auto-recovery reboot for app '${appId}'...`);
        entry.metrics.totalRestarts++;
        await this.bootApp(appId);
        this.logAudit(appId, 'recovery_success', { attempt: entry.consecutiveFailures });
      } catch (err: any) {
        this.logger.error(`Auto-recovery reboot failed for app '${appId}':`, err);
        this.logAudit(appId, 'recovery_failed', { attempt: entry.consecutiveFailures, error: err?.message || String(err) });
      }
    }, backoff);
  }

  /**
   * Topological sort of app dependencies.
   */
  private resolveDependencyTree(): string[] {
    const visited = new Set<string>();
    const visiting = new Set<string>();
    const order: string[] = [];

    const visit = (appId: string) => {
      if (visiting.has(appId)) {
        throw new Error(`Circular dependency detected involving micro-app '${appId}'`);
      }
      if (!visited.has(appId)) {
        visiting.add(appId);
        const entry = this.apps.get(appId);
        if (entry && entry.manifest.dependencies) {
          for (const depId of entry.manifest.dependencies) {
            if (this.apps.has(depId)) {
              visit(depId);
            }
          }
        }
        visiting.delete(appId);
        visited.add(appId);
        order.push(appId);
      }
    };

    for (const appId of this.apps.keys()) {
      if (!visited.has(appId)) {
        visit(appId);
      }
    }

    return order;
  }

  /**
   * Mask sensitive configuration values.
   */
  private maskConfig(config: Record<string, unknown>): Record<string, unknown> {
    const masked = { ...config };
    const sensitiveKeys = ['password', 'secret', 'token', 'key', 'auth', 'credential', 'private', 'cert'];
    for (const k of Object.keys(masked)) {
      if (sensitiveKeys.some(sk => k.toLowerCase().includes(sk))) {
        masked[k] = '********';
      } else if (typeof masked[k] === 'object' && masked[k] !== null) {
        masked[k] = this.maskConfig(masked[k] as Record<string, unknown>);
      }
    }
    return masked;
  }

  /**
   * Generate Express API routes for managing the lifecycle.
   */
  public createRouter(): Router {
    const router = express.Router();

    // GET /status - Overall system status
    router.get('/status', (req: Request, res: Response) => {
      const allApps = Array.from(this.apps.values());
      const runningApps = allApps.filter(a => a.state === 'running').length;
      const degradedApps = allApps.filter(a => a.state === 'degraded').length;
      const unhealthyApps = allApps.filter(a => a.state === 'unhealthy').length;
      const failedApps = allApps.filter(a => a.state === 'failed').length;

      res.json({
        status: unhealthyApps > 0 || failedApps > 0 ? 'unhealthy' : degradedApps > 0 ? 'degraded' : 'healthy',
        uptimeMs: Date.now() - this.startTime,
        apps: {
          total: this.apps.size,
          running: runningApps,
          degraded: degradedApps,
          unhealthy: unhealthyApps,
          failed: failedApps,
          others: this.apps.size - (runningApps + degradedApps + unhealthyApps + failedApps),
        },
      });
    });

    // GET /apps - List all registered apps
    router.get('/apps', (req: Request, res: Response) => {
      const list = Array.from(this.apps.entries()).map(([id, entry]) => ({
        id,
        name: entry.manifest.name,
        version: entry.manifest.version,
        description: entry.manifest.description,
        state: entry.state,
        dependencies: entry.manifest.dependencies,
        uptimeMs: entry.startedAt ? Date.now() - entry.startedAt : null,
        lastHealthStatus: entry.lastHealthResult?.status || 'unknown',
      }));
      res.json(list);
    });

    // GET /apps/:id - Detailed app information
    router.get('/apps/:id', (req: Request, res: Response) => {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      const entry = this.apps.get(id);
      if (!entry) {
        return res.status(404).json({ error: `App with ID '${id}' not found.` });
      }

      res.json({
        id,
        manifest: entry.manifest,
        state: entry.state,
        config: this.maskConfig(entry.config),
        registeredAt: entry.registeredAt,
        startedAt: entry.startedAt,
        uptimeMs: entry.startedAt ? Date.now() - entry.startedAt : null,
        consecutiveFailures: entry.consecutiveFailures,
        lastHealthResult: entry.lastHealthResult,
        healthHistory: entry.healthHistory,
        metrics: entry.metrics,
      });
    });

    // POST /apps/register - Dynamically register a new app
    router.post('/apps/register', (req: Request, res: Response) => {
      const { manifest, config } = req.body;
      if (!manifest || !manifest.id || !manifest.name || !manifest.version) {
        return res.status(400).json({ error: 'Invalid manifest. id, name, and version are required.' });
      }

      try {
        this.registerApp({
          manifest,
          hooks: {}, // Dynamic registration uses default hooks
          config,
        });
        res.status(201).json({ message: `App '${manifest.id}' registered successfully.` });
      } catch (err: any) {
        res.status(400).json({ error: err.message });
      }
    });

    // POST /apps/:id/boot - Boot a specific app
    router.post('/apps/:id/boot', async (req: Request, res: Response) => {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      try {
        await this.bootApp(id);
        res.json({ message: `App '${id}' booted successfully.` });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST /apps/:id/stop - Stop a specific app
    router.post('/apps/:id/stop', async (req: Request, res: Response) => {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      try {
        await this.stopApp(id);
        res.json({ message: `App '${id}' stopped successfully.` });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST /apps/:id/reload - Hot-reload a specific app
    router.post('/apps/:id/reload', async (req: Request, res: Response) => {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      try {
        await this.hotReloadApp(id, req.body.config);
        res.json({ message: `App '${id}' reloaded successfully.` });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST /apps/:id/health - Trigger manual health check
    router.post('/apps/:id/health', async (req: Request, res: Response) => {
      const id = typeof req.params.id === 'string' ? req.params.id : req.params.id[0];
      try {
        const result = await this.checkHealth(id);
        res.json(result);
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST /apps/boot-all - Boot all apps
    router.post('/apps/boot-all', async (req: Request, res: Response) => {
      try {
        await this.bootAll();
        res.json({ message: 'All apps booted successfully.' });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // POST /apps/shutdown - Shutdown all apps
    router.post('/apps/shutdown', async (req: Request, res: Response) => {
      try {
        await this.shutdownAll();
        res.json({ message: 'All apps shut down successfully.' });
      } catch (err: any) {
        res.status(500).json({ error: err.message });
      }
    });

    // GET /audit-trail - Retrieve audit trail
    router.get('/audit-trail', (req: Request, res: Response) => {
      res.json(this.auditTrail);
    });

    return router;
  }
}

export default AppLifecycleManager;