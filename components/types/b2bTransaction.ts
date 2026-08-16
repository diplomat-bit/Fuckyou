export type TransactionStatus = 'PENDING' | 'APPROVED' | 'REJECTED' | 'FLAGGED';

export type RuleAction = 'ALLOW' | 'BLOCK' | 'FLAG';

export type AccountStatus = 'ACTIVE' | 'SUSPENDED' | 'CLOSED';

export interface Account {
  id: string;
  name: string;
  companyName: string;
  balance: number;
  creditLimit: number;
  currency: string;
  status: AccountStatus;
  createdAt: string;
  updatedAt: string;
}

export interface MCCRule {
  id: string;
  mcc: string; // 4-digit Merchant Category Code
  category: string; // e.g., "Airlines", "Computer Software"
  action: RuleAction;
  maxTransactionAmount?: number;
  dailyLimit?: number;
  monthlyLimit?: number;
  isActive: boolean;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategoryCode: string; // MCC
  timestamp: string; // ISO 8601 string
  location: {
    city: string;
    country: string;
    ipAddress?: string;
  };
  status: TransactionStatus;
}

export interface AnomalyFlags {
  isHighAmount: boolean;
  isUnusualTime: boolean;
  isMccViolation: boolean;
  isVelocityLimitExceeded: boolean;
  isLocationMismatch: boolean;
  isNewMerchant: boolean;
  riskScore: number; // Scale of 0 to 100
}

export interface ProcessedTransaction extends Transaction {
  anomalyFlags: AnomalyFlags;
  decision: 'APPROVED' | 'REJECTED' | 'REVIEW_REQUIRED';
  decisionReason?: string;
  processedAt: string;
  reviewedBy?: string;
  reviewNotes?: string;
}

export interface TransactionMetrics {
  totalVolume: number;
  totalCount: number;
  anomalyRate: number; // Percentage (0-100)
  approvedCount: number;
  rejectedCount: number;
  flaggedCount: number;
}

export interface B2BTransactionFilters {
  startDate?: string;
  endDate?: string;
  minAmount?: number;
  maxAmount?: number;
  status?: TransactionStatus[];
  accountId?: string;
  mcc?: string;
  hasAnomalies?: boolean;
  minRiskScore?: number;
}