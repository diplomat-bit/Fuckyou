import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { monitor } from './MonitoringService';
import { vpcManager } from './VpcManager';
import { billingTracker } from './BillingTracker';
import { defaultIAMEngine } from './IAMPolicyEngine';
import { cloudReplacementEngine } from './CloudReplacementEngine';

interface ServiceInstance {
  id: string;
  name: string;
  address: string;
  port: number;
  metadata: Record<string, any>;
  lastHeartbeat: number;
}

class ServiceMesh extends EventEmitter {
  private registry: Map<string, ServiceInstance> = new Map();
  private readonly HEARTBEAT_TIMEOUT = 30000;

  constructor() {
    super();
    this.startHealthCheck();
  }

  public register(name: string, address: string, port: number, metadata: Record<string, any> = {}): string {
    const id = `${name}-${uuidv4()}`;
    const instance: ServiceInstance = {
      id,
      name,
      address,
      port,
      metadata,
      lastHeartbeat: Date.now(),
    };
    this.registry.set(id, instance);
    
    // Log to local monitoring service
    monitor.log('info', 'ServiceMesh', `Service registered: ${name} (${id}) at ${address}:${port}`, { metadata });

    // Register resource in local IAM Policy Engine
    defaultIAMEngine.registerResource({
      id: `services/${name}`,
      type: 'service',
      policy: {
        version: 1,
        bindings: [
          {
            role: 'roles/viewer',
            members: ['allAuthenticatedUsers']
          }
        ]
      }
    });

    this.emit('serviceRegistered', instance);
    return id;
  }

  public heartbeat(id: string): void {
    const instance = this.registry.get(id);
    if (instance) {
      instance.lastHeartbeat = Date.now();
      monitor.log('info', 'ServiceMesh', `Heartbeat received for service: ${instance.name} (${id})`);
    } else {
      monitor.log('warn', 'ServiceMesh', `Heartbeat received for unknown service ID: ${id}`);
    }
  }

  public discover(name: string): ServiceInstance[] {
    return Array.from(this.registry.values()).filter(
      (instance) => instance.name === name
    );
  }

  public getLoadBalancedInstance(name: string): ServiceInstance | null {
    const instances = this.discover(name);
    if (instances.length === 0) return null;
    // Simple Round Robin or Random selection
    return instances[Math.floor(Math.random() * instances.length)];
  }

  private startHealthCheck(): void {
    setInterval(() => {
      const now = Date.now();
      for (const [id, instance] of this.registry.entries()) {
        if (now - instance.lastHeartbeat > this.HEARTBEAT_TIMEOUT) {
          this.registry.delete(id);
          monitor.log('warn', 'ServiceMesh', `Service deregistered due to heartbeat timeout: ${instance.name} (${id})`);
          this.emit('serviceDeregistered', id);
        }
      }
    }, 10000);
  }

  public async proxyRequest(serviceName: string, path: string, options: RequestInit): Promise<Response> {
    const instance = this.getLoadBalancedInstance(serviceName);
    if (!instance) {
      throw new Error(`Service ${serviceName} not found in mesh`);
    }

    const headers = (options.headers || {}) as Record<string, string>;
    const principal = headers['x-consumer-principal'] || 'anonymous';
    const sourceService = headers['x-source-service'] || 'gateway';

    // 1. IAM Policy Check
    const permission = 'service.connect';
    const resourceId = `services/${serviceName}`;
    const decision = defaultIAMEngine.evaluateAccess({
      principal,
      permission,
      resourceId,
      context: {
        'request.time': new Date().toISOString(),
        'request.ip': headers['x-forwarded-for'] || '127.0.0.1'
      }
    });

    if (!decision.allowed) {
      monitor.log('warn', 'ServiceMesh', `Access denied for ${principal} to ${resourceId}: ${decision.reason}`);
      throw new Error(`Forbidden: ${decision.reason}`);
    }

    // 2. VPC Network Isolation Check
    const sourceSegmentId = headers['x-source-segment-id'] || 'segment-public';
    const targetSegmentId = instance.metadata.segmentId || 'segment-default';
    const port = instance.port;

    const isTrafficAllowed = vpcManager.validateTraffic(sourceSegmentId, targetSegmentId, port);
    if (!isTrafficAllowed) {
      monitor.log('error', 'ServiceMesh', `VPC Blocked: Traffic from ${sourceSegmentId} to ${targetSegmentId} on port ${port} is not allowed.`);
      throw new Error(`Network Error: VPC security policy blocked connection from ${sourceSegmentId} to ${targetSegmentId}`);
    }

    // 3. Record Network Egress Usage in Billing Tracker
    await billingTracker.recordUsage({
      accountId: headers['x-billing-account-id'] || 'acc_default',
      projectId: headers['x-billing-project-id'] || 'proj_default',
      serviceName: 'ServiceMeshProxy',
      resourceType: 'network_egress_gb',
      quantity: 0.001, // estimate 1MB per request
      metadata: {
        sourceService,
        targetService: serviceName,
        path
      }
    }).catch(err => {
      monitor.log('warn', 'ServiceMesh', `Failed to record billing usage: ${err.message}`);
    });

    // 4. Proxy Request Execution
    const startTime = Date.now();
    try {
      const url = `http://${instance.address}:${instance.port}${path}`;
      const response = await fetch(url, {
        ...options,
        headers: {
          ...options.headers,
          'X-Service-Mesh-ID': instance.id,
        },
      });
      const duration = Date.now() - startTime;
      monitor.log('info', 'ServiceMesh', `Successfully proxied request to ${serviceName}${path}`, {
        latencyMs: duration,
        statusCode: response.status
      });
      return response;
    } catch (error: any) {
      const duration = Date.now() - startTime;
      monitor.log('error', 'ServiceMesh', `Failed to proxy request to ${serviceName}${path}`, {
        latencyMs: duration,
        error: error.message
      });
      throw error;
    }
  }
}

export const serviceMesh = new ServiceMesh();
export default serviceMesh;