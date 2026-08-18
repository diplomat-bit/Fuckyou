import { Router, Request, Response } from "express";

// Define interfaces for the Sovereign Wealth Fund 527 state
interface Contributor {
  id: string;
  name: string;
  type: "individual" | "pac" | "corporation" | "sovereign_entity";
  countryOfOrigin: string;
  aggregateContribution: number;
  isVerifiedDomestic: boolean;
  timestamp: string;
}

interface AssetAllocation {
  assetClass: "liquid_cash" | "treasuries" | "independent_expenditures" | "sovereign_bonds" | "strategic_media";
  amount: number;
  yieldRate: number;
  riskScore: number; // 1-100
}

interface PoliticalExpenditure {
  id: string;
  targetCandidateOrIssue: string;
  amount: number;
  category: "voter_turnout" | "media_buy" | "polling" | "legal_compliance" | "infrastructure";
  complianceStatus: "approved" | "pending_review" | "flagged";
  timestamp: string;
}

// In-memory state representing the Sovereign Wealth Fund 527
let totalFundraisingGoal = 1000000000; // $1 Billion Sovereign-scale target
let publicFinancingCap2008 = 84100000; // $84.1 Million historical cap

let contributors: Contributor[] = [
  {
    id: "contrib-001",
    name: "Sovereign Tech Alliance PAC",
    type: "pac",
    countryOfOrigin: "US",
    aggregateContribution: 15000000,
    isVerifiedDomestic: true,
    timestamp: new Date(Date.now() - 86400000 * 10).toISOString(),
  },
  {
    id: "contrib-002",
    name: "Constellation Holdings LLC",
    type: "corporation",
    countryOfOrigin: "US",
    aggregateContribution: 25000000,
    isVerifiedDomestic: true,
    timestamp: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
  {
    id: "contrib-003",
    name: "Anonymous Grassroots Network",
    type: "individual",
    countryOfOrigin: "US",
    aggregateContribution: 45000000,
    isVerifiedDomestic: true,
    timestamp: new Date(Date.now() - 86400000 * 2).toISOString(),
  }
];

let assetAllocations: AssetAllocation[] = [
  { assetClass: "liquid_cash", amount: 15000000, yieldRate: 0.042, riskScore: 5 },
  { assetClass: "treasuries", amount: 35000000, yieldRate: 0.048, riskScore: 2 },
  { assetClass: "independent_expenditures", amount: 25000000, yieldRate: 0.0, riskScore: 45 },
  { assetClass: "sovereign_bonds", amount: 10000000, yieldRate: 0.055, riskScore: 15 }
];

let expenditures: PoliticalExpenditure[] = [
  {
    id: "exp-001",
    targetCandidateOrIssue: "National Mobilization Campaign 2008-Alt",
    amount: 12000000,
    category: "voter_turnout",
    complianceStatus: "approved",
    timestamp: new Date(Date.now() - 86400000 * 8).toISOString(),
  },
  {
    id: "exp-002",
    targetCandidateOrIssue: "Sovereign Media Blitz (Swing States)",
    amount: 8000000,
    category: "media_buy",
    complianceStatus: "approved",
    timestamp: new Date(Date.now() - 86400000 * 4).toISOString(),
  }
];

const router = Router();

/**
 * GET /api/sovereign-wealth-527/status
 * Returns the high-level financial and compliance status of the 527 fund.
 */
router.get("/status", (req: Request, res: Response) => {
  const totalRaised = contributors.reduce((sum, c) => sum + c.aggregateContribution, 0);
  const totalSpent = expenditures.reduce((sum, e) => sum + e.amount, 0);
  const currentBalance = totalRaised - totalSpent;

  // Calculate the multiplier effect of opting out of public financing
  const optOutMultiplier = totalRaised / publicFinancingCap2008;

  res.json({
    success: true,
    data: {
      fundName: "Sovereign Wealth Fund 527 (Political Action & Asset Reserve)",
      totalRaised,
      totalSpent,
      currentBalance,
      fundraisingGoal: totalFundraisingGoal,
      publicFinancingCap2008,
      optOutMultiplier: parseFloat(optOutMultiplier.toFixed(2)),
      complianceRating: "98.4%",
      status: "ACTIVE_SOVEREIGN_FUNDRAISING",
    }
  });
});

/**
 * GET /api/sovereign-wealth-527/assets
 * Returns current asset allocations and yields.
 */
router.get("/assets", (req: Request, res: Response) => {
  const totalAssetsValue = assetAllocations.reduce((sum, a) => sum + a.amount, 0);
  res.json({
    success: true,
    data: {
      totalAssetsValue,
      allocations: assetAllocations,
    }
  });
});

/**
 * POST /api/sovereign-wealth-527/contributions
 * Records a new contribution with strict political compliance checks.
 */
router.post("/contributions", (req: Request, res: Response) => {
  const { name, type, countryOfOrigin, amount, isVerifiedDomestic } = req.body;

  if (!name || !type || !countryOfOrigin || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid contribution payload. Name, type, countryOfOrigin, and positive amount are required."
    });
  }

  // Political Compliance Check: Foreign National Contribution Ban (FEC Rule)
  if (countryOfOrigin.toUpperCase() !== "US" && !isVerifiedDomestic) {
    return res.status(403).json({
      success: false,
      complianceViolation: "FOREIGN_NATIONAL_CONTRIBUTION_PROHIBITED",
      message: "Under FEC regulations, foreign nationals are prohibited from making contributions to 527 political organizations."
    });
  }

  // Political Compliance Check: Corporate Contribution Limits (depending on 527 structure)
  if (type === "corporation" && amount > 50000000) {
    return res.status(400).json({
      success: false,
      complianceViolation: "EXCESSIVE_CORPORATE_INFLUENCE_FLAG",
      message: "Contribution exceeds internal Sovereign Wealth Fund 527 risk thresholds for single-source corporate entities."
    });
  }

  const newContributor: Contributor = {
    id: `contrib-${Math.random().toString(36).substr(2, 9)}`,
    name,
    type,
    countryOfOrigin: countryOfOrigin.toUpperCase(),
    aggregateContribution: amount,
    isVerifiedDomestic: !!isVerifiedDomestic,
    timestamp: new Date().toISOString()
  };

  contributors.push(newContributor);

  // Automatically adjust liquid cash allocation
  const cashAlloc = assetAllocations.find(a => a.assetClass === "liquid_cash");
  if (cashAlloc) {
    cashAlloc.amount += amount;
  } else {
    assetAllocations.push({ assetClass: "liquid_cash", amount, yieldRate: 0.042, riskScore: 5 });
  }

  res.status(201).json({
    success: true,
    message: "Contribution successfully processed and cleared by compliance engine.",
    data: newContributor
  });
});

/**
 * GET /api/sovereign-wealth-527/compliance/fec-report
 * Generates a mock FEC Form 8872 (Political Organization Report of Contributions and Expenditures).
 */
router.get("/compliance/fec-report", (req: Request, res: Response) => {
  const totalContributions = contributors.reduce((sum, c) => sum + c.aggregateContribution, 0);
  const totalExpenditures = expenditures.reduce((sum, e) => sum + e.amount, 0);

  const flaggedContributions = contributors.filter(c => !c.isVerifiedDomestic);
  const flaggedExpenditures = expenditures.filter(e => e.complianceStatus === "flagged");

  res.json({
    success: true,
    reportType: "Form 8872 (Sovereign Scale)",
    reportingPeriod: "Q3-2008-Alternative-Timeline",
    data: {
      organizationName: "Sovereign Wealth Fund 527",
      ein: "XX-XXXXXXX",
      summary: {
        totalContributions,
        totalExpenditures,
        netPoliticalReserve: totalContributions - totalExpenditures,
      },
      disclosures: {
        contributorsCount: contributors.length,
        expendituresCount: expenditures.length,
        flaggedItemsCount: flaggedContributions.length + flaggedExpenditures.length,
      },
      complianceAuditTrail: {
        status: flaggedContributions.length > 0 ? "WARNING" : "COMPLIANT",
        checksRun: [
          "ForeignNationalProhibitionCheck",
          "AggregateLimitVerification",
          "IndependentExpenditureSeparationCheck",
          "SovereignAssetYieldAudit"
        ],
        flaggedContributions,
        flaggedExpenditures
      }
    }
  });
});

/**
 * GET /api/sovereign-wealth-527/alternatives/compare
 * Compares the historical public financing limits vs. the Sovereign Wealth Fund 527's private fundraising.
 */
router.get("/alternatives/compare", (req: Request, res: Response) => {
  const totalRaised = contributors.reduce((sum, c) => sum + c.aggregateContribution, 0);
  const difference = totalRaised - publicFinancingCap2008;
  const percentageIncrease = ((totalRaised - publicFinancingCap2008) / publicFinancingCap2008) * 100;

  res.json({
    success: true,
    comparison: {
      scenarioName: "Obama 2008 Public Financing Opt-Out Simulation",
      publicFinancingSystem: {
        status: "REJECTED",
        cap: publicFinancingCap2008,
        restrictions: [
          "No private fundraising allowed after nomination",
          "Strict spending limits per state",
          "Subject to federal audit delays"
        ]
      },
      sovereignWealth527System: {
        status: "OPERATIONAL",
        totalRaised,
        advantages: [
          "Unlimited fundraising potential",
          "Strategic asset allocation (yield-bearing reserves)",
          "Flexible independent expenditures",
          "Sovereign-scale media dominance"
        ]
      },
      delta: {
        absoluteDifference: difference,
        percentageIncrease: parseFloat(percentageIncrease.toFixed(2)) + "%",
        strategicAdvantageRating: totalRaised > publicFinancingCap2008 * 2 ? "CRITICAL_DOMINANCE" : "MODERATE_ADVANTAGE"
      }
    }
  });
});

/**
 * POST /api/sovereign-wealth-527/investments/allocate
 * Reallocates assets between liquid cash, treasuries, and political expenditures.
 */
router.post("/investments/allocate", (req: Request, res: Response) => {
  const { fromClass, toClass, amount } = req.body;

  if (!fromClass || !toClass || typeof amount !== "number" || amount <= 0) {
    return res.status(400).json({
      success: false,
      message: "Invalid allocation payload. fromClass, toClass, and positive amount are required."
    });
  }

  const sourceAsset = assetAllocations.find(a => a.assetClass === fromClass);
  const destAsset = assetAllocations.find(a => a.assetClass === toClass);

  if (!sourceAsset || sourceAsset.amount < amount) {
    return res.status(400).json({
      success: false,
      message: `Insufficient funds in source asset class: ${fromClass}`
    });
  }

  // Perform reallocation
  sourceAsset.amount -= amount;
  if (destAsset) {
    destAsset.amount += amount;
  } else {
    assetAllocations.push({
      assetClass: toClass,
      amount,
      yieldRate: 0.0, // Default yield for new classes
      riskScore: 50   // Default risk score
    });
  }

  res.json({
    success: true,
    message: `Successfully reallocated $${amount.toLocaleString()} from ${fromClass} to ${toClass}.`,
    data: {
      allocations: assetAllocations
    }
  });
});

/**
 * POST /api/sovereign-wealth-527/expenditures
 * Records a new political expenditure (e.g., media buy, voter turnout).
 */
router.post("/expenditures", (req: Request, res: Response) => {
  const { targetCandidateOrIssue, amount, category } = req.body;

  if (!targetCandidateOrIssue || typeof amount !== "number" || amount <= 0 || !category) {
    return res.status(400).json({
      success: false,
      message: "Invalid expenditure payload. targetCandidateOrIssue, amount, and category are required."
    });
  }

  // Check if we have enough liquid cash to cover the expenditure
  const cashAlloc = assetAllocations.find(a => a.assetClass === "liquid_cash");
  if (!cashAlloc || cashAlloc.amount < amount) {
    return res.status(400).json({
      success: false,
      message: "Insufficient liquid cash to execute political expenditure. Please reallocate assets first."
    });
  }

  // Deduct from liquid cash
  cashAlloc.amount -= amount;

  // Track independent expenditure asset class
  const ieAlloc = assetAllocations.find(a => a.assetClass === "independent_expenditures");
  if (ieAlloc) {
    ieAlloc.amount += amount;
  }

  const newExpenditure: PoliticalExpenditure = {
    id: `exp-${Math.random().toString(36).substr(2, 9)}`,
    targetCandidateOrIssue,
    amount,
    category,
    complianceStatus: "approved",
    timestamp: new Date().toISOString()
  };

  expenditures.push(newExpenditure);

  res.status(201).json({
    success: true,
    message: "Political expenditure authorized and recorded under independent expenditure guidelines.",
    data: newExpenditure
  });
});

export default router;