

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section5_goldman_sachs_downgrade.ts ---

import { Router, Request, Response } from 'express';

export interface RatingSentiment {
  score: number; // -1.0 (extremely bearish) to 1.0 (extremely bullish)
  classification: 'Bullish' | 'Neutral' | 'Bearish' | 'Severe Bearish';
  keyRiskFactors: string[];
}

export interface PriceTargetInput {
  currentPrice: number;
  estimatedWriteDownsBillions: number;
  sharesOutstandingBillions: number;
  targetPEMultiple: number;
  projectedEPS: number;
}

export interface PriceTargetOutput {
  newTargetPrice: number;
  percentageChange: number;
  impliedMarketCapBillions: number;
}

export interface BlockTradeInput {
  sharesToSell: number;
  currentPrice: number;
  averageDailyVolume: number;
  dailyVolatility: number; // e.g., 0.02 for 2%
}

export interface BlockTradeOutput {
  averageExecutionPrice: number;
  totalRevenue: number;
  marketImpactCost: number;
  slippageBps: number;
}

export interface WriteDownInput {
  cdoExposureBillions: number;
  subprimeMortgageExposureBillions: number;
  cdoLossRate: number; // e.g., 0.40 for 40%
  subprimeLossRate: number; // e.g., 0.20 for 20%
  currentTier1CapitalBillions: number;
  riskWeightedAssetsBillions: number;
}

export interface WriteDownOutput {
  totalWriteDownBillions: number;
  newTier1CapitalBillions: number;
  originalTier1Ratio: number;
  newTier1Ratio: number;
  capitalShortfallBillions: number; // assuming 8% target
}

export interface DividendPredictorInput {
  currentDividendPerShare: number;
  projectedNetIncomeBillions: number;
  capitalShortfallBillions: number;
  sharesOutstandingBillions: number;
  targetPayoutRatio: number; // e.g., 0.30
}

export interface DividendPredictorOutput {
  cutProbability: number; // 0 to 100
  projectedDividendPerShare: number;
  annualSavingsBillions: number;
  recommendation: string;
}

export interface EPSAdjustmentInput {
  originalEPS: number;
  investmentBankingRevenueDeclinePct: number;
  writeDownImpactPerShare: number;
  dilutionFactor: number; // e.g., 1.15 for 15% share dilution from capital raise
}

export interface EPSAdjustmentOutput {
  adjustedEPS: number;
  percentageReduction: number;
}

export interface PanicIndexInput {
  cdsSpreadBps: number; // Credit Default Swap spread in basis points
  vixIndex: number;
  financialSectorDeclinePct: number;
  volumeSpikeRatio: number; // e.g., 2.5 for 2.5x normal volume
}

export interface PanicIndexOutput {
  panicScore: number; // 0 to 100
  riskCategory: 'Low' | 'Moderate' | 'High' | 'Systemic';
  actionRequired: string;
}

export interface InstitutionalHolder {
  name: string;
  sharesHeldMillions: number;
  mandateRequiresInvestmentGrade: boolean;
  dividendYieldThreshold: number; // minimum yield required, e.g., 0.02
}

export interface SellOffTrackerOutput {
  holderName: string;
  estimatedSharesToDumpMillions: number;
  triggerReason: string;
}

export interface MultipleCompressionInput {
  historicalPE: number;
  historicalPB: number;
  projectedROE: number; // Return on Equity, e.g., 0.05 for 5%
  creditRatingDowngradeSteps: number; // e.g., 2 notches
  bookValuePerShare: number;
  projectedEPS: number;
}

export interface MultipleCompressionOutput {
  compressedPE: number;
  compressedPB: number;
  impliedPriceByPE: number;
  impliedPriceByPB: number;
  blendedTargetPrice: number;
}

export interface ReboundTimerInput {
  downgradeSeverity: 'Minor' | 'Moderate' | 'Severe' | 'Systemic';
  macroEnvironment: 'Stable' | 'Stressed' | 'Recession';
  capitalAdequacyRestored: boolean;
}

export interface ReboundTimerOutput {
  estimatedMonthsToStabilization: number;
  estimatedMonthsToFullRecovery: number;
  confidenceIntervalPct: number;
}

// ==========================================
// 1. ANALYST RATING SENTIMENT PARSER APP
// ==========================================
export class AnalystRatingSentimentParser {
  private static negativeKeywords = [
    'write-down', 'shortfall', 'dilution', 'dividend cut', 'downgrade',
    'subprime', 'exposure', 'losses', 'liquidity concern', 'underperform'
  ];

  private static positiveKeywords = [
    'undervalued', 'capital cushion', 'resilient', 'recovery', 'upgrade',
    'strong liquidity', 'overweight', 'buy'
  ];

  public static parseReport(reportText: string, baseRating: 'Buy' | 'Hold' | 'Sell'): RatingSentiment {
    const textLower = reportText.toLowerCase();
    let score = 0;

    if (baseRating === 'Buy') score += 0.3;
    if (baseRating === 'Sell') score -= 0.5;

    const foundRisks: string[] = [];

    this.negativeKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score -= 0.15;
        foundRisks.push(keyword);
      }
    });

    this.positiveKeywords.forEach(keyword => {
      if (textLower.includes(keyword)) {
        score += 0.1;
      }
    });

    // Clamp score between -1.0 and 1.0
    score = Math.max(-1.0, Math.min(1.0, score));

    let classification: RatingSentiment['classification'] = 'Neutral';
    if (score > 0.2) classification = 'Bullish';
    else if (score < -0.5) classification = 'Severe Bearish';
    else if (score < 0) classification = 'Bearish';

    return {
      score: parseFloat(score.toFixed(2)),
      classification,
      keyRiskFactors: foundRisks
    };
  }
}

// ==========================================
// 2. STOCK PRICE TARGET CALCULATOR APP
// ==========================================
export class StockPriceTargetCalculator {
  public static calculate(input: PriceTargetInput): PriceTargetOutput {
    const writeDownPerShare = input.estimatedWriteDownsBillions / input.sharesOutstandingBillions;
    const adjustedEPS = Math.max(0.1, input.projectedEPS - (writeDownPerShare * 0.15)); // assuming 15% direct EPS impact from write-down drag
    
    const rawTarget = adjustedEPS * input.targetPEMultiple;
    const finalTarget = Math.max(1.0, rawTarget - (writeDownPerShare * 0.5)); // direct balance sheet impact on target price

    const percentageChange = ((finalTarget - input.currentPrice) / input.currentPrice) * 100;
    const impliedMarketCap = finalTarget * input.sharesOutstandingBillions;

    return {
      newTargetPrice: parseFloat(finalTarget.toFixed(2)),
      percentageChange: parseFloat(percentageChange.toFixed(2)),
      impliedMarketCapBillions: parseFloat(impliedMarketCap.toFixed(2))
    };
  }
}

// ==========================================
// 3. BLOCK TRADE SIMULATOR APP
// ==========================================
export class BlockTradeSimulator {
  public static simulate(input: BlockTradeInput): BlockTradeOutput {
    // Market impact model: Impact = Volatility * sqrt(Trade Size / Daily Volume) * Y
    // Where Y is a constant factor, typically around 0.5
    const participationRate = input.sharesToSell / input.averageDailyVolume;
    const impactPct = input.dailyVolatility * Math.sqrt(participationRate) * 0.5;
    
    const marketImpactCost = input.currentPrice * impactPct;
    const averageExecutionPrice = input.currentPrice - marketImpactCost;
    const totalRevenue = averageExecutionPrice * input.sharesToSell;
    const slippageBps = (marketImpactCost / input.currentPrice) * 10000;

    return {
      averageExecutionPrice: parseFloat(averageExecutionPrice.toFixed(4)),
      totalRevenue: parseFloat(totalRevenue.toFixed(2)),
      marketImpactCost: parseFloat(marketImpactCost.toFixed(4)),
      slippageBps: parseFloat(slippageBps.toFixed(2))
    };
  }
}

// ==========================================
// 4. CAPITAL WRITE-DOWN ESTIMATOR APP
// ==========================================
export class CapitalWriteDownEstimator {
  public static estimate(input: WriteDownInput): WriteDownOutput {
    const cdoLoss = input.cdoExposureBillions * input.cdoLossRate;
    const subprimeLoss = input.subprimeMortgageExposureBillions * input.subprimeLossRate;
    const totalWriteDown = cdoLoss + subprimeLoss;

    const originalTier1Ratio = input.currentTier1CapitalBillions / input.riskWeightedAssetsBillions;
    const newTier1Capital = Math.max(0, input.currentTier1CapitalBillions - totalWriteDown);
    const newTier1Ratio = newTier1Capital / input.riskWeightedAssetsBillions;

    const targetRatio = 0.08; // 8% regulatory target
    const requiredCapitalForTarget = input.riskWeightedAssetsBillions * targetRatio;
    const capitalShortfall = Math.max(0, requiredCapitalForTarget - newTier1Capital);

    return {
      totalWriteDownBillions: parseFloat(totalWriteDown.toFixed(2)),
      newTier1CapitalBillions: parseFloat(newTier1Capital.toFixed(2)),
      originalTier1Ratio: parseFloat(originalTier1Ratio.toFixed(4)),
      newTier1Ratio: parseFloat(newTier1Ratio.toFixed(4)),
      capitalShortfallBillions: parseFloat(capitalShortfall.toFixed(2))
    };
  }
}

// ==========================================
// 5. DIVIDEND CUT PREDICTOR APP
// ==========================================
export class DividendCutPredictor {
  public static predict(input: DividendPredictorInput): DividendPredictorOutput {
    let cutProbability = 0;

    if (input.capitalShortfallBillions > 10) {
      cutProbability += 60;
    } else if (input.capitalShortfallBillions > 2) {
      cutProbability += 30;
    }

    const currentPayoutRatio = (input.currentDividendPerShare * input.sharesOutstandingBillions) / Math.max(1, input.projectedNetIncomeBillions);
    if (currentPayoutRatio > 0.8) {
      cutProbability += 30;
    } else if (currentPayoutRatio > 0.5) {
      cutProbability += 15;
    }

    cutProbability = Math.min(99, Math.max(5, cutProbability));

    let projectedDividendPerShare = input.currentDividendPerShare;
    if (cutProbability > 75) {
      projectedDividendPerShare = input.currentDividendPerShare * 0.10; // 90% cut
    } else if (cutProbability > 40) {
      projectedDividendPerShare = input.currentDividendPerShare * 0.50; // 50% cut
    }

    const annualSavings = (input.currentDividendPerShare - projectedDividendPerShare) * input.sharesOutstandingBillions;

    let recommendation = 'Maintain Dividend';
    if (cutProbability > 70) {
      recommendation = 'Immediate Dividend Suspension/Drastic Cut Recommended';
    } else if (cutProbability > 35) {
      recommendation = 'Moderate Dividend Reduction Advised';
    }

    return {
      cutProbability,
      projectedDividendPerShare: parseFloat(projectedDividendPerShare.toFixed(4)),
      annualSavingsBillions: parseFloat(annualSavings.toFixed(2)),
      recommendation
    };
  }
}

// ==========================================
// 6. EARNINGS PER SHARE ADJUSTER APP
// ==========================================
export class EarningsPerShareAdjuster {
  public static adjust(input: EPSAdjustmentInput): EPSAdjustmentOutput {
    // Reduce EPS by investment banking decline (assuming IB is 30% of baseline earnings)
    const ibImpact = input.originalEPS * 0.30 * (input.investmentBankingRevenueDeclinePct / 100);
    const epsPostWriteDown = input.originalEPS - ibImpact - input.writeDownImpactPerShare;
    
    // Apply dilution factor (e.g., if shares outstanding increase by 15%, EPS is divided by 1.15)
    const adjustedEPS = epsPostWriteDown / input.dilutionFactor;
    const percentageReduction = ((input.originalEPS - adjustedEPS) / input.originalEPS) * 100;

    return {
      adjustedEPS: parseFloat(adjustedEPS.toFixed(2)),
      percentageReduction: parseFloat(percentageReduction.toFixed(2))
    };
  }
}

// ==========================================
// 7. MARKET PANIC INDEX APP
// ==========================================
export class MarketPanicIndex {
  public static calculate(input: PanicIndexInput): PanicIndexOutput {
    // Normalize components to 0-100 scale
    const cdsScore = Math.min(100, (input.cdsSpreadBps / 500) * 100); // 500 bps is extreme stress
    const vixScore = Math.min(100, (input.vixIndex / 80) * 100); // VIX of 80 is historic panic
    const declineScore = Math.min(100, (Math.abs(input.financialSectorDeclinePct) / 15) * 100); // 15% single-day drop is extreme
    const volumeScore = Math.min(100, (input.volumeSpikeRatio / 4.0) * 100);

    const panicScore = (cdsScore * 0.35) + (vixScore * 0.25) + (declineScore * 0.25) + (volumeScore * 0.15);
    
    let riskCategory: PanicIndexOutput['riskCategory'] = 'Low';
    let actionRequired = 'Monitor market conditions.';

    if (panicScore > 75) {
      riskCategory = 'Systemic';
      actionRequired = 'Hedge all long financial exposures. Prepare for liquidity freeze.';
    } else if (panicScore > 50) {
      riskCategory = 'High';
      actionRequired = 'Reduce leverage. Tighten stop-losses on financial sector holdings.';
    } else if (panicScore > 25) {
      riskCategory = 'Moderate';
      actionRequired = 'Selective hedging. Rebalance portfolio away from high-beta financials.';
    }

    return {
      panicScore: parseFloat(panicScore.toFixed(2)),
      riskCategory,
      actionRequired
    };
  }
}

// ==========================================
// 8. INSTITUTIONAL SELL-OFF TRACKER APP
// ==========================================
export class InstitutionalSellOffTracker {
  public static trackPotentialSellOff(
    holders: InstitutionalHolder[],
    willBeDowngradedBelowInvestmentGrade: boolean,
    projectedYield: number
  ): SellOffTrackerOutput[] {
    const results: SellOffTrackerOutput[] = [];

    holders.forEach(holder => {
      let mustSell = false;
      let reason = '';

      if (holder.mandateRequiresInvestmentGrade && willBeDowngradedBelowInvestmentGrade) {
        mustSell = true;
        reason = 'Mandate violation: Credit rating dropped below investment grade.';
      } else if (projectedYield < holder.dividendYieldThreshold) {
        mustSell = true;
        reason = `Mandate violation: Yield (${(projectedYield * 100).toFixed(2)}%) fell below minimum threshold (${(holder.dividendYieldThreshold * 100).toFixed(2)}%).`;
      }

      if (mustSell) {
        results.push({
          holderName: holder.name,
          estimatedSharesToDumpMillions: holder.sharesHeldMillions,
          triggerReason: reason
        });
      }
    });

    return results;
  }
}

// ==========================================
// 9. VALUATION MULTIPLE COMPRESSOR APP
// ==========================================
export class ValuationMultipleCompressor {
  public static compress(input: MultipleCompressionInput): MultipleCompressionOutput {
    // Each notch of credit rating downgrade compresses PE by 8% and PB by 10%
    const peCompressionFactor = 1 - (input.creditRatingDowngradeSteps * 0.08);
    const pbCompressionFactor = 1 - (input.creditRatingDowngradeSteps * 0.10);

    // ROE degradation further compresses multiples
    const roeFactor = Math.min(1.0, input.projectedROE / 0.15); // 15% ROE is baseline healthy
    
    const compressedPE = Math.max(3.0, input.historicalPE * peCompressionFactor * roeFactor);
    const compressedPB = Math.max(0.3, input.historicalPB * pbCompressionFactor * roeFactor);

    const impliedPriceByPE = input.projectedEPS * compressedPE;
    const impliedPriceByPB = input.bookValuePerShare * compressedPB;
    const blendedTargetPrice = (impliedPriceByPE * 0.4) + (impliedPriceByPB * 0.6); // 60% weight on book value for banks

    return {
      compressedPE: parseFloat(compressedPE.toFixed(2)),
      compressedPB: parseFloat(compressedPB.toFixed(2)),
      impliedPriceByPE: parseFloat(impliedPriceByPE.toFixed(2)),
      impliedPriceByPB: parseFloat(impliedPriceByPB.toFixed(2)),
      blendedTargetPrice: parseFloat(blendedTargetPrice.toFixed(2))
    };
  }
}

// ==========================================
// 10. DOWNGRADE REBOUND TIMER APP
// ==========================================
export class DowngradeReboundTimer {
  public static estimateRecovery(input: ReboundTimerInput): ReboundTimerOutput {
    let baseStabilizationMonths = 3;
    let baseRecoveryMonths = 12;
    let confidenceInterval = 90;

    switch (input.downgradeSeverity) {
      case 'Minor':
        baseStabilizationMonths = 1;
        baseRecoveryMonths = 4;
        break;
      case 'Moderate':
        baseStabilizationMonths = 3;
        baseRecoveryMonths = 9;
        break;
      case 'Severe':
        baseStabilizationMonths = 8;
        baseRecoveryMonths = 24;
        break;
      case 'Systemic':
        baseStabilizationMonths = 18;
        baseRecoveryMonths = 60;
        break;
    }

    if (input.macroEnvironment === 'Stressed') {
      baseStabilizationMonths *= 1.5;
      baseRecoveryMonths *= 1.8;
      confidenceInterval -= 15;
    } else if (input.macroEnvironment === 'Recession') {
      baseStabilizationMonths *= 2.5;
      baseRecoveryMonths *= 3.0;
      confidenceInterval -= 30;
    }

    if (!input.capitalAdequacyRestored) {
      baseStabilizationMonths *= 1.8;
      baseRecoveryMonths *= 2.0;
      confidenceInterval -= 10;
    }

    return {
      estimatedMonthsToStabilization: parseFloat(baseStabilizationMonths.toFixed(1)),
      estimatedMonthsToFullRecovery: parseFloat(baseRecoveryMonths.toFixed(1)),
      confidenceIntervalPct: Math.max(30, confidenceInterval)
    };
  }
}

// ==========================================
// ORCHESTRATOR / DEMO RUNNER
// ==========================================
export function runAllGoldmanSachsDowngradeApps() {
  console.log('--- Running Goldman Sachs Downgrade App Suite ---');

  // 1. Sentiment Parser Demo
  const report = "William Tanona downgrades Citigroup to Sell. Massive subprime write-downs expected, leading to capital shortfall and potential dividend cut.";
  const sentiment = AnalystRatingSentimentParser.parseReport(report, 'Sell');
  console.log('1. Sentiment Analysis:', sentiment);

  // 2. Price Target Calculator Demo
  const target = StockPriceTargetCalculator.calculate({
    currentPrice: 34.50,
    estimatedWriteDownsBillions: 15.0,
    sharesOutstandingBillions: 5.2,
    targetPEMultiple: 10,
    projectedEPS: 4.20
  });
  console.log('2. Price Target Adjustment:', target);

  // 3. Block Trade Simulator Demo
  const blockTrade = BlockTradeSimulator.simulate({
    sharesToSell: 12000000,
    currentPrice: 31.20,
    averageDailyVolume: 45000000,
    dailyVolatility: 0.035
  });
  console.log('3. Block Trade Simulation:', blockTrade);

  // 4. Capital Write-Down Estimator Demo
  const writeDown = CapitalWriteDownEstimator.estimate({
    cdoExposureBillions: 43.0,
    subprimeMortgageExposureBillions: 22.0,
    cdoLossRate: 0.35,
    subprimeLossRate: 0.15,
    currentTier1CapitalBillions: 85.0,
    riskWeightedAssetsBillions: 1100.0
  });
  console.log('4. Capital Write-Down Impact:', writeDown);

  // 5. Dividend Cut Predictor Demo
  const divCut = DividendCutPredictor.predict({
    currentDividendPerShare: 2.16,
    projectedNetIncomeBillions: 8.0,
    capitalShortfallBillions: 12.5,
    sharesOutstandingBillions: 5.2,
    targetPayoutRatio: 0.30
  });
  console.log('5. Dividend Cut Prediction:', divCut);

  // 6. EPS Adjuster Demo
  const epsAdjusted = EarningsPerShareAdjuster.adjust({
    originalEPS: 4.50,
    investmentBankingRevenueDeclinePct: 40,
    writeDownImpactPerShare: 1.85,
    dilutionFactor: 1.12
  });
  console.log('6. EPS Adjustment:', epsAdjusted);

  // 7. Market Panic Index Demo
  const panic = MarketPanicIndex.calculate({
    cdsSpreadBps: 380,
    vixIndex: 42.5,
    financialSectorDeclinePct: -8.4,
    volumeSpikeRatio: 2.8
  });
  console.log('7. Market Panic Index:', panic);

  // 8. Institutional Sell-Off Tracker Demo
  const holders: InstitutionalHolder[] = [
    { name: 'Global Pension Fund A', sharesHeldMillions: 45, mandateRequiresInvestmentGrade: true, dividendYieldThreshold: 0.015 },
    { name: 'High Yield Income Trust', sharesHeldMillions: 30, mandateRequiresInvestmentGrade: false, dividendYieldThreshold: 0.04 },
    { name: 'Standard Index Fund', sharesHeldMillions: 120, mandateRequiresInvestmentGrade: false, dividendYieldThreshold: 0.0 }
  ];
  const sellOffs = InstitutionalSellOffTracker.trackPotentialSellOff(holders, true, 0.012);
  console.log('8. Institutional Sell-Offs:', sellOffs);

  // 9. Valuation Multiple Compressor Demo
  const compression = ValuationMultipleCompressor.compress({
    historicalPE: 12.5,
    historicalPB: 1.8,
    projectedROE: 0.04,
    creditRatingDowngradeSteps: 2,
    bookValuePerShare: 28.50,
    projectedEPS: 3.10
  });
  console.log('9. Valuation Multiple Compression:', compression);

  // 10. Downgrade Rebound Timer Demo
  const rebound = DowngradeReboundTimer.estimateRecovery({
    downgradeSeverity: 'Severe',
    macroEnvironment: 'Recession',
    capitalAdequacyRestored: false
  });
  console.log('10. Rebound & Recovery Timeline:', rebound);

  return {
    sentiment,
    target,
    blockTrade,
    writeDown,
    divCut,
    epsAdjusted,
    panic,
    sellOffs,
    compression,
    rebound
  };
}

// ==========================================
// EXPRESS API ROUTER INTEGRATION
// ==========================================
const router = Router();

/**
 * @route POST /api/goldman-downgrade/sentiment
 * @desc Parse analyst report text and return rating sentiment
 */
router.post('/sentiment', (req: Request, res: Response) => {
  try {
    const { reportText, baseRating } = req.body;
    if (!reportText || !baseRating) {
      return res.status(400).json({ error: 'Missing required fields: reportText, baseRating' });
    }
    const result = AnalystRatingSentimentParser.parseReport(reportText, baseRating);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/price-target
 * @desc Calculate adjusted stock price target based on write-downs
 */
router.post('/price-target', (req: Request, res: Response) => {
  try {
    const input: PriceTargetInput = req.body;
    const required = ['currentPrice', 'estimatedWriteDownsBillions', 'sharesOutstandingBillions', 'targetPEMultiple', 'projectedEPS'];
    for (const field of required) {
      if (input[field as keyof PriceTargetInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = StockPriceTargetCalculator.calculate(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/block-trade
 * @desc Simulate market impact and slippage of a block trade
 */
router.post('/block-trade', (req: Request, res: Response) => {
  try {
    const input: BlockTradeInput = req.body;
    const required = ['sharesToSell', 'currentPrice', 'averageDailyVolume', 'dailyVolatility'];
    for (const field of required) {
      if (input[field as keyof BlockTradeInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = BlockTradeSimulator.simulate(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/write-down
 * @desc Estimate capital write-down impact on Tier 1 Capital Ratio
 */
router.post('/write-down', (req: Request, res: Response) => {
  try {
    const input: WriteDownInput = req.body;
    const required = ['cdoExposureBillions', 'subprimeMortgageExposureBillions', 'cdoLossRate', 'subprimeLossRate', 'currentTier1CapitalBillions', 'riskWeightedAssetsBillions'];
    for (const field of required) {
      if (input[field as keyof WriteDownInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = CapitalWriteDownEstimator.estimate(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/dividend-cut
 * @desc Predict probability and savings of a dividend cut
 */
router.post('/dividend-cut', (req: Request, res: Response) => {
  try {
    const input: DividendPredictorInput = req.body;
    const required = ['currentDividendPerShare', 'projectedNetIncomeBillions', 'capitalShortfallBillions', 'sharesOutstandingBillions', 'targetPayoutRatio'];
    for (const field of required) {
      if (input[field as keyof DividendPredictorInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = DividendCutPredictor.predict(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/eps-adjust
 * @desc Adjust EPS based on write-downs, IB decline, and dilution
 */
router.post('/eps-adjust', (req: Request, res: Response) => {
  try {
    const input: EPSAdjustmentInput = req.body;
    const required = ['originalEPS', 'investmentBankingRevenueDeclinePct', 'writeDownImpactPerShare', 'dilutionFactor'];
    for (const field of required) {
      if (input[field as keyof EPSAdjustmentInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = EarningsPerShareAdjuster.adjust(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/panic-index
 * @desc Calculate market panic score and risk category
 */
router.post('/panic-index', (req: Request, res: Response) => {
  try {
    const input: PanicIndexInput = req.body;
    const required = ['cdsSpreadBps', 'vixIndex', 'financialSectorDeclinePct', 'volumeSpikeRatio'];
    for (const field of required) {
      if (input[field as keyof PanicIndexInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = MarketPanicIndex.calculate(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/sell-off-tracker
 * @desc Track potential institutional sell-offs based on mandates
 */
router.post('/sell-off-tracker', (req: Request, res: Response) => {
  try {
    const { holders, willBeDowngradedBelowInvestmentGrade, projectedYield } = req.body;
    if (!holders || willBeDowngradedBelowInvestmentGrade === undefined || projectedYield === undefined) {
      return res.status(400).json({ error: 'Missing required fields: holders, willBeDowngradedBelowInvestmentGrade, projectedYield' });
    }
    const result = InstitutionalSellOffTracker.trackPotentialSellOff(holders, willBeDowngradedBelowInvestmentGrade, projectedYield);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/multiple-compression
 * @desc Compress valuation multiples based on credit rating downgrade
 */
router.post('/multiple-compression', (req: Request, res: Response) => {
  try {
    const input: MultipleCompressionInput = req.body;
    const required = ['historicalPE', 'historicalPB', 'projectedROE', 'creditRatingDowngradeSteps', 'bookValuePerShare', 'projectedEPS'];
    for (const field of required) {
      if (input[field as keyof MultipleCompressionInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = ValuationMultipleCompressor.compress(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/goldman-downgrade/rebound-timer
 * @desc Estimate recovery and stabilization timeline
 */
router.post('/rebound-timer', (req: Request, res: Response) => {
  try {
    const input: ReboundTimerInput = req.body;
    const required = ['downgradeSeverity', 'macroEnvironment', 'capitalAdequacyRestored'];
    for (const field of required) {
      if (input[field as keyof ReboundTimerInput] === undefined) {
        return res.status(400).json({ error: `Missing required field: ${field}` });
      }
    }
    const result = DowngradeReboundTimer.estimateRecovery(input);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/goldman-downgrade/run-demo
 * @desc Run the full suite demo and return the consolidated results
 */
router.get('/run-demo', (req: Request, res: Response) => {
  try {
    const results = runAllGoldmanSachsDowngradeApps();
    return res.json({
      message: 'Goldman Sachs Downgrade App Suite executed successfully.',
      results
    });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;