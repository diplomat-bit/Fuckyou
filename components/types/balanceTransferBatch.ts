export interface Account {
  id: string;
  accountNumber: string;
  customerName: string;
  email: string;
  balance: number;
  creditLimit: number;
  availableCredit: number;
  apr: number;
  status: 'Active' | 'Suspended' | 'Closed';
  createdAt: string;
  updatedAt: string;
}

export interface EligibleAccount {
  id: string;
  accountId: string;
  accountNumber: string;
  customerName: string;
  currentBalance: number;
  creditLimit: number;
  availableCredit: number;
  maxTransferAmount: number;
  promoApr: number;
  promoDurationMonths: number;
  feePercentage: number;
  isEligible: boolean;
  exclusionReason?: string;
  score?: number;
}

export interface ScheduledJob {
  id: string;
  name: string;
  description: string;
  cronExpression: string;
  status: 'Active' | 'Paused' | 'Running' | 'Failed';
  lastRunTime?: string;
  nextRunTime: string;
  targetCampaignId?: string;
  createdAt: string;
  updatedAt: string;
}

export interface Campaign {
  id: string;
  name: string;
  description: string;
  status: 'Draft' | 'Active' | 'Paused' | 'Completed';
  startDate: string;
  endDate: string;
  promoApr: number;
  promoDurationMonths: number;
  feePercentage: number;
  minTransferAmount: number;
  maxTransferAmount: number;
  targetAudienceCount: number;
  totalTransferredAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'INFO' | 'WARNING' | 'ERROR' | 'SUCCESS';
  message: string;
  source: 'System' | 'Batch Job' | 'Campaign Manager' | 'User Action';
  details?: string;
  userId?: string;
}

export interface BalanceTransferRequest {
  id: string;
  sourceAccountId: string;
  sourceAccountNumber: string;
  destinationBankName: string;
  destinationAccountNumber: string;
  transferAmount: number;
  feeAmount: number;
  promoApr: number;
  promoDurationMonths: number;
  status: 'Pending' | 'Approved' | 'Rejected' | 'Processing' | 'Completed' | 'Failed';
  campaignId?: string;
  requestedAt: string;
  processedAt?: string;
  errorMessage?: string;
}

export interface BatchExecutionSummary {
  id: string;
  jobId: string;
  jobName: string;
  startTime: string;
  endTime?: string;
  status: 'Running' | 'Completed' | 'Failed';
  recordsProcessed: number;
  recordsSuccessful: number;
  recordsFailed: number;
  totalAmountTransferred: number;
  errorMessage?: string;
}