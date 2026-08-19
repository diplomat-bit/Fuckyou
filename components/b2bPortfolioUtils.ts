

// --- CONSOLIDATED FROM: ./components/utils/b2bPortfolioUtils.ts ---

interface Asset {
  id: string;
  name: string;
  weight: number; // e.g., 0.4 for 40%
  expectedReturn: number; // annual expected return, e.g., 0.08 for 8%
  volatility: number; // annual volatility, e.g., 0.15 for 15%
  benchmarkBeta?: number; // beta relative to market benchmark, e.g., 1.1
}

interface CorrelationMatrix {
  [assetId1: string]: {
    [assetId2: string]: number;
  };
}

interface PortfolioMetrics {
  expectedReturn: number;
  volatility: number;
  sharpeRatio: number;
  var95: number; // 95% 1-year Value at Risk (as a positive loss percentage)
  cvar95: number; // 95% 1-year Conditional Value at Risk (Expected Shortfall)
  beta: number;
}

interface MonteCarloConfig {
  initialInvestment: number;
  years: number;
  simulations: number;
  annualContribution?: number;
  riskFreeRate?: number;
}

interface MonteCarloRun {
  year: number;
  p10: number;
  p50: number;
  p90: number;
}

interface StressScenario {
  id: string;
  name: string;
  description: string;
  assetShocks: { [assetId: string]: number }; // explicit shock per asset (e.g., -0.20 for -20%)
  marketShock: number; // fallback shock for assets without explicit shock, scaled by beta
}

interface StressTestResult {
  scenarioId: string;
  scenarioName: string;
  portfolioImpact: number; // expected portfolio return under stress (e.g., -0.12 for -12%)
  estimatedLossAmount: number; // loss in currency based on a reference portfolio value
  recoveryTimeMonths: number; // estimated months to recover based on expected return
}

/**
 * Generates a standard normal random variable using the Box-Muller transform.
 */
function randomNormal(): number {
  let u = 0, v = 0;
  while (u === 0) u = Math.random();
  while (v === 0) v = Math.random();
  return Math.sqrt(-2.0 * Math.log(u)) * Math.cos(2.0 * Math.PI * v);
}

/**
 * Normalizes asset weights so they sum to exactly 1.0.
 */
export function normalizeWeights(assets: Asset[]): Asset[] {
  const totalWeight = assets.reduce((sum, asset) => sum + asset.weight, 0);
  if (totalWeight === 0) return assets;
  return assets.map(asset => ({
    ...asset,
    weight: asset.weight / totalWeight,
  }));
}

/**
 * Calculates core portfolio metrics including expected return, volatility, Sharpe ratio, VaR, and CVaR.
 */
export function calculatePortfolioMetrics(
  assets: Asset[],
  correlationMatrix: CorrelationMatrix,
  riskFreeRate: number = 0.02
): PortfolioMetrics {
  if (assets.length === 0) {
    return { expectedReturn: 0, volatility: 0, sharpeRatio: 0, var95: 0, cvar95: 0, beta: 0 };
  }

  const normalized = normalizeWeights(assets);

  // 1. Portfolio Expected Return
  const expectedReturn = normalized.reduce(
    (sum, asset) => sum + asset.weight * asset.expectedReturn,
    0
  );

  // 2. Portfolio Volatility (using covariance matrix)
  let variance = 0;
  for (let i = 0; i < normalized.length; i++) {
    for (let j = 0; j < normalized.length; j++) {
      const assetI = normalized[i];
      const assetJ = normalized[j];
      const corr =
        i === j
          ? 1.0
          : correlationMatrix[assetI.id]?.[assetJ.id] ??
            correlationMatrix[assetJ.id]?.[assetI.id] ??
            0.0; // Default to uncorrelated if not specified

      variance +=
        assetI.weight *
        assetJ.weight *
        assetI.volatility *
        assetJ.volatility *
        corr;
    }
  }
  const volatility = Math.sqrt(variance);

  // 3. Sharpe Ratio
  const sharpeRatio = volatility > 0 ? (expectedReturn - riskFreeRate) / volatility : 0;

  // 4. Parametric Value at Risk (VaR) 95% 1-Year
  // Z-score for 95% confidence is ~1.645
  const z95 = 1.645;
  const var95 = Math.max(0, -(expectedReturn - z95 * volatility));

  // 5. Parametric Conditional Value at Risk (CVaR) 95% 1-Year
  // CVaR = -ExpectedReturn + Volatility * (pdf(Z) / (1 - alpha))
  // For alpha = 0.95, Z = 1.645. pdf(1.645) = e^(-1.645^2 / 2) / sqrt(2*pi) ≈ 0.103
  // pdf(Z) / 0.05 ≈ 2.06
  const cvar95 = Math.max(0, -(expectedReturn - 2.06 * volatility));

  // 6. Portfolio Beta (weighted average of asset betas)
  const beta = normalized.reduce(
    (sum, asset) => sum + asset.weight * (asset.benchmarkBeta ?? 1.0),
    0
  );

  return {
    expectedReturn,
    volatility,
    sharpeRatio,
    var95,
    cvar95,
    beta,
  };
}

/**
 * Runs a multi-year Monte Carlo simulation using Geometric Brownian Motion.
 * Supports annual contributions added at the end of each year.
 */
export function runMonteCarloProjection(
  metrics: PortfolioMetrics,
  config: MonteCarloConfig
): MonteCarloRun[] {
  const {
    initialInvestment,
    years,
    simulations,
    annualContribution = 0,
  } = config;

  const dt = 1; // annual steps
  const mu = metrics.expectedReturn;
  const sigma = metrics.volatility;

  // Initialize simulation matrix: [simulationIndex][yearIndex]
  const paths: number[][] = Array.from({ length: simulations }, () => [initialInvestment]);

  for (let sim = 0; sim < simulations; sim++) {
    let currentVal = initialInvestment;
    for (let year = 1; year <= years; year++) {
      // Geometric Brownian Motion step
      const drift = (mu - 0.5 * Math.pow(sigma, 2)) * dt;
      const diffusion = sigma * randomNormal() * Math.sqrt(dt);
      currentVal = currentVal * Math.exp(drift + diffusion);
      
      // Add annual contribution
      currentVal += annualContribution;
      
      // Prevent negative portfolio values
      currentVal = Math.max(0, currentVal);
      paths[sim].push(currentVal);
    }
  }

  // Calculate percentiles for each year
  const results: MonteCarloRun[] = [];
  for (let year = 0; year <= years; year++) {
    const valuesAtYear = paths.map(path => path[year]).sort((a, b) => a - b);
    
    const p10Idx = Math.floor(simulations * 0.10);
    const p50Idx = Math.floor(simulations * 0.50);
    const p90Idx = Math.floor(simulations * 0.90);

    results.push({
      year,
      p10: valuesAtYear[p10Idx],
      p50: valuesAtYear[p50Idx],
      p90: valuesAtYear[p90Idx],
    });
  }

  return results;
}

/**
 * Evaluates the impact of predefined or custom stress test scenarios on the portfolio.
 */
export function evaluateStressTests(
  assets: Asset[],
  scenarios: StressScenario[],
  referenceValue: number
): StressTestResult[] {
  const normalized = normalizeWeights(assets);

  return scenarios.map(scenario => {
    let portfolioImpact = 0;

    for (const asset of normalized) {
      let assetShock = scenario.assetShocks[asset.id];
      
      // If no explicit asset shock is defined, use the market shock scaled by the asset's beta
      if (assetShock === undefined) {
        const beta = asset.benchmarkBeta ?? 1.0;
        assetShock = scenario.marketShock * beta;
      }

      portfolioImpact += asset.weight * assetShock;
    }

    const estimatedLossAmount = Math.abs(portfolioImpact < 0 ? referenceValue * portfolioImpact : 0);
    
    // Estimate recovery time in months: Loss / Expected Monthly Return
    // Simple linear approximation: recovery = -portfolioImpact / (expectedAnnualReturn / 12)
    const expectedAnnualReturn = normalized.reduce((sum, a) => sum + a.weight * a.expectedReturn, 0);
    const monthlyReturn = expectedAnnualReturn / 12;
    
    let recoveryTimeMonths = 0;
    if (portfolioImpact < 0 && monthlyReturn > 0) {
      recoveryTimeMonths = Math.round(-portfolioImpact / monthlyReturn);
    }

    return {
      scenarioId: scenario.id,
      scenarioName: scenario.name,
      portfolioImpact,
      estimatedLossAmount,
      recoveryTimeMonths: Math.max(0, recoveryTimeMonths),
    };
  });
}

/**
 * Standard historical and hypothetical stress scenarios for B2B portfolio analysis.
 */
export const STANDARD_STRESS_SCENARIOS: StressScenario[] = [
  {
    id: "2008_financial_crisis",
    name: "2008 Financial Crisis",
    description: "Severe global banking liquidity crisis and equity market crash.",
    assetShocks: {},
    marketShock: -0.38,
  },
  {
    id: "dotcom_bubble",
    name: "Dot-Com Crash (2000)",
    description: "Massive sell-off in technology and growth stocks.",
    assetShocks: {
      tech: -0.55,
      growth: -0.40,
      value: -0.15,
      bonds: 0.08,
    },
    marketShock: -0.30,
  },
  {
    id: "inflation_shock",
    name: "Rapid Inflation & Rate Hike",
    description: "Sudden 300bps interest rate hike to combat high inflation.",
    assetShocks: {
      bonds: -0.12,
      real_estate: -0.15,
      tech: -0.20,
      commodities: 0.25,
    },
    marketShock: -0.10,
  },
  {
    id: "covid_crash",
    name: "COVID-19 Liquidity Shock (2020)",
    description: "Rapid global lockdown-induced market panic and swift recovery.",
    assetShocks: {},
    marketShock: -0.20,
  },
];

/**
 * Helper to generate a default correlation matrix for a list of assets.
 * Defaults to a moderate positive correlation (0.3) between different assets, and 1.0 for self.
 */
export function generateDefaultCorrelationMatrix(assetIds: string[]): CorrelationMatrix {
  const matrix: CorrelationMatrix = {};
  for (const id1 of assetIds) {
    matrix[id1] = {};
    for (const id2 of assetIds) {
      matrix[id1][id2] = id1 === id2 ? 1.0 : 0.3;
    }
  }
  return matrix;
}