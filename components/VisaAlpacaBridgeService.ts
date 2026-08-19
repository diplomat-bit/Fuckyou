

// --- CONSOLIDATED FROM: ./services/VisaAlpacaBridgeService.ts ---

import axios, { AxiosInstance } from 'axios';
import { v4 as uuidv4 } from 'uuid';
import { alpacaTradingService } from './AlpacaTradingService';
import { logger } from '../api/utils/logger';

export interface VisaRdpPayoutRequest {
  amount: number;
  currency: string;
  cardToken: string;
  referenceId: string;
}

export interface VisaAlpacaSyncRecord {
  id: string;
  alpacaOrderId: string;
  visaTransactionId: string;
  status: 'PENDING' | 'COMPLETED' | 'FAILED';
  timestamp: number;
}

class VisaAlpacaBridgeService {
  private apiClient: AxiosInstance;

  constructor() {
    this.apiClient = axios.create({
      baseURL: process.env.VISA_RDP_API_URL || 'https://api.visa.com/rdp/v1',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${process.env.VISA_API_KEY}`
      }
    });
  }

  /**
   * Executes a synchronized sale of assets on Alpaca and triggers a Visa RDP payout.
   */
  async executeInstantLiquidityPayout(
    symbol: string,
    quantity: number,
    cardToken: string
  ): Promise<VisaAlpacaSyncRecord> {
    const transactionId = uuidv4();
    
    try {
      logger.info(`Initiating instant liquidity payout for ${symbol}`, { transactionId });

      // 1. Execute Sale on Alpaca
      const order = await alpacaTradingService.placeOrder({
        symbol,
        qty: quantity,
        side: 'sell',
        type: 'market',
        time_in_force: 'gtc'
      });

      if (!order || !order.id) {
        throw new Error('Failed to execute Alpaca sale order');
      }

      // 2. Calculate Payout Amount (Simplified for bridge logic)
      const payoutAmount = order.filled_avg_price ? parseFloat(order.filled_avg_price) * quantity : 0;

      // 3. Trigger Visa RDP Payout
      const visaResponse = await this.apiClient.post('/payouts', {
        amount: payoutAmount,
        currency: 'USD',
        cardToken,
        referenceId: transactionId
      });

      const record: VisaAlpacaSyncRecord = {
        id: transactionId,
        alpacaOrderId: order.id,
        visaTransactionId: visaResponse.data.transactionId,
        status: 'COMPLETED',
        timestamp: Date.now()
      };

      logger.info(`Liquidity payout completed successfully`, { record });
      return record;

    } catch (error) {
      logger.error(`Visa-Alpaca bridge failure`, { transactionId, error });
      return {
        id: transactionId,
        alpacaOrderId: 'N/A',
        visaTransactionId: 'N/A',
        status: 'FAILED',
        timestamp: Date.now()
      };
    }
  }

  async getTransactionStatus(transactionId: string): Promise<VisaAlpacaSyncRecord | null> {
    // Implementation for fetching status from local ledger/DB
    return null;
  }
}

export const visaAlpacaBridgeService = new VisaAlpacaBridgeService();