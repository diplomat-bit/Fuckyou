import { EventEmitter } from 'events';
import { Router, Request, Response, NextFunction } from 'express';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export type AppCategory = 
  | 'banking'
  | 'trading'
  | 'sovereign'
  | 'government'
  | 'ai-agent'
  | 'real-estate'
  | 'treasury'
  | 'tax-liens'
  | 'analytics'
  | 'security'
  | 'utility';

export type AppStatus = 'uninitialized' | 'initializing' | 'active' | 'degraded' | 'disabled' | 'error';

export interface AppPermissions {
  rolesAllowed: string[];
  requiredScopes: string[];
  requiresMultiFactor: boolean;
  governmentClearanceLevel?: 'public' | 'confidential' | 'secret' | 'top-secret';
}

export interface AppMetric {
  appId: string;
  timestamp: number;
  cpuUsage: number;
  memoryUsageMb: number;
  activeRequests: number;
  errorRate: number;
  latencyMs: number;
}

export interface AppDefinition {
  id: string;
  name: string;
  version: string;
  description: string;
  category: AppCategory;
  icon?: string;
  routePrefix: string;
  entryPoint: string;
  status: AppStatus;
  permissions: AppPermissions;
  dependencies?: string[];
  metadata?: Record<string, unknown>;
  healthCheckUrl?: string;
  enabled: boolean;
}

export interface AppHookHandler {
  onBeforeRegister?: (app: AppDefinition) => Promise<boolean>;
  onAfterRegister?: (app: AppDefinition) => Promise<void>;
  onBeforeStatusChange?: (appId: string, oldStatus: AppStatus, newStatus: AppStatus) => Promise<boolean>;
  onAfterStatusChange?: (appId: string, oldStatus: AppStatus, newStatus: AppStatus) => Promise<void>;
  onUnregister?: (appId: string) => Promise<void>;
}

export interface AppRegistryConfig {
  autoInitialize: boolean;
  strictDependencyChecking: boolean;
  healthCheckIntervalMs: number;
  maxAppLimit: number;
  enableTelemetry: boolean;
  defaultPermissions?: Partial<AppPermissions>;
}

export interface AppRegistrationResult {
  success: boolean;
  appId: string;
  status: AppStatus;
  message?: string;
  timestamp: Date;
}

// ============================================================================
// DEFAULT CONFIGURATION
// ============================================================================

const DEFAULT_CONFIG: AppRegistryConfig = {
  autoInitialize: true,
  strictDependencyChecking: true,
  healthCheckIntervalMs: 30000,
  maxAppLimit: 500,
  enableTelemetry: true,
  defaultPermissions: {
    rolesAllowed: ['user', 'admin', 'sovereign-operator'],
    requiredScopes: ['read', 'write'],
    requiresMultiFactor: false,
    governmentClearanceLevel: 'public',
  },
};

// ============================================================================
// APP REGISTRY SERVICE
// ============================================================================

export class AppRegistryService extends EventEmitter {
  private static instance: AppRegistryService;
  private apps: Map<string, AppDefinition> = new Map();
  private metrics: Map<string, AppMetric[]> = new Map();
  private hooks: Map<string, AppHookHandler> = new Map();
  private config: AppRegistryConfig;
  private healthCheckTimer: NodeJS.Timeout | null = null;
  private initialized = false;

  private constructor(config?: Partial<AppRegistryConfig>) {
    super();
    this.config = { ...DEFAULT_CONFIG, ...config };
  }

  public static getInstance(config?: Partial<AppRegistryConfig>): AppRegistryService {
    if (!AppRegistryService.instance) {
      AppRegistryService.instance = new AppRegistryService(config);
    }
    return AppRegistryService.instance;
  }

  /**
   * Initializes the AppRegistry Service.
   */
  public async initialize(): Promise<void> {
    if (this.initialized) return;

    this.emit('system:initializing');
    this.registerDefaultSystemApps();

    if (this.config.healthCheckIntervalMs > 0) {
      this.startHealthCheckLoop();
    }

    this.initialized = true;
    this.emit('system:ready', { registeredAppsCount: this.apps.size });
  }

  /**
   * Register a new App/Micro-service module into the registry.
   */
  public async registerApp(appDef: Omit<AppDefinition, 'status'> & { status?: AppStatus }): Promise<AppRegistrationResult> {
    const appId = appDef.id;

    if (this.apps.size >= this.config.maxAppLimit) {
      return {
        success: false,
        appId,
        status: 'error',
        message: `Registry limit reached (${this.config.maxAppLimit} apps)`,
        timestamp: new Date(),
      };
    }

    const fullAppDef: AppDefinition = {
      ...appDef,
      status: appDef.status || 'uninitialized',
      permissions: {
        ...this.config.defaultPermissions,
        ...appDef.permissions,
      },
      dependencies: appDef.dependencies || [],
      enabled: appDef.enabled !== undefined ? appDef.enabled : true,
    };

    // Check dependencies if strict checking is enabled
    if (this.config.strictDependencyChecking && fullAppDef.dependencies) {
      const missingDeps = fullAppDef.dependencies.filter(depId => !this.apps.has(depId));
      if (missingDeps.length > 0) {
        return {
          success: false,
          appId,
          status: 'error',
          message: `Missing required dependencies: ${missingDeps.join(', ')}`,
          timestamp: new Date(),
        };
      }
    }

    // Lifecycle Hook Execution: onBeforeRegister
    const appHooks = this.hooks.get(appId);
    if (appHooks?.onBeforeRegister) {
      const canProceed = await appHooks.onBeforeRegister(fullAppDef);
      if (!canProceed) {
        return {
          success: false,
          appId,
          status: 'disabled',
          message: 'Registration rejected by beforeRegister hook',
          timestamp: new Date(),
        };
      }
    }

    this.apps.set(appId, fullAppDef);
    await this.setAppStatus(appId, 'active');

    if (appHooks?.onAfterRegister) {
      await appHooks.onAfterRegister(fullAppDef);
    }

    this.emit('app:registered', fullAppDef);

    return {
      success: true,
      appId,
      status: 'active',
      message: 'App successfully registered',
      timestamp: new Date(),
    };
  }

  /**
   * Unregister an application.
   */
  public async unregisterApp(appId: string): Promise<boolean> {
    const app = this.apps.get(appId);
    if (!app) return false;

    // Check if other apps depend on this app
    const dependents = Array.from(this.apps.values()).filter(a => a.dependencies?.includes(appId));
    if (dependents.length > 0) {
      const dependentIds = dependents.map(d => d.id).join(', ');
      throw new Error(`Cannot unregister '${appId}'. The following apps depend on it: ${dependentIds}`);
    }

    const appHooks = this.hooks.get(appId);
    if (appHooks?.onUnregister) {
      await appHooks.onUnregister(appId);
    }

    this.apps.delete(appId);
    this.metrics.delete(appId);
    this.hooks.delete(appId);

    this.emit('app:unregistered', { appId });
    return true;
  }

  /**
   * Retrieve a specific registered app definition.
   */
  public getApp(appId: string): AppDefinition | undefined {
    return this.apps.get(appId);
  }

  /**
   * Retrieve all registered app definitions.
   */
  public getAllApps(): AppDefinition[] {
    return Array.from(this.apps.values());
  }

  /**
   * Get applications by specific category.
   */
  public getAppsByCategory(category: AppCategory): AppDefinition[] {
    return this.getAllApps().filter(app => app.category === category);
  }

  /**
   * Update the operational status of a registered app.
   */
  public async setAppStatus(appId: string, status: AppStatus): Promise<boolean> {
    const app = this.apps.get(appId);
    if (!app) return false;

    const oldStatus = app.status;
    if (oldStatus === status) return true;

    const appHooks = this.hooks.get(appId);
    if (appHooks?.onBeforeStatusChange) {
      const allowed = await appHooks.onBeforeStatusChange(appId, oldStatus, status);
      if (!allowed) return false;
    }

    app.status = status;
    this.apps.set(appId, app);

    if (appHooks?.onAfterStatusChange) {
      await appHooks.onAfterStatusChange(appId, oldStatus, status);
    }

    this.emit('app:statusChanged', { appId, oldStatus, newStatus: status });
    return true;
  }

  /**
   * Register hook handlers for a specific app ID.
   */
  public registerHooks(appId: string, hookHandler: AppHookHandler): void {
    this.hooks.set(appId, hookHandler);
  }

  /**
   * Push telemetry metric for a specific app.
   */
  public recordMetric(metric: AppMetric): void {
    if (!this.config.enableTelemetry) return;

    const list = this.metrics.get(metric.appId) || [];
    list.push(metric);

    // Keep last 100 metrics
    if (list.length > 100) list.shift();

    this.metrics.set(metric.appId, list);
    this.emit('app:metricRecorded', metric);
  }

  /**
   * Get telemetry metrics for an app.
   */
  public getMetrics(appId: string): AppMetric[] {
    return this.metrics.get(appId) || [];
  }

  /**
   * Order applications topologically based on dependencies.
   */
  public getExecutionOrder(): AppDefinition[] {
    const visited = new Set<string>();
    const order: AppDefinition[] = [];

    const visit = (appId: string) => {
      if (visited.has(appId)) return;
      visited.add(appId);

      const app = this.apps.get(appId);
      if (!app) return;

      if (app.dependencies) {
        for (const depId of app.dependencies) {
          visit(depId);
        }
      }
      order.push(app);
    };

    for (const appId of this.apps.keys()) {
      visit(appId);
    }

    return order;
  }

  /**
   * Register default framework applications/modules.
   */
  private registerDefaultSystemApps(): void {
    const coreApps: Array<Omit<AppDefinition, 'status'>> = [
      {
        id: 'sovereign-core',
        name: 'Sovereign Core Engine',
        version: '1.0.0',
        description: 'Primary sovereign protocol & intelligence architecture',
        category: 'sovereign',
        routePrefix: '/api/sovereign',
        entryPoint: 'api/sovereign.ts',
        permissions: { rolesAllowed: ['admin', 'sovereign-operator'], requiredScopes: ['admin:full'], requiresMultiFactor: true, governmentClearanceLevel: 'top-secret' },
        enabled: true,
      },
      {
        id: 'alpaca-trading',
        name: 'Alpaca Brokerage Terminal',
        version: '2.1.0',
        description: 'Automated equity & crypto execution bridge',
        category: 'trading',
        routePrefix: '/api/alpaca',
        entryPoint: 'api/alpaca.ts',
        dependencies: ['sovereign-core'],
        permissions: { rolesAllowed: ['trader', 'admin'], requiredScopes: ['trade:execute'], requiresMultiFactor: true },
        enabled: true,
      },
      {
        id: 'citi-connect',
        name: 'Citi Treasury Connect',
        version: '1.4.0',
        description: 'Institutional treasury payment & liquidity bridge',
        category: 'banking',
        routePrefix: '/api/citi',
        entryPoint: 'api/citi.ts',
        dependencies: ['sovereign-core'],
        permissions: { rolesAllowed: ['treasurer', 'admin'], requiredScopes: ['treasury:transfers'], requiresMultiFactor: true },
        enabled: true,
      },
      {
        id: 'real-estate-registry',
        name: 'Deed & Escrow Marketplace',
        version: '1.0.0',
        description: 'Tokenized asset registry & GIS spatial engine',
        category: 'real-estate',
        routePrefix: '/api/real-estate',
        entryPoint: 'api/real-estate.ts',
        permissions: { rolesAllowed: ['user', 'admin'], requiredScopes: ['assets:read', 'assets:write'], requiresMultiFactor: false },
        enabled: true,
      },
      {
        id: 'ai-agent-factory',
        name: 'AI Agent Swarm Factory',
        version: '3.0.0',
        description: 'Autonomous neural agent orchestration pipeline',
        category: 'ai-agent',
        routePrefix: '/api/ai',
        entryPoint: 'api/ai.ts',
        permissions: { rolesAllowed: ['user', 'admin'], requiredScopes: ['ai:generate'], requiresMultiFactor: false },
        enabled: true,
      },
    ];

    for (const app of coreApps) {
      this.registerApp(app).catch(err => {
        console.error(`Failed to register core app ${app.id}:`, err);
      });
    }
  }

  private startHealthCheckLoop(): void {
    this.healthCheckTimer = setInterval(async () => {
      for (const app of this.apps.values()) {
        if (!app.enabled || app.status === 'disabled') continue;

        try {
          if (app.healthCheckUrl) {
            // Simulated health check execution
            const isHealthy = true; // In production: await fetch(app.healthCheckUrl)
            await this.setAppStatus(app.id, isHealthy ? 'active' : 'degraded');
          }
        } catch {
          await this.setAppStatus(app.id, 'degraded');
        }
      }
    }, this.config.healthCheckIntervalMs);
  }

  public destroy(): void {
    if (this.healthCheckTimer) {
      clearInterval(this.healthCheckTimer);
      this.healthCheckTimer = null;
    }
    this.apps.clear();
    this.metrics.clear();
    this.hooks.clear();
    this.removeAllListeners();
    this.initialized = false;
  }
}

// ============================================================================
// EXPRESS ROUTER INTEGRATION / MIDDLEWARE FACTORY
// ============================================================================

export interface ExpressLikeRequest {
  path: string;
  method: string;
  user?: {
    roles: string[];
    scopes: string[];
    mfaAuthenticated?: boolean;
    clearanceLevel?: 'public' | 'confidential' | 'secret' | 'top-secret';
  };
}

export interface ExpressLikeResponse {
  status: (code: number) => ExpressLikeResponse;
  json: (data: unknown) => void;
}

export type ExpressLikeNext = (err?: unknown) => void;

/**
 * Express middleware to enforce permissions based on AppRegistry metadata.
 */
export function createAppRegistryMiddleware(registry = AppRegistryService.getInstance()) {
  return async (req: ExpressLikeRequest, res: ExpressLikeResponse, next: ExpressLikeNext) => {
    const apps = registry.getAllApps();
    const matchedApp = apps.find(app => req.path.startsWith(app.routePrefix));

    if (!matchedApp) {
      return next();
    }

    if (!matchedApp.enabled || matchedApp.status === 'disabled') {
      return res.status(503).json({
        error: 'Service Unavailable',
        message: `App '${matchedApp.name}' is currently disabled or undergoing maintenance.`,
      });
    }

    const permissions = matchedApp.permissions;
    const user = req.user;

    if (!user) {
      return res.status(401).json({ error: 'Unauthorized', message: 'Authentication required for this module.' });
    }

    // Role verification
    const hasRole = permissions.rolesAllowed.some(role => user.roles.includes(role));
    if (!hasRole) {
      return res.status(403).json({ error: 'Forbidden', message: 'Insufficient role permissions.' });
    }

    // MFA Verification
    if (permissions.requiresMultiFactor && !user.mfaAuthenticated) {
      return res.status(403).json({ error: 'MFA Required', message: 'Multi-factor authentication required for this route.' });
    }

    return next();
  };
}

/**
 * Express Router exposing the AppRegistry Service endpoints.
 */
export function createAppRegistryRouter(service = AppRegistryService.getInstance()): Router {
  const router = Router();

  // GET /apps - List all registered applications
  router.get('/apps', (req: Request, res: Response) => {
    try {
      const category = req.query.category as string;
      if (category) {
        const apps = service.getAppsByCategory(category as any);
        return res.json({ success: true, count: apps.length, apps });
      }
      const apps = service.getAllApps();
      return res.json({ success: true, count: apps.length, apps });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /apps/:id - Get a specific application definition
  router.get('/apps/:id', (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const app = service.getApp(id);
      if (!app) {
        return res.status(404).json({ success: false, error: `App with ID '${id}' not found.` });
      }
      return res.json({ success: true, app });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /apps - Register a new application
  router.post('/apps', async (req: Request, res: Response) => {
    try {
      const appDef = req.body;
      if (!appDef.id || !appDef.name || !appDef.routePrefix || !appDef.entryPoint) {
        return res.status(400).json({
          success: false,
          error: 'Missing required fields: id, name, routePrefix, entryPoint are required.',
        });
      }
      const result = await service.registerApp(appDef);
      if (!result.success) {
        return res.status(400).json(result);
      }
      return res.status(201).json(result);
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /apps/:id - Unregister an application
  router.delete('/apps/:id', async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const success = await service.unregisterApp(id);
      if (!success) {
        return res.status(404).json({ success: false, error: `App with ID '${id}' not found.` });
      }
      return res.json({ success: true, message: `App '${id}' successfully unregistered.` });
    } catch (error: any) {
      return res.status(400).json({ success: false, error: error.message });
    }
  });

  // PUT /apps/:id/status - Update application status
  router.put('/apps/:id/status', async (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { status } = req.body;
      if (!status) {
        return res.status(400).json({ success: false, error: 'Status field is required.' });
      }
      const success = await service.setAppStatus(id, status);
      if (!success) {
        return res.status(400).json({ success: false, error: `Failed to update status for app '${id}'.` });
      }
      return res.json({ success: true, message: `Status updated to '${status}'` });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /apps/:id/metrics - Get telemetry metrics
  router.get('/apps/:id/metrics', (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const metrics = service.getMetrics(id);
      return res.json({ success: true, appId: id, metrics });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /apps/:id/metrics - Record a new metric
  router.post('/apps/:id/metrics', (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const { cpuUsage, memoryUsageMb, activeRequests, errorRate, latencyMs } = req.body;
      const metric = {
        appId: id,
        timestamp: Date.now(),
        cpuUsage: cpuUsage ?? 0,
        memoryUsageMb: memoryUsageMb ?? 0,
        activeRequests: activeRequests ?? 0,
        errorRate: errorRate ?? 0,
        latencyMs: latencyMs ?? 0,
      };
      service.recordMetric(metric);
      return res.status(201).json({ success: true, message: 'Metric recorded successfully', metric });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /execution-order - Get topological execution order
  router.get('/execution-order', (req: Request, res: Response) => {
    try {
      const order = service.getExecutionOrder();
      return res.json({ success: true, order });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /health - Get overall system health status
  router.get('/health', (req: Request, res: Response) => {
    try {
      const apps = service.getAllApps();
      const summary = apps.map(app => ({
        id: app.id,
        name: app.name,
        status: app.status,
        enabled: app.enabled,
      }));
      const allHealthy = apps.every(app => !app.enabled || app.status === 'active');
      return res.json({
        success: true,
        status: allHealthy ? 'healthy' : 'degraded',
        timestamp: new Date(),
        apps: summary,
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}

// ============================================================================
// HELPER HOOKS & CONVENIENCE FUNCTIONS
// ============================================================================

export function initializeAppRegistry(config?: Partial<AppRegistryConfig>): AppRegistryService {
  const service = AppRegistryService.getInstance(config);
  service.initialize().catch(err => {
    console.error('Failed to initialize AppRegistryService:', err);
  });
  return service;
}

export function getAppRegistry(): AppRegistryService {
  return AppRegistryService.getInstance();
}

export function registerModuleApp(appDef: Omit<AppDefinition, 'status'>): Promise<AppRegistrationResult> {
  return AppRegistryService.getInstance().registerApp(appDef);
}

// Export default instance accessor
export default AppRegistryService;