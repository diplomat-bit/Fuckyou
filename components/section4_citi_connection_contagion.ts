

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section4_citi_connection_contagion.ts ---

import { Router, Request, Response } from 'express';

export interface AssetExposure {
  assetName: string;
  nominalValue: number;
  subprimeConcentration: number; // 0 to 1
  currentMarkToMarket: number;  // 0 to 1
}

export interface WriteDownResult {
  assetName: string;
  nominalValue: number;
  preWriteDownValue: number;
  postWriteDownValue: number;
  writeDownAmount: number;
}

export interface SolvencyStatus {
  initialTier1Capital: number;
  totalWriteDowns: number;
  adjustedTier1Capital: number;
  riskWeightedAssets: number;
  initialTier1Ratio: number;
  adjustedTier1Ratio: number;
  isSolvent: boolean;
}

/**
 * APP 1: Toxic Asset Exposure Calculator
 * Simulates write-downs on Citigroup's subprime-exposed assets (CDOs, RMBS)
 * and calculates the impact on Tier 1 Capital.
 */
export class ToxicAssetExposureCalculator {
  private exposures: AssetExposure[] = [];
  private tier1Capital: number;
  private riskWeightedAssets: number;
  private regulatoryMinimum: number = 0.04; // 4% Tier 1 Minimum

  constructor(tier1Capital: number, riskWeightedAssets: number) {
    this.tier1Capital = tier1Capital;
    this.riskWeightedAssets = riskWeightedAssets;
  }

  public addExposure(exposure: AssetExposure): void {
    this.exposures.push(exposure);
  }

  public calculateWriteDowns(severityFactor: number): WriteDownResult[] {
    return this.exposures.map(exp => {
      const preValue = exp.nominalValue * exp.currentMarkToMarket;
      // Loss is scaled by subprime concentration and severity factor
      const lossPercentage = exp.subprimeConcentration * severityFactor;
      const postMark = Math.max(0, exp.currentMarkToMarket - lossPercentage);
      const postValue = exp.nominalValue * postMark;
      const writeDownAmount = preValue - postValue;

      return {
        assetName: exp.assetName,
        nominalValue: exp.nominalValue,
        preWriteDownValue: preValue,
        postWriteDownValue: postValue,
        writeDownAmount
      };
    });
  }

  public runStressTest(severityFactor: number): SolvencyStatus {
    const writeDowns = this.calculateWriteDowns(severityFactor);
    const totalWriteDowns = writeDowns.reduce((sum, item) => sum + item.writeDownAmount, 0);
    const adjustedTier1Capital = Math.max(0, this.tier1Capital - totalWriteDowns);
    const initialTier1Ratio = this.tier1Capital / this.riskWeightedAssets;
    const adjustedTier1Ratio = adjustedTier1Capital / this.riskWeightedAssets;

    return {
      initialTier1Capital: this.tier1Capital,
      totalWriteDowns,
      adjustedTier1Capital,
      riskWeightedAssets: this.riskWeightedAssets,
      initialTier1Ratio,
      adjustedTier1Ratio,
      isSolvent: adjustedTier1Ratio >= this.regulatoryMinimum
    };
  }
}


export interface BankNode {
  id: string;
  name: string;
  capital: number;
  interbankAssets: Record<string, number>; // Amount this bank lent to other banks
  interbankLiabilities: Record<string, number>; // Amount this bank owes to other banks
  isDefaulted: boolean;
}

export interface ContagionSimulationResult {
  rounds: number;
  defaultedBanks: string[];
  lossesPerBank: Record<string, number>;
  systemicLoss: number;
}

/**
 * APP 2: Interbank Contagion Simulator
 * Models the domino effect of a Citigroup default or distress across the interbank lending network.
 */
export class InterbankContagionSimulator {
  private network: Record<string, BankNode> = {};

  public addBank(bank: BankNode): void {
    this.network[bank.id] = JSON.parse(JSON.stringify(bank));
  }

  public simulateContagion(triggerBankId: string, recoveryRate: number = 0.4): ContagionSimulationResult {
    const activeNetwork = JSON.parse(JSON.stringify(this.network)) as Record<string, BankNode>;
    const defaultedBanks = new Set<string>();
    const lossesPerBank: Record<string, number> = {};

    for (const id in activeNetwork) {
      lossesPerBank[id] = 0;
    }

    // Trigger initial default
    if (activeNetwork[triggerBankId]) {
      activeNetwork[triggerBankId].isDefaulted = true;
      defaultedBanks.add(triggerBankId);
    } else {
      throw new Error(`Trigger bank ${triggerBankId} not found in network.`);
    }

    let contagionActive = true;
    let rounds = 0;

    while (contagionActive) {
      contagionActive = false;
      rounds++;
      const newlyDefaulted: string[] = [];

      for (const bankId in activeNetwork) {
        const bank = activeNetwork[bankId];
        if (bank.isDefaulted) continue;

        // Calculate losses from exposures to already defaulted banks
        let currentLoss = 0;
        for (const debtorId of defaultedBanks) {
          if (bank.interbankAssets[debtorId]) {
            const exposure = bank.interbankAssets[debtorId];
            const loss = exposure * (1 - recoveryRate);
            currentLoss += loss;
          }
        }

        lossesPerBank[bankId] = currentLoss;

        // Check if losses exceed capital buffer
        if (currentLoss >= bank.capital) {
          bank.isDefaulted = true;
          newlyDefaulted.push(bankId);
          contagionActive = true;
        }
      }

      for (const id of newlyDefaulted) {
        defaultedBanks.add(id);
      }

      // Prevent infinite loops in edge cases
      if (rounds > Object.keys(activeNetwork).length) break;
    }

    const systemicLoss = Object.values(lossesPerBank).reduce((sum, val) => sum + val, 0);

    return {
      rounds,
      defaultedBanks: Array.from(defaultedBanks),
      lossesPerBank,
      systemicLoss
    };
  }
}


export interface BankRunParameters {
  totalDeposits: number;
  liquidReserves: number;
  retailRatio: number; // Retail vs Institutional deposits (retail is stickier)
  cdsSpreadBps: number; // Credit Default Swap spread in basis points
  newsSentimentScore: number; // -1 (panic) to 1 (euphoria)
  daysToSimulate: number;
}

export interface BankRunDayResult {
  day: number;
  withdrawnAmount: number;
  remainingDeposits: number;
  remainingReserves: number;
  runProbability: number;
  isBankrupt: boolean;
}

/**
 * APP 3: Bank Run Probability Calculator
 * Simulates daily deposit withdrawal dynamics based on market panic, CDS spreads, and liquidity.
 */
export class BankRunProbabilityCalculator {
  public static calculateRunProbability(cdsSpread: number, sentiment: number): number {
    // Logistic function mapping CDS spread and sentiment to a probability
    const cdsFactor = cdsSpread / 1000; // 1000 bps is highly distressed
    const sentimentFactor = (1 - sentiment) / 2; // Map -1..1 to 1..0
    const logit = -4 + (cdsFactor * 3) + (sentimentFactor * 2.5);
    return 1 / (1 + Math.exp(-logit));
  }

  public static simulateRun(params: BankRunParameters): BankRunDayResult[] {
    const results: BankRunDayResult[] = [];
    let currentDeposits = params.totalDeposits;
    let currentReserves = params.liquidReserves;
    let isBankrupt = false;

    for (let day = 1; day <= params.daysToSimulate; day++) {
      if (isBankrupt) {
        results.push({
          day,
          withdrawnAmount: 0,
          remainingDeposits: currentDeposits,
          remainingReserves: currentReserves,
          runProbability: 1.0,
          isBankrupt: true
        });
        continue;
      }

      // Dynamic run probability that increases as reserves deplete
      const reserveRatio = currentReserves / currentDeposits;
      const reservePanicFactor = reserveRatio < 0.1 ? (0.1 - reserveRatio) * 10 : 0;
      const dailyRunProb = Math.min(
        0.99,
        this.calculateRunProbability(params.cdsSpreadBps, params.newsSentimentScore) + reservePanicFactor
      );

      // Institutional depositors run faster than retail
      const retailWithdrawalRate = dailyRunProb * 0.05;
      const institutionalWithdrawalRate = dailyRunProb * 0.25;

      const retailDeposits = currentDeposits * params.retailRatio;
      const institutionalDeposits = currentDeposits * (1 - params.retailRatio);

      const retailWithdrawn = retailDeposits * retailWithdrawalRate;
      const instWithdrawn = institutionalDeposits * institutionalWithdrawalRate;
      const totalWithdrawn = retailWithdrawn + instWithdrawn;

      currentDeposits -= totalWithdrawn;
      currentReserves -= totalWithdrawn;

      if (currentReserves <= 0) {
        currentReserves = 0;
        isBankrupt = true;
      }

      results.push({
        day,
        withdrawnAmount: totalWithdrawn,
        remainingDeposits: currentDeposits,
        remainingReserves: currentReserves,
        runProbability: dailyRunProb,
        isBankrupt
      });
    }

    return results;
  }
}


export interface MacroScenario {
  name: string;
  gdpContraction: number; // e.g., 0.05 for 5% drop
  unemploymentRate: number; // e.g., 0.10 for 10%
  housingPriceDrop: number; // e.g., 0.30 for 30% drop
}

export interface StressTestOutput {
  scenarioName: string;
  projectedLosses: number;
  postStressCapital: number;
  postStressRWA: number;
  postStressCET1Ratio: number;
  regulatoryActionRequired: string;
}

/**
 * APP 4: Solvency Stress Tester
 * Applies macroeconomic shock scenarios to Citigroup's balance sheet to project CET1 ratios.
 */
export class SolvencyStressTester {
  private baseCET1Capital: number;
  private baseRWA: number;
  private loanPortfolio: { type: string; balance: number; baseLossRate: number }[] = [];

  constructor(baseCET1Capital: number, baseRWA: number) {
    this.baseCET1Capital = baseCET1Capital;
    this.baseRWA = baseRWA;
  }

  public addLoanPortfolio(type: string, balance: number, baseLossRate: number): void {
    this.loanPortfolio.push({ type, balance, baseLossRate });
  }

  public runScenario(scenario: MacroScenario): StressTestOutput {
    let totalLosses = 0;

    for (const portfolio of this.loanPortfolio) {
      let multiplier = 1.0;
      if (portfolio.type === "Residential Mortgage") {
        multiplier += scenario.housingPriceDrop * 2.5 + (scenario.unemploymentRate - 0.05) * 1.5;
      } else if (portfolio.type === "Commercial Loan") {
        multiplier += scenario.gdpContraction * 3.0 + (scenario.unemploymentRate - 0.05) * 1.0;
      } else {
        multiplier += scenario.gdpContraction * 2.0;
      }

      const stressedLossRate = Math.min(0.95, portfolio.baseLossRate * Math.max(1, multiplier));
      totalLosses += portfolio.balance * stressedLossRate;
    }

    const postStressCapital = Math.max(0, this.baseCET1Capital - totalLosses);
    // Stressed RWA might increase due to credit migration
    const postStressRWA = this.baseRWA * (1 + scenario.gdpContraction * 0.5);
    const postStressCET1Ratio = postStressCapital / postStressRWA;

    let regulatoryActionRequired = "None";
    if (postStressCET1Ratio < 0.045) {
      regulatoryActionRequired = "Receivership / Immediate Bailout";
    } else if (postStressCET1Ratio < 0.06) {
      regulatoryActionRequired = "Capital Restoration Plan & Dividend Restriction";
    } else if (postStressCET1Ratio < 0.08) {
      regulatoryActionRequired = "Capital Conservation Buffer Warning";
    }

    return {
      scenarioName: scenario.name,
      projectedLosses: totalLosses,
      postStressCapital,
      postStressRWA,
      postStressCET1Ratio,
      regulatoryActionRequired
    };
  }
}


export interface CDOTranche {
  name: string;
  attachmentPoint: number; // e.g., 0.10 (losses above 10% hit this tranche)
  detachmentPoint: number; // e.g., 0.25 (losses above 25% wipe out this tranche)
  nominalValue: number;
}

export interface CDOValuationResult {
  trancheName: string;
  expectedLoss: number;
  fairValue: number;
  impairmentPercentage: number;
}

/**
 * APP 5: CDO Valuation Engine
 * Simulates subprime mortgage pool defaults and calculates the fair value of structured CDO tranches.
 */
export class CDOValuationEngine {
  private tranches: CDOTranche[] = [];

  public addTranche(tranche: CDOTranche): void {
    this.tranches.push(tranche);
  }

  public valueCDO(poolDefaultRate: number, lossGivenDefault: number): CDOValuationResult[] {
    const totalPoolLossRate = poolDefaultRate * lossGivenDefault;

    return this.tranches.map(tranche => {
      const trancheSize = tranche.detachmentPoint - tranche.attachmentPoint;
      let trancheLossRate = 0;

      if (totalPoolLossRate <= tranche.attachmentPoint) {
        trancheLossRate = 0;
      } else if (totalPoolLossRate >= tranche.detachmentPoint) {
        trancheLossRate = 1;
      } else {
        trancheLossRate = (totalPoolLossRate - tranche.attachmentPoint) / trancheSize;
      }

      const expectedLoss = tranche.nominalValue * trancheLossRate;
      const fairValue = tranche.nominalValue - expectedLoss;
      const impairmentPercentage = trancheLossRate;

      return {
        trancheName: tranche.name,
        expectedLoss,
        fairValue,
        impairmentPercentage
      };
    });
  }
}


export interface HQLA {
  level1: number; // Cash, central bank reserves, sovereign debt (100% weight)
  level2A: number; // High-quality corporate bonds, GSE debt (85% weight)
  level2B: number; // Lower-quality corporate bonds, equities (50% weight)
}

export interface CashOutflows {
  retailDeposits: number;
  unsecuredWholesaleFunding: number;
  securedFunding: number;
  committedFacilities: number;
}

/**
 * APP 6: Liquidity Coverage Ratio (LCR) Calculator
 * Computes the LCR to ensure Citigroup has enough high-quality liquid assets to survive a 30-day stress scenario.
 */
export class LiquidityCoverageRatioCalculator {
  public static calculateTotalHQLA(hqla: HQLA): number {
    return hqla.level1 + (hqla.level2A * 0.85) + (hqla.level2B * 0.50);
  }

  public static calculateStressedOutflows(outflows: CashOutflows, stressSeverity: number): number {
    // Standard Basel III run-off rates scaled by stress severity
    const retailRunOff = 0.05 * stressSeverity; // Standard is 5-10%
    const wholesaleRunOff = 0.40 * stressSeverity; // Standard is 40-100%
    const securedRunOff = 0.25 * stressSeverity;
    const committedRunOff = 0.10 * stressSeverity;

    return (
      outflows.retailDeposits * retailRunOff +
      outflows.unsecuredWholesaleFunding * wholesaleRunOff +
      outflows.securedFunding * securedRunOff +
      outflows.committedFacilities * committedRunOff
    );
  }

  public static runLCRTest(hqla: HQLA, outflows: CashOutflows, stressSeverity: number): {
    totalHQLA: number;
    totalOutflows: number;
    lcr: number;
    isCompliant: boolean;
  } {
    const totalHQLA = this.calculateTotalHQLA(hqla);
    const totalOutflows = this.calculateStressedOutflows(outflows, stressSeverity);
    const lcr = totalOutflows > 0 ? totalHQLA / totalOutflows : 999;

    return {
      totalHQLA,
      totalOutflows,
      lcr,
      isCompliant: lcr >= 1.0 // 100% minimum requirement
    };
  }
}


export interface CDSTermStructure {
  years: number;
  spreadBps: number;
}

export interface DefaultProbabilityCurve {
  year: number;
  marginalPD: number;
  cumulativePD: number;
  survivalProbability: number;
}

/**
 * APP 7: CDS Spread to Default Probability Converter
 * Extracts market-implied default probabilities from Citigroup's Credit Default Swap spreads.
 */
export class CDSSpreadToDefaultProbability {
  public static convert(
    terms: CDSTermStructure[],
    recoveryRate: number = 0.40,
    riskFreeRate: number = 0.03
  ): DefaultProbabilityCurve[] {
    const curves: DefaultProbabilityCurve[] = [];
    let cumulativeSurvival = 1.0;

    for (const term of terms) {
      const s = term.spreadBps / 10000; // Convert bps to decimal
      const r = riskFreeRate;
      const R = recoveryRate;

      // Hazard rate approximation: lambda = s / (1 - R)
      const hazardRate = s / (1 - R);

      // Probability of surviving this year given survival up to now
      const marginalSurvival = Math.exp(-hazardRate);
      const marginalPD = 1 - marginalSurvival;

      const cumulativePD = 1 - (cumulativeSurvival * marginalSurvival);
      cumulativeSurvival *= marginalSurvival;

      curves.push({
        year: term.years,
        marginalPD,
        cumulativePD,
        survivalProbability: cumulativeSurvival
      });
    }

    return curves;
  }
}


export interface SystemicRiskInput {
  bankEquity: number;
  bankLiabilities: number;
  marginalExpectedShortfall: number; // MES (expected loss of bank when market drops by 2%+)
  systemicDropThreshold: number; // e.g., 0.40 (40% market drop)
  prudentialCapitalRatio: number; // e.g., 0.08 (8% capital requirement)
}

/**
 * APP 8: Systemic Risk Index (SRISK) Calculator
 * Estimates the capital shortfall of Citigroup during a systemic financial crisis.
 */
export class SystemicRiskIndex {
  public static calculateSRISK(input: SystemicRiskInput): {
    srisk: number;
    isSystemicallyDangerous: boolean;
  } {
    // SRISK = k * Liabilities - (1 - k) * (1 - LRMES) * Equity
    // LRMES (Long Run Marginal Expected Shortfall) approximated from daily MES
    const lrmes = 1 - Math.exp(-18 * input.marginalExpectedShortfall);
    const k = input.prudentialCapitalRatio;

    const liabilitiesTerm = k * input.bankLiabilities;
    const equityTerm = (1 - k) * (1 - lrmes) * input.bankEquity;

    const srisk = Math.max(0, liabilitiesTerm - equityTerm);

    return {
      srisk,
      isSystemicallyDangerous: srisk > 50000000000 // Distressed if shortfall > $50 Billion
    };
  }
}


export interface CapitalInjectionOption {
  source: string;
  amountAvailable: number;
  costOfCapital: number; // Annual dividend/interest rate
  dilutionFactor: number; // Dilution to existing shareholders (0 to 1)
}

export interface OptimizationResult {
  selectedInjections: { source: string; amountUsed: number }[];
  totalInjected: number;
  weightedCostOfCapital: number;
  totalDilution: number;
  targetMet: boolean;
}

/**
 * APP 9: Capital Injection Optimizer
 * Determines the optimal mix of private capital, asset sales, and government bailouts (TARP)
 * to restore Citigroup's capital ratios while minimizing dilution and cost.
 */
export class CapitalInjectionOptimizer {
  private options: CapitalInjectionOption[] = [];

  public addOption(option: CapitalInjectionOption): void {
    this.options.push(option);
  }

  public optimize(capitalShortfall: number): OptimizationResult {
    // Sort options by cost of capital (ascending) then dilution (ascending)
    const sortedOptions = [...this.options].sort((a, b) => {
      if (a.costOfCapital !== b.costOfCapital) {
        return a.costOfCapital - b.costOfCapital;
      }
      return a.dilutionFactor - b.dilutionFactor;
    });

    let remainingShortfall = capitalShortfall;
    const selectedInjections: { source: string; amountUsed: number }[] = [];
    let totalInjected = 0;
    let totalWeightedCost = 0;
    let totalDilution = 0;

    for (const option of sortedOptions) {
      if (remainingShortfall <= 0) break;

      const amountUsed = Math.min(remainingShortfall, option.amountAvailable);
      selectedInjections.push({ source: option.source, amountUsed });

      totalInjected += amountUsed;
      totalWeightedCost += amountUsed * option.costOfCapital;
      totalDilution += (amountUsed / option.amountAvailable) * option.dilutionFactor;
      remainingShortfall -= amountUsed;
    }

    const weightedCostOfCapital = totalInjected > 0 ? totalWeightedCost / totalInjected : 0;

    return {
      selectedInjections,
      totalInjected,
      weightedCostOfCapital,
      totalDilution: Math.min(1.0, totalDilution),
      targetMet: remainingShortfall <= 0
    };
  }
}


export interface AssetClass {
  name: string;
  totalMarketValue: number;
  liquidityCoefficient: number; // Higher means more liquid (less price impact)
  currentPrice: number; // Normalized to 1.0
}

export interface FireSaleResult {
  assetName: string;
  amountSold: number;
  originalPrice: number;
  depreciatedPrice: number;
  totalLossRealized: number;
}

/**
 * APP 10: Fire Sale Contagion Model
 * Simulates the feedback loop where forced asset liquidations depress market prices,
 * triggering further write-downs and margin calls.
 */
export class FireSaleContagionModel {
  private assets: Record<string, AssetClass> = {};

  public addAssetClass(asset: AssetClass): void {
    this.assets[asset.name] = { ...asset };
  }

  public simulateFireSale(sales: { assetName: string; amountToSell: number }[]): FireSaleResult[] {
    return sales.map(sale => {
      const asset = this.assets[sale.assetName];
      if (!asset) {
        throw new Error(`Asset class ${sale.assetName} not found.`);
      }

      const originalPrice = asset.currentPrice;
      // Price impact model: Price drop is proportional to the fraction of market value sold
      const fractionSold = sale.amountToSell / asset.totalMarketValue;
      // Exponential price decay based on liquidity coefficient
      const priceImpact = Math.exp(-fractionSold / asset.liquidityCoefficient);
      const depreciatedPrice = Math.max(0.1, originalPrice * priceImpact);

      // Loss realized due to selling at a depressed average price (assuming linear slippage)
      const averageExecutionPrice = (originalPrice + depreciatedPrice) / 2;
      const totalLossRealized = sale.amountToSell * (1.0 - averageExecutionPrice);

      // Update global asset price state
      asset.currentPrice = depreciatedPrice;

      return {
        assetName: sale.assetName,
        amountSold: sale.amountToSell,
        originalPrice,
        depreciatedPrice,
        totalLossRealized
      };
    });
  }
}

// ==========================================
// EXPRESS API ROUTER IMPLEMENTATION
// ==========================================

export const citiConnectionContagionRouter = Router();

// 1. Toxic Asset Exposure Calculator Route
citiConnectionContagionRouter.post('/toxic-asset/stress-test', (req: Request, res: Response) => {
  try {
    const { tier1Capital, riskWeightedAssets, exposures, severityFactor } = req.body;
    if (typeof tier1Capital !== 'number' || typeof riskWeightedAssets !== 'number' || !Array.isArray(exposures) || typeof severityFactor !== 'number') {
      return res.status(400).json({ error: "Invalid input parameters. Required: tier1Capital (number), riskWeightedAssets (number), exposures (array), severityFactor (number)." });
    }

    const calculator = new ToxicAssetExposureCalculator(tier1Capital, riskWeightedAssets);
    for (const exp of exposures) {
      calculator.addExposure(exp);
    }

    const writeDowns = calculator.calculateWriteDowns(severityFactor);
    const solvencyStatus = calculator.runStressTest(severityFactor);

    return res.json({ writeDowns, solvencyStatus });
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 2. Interbank Contagion Simulator Route
citiConnectionContagionRouter.post('/interbank/contagion', (req: Request, res: Response) => {
  try {
    const { banks, triggerBankId, recoveryRate } = req.body;
    if (!Array.isArray(banks) || typeof triggerBankId !== 'string') {
      return res.status(400).json({ error: "Invalid input parameters. Required: banks (array), triggerBankId (string), recoveryRate (optional number)." });
    }

    const simulator = new InterbankContagionSimulator();
    for (const bank of banks) {
      simulator.addBank(bank);
    }

    const result = simulator.simulateContagion(triggerBankId, typeof recoveryRate === 'number' ? recoveryRate : undefined);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 3. Bank Run Probability Calculator Route
citiConnectionContagionRouter.post('/bank-run/simulate', (req: Request, res: Response) => {
  try {
    const { totalDeposits, liquidReserves, retailRatio, cdsSpreadBps, newsSentimentScore, daysToSimulate } = req.body;
    if (
      typeof totalDeposits !== 'number' ||
      typeof liquidReserves !== 'number' ||
      typeof retailRatio !== 'number' ||
      typeof cdsSpreadBps !== 'number' ||
      typeof newsSentimentScore !== 'number' ||
      typeof daysToSimulate !== 'number'
    ) {
      return res.status(400).json({ error: "Invalid input parameters. All parameters must be numbers." });
    }

    const results = BankRunProbabilityCalculator.simulateRun({
      totalDeposits,
      liquidReserves,
      retailRatio,
      cdsSpreadBps,
      newsSentimentScore,
      daysToSimulate
    });

    return res.json(results);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 4. Solvency Stress Tester Route
citiConnectionContagionRouter.post('/solvency/stress-test', (req: Request, res: Response) => {
  try {
    const { baseCET1Capital, baseRWA, loanPortfolio, scenario } = req.body;
    if (typeof baseCET1Capital !== 'number' || typeof baseRWA !== 'number' || !Array.isArray(loanPortfolio) || !scenario) {
      return res.status(400).json({ error: "Invalid input parameters. Required: baseCET1Capital (number), baseRWA (number), loanPortfolio (array), scenario (object)." });
    }

    const tester = new SolvencyStressTester(baseCET1Capital, baseRWA);
    for (const portfolio of loanPortfolio) {
      tester.addLoanPortfolio(portfolio.type, portfolio.balance, portfolio.baseLossRate);
    }

    const result = tester.runScenario(scenario);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 5. CDO Valuation Engine Route
citiConnectionContagionRouter.post('/cdo/valuation', (req: Request, res: Response) => {
  try {
    const { tranches, poolDefaultRate, lossGivenDefault } = req.body;
    if (!Array.isArray(tranches) || typeof poolDefaultRate !== 'number' || typeof lossGivenDefault !== 'number') {
      return res.status(400).json({ error: "Invalid input parameters. Required: tranches (array), poolDefaultRate (number), lossGivenDefault (number)." });
    }

    const engine = new CDOValuationEngine();
    for (const tranche of tranches) {
      engine.addTranche(tranche);
    }

    const result = engine.valueCDO(poolDefaultRate, lossGivenDefault);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 6. Liquidity Coverage Ratio Route
citiConnectionContagionRouter.post('/liquidity/lcr', (req: Request, res: Response) => {
  try {
    const { hqla, outflows, stressSeverity } = req.body;
    if (!hqla || !outflows || typeof stressSeverity !== 'number') {
      return res.status(400).json({ error: "Invalid input parameters. Required: hqla (object), outflows (object), stressSeverity (number)." });
    }

    const result = LiquidityCoverageRatioCalculator.runLCRTest(hqla, outflows, stressSeverity);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 7. CDS Spread to Default Probability Route
citiConnectionContagionRouter.post('/cds/default-probability', (req: Request, res: Response) => {
  try {
    const { terms, recoveryRate, riskFreeRate } = req.body;
    if (!Array.isArray(terms)) {
      return res.status(400).json({ error: "Invalid input parameters. Required: terms (array of CDSTermStructure), recoveryRate (optional number), riskFreeRate (optional number)." });
    }

    const result = CDSSpreadToDefaultProbability.convert(
      terms,
      typeof recoveryRate === 'number' ? recoveryRate : undefined,
      typeof riskFreeRate === 'number' ? riskFreeRate : undefined
    );
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 8. Systemic Risk Index Route
citiConnectionContagionRouter.post('/systemic-risk/srisk', (req: Request, res: Response) => {
  try {
    const { bankEquity, bankLiabilities, marginalExpectedShortfall, systemicDropThreshold, prudentialCapitalRatio } = req.body;
    if (
      typeof bankEquity !== 'number' ||
      typeof bankLiabilities !== 'number' ||
      typeof marginalExpectedShortfall !== 'number' ||
      typeof systemicDropThreshold !== 'number' ||
      typeof prudentialCapitalRatio !== 'number'
    ) {
      return res.status(400).json({ error: "Invalid input parameters. All parameters must be numbers." });
    }

    const result = SystemicRiskIndex.calculateSRISK({
      bankEquity,
      bankLiabilities,
      marginalExpectedShortfall,
      systemicDropThreshold,
      prudentialCapitalRatio
    });
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 9. Capital Injection Optimizer Route
citiConnectionContagionRouter.post('/capital/optimize', (req: Request, res: Response) => {
  try {
    const { options, capitalShortfall } = req.body;
    if (!Array.isArray(options) || typeof capitalShortfall !== 'number') {
      return res.status(400).json({ error: "Invalid input parameters. Required: options (array), capitalShortfall (number)." });
    }

    const optimizer = new CapitalInjectionOptimizer();
    for (const option of options) {
      optimizer.addOption(option);
    }

    const result = optimizer.optimize(capitalShortfall);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

// 10. Fire Sale Contagion Model Route
citiConnectionContagionRouter.post('/fire-sale/simulate', (req: Request, res: Response) => {
  try {
    const { assets, sales } = req.body;
    if (!Array.isArray(assets) || !Array.isArray(sales)) {
      return res.status(400).json({ error: "Invalid input parameters. Required: assets (array of AssetClass), sales (array of sales)." });
    }

    const model = new FireSaleContagionModel();
    for (const asset of assets) {
      model.addAssetClass(asset);
    }

    const result = model.simulateFireSale(sales);
    return res.json(result);
  } catch (error: any) {
    return res.status(500).json({ error: error.message });
  }
});

export default citiConnectionContagionRouter;