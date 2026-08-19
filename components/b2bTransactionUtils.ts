

// --- CONSOLIDATED FROM: ./components/utils/b2bTransactionUtils.ts ---

export interface B2BTransaction {
  id: string;
  senderId: string;
  senderName: string;
  receiverId: string;
  receiverName: string;
  amount: number;
  currency: string;
  timestamp: string | Date;
  category?: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface AnomalyResult {
  transactionId: string;
  score: number; // 0 to 100
  reasons: string[];
  isDuplicate: boolean;
  isHighValue: boolean;
  isVelocityAnomaly: boolean;
}

export interface BalancePoint {
  timestamp: string;
  balance: number;
  transactionId?: string;
  description?: string;
}

export interface ProcessorOptions {
  duplicateWindowMinutes?: number;
  velocityWindowMinutes?: number;
  velocityMaxCount?: number;
  highValueStaticThreshold?: number;
  highValuePercentileThreshold?: number; // e.g., 95 for 95th percentile
}

export class B2BTransactionProcessor {
  private transactions: B2BTransaction[];
  private options: Required<ProcessorOptions>;

  constructor(transactions: B2BTransaction[], options?: ProcessorOptions) {
    // Sort transactions chronologically by default
    this.transactions = [...transactions].sort(
      (a, b) => this.getTime(a.timestamp) - this.getTime(b.timestamp)
    );

    this.options = {
      duplicateWindowMinutes: options?.duplicateWindowMinutes ?? 5,
      velocityWindowMinutes: options?.velocityWindowMinutes ?? 60,
      velocityMaxCount: options?.velocityMaxCount ?? 5,
      highValueStaticThreshold: options?.highValueStaticThreshold ?? 100000, // $100k default
      highValuePercentileThreshold: options?.highValuePercentileThreshold ?? 95,
    };
  }

  private getTime(timestamp: string | Date): number {
    return timestamp instanceof Date ? timestamp.getTime() : new Date(timestamp).getTime();
  }

  /**
   * Detects duplicate charges.
   * A duplicate is defined as transactions between the same sender and receiver,
   * with the exact same amount, occurring within the specified time window.
   */
  public detectDuplicates(): Set<string> {
    const duplicates = new Set<string>();
    const windowMs = this.options.duplicateWindowMinutes * 60 * 1000;

    for (let i = 0; i < this.transactions.length; i++) {
      const current = this.transactions[i];
      if (current.status === 'failed') continue;

      for (let j = i + 1; j < this.transactions.length; j++) {
        const next = this.transactions[j];
        if (next.status === 'failed') continue;

        const timeDiff = this.getTime(next.timestamp) - this.getTime(current.timestamp);
        if (timeDiff > windowMs) break; // Since sorted, no further transactions will be in window

        if (
          current.senderId === next.senderId &&
          current.receiverId === next.receiverId &&
          current.amount === next.amount &&
          current.currency === next.currency
        ) {
          duplicates.add(current.id);
          duplicates.add(next.id);
        }
      }
    }

    return duplicates;
  }

  /**
   * Detects high-value transfers based on static threshold and dynamic percentile threshold.
   */
  public detectHighValueTransfers(): Set<string> {
    const highValueIds = new Set<string>();
    if (this.transactions.length === 0) return highValueIds;

    const amounts = this.transactions
      .filter((t) => t.status !== 'failed')
      .map((t) => t.amount)
      .sort((a, b) => a - b);

    // Calculate percentile threshold
    const percentileIndex = Math.floor(
      (this.options.highValuePercentileThreshold / 100) * amounts.length
    );
    const dynamicThreshold = amounts[Math.min(percentileIndex, amounts.length - 1)] || 0;

    for (const tx of this.transactions) {
      if (tx.status === 'failed') continue;

      const isStaticHigh = tx.amount >= this.options.highValueStaticThreshold;
      const isDynamicHigh = tx.amount >= dynamicThreshold && tx.amount > 0;

      if (isStaticHigh || isDynamicHigh) {
        highValueIds.add(tx.id);
      }
    }

    return highValueIds;
  }

  /**
   * Detects velocity anomalies.
   * Flags transactions if a sender initiates more than `velocityMaxCount` transactions
   * within the `velocityWindowMinutes` window.
   */
  public detectVelocityAnomalies(): Set<string> {
    const velocityAnomalies = new Set<string>();
    const windowMs = this.options.velocityWindowMinutes * 60 * 1000;

    for (let i = 0; i < this.transactions.length; i++) {
      const current = this.transactions[i];
      if (current.status === 'failed') continue;

      const currentMs = this.getTime(current.timestamp);
      let count = 0;
      const windowTxIds: string[] = [];

      // Look backwards to count transactions within the window
      for (let j = i; j >= 0; j--) {
        const prev = this.transactions[j];
        if (prev.status === 'failed') continue;
        if (prev.senderId !== current.senderId) continue;

        const diff = currentMs - this.getTime(prev.timestamp);
        if (diff > windowMs) break;

        count++;
        windowTxIds.push(prev.id);
      }

      if (count > this.options.velocityMaxCount) {
        windowTxIds.forEach((id) => velocityAnomalies.add(id));
      }
    }

    return velocityAnomalies;
  }

  /**
   * Calculates comprehensive anomaly scores (0 to 100) for all transactions.
   */
  public calculateAnomalyScores(): AnomalyResult[] {
    const duplicates = this.detectDuplicates();
    const highValues = this.detectHighValueTransfers();
    const velocityAnomalies = this.detectVelocityAnomalies();

    return this.transactions.map((tx) => {
      const reasons: string[] = [];
      let score = 0;

      const isDuplicate = duplicates.has(tx.id);
      const isHighValue = highValues.has(tx.id);
      const isVelocityAnomaly = velocityAnomalies.has(tx.id);

      if (tx.status === 'failed') {
        return {
          transactionId: tx.id,
          score: 0,
          reasons: ['Transaction failed'],
          isDuplicate: false,
          isHighValue: false,
          isVelocityAnomaly: false,
        };
      }

      if (isDuplicate) {
        score += 40;
        reasons.push(
          `Potential duplicate charge detected within ${this.options.duplicateWindowMinutes}m window.`
        );
      }

      if (isHighValue) {
        const isStatic = tx.amount >= this.options.highValueStaticThreshold;
        score += isStatic ? 35 : 15;
        reasons.push(
          isStatic
            ? `Transaction amount (${tx.amount}) exceeds static high-value threshold (${this.options.highValueStaticThreshold}).`
            : `Transaction amount (${tx.amount}) is in the top ${100 - this.options.highValuePercentileThreshold}% of historical transactions.`
        );
      }

      if (isVelocityAnomaly) {
        score += 25;
        reasons.push(
          `High transaction frequency (velocity) detected from sender within ${this.options.velocityWindowMinutes}m window.`
        );
      }

      // Check for unusual hours (e.g., 11 PM to 4 AM)
      const txHour = new Date(tx.timestamp).getHours();
      if (txHour >= 23 || txHour < 4) {
        score += 10;
        reasons.push(`Transaction initiated during unusual hours (${txHour}:00).`);
      }

      // Cap score at 100
      score = Math.min(score, 100);

      return {
        transactionId: tx.id,
        score,
        reasons,
        isDuplicate,
        isHighValue,
        isVelocityAnomaly,
      };
    });
  }

  /**
   * Computes cumulative account balances over time for a specific account.
   * Accounts for both incoming and outgoing transactions.
   */
  public computeCumulativeBalances(accountId: string, initialBalance = 0): BalancePoint[] {
    const balancePoints: BalancePoint[] = [];
    let currentBalance = initialBalance;

    // Add initial starting point if there are transactions
    if (this.transactions.length > 0) {
      const firstTxTime = this.getTime(this.transactions[0].timestamp);
      const preTxTime = new Date(firstTxTime - 1000 * 60 * 60).toISOString(); // 1 hour before
      balancePoints.push({
        timestamp: preTxTime,
        balance: initialBalance,
        description: 'Initial Balance',
      });
    }

    for (const tx of this.transactions) {
      if (tx.status === 'failed') continue;

      const isSender = tx.senderId === accountId;
      const isReceiver = tx.receiverId === accountId;

      if (!isSender && !isReceiver) continue;

      if (isSender) {
        currentBalance -= tx.amount;
      }
      if (isReceiver) {
        currentBalance += tx.amount;
      }

      balancePoints.push({
        timestamp: tx.timestamp instanceof Date ? tx.timestamp.toISOString() : tx.timestamp,
        balance: Number(currentBalance.toFixed(2)),
        transactionId: tx.id,
        description: isSender ? `Sent to ${tx.receiverName}` : `Received from ${tx.senderName}`,
      });
    }

    return balancePoints;
  }
}

/**
 * Helper utility to format currency values.
 */
export const formatCurrency = (amount: number, currency = 'USD'): string => {
  return new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency,
  }).format(amount);
};

/**
 * Helper utility to group transactions by sender or receiver.
 */
export const groupTransactionsByAccount = (
  transactions: B2BTransaction[]
): Record<string, B2BTransaction[]> => {
  const groups: Record<string, B2BTransaction[]> = {};

  for (const tx of transactions) {
    if (!groups[tx.senderId]) groups[tx.senderId] = [];
    if (!groups[tx.receiverId]) groups[tx.receiverId] = [];

    groups[tx.senderId].push(tx);
    groups[tx.receiverId].push(tx);
  }

  return groups;
};