import { Request, Response, NextFunction, Router } from 'express';
import { logger } from '../utils/logger';

export interface RouteMetricSample {
  timestamp: number;
  durationMs: number;
  statusCode: number;
  contentLength: number;
  error?: boolean;
}

export interface LatencyPercentiles {
  p50: number;
  p90: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
}

export interface RoutePerformanceSummary {
  route: string;
  method: string;
  totalRequests: number;
  totalErrors: number;
  errorRatePercentage: number;
  throughputRps: number;
  avgResponseSizeBytes: number;
  latency: LatencyPercentiles;
  lastUpdated: number;
}

export interface PerformanceMonitorOptions {
  windowSizeMs?: number;
  maxSamplesPerRoute?: number;
  slowQueryThresholdMs?: number;
  onSlowRequest?: (route: string, method: string, durationMs: number, req: Request) => void;
  onHighErrorRate?: (route: string, errorRate: number) => void;
}

export class PerformanceMonitor {
  private static instance: PerformanceMonitor;
  private windowSizeMs: number;
  private maxSamplesPerRoute: number;
  private slowQueryThresholdMs: number;
  private samples: Map<string, RouteMetricSample[]> = new Map();
  private onSlowRequestCallback?: (route: string, method: string, durationMs: number, req: Request) => void;
  private onHighErrorRateCallback?: (route: string, errorRate: number) => void;

  private constructor(options: PerformanceMonitorOptions = {}) {
    this.windowSizeMs = options.windowSizeMs || 300000;
    this.maxSamplesPerRoute = options.maxSamplesPerRoute || 1000;
    this.slowQueryThresholdMs = options.slowQueryThresholdMs || 1000;
    this.onSlowRequestCallback = options.onSlowRequest;
    this.onHighErrorRateCallback = options.onHighErrorRate;

    const cleanupInterval = Math.max(10000, Math.floor(this.windowSizeMs / 2));
    if (typeof setInterval !== 'undefined') {
      setInterval(() => this.pruneStaleSamples(), cleanupInterval).unref?.();
    }
  }

  public static getInstance(options?: PerformanceMonitorOptions): PerformanceMonitor {
    if (!PerformanceMonitor.instance) {
      PerformanceMonitor.instance = new PerformanceMonitor(options);
    }
    return PerformanceMonitor.instance;
  }

  public getRouter(): Router {
    const router = Router();
    router.get('/metrics', (req, res) => {
      res.json(this.getAllMetrics());
    });
    router.get('/metrics/:method/:route*', (req, res) => {
      const { method, route } = req.params as Record<string, string>;
      const fullRoute = `/${route}${(req.params as Record<string, string>)['0'] || ''}`;
      const summary = this.getRouteSummary(method, fullRoute);
      if (!summary) return res.status(404).json({ error: 'Metric not found' });
      res.json(summary);
    });
    return router;
  }

  private getRouteKey(method: string, routePath: string): string {
    return `${method.toUpperCase()}:${routePath}`;
  }

  public recordMetric(
    method: string,
    routePath: string,
    durationMs: number,
    statusCode: number,
    contentLength: number = 0,
    req?: Request
  ): void {
    const key = this.getRouteKey(method, routePath);
    const isError = statusCode >= 400;
    const now = Date.now();

    const sample: RouteMetricSample = {
      timestamp: now,
      durationMs,
      statusCode,
      contentLength,
      error: isError,
    };

    if (!this.samples.has(key)) {
      this.samples.set(key, []);
    }

    const routeSamples = this.samples.get(key)!;
    routeSamples.push(sample);

    if (routeSamples.length > this.maxSamplesPerRoute) {
      routeSamples.shift();
    }

    if (durationMs >= this.slowQueryThresholdMs && req && this.onSlowRequestCallback) {
      this.onSlowRequestCallback(routePath, method, durationMs, req);
    }

    if (isError && this.onHighErrorRateCallback) {
      const summary = this.getRouteSummary(method, routePath);
      if (summary && summary.totalRequests >= 20 && summary.errorRatePercentage > 15) {
        this.onHighErrorRateCallback(key, summary.errorRatePercentage);
      }
    }
  }

  public middleware() {
    return (req: Request, res: Response, next: NextFunction): void => {
      const startTime = process.hrtime.bigint();

      res.on('finish', () => {
        const endTime = process.hrtime.bigint();
        const durationNs = endTime - startTime;
        const durationMs = Number(durationNs) / 1000000;

        const routePath = (req.route && req.route.path) ? req.route.path : req.path;
        const contentLength = parseInt(res.get('content-length') || '0', 10);

        this.recordMetric(req.method, routePath, durationMs, res.statusCode, contentLength, req);
      });

      next();
    };
  }

  private pruneStaleSamples(): void {
    const cutoff = Date.now() - this.windowSizeMs;
    for (const [key, samples] of this.samples.entries()) {
      const validSamples = samples.filter((s) => s.timestamp >= cutoff);
      if (validSamples.length === 0) {
        this.samples.delete(key);
      } else {
        this.samples.set(key, validSamples);
      }
    }
  }

  private calculatePercentiles(sortedValues: number[]): LatencyPercentiles {
    if (sortedValues.length === 0) {
      return { p50: 0, p90: 0, p95: 0, p99: 0, min: 0, max: 0, mean: 0 };
    }

    const getPercentile = (p: number): number => {
      const index = Math.ceil((p / 100) * sortedValues.length) - 1;
      return sortedValues[Math.max(0, Math.min(index, sortedValues.length - 1))];
    };

    const sum = sortedValues.reduce((acc, v) => acc + v, 0);

    return {
      p50: Number(getPercentile(50).toFixed(2)),
      p90: Number(getPercentile(90).toFixed(2)),
      p95: Number(getPercentile(95).toFixed(2)),
      p99: Number(getPercentile(99).toFixed(2)),
      min: Number(sortedValues[0].toFixed(2)),
      max: Number(sortedValues[sortedValues.length - 1].toFixed(2)),
      mean: Number((sum / sortedValues.length).toFixed(2)),
    };
  }

  public getRouteSummary(method: string, routePath: string): RoutePerformanceSummary | null {
    const key = this.getRouteKey(method, routePath);
    const samples = this.samples.get(key);

    if (!samples || samples.length === 0) return null;

    const cutoff = Date.now() - this.windowSizeMs;
    const activeSamples = samples.filter((s) => s.timestamp >= cutoff);

    if (activeSamples.length === 0) return null;

    const durations = activeSamples.map((s) => s.durationMs).sort((a, b) => a - b);
    const totalErrors = activeSamples.filter((s) => s.error).length;
    const totalContentLength = activeSamples.reduce((acc, s) => acc + s.contentLength, 0);
    const timeSpanSeconds = Math.max(1, (Date.now() - activeSamples[0].timestamp) / 1000);

    return {
      route: routePath,
      method: method.toUpperCase(),
      totalRequests: activeSamples.length,
      totalErrors,
      errorRatePercentage: Number(((totalErrors / activeSamples.length) * 100).toFixed(2)),
      throughputRps: Number((activeSamples.length / timeSpanSeconds).toFixed(2)),
      avgResponseSizeBytes: Math.round(totalContentLength / activeSamples.length),
      latency: this.calculatePercentiles(durations),
      lastUpdated: Date.now(),
    };
  }

  public getAllMetrics(): RoutePerformanceSummary[] {
    const summaries: RoutePerformanceSummary[] = [];
    for (const key of this.samples.keys()) {
      const firstColonIndex = key.indexOf(':');
      const method = key.substring(0, firstColonIndex);
      const routePath = key.substring(firstColonIndex + 1);
      const summary = this.getRouteSummary(method, routePath);
      if (summary) summaries.push(summary);
    }
    return summaries;
  }

  public getMetrics(): RoutePerformanceSummary[] {
    return this.getAllMetrics();
  }

  public reset(): void {
    this.samples.clear();
    logger.info('Performance metrics reset', {});
  }
}

export const performanceMonitor = PerformanceMonitor.getInstance();
export default performanceMonitor;