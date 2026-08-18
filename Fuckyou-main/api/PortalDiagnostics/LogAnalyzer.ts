export type LogLevel = 'debug' | 'info' | 'warn' | 'error' | 'fatal';

import { Router, Request, Response, NextFunction } from 'express';

export interface LogEntry {
  id: string;
  timestamp: Date;
  level: LogLevel;
  source: string;
  message: string;
  traceId?: string;
  userId?: string;
  ip?: string;
  durationMs?: number;
  statusCode?: number;
  metadata?: Record<string, unknown>;
  raw?: string;
}

export interface LogFilterOptions {
  startDate?: Date;
  endDate?: Date;
  levels?: LogLevel[];
  sources?: string[];
  traceId?: string;
  userId?: string;
  searchPattern?: string | RegExp;
  minDurationMs?: number;
  limit?: number;
  offset?: number;
}

export type AnomalyType = 
  | 'ERROR_SPIKE'
  | 'HIGH_LATENCY'
  | 'SECURITY_BRUTE_FORCE'
  | 'UNUSUAL_IP_TRAFFIC'
  | 'UNHANDLED_EXCEPTION'
  | 'STATUS_5XX_SURGE'
  | 'RESOURCE_EXHAUSTION';

export interface LogAnomaly {
  id: string;
  type: AnomalyType;
  severity: 'low' | 'medium' | 'high' | 'critical';
  confidence: number; // 0.0 to 1.0
  description: string;
  recommendation: string;
  affectedSource?: string;
  timestamp: Date;
  sampleLogIds: string[];
  metrics: Record<string, number | string>;
}

export interface LogPatternCluster {
  clusterId: string;
  patternSignature: string;
  occurrences: number;
  firstSeen: Date;
  lastSeen: Date;
  sampleMessages: string[];
  level: LogLevel;
  associatedSources: string[];
}

export interface SystemLogStats {
  totalLogs: number;
  countByLevel: Record<LogLevel, number>;
  errorRate: number; // percentage 0-100
  averageLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  throughputPerMinute: number;
  topErrorSources: Array<{ source: string; count: number }>;
  uniqueUsers: number;
  uniqueIPs: number;
}

export interface DiagnosticAnalysisReport {
  reportId: string;
  generatedAt: Date;
  timeRange: { start: Date; end: Date };
  stats: SystemLogStats;
  anomalies: LogAnomaly[];
  patterns: LogPatternCluster[];
  healthScore: number; // 0 to 100
}

export class LogAnalyzer {
  private static instance: LogAnalyzer;
  public static getInstance(): LogAnalyzer {
    if (!LogAnalyzer.instance) {
      LogAnalyzer.instance = new LogAnalyzer();
    }
    return LogAnalyzer.instance;
  }

  private static readonly JSON_LOG_REGEX = /^\s*\{.*\}\s*$/;
  private static readonly COMMON_LOG_REGEX = /^\[(?<timestamp>[^\]]+)\] \[(?<level>[A-Z]+)\] \[(?<source>[^\]]+)\] (?<message>.*)$/;
  private static readonly SYSLOG_REGEX = /^(?<timestamp>[A-Z][a-z]{2}\s+\d+\s+\d{2}:\d{2}:\d{2})\s+(?<host>\S+)\s+(?<source>[\w\/\.\-]+)(\[(?<pid>\d+)\])?:?\s+(?<message>.*)$/;

  // Stateful in-memory log buffer for real-time aggregation
  private logBuffer: LogEntry[] = [];
  private readonly MAX_BUFFER_SIZE = 20000;

  /**
   * Parses a single raw log string into a structured LogEntry object.
   */
  public parseLogLine(line: string, fallbackSource: string = 'system'): LogEntry {
    const trimmed = line.trim();
    const defaultId = `log_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

    if (!trimmed) {
      return {
        id: defaultId,
        timestamp: new Date(),
        level: 'info',
        source: fallbackSource,
        message: '',
        raw: line
      };
    }

    // Try parsing JSON format
    if (LogAnalyzer.JSON_LOG_REGEX.test(trimmed)) {
      try {
        const parsed = JSON.parse(trimmed);
        return {
          id: parsed.id || parsed.reqId || defaultId,
          timestamp: parsed.timestamp || parsed.time ? new Date(parsed.timestamp || parsed.time) : new Date(),
          level: this.normalizeLogLevel(parsed.level || parsed.severity || 'info'),
          source: parsed.source || parsed.service || parsed.context || fallbackSource,
          message: parsed.message || parsed.msg || JSON.stringify(parsed),
          traceId: parsed.traceId || parsed.correlationId || parsed.trace_id,
          userId: parsed.userId || parsed.user_id,
          ip: parsed.ip || parsed.remoteAddr || parsed.clientIp,
          durationMs: typeof parsed.durationMs === 'number' ? parsed.durationMs : parsed.responseTime,
          statusCode: typeof parsed.statusCode === 'number' ? parsed.statusCode : parsed.status,
          metadata: parsed.metadata || parsed.extra || {},
          raw: line
        };
      } catch {
        // Fall through to regex parsing if JSON parse fails
      }
    }

    // Try Standard Bracketed Log Format: [2026-03-31T12:00:00Z] [ERROR] [api/auth] Token expired
    const commonMatch = trimmed.match(LogAnalyzer.COMMON_LOG_REGEX);
    if (commonMatch && commonMatch.groups) {
      const { timestamp, level, source, message } = commonMatch.groups;
      return {
        id: defaultId,
        timestamp: this.safeParseDate(timestamp),
        level: this.normalizeLogLevel(level),
        source: source || fallbackSource,
        message: message,
        raw: line
      };
    }

    // Try Syslog Format
    const syslogMatch = trimmed.match(LogAnalyzer.SYSLOG_REGEX);
    if (syslogMatch && syslogMatch.groups) {
      const { timestamp, source, message } = syslogMatch.groups;
      return {
        id: defaultId,
        timestamp: this.safeParseDate(timestamp),
        level: this.inferLogLevelFromMessage(message),
        source: source || fallbackSource,
        message: message,
        raw: line
      };
    }

    // Fallback unformatted text log
    return {
      id: defaultId,
      timestamp: new Date(),
      level: this.inferLogLevelFromMessage(trimmed),
      source: fallbackSource,
      message: trimmed,
      raw: line
    };
  }

  /**
   * Batch parses multiple log entries from raw text or string array.
   */
  public parseLogBatch(rawLogs: string | string[], fallbackSource: string = 'system'): LogEntry[] {
    const lines = Array.isArray(rawLogs) 
      ? rawLogs 
      : rawLogs.split(/\r?\n/).filter(line => line.trim().length > 0);

    return lines.map(line => this.parseLogLine(line, fallbackSource));
  }

  /**
   * Ingests logs into the stateful in-memory buffer.
   */
  public ingestLogs(rawLogs: string | string[], fallbackSource: string = 'system'): LogEntry[] {
    const parsed = this.parseLogBatch(rawLogs, fallbackSource);
    this.logBuffer.push(...parsed);
    
    // Enforce maximum buffer size (FIFO)
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer = this.logBuffer.slice(this.logBuffer.length - this.MAX_BUFFER_SIZE);
    }
    return parsed;
  }

  /**
   * Ingests pre-parsed structured LogEntry objects.
   */
  public ingestStructuredLogs(entries: LogEntry[]): void {
    this.logBuffer.push(...entries);
    if (this.logBuffer.length > this.MAX_BUFFER_SIZE) {
      this.logBuffer = this.logBuffer.slice(this.logBuffer.length - this.MAX_BUFFER_SIZE);
    }
  }

  /**
   * Retrieves all currently stored logs in the buffer.
   */
  public getStoredLogs(): LogEntry[] {
    return this.logBuffer;
  }

  /**
   * Clears the in-memory log buffer.
   */
  public clearStoredLogs(): void {
    this.logBuffer = [];
  }

  /**
   * Filters log entries based on specific criteria.
   */
  public filterLogs(logs: LogEntry[], options: LogFilterOptions): LogEntry[] {
    let filtered = logs.filter(log => {
      if (options.startDate && log.timestamp < options.startDate) return false;
      if (options.endDate && log.timestamp > options.endDate) return false;
      if (options.levels && options.levels.length > 0 && !options.levels.includes(log.level)) return false;
      if (options.sources && options.sources.length > 0 && !options.sources.includes(log.source)) return false;
      if (options.traceId && log.traceId !== options.traceId) return false;
      if (options.userId && log.userId !== options.userId) return false;
      if (options.minDurationMs !== undefined && (log.durationMs || 0) < options.minDurationMs) return false;

      if (options.searchPattern) {
        if (typeof options.searchPattern === 'string') {
          const lowerSearch = options.searchPattern.toLowerCase();
          const matchMsg = log.message.toLowerCase().includes(lowerSearch);
          const matchSource = log.source.toLowerCase().includes(lowerSearch);
          if (!matchMsg && !matchSource) return false;
        } else if (options.searchPattern instanceof RegExp) {
          if (!options.searchPattern.test(log.message) && !options.searchPattern.test(log.source)) {
            return false;
          }
        }
      }

      return true;
    });

    if (options.offset !== undefined) {
      filtered = filtered.slice(options.offset);
    }
    if (options.limit !== undefined) {
      filtered = filtered.slice(0, options.limit);
    }

    return filtered;
  }

  /**
   * Detects error frequency spikes over rolling time windows.
   */
  public detectErrorSpikes(
    logs: LogEntry[],
    windowMs: number = 300000, // 5 minutes
    spikeThresholdRatio: number = 3.0
  ): LogAnomaly[] {
    if (logs.length === 0) return [];

    const sortedLogs = [...logs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const anomalies: LogAnomaly[] = [];

    // Group logs into fixed windows
    const startTime = sortedLogs[0].timestamp.getTime();
    const endTime = sortedLogs[sortedLogs.length - 1].timestamp.getTime();
    
    if (endTime - startTime < windowMs) return [];

    const windows: Array<{ start: number; total: number; errors: number; logIds: string[] }> = [];

    for (let time = startTime; time < endTime; time += windowMs) {
      const windowEnd = time + windowMs;
      const windowLogs = sortedLogs.filter(l => {
        const t = l.timestamp.getTime();
        return t >= time && t < windowEnd;
      });

      const errorLogs = windowLogs.filter(l => l.level === 'error' || l.level === 'fatal');
      windows.push({
        start: time,
        total: windowLogs.length,
        errors: errorLogs.length,
        logIds: errorLogs.map(l => l.id)
      });
    }

    // Calculate baseline error rate
    const totalErrors = windows.reduce((acc, w) => acc + w.errors, 0);
    const avgErrorsPerWindow = totalErrors / windows.length;

    windows.forEach((win) => {
      if (avgErrorsPerWindow > 0 && win.errors / avgErrorsPerWindow >= spikeThresholdRatio && win.errors >= 5) {
        anomalies.push({
          id: `anomaly_spike_${win.start}`,
          type: 'ERROR_SPIKE',
          severity: win.errors / avgErrorsPerWindow > 5.0 ? 'critical' : 'high',
          confidence: Math.min(1.0, 0.5 + (win.errors / avgErrorsPerWindow) * 0.1),
          description: `Error spike detected: ${win.errors} errors in 5-minute window (baseline avg: ${avgErrorsPerWindow.toFixed(1)}).`,
          recommendation: 'Check recent deployments, database connection pools, or upstream third-party service dependencies.',
          timestamp: new Date(win.start),
          sampleLogIds: win.logIds.slice(0, 5),
          metrics: {
            windowErrorCount: win.errors,
            baselineAverage: avgErrorsPerWindow,
            spikeRatio: Number((win.errors / avgErrorsPerWindow).toFixed(2))
          }
        });
      }
    });

    return anomalies;
  }

  /**
   * Detects latency degradation and performance bottlenecks.
   */
  public detectLatencyAnomalies(
    logs: LogEntry[],
    latencyThresholdMs: number = 2000
  ): LogAnomaly[] {
    const logsWithLatency = logs.filter(l => typeof l.durationMs === 'number');
    if (logsWithLatency.length < 10) return [];

    const slowLogs = logsWithLatency.filter(l => (l.durationMs || 0) >= latencyThresholdMs);
    if (slowLogs.length === 0) return [];

    const anomalies: LogAnomaly[] = [];
    const groupedBySource: Record<string, LogEntry[]> = {};

    slowLogs.forEach(l => {
      if (!groupedBySource[l.source]) groupedBySource[l.source] = [];
      groupedBySource[l.source].push(l);
    });

    Object.entries(groupedBySource).forEach(([source, slowList]) => {
      const avgLatency = slowList.reduce((acc, curr) => acc + (curr.durationMs || 0), 0) / slowList.length;
      const maxLatency = Math.max(...slowList.map(l => l.durationMs || 0));

      anomalies.push({
        id: `anomaly_latency_${source}_${Date.now()}`,
        type: 'HIGH_LATENCY',
        severity: avgLatency > 5000 ? 'critical' : avgLatency > 3000 ? 'high' : 'medium',
        confidence: Math.min(1.0, slowList.length / 10),
        description: `Source '${source}' exhibited elevated execution duration (${slowList.length} requests exceeding ${latencyThresholdMs}ms).`,
        recommendation: `Inspect query performance, remote API calls, or server CPU/Memory metrics for source '${source}'.`,
        affectedSource: source,
        timestamp: new Date(),
        sampleLogIds: slowList.map(l => l.id).slice(0, 5),
        metrics: {
          slowRequestCount: slowList.length,
          avgLatencyMs: Math.round(avgLatency),
          maxLatencyMs: maxLatency
        }
      });
    });

    return anomalies;
  }

  /**
   * Scans logs for security threats such as brute force attempts or suspicious IP bursts.
   */
  public detectSecurityThreats(logs: LogEntry[]): LogAnomaly[] {
    const anomalies: LogAnomaly[] = [];

    // Brute force / Auth failure pattern
    const authFailures = logs.filter(l => 
      /unauthorized|invalid credentials|authentication failed|login failure|access denied/i.test(l.message) ||
      l.statusCode === 401 ||
      l.statusCode === 403
    );

    const failuresByIp: Record<string, LogEntry[]> = {};
    authFailures.forEach(l => {
      const ip = l.ip || l.metadata?.ip as string || 'unknown';
      if (ip !== 'unknown') {
        if (!failuresByIp[ip]) failuresByIp[ip] = [];
        failuresByIp[ip].push(l);
      }
    });

    Object.entries(failuresByIp).forEach(([ip, failureLogs]) => {
      if (failureLogs.length >= 10) {
        anomalies.push({
          id: `anomaly_sec_bruteforce_${ip}`,
          type: 'SECURITY_BRUTE_FORCE',
          severity: failureLogs.length >= 50 ? 'critical' : 'high',
          confidence: 0.95,
          description: `Potential brute-force or credential stuffing activity detected from IP: ${ip} (${failureLogs.length} auth failures).`,
          recommendation: `Consider temporarily blocking IP ${ip} in firewalls or rate limiting gateway rules.`,
          timestamp: new Date(),
          sampleLogIds: failureLogs.slice(0, 5).map(l => l.id),
          metrics: {
            ip,
            failureCount: failureLogs.length
          }
        });
      }
    });

    return anomalies;
  }

  /**
   * Clusters log messages into structural patterns by masking parameter values (UUIDs, numbers, strings).
   */
  public clusterLogPatterns(logs: LogEntry[]): LogPatternCluster[] {
    const clusters: Record<string, LogPatternCluster> = {};

    logs.forEach(log => {
      const signature = this.generatePatternSignature(log.message);
      if (!clusters[signature]) {
        clusters[signature] = {
          clusterId: `cluster_${Math.abs(this.hashCode(signature))}`,
          patternSignature: signature,
          occurrences: 0,
          firstSeen: log.timestamp,
          lastSeen: log.timestamp,
          sampleMessages: [],
          level: log.level,
          associatedSources: []
        };
      }

      const cluster = clusters[signature];
      cluster.occurrences += 1;
      if (log.timestamp < cluster.firstSeen) cluster.firstSeen = log.timestamp;
      if (log.timestamp > cluster.lastSeen) cluster.lastSeen = log.timestamp;

      if (cluster.sampleMessages.length < 3 && !cluster.sampleMessages.includes(log.message)) {
        cluster.sampleMessages.push(log.message);
      }

      if (!cluster.associatedSources.includes(log.source)) {
        cluster.associatedSources.push(log.source);
      }
    });

    return Object.values(clusters).sort((a, b) => b.occurrences - a.occurrences);
  }

  /**
   * Generates a comprehensive analytical diagnostic report from log data.
   */
  public generateReport(logs: LogEntry[]): DiagnosticAnalysisReport {
    const sortedLogs = [...logs].sort((a, b) => a.timestamp.getTime() - b.timestamp.getTime());
    const startTime = sortedLogs.length > 0 ? sortedLogs[0].timestamp : new Date();
    const endTime = sortedLogs.length > 0 ? sortedLogs[sortedLogs.length - 1].timestamp : new Date();

    const countByLevel: Record<LogLevel, number> = {
      debug: 0,
      info: 0,
      warn: 0,
      error: 0,
      fatal: 0
    };

    const sourceErrorCount: Record<string, number> = {};
    const latencies: number[] = [];
    const uniqueUsers = new Set<string>();
    const uniqueIPs = new Set<string>();

    logs.forEach(log => {
      countByLevel[log.level] = (countByLevel[log.level] || 0) + 1;

      if (log.level === 'error' || log.level === 'fatal') {
        sourceErrorCount[log.source] = (sourceErrorCount[log.source] || 0) + 1;
      }

      if (typeof log.durationMs === 'number') {
        latencies.push(log.durationMs);
      }

      if (log.userId) uniqueUsers.add(log.userId);
      if (log.ip) uniqueIPs.add(log.ip);
    });

    latencies.sort((a, b) => a - b);
    const avgLatency = latencies.length > 0 ? latencies.reduce((a, b) => a + b, 0) / latencies.length : 0;
    const p95Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.95)] || 0 : 0;
    const p99Latency = latencies.length > 0 ? latencies[Math.floor(latencies.length * 0.99)] || 0 : 0;

    const totalLogs = logs.length;
    const totalErrors = countByLevel.error + countByLevel.fatal;
    const errorRate = totalLogs > 0 ? (totalErrors / totalLogs) * 100 : 0;

    const topErrorSources = Object.entries(sourceErrorCount)
      .map(([source, count]) => ({ source, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const durationMinutes = Math.max(1, (endTime.getTime() - startTime.getTime()) / 60000);
    const throughputPerMinute = totalLogs / durationMinutes;

    // Detect Anomalies
    const errorSpikes = this.detectErrorSpikes(logs);
    const latencyAnomalies = this.detectLatencyAnomalies(logs);
    const securityAnomalies = this.detectSecurityThreats(logs);
    const allAnomalies = [...errorSpikes, ...latencyAnomalies, ...securityAnomalies];

    // Cluster Patterns
    const patterns = this.clusterLogPatterns(logs);

    // Calculate Health Score (100 is best, decreases with high error rate & critical anomalies)
    let healthScore = 100;
    healthScore -= Math.min(50, errorRate * 5); // Subtract up to 50 based on error rate
    healthScore -= allAnomalies.reduce((acc, anomaly) => {
      if (anomaly.severity === 'critical') return acc + 15;
      if (anomaly.severity === 'high') return acc + 10;
      if (anomaly.severity === 'medium') return acc + 5;
      return acc + 2;
    }, 0);

    healthScore = Math.max(0, Math.min(100, Math.round(healthScore)));

    return {
      reportId: `report_${Date.now()}`,
      generatedAt: new Date(),
      timeRange: { start: startTime, end: endTime },
      stats: {
        totalLogs,
        countByLevel,
        errorRate: Number(errorRate.toFixed(2)),
        averageLatencyMs: Math.round(avgLatency),
        p95LatencyMs: p95Latency,
        p99LatencyMs: p99Latency,
        throughputPerMinute: Number(throughputPerMinute.toFixed(1)),
        topErrorSources,
        uniqueUsers: uniqueUsers.size,
        uniqueIPs: uniqueIPs.size
      },
      anomalies: allAnomalies,
      patterns: patterns.slice(0, 20), // Top 20 common patterns
      healthScore
    };
  }

  /**
   * Generates an Express Router pre-configured with all diagnostic endpoints.
   */
  public getRouter(): Router {
    const router = Router();

    // Ingest raw logs
    router.post('/ingest', (req: Request, res: Response, next: NextFunction) => {
      try {
        const { logs, source } = req.body;
        if (!logs) {
          res.status(400).json({ error: 'Missing "logs" field in request body.' });
          return;
        }
        const parsed = this.ingestLogs(logs, source || 'api-ingest');
        res.status(201).json({
          success: true,
          count: parsed.length,
          message: `Successfully ingested ${parsed.length} log entries.`
        });
      } catch (err) {
        next(err);
      }
    });

    // Query stored logs with filters
    router.get('/query', (req: Request, res: Response, next: NextFunction) => {
      try {
        const { startDate, endDate, levels, sources, traceId, userId, search, limit, offset } = req.query;
        
        const options: LogFilterOptions = {
          startDate: startDate ? new Date(startDate as string) : undefined,
          endDate: endDate ? new Date(endDate as string) : undefined,
          levels: levels ? (levels as string).split(',') as LogLevel[] : undefined,
          sources: sources ? (sources as string).split(',') : undefined,
          traceId: traceId as string,
          userId: userId as string,
          searchPattern: search as string,
          limit: limit ? parseInt(limit as string, 10) : 100,
          offset: offset ? parseInt(offset as string, 10) : 0
        };

        const filtered = this.filterLogs(this.logBuffer, options);
        res.json({
          total: this.logBuffer.length,
          filteredCount: filtered.length,
          logs: filtered
        });
      } catch (err) {
        next(err);
      }
    });

    // Generate diagnostic report
    router.get('/report', (_req: Request, res: Response, next: NextFunction) => {
      try {
        const report = this.generateReport(this.logBuffer);
        res.json(report);
      } catch (err) {
        next(err);
      }
    });

    // Clear stored logs
    router.delete('/clear', (_req: Request, res: Response, next: NextFunction) => {
      try {
        this.clearStoredLogs();
        res.json({ success: true, message: 'In-memory log buffer cleared.' });
      } catch (err) {
        next(err);
      }
    });

    // Get anomalies directly
    router.get('/anomalies', (_req: Request, res: Response, next: NextFunction) => {
      try {
        const errorSpikes = this.detectErrorSpikes(this.logBuffer);
        const latencyAnomalies = this.detectLatencyAnomalies(this.logBuffer);
        const securityAnomalies = this.detectSecurityThreats(this.logBuffer);
        res.json({
          errorSpikes,
          latencyAnomalies,
          securityAnomalies,
          total: errorSpikes.length + latencyAnomalies.length + securityAnomalies.length
        });
      } catch (err) {
        next(err);
      }
    });

    // Get clustered patterns
    router.get('/patterns', (_req: Request, res: Response, next: NextFunction) => {
      try {
        const patterns = this.clusterLogPatterns(this.logBuffer);
        res.json({ patterns });
      } catch (err) {
        next(err);
      }
    });

    return router;
  }

  // --- Helpers ---

  private normalizeLogLevel(levelStr: string): LogLevel {
    const clean = levelStr.toLowerCase().trim();
    if (['err', 'error', 'severe', 'failed'].includes(clean)) return 'error';
    if (['fatal', 'critical', 'emerg', 'alert'].includes(clean)) return 'fatal';
    if (['warn', 'warning'].includes(clean)) return 'warn';
    if (['debug', 'trace', 'verbose'].includes(clean)) return 'debug';
    return 'info';
  }

  private inferLogLevelFromMessage(msg: string): LogLevel {
    const lower = msg.toLowerCase();
    if (lower.includes('fatal') || lower.includes('panic') || lower.includes('uncaught exception')) return 'fatal';
    if (lower.includes('error') || lower.includes('fail') || lower.includes('exception')) return 'error';
    if (lower.includes('warn') || lower.includes('deprecated')) return 'warn';
    if (lower.includes('debug') || lower.includes('trace')) return 'debug';
    return 'info';
  }

  private safeParseDate(dateStr: string): Date {
    const d = new Date(dateStr);
    return isNaN(d.getTime()) ? new Date() : d;
  }

  private generatePatternSignature(message: string): string {
    return message
      // Replace UUIDs
      .replace(/[0-9a-fA-F]{8}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{4}-[0-9a-fA-F]{12}/g, '<UUID>')
      // Replace IPv4 Addresses
      .replace(/\b\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}\b/g, '<IP>')
      // Replace ISO timestamps
      .replace(/\d{4}-\d{2}-\d{2}T\d{2}:\d{2}:\d{2}(\.\d+)?Z?/g, '<TIMESTAMP>')
      // Replace numbers/IDs
      .replace(/\b\d+\b/g, '<NUM>')
      // Replace quoted dynamic strings
      .replace(/"[^"]*"/g, '"<STR>"')
      .replace(/'[^']*'/g, "'<STR>'");
  }

  private hashCode(str: string): number {
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      hash = (hash << 5) - hash + str.charCodeAt(i);
      hash |= 0;
    }
    return hash;
  }
}

export const logAnalyzer = new LogAnalyzer();
export default logAnalyzer;