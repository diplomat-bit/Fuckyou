import { GoogleGenerativeAI, Schema, SchemaType as Type } from '@google/generative-ai';
import { logger } from '../api/utils/logger';

export interface Holding {
  asset: string;
  quantity: number;
  value: number;
  purchasePrice: number;
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  type: 'deposit' | 'withdrawal' | 'buy' | 'sell';
  description: string;
}

export interface BrokerAccount {
  id: string;
  userId: string;
  brokerName: string;
  accountType: 'checking' | 'savings' | 'investment' | 'retirement';
  balance: number;
  holdings: Holding[];
  transactionHistory: Transaction[];
  status: 'active' | 'suspended' | 'closed';
  createdAt: Date;
}

export interface RiskProfile {
  level: 'Low' | 'Medium' | 'High';
  score: number; // 1 to 100
  analysis: string;
  recommendedAllocation: Array<{ assetClass: string; percentage: number }>;
}

export interface FinancialHealth {
  score: number; // 1 to 100
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  debtToIncomeRatio: number;
  savingsRate: number;
  keyInsights: string[];
  recommendations: string[];
}

export interface CreditScore {
  score: number; // 300 to 850
  rating: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  factors: string[];
  creditLimitRecommendation: number;
}

export interface ComprehensiveAnalysis {
  riskProfile: RiskProfile;
  financialHealth: FinancialHealth;
  creditScore: CreditScore;
}

export class AccountService {
  private ai: GoogleGenerativeAI;
  private accounts: Map<string, BrokerAccount> = new Map();
  private isMockMode: boolean = false;

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    if (!apiKey) {
      logger.warn('GEMINI_API_KEY or GOOGLE_API_KEY environment variable is missing. AccountService will operate in fallback mock mode.');
      this.isMockMode = true;
      this.ai = new GoogleGenerativeAI('MOCK_KEY');
    } else {
      this.ai = new GoogleGenerativeAI(apiKey);
    }
  }

  /**
   * Creates a new broker account and stores it in memory.
   */
  public async createAccount(accountData: Omit<BrokerAccount, 'id' | 'createdAt'>): Promise<BrokerAccount> {
    const id = Math.random().toString(36).substring(2, 15);
    const newAccount: BrokerAccount = {
      ...accountData,
      id,
      createdAt: new Date(),
    };
    this.accounts.set(id, newAccount);
    logger.info(`Broker account created successfully with ID: ${id}`);
    return newAccount;
  }

  /**
   * Retrieves a broker account by ID.
   */
  public async getAccount(id: string): Promise<BrokerAccount | null> {
    return this.accounts.get(id) || null;
  }

  /**
   * Updates an existing broker account.
   */
  public async updateAccount(id: string, updates: Partial<BrokerAccount>): Promise<BrokerAccount> {
    const account = this.accounts.get(id);
    if (!account) {
      throw new Error(`Account with ID ${id} not found.`);
    }
    const updatedAccount = { ...account, ...updates };
    this.accounts.set(id, updatedAccount);
    logger.info(`Broker account updated successfully: ${id}`);
    return updatedAccount;
  }

  /**
   * Deletes a broker account.
   */
  public async deleteAccount(id: string): Promise<boolean> {
    const deleted = this.accounts.delete(id);
    if (deleted) {
      logger.info(`Broker account deleted successfully: ${id}`);
    }
    return deleted;
  }

  /**
   * Uses Gemini to analyze the risk profile of the account holder based on holdings and transactions.
   * Falls back to a robust heuristic analysis if the API key is missing or the call fails.
   */
  public async analyzeRiskProfile(accountId: string): Promise<RiskProfile> {
    const account = await this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found.`);
    }

    if (this.isMockMode) {
      return this.generateHeuristicRiskProfile(account);
    }

    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              level: { type: Type.STRING, enum: ['Low', 'Medium', 'High'] },
              score: { type: Type.INTEGER },
              analysis: { type: Type.STRING },
              recommendedAllocation: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    assetClass: { type: Type.STRING },
                    percentage: { type: Type.INTEGER },
                  },
                  required: ['assetClass', 'percentage'],
                },
              },
            },
            required: ['level', 'score', 'analysis', 'recommendedAllocation'],
          },
        },
      });

      const prompt = `
        Analyze the investment risk profile for the following broker account:
        Account Type: ${account.accountType}
        Current Balance: $${account.balance}
        Holdings: ${JSON.stringify(account.holdings)}
        Recent Transactions: ${JSON.stringify(account.transactionHistory.slice(0, 10))}

        Provide a risk level (Low, Medium, High), a risk score from 1 to 100, a detailed analysis of their current risk exposure, and a recommended asset allocation strategy.
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as RiskProfile;
    } catch (error) {
      logger.error(`Gemini risk profile analysis failed for account ${accountId}. Falling back to heuristics. Error: ${error instanceof Error ? error.message : error}`);
      return this.generateHeuristicRiskProfile(account);
    }
  }

  /**
   * Uses Gemini to perform a comprehensive financial health analysis.
   * Falls back to a robust heuristic analysis if the API key is missing or the call fails.
   */
  public async analyzeFinancialHealth(accountId: string): Promise<FinancialHealth> {
    const account = await this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found.`);
    }

    if (this.isMockMode) {
      return this.generateHeuristicFinancialHealth(account);
    }

    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              status: { type: Type.STRING, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
              debtToIncomeRatio: { type: Type.NUMBER },
              savingsRate: { type: Type.NUMBER },
              keyInsights: { type: Type.ARRAY, items: { type: Type.STRING } },
              recommendations: { type: Type.ARRAY, items: { type: Type.STRING } },
            },
            required: ['score', 'status', 'debtToIncomeRatio', 'savingsRate', 'keyInsights', 'recommendations'],
          },
        },
      });

      const prompt = `
        Analyze the financial health of the following broker account:
        Account Type: ${account.accountType}
        Current Balance: $${account.balance}
        Holdings: ${JSON.stringify(account.holdings)}
        Transaction History: ${JSON.stringify(account.transactionHistory)}

        Calculate or estimate the debt-to-income ratio and savings rate based on the transaction patterns.
        Provide a financial health score (1-100), status, key insights, and actionable recommendations.
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as FinancialHealth;
    } catch (error) {
      logger.error(`Gemini financial health analysis failed for account ${accountId}. Falling back to heuristics. Error: ${error instanceof Error ? error.message : error}`);
      return this.generateHeuristicFinancialHealth(account);
    }
  }

  /**
   * Uses Gemini to generate an automated credit score and credit limit recommendation.
   * Falls back to a robust heuristic analysis if the API key is missing or the call fails.
   */
  public async generateCreditScore(accountId: string): Promise<CreditScore> {
    const account = await this.getAccount(accountId);
    if (!account) {
      throw new Error(`Account with ID ${accountId} not found.`);
    }

    if (this.isMockMode) {
      return this.generateHeuristicCreditScore(account);
    }

    try {
      const model = this.ai.getGenerativeModel({
        model: 'gemini-2.5-flash',
        generationConfig: {
          responseMimeType: 'application/json',
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              score: { type: Type.INTEGER },
              rating: { type: Type.STRING, enum: ['Excellent', 'Good', 'Fair', 'Poor'] },
              factors: { type: Type.ARRAY, items: { type: Type.STRING } },
              creditLimitRecommendation: { type: Type.NUMBER },
            },
            required: ['score', 'rating', 'factors', 'creditLimitRecommendation'],
          },
        },
      });

      const prompt = `
        Perform an automated credit scoring assessment for the following broker account:
        Account Type: ${account.accountType}
        Current Balance: $${account.balance}
        Holdings Value: $${account.holdings.reduce((sum, h) => sum + h.value, 0)}
        Transaction History: ${JSON.stringify(account.transactionHistory)}

        Based on asset values, transaction consistency, deposits, and withdrawals, estimate a credit score (300-850), credit rating, key contributing factors, and a recommended credit limit.
      `;

      const response = await model.generateContent(prompt);
      const text = response.response.text();
      return JSON.parse(text) as CreditScore;
    } catch (error) {
      logger.error(`Gemini credit score generation failed for account ${accountId}. Falling back to heuristics. Error: ${error instanceof Error ? error.message : error}`);
      return this.generateHeuristicCreditScore(account);
    }
  }
}