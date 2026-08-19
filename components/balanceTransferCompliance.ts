

// --- CONSOLIDATED FROM: ./components/types/balanceTransferCompliance.ts ---

export interface BalanceTransferOffer {
  id: string;
  cardName: string;
  issuer: string;
  introApr: number; // e.g., 0.0 for 0% APR
  introDurationMonths: number; // e.g., 18 months
  regularApr: number; // e.g., 24.99%
  transferFeePercent: number; // e.g., 3.0 for 3%
  transferFeeMin: number; // e.g., 5.00 for $5 minimum
  maxTransferLimit: number; // e.g., 15000 for $15,000 limit
  minCreditScore: number; // e.g., 670 (Good)
  termsAndConditionsUrl?: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ComplianceThresholds {
  id: string;
  name: string;
  maxIntroApr: number; // Maximum allowed promotional APR (e.g., 4.99%)
  minIntroDurationMonths: number; // Minimum promotional period required (e.g., 12 months)
  maxRegularApr: number; // Maximum regular APR allowed to be marketed (e.g., 29.99%)
  maxTransferFeePercent: number; // Maximum allowed transfer fee percentage (e.g., 5.0%)
  minCreditScoreRequired: number; // Minimum credit score threshold for marketing eligibility
  disclaimerRequired: boolean; // Whether specific regulatory disclaimers must be present
  restrictedStates: string[]; // List of US state codes where this offer cannot be marketed
  effectiveDate: string;
  expirationDate?: string;
}

export interface ComplianceViolation {
  field: keyof BalanceTransferOffer | 'general';
  severity: 'low' | 'medium' | 'high' | 'critical';
  message: string;
  thresholdValue: string | number;
  actualValue: string | number;
}

export interface EvaluationResult {
  isCompliant: boolean;
  status: 'compliant' | 'non_compliant' | 'needs_review';
  violations: ComplianceViolation[];
  evaluatedAt: string;
  evaluatorSystem: string; // Name/version of the compliance engine
  score: number; // Compliance score from 0 to 100
}

export interface AuditedOffer {
  id: string;
  offerId: string;
  offerSnapshot: BalanceTransferOffer;
  thresholdsSnapshot: ComplianceThresholds;
  evaluation: EvaluationResult;
  auditedBy: string; // User ID or system process name
  auditedAt: string;
  status: 'approved' | 'rejected' | 'pending_override';
  overrideReason?: string;
  overrideBy?: string;
  notes?: string;
}