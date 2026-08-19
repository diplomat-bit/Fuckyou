

// --- CONSOLIDATED FROM: ./services/VisaService.ts ---

import { GoogleGenerativeAI } from "@google/generative-ai";
import crypto from "crypto";

// ============================================================================
// VisaNet Connect API Interfaces & Types
// ============================================================================

export interface VisaCard {
  cardId: string;
  cardNumber: string;
  expiryDate: string; // MM/YY
  cvv: string;
  cardholderId: string;
  status: "ACTIVE" | "BLOCKED" | "INACTIVE";
  creditLimit: number;
  availableBalance: number;
  holdBalance: number;
  pinHash: string;
  cdbInfo: CDBInfo;
}

export interface CDBInfo {
  firstName: string;
  lastName: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  country: string;
  phoneNumber: string;
  email: string;
}

export interface VisaTransaction {
  transactionId: string;
  cardId: string;
  type: "PURCHASE" | "ATM_WITHDRAWAL" | "ATM_INQUIRY" | "AUTHORIZATION" | "COMPLETION" | "RETURN" | "ADJUSTMENT";
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategoryCode: string; // MCC (e.g., 5411 for Groceries, 5812 for Restaurants)
  status: "APPROVED" | "DECLINED" | "PENDING" | "REVERSED";
  approvalCode?: string;
  timestamp: Date;
  originalTransactionId?: string; // Linked transaction for completions, adjustments, returns
  riskScore?: number;
  anomalyReason?: string;
  recommendedAction?: string;
}

// Request / Response Payloads for VisaNet Connect APIs

export interface AuthorizationRequest {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategoryCode: string;
}

export interface AuthorizationResponse {
  transactionId: string;
  status: "APPROVED" | "DECLINED";
  approvalCode?: string;
  riskScore: number;
  reason?: string;
}

export interface CompletionRequest {
  originalTransactionId: string;
  finalAmount: number;
}

export interface CompletionResponse {
  transactionId: string;
  status: "APPROVED" | "DECLINED";
  amountSettled: number;
  reason?: string;
}

export interface PurchaseRequest {
  cardNumber: string;
  expiryDate: string;
  cvv: string;
  amount: number;
  currency: string;
  merchantName: string;
  merchantCategoryCode: string;
}

export interface PurchaseResponse {
  transactionId: string;
  status: "APPROVED" | "DECLINED";
  approvalCode?: string;
  riskScore: number;
  reason?: string;
}

export interface ReturnRequest {
  originalTransactionId: string;
  amount: number;
}

export interface ReturnResponse {
  transactionId: string;
  status: "APPROVED" | "DECLINED";
  amountRefunded: number;
  reason?: string;
}

export interface ATMRequest {
  cardNumber: string;
  pin: string;
  type: "WITHDRAWAL" | "INQUIRY";
  amount?: number; // Required for withdrawal
  currency: string;
}

export interface ATMResponse {
  transactionId: string;
  status: "APPROVED" | "DECLINED";
  remainingBalance: number;
  reason?: string;
}

export interface AdjustmentRequest {
  originalTransactionId: string;
  adjustmentType: "CHARGEBACK" | "FEE_REVERSAL" | "CORRECTION";
  amount: number;
  reason: string;
}

export interface AdjustmentResponse {
  transactionId: string;
  status: "APPROVED" | "DECLINED";
  adjustedAmount: number;
  newBalance: number;
}

export interface CardServicesRequest {
  cardNumber: string;
  action: "ACTIVATE" | "BLOCK" | "UNBLOCK" | "CHANGE_PIN" | "UPDATE_LIMITS";
  newPin?: string;
  newCreditLimit?: number;
}

export interface CardServicesResponse {
  status: "SUCCESS" | "FAILED";
  message: string;
}

export interface CDBUpdateRequest {
  cardNumber: string;
  cdbInfo: Partial<CDBInfo>;
}

export interface CDBUpdateResponse {
  status: "SUCCESS" | "FAILED";
  message: string;
}

export interface InquiryRequest {
  cardNumber: string;
  cvv: string;
}

export interface InquiryResponse {
  status: "ACTIVE" | "BLOCKED" | "INACTIVE";
  availableBalance: number;
  creditLimit: number;
  holdBalance: number;
  cdbInfo: CDBInfo;
  recentTransactions: VisaTransaction[];
}

// Gemini Intelligence Interfaces

export interface GeminiAnalysisResult {
  riskScore: number;
  isAnomaly: boolean;
  reason: string;
  recommendedAction: "ALLOW" | "FLAG_FOR_REVIEW" | "BLOCK_CARD";
}

export interface GeminiRecommendation {
  category: string;
  title: string;
  description: string;
  impactScore: number; // 1 to 10
  actionableSteps: string[];
}

// ============================================================================
// Visa Backend Service Implementation
// ============================================================================

export class VisaService {
  private cards: Map<string, VisaCard> = new Map();
  private transactions: Map<string, VisaTransaction> = new Map();
  private geminiClient: GoogleGenerativeAI | null = null;

  constructor() {
    this.initializeGemini();
    this.seedMockData();
  }

  /**
   * Initializes the Gemini AI client using the environment variable.
   */
  private initializeGemini() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn("VisaService: GEMINI_API_KEY is not set. Intelligent features will run in fallback mode.");
    }
  }

  /**
   * Seeds the in-memory database with realistic mock cards and transactions.
   */
  private seedMockData() {
    const mockCdb: CDBInfo = {
      firstName: "Sarah",
      lastName: "Connor",
      address: "742 Evergreen Terrace",
      city: "Springfield",
      state: "IL",
      zipCode: "62704",
      country: "USA",
      phoneNumber: "+15550199",
      email: "sarah.connor@cyberdyne.com",
    };

    const cardId = "visa-card-001";
    const mockCard: VisaCard = {
      cardId,
      cardNumber: "4111111111111111", // Standard Visa Test Card
      expiryDate: "12/28",
      cvv: "123",
      cardholderId: "user-999",
      status: "ACTIVE",
      creditLimit: 15000,
      availableBalance: 12500,
      holdBalance: 500,
      pinHash: this.hashPin("1984"),
      cdbInfo: mockCdb,
    };

    this.cards.set(mockCard.cardNumber, mockCard);

    // Seed some historical transactions
    const historicalTx: VisaTransaction[] = [
      {
        transactionId: "tx-hist-001",
        cardId,
        type: "PURCHASE",
        amount: 120.5,
        currency: "USD",
        merchantName: "Whole Foods Market",
        merchantCategoryCode: "5411",
        status: "APPROVED",
        approvalCode: "APP101",
        timestamp: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
        riskScore: 5,
      },
      {
        transactionId: "tx-hist-002",
        cardId,
        type: "PURCHASE",
        amount: 45.0,
        currency: "USD",
        merchantName: "Starbucks Coffee",
        merchantCategoryCode: "5812",
        status: "APPROVED",
        approvalCode: "APP102",
        timestamp: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000),
        riskScore: 2,
      },
      {
        transactionId: "tx-hist-003",
        cardId,
        type: "ATM_WITHDRAWAL",
        amount: 200.0,
        currency: "USD",
        merchantName: "Chase ATM Springfield",
        merchantCategoryCode: "6011",
        status: "APPROVED",
        approvalCode: "APP103",
        timestamp: new Date(Date.now() - 12 * 60 * 60 * 1000),
        riskScore: 12,
      },
    ];

    historicalTx.forEach((tx) => this.transactions.set(tx.transactionId, tx));
  }

  // ============================================================================
  // VisaNet Connect Core API Methods
  // ============================================================================

  /**
   * VisaNet Connect: Authorizations (Pre-Auth / Hold)
   */
  public async authorizeTransaction(payload: AuthorizationRequest): Promise<AuthorizationResponse> {
    const card = this.cards.get(payload.cardNumber);

    if (!card) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 100, reason: "Card not found" };
    }

    if (card.status !== "ACTIVE") {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 100, reason: "Card is inactive or blocked" };
    }

    if (card.cvv !== payload.cvv || card.expiryDate !== payload.expiryDate) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 100, reason: "Invalid CVV or Expiry Date" };
    }

    if (card.availableBalance < payload.amount) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 10, reason: "Insufficient funds" };
    }

    // Run real-time Gemini Fraud Analysis
    const tempTx: VisaTransaction = {
      transactionId: "temp-auth",
      cardId: card.cardId,
      type: "AUTHORIZATION",
      amount: payload.amount,
      currency: payload.currency,
      merchantName: payload.merchantName,
      merchantCategoryCode: payload.merchantCategoryCode,
      status: "PENDING",
      timestamp: new Date(),
    };

    const analysis = await this.analyzeTransactionWithGemini(tempTx, card);

    if (analysis.recommendedAction === "BLOCK_CARD") {
      card.status = "BLOCKED";
      return {
        transactionId: this.generateId("tx"),
        status: "DECLINED",
        riskScore: analysis.riskScore,
        reason: `Transaction declined and card blocked: ${analysis.reason}`,
      };
    }

    if (analysis.riskScore > 75) {
      return {
        transactionId: this.generateId("tx"),
        status: "DECLINED",
        riskScore: analysis.riskScore,
        reason: `High risk transaction flagged: ${analysis.reason}`,
      };
    }

    // Place hold on funds
    card.availableBalance -= payload.amount;
    card.holdBalance += payload.amount;

    const transactionId = this.generateId("tx");
    const approvalCode = this.generateApprovalCode();

    const finalTx: VisaTransaction = {
      ...tempTx,
      transactionId,
      status: "PENDING",
      approvalCode,
      riskScore: analysis.riskScore,
      anomalyReason: analysis.isAnomaly ? analysis.reason : undefined,
      recommendedAction: analysis.recommendedAction,
    };

    this.transactions.set(transactionId, finalTx);

    return {
      transactionId,
      status: "APPROVED",
      approvalCode,
      riskScore: analysis.riskScore,
    };
  }

  /**
   * VisaNet Connect: Completions (Settle Pre-Auth)
   */
  public async completeTransaction(payload: CompletionRequest): Promise<CompletionResponse> {
    const tx = this.transactions.get(payload.originalTransactionId);

    if (!tx || tx.type !== "AUTHORIZATION" || tx.status !== "PENDING") {
      return { transactionId: this.generateId("tx"), status: "DECLINED", amountSettled: 0, reason: "Original authorization not found or already settled" };
    }

    const card = Array.from(this.cards.values()).find((c) => c.cardId === tx.cardId);
    if (!card) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", amountSettled: 0, reason: "Card associated with transaction not found" };
    }

    // Release hold
    card.holdBalance -= tx.amount;

    // Adjust balance based on final settled amount
    const difference = payload.finalAmount - tx.amount;
    if (card.availableBalance < difference) {
      // If final amount is higher and cardholder has no balance, decline completion (rare but possible)
      card.availableBalance += tx.amount; // return original hold
      tx.status = "DECLINED";
      return { transactionId: this.generateId("tx"), status: "DECLINED", amountSettled: 0, reason: "Insufficient funds for final settlement adjustment" };
    }

    card.availableBalance -= difference;

    const completionTxId = this.generateId("tx");
    const completionTx: VisaTransaction = {
      transactionId: completionTxId,
      cardId: card.cardId,
      type: "COMPLETION",
      amount: payload.finalAmount,
      currency: tx.currency,
      merchantName: tx.merchantName,
      merchantCategoryCode: tx.merchantCategoryCode,
      status: "APPROVED",
      approvalCode: tx.approvalCode,
      timestamp: new Date(),
      originalTransactionId: tx.transactionId,
    };

    tx.status = "APPROVED"; // Mark original pre-auth as approved/settled
    this.transactions.set(completionTxId, completionTx);

    return {
      transactionId: completionTxId,
      status: "APPROVED",
      amountSettled: payload.finalAmount,
    };
  }

  /**
   * VisaNet Connect: Purchases (Direct Debit/Credit Purchase)
   */
  public async purchaseTransaction(payload: PurchaseRequest): Promise<PurchaseResponse> {
    const card = this.cards.get(payload.cardNumber);

    if (!card) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 100, reason: "Card not found" };
    }

    if (card.status !== "ACTIVE") {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 100, reason: "Card is inactive or blocked" };
    }

    if (card.cvv !== payload.cvv || card.expiryDate !== payload.expiryDate) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 100, reason: "Invalid CVV or Expiry Date" };
    }

    if (card.availableBalance < payload.amount) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", riskScore: 10, reason: "Insufficient funds" };
    }

    // Run real-time Gemini Fraud Analysis
    const tempTx: VisaTransaction = {
      transactionId: "temp-purchase",
      cardId: card.cardId,
      type: "PURCHASE",
      amount: payload.amount,
      currency: payload.currency,
      merchantName: payload.merchantName,
      merchantCategoryCode: payload.merchantCategoryCode,
      status: "APPROVED",
      timestamp: new Date(),
    };

    const analysis = await this.analyzeTransactionWithGemini(tempTx, card);

    if (analysis.recommendedAction === "BLOCK_CARD") {
      card.status = "BLOCKED";
      return {
        transactionId: this.generateId("tx"),
        status: "DECLINED",
        riskScore: analysis.riskScore,
        reason: `Transaction declined and card blocked: ${analysis.reason}`,
      };
    }

    if (analysis.riskScore > 75) {
      return {
        transactionId: this.generateId("tx"),
        status: "DECLINED",
        riskScore: analysis.riskScore,
        reason: `High risk transaction flagged: ${analysis.reason}`,
      };
    }

    // Deduct funds directly
    card.availableBalance -= payload.amount;

    const transactionId = this.generateId("tx");
    const approvalCode = this.generateApprovalCode();

    const finalTx: VisaTransaction = {
      ...tempTx,
      transactionId,
      approvalCode,
      riskScore: analysis.riskScore,
      anomalyReason: analysis.isAnomaly ? analysis.reason : undefined,
      recommendedAction: analysis.recommendedAction,
    };

    this.transactions.set(transactionId, finalTx);

    return {
      transactionId,
      status: "APPROVED",
      approvalCode,
      riskScore: analysis.riskScore,
    };
  }

  /**
   * VisaNet Connect: Returns (Refunds / Credits)
   */
  public async returnTransaction(payload: ReturnRequest): Promise<ReturnResponse> {
    const originalTx = this.transactions.get(payload.originalTransactionId);

    if (!originalTx || (originalTx.type !== "PURCHASE" && originalTx.type !== "COMPLETION")) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", amountRefunded: 0, reason: "Original purchase transaction not found" };
    }

    const card = Array.from(this.cards.values()).find((c) => c.cardId === originalTx.cardId);
    if (!card) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", amountRefunded: 0, reason: "Card associated with transaction not found" };
    }

    // Credit funds back to cardholder
    card.availableBalance += payload.amount;

    const returnTxId = this.generateId("tx");
    const returnTx: VisaTransaction = {
      transactionId: returnTxId,
      cardId: card.cardId,
      type: "RETURN",
      amount: payload.amount,
      currency: originalTx.currency,
      merchantName: originalTx.merchantName,
      merchantCategoryCode: originalTx.merchantCategoryCode,
      status: "APPROVED",
      timestamp: new Date(),
      originalTransactionId: originalTx.transactionId,
    };

    this.transactions.set(returnTxId, returnTx);

    return {
      transactionId: returnTxId,
      status: "APPROVED",
      amountRefunded: payload.amount,
    };
  }

  /**
   * VisaNet Connect: ATM Transactions (Withdrawals & Balance Inquiries)
   */
  public async atmTransaction(payload: ATMRequest): Promise<ATMResponse> {
    const card = this.cards.get(payload.cardNumber);

    if (!card) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", remainingBalance: 0, reason: "Card not found" };
    }

    if (card.status !== "ACTIVE") {
      return { transactionId: this.generateId("tx"), status: "DECLINED", remainingBalance: 0, reason: "Card is inactive or blocked" };
    }

    // Verify PIN
    const hashedPin = this.hashPin(payload.pin);
    if (card.pinHash !== hashedPin) {
      return { transactionId: this.generateId("tx"), status: "DECLINED", remainingBalance: card.availableBalance, reason: "Invalid PIN" };
    }

    const transactionId = this.generateId("tx");

    if (payload.type === "INQUIRY") {
      const inquiryTx: VisaTransaction = {
        transactionId,
        cardId: card.cardId,
        type: "ATM_INQUIRY",
        amount: 0,
        currency: payload.currency,
        merchantName: "ATM Balance Inquiry",
        merchantCategoryCode: "6011",
        status: "APPROVED",
        timestamp: new Date(),
      };
      this.transactions.set(transactionId, inquiryTx);

      return {
        transactionId,
        status: "APPROVED",
        remainingBalance: card.availableBalance,
      };
    }

    // Withdrawal logic
    const withdrawalAmount = payload.amount || 0;
    if (withdrawalAmount <= 0) {
      return { transactionId, status: "DECLINED", remainingBalance: card.availableBalance, reason: "Invalid withdrawal amount" };
    }

    if (card.availableBalance < withdrawalAmount) {
      return { transactionId, status: "DECLINED", remainingBalance: card.availableBalance, reason: "Insufficient funds" };
    }

    // Deduct funds
    card.availableBalance -= withdrawalAmount;

    const withdrawalTx: VisaTransaction = {
      transactionId,
      cardId: card.cardId,
      type: "ATM_WITHDRAWAL",
      amount: withdrawalAmount,
      currency: payload.currency,
      merchantName: "ATM Cash Withdrawal",
      merchantCategoryCode: "6011",
      status: "APPROVED",
      timestamp: new Date(),
    };
    this.transactions.set(transactionId, withdrawalTx);

    return {
      transactionId,
      status: "APPROVED",
      remainingBalance: card.availableBalance,
    };
  }

  /**
   * VisaNet Connect: Adjustments (Chargebacks, Fee Reversals, Corrections)
   */
  public async adjustTransaction(payload: AdjustmentRequest): Promise<AdjustmentResponse> {
    const originalTx = this.transactions.get(payload.originalTransactionId);

    if (!originalTx) {
      throw new Error("Original transaction not found for adjustment");
    }

    const card = Array.from(this.cards.values()).find((c) => c.cardId === originalTx.cardId);
    if (!card) {
      throw new Error("Card associated with transaction not found");
    }

    const adjustmentTxId = this.generateId("tx");

    // Apply adjustment to balance
    if (payload.adjustmentType === "CHARGEBACK" || payload.adjustmentType === "FEE_REVERSAL") {
      card.availableBalance += payload.amount;
    } else if (payload.adjustmentType === "CORRECTION") {
      // Corrections can be positive or negative
      card.availableBalance += payload.amount; // payload.amount can be negative for debit correction
    }

    const adjustmentTx: VisaTransaction = {
      transactionId: adjustmentTxId,
      cardId: card.cardId,
      type: "ADJUSTMENT",
      amount: payload.amount,
      currency: originalTx.currency,
      merchantName: `Adjustment: ${payload.adjustmentType} - ${payload.reason}`,
      merchantCategoryCode: originalTx.merchantCategoryCode,
      status: "APPROVED",
      timestamp: new Date(),
      originalTransactionId: originalTx.transactionId,
    };

    this.transactions.set(adjustmentTxId, adjustmentTx);

    return {
      transactionId: adjustmentTxId,
      status: "APPROVED",
      adjustedAmount: payload.amount,
      newBalance: card.availableBalance,
    };
  }

  /**
   * VisaNet Connect: Card Services (Activation, Block, Unblock, PIN Change, Limit Updates)
   */
  public async updateCardServices(payload: CardServicesRequest): Promise<CardServicesResponse> {
    const card = this.cards.get(payload.cardNumber);

    if (!card) {
      return { status: "FAILED", message: "Card not found" };
    }

    switch (payload.action) {
      case "ACTIVATE":
        card.status = "ACTIVE";
        break;
      case "BLOCK":
        card.status = "BLOCKED";
        break;
      case "UNBLOCK":
        card.status = "ACTIVE";
        break;
      case "CHANGE_PIN":
        if (!payload.newPin) {
          return { status: "FAILED", message: "New PIN is required for CHANGE_PIN action" };
        }
        card.pinHash = this.hashPin(payload.newPin);
        break;
      case "UPDATE_LIMITS":
        if (payload.newCreditLimit === undefined) {
          return { status: "FAILED", message: "New credit limit is required for UPDATE_LIMITS action" };
        }
        const limitDiff = payload.newCreditLimit - card.creditLimit;
        card.creditLimit = payload.newCreditLimit;
        card.availableBalance += limitDiff;
        break;
      default:
        return { status: "FAILED", message: "Invalid card services action" };
    }

    return {
      status: "SUCCESS",
      message: `Card services action ${payload.action} executed successfully`,
    };
  }

  /**
   * VisaNet Connect: CDB Update (Cardholder Database Updates)
   */
  public async updateCDB(payload: CDBUpdateRequest): Promise<CDBUpdateResponse> {
    const card = this.cards.get(payload.cardNumber);

    if (!card) {
      return { status: "FAILED", message: "Card not found" };
    }

    card.cdbInfo = {
      ...card.cdbInfo,
      ...payload.cdbInfo,
    };

    return {
      status: "SUCCESS",
      message: "Cardholder Database (CDB) updated successfully",
    };
  }

  /**
   * VisaNet Connect: Inquiries (Card Status, Limits, History)
   */
  public async inquireCard(payload: InquiryRequest): Promise<InquiryResponse> {
    const card = this.cards.get(payload.cardNumber);

    if (!card) {
      throw new Error("Card not found");
    }

    if (card.cvv !== payload.cvv) {
      throw new Error("Invalid CVV");
    }

    const recentTx = Array.from(this.transactions.values())
      .filter((tx) => tx.cardId === card.cardId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
      .slice(0, 10);

    return {
      status: card.status,
      availableBalance: card.availableBalance,
      creditLimit: card.creditLimit,
      holdBalance: card.holdBalance,
      cdbInfo: card.cdbInfo,
      recentTransactions: recentTx,
    };
  }

  // ============================================================================
  // Gemini AI Intelligent Integration Methods
  // ============================================================================

  /**
   * Uses Gemini to analyze a transaction for fraud, anomalies, and risk.
   */
  public async analyzeTransactionWithGemini(transaction: VisaTransaction, card: VisaCard): Promise<GeminiAnalysisResult> {
    if (!this.geminiClient) {
      // Fallback rule-based analysis if Gemini is not configured
      return this.fallbackFraudAnalysis(transaction, card);
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash" });

      const recentTx = Array.from(this.transactions.values())
        .filter((tx) => tx.cardId === card.cardId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
        .slice(0, 5);

      const prompt = `
        You are an advanced VisaNet AI Fraud Detection agent. Analyze the following transaction for potential fraud or anomalies:
        
        Cardholder Profile:
        ${JSON.stringify(card.cdbInfo, null, 2)}
        
        Card Status:
        - Credit Limit: $${card.creditLimit}
        - Available Balance: $${card.availableBalance}
        - Hold Balance: $${card.holdBalance}
        
        Current Transaction Details:
        - Type: ${transaction.type}
        - Amount: $${transaction.amount} ${transaction.currency}
        - Merchant: ${transaction.merchantName}
        - Merchant Category Code (MCC): ${transaction.merchantCategoryCode}
        - Timestamp: ${transaction.timestamp.toISOString()}
        
        Recent Transaction History:
        ${JSON.stringify(recentTx, null, 2)}

        Analyze the transaction based on:
        1. Velocity (frequency of transactions).
        2. Location consistency (merchant location vs cardholder address).
        3. Spending patterns (unusual amounts or MCCs for this cardholder).
        4. High-risk merchants or MCCs.

        Respond strictly with a valid JSON object matching this schema (do not include any markdown formatting, code blocks, or extra text):
        {
          "riskScore": <number between 0 and 100>,
          "isAnomaly": <boolean>,
          "reason": "<detailed explanation of the risk assessment>",
          "recommendedAction": "ALLOW" | "FLAG_FOR_REVIEW" | "BLOCK_CARD"
        }
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      
      // Clean up potential markdown code block wrappers
      const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
      const analysis: GeminiAnalysisResult = JSON.parse(cleanJson);

      return analysis;
    } catch (error) {
      console.error("VisaService: Gemini analysis failed, falling back to rule-based engine.", error);
      return this.fallbackFraudAnalysis(transaction, card);
    }
  }

  /**
   * Uses Gemini to generate highly realistic mock transactions for testing.
   */
  public async generateMockTransactionsWithGemini(count: number, profile: string): Promise<VisaTransaction[]> {
    if (!this.geminiClient) {
      return this.generateFallbackMockTransactions(count);
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash" });

      const prompt = `
        Generate exactly ${count} highly realistic Visa transaction records for a cardholder with the following profile: "${profile}".
        The current date is ${new Date().toISOString()}.
        
        Ensure the transactions reflect realistic spending patterns, amounts, merchant names, and Merchant Category Codes (MCC) matching the profile.
        Include a mix of APPROVED, PENDING, and potentially one DECLINED transaction if it fits the profile (e.g., fraud attempt or limit exceeded).

        Respond strictly with a valid JSON array of objects matching this schema (do not include any markdown formatting, code blocks, or extra text):
        [
          {
            "transactionId": "string (unique tx-XXXX id)",
            "type": "PURCHASE" | "ATM_WITHDRAWAL" | "ATM_INQUIRY" | "AUTHORIZATION" | "COMPLETION" | "RETURN" | "ADJUSTMENT",
            "amount": number,
            "currency": "USD" | "EUR" | "GBP",
            "merchantName": "string",
            "merchantCategoryCode": "string (4-digit MCC)",
            "status": "APPROVED" | "DECLINED" | "PENDING",
            "approvalCode": "string (6-character alphanumeric, optional)",
            "timestamp": "ISO string",
            "riskScore": number (0 to 100)
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
      const mockTxs: any[] = JSON.parse(cleanJson);

      return mockTxs.map((tx) => ({
        ...tx,
        timestamp: new Date(tx.timestamp),
      }));
    } catch (error) {
      console.error("VisaService: Gemini mock generation failed, falling back to local generator.", error);
      return this.generateFallbackMockTransactions(count);
    }
  }

  /**
   * Uses Gemini to analyze cardholder spending and provide intelligent financial recommendations.
   */
  public async getCardholderRecommendations(cardNumber: string): Promise<GeminiRecommendation[]> {
    const card = this.cards.get(cardNumber);
    if (!card) {
      throw new Error("Card not found");
    }

    if (!this.geminiClient) {
      return this.getFallbackRecommendations();
    }

    try {
      const model = this.geminiClient.getGenerativeModel({ model: "gemini-2.5-flash" });

      const txList = Array.from(this.transactions.values())
        .filter((tx) => tx.cardId === card.cardId)
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      const prompt = `
        Analyze the spending history of this Visa cardholder and provide intelligent financial optimization, security, and budgeting recommendations:
        
        Cardholder Profile:
        ${JSON.stringify(card.cdbInfo, null, 2)}
        
        Card Limits:
        - Credit Limit: $${card.creditLimit}
        - Available Balance: $${card.availableBalance}
        
        Transaction History:
        ${JSON.stringify(txList, null, 2)}

        Provide 3 to 5 highly personalized recommendations. Examples:
        - Security: Flagging recurring subscriptions that increased in price.
        - Optimization: Suggesting a Visa Signature or Infinite upgrade if they spend heavily on travel/dining.
        - Budgeting: Identifying categories where spending has spiked.

        Respond strictly with a valid JSON array of objects matching this schema (do not include any markdown formatting, code blocks, or extra text):
        [
          {
            "category": "string (e.g., Cashback, Security, Budgeting, Card Upgrade)",
            "title": "string",
            "description": "string",
            "impactScore": number (1 to 10),
            "actionableSteps": ["string"]
          }
        ]
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text().trim();
      const cleanJson = responseText.replace(/^```json\s*/i, "").replace(/\s*```$/, "");
      const recommendations: GeminiRecommendation[] = JSON.parse(cleanJson);

      return recommendations;
    } catch (error) {
      console.error("VisaService: Gemini recommendations failed, falling back to local recommendations.", error);
      return this.getFallbackRecommendations();
    }
  }

  // ============================================================================
  // Fallback / Helper Methods
  // ============================================================================

  /**
   * Local rule-based fraud analysis fallback.
   */
  private fallbackFraudAnalysis(transaction: VisaTransaction, card: VisaCard): GeminiAnalysisResult {
    let riskScore = 5;
    let isAnomaly = false;
    let reason = "Transaction matches normal spending profile.";

    // Rule 1: High amount check
    if (transaction.amount > 5000) {
      riskScore = 60;
      isAnomaly = true;
      reason = "High value transaction exceeds typical spending threshold.";
    }

    // Rule 2: Rapid velocity check (simulated)
    const recentTx = Array.from(this.transactions.values())
      .filter((tx) => tx.cardId === card.cardId)
      .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

    if (recentTx.length > 0) {
      const lastTx = recentTx[0];
      const timeDiff = Date.now() - lastTx.timestamp.getTime();
      if (timeDiff < 60000 && transaction.amount > 100) {
        // Less than 1 minute between transactions
        riskScore = 85;
        isAnomaly = true;
        reason = "Extreme velocity detected. Multiple transactions within 60 seconds.";
      }
    }

    // Rule 3: High risk MCCs
    if (transaction.merchantCategoryCode === "7995") {
      // Betting/Casino
      riskScore += 20;
      reason = "Transaction at high-risk merchant category (Gambling/Betting).";
    }

    const recommendedAction = riskScore >= 80 ? "BLOCK_CARD" : riskScore >= 50 ? "FLAG_FOR_REVIEW" : "ALLOW";

    return {
      riskScore,
      isAnomaly,
      reason,
      recommendedAction,
    };
  }

  /**
   * Local mock transaction generator fallback.
   */
  private generateFallbackMockTransactions(count: number): VisaTransaction[] {
    const merchants = [
      { name: "Amazon.com", mcc: "5942" },
      { name: "Uber Trip", mcc: "4121" },
      { name: "Netflix Subscription", mcc: "4899" },
      { name: "Target Stores", mcc: "5311" },
      { name: "Shell Oil", mcc: "5541" },
    ];

    const mockTxs: VisaTransaction[] = [];

    for (let i = 0; i < count; i++) {
      const merchant = merchants[Math.floor(Math.random() * merchants.length)];
      const amount = parseFloat((Math.random() * 150 + 5).toFixed(2));
      const transactionId = this.generateId("tx");

      mockTxs.push({
        transactionId,
        cardId: "visa-card-001",
        type: "PURCHASE",
        amount,
        currency: "USD",
        merchantName: merchant.name,
        merchantCategoryCode: merchant.mcc,
        status: "APPROVED",
        approvalCode: this.generateApprovalCode(),
        timestamp: new Date(Date.now() - i * 4 * 60 * 60 * 1000),
        riskScore: Math.floor(Math.random() * 15),
      });
    }

    return mockTxs;
  }

  /**
   * Local recommendations fallback.
   */
  private getFallbackRecommendations(): GeminiRecommendation[] {
    return [
      {
        category: "Cashback Optimization",
        title: "Upgrade to Visa Signature",
        description: "Based on your high spending at grocery stores and restaurants, upgrading to a Visa Signature card would yield an estimated $350 more in annual cashback.",
        impactScore: 8,
        actionableSteps: [
          "Navigate to Card Services in your portal.",
          "Select 'Upgrade Card Tier'.",
          "Confirm your income details to instantly upgrade.",
        ],
      },
      {
        category: "Security",
        title: "Enable Visa Secure Tokenization",
        description: "Your card is currently used on multiple online merchant sites with raw card details. Enabling Visa Token Service will secure your online purchases.",
        impactScore: 9,
        actionableSteps: [
          "Go to Security Settings.",
          "Toggle 'Visa Token Service' to ON.",
          "Your card details will be replaced with secure tokens for future online checkouts.",
        ],
      },
    ];
  }

  // ============================================================================
  // Utility Methods
  // ============================================================================

  private generateId(prefix: string): string {
    return `${prefix}-${crypto.randomBytes(8).toString("hex")}`;
  }

  private generateApprovalCode(): string {
    return Math.random().toString(36).substring(2, 8).toUpperCase();
  }

  private hashPin(pin: string): string {
    return crypto.createHash("sha256").update(pin).digest("hex");
  }
}

export const visaService = new VisaService();