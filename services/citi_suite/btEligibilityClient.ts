import { RequestInit, Response } from 'node-fetch';

/**
 * Balance Transfer Offer Interface representing a promo credit card/loan offer.
 */
export interface BTOffer {
  offerId: string;
  partnerName: string;
  promotionalApr: number;
  durationMonths: number;
  transferFeePercentage: number;
  minTransferAmount: number;
  maxTransferAmount: number;
  estimatedSavings: number;
  termsAndConditionsUrl: string;
}

/**
 * Request payload structure for checking Balance Transfer eligibility.
 */
export interface BTEligibilityRequest {
  userId: string;
  accountId: string;
  targetBalanceAmount: number;
  currentApr?: number;
  creditScoreEstimate?: number;
  zipCode?: string;
  annualIncome?: number;
  sourceIssuer?: string;
  requestedOfferIds?: string[];
}

/**
 * Detailed breakdown of why eligibility was granted or denied.
 */
export interface EligibilityReason {
  code: string;
  category: 'CREDIT' | 'BALANCE' | 'ACCOUNT_STATUS' | 'POLICY' | 'GEO';
  description: string;
  passed: boolean;
}

/**
 * Response payload structure returned by the Balance Transfer Eligibility API.
 */
export interface BTEligibilityResponse {
  requestId: string;
  isEligible: boolean;
  maxApprovedAmount: number;
  minApprovedAmount: number;
  availableOffers: BTOffer[];
  reasons: EligibilityReason[];
  riskTier?: string;
  evaluatedAt: string;
  expiresAt: string;
}

/**
 * Request payload for validating a specific proposed balance transfer transaction.
 */
export interface BTValidationParams {
  userId: string;
  accountId: string;
  offerId: string;
  transferAmount: number;
  destinationAccountMasked: string;
}

/**
 * Response structure for balance transfer validation.
 */
export interface BTValidationResult {
  isValid: boolean;
  validationCode: string;
  errors: string[];
  calculatedFee: number;
  netTransferAmount: number;
  estimatedMonthlyPayment: number;
}

/**
 * Configuration options for initializing the BT Eligibility Client.
 */
export interface BTClientConfig {
  baseUrl: string;
  apiKey?: string;
  authToken?: string;
  tenantId?: string;
  environment?: 'development' | 'staging' | 'production';
  timeoutMs?: number;
  maxRetries?: number;
  defaultHeaders?: Record<string, string>;
  clientVersion?: string;
}

/**
 * Structure of custom headers passed per-request.
 */
export interface BTHeaderConfig {
  authorization?: string;
  apiKey?: string;
  correlationId?: string;
  tenantId?: string;
  idempotencyKey?: string;
  clientVersion?: string;
  customHeaders?: Record<string, string>;
}

/**
 * Custom Error class for Balance Transfer API operational errors.
 */
export class BTEligibilityError extends Error {
  public readonly statusCode?: number;
  public readonly errorCode: string;
  public readonly details?: Record<string, unknown>;
  public readonly isRetryable: boolean;

  constructor(
    message: string,
    errorCode: string = 'UNKNOWN_BT_ERROR',
    statusCode?: number,
    details?: Record<string, unknown>,
    isRetryable: boolean = false
  ) {
    super(message);
    this.name = 'BTEligibilityError';
    this.errorCode = errorCode;
    this.statusCode = statusCode;
    this.details = details;
    this.isRetryable = isRetryable;
    Object.setPrototypeOf(this, BTEligibilityError.prototype);
  }
}

/**
 * Gemini Tool Schema format compliant function declaration.
 */
export interface GeminiToolDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, unknown>;
    required?: string[];
  };
}

/**
 * API Client Service for handling interactions with the Balance Transfer Eligibility system.
 */
export class BTEligibilityClient {
  private baseUrl: string;
  private apiKey?: string;
  private authToken?: string;
  private tenantId?: string;
  private environment: string;
  private timeoutMs: number;
  private maxRetries: number;
  private defaultHeaders: Record<string, string>;
  private clientVersion: string;

  constructor(config: BTClientConfig) {
    if (!config.baseUrl) {
      throw new BTEligibilityError('baseUrl is required to initialize BTEligibilityClient', 'INVALID_CONFIG');
    }
    this.baseUrl = config.baseUrl.replace(/\/+$/, '');
    this.apiKey = config.apiKey;
    this.authToken = config.authToken;
    this.tenantId = config.tenantId;
    this.environment = config.environment || 'production';
    this.timeoutMs = config.timeoutMs ?? 10000;
    this.maxRetries = config.maxRetries ?? 3;
    this.defaultHeaders = config.defaultHeaders || {};
    this.clientVersion = config.clientVersion || '1.0.0';
  }

  /**
   * Set dynamic Authorization Bearer Token.
   */
  public setAuthToken(token: string): void {
    this.authToken = token;
  }

  /**
   * Set API Key.
   */
  public setApiKey(apiKey: string): void {
    this.apiKey = apiKey;
  }

  /**
   * Set Tenant ID for multi-tenant environments.
   */
  public setTenantId(tenantId: string): void {
    this.tenantId = tenantId;
  }

  /**
   * Build complete header dictionary merging client defaults and per-request configs.
   */
  public buildHeaders(headerOverrides?: BTHeaderConfig): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      'Accept': 'application/json',
      'X-Client-Version': headerOverrides?.clientVersion || this.clientVersion,
      'X-Environment': this.environment,
      ...this.defaultHeaders,
    };

    const effectiveAuth = headerOverrides?.authorization || (this.authToken ? `Bearer ${this.authToken}` : undefined);
    if (effectiveAuth) {
      headers['Authorization'] = effectiveAuth.startsWith('Bearer ') ? effectiveAuth : `Bearer ${effectiveAuth}`;
    }

    const effectiveApiKey = headerOverrides?.apiKey || this.apiKey;
    if (effectiveApiKey) {
      headers['X-API-Key'] = effectiveApiKey;
    }

    const effectiveTenantId = headerOverrides?.tenantId || this.tenantId;
    if (effectiveTenantId) {
      headers['X-Tenant-ID'] = effectiveTenantId;
    }

    if (headerOverrides?.correlationId) {
      headers['X-Correlation-ID'] = headerOverrides.correlationId;
    } else {
      headers['X-Correlation-ID'] = `bt-corr-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    }

    if (headerOverrides?.idempotencyKey) {
      headers['X-Idempotency-Key'] = headerOverrides.idempotencyKey;
    }

    if (headerOverrides?.customHeaders) {
      Object.assign(headers, headerOverrides.customHeaders);
    }

    return headers;
  }

  /**
   * Primary method: Check balance transfer eligibility for a given user & account request.
   */
  public async checkEligibility(
    request: BTEligibilityRequest,
    headerConfig?: BTHeaderConfig
  ): Promise<BTEligibilityResponse> {
    this.validateEligibilityRequest(request);
    const endpoint = `${this.baseUrl}/api/v1/eligibility/check`;
    return this.requestWithRetry<BTEligibilityResponse>(endpoint, {
      method: 'POST',
      body: JSON.stringify(request),
      headers: this.buildHeaders(headerConfig),
    });
  }

  /**
   * Retrieve all currently available offers for a balance transfer without running full hard-check evaluation.
   */
  public async getAvailableOffers(
    userId: string,
    accountId: string,
    headerConfig?: BTHeaderConfig
  ): Promise<BTOffer[]> {
    if (!userId || !accountId) {
      throw new BTEligibilityError('userId and accountId are required', 'INVALID_ARGUMENTS');
    }
    const query = new URLSearchParams({ userId, accountId }).toString();
    const endpoint = `${this.baseUrl}/api/v1/eligibility/offers?${query}`;

    const response = await this.requestWithRetry<{ offers: BTOffer[] }>(endpoint, {
      method: 'GET',
      headers: this.buildHeaders(headerConfig),
    });

    return response.offers || [];
  }

  /**
   * Validate parameters for an intended balance transfer before execution.
   */
  public async validateTransfer(
    params: BTValidationParams,
    headerConfig?: BTHeaderConfig
  ): Promise<BTValidationResult> {
    if (!params.offerId || !params.transferAmount || params.transferAmount <= 0) {
      throw new BTEligibilityError('Invalid transfer validation parameters', 'INVALID_ARGUMENTS');
    }

    const endpoint = `${this.baseUrl}/api/v1/eligibility/validate`;
    return this.requestWithRetry<BTValidationResult>(endpoint, {
      method: 'POST',
      body: JSON.stringify(params),
      headers: this.buildHeaders(headerConfig),
    });
  }

  /**
   * Perform a health check on the balance transfer eligibility service endpoint.
   */
  public async checkHealth(): Promise<{ status: 'OK' | 'DEGRADED' | 'DOWN'; latencyMs: number; timestamp: string }> {
    const startTime = Date.now();
    const endpoint = `${this.baseUrl}/health`;
    try {
      const response = await this.executeFetch(endpoint, {
        method: 'GET',
        headers: this.buildHeaders(),
      });
      const latencyMs = Date.now() - startTime;
      if (response.ok) {
        return { status: 'OK', latencyMs, timestamp: new Date().toISOString() };
      }
      return { status: 'DEGRADED', latencyMs, timestamp: new Date().toISOString() };
    } catch {
      return { status: 'DOWN', latencyMs: Date.now() - startTime, timestamp: new Date().toISOString() };
    }
  }

  /**
   * Internal wrapper around fetch API to support timeouts, retries, and unified error mapping.
   */
  private async requestWithRetry<T>(url: string, options: RequestInit): Promise<T> {
    let attempt = 0;
    let lastError: Error | null = null;

    while (attempt < this.maxRetries) {
      attempt++;
      try {
        const response = await this.executeFetchWithTimeout(url, options);
        if (!response.ok) {
          const errorBody = await response.json().catch(() => ({}));
          const isRetryable = response.status >= 500 || response.status === 429;
          throw new BTEligibilityError(
            (errorBody as { message?: string }).message || `HTTP Request failed with status ${response.status}`,
            (errorBody as { code?: string }).code || `HTTP_${response.status}`,
            response.status,
            errorBody as Record<string, unknown>,
            isRetryable
          );
        }
        return (await response.json()) as T;
      } catch (err: unknown) {
        const error = err as BTEligibilityError | Error;
        lastError = error;
        const isRetryable = error instanceof BTEligibilityError ? error.isRetryable : true;
        
        if (!isRetryable || attempt >= this.maxRetries) {
          break;
        }

        const backoffMs = Math.pow(2, attempt) * 200 + Math.random() * 100;
        await new Promise((resolve) => setTimeout(resolve, backoffMs));
      }
    }

    if (lastError instanceof BTEligibilityError) {
      throw lastError;
    }
    throw new BTEligibilityError(
      lastError?.message || 'Failed request after maximum retries',
      'MAX_RETRIES_EXCEEDED',
      undefined,
      { attempts: attempt },
      false
    );
  }

  private async executeFetchWithTimeout(url: string, options: RequestInit): Promise<Response> {
    const controller = typeof AbortController !== 'undefined' ? new AbortController() : null;
    const timeoutId = controller ? setTimeout(() => controller.abort(), this.timeoutMs) : null;

    try {
      const fetchOptions = {
        ...options,
        ...(controller ? { signal: controller.signal } : {}),
      };
      return await this.executeFetch(url, fetchOptions);
    } catch (err: unknown) {
      if ((err as Error)?.name === 'AbortError') {
        throw new BTEligibilityError(`Request timed out after ${this.timeoutMs}ms`, 'TIMEOUT_ERROR', undefined, {}, true);
      }
      throw err;
    } finally {
      if (timeoutId) clearTimeout(timeoutId);
    }
  }

  private async executeFetch(url: string, options: RequestInit): Promise<Response> {
    if (typeof fetch !== 'undefined') {
      return (fetch(url, options as any) as unknown) as Promise<Response>;
    }
    const nodeFetch = (await import('node-fetch')).default;
    return (nodeFetch(url, options as any) as unknown) as Promise<Response>;
  }

  private validateEligibilityRequest(req: BTEligibilityRequest): void {
    if (!req.userId) throw new BTEligibilityError('Field "userId" is required', 'VALIDATION_ERROR');
    if (!req.accountId) throw new BTEligibilityError('Field "accountId" is required', 'VALIDATION_ERROR');
    if (typeof req.targetBalanceAmount !== 'number' || req.targetBalanceAmount <= 0) {
      throw new BTEligibilityError('Field "targetBalanceAmount" must be a positive number', 'VALIDATION_ERROR');
    }
  }

  // =========================================================================
  // Gemini AI Function Calling Integration Layer
  // =========================================================================

  /**
   * Returns complete Gemini Function Declarations for AI model integration.
   */
  public static getGeminiToolDeclarations(): GeminiToolDeclaration[] {
    return [
      {
        name: 'checkBalanceTransferEligibility',
        description: 'Checks if a user is eligible for a balance transfer offer based on account info and requested amount.',
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: 'Unique user identifier' },
            accountId: { type: 'STRING', description: 'Source account ID' },
            targetBalanceAmount: { type: 'NUMBER', description: 'Amount user wishes to transfer in USD' },
            currentApr: { type: 'NUMBER', description: 'Current interest rate on the balance' },
            creditScoreEstimate: { type: 'NUMBER', description: 'Estimated credit score of the applicant' },
            zipCode: { type: 'STRING', description: '5-digit postal code' },
            annualIncome: { type: 'NUMBER', description: 'Gross annual income' },
            sourceIssuer: { type: 'STRING', description: 'Name of current card issuer' },
          },
          required: ['userId', 'accountId', 'targetBalanceAmount'],
        },
      },
      {
        name: 'getAvailableBalanceTransferOffers',
        description: 'Retrieves all standard balance transfer promotional offers available for an account.',
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: 'Unique user identifier' },
            accountId: { type: 'STRING', description: 'Target account ID' },
          },
          required: ['userId', 'accountId'],
        },
      },
      {
        name: 'validateBalanceTransferRequest',
        description: 'Validates specific balance transfer parameters and calculates exact fees and payments.',
        parameters: {
          type: 'OBJECT',
          properties: {
            userId: { type: 'STRING', description: 'Unique user identifier' },
            accountId: { type: 'STRING', description: 'Target account ID' },
            offerId: { type: 'STRING', description: 'Selected offer identifier' },
            transferAmount: { type: 'NUMBER', description: 'Proposed balance transfer amount' },
            destinationAccountMasked: { type: 'STRING', description: 'Masked identifier of account receiving funds' },
          },
          required: ['userId', 'accountId', 'offerId', 'transferAmount', 'destinationAccountMasked'],
        },
      },
    ];
  }

  /**
   * Helper execution handler enabling Gemini function calls to dispatch directly to client methods.
   */
  public async handleGeminiToolCall(
    name: string,
    args: Record<string, any>,
    headerOverrides?: BTHeaderConfig
  ): Promise<unknown> {
    switch (name) {
      case 'checkBalanceTransferEligibility':
        return this.checkEligibility(args as BTEligibilityRequest, headerOverrides);
      case 'getAvailableBalanceTransferOffers':
        return this.getAvailableOffers(args.userId, args.accountId, headerOverrides);
      case 'validateBalanceTransferRequest':
        return this.validateTransfer(args as BTValidationParams, headerOverrides);
      default:
        throw new BTEligibilityError(`Unknown Gemini tool function name: ${name}`, 'UNSUPPORTED_GEMINI_TOOL');
    }
  }
}

export default BTEligibilityClient;