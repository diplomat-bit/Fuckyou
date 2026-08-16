import { Request, Response, Router } from 'express';

export interface Donor {
  id: string;
  name: string;
  citizenship: string;
  employer?: string;
  occupation?: string;
  isForeignNational: boolean;
}

export interface Contribution {
  id: string;
  donorId: string;
  amount: number;
  date: Date;
  isAnonymous: boolean;
}

export interface DisclosureReport {
  reportingPeriod: string;
  totalContributed: number;
  disclosedContributions: Contribution[];
  anonymousContributions: Contribution[];
  flaggedContributions: { contribution: Contribution; reason: string }[];
}

export class TaxExemptContributionTracker {
  private donors: Map<string, Donor> = new Map();
  private contributions: Contribution[] = [];

  constructor(private reportingPeriod: string) {}

  public registerDonor(donor: Donor): void {
    this.donors.set(donor.id, donor);
  }

  public recordContribution(contribution: Contribution): void {
    this.contributions.push(contribution);
  }

  public generateDisclosureReport(): DisclosureReport {
    let totalContributed = 0;
    const disclosedContributions: Contribution[] = [];
    const anonymousContributions: Contribution[] = [];
    const flaggedContributions: { contribution: Contribution; reason: string }[] = [];

    for (const contribution of this.contributions) {
      totalContributed += contribution.amount;
      const donor = this.donors.get(contribution.donorId);

      if (contribution.isAnonymous) {
        anonymousContributions.push(contribution);
        if (contribution.amount > 50) {
          flaggedContributions.push({
            contribution,
            reason: "Anonymous contribution exceeds $50 limit for political committees.",
          });
        }
      } else {
        disclosedContributions.push(contribution);
        if (!donor) {
          flaggedContributions.push({
            contribution,
            reason: "Donor details missing for disclosed contribution.",
          });
          continue;
        }

        if (donor.isForeignNational) {
          flaggedContributions.push({
            contribution,
            reason: "Foreign national contributions are strictly prohibited under FEC rules.",
          });
        }

        if (contribution.amount >= 200 && (!donor.employer || !donor.occupation)) {
          flaggedContributions.push({
            contribution,
            reason: "Contributions of $200 or more require donor employer and occupation details.",
          });
        }
      }
    }

    return {
      reportingPeriod: this.reportingPeriod,
      totalContributed,
      disclosedContributions,
      anonymousContributions,
      flaggedContributions,
    };
  }
}

export interface Transaction {
  from: string;
  to: string;
  amount: number;
}

export class RecursiveLedgerNettingEngine {
  public static netTransactions(transactions: Transaction[]): Transaction[] {
    const balances: Record<string, number> = {};

    for (const tx of transactions) {
      balances[tx.from] = (balances[tx.from] || 0) - tx.amount;
      balances[tx.to] = (balances[tx.to] || 0) + tx.amount;
    }

    const debtors: { entity: string; balance: number }[] = [];
    const creditors: { entity: string; balance: number }[] = [];

    for (const entity in balances) {
      const balance = balances[entity];
      if (balance < -0.01) {
        debtors.push({ entity, balance: -balance });
      } else if (balance > 0.01) {
        creditors.push({ entity, balance });
      }
    }

    const nettedTransactions: Transaction[] = [];
    let dIdx = 0;
    let cIdx = 0;

    while (dIdx < debtors.length && cIdx < creditors.length) {
      const debtor = debtors[dIdx];
      const creditor = creditors[cIdx];
      const amountToNet = Math.min(debtor.balance, creditor.balance);

      nettedTransactions.push({
        from: debtor.entity,
        to: creditor.entity,
        amount: parseFloat(amountToNet.toFixed(2)),
      });

      debtor.balance -= amountToNet;
      creditor.balance -= amountToNet;

      if (debtor.balance < 0.01) dIdx++;
      if (creditor.balance < 0.01) cIdx++;
    }

    return nettedTransactions;
  }
}

export enum ExpenditureType {
  EXPRESS_ADVOCACY = "EXPRESS_ADVOCACY",
  ISSUE_ADVOCACY = "ISSUE_ADVOCACY",
  COORDINATED_COMMUNICATION = "COORDINATED_COMMUNICATION",
  OPERATING_EXPENSE = "OPERATING_EXPENSE",
}

export interface Expenditure {
  id: string;
  type: ExpenditureType;
  amount: number;
  description: string;
  isCoordinatedWithCandidate: boolean;
}

export class PoliticalSpeechSpendingCalculator {
  private expenditures: Expenditure[] = [];
  constructor(private netInvestmentIncome: number) {}

  public addExpenditure(expenditure: Expenditure): void {
    this.expenditures.push(expenditure);
  }

  public calculateTaxExposure(taxRate: number = 0.21) {
    let totalSpending = 0;
    let exemptFunctionSpending = 0;
    let nonExemptFunctionSpending = 0;
    const complianceViolations: string[] = [];

    for (const exp of this.expenditures) {
      totalSpending += exp.amount;
      if (exp.isCoordinatedWithCandidate && exp.type === ExpenditureType.EXPRESS_ADVOCACY) {
        complianceViolations.push(`Violation: Coordinated express advocacy expenditure detected.`);
      }
      if (exp.type === ExpenditureType.EXPRESS_ADVOCACY || exp.type === ExpenditureType.ISSUE_ADVOCACY) {
        exemptFunctionSpending += exp.amount;
      } else {
        nonExemptFunctionSpending += exp.amount;
      }
    }

    const taxableAmount = Math.min(this.netInvestmentIncome, nonExemptFunctionSpending);
    return { totalSpending, exemptFunctionSpending, nonExemptFunctionSpending, taxableAmount, taxDue: taxableAmount * taxRate, complianceViolations };
  }
}

const router = Router();
const tracker = new TaxExemptContributionTracker("Q1-2024");

router.post('/contributions', (req: Request, res: Response) => {
  tracker.recordContribution(req.body);
  res.status(201).json({ message: "Contribution recorded" });
});

router.get('/report', (req: Request, res: Response) => {
  res.json(tracker.generateDisclosureReport());
});

router.post('/net-ledger', (req: Request, res: Response) => {
  const netted = RecursiveLedgerNettingEngine.netTransactions(req.body.transactions);
  res.json({ netted });
});

export default router;