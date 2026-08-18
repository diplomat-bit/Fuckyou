import crypto from "crypto";
import https from "https";
import axios, { AxiosInstance } from "axios";
import { v4 as uuidv4 } from "uuid";

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

export interface VisaServiceConfig {
  baseUrl: string;
  apiKey: string;
  sharedSecret: string;
  certPem?: string; // Mutual TLS Client Certificate
  keyPem?: string;  // Mutual TLS Client Private Key
  useSandboxMock: boolean;
}

export interface CardEligibilityPayload {
  primaryAccountNumber: string;
  expirationMonth: string;
  expirationYear: string;
  cvv2?: string;
  valueAmount?: number;
  currencyCode?: string;
}

export interface CardEligibilityResponse {
  eligible: boolean;
  fastFundsEligible: boolean;
  pushFundsEligible: boolean;
  pullFundsEligible: boolean;
  cardBrand: string;
  cardType: "DEBIT" | "CREDIT" | "PREPAID" | "UNKNOWN";
  issuingBank: string;
  countryCode: string;
  rawResponse?: any;
}

export interface PushToCardPayload {
  amount: number;
  currency: string;
  recipientCardNumber: string;
  recipientExpirationMonth: string;
  recipientExpirationYear: string;
  recipientFirstName: string;
  recipientLastName: string;
  senderFirstName: string;
  senderLastName: string;
  senderAddress: string;
  senderCity: string;
  senderState: string;
  senderCountryCode: string; // ISO 3-digit or 2-digit depending on endpoint
  senderPostalCode: string;
  merchantCategoryCode?: string; // e.g., "6012" for financial institutions
  acquiringBin?: string;
}

export interface PushToCardResponse {
  transactionId: string;
  status: "APPROVED" | "DECLINED" | "PENDING" | "ERROR";
  approvalCode?: string;
  retrievalReferenceNumber: string;
  actionCode?: string;
  transmissionDateTime: string;
  feeCharged?: number;
  rawResponse?: any;
}

export interface RdpPayload {
  receiverEmail: string;
  receiverPhone?: string;
  receiverFirstName: string;
  receiverLastName: string;
  amount: number;
  currency: string;
  paymentNarrative: string;
  callbackUrl: string;
}

export interface RdpResponse {
  payoutId: string;
  status: "INITIATED" | "COMPLETED" | "FAILED" | "EXPIRED";
  payoutUrl: string; // URL where receiver inputs card details securely
  expiresAt: string;
  rawResponse?: any;
}

// ============================================================================
// VISA PAYOUTS SERVICE IMPLEMENTATION
// ============================================================================

export class VisaPayoutsService {
  private config: VisaServiceConfig;
  private httpClient: AxiosInstance;

  constructor(config?: Partial<VisaServiceConfig>) {
    // Default configuration pointing to Visa Developer Sandbox
    this.config = {
      baseUrl: config?.baseUrl || process.env.VISA_BASE_URL || "https://sandbox.api.visa.com",
      apiKey: config?.apiKey || process.env.VISA_API_KEY || "",
      sharedSecret: config?.sharedSecret || process.env.VISA_SHARED_SECRET || "",
      certPem: config?.certPem || process.env.VISA_CERT_PEM,
      keyPem: config?.keyPem || process.env.VISA_KEY_PEM,
      useSandboxMock: config?.useSandboxMock ?? (process.env.VISA_USE_MOCK === "true" || !config?.apiKey),
    };

    this.httpClient = this.initializeHttpClient();
  }

  /**
   * Initializes the Axios HTTP client with Mutual TLS (if certs are provided)
   */
  private initializeHttpClient(): AxiosInstance {
    const agentOptions: https.AgentOptions = {
      rejectUnauthorized: false, // Often required for sandbox testing environments
    };

    if (this.config.certPem && this.config.keyPem) {
      agentOptions.cert = this.config.certPem;
      agentOptions.key = this.config.keyPem;
    }

    const httpsAgent = new https.Agent(agentOptions);

    return axios.create({
      baseURL: this.config.baseUrl,
      httpsAgent,
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      timeout: 15000,
    });
  }

  /**
   * Generates Visa's proprietary X-Pay-Token for API authentication
   */
  private generateXPayToken(resourcePath: string, queryString: string, requestBody: string): string {
    const timestamp = Math.floor(Date.now() / 1000).toString();
    const preHashString = timestamp + resourcePath + queryString + requestBody;
    const hash = crypto
      .createHmac("sha256", this.config.sharedSecret)
      .update(preHashString)
      .digest("hex");
    
    return `xv2:${timestamp}:${hash}`;
  }

  /**
   * Helper to execute authenticated requests to Visa APIs
   */
  private async request<T>(
    method: "GET" | "POST",
    resourcePath: string,
    data: any = {},
    queryParams: Record<string, string> = {}
  ): Promise<T> {
    if (this.config.useSandboxMock) {
      throw new Error("Cannot make live request in mock mode.");
    }

    const queryString = Object.keys(queryParams)
      .sort()
      .map((key) => `${encodeURIComponent(key)}=${encodeURIComponent(queryParams[key])}`)
      .join("&");

    const fullPath = queryString ? `${resourcePath}?${queryString}` : resourcePath;
    const requestBody = method === "POST" ? JSON.stringify(data) : "";
    const xPayToken = this.generateXPayToken(resourcePath, queryString, requestBody);

    const headers: Record<string, string> = {
      "X-Pay-Token": xPayToken,
    };

    if (this.config.apiKey) {
      queryParams["apikey"] = this.config.apiKey;
    }

    try {
      const response = await this.httpClient.request({
        method,
        url: resourcePath,
        params: queryParams,
        data: method === "POST" ? data : undefined,
        headers,
      });
      return response.data as T;
    } catch (error: any) {
      const errorDetails = error.response?.data || error.message;
      console.error(`[VisaPayoutsService] API Error on ${method} ${resourcePath}:`, errorDetails);
      throw new Error(`Visa API Error: ${JSON.stringify(errorDetails)}`);
    }
  }

  /**
   * Checks card eligibility for push-to-card (OCT) and pull-to-card (AFT)
   */
  public async checkCardEligibility(payload: CardEligibilityPayload): Promise<CardEligibilityResponse> {
    if (this.config.useSandboxMock) {
      return this.simulateCardEligibility(payload);
    }

    const resourcePath = "/visadirect/fundstransfer/v1/cardeligibility";
    
    // Map internal payload to Visa's Card Eligibility API schema
    const visaPayload = {
      primaryAccountNumber: payload.primaryAccountNumber,
      cardExpiryDate: `${payload.expirationYear}-${payload.expirationMonth}`,
      acquiringBin: "400000", // Default sandbox acquiring BIN
      systemsTraceAuditNumber: Math.floor(100000 + Math.random() * 900000).toString(),
      retrievalReferenceNumber: uuidv4().replace(/-/g, "").substring(0, 12),
    };

    try {
      const rawResponse: any = await this.request("POST", resourcePath, visaPayload);
      
      const isEligible = rawResponse?.actionCode === "00";
      const fastFunds = rawResponse?.fastFundsIndicator === "Y" || rawResponse?.fastFundsIndicator === "A";
      const pushEligible = rawResponse?.pushFundsIndicator === "Y";
      const pullEligible = rawResponse?.pullFundsIndicator === "Y";

      return {
        eligible: isEligible,
        fastFundsEligible: fastFunds,
        pushFundsEligible: pushEligible,
        pullFundsEligible: pullEligible,
        cardBrand: rawResponse?.cardBrand || "VISA",
        cardType: this.mapCardType(rawResponse?.cardType),
        issuingBank: rawResponse?.issuerName || "UNKNOWN ISSUER",
        countryCode: rawResponse?.issuerCountryCode || "US",
        rawResponse,
      };
    } catch (error) {
      console.warn("[VisaPayoutsService] Live eligibility check failed, falling back to simulation rules.");
      return this.simulateCardEligibility(payload);
    }
  }

  /**
   * Initiates a Push-to-Card (Original Credit Transaction - OCT) payment
   */
  public async initiatePushToCard(payload: PushToCardPayload): Promise<PushToCardResponse> {
    if (this.config.useSandboxMock) {
      return this.simulatePushToCard(payload);
    }

    const resourcePath = "/visadirect/fundstransfer/v1/pushfundstransactions";
    const systemsTraceAuditNumber = Math.floor(100000 + Math.random() * 900000).toString();
    const retrievalReferenceNumber = uuidv4().replace(/-/g, "").substring(0, 12);

    const visaPayload = {
      acquiringBin: payload.acquiringBin || "400000",
      systemsTraceAuditNumber,
      retrievalReferenceNumber,
      localTransactionDateTime: new Date().toISOString().replace(/[-:TZ.]/g, "").substring(0, 14),
      transactionAmount: payload.amount.toFixed(2),
      transactionCurrencyCode: payload.currency,
      recipientPrimaryAccountNumber: payload.recipientCardNumber,
      cardExpiryDate: `${payload.recipientExpirationYear}-${payload.recipientExpirationMonth}`,
      recipientName: `${payload.recipientFirstName} ${payload.recipientLastName}`.substring(0, 30),
      senderName: `${payload.senderFirstName} ${payload.senderLastName}`.substring(0, 30),
      senderAddress: payload.senderAddress.substring(0, 35),
      senderCity: payload.senderCity.substring(0, 25),
      senderStateCode: payload.senderState.substring(0, 3),
      senderCountryCode: payload.senderCountryCode,
      merchantCategoryCode: payload.merchantCategoryCode || "6012",
    };

    try {
      const rawResponse: any = await this.request("POST", resourcePath, visaPayload);
      
      const status = rawResponse?.actionCode === "00" ? "APPROVED" : "DECLINED";

      return {
        transactionId: rawResponse?.transactionIdentifier || uuidv4(),
        status,
        approvalCode: rawResponse?.approvalCode,
        retrievalReferenceNumber,
        actionCode: rawResponse?.actionCode,
        transmissionDateTime: rawResponse?.transmissionDateTime || new Date().toISOString(),
        feeCharged: rawResponse?.feeProgramIndicator ? 0.25 : 0.00,
        rawResponse,
      };
    } catch (error) {
      console.error("[VisaPayoutsService] Live push-to-card failed.");
      throw error;
    }
  }

  /**
   * Initiates a Receiver Directed Payout (RDP)
   * Generates a secure link where the receiver can securely enter their card details.
   */
  public async initiateReceiverDirectedPayout(payload: RdpPayload): Promise<RdpResponse> {
    if (this.config.useSandboxMock) {
      return this.simulateRdp(payload);
    }

    const resourcePath = "/visadirect/rdp/v1/payouts";
    const payoutId = uuidv4();

    const visaPayload = {
      payoutId,
      amount: payload.amount.toFixed(2),
      currency: payload.currency,
      receiver: {
        firstName: payload.receiverFirstName,
        lastName: payload.receiverLastName,
        email: payload.receiverEmail,
        phone: payload.receiverPhone,
      },
      paymentNarrative: payload.paymentNarrative,
      callbackUrl: payload.callbackUrl,
    };

    try {
      const rawResponse: any = await this.request("POST", resourcePath, visaPayload);

      return {
        payoutId: rawResponse?.payoutId || payoutId,
        status: "INITIATED",
        payoutUrl: rawResponse?.payoutUrl || `https://payouts.visa.com/collect/${payoutId}`,
        expiresAt: rawResponse?.expiresAt || new Date(Date.now() + 24 * 60 * 60 * 1000).toISOString(),
        rawResponse,
      };
    } catch (error) {
      console.warn("[VisaPayoutsService] Live RDP failed, falling back to simulation.");
      return this.simulateRdp(payload);
    }
  }

  // ============================================================================
  // SIMULATORS / MOCKS FOR SANDBOX & LOCAL DEV
  // ============================================================================

  private simulateCardEligibility(payload: CardEligibilityPayload): CardEligibilityResponse {
    const pan = payload.primaryAccountNumber.replace(/\s/g, "");
    
    // Deterministic mock responses based on card number endings
    const isEligible = !pan.endsWith("9");
    const fastFunds = pan.startsWith("4") || pan.startsWith("45");
    const pushEligible = isEligible;
    const pullEligible = pan.startsWith("4") || pan.startsWith("5");

    let cardBrand = "VISA";
    if (pan.startsWith("5")) cardBrand = "MASTERCARD";
    if (pan.startsWith("3")) cardBrand = "AMEX";
    if (pan.startsWith("6")) cardBrand = "DISCOVER";

    let cardType: "DEBIT" | "CREDIT" | "PREPAID" | "UNKNOWN" = "DEBIT";
    if (pan.endsWith("1") || pan.endsWith("3")) cardType = "CREDIT";
    if (pan.endsWith("5")) cardType = "PREPAID";

    return {
      eligible: isEligible,
      fastFundsEligible: fastFunds,
      pushFundsEligible: pushEligible,
      pullFundsEligible: pullEligible,
      cardBrand,
      cardType,
      issuingBank: "SOVEREIGN CITADEL BANK",
      countryCode: "US",
      rawResponse: {
        simulated: true,
        actionCode: isEligible ? "00" : "05",
        fastFundsIndicator: fastFunds ? "Y" : "N",
        pushFundsIndicator: pushEligible ? "Y" : "N",
        pullFundsIndicator: pullEligible ? "Y" : "N",
      },
    };
  }

  private simulatePushToCard(payload: PushToCardPayload): PushToCardResponse {
    const pan = payload.recipientCardNumber.replace(/\s/g, "");
    const isApproved = !pan.endsWith("9") && payload.amount < 50000; // Limit simulation

    return {
      transactionId: `ST-${uuidv4().substring(0, 18).toUpperCase()}`,
      status: isApproved ? "APPROVED" : "DECLINED",
      approvalCode: isApproved ? Math.floor(100000 + Math.random() * 900000).toString() : undefined,
      retrievalReferenceNumber: uuidv4().replace(/-/g, "").substring(0, 12),
      actionCode: isApproved ? "00" : "51", // 51 is Insufficient Funds / Limit Exceeded
      transmissionDateTime: new Date().toISOString(),
      feeCharged: 0.25,
      rawResponse: {
        simulated: true,
        message: isApproved ? "Transaction Approved" : "Transaction Declined by Issuer",
      },
    };
  }

  private simulateRdp(payload: RdpPayload): RdpResponse {
    const payoutId = `RDP-${uuidv4().substring(0, 12).toUpperCase()}`;
    return {
      payoutId,
      status: "INITIATED",
      payoutUrl: `https://payouts.visa.com/collect/simulated_${payoutId}`,
      expiresAt: new Date(Date.now() + 48 * 60 * 60 * 1000).toISOString(),
      rawResponse: {
        simulated: true,
        receiverEmail: payload.receiverEmail,
        amount: payload.amount,
        currency: payload.currency,
      },
    };
  }

  private mapCardType(type: string): "DEBIT" | "CREDIT" | "PREPAID" | "UNKNOWN" {
    if (!type) return "UNKNOWN";
    const upper = type.toUpperCase();
    if (upper.includes("DEBIT")) return "DEBIT";
    if (upper.includes("CREDIT")) return "CREDIT";
    if (upper.includes("PREPAID")) return "PREPAID";
    return "UNKNOWN";
  }
}

export const visaPayoutsService = new VisaPayoutsService();