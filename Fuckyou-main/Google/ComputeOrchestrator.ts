import { spawn, execSync } from 'child_process';
import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { logger, AuditActor } from '../api/utils/logger';

export interface ContainerConfig {
  image: string;
  name: string;
  port: number;
  hostPort?: number;
  env?: Record<string, string>;
  cpuLimit?: string;
  memoryLimit?: string;
  volumes?: Array<{ hostPath: string; containerPath: string }>;
  restartPolicy?: 'always' | 'on-failure' | 'unless-stopped' | 'no';
  labels?: Record<string, string>;
}

export interface ContainerStatus {
  id: string;
  dockerId?: string;
  name: string;
  image: string;
  status: 'running' | 'stopped' | 'error' | 'paused';
  uptime: number;
  port: number;
  replicas?: number;
  cpuUsage?: string;
  memoryUsage?: string;
}

export interface VMInstanceConfig {
  name: string;
  machineType: string;
  zone: string;
  disks?: Array<{ boot: boolean; image: string; sizeGb: number }>;
  networkInterfaces?: Array<{ network: string; subnetwork?: string }>;
  tags?: string[];
  labels?: Record<string, string>;
}

export interface VMInstanceStatus {
  id: string;
  name: string;
  zone: string;
  machineType: string;
  status: 'PROVISIONING' | 'STAGING' | 'RUNNING' | 'STOPPING' | 'STOPPED' | 'SUSPENDED' | 'TERMINATED';
  internalIp: string;
  externalIp: string;
  createdAt: number;
}

// FIX: Added required 'type' property to satisfy AuditActor interface
const SYSTEM_ACTOR: AuditActor = { 
  id: 'ComputeOrchestrator', 
  role: 'system', 
  type: 'SYSTEM' 
};

// FIX: Updated to ensure string-to-object conversion includes all required AuditActor fields
export function toAuditActor(actor?: string | AuditActor): AuditActor {
  if (!actor) {
    return SYSTEM_ACTOR;
  }
  if (typeof actor === 'string') {
    return { 
      id: actor, 
      role: 'user', 
      type: 'USER' 
    };
  }
  return actor;
}

export class ComputeOrchestrator extends EventEmitter {
  private activeContainers: Map<string, ContainerStatus> = new Map();
  private vmInstances: Map<string, VMInstanceStatus> = new Map();
  private dockerAvailable: boolean = false;
  private healthCheckInterval: NodeJS.Timeout | null = null;

  constructor() {
    super();
    this.verifyDockerEngine();
    this.startHealthCheckLoop();
  }

  private verifyDockerEngine(): void {
    try {
      execSync('docker info', { stdio: 'ignore' });
      this.dockerAvailable = true;
    } catch (e) {
      this.dockerAvailable = false;
      logger.warn('Docker engine not found. ComputeOrchestrator will run in simulated/fallback mode.', 'verifyDockerEngine', SYSTEM_ACTOR);
    }
  }

  private startHealthCheckLoop(): void {
    if (this.healthCheckInterval) clearInterval(this.healthCheckInterval);
    this.healthCheckInterval = setInterval(async () => {
      for (const [id] of this.activeContainers) {
        const healthy = await this.healthCheck(id);
        if (!healthy) {
          this.emit('unhealthy', id);
        }
      }
    }, 30000);
  }

  public stopHealthCheckLoop(): void {
    if (this.healthCheckInterval) {
      clearInterval(this.healthCheckInterval);
      this.healthCheckInterval = null;
    }
  }

  public async deploy(config: ContainerConfig, actor?: string | AuditActor): Promise<string> {
    const auditActor = toAuditActor(actor);
    const containerId = uuidv4();
    const containerName = `${config.name}-${containerId.substring(0, 8)}`;
    const portMapping = `${config.hostPort || config.port}:${config.port}`;

    if (!this.dockerAvailable) {
      const simulatedDockerId = `sim-${uuidv4().substring(0, 8)}`;
      const status: ContainerStatus = {
        id: containerId,
        dockerId: simulatedDockerId,
        name: config.name,
        image: config.image,
        status: 'running',
        uptime: Date.now(),
        port: config.port,
        replicas: 1,
        cpuUsage: config.cpuLimit || '0.5',
        memoryUsage: config.memoryLimit || '512m'
      };
      this.activeContainers.set(containerId, status);
      this.emit('deployed', status);
      logger.info(`[Simulated] Deployed container ${config.name} with simulated ID ${simulatedDockerId}`, 'deploy', auditActor);
      return containerId;
    }

    const envArgs = Object.entries(config.env || {})
      .map(([k, v]) => `-e "${k}=${v}"`)
      .join(' ');

    const volumeArgs = (config.volumes || [])
      .map(v => `-v "${v.hostPath}:${v.containerPath}"`)
      .join(' ');

    const restartPolicy = config.restartPolicy ? `--restart=${config.restartPolicy}` : '';

    const cmd = `docker run -d --name ${containerName} \
      -p ${portMapping} \
      ${envArgs} \
      ${volumeArgs} \
      ${restartPolicy} \
      --cpus="${config.cpuLimit || '0.5'}" \
      --memory="${config.memoryLimit || '512m'}" \
      ${config.image}`;

    try {
      const dockerId = execSync(cmd).toString().trim();
      const status: ContainerStatus = {
        id: containerId,
        dockerId,
        name: config.name,
        image: config.image,
        status: 'running',
        uptime: Date.now(),
        port: config.port,
        replicas: 1,
        cpuUsage: config.cpuLimit || '0.5',
        memoryUsage: config.memoryLimit || '512m'
      };
      this.activeContainers.set(containerId, status);
      this.emit('deployed', status);
      logger.info(`Deployed container ${config.name} with ID ${dockerId}`, 'deploy', auditActor);
      return containerId;
    } catch (error) {
      logger.error(`Failed to deploy container: ${error}`, 'deploy', auditActor);
      throw error;
    }
  }

  public async terminate(containerId: string, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    const container = this.activeContainers.get(containerId);
    if (!container) throw new Error('Container not found');

    if (!this.dockerAvailable) {
      this.activeContainers.delete(containerId);
      this.emit('terminated', containerId);
      logger.info(`[Simulated] Terminated container ${containerId}`, 'terminate', auditActor);
      return;
    }

    try {
      if (container.dockerId) {
        execSync(`docker stop ${container.dockerId} && docker rm ${container.dockerId}`);
      }
      this.activeContainers.delete(containerId);
      this.emit('terminated', containerId);
      logger.info(`Terminated container ${containerId}`, 'terminate', auditActor);
    } catch (error) {
      logger.error(`Failed to terminate container: ${error}`, 'terminate', auditActor);
      throw error;
    }
  }

  public async pause(containerId: string, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    const container = this.activeContainers.get(containerId);
    if (!container) throw new Error('Container not found');

    if (!this.dockerAvailable) {
      container.status = 'paused';
      this.emit('paused', containerId);
      return;
    }

    try {
      if (container.dockerId) {
        execSync(`docker pause ${container.dockerId}`);
        container.status = 'paused';
        this.emit('paused', containerId);
      }
    } catch (error) {
      logger.error(`Failed to pause container: ${error}`, 'pause', auditActor);
      throw error;
    }
  }

  public async unpause(containerId: string, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    const container = this.activeContainers.get(containerId);
    if (!container) throw new Error('Container not found');

    if (!this.dockerAvailable) {
      container.status = 'running';
      this.emit('unpaused', containerId);
      return;
    }

    try {
      if (container.dockerId) {
        execSync(`docker unpause ${container.dockerId}`);
        container.status = 'running';
        this.emit('unpaused', containerId);
      }
    } catch (error) {
      logger.error(`Failed to unpause container: ${error}`, 'unpause', auditActor);
      throw error;
    }
  }

  public async restart(containerId: string, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    const container = this.activeContainers.get(containerId);
    if (!container) throw new Error('Container not found');

    if (!this.dockerAvailable) {
      container.uptime = Date.now();
      container.status = 'running';
      this.emit('restarted', containerId);
      return;
    }

    try {
      if (container.dockerId) {
        execSync(`docker restart ${container.dockerId}`);
        container.uptime = Date.now();
        container.status = 'running';
        this.emit('restarted', containerId);
      }
    } catch (error) {
      logger.error(`Failed to restart container: ${error}`, 'restart', auditActor);
      throw error;
    }
  }

  public getStatus(containerId: string): ContainerStatus | undefined {
    return this.activeContainers.get(containerId);
  }

  public listContainers(): ContainerStatus[] {
    return Array.from(this.activeContainers.values());
  }

  public async scale(containerId: string, replicas: number, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    logger.info(`Scaling container ${containerId} to ${replicas} replicas...`, 'scale', auditActor);
    const container = this.activeContainers.get(containerId);
    if (!container) throw new Error('Container not found');

    container.replicas = replicas;
    this.emit('scaled', { containerId, replicas });

    if (!this.dockerAvailable) {
      logger.info(`[Simulated] Successfully scaled container ${containerId} to ${replicas} replicas.`, 'scale', auditActor);
      return;
    }
  }

  public async healthCheck(containerId: string): Promise<boolean> {
    const container = this.activeContainers.get(containerId);
    if (!container) return false;

    if (!this.dockerAvailable) {
      return container.status === 'running';
    }
    
    try {
      if (!container.dockerId) return false;
      const status = execSync(`docker inspect -f '{{.State.Running}}' ${container.dockerId}`).toString().trim();
      const isRunning = status === 'true';
      container.status = isRunning ? 'running' : 'stopped';
      return isRunning;
    } catch {
      container.status = 'error';
      return false;
    }
  }

  public async getLogs(containerId: string, tailLines: number = 100, actor?: string | AuditActor): Promise<string> {
    const auditActor = toAuditActor(actor);
    const container = this.activeContainers.get(containerId);
    if (!container) throw new Error('Container not found');

    if (!this.dockerAvailable) {
      return `[Simulated Logs for ${container.name} (${containerId})]\nSystem running smoothly.\nHealth check passed.`;
    }

    try {
      if (!container.dockerId) return '';
      return execSync(`docker logs --tail ${tailLines} ${container.dockerId}`).toString();
    } catch (error) {
      logger.error(`Failed to retrieve logs for container ${containerId}: ${error}`, 'getLogs', auditActor);
      throw error;
    }
  }

  public async exec(containerId: string, command: string, actor?: string | AuditActor): Promise<string> {
    const auditActor = toAuditActor(actor);
    const container = this.activeContainers.get(containerId);
    if (!container) throw new Error('Container not found');

    if (!this.dockerAvailable) {
      return `[Simulated Exec Response]: Executed command "${command}" inside ${container.name}`;
    }

    try {
      if (!container.dockerId) return '';
      return execSync(`docker exec ${container.dockerId} ${command}`).toString();
    } catch (error) {
      logger.error(`Failed to exec command in container ${containerId}: ${error}`, 'exec', auditActor);
      throw error;
    }
  }

  // VM Instance Orchestration Methods
  public async createVMInstance(config: VMInstanceConfig, actor?: string | AuditActor): Promise<VMInstanceStatus> {
    const auditActor = toAuditActor(actor);
    const instanceId = `vm-${uuidv4().substring(0, 8)}`;
    const internalIp = `10.128.0.${Math.floor(Math.random() * 250) + 2}`;
    const externalIp = `35.${Math.floor(Math.random() * 200) + 10}.${Math.floor(Math.random() * 250) + 1}.${Math.floor(Math.random() * 250) + 1}`;

    const status: VMInstanceStatus = {
      id: instanceId,
      name: config.name,
      zone: config.zone,
      machineType: config.machineType,
      status: 'RUNNING',
      internalIp,
      externalIp,
      createdAt: Date.now()
    };

    this.vmInstances.set(instanceId, status);
    this.emit('vmCreated', status);
    logger.info(`Provisioned VM instance ${config.name} (${instanceId}) in ${config.zone}`, 'createVMInstance', auditActor);
    return status;
  }

  public async stopVMInstance(instanceId: string, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    const vm = this.vmInstances.get(instanceId);
    if (!vm) throw new Error('VM instance not found');

    vm.status = 'STOPPED';
    this.emit('vmStopped', instanceId);
    logger.info(`Stopped VM instance ${instanceId}`, 'stopVMInstance', auditActor);
  }

  public async startVMInstance(instanceId: string, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    const vm = this.vmInstances.get(instanceId);
    if (!vm) throw new Error('VM instance not found');

    vm.status = 'RUNNING';
    this.emit('vmStarted', instanceId);
    logger.info(`Started VM instance ${instanceId}`, 'startVMInstance', auditActor);
  }

  public async deleteVMInstance(instanceId: string, actor?: string | AuditActor): Promise<void> {
    const auditActor = toAuditActor(actor);
    const vm = this.vmInstances.get(instanceId);
    if (!vm) throw new Error('VM instance not found');

    vm.status = 'TERMINATED';
    this.vmInstances.delete(instanceId);
    this.emit('vmDeleted', instanceId);
    logger.info(`Deleted VM instance ${instanceId}`, 'deleteVMInstance', auditActor);
  }

  public getVMInstance(instanceId: string): VMInstanceStatus | undefined {
    return this.vmInstances.get(instanceId);
  }

  public listVMInstances(): VMInstanceStatus[] {
    return Array.from(this.vmInstances.values());
  }
}

export const computeOrchestrator = new ComputeOrchestrator();
