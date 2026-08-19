

// --- CONSOLIDATED FROM: ./components/types/b2bCashFlow.ts ---

export interface CashBalance {
  id: string;
  institution: string;
  accountType: 'Checking' | 'Savings' | 'Money Market' | 'Other';
  balance: number;
  currency: string;
  interestRate: number; // Annual percentage rate (e.g., 4.5 for 4.5%)
}

export interface BrokerageHolding {
  id: string;
  assetName: string;
  assetClass: 'Equities' | 'Fixed Income' | 'Mutual Funds' | 'ETFs' | 'Cash Equivalents' | 'Other';
  value: number;
  liquidationDays: number; // Days required to convert to cash
  haircutPercentage: number; // Standard valuation haircut under normal stress (0 to 100)
  yield: number; // Annual yield percentage
}

export interface CreditLimit {
  id: string;
  lender: string;
  facilityType: 'Revolving Line of Credit' | 'Term Loan' | 'Overdraft' | 'Trade Credit' | 'Other';
  limit: number;
  utilized: number;
  interestRate: number; // Annual interest rate on utilized amount
  maturityDate?: string; // ISO date string (YYYY-MM-DD)
  isSecured: boolean;
}

export type TransactionType = 'inflow' | 'outflow';
export type TransactionFrequency = 'one-time' | 'daily' | 'weekly' | 'bi-weekly' | 'monthly' | 'quarterly' | 'annually';

export interface Transaction {
  id: string;
  description: string;
  amount: number;
  type: TransactionType;
  category: string; // e.g., 'Payroll', 'SaaS', 'Client Invoice', 'Rent', 'Tax'
  frequency: TransactionFrequency;
  startDate: string; // ISO date string (YYYY-MM-DD)
  endDate?: string; // ISO date string (YYYY-MM-DD), optional
  probabilityOfOccurrence: number; // Probability percentage (0 to 100)
}

export interface StressParameters {
  scenarioName: string;
  revenueHaircut: number; // Percentage reduction in inflows (0 to 100)
  expenseInflation: number; // Percentage increase in outflows (0 to 100)
  receivablesDelayDays: number; // Days delay in receiving inflows
  creditFreeze: boolean; // If true, credit limits are reduced to current utilization (no new borrowing)
  brokerageHaircutMultiplier: number; // Multiplier for brokerage asset haircuts (e.g., 1.5x standard haircut)
  interestRateShock: number; // Basis points increase/decrease (e.g., 200 for +2.0%)
}

export interface ProjectionPoint {
  date: string; // ISO date string (YYYY-MM-DD)
  dayIndex: number; // Day offset from start of projection
  baseInflows: number;
  baseOutflows: number;
  stressedInflows: number;
  stressedOutflows: number;
  cashBalance: number;
  stressedCashBalance: number;
  brokerageValue: number;
  stressedBrokerageValue: number;
  creditAvailable: number;
  stressedCreditAvailable: number;
  totalLiquidity: number; // cashBalance + brokerageValue + creditAvailable
  stressedTotalLiquidity: number; // stressedCashBalance + stressedBrokerageValue + stressedCreditAvailable
  isBaseBreach: boolean; // True if base total liquidity falls below 0 or a target threshold
  isStressedBreach: boolean; // True if stressed total liquidity falls below 0 or a target threshold
}