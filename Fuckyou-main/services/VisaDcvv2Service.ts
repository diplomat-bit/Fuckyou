import * as crypto from "crypto";
import { GoogleGenerativeAI, Schema, Type } from "@google/generative-ai";

/**
 * Configuration for Dynamic CVV2 (dCVV2) generation.
 */
export interface Dcvv2Config {
  type: "TIME_BASED" | "COUNTER_BASED";
  expirySeconds?: number; // For TIME_BASED (default: 180s)
  length?: 3 | 4; // Length of the generated CVV (default: 3)
}

/**
 * Card enrollment details stored securely.
 */
interface CardEnrollment {
  panHash: string;
  maskedPan: string;
  expiryDate: string; // MM/YY
  serviceCode: string;
  config: Dcvv2Config;
  counter: number;
  enrolledAt: Date;
  status: "ACTIVE" | "SUSPENDED" | "UNENROLLED";
}

/**
 * Context of the transaction requesting dCVV2 generation.
 */
export interface TransactionContext {
  amount: number;
  currency: string;
  merchantId: string;
  merchantName: string;
  merchantCategoryCode: string; // MCC
  deviceFingerprint?: string;
  ipAddress?: string;
  location?: {
    country: string;
    city?: string;
  };
  channel: "E_COMMERCE" | "MOBILE_WALLET" | "MOTO" | "RECURRING";
}

/**
 * Result of the Gemini AI pre-generation risk assessment.
 */
export interface RiskAssessmentResult {
  riskScore: number; // 0 to 100
  decision: "APPROVE" | "CHALLENGE" | "DECLINE";
  reasoning: string;
  recommendedAction?: string;
  confidence: number; // 0.0 to 1.0
}

/**
 * Response returned after dCVV2 generation.
 */
export interface Dcvv2GenerationResult {
  dcvv2: string;
  expiryTime?: Date; // For TIME_BASED
  counter?: number; // For COUNTER_BASED
  riskAssessment: RiskAssessmentResult;
  auditLogId: string;
}

/**
 * Audit log entry for PCI-DSS and security compliance.
 */
export interface Dcvv2AuditLog {
  id: string;
  timestamp: Date;
  action: "ENROLL" | "UNENROLL" | "INQUIRY" | "GENERATE" | "VERIFY";
  panHash: string;
  maskedPan: string;
  success: boolean;
  riskScore?: number;
  decision?: string;
  details: string;
}

/**
 * Core backend service implementing Visa dCVV2 Enroll, Unenroll, Inquiry, and Generation APIs,
 * integrated with Gemini AI for pre-generation risk scoring and audit logging.
 */
export class VisaDcvv2Service {
  private enrollments: Map<string, CardEnrollment> = new Map();
  private auditLogs: Dcvv2AuditLog[] = [];
  private geminiClient: GoogleGenerativeAI | null = null;
  private masterDerivationKey: Buffer;

  constructor() {
    // Initialize Gemini AI client if API key is available
    const apiKey = process.env.GEMINI_API_KEY;
    if (apiKey) {
      this.geminiClient = new GoogleGenerativeAI(apiKey);
    } else {
      console.warn(
        "VisaDcvv2Service: GEMINI_API_KEY is not set. Falling back to deterministic rule-based risk scoring."
      );
    }

    // Initialize a secure Master Derivation Key (MDK) for dCVV2 generation.
    // In production, this would be loaded from a Hardware Security Module (HSM) or secure vault.
    const mdkHex = process.env.VISA_DCVV2_MDK || crypto.randomBytes(32).toString("hex");
    this.masterDerivationKey = Buffer.from(mdkHex, "hex");
  }

  /**
   * Securely hashes the PAN using SHA-256 to avoid storing raw PANs (PCI-DSS compliance).
   */
  private hashPan(pan: string): string {
    return crypto.createHash("sha256").update(pan.trim()).digest("hex");
  }

  /**
   * Masks the PAN to show only the first 6 and last 4 digits.
   */
  private maskPan(pan: string): string {
    const trimmed = pan.trim();
    if (trimmed.length < 10) return "****";
    return `${trimmed.slice(0, 6)}******${trimmed.slice(-4)}`;
  }

  /**
   * Generates a unique audit log entry.
   */
  private logAction(
    action: Dcvv2AuditLog["action"],
    pan: string,
    success: boolean,
    details: string,
    riskScore?: number,
    decision?: string
  ): string {
    const logId = crypto.randomUUID();
    const logEntry: Dcvv2AuditLog = {
      id: logId,
      timestamp: new Date(),
      action,
      panHash: this.hashPan(pan),
      maskedPan: this.maskPan(pan),
      success,
      riskScore,
      decision,
      details,
    };
    this.auditLogs.push(logEntry);
    
    // In a real production app, this would write to a secure database (e.g., AstraDB, Firestore)
    // and trigger a security alert if decision is DECLINE or risk is high.
    console.log(`[VisaDcvv2Service Audit] [${logEntry.timestamp.toISOString()}] Action: ${action} | Success: ${success} | Risk Score: ${riskScore ?? "N/A"} | Decision: ${decision ?? "N/A"}`);
    
    return logId;
  }

  /**
   * Enrolls a card for Dynamic CVV2 generation.
   */
  public async enroll(
    pan: string,
    expiryDate: string,
    serviceCode: string,
    config: Dcvv2Config = { type: "TIME_BASED", expirySeconds: 180, length: 3 }
  ): Promise<{ success: boolean; message: string; auditLogId: string }> {
    try {
      if (!/^\d{13,19}$/.test(pan)) {
        throw new Error("Invalid PAN format. Must be between 13 and 19 digits.");
      }
      if (!/^\d{2}\/\d{2}$/.test(expiryDate)) {
        throw new Error("Invalid expiry date format. Must be MM/YY.");
      }

      const panHash = this.hashPan(pan);
      if (this.enrollments.has(panHash)) {
        const existing = this.enrollments.get(panHash)!;
        if (existing.status === "ACTIVE") {
          throw new Error("Card is already enrolled and active.");
        }
        // Re-activate card if previously unenrolled
        existing.status = "ACTIVE";
        existing.expiryDate = expiryDate;
        existing.serviceCode = serviceCode;
        existing.config = config;
        existing.counter = 0;
        this.enrollments.set(panHash, existing);
      } else {
        this.enrollments.set(panHash, {
          panHash,
          maskedPan: this.maskPan(pan),
          expiryDate,
          serviceCode,
          config,
          counter: 0,
          enrolledAt: new Date(),
          status: "ACTIVE",
        });
      }

      const logId = this.logAction(
        "ENROLL",
        pan,
        true,
        `Successfully enrolled card with ${config.type} configuration.`
      );

      return { success: true, message: "Card enrolled successfully.", auditLogId: logId };
    } catch (error: any) {
      const logId = this.logAction("ENROLL", pan, false, `Enrollment failed: ${error.message}`);
      return { success: false, message: error.message, auditLogId: logId };
    }
  }

  /**
   * Unenrolls a card from Dynamic CVV2 generation.
   */
  public async unenroll(pan: string): Promise<{ success: boolean; message: string; auditLogId: string }> {
    try {
      const panHash = this.hashPan(pan);
      const enrollment = this.enrollments.get(panHash);

      if (!enrollment || enrollment.status === "UNENROLLED") {
        throw new Error("Card is not enrolled or already unenrolled.");
      }

      enrollment.status = "UNENROLLED";
      this.enrollments.set(panHash, enrollment);

      const logId = this.logAction("UNENROLLED", pan, true, "Successfully unenrolled card.");
      return { success: true, message: "Card unenrolled successfully.", auditLogId: logId };
    } catch (error: any) {
      const logId = this.logAction("UNENROLLED", pan, false, `Unenrollment failed: ${error.message}`);
      return { success: false, message: error.message, auditLogId: logId };
    }
  }

  /**
   * Inquires about the enrollment status of a card.
   */
  public async inquiry(pan: string): Promise<{
    success: boolean;
    enrolled: boolean;
    status?: CardEnrollment["status"];
    config?: Dcvv2Config;
    auditLogId: string;
  }> {
    const panHash = this.hashPan(pan);
    const enrollment = this.enrollments.get(panHash);

    if (!enrollment) {
      const logId = this.logAction("INQUIRY", pan, true, "Inquiry completed: Card not enrolled.");
      return { success: true, enrolled: false, auditLogId: logId };
    }

    const logId = this.logAction(
      "INQUIRY",
      pan,
      true,
      `Inquiry completed: Card status is ${enrollment.status}.`
    );

    return {
      success: true,
      enrolled: true,
      status: enrollment.status,
      config: enrollment.config,
      auditLogId: logId,
    };
  }

  /**
   * Performs pre-generation risk scoring using Gemini AI.
   * Analyzes transaction context and card history to detect anomalies.
   */
  public async assessRisk(
    pan: string,
    context: TransactionContext
  ): Promise<RiskAssessmentResult> {
    const maskedPan = this.maskPan(pan);
    const panHash = this.hashPan(pan);
    const cardHistory = this.auditLogs.filter((log) => log.panHash === panHash).slice(-10);

    if (!this.geminiClient) {
      return this.fallbackRiskScoring(context, cardHistory);
    }

    try {
      const model = this.geminiClient.getGenerativeModel({
        model: "gemini-2.5-flash",
        generationConfig: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              riskScore: {
                type: Type.INTEGER,
                description: "Risk score from 0 (no risk) to 100 (extreme risk).",
              },
              decision: {
                type: Type.STRING,
                enum: ["APPROVE", "CHALLENGE", "DECLINE"],
                description: "The security decision based on the risk score and context.",
              },
              reasoning: {
                type: Type.STRING,
                description: "Detailed explanation of the risk assessment.",
              },
              recommendedAction: {
                type: Type.STRING,
                description: "Recommended mitigation action.",
              },
              confidence: {
                type: Type.NUMBER,
                description: "Confidence level of the model from 0.0 to 1.0.",
              },
            },
            required: ["riskScore", "decision", "reasoning", "confidence"],
          } as Schema,
        },
      });

      const prompt = `
        You are the Visa Advanced Risk Cognitive Engine. Analyze this Dynamic CVV2 (dCVV2) generation request for potential fraud.
        
        Card Details:
        - Masked PAN: ${maskedPan}
        
        Transaction Context:
        - Amount: ${context.amount} ${context.currency}
        - Merchant: ${context.merchantName} (ID: ${context.merchantId}, MCC: ${context.merchantCategoryCode})
        - Channel: ${context.channel}
        - IP Address: ${context.ipAddress ?? "Unknown"}
        - Device Fingerprint: ${context.deviceFingerprint ?? "Unknown"}
        - Location: ${context.location ? `${context.location.city ?? "Unknown"}, ${context.location.country}` : "Unknown"}
        
        Recent Card Activity Logs:
        ${JSON.stringify(
          cardHistory.map((h) => ({
            timestamp: h.timestamp,
            action: h.action,
            success: h.success,
            riskScore: h.riskScore,
            decision: h.decision,
            details: h.details,
          })),
          null,
          2
        )}
        
        Evaluate the risk based on:
        1. Velocity: High frequency of dCVV2 generation requests.
        2. Location anomalies: Distance between transaction location and typical cardholder patterns.
        3. Merchant risk: High-risk MCCs (e.g., gaming, crypto, luxury goods).
        4. Device/IP reputation: Missing or suspicious device fingerprints.
        5. Historical failures: Previous declined generations or high-risk scores.
        
        Provide a structured JSON response matching the schema.
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      return JSON.parse(responseText) as RiskAssessmentResult;
    } catch (error: any) {
      console.error("VisaDcvv2Service: Gemini AI risk assessment failed, using fallback.", error);
      return this.fallbackRiskScoring(context, cardHistory);
    }
  }

  /**
   * Deterministic rule-based fallback risk scoring when Gemini AI is unavailable.
   */
  private fallbackRiskScoring(
    context: TransactionContext,
    cardHistory: Dcvv2AuditLog[]
  ): RiskAssessmentResult {
    let riskScore = 10; // Base risk
    const reasons: string[] = [];

    // 1. Check transaction amount
    if (context.amount > 5000) {
      riskScore += 30;
      reasons.push("High transaction amount (> 5000)");
    } else if (context.amount > 1000) {
      riskScore += 15;
      reasons.push("Moderate transaction amount (> 1000)");
    }

    // 2. Check channel risk
    if (context.channel === "E_COMMERCE") {
      riskScore += 10;
      reasons.push("E-commerce channel");
    }

    // 3. Check velocity (requests in the last 5 minutes)
    const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000);
    const recentRequests = cardHistory.filter(
      (log) => log.action === "GENERATE" && new Date(log.timestamp) > fiveMinutesAgo
    );
    if (recentRequests.length > 3) {
      riskScore += 40;
      reasons.push(`High velocity: ${recentRequests.length} requests in the last 5 minutes`);
    }

    // 4. Check device/IP presence
    if (!context.deviceFingerprint) {
      riskScore += 15;
      reasons.push("Missing device fingerprint");
    }
    if (!context.ipAddress) {
      riskScore += 10;
      reasons.push("Missing IP address");
    }

    // Cap risk score at 100
    riskScore = Math.min(riskScore, 100);

    let decision: RiskAssessmentResult["decision"] = "APPROVE";
    if (riskScore >= 75) {
      decision = "DECLINE";
    } else if (riskScore >= 40) {
      decision = "CHALLENGE";
    }

    return {
      riskScore,
      decision,
      reasoning: reasons.length > 0 ? reasons.join("; ") : "No significant risk factors detected.",
      recommendedAction: decision === "CHALLENGE" ? "Trigger 3D-Secure authentication" : undefined,
      confidence: 0.8,
    };
  }

  /**
   * Generates a Dynamic CVV2 (dCVV2) for an enrolled card.
   * Integrates Gemini AI risk scoring prior to generation.
   */
  public async generateDcvv2(
    pan: string,
    context: TransactionContext
  ): Promise<Dcvv2GenerationResult> {
    const panHash = this.hashPan(pan);
    const enrollment = this.enrollments.get(panHash);

    if (!enrollment || enrollment.status !== "ACTIVE") {
      const logId = this.logAction(
        "GENERATE",
        pan,
        false,
        "Generation failed: Card is not enrolled or inactive."
      );
      throw new Error("Card is not enrolled or inactive for dCVV2 generation.");
    }

    // 1. Assess risk using Gemini AI
    const riskAssessment = await this.assessRisk(pan, context);

    if (riskAssessment.decision === "DECLINE") {
      const logId = this.logAction(
        "GENERATE",
        pan,
        false,
        `Generation blocked by risk engine: ${riskAssessment.reasoning}`,
        riskAssessment.riskScore,
        riskAssessment.decision
      );
      throw new Error(`Transaction declined due to high security risk: ${riskAssessment.reasoning}`);
    }

    // 2. Generate the dCVV2 value securely
    let dcvv2 = "";
    let expiryTime: Date | undefined;
    let currentCounter: number | undefined;

    const config = enrollment.config;

    if (config.type === "TIME_BASED") {
      const stepSeconds = config.expirySeconds || 180;
      const epoch = Math.floor(Date.now() / 1000);
      const timeStep = Math.floor(epoch / stepSeconds);
      
      dcvv2 = this.deriveDcvv2Value(pan, enrollment.expiryDate, enrollment.serviceCode, timeStep, config.length || 3);
      expiryTime = new Date((timeStep + 1) * stepSeconds * 1000);
    } else {
      // COUNTER_BASED
      enrollment.counter += 1;
      this.enrollments.set(panHash, enrollment);
      currentCounter = enrollment.counter;
      
      dcvv2 = this.deriveDcvv2Value(pan, enrollment.expiryDate, enrollment.serviceCode, currentCounter, config.length || 3);
    }

    const logId = this.logAction(
      "GENERATE",
      pan,
      true,
      `Successfully generated ${config.type} dCVV2.`,
      riskAssessment.riskScore,
      riskAssessment.decision
    );

    return {
      dcvv2,
      expiryTime,
      counter: currentCounter,
      riskAssessment,
      auditLogId: logId,
    };
  }

  /**
   * Verifies a submitted Dynamic CVV2 value.
   */
  public async verifyDcvv2(
    pan: string,
    submittedDcvv2: string,
    context: TransactionContext
  ): Promise<{ success: boolean; message: string; auditLogId: string }> {
    try {
      const panHash = this.hashPan(pan);
      const enrollment = this.enrollments.get(panHash);

      if (!enrollment || enrollment.status !== "ACTIVE") {
        throw new Error("Card is not enrolled or inactive.");
      }

      const config = enrollment.config;
      let isValid = false;

      if (config.type === "TIME_BASED") {
        const stepSeconds = config.expirySeconds || 180;
        const epoch = Math.floor(Date.now() / 1000);
        const timeStep = Math.floor(epoch / stepSeconds);

        // Allow a window of +/- 1 time step to account for network latency/clock drift
        for (let offset = -1; offset <= 1; offset++) {
          const calculated = this.deriveDcvv2Value(
            pan,
            enrollment.expiryDate,
            enrollment.serviceCode,
            timeStep + offset,
            config.length || 3
          );
          if (calculated === submittedDcvv2) {
            isValid = true;
            break;
          }
        }
      } else {
        // COUNTER_BASED
        // In counter-based verification, we typically verify against the current counter
        // or a small look-ahead window to handle out-of-sync counters.
        const lookAhead = 5;
        for (let i = 0; i < lookAhead; i++) {
          const testCounter = enrollment.counter - i;
          if (testCounter <= 0) break;

          const calculated = this.deriveDcvv2Value(
            pan,
            enrollment.expiryDate,
            enrollment.serviceCode,
            testCounter,
            config.length || 3
          );
          if (calculated === submittedDcvv2) {
            isValid = true;
            break;
          }
        }
      }

      const logId = this.logAction(
        "VERIFY",
        pan,
        isValid,
        isValid ? "dCVV2 verification succeeded." : "dCVV2 verification failed: Value mismatch."
      );

      return {
        success: isValid,
        message: isValid ? "Verification successful." : "Invalid dCVV2 value.",
        auditLogId: logId,
      };
    } catch (error: any) {
      const logId = this.logAction("VERIFY", pan, false, `Verification failed: ${error.message}`);
      return { success: false, message: error.message, auditLogId: logId };
    }
  }

  /**
   * Cryptographically derives the dCVV2 value using HMAC-SHA256.
   * Simulates Visa's secure derivation algorithm.
   */
  private deriveDcvv2Value(
    pan: string,
    expiryDate: string,
    serviceCode: string,
    factor: number,
    length: number
  ): string {
    // Prepare the input block: PAN + Expiry + Service Code + Factor (padded)
    const factorBuffer = Buffer.alloc(8);
    factorBuffer.writeBigUInt64BE(BigInt(factor));

    const dataBlock = Buffer.concat([
      Buffer.from(pan.trim(), "utf-8"),
      Buffer.from(expiryDate.replace("/", ""), "utf-8"),
      Buffer.from(serviceCode.trim(), "utf-8"),
      factorBuffer,
    ]);

    // Derive a unique key for this card from the Master Derivation Key
    const cardKey = crypto
      .createHmac("sha256", this.masterDerivationKey)
      .update(pan)
      .digest();

    // Generate the dynamic hash
    const hash = crypto.createHmac("sha256", cardKey).update(dataBlock).digest();

    // Extract decimal digits from the hash (Decimalization)
    let digits = "";
    for (let i = 0; i < hash.length; i++) {
      const byte = hash[i];
      // Convert byte to decimal digits
      digits += byte.toString(10);
      if (digits.length >= 12) break;
    }

    // Take the required length from the derived digits
    // Ensure we don't have leading zeros if we want a strict numeric string, or pad if too short
    const cleanDigits = digits.replace(/^0+/, "");
    const finalDigits = cleanDigits.length >= length ? cleanDigits : digits;
    
    return finalDigits.slice(0, length).padStart(length, "7");
  }

  /**
   * Retrieves audit logs for a specific card (authorized personnel only).
   */
  public getAuditLogs(pan: string): Dcvv2AuditLog[] {
    const panHash = this.hashPan(pan);
    return this.auditLogs.filter((log) => log.panHash === panHash);
  }
}

export const visaDcvv2Service = new VisaDcvv2Service();