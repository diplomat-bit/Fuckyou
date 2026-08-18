import { GoogleGenAI, Type, Schema } from '@google/genai';

export interface Transaction {
  id: string;
  userId: string;
  amount: number;
  currency: string;
  timestamp: string;
  location?: {
    country: string;
    city?: string;
    ipAddress?: string;
  };
  counterparty?: {
    id: string;
    name: string;
    accountNumber?: string;
    bankCode?: string;
    country?: string;
  };
  paymentMethod: string;
  metadata?: Record<string, any>;
}

export interface FraudMonitoringResult {
  transactionId: string;
  riskScore: number; // 0 to 100
  isFlagged: boolean;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  detectedAnomalies: string[];
  recommendedAction: 'APPROVE' | 'REVIEW' | 'BLOCK';
  reasoning: string;
}

export interface AMLCheckRequest {
  userId: string;
  fullName: string;
  dateOfBirth?: string;
  nationality?: string;
  residenceCountry?: string;
  isPEP?: boolean; // Politically Exposed Person
  onSanctionList?: boolean;
  recentTransactions: Transaction[];
  accountAgeDays?: number;
  totalVolume30Days?: number;
}

export interface AMLCheckResult {
  userId: string;
  overallRiskScore: number; // 0 to 100
  riskCategory: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  sanctionsRisk: string;
  pepRisk: string;
  velocityRisk: string;
  structuringRisk: string; // Smurfing/Structuring detection
  flags: string[];
  summary: string;
  actionRequired: string;
}

export interface RegulatoryReportRequest {
  reportType: 'SAR' | 'CTR' | 'AML_SUMMARY' | 'AUDIT_LOG';
  entityId: string;
  timePeriod: {
    start: string;
    end: string;
  };
  relatedTransactions?: Transaction[];
  userProfile?: Record<string, any>;
  flaggedIncidents?: Record<string, any>[];
  jurisdiction?: string;
}

export interface RegulatoryReport {
  reportId: string;
  reportType: string;
  generatedAt: string;
  jurisdiction: string;
  summary: string;
  narrative: string;
  recommendedFiling: boolean;
  regulatoryCitation: string;
  keyFindings: string[];
}

export class ComplianceService {
  private ai: GoogleGenAI;
  private readonly flashModel = 'gemini-2.5-flash';
  private readonly proModel = 'gemini-2.5-pro';

  constructor() {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) {
      throw new Error('GEMINI_API_KEY environment variable is required');
    }
    this.ai = new GoogleGenAI({ apiKey });
  }

  /**
   * Real-time monitoring of a transaction for fraud and suspicious activity.
   * Uses fast gemini-2.5-flash for minimal latency in payment pipelines.
   */
  async monitorTransaction(transaction: Transaction): Promise<FraudMonitoringResult> {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        transactionId: { type: Type.STRING },
        riskScore: { type: Type.NUMBER, description: 'Risk score from 0 (safe) to 100 (extreme risk)' },
        isFlagged: { type: Type.BOOLEAN },
        riskLevel: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        detectedAnomalies: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
          description: 'List of specific anomalous behaviors detected',
        },
        recommendedAction: { type: Type.STRING, enum: ['APPROVE', 'REVIEW', 'BLOCK'] },
        reasoning: { type: Type.STRING, description: 'Detailed justification for the risk evaluation' },
      },
      required: [
        'transactionId',
        'riskScore',
        'isFlagged',
        'riskLevel',
        'detectedAnomalies',
        'recommendedAction',
        'reasoning',
      ],
    };

    const prompt = `
Analyze the following financial transaction in real-time for potential fraud, unauthorized activity, or velocity anomalies.

Transaction Data:
${JSON.stringify(transaction, null, 2)}

Assess risk parameters including location jumps, counterparty risk, unusual payment methods, and amount thresholds.
Return a structured fraud assessment.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.flashModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.1, // Low temperature for consistent risk assessment
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini model');
      }

      return JSON.parse(text) as FraudMonitoringResult;
    } catch (error) {
      console.error('Error during transaction monitoring:', error);
      // Fallback response in case of API exception to prevent system halt
      return {
        transactionId: transaction.id,
        riskScore: 50,
        isFlagged: true,
        riskLevel: 'MEDIUM',
        detectedAnomalies: ['COMPLIANCE_SERVICE_ERROR_FALLBACK'],
        recommendedAction: 'REVIEW',
        reasoning: 'System error occurred during automated risk analysis. Escalating to manual review.',
      };
    }
  }

  /**
   * Deep Anti-Money Laundering (AML) check on a user profile and transaction history.
   * Leverages gemini-2.5-pro for high-reasoning pattern detection (e.g., structuring, rapid movement of funds).
   */
  async performAMLCheck(amlData: AMLCheckRequest): Promise<AMLCheckResult> {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        userId: { type: Type.STRING },
        overallRiskScore: { type: Type.NUMBER },
        riskCategory: { type: Type.STRING, enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'] },
        sanctionsRisk: { type: Type.STRING },
        pepRisk: { type: Type.STRING },
        velocityRisk: { type: Type.STRING },
        structuringRisk: { type: Type.STRING },
        flags: { type: Type.ARRAY, items: { type: Type.STRING } },
        summary: { type: Type.STRING },
        actionRequired: { type: Type.STRING },
      },
      required: [
        'userId',
        'overallRiskScore',
        'riskCategory',
        'sanctionsRisk',
        'pepRisk',
        'velocityRisk',
        'structuringRisk',
        'flags',
        'summary',
        'actionRequired',
      ],
    };

    const prompt = `
Perform a comprehensive Anti-Money Laundering (AML) and Counter-Financing of Terrorism (CFT) analysis for the following user profile and financial history.

Subject Profile & History:
${JSON.stringify(amlData, null, 2)}

Analyze specifically for:
1. Structuring / Smurfing (splitting deposits to avoid detection limits)
2. Rapid movement of funds (pass-through account behavior)
3. High-risk geographic connections
4. Politically Exposed Person (PEP) or sanction match implications
5. Disproportionate transaction velocity vs account age

Provide a detailed evaluation adhering to international BSA/AML regulatory frameworks.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.proModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.2,
          systemInstruction:
            'You are an expert Certified Anti-Money Laundering Specialist (CAMS) auditing financial accounts for regulatory risk.',
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini model');
      }

      return JSON.parse(text) as AMLCheckResult;
    } catch (error) {
      console.error('Error during AML check:', error);
      throw error;
    }
  }

  /**
   * Generates official regulatory reports like Suspicious Activity Reports (SAR) or Currency Transaction Reports (CTR).
   * Uses gemini-2.5-pro to draft comprehensive legal narratives for financial intelligence units (e.g., FinCEN, FCA).
   */
  async generateRegulatoryReport(request: RegulatoryReportRequest): Promise<RegulatoryReport> {
    const schema: Schema = {
      type: Type.OBJECT,
      properties: {
        reportId: { type: Type.STRING },
        reportType: { type: Type.STRING },
        generatedAt: { type: Type.STRING },
        jurisdiction: { type: Type.STRING },
        summary: { type: Type.STRING },
        narrative: {
          type: Type.STRING,
          description: 'Formal regulatory filing narrative detailing who, what, where, when, why, and how',
        },
        recommendedFiling: { type: Type.BOOLEAN },
        regulatoryCitation: { type: Type.STRING, description: 'Applicable law/regulation clauses (e.g., 31 CFR 1020.320)' },
        keyFindings: { type: Type.ARRAY, items: { type: Type.STRING } },
      },
      required: [
        'reportId',
        'reportType',
        'generatedAt',
        'jurisdiction',
        'summary',
        'narrative',
        'recommendedFiling',
        'regulatoryCitation',
        'keyFindings',
      ],
    };

    const prompt = `
Generate an official Regulatory Compliance Report (${request.reportType}) suitable for filing with regulatory bodies (such as FinCEN, FCA, or equivalent financial intelligence units).

Jurisdiction: ${request.jurisdiction || 'US / FinCEN'}
Report Details Request:
${JSON.stringify(request, null, 2)}

Requirements for the narrative:
- Clear timeline of events.
- Method of operation used by the involved entity.
- Explanation of why the activity is deemed suspicious or reportable under local statutes.
- Formal, objective regulatory compliance language.
`;

    try {
      const response = await this.ai.models.generateContent({
        model: this.proModel,
        contents: prompt,
        config: {
          responseMimeType: 'application/json',
          responseSchema: schema,
          temperature: 0.1,
          systemInstruction:
            'You are a Lead Financial Crime Regulatory Reporting Officer generating legally defensible SAR/CTR filings.',
        },
      });

      const text = response.text;
      if (!text) {
        throw new Error('Empty response received from Gemini model');
      }

      return JSON.parse(text) as RegulatoryReport;
    } catch (error) {
      console.error('Error generating regulatory report:', error);
      throw error;
    }
  }

  /**
   * High-throughput batch transaction monitoring helper.
   */
  async batchAnalyzeTransactions(transactions: Transaction[]): Promise<FraudMonitoringResult[]> {
    const results = await Promise.all(
      transactions.map((transaction) => this.monitorTransaction(transaction))
    );
    return results;
  }
}