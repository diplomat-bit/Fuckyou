

// --- CONSOLIDATED FROM: ./api/AppRegistry/utils/ManifestValidator.ts ---

import { EventEmitter } from 'events';
import { Router, Request, Response } from 'express';

export interface AppPermissions {
  networkAccess: boolean;
  allowedDomains: string[];
  filesystemAccess?: 'none' | 'read' | 'write' | 'full';
  allowedStorageQuotaBytes?: number;
  apiAccess: string[];
  systemHooks?: string[];
  elevatedPrivileges?: boolean;
}

export interface AppMetadata {
  author: string;
  contactEmail: string;
  supportUrl?: string;
  repositoryUrl?: string;
  license: string;
  category: 'financial' | 'analytics' | 'governance' | 'utility' | 'bridge' | 'ai' | 'security';
  tags: string[];
}

export interface ResourceLimits {
  maxMemoryMb: number;
  maxCpuPercentage: number;
  maxExecutionTimeMs: number;
  maxConcurrentConnections: number;
}

export interface AppRoute {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'ALL';
  handler: string;
  authRequired: boolean;
  rateLimitPerMinute?: number;
}

export interface AppManifest {
  manifestVersion: '1.0' | '1.1' | '2.0';
  id: string;
  name: string;
  version: string;
  description: string;
  entrypoint: string;
  metadata: AppMetadata;
  permissions: AppPermissions;
  resourceLimits: ResourceLimits;
  routes: AppRoute[];
  environmentVariables?: Record<string, { required: boolean; description: string; defaultValue?: string }>;
  checksum?: string;
  signature?: string;
}

export interface ValidationErrorDetail {
  field: string;
  code: string;
  message: string;
  severity: 'error' | 'warning';
}

export interface ValidationOptions {
  strictMode?: boolean;
  allowElevatedPermissions?: boolean;
  allowedDomainWhitelist?: string[];
  maxMemoryLimitMb?: number;
  checkSignature?: boolean;
}

export interface ValidationResult {
  valid: boolean;
  errors: ValidationErrorDetail[];
  warnings: ValidationErrorDetail[];
  sanitizedManifest?: AppManifest;
}

export interface SecurityAuditResult {
  score: number;
  risks: {
    level: 'high' | 'medium' | 'low';
    category: string;
    message: string;
    remediation: string;
  }[];
}

export interface ManifestDiff {
  hasChanges: boolean;
  changes: {
    field: string;
    oldValue: any;
    newValue: any;
    type: 'added' | 'removed' | 'modified';
  }[];
}

const ID_REGEX = /^[a-z0-9-]+(\.[a-z0-9-]+)*$/;
const SEMVER_REGEX = /^(0|[1-9]\d*)\.(0|[1-9]\d*)\.(0|[1-9]\d*)(?:-((?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*)(?:\.(?:0|[1-9]\d*|\d*[a-zA-Z-][0-9a-zA-Z-]*))*))?(?:\+([0-9a-zA-Z-]+(?:\.[0-9a-zA-Z-]+)*))?$/;
const DANGEROUS_SCHEMES = ['javascript:', 'data:', 'vbscript:', 'file:'];
const DANGEROUS_PERMISSIONS = ['system.root', 'kernel.direct', 'raw.socket', 'memory.inject'];

export class ManifestValidator extends EventEmitter {
  private static instance: ManifestValidator;
  public static getInstance(options?: ValidationOptions): ManifestValidator {
    if (!ManifestValidator.instance) {
      ManifestValidator.instance = new ManifestValidator(options);
    }
    return ManifestValidator.instance;
  }

  private defaultOptions: ValidationOptions;

  constructor(options: ValidationOptions = {}) {
    super();
    this.defaultOptions = {
      strictMode: true,
      allowElevatedPermissions: false,
      maxMemoryLimitMb: 2048,
      checkSignature: false,
      ...options,
    };
  }

  public validate(rawManifest: unknown, customOptions?: ValidationOptions): ValidationResult {
    const options = { ...this.defaultOptions, ...customOptions };
    const errors: ValidationErrorDetail[] = [];
    const warnings: ValidationErrorDetail[] = [];

    if (!rawManifest || typeof rawManifest !== 'object') {
      return {
        valid: false,
        errors: [{ field: 'root', code: 'INVALID_ROOT', message: 'Manifest must be a non-null object', severity: 'error' }],
        warnings: [],
      };
    }

    const manifest = rawManifest as Partial<AppManifest>;

    // 1. Core Metadata Validation
    this.validateCoreFields(manifest, errors);

    // 2. Semantic Versioning Validation
    if (manifest.version) {
      if (!SEMVER_REGEX.test(manifest.version)) {
        errors.push({
          field: 'version',
          code: 'INVALID_SEMVER',
          message: `Version '${manifest.version}' is not valid semver (e.g. 1.0.0)`,
          severity: 'error',
        });
      }
    }

    // 3. Entrypoint Safety
    if (manifest.entrypoint) {
      this.validateEntrypoint(manifest.entrypoint, errors);
    }

    // 4. Permissions & Security Audit
    if (manifest.permissions) {
      this.validatePermissions(manifest.permissions, errors, warnings, options);
    } else {
      errors.push({ field: 'permissions', code: 'MISSING_FIELD', message: 'Permissions configuration is required', severity: 'error' });
    }

    // 5. Resource Limits
    if (manifest.resourceLimits) {
      this.validateResourceLimits(manifest.resourceLimits, errors, warnings, options);
    } else {
      errors.push({ field: 'resourceLimits', code: 'MISSING_FIELD', message: 'Resource limits must be specified', severity: 'error' });
    }

    // 6. Routes & Endpoints
    if (Array.isArray(manifest.routes)) {
      this.validateRoutes(manifest.routes, errors, warnings);
    } else if (manifest.routes !== undefined) {
      errors.push({ field: 'routes', code: 'INVALID_TYPE', message: 'Routes must be an array', severity: 'error' });
    }

    // 7. Metadata Validation
    if (manifest.metadata) {
      this.validateMetadata(manifest.metadata, errors, warnings);
    } else {
      errors.push({ field: 'metadata', code: 'MISSING_FIELD', message: 'App metadata is required', severity: 'error' });
    }

    const isValid = errors.length === 0;

    let sanitizedManifest: AppManifest | undefined;
    if (isValid) {
      sanitizedManifest = this.sanitize(manifest as AppManifest);
    }

    this.emit('validationCompleted', { isValid, errorCount: errors.length, warningCount: warnings.length });

    return {
      valid: isValid,
      errors,
      warnings,
      sanitizedManifest,
    };
  }

  private validateCoreFields(manifest: Partial<AppManifest>, errors: ValidationErrorDetail[]): void {
    if (!manifest.id) {
      errors.push({ field: 'id', code: 'MISSING_FIELD', message: 'App ID is required', severity: 'error' });
    } else if (!ID_REGEX.test(manifest.id)) {
      errors.push({
        field: 'id',
        code: 'INVALID_ID_FORMAT',
        message: 'App ID must be lowercase alphanumeric characters separated by hyphens or dots (e.g. org.app-name)',
        severity: 'error',
      });
    }

    if (!manifest.name || typeof manifest.name !== 'string' || manifest.name.trim().length === 0) {
      errors.push({ field: 'name', code: 'INVALID_NAME', message: 'App name must be a non-empty string', severity: 'error' });
    }

    if (!manifest.manifestVersion) {
      errors.push({ field: 'manifestVersion', code: 'MISSING_FIELD', message: 'Manifest schema version is required', severity: 'error' });
    } else if (!['1.0', '1.1', '2.0'].includes(manifest.manifestVersion)) {
      errors.push({
        field: 'manifestVersion',
        code: 'UNSUPPORTED_VERSION',
        message: `Unsupported manifest version '${manifest.manifestVersion}'`,
        severity: 'error',
      });
    }
  }

  private validateEntrypoint(entrypoint: string, errors: ValidationErrorDetail[]): void {
    if (typeof entrypoint !== 'string' || entrypoint.trim().length === 0) {
      errors.push({ field: 'entrypoint', code: 'INVALID_ENTRYPOINT', message: 'Entrypoint must be a valid path string', severity: 'error' });
      return;
    }

    if (entrypoint.includes('..') || entrypoint.startsWith('/') || entrypoint.includes('\\')) {
      errors.push({
        field: 'entrypoint',
        code: 'PATH_TRAVERSAL_RISK',
        message: 'Entrypoint path must be relative to app root and cannot contain path traversal characters',
        severity: 'error',
      });
    }

    const lower = entrypoint.toLowerCase();
    for (const scheme of DANGEROUS_SCHEMES) {
      if (lower.includes(scheme)) {
        errors.push({
          field: 'entrypoint',
          code: 'UNSAFE_SCHEME',
          message: `Entrypoint contains dangerous scheme: ${scheme}`,
          severity: 'error',
        });
      }
    }
  }

  private validatePermissions(
    permissions: AppPermissions,
    errors: ValidationErrorDetail[],
    warnings: ValidationErrorDetail[],
    options: ValidationOptions
  ): void {
    if (typeof permissions !== 'object' || permissions === null) {
      errors.push({ field: 'permissions', code: 'INVALID_TYPE', message: 'Permissions must be an object', severity: 'error' });
      return;
    }

    if (permissions.elevatedPrivileges && !options.allowElevatedPermissions) {
      errors.push({
        field: 'permissions.elevatedPrivileges',
        code: 'ELEVATED_NOT_ALLOWED',
        message: 'Elevated privileges are strictly restricted by current system policy',
        severity: 'error',
      });
    }

    if (permissions.networkAccess) {
      if (!Array.isArray(permissions.allowedDomains) || permissions.allowedDomains.length === 0) {
        warnings.push({
          field: 'permissions.allowedDomains',
          code: 'UNRESTRICTED_NETWORK',
          message: 'Network access enabled without specifying domain allowlist. Default sandbox blocking will apply.',
          severity: 'warning',
        });
      } else {
        for (const domain of permissions.allowedDomains) {
          if (domain === '*' && options.strictMode) {
            errors.push({
              field: 'permissions.allowedDomains',
              code: 'WILDCARD_DOMAIN_FORBIDDEN',
              message: 'Wildcard domain "*" is not allowed in strict mode',
              severity: 'error',
            });
          }
        }
      }
    }

    if (Array.isArray(permissions.apiAccess)) {
      for (const api of permissions.apiAccess) {
        if (DANGEROUS_PERMISSIONS.includes(api)) {
          errors.push({
            field: 'permissions.apiAccess',
            code: 'FORBIDDEN_API_PERMISSION',
            message: `Permission to access '${api}' is forbidden`,
            severity: 'error',
          });
        }
      }
    }
  }

  private validateResourceLimits(
    limits: ResourceLimits,
    errors: ValidationErrorDetail[],
    warnings: ValidationErrorDetail[],
    options: ValidationOptions
  ): void {
    const maxMemory = options.maxMemoryLimitMb || 2048;

    if (typeof limits.maxMemoryMb !== 'number' || limits.maxMemoryMb <= 0) {
      errors.push({ field: 'resourceLimits.maxMemoryMb', code: 'INVALID_LIMIT', message: 'Memory limit must be a positive number', severity: 'error' });
    } else if (limits.maxMemoryMb > maxMemory) {
      errors.push({
        field: 'resourceLimits.maxMemoryMb',
        code: 'MEMORY_LIMIT_EXCEEDED',
        message: `Requested memory (${limits.maxMemoryMb}MB) exceeds maximum threshold of ${maxMemory}MB`,
        severity: 'error',
      });
    }

    if (typeof limits.maxCpuPercentage !== 'number' || limits.maxCpuPercentage <= 0 || limits.maxCpuPercentage > 100) {
      errors.push({
        field: 'resourceLimits.maxCpuPercentage',
        code: 'INVALID_LIMIT',
        message: 'CPU limit percentage must be between 1 and 100',
        severity: 'error',
      });
    }

    if (limits.maxExecutionTimeMs && limits.maxExecutionTimeMs > 300000) {
      warnings.push({
        field: 'resourceLimits.maxExecutionTimeMs',
        code: 'HIGH_TIMEOUT',
        message: 'Execution timeout higher than 5 minutes may trigger automatic termination',
        severity: 'warning',
      });
    }
  }

  private validateRoutes(routes: AppRoute[], errors: ValidationErrorDetail[], warnings: ValidationErrorDetail[]): void {
    const seenPaths = new Set<string>();

    routes.forEach((route, index) => {
      const routeKey = `${route.method || 'GET'}:${route.path}`;
      if (seenPaths.has(routeKey)) {
        errors.push({
          field: `routes[${index}]`,
          code: 'DUPLICATE_ROUTE',
          message: `Duplicate route path definition: ${routeKey}`,
          severity: 'error',
        });
      }
      seenPaths.add(routeKey);

      if (!route.path || !route.path.startsWith('/')) {
        errors.push({
          field: `routes[${index}].path`,
          code: 'INVALID_PATH',
          message: 'Route path must begin with a forward slash "/"',
          severity: 'error',
        });
      }

      if (route.authRequired === false) {
        warnings.push({
          field: `routes[${index}].authRequired`,
          code: 'UNAUTHENTICATED_ENDPOINT',
          message: `Endpoint ${routeKey} is marked public without requiring authentication`,
          severity: 'warning',
        });
      }
    });
  }

  private validateMetadata(metadata: AppMetadata, errors: ValidationErrorDetail[], warnings: ValidationErrorDetail[]): void {
    if (!metadata.author || typeof metadata.author !== 'string') {
      errors.push({ field: 'metadata.author', code: 'MISSING_FIELD', message: 'Author name is required', severity: 'error' });
    }

    if (!metadata.contactEmail || !metadata.contactEmail.includes('@')) {
      errors.push({ field: 'metadata.contactEmail', code: 'INVALID_EMAIL', message: 'Valid contact email is required', severity: 'error' });
    }

    const validCategories = ['financial', 'analytics', 'governance', 'utility', 'bridge', 'ai', 'security'];
    if (!validCategories.includes(metadata.category)) {
      errors.push({
        field: 'metadata.category',
        code: 'INVALID_CATEGORY',
        message: `Category must be one of: ${validCategories.join(', ')}`,
        severity: 'error',
      });
    }
  }

  public sanitize(manifest: AppManifest): AppManifest {
    return {
      ...manifest,
      name: manifest.name.trim(),
      description: manifest.description ? manifest.description.trim() : '',
      entrypoint: manifest.entrypoint.trim(),
      permissions: {
        ...manifest.permissions,
        allowedDomains: (manifest.permissions.allowedDomains || []).map((d) => d.toLowerCase().trim()),
        apiAccess: (manifest.permissions.apiAccess || []).map((a) => a.trim()),
      },
      metadata: {
        ...manifest.metadata,
        author: manifest.metadata.author.trim(),
        contactEmail: manifest.metadata.contactEmail.toLowerCase().trim(),
        tags: (manifest.metadata.tags || []).map((t) => t.toLowerCase().trim()),
      },
      routes: (manifest.routes || []).map((r) => ({
        ...r,
        path: r.path.trim(),
        handler: r.handler.trim(),
      })),
    };
  }

  public auditSecurity(manifest: AppManifest): SecurityAuditResult {
    const risks: SecurityAuditResult['risks'] = [];
    let score = 100;

    if (manifest.permissions.elevatedPrivileges) {
      score -= 40;
      risks.push({
        level: 'high',
        category: 'Privilege Escalation',
        message: 'App requests elevated privileges, bypassing standard sandbox restrictions.',
        remediation: 'Ensure this app is signed by a trusted authority and limit elevated access.',
      });
    }

    if (manifest.permissions.networkAccess) {
      const domains = manifest.permissions.allowedDomains || [];
      if (domains.includes('*') || domains.length === 0) {
        score -= 25;
        risks.push({
          level: 'high',
          category: 'Network Security',
          message: 'App has unrestricted network access (wildcard or empty domain list).',
          remediation: 'Specify explicit domains in allowedDomains instead of using wildcards.',
        });
      }
    }

    if (manifest.permissions.filesystemAccess === 'full' || manifest.permissions.filesystemAccess === 'write') {
      score -= 20;
      risks.push({
        level: 'medium',
        category: 'File System Access',
        message: `App requests '${manifest.permissions.filesystemAccess}' access to the filesystem.`,
        remediation: 'Restrict filesystem access to "read" or "none" if persistent storage is not required.',
      });
    }

    const dangerousApis = manifest.permissions.apiAccess?.filter(api => DANGEROUS_PERMISSIONS.includes(api)) || [];
    if (dangerousApis.length > 0) {
      score -= 15 * dangerousApis.length;
      risks.push({
        level: 'high',
        category: 'Dangerous APIs',
        message: `App requests access to restricted APIs: ${dangerousApis.join(', ')}`,
        remediation: 'Remove access to dangerous system APIs unless absolutely necessary.',
      });
    }

    const unauthenticatedRoutes = manifest.routes?.filter(r => !r.authRequired) || [];
    if (unauthenticatedRoutes.length > 0) {
      score -= 5 * unauthenticatedRoutes.length;
      risks.push({
        level: 'medium',
        category: 'Unauthenticated Endpoints',
        message: `App exposes ${unauthenticatedRoutes.length} public endpoint(s) without authentication.`,
        remediation: 'Set authRequired to true for sensitive endpoints.',
      });
    }

    return {
      score: Math.max(0, score),
      risks,
    };
  }

  public compare(oldManifest: AppManifest, newManifest: AppManifest): ManifestDiff {
    const changes: ManifestDiff['changes'] = [];

    const compareKeys: (keyof AppManifest)[] = ['manifestVersion', 'id', 'name', 'version', 'description', 'entrypoint'];
    for (const key of compareKeys) {
      if (oldManifest[key] !== newManifest[key]) {
        changes.push({
          field: key,
          oldValue: oldManifest[key],
          newValue: newManifest[key],
          type: oldManifest[key] === undefined ? 'added' : (newManifest[key] === undefined ? 'removed' : 'modified'),
        });
      }
    }

    if (JSON.stringify(oldManifest.permissions) !== JSON.stringify(newManifest.permissions)) {
      changes.push({
        field: 'permissions',
        oldValue: oldManifest.permissions,
        newValue: newManifest.permissions,
        type: 'modified',
      });
    }

    if (JSON.stringify(oldManifest.resourceLimits) !== JSON.stringify(newManifest.resourceLimits)) {
      changes.push({
        field: 'resourceLimits',
        oldValue: oldManifest.resourceLimits,
        newValue: newManifest.resourceLimits,
        type: 'modified',
      });
    }

    return {
      hasChanges: changes.length > 0,
      changes,
    };
  }

  public generateMockManifest(id = 'com.example.mock-app'): AppManifest {
    return {
      manifestVersion: '2.0',
      id,
      name: 'Mock Integration App',
      version: '1.0.0',
      description: 'A mock application manifest generated for testing and validation purposes.',
      entrypoint: 'dist/index.js',
      metadata: {
        author: 'System Generator',
        contactEmail: 'dev@example.com',
        category: 'utility',
        tags: ['mock', 'test', 'sandbox'],
        license: 'MIT',
      },
      permissions: {
        networkAccess: true,
        allowedDomains: ['api.example.com'],
        filesystemAccess: 'read',
        apiAccess: ['storage.local', 'logger.info'],
      },
      resourceLimits: {
        maxMemoryMb: 512,
        maxCpuPercentage: 50,
        maxExecutionTimeMs: 60000,
        maxConcurrentConnections: 20,
      },
      routes: [
        {
          path: '/health',
          method: 'GET',
          handler: 'handleHealth',
          authRequired: false,
        },
        {
          path: '/data',
          method: 'POST',
          handler: 'handleData',
          authRequired: true,
        }
      ],
    };
  }
}

export function createManifestValidatorRouter(validator: ManifestValidator = manifestValidator): Router {
  const router = Router();

  router.post('/validate', (req: Request, res: Response) => {
    try {
      const result = validator.validate(req.body);
      return res.status(result.valid ? 200 : 400).json(result);
    } catch (error: any) {
      return res.status(500).json({
        valid: false,
        errors: [{ field: 'server', code: 'INTERNAL_ERROR', message: error.message, severity: 'error' }],
        warnings: [],
      });
    }
  });

  router.post('/sanitize', (req: Request, res: Response) => {
    try {
      const validation = validator.validate(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          message: 'Cannot sanitize an invalid manifest',
          errors: validation.errors,
        });
      }
      const sanitized = validator.sanitize(req.body as AppManifest);
      return res.status(200).json({ sanitized });
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  router.post('/audit', (req: Request, res: Response) => {
    try {
      const validation = validator.validate(req.body);
      if (!validation.valid) {
        return res.status(400).json({
          message: 'Cannot audit an invalid manifest',
          errors: validation.errors,
        });
      }
      const auditResult = validator.auditSecurity(req.body as AppManifest);
      return res.status(200).json(auditResult);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  router.post('/compare', (req: Request, res: Response) => {
    try {
      const { oldManifest, newManifest } = req.body;
      if (!oldManifest || !newManifest) {
        return res.status(400).json({ message: 'Both oldManifest and newManifest are required' });
      }
      const diff = validator.compare(oldManifest, newManifest);
      return res.status(200).json(diff);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  router.get('/mock', (req: Request, res: Response) => {
    try {
      const id = typeof req.query.id === 'string' ? req.query.id : undefined;
      const mock = validator.generateMockManifest(id);
      return res.status(200).json(mock);
    } catch (error: any) {
      return res.status(500).json({ message: error.message });
    }
  });

  return router;
}

export const manifestValidator = new ManifestValidator();
export default manifestValidator;