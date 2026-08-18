/**
 * @file types/visa-dcvv2.ts
 * @description TypeScript definitions and interfaces for Visa Dynamic Card Verification Value 2 (dCVV2)
 * requests, responses, enrollment states, and Gemini-driven risk assessment payloads.
 * 
 * Visa dCVV2 is a dynamic 3-digit security code that replaces the static CVV2 printed on the back
 * of a payment card, significantly reducing Card-Not-Present (CNP) fraud.
 */

/**
 * Represents the current enrollment status of a card in the Visa dCVV2 program.
 */
export type VisaDcvv2EnrollmentStatus = 
  | 'NOT_ENROLLED'
  | 'PENDING_ACTIVATION'
  | 'ENROLLED'
  | 'SUSPENDED'
  | 'DEACTIVATED';

/**
 * Delivery channels supported for sending the generated dynamic CVV2 to the cardholder.
 */
export type VisaDcvv2DeliveryChannel = 
  | 'SMS'
  | 'EMAIL'
  | 'MOBILE_APP_PUSH'
  | 'HARDWARE_TOKEN'
  | 'API_ON_DEMAND';

/**
 * The algorithm or method used to generate the dynamic CVV2.
 */
export type VisaDcvv2GenerationMethod = 
  | 'TIME_BASED'    // Changes every X seconds (e.g., TOTP-like)
  | 'COUNTER_BASED' // Changes per transaction/request
  | 'ON_DEMAND';    // Generated explicitly via API call

/**
 * Cardholder details required for dCVV2 enrollment and delivery.
 */
export interface CardholderContactInfo {
  email?: string;
  phoneNumber?: string; // E.164 format
  countryCode?: string; // ISO 3166-1 alpha-2
  preferredLanguage?: string; // ISO 639-1
}

/**
 * Request payload to enroll a primary account number (PAN) in Visa dCVV2.
 */
export interface VisaDcvv2EnrollmentRequest {
  requestId: string;
  primaryAccountNumber: string; // PAN (13-19 digits)
  expirationDate: {
    month: string; // MM
    year: string;  // YYYY
  };
  cardholderName: string;
  generationMethod: VisaDcvv2GenerationMethod;
  deliveryChannels: VisaDcvv2DeliveryChannel[];
  contactInfo: CardholderContactInfo;
  timeStepSeconds?: number; // Default is usually 1800 (30 minutes) for TIME_BASED
  clientMetadata?: Record<string, string>;
}

/**
 * Response payload returned by Visa after a dCVV2 enrollment request.
 */
export interface VisaDcvv2EnrollmentResponse {
  enrollmentId: string;
  requestId: string;
  status: VisaDcvv2EnrollmentStatus;
  primaryAccountNumberMasked: string; // e.g., "411111******1111"
  activatedAt?: string; // ISO 8601 timestamp
  deactivatedAt?: string; // ISO 8601 timestamp
  generationMethod: VisaDcvv2GenerationMethod;
  deliveryChannels: VisaDcvv2DeliveryChannel[];
  timeStepSeconds?: number;
  visaReferenceId: string;
  responseCode: 'SUCCESS' | 'DUPLICATE_ENROLLMENT' | 'INVALID_PAN' | 'SYSTEM_ERROR';
  message: string;
}

/**
 * Request payload to generate a new dynamic CVV2 value.
 */
export interface VisaDcvv2GenerationRequest {
  requestId: string;
  enrollmentId: string;
  primaryAccountNumber?: string; // Optional if enrollmentId is used, or vice versa
  deliveryChannel: VisaDcvv2DeliveryChannel;
  transactionContext?: {
    merchantName?: string;
    amount?: number;
    currency?: string; // ISO 4217
  };
}

/**
 * Response payload containing the generated dynamic CVV2 or delivery status.
 */
export interface VisaDcvv2GenerationResponse {
  requestId: string;
  enrollmentId: string;
  dcvv2Value?: string; // Only populated if deliveryChannel is 'API_ON_DEMAND' and client is authorized
  expiresAt: string; // ISO 8601 timestamp
  deliveryStatus: 'DELIVERED' | 'PENDING' | 'FAILED' | 'SUPPRESSED';
  deliveryChannelUsed: VisaDcvv2DeliveryChannel;
  visaReferenceId: string;
  responseCode: 'SUCCESS' | 'ENROLLMENT_NOT_FOUND' | 'DELIVERY_FAILED' | 'LIMIT_EXCEEDED';
  message: string;
}

/**
 * Request payload to validate a dynamic CVV2 during transaction authorization.
 */
export interface VisaDcvv2ValidationRequest {
  requestId: string;
  primaryAccountNumber: string;
  expirationDate: {
    month: string;
    year: string;
  };
  dcvv2Value: string;
  transactionAmount?: number;
  transactionCurrency?: string; // ISO 4217
  merchantId?: string;
  terminalId?: string;
  acquisitionTimestamp: string; // ISO 8601 timestamp of transaction
}

/**
 * Response payload returned after validating a dynamic CVV2.
 */
export interface VisaDcvv2ValidationResponse {
  requestId: string;
  isValid: boolean;
  validationResultCode: 
    | 'MATCH' 
    | 'MISMATCH' 
    | 'EXPIRED' 
    | 'NOT_ENROLLED' 
    | 'SUSPENDED' 
    | 'ALREADY_USED'; // Prevents replay attacks
  visaReferenceId: string;
  processedTimestamp: string; // ISO 8601 timestamp
}

/**
 * Context payload passed to Gemini AI to evaluate transaction risk and determine
 * if a dCVV2 challenge is required, or if it can be auto-approved/bypassed.
 */
export interface GeminiRiskAssessmentContext {
  transactionId: string;
  primaryAccountNumberMasked: string;
  cardholderId: string;
  enrollmentStatus: VisaDcvv2EnrollmentStatus;
  amount: number;
  currency: string; // ISO 4217
  merchant: {
    id: string;
    name: string;
    categoryCode: string; // MCC
    country: string; // ISO 3166-1 alpha-2
    trustScore?: number; // Historical trust score (0-100)
  };
  deviceFingerprint: {
    ipAddress: string;
    userAgent: string;
    deviceId?: string;
    location?: {
      latitude: number;
      longitude: number;
      country?: string;
    };
    isVpnOrProxy: boolean;
    isEmulator: boolean;
  };
  behavioralMetrics: {
    velocityLast24Hours: number; // Number of transactions in last 24h
    amountVelocityLast24Hours: number; // Total amount spent in last 24h
    averageTransactionAmount: number;
    isNewMerchantForCardholder: boolean;
    distanceFromHomeKm?: number;
    failedAttemptsLastHour: number;
  };
  historicalFraudPatterns: {
    globalMccFraudRate: number; // MCC fraud rate (0.0 to 1.0)
    cardholderFraudFlagCount: number;
    recentChargebacksCount: number;
  };
}

/**
 * Structured output payload generated by Gemini AI after analyzing the risk context.
 * This guides the orchestration layer on whether to enforce dCVV2 validation.
 */
export interface GeminiRiskAssessmentResult {
  transactionId: string;
  riskScore: number; // Scale of 0 (No Risk) to 100 (Extreme Risk)
  recommendedAction: 'APPROVE_WITHOUT_DCVV2' | 'REQUIRE_DCVV2' | 'STEP_UP_MFA' | 'DECLINE';
  confidenceScore: number; // Gemini's confidence in this decision (0.0 to 1.0)
  riskFactors: string[]; // List of key risk factors identified (e.g., "High velocity", "Suspicious IP")
  reasoning: string; // Detailed natural language explanation of the decision
  suggestedDcvv2ExpirySeconds?: number; // Dynamic expiry recommendation based on risk (e.g., shorter for high risk)
  suggestedDeliveryChannel?: VisaDcvv2DeliveryChannel; // Best delivery channel based on user context
  assessedAt: string; // ISO 8601 timestamp
  modelMetadata: {
    modelName: string;
    tokensUsed: number;
    latencyMs: number;
  };
}

/**
 * Complete audit log entry combining the transaction, Visa dCVV2 validation,
 * and Gemini risk assessment for compliance and machine learning feedback loops.
 */
export interface VisaDcvv2AuditLogEntry {
  logId: string;
  timestamp: string;
  transactionId: string;
  cardholderId: string;
  amount: number;
  currency: string;
  merchantName: string;
  geminiAssessment: GeminiRiskAssessmentResult;
  visaValidation?: VisaDcvv2ValidationResponse;
  finalOutcome: 'APPROVED' | 'DECLINED_BY_RISK' | 'DECLINED_BY_DCVV2_MISMATCH' | 'DECLINED_BY_ISSUER';
  remediationStepsTaken?: string[];
}