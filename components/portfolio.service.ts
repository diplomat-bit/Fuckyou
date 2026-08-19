

// --- CONSOLIDATED FROM: ./services/portfolio.service.ts ---

import { GoogleGenAI } from '@google/genai';

export interface Asset {
  symbol: string;
  name: string;
  assetClass: 'Equity' | 'Fixed Income' | 'Cash' | 'Alternative' | 'Crypto';
  quantity: number;
  currentPrice: number;
  costBasis: number; // Total cost paid for the current holding
  currentValue: number; // quantity * currentPrice
}

export interface TargetAllocation {
  assetClass: string;
  targetPercentage: number; // e.g., 60 for 60%
}

export interface Portfolio {
  id: string;
  userId: string;
  name: string;
  assets: Asset[];
  targetAllocation: TargetAllocation[];
}

export interface RebalancingSuggestion {
  symbol: string;
  action: 'BUY' | 'SELL' | 'HOLD';
  quantity: number;
  estimatedValue: number;
  reasoning: string;
}

export interface RebalancingResponse {
  suggestions: RebalancingSuggestion[];
  summary: string;
}

export interface AllocationInsight {
  category: string;
  currentPercentage: number;
  targetPercentage: number;
  deviation: number;
  analysis: string;
  recommendation: string;
}

export interface AllocationInsightsResponse {
  insights: AllocationInsight[];
  overallRiskAssessment: string;
}

export interface TaxLossHarvestingOpportunity {
  symbol: string;
  unrealizedLoss: number;
  potentialTaxSavings: number; // Estimated based on standard capital gains offset
  replacementAssetSuggestions: string[];
  washSaleWarning: string;
  strategyDescription: string;
}

export interface TaxLossHarvestingResponse {
  opportunities: TaxLossHarvestingOpportunity[];
  totalEstimatedSavings: number;
  disclaimer: string;
}

export class PortfolioService {
  private ai: GoogleGenAI;
  private modelName = 'gemini-2.5-flash';

  // In-memory mock database for demonstration and fallback
  private portfolios: Map<string, Portfolio> = new Map();

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      console.warn('Warning: GEMINI_API_KEY is not set. Gemini integrations will fail.');
    }
    this.ai = new GoogleGenAI({ apiKey: apiKey || 'MOCK_KEY' });
    this.initializeMockData();
  }

  /**
   * Initializes the service with mock data for testing/production fallback.
   */
  private initializeMockData() {
    const defaultPortfolio: Portfolio = {
      id: 'port-123',
      userId: 'user-99',
      name: 'Balanced Growth Portfolio',
      assets: [
        { symbol: 'AAPL', name: 'Apple Inc.', assetClass: 'Equity', quantity: 50, currentPrice: 180, costBasis: 10000, currentValue: 9000 },
        { symbol: 'MSFT', name: 'Microsoft Corp.', assetClass: 'Equity', quantity: 30, currentPrice: 420, costBasis: 10000, currentValue: 12600 },
        { symbol: 'BND', name: 'Vanguard Total Bond Market ETF', assetClass: 'Fixed Income', quantity: 120, currentPrice: 72, costBasis: 10000, currentValue: 8640 },
        { symbol: 'VOO', name: 'Vanguard S&P 500 ETF', assetClass: 'Equity', quantity: 25, currentPrice: 460, costBasis: 10500, currentValue: 11500 },
        { symbol: 'BTC', name: 'Bitcoin', assetClass: 'Crypto', quantity: 0.15, currentPrice: 65000, costBasis: 11000, currentValue: 9750 },
        { symbol: 'AGG', name: 'iShares Core U.S. Aggregate Bond ETF', assetClass: 'Fixed Income', quantity: 50, currentPrice: 95, costBasis: 5200, currentValue: 4750 }
      ],
      targetAllocation: [
        { assetClass: 'Equity', targetPercentage: 60 },
        { assetClass: 'Fixed Income', targetPercentage: 30 },
        { assetClass: 'Crypto', targetPercentage: 5 },
        { assetClass: 'Cash', targetPercentage: 5 }
      ]
    };
    this.portfolios.set(defaultPortfolio.id, defaultPortfolio);
  }

  /**
   * Retrieves a portfolio by ID.
   */
  public async getPortfolio(portfolioId: string): Promise<Portfolio> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio with ID ${portfolioId} not found.`);
    }
    return portfolio;
  }

  /**
   * Updates or creates a portfolio.
   */
  public async savePortfolio(portfolio: Portfolio): Promise<Portfolio> {
    this.portfolios.set(portfolio.id, portfolio);
    return portfolio;
  }

  /**
   * Generates automated rebalancing suggestions using Gemini.
   */
  public async getRebalancingSuggestions(portfolioId: string): Promise<RebalancingResponse> {
    const portfolio = await this.getPortfolio(portfolioId);
    const totalValue = portfolio.assets.reduce((sum, asset) => sum + asset.currentValue, 0);

    const prompt = `
      You are an expert financial advisor. Analyze the following portfolio and suggest rebalancing actions to align with the target allocations.
      
      Portfolio Name: ${portfolio.name}
      Total Portfolio Value: $${totalValue.toFixed(2)}
      
      Current Assets:
      ${JSON.stringify(portfolio.assets, null, 2)}
      
      Target Allocations:
      ${JSON.stringify(portfolio.targetAllocation, null, 2)}
      
      Provide specific BUY, SELL, or HOLD suggestions for each asset to bring the portfolio back to its target allocation.
      Consider transaction efficiency and minimize unnecessary trades.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              suggestions: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    symbol: { type: 'STRING' },
                    action: { type: 'STRING', enum: ['BUY', 'SELL', 'HOLD'] },
                    quantity: { type: 'NUMBER' },
                    estimatedValue: { type: 'NUMBER' },
                    reasoning: { type: 'STRING' }
                  },
                  required: ['symbol', 'action', 'quantity', 'estimatedValue', 'reasoning']
                }
              },
              summary: { type: 'STRING' }
            },
            required: ['suggestions', 'summary']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini API.');
      }

      return JSON.parse(responseText) as RebalancingResponse;
    } catch (error) {
      console.error('Error generating rebalancing suggestions with Gemini:', error);
      throw new Error('Failed to generate rebalancing suggestions.');
    }
  }

  /**
   * Generates deep asset allocation insights using Gemini.
   */
  public async getAssetAllocationInsights(portfolioId: string): Promise<AllocationInsightsResponse> {
    const portfolio = await this.getPortfolio(portfolioId);
    const totalValue = portfolio.assets.reduce((sum, asset) => sum + asset.currentValue, 0);

    const prompt = `
      You are an elite portfolio strategist. Analyze the asset allocation of this portfolio.
      
      Portfolio Name: ${portfolio.name}
      Total Portfolio Value: $${totalValue.toFixed(2)}
      
      Current Assets:
      ${JSON.stringify(portfolio.assets, null, 2)}
      
      Target Allocations:
      ${JSON.stringify(portfolio.targetAllocation, null, 2)}
      
      Provide deep insights into:
      1. Current vs Target deviations.
      2. Risk exposure (e.g., over-concentration in specific assets or classes).
      3. Diversification quality.
      4. Actionable recommendations to optimize risk-adjusted returns.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              insights: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    category: { type: 'STRING' },
                    currentPercentage: { type: 'NUMBER' },
                    targetPercentage: { type: 'NUMBER' },
                    deviation: { type: 'NUMBER' },
                    analysis: { type: 'STRING' },
                    recommendation: { type: 'STRING' }
                  },
                  required: ['category', 'currentPercentage', 'targetPercentage', 'deviation', 'analysis', 'recommendation']
                }
              },
              overallRiskAssessment: { type: 'STRING' }
            },
            required: ['insights', 'overallRiskAssessment']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini API.');
      }

      return JSON.parse(responseText) as AllocationInsightsResponse;
    } catch (error) {
      console.error('Error generating asset allocation insights with Gemini:', error);
      throw new Error('Failed to generate asset allocation insights.');
    }
  }

  /**
   * Analyzes the portfolio for tax-loss harvesting opportunities using Gemini.
   */
  public async getTaxLossHarvestingAnalysis(portfolioId: string): Promise<TaxLossHarvestingResponse> {
    const portfolio = await this.getPortfolio(portfolioId);

    const prompt = `
      You are a certified tax-loss harvesting specialist and financial planner.
      Analyze the following portfolio assets to identify tax-loss harvesting opportunities.
      An opportunity exists when the current value of an asset is lower than its cost basis (unrealized loss).
      
      Assets:
      ${JSON.stringify(portfolio.assets, null, 2)}
      
      For each asset with an unrealized loss:
      1. Calculate the potential tax savings (assume a standard 15% capital gains tax rate offset for estimation).
      2. Suggest suitable replacement assets (e.g., similar ETFs or stocks) to maintain market exposure while avoiding the 30-day Wash-Sale Rule.
      3. Provide a clear warning about the Wash-Sale Rule.
      4. Describe the harvesting strategy.
    `;

    try {
      const response = await this.ai.models.generateContent({
        model: this.modelName,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: 'OBJECT',
            properties: {
              opportunities: {
                type: 'ARRAY',
                items: {
                  type: 'OBJECT',
                  properties: {
                    symbol: { type: 'STRING' },
                    unrealizedLoss: { type: 'NUMBER' },
                    potentialTaxSavings: { type: 'NUMBER' },
                    replacementAssetSuggestions: {
                      type: 'ARRAY',
                      items: { type: 'STRING' }
                    },
                    washSaleWarning: { type: 'STRING' },
                    strategyDescription: { type: 'STRING' }
                  },
                  required: ['symbol', 'unrealizedLoss', 'potentialTaxSavings', 'replacementAssetSuggestions', 'washSaleWarning', 'strategyDescription']
                }
              },
              totalEstimatedSavings: { type: 'NUMBER' },
              disclaimer: { type: 'STRING' }
            },
            required: ['opportunities', 'totalEstimatedSavings', 'disclaimer']
          }
        }
      });

      const responseText = response.text;
      if (!responseText) {
        throw new Error('Empty response received from Gemini API.');
      }

      return JSON.parse(responseText) as TaxLossHarvestingResponse;
    } catch (error) {
      console.error('Error generating tax-loss harvesting analysis with Gemini:', error);
      throw new Error('Failed to generate tax-loss harvesting analysis.');
    }
  }
}