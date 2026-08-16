import { AlpacaClient } from '../api/alpaca';
import { ComplianceEngine } from './utils/complianceEngine';
import { logger } from './utils/logger';

/**
 * Part 16: Alpaca Compliance Bridge
 * Integrates Alpaca trading APIs with H.R.3633 compliance checks.
 * Ensures all trades meet regulatory standards before execution.
 */

export interface ComplianceTradeRequest {
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit';
  time_in_force: 'day' | 'gtc';
  userId: string;
}

export class AlpacaComplianceBridge {
  private alpaca: AlpacaClient;
  private compliance: ComplianceEngine;

  constructor(apiKey: string, apiSecret: string, baseUrl: string) {
    this.alpaca = new AlpacaClient(apiKey, apiSecret, baseUrl);
    this.compliance = new ComplianceEngine();
  }

  /**
   * Executes a trade only if it passes H.R.3633 regulatory compliance checks.
   */
  async executeCompliantTrade(request: ComplianceTradeRequest) {
    try {
      logger.info(`Initiating compliance check for user ${request.userId} on symbol ${request.symbol}`);

      // Perform H.R.3633 Regulatory Validation
      const complianceResult = await this.compliance.verifyTradeCompliance({
        userId: request.userId,
        symbol: request.symbol,
        side: request.side,
        amount: request.qty,
        timestamp: Date.now(),
        regulationCode: 'HR-3633'
      });

      if (!complianceResult.isAllowed) {
        logger.error(`Trade blocked by compliance engine: ${complianceResult.reason}`);
        throw new Error(`Compliance Violation: ${complianceResult.reason}`);
      }

      // Proceed to Alpaca execution if compliant
      logger.info(`Compliance check passed. Routing to Alpaca for ${request.symbol}`);
      
      const order = await this.alpaca.placeOrder({
        symbol: request.symbol,
        qty: request.qty,
        side: request.side,
        type: request.type,
        time_in_force: request.time_in_force
      });

      return {
        status: 'success',
        orderId: order.id,
        complianceReference: complianceResult.auditId
      };

    } catch (error) {
      logger.error('AlpacaComplianceBridge Execution Error', { error });
      throw error;
    }
  }

  /**
   * Validates account standing against sovereign treasury requirements
   */
  async validateAccountStatus(userId: string): Promise<boolean> {
    const status = await this.compliance.checkAccountStanding(userId);
    // Fixed: Ensure compatibility with potential API changes where 'valid' is the property
    return (status as any).valid ?? status.isValid;
  }
}

export default AlpacaComplianceBridge;