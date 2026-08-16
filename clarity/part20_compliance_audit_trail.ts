import { createHash, createHmac } from 'crypto';
import { v4 as uuidv4 } from 'uuid';

/**
 * Part 20: Immutable Compliance Audit Trail
 * Generates cryptographic proofs of compliance and logs all regulatory events 
 * to an immutable ledger for sovereign-grade auditing.
 */

export interface ComplianceEvent {
  id: string;
  timestamp: number;
  actorId: string;
  action: string;
  resourceId: string;
  status: 'COMPLIANT' | 'NON_COMPLIANT' | 'PENDING_REVIEW';
  metadata: Record<string, any>;
  previousHash: string;
  hash: string;
}

export class ComplianceAuditTrail {
  private static lastHash: string = '0'.repeat(64);
  private static readonly SECRET_KEY = process.env.AUDIT_SECRET_KEY || 'sovereign-default-key';

  /**
   * Generates a cryptographic proof for a compliance event
   */
  private static generateHash(event: Omit<ComplianceEvent, 'hash'>): string {
    const data = JSON.stringify({
      id: event.id,
      timestamp: event.timestamp,
      actorId: event.actorId,
      action: event.action,
      resourceId: event.resourceId,
      previousHash: event.previousHash
    });

    return createHmac('sha256', this.SECRET_KEY)
      .update(data)
      .digest('hex');
  }

  /**
   * Logs a new regulatory event to the immutable ledger
   */
  public static async logEvent(
    actorId: string,
    action: string,
    resourceId: string,
    status: ComplianceEvent['status'],
    metadata: Record<string, any>
  ): Promise<ComplianceEvent> {
    const event: ComplianceEvent = {
      id: uuidv4(),
      timestamp: Date.now(),
      actorId,
      action,
      resourceId,
      status,
      metadata,
      previousHash: this.lastHash,
      hash: ''
    };

    event.hash = this.generateHash(event);
    this.lastHash = event.hash;

    // In production, this would interface with Firestore or a dedicated Ledger DB
    await this.persistToLedger(event);
    
    return event;
  }

  /**
   * Verifies the integrity of the audit chain
   */
  public static verifyChain(events: ComplianceEvent[]): boolean {
    let expectedPreviousHash = '0'.repeat(64);

    for (const event of events) {
      if (event.previousHash !== expectedPreviousHash) {
        return false;
      }
      
      const currentHash = this.generateHash(event);
      if (event.hash !== currentHash) {
        return false;
      }
      
      expectedPreviousHash = event.hash;
    }
    return true;
  }

  private static async persistToLedger(event: ComplianceEvent): Promise<void> {
    // Implementation for secure storage (e.g., Firestore collection 'audit_trail')
    console.log(`[AUDIT_LOG] Event ${event.id} persisted with hash ${event.hash}`);
  }
}

export default ComplianceAuditTrail;