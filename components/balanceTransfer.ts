

// --- CONSOLIDATED FROM: ./components/types/balanceTransfer.ts ---

export interface CustomerRecord {
  id: string;
  name: string;
  email: string;
  creditScore: number;
  currentBalance: number;
  currentApr: number;
  monthlyPayment: number;
  cardName: string;
  eligiblePromoDuration: number; // in months, e.g., 12, 18, 21
  eligiblePromoApr: number; // e.g., 0.0 (0%)
  eligibleTransferFee: number; // e.g., 3.0 (3%)
  riskScore: 'Low' | 'Medium' | 'High';
  status: 'Active' | 'Completed' | 'Pending' | 'Defaulted';
  lastUpdated: string;
}

export interface DashboardFilters {
  creditScoreRange: [number, number];
  balanceRange: [number, number];
  riskLevels: ('Low' | 'Medium' | 'High')[];
  statuses: ('Active' | 'Completed' | 'Pending' | 'Defaulted')[];
  searchTerm: string;
}

export interface CalculatorInputs {
  currentBalance: number;
  currentApr: number;
  promoApr: number;
  promoDuration: number; // in months
  transferFeePercent: number; // e.g., 3 for 3%
  monthlyPayment: number;
}

export interface AmortizationPeriod {
  month: number;
  balanceWithout: number;
  balanceWith: number;
  interestPaidWithout: number;
  interestPaidWith: number;
  cumulativeSavings: number;
}

export interface SimulationResult {
  totalInterestWithoutTransfer: number;
  totalInterestWithTransfer: number;
  transferFeeAmount: number;
  totalSavings: number;
  monthsToPayOffWithoutTransfer: number;
  monthsToPayOffWithTransfer: number;
  monthlyPaymentNeededForPromo: number; // Payment needed to pay off exactly within promo period
  amortizationSchedule: AmortizationPeriod[];
}

export interface DashboardMetrics {
  totalPortfolioBalance: number;
  averageCreditScore: number;
  averageApr: number;
  potentialSavings: number;
  activeTransfersCount: number;
  conversionRate: number; // percentage of eligible customers who completed transfer
}