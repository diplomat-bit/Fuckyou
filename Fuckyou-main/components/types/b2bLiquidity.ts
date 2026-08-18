export type AccountType = 'operating' | 'savings' | 'money_market' | 'sweep' | 'treasury' | 'credit_line';

export interface AccountBalance {
  id: string;
  accountNumber: string;
  accountName: string;
  bankName: string;
  type: AccountType;
  currency: string;
  currentBalance: number;
  availableBalance: number;
  interestRate?: number;
  lastUpdated: string; // ISO Date string
}

export type CashFlowType = 'inflow' | 'outflow';
export type CashFlowStatus = 'pending' | 'cleared' | 'projected';

export interface CashFlowRecord {
  id: string;
  date: string; // ISO Date string (YYYY-MM-DD)
  type: CashFlowType;
  category: string; // e.g., "Accounts Receivable", "Payroll", "Tax", "Vendor Payment"
  counterparty: string;
  amount: number;
  currency: string;
  status: CashFlowStatus;
  description?: string;
  isRecurring?: boolean;
  recurrenceInterval?: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
}

export interface ForecastParameters {
  horizonDays: number; // e.g., 30, 90, 180, 360
  growthRatePercent: number;
  arCollectionDelayDays: number; // Average delay in receiving Accounts Receivable
  apPaymentDelayDays: number; // Average delay in paying Accounts Payable
  taxRatePercent: number;
  minimumRequiredBuffer: number; // Minimum cash buffer required
}

export type ScenarioType = 'baseline' | 'optimistic' | 'pessimistic' | 'custom';

export interface ScenarioAdjustment {
  id: string;
  targetCategory?: string; // e.g., "Accounts Receivable", "Payroll"
  type: 'percentage_change' | 'fixed_offset' | 'delay_days';
  value: number; // e.g., -10 for -10% or 5 for 5 days delay
}

export interface ScenarioConfig {
  id: string;
  name: string;
  description: string;
  type: ScenarioType;
  adjustments: ScenarioAdjustment[];
  isActive: boolean;
}

export type AlertSeverity = 'info' | 'warning' | 'critical';
export type AlertMetric = 'minimum_balance' | 'liquidity_ratio' | 'negative_cash_flow' | 'large_outflow';

export interface LiquidityAlert {
  id: string;
  severity: AlertSeverity;
  metric: AlertMetric;
  message: string;
  triggerDate: string; // ISO Date string
  thresholdValue: number;
  actualValue: number;
  isResolved: boolean;
  resolvedAt?: string;
}

export type OptimizationType = 'sweep' | 'yield_investment' | 'credit_drawdown' | 'invoice_factoring' | 'early_payment_discount';

export interface OptimizationItem {
  id: string;
  title: string;
  description: string;
  type: OptimizationType;
  potentialImpact: number; // Financial benefit/impact amount
  costOrFee?: number;
  recommendationScore: number; // 1 to 100
  status: 'available' | 'pending' | 'executed' | 'dismissed';
  sourceAccountId?: string;
  targetAccountId?: string;
  createdAt: string; // ISO Date string
}

export interface ForecastDataPoint {
  date: string; // ISO Date string (YYYY-MM-DD)
  baselineBalance: number;
  optimisticBalance: number;
  pessimisticBalance: number;
  customScenarioBalance?: number;
  projectedInflow: number;
  projectedOutflow: number;
  netCashFlow: number;
}

export interface HistoricalDataPoint {
  date: string; // ISO Date string (YYYY-MM-DD)
  actualBalance: number;
  actualInflow: number;
  actualOutflow: number;
}

export interface CashFlowCategorySummary {
  category: string;
  type: CashFlowType;
  totalAmount: number;
  percentage: number;
}

export interface BankConnection {
  id: string;
  institutionName: string;
  logoUrl?: string;
  status: 'connected' | 'disconnected' | 'error' | 'syncing';
  lastSyncedAt: string; // ISO Date string
  accountsCount: number;
}

export interface LiquidityMetrics {
  totalCash: number;
  availableLiquidity: number; // Cash + available credit lines
  burnRate: number; // Average monthly outflow
  runwayMonths: number; // totalCash / burnRate
  quickRatio: number;
  currentRatio: number;
}