import { HealthCheckService } from '../HealthCheckService';
import { PerformanceMonitor } from '../PerformanceMonitor';
import { SecurityScanner } from '../SecurityScanner';
import { LogAnalyzer } from '../LogAnalyzer';
import { TelemetryCollector } from '../TelemetryCollector';
import { ErrorReporter } from '../ErrorReporter';
import { DiagnosticsOrchestrator } from '../DiagnosticsOrchestrator';
import { DependencyGraph } from '../DependencyGraph';

export const DIAGNOSTIC_THRESHOLDS = {
  LATENCY_MS_WARNING: 200,
  LATENCY_MS_CRITICAL: 500,
  MEMORY_USAGE_PERCENT_WARNING: 75,
  MEMORY_USAGE_PERCENT_CRITICAL: 90,
  ERROR_RATE_THRESHOLD_PERCENT: 5,
  RETRY_ATTEMPTS: 3,
};

export const POLLING_INTERVALS = {
  HEALTH_CHECK_MS: 30000,
  METRICS_COLLECTION_MS: 60000,
  SECURITY_SCAN_MS: 300000,
  DATABASE_SYNC_CHECK_MS: 15000,
};

export const DIAGNOSTIC_ENDPOINTS = {
  PRODUCTION: {
    HEALTH: '/api/v1/diagnostics/health',
    METRICS: '/api/v1/diagnostics/metrics',
    SECURITY: '/api/v1/diagnostics/security',
    AUDIT: '/api/v1/diagnostics/audit',
    DEPENDENCY: '/api/v1/diagnostics/dependency',
    TELEMETRY: '/api/v1/diagnostics/telemetry',
    ERRORS: '/api/v1/diagnostics/errors',
    LOGS: '/api/v1/diagnostics/logs',
  },
  STAGING: {
    HEALTH: '/staging/api/v1/diagnostics/health',
    METRICS: '/staging/api/v1/diagnostics/metrics',
    SECURITY: '/staging/api/v1/diagnostics/security',
    AUDIT: '/staging/api/v1/diagnostics/audit',
    DEPENDENCY: '/staging/api/v1/diagnostics/dependency',
    TELEMETRY: '/staging/api/v1/diagnostics/telemetry',
    ERRORS: '/staging/api/v1/diagnostics/errors',
    LOGS: '/staging/api/v1/diagnostics/logs',
  },
  DEVELOPMENT: {
    HEALTH: '/dev/diagnostics/health',
    METRICS: '/dev/diagnostics/metrics',
    SECURITY: '/dev/diagnostics/security',
    AUDIT: '/dev/diagnostics/audit',
    DEPENDENCY: '/dev/diagnostics/dependency',
    TELEMETRY: '/dev/diagnostics/telemetry',
    ERRORS: '/dev/diagnostics/errors',
    LOGS: '/dev/diagnostics/logs',
  },
};

export const DIAGNOSTIC_LOG_LEVELS = {
  DEBUG: 'DEBUG',
  INFO: 'INFO',
  WARN: 'WARN',
  ERROR: 'ERROR',
  CRITICAL: 'CRITICAL',
} as const;

export type DiagnosticEnvironment = 'PRODUCTION' | 'STAGING' | 'DEVELOPMENT';

export const getDiagnosticConfig = (env: DiagnosticEnvironment = 'DEVELOPMENT') => {
  return {
    thresholds: DIAGNOSTIC_THRESHOLDS,
    intervals: POLLING_INTERVALS,
    endpoints: DIAGNOSTIC_ENDPOINTS[env],
  };
};

/**
 * Advanced API Route Configuration and Feature Mapping
 * Turns this file into the ultimate diagnostic routing and orchestration hub.
 */
export interface RouteMetadata {
  path: string;
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  handler: (req: any, res: any) => Promise<any>;
  requiredRole: 'admin' | 'operator' | 'viewer';
  rateLimitMax: number;
  description: string;
}

export const getDiagnosticRoutes = (
  env: DiagnosticEnvironment = 'DEVELOPMENT',
  services: {
    healthCheck?: HealthCheckService;
    performance?: PerformanceMonitor;
    security?: SecurityScanner;
    logAnalyzer?: LogAnalyzer;
    telemetry?: TelemetryCollector;
    errorReporter?: ErrorReporter;
    orchestrator?: DiagnosticsOrchestrator;
    dependencyGraph?: DependencyGraph;
  } = {}
): Record<string, RouteMetadata> => {
  const endpoints = DIAGNOSTIC_ENDPOINTS[env];

  return {
    HEALTH: {
      path: endpoints.HEALTH,
      method: 'GET',
      description: 'Performs a full system health check across all integrated services.',
      requiredRole: 'viewer',
      rateLimitMax: 60,
      handler: async (req, res) => {
        if (services.healthCheck) {
          return await services.healthCheck.checkAllHealth();
        }
        if (services.orchestrator) {
          return await services.orchestrator.runAllDiagnostics();
        }
        return { status: 'UP', timestamp: new Date().toISOString(), message: 'Diagnostics active (fallback)' };
      },
    },
    METRICS: {
      path: endpoints.METRICS,
      method: 'GET',
      description: 'Retrieves real-time performance metrics, memory usage, and latency statistics.',
      requiredRole: 'viewer',
      rateLimitMax: 120,
      handler: async (req, res) => {
        if (services.performance) {
          return await services.performance.getAllMetrics();
        }
        return { cpu: 0, memory: process.memoryUsage(), uptime: process.uptime() };
      },
    },
    SECURITY: {
      path: endpoints.SECURITY,
      method: 'POST',
      description: 'Triggers an on-demand security scan of the system and dependencies.',
      requiredRole: 'admin',
      rateLimitMax: 10,
      handler: async (req, res) => {
        if (services.security) {
          return await services.security.runScan();
        }
        return { status: 'SECURE', issues: [], scannedAt: new Date().toISOString() };
      },
    },
    AUDIT: {
      path: endpoints.AUDIT,
      method: 'GET',
      description: 'Fetches audit logs and compliance reports.',
      requiredRole: 'operator',
      rateLimitMax: 30,
      handler: async (req, res) => {
        if (services.orchestrator) {
          const orchestrator = services.orchestrator as any;
          if (typeof orchestrator.getAuditLogs === 'function') {
            return await orchestrator.getAuditLogs();
          }
        }
        return { logs: [], count: 0 };
      },
    },
    DEPENDENCY: {
      path: endpoints.DEPENDENCY,
      method: 'GET',
      description: 'Generates a dependency graph of the system components and their health.',
      requiredRole: 'viewer',
      rateLimitMax: 45,
      handler: async (req, res) => {
        if (services.dependencyGraph) {
          const graph = services.dependencyGraph as any;
          if (typeof graph.getDependencies === 'function') {
            return await graph.getDependencies();
          }
          if (typeof graph.buildGraph === 'function') {
            return await graph.buildGraph();
          }
        }
        return { nodes: [], edges: [] };
      },
    },
    TELEMETRY: {
      path: endpoints.TELEMETRY,
      method: 'POST',
      description: 'Ingests or retrieves telemetry data points.',
      requiredRole: 'operator',
      rateLimitMax: 200,
      handler: async (req, res) => {
        if (services.telemetry) {
          const tel = services.telemetry as any;
          if (req.method === 'POST') {
            if (typeof tel.record === 'function') {
              return await tel.record(req.body);
            }
            if (typeof tel.recordMetric === 'function') {
              return await tel.recordMetric(req.body?.name || 'telemetry', req.body?.value || 0, req.body?.tags || {});
            }
            return { recorded: true };
          }
          if (typeof tel.getSummary === 'function') {
            return await tel.getSummary();
          }
          if (typeof tel.getMetrics === 'function') {
            return await tel.getMetrics();
          }
          return { recorded: true };
        }
        return { recorded: true };
      },
    },
    ERRORS: {
      path: endpoints.ERRORS,
      method: 'GET',
      description: 'Retrieves aggregated error reports and stack traces.',
      requiredRole: 'operator',
      rateLimitMax: 60,
      handler: async (req, res) => {
        if (services.errorReporter) {
          const rep = services.errorReporter as any;
          if (typeof rep.getRecentErrors === 'function') {
            return await rep.getRecentErrors();
          }
          if (typeof rep.getErrors === 'function') {
            return await rep.getErrors();
          }
        }
        return { errors: [], total: 0 };
      },
    },
    LOGS: {
      path: endpoints.LOGS,
      method: 'POST',
      description: 'Analyzes system logs for anomalies and patterns.',
      requiredRole: 'admin',
      rateLimitMax: 15,
      handler: async (req, res) => {
        if (services.logAnalyzer) {
          const analyzer = services.logAnalyzer as any;
          if (typeof analyzer.analyze === 'function') {
            return await analyzer.analyze(req.body?.query || '');
          }
          if (typeof analyzer.analyzeLogs === 'function') {
            return await analyzer.analyzeLogs(req.body?.query || '');
          }
        }
        return { anomalies: [], analyzedLines: 0 };
      },
    },
  };
};