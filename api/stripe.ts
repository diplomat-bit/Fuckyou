import { Router, raw } from "express";
import type { Request, Response } from "express";
import { 
  getStripe, 
  getAlpaca, 
  loadSecrets, 
  stripeEventsCache, 
  financialAccountsStore, 
  PRODUCT_CATALOG 
} from "../services/serverHelpers.js";
import { logger } from "./utils/logger.js";
import { complianceEngine } from "./utils/complianceEngine.js";

const router = Router();

/**
 * @route POST /api/v1/stripe/webhook
 * @desc Handles incoming Stripe webhooks with signature verification
 */
router.post("/api/v1/stripe/webhook", raw({ type: 'application/json' }), async (req: Request, res: Response) => {
  const stripeSig = req.headers['stripe-signature'] as string;
  try {
    const stripe = getStripe();
    let event;
    
    if (stripeSig) {
      const webhookSecret = process.env.STRIPE_WEBHOOK_SECRET || loadSecrets().STRIPE_WEBHOOK_SECRET;
      event = webhookSecret 
        ? stripe.webhooks.constructEvent(req.body, stripeSig, webhookSecret)
        : JSON.parse(req.body.toString());
    } else {
      event = JSON.parse(req.body.toString());
    }

    if (event) {
      logger.info(`Stripe Webhook Event Parsed: ${event.type}`);
      stripeEventsCache.push({
        id: event.id || `evt_${Date.now()}`,
        type: event.type,
        data: event.data?.object,
        created: event.created || Math.floor(Date.now() / 1000)
      });
      if (stripeEventsCache.length > 50) stripeEventsCache.shift();
    }
    res.json({ received: true });
  } catch (err: any) {
    logger.error(`Stripe Webhook failure: ${err.message}`);
    res.status(400).send(`Webhook Error: ${err.message}`);
  }
});

/**
 * @route GET /api/v1/stripe/events
 * @desc Retrieves cached Stripe events
 */
router.get("/api/v1/stripe/events", (req: Request, res: Response) => {
  res.json(stripeEventsCache);
});

/**
 * @route POST /api/v1/stripe/simulate-event
 * @desc Simulates a Stripe event for testing purposes
 */
router.post("/api/v1/stripe/simulate-event", (req: Request, res: Response) => {
  const { type, payload } = req.body;
  const mockEvent = {
    id: `evt_mock_${Date.now()}`,
    type: type || 'payment_intent.succeeded',
    data: payload || {},
    created: Math.floor(Date.now() / 1000)
  };
  stripeEventsCache.push(mockEvent);
  if (stripeEventsCache.length > 50) stripeEventsCache.shift();
  res.json({ success: true, event: mockEvent });
});

/**
 * @route GET /api/v1/stripe/treasury/financial_accounts
 * @desc Lists financial accounts from Stripe or local store
 */
router.get("/api/v1/stripe/treasury/financial_accounts", async (req: Request, res: Response) => {
  const stripeAccount = (req.headers['stripe-account'] as string) || req.query.connectedAccountId as string;
  try {
    const stripe = getStripe();
    if (stripeAccount) {
      try {
        const faList = await (stripe.treasury as any).financialAccounts.list({}, { stripeAccount });
        return res.json(faList.data || faList);
      } catch (e: any) {
        logger.warn("Stripe Treasury API fallback to in-memory store");
      }
    }
    res.json(financialAccountsStore);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/v1/stripe/treasury/financial_accounts
 * @desc Creates a new financial account
 */
router.post("/api/v1/stripe/treasury/financial_accounts", async (req: Request, res: Response) => {
  const stripeAccount = (req.headers['stripe-account'] as string) || req.body.connectedAccountId;
  const { nickname, supportedCurrencies, features, metadata } = req.body;
  
  try {
    const stripe = getStripe();
    if (stripeAccount) {
      try {
        const createdFA = await (stripe.treasury as any).financialAccounts.create({
          supported_currencies: supportedCurrencies || ['usd'],
          nickname,
          features,
          metadata
        }, { stripeAccount });
        return res.json(createdFA);
      } catch (e: any) {
        logger.warn("Stripe Treasury SDK create error, using sandbox simulation");
      }
    }

    const newAccount = {
      object: "treasury.financial_account",
      id: `fa_${Date.now()}`,
      nickname: nickname || "Platform Account",
      status: "open",
      metadata: metadata || {}
    };
    financialAccountsStore.unshift(newAccount);
    res.status(201).json(newAccount);
  } catch (err: any) {
    res.status(500).json({ error: err.message });
  }
});

/**
 * @route POST /api/v1/stripe/create-checkout-session
 * @desc Creates a Stripe Checkout session for payments or subscriptions
 */
router.post("/api/v1/stripe/create-checkout-session", async (req: Request, res: Response) => {
  try {
    const stripe = getStripe();
    const { priceId, amount, productId } = req.body;
    
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [{
        price_data: {
          currency: 'usd',
          product_data: { name: 'Sovereign OS Service' },
          unit_amount: Math.round((amount || 29) * 100),
        },
        quantity: 1,
      }],
      mode: 'payment',
      success_url: `${process.env.BASE_URL}/?success=true`,
      cancel_url: `${process.env.BASE_URL}/?canceled=true`,
    });
    
    res.json({ id: session.id, url: session.url });
  } catch (error: any) {
    logger.error("Stripe Checkout Error:", error);
    res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/v1/stripe/sweep
 * @desc Sweeps funds from Stripe to Alpaca via Journal
 */
router.post("/api/v1/stripe/sweep", async (req: Request, res: Response) => {
  const { amountUSD, destinationAlpacaAccount } = req.body;
  try {
    const isCompliant = await complianceEngine.validateSweep(amountUSD, destinationAlpacaAccount);
    if (!isCompliant) return res.status(403).json({ error: "Compliance check failed" });

    const stripe = getStripe();
    const pi = await stripe.paymentIntents.create({
      amount: Math.round(amountUSD * 100),
      currency: 'usd',
      payment_method_types: ['card']
    });

    const alpaca = getAlpaca();
    const journal = await (alpaca.trading as any).createJournal({
      from_account: 'FIRM_STRIPE_OMNIBUS_VAULT',
      to_account: destinationAlpacaAccount,
      amount: amountUSD.toFixed(2),
      entry_type: 'JNLC'
    });

    res.json({ status: 'COMPLETED', pi: pi.id, journal: journal.id });
  } catch (error: any) {
    res.status(500).json({ error: error.message });
  }
});

export default router;