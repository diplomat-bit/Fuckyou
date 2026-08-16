import { Router, Request, Response, NextFunction } from 'express';
import { FinancialService } from '../services/financial-service';
import { authenticate } from '../middleware/auth';
import { rateLimiter } from '../middleware/rate-limiter';

export interface AuthenticatedRequest extends Request {
  user?: {
    id: string;
    roles?: string[];
    [key: string]: any;
  };
}

const router = Router();
const financialService = new FinancialService();

// Apply middleware
router.use(authenticate as any);
router.use(rateLimiter as any);

// Get financial overview
router.get('/overview', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const overview = await financialService.getOverview(req.user.id);
    res.json(overview);
  } catch (error) {
    next(error);
  }
});

// Process a transaction
router.post('/transaction', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { amount, currency, destination, type, metadata } = req.body;
    const result = await financialService.processTransaction({
      userId: req.user.id,
      amount,
      currency,
      destination,
      type,
      ...(metadata && { metadata })
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Get transaction history
router.get('/transactions', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    
    const service = financialService as any;
    let transactions;
    
    if (typeof service.getTransactionHistory === 'function' && service.getTransactionHistory.length > 1) {
      transactions = await service.getTransactionHistory(req.user.id, req.query);
    } else {
      transactions = await financialService.getTransactionHistory(req.user.id);
    }
      
    res.json(transactions);
  } catch (error) {
    next(error);
  }
});

// Initiate sovereign wealth transfer
router.post('/sovereign-transfer', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { targetEntity, amount, assetClass, complianceHash } = req.body;
    const result = await financialService.initiateSovereignTransfer({
      userId: req.user.id,
      targetEntity,
      amount,
      assetClass,
      ...(complianceHash && { complianceHash })
    });
    res.status(201).json(result);
  } catch (error) {
    next(error);
  }
});

// Get portfolio performance
router.get('/portfolio/performance', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { timeframe } = req.query;
    const service = financialService as any;
    if (typeof service.getPortfolioPerformance === 'function') {
      const performance = await service.getPortfolioPerformance(req.user.id, timeframe);
      res.json(performance);
    } else {
      res.status(501).json({ error: 'Not Implemented', message: 'Portfolio performance tracking is not yet implemented in the financial service.' });
    }
  } catch (error) {
    next(error);
  }
});

// Rebalance portfolio
router.post('/portfolio/rebalance', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { strategy, targetAllocations } = req.body;
    const service = financialService as any;
    if (typeof service.rebalancePortfolio === 'function') {
      const result = await service.rebalancePortfolio({
        userId: req.user.id,
        strategy,
        targetAllocations
      });
      res.status(200).json(result);
    } else {
      res.status(501).json({ error: 'Not Implemented', message: 'Portfolio rebalancing is not yet implemented.' });
    }
  } catch (error) {
    next(error);
  }
});

// Generate tax report
router.get('/reports/tax', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { year } = req.query;
    const service = financialService as any;
    if (typeof service.generateTaxReport === 'function') {
      const report = await service.generateTaxReport(req.user.id, year);
      res.json(report);
    } else {
      res.status(501).json({ error: 'Not Implemented', message: 'Tax reporting is not yet implemented.' });
    }
  } catch (error) {
    next(error);
  }
});

// Sync external accounts (Plaid, Citi, etc.)
router.post('/sync-accounts', async (req: AuthenticatedRequest, res: Response, next: NextFunction) => {
  try {
    if (!req.user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }
    const { provider } = req.body;
    const service = financialService as any;
    if (typeof service.syncExternalAccounts === 'function') {
      const result = await service.syncExternalAccounts(req.user.id, provider);
      res.status(200).json(result);
    } else {
      res.status(501).json({ error: 'Not Implemented', message: 'External account syncing is not yet implemented.' });
    }
  } catch (error) {
    next(error);
  }
});

export default router;