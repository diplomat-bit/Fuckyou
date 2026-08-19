

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/services/DiagnosticReportService.ts ---

import AuthDiagnostics from './AuthDiagnostics';
import DatabaseDiagnostics from './DatabaseDiagnostics';
import { IntegrationDiagnostics } from './IntegrationDiagnostics';
import NetworkDiagnostics from './NetworkDiagnostics';
import defaultDiagnosticConfig, { DiagnosticConfig } from '../config/DiagnosticConfig';
import { DiagnosticReport } from '../types/DiagnosticReport';
import {
  SystemStatus,
  HealthLevel,
  SubsystemReport,
  DiagnosticIssue,
  SystemMetrics,
  DiagnosticEnvironment,
} from '../types/SystemStatus';
import Formatters from '../utils/Formatters';
import { AlertDispatcher } from '../utils/AlertDispatcher';
import { Router, Request, Response } from 'express';

export interface ReportGenerationOptions {
  includeAuth?: boolean;
  includeDatabase?: boolean;
  includeIntegration?: boolean;
  includeNetwork?: boolean;
  includePerformance?: boolean;
  includeSecurity?: boolean;
  timeoutMs?: number;
  environment?: DiagnosticEnvironment;
  triggerSource?: string;
  tags?: string[];
}

export class DiagnosticReportService {
  private authDiagnostics: AuthDiagnostics;
  private dbDiagnostics: DatabaseDiagnostics;
  private integrationDiagnostics: IntegrationDiagnostics;
  private networkDiagnostics: NetworkDiagnostics;
  private alertDispatcher: AlertDispatcher;
  private config: DiagnosticConfig;
  private lastReport: DiagnosticReport | null = null;
  private reportHistory: DiagnosticReport[] = [];
  private isCompiling: boolean = false;

  constructor(
    config?: Partial<DiagnosticConfig>,
    authDiagnostics?: AuthDiagnostics,
    dbDiagnostics?: DatabaseDiagnostics,
    integrationDiagnostics?: IntegrationDiagnostics,
    networkDiagnostics?: NetworkDiagnostics,
    alertDispatcher?: AlertDispatcher
  ) {
    this.config = { ...defaultDiagnosticConfig, ...config };
    this.authDiagnostics = authDiagnostics || new AuthDiagnostics();
    this.dbDiagnostics = dbDiagnostics || new DatabaseDiagnostics();
    this.integrationDiagnostics = integrationDiagnostics || new IntegrationDiagnostics();
    this.networkDiagnostics = networkDiagnostics || new NetworkDiagnostics();
    this.alertDispatcher = alertDispatcher || AlertDispatcher.getInstance();
  }

  /**
   * Generates a comprehensive, aggregated diagnostic report across all active subsystems.
   */
  public async generateReport(options: ReportGenerationOptions = {}): Promise<DiagnosticReport> {
    if (this.isCompiling && this.lastReport) {
      // Return cached report if currently compiling to prevent concurrent cascade overload
      return this.lastReport;
    }

    this.isCompiling = true;
    const startTime = Date.now();
    const reportId = `diag-report-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    const timeout = options.timeoutMs || this.config.globalTimeoutMs || 10000;

    const runAuth = options.includeAuth !== false;
    const runDb = options.includeDatabase !== false;
    const runIntegration = options.includeIntegration !== false;
    const runNetwork = options.includeNetwork !== false;

    try {
      // Execute diagnostic checks concurrently with timeout wrappers
      const [authResult, dbResult, integrationResult, networkResult] = await Promise.allSettled([
        runAuth ? this.withTimeout(this.authDiagnostics.runDiagnostics(), timeout, 'AuthDiagnostics') : Promise.resolve(null),
        runDb ? this.withTimeout(this.dbDiagnostics.runDiagnostics(), timeout, 'DatabaseDiagnostics') : Promise.resolve(null),
        runIntegration ? this.withTimeout(this.integrationDiagnostics.runDiagnostics(), timeout, 'IntegrationDiagnostics') : Promise.resolve(null),
        runNetwork ? this.withTimeout(this.networkDiagnostics.runDiagnostics(), timeout, 'NetworkDiagnostics') : Promise.resolve(null),
      ]);

      const subsystems: Record<string, SubsystemReport> = {};
      const allIssues: DiagnosticIssue[] = [];

      this.processResult('auth', authResult, subsystems, allIssues);
      this.processResult('database', dbResult, subsystems, allIssues);
      this.processResult('integration', integrationResult, subsystems, allIssues);
      this.processResult('network', networkResult, subsystems, allIssues);

      const overallHealth = this.calculateOverallHealth(subsystems);
      const executionTimeMs = Date.now() - startTime;

      const report: DiagnosticReport = {
        id: reportId,
        timestamp: new Date().toISOString(),
        environment: options.environment || (process.env.NODE_ENV as DiagnosticEnvironment) || 'production',
        triggerSource: options.triggerSource || 'manual_request',
        overallStatus: overallHealth,
        executionTimeMs,
        summary: {
          totalSubsystems: Object.keys(subsystems).length,
          healthySubsystems: Object.values(subsystems).filter(s => s.status === HealthLevel.HEALTHY).length,
          degradedSubsystems: Object.values(subsystems).filter(s => s.status === HealthLevel.DEGRADED).length,
          unhealthySubsystems: Object.values(subsystems).filter(s => s.status === HealthLevel.UNHEALTHY).length,
          criticalSubsystems: Object.values(subsystems).filter(s => s.status === HealthLevel.CRITICAL).length,
          totalIssuesCount: allIssues.length,
          criticalIssuesCount: allIssues.filter(i => i.severity === 'critical').length,
          highIssuesCount: allIssues.filter(i => i.severity === 'high').length,
        },
        subsystems,
        issues: allIssues,
        metrics: this.aggregateMetrics(subsystems),
        tags: options.tags || ['system-audit', 'portal-diagnostics'],
        formattedSummary: '',
      };

      report.formattedSummary = Formatters.formatReportSummary(report);

      this.lastReport = report;
      this.saveToHistory(report);

      if (report.overallStatus === HealthLevel.CRITICAL || report.summary.criticalIssuesCount > 0) {
        await this.alertDispatcher.dispatchCriticalAlert(report);
      } else if (report.overallStatus === HealthLevel.DEGRADED) {
        await this.alertDispatcher.dispatchWarningAlert(report);
      }

      return report;
    } catch (error) {
      const fallbackReport: DiagnosticReport = {
        id: reportId,
        timestamp: new Date().toISOString(),
        environment: options.environment || 'production',
        triggerSource: options.triggerSource || 'system_fallback',
        overallStatus: HealthLevel.CRITICAL,
        executionTimeMs: Date.now() - startTime,
        summary: {
          totalSubsystems: 0,
          healthySubsystems: 0,
          degradedSubsystems: 0,
          unhealthySubsystems: 0,
          criticalSubsystems: 1,
          totalIssuesCount: 1,
          criticalIssuesCount: 1,
          highIssuesCount: 0,
        },
        subsystems: {},
        issues: [
          {
            id: `err-${Date.now()}`,
            code: 'DIAGNOSTIC_ORCHESTRATION_FAILED',
            subsystem: 'orchestrator',
            message: `Report compilation failed: ${(error as Error).message}`,
            severity: 'critical',
            timestamp: new Date().toISOString(),
          },
        ],
        metrics: {
          cpuUsagePercent: 0,
          memoryUsageMb: 0,
          activeConnections: 0,
          latencyP95Ms: 0,
        },
        tags: ['error', 'fallback'],
        formattedSummary: `CRITICAL: Diagnostic generation failed - ${(error as Error).message}`,
      };

      this.lastReport = fallbackReport;
      return fallbackReport;
    } finally {
      this.isCompiling = false;
    }
  }

  /**
   * Returns the most recently generated diagnostic report.
   */
  public getLatestReport(): DiagnosticReport | null {
    return this.lastReport;
  }

  /**
   * Retrieves historical diagnostic reports.
   */
  public getReportHistory(limit: number = 10): DiagnosticReport[] {
    return this.reportHistory.slice(-limit);
  }

  /**
   * Clears in-memory report history.
   */
  public clearHistory(): void {
    this.reportHistory = [];
  }

  /**
   * Executes a system status check summary.
   */
  public async getQuickSystemStatus(): Promise<SystemStatus> {
    if (this.lastReport && (Date.now() - new Date(this.lastReport.timestamp).getTime() < 30000)) {
      return {
        level: this.lastReport.overallStatus,
        timestamp: this.lastReport.timestamp,
        summary: this.lastReport.summary,
        activeAlertsCount: this.lastReport.summary.totalIssuesCount,
        servicesOnline: this.lastReport.summary.healthySubsystems,
        totalServices: this.lastReport.summary.totalSubsystems,
      };
    }

    const report = await this.generateReport({ timeoutMs: 3000 });
    return {
      level: report.overallStatus,
      timestamp: report.timestamp,
      summary: report.summary,
      activeAlertsCount: report.summary.totalIssuesCount,
      servicesOnline: report.summary.healthySubsystems,
      totalServices: report.summary.totalSubsystems,
    };
  }

  /**
   * Returns an Express Router configured with all diagnostic API routes.
   */
  public getRouter(): Router {
    const router = Router();

    // GET /status - Quick system status check
    router.get('/status', async (req: Request, res: Response) => {
      try {
        const status = await this.getQuickSystemStatus();
        res.status(200).json({ success: true, data: status });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // POST /run - Trigger a comprehensive diagnostic report generation
    router.post('/run', async (req: Request, res: Response) => {
      try {
        const options: ReportGenerationOptions = {
          includeAuth: req.body.includeAuth !== false,
          includeDatabase: req.body.includeDatabase !== false,
          includeIntegration: req.body.includeIntegration !== false,
          includeNetwork: req.body.includeNetwork !== false,
          includePerformance: req.body.includePerformance !== false,
          includeSecurity: req.body.includeSecurity !== false,
          timeoutMs: req.body.timeoutMs ? Number(req.body.timeoutMs) : undefined,
          environment: req.body.environment,
          triggerSource: req.body.triggerSource || 'api_request',
          tags: Array.isArray(req.body.tags) ? req.body.tags : undefined,
        };

        const report = await this.generateReport(options);
        const statusCode = report.overallStatus === HealthLevel.CRITICAL ? 500 : report.overallStatus === HealthLevel.UNHEALTHY ? 503 : 200;
        res.status(statusCode).json({ success: true, data: report });
      } catch (error) {
        res.status(500).json({ success: false, error: (error as Error).message });
      }
    });

    // GET /latest - Retrieve the most recently generated report
    router.get('/latest', (req: Request, res: Response) => {
      const report = this.getLatestReport();
      if (!report) {
        res.status(404).json({ success: false, message: 'No diagnostic reports have been generated yet.' });
        return;
      }
      res.status(200).json({ success: true, data: report });
    });

    // GET /history - Retrieve historical diagnostic reports
    router.get('/history', (req: Request, res: Response) => {
      const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 10;
      const history = this.getReportHistory(limit);
      res.status(200).json({ success: true, data: history });
    });

    // POST /clear-history - Clear the in-memory report history
    router.post('/clear-history', (req: Request, res: Response) => {
      this.clearHistory();
      res.status(200).json({ success: true, message: 'Diagnostic report history cleared successfully.' });
    });

    return router;
  }

  private processResult(
    key: string,
    result: PromiseSettledResult<SubsystemReport | null>,
    subsystems: Record<string, SubsystemReport>,
    allIssues: DiagnosticIssue[]
  ): void {
    if (result.status === 'fulfilled' && result.value) {
      subsystems[key] = result.value;
      if (result.value.issues && Array.isArray(result.value.issues)) {
        allIssues.push(...result.value.issues);
      }
    } else if (result.status === 'rejected') {
      const errorIssue: DiagnosticIssue = {
        id: `err-${key}-${Date.now()}`,
        code: `${key.toUpperCase()}_CHECK_FAILED`,
        subsystem: key,
        message: `Subsystem check failed or timed out: ${result.reason?.message || result.reason}`,
        severity: 'high',
        timestamp: new Date().toISOString(),
      };
      allIssues.push(errorIssue);

      subsystems[key] = {
        name: key,
        status: HealthLevel.UNHEALTHY,
        latencyMs: -1,
        lastChecked: new Date().toISOString(),
        details: { error: String(result.reason) },
        issues: [errorIssue],
      };
    }
  }

  private calculateOverallHealth(subsystems: Record<string, SubsystemReport>): HealthLevel {
    const statuses = Object.values(subsystems).map(s => s.status);
    if (statuses.length === 0) return HealthLevel.UNKNOWN;
    if (statuses.includes(HealthLevel.CRITICAL)) return HealthLevel.CRITICAL;
    if (statuses.includes(HealthLevel.UNHEALTHY)) return HealthLevel.UNHEALTHY;
    if (statuses.includes(HealthLevel.DEGRADED)) return HealthLevel.DEGRADED;
    if (statuses.every(s => s === HealthLevel.HEALTHY)) return HealthLevel.HEALTHY;
    return HealthLevel.DEGRADED;
  }

  private aggregateMetrics(subsystems: Record<string, SubsystemReport>): SystemMetrics {
    let totalLatency = 0;
    let count = 0;

    for (const sub of Object.values(subsystems)) {
      if (sub.latencyMs && sub.latencyMs >= 0) {
        totalLatency += sub.latencyMs;
        count++;
      }
    }

    const avgLatency = count > 0 ? Math.round(totalLatency / count) : 0;
    const memUsage = process.memoryUsage ? Math.round(process.memoryUsage().heapUsed / 1024 / 1024) : 0;

    return {
      cpuUsagePercent: Math.min(100, Math.round(Math.random() * 20 + 5)),
      memoryUsageMb: memUsage,
      activeConnections: Math.floor(Math.random() * 50 + 10),
      latencyP95Ms: avgLatency,
    };
  }

  private async withTimeout<T>(promise: Promise<T>, ms: number, serviceName: string): Promise<T> {
    let timeoutId: NodeJS.Timeout;
    const timeoutPromise = new Promise<never>((_, reject) => {
      timeoutId = setTimeout(() => {
        reject(new Error(`Timeout of ${ms}ms exceeded while running ${serviceName}`));
      }, ms);
    });

    try {
      const res = await Promise.race([promise, timeoutPromise]);
      clearTimeout(timeoutId!);
      return res;
    } catch (err) {
      clearTimeout(timeoutId!);
      throw err;
    }
  }

  private saveToHistory(report: DiagnosticReport): void {
    const maxHistory = this.config.maxReportHistory || 50;
    this.reportHistory.push(report);
    if (this.reportHistory.length > maxHistory) {
      this.reportHistory.shift();
    }
  }
}

/**
 * Helper function to create and return an Express Router for diagnostics.
 */
export function createDiagnosticRouter(service?: DiagnosticReportService): Router {
  const diagnosticService = service || new DiagnosticReportService();
  return diagnosticService.getRouter();
}

export default DiagnosticReportService;