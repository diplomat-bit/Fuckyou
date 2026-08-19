

// --- CONSOLIDATED FROM: ./api/PortalDiagnostics/config/DiagnosticConfig.ts ---

import { Router, Request, Response } from 'express';

export interface DiagnosticThresholds {
  cpuUsagePercent: number;
  memoryUsagePercent: number;
  apiLatencyMs: number;
  errorRatePercent: number;
  databaseConnectionPoolUtilization: number;
}

export interface ModuleThresholds {
  alpaca: DiagnosticThresholds;
  citi: DiagnosticThresholds;
  plaid: DiagnosticThresholds;
  stripe: DiagnosticThresholds;
  azure: DiagnosticThresholds;
  modernTreasury: DiagnosticThresholds;
  sovereignLedger: DiagnosticThresholds;
}

export interface NotificationTargets {
  emails: string[];
  slackWebhooks: string[];
  discordWebhooks: string[];
  smsNumbers: string[];
  pagerDutyIntegrationKey?: string;
}

export interface DiagnosticFrequency {
  systemHealthCheckMs: number;
  apiLatencyCheckMs: number;
  databaseIntegrityCheckMs: number;
  thirdPartyIntegrationCheckMs: number;
  fullDiagnosticCron: string;
}

export interface DiagnosticConfig {
  environment: 'development' | 'staging' | 'production';
  enabled: boolean;
  frequency: DiagnosticFrequency;
  globalThresholds: DiagnosticThresholds;
  moduleThresholds: ModuleThresholds;
  notificationTargets: NotificationTargets;
  logLevel: 'debug' | 'info' | 'warn' | 'error' | 'fatal';
}

const isProd = process.env.NODE_ENV === 'production';

const defaultConfig: DiagnosticConfig = {
  environment: (process.env.NODE_ENV as 'development' | 'staging' | 'production') || 'development',
  enabled: process.env.ENABLE_DIAGNOSTICS !== 'false',
  
  frequency: {
    systemHealthCheckMs: 60 * 1000, // 1 minute
    apiLatencyCheckMs: 5 * 60 * 1000, // 5 minutes
    databaseIntegrityCheckMs: 15 * 60 * 1000, // 15 minutes
    thirdPartyIntegrationCheckMs: 10 * 60 * 1000, // 10 minutes
    fullDiagnosticCron: '0 0 * * *', // Midnight every day
  },

  globalThresholds: {
    cpuUsagePercent: 85,
    memoryUsagePercent: 90,
    apiLatencyMs: 1500,
    errorRatePercent: 5,
    databaseConnectionPoolUtilization: 80,
  },

  moduleThresholds: {
    alpaca: {
      cpuUsagePercent: 80,
      memoryUsagePercent: 85,
      apiLatencyMs: 1000,
      errorRatePercent: 2,
      databaseConnectionPoolUtilization: 70,
    },
    citi: {
      cpuUsagePercent: 80,
      memoryUsagePercent: 85,
      apiLatencyMs: 2000,
      errorRatePercent: 1,
      databaseConnectionPoolUtilization: 70,
    },
    plaid: {
      cpuUsagePercent: 80,
      memoryUsagePercent: 85,
      apiLatencyMs: 3000,
      errorRatePercent: 5,
      databaseConnectionPoolUtilization: 70,
    },
    stripe: {
      cpuUsagePercent: 80,
      memoryUsagePercent: 85,
      apiLatencyMs: 1500,
      errorRatePercent: 2,
      databaseConnectionPoolUtilization: 70,
    },
    azure: {
      cpuUsagePercent: 85,
      memoryUsagePercent: 90,
      apiLatencyMs: 1200,
      errorRatePercent: 3,
      databaseConnectionPoolUtilization: 75,
    },
    modernTreasury: {
      cpuUsagePercent: 80,
      memoryUsagePercent: 85,
      apiLatencyMs: 1500,
      errorRatePercent: 1,
      databaseConnectionPoolUtilization: 70,
    },
    sovereignLedger: {
      cpuUsagePercent: 90,
      memoryUsagePercent: 95,
      apiLatencyMs: 500,
      errorRatePercent: 0.1, // Extremely low tolerance for ledger errors
      databaseConnectionPoolUtilization: 85,
    },
  },

  notificationTargets: {
    emails: process.env.DIAGNOSTIC_EMAILS ? process.env.DIAGNOSTIC_EMAILS.split(',') : ['admin@oko-main.local'],
    slackWebhooks: process.env.SLACK_DIAGNOSTIC_WEBHOOK ? [process.env.SLACK_DIAGNOSTIC_WEBHOOK] : [],
    discordWebhooks: process.env.DISCORD_DIAGNOSTIC_WEBHOOK ? [process.env.DISCORD_DIAGNOSTIC_WEBHOOK] : [],
    smsNumbers: process.env.DIAGNOSTIC_SMS ? process.env.DIAGNOSTIC_SMS.split(',') : [],
    pagerDutyIntegrationKey: process.env.PAGERDUTY_KEY,
  },

  logLevel: isProd ? 'warn' : 'debug',
};

// Export mutable diagnostic configuration
export let diagnosticConfig: DiagnosticConfig = { ...defaultConfig };

// Express Router for Diagnostic Configuration API
export const diagnosticConfigRouter = Router();

/**
 * @route GET /api/diagnostics/config
 * @desc Retrieve the current diagnostic configuration
 */
diagnosticConfigRouter.get('/', (req: Request, res: Response) => {
  res.json({
    success: true,
    timestamp: new Date().toISOString(),
    data: diagnosticConfig
  });
});

/**
 * @route PUT /api/diagnostics/config
 * @desc Update the entire diagnostic configuration
 */
diagnosticConfigRouter.put('/', (req: Request, res: Response) => {
  try {
    diagnosticConfig = { ...diagnosticConfig, ...req.body };
    res.json({
      success: true,
      message: 'Diagnostic configuration updated successfully',
      data: diagnosticConfig
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update diagnostic configuration'
    });
  }
});

/**
 * @route GET /api/diagnostics/config/thresholds
 * @desc Retrieve global and module-specific thresholds
 */
diagnosticConfigRouter.get('/thresholds', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: {
      globalThresholds: diagnosticConfig.globalThresholds,
      moduleThresholds: diagnosticConfig.moduleThresholds
    }
  });
});

/**
 * @route PUT /api/diagnostics/config/thresholds/global
 * @desc Update global diagnostic thresholds
 */
diagnosticConfigRouter.put('/thresholds/global', (req: Request, res: Response) => {
  try {
    diagnosticConfig.globalThresholds = { ...diagnosticConfig.globalThresholds, ...req.body };
    res.json({
      success: true,
      message: 'Global thresholds updated successfully',
      data: diagnosticConfig.globalThresholds
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update global thresholds'
    });
  }
});

/**
 * @route PUT /api/diagnostics/config/thresholds/module/:moduleName
 * @desc Update thresholds for a specific module
 */
diagnosticConfigRouter.put('/thresholds/module/:moduleName', (req: Request, res: Response) => {
  const { moduleName } = req.params;
  if (typeof moduleName !== 'string' || !(moduleName in diagnosticConfig.moduleThresholds)) {
    return res.status(404).json({
      success: false,
      error: `Module '${moduleName}' is not a valid diagnostic module`
    });
  }
  try {
    const key = moduleName as keyof ModuleThresholds;
    diagnosticConfig.moduleThresholds[key] = { ...diagnosticConfig.moduleThresholds[key], ...req.body };
    res.json({
      success: true,
      message: `Thresholds for module '${moduleName}' updated successfully`,
      data: diagnosticConfig.moduleThresholds[key]
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || `Failed to update thresholds for module '${moduleName}'`
    });
  }
});

/**
 * @route GET /api/diagnostics/config/notifications
 * @desc Retrieve notification targets
 */
diagnosticConfigRouter.get('/notifications', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: diagnosticConfig.notificationTargets
  });
});

/**
 * @route PUT /api/diagnostics/config/notifications
 * @desc Update notification targets
 */
diagnosticConfigRouter.put('/notifications', (req: Request, res: Response) => {
  try {
    diagnosticConfig.notificationTargets = { ...diagnosticConfig.notificationTargets, ...req.body };
    res.json({
      success: true,
      message: 'Notification targets updated successfully',
      data: diagnosticConfig.notificationTargets
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update notification targets'
    });
  }
});

/**
 * @route GET /api/diagnostics/config/frequency
 * @desc Retrieve diagnostic check frequencies
 */
diagnosticConfigRouter.get('/frequency', (req: Request, res: Response) => {
  res.json({
    success: true,
    data: diagnosticConfig.frequency
  });
});

/**
 * @route PUT /api/diagnostics/config/frequency
 * @desc Update diagnostic check frequencies
 */
diagnosticConfigRouter.put('/frequency', (req: Request, res: Response) => {
  try {
    diagnosticConfig.frequency = { ...diagnosticConfig.frequency, ...req.body };
    res.json({
      success: true,
      message: 'Diagnostic frequencies updated successfully',
      data: diagnosticConfig.frequency
    });
  } catch (error: any) {
    res.status(400).json({
      success: false,
      error: error.message || 'Failed to update diagnostic frequencies'
    });
  }
});

/**
 * @route POST /api/diagnostics/config/reset
 * @desc Reset diagnostic configuration to environment defaults
 */
diagnosticConfigRouter.post('/reset', (req: Request, res: Response) => {
  try {
    diagnosticConfig = { ...defaultConfig };
    res.json({
      success: true,
      message: 'Diagnostic configuration reset to defaults successfully',
      data: diagnosticConfig
    });
  } catch (error: any) {
    res.status(500).json({
      success: false,
      error: error.message || 'Failed to reset diagnostic configuration'
    });
  }
});

export default diagnosticConfig;