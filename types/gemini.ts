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