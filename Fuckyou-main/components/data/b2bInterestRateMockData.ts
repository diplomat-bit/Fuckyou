export type AccountType =
  | 'checking'
  | 'savings'
  | 'hys'
  | 'credit_card'
  | 'loan'
  | 'line_of_credit';

export type AccountCategory = 'asset' | 'liability';

export interface CorporateAccount {
  id: string;
  name: string;
  accountNumber: string;
  balance: number;
  currency: string;
  interestRate: number; // APY for assets, APR for liabilities
  type: AccountType;
  category: AccountCategory;
  status: 'active' | 'pending' | 'suspended';
  accruedInterestYTD: number; // Interest earned (assets) or paid (liabilities) YTD
  nextPaymentDate?: string; // For liabilities
  minimumPayment?: number; // For liabilities
  limit?: number; // For credit cards / lines of credit
  institutionName: string;
  lastUpdated: string;
}

export interface B2BInterestRateResponse {
  companyId: string;
  companyName: string;
  lastUpdated: string;
  assets: {
    totalBalance: number;
    weightedAverageAPY: number;
    accounts: CorporateAccount[];
  };
  liabilities: {
    totalBalance: number;
    weightedAverageAPR: number;
    accounts: CorporateAccount[];
  };
}

export const b2bAccountsMockData: CorporateAccount[] = [
  // ASSETS
  {
    id: 'acc-01',
    name: 'Primary Operating Checking',
    accountNumber: '•••• 4829',
    balance: 1250000.00,
    currency: 'USD',
    interestRate: 0.10,
    type: 'checking',
    category: 'asset',
    status: 'active',
    accruedInterestYTD: 833.33,
    institutionName: 'Silicon Valley Commerce Bank',
    lastUpdated: '2023-10-24T08:30:00Z'
  },
  {
    id: 'acc-02',
    name: 'Payroll Reserve Savings',
    accountNumber: '•••• 9102',
    balance: 450000.00,
    currency: 'USD',
    interestRate: 1.50,
    type: 'savings',
    category: 'asset',
    status: 'active',
    accruedInterestYTD: 4500.00,
    institutionName: 'Silicon Valley Commerce Bank',
    lastUpdated: '2023-10-24T08:30:00Z'
  },
  {
    id: 'acc-03',
    name: 'Treasury High-Yield Savings (HYS)',
    accountNumber: '•••• 3381',
    balance: 4800000.00,
    currency: 'USD',
    interestRate: 5.25,
    type: 'hys',
    category: 'asset',
    status: 'active',
    accruedInterestYTD: 168000.00,
    institutionName: 'Apex Clearing & Trust',
    lastUpdated: '2023-10-24T08:15:00Z'
  },
  // LIABILITIES
  {
    id: 'acc-04',
    name: 'Corporate Platinum Credit Card',
    accountNumber: '•••• 5521',
    balance: 85400.00,
    currency: 'USD',
    interestRate: 14.99,
    type: 'credit_card',
    category: 'liability',
    status: 'active',
    accruedInterestYTD: 8532.10,
    nextPaymentDate: '2023-11-15',
    minimumPayment: 2500.00,
    limit: 250000.00,
    institutionName: 'Apex Clearing & Trust',
    lastUpdated: '2023-10-24T08:15:00Z'
  },
  {
    id: 'acc-05',
    name: 'Equipment Term Loan',
    accountNumber: '•••• 0048',
    balance: 620000.00,
    currency: 'USD',
    interestRate: 6.75,
    type: 'loan',
    category: 'liability',
    status: 'active',
    accruedInterestYTD: 27900.00,
    nextPaymentDate: '2023-11-01',
    minimumPayment: 12450.00,
    institutionName: 'Global Industrial Bank',
    lastUpdated: '2023-10-23T17:00:00Z'
  },
  {
    id: 'acc-06',
    name: 'Revolving Line of Credit',
    accountNumber: '•••• 8812',
    balance: 150000.00,
    currency: 'USD',
    interestRate: 8.25,
    type: 'line_of_credit',
    category: 'liability',
    status: 'active',
    accruedInterestYTD: 9281.25,
    nextPaymentDate: '2023-11-10',
    minimumPayment: 1031.25,
    limit: 1000000.00,
    institutionName: 'Silicon Valley Commerce Bank',
    lastUpdated: '2023-10-24T08:30:00Z'
  }
];

export const b2bInterestRateMockResponse: B2BInterestRateResponse = {
  companyId: 'co_acme_corp_99',
  companyName: 'Acme Global Technologies Inc.',
  lastUpdated: '2023-10-24T09:00:00Z',
  assets: {
    totalBalance: 6500000.00,
    weightedAverageAPY: 4.00, // Calculated: ((1.25M * 0.1) + (0.45M * 1.5) + (4.8M * 5.25)) / 6.5M
    accounts: b2bAccountsMockData.filter(acc => acc.category === 'asset')
  },
  liabilities: {
    totalBalance: 855400.00,
    weightedAverageAPR: 7.84, // Calculated: ((85.4K * 14.99) + (620K * 6.75) + (150K * 8.25)) / 855.4K
    accounts: b2bAccountsMockData.filter(acc => acc.category === 'liability')
  }
};