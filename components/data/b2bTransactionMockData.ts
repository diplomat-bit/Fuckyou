export interface B2BTransaction {
  id: string;
  timestamp: string;
  amount: number;
  merchant: string;
  mcc: string;
  category: string;
  status: 'Approved' | 'Declined' | 'Pending';
  cardholder: string;
  department: string;
  accountId: string;
  location: string;
  isAnomaly: boolean;
  anomalyType: 'Duplicate' | 'HighValue' | 'Velocity' | 'None';
  description?: string;
}

export interface CorporateAccount {
  id: string;
  name: string;
  department: string;
  budget: number;
  spent: number;
  cardholders: string[];
}

export const MCC_MAPPINGS: Record<string, { category: string; description: string }> = {
  '5045': { category: 'Technology', description: 'Computers, Peripherals, and Software' },
  '7372': { category: 'Technology', description: 'Computer Programming and Data Processing' },
  '4816': { category: 'Technology', description: 'Computer Network/Information Services' },
  '7399': { category: 'Business Services', description: 'Business Services Not Elsewhere Classified' },
  '8931': { category: 'Professional Services', description: 'Accounting, Auditing, and Bookkeeping' },
  '7311': { category: 'Marketing', description: 'Advertising Services' },
  '5111': { category: 'Office Supplies', description: 'Stationery, Office Supplies, Printing Writing Paper' },
  '4215': { category: 'Logistics', description: 'Courier Services (e.g., FedEx, UPS)' },
  '3000': { category: 'Travel', description: 'Airlines' },
  '7011': { category: 'Travel', description: 'Lodging/Hotels' },
};

export const MERCHANTS_BY_MCC: Record<string, string[]> = {
  '5045': ['CDW Direct', 'SHI International', 'Dell Business', 'Apple Enterprise'],
  '7372': ['AWS Cloud Services', 'Google Cloud Platform', 'Microsoft Azure', 'Salesforce Inc.', 'Slack Technologies', 'Zoom Video Communications', 'GitHub Enterprise', 'Figma Inc.'],
  '4816': ['Cloudflare', 'GoDaddy', 'DigitalOcean', 'Heroku'],
  '7399': ['WeWork', 'Gartner Research', 'McKinsey & Co', 'Accenture'],
  '8931': ['Deloitte LLP', 'PwC Advisory', 'Ernst & Young', 'KPMG'],
  '7311': ['Google Ads', 'Meta Ads', 'LinkedIn Marketing', 'HubSpot Inc.'],
  '5111': ['Staples Advantage', 'Office Depot', 'Uline'],
  '4215': ['FedEx Corporate', 'UPS Business', 'DHL Express'],
  '3000': ['Delta Air Lines', 'United Airlines', 'American Airlines'],
  '7011': ['Marriott Corporate', 'Hilton Business', 'Hyatt Hotels'],
};

export const CORPORATE_ACCOUNTS: CorporateAccount[] = [
  {
    id: 'ACC-ENG-001',
    name: 'Engineering Infrastructure',
    department: 'Engineering',
    budget: 500000,
    spent: 320000,
    cardholders: ['Alex Rivera', 'Sarah Chen', 'Marcus Johnson', 'Elena Rostova']
  },
  {
    id: 'ACC-MKT-002',
    name: 'Global Growth Marketing',
    department: 'Marketing',
    budget: 250000,
    spent: 185000,
    cardholders: ['Emily Watson', 'David Kim', 'Sofia Al-Jamil']
  },
  {
    id: 'ACC-OPS-003',
    name: 'Corporate Operations',
    department: 'Operations',
    budget: 150000,
    spent: 95000,
    cardholders: ['James Smith', 'Linda Martinez', 'Robert Chen']
  },
  {
    id: 'ACC-HR-004',
    name: 'People & Culture',
    department: 'Human Resources',
    budget: 80000,
    spent: 42000,
    cardholders: ['Chloe Dupont', 'William Vance']
  },
  {
    id: 'ACC-EXEC-005',
    name: 'Executive & Strategy',
    department: 'Executive',
    budget: 100000,
    spent: 60000,
    cardholders: ['Elizabeth Holmes', 'Vikram Patel']
  }
];

const LOCATIONS = [
  'San Francisco, CA',
  'New York, NY',
  'Seattle, WA',
  'Austin, TX',
  'Dublin, Ireland',
  'London, UK',
  'Online',
  'Chicago, IL'
];

export interface GeneratorOptions {
  startDate?: Date;
  endDate?: Date;
  duplicateRate?: number; // e.g., 0.03 for 3%
  highValueRate?: number; // e.g., 0.02 for 2%
  velocityRate?: number;  // e.g., 0.02 for 2%
}

// Helper to generate a random ID
const generateTxId = (): string => {
  return 'TXN-' + Math.random().toString(36).substring(2, 11).toUpperCase();
};

// Helper to get random element
const getRandomElement = <T>(arr: T[]): T => {
  return arr[Math.floor(Math.random() * arr.length)];
};

// Helper to generate a random amount based on MCC
const getRandomAmount = (mcc: string): number => {
  switch (mcc) {
    case '7372': // Cloud/SaaS (often high for B2B)
      return parseFloat((Math.random() * 12000 + 500).toFixed(2));
    case '5045': // Hardware
      return parseFloat((Math.random() * 8000 + 300).toFixed(2));
    case '8931': // Professional Services
      return parseFloat((Math.random() * 25000 + 2000).toFixed(2));
    case '7311': // Marketing
      return parseFloat((Math.random() * 15000 + 1000).toFixed(2));
    case '5111': // Office Supplies
      return parseFloat((Math.random() * 450 + 10).toFixed(2));
    case '4215': // Logistics
      return parseFloat((Math.random() * 1200 + 50).toFixed(2));
    case '3000': // Travel
    case '7011':
      return parseFloat((Math.random() * 2500 + 150).toFixed(2));
    default:
      return parseFloat((Math.random() * 1000 + 20).toFixed(2));
  }
};

export const generateMockTransactions = (
  count: number,
  options: GeneratorOptions = {}
): B2BTransaction[] => {
  const {
    startDate = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
    endDate = new Date(),
    duplicateRate = 0.03,
    highValueRate = 0.02,
    velocityRate = 0.02,
  } = options;

  const transactions: B2BTransaction[] = [];
  const startMs = startDate.getTime();
  const endMs = endDate.getTime();

  let i = 0;
  while (i < count) {
    const randomTime = new Date(startMs + Math.random() * (endMs - startMs));
    const account = getRandomElement(CORPORATE_ACCOUNTS);
    const cardholder = getRandomElement(account.cardholders);
    const mcc = getRandomElement(Object.keys(MCC_MAPPINGS));
    const category = MCC_MAPPINGS[mcc].category;
    const merchant = getRandomElement(MERCHANTS_BY_MCC[mcc]);
    const amount = getRandomAmount(mcc);
    const location = getRandomElement(LOCATIONS);
    const status = Math.random() > 0.05 ? 'Approved' : 'Declined';

    // Base transaction
    const baseTx: B2BTransaction = {
      id: generateTxId(),
      timestamp: randomTime.toISOString(),
      amount,
      merchant,
      mcc,
      category,
      status,
      cardholder,
      department: account.department,
      accountId: account.id,
      location,
      isAnomaly: false,
      anomalyType: 'None',
    };

    const roll = Math.random();

    // 1. Inject Duplicate Charge Anomaly
    if (roll < duplicateRate && i < count - 1) {
      transactions.push(baseTx);
      i++;

      // Create duplicate transaction (same cardholder, merchant, amount, within 1-30 seconds)
      const duplicateTime = new Date(randomTime.getTime() + Math.floor(Math.random() * 30000) + 1000);
      const duplicateTx: B2BTransaction = {
        ...baseTx,
        id: generateTxId(),
        timestamp: duplicateTime.toISOString(),
        isAnomaly: true,
        anomalyType: 'Duplicate',
        description: 'Identical charge amount detected at the same merchant within a short timeframe.',
        status: Math.random() > 0.3 ? 'Approved' : 'Declined' // Often flagged/declined
      };
      transactions.push(duplicateTx);
      i++;
      continue;
    }

    // 2. Inject High-Value Transfer Anomaly
    if (roll >= duplicateRate && roll < duplicateRate + highValueRate) {
      const highValueAmount = parseFloat((Math.random() * 150000 + 75000).toFixed(2));
      const highValueTx: B2BTransaction = {
        ...baseTx,
        amount: highValueAmount,
        isAnomaly: true,
        anomalyType: 'HighValue',
        description: `Transaction amount of $${highValueAmount.toLocaleString()} significantly exceeds standard department limits.`,
        status: Math.random() > 0.4 ? 'Approved' : 'Pending'
      };
      transactions.push(highValueTx);
      i++;
      continue;
    }

    // 3. Inject Velocity Anomaly (Rapid successive transactions)
    if (roll >= duplicateRate + highValueRate && roll < duplicateRate + highValueRate + velocityRate && i < count - 3) {
      transactions.push(baseTx);
      i++;

      // Generate 3 rapid successive transactions within 2 minutes
      const velocityMerchants = ['AWS Cloud Services', 'Google Ads', 'GitHub Enterprise', 'Staples Advantage'];
      let currentTimestamp = randomTime.getTime();

      for (let v = 0; v < 3; v++) {
        currentTimestamp += Math.floor(Math.random() * 45000) + 5000; // 5 to 50 seconds apart
        const vMerchant = getRandomElement(velocityMerchants);
        const vMcc = Object.keys(MERCHANTS_BY_MCC).find(key => MERCHANTS_BY_MCC[key].includes(vMerchant)) || '7372';
        const vAmount = parseFloat((Math.random() * 5000 + 1000).toFixed(2));

        const velocityTx: B2BTransaction = {
          id: generateTxId(),
          timestamp: new Date(currentTimestamp).toISOString(),
          amount: vAmount,
          merchant: vMerchant,
          mcc: vMcc,
          category: MCC_MAPPINGS[vMcc]?.category || 'Technology',
          status: v === 2 ? 'Declined' : 'Approved', // Last one often gets declined
          cardholder,
          department: account.department,
          accountId: account.id,
          location: getRandomElement(LOCATIONS),
          isAnomaly: true,
          anomalyType: 'Velocity',
          description: 'Multiple high-frequency corporate card transactions detected in rapid succession.'
        };
        transactions.push(velocityTx);
        i++;
      }
      continue;
    }

    // Standard Transaction
    transactions.push(baseTx);
    i++;
  }

  // Sort transactions chronologically
  return transactions.sort((a, b) => new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime());
};

/**
 * Generates a summary of anomalies for dashboard metrics
 */
export const getAnomalySummary = (transactions: B2BTransaction[]) => {
  const summary = {
    total: transactions.length,
    anomalies: 0,
    duplicates: 0,
    highValue: 0,
    velocity: 0,
    approvedAnomalies: 0,
    pendingAnomalies: 0,
    declinedAnomalies: 0,
  };

  transactions.forEach(tx => {
    if (tx.isAnomaly) {
      summary.anomalies++;
      if (tx.anomalyType === 'Duplicate') summary.duplicates++;
      if (tx.anomalyType === 'HighValue') summary.highValue++;
      if (tx.anomalyType === 'Velocity') summary.velocity++;
      
      if (tx.status === 'Approved') summary.approvedAnomalies++;
      if (tx.status === 'Pending') summary.pendingAnomalies++;
      if (tx.status === 'Declined') summary.declinedAnomalies++;
    }
  });

  return summary;
};