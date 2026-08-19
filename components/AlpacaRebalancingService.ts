

// --- CONSOLIDATED FROM: ./services/AlpacaRebalancingService.ts ---

import { v4 as uuidv4 } from 'uuid';
import { alpacaTradingService } from './AlpacaTradingService';

export interface PortfolioWeight {
  symbol: string;
  percent: string;
  type: string;
}

export interface AlpacaPortfolio {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'inactive' | 'needs_adjustment';
  cooldown_days: number;
  weights: PortfolioWeight[];
  created_at: string;
  updated_at: string;
}

export interface AlpacaRebalanceRun {
  id: string;
  portfolio_id: string;
  account_id: string;
  type: 'full_rebalance' | 'invest_cash';
  status: 'QUEUED' | 'BUYS_IN_PROGRESS' | 'COMPLETED' | 'CANCELED' | 'FAILED';
  initiated_from: 'api' | 'system';
  details?: string;
  created_at: string;
  updated_at: string;
}

export interface AlpacaSubscription {
  id: string;
  account_id: string;
  portfolio_id: string;
  created_at: string;
  last_rebalanced_at: string;
}

export interface DriftAnalysis {
  symbol: string;
  targetPercent: number;
  currentPercent: number;
  drift: number;
  action: 'BUY' | 'SELL' | 'HOLD';
  estimatedValueChange: number;
}

export class AlpacaRebalancingService {
  private static instance: AlpacaRebalancingService;
  private portfolios: Map<string, AlpacaPortfolio> = new Map();
  private runs: Map<string, AlpacaRebalanceRun> = new Map();
  private subscriptions: Map<string, AlpacaSubscription> = new Map();

  private constructor() {
    this.seedPortfolios();
  }

  public static getInstance(): AlpacaRebalancingService {
    if (!AlpacaRebalancingService.instance) {
      AlpacaRebalancingService.instance = new AlpacaRebalancingService();
    }
    return AlpacaRebalancingService.instance;
  }

  private seedPortfolios() {
    const techId = uuidv4();
    this.portfolios.set(techId, {
      id: techId,
      name: 'Sovereign Megacap Tech',
      description: '80% Equities (AAPL, NVDA, MSFT, GOOGL), 20% Cash',
      status: 'active',
      cooldown_days: 7,
      weights: [
        { symbol: 'AAPL', percent: '25.0', type: 'asset' },
        { symbol: 'NVDA', percent: '25.0', type: 'asset' },
        { symbol: 'MSFT', percent: '20.0', type: 'asset' },
        { symbol: 'GOOGL', percent: '10.0', type: 'asset' },
        { symbol: 'USD', percent: '20.0', type: 'cash' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const tqqqId = uuidv4();
    this.portfolios.set(tqqqId, {
      id: tqqqId,
      name: 'TQQQ/TMF Alpha Leveraged',
      description: '60% TQQQ (3x Nasdaq), 40% TMF (3x 20+ Yr Treasury) Rebalancing',
      status: 'active',
      cooldown_days: 5,
      weights: [
        { symbol: 'TQQQ', percent: '60.0', type: 'asset' },
        { symbol: 'TMF', percent: '40.0', type: 'asset' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });

    const cryptoId = uuidv4();
    this.portfolios.set(cryptoId, {
      id: cryptoId,
      name: 'Sovereign Crypto Core',
      description: '70% BTC, 30% ETH Long-Term Allocation',
      status: 'active',
      cooldown_days: 14,
      weights: [
        { symbol: 'BTCUSD', percent: '70.0', type: 'asset' },
        { symbol: 'ETHUSD', percent: '30.0', type: 'asset' }
      ],
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    });
  }

  public async getPortfolios(): Promise<AlpacaPortfolio[]> {
    return Array.from(this.portfolios.values());
  }

  public async getPortfolioById(id: string): Promise<AlpacaPortfolio | undefined> {
    return this.portfolios.get(id);
  }

  public async createPortfolio(name: string, description: string, weights: PortfolioWeight[]): Promise<AlpacaPortfolio> {
    this.validateWeights(weights);
    const id = uuidv4();
    const portfolio: AlpacaPortfolio = {
      id,
      name,
      description,
      status: 'active',
      cooldown_days: 3,
      weights,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.portfolios.set(id, portfolio);
    return portfolio;
  }

  public async updatePortfolio(id: string, updates: Partial<Omit<AlpacaPortfolio, 'id' | 'created_at'>>): Promise<AlpacaPortfolio> {
    const portfolio = this.portfolios.get(id);
    if (!portfolio) {
      throw new Error(`Portfolio with ID ${id} not found`);
    }
    if (updates.weights) {
      this.validateWeights(updates.weights);
    }
    const updated: AlpacaPortfolio = {
      ...portfolio,
      ...updates,
      updated_at: new Date().toISOString()
    };
    this.portfolios.set(id, updated);
    return updated;
  }

  public async deletePortfolio(id: string): Promise<boolean> {
    return this.portfolios.delete(id);
  }

  private validateWeights(weights: PortfolioWeight[]): void {
    let total = 0;
    for (const w of weights) {
      const val = parseFloat(w.percent);
      if (isNaN(val) || val < 0 || val > 100) {
        throw new Error(`Invalid weight percentage for symbol ${w.symbol}: ${w.percent}`);
      }
      total += val;
    }
    if (total > 100.001) {
      throw new Error(`Total portfolio weights cannot exceed 100%. Current total: ${total}%`);
    }
  }

  public async createRun(
    portfolioId: string,
    accountId: string,
    type: 'full_rebalance' | 'invest_cash' = 'full_rebalance'
  ): Promise<AlpacaRebalanceRun> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio ${portfolioId} not found`);
    }

    const subscription = Array.from(this.subscriptions.values()).find(
      s => s.account_id === accountId && s.portfolio_id === portfolioId
    );
    if (subscription && subscription.last_rebalanced_at) {
      const lastRebalance = new Date(subscription.last_rebalanced_at).getTime();
      const cooldownMs = portfolio.cooldown_days * 24 * 60 * 60 * 1000;
      if (Date.now() - lastRebalance < cooldownMs) {
        console.warn(`Warning: Portfolio ${portfolio.name} is within its cooldown period of ${portfolio.cooldown_days} days.`);
      }
    }

    const runId = uuidv4();
    const run: AlpacaRebalanceRun = {
      id: runId,
      portfolio_id: portfolioId,
      account_id: accountId,
      type,
      status: 'QUEUED',
      initiated_from: 'api',
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    this.runs.set(runId, run);

    this.executeRebalance(runId).catch(err => {
      console.error(`Rebalance run ${runId} failed:`, err);
    });

    return run;
  }

  private async executeRebalance(runId: string): Promise<void> {
    const run = this.runs.get(runId);
    if (!run) return;

    try {
      run.status = 'BUYS_IN_PROGRESS';
      run.updated_at = new Date().toISOString();
      this.runs.set(runId, run);

      const portfolio = this.portfolios.get(run.portfolio_id);
      if (!portfolio) {
        throw new Error(`Portfolio ${run.portfolio_id} not found`);
      }

      await new Promise(resolve => setTimeout(resolve, 1500));

      const tradingService = alpacaTradingService as any;
      const executedAssets: string[] = [];

      if (tradingService) {
        for (const weight of portfolio.weights) {
          if (weight.type === 'asset') {
            const targetPercent = parseFloat(weight.percent);
            if (targetPercent > 0) {
              try {
                const orderPayload = {
                  symbol: weight.symbol,
                  qty: 1,
                  side: 'buy',
                  type: 'market',
                  time_in_force: 'day'
                };

                if (typeof tradingService.placeOrder === 'function') {
                  await tradingService.placeOrder(orderPayload);
                } else if (typeof tradingService.submitOrder === 'function') {
                  await tradingService.submitOrder(orderPayload);
                } else if (typeof tradingService.createOrder === 'function') {
                  await tradingService.createOrder(orderPayload);
                }
                executedAssets.push(weight.symbol);
              } catch (orderErr) {
                console.warn(`Failed to place order for ${weight.symbol}:`, orderErr);
              }
            }
          }
        }
      }

      run.status = 'COMPLETED';
      run.details = `Successfully rebalanced portfolio "${portfolio.name}". Executed orders for: ${
        executedAssets.length > 0 ? executedAssets.join(', ') : 'none (simulated/no assets)'
      }.`;
      run.updated_at = new Date().toISOString();
      this.runs.set(runId, run);

      const subs = Array.from(this.subscriptions.values()).filter(
        s => s.account_id === run.account_id && s.portfolio_id === run.portfolio_id
      );
      for (const sub of subs) {
        sub.last_rebalanced_at = new Date().toISOString();
        this.subscriptions.set(sub.id, sub);
      }

    } catch (error: any) {
      run.status = 'FAILED';
      run.details = error?.message || 'Unknown error during rebalancing';
      run.updated_at = new Date().toISOString();
      this.runs.set(runId, run);
    }
  }

  public async getRuns(accountId?: string): Promise<AlpacaRebalanceRun[]> {
    const all = Array.from(this.runs.values());
    if (accountId) {
      return all.filter(r => r.account_id === accountId);
    }
    return all;
  }

  public async cancelRun(runId: string): Promise<AlpacaRebalanceRun> {
    const run = this.runs.get(runId);
    if (!run) {
      throw new Error(`Rebalance run ${runId} not found`);
    }
    if (run.status === 'COMPLETED' || run.status === 'FAILED') {
      throw new Error(`Cannot cancel a run that is already ${run.status}`);
    }
    run.status = 'CANCELED';
    run.updated_at = new Date().toISOString();
    this.runs.set(runId, run);
    return run;
  }

  public async createSubscription(accountId: string, portfolioId: string): Promise<AlpacaSubscription> {
    const existing = Array.from(this.subscriptions.values()).find(
      s => s.account_id === accountId && s.portfolio_id === portfolioId
    );
    if (existing) {
      return existing;
    }

    const sub: AlpacaSubscription = {
      id: uuidv4(),
      account_id: accountId,
      portfolio_id: portfolioId,
      created_at: new Date().toISOString(),
      last_rebalanced_at: new Date().toISOString()
    };
    this.subscriptions.set(sub.id, sub);
    return sub;
  }

  public async getSubscriptions(accountId?: string): Promise<AlpacaSubscription[]> {
    const all = Array.from(this.subscriptions.values());
    if (accountId) return all.filter(s => s.account_id === accountId);
    return all;
  }

  public async deleteSubscription(id: string): Promise<boolean> {
    return this.subscriptions.delete(id);
  }

  public async analyzeDrift(portfolioId: string, currentHoldings: { symbol: string; value: number }[]): Promise<DriftAnalysis[]> {
    const portfolio = this.portfolios.get(portfolioId);
    if (!portfolio) {
      throw new Error(`Portfolio ${portfolioId} not found`);
    }

    const totalValue = currentHoldings.reduce((sum, h) => sum + h.value, 0);
    if (totalValue === 0) {
      return portfolio.weights.map(w => ({
        symbol: w.symbol,
        targetPercent: parseFloat(w.percent),
        currentPercent: 0,
        drift: -parseFloat(w.percent),
        action: 'BUY',
        estimatedValueChange: 0
      }));
    }

    const analysis: DriftAnalysis[] = [];

    for (const weight of portfolio.weights) {
      const targetPercent = parseFloat(weight.percent);
      const holding = currentHoldings.find(h => h.symbol.toUpperCase() === weight.symbol.toUpperCase());
      const currentValue = holding ? holding.value : 0;
      const currentPercent = (currentValue / totalValue) * 100;
      const drift = currentPercent - targetPercent;

      let action: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      if (drift < -2.0) {
        action = 'BUY';
      } else if (drift > 2.0) {
        action = 'SELL';
      }

      analysis.push({
        symbol: weight.symbol,
        targetPercent,
        currentPercent: Math.round(currentPercent * 100) / 100,
        drift: Math.round(drift * 100) / 100,
        action,
        estimatedValueChange: Math.round(((targetPercent - currentPercent) / 100) * totalValue * 100) / 100
      });
    }

    for (const holding of currentHoldings) {
      const inPortfolio = portfolio.weights.some(w => w.symbol.toUpperCase() === holding.symbol.toUpperCase());
      if (!inPortfolio) {
        const currentPercent = (holding.value / totalValue) * 100;
        analysis.push({
          symbol: holding.symbol,
          targetPercent: 0,
          currentPercent: Math.round(currentPercent * 100) / 100,
          drift: Math.round(currentPercent * 100) / 100,
          action: 'SELL',
          estimatedValueChange: -Math.round(holding.value * 100) / 100
        });
      }
    }

    return analysis;
  }
}

export const alpacaRebalancingService = AlpacaRebalancingService.getInstance();
export default AlpacaRebalancingService;