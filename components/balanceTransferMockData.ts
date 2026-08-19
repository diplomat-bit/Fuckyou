

// --- CONSOLIDATED FROM: ./components/data/balanceTransferMockData.ts ---

export interface CustomerRecord {
  id: string;
  name: string;
  creditScore: number;
  accountGroup: 'Basic' | 'Standard' | 'Premium' | 'VIP';
  dtiRatio: number; // Debt-to-Income ratio (e.g., 0.35 for 35%)
  currentDebt: number;
  eligible: boolean;
  maxTransferLimit: number;
  aprOffer: number; // Annual Percentage Rate (e.g., 0.0 for 0%)
  promoDurationMonths: number;
  rejectionReason?: string;
}

export interface EligibilityCriteria {
  minCreditScore: number;
  maxDtiRatio: number;
  minDebtAmount: number;
}

const FIRST_NAMES = [
  'John', 'Jane', 'Michael', 'Emily', 'David', 'Sarah', 'James', 'Jessica', 
  'Robert', 'Karen', 'William', 'Lisa', 'Richard', 'Sandra', 'Joseph', 
  'Donna', 'Thomas', 'Carol', 'Charles', 'Ruth', 'Christopher', 'Patricia', 
  'Daniel', 'Barbara', 'Matthew', 'Elizabeth', 'Anthony', 'Mary', 'Mark', 'Linda'
];

const LAST_NAMES = [
  'Smith', 'Johnson', 'Williams', 'Brown', 'Jones', 'Garcia', 'Miller', 
  'Davis', 'Rodriguez', 'Martinez', 'Hernandez', 'Lopez', 'Gonzalez', 
  'Wilson', 'Anderson', 'Thomas', 'Taylor', 'Moore', 'Jackson', 'Martin', 
  'Lee', 'Perez', 'Thompson', 'White', 'Harris', 'Sanchez', 'Clark', 
  'Ramirez', 'Lewis', 'Robinson'
];

// Simple seedable pseudo-random number generator for deterministic mock data
function createRandom(seed: number) {
  let s = seed;
  return function() {
    s = (s * 9301 + 49297) % 233280;
    return s / 233280;
  };
}

/**
 * Generates a deterministic list of mock customer records.
 * Using a seed ensures consistent data across renders and builds, preventing hydration issues.
 */
export function generateMockCustomers(count: number = 100, seed: number = 12345): CustomerRecord[] {
  const random = createRandom(seed);
  const customers: CustomerRecord[] = [];

  for (let i = 0; i < count; i++) {
    const id = `CUST-${1000 + i}`;
    const firstName = FIRST_NAMES[Math.floor(random() * FIRST_NAMES.length)];
    const lastName = LAST_NAMES[Math.floor(random() * LAST_NAMES.length)];
    const name = `${firstName} ${lastName}`;

    // Credit score distribution: weighted towards 600-800 range
    const creditScore = Math.floor(random() * (850 - 580 + 1)) + 580;

    // Determine account group based on credit score tier with some randomness
    let accountGroup: 'Basic' | 'Standard' | 'Premium' | 'VIP' = 'Standard';
    if (creditScore >= 760) {
      accountGroup = random() > 0.2 ? 'VIP' : 'Premium';
    } else if (creditScore >= 680) {
      accountGroup = random() > 0.3 ? 'Premium' : 'Standard';
    } else if (creditScore < 620) {
      accountGroup = 'Basic';
    }

    // Debt-to-Income (DTI) ratio: 0.10 to 0.65
    const dtiRatio = parseFloat((random() * (0.65 - 0.10) + 0.10).toFixed(2));

    // Current credit card debt: $1,200 to $28,000
    const currentDebt = Math.floor(random() * (28000 - 1200 + 1)) + 1200;

    // Initial eligibility calculation based on standard baseline rules
    const baselineCriteria: EligibilityCriteria = {
      minCreditScore: 660,
      maxDtiRatio: 0.45,
      minDebtAmount: 1500,
    };

    const evaluation = evaluateCustomerEligibility(
      { creditScore, dtiRatio, currentDebt, accountGroup },
      baselineCriteria
    );

    customers.push({
      id,
      name,
      creditScore,
      accountGroup,
      dtiRatio,
      currentDebt,
      eligible: evaluation.eligible,
      maxTransferLimit: evaluation.maxTransferLimit,
      aprOffer: evaluation.aprOffer,
      promoDurationMonths: evaluation.promoDurationMonths,
      rejectionReason: evaluation.rejectionReason,
    });
  }

  return customers;
}

/**
 * Evaluates eligibility for a single customer based on dynamic criteria.
 * This mirrors the interactive slider logic in the Streamlit application.
 */
export function evaluateCustomerEligibility(
  customer: {
    creditScore: number;
    dtiRatio: number;
    currentDebt: number;
    accountGroup: 'Basic' | 'Standard' | 'Premium' | 'VIP';
  },
  criteria: EligibilityCriteria
): {
  eligible: boolean;
  maxTransferLimit: number;
  aprOffer: number;
  promoDurationMonths: number;
  rejectionReason?: string;
} {
  const { creditScore, dtiRatio, currentDebt, accountGroup } = customer;
  const { minCreditScore, maxDtiRatio, minDebtAmount } = criteria;

  if (creditScore < minCreditScore) {
    return {
      eligible: false,
      maxTransferLimit: 0,
      aprOffer: 0,
      promoDurationMonths: 0,
      rejectionReason: `Credit score (${creditScore}) is below the minimum threshold of ${minCreditScore}.`,
    };
  }

  if (dtiRatio > maxDtiRatio) {
    return {
      eligible: false,
      maxTransferLimit: 0,
      aprOffer: 0,
      promoDurationMonths: 0,
      rejectionReason: `DTI ratio (${(dtiRatio * 100).toFixed(0)}%) exceeds the maximum threshold of ${(maxDtiRatio * 100).toFixed(0)}%.`,
    };
  }

  if (currentDebt < minDebtAmount) {
    return {
      eligible: false,
      maxTransferLimit: 0,
      aprOffer: 0,
      promoDurationMonths: 0,
      rejectionReason: `Current debt ($${currentDebt.toLocaleString()}) is below the minimum required transfer of $${minDebtAmount.toLocaleString()}.`,
    };
  }

  // Calculate Max Transfer Limit based on Credit Score and Account Group
  let baseLimitMultiplier = 15;
  if (creditScore >= 780) baseLimitMultiplier = 25;
  else if (creditScore >= 700) baseLimitMultiplier = 20;

  const groupMultiplier = {
    Basic: 0.8,
    Standard: 1.0,
    Premium: 1.4,
    VIP: 1.8,
  }[accountGroup];

  let maxTransferLimit = Math.round((creditScore * baseLimitMultiplier * groupMultiplier) / 100) * 100;
  
  // Cap the transfer limit to not exceed 90% of their current debt or an absolute ceiling of $35,000
  const absoluteCeiling = accountGroup === 'VIP' ? 35000 : accountGroup === 'Premium' ? 25000 : 15000;
  maxTransferLimit = Math.min(maxTransferLimit, Math.round(currentDebt * 0.9), absoluteCeiling);
  maxTransferLimit = Math.max(maxTransferLimit, 500); // Ensure at least $500 if eligible

  // Determine APR Offer and Promo Duration
  let aprOffer = 0.0;
  let promoDurationMonths = 12;

  if (creditScore >= 750) {
    aprOffer = 0.0;
    promoDurationMonths = accountGroup === 'VIP' ? 21 : accountGroup === 'Premium' ? 18 : 15;
  } else if (creditScore >= 700) {
    aprOffer = 1.99;
    promoDurationMonths = accountGroup === 'VIP' || accountGroup === 'Premium' ? 15 : 12;
  } else if (creditScore >= 660) {
    aprOffer = 3.99;
    promoDurationMonths = 12;
  } else {
    aprOffer = 5.99;
    promoDurationMonths = 6;
  }

  return {
    eligible: true,
    maxTransferLimit,
    aprOffer,
    promoDurationMonths,
  };
}

// Pre-generated default dataset of 100 records for instant import
export const defaultMockCustomers = generateMockCustomers(100);