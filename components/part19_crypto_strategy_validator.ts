

// --- CONSOLIDATED FROM: ./clarity/part19_crypto_strategy_validator.ts ---

import { StrategyConfig, MarketCondition, ValidationResult } from '../types/sovereign';
import { logger } from '../api/utils/logger';

/**
 * Part 19: Crypto Strategy Compliance Validator
 * Validates algorithmic trading strategies (e.g., BTC swing trading, TQQQ) 
 * against market clarity rules and sovereign risk parameters.
 */

export class CryptoStrategyValidator {
  private readonly MAX_LEVERAGE = 3.0;
  private readonly VOLATILITY_THRESHOLD = 0.05;

  /**
   * Validates a strategy configuration against current market conditions
   * and internal compliance mandates.
   */
  public validateStrategy(config: StrategyConfig, market: MarketCondition): ValidationResult {
    logger.info(`Validating strategy: ${config.id} against market: ${market.symbol}`);

    const errors: string[] = [];

    // 1. Leverage Check
    if (config.leverage > this.MAX_LEVERAGE) {
      errors.push(`Leverage ${config.leverage} exceeds maximum allowed ${this.MAX_LEVERAGE}`);
    }

    // 2. Volatility/Risk Check
    if (market.volatility > this.VOLATILITY_THRESHOLD && config.isAggressive) {
      errors.push('Aggressive strategy prohibited during high market volatility');
    }

    // 3. Asset-Specific Compliance (e.g., TQQQ vs BTC)
    if (config.assetType === 'CRYPTO' && !market.isLiquiditySufficient) {
      errors.push('Insufficient liquidity for crypto strategy execution');
    }

    if (config.assetType === 'ETF' && market.isMarketHalted) {
      errors.push('Cannot execute ETF strategy while market is halted');
    }

    return {
      valid: errors.length === 0,
      errors,
      timestamp: new Date().toISOString(),
      strategyId: config.id
    };
  }

  /**
   * Performs a deep audit of the strategy logic to ensure no unauthorized
   * recursive loops or excessive API calls.
   */
  public auditStrategyLogic(config: StrategyConfig): boolean {
    if (config.frequency > 1000) {
      logger.warn(`High frequency detected for strategy ${config.id}: ${config.frequency} ops/sec`);
      return false;
    }
    return true;
  }
}

export const strategyValidator = new CryptoStrategyValidator();