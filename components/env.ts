

// --- CONSOLIDATED FROM: ./server/config/env.ts ---

import dotenv from 'dotenv';
import { z } from 'zod';
import path from 'path';

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

const envSchema = z.object({
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  PORT: z.string().default('3000'),
  
  // Database Configuration
  DATABASE_URL: z.string().default('postgresql://localhost:5432/oko_db'),
  REDIS_URL: z.string().optional(),

  // Security & Auth
  JWT_SECRET: z.string().min(16).default('super-secret-jwt-token-key-change-in-production-min-32-chars'),
  ENCRYPTION_KEY: z.string().default('0123456789abcdef0123456789abcdef0123456789abcdef0123456789abcdef'),

  // External API Integrations (Supply Chain & Financial)
  BANKING_API_KEY: z.string().default('mock-banking-key'),
  REAL_ESTATE_API_KEY: z.string().default('mock-real-estate-key'),
  AUTOMOTIVE_API_KEY: z.string().default('mock-automotive-key'),
  GOVERNMENT_GATEWAY_URL: z.string().url().default('https://api.government-gateway.gov'),

  // Sovereign & Institutional Services Configuration
  ALPACA_API_KEY: z.string().optional(),
  ALPACA_SECRET_KEY: z.string().optional(),
  CITI_CLIENT_ID: z.string().optional(),
  CITI_CLIENT_SECRET: z.string().optional(),
  PLAID_CLIENT_ID: z.string().optional(),
  PLAID_SECRET: z.string().optional(),
  STRIPE_SECRET_KEY: z.string().optional(),
  MODERN_TREASURY_API_KEY: z.string().optional(),
  ASTRA_DB_APPLICATION_TOKEN: z.string().optional(),
  GEMINI_API_KEY: z.string().optional(),
  FIREBASE_PROJECT_ID: z.string().optional(),

  // Global Network Settings
  NETWORK_NODE_ID: z.string().default('00000000-0000-0000-0000-000000000000'),
  IS_OFFLINE_MODE: z.string().transform((val) => val === 'true').default('false'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:', parsed.error.format());
  process.exit(1);
}

export const env = parsed.data;

export type Env = z.infer<typeof envSchema>;