

// --- CONSOLIDATED FROM: ./components/utils/balanceTransferCalcUtils.ts ---

export interface CurrentDebtInput {
  balance: number;
  apr: number;
  monthlyPayment: number;
}

export interface TransferOfferInput {
  transferFeePercent: number;
  promoApr: number;
  promoDurationMonths: number;
  postPromoApr: number;
}

export type PaymentStrategy = 'min_payment' | 'fixed_payment' | 'pay_off_in_promo' | 'match_current';

export interface SimulationOptions {
  paymentStrategy: PaymentStrategy;
  customFixedPayment?: number;
}

export interface MonthDetail {
  month: number;
  startingBalance: number;
  interestAccrued: number;
  payment: number;
  principalPaid: number;
  endingBalance: number;
}

export interface SimulationResult {
  monthsToPayOff: number;
  totalInterestPaid: number;
  totalFeesPaid: number;
  totalPaid: number;
  schedule: MonthDetail[];
  isPayoffFeasible: boolean;
}

export interface ComparisonResult {
  currentCard: SimulationResult;
  transferCard: SimulationResult;
  netSavings: number;
  breakEvenMonth: number | null;
}

/**
 * Rounds a number to two decimal places to avoid floating-point precision issues.
 */
export const roundToTwo = (num: number): number => {
  return Math.round((num + Number.EPSILON) * 100) / 100;
};

/**
 * Calculates the standard minimum payment for a credit card.
 * Typically the greater of $25 or 1% of the balance plus interest.
 */
export const calculateMinPayment = (balance: number, interest: number): number => {
  if (balance <= 0) return 0;
  const calculated = balance * 0.01 + interest;
  const min = Math.max(25, calculated);
  return roundToTwo(Math.min(min, balance + interest));
};

/**
 * Simulates paying off the current card without a balance transfer.
 */
export const simulateCurrentCard = (input: CurrentDebtInput): SimulationResult => {
  const { balance, apr, monthlyPayment } = input;
  const schedule: MonthDetail[] = [];
  
  if (balance <= 0) {
    return { monthsToPayOff: 0, totalInterestPaid: 0, totalFeesPaid: 0, totalPaid: 0, schedule: [], isPayoffFeasible: true };
  }

  let currentBalance = balance;
  const monthlyRate = (apr / 100) / 12;
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let month = 0;
  const maxMonths = 600; // 50 years safety limit

  while (currentBalance > 0.005 && month < maxMonths) {
    month++;
    const startingBalance = currentBalance;
    const interestAccrued = roundToTwo(currentBalance * monthlyRate);
    
    // Minimum payment check
    const minPayment = calculateMinPayment(currentBalance, interestAccrued);
    let payment = Math.max(monthlyPayment, minPayment);
    payment = roundToTwo(Math.min(payment, currentBalance + interestAccrued));

    // If payment doesn't cover interest, the balance will grow infinitely
    if (payment <= interestAccrued && currentBalance > 0) {
      return {
        monthsToPayOff: maxMonths,
        totalInterestPaid: roundToTwo(totalInterestPaid + interestAccrued),
        totalFeesPaid: 0,
        totalPaid: roundToTwo(totalPaid + payment),
        schedule,
        isPayoffFeasible: false,
      };
    }

    const principalPaid = roundToTwo(payment - interestAccrued);
    currentBalance = roundToTwo(currentBalance + interestAccrued - payment);

    totalInterestPaid = roundToTwo(totalInterestPaid + interestAccrued);
    totalPaid = roundToTwo(totalPaid + payment);

    schedule.push({
      month,
      startingBalance,
      interestAccrued,
      payment,
      principalPaid,
      endingBalance: currentBalance,
    });
  }

  return {
    monthsToPayOff: month,
    totalInterestPaid,
    totalFeesPaid: 0,
    totalPaid,
    schedule,
    isPayoffFeasible: month < maxMonths,
  };
};

/**
 * Simulates paying off the debt using a Balance Transfer offer.
 */
export const simulateTransferCard = (
  currentDebt: CurrentDebtInput,
  offer: TransferOfferInput,
  options: SimulationOptions
): SimulationResult => {
  const { balance } = currentDebt;
  const { transferFeePercent, promoApr, promoDurationMonths, postPromoApr } = offer;
  const { paymentStrategy, customFixedPayment } = options;

  if (balance <= 0) {
    return { monthsToPayOff: 0, totalInterestPaid: 0, totalFeesPaid: 0, totalPaid: 0, schedule: [], isPayoffFeasible: true };
  }

  const transferFee = roundToTwo(balance * (transferFeePercent / 100));
  const initialBalance = roundToTwo(balance + transferFee);
  
  let currentBalance = initialBalance;
  let totalInterestPaid = 0;
  let totalPaid = 0;
  let month = 0;
  const maxMonths = 600;
  const schedule: MonthDetail[] = [];

  // Determine target payment based on strategy
  let targetPayment = 0;
  if (paymentStrategy === 'pay_off_in_promo') {
    targetPayment = roundToTwo(initialBalance / Math.max(1, promoDurationMonths));
  } else if (paymentStrategy === 'match_current') {
    targetPayment = currentDebt.monthlyPayment;
  } else if (paymentStrategy === 'fixed_payment' && customFixedPayment) {
    targetPayment = customFixedPayment;
  }

  while (currentBalance > 0.005 && month < maxMonths) {
    month++;
    const startingBalance = currentBalance;
    
    // Determine active APR
    const activeApr = month <= promoDurationMonths ? promoApr : postPromoApr;
    const monthlyRate = (activeApr / 100) / 12;
    const interestAccrued = roundToTwo(currentBalance * monthlyRate);
    
    const minPayment = calculateMinPayment(currentBalance, interestAccrued);
    
    let payment = 0;
    if (paymentStrategy === 'min_payment') {
      payment = minPayment;
    } else {
      payment = Math.max(targetPayment, minPayment);
    }
    
    payment = roundToTwo(Math.min(payment, currentBalance + interestAccrued));

    if (payment <= interestAccrued && currentBalance > 0) {
      return {
        monthsToPayOff: maxMonths,
        totalInterestPaid: roundToTwo(totalInterestPaid + interestAccrued),
        totalFeesPaid: transferFee,
        totalPaid: roundToTwo(totalPaid + payment),
        schedule,
        isPayoffFeasible: false,
      };
    }

    const principalPaid = roundToTwo(payment - interestAccrued);
    currentBalance = roundToTwo(currentBalance + interestAccrued - payment);

    totalInterestPaid = roundToTwo(totalInterestPaid + interestAccrued);
    totalPaid = roundToTwo(totalPaid + payment);

    schedule.push({
      month,
      startingBalance,
      interestAccrued,
      payment,
      principalPaid,
      endingBalance: currentBalance,
    });
  }

  return {
    monthsToPayOff: month,
    totalInterestPaid,
    totalFeesPaid: transferFee,
    totalPaid: roundToTwo(totalPaid),
    schedule,
    isPayoffFeasible: month < maxMonths,
  };
};

/**
 * Compares the current card payoff strategy against the balance transfer strategy.
 */
export const compareStrategies = (
  currentDebt: CurrentDebtInput,
  offer: TransferOfferInput,
  options: SimulationOptions
): ComparisonResult => {
  const currentCard = simulateCurrentCard(currentDebt);
  const transferCard = simulateTransferCard(currentDebt, offer, options);

  const netSavings = roundToTwo(currentCard.totalPaid - transferCard.totalPaid);

  // Calculate break-even month
  // This is the month where cumulative payments + fees on the transfer card become less than cumulative payments on the current card.
  let breakEvenMonth: number | null = null;
  const maxMonths = Math.max(currentCard.schedule.length, transferCard.schedule.length);
  
  let currentCumulative = 0;
  let transferCumulative = transferCard.totalFeesPaid; // Start with the upfront transfer fee

  for (let m = 1; m <= maxMonths; m++) {
    const currentMonthDetail = currentCard.schedule.find(s => s.month === m);
    const transferMonthDetail = transferCard.schedule.find(s => s.month === m);

    currentCumulative += currentMonthDetail ? currentMonthDetail.payment : 0;
    transferCumulative += transferMonthDetail ? transferMonthDetail.payment : 0;

    if (transferCumulative < currentCumulative) {
      breakEvenMonth = m;
      break;
    }
  }

  return {
    currentCard,
    transferCard,
    netSavings,
    breakEvenMonth,
  };
};