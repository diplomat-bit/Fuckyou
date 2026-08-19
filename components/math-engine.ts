

// --- CONSOLIDATED FROM: ./api/utils/math-engine.ts ---

import { Router, Request, Response } from 'express';
import DecimalImport, { type Decimal } from 'decimal.js';
const Decimal = (DecimalImport as any)?.Decimal || DecimalImport;

/**
 * High-precision financial, quantitative, real estate, and macroeconomic math engine.
 * Powered by arbitrary-precision decimal arithmetic (40 digits) to power high-frequency
 * banking transactions, real-estate acquisitions, risk scoring, sovereign central banking,
 * and quantitative paper-grounded AI intelligence.
 */

Decimal.set({ precision: 40, rounding: Decimal.ROUND_HALF_UP });

// ============================================================================
// ACADEMIC BIBLIOGRAPHY METADATA & PAPER DATASTRUCTURES
// ============================================================================

export interface ResearchPaper {
  id: string;
  title: string;
  authors: string[];
  year: number;
  journal: string;
  doi: string;
  category: 'Quantitative Finance' | 'Structural Credit Risk' | 'Macroeconomics & Sovereign' | 'Real Estate & Hedonic Pricing' | 'Portfolio Management';
  abstract: string;
  mathematicalFormulas: {
    name: string;
    latex: string;
    description: string;
  }[];
  bankingApplication: string;
  sovereignApplication: string;
}

export const ACADEMIC_BIBLIOGRAPHY: ResearchPaper[] = [
  {
    id: 'merton-1974',
    title: 'On the Pricing of Corporate Debt: The Risk Structure of Interest Rates',
    authors: ['Robert C. Merton'],
    year: 1974,
    journal: 'The Journal of Finance, Vol. 29, No. 2, pp. 449-470',
    doi: '10.1111/j.1540-6261.1974.tb03058.x',
    category: 'Structural Credit Risk',
    abstract: 'Presents the structural model of corporate default where equity is viewed as a European call option on firm assets with strike price equal to the face value of debt. Enables high-precision structural probability of default (PD) estimation for corporate and sovereign borrowing.',
    mathematicalFormulas: [
      {
        name: 'Distance to Default (d2)',
        latex: 'd_2 = \\frac{\\ln(V/D) + (r - \\sigma_V^2 / 2)T}{\\sigma_V \\sqrt{T}}',
        description: 'Measures the number of standard deviations firm asset value V is away from debt default threshold D.'
      },
      {
        name: 'Default Probability (PD)',
        latex: 'PD = \\Phi(-d_2) = 1 - \\Phi(d_2)',
        description: 'Cumulative standard normal distribution evaluating probability of asset value falling below liability face value at maturity.'
      }
    ],
    bankingApplication: 'Underwrites enterprise loan default probabilities and automated collateral risk pricing in real-time.',
    sovereignApplication: 'Evaluates sovereign debt default risk and national central bank balance sheet resilience.'
  },
  {
    id: 'black-scholes-1973',
    title: 'The Pricing of Options and Corporate Liabilities',
    authors: ['Fischer Black', 'Myron Scholes'],
    year: 1973,
    journal: 'Journal of Political Economy, Vol. 81, No. 3, pp. 637-654',
    doi: '10.1086/260062',
    category: 'Quantitative Finance',
    abstract: 'Foundational framework for closed-form option pricing and arbitrage-free derivative hedging. Provides analytical solution for European call and put option values under geometric Brownian motion.',
    mathematicalFormulas: [
      {
        name: 'Black-Scholes Call Price',
        latex: 'C(S, t) = S_0 \\Phi(d_1) - K e^{-r T} \\Phi(d_2)',
        description: 'Exact analytical price for European call option with spot price S_0, strike price K, risk-free rate r, and volatility sigma.'
      },
      {
        name: 'd1 Calculation',
        latex: 'd_1 = \\frac{\\ln(S_0 / K) + (r + \\sigma^2 / 2) T}{\\sigma \\sqrt{T}}',
        description: 'Standardized log-price ratio adjusted for drift and variance over time horizon T.'
      }
    ],
    bankingApplication: 'Hedges treasury interest rate swaps, derivative asset valuation, and automated option vault pricing.',
    sovereignApplication: 'Prices sovereign currency options, inflation guarantees, and emergency stabilization derivatives.'
  },
  {
    id: 'markowitz-1952',
    title: 'Portfolio Selection',
    authors: ['Harry Markowitz'],
    year: 1952,
    journal: 'The Journal of Finance, Vol. 7, No. 1, pp. 77-91',
    doi: '10.1111/j.1540-6261.1952.tb01525.x',
    category: 'Portfolio Management',
    abstract: 'Introduces Modern Portfolio Theory (MPT) proving mean-variance optimization reduces portfolio variance without sacrificing expected return through asset return covariances.',
    mathematicalFormulas: [
      {
        name: 'Sharpe Ratio',
        latex: 'SR = \\frac{E[R_p] - R_f}{\\sigma_p}',
        description: 'Risk-adjusted return ratio measuring excess return per unit of total risk.'
      },
      {
        name: 'Portfolio Variance',
        latex: '\\sigma_p^2 = w^T \\Sigma w',
        description: 'Quadratic formulation of total portfolio variance given weight vector w and covariance matrix Sigma.'
      }
    ],
    bankingApplication: 'Automated AI asset wealth management, dynamic rebalancing, and liquidity pool optimization.',
    sovereignApplication: 'Manages Sovereign Wealth Funds (SWF) assets across global treasury holdings.'
  },
  {
    id: 'altman-1968',
    title: 'Financial Ratios, Discriminant Analysis and the Prediction of Corporate Bankruptcy',
    authors: ['Edward I. Altman'],
    year: 1968,
    journal: 'The Journal of Finance, Vol. 23, No. 4, pp. 589-609',
    doi: '10.1111/j.1540-6261.1968.tb00843.x',
    category: 'Structural Credit Risk',
    abstract: 'Multivariate statistical model utilizing 5 key balance sheet ratios to compute Z-Score predicting probability of enterprise bankruptcy within 2 years.',
    mathematicalFormulas: [
      {
        name: 'Altman Z-Score',
        latex: 'Z = 1.2 X_1 + 1.4 X_2 + 3.3 X_3 + 0.6 X_4 + 0.999 X_5',
        description: 'Weighted combination of Working Capital, Retained Earnings, EBIT, Market Cap / Debt, and Asset Turnover.'
      }
    ],
    bankingApplication: 'Instant commercial loan approval decisions and automated corporate insolvency checks.',
    sovereignApplication: 'Monitors state-owned enterprise health and systemic banking system contagion.'
  },
  {
    id: 'rosen-1974',
    title: 'Hedonic Prices and Implicit Markets: Product Differentiation in Pure Competition',
    authors: ['Sherwin Rosen'],
    year: 1974,
    journal: 'Journal of Political Economy, Vol. 82, No. 1, pp. 34-55',
    doi: '10.1086/260169',
    category: 'Real Estate & Hedonic Pricing',
    abstract: 'Formulates market equilibrium for differentiated products where price is determined by implicit valuations of individual constituent attributes (location, square footage, amenities, yield).',
    mathematicalFormulas: [
      {
        name: 'Hedonic Price Function',
        latex: 'P(z) = f(z_1, z_2, \\dots, z_n)',
        description: 'Property valuation P as a non-linear vector function of structural and locational characteristics z_i.'
      }
    ],
    bankingApplication: 'Automated Valuation Models (AVM) for instant residential mortgage underwriting and home acquisition.',
    sovereignApplication: 'National property tax reassessments, public housing allocation, and urban development planning.'
  },
  {
    id: 'rockafellar-2000',
    title: 'Optimization of Conditional Value-at-Risk',
    authors: ['R. Tyrrell Rockafellar', 'Stanislav Uryasev'],
    year: 2000,
    journal: 'Journal of Risk, Vol. 2, No. 3, pp. 21-42',
    doi: '10.21314/JOR.2000.038',
    category: 'Quantitative Finance',
    abstract: 'Introduces Conditional Value-at-Risk (CVaR) / Expected Shortfall as a coherent, convex risk measure evaluating tail loss beyond the confidence quantile alpha.',
    mathematicalFormulas: [
      {
        name: 'Conditional Value at Risk (CVaR)',
        latex: 'CVaR_\\alpha = E[L \\mid L \\ge VaR_\\alpha]',
        description: 'Expected loss given that loss exceeds the alpha-quantile Value-at-Risk threshold.'
      }
    ],
    bankingApplication: 'Capital adequacy calculation under Basel III / IV guidelines and stress testing cash reserves.',
    sovereignApplication: 'Sovereign crisis response sizing and systemic financial stability buffers.'
  },
  {
    id: 'taylor-1993',
    title: 'Discretion versus Policy Rules in Practice',
    authors: ['John B. Taylor'],
    year: 1993,
    journal: 'Carnegie-Rochester Conference Series on Public Policy, Vol. 39, pp. 195-214',
    doi: '10.1016/0167-2231(93)90009-L',
    category: 'Macroeconomics & Sovereign',
    abstract: 'Formulates the Taylor Rule guiding central bank short-term interest rate adjustments based on inflation gaps and output gap deviations.',
    mathematicalFormulas: [
      {
        name: 'Taylor Rule Formula',
        latex: 'r_t = r^* + \\pi_t + 0.5(\\pi_t - \\pi^*) + 0.5 y_t',
        description: 'Nominal policy interest rate r_t determined by neutral rate r*, current inflation pi_t, target inflation pi*, and GDP output gap y_t.'
      }
    ],
    bankingApplication: 'Automated algorithmic forecasting of benchmark yield curves and loan rate adjustments.',
    sovereignApplication: 'Autonomous sovereign central banking monetary policy and economic stabilization policy.'
  }
];

// ============================================================================
// CORE MATH ENGINE CLASS
// ============================================================================

export class MathEngine {
  public static normalCDF(x: Decimal | number | string): Decimal {
    const dX = new Decimal(x);
    if (dX.isNaN()) return new Decimal(0);
    const sign = dX.isNegative() ? -1 : 1;
    const absX = dX.abs();
    const p = new Decimal('0.2316419');
    const b1 = new Decimal('0.319381530');
    const b2 = new Decimal('-0.356563782');
    const b3 = new Decimal('1.781477937');
    const b4 = new Decimal('-1.821255978');
    const b5 = new Decimal('1.330274429');
    const t = new Decimal(1).div(new Decimal(1).plus(p.times(absX)));
    const t2 = t.times(t);
    const t3 = t2.times(t);
    const t4 = t3.times(t);
    const t5 = t4.times(t);
    const invSqrt2Pi = new Decimal('0.3989422804014326779399460599343818684759');
    const pdf = invSqrt2Pi.times(Decimal.exp(absX.pow(2).negated().div(2)));
    const poly = b1.times(t).plus(b2.times(t2)).plus(b3.times(t3)).plus(b4.times(t4)).plus(b5.times(t5));
    const cdf = new Decimal(1).minus(pdf.times(poly));
    return sign === 1 ? cdf : new Decimal(1).minus(cdf);
  }

  public static normalPDF(x: Decimal | number | string): Decimal {
    const dX = new Decimal(x);
    const invSqrt2Pi = new Decimal('0.3989422804014326779399460599343818684759');
    return invSqrt2Pi.times(Decimal.exp(dX.pow(2).negated().div(2)));
  }

  public static calculateMertonDefaultRisk(params: any): any {
    const V = new Decimal(params.assetValue);
    const D = new Decimal(params.debtFaceValue);
    const r = new Decimal(params.riskFreeRate);
    const sigmaV = new Decimal(params.assetVolatility);
    const T = new Decimal(params.timeToMaturityYears);
    const sqrtT = Decimal.sqrt(T);
    const logVD = Decimal.ln(V.div(D));
    const drift = r.plus(sigmaV.pow(2).div(2)).times(T);
    const d1 = logVD.plus(drift).div(sigmaV.times(sqrtT));
    const d2 = d1.minus(sigmaV.times(sqrtT));
    const pd = new Decimal(1).minus(this.normalCDF(d2));
    return { probabilityOfDefault: pd.toFixed(8), distanceToDefault: d2.toFixed(8) };
  }
}

// ============================================================================
// API ROUTES
// ============================================================================

const router = Router();

router.post('/merton', (req: Request, res: Response) => {
  try {
    const result = MathEngine.calculateMertonDefaultRisk(req.body);
    res.json(result);
  } catch (error) {
    res.status(400).json({ error: 'Invalid calculation parameters' });
  }
});

router.get('/bibliography', (req: Request, res: Response) => {
  res.json(ACADEMIC_BIBLIOGRAPHY);
});

export default router;

export const mathEngine = new MathEngine();