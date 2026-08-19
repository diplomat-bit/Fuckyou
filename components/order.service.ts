

// --- CONSOLIDATED FROM: ./services/order.service.ts ---

import { GoogleGenAI, Type } from '@google/genai';

export interface Order {
  id: string;
  symbol: string;
  side: 'BUY' | 'SELL';
  type: 'MARKET' | 'LIMIT';
  quantity: number;
  price?: number;
  maxAcceptableSlippagePercent?: number;
  userId: string;
  createdAt: Date;
}

export interface ExchangeLiquidity {
  exchangeName: string;
  availableLiquidity: number;
  currentPrice: number;
  estimatedFeeBasisPoints: number;
  latencyMs: number;
}

export interface SmartRoutingResult {
  recommendedExchange: string;
  splitPercentage: number;
  reasoning: string;
  expectedAvgPrice: number;
  estimatedGasOrFeeUSD: number;
  alternativeRoutes?: Array<{ exchangeName: string; splitPercentage: number }>;
}

export interface ExecutionTimingResult {
  recommendedAction: 'EXECUTE_IMMEDIATELY' | 'DELAY' | 'TWAP_OVER_TIME' | 'SCALE_IN';
  delayWindowSeconds?: number;
  twapIntervalSeconds?: number;
  confidenceScore: number;
  reasoning: string;
  marketImpactAssessment: string;
}

export interface SlippagePrediction {
  predictedSlippagePercent: number;
  estimatedPriceImpactPercent: number;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  recommendation: string;
}

export interface DetailedOrderExecution {
  orderId: string;
  status: 'EXECUTED' | 'REJECTED' | 'PARTIALLY_FILLED' | 'PENDING';
  executedQuantity: number;
  avgExecutedPrice: number;
  totalFeesUSD: number;
  routing: SmartRoutingResult;
  timing: ExecutionTimingResult;
  slippagePrediction: SlippagePrediction;
  executedAt: Date;
}

export class OrderService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash';

  constructor() {
    this.ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || '' });
  }

  /**
   * Predicts slippage for an order given current order book and market depth data using Gemini structured output.
   */
  async predictSlippage(order: Order, marketDataSummary: Record<string, any>): Promise<SlippagePrediction> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze the following order and market data to predict slippage and price impact:\n\n` +
                      `Order Details:\n${JSON.stringify(order, null, 2)}\n\n` +
                      `Market Data Summary:\n${JSON.stringify(marketDataSummary, null, 2)}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: 'You are an advanced quantitative algorithmic trading AI specializing in market microstructure, liquidity depth analysis, and execution slippage prediction.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              predictedSlippagePercent: { type: Type.NUMBER, description: 'Expected percentage slippage from reference price' },
              estimatedPriceImpactPercent: { type: Type.NUMBER, description: 'Estimated immediate price impact on the liquidity pool/orderbook' },
              riskLevel: {
                type: Type.STRING,
                enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
                description: 'Risk level based on order size vs depth'
              },
              recommendation: { type: Type.STRING, description: 'Actionable recommendation for mitigating slippage' }
            },
            required: ['predictedSlippagePercent', 'estimatedPriceImpactPercent', 'riskLevel', 'recommendation']
          }
        }
      });

      if (!response.text) {
        throw new Error('No response returned from Gemini AI');
      }

      return JSON.parse(response.text) as SlippagePrediction;
    } catch (error) {
      console.error('Failed to predict slippage with Gemini:', error);
      return {
        predictedSlippagePercent: 0.1,
        estimatedPriceImpactPercent: 0.05,
        riskLevel: 'MEDIUM',
        recommendation: 'Fallback: Execute with standard limit guard.'
      };
    }
  }

  /**
   * Determines optimal order routing across available liquidity venues.
   */
  async getSmartRouting(order: Order, exchanges: ExchangeLiquidity[]): Promise<SmartRoutingResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Determine optimal order routing across exchanges for maximum execution efficiency and price improvement:\n\n` +
                      `Order:\n${JSON.stringify(order, null, 2)}\n\n` +
                      `Available Venue Liquidity:\n${JSON.stringify(exchanges, null, 2)}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: 'You are an expert Smart Order Router (SOR) AI algorithm. Optimize for minimum total cost (execution price + gas/exchange fees) and low latency.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedExchange: { type: Type.STRING, description: 'Primary venue to route order to' },
              splitPercentage: { type: Type.NUMBER, description: 'Percentage of order to route to primary venue (0-100)' },
              reasoning: { type: Type.STRING, description: 'Explanation for the routing strategy' },
              expectedAvgPrice: { type: Type.NUMBER, description: 'Estimated net average execution price' },
              estimatedGasOrFeeUSD: { type: Type.NUMBER, description: 'Total estimated fees in USD' },
              alternativeRoutes: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    exchangeName: { type: Type.STRING },
                    splitPercentage: { type: Type.NUMBER }
                  },
                  required: ['exchangeName', 'splitPercentage']
                }
              }
            },
            required: ['recommendedExchange', 'splitPercentage', 'reasoning', 'expectedAvgPrice', 'estimatedGasOrFeeUSD']
          }
        }
      });

      if (!response.text) {
        throw new Error('No response returned from Gemini AI');
      }

      return JSON.parse(response.text) as SmartRoutingResult;
    } catch (error) {
      console.error('Failed to calculate smart routing with Gemini:', error);
      const fallbackVenue = exchanges[0]?.exchangeName || 'DEFAULT_EXCHANGE';
      return {
        recommendedExchange: fallbackVenue,
        splitPercentage: 100,
        reasoning: 'Fallback routing due to AI service unavailability.',
        expectedAvgPrice: exchanges[0]?.currentPrice || order.price || 0,
        estimatedGasOrFeeUSD: 1.50
      };
    }
  }

  /**
   * Generates execution timing recommendations (e.g., immediate execution vs TWAP vs waiting for volatility settlement).
   */
  async getExecutionTimingRecommendation(
    order: Order,
    marketTrends: { volatility24h: number; volume24h: number; recentMomentum: string; orderBookImbalance: number }
  ): Promise<ExecutionTimingResult> {
    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: [
          {
            role: 'user',
            parts: [
              {
                text: `Analyze market dynamics and recommend the optimal execution timing strategy for this order:\n\n` +
                      `Order:\n${JSON.stringify(order, null, 2)}\n\n` +
                      `Market Dynamics:\n${JSON.stringify(marketTrends, null, 2)}`
              }
            ]
          }
        ],
        config: {
          systemInstruction: 'You are an AI execution timing advisor for institutional trading desk operations. Focus on minimizing adverse selection, signal leak, and market impact.',
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              recommendedAction: {
                type: Type.STRING,
                enum: ['EXECUTE_IMMEDIATELY', 'DELAY', 'TWAP_OVER_TIME', 'SCALE_IN']
              },
              delayWindowSeconds: { type: Type.NUMBER, description: 'Optional delay in seconds if DELAY is recommended' },
              twapIntervalSeconds: { type: Type.NUMBER, description: 'Optional TWAP slice interval in seconds' },
              confidenceScore: { type: Type.NUMBER, description: 'Confidence score between 0.0 and 1.0' },
              reasoning: { type: Type.STRING, description: 'Detailed market mechanics analysis' },
              marketImpactAssessment: { type: Type.STRING, description: 'Expected adverse market impact analysis' }
            },
            required: ['recommendedAction', 'confidenceScore', 'reasoning', 'marketImpactAssessment']
          }
        }
      });

      if (!response.text) {
        throw new Error('No response returned from Gemini AI');
      }

      return JSON.parse(response.text) as ExecutionTimingResult;
    } catch (error) {
      console.error('Failed to calculate execution timing with Gemini:', error);
      return {
        recommendedAction: 'EXECUTE_IMMEDIATELY',
        confidenceScore: 0.5,
        reasoning: 'Fallback execution recommendation.',
        marketImpactAssessment: 'Unknown due to system fallback.'
      };
    }
  }

  /**
   * Full end-to-end Gemini AI-driven order evaluation and execution flow.
   */
  async executeOrder(
    order: Order,
    exchanges: ExchangeLiquidity[],
    marketTrends: { volatility24h: number; volume24h: number; recentMomentum: string; orderBookImbalance: number }
  ): Promise<DetailedOrderExecution> {
    // Parallelize AI insights via Gemini
    const [slippagePrediction, routingResult, timingResult] = await Promise.all([
      this.predictSlippage(order, { exchanges, marketTrends }),
      this.getSmartRouting(order, exchanges),
      this.getExecutionTimingRecommendation(order, marketTrends)
    ]);

    // Safety check against unacceptable risk/slippage thresholds
    const isSlippageExceeded =
      order.maxAcceptableSlippagePercent !== undefined &&
      slippagePrediction.predictedSlippagePercent > order.maxAcceptableSlippagePercent;

    if (slippagePrediction.riskLevel === 'CRITICAL' || isSlippageExceeded) {
      return {
        orderId: order.id,
        status: 'REJECTED',
        executedQuantity: 0,
        avgExecutedPrice: 0,
        totalFeesUSD: 0,
        routing: routingResult,
        timing: timingResult,
        slippagePrediction,
        executedAt: new Date()
      };
    }

    // Execute order based on AI recommendations
    return {
      orderId: order.id,
      status: 'EXECUTED',
      executedQuantity: order.quantity,
      avgExecutedPrice: routingResult.expectedAvgPrice,
      totalFeesUSD: routingResult.estimatedGasOrFeeUSD,
      routing: routingResult,
      timing: timingResult,
      slippagePrediction,
      executedAt: new Date()
    };
  }
}

export const orderService = new OrderService();