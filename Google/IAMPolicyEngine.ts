import { dbBridge } from './DatabaseBridge';
import { pubSub } from './PubSubLocal';
import { secretVault } from './SecretVault';
import { monitor } from './MonitoringService';

export interface IAMCondition {
  title: string;
  description?: string;
  expression: string; // Evaluated CEL-like expression (e.g., "request.time < timestamp('2026-01-01T00:00:00Z')")
}

export interface Binding {
  role: string; // e.g., "roles/viewer", "roles/storage.admin", "roles/custom.dataEngineer"
  members: string[]; // e.g., "user:alice@local.dev", "serviceAccount:sa-1@local.dev", "group:engineers", "allUsers", "allAuthenticatedUsers"
  condition?: IAMCondition;
}

export interface AuditLogConfig {
  logType: 'ADMIN_READ' | 'DATA_READ' | 'DATA_WRITE';
  exemptedMembers?: string[];
}

export interface AuditConfig {
  service: string;
  auditLogConfigs: AuditLogConfig[];
}

export interface IAMPolicy {
  version: number;
  bindings: Binding[];
  auditConfigs?: AuditConfig[];
  etag?: string;
}

export interface Role {
  name: string; // e.g., "roles/resourcemanager.organizationAdmin"
  title: string;
  description?: string;
  includedPermissions: string[]; // e.g., ["storage.buckets.get", "storage.buckets.list"]
  stage?: 'ALPHA' | 'BETA' | 'GA' | 'DEPRECATED';
  deleted?: boolean;
}

export interface ResourceNode {
  id: string; // e.g., "organizations/123", "folders/456", "projects/my-local-proj", "buckets/my-bucket"
  type: string; // e.g., "organization", "folder", "project", "bucket"
  parentId?: string;
  policy?: IAMPolicy;
}

export interface AccessRequest {
  principal: string; // e.g., "user:alice@local.dev", "serviceAccount:builder@local.dev"
  permission: string; // e.g., "storage.objects.get"
  resourceId: string; // Target resource ID
  context?: Record<string, any>; // Runtime context for dynamic conditions (e.g., time, ip, resource tags)
}

export interface AccessDecision {
  allowed: boolean;
  principal: string;
  permission: string;
  resourceId: string;
  matchedRole?: string;
  matchedBinding?: Binding;
  reason: string;
  evaluatedAt: string;
}

export interface IAMAuditRecord {
  id: string;
  timestamp: string;
  decision: AccessDecision;
}

export class IAMPolicyEngine {
  private roles: Map<string, Role> = new Map();
  private resources: Map<string, ResourceNode> = new Map();
  private auditTrail: IAMAuditRecord[] = [];

  constructor() {
    this.initializeDefaultRoles();
    this.loadPersistedData();
  }

  /**
   * Loads persisted roles and resources from the local DatabaseBridge.
   */
  private async loadPersistedData(): Promise<void> {
    try {
      // Load custom roles from DatabaseBridge
      const rolesSnap = await dbBridge.getDocs<Role>('iam_roles');
      for (const doc of rolesSnap.docs) {
        const role = doc.data();
        if (role) {
          this.roles.set(role.name, role);
        }
      }

      // Load resources from DatabaseBridge
      const resourcesSnap = await dbBridge.getDocs<ResourceNode>('iam_resources');
      for (const doc of resourcesSnap.docs) {
        const resource = doc.data();
        if (resource) {
          this.resources.set(resource.id, resource);
        }
      }
    } catch (error) {
      console.warn('[IAMPolicyEngine] Failed to load persisted IAM data:', error);
    }
  }

  /**
   * Initializes standard pre-defined GCP-style roles locally.
   */
  private initializeDefaultRoles(): void {
    const defaultRoles: Role[] = [
      {
        name: 'roles/owner',
        title: 'Owner',
        description: 'Full access to all resources.',
        includedPermissions: ['*'],
        stage: 'GA',
      },
      {
        name: 'roles/editor',
        title: 'Editor',
        description: 'Edit access to all resources except access control.',
        includedPermissions: [
          '*.get',
          '*.list',
          '*.create',
          '*.update',
          '*.delete',
        ],
        stage: 'GA',
      },
      {
        name: 'roles/viewer',
        title: 'Viewer',
        description: 'Read-only access to all resources.',
        includedPermissions: ['*.get', '*.list'],
        stage: 'GA',
      },
      {
        name: 'roles/storage.admin',
        title: 'Storage Admin',
        description: 'Full control of Cloud Storage resources.',
        includedPermissions: [
          'storage.buckets.*',
          'storage.objects.*',
          'storage.hmacKeys.*',
        ],
        stage: 'GA',
      },
      {
        name: 'roles/storage.objectViewer',
        title: 'Storage Object Viewer',
        description: 'Grants access to view Storage Objects.',
        includedPermissions: ['storage.objects.get', 'storage.objects.list'],
        stage: 'GA',
      },
      {
        name: 'roles/compute.admin',
        title: 'Compute Admin',
        description: 'Full control of compute resources.',
        includedPermissions: ['compute.*'],
        stage: 'GA',
      },
      {
        name: 'roles/iam.serviceAccountUser',
        title: 'Service Account User',
        description: 'Run operations as a service account.',
        includedPermissions: ['iam.serviceAccounts.actAs'],
        stage: 'GA',
      },
    ];

    for (const role of defaultRoles) {
      this.roles.set(role.name, { ...role });
    }
  }

  /**
   * Registers or updates a role definition.
   */
  public registerRole(role: Role): void {
    this.roles.set(role.name, { ...role });
    dbBridge.setDoc('iam_roles', role.name, role).catch(err => 
      console.error('[IAMPolicyEngine] Failed to persist role:', err)
    );
    pubSub.publish('iam.role_registered', { roleName: role.name });
  }

  /**
   * Retrieves a role definition by name.
   */
  public getRole(roleName: string): Role | undefined {
    return this.roles.get(roleName);
  }

  /**
   * Registers a resource in the local hierarchical tree.
   */
  public registerResource(resource: ResourceNode): void {
    const node = {
      ...resource,
      policy: resource?.policy ?? { version: 1, bindings: [] },
    };
    this.resources.set(resource.id, node);
    dbBridge.setDoc('iam_resources', resource.id, node).catch(err =>
      console.error('[IAMPolicyEngine] Failed to persist resource:', err)
    );
    pubSub.publish('iam.resource_registered', { resourceId: resource.id, type: resource.type });
  }

  /**
   * Assigns or overrides an IAM Policy on a resource.
   */
  public setIamPolicy(resourceId: string, policy: IAMPolicy): IAMPolicy {
    let resource = this.resources.get(resourceId);
    if (!resource) {
      resource = {
        id: resourceId,
        type: 'custom',
        policy,
      };
      this.resources.set(resourceId, resource);
    } else {
      resource.policy = policy;
    }

    // Generate ETag for consistency checking
    if (resource.policy) {
      resource.policy.etag = this.generateETag(policy);
    }

    dbBridge.setDoc('iam_resources', resourceId, resource).catch(err =>
      console.error('[IAMPolicyEngine] Failed to persist resource policy:', err)
    );

    pubSub.publish('iam.policy_updated', { resourceId, policy });

    return resource.policy ?? { version: 1, bindings: [] };
  }

  /**
   * Returns the explicit IAM policy attached to a resource.
   */
  public getIamPolicy(resourceId: string): IAMPolicy {
    const policy = this.resources.get(resourceId)?.policy;
    return policy ?? { version: 1, bindings: [] };
  }

  /**
   * Evaluates if a principal has permission on a specific resource considering policy inheritance up the resource hierarchy.
   */
  public evaluateAccess(request: AccessRequest): AccessDecision {
    const timestamp = new Date().toISOString();
    const ancestors = this.getResourceAncestry(request.resourceId);

    // Evaluate policies from bottom to top (or aggregated)
    for (const resource of ancestors) {
      if (!resource.policy || !resource.policy.bindings) continue;

      for (const binding of resource.policy.bindings) {
        if (this.isMemberMatched(request.principal, binding.members)) {
          if (binding.condition && !this.evaluateCondition(binding.condition, request.context || {})) {
            continue; // Condition failed, skip this binding
          }

          const role = this.roles.get(binding.role);
          if (role && this.hasPermission(role.includedPermissions, request.permission)) {
            const decision: AccessDecision = {
              allowed: true,
              principal: request.principal,
              permission: request.permission,
              resourceId: request.resourceId,
              matchedRole: binding.role,
              matchedBinding: binding,
              reason: `Granted by role '${binding.role}' bound at resource '${resource.id}'`,
              evaluatedAt: timestamp,
            };
            this.recordAudit(decision);
            return decision;
          }
        }
      }
    }

    const denyDecision: AccessDecision = {
      allowed: false,
      principal: request.principal,
      permission: request.permission,
      resourceId: request.resourceId,
      reason: `No matching binding found granting permission '${request.permission}' to '${request.principal}' on resource hierarchy.`,
      evaluatedAt: timestamp,
    };
    this.recordAudit(denyDecision);
    return denyDecision;
  }

  /**
   * Batch tests permissions for a principal against a resource.
   */
  public testIamPermissions(
    principal: string,
    resourceId: string,
    permissions: string[],
    context: Record<string, any> = {}
  ): string[] {
    const allowedPermissions: string[] = [];
    for (const perm of permissions) {
      const decision = this.evaluateAccess({
        principal,
        permission: perm,
        resourceId,
        context,
      });
      if (decision.allowed) {
        allowedPermissions.push(perm);
      }
    }
    return allowedPermissions;
  }

  /**
   * Returns ancestry list starting from target resource up to root organization.
   */
  private getResourceAncestry(resourceId: string): ResourceNode[] {
    const ancestry: ResourceNode[] = [];
    let currentId: string | undefined = resourceId;

    while (currentId) {
      const resource = this.resources.get(currentId);
      if (resource) {
        ancestry.push(resource);
        currentId = resource.parentId;
      } else {
        // If resource is implicitly referenced without explicit registration, create virtual node
        ancestry.push({
          id: currentId,
          type: 'virtual',
          policy: { version: 1, bindings: [] },
        });
        currentId = undefined;
      }
    }

    return ancestry;
  }

  /**
   * Validates principal identity against binding member declarations.
   */
  private isMemberMatched(principal: string, members: string[]): boolean {
    if (members.includes('allUsers')) return true;
    if (members.includes('allAuthenticatedUsers') && principal !== 'anonymous') return true;
    if (members.includes(principal)) return true;

    // Domain wildcard match (e.g. "domain:example.com")
    const principalDomain = principal.split('@')[1];
    if (principalDomain && members.includes(`domain:${principalDomain}`)) {
      return true;
    }

    return false;
  }

  /**
   * Simple wildcard matching for granular permission evaluation.
   */
  private hasPermission(grantedPermissions: string[], requiredPermission: string): boolean {
    for (const pattern of grantedPermissions) {
      if (pattern === '*') return true;
      if (pattern === requiredPermission) return true;

      if (pattern.endsWith('.*')) {
        const prefix = pattern.slice(0, -2);
        if (requiredPermission.startsWith(prefix + '.')) {
          return true;
        }
      }

      if (pattern.includes('*')) {
        const regexPattern = '^' + pattern.replace(/\./g, '\\.').replace(/\*/g, '.*') + '$';
        const regex = new RegExp(regexPattern);
        if (regex.test(requiredPermission)) {
          return true;
        }
      }
    }
    return false;
  }

  /**
   * Evaluates dynamic conditional expressions.
   */
  private evaluateCondition(condition: IAMCondition, context: Record<string, any>): boolean {
    try {
      const expr = condition.expression;

      // Handle simple timestamp checks
      if (expr.includes('request.time')) {
        const match = expr.match(/request\.time\s*(<|>|<=|>=|==)\s*timestamp\(['"](.*?)['"]\)/);
        if (match) {
          const [, operator, targetTimeString] = match;
          const reqTime = new Date(context['request.time'] || Date.now()).getTime();
          const targetTime = new Date(targetTimeString).getTime();

          switch (operator) {
            case '<': return reqTime < targetTime;
            case '>': return reqTime > targetTime;
            case '<=': return reqTime <= targetTime;
            case '>=': return reqTime >= targetTime;
            case '==': return reqTime === targetTime;
          }
        }
      }

      // Handle client IP checks
      if (expr.includes('request.ip')) {
        const match = expr.match(/request\.ip\s*==\s*['"](.*?)['"]/);
        if (match) {
          const [, expectedIp] = match;
          return context['request.ip'] === expectedIp;
        }
      }

      // Safe fallback key-value evaluation from context
      const fn = new Function('context', `
        try {
          const { request, resource } = context;
          return !!(${expr.replace(/timestamp\((.*?)\)/g, 'new Date($1).getTime()')});
        } catch (e) {
          return false;
        }
      `);
      return Boolean(fn(context));
    } catch {
      return false;
    }
  }

  /**
   * Appends an evaluation record to the local audit trail log.
   */
  private recordAudit(decision: AccessDecision): void {
    const record: IAMAuditRecord = {
      id: `audit-${Math.random().toString(36).substring(2, 10)}`,
      timestamp: decision.evaluatedAt,
      decision,
    };
    this.auditTrail.push(record);
    if (this.auditTrail.length > 5000) {
      this.auditTrail.shift(); // Bound memory footprint
    }

    // Persist to DatabaseBridge
    dbBridge.setDoc('iam_audit_trail', record.id, record).catch(err =>
      console.error('[IAMPolicyEngine] Failed to persist audit record:', err)
    );

    // Log to MonitoringService
    const logLevel = decision.allowed ? 'info' : 'warn';
    monitor.log(
      logLevel,
      'IAMPolicyEngine',
      `Access ${decision.allowed ? 'GRANTED' : 'DENIED'} for ${decision.principal} on ${decision.resourceId} (${decision.permission})`,
      { decision }
    );

    // Publish event
    pubSub.publish('iam.access_evaluated', record);
  }

  /**
   * Retrieves the current audit records.
   */
  public getAuditTrail(limit: number = 100): IAMAuditRecord[] {
    return this.auditTrail.slice(-limit);
  }

  /**
   * Generates a deterministic hash ETag for an IAM policy.
   */
  private generateETag(policy: IAMPolicy): string {
    const str = JSON.stringify(policy.bindings);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash |= 0;
    }
    return `Bw${Math.abs(hash).toString(36)}=`;
  }
}

export const defaultIAMEngine = new IAMPolicyEngine();
export default IAMPolicyEngine;