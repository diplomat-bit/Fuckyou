import { Router, Request, Response, NextFunction } from "express";
import * as crypto from "crypto";
import { GoogleGenerativeAI } from "@google/generative-ai";
import { z } from "zod";
import { logger } from "./utils/logger";

// Initialize Express Router
const router = Router();

// Initialize Gemini AI Client
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// In-Memory Payment Ledger to simulate a high-fidelity database/ledger state
interface VisaTransaction {
  paymentId: string;
  visaReferenceId: string;
  amount: number;
  currency: string;
  status: "AUTHORIZED" | "SETTLED" | "FAILED" | "CANCELLED" | "PENDING";
  cardBrand: "VISA_CLASSIC" | "VISA_GOLD" | "VISA_PLATINUM" | "VISA_SIGNATURE" | "VISA_INFINITE" | "VISA_DIRECT";
  maskedPan: string;
  tokenReferenceId?: string;
  recipientName?: string;
  recipientAlias?: string;
  merchantCategoryCode: string;
  riskScore: number; // 0 to 100
  createdAt: string;
  updatedAt: string;
  history: Array<{ timestamp: string; status: string; note: string }>;
}

const paymentLedger = new Map<string, VisaTransaction>();

// Seed some initial high-value Visa transactions for realistic retrieval
const seedTransactions = () => {
  const seedId1 = "pay_visa_908127341";
  paymentLedger.set(seedId1, {
    paymentId: seedId1,
    visaReferenceId: "VSD-DIR-88291023",
    amount: 2500.0,
    currency: "USD",
    status: "SETTLED",
    cardBrand: "VISA_INFINITE",
    maskedPan: "411111******1111",
    tokenReferenceId: "vts-tok-99201823",
    merchantCategoryCode: "5411", // Grocery Stores
    riskScore: 12,
    createdAt: new Date(Date.now() - 86400000).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
    history: [
      { timestamp: new Date(Date.now() - 86400000).toISOString(), status: "AUTHORIZED", note: "Visa Token Service authorized successfully." },
      { timestamp: new Date(Date.now() - 86300000).toISOString(), status: "SETTLED", note: "Settlement cleared via VisaNet." }
    ]
  });

  const seedId2 = "pay_visa_102938475";
  paymentLedger.set(seedId2, {
    paymentId: seedId2,
    visaReferenceId: "VSD-DIR-77301928",
    amount: 12500.0,
    currency: "EUR",
    status: "AUTHORIZED",
    cardBrand: "VISA_DIRECT",
    maskedPan: "400000******0002",
    recipientName: "Sovereign Wealth Fund Alpha",
    recipientAlias: "swf-alpha@visa.alias",
    merchantCategoryCode: "6211", // Security Brokers/Dealers
    riskScore: 45,
    createdAt: new Date().toISOString(),
    updatedAt: new Date().toISOString(),
    history: [
      { timestamp: new Date().toISOString(), status: "AUTHORIZED", note: "Visa Direct push payment authorized." }
    ]
  });
};
seedTransactions();

// --- ZOD VALIDATION SCHEMAS ---

const ProcessPaymentSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0"),
  currency: z.string().length(3, "Currency must be a 3-letter ISO code"),
  cardholderName: z.string().min(2, "Cardholder name is required"),
  pan: z.string().regex(/^4[0-9]{12}(?:[0-9]{3})?$/, "Invalid Visa Card Number (PAN)"),
  expirationMonth: z.string().regex(/^(0[1-9]|1[0-2])$/, "Expiration month must be MM"),
  expirationYear: z.string().regex(/^[0-9]{4}$/, "Expiration year must be YYYY"),
  cvv: z.string().regex(/^[0-9]{3}$/, "CVV must be 3 digits"),
  merchantCategoryCode: z.string().default("5999"), // Miscellaneous Specialty Retail
  recipientName: z.string().optional(),
  recipientAlias: z.string().optional(), // Visa Direct Alias
  useTokenService: z.boolean().default(true)
});

const ResendPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  updatedAmount: z.number().positive().optional()
});

const CancelPaymentSchema = z.object({
  paymentId: z.string().min(1, "Payment ID is required"),
  reason: z.string().min(5, "Reason must be at least 5 characters long")
});

const AnalyzePaymentSchema = z.object({
  scenario: z.string().min(10, "Please provide a detailed payment scenario for Gemini analysis"),
  amount: z.number().optional(),
  currency: z.string().optional(),
  targetCountry: z.string().optional()
});

// --- VISA DEVELOPER API SIMULATOR (Visa Direct & Visa Token Service) ---

class VisaPaymentService {
  /**
   * Simulates Visa Token Service (VTS) provisioning
   */
  public static provisionToken(pan: string): { tokenReferenceId: string; maskedToken: string } {
    const hash = crypto.createHash("sha256").update(pan).digest("hex");
    return {
      tokenReferenceId: `vts-tok-${hash.substring(0, 12)}`,
      maskedToken: `411111******${pan.substring(pan.length - 4)}`
    };
  }

  /**
   * Simulates Visa Advanced Resilient Framework (VARF) Fraud Scoring
   */
  public static calculateRiskScore(pan: string, amount: number, mcc: string): number {
    let score = 15; // Base risk score
    if (amount > 10000) score += 25;
    if (amount > 50000) score += 40;
    if (mcc === "6211" || mcc === "7995") score += 20; // High risk MCCs (Dealers, Betting)
    if (pan.endsWith("9")) score += 15; // Simulated anomaly trigger
    return Math.min(score, 99);
  }

  /**
   * Generates a cryptographically secure Visa Transaction Reference ID
   */
  public static generateVisaReference(): string {
    return `VSD-DIR-${crypto.randomBytes(4).toString("hex").toUpperCase()}`;
  }
}

// --- ENDPOINTS ---

/**
 * @route   POST /api/visa-payment/process
 * @desc    Process a secure Visa payment using simulated Visa Direct / Visa Token Service
 * @access  Protected / Commercial
 */
router.post("/process", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    logger.info("Visa Payment processing request received", { amount: req.body.amount, currency: req.body.currency });

    const validation = ProcessPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({
        success: false,
        error: "Validation failed",
        details: validation.error.errors
      });
      return;
    }

    const data = validation.data;

    // 1. Simulate Visa Token Service (VTS)
    let tokenRef: string | undefined;
    let processedPan = data.pan;
    if (data.useTokenService) {
      const tokenResult = VisaPaymentService.provisionToken(data.pan);
      tokenRef = tokenResult.tokenReferenceId;
      processedPan = tokenResult.maskedToken;
      logger.info("Visa Token Service successfully provisioned token", { tokenReferenceId: tokenRef });
    }

    // 2. Calculate Risk Score via Visa Advanced Resilient Framework
    const riskScore = VisaPaymentService.calculateRiskScore(data.pan, data.amount, data.merchantCategoryCode);
    if (riskScore > 85) {
      logger.warn("Visa Payment blocked by VARF Fraud Engine", { riskScore, amount: data.amount });
      res.status(400).json({
        success: false,
        error: "Transaction declined by Visa Fraud Prevention Engine (VARF)",
        riskScore,
        visaResponseCode: "05", // Do Not Honor
        visaResponseDescription: "Declined due to high risk score"
      });
      return;
    }

    // 3. Determine Card Brand Tier
    let cardBrand: VisaTransaction["cardBrand"] = "VISA_CLASSIC";
    if (data.recipientAlias || data.recipientName) {
      cardBrand = "VISA_DIRECT";
    } else if (data.amount > 10000) {
      cardBrand = "VISA_INFINITE";
    } else if (data.amount > 5000) {
      cardBrand = "VISA_SIGNATURE";
    } else if (data.amount > 2000) {
      cardBrand = "VISA_PLATINUM";
    }

    // 4. Create Transaction Record
    const paymentId = `pay_visa_${crypto.randomBytes(8).toString("hex")}`;
    const visaRef = VisaPaymentService.generateVisaReference();
    const timestamp = new Date().toISOString();

    const transaction: VisaTransaction = {
      paymentId,
      visaReferenceId: visaRef,
      amount: data.amount,
      currency: data.currency.toUpperCase(),
      status: "AUTHORIZED",
      cardBrand,
      maskedPan: `411111******${data.pan.substring(data.pan.length - 4)}`,
      tokenReferenceId: tokenRef,
      recipientName: data.recipientName,
      recipientAlias: data.recipientAlias,
      merchantCategoryCode: data.merchantCategoryCode,
      riskScore,
      createdAt: timestamp,
      updatedAt: timestamp,
      history: [
        { timestamp, status: "AUTHORIZED", note: `Authorized via VisaNet. Brand: ${cardBrand}. Risk Score: ${riskScore}` }
      ]
    };

    // Save to ledger
    paymentLedger.set(paymentId, transaction);

    logger.info("Visa Payment successfully authorized", { paymentId, visaReferenceId: visaRef });

    res.status(201).json({
      success: true,
      message: "Visa payment processed and authorized successfully",
      data: {
        paymentId,
        visaReferenceId: visaRef,
        amount: transaction.amount,
        currency: transaction.currency,
        status: transaction.status,
        cardBrand: transaction.cardBrand,
        maskedPan: transaction.maskedPan,
        tokenReferenceId: transaction.tokenReferenceId,
        riskScore: transaction.riskScore,
        createdAt: transaction.createdAt
      }
    });
  } catch (error) {
    logger.error("Error processing Visa payment", { error });
    next(error);
  }
});

/**
 * @route   POST /api/visa-payment/resend
 * @desc    Resend or retry a failed or pending Visa payment with optional updated parameters
 * @access  Protected / Commercial
 */
router.post("/resend", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = ResendPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: "Validation failed", details: validation.error.errors });
      return;
    }

    const { paymentId, updatedAmount } = validation.data;
    const transaction = paymentLedger.get(paymentId);

    if (!transaction) {
      res.status(404).json({ success: false, error: "Visa transaction not found" });
      return;
    }

    if (transaction.status === "SETTLED") {
      res.status(400).json({ success: false, error: "Cannot resend a transaction that has already settled" });
      return;
    }

    const timestamp = new Date().toISOString();
    if (updatedAmount) {
      transaction.amount = updatedAmount;
    }
    transaction.status = "PENDING";
    transaction.updatedAt = timestamp;
    transaction.history.push({
      timestamp,
      status: "PENDING",
      note: `Payment resend triggered. Updated amount: ${transaction.amount} ${transaction.currency}`
    });

    // Simulate immediate settlement on resend
    transaction.status = "SETTLED";
    transaction.history.push({
      timestamp,
      status: "SETTLED",
      note: "Settled successfully on retry via VisaNet."
    });

    paymentLedger.set(paymentId, transaction);

    logger.info("Visa Payment resent and settled", { paymentId, amount: transaction.amount });

    res.status(200).json({
      success: true,
      message: "Visa payment resent and settled successfully",
      data: transaction
    });
  } catch (error) {
    logger.error("Error resending Visa payment", { error });
    next(error);
  }
});

/**
 * @route   POST /api/visa-payment/cancel
 * @desc    Cancel/Void an authorized or pending Visa payment
 * @access  Protected / Commercial
 */
router.post("/cancel", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = CancelPaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: "Validation failed", details: validation.error.errors });
      return;
    }

    const { paymentId, reason } = validation.data;
    const transaction = paymentLedger.get(paymentId);

    if (!transaction) {
      res.status(404).json({ success: false, error: "Visa transaction not found" });
      return;
    }

    if (transaction.status === "SETTLED") {
      res.status(400).json({ success: false, error: "Cannot cancel/void a transaction that has already settled" });
      return;
    }

    const timestamp = new Date().toISOString();
    transaction.status = "CANCELLED";
    transaction.updatedAt = timestamp;
    transaction.history.push({
      timestamp,
      status: "CANCELLED",
      note: `Transaction voided. Reason: ${reason}`
    });

    paymentLedger.set(paymentId, transaction);

    logger.info("Visa Payment successfully cancelled/voided", { paymentId, reason });

    res.status(200).json({
      success: true,
      message: "Visa payment successfully cancelled/voided",
      data: transaction
    });
  } catch (error) {
    logger.error("Error cancelling Visa payment", { error });
    next(error);
  }
});

/**
 * @route   GET /api/visa-payment/details/:paymentId
 * @desc    Retrieve payment details with Gemini-powered natural language insights & risk analysis
 * @access  Protected / Commercial
 */
router.get("/details/:paymentId", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const { paymentId } = req.params;
    const transaction = paymentLedger.get(paymentId);

    if (!transaction) {
      res.status(404).json({ success: false, error: "Visa transaction not found" });
      return;
    }

    let aiInsights = "Gemini AI analysis is currently unavailable. Please check your API configuration.";

    if (genAI) {
      try {
        const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
        const prompt = `
          You are an elite Visa Payment Operations Analyst. Analyze the following Visa transaction details and provide:
          1. A concise, professional summary of the transaction status and tier.
          2. A risk assessment based on the risk score (${transaction.riskScore}/100) and Merchant Category Code (${transaction.merchantCategoryCode}).
          3. Actionable recommendations for optimization (e.g., routing, tokenization benefits, or liquidity management).

          Transaction Details:
          - ID: ${transaction.paymentId}
          - Visa Reference: ${transaction.visaReferenceId}
          - Amount: ${transaction.amount} ${transaction.currency}
          - Status: ${transaction.status}
          - Card Brand: ${transaction.cardBrand}
          - Token Reference: ${transaction.tokenReferenceId || "None"}
          - Recipient: ${transaction.recipientName || "N/A"} (${transaction.recipientAlias || "No Alias"})
          - Risk Score: ${transaction.riskScore}
          - MCC: ${transaction.merchantCategoryCode}

          Provide your response in clean, professional markdown format.
        `;

        const result = await model.generateContent(prompt);
        const responseText = result.response.text();
        if (responseText) {
          aiInsights = responseText.trim();
        }
      } catch (aiError) {
        logger.error("Gemini AI generation failed for transaction details", { aiError });
        aiInsights = "Failed to generate real-time AI insights due to an upstream model error. Standard transaction details are provided below.";
      }
    }

    res.status(200).json({
      success: true,
      data: transaction,
      aiInsights
    });
  } catch (error) {
    logger.error("Error retrieving Visa payment details", { error });
    next(error);
  }
});

/**
 * @route   POST /api/visa-payment/analyze
 * @desc    Gemini-powered payment optimization and routing advice for complex scenarios
 * @access  Protected / Commercial
 */
router.post("/analyze", async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  try {
    const validation = AnalyzePaymentSchema.safeParse(req.body);
    if (!validation.success) {
      res.status(400).json({ success: false, error: "Validation failed", details: validation.error.errors });
      return;
    }

    const { scenario, amount, currency, targetCountry } = validation.data;

    if (!genAI) {
      res.status(503).json({
        success: false,
        error: "Gemini AI service is not configured. Please set GEMINI_API_KEY."
      });
      return;
    }

    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
    const prompt = `
      You are a Principal Payment Architect specializing in Visa Developer APIs, Visa Direct, Visa B2B Connect, and CyberSource.
      Analyze the following payment scenario and provide a highly technical, production-ready integration strategy.

      Scenario: "${scenario}"
      ${amount ? `- Proposed Amount: ${amount}` : ""}
      ${currency ? `- Currency: ${currency}` : ""}
      ${targetCountry ? `- Target Country/Jurisdiction: ${targetCountry}` : ""}

      Your response must include:
      1. **Recommended Visa Product**: (e.g., Visa Direct for real-time push/pull, Visa B2B Connect for cross-border wholesale, Visa Token Service for security, or CyberSource for advanced merchant services). Explain *why*.
      2. **API Integration Flow**: Step-by-step technical flow of how the backend should orchestrate this transaction.
      3. **Security & Compliance**: Specific recommendations regarding PCI-DSS, tokenization, and regional compliance (e.g., PSD2 SCA in Europe, or local clearing rules).
      4. **Risk Mitigation**: How to handle potential declines, network downtime, or high-risk flags.

      Format your response with clear headings, bullet points, and professional technical language.
    `;

    logger.info("Sending payment scenario to Gemini for architectural analysis");
    const result = await model.generateContent(prompt);
    const analysis = result.response.text();

    res.status(200).json({
      success: true,
      scenario,
      analysis: analysis.trim()
    });
  } catch (error) {
    logger.error("Error analyzing payment scenario with Gemini", { error });
    next(error);
  }
});

export default router;