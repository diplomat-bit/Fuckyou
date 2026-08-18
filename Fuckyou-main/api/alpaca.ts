import { Router } from "express";
import type { Request, Response } from "express";
import { getAlpaca, loadSecrets } from "../services/serverHelpers.js";
import authenticate from "./middleware/auths.js";
import { rateLimiter } from "./middleware/rateLimiter.js";
import { logger } from "./utils/logger";
import { complianceEngine } from "./utils/complianceEngine";
import { ledgerSync } from "./utils/ledgerSync.js";

const router = Router();

// Apply global middleware for this router
router.use(authenticate as any);
router.use(rateLimiter as any);

/**
 * @route GET /api/v1/alpaca/config-status
 * @desc Retrieve Alpaca configuration status
 */
router.get("/config-status", async (req: Request, res: Response) => {
  try {
    const secrets = loadSecrets();
    const keyId =
      process.env.APCA_API_KEY_ID ||
      process.env.ALPACA_API_KEY ||
      secrets.APCA_API_KEY_ID ||
      secrets.ALPACA_API_KEY;
    const isConfigured = !!keyId && keyId !== "dummy_key";
    
    res.json({
      configured: isConfigured,
      keyId: isConfigured ? `${keyId.slice(0, 4)}...${keyId.slice(-4)}` : null,
      baseUrl:
        process.env.ALPACA_BASE_URL ||
        secrets.ALPACA_BASE_URL ||
        "https://paper-api.alpaca.markets/v2"
    });
  } catch (error: any) {
    logger.error("Alpaca Config Status Error", { error: error.message });
    res.status(500).json({ error: "Failed to retrieve Alpaca config status" });
  }
});

/**
 * @route GET /api/v1/alpaca/account
 * @desc Get Alpaca account summary
 */
router.get("/account", async (req: Request, res: Response) => {
  try {
    const alpaca = getAlpaca();
    const account = await alpaca.trading.account.get();
    res.json(account);
  } catch (error: any) {
    logger.error("Alpaca Account Error", { error: error.message });
    res.status(500).json({ error: "Failed to fetch Alpaca account details" });
  }
});

/**
 * @route GET /api/v1/alpaca/positions
 * @desc Get all open positions
 */
router.get("/positions", async (req: Request, res: Response) => {
  try {
    const alpaca = getAlpaca();
    const positions = await alpaca.trading.positions.get();
    res.json(positions);
  } catch (error: any) {
    logger.error("Alpaca Positions Error", { error: error.message });
    res.status(500).json({ error: "Failed to fetch positions" });
  }
});

/**
 * @route POST /api/v1/alpaca/positions/close
 * @desc Close a specific position
 */
router.post("/positions/close", async (req: Request, res: Response) => {
  try {
    const { symbol } = req.body || {};
    if (!symbol) {
      return res.status(400).json({ error: "Symbol parameter is required" });
    }
    
    // Compliance check before closing
    const isCompliant = await complianceEngine.validateTrade(symbol, "CLOSE_POSITION", 0);
    if (!isCompliant) return res.status(403).json({ error: "Compliance check failed" });

    const alpaca = getAlpaca();
    const result = await alpaca.trading.positions.close(symbol);
    
    await ledgerSync.recordTransaction({ type: "POSITION_CLOSE", symbol, status: "SUCCESS" });
    res.json(result);
  } catch (error: any) {
    logger.error("Alpaca Close Position Error", { error: error.message });
    res.status(500).json({ error: "Failed to close position" });
  }
});

/**
 * @route POST /api/v1/alpaca/positions/close-all
 * @desc Close all open positions
 */
router.post("/positions/close-all", async (req: Request, res: Response) => {
  try {
    const alpaca = getAlpaca();
    const result = await alpaca.trading.positions.closeAll({ cancelOrders: true });
    await ledgerSync.recordTransaction({ type: "CLOSE_ALL_POSITIONS", status: "SUCCESS" });
    res.json(result);
  } catch (error: any) {
    logger.error("Alpaca Close All Error", { error: error.message });
    res.status(500).json({ error: "Failed to close all positions" });
  }
});

/**
 * @route GET /api/v1/alpaca/orders
 * @desc Get orders list
 */
router.get("/orders", async (req: Request, res: Response) => {
  try {
    const alpaca = getAlpaca();
    const status = (req.query.status as string) || "open";
    const limit = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;
    const orders = await alpaca.trading.orders.get({ status, limit });
    res.json(orders);
  } catch (error: any) {
    logger.error("Alpaca Orders Error", { error: error.message });
    res.status(500).json({ error: "Failed to fetch orders" });
  }
});

/**
 * @route POST /api/v1/alpaca/orders
 * @desc Submit a new order
 */
router.post("/orders", async (req: Request, res: Response) => {
  try {
    const { symbol, qty, side, type, time_in_force, timeInForce, limit_price, stop_price } = req.body || {};

    if (!symbol || !qty || !side || !type) {
      return res.status(400).json({ error: "Missing required order parameters" });
    }

    // Compliance check before submission
    const isCompliant = await complianceEngine.validateTrade(symbol, side, Number(qty));
    if (!isCompliant) return res.status(403).json({ error: "Compliance check failed" });

    const alpaca = getAlpaca();
    const orderInput: any = {
      symbol,
      qty: String(qty),
      side,
      type,
      timeInForce: timeInForce || time_in_force || "gtc"
    };

    if (limit_price) orderInput.limitPrice = String(limit_price);
    if (stop_price) orderInput.stopPrice = String(stop_price);

    const order = await alpaca.trading.orders.post(orderInput);
    await ledgerSync.recordTransaction({ type: "ORDER_SUBMIT", symbol, side, qty: Number(qty), status: "SUCCESS" });
    res.json(order);
  } catch (error: any) {
    logger.error("Alpaca Order Submit Error", { error: error.message });
    res.status(500).json({ error: "Failed to submit order" });
  }
});

/**
 * @route DELETE /api/v1/alpaca/orders/:orderId
 * @desc Cancel an order by ID
 */
router.delete("/orders/:orderId", async (req: Request, res: Response) => {
  try {
    const { orderId } = req.params;
    const alpaca = getAlpaca();
    const result = await alpaca.trading.orders.cancel(orderId);
    await ledgerSync.recordTransaction({ type: "ORDER_CANCEL", orderId, status: "SUCCESS" });
    res.json(result);
  } catch (error: any) {
    logger.error("Alpaca Order Cancel Error", { error: error.message });
    res.status(500).json({ error: "Failed to cancel order" });
  }
});

/**
 * @route GET /api/v1/alpaca/assets
 * @desc Get tradable assets
 */
router.get("/assets", async (req: Request, res: Response) => {
  try {
    const alpaca = getAlpaca();
    const status = (req.query.status as string) || "active";
    const assetClass = req.query.asset_class as string;
    const assets = await alpaca.trading.assets.get({
      status,
      assetClass: assetClass || undefined
    });
    res.json(assets);
  } catch (error: any) {
    logger.error("Alpaca Assets Error", { error: error.message });
    res.status(500).json({ error: "Failed to fetch assets" });
  }
});

export default router;