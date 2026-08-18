export type PaymentMethod = 'FAST' | 'GIRO' | 'CHIPS' | 'SWIFT' | 'FEDWIRE' | 'SEPA';

export type PaymentStatus = 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FAILED' | 'REJECTED';

export interface AccountDetails {
  accountNumber: string;
  accountName: string;
  bankCode: string;
  bankName: string;
  bic?: string;
  routingNumber?: string;
}

export interface PaymentTransaction {
  id: string;
  amount: number;
  currency: string;
  sender: AccountDetails;
  receiver: AccountDetails;
  paymentMethod: PaymentMethod;
  reference: string;
  status: PaymentStatus;
  createdAt: string;
  updatedAt: string;
  fee: number;
  description?: string;
  metadata?: Record<string, string>;
}

export interface ErrorDetail {
  field?: string;
  location: 'body' | 'query' | 'path' | 'header';
  message: string;
  code: string;
}

export interface ErrorResponse {
  statusCode: number;
  error: string;
  message: string;
  code: string;
  timestamp: string;
  path?: string;
  details?: ErrorDetail[];
}

export interface PaginatedResponse<T> {
  data: T[];
  total: number;
  page: number;
  limit: number;
  hasMore: boolean;
}

// Helper to generate deterministic-looking random IDs
const generateId = (prefix: string = 'tx'): string => {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let result = '';
  for (let i = 0; i < 12; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return `${prefix}_${result}`;
};

// Helper to generate random dates within a range
const getRandomDate = (start: Date, end: Date): Date => {
  return new Date(start.getTime() + Math.random() * (end.getTime() - start.getTime()));
};

// Mock Bank Names and Codes
const BANKS: Record<PaymentMethod, { name: string; code: string; bic: string }[]> = {
  FAST: [
    { name: 'DBS Bank', code: '7171', bic: 'DBSSSGSGXXX' },
    { name: 'OCBC Bank', code: '7339', bic: 'OCBCSGSGXXX' },
    { name: 'UOB Bank', code: '7378', bic: 'UOVBSGSGXXX' }
  ],
  GIRO: [
    { name: 'Standard Chartered Singapore', code: '9401', bic: 'SCBLSGSGXXX' },
    { name: 'Citibank Singapore', code: '7214', bic: 'CITISGSGXXX' },
    { name: 'HSBC Singapore', code: '7232', bic: 'HSBCSGSGXXX' }
  ],
  CHIPS: [
    { name: 'JPMorgan Chase Bank', code: '0002', bic: 'CHASUS33XXX' },
    { name: 'Citibank N.A.', code: '0008', bic: 'CITIUS33XXX' },
    { name: 'Bank of America', code: '0003', bic: 'BOFAUS3NXXX' }
  ],
  SWIFT: [
    { name: 'Deutsche Bank AG', code: 'DEUT', bic: 'DEUTDEDDFXX' },
    { name: 'Barclays Bank PLC', code: 'BARC', bic: 'BARCGB22XXX' },
    { name: 'BNP Paribas', code: 'BNPA', bic: 'BNPAFRPPXXX' }
  ],
  FEDWIRE: [
    { name: 'Federal Reserve Bank of New York', code: '021001208', bic: 'FRNYUS33XXX' },
    { name: 'Wells Fargo Bank', code: '121000248', bic: 'WFCNUS33XXX' }
  ],
  SEPA: [
    { name: 'Societe Generale', code: 'SOGE', bic: 'SOGEFRPPXXX' },
    { name: 'Banco Santander', code: 'BSAN', bic: 'BSANESMMXXX' },
    { name: 'Commerzbank AG', code: 'COBA', bic: 'COBADEFFXXX' }
  ]
};

const CURRENCIES: Record<PaymentMethod, string> = {
  FAST: 'SGD',
  GIRO: 'SGD',
  CHIPS: 'USD',
  SWIFT: 'EUR',
  FEDWIRE: 'USD',
  SEPA: 'EUR'
};

export class MockDataService {
  /**
   * Generates a single mock transaction based on specified payment method and status
   */
  public static generateTransaction(
    overrides: Partial<PaymentTransaction> = {}
  ): PaymentTransaction {
    const paymentMethod = overrides.paymentMethod || (['FAST', 'GIRO', 'CHIPS', 'SWIFT', 'FEDWIRE', 'SEPA'][Math.floor(Math.random() * 6)] as PaymentMethod);
    const currency = overrides.currency || CURRENCIES[paymentMethod];
    const status = overrides.status || (['COMPLETED', 'PENDING', 'PROCESSING', 'FAILED', 'REJECTED'][Math.floor(Math.random() * 5)] as PaymentStatus);
    
    const bankList = BANKS[paymentMethod];
    const senderBank = bankList[Math.floor(Math.random() * bankList.length)];
    const receiverBank = bankList[(Math.floor(Math.random() * bankList.length) + 1) % bankList.length];

    const createdDate = getRandomDate(new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), new Date());
    const updatedDate = new Date(createdDate.getTime() + (status === 'COMPLETED' ? 1000 * 60 * 5 : 0));

    return {
      id: generateId('tx'),
      amount: parseFloat((Math.random() * 10000 + 10).toFixed(2)),
      currency,
      sender: {
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        accountName: ['Acme Corp', 'Global Industries Ltd', 'Tech Solutions Inc', 'John Doe', 'Jane Smith'][Math.floor(Math.random() * 5)],
        bankCode: senderBank.code,
        bankName: senderBank.name,
        bic: senderBank.bic,
        routingNumber: paymentMethod === 'FEDWIRE' || paymentMethod === 'CHIPS' ? senderBank.code : undefined
      },
      receiver: {
        accountNumber: Math.floor(1000000000 + Math.random() * 9000000000).toString(),
        accountName: ['Apex Trading', 'Delta Logistics', 'Alpha Beta LLC', 'Robert Chen', 'Sarah Jenkins'][Math.floor(Math.random() * 5)],
        bankCode: receiverBank.code,
        bankName: receiverBank.name,
        bic: receiverBank.bic,
        routingNumber: paymentMethod === 'FEDWIRE' || paymentMethod === 'CHIPS' ? receiverBank.code : undefined
      },
      paymentMethod,
      reference: `REF-${Math.floor(100000 + Math.random() * 900000)}`,
      status,
      createdAt: createdDate.toISOString(),
      updatedAt: updatedDate.toISOString(),
      fee: parseFloat((Math.random() * 5 + 0.50).toFixed(2)),
      description: `Invoice payment for ${paymentMethod} transfer`,
      metadata: {
        environment: 'sandbox',
        initiatedBy: 'api_client_01'
      },
      ...overrides
    };
  }

  /**
   * Generates a list of mock transactions
   */
  public static generateTransactions(count: number = 10, overrides: Partial<PaymentTransaction> = {}): PaymentTransaction[] {
    return Array.from({ length: count }, () => this.generateTransaction(overrides));
  }

  /**
   * Simulates a paginated API response
   */
  public static getPaginatedTransactions(
    page: number = 1,
    limit: number = 10,
    paymentMethod?: PaymentMethod
  ): PaginatedResponse<PaymentTransaction> {
    const total = 45; // Fixed total for realistic pagination simulation
    const hasMore = page * limit < total;
    const data = Array.from({ length: Math.min(limit, total - (page - 1) * limit) }, () => 
      this.generateTransaction(paymentMethod ? { paymentMethod } : {})
    );

    return {
      data,
      total,
      page,
      limit,
      hasMore
    };
  }

  /**
   * Returns an empty 204 No Content response representation
   */
  public static getEmptyResponse(): null {
    return null;
  }

  /**
   * Generates a mock 400 Bad Request response
   */
  public static get400BadRequest(path: string = '/v1/payments'): ErrorResponse {
    return {
      statusCode: 400,
      error: 'Bad Request',
      message: 'The request could not be understood by the server due to malformed syntax.',
      code: 'BAD_REQUEST',
      timestamp: new Date().toISOString(),
      path,
      details: [
        {
          field: 'amount',
          location: 'body',
          message: 'Amount must be a positive number greater than zero.',
          code: 'INVALID_AMOUNT'
        },
        {
          field: 'currency',
          location: 'body',
          message: 'Currency code must be a valid 3-letter ISO code.',
          code: 'INVALID_CURRENCY'
        }
      ]
    };
  }

  /**
   * Generates a mock 401 Unauthorized response
   */
  public static get401Unauthorized(path: string = '/v1/payments'): ErrorResponse {
    return {
      statusCode: 401,
      error: 'Unauthorized',
      message: 'Authentication is required and has failed or has not yet been provided.',
      code: 'UNAUTHORIZED',
      timestamp: new Date().toISOString(),
      path,
      details: [
        {
          location: 'header',
          message: 'Missing or invalid Authorization bearer token.',
          code: 'INVALID_TOKEN'
        }
      ]
    };
  }

  /**
   * Generates a mock 403 Forbidden response
   */
  public static get403Forbidden(path: string = '/v1/payments'): ErrorResponse {
    return {
      statusCode: 403,
      error: 'Forbidden',
      message: 'The server understood the request, but is refusing to fulfill it.',
      code: 'FORBIDDEN',
      timestamp: new Date().toISOString(),
      path,
      details: [
        {
          location: 'header',
          message: 'Your API key does not have write permissions for this resource.',
          code: 'INSUFFICIENT_PERMISSIONS'
        }
      ]
    };
  }

  /**
   * Generates a mock 422 Unprocessable Entity response
   */
  public static get422UnprocessableEntity(path: string = '/v1/payments'): ErrorResponse {
    return {
      statusCode: 422,
      error: 'Unprocessable Entity',
      message: 'The request was well-formed but was unable to be followed due to semantic errors.',
      code: 'UNPROCESSABLE_ENTITY',
      timestamp: new Date().toISOString(),
      path,
      details: [
        {
          field: 'sender.accountNumber',
          location: 'body',
          message: 'The sender account has insufficient funds to complete this transaction.',
          code: 'INSUFFICIENT_FUNDS'
        },
        {
          field: 'receiver.bankCode',
          location: 'body',
          message: 'The receiving bank code is currently inactive or unreachable.',
          code: 'BANK_UNREACHABLE'
        }
      ]
    };
  }

  /**
   * Generates a mock 500 Internal Server Error response
   */
  public static get500InternalServerError(path: string = '/v1/payments'): ErrorResponse {
    return {
      statusCode: 500,
      error: 'Internal Server Error',
      message: 'An unexpected error occurred on the server. Please try again later.',
      code: 'INTERNAL_SERVER_ERROR',
      timestamp: new Date().toISOString(),
      path,
      details: [
        {
          location: 'header',
          message: 'Database connection timeout while processing transaction state.',
          code: 'DATABASE_TIMEOUT'
        }
      ]
    };
  }

  /**
   * Simulates a response based on status code
   */
  public static simulateResponse(statusCode: number, path: string = '/v1/payments'): any {
    switch (statusCode) {
      case 200:
        return this.generateTransaction();
      case 201:
        return this.generateTransaction({ status: 'PENDING' });
      case 204:
        return this.getEmptyResponse();
      case 400:
        return this.get400BadRequest(path);
      case 401:
        return this.get401Unauthorized(path);
      case 403:
        return this.get403Forbidden(path);
      case 422:
        return this.get422UnprocessableEntity(path);
      case 500:
        return this.get500InternalServerError(path);
      default:
        return this.get500InternalServerError(path);
    }
  }
}