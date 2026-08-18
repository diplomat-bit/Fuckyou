import express, { Request, Response, NextFunction } from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import path from 'path';
import { fileURLToPath } from 'url';

// Config & Utils
import { env } from './config/env';
import { logger } from './utils/logger';

// Middleware
import { authenticate } from './middleware/auth';
import { rateLimiter } from './middleware/rate-limiter';
// FIX: Imported as default to resolve TS2614
import errorHandler from './middleware/error-handler';

// Server Core Routes
import assetsRouter from './routes/assets';
import cicadaRouter from './routes/cicada-puzzles';
import financialsRouter from './routes/financials';
import identityRouter from './routes/identity';
import procurementRouter from './routes/procurement';
import quantumRouter from './routes/quantum-bridge';
// FIX: Fallback for routes that might not have default exports (TS1192)
import * as sovereignAnalyticsModule from './routes/sovereign-analytics';
import supplyChainRouter from './routes/supply-chain';

// API Orchestration Routes
import acquisitionsOrchestratorRouter from '../api/routes/acquisitions-orchestrator';
import adminRouter from '../api/routes/admin';
import auditRouter from '../api/routes/audit';
import collateralRouter from '../api/routes/collateral';
import apiIdentityRouter from '../api/routes/identity';
import marketRouter from '../api/routes/market';
import notificationsRouter from '../api/routes/notifications';
import treasuryRouter from '../api/routes/treasury';
// FIX: Handling potential missing default export (TS1192)
import * as webhooksModule from '../api/routes/webhooks';

// App Registry Routes
import { AppRegistryRoutes } from '../api/AppRegistry/routes/AppRegistryRoutes';
import { DiagnosticRoutes } from '../api/PortalDiagnostics/routes/DiagnosticRoutes';

const app = express();

// ESM __dirname compatibility
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Helper to extract router from modules that might not use 'export default'
const sovereignRouter = (sovereignAnalyticsModule as any).default || (sovereignAnalyticsModule as any).router || sovereignAnalyticsModule;
const webhooksRouter = (webhooksModule as any).default || (webhooksModule as any).router || webhooksModule;

// 1. Global Security & Utility Middleware
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc: ["'self'", "'unsafe-inline'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      imgSrc: ["'self'", "data:", "https:"],
      connectSrc: ["'self'", "https://api.alpaca.markets", "https://paper-api.alpaca.markets", "https://api.plaid.com"],
    },
  },
}));

app.use(cors({
  // FIX: Access CORS_ORIGIN safely to resolve TS2339
  origin: (env as any).CORS_ORIGIN || '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization', 'X-Requested-With', 'X-Sovereign-Token'],
  credentials: true,
}));

app.use(express.json({ limit: '50mb' }));
app.use(express.urlencoded({ extended: true, limit: '50mb' }));

// FIX: Explicitly type the message parameter to resolve TS7006
const morganFormat = env.NODE_ENV === 'production' ? 'combined' : 'dev';
app.use(morgan(morganFormat, {
  stream: {
    write: (message: string) => logger.info(message.trim()),
  },
}));

app.use(rateLimiter);

// 2. Gateway Health & Status
app.get('/status', (req: Request, res: Response) => {
  res.status(200).json({
    status: 'ONLINE',
    gateway: 'Oko-Gateway-v2.0.0',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
    services: {
      sovereignIntelligence: 'ACTIVE',
      astraVectorDB: 'CONNECTED',
      appRegistry: 'ACTIVE',
      diagnostics: 'ACTIVE',
    }
  });
});

// 3. Mount Server Core Routes (v1)
app.use('/api/v1/assets', authenticate, assetsRouter);
app.use('/api/v1/cicada-puzzles', cicadaRouter);
app.use('/api/v1/financials', authenticate, financialsRouter);
app.use('/api/v1/identity', identityRouter);
app.use('/api/v1/procurement', authenticate, procurementRouter);
app.use('/api/v1/quantum-bridge', authenticate, quantumRouter);
app.use('/api/v1/sovereign-analytics', authenticate, sovereignRouter);
app.use('/api/v1/supply-chain', authenticate, supplyChainRouter);

// 4. Mount API Orchestration Routes
app.use('/api/v1/orchestrator/acquisitions', authenticate, acquisitionsOrchestratorRouter);
app.use('/api/v1/orchestrator/admin', authenticate, adminRouter);
app.use('/api/v1/orchestrator/audit', authenticate, auditRouter);
app.use('/api/v1/orchestrator/collateral', authenticate, collateralRouter);
app.use('/api/v1/orchestrator/identity', apiIdentityRouter);
app.use('/api/v1/orchestrator/market', authenticate, marketRouter);
app.use('/api/v1/orchestrator/notifications', authenticate, notificationsRouter);
app.use('/api/v1/orchestrator/treasury', authenticate, treasuryRouter);
app.use('/api/v1/orchestrator/webhooks', webhooksRouter);

// 5. Mount App Registry & Diagnostics
app.use('/api/v1/apps', AppRegistryRoutes);
app.use('/api/v1/diagnostics', DiagnosticRoutes);

// 6. Static Assets
const publicPath = path.join(__dirname, '../public');
app.use(express.static(publicPath));

// 7. Fallback for 404 Errors
app.use((req: Request, res: Response) => {
  res.status(404).json({
    error: 'Not Found',
    message: `The path ${req.originalUrl} does not exist on the Sovereign Gateway.`,
  });
});

// 8. Global Error Handler
app.use(errorHandler);

export default app;
