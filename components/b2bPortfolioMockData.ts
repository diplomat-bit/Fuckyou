

// --- CONSOLIDATED FROM: ./components/data/b2bPortfolioMockData.ts ---

export interface B2BAccount {
  id: string;
  companyName: string;
  industry: 'Technology' | 'Manufacturing' | 'Retail' | 'Energy' | 'Healthcare' | 'Real Estate' | 'Logistics';
  creditRating: 'AAA' | 'AA' | 'A' | 'BBB' | 'BB' | 'B' | 'CCC';
  outstandingLoan: number; // in USD
  pd: number; // Probability of Default (0.0 to 1.0)
  lgd: number; // Loss Given Default (0.0 to 1.0)
  ead: number; // Exposure at Default (in USD)
  region: 'North America' | 'Europe' | 'APAC' | 'LATAM';
  revenue: number; // Annual revenue in USD
  employees: number;
  establishedYear: number;
  lastAuditDate: string;
}

export interface MacroScenario {
  id: string;
  name: string;
  description: string;
  gdpGrowth: number; // percentage change (e.g., -2.5 for -2.5%)
  unemploymentRate: number; // percentage (e.g., 7.5 for 7.5%)
  inflationRate: number; // percentage (e.g., 5.0 for 5.0%)
  interestRateChange: number; // basis points change (e.g., +150 or -100)
  pdMultiplier: number; // multiplier applied to base PD
  lgdMultiplier: number; // multiplier applied to base LGD
}

export const mockB2BAccounts: B2BAccount[] = [
  {
    id: "ACC-001",
    companyName: "Apex Tech Solutions",
    industry: "Technology",
    creditRating: "AAA",
    outstandingLoan: 15000000,
    pd: 0.005,
    lgd: 0.35,
    ead: 15000000,
    region: "North America",
    revenue: 120000000,
    employees: 450,
    establishedYear: 2010,
    lastAuditDate: "2023-11-15"
  },
  {
    id: "ACC-002",
    companyName: "Global Manufacturing Corp",
    industry: "Manufacturing",
    creditRating: "BBB",
    outstandingLoan: 45000000,
    pd: 0.025,
    lgd: 0.45,
    ead: 42500000,
    region: "Europe",
    revenue: 340000000,
    employees: 2200,
    establishedYear: 1988,
    lastAuditDate: "2023-09-10"
  },
  {
    id: "ACC-003",
    companyName: "BioHealth Pharmaceuticals",
    industry: "Healthcare",
    creditRating: "AA",
    outstandingLoan: 28000000,
    pd: 0.008,
    lgd: 0.30,
    ead: 28000000,
    region: "North America",
    revenue: 195000000,
    employees: 850,
    establishedYear: 2005,
    lastAuditDate: "2023-12-01"
  },
  {
    id: "ACC-004",
    companyName: "Vanguard Real Estate",
    industry: "Real Estate",
    creditRating: "BB",
    outstandingLoan: 60000000,
    pd: 0.065,
    lgd: 0.50,
    ead: 58000000,
    region: "APAC",
    revenue: 150000000,
    employees: 310,
    establishedYear: 2012,
    lastAuditDate: "2023-08-22"
  },
  {
    id: "ACC-005",
    companyName: "Horizon Energy Group",
    industry: "Energy",
    creditRating: "A",
    outstandingLoan: 35000000,
    pd: 0.015,
    lgd: 0.40,
    ead: 35000000,
    region: "Europe",
    revenue: 280000000,
    employees: 1100,
    establishedYear: 1995,
    lastAuditDate: "2023-10-05"
  },
  {
    id: "ACC-006",
    companyName: "Omni Retail Ventures",
    industry: "Retail",
    creditRating: "B",
    outstandingLoan: 12500000,
    pd: 0.120,
    lgd: 0.60,
    ead: 11800000,
    region: "LATAM",
    revenue: 85000000,
    employees: 1400,
    establishedYear: 2015,
    lastAuditDate: "2023-07-19"
  },
  {
    id: "ACC-007",
    companyName: "Quantum Software Inc",
    industry: "Technology",
    creditRating: "BBB",
    outstandingLoan: 8000000,
    pd: 0.030,
    lgd: 0.40,
    ead: 8000000,
    region: "North America",
    revenue: 45000000,
    employees: 180,
    establishedYear: 2018,
    lastAuditDate: "2023-11-30"
  },
  {
    id: "ACC-008",
    companyName: "Pacific Logistics & Cargo",
    industry: "Logistics",
    creditRating: "BB",
    outstandingLoan: 22000000,
    pd: 0.055,
    lgd: 0.45,
    ead: 21000000,
    region: "APAC",
    revenue: 110000000,
    employees: 950,
    establishedYear: 2001,
    lastAuditDate: "2023-10-25"
  }
];

export const mockStressScenarios: MacroScenario[] = [
  {
    id: "SCEN-001",
    name: "Baseline Scenario",
    description: "Steady economic growth, stable inflation, and unchanged monetary policy.",
    gdpGrowth: 2.1,
    unemploymentRate: 3.8,
    inflationRate: 2.4,
    interestRateChange: 0,
    pdMultiplier: 1.0,
    lgdMultiplier: 1.0
  },
  {
    id: "SCEN-002",
    name: "Mild Recession",
    description: "Moderate economic downturn triggered by supply chain disruptions and tightening credit conditions.",
    gdpGrowth: -1.5,
    unemploymentRate: 6.2,
    inflationRate: 1.8,
    interestRateChange: -100,
    pdMultiplier: 1.4,
    lgdMultiplier: 1.1
  },
  {
    id: "SCEN-003",
    name: "Severe Stagflation",
    description: "Deep economic contraction coupled with high inflation and aggressive central bank rate hikes.",
    gdpGrowth: -4.5,
    unemploymentRate: 9.5,
    inflationRate: 8.2,
    interestRateChange: 350,
    pdMultiplier: 2.3,
    lgdMultiplier: 1.3
  },
  {
    id: "SCEN-004",
    name: "Climate & Energy Shock",
    description: "Sudden spike in energy costs and regulatory carbon taxes impacting heavy industries.",
    gdpGrowth: -0.8,
    unemploymentRate: 5.0,
    inflationRate: 5.5,
    interestRateChange: 150,
    pdMultiplier: 1.7,
    lgdMultiplier: 1.2
  }
];

export const openApiSchema = {
  openapi: "3.0.3",
  info: {
    title: "B2B Portfolio Risk & Stress Testing API",
    description: "API for managing B2B credit portfolios, calculating Expected Loss (EL), and simulating macroeconomic stress scenarios.",
    version: "1.0.0"
  },
  paths: {
    "/api/portfolio/accounts": {
      get: {
        summary: "Retrieve all B2B accounts",
        description: "Returns a list of preloaded B2B accounts with credit risk parameters.",
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/B2BAccount"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolio/scenarios": {
      get: {
        summary: "Retrieve macroeconomic stress scenarios",
        description: "Returns preloaded macroeconomic stress scenarios with risk multipliers.",
        responses: {
          200: {
            description: "Successful response",
            content: {
              "application/json": {
                schema: {
                  type: "array",
                  items: {
                    $ref: "#/components/schemas/MacroScenario"
                  }
                }
              }
            }
          }
        }
      }
    },
    "/api/portfolio/stress-test": {
      post: {
        summary: "Run stress test simulation",
        description: "Applies a macroeconomic scenario's multipliers to the portfolio and returns stressed risk metrics.",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: {
                  scenarioId: {
                    type: "string",
                    example: "SCEN-003"
                  }
                },
                required: ["scenarioId"]
              }
            }
          }
        },
        responses: {
          200: {
            description: "Stress test results calculated successfully",
            content: {
              "application/json": {
                schema: {
                  $ref: "#/components/schemas/StressTestResult"
                }
              }
            }
          },
          404: {
            description: "Scenario not found"
          }
        }
      }
    }
  },
  components: {
    schemas: {
      B2BAccount: {
        type: "object",
        properties: {
          id: { type: "string" },
          companyName: { type: "string" },
          industry: {
            type: "string",
            enum: ["Technology", "Manufacturing", "Retail", "Energy", "Healthcare", "Real Estate", "Logistics"]
          },
          creditRating: {
            type: "string",
            enum: ["AAA", "AA", "A", "BBB", "BB", "B", "CCC"]
          },
          outstandingLoan: { type: "number" },
          pd: { type: "number", minimum: 0, maximum: 1 },
          lgd: { type: "number", minimum: 0, maximum: 1 },
          ead: { type: "number" },
          region: {
            type: "string",
            enum: ["North America", "Europe", "APAC", "LATAM"]
          },
          revenue: { type: "number" },
          employees: { type: "integer" },
          establishedYear: { type: "integer" },
          lastAuditDate: { type: "string", format: "date" }
        }
      },
      MacroScenario: {
        type: "object",
        properties: {
          id: { type: "string" },
          name: { type: "string" },
          description: { type: "string" },
          gdpGrowth: { type: "number" },
          unemploymentRate: { type: "number" },
          inflationRate: { type: "number" },
          interestRateChange: { type: "integer" },
          pdMultiplier: { type: "number" },
          lgdMultiplier: { type: "number" }
        }
      },
      StressTestResult: {
        type: "object",
        properties: {
          scenarioId: { type: "string" },
          scenarioName: { type: "string" },
          originalExpectedLoss: { type: "number" },
          stressedExpectedLoss: { type: "number" },
          deltaLoss: { type: "number" },
          percentageIncrease: { type: "number" },
          stressedAccounts: {
            type: "array",
            items: {
              type: "object",
              properties: {
                accountId: { type: "string" },
                companyName: { type: "string" },
                originalPd: { type: "number" },
                stressedPd: { type: "number" },
                originalLgd: { type: "number" },
                stressedLgd: { type: "number" },
                originalEL: { type: "number" },
                stressedEL: { type: "number" }
              }
            }
          }
        }
      }
    }
  }
};