interface Debt {
  id: string;
  name: string;
  balance: number;
  interestRate: number; // Annual rate as a decimal (e.g., 0.08 for 8%)
  minPayment: number;
}

interface Asset {
  id: string;
  name: string;
  balance: number;
  yieldRate: number; // Annual yield as a decimal (e.g., 0.12 for 12%)
}

interface MonthlySnapshot {
  month: number;
  debts: {
    id: string;
    name: string;
    remainingBalance: number;
    interestPaid: number;
    principalPaid: number;
  }[];
  totalRemainingBalance: number;
  totalInterestPaidThisMonth: number;
  totalPrincipalPaidThisMonth: number;
}

interface PaydownSimulationResult {
  strategy: 'AVALANCHE' | 'SNOWBALL' | 'PRORATA';
  totalMonths: number;
  totalInterestPaid: number;
  totalPaymentsMade: number;
  schedule: MonthlySnapshot[];
}

interface WaccInputs {
  equityValue: number;
  costOfEquity: number; // as a decimal (e.g., 0.10)
  debtValue: number;
  costOfDebt: number; // as a decimal (e.g., 0.06)
  taxRate: number; // as a decimal (e.g., 0.21)
}

interface WaccResult {
  wacc: number;
  equityWeight: number;
  debtWeight: number;
  afterTaxCostOfDebt: number;
}

/**
 * Calculates the Weighted Average Cost of Debt (WACD).
 * WACD = Sum(Debt Balance * Interest Rate) / Sum(Debt Balance)
 */
export function calculateWACD(debts: Debt[]): number {
  const totalBalance = debts.reduce((sum, debt) => sum + debt.balance, 0);
  if (totalBalance === 0) return 0;

  const weightedSum = debts.reduce((sum, debt) => sum + debt.balance * debt.interestRate, 0);
  return weightedSum / totalBalance;
}

/**
 * Calculates the Weighted Average Yield on Assets (WAYA).
 * WAYA = Sum(Asset Balance * Yield Rate) / Sum(Asset Balance)
 */
export function calculateWAYA(assets: Asset[]): number {
  const totalBalance = assets.reduce((sum, asset) => sum + asset.balance, 0);
  if (totalBalance === 0) return 0;

  const weightedSum = assets.reduce((sum, asset) => sum + asset.balance * asset.yieldRate, 0);
  return weightedSum / totalBalance;
}

/**
 * Calculates the Weighted Average Cost of Capital (WACC).
 * WACC = (E/V * Re) + (D/V * Rd * (1 - T))
 */
export function calculateWACC(inputs: WaccInputs): WaccResult {
  const { equityValue, costOfEquity, debtValue, costOfDebt, taxRate } = inputs;
  const totalValue = equityValue + debtValue;

  if (totalValue === 0) {
    return { wacc: 0, equityWeight: 0, debtWeight: 0, afterTaxCostOfDebt: 0 };
  }

  const equityWeight = equityValue / totalValue;
  const debtWeight = debtValue / totalValue;
  const afterTaxCostOfDebt = costOfDebt * (1 - taxRate);

  const wacc = equityWeight * costOfEquity + debtWeight * afterTaxCostOfDebt;

  return {
    wacc,
    equityWeight,
    debtWeight,
    afterTaxCostOfDebt,
  };
}

/**
 * Simulates debt paydown strategies: Avalanche, Snowball, or Pro-Rata.
 * 
 * @param debts List of current debts
 * @param extraMonthlyPayment Additional cash allocated to paying down debt monthly
 * @param strategy Paydown strategy to apply
 * @param maxMonths Safety limit to prevent infinite loops (default 360 months / 30 years)
 */
export function simulateDebtPaydown(
  debts: Debt[],
  extraMonthlyPayment: number,
  strategy: 'AVALANCHE' | 'SNOWBALL' | 'PRORATA',
  maxMonths: number = 360
): PaydownSimulationResult {
  // Deep copy debts to avoid mutating original inputs
  let activeDebts = debts.map((d) => ({ ...d, currentBalance: d.balance }));
  const schedule: MonthlySnapshot[] = [];
  let totalInterestPaid = 0;
  let totalPaymentsMade = 0;
  let month = 0;

  while (activeDebts.some((d) => d.currentBalance > 0) && month < maxMonths) {
    month++;
    const monthlyDebtsRecord: MonthlySnapshot['debts'] = [];
    let totalInterestPaidThisMonth = 0;
    let totalPrincipalPaidThisMonth = 0;

    // 1. Calculate monthly interest accrued for each active debt
    const interestAccrued = activeDebts.map((debt) => {
      if (debt.currentBalance <= 0) return { id: debt.id, interest: 0 };
      const monthlyRate = debt.interestRate / 12;
      const interest = debt.currentBalance * monthlyRate;
      return { id: debt.id, interest };
    });

    // 2. Determine minimum payments and available extra payment pool
    let totalMinPaymentsRequired = activeDebts.reduce((sum, d) => {
      return sum + (d.currentBalance > 0 ? d.minPayment : 0);
    }, 0);

    let availableExtraPool = extraMonthlyPayment;
    let paymentAllocations: { [key: string]: number } = {};

    // Initialize allocations with minimum payments (capped at remaining balance + accrued interest)
    activeDebts.forEach((debt) => {
      if (debt.currentBalance <= 0) {
        paymentAllocations[debt.id] = 0;
        return;
      }
      const accrued = interestAccrued.find((i) => i.id === debt.id)?.interest || 0;
      const maxNeeded = debt.currentBalance + accrued;
      const minPay = Math.min(debt.minPayment, maxNeeded);
      paymentAllocations[debt.id] = minPay;
      
      // If minimum payment was larger than what was actually needed, return the excess to the extra pool
      if (debt.minPayment > maxNeeded) {
        availableExtraPool += (debt.minPayment - maxNeeded);
      }
    });

    // 3. Distribute the extra payment pool based on the selected strategy
    let eligibleDebts = activeDebts.filter((d) => {
      const accrued = interestAccrued.find((i) => i.id === d.id)?.interest || 0;
      const allocated = paymentAllocations[d.id] || 0;
      return d.currentBalance + accrued - allocated > 0;
    });

    if (availableExtraPool > 0 && eligibleDebts.length > 0) {
      if (strategy === 'AVALANCHE') {
        // Sort by interest rate descending
        eligibleDebts.sort((a, b) => b.interestRate - a.interestRate);
        for (const debt of eligibleDebts) {
          if (availableExtraPool <= 0) break;
          const accrued = interestAccrued.find((i) => i.id === debt.id)?.interest || 0;
          const remainingCap = debt.currentBalance + accrued - paymentAllocations[debt.id];
          const extraToApply = Math.min(availableExtraPool, remainingCap);
          paymentAllocations[debt.id] += extraToApply;
          availableExtraPool -= extraToApply;
        }
      } else if (strategy === 'SNOWBALL') {
        // Sort by current balance ascending
        eligibleDebts.sort((a, b) => a.currentBalance - b.currentBalance);
        for (const debt of eligibleDebts) {
          if (availableExtraPool <= 0) break;
          const accrued = interestAccrued.find((i) => i.id === debt.id)?.interest || 0;
          const remainingCap = debt.currentBalance + accrued - paymentAllocations[debt.id];
          const extraToApply = Math.min(availableExtraPool, remainingCap);
          paymentAllocations[debt.id] += extraToApply;
          availableExtraPool -= extraToApply;
        }
      } else if (strategy === 'PRORATA') {
        // Distribute proportionally based on remaining balance
        const totalEligibleBalance = eligibleDebts.reduce((sum, d) => sum + d.currentBalance, 0);
        if (totalEligibleBalance > 0) {
          let distributedExtra = 0;
          const initialExtraPool = availableExtraPool;

          eligibleDebts.forEach((debt) => {
            const proportion = debt.currentBalance / totalEligibleBalance;
            const targetExtra = initialExtraPool * proportion;
            const accrued = interestAccrued.find((i) => i.id === debt.id)?.interest || 0;
            const remainingCap = debt.currentBalance + accrued - paymentAllocations[debt.id];
            const extraToApply = Math.min(targetExtra, remainingCap);
            paymentAllocations[debt.id] += extraToApply;
            distributedExtra += extraToApply;
          });
          availableExtraPool -= distributedExtra;
        }
      }
    }

    // 4. Apply payments, update balances, and record metrics
    activeDebts.forEach((debt) => {
      const accruedInterest = interestAccrued.find((i) => i.id === debt.id)?.interest || 0;
      const payment = paymentAllocations[debt.id] || 0;

      let interestPaid = 0;
      let principalPaid = 0;

      if (debt.currentBalance > 0) {
        // Interest is paid off first
        interestPaid = Math.min(payment, accruedInterest);
        // Remaining payment goes to principal
        principalPaid = Math.min(payment - interestPaid, debt.currentBalance);

        debt.currentBalance = debt.currentBalance - principalPaid;
        totalInterestPaidThisMonth += interestPaid;
        totalPrincipalPaidThisMonth += principalPaid;
        totalPaymentsMade += payment;
      }

      monthlyDebtsRecord.push({
        id: debt.id,
        name: debt.name,
        remainingBalance: Math.max(0, debt.currentBalance),
        interestPaid,
        principalPaid,
      });
    });

    totalInterestPaid += totalInterestPaidThisMonth;
    const totalRemainingBalance = activeDebts.reduce((sum, d) => sum + d.currentBalance, 0);

    schedule.push({
      month,
      debts: monthlyDebtsRecord,
      totalRemainingBalance,
      totalInterestPaidThisMonth,
      totalPrincipalPaidThisMonth,
    });
  }

  return {
    strategy,
    totalMonths: month,
    totalInterestPaid,
    totalPaymentsMade,
    schedule,
  };
}

/**
 * Compares all three paydown strategies side-by-side.
 */
export function comparePaydownStrategies(
  debts: Debt[],
  extraMonthlyPayment: number,
  maxMonths: number = 360
): Record<'AVALANCHE' | 'SNOWBALL' | 'PRORATA', PaydownSimulationResult> {
  return {
    AVALANCHE: simulateDebtPaydown(debts, extraMonthlyPayment, 'AVALANCHE', maxMonths),
    SNOWBALL: simulateDebtPaydown(debts, extraMonthlyPayment, 'SNOWBALL', maxMonths),
    PRORATA: simulateDebtPaydown(debts, extraMonthlyPayment, 'PRORATA', maxMonths),
  };
}