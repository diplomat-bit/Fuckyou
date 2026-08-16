import { EventEmitter } from 'events';
import { promises as fs } from 'fs';
import path from 'path';
import os from 'os';
import { pubSub } from './PubSubLocal';
import { autoScaler } from './AutoScaler';
import { cloudReplacementEngine } from './CloudReplacementEngine';

interface TelemetryEvent {
  timestamp: number;
  level: 'info' | 'warn' | 'error' | 'critical';
  source: string;
  message: string;
  metadata?: Record<string, any>;
}

interface SystemMetrics {
  eventCounts: Record<string, number>;
  sourceCounts: Record<string, number>;
  lastCriticalEvent?: TelemetryEvent;
}

export class MonitoringService extends EventEmitter {
  private static instance: MonitoringService;
  private logPath: string;
  private buffer: TelemetryEvent[] = [];
  private readonly FLUSH_THRESHOLD = 50;
  private metrics: SystemMetrics = {
    eventCounts: { info: 0, warn: 0, error: 0, critical: 0 },
    sourceCounts: {}
  };
  private alertCallbacks: Array<(event: TelemetryEvent) => void> = [];

  private constructor() {
    super();
    this.logPath = path.join(process.cwd(), 'logs', 'telemetry.log');
    this.init();
  }

  public static getInstance(): MonitoringService {
    if (!MonitoringService.instance) {
      MonitoringService.instance = new MonitoringService();
    }
    return MonitoringService.instance;
  }

  private async init() {
    try {
      await fs.mkdir(path.dirname(this.logPath), { recursive: true });
      this.log('info', 'MonitoringService', 'Local telemetry storage initialized successfully.');
    } catch (err) {
      console.error('Failed to initialize local telemetry storage', err);
    }
  }

  public registerAlertCallback(callback: (event: TelemetryEvent) => void) {
    this.alertCallbacks.push(callback);
  }

  public getMetrics(): SystemMetrics {
    return { ...this.metrics };
  }

  public async getLogs(limit: number = 100): Promise<TelemetryEvent[]> {
    try {
      const content = await fs.readFile(this.logPath, 'utf8');
      const lines = content.trim().split('\n').filter(Boolean);
      const events = lines.map(line => JSON.parse(line) as TelemetryEvent);
      return events.slice(-limit);
    } catch (err) {
      return [];
    }
  }

  public async clearLogs(): Promise<void> {
    try {
      await fs.writeFile(this.logPath, '', 'utf8');
    } catch (err) {
      console.error('Failed to clear logs', err);
    }
  }

  public log(level: TelemetryEvent['level'], source: string, message: string, metadata?: Record<string, any>) {
    const event: TelemetryEvent = {
      timestamp: Date.now(),
      level,
      source,
      message,
      metadata: {
        ...metadata,
        cpuUsage: os.loadavg(),
        memoryUsage: process.memoryUsage().heapUsed
      }
    };

    // Update metrics
    this.metrics.eventCounts[level] = (this.metrics.eventCounts[level] || 0) + 1;
    this.metrics.sourceCounts[source] = (this.metrics.sourceCounts[source] || 0) + 1;
    if (level === 'critical') {
      this.metrics.lastCriticalEvent = event;
    }

    this.buffer.push(event);
    this.emit('event', event);

    // Trigger alert callbacks
    if (level === 'critical' || level === 'error') {
      for (const callback of this.alertCallbacks) {
        try {
          callback(event);
        } catch (err) {
          console.error('Alert callback failed', err);
        }
      }
    }

    // Publish to local PubSub for real-time reactive scaling/monitoring
    try {
      pubSub.publish(`telemetry.${level}`, event);
    } catch (err) {
      // Fallback if pubSub is not fully initialized
    }

    // Trigger autoScaler if there is a critical event
    if (level === 'critical') {
      try {
        if (typeof (autoScaler as any).emit === 'function') {
          (autoScaler as any).emit('pressure', `CRITICAL_EVENT_${source.toUpperCase()}`);
        }
      } catch (err) {}
    }

    if (this.buffer.length >= this.FLUSH_THRESHOLD || level === 'critical') {
      this.flush();
    }
  }

  public async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const dataToFlush = [...this.buffer];
    this.buffer = [];

    try {
      const logEntry = dataToFlush.map(e => JSON.stringify(e)).join('\n') + '\n';
      await fs.appendFile(this.logPath, logEntry, 'utf8');
    } catch (err) {
      console.error('Telemetry flush failed', err);
      this.buffer = [...dataToFlush, ...this.buffer];
    }
  }

  private async getServiceStatus(serviceName: string): Promise<any> {
    try {
      // Dynamically import to avoid circular dependencies
      const modulePath = `./${serviceName}`;
      const module = await import(modulePath);
      const service = module.default || module[serviceName.charAt(0).toLowerCase() + serviceName.slice(1)] || module;
      
      if (service) {
        if (typeof service.getStatus === 'function') {
          return service.getStatus();
        }
        if (typeof service.getState === 'function') {
          return service.getState();
        }
        return { status: 'LOADED' };
      }
    } catch (e) {
      // Service might not be fully initialized or exported
    }
    return { status: 'UNKNOWN' };
  }

  public async getSystemHealth() {
    let cloudEngineStatus: any = {};
    let scalerStatus: any = {};

    try {
      if (typeof (cloudReplacementEngine as any).getResourceStatus === 'function') {
        cloudEngineStatus = (cloudReplacementEngine as any).getResourceStatus();
      }
    } catch (e) {}

    try {
      if (typeof (autoScaler as any).getStatus === 'function') {
        scalerStatus = (autoScaler as any).getStatus();
      }
    } catch (e) {}

    const services: Record<string, any> = {
      cloudReplacementEngine: cloudEngineStatus,
      autoScaler: scalerStatus,
    };

    const otherServices = [
      'DatabaseBridge',
      'SecretVault',
      'BillingTracker',
      'BackupService',
      'CDNReplacement',
      'CloudFunctionsShim',
      'ComputeOrchestrator',
      'DeploymentPipeline',
      'IAMPolicyEngine',
      'NetworkGateway',
      'ServiceMesh',
      'StorageAbstraction',
      'VertexAIProxy',
      'VpcManager'
    ];

    for (const service of otherServices) {
      const key = service.charAt(0).toLowerCase() + service.slice(1);
      services[key] = await this.getServiceStatus(service);
    }

    return {
      uptime: os.uptime(),
      freeMem: os.freemem(),
      totalMem: os.totalmem(),
      load: os.loadavg(),
      platform: os.platform(),
      memoryUsage: process.memoryUsage(),
      services
    };
  }
}

export const monitor = MonitoringService.getInstance();
export default monitor;