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

export const APP_REGISTRY: Record<string, AppDefinition> = {
  'b2b-payments': B2B_PAYMENTS_APP,
  'statement-parser': STATEMENT_PARSER_APP,
  'audit-log': AUDIT_LOG_APP,
  'account-reconciliation': ACCOUNT_RECONCILIATION_APP,
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