

// --- CONSOLIDATED FROM: ./services/citi_suite/appRegistry.ts ---

export interface Schema {
  type: 'STRING' | 'NUMBER' | 'INTEGER' | 'BOOLEAN' | 'ARRAY' | 'OBJECT';
  properties?: { [key: string]: Schema };
  required?: string[];
  items?: Schema;
  description?: string;
  enum?: string[];
}

export interface FunctionDeclaration {
  name: string;
  description: string;
  parameters?: Schema;
}

export interface AppMetadata {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
}

export interface ApiEndpoint {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

export interface AppDefinition {
  metadata: AppMetadata;
  tools: FunctionDeclaration[];
  apiEndpoints: {
    [toolName: string]: ApiEndpoint;
  };
}

export const B2B_PAYMENTS_APP: AppDefinition = {
  metadata: {
    id: 'b2b-payments',
    name: 'B2B Payments',
    description: 'Manage vendor payments, initiate ACH/Wire transfers, approve pending transactions, and track payment statuses.',
    category: 'Finance',
    icon: 'CreditCard',
  },
  tools: [
    {
      name: 'initiatePayment',
      description: 'Initiates a new B2B payment to a specified vendor.',
      parameters: {
        type: 'OBJECT',
        properties: {
          vendorId: {
            type: 'STRING',
            description: 'The unique identifier of the vendor to pay.',
          },
          amount: {
            type: 'NUMBER',
            description: 'The payment amount in the specified currency.',
          },
          currency: {
            type: 'STRING',
            description: 'The 3-letter ISO currency code (e.g., USD, EUR).',
          },
          paymentMethod: {
            type: 'STRING',
            enum: ['ACH', 'WIRE', 'CARD'],
            description: 'The method of payment transfer.',
          },
          dueDate: {
            type: 'STRING',
            description: 'Optional payment due date in YYYY-MM-DD format.',
          },
          memo: {
            type: 'STRING',
            description: 'Optional memo or reference note for the payment.',
          },
        },
        required: ['vendorId', 'amount', 'currency', 'paymentMethod'],
      },
    },
    {
      name: 'getPaymentStatus',
      description: 'Retrieves the current status and details of a specific payment.',
      parameters: {
        type: 'OBJECT',
        properties: {
          paymentId: {
            type: 'STRING',
            description: 'The unique identifier of the payment transaction.',
          },
        },
        required: ['paymentId'],
      },
    },
    {
      name: 'listVendors',
      description: 'Retrieves a list of registered vendors with their payment details.',
      parameters: {
        type: 'OBJECT',
        properties: {
          search: {
            type: 'STRING',
            description: 'Optional search query to filter vendors by name or tax ID.',
          },
          limit: {
            type: 'INTEGER',
            description: 'Maximum number of vendors to return (default: 20).',
          },
        },
      },
    },
    {
      name: 'approvePayment',
      description: 'Approves a pending payment that requires multi-sig or manager authorization.',
      parameters: {
        type: 'OBJECT',
        properties: {
          paymentId: {
            type: 'STRING',
            description: 'The unique identifier of the pending payment.',
          },
          approverNotes: {
            type: 'STRING',
            description: 'Optional notes or justification from the approver.',
          },
        },
        required: ['paymentId'],
      },
    },
  ],
  apiEndpoints: {
    initiatePayment: {
      method: 'POST',
      path: '/api/v1/payments',
      description: 'Initiate a new payment transaction.',
    },
    getPaymentStatus: {
      method: 'GET',
      path: '/api/v1/payments/:paymentId',
      description: 'Fetch payment details and status.',
    },
    listVendors: {
      method: 'GET',
      path: '/api/v1/vendors',
      description: 'List and search registered vendors.',
    },
    approvePayment: {
      method: 'POST',
      path: '/api/v1/payments/:paymentId/approve',
      description: 'Approve a pending payment.',
    },
  },
};

export const STATEMENT_PARSER_APP: AppDefinition = {
  metadata: {
    id: 'statement-parser',
    name: 'Statement Parser',
    description: 'Upload, parse, and extract structured transaction data from PDF, CSV, or Excel bank statements using AI.',
    category: 'Data Processing',
    icon: 'FileText',
  },
  tools: [
    {
      name: 'uploadStatement',
      description: 'Uploads a bank statement file for processing.',
      parameters: {
        type: 'OBJECT',
        properties: {
          fileUrl: {
            type: 'STRING',
            description: 'The public or pre-signed URL of the statement file.',
          },
          fileType: {
            type: 'STRING',
            enum: ['PDF', 'CSV', 'XLSX'],
            description: 'The format of the statement file.',
          },
          bankName: {
            type: 'STRING',
            description: 'Optional name of the bank to assist parser mapping (e.g., Chase, SVB).',
          },
        },
        required: ['fileUrl', 'fileType'],
      },
    },
    {
      name: 'parseStatement',
      description: 'Triggers the AI parsing engine on an uploaded statement to extract structured data.',
      parameters: {
        type: 'OBJECT',
        properties: {
          jobId: {
            type: 'STRING',
            description: 'The unique identifier of the uploaded statement job.',
          },
          extractCategories: {
            type: 'BOOLEAN',
            description: 'Whether to automatically categorize transactions during parsing.',
          },
        },
        required: ['jobId'],
      },
    },
    {
      name: 'getParsingJobs',
      description: 'Lists recent statement parsing jobs and their processing statuses.',
      parameters: {
        type: 'OBJECT',
        properties: {
          status: {
            type: 'STRING',
            enum: ['PENDING', 'PROCESSING', 'COMPLETED', 'FAILED'],
            description: 'Filter jobs by status.',
          },
          limit: {
            type: 'INTEGER',
            description: 'Maximum number of jobs to return.',
          },
        },
      },
    },
    {
      name: 'extractTransactions',
      description: 'Retrieves the parsed transaction list from a completed parsing job.',
      parameters: {
        type: 'OBJECT',
        properties: {
          jobId: {
            type: 'STRING',
            description: 'The unique identifier of the completed parsing job.',
          },
          startDate: {
            type: 'STRING',
            description: 'Optional filter for transaction start date (YYYY-MM-DD).',
          },
          endDate: {
            type: 'STRING',
            description: 'Optional filter for transaction end date (YYYY-MM-DD).',
          },
        },
        required: ['jobId'],
      },
    },
  ],
  apiEndpoints: {
    uploadStatement: {
      method: 'POST',
      path: '/api/v1/statements/upload',
      description: 'Upload a bank statement file.',
    },
    parseStatement: {
      method: 'POST',
      path: '/api/v1/statements/parse',
      description: 'Trigger parsing on an uploaded statement.',
    },
    getParsingJobs: {
      method: 'GET',
      path: '/api/v1/statements/jobs',
      description: 'List statement parsing jobs.',
    },
    extractTransactions: {
      method: 'GET',
      path: '/api/v1/statements/jobs/:jobId/transactions',
      description: 'Retrieve parsed transactions.',
    },
  },
};

export const AUDIT_LOG_APP: AppDefinition = {
  metadata: {
    id: 'audit-log',
    name: 'Audit Log',
    description: 'Track, search, and export system-wide user actions, API calls, and security events for compliance.',
    category: 'Security & Compliance',
    icon: 'ShieldAlert',
  },
  tools: [
    {
      name: 'searchAuditLogs',
      description: 'Searches and filters system audit logs based on criteria.',
      parameters: {
        type: 'OBJECT',
        properties: {
          userId: {
            type: 'STRING',
            description: 'Filter logs by the user who performed the action.',
          },
          action: {
            type: 'STRING',
            description: 'Filter logs by action type (e.g., USER_LOGIN, PAYMENT_INITIATED).',
          },
          startDate: {
            type: 'STRING',
            description: 'Filter logs from this ISO timestamp.',
          },
          endDate: {
            type: 'STRING',
            description: 'Filter logs up to this ISO timestamp.',
          },
          limit: {
            type: 'INTEGER',
            description: 'Maximum number of log entries to return.',
          },
        },
      },
    },
    {
      name: 'getAuditLogDetails',
      description: 'Retrieves detailed metadata and payload for a specific audit log entry.',
      parameters: {
        type: 'OBJECT',
        properties: {
          logId: {
            type: 'STRING',
            description: 'The unique identifier of the audit log entry.',
          },
        },
        required: ['logId'],
      },
    },
    {
      name: 'createAuditEntry',
      description: 'Manually appends a custom security or operational event to the audit log.',
      parameters: {
        type: 'OBJECT',
        properties: {
          action: {
            type: 'STRING',
            description: 'The action name (e.g., MANUAL_OVERRIDE).',
          },
          actor: {
            type: 'STRING',
            description: 'The identifier of the user or system performing the action.',
          },
          resource: {
            type: 'STRING',
            description: 'The resource affected (e.g., Payment #12930).',
          },
          status: {
            type: 'STRING',
            enum: ['SUCCESS', 'FAILURE', 'WARNING'],
            description: 'The outcome of the action.',
          },
          details: {
            type: 'STRING',
            description: 'JSON string or text containing detailed context or metadata.',
          },
        },
        required: ['action', 'actor', 'resource', 'status'],
      },
    },
    {
      name: 'exportAuditLogs',
      description: 'Generates a downloadable export of audit logs matching the criteria.',
      parameters: {
        type: 'OBJECT',
        properties: {
          format: {
            type: 'STRING',
            enum: ['CSV', 'JSON'],
            description: 'The export file format.',
          },
          startDate: {
            type: 'STRING',
            description: 'Filter logs from this ISO timestamp.',
          },
          endDate: {
            type: 'STRING',
            description: 'Filter logs up to this ISO timestamp.',
          },
        },
        required: ['format'],
      },
    },
  ],
  apiEndpoints: {
    searchAuditLogs: {
      method: 'GET',
      path: '/api/v1/audit-logs',
      description: 'Search and filter audit logs.',
    },
    getAuditLogDetails: {
      method: 'GET',
      path: '/api/v1/audit-logs/:logId',
      description: 'Get detailed audit log entry.',
    },
    createAuditEntry: {
      method: 'POST',
      path: '/api/v1/audit-logs',
      description: 'Create a new audit log entry.',
    },
    exportAuditLogs: {
      method: 'POST',
      path: '/api/v1/audit-logs/export',
      description: 'Export audit logs to CSV or JSON.',
    },
  },
};

export const ACCOUNT_RECONCILIATION_APP: AppDefinition = {
  metadata: {
    id: 'account-reconciliation',
    name: 'Account Reconciliation',
    description: 'Match bank statement transactions against internal ledger entries, flag discrepancies, and resolve variances.',
    category: 'Finance',
    icon: 'Scale',
  },
  tools: [
    {
      name: 'reconcileAccounts',
      description: 'Runs the automated reconciliation engine matching bank statements against ledger entries.',
      parameters: {
        type: 'OBJECT',
        properties: {
          bankStatementJobId: {
            type: 'STRING',
            description: 'The ID of the parsed bank statement job.',
          },
          ledgerId: {
            type: 'STRING',
            description: 'The ID of the internal ledger to reconcile against.',
          },
          toleranceAmount: {
            type: 'NUMBER',
            description: 'Allowed difference in cents/units for auto-matching (default: 0).',
          },
        },
        required: ['bankStatementJobId', 'ledgerId'],
      },
    },
    {
      name: 'getReconciliationStatus',
      description: 'Retrieves the summary and status of a reconciliation run.',
      parameters: {
        type: 'OBJECT',
        properties: {
          reconciliationId: {
            type: 'STRING',
            description: 'The unique identifier of the reconciliation run.',
          },
        },
        required: ['reconciliationId'],
      },
    },
    {
      name: 'matchTransactions',
      description: 'Manually matches a bank statement transaction with one or more ledger transactions.',
      parameters: {
        type: 'OBJECT',
        properties: {
          reconciliationId: {
            type: 'STRING',
            description: 'The unique identifier of the active reconciliation run.',
          },
          statementTransactionId: {
            type: 'STRING',
            description: 'The ID of the transaction from the bank statement.',
          },
          ledgerTransactionIds: {
            type: 'ARRAY',
            items: {
              type: 'STRING',
            },
            description: 'List of matching internal ledger transaction IDs.',
          },
        },
        required: ['reconciliationId', 'statementTransactionId', 'ledgerTransactionIds'],
      },
    },
    {
      name: 'flagDiscrepancy',
      description: 'Flags a transaction discrepancy for manual review or investigation.',
      parameters: {
        type: 'OBJECT',
        properties: {
          reconciliationId: {
            type: 'STRING',
            description: 'The unique identifier of the active reconciliation run.',
          },
          transactionId: {
            type: 'STRING',
            description: 'The ID of the transaction with the discrepancy.',
          },
          reason: {
            type: 'STRING',
            description: 'The reason for flagging (e.g., Amount Mismatch, Missing Invoice).',
          },
          severity: {
            type: 'STRING',
            enum: ['LOW', 'MEDIUM', 'HIGH'],
            description: 'The severity level of the discrepancy.',
          },
        },
        required: ['reconciliationId', 'transactionId', 'reason'],
      },
    },
  ],
  apiEndpoints: {
    reconcileAccounts: {
      method: 'POST',
      path: '/api/v1/reconciliation/run',
      description: 'Trigger automated reconciliation.',
    },
    getReconciliationStatus: {
      method: 'GET',
      path: '/api/v1/reconciliation/:reconciliationId',
      description: 'Get reconciliation run summary.',
    },
    matchTransactions: {
      method: 'POST',
      path: '/api/v1/reconciliation/:reconciliationId/match',
      description: 'Manually match transactions.',
    },
    flagDiscrepancy: {
      method: 'POST',
      path: '/api/v1/reconciliation/:reconciliationId/flag',
      description: 'Flag a transaction discrepancy.',
    },
  },
};

export const BALANCE_TRANSFER_APP: AppDefinition = {
  metadata: {
    id: 'balance-transfer',
    name: 'Balance Transfer Evaluator',
    description: 'Evaluate credit card balance transfer offers, calculate effective APRs, simulate repayment schedules, and rank promotional offers.',
    category: 'Credit & Financing',
    icon: 'Percent',
  },
  tools: [
    {
      name: 'calculateTransferFee',
      description: 'Calculates the transfer fee for a given balance transfer amount.',
      parameters: {
        type: 'OBJECT',
        properties: {
          amount: {
            type: 'NUMBER',
            description: 'The balance transfer amount.',
          },
          feePercentage: {
            type: 'NUMBER',
            description: 'The promotional transfer fee percentage (e.g., 3 for 3%).',
          },
          minFee: {
            type: 'NUMBER',
            description: 'The minimum fee amount (default: 5).',
          },
          maxFee: {
            type: 'NUMBER',
            description: 'Optional maximum fee cap.',
          },
        },
        required: ['amount', 'feePercentage'],
      },
    },
    {
      name: 'calculateEffectiveApr',
      description: 'Calculates the effective APR of a balance transfer offer taking the upfront fee into account.',
      parameters: {
        type: 'OBJECT',
        properties: {
          promoApr: {
            type: 'NUMBER',
            description: 'The promotional APR (e.g., 0 for 0% APR).',
          },
          promoPeriodMonths: {
            type: 'NUMBER',
            description: 'The duration of the promotional period in months.',
          },
          feePercentage: {
            type: 'NUMBER',
            description: 'The upfront transfer fee percentage.',
          },
        },
        required: ['promoApr', 'promoPeriodMonths', 'feePercentage'],
      },
    },
    {
      name: 'simulateRepayment',
      description: 'Simulates a repayment schedule for a balance transfer and calculates total interest and fees paid.',
      parameters: {
        type: 'OBJECT',
        properties: {
          balance: {
            type: 'NUMBER',
            description: 'The initial balance to transfer.',
          },
          monthlyPayment: {
            type: 'NUMBER',
            description: 'The planned monthly payment amount.',
          },
          promoApr: {
            type: 'NUMBER',
            description: 'The promotional APR.',
          },
          promoPeriodMonths: {
            type: 'NUMBER',
            description: 'The promotional period in months.',
          },
          regularApr: {
            type: 'NUMBER',
            description: 'The standard post-promotional APR.',
          },
        },
        required: ['balance', 'monthlyPayment', 'promoApr', 'promoPeriodMonths', 'regularApr'],
      },
    },
    {
      name: 'evaluateAndRankOffers',
      description: 'Ranks multiple balance transfer offers based on total cost and repayment speed.',
      parameters: {
        type: 'OBJECT',
        properties: {
          balance: {
            type: 'NUMBER',
            description: 'The balance to transfer.',
          },
          monthlyPayment: {
            type: 'NUMBER',
            description: 'The planned monthly payment.',
          },
          offers: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING', description: 'Unique offer identifier.' },
                name: { type: 'STRING', description: 'Name of the offer.' },
                promoApr: { type: 'NUMBER', description: 'Promotional APR.' },
                promoPeriodMonths: { type: 'NUMBER', description: 'Promotional period in months.' },
                feePercentage: { type: 'NUMBER', description: 'Upfront fee percentage.' },
                regularApr: { type: 'NUMBER', description: 'Standard APR.' },
              },
              required: ['id', 'name', 'promoApr', 'promoPeriodMonths', 'feePercentage', 'regularApr'],
            },
            description: 'List of balance transfer offers to evaluate.',
          },
        },
        required: ['balance', 'monthlyPayment', 'offers'],
      },
    },
  ],
  apiEndpoints: {
    calculateTransferFee: {
      method: 'POST',
      path: '/api/v1/balance-transfer/fee',
      description: 'Calculate balance transfer fee.',
    },
    calculateEffectiveApr: {
      method: 'POST',
      path: '/api/v1/balance-transfer/effective-apr',
      description: 'Calculate effective APR.',
    },
    simulateRepayment: {
      method: 'POST',
      path: '/api/v1/balance-transfer/simulate',
      description: 'Simulate repayment schedule.',
    },
    evaluateAndRankOffers: {
      method: 'POST',
      path: '/api/v1/balance-transfer/rank',
      description: 'Rank multiple balance transfer offers.',
    },
  },
};

export const BT_ELIGIBILITY_APP: AppDefinition = {
  metadata: {
    id: 'bt-eligibility',
    name: 'Balance Transfer Eligibility',
    description: 'Assess customer eligibility for balance transfer offers based on credit profile, account history, and risk parameters.',
    category: 'Credit & Financing',
    icon: 'UserCheck',
  },
  tools: [
    {
      name: 'checkEligibility',
      description: 'Checks if a customer is eligible for a balance transfer of a specific amount.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerId: {
            type: 'STRING',
            description: 'The unique identifier of the customer.',
          },
          requestedAmount: {
            type: 'NUMBER',
            description: 'The requested balance transfer amount.',
          },
        },
        required: ['customerId', 'requestedAmount'],
      },
    },
    {
      name: 'getEligibleOffers',
      description: 'Retrieves all active balance transfer offers a customer is eligible for.',
      parameters: {
        type: 'OBJECT',
        properties: {
          customerId: {
            type: 'STRING',
            description: 'The unique identifier of the customer.',
          },
        },
        required: ['customerId'],
      },
    },
  ],
  apiEndpoints: {
    checkEligibility: {
      method: 'POST',
      path: '/api/v1/bt-eligibility/check',
      description: 'Check customer eligibility.',
    },
    getEligibleOffers: {
      method: 'GET',
      path: '/api/v1/bt-eligibility/offers/:customerId',
      description: 'Get eligible offers for a customer.',
    },
  },
};

export const CAMT_AI_INTEGRATION_APP: AppDefinition = {
  metadata: {
    id: 'camt-ai-integration',
    name: 'CAMT ISO 20022 Processor',
    description: 'Generate, parse, and analyze ISO 20022 CAMT.052, CAMT.053, and CAMT.054 bank-to-customer statement messages using AI.',
    category: 'Data Processing',
    icon: 'FileCode',
  },
  tools: [
    {
      name: 'generateCamtMsg',
      description: 'Generates a valid ISO 20022 CAMT XML statement message.',
      parameters: {
        type: 'OBJECT',
        properties: {
          statementId: {
            type: 'STRING',
            description: 'Unique statement identifier.',
          },
          transactions: {
            type: 'ARRAY',
            items: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING', description: 'Transaction ID.' },
                amount: { type: 'NUMBER', description: 'Transaction amount.' },
                currency: { type: 'STRING', description: '3-letter currency code.' },
                bookingDate: { type: 'STRING', description: 'Booking date in YYYY-MM-DD format.' },
                creditDebitIndicator: { type: 'STRING', enum: ['CRDT', 'DBIT'], description: 'Credit or Debit indicator.' },
                proprietaryReason: { type: 'STRING', description: 'Proprietary transaction code or reason.' },
              },
              required: ['id', 'amount', 'currency', 'bookingDate', 'creditDebitIndicator'],
            },
            description: 'List of transactions to include in the statement.',
          },
        },
        required: ['statementId', 'transactions'],
      },
    },
    {
      name: 'parseCamtMsg',
      description: 'Parses an ISO 20022 CAMT XML message into structured JSON.',
      parameters: {
        type: 'OBJECT',
        properties: {
          xmlContent: {
            type: 'STRING',
            description: 'The raw XML content of the CAMT message.',
          },
        },
        required: ['xmlContent'],
      },
    },
    {
      name: 'analyzeCamtDiscrepancies',
      description: 'Compares a CAMT statement against an internal ledger to identify discrepancies.',
      parameters: {
        type: 'OBJECT',
        properties: {
          xmlContent: {
            type: 'STRING',
            description: 'The raw XML content of the CAMT message.',
          },
          ledgerId: {
            type: 'STRING',
            description: 'The ID of the internal ledger to reconcile against.',
          },
        },
        required: ['xmlContent', 'ledgerId'],
      },
    },
  ],
  apiEndpoints: {
    generateCamtMsg: {
      method: 'POST',
      path: '/api/v1/camt/generate',
      description: 'Generate ISO 20022 CAMT XML.',
    },
    parseCamtMsg: {
      method: 'POST',
      path: '/api/v1/camt/parse',
      description: 'Parse ISO 20022 CAMT XML.',
    },
    analyzeCamtDiscrepancies: {
      method: 'POST',
      path: '/api/v1/camt/analyze',
      description: 'Analyze CAMT statement discrepancies.',
    },
  },
};

export const CITI_SOVEREIGN_BRIDGE_APP: AppDefinition = {
  metadata: {
    id: 'citi-sovereign-bridge',
    name: 'Citi Sovereign Ledger Bridge',
    description: 'Synchronize and reconcile transactions between Citi corporate accounts and the Sovereign Distributed Ledger.',
    category: 'Integration',
    icon: 'Shuffle',
  },
  tools: [
    {
      name: 'syncBridgeTransactions',
      description: 'Synchronizes transactions between Citi and the Sovereign Ledger.',
      parameters: {
        type: 'OBJECT',
        properties: {
          bridgeId: {
            type: 'STRING',
            description: 'The unique identifier of the bridge configuration.',
          },
          syncDirection: {
            type: 'STRING',
            enum: ['CITI_TO_SOVEREIGN', 'SOVEREIGN_TO_CITI'],
            description: 'The direction of transaction synchronization.',
          },
        },
        required: ['bridgeId', 'syncDirection'],
      },
    },
    {
      name: 'getBridgeStatus',
      description: 'Retrieves the current status and metrics of the Citi-Sovereign bridge.',
      parameters: {
        type: 'OBJECT',
        properties: {
          bridgeId: {
            type: 'STRING',
            description: 'The unique identifier of the bridge.',
          },
        },
        required: ['bridgeId'],
      },
    },
  ],
  apiEndpoints: {
    syncBridgeTransactions: {
      method: 'POST',
      path: '/api/v1/bridge/sync',
      description: 'Sync transactions across the bridge.',
    },
    getBridgeStatus: {
      method: 'GET',
      path: '/api/v1/bridge/status/:bridgeId',
      description: 'Get bridge status and metrics.',
    },
  },
};

export const APP_REGISTRY: Record<string, AppDefinition> = {
  'b2b-payments': B2B_PAYMENTS_APP,
  'statement-parser': STATEMENT_PARSER_APP,
  'audit-log': AUDIT_LOG_APP,
  'account-reconciliation': ACCOUNT_RECONCILIATION_APP,
  'balance-transfer': BALANCE_TRANSFER_APP,
  'bt-eligibility': BT_ELIGIBILITY_APP,
  'camt-ai-integration': CAMT_AI_INTEGRATION_APP,
  'citi-sovereign-bridge': CITI_SOVEREIGN_BRIDGE_APP,
};

export function getAppById(id: string): AppDefinition | undefined {
  return APP_REGISTRY[id];
}

export function getAllApps(): AppDefinition[] {
  return Object.values(APP_REGISTRY);
}

export function getGeminiToolsForApp(id: string): { functionDeclarations: FunctionDeclaration[] } | null {
  const app = getAppById(id);
  if (!app) return null;
  return {
    functionDeclarations: app.tools,
  };
}

export function getAllGeminiTools(): { functionDeclarations: FunctionDeclaration[] } {
  const allTools = getAllApps().flatMap((app) => app.tools);
  return {
    functionDeclarations: allTools,
  };
}

export function getAppByToolName(toolName: string): AppDefinition | undefined {
  return getAllApps().find((app) => app.tools.some((tool) => tool.name === toolName));
}