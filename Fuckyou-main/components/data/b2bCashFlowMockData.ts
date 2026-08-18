export interface AccountBalance {
  id: string;
  name: string;
  type: 'checking' | 'savings' | 'payroll' | 'money_market';
  balance: number;
  currency: string;
  accountNumber: string;
}

export interface BrokerageHolding {
  symbol: string;
  name: string;
  shares: number;
  price: number;
  value: number;
  allocation: number;
}

export interface CreditLimit {
  id: string;
  name: string;
  limit: number;
  utilized: number;
  available: number;
  apr: number;
}

export interface Transaction {
  id: string;
  date: string; // YYYY-MM-DD
  description: string;
  category: string;
  amount: number; // negative for outflow, positive for inflow
  type: 'inflow' | 'outflow';
  status: 'completed' | 'pending';
}

export interface CashFlowSummary {
  totalCash: number;
  totalBrokerage: number;
  totalCreditAvailable: number;
  totalCreditUtilized: number;
  netWorth: number;
  burnRate: number; // Average monthly net outflow
  runwayMonths: number;
}

export const mockAccounts: AccountBalance[] = [
  {
    id: 'acc-1',
    name: 'SVB Operating Checking',
    type: 'checking',
    balance: 145250.00,
    currency: 'USD',
    accountNumber: '•••• 4829'
  },
  {
    id: 'acc-2',
    name: 'Mercury High-Yield Savings',
    type: 'savings',
    balance: 450000.00,
    currency: 'USD',
    accountNumber: '•••• 8812'
  },
  {
    id: 'acc-3',
    name: 'Brex Payroll Reserve',
    type: 'payroll',
    balance: 75000.00,
    currency: 'USD',
    accountNumber: '•••• 3049'
  }
];

export const mockBrokerageHoldings: BrokerageHolding[] = [
  {
    symbol: 'VUSXX',
    name: 'Vanguard Treasury Money Market Fund',
    shares: 150000,
    price: 1.00,
    value: 150000.00,
    allocation: 50.1
  },
  {
    symbol: 'SHV',
    name: 'iShares Short Treasury Bond ETF',
    shares: 800,
    price: 110.25,
    value: 88200.00,
    allocation: 29.5
  },
  {
    symbol: 'SPY',
    name: 'SPDR S&P 500 ETF Trust',
    shares: 120,
    price: 510.50,
    value: 61260.00,
    allocation: 20.4
  }
];

export const mockCreditLimits: CreditLimit[] = [
  {
    id: 'cred-1',
    name: 'Brex Corporate Card',
    limit: 100000.00,
    utilized: 24500.00,
    available: 75500.00,
    apr: 0.00 // Paid monthly
  },
  {
    id: 'cred-2',
    name: 'Amex Business Platinum',
    limit: 250000.00,
    utilized: 45200.00,
    available: 204800.00,
    apr: 18.24
  }
];

// Helper to generate deterministic pseudo-random numbers based on a seed
function seedRandom(str: string) {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    hash = str.charCodeAt(i) + ((hash << 5) - hash);
  }
  return () => {
    const x = Math.sin(hash++) * 10000;
    return x - Math.floor(x);
  };
}

export function generate90DaysTransactions(): Transaction[] {
  const transactions: Transaction[] = [];
  const today = new Date();
  const rand = seedRandom('b2b-cashflow-seed');

  const categories = {
    inflow: ['Customer Invoice', 'Stripe Payout', 'SaaS Subscription', 'Investment Yield'],
    outflow: ['Payroll', 'Cloud Infrastructure', 'SaaS Tools', 'Marketing', 'Office Rent', 'Legal & Professional', 'Travel & Meals']
  };

  const descriptions: Record<string, string[]> = {
    'Customer Invoice': ['Acme Corp Invoice #1024', 'Globex Corp Invoice #1025', 'Initech Annual Contract', 'Umbrella Corp Q3'],
    'Stripe Payout': ['Stripe Transfer payout_84F9', 'Stripe Transfer payout_92A1', 'Stripe Transfer payout_10B2'],
    'SaaS Subscription': ['Enterprise Tier Upgrade - Hooli', 'SaaS Monthly Tier - Wayne Ent.'],
    'Investment Yield': ['VUSXX Dividend Payment', 'SHV Monthly Dividend Distribution'],
    'Payroll': ['Gusto Payroll Funding', 'Gusto Contractor Payments'],
    'Cloud Infrastructure': ['AWS Billing', 'Google Cloud Platform', 'Vercel Hosting & Bandwidth'],
    'SaaS Tools': ['Slack Technologies', 'GitHub Enterprise', 'Salesforce CRM', 'Figma Design Team', 'OpenAI API Usage'],
    'Marketing': ['Google Ads Campaign', 'Meta Ads Manager', 'LinkedIn Recruiter & Ads'],
    'Office Rent': ['WeWork Enterprise Rent', 'Regus Shared Space'],
    'Legal & Professional': ['Cooley LLP Legal Advisory', 'KPMG Tax Consulting'],
    'Travel & Meals': ['Uber for Business', 'Delta Air Lines Corporate', 'Expedia Business Travel', 'Catering - Sweetgreen']
  };

  // Generate transactions backwards from today
  for (let i = 0; i < 90; i++) {
    const currentDate = new Date();
    currentDate.setDate(today.getDate() - i);
    const dateString = currentDate.toISOString().split('T')[0];
    const dayOfMonth = currentDate.getDate();
    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday

    // 1. Monthly Rent (1st of the month)
    if (dayOfMonth === 1) {
      transactions.push({
        id: `tx-rent-${dateString}`,
        date: dateString,
        description: descriptions['Office Rent'][0],
        category: 'Office Rent',
        amount: -8500.00,
        type: 'outflow',
        status: 'completed'
      });
    }

    // 2. Bi-weekly Payroll (15th and 30th/last day of month)
    if (dayOfMonth === 15 || dayOfMonth === 28 || dayOfMonth === 30) {
      transactions.push({
        id: `tx-payroll-${dateString}`,
        date: dateString,
        description: descriptions['Payroll'][0],
        category: 'Payroll',
        amount: -32500.00,
        type: 'outflow',
        status: 'completed'
      });
    }

    // 3. Monthly Cloud Infrastructure (5th of the month)
    if (dayOfMonth === 5) {
      transactions.push({
        id: `tx-aws-${dateString}`,
        date: dateString,
        description: descriptions['Cloud Infrastructure'][0],
        category: 'Cloud Infrastructure',
        amount: -4250.00 - Math.floor(rand() * 800),
        type: 'outflow',
        status: 'completed'
      });
    }

    // 4. Weekly Marketing Spend (Every Tuesday)
    if (dayOfWeek === 2) {
      const amt = 1500 + Math.floor(rand() * 1200);
      transactions.push({
        id: `tx-mktg-${dateString}`,
        date: dateString,
        description: descriptions['Marketing'][Math.floor(rand() * descriptions['Marketing'].length)],
        category: 'Marketing',
        amount: -amt,
        type: 'outflow',
        status: 'completed'
      });
    }

    // 5. Stripe Payouts (Every Friday - Inflow)
    if (dayOfWeek === 5) {
      const amt = 18000 + Math.floor(rand() * 15000);
      transactions.push({
        id: `tx-stripe-${dateString}`,
        date: dateString,
        description: descriptions['Stripe Payout'][Math.floor(rand() * descriptions['Stripe Payout'].length)],
        category: 'Stripe Payout',
        amount: amt,
        type: 'inflow',
        status: 'completed'
      });
    }

    // 6. Random Customer Invoices (2-3 times a month)
    if (dayOfMonth === 10 || dayOfMonth === 22) {
      const amt = 25000 + Math.floor(rand() * 20000);
      transactions.push({
        id: `tx-invoice-${dateString}`,
        date: dateString,
        description: descriptions['Customer Invoice'][Math.floor(rand() * descriptions['Customer Invoice'].length)],
        category: 'Customer Invoice',
        amount: amt,
        type: 'inflow',
        status: 'completed'
      });
    }

    // 7. Daily Operational SaaS & Travel Outflows (Randomly scattered)
    if (rand() > 0.6) {
      const isSaaS = rand() > 0.5;
      const category = isSaaS ? 'SaaS Tools' : 'Travel & Meals';
      const descList = descriptions[category];
      const description = descList[Math.floor(rand() * descList.length)];
      const amount = isSaaS ? -(120 + Math.floor(rand() * 800)) : -(45 + Math.floor(rand() * 350));

      transactions.push({
        id: `tx-rand-${i}-${dateString}`,
        date: dateString,
        description,
        category,
        amount,
        type: 'outflow',
        status: 'completed'
      });
    }
  }

  // Sort transactions chronologically (newest first)
  return transactions.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());
}

export function getCashFlowSummary(transactions: Transaction[]): CashFlowSummary {
  const totalCash = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  const totalBrokerage = mockBrokerageHoldings.reduce((sum, hold) => sum + hold.value, 0);
  const totalCreditAvailable = mockCreditLimits.reduce((sum, cred) => sum + cred.available, 0);
  const totalCreditUtilized = mockCreditLimits.reduce((sum, cred) => sum + cred.utilized, 0);
  const netWorth = totalCash + totalBrokerage - totalCreditUtilized;

  // Calculate Burn Rate (Average monthly net outflow over the last 90 days)
  const totalOutflow = Math.abs(
    transactions
      .filter(tx => tx.type === 'outflow')
      .reduce((sum, tx) => sum + tx.amount, 0)
  );
  const totalInflow = transactions
    .filter(tx => tx.type === 'inflow')
    .reduce((sum, tx) => sum + tx.amount, 0);

  const netOutflow = totalOutflow - totalInflow;
  // Average monthly burn rate (90 days ~ 3 months)
  const burnRate = netOutflow > 0 ? netOutflow / 3 : 0;
  const runwayMonths = burnRate > 0 ? (totalCash + totalBrokerage) / burnRate : Infinity;

  return {
    totalCash,
    totalBrokerage,
    totalCreditAvailable,
    totalCreditUtilized,
    netWorth,
    burnRate,
    runwayMonths
  };
}

export interface DailyBalancePoint {
  date: string;
  cash: number;
  brokerage: number;
  creditUtilized: number;
  netPosition: number;
}

export function generateDailyBalanceHistory(transactions: Transaction[]): DailyBalancePoint[] {
  const history: DailyBalancePoint[] = [];
  const today = new Date();
  
  // Start with current balances
  let currentCash = mockAccounts.reduce((sum, acc) => sum + acc.balance, 0);
  let currentBrokerage = mockBrokerageHoldings.reduce((sum, hold) => sum + hold.value, 0);
  let currentCredit = mockCreditLimits.reduce((sum, cred) => sum + cred.utilized, 0);

  // Sort transactions newest to oldest to backtrack balances
  const sortedTx = [...transactions].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  // Group transactions by date
  const txByDate: Record<string, Transaction[]> = {};
  sortedTx.forEach(tx => {
    if (!txByDate[tx.date]) {
      txByDate[tx.date] = [];
    }
    txByDate[tx.date].push(tx);
  });

  // Backtrack 90 days
  for (let i = 0; i < 90; i++) {
    const currentDate = new Date();
    currentDate.setDate(today.getDate() - i);
    const dateString = currentDate.toISOString().split('T')[0];

    // Add current state to history
    history.push({
      date: dateString,
      cash: Math.round(currentCash * 100) / 100,
      brokerage: Math.round(currentBrokerage * 100) / 100,
      creditUtilized: Math.round(currentCredit * 100) / 100,
      netPosition: Math.round((currentCash + currentBrokerage - currentCredit) * 100) / 100
    });

    // Reverse the transactions of this day to get the previous day's starting balance
    const dayTxs = txByDate[dateString] || [];
    dayTxs.forEach(tx => {
      if (tx.type === 'inflow') {
        // If it was an inflow, previous balance was lower
        currentCash -= tx.amount;
      } else {
        // If it was an outflow, previous balance was higher
        // For simplicity, assume 30% of outflows went through credit cards, 70% through cash
        if (tx.category === 'SaaS Tools' || tx.category === 'Travel & Meals' || tx.category === 'Marketing') {
          currentCredit -= Math.abs(tx.amount);
        } else {
          currentCash += Math.abs(tx.amount);
        }
      }
    });

    // Add minor fluctuations to brokerage to simulate market movements
    const rand = seedRandom(`brokerage-fluct-${dateString}`);
    currentBrokerage -= (rand() - 0.48) * 500; // slight upward bias historically
  }

  // Return chronological order (oldest first) for charting
  return history.reverse();
}

export interface CategoryBreakdown {
  category: string;
  amount: number;
  percentage: number;
}

export function getCategoryBreakdown(transactions: Transaction[], type: 'inflow' | 'outflow'): CategoryBreakdown[] {
  const filtered = transactions.filter(tx => tx.type === type);
  const total = filtered.reduce((sum, tx) => sum + Math.abs(tx.amount), 0);

  const grouped: Record<string, number> = {};
  filtered.forEach(tx => {
    const amt = Math.abs(tx.amount);
    grouped[tx.category] = (grouped[tx.category] || 0) + amt;
  });

  return Object.entries(grouped)
    .map(([category, amount]) => ({
      category,
      amount: Math.round(amount * 100) / 100,
      percentage: total > 0 ? Math.round((amount / total) * 1000) / 10 : 0
    }))
    .sort((a, b) => b.amount - a.amount);
}

export interface ForecastPoint {
  date: string;
  projectedCash: number;
  isProjected: boolean;
}

export function generate30DayForecast(currentCash: number, transactions: Transaction[]): ForecastPoint[] {
  const forecast: ForecastPoint[] = [];
  const today = new Date();

  // Calculate average daily inflow and outflow (excluding large anomalies)
  const inflows = transactions.filter(tx => tx.type === 'inflow' && tx.amount < 30000);
  const outflows = transactions.filter(tx => tx.type === 'outflow' && Math.abs(tx.amount) < 20000);

  const avgDailyInflow = inflows.reduce((sum, tx) => sum + tx.amount, 0) / 90;
  const avgDailyOutflow = Math.abs(outflows.reduce((sum, tx) => sum + tx.amount, 0)) / 90;

  let runningCash = currentCash;

  // Generate 30 days into the future
  for (let i = 1; i <= 30; i++) {
    const futureDate = new Date();
    futureDate.setDate(today.getDate() + i);
    const dateString = futureDate.toISOString().split('T')[0];
    const dayOfMonth = futureDate.getDate();

    // Apply average daily organic flow
    runningCash += (avgDailyInflow - avgDailyOutflow);

    // Apply scheduled large events
    // 1. Rent on the 1st
    if (dayOfMonth === 1) {
      runningCash -= 8500.00;
    }
    // 2. Payroll on 15th and 30th
    if (dayOfMonth === 15 || dayOfMonth === 30) {
      runningCash -= 32500.00;
    }
    // 3. Large expected customer invoice on the 10th
    if (dayOfMonth === 10) {
      runningCash += 35000.00;
    }

    forecast.push({
      date: dateString,
      projectedCash: Math.round(runningCash * 100) / 100,
      isProjected: true
    });
  }

  return forecast;
}