import { Router, Request, Response, NextFunction } from "express";
import crypto from "crypto";
import { GoogleGenerativeAI, Schema, Type } from "@google/generative-ai";
import { logger } from "./utils/logger.js";

// Initialize Gemini API Client
const geminiApiKey = process.env.GEMINI_API_KEY || "";
const genAI = geminiApiKey ? new GoogleGenerativeAI(geminiApiKey) : null;

// ============================================================================
// TYPES & INTERFACES (Visa Token Service & EMVCo Specifications)
// ============================================================================

export interface VisaEnrollmentRequest {
  pan: string;
  expirationMonth: string;
  expirationYear: string;
  cvv2: string;
  userId: string;
  deviceId: string;
  deviceType: "ANDROID" | "IOS" | "WEARABLE" | "CLOUD";
  deviceFingerprint: string;
  walletProvider: "APPLE_PAY" | "GOOGLE_PAY" | "SAMSUNG_PAY" | "SOVEREIGN_WALLET";
}

export interface VisaEnrollment {
  enrollmentId: string;
  tokenReferenceId: string;
  maskedPan: string;
  tokenPan: string;
  tokenExpiry: string;
  status: "ACTIVE" | "SUSPENDED" | "DEACTIVATED" | "PENDING_IDV";
  userId: string;
  deviceId: string;
  createdAt: string;
  updatedAt: string;
}

export interface TokenStatusUpdateRequest {
  tokenReferenceId: string;
  operation: "SUSPEND" | "RESUME" | "DEACTIVATE";
  reasonCode: "DEVICE_LOST" | "DEVICE_STOLEN" | "ACCOUNT_CLOSED" | "SUSPECTED_FRAUD" | "USER_REQUEST";
}

export interface HceReplenishRequest {
  tokenReferenceId: string;
  deviceId: string;
  currentLukCount: number;
  deviceAttestation: string; // Hardware-backed attestation payload
}

export interface LimitedUseKey {
  keyId: string;
  encryptedKey: string; // Encrypted LUK
  expiryTimestamp: number;
  maxUses: number;
}

export interface CryptogramRequest {
  tokenReferenceId: string;
  transactionAmount: number;
  currencyCode: string; // ISO 4217
  merchantId: string;
  merchantName: string;
  terminalType: "NFC" | "E_COMMERCE" | "IN_APP";
  unpredictableNumber: string; // EMV Unpredictable Number (UN)
}

export interface VisaPaymentCryptogram {
  cryptogramValue: string; // EMV Application Cryptogram (ARQC)
  cryptogramType: "TAV" | "D_CVV" | "EMV_3DS";
  tokenSequenceNumber: string;
  expiryTimestamp: number;
}

export interface VisaAuthorizationRequest {
  transactionId: string;
  tokenPan: string;
  cryptogram: string;
  amount: number;
  currencyCode: string;
  merchantId: string;
  merchantCategoryCode: string; // MCC
  merchantLocation: string;
  posEntryMode: string; // e.g., "07" for contactless
  deviceFingerprint?: string;
}

export interface VisaAuthorizationResponse {
  transactionId: string;
  authCode: string;
  decision: "APPROVED" | "DECLINED" | "CHALLENGE_REQUIRED";
  reasonCode: string;
  riskScore: number;
  aiAnalysis?: string;
}

export interface AiRiskAnalysis {
  riskScore: number; // 0 to 100
  decision: "APPROVE" | "CHALLENGE" | "DECLINE";
  reasoning: string;
  anomaliesDetected: string[];
  recommendedAction: string;
}

// ============================================================================
// IN-MEMORY DATA STORE (Simulating Visa Secure Vault)
// ============================================================================

class VisaSecureVault {
  private enrollments = new Map<string, VisaEnrollment>();
  private hceKeys = new Map<string, LimitedUseKey[]>();
  private transactionHistory = new Map<string, any[]>();

  public saveEnrollment(enrollment: VisaEnrollment): void {
    this.enrollments.set(enrollment.tokenReferenceId, enrollment);
  }

  public getEnrollment(tokenReferenceId: string): VisaEnrollment | undefined {
    return this.enrollments.get(tokenReferenceId);
  }

  public getEnrollmentByPan(pan: string): VisaEnrollment | undefined {
    const masked = this.maskPan(pan);
    return Array.from(this.enrollments.values()).find(e => e.maskedPan === masked);
  }

  public updateEnrollmentStatus(tokenReferenceId: string, status: VisaEnrollment["status"]): boolean {
    const enrollment = this.enrollments.get(tokenReferenceId);
    if (enrollment) {
      enrollment.status = status;
      enrollment.updatedAt = new Date().toISOString();
      this.enrollments.set(tokenReferenceId, enrollment);
      return true;
    }
    return false;
  }

  public saveHceKeys(tokenReferenceId: string, keys: LimitedUseKey[]): void {
    this.hceKeys.set(tokenReferenceId, keys);
  }

  public getHceKeys(tokenReferenceId: string): LimitedUseKey[] {
    return this.hceKeys.get(tokenReferenceId) || [];
  }

  public logTransaction(userId: string, transaction: any): void {
    const userTx = this.transactionHistory.get(userId) || [];
    userTx.push({ ...transaction, timestamp: new Date().toISOString() });
    this.transactionHistory.set(userId, userTx);
  }

  public getTransactionHistory(userId: string): any[] {
    return this.transactionHistory.get(userId) || [];
  }

  public maskPan(pan: string): string {
    const cleanPan = pan.replace(/\s+/g, "");
    if (cleanPan.length < 10) return "****";
    return `${cleanPan.substring(0, 6)}******${cleanPan.substring(cleanPan.length - 4)}`;
  }

  public generateTokenPan(originalPan: string): string {
    // Generate a valid-looking token PAN (using Visa BIN range, e.g., 4812)
    const cleanPan = originalPan.replace(/\s+/g, "");
    const last4 = cleanPan.substring(cleanPan.length - 4);
    const randomMiddle = crypto.randomInt(100000, 999999).toString();
    return `4812${randomMiddle}${last4}`;
  }
}

const secureVault = new VisaSecureVault();

// ============================================================================
// VISA PAY GEMINI BRIDGE (AI Risk & Fraud Analysis Engine)
// ============================================================================

class VisaPayGeminiBridge {
  /**
   * Analyzes risk for Visa Pay operations using Gemini's structured JSON output capabilities.
   */
  public static async analyzeRisk(
    contextType: "ENROLLMENT" | "REPLENISHMENT" | "CRYPTOGRAM" | "AUTHORIZATION",
    payload: any,
    history: any[] = []
  ): Promise<AiRiskAnalysis> {
    if (!genAI) {
      logger.warn("Gemini API Key not configured. Falling back to deterministic rule-based risk engine.");
      return this.fallbackRiskEngine(contextType, payload, history);
    }

    try {
      const model = genAI.getGenerativeModel({
        model: "gemini-1.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: this.getRiskAnalysisSchema(),
        },
      });

      const prompt = `
        You are Visa's Advanced AI Risk Engine (VAA/VRM). Analyze the following transaction/operation payload and historical context.
        Assess fraud risk, velocity anomalies, device integrity, and behavioral patterns.
        
        Context Type: ${contextType}
        
        Current Payload:
        ${JSON.stringify(payload, null, 2)}
        
        User Transaction History (Last 10 events):
        ${JSON.stringify(history.slice(-10), null, 2)}
        
        Provide a strict JSON response matching the schema. Be highly analytical, secure, and precise.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText) as AiRiskAnalysis;
    } catch (error) {
      logger.error("Error in Gemini Risk Analysis Bridge:", error);
      return this.fallbackRiskEngine(contextType, payload, history);
    }
  }

  private static getRiskAnalysisSchema(): Schema {
    return {
      type: Type.OBJECT,
      properties: {
        riskScore: {
          type: Type.INTEGER,
          description: "A risk score from 0 (no risk) to 100 (extreme fraud risk).",
        },
        decision: {
          type: Type.STRING,
          enum: ["APPROVE", "CHALLENGE", "DECLINE"],
          description: "The risk decision based on the score and anomalies.",
        },
        reasoning: {
          type: Type.STRING,
          description: "Detailed explanation of the risk assessment.",
        },
        anomaliesDetected: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of specific anomalies detected (e.g., rapid velocity, device mismatch).",
        },
        recommendedAction: {
          type: Type.STRING,
          description: "Recommended mitigation action (e.g., 'Require biometric step-up', 'Block device fingerprint').",
        },
      },
      required: ["riskScore", "decision", "reasoning", "anomaliesDetected", "recommendedAction"],
    };
  }

  /**
   * Deterministic fallback risk engine in case Gemini is unavailable.
   */
  private static fallbackRiskEngine(contextType: string, payload: any, history: any[]): AiRiskAnalysis {
    let riskScore = 10;
    const anomalies: string[] = [];

    if (contextType === "ENROLLMENT") {
      // Check for suspicious device types or missing fingerprints
      if (!payload.deviceFingerprint || payload.deviceFingerprint.length < 10) {
        riskScore += 30;
        anomalies.push("Weak or missing device fingerprint");
      }
      if (payload.deviceType === "CLOUD") {
        riskScore += 20;
        anomalies.push("Enrollment requested from cloud environment");
      }
    }

    if (contextType === "AUTHORIZATION") {
      // Check velocity
      const recentTx = history.filter(tx => {
        const txTime = new Date(tx.timestamp).getTime();
        const now = Date.now();
        return now - txTime < 5 * 60 * 1000; // Last 5 minutes
      });

      if (recentTx.length > 3) {
        riskScore += 40;
        anomalies.push("High velocity: multiple transactions in under 5 minutes");
      }

      if (payload.amount > 5000) {
        riskScore += 25;
        anomalies.push("High value transaction");
      }
    }

    let decision: "APPROVE" | "CHALLENGE" | "DECLINE" = "APPROVE";
    if (riskScore >= 70) {
      decision = "DECLINE";
    } else if (riskScore >= 35) {
      decision = "CHALLENGE";
    }

    return {
      riskScore,
      decision,
      reasoning: "Deterministic fallback engine evaluated transaction parameters.",
      anomaliesDetected: anomalies,
      recommendedAction: decision === "CHALLENGE" ? "Require 3D-Secure or Biometric verification" : "Proceed with standard processing",
    };
  }
}

// ============================================================================
// EXPRESS ROUTER IMPLEMENTATION
// ============================================================================

const router = Router();

/**
 * @route   POST /api/visa-pay/enrollment
 * @desc    Enroll a new card into Visa Token Service (VTS) with real-time AI risk analysis.
 * @access  Protected (Requires valid session/auth)
 */
router.post("/enrollment", async (req: Request, res: Response, next: NextFunction) => {
  try {
    const enrollmentReq: VisaEnrollmentRequest = req.body;

    // Basic Validation
    if (!enrollmentReq.pan || !enrollmentReq.expirationMonth || !enrollmentReq.expirationYear || !enrollmentReq.cvv2) {
      return res.status(400).json({ error: "Missing required card credentials." });
    }
    if (!enrollmentReq.userId || !enrollmentReq.deviceId) {
      return res.status(400).json({ error: "Missing user or device identification." });
    }

    // Fetch user history for risk context
    const history = secureVault.getTransactionHistory(enrollmentReq.userId);

    // Run AI Risk Analysis on Enrollment
    const riskAnalysis = await VisaPayGeminiBridge.analyzeRisk("ENROLLMENT", {
      userId: enrollmentReq.userId,
      deviceId: enrollmentReq.deviceId,
      deviceType: enrollmentReq.deviceType,
      walletProvider: enrollmentReq.walletProvider,
      maskedPan: secureVault.maskPan(enrollmentReq.pan),
    }, history);

    if (riskAnalysis.decision === "DECLINE") {
      logger.warn(`Visa Pay Enrollment declined by AI Risk Engine for User: ${enrollmentReq.userId}. Reason: ${riskAnalysis.reasoning}`);
      return res.status(403).json({
        error: "Enrollment declined due to security policy.",
        riskAnalysis,
      });
    }

    // Generate VTS Token Credentials
    const enrollmentId = `enr_${crypto.randomUUID()}`;
    const tokenReferenceId = `vtr_${crypto.randomBytes(12).toString("hex")}`;
    const tokenPan = secureVault.generateTokenPan(enrollmentReq.pan);
    const tokenExpiry = `${enrollmentReq.expirationMonth}/${enrollmentReq.expirationYear}`;

    const enrollment: VisaEnrollment = {
      enrollmentId,
      tokenReferenceId,
      maskedPan: secureVault.maskPan(enrollmentReq.pan),
      tokenPan,
      tokenExpiry,
      status: riskAnalysis.decision === "CHALLENGE" ? "PENDING_IDV" : "ACTIVE",
      userId: enrollmentReq.userId,
      deviceId: enrollmentReq.deviceId,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Save to Secure Vault
    secureVault.saveEnrollment(enrollment);
    secureVault.logTransaction(enrollmentReq.userId, {
      action: "ENROLLMENT_CREATED",
      tokenReferenceId,
      status: enrollment.status,
    });

    logger.info(`Successfully enrolled card in VTS. Token Reference ID: ${tokenReferenceId}. Status: ${enrollment.status}`);

    return res.status(201).json({
      message: "Enrollment processed successfully.",
      enrollment: {
        enrollmentId: enrollment.enrollmentId,
        tokenReferenceId: enrollment.tokenReferenceId,
        maskedPan: enrollment.maskedPan,
        tokenExpiry: enrollment.tokenExpiry,
        status: enrollment.status,
        createdAt: enrollment.createdAt,
      },
      riskAnalysis,
    });
  } catch (error) {
    logger.error("Error in Visa Pay Enrollment:", error);
    return res.status(500).json({ error: "Internal server error during VTS enrollment." });
  }
});

/**
 * @route   GET /api/visa-pay/enrollment/:tokenReferenceId
 * @desc    Retrieve enrollment details from the secure vault.
 */
router.get("/enrollment/:tokenReferenceId", async (req: Request, res: Response) => {
  try {
    const { tokenReferenceId } = req.params;
    const enrollment = secureVault.getEnrollment(tokenReferenceId);

    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found." });
    }

    // Return sanitized enrollment details
    return res.status(200).json({
      enrollmentId: enrollment.enrollmentId,
      tokenReferenceId: enrollment.tokenReferenceId,
      maskedPan: enrollment.maskedPan,
      status: enrollment.status,
      createdAt: enrollment.createdAt,
      updatedAt: enrollment.updatedAt,
    });
  } catch (error) {
    logger.error("Error retrieving enrollment:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @route   POST /api/visa-pay/token/status
 * @desc    Update token status (Suspend, Resume, Deactivate) in accordance with VTS lifecycle management.
 */
router.post("/token/status", async (req: Request, res: Response) => {
  try {
    const updateReq: TokenStatusUpdateRequest = req.body;

    if (!updateReq.tokenReferenceId || !updateReq.operation || !updateReq.reasonCode) {
      return res.status(400).json({ error: "Missing required parameters." });
    }

    const enrollment = secureVault.getEnrollment(updateReq.tokenReferenceId);
    if (!enrollment) {
      return res.status(404).json({ error: "Token reference not found." });
    }

    let targetStatus: VisaEnrollment["status"] = "ACTIVE";
    if (updateReq.operation === "SUSPEND") targetStatus = "SUSPENDED";
    if (updateReq.operation === "DEACTIVATE") targetStatus = "DEACTIVATED";

    const success = secureVault.updateEnrollmentStatus(updateReq.tokenReferenceId, targetStatus);

    if (success) {
      secureVault.logTransaction(enrollment.userId, {
        action: `TOKEN_${updateReq.operation}`,
        tokenReferenceId: updateReq.tokenReferenceId,
        reasonCode: updateReq.reasonCode,
      });

      logger.info(`Token ${updateReq.tokenReferenceId} status updated to ${targetStatus} due to ${updateReq.reasonCode}`);
      return res.status(200).json({
        message: "Token status updated successfully.",
        tokenReferenceId: updateReq.tokenReferenceId,
        status: targetStatus,
      });
    }

    return res.status(500).json({ error: "Failed to update token status." });
  } catch (error) {
    logger.error("Error updating token status:", error);
    return res.status(500).json({ error: "Internal server error." });
  }
});

/**
 * @route   POST /api/visa-pay/hce/replenish
 * @desc    Replenish Host Card Emulation (HCE) Limited Use Keys (LUKs) with device attestation validation.
 */
router.post("/hce/replenish", async (req: Request, res: Response) => {
  try {
    const replenishReq: HceReplenishRequest = req.body;

    if (!replenishReq.tokenReferenceId || !replenishReq.deviceId) {
      return res.status(400).json({ error: "Missing token reference or device ID." });
    }

    const enrollment = secureVault.getEnrollment(replenishReq.tokenReferenceId);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found." });
    }

    if (enrollment.status !== "ACTIVE") {
      return res.status(400).json({ error: `Cannot replenish keys for token with status: ${enrollment.status}` });
    }

    // Run AI Risk Analysis on Replenishment Request
    const riskAnalysis = await VisaPayGeminiBridge.analyzeRisk("REPLENISHMENT", {
      tokenReferenceId: replenishReq.tokenReferenceId,
      deviceId: replenishReq.deviceId,
      currentLukCount: replenishReq.currentLukCount,
      deviceAttestation: replenishReq.deviceAttestation ? "PRESENT" : "MISSING",
    }, secureVault.getTransactionHistory(enrollment.userId));

    if (riskAnalysis.decision === "DECLINE") {
      logger.warn(`HCE Replenishment declined by AI Risk Engine for Token: ${replenishReq.tokenReferenceId}`);
      return res.status(403).json({
        error: "Replenishment request blocked due to security anomalies.",
        riskAnalysis,
      });
    }

    // Generate a batch of 5 Limited Use Keys (LUKs)
    const newKeys: LimitedUseKey[] = Array.from({ length: 5 }).map(() => {
      const keyId = `luk_${crypto.randomBytes(8).toString("hex")}`;
      // Simulate key generation encrypted with the device's public key (MUK - Master Union Key)
      const encryptedKey = crypto.randomBytes(32).toString("hex");
      return {
        keyId,
        encryptedKey,
        expiryTimestamp: Date.now() + 7 * 24 * 60 * 60 * 1000, // 7 days validity
        maxUses: 10, // Max 10 transactions per LUK
      };
    });

    secureVault.saveHceKeys(replenishReq.tokenReferenceId, newKeys);
    secureVault.logTransaction(enrollment.userId, {
      action: "HCE_KEYS_REPLENISHED",
      tokenReferenceId: replenishReq.tokenReferenceId,
      keyCount: newKeys.length,
    });

    logger.info(`Replenished ${newKeys.length} HCE keys for Token Reference ID: ${replenishReq.tokenReferenceId}`);

    return res.status(200).json({
      message: "HCE keys replenished successfully.",
      keys: newKeys,
      riskAnalysis,
    });
  } catch (error) {
    logger.error("Error replenishing HCE keys:", error);
    return res.status(500).json({ error: "Internal server error during key replenishment." });
  }
});

/**
 * @route   POST /api/visa-pay/cryptogram
 * @desc    Generate a dynamic payment cryptogram (TAV/dCVV) for a transaction.
 */
router.post("/cryptogram", async (req: Request, res: Response) => {
  try {
    const cryptoReq: CryptogramRequest = req.body;

    if (!cryptoReq.tokenReferenceId || !cryptoReq.transactionAmount || !cryptoReq.currencyCode) {
      return res.status(400).json({ error: "Missing transaction parameters for cryptogram generation." });
    }

    const enrollment = secureVault.getEnrollment(cryptoReq.tokenReferenceId);
    if (!enrollment) {
      return res.status(404).json({ error: "Enrollment not found." });
    }

    if (enrollment.status !== "ACTIVE") {
      return res.status(400).json({ error: "Token is not active." });
    }

    // Run AI Risk Analysis on Cryptogram Request
    const riskAnalysis = await VisaPayGeminiBridge.analyzeRisk("CRYPTOGRAM", {
      tokenReferenceId: cryptoReq.tokenReferenceId,
      amount: cryptoReq.transactionAmount,
      currency: cryptoReq.currencyCode,
      merchantName: cryptoReq.merchantName,
      terminalType: cryptoReq.terminalType,
    }, secureVault.getTransactionHistory(enrollment.userId));

    if (riskAnalysis.decision === "DECLINE") {
      logger.warn(`Cryptogram generation blocked by AI Risk Engine for Token: ${cryptoReq.tokenReferenceId}`);
      return res.status(403).json({
        error: "Cryptogram generation blocked due to high risk.",
        riskAnalysis,
      });
    }

    // Generate EMV Dynamic Cryptogram
    const hmac = crypto.createHmac("sha256", crypto.randomBytes(32));
    hmac.update(`${cryptoReq.tokenReferenceId}:${cryptoReq.unpredictableNumber}:${cryptoReq.transactionAmount}`);
    const cryptogramValue = hmac.digest("hex").substring(0, 16).toUpperCase();

    const cryptogram: VisaPaymentCryptogram = {
      cryptogramValue,
      cryptogramType: cryptoReq.terminalType === "NFC" ? "TAV" : "D_CVV",
      tokenSequenceNumber: "01",
      expiryTimestamp: Date.now() + 15 * 60 * 1000, // 15 minutes validity
    };

    secureVault.logTransaction(enrollment.userId, {
      action: "CRYPTOGRAM_GENERATED",
      tokenReferenceId: cryptoReq.tokenReferenceId,
      amount: cryptoReq.transactionAmount,
      merchantName: cryptoReq.merchantName,
    });

    return res.status(200).json({
      cryptogram,
      riskAnalysis,
    });
  } catch (error) {
    logger.error("Error generating cryptogram:", error);
    return res.status(500).json({ error: "Internal server error during cryptogram generation." });
  }
});

/**
 * @route   POST /api/visa-pay/authorize
 * @desc    VisaNet Authorization Callback. Simulates real-time transaction authorization with Gemini AI risk analysis.
 */
router.post("/authorize", async (req: Request, res: Response) => {
  try {
    const authReq: VisaAuthorizationRequest = req.body;

    if (!authReq.transactionId || !authReq.tokenPan || !authReq.cryptogram || !authReq.amount) {
      return res.status(400).json({ error: "Missing authorization parameters." });
    }

    // Find enrollment by Token PAN
    const enrollment = Array.from(secureVault["enrollments"].values()).find(
      e => e.tokenPan === authReq.tokenPan
    );

    if (!enrollment) {
      return res.status(404).json({
        transactionId: authReq.transactionId,
        authCode: "",
        decision: "DECLINED",
        reasonCode: "TOKEN_NOT_FOUND",
        riskScore: 100,
      });
    }

    if (enrollment.status !== "ACTIVE") {
      return res.status(400).json({
        transactionId: authReq.transactionId,
        authCode: "",
        decision: "DECLINED",
        reasonCode: `TOKEN_INACTIVE_${enrollment.status}`,
        riskScore: 100,
      });
    }

    // Run AI Risk Analysis on Authorization Request
    const riskAnalysis = await VisaPayGeminiBridge.analyzeRisk("AUTHORIZATION", {
      transactionId: authReq.transactionId,
      amount: authReq.amount,
      currencyCode: authReq.currencyCode,
      merchantId: authReq.merchantId,
      merchantCategoryCode: authReq.merchantCategoryCode,
      merchantLocation: authReq.merchantLocation,
      posEntryMode: authReq.posEntryMode,
      deviceFingerprint: authReq.deviceFingerprint,
    }, secureVault.getTransactionHistory(enrollment.userId));

    let decision: VisaAuthorizationResponse["decision"] = "APPROVED";
    let reasonCode = "00"; // Approved

    if (riskAnalysis.decision === "DECLINE") {
      decision = "DECLINED";
      reasonCode = "05"; // Do Not Honor / Suspected Fraud
    } else if (riskAnalysis.decision === "CHALLENGE") {
      decision = "CHALLENGE_REQUIRED";
      reasonCode = "3D"; // Step-up authentication required
    }

    const authCode = decision === "APPROVED" ? crypto.randomInt(100000, 999999).toString() : "";

    // Log transaction to history
    secureVault.logTransaction(enrollment.userId, {
      action: "AUTHORIZATION_PROCESSED",
      transactionId: authReq.transactionId,
      amount: authReq.amount,
      merchantName: authReq.merchantLocation,
      decision,
      riskScore: riskAnalysis.riskScore,
    });

    logger.info(`Visa Pay Authorization processed for Tx: ${authReq.transactionId}. Decision: ${decision}. Risk Score: ${riskAnalysis.riskScore}`);

    const response: VisaAuthorizationResponse = {
      transactionId: authReq.transactionId,
      authCode,
      decision,
      reasonCode,
      riskScore: riskAnalysis.riskScore,
      aiAnalysis: riskAnalysis.reasoning,
    };

    return res.status(200).json(response);
  } catch (error) {
    logger.error("Error in Visa Pay Authorization:", error);
    return res.status(500).json({ error: "Internal server error during authorization processing." });
  }
});

export default router;