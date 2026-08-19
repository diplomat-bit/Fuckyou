

// --- CONSOLIDATED FROM: ./components/data/b2bLiquidityMockData.ts ---

export interface Account {
  id: string;
  name: string;
  type: 'operating' | 'payroll' | 'tax' | 'investment';
  balance: number;
  currency: string;
  lastUpdated: string;
}

export type CashFlowCategory =
  | 'SaaS Subscription'
  | 'Enterprise Contract'
  | 'Payroll'
  | 'Cloud Infrastructure'
  | 'Marketing'
  | 'Office & Rent'
  | 'Tax Payment'
  | 'Treasury Yield'
  | 'Professional Services'
  | 'Miscellaneous'
  | 'Internal Transfer';

export interface CashFlow {
  id: string;
  date: string; // YYYY-MM-DD
  amount: number;
  category: CashFlowCategory;
  direction: 'inflow' | 'outflow';
  description: string;
  status: 'historical' | 'projected';
  accountId: string;
  scenario: 'baseline' | 'optimistic' | 'pessimistic';
}

export interface DailyBalance {
  date: string;
  operating: number;
  payroll: number;
  tax: number;
  investment: number;
  total: number;
  inflow: number;
  outflow: number;
  netFlow: number;
}

export interface LiquidityForecastSummary {
  currentBalance: number;
  projected30d: {
    baseline: number;
    optimistic: number;
    pessimistic: number;
  };
  projected90d: {
    baseline: number;
    optimistic: number;
    pessimistic: number;
  };
  runwayMonths: number;
  burnRate: number;
}

// Deterministic pseudo-random generator to keep data stable
function createRandom(seed: number) {
  let s = seed;
  return function () {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

export function generateLiquidityData(): {
  accounts: Account[];
  cashFlows: CashFlow[];
  dailyBalances: DailyBalance[];
  summary: LiquidityForecastSummary;
} {
  const today = new Date();
  const random = createRandom(42); // Fixed seed for consistent generation

  // Helper to format date
  const formatDate = (date: Date): string => {
    return date.toISOString().split('T')[0];
  };

  // 1. Initialize Accounts (as of 180 days ago)
  let operatingBal = 850000;
  let payrollBal = 150000;
  let taxBal = 200000;
  let investmentBal = 3000000;

  const cashFlows: CashFlow[] = [];
  const dailyBalances: DailyBalance[] = [];

  // Generate 180 days of history and 90 days of forecast
  const totalDays = 270;
  const historyDays = 180;

  for (let i = 0; i < totalDays; i++) {
    const currentDate = new Date(today);
    currentDate.setDate(today.getDate() - historyDays + i);
    const dateStr = formatDate(currentDate);
    const isProjected = i >= historyDays;

    const dayOfWeek = currentDate.getDay(); // 0 = Sunday, 6 = Saturday
    const dayOfMonth = currentDate.getDate();
    const month = currentDate.getMonth();

    let dailyInflow = 0;
    let dailyOutflow = 0;

    // Scenarios only apply to projected data. For history, we just write one path.
    // To support multi-scenario visualization, we generate baseline flows,
    // and we can dynamically scale them in the UI or generate alternative scenario flows here.
    const scenarios: ('baseline' | 'optimistic' | 'pessimistic')[] = isProjected
      ? ['baseline', 'optimistic', 'pessimistic']
      : ['baseline'];

    scenarios.forEach((scenario) => {
      let tempOperating = operatingBal;
      let tempPayroll = payrollBal;
      let tempTax = taxBal;
      let tempInvestment = investmentBal;

      let multiplier = 1.0;
      if (isProjected) {
        if (scenario === 'optimistic') multiplier = 1.2;
        if (scenario === 'pessimistic') multiplier = 0.8;
      }

      // --- INFLOWS ---
      // 1. SaaS Subscriptions (Daily, lower on weekends)
      const saasBase = dayOfWeek === 0 || dayOfWeek === 6 ? 5000 : 22000;
      const saasAmount = Math.round((saasBase + random() * 8000) * (isProjected ? multiplier : 1));
      if (scenario === 'baseline' || isProjected) {
        cashFlows.push({
          id: `saas-${dateStr}-${scenario}`,
          date: dateStr,
          amount: saasAmount,
          category: 'SaaS Subscription',
          direction: 'inflow',
          description: 'Stripe Subscription Payout',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });
        if (scenario === 'baseline') dailyInflow += saasAmount;
      }

      // 2. Enterprise Contracts (Sporadic, 2-3 times a month)
      if (dayOfMonth === 10 || dayOfMonth === 25) {
        const entAmount = Math.round((120000 + random() * 60000) * (isProjected ? multiplier : 1));
        cashFlows.push({
          id: `enterprise-${dateStr}-${scenario}`,
          date: dateStr,
          amount: entAmount,
          category: 'Enterprise Contract',
          direction: 'inflow',
          description: 'Acme Corp Annual License',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });
        if (scenario === 'baseline') dailyInflow += entAmount;
      }

      // 3. Treasury Yield (Monthly, 28th)
      if (dayOfMonth === 28) {
        const yieldAmount = Math.round(8500 + random() * 1500);
        cashFlows.push({
          id: `yield-${dateStr}-${scenario}`,
          date: dateStr,
          amount: yieldAmount,
          category: 'Treasury Yield',
          direction: 'inflow',
          description: 'Apex Treasury Yield Dist',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-investment',
          scenario,
        });
        if (scenario === 'baseline') dailyInflow += yieldAmount;
      }

      // --- OUTFLOWS ---
      // 1. Payroll (Bi-weekly, every second Friday)
      const isPayrollDay = i % 14 === 4;
      if (isPayrollDay) {
        const payrollAmount = Math.round(165000 * (isProjected && scenario === 'pessimistic' ? 1.05 : 1));
        
        // Internal Transfer from Operating to Payroll
        cashFlows.push({
          id: `transfer-payroll-${dateStr}-${scenario}`,
          date: dateStr,
          amount: payrollAmount,
          category: 'Internal Transfer',
          direction: 'outflow',
          description: 'Funding Payroll Account',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });

        cashFlows.push({
          id: `transfer-payroll-in-${dateStr}-${scenario}`,
          date: dateStr,
          amount: payrollAmount,
          category: 'Internal Transfer',
          direction: 'inflow',
          description: 'Payroll Funding Received',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-payroll',
          scenario,
        });

        // Actual Payroll Outflow
        cashFlows.push({
          id: `payroll-out-${dateStr}-${scenario}`,
          date: dateStr,
          amount: payrollAmount,
          category: 'Payroll',
          direction: 'outflow',
          description: 'Gusto Payroll Run',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-payroll',
          scenario,
        });

        if (scenario === 'baseline') dailyOutflow += payrollAmount;
      }

      // 2. Cloud Infrastructure (Monthly, 5th)
      if (dayOfMonth === 5) {
        const awsAmount = Math.round((38000 + random() * 7000) * (isProjected && scenario === 'pessimistic' ? 1.1 : 1));
        cashFlows.push({
          id: `aws-${dateStr}-${scenario}`,
          date: dateStr,
          amount: awsAmount,
          category: 'Cloud Infrastructure',
          direction: 'outflow',
          description: 'Amazon Web Services',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });
        if (scenario === 'baseline') dailyOutflow += awsAmount;
      }

      // 3. Marketing (Weekly, Wednesdays)
      if (dayOfWeek === 3) {
        const marketingAmount = Math.round((15000 + random() * 5000) * (isProjected ? multiplier : 1));
        cashFlows.push({
          id: `marketing-${dateStr}-${scenario}`,
          date: dateStr,
          amount: marketingAmount,
          category: 'Marketing',
          direction: 'outflow',
          description: 'Google/Meta Ads Billing',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });
        if (scenario === 'baseline') dailyOutflow += marketingAmount;
      }

      // 4. Office & Rent (Monthly, 1st)
      if (dayOfMonth === 1) {
        const rentAmount = 24000;
        cashFlows.push({
          id: `rent-${dateStr}-${scenario}`,
          date: dateStr,
          amount: rentAmount,
          category: 'Office & Rent',
          direction: 'outflow',
          description: 'WeWork HQ Rent',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });
        if (scenario === 'baseline') dailyOutflow += rentAmount;
      }

      // 5. Tax Payments (Quarterly: March, June, Sept, Dec 15th)
      if (dayOfMonth === 15 && [2, 5, 8, 11].includes(month)) {
        const taxAmount = 85000;
        cashFlows.push({
          id: `tax-pay-${dateStr}-${scenario}`,
          date: dateStr,
          amount: taxAmount,
          category: 'Tax Payment',
          direction: 'outflow',
          description: 'IRS Quarterly Estimated Tax',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-tax',
          scenario,
        });
        if (scenario === 'baseline') dailyOutflow += taxAmount;

        // Monthly tax reserve transfer (10th of every month)
      } else if (dayOfMonth === 10) {
        const taxReserve = 28000;
        cashFlows.push({
          id: `tax-reserve-out-${dateStr}-${scenario}`,
          date: dateStr,
          amount: taxReserve,
          category: 'Internal Transfer',
          direction: 'outflow',
          description: 'Tax Reserve Allocation',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });
        cashFlows.push({
          id: `tax-reserve-in-${dateStr}-${scenario}`,
          date: dateStr,
          amount: taxReserve,
          category: 'Internal Transfer',
          direction: 'inflow',
          description: 'Tax Reserve Allocation',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-tax',
          scenario,
        });
      }

      // 6. Professional Services (Monthly, 20th)
      if (dayOfMonth === 20) {
        const profAmount = Math.round(12000 + random() * 4000);
        cashFlows.push({
          id: `prof-services-${dateStr}-${scenario}`,
          date: dateStr,
          amount: profAmount,
          category: 'Professional Services',
          direction: 'outflow',
          description: 'Legal & Accounting Retainer',
          status: isProjected ? 'projected' : 'historical',
          accountId: 'acc-operating',
          scenario,
        });
        if (scenario === 'baseline') dailyOutflow += profAmount;
      }

      // 7. Miscellaneous (Daily operational drip)
      const miscAmount = Math.round((2000 + random() * 3000) * (isProjected && scenario === 'pessimistic' ? 1.15 : 1));
      cashFlows.push({
        id: `misc-${dateStr}-${scenario}`,
        date: dateStr,
        amount: miscAmount,
        category: 'Miscellaneous',
        direction: 'outflow',
        description: 'SaaS Tools & Office Expenses',
        status: isProjected ? 'projected' : 'historical',
        accountId: 'acc-operating',
        scenario,
      });
      if (scenario === 'baseline') dailyOutflow += miscAmount;
    });

    // Apply baseline flows to actual running balances
    const dayFlows = cashFlows.filter((cf) => cf.date === dateStr && cf.scenario === 'baseline');
    dayFlows.forEach((flow) => {
      const modifier = flow.direction === 'inflow' ? 1 : -1;
      const change = flow.amount * modifier;

      if (flow.accountId === 'acc-operating') operatingBal += change;
      if (flow.accountId === 'acc-payroll') payrollBal += change;
      if (flow.accountId === 'acc-tax') taxBal += change;
      if (flow.accountId === 'acc-investment') investmentBal += change;
    });

    // Record daily balance snapshot (using baseline)
    dailyBalances.push({
      date: dateStr,
      operating: operatingBal,
      payroll: payrollBal,
      tax: taxBal,
      investment: investmentBal,
      total: operatingBal + payrollBal + taxBal + investmentBal,
      inflow: dailyInflow,
      outflow: dailyOutflow,
      netFlow: dailyInflow - dailyOutflow,
    });
  }

  // 2. Build Accounts List with Current Balances (at index 180 / "today")
  const todayBalance = dailyBalances[historyDays - 1];
  const accounts: Account[] = [
    {
      id: 'acc-operating',
      name: 'SVB Operating Account',
      type: 'operating',
      balance: todayBalance.operating,
      currency: 'USD',
      lastUpdated: formatDate(today),
    },
    {
      id: 'acc-payroll',
      name: 'Brex Payroll Account',
      type: 'payroll',
      balance: todayBalance.payroll,
      currency: 'USD',
      lastUpdated: formatDate(today),
    },
    {
      id: 'acc-tax',
      name: 'Mercury Tax Reserve',
      type: 'tax',
      balance: todayBalance.tax,
      currency: 'USD',
      lastUpdated: formatDate(today),
    },
    {
      id: 'acc-investment',
      name: 'Apex Treasury Yield Fund',
      type: 'investment',
      balance: todayBalance.investment,
      currency: 'USD',
      lastUpdated: formatDate(today),
    },
  ];

  // 3. Calculate Summary Metrics
  const currentBalance = todayBalance.total;

  // Helper to get projected balance at specific day offset
  const getProjectedBalance = (daysAhead: number, scenario: 'baseline' | 'optimistic' | 'pessimistic'): number => {
    let op = todayBalance.operating;
    let pay = todayBalance.payroll;
    let tax = todayBalance.tax;
    let inv = todayBalance.investment;

    for (let i = 1; i <= daysAhead; i++) {
      const targetDate = new Date(today);
      targetDate.setDate(today.getDate() + i);
      const dateStr = formatDate(targetDate);

      const dayFlows = cashFlows.filter((cf) => cf.date === dateStr && cf.scenario === scenario);
      dayFlows.forEach((flow) => {
        const modifier = flow.direction === 'inflow' ? 1 : -1;
        const change = flow.amount * modifier;

        if (flow.accountId === 'acc-operating') op += change;
        if (flow.accountId === 'acc-payroll') pay += change;
        if (flow.accountId === 'acc-tax') tax += change;
        if (flow.accountId === 'acc-investment') inv += change;
      });
    }
    return op + pay + tax + inv;
  };

  // Calculate average monthly burn rate over the last 90 days of history
  const last90DaysHistory = dailyBalances.slice(historyDays - 90, historyDays);
  const totalOutflow90d = last90DaysHistory.reduce((sum, day) => sum + day.outflow, 0);
  const burnRate = Math.round(totalOutflow90d / 3); // Monthly average

  const runwayMonths = burnRate > 0 ? parseFloat((currentBalance / burnRate).toFixed(1)) : 99;

  const summary: LiquidityForecastSummary = {
    currentBalance,
    projected30d: {
      baseline: getProjectedBalance(30, 'baseline'),
      optimistic: getProjectedBalance(30, 'optimistic'),
      pessimistic: getProjectedBalance(30, 'pessimistic'),
    },
    projected90d: {
      baseline: getProjectedBalance(90, 'baseline'),
      optimistic: getProjectedBalance(90, 'optimistic'),
      pessimistic: getProjectedBalance(90, 'pessimistic'),
    },
    runwayMonths,
    burnRate,
  };

  return {
    accounts,
    cashFlows: cashFlows.filter((cf) => cf.category !== 'Internal Transfer'), // Filter out internal transfers for clean cash flow lists
    dailyBalances,
    summary,
  };
}

export const staticConfig = {
  categories: [
    { name: 'SaaS Subscription', color: '#10B981', type: 'inflow' },
    { name: 'Enterprise Contract', color: '#059669', type: 'inflow' },
    { name: 'Treasury Yield', color: '#34D399', type: 'inflow' },
    { name: 'Payroll', color: '#EF4444', type: 'outflow' },
    { name: 'Cloud Infrastructure', color: '#F59E0B', type: 'outflow' },
    { name: 'Marketing', color: '#3B82F6', type: 'outflow' },
    { name: 'Office & Rent', color: '#8B5CF6', type: 'outflow' },
    { name: 'Tax Payment', color: '#EC4899', type: 'outflow' },
    { name: 'Professional Services', color: '#6B7280', type: 'outflow' },
    { name: 'Miscellaneous', color: '#9CA3AF', type: 'outflow' },
  ],
  scenarios: [
    { id: 'baseline', name: 'Baseline Scenario', description: 'Most likely path based on current pipeline and run-rate.' },
    { id: 'optimistic', name: 'Optimistic Scenario', description: 'Accelerated sales cycles (+20% inflows) and stable costs.' },
    { id: 'pessimistic', name: 'Pessimistic Scenario', description: 'Delayed enterprise deals (-20% inflows) and 10% higher cloud/misc costs.' },
  ],
};