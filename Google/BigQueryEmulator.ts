import { EventEmitter } from 'events';
import { pubSub } from './PubSubLocal';
import { monitor } from './MonitoringService';
import { dbBridge } from './DatabaseBridge';
import { cloudReplacementEngine } from './CloudReplacementEngine';

/**
 * BigQueryEmulator
 * A local, high-performance analytical query engine designed to replace 
 * Google BigQuery by processing large datasets in-memory or via local indexed storage.
 */

export interface QueryOptions {
  datasetId: string;
  query: string;
  params?: Record<string, any>;
  jobId?: string;
}

export interface QueryResult {
  rows: any[];
  metadata: {
    executionTimeMs: number;
    rowCount: number;
    schema: string[];
    jobId?: string;
  };
}

export interface QueryJob {
  jobId: string;
  status: 'PENDING' | 'RUNNING' | 'DONE' | 'FAILED';
  datasetId: string;
  query: string;
  params?: Record<string, any>;
  result?: QueryResult;
  error?: string;
  createdAt: number;
  completedAt?: number;
}

export class BigQueryEmulator extends EventEmitter {
  private static instance: BigQueryEmulator;
  private dataStore: Map<string, any[]> = new Map();
  private jobs: Map<string, QueryJob> = new Map();

  private constructor() {
    super();
  }

  public static getInstance(): BigQueryEmulator {
    if (!BigQueryEmulator.instance) {
      BigQueryEmulator.instance = new BigQueryEmulator();
    }
    return BigQueryEmulator.instance;
  }

  public async loadDataset(datasetId: string, data: any[]): Promise<void> {
    this.dataStore.set(datasetId, data);
    
    // Sync to DatabaseBridge for persistence
    try {
      for (let i = 0; i < data.length; i++) {
        const row = data[i];
        const docId = row.id || `row_${i}_${Date.now()}`;
        await dbBridge.setDoc(datasetId, docId, row);
      }
    } catch (error: any) {
      monitor.log('warn', 'BigQueryEmulator', `Failed to persist dataset ${datasetId} to DatabaseBridge`, { error: error.message });
    }

    this.emit('datasetLoaded', { datasetId, count: data.length });
    pubSub.publish('analytics.dataset_loaded', { datasetId, count: data.length });
    monitor.log('info', 'BigQueryEmulator', `Dataset loaded: ${datasetId} with ${data.length} rows`);
  }

  public async executeQuery(options: QueryOptions): Promise<QueryResult> {
    const startTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    
    let data = this.dataStore.get(options.datasetId);
    
    // Fallback: Attempt to load from DatabaseBridge if not in memory
    if (!data) {
      try {
        const snapshot = await dbBridge.getDocs(options.datasetId);
        if (snapshot && snapshot.docs && !snapshot.empty) {
          data = snapshot.docs.map((doc: any) => doc.data());
          this.dataStore.set(options.datasetId, data);
        }
      } catch (error: any) {
        monitor.log('warn', 'BigQueryEmulator', `Failed to load dataset ${options.datasetId} from DatabaseBridge`, { error: error.message });
      }
    }

    const activeData = data || [];
    const result = this.processQuery(activeData, options.query, options.params);
    const endTime = typeof performance !== 'undefined' ? performance.now() : Date.now();
    const executionTimeMs = endTime - startTime;

    // Update CloudReplacementEngine metrics for analytics
    try {
      const analyticsResource = cloudReplacementEngine.getResourceStatus().find(r => r.service === 'analytics');
      if (analyticsResource) {
        analyticsResource.metrics.requestCount++;
        analyticsResource.metrics.bytesProcessed += JSON.stringify(result).length;
        analyticsResource.metrics.latencyMs = (analyticsResource.metrics.latencyMs * 9 + executionTimeMs) / 10;
      }
    } catch (error: any) {
      // Ignore metrics update failures
    }

    pubSub.publish('analytics.query_executed', { 
      datasetId: options.datasetId, 
      query: options.query, 
      rowCount: result.length,
      executionTimeMs 
    });

    monitor.log('info', 'BigQueryEmulator', `Executed query on ${options.datasetId}`, { 
      query: options.query, 
      executionTimeMs,
      rowCount: result.length 
    });

    return {
      rows: result,
      metadata: {
        executionTimeMs,
        rowCount: result.length,
        schema: result.length > 0 ? Object.keys(result[0]) : [],
        jobId: options.jobId
      }
    };
  }

  public async createQueryJob(options: QueryOptions): Promise<QueryJob> {
    const jobId = options.jobId || `job_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
    const job: QueryJob = {
      jobId,
      status: 'RUNNING',
      datasetId: options.datasetId,
      query: options.query,
      params: options.params,
      createdAt: Date.now()
    };

    this.jobs.set(jobId, job);

    setTimeout(async () => {
      try {
        const queryResult = await this.executeQuery({ ...options, jobId });
        job.status = 'DONE';
        job.result = queryResult;
        job.completedAt = Date.now();
      } catch (err: any) {
        job.status = 'FAILED';
        job.error = err.message;
        job.completedAt = Date.now();
      }
      this.jobs.set(jobId, job);
      this.emit('jobStatusChanged', job);
    }, 0);

    return job;
  }

  public getJob(jobId: string): QueryJob | undefined {
    return this.jobs.get(jobId);
  }

  private processQuery(data: any[], query: string, params?: Record<string, any>): any[] {
    let result = [...data];

    let processedQuery = query;
    if (params) {
      Object.entries(params).forEach(([key, val]) => {
        const regex = new RegExp(`@${key}|:${key}`, 'g');
        const formattedVal = typeof val === 'string' ? `'${val}'` : String(val);
        processedQuery = processedQuery.replace(regex, formattedVal);
      });
    }

    // WHERE clause
    const whereMatch = processedQuery.match(/WHERE\s+(.*?)(?=\s+(GROUP|ORDER|LIMIT|OFFSET)|$)/i);
    if (whereMatch && whereMatch[1]) {
      const conditionStr = whereMatch[1].trim();
      result = result.filter(row => this.evaluateCondition(row, conditionStr));
    }

    // ORDER BY clause
    const orderMatch = processedQuery.match(/ORDER\s+BY\s+([a-zA-Z0-9_.]+)(?:\s+(ASC|DESC))?/i);
    if (orderMatch) {
      const field = orderMatch[1];
      const direction = (orderMatch[2] || 'ASC').toUpperCase();
      result.sort((a, b) => {
        const valA = a[field] ?? '';
        const valB = b[field] ?? '';
        if (valA < valB) return direction === 'ASC' ? -1 : 1;
        if (valA > valB) return direction === 'ASC' ? 1 : -1;
        return 0;
      });
    }

    // OFFSET and LIMIT
    const offsetMatch = processedQuery.match(/OFFSET\s+(\d+)/i);
    const limitMatch = processedQuery.match(/LIMIT\s+(\d+)/i);

    const offset = offsetMatch ? parseInt(offsetMatch[1], 10) : 0;
    const limit = limitMatch ? parseInt(limitMatch[1], 10) : undefined;

    if (offset > 0) {
      result = result.slice(offset);
    }
    if (limit !== undefined) {
      result = result.slice(0, limit);
    }

    // SELECT projection / COUNT(*)
    const selectMatch = processedQuery.match(/SELECT\s+(.*?)\s+FROM/i);
    if (selectMatch && selectMatch[1]) {
      const columnsClause = selectMatch[1].trim();
      if (columnsClause.toUpperCase() === 'COUNT(*)') {
        return [{ count: result.length }];
      } else if (columnsClause !== '*') {
        const cols = columnsClause.split(',').map(c => c.trim());
        result = result.map(row => {
          const projected: Record<string, any> = {};
          cols.forEach(col => {
            if (row.hasOwnProperty(col)) {
              projected[col] = row[col];
            }
          });
          return projected;
        });
      }
    }

    return result;
  }

  private evaluateCondition(row: any, conditionStr: string): boolean {
    const eqMatch = conditionStr.match(/([a-zA-Z0-9_.]+)\s*(=|!=|>|<|>=|<=|LIKE)\s*['"]?(.*?)['"]?$/i);
    if (eqMatch) {
      const [, field, op, rawVal] = eqMatch;
      const cleanVal = rawVal.replace(/['"]/g, '').trim();
      const rowVal = row[field];

      if (rowVal === undefined) return false;

      switch (op.toUpperCase()) {
        case '=':
          return String(rowVal) === cleanVal;
        case '!=':
          return String(rowVal) !== cleanVal;
        case '>':
          return Number(rowVal) > Number(cleanVal);
        case '<':
          return Number(rowVal) < Number(cleanVal);
        case '>=':
          return Number(rowVal) >= Number(cleanVal);
        case '<=':
          return Number(rowVal) <= Number(cleanVal);
        case 'LIKE':
          const pattern = cleanVal.replace(/%/g, '.*');
          return new RegExp(`^${pattern}$`, 'i').test(String(rowVal));
        default:
          return true;
      }
    }
    return true;
  }

  public async streamInsert(datasetId: string, row: any): Promise<void> {
    const current = this.dataStore.get(datasetId) || [];
    current.push(row);
    this.dataStore.set(datasetId, current);

    // Persist stream insert to DatabaseBridge
    try {
      const docId = row.id || `row_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;
      await dbBridge.setDoc(datasetId, docId, row);
    } catch (error: any) {
      monitor.log('warn', 'BigQueryEmulator', `Failed to persist stream insert to DatabaseBridge for ${datasetId}`, { error: error.message });
    }

    this.emit('dataInserted', { datasetId });
    pubSub.publish('analytics.data_inserted', { datasetId, row });
    monitor.log('info', 'BigQueryEmulator', `Stream inserted row into ${datasetId}`);
  }

  public listDatasets(): string[] {
    return Array.from(this.dataStore.keys());
  }

  public getDatasetStats(datasetId: string): { datasetId: string; rowCount: number; memoryBytes: number } | null {
    const data = this.dataStore.get(datasetId);
    if (!data) return null;
    const jsonStr = JSON.stringify(data);
    return {
      datasetId,
      rowCount: data.length,
      memoryBytes: jsonStr.length
    };
  }

  public clearDataset(datasetId: string): void {
    this.dataStore.delete(datasetId);
    this.emit('datasetCleared', { datasetId });
    pubSub.publish('analytics.dataset_cleared', { datasetId });
  }
}

export const bqEmulator = BigQueryEmulator.getInstance();