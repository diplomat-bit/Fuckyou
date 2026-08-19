

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section7_structured_products_basket.ts ---

import { Router, Request, Response } from 'express';

export interface Asset {
  ticker: string;
  price: number;
  volatility: number; // Annualized volatility (e.g., 0.25 for 25%)
  weight: number;     // Weight in the basket (e.g., 0.10 for 10%)
}

export interface BarrierStatus {
  isBreached: boolean;
  distanceToBarrier: number; // Percentage distance
  breachProbability: number; // Estimated probability of breach before maturity
}

// ============================================================================
// APP 1: ELKS Barrier Calculator
// Calculates barrier levels, current distances, and breach probabilities for
// Equity Linked Securities (ELKS).
// ============================================================================
export class ELKSBarrierCalculator {
  /**
   * Calculates the barrier status for an ELKS product.
   * Uses a simplified reflection principle approximation for continuous barrier breach probability.
   */
  public static calculateBarrierStatus(
    spotPrice: number,
    strikePrice: number,
    barrierPercent: number, // e.g., 0.80 for 80% of strike
    volatility: number,
    yearsToMaturity: number,
    riskFreeRate: number
  ): BarrierStatus {
    const barrierLevel = strikePrice * barrierPercent;
    const isBreached = spotPrice <= barrierLevel;
    const distanceToBarrier = (spotPrice - barrierLevel) / spotPrice;

    if (isBreached) {
      return { isBreached: true, distanceToBarrier: 0, breachProbability: 1.0 };
    }

    if (yearsToMaturity <= 0) {
      return { isBreached: false, distanceToBarrier, breachProbability: 0.0 };
    }

    // Analytical approximation of down-and-out barrier probability (1 - survival probability)
    // P(Min S_t <= B) = N(d1) + (B/S)^(2*mu/sigma^2) * N(d2)
    const sigma = volatility;
    const S = spotPrice;
    const B = barrierLevel;
    const T = yearsToMaturity;
    const r = riskFreeRate;

    const mu = r - 0.5 * Math.pow(sigma, 2);
    const d1 = (Math.log(B / S) - mu * T) / (sigma * Math.sqrt(T));
    const d2 = (Math.log(B / S) + mu * T) / (sigma * Math.sqrt(T));

    const n_d1 = this.cumulativeNormalDistribution(d1);
    const n_d2 = this.cumulativeNormalDistribution(d2);

    const power = (2 * mu) / Math.pow(sigma, 2);
    let breachProbability = n_d1 + Math.pow(B / S, power) * n_d2;

    // Clamp probability between 0 and 1
    breachProbability = Math.max(0, Math.min(1, breachProbability));

    return {
      isBreached: false,
      distanceToBarrier,
      breachProbability,
    };
  }

  private static cumulativeNormalDistribution(x: number): number {
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;

    if (x >= 0.0) {
      const t = 1.0 / (1.0 + p * x);
      return (1.0 - c * Math.exp(-x * x / 2.0) * t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    } else {
      const t = 1.0 / (1.0 - p * x);
      return (c * Math.exp(-x * x / 2.0) * t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    }
  }
}

// ============================================================================
// APP 2: Knock-In Trigger Simulator
// Simulates price paths to evaluate knock-in trigger events for structured baskets.
// ============================================================================
export class KnockInTriggerSimulator {
  /**
   * Simulates basket price paths using Geometric Brownian Motion (GBM)
   * to estimate the probability of a knock-in event.
   */
  public static simulateKnockIn(
    basket: Asset[],
    correlationMatrix: number[][], // NxN matrix
    riskFreeRate: number,
    daysToMaturity: number,
    knockInBarrierPercent: number, // e.g., 0.70 (70% of initial basket value)
    simulationsCount: number = 5000
  ): { knockInProbability: number; averageKnockInDay: number | null } {
    const N = basket.length;
    const dt = 1 / 252; // Daily steps
    const steps = daysToMaturity;

    // Cholesky Decomposition of correlation matrix for generating correlated random variables
    const L = this.choleskyDecomposition(correlationMatrix);

    let knockInCount = 0;
    let totalKnockInDays = 0;

    for (let sim = 0; sim < simulationsCount; sim++) {
      const currentPrices = basket.map(a => a.price);
      const initialBasketValue = basket.reduce((sum, a) => sum + a.price * a.weight, 0);
      let isKnockedIn = false;
      let knockInDay = -1;

      for (let step = 0; step < steps; step++) {
        const normals = this.generateStandardNormals(N);
        const correlatedNormals = this.multiplyMatrixVector(L, normals);

        for (let i = 0; i < N; i++) {
          const asset = basket[i];
          const drift = (riskFreeRate - 0.5 * Math.pow(asset.volatility, 2)) * dt;
          const diffusion = asset.volatility * Math.sqrt(dt) * correlatedNormals[i];
          currentPrices[i] *= Math.exp(drift + diffusion);
        }

        const currentBasketValue = basket.reduce((sum, a, idx) => sum + currentPrices[idx] * a.weight, 0);
        const performance = currentBasketValue / initialBasketValue;

        if (performance <= knockInBarrierPercent) {
          isKnockedIn = true;
          knockInDay = step + 1;
          break;
        }
      }

      if (isKnockedIn) {
        knockInCount++;
        totalKnockInDays += knockInDay;
      }
    }

    return {
      knockInProbability: knockInCount / simulationsCount,
      averageKnockInDay: knockInCount > 0 ? totalKnockInDays / knockInCount : null,
    };
  }

  private static generateStandardNormals(size: number): number[] {
    const normals: number[] = [];
    for (let i = 0; i < size; i += 2) {
      const u1 = Math.random() || 0.0001;
      const u2 = Math.random() || 0.0001;
      const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
      const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);
      normals.push(z0);
      if (normals.length < size) {
        normals.push(z1);
      }
    }
    return normals;
  }

  private static choleskyDecomposition(matrix: number[][]): number[][] {
    const n = matrix.length;
    const L: number[][] = Array.from({ length: n }, () => Array(n).fill(0));

    for (let i = 0; i < n; i++) {
      for (let j = 0; j <= i; j++) {
        let sum = 0;
        for (let k = 0; k < j; k++) {
          sum += L[i][k] * L[j][k];
        }
        if (i === j) {
          L[i][j] = Math.sqrt(Math.max(0, matrix[i][i] - sum));
        } else {
          L[i][j] = (matrix[i][j] - sum) / L[j][j];
        }
      }
    }
    return L;
  }

  private static multiplyMatrixVector(matrix: number[][], vector: number[]): number[] {
    const result = new Array(matrix.length).fill(0);
    for (let i = 0; i < matrix.length; i++) {
      for (let j = 0; j < vector.length; j++) {
        result[i] += matrix[i][j] * vector[j];
      }
    }
    return result;
  }
}

// ============================================================================
// APP 3: Cash-In-Lieu (CIL) Fractional Share Settlement Engine
// Handles fractional share calculations, rounding rules, and cash-in-lieu (CIL)
// distributions for basket liquidations.
// ============================================================================
export interface CILPosition {
  ticker: string;
  targetQuantity: number; // e.g., 104.567 shares
  marketPrice: number;
}

export interface CILSettlementResult {
  ticker: string;
  allocatedWholeShares: number;
  fractionalShare: number;
  cashInLieuAmount: number;
}

export class CashInLieuSettlementEngine {
  /**
   * Settles fractional shares into whole shares and cash-in-lieu.
   */
  public static settlePositions(positions: CILPosition[]): {
    settlements: CILSettlementResult[];
    totalCashInLieuPaid: number;
    totalWholeSharesValue: number;
  } {
    let totalCashInLieuPaid = 0;
    let totalWholeSharesValue = 0;

    const settlements = positions.map(pos => {
      const allocatedWholeShares = Math.floor(pos.targetQuantity);
      const fractionalShare = pos.targetQuantity - allocatedWholeShares;
      const cashInLieuAmount = fractionalShare * pos.marketPrice;

      totalCashInLieuPaid += cashInLieuAmount;
      totalWholeSharesValue += allocatedWholeShares * pos.marketPrice;

      return {
        ticker: pos.ticker,
        allocatedWholeShares,
        fractionalShare,
        cashInLieuAmount: parseFloat(cashInLieuAmount.toFixed(2)),
      };
    });

    return {
      settlements,
      totalCashInLieuPaid: parseFloat(totalCashInLieuPaid.toFixed(2)),
      totalWholeSharesValue: parseFloat(totalWholeSharesValue.toFixed(2)),
    };
  }
}

// ============================================================================
// APP 4: Basket Weight Rebalancer
// Manages a basket of underlying assets, calculating drift, rebalancing trades,
// and transaction costs.
// ============================================================================
export interface RebalanceOrder {
  ticker: string;
  currentWeight: number;
  targetWeight: number;
  tradeType: 'BUY' | 'SELL' | 'HOLD';
  tradeValue: number;
  tradeQuantity: number;
}

export class BasketWeightRebalancer {
  /**
   * Rebalances a basket back to target weights.
   */
  public static calculateRebalance(
    currentHoldings: { ticker: string; quantity: number; price: number }[],
    targetWeights: { [ticker: string]: number },
    transactionCostBps: number // e.g., 10 bps = 0.0010
  ): {
    orders: RebalanceOrder[];
    totalPortfolioValue: number;
    totalTransactionCost: number;
  } {
    const totalPortfolioValue = currentHoldings.reduce((sum, h) => sum + h.quantity * h.price, 0);
    let totalTransactionCost = 0;

    const orders: RebalanceOrder[] = currentHoldings.map(holding => {
      const currentWeight = (holding.quantity * holding.price) / totalPortfolioValue;
      const targetWeight = targetWeights[holding.ticker] || 0;
      const targetValue = totalPortfolioValue * targetWeight;
      const tradeValue = targetValue - (holding.quantity * holding.price);
      const tradeQuantity = tradeValue / holding.price;

      let tradeType: 'BUY' | 'SELL' | 'HOLD' = 'HOLD';
      if (tradeValue > 0.01) tradeType = 'BUY';
      else if (tradeValue < -0.01) tradeType = 'SELL';

      const cost = Math.abs(tradeValue) * (transactionCostBps / 10000);
      totalTransactionCost += cost;

      return {
        ticker: holding.ticker,
        currentWeight: parseFloat(currentWeight.toFixed(4)),
        targetWeight,
        tradeType,
        tradeValue: parseFloat(tradeValue.toFixed(2)),
        tradeQuantity: parseFloat(tradeQuantity.toFixed(4)),
      };
    });

    return {
      orders,
      totalPortfolioValue: parseFloat(totalPortfolioValue.toFixed(2)),
      totalTransactionCost: parseFloat(totalTransactionCost.toFixed(2)),
    };
  }
}

// ============================================================================
// APP 5: Credit Enhancement Pricing Engine
// Models credit enhancement (CE) overlays, collateral requirements, and cost of
// protection for structured products.
// ============================================================================
export interface CreditEnhancementConfig {
  basketValue: number;
  issuerDefaultProbability: number; // Annualized (e.g., 0.02 for 2%)
  recoveryRate: number;             // e.g., 0.40 for 40%
  creditEnhancementLevel: number;   // e.g., 0.95 (95% principal protection)
  collateralHaircut: number;        // e.g., 0.08 (8% haircut on collateral)
}

export class CreditEnhancementPricingEngine {
  /**
   * Calculates the cost of credit enhancement and required collateral.
   */
  public static priceEnhancement(config: CreditEnhancementConfig): {
    expectedLossWithoutCE: number;
    requiredCollateralValue: number;
    annualProtectionFee: number;
    netCreditEnhancementCost: number;
  } {
    const lossGivenDefault = 1 - config.recoveryRate;
    const expectedLossWithoutCE = config.basketValue * config.issuerDefaultProbability * lossGivenDefault;

    // Collateral required to cover the enhanced level of protection, adjusted for haircut
    const protectedValue = config.basketValue * config.creditEnhancementLevel;
    const requiredCollateralValue = protectedValue / (1 - config.collateralHaircut);

    // Protection fee based on default risk and level of protection
    const annualProtectionFee = protectedValue * config.issuerDefaultProbability * (1 - config.recoveryRate);

    // Net cost including opportunity cost of collateral (assuming 1.5% funding spread on collateral)
    const fundingSpread = 0.015;
    const collateralOpportunityCost = requiredCollateralValue * fundingSpread;
    const netCreditEnhancementCost = annualProtectionFee + collateralOpportunityCost;

    return {
      expectedLossWithoutCE: parseFloat(expectedLossWithoutCE.toFixed(2)),
      requiredCollateralValue: parseFloat(requiredCollateralValue.toFixed(2)),
      annualProtectionFee: parseFloat(annualProtectionFee.toFixed(2)),
      netCreditEnhancementCost: parseFloat(netCreditEnhancementCost.toFixed(2)),
    };
  }
}

// ============================================================================
// APP 6: Autocallable Yield Note Valuator
// Values autocallable structured notes, tracking observation dates, coupon triggers,
// and early redemption conditions.
// ============================================================================
export interface ObservationDate {
  period: number;
  autocallBarrier: number; // e.g., 1.00 (100% of initial)
  couponBarrier: number;   // e.g., 0.80 (80% of initial)
  couponRate: number;      // e.g., 0.02 (2% per period)
}

export class AutocallableYieldNoteValuator {
  /**
   * Evaluates the payoff scenarios of an autocallable note based on asset performance.
   */
  public static evaluateNote(
    initialBasketValue: number,
    currentBasketValue: number,
    historicalPerformances: number[], // Performance at each past observation date
    schedule: ObservationDate[],
    principal: number
  ): {
    isAutocalled: boolean;
    autocallPeriod: number | null;
    totalCouponsPaid: number;
    redemptionAmount: number;
    totalReturn: number;
  } {
    let isAutocalled = false;
    let autocallPeriod: number | null = null;
    let totalCouponsPaid = 0;
    let redemptionAmount = 0;

    for (let i = 0; i < schedule.length; i++) {
      const obs = schedule[i];
      const performance = historicalPerformances[i] !== undefined 
        ? historicalPerformances[i] 
        : (i === schedule.length - 1 ? currentBasketValue / initialBasketValue : null);

      if (performance === null) {
        break; // Future observation date
      }

      // Check Coupon Trigger
      if (performance >= obs.couponBarrier) {
        totalCouponsPaid += principal * obs.couponRate;
      }

      // Check Autocall Trigger
      if (performance >= obs.autocallBarrier) {
        isAutocalled = true;
        autocallPeriod = obs.period;
        redemptionAmount = principal;
        break;
      }
    }

    // If not autocalled by maturity, evaluate final redemption
    if (!isAutocalled) {
      const finalPerformance = currentBasketValue / initialBasketValue;
      const finalObs = schedule[schedule.length - 1];
      
      if (finalPerformance >= finalObs.couponBarrier) {
        redemptionAmount = principal;
      } else {
        // Downside exposure (1:1 loss below barrier)
        redemptionAmount = principal * finalPerformance;
      }
    }

    const totalReturn = (redemptionAmount + totalCouponsPaid - principal) / principal;

    return {
      isAutocalled,
      autocallPeriod,
      totalCouponsPaid: parseFloat(totalCouponsPaid.toFixed(2)),
      redemptionAmount: parseFloat(redemptionAmount.toFixed(2)),
      totalReturn: parseFloat(totalReturn.toFixed(4)),
    };
  }
}

// ============================================================================
// APP 7: Down-and-In Put Option Pricer
// Analytical pricing for down-and-in put options embedded in structured products.
// ============================================================================
export class DownAndInPutOptionPricer {
  /**
   * Prices a Down-and-In Put Option using the standard Black-Scholes analytical formula.
   */
  public static priceDownAndInPut(
    S: number, // Spot price
    K: number, // Strike price
    H: number, // Barrier level (H < S)
    r: number, // Risk-free rate
    sigma: number, // Volatility
    T: number // Time to maturity (years)
  ): number {
    if (H >= S) {
      // If barrier is already breached, it behaves like a standard European Put
      return this.blackScholesPut(S, K, r, sigma, T);
    }

    const lambda = (r + Math.pow(sigma, 2) / 2) / Math.pow(sigma, 2);
    const y = Math.log(Math.pow(H, 2) / (S * K)) / (sigma * Math.sqrt(T)) + lambda * sigma * Math.sqrt(T);
    
    const x1 = Math.log(S / H) / (sigma * Math.sqrt(T)) + lambda * sigma * Math.sqrt(T);
    const y1 = Math.log(H / S) / (sigma * Math.sqrt(T)) + lambda * sigma * Math.sqrt(T);

    const N = this.cumulativeNormal;

    // Down-and-in put analytical components
    const part1 = -S * N(-x1) * Math.exp(-r * T) + K * Math.exp(-r * T) * N(-x1 + sigma * Math.sqrt(T));
    const part2 = S * Math.pow(H / S, 2 * lambda) * (N(y) - N(y1));
    const part3 = K * Math.exp(-r * T) * Math.pow(H / S, 2 * lambda - 2) * (N(y - sigma * Math.sqrt(T)) - N(y1 - sigma * Math.sqrt(T)));

    const price = part1 + part2 - part3;
    return Math.max(0, price);
  }

  private static blackScholesPut(S: number, K: number, r: number, sigma: number, T: number): number {
    const d1 = (Math.log(S / K) + (r + Math.pow(sigma, 2) / 2) * T) / (sigma * Math.sqrt(T));
    const d2 = d1 - sigma * Math.sqrt(T);
    return K * Math.exp(-r * T) * this.cumulativeNormal(-d2) - S * this.cumulativeNormal(-d1);
  }

  private static cumulativeNormal(x: number): number {
    const b1 = 0.319381530;
    const b2 = -0.356563782;
    const b3 = 1.781477937;
    const b4 = -1.821255978;
    const b5 = 1.330274429;
    const p = 0.2316419;
    const c = 0.39894228;

    if (x >= 0.0) {
      const t = 1.0 / (1.0 + p * x);
      return (1.0 - c * Math.exp(-x * x / 2.0) * t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    } else {
      const t = 1.0 / (1.0 - p * x);
      return (c * Math.exp(-x * x / 2.0) * t *
        (t * (t * (t * (t * b5 + b4) + b3) + b2) + b1));
    }
  }
}

// ============================================================================
// APP 8: Basket Liquidation Slippage Modeler
// Simulates market impact and slippage when liquidating large PBG baskets.
// ============================================================================
export interface LiquidationAsset {
  ticker: string;
  quantity: number;
  price: number;
  averageDailyVolume: number;
  dailyVolatility: number;
}

export class BasketLiquidationSlippageModeler {
  /**
   * Estimates slippage and liquidation time using a square-root market impact model.
   */
  public static modelLiquidation(
    assets: LiquidationAsset[],
    participationRate: number, // e.g., 0.10 (10% of daily volume)
    impactCoefficient: number = 0.5 // Constant scaling factor for market impact
  ): {
    totalSlippageCost: number;
    liquidationDays: number;
    assetImpacts: { ticker: string; slippageBps: number; daysToLiquidate: number }[];
  } {
    let totalSlippageCost = 0;
    let maxDays = 0;

    const assetImpacts = assets.map(asset => {
      const daysToLiquidate = asset.quantity / (asset.averageDailyVolume * participationRate);
      maxDays = Math.max(maxDays, daysToLiquidate);

      // Square-root law of market impact: Impact = Y * Vol * Sqrt(Size / ADV)
      const sizeRatio = asset.quantity / asset.averageDailyVolume;
      const slippageBps = impactCoefficient * asset.dailyVolatility * Math.sqrt(sizeRatio) * 10000;
      const slippageCost = asset.quantity * asset.price * (slippageBps / 10000);

      totalSlippageCost += slippageCost;

      return {
        ticker: asset.ticker,
        slippageBps: parseFloat(slippageBps.toFixed(2)),
        daysToLiquidate: parseFloat(daysToLiquidate.toFixed(2)),
      };
    });

    return {
      totalSlippageCost: parseFloat(totalSlippageCost.toFixed(2)),
      liquidationDays: parseFloat(maxDays.toFixed(2)),
      assetImpacts,
    };
  }
}

// ============================================================================
// APP 9: Reverse Convertible Yield Calculator
// Calculates Yield-to-Maturity (YTM), coupon schedules, and downside risk profiles
// for reverse convertible structures.
// ============================================================================
export class ReverseConvertibleYieldCalculator {
  /**
   * Analyzes the yield and risk profile of a Reverse Convertible Note.
   */
  public static calculateYieldProfile(
    principal: number,
    couponRateAnnual: number,
    maturityYears: number,
    spotPrice: number,
    strikePrice: number,
    barrierPrice: number
  ): {
    totalCouponsPaid: number;
    yieldToMaturity: number;
    downsideThresholdPrice: number;
    breakevenPrice: number;
    lossScenarioAtBarrierBreach: number; // Loss if stock drops to barrier level at maturity
  } {
    const totalCouponsPaid = principal * couponRateAnnual * maturityYears;
    const yieldToMaturity = (totalCouponsPaid / principal) / maturityYears;
    const breakevenPrice = strikePrice - (totalCouponsPaid / (principal / strikePrice));

    // If barrier is breached, investor receives shares (or cash equivalent) valued at spot
    const sharesDelivered = principal / strikePrice;
    const valueAtBarrier = sharesDelivered * barrierPrice;
    const lossScenarioAtBarrierBreach = principal - (valueAtBarrier + totalCouponsPaid);

    return {
      totalCouponsPaid: parseFloat(totalCouponsPaid.toFixed(2)),
      yieldToMaturity: parseFloat(yieldToMaturity.toFixed(4)),
      downsideThresholdPrice: barrierPrice,
      breakevenPrice: parseFloat(breakevenPrice.toFixed(2)),
      lossScenarioAtBarrierBreach: parseFloat(Math.max(0, lossScenarioAtBarrierBreach).toFixed(2)),
    };
  }
}

// ============================================================================
// APP 10: PBG Collateral Margin Engine
// Calculates initial margin, maintenance margin, and margin calls for structured
// basket positions under PBG rules.
// ============================================================================
export interface MarginPosition {
  ticker: string;
  marketValue: number;
  volatility: number;
  isLong: boolean;
}

export class PBGCollateralMarginEngine {
  /**
   * Calculates margin requirements based on risk-based portfolio margin rules.
   */
  public static calculateMarginRequirements(
    positions: MarginPosition[],
    houseMarginMultiplier: number = 1.5 // Multiplier for high-volatility assets
  ): {
    totalPortfolioValue: number;
    initialMarginRequired: number;
    maintenanceMarginRequired: number;
    marginCallThreshold: number;
    isMarginCallTriggered: boolean;
    availableLiquidity: number;
  } {
    let totalPortfolioValue = 0;
    let initialMarginRequired = 0;
    let maintenanceMarginRequired = 0;

    positions.forEach(pos => {
      const absValue = Math.abs(pos.marketValue);
      totalPortfolioValue += pos.isLong ? pos.marketValue : -pos.marketValue;

      // Base margin requirements scale with volatility
      let baseIM = 0.15; // 15% base initial margin
      let baseMM = 0.10; // 10% base maintenance margin

      if (pos.volatility > 0.30) {
        baseIM += (pos.volatility - 0.30) * houseMarginMultiplier;
        baseMM += (pos.volatility - 0.30) * houseMarginMultiplier;
      }

      initialMarginRequired += absValue * Math.min(0.50, baseIM);
      maintenanceMarginRequired += absValue * Math.min(0.40, baseMM);
    });

    const availableLiquidity = totalPortfolioValue - maintenanceMarginRequired;
    const isMarginCallTriggered = totalPortfolioValue < maintenanceMarginRequired;
    const marginCallThreshold = maintenanceMarginRequired;

    return {
      totalPortfolioValue: parseFloat(totalPortfolioValue.toFixed(2)),
      initialMarginRequired: parseFloat(initialMarginRequired.toFixed(2)),
      maintenanceMarginRequired: parseFloat(maintenanceMarginRequired.toFixed(2)),
      marginCallThreshold: parseFloat(marginCallThreshold.toFixed(2)),
      isMarginCallTriggered,
      availableLiquidity: parseFloat(availableLiquidity.toFixed(2)),
    };
  }
}

// ============================================================================
// API ROUTES ORCHESTRATION
// Exposes all structured product features via Express API endpoints.
// ============================================================================
export const structuredProductsRouter = Router();

const sendError = (res: Response, message: string, status = 400) => {
  res.status(status).json({ success: false, error: message });
};

// 1. ELKS Barrier Calculator Endpoint
structuredProductsRouter.post('/elks-barrier', (req: Request, res: Response) => {
  try {
    const { spotPrice, strikePrice, barrierPercent, volatility, yearsToMaturity, riskFreeRate } = req.body;
    if (
      typeof spotPrice !== 'number' ||
      typeof strikePrice !== 'number' ||
      typeof barrierPercent !== 'number' ||
      typeof volatility !== 'number' ||
      typeof yearsToMaturity !== 'number' ||
      typeof riskFreeRate !== 'number'
    ) {
      return sendError(res, 'Missing or invalid parameters. All parameters must be numbers.');
    }
    const result = ELKSBarrierCalculator.calculateBarrierStatus(
      spotPrice,
      strikePrice,
      barrierPercent,
      volatility,
      yearsToMaturity,
      riskFreeRate
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 2. Knock-In Trigger Simulator Endpoint
structuredProductsRouter.post('/knock-in-simulate', (req: Request, res: Response) => {
  try {
    const { basket, correlationMatrix, riskFreeRate, daysToMaturity, knockInBarrierPercent, simulationsCount } = req.body;
    if (!Array.isArray(basket) || !Array.isArray(correlationMatrix)) {
      return sendError(res, 'basket and correlationMatrix must be arrays.');
    }
    if (
      typeof riskFreeRate !== 'number' ||
      typeof daysToMaturity !== 'number' ||
      typeof knockInBarrierPercent !== 'number'
    ) {
      return sendError(res, 'riskFreeRate, daysToMaturity, and knockInBarrierPercent must be numbers.');
    }
    const sims = typeof simulationsCount === 'number' ? simulationsCount : 5000;
    const result = KnockInTriggerSimulator.simulateKnockIn(
      basket,
      correlationMatrix,
      riskFreeRate,
      daysToMaturity,
      knockInBarrierPercent,
      sims
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 3. Cash-In-Lieu Fractional Share Settlement Endpoint
structuredProductsRouter.post('/cash-in-lieu-settle', (req: Request, res: Response) => {
  try {
    const { positions } = req.body;
    if (!Array.isArray(positions)) {
      return sendError(res, 'positions must be an array.');
    }
    const result = CashInLieuSettlementEngine.settlePositions(positions);
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 4. Basket Weight Rebalancer Endpoint
structuredProductsRouter.post('/basket-rebalance', (req: Request, res: Response) => {
  try {
    const { currentHoldings, targetWeights, transactionCostBps } = req.body;
    if (!Array.isArray(currentHoldings) || typeof targetWeights !== 'object' || targetWeights === null) {
      return sendError(res, 'currentHoldings must be an array and targetWeights must be an object.');
    }
    if (typeof transactionCostBps !== 'number') {
      return sendError(res, 'transactionCostBps must be a number.');
    }
    const result = BasketWeightRebalancer.calculateRebalance(
      currentHoldings,
      targetWeights,
      transactionCostBps
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 5. Credit Enhancement Pricing Endpoint
structuredProductsRouter.post('/credit-enhancement-price', (req: Request, res: Response) => {
  try {
    const { config } = req.body;
    if (!config || typeof config !== 'object') {
      return sendError(res, 'config object is required.');
    }
    const { basketValue, issuerDefaultProbability, recoveryRate, creditEnhancementLevel, collateralHaircut } = config;
    if (
      typeof basketValue !== 'number' ||
      typeof issuerDefaultProbability !== 'number' ||
      typeof recoveryRate !== 'number' ||
      typeof creditEnhancementLevel !== 'number' ||
      typeof collateralHaircut !== 'number'
    ) {
      return sendError(res, 'All config fields must be numbers.');
    }
    const result = CreditEnhancementPricingEngine.priceEnhancement(config);
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 6. Autocallable Yield Note Valuator Endpoint
structuredProductsRouter.post('/autocallable-evaluate', (req: Request, res: Response) => {
  try {
    const { initialBasketValue, currentBasketValue, historicalPerformances, schedule, principal } = req.body;
    if (
      typeof initialBasketValue !== 'number' ||
      typeof currentBasketValue !== 'number' ||
      typeof principal !== 'number'
    ) {
      return sendError(res, 'initialBasketValue, currentBasketValue, and principal must be numbers.');
    }
    if (!Array.isArray(historicalPerformances) || !Array.isArray(schedule)) {
      return sendError(res, 'historicalPerformances and schedule must be arrays.');
    }
    const result = AutocallableYieldNoteValuator.evaluateNote(
      initialBasketValue,
      currentBasketValue,
      historicalPerformances,
      schedule,
      principal
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 7. Down-and-In Put Option Pricer Endpoint
structuredProductsRouter.post('/down-and-in-put-price', (req: Request, res: Response) => {
  try {
    const { S, K, H, r, sigma, T } = req.body;
    if (
      typeof S !== 'number' ||
      typeof K !== 'number' ||
      typeof H !== 'number' ||
      typeof r !== 'number' ||
      typeof sigma !== 'number' ||
      typeof T !== 'number'
    ) {
      return sendError(res, 'All parameters (S, K, H, r, sigma, T) must be numbers.');
    }
    const price = DownAndInPutOptionPricer.priceDownAndInPut(S, K, H, r, sigma, T);
    res.json({ success: true, data: { price: parseFloat(price.toFixed(4)) } });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 8. Basket Liquidation Slippage Modeler Endpoint
structuredProductsRouter.post('/basket-liquidation-slippage', (req: Request, res: Response) => {
  try {
    const { assets, participationRate, impactCoefficient } = req.body;
    if (!Array.isArray(assets)) {
      return sendError(res, 'assets must be an array.');
    }
    if (typeof participationRate !== 'number') {
      return sendError(res, 'participationRate must be a number.');
    }
    const coeff = typeof impactCoefficient === 'number' ? impactCoefficient : 0.5;
    const result = BasketLiquidationSlippageModeler.modelLiquidation(assets, participationRate, coeff);
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 9. Reverse Convertible Yield Calculator Endpoint
structuredProductsRouter.post('/reverse-convertible-yield', (req: Request, res: Response) => {
  try {
    const { principal, couponRateAnnual, maturityYears, spotPrice, strikePrice, barrierPrice } = req.body;
    if (
      typeof principal !== 'number' ||
      typeof couponRateAnnual !== 'number' ||
      typeof maturityYears !== 'number' ||
      typeof spotPrice !== 'number' ||
      typeof strikePrice !== 'number' ||
      typeof barrierPrice !== 'number'
    ) {
      return sendError(res, 'All parameters must be numbers.');
    }
    const result = ReverseConvertibleYieldCalculator.calculateYieldProfile(
      principal,
      couponRateAnnual,
      maturityYears,
      spotPrice,
      strikePrice,
      barrierPrice
    );
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

// 10. PBG Collateral Margin Engine Endpoint
structuredProductsRouter.post('/pbg-collateral-margin', (req: Request, res: Response) => {
  try {
    const { positions, houseMarginMultiplier } = req.body;
    if (!Array.isArray(positions)) {
      return sendError(res, 'positions must be an array.');
    }
    const multiplier = typeof houseMarginMultiplier === 'number' ? houseMarginMultiplier : 1.5;
    const result = PBGCollateralMarginEngine.calculateMarginRequirements(positions, multiplier);
    res.json({ success: true, data: result });
  } catch (error: any) {
    sendError(res, error.message || 'Internal server error', 500);
  }
});

export default structuredProductsRouter;