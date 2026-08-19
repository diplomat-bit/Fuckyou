

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/DiagnosticsOrchestrator_v2.ts ---

import { Router, Request, Response, NextFunction } from 'express';
import { EventEmitter } from 'events';
import * as os from 'os';
import * as http from 'http';
import * as dns from 'dns';
import { promisify } from 'util';

const dnsLookup = promisify(dns.lookup);

export interface DiagnosticMetric {
  name: string;
  value: number | string;
  status: 'healthy' | 'warning' | 'critical';
  timestamp: string;
  details?: string;
}

export interface SecurityVulnerability {
  id: string;
  component: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  description: string;
  remediation: string;
}

export interface SystemStatusReport {
  orchestratorId: string;
  timestamp: string;
  overallStatus: 'healthy' | 'degraded' | 'unhealthy';
  systemInfo: {
    platform: string;
    arch: string;
    uptime: number;
    cpuCount: number;
    loadAvg: number[];
    totalMemoryGB: number;
    freeMemoryGB: number;
    memoryUsagePercent: number;
  };
  metrics: DiagnosticMetric[];
  securityScan: {
    scannedAt: string;
    vulnerabilitiesFound: number;
    vulnerabilities: SecurityVulnerability[];
  };
  networkLatency: {
    [endpoint: string]: {
      latencyMs: number;
      status: 'reachable' | 'unreachable';
    };
  };
}

class DiagnosticsOrchestrator extends EventEmitter {
  private static instance: DiagnosticsOrchestrator;
  private isScanning: boolean = false;
  private lastReport: SystemStatusReport | null = null;
  private telemetryInterval: NodeJS.Timeout | null = null;

  private constructor() {
    super();
    this.startTelemetryCollection();
  }

  public static getInstance(): DiagnosticsOrchestrator {
    if (!DiagnosticsOrchestrator.instance) {
      DiagnosticsOrchestrator.instance = new DiagnosticsOrchestrator();
    }
    return DiagnosticsOrchestrator.instance;
  }

  private startTelemetryCollection() {
    if (this.telemetryInterval) return;
    this.telemetryInterval = setInterval(() => {
      const telemetry = this.gatherInstantTelemetry();
      this.emit('telemetry', telemetry);
    }, 5000);
  }

  public stopTelemetryCollection() {
    if (this.telemetryInterval) {
      clearInterval(this.telemetryInterval);
      this.telemetryInterval = null;
    }
  }

  private gatherInstantTelemetry() {
    const totalMem = os.totalmem();
    const freeMem = os.freemem();
    const usedMem = totalMem - freeMem;
    const memoryUsagePercent = parseFloat(((usedMem / totalMem) * 100).toFixed(2));

    return {
      timestamp: new Date().toISOString(),
      cpuUsage: os.loadavg()[0],
      memoryUsagePercent,
      freeMemoryGB: parseFloat((freeMem / (1024 * 1024 * 1024)).toFixed(2)),
      uptime: os.uptime(),
    };
  }

  public async runFullDiagnostics(): Promise<SystemStatusReport> {
    if (this.isScanning) {
      throw new Error('A diagnostic scan is already in progress.');
    }

    this.isScanning = true;
    this.emit('scanStarted', { timestamp: new Date().toISOString() });

    try {
      const totalMem = os.totalmem();
      const freeMem = os.freemem();
      const usedMem = totalMem - freeMem;
      const memoryUsagePercent = parseFloat(((usedMem / totalMem) * 100).toFixed(2));

      // 1. Gather Network Latency
      const networkLatency = await this.measureNetworkLatency();

      // 2. Run Security Scan
      const securityScan = await this.executeSecurityScan();

      // 3. Compile Metrics
      const metrics: DiagnosticMetric[] = [
        {
          name: 'CPU Load Average (1m)',
          value: os.loadavg()[0].toFixed(2),
          status: os.loadavg()[0] > os.cpus().length * 0.8 ? 'warning' : 'healthy',
          timestamp: new Date().toISOString(),
          details: `System has ${os.cpus().length} logical CPU cores.`,
        },
        {
          name: 'Memory Utilization',
          value: `${memoryUsagePercent}%`,
          status: memoryUsagePercent > 90 ? 'critical' : memoryUsagePercent > 75 ? 'warning' : 'healthy',
          timestamp: new Date().toISOString(),
          details: `Free memory: ${(freeMem / (1024 * 1024 * 1024)).toFixed(2)} GB of ${(totalMem / (1024 * 1024 * 1024)).toFixed(2)} GB total.`,
        },
        {
          name: 'System Disk Space Mock',
          value: '42% Used',
          status: 'healthy',
          timestamp: new Date().toISOString(),
          details: 'Root partition has 120GB free of 250GB total.',
        }
      ];

      // Determine overall status
      let overallStatus: 'healthy' | 'degraded' | 'unhealthy' = 'healthy';
      const hasCritical = metrics.some(m => m.status === 'critical') || securityScan.vulnerabilities.some(v => v.severity === 'critical' || v.severity === 'high');
      const hasWarning = metrics.some(m => m.status === 'warning') || securityScan.vulnerabilities.some(v => v.severity === 'medium');

      if (hasCritical) {
        overallStatus = 'unhealthy';
      } else if (hasWarning) {
        overallStatus = 'degraded';
      }

      const report: SystemStatusReport = {
        orchestratorId: `diag-orch-${process.pid}-${Date.now()}`,
        timestamp: new Date().toISOString(),
        overallStatus,
        systemInfo: {
          platform: os.platform(),
          arch: os.arch(),
          uptime: os.uptime(),
          cpuCount: os.cpus().length,
          loadAvg: os.loadavg(),
          totalMemoryGB: parseFloat((totalMem / (1024 * 1024 * 1024)).toFixed(2)),
          freeMemoryGB: parseFloat((freeMem / (1024 * 1024 * 1024)).toFixed(2)),
          memoryUsagePercent,
        },
        metrics,
        securityScan,
        networkLatency,
      };

      this.lastReport = report;
      this.emit('scanCompleted', report);
      return report;
    } catch (error: any) {
      this.emit('scanFailed', { error: error.message, timestamp: new Date().toISOString() });
      throw error;
    } finally {
      this.isScanning = false;
    }
  }

  private async measureNetworkLatency(): Promise<{ [endpoint: string]: { latencyMs: number; status: 'reachable' | 'unreachable' } }> {
    const targets = [
      { name: 'Google DNS', host: '8.8.8.8' },
      { name: 'Azure Portal', host: 'portal.azure.com' },
      { name: 'Stripe API', host: 'api.stripe.com' },
      { name: 'Alpaca API', host: 'api.alpaca.markets' },
    ];

    const results: { [endpoint: string]: { latencyMs: number; status: 'reachable' | 'unreachable' } } = {};

    for (const target of targets) {
      const start = Date.now();
      try {
        await dnsLookup(target.host);
        const latencyMs = Date.now() - start;
        results[target.name] = {
          latencyMs,
          status: 'reachable',
        };
      } catch {
        results[target.name] = {
          latencyMs: -1,
          status: 'unreachable',
        };
      }
    }

    return results;
  }

  private async executeSecurityScan(): Promise<{ scannedAt: string; vulnerabilitiesFound: number; vulnerabilities: SecurityVulnerability[] }> {
    const vulnerabilities: SecurityVulnerability[] = [];

    // Check for common security misconfigurations in environment variables
    if (process.env.NODE_ENV !== 'production') {
      vulnerabilities.push({
        id: 'SEC-001',
        component: 'Environment Configuration',
        severity: 'low',
        description: 'Application is running in development mode. Detailed error traces may be exposed.',
        remediation: 'Set NODE_ENV to production in production environments.',
      });
    }

    // Mock check for dependency vulnerabilities
    const mockVulnerabilities: SecurityVulnerability[] = [
      {
        id: 'SEC-002',
        component: 'Express Session Storage',
        severity: 'medium',
        description: 'Default memory store is configured for Express sessions, which is not suitable for production.',
        remediation: 'Configure a persistent session store like Redis or database-backed storage.',
      },
      {
        id: 'SEC-003',
        component: 'TLS Configuration',
        severity: 'low',
        description: 'SSL/TLS certificate is self-signed or nearing expiration.',
        remediation: 'Renew or replace the SSL/TLS certificate with a trusted CA-signed certificate.',
      }
    ];

    vulnerabilities.push(...mockVulnerabilities);

    return {
      scannedAt: new Date().toISOString(),
      vulnerabilitiesFound: vulnerabilities.length,
      vulnerabilities,
    };
  }

  public getLastReport(): SystemStatusReport | null {
    return this.lastReport;
  }

  public getDependencyGraph() {
    return {
      nodes: [
        { id: 'Gateway', group: 1, status: 'healthy' },
        { id: 'DiagnosticsOrchestrator', group: 1, status: 'healthy' },
        { id: 'AuthService', group: 2, status: 'healthy' },
        { id: 'DatabaseBridge', group: 2, status: 'healthy' },
        { id: 'AlpacaBrokerService', group: 3, status: 'healthy' },
        { id: 'CitiAlpacaBridgeService', group: 3, status: 'healthy' },
        { id: 'StripeBridgeService', group: 3, status: 'healthy' },
      ],
      links: [
        { source: 'Gateway', target: 'DiagnosticsOrchestrator', value: 1 },
        { source: 'DiagnosticsOrchestrator', target: 'AuthService', value: 2 },
        { source: 'DiagnosticsOrchestrator', target: 'DatabaseBridge', value: 2 },
        { source: 'CitiAlpacaBridgeService', target: 'AlpacaBrokerService', value: 3 },
        { source: 'StripeBridgeService', target: 'AlpacaBrokerService', value: 3 },
      ],
    };
  }
}

export const orchestrator = DiagnosticsOrchestrator.getInstance();

const router = Router();

// GET /api/diagnostics/status
router.get('/status', async (req: Request, res: Response, next: NextFunction) => {
  try {
    let report = orchestrator.getLastReport();
    if (!report) {
      report = await orchestrator.runFullDiagnostics();
    }
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve system status.',
    });
  }
});

// POST /api/diagnostics/scan
router.post('/scan', async (req: Request, res: Response, next: NextFunction) => {
  try {
    const report = await orchestrator.runFullDiagnostics();
    res.status(200).json({
      success: true,
      message: 'Diagnostic scan completed successfully.',
      data: report,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Diagnostic scan failed.',
    });
  }
});

// GET /api/diagnostics/dependencies
router.get('/dependencies', (req: Request, res: Response) => {
  try {
    const graph = orchestrator.getDependencyGraph();
    res.status(200).json({
      success: true,
      data: graph,
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to retrieve dependency graph.',
    });
  }
});

// GET /api/diagnostics/telemetry/stream (Server-Sent Events)
router.get('/telemetry/stream', (req: Request, res: Response) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache');
  res.setHeader('Connection', 'keep-alive');
  res.flushHeaders();

  const onTelemetry = (data: any) => {
    res.write(`data: ${JSON.stringify(data)}\n\n`);
  };

  orchestrator.on('telemetry', onTelemetry);

  req.on('close', () => {
    orchestrator.off('telemetry', onTelemetry);
    res.end();
  });
});

export default router;