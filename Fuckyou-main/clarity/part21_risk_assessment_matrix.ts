import { Asset, Transaction, RiskProfile } from '../types/sovereign';

/**
 * Part 21: Risk Assessment & Stress Testing
 * Implements capital adequacy modeling, liquidity stress tests, and systemic risk scoring.
 */

export interface StressTestScenario {
  id: string;
  name: string;
  marketShockPercentage: number; // e.g., -0.20 for 20% drop
  liquidityDrainRate: number;    // 0.0 to 1.0
  inflationSpike: number;
}

export class RiskAssessmentEngine {
  private readonly BASE_CAPITAL_REQUIREMENT = 0.08; // Basel III standard

  /**
   * Calculates the Capital Adequacy Ratio (CAR)
   */
  public calculateCAR(tier1Capital: number, tier2Capital: number, riskWeightedAssets: number): number {
    if (riskWeightedAssets === 0) return 1.0;
    return (tier1Capital + tier2Capital) / riskWeightedAssets;
  }

  /**
   * Performs a liquidity stress test based on a specific scenario
   */
  public runLiquidityStressTest(
    currentLiquidity: number,
    assets: Asset[],
    scenario: StressTestScenario
  ): { projectedLiquidity: number; isSolvent: boolean } {
    const haircut = 1 + scenario.marketShockPercentage;
    const totalLiquidatedValue = assets.reduce((acc, asset) => {
      return acc + (asset.value * haircut * (1 - scenario.liquidityDrainRate));
    }, 0);

    const projectedLiquidity = currentLiquidity + totalLiquidatedValue;
    return {
      projectedLiquidity,
      isSolvent: projectedLiquidity > 0
    };
  }

  /**
   * Generates a systemic risk score (0-100) based on portfolio concentration and volatility
   */
  public calculateSystemicRiskScore(assets: Asset[], transactions: Transaction[]): number {
    const concentration = this.calculateConcentrationIndex(assets);
    const volatility = this.calculatePortfolioVolatility(transactions);
    
    // Weighted scoring: 60% concentration, 40% volatility
    const rawScore = (concentration * 0.6) + (volatility * 0.4);
    return Math.min(Math.max(rawScore * 100, 0), 100);
  }

  private calculateConcentrationIndex(assets: Asset[]): number {
    if (assets.length === 0) return 0;
    const totalValue = assets.reduce((sum, a) => sum + a.value, 0);
    const squares = assets.map(a => Math.pow(a.value / totalValue, 2));
    return squares.reduce((sum, s) => sum + s, 0);
  }

  private calculatePortfolioVolatility(transactions: Transaction[]): number {
    if (transactions.length < 2) return 0.05;
    // Simplified variance calculation for demonstration
    const amounts = transactions.map(t => t.amount);
    const mean = amounts.reduce((a, b) => a + b, 0) / amounts.length;
    const variance = amounts.reduce((a, b) => a + Math.pow(b - mean, 2), 0) / amounts.length;
    return Math.sqrt(variance) / (mean || 1);
  }

  /**
   * Validates if the current portfolio meets regulatory capital requirements
   */
  public validateCapitalAdequacy(tier1: number, tier2: number, rwa: number): boolean {
    const car = this.calculateCAR(tier1, tier2, rwa);
    return car >= this.BASE_CAPITAL_REQUIREMENT;
  }
}

export const riskEngine = new RiskAssessmentEngine();