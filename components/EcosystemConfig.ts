

// --- CONSOLIDATED FROM: ./api/AppRegistry/config/EcosystemConfig.ts ---

/**
 * Oko-main Ecosystem Architecture
 * Path: api/AppRegistry/config/EcosystemConfig.ts
 * Purpose: Configuration module specifying registry defaults, rate limits, sandbox memory caps, and global feature flags.
 * Enhanced with fully integrated API routes, secure validation, and real-time telemetry.
 */

import { Router, Request, Response, NextFunction } from 'express';
import { logger } from '../../utils/logger';
import { AppRegistryAuth } from '../middleware/AppRegistryAuth';

// Interfaces
export interface RateLimitConfig {
  windowMs: number;
  maxRequestsPerWindow: number;
  burstLimit: number;
  penaltyDurationMs: number;
  enableDistributedThrottling: boolean;
}

export interface MemoryCapsConfig {
  maxHeapAllocationMB: number;
  maxStackDepth: number;
  sandboxMemoryLimitMB: number;
  containerMemoryCeilingMB: number;
  garbageCollectionTriggerRatio: number;
}

export interface RegistryDefaults {
  version: string;
  defaultNamespace: string;
  heartbeatIntervalMs: number;
  ttlSeconds: number;
  maxRegisteredServices: number;
  autoDeregisterUnhealthy: boolean;
  isolationLevel: 'strict' | 'sandboxed' | 'shared';
}

export interface GlobalFeatureFlags {
  enableQuantumBridge: boolean;
  enableSovereignLedgerSync: boolean;
  enableAlpacaTradingHub: boolean;
  enableCitiConnectGateway: boolean;
  enableAzureGovCompliance: boolean;
  enableZeroKnowledgeProofs: boolean;
  enableAstraVectorSearch: boolean;
  enableRealEstateTokenization: boolean;
  enableAutomatedLobbyingPipeline: boolean;
  enableTrillionaireStatusTracker: boolean;
  enableStrictRateLimiting: boolean;
  debugMode: boolean;
}

export interface EcosystemConfigSchema {
  environment: 'development' | 'staging' | 'production' | 'sovereign-gov';
  registry: RegistryDefaults;
  rateLimits: Record<string, RateLimitConfig>;
  memoryCaps: MemoryCapsConfig;
  featureFlags: GlobalFeatureFlags;
}

const DEFAULT_ECOSYSTEM_CONFIG: EcosystemConfigSchema = {
  environment: (typeof process !== 'undefined' && process.env?.NODE_ENV as any) || 'development',
  registry: {
    version: '2.5.0-OKO',
    defaultNamespace: 'oko.sovereign.core',
    heartbeatIntervalMs: 15000,
    ttlSeconds: 60,
    maxRegisteredServices: 5000,
    autoDeregisterUnhealthy: true,
    isolationLevel: 'sandboxed',
  },
  rateLimits: {
    global: {
      windowMs: 60000,
      maxRequestsPerWindow: 1200,
      burstLimit: 150,
      penaltyDurationMs: 300000,
      enableDistributedThrottling: true,
    },
    tradingApi: {
      windowMs: 1000,
      maxRequestsPerWindow: 20,
      burstLimit: 5,
      penaltyDurationMs: 60000,
      enableDistributedThrottling: true,
    },
    treasuryApi: {
      windowMs: 60000,
      maxRequestsPerWindow: 100,
      burstLimit: 10,
      penaltyDurationMs: 600000,
      enableDistributedThrottling: true,
    },
    sovereignApi: {
      windowMs: 10000,
      maxRequestsPerWindow: 500,
      burstLimit: 50,
      penaltyDurationMs: 30000,
      enableDistributedThrottling: true,
    },
  },
  memoryCaps: {
    maxHeapAllocationMB: 4096,
    maxStackDepth: 1000,
    sandboxMemoryLimitMB: 512,
    containerMemoryCeilingMB: 8192,
    garbageCollectionTriggerRatio: 0.85,
  },
  featureFlags: {
    enableQuantumBridge: true,
    enableSovereignLedgerSync: true,
    enableAlpacaTradingHub: true,
    enableCitiConnectGateway: true,
    enableAzureGovCompliance: true,
    enableZeroKnowledgeProofs: true,
    enableAstraVectorSearch: true,
    enableRealEstateTokenization: true,
    enableAutomatedLobbyingPipeline: true,
    enableTrillionaireStatusTracker: true,
    enableStrictRateLimiting: true,
    debugMode: typeof process !== 'undefined' && process.env?.NODE_ENV !== 'production',
  },
};

export class EcosystemConfigManager {
  private static instance: EcosystemConfigManager;
  private config: EcosystemConfigSchema;

  private constructor() {
    this.config = this.loadAndHydrateConfig();
  }

  public static getInstance(): EcosystemConfigManager {
    if (!EcosystemConfigManager.instance) {
      EcosystemConfigManager.instance = new EcosystemConfigManager();
    }
    return EcosystemConfigManager.instance;
  }

  private loadAndHydrateConfig(): EcosystemConfigSchema {
    const base: EcosystemConfigSchema = JSON.parse(JSON.stringify(DEFAULT_ECOSYSTEM_CONFIG));

    if (typeof process === 'undefined' || !process.env) {
      return base;
    }

    if (process.env.SANDBOX_MEMORY_LIMIT_MB) {
      const parsed = parseInt(process.env.SANDBOX_MEMORY_LIMIT_MB, 10);
      if (!isNaN(parsed)) base.memoryCaps.sandboxMemoryLimitMB = parsed;
    }

    if (process.env.MAX_HEAP_ALLOCATION_MB) {
      const parsed = parseInt(process.env.MAX_HEAP_ALLOCATION_MB, 10);
      if (!isNaN(parsed)) base.memoryCaps.maxHeapAllocationMB = parsed;
    }

    if (process.env.REGISTRY_NAMESPACE) {
      base.registry.defaultNamespace = process.env.REGISTRY_NAMESPACE;
    }

    if (process.env.FEATURE_QUANTUM_BRIDGE !== undefined) {
      base.featureFlags.enableQuantumBridge = process.env.FEATURE_QUANTUM_BRIDGE === 'true';
    }

    if (process.env.FEATURE_SOVEREIGN_SYNC !== undefined) {
      base.featureFlags.enableSovereignLedgerSync = process.env.FEATURE_SOVEREIGN_SYNC === 'true';
    }

    return base;
  }

  public getConfig(): EcosystemConfigSchema {
    return JSON.parse(JSON.stringify(this.config));
  }

  public getRateLimit(tier: string = 'global'): RateLimitConfig {
    return this.config.rateLimits[tier] || this.config.rateLimits.global;
  }

  public getMemoryCaps(): MemoryCapsConfig {
    return { ...this.config.memoryCaps };
  }

  public getFeatureFlags(): GlobalFeatureFlags {
    return { ...this.config.featureFlags };
  }

  public isFeatureEnabled(flag: keyof GlobalFeatureFlags): boolean {
    return !!this.config.featureFlags[flag];
  }

  public setFeatureFlag(flag: keyof GlobalFeatureFlags, enabled: boolean): void {
    this.config.featureFlags[flag] = enabled;
    logger.info(`Feature flag updated: ${flag} = ${enabled}`, { flag, enabled });
  }

  public updateConfig(partial: Partial<EcosystemConfigSchema>): void {
    this.config = {
      ...this.config,
      ...partial,
      registry: { ...this.config.registry, ...(partial.registry || {}) },
      memoryCaps: { ...this.config.memoryCaps, ...(partial.memoryCaps || {}) },
      featureFlags: { ...this.config.featureFlags, ...(partial.featureFlags || {}) },
      rateLimits: { ...this.config.rateLimits, ...(partial.rateLimits || {}) },
    };
    logger.info('Ecosystem configuration updated successfully.', { config: this.config });
  }

  public validateSandboxThresholds(allocatedMemoryMB: number): boolean {
    return allocatedMemoryMB <= this.config.memoryCaps.sandboxMemoryLimitMB;
  }

  /**
   * Generates and returns an Express Router containing all API routes for managing the ecosystem configuration.
   */
  public getRouter(): Router {
    const router = Router();

    // Middleware to log configuration access
    const configAuditLog = (req: Request, res: Response, next: NextFunction) => {
      logger.info(`Config API Access: ${req.method} ${req.originalUrl} from ${req.ip}`, {
        method: req.method,
        url: req.originalUrl,
        ip: req.ip,
      });
      next();
    };

    router.use(configAuditLog);
    router.use(AppRegistryAuth);

    // GET /api/config - Retrieve full configuration
    router.get('/', (req: Request, res: Response) => {
      try {
        res.status(200).json({
          success: true,
          timestamp: new Date().toISOString(),
          config: this.getConfig(),
        });
      } catch (error: any) {
        logger.error(`Failed to retrieve config: ${error.message}`, error);
        res.status(500).json({ success: false, error: 'Internal Server Error' });
      }
    });

    // POST /api/config - Update partial or full configuration
    router.post('/', (req: Request, res: Response) => {
      try {
        const updates = req.body;
        if (!updates || typeof updates !== 'object') {
          return res.status(400).json({ success: false, error: 'Invalid configuration payload' });
        }

        this.updateConfig(updates);
        res.status(200).json({
          success: true,
          message: 'Ecosystem configuration updated successfully',
          config: this.getConfig(),
        });
      } catch (error: any) {
        logger.error(`Failed to update config: ${error.message}`, error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // GET /api/config/features - Retrieve all feature flags
    router.get('/features', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        featureFlags: this.getFeatureFlags(),
      });
    });

    // POST /api/config/features/:flag - Toggle or set a specific feature flag
    router.post('/features/:flag', (req: Request, res: Response) => {
      try {
        const flag = (Array.isArray(req.params.flag) ? req.params.flag[0] : req.params.flag) as string;
        const { enabled } = req.body;

        if (enabled === undefined || typeof enabled !== 'boolean') {
          return res.status(400).json({ success: false, error: "Field 'enabled' (boolean) is required in body" });
        }

        const flags = this.getFeatureFlags();
        if (!(flag in flags)) {
          return res.status(404).json({ success: false, error: `Feature flag '${flag}' not found` });
        }

        this.setFeatureFlag(flag as keyof GlobalFeatureFlags, enabled);
        res.status(200).json({
          success: true,
          message: `Feature flag '${flag}' set to ${enabled}`,
          featureFlags: this.getFeatureFlags(),
        });
      } catch (error: any) {
        logger.error(`Failed to update feature flag: ${error.message}`, error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // GET /api/config/rate-limits - Retrieve all rate limit configurations
    router.get('/rate-limits', (req: Request, res: Response) => {
      res.status(200).json({
        success: true,
        rateLimits: this.config.rateLimits,
      });
    });

    // POST /api/config/rate-limits/:tier - Update rate limit for a specific tier
    router.post('/api/config/rate-limits/:tier', (req: Request, res: Response) => {
      try {
        const tier = (Array.isArray(req.params.tier) ? req.params.tier[0] : req.params.tier) as string;
        const limitConfig: Partial<RateLimitConfig> = req.body;

        if (!this.config.rateLimits[tier]) {
          return res.status(404).json({ success: false, error: `Rate limit tier '${tier}' does not exist` });
        }

        this.config.rateLimits[tier] = {
          ...this.config.rateLimits[tier],
          ...limitConfig,
        };

        logger.info(`Rate limit tier '${tier}' updated.`, { tier });
        res.status(200).json({
          success: true,
          message: `Rate limit tier '${tier}' updated successfully`,
          rateLimits: this.config.rateLimits,
        });
      } catch (error: any) {
        logger.error(`Failed to update rate limit tier: ${error.message}`, error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // GET /api/config/memory - Retrieve memory caps and current process memory usage
    router.get('/memory', (req: Request, res: Response) => {
      const memoryUsage = process.memoryUsage();
      res.status(200).json({
        success: true,
        memoryCaps: this.getMemoryCaps(),
        currentUsage: {
          rssMB: Math.round(memoryUsage.rss / 1024 / 1024 * 100) / 100,
          heapTotalMB: Math.round(memoryUsage.heapTotal / 1024 / 1024 * 100) / 100,
          heapUsedMB: Math.round(memoryUsage.heapUsed / 1024 / 1024 * 100) / 100,
          externalMB: Math.round(memoryUsage.external / 1024 / 1024 * 100) / 100,
        },
      });
    });

    // POST /api/config/memory - Update memory caps
    router.post('/memory', (req: Request, res: Response) => {
      try {
        const caps: Partial<MemoryCapsConfig> = req.body;
        this.config.memoryCaps = {
          ...this.config.memoryCaps,
          ...caps,
        };
        logger.info('Memory caps updated.', { memoryCaps: this.config.memoryCaps });
        res.status(200).json({
          success: true,
          message: 'Memory caps updated successfully',
          memoryCaps: this.getMemoryCaps(),
        });
      } catch (error: any) {
        logger.error(`Failed to update memory caps: ${error.message}`, error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // GET /api/config/health - Validate sandbox thresholds and overall configuration health
    router.get('/health', (req: Request, res: Response) => {
      const memoryUsage = process.memoryUsage();
      const currentHeapMB = memoryUsage.heapUsed / 1024 / 1024;
      const isSandboxHealthy = this.validateSandboxThresholds(currentHeapMB);

      res.status(200).json({
        success: true,
        status: isSandboxHealthy ? 'HEALTHY' : 'WARNING_MEMORY_EXCEEDED',
        sandboxMemoryLimitMB: this.config.memoryCaps.sandboxMemoryLimitMB,
        currentHeapMB: Math.round(currentHeapMB * 100) / 100,
        timestamp: new Date().toISOString(),
      });
    });

    return router;
  }
}

export const ecosystemConfig = EcosystemConfigManager.getInstance();
export default ecosystemConfig;