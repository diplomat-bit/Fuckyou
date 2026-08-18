export type AssetClass =
  | 'Equity'
  | 'Fixed Income'
  | 'Cash'
  | 'Alternatives'
  | 'Real Estate'
  | 'Commodities'
  | 'Crypto';

export interface Holding {
  id: string;
  ticker: string;
  name: string;
  assetClass: AssetClass;
  sector?: string;
  region?: string;
  quantity: number;
  price: number;
  value: number; // quantity * price
  allocation: number; // percentage (0 to 100)
  costBasis?: number;
  unrealizedGainLoss?: number;
  unrealizedGainLossPercent?: number;
}

export interface PortfolioMetrics {
  totalValue: number;
  ytdReturn: number;
  oneYearReturn: number;
  threeYearReturn?: number;
  volatility: number; // annualized standard deviation
  sharpeRatio: number;
  sortinoRatio?: number;
  beta: number; // relative to benchmark
  alpha?: number;
  maxDrawdown: number;
  dividendYield: number;
  esgScore?: number; // 0-100 scale
  trackingError?: number;
  informationRatio?: number;
  valueAtRisk?: {
    confidenceLevel: number; // e.g., 0.95 or 0.99
    horizonDays: number;
    amount: number;
    percent: number;
  };
}

export interface Portfolio {
  id: string;
  name: string;
  clientId: string;
  clientName: string;
  description?: string;
  currency: string; // e.g., 'USD', 'EUR', 'GBP'
  holdings: Holding[];
  metrics?: PortfolioMetrics;
  createdAt: string; // ISO date string
  updatedAt: string; // ISO date string
  lastRebalancedAt?: string; // ISO date string
  status: 'Active' | 'Draft' | 'Archived';
}

export interface MarketShock {
  assetClass: AssetClass | 'All';
  shockPercent: number; // e.g., -20 for a 20% drop
}

export interface StressScenario {
  id: string;
  name: string;
  description: string;
  category: 'Macroeconomic' | 'Geopolitical' | 'Historical' | 'Custom';
  shocks: MarketShock[];
  isPredefined: boolean;
}

export interface AssetClassImpact {
  assetClass: AssetClass;
  preValue: number;
  postValue: number;
  impactValue: number;
  impactPercent: number;
}

export interface StressTestResult {
  scenarioId: string;
  scenarioName: string;
  portfolioId: string;
  preStressValue: number;
  postStressValue: number;
  estimatedImpactValue: number; // negative for loss
  estimatedImpactPercent: number; // negative for loss
  assetClassImpacts: AssetClassImpact[];
  runDate: string; // ISO date string
}

export interface SimulationParams {
  horizonYears: number;
  numberOfSimulations: number;
  confidenceIntervals: number[]; // e.g., [10, 50, 90]
  initialInvestment: number;
  recurringContribution?: {
    amount: number;
    frequency: 'Monthly' | 'Quarterly' | 'Annually';
  };
}

export interface SimulationDataPoint {
  year: number;
  percentile10: number;
  percentile50: number; // Median
  percentile90: number;
  mean?: number;
}

export interface SimulationResult {
  portfolioId: string;
  params: SimulationParams;
  trajectory: SimulationDataPoint[];
  probabilityOfMeetingTarget: number; // 0 to 100
  targetAmount?: number;
  expectedEndingValue: number;
  worstCaseEndingValue: number; // e.g., 10th percentile
  bestCaseEndingValue: number; // e.g., 90th percentile
  runDate: string; // ISO date string
}

export interface PortfolioComparison {
  portfolios: Portfolio[];
  metricsComparison: {
    metricName: string;
    values: { [portfolioId: string]: number | string };
  }[];
  assetAllocationComparison: {
    assetClass: AssetClass;
    allocations: { [portfolioId: string]: number }; // percentage
  }[];
}