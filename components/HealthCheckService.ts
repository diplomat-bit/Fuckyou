

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/HealthCheckService.ts ---

import { EventEmitter } from 'events';
import { Router, Request, Response } from 'express';
import os from 'os';

export type ServiceHealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  method?: 'GET' | 'HEAD' | 'POST';
  headers?: Record<string, string>;
  expectedStatus?: number;
  timeoutMs?: number;
  checkIntervalMs?: number;
  criticality?: 'critical' | 'high' | 'medium' | 'low';
  tags?: string[];
  recoveryCommand?: string; // Self-healing hook
}

export interface HealthCheckProbeResult {
  timestamp: string;
  responseTimeMs: number;
  status: ServiceHealthStatus;
  statusCode?: number;
  error?: string;
}

export interface EndpointHealthResult {
  id: string;
  name: string;
  url: string;
  status: ServiceHealthStatus;
  statusCode?: number;
  responseTimeMs: number;
  lastCheckedAt: string;
  errorMessage?: string;
  consecutiveFailures: number;
  totalChecks: number;
  successfulChecks: number;
  uptimePercentage: number;
  criticality: 'critical' | 'high' | 'medium' | 'low';
  history: HealthCheckProbeResult[];
}

export interface SystemMetrics {
  cpuUsagePercent: number;
  freeMemoryBytes: number;
  totalMemoryBytes: number;
  memoryUsagePercent: number;
  uptimeSeconds: number;
  loadAverage: number[];
}

export interface SystemHealthReport {
  timestamp: string;
  overallStatus: ServiceHealthStatus;
  totalEndpoints: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  averageResponseTimeMs: number;
  systemUptimePercentage: number;
  systemMetrics: SystemMetrics;
  endpoints: Record<string, EndpointHealthResult>;
}

export interface HealthCheckOptions {
  autoStart?: boolean;
  defaultTimeoutMs?: number;
  defaultIntervalMs?: number;
  maxHistoryLength?: number;
  degradedLatencyThresholdMs?: number;
}

export class HealthCheckService extends EventEmitter {
  private static instance: HealthCheckService | null = null;

  private endpoints: Map<string, EndpointConfig> = new Map();
  private results: Map<string, EndpointHealthResult> = new Map();
  private timers: Map<string, NodeJS.Timeout> = new Map();
  private isRunning: boolean = false;

  private readonly defaultTimeoutMs: number;
  private readonly defaultIntervalMs: number;
  private readonly maxHistoryLength: number;
  private readonly degradedLatencyThresholdMs: number;

  constructor(options: HealthCheckOptions = {}) {
    super();
    this.defaultTimeoutMs = options.defaultTimeoutMs ?? 5000;
    this.defaultIntervalMs = options.defaultIntervalMs ?? 30000;
    this.maxHistoryLength = options.maxHistoryLength ?? 50;
    this.degradedLatencyThresholdMs = options.degradedLatencyThresholdMs ?? 1500;

    this.initializeDefaultEndpoints();

    if (options.autoStart) {
      this.startMonitoring();
    }
  }

  public static getInstance(options?: HealthCheckOptions): HealthCheckService {
    if (!HealthCheckService.instance) {
      HealthCheckService.instance = new HealthCheckService(options);
    }
    return HealthCheckService.instance;
  }

  private initializeDefaultEndpoints(): void {
    const defaultConfigs: EndpointConfig[] = [
      {
        id: 'api-core',
        name: 'Core Gateway API',
        url: '/api/health',
        checkIntervalMs: 15000,
        criticality: 'critical',
        tags: ['core', 'gateway']
      },
      {
        id: 'auth-service',
        name: 'Identity & Authentication',
        url: '/api/middleware/auths',
        checkIntervalMs: 20000,
        criticality: 'critical',
        tags: ['auth', 'identity']
      },
      {
        id: 'alpaca-bridge',
        name: 'Alpaca Brokerage Bridge',
        url: '/api/alpaca',
        checkIntervalMs: 30000,
        criticality: 'high',
        tags: ['trading', 'alpaca']
      },
      {
        id: 'citi-connect',
        name: 'Citi Treasury Gateway',
        url: '/api/citi',
        checkIntervalMs: 30000,
        criticality: 'high',
        tags: ['treasury', 'banking']
      },
      {
        id: 'modern-treasury',
        name: 'Modern Treasury Ledger',
        url: '/api/modern-treasury',
        checkIntervalMs: 45000,
        criticality: 'medium',
        tags: ['ledger', 'treasury']
      },
      {
        id: 'azure-compliance',
        name: 'Azure Government Compliance',
        url: '/api/azureGovCompliance',
        checkIntervalMs: 60000,
        criticality: 'medium',
        tags: ['compliance', 'azure']
      },
      {
        id: 'ai-engine',
        name: 'AI Agent Factory & Reasoning',
        url: '/api/ai',
        checkIntervalMs: 30000,
        criticality: 'high',
        tags: ['ai', 'analytics']
      }
    ];

    for (const config of defaultConfigs) {
      this.registerEndpoint(config);
    }
  }

  public registerEndpoint(config: EndpointConfig): void {
    this.endpoints.set(config.id, config);
    if (!this.results.has(config.id)) {
      this.results.set(config.id, {
        id: config.id,
        name: config.name,
        url: config.url,
        status: 'unknown',
        responseTimeMs: 0,
        lastCheckedAt: new Date().toISOString(),
        consecutiveFailures: 0,
        totalChecks: 0,
        successfulChecks: 0,
        uptimePercentage: 100,
        criticality: config.criticality || 'medium',
        history: []
      });
    }

    if (this.isRunning) {
      this.scheduleEndpointCheck(config);
    }
  }

  public unregisterEndpoint(id: string): boolean {
    this.clearEndpointTimer(id);
    const removedEndpoint = this.endpoints.delete(id);
    this.results.delete(id);
    return removedEndpoint;
  }

  public startMonitoring(): void {
    if (this.isRunning) return;
    this.isRunning = true;

    for (const config of this.endpoints.values()) {
      this.scheduleEndpointCheck(config);
    }

    this.emit('monitoring:started', { timestamp: new Date().toISOString() });
  }

  public stopMonitoring(): void {
    if (!this.isRunning) return;

    for (const timer of this.timers.values()) {
      clearInterval(timer);
    }
    this.timers.clear();
    this.isRunning = false;

    this.emit('monitoring:stopped', { timestamp: new Date().toISOString() });
  }

  private scheduleEndpointCheck(config: EndpointConfig): void {
    this.clearEndpointTimer(config.id);

    // Initial check immediately
    this.checkEndpointNow(config.id).catch(() => {});

    const interval = config.checkIntervalMs || this.defaultIntervalMs;
    const timer = setInterval(() => {
      this.checkEndpointNow(config.id).catch(() => {});
    }, interval);

    this.timers.set(config.id, timer);
  }

  private clearEndpointTimer(id: string): void {
    if (this.timers.has(id)) {
      clearInterval(this.timers.get(id)!);
      this.timers.delete(id);
    }
  }

  public async check(id: string): Promise<EndpointHealthResult> {
    return this.checkEndpointNow(id);
  }

  public async runHealthCheck(id: string): Promise<EndpointHealthResult> {
    return this.checkEndpointNow(id);
  }

  public async checkAllHealth(): Promise<SystemHealthReport> {
    return this.runFullDiagnostics();
  }

  public async checkEndpointNow(id: string): Promise<EndpointHealthResult> {
    const config = this.endpoints.get(id);
    if (!config) {
      throw new Error(`Endpoint with ID '${id}' is not registered.`);
    }

    const currentResult = this.results.get(id)!;
    const startTime = Date.now();
    let status: ServiceHealthStatus = 'unhealthy';
    let statusCode: number | undefined;
    let errorMessage: string | undefined;

    const timeout = config.timeoutMs || this.defaultTimeoutMs;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), timeout);

    try {
      // Support relative URLs by resolving against a default host if needed
      const targetUrl = config.url.startsWith('/') 
        ? `http://localhost:${process.env.PORT || 3000}${config.url}` 
        : config.url;

      const response = await fetch(targetUrl, {
        method: config.method || 'GET',
        headers: config.headers || {},
        signal: controller.signal
      });

      statusCode = response.status;
      const expectedStatus = config.expectedStatus || 200;

      if (response.status === expectedStatus || (response.status >= 200 && response.status < 300)) {
        status = 'healthy';
      } else {
        status = 'degraded';
        errorMessage = `Unexpected HTTP status code: ${response.status}`;
      }
    } catch (error: any) {
      status = 'unhealthy';
      if (error.name === 'AbortError') {
        errorMessage = `Request timed out after ${timeout}ms`;
      } else {
        errorMessage = error.message || 'Network request failed';
      }
    } finally {
      clearTimeout(timeoutId);
    }

    const responseTimeMs = Date.now() - startTime;

    if (status === 'healthy' && responseTimeMs > this.degradedLatencyThresholdMs) {
      status = 'degraded';
      errorMessage = `Latency high: ${responseTimeMs}ms exceeds threshold (${this.degradedLatencyThresholdMs}ms)`;
    }

    const updatedTotalChecks = currentResult.totalChecks + 1;
    const isSuccess = status === 'healthy' || status === 'degraded';
    const updatedSuccessfulChecks = currentResult.successfulChecks + (isSuccess ? 1 : 0);
    const consecutiveFailures = isSuccess ? 0 : currentResult.consecutiveFailures + 1;
    const uptimePercentage = Math.round((updatedSuccessfulChecks / updatedTotalChecks) * 10000) / 100;

    const probeResult: HealthCheckProbeResult = {
      timestamp: new Date().toISOString(),
      responseTimeMs,
      status,
      statusCode,
      error: errorMessage
    };

    const newHistory = [probeResult, ...currentResult.history].slice(0, this.maxHistoryLength);

    const updatedResult: EndpointHealthResult = {
      ...currentResult,
      status,
      statusCode,
      responseTimeMs,
      lastCheckedAt: probeResult.timestamp,
      errorMessage,
      consecutiveFailures,
      totalChecks: updatedTotalChecks,
      successfulChecks: updatedSuccessfulChecks,
      uptimePercentage,
      history: newHistory
    };

    this.results.set(id, updatedResult);

    this.emit('endpoint:checked', updatedResult);

    if (currentResult.status !== status && currentResult.status !== 'unknown') {
      this.emit('endpoint:status-change', {
        id,
        name: config.name,
        previousStatus: currentResult.status,
        newStatus: status,
        result: updatedResult
      });
    }

    if (status === 'unhealthy') {
      this.emit('endpoint:failure', {
        id,
        name: config.name,
        error: errorMessage,
        consecutiveFailures
      });

      // Self-healing trigger
      if (consecutiveFailures >= 3 && config.recoveryCommand) {
        this.emit('endpoint:self-heal', {
          id,
          name: config.name,
          recoveryCommand: config.recoveryCommand,
          consecutiveFailures
        });
      }
    }

    return updatedResult;
  }

  public async runFullDiagnostics(): Promise<SystemHealthReport> {
    const checkPromises = Array.from(this.endpoints.keys()).map((id) =>
      this.checkEndpointNow(id).catch((err) => {
        const existing = this.results.get(id);
        if (existing) {
          return existing;
        }
        throw err;
      })
    );

    await Promise.allSettled(checkPromises);
    return this.getSystemHealthReport();
  }

  public getSystemHealthReport(): SystemHealthReport {
    const endpointsMap: Record<string, EndpointHealthResult> = {};
    let totalEndpoints = 0;
    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;
    let totalResponseTimeMs = 0;
    let totalUptimePercentageSum = 0;

    for (const [id, result] of this.results.entries()) {
      endpointsMap[id] = { ...result };
      totalEndpoints++;

      if (result.status === 'healthy') healthyCount++;
      else if (result.status === 'degraded') degradedCount++;
      else if (result.status === 'unhealthy') unhealthyCount++;

      totalResponseTimeMs += result.responseTimeMs;
      totalUptimePercentageSum += result.uptimePercentage;
    }

    const averageResponseTimeMs =
      totalEndpoints > 0 ? Math.round(totalResponseTimeMs / totalEndpoints) : 0;
    const systemUptimePercentage =
      totalEndpoints > 0 ? Math.round((totalUptimePercentageSum / totalEndpoints) * 100) / 100 : 100;

    let overallStatus: ServiceHealthStatus = 'healthy';
    if (unhealthyCount > 0) {
      const hasCriticalFailure = Array.from(this.results.values()).some(
        (r) => r.criticality === 'critical' && r.status === 'unhealthy'
      );
      overallStatus = hasCriticalFailure ? 'unhealthy' : 'degraded';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }

    // Gather system metrics
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercent = Math.round((usedMem / totalMem) * 10000) / 100;

    const systemMetrics: SystemMetrics = {
      cpuUsagePercent: Math.round((os.loadavg()[0] / os.cpus().length) * 100),
      freeMemoryBytes: freeMem,
      totalMemoryBytes: totalMem,
      memoryUsagePercent,
      uptimeSeconds: os.uptime(),
      loadAverage: os.loadavg()
    };

    return {
      timestamp: new Date().toISOString(),
      overallStatus,
      totalEndpoints,
      healthyCount,
      degradedCount,
      unhealthyCount,
      averageResponseTimeMs,
      systemUptimePercentage,
      systemMetrics,
      endpoints: endpointsMap
    };
  }

  public getEndpointResult(id: string): EndpointHealthResult | undefined {
    return this.results.get(id);
  }

  public resetMetrics(id?: string): void {
    if (id) {
      const existing = this.results.get(id);
      if (existing) {
        this.results.set(id, {
          ...existing,
          status: 'unknown',
          responseTimeMs: 0,
          consecutiveFailures: 0,
          totalChecks: 0,
          successfulChecks: 0,
          uptimePercentage: 100,
          history: []
        });
      }
    } else {
      for (const [key, value] of this.results.entries()) {
        this.results.set(key, {
          ...value,
          status: 'unknown',
          responseTimeMs: 0,
          consecutiveFailures: 0,
          totalChecks: 0,
          successfulChecks: 0,
          uptimePercentage: 100,
          history: []
        });
      }
    }
  }

  /**
   * Generates an Express Router pre-configured with all API routes for this service.
   */
  public static getRouter(service: HealthCheckService = HealthCheckService.getInstance()): Router {
    const router = Router();

    // Get overall system health report
    router.get('/report', async (req: Request, res: Response) => {
      try {
        const report = service.getSystemHealthReport();
        res.json(report);
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Run full diagnostics and return report
    router.post('/check-all', async (req: Request, res: Response) => {
      try {
        const report = await service.runFullDiagnostics();
        res.json({ success: true, report });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Get specific endpoint health
    router.get('/endpoints/:id', (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const result = service.getEndpointResult(id);
      if (!result) {
        return res.status(404).json({ success: false, error: `Endpoint with ID '${id}' not found.` });
      }
      res.json({ success: true, result });
    });

    // Trigger check for specific endpoint
    router.post('/endpoints/:id/check', async (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      try {
        const result = await service.checkEndpointNow(id);
        res.json({ success: true, result });
      } catch (error: any) {
        res.status(404).json({ success: false, error: error.message });
      }
    });

    // Register new endpoint
    router.post('/endpoints', (req: Request, res: Response) => {
      const config: EndpointConfig = req.body;
      if (!config.id || !config.name || !config.url) {
        return res.status(400).json({ success: false, error: 'Missing required fields: id, name, url' });
      }
      try {
        service.registerEndpoint(config);
        res.status(201).json({ 
          success: true, 
          message: `Endpoint '${config.id}' registered successfully.`, 
          result: service.getEndpointResult(config.id) 
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Unregister endpoint
    router.delete('/endpoints/:id', (req: Request, res: Response) => {
      const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
      const removed = service.unregisterEndpoint(id);
      if (!removed) {
        return res.status(404).json({ success: false, error: `Endpoint with ID '${id}' not found.` });
      }
      res.json({ success: true, message: `Endpoint '${id}' unregistered successfully.` });
    });

    // Reset metrics
    router.post('/reset', (req: Request, res: Response) => {
      const { id } = req.body;
      try {
        service.resetMetrics(id);
        res.json({ 
          success: true, 
          message: id ? `Metrics reset for endpoint '${id}'.` : 'All metrics reset successfully.' 
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Start monitoring
    router.post('/start', (req: Request, res: Response) => {
      try {
        service.startMonitoring();
        res.json({ success: true, message: 'Monitoring started.' });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // Stop monitoring
    router.post('/stop', (req: Request, res: Response) => {
      try {
        service.stopMonitoring();
        res.json({ success: true, message: 'Monitoring stopped.' });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    return router;
  }
}

export default HealthCheckService;