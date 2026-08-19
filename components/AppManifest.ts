

// --- CONSOLIDATED FROM: ./api/AppRegistry/types/AppManifest.ts ---

/**
 * @file api/AppRegistry/types/AppManifest.ts
 * @description Comprehensive TypeScript type definitions for ecosystem application manifests,
 * route bindings, permission matrices, and metadata specifications across the Oko sovereign platform.
 * Enhanced with built-in validation, in-memory registry management, and Express API routes.
 */

import { Request, Response, Router } from 'express';
import * as crypto from 'crypto';

export type AppCategory =
  | 'SOVEREIGN_TREASURY'
  | 'TRADING_QUANT'
  | 'GOVERNMENT_COMPLIANCE'
  | 'AI_AGENT_STUDIO'
  | 'REAL_ESTATE_TOKENIZATION'
  | 'TAX_LIENS'
  | 'BANKING_BRIDGES'
  | 'IDENTITY_CITADEL'
  | 'ANALYTICS_TELEMETRY'
  | 'INFRASTRUCTURE';

export type AppComplianceLevel =
  | 'PUBLIC'
  | 'INTERNAL_COMMERCIAL'
  | 'AZURE_GOV_HIGH'
  | 'FEDRAMP_MODERATE'
  | 'FEDRAMP_HIGH'
  | 'SOVEREIGN_ZERO_TRUST'
  | 'FINRA_SEC_COMPLIANT';

export type AppLifecycleStage =
  | 'DISCOVERY'
  | 'ALPHA'
  | 'BETA'
  | 'STABLE'
  | 'DEPRECATED'
  | 'MAINTENANCE_ONLY';

export type RouteMethod =
  | 'GET'
  | 'POST'
  | 'PUT'
  | 'DELETE'
  | 'PATCH'
  | 'OPTIONS'
  | 'HEAD';

export type PermissionScope =
  | 'system:admin'
  | 'system:read'
  | 'treasury:read'
  | 'treasury:execute'
  | 'trading:alpaca:read'
  | 'trading:alpaca:execute'
  | 'citi:connect:read'
  | 'citi:connect:transact'
  | 'gov:sec:read'
  | 'gov:sec:file'
  | 'gov:irs:read'
  | 'gov:irs:submit'
  | 'ai:agent:spawn'
  | 'ai:agent:train'
  | 'real_estate:deed:read'
  | 'real_estate:deed:write'
  | 'tax_lien:auction:bid'
  | 'identity:verify'
  | 'identity:sovereign:override';

export interface EnvironmentVariableSpec {
  key: string;
  description: string;
  required: boolean;
  isSecret: boolean;
  defaultValue?: string;
  validationRegex?: string;
}

export interface RouteRateLimit {
  windowMs: number;
  maxRequests: number;
  statusCode?: number;
  message?: string;
}

export interface RouteBinding {
  id: string;
  path: string;
  method: RouteMethod;
  controllerMethod: string;
  description: string;
  isProtected: boolean;
  requiredScopes: PermissionScope[];
  rateLimit?: RouteRateLimit;
  auditLogged: boolean;
  timeoutMs?: number;
  cacheTtlSeconds?: number;
  deprecated?: boolean;
}

export interface WebhookBinding {
  id: string;
  eventType: string;
  targetEndpoint: string;
  signatureHeader: string;
  retryStrategy: {
    maxRetries: number;
    backoffFactor: number;
    initialDelayMs: number;
  };
  isActive: boolean;
}

export interface DependencySpec {
  name: string;
  versionRange: string;
  type: 'CORE_SERVICE' | 'EXTERNAL_API' | 'MICROSERVICE' | 'DATABASE_LEAF';
  optional: boolean;
  healthEndpoint?: string;
}

export interface HealthCheckConfig {
  endpoint: string;
  intervalSeconds: number;
  timeoutMs: number;
  unhealthyThreshold: number;
  healthyThreshold: number;
  checkMemoryUsage: boolean;
  customCheckFnName?: string;
}

export interface AppTelemetryConfig {
  metricsEnabled: boolean;
  tracingEnabled: boolean;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  customDimensions?: Record<string, string>;
  prometheusPath?: string;
}

export interface AppBridgeBinding {
  bridgeId: string;
  bridgeName: string;
  sourceConnector: 'CITI' | 'PLAID' | 'STRIPE' | 'MODERN_TREASURY' | 'ALPACA' | 'AZURE_GOV';
  targetConnector: string;
  dataSyncIntervalMs?: number;
  isRealtimeStream: boolean;
}

export interface AppSecurityProfile {
  complianceLevel: AppComplianceLevel;
  requiresMfa: boolean;
  requiresHardwareKey: boolean;
  ipWhitelist?: string[];
  maxSessionDurationMinutes: number;
  mTLSRequired: boolean;
  zkpVerificationRequired: boolean;
}

export interface AppMetadata {
  id: string;
  slug: string;
  displayName: string;
  version: string;
  description: string;
  category: AppCategory;
  lifecycle: AppLifecycleStage;
  author: {
    name: string;
    email: string;
    organization: string;
  };
  iconUrl?: string;
  documentationUrl?: string;
  repositoryUrl?: string;
  tags: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AppManifest {
  manifestVersion: string;
  metadata: AppMetadata;
  security: AppSecurityProfile;
  environmentVars: EnvironmentVariableSpec[];
  routes: RouteBinding[];
  webhooks: WebhookBinding[];
  dependencies: DependencySpec[];
  bridges: AppBridgeBinding[];
  healthCheck: HealthCheckConfig;
  telemetry: AppTelemetryConfig;
  featureFlags: Record<string, boolean>;
  entryPoint: string;
  enabled: boolean;
}

export type ManifestValidationResult = {
  isValid: boolean;
  errors: string[];
  warnings: string[];
};

export type AppManifestMap = Map<string, AppManifest>;
export type AppRegistryState = Record<string, AppManifest>;

/**
 * In-Memory Store for App Manifests
 */
export class AppManifestStore {
  private static manifests: Map<string, AppManifest> = new Map();

  public static getAll(): AppManifest[] {
    return Array.from(this.manifests.values());
  }

  public static get(id: string | string[]): AppManifest | undefined {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    return this.manifests.get(normalizedId) || Array.from(this.manifests.values()).find(m => m.metadata.slug === normalizedId);
  }

  public static set(id: string | string[], manifest: AppManifest): void {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    this.manifests.set(normalizedId, manifest);
  }

  public static delete(id: string | string[]): boolean {
    const normalizedId = Array.isArray(id) ? id[0] : id;
    return this.manifests.delete(normalizedId);
  }

  public static clear(): void {
    this.manifests.clear();
  }

  public static initializeDefaults(): void {
    if (this.manifests.size > 0) return;

    const defaultManifest: AppManifest = {
      manifestVersion: "1.0.0",
      metadata: {
        id: "citi-bridge-v1",
        slug: "citi-bridge",
        displayName: "Citibank Sovereign Ledger Bridge",
        version: "1.0.0",
        description: "Real-time transactional bridge connecting Citibank Core APIs with Oko Sovereign Ledger.",
        category: "BANKING_BRIDGES",
        lifecycle: "STABLE",
        author: {
          name: "Oko Core Team",
          email: "engineering@oko.sovereign",
          organization: "Oko Sovereign Platform"
        },
        tags: ["citi", "banking", "ledger", "bridge"],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      },
      security: {
        complianceLevel: "SOVEREIGN_ZERO_TRUST",
        requiresMfa: true,
        requiresHardwareKey: true,
        maxSessionDurationMinutes: 15,
        mTLSRequired: true,
        zkpVerificationRequired: true
      },
      environmentVars: [
        {
          key: "CITI_CLIENT_ID",
          description: "OAuth Client ID for Citibank Developer Portal",
          required: true,
          isSecret: false
        },
        {
          key: "CITI_CLIENT_SECRET",
          description: "OAuth Client Secret for Citibank Developer Portal",
          required: true,
          isSecret: true
        }
      ],
      routes: [
        {
          id: "citi-sync",
          path: "/api/v1/citi/sync",
          method: "POST",
          controllerMethod: "syncTransactions",
          description: "Trigger manual synchronization of Citibank transactions",
          isProtected: true,
          requiredScopes: ["citi:connect:transact"],
          auditLogged: true,
          rateLimit: {
            windowMs: 60000,
            maxRequests: 10
          }
        }
      ],
      webhooks: [],
      dependencies: [],
      bridges: [
        {
          bridgeId: "citi-to-sovereign",
          bridgeName: "Citi Sovereign Ledger Sync",
          sourceConnector: "CITI",
          targetConnector: "SOVEREIGN_LEDGER",
          isRealtimeStream: true
        }
      ],
      healthCheck: {
        endpoint: "/healthz",
        intervalSeconds: 30,
        timeoutMs: 5000,
        unhealthyThreshold: 3,
        healthyThreshold: 2,
        checkMemoryUsage: true
      },
      telemetry: {
        metricsEnabled: true,
        tracingEnabled: true,
        logLevel: "info"
      },
      featureFlags: {
        enableRealtimeStreaming: true,
        dryRunMode: false
      },
      entryPoint: "dist/bridges/citi/index.js",
      enabled: true
    };

    this.set(defaultManifest.metadata.id, defaultManifest);
  }
}

// Initialize default manifests
AppManifestStore.initializeDefaults();

/**
 * Comprehensive Manifest Validator
 */
export function validateManifest(manifest: any): ManifestValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!manifest) {
    return { isValid: false, errors: ["Manifest is null or undefined"], warnings };
  }

  // Check top-level fields
  if (!manifest.manifestVersion) errors.push("Missing 'manifestVersion'");
  if (!manifest.metadata) {
    errors.push("Missing 'metadata' block");
  } else {
    const meta = manifest.metadata;
    if (!meta.id) errors.push("Metadata: Missing 'id'");
    if (!meta.slug) errors.push("Metadata: Missing 'slug'");
    if (!meta.displayName) errors.push("Metadata: Missing 'displayName'");
    if (!meta.version) errors.push("Metadata: Missing 'version'");
    if (!meta.category) errors.push("Metadata: Missing 'category'");
    if (meta.author && !meta.author.email) warnings.push("Metadata: Author email is recommended");
  }

  if (!manifest.security) {
    errors.push("Missing 'security' block");
  } else {
    const sec = manifest.security;
    if (!sec.complianceLevel) errors.push("Security: Missing 'complianceLevel'");
  }

  if (!Array.isArray(manifest.routes)) {
    errors.push("Routes must be an array");
  } else {
    manifest.routes.forEach((route: any, index: number) => {
      if (!route.id) errors.push(`Route[${index}]: Missing 'id'`);
      if (!route.path) errors.push(`Route[${index}]: Missing 'path'`);
      if (!route.method) errors.push(`Route[${index}]: Missing 'method'`);
    });
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

/**
 * Express API Router for App Manifests
 * Exposes full CRUD, validation, and telemetry endpoints for ecosystem manifests.
 */
export function createAppManifestRouter(): Router {
  const router = Router();

  // GET /api/manifests - List all registered manifests
  router.get('/', (req: Request, res: Response) => {
    try {
      const manifests = AppManifestStore.getAll();
      return res.status(200).json({
        success: true,
        count: manifests.length,
        data: manifests
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // GET /api/manifests/:id - Get a specific manifest by ID or Slug
  router.get('/:id', (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const manifest = AppManifestStore.get(id);
      if (!manifest) {
        return res.status(404).json({ success: false, error: "Manifest not found" });
      }
      return res.status(200).json({ success: true, data: manifest });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/manifests - Register a new manifest
  router.post('/', (req: Request, res: Response) => {
    try {
      const manifest = req.body as AppManifest;
      const validation = validateManifest(manifest);

      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Validation failed",
          details: validation.errors,
          warnings: validation.warnings
        });
      }

      // Ensure unique ID/Slug
      if (AppManifestStore.get(manifest.metadata.id)) {
        return res.status(409).json({
          success: false,
          error: `Manifest with ID '${manifest.metadata.id}' already exists`
        });
      }

      manifest.metadata.createdAt = new Date().toISOString();
      manifest.metadata.updatedAt = new Date().toISOString();

      AppManifestStore.set(manifest.metadata.id, manifest);

      return res.status(201).json({
        success: true,
        message: "Manifest registered successfully",
        data: manifest,
        warnings: validation.warnings
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // PUT /api/manifests/:id - Update an existing manifest
  router.put('/:id', (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const existing = AppManifestStore.get(id);

      if (!existing) {
        return res.status(404).json({ success: false, error: "Manifest not found" });
      }

      const updatedManifest = {
        ...existing,
        ...req.body,
        metadata: {
          ...existing.metadata,
          ...(req.body.metadata || {}),
          id: existing.metadata.id, // Prevent ID mutation
          updatedAt: new Date().toISOString()
        }
      };

      const validation = validateManifest(updatedManifest);
      if (!validation.isValid) {
        return res.status(400).json({
          success: false,
          error: "Validation failed on update",
          details: validation.errors
        });
      }

      AppManifestStore.set(existing.metadata.id, updatedManifest);

      return res.status(200).json({
        success: true,
        message: "Manifest updated successfully",
        data: updatedManifest
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // DELETE /api/manifests/:id - Deregister a manifest
  router.delete('/:id', (req: Request, res: Response) => {
    try {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const existing = AppManifestStore.get(id);

      if (!existing) {
        return res.status(404).json({ success: false, error: "Manifest not found" });
      }

      AppManifestStore.delete(existing.metadata.id);

      return res.status(200).json({
        success: true,
        message: `Manifest '${existing.metadata.id}' successfully deregistered`
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  // POST /api/manifests/validate - Dry-run validation of a manifest
  router.post('/validate', (req: Request, res: Response) => {
    try {
      const validation = validateManifest(req.body);
      return res.status(200).json({
        success: true,
        ...validation
      });
    } catch (error: any) {
      return res.status(500).json({ success: false, error: error.message });
    }
  });

  return router;
}