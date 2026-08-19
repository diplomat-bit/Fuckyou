

// --- CONSOLIDATED FROM: ./components/types/balanceTransferCalc.ts ---

export interface DebtProfile {
  id: string;
  name: string;
  balance: number;
  apr: number; // Annual Percentage Rate (e.g., 22.9 for 22.9%)
  minPaymentPercent: number; // Minimum payment percentage (e.g., 1.5 for 1.5%)
  minPaymentFlat: number; // Minimum flat payment amount (e.g., 25 for $25)
  currentMonthlyPayment: number; // The amount the user currently pays monthly
}

export interface BalanceTransferOffer {
  id: string;
  name: string;
  introApr: number; // Promotional APR (e.g., 0 for 0%)
  introDurationMonths: number; // Duration of promo APR in months (e.g., 15, 18, 21)
  transferFeePercent: number; // Balance transfer fee percentage (e.g., 3 for 3%)
  annualFee: number; // Annual fee of the new card (e.g., 0 or 95)
  postIntroApr: number; // APR after the promotional period ends (e.g., 24.99 for 24.99%)
}

export interface SimulationRecord {
  month: number;
  startingBalance: number;
  payment: number;
  interestCharged: number;
  feesCharged: number;
  principalPaid: number;
  endingBalance: number;
  cumulativeInterest: number;
  cumulativeFees: number;
  cumulativePayments: number;
}

export interface PayoffSummary {
  totalMonths: number;
  totalInterestPaid: number;
  totalFeesPaid: number;
  totalPaid: number;
  simulation: SimulationRecord[];
  isPaidOff: boolean;
}

export interface ComparisonResult {
  originalPayoff: PayoffSummary;
  transferPayoff: PayoffSummary;
  totalSavings: number; // Gross savings (interest saved)
  netSavings: number; // Net savings (interest saved minus transfer fees and annual fees)
  breakEvenMonth: number; // The month where cumulative savings exceed the transfer fee
  monthsSaved: number; // Difference in payoff timeline
}

export interface SandboxScenario {
  id: string;
  name: string;
  debtProfile: DebtProfile;
  offer: BalanceTransferOffer;
  targetMonthlyPayment: number; // Custom monthly payment user wants to test
  oneTimeExtraPaymentAmount?: number; // Optional one-time extra payment
  oneTimeExtraPaymentMonth?: number; // Month index for the one-time extra payment
  createdAt: string;
}