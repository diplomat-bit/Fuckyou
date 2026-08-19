

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/services/IntegrationDiagnostics.ts ---

import { EventEmitter } from 'events';
import { Router, Request, Response } from 'express';

export type HealthStatus = 'healthy' | 'degraded' | 'unhealthy' | 'unknown';

export interface IntegrationHealthResult {
  provider: string;
  status: HealthStatus;
  latencyMs: number;
  lastChecked: string;
  endpoint: string;
  version?: string;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface ConsolidatedDiagnosticsReport {
  timestamp: string;
  overallStatus: HealthStatus;
  totalIntegrations: number;
  healthyCount: number;
  degradedCount: number;
  unhealthyCount: number;
  results: Record<string, IntegrationHealthResult>;
}

export interface DiagnosticsConfig {
  timeoutMs?: number;
  stripeApiKey?: string;
  plaidClientId?: string;
  plaidSecret?: string;
  plaidEnv?: string;
  alpacaApiKey?: string;
  alpacaSecretKey?: string;
  alpacaBaseUrl?: string;
  modernTreasuryApiKey?: string;
  modernTreasuryOrganizationId?: string;
  citiClientId?: string;
  azureTenantId?: string;
  googleCloudProjectId?: string;
  astraDbToken?: string;
  astraDbEndpoint?: string;
}

export class IntegrationDiagnostics extends EventEmitter {
  private config: DiagnosticsConfig;
  private defaultTimeout: number;

  constructor(config: DiagnosticsConfig = {}) {
    super();
    this.config = config;
    this.defaultTimeout = config.timeoutMs || 5000;
  }

  /**
   * Generates an Express Router pre-configured with all diagnostic API routes.
   */
  public static createRouter(config?: DiagnosticsConfig): Router {
    const diagnostics = new IntegrationDiagnostics(config);
    const router = Router();

    // GET /api/diagnostics - Run all diagnostics
    router.get('/', async (req: Request, res: Response) => {
      try {
        const report = await diagnostics.runAllDiagnostics();
        res.status(report.overallStatus === 'unhealthy' ? 500 : 200).json(report);
      } catch (error: any) {
        res.status(500).json({
          status: 'error',
          message: 'Failed to execute consolidated diagnostics',
          error: error.message
        });
      }
    });

    // GET /api/diagnostics/stripe - Check Stripe Integration
    router.get('/stripe', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkStripe();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // GET /api/diagnostics/plaid - Check Plaid Integration
    router.get('/plaid', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkPlaid();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // GET /api/diagnostics/alpaca - Check Alpaca Integration
    router.get('/alpaca', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkAlpaca();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // GET /api/diagnostics/modern-treasury - Check Modern Treasury Integration
    router.get('/modern-treasury', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkModernTreasury();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // GET /api/diagnostics/citi - Check CitiConnect Integration
    router.get('/citi', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkCitiConnect();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // GET /api/diagnostics/azure - Check Azure Gov Compliance Integration
    router.get('/azure', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkAzureGovCompliance();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // GET /api/diagnostics/google-cloud - Check Google Cloud Integration
    router.get('/google-cloud', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkGoogleCloud();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    // GET /api/diagnostics/astra-db - Check Astra DB Integration
    router.get('/astra-db', async (req: Request, res: Response) => {
      try {
        const result = await diagnostics.checkAstraDB();
        res.status(result.status === 'unhealthy' ? 500 : 200).json(result);
      } catch (error: any) {
        res.status(500).json({ status: 'error', error: error.message });
      }
    });

    return router;
  }

  public async execute(): Promise<ConsolidatedDiagnosticsReport> {
    return this.runAllDiagnostics();
  }

  public async runDiagnostics(): Promise<ConsolidatedDiagnosticsReport> {
    return this.runAllDiagnostics();
  }

  public async runAllDiagnostics(): Promise<ConsolidatedDiagnosticsReport> {
    const startTime = Date.now();
    
    const checks = await Promise.allSettled([
      this.checkStripe(),
      this.checkPlaid(),
      this.checkAlpaca(),
      this.checkModernTreasury(),
      this.checkCitiConnect(),
      this.checkAzureGovCompliance(),
      this.checkGoogleCloud(),
      this.checkAstraDB()
    ]);

    const results: Record<string, IntegrationHealthResult> = {};
    let healthyCount = 0;
    let degradedCount = 0;
    let unhealthyCount = 0;

    checks.forEach((check) => {
      if (check.status === 'fulfilled') {
        const res = check.value;
        results[res.provider] = res;
        if (res.status === 'healthy') healthyCount++;
        else if (res.status === 'degraded') degradedCount++;
        else unhealthyCount++;
      } else {
        const providerName = 'UnknownProvider';
        results[providerName] = {
          provider: providerName,
          status: 'unhealthy',
          latencyMs: -1,
          lastChecked: new Date().toISOString(),
          endpoint: 'N/A',
          errorMessage: check.reason?.message || 'Execution error during health check'
        };
        unhealthyCount++;
      }
    });

    let overallStatus: HealthStatus = 'healthy';
    if (unhealthyCount > 0) {
      overallStatus = unhealthyCount > (healthyCount + degradedCount) ? 'unhealthy' : 'degraded';
    } else if (degradedCount > 0) {
      overallStatus = 'degraded';
    }

    const report: ConsolidatedDiagnosticsReport = {
      timestamp: new Date().toISOString(),
      overallStatus,
      totalIntegrations: Object.keys(results).length,
      healthyCount,
      degradedCount,
      unhealthyCount,
      results
    };

    this.emit('diagnosticsCompleted', report);
    return report;
  }

  public async checkStripe(): Promise<IntegrationHealthResult> {
    const provider = 'Stripe';
    const endpoint = 'https://api.stripe.com/v1/balance';
    const startTime = Date.now();
    const apiKey = this.config.stripeApiKey || process.env.STRIPE_SECRET_KEY;

    if (!apiKey) {
      return {
        provider,
        status: 'degraded',
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: 'Stripe API key is missing from configuration.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          Authorization: `Bearer ${apiKey}`,
          'Stripe-Version': '2023-10-16'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          provider,
          status: latencyMs > 1500 ? 'degraded' : 'healthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          metadata: { httpCode: response.status }
        };
      } else {
        return {
          provider,
          status: 'unhealthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`,
          metadata: { httpCode: response.status }
        };
      }
    } catch (err: any) {
      return {
        provider,
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: err.name === 'AbortError' ? 'Health check timed out' : err.message
      };
    }
  }

  public async checkPlaid(): Promise<IntegrationHealthResult> {
    const provider = 'Plaid';
    const env = this.config.plaidEnv || process.env.PLAID_ENV || 'sandbox';
    const endpoint = `https://${env}.plaid.com/categories/get`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(endpoint, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({}),
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          provider,
          status: latencyMs > 1500 ? 'degraded' : 'healthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          metadata: { environment: env }
        };
      } else {
        return {
          provider,
          status: 'unhealthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (err: any) {
      return {
        provider,
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: err.name === 'AbortError' ? 'Health check timed out' : err.message
      };
    }
  }

  public async checkAlpaca(): Promise<IntegrationHealthResult> {
    const provider = 'Alpaca';
    const baseUrl = this.config.alpacaBaseUrl || process.env.ALPACA_BASE_URL || 'https://paper-api.alpaca.markets';
    const endpoint = `${baseUrl}/v2/clock`;
    const startTime = Date.now();
    const apiKey = this.config.alpacaApiKey || process.env.ALPACA_API_KEY;
    const secretKey = this.config.alpacaSecretKey || process.env.ALPACA_SECRET_KEY;

    if (!apiKey || !secretKey) {
      return {
        provider,
        status: 'degraded',
        latencyMs: 0,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: 'Alpaca API keys missing.'
      };
    }

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'APCA-API-KEY-ID': apiKey,
          'APCA-API-SECRET-KEY': secretKey
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        const body = await response.json();
        return {
          provider,
          status: latencyMs > 1500 ? 'degraded' : 'healthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          metadata: { isOpen: body?.is_open ?? false, nextClose: body?.next_close }
        };
      } else {
        return {
          provider,
          status: 'unhealthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          errorMessage: `HTTP ${response.status}: ${response.statusText}`
        };
      }
    } catch (err: any) {
      return {
        provider,
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: err.name === 'AbortError' ? 'Health check timed out' : err.message
      };
    }
  }

  public async checkModernTreasury(): Promise<IntegrationHealthResult> {
    const provider = 'ModernTreasury';
    const endpoint = 'https://www.moderntreasury.com/api/ping';
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          provider,
          status: latencyMs > 1500 ? 'degraded' : 'healthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint
        };
      } else {
        return {
          provider,
          status: 'unhealthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          errorMessage: `HTTP ${response.status}`
        };
      }
    } catch (err: any) {
      return {
        provider,
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: err.name === 'AbortError' ? 'Health check timed out' : err.message
      };
    }
  }

  public async checkCitiConnect(): Promise<IntegrationHealthResult> {
    const provider = 'CitiConnect';
    const endpoint = process.env.CITI_HEALTH_CHECK_URL || 'https://sandbox.g2b.citiconnect.citi.com/g2b/services/health';
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(endpoint, {
        method: 'GET',
        headers: {
          'Accept': 'application/json'
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      if (response.ok) {
        return {
          provider,
          status: latencyMs > 2000 ? 'degraded' : 'healthy',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint
        };
      } else {
        return {
          provider,
          status: 'degraded',
          latencyMs,
          lastChecked: new Date().toISOString(),
          endpoint,
          errorMessage: `Citi Gateway responded with status ${response.status}`
        };
      }
    } catch (err: any) {
      return {
        provider,
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: err.message || 'Citi connection error'
      };
    }
  }

  public async checkAzureGovCompliance(): Promise<IntegrationHealthResult> {
    const provider = 'AzureGovCompliance';
    const endpoint = 'https://management.usgovcloudapi.net/health';
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      return {
        provider,
        status: response.ok ? 'healthy' : 'degraded',
        latencyMs,
        lastChecked: new Date().toISOString(),
        endpoint,
        metadata: { cloud: 'USGov' }
      };
    } catch (err: any) {
      return {
        provider,
        status: 'degraded',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: 'Azure Gov endpoint verification failed: ' + err.message
      };
    }
  }

  public async checkGoogleCloud(): Promise<IntegrationHealthResult> {
    const provider = 'GoogleCloud';
    const projectId = this.config.googleCloudProjectId || process.env.GOOGLE_CLOUD_PROJECT || 'mock-gcp-project';
    const endpoint = `https://cloudresourcemanager.googleapis.com/v1/projects/${projectId}`;
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      // Perform a lightweight check or metadata ping
      const response = await fetch(endpoint, {
        method: 'GET',
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      return {
        provider,
        status: response.status === 401 || response.ok ? 'healthy' : 'degraded', // 401 means endpoint is alive but needs auth
        latencyMs,
        lastChecked: new Date().toISOString(),
        endpoint,
        metadata: { projectId }
      };
    } catch (err: any) {
      return {
        provider,
        status: 'degraded',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: 'Google Cloud ping failed: ' + err.message
      };
    }
  }

  public async checkAstraDB(): Promise<IntegrationHealthResult> {
    const provider = 'AstraDB';
    const endpoint = this.config.astraDbEndpoint || process.env.ASTRA_DB_API_ENDPOINT || 'https://api.astra.datastax.com';
    const startTime = Date.now();

    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), this.defaultTimeout);

      const response = await fetch(`${endpoint}/v2/databases`, {
        method: 'GET',
        headers: {
          'Authorization': `Bearer ${this.config.astraDbToken || process.env.ASTRA_DB_APPLICATION_TOKEN || ''}`
        },
        signal: controller.signal
      });

      clearTimeout(timeoutId);
      const latencyMs = Date.now() - startTime;

      return {
        provider,
        status: response.ok ? 'healthy' : 'degraded',
        latencyMs,
        lastChecked: new Date().toISOString(),
        endpoint,
        metadata: { httpCode: response.status }
      };
    } catch (err: any) {
      return {
        provider,
        status: 'unhealthy',
        latencyMs: Date.now() - startTime,
        lastChecked: new Date().toISOString(),
        endpoint,
        errorMessage: 'Astra DB connection failed: ' + err.message
      };
    }
  }
}

export default IntegrationDiagnostics;