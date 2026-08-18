export interface TaxLien {
  id: string;
  county: string;
  state: string;
  parcelId: string;
  faceValue: number; // The original delinquent tax amount
  bidRate: number; // The interest rate won at auction (as a decimal, e.g., 0.12 for 12%)
  auctionDate: Date;
  subsequentTaxesPaid: SubsequentTax[];
  flatPenalties: number; // Flat fees/penalties added by the county
  additionalFees: number; // Recording fees, search fees, etc.
}

export interface SubsequentTax {
  amount: number;
  datePaid: Date;
  interestRate: number; // Usually the maximum statutory rate (e.g., 18% or 0.18)
}

export interface RedemptionParams {
  lien: TaxLien;
  redemptionDate: Date;
  stateSpecificRules?: StateRedemptionRules;
}

export interface StateRedemptionRules {
  minimumInterestMonths?: number; // e.g., Florida has a 5% minimum interest rule (equivalent to 3-4 months depending on rate)
  useSimpleInterest: boolean; // True for simple interest, false if compounded
  compoundingFrequency?: 'monthly' | 'annually';
  gracePeriodDays?: number;
  penaltyRate?: number; // One-time penalty rate applied to face value (e.g., 8% in some states)
}

export interface RedemptionCalculation {
  faceValue: number;
  lienInterest: number;
  subsequentTaxesPrincipal: number;
  subsequentTaxesInterest: number;
  flatPenalties: number;
  additionalFees: number;
  totalRedemptionValue: number;
  investorReturnOnInvestment: number; // ROI as a decimal
  daysHeld: number;
}

export interface TaxEstimationInput {
  marketValue: number;
  assessmentRatio: number; // e.g., 0.10 for 10% assessment ratio, or 1.0 for 100%
  millageRates: MillageRate[];
  exemptions: Exemption[];
  specialAssessments: number; // Flat fees like trash, sewer, lighting districts
}

export interface MillageRate {
  authorityName: string;
  rate: number; // Mill rate (e.g., 15 mills = 15.0, which is $15 per $1,000 of assessed value)
}

export interface Exemption {
  name: string;
  amount: number; // Flat deduction from assessed value (e.g., $25,000 homestead exemption)
  type: 'flat' | 'percentage';
  percentageLimit?: number; // If percentage, the max percentage of assessed value (e.g., 0.50 for 50%)
}

export interface TaxEstimationResult {
  marketValue: number;
  assessedValue: number;
  taxableValue: number;
  totalExemptionsValue: number;
  estimatedAdValoremTax: number;
  specialAssessments: number;
  totalEstimatedTax: number;
  effectiveTaxRate: number; // Total tax divided by market value
  breakdown: TaxBreakdownItem[];
}

export interface TaxBreakdownItem {
  authorityName: string;
  millageRate: number;
  calculatedTax: number;
}

/**
 * Calculates the yield on a tax lien investment based on holding period and interest structure.
 * 
 * @param principal The initial investment amount (face value or bid amount)
 * @param rate The annual interest rate (as a decimal, e.g., 0.18 for 18%)
 * @param daysHeld Number of days the investment was held
 * @param compounding Compounding frequency ('none', 'monthly', 'annually')
 * @returns The calculated interest yield amount
 */
export function calculateLienYield(
  principal: number,
  rate: number,
  daysHeld: number,
  compounding: 'none' | 'monthly' | 'annually' = 'none'
): number {
  if (principal <= 0 || rate <= 0 || daysHeld <= 0) {
    return 0;
  }

  const years = daysHeld / 365;

  if (compounding === 'none') {
    // Simple Interest: Principal * Rate * Time
    return parseFloat((principal * rate * years).toFixed(2));
  } else if (compounding === 'monthly') {
    // Monthly Compounding: P * (1 + r/12)^(12*t) - P
    const months = (daysHeld / 365) * 12;
    const totalAmount = principal * Math.pow(1 + rate / 12, months);
    return parseFloat((totalAmount - principal).toFixed(2));
  } else {
    // Annual Compounding: P * (1 + r)^t - P
    const totalAmount = principal * Math.pow(1 + rate, years);
    return parseFloat((totalAmount - principal).toFixed(2));
  }
}

/**
 * Calculates the total redemption value of a tax lien, including interest, subsequent taxes, and penalties.
 * Handles state-specific nuances like minimum interest periods and grace periods.
 * 
 * @param params RedemptionParams containing the lien details, redemption date, and state rules
 * @returns RedemptionCalculation breakdown
 */
export function calculateTaxLienRedemption(params: RedemptionParams): RedemptionCalculation {
  return calculateRedemptionValue(params);
}

/**
 * Calculates the total redemption value of a tax lien, including interest, subsequent taxes, and penalties.
 * Handles state-specific nuances like minimum interest periods and grace periods.
 * 
 * @param params RedemptionParams containing the lien details, redemption date, and state rules
 * @returns RedemptionCalculation breakdown
 */
export function calculateRedemptionValue(params: RedemptionParams): RedemptionCalculation {
  const { lien, redemptionDate, stateSpecificRules } = params;
  
  const auctionDate = new Date(lien.auctionDate);
  const redeemDate = new Date(redemptionDate);
  
  // Calculate days held
  const diffTime = Math.abs(redeemDate.getTime() - auctionDate.getTime());
  let daysHeld = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (redeemDate < auctionDate) {
    daysHeld = 0;
  }

  // Apply grace period if applicable
  if (stateSpecificRules?.gracePeriodDays && daysHeld <= stateSpecificRules.gracePeriodDays) {
    daysHeld = 0;
  }

  // Calculate months held (rounded up to the nearest month, standard in many states)
  let monthsHeld = Math.ceil(daysHeld / 30.417); // Average days in a month

  // Apply minimum interest months (e.g., Florida's 5% minimum interest rule)
  if (stateSpecificRules?.minimumInterestMonths && monthsHeld < stateSpecificRules.minimumInterestMonths) {
    monthsHeld = stateSpecificRules.minimumInterestMonths;
  }

  // Calculate Lien Interest
  let lienInterest = 0;
  if (daysHeld > 0 || (stateSpecificRules?.minimumInterestMonths && stateSpecificRules.minimumInterestMonths > 0)) {
    if (stateSpecificRules?.useSimpleInterest) {
      // Simple interest based on monthly increments (standard for tax liens)
      const effectiveYears = monthsHeld / 12;
      lienInterest = lien.faceValue * lien.bidRate * effectiveYears;
    } else {
      // Compounded interest
      const compoundingFreq = stateSpecificRules?.compoundingFrequency || 'monthly';
      lienInterest = calculateLienYield(
        lien.faceValue,
        lien.bidRate,
        daysHeld,
        compoundingFreq
      );
    }
  }

  // Apply state-specific flat penalty rate on face value (e.g., 8% flat penalty in Georgia)
  if (stateSpecificRules?.penaltyRate && daysHeld > 0) {
    lienInterest += lien.faceValue * stateSpecificRules.penaltyRate;
  }

  // Calculate Subsequent Taxes and their accrued interest
  let subsequentTaxesPrincipal = 0;
  let subsequentTaxesInterest = 0;

  for (const subTax of lien.subsequentTaxesPaid) {
    const subTaxPaidDate = new Date(subTax.datePaid);
    if (redeemDate > subTaxPaidDate) {
      const subDiffTime = Math.abs(redeemDate.getTime() - subTaxPaidDate.getTime());
      const subDaysHeld = Math.ceil(subDiffTime / (1000 * 60 * 60 * 24));
      const subMonthsHeld = Math.ceil(subDaysHeld / 30.417);
      
      subsequentTaxesPrincipal += subTax.amount;
      
      // Subsequent taxes usually accrue simple interest monthly at the statutory rate
      const subEffectiveYears = subMonthsHeld / 12;
      const subInterest = subTax.amount * subTax.interestRate * subEffectiveYears;
      subsequentTaxesInterest += subInterest;
    } else {
      // Paid after redemption date (should not happen in normal scenarios, but handled for safety)
      subsequentTaxesPrincipal += subTax.amount;
    }
  }

  // Round all financial figures to 2 decimal places
  lienInterest = parseFloat(lienInterest.toFixed(2));
  subsequentTaxesPrincipal = parseFloat(subsequentTaxesPrincipal.toFixed(2));
  subsequentTaxesInterest = parseFloat(subsequentTaxesInterest.toFixed(2));
  
  const totalRedemptionValue = parseFloat(
    (
      lien.faceValue +
      lienInterest +
      subsequentTaxesPrincipal +
      subsequentTaxesInterest +
      lien.flatPenalties +
      lien.additionalFees
    ).toFixed(2)
  );

  const totalInvested = lien.faceValue + subsequentTaxesPrincipal + lien.additionalFees;
  const totalReturn = totalRedemptionValue - totalInvested;
  const investorReturnOnInvestment = totalInvested > 0 ? parseFloat((totalReturn / totalInvested).toFixed(4)) : 0;

  return {
    faceValue: lien.faceValue,
    lienInterest,
    subsequentTaxesPrincipal,
    subsequentTaxesInterest,
    flatPenalties: lien.flatPenalties,
    additionalFees: lien.additionalFees,
    totalRedemptionValue,
    investorReturnOnInvestment,
    daysHeld,
  };
}

/**
 * Estimates the property tax liability based on market value, assessment ratios, millage rates, and exemptions.
 * 
 * @param params TaxEstimationInput parameters
 * @returns TaxEstimationResult containing detailed tax breakdown
 */
export function estimatePropertyTax(params: TaxEstimationInput): TaxEstimationResult {
  const { marketValue, assessmentRatio, millageRates, exemptions, specialAssessments } = params;

  // 1. Calculate Assessed Value
  const assessedValue = parseFloat((marketValue * assessmentRatio).toFixed(2));

  // 2. Calculate Exemptions
  let totalExemptionsValue = 0;
  for (const exemption of exemptions) {
    if (exemption.type === 'flat') {
      totalExemptionsValue += exemption.amount;
    } else if (exemption.type === 'percentage') {
      let exemptionAmount = assessedValue * exemption.amount;
      if (exemption.percentageLimit && exemptionAmount > exemption.percentageLimit) {
        exemptionAmount = exemption.percentageLimit;
      }
      totalExemptionsValue += exemptionAmount;
    }
  }
  totalExemptionsValue = parseFloat(Math.min(totalExemptionsValue, assessedValue).toFixed(2));

  // 3. Calculate Taxable Value
  const taxableValue = parseFloat(Math.max(0, assessedValue - totalExemptionsValue).toFixed(2));

  // 4. Calculate Ad Valorem Taxes based on Millage Rates
  // Millage rate is expressed in mills (1 mill = $1 per $1,000 of taxable value, or 0.001)
  let estimatedAdValoremTax = 0;
  const breakdown: TaxBreakdownItem[] = [];

  for (const millage of millageRates) {
    const calculatedTax = parseFloat((taxableValue * (millage.rate / 1000)).toFixed(2));
    estimatedAdValoremTax += calculatedTax;
    breakdown.push({
      authorityName: millage.authorityName,
      millageRate: millage.rate,
      calculatedTax,
    });
  }

  estimatedAdValoremTax = parseFloat(estimatedAdValoremTax.toFixed(2));

  // 5. Calculate Total Estimated Tax
  const totalEstimatedTax = parseFloat((estimatedAdValoremTax + specialAssessments).toFixed(2));

  // 6. Calculate Effective Tax Rate
  const effectiveTaxRate = marketValue > 0 ? parseFloat((totalEstimatedTax / marketValue).toFixed(6)) : 0;

  return {
    marketValue,
    assessedValue,
    taxableValue,
    totalExemptionsValue,
    estimatedAdValoremTax,
    specialAssessments,
    totalEstimatedTax,
    effectiveTaxRate,
    breakdown,
  };
}

/**
 * Calculates the break-even and potential profit of bidding down an interest rate at a tax lien auction.
 * In many states (e.g., Florida, Arizona, New Jersey), investors bid down the interest rate they are willing to accept.
 * 
 * @param maxRate The maximum statutory rate allowed (e.g., 18% or 0.18)
 * @param bidRate The rate you are considering bidding (e.g., 5% or 0.05)
 * @param purchasePrice The total acquisition cost (face value + premium/fees)
 * @param estimatedRedemptionMonths Estimated number of months until the owner redeems the lien
 * @returns Object containing estimated profit, yield, and comparison against the maximum rate
 */
export function calculateBidDownBreakEven(
  maxRate: number,
  bidRate: number,
  purchasePrice: number,
  estimatedRedemptionMonths: number
): {
  estimatedProfitAtBidRate: number;
  estimatedProfitAtMaxRate: number;
  opportunityCost: number;
  yieldAtBidRate: number;
  yieldAtMaxRate: number;
} {
  const years = estimatedRedemptionMonths / 12;

  // Simple interest calculation for comparison
  const estimatedProfitAtBidRate = parseFloat((purchasePrice * bidRate * years).toFixed(2));
  const estimatedProfitAtMaxRate = parseFloat((purchasePrice * maxRate * years).toFixed(2));
  const opportunityCost = parseFloat((estimatedProfitAtMaxRate - estimatedProfitAtBidRate).toFixed(2));

  const yieldAtBidRate = purchasePrice > 0 ? parseFloat((estimatedProfitAtBidRate / purchasePrice).toFixed(4)) : 0;
  const yieldAtMaxRate = purchasePrice > 0 ? parseFloat((estimatedProfitAtMaxRate / purchasePrice).toFixed(4)) : 0;

  return {
    estimatedProfitAtBidRate,
    estimatedProfitAtMaxRate,
    opportunityCost,
    yieldAtBidRate,
    yieldAtMaxRate,
  };
}

/**
 * Helper to convert Millage Rate to Percentage
 * @param millage The millage rate (e.g., 24.5)
 * @returns The percentage representation (e.g., 0.0245)
 */
export function millageToPercentage(millage: number): number {
  return millage / 1000;
}

/**
 * Helper to convert Percentage to Millage Rate
 * @param percentage The percentage as a decimal (e.g., 0.0245)
 * @returns The millage rate (e.g., 24.5)
 */
export function percentageToMillage(percentage: number): number {
  return percentage * 1000;
}

export const taxCalculator = {
  calculateTaxLienRedemption,
  estimatePropertyTax,
  calculateBidDownBreakEven,
  millageToPercentage,
  percentageToMillage,
};


export default taxCalculator;
