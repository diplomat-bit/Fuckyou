

// --- CONSOLIDATED FROM: ./components/data/balanceTransferBatchMockData.ts ---

export interface BalanceTransferJob {
  id: string;
  name: string;
  sourceAccount: string;
  destinationAccount: string;
  amount: number;
  currency: string;
  cronExpression: string;
  nextRun: string;
  lastRun?: string;
  lastStatus?: 'success' | 'failed' | 'running';
  status: 'active' | 'paused' | 'completed' | 'failed';
  templateId?: string;
  description?: string;
}

export interface SystemLog {
  id: string;
  timestamp: string;
  level: 'info' | 'warning' | 'error' | 'success';
  message: string;
  jobId?: string;
  category: 'scheduler' | 'execution' | 'security' | 'system';
}

export interface TransferTemplate {
  id: string;
  name: string;
  description: string;
  defaultSourceAccount: string;
  defaultDestinationAccount: string;
  defaultAmount: number;
  defaultCurrency: string;
  category: 'payroll' | 'liquidity' | 'investment' | 'intercompany' | 'tax';
}

export const INITIAL_TEMPLATES: TransferTemplate[] = [
  {
    id: 'tpl-liquidity-sweep',
    name: 'Daily Liquidity Sweep',
    description: 'Automatically sweep excess operational funds into the high-yield treasury account.',
    defaultSourceAccount: 'OP-US-8829',
    defaultDestinationAccount: 'TR-US-0019',
    defaultAmount: 500000,
    defaultCurrency: 'USD',
    category: 'liquidity'
  },
  {
    id: 'tpl-payroll-funding',
    name: 'Bi-Weekly Payroll Funding',
    description: 'Pre-fund the payroll disbursement account from the primary operating account.',
    defaultSourceAccount: 'OP-US-8829',
    defaultDestinationAccount: 'PR-US-4412',
    defaultAmount: 1250000,
    defaultCurrency: 'USD',
    category: 'payroll'
  },
  {
    id: 'tpl-tax-reserve',
    name: 'Monthly Tax Reserve Allocation',
    description: 'Allocate 15% of estimated monthly revenue to the corporate tax reserve account.',
    defaultSourceAccount: 'OP-US-8829',
    defaultDestinationAccount: 'TX-US-9901',
    defaultAmount: 180000,
    defaultCurrency: 'USD',
    category: 'tax'
  },
  {
    id: 'tpl-intercompany-eu',
    name: 'Intercompany EU Rebalancing',
    description: 'Rebalance liquidity between US Operating and EU Subsidiary accounts.',
    defaultSourceAccount: 'OP-US-8829',
    defaultDestinationAccount: 'SUB-EU-7711',
    defaultAmount: 250000,
    defaultCurrency: 'EUR',
    category: 'intercompany'
  }
];

export const INITIAL_SCHEDULED_JOBS: BalanceTransferJob[] = [
  {
    id: 'job-001',
    name: 'End-of-Day Treasury Sweep',
    sourceAccount: 'OP-US-8829',
    destinationAccount: 'TR-US-0019',
    amount: 450000,
    currency: 'USD',
    cronExpression: '0 17 * * 1-5', // 5:00 PM Mon-Fri
    nextRun: new Date(Date.now() + 4 * 3600 * 1000).toISOString(), // 4 hours from now
    lastRun: new Date(Date.now() - 20 * 3600 * 1000).toISOString(), // 20 hours ago
    lastStatus: 'success',
    status: 'active',
    templateId: 'tpl-liquidity-sweep',
    description: 'Sweeps excess operational cash into the treasury yield account.'
  },
  {
    id: 'job-002',
    name: 'Mid-Month Payroll Pre-Fund',
    sourceAccount: 'OP-US-8829',
    destinationAccount: 'PR-US-4412',
    amount: 1250000,
    currency: 'USD',
    cronExpression: '0 9 14 * *', // 9:00 AM on the 14th of every month
    nextRun: new Date(new Date().getFullYear(), new Date().getMonth(), 14, 9, 0, 0).toISOString(),
    lastRun: new Date(Date.now() - 15 * 24 * 3600 * 1000).toISOString(),
    lastStatus: 'success',
    status: 'active',
    templateId: 'tpl-payroll-funding',
    description: 'Ensures payroll account is fully funded prior to mid-month disbursements.'
  },
  {
    id: 'job-003',
    name: 'Quarterly Tax Provisioning',
    sourceAccount: 'OP-US-8829',
    destinationAccount: 'TX-US-9901',
    amount: 540000,
    currency: 'USD',
    cronExpression: '0 10 15 */3 *', // 10:00 AM on the 15th every 3 months
    nextRun: new Date(new Date().getFullYear(), new Date().getMonth() + 2, 15, 10, 0, 0).toISOString(),
    lastRun: new Date(Date.now() - 75 * 24 * 3600 * 1000).toISOString(),
    lastStatus: 'success',
    status: 'paused',
    templateId: 'tpl-tax-reserve',
    description: 'Quarterly tax reserve allocation based on projected earnings.'
  },
  {
    id: 'job-004',
    name: 'EU Subsidiary Operational Support',
    sourceAccount: 'OP-US-8829',
    destinationAccount: 'SUB-EU-7711',
    amount: 150000,
    currency: 'EUR',
    cronExpression: '0 8 * * 1', // 8:00 AM every Monday
    nextRun: new Date(Date.now() + 48 * 3600 * 1000).toISOString(),
    lastRun: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    lastStatus: 'failed',
    status: 'active',
    templateId: 'tpl-intercompany-eu',
    description: 'Weekly EUR liquidity injection for European operations.'
  }
];

export const INITIAL_SYSTEM_LOGS: SystemLog[] = [
  {
    id: 'log-001',
    timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
    level: 'info',
    message: 'Scheduler heartbeat active. Checking pending batch transfers...',
    category: 'scheduler'
  },
  {
    id: 'log-002',
    timestamp: new Date(Date.now() - 20 * 3600 * 1000).toISOString(),
    level: 'success',
    message: 'Job "End-of-Day Treasury Sweep" (job-001) executed successfully. Amount: $450,000.00 USD. TxRef: TXN-99281-A.',
    jobId: 'job-001',
    category: 'execution'
  },
  {
    id: 'log-003',
    timestamp: new Date(Date.now() - 20 * 3600 * 1001).toISOString(),
    level: 'info',
    message: 'Initiating transfer for Job "End-of-Day Treasury Sweep" (job-001). Source: OP-US-8829, Dest: TR-US-0019.',
    jobId: 'job-001',
    category: 'execution'
  },
  {
    id: 'log-004',
    timestamp: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
    level: 'warning',
    message: 'API connection latency detected during bank gateway handshake (3400ms). Retrying connection...',
    category: 'system'
  },
  {
    id: 'log-005',
    timestamp: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
    level: 'error',
    message: 'Job "EU Subsidiary Operational Support" (job-004) failed. Reason: Insufficient foreign exchange liquidity reserves for EUR conversion.',
    jobId: 'job-004',
    category: 'execution'
  },
  {
    id: 'log-006',
    timestamp: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
    level: 'info',
    message: 'Job "Quarterly Tax Provisioning" (job-003) was manually paused by administrator (admin@enterprisebank.com).',
    jobId: 'job-003',
    category: 'security'
  },
  {
    id: 'log-007',
    timestamp: new Date(Date.now() - 10 * 24 * 3600 * 1000).toISOString(),
    level: 'success',
    message: 'System configuration backup completed successfully. Exported to secure S3 bucket.',
    category: 'system'
  }
];

export const ACCOUNT_LIST = [
  { id: 'OP-US-8829', name: 'Primary Operating Account (USD)', balance: 5420190.50, currency: 'USD' },
  { id: 'TR-US-0019', name: 'High-Yield Treasury Account (USD)', balance: 12850000.00, currency: 'USD' },
  { id: 'PR-US-4412', name: 'Payroll Disbursement Account (USD)', balance: 150000.00, currency: 'USD' },
  { id: 'TX-US-9901', name: 'Corporate Tax Reserve (USD)', balance: 1120000.00, currency: 'USD' },
  { id: 'SUB-EU-7711', name: 'EU Subsidiary Operating (EUR)', balance: 890000.00, currency: 'EUR' },
  { id: 'INV-GLOBAL-55', name: 'Global Investment Portfolio (USD)', balance: 4300000.00, currency: 'USD' }
];