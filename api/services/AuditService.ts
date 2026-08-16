import { DatabaseManager } from '../utils/dbUtils';
import { Logger } from '../utils/logger';

export interface AuditEntry {
  id: string;
  action: string;
  actor: string;
  timestamp: Date;
  details: Record<string, any>;
  status: 'success' | 'failure';
}

export class AuditService {
  private db: DatabaseManager;

  constructor() {
    this.db = new DatabaseManager();
  }

  async logAction(entry: Omit<AuditEntry, 'id' | 'timestamp'>): Promise<void> {
    try {
      const auditEntry: AuditEntry = {
        ...entry,
        id: Math.random().toString(36).substring(2, 15),
        timestamp: new Date(),
      };
      await this.db.collection('audit_logs').insertOne(auditEntry);
      Logger.info(`Audit logged: ${entry.action} by ${entry.actor}`);
    } catch (error) {
      Logger.error('Failed to log audit entry', error);
      throw error;
    }
  }

  async getAuditLogs(actor?: string): Promise<AuditEntry[]> {
    try {
      const query = actor ? { actor } : {};
      return await this.db.collection('audit_logs').find(query).toArray();
    } catch (error) {
      Logger.error('Failed to retrieve audit logs', error);
      return [];
    }
  }

  async verifyIntegrity(transactionId: string): Promise<boolean> {
    try {
      const log = await this.db.collection('audit_logs').findOne({ 'details.transactionId': transactionId });
      return !!log;
    } catch (error) {
      Logger.error('Integrity verification failed', error);
      return false;
    }
  }

  async verifyTransaction(transactionId: string): Promise<boolean> {
    return this.verifyIntegrity(transactionId);
  }
}

export const auditService = new AuditService();