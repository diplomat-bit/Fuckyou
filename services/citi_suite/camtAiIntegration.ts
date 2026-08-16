import { GoogleGenAI, Type, Schema } from '@google/genai';

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CamtAmount {
  currency: string;
  value: number;
}

export interface CamtParty {
  name?: string;
  iban?: string;
  bic?: string;
  id?: string;
}

export interface CamtTransaction {
  entryReference?: string;
  endToEndId?: string;
  instructionId?: string;
  mandateId?: string;
  chequeNumber?: string;
  amount: CamtAmount;
  creditDebitIndicator: 'CRDT' | 'DBIT';
  bookingDate?: string;
  valueDate?: string;
  debtor?: CamtParty;
  creditor?: CamtParty;
  remittanceInformation?: string;
  proprietaryCode?: string;
  bankTransactionCode?: string;
  additionalTransactionInfo?: string;
}

export interface CamtBalance {
  type: 'OPBD' | 'CLBD' | 'PRCD' | 'ITBD' | string;
  amount: CamtAmount;
  creditDebitIndicator: 'CRDT' | 'DBIT';
  date: string;
}

export interface CamtStatement {
  id: string;
  sequenceNumber?: string;
  creationDateTime?: string;
  accountIban?: string;
  accountCurrency?: string;
  balances?: CamtBalance[];
  transactions: CamtTransaction[];
}

export interface CamtParsedData {
  groupHeader?: {
    messageId: string;
    creationDateTime: string;
    numberOfItems?: number;
    totalAmount?: number;
  };
  statements: CamtStatement[];
}

export interface InternalLedgerEntry {
  id: string;
  documentNumber?: string;
  entityName: string;
  amount: number;
  currency: string;
  type: 'INVOICE' | 'PAYMENT' | 'CREDIT_NOTE' | 'EXPENSE' | 'OTHER';
  dueDate?: string;
  issueDate?: string;
  referenceNumber?: string;
  status?: string;
}

export interface ReconciliationMatch {
  camtTransactionId: string;
  ledgerEntryId: string | null;
  confidenceScore: number; // 0.0 to 1.0
  matchStatus: 'EXACT_MATCH' | 'PARTIAL_MATCH' | 'UNMATCHED' | 'DISCREPANCY';
  amountDifference: number;
  explanation: string;
  suggestedAction: 'AUTO_POST' | 'MANUAL_REVIEW' | 'INVESTIGATE_FEE' | 'CREATE_ADJUSTMENT' | 'IGNORE';
}

export interface ReconciliationReport {
  summary: {
    totalCamtTransactions: number;
    matchedCount: number;
    unmatchedCount: number;
    discrepancyCount: number;
    totalMatchedAmount: number;
    totalUnmatchedAmount: number;
  };
  matches: ReconciliationMatch[];
  reconciliationNotes: string;
}

export interface AnomalyItem {
  transactionId: string;
  riskLevel: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  anomalyType: 
    | 'DUPLICATE_PAYMENT'
    | 'UNUSUAL_AMOUNT'
    | 'UNKNOWN_COUNTERPARTY'
    | 'SUSPICIOUS_REMITTANCE'
    | 'TIMING_IRREGULARITY'
    | 'CURRENCY_MISMATCH'
    | 'STRUCTURAL_FORMAT_ERROR';
  description: string;
  detectedPattern: string;
  recommendedMitigation: string;
}

export interface AnomalyDetectionReport {
  overallRiskScore: number; // 0.0 to 10.0
  totalAnomaliesDetected: number;
  anomalies: AnomalyItem[];
  riskSummary: string;
}

export interface CategorizedTransaction {
  transactionId: string;
  category: string;
  subCategory?: string;
  accountingCode?: string;
  taxCode?: string;
  confidence: number;
  rationale: string;
}

export interface CategorizationReport {
  categorizedTransactions: CategorizedTransaction[];
  categoryBreakdown: Record<string, { totalAmount: number; count: number }>;
}

export interface CamtExecutiveInsights {
  cashFlowSummary: string;
  topDebtors: Array<{ name: string; totalReceived: number }>;
  topCreditors: Array<{ name: string; totalPaid: number }>;
  liquidityAssessment: string;
  keyActionItems: string[];
}

export interface CamtAiBridgeOptions {
  apiKey?: string;
  modelName?: string;
  temperature?: number;
  customInstructions?: string;
}

// ============================================================================
// Primary Bridge Class
// ============================================================================

export class CamtAiBridge {
  private ai: GoogleGenAI;
  private defaultModel: string;

  constructor(options: CamtAiBridgeOptions = {}) {
    const apiKey = options.apiKey || process.env.GEMINI_API_KEY || '';
    if (!apiKey) {
      console.warn('CamtAiBridge initialized without an explicit API key. System will rely on default client environment configuration.');
    }
    this.ai = new GoogleGenAI({ apiKey });
    this.defaultModel = options.modelName || 'gemini-2.5-flash';
  }

  /**
   * Performs automated intelligent reconciliation between parsed CAMT bank statements
   * and internal ledger items (invoices, open items, payments).
   */
  public async reconcile(
    camtData: CamtParsedData,
    ledgerEntries: InternalLedgerEntry[],
    options: { temperature?: number; customInstructions?: string } = {}
  ): Promise<ReconciliationReport> {
    const systemInstruction = `
You are an expert financial controller and automated bank reconciliation engine.
Your goal is to accurately match bank statement entries (CAMT standard) against internal ledger records (invoices/payments).
Account for potential wire transfer fees, slight exchange rate variations, fuzzy name matches, and payment reference truncations.
Output ONLY structured JSON matching the supplied response schema.
    `.trim();

    const prompt = `
Reconcile the following CAMT statement data with the provided internal ledger entries.

### Parsed CAMT Transactions:
${JSON.stringify(this.sanitizeCamtForPrompt(camtData), null, 2)}

### Internal Ledger Entries:
${JSON.stringify(ledgerEntries, null, 2)}

${options.customInstructions ? `Additional Instructions:\n${options.customInstructions}` : ''}
`;

    const reconciliationSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        summary: {
          type: Type.OBJECT,
          properties: {
            totalCamtTransactions: { type: Type.INTEGER },
            matchedCount: { type: Type.INTEGER },
            unmatchedCount: { type: Type.INTEGER },
            discrepancyCount: { type: Type.INTEGER },
            totalMatchedAmount: { type: Type.NUMBER },
            totalUnmatchedAmount: { type: Type.NUMBER },
          },
          required: [
            'totalCamtTransactions',
            'matchedCount',
            'unmatchedCount',
            'discrepancyCount',
            'totalMatchedAmount',
            'totalUnmatchedAmount',
          ],
        },
        matches: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              camtTransactionId: { type: Type.STRING },
              ledgerEntryId: { type: Type.STRING, nullable: true },
              confidenceScore: { type: Type.NUMBER },
              matchStatus: {
                type: Type.STRING,
                enum: ['EXACT_MATCH', 'PARTIAL_MATCH', 'UNMATCHED', 'DISCREPANCY'],
              },
              amountDifference: { type: Type.NUMBER },
              explanation: { type: Type.STRING },
              suggestedAction: {
                type: Type.STRING,
                enum: ['AUTO_POST', 'MANUAL_REVIEW', 'INVESTIGATE_FEE', 'CREATE_ADJUSTMENT', 'IGNORE'],
              },
            },
            required: [
              'camtTransactionId',
              'confidenceScore',
              'matchStatus',
              'amountDifference',
              'explanation',
              'suggestedAction',
            ],
          },
        },
        reconciliationNotes: { type: Type.STRING },
      },
      required: ['summary', 'matches', 'reconciliationNotes'],
    };

    const response = await this.ai.models.generateContent({
      model: this.defaultModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: options.temperature ?? 0.1,
        responseMimeType: 'application/json',
        responseSchema: reconciliationSchema,
      },
    });

    return JSON.parse(response.text || '{}') as ReconciliationReport;
  }

  /**
   * Analyzes CAMT bank statements for financial anomalies, fraud risks, duplicate payments,
   * unexpected counterparty behavior, and formatting irregularities.
   */
  public async detectAnomalies(
    camtData: CamtParsedData,
    options: { temperature?: number; historicalContext?: string } = {}
  ): Promise<AnomalyDetectionReport> {
    const systemInstruction = `
You are an advanced financial fraud and risk detection engine specializing in ISO 20022 CAMT bank statement analysis.
Analyze the input statement for suspicious patterns, duplicate transactions, unexpected high-value transfers, structuring/smurfing indicators, missing information, or unusual counterparty details.
Provide objective risk scores and actionable mitigation steps in JSON format matching the given schema.
    `.trim();

    const prompt = `
Perform anomaly detection and audit on the following CAMT statement data.

${options.historicalContext ? `Historical Context / Rules:\n${options.historicalContext}\n` : ''}

### CAMT Statement Data:
${JSON.stringify(this.sanitizeCamtForPrompt(camtData), null, 2)}
`;

    const anomalySchema: Schema = {
      type: Type.OBJECT,
      properties: {
        overallRiskScore: { type: Type.NUMBER },
        totalAnomaliesDetected: { type: Type.INTEGER },
        anomalies: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              transactionId: { type: Type.STRING },
              riskLevel: {
                type: Type.STRING,
                enum: ['LOW', 'MEDIUM', 'HIGH', 'CRITICAL'],
              },
              anomalyType: {
                type: Type.STRING,
                enum: [
                  'DUPLICATE_PAYMENT',
                  'UNUSUAL_AMOUNT',
                  'UNKNOWN_COUNTERPARTY',
                  'SUSPICIOUS_REMITTANCE',
                  'TIMING_IRREGULARITY',
                  'CURRENCY_MISMATCH',
                  'STRUCTURAL_FORMAT_ERROR',
                ],
              },
              description: { type: Type.STRING },
              detectedPattern: { type: Type.STRING },
              recommendedMitigation: { type: Type.STRING },
            },
            required: [
              'transactionId',
              'riskLevel',
              'anomalyType',
              'description',
              'detectedPattern',
              'recommendedMitigation',
            ],
          },
        },
        riskSummary: { type: Type.STRING },
      },
      required: ['overallRiskScore', 'totalAnomaliesDetected', 'anomalies', 'riskSummary'],
    };

    const response = await this.ai.models.generateContent({
      model: this.defaultModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: options.temperature ?? 0.2,
        responseMimeType: 'application/json',
        responseSchema: anomalySchema,
      },
    });

    return JSON.parse(response.text || '{}') as AnomalyDetectionReport;
  }

  /**
   * Automatically categorizes bank statement transactions into defined Chart of Accounts (COA) or custom tags.
   */
  public async categorizeTransactions(
    camtData: CamtParsedData,
    targetCategories: string[],
    options: { temperature?: number } = {}
  ): Promise<CategorizationReport> {
    const systemInstruction = `
You are an AI bookkeeping assistant. Your task is to categorize every transaction in the provided CAMT statement into one of the allowed target categories.
Assign confidence levels, suggest general ledger codes where applicable, and explain your reasoning.
    `.trim();

    const prompt = `
Categorize all transactions in this CAMT dataset into these target categories:
Target Categories: ${JSON.stringify(targetCategories)}

### CAMT Transactions:
${JSON.stringify(this.sanitizeCamtForPrompt(camtData), null, 2)}
`;

    const categorizationSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        categorizedTransactions: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              transactionId: { type: Type.STRING },
              category: { type: Type.STRING },
              subCategory: { type: Type.STRING },
              accountingCode: { type: Type.STRING },
              taxCode: { type: Type.STRING },
              confidence: { type: Type.NUMBER },
              rationale: { type: Type.STRING },
            },
            required: ['transactionId', 'category', 'confidence', 'rationale'],
          },
        },
        categoryBreakdown: {
          type: Type.OBJECT,
          description: 'Key-value map of category name to totals and counts.',
        },
      },
      required: ['categorizedTransactions', 'categoryBreakdown'],
    };

    const response = await this.ai.models.generateContent({
      model: this.defaultModel,
      contents: prompt,
      config: {
        systemInstruction,
        temperature: options.temperature ?? 0.1,
        responseMimeType: 'application/json',
        responseSchema: categorizationSchema,
      },
    });

    return JSON.parse(response.text || '{}') as CategorizationReport;
  }

  /**
   * Generates executive liquidity insights and financial narrative summaries from CAMT statement history.
   */
  public async generateExecutiveInsights(
    camtData: CamtParsedData
  ): Promise<CamtExecutiveInsights> {
    const systemInstruction = `
You are a Virtual CFO and corporate treasury analyst.
Synthesize the financial data from CAMT bank statements into executive summaries, identifying top counterparties, liquidity trends, and key operational financial recommendations.
    `.trim();

    const prompt = `
Analyze the following CAMT statement data and compile executive financial insights:
${JSON.stringify(this.sanitizeCamtForPrompt(camtData), null, 2)}
`;

    const insightsSchema: Schema = {
      type: Type.OBJECT,
      properties: {
        cashFlowSummary: { type: Type.STRING },
        topDebtors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              totalReceived: { type: Type.NUMBER },
            },
            required: ['name', 'totalReceived'],
          },
        },
        topCreditors: {
          type: Type.ARRAY,
          items: {
            type: Type.OBJECT,
            properties: {
              name: { type: Type.STRING },
              totalPaid: { type: Type.NUMBER },
            },
            required: ['name', 'totalPaid'],
          },
        },
        liquidityAssessment: { type: Type.STRING },
        keyActionItems: {
          type: Type.ARRAY,
          items: { type: Type.STRING },
        },
      },
      required: ['cashFlowSummary', 'topDebtors', 'topCreditors', 'liquidityAssessment', 'keyActionItems'],
    };

    const response = await this.ai.models.generateContent({
      model: 'gemini-2.5-pro', // Use pro for higher-level strategic analysis
      contents: prompt,
      config: {
        systemInstruction,
        temperature: 0.2,
        responseMimeType: 'application/json',
        responseSchema: insightsSchema,
      },
    });

    return JSON.parse(response.text || '{}') as CamtExecutiveInsights;
  }

  /**
   * Optimizes and trims raw CAMT parsed structures into token-efficient input for Gemini.
   */
  private sanitizeCamtForPrompt(camtData: CamtParsedData): Record<string, unknown> {
    const flattenedTransactions: Array<Record<string, unknown>> = [];

    camtData.statements.forEach((stmt) => {
      stmt.transactions.forEach((tx, idx) => {
        flattenedTransactions.push({
          id: tx.entryReference || tx.endToEndId || tx.instructionId || `tx_${stmt.id}_${idx}`,
          statementId: stmt.id,
          accountIban: stmt.accountIban,
          amount: tx.amount.value,
          currency: tx.amount.currency,
          direction: tx.creditDebitIndicator,
          bookingDate: tx.bookingDate,
          valueDate: tx.valueDate,
          debtorName: tx.debtor?.name,
          debtorIban: tx.debtor?.iban,
          creditorName: tx.creditor?.name,
          creditorIban: tx.creditor?.iban,
          remittance: tx.remittanceInformation,
          code: tx.bankTransactionCode || tx.proprietaryCode,
          additionalInfo: tx.additionalTransactionInfo,
        });
      });
    });

    return {
      totalStatements: camtData.statements.length,
      totalTransactions: flattenedTransactions.length,
      transactions: flattenedTransactions,
    };
  }
}

// ============================================================================
// Helper Utility Exports
// ============================================================================

export function createCamtAiBridge(options?: CamtAiBridgeOptions): CamtAiBridge {
  return new CamtAiBridge(options);
}