

// --- CONSOLIDATED FROM: ./components/types/b2bInterestRate.ts ---

export interface Account {
  id: string;
  bankName: string;
  accountName: string;
  balance: number;
  interestRate: number; // Annual percentage rate (e.g., 4.5 for 4.5%)
  minBalance: number;
  maxBalance?: number;
  withdrawalLimit?: number; // Maximum withdrawals allowed per period
  withdrawalFee?: number;
  type: 'checking' | 'savings' | 'money_market' | 'cd';
  isLocked?: boolean; // If true, funds cannot be moved out of this account
}

export interface OptimizationParams {
  liquidityBuffer: number; // Minimum cash that must remain in checking/highly liquid accounts
  maxTransfers?: number; // Maximum number of reallocation actions to suggest
  minTransferAmount?: number; // Minimum amount worth transferring (to avoid micro-transfers)
  targetCheckingAccountId?: string; // The primary account where liquidity buffer should reside
}

export interface ReallocationAction {
  id: string;
  fromAccountId: string;
  fromAccountName: string;
  fromBankName: string;
  toAccountId: string;
  toAccountName: string;
  toBankName: string;
  amount: number;
}

export interface OptimizedAccountBalance {
  accountId: string;
  accountName: string;
  bankName: string;
  originalBalance: number;
  optimizedBalance: number;
  interestRate: number;
  projectedAnnualInterestOriginal: number;
  projectedAnnualInterestOptimized: number;
}

export interface OptimizationResult {
  originalTotalInterest: number; // Annualized
  optimizedTotalInterest: number; // Annualized
  interestGain: number; // Annualized difference
  percentageImprovement: number;
  actions: ReallocationAction[];
  optimizedBalances: OptimizedAccountBalance[];
  timestamp: string;
}