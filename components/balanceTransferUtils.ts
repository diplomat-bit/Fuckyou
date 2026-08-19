

// --- CONSOLIDATED FROM: ./components/utils/balanceTransferUtils.ts ---

export interface CustomerRecord {
  id: string;
  name: string;
  currentBalance: number;
  currentApr: number; // e.g., 24.99 for 24.99%
  minPaymentPercent: number; // e.g., 2 or 3%
  minPaymentFlat: number; // e.g., 25 or 35
  monthlyPayment: number; // actual payment they make
  creditScore: number;
  email?: string;
}

export interface FilterCriteria {
  minBalance?: number;
  maxBalance?: number;
  minApr?: number;
  minCreditScore?: number;
  searchQuery?: string;
}

export interface SimulationInput {
  transferFeePercent: number; // e.g., 3 for 3%
  promoApr: number; // e.g., 0 for 0%
  promoDurationMonths: number; // e.g., 12, 15, 18, 21
  postPromoApr: number; // e.g., 22.99%
  targetMonthlyPayment?: number; // if they want to pay a specific amount
  paymentStrategy: 'min_payment' | 'fixed_payment' | 'pay_off_in_promo';
}

export interface MonthlyAmortization {
  month: number;
  startingBalance: number;
  payment: number;
  interestCharged: number;
  principalPaid: number;
  endingBalance: number;
}

export interface SimulationResult {
  originalMonths: number;
  originalTotalInterest: number;
  originalTotalPaid: number;
  newMonths: number;
  newTotalInterest: number;
  newTotalFees: number;
  newTotalPaid: number;
  estimatedSavings: number;
  amortizationSchedule: MonthlyAmortization[];
  isPaidOffInPromo: boolean;
}

export interface KPIMetrics {
  totalDebt: number;
  averageApr: number;
  averageBalance: number;
  potentialSavings: number;
  customerCount: number;
}

/**
 * Filters customer records based on specified criteria.
 */
export function filterCustomers(customers: CustomerRecord[], filters: FilterCriteria): CustomerRecord[] {
  return customers.filter(c => {
    if (filters.minBalance !== undefined && c.currentBalance < filters.minBalance) return false;
    if (filters.maxBalance !== undefined && c.currentBalance > filters.maxBalance) return false;
    if (filters.minApr !== undefined && c.currentApr < filters.minApr) return false;
    if (filters.minCreditScore !== undefined && c.creditScore < filters.minCreditScore) return false;
    if (filters.searchQuery) {
      const query = filters.searchQuery.toLowerCase();
      const nameMatch = c.name.toLowerCase().includes(query);
      const idMatch = c.id.toLowerCase().includes(query);
      const emailMatch = c.email ? c.email.toLowerCase().includes(query) : false;
      return nameMatch || idMatch || emailMatch;
    }
    return true;
  });
}

/**
 * Calculates the payoff timeline and total interest for a current credit card balance
 * assuming a fixed monthly payment.
 */
export function calculateCurrentPayoff(
  balance: number,
  apr: number,
  monthlyPayment: number,
  minPaymentPercent: number = 1,
  minPaymentFlat: number = 25
): { months: number; totalInterest: number; totalPaid: number } {
  let currentBalance = balance;
  const monthlyRate = (apr / 100) / 12;
  let months = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  // Prevent infinite loop if payment is less than interest
  const firstMonthInterest = currentBalance * monthlyRate;
  let actualPayment = Math.max(monthlyPayment, firstMonthInterest + 1, minPaymentFlat);

  while (currentBalance > 0 && months < 360) { // Cap at 30 years
    const interest = currentBalance * monthlyRate;
    totalInterest += interest;
    
    // Recalculate minimum payment if the user is paying minimums
    if (monthlyPayment <= minPaymentFlat) {
      actualPayment = Math.max((currentBalance * (minPaymentPercent / 100)) + interest, minPaymentFlat);
    }

    let payment = actualPayment;
    if (currentBalance + interest < payment) {
      payment = currentBalance + interest;
    }
    
    currentBalance = currentBalance + interest - payment;
    totalPaid += payment;
    months++;

    // If balance is not decreasing, break to avoid infinite loop
    if (currentBalance >= balance && months > 12) {
      months = 360; // Treat as never paid off
      break;
    }
  }

  return {
    months,
    totalInterest: Math.round(totalInterest * 100) / 100,
    totalPaid: Math.round(totalPaid * 100) / 100
  };
}

/**
 * Runs a balance transfer simulation comparing the current card payoff to the new balance transfer card.
 */
export function runBalanceTransferSimulation(
  currentBalance: number,
  currentApr: number,
  currentMonthlyPayment: number,
  input: SimulationInput
): SimulationResult {
  const feeAmount = currentBalance * (input.transferFeePercent / 100);
  let balance = currentBalance + feeAmount;
  
  // Calculate original payoff details
  const originalPayoff = calculateCurrentPayoff(currentBalance, currentApr, currentMonthlyPayment);

  const amortizationSchedule: MonthlyAmortization[] = [];
  let month = 0;
  let totalInterest = 0;
  let totalPaid = 0;

  // Determine monthly payment amount based on strategy
  let paymentAmount = currentMonthlyPayment;
  if (input.paymentStrategy === 'pay_off_in_promo') {
    paymentAmount = balance / input.promoDurationMonths;
  } else if (input.paymentStrategy === 'fixed_payment' && input.targetMonthlyPayment) {
    paymentAmount = input.targetMonthlyPayment;
  }

  // Ensure payment is at least reasonable
  paymentAmount = Math.max(paymentAmount, 25);

  while (balance > 0 && month < 360) {
    month++;
    const startingBalance = balance;
    
    // Determine APR for this month
    const currentMonthApr = month <= input.promoDurationMonths ? input.promoApr : input.postPromoApr;
    const monthlyRate = (currentMonthApr / 100) / 12;
    const interestCharged = balance * monthlyRate;
    
    let payment = paymentAmount;
    
    // If min payment strategy, calculate dynamically (e.g., 1% of balance + interest, min $25)
    if (input.paymentStrategy === 'min_payment') {
      payment = Math.max((balance * 0.01) + interestCharged, 25);
    }

    if (balance + interestCharged < payment) {
      payment = balance + interestCharged;
    }

    const principalPaid = payment - interestCharged;
    balance = balance + interestCharged - payment;
    
    totalInterest += interestCharged;
    totalPaid += payment;

    amortizationSchedule.push({
      month,
      startingBalance: Math.round(startingBalance * 100) / 100,
      payment: Math.round(payment * 100) / 100,
      interestCharged: Math.round(interestCharged * 100) / 100,
      principalPaid: Math.round(principalPaid * 100) / 100,
      endingBalance: Math.max(0, Math.round(balance * 100) / 100)
    });
  }

  const isPaidOffInPromo = month <= input.promoDurationMonths;
  const estimatedSavings = originalPayoff.totalPaid - totalPaid;

  return {
    originalMonths: originalPayoff.months,
    originalTotalInterest: originalPayoff.totalInterest,
    originalTotalPaid: originalPayoff.totalPaid,
    newMonths: month,
    newTotalInterest: Math.round(totalInterest * 100) / 100,
    newTotalFees: Math.round(feeAmount * 100) / 100,
    newTotalPaid: Math.round(totalPaid * 100) / 100,
    estimatedSavings: Math.round(estimatedSavings * 100) / 100,
    amortizationSchedule,
    isPaidOffInPromo
  };
}

/**
 * Calculates high-level KPI metrics for a list of customer records.
 */
export function calculateKPIMetrics(customers: CustomerRecord[]): KPIMetrics {
  if (customers.length === 0) {
    return { totalDebt: 0, averageApr: 0, averageBalance: 0, potentialSavings: 0, customerCount: 0 };
  }
  
  const totalDebt = customers.reduce((sum, c) => sum + c.currentBalance, 0);
  const averageBalance = totalDebt / customers.length;
  const averageApr = customers.reduce((sum, c) => sum + c.currentApr, 0) / customers.length;

  // Estimate potential savings assuming a standard 0% APR for 15 months with a 3% fee
  let potentialSavings = 0;
  customers.forEach(c => {
    const sim = runBalanceTransferSimulation(c.currentBalance, c.currentApr, c.monthlyPayment, {
      transferFeePercent: 3,
      promoApr: 0,
      promoDurationMonths: 15,
      postPromoApr: 22.99,
      paymentStrategy: 'pay_off_in_promo'
    });
    if (sim.estimatedSavings > 0) {
      potentialSavings += sim.estimatedSavings;
    }
  });

  return {
    totalDebt: Math.round(totalDebt * 100) / 100,
    averageApr: Math.round(averageApr * 100) / 100,
    averageBalance: Math.round(averageBalance * 100) / 100,
    potentialSavings: Math.round(potentialSavings * 100) / 100,
    customerCount: customers.length
  };
}