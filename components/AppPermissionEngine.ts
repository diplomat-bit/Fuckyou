

// --- CONSOLIDATED FROM: ./api/AppRegistry/AppPermissionEngine.ts ---

import { createHmac, randomBytes } from 'crypto';
import { Router, Request, Response, NextFunction } from 'express';

/**
 * Access Levels for Role-Based Access Control (RBAC)
 */
export enum AccessLevel {
  NONE = 0,
  READ = 1,
  WRITE = 2,
  EXECUTE = 4,
  ADMIN = 8,
  SUPER_ADMIN = 16,
}

/**
 * TokenType classification for dynamic entitlement tokens
 */
export enum TokenType {
  ENTITLEMENT = 'ENTITLEMENT',
  DELEGATED_SCOPE = 'DELEGATED_SCOPE',
  TEMPORARY_ELEVATION = 'TEMPORARY_ELEVATION',
  SERVICE_SESSION = 'SERVICE_SESSION',
}

/**
 * Denial reasons for audit and telemetry logging
 */
export enum DenialReason {
  INVALID_TOKEN = 'INVALID_TOKEN',
  TOKEN_EXPIRED = 'TOKEN_EXPIRED',
  TOKEN_REVOKED = 'TOKEN_REVOKED',
  INSUFFICIENT_ACCESS_LEVEL = 'INSUFFICIENT_ACCESS_LEVEL',
  SCOPE_MISMATCH = 'SCOPE_MISMATCH',
  ROLE_NOT_ASSIGNED = 'ROLE_NOT_ASSIGNED',
  CONDITION_FAILED = 'CONDITION_FAILED',
  GEO_RESTRICTED = 'GEO_RESTRICTED',
  TIME_OUT_OF_BOUNDS = 'TIME_OUT_OF_BOUNDS',
  RATE_EXCEEDED = 'RATE_EXCEEDED',
}

export interface ScopeRequirement {
  resource: string;
  action: string;
  domain?: string;
}

export interface PolicyCondition {
  field: string;
  operator: 'EQUALS' | 'NOT_EQUALS' | 'IN' | 'NOT_IN' | 'GREATER_THAN' | 'LESS_THAN' | 'CONTAINS';
  value: any;
}

export interface AppPermission {
  id: string;
  scope: string; // e.g., "financial:transfers:write", "sovereign:vault:*"
  accessLevel: AccessLevel;
  conditions?: PolicyCondition[];
  description?: string;
  createdAt: number;
}

export interface Role {
  id: string;
  name: string;
  description: string;
  permissions: AppPermission[];
  inherits?: string[]; // Parent role IDs
  metadata?: Record<string, any>;
}

export interface EvaluationContext {
  appId: string;
  userId?: string;
  roles: string[];
  requiredScope: string;
  requiredAccessLevel?: AccessLevel;
  clientIp?: string;
  geoCountry?: string;
  currentTime?: number;
  environmentAttributes?: Record<string, any>;
}

export interface EvaluationResult {
  allowed: boolean;
  reason?: DenialReason | string;
  matchedPermission?: AppPermission;
  evaluatedScopes: string[];
  evaluatedRoles: string[];
  issuedEntitlementId?: string;
  timestamp: number;
}

export interface EntitlementTokenPayload {
  tokenId: string;
  appId: string;
  subjectId: string;
  roles: string[];
  grantedScopes: string[];
  maxAccessLevel: AccessLevel;
  type: TokenType;
  issuedAt: number;
  expiresAt: number;
  notBefore?: number;
  attributes?: Record<string, any>;
}

export class AppPermissionEngine {
  private roles: Map<string, Role> = new Map();
  private appRoleAssignments: Map<string, Set<string>> = new Map();
  private revokedTokenIds: Set<string> = new Set();
  private hmacSecret: string;

  constructor(secretKey?: string) {
    this.hmacSecret = secretKey || process.env.APP_PERMISSION_SECRET || 'oko-sovereign-default-secret-key-32bytes!';
    this.seedDefaultSystemRoles();
  }

  /**
   * Seed fundamental system roles for the platform
   */
  private seedDefaultSystemRoles(): void {
    const adminPermission: AppPermission = {
      id: 'perm-system-admin',
      scope: '*:*',
      accessLevel: AccessLevel.SUPER_ADMIN,
      createdAt: Date.now(),
      description: 'Full uninhibited system control',
    };

    const readOnlyPermission: AppPermission = {
      id: 'perm-system-reader',
      scope: '*:read',
      accessLevel: AccessLevel.READ,
      createdAt: Date.now(),
      description: 'System-wide read access',
    };

    this.registerRole({
      id: 'role-super-admin',
      name: 'Super Admin',
      description: 'Global administrator with elevated privileges',
      permissions: [adminPermission],
    });

    this.registerRole({
      id: 'role-global-auditor',
      name: 'Global Auditor',
      description: 'Read-only access across all micro-apps',
      permissions: [readOnlyPermission],
    });
  }

  /**
   * Register or update a role definition
   */
  public registerRole(role: Role): void {
    this.roles.set(role.id, role);
  }

  /**
   * Get role details
   */
  public getRole(roleId: string): Role | undefined {
    return this.roles.get(roleId);
  }

  /**
   * Assign roles to a specific application or service principal
   */
  public assignRolesToApp(appId: string, roleIds: string[]): void {
    const existing = this.appRoleAssignments.get(appId) || new Set();
    roleIds.forEach((rId) => {
      if (this.roles.has(rId)) {
        existing.add(rId);
      }
    });
    this.appRoleAssignments.set(appId, existing);
  }

  /**
   * Evaluate if a given application context satisfies requested scope and access
   */
  public evaluate(context: EvaluationContext): EvaluationResult {
    const now = context.currentTime || Date.now();
    const effectiveRoles = this.resolveRoleHierarchy(context.roles);
    const evaluatedScopes: string[] = [];

    if (effectiveRoles.length === 0) {
      return {
        allowed: false,
        reason: DenialReason.ROLE_NOT_ASSIGNED,
        evaluatedScopes: [],
        evaluatedRoles: [],
        timestamp: now,
      };
    }

    let highestMatchedPermission: AppPermission | null = null;
    const requiredLevel = context.requiredAccessLevel || AccessLevel.READ;

    for (const roleId of effectiveRoles) {
      const role = this.roles.get(roleId);
      if (!role) continue;

      for (const perm of role.permissions) {
        evaluatedScopes.push(perm.scope);

        if (this.matchesScopePattern(perm.scope, context.requiredScope)) {
          if ((perm.accessLevel & requiredLevel) === requiredLevel || perm.accessLevel >= requiredLevel) {
            if (this.evaluateConditions(perm.conditions, context)) {
              if (!highestMatchedPermission || perm.accessLevel > highestMatchedPermission.accessLevel) {
                highestMatchedPermission = perm;
              }
            }
          }
        }
      }
    }

    if (highestMatchedPermission) {
      return {
        allowed: true,
        matchedPermission: highestMatchedPermission,
        evaluatedScopes,
        evaluatedRoles: effectiveRoles,
        timestamp: now,
      };
    }

    return {
      allowed: false,
      reason: DenialReason.INSUFFICIENT_ACCESS_LEVEL,
      evaluatedScopes,
      evaluatedRoles: effectiveRoles,
      timestamp: now,
    };
  }

  /**
   * Generate a signed dynamic entitlement token for dynamic app access
   */
  public generateEntitlementToken(
    appId: string,
    subjectId: string,
    requestedScopes: string[],
    ttlMs: number = 3600000,
    type: TokenType = TokenType.ENTITLEMENT,
    attributes?: Record<string, any>
  ): { token: string; payload: EntitlementTokenPayload } {
    const now = Date.now();
    const assignedRoles = Array.from(this.appRoleAssignments.get(appId) || []);

    const payload: EntitlementTokenPayload = {
      tokenId: `ent-${randomBytes(12).toString('hex')}`,
      appId,
      subjectId,
      roles: assignedRoles,
      grantedScopes: requestedScopes,
      maxAccessLevel: AccessLevel.ADMIN,
      type,
      issuedAt: now,
      expiresAt: now + ttlMs,
      attributes,
    };

    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString('base64url');
    const signature = this.signString(encodedPayload);
    const token = `${encodedPayload}.${signature}`;

    return { token, payload };
  }

  /**
   * Verify and decode dynamic entitlement token
   */
  public verifyEntitlementToken(token: string): EntitlementTokenPayload {
    const parts = token.split('.');
    if (parts.length !== 2) {
      throw new Error('Invalid token structure format');
    }

    const [encodedPayload, signature] = parts;
    const expectedSignature = this.signString(encodedPayload);

    if (signature !== expectedSignature) {
      throw new Error('Token signature validation failed');
    }

    const payload: EntitlementTokenPayload = JSON.parse(
      Buffer.from(encodedPayload, 'base64url').toString('utf-8')
    );

    if (this.revokedTokenIds.has(payload.tokenId)) {
      throw new Error(DenialReason.TOKEN_REVOKED);
    }

    const now = Date.now();
    if (now > payload.expiresAt) {
      throw new Error(DenialReason.TOKEN_EXPIRED);
    }

    if (payload.notBefore && now < payload.notBefore) {
      throw new Error(DenialReason.TOKEN_EXPIRED);
    }

    return payload;
  }

  /**
   * Revoke an active dynamic entitlement token by ID
   */
  public revokeToken(tokenId: string): void {
    this.revokedTokenIds.add(tokenId);
  }

  /**
   * Check wildcard and colon-delimited scope hierarchy (e.g. "finance:treasury:*" matches "finance:treasury:read")
   */
  public matchesScopePattern(pattern: string, requestedScope: string): boolean {
    if (pattern === '*' || pattern === '*:*') return true;
    if (pattern === requestedScope) return true;

    const patternParts = pattern.split(':');
    const requestedParts = requestedScope.split(':');

    for (let i = 0; i < patternParts.length; i++) {
      const pPart = patternParts[i];
      const rPart = requestedParts[i];

      if (pPart === '*') return true; // Wildcard matches all subsequent parts
      if (pPart === '**') return true; // Multi-level wildcard
      if (rPart === undefined) return false;
      if (pPart !== rPart) return false;
    }

    return patternParts.length === requestedParts.length;
  }

  /**
   * Resolve inheritances across parent roles recursively
   */
  private resolveRoleHierarchy(roleIds: string[]): string[] {
    const resolved = new Set<string>();

    const traverse = (rId: string) => {
      if (resolved.has(rId)) return;
      resolved.add(rId);

      const role = this.roles.get(rId);
      if (role && role.inherits) {
        role.inherits.forEach((parent) => traverse(parent));
      }
    };

    roleIds.forEach((id) => traverse(id));
    return Array.from(resolved);
  }

  /**
   * Attribute-based policy condition evaluation engine
   */
  private evaluateConditions(conditions: PolicyCondition[] | undefined, context: EvaluationContext): boolean {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      const fieldValue = this.extractContextValue(cond.field, context);

      switch (cond.operator) {
        case 'EQUALS':
          if (fieldValue !== cond.value) return false;
          break;
        case 'NOT_EQUALS':
          if (fieldValue === cond.value) return false;
          break;
        case 'IN':
          if (!Array.isArray(cond.value) || !cond.value.includes(fieldValue)) return false;
          break;
        case 'NOT_IN':
          if (Array.isArray(cond.value) && cond.value.includes(fieldValue)) return false;
          break;
        case 'CONTAINS':
          if (typeof fieldValue === 'string' && !fieldValue.includes(cond.value)) return false;
          if (Array.isArray(fieldValue) && !fieldValue.includes(cond.value)) return false;
          break;
        case 'GREATER_THAN':
          if (Number(fieldValue) <= Number(cond.value)) return false;
          break;
        case 'LESS_THAN':
          if (Number(fieldValue) >= Number(cond.value)) return false;
          break;
        default:
          return false;
      }
    }

    return true;
  }

  /**
   * Safely extract deep properties from EvaluationContext
   */
  private extractContextValue(path: string, context: EvaluationContext): any {
    const parts = path.split('.');
    let current: any = context;

    for (const part of parts) {
      if (current === undefined || current === null) return undefined;
      current = current[part];
    }

    return current;
  }

  /**
   * HMAC signature creator for entitlement tokens
   */
  private signString(data: string): string {
    return createHmac('sha256', this.hmacSecret).update(data).digest('base64url');
  }

  /**
   * Express middleware generator for protecting routes
   */
  public protect(requiredScope: string, requiredLevel: AccessLevel = AccessLevel.READ) {
    return (req: Request, res: Response, next: NextFunction) => {
      try {
        const authHeader = req.headers.authorization;
        if (!authHeader || !authHeader.startsWith('Bearer ')) {
          return res.status(401).json({ error: 'Unauthorized: Missing or invalid Authorization header' });
        }

        const token = authHeader.split(' ')[1];
        const payload = this.verifyEntitlementToken(token);

        const context: EvaluationContext = {
          appId: payload.appId,
          userId: payload.subjectId,
          roles: payload.roles,
          requiredScope,
          requiredAccessLevel: requiredLevel,
          clientIp: req.ip,
          currentTime: Date.now(),
          environmentAttributes: {
            headers: req.headers,
            method: req.method,
            path: req.path,
            ...payload.attributes,
          },
        };

        const result = this.evaluate(context);
        if (!result.allowed) {
          return res.status(403).json({
            error: 'Forbidden: Insufficient permissions',
            reason: result.reason,
            evaluatedScopes: result.evaluatedScopes,
          });
        }

        (req as any).permissionContext = {
          tokenPayload: payload,
          evaluationResult: result,
        };

        return next();
      } catch (error: any) {
        return res.status(401).json({ error: `Unauthorized: ${error.message}` });
      }
    };
  }
}

// Global shared instance export
export const defaultAppPermissionEngine = new AppPermissionEngine();

/**
 * Express Router factory for AppPermissionEngine
 */
export function createAppPermissionRouter(engine: AppPermissionEngine): Router {
  const router = Router();

  // Evaluate permission context
  router.post('/evaluate', (req: Request, res: Response) => {
    try {
      const context = req.body;
      if (!context || !context.appId || !context.requiredScope) {
        return res.status(400).json({ error: 'Missing required fields: appId, requiredScope' });
      }
      const result = engine.evaluate(context);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Register a role
  router.post('/roles', (req: Request, res: Response) => {
    try {
      const role = req.body;
      if (!role || !role.id || !role.name || !Array.isArray(role.permissions)) {
        return res.status(400).json({ error: 'Invalid role payload' });
      }
      engine.registerRole(role);
      return res.status(201).json({ message: 'Role registered successfully', role });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Get a role
  router.get('/roles/:id', (req: Request, res: Response) => {
    try {
      const role = engine.getRole(req.params.id as string);
      if (!role) {
        return res.status(404).json({ error: 'Role not found' });
      }
      return res.json(role);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Assign roles to an app
  router.post('/apps/:appId/roles', (req: Request, res: Response) => {
    try {
      const { appId } = req.params;
      const { roleIds } = req.body;
      if (!Array.isArray(roleIds)) {
        return res.status(400).json({ error: 'roleIds must be an array of strings' });
      }
      engine.assignRolesToApp(appId as string, roleIds);
      return res.json({ message: `Roles assigned to app ${appId} successfully` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Generate entitlement token
  router.post('/tokens/generate', (req: Request, res: Response) => {
    try {
      const { appId, subjectId, requestedScopes, ttlMs, type, attributes } = req.body;
      if (!appId || !subjectId || !Array.isArray(requestedScopes)) {
        return res.status(400).json({ error: 'Missing required fields: appId, subjectId, requestedScopes' });
      }
      const result = engine.generateEntitlementToken(appId, subjectId, requestedScopes, ttlMs, type, attributes);
      return res.json(result);
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  // Verify entitlement token
  router.post('/tokens/verify', (req: Request, res: Response) => {
    try {
      const { token } = req.body;
      if (!token) {
        return res.status(400).json({ error: 'Missing token' });
      }
      const payload = engine.verifyEntitlementToken(token);
      return res.json({ valid: true, payload });
    } catch (error: any) {
      return res.status(400).json({ valid: false, error: error.message });
    }
  });

  // Revoke entitlement token
  router.post('/tokens/revoke', (req: Request, res: Response) => {
    try {
      const { tokenId } = req.body;
      if (!tokenId) {
        return res.status(400).json({ error: 'Missing tokenId' });
      }
      engine.revokeToken(tokenId);
      return res.json({ message: `Token ${tokenId} revoked successfully` });
    } catch (error: any) {
      return res.status(500).json({ error: error.message });
    }
  });

  return router;
}

// Global shared router export
export const appPermissionRouter = createAppPermissionRouter(defaultAppPermissionEngine);

export default AppPermissionEngine;