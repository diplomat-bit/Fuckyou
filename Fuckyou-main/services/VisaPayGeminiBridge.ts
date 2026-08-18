import { GoogleGenerativeAI, Schema, Type } from "@google/generative-ai";

/**
 * Metadata captured during a Visa Pay card enrollment request.
 */
export interface VisaEnrollmentMetadata {
  cardholderName: string;
  panBin: string; // First 6-8 digits of PAN
  last4: string;
  deviceId: string;
  deviceIp: string;
  deviceLocation: {
    latitude: number;
    longitude: number;
    countryCode: string;
    postalCode: string;
  };
  deviceName: string;
  deviceOs: string;
  walletProvider: "APPLE_PAY" | "GOOGLE_PAY" | "SAMSUNG_PAY" | "PROPRIETARY_WALLET";
  riskScore: number; // Issuer or wallet provider risk score (0-100)
  accountAgeDays: number;
  emailAddress: string;
  phoneNumber: string;
}

/**
 * Risk profile of a provisioned Visa Token.
 */
export interface VisaTokenRiskProfile {
  tokenId: string;
  tokenReferenceId: string;
  tokenAssuranceLevel: number; // EMVCo Token Assurance Level (1-99)
  deviceBindingStatus: "BOUND" | "UNBOUND" | "SUSPENDED";
  cryptogramType: "TAVV" | "DTVV" | "EMV";
  activeTokensCount: number; // Number of active tokens for this PAN
  lastTokenActivityTime: string; // ISO 8601 timestamp
  riskAssessmentScore: number; // Visa Risk Manager score (0-99)
  velocity24h: number; // Number of transactions in the last 24 hours
  cumulativeAmount24h: number; // Total transaction volume in the last 24 hours
}

/**
 * ISO 8583 standard fields used for transaction authorization callbacks.
 */
export interface Iso8583Fields {
  mti: "0100" | "0110" | "0120" | "0200" | "0210"; // Message Type Identifier
  processingCode: string; // Field 3
  transactionAmount: number; // Field 4 (in minor units, e.g., cents)
  transmissionDateTime: string; // Field 7 (MMDDhhmmss)
  systemTraceAuditNumber: string; // Field 11 (STAN)
  localTransactionTime: string; // Field 12 (hhmmss)
  localTransactionDate: string; // Field 13 (MMDD)
  expirationDate?: string; // Field 14 (YYMM)
  posEntryMode: string; // Field 22 (Point of Service Entry Mode)
  posConditionCode: string; // Field 25
  acquiringInstitutionId: string; // Field 32
  retrievalReferenceNumber: string; // Field 37 (RRN)
  authorizationLifeCycleCode?: string; // Field 39 (Response Code)
  cardAcceptorId: string; // Field 41 (Terminal ID)
  cardAcceptorNameLocation: string; // Field 43 (Merchant Name and Location)
  merchantCategoryCode: string; // Field 18 (MCC)
  currencyCode: string; // Field 49 (ISO 4217 numeric code)
  tokenData?: {
    tokenRequestorId?: string;
    paymentTokenSource?: string;
  };
}

/**
 * Structured response for Visa Pay Enrollment Analysis.
 */
export interface EnrollmentAnalysisResult {
  approved: boolean;
  confidenceScore: number; // 0.0 to 1.0
  riskFactors: string[];
  recommendedVerificationMethod: "NONE" | "SMS_OTP" | "EMAIL_OTP" | "APP_PUSH" | "KBA" | "DECLINE";
  detailedAnalysis: string;
}

/**
 * Structured response for Token Risk Evaluation.
 */
export interface TokenRiskEvaluationResult {
  riskLevel: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  assuranceScore: number; // 0 to 100
  actionRequired: "ALLOW" | "SUSPEND" | "REVOKE" | "STEP_UP";
  mitigationSteps: string[];
  justification: string;
}

/**
 * Structured response for ISO 8583 Authorization Prediction.
 */
export interface AuthPredictionResult {
  predictedAction: "APPROVE" | "DECLINE" | "REFER_TO_ISSUER" | "CAPTURE";
  responseCode: string; // ISO 8583 Response Code (e.g., "00", "05", "51")
  probabilityOfFraud: number; // 0.0 to 1.0
  declineReason: string;
  anomalyScore: number; // 0.0 to 1.0
  analysisSummary: string;
}

/**
 * Structured response for Token Replenishment and Fraud Prevention Recommendations.
 */
export interface ReplenishmentAndFraudRecommendations {
  replenishmentStrategy: {
    shouldReplenish: boolean;
    replenishAmount: number;
    triggerThreshold: number;
    rationale: string;
  };
  fraudPreventionRules: Array<{
    ruleName: string;
    description: string;
    severity: "LOW" | "MEDIUM" | "HIGH";
    action: "BLOCK" | "FLAG" | "CHALLENGE";
  }>;
  executiveSummary: string;
}

export class VisaPayGeminiBridge {
  private ai: GoogleGenerativeAI;
  private modelName: string;

  /**
   * Initializes the Visa Pay Gemini Bridge.
   * @param apiKey Google Gemini API Key. If not provided, falls back to process.env.GEMINI_API_KEY.
   * @param modelName The Gemini model to use. Defaults to "gemini-2.5-flash".
   */
  constructor(apiKey?: string, modelName: string = "gemini-2.5-flash") {
    const key = apiKey || process.env.GEMINI_API_KEY;
    if (!key) {
      throw new Error("Gemini API Key is required to initialize VisaPayGeminiBridge.");
    }
    this.ai = new GoogleGenerativeAI(key);
    this.modelName = modelName;
  }

  /**
   * Analyzes card enrollment metadata to determine risk and recommend step-up authentication.
   */
  public async analyzeEnrollmentMetadata(
    metadata: VisaEnrollmentMetadata
  ): Promise<EnrollmentAnalysisResult> {
    const model = this.ai.getGenerativeModel({ model: this.modelName });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        approved: {
          type: Type.BOOLEAN,
          description: "Whether the enrollment should be approved based on risk analysis.",
        },
        confidenceScore: {
          type: Type.NUMBER,
          description: "Confidence score of the decision between 0.0 and 1.0.",
        },
        riskFactors: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "List of identified risk factors.",
        },
        recommendedVerificationMethod: {
          type: Type.STRING,
          description: "Recommended step-up authentication method.",
          enum: ["NONE", "SMS_OTP", "EMAIL_OTP", "APP_PUSH", "KBA", "DECLINE"],
        },
        detailedAnalysis: {
          type: Type.STRING,
          description: "Detailed natural language analysis of the enrollment metadata.",
        },
      },
      required: ["approved", "confidenceScore", "riskFactors", "recommendedVerificationMethod", "detailedAnalysis"],
    };

    const prompt = `
      You are an expert Visa Token Service (VTS) risk engine. Analyze the following card enrollment metadata for potential fraud, device binding anomalies, and location mismatches.
      
      Enrollment Metadata:
      ${JSON.stringify(metadata, null, 2)}
      
      Evaluate:
      1. Location consistency (IP address country vs. device location country vs. typical cardholder profile).
      2. Device reputation and OS age.
      3. Wallet provider risk indicators.
      4. Account age and velocity indicators.
      
      Provide a structured risk assessment.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as EnrollmentAnalysisResult;
  }

  /**
   * Evaluates the risk profile of an active Visa Token.
   */
  public async evaluateTokenRiskProfile(
    profile: VisaTokenRiskProfile
  ): Promise<TokenRiskEvaluationResult> {
    const model = this.ai.getGenerativeModel({ model: this.modelName });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        riskLevel: {
          type: Type.STRING,
          description: "Risk level of the token.",
          enum: ["LOW", "MEDIUM", "HIGH", "CRITICAL"],
        },
        assuranceScore: {
          type: Type.NUMBER,
          description: "Calculated token assurance score from 0 to 100.",
        },
        actionRequired: {
          type: Type.STRING,
          description: "Action to take on the token.",
          enum: ["ALLOW", "SUSPEND", "REVOKE", "STEP_UP"],
        },
        mitigationSteps: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: "Steps to mitigate identified token risks.",
        },
        justification: {
          type: Type.STRING,
          description: "Justification for the risk level and action.",
        },
      },
      required: ["riskLevel", "assuranceScore", "actionRequired", "mitigationSteps", "justification"],
    };

    const prompt = `
      You are a Visa Risk Manager (VRM) AI coprocessor. Evaluate the risk profile of this active Visa Token.
      
      Token Risk Profile:
      ${JSON.stringify(profile, null, 2)}
      
      Evaluate:
      1. Token Assurance Level (TAL) relative to EMVCo standards.
      2. Cryptogram validation type and strength.
      3. Velocity and cumulative transaction amounts in the last 24 hours.
      4. Device binding status and potential token hijacking indicators.
      
      Provide a structured risk evaluation.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as TokenRiskEvaluationResult;
  }

  /**
   * Predicts the outcome of an authorization callback based on ISO 8583 fields.
   */
  public async predictAuthorizationOutcome(
    fields: Iso8583Fields
  ): Promise<AuthPredictionResult> {
    const model = this.ai.getGenerativeModel({ model: this.modelName });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        predictedAction: {
          type: Type.STRING,
          description: "Predicted outcome of the authorization.",
          enum: ["APPROVE", "DECLINE", "REFER_TO_ISSUER", "CAPTURE"],
        },
        responseCode: {
          type: Type.STRING,
          description: "Predicted ISO 8583 Response Code (Field 39).",
        },
        probabilityOfFraud: {
          type: Type.NUMBER,
          description: "Estimated probability of fraud from 0.0 to 1.0.",
        },
        declineReason: {
          type: Type.STRING,
          description: "Reason for decline if predicted outcome is not APPROVE.",
        },
        anomalyScore: {
          type: Type.NUMBER,
          description: "Anomaly score of the transaction fields from 0.0 to 1.0.",
        },
        analysisSummary: {
          type: Type.STRING,
          description: "Natural language summary of the prediction.",
        },
      },
      required: ["predictedAction", "responseCode", "probabilityOfFraud", "declineReason", "anomalyScore", "analysisSummary"],
    };

    const prompt = `
      You are an advanced Visa Net authorization simulator. Predict the outcome of this transaction based on the ISO 8583 fields.
      
      ISO 8583 Fields:
      ${JSON.stringify(fields, null, 2)}
      
      Evaluate:
      1. Point of Service (POS) Entry Mode (Field 22) security implications (e.g., fallback to magstripe, contactless tokenized, chip read).
      2. Merchant Category Code (MCC) risk profile.
      3. Transaction amount anomalies.
      4. Time and location consistency of the merchant.
      
      Provide a structured prediction.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.1,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as AuthPredictionResult;
  }

  /**
   * Generates natural language recommendations for token replenishment and fraud prevention rules.
   */
  public async generateReplenishmentAndFraudRecommendations(
    metadata: VisaEnrollmentMetadata,
    riskProfile: VisaTokenRiskProfile,
    recentAuths: Iso8583Fields[]
  ): Promise<ReplenishmentAndFraudRecommendations> {
    const model = this.ai.getGenerativeModel({ model: this.modelName });

    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        replenishmentStrategy: {
          type: Type.OBJECT,
          properties: {
            shouldReplenish: {
              type: Type.BOOLEAN,
              description: "Whether token replenishment is recommended.",
            },
            replenishAmount: {
              type: Type.NUMBER,
              description: "Recommended replenishment amount/limit.",
            },
            triggerThreshold: {
              type: Type.NUMBER,
              description: "Threshold level to trigger next replenishment.",
            },
            rationale: {
              type: Type.STRING,
              description: "Rationale for the replenishment strategy.",
            },
          },
          required: ["shouldReplenish", "replenishAmount", "triggerThreshold", "rationale"],
        },
        fraudPreventionRules: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              ruleName: { type: Type.STRING },
              description: { type: Type.STRING },
              severity: {
                type: Type.STRING,
                enum: ["LOW", "MEDIUM", "HIGH"],
              },
              action: {
                type: Type.STRING,
                enum: ["BLOCK", "FLAG", "CHALLENGE"],
              },
            },
            required: ["ruleName", "description", "severity", "action"],
          },
          description: "Recommended fraud prevention rules to deploy.",
        },
        executiveSummary: {
          type: Type.STRING,
          description: "High-level executive summary of recommendations.",
        },
      },
      required: ["replenishmentStrategy", "fraudPreventionRules", "executiveSummary"],
    };

    const prompt = `
      You are a principal payment systems architect and fraud strategist at Visa. Generate token replenishment strategies and fraud prevention rules based on the combined context of enrollment, token risk, and recent transaction history.
      
      Enrollment Metadata:
      ${JSON.stringify(metadata, null, 2)}
      
      Token Risk Profile:
      ${JSON.stringify(riskProfile, null, 2)}
      
      Recent Transactions (ISO 8583):
      ${JSON.stringify(recentAuths, null, 2)}
      
      Formulate:
      1. A token replenishment strategy (e.g., when to refresh single-use keys or update token limits based on velocity).
      2. Dynamic fraud prevention rules tailored to the anomalies detected in this dataset.
      3. An executive summary explaining the security posture.
      
      Provide a structured recommendation.
    `;

    const result = await model.generateContent({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: schema,
        temperature: 0.2,
      },
    });

    const responseText = result.response.text();
    return JSON.parse(responseText) as ReplenishmentAndFraudRecommendations;
  }
}