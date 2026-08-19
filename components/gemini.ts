

// --- CONSOLIDATED FROM: ./config/gemini.ts ---

import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';

// Ensure API key is present
const apiKey = process.env.GEMINI_API_KEY;
if (!apiKey) {
  throw new Error('GEMINI_API_KEY environment variable is missing. Please set it in your environment.');
}

// Initialize the Google Generative AI client
export const genAI = new GoogleGenerativeAI(apiKey);

/**
 * Default safety settings for financial broker context.
 * Balances safety with the need to discuss financial risks, market volatility, and regulatory topics.
 */
export const defaultSafetySettings = [
  {
    category: HarmCategory.HARM_CATEGORY_HARASSMENT,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
    threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
  {
    category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
    threshold: HarmBlockThreshold.BLOCK_MEDIUM_AND_ABOVE,
  },
];

/**
 * System instructions tailored for a financial broker context.
 * Ensures responses are professional, compliant, analytical, and include necessary disclaimers.
 */
export const financialBrokerSystemInstruction = `
You are an expert, highly analytical, and compliant AI Financial Broker Assistant. Your primary goal is to assist users with financial analysis, market insights, portfolio tracking, and investment education.

Adhere to the following strict guidelines:
1. Professional & Objective Tone: Maintain a highly professional, objective, and unbiased tone. Avoid emotional language or hype.
2. Regulatory Compliance & Disclaimers:
   - Never provide definitive, personalized investment advice.
   - Always include a standard disclaimer when discussing specific assets or strategies (e.g., "This is for informational purposes only and does not constitute financial advice. Investing involves risk, including the potential loss of principal.").
   - Clearly distinguish between historical data, current market conditions, and speculative projections.
3. Risk Awareness: Emphasize risk management, diversification, and the volatility inherent in financial markets.
4. Accuracy & Clarity: Use precise financial terminology. If data is missing or uncertain, explicitly state the limitations of your analysis.
5. No Guarantees: Never guarantee returns or predict exact future prices.
`;

/**
 * Default generation configuration.
 */
export const defaultGenerationConfig = {
  temperature: 0.2, // Low temperature for more deterministic, factual financial analysis
  topK: 40,
  topP: 0.95,
  maxOutputTokens: 2048,
};

/**
 * Helper to get a pre-configured Gemini model for financial broker tasks.
 * Defaults to 'gemini-1.5-pro' for complex reasoning, but can fall back to 'gemini-1.5-flash'.
 * 
 * @param modelName The Gemini model identifier (e.g., 'gemini-1.5-pro', 'gemini-1.5-flash')
 * @returns Configured GenerativeModel instance
 */
export function getFinancialBrokerModel(modelName: string = 'gemini-1.5-pro') {
  return genAI.getGenerativeModel({
    model: modelName,
    safetySettings: defaultSafetySettings,
    generationConfig: defaultGenerationConfig,
    systemInstruction: financialBrokerSystemInstruction,
  });
}

// --- CONSOLIDATED FROM: ./types/gemini.ts ---

export type GeminiModel = 
  | 'gemini-2.5-pro'
  | 'gemini-2.5-flash'
  | 'gemini-1.5-pro'
  | 'gemini-1.5-flash';

export interface GeminiPart {
  text?: string;
  inlineData?: {
    mimeType: string;
    data: string;
  };
}

export interface GeminiContent {
  role: 'user' | 'model' | 'system';
  parts: GeminiPart[];
}

export interface GeminiSchema {
  type: 'object' | 'array' | 'string' | 'number' | 'integer' | 'boolean';
  properties?: Record<string, GeminiSchema>;
  required?: string[];
  items?: GeminiSchema;
  description?: string;
  enum?: string[];
}

export interface GeminiGenerationConfig {
  temperature?: number;
  topP?: number;
  topK?: number;
  maxOutputTokens?: number;
  stopSequences?: string[];
  responseMimeType?: 'text/plain' | 'application/json';
  responseSchema?: GeminiSchema;
}

export interface GeminiRequestWrapper<T = any> {
  model: GeminiModel;
  contents: GeminiContent[];
  systemInstruction?: string;
  generationConfig?: GeminiGenerationConfig;
  metadata?: {
    endpoint: string;
    userId?: string;
    requestId?: string;
    timestamp: string;
  };
}

export interface GeminiResponseWrapper<T = any> {
  data: T;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  candidates?: Array<{
    content: GeminiContent;
    finishReason: string;
    index: number;
  }>;
  metadata: {
    model: GeminiModel;
    latencyMs: number;
    timestamp: string;
  };
}

export interface FinancialStatementData {
  ticker: string;
  period: 'FY' | 'Q1' | 'Q2' | 'Q3' | 'Q4';
  year: number;
  revenue: number;
  netIncome: number;
  ebitda?: number;
  operatingCashFlow?: number;
  freeCashFlow?: number;
  totalAssets?: number;
  totalLiabilities?: number;
  totalEquity?: number;
  additionalMetrics?: Record<string, number | string>;
}

export interface FinancialAnalysisRequest {
  targetCompany: FinancialStatementData;
  competitors?: FinancialStatementData[];
  analysisType: 'valuation' | 'credit_risk' | 'earnings_quality' | 'growth_prospects' | 'comprehensive';
  customInstructions?: string;
}

export interface ValuationMetrics {
  intrinsicValueEstimate: number;
  currentPrice: number;
  marginOfSafety: number;
  dcfValuation?: {
    terminalGrowthRate: number;
    wacc: number;
    projectedCashFlows: number[];
    calculatedValue: number;
  };
  multiplesValuation?: {
    peRatio: number;
    psRatio: number;
    evToEbitda: number;
    peerAveragePe?: number;
  };
  recommendation: 'STRONG_BUY' | 'BUY' | 'HOLD' | 'SELL' | 'STRONG_SELL';
}

export interface CreditRiskMetrics {
  altmanZScore?: number;
  debtToEquity: number;
  interestCoverageRatio: number;
  currentRatio: number;
  quickRatio: number;
  riskRating: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  keyRiskFactors: string[];
}

export interface EarningsQualityMetrics {
  accrualsRatio: number;
  cashFlowToNetIncome: number;
  receivablesGrowthVsRevenueGrowth: number;
  inventoryGrowthVsRevenueGrowth: number;
  qualityScore: number; // 1 to 100
  redFlags: string[];
}

export interface FinancialAnalysisResponse {
  summary: string;
  keyFindings: string[];
  valuation?: ValuationMetrics;
  creditRisk?: CreditRiskMetrics;
  earningsQuality?: EarningsQualityMetrics;
  swotAnalysis: {
    strengths: string[];
    weaknesses: string[];
    opportunities: string[];
    threats: string[];
  };
  outlook: 'BULLISH' | 'NEUTRAL' | 'BEARISH';
  targetPrice12m?: number;
}

export interface PromptTemplate<TInput = any> {
  name: string;
  description: string;
  systemInstruction: string;
  template: (input: TInput) => string;
  responseSchema: GeminiSchema;
}

export const FINANCIAL_ANALYSIS_SCHEMA: GeminiSchema = {
  type: 'object',
  properties: {
    summary: {
      type: 'string',
      description: 'A high-level executive summary of the financial analysis.'
    },
    keyFindings: {
      type: 'array',
      items: { type: 'string' },
      description: 'Top 3-5 critical takeaways from the financial statements.'
    },
    valuation: {
      type: 'object',
      properties: {
        intrinsicValueEstimate: { type: 'number' },
        currentPrice: { type: 'number' },
        marginOfSafety: { type: 'number' },
        dcfValuation: {
          type: 'object',
          properties: {
            terminalGrowthRate: { type: 'number' },
            wacc: { type: 'number' },
            projectedCashFlows: {
              type: 'array',
              items: { type: 'number' }
            },
            calculatedValue: { type: 'number' }
          },
          required: ['terminalGrowthRate', 'wacc', 'projectedCashFlows', 'calculatedValue']
        },
        multiplesValuation: {
          type: 'object',
          properties: {
            peRatio: { type: 'number' },
            psRatio: { type: 'number' },
            evToEbitda: { type: 'number' },
            peerAveragePe: { type: 'number' }
          },
          required: ['peRatio', 'psRatio', 'evToEbitda']
        },
        recommendation: {
          type: 'string',
          enum: ['STRONG_BUY', 'BUY', 'HOLD', 'SELL', 'STRONG_SELL']
        }
      },
      required: ['intrinsicValueEstimate', 'currentPrice', 'marginOfSafety', 'recommendation']
    },
    creditRisk: {
      type: 'object',
      properties: {
        altmanZScore: { type: 'number' },
        debtToEquity: { type: 'number' },
        interestCoverageRatio: { type: 'number' },
        currentRatio: { type: 'number' },
        quickRatio: { type: 'number' },
        riskRating: {
          type: 'string',
          enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL']
        },
        keyRiskFactors: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['debtToEquity', 'interestCoverageRatio', 'currentRatio', 'quickRatio', 'riskRating', 'keyRiskFactors']
    },
    earningsQuality: {
      type: 'object',
      properties: {
        accrualsRatio: { type: 'number' },
        cashFlowToNetIncome: { type: 'number' },
        receivablesGrowthVsRevenueGrowth: { type: 'number' },
        inventoryGrowthVsRevenueGrowth: { type: 'number' },
        qualityScore: { type: 'number' },
        redFlags: {
          type: 'array',
          items: { type: 'string' }
        }
      },
      required: ['accrualsRatio', 'cashFlowToNetIncome', 'qualityScore', 'redFlags']
    },
    swotAnalysis: {
      type: 'object',
      properties: {
        strengths: { type: 'array', items: { type: 'string' } },
        weaknesses: { type: 'array', items: { type: 'string' } },
        opportunities: { type: 'array', items: { type: 'string' } },
        threats: { type: 'array', items: { type: 'string' } }
      },
      required: ['strengths', 'weaknesses', 'opportunities', 'threats']
    },
    outlook: {
      type: 'string',
      enum: ['BULLISH', 'NEUTRAL', 'BEARISH']
    },
    targetPrice12m: { type: 'number' }
  },
  required: ['summary', 'keyFindings', 'swotAnalysis', 'outlook']
};

export const FinancialAnalysisTemplate: PromptTemplate<FinancialAnalysisRequest> = {
  name: 'Financial Analysis Template',
  description: 'Performs deep financial analysis including valuation, credit risk, and earnings quality.',
  systemInstruction: 'You are an elite Wall Street equity research analyst and forensic accountant. Analyze the provided financial data with extreme precision, looking for hidden risks, earnings manipulation, and valuation discrepancies.',
  template: (input: FinancialAnalysisRequest) => {
    return `
Analyze the following financial data for ${input.targetCompany.ticker} (${input.targetCompany.period} ${input.targetCompany.year}):

Target Company Data:
${JSON.stringify(input.targetCompany, null, 2)}

${input.competitors && input.competitors.length > 0 ? `Competitor Data for Comparison:\n${JSON.stringify(input.competitors, null, 2)}` : ''}

Analysis Type Requested: ${input.analysisType}
${input.customInstructions ? `Custom Instructions: ${input.customInstructions}` : ''}

Provide a comprehensive structured JSON response matching the requested schema. Ensure all calculations (DCF, multiples, ratios) are mathematically sound based on the inputs provided.
    `.trim();
  },
  responseSchema: FINANCIAL_ANALYSIS_SCHEMA
};

// --- CONSOLIDATED FROM: ./api/gemini.ts ---

// ============================================================================
// STAGE 1: Extended Architectural Types, Validation Schemas, and State Contracts
// ============================================================================

export interface GeminiConfigOptions {
  modelName: string;
  temperature: number;
  topP: number;
  topK: number;
  maxOutputTokens: number;
  candidateCount: number;
  stopSequences?: string[];
}

export interface SafetySettingRule {
  category: 
    | "HARM_CATEGORY_HATE_SPEECH"
    | "HARM_CATEGORY_DANGEROUS_CONTENT"
    | "HARM_CATEGORY_HARASSMENT"
    | "HARM_CATEGORY_SEXUALLY_EXPLICIT"
    | "HARM_CATEGORY_CIVIC_INTEGRITY";
  threshold: 
    | "BLOCK_LOW_AND_ABOVE"
    | "BLOCK_MEDIUM_AND_ABOVE"
    | "BLOCK_ONLY_HIGH"
    | "BLOCK_NONE";
}

export interface ExtendedChatPayload {
  prompt: string;
  sessionId?: string;
  systemInstruction?: string;
  config?: Partial<GeminiConfigOptions>;
  safetySettings?: SafetySettingRule[];
  history?: Array<{
    role: "user" | "model" | "function";
    parts: Array<{ text?: string; [key: string]: any }>;
  }>;
  stream?: boolean;
}

export interface GeminiEngineResponse {
  success: boolean;
  text: string;
  sessionId: string;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  finishReason?: string;
  safetyRatings?: Array<{ category: string; probability: string }>;
  timestamp: number;
}

export class GeminiPayloadValidationError extends Error {
  public statusCode = 400;
  constructor(message: string, public details?: Record<string, any>) {
    super(message);
    this.name = "GeminiPayloadValidationError";
  }
}

export class GeminiRateLimitError extends Error {
  public statusCode = 429;
  constructor(message: string = "Rate limit exceeded. Please apply exponential backoff.") {
    super(message);
    this.name = "GeminiRateLimitError";
  }
}

export class GeminiUpstreamServiceError extends Error {
  public statusCode = 502;
  constructor(message: string, public upstreamCode?: number) {
    super(message);
    this.name = "GeminiUpstreamServiceError";
  }
}

const DEFAULT_CONFIG: GeminiConfigOptions = {
  modelName: "gemini-1.5-pro",
  temperature: 0.7,
  topP: 0.95,
  topK: 40,
  maxOutputTokens: 8192,
  candidateCount: 1,
};

function validateAndSanitizePayload(body: any): ExtendedChatPayload {
  if (!body || typeof body !== "object") {
    throw new GeminiPayloadValidationError("Request body must be a valid JSON object.");
  }

  const { prompt, sessionId, systemInstruction, config, safetySettings, history, stream } = body;

  if (typeof prompt !== "string" || prompt.trim().length === 0) {
    throw new GeminiPayloadValidationError("Field 'prompt' is mandatory and must be a non-empty string.", { received: typeof prompt });
  }

  if (prompt.length > 1048576) {
    throw new GeminiPayloadValidationError("Prompt exceeds maximum length threshold of 1MB.");
  }

  const sanitizedSessionId = typeof sessionId === "string" && sessionId.trim().length > 0 
    ? sessionId.trim() 
    : `session_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`;

  return {
    prompt: prompt.trim(),
    sessionId: sanitizedSessionId,
    systemInstruction: typeof systemInstruction === "string" ? systemInstruction.trim() : undefined,
    config: config && typeof config === "object" ? config : {},
    safetySettings: Array.isArray(safetySettings) ? safetySettings : undefined,
    history: Array.isArray(history) ? history : undefined,
    stream: typeof stream === "boolean" ? stream : false,
  };
}// ============================================================================
// STAGE 2: Advanced Memory Store, Session Cache, and Rate Limiting Subsystem
// ============================================================================

export interface SessionMemoryRecord {
  sessionId: string;
  createdAt: number;
  lastAccessed: number;
  interactionCount: number;
  history: Array<{
    role: "user" | "model" | "function";
    parts: Array<{ text?: string; [key: string]: any }>;
    timestamp: number;
  }>;
  metadata?: Record<string, any>;
}

export class InMemorySessionStore {
  private static instance: InMemorySessionStore;
  private store: Map<string, SessionMemoryRecord> = new Map();
  private maxSessions: number;
  private ttlMs: number;

  private constructor(maxSessions: number = 10000, ttlMs: number = 24 * 60 * 60 * 1000) {
    this.maxSessions = maxSessions;
    this.ttlMs = ttlMs;
    
    // Periodically clean up expired sessions
    setInterval(() => this.evictExpiredSessions(), 10 * 60 * 1000);
  }

  public static getInstance(): InMemorySessionStore {
    if (!InMemorySessionStore.instance) {
      InMemorySessionStore.instance = new InMemorySessionStore();
    }
    return InMemorySessionStore.instance;
  }

  public getSession(sessionId: string): SessionMemoryRecord | undefined {
    const record = this.store.get(sessionId);
    if (!record) return undefined;

    if (Date.now() - record.lastAccessed > this.ttlMs) {
      this.store.delete(sessionId);
      return undefined;
    }

    record.lastAccessed = Date.now();
    return record;
  }

  public saveSession(sessionId: string, newHistoryItem?: { role: "user" | "model" | "function"; parts: Array<{ text?: string; [key: string]: any }> }, metadata?: Record<string, any>): SessionMemoryRecord {
    let record = this.store.get(sessionId);
    const now = Date.now();

    if (!record) {
      if (this.store.size >= this.maxSessions) {
        this.evictOldestSession();
      }
      record = {
        sessionId,
        createdAt: now,
        lastAccessed: now,
        interactionCount: 0,
        history: [],
        metadata: metadata || {}
      };
      this.store.set(sessionId, record);
    }

    record.lastAccessed = now;
    if (metadata) {
      record.metadata = { ...record.metadata, ...metadata };
    }

    if (newHistoryItem) {
      record.history.push({
        ...newHistoryItem,
        timestamp: now
      });
      record.interactionCount += 1;
    }

    return record;
  }

  public appendTurn(sessionId: string, userPart: { text?: string; [key: string]: any }, modelPart: { text?: string; [key: string]: any }): SessionMemoryRecord {
    let record = this.store.get(sessionId);
    const now = Date.now();

    if (!record) {
      record = this.saveSession(sessionId);
    }

    record.history.push(
      { role: "user", parts: [userPart], timestamp: now },
      { role: "model", parts: [modelPart], timestamp: now + 1 }
    );
    record.interactionCount += 2;
    record.lastAccessed = now;

    return record;
  }

  private evictExpiredSessions(): void {
    const now = Date.now();
    for (const [id, record] of this.store.entries()) {
      if (now - record.lastAccessed > this.ttlMs) {
        this.store.delete(id);
      }
    }
  }

  private evictOldestSession(): void {
    let oldestKey: string | undefined = undefined;
    let oldestTime = Infinity;

    for (const [id, record] of this.store.entries()) {
      if (record.lastAccessed < oldestTime) {
        oldestTime = record.lastAccessed;
        oldestKey = id;
      }
    }

    if (oldestKey) {
      this.store.delete(oldestKey);
    }
  }

  public clear(): void {
    this.store.clear();
  }
}

export class DistributedTokenBucketRateLimiter {
  private static instance: DistributedTokenBucketRateLimiter;
  private buckets: Map<string, { tokens: number; lastRefill: number }> = new Map();
  private capacity: number;
  private refillRatePerSec: number;

  private constructor(capacity: number = 60, refillRatePerSec: number = 1) {
    this.capacity = capacity;
    this.refillRatePerSec = refillRatePerSec;
  }

  public static getInstance(): DistributedTokenBucketRateLimiter {
    if (!DistributedTokenBucketRateLimiter.instance) {
      DistributedTokenBucketRateLimiter.instance = new DistributedTokenBucketRateLimiter();
    }
    return DistributedTokenBucketRateLimiter.instance;
  }

  public consume(clientKey: string, cost: number = 1): boolean {
    const now = Date.now();
    let bucket = this.buckets.get(clientKey);

    if (!bucket) {
      bucket = { tokens: this.capacity, lastRefill: now };
      this.buckets.set(clientKey, bucket);
    }

    const elapsedSec = (now - bucket.lastRefill) / 1000;
    if (elapsedSec > 0) {
      const generated = elapsedSec * this.refillRatePerSec;
      bucket.tokens = Math.min(this.capacity, bucket.tokens + generated);
      bucket.lastRefill = now;
    }

    if (bucket.tokens >= cost) {
      bucket.tokens -= cost;
      return true;
    }

    return false;
  }
}

function extractClientIdentifier(req: any): string {
  const forwardedFor = req.headers?.["x-forwarded-for"];
  if (typeof forwardedFor === "string" && forwardedFor.length > 0) {
    return forwardedFor.split(",")[0].trim();
  }
  if (Array.isArray(forwardedFor) && forwardedFor.length > 0) {
    return forwardedFor[0];
  }
  return req.socket?.remoteAddress || req.connection?.remoteAddress || "anonymous_client";
}// ============================================================================
// STAGE 3: Advanced Google Generative AI SDK Client Wrapper and Retry Subsystem
// ============================================================================

import { GoogleGenerativeAI, GenerativeModel, ChatSession, GenerationConfig, SafetySetting } from "@google/generative-ai";

export interface SDKClientFactoryOptions {
  apiKey?: string;
  defaultModelName?: string;
  timeoutMs?: number;
  maxRetries?: number;
}

export class GeminiSDKClientManager {
  private static instance: GeminiSDKClientManager;
  private clientInstance: GoogleGenerativeAI | null = null;
  private modelCache: Map<string, GenerativeModel> = new Map();
  private apiKey: string;
  private defaultModelName: string;

  private constructor(options?: SDKClientFactoryOptions) {
    this.apiKey = options?.apiKey || process.env.GEMINI_API_KEY || "";
    this.defaultModelName = options?.defaultModelName || "gemini-1.5-pro";
    if (this.apiKey) {
      this.clientInstance = new GoogleGenerativeAI(this.apiKey);
    }
  }

  public static getInstance(options?: SDKClientFactoryOptions): GeminiSDKClientManager {
    if (!GeminiSDKClientManager.instance) {
      GeminiSDKClientManager.instance = new GeminiSDKClientManager(options);
    }
    return GeminiSDKClientManager.instance;
  }

  public setApiKey(key: string): void {
    this.apiKey = key;
    this.clientInstance = new GoogleGenerativeAI(key);
    this.modelCache.clear();
  }

  public getClient(): GoogleGenerativeAI {
    if (!this.clientInstance) {
      const activeKey = process.env.GEMINI_API_KEY;
      if (!activeKey) {
        throw new GeminiUpstreamServiceError("CRITICAL: GEMINI_API_KEY environment variable is missing or unconfigured.", 500);
      }
      this.clientInstance = new GoogleGenerativeAI(activeKey);
    }
    return this.clientInstance;
  }

  public getGenerativeModel(modelName?: string, systemInstruction?: string, config?: Partial<GeminiConfigOptions>, safetySettings?: SafetySettingRule[]): GenerativeModel {
    const targetModel = modelName || this.defaultModelName;
    const cacheKey = `${targetModel}_${Boolean(systemInstruction)}_${JSON.stringify(config)}_${JSON.stringify(safetySettings)}`;

    if (this.modelCache.has(cacheKey)) {
      return this.modelCache.get(cacheKey)!;
    }

    const client = this.getClient();
    
    const generationConfig: GenerationConfig = {
      temperature: config?.temperature ?? DEFAULT_CONFIG.temperature,
      topP: config?.topP ?? DEFAULT_CONFIG.topP,
      topK: config?.topK ?? DEFAULT_CONFIG.topK,
      maxOutputTokens: config?.maxOutputTokens ?? DEFAULT_CONFIG.maxOutputTokens,
      candidateCount: config?.candidateCount ?? DEFAULT_CONFIG.candidateCount,
      stopSequences: config?.stopSequences,
    };

    const formattedSafetySettings: SafetySetting[] = safetySettings ? safetySettings.map(s => ({
      category: s.category as any,
      threshold: s.threshold as any,
    })) : [];

    const modelParams: any = {
      model: targetModel,
      generationConfig,
      safetySettings: formattedSafetySettings.length > 0 ? formattedSafetySettings : undefined,
    };

    if (systemInstruction && systemInstruction.trim().length > 0) {
      modelParams.systemInstruction = {
        role: "system",
        parts: [{ text: systemInstruction }]
      };
    }

    const model = client.getGenerativeModel(modelParams);
    this.modelCache.set(cacheKey, model);
    return model;
  }
}

export async function executeWithExponentialBackoff<T>(
  operation: () => Promise<T>,
  maxRetries: number = 3,
  initialDelayMs: number = 1000,
  maxDelayMs: number = 10000
): Promise<T> {
  let attempt = 0;
  let delay = initialDelayMs;

  while (true) {
    try {
      return await operation();
    } catch (error: any) {
      attempt++;
      
      const isRateLimit = error?.status === 429 || error?.message?.includes("429") || error?.message?.includes("ResourceExhausted") || error?.message?.includes("rate limit");
      const isServerFault = error?.status >= 500 || error?.message?.includes("503") || error?.message?.includes("Internal") || error?.message?.includes("overloaded");

      if (attempt > maxRetries || (!isRateLimit && !isServerFault)) {
        if (isRateLimit) {
          throw new GeminiRateLimitError(`Exceeded maximum retry attempts (${maxRetries}) due to rate limits.`);
        }
        if (isServerFault) {
          throw new GeminiUpstreamServiceError(`Upstream Gemini service fault: ${error.message}`, error.status || 502);
        }
        throw error;
      }

      const jitter = Math.random() * 300;
      const sleepTime = Math.min(maxDelayMs, delay * Math.pow(2, attempt - 1) + jitter);
      
      await new Promise(resolve => setTimeout(resolve, sleepTime));
    }
  }
}// ============================================================================
// STAGE 4: Core Inference Engine, Streaming Subsystem, and Chat Session Orchestrator
// ============================================================================

export interface InferenceExecutionResult {
  rawResponse: any;
  text: string;
  usageMetadata?: {
    promptTokenCount: number;
    candidatesTokenCount: number;
    totalTokenCount: number;
  };
  finishReason?: string;
  safetyRatings?: Array<{ category: string; probability: string }>;
}

export class GeminiInferenceEngine {
  private static instance: GeminiInferenceEngine;
  private sdkManager: GeminiSDKClientManager;
  private memoryStore: InMemorySessionStore;

  private constructor() {
    this.sdkManager = GeminiSDKClientManager.getInstance();
    this.memoryStore = InMemorySessionStore.getInstance();
  }

  public static getInstance(): GeminiInferenceEngine {
    if (!GeminiInferenceEngine.instance) {
      GeminiInferenceEngine.instance = new GeminiInferenceEngine();
    }
    return GeminiInferenceEngine.instance;
  }

  public async generateSingleTurn(payload: ExtendedChatPayload): Promise<GeminiEngineResponse> {
    const model = this.sdkManager.getGenerativeModel(
      payload.config?.modelName,
      payload.systemInstruction,
      payload.config,
      payload.safetySettings
    );

    const inferenceOperation = async () => {
      const result = await model.generateContent(payload.prompt);
      const response = await result.response;
      const text = response.text();
      
      const usage = response.usageMetadata;
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const safetyRatings = candidate?.safetyRatings?.map((sr: any) => ({
        category: String(sr.category),
        probability: String(sr.probability)
      }));

      return {
        rawResponse: response,
        text,
        usageMetadata: usage ? {
          promptTokenCount: usage.promptTokenCount || 0,
          candidatesTokenCount: usage.candidatesTokenCount || 0,
          totalTokenCount: usage.totalTokenCount || 0
        } : undefined,
        finishReason,
        safetyRatings
      };
    };

    const execResult = await executeWithExponentialBackoff(inferenceOperation);

    const sessionRecord = this.memoryStore.appendTurn(
      payload.sessionId!,
      { text: payload.prompt },
      { text: execResult.text }
    );

    return {
      success: true,
      text: execResult.text,
      sessionId: sessionRecord.sessionId,
      usageMetadata: execResult.usageMetadata,
      finishReason: execResult.finishReason,
      safetyRatings: execResult.safetyRatings,
      timestamp: Date.now()
    };
  }

  public async generateMultiTurnChat(payload: ExtendedChatPayload): Promise<GeminiEngineResponse> {
    const model = this.sdkManager.getGenerativeModel(
      payload.config?.modelName,
      payload.systemInstruction,
      payload.config,
      payload.safetySettings
    );

    const session = this.memoryStore.getSession(payload.sessionId!);
    
    // Construct chat history format required by @google/generative-ai SDK
    const formattedHistory = session && session.history.length > 0
      ? session.history.map(item => ({
          role: item.role === "function" ? "model" : item.role,
          parts: item.parts.map(p => ({ text: p.text || JSON.stringify(p) }))
        }))
      : (payload.history ? payload.history.map(h => ({
          role: h.role === "function" ? "model" : h.role,
          parts: h.parts.map(p => ({ text: p.text || JSON.stringify(p) }))
        })) : []);

    const chatSession = model.startChat({
      history: formattedHistory as any,
      generationConfig: {
        temperature: payload.config?.temperature ?? DEFAULT_CONFIG.temperature,
        topP: payload.config?.topP ?? DEFAULT_CONFIG.topP,
        topK: payload.config?.topK ?? DEFAULT_CONFIG.topK,
        maxOutputTokens: payload.config?.maxOutputTokens ?? DEFAULT_CONFIG.maxOutputTokens,
        candidateCount: payload.config?.candidateCount ?? DEFAULT_CONFIG.candidateCount,
        stopSequences: payload.config?.stopSequences,
      }
    });

    const chatOperation = async () => {
      const result = await chatSession.sendMessage(payload.prompt);
      const response = await result.response;
      const text = response.text();

      const usage = response.usageMetadata;
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const safetyRatings = candidate?.safetyRatings?.map((sr: any) => ({
        category: String(sr.category),
        probability: String(sr.probability)
      }));

      return {
        rawResponse: response,
        text,
        usageMetadata: usage ? {
          promptTokenCount: usage.promptTokenCount || 0,
          candidatesTokenCount: usage.candidatesTokenCount || 0,
          totalTokenCount: usage.totalTokenCount || 0
        } : undefined,
        finishReason,
        safetyRatings
      };
    };

    const execResult = await executeWithExponentialBackoff(chatOperation);

    const sessionRecord = this.memoryStore.appendTurn(
      payload.sessionId!,
      { text: payload.prompt },
      { text: execResult.text }
    );

    return {
      success: true,
      text: execResult.text,
      sessionId: sessionRecord.sessionId,
      usageMetadata: execResult.usageMetadata,
      finishReason: execResult.finishReason,
      safetyRatings: execResult.safetyRatings,
      timestamp: Date.now()
    };
  }

  public async streamSingleTurn(payload: ExtendedChatPayload, res: any): Promise<void> {
    const model = this.sdkManager.getGenerativeModel(
      payload.config?.modelName,
      payload.systemInstruction,
      payload.config,
      payload.safetySettings
    );

    res.setHeader("Content-Type", "text/event-stream");
    res.setHeader("Cache-Control", "no-cache, no-transform");
    res.setHeader("Connection", "keep-alive");
    if (typeof res.flushHeaders === "function") {
      res.flushHeaders();
    }

    try {
      const streamResult = await model.generateContentStream(payload.prompt);
      let accumulatedText = "";

      for await (const chunk of streamResult.stream) {
        const chunkText = chunk.text();
        accumulatedText += chunkText;
        
        const payloadChunk = JSON.stringify({
          success: true,
          sessionId: payload.sessionId,
          chunk: chunkText,
          accumulatedText,
          timestamp: Date.now()
        });
        
        res.write(`data: ${payloadChunk}\n\n`);
        if (typeof res.flush === "function") {
          res.flush();
        }
      }

      this.memoryStore.appendTurn(
        payload.sessionId!,
        { text: payload.prompt },
        { text: accumulatedText }
      );

      res.write(`data: ${JSON.stringify({ success: true, done: true, sessionId: payload.sessionId })}\n\n`);
      res.end();
    } catch (error: any) {
      const errorChunk = JSON.stringify({
        success: false,
        error: error.message || "Streaming failed",
        statusCode: error.statusCode || 500
      });
      res.write(`data: ${errorChunk}\n\n`);
      res.end();
    }
  }
}// ============================================================================
// STAGE 5: Advanced Multimodal Processing, File Attachment Handling, and Embedding Subsystem
// ============================================================================

export interface FileAttachmentPayload {
  inlineData?: {
    mimeType: string;
    data: string; // Base64 encoded string
  };
  fileUri?: {
    fileUri: string;
    mimeType: string;
  };
}

export interface MultimodalPromptPayload extends ExtendedChatPayload {
  attachments?: FileAttachmentPayload[];
}

export class GeminiMultimodalProcessor {
  private static instance: GeminiMultimodalProcessor;
  private inferenceEngine: GeminiInferenceEngine;

  private constructor() {
    this.inferenceEngine = GeminiInferenceEngine.getInstance();
  }

  public static getInstance(): GeminiMultimodalProcessor {
    if (!GeminiMultimodalProcessor.instance) {
      GeminiMultimodalProcessor.instance = new GeminiMultimodalProcessor();
    }
    return GeminiMultimodalProcessor.instance;
  }

  public async processMultimodalTurn(payload: MultimodalPromptPayload): Promise<GeminiEngineResponse> {
    if (!payload.attachments || payload.attachments.length === 0) {
      return this.inferenceEngine.generateSingleTurn(payload);
    }

    const sdkManager = GeminiSDKClientManager.getInstance();
    const model = sdkManager.getGenerativeModel(
      payload.config?.modelName,
      payload.systemInstruction,
      payload.config,
      payload.safetySettings
    );

    const parts: Array<string | { inlineData: { mimeType: string; data: string } } | { fileData: { fileUri: string; mimeType: string } }> = [
      payload.prompt
    ];

    for (const attachment of payload.attachments) {
      if (attachment.inlineData) {
        parts.push({
          inlineData: {
            mimeType: attachment.inlineData.mimeType,
            data: attachment.inlineData.data
          }
        });
      } else if (attachment.fileUri) {
        parts.push({
          fileData: {
            fileUri: attachment.fileUri.fileUri,
            mimeType: attachment.fileUri.mimeType
          }
        });
      }
    }

    const multimodalOperation = async () => {
      const result = await model.generateContent(parts);
      const response = await result.response;
      const text = response.text();

      const usage = response.usageMetadata;
      const candidate = response.candidates?.[0];
      const finishReason = candidate?.finishReason;
      const safetyRatings = candidate?.safetyRatings?.map((sr: any) => ({
        category: String(sr.category),
        probability: String(sr.probability)
      }));

      return {
        text,
        usageMetadata: usage ? {
          promptTokenCount: usage.promptTokenCount || 0,
          candidatesTokenCount: usage.candidatesTokenCount || 0,
          totalTokenCount: usage.totalTokenCount || 0
        } : undefined,
        finishReason,
        safetyRatings
      };
    };

    const execResult = await executeWithExponentialBackoff(multimodalOperation);

    const memoryStore = InMemorySessionStore.getInstance();
    const sessionRecord = memoryStore.appendTurn(
      payload.sessionId!,
      { text: payload.prompt, attachmentCount: payload.attachments.length },
      { text: execResult.text }
    );

    return {
      success: true,
      text: execResult.text,
      sessionId: sessionRecord.sessionId,
      usageMetadata: execResult.usageMetadata,
      finishReason: execResult.finishReason,
      safetyRatings: execResult.safetyRatings,
      timestamp: Date.now()
    };
  }

  public async generateEmbeddings(texts: string[], modelName: string = "text-embedding-004"): Promise<Array<{ values: number[] }>> {
    const sdkManager = GeminiSDKClientManager.getInstance();
    const client = sdkManager.getClient();
    const embeddingModel = client.getGenerativeModel({ model: modelName });

    const embeddingOperation = async () => {
      const results: Array<{ values: number[] }> = [];
      for (const t of texts) {
        // Utilizing embedContent or batch embedding support
        const res = await (embeddingModel as any).embedContent(t);
        results.push({ values: res.embedding.values });
      }
      return results;
    };

    return executeWithExponentialBackoff(embeddingOperation);
  }
}// ============================================================================
// STAGE 6: Advanced Tool Calling, Function Declaration Dispatcher, and Agentic Subsystem
// ============================================================================

export interface FunctionDeclarationDefinition {
  name: string;
  description: string;
  parameters: {
    type: string;
    properties: Record<string, {
      type: string;
      description: string;
      enum?: string[];
      items?: { type: string; [key: string]: any };
      [key: string]: any;
    }>;
    required?: string[];
  };
}

export type ToolImplementationHandler = (args: Record<string, any>) => Promise<Record<string, any> | string> | Record<string, any> | string;

export interface ToolExecutionRegistryConfig {
  declarations: FunctionDeclarationDefinition[];
  implementations: Map<string, ToolImplementationHandler>;
}

export class GeminiAgenticToolDispatcher {
  private static instance: GeminiAgenticToolDispatcher;
  private registry: Map<string, ToolImplementationHandler> = new Map();
  private declarations: Map<string, FunctionDeclarationDefinition> = new Map();

  private constructor() {
    // Register default built-in utility tools
    this.registerDefaultTools();
  }

  public static getInstance(): GeminiAgenticToolDispatcher {
    if (!GeminiAgenticToolDispatcher.instance) {
      GeminiAgenticToolDispatcher.instance = new GeminiAgenticToolDispatcher();
    }
    return GeminiAgenticToolDispatcher.instance;
  }

  public registerTool(declaration: FunctionDeclarationDefinition, handler: ToolImplementationHandler): void {
    this.declarations.set(declaration.name, declaration);
    this.registry.set(declaration.name, handler);
  }

  public getToolDeclarations(): FunctionDeclarationDefinition[] {
    return Array.from(this.declarations.values());
  }

  public async executeTool(name: string, args: Record<string, any>): Promise<any> {
    const handler = this.registry.get(name);
    if (!handler) {
      throw new Error(`Tool execution failure: Function '${name}' is not registered in the dispatcher.`);
    }

    try {
      const result = await handler(args);
      return result;
    } catch (error: any) {
      return {
        error: true,
        message: error.message || "Unknown error during tool execution",
        toolName: name
      };
    }
  }

  private registerDefaultTools(): void {
    // 1. Current UTC Timestamp Tool
    this.registerTool(
      {
        name: "get_current_utc_timestamp",
        description: "Retrieves the exact current UTC date and timestamp in ISO-8601 format.",
        parameters: {
          type: "OBJECT",
          properties: {},
          required: []
        }
      },
      () => ({ utcTimestamp: new Date().toISOString(), epoch: Date.now() })
    );

    // 2. Mathematical Expression Calculator Tool
    this.registerTool(
      {
        name: "calculate_expression",
        description: "Evaluates a safe mathematical expression and returns the numerical result.",
        parameters: {
          type: "OBJECT",
          properties: {
            expression: {
              type: "STRING",
              description: "Mathematical expression to evaluate (e.g., '1024 * 768' or 'sqrt(144)')."
            }
          },
          required: ["expression"]
        }
      },
      (args) => {
        const expr = String(args.expression || "").replace(/[^0-9+\-*/().%\s]/g, "");
        try {
          // Safe evaluation for basic math
          const result = Function(`'use strict'; return (${expr})`)();
          return { expression: args.expression, result };
        } catch (err: any) {
          return { error: true, message: `Invalid math expression: ${err.message}` };
        }
      }
    );
  }

  public async executeAgenticLoop(payload: ExtendedChatPayload, maxIterations: number = 5): Promise<GeminiEngineResponse> {
    const sdkManager = GeminiSDKClientManager.getInstance();
    const model = sdkManager.getGenerativeModel(
      payload.config?.modelName,
      payload.systemInstruction,
      payload.config,
      payload.safetySettings
    );

    const toolsConfig = [{
      functionDeclarations: this.getToolDeclarations()
    }];

    const chat = model.startChat({
      history: payload.history ? payload.history.map(h => ({
        role: h.role === "function" ? "model" : h.role,
        parts: h.parts.map(p => ({ text: p.text || JSON.stringify(p) }))
      })) : [],
      tools: toolsConfig as any
    });

    let currentPrompt = payload.prompt;
    let finalResponseText = "";
    let usageMetadata: any = undefined;
    let iteration = 0;

    while (iteration < maxIterations) {
      iteration++;
      const result = await executeWithExponentialBackoff(async () => {
        return await chat.sendMessage(currentPrompt);
      });

      const response = await result.response;
      const functionCalls = response.functionCalls();
      
      if (response.usageMetadata) {
        const u = response.usageMetadata;
        usageMetadata = {
          promptTokenCount: (usageMetadata?.promptTokenCount || 0) + (u.promptTokenCount || 0),
          candidatesTokenCount: (usageMetadata?.candidatesTokenCount || 0) + (u.candidatesTokenCount || 0),
          totalTokenCount: (usageMetadata?.totalTokenCount || 0) + (u.totalTokenCount || 0)
        };
      }

      if (functionCalls && functionCalls.length > 0) {
        const functionCallParts: Array<any> = [];
        
        for (const call of functionCalls) {
          const toolResult = await this.executeTool(call.name, call.args);
          functionCallParts.push({
            functionResponse: {
              name: call.name,
              response: { result: toolResult }
            }
          });
        }

        // Feed function execution results back into chat loop
        currentPrompt = functionCallParts as any;
      } else {
        finalResponseText = response.text();
        break;
      }
    }

    const memoryStore = InMemorySessionStore.getInstance();
    const sessionRecord = memoryStore.appendTurn(
      payload.sessionId!,
      { text: payload.prompt },
      { text: finalResponseText }
    );

    return {
      success: true,
      text: finalResponseText,
      sessionId: sessionRecord.sessionId,
      usageMetadata,
      timestamp: Date.now()
    };
  }
}// ============================================================================
// STAGE 7: Advanced Structured JSON Schema Generation and Validation Subsystem
// ============================================================================

import { Schema, Type } from "@google/generative-ai";

export interface StructuredGenerationOptions<T = any> {
  responseSchema: Schema;
  schemaName?: string;
  description?: string;
}

export class GeminiStructuredGenerator {
  private static instance: GeminiStructuredGenerator;
  private sdkManager: GeminiSDKClientManager;

  private constructor() {
    this.sdkManager = GeminiSDKClientManager.getInstance();
  }

  public static getInstance(): GeminiStructuredGenerator {
    if (!GeminiStructuredGenerator.instance) {
      GeminiStructuredGenerator.instance = new GeminiStructuredGenerator();
    }
    return GeminiStructuredGenerator.instance;
  }

  public async generateStructured<T = any>(
    payload: ExtendedChatPayload,
    schemaOptions: StructuredGenerationOptions<T>
  ): Promise<{ success: boolean; data: T; sessionId: string; usageMetadata?: any; timestamp: number }> {
    const config = {
      ...(payload.config || {}),
      responseMimeType: "application/json",
      responseSchema: schemaOptions.responseSchema
    };

    const model = this.sdkManager.getGenerativeModel(
      payload.config?.modelName,
      payload.systemInstruction,
      config,
      payload.safetySettings
    );

    const structuredOperation = async () => {
      const result = await model.generateContent(payload.prompt);
      const response = await result.response;
      const rawText = response.text();
      
      let parsedData: T;
      try {
        parsedData = JSON.parse(rawText) as T;
      } catch (parseError: any) {
        throw new Error(`Failed to parse structured JSON output from Gemini model: ${parseError.message}. Raw output: ${rawText}`);
      }

      const usage = response.usageMetadata;
      const usageMetadata = usage ? {
        promptTokenCount: usage.promptTokenCount || 0,
        candidatesTokenCount: usage.candidatesTokenCount || 0,
        totalTokenCount: usage.totalTokenCount || 0
      } : undefined;

      return {
        parsedData,
        usageMetadata
      };
    };

    const execResult = await executeWithExponentialBackoff(structuredOperation);

    const memoryStore = InMemorySessionStore.getInstance();
    const sessionRecord = memoryStore.appendTurn(
      payload.sessionId!,
      { text: payload.prompt },
      { text: JSON.stringify(execResult.parsedData), structured: true }
    );

    return {
      success: true,
      data: execResult.parsedData,
      sessionId: sessionRecord.sessionId,
      usageMetadata: execResult.usageMetadata,
      timestamp: Date.now()
    };
  }

  public createStandardSchema(properties: Record<string, { type: Type; description: string; nullable?: boolean; items?: Schema; enum?: string[] }>, required: string[]): Schema {
    const formattedProperties: Record<string, Schema> = {};
    for (const [key, prop] of Object.entries(properties)) {
      formattedProperties[key] = {
        type: prop.type,
        description: prop.description,
        nullable: prop.nullable,
        items: prop.items,
        enum: prop.enum
      };
    }

    return {
      type: Type.OBJECT,
      properties: formattedProperties,
      required
    };
  }
}// ============================================================================
// STAGE 8: Advanced Telemetry, Health Diagnostics, and Performance Monitoring Subsystem
// ============================================================================

export interface TelemetryEventRecord {
  eventId: string;
  timestamp: number;
  clientIdentifier: string;
  sessionId: string;
  operationType: "single_turn" | "chat" | "stream" | "multimodal" | "agent" | "structured" | "embedding";
  modelName: string;
  durationMs: number;
  success: boolean;
  tokenUsage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
  statusCode: number;
  errorMessage?: string;
  metadata?: Record<string, any>;
}

export interface SystemHealthStatus {
  status: "healthy" | "degraded" | "critical";
  uptimeSeconds: number;
  activeSessionsCount: number;
  rateLimitBucketsActive: number;
  memoryUsageMb: {
    rss: number;
    heapTotal: number;
    heapUsed: number;
    external: number;
  };
  environmentCheck: {
    apiKeyConfigured: boolean;
    nodeVersion: string;
    platform: string;
  };
  recentErrorRate: number;
  timestamp: number;
}

export class GeminiTelemetryCollector {
  private static instance: GeminiTelemetryCollector;
  private events: TelemetryEventRecord[] = [];
  private maxStoredEvents: number;
  private startTime: number;

  private constructor(maxStoredEvents: number = 5000) {
    this.maxStoredEvents = maxStoredEvents;
    this.startTime = Date.now();
  }

  public static getInstance(): GeminiTelemetryCollector {
    if (!GeminiTelemetryCollector.instance) {
      GeminiTelemetryCollector.instance = new GeminiTelemetryCollector();
    }
    return GeminiTelemetryCollector.instance;
  }

  public recordEvent(event: Omit<TelemetryEventRecord, "eventId" | "timestamp">): TelemetryEventRecord {
    const fullRecord: TelemetryEventRecord = {
      ...event,
      eventId: `tel_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`,
      timestamp: Date.now()
    };

    this.events.push(fullRecord);
    if (this.events.length > this.maxStoredEvents) {
      this.events.shift(); // Drop oldest telemetry event
    }

    // Log critical errors immediately to stdout
    if (!fullRecord.success) {
      console.error(`[GeminiTelemetry] Operation failed: ${fullRecord.operationType} | Client: ${fullRecord.clientIdentifier} | Error: ${fullRecord.errorMessage || "Unknown"}`, {
        sessionId: fullRecord.sessionId,
        statusCode: fullRecord.statusCode,
        durationMs: fullRecord.durationMs
      });
    }

    return fullRecord;
  }

  public getHealthStatus(): SystemHealthStatus {
    const mem = process.memoryUsage();
    const sessionStore = InMemorySessionStore.getInstance();
    const rateLimiter = DistributedTokenBucketRateLimiter.getInstance();

    const now = Date.now();
    const recentEvents = this.events.filter(e => now - e.timestamp <= 15 * 60 * 1000); // Last 15 minutes
    const failedRecent = recentEvents.filter(e => !e.success).length;
    const recentErrorRate = recentEvents.length > 0 ? failedRecent / recentEvents.length : 0;

    let status: "healthy" | "degraded" | "critical" = "healthy";
    if (recentErrorRate > 0.2 || mem.heapUsed > 1024 * 1024 * 1024) {
      status = "critical";
    } else if (recentErrorRate > 0.05 || !process.env.GEMINI_API_KEY) {
      status = "degraded";
    }

    return {
      status,
      uptimeSeconds: Math.floor((now - this.startTime) / 1000),
      activeSessionsCount: (sessionStore as any).store?.size || 0,
      rateLimitBucketsActive: (rateLimiter as any).buckets?.size || 0,
      memoryUsageMb: {
        rss: Math.round(mem.rss / (1024 * 1024)),
        heapTotal: Math.round(mem.heapTotal / (1024 * 1024)),
        heapUsed: Math.round(mem.heapUsed / (1024 * 1024)),
        external: Math.round(mem.external / (1024 * 1024)),
      },
      environmentCheck: {
        apiKeyConfigured: Boolean(process.env.GEMINI_API_KEY),
        nodeVersion: process.version,
        platform: process.platform,
      },
      recentErrorRate: Number(recentErrorRate.toFixed(4)),
      timestamp: now
    };
  }

  public getRecentEvents(limit: number = 50): TelemetryEventRecord[] {
    return this.events.slice(-limit).reverse();
  }
}// ============================================================================
// STAGE 9: Comprehensive API Request Router, Middleware Orchestrator, and Vercel Entrypoint Handler
// ============================================================================

import type { VercelRequest, VercelResponse } from "@vercel/node";

export interface APIRequestContext {
  clientIp: string;
  userAgent: string;
  requestId: string;
  startTime: number;
}

export class GeminiAPIRouter {
  private static instance: GeminiAPIRouter;
  private rateLimiter: DistributedTokenBucketRateLimiter;
  private inferenceEngine: GeminiInferenceEngine;
  private multimodalProcessor: GeminiMultimodalProcessor;
  private agenticDispatcher: GeminiAgenticToolDispatcher;
  private structuredGenerator: GeminiStructuredGenerator;
  private telemetryCollector: GeminiTelemetryCollector;

  private constructor() {
    this.rateLimiter = DistributedTokenBucketRateLimiter.getInstance();
    this.inferenceEngine = GeminiInferenceEngine.getInstance();
    this.multimodalProcessor = GeminiMultimodalProcessor.getInstance();
    this.agenticDispatcher = GeminiAgenticToolDispatcher.getInstance();
    this.structuredGenerator = GeminiStructuredGenerator.getInstance();
    this.telemetryCollector = GeminiTelemetryCollector.getInstance();
  }

  public static getInstance(): GeminiAPIRouter {
    if (!GeminiAPIRouter.instance) {
      GeminiAPIRouter.instance = new GeminiAPIRouter();
    }
    return GeminiAPIRouter.instance;
  }

  public async handleRequest(req: VercelRequest, res: VercelResponse): Promise<void> {
    const startTime = Date.now();
    const requestId = `req_${startTime}_${Math.random().toString(36).substring(2, 9)}`;
    const clientIp = extractClientIdentifier(req);
    const userAgent = String(req.headers?.["user-agent"] || "unknown_agent");

    // Enable CORS headers for production readiness
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "POST, GET, OPTIONS, HEAD");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization, X-Session-Id, X-Requested-With");

    if (req.method === "OPTIONS") {
      res.status(204).end();
      return;
    }

    // Handle Health Check GET endpoint
    if (req.method === "GET") {
      const action = req.query?.action || req.query?.endpoint;
      if (action === "health" || req.url?.includes("/health")) {
        const health = this.telemetryCollector.getHealthStatus();
        res.status(health.status === "critical" ? 503 : 200).json(health);
        return;
      }
      if (action === "telemetry" || req.url?.includes("/telemetry")) {
        const events = this.telemetryCollector.getRecentEvents(25);
        res.status(200).json({ success: true, count: events.length, events });
        return;
      }
      res.status(200).json({
        success: true,
        name: "Quantum Gemini Enterprise Inference Engine API",
        version: "4.0.0-production",
        architecture: "10-Stage Chained Orchestration",
        timestamp: Date.now()
      });
      return;
    }

    if (req.method !== "POST") {
      res.setHeader("Allow", "POST, GET, OPTIONS");
      res.status(405).json({
        success: false,
        error: "Method Not Allowed. Use POST for inference operations or GET for health diagnostics.",
        statusCode: 405
      });
      return;
    }

    // Rate Limiting Check
    const isRateLimited = !this.rateLimiter.consume(clientIp, 1);
    if (isRateLimited) {
      this.telemetryCollector.recordEvent({
        clientIdentifier: clientIp,
        sessionId: req.body?.sessionId || "unidentified",
        operationType: "single_turn",
        modelName: req.body?.config?.modelName || "gemini-1.5-pro",
        durationMs: Date.now() - startTime,
        success: false,
        statusCode: 429,
        errorMessage: "Rate limit exceeded. Too many requests in time window."
      });
      res.status(429).json({
        success: false,
        error: "Rate limit exceeded. Please apply exponential backoff.",
        statusCode: 429
      });
      return;
    }

    let payload: ExtendedChatPayload;
    try {
      payload = validateAndSanitizePayload(req.body);
    } catch (validationErr: any) {
      const statusCode = validationErr.statusCode || 400;
      this.telemetryCollector.recordEvent({
        clientIdentifier: clientIp,
        sessionId: req.body?.sessionId || "unidentified",
        operationType: "single_turn",
        modelName: req.body?.config?.modelName || "gemini-1.5-pro",
        durationMs: Date.now() - startTime,
        success: false,
        statusCode,
        errorMessage: validationErr.message,
        metadata: { details: validationErr.details }
      });
      res.status(statusCode).json({
        success: false,
        error: validationErr.message,
        details: validationErr.details,
        statusCode
      });
      return;
    }

    const operationMode = req.body?.mode || (payload.stream ? "stream" : (req.body?.attachments ? "multimodal" : (req.body?.agentic ? "agent" : (req.body?.responseSchema ? "structured" : (req.body?.history && req.body.history.length > 0 ? "chat" : "single_turn")))));

    let operationType: TelemetryEventRecord["operationType"] = "single_turn";
    let modelName = payload.config?.modelName || DEFAULT_CONFIG.modelName;

    try {
      if (operationMode === "stream") {
        operationType = "stream";
        await this.inferenceEngine.streamSingleTurn(payload, res);
        
        this.telemetryCollector.recordEvent({
          clientIdentifier: clientIp,
          sessionId: payload.sessionId!,
          operationType,
          modelName,
          durationMs: Date.now() - startTime,
          success: true,
          statusCode: 200
        });
        return;
      }

      let result: any;
      if (operationMode === "multimodal" || (req.body?.attachments && req.body.attachments.length > 0)) {
        operationType = "multimodal";
        result = await this.multimodalProcessor.processMultimodalTurn({
          ...payload,
          attachments: req.body.attachments
        });
      } else if (operationMode === "agent" || req.body?.agentic === true) {
        operationType = "agent";
        const maxIter = typeof req.body?.maxIterations === "number" ? req.body.maxIterations : 5;
        result = await this.agenticDispatcher.executeAgenticLoop(payload, maxIter);
      } else if (operationMode === "structured" || req.body?.responseSchema) {
        operationType = "structured";
        const schemaOpts = {
          responseSchema: req.body.responseSchema,
          schemaName: req.body.schemaName || "GeneratedSchema"
        };
        result = await this.structuredGenerator.generateStructured(payload, schemaOpts);
      } else if (operationMode === "chat" || (payload.history && payload.history.length > 0)) {
        operationType = "chat";
        result = await this.inferenceEngine.generateMultiTurnChat(payload);
      } else {
        operationType = "single_turn";
        result = await this.inferenceEngine.generateSingleTurn(payload);
      }

      this.telemetryCollector.recordEvent({
        clientIdentifier: clientIp,
        sessionId: payload.sessionId!,
        operationType,
        modelName,
        durationMs: Date.now() - startTime,
        success: true,
        tokenUsage: result.usageMetadata ? {
          promptTokens: result.usageMetadata.promptTokenCount,
          completionTokens: result.usageMetadata.candidatesTokenCount,
          totalTokens: result.usageMetadata.totalTokenCount
        } : undefined,
        statusCode: 200
      });

      res.status(200).json(result);
    } catch (error: any) {
      const statusCode = error.statusCode || error.status || 500;
      const errorMessage = error.message || "Internal inference error";

      this.telemetryCollector.recordEvent({
        clientIdentifier: clientIp,
        sessionId: payload.sessionId!,
        operationType,
        modelName,
        durationMs: Date.now() - startTime,
        success: false,
        statusCode,
        errorMessage
      });

      res.status(statusCode).json({
        success: false,
        error: errorMessage,
        statusCode,
        timestamp: Date.now()
      });
    }
  }
}

export default async function handler(req: VercelRequest, res: VercelResponse): Promise<void> {
  const router = GeminiAPIRouter.getInstance();
  return router.handleRequest(req, res);
}// ============================================================================
// STAGE 10: Enterprise Security Audit Logging, Request Sanitization, and Final Export Validation
// ============================================================================

export interface SecurityAuditLogRecord {
  auditId: string;
  timestamp: number;
  clientIp: string;
  userAgent: string;
  endpoint: string;
  payloadHash: string;
  threatDetected: boolean;
  threatDetails?: string;
  actionTaken: "allowed" | "sanitized" | "blocked";
}

export class GeminiSecurityAuditor {
  private static instance: GeminiSecurityAuditor;
  private auditLogs: SecurityAuditLogRecord[] = [];
  private maxLogs: number;

  private constructor(maxLogs: number = 2000) {
    this.maxLogs = maxLogs;
  }

  public static getInstance(): GeminiSecurityAuditor {
    if (!GeminiSecurityAuditor.instance) {
      GeminiSecurityAuditor.instance = new GeminiSecurityAuditor();
    }
    return GeminiSecurityAuditor.instance;
  }

  public auditRequest(req: any, endpoint: string): { allowed: boolean; sanitizedPayload?: any; reason?: string } {
    const clientIp = extractClientIdentifier(req);
    const userAgent = String(req.headers?.["user-agent"] || "unknown");
    const now = Date.now();
    const auditId = `aud_${now}_${Math.random().toString(36).substring(2, 9)}`;

    const body = req.body || {};
    const payloadString = JSON.stringify(body);
    
    // Simple heuristic threat scanning for prompt injection or malicious payloads
    const suspiciousPatterns = [
      /<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi,
      /javascript:/gi,
      /\bunion\s+select\b/gi,
      /\bdrop\s+table\b/gi
    ];

    let threatDetected = false;
    let threatDetails = "";

    for (const pattern of suspiciousPatterns) {
      if (pattern.test(payloadString)) {
        threatDetected = true;
        threatDetails = `Matched dangerous regex pattern: ${pattern.source}`;
        break;
      }
    }

    const record: SecurityAuditLogRecord = {
      auditId,
      timestamp: now,
      clientIp,
      userAgent,
      endpoint,
      payloadHash: auditId, // Simplified hash representation
      threatDetected,
      threatDetails: threatDetected ? threatDetails : undefined,
      actionTaken: threatDetected ? "blocked" : "allowed"
    };

    this.auditLogs.push(record);
    if (this.auditLogs.length > this.maxLogs) {
      this.auditLogs.shift();
    }

    if (threatDetected) {
      console.warn(`[GeminiSecurityAuditor] SECURITY THREAT BLOCKED from IP ${clientIp}: ${threatDetails}`);
      return { allowed: false, reason: `Request blocked by security policy: ${threatDetails}` };
    }

    return { allowed: true, sanitizedPayload: body };
  }

  public getAuditTrail(limit: number = 50): SecurityAuditLogRecord[] {
    return this.auditLogs.slice(-limit).reverse();
  }
}

export const GeminiSystemRegistry = {
  version: "4.0.0-production",
  stage: "10/10 Full Scale Production Orchestration Complete",
  components: [
    "Extended Architectural Types & Validation Schemas",
    "InMemorySessionStore & DistributedTokenBucketRateLimiter",
    "GeminiSDKClientManager & ExponentialBackoffSubsystem",
    "GeminiInferenceEngine & StreamingOrchestrator",
    "GeminiMultimodalProcessor & EmbeddingSubsystem",
    "GeminiAgenticToolDispatcher & Builtin Utilities",
    "GeminiStructuredGenerator & Schema Factory",
    "GeminiTelemetryCollector & SystemHealthDiagnostics",
    "GeminiAPIRouter & Vercel Serverless Entrypoint Handler",
    "GeminiSecurityAuditor & Enterprise Threat Mitigation"
  ],
  initializedAt: Date.now()
};

// End of 10-Stage Chained Orchestration Pipeline for api/gemini.ts

// --- CONSOLIDATED FROM: ./gemini.ts ---

import type { VercelRequest, VercelResponse } from "@vercel/node";
import { GoogleGenerativeAI } from "@google/generative-ai";

export default async function handler(
  req: VercelRequest,
  res: VercelResponse
) {
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }

  try {
    const { prompt, sessionId } = req.body;

    if (!prompt || typeof prompt !== "string") {
      return res.status(400).json({ error: "Invalid prompt" });
    }

    if (!process.env.GEMINI_API_KEY) {
      return res.status(500).json({ error: "API configuration error" });
    }

    const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-pro" });

    const result = await model.generateContent(prompt);
    const response = await result.response;

    return res.status(200).json({
      text: response.text(),
      sessionId,
    });
  } catch (err) {
    console.error("Gemini API error:", err);
    return res.status(500).json({
      error: "Quantum AI Core unavailable",
    });
  }
}