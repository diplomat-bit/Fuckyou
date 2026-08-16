export interface BalanceTransferEligibilityRequest {
  accountId: string;
  amount: number;
  currency: string;
  targetCardId?: string;
}

export interface BalanceTransferEligibilityResponse {
  isEligible: boolean;
  maxTransferAmount: number;
  minTransferAmount: number;
  feePercentage: number;
  estimatedFee: number;
  expiryDate: string;
  ineligibilityReasons?: string[];
}

export interface BalanceTransferError {
  code: string;
  message: string;
  details?: Record<string, any>;
}

export type BalanceTransferStatus = 'ELIGIBLE' | 'INELIGIBLE' | 'PENDING_REVIEW';

export interface BalanceTransferEligibilityMetadata {
  requestId: string;
  timestamp: string;
  provider: string;
}

export interface BalanceTransferEligibilityResult {
  data: BalanceTransferEligibilityResponse;
  metadata: BalanceTransferEligibilityMetadata;
}

export type EligibilityCheckFunction = (
  params: BalanceTransferEligibilityRequest
) => Promise<BalanceTransferEligibilityResult>;