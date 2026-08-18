export interface BalanceTransferOffer {
  id: string;
  name: string;
  transferAmount: number;
  promoApr: number; // e.g., 0.00 for 0% APR
  promoDurationMonths: number;
  postPromoApr: number; // e.g., 0.2199 for 21.99%
  transferFeePercent: number; // e.g., 0.03 for 3%
  transferFeeFlat?: number; // e.g., 5 for $5 minimum
}

export interface BorrowerProfile {
  creditLimit: number;
  currentBalance: number;
  isMilitary: boolean; // Triggers Military Lending Act (MLA) 36% MAPR cap
  stateOfResidence: string;
}

export interface ComplianceResult {
  isCompliant: boolean;
  violations: string[];
  warnings: string[];
  disclosures: string[];
  metrics: {
    calculatedFee: number;
    totalRequestedTransfer: number;
    postTransferUtilization: number;
    estimatedMapr: number; // Military Annual Percentage Rate
  };
}

// State-specific maximum APR limits (simplified for compliance engine demonstration)
const STATE_APR_CAPS: Record<string, number> = {
  NY: 0.16, // New York civil usury cap (exceptions exist, but used here for strict compliance)
  TX: 0.24,
  CA: 0.30,
  FL: 0.18,
};

/**
 * Calculates the Military Annual Percentage Rate (MAPR) under the Military Lending Act.
 * MAPR includes the APR plus ancillary fees (like balance transfer fees) annualized over the promo period.
 */
export function calculateMAPR(offer: BalanceTransferOffer, calculatedFee: number): number {
  if (offer.promoDurationMonths <= 0) return offer.promoApr;
  
  // Annualize the transfer fee over the promotional period
  const feeRatio = calculatedFee / offer.transferAmount;
  const annualizedFeeRate = (feeRatio / offer.promoDurationMonths) * 12;
  
  return offer.promoApr + annualizedFeeRate;
}

/**
 * Evaluates a balance transfer offer against regulatory compliance rules,
 * including the CARD Act, Military Lending Act (MLA), Truth in Lending Act (TILA),
 * and state-specific usury caps.
 */
export function evaluateCompliance(
  offer: BalanceTransferOffer,
  borrower: BorrowerProfile
): ComplianceResult {
  const violations: string[] = [];
  const warnings: string[] = [];
  const disclosures: string[] = [];

  // 1. Calculate Fees
  const percentageFee = offer.transferAmount * offer.transferFeePercent;
  const flatFee = offer.transferFeeFlat || 0;
  const calculatedFee = Math.max(percentageFee, flatFee);
  const totalRequestedTransfer = offer.transferAmount + calculatedFee;

  // 2. Credit Risk & Utilization Limits
  const availableCredit = borrower.creditLimit - borrower.currentBalance;
  const postTransferUtilization = (borrower.currentBalance + totalRequestedTransfer) / borrower.creditLimit;

  if (totalRequestedTransfer > availableCredit) {
    violations.push(
      `Transaction exceeds available credit limit. Required: $${totalRequestedTransfer.toFixed(2)}, Available: $${availableCredit.toFixed(2)}`
    );
  } else if (postTransferUtilization > 0.90) {
    warnings.push(
      `High credit utilization warning: Post-transfer utilization will be ${(postTransferUtilization * 100).toFixed(1)}%, which may negatively impact credit scores.`
    );
  }

  // 3. CARD Act Compliance: Promotional Rate Duration
  // Under the CARD Act, promotional rates must last at least 6 months.
  if (offer.promoDurationMonths < 6) {
    violations.push(
      `CARD Act Violation: Promotional rate duration must be at least 6 months. Provided: ${offer.promoDurationMonths} months.`
    );
  }

  // 4. Military Lending Act (MLA) Compliance
  // Active duty military and dependents are capped at a 36% MAPR, which includes balance transfer fees.
  const estimatedMapr = calculateMAPR(offer, calculatedFee);
  if (borrower.isMilitary) {
    if (estimatedMapr > 0.36) {
      violations.push(
        `Military Lending Act (MLA) Violation: The calculated MAPR of ${(estimatedMapr * 100).toFixed(2)}% exceeds the federal 36% cap for covered borrowers.`
      );
    }
    disclosures.push(
      "MLA Disclosure: Federal law provides important protections to members of the Armed Forces and their dependents relating to extensions of consumer credit, including an Annual Percentage Rate cap of 36%."
    );
  }

  // 5. State-Specific Usury Caps (TILA / State Law Alignment)
  const stateCap = STATE_APR_CAPS[borrower.stateOfResidence.toUpperCase()];
  if (stateCap !== undefined) {
    if (offer.postPromoApr > stateCap) {
      violations.push(
        `State Usury Law Violation: The post-promotional APR of ${(offer.postPromoApr * 100).toFixed(2)}% exceeds the maximum allowed rate of ${(stateCap * 100).toFixed(2)}% in ${borrower.stateOfResidence}.`
      );
    }
  }

  // 6. Promotional Transparency & TILA Disclosures
  // Ensure clear and conspicuous disclosure of the promotional rate, duration, and the "go-to" rate.
  disclosures.push(
    `TILA Disclosure: A promotional APR of ${(offer.promoApr * 100).toFixed(2)}% will apply to the transferred balance of $${offer.transferAmount.toFixed(2)} for the first ${offer.promoDurationMonths} months. After that, the standard variable purchase/transfer APR of ${(offer.postPromoApr * 100).toFixed(2)}% will apply.`
  );

  disclosures.push(
    `Fee Disclosure: A balance transfer fee of ${(offer.transferFeePercent * 100).toFixed(2)}% (minimum $${flatFee.toFixed(2)}) applies to this transaction. The total fee charged will be $${calculatedFee.toFixed(2)}, bringing the total balance increase to $${totalRequestedTransfer.toFixed(2)}.`
  );

  if (offer.promoApr === 0) {
    disclosures.push(
      "Loss of Promotional APR: If you make a late payment or otherwise default on your account, we may terminate the promotional APR and apply the standard penalty APR."
    );
  }

  return {
    isCompliant: violations.length === 0,
    violations,
    warnings,
    disclosures,
    metrics: {
      calculatedFee,
      totalRequestedTransfer,
      postTransferUtilization,
      estimatedMapr,
    },
  };
}

/**
 * Generates a standardized compliance report summary for audit logging.
 */
export function generateComplianceReport(
  offer: BalanceTransferOffer,
  borrower: BorrowerProfile,
  result: ComplianceResult
): string {
  const timestamp = new Date().toISOString();
  return `
======================================================================
BALANCE TRANSFER COMPLIANCE AUDIT REPORT
Timestamp: ${timestamp}
Offer ID: ${offer.id} (${offer.name})
Borrower State: ${borrower.stateOfResidence} | Military Status: ${borrower.isMilitary ? "ACTIVE" : "STANDARD"}
======================================================================
[METRICS]
- Requested Transfer Amount: $${offer.transferAmount.toFixed(2)}
- Calculated Transfer Fee: $${result.metrics.calculatedFee.toFixed(2)}
- Total Debt Post-Transfer: $${result.metrics.totalRequestedTransfer.toFixed(2)}
- Post-Transfer Credit Utilization: ${(result.metrics.postTransferUtilization * 100).toFixed(2)}%
- Estimated MAPR (MLA Standard): ${(result.metrics.estimatedMapr * 100).toFixed(2)}%

[COMPLIANCE STATUS]
Status: ${result.isCompliant ? "APPROVED / COMPLIANT" : "REJECTED / NON-COMPLIANT"}

${result.violations.length > 0 ? `[VIOLATIONS]\n${result.violations.map((v, i) => `${i + 1}. ${v}`).join("\n")}\n` : ""}
${result.warnings.length > 0 ? `[WARNINGS]\n${result.warnings.map((w, i) => `${i + 1}. ${w}`).join("\n")}\n` : ""}
[REQUIRED DISCLOSURES]
${result.disclosures.map((d, i) => `[D-${i + 1}] ${d}`).join("\n")}
======================================================================
`;
}