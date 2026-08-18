// FIX: Changed named import to default import to resolve TS2595
import seedrandom from 'seedrandom';

export interface BalanceTransferOffer {
  id: string;
  creditScore: number;
  requestedAmount: number;
  apr: number;
  complianceViolation: boolean;
  violationReason: string | null;
}

/**
 * Generates 100 mock balance transfer offers using a seedable random generator.
 * Matches logic where lower credit scores correlate with higher APRs and 
 * higher requested amounts increase the likelihood of compliance flags.
 */
export const generateBalanceTransferComplianceMockData = (seed: string = 'compliance-2024'): BalanceTransferOffer[] => {
  // seedrandom is now the default constructor
  const rng = seedrandom(seed);
  const offers: BalanceTransferOffer[] = [];

  for (let i = 1; i <= 100; i++) {
    const creditScore = Math.floor(rng() * (850 - 580 + 1)) + 580;
    const requestedAmount = Math.floor(rng() * (50000 - 1000 + 1)) + 1000;
    
    // APR logic: Inverse relationship with credit score
    const baseApr = 25 - ((creditScore - 580) / (850 - 580)) * 20;
    const apr = parseFloat((baseApr + rng() * 2).toFixed(2));

    // Compliance logic: High amounts or very low scores trigger violations
    let complianceViolation = false;
    let violationReason = null;

    if (requestedAmount > 40000 && creditScore < 650) {
      complianceViolation = true;
      violationReason = 'High-risk debt-to-income ratio';
    } else if (creditScore < 600) {
      complianceViolation = true;
      violationReason = 'Credit score below institutional threshold';
    } else if (rng() > 0.95) {
      complianceViolation = true;
      violationReason = 'AML flag: Unusual transaction pattern';
    }

    offers.push({
      id: `BT-${1000 + i}`,
      creditScore,
      requestedAmount,
      apr,
      complianceViolation,
      violationReason,
    });
  }

  return offers;
};

export const balanceTransferComplianceMockData = generateBalanceTransferComplianceMockData();
