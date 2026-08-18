export type DatabaseEngineType =
  | 'postgres'
  | 'mysql'
  | 'mongodb'
  | 'redis'
  | 'bigquery'
  | 'spanner'
  | 'cosmos'
  | 'sqlite'
  | 'astra-db';

export type DatabaseHealthStatus = 'HEALTHY' | 'DEGRADED' | 'UNHEALTHY' | 'UNKNOWN';

export interface DatabaseConnectionPoolMetrics {
  activeConnections: number;
  idleConnections: number;
  maxConnections: number;
  waitingRequestsCount: number;
  connectionTimeoutCount: number;
  utilizationRate: number; // Value between 0.0 and 1.0
}

export interface DatabaseQueryPerformanceMetrics {
  avgQueryDurationMs: number;
  p95QueryDurationMs: number;
  p99QueryDurationMs: number;
  queriesPerSecond: number;
  slowQueriesCount: number;
  slowQueryThresholdMs: number;
  errorRate: number; // Percentage of queries resulting in errors
  indexHitRate: number; // Percentage of queries utilizing indexes
  cacheHitRate: number; // Percentage of queries served from cache
  totalQueriesExecuted: number;
}

export interface TableStorageMetric {
  tableName: string;
  rowCount: number;
  dataSizeBytes: number;
  indexSizeBytes: number;
  totalSizeBytes: number;
}

export interface DatabaseStorageMetrics {
  totalSizeBytes: number;
  usedSizeBytes: number;
  freeSizeBytes: number;
  indexSizeBytes: number;
  utilizationRate: number; // Value between 0.0 and 1.0
  tables: TableStorageMetric[];
}

export interface DatabaseReplicationMetrics {
  replicationLagMs: number;
  status: 'ACTIVE' | 'STOPPED' | 'ERROR' | 'SYNCHRONIZING' | 'NONE';
  standbyNodes: string[];
  isPrimary: boolean;
}

export interface SlowQueryDetail {
  queryId: string;
  sql: string;
  durationMs: number;
  executionTime: string; // ISO 8601 timestamp
  rowsAffected: number;
  callerService?: string;
}

export interface ActiveTransactionDetail {
  transactionId: string;
  startTime: string; // ISO 8601 timestamp
  durationMs: number;
  state: 'idle' | 'active' | 'idle in transaction' | 'fastpath function call' | 'disabled' | 'unknown';
  query?: string;
}

export interface DatabaseErrorDetail {
  errorCode: string;
  errorMessage: string;
  occurredAt: string; // ISO 8601 timestamp
  severity: 'WARNING' | 'ERROR' | 'CRITICAL';
  stackTrace?: string;
}

export interface DiagnosticRecommendation {
  id: string;
  category: 'PERFORMANCE' | 'STORAGE' | 'SECURITY' | 'CONFIGURATION' | 'INDEXING';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  title: string;
  description: string;
  remediationSteps: string[];
  impactScore: number; // Scale of 1 to 10
}

export interface DatabaseDiagnosticReport {
  databaseId: string;
  databaseName: string;
  engine: DatabaseEngineType;
  status: DatabaseHealthStatus;
  timestamp: string; // ISO 8601 timestamp
  uptimeSeconds: number;
  version: string;
  connectionPool: DatabaseConnectionPoolMetrics;
  queryPerformance: DatabaseQueryPerformanceMetrics;
  storage: DatabaseStorageMetrics;
  replication?: DatabaseReplicationMetrics;
  slowQueries: SlowQueryDetail[];
  activeTransactions: ActiveTransactionDetail[];
  errors: DatabaseErrorDetail[];
  recommendations: DiagnosticRecommendation[];
}

export interface DatabaseDiagnosticSummary {
  totalDatabasesChecked: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  overallStatus: DatabaseHealthStatus;
  reports: DatabaseDiagnosticReport[];
  aggregatedRecommendations: DiagnosticRecommendation[];
}

// ============================================================================
// API ROUTING, MOCK GENERATORS, AND DIAGNOSTIC SERVICE INTEGRATION
// ============================================================================

import { Router, Request, Response, NextFunction } from 'express';

/**
 * Generates highly realistic mock database diagnostic reports for testing and live dashboard feeds.
 */
export class DatabaseDiagnosticGenerator {
  public static generateMockReport(id: string, name: string, engine: DatabaseEngineType): DatabaseDiagnosticReport {
    const isHealthy = Math.random() > 0.25;
    const status: DatabaseHealthStatus = isHealthy ? 'HEALTHY' : Math.random() > 0.5 ? 'DEGRADED' : 'UNHEALTHY';
    
    const activeConnections = Math.floor(Math.random() * 80) + 10;
    const maxConnections = engine === 'sqlite' ? 1 : 500;
    const utilizationRate = activeConnections / maxConnections;

    const tables: TableStorageMetric[] = [
      {
        tableName: 'users',
        rowCount: 1250000,
        dataSizeBytes: 256 * 1024 * 1024,
        indexSizeBytes: 64 * 1024 * 1024,
        totalSizeBytes: 320 * 1024 * 1024,
      },
      {
        tableName: 'transactions',
        rowCount: 8430000,
        dataSizeBytes: 1840 * 1024 * 1024,
        indexSizeBytes: 512 * 1024 * 1024,
        totalSizeBytes: 2352 * 1024 * 1024,
      },
      {
        tableName: 'audit_logs',
        rowCount: 24500000,
        dataSizeBytes: 4800 * 1024 * 1024,
        indexSizeBytes: 1024 * 1024 * 1024,
        totalSizeBytes: 5824 * 1024 * 1024,
      },
    ];

    const usedSizeBytes = tables.reduce((acc, t) => acc + t.totalSizeBytes, 0);
    const totalSizeBytes = 50 * 1024 * 1024 * 1024; // 50 GB
    const freeSizeBytes = totalSizeBytes - usedSizeBytes;

    const slowQueries: SlowQueryDetail[] = status !== 'HEALTHY' ? [
      {
        queryId: 'q-98231',
        sql: 'SELECT * FROM transactions WHERE status = \'PENDING\' AND created_at < NOW() - INTERVAL \'3 days\' ORDER BY amount DESC LIMIT 100;',
        durationMs: 1240,
        executionTime: new Date(Date.now() - 15000).toISOString(),
        rowsAffected: 45,
        callerService: 'settlement-orchestrator',
      },
      {
        queryId: 'q-10492',
        sql: 'SELECT u.email, COUNT(t.id) FROM users u LEFT JOIN transactions t ON u.id = t.user_id GROUP BY u.email HAVING COUNT(t.id) > 1000;',
        durationMs: 3450,
        executionTime: new Date(Date.now() - 45000).toISOString(),
        rowsAffected: 12,
        callerService: 'marketing-analytics',
      }
    ] : [];

    const activeTransactions: ActiveTransactionDetail[] = [
      {
        transactionId: 'tx-88291',
        startTime: new Date(Date.now() - 2000).toISOString(),
        durationMs: 2000,
        state: 'active',
        query: 'UPDATE accounts SET balance = balance - 500 WHERE id = \'acc-9921\';'
      }
    ];

    const errors: DatabaseErrorDetail[] = status === 'UNHEALTHY' ? [
      {
        errorCode: '42P01',
        errorMessage: 'relation "temporary_ledger_cache" does not exist',
        occurredAt: new Date(Date.now() - 60000).toISOString(),
        severity: 'ERROR',
        stackTrace: 'at Client.query (/app/node_modules/pg/lib/client.js:411:11)\nat LedgerSync.sync (/app/dist/ledgerSync.js:42:18)'
      },
      {
        errorCode: '53300',
        errorMessage: 'remaining connection slots are reserved for non-replication superuser connections',
        occurredAt: new Date(Date.now() - 120000).toISOString(),
        severity: 'CRITICAL',
        stackTrace: 'at Connection.connect (/app/node_modules/pg/lib/connection.js:98:12)'
      }
    ] : [];

    const recommendations: DiagnosticRecommendation[] = [];
    if (status !== 'HEALTHY') {
      recommendations.push({
        id: `rec-${id}-01`,
        category: 'INDEXING',
        severity: 'HIGH',
        title: 'Missing Index on transactions(status, created_at)',
        description: 'A slow query in settlement-orchestrator is performing a sequential scan on the transactions table.',
        remediationSteps: [
          'CREATE INDEX CONCURRENTLY idx_transactions_status_created ON transactions(status, created_at);',
          'Analyze the table to update planner statistics: ANALYZE transactions;'
        ],
        impactScore: 8
      });
    }
    if (utilizationRate > 0.8) {
      recommendations.push({
        id: `rec-${id}-02`,
        category: 'CONFIGURATION',
        severity: 'MEDIUM',
        title: 'Connection Pool Near Capacity',
        description: 'Active connections are reaching the maximum limit. Consider increasing max_connections or implementing a connection pooler like PgBouncer.',
        remediationSteps: [
          'Increase max_connections in postgresql.conf to 1000.',
          'Deploy PgBouncer in transaction pooling mode.'
        ],
        impactScore: 6
      });
    }

    return {
      databaseId: id,
      databaseName: name,
      engine,
      status,
      timestamp: new Date().toISOString(),
      uptimeSeconds: 1209600, // 14 days
      version: 'PostgreSQL 15.4',
      connectionPool: {
        activeConnections,
        idleConnections: Math.floor(activeConnections * 0.3),
        maxConnections,
        waitingRequestsCount: status === 'UNHEALTHY' ? 14 : 0,
        connectionTimeoutCount: status === 'UNHEALTHY' ? 3 : 0,
        utilizationRate,
      },
      queryPerformance: {
        avgQueryDurationMs: status === 'HEALTHY' ? 12 : 145,
        p95QueryDurationMs: status === 'HEALTHY' ? 45 : 890,
        p99QueryDurationMs: status === 'HEALTHY' ? 120 : 2400,
        queriesPerSecond: Math.floor(Math.random() * 400) + 50,
        slowQueriesCount: slowQueries.length,
        slowQueryThresholdMs: 100,
        errorRate: status === 'UNHEALTHY' ? 4.2 : 0.02,
        indexHitRate: status === 'HEALTHY' ? 0.99 : 0.82,
        cacheHitRate: status === 'HEALTHY' ? 0.98 : 0.75,
        totalQueriesExecuted: 14502910,
      },
      storage: {
        totalSizeBytes,
        usedSizeBytes,
        freeSizeBytes,
        indexSizeBytes: tables.reduce((acc, t) => acc + t.indexSizeBytes, 0),
        utilizationRate: usedSizeBytes / totalSizeBytes,
        tables,
      },
      replication: engine !== 'sqlite' ? {
        replicationLagMs: status === 'DEGRADED' ? 4500 : 12,
        status: status === 'UNHEALTHY' ? 'ERROR' : 'ACTIVE',
        standbyNodes: [`${name}-replica-01`, `${name}-replica-02`],
        isPrimary: true,
      } : undefined,
      slowQueries,
      activeTransactions,
      errors,
      recommendations,
    };
  }
}

/**
 * In-memory state manager for database diagnostics.
 */
export class DatabaseDiagnosticsService {
  private static instance: DatabaseDiagnosticsService;
  private reports: Map<string, DatabaseDiagnosticReport> = new Map();

  private constructor() {
    this.initializeMockData();
  }

  public static getInstance(): DatabaseDiagnosticsService {
    if (!DatabaseDiagnosticsService.instance) {
      DatabaseDiagnosticsService.instance = new DatabaseDiagnosticsService();
    }
    return this.instance;
  }

  private initializeMockData() {
    const mockDatabases: { id: string; name: string; engine: DatabaseEngineType }[] = [
      { id: 'db-primary-pg', name: 'Sovereign_Ledger_Prod', engine: 'postgres' },
      { id: 'db-cache-redis', name: 'Session_Cache_Cluster', engine: 'redis' },
      { id: 'db-warehouse-bq', name: 'Audit_BigQuery_Warehouse', engine: 'bigquery' },
      { id: 'db-cosmos-global', name: 'Identity_Citadel_Cosmos', engine: 'cosmos' },
      { id: 'db-astra-vector', name: 'AI_Neural_AstraDB', engine: 'astra-db' },
    ];

    mockDatabases.forEach((db) => {
      this.reports.set(db.id, DatabaseDiagnosticGenerator.generateMockReport(db.id, db.name, db.engine));
    });
  }

  public getAllReports(): DatabaseDiagnosticReport[] {
    return Array.from(this.reports.values());
  }

  public getReportById(id: string): DatabaseDiagnosticReport | undefined {
    return this.reports.get(id);
  }

  public getSummary(): DatabaseDiagnosticSummary {
    const reports = this.getAllReports();
    const totalDatabasesChecked = reports.length;
    const healthyCount = reports.filter((r) => r.status === 'HEALTHY').length;
    const degradedCount = reports.filter((r) => r.status === 'DEGRADED').length;
    const unhealthyCount = reports.filter((r) => r.status === 'UNHEALTHY').length;

    let overallStatus: DatabaseHealthStatus = 'HEALTHY';
    if (unhealthyCount > 0) {
      overallStatus = 'UNHEALTHY';
    } else if (degradedCount > 0) {
      overallStatus = 'DEGRADED';
    }

    const aggregatedRecommendations = reports.flatMap((r) => r.recommendations);

    return {
      totalDatabasesChecked,
      healthyCount,
      degradedCount,
      unhealthyCount,
      overallStatus,
      reports,
      aggregatedRecommendations,
    };
  }

  public optimizeDatabase(id: string): { success: boolean; message: string; optimizedReport?: DatabaseDiagnosticReport } {
    const report = this.reports.get(id);
    if (!report) {
      return { success: false, message: `Database with ID ${id} not found.` };
    }

    // Simulate optimization
    report.status = 'HEALTHY';
    report.recommendations = [];
    report.slowQueries = [];
    report.errors = [];
    report.queryPerformance.avgQueryDurationMs = 8;
    report.queryPerformance.p95QueryDurationMs = 25;
    report.queryPerformance.p99QueryDurationMs = 60;
    report.queryPerformance.errorRate = 0.01;
    report.queryPerformance.indexHitRate = 0.99;
    report.queryPerformance.cacheHitRate = 0.99;
    if (report.connectionPool) {
      report.connectionPool.waitingRequestsCount = 0;
      report.connectionPool.connectionTimeoutCount = 0;
    }
    if (report.replication) {
      report.replication.status = 'ACTIVE';
      report.replication.replicationLagMs = 4;
    }

    this.reports.set(id, report);
    return {
      success: true,
      message: `Database ${report.databaseName} successfully optimized. Indexes rebuilt, connection pool flushed, and query cache warmed.`,
      optimizedReport: report,
    };
  }

  public testConnection(engine: DatabaseEngineType, connectionString: string): { success: boolean; latencyMs: number; message: string } {
    const latencyMs = Math.floor(Math.random() * 120) + 10;
    const isSuccess = !connectionString.includes('fail') && !connectionString.includes('invalid');

    if (isSuccess) {
      return {
        success: true,
        latencyMs,
        message: `Successfully established connection to ${engine} cluster. Handshake completed in ${latencyMs}ms.`,
      };
    } else {
      return {
        success: false,
        latencyMs: 0,
        message: `Connection failed: Authentication failed or host unreachable for ${engine} endpoint.`,
      };
    }
  }

  public clearErrors(id: string): boolean {
    const report = this.reports.get(id);
    if (!report) return false;
    report.errors = [];
    if (report.status === 'UNHEALTHY') {
      report.status = 'DEGRADED';
    }
    this.reports.set(id, report);
    return true;
  }
}

/**
 * Express Router containing all API routes for Database Diagnostics.
 * Mount this router in your main Express application (e.g., app.use('/api/diagnostics/database', DatabaseDiagnosticsRouter)).
 */
export const DatabaseDiagnosticsRouter = Router();
const service = DatabaseDiagnosticsService.getInstance();

// GET /api/diagnostics/database - Get overall summary of all databases
DatabaseDiagnosticsRouter.get('/', (req: Request, res: Response, next: NextFunction) => {
  try {
    const summary = service.getSummary();
    res.status(200).json({
      success: true,
      timestamp: new Date().toISOString(),
      data: summary,
    });
  } catch (error) {
    next(error);
  }
});

// GET /api/diagnostics/database/:id - Get detailed report for a specific database
DatabaseDiagnosticsRouter.get('/:id', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const report = service.getReportById(id);
    if (!report) {
      res.status(404).json({
        success: false,
        error: `Database diagnostic report with ID '${id}' not found.`,
      });
      return;
    }
    res.status(200).json({
      success: true,
      data: report,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/diagnostics/database/:id/optimize - Run optimization routines on a database
DatabaseDiagnosticsRouter.post('/:id/optimize', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const result = service.optimizeDatabase(id);
    if (!result.success) {
      res.status(404).json({
        success: false,
        error: result.message,
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: result.message,
      data: result.optimizedReport,
    });
  } catch (error) {
    next(error);
  }
});

// POST /api/diagnostics/database/test-connection - Test connection to a database engine
DatabaseDiagnosticsRouter.post('/test-connection', (req: Request, res: Response, next: NextFunction) => {
  try {
    const { engine, connectionString } = req.body;
    if (!engine || !connectionString) {
      res.status(400).json({
        success: false,
        error: "Missing required fields: 'engine' and 'connectionString' must be provided.",
      });
      return;
    }
    const result = service.testConnection(engine as DatabaseEngineType, connectionString as string);
    res.status(result.success ? 200 : 400).json(result);
  } catch (error) {
    next(error);
  }
});

// POST /api/diagnostics/database/:id/clear-errors - Clear error logs for a database
DatabaseDiagnosticsRouter.post('/:id/clear-errors', (req: Request, res: Response, next: NextFunction) => {
  try {
    const id = (Array.isArray(req.params.id) ? req.params.id[0] : req.params.id) as string;
    const success = service.clearErrors(id);
    if (!success) {
      res.status(404).json({
        success: false,
        error: `Database with ID '${id}' not found.`,
      });
      return;
    }
    res.status(200).json({
      success: true,
      message: `Error logs cleared for database '${id}'.`,
    });
  } catch (error) {
    next(error);
  }
});