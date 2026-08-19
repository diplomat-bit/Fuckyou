

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section6_cfo_gary_crittenden.ts ---

import { Router, Request, Response } from 'express';

export interface WriteDownInput {
  bookValue: number;
  abxIndexPrice: number; // e.g., 0.60 for 60 cents on the dollar
  defaultProbability: number; // 0.0 to 1.0
  lossGivenDefault: number; // 0.0 to 1.0
}

export interface WriteDownOutput {
  estimatedLoss: number;
  adjustedBookValue: number;
  writeDownPercentage: number;
}

/**
 * App 1: Write-Down Estimator
 * Models the valuation adjustments of subprime-related CDO assets based on ABX indices and credit metrics.
 */
export class WriteDownEstimator {
  public static calculateWriteDown(input: WriteDownInput): WriteDownOutput {
    const marketImpliedLoss = input.bookValue * (1 - input.abxIndexPrice);
    const creditImpliedLoss = input.bookValue * input.defaultProbability * input.lossGivenDefault;
    
    // CFOs often use a blended approach of market-implied and credit-model-implied losses
    const estimatedLoss = Math.max(marketImpliedLoss, creditImpliedLoss);
    const adjustedBookValue = Math.max(0, input.bookValue - estimatedLoss);
    const writeDownPercentage = input.bookValue > 0 ? (estimatedLoss / input.bookValue) * 100 : 0;

    return {
      estimatedLoss,
      adjustedBookValue,
      writeDownPercentage
    };
  }
}

export interface BalanceSheet {
  tier1Capital: number;
  riskWeightedAssets: number;
  totalAssets: number;
}

export interface AdjustedBalanceSheet extends BalanceSheet {
  tier1CapitalRatio: number;
  leverageRatio: number;
  tier1CapitalRatioChange: number;
}

/**
 * App 2: Balance Sheet Adjuster
 * Adjusts Citigroup's Tier 1 Capital and leverage ratios following write-down corrections.
 */
export class BalanceSheetAdjuster {
  public static adjust(original: BalanceSheet, writeDownAmount: number): AdjustedBalanceSheet {
    const adjustedTier1Capital = original.tier1Capital - writeDownAmount;
    const adjustedTotalAssets = original.totalAssets - writeDownAmount;
    
    // Assume risk-weighted assets decrease by a fraction of the write-down (e.g., 80% risk weight)
    const adjustedRWA = Math.max(0, original.riskWeightedAssets - (writeDownAmount * 0.8));

    const originalRatio = original.riskWeightedAssets > 0 ? (original.tier1Capital / original.riskWeightedAssets) * 100 : 0;
    const adjustedRatio = adjustedRWA > 0 ? (adjustedTier1Capital / adjustedRWA) * 100 : 0;
    const leverageRatio = adjustedTotalAssets > 0 ? (adjustedTier1Capital / adjustedTotalAssets) * 100 : 0;

    return {
      tier1Capital: adjustedTier1Capital,
      riskWeightedAssets: adjustedRWA,
      totalAssets: adjustedTotalAssets,
      tier1CapitalRatio: adjustedRatio,
      leverageRatio: leverageRatio,
      tier1CapitalRatioChange: adjustedRatio - originalRatio
    };
  }
}

export interface Disclosure {
  date: string;
  publiclyDisclosedExposure: number;
  actualInternalExposure: number;
}

export interface DisclosureGapReport {
  gapAmount: number;
  gapPercentage: number;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  requiresRestatement: boolean;
}

/**
 * App 3: Disclosure Gap Analyzer
 * Compares public disclosures against internal risk management reports to flag discrepancies.
 */
export class DisclosureGapAnalyzer {
  public static analyze(disclosure: Disclosure): DisclosureGapReport {
    const gapAmount = disclosure.actualInternalExposure - disclosure.publiclyDisclosedExposure;
    const gapPercentage = disclosure.publiclyDisclosedExposure > 0 
      ? (gapAmount / disclosure.publiclyDisclosedExposure) * 100 
      : 100;

    let severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL' = 'LOW';
    if (gapPercentage > 50 || gapAmount > 10000000000) { // > $10B gap
      severity = 'CRITICAL';
    } else if (gapPercentage > 20 || gapAmount > 5000000000) { // > $5B gap
      severity = 'HIGH';
    } else if (gapPercentage > 5) {
      severity = 'MEDIUM';
    }

    const requiresRestatement = severity === 'HIGH' || severity === 'CRITICAL';

    return {
      gapAmount,
      gapPercentage,
      severity,
      requiresRestatement
    };
  }
}

export interface SIVDetails {
  name: string;
  assets: number;
  liabilities: number;
  liquidityBackstopCommitted: boolean;
}

export interface ConsolidationResult {
  consolidatedAssetsAdded: number;
  consolidatedLiabilitiesAdded: number;
  capitalChargeIncurred: number;
  liquidityCoverageRatioImpact: number;
}

/**
 * App 4: SIV Consolidator (Structured Investment Vehicles)
 * Models the impact of bringing off-balance-sheet SIVs back onto Citigroup's balance sheet.
 */
export class SIVConsolidator {
  public static consolidate(sivs: SIVDetails[], currentTier1Capital: number): ConsolidationResult {
    let consolidatedAssetsAdded = 0;
    let consolidatedLiabilitiesAdded = 0;

    for (const siv of sivs) {
      if (siv.liquidityBackstopCommitted || siv.assets > siv.liabilities * 1.2) {
        // High risk of consolidation
        consolidatedAssetsAdded += siv.assets;
        consolidatedLiabilitiesAdded += siv.liabilities;
      }
    }

    // Capital charge is typically 8% of consolidated assets
    const capitalChargeIncurred = consolidatedAssetsAdded * 0.08;
    const liquidityCoverageRatioImpact = consolidatedAssetsAdded > 0 && currentTier1Capital > 0
      ? -(consolidatedAssetsAdded / currentTier1Capital) * 10 
      : 0;

    return {
      consolidatedAssetsAdded,
      consolidatedLiabilitiesAdded,
      capitalChargeIncurred,
      liquidityCoverageRatioImpact
    };
  }
}

export interface LiquidityStressInput {
  liquidAssets: number;
  projectedOutflows30D: number;
  writeDownShock: number;
}

export interface LiquidityStressOutput {
  postShockLCR: number;
  isCompliant: boolean;
  survivalHorizonDays: number;
}

/**
 * App 5: Liquidity Stress Tester
 * Simulates cash outflows and liquidity coverage ratio (LCR) under severe write-down scenarios.
 */
export class LiquidityStressTester {
  public static runTest(input: LiquidityStressInput): LiquidityStressOutput {
    // Write-down shock reduces liquid assets due to collateral calls and margin requirements
    const postShockLiquidAssets = Math.max(0, input.liquidAssets - (input.writeDownShock * 0.4));
    const postShockLCR = input.projectedOutflows30D > 0 ? (postShockLiquidAssets / input.projectedOutflows30D) * 100 : 0;
    const isCompliant = postShockLCR >= 100;

    // Estimate survival horizon in days
    const dailyOutflow = input.projectedOutflows30D / 30;
    const survivalHorizonDays = dailyOutflow > 0 ? Math.min(365, postShockLiquidAssets / dailyOutflow) : 365;

    return {
      postShockLCR,
      isCompliant,
      survivalHorizonDays
    };
  }
}

export interface SECPenaltyInput {
  misstatementDurationMonths: number;
  averageMisstatementSize: number;
  intentionality: 'NEGLIGENT' | 'RECKLESS' | 'FRAUDULENT';
}

export interface SECPenaltyOutput {
  civilPenalty: number;
  disgorgement: number;
  totalSettlement: number;
  reputationalRiskIndex: number;
}

/**
 * App 6: SEC Penalty Calculator
 * Estimates potential regulatory fines and settlement costs based on disclosure delays and misstatement magnitudes.
 */
export class SECPenaltyCalculator {
  public static calculate(input: SECPenaltyInput): SECPenaltyOutput {
    let baseMultiplier = 0.01; // 1% of misstatement size
    let riskMultiplier = 1;

    switch (input.intentionality) {
      case 'NEGLIGENT':
        baseMultiplier = 0.01;
        riskMultiplier = 2;
        break;
      case 'RECKLESS':
        baseMultiplier = 0.05;
        riskMultiplier = 5;
        break;
      case 'FRAUDULENT':
        baseMultiplier = 0.15;
        riskMultiplier = 10;
        break;
    }

    const civilPenalty = input.averageMisstatementSize * baseMultiplier * (1 + input.misstatementDurationMonths / 12);
    const disgorgement = input.averageMisstatementSize * 0.02; // Estimated ill-gotten gains/avoided losses
    const totalSettlement = civilPenalty + disgorgement;
    const reputationalRiskIndex = Math.min(100, input.misstatementDurationMonths * riskMultiplier);

    return {
      civilPenalty,
      disgorgement,
      totalSettlement,
      reputationalRiskIndex
    };
  }
}

export interface CDOTranche {
  name: string;
  principal: number;
  attachmentPoint: number;
  detachmentPoint: number;
}

export interface CDOValuationOutput {
  trancheName: string;
  impairment: number;
  fairValue: number;
  lossPercentage: number;
}

/**
 * App 7: CDO Valuation Engine
 * Calculates the fair value of Collateralized Debt Obligations (CDOs) using high-yield/subprime loss projections.
 */
export class CDOValuationEngine {
  public static valueCDO(tranches: CDOTranche[], totalPortfolioLoss: number): CDOValuationOutput[] {
    return tranches.map(tranche => {
      const trancheSize = tranche.detachmentPoint - tranche.attachmentPoint;
      let lossAllocatedToTranche = 0;

      if (totalPortfolioLoss > tranche.attachmentPoint) {
        lossAllocatedToTranche = Math.min(trancheSize, totalPortfolioLoss - tranche.attachmentPoint);
      }

      const impairment = trancheSize > 0 ? lossAllocatedToTranche * (tranche.principal / trancheSize) : 0;
      const fairValue = Math.max(0, tranche.principal - impairment);
      const lossPercentage = tranche.principal > 0 ? (impairment / tranche.principal) * 100 : 0;

      return {
        trancheName: tranche.name,
        impairment,
        fairValue,
        lossPercentage
      };
    });
  }
}

export interface QuarterlyEarnings {
  quarter: string;
  reportedNetIncome: number;
  sharesOutstanding: number;
}

export interface RestatedEarnings {
  quarter: string;
  reportedEPS: number;
  restatedNetIncome: number;
  restatedEPS: number;
  epsDelta: number;
}

/**
 * App 8: Earnings Restatement Engine
 * Restates historical quarterly earnings (EPS, Net Income) after correcting for delayed write-downs.
 */
export class EarningsRestatementEngine {
  public static restate(
    earnings: QuarterlyEarnings[], 
    writeDownCorrections: Record<string, number>
  ): RestatedEarnings[] {
    return earnings.map(q => {
      const correction = writeDownCorrections[q.quarter] || 0;
      const reportedEPS = q.sharesOutstanding > 0 ? q.reportedNetIncome / q.sharesOutstanding : 0;
      const restatedNetIncome = q.reportedNetIncome - correction;
      const restatedEPS = q.sharesOutstanding > 0 ? restatedNetIncome / q.sharesOutstanding : 0;

      return {
        quarter: q.quarter,
        reportedEPS,
        restatedNetIncome,
        restatedEPS,
        epsDelta: restatedEPS - reportedEPS
      };
    });
  }
}

export interface SentimentAnalysisResult {
  obfuscationScore: number; // 0 to 100 (higher means more evasive)
  sentimentScore: number; // -100 to 100 (negative to positive)
  flaggedPhrases: string[];
}

/**
 * App 9: Investor Relations Sentiment Analyzer
 * Analyzes CFO conference call transcripts or press releases for hedging language vs. hard numbers.
 */
export class InvestorRelationsSentimentAnalyzer {
  private static HEDGING_PHRASES = [
    'contained', 'manageable', 'subprime is limited', 'well-capitalized',
    'temporary dislocation', 'reasonable certainty', 'highly unlikely'
  ];

  private static NEGATIVE_PHRASES = [
    'write-down', 'impairment', 'loss', 'deficit', 'liquidity shortfall', 'downgrade'
  ];

  public static analyze(transcript: string): SentimentAnalysisResult {
    const lowerTranscript = transcript.toLowerCase();
    const flaggedPhrases: string[] = [];
    let obfuscationPoints = 0;
    let sentimentPoints = 0;

    for (const phrase of this.HEDGING_PHRASES) {
      const regex = new RegExp(phrase, 'g');
      const count = (lowerTranscript.match(regex) || []).length;
      if (count > 0) {
        flaggedPhrases.push(phrase);
        obfuscationPoints += count * 15;
        sentimentPoints -= count * 5;
      }
    }

    for (const phrase of this.NEGATIVE_PHRASES) {
      const regex = new RegExp(phrase, 'g');
      const count = (lowerTranscript.match(regex) || []).length;
      if (count > 0) {
        flaggedPhrases.push(phrase);
        sentimentPoints -= count * 15;
      }
    }

    const obfuscationScore = Math.min(100, obfuscationPoints);
    const sentimentScore = Math.max(-100, Math.min(100, sentimentPoints));

    return {
      obfuscationScore,
      sentimentScore,
      flaggedPhrases
    };
  }
}

export interface CapitalSource {
  name: string;
  availableAmount: number;
  costOfCapital: number; // percentage
  dilutionFactor: number; // percentage per billion
}

export interface RestructuringPlan {
  shortfall: number;
  allocations: { sourceName: string; amountAllocated: number }[];
  totalDilution: number;
  blendedCostOfCapital: number;
}

/**
 * App 10: Capital Restructuring Planner
 * Models emergency capital injections (e.g., sovereign wealth funds, TARP) needed to restore regulatory capital compliance.
 */
export class CapitalRestructuringPlanner {
  public static plan(
    currentTier1: number,
    targetRatio: number,
    rwa: number,
    sources: CapitalSource[]
  ): RestructuringPlan {
    const targetCapital = rwa * (targetRatio / 100);
    const shortfall = Math.max(0, targetCapital - currentTier1);

    if (shortfall === 0) {
      return { shortfall: 0, allocations: [], totalDilution: 0, blendedCostOfCapital: 0 };
    }

    let remainingShortfall = shortfall;
    const allocations: { sourceName: string; amountAllocated: number }[] = [];
    let totalDilution = 0;
    let totalCostWeighted = 0;

    // Sort sources by cost of capital ascending
    const sortedSources = [...sources].sort((a, b) => a.costOfCapital - b.costOfCapital);

    for (const source of sortedSources) {
      if (remainingShortfall <= 0) break;

      const allocated = Math.min(remainingShortfall, source.availableAmount);
      if (allocated > 0) {
        allocations.push({ sourceName: source.name, amountAllocated: allocated });
        remainingShortfall -= allocated;
        totalDilution += (allocated / 1000000000) * source.dilutionFactor;
        totalCostWeighted += allocated * source.costOfCapital;
      }
    }

    const totalAllocated = shortfall - remainingShortfall;
    const blendedCostOfCapital = totalAllocated > 0 ? totalCostWeighted / totalAllocated : 0;

    return {
      shortfall,
      allocations,
      totalDilution,
      blendedCostOfCapital
    };
  }
}

export interface SimulationReport {
  writeDownResult: WriteDownOutput;
  adjustedBS: AdjustedBalanceSheet;
  gapReport: DisclosureGapReport;
  sivConsolidation: ConsolidationResult;
  stressTest: LiquidityStressOutput;
  secPenalty: SECPenaltyOutput;
  cdoValuations: CDOValuationOutput[];
  restatements: RestatedEarnings[];
  sentiment: SentimentAnalysisResult;
  restructuringPlan: RestructuringPlan;
}

/**
 * Orchestrator demonstrating the integration of all 10 CFO Financial Correction Utilities.
 */
export class CFOCorrectionOrchestrator {
  public static runSimulation(): SimulationReport {
    // 1. Estimate Write-Downs
    const writeDownResult = WriteDownEstimator.calculateWriteDown({
      bookValue: 43000000000, // $43 Billion subprime exposure
      abxIndexPrice: 0.55,    // 55 cents on the dollar
      defaultProbability: 0.35,
      lossGivenDefault: 0.60
    });

    // 2. Adjust Balance Sheet
    const originalBS: BalanceSheet = {
      tier1Capital: 90000000000, // $90 Billion
      riskWeightedAssets: 1100000000000, // $1.1 Trillion
      totalAssets: 2200000000000 // $2.2 Trillion
    };
    const adjustedBS = BalanceSheetAdjuster.adjust(originalBS, writeDownResult.estimatedLoss);

    // 3. Analyze Disclosure Gap
    const gapReport = DisclosureGapAnalyzer.analyze({
      date: "2007-10-15",
      publiclyDisclosedExposure: 13000000000, // Disclosed $13B
      actualInternalExposure: 43000000000     // Actual $43B
    });

    // 4. Consolidate SIVs
    const sivs: SIVDetails[] = [
      { name: "Beta SIV", assets: 15000000000, liabilities: 14500000000, liquidityBackstopCommitted: true },
      { name: "Centauri SIV", assets: 25000000000, liabilities: 24000000000, liquidityBackstopCommitted: false }
    ];
    const sivConsolidation = SIVConsolidator.consolidate(sivs, adjustedBS.tier1Capital);

    // 5. Liquidity Stress Test
    const stressTest = LiquidityStressTester.runTest({
      liquidAssets: 120000000000,
      projectedOutflows30D: 100000000000,
      writeDownShock: writeDownResult.estimatedLoss
    });

    // 6. SEC Penalty Calculation
    const secPenalty = SECPenaltyCalculator.calculate({
      misstatementDurationMonths: 6,
      averageMisstatementSize: gapReport.gapAmount,
      intentionality: "RECKLESS"
    });

    // 7. CDO Valuation
    const tranches: CDOTranche[] = [
      { name: "Super Senior", principal: 1000000000, attachmentPoint: 0.30, detachmentPoint: 1.00 },
      { name: "Mezzanine", principal: 300000000, attachmentPoint: 0.10, detachmentPoint: 0.30 },
      { name: "Equity", principal: 100000000, attachmentPoint: 0.00, detachmentPoint: 0.10 }
    ];
    const cdoValuations = CDOValuationEngine.valueCDO(tranches, 0.25); // 25% portfolio loss

    // 8. Earnings Restatement
    const originalEarnings: QuarterlyEarnings[] = [
      { quarter: "Q3 2007", reportedNetIncome: 2300000000, sharesOutstanding: 5000000000 }
    ];
    const restatements = EarningsRestatementEngine.restate(originalEarnings, {
      "Q3 2007": writeDownResult.estimatedLoss * 0.5 // Allocate half the write-down to Q3
    });

    // 9. Sentiment Analysis
    const transcript = "Our subprime exposure is contained and manageable. We remain well-capitalized despite temporary dislocation.";
    const sentiment = InvestorRelationsSentimentAnalyzer.analyze(transcript);

    // 10. Capital Restructuring
    const capitalSources: CapitalSource[] = [
      { name: "Sovereign Wealth Fund", availableAmount: 7500000000, costOfCapital: 7.5, dilutionFactor: 1.2 },
      { name: "TARP Government Bailout", availableAmount: 25000000000, costOfCapital: 5.0, dilutionFactor: 0.8 },
      { name: "Public Common Stock Offering", availableAmount: 10000000000, costOfCapital: 10.0, dilutionFactor: 2.0 }
    ];
    const restructuringPlan = CapitalRestructuringPlanner.plan(
      adjustedBS.tier1Capital,
      8.5, // Target 8.5% Tier 1 Capital Ratio
      adjustedBS.riskWeightedAssets,
      capitalSources
    );

    return {
      writeDownResult,
      adjustedBS,
      gapReport,
      sivConsolidation,
      stressTest,
      secPenalty,
      cdoValuations,
      restatements,
      sentiment,
      restructuringPlan
    };
  }
}

// Express API Router Setup
const router = Router();

/**
 * @route POST /api/cfo/write-down
 * @desc Models the valuation adjustments of subprime-related CDO assets
 */
router.post('/write-down', (req: Request, res: Response) => {
  try {
    const { bookValue, abxIndexPrice, defaultProbability, lossGivenDefault } = req.body;
    if (
      typeof bookValue !== 'number' ||
      typeof abxIndexPrice !== 'number' ||
      typeof defaultProbability !== 'number' ||
      typeof lossGivenDefault !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing or invalid parameters in request body.' });
    }
    const result = WriteDownEstimator.calculateWriteDown({
      bookValue,
      abxIndexPrice,
      defaultProbability,
      lossGivenDefault
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/balance-sheet-adjust
 * @desc Adjusts Tier 1 Capital and leverage ratios following write-down corrections
 */
router.post('/balance-sheet-adjust', (req: Request, res: Response) => {
  try {
    const { original, writeDownAmount } = req.body;
    if (!original || typeof writeDownAmount !== 'number') {
      return res.status(400).json({ error: 'Missing original balance sheet or writeDownAmount.' });
    }
    const result = BalanceSheetAdjuster.adjust(original, writeDownAmount);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/disclosure-gap
 * @desc Compares public disclosures against internal risk management reports
 */
router.post('/disclosure-gap', (req: Request, res: Response) => {
  try {
    const { date, publiclyDisclosedExposure, actualInternalExposure } = req.body;
    if (!date || typeof publiclyDisclosedExposure !== 'number' || typeof actualInternalExposure !== 'number') {
      return res.status(400).json({ error: 'Missing or invalid parameters.' });
    }
    const result = DisclosureGapAnalyzer.analyze({ date, publiclyDisclosedExposure, actualInternalExposure });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/siv-consolidate
 * @desc Models the impact of bringing off-balance-sheet SIVs back onto the balance sheet
 */
router.post('/siv-consolidate', (req: Request, res: Response) => {
  try {
    const { sivs, currentTier1Capital } = req.body;
    if (!Array.isArray(sivs) || typeof currentTier1Capital !== 'number') {
      return res.status(400).json({ error: 'Invalid sivs array or currentTier1Capital.' });
    }
    const result = SIVConsolidator.consolidate(sivs, currentTier1Capital);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/liquidity-stress
 * @desc Simulates cash outflows and liquidity coverage ratio (LCR) under severe write-down scenarios
 */
router.post('/liquidity-stress', (req: Request, res: Response) => {
  try {
    const { liquidAssets, projectedOutflows30D, writeDownShock } = req.body;
    if (
      typeof liquidAssets !== 'number' ||
      typeof projectedOutflows30D !== 'number' ||
      typeof writeDownShock !== 'number'
    ) {
      return res.status(400).json({ error: 'Missing or invalid parameters.' });
    }
    const result = LiquidityStressTester.runTest({ liquidAssets, projectedOutflows30D, writeDownShock });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/sec-penalty
 * @desc Estimates potential regulatory fines and settlement costs
 */
router.post('/sec-penalty', (req: Request, res: Response) => {
  try {
    const { misstatementDurationMonths, averageMisstatementSize, intentionality } = req.body;
    if (
      typeof misstatementDurationMonths !== 'number' ||
      typeof averageMisstatementSize !== 'number' ||
      !['NEGLIGENT', 'RECKLESS', 'FRAUDULENT'].includes(intentionality)
    ) {
      return res.status(400).json({ error: 'Invalid parameters or intentionality value.' });
    }
    const result = SECPenaltyCalculator.calculate({
      misstatementDurationMonths,
      averageMisstatementSize,
      intentionality
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/cdo-valuation
 * @desc Calculates the fair value of Collateralized Debt Obligations (CDOs)
 */
router.post('/cdo-valuation', (req: Request, res: Response) => {
  try {
    const { tranches, totalPortfolioLoss } = req.body;
    if (!Array.isArray(tranches) || typeof totalPortfolioLoss !== 'number') {
      return res.status(400).json({ error: 'Invalid tranches array or totalPortfolioLoss.' });
    }
    const result = CDOValuationEngine.valueCDO(tranches, totalPortfolioLoss);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/earnings-restate
 * @desc Restates historical quarterly earnings after correcting for delayed write-downs
 */
router.post('/earnings-restate', (req: Request, res: Response) => {
  try {
    const { earnings, writeDownCorrections } = req.body;
    if (!Array.isArray(earnings) || !writeDownCorrections) {
      return res.status(400).json({ error: 'Invalid earnings array or writeDownCorrections object.' });
    }
    const result = EarningsRestatementEngine.restate(earnings, writeDownCorrections);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/sentiment-analyze
 * @desc Analyzes CFO conference call transcripts or press releases for hedging language
 */
router.post('/sentiment-analyze', (req: Request, res: Response) => {
  try {
    const { transcript } = req.body;
    if (typeof transcript !== 'string') {
      return res.status(400).json({ error: 'Transcript must be a string.' });
    }
    const result = InvestorRelationsSentimentAnalyzer.analyze(transcript);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route POST /api/cfo/capital-restructure
 * @desc Models emergency capital injections needed to restore regulatory capital compliance
 */
router.post('/capital-restructure', (req: Request, res: Response) => {
  try {
    const { currentTier1, targetRatio, rwa, sources } = req.body;
    if (
      typeof currentTier1 !== 'number' ||
      typeof targetRatio !== 'number' ||
      typeof rwa !== 'number' ||
      !Array.isArray(sources)
    ) {
      return res.status(400).json({ error: 'Missing or invalid parameters.' });
    }
    const result = CapitalRestructuringPlanner.plan(currentTier1, targetRatio, rwa, sources);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

/**
 * @route GET /api/cfo/simulate
 * @desc Runs the full master simulation of the Citigroup CFO Gary Crittenden Financial Correction
 */
router.get('/simulate', (req: Request, res: Response) => {
  try {
    const report = CFOCorrectionOrchestrator.runSimulation();
    return res.json(report);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default router;