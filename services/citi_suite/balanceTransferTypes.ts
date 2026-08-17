export interface BalanceTransferEligibilityRequest {
  cardAccountId: string;
  transferAmount: number;
  currencyCode: string;
}

export interface PaymentPlan {
  planId: string;
  durationMonths: number;
  interestRate: number; // Annual percentage rate (APR)
  monthlyPayment: number;
  totalCostOfCredit: number;
  planType: 'FIXED_TERM' | 'PROMOTIONAL' | 'STANDARD';
  feePercentage?: number; // Promotional or standard fee percentage (e.g., 3% or 5%)
  feeAmount?: number; // Calculated fee amount
  effectiveApr?: number; // Calculated effective APR including fees
}

export interface BalanceTransferEligibilityResponse {
  isEligible: boolean;
  maxTransferAmount: number;
  minTransferAmount: number;
  availablePlans: PaymentPlan[];
  expirationDate: string;
  reasonCode?: string;
  reasonMessage?: string;
}

export interface BalanceTransferExecutionRequest {
  cardAccountId: string;
  planId: string;
  transferAmount: number;
  currencyCode: string;
  sourceBankName: string;
  sourceRoutingNumber: string;
  sourceAccountNumber: string;
  payeeName?: string;
}

export interface BalanceTransferExecutionResponse {
  transactionId: string;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  cardAccountId: string;
  planId: string;
  transferAmount: number;
  feeAmount: number;
  totalAmount: number;
  estimatedCompletionDate: string;
  createdAt: string;
}

export interface BalanceTransferOffer {
  offerId: string;
  cardAccountId: string;
  introApr: number;
  introDurationMonths: number;
  transferFeePercentage: number;
  standardApr: number;
  maxTransferLimit: number;
  minTransferLimit: number;
  expirationDate: string;
  description: string;
}

export interface BalanceTransferSimulationRequest {
  currentBalance: number;
  currentApr: number;
  currentMonthlyPayment: number;
  targetOfferId: string;
  transferAmount: number;
}

export interface BalanceTransferSimulationResult {
  originalRepaymentMonths: number;
  originalTotalInterest: number;
  newRepaymentMonths: number;
  newTotalInterest: number;
  totalSavings: number;
  monthlyPaymentComparison: {
    original: number;
    new: number;
    difference: number;
  };
  payoffTimeline: Array<{
    month: number;
    originalRemainingBalance: number;
    newRemainingBalance: number;
  }>;
}

export interface BalanceTransferHistoryItem {
  transactionId: string;
  cardAccountId: string;
  planId: string;
  amount: number;
  fee: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED';
  sourceBankName: string;
  sourceAccountNumberLast4: string;
  createdAt: string;
  completedAt?: string;
}

export interface BalanceTransferHistoryResponse {
  transactions: BalanceTransferHistoryItem[];
  totalCount: number;
}

export interface ApiError {
  errorCode: string;
  message: string;
  requestId: string;
  timestamp: string;
  details?: string[];
}

export interface RequestHeaders {
  'Authorization': string;
  'X-Correlation-ID': string;
  'Content-Type': 'application/json';
  'X-Client-Version': string;
  'X-Idempotency-Key'?: string;
}

export interface BalanceTransferEligibilityPayload {
  headers: RequestHeaders;
  body: BalanceTransferEligibilityRequest;
}

export interface BalanceTransferExecutionPayload {
  headers: RequestHeaders;
  body: BalanceTransferExecutionRequest;
}

export type BalanceTransferResult = 
  | { success: true; data: BalanceTransferEligibilityResponse }
  | { success: false; error: ApiError };

export type BalanceTransferExecutionResult = 
  | { success: true; data: BalanceTransferExecutionResponse }
  | { success: false; error: ApiError };