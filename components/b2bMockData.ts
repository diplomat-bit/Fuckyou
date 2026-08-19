

// --- CONSOLIDATED FROM: ./components/data/b2bMockData.ts ---

export interface CorporateAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  name: string;
  type: 'Operating' | 'Payroll' | 'Treasury' | 'Escrow' | 'Investment';
  balance: number;
  availableBalance: number;
  currency: string;
  status: 'Active' | 'Inactive' | 'Frozen';
  institutionName: string;
  bicSwift: string;
}

export interface Transaction {
  id: string;
  accountId: string;
  amount: number;
  type: 'Credit' | 'Debit';
  category: 'Vendor Payment' | 'Payroll' | 'Tax Payment' | 'Wire Transfer' | 'ACH Transfer' | 'Internal Transfer' | 'Fee' | 'Dividend';
  status: 'Completed' | 'Pending' | 'Failed';
  date: string; // ISO 8601 format
  counterpartyName: string;
  counterpartyAccount: string;
  counterpartyRouting: string;
  description: string;
  referenceNumber: string;
}

export const mockCorporateAccounts: CorporateAccount[] = [
  {
    id: 'acc-01',
    accountNumber: 'US8930002001928374',
    routingNumber: '021000021',
    name: 'Acme Corp Primary Operating',
    type: 'Operating',
    balance: 14250800.50,
    availableBalance: 14100800.50,
    currency: 'USD',
    status: 'Active',
    institutionName: 'Apex Global Trust',
    bicSwift: 'APEXUS33XXX'
  },
  {
    id: 'acc-02',
    accountNumber: 'US8930002001928399',
    routingNumber: '021000021',
    name: 'Acme Corp Payroll Reserve',
    type: 'Payroll',
    balance: 2450000.00,
    availableBalance: 2450000.00,
    currency: 'USD',
    status: 'Active',
    institutionName: 'Apex Global Trust',
    bicSwift: 'APEXUS33XXX'
  },
  {
    id: 'acc-03',
    accountNumber: 'US8930002001928411',
    routingNumber: '021000021',
    name: 'Acme Corp Treasury Yield Fund',
    type: 'Treasury',
    balance: 48100250.00,
    availableBalance: 48100250.00,
    currency: 'USD',
    status: 'Active',
    institutionName: 'Apex Global Trust',
    bicSwift: 'APEXUS33XXX'
  },
  {
    id: 'acc-04',
    accountNumber: 'EU4430009001112233',
    routingNumber: '021000021',
    name: 'Acme Corp EMEA Operating',
    type: 'Operating',
    balance: 8920400.75,
    availableBalance: 8920400.75,
    currency: 'EUR',
    status: 'Active',
    institutionName: 'Apex Global Trust (Europe)',
    bicSwift: 'APEXEU2SXXX'
  },
  {
    id: 'acc-05',
    accountNumber: 'US8930002001928555',
    routingNumber: '021000021',
    name: 'Acme Corp M&A Escrow Account',
    type: 'Escrow',
    balance: 15000000.00,
    availableBalance: 15000000.00,
    currency: 'USD',
    status: 'Frozen',
    institutionName: 'Apex Global Trust',
    bicSwift: 'APEXUS33XXX'
  }
];

export const mockTransactions: Transaction[] = [
  // Transactions for acc-01 (Primary Operating)
  {
    id: 'tx-101',
    accountId: 'acc-01',
    amount: 125000.00,
    type: 'Debit',
    category: 'Vendor Payment',
    status: 'Completed',
    date: '2023-10-27T14:30:00Z',
    counterpartyName: 'Amazon Web Services',
    counterpartyAccount: 'US1234567890',
    counterpartyRouting: '121000248',
    description: 'Monthly Cloud Infrastructure & Hosting Fees',
    referenceNumber: 'REF-AWS-2023-10A'
  },
  {
    id: 'tx-102',
    accountId: 'acc-01',
    amount: 450000.00,
    type: 'Credit',
    category: 'Wire Transfer',
    status: 'Completed',
    date: '2023-10-26T09:15:00Z',
    counterpartyName: 'Stripe Inc Payout',
    counterpartyAccount: 'US9876543210',
    counterpartyRouting: '121100782',
    description: 'Merchant Settlement Payout',
    referenceNumber: 'STRIPE-TXN-99281'
  },
  {
    id: 'tx-103',
    accountId: 'acc-01',
    amount: 85000.00,
    type: 'Debit',
    category: 'Tax Payment',
    status: 'Completed',
    date: '2023-10-25T11:00:00Z',
    counterpartyName: 'Internal Revenue Service',
    counterpartyAccount: 'US0000001040',
    counterpartyRouting: '021030007',
    description: 'Q3 Corporate Estimated Tax Payment',
    referenceNumber: 'EFTPS-TAX-882910'
  },
  {
    id: 'tx-104',
    accountId: 'acc-01',
    amount: 1500000.00,
    type: 'Debit',
    category: 'Internal Transfer',
    status: 'Completed',
    date: '2023-10-24T16:00:00Z',
    counterpartyName: 'Acme Corp Payroll Reserve',
    counterpartyAccount: 'US8930002001928399',
    counterpartyRouting: '021000021',
    description: 'Funding Payroll Reserve Account',
    referenceNumber: 'INT-TRF-00921'
  },
  {
    id: 'tx-105',
    accountId: 'acc-01',
    amount: 32000.50,
    type: 'Debit',
    category: 'Vendor Payment',
    status: 'Completed',
    date: '2023-10-23T10:45:00Z',
    counterpartyName: 'Salesforce.com Inc',
    counterpartyAccount: 'US5544332211',
    counterpartyRouting: '121000248',
    description: 'Enterprise CRM Annual License Renewal',
    referenceNumber: 'CRM-SF-992811'
  },
  {
    id: 'tx-106',
    accountId: 'acc-01',
    amount: 150000.00,
    type: 'Debit',
    category: 'Wire Transfer',
    status: 'Pending',
    date: '2023-10-28T08:00:00Z',
    counterpartyName: 'Deloitte Consulting LLP',
    counterpartyAccount: 'US7766554433',
    counterpartyRouting: '021000021',
    description: 'IT Modernization Advisory Services - Milestone 2',
    referenceNumber: 'WIRE-DEL-88291'
  },
  {
    id: 'tx-107',
    accountId: 'acc-01',
    amount: 250.00,
    type: 'Debit',
    category: 'Fee',
    status: 'Completed',
    date: '2023-10-20T23:59:59Z',
    counterpartyName: 'Apex Global Trust',
    counterpartyAccount: 'SYSTEM-FEE',
    counterpartyRouting: '021000021',
    description: 'Monthly Corporate Account Maintenance Fee',
    referenceNumber: 'FEE-2023-10'
  },

  // Transactions for acc-02 (Payroll Reserve)
  {
    id: 'tx-201',
    accountId: 'acc-02',
    amount: 1500000.00,
    type: 'Credit',
    category: 'Internal Transfer',
    status: 'Completed',
    date: '2023-10-24T16:00:00Z',
    counterpartyName: 'Acme Corp Primary Operating',
    counterpartyAccount: 'US8930002001928374',
    counterpartyRouting: '021000021',
    description: 'Funding Payroll Reserve Account',
    referenceNumber: 'INT-TRF-00921'
  },
  {
    id: 'tx-202',
    accountId: 'acc-02',
    amount: 1350000.00,
    type: 'Debit',
    category: 'Payroll',
    status: 'Completed',
    date: '2023-10-25T06:00:00Z',
    counterpartyName: 'ADP Payroll Services',
    counterpartyAccount: 'US1122334455',
    counterpartyRouting: '021200025',
    description: 'Semi-Monthly Employee Direct Deposits',
    referenceNumber: 'PAY-ADP-202310B'
  },
  {
    id: 'tx-203',
    accountId: 'acc-02',
    amount: 120000.00,
    type: 'Debit',
    category: 'Tax Payment',
    status: 'Completed',
    date: '2023-10-25T06:15:00Z',
    counterpartyName: 'ADP Tax Filing Service',
    counterpartyAccount: 'US1122334455',
    counterpartyRouting: '021200025',
    description: 'Payroll Tax Withholding & Remittance',
    referenceNumber: 'PAY-TAX-202310B'
  },

  // Transactions for acc-03 (Treasury Yield Fund)
  {
    id: 'tx-301',
    accountId: 'acc-03',
    amount: 5000000.00,
    type: 'Debit',
    category: 'Wire Transfer',
    status: 'Completed',
    date: '2023-10-15T10:00:00Z',
    counterpartyName: 'Vanguard Treasury Money Market',
    counterpartyAccount: 'US9988776655',
    counterpartyRouting: '031000053',
    description: 'Purchase of US Treasury Bills (4-Week)',
    referenceNumber: 'T-BILL-PURCH-091'
  },
  {
    id: 'tx-302',
    accountId: 'acc-03',
    amount: 185200.00,
    type: 'Credit',
    category: 'Dividend',
    status: 'Completed',
    date: '2023-10-01T08:00:00Z',
    counterpartyName: 'Vanguard Treasury Money Market',
    counterpartyAccount: 'US9988776655',
    counterpartyRouting: '031000053',
    description: 'Monthly Dividend Distribution',
    referenceNumber: 'DIV-VANG-202309'
  },

  // Transactions for acc-04 (EMEA Operating)
  {
    id: 'tx-401',
    accountId: 'acc-04',
    amount: 45000.00,
    type: 'Debit',
    category: 'Vendor Payment',
    status: 'Completed',
    date: '2023-10-26T13:00:00Z',
    counterpartyName: 'SAP Deutschland SE',
    counterpartyAccount: 'DE89370400440532013000',
    counterpartyRouting: 'DBKEDEF1XXX',
    description: 'ERP Cloud Subscription Fees',
    referenceNumber: 'SAP-INV-882910'
  },
  {
    id: 'tx-402',
    accountId: 'acc-04',
    amount: 125000.00,
    type: 'Credit',
    category: 'ACH Transfer',
    status: 'Completed',
    date: '2023-10-24T09:30:00Z',
    counterpartyName: 'BMW Group AG',
    counterpartyAccount: 'DE12370400440532011111',
    counterpartyRouting: 'DBKEDEF1XXX',
    description: 'B2B Enterprise Software Licensing Fee',
    referenceNumber: 'INV-ACME-2023-442'
  },
  {
    id: 'tx-403',
    accountId: 'acc-04',
    amount: 8500.00,
    type: 'Debit',
    category: 'Fee',
    status: 'Failed',
    date: '2023-10-22T11:15:00Z',
    counterpartyName: 'Intermediary Bank FX Fee',
    counterpartyAccount: 'SYSTEM-FX-FEE',
    counterpartyRouting: 'APEXEU2SXXX',
    description: 'Cross-Border Settlement Fee (Reversed)',
    referenceNumber: 'ERR-FX-99281'
  }
];

// Helper functions to simulate API endpoints
export const getCorporateAccounts = (): Promise<CorporateAccount[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockCorporateAccounts]);
    }, 300); // Simulate network latency
  });
};

export const getCorporateAccountById = (id: string): Promise<CorporateAccount | undefined> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const account = mockCorporateAccounts.find(acc => acc.id === id);
      resolve(account ? { ...account } : undefined);
    }, 200);
  });
};

export const getTransactionsByAccountId = (accountId: string): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      const txs = mockTransactions.filter(tx => tx.accountId === accountId);
      resolve([...txs].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, 400);
  });
};

export const getAllTransactions = (): Promise<Transaction[]> => {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([...mockTransactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    }, 400);
  });
};

export const getAccountSummary = (accountId: string) => {
  const account = mockCorporateAccounts.find(acc => acc.id === accountId);
  const transactions = mockTransactions.filter(tx => tx.accountId === accountId);
  
  if (!account) return null;

  const totalCredits = transactions
    .filter(tx => tx.type === 'Credit' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const totalDebits = transactions
    .filter(tx => tx.type === 'Debit' && tx.status === 'Completed')
    .reduce((sum, tx) => sum + tx.amount, 0);

  return {
    accountId: account.id,
    accountName: account.name,
    balance: account.balance,
    currency: account.currency,
    totalCredits,
    totalDebits,
    transactionCount: transactions.length
  };
};