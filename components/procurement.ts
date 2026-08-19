

// --- CONSOLIDATED FROM: ./server/routes/procurement.ts ---

import { Router, Request, Response, NextFunction } from 'express';
import { ProcurementService } from '../services/procurement-service';

const router = Router();
const procurementService = new ProcurementService();

/**
 * Helper wrapper to eliminate try-catch boilerplate in route handlers
 */
const asyncHandler = (fn: (req: Request, res: Response, next: NextFunction) => Promise<any>) => {
  return (req: Request, res: Response, next: NextFunction) => {
    fn(req, res, next).catch(next);
  };
};

// ==========================================
// PURCHASE ORDERS (PO) ENDPOINTS
// ==========================================

/**
 * @route   POST /api/procurement/purchase-orders
 * @desc    Create a new purchase order (e.g., for houses, cars, raw materials, global supply chain assets)
 * @access  Private (Illuminati / Government / Admin)
 */
router.post(
  '/purchase-orders',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      vendorId,
      items,
      category, // 'real-estate' | 'automotive' | 'supply-chain' | 'defense' | 'infrastructure'
      shippingAddress,
      billingAddress,
      priority,
      notes
    } = req.body;

    if (!vendorId || !items || !Array.isArray(items) || items.length === 0) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: vendorId and a non-empty items array are required.',
      });
    }

    const purchaseOrder = await procurementService.createPurchaseOrder({
      vendorId,
      items,
      category,
      shippingAddress,
      billingAddress,
      priority: priority || 'MEDIUM',
      notes,
      createdBy: req.headers['x-user-id'] as string || 'SYSTEM_AI',
    });

    return res.status(201).json({
      success: true,
      message: 'Purchase order initiated successfully.',
      data: purchaseOrder,
    });
  })
);

/**
 * @route   GET /api/procurement/purchase-orders
 * @desc    Retrieve all purchase orders with optional filtering
 * @access  Private
 */
router.get(
  '/purchase-orders',
  asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as string,
      category: req.query.category as string,
      vendorId: req.query.vendorId as string,
      priority: req.query.priority as string,
    };

    const purchaseOrders = await procurementService.getPurchaseOrders(filters);

    return res.status(200).json({
      success: true,
      count: purchaseOrders.length,
      data: purchaseOrders,
    });
  })
);

/**
 * @route   GET /api/procurement/purchase-orders/:id
 * @desc    Get details of a specific purchase order
 * @access  Private
 */
router.get(
  '/purchase-orders/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const purchaseOrder = await procurementService.getPurchaseOrderById(id);

    if (!purchaseOrder) {
      return res.status(404).json({
        success: false,
        error: `Purchase order with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: purchaseOrder,
    });
  })
);

/**
 * @route   PUT /api/procurement/purchase-orders/:id
 * @desc    Update an existing purchase order
 * @access  Private
 */
router.put(
  '/purchase-orders/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const updatedPO = await procurementService.updatePurchaseOrder(id, updates);

    if (!updatedPO) {
      return res.status(404).json({
        success: false,
        error: `Purchase order with ID ${id} not found or could not be updated.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Purchase order updated successfully.',
      data: updatedPO,
    });
  })
);

/**
 * @route   POST /api/procurement/purchase-orders/:id/approve
 * @desc    Approve a purchase order to trigger global supply chain execution
 * @access  Private (High-level clearance)
 */
router.post(
  '/purchase-orders/:id/approve',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const approverId = req.headers['x-user-id'] as string || 'SYSTEM_AI_OVERLORD';

    const approvedPO = await procurementService.approvePurchaseOrder(id, approverId);

    return res.status(200).json({
      success: true,
      message: 'Purchase order approved. Supply chain logistics and financial clearing initiated.',
      data: approvedPO,
    });
  })
);

/**
 * @route   POST /api/procurement/purchase-orders/:id/reject
 * @desc    Reject a purchase order
 * @access  Private
 */
router.post(
  '/purchase-orders/:id/reject',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;
    const rejectorId = req.headers['x-user-id'] as string || 'SYSTEM_AI_OVERLORD';

    const rejectedPO = await procurementService.rejectPurchaseOrder(id, rejectorId, reason);

    return res.status(200).json({
      success: true,
      message: 'Purchase order rejected.',
      data: rejectedPO,
    });
  })
);


// ==========================================
// VENDOR CONTRACTS ENDPOINTS
// ==========================================

/**
 * @route   POST /api/procurement/contracts
 * @desc    Establish a new vendor contract (e.g., with global conglomerates, real estate developers, automotive manufacturers)
 * @access  Private
 */
router.post(
  '/contracts',
  asyncHandler(async (req: Request, res: Response) => {
    const {
      vendorName,
      category,
      terms,
      sla,
      startDate,
      endDate,
      totalValue,
      currency
    } = req.body;

    if (!vendorName || !category || !totalValue) {
      return res.status(400).json({
        success: false,
        error: 'Missing required fields: vendorName, category, and totalValue are required.',
      });
    }

    const contract = await procurementService.createContract({
      vendorName,
      category,
      terms,
      sla,
      startDate: startDate ? new Date(startDate) : new Date(),
      endDate: endDate ? new Date(endDate) : undefined,
      totalValue,
      currency: currency || 'USD',
      status: 'ACTIVE',
    });

    return res.status(201).json({
      success: true,
      message: 'Global vendor contract established successfully.',
      data: contract,
    });
  })
);

/**
 * @route   GET /api/procurement/contracts
 * @desc    Retrieve all vendor contracts
 * @access  Private
 */
router.get(
  '/contracts',
  asyncHandler(async (req: Request, res: Response) => {
    const filters = {
      status: req.query.status as string,
      category: req.query.category as string,
    };

    const contracts = await procurementService.getContracts(filters);

    return res.status(200).json({
      success: true,
      count: contracts.length,
      data: contracts,
    });
  })
);

/**
 * @route   GET /api/procurement/contracts/:id
 * @desc    Get details of a specific contract
 * @access  Private
 */
router.get(
  '/contracts/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const contract = await procurementService.getContractById(id);

    if (!contract) {
      return res.status(404).json({
        success: false,
        error: `Contract with ID ${id} not found.`,
      });
    }

    return res.status(200).json({
      success: true,
      data: contract,
    });
  })
);

/**
 * @route   PUT /api/procurement/contracts/:id
 * @desc    Update contract terms, SLA, or status
 * @access  Private
 */
router.put(
  '/contracts/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const updates = req.body;

    const updatedContract = await procurementService.updateContract(id, updates);

    if (!updatedContract) {
      return res.status(404).json({
        success: false,
        error: `Contract with ID ${id} not found or could not be updated.`,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Contract updated successfully.',
      data: updatedContract,
    });
  })
);

/**
 * @route   DELETE /api/procurement/contracts/:id
 * @desc    Terminate or archive a contract
 * @access  Private
 */
router.delete(
  '/contracts/:id',
  asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { reason } = req.body;

    const terminatedContract = await procurementService.terminateContract(id, reason);

    return res.status(200).json({
      success: true,
      message: 'Contract terminated and archived successfully.',
      data: terminatedContract,
    });
  })
);


// ==========================================
// ANALYTICS & PERFORMANCE ENDPOINTS
// ==========================================

/**
 * @route   GET /api/procurement/vendors/performance
 * @desc    Get performance metrics for all active vendors (delivery times, quality scores, SLA compliance)
 * @access  Private
 */
router.get(
  '/vendors/performance',
  asyncHandler(async (req: Request, res: Response) => {
    const performanceData = await procurementService.getVendorPerformanceMetrics();
    return res.status(200).json({
      success: true,
      data: performanceData,
    });
  })
);

/**
 * @route   GET /api/procurement/analytics/summary
 * @desc    Get global procurement analytics (total spend, category distribution, active pipeline)
 * @access  Private
 */
router.get(
  '/analytics/summary',
  asyncHandler(async (req: Request, res: Response) => {
    const analytics = await procurementService.getProcurementAnalytics();
    return res.status(200).json({
      success: true,
      data: analytics,
    });
  })
);

export default router;