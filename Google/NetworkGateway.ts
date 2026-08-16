import http from 'http';
import https from 'https';
import net from 'net';
import { URL } from 'url';
import crypto from 'crypto';
import { EventEmitter } from 'events';

// Local Sovereign Service Integrations
import { serviceMesh } from './ServiceMesh';
import { vpcManager } from './VpcManager';
import { monitor } from './MonitoringService';
import { secretVault } from './SecretVault';
import { defaultIAMEngine } from './IAMPolicyEngine';
import { billingTracker } from './BillingTracker';

export type LoadBalancingStrategy = 'ROUND_ROBIN' | 'LEAST_CONNECTIONS' | 'WEIGHTED_ROUND_ROBIN' | 'IP_HASH' | 'LATENCY_BASED';

export interface TargetNode {
  id: string;
  host: string;
  port: number;
  weight: number;
  activeConnections: number;
  latencyMs: number;
  isHealthy: boolean;
  consecutiveFailures: number;
  consecutiveSuccesses: number;
  lastCheckedAt?: Date;
}

export interface HealthCheckConfig {
  path: string;
  intervalMs: number;
  timeoutMs: number;
  healthyThreshold: number;
  unhealthyThreshold: number;
  expectedStatusCodes: number[];
}

export interface TargetGroup {
  id: string;
  name: string;
  strategy: LoadBalancingStrategy;
  targets: TargetNode[];
  healthCheck: HealthCheckConfig;
}

export interface HeaderTransform {
  add?: Record<string, string>;
  remove?: string[];
}

export interface RoutingRule {
  id: string;
  priority: number;
  hostPattern?: string | RegExp;
  pathPattern: string | RegExp;
  method?: string;
  targetGroupId: string;
  headerTransforms?: HeaderTransform;
  timeoutMs?: number;
}

export interface SSLConfig {
  cert: string;
  key: string;
  ca?: string;
}

export interface GatewayConfig {
  port: number;
  sslPort?: number;
  sslConfig?: SSLConfig;
  targetGroups: TargetGroup[];
  rules: RoutingRule[];
  defaultTargetGroupId: string;
  enableHttp2?: boolean;
}

export class CircuitBreaker extends EventEmitter {
  private failureThreshold: number;
  private recoveryTimeoutMs: number;
  private state: 'CLOSED' | 'OPEN' | 'HALF_OPEN' = 'CLOSED';
  private failures = 0;
  private lastStateChange: number = Date.now();

  constructor(failureThreshold = 5, recoveryTimeoutMs = 10000) {
    super();
    this.failureThreshold = failureThreshold;
    this.recoveryTimeoutMs = recoveryTimeoutMs;
  }

  public canExecute(): boolean {
    if (this.state === 'OPEN') {
      if (Date.now() - this.lastStateChange > this.recoveryTimeoutMs) {
        this.state = 'HALF_OPEN';
        this.lastStateChange = Date.now();
        this.emit('stateChange', 'HALF_OPEN');
        return true;
      }
      return false;
    }
    return true;
  }

  public onSuccess(): void {
    if (this.state === 'HALF_OPEN') {
      this.state = 'CLOSED';
      this.failures = 0;
      this.lastStateChange = Date.now();
      this.emit('stateChange', 'CLOSED');
    } else if (this.state === 'CLOSED') {
      this.failures = 0;
    }
  }

  public onFailure(): void {
    this.failures++;
    if (this.failures >= this.failureThreshold && this.state !== 'OPEN') {
      this.state = 'OPEN';
      this.lastStateChange = Date.now();
      this.emit('stateChange', 'OPEN');
    }
  }

  public getState(): 'CLOSED' | 'OPEN' | 'HALF_OPEN' {
    return this.state;
  }
}

export class HealthChecker extends EventEmitter {
  private timers: Map<string, NodeJS.Timeout> = new Map();

  public start(targetGroups: TargetGroup[]): void {
    for (const group of targetGroups) {
      for (const target of group.targets) {
        this.scheduleCheck(group, target);
      }
    }
  }

  public stop(): void {
    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
  }

  private scheduleCheck(group: TargetGroup, target: TargetNode): void {
    const key = `${group.id}:${target.id}`;
    if (this.timers.has(key)) {
      clearInterval(this.timers.get(key)!);
    }

    const timer = setInterval(() => {
      this.performCheck(group, target);
    }, group.healthCheck.intervalMs);

    this.timers.set(key, timer);
  }

  private performCheck(group: TargetGroup, target: TargetNode): void {
    const startTime = Date.now();
    const req = http.request(
      {
        host: target.host,
        port: target.port,
        path: group.healthCheck.path,
        method: 'GET',
        timeout: group.healthCheck.timeoutMs,
      },
      (res) => {
        const duration = Date.now() - startTime;
        target.latencyMs = duration;
        target.lastCheckedAt = new Date();

        const isStatusCodeValid = group.healthCheck.expectedStatusCodes.includes(res.statusCode || 0);

        if (isStatusCodeValid) {
          target.consecutiveFailures = 0;
          target.consecutiveSuccesses++;
          if (target.consecutiveSuccesses >= group.healthCheck.healthyThreshold && !target.isHealthy) {
            target.isHealthy = true;
            this.emit('healthChange', target, group, true);
          }
        } else {
          this.handleFailure(target, group);
        }
        res.resume();
      }
    );

    req.on('error', () => {
      this.handleFailure(target, group);
    });

    req.on('timeout', () => {
      req.destroy();
      this.handleFailure(target, group);
    });

    req.end();
  }

  private handleFailure(target: TargetNode, group: TargetGroup): void {
    target.consecutiveSuccesses = 0;
    target.consecutiveFailures++;
    target.lastCheckedAt = new Date();

    if (target.consecutiveFailures >= group.healthCheck.unhealthyThreshold && target.isHealthy) {
      target.isHealthy = false;
      this.emit('healthChange', target, group, false);
    }
  }
}

export class LoadBalancer {
  private rrIndices: Map<string, number> = new Map();

  public selectTarget(group: TargetGroup, clientIp: string): TargetNode | null {
    const healthyTargets = group.targets.filter((t) => t.isHealthy);
    if (healthyTargets.length === 0) {
      return null;
    }

    switch (group.strategy) {
      case 'ROUND_ROBIN':
        return this.selectRoundRobin(group.id, healthyTargets);
      case 'LEAST_CONNECTIONS':
        return this.selectLeastConnections(healthyTargets);
      case 'WEIGHTED_ROUND_ROBIN':
        return this.selectWeightedRoundRobin(group.id, healthyTargets);
      case 'IP_HASH':
        return this.selectIpHash(clientIp, healthyTargets);
      case 'LATENCY_BASED':
        return this.selectLowestLatency(healthyTargets);
      default:
        return this.selectRoundRobin(group.id, healthyTargets);
    }
  }

  private selectRoundRobin(groupId: string, targets: TargetNode[]): TargetNode {
    const currentIndex = this.rrIndices.get(groupId) || 0;
    const selected = targets[currentIndex % targets.length];
    this.rrIndices.set(groupId, (currentIndex + 1) % targets.length);
    return selected;
  }

  private selectLeastConnections(targets: TargetNode[]): TargetNode {
    return targets.reduce((prev, curr) => (curr.activeConnections < prev.activeConnections ? curr : prev));
  }

  private selectWeightedRoundRobin(groupId: string, targets: TargetNode[]): TargetNode {
    const totalWeight = targets.reduce((acc, t) => acc + (t.weight || 1), 0);
    const currentIndex = this.rrIndices.get(groupId) || 0;
    let point = currentIndex % totalWeight;
    this.rrIndices.set(groupId, (currentIndex + 1) % totalWeight);

    for (const target of targets) {
      point -= target.weight || 1;
      if (point < 0) {
        return target;
      }
    }
    return targets[0];
  }

  private selectIpHash(clientIp: string, targets: TargetNode[]): TargetNode {
    const hash = crypto.createHash('md5').update(clientIp).digest('hex');
    const index = parseInt(hash.substring(0, 8), 16) % targets.length;
    return targets[index];
  }

  private selectLowestLatency(targets: TargetNode[]): TargetNode {
    return targets.reduce((prev, curr) => (curr.latencyMs < prev.latencyMs ? curr : prev));
  }
}

const DEFAULT_GATEWAY_CONFIG: GatewayConfig = {
  port: 8080,
  targetGroups: [],
  rules: [],
  defaultTargetGroupId: 'default',
};

export class NetworkGateway extends EventEmitter {
  private config: GatewayConfig;
  private httpServer?: http.Server;
  private httpsServer?: https.Server;
  private healthChecker: HealthChecker;
  private loadBalancer: LoadBalancer;
  private circuitBreakers: Map<string, CircuitBreaker> = new Map();
  private targetGroupMap: Map<string, TargetGroup> = new Map();

  constructor(config: GatewayConfig = DEFAULT_GATEWAY_CONFIG) {
    super();
    this.config = config;
    this.healthChecker = new HealthChecker();
    this.loadBalancer = new LoadBalancer();

    // Register default billing account for gateway metrics
    billingTracker.registerAccount({
      id: 'acc-sovereign-default',
      name: 'Sovereign Default Billing',
      organization: 'Sovereign Org',
      ownerEmail: 'admin@sovereign.io',
      currency: 'USD',
      paymentMethod: 'sovereign_token',
      status: 'active',
      createdAt: new Date()
    }).catch(() => { /* already registered */ });

    // Register client segment in VPC Manager
    vpcManager.createSegment('segment-client-public', '0.0.0.0/0');
    vpcManager.updateIsolationStatus('segment-client-public', false);

    for (const tg of config.targetGroups || []) {
      this.targetGroupMap.set(tg.id, tg);

      // Register resource and set default IAM policy
      const resourceId = `targetGroups/${tg.id}`;
      defaultIAMEngine.registerResource({
        id: resourceId,
        type: 'targetGroup'
      });
      defaultIAMEngine.setIamPolicy(resourceId, {
        version: 1,
        bindings: [
          {
            role: 'roles/viewer',
            members: ['allUsers', 'allAuthenticatedUsers']
          }
        ]
      });

      // Register segment in VPC Manager
      vpcManager.createSegment(`segment-tg-${tg.id}`, '10.0.0.0/24');
      vpcManager.updateIsolationStatus(`segment-tg-${tg.id}`, false);

      for (const target of tg.targets) {
        this.circuitBreakers.set(target.id, new CircuitBreaker());
      }
    }

    this.healthChecker.on('healthChange', (target: TargetNode, group: TargetGroup, isHealthy: boolean) => {
      this.emit('targetHealthChanged', { targetId: target.id, groupId: group.id, isHealthy });
      monitor.log('warn', 'NetworkGateway', `Target health changed: ${target.id} in group ${group.id} is now ${isHealthy ? 'HEALTHY' : 'UNHEALTHY'}`, {
        targetId: target.id,
        groupId: group.id,
        isHealthy
      });
    });
  }

  public static async initialize(config: GatewayConfig = DEFAULT_GATEWAY_CONFIG): Promise<NetworkGateway> {
    const gateway = new NetworkGateway(config);
    await gateway.start();
    return gateway;
  }

  public async initialize(): Promise<void> {
    await this.start();
  }

  public async start(): Promise<void> {
    await secretVault.initialize().catch(() => {});

    if (this.config.sslPort && !this.config.sslConfig) {
      try {
        const cert = await secretVault.getSecret('ssl-cert');
        const key = await secretVault.getSecret('ssl-key');
        if (cert && key) {
          this.config.sslConfig = { cert, key };
        }
      } catch (e) {
        // Fallback or ignore
      }
    }

    this.healthChecker.start(this.config.targetGroups);

    this.httpServer = http.createServer((req, res) => this.handleRequest(req, res));
    await new Promise<void>((resolve) => {
      this.httpServer?.listen(this.config.port, () => {
        this.emit('started', { port: this.config.port, ssl: false });
        resolve();
      });
    });

    if (this.config.sslPort && this.config.sslConfig) {
      this.httpsServer = https.createServer(
        {
          cert: this.config.sslConfig.cert,
          key: this.config.sslConfig.key,
          ca: this.config.sslConfig.ca,
        },
        (req, res) => this.handleRequest(req, res)
      );

      await new Promise<void>((resolve) => {
        this.httpsServer?.listen(this.config.sslPort, () => {
          this.emit('started', { port: this.config.sslPort, ssl: true });
          resolve();
        });
      });
    }

    // Register gateway in Service Mesh
    const meshId = serviceMesh.register('NetworkGateway', '127.0.0.1', this.config.port, {
      sslPort: this.config.sslPort,
      defaultTargetGroupId: this.config.defaultTargetGroupId
    });

    // Keep heartbeat alive
    setInterval(() => {
      serviceMesh.heartbeat(meshId);
    }, 15000);

    // Register target nodes in Service Mesh
    for (const tg of this.config.targetGroups) {
      for (const target of tg.targets) {
        serviceMesh.register(`target-group-${tg.id}`, target.host, target.port, {
          targetId: target.id,
          weight: target.weight
        });
      }
    }
  }

  public async stop(): Promise<void> {
    this.healthChecker.stop();
    if (this.httpServer) {
      await new Promise((resolve) => this.httpServer?.close(resolve));
    }
    if (this.httpsServer) {
      await new Promise((resolve) => this.httpsServer?.close(resolve));
    }
    this.emit('stopped');
  }

  private handleRequest(req: http.IncomingMessage, res: http.ServerResponse): void {
    const clientIp = this.getClientIp(req);
    const matchedRule = this.matchRule(req);

    const targetGroupId = matchedRule ? matchedRule.targetGroupId : this.config.defaultTargetGroupId;
    const targetGroup = this.targetGroupMap.get(targetGroupId);

    if (!targetGroup) {
      res.writeHead(502, { 'Content-Type': 'text/plain' });
      res.end('Bad Gateway: Target Group Not Found');
      return;
    }

    const selectedTarget = this.loadBalancer.selectTarget(targetGroup, clientIp);
    if (!selectedTarget) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Service Unavailable: No healthy targets in group');
      return;
    }

    // VPC Manager Integration
    const clientSegment = 'segment-client-public';
    const targetSegment = `segment-tg-${targetGroupId}`;
    const isTrafficAllowed = vpcManager.validateTraffic(clientSegment, targetSegment, selectedTarget.port);
    if (!isTrafficAllowed) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end('Forbidden: Traffic blocked by Sovereign VPC Firewall');
      return;
    }

    // IAM Policy Engine Integration
    const principal = (req.headers['x-sovereign-principal'] as string) || 'allUsers';
    const permission = `gateway.routes.get`;
    const resourceId = `targetGroups/${targetGroupId}`;

    const accessDecision = defaultIAMEngine.evaluateAccess({
      principal,
      permission,
      resourceId,
      context: {
        'request.ip': clientIp,
        'request.time': new Date().toISOString()
      }
    });

    if (principal !== 'allUsers' && !accessDecision.allowed) {
      res.writeHead(403, { 'Content-Type': 'text/plain' });
      res.end(`Forbidden: IAM Policy Denied Access for ${principal}`);
      return;
    }

    const circuitBreaker = this.circuitBreakers.get(selectedTarget.id);
    if (circuitBreaker && !circuitBreaker.canExecute()) {
      res.writeHead(503, { 'Content-Type': 'text/plain' });
      res.end('Service Unavailable: Circuit Breaker Open');
      return;
    }

    this.proxyRequest(req, res, selectedTarget, matchedRule, circuitBreaker);
  }

  private matchRule(req: http.IncomingMessage): RoutingRule | null {
    const sortedRules = [...this.config.rules].sort((a, b) => b.priority - a.priority);
    const host = req.headers.host || '';
    const path = req.url || '/';

    for (const rule of sortedRules) {
      if (rule.method && rule.method.toUpperCase() !== req.method?.toUpperCase()) {
        continue;
      }

      if (rule.hostPattern) {
        if (typeof rule.hostPattern === 'string' && rule.hostPattern !== host) {
          continue;
        } else if (rule.hostPattern instanceof RegExp && !rule.hostPattern.test(host)) {
          continue;
        }
      }

      if (typeof rule.pathPattern === 'string') {
        if (path.startsWith(rule.pathPattern)) {
          return rule;
        }
      } else if (rule.pathPattern instanceof RegExp) {
        if (rule.pathPattern.test(path)) {
          return rule;
        }
      }
    }

    return null;
  }

  private proxyRequest(
    req: http.IncomingMessage,
    res: http.ServerResponse,
    target: TargetNode,
    rule: RoutingRule | null,
    cb?: CircuitBreaker
  ): void {
    target.activeConnections++;
    const startTime = Date.now();

    const headers = { ...req.headers };

    headers['x-forwarded-for'] = req.socket.remoteAddress || '';
    headers['x-forwarded-proto'] = (req.socket as net.Socket & { encrypted?: boolean }).encrypted ? 'https' : 'http';
    headers['x-forwarded-host'] = req.headers.host || '';

    if (rule?.headerTransforms?.add) {
      Object.assign(headers, rule.headerTransforms.add);
    }
    if (rule?.headerTransforms?.remove) {
      rule.headerTransforms.remove.forEach((h) => delete headers[h.toLowerCase()]);
    }

    const proxyReq = http.request(
      {
        host: target.host,
        port: target.port,
        path: req.url,
        method: req.method,
        headers,
        timeout: rule?.timeoutMs || 30000,
      },
      (proxyRes) => {
        target.activeConnections--;
        cb?.onSuccess();

        res.writeHead(proxyRes.statusCode || 500, proxyRes.headers);
        proxyRes.pipe(res);

        const latency = Date.now() - startTime;

        this.emit('proxySuccess', {
          targetId: target.id,
          statusCode: proxyRes.statusCode,
          latencyMs: latency,
        });

        // Monitoring Service Integration
        monitor.log('info', 'NetworkGateway', `Proxy request succeeded for target ${target.id}`, {
          targetId: target.id,
          statusCode: proxyRes.statusCode,
          latencyMs: latency
        });

        // Billing Tracker Integration
        const bytesSent = parseInt(proxyRes.headers['content-length'] || '0', 10);
        billingTracker.recordUsage({
          accountId: 'acc-sovereign-default',
          projectId: 'project-gateway',
          serviceName: 'NetworkGateway',
          resourceType: 'network_egress_gb',
          quantity: bytesSent / (1024 * 1024 * 1024), // Convert bytes to GB
          metadata: { targetId: target.id, statusCode: proxyRes.statusCode || 200 }
        }).catch(() => {});
      }
    );

    proxyReq.on('error', (err) => {
      target.activeConnections--;
      cb?.onFailure();

      if (!res.headersSent) {
        res.writeHead(502, { 'Content-Type': 'text/plain' });
        res.end('Bad Gateway: Proxy request failed');
      }

      this.emit('proxyError', { targetId: target.id, error: err.message });

      // Monitoring Service Integration
      monitor.log('error', 'NetworkGateway', `Proxy request failed for target ${target.id}: ${err.message}`, {
        targetId: target.id,
        error: err.message
      });
    });

    proxyReq.on('timeout', () => {
      proxyReq.destroy();
      target.activeConnections--;
      cb?.onFailure();

      if (!res.headersSent) {
        res.writeHead(504, { 'Content-Type': 'text/plain' });
        res.end('Gateway Timeout');
      }

      this.emit('proxyTimeout', { targetId: target.id });

      // Monitoring Service Integration
      monitor.log('warn', 'NetworkGateway', `Proxy request timed out for target ${target.id}`, {
        targetId: target.id
      });
    });

    req.pipe(proxyReq);
  }

  private getClientIp(req: http.IncomingMessage): string {
    const xForwardedFor = req.headers['x-forwarded-for'];
    if (xForwardedFor) {
      const ips = Array.isArray(xForwardedFor) ? xForwardedFor[0] : xForwardedFor.split(',')[0];
      return ips.trim();
    }
    return req.socket.remoteAddress || '127.0.0.1';
  }

  public getMetrics() {
    const metrics: Array<{
      targetGroupId: string;
      targets: Array<{ id: string; activeConnections: number; latencyMs: number; isHealthy: boolean; circuitState?: string }>;
    }> = [];

    for (const [tgId, group] of this.targetGroupMap.entries()) {
      metrics.push({
        targetGroupId: tgId,
        targets: group.targets.map((t) => ({
          id: t.id,
          activeConnections: t.activeConnections,
          latencyMs: t.latencyMs,
          isHealthy: t.isHealthy,
          circuitState: this.circuitBreakers.get(t.id)?.getState(),
        })),
      });
    }

    return metrics;
  }
}

export const networkGateway = new NetworkGateway();

export default NetworkGateway;