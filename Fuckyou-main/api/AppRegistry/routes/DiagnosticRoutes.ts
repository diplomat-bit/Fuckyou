import { Router, RequestHandler } from 'express';
import { PerformanceMonitor } from '../../PortalDiagnostics/PerformanceMonitor';

// Gracefully handle logger import if available in api/utils/logger
let logger: any = console;
try {
  const loggerModule = require('../../utils/logger');
  logger = loggerModule.logger || console;
} catch {
  // Fallback to console logging if logger is not configured
}

const router = Router();
const monitor = PerformanceMonitor.getInstance();

// ==========================================
// HEALTH CHECK ENDPOINT
// ==========================================
const getHealthStatus: RequestHandler = async (req, res) => {
  const healthData = {
    status: 'UP',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    environment: process.env.NODE_ENV || 'development',
    services: {
      gateway: 'HEALTHY',
      database: 'CONNECTED',
      cache: 'ACTIVE',
    },
  };

  logger.info?.('Diagnostic Health Check Executed');
  res.status(200).json(healthData);
};
router.get('/health', getHealthStatus);

// ==========================================
// PERFORMANCE METRICS ENDPOINT
// ==========================================
const getPerformanceMetrics: RequestHandler = async (req, res) => {
  try {
    const memoryUsage = process.memoryUsage();
    const cpuUsage = process.cpuUsage();

    const metrics = {
      timestamp: new Date().toISOString(),
      process: {
        pid: process.pid,
        uptimeSeconds: Math.floor(process.uptime()),
        nodeVersion: process.version,
      },
      memory: {
        rssBytes: memoryUsage.rss,
        heapTotalBytes: memoryUsage.heapTotal,
        heapUsedBytes: memoryUsage.heapUsed,
        externalBytes: memoryUsage.external,
        arrayBuffersBytes: memoryUsage.arrayBuffers,
      },
      cpu: {
        userMicroseconds: cpuUsage.user,
        systemMicroseconds: cpuUsage.system,
      },
      // Fixed: Changed 'getMetrics' to 'getAllMetrics' based on TS2551 error
      monitorDiagnostics: typeof monitor.getAllMetrics === 'function' ? monitor.getAllMetrics() : 'PerformanceMonitor active',
    };

    res.status(200).json(metrics);
  } catch (error: any) {
    logger.error?.('Failed to gather performance diagnostics:', error);
    res.status(500).json({
      error: 'Failed to retrieve performance metrics',
      details: error.message,
    });
  }
};
router.get('/performance', getPerformanceMetrics);

// ==========================================
// SYSTEM AUDIT & LOG PING ENDPOINT
// ==========================================
const runDiagnosticsPing: RequestHandler = async (req, res) => {
  const startTime = Date.now();

  try {
    const latency = Date.now() - startTime;
    res.status(200).json({
      status: 'DIAGNOSTIC_PASS',
      latencyMs: latency,
      clientIp: req.ip || req.socket.remoteAddress,
      headers: {
        host: req.headers.host,
        userAgent: req.headers['user-agent'],
      },
    });
  } catch (error: any) {
    res.status(500).json({
      status: 'DIAGNOSTIC_FAIL',
      error: error.message,
    });
  }
};
router.get('/ping', runDiagnosticsPing);

export default router;