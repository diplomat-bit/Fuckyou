export interface CreditCard {
  id: string;
  bankName: string;
  balance: number;
  apr: number;
  minPayment: number;
}

export interface Portfolio {
  id: string;
  clientName: string;
  email: string;
  creditScore: number;
  cards: CreditCard[];
  totalBalance: number;
  averageApr: number;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
  maxTransferAmount: number;
  promoApr: number;
  promoDurationMonths: number;
  estimatedSavings: number;
  transferFeePercent: number;
}

export interface CampaignTemplate {
  id: string;
  name: string;
  subjectTemplate: string;
  bodyTemplate: string;
}

export interface FilterCriteria {
  minCreditScore?: number;
  maxCreditScore?: number;
  minBalance?: number;
  minApr?: number;
  eligibleOnly?: boolean;
}

const MOCK_NAMES = [
  "Alexander Wright", "Sophia Martinez", "Liam Gallagher", "Olivia Chen", 
  "Noah Jenkins", "Ava Patel", "Ethan Coen", "Isabella Rossi", 
  "Mason Vance", "Mia Takahashi", "Lucas de Souza", "Charlotte Dubois",
  "Oliver Smith", "Amelia Jones", "Elijah Brown", "Harper Davis"
];

const MOCK_BANKS = [
  "Apex Card Services", "Summit Trust", "Horizon Finance", "Pinnacle Credit", 
  "Vanguard Express", "Liberty Bank", "Beacon Card", "Meridian Credit"
];

/**
 * Generates a list of mock portfolios for simulation.
 */
export function generateMockPortfolios(count: number = 10): Portfolio[] {
  const portfolios: Portfolio[] = [];

  for (let i = 0; i < count; i++) {
    const name = MOCK_NAMES[i % MOCK_NAMES.length];
    const email = `${name.toLowerCase().replace(/\s+/g, '.')}@example.com`;
    const creditScore = Math.floor(Math.random() * (850 - 580 + 1)) + 580; // 580 to 850
    
    const cardCount = Math.floor(Math.random() * 3) + 1; // 1 to 3 cards
    const cards: CreditCard[] = [];
    let totalBalance = 0;
    let totalAprWeight = 0;

    const availableBanks = [...MOCK_BANKS];

    for (let j = 0; j < cardCount; j++) {
      const bankIndex = Math.floor(Math.random() * availableBanks.length);
      const bankName = availableBanks.splice(bankIndex, 1)[0] || "Generic Card";
      const balance = Math.floor(Math.random() * (12000 - 1500 + 1)) + 1500; // $1,500 to $12,000
      const apr = parseFloat((Math.random() * (29.99 - 16.99) + 16.99).toFixed(2)); // 16.99% to 29.99%
      const minPayment = Math.round(balance * 0.025); // ~2.5% minimum payment

      cards.push({
        id: `card-${i}-${j}`,
        bankName,
        balance,
        apr,
        minPayment
      });

      totalBalance += balance;
      totalAprWeight += apr * balance;
    }

    const averageApr = totalBalance > 0 ? parseFloat((totalAprWeight / totalBalance).toFixed(2)) : 0;

    portfolios.push({
      id: `portfolio-${1000 + i}`,
      clientName: name,
      email,
      creditScore,
      cards,
      totalBalance,
      averageApr
    });
  }

  return portfolios;
}

/**
 * Simulates an eligibility API response based on portfolio metrics.
 */
export function simulateEligibility(portfolio: Portfolio): EligibilityResult {
  const { creditScore, totalBalance, averageApr } = portfolio;

  // Ineligibility criteria
  if (creditScore < 620) {
    return {
      eligible: false,
      reason: "Credit score is below the minimum requirement of 620.",
      maxTransferAmount: 0,
      promoApr: 0,
      promoDurationMonths: 0,
      estimatedSavings: 0,
      transferFeePercent: 0
    };
  }

  if (totalBalance < 2000) {
    return {
      eligible: false,
      reason: "Total outstanding balance is below the minimum threshold of $2,000.",
      maxTransferAmount: 0,
      promoApr: 0,
      promoDurationMonths: 0,
      estimatedSavings: 0,
      transferFeePercent: 0
    };
  }

  // Determine promotional terms based on credit tier
  let promoApr = 0;
  let promoDurationMonths = 12;
  let transferFeePercent = 3;
  let maxTransferAmount = 15000;

  if (creditScore >= 740) {
    promoApr = 0;
    promoDurationMonths = 21;
    transferFeePercent = 3;
    maxTransferAmount = 25000;
  } else if (creditScore >= 680) {
    promoApr = 0;
    promoDurationMonths = 18;
    transferFeePercent = 4;
    maxTransferAmount = 15000;
  } else {
    promoApr = 1.99;
    promoDurationMonths = 12;
    transferFeePercent = 5;
    maxTransferAmount = 8000;
  }

  // Calculate estimated savings
  // Simplified formula: Interest saved over the promo period minus the transfer fee
  const transferAmount = Math.min(totalBalance, maxTransferAmount);
  const monthlyCurrentRate = (averageApr / 100) / 12;
  const monthlyPromoRate = (promoApr / 100) / 12;
  
  let currentInterestPaid = 0;
  let promoInterestPaid = 0;
  let remainingCurrentBalance = transferAmount;
  let remainingPromoBalance = transferAmount;

  // Simulate simple amortization/interest accumulation over the promo duration
  // Assuming a fixed monthly payment of 3% of the initial transfer amount for comparison
  const simulatedMonthlyPayment = transferAmount * 0.03;

  for (let m = 0; m < promoDurationMonths; m++) {
    // Current scenario interest
    const currentInterest = remainingCurrentBalance * monthlyCurrentRate;
    currentInterestPaid += currentInterest;
    remainingCurrentBalance = Math.max(0, remainingCurrentBalance + currentInterest - simulatedMonthlyPayment);

    // Promo scenario interest
    const promoInterest = remainingPromoBalance * monthlyPromoRate;
    promoInterestPaid += promoInterest;
    remainingPromoBalance = Math.max(0, remainingPromoBalance + promoInterest - simulatedMonthlyPayment);
  }

  const transferFee = transferAmount * (transferFeePercent / 100);
  const estimatedSavings = Math.max(0, Math.round((currentInterestPaid - promoInterestPaid) - transferFee));

  return {
    eligible: true,
    reason: "Meets all credit score and outstanding balance requirements.",
    maxTransferAmount,
    promoApr,
    promoDurationMonths,
    estimatedSavings,
    transferFeePercent
  };
}

/**
 * Filters portfolios based on user-defined criteria.
 */
export function applyFilters(
  portfolios: Portfolio[], 
  criteria: FilterCriteria
): Portfolio[] {
  return portfolios.filter(portfolio => {
    if (criteria.minCreditScore !== undefined && portfolio.creditScore < criteria.minCreditScore) {
      return false;
    }
    if (criteria.maxCreditScore !== undefined && portfolio.creditScore > criteria.maxCreditScore) {
      return false;
    }
    if (criteria.minBalance !== undefined && portfolio.totalBalance < criteria.minBalance) {
      return false;
    }
    if (criteria.minApr !== undefined && portfolio.averageApr < criteria.minApr) {
      return false;
    }
    if (criteria.eligibleOnly) {
      const eligibility = simulateEligibility(portfolio);
      if (!eligibility.eligible) {
        return false;
      }
    }
    return true;
  });
}

/**
 * Renders a personalized campaign template with portfolio and eligibility data.
 */
export function renderTemplate(
  template: string, 
  portfolio: Portfolio, 
  eligibility: EligibilityResult
): string {
  const formatCurrency = (value: number) => 
    new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }).format(value);

  const formatPercent = (value: number) => `${value}%`;

  const highestAprCard = [...portfolio.cards].sort((a, b) => b.apr - a.apr)[0];

  const replacements: Record<string, string> = {
    "{{clientName}}": portfolio.clientName,
    "{{firstName}}": portfolio.clientName.split(" ")[0] || portfolio.clientName,
    "{{totalBalance}}": formatCurrency(portfolio.totalBalance),
    "{{averageApr}}": formatPercent(portfolio.averageApr),
    "{{creditScore}}": portfolio.creditScore.toString(),
    "{{highestAprCardBank}}": highestAprCard ? highestAprCard.bankName : "your current card provider",
    "{{highestAprCardApr}}": highestAprCard ? formatPercent(highestAprCard.apr) : formatPercent(portfolio.averageApr),
    "{{promoApr}}": formatPercent(eligibility.promoApr),
    "{{promoDurationMonths}}": `${eligibility.promoDurationMonths} months`,
    "{{estimatedSavings}}": formatCurrency(eligibility.estimatedSavings),
    "{{maxTransferAmount}}": formatCurrency(eligibility.maxTransferAmount),
    "{{transferFeePercent}}": formatPercent(eligibility.transferFeePercent)
  };

  let rendered = template;
  Object.entries(replacements).forEach(([placeholder, value]) => {
    rendered = rendered.replace(new RegExp(placeholder, 'g'), value);
  });

  return rendered;
}

/**
 * Default campaign templates available for selection.
 */
export const DEFAULT_TEMPLATES: CampaignTemplate[] = [
  {
    id: "temp-savings-focused",
    name: "High Savings Highlight",
    subjectTemplate: "Save up to {{estimatedSavings}} on your {{highestAprCardBank}} balance, {{firstName}}!",
    bodyTemplate: "Dear {{firstName}},\n\nWe noticed you are currently paying an estimated {{highestAprCardApr}} APR on your {{highestAprCardBank}} card. Based on your excellent credit score of {{creditScore}}, you are pre-approved to transfer up to {{maxTransferAmount}} of your outstanding debt.\n\nBy consolidating your balances to our promotional {{promoApr}} APR offer for the next {{promoDurationMonths}}, you could save approximately {{estimatedSavings}} in interest charges!\n\nThis offer features a low {{transferFeePercent}} transfer fee and is valid for a limited time. Click below to secure your savings.\n\nBest regards,\nYour Financial Advisory Team"
  },
  {
    id: "temp-consolidation-focused",
    name: "Debt Consolidation Simplicity",
    subjectTemplate: "Simplify your payments and lower your {{averageApr}}% APR",
    bodyTemplate: "Hi {{firstName}},\n\nManaging multiple credit card payments can be stressful. With a total outstanding balance of {{totalBalance}} across your cards, we want to help you simplify your financial life.\n\nYou are eligible to consolidate your balances into a single, easy monthly payment with a promotional rate of {{promoApr}} APR for {{promoDurationMonths}}.\n\nNot only will this streamline your monthly budgeting, but it will also save you an estimated {{estimatedSavings}} in interest payments. \n\nApply in minutes and take control of your financial future today.\n\nSincerely,\nCustomer Success Team"
  },
  {
    id: "temp-urgent-promo",
    name: "Urgent Promotional Offer",
    subjectTemplate: "Time-sensitive: 0% APR Balance Transfer Offer for {{firstName}}",
    bodyTemplate: "Hello {{firstName}},\n\nThis is a time-sensitive notification regarding your pre-approved balance transfer limit of {{maxTransferAmount}}.\n\nOur records indicate you are currently carrying a balance of {{totalBalance}} with an average interest rate of {{averageApr}}%. By acting now, you can transfer this balance to our promotional {{promoApr}} APR option for {{promoDurationMonths}}.\n\nIf you transfer your high-interest balance from {{highestAprCardBank}} today, you will prevent unnecessary interest accumulation and keep an estimated {{estimatedSavings}} in your pocket.\n\nDon't let high interest eat away at your hard-earned money. Claim this offer before it expires.\n\nWarm regards,\nPortfolio Management Group"
  }
];