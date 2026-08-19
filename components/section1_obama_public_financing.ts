

// --- CONSOLIDATED FROM: ./api/Obama Opts Out Of Public Financing (1)/section1_obama_public_financing.ts ---

import { Router, Request, Response } from 'express';

export interface CampaignBudget {
  publicGrant: number;
  privateRaised: number;
  complianceCosts: number;
  fundraisingCosts: number;
}

export interface SpendingComparison {
  publicNetSpendingPower: number;
  privateNetSpendingPower: number;
  difference: number;
  ratio: number;
  advantage: "Public" | "Private" | "Neutral";
  rationale: string;
}

/**
 * App 1: Public vs. Private Spending Calculator
 * Compares the net spending power of accepting the federal public financing grant
 * versus opting out to raise unlimited private contributions (factoring in fundraising overhead).
 */
export class PublicVsPrivateSpendingCalculator {
  public static calculate(budget: CampaignBudget): SpendingComparison {
    // Public financing has minimal fundraising costs but high compliance tracking costs
    const publicNet = budget.publicGrant - budget.complianceCosts;
    
    // Private fundraising has high fundraising costs (events, digital ads, direct mail) and compliance costs
    const privateNet = budget.privateRaised - budget.fundraisingCosts - budget.complianceCosts;
    
    const difference = privateNet - publicNet;
    const ratio = privateNet / (publicNet || 1);
    
    let advantage: "Public" | "Private" | "Neutral" = "Neutral";
    let rationale = "";

    if (difference > 10000000) {
      advantage = "Private";
      rationale = `Opting out provides a massive financial advantage of $${(difference / 1000000).toFixed(2)}M. The private fundraising engine far outpaces the public grant, even after accounting for fundraising overhead.`;
    } else if (difference < -10000000) {
      advantage = "Public";
      rationale = `Accepting public financing is highly advantageous. Private fundraising overhead of $${(budget.fundraisingCosts / 1000000).toFixed(2)}M would severely diminish net spending power compared to the guaranteed public grant.`;
    } else {
      rationale = "The financial difference is marginal. Strategic flexibility, donor engagement, and spending caps should dictate the decision.";
    }

    return {
      publicNetSpendingPower: publicNet,
      privateNetSpendingPower: privateNet,
      difference,
      ratio,
      advantage,
      rationale,
    };
  }
}


export interface HistoricalGrant {
  year: number;
  party: string;
  candidate: string;
  grantAmount: number;
  optedOut: boolean;
  privateAmountRaised?: number;
}

/**
 * App 2: Historical Public Funding Tracker
 * Tracks and analyzes major party presidential nominees' public funding choices and amounts from 1976 to 2008.
 */
export class HistoricalPublicFundingTracker {
  private static database: HistoricalGrant[] = [
    { year: 1976, party: "Democratic", candidate: "Jimmy Carter", grantAmount: 21800000, optedOut: false },
    { year: 1976, party: "Republican", candidate: "Gerald Ford", grantAmount: 21800000, optedOut: false },
    { year: 1980, party: "Democratic", candidate: "Jimmy Carter", grantAmount: 29400000, optedOut: false },
    { year: 1980, party: "Republican", candidate: "Ronald Reagan", grantAmount: 29400000, optedOut: false },
    { year: 1984, party: "Democratic", candidate: "Walter Mondale", grantAmount: 40400000, optedOut: false },
    { year: 1984, party: "Republican", candidate: "Ronald Reagan", grantAmount: 40400000, optedOut: false },
    { year: 1988, party: "Democratic", candidate: "Michael Dukakis", grantAmount: 46100000, optedOut: false },
    { year: 1988, party: "Republican", candidate: "George H.W. Bush", grantAmount: 46100000, optedOut: false },
    { year: 1992, party: "Democratic", candidate: "Bill Clinton", grantAmount: 55200000, optedOut: false },
    { year: 1992, party: "Republican", candidate: "George H.W. Bush", grantAmount: 55200000, optedOut: false },
    { year: 1996, party: "Democratic", candidate: "Bill Clinton", grantAmount: 62600000, optedOut: false },
    { year: 1996, party: "Republican", candidate: "Bob Dole", grantAmount: 62600000, optedOut: false },
    { year: 2000, party: "Democratic", candidate: "Al Gore", grantAmount: 67600000, optedOut: false },
    { year: 2000, party: "Republican", candidate: "George W. Bush", grantAmount: 67600000, optedOut: false },
    { year: 2004, party: "Democratic", candidate: "John Kerry", grantAmount: 74600000, optedOut: false },
    { year: 2004, party: "Republican", candidate: "George W. Bush", grantAmount: 74600000, optedOut: false },
    { year: 2008, party: "Democratic", candidate: "Barack Obama", grantAmount: 84100000, optedOut: true, privateAmountRaised: 745700000 },
    { year: 2008, party: "Republican", candidate: "John McCain", grantAmount: 84100000, optedOut: false }
  ];

  public static getGrantsByYear(year: number): HistoricalGrant[] {
    return this.database.filter(g => g.year === year);
  }

  public static getOptOutStats() {
    const totalCandidates = this.database.length;
    const optedOutCandidates = this.database.filter(g => g.optedOut);
    return {
      totalCandidates,
      optedOutCount: optedOutCandidates.length,
      optOutRate: optedOutCandidates.length / totalCandidates,
      optedOutList: optedOutCandidates
    };
  }

  public static calculateGrowthRate(startYear: number, endYear: number): number {
    const startGrants = this.getGrantsByYear(startYear);
    const endGrants = this.getGrantsByYear(endYear);
    if (startGrants.length === 0 || endGrants.length === 0) return 0;
    
    const startVal = startGrants[0].grantAmount;
    const endVal = endGrants[0].grantAmount;
    return Math.pow(endVal / startVal, 1 / ((endYear - startYear) / 4)) - 1;
  }
}


export interface DonorTier {
  name: string;
  minContribution: number;
  maxContribution: number;
  estimatedDonorCount: number;
  averageContribution: number;
}

export interface SimulationResult {
  tierName: string;
  totalRaised: number;
  percentageOfTotal: number;
}

/**
 * App 3: Donor Contribution Simulator
 * Simulates fundraising potential based on donor tiers, modeling Obama's 2008 grassroots strategy.
 */
export class DonorContributionSimulator {
  public static simulate(tiers: DonorTier[]): {
    results: SimulationResult[];
    grandTotal: number;
    averageDonationSize: number;
    smallDonorPercentage: number; // Percentage of funds from donors contributing <= $200
  } {
    let grandTotal = 0;
    let totalDonors = 0;
    let smallDonorFunds = 0;

    const results: SimulationResult[] = tiers.map(tier => {
      const totalRaised = tier.estimatedDonorCount * tier.averageContribution;
      grandTotal += totalRaised;
      totalDonors += tier.estimatedDonorCount;

      if (tier.maxContribution <= 200) {
        smallDonorFunds += totalRaised;
      }

      return {
        tierName: tier.name,
        totalRaised,
        percentageOfTotal: 0 // Will calculate below
      };
    });

    results.forEach(r => {
      r.percentageOfTotal = grandTotal > 0 ? (r.totalRaised / grandTotal) * 100 : 0;
    });

    return {
      results,
      grandTotal,
      averageDonationSize: totalDonors > 0 ? grandTotal / totalDonors : 0,
      smallDonorPercentage: grandTotal > 0 ? (smallDonorFunds / grandTotal) * 100 : 0
    };
  }
}


export interface AdChannel {
  name: string;
  cpm: number; // Cost Per Mille (Thousand Impressions)
  allocationPercentage: number;
  effectivenessMultiplier: number; // 1.0 is baseline
}

export interface AdEfficiencyReport {
  channelName: string;
  allocatedBudget: number;
  estimatedImpressions: number;
  effectiveImpressions: number;
}

/**
 * App 4: Ad Buy Efficiency Modeler
 * Models advertising reach and efficiency based on budget allocations across different media channels.
 */
export class AdBuyEfficiencyModeler {
  public static model(totalBudget: number, channels: AdChannel[]): {
    reports: AdEfficiencyReport[];
    totalImpressions: number;
    totalEffectiveImpressions: number;
    averageCpm: number;
  } {
    let totalImpressions = 0;
    let totalEffectiveImpressions = 0;

    const reports: AdEfficiencyReport[] = channels.map(channel => {
      const allocatedBudget = totalBudget * (channel.allocationPercentage / 100);
      const estimatedImpressions = (allocatedBudget / channel.cpm) * 1000;
      const effectiveImpressions = estimatedImpressions * channel.effectivenessMultiplier;

      totalImpressions += estimatedImpressions;
      totalEffectiveImpressions += effectiveImpressions;

      return {
        channelName: channel.name,
        allocatedBudget,
        estimatedImpressions,
        effectiveImpressions
      };
    });

    const averageCpm = totalImpressions > 0 ? (totalBudget / totalImpressions) * 1000 : 0;

    return {
      reports,
      totalImpressions,
      totalEffectiveImpressions,
      averageCpm
    };
  }
}


export interface DecisionMetrics {
  grassrootsSupportScore: number; // 1 to 10
  pollingLeadPercentage: number; // e.g. 5 for +5%
  opponentFundraisingStrength: "Low" | "Medium" | "High";
  publicFundingCap: number;
  projectedPrivateFundraising: number;
}

/**
 * App 5: Opt-Out Decision Matrix
 * Evaluates whether a presidential candidate should opt out of public financing based on key strategic metrics.
 */
export class OptOutDecisionMatrix {
  public static evaluate(metrics: DecisionMetrics): {
    recommendation: "OPT OUT" | "ACCEPT PUBLIC FINANCING" | "BORDERLINE";
    score: number; // 0 to 100
    analysis: string[];
  } {
    let score = 0;
    const analysis: string[] = [];

    // 1. Grassroots Support (Max 30 points)
    const grassrootsPoints = metrics.grassrootsSupportScore * 3;
    score += grassrootsPoints;
    analysis.push(`Grassroots support score of ${metrics.grassrootsSupportScore}/10 adds ${grassrootsPoints} points.`);

    // 2. Polling Lead (Max 20 points)
    let pollingPoints = 10; // baseline
    if (metrics.pollingLeadPercentage > 10) pollingPoints = 20;
    else if (metrics.pollingLeadPercentage > 0) pollingPoints = 15;
    else if (metrics.pollingLeadPercentage < -5) pollingPoints = 5;
    score += pollingPoints;
    analysis.push(`Polling lead of ${metrics.pollingLeadPercentage}% adds ${pollingPoints} points.`);

    // 3. Opponent Fundraising Strength (Max 20 points)
    let opponentPoints = 0;
    if (metrics.opponentFundraisingStrength === "High") {
      opponentPoints = 20; // High pressure to opt out to keep pace
      analysis.push("Opponent fundraising is High. High pressure to opt out to avoid being outspent. (+20 points)");
    } else if (metrics.opponentFundraisingStrength === "Medium") {
      opponentPoints = 10;
      analysis.push("Opponent fundraising is Medium. Moderate pressure to opt out. (+10 points)");
    } else {
      opponentPoints = 5;
      analysis.push("Opponent fundraising is Low. Low pressure to opt out. (+5 points)");
    }
    score += opponentPoints;

    // 4. Financial Advantage Ratio (Max 30 points)
    const ratio = metrics.projectedPrivateFundraising / metrics.publicFundingCap;
    let ratioPoints = 0;
    if (ratio > 5) {
      ratioPoints = 30;
      analysis.push(`Projected private fundraising ($${(metrics.projectedPrivateFundraising / 1000000).toFixed(1)}M) is over 5x the public cap ($${(metrics.publicFundingCap / 1000000).toFixed(1)}M). Overwhelming financial advantage. (+30 points)`);
    } else if (ratio > 2) {
      ratioPoints = 20;
      analysis.push(`Projected private fundraising is over 2x the public cap. Strong financial advantage. (+20 points)`);
    } else if (ratio > 1) {
      ratioPoints = 10;
      analysis.push(`Projected private fundraising exceeds the public cap. Moderate financial advantage. (+10 points)`);
    } else {
      ratioPoints = 0;
      analysis.push("Projected private fundraising is less than the public cap. No financial advantage to opting out. (+0 points)");
    }
    score += ratioPoints;

    let recommendation: "OPT OUT" | "ACCEPT PUBLIC FINANCING" | "BORDERLINE" = "BORDERLINE";
    if (score >= 70) {
      recommendation = "OPT OUT";
    } else if (score < 45) {
      recommendation = "ACCEPT PUBLIC FINANCING";
    }

    return {
      recommendation,
      score,
      analysis
    };
  }
}


export interface CampaignTimeline {
  startDate: Date;
  electionDate: Date;
  currentDate: Date;
}

/**
 * App 6: Campaign Burn Rate Calculator
 * Tracks daily spending velocity, remaining runway, and projected surplus/deficit.
 */
export class CampaignBurnRateCalculator {
  public static calculate(
    totalBudget: number,
    spentToDate: number,
    timeline: CampaignTimeline
  ): {
    daysElapsed: number;
    daysRemaining: number;
    burnRatePerDay: number;
    projectedTotalRequired: number;
    runwayDays: number;
    status: "Healthy" | "Warning" | "Critical";
  } {
    const msPerDay = 24 * 60 * 60 * 1000;
    const daysElapsed = Math.max(1, Math.round((timeline.currentDate.getTime() - timeline.startDate.getTime()) / msPerDay));
    const daysRemaining = Math.max(0, Math.round((timeline.electionDate.getTime() - timeline.currentDate.getTime()) / msPerDay));

    const burnRatePerDay = spentToDate / daysElapsed;
    const remainingBudget = totalBudget - spentToDate;
    const projectedTotalRequired = spentToDate + (burnRatePerDay * daysRemaining);
    const runwayDays = burnRatePerDay > 0 ? remainingBudget / burnRatePerDay : 9999;

    let status: "Healthy" | "Warning" | "Critical" = "Healthy";
    if (runwayDays < daysRemaining) {
      status = runwayDays < (daysRemaining * 0.5) ? "Critical" : "Warning";
    }

    return {
      daysElapsed,
      daysRemaining,
      burnRatePerDay,
      projectedTotalRequired,
      runwayDays,
      status
    };
  }
}


/**
 * App 7: Inflation Adjuster
 * Adjusts historical campaign finance limits and grants using historical CPI estimates.
 */
export class InflationAdjuster {
  // Approximate CPI values relative to 1982-1984 baseline (100)
  private static cpiDatabase: { [year: number]: number } = {
    1974: 49.3,
    1976: 56.9,
    1980: 82.4,
    1984: 103.9,
    1988: 118.3,
    1992: 140.3,
    1996: 156.9,
    2000: 172.2,
    2004: 188.9,
    2008: 215.303,
    2012: 229.594,
    2016: 240.007,
    2020: 258.811,
    2024: 314.1 // Estimated/Projected
  };

  public static adjust(amount: number, fromYear: number, toYear: number): number {
    const fromCpi = this.cpiDatabase[fromYear];
    const toCpi = this.cpiDatabase[toYear];

    if (!fromCpi || !toCpi) {
      throw new Error(`CPI data not available for years: ${fromYear} or ${toYear}`);
    }

    return amount * (toCpi / fromCpi);
  }
}


export interface SwingState {
  name: string;
  electoralVotes: number;
  competitivenessIndex: number; // 1 (safe) to 10 (extremely competitive)
  mediaCostIndex: number; // 1 (cheap) to 10 (extremely expensive)
}

export interface StateAllocation {
  stateName: string;
  allocatedBudget: number;
  percentageOfTotal: number;
}

/**
 * App 8: Swing State Resource Allocator
 * Allocates a campaign's advertising and field budget across key swing states based on electoral weight and competitiveness.
 */
export class SwingStateResourceAllocator {
  public static allocate(totalBudget: number, states: SwingState[]): StateAllocation[] {
    // Calculate allocation weight for each state: electoralVotes * competitivenessIndex * mediaCostIndex
    const weightedStates = states.map(state => {
      const weight = state.electoralVotes * state.competitivenessIndex * state.mediaCostIndex;
      return { state, weight };
    });

    const totalWeight = weightedStates.reduce((sum, item) => sum + item.weight, 0);

    return weightedStates.map(item => {
      const allocatedBudget = totalWeight > 0 ? (item.weight / totalWeight) * totalBudget : 0;
      const percentageOfTotal = totalBudget > 0 ? (allocatedBudget / totalBudget) * 100 : 0;

      return {
        stateName: item.state.name,
        allocatedBudget,
        percentageOfTotal
      };
    });
  }
}


export interface TargetDemographics {
  youthPercentage: number; // 18-29
  middleAgePercentage: number; // 30-64
  seniorPercentage: number; // 65+
}

export interface MediaMix {
  television: number; // percentage
  digital: number; // percentage
  radio: number; // percentage
  printAndDirectMail: number; // percentage
}

/**
 * App 9: Media Mix Optimizer
 * Optimizes the campaign's media budget allocation based on target voter demographics.
 * Reflects Obama's pioneering shift toward digital media in 2008.
 */
export class MediaMixOptimizer {
  public static optimize(demographics: TargetDemographics): MediaMix {
    // Youth heavily favors digital
    // Seniors heavily favor TV and Print
    // Middle age is balanced

    let digital = (demographics.youthPercentage * 0.6) + (demographics.middleAgePercentage * 0.2) + (demographics.seniorPercentage * 0.05);
    let television = (demographics.youthPercentage * 0.2) + (demographics.middleAgePercentage * 0.5) + (demographics.seniorPercentage * 0.6);
    let printAndDirectMail = (demographics.youthPercentage * 0.05) + (demographics.middleAgePercentage * 0.15) + (demographics.seniorPercentage * 0.25);
    let radio = (demographics.youthPercentage * 0.15) + (demographics.middleAgePercentage * 0.15) + (demographics.seniorPercentage * 0.1);

    // Normalize to 100%
    const total = digital + television + printAndDirectMail + radio;
    if (total > 0) {
      digital = (digital / total) * 100;
      television = (television / total) * 100;
      printAndDirectMail = (printAndDirectMail / total) * 100;
      radio = (radio / total) * 100;
    }

    return {
      television,
      digital,
      radio,
      printAndDirectMail
    };
  }
}


export interface FundraisingEvent {
  day: number;
  amountRaised: number;
  isViralSpike: boolean;
}

/**
 * App 10: Fundraising Velocity Tracker
 * Simulates and analyzes the acceleration of daily donations, identifying viral fundraising loops.
 */
export class FundraisingVelocityTracker {
  public static analyze(events: FundraisingEvent[]): {
    totalRaised: number;
    averageDailyRate: number;
    velocityTrend: "Accelerating" | "Stable" | "Decelerating";
    viralSpikesCount: number;
    momentumCoefficient: number; // Ratio of viral spike fundraising to baseline fundraising
  } {
    const totalRaised = events.reduce((sum, e) => sum + e.amountRaised, 0);
    const averageDailyRate = events.length > 0 ? totalRaised / events.length : 0;

    const viralSpikes = events.filter(e => e.isViralSpike);
    const baselineEvents = events.filter(e => !e.isViralSpike);

    const averageViralAmount = viralSpikes.length > 0 
      ? viralSpikes.reduce((sum, e) => sum + e.amountRaised, 0) / viralSpikes.length 
      : 0;

    const averageBaselineAmount = baselineEvents.length > 0 
      ? baselineEvents.reduce((sum, e) => sum + e.amountRaised, 0) / baselineEvents.length 
      : 1;

    const momentumCoefficient = averageBaselineAmount > 0 ? averageViralAmount / averageBaselineAmount : 0;

    // Determine velocity trend by comparing first half to second half of events
    let velocityTrend: "Accelerating" | "Stable" | "Decelerating" = "Stable";
    if (events.length >= 4) {
      const midPoint = Math.floor(events.length / 2);
      const firstHalf = events.slice(0, midPoint);
      const secondHalf = events.slice(midPoint);

      const firstHalfAvg = firstHalf.reduce((sum, e) => sum + e.amountRaised, 0) / firstHalf.length;
      const secondHalfAvg = secondHalf.reduce((sum, e) => sum + e.amountRaised, 0) / secondHalf.length;

      const differenceRatio = secondHalfAvg / (firstHalfAvg || 1);
      if (differenceRatio > 1.1) {
        velocityTrend = "Accelerating";
      } else if (differenceRatio < 0.9) {
        velocityTrend = "Decelerating";
      }
    }

    return {
      totalRaised,
      averageDailyRate,
      velocityTrend,
      viralSpikesCount: viralSpikes.length,
      momentumCoefficient
    };
  }
}

// ==========================================
// API ROUTES & CONTROLLERS (EXPRESS ROUTER)
// ==========================================

const router = Router();

/**
 * Helper to handle async route errors cleanly
 */
const asyncHandler = (fn: (req: Request, res: Response) => Promise<any> | any) => {
  return async (req: Request, res: Response) => {
    try {
      await fn(req, res);
    } catch (error: any) {
      res.status(500).json({
        success: false,
        error: error.message || "Internal Server Error"
      });
    }
  };
};

/**
 * POST /api/spending-calculator
 * Body: CampaignBudget
 */
router.post('/spending-calculator', asyncHandler((req: Request, res: Response) => {
  const { publicGrant, privateRaised, complianceCosts, fundraisingCosts } = req.body;
  if (
    typeof publicGrant !== 'number' ||
    typeof privateRaised !== 'number' ||
    typeof complianceCosts !== 'number' ||
    typeof fundraisingCosts !== 'number'
  ) {
    return res.status(400).json({ success: false, error: "Invalid input parameters. All fields must be numbers." });
  }
  const result = PublicVsPrivateSpendingCalculator.calculate({
    publicGrant,
    privateRaised,
    complianceCosts,
    fundraisingCosts
  });
  return res.json({ success: true, data: result });
}));

/**
 * GET /api/historical-grants
 * Query: year (optional)
 */
router.get('/historical-grants', asyncHandler((req: Request, res: Response) => {
  const yearStr = req.query.year as string;
  if (yearStr) {
    const year = parseInt(yearStr, 10);
    if (isNaN(year)) {
      return res.status(400).json({ success: false, error: "Year must be a valid number." });
    }
    const grants = HistoricalPublicFundingTracker.getGrantsByYear(year);
    return res.json({ success: true, data: grants });
  }
  const stats = HistoricalPublicFundingTracker.getOptOutStats();
  return res.json({ success: true, data: stats });
}));

/**
 * GET /api/historical-grants/growth
 * Query: startYear, endYear
 */
router.get('/historical-grants/growth', asyncHandler((req: Request, res: Response) => {
  const { startYear, endYear } = req.query;
  if (!startYear || !endYear) {
    return res.status(400).json({ success: false, error: "Both startYear and endYear are required." });
  }
  const start = parseInt(startYear as string, 10);
  const end = parseInt(endYear as string, 10);
  if (isNaN(start) || isNaN(end)) {
    return res.status(400).json({ success: false, error: "Years must be valid numbers." });
  }
  const growthRate = HistoricalPublicFundingTracker.calculateGrowthRate(start, end);
  return res.json({ success: true, data: { startYear: start, endYear: end, growthRate } });
}));

/**
 * POST /api/donor-simulator
 * Body: { tiers: DonorTier[] }
 */
router.post('/donor-simulator', asyncHandler((req: Request, res: Response) => {
  const { tiers } = req.body;
  if (!Array.isArray(tiers)) {
    return res.status(400).json({ success: false, error: "Tiers must be an array of DonorTier objects." });
  }
  const result = DonorContributionSimulator.simulate(tiers);
  return res.json({ success: true, data: result });
}));

/**
 * POST /api/ad-efficiency
 * Body: { totalBudget: number, channels: AdChannel[] }
 */
router.post('/ad-efficiency', asyncHandler((req: Request, res: Response) => {
  const { totalBudget, channels } = req.body;
  if (typeof totalBudget !== 'number' || !Array.isArray(channels)) {
    return res.status(400).json({ success: false, error: "Invalid input. totalBudget must be a number and channels must be an array." });
  }
  const result = AdBuyEfficiencyModeler.model(totalBudget, channels);
  return res.json({ success: true, data: result });
}));

/**
 * POST /api/opt-out-matrix
 * Body: DecisionMetrics
 */
router.post('/opt-out-matrix', asyncHandler((req: Request, res: Response) => {
  const { grassrootsSupportScore, pollingLeadPercentage, opponentFundraisingStrength, publicFundingCap, projectedPrivateFundraising } = req.body;
  if (
    typeof grassrootsSupportScore !== 'number' ||
    typeof pollingLeadPercentage !== 'number' ||
    !["Low", "Medium", "High"].includes(opponentFundraisingStrength) ||
    typeof publicFundingCap !== 'number' ||
    typeof projectedPrivateFundraising !== 'number'
  ) {
    return res.status(400).json({ success: false, error: "Invalid DecisionMetrics payload." });
  }
  const result = OptOutDecisionMatrix.evaluate({
    grassrootsSupportScore,
    pollingLeadPercentage,
    opponentFundraisingStrength,
    publicFundingCap,
    projectedPrivateFundraising
  });
  return res.json({ success: true, data: result });
}));

/**
 * POST /api/burn-rate
 * Body: { totalBudget: number, spentToDate: number, timeline: { startDate: string, electionDate: string, currentDate: string } }
 */
router.post('/burn-rate', asyncHandler((req: Request, res: Response) => {
  const { totalBudget, spentToDate, timeline } = req.body;
  if (
    typeof totalBudget !== 'number' ||
    typeof spentToDate !== 'number' ||
    !timeline ||
    !timeline.startDate ||
    !timeline.electionDate ||
    !timeline.currentDate
  ) {
    return res.status(400).json({ success: false, error: "Invalid burn rate parameters." });
  }
  const result = CampaignBurnRateCalculator.calculate(
    totalBudget,
    spentToDate,
    {
      startDate: new Date(timeline.startDate),
      electionDate: new Date(timeline.electionDate),
      currentDate: new Date(timeline.currentDate)
    }
  );
  return res.json({ success: true, data: result });
}));

/**
 * POST /api/inflation-adjuster
 * Body: { amount: number, fromYear: number, toYear: number }
 */
router.post('/inflation-adjuster', asyncHandler((req: Request, res: Response) => {
  const { amount, fromYear, toYear } = req.body;
  if (typeof amount !== 'number' || typeof fromYear !== 'number' || typeof toYear !== 'number') {
    return res.status(400).json({ success: false, error: "All parameters (amount, fromYear, toYear) must be numbers." });
  }
  const adjustedAmount = InflationAdjuster.adjust(amount, fromYear, toYear);
  return res.json({ success: true, data: { originalAmount: amount, adjustedAmount, fromYear, toYear } });
}));

/**
 * POST /api/swing-state-allocator
 * Body: { totalBudget: number, states: SwingState[] }
 */
router.post('/swing-state-allocator', asyncHandler((req: Request, res: Response) => {
  const { totalBudget, states } = req.body;
  if (typeof totalBudget !== 'number' || !Array.isArray(states)) {
    return res.status(400).json({ success: false, error: "totalBudget must be a number and states must be an array." });
  }
  const allocation = SwingStateResourceAllocator.allocate(totalBudget, states);
  return res.json({ success: true, data: allocation });
}));

/**
 * POST /api/media-mix-optimizer
 * Body: TargetDemographics
 */
router.post('/media-mix-optimizer', asyncHandler((req: Request, res: Response) => {
  const { youthPercentage, middleAgePercentage, seniorPercentage } = req.body;
  if (typeof youthPercentage !== 'number' || typeof middleAgePercentage !== 'number' || typeof seniorPercentage !== 'number') {
    return res.status(400).json({ success: false, error: "Demographics percentages must be numbers." });
  }
  const optimizedMix = MediaMixOptimizer.optimize({ youthPercentage, middleAgePercentage, seniorPercentage });
  return res.json({ success: true, data: optimizedMix });
}));

/**
 * POST /api/fundraising-velocity
 * Body: { events: FundraisingEvent[] }
 */
router.post('/fundraising-velocity', asyncHandler((req: Request, res: Response) => {
  const { events } = req.body;
  if (!Array.isArray(events)) {
    return res.status(400).json({ success: false, error: "Events must be an array of FundraisingEvent objects." });
  }
  const analysis = FundraisingVelocityTracker.analyze(events);
  return res.json({ success: true, data: analysis });
}));

export default router;