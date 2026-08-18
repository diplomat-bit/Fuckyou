import { EventEmitter } from 'events';
import { logger } from '../api/utils/logger';
import { complianceEngine } from '../api/utils/complianceEngine';
import { Transaction } from '../server/models/transaction.model';

/**
 * Part 24: AI Compliance Advisor
 * Real-time transaction monitoring and automated compliance recommendation engine.
 */

export interface ComplianceRecommendation {
  transactionId: string;
  status: 'APPROVED' | 'FLAGGED' | 'REJECTED';
  riskScore: number;
  reasoning: string;
  suggestedActions: string[];
  timestamp: number;
}

class AIComplianceAgent extends EventEmitter {
  private static instance: AIComplianceAgent;

  private constructor() {
    super();
    this.initializeMonitoring();
  }

  public static getInstance(): AIComplianceAgent {
    if (!AIComplianceAgent.instance) {
      AIComplianceAgent.instance = new AIComplianceAgent();
    }
    return AIComplianceAgent.instance;
  }

  private initializeMonitoring() {
    this.on('transaction_received', async (tx: Transaction) => {
      await this.analyzeTransaction(tx);
    });
  }

  public async analyzeTransaction(tx: Transaction): Promise<ComplianceRecommendation> {
    logger.info(`[ComplianceAgent] Analyzing transaction: ${tx.id}`);

    try {
      // Run through the compliance engine logic
      const riskAssessment = await complianceEngine.evaluate(tx);
      
      const recommendation: ComplianceRecommendation = {
        transactionId: tx.id,
        status: riskAssessment.score > 0.8 ? 'REJECTED' : (riskAssessment.score > 0.5 ? 'FLAGGED' : 'APPROVED'),
        riskScore: riskAssessment.score,
        reasoning: riskAssessment.summary,
        suggestedActions: riskAssessment.mitigationSteps,
        timestamp: Date.now()
      };

      if (recommendation.status !== 'APPROVED') {
        this.emit('compliance_alert', recommendation);
        logger.warn(`[ComplianceAgent] Alert for ${tx.id}: ${recommendation.reasoning}`);
      }

      return recommendation;
    } catch (error) {
      logger.error(`[ComplianceAgent] Error analyzing transaction ${tx.id}:`, error);
      throw new Error('Compliance analysis failed');
    }
  }

  public async getComplianceReport(userId: string) {
    // Interface for fetching historical compliance data
    return await complianceEngine.getAuditHistory(userId);
  }
}

export const complianceAgent = AIComplianceAgent.getInstance();

export default complianceAgent;