

// --- CONSOLIDATED FROM: ./api/AppRegistry/services/AppMetricsCollector.ts ---

import { EventEmitter } from 'events';
import { Request, Response, NextFunction, Router } from 'express';

export interface LatencySummary {
  min: number;
  max: number;
  avg: number;
  p50: number;
  p90: number;
  p99: number;
  count: number;
}

export interface ThroughputSummary {
  totalRequests: number;
  requestsPerSecond: number;
  requestsPerMinute: number;
  windowStartTime: number;
  windowEndTime: number;
}

export interface MemorySummary {
  heapUsed: number;
  heapTotal: number;
  rss: number;
  appAllocatedBytes: number;
  timestamp: number;
}

export interface ErrorSummary {
  totalErrors: number;
  errorRate: number;
  errorsByCode: Record<string, number>;
  lastErrorTimestamp?: number;
  lastErrorMessage?: string;
}

export interface AppMetrics {
  appId: string;
  latency: LatencySummary;
  throughput: ThroughputSummary;
  memory: MemorySummary;
  errors: ErrorSummary;
  lastUpdated: number;
}

export interface MetricThresholds {
  maxLatencyMs?: number;
  maxErrorRatePercent?: number;
  maxMemoryBytes?: number;
}

interface RawAppData {
  latencySamples: number[];
  requestTimestamps: number[];
  totalRequests: number;
  totalErrors: number;
  errorsByCode: Record<string, number>;
  lastErrorTimestamp?: number;
  lastErrorMessage?: string;
  appAllocatedBytes: number;
  thresholds?: MetricThresholds;
}

export class AppMetricsCollector extends EventEmitter {
  private static instance: AppMetricsCollector;
  private appStore: Map<string, RawAppData> = new Map();
  private maxSamples: number = 1000;
  private windowDurationMs: number = 60000;
  private cleanupInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.startPeriodicCleanup();
  }

  public static getInstance(): AppMetricsCollector {
    if (!AppMetricsCollector.instance) {
      AppMetricsCollector.instance = new AppMetricsCollector();
    }
    return AppMetricsCollector.instance;
  }

  public getRouter(): Router {
    const router = Router();
    router.get('/:appId', (req: Request, res: Response) => {
      const { appId } = req.params;
      res.json(this.getMetrics(Array.isArray(appId) ? appId[0] : appId));
    });
    router.get('/', (_req: Request, res: Response) => {
      res.json(this.getAllMetrics());
    });
    router.post('/:appId/thresholds', (req: Request, res: Response) => {
      this.setThresholds(Array.isArray(req.params.appId) ? req.params.appId[0] : req.params.appId, req.body);
      res.status(204).send();
    });
    return router;
  }

  private getOrCreateAppData(appId: string): RawAppData {
    let data = this.appStore.get(appId);
    if (!data) {
      data = {
        latencySamples: [],
        requestTimestamps: [],
        totalRequests: 0,
        totalErrors: 0,
        errorsByCode: {},
        appAllocatedBytes: 0,
      };
      this.appStore.set(appId, data);
    }
    return data;
  }

  public setThresholds(appId: string, thresholds: MetricThresholds): void {
    const data = this.getOrCreateAppData(appId);
    data.thresholds = thresholds;
  }

  public recordLatency(appId: string, durationMs: number): void {
    const data = this.getOrCreateAppData(appId);
    data.latencySamples.push(durationMs);
    if (data.latencySamples.length > this.maxSamples) data.latencySamples.shift();

    if (data.thresholds?.maxLatencyMs && durationMs > data.thresholds.maxLatencyMs) {
      this.emit('thresholdExceeded', { appId, metric: 'latency', value: durationMs, threshold: data.thresholds.maxLatencyMs, timestamp: Date.now() });
    }
  }

  public recordRequest(appId: string, isError: boolean = false, errorCode?: string, errorMessage?: string): void {
    const now = Date.now();
    const data = this.getOrCreateAppData(appId);
    data.totalRequests++;
    data.requestTimestamps.push(now);

    if (isError) {
      data.totalErrors++;
      const code = errorCode || 'UNKNOWN_ERROR';
      data.errorsByCode[code] = (data.errorsByCode[code] || 0) + 1;
      data.lastErrorTimestamp = now;
      if (errorMessage) data.lastErrorMessage = errorMessage;
    }
  }

  public recordMemoryUsage(appId: string, bytes: number): void {
    const data = this.getOrCreateAppData(appId);
    data.appAllocatedBytes = bytes;
  }

  public measureAsync<T>(appId: string, fn: () => Promise<T>): Promise<T> {
    const startTime = performance.now();
    this.recordRequest(appId, false);
    return fn()
      .then((result) => {
        this.recordLatency(appId, performance.now() - startTime);
        return result;
      })
      .catch((error) => {
        this.recordLatency(appId, performance.now() - startTime);
        this.recordRequest(appId, true, error?.code || 'EXECUTION_ERROR', error?.message);
        throw error;
      });
  }

  public getMetrics(appId: string): AppMetrics {
    const data = this.appStore.get(appId);
    const now = Date.now();
    if (!data) return { appId, latency: { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p99: 0, count: 0 }, throughput: { totalRequests: 0, requestsPerSecond: 0, requestsPerMinute: 0, windowStartTime: now - this.windowDurationMs, windowEndTime: now }, memory: this.getMemorySnapshot(0), errors: { totalErrors: 0, errorRate: 0, errorsByCode: {} }, lastUpdated: now };
    return { appId, latency: this.calculateLatency(data.latencySamples), throughput: this.calculateThroughput(data.requestTimestamps, data.totalRequests, now), memory: this.getMemorySnapshot(data.appAllocatedBytes), errors: this.calculateErrors(data), lastUpdated: now };
  }

  public getAllMetrics(): Record<string, AppMetrics> {
    const result: Record<string, AppMetrics> = {};
    for (const appId of this.appStore.keys()) result[appId] = this.getMetrics(appId);
    return result;
  }

  public resetMetrics(appId?: string): void {
    appId ? this.appStore.delete(appId) : this.appStore.clear();
  }

  private calculateLatency(samples: number[]): LatencySummary {
    if (samples.length === 0) return { min: 0, max: 0, avg: 0, p50: 0, p90: 0, p99: 0, count: 0 };
    const sorted = [...samples].sort((a, b) => a - b);
    const sum = sorted.reduce((acc, v) => acc + v, 0);
    return { min: sorted[0], max: sorted[sorted.length - 1], avg: sum / sorted.length, p50: this.getPercentile(sorted, 0.50), p90: this.getPercentile(sorted, 0.90), p99: this.getPercentile(sorted, 0.99), count: samples.length };
  }

  private getPercentile(sorted: number[], p: number): number {
    const idx = Math.ceil(p * sorted.length) - 1;
    return sorted[Math.max(0, Math.min(idx, sorted.length - 1))];
  }

  private calculateThroughput(timestamps: number[], totalRequests: number, now: number): ThroughputSummary {
    const windowStart = now - this.windowDurationMs;
    const recent = timestamps.filter((ts) => ts >= windowStart).length;
    return { totalRequests, requestsPerSecond: parseFloat((recent / 60).toFixed(2)), requestsPerMinute: recent, windowStartTime: windowStart, windowEndTime: now };
  }

  private calculateErrors(data: RawAppData): ErrorSummary {
    const rate = data.totalRequests > 0 ? (data.totalErrors / data.totalRequests) * 100 : 0;
    return { totalErrors: data.totalErrors, errorRate: parseFloat(rate.toFixed(2)), errorsByCode: { ...data.errorsByCode }, lastErrorTimestamp: data.lastErrorTimestamp, lastErrorMessage: data.lastErrorMessage };
  }

  private getMemorySnapshot(appAllocatedBytes: number): MemorySummary {
    const mem = typeof process !== 'undefined' && process.memoryUsage ? process.memoryUsage() : { heapUsed: 0, heapTotal: 0, rss: 0 };
    return { heapUsed: mem.heapUsed, heapTotal: mem.heapTotal, rss: mem.rss, appAllocatedBytes, timestamp: Date.now() };
  }

  private startPeriodicCleanup(): void {
    if (this.cleanupInterval) return;
    this.cleanupInterval = setInterval(() => {
      const cutoff = Date.now() - this.windowDurationMs;
      for (const data of this.appStore.values()) data.requestTimestamps = data.requestTimestamps.filter((ts) => ts >= cutoff);
    }, 30000);
    if (typeof this.cleanupInterval === 'object' && 'unref' in this.cleanupInterval) (this.cleanupInterval as any).unref();
  }

  public stop(): void {
    if (this.cleanupInterval) clearInterval(this.cleanupInterval);
  }
}

export const appMetricsCollector = AppMetricsCollector.getInstance();
export default AppMetricsCollector;