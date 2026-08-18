export interface RouteConfig {
  path: string;
  targetService?: string;
  methods: Array<'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD' | 'ALL'>;
  authRequired: boolean;
  requiredScopes: string[];
  roles: string[];
  rateLimit?: {
    windowMs: number;
    maxRequests: number;
  };
  middleware: string[];
  corsEnabled?: boolean;
}

export interface SecurityRequirements {
  authenticationLevel: 'none' | 'basic' | 'bearer' | 'oauth2' | 'mtls' | 'sovereign_handshake';
  requiredScopes: string[];
  ipWhitelist: string[];
  encryptionRequired: boolean;
  mfaRequired: boolean;
  complianceFrameworks: Array<'AZURE_GOV' | 'SOC2' | 'HIPAA' | 'GDPR' | 'FEDRAMP' | 'CITI_SECURE'>;
  rateLimitingTier: 'standard' | 'strict' | 'unlimited' | 'custom';
}

export interface FeatureToggleConfig {
  key: string;
  enabled: boolean;
  rolloutPercentage: number;
  requiredRoles: string[];
  userOverrides: Record<string, boolean>;
  environment: 'development' | 'staging' | 'production' | 'all';
  description?: string;
}

export interface AppManifest {
  appId: string;
  appName: string;
  version: string;
  category: string;
  description: string;
  entryPoint?: string;
  routes: RouteConfig[];
  security: SecurityRequirements;
  featureToggles: Record<string, FeatureToggleConfig>;
  dependencies: Record<string, string>;
  metadata: Record<string, unknown>;
  parsedAt: string;
  parseFormat: 'json' | 'yaml_like' | 'unstructured_text' | 'markdown' | 'kv_pair';
}

export interface ParseWarning {
  field: string;
  message: string;
  defaultValueUsed?: unknown;
}

export interface ParseError {
  field: string;
  message: string;
  code: string;
}

export interface ParseResult<T = AppManifest> {
  success: boolean;
  data?: T;
  errors: ParseError[];
  warnings: ParseWarning[];
  rawInputSnippet?: string;
}

import { AppStorageVault, defaultAppStorageVault } from './services/AppStorageVault';
import { AppMetricsCollector, appMetricsCollector } from './services/AppMetricsCollector';
import { AppSecurityAuditor, AppSecurityAuditor as appSecurityAuditor } from './utils/AppSecurityAuditor';
import { ManifestValidator, manifestValidator } from './utils/ManifestValidator';
import { AppRegistryAuth } from './middleware/AppRegistryAuth';
import { Router, Request, Response, NextFunction } from 'express';

export class AppManifestParser {
  private static readonly DEFAULT_SECURITY: SecurityRequirements = {
    authenticationLevel: 'bearer',
    requiredScopes: [],
    ipWhitelist: [],
    encryptionRequired: true,
    mfaRequired: false,
    complianceFrameworks: ['AZURE_GOV'],
    rateLimitingTier: 'standard',
  };

  public static async validate(manifest: AppManifest) {
    return await manifestValidator.validate(manifest);
  }

  public static async audit(manifest: AppManifest) {
    const auditor = AppSecurityAuditor.getInstance();
    return auditor.runFullAudit({ appId: manifest.appId, environmentVars: manifest.metadata as Record<string, string> });
  }

  public static async saveManifest(manifest: AppManifest) {
    const vault = defaultAppStorageVault;
    return await vault.storeSecret(manifest.appId, 'manifest', JSON.stringify(manifest), 'system');
  }

  public static recordParseMetric(metric: { format: string; status: string; errorCode: string | null; durationMs: number }) {
    const collector = AppMetricsCollector.getInstance();
    collector.recordLatency(metric.format, metric.durationMs);
    collector.recordRequest(metric.format, metric.status === 'failure', metric.errorCode || undefined);
  }

  public autoParse(input: unknown): ParseResult<AppManifest> {
    const startTime = Date.now();
    if (!input) {
      AppManifestParser.recordParseMetric({ format: 'unknown', status: 'failure', errorCode: 'EMPTY_INPUT', durationMs: 0 });
      return {
        success: false,
        errors: [{ field: 'root', message: 'Input cannot be null or empty', code: 'EMPTY_INPUT' }],
        warnings: [],
      };
    }

    let result: ParseResult<AppManifest>;

    if (typeof input === 'object' && input !== null) {
      result = this.parseStructuredJson(input as Record<string, unknown>);
    } else if (typeof input === 'string') {
      const trimmed = input.trim();
      if (trimmed.startsWith('{') || trimmed.startsWith('[')) {
        try {
          const parsed = JSON.parse(trimmed);
          result = this.parseStructuredJson(parsed);
        } catch {
          result = this.parseUnstructuredText(trimmed);
        }
      } else if (trimmed.includes('---') || trimmed.startsWith('#')) {
        result = this.parseMarkdownManifest(trimmed);
      } else if (trimmed.includes('=') && !trimmed.includes('{')) {
        result = this.parseKeyValueConfig(trimmed);
      } else {
        result = this.parseUnstructuredText(trimmed);
      }
    } else {
      result = {
        success: false,
        errors: [{ field: 'root', message: 'Unsupported input format', code: 'UNSUPPORTED_FORMAT' }],
        warnings: [],
      };
    }

    const duration = Date.now() - startTime;
    const format = result.data?.parseFormat || 'unknown';
    const status = result.success ? 'success' : 'failure';
    AppManifestParser.recordParseMetric({ format, status, errorCode: result.errors[0]?.code || null, durationMs: duration });

    return result;
  }

  public parseStructuredJson(rawObj: Record<string, unknown>): ParseResult<AppManifest> {
    const errors: ParseError[] = [];
    const warnings: ParseWarning[] = [];

    const appId = this.extractString(rawObj, ['appId', 'id', 'name', 'slug'], 'unknown-app', warnings);
    const appName = this.extractString(rawObj, ['appName', 'displayName', 'title', 'name'], appId, warnings);
    const version = this.extractString(rawObj, ['version', 'v'], '1.0.0', warnings);
    const category = this.extractString(rawObj, ['category', 'group', 'type'], 'utility', warnings);
    const description = this.extractString(rawObj, ['description', 'summary', 'desc'], '', warnings);
    const entryPoint = this.extractOptionalString(rawObj, ['entryPoint', 'main', 'index', 'route']);

    const routes = this.parseRoutes(rawObj.routes || rawObj.endpoints || rawObj.paths, warnings);
    const security = this.parseSecurity(rawObj.security || rawObj.auth || rawObj.permissions, warnings);
    const featureToggles = this.parseFeatureToggles(rawObj.featureToggles || rawObj.features || rawObj.flags, warnings);
    const dependencies = this.parseDependencies(rawObj.dependencies || rawObj.deps, warnings);

    const metadata: Record<string, unknown> = (typeof rawObj.metadata === 'object' && rawObj.metadata !== null)
      ? (rawObj.metadata as Record<string, unknown>)
      : {};

    const manifest: AppManifest = {
      appId: this.slugify(appId),
      appName,
      version,
      category,
      description,
      entryPoint,
      routes,
      security,
      featureToggles,
      dependencies,
      metadata,
      parsedAt: new Date().toISOString(),
      parseFormat: 'json',
    };

    return {
      success: errors.length === 0,
      data: manifest,
      errors,
      warnings,
    };
  }

  public parseUnstructuredText(rawText: string): ParseResult<AppManifest> {
    const warnings: ParseWarning[] = [];
    const errors: ParseError[] = [];
    const lines = rawText.split(/\r?\n/).map(l => l.trim()).filter(Boolean);

    let appId = 'unstructured-app';
    let appName = 'Unstructured Application';
    let version = '1.0.0';
    let category = 'general';
    let description = '';
    const routes: RouteConfig[] = [];
    const featureToggles: Record<string, FeatureToggleConfig> = {};
    const security: SecurityRequirements = { ...AppManifestParser.DEFAULT_SECURITY };

    for (const line of lines) {
      if (/^app[_-]?name\s*[:=]\s*(.+)$/i.test(line)) {
        appName = line.split(/[:=]/)[1].trim();
      } else if (/^app[_-]?id\s*[:=]\s*(.+)$/i.test(line)) {
        appId = line.split(/[:=]/)[1].trim();
      } else if (/^version\s*[:=]\s*(.+)$/i.test(line)) {
        version = line.split(/[:=]/)[1].trim();
      } else if (/^category\s*[:=]\s*(.+)$/i.test(line)) {
        category = line.split(/[:=]/)[1].trim();
      } else if (/^description\s*[:=]\s*(.+)$/i.test(line)) {
        description = line.split(/[:=]/)[1].trim();
      }

      const routeMatch = line.match(/^(GET|POST|PUT|DELETE|PATCH|OPTIONS|ALL)\s+(\/[^\s]+)(?:\s*(?:->|to)\s*([^\s]+))?/i);
      if (routeMatch) {
        const method = routeMatch[1].toUpperCase() as RouteConfig['methods'][0];
        const path = routeMatch[2];
        const targetService = routeMatch[3];

        routes.push({
          path,
          targetService,
          methods: [method],
          authRequired: !line.toLowerCase().includes('public'),
          requiredScopes: [],
          roles: [],
          middleware: [],
        });
      }

      const featureMatch = line.match(/^(?:feature|flag)[:\s]+([A-Z0-9_]+)\s*=\s*(true|false|1|0)/i);
      if (featureMatch) {
        const key = featureMatch[1];
        const enabled = featureMatch[2].toLowerCase() === 'true' || featureMatch[2] === '1';
        featureToggles[key] = {
          key,
          enabled,
          rolloutPercentage: enabled ? 100 : 0,
          requiredRoles: [],
          userOverrides: {},
          environment: 'all',
        };
      }

      if (line.toLowerCase().includes('mfa_required')) {
        security.mfaRequired = true;
      }
      if (line.toLowerCase().includes('auth_level')) {
        const parts = line.split(/[:=]/);
        if (parts[1]) {
          const level = parts[1].trim().toLowerCase() as SecurityRequirements['authenticationLevel'];
          if (['none', 'basic', 'bearer', 'oauth2', 'mtls', 'sovereign_handshake'].includes(level)) {
            security.authenticationLevel = level;
          }
        }
      }
    }

    if (appName !== 'Unstructured Application' && appId === 'unstructured-app') {
      appId = this.slugify(appName);
    }

    const manifest: AppManifest = {
      appId: this.slugify(appId),
      appName,
      version,
      category,
      description: description || `Extracted from unstructured text containing ${lines.length} lines`,
      routes,
      security,
      featureToggles,
      dependencies: {},
      metadata: { totalLinesParsed: lines.length },
      parsedAt: new Date().toISOString(),
      parseFormat: 'unstructured_text',
    };

    return {
      success: errors.length === 0,
      data: manifest,
      errors,
      warnings,
    };
  }

  public parseMarkdownManifest(mdContent: string): ParseResult<AppManifest> {
    const warnings: ParseWarning[] = [];
    const errors: ParseError[] = [];

    let appId = 'md-app';
    let appName = 'Markdown Documented App';
    let version = '1.0.0';
    let category = 'documentation';
    let description = '';

    const routes: RouteConfig[] = [];
    const featureToggles: Record<string, FeatureToggleConfig> = {};

    const titleMatch = mdContent.match(/^#\s+(.+)$/m);
    if (titleMatch) {
      appName = titleMatch[1].trim();
      appId = this.slugify(appName);
    }

    const versionMatch = mdContent.match(/Version:\s*([0-9]+\.[0-9]+\.[0-9]+)/i);
    if (versionMatch) {
      version = versionMatch[1];
    }

    const categoryMatch = mdContent.match(/Category:\s*([A-Za-z0-9_-]+)/i);
    if (categoryMatch) {
      category = categoryMatch[1];
    }

    const descMatch = mdContent.match(/Description:\s*(.+)$/m);
    if (descMatch) {
      description = descMatch[1].trim();
    }

    const routeRegex = /\|\s*(GET|POST|PUT|DELETE|PATCH)\s*\|\s*(`[^`]+`|\/[^\s|]+)\s*\|\s*([^|]*)\|/gi;
    let match: RegExpExecArray | null;
    while ((match = routeRegex.exec(mdContent)) !== null) {
      const method = match[1].toUpperCase() as RouteConfig['methods'][0];
      const path = match[2].replace(/`/g, '').trim();
      const details = match[3].trim();

      routes.push({
        path,
        methods: [method],
        authRequired: !details.toLowerCase().includes('public'),
        requiredScopes: [],
        roles: [],
        middleware: [],
      });
    }

    const manifest: AppManifest = {
      appId,
      appName,
      version,
      category,
      description,
      routes,
      security: { ...AppManifestParser.DEFAULT_SECURITY },
      featureToggles,
      dependencies: {},
      metadata: { mdLength: mdContent.length },
      parsedAt: new Date().toISOString(),
      parseFormat: 'markdown',
    };

    return {
      success: errors.length === 0,
      data: manifest,
      errors,
      warnings,
    };
  }

  public parseKeyValueConfig(kvContent: string): ParseResult<AppManifest> {
    const warnings: ParseWarning[] = [];
    const errors: ParseError[] = [];
    const map = new Map<string, string>();

    const lines = kvContent.split(/\r?\n/);
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || trimmed.startsWith('#')) continue;
      const eqIdx = trimmed.indexOf('=');
      if (eqIdx > 0) {
        const key = trimmed.substring(0, eqIdx).trim().toUpperCase();
        const value = trimmed.substring(eqIdx + 1).trim().replace(/^["']|["']$/g, '');
        map.set(key, value);
      }
    }

    const appId = map.get('APP_ID') || map.get('APP_NAME') || 'kv-configured-app';
    const appName = map.get('APP_NAME') || map.get('APP_TITLE') || appId;
    const version = map.get('APP_VERSION') || map.get('VERSION') || '1.0.0';
    const category = map.get('APP_CATEGORY') || 'service';
    const description = map.get('APP_DESCRIPTION') || '';

    const featureToggles: Record<string, FeatureToggleConfig> = {};
    for (const [k, v] of map.entries()) {
      if (k.startsWith('FEATURE_') || k.startsWith('ENABLE_')) {
        const featureKey = k.replace(/^FEATURE_/, '');
        const enabled = v.toLowerCase() === 'true' || v === '1';
        featureToggles[featureKey] = {
          key: featureKey,
          enabled,
          rolloutPercentage: enabled ? 100 : 0,
          requiredRoles: [],
          userOverrides: {},
          environment: 'all',
        };
      }
    }

    const manifest: AppManifest = {
      appId: this.slugify(appId),
      appName,
      version,
      category,
      description,
      routes: [],
      security: {
        ...AppManifestParser.DEFAULT_SECURITY,
        mfaRequired: map.get('REQUIRE_MFA')?.toLowerCase() === 'true',
        authenticationLevel: (map.get('AUTH_LEVEL')?.toLowerCase() as SecurityRequirements['authenticationLevel']) || 'bearer',
      },
      featureToggles,
      dependencies: {},
      metadata: Object.fromEntries(map.entries()),
      parsedAt: new Date().toISOString(),
      parseFormat: 'kv_pair',
    };

    return {
      success: errors.length === 0,
      data: manifest,
      errors,
      warnings,
    };
  }

  public async parseAndProcess(
    input: unknown,
    options: { persist?: boolean; requesterId?: string } = {}
  ): Promise<ParseResult<AppManifest> & { isValid: boolean; securityAudit: any; stored: boolean }> {
    const parseResult = this.autoParse(input);

    if (!parseResult.success || !parseResult.data) {
      return {
        ...parseResult,
        isValid: false,
        securityAudit: { status: 'FAILED', issues: ['Parsing failed'] },
        stored: false,
      };
    }

    const manifest = parseResult.data;

    let isValid = true;
    try {
      const validation = await AppManifestParser.validate(manifest);
      isValid = validation.valid;
      if (!isValid && validation.errors) {
        parseResult.errors.push(...validation.errors.map((err: any) => ({
          field: err.path || 'validation',
          message: err.message || 'Validation error',
          code: 'VALIDATION_ERROR',
        })));
      }
    } catch (err: any) {
      parseResult.warnings.push({
        field: 'validator',
        message: `Validation engine failed to run: ${err.message || err}`,
      });
    }

    let securityAudit: any = { status: 'UNAUDITED', issues: [] };
    try {
      securityAudit = await AppManifestParser.audit(manifest);
    } catch (err: any) {
      parseResult.warnings.push({
        field: 'securityAuditor',
        message: `Security auditor failed to run: ${err.message || err}`,
      });
    }

    let stored = false;
    if (options.persist && parseResult.errors.length === 0) {
      try {
        await AppManifestParser.saveManifest(manifest);
        stored = true;
      } catch (err: any) {
        parseResult.warnings.push({
          field: 'storageVault',
          message: `Failed to persist manifest to vault: ${err.message || err}`,
        });
      }
    }

    return {
      ...parseResult,
      isValid,
      securityAudit,
      stored,
    };
  }

  private extractString(
    obj: Record<string, unknown>,
    keys: string[],
    defaultValue: string,
    warnings: ParseWarning[]
  ): string {
    for (const key of keys) {
      if (typeof obj[key] === 'string' && (obj[key] as string).trim().length > 0) {
        return (obj[key] as string).trim();
      }
    }
    warnings.push({
      field: keys[0],
      message: `Field '${keys[0]}' was missing or empty. Defaulting to '${defaultValue}'.`,
      defaultValueUsed: defaultValue,
    });
    return defaultValue;
  }

  private extractOptionalString(obj: Record<string, unknown>, keys: string[]): string | undefined {
    for (const key of keys) {
      if (typeof obj[key] === 'string' && (obj[key] as string).trim().length > 0) {
        return (obj[key] as string).trim();
      }
    }
    return undefined;
  }

  private parseRoutes(rawRoutes: unknown, warnings: ParseWarning[]): RouteConfig[] {
    if (!Array.isArray(rawRoutes)) {
      if (rawRoutes) {
        warnings.push({ field: 'routes', message: 'Routes field exists but is not an array. Ignoring routes.' });
      }
      return [];
    }

    return rawRoutes.map((r, idx) => {
      if (typeof r !== 'object' || r === null) {
        return {
          path: `/route-${idx}`,
          methods: ['GET'],
          authRequired: true,
          requiredScopes: [],
          roles: [],
          middleware: [],
        };
      }

      const routeObj = r as Record<string, unknown>;
      const path = typeof routeObj.path === 'string' ? routeObj.path : `/endpoint-${idx}`;
      const rawMethods = Array.isArray(routeObj.methods)
        ? routeObj.methods
        : typeof routeObj.method === 'string'
        ? [routeObj.method]
        : ['GET'];

      const methods = rawMethods.map((m: unknown) => String(m).toUpperCase()) as RouteConfig['methods'];

      return {
        path,
        targetService: typeof routeObj.targetService === 'string' ? routeObj.targetService : undefined,
        methods,
        authRequired: typeof routeObj.authRequired === 'boolean' ? routeObj.authRequired : true,
        requiredScopes: Array.isArray(routeObj.requiredScopes) ? routeObj.requiredScopes.map(String) : [],
        roles: Array.isArray(routeObj.roles) ? routeObj.roles.map(String) : [],
        middleware: Array.isArray(routeObj.middleware) ? routeObj.middleware.map(String) : [],
        corsEnabled: Boolean(routeObj.corsEnabled),
      };
    });
  }

  private parseSecurity(rawSec: unknown, warnings: ParseWarning[]): SecurityRequirements {
    if (typeof rawSec !== 'object' || rawSec === null) {
      return { ...AppManifestParser.DEFAULT_SECURITY };
    }

    const secObj = rawSec as Record<string, unknown>;

    return {
      authenticationLevel: (secObj.authenticationLevel || secObj.authLevel || 'bearer') as SecurityRequirements['authenticationLevel'],
      requiredScopes: Array.isArray(secObj.requiredScopes) ? secObj.requiredScopes.map(String) : [],
      ipWhitelist: Array.isArray(secObj.ipWhitelist) ? secObj.ipWhitelist.map(String) : [],
      encryptionRequired: secObj.encryptionRequired !== false,
      mfaRequired: Boolean(secObj.mfaRequired),
      complianceFrameworks: Array.isArray(secObj.complianceFrameworks)
        ? (secObj.complianceFrameworks.map(String) as SecurityRequirements['complianceFrameworks'])
        : ['AZURE_GOV'],
      rateLimitingTier: (secObj.rateLimitingTier || 'standard') as SecurityRequirements['rateLimitingTier'],
    };
  }

  private parseFeatureToggles(rawFlags: unknown, warnings: ParseWarning[]): Record<string, FeatureToggleConfig> {
    const result: Record<string, FeatureToggleConfig> = {};

    if (!rawFlags || typeof rawFlags !== 'object') {
      return result;
    }

    if (Array.isArray(rawFlags)) {
      for (const flag of rawFlags) {
        if (typeof flag === 'object' && flag !== null && flag.key) {
          result[flag.key] = {
            key: String(flag.key),
            enabled: Boolean(flag.enabled),
            rolloutPercentage: typeof flag.rolloutPercentage === 'number' ? flag.rolloutPercentage : 100,
            requiredRoles: Array.isArray(flag.requiredRoles) ? flag.requiredRoles.map(String) : [],
            userOverrides: typeof flag.userOverrides === 'object' ? (flag.userOverrides as Record<string, boolean>) : {},
            environment: flag.environment || 'all',
            description: flag.description ? String(flag.description) : undefined,
          };
        }
      }
      return result;
    }

    for (const [key, val] of Object.entries(rawFlags as Record<string, unknown>)) {
      if (typeof val === 'boolean') {
        result[key] = {
          key,
          enabled: val,
          rolloutPercentage: val ? 100 : 0,
          requiredRoles: [],
          userOverrides: {},
          environment: 'all',
        };
      } else if (typeof val === 'object' && val !== null) {
        const flagObj = val as Record<string, unknown>;
        result[key] = {
          key,
          enabled: Boolean(flagObj.enabled),
          rolloutPercentage: typeof flagObj.rolloutPercentage === 'number' ? flagObj.rolloutPercentage : 100,
          requiredRoles: Array.isArray(flagObj.requiredRoles) ? flagObj.requiredRoles.map(String) : [],
          userOverrides: typeof flagObj.userOverrides === 'object' ? (flagObj.userOverrides as Record<string, boolean>) : {},
          environment: (flagObj.environment as FeatureToggleConfig['environment']) || 'all',
          description: flagObj.description ? String(flagObj.description) : undefined,
        };
      }
    }

    return result;
  }

  private parseDependencies(rawDeps: unknown, warnings: ParseWarning[]): Record<string, string> {
    if (typeof rawDeps !== 'object' || rawDeps === null) {
      return {};
    }
    const result: Record<string, string> = {};
    for (const [k, v] of Object.entries(rawDeps as Record<string, unknown>)) {
      result[k] = String(v);
    }
    return result;
  }

  private slugify(text: string): string {
    return text
      .toLowerCase()
      .trim()
      .replace(/[^\w\s-]/g, '')
      .replace(/[\s_-]+/g, '-')
      .replace(/^-+|-+$/g, '');
  }
}

export const appManifestParser = new AppManifestParser();

export function getAppManifestParserRouter(): Router {
  const router = Router();

  const authMiddleware = (req: Request, res: Response, next: NextFunction) => {
    if (typeof AppRegistryAuth === 'function') {
      return AppRegistryAuth(req, res, next);
    }
    next();
  };

  router.post('/parse', async (req: Request, res: Response) => {
    try {
      const { content } = req.body;
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Missing "content" field in request body.',
        });
      }

      const result = appManifestParser.autoParse(content);
      return res.status(result.success ? 200 : 422).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during manifest parsing.',
      });
    }
  });

  router.post('/process', authMiddleware, async (req: Request, res: Response) => {
    try {
      const { content, persist } = req.body;
      if (!content) {
        return res.status(400).json({
          success: false,
          error: 'Missing "content" field in request body.',
        });
      }

      const result = await appManifestParser.parseAndProcess(content, {
        persist: !!persist,
        requesterId: (req as any).user?.id,
      });

      return res.status(result.success ? 200 : 422).json(result);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during manifest processing.',
      });
    }
  });

  router.post('/validate', async (req: Request, res: Response) => {
    try {
      const manifest = req.body;
      if (!manifest || typeof manifest !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid manifest object provided.',
        });
      }

      const validationResult = await AppManifestParser.validate(manifest);
      return res.status(200).json(validationResult);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during manifest validation.',
      });
    }
  });

  router.post('/audit', authMiddleware, async (req: Request, res: Response) => {
    try {
      const manifest = req.body;
      if (!manifest || typeof manifest !== 'object') {
        return res.status(400).json({
          success: false,
          error: 'Invalid manifest object provided.',
        });
      }

      const auditResult = await AppManifestParser.audit(manifest);
      return res.status(200).json(auditResult);
    } catch (error: any) {
      return res.status(500).json({
        success: false,
        error: error.message || 'Internal server error during security auditing.',
      });
    }
  });

  router.get('/templates', (req: Request, res: Response) => {
    const templates = {
      json: {
        appId: "sample-app",
        appName: "Sample Application",
        version: "1.0.0",
        category: "utility",
        description: "A sample application manifest template.",
        routes: [
          {
            path: "/api/v1/data",
            methods: ["GET", "POST"],
            authRequired: true,
            requiredScopes: ["read:data", "write:data"],
            roles: ["admin", "user"],
            middleware: ["rateLimiter"]
          }
        ],
        security: {
          authenticationLevel: "bearer",
          requiredScopes: ["read:data"],
          ipWhitelist: [],
          encryptionRequired: true,
          mfaRequired: false,
          complianceFrameworks: ["AZURE_GOV"],
          rateLimitingTier: "standard"
        },
        featureToggles: {
          ENABLE_BETA_FEATURES: {
            key: "ENABLE_BETA_FEATURES",
            enabled: false,
            rolloutPercentage: 0,
            requiredRoles: ["beta-tester"],
            userOverrides: {},
            environment: "staging"
          }
        },
        dependencies: {
          "auth-service": "^2.1.0"
        },
        metadata: {}
      },
      markdown: `# Sample Application\n\nVersion: 1.0.0\nCategory: utility\nDescription: A sample application manifest template.\n\n| Method | Path | Details |\n|---|---|---|\n| GET | /api/v1/data | authRequired, scope: read:data |\n| POST | /api/v1/data | authRequired, scope: write:data |`,
      kv: `APP_ID=sample-app\nAPP_NAME=Sample Application\nAPP_VERSION=1.0.0\nAPP_CATEGORY=utility\nAPP_DESCRIPTION=A sample application manifest template.\nREQUIRE_MFA=false\nAUTH_LEVEL=bearer\nFEATURE_ENABLE_BETA_FEATURES=false`
    };

    return res.status(200).json({ success: true, templates });
  });

  return router;
}

export default appManifestParser;