import { Router, Request, Response, NextFunction } from 'express';
import { AssetService } from '../services/asset-service';
import { authenticate, authorize } from '../middleware/auth';

/**
 * AQUARIUS AI - ASSET REGISTRY ROUTES
 * Logic for managing global sovereign assets, valuations, and transfers.
 */

// FIX: Added 'jurisdiction' and 'fingerprint' to resolve TS2430 interface mismatch
interface UserPayload {
  id: string;
  username: string;
  email: string;
  role: string;
  roles: string[];
  permissions: string[];
  clearanceLevel: number;
  jurisdiction: string; // Required by your middleware
  fingerprint: string;  // Required by your middleware
  sovereignLevel?: number;
}

// Extend the Express Request to include our strictly typed user
export interface AuthenticatedRequest extends Request {
  user: UserPayload;
}

const router = Router();

/**
 * FIX: In most of your architecture, services use .getInstance() 
 * to avoid "Private Constructor" errors. 
 * If your AssetService doesn't have getInstance, use 'new AssetService()'
 */
const assetService = (AssetService as any).getInstance 
  ? (AssetService as any).getInstance() 
  : new AssetService();

/**
 * @route   GET /api/assets
 * @desc    Retrieve a list of all global assets with filters
 */
router.get(
  '/',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const filters = {
        type: req.query.type as string,
        ownerId: req.query.ownerId as string,
        status: req.query.status as string,
        minValue: req.query.minValue ? Number(req.query.minValue) : undefined,
        maxValue: req.query.maxValue ? Number(req.query.maxValue) : undefined,
        jurisdiction: req.query.jurisdiction as string,
        limit: req.query.limit ? parseInt(req.query.limit as string, 10) : 100,
        offset: req.query.offset ? parseInt(req.query.offset as string, 10) : 0,
      };

      // FIX: assetService.listAssets returns Asset[], handled safely via cast
      const result = await (assetService as any).listAssets(filters);
      
      res.status(200).json({
        success: true,
        timestamp: new Date().toISOString(),
        count: Array.isArray(result) ? result.length : 0,
        data: result,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/assets/analytics/summary
 */
router.get(
  '/analytics/summary',
  authenticate,
  authorize(['admin', 'illuminati', 'sovereign']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const summary = typeof (assetService as any).getGlobalAnalytics === 'function' 
        ? await (assetService as any).getGlobalAnalytics()
        : { totalValue: 0, assetCount: 0 };

      res.status(200).json({
        success: true,
        data: summary,
      });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   GET /api/assets/:id
 */
router.get(
  '/:id',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const { id } = req.params;
      // FIX: Standardized to 'getAsset' (renamed from getAssetById)
      const asset = await (assetService as any).getAsset(id);

      if (!asset) {
        res.status(404).json({
          success: false,
          error: 'AssetNotFound',
          message: `Asset ID ${id} not found in the sovereign ledger.`,
        });
        return;
      }

      res.json({ success: true, data: asset });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/assets/register
 */
router.post(
  '/register',
  authenticate,
  authorize(['admin', 'registrar', 'illuminati', 'sovereign']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const { name, type, value, currency, ownerId, jurisdiction, metadata } = req.body;

      const newAsset = await (assetService as any).registerAsset({
        name, type, value, 
        currency: currency || 'USD',
        ownerId, jurisdiction, 
        metadata: metadata || {},
        registeredBy: authReq.user.id,
      });

      res.status(201).json({ success: true, data: newAsset });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/assets/transfer
 */
router.post(
  '/transfer',
  authenticate,
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const { assetId, fromOwnerId, toOwnerId, transferPrice } = req.body;

      // Allow admins to override, otherwise user must own the asset
      const isAdmin = authReq.user.roles?.some(r => ['admin', 'illuminati'].includes(r));
      if (authReq.user.id !== fromOwnerId && !isAdmin) {
        res.status(403).json({ success: false, error: 'UnauthorizedTransfer' });
        return;
      }

      const receipt = await (assetService as any).transferOwnership({
        assetId, fromOwnerId, toOwnerId, 
        transferPrice: transferPrice || 0,
        initiatedBy: authReq.user.id,
      });

      res.status(200).json({ success: true, data: receipt });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   PATCH /api/assets/:id/valuation
 */
router.patch(
  '/:id/valuation',
  authenticate,
  authorize(['admin', 'appraiser', 'illuminati']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const { newValue, reason } = req.body;

      const updatedAsset = await (assetService as any).updateValuation(req.params.id, {
        newValue,
        reason: reason || 'Market adjustment',
        updatedBy: authReq.user.id,
      });

      res.status(200).json({ success: true, data: updatedAsset });
    } catch (error) {
      next(error);
    }
  }
);

/**
 * @route   POST /api/assets/:id/seize
 */
router.post(
  '/:id/seize',
  authenticate,
  authorize(['illuminati', 'sovereign']),
  async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      const authReq = req as unknown as AuthenticatedRequest;
      const { targetOwnerId, reason } = req.body;

      const seizureRecord = await (assetService as any).seizeAsset({
        assetId: req.params.id,
        newOwnerId: targetOwnerId,
        reason,
        authorizedBy: authReq.user.id,
      });

      res.json({ success: true, data: seizureRecord });
    } catch (error) {
      next(error);
    }
  }
);

export default router;
