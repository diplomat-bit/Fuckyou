import { Router, Request, Response } from 'express';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: 'info' | 'warn' | 'error' | 'debug';
  service: string;
  message: string;
  metadata?: Record<string, any>;
}

export interface LogFilter {
  level?: 'info' | 'warn' | 'error' | 'debug';
  service?: string;
  startDate?: Date;
  endDate?: Date;
  search?: string;
  limit?: number;
  offset?: number;
  traceId?: string;
  environment?: string;
}

export interface LogStats {
  total: number;
  byLevel: {
    info: number;
    warn: number;
    error: number;
    debug: number;
  };
  byService: Record<string, number>;
  errorRate: number;
  logsPerMinute: Record<string, number>;
  anomaliesDetected: Array<{
    timestamp: Date;
    type: string;
    description: string;
    severity: 'low' | 'medium' | 'high';
  }>;
}

export class DiagnosticLogService {
  private static instance: DiagnosticLogService;
  private inMemoryLogs: LogEntry[] = [];
  private sseClients: Response[] = [];
  private generatorInterval: NodeJS.Timeout | null = null;

  private readonly services = [
    'AuthManager',
    'ComputeOrchestrator',
    'DatabaseBridge',
    'NetworkGateway',
    'SecretVault',
    'SovereignLedger',
    'ComplianceEngine',
    'VertexAIProxy'
  ];

  private constructor() {
    this.generateInitialMockLogs(250);
    this.startMockLogGenerator();
  }

  public static getInstance(): DiagnosticLogService {
    if (!DiagnosticLogService.instance) {
      DiagnosticLogService.instance = new DiagnosticLogService();
    }
    return DiagnosticLogService.instance;
  }

  /**
   * Generates initial mock logs to simulate a running system.
   */
  private generateInitialMockLogs(count: number): void {
    const levels: LogEntry['level'][] = ['info', 'info', 'info', 'debug', 'warn', 'error'];
    const messages: Record<string, string[]> = {
      AuthManager: [
        'User authentication successful',
        'Token refreshed for session',
        'Failed login attempt from unauthorized IP',
        'mTLS handshake completed successfully',
        'Sovereign ID verification initiated'
      ],
      ComputeOrchestrator: [
        'Scaling group updated: +2 instances',
        'Container health check passed',
        'Resource utilization exceeded 80% threshold',
        'Job scheduler dispatched 14 tasks',
        'Pod eviction triggered due to node pressure'
      ],
      DatabaseBridge: [
        'Connection pool expanded to 50 connections',
        'Slow query detected: SELECT * FROM sovereign_ledger...',
        'Database replication lag: 12ms',
        'Transaction committed successfully',
        'Deadlock resolved automatically by engine'
      ],
      NetworkGateway: [
        'Inbound traffic routed to primary cluster',
        'Rate limit triggered for IP 198.51.100.42',
        'SSL certificate validation successful',
        'VPC peering connection established',
        'DDoS mitigation rules updated'
      ],
      SecretVault: [
        'Secret rotated: api-gateway-key',
        'Access granted to service principal: ComplianceEngine',
        'Decryption request processed for payload',
        'Hardware Security Module (HSM) heartbeat OK',
        'Unauthorized access attempt blocked'
      ],
      SovereignLedger: [
        'Block #104829 minted successfully',
        'Consensus reached among 7 validators',
        'Zero-knowledge proof verified for transaction',
        'Double-spend check completed: No anomalies',
        'Ledger synchronization completed with peer node'
      ],
      ComplianceEngine: [
        'Audit trail generated for Q3 compliance',
        'FedRAMP High control validation passed',
        'GDPR data deletion request processed',
        'Sanction list screening completed: 0 matches',
        'Policy update propagated to all nodes'
      ],
      VertexAIProxy: [
        'Model inference request completed in 45ms',
        'Prompt safety filter passed',
        'Token quota usage at 64%',
        'Fine-tuning pipeline initiated',
        'Embedding generation completed for document batch'
      ]
    };

    const now = Date.now();
    for (let i = 0; i < count; i++) {
      const service = this.services[Math.floor(Math.random() * this.services.length)];
      const serviceMsgs = messages[service];
      const message = serviceMsgs[Math.floor(Math.random() * serviceMsgs.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      
      // Correlate errors with specific messages
      let finalLevel = level;
      if (message.includes('Failed') || message.includes('unauthorized') || message.includes('exceeded') || message.includes('Deadlock')) {
        finalLevel = Math.random() > 0.3 ? 'error' : 'warn';
      }

      const timestamp = new Date(now - (count - i) * 60000 + Math.random() * 30000);

      this.inMemoryLogs.push({
        id: `log_${Math.random().toString(36).slice(2, 11)}`,
        timestamp,
        level: finalLevel,
        service,
        message,
        metadata: {
          environment: 'production-gov-cloud',
          traceId: `tr_${Math.random().toString(36).slice(2, 14)}`,
          cpuUsage: +(Math.random() * 100).toFixed(2),
          memoryUsage: +(Math.random() * 100).toFixed(2)
        }
      });
    }
  }

  /**
   * Starts the background mock log generator to simulate real-time activity.
   */
  public startMockLogGenerator(): void {
    if (this.generatorInterval) return;
    this.generatorInterval = setInterval(() => {
      const levels: LogEntry['level'][] = ['info', 'info', 'info', 'debug', 'warn', 'error'];
      const messages: Record<string, string[]> = {
        AuthManager: [
          'User authentication successful',
          'Token refreshed for session',
          'Failed login attempt from unauthorized IP',
          'mTLS handshake completed successfully',
          'Sovereign ID verification initiated'
        ],
        ComputeOrchestrator: [
          'Scaling group updated: +1 instances',
          'Container health check passed',
          'Resource utilization exceeded 85% threshold',
          'Job scheduler dispatched 8 tasks',
          'Pod eviction triggered due to node pressure'
        ],
        DatabaseBridge: [
          'Connection pool expanded to 50 connections',
          'Slow query detected: SELECT * FROM sovereign_ledger...',
          'Database replication lag: 8ms',
          'Transaction committed successfully',
          'Deadlock resolved automatically by engine'
        ],
        NetworkGateway: [
          'Inbound traffic routed to primary cluster',
          'Rate limit triggered for IP 198.51.100.42',
          'SSL certificate validation successful',
          'VPC peering connection established',
          'DDoS mitigation rules updated'
        ],
        SecretVault: [
          'Secret rotated: api-gateway-key',
          'Access granted to service principal: ComplianceEngine',
          'Decryption request processed for payload',
          'Hardware Security Module (HSM) heartbeat OK',
          'Unauthorized access attempt blocked'
        ],
        SovereignLedger: [
          'Block #104830 minted successfully',
          'Consensus reached among 7 validators',
          'Zero-knowledge proof verified for transaction',
          'Double-spend check completed: No anomalies',
          'Ledger synchronization completed with peer node'
        ],
        ComplianceEngine: [
          'Audit trail generated for Q3 compliance',
          'FedRAMP High control validation passed',
          'GDPR data deletion request processed',
          'Sanction list screening completed: 0 matches',
          'Policy update propagated to all nodes'
        ],
        VertexAIProxy: [
          'Model inference request completed in 42ms',
          'Prompt safety filter passed',
          'Token quota usage at 65%',
          'Fine-tuning pipeline initiated',
          'Embedding generation completed for document batch'
        ]
      };

      const service = this.services[Math.floor(Math.random() * this.services.length)];
      const serviceMsgs = messages[service];
      const message = serviceMsgs[Math.floor(Math.random() * serviceMsgs.length)];
      const level = levels[Math.floor(Math.random() * levels.length)];
      
      let finalLevel = level;
      if (message.includes('Failed') || message.includes('unauthorized') || message.includes('exceeded') || message.includes('Deadlock')) {
        finalLevel = Math.random() > 0.3 ? 'error' : 'warn';
      }

      this.writeLog({
        level: finalLevel,
        service,
        message,
        metadata: {
          environment: 'production-gov-cloud',
          traceId: `tr_${Math.random().toString(36).slice(2, 14)}`,
          cpuUsage: +(Math.random() * 100).toFixed(2),
          memoryUsage: +(Math.random() * 100).toFixed(2)
        }
      });
    }, 5000);
  }

  /**
   * Stops the background mock log generator.
   */
  public stopMockLogGenerator(): void {
    if (this.generatorInterval) {
      clearInterval(this.generatorInterval);
      this.generatorInterval = null;
    }
  }

  /**
   * Registers a Server-Sent Events client for real-time log streaming.
   */
  public addSseClient(res: Response): void {
    this.sseClients.push(res);
    res.on('close', () => {
      this.sseClients = this.sseClients.filter(client => client !== res);
    });
  }

  /**
   * Broadcasts a log entry to all connected SSE clients.
   */
  private broadcastLog(log: LogEntry): void {
    const data = JSON.stringify(log);
    this.sseClients.forEach(client => {
      client.write(`data: ${data}\n\n`);
    });
  }

  /**
   * Retrieves logs based on filters, sorting them in descending order (newest first).
   */
  public async getLogs(filters: LogFilter = {}): Promise<LogEntry[]> {
    let filtered = [...this.inMemoryLogs];

    if (filters.level) {
      filtered = filtered.filter(log => log.level === filters.level);
    }

    if (filters.service) {
      filtered = filtered.filter(log => log.service.toLowerCase() === filters.service!.toLowerCase());
    }

    if (filters.startDate) {
      const start = new Date(filters.startDate).getTime();
      filtered = filtered.filter(log => log.timestamp.getTime() >= start);
    }

    if (filters.endDate) {
      const end = new Date(filters.endDate).getTime();
      filtered = filtered.filter(log => log.timestamp.getTime() <= end);
    }

    if (filters.traceId) {
      filtered = filtered.filter(log => log.metadata?.traceId === filters.traceId);
    }

    if (filters.environment) {
      filtered = filtered.filter(log => log.metadata?.environment === filters.environment);
    }

    if (filters.search) {
      const query = filters.search.toLowerCase();
      filtered = filtered.filter(
        log =>
          log.message.toLowerCase().includes(query) ||
          log.service.toLowerCase().includes(query) ||
          log.id.toLowerCase().includes(query) ||
          (log.metadata?.traceId && log.metadata.traceId.toLowerCase().includes(query))
      );
    }

    // Sort newest first
    filtered.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    const offset = filters.offset || 0;
    const limit = filters.limit || 100;

    return filtered.slice(offset, offset + limit);
  }

  /**
   * Appends a new log entry to the system.
   */
  public async writeLog(entry: Omit<LogEntry, 'id' | 'timestamp'>): Promise<LogEntry> {
    const newEntry: LogEntry = {
      ...entry,
      id: `log_${Math.random().toString(36).slice(2, 11)}`,
      timestamp: new Date()
    };
    this.inMemoryLogs.push(newEntry);
    
    // Keep log buffer capped to prevent memory leaks
    if (this.inMemoryLogs.length > 5000) {
      this.inMemoryLogs.shift();
    }

    // Broadcast to real-time SSE clients
    this.broadcastLog(newEntry);

    return newEntry;
  }

  /**
   * Computes statistics over the current set of logs.
   */
  public async getStats(timeframeMinutes: number = 60): Promise<LogStats> {
    const cutoff = Date.now() - timeframeMinutes * 60 * 1000;
    const activeLogs = this.inMemoryLogs.filter(log => log.timestamp.getTime() >= cutoff);

    const stats: LogStats = {
      total: activeLogs.length,
      byLevel: { info: 0, warn: 0, error: 0, debug: 0 },
      byService: {},
      errorRate: 0,
      logsPerMinute: {},
      anomaliesDetected: []
    };

    activeLogs.forEach(log => {
      stats.byLevel[log.level]++;
      stats.byService[log.service] = (stats.byService[log.service] || 0) + 1;

      // Group by minute
      const minuteStr = new Date(Math.floor(log.timestamp.getTime() / 60000) * 60000).toISOString();
      stats.logsPerMinute[minuteStr] = (stats.logsPerMinute[minuteStr] || 0) + 1;
    });

    if (stats.total > 0) {
      stats.errorRate = +((stats.byLevel.error / stats.total) * 100).toFixed(2);
    }

    // Simple anomaly detection
    if (stats.errorRate > 15) {
      stats.anomaliesDetected.push({
        timestamp: new Date(),
        type: 'HIGH_ERROR_RATE',
        description: `The error rate in the last ${timeframeMinutes} minutes is exceptionally high (${stats.errorRate}%).`,
        severity: stats.errorRate > 30 ? 'high' : 'medium'
      });
    }

    // Check for service-specific spikes
    Object.entries(stats.byService).forEach(([service, count]) => {
      if (count > stats.total * 0.5 && stats.total > 20) {
        stats.anomaliesDetected.push({
          timestamp: new Date(),
          type: 'SERVICE_LOG_SPIKE',
          description: `Service "${service}" is responsible for ${+((count / stats.total) * 100).toFixed(1)}% of all logs.`,
          severity: 'medium'
        });
      }
    });

    return stats;
  }

  /**
   * Formats log entries into various output formats.
   */
  public formatLogs(logs: LogEntry[], format: 'json' | 'csv' | 'text'): string {
    switch (format) {
      case 'json':
        return JSON.stringify(logs, null, 2);

      case 'csv':
        const headers = ['ID', 'Timestamp', 'Level', 'Service', 'Message', 'TraceID'];
        const rows = logs.map(log => [
          log.id,
          log.timestamp.toISOString(),
          log.level.toUpperCase(),
          log.service,
          `"${log.message.replace(/"/g, '""')}"`,
          log.metadata?.traceId || ''
        ]);
        return [headers.join(','), ...rows.map(row => row.join(','))].join('\n');

      case 'text':
      default:
        return logs
          .map(
            log =>
              `[${log.timestamp.toISOString()}] [${log.level.toUpperCase()}] [${log.service}] ${log.message}${
                log.metadata ? ` | metadata=${JSON.stringify(log.metadata)}` : ''
              }`
          )
          .join('\n');
    }
  }

  /**
   * Clears the in-memory log buffer.
   */
  public clearLogs(): void {
    this.inMemoryLogs = [];
  }

  /**
   * Returns an Express Router pre-configured with all API routes for this service.
   */
  public getRouter(): Router {
    const router = Router();

    // GET / - Retrieve filtered logs
    router.get('/', async (req: Request, res: Response) => {
      try {
        const filters: LogFilter = {
          level: req.query.level as LogEntry['level'],
          service: req.query.service as string,
          startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
          endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
          search: req.query.search as string,
          limit: req.query.limit ? parseInt(req.query.limit as string, 10) : undefined,
          offset: req.query.offset ? parseInt(req.query.offset as string, 10) : undefined,
          traceId: req.query.traceId as string,
          environment: req.query.environment as string
        };

        const logs = await this.getLogs(filters);
        res.json({
          success: true,
          count: logs.length,
          data: logs
        });
      } catch (error: any) {
        res.status(400).json({ success: false, error: error.message });
      }
    });

    // GET /stats - Retrieve log statistics
    router.get('/stats', async (req: Request, res: Response) => {
      try {
        const timeframe = req.query.timeframe ? parseInt(req.query.timeframe as string, 10) : 60;
        const stats = await this.getStats(timeframe);
        res.json({
          success: true,
          data: stats
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // GET /stream - Server-Sent Events (SSE) for real-time logs
    router.get('/stream', (req: Request, res: Response) => {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');
      res.flushHeaders();

      this.addSseClient(res);

      // Send initial connection message
      res.write(`data: ${JSON.stringify({ message: 'Connected to real-time diagnostic log stream' })}\n\n`);
    });

    // GET /export - Export logs in JSON, CSV, or Text format
    router.get('/export', async (req: Request, res: Response) => {
      try {
        const format = (req.query.format as 'json' | 'csv' | 'text') || 'json';
        const filters: LogFilter = {
          level: req.query.level as LogEntry['level'],
          service: req.query.service as string,
          startDate: req.query.startDate ? new Date(req.query.startDate as string) : undefined,
          endDate: req.query.endDate ? new Date(req.query.endDate as string) : undefined,
          search: req.query.search as string,
          traceId: req.query.traceId as string,
          environment: req.query.environment as string
        };

        const logs = await this.getLogs({ ...filters, limit: 5000 }); // Cap export to 5000 logs
        const formatted = this.formatLogs(logs, format);

        if (format === 'json') {
          res.setHeader('Content-Type', 'application/json');
          res.setHeader('Content-Disposition', 'attachment; filename="diagnostic_logs.json"');
        } else if (format === 'csv') {
          res.setHeader('Content-Type', 'text/csv');
          res.setHeader('Content-Disposition', 'attachment; filename="diagnostic_logs.csv"');
        } else {
          res.setHeader('Content-Type', 'text/plain');
          res.setHeader('Content-Disposition', 'attachment; filename="diagnostic_logs.txt"');
        }

        res.send(formatted);
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // POST / - Write a new log entry
    router.post('/', async (req: Request, res: Response) => {
      try {
        const { level, service, message, metadata } = req.body;

        if (!level || !service || !message) {
          return res.status(400).json({
            success: false,
            error: 'Missing required fields: level, service, and message are required.'
          });
        }

        const validLevels = ['info', 'warn', 'error', 'debug'];
        if (!validLevels.includes(level)) {
          return res.status(400).json({
            success: false,
            error: `Invalid log level. Must be one of: ${validLevels.join(', ')}`
          });
        }

        const newLog = await this.writeLog({
          level,
          service,
          message,
          metadata
        });

        res.status(201).json({
          success: true,
          data: newLog
        });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    // POST /generator/start - Start mock log generator
    router.post('/generator/start', (req: Request, res: Response) => {
      this.startMockLogGenerator();
      res.json({ success: true, message: 'Mock log generator started' });
    });

    // POST /generator/stop - Stop mock log generator
    router.post('/generator/stop', (req: Request, res: Response) => {
      this.stopMockLogGenerator();
      res.json({ success: true, message: 'Mock log generator stopped' });
    });

    // DELETE / - Clear all logs
    router.delete('/', (req: Request, res: Response) => {
      this.clearLogs();
      res.json({
        success: true,
        message: 'All in-memory logs cleared successfully'
      });
    });

    return router;
  }
}

export default DiagnosticLogService.getInstance();