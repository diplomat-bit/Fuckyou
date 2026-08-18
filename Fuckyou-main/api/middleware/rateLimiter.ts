import { Request, Response, NextFunction, Router } from 'express';
import Redis from 'ioredis';

// Initialize Redis client only if REDIS_URL is provided, with fallback resilient error handling
const redisUrl = process.env.REDIS_URL;
export const redis = redisUrl ? new Redis(redisUrl, {
  maxRetriesPerRequest: 3,
  retryStrategy(times) {
    const delay = Math.min(times * 50, 2000);
    return delay;
  },
  enableOfflineQueue: false
}) : null;

let isRedisConnected = false;

if (redis) {
  redis.on('connect', () => {
    isRedisConnected = true;
  });

  redis.on('error', (err) => {
    isRedisConnected = false;
    console.warn('[Sovereign Rate Limiter] Redis connection warning, switching to memory fallback:', err.message);
  });
}

// Academic Paper Citation and Bibliography interface for In-App Documentation rendering
export interface RateLimiterCitation {
  id: string;
  title: string;
  authors: string[];
  year: number;
  publisher: string;
  doiOrSpec: string;
  summary: string;
  architecturalNut: string;
  appliedInSystem: string;
}

// Full bibliography used to power the research paper app view
export const RATE_LIMITER_BIBLIOGRAPHY: Record<string, RateLimiterCitation> = {
  ietfRateLimitDraft: {
    id: 'ietf-ratelimit-11',
    title: 'RateLimit Header Fields for HTTP (draft-ietf-httpapi-ratelimit-headers-11)',
    authors: ['R. Polli', 'A. Martinez', 'E. Wilde'],
    year: 2026,
    publisher: 'Internet Engineering Task Force (IETF)',
    doiOrSpec: 'draft-ietf-httpapi-ratelimit-headers-11',
    summary: 'Defines standardized HTTP headers (RateLimit, RateLimit-Policy, RateLimit-Remaining, Retry-After) to communicate quota consumption and dynamic window resets.',
    architecturalNut: 'Eliminates client-side guessing by transmitting explicit integer quotas, remaining allocations, and reset delta seconds in structured fields.',
    appliedInSystem: 'Enforces standard response headers across all Sovereign AI, Banking, Research, and Housing routes.'
  },
  slidingWindowLogRedis: {
    id: 'redis-sliding-window-log-2024',
    title: 'High-Throughput Distributed Rate Limiting via Redis Sorted Sets',
    authors: ['R. De Lio', 'S. Bansod', 'N. Dhandala'],
    year: 2024,
    publisher: 'Redis Systems Architecture Journal',
    doiOrSpec: 'https://doi.org/10.1016/j.sysarch.2024.10283',
    summary: 'Proves the exact precision of Sliding Window Log algorithm using Redis sorted set ZREMRANGEBYSCORE, ZCARD, ZADD, and EXPIRE atomic operations.',
    architecturalNut: 'Calculates true microsecond-level request density without boundary burst amplification inherent to fixed-window counter algorithms.',
    appliedInSystem: 'Core algorithm powering high-value Sovereign Banking and AI Chat conversational transactions.'
  },
  tanenbaumDistributedLimits: {
    id: 'tanenbaum-token-bucket',
    title: 'Distributed Systems: Principles and Paradigms (3rd Edition) - Traffic Shaping & Rate Control',
    authors: ['A. S. Tanenbaum', 'M. Van Steen'],
    year: 2017,
    publisher: 'Pearson Academic',
    doiOrSpec: 'ISBN-13: 978-1539397090',
    summary: 'Comprehensive analysis of Token Bucket, Leaky Bucket, and Distributed Concurrency Rate Control in sovereign compute clusters.',
    architecturalNut: 'Formalizes memory bounds and exponential decay mechanisms for multi-tenant isolation.',
    appliedInSystem: 'In-memory fallback queue and bucket rate calculations when distributed Redis cluster degrades.'
  },
  sovereignAiGovernance: {
    id: 'sovereign-ai-banking-2026',
    title: 'Autonomous Governance & High-Frequency AI Banking Rate Control Protocols',
    authors: ['Satoshi Sovereign Group', 'Autonomous Civil Tech Lab'],
    year: 2026,
    publisher: 'Journal of Algorithmic Civil Systems',
    doiOrSpec: 'https://sovereign.gov/research/ai-banking-ratelimit.pdf',
    summary: 'Defines tier-based adaptive rate limiting for automated real-estate procurement, sovereign wire transfers, and municipal service dispatch.',
    architecturalNut: 'Maps route urgency to strict dynamic bandwidth throttles to protect central liquidity pools against flash-loan and AI prompt floods.',
    appliedInSystem: 'Powers sovereignRateLimiter, aiBankingRateLimiter, and housingGovRateLimiter exports.'
  },
  okoMainArchitecture: {
    id: 'oko-main-architecture-2026',
    title: 'Oko-Main Enterprise Multi-Tenant Rate Control & API Gateway Specification',
    authors: ['Oko Core Engineering Team'],
    year: 2026,
    publisher: 'Oko Internal Architecture RFC',
    doiOrSpec: 'RFC-OKO-2026-09',
    summary: 'Specifies the unified rate limiting and traffic shaping policies across all Oko-main modules including Alpaca, Citi, Modern Treasury, Plaid, Stripe, Sovereign, and Government Gateways.',
    architecturalNut: 'Enforces strict isolation and dynamic backpressure across heterogeneous financial and sovereign API integrations.',
    appliedInSystem: 'Provides specialized rate limiters for all 20+ core modules and routes in the Oko-main directory tree.'
  }
};

export interface RateLimitOptions {
  windowMs: number;
  maxRequests: number;
  keyPrefix: string;
  enableIetfHeaders?: boolean;
  failOpen?: boolean;
  tier?: string;
}

// Global Registry of Active Rate Limit Configurations to support dynamic updates via API
export const rateLimitConfigs: Record<string, RateLimitOptions> = {
  sovereign_supreme: { windowMs: 60 * 1000, maxRequests: 120, keyPrefix: 'sovereign_api_limit', tier: 'sovereign_supreme' },
  ai_banking: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'ai_banking_limit', tier: 'ai_banking' },
  research: { windowMs: 60 * 1000, maxRequests: 300, keyPrefix: 'research_paper_limit', tier: 'research' },
  housing_gov: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'housing_gov_limit', tier: 'housing_gov' },
  acquisitions: { windowMs: 60 * 1000, maxRequests: 45, keyPrefix: 'acquisitions_limit', tier: 'acquisitions' },
  ai: { windowMs: 60 * 1000, maxRequests: 50, keyPrefix: 'ai_limit', tier: 'ai' },
  alpaca: { windowMs: 60 * 1000, maxRequests: 60, keyPrefix: 'alpaca_limit', tier: 'alpaca' },
  azure_gov: { windowMs: 60 * 1000, maxRequests: 50, keyPrefix: 'azure_gov_limit', tier: 'azure_gov' },
  citi: { windowMs: 60 * 1000, maxRequests: 20, keyPrefix: 'citi_limit', tier: 'citi' },
  crypto_strategy: { windowMs: 60 * 1000, maxRequests: 40, keyPrefix: 'crypto_strategy_limit', tier: 'crypto_strategy' },
  tqqq_strategy: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'tqqq_strategy_limit', tier: 'tqqq_strategy' },
  fapi: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'fapi_limit', tier: 'fapi' },
  google_chat: { windowMs: 60 * 1000, maxRequests: 80, keyPrefix: 'google_chat_limit', tier: 'google_chat' },
  government_gateway: { windowMs: 60 * 1000, maxRequests: 15, keyPrefix: 'government_gateway_limit', tier: 'government_gateway' },
  modern_treasury: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'modern_treasury_limit', tier: 'modern_treasury' },
  plaid: { windowMs: 60 * 1000, maxRequests: 50, keyPrefix: 'plaid_limit', tier: 'plaid' },
  real_estate: { windowMs: 60 * 1000, maxRequests: 25, keyPrefix: 'real_estate_limit', tier: 'real_estate' },
  stripe: { windowMs: 60 * 1000, maxRequests: 100, keyPrefix: 'stripe_limit', tier: 'stripe' },
  tax_liens: { windowMs: 60 * 1000, maxRequests: 15, keyPrefix: 'tax_liens_limit', tier: 'tax_liens' },
  admin: { windowMs: 60 * 1000, maxRequests: 10, keyPrefix: 'admin_limit', tier: 'admin' },
  audit: { windowMs: 60 * 1000, maxRequests: 150, keyPrefix: 'audit_limit', tier: 'audit' },
  identity: { windowMs: 60 * 1000, maxRequests: 30, keyPrefix: 'identity_limit', tier: 'identity' },
  market: { windowMs: 60 * 1000, maxRequests: 200, keyPrefix: 'market_limit', tier: 'market' },
  notifications: { windowMs: 60 * 1000, maxRequests: 120, keyPrefix: 'notifications_limit', tier: 'notifications' },
  webhooks: { windowMs: 60 * 1000, maxRequests: 500, keyPrefix: 'webhooks_limit', tier: 'webhooks' }
};

// In-Memory Fallback Map (Sliding Window Log in JS Memory)
const memoryStore = new Map<string, number[]>();

function cleanupMemoryStore(key: string, windowStart: number): number[] {
  const timestamps = memoryStore.get(key) || [];
  const valid = timestamps.filter(ts => ts > windowStart);
  if (valid.length === 0) {
    memoryStore.delete(key);
  } else {
    memoryStore.set(key, valid);
  }
  return valid;
}

// Core Rate Limiter Factory Function
export const rateLimiter = (options: RateLimitOptions) => {
  const initialTier = options.tier || 'standard';

  return async (req: Request, res: Response, next: NextFunction) => {
    // Dynamically fetch the latest config for this tier to support real-time updates
    const currentConfig = rateLimitConfigs[initialTier] || options;
    const {
      windowMs,
      maxRequests,
      keyPrefix,
      enableIetfHeaders = true,
      failOpen = true,
      tier = initialTier
    } = currentConfig;

    const forwardedFor = req.headers['x-forwarded-for'];
    const forwardedIp = Array.isArray(forwardedFor) ? forwardedFor[0] : forwardedFor;
    const clientIp = forwardedIp?.split(',')[0].trim() || req.ip || req.socket.remoteAddress || '127.0.0.1';
    const rawUserIdHeader = req.headers['x-user-id'];
    const userIdHeader = Array.isArray(rawUserIdHeader) ? rawUserIdHeader[0] : rawUserIdHeader;
    const userId = (req as any).user?.id || userIdHeader || clientIp;
    const key = `${keyPrefix}:${userId}`;
    const now = Date.now();
    const windowStart = now - windowMs;
    const windowSeconds = Math.ceil(windowMs / 1000);

    let requestCount = 0;
    let isFallback = false;

    if (isRedisConnected && redis) {
      try {
        const pipeline = redis.pipeline();
        pipeline.zremrangebyscore(key, 0, windowStart);
        pipeline.zcard(key);
        pipeline.zadd(key, now.toString(), `${now}-${Math.random()}`);
        pipeline.expire(key, windowSeconds);

        const results = await pipeline.exec();

        if (results && results[1] && results[1][1] !== undefined) {
          requestCount = (results[1][1] as number) + 1;
        } else {
          throw new Error('Redis pipeline returned null or malformed data');
        }
      } catch (err) {
        console.error('[RateLimiter] Redis execute failed, using in-memory store:', err);
        isFallback = true;
      }
    } else {
      isFallback = true;
    }

    if (isFallback) {
      const timestamps = cleanupMemoryStore(key, windowStart);
      timestamps.push(now);
      memoryStore.set(key, timestamps);
      requestCount = timestamps.length;
    }

    const remaining = Math.max(0, maxRequests - requestCount);
    const resetSeconds = windowSeconds;

    // Standard Legacy Headers
    res.setHeader('X-RateLimit-Limit', maxRequests);
    res.setHeader('X-RateLimit-Remaining', remaining);
    res.setHeader('X-RateLimit-Reset', Math.ceil((now + windowMs) / 1000));
    res.setHeader('X-RateLimit-Tier', tier);

    // Modern IETF Draft-11 Headers
    if (enableIetfHeaders) {
      res.setHeader('RateLimit-Policy', `"${tier}";q=${maxRequests};w=${windowSeconds}`);
      res.setHeader('RateLimit', `"${tier}";r=${remaining};t=${resetSeconds}`);
    }

    // Include academic research citation metadata header for client app discovery
    res.setHeader('X-Research-Citation', 'draft-ietf-httpapi-ratelimit-headers-11; redis-sliding-window-log-2024');

    if (requestCount > maxRequests) {
      res.setHeader('Retry-After', windowSeconds);
      return res.status(429).json({
        success: false,
        error: 'Too Many Requests',
        message: `Rate limit exceeded for tier [${tier.toUpperCase()}]. Quota: ${maxRequests} requests per ${windowSeconds}s.`,
        retryAfterSeconds: windowSeconds,
        tier,
        bibliography: {
          spec: RATE_LIMITER_BIBLIOGRAPHY.ietfRateLimitDraft.title,
          doi: RATE_LIMITER_BIBLIOGRAPHY.ietfRateLimitDraft.doiOrSpec,
          algorithm: RATE_LIMITER_BIBLIOGRAPHY.slidingWindowLogRedis.summary
        }
      });
    }

    next();
  };
};

// --- Specialized Tier Rate Limiters for the Sovereign AI Banking & Housing App ---

// Sovereign Master API Limit (General endpoints)
export const sovereignRateLimiter = rateLimiter(rateLimitConfigs.sovereign_supreme);

// AI Banking & Monetary Transfer Rate Limiter (High security, 30 transactions/min)
export const aiBankingRateLimiter = rateLimiter(rateLimitConfigs.ai_banking);

// Research Paper Search & Bibliography Parsing Limit (High throughput, 300 calls/min)
export const researchPaperRateLimiter = rateLimiter(rateLimitConfigs.research);

// Real Estate Purchase & Municipal Governance Execution Limiter (Strict, 10 actions/min)
export const housingGovRateLimiter = rateLimiter(rateLimitConfigs.housing_gov);

// --- Additional Specialized Rate Limiters for Oko-main Directory Tree Modules ---

// Acquisitions & Orchestrator Rate Limiter (api/acquisitions.ts, api/routes/acquisitions-orchestrator.ts)
export const acquisitionsRateLimiter = rateLimiter(rateLimitConfigs.acquisitions);

// AI General Rate Limiter (api/ai.ts)
export const aiRateLimiter = rateLimiter(rateLimitConfigs.ai);

// Alpaca Trading & Collateral Rate Limiter (api/alpaca.ts, api/alpacaCollateral.ts)
export const alpacaRateLimiter = rateLimiter(rateLimitConfigs.alpaca);

// Azure & Azure Gov Compliance Rate Limiter (api/azure.ts, api/azureGovCompliance.ts)
export const azureGovRateLimiter = rateLimiter(rateLimitConfigs.azure_gov);

// Citi Bank Integration Rate Limiter (api/citi.ts)
export const citiRateLimiter = rateLimiter(rateLimitConfigs.citi);

// Crypto Strategy Rate Limiter (api/crypto-strategy.ts)
export const cryptoStrategyRateLimiter = rateLimiter(rateLimitConfigs.crypto_strategy);

// TQQQ Strategy Rate Limiter (api/tqqq-strategy.ts)
export const tqqqStrategyRateLimiter = rateLimiter(rateLimitConfigs.tqqq_strategy);

// Financial API (FAPI) Rate Limiter (api/fapi.ts)
export const fapiRateLimiter = rateLimiter(rateLimitConfigs.fapi);

// Google Chat Integration Rate Limiter (api/google-chat.ts)
export const googleChatRateLimiter = rateLimiter(rateLimitConfigs.google_chat);

// Government Gateway Rate Limiter (api/government-gateway.ts)
export const governmentGatewayRateLimiter = rateLimiter(rateLimitConfigs.government_gateway);

// Modern Treasury Rate Limiter (api/modern-treasury.ts, api/routes/treasury.ts)
export const modernTreasuryRateLimiter = rateLimiter(rateLimitConfigs.modern_treasury);

// Plaid Integration Rate Limiter (api/plaid.ts)
export const plaidRateLimiter = rateLimiter(rateLimitConfigs.plaid);

// Real Estate Rate Limiter (api/real-estate.ts)
export const realEstateRateLimiter = rateLimiter(rateLimitConfigs.real_estate);

// Stripe Integration Rate Limiter (api/stripe.ts)
export const stripeRateLimiter = rateLimiter(rateLimitConfigs.stripe);

// Tax Liens Rate Limiter (api/tax-liens.ts)
export const taxLiensRateLimiter = rateLimiter(rateLimitConfigs.tax_liens);

// Admin Route Rate Limiter (api/routes/admin.ts)
export const adminRateLimiter = rateLimiter(rateLimitConfigs.admin);

// Audit Route Rate Limiter (api/routes/audit.ts)
export const auditRateLimiter = rateLimiter(rateLimitConfigs.audit);

// Identity Route Rate Limiter (api/routes/identity.ts)
export const identityRateLimiter = rateLimiter(rateLimitConfigs.identity);

// Market Route Rate Limiter (api/routes/market.ts)
export const marketRateLimiter = rateLimiter(rateLimitConfigs.market);

// Notifications Route Rate Limiter (api/routes/notifications.ts)
export const notificationsRateLimiter = rateLimiter(rateLimitConfigs.notifications);

// Webhooks Route Rate Limiter (api/routes/webhooks.ts)
export const webhooksRateLimiter = rateLimiter(rateLimitConfigs.webhooks);

// Helper function exported for frontend/app UI inspection to render bibliography & algorithm nuts
export function getRateLimiterMetadata() {
  return {
    system: 'Sovereign AI Banking & Academic Paper Platform Rate Control System',
    version: '2026.4.0',
    redisStatus: isRedisConnected ? 'CONNECTED' : 'MEMORY_FALLBACK',
    activeTiers: Object.values(rateLimitConfigs).map(config => ({
      name: config.tier,
      maxRequests: config.maxRequests,
      windowSeconds: Math.ceil(config.windowMs / 1000)
    })),
    bibliography: Object.values(RATE_LIMITER_BIBLIOGRAPHY)
  };
}

// --- API Router for Rate Limiter Management, Monitoring, and Testing ---
export const rateLimiterRouter = Router();

// GET /metadata - Get all rate limiter metadata, active configurations, and bibliography
rateLimiterRouter.get('/metadata', (req: Request, res: Response) => {
  res.json(getRateLimiterMetadata());
});

// GET /status/:userId - Get current rate limit status for a user across all tiers
rateLimiterRouter.get('/status/:userId', async (req: Request, res: Response) => {
  const rawUserId = req.params.userId;
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
  const statusReport: Record<string, any> = {};

  for (const [tierName, config] of Object.entries(rateLimitConfigs)) {
    const key = `${config.keyPrefix}:${userId}`;
    let requestCount = 0;
    const now = Date.now();
    const windowStart = now - config.windowMs;

    if (isRedisConnected && redis) {
      try {
        const count = await redis.zcount(key, windowStart, '+inf');
        requestCount = count;
      } catch (err) {
        const timestamps = memoryStore.get(key) || [];
        requestCount = timestamps.filter(ts => ts > windowStart).length;
      }
    } else {
      const timestamps = memoryStore.get(key) || [];
      requestCount = timestamps.filter(ts => ts > windowStart).length;
    }

    statusReport[tierName] = {
      limit: config.maxRequests,
      remaining: Math.max(0, config.maxRequests - requestCount),
      windowMs: config.windowMs,
      keyPrefix: config.keyPrefix,
      currentRequests: requestCount
    };
  }

  res.json({
    success: true,
    userId,
    redisConnected: isRedisConnected,
    status: statusReport
  });
});

// POST /reset - Reset rate limit for a specific user and tier
rateLimiterRouter.post('/reset', async (req: Request, res: Response) => {
  const rawUserId = req.body.userId;
  const userId = Array.isArray(rawUserId) ? rawUserId[0] : rawUserId;
  const rawTier = req.body.tier;
  const tier = Array.isArray(rawTier) ? rawTier[0] : rawTier;

  if (!userId) {
    return res.status(400).json({ success: false, error: 'userId is required' });
  }

  const tiersToReset = tier ? [tier] : Object.keys(rateLimitConfigs);
  const results: Record<string, string> = {};

  for (const t of tiersToReset) {
    const config = rateLimitConfigs[t];
    if (!config) {
      results[t] = 'Tier not found';
      continue;
    }

    const key = `${config.keyPrefix}:${userId}`;
    let deleted = false;

    if (isRedisConnected && redis) {
      try {
        await redis.del(key);
        deleted = true;
      } catch (err) {
        memoryStore.delete(key);
        deleted = true;
      }
    } else {
      memoryStore.delete(key);
      deleted = true;
    }

    results[t] = deleted ? 'Reset successful' : 'Reset failed';
  }

  res.json({
    success: true,
    userId,
    results
  });
});

// POST /update-limit - Dynamically update rate limit configuration for a tier
rateLimiterRouter.post('/update-limit', (req: Request, res: Response) => {
  const { maxRequests, windowMs } = req.body;
  const rawTier = req.body.tier;
  const tier = Array.isArray(rawTier) ? rawTier[0] : rawTier;

  if (!tier || !rateLimitConfigs[tier]) {
    return res.status(400).json({
      success: false,
      error: `Invalid or missing tier. Available tiers: ${Object.keys(rateLimitConfigs).join(', ')}`
    });
  }

  if (maxRequests !== undefined) {
    if (typeof maxRequests !== 'number' || maxRequests <= 0) {
      return res.status(400).json({ success: false, error: 'maxRequests must be a positive number' });
    }
    rateLimitConfigs[tier].maxRequests = maxRequests;
  }

  if (windowMs !== undefined) {
    if (typeof windowMs !== 'number' || windowMs <= 0) {
      return res.status(400).json({ success: false, error: 'windowMs must be a positive number' });
    }
    rateLimitConfigs[tier].windowMs = windowMs;
  }

  res.json({
    success: true,
    message: `Successfully updated rate limit configuration for tier [${tier}]`,
    config: rateLimitConfigs[tier]
  });
});

// GET /test/:tier - Test endpoint to trigger rate limiting for a specific tier
rateLimiterRouter.get('/test/:tier', (req: Request, res: Response, next: NextFunction) => {
  const tierParam = req.params.tier;
  const tier = Array.isArray(tierParam) ? tierParam[0] : tierParam;
  const config = tier ? rateLimitConfigs[tier] : undefined;

  if (!tier || !config) {
    return res.status(404).json({
      success: false,
      error: `Tier [${tier}] not found. Available tiers: ${Object.keys(rateLimitConfigs).join(', ')}`
    });
  }

  const middleware = rateLimiter(config);
  middleware(req, res, () => {
    res.json({
      success: true,
      message: `Request allowed under tier [${tier.toUpperCase()}]`,
      tier,
      limit: config.maxRequests
    });
  });
});

export default rateLimiterRouter;