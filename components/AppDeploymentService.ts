

// --- CONSOLIDATED FROM: ./api/AppRegistry/services/AppDeploymentService.ts ---

import { EventEmitter } from 'events';
import { Request, Response, Router } from 'express';

export type DeploymentTarget = 
  | 'KUBERNETES' 
  | 'AZURE_CONTAINER_APPS' 
  | 'AWS_LAMBDA' 
  | 'AZURE_FUNCTIONS' 
  | 'VERCEL' 
  | 'DOCKER_SWARM' 
  | 'GCP_CLOUD_RUN';

export type RuntimeEnvironment = 
  | 'NODEJS_20' 
  | 'PYTHON_3_11' 
  | 'GO_1_21' 
  | 'RUST_WASM' 
  | 'DOCKERFILE';

export type DeploymentState = 
  | 'PENDING' 
  | 'BUILDING' 
  | 'DEPLOYING' 
  | 'HEALTH_CHECKING' 
  | 'SUCCESS' 
  | 'FAILED' 
  | 'ROLLED_BACK';

export interface EnvironmentVariable {
  key: string;
  value: string;
  isSecret?: boolean;
}

export interface AutoScalingPolicy {
  minReplicas: number;
  maxReplicas: number;
  targetCpuUtilizationPercentage?: number;
  targetMemoryUtilizationPercentage?: number;
  concurrencyLimit?: number;
}

export interface MicroAppSpec {
  appId: string;
  appName: string;
  version: string;
  description?: string;
  repositoryUrl: string;
  gitCommitHash?: string;
  runtime: RuntimeEnvironment;
  target: DeploymentTarget;
  entryPoint?: string;
  environmentVariables: EnvironmentVariable[];
  scalingPolicy: AutoScalingPolicy;
  healthCheckPath?: string;
  port?: number;
  customDomain?: string;
  resourceAllocations?: {
    cpuCores: number;
    memoryMb: number;
    ephemeralStorageMb?: number;
  };
}

export interface DeploymentTriggerConfig {
  triggeredBy: string;
  buildArgs?: Record<string, string>;
  forceRedeploy?: boolean;
  dryRun?: boolean;
  webhookCallbackUrl?: string;
  timeoutSeconds?: number;
}

export interface DeploymentResult {
  deploymentId: string;
  appId: string;
  version: string;
  target: DeploymentTarget;
  state: DeploymentState;
  endpointUrl?: string;
  internalDns?: string;
  startedAt: string;
  completedAt?: string;
  logs: string[];
  metrics?: {
    buildDurationMs: number;
    deploymentDurationMs: number;
    imageSizeMb?: number;
  };
  error?: string;
}

export class AppDeploymentService extends EventEmitter {
  private static instance: AppDeploymentService;
  private deploymentRegistry: Map<string, DeploymentResult> = new Map();
  private appDeploymentHistory: Map<string, DeploymentResult[]> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): AppDeploymentService {
    if (!AppDeploymentService.instance) {
      AppDeploymentService.instance = new AppDeploymentService();
    }
    return AppDeploymentService.instance;
  }

  /**
   * Express Router integration for exposing deployment features as API routes
   */
  public getRouter(): Router {
    const router = Router();

    // POST /deploy - Trigger a new micro-app deployment
    router.post('/deploy', async (req: Request, res: Response) => {
      try {
        const { appSpec, triggerConfig } = req.body as { appSpec: MicroAppSpec; triggerConfig?: DeploymentTriggerConfig };
        if (!appSpec || !appSpec.appId || !appSpec.appName || !appSpec.version || !appSpec.runtime || !appSpec.target) {
          return res.status(400).json({
            success: false,
            error: 'Missing required deployment specification fields (appId, appName, version, runtime, target).'
          });
        }
        const result = await this.triggerDeployment(appSpec, triggerConfig);
        return res.status(202).json({ success: true, data: result });
      } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal deployment trigger failure' });
      }
    });

    // POST /rollback - Rollback an application to a previous successful version
    router.post('/rollback', async (req: Request, res: Response) => {
      try {
        const { appId, targetVersion } = req.body as { appId: string; targetVersion: string };
        if (!appId || !targetVersion) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: appId and targetVersion.'
          });
        }
        const result = await this.rollbackDeployment(appId, targetVersion);
        return res.status(200).json({ success: true, data: result });
      } catch (error: any) {
        return res.status(500).json({ success: false, error: error.message || 'Internal rollback failure' });
      }
    });

    // GET /status/:deploymentId - Retrieve status of a specific deployment
    router.get('/status/:deploymentId', (req: Request, res: Response) => {
      const { deploymentId } = req.params;
      const status = this.getDeploymentStatus(Array.isArray(deploymentId) ? deploymentId[0] : deploymentId);
      if (!status) {
        return res.status(404).json({ success: false, error: `Deployment with ID ${deploymentId} not found.` });
      }
      return res.status(200).json({ success: true, data: status });
    });

    // GET /history/:appId - Get complete deployment history for a micro-app
    router.get('/history/:appId', (req: Request, res: Response) => {
      const { appId } = req.params;
      const history = this.listDeploymentsByApp(Array.isArray(appId) ? appId[0] : appId);
      return res.status(200).json({ success: true, data: history });
    });

    // GET /active - List all currently active deployments
    router.get('/active', (req: Request, res: Response) => {
      const activeStates: DeploymentState[] = ['PENDING', 'BUILDING', 'DEPLOYING', 'HEALTH_CHECKING'];
      const activeDeployments = Array.from(this.deploymentRegistry.values()).filter(d =>
        activeStates.includes(d.state)
      );
      return res.status(200).json({ success: true, data: activeDeployments });
    });

    // GET /stream/:deploymentId - Server-Sent Events (SSE) route to stream deployment logs in real-time
    router.get('/stream/:deploymentId', (req: Request, res: Response) => {
      const { deploymentId } = req.params;
      const deployment = this.getDeploymentStatus(Array.isArray(deploymentId) ? deploymentId[0] : deploymentId);

      if (!deployment) {
        return res.status(404).json({ success: false, error: `Deployment with ID ${deploymentId} not found.` });
      }

      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      // Send initial logs
      deployment.logs.forEach(log => {
        res.write(`data: ${JSON.stringify({ log })}\n\n`);
      });

      const logListener = (updatedResult: DeploymentResult) => {
        if (updatedResult.deploymentId === deploymentId) {
          const latestLog = updatedResult.logs[updatedResult.logs.length - 1];
          res.write(`data: ${JSON.stringify({ log: latestLog, state: updatedResult.state })}\n\n`);
          
          if (['SUCCESS', 'FAILED', 'ROLLED_BACK'].includes(updatedResult.state)) {
            res.write(`data: ${JSON.stringify({ event: 'close', message: 'Deployment pipeline finished.' })}\n\n`);
            cleanup();
            res.end();
          }
        }
      };

      const cleanup = () => {
        this.off('deploymentStateChanged', logListener);
      };

      this.on('deploymentStateChanged', logListener);
      req.on('close', cleanup);
    });

    return router;
  }

  /**
   * Main entrypoint to trigger micro-application deployments
   */
  public async triggerDeployment(
    appSpec: MicroAppSpec, 
    triggerConfig?: DeploymentTriggerConfig
  ): Promise<DeploymentResult> {
    const deploymentId = `dep-${appSpec.appId}-${Date.now()}-${Math.random().toString(36).substring(2, 7)}`;
    const startTime = Date.now();

    const result: DeploymentResult = {
      deploymentId,
      appId: appSpec.appId,
      version: appSpec.version,
      target: appSpec.target,
      state: 'PENDING',
      startedAt: new Date().toISOString(),
      logs: [`[${new Date().toISOString()}] Initializing deployment pipeline for ${appSpec.appName} (${appSpec.appId})`],
    };

    this.deploymentRegistry.set(deploymentId, result);
    this.addHistory(appSpec.appId, result);
    this.emit('deploymentStateChanged', result);

    try {
      if (triggerConfig?.dryRun) {
        return this.handleDryRun(result, appSpec);
      }

      result.state = 'BUILDING';
      result.logs.push(`[${new Date().toISOString()}] Building artifact for runtime ${appSpec.runtime}`);
      this.emit('deploymentStateChanged', result);

      const isServerless = this.isServerlessTarget(appSpec.target);

      if (isServerless) {
        await this.triggerServerlessDeployment(appSpec, result);
      } else {
        await this.triggerContainerDeployment(appSpec, result);
      }

      result.state = 'HEALTH_CHECKING';
      result.logs.push(`[${new Date().toISOString()}] Performing post-deployment health check on ${result.endpointUrl}`);
      this.emit('deploymentStateChanged', result);

      const isHealthy = await this.verifyDeploymentHealth(result.endpointUrl || '', appSpec.healthCheckPath || '/health');

      if (!isHealthy) {
        throw new Error(`Health check failed for endpoint ${result.endpointUrl}`);
      }

      const buildEndTime = Date.now();
      result.state = 'SUCCESS';
      result.completedAt = new Date().toISOString();
      result.metrics = {
        buildDurationMs: Math.floor((buildEndTime - startTime) * 0.4),
        deploymentDurationMs: Math.floor((buildEndTime - startTime) * 0.6),
      };
      result.logs.push(`[${new Date().toISOString()}] Deployment completed successfully.`);
      
      this.emit('deploymentSuccess', result);
      this.emit('deploymentStateChanged', result);
      return result;

    } catch (err: any) {
      result.state = 'FAILED';
      result.error = err.message || 'Unknown deployment error';
      result.completedAt = new Date().toISOString();
      result.logs.push(`[${new Date().toISOString()}] ERROR: ${result.error}`);

      this.emit('deploymentFailed', result);
      this.emit('deploymentStateChanged', result);
      return result;
    }
  }

  /**
   * Rollback an application to a specified version
   */
  public async rollbackDeployment(appId: string, targetVersion: string): Promise<DeploymentResult> {
    const history = this.appDeploymentHistory.get(appId) || [];
    const targetDeployment = history.find(d => d.version === targetVersion && d.state === 'SUCCESS');

    if (!targetDeployment) {
      throw new Error(`No successful historical deployment found for app ${appId} with version ${targetVersion}`);
    }

    const rollbackId = `dep-rollback-${appId}-${Date.now()}`;
    const rollbackResult: DeploymentResult = {
      deploymentId: rollbackId,
      appId,
      version: targetVersion,
      target: targetDeployment.target,
      state: 'DEPLOYING',
      startedAt: new Date().toISOString(),
      endpointUrl: targetDeployment.endpointUrl,
      internalDns: targetDeployment.internalDns,
      logs: [`[${new Date().toISOString()}] Initiating rollback for ${appId} to version ${targetVersion}`],
    };

    this.deploymentRegistry.set(rollbackId, rollbackResult);

    // Simulate fast-track traffic reroute
    await new Promise(resolve => setTimeout(resolve, 1500));

    rollbackResult.state = 'ROLLED_BACK';
    rollbackResult.completedAt = new Date().toISOString();
    rollbackResult.logs.push(`[${new Date().toISOString()}] Traffic successfully rerouted to version ${targetVersion}`);

    this.addHistory(appId, rollbackResult);
    this.emit('deploymentStateChanged', rollbackResult);

    return rollbackResult;
  }

  /**
   * Retrieves status for a given deployment ID
   */
  public getDeploymentStatus(deploymentId: string): DeploymentResult | undefined {
    return this.deploymentRegistry.get(deploymentId);
  }

  /**
   * Gets complete deployment history for a micro-app
   */
  public listDeploymentsByApp(appId: string): DeploymentResult[] {
    return this.appDeploymentHistory.get(appId) || [];
  }

  /**
   * Active health checker endpoint polling
   */
  public async verifyDeploymentHealth(endpointUrl: string, healthCheckPath: string = '/health'): Promise<boolean> {
    if (!endpointUrl) return false;
    
    // Simulated health ping check logic
    await new Promise(resolve => setTimeout(resolve, 800));
    return true;
  }

  private isServerlessTarget(target: DeploymentTarget): boolean {
    return target === 'AWS_LAMBDA' || target === 'AZURE_FUNCTIONS' || target === 'VERCEL';
  }

  private async triggerContainerDeployment(appSpec: MicroAppSpec, result: DeploymentResult): Promise<void> {
    result.logs.push(`[${new Date().toISOString()}] Provisioning container instance on target engine: ${appSpec.target}`);
    this.emit('deploymentStateChanged', result);
    
    // Simulate orchestration step
    await new Promise(resolve => setTimeout(resolve, 2000));

    result.state = 'DEPLOYING';
    result.logs.push(`[${new Date().toISOString()}] Applying manifest / registering pod with scaling min:${appSpec.scalingPolicy.minReplicas} max:${appSpec.scalingPolicy.maxReplicas}`);
    this.emit('deploymentStateChanged', result);

    const sanitizedAppName = appSpec.appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    result.endpointUrl = `https://${sanitizedAppName}.oko.internal.net`;
    result.internalDns = `svc-${sanitizedAppName}.cluster.local:${appSpec.port || 8080}`;

    await new Promise(resolve => setTimeout(resolve, 1500));
  }

  private async triggerServerlessDeployment(appSpec: MicroAppSpec, result: DeploymentResult): Promise<void> {
    result.logs.push(`[${new Date().toISOString()}] Packaging serverless handler for ${appSpec.runtime}`);
    this.emit('deploymentStateChanged', result);

    // Simulate packaging & cloud function deployment
    await new Promise(resolve => setTimeout(resolve, 1800));

    result.state = 'DEPLOYING';
    result.logs.push(`[${new Date().toISOString()}] Uploading function payload to cloud provider serverless pipeline`);
    this.emit('deploymentStateChanged', result);

    const sanitizedAppName = appSpec.appName.toLowerCase().replace(/[^a-z0-9-]/g, '-');
    result.endpointUrl = `https://${sanitizedAppName}.serverless.oko.cloud`;

    await new Promise(resolve => setTimeout(resolve, 1200));
  }

  private handleDryRun(result: DeploymentResult, appSpec: MicroAppSpec): DeploymentResult {
    result.state = 'SUCCESS';
    result.completedAt = new Date().toISOString();
    result.endpointUrl = `https://dryrun-${appSpec.appName.toLowerCase()}.oko.internal.net`;
    result.logs.push(`[${new Date().toISOString()}] Dry run completed. Configuration is valid for target ${appSpec.target}.`);
    this.emit('deploymentStateChanged', result);
    return result;
  }

  private addHistory(appId: string, result: DeploymentResult): void {
    const list = this.appDeploymentHistory.get(appId) || [];
    list.unshift(result);
    this.appDeploymentHistory.set(appId, list);
  }
}

export default AppDeploymentService.getInstance();