import { CitiGateway } from '../api/citi';
import { SovereignLedger } from '../api/sovereign';
import { ComplianceEngine } from './utils/complianceEngine';
import { Logger } from './utils/logger';

/**
 * Part 17: Citi & Sovereign Ledger Bridge
 * Orchestrates the synchronization between traditional Citi banking rails
 * and the Sovereign digital asset ledger, enforcing compliance at the bridge layer.
 */

export interface BridgeTransactionRequest {
  citiAccountId: string;
  sovereignWalletId: string;
  amount: number;
  currency: string;
  complianceToken: string;
  metadata: Record<string, any>;
}

export class CitiSovereignBridge {
  private citi: CitiGateway;
  private ledger: SovereignLedger;
  private compliance: ComplianceEngine;
  private logger: Logger;

  constructor() {
    this.citi = new CitiGateway();
    this.ledger = new SovereignLedger();
    this.compliance = new ComplianceEngine();
    this.logger = new Logger('CitiSovereignBridge');
  }

  /**
   * Executes a cross-ledger transfer with pre-flight compliance checks.
   */
  public async executeBridgeTransfer(request: BridgeTransactionRequest): Promise<{ success: boolean; txHash?: string; error?: string }> {
    try {
      this.logger.info(`Initiating bridge transfer: ${request.citiAccountId} -> ${request.sovereignWalletId}`);

      // 1. Validate Compliance
      const isCompliant = await this.compliance.verifyTransaction({
        amount: request.amount,
        currency: request.currency,
        origin: 'CITI_CONNECT',
        destination: 'SOVEREIGN_LEDGER',
        token: request.complianceToken
      });

      if (!isCompliant) {
        throw new Error('Compliance verification failed for cross-ledger transfer.');
      }

      // 2. Debit Citi Account
      const citiResponse = await this.citi.initiateTransfer({
        accountId: request.citiAccountId,
        amount: request.amount,
        currency: request.currency,
        reference: `SOV-BRIDGE-${Date.now()}`
      });

      if (!citiResponse || !citiResponse.status) {
        throw new Error('Citi banking rail transfer failed.');
      }

      // 3. Credit Sovereign Ledger
      const ledgerResponse = await this.ledger.mintAsset({
        walletId: request.sovereignWalletId,
        amount: request.amount,
        assetType: 'DIGITAL_FIAT',
        originTx: citiResponse.transactionId
      });

      this.logger.info(`Bridge transfer successful: ${ledgerResponse.txHash}`);

      return {
        success: true,
        txHash: ledgerResponse.txHash
      };

    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown bridge failure';
      this.logger.error(`Bridge failure: ${errorMessage}`);
      return {
        success: false,
        error: errorMessage
      };
    }
  }

  /**
   * Reconciles balances between Citi and Sovereign systems.
   */
  public async reconcileLedgers(citiAccountId: string, sovereignWalletId: string): Promise<number> {
    const citiBalance = await this.citi.getBalance(citiAccountId);
    const sovereignBalance = await this.ledger.getBalance(sovereignWalletId);

    const discrepancy = citiBalance - sovereignBalance;
    
    if (discrepancy !== 0) {
      this.logger.warn(`Ledger discrepancy detected: ${discrepancy}`);
    }

    return discrepancy;
  }
}

export default new CitiSovereignBridge();