import { Request, Response, Router } from 'express';
import { logger } from '../utils/logger';
import { db } from '../../server/utils/db';
import { requireDiagnosticUser as DiagnosticAuth } from "./middleware/DiagnosticAuth.js";

export interface TelemetryPayload {
  componentId: string;
  timestamp: number;
  metricType: 'latency' | 'error' | 'usage' | 'health';
  value: number | string | object;
  metadata?: Record<string, any>;
}

export class TelemetryCollector {
  private static instance: TelemetryCollector;
  private buffer: TelemetryPayload[] = [];
  private readonly MAX_BUFFER_SIZE = 50;

  private constructor() {}

  public static getInstance(): TelemetryCollector {
    if (!TelemetryCollector.instance) {
      TelemetryCollector.instance = new TelemetryCollector();
    }
    return TelemetryCollector.instance;
  }

  public async collect(data: TelemetryPayload): Promise<void> {
    try {
      this.buffer.push({ ...data, timestamp: Date.now() });
      
      if (this.buffer.length >= this.MAX_BUFFER_SIZE) {
        await this.flush();
      }
    } catch (error) {
      logger.error('TelemetryCollector', 'Telemetry collection failed', { error });
    }
  }

  public async record(dataOrMetric: any, value?: any, metadata?: any): Promise<void> {
    if (typeof dataOrMetric === 'string') {
      return this.collect({
        componentId: 'system',
        timestamp: Date.now(),
        metricType: 'usage',
        value: value,
        metadata: metadata,
      });
    }
    return this.collect(dataOrMetric);
  }

  public async ingest(data: TelemetryPayload | TelemetryPayload[]): Promise<void> {
    if (Array.isArray(data)) {
      for (const item of data) {
        await this.collect(item);
      }
    } else {
      await this.collect(data);
    }
  }

  public async getSummary(componentId?: string): Promise<any> {
    const logs = await this.getDiagnostics(componentId || 'system');
    return {
      totalEntries: logs.length,
      bufferSize: this.buffer.length,
      logs,
    };
  }

  public async flush(): Promise<void> {
    if (this.buffer.length === 0) return;

    const batch = [...this.buffer];
    this.buffer = [];

    try {
      await (db as any).collection('telemetry_logs').add({
        entries: batch,
        processedAt: new Date().toISOString(),
      });
      logger.info('TelemetryCollector', `Telemetry batch flushed: ${batch.length} entries`, { count: batch.length });
    } catch (error) {
      logger.error('TelemetryCollector', 'Failed to flush telemetry to database', { error });
      this.buffer = [...batch, ...this.buffer];
    }
  }

  public async getDiagnostics(componentId: string, limit: number = 100): Promise<any[]> {
    try {
      const snapshot = await (db as any).collection('telemetry_logs')
        .where('entries.componentId', '==', componentId)
        .orderBy('processedAt', 'desc')
        .limit(limit)
        .get();
        
      return snapshot.docs.map((doc: any) => doc.data());
    } catch (error) {
      logger.error('TelemetryCollector', 'Diagnostic retrieval failed', { componentId, error });
      return [];
    }
  }

  public async clearOldLogs(days: number = 30): Promise<void> {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    
    try {
      const oldLogs = await (db as any).collection('telemetry_logs')
        .where('processedAt', '<', cutoff.toISOString())
        .get();
        
      const batch = (db as any).batch();
      oldLogs.docs.forEach((doc: any) => batch.delete(doc.ref));
      await batch.commit();
    } catch (error) {
      logger.error('TelemetryCollector', 'Telemetry cleanup failed', { error });
    }
  }

  public getRouter(): Router {
    const router = Router();
    router.use(DiagnosticAuth);

    router.post('/collect', async (req: Request, res: Response) => {
      try {
        await this.collect(req.body);
        res.status(202).json({ status: 'queued' });
      } catch (error) {
        res.status(500).json({ error: 'Failed to collect telemetry' });
      }
    });

    router.get('/diagnostics/:componentId', async (req: Request, res: Response) => {
      try {
        const data = await this.getDiagnostics(String(req.params.componentId), parseInt(String(req.query.limit ?? '100'), 10) || 100);
        res.json(data);
      } catch (error) {
        res.status(500).json({ error: 'Failed to retrieve diagnostics' });
      }
    });

    router.post('/flush', async (req: Request, res: Response) => {
      await this.flush();
      res.status(200).json({ status: 'flushed' });
    });

    return router;
  }
}

export const telemetry = TelemetryCollector.getInstance();