export interface BalanceTransferEligibilityRequest {
  cardAccountId: string;
  transferAmount: number;
  currencyCode: string;
}

export interface BalanceTransferEligibilityResponse {
  isEligible: boolean;
  maxTransferAmount: number;
  minTransferAmount: number;
  availablePlans: PaymentPlan[];
  expirationDate: string;
  reasonCode?: string;
}

export interface PaymentPlan {
  planId: string;
  durationMonths: number;
  interestRate: number;
  monthlyPayment: number;
  totalCostOfCredit: number;
  planType: 'FIXED_TERM' | 'PROMOTIONAL' | 'STANDARD';
}

export interface ApiError {
  errorCode: string;
  message: string;
  requestId: string;
  timestamp: string;
}

export interface RequestHeaders {
  'Authorization': string;
  'X-Correlation-ID': string;
  'Content-Type': 'application/json';
  'X-Client-Version': string;
}

export interface BalanceTransferEligibilityPayload {
  headers: RequestHeaders;
  body: BalanceTransferEligibilityRequest;
}

export type BalanceTransferResult = 
  | { success: true; data: BalanceTransferEligibilityResponse }
  | { success: false; error: ApiError };