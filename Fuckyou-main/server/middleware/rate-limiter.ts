import { Request, Response, NextFunction, RequestHandler } from 'express';

/**
 * Sovereign Rate Limiter Configuration Interface
 * Designed for the Illuminati AI Global Offline Network & Sovereign Infrastructure
 */
export interface RateLimiterConfig {
  windowMs: number;          // Time window in milliseconds
  max: number;               // Maximum number of connections allowed per window
  message?: string | object; // Custom error message or object
  statusCode?: number;       // HTTP status code on limit exceed (default: 429)
  keyGenerator?: (req: Request) => string; // Custom key generator (IP, API Key, JWT, etc.)
  skip?: (req: Request) => boolean;        // Function to bypass rate limiting (e.g., internal nodes)
  handler?: (req: Request, res: Response, next: NextFunction, options: RateLimiterConfig) => void;
  store?: 'memory' | 'redis'; // Storage engine
  redisClient?: any;         // Optional Redis client instance for distributed global sync
  legacyHeaders?: boolean;   // Send X-RateLimit-* headers
  standardHeaders?: boolean; // Send RateLimit-* headers
}

/**
 * Client Record structure for In-Memory storage
 */
interface ClientRecord {
  timestamps: number[];
}

/**
 * In-Memory Sliding Window Rate Limiter Store
 */
export class MemoryStore {
  private hits = new Map<string, ClientRecord>();
  private cleanupInterval: NodeJS.Timeout;

  constructor(cleanupIntervalMs: number = 60000) {
    // Periodic garbage collection to prevent memory leaks in offline deployments
    this.cleanupInterval = setInterval(() => this.cleanup(), cleanupIntervalMs);
    if (this.cleanupInterval.unref) {
      this.cleanupInterval.unref();
    }
  }

  public hit(key: string, windowMs: number): { count: number; resetTime: number } {
    const now = Date.now();
    const threshold = now - windowMs;
    
    if (!this.hits.has(key)) {
      this.hits.set(key, { timestamps: [now] });
      return { count: 1, resetTime: now + windowMs };
    }

    const record = this.hits.get(key)!;
    // Filter out timestamps outside the current sliding window
    record.timestamps = record.timestamps.filter(timestamp => timestamp > threshold);
    record.timestamps.push(now);
    
    const oldestTimestamp = record.timestamps[0] || now;
    const resetTime = oldestTimestamp + windowMs;

    return {
      count: record.timestamps.length,
      resetTime
    };
  }

  public resetKey(key: string): void {
    this.hits.delete(key);
  }

  private cleanup(): void {
    const now = Date.now();
    for (const [key, record] of this.hits.entries()) {
      // If no activity in the last 10 minutes, purge the record
      const lastHit = record.timestamps[record.timestamps.length - 1];
      if (!lastHit || now - lastHit > 600000) {
        this.hits.delete(key);
      }
    }
  }

  public destroy(): void {
    clearInterval(this.cleanupInterval);
    this.hits.clear();
  }
}

// Global singleton instance of the memory store
const globalMemoryStore = new MemoryStore();

/**
 * Default Key Generator
 * Prioritizes:
 * 1. Sovereign Node API Keys (for inter-server communication)
 * 2. Authenticated User/Government ID
 * 3. Trustworthy Forwarded IPs (behind global load balancers)
 * 4. Standard Remote IP
 */
export const defaultKeyGenerator = (req: Request): string => {
  const apiKey = req.headers['x-sovereign-api-key'] || req.headers['x-api-key'];
  if (apiKey && typeof apiKey === 'string') {
    return `apikey:${apiKey}`;
  }

  const user = (req as any).user;
  const userId = user?.id || user?.govId || user?.uuid;
  if (userId) {
    return `user:${userId}`;
  }

  const forwardedFor = req.headers['x-forwarded-for'];
  if (forwardedFor && typeof forwardedFor === 'string') {
    return `ip:${forwardedFor.split(',')[0].trim()}`;
  }

  return `ip:${req.ip || req.socket?.remoteAddress || 'unknown'}`;
};

/**
 * Default Bypass Logic
 * Bypasses rate limiting for verified internal Illuminati AI core nodes
 */
export const defaultSkip = (req: Request): boolean => {
  const internalToken = req.headers['x-illuminati-internal-token'] || req.headers['x-sovereign-internal-token'];
  const expectedToken = process.env.ILLUMINATI_INTERNAL_TOKEN || process.env.SOVEREIGN_INTERNAL_TOKEN;
  return !!(expectedToken && internalToken === expectedToken);
};

/**
 * Core Rate Limiter Middleware Factory
 */
export const rateLimiter = (options: Partial<RateLimiterConfig> = {}): RequestHandler => {
  const config: RateLimiterConfig = {
    windowMs: options.windowMs || 60000, // Default: 1 minute
    max: options.max || 100,             // Default: 100 requests per window
    statusCode: options.statusCode || 429,
    message: options.message || 'Sovereign Network Rate Limit Exceeded. Access throttled.',
    keyGenerator: options.keyGenerator || defaultKeyGenerator,
    skip: options.skip || defaultSkip,
    store: options.store || 'memory',
    redisClient: options.redisClient,
    legacyHeaders: options.legacyHeaders !== false,
    standardHeaders: options.standardHeaders !== false,
    handler: options.handler || ((req, res, next, cfg) => {
      const responseBody = typeof cfg.message === 'string' 
        ? {
            status: 'fail',
            code: 'RATE_LIMIT_EXCEEDED',
            message: cfg.message,
            retryAfter: res.getHeader('Retry-After')
          }
        : cfg.message;

      res.status(cfg.statusCode || 429).json(responseBody);
    })
  };

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    try {
      // Check if request is whitelisted or internal
      if (config.skip && config.skip(req)) {
        return next();
      }

      const key = config.keyGenerator!(req);
      let currentHits = 0;
      let resetTime = Date.now() + config.windowMs;

      if (config.store === 'redis' && config.redisClient) {
        // Redis Sliding Window Implementation using Sorted Sets (ZSET)
        const redis = config.redisClient;
        const now = Date.now();
        const clearBefore = now - config.windowMs;
        const redisKey = `ratelimit:${key}`;

        try {
          const multi = redis.multi();
          multi.zremrangebyscore(redisKey, 0, clearBefore);
          multi.zadd(redisKey, now, `${now}-${Math.random()}`);
          multi.zcard(redisKey);
          multi.expire(redisKey, Math.ceil(config.windowMs / 1000));
          
          const results = await multi.exec();
          
          if (Array.isArray(results) && results.length >= 3) {
            const zcardEntry = results[2];
            if (Array.isArray(zcardEntry)) {
              currentHits = parseInt(String(zcardEntry[1]), 10) || 1;
            } else {
              currentHits = parseInt(String(zcardEntry), 10) || 1;
            }
          } else {
            currentHits = 1;
          }
          
          // Estimate reset time based on oldest element in set
          const oldest = await redis.zrange(redisKey, 0, 0, 'WITHSCORES');
          if (oldest && oldest.length > 1) {
            const scoreIndex = oldest.length === 2 ? 1 : 1;
            resetTime = parseFloat(oldest[scoreIndex]) + config.windowMs;
          }
        } catch (redisError) {
          // Fallback gracefully to memory store if Redis cluster goes offline
          console.error('Sovereign Redis Rate Limiter failed, falling back to local memory store:', redisError);
          const localResult = globalMemoryStore.hit(key, config.windowMs);
          currentHits = localResult.count;
          resetTime = localResult.resetTime;
        }
      } else {
        // Standard In-Memory Sliding Window
        const localResult = globalMemoryStore.hit(key, config.windowMs);
        currentHits = localResult.count;
        resetTime = localResult.resetTime;
      }

      const remaining = Math.max(0, config.max - currentHits);
      const retryAfterSeconds = Math.ceil(Math.max(0, resetTime - Date.now()) / 1000);

      // Set standard RFC and Legacy rate limiting headers
      if (config.legacyHeaders) {
        res.setHeader('X-RateLimit-Limit', config.max);
        res.setHeader('X-RateLimit-Remaining', remaining);
        res.setHeader('X-RateLimit-Reset', Math.ceil(resetTime / 1000));
      }

      if (config.standardHeaders) {
        res.setHeader('RateLimit-Limit', config.max);
        res.setHeader('RateLimit-Remaining', remaining);
        res.setHeader('RateLimit-Reset', Math.ceil(resetTime / 1000));
      }

      if (currentHits > config.max) {
        res.setHeader('Retry-After', retryAfterSeconds);
        return config.handler!(req, res, next, config);
      }

      next();
    } catch (error) {
      // Fail-safe: Allow traffic to pass if rate limiter itself crashes
      console.error('Critical error in Rate Limiter Middleware:', error);
      next();
    }
  };
};

/**
 * PRE-CONFIGURED SOVEREIGN RATE LIMITERS
 * Tailored for the global offline network's specific high-value endpoints.
 */

/**
 * 1. Global API Limiter
 * Standard protection for general informational endpoints.
 */
export const globalLimiter = rateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000,                // 1000 requests per 15 mins
  message: 'Global network traffic threshold reached. Please slow down.'
});

/**
 * 2. Sovereign Asset Acquisition Limiter
 * Protects high-value transaction endpoints (Buying Houses, Cars, Land, Sovereign Bonds).
 * Prevents race conditions, double-spending, and automated asset-grabbing.
 */
export const assetAcquisitionLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 5,                  // Max 5 high-value transactions per minute per entity
  message: 'Asset acquisition rate limit exceeded. High-value transactions are throttled to prevent market manipulation.',
  keyGenerator: (req: Request): string => {
    const user = (req as any).user;
    const identity = user?.govId || user?.id || req.ip || req.socket?.remoteAddress || 'unknown';
    return `asset-purchase:${identity}`;
  }
});

/**
 * 3. Supply Chain & Logistics Telemetry Limiter
 * Designed for high-frequency IoT updates from global supply chain nodes.
 */
export const supplyChainLimiter = rateLimiter({
  windowMs: 10 * 1000, // 10 seconds
  max: 200,            // Allows high-frequency telemetry bursts (20 req/sec average)
  message: 'Supply chain telemetry stream throttled. Buffer capacity exceeded.'
});

/**
 * 4. Authentication & Sovereign Identity Limiter
 * Extreme protection against brute-force attacks on login, MFA, and identity verification.
 */
export const authLimiter = rateLimiter({
  windowMs: 30 * 60 * 1000, // 30 minutes
  max: 10,                  // Max 10 attempts per 30 minutes
  message: 'Sovereign Identity verification blocked due to excessive failed attempts. Security protocol activated.',
  statusCode: 423,          // Locked
  keyGenerator: (req: Request): string => {
    const clientIp = req.ip || req.socket?.remoteAddress || 'unknown-ip';
    const targetAccount = req.body?.email || req.body?.username || req.body?.govId || 'unknown-account';
    return `auth:${clientIp}:${targetAccount}`;
  }
});

/**
 * 5. Central Banking & Monetary Minting Limiter
 * Absolute strict limiters for central bank digital currency (CBDC) minting, transfers, and ledger updates.
 */
export const monetaryLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 2,                  // Max 2 ledger modifications per minute
  message: 'Monetary ledger modification rate limit reached. Transaction queued for deep verification.',
  keyGenerator: (req: Request): string => {
    const user = (req as any).user;
    const bankId = user?.bankId || user?.institutionId || 'unauthorized-bank';
    return `monetary:${bankId}`;
  }
});

/**
 * 6. Quantum Bridge & Cryptographic Tunnel Limiter
 * Protects Post-Quantum Cryptography operations and secure tunnels.
 */
export const quantumBridgeLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 30,                 // 30 quantum exchanges per minute
  message: 'Quantum secure bridge channel rate limit exceeded.',
  keyGenerator: (req: Request): string => {
    const tunnelId = req.headers['x-quantum-tunnel-id'] || req.ip || 'unknown';
    return `quantum:${tunnelId}`;
  }
});

/**
 * 7. Citi / Alpaca Financial Gateway Limiter
 */
export const financialGatewayLimiter = rateLimiter({
  windowMs: 1 * 60 * 1000, // 1 minute
  max: 60,                 // 60 requests/minute
  message: 'Financial gateway rate limit reached. Orders throttled.',
  keyGenerator: (req: Request): string => {
    const user = (req as any).user;
    return `fin-gw:${user?.id || req.ip}`;
  }
});

export default rateLimiter;