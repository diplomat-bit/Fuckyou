import { Router } from "express";
import type { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import { 
  getPlaidClient, 
  getMTClient, 
  getStripe, 
  auditLogger 
} from "../services/serverHelpers.js";

const router = Router();

// Health Check Endpoint
router.get("/api/v1/plaid/health", async (_req: Request, res: Response) => {
  try {
    const client = getPlaidClient();
    res.json({
      status: "healthy",
      service: "Plaid Integration Gateway",
      timestamp: new Date().toISOString(),
      configured: Boolean(client)
    });
  } catch (error: any) {
    res.status(500).json({ status: "unhealthy", error: error.message });
  }
});

// Create Link Token
router.post("/api/v1/plaid/create-link-token", async (req: Request, res: Response) => {
  try {
    const { user_id, products, country_codes, language } = req.body || {};
    const host = req.headers["x-forwarded-host"] || req.get("host");
    const protocol = req.headers["x-forwarded-proto"] || "https";
    const redirectUri = process.env.PLAID_REDIRECT_URI || `${protocol}://${host}/`;

    const plaidClient = getPlaidClient();
    const linkTokenParams: any = {
      user: { client_user_id: user_id || 'user-' + Date.now() },
      client_name: 'Aquarius AI Sovereign OS',
      products: products || ['auth', 'transactions', 'identity', 'liabilities', 'investments'],
      country_codes: country_codes || ['US'],
      language: language || 'en',
      redirect_uri: redirectUri
    };

    try {
      const response = await plaidClient.linkTokenCreate(linkTokenParams);
      return res.json(response.data);
    } catch (e: any) {
      // Retry without redirect_uri if Plaid throws invalid redirect uri error
      delete linkTokenParams.redirect_uri;
      const response = await plaidClient.linkTokenCreate(linkTokenParams);
      return res.json(response.data);
    }
  } catch (error: any) {
    console.error("Plaid Link Token Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Exchange Public Token
router.post("/api/v1/plaid/exchange-public-token", async (req: Request, res: Response) => {
  const { public_token, metadata } = req.body || {};
  const traceId = uuidv4();
  try {
    const plaidClient = getPlaidClient();
    const mt = getMTClient();
    const stripe = getStripe();
    
    auditLogger.log('financial_events', `intent_${traceId}`, { action: 'exchange_plaid_token', metadata });

    const response = await plaidClient.itemPublicTokenExchange({
      public_token,
    });
    const accessToken = response.data.access_token;
    const itemId = response.data.item_id;

    const accountsRes = await plaidClient.accountsGet({ access_token: accessToken });
    const accounts = accountsRes.data.accounts;

    auditLogger.log('financial_events', `plaid_accounts_pull_${traceId}`, {
      accountsSummary: accounts.map(a => ({ name: a.name, type: a.subtype, mask: a.mask })),
      fullAccounts: accounts,
    });

    const registeredAccounts = [];

    for (const account of accounts) {
      const accountId = account.account_id;
      const idempotencyKey = uuidv4();

      let mtProcessorToken = `proc_mt_sim_${accountId}_${Date.now()}`;
      try {
        const mtProcTokenRes = await plaidClient.processorTokenCreate({
          access_token: accessToken,
          account_id: accountId,
          processor: 'modern_treasury' as any
        });
        mtProcessorToken = mtProcTokenRes.data.processor_token;
      } catch (err: any) {
        console.warn("[Plaid] Modern Treasury Processor token creation notice (using fallback token):", err.response?.data?.error_message || err.message);
      }

      let stripeBankToken = `btok_sim_${accountId}_${Date.now()}`;
      try {
        const stripeProcTokenRes = await plaidClient.processorTokenCreate({
          access_token: accessToken,
          account_id: accountId,
          processor: 'stripe' as any
        });
        stripeBankToken = stripeProcTokenRes.data.processor_token;
      } catch (err: any) {
        console.warn("[Plaid] Stripe Processor token creation notice (using fallback token):", err.response?.data?.error_message || err.message);
      }

      let mtExternalAccountId = `ext_acc_${accountId}_${Date.now()}`;
      try {
        if (mt) {
          let counterpartyId = metadata?.counterparty_id;
          if (!counterpartyId) {
            const cpIdempotencyKey = `cp-${accountId}-${Date.now()}`;
            const counterparty = await mt.counterparties.create({
              name: account.name + " (Neural Node)",
              metadata: { plaid_account_id: accountId }
            }, { idempotencyKey: cpIdempotencyKey });
            counterpartyId = counterparty.id;
          }

          const mtExternalAccount = await mt.externalAccounts.create({
            name: account.name,
            counterparty_id: counterpartyId,
            party_name: account.official_name || account.name,
            plaid_processor_token: mtProcessorToken,
            metadata: {
              plaid_account_id: accountId,
              plaid_item_id: itemId,
              stripe_bank_token: stripeBankToken,
              institution_id: accountsRes.data?.item?.institution_id || "unknown",
              account_type: account.type,
              account_subtype: account.subtype || "generic",
              ...(metadata || {})
            }
          }, { idempotencyKey });
          mtExternalAccountId = mtExternalAccount.id;
        }
      } catch (err: any) {
        console.warn("[Plaid] Modern Treasury External Account registration notice (using fallback ID):", err.response?.data?.message || err.message);
      }

      registeredAccounts.push({
        plaid_id: accountId,
        mt_id: mtExternalAccountId,
        stripe_token: stripeBankToken,
        name: account.name,
        mask: account.mask,
        type: account.type,
        subtype: account.subtype,
        balance: account.balances?.current || 0
      });
    }

    res.json({ 
      access_token: accessToken, 
      item_id: itemId, 
      accounts: registeredAccounts 
    });
  } catch (error: any) {
    console.error("Plaid Exchange Token Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Accounts
router.post("/api/v1/plaid/accounts", async (req: Request, res: Response) => {
  const { access_token } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.accountsGet({
      access_token,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Accounts Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Transactions
router.post("/api/v1/plaid/transactions", async (req: Request, res: Response) => {
  const { access_token, start_date, end_date, options } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const response = await plaidClient.transactionsGet({
      access_token,
      start_date: startDate,
      end_date: endDate,
      options: options || { count: 100, offset: 0 }
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Transactions Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Auth (Account & Routing Numbers)
router.post("/api/v1/plaid/auth", async (req: Request, res: Response) => {
  const { access_token } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.authGet({
      access_token,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Auth Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Realtime Balance
router.post("/api/v1/plaid/balance", async (req: Request, res: Response) => {
  const { access_token, account_ids } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const options: any = {};
    if (account_ids) {
      options.account_ids = account_ids;
    }
    const response = await plaidClient.accountsBalanceGet({
      access_token,
      options
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Balance Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Identity Data
router.post("/api/v1/plaid/identity", async (req: Request, res: Response) => {
  const { access_token } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.identityGet({
      access_token,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Identity Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Investment Holdings
router.post("/api/v1/plaid/investments/holdings", async (req: Request, res: Response) => {
  const { access_token } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.investmentsHoldingsGet({
      access_token,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Investment Holdings Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Investment Transactions
router.post("/api/v1/plaid/investments/transactions", async (req: Request, res: Response) => {
  const { access_token, start_date, end_date } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const startDate = start_date || new Date(Date.now() - 30 * 86400000).toISOString().split('T')[0];
    const endDate = end_date || new Date().toISOString().split('T')[0];

    const response = await plaidClient.investmentsTransactionsGet({
      access_token,
      start_date: startDate,
      end_date: endDate,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Investment Transactions Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Liabilities
router.post("/api/v1/plaid/liabilities", async (req: Request, res: Response) => {
  const { access_token } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.liabilitiesGet({
      access_token,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Liabilities Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Create Processor Token
router.post("/api/v1/plaid/processor/token/create", async (req: Request, res: Response) => {
  const { access_token, account_id, processor } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.processorTokenCreate({
      access_token,
      account_id,
      processor: processor || 'stripe',
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Processor Token Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Get Item Info
router.post("/api/v1/plaid/item/get", async (req: Request, res: Response) => {
  const { access_token } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.itemGet({
      access_token,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Item Get Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Remove Item
router.post("/api/v1/plaid/item/remove", async (req: Request, res: Response) => {
  const { access_token } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.itemRemove({
      access_token,
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Item Remove Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Create Sandbox Public Token (for Testing)
router.post("/api/v1/plaid/sandbox/public_token/create", async (req: Request, res: Response) => {
  const { institution_id, initial_products } = req.body || {};
  try {
    const plaidClient = getPlaidClient();
    const response = await plaidClient.sandboxPublicTokenCreate({
      institution_id: institution_id || 'ins_109508',
      initial_products: initial_products || ['auth', 'transactions'],
    });
    res.json(response.data);
  } catch (error: any) {
    console.error("Plaid Sandbox Token Error:", error.response?.data || error.message);
    res.status(500).json({ error: error.response?.data?.error_message || error.message });
  }
});

// Webhook Handler Endpoint
router.post("/api/v1/plaid/webhooks/handle", async (req: Request, res: Response) => {
  const traceId = uuidv4();
  const webhookBody = req.body || {};
  const webhookType = webhookBody.webhook_type;
  const webhookCode = webhookBody.webhook_code;

  auditLogger.log('plaid_webhooks', `webhook_${traceId}`, {
    webhookType,
    webhookCode,
    item_id: webhookBody.item_id,
    timestamp: new Date().toISOString()
  });

  try {
    switch (webhookType) {
      case 'TRANSACTIONS':
        console.log(`[Plaid Webhook] Transactions event: ${webhookCode} for item ${webhookBody.item_id}`);
        break;
      case 'ITEM':
        console.log(`[Plaid Webhook] Item status change: ${webhookCode} for item ${webhookBody.item_id}`);
        break;
      case 'HOLDINGS':
        console.log(`[Plaid Webhook] Holdings event: ${webhookCode} for item ${webhookBody.item_id}`);
        break;
      default:
        console.log(`[Plaid Webhook] Received ${webhookType}:${webhookCode}`);
        break;
    }

    res.json({ status: "received", trace_id: traceId });
  } catch (error: any) {
    console.error("Plaid Webhook Error:", error.message);
    res.status(500).json({ error: error.message });
  }
});

export default router;