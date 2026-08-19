

// --- CONSOLIDATED FROM: ./controllers/compliance.controller.ts ---

import { Request, Response, NextFunction } from 'express';
import { GoogleGenAI, Type } from '@google/genai';

const ai = new GoogleGenAI();

// Schema definitions for structured compliance responses
const amlSchema = {
  type: Type.OBJECT,
  properties: {
    riskScore: { type: Type.NUMBER, description: 'AML risk score from 0 (lowest) to 100 (highest)' },
    riskLevel: { type: Type.STRING, description: 'LOW, MEDIUM, HIGH, or CRITICAL' },
    isFlagged: { type: Type.BOOLEAN, description: 'True if transaction triggers regulatory red flags' },
    flaggedRules: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'List of compliance rules or patterns violated',
    },
    reasoning: { type: Type.STRING, description: 'Detailed AI compliance analysis' },
    recommendedAction: { type: Type.STRING, description: 'ALLOW, FLAG_FOR_REVIEW, or BLOCK' },
  },
  required: ['riskScore', 'riskLevel', 'isFlagged', 'flaggedRules', 'reasoning', 'recommendedAction'],
};

const sarSchema = {
  type: Type.OBJECT,
  properties: {
    sarReferenceId: { type: Type.STRING, description: 'Generated unique SAR reference identifier' },
    filingUrgency: { type: Type.STRING, description: 'LOW, MEDIUM, HIGH, or IMMEDIATE_FILING' },
    suspiciousCategory: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'FinCEN / regulatory SAR categories (e.g., Structuring, Money Laundering, Fraud)',
    },
    subjectSummary: { type: Type.STRING, description: 'Summary of the subject under investigation' },
    narrative: { type: Type.STRING, description: 'Formal, audit-ready narrative statement for law enforcement/regulators' },
    recommendedFollowUp: {
      type: Type.ARRAY,
      items: { type: Type.STRING },
      description: 'Next steps for internal compliance teams',
    },
  },
  required: ['sarReferenceId', 'filingUrgency', 'suspiciousCategory', 'subjectSummary', 'narrative', 'recommendedFollowUp'],
};

const regulatoryAuditSchema = {
  type: Type.OBJECT,
  properties: {
    overallStatus: { type: Type.STRING, description: 'COMPLIANT, NON_COMPLIANT, or ACTION_REQUIRED' },
    complianceScore: { type: Type.NUMBER, description: 'Overall compliance score from 0 to 100' },
    jurisdiction: { type: Type.STRING, description: 'Jurisdiction evaluated against' },
    executiveSummary: { type: Type.STRING, description: 'High-level audit executive summary' },
    findings: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          policyReference: { type: Type.STRING },
          status: { type: Type.STRING }, // "PASSED" | "FAILED" | "PARTIAL"
          issueDescription: { type: Type.STRING },
          severity: { type: Type.STRING }, // "LOW" | "MEDIUM" | "HIGH" | "CRITICAL"
          remediationPlan: { type: Type.STRING },
        },
        required: ['policyReference', 'status', 'issueDescription', 'severity', 'remediationPlan'],
      },
    },
  },
  required: ['overallStatus', 'complianceScore', 'jurisdiction', 'executiveSummary', 'findings'],
};

const sanctionsSchema = {
  type: Type.OBJECT,
  properties: {
    matchFound: { type: Type.BOOLEAN, description: 'Indicates if potential sanction watchlist match is present' },
    confidenceScore: { type: Type.NUMBER, description: 'Match confidence percentage (0 to 100)' },
    potentialMatches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          matchedName: { type: Type.STRING },
          program: { type: Type.STRING }, // e.g., OFAC, EU Sanctions, UN Security Council
          similarityReason: { type: Type.STRING },
        },
        required: ['matchedName', 'program', 'similarityReason'],
      },
    },
    falsePositiveProbability: { type: Type.NUMBER, description: 'Probability that match is a false positive (0 to 100)' },
    decision: { type: Type.STRING, description: 'CLEAR, MANUAL_REVIEW, or REJECT' },
    analysis: { type: Type.STRING, description: 'Detailed sanctions screening rationale' },
  },
  required: ['matchFound', 'confidenceScore', 'potentialMatches', 'falsePositiveProbability', 'decision', 'analysis'],
};

const kycSchema = {
  type: Type.OBJECT,
  properties: {
    isValid: { type: Type.BOOLEAN },
    verificationStatus: { type: Type.STRING }, // "VERIFIED" | "REJECTED" | "MANUAL_REVIEW"
    confidenceScore: { type: Type.NUMBER },
    dataMismatches: {
      type: Type.ARRAY,
      items: {
        type: Type.OBJECT,
        properties: {
          field: { type: Type.STRING },
          expected: { type: Type.STRING },
          extracted: { type: Type.STRING },
        },
        required: ['field', 'expected', 'extracted'],
      },
    },
    tamperingDetected: { type: Type.BOOLEAN },
    suspiciousIndicators: { type: Type.ARRAY, items: { type: Type.STRING } },
    summary: { type: Type.STRING },
  },
  required: ['isValid', 'verificationStatus', 'confidenceScore', 'dataMismatches', 'tamperingDetected', 'suspiciousIndicators', 'summary'],
};

/**
 * Controller class for compliance endpoints leveraging Gemini API for real-time compliance evaluation.
 */
export class ComplianceController {
  /**
   * Real-time Anti-Money Laundering (AML) Transaction Risk Evaluation
   * Endpoint: POST /api/compliance/aml-check
   */
  public static async checkAML(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { transactionId, amount, currency, sender, receiver, location, historicalPatterns, note } = req.body;

      if (!transactionId || !amount || !sender || !receiver) {
        res.status(400).json({ error: 'Missing required transaction fields for AML check.' });
        return;
      }

      const prompt = `
        You are a top-tier Anti-Money Laundering (AML) risk engine. Perform a rigorous AML compliance check on the following transaction:
        
        Transaction ID: ${transactionId}
        Amount: ${amount} ${currency || 'USD'}
        Sender Details: ${JSON.stringify(sender)}
        Receiver Details: ${JSON.stringify(receiver)}
        Location: ${location || 'Unknown'}
        Historical Patterns / Velocity: ${JSON.stringify(historicalPatterns || {})}
        Transaction Note/Memo: ${note || 'N/A'}

        Evaluate for red flags including structuring, rapid movement of funds, high-risk jurisdiction exposure, unusual velocity, and PEP/sanctions implications.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: amlSchema,
          systemInstruction: 'Evaluate compliance with standard global AML directives (e.g., FATF guidelines, BSA regulations). Provide precise assessments.',
        },
      });

      const analysis = JSON.parse(response.text || '{}');
      res.status(200).json({
        success: true,
        transactionId,
        timestamp: new Date().toISOString(),
        amlResult: analysis,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Suspicious Activity Report (SAR) Generation
   * Endpoint: POST /api/compliance/sar
   */
  public static async generateSAR(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { subjectInfo, incidentDescription, transactionHistory, detectedAnomalies, investigatorNotes } = req.body;

      if (!subjectInfo || !incidentDescription) {
        res.status(400).json({ error: 'Subject info and incident description are required to generate a SAR.' });
        return;
      }

      const prompt = `
        Generate a formal, compliant Suspicious Activity Report (SAR) narrative based on the following case data:

        Subject Information:
        ${JSON.stringify(subjectInfo, null, 2)}

        Incident Description:
        ${incidentDescription}

        Transaction History:
        ${JSON.stringify(transactionHistory || [], null, 2)}

        Detected Anomalies:
        ${JSON.stringify(detectedAnomalies || [], null, 2)}

        Investigator Notes:
        ${investigatorNotes || 'None'}

        Ensure the narrative follows financial intelligence unit (FIU) / FinCEN guidelines: Explain WHO, WHAT, WHEN, WHERE, WHY, and HOW.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: sarSchema,
          systemInstruction: 'You are an expert Financial Crime Specialist producing official regulatory filings.',
        },
      });

      const sarReport = JSON.parse(response.text || '{}');
      res.status(201).json({
        success: true,
        generatedAt: new Date().toISOString(),
        sarReport,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Automated Regulatory Audit & Policy Comparison
   * Endpoint: POST /api/compliance/audit
   */
  public static async runRegulatoryAudit(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { jurisdiction, policyDocument, executionLogs, systemConfigurations } = req.body;

      if (!jurisdiction || !policyDocument || !executionLogs) {
        res.status(400).json({ error: 'Jurisdiction, policyDocument, and executionLogs are required.' });
        return;
      }

      const prompt = `
        Conduct an automated regulatory compliance audit.
        Target Jurisdiction: ${jurisdiction}
        
        Regulatory / Internal Policy Text:
        """
        ${policyDocument}
        """

        System Execution Logs:
        """
        ${JSON.stringify(executionLogs)}
        """

        System Configurations:
        """
        ${JSON.stringify(systemConfigurations || {})}
        """

        Evaluate full compliance of the system logs against the stated policy documents and jurisdiction requirements. Highlight failures, partial compliances, and remediation strategies.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: regulatoryAuditSchema,
        },
      });

      const auditResult = JSON.parse(response.text || '{}');
      res.status(200).json({
        success: true,
        auditTimestamp: new Date().toISOString(),
        auditResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Sanctions & Watchlist Screening AI Engine
   * Endpoint: POST /api/compliance/sanctions-screening
   */
  public static async screenSanctions(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { entityName, entityType, dateOfBirthOrInc, country, address, targetWatchlists } = req.body;

      if (!entityName) {
        res.status(400).json({ error: 'entityName is required for sanctions screening.' });
        return;
      }

      const prompt = `
        Perform a comprehensive sanctions, PEP (Politically Exposed Persons), and adverse media screening analysis.

        Entity Name: ${entityName}
        Entity Type: ${entityType || 'INDIVIDUAL'}
        DOB / Date of Incorporation: ${dateOfBirthOrInc || 'N/A'}
        Country / Region: ${country || 'N/A'}
        Address: ${address || 'N/A'}
        Watchlists to evaluate against: ${JSON.stringify(targetWatchlists || ['OFAC', 'EU', 'UN', 'UK_HMT'])}

        Consider phonetics, transliteration variations, alias matches, fuzzy matching, and common false-positive scenarios.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: sanctionsSchema,
        },
      });

      const screeningResult = JSON.parse(response.text || '{}');
      res.status(200).json({
        success: true,
        entityName,
        screenedAt: new Date().toISOString(),
        screeningResult,
      });
    } catch (error) {
      next(error);
    }
  }

  /**
   * KYC Verification & Document Authenticity Check
   * Endpoint: POST /api/compliance/verify-kyc
   */
  public static async verifyKYCDocuments(req: Request, res: Response, next: NextFunction): Promise<void> {
    try {
      const { documentType, extractedDocumentText, expectedUserData, documentMetadata } = req.body;

      if (!documentType || !extractedDocumentText || !expectedUserData) {
        res.status(400).json({ error: 'documentType, extractedDocumentText, and expectedUserData are required.' });
        return;
      }

      const prompt = `
        Perform automated KYC (Know Your Customer) verification and document authenticity verification.

        Document Type: ${documentType}
        Document OCR Text:
        """
        ${extractedDocumentText}
        """

        Expected User Data (System Profile):
        ${JSON.stringify(expectedUserData, null, 2)}

        Document Metadata:
        ${JSON.stringify(documentMetadata || {}, null, 2)}

        Verify if the extracted text matches the expected profile. Detect potential indicators of forgery, inconsistent formatting, date discrepancies, or missing mandatory security fields.
      `;

      const response = await ai.models.generateContent({
        model: 'gemini-2.5-flash',
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: kycSchema,
        },
      });

      const kycResult = JSON.parse(response.text || '{}');
      res.status(200).json({
        success: true,
        verifiedAt: new Date().toISOString(),
        kycResult,
      });
    } catch (error) {
      next(error);
    }
  }
}

export const checkAML = ComplianceController.checkAML;
export const generateSAR = ComplianceController.generateSAR;
export const runRegulatoryAudit = ComplianceController.runRegulatoryAudit;
export const screenSanctions = ComplianceController.screenSanctions;
export const verifyKYCDocuments = ComplianceController.verifyKYCDocuments;