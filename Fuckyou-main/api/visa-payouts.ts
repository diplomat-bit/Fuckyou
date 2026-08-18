import { Router, Request, Response, NextFunction } from 'express';
import axios from 'axios';
import * as crypto from 'crypto';
import * as fs from 'fs';
import * as path from 'path';
import * as https from 'https';
import { logger } from './utils/logger';
import { safeJsonStringify, generateCryptoHash, generateUETR } from './utils/ledgerSync';

// Interfaces for Visa Receiver Directed Payouts (RDP)
interface VisaCardDetails {
  pan: string;
  expirationMonth: string;
  expirationYear: string;
  cvv2?: string;
  cardholderName: string;
}

interface ReceiverDetails {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  postalCode: string;
  countryCode: string; // ISO 3166-1 alpha-2 (e.g., "US")
}

interface PayoutRequest {
  amount: number;
  currency: string; // ISO 4217 (e.g., "USD")
  cardDetails: VisaCardDetails;
  receiverDetails: ReceiverDetails;
  senderReference: string;
  sourceOfFunds: '01' | '02' | '03' | '04' | '05'; // 01 = Credit, 02 = Debit, etc.
}

interface VisaConfig {
  apiKey: string;
  sharedSecret: string;
  baseUrl: string;
  certPath?: string;
  keyPath?: string;
  caPath?: string;
  useSandbox: boolean;
}

// Load Visa Configuration from environment or secrets
const getVisaConfig = (): VisaConfig => {
  return {
    apiKey: process.env.VISA_API_KEY || 'mock_api_key_12345',
    sharedSecret: process.env.VISA_SHARED_SECRET || 'mock_shared_secret_67890',
    baseUrl: process.env.VISA_BASE_URL || 'https://sandbox.api.visa.com',
    certPath: process.env.VISA_CERT_PATH,
    keyPath: process.env.VISA_KEY_PATH,
    caPath: process.env.VISA_CA_PATH,
    useSandbox: process.env.VISA_USE_SANDBOX !== 'false',
  };
};

/**
 * Generates the X-Pay-Token header required for Visa API authentication
 * when using API Key + Shared Secret.
 */
function generateXPayToken(
  resourcePath: string,
  queryString: string,
  requestBody: string,
  sharedSecret: string,
  apiKey: string
): { token: string; timestamp: number } {
  const timestamp = Math.floor(Date.now() / 1000);
  const preHash = timestamp + resourcePath + queryString + requestBody;
  const hash = crypto
    .createHmac('sha256', sharedSecret)
    .update(preHash)
    .digest('hex');
  return {
    token: `xv2:${timestamp}:${hash}`,
    timestamp,
  };
}

/**
 * Configures the HTTPS Agent for Mutual SSL (mTLS) if certificates are provided.
 */
function getHttpsAgent(config: VisaConfig): https.Agent | undefined {
  if (config.certPath && config.keyPath) {
    try {
      const cert = fs.readFileSync(path.resolve(config.certPath));
      const key = fs.readFileSync(path.resolve(config.keyPath));
      const ca = config.caPath ? fs.readFileSync(path.resolve(config.caPath)) : undefined;

      return new https.Agent({
        cert,
        key,
        ca,
        rejectUnauthorized: true,
      });
    } catch (error) {
      logger.error('Failed to load Visa mTLS certificates, falling back to standard agent', { error });
    }
  }
  return undefined;
}

const router = Router();

/**
 * POST /api/visa-payouts/validate
 * Validates a card's eligibility for receiving payouts (Account Inquiry / OCT eligibility check).
 */
router.post('/validate', async (req: Request, res: Response, next: NextFunction) => {
  const auditActor = { id: 'SYSTEM', role: 'OPERATOR' };
  logger.info('Initiating Visa Card Validation / Account Inquiry', { actor: auditActor });

  try {
    const { pan, expirationMonth, expirationYear, cardholderName } = req.body as VisaCardDetails;

    if (!pan || !expirationMonth || !expirationYear) {
      return res.status(400).json({
        success: false,
        error: 'Missing required card details: pan, expirationMonth, and expirationYear are mandatory.',
      });
    }

    const config = getVisaConfig();
    const resourcePath = '/visadirect/v2/accountinquiry';
    const queryString = `apikey=${config.apiKey}`;
    
    const requestBody = JSON.stringify({
      primaryAccountNumber: pan,
      cardExpiryMonth: expirationMonth,
      cardExpiryYear: expirationYear,
      acquiringBin: '400000', // Default mock acquiring BIN
      systemsTraceAuditNumber: Math.floor(100000 + Math.random() * 900000).toString(),
    });

    if (config.useSandbox) {
      // Simulate Visa Account Inquiry Sandbox Response
      logger.info('Using Visa Sandbox for Card Validation');
      const isEligible = !pan.startsWith('4111'); // Simulate some failures for specific test cards
      
      return res.status(200).json({
        success: true,
        sandbox: true,
        eligible: isEligible,
        cardBrand: 'Visa',
        accountInquiryResponse: {
          actionCode: isEligible ? '00' : '05',
          approvalCode: isEligible ? '123456' : undefined,
          description: isEligible ? 'Approved or completed successfully' : 'Do not honor / Ineligible for OCT',
          fastFundsIndicator: isEligible ? 'Y' : 'N',
          onlineBillingAddressVerificationResult: 'M',
        },
      });
    }

    // Live Visa API Call
    const { token } = generateXPayToken(resourcePath, queryString, requestBody, config.sharedSecret, config.apiKey);
    const agent = getHttpsAgent(config);

    const response = await axios.post(`${config.baseUrl}${resourcePath}?${queryString}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Pay-Token': token,
      },
      httpsAgent: agent,
    });

    const responseData = response.data;
    const eligible = responseData.actionCode === '00' && responseData.fastFundsIndicator === 'Y';

    return res.status(200).json({
      success: true,
      eligible,
      cardBrand: 'Visa',
      accountInquiryResponse: responseData,
    });

  } catch (error: any) {
    logger.error('Visa Card Validation Error', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      error: 'Visa Card Validation failed',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * POST /api/visa-payouts/payout
 * Initiates a Receiver Directed Payout (Original Credit Transaction - OCT).
 */
router.post('/payout', async (req: Request, res: Response, next: NextFunction) => {
  const auditActor = { id: 'SYSTEM', role: 'OPERATOR' };
  const transactionId = generateUETR();
  logger.info('Initiating Visa Receiver Directed Payout', { transactionId, actor: auditActor });

  try {
    const { amount, currency, cardDetails, receiverDetails, senderReference, sourceOfFunds } = req.body as PayoutRequest;

    if (!amount || !currency || !cardDetails || !receiverDetails) {
      return res.status(400).json({
        success: false,
        error: 'Missing required payout parameters: amount, currency, cardDetails, and receiverDetails are mandatory.',
      });
    }

    // Basic AML / Compliance Check Simulation
    if (amount > 10000) {
      logger.warn('Payout exceeds standard compliance threshold. Flagging for review.', { transactionId });
      return res.status(403).json({
        success: false,
        error: 'Transaction blocked: Amount exceeds maximum single payout limit for Receiver Directed Payouts.',
      });
    }

    const config = getVisaConfig();
    const resourcePath = '/visadirect/v2/payouts';
    const queryString = `apikey=${config.apiKey}`;

    const requestBody = JSON.stringify({
      amount: amount.toFixed(2),
      senderCurrencyCode: currency,
      recipientPrimaryAccountNumber: cardDetails.pan,
      recipientCardExpiryMonth: cardDetails.expirationMonth,
      recipientCardExpiryYear: cardDetails.expirationYear,
      recipientName: cardDetails.cardholderName,
      recipientAddress: receiverDetails.address,
      recipientCity: receiverDetails.city,
      recipientState: receiverDetails.state,
      recipientCountryCode: receiverDetails.countryCode,
      senderReference,
      sourceOfFunds,
      localTransactionDateTime: new Date().toISOString().slice(0, 19),
      systemsTraceAuditNumber: Math.floor(100000 + Math.random() * 900000).toString(),
      retrievalReferenceNumber: Math.floor(100000000000 + Math.random() * 900000000000).toString(),
    });

    if (config.useSandbox) {
      // Simulate Visa Payout Sandbox Response
      logger.info('Simulating Visa Payout Sandbox Response', { transactionId });
      
      const mockVisaTxId = 'VISA-' + crypto.randomBytes(8).toString('hex').toUpperCase();
      const ledgerPayload = {
        transactionId,
        visaTransactionId: mockVisaTxId,
        amount,
        currency,
        recipient: cardDetails.cardholderName,
        status: 'SETTLED',
        timestamp: new Date().toISOString(),
        hash: generateCryptoHash(safeJsonStringify({ transactionId, amount, currency })),
      };

      // Log to Sovereign Ledger Sync
      logger.info('Synchronizing Visa Payout with Sovereign Ledger', { ledgerPayload });

      return res.status(200).json({
        success: true,
        sandbox: true,
        transactionId,
        visaTransactionId: mockVisaTxId,
        status: 'COMPLETED',
        approvalCode: '888888',
        payoutResponse: {
          actionCode: '00',
          approvalCode: '888888',
          transmissionDateTime: new Date().toISOString(),
          transactionIdentifier: mockVisaTxId,
        },
      });
    }

    // Live Visa API Call
    const { token } = generateXPayToken(resourcePath, queryString, requestBody, config.sharedSecret, config.apiKey);
    const agent = getHttpsAgent(config);

    const response = await axios.post(`${config.baseUrl}${resourcePath}?${queryString}`, requestBody, {
      headers: {
        'Content-Type': 'application/json',
        'Accept': 'application/json',
        'X-Pay-Token': token,
      },
      httpsAgent: agent,
    });

    const responseData = response.data;
    const status = responseData.actionCode === '00' ? 'COMPLETED' : 'FAILED';

    return res.status(200).json({
      success: true,
      transactionId,
      visaTransactionId: responseData.transactionIdentifier,
      status,
      approvalCode: responseData.approvalCode,
      payoutResponse: responseData,
    });

  } catch (error: any) {
    logger.error('Visa Payout Execution Error', { error: error.message, stack: error.stack });
    return res.status(500).json({
      success: false,
      error: 'Visa Payout execution failed',
      details: error.response?.data || error.message,
    });
  }
});

/**
 * GET /api/visa-payouts/status/:id
 * Retrieves the status of a specific payout transaction.
 */
router.get('/status/:id', async (req: Request, res: Response) => {
  const { id } = req.params;
  logger.info('Querying Visa Payout Status', { transactionId: id });

  try {
    const config = getVisaConfig();
    
    if (config.useSandbox) {
      // Return simulated status
      return res.status(200).json({
        success: true,
        transactionId: id,
        status: 'COMPLETED',
        clearingAndSettlementStatus: 'SETTLED',
        updatedAt: new Date().toISOString(),
      });
    }

    // Live Visa Transaction Inquiry
    const resourcePath = `/visadirect/v2/payouts/${id}`;
    const queryString = `apikey=${config.apiKey}`;
    const { token } = generateXPayToken(resourcePath, queryString, '', config.sharedSecret, config.apiKey);
    const agent = getHttpsAgent(config);

    const response = await axios.get(`${config.baseUrl}${resourcePath}?${queryString}`, {
      headers: {
        'Accept': 'application/json',
        'X-Pay-Token': token,
      },
      httpsAgent: agent,
    });

    return res.status(200).json({
      success: true,
      transactionId: id,
      status: response.data.status,
      payoutResponse: response.data,
    });

  } catch (error: any) {
    logger.error('Visa Status Inquiry Error', { transactionId: id, error: error.message });
    return res.status(500).json({
      success: false,
      error: 'Failed to retrieve Visa payout status',
      details: error.response?.data || error.message,
    });
  }
});

export default router;