

// --- CONSOLIDATED FROM: ./api/AppRegistry/AppDependencyResolver.ts ---

export interface SemanticVersion {
  major: number;
  minor: number;
  patch: number;
  prerelease?: string;
  build?: string;
}

export interface SchemaFieldDefinition {
  name: string;
  type: string;
  required: boolean;
  deprecated?: boolean;
  description?: string;
}

export interface MicroserviceEndpoint {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  requestSchemaId?: string;
  responseSchemaId?: string;
  deprecated?: boolean;
  versionIntroduced: string;
  versionDeprecated?: string;
}

export interface SchemaContract {
  schemaId: string;
  version: string;
  fields: Record<string, SchemaFieldDefinition>;
  parentSchemaId?: string;
  endpoints?: MicroserviceEndpoint[];
  checksum: string;
}

export interface DependencyRequirement {
  targetAppId: string;
  versionRange: string;
  requiredInterfaces: string[];
  optional?: boolean;
  strictContractCheck?: boolean;
}

export interface AppManifest {
  appId: string;
  name: string;
  version: string;
  environment: 'production' | 'staging' | 'development' | 'sovereign-node';
  dependencies: DependencyRequirement[];
  providedInterfaces: string[];
  exportedSchemas: SchemaContract[];
  ownerTeam?: string;
  updatedAt: string;
}

export type IssueSeverity = 'CRITICAL' | 'HIGH' | 'MEDIUM' | 'LOW' | 'INFO';

export interface ContractValidationIssue {
  code: string;
  severity: IssueSeverity;
  sourceAppId: string;
  targetAppId: string;
  schemaId?: string;
  message: string;
  suggestedFix?: string;
  timestamp: string;
}

export interface DependencyNode {
  appId: string;
  version: string;
  dependencies: string[];
  missingDependencies: string[];
  unresolvedInterfaces: string[];
  depth: number;
}

export interface ResolutionReport {
  success: boolean;
  rootAppId: string;
  resolvedNodes: Map<string, DependencyNode> | Record<string, DependencyNode>;
  executionOrder: string[];
  cyclicDependencies: string[][];
  issues: ContractValidationIssue[];
  resolutionTimeMs: number;
}

import { Router, Request, Response } from 'express';

export class AppDependencyResolver {
  private manifests: Map<string, AppManifest> = new Map();
  private contracts: Map<string, SchemaContract> = new Map();

  public registerApp(manifest: AppManifest): void {
    this.manifests.set(manifest.appId, manifest);
    manifest.exportedSchemas.forEach((contract) => {
      const key = `${manifest.appId}:${contract.schemaId}:${contract.version}`;
      this.contracts.set(key, contract);
    });
  }

  public registerContract(contract: SchemaContract, appId: string): void {
    const key = `${appId}:${contract.schemaId}:${contract.version}`;
    this.contracts.set(key, contract);
  }

  public getManifest(appId: string): AppManifest | undefined {
    return this.manifests.get(appId);
  }

  public getAllManifests(): AppManifest[] {
    return Array.from(this.manifests.values());
  }

  public clearRegistry(): void {
    this.manifests.clear();
    this.contracts.clear();
  }

  public resolveDependencies(rootAppId: string): ResolutionReport {
    const startTime = Date.now();
    const issues: ContractValidationIssue[] = [];
    const resolvedNodes = new Map<string, DependencyNode>();
    const visited = new Set<string>();
    const recursionStack = new Set<string>();
    const cyclicDependencies: string[][] = [];

    const rootManifest = this.manifests.get(rootAppId);
    if (!rootManifest) {
      issues.push({
        code: 'ROOT_APP_NOT_FOUND',
        severity: 'CRITICAL',
        sourceAppId: rootAppId,
        targetAppId: rootAppId,
        message: `Root application manifest '${rootAppId}' is not registered.`,
        timestamp: new Date().toISOString()
      });

      return {
        success: false,
        rootAppId,
        resolvedNodes,
        executionOrder: [],
        cyclicDependencies: [],
        issues,
        resolutionTimeMs: Date.now() - startTime
      };
    }

    const dfs = (currentAppId: string, depth: number, path: string[]) => {
      visited.add(currentAppId);
      recursionStack.add(currentAppId);
      path.push(currentAppId);

      const manifest = this.manifests.get(currentAppId);
      if (!manifest) {
        issues.push({
          code: 'MISSING_MANIFEST',
          severity: 'CRITICAL',
          sourceAppId: path[path.length - 2] || rootAppId,
          targetAppId: currentAppId,
          message: `Manifest for dependency '${currentAppId}' was not found in registry.`,
          timestamp: new Date().toISOString()
        });
        return;
      }

      const depAppIds: string[] = [];
      const missingDeps: string[] = [];
      const unresolvedIfaces: string[] = [];

      for (const req of manifest.dependencies) {
        const targetManifest = this.manifests.get(req.targetAppId);

        if (!targetManifest) {
          if (!req.optional) {
            missingDeps.push(req.targetAppId);
            issues.push({
              code: 'REQUIRED_DEPENDENCY_MISSING',
              severity: 'CRITICAL',
              sourceAppId: currentAppId,
              targetAppId: req.targetAppId,
              message: `App '${currentAppId}' requires missing app '${req.targetAppId}' (${req.versionRange}).`,
              timestamp: new Date().toISOString()
            });
          } else {
            issues.push({
              code: 'OPTIONAL_DEPENDENCY_MISSING',
              severity: 'INFO',
              sourceAppId: currentAppId,
              targetAppId: req.targetAppId,
              message: `Optional dependency '${req.targetAppId}' was not resolved.`,
              timestamp: new Date().toISOString()
            });
          }
          continue;
        }

        depAppIds.push(req.targetAppId);

        const versionMatches = this.checkVersionMatch(targetManifest.version, req.versionRange);
        if (!versionMatches) {
          issues.push({
            code: 'VERSION_MISMATCH',
            severity: 'HIGH',
            sourceAppId: currentAppId,
            targetAppId: req.targetAppId,
            message: `App '${currentAppId}' requires '${req.targetAppId}' version range ${req.versionRange}, but found ${targetManifest.version}.`,
            suggestedFix: `Upgrade or downgrade '${req.targetAppId}' to satisfy constraint '${req.versionRange}'.`,
            timestamp: new Date().toISOString()
          });
        }

        for (const reqInterface of req.requiredInterfaces) {
          if (!targetManifest.providedInterfaces.includes(reqInterface)) {
            unresolvedIfaces.push(reqInterface);
            issues.push({
              code: 'INTERFACE_UNSATISFIED',
              severity: 'HIGH',
              sourceAppId: currentAppId,
              targetAppId: req.targetAppId,
              message: `Target app '${req.targetAppId}' does not expose interface '${reqInterface}' required by '${currentAppId}'.`,
              timestamp: new Date().toISOString()
            });
          }
        }

        if (req.strictContractCheck) {
          const schemaIssues = this.validateContractsBetween(manifest, targetManifest);
          issues.push(...schemaIssues);
        }

        if (recursionStack.has(req.targetAppId)) {
          const cycleStart = path.indexOf(req.targetAppId);
          const cycle = [...path.slice(cycleStart), req.targetAppId];
          cyclicDependencies.push(cycle);
          issues.push({
            code: 'CIRCULAR_DEPENDENCY',
            severity: 'HIGH',
            sourceAppId: currentAppId,
            targetAppId: req.targetAppId,
            message: `Circular dependency detected: ${cycle.join(' -> ')}`,
            timestamp: new Date().toISOString()
          });
        } else if (!visited.has(req.targetAppId)) {
          dfs(req.targetAppId, depth + 1, [...path]);
        }
      }

      resolvedNodes.set(currentAppId, {
        appId: currentAppId,
        version: manifest.version,
        dependencies: depAppIds,
        missingDependencies: missingDeps,
        unresolvedInterfaces: unresolvedIfaces,
        depth
      });

      recursionStack.delete(currentAppId);
    };

    dfs(rootAppId, 0, []);

    const executionOrder = this.calculateTopologicalOrder(resolvedNodes);
    const hasCriticalIssues = issues.some((i) => i.severity === 'CRITICAL');

    return {
      success: !hasCriticalIssues && cyclicDependencies.length === 0,
      rootAppId,
      resolvedNodes,
      executionOrder,
      cyclicDependencies,
      issues,
      resolutionTimeMs: Date.now() - startTime
    };
  }

  public validateContractsBetween(source: AppManifest, target: AppManifest): ContractValidationIssue[] {
    const issues: ContractValidationIssue[] = [];

    for (const sourceContract of source.exportedSchemas) {
      const targetContract = target.exportedSchemas.find((s) => s.schemaId === sourceContract.schemaId);
      if (targetContract) {
        const breakingChanges = this.validateSchemaCompatibility(sourceContract, targetContract);
        breakingChanges.forEach((change) => {
          change.sourceAppId = source.appId;
          change.targetAppId = target.appId;
          issues.push(change);
        });
      }
    }

    return issues;
  }

  public validateSchemaCompatibility(
    oldContract: SchemaContract,
    newContract: SchemaContract
  ): ContractValidationIssue[] {
    const issues: ContractValidationIssue[] = [];
    const timestamp = new Date().toISOString();

    for (const [fieldName, oldField] of Object.entries(oldContract.fields)) {
      const newField = newContract.fields[fieldName];

      if (!newField) {
        issues.push({
          code: 'FIELD_REMOVED',
          severity: 'CRITICAL',
          sourceAppId: '',
          targetAppId: '',
          schemaId: oldContract.schemaId,
          message: `Breaking Change: Field '${fieldName}' was removed from schema '${oldContract.schemaId}'.`,
          suggestedFix: `Mark field as deprecated instead of removing, or update dependent consumers.`,
          timestamp
        });
        continue;
      }

      if (oldField.type !== newField.type) {
        issues.push({
          code: 'FIELD_TYPE_CHANGED',
          severity: 'CRITICAL',
          sourceAppId: '',
          targetAppId: '',
          schemaId: oldContract.schemaId,
          message: `Breaking Change: Field '${fieldName}' type changed from '${oldField.type}' to '${newField.type}' in schema '${oldContract.schemaId}'.`,
          timestamp
        });
      }

      if (!oldField.required && newField.required) {
        issues.push({
          code: 'FIELD_MADE_REQUIRED',
          severity: 'HIGH',
          sourceAppId: '',
          targetAppId: '',
          schemaId: oldContract.schemaId,
          message: `Breaking Change: Field '${fieldName}' changed from optional to required in schema '${oldContract.schemaId}'.`,
          timestamp
        });
      }

      if (newField.deprecated && !oldField.deprecated) {
        issues.push({
          code: 'FIELD_DEPRECATED',
          severity: 'LOW',
          sourceAppId: '',
          targetAppId: '',
          schemaId: oldContract.schemaId,
          message: `Notice: Field '${fieldName}' in schema '${oldContract.schemaId}' has been marked as deprecated.`,
          timestamp
        });
      }
    }

    if (oldContract.endpoints && newContract.endpoints) {
      for (const oldEndpoint of oldContract.endpoints) {
        const matchingNewEndpoint = newContract.endpoints.find(
          (ep) => ep.path === oldEndpoint.path && ep.method === oldEndpoint.method
        );

        if (!matchingNewEndpoint) {
          issues.push({
            code: 'ENDPOINT_REMOVED',
            severity: 'CRITICAL',
            sourceAppId: '',
            targetAppId: '',
            schemaId: oldContract.schemaId,
            message: `Breaking Change: Endpoint '${oldEndpoint.method} ${oldEndpoint.path}' was removed from schema '${oldContract.schemaId}'.`,
            timestamp
          });
        }
      }
    }

    return issues;
  }

  public checkVersionMatch(versionStr: string, rangeRequirement: string): boolean {
    if (rangeRequirement === '*' || rangeRequirement === 'latest') {
      return true;
    }

    const parsedVersion = this.parseSemVer(versionStr);
    if (!parsedVersion) return false;

    const range = rangeRequirement.trim();

    if (range.startsWith('^')) {
      const reqVersion = this.parseSemVer(range.slice(1));
      if (!reqVersion) return false;
      return (
        parsedVersion.major === reqVersion.major &&
        this.compareSemVer(parsedVersion, reqVersion) >= 0
      );
    }

    if (range.startsWith('~')) {
      const reqVersion = this.parseSemVer(range.slice(1));
      if (!reqVersion) return false;
      return (
        parsedVersion.major === reqVersion.major &&
        parsedVersion.minor === reqVersion.minor &&
        this.compareSemVer(parsedVersion, reqVersion) >= 0
      );
    }

    if (range.startsWith('>=')) {
      const reqVersion = this.parseSemVer(range.slice(2));
      if (!reqVersion) return false;
      return this.compareSemVer(parsedVersion, reqVersion) >= 0;
    }

    if (range.startsWith('>')) {
      const reqVersion = this.parseSemVer(range.slice(1));
      if (!reqVersion) return false;
      return this.compareSemVer(parsedVersion, reqVersion) > 0;
    }

    if (range.startsWith('<=')) {
      const reqVersion = this.parseSemVer(range.slice(2));
      if (!reqVersion) return false;
      return this.compareSemVer(parsedVersion, reqVersion) <= 0;
    }

    if (range.startsWith('<')) {
      const reqVersion = this.parseSemVer(range.slice(1));
      if (!reqVersion) return false;
      return this.compareSemVer(parsedVersion, reqVersion) < 0;
    }

    const exactVersion = this.parseSemVer(range);
    if (exactVersion) {
      return this.compareSemVer(parsedVersion, exactVersion) === 0;
    }

    return false;
  }

  public parseSemVer(versionStr: string): SemanticVersion | null {
    const semverRegex = /^v?(\d+)\.(\d+)\.(\d+)(?:-([0-9A-Za-z.-]+))?(?:\+([0-9A-Za-z.-]+))?$/;
    const match = versionStr.trim().match(semverRegex);

    if (!match) return null;

    return {
      major: parseInt(match[1], 10),
      minor: parseInt(match[2], 10),
      patch: parseInt(match[3], 10),
      prerelease: match[4],
      build: match[5]
    };
  }

  public compareSemVer(v1: SemanticVersion, v2: SemanticVersion): number {
    if (v1.major !== v2.major) return v1.major - v2.major;
    if (v1.minor !== v2.minor) return v1.minor - v2.minor;
    if (v1.patch !== v2.patch) return v1.patch - v2.patch;
    return 0;
  }

  private calculateTopologicalOrder(resolvedNodes: Map<string, DependencyNode>): string[] {
    const inDegree = new Map<string, number>();
    const adjList = new Map<string, string[]>();

    for (const [appId] of resolvedNodes) {
      inDegree.set(appId, 0);
      adjList.set(appId, []);
    }

    for (const [appId, node] of resolvedNodes) {
      for (const depId of node.dependencies) {
        if (resolvedNodes.has(depId)) {
          adjList.get(depId)?.push(appId);
          inDegree.set(appId, (inDegree.get(appId) || 0) + 1);
        }
      }
    }

    const queue: string[] = [];
    for (const [appId, degree] of inDegree) {
      if (degree === 0) {
        queue.push(appId);
      }
    }

    const result: string[] = [];
    while (queue.length > 0) {
      const current = queue.shift()!;
      result.push(current);

      const neighbors = adjList.get(current) || [];
      for (const neighbor of neighbors) {
        const updatedDegree = (inDegree.get(neighbor) || 1) - 1;
        inDegree.set(neighbor, updatedDegree);
        if (updatedDegree === 0) {
          queue.push(neighbor);
        }
      }
    }

    return result;
  }

  /**
   * Generates Express Router with all API routes for managing and resolving dependencies.
   */
  public static createRouter(resolver: AppDependencyResolver): Router {
    const router = Router();

    // GET /health - Check status of the dependency resolver
    router.get('/health', (req: Request, res: Response) => {
      res.status(200).json({
        status: 'healthy',
        registeredAppsCount: resolver.manifests.size,
        registeredContractsCount: resolver.contracts.size,
        timestamp: new Date().toISOString()
      });
    });

    // GET /manifests - List all registered application manifests
    router.get('/manifests', (req: Request, res: Response) => {
      const manifests = resolver.getAllManifests();
      res.status(200).json({ success: true, manifests });
    });

    // GET /manifests/:appId - Get a specific application manifest
    router.get('/manifests/:appId', (req: Request, res: Response) => {
      const appId = Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId;
      const manifest = resolver.getManifest(appId);
      if (!manifest) {
        return res.status(404).json({
          success: false,
          error: `Manifest for app '${appId}' not found.`
        });
      }
      res.status(200).json({ success: true, manifest });
    });

    // POST /manifests - Register or update an application manifest
    router.post('/manifests', (req: Request, res: Response) => {
      const manifest = req.body as AppManifest;
      if (!manifest || !manifest.appId || !manifest.version) {
        return res.status(400).json({
          success: false,
          error: 'Invalid manifest payload. appId and version are required.'
        });
      }
      resolver.registerApp(manifest);
      res.status(201).json({
        success: true,
        message: `Successfully registered manifest for app '${manifest.appId}' v${manifest.version}.`
      });
    });

    // POST /contracts/:appId - Register a schema contract for a specific app
    router.post('/contracts/:appId', (req: Request, res: Response) => {
      const appId = Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId;
      const contract = req.body as SchemaContract;
      if (!contract || !contract.schemaId || !contract.version) {
        return res.status(400).json({
          success: false,
          error: 'Invalid contract payload. schemaId and version are required.'
        });
      }
      resolver.registerContract(contract, appId);
      res.status(201).json({
        success: true,
        message: `Successfully registered contract '${contract.schemaId}' v${contract.version} for app '${appId}'.`
      });
    });

    // GET /resolve/:appId - Resolve dependencies starting from a root application
    router.get('/resolve/:appId', (req: Request, res: Response) => {
      const appId = Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId;
      const report = resolver.resolveDependencies(appId);

      // Convert Map to Record for JSON serialization
      const serializedNodes: Record<string, DependencyNode> = {};
      if (report.resolvedNodes instanceof Map) {
        report.resolvedNodes.forEach((value, key) => {
          serializedNodes[key] = value;
        });
      } else {
        Object.assign(serializedNodes, report.resolvedNodes);
      }

      const responsePayload = {
        ...report,
        resolvedNodes: serializedNodes
      };

      if (!report.success) {
        return res.status(422).json({
          success: false,
          message: 'Dependency resolution failed or contains critical issues.',
          report: responsePayload
        });
      }

      res.status(200).json({
        success: true,
        report: responsePayload
      });
    });

    // POST /validate-compatibility - Validate compatibility between two schema contracts
    router.post('/validate-compatibility', (req: Request, res: Response) => {
      const { oldContract, newContract } = req.body as {
        oldContract: SchemaContract;
        newContract: SchemaContract;
      };

      if (!oldContract || !newContract) {
        return res.status(400).json({
          success: false,
          error: 'Both oldContract and newContract must be provided in the request body.'
        });
      }

      const issues = resolver.validateSchemaCompatibility(oldContract, newContract);
      const isCompatible = !issues.some((issue) => issue.severity === 'CRITICAL');

      res.status(200).json({
        success: true,
        isCompatible,
        issues
      });
    });

    // DELETE /registry - Clear all registered manifests and contracts
    router.delete('/registry', (req: Request, res: Response) => {
      resolver.clearRegistry();
      res.status(200).json({
        success: true,
        message: 'Registry cleared successfully.'
      });
    });

    return router;
  }
}

export default AppDependencyResolver;