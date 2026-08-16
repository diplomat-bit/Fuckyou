/**
 * src/balanceTransferEvaluator.ts
 * 
 * Provides analytical logic to evaluate eligibility responses, calculate
 * effective interest rates and APR comparisons, score balance transfer offers
 * for card accounts, and provide full integration primitives for Google Gemini AI.
 */

// ============================================================================
// Types & Interfaces
// ============================================================================

export interface CardAccount {
  id: string;
  accountName: string;
  issuer: string;
  currentBalance: number;
  currentApr: number; // e.g., 24.99 for 24.99%
  minimumMonthlyPayment?: number;
  creditLimit?: number;
}

export interface BalanceTransferOffer {
  id: string;
  offerName: string;
  provider: string;
  transferFeePercentage: number; // e.g., 3.0 for 3%
  transferFeeMin?: number;
  transferFeeCap?: number;
  promoApr: number; // e.g., 0.0 for 0%
  promoDurationMonths: number; // e.g., 15 months
  postPromoApr: number; // APR after promo period ends
  minTransferAmount?: number;
  maxTransferAmount?: number;
  requiresNewAccount: boolean;
  creditScoreRequirement?: 'EXCELLENT' | 'GOOD' | 'FAIR';
}

export interface EvaluationCriteria {
  targetTransferAmount: number;
  plannedMonthlyPayment: number;
  payoffStrategy: 'MINIMUM_PAYMENT' | 'FIXED_PAYMENT' | 'PAY_BEFORE_PROMO_EXPIRES';
  timeHorizonMonths?: number;
  creditScoreTier?: 'EXCELLENT' | 'GOOD' | 'FAIR';
}

export interface MonthlyBreakdown {
  month: number;
  startingBalance: number;
  interestCharged: number;
  paymentMade: number;
  endingBalance: number;
  isPromoPeriod: boolean;
}

export interface BalanceTransferEvaluation {
  offerId: string;
  offerName: string;
  provider: string;
  eligible: boolean;
  ineligibilityReasons: string[];
  transferAmount: number;
  upfrontTransferFee: number;
  totalInterestPaidPromo: number;
  totalInterestPaidPostPromo: number;
  totalInterestPaid: number;
  totalCost: number; // transfer fee + total interest
  monthsToPayoff: number;
  payoffBeforePromoEnds: boolean;
  
  // Baseline Comparison (keeping balance on current card)
  baselineTotalInterest: number;
  baselineMonthsToPayoff: number;
  netSavings: number; // Baseline Interest - Total Transfer Cost
  effectiveApr: number; // Effective APR incorporating transfer fee over promo length
  
  // Scoring
  overallScore: number; // 0 - 100
  scoreBreakdown: {
    savingsScore: number;
    feeEfficiencyScore: number;
    durationMatchScore: number;
    riskScore: number;
  };
  
  schedule: MonthlyBreakdown[];
  recommendationTag: 'STRONGLY_RECOMMENDED' | 'RECOMMENDED' | 'NEUTRAL' | 'NOT_RECOMMENDED';
  summaryMessage: string;
}

export interface MultiOfferComparisonResult {
  cardAccount: CardAccount;
  targetTransferAmount: number;
  evaluations: BalanceTransferEvaluation[];
  bestOverallOfferId?: string;
  maxSavingsOfferId?: string;
  fastestPayoffOfferId?: string;
  summaryMarkdown: string;
}

// ============================================================================
// Gemini AI Tool Definitions & Interfaces
// ============================================================================

export interface GeminiFunctionDeclaration {
  name: string;
  description: string;
  parameters: {
    type: 'OBJECT';
    properties: Record<string, any>;
    required?: string[];
  };
}

// ============================================================================
// Core Calculation Logic
// ============================================================================

/**
 * Calculates the upfront transfer fee considering min/max fee constraints.
 */
export function calculateTransferFee(amount: number, offer: BalanceTransferOffer): number {
  let fee = amount * (offer.transferFeePercentage / 100);
  if (offer.transferFeeMin !== undefined && fee < offer.transferFeeMin) {
    fee = offer.transferFeeMin;
  }
  if (offer.transferFeeCap !== undefined && fee > offer.transferFeeCap) {
    fee = offer.transferFeeCap;
  }
  return Math.round(fee * 100) / 100;
}

/**
 * Calculates the Effective Annual Rate (APR) including upfront transfer fees annualized over the promo duration.
 */
export function calculateEffectiveApr(offer: BalanceTransferOffer, transferAmount: number): number {
  if (transferAmount <= 0) return offer.promoApr;
  const fee = calculateTransferFee(transferAmount, offer);
  const feeRatio = fee / transferAmount;
  const annualizedFeeRate = (feeRatio / (offer.promoDurationMonths / 12)) * 100;
  return Math.round((offer.promoApr + annualizedFeeRate) * 100) / 100;
}

/**
 * Simulates repayment on an account given monthly payment and APR rules.
 */
export function simulateRepayment(
  initialBalance: number,
  monthlyPayment: number,
  promoApr: number,
  promoDurationMonths: number,
  postPromoApr: number,
  maxMonths: number = 120
): { schedule: MonthlyBreakdown[]; totalInterestPaidPromo: number; totalInterestPaidPostPromo: number; monthsToPayoff: number } {
  let currentBalance = initialBalance;
  const schedule: MonthlyBreakdown[] = [];
  let totalInterestPaidPromo = 0;
  let totalInterestPaidPostPromo = 0;
  let month = 0;

  while (currentBalance > 0.01 && month < maxMonths) {
    month++;
    const isPromo = month <= promoDurationMonths;
    const currentRate = isPromo ? promoApr : postPromoApr;
    const monthlyRate = currentRate / 100 / 12;
    
    const interestCharged = Math.round(currentBalance * monthlyRate * 100) / 100;
    
    let payment = monthlyPayment;
    if (payment > currentBalance + interestCharged) {
      payment = currentBalance + interestCharged;
    }
    
    // If payment doesn't cover interest, force minimum progress to avoid infinite loop in simulation
    if (payment <= interestCharged) {
      payment = interestCharged + 5.00;
    }

    const endingBalance = Math.max(0, Math.round((currentBalance + interestCharged - payment) * 100) / 100);

    if (isPromo) {
      totalInterestPaidPromo += interestCharged;
    } else {
      totalInterestPaidPostPromo += interestCharged;
    }

    schedule.push({
      month,
      startingBalance: currentBalance,
      interestCharged,
      paymentMade: payment,
      endingBalance,
      isPromoPeriod: isPromo
    });

    currentBalance = endingBalance;
  }

  return {
    schedule,
    totalInterestPaidPromo: Math.round(totalInterestPaidPromo * 100) / 100,
    totalInterestPaidPostPromo: Math.round(totalInterestPaidPostPromo * 100) / 100,
    monthsToPayoff: month
  };
}

/**
 * Evaluates eligibility and compliance of an offer for a given criteria and card.
 */
export function evaluateEligibility(
  card: CardAccount,
  offer: BalanceTransferOffer,
  criteria: EvaluationCriteria
): { eligible: boolean; reasons: string[] } {
  const reasons: string[] = [];

  if (offer.minTransferAmount && criteria.targetTransferAmount < offer.minTransferAmount) {
    reasons.push(`Target transfer amount ($${criteria.targetTransferAmount}) is below minimum allowed ($${offer.minTransferAmount}).`);
  }

  if (offer.maxTransferAmount && criteria.targetTransferAmount > offer.maxTransferAmount) {
    reasons.push(`Target transfer amount ($${criteria.targetTransferAmount}) exceeds maximum allowed ($${offer.maxTransferAmount}).`);
  }

  if (card.issuer.toLowerCase() === offer.provider.toLowerCase()) {
    reasons.push(`Balance transfers are typically not allowed within the same card issuer (${card.issuer}).`);
  }

  if (criteria.creditScoreTier) {
    const scoreMap = { FAIR: 1, GOOD: 2, EXCELLENT: 3 };
    const requiredMap = { FAIR: 1, GOOD: 2, EXCELLENT: 3 };
    
    if (offer.creditScoreRequirement && scoreMap[criteria.creditScoreTier] < requiredMap[offer.creditScoreRequirement]) {
      reasons.push(`Credit score tier (${criteria.creditScoreTier}) does not meet offer requirement (${offer.creditScoreRequirement}).`);
    }
  }

  return {
    eligible: reasons.length === 0,
    reasons
  };
}

/**
 * Evaluates a single balance transfer offer against a current card account.
 */
export function evaluateOffer(
  card: CardAccount,
  offer: BalanceTransferOffer,
  criteria: EvaluationCriteria
): BalanceTransferEvaluation {
  const { eligible, reasons } = evaluateEligibility(card, offer, criteria);
  
  const transferAmount = Math.min(criteria.targetTransferAmount, card.currentBalance);
  const upfrontTransferFee = calculateTransferFee(transferAmount, offer);
  const startingTransferBalance = transferAmount + upfrontTransferFee;

  // Determine actual monthly payment
  let monthlyPayment = criteria.plannedMonthlyPayment;
  if (criteria.payoffStrategy === 'PAY_BEFORE_PROMO_EXPIRES') {
    monthlyPayment = Math.ceil(startingTransferBalance / offer.promoDurationMonths);
  }

  // Simulate Transfer Balance Repayment
  const transferSim = simulateRepayment(
    startingTransferBalance,
    monthlyPayment,
    offer.promoApr,
    offer.promoDurationMonths,
    offer.postPromoApr
  );

  // Simulate Baseline Repayment (Keeping money on current card)
  const baselineSim = simulateRepayment(
    transferAmount,
    monthlyPayment,
    card.currentApr,
    0, // No promo
    card.currentApr
  );

  const totalInterestPaid = transferSim.totalInterestPaidPromo + transferSim.totalInterestPaidPostPromo;
  const totalCost = Math.round((upfrontTransferFee + totalInterestPaid) * 100) / 100;
  const baselineTotalInterest = baselineSim.totalInterestPaidPromo + baselineSim.totalInterestPaidPostPromo;
  const netSavings = Math.round((baselineTotalInterest - totalCost) * 100) / 100;

  const payoffBeforePromoEnds = transferSim.monthsToPayoff <= offer.promoDurationMonths;
  const effectiveApr = calculateEffectiveApr(offer, transferAmount);

  // --- Scoring Engine (0-100) ---
  let savingsScore = 0;
  if (baselineTotalInterest > 0) {
    const savingsRatio = netSavings / baselineTotalInterest;
    savingsScore = Math.min(100, Math.max(0, savingsRatio * 100));
  }

  const feeRatio = upfrontTransferFee / transferAmount;
  let feeEfficiencyScore = Math.min(100, Math.max(0, (0.05 - feeRatio) * 2000)); // 0% fee = 100 pts, 5%+ fee = 0 pts

  let durationMatchScore = payoffBeforePromoEnds ? 100 : Math.max(0, 100 - (transferSim.monthsToPayoff - offer.promoDurationMonths) * 10);
  let riskScore = payoffBeforePromoEnds ? 100 : Math.max(20, 100 - (offer.postPromoApr - card.currentApr) * 5);

  if (!eligible) {
    savingsScore = 0;
    feeEfficiencyScore = 0;
    durationMatchScore = 0;
    riskScore = 0;
  }

  const overallScore = Math.round(
    savingsScore * 0.45 + feeEfficiencyScore * 0.20 + durationMatchScore * 0.20 + riskScore * 0.15
  );

  let recommendationTag: BalanceTransferEvaluation['recommendationTag'] = 'NEUTRAL';
  if (!eligible) {
    recommendationTag = 'NOT_RECOMMENDED';
  } else if (overallScore >= 80 && netSavings > 200) {
    recommendationTag = 'STRONGLY_RECOMMENDED';
  } else if (overallScore >= 60 && netSavings > 50) {
    recommendationTag = 'RECOMMENDED';
  } else if (netSavings <= 0) {
    recommendationTag = 'NOT_RECOMMENDED';
  }

  let summaryMessage = `Transferring $${transferAmount} to ${offer.offerName} saves approximately $${netSavings.toFixed(2)} total.`;
  if (!payoffBeforePromoEnds) {
    summaryMessage += ` Note: Debt won't be fully paid off before the ${offer.promoDurationMonths}-month promo ends.`;
  }

  return {
    offerId: offer.id,
    offerName: offer.offerName,
    provider: offer.provider,
    eligible,
    ineligibilityReasons: reasons,
    transferAmount,
    upfrontTransferFee,
    totalInterestPaidPromo: transferSim.totalInterestPaidPromo,
    totalInterestPaidPostPromo: transferSim.totalInterestPaidPostPromo,
    totalInterestPaid,
    totalCost,
    monthsToPayoff: transferSim.monthsToPayoff,
    payoffBeforePromoEnds,
    baselineTotalInterest,
    baselineMonthsToPayoff: baselineSim.monthsToPayoff,
    netSavings,
    effectiveApr,
    overallScore,
    scoreBreakdown: {
      savingsScore: Math.round(savingsScore),
      feeEfficiencyScore: Math.round(feeEfficiencyScore),
      durationMatchScore: Math.round(durationMatchScore),
      riskScore: Math.round(riskScore)
    },
    schedule: transferSim.schedule,
    recommendationTag,
    summaryMessage
  };
}

/**
 * Evaluates and ranks multiple balance transfer offers for a card account.
 */
export function evaluateAndRankOffers(
  card: CardAccount,
  offers: BalanceTransferOffer[],
  criteria: EvaluationCriteria
): MultiOfferComparisonResult {
  const evaluations = offers.map(offer => evaluateOffer(card, offer, criteria));

  // Sort by overall score descending
  evaluations.sort((a, b) => b.overallScore - a.overallScore);

  const eligibleOffers = evaluations.filter(e => e.eligible);

  let bestOverallOfferId = eligibleOffers.length > 0 ? eligibleOffers[0].offerId : undefined;
  
  let maxSavingsOfferId = eligibleOffers.length > 0 ? 
    [...eligibleOffers].sort((a, b) => b.netSavings - a.netSavings)[0].offerId : undefined;

  let fastestPayoffOfferId = eligibleOffers.length > 0 ? 
    [...eligibleOffers].sort((a, b) => a.monthsToPayoff - b.monthsToPayoff)[0].offerId : undefined;

  const summaryMarkdown = generateMarkdownSummary(card, evaluations, criteria);

  return {
    cardAccount: card,
    targetTransferAmount: criteria.targetTransferAmount,
    evaluations,
    bestOverallOfferId,
    maxSavingsOfferId,
    fastestPayoffOfferId,
    summaryMarkdown
  };
}

// ============================================================================
// Formatting & Presentation Helpers
// ============================================================================

/**
 * Generates a clean Markdown representation for user-facing UI / AI responses.
 */
export function generateMarkdownSummary(
  card: CardAccount,
  evaluations: BalanceTransferEvaluation[],
  criteria: EvaluationCriteria
): string {
  let md = `### Balance Transfer Evaluation Report\n\n`;
  md += `**Current Account:** ${card.accountName} (${card.issuer}) | **Balance:** $${card.currentBalance.toLocaleString()} | **Current APR:** ${card.currentApr}%\n`;
  md += `**Target Transfer:** $${criteria.targetTransferAmount.toLocaleString()} | **Monthly Payment Plan:** $${criteria.plannedMonthlyPayment.toLocaleString()}/mo\n\n`;

  md += `| Rank | Offer Name | Fee | Promo APR / Duration | Months to Payoff | Net Savings | Score | Rec |\n`;
  md += `| :--- | :--- | :--- | :--- | :--- | :--- | :--- | :--- |\n`;

  evaluations.forEach((e, idx) => {
    const feeStr = `$${e.upfrontTransferFee.toFixed(0)}`;
    const savingsStr = e.netSavings >= 0 ? `+$${e.netSavings.toFixed(0)}` : `-$${Math.abs(e.netSavings).toFixed(0)}`;
    const recStr = e.eligible ? e.recommendationTag.replace('_', ' ') : 'INELIGIBLE';
    
    md += `| ${idx + 1} | **${e.offerName}** (${e.provider}) | ${feeStr} | 0% for ${e.monthsToPayoff}m | ${e.monthsToPayoff} mos | **${savingsStr}** | ${e.overallScore}/100 | \`${recStr}\` |\n`;
  });

  md += `\n\n#### Key Recommendations:\n`;
  const best = evaluations.find(e => e.eligible && e.recommendationTag === 'STRONGLY_RECOMMENDED') || evaluations[0];
  if (best && best.eligible) {
    md += `- **Top Choice:** **${best.offerName}** yields the highest total benefit with **$${best.netSavings.toFixed(2)}** in estimated savings.\n`;
    if (!best.payoffBeforePromoEnds) {
      md += `- âš ï¸  **Warning:** The debt will spill past the promotional window. Consider increasing monthly payments to $${Math.ceil((best.transferAmount + best.upfrontTransferFee) / 12)}/mo to eliminate interest entirely.\n`;
    }
  } else {
    md += `- No balance transfer offer significantly outperforms keeping the balance on the current card under the specified payment strategy.\n`;
  }

  return md;
}

// ============================================================================
// Gemini AI Tool Definitions & Handler Integrations
// ============================================================================

/**
 * Returns Gemini AI-compatible tool function declarations.
 */
export function getGeminiBalanceTransferTools(): { functionDeclarations: GeminiFunctionDeclaration[] } {
  return {
    functionDeclarations: [
      {
        name: 'evaluateSingleBalanceTransferOffer',
        description: 'Calculates interest savings, upfront fees, effective APR, repayment timeline, and suitability score for a single balance transfer offer.',
        parameters: {
          type: 'OBJECT',
          properties: {
            card: {
              type: 'OBJECT',
              description: 'Details of current card account being transferred from',
              properties: {
                id: { type: 'STRING' },
                accountName: { type: 'STRING' },
                issuer: { type: 'STRING' },
                currentBalance: { type: 'NUMBER' },
                currentApr: { type: 'NUMBER' }
              },
              required: ['accountName', 'issuer', 'currentBalance', 'currentApr']
            },
            offer: {
              type: 'OBJECT',
              description: 'Balance transfer promotional offer details',
              properties: {
                id: { type: 'STRING' },
                offerName: { type: 'STRING' },
                provider: { type: 'STRING' },
                transferFeePercentage: { type: 'NUMBER' },
                promoApr: { type: 'NUMBER' },
                promoDurationMonths: { type: 'NUMBER' },
                postPromoApr: { type: 'NUMBER' }
              },
              required: ['offerName', 'provider', 'transferFeePercentage', 'promoApr', 'promoDurationMonths', 'postPromoApr']
            },
            criteria: {
              type: 'OBJECT',
              description: 'User preference criteria for calculation',
              properties: {
                targetTransferAmount: { type: 'NUMBER' },
                plannedMonthlyPayment: { type: 'NUMBER' },
                payoffStrategy: { type: 'STRING', enum: ['MINIMUM_PAYMENT', 'FIXED_PAYMENT', 'PAY_BEFORE_PROMO_EXPIRES'] }
              },
              required: ['targetTransferAmount', 'plannedMonthlyPayment', 'payoffStrategy']
            }
          },
          required: ['card', 'offer', 'criteria']
        }
      },
      {
        name: 'compareMultipleBalanceTransferOffers',
        description: 'Ranks multiple balance transfer offers for a card account, identifying max savings and generating a presentation markdown table.',
        parameters: {
          type: 'OBJECT',
          properties: {
            card: {
              type: 'OBJECT',
              properties: {
                id: { type: 'STRING' },
                accountName: { type: 'STRING' },
                issuer: { type: 'STRING' },
                currentBalance: { type: 'NUMBER' },
                currentApr: { type: 'NUMBER' }
              },
              required: ['accountName', 'issuer', 'currentBalance', 'currentApr']
            },
            offers: {
              type: 'ARRAY',
              description: 'List of balance transfer offers to compare'
            },
            criteria: {
              type: 'OBJECT',
              properties: {
                targetTransferAmount: { type: 'NUMBER' },
                plannedMonthlyPayment: { type: 'NUMBER' },
                payoffStrategy: { type: 'STRING' }
              },
              required: ['targetTransferAmount', 'plannedMonthlyPayment', 'payoffStrategy']
            }
          },
          required: ['card', 'offers', 'criteria']
        }
      },
      {
        name: 'calculateEffectiveApr',
        description: 'Calculates effective APR including transfer fees for an offer.',
        parameters: {
          type: 'OBJECT',
          properties: {
            transferAmount: { type: 'NUMBER' },
            transferFeePercentage: { type: 'NUMBER' },
            promoApr: { type: 'NUMBER' },
            promoDurationMonths: { type: 'NUMBER' }
          },
          required: ['transferAmount', 'transferFeePercentage', 'promoApr', 'promoDurationMonths']
        }
      }
    ]
  };
}

/**
 * Dispatcher function to handle tool call requests received directly from Gemini AI responses.
 */
export async function executeGeminiToolCall(functionName: string, args: any): Promise<any> {
  switch (functionName) {
    case 'evaluateSingleBalanceTransferOffer': {
      const card: CardAccount = { id: 'c1', ...args.card };
      const offer: BalanceTransferOffer = { id: 'o1', ...args.offer };
      const criteria: EvaluationCriteria = args.criteria;
      return evaluateOffer(card, offer, criteria);
    }

    case 'compareMultipleBalanceTransferOffers': {
      const card: CardAccount = { id: 'c1', ...args.card };
      const offers: BalanceTransferOffer[] = args.offers.map((o: any, idx: number) => ({ id: `o_${idx}`, ...o }));
      const criteria: EvaluationCriteria = args.criteria;
      return evaluateAndRankOffers(card, offers, criteria);
    }

    case 'calculateEffectiveApr': {
      const dummyOffer: BalanceTransferOffer = {
        id: 'tmp',
        offerName: 'Temp',
        provider: 'Temp',
        transferFeePercentage: args.transferFeePercentage,
        promoApr: args.promoApr,
        promoDurationMonths: args.promoDurationMonths,
        postPromoApr: args.promoApr,
        requiresNewAccount: false
      };
      return {
        effectiveApr: calculateEffectiveApr(dummyOffer, args.transferAmount),
        upfrontFee: calculateTransferFee(args.transferAmount, dummyOffer)
      };
    }

    default:
      throw new Error(`Unknown Gemini tool call function name: ${functionName}`);
  }
}