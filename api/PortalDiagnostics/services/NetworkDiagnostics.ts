import { logger } from '../../utils/logger';
import { Router, Request, Response } from 'express';
import * as dns from 'dns';
import * as tls from 'tls';
import { promisify } from 'util';

const resolveAny = promisify(dns.resolveAny);

export interface EndpointConfig {
  id: string;
  name: string;
  url: string;
  method?: 'GET' | 'POST' | 'HEAD' | 'OPTIONS';
  timeoutMs?: number;
  headers?: Record<string, string>;
  expectedStatus?: number[];
  category: 'internal' | 'external' | 'sovereign' | 'banking' | 'cloud';
  retries?: number;
}

export interface DiagnosticResult {
  id: string;
  name: string;
  url: string;
  category: 'internal' | 'external' | 'sovereign' | 'banking' | 'cloud';
  timestamp: string;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNREACHABLE';
  statusCode?: number;
  responseTimeMs: number;
  attempts: number;
  error?: string;
  headers?: Record<string, string>;
  sslValid?: boolean;
  sslRemainingDays?: number;
}

export interface NetworkDiagnosticsSummary {
  timestamp: string;
  totalEndpoints: number;
  healthyCount: number;
  degradedCount: number;
  downCount: number;
  averageResponseTimeMs: number;
  overallStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL';
  results: DiagnosticResult[];
  categoryBreakdown: Record<string, { healthy: number; total: number; avgLatencyMs: number }>;
}

export interface LatencyHistoryPoint {
  timestamp: string;
  responseTimeMs: number;
  status: 'HEALTHY' | 'DEGRADED' | 'DOWN' | 'UNREACHABLE';
}

export interface DNSDiagnosticResult {
  host: string;
  resolved: boolean;
  records?: any[];
  error?: string;
  lookupTimeMs: number;
}

export class NetworkDiagnosticsService {
  private static instance: NetworkDiagnosticsService;
  private endpoints: Map<string, EndpointConfig> = new Map();
  private defaultTimeoutMs: number = 5000;
  private latencyHistory: Map<string, LatencyHistoryPoint[]> = new Map();
  private schedulerInterval: NodeJS.Timeout | null = null;

  private constructor() {
    this.registerDefaultEndpoints();
    // Start auto-probing by default to keep history populated
    this.startAutoProbing(120000); // Every 2 minutes
  }

  public static getInstance(): NetworkDiagnosticsService {
    if (!NetworkDiagnosticsService.instance) {
      NetworkDiagnosticsService.instance = new NetworkDiagnosticsService();
    }
    return NetworkDiagnosticsService.instance;
  }

  private registerDefaultEndpoints(): void {
    const defaultServices: EndpointConfig[] = [
      {
        id: 'alpaca-api',
        name: 'Alpaca Brokerage API',
        url: 'https://paper-api.alpaca.markets/v2/clock',
        method: 'GET',
        category: 'banking',
        timeoutMs: 4000,
        expectedStatus: [200, 401],
      },
      {
        id: 'citi-gateway',
        name: 'CitiConnect Treasury Gateway',
        url: 'https://api.citiconnect.citi.com/gcb/api/v1/health',
        method: 'GET',
        category: 'banking',
        timeoutMs: 5000,
        expectedStatus: [200, 401, 403],
      },
      {
        id: 'stripe-api',
        name: 'Stripe Treasury Interface',
        url: 'https://api.stripe.com/v1/healthcheck',
        method: 'GET',
        category: 'external',
        timeoutMs: 3000,
        expectedStatus: [200, 401],
      },
      {
        id: 'azure-gov',
        name: 'Azure Government Compliance Portal',
        url: 'https://management.usgovcloudapi.net',
        method: 'GET',
        category: 'cloud',
        timeoutMs: 5000,
        expectedStatus: [200, 401, 403],
      },
      {
        id: 'plaid-api',
        name: 'Plaid OpenBanking API',
        url: 'https://sandbox.plaid.com',
        method: 'POST',
        category: 'banking',
        timeoutMs: 4000,
        expectedStatus: [200, 400, 404],
      },
      {
        id: 'modern-treasury',
        name: 'Modern Treasury Ledger Hub',
        url: 'https://app.moderntreasury.com/api/ping',
        method: 'GET',
        category: 'banking',
        timeoutMs: 4000,
        expectedStatus: [200, 401],
      },
      {
        id: 'internal-gateway',
        name: 'Internal Sovereign API Gateway',
        url: 'http://localhost:8080/health',
        method: 'GET',
        category: 'internal',
        timeoutMs: 2000,
        expectedStatus: [200],
      },
    ];

    for (const service of defaultServices) {
      this.endpoints.set(service.id, service);
    }
  }

  public registerEndpoint(config: EndpointConfig): void {
    this.endpoints.set(config.id, config);
  }

  public unregisterEndpoint(id: string): boolean {
    return this.endpoints.delete(id);
  }

  public getEndpoints(): EndpointConfig[] {
    return Array.from(this.endpoints.values());
  }

  public async checkEndpoint(endpointId: string): Promise<DiagnosticResult> {
    const config = this.endpoints.get(endpointId);
    if (!config) {
      throw new Error(`Endpoint configuration with ID '${endpointId}' not found.`);
    }

    return this.probeEndpoint(config);
  }

  public async checkSSL(host: string, port: number = 443): Promise<{ valid: boolean; remainingDays?: number; error?: string }> {
    return new Promise((resolve) => {
      try {
        let cleanHost = host.replace(/^(https?:\/\/)?(www\.)?/, '');
        cleanHost = cleanHost.split('/')[0].split(':')[0];

        // If it's localhost or IP without SSL, skip
        if (cleanHost === 'localhost' || cleanHost === '127.0.0.1') {
          resolve({ valid: false, error: 'Localhost does not support public SSL verification' });
          return;
        }

        const socket = tls.connect({
          host: cleanHost,
          port,
          servername: cleanHost,
          rejectUnauthorized: false,
        }, () => {
          const cert = socket.getPeerCertificate();
          if (!cert || !cert.valid_to) {
            resolve({ valid: false, error: 'No certificate returned' });
            socket.destroy();
            return;
          }

          const validTo = new Date(cert.valid_to);
          const now = new Date();
          const remainingMs = validTo.getTime() - now.getTime();
          const remainingDays = Math.ceil(remainingMs / (1000 * 60 * 60 * 24));
          const authorized = socket.authorized;

          resolve({
            valid: authorized && remainingDays > 0,
            remainingDays,
          });
          socket.destroy();
        });

        socket.on('error', (err) => {
          resolve({ valid: false, error: err.message });
        });

        socket.setTimeout(5000, () => {
          resolve({ valid: false, error: 'SSL handshake timeout' });
          socket.destroy();
        });
      } catch (err: any) {
        resolve({ valid: false, error: err.message });
      }
    });
  }

  public async probeEndpoint(config: EndpointConfig): Promise<DiagnosticResult> {
    const retries = config.retries ?? 1;
    const timeout = config.timeoutMs ?? this.defaultTimeoutMs;
    let attempts = 0;
    let lastError: Error | null = null;
    let statusCode: number | undefined;
    let headers: Record<string, string> = {};

    while (attempts < retries) {
      attempts++;
      const startTime = performance.now();

      try {
        const controller = new AbortController();
        const timer = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(config.url, {
          method: config.method || 'GET',
          headers: {
            'User-Agent': 'Oko-NetworkDiagnostics/1.0',
            ...config.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timer);
        const endTime = performance.now();
        const responseTimeMs = Math.round(endTime - startTime);
        statusCode = response.status;

        response.headers.forEach((value, key) => {
          headers[key] = value;
        });

        const expected = config.expectedStatus || [200];
        const isExpectedStatus = expected.includes(response.status) || (response.status >= 200 && response.status < 300);

        let status: 'HEALTHY' | 'DEGRADED' | 'DOWN' = 'HEALTHY';
        if (!isExpectedStatus && response.status >= 500) {
          status = 'DOWN';
        } else if (!isExpectedStatus || responseTimeMs > 2500) {
          status = 'DEGRADED';
        }

        let sslValid = config.url.startsWith('https://');
        let sslRemainingDays: number | undefined;

        if (sslValid) {
          const sslCheck = await this.checkSSL(config.url);
          sslValid = sslCheck.valid;
          sslRemainingDays = sslCheck.remainingDays;
        }

        const result: DiagnosticResult = {
          id: config.id,
          name: config.name,
          url: config.url,
          category: config.category,
          timestamp: new Date().toISOString(),
          status,
          statusCode: response.status,
          responseTimeMs,
          attempts,
          headers,
          sslValid,
          sslRemainingDays,
        };

        this.recordHistory(config.id, {
          timestamp: result.timestamp,
          responseTimeMs: result.responseTimeMs,
          status: result.status,
        });

        return result;
      } catch (err: any) {
        lastError = err;
        if (attempts < retries) {
          await new Promise((res) => setTimeout(res, 300));
        }
      }
    }

    const result: DiagnosticResult = {
      id: config.id,
      name: config.name,
      url: config.url,
      category: config.category,
      timestamp: new Date().toISOString(),
      status: 'UNREACHABLE',
      statusCode,
      responseTimeMs: -1,
      attempts,
      error: lastError ? lastError.message : 'Connection failed',
      sslValid: config.url.startsWith('https://'),
    };

    this.recordHistory(config.id, {
      timestamp: result.timestamp,
      responseTimeMs: result.responseTimeMs,
      status: result.status,
    });

    return result;
  }

  public async diagnoseDNS(host: string): Promise<DNSDiagnosticResult> {
    const startTime = performance.now();
    try {
      let cleanHost = host.replace(/^(https?:\/\/)?(www\.)?/, '');
      cleanHost = cleanHost.split('/')[0].split(':')[0];

      const records = await resolveAny(cleanHost);
      const lookupTimeMs = Math.round(performance.now() - startTime);
      return {
        host: cleanHost,
        resolved: true,
        records,
        lookupTimeMs,
      };
    } catch (error: any) {
      const lookupTimeMs = Math.round(performance.now() - startTime);
      return {
        host,
        resolved: false,
        error: error.message,
        lookupTimeMs,
      };
    }
  }

  private recordHistory(endpointId: string, point: LatencyHistoryPoint): void {
    if (!this.latencyHistory.has(endpointId)) {
      this.latencyHistory.set(endpointId, []);
    }
    const history = this.latencyHistory.get(endpointId)!;
    history.push(point);
    if (history.length > 50) {
      history.shift();
    }
  }

  public getLatencyHistory(): Record<string, LatencyHistoryPoint[]> {
    const historyObj: Record<string, LatencyHistoryPoint[]> = {};
    this.latencyHistory.forEach((val, key) => {
      historyObj[key] = val;
    });
    return historyObj;
  }

  public startAutoProbing(intervalMs: number = 60000): void {
    if (this.schedulerInterval) {
      this.stopAutoProbing();
    }
    logger.info('NetworkDiagnostics', `Starting Network Diagnostics auto-probing every ${intervalMs}ms`);
    this.schedulerInterval = setInterval(async () => {
      try {
        await this.runFullDiagnostics();
      } catch (error: any) {
        logger.error('NetworkDiagnostics', `Error in auto-probing: ${error.message}`, error);
      }
    }, intervalMs);
  }

  public stopAutoProbing(): void {
    if (this.schedulerInterval) {
      clearInterval(this.schedulerInterval);
      this.schedulerInterval = null;
      logger.info('NetworkDiagnostics', 'Stopped Network Diagnostics auto-probing.');
    }
  }

  public async runFullDiagnostics(): Promise<NetworkDiagnosticsSummary> {
    const endpoints = Array.from(this.endpoints.values());
    const results = await Promise.all(endpoints.map((ep) => this.probeEndpoint(ep)));

    let healthyCount = 0;
    let degradedCount = 0;
    let downCount = 0;
    let totalLatency = 0;
    let validLatencyCount = 0;

    const categoryBreakdown: Record<string, { healthy: number; total: number; avgLatencyMs: number }> = {};

    for (const res of results) {
      if (!categoryBreakdown[res.category]) {
        categoryBreakdown[res.category] = { healthy: 0, total: 0, avgLatencyMs: 0 };
      }

      categoryBreakdown[res.category].total += 1;

      if (res.status === 'HEALTHY') {
        healthyCount++;
        categoryBreakdown[res.category].healthy += 1;
      } else if (res.status === 'DEGRADED') {
        degradedCount++;
      } else {
        downCount++;
      }

      if (res.responseTimeMs >= 0) {
        totalLatency += res.responseTimeMs;
        validLatencyCount++;
      }
    }

    const averageResponseTimeMs = validLatencyCount > 0 ? Math.round(totalLatency / validLatencyCount) : 0;

    let overallStatus: 'OPTIMAL' | 'DEGRADED' | 'CRITICAL' = 'OPTIMAL';
    if (downCount > 0 || degradedCount >= Math.ceil(results.length / 3)) {
      overallStatus = downCount > 2 ? 'CRITICAL' : 'DEGRADED';
    }

    const summary: NetworkDiagnosticsSummary = {
      timestamp: new Date().toISOString(),
      totalEndpoints: results.length,
      healthyCount,
      degradedCount,
      downCount,
      averageResponseTimeMs,
      overallStatus,
      results,
      categoryBreakdown,
    };

    logger.info('NetworkDiagnostics', `Network Diagnostics completed. Status: ${overallStatus}. Healthy: ${healthyCount}/${results.length}`);
    return summary;
  }

  public getRouter(): Router {
    const router = Router();

    router.get('/', async (req: Request, res: Response) => {
      try {
        const summary = await this.runFullDiagnostics();
        res.json({ success: true, data: summary });
      } catch (error: any) {
        logger.error('NetworkDiagnostics', `API Error in full diagnostics: ${error.message}`, error);
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.get('/endpoints', (req: Request, res: Response) => {
      try {
        const endpoints = this.getEndpoints();
        res.json({ success: true, data: endpoints });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.post('/endpoints', (req: Request, res: Response) => {
      try {
        const config: EndpointConfig = req.body;
        if (!config.id || !config.name || !config.url || !config.category) {
          return res.status(400).json({ success: false, error: 'Missing required fields: id, name, url, category' });
        }
        this.registerEndpoint(config);
        res.json({ success: true, message: `Endpoint '${config.id}' registered successfully.` });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.delete('/endpoints/:id', (req: Request, res: Response) => {
      try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const deleted = this.unregisterEndpoint(id);
        if (deleted) {
          res.json({ success: true, message: `Endpoint '${id}' unregistered successfully.` });
        } else {
          res.status(404).json({ success: false, error: `Endpoint '${id}' not found.` });
        }
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.get('/endpoints/:id/check', async (req: Request, res: Response) => {
      try {
        const id = Array.isArray(req.params.id) ? req.params.id[0] : req.params.id;
        const result = await this.checkEndpoint(id);
        res.json({ success: true, data: result });
      } catch (error: any) {
        res.status(404).json({ success: false, error: error.message });
      }
    });

    router.post('/probe', async (req: Request, res: Response) => {
      try {
        const config: EndpointConfig = req.body;
        if (!config.url) {
          return res.status(400).json({ success: false, error: 'URL is required for custom probe.' });
        }
        const result = await this.probeEndpoint({
          id: config.id || 'custom-probe',
          name: config.name || 'Custom Probe',
          url: config.url,
          method: config.method || 'GET',
          category: config.category || 'external',
          headers: config.headers,
          timeoutMs: config.timeoutMs || 5000,
          expectedStatus: config.expectedStatus,
          retries: config.retries || 1,
        });
        res.json({ success: true, data: result });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.get('/dns', async (req: Request, res: Response) => {
      try {
        const rawHost = req.query.host;
        const host = Array.isArray(rawHost) ? (rawHost[0] as string) : (rawHost as string);
        if (!host) {
          return res.status(400).json({ success: false, error: 'Query parameter "host" is required.' });
        }
        const dnsResult = await this.diagnoseDNS(host);
        res.json({ success: true, data: dnsResult });
      } catch (error: any) {
        res.status(500).json({ success: false, error: error.message });
      }
    });

    router.get('/history', (req: Request, res: Response) => {
      res.json({ success: true, data: this.getLatencyHistory() });
    });

    return router;
  }
}

export const networkDiagnostics = NetworkDiagnosticsService.getInstance();
export default networkDiagnostics;