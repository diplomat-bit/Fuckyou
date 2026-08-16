import { Router } from 'express';
import { OrderController } from '../controllers/order.controller';
import { GeminiMiddleware } from '../middleware/gemini.middleware';

const router = Router();
const orderController = new OrderController();

/**
 * Order Routes
 * All endpoints are hooked into the Gemini AI integration layer
 * to provide intelligent processing, validation, and analysis.
 */

router.post(
  '/',
  GeminiMiddleware.processRequest,
  orderController.createOrder
);

router.get(
  '/:id',
  GeminiMiddleware.processRequest,
  orderController.getOrderById
);

router.get(
  '/',
  GeminiMiddleware.processRequest,
  orderController.getAllOrders
);

router.put(
  '/:id',
  GeminiMiddleware.processRequest,
  orderController.updateOrder
);

router.delete(
  '/:id',
  GeminiMiddleware.processRequest,
  orderController.deleteOrder
);

router.post(
  '/:id/analyze',
  GeminiMiddleware.processRequest,
  orderController.analyzeOrder
);

export default router;