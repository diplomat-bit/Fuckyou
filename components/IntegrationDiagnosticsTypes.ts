

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/types/IntegrationDiagnosticsTypes.ts ---

export interface IntegrationStatus {
  serviceName: string;
  isConnected: boolean;
  latencyMs: number;
  lastChecked: string;
  errorCount: number;
  status: 'HEALTHY' | 'DEGRADED' | 'OFFLINE' | 'MAINTENANCE';
}

export interface IntegrationHistoryEntry {
  timestamp: string;
  serviceName: string;
  event: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
  details: Record<string, any>;
}

export interface IntegrationDiagnosticsState {
  activeIntegrations: IntegrationStatus[];
  history: IntegrationHistoryEntry[];
  isScanning: boolean;
  lastSyncTimestamp: string | null;
}

export interface IntegrationUIConfig {
  refreshIntervalMs: number;
  showDetailedMetrics: boolean;
  theme: 'LIGHT' | 'DARK' | 'SYSTEM';
  alertThresholds: {
    latencyMs: number;
    errorRate: number;
  };
}

export type IntegrationDiagnosticAction =
  | { type: 'UPDATE_STATUS'; payload: IntegrationStatus }
  | { type: 'ADD_HISTORY'; payload: IntegrationHistoryEntry }
  | { type: 'SET_SCANNING'; payload: boolean }
  | { type: 'UPDATE_CONFIG'; payload: Partial<IntegrationUIConfig> }
  | { type: 'RESET_DIAGNOSTICS' };

export interface IntegrationDiagnosticsContextType {
  state: IntegrationDiagnosticsState;
  config: IntegrationUIConfig;
  dispatch: (action: IntegrationDiagnosticAction) => void;
  refreshDiagnostics: () => Promise<void>;
}

// --- API ROUTES & CONTROLLER INTEGRATION ---

import { Request, Response, Router } from 'express';

// In-memory state store for diagnostics
let globalDiagnosticsState: IntegrationDiagnosticsState = {
  activeIntegrations: [
    {
      serviceName: 'Alpaca Brokerage API',
      isConnected: true,
      latencyMs: 112,
      lastChecked: new Date().toISOString(),
      errorCount: 0,
      status: 'HEALTHY',
    },
    {
      serviceName: 'Citi Sovereign Ledger Bridge',
      isConnected: true,
      latencyMs: 215,
      lastChecked: new Date().toISOString(),
      errorCount: 0,
      status: 'HEALTHY',
    },
    {
      serviceName: 'Modern Treasury Settlement',
      isConnected: true,
      latencyMs: 145,
      lastChecked: new Date().toISOString(),
      errorCount: 1,
      status: 'HEALTHY',
    },
    {
      serviceName: 'Stripe Payment Gateway',
      isConnected: false,
      latencyMs: 0,
      lastChecked: new Date().toISOString(),
      errorCount: 8,
      status: 'OFFLINE',
    },
    {
      serviceName: 'Azure Gov Compliance API',
      isConnected: true,
      latencyMs: 420,
      lastChecked: new Date().toISOString(),
      errorCount: 2,
      status: 'DEGRADED',
    },
  ],
  history: [
    {
      timestamp: new Date(Date.now() - 7200000).toISOString(),
      serviceName: 'Stripe Payment Gateway',
      event: 'Connection Timeout',
      severity: 'CRITICAL',
      details: { error: 'ETIMEDOUT', attempt: 3 },
    },
    {
      timestamp: new Date(Date.now() - 3600000).toISOString(),
      serviceName: 'Azure Gov Compliance API',
      event: 'Latency Spike Detected',
      severity: 'WARNING',
      details: { latencyMs: 845, thresholdMs: 500 },
    },
  ],
  isScanning: false,
  lastSyncTimestamp: new Date().toISOString(),
};

let globalUIConfig: IntegrationUIConfig = {
  refreshIntervalMs: 30000,
  showDetailedMetrics: true,
  theme: 'DARK',
  alertThresholds: {
    latencyMs: 500,
    errorRate: 0.05,
  },
};

/**
 * NestJS-style Decorators (Mocked for pure TS/JS compatibility)
 * This allows the file to be used in NestJS environments or standard Express environments.
 */
export function Controller(prefix: string): ClassDecorator {
  return (target) => {
    if (typeof Reflect !== 'undefined' && Reflect.defineMetadata) {
      Reflect.defineMetadata('path', prefix, target);
    }
  };
}

export function Get(path = ''): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof Reflect !== 'undefined' && Reflect.defineMetadata) {
      Reflect.defineMetadata('method', 'GET', target, propertyKey);
      Reflect.defineMetadata('path', path, target, propertyKey);
    }
    return descriptor;
  };
}

export function Post(path = ''): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof Reflect !== 'undefined' && Reflect.defineMetadata) {
      Reflect.defineMetadata('method', 'POST', target, propertyKey);
      Reflect.defineMetadata('path', path, target, propertyKey);
    }
    return descriptor;
  };
}

export function Put(path = ''): MethodDecorator {
  return (target: any, propertyKey: string, descriptor: PropertyDescriptor) => {
    if (typeof Reflect !== 'undefined' && Reflect.defineMetadata) {
      Reflect.defineMetadata('method', 'PUT', target, propertyKey);
      Reflect.defineMetadata('path', path, target, propertyKey);
    }
    return descriptor;
  };
}

/**
 * NestJS Controller for Integration Diagnostics
 */
@Controller('/api/diagnostics/integrations')
export class IntegrationDiagnosticsController {
  @Get()
  async getStatus(): Promise<IntegrationDiagnosticsState> {
    return globalDiagnosticsState;
  }

  @Get('/config')
  async getConfig(): Promise<IntegrationUIConfig> {
    return globalUIConfig;
  }

  @Post('/scan')
  async triggerScan(): Promise<{ success: boolean; state: IntegrationDiagnosticsState }> {
    globalDiagnosticsState.isScanning = true;
    
    // Simulate scanning process
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    globalDiagnosticsState.activeIntegrations = globalDiagnosticsState.activeIntegrations.map((integration) => {
      const isConnected = Math.random() > 0.08;
      const latencyMs = isConnected ? Math.floor(Math.random() * 280) + 40 : 0;
      const status = !isConnected
        ? 'OFFLINE'
        : latencyMs > 250
        ? 'DEGRADED'
        : 'HEALTHY';
      
      return {
        ...integration,
        isConnected,
        latencyMs,
        lastChecked: new Date().toISOString(),
        errorCount: isConnected ? Math.max(0, integration.errorCount - 1) : integration.errorCount + 1,
        status,
      };
    });

    globalDiagnosticsState.isScanning = false;
    globalDiagnosticsState.lastSyncTimestamp = new Date().toISOString();

    // Add history entry
    globalDiagnosticsState.history.unshift({
      timestamp: new Date().toISOString(),
      serviceName: 'System Orchestrator',
      event: 'Manual Diagnostics Scan Completed',
      severity: 'INFO',
      details: { activeCount: globalDiagnosticsState.activeIntegrations.length },
    });

    return {
      success: true,
      state: globalDiagnosticsState,
    };
  }

  @Put('/config')
  async updateConfig(config: Partial<IntegrationUIConfig>): Promise<IntegrationUIConfig> {
    globalUIConfig = {
      ...globalUIConfig,
      ...config,
      alertThresholds: {
        ...globalUIConfig.alertThresholds,
        ...(config.alertThresholds || {}),
      },
    };
    return globalUIConfig;
  }

  @Post('/reset')
  async resetDiagnostics(): Promise<{ success: boolean }> {
    globalDiagnosticsState = {
      activeIntegrations: globalDiagnosticsState.activeIntegrations.map((i) => ({
        ...i,
        errorCount: 0,
        status: 'HEALTHY',
        isConnected: true,
        latencyMs: 95,
      })),
      history: [],
      isScanning: false,
      lastSyncTimestamp: new Date().toISOString(),
    };
    return { success: true };
  }
}

/**
 * Express Router implementation for seamless integration into Express-based backends.
 */
export const createIntegrationDiagnosticsRouter = (): Router => {
  const router = Router();
  const controller = new IntegrationDiagnosticsController();

  router.get('/', async (req: Request, res: Response) => {
    try {
      const data = await controller.getStatus();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  router.get('/config', async (req: Request, res: Response) => {
    try {
      const data = await controller.getConfig();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  router.post('/scan', async (req: Request, res: Response) => {
    try {
      const data = await controller.triggerScan();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  router.put('/config', async (req: Request, res: Response) => {
    try {
      const data = await controller.updateConfig(req.body);
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  router.post('/reset', async (req: Request, res: Response) => {
    try {
      const data = await controller.resetDiagnostics();
      res.status(200).json(data);
    } catch (error: any) {
      res.status(500).json({ error: error.message || 'Internal Server Error' });
    }
  });

  return router;
};