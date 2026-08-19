

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/types/DiagnosticSystemTypes.ts ---

export type DiagnosticSeverity = 'info' | 'warning' | 'error' | 'critical';

export type DiagnosticCategory = 
  | 'security' 
  | 'performance' 
  | 'database' 
  | 'network' 
  | 'integration' 
  | 'compliance' 
  | 'system'
  | 'auth';

export type DiagnosticStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export type IntegrationTarget =
  | 'citi_connect'
  | 'azure_ad'
  | 'google_cloud'
  | 'alpaca_broker'
  | 'modern_treasury'
  | 'plaid'
  | 'stripe'
  | 'sovereign_ledger'
  | 'database_cluster'
  | 'network_gateway';

export interface LogEntry {
  id: string;
  timestamp: string;
  level: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
  category: DiagnosticCategory;
  message: string;
  service: string;
  traceId?: string;
  spanId?: string;
  metadata?: Record<string, any>;
}

export interface MetricDataPoint {
  timestamp: string;
  value: number;
  unit: string;
  labels?: Record<string, string>;
}

export interface PerformanceMetric {
  metricName: string;
  category: 'cpu' | 'memory' | 'latency' | 'throughput' | 'error_rate';
  currentValue: number;
  thresholdValue?: number;
  history: MetricDataPoint[];
  status: DiagnosticStatus;
}

export interface SyntheticTestResult {
  testId: string;
  name: string;
  target: IntegrationTarget | string;
  status: 'passed' | 'failed' | 'skipped';
  durationMs: number;
  errorMessage?: string;
  statusCode?: number;
  timestamp: string;
  payloadSize?: number;
}

export interface SecurityVulnerability {
  id: string;
  title: string;
  severity: DiagnosticSeverity;
  category: 'cve' | 'misconfiguration' | 'compliance_drift' | 'secret_leak';
  description: string;
  remediation: string;
  detectedAt: string;
  resourceId?: string;
}

export interface ComponentHealth {
  componentId: string;
  name: string;
  type: 'internal' | 'external_api' | 'database' | 'infrastructure';
  status: DiagnosticStatus;
  latencyMs?: number;
  lastChecked: string;
  errorMessage?: string;
  version?: string;
  metadata?: Record<string, any>;
}

export interface DependencyNode {
  id: string;
  label: string;
  type: 'service' | 'database' | 'external_api' | 'gateway';
  status: DiagnosticStatus;
}

export interface DependencyEdge {
  source: string;
  target: string;
  type: 'sync' | 'async' | 'grpc' | 'http';
  latencyMs?: number;
  status: 'active' | 'degraded' | 'failed';
}

export interface DependencyGraphData {
  nodes: DependencyNode[];
  edges: DependencyEdge[];
}

export interface ComplianceAuditResult {
  standard: 'FedRAMP' | 'SOC2' | 'ISO27001' | 'Sovereign_Compliance';
  passed: boolean;
  score: number;
  failedRules: Array<{
    ruleId: string;
    description: string;
    severity: DiagnosticSeverity;
  }>;
  lastAuditedAt: string;
}

export interface DiagnosticSystemReport {
  reportId: string;
  timestamp: string;
  overallStatus: DiagnosticStatus;
  environment: 'development' | 'staging' | 'production' | 'govcloud';
  components: Record<string, ComponentHealth>;
  metrics: PerformanceMetric[];
  recentLogs: LogEntry[];
  syntheticTests: SyntheticTestResult[];
  securityFindings: SecurityVulnerability[];
  dependencyGraph: DependencyGraphData;
  compliance: ComplianceAuditResult[];
  orchestrationMetadata?: {
    durationMs: number;
    scannedBy: string;
    activeAlertsCount: number;
  };
}

export interface DiagnosticConfig {
  enableSyntheticTests: boolean;
  syntheticIntervalMs: number;
  logRetentionDays: number;
  alertThresholds: {
    latencyMs: number;
    cpuUtilizationPercent: number;
    memoryUtilizationPercent: number;
    errorRatePercent: number;
  };
  monitoredIntegrations: IntegrationTarget[];
}

// ==========================================
// API Routes, Mock Generators & Controllers
// ==========================================

import { Request, Response, Router } from 'express';

// Mock Data Generators
export const generateMockLogEntry = (overrides?: Partial<LogEntry>): LogEntry => ({
  id: `log_${Math.random().toString(36).substr(2, 9)}`,
  timestamp: new Date().toISOString(),
  level: ['info', 'warn', 'error'][Math.floor(Math.random() * 3)] as any,
  category: ['security', 'performance', 'database', 'network', 'integration', 'compliance', 'system', 'auth'][Math.floor(Math.random() * 8)] as DiagnosticCategory,
  message: 'Diagnostic event triggered successfully.',
  service: 'PortalDiagnosticsService',
  traceId: `trace_${Math.random().toString(36).substr(2, 9)}`,
  spanId: `span_${Math.random().toString(36).substr(2, 9)}`,
  metadata: { env: 'production', nodeVersion: process.version },
  ...overrides,
});

export const generateMockPerformanceMetric = (metricName: string, category: PerformanceMetric['category']): PerformanceMetric => {
  const history: MetricDataPoint[] = Array.from({ length: 10 }, (_, i) => ({
    timestamp: new Date(Date.now() - (10 - i) * 60000).toISOString(),
    value: Math.floor(Math.random() * 100),
    unit: category === 'latency' ? 'ms' : category === 'memory' ? 'MB' : '%',
  }));
  return {
    metricName,
    category,
    currentValue: history[history.length - 1].value,
    thresholdValue: 80,
    history,
    status: history[history.length - 1].value > 80 ? 'degraded' : 'healthy',
  };
};

export const generateMockSyntheticTestResult = (target: IntegrationTarget): SyntheticTestResult => ({
  testId: `test_${Math.random().toString(36).substr(2, 9)}`,
  name: `Ping test to ${target}`,
  target,
  status: Math.random() > 0.1 ? 'passed' : 'failed',
  durationMs: Math.floor(Math.random() * 200) + 20,
  errorMessage: Math.random() > 0.9 ? 'Timeout connection refused' : undefined,
  statusCode: Math.random() > 0.1 ? 200 : 504,
  timestamp: new Date().toISOString(),
  payloadSize: Math.floor(Math.random() * 1024),
});

export const generateMockSecurityVulnerability = (): SecurityVulnerability => ({
  id: `vuln_${Math.random().toString(36).substr(2, 9)}`,
  title: 'Outdated TLS Cipher Suite Allowed',
  severity: 'warning',
  category: 'misconfiguration',
  description: 'The server allows connections using TLS 1.1, which is deprecated.',
  remediation: 'Disable TLS 1.0 and 1.1 in the server configuration and enforce TLS 1.2 or higher.',
  detectedAt: new Date().toISOString(),
  resourceId: 'network_gateway_01',
});

export const generateMockComponentHealth = (componentId: string, name: string, type: ComponentHealth['type']): ComponentHealth => ({
  componentId,
  name,
  type,
  status: Math.random() > 0.05 ? 'healthy' : 'degraded',
  latencyMs: Math.floor(Math.random() * 150) + 10,
  lastChecked: new Date().toISOString(),
  version: '1.4.2',
});

export const generateMockDependencyGraph = (): DependencyGraphData => {
  const nodes: DependencyNode[] = [
    { id: 'gateway', label: 'Network Gateway', type: 'gateway', status: 'healthy' },
    { id: 'auth', label: 'Azure AD Auth', type: 'external_api', status: 'healthy' },
    { id: 'citi', label: 'Citi Connect API', type: 'external_api', status: 'healthy' },
    { id: 'db', label: 'Database Cluster', type: 'database', status: 'healthy' },
    { id: 'service', label: 'Core Diagnostics Service', type: 'service', status: 'healthy' },
  ];
  const edges: DependencyEdge[] = [
    { source: 'gateway', target: 'service', type: 'http', latencyMs: 12, status: 'active' },
    { source: 'service', target: 'auth', type: 'http', latencyMs: 45, status: 'active' },
    { source: 'service', target: 'citi', type: 'http', latencyMs: 110, status: 'active' },
    { source: 'service', target: 'db', type: 'grpc', latencyMs: 2, status: 'active' },
  ];
  return { nodes, edges };
};

export const generateMockComplianceAudit = (): ComplianceAuditResult[] => [
  {
    standard: 'FedRAMP',
    passed: true,
    score: 98,
    failedRules: [],
    lastAuditedAt: new Date().toISOString(),
  },
  {
    standard: 'Sovereign_Compliance',
    passed: false,
    score: 85,
    failedRules: [
      {
        ruleId: 'SOV-042',
        description: 'Data residency verification failed for secondary backup node.',
        severity: 'error',
      }
    ],
    lastAuditedAt: new Date().toISOString(),
  }
];

export const generateMockDiagnosticSystemReport = (environment: DiagnosticSystemReport['environment'] = 'production'): DiagnosticSystemReport => {
  const components: Record<string, ComponentHealth> = {
    citi_connect: generateMockComponentHealth('citi_connect', 'Citi Connect Gateway', 'external_api'),
    azure_ad: generateMockComponentHealth('azure_ad', 'Azure Active Directory', 'external_api'),
    database_cluster: generateMockComponentHealth('database_cluster', 'Primary Database Cluster', 'database'),
    network_gateway: generateMockComponentHealth('network_gateway', 'Edge Network Gateway', 'infrastructure'),
  };

  const metrics: PerformanceMetric[] = [
    generateMockPerformanceMetric('CPU Utilization', 'cpu'),
    generateMockPerformanceMetric('Memory Usage', 'memory'),
    generateMockPerformanceMetric('API Latency', 'latency'),
  ];

  const recentLogs: LogEntry[] = Array.from({ length: 5 }, () => generateMockLogEntry());
  const syntheticTests: SyntheticTestResult[] = [
    generateMockSyntheticTestResult('citi_connect'),
    generateMockSyntheticTestResult('azure_ad'),
    generateMockSyntheticTestResult('modern_treasury'),
  ];

  const securityFindings: SecurityVulnerability[] = [generateMockSecurityVulnerability()];
  const dependencyGraph = generateMockDependencyGraph();
  const compliance = generateMockComplianceAudit();

  return {
    reportId: `rep_${Math.random().toString(36).substr(2, 9)}`,
    timestamp: new Date().toISOString(),
    overallStatus: 'healthy',
    environment,
    components,
    metrics,
    recentLogs,
    syntheticTests,
    securityFindings,
    dependencyGraph,
    compliance,
    orchestrationMetadata: {
      durationMs: 142,
      scannedBy: 'AutomatedDiagnosticsDaemon',
      activeAlertsCount: 1,
    }
  };
};

export const getDefaultDiagnosticConfig = (): DiagnosticConfig => ({
  enableSyntheticTests: true,
  syntheticIntervalMs: 30000,
  logRetentionDays: 30,
  alertThresholds: {
    latencyMs: 500,
    cpuUtilizationPercent: 85,
    memoryUtilizationPercent: 90,
    errorRatePercent: 5,
  },
  monitoredIntegrations: [
    'citi_connect',
    'azure_ad',
    'google_cloud',
    'alpaca_broker',
    'modern_treasury',
    'plaid',
    'stripe',
    'sovereign_ledger',
    'database_cluster',
    'network_gateway',
  ],
});

// Validation Utilities
export function validateLogEntry(data: any): data is LogEntry {
  return (
    data &&
    typeof data.id === 'string' &&
    typeof data.timestamp === 'string' &&
    ['debug', 'info', 'warn', 'error', 'fatal'].includes(data.level) &&
    typeof data.message === 'string' &&
    typeof data.service === 'string'
  );
}

export function validateDiagnosticConfig(data: any): data is DiagnosticConfig {
  return (
    data &&
    typeof data.enableSyntheticTests === 'boolean' &&
    typeof data.syntheticIntervalMs === 'number' &&
    typeof data.logRetentionDays === 'number' &&
    data.alertThresholds &&
    typeof data.alertThresholds.latencyMs === 'number' &&
    typeof data.alertThresholds.cpuUtilizationPercent === 'number' &&
    typeof data.alertThresholds.memoryUtilizationPercent === 'number' &&
    typeof data.alertThresholds.errorRatePercent === 'number' &&
    Array.isArray(data.monitoredIntegrations)
  );
}

// Express API Router Implementation
export function createDiagnosticRouter(initialConfig?: Partial<DiagnosticConfig>): Router {
  const router = Router();
  let currentConfig = { ...getDefaultDiagnosticConfig(), ...initialConfig };
  const logsStore: LogEntry[] = Array.from({ length: 20 }, () => generateMockLogEntry());

  // GET /health
  router.get('/health', (req: Request, res: Response) => {
    res.json({
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
      services: {
        database: 'connected',
        cache: 'connected',
        gateway: 'active',
      }
    });
  });

  // GET /report
  router.get('/report', (req: Request, res: Response) => {
    const report = generateMockDiagnosticSystemReport();
    report.recentLogs = [...logsStore.slice(-5), ...report.recentLogs];
    res.json(report);
  });

  // GET /metrics
  router.get('/metrics', (req: Request, res: Response) => {
    const metrics = [
      generateMockPerformanceMetric('CPU Utilization', 'cpu'),
      generateMockPerformanceMetric('Memory Usage', 'memory'),
      generateMockPerformanceMetric('API Latency', 'latency'),
      generateMockPerformanceMetric('Request Throughput', 'throughput'),
      generateMockPerformanceMetric('Error Rate', 'error_rate'),
    ];
    res.json(metrics);
  });

  // GET /logs
  router.get('/logs', (req: Request, res: Response) => {
    const limit = parseInt(req.query.limit as string) || 50;
    const category = req.query.category as string;
    let filteredLogs = [...logsStore];
    if (category) {
      filteredLogs = filteredLogs.filter(log => log.category === category);
    }
    res.json(filteredLogs.slice(-limit));
  });

  // POST /logs
  router.post('/logs', (req: Request, res: Response) => {
    const newLog = req.body;
    if (!validateLogEntry(newLog)) {
      res.status(400).json({ error: 'Invalid LogEntry payload structure.' });
      return;
    }
    logsStore.push(newLog);
    if (logsStore.length > 1000) {
      logsStore.shift();
    }
    res.status(201).json({ success: true, log: newLog });
  });

  // GET /security
  router.get('/security', (req: Request, res: Response) => {
    const findings = [
      generateMockSecurityVulnerability(),
      {
        id: 'vuln_sec_02',
        title: 'Unencrypted API Key in Environment',
        severity: 'critical' as const,
        category: 'secret_leak' as const,
        description: 'A plaintext API key for modern_treasury was detected in the container environment variables.',
        remediation: 'Migrate the secret to Azure Key Vault or Google Secret Manager immediately.',
        detectedAt: new Date().toISOString(),
        resourceId: 'modern_treasury_bridge',
      }
    ];
    res.json(findings);
  });

  // GET /config
  router.get('/config', (req: Request, res: Response) => {
    res.json(currentConfig);
  });

  // PUT /config
  router.put('/config', (req: Request, res: Response) => {
    const newConfig = req.body;
    if (!validateDiagnosticConfig(newConfig)) {
      res.status(400).json({ error: 'Invalid DiagnosticConfig payload structure.' });
      return;
    }
    currentConfig = newConfig;
    res.json({ success: true, config: currentConfig });
  });

  return router;
}

// NestJS-style Controller Class for direct integration
export class DiagnosticSystemController {
  private config: DiagnosticConfig = getDefaultDiagnosticConfig();
  private logs: LogEntry[] = [];

  constructor() {
    this.logs = Array.from({ length: 15 }, () => generateMockLogEntry());
  }

  async getHealth() {
    return {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
    };
  }

  async getReport(): Promise<DiagnosticSystemReport> {
    const report = generateMockDiagnosticSystemReport();
    report.recentLogs = [...this.logs.slice(-5), ...report.recentLogs];
    return report;
  }

  async getMetrics(): Promise<PerformanceMetric[]> {
    return [
      generateMockPerformanceMetric('CPU Utilization', 'cpu'),
      generateMockPerformanceMetric('Memory Usage', 'memory'),
      generateMockPerformanceMetric('API Latency', 'latency'),
    ];
  }

  async getLogs(limit = 50, category?: DiagnosticCategory): Promise<LogEntry[]> {
    let filtered = [...this.logs];
    if (category) {
      filtered = filtered.filter(l => l.category === category);
    }
    return filtered.slice(-limit);
  }

  async addLog(log: LogEntry): Promise<{ success: boolean; log: LogEntry }> {
    if (!validateLogEntry(log)) {
      throw new Error('Invalid LogEntry payload');
    }
    this.logs.push(log);
    return { success: true, log };
  }

  async getConfig(): Promise<DiagnosticConfig> {
    return this.config;
  }

  async updateConfig(newConfig: DiagnosticConfig): Promise<{ success: boolean; config: DiagnosticConfig }> {
    if (!validateDiagnosticConfig(newConfig)) {
      throw new Error('Invalid DiagnosticConfig payload');
    }
    this.config = newConfig;
    return { success: true, config: this.config };
  }
}