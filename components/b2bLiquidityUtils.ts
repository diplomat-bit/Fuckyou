

// --- CONSOLIDATED FROM: ./components/utils/b2bLiquidityUtils.ts ---

export interface CashFlowItem {
  id: string;
  name: string;
  type: 'inflow' | 'outflow';
  category: 'AR' | 'AP' | 'Payroll' | 'Revenue' | 'Rent' | 'Tax' | 'Opex' | 'Capex' | 'Financing' | 'Other';
  amount: number;
  frequency: 'once' | 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'yearly';
  startDate: string; // YYYY-MM-DD
  endDate?: string;  // YYYY-MM-DD
  probability?: number; // 0 to 1, defaults to 1
}

export interface StressScenario {
  id: string;
  name: string;
  arDelayDays: number;       // Delay in receiving AR (days)
  apAccelerationDays: number; // Accelerate AP payments (days)
  revenueHaircut: number;     // Percentage reduction in revenue/inflows (0 to 1)
  expenseSpike: number;       // Percentage increase in opex/outflows (0 to 1)
  macroFactor: number;        // General multiplier for overall cash flow (e.g., 0.9 for 10% downturn)
}

export interface MitigationAction {
  id: string;
  name: string;
  type: 'line_of_credit' | 'invoice_factoring' | 'delay_ap' | 'expense_cut' | 'equity_injection';
  amount: number;             // Capital injected or amount delayed/cut
  executionDate: string;      // YYYY-MM-DD
  costRate?: number;          // Interest rate or factoring fee (0 to 1)
  durationDays?: number;      // Duration of the action impact if applicable
  isActive: boolean;
}

export interface ForecastConfig {
  startDate: string;          // YYYY-MM-DD
  durationDays: number;       // e.g., 30, 90, 180, 365
  startingBalance: number;
}

export interface DailyForecastPoint {
  date: string;               // YYYY-MM-DD
  dayIndex: number;
  startingBalance: number;
  inflows: {
    total: number;
    byCategory: Record<string, number>;
  };
  outflows: {
    total: number;
    byCategory: Record<string, number>;
  };
  netFlow: number;
  endingBalance: number;
  isBelowBuffer: boolean;
}

export interface ForecastMetrics {
  startingBalance: number;
  endingBalance: number;
  netCashFlow: number;
  peakBalance: number;
  peakBalanceDate: string;
  minimumBalance: number;
  minimumBalanceDate: string;
  daysBelowZero: number;
  firstInsolvencyDate: string | null;
  runwayDays: number; // Days until balance hits 0 based on average burn rate
  averageDailyInflow: number;
  averageDailyOutflow: number;
  totalInflow: number;
  totalOutflow: number;
}

export interface SimulationResult {
  dailyForecast: DailyForecastPoint[];
  metrics: ForecastMetrics;
}

// --- Helper Date Functions ---

function parseDate(dateStr: string): Date {
  const [year, month, day] = dateStr.split('-').map(Number);
  return new Date(year, month - 1, day);
}

function formatDate(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

function addDays(date: Date, days: number): Date {
  const result = new Date(date);
  result.setDate(result.getDate() + days);
  return result;
}

function getDaysDifference(date1: Date, date2: Date): number {
  const diffTime = date1.getTime() - date2.getTime();
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Determines if a recurring cash flow item occurs on a specific target date.
 */
function isItemActiveOnDate(item: CashFlowItem, targetDate: Date, startDate: Date): boolean {
  const itemStart = parseDate(item.startDate);
  if (targetDate < itemStart) return false;
  if (item.endDate && targetDate > parseDate(item.endDate)) return false;

  const daysDiff = getDaysDifference(targetDate, itemStart);

  switch (item.frequency) {
    case 'once':
      return daysDiff === 0;
    case 'daily':
      return true;
    case 'weekly':
      return daysDiff % 7 === 0;
    case 'monthly':
      return targetDate.getDate() === itemStart.getDate() || 
             (targetDate.getDate() === new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate() && itemStart.getDate() > targetDate.getDate());
    case 'quarterly': {
      const monthDiff = (targetDate.getFullYear() - itemStart.getFullYear()) * 12 + (targetDate.getMonth() - itemStart.getMonth());
      const isCorrectMonth = monthDiff % 3 === 0;
      const isCorrectDay = targetDate.getDate() === itemStart.getDate() || 
                           (targetDate.getDate() === new Date(targetDate.getFullYear(), targetDate.getMonth() + 1, 0).getDate() && itemStart.getDate() > targetDate.getDate());
      return isCorrectMonth && isCorrectDay;
    }
    case 'yearly':
      return targetDate.getMonth() === itemStart.getMonth() && targetDate.getDate() === itemStart.getDate();
    default:
      return false;
  }
}

/**
 * Core forecasting engine translating Python/Pandas-style vector/groupby logic
 * into a robust, sequential daily simulation.
 */
export function runLiquiditySimulation(
  config: ForecastConfig,
  cashFlowItems: CashFlowItem[],
  scenario?: StressScenario,
  actions?: MitigationAction[],
  minimumBuffer: number = 0
): SimulationResult {
  const start = parseDate(config.startDate);
  const dailyForecast: DailyForecastPoint[] = [];
  let currentBalance = config.startingBalance;

  // Default scenario parameters if none provided
  const stress = scenario || {
    id: 'base',
    name: 'Base Case',
    arDelayDays: 0,
    apAccelerationDays: 0,
    revenueHaircut: 0,
    expenseSpike: 0,
    macroFactor: 1.0,
  };

  const activeActions = (actions || []).filter(a => a.isActive);

  // Pre-process items to apply stress-testing adjustments (similar to Pandas vector operations)
  const adjustedItems = cashFlowItems.map(item => {
    let adjustedAmount = item.amount * (item.probability ?? 1.0);
    let adjustedStartDate = item.startDate;

    if (item.type === 'inflow') {
      // Apply revenue haircut
      if (item.category === 'Revenue' || item.category === 'AR') {
        adjustedAmount *= (1 - stress.revenueHaircut);
      }
      // Apply macro factor
      adjustedAmount *= stress.macroFactor;

      // Apply AR delay
      if (stress.arDelayDays > 0 && (item.category === 'AR' || item.category === 'Revenue')) {
        const originalStart = parseDate(item.startDate);
        adjustedStartDate = formatDate(addDays(originalStart, stress.arDelayDays));
      }
    } else {
      // Apply expense spike
      if (item.category === 'Opex' || item.category === 'AP' || item.category === 'Payroll') {
        adjustedAmount *= (1 + stress.expenseSpike);
      }
      // Apply AP acceleration
      if (stress.apAccelerationDays > 0 && item.category === 'AP') {
        const originalStart = parseDate(item.startDate);
        adjustedStartDate = formatDate(addDays(originalStart, -stress.apAccelerationDays));
      }
    }

    return {
      ...item,
      amount: adjustedAmount,
      startDate: adjustedStartDate,
    };
  });

  // Run daily simulation loop
  for (let i = 0; i < config.durationDays; i++) {
    const currentDate = addDays(start, i);
    const currentDateStr = formatDate(currentDate);

    const dayInflows: Record<string, number> = {};
    const dayOutflows: Record<string, number> = {};
    let totalInflow = 0;
    let totalOutflow = 0;

    // 1. Process standard cash flow items
    adjustedItems.forEach(item => {
      if (isItemActiveOnDate(item, currentDate, start)) {
        if (item.type === 'inflow') {
          dayInflows[item.category] = (dayInflows[item.category] || 0) + item.amount;
          totalInflow += item.amount;
        } else {
          dayOutflows[item.category] = (dayOutflows[item.category] || 0) + item.amount;
          totalOutflow += item.amount;
        }
      }
    });

    // 2. Process active mitigation actions (simulating strategic interventions)
    activeActions.forEach(action => {
      const actionDate = parseDate(action.executionDate);
      const daysSinceAction = getDaysDifference(currentDate, actionDate);

      if (daysSinceAction >= 0) {
        switch (action.type) {
          case 'equity_injection':
          case 'line_of_credit':
            // One-time injection on the execution date
            if (daysSinceAction === 0) {
              dayInflows['Financing'] = (dayInflows['Financing'] || 0) + action.amount;
              totalInflow += action.amount;
            }
            // If line of credit has an interest rate, simulate daily/monthly interest outflow
            if (action.type === 'line_of_credit' && action.costRate && action.costRate > 0) {
              const dailyInterestRate = action.costRate / 365;
              const interestOutflow = action.amount * dailyInterestRate;
              dayOutflows['Financing'] = (dayOutflows['Financing'] || 0) + interestOutflow;
              totalOutflow += interestOutflow;
            }
            break;

          case 'invoice_factoring':
            // Factoring accelerates AR immediately but charges a fee
            if (daysSinceAction === 0) {
              const fee = action.costRate ? action.amount * action.costRate : 0;
              const netAmount = action.amount - fee;
              dayInflows['Financing'] = (dayInflows['Financing'] || 0) + netAmount;
              totalInflow += netAmount;
            }
            break;

          case 'delay_ap':
            // Simulates delaying AP payments by shifting outflows out of this window
            // We reduce outflows during the duration of the delay action
            if (action.durationDays && daysSinceAction < action.durationDays) {
              const dailyReduction = action.amount / action.durationDays;
              // Reduce AP outflow up to the daily reduction amount
              const currentAP = dayOutflows['AP'] || 0;
              const reduction = Math.min(currentAP, dailyReduction);
              dayOutflows['AP'] = currentAP - reduction;
              totalOutflow -= reduction;

              // Repay/pay delayed AP after the duration ends
              if (daysSinceAction === action.durationDays - 1) {
                dayOutflows['AP'] = (dayOutflows['AP'] || 0) + action.amount;
                totalOutflow += action.amount;
              }
            }
            break;

          case 'expense_cut':
            // Simulates cutting discretionary spend over a duration
            if (!action.durationDays || daysSinceAction < action.durationDays) {
              const dailyCut = action.durationDays ? (action.amount / action.durationDays) : action.amount;
              const currentOpex = dayOutflows['Opex'] || 0;
              const reduction = Math.min(currentOpex, dailyCut);
              dayOutflows['Opex'] = currentOpex - reduction;
              totalOutflow -= reduction;
            }
            break;
        }
      }
    });

    const netFlow = totalInflow - totalOutflow;
    const startingBalance = currentBalance;
    currentBalance += netFlow;

    dailyForecast.push({
      date: currentDateStr,
      dayIndex: i,
      startingBalance,
      inflows: {
        total: totalInflow,
        byCategory: dayInflows,
      },
      outflows: {
        total: totalOutflow,
        byCategory: dayOutflows,
      },
      netFlow,
      endingBalance: currentBalance,
      isBelowBuffer: currentBalance < minimumBuffer,
    });
  }

  // Calculate aggregate metrics
  const metrics = calculateMetrics(dailyForecast, config.startingBalance);

  return {
    dailyForecast,
    metrics,
  };
}

/**
 * Calculates high-level KPIs and metrics from the daily forecast array.
 */
function calculateMetrics(dailyForecast: DailyForecastPoint[], startingBalance: number): ForecastMetrics {
  if (dailyForecast.length === 0) {
    return {
      startingBalance,
      endingBalance: startingBalance,
      netCashFlow: 0,
      peakBalance: startingBalance,
      peakBalanceDate: '',
      minimumBalance: startingBalance,
      minimumBalanceDate: '',
      daysBelowZero: 0,
      firstInsolvencyDate: null,
      runwayDays: 999,
      averageDailyInflow: 0,
      averageDailyOutflow: 0,
      totalInflow: 0,
      totalOutflow: 0,
    };
  }

  let totalInflow = 0;
  let totalOutflow = 0;
  let peakBalance = -Infinity;
  let peakBalanceDate = '';
  let minimumBalance = Infinity;
  let minimumBalanceDate = '';
  let daysBelowZero = 0;
  let firstInsolvencyDate: string | null = null;

  dailyForecast.forEach(point => {
    totalInflow += point.inflows.total;
    totalOutflow += point.outflows.total;

    if (point.endingBalance > peakBalance) {
      peakBalance = point.endingBalance;
      peakBalanceDate = point.date;
    }

    if (point.endingBalance < minimumBalance) {
      minimumBalance = point.endingBalance;
      minimumBalanceDate = point.date;
    }

    if (point.endingBalance < 0) {
      daysBelowZero++;
      if (!firstInsolvencyDate) {
        firstInsolvencyDate = point.date;
      }
    }
  });

  const endingBalance = dailyForecast[dailyForecast.length - 1].endingBalance;
  const netCashFlow = endingBalance - startingBalance;
  const durationDays = dailyForecast.length;
  const averageDailyInflow = totalInflow / durationDays;
  const averageDailyOutflow = totalOutflow / durationDays;

  // Calculate runway: if net flow is negative, how long until starting balance hits 0
  const averageDailyBurn = averageDailyOutflow - averageDailyInflow;
  let runwayDays = 999; // Represents infinite/stable runway
  if (averageDailyBurn > 0) {
    runwayDays = Math.max(0, Math.round(endingBalance / averageDailyBurn));
  }

  return {
    startingBalance,
    endingBalance,
    netCashFlow,
    peakBalance,
    peakBalanceDate,
    minimumBalance,
    minimumBalanceDate,
    daysBelowZero,
    firstInsolvencyDate,
    runwayDays,
    averageDailyInflow,
    averageDailyOutflow,
    totalInflow,
    totalOutflow,
  };
}

/**
 * Compares multiple scenarios side-by-side.
 */
export function compareScenarios(
  config: ForecastConfig,
  cashFlowItems: CashFlowItem[],
  scenarios: StressScenario[],
  actions: MitigationAction[] = [],
  minimumBuffer: number = 0
): Record<string, SimulationResult> {
  const results: Record<string, SimulationResult> = {};

  scenarios.forEach(scenario => {
    results[scenario.id] = runLiquiditySimulation(config, cashFlowItems, scenario, actions, minimumBuffer);
  });

  return results;
}

/**
 * Simulates the ROI and impact of a specific mitigation action.
 * Returns the difference in metrics between having the action active vs inactive.
 */
export function simulateActionImpact(
  config: ForecastConfig,
  cashFlowItems: CashFlowItem[],
  action: MitigationAction,
  scenario?: StressScenario
): {
  before: SimulationResult;
  after: SimulationResult;
  impact: {
    endingBalanceDelta: number;
    runwayExtensionDays: number;
    insolvencyDelayedDays: number;
    costOfAction: number;
  };
} {
  const before = runLiquiditySimulation(config, cashFlowItems, scenario, []);
  const after = runLiquiditySimulation(config, cashFlowItems, scenario, [{ ...action, isActive: true }]);

  const endingBalanceDelta = after.metrics.endingBalance - before.metrics.endingBalance;
  const runwayExtensionDays = after.metrics.runwayDays - before.metrics.runwayDays;

  let insolvencyDelayedDays = 0;
  if (before.metrics.firstInsolvencyDate && after.metrics.firstInsolvencyDate) {
    const beforeDate = parseDate(before.metrics.firstInsolvencyDate);
    const afterDate = parseDate(after.metrics.firstInsolvencyDate);
    insolvencyDelayedDays = getDaysDifference(afterDate, beforeDate);
  } else if (before.metrics.firstInsolvencyDate && !after.metrics.firstInsolvencyDate) {
    // Action completely resolved insolvency within the forecast window
    insolvencyDelayedDays = config.durationDays;
  }

  // Calculate direct cost of action
  let costOfAction = 0;
  if (action.costRate) {
    if (action.type === 'invoice_factoring') {
      costOfAction = action.amount * action.costRate;
    } else if (action.type === 'line_of_credit' && action.durationDays) {
      costOfAction = action.amount * (action.costRate / 365) * action.durationDays;
    }
  }

  return {
    before,
    after,
    impact: {
      endingBalanceDelta,
      runwayExtensionDays: runwayExtensionDays > 0 ? runwayExtensionDays : 0,
      insolvencyDelayedDays: insolvencyDelayedDays > 0 ? insolvencyDelayedDays : 0,
      costOfAction,
    },
  };
}