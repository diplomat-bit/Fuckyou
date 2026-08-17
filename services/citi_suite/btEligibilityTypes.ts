export interface BalanceTransferEligibilityRequest {
  accountId: string;
  amount: number;
  currency: string;
  targetCardId?: string;
}

export type BalanceTransferIneligibilityReason =
  | 'INSUFFICIENT_CREDIT_LIMIT'
  | 'DELINQUENT_ACCOUNT'
  | 'EXCEEDS_MAX_TRANSFER_LIMIT'
  | 'BELOW_MIN_TRANSFER_LIMIT'
  | 'RESTRICTED_ACCOUNT_TYPE'
  | 'RECENT_BANKRUPTCY'
  | 'SUSPECTED_FRAUD'
  | 'INVALID_CURRENCY'
  | 'ACCOUNT_NOT_FOUND'
  | 'PROMOTIONAL_OFFER_EXPIRED';

export interface BalanceTransferOffer {
  offerId: string;
  promoApr: number;
  promoDurationMonths: number;
  standardApr: number;
  feePercentage: number;
  minTransferAmount: number;
  maxTransferAmount: number;
  expiryDate: string;
  description: string;
}

export interface BalanceTransferEligibilityResponse {
  isEligible: boolean;
  maxTransferAmount: number;
  minTransferAmount: number;
  feePercentage: number;
  estimatedFee: number;
  expiryDate: string;
  ineligibilityReasons?: string[];
  availableOffers?: BalanceTransferOffer[];
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

// Global Constants for Balance Transfer Calculations
export const DEFAULT_MIN_TRANSFER_AMOUNT = 100;
export const DEFAULT_MAX_TRANSFER_LIMIT_PERCENTAGE = 0.95; // 95% of available credit limit
export const DEFAULT_FEE_PERCENTAGE = 0.03; // 3% standard balance transfer fee

/**
 * Helper to construct a standardized Balance Transfer Error
 */
export function createEligibilityError(
  code: string,
  message: string,
  details?: Record<string, any>
): BalanceTransferError {
  return {
    code,
    message,
    details,
  };
}

/**
 * Helper to validate if a specific amount is eligible based on the eligibility response
 */
export function isEligibleForAmount(
  amount: number,
  response: BalanceTransferEligibilityResponse
): { eligible: boolean; reason?: BalanceTransferIneligibilityReason } {
  if (!response.isEligible) {
    return { 
      eligible: false, 
      reason: (response.ineligibilityReasons?.[0] as BalanceTransferIneligibilityReason) || 'RESTRICTED_ACCOUNT_TYPE' 
    };
  }
  if (amount < response.minTransferAmount) {
    return { eligible: false, reason: 'BELOW_MIN_TRANSFER_LIMIT' };
  }
  if (amount > response.maxTransferAmount) {
    return { eligible: false, reason: 'EXCEEDS_MAX_TRANSFER_LIMIT' };
  }
  return { eligible: true };
}

/**
 * Helper to calculate the estimated fee for a balance transfer amount
 */
export function calculateEstimatedFee(amount: number, feePercentage: number): number {
  return Math.round(amount * feePercentage * 100) / 100;
}