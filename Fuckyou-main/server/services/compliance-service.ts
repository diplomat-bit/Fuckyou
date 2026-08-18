import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface ComplianceCheckResult {
  passed: boolean;
  reason?: string;
  timestamp: Date;
  transactionId: string;
}

export interface AuditLogEntry {
  id: string;
  action: string;
  userId: string;
  timestamp: Date;
  metadata: Record<string, any>;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
}

export class ComplianceService extends EventEmitter {
  private auditLogs: AuditLogEntry[] = [];
  private readonly TAX_RATE = 0.15; // Global base tax rate

  constructor() {
    super();
  }

  public async performComplianceCheck(userId: string, transactionType: string, amount: number): Promise<ComplianceCheckResult> {
    const transactionId = uuidv4();
    
    // Logic for AML (Anti-Money Laundering) and KYC (Know Your Customer)
    const isFlagged = amount > 1000000; // Example threshold
    
    const result: ComplianceCheckResult = {
      passed: !isFlagged,
      reason: isFlagged ? 'Transaction exceeds regulatory threshold for automated approval.' : undefined,
      timestamp: new Date(),
      transactionId
    };

    await this.logAction(userId, `COMPLIANCE_CHECK_${transactionType}`, { amount, result }, result.passed ? 'SUCCESS' : 'FAILURE');
    
    return result;
  }

  public calculateTax(amount: number): number {
    return amount * this.TAX_RATE;
  }

  public async logAction(userId: string, action: string, metadata: Record<string, any>, status: 'SUCCESS' | 'FAILURE' | 'PENDING'): Promise<string> {
    const entry: AuditLogEntry = {
      id: uuidv4(),
      action,
      userId,
      timestamp: new Date(),
      metadata,
      status
    };

    this.auditLogs.push(entry);
    this.emit('audit_log_created', entry);
    
    return entry.id;
  }

  public generateRegulatoryReport(startDate: Date, endDate: Date): AuditLogEntry[] {
    return this.auditLogs.filter(log => log.timestamp >= startDate && log.timestamp <= endDate);
  }

  public async exportAuditTrail(format: 'JSON' | 'CSV'): Promise<string> {
    if (format === 'JSON') {
      return JSON.stringify(this.auditLogs, null, 2);
    }
    
    // Simple CSV conversion
    const headers = 'id,action,userId,timestamp,status\n';
    const rows = this.auditLogs.map(log => 
      `${log.id},${log.action},${log.userId},${log.timestamp.toISOString()},${log.status}`
    ).join('\n');
    
    return headers + rows;
  }

  public getAuditLogs(): AuditLogEntry[] {
    return [...this.auditLogs];
  }
}

export const complianceService = new ComplianceService();