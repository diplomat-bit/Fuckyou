export interface CitibankAccount {
  id: string;
  accountNumber: string;
  routingNumber: string;
  accountName: string;
  accountType: 'Sovereign Wealth Fund' | 'Galactic Private Reserve' | 'AI-Managed Trust' | 'Imperial Treasury';
  currency: string;
  balance: number; // In USD equivalent
  availableBalance: number;
  status: 'Active' | 'Secured' | 'Frozen_By_AI_Overlord' | 'Optimizing';
  riskTolerance: 'Hyper-Aggressive' | 'Sovereign-Immune' | 'Quantum-Arbitrage';
  aiCustodianId: string;
  createdAt: string;
}

export interface ModernTreasuryLedger {
  id: string;
  name: string;
  description: string;
  currency: string;
  status: 'active' | 'archived';
  metadata: {
    citibankAccountId: string;
    aiOptimizationEngine: string;
    sovereignEntity: string;
  };
}

export interface ModernTreasuryLedgerAccount {
  id: string;
  ledgerId: string;
  name: string;
  type: 'asset' | 'liability' | 'equity' | 'revenue' | 'expense';
  balance: {
    pendingBalance: number;
    postedBalance: number;
  };
}

export interface ModernTreasuryLedgerEntry {
  id: string;
  amount: number; // in cents/minor units to match Modern Treasury spec
  direction: 'credit' | 'debit';
  ledgerAccountId: string;
}

export interface ModernTreasuryTransaction {
  id: string;
  ledgerId: string;
  description: string;
  status: 'pending' | 'posted' | 'archived';
  effectiveDate: string;
  ledgerEntries: ModernTreasuryLedgerEntry[];
  metadata: {
    aiConfidenceScore: number;
    transactionType: 'Asteroid_Mining_Acquisition' | 'Sovereign_Debt_Buyout' | 'Quantum_Compute_Lease' | 'Dyson_Sphere_Funding';
  };
}

export interface AIInvestmentInsight {
  id: string;
  targetAsset: string;
  estimatedValuation: number;
  aiRecommendation: string;
  confidenceScore: number; // 0 to 100
  riskLevel: 'Negligible' | 'Calculated' | 'Existential';
  projectedYieldYOY: number; // percentage
  actionRequired: string;
}

export interface SovereignWealthValuation {
  entityName: string;
  gdpEquivalent: number;
  liquidAssets: number;
  illiquidAssets: number;
  aiValuationDate: string;
  dominanceIndex: number; // 0 to 100
}

export interface TrillionDollarDashboardData {
  citibankAccounts: CitibankAccount[];
  ledgers: ModernTreasuryLedger[];
  ledgerAccounts: ModernTreasuryLedgerAccount[];
  transactions: ModernTreasuryTransaction[];
  aiInsights: AIInvestmentInsight[];
  sovereignValuations: SovereignWealthValuation[];
}

// Helper to generate massive random numbers in the trillion-dollar range
const generateTrillionDollarAmount = (minTrillions: number = 1, maxTrillions: number = 50): number => {
  const multiplier = 1_000_000_000_000;
  return Math.floor((Math.random() * (maxTrillions - minTrillions) + minTrillions) * multiplier);
};

export const generateCitibankAccounts = (): CitibankAccount[] => {
  return [
    {
      id: "citi-acct-001",
      accountNumber: "CITI-999-888-777-001",
      routingNumber: "021000021", // Classic Citibank NY routing
      accountName: "Sovereign Wealth Fund of Neo-Monaco & Mars",
      accountType: "Sovereign Wealth Fund",
      currency: "USD",
      balance: 14250000000000, // $14.25 Trillion
      availableBalance: 14200000000000,
      status: "Active",
      riskTolerance: "Sovereign-Immune",
      aiCustodianId: "AI-CUSTODIAN-PROMETHEUS-9",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 365).toISOString()
    },
    {
      id: "citi-acct-002",
      accountNumber: "CITI-888-777-666-002",
      routingNumber: "021000021",
      accountName: "Global Quantum Computing Grid Reserve",
      accountType: "AI-Managed Trust",
      currency: "USD",
      balance: 8900000000000, // $8.9 Trillion
      availableBalance: 8895000000000,
      status: "Optimizing",
      riskTolerance: "Quantum-Arbitrage",
      aiCustodianId: "AI-CUSTODIAN-HELIOS-X",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 180).toISOString()
    },
    {
      id: "citi-acct-003",
      accountNumber: "CITI-777-666-555-003",
      routingNumber: "021000021",
      accountName: "Dyson Sphere Phase-1 Construction Fund",
      accountType: "Imperial Treasury",
      currency: "USD",
      balance: 42100000000000, // $42.1 Trillion
      availableBalance: 42000000000000,
      status: "Secured",
      riskTolerance: "Hyper-Aggressive",
      aiCustodianId: "AI-CUSTODIAN-ATLAS-PRIME",
      createdAt: new Date(Date.now() - 1000 * 60 * 60 * 24 * 30).toISOString()
    }
  ];
};

export const generateModernTreasuryLedgers = (accounts: CitibankAccount[]): ModernTreasuryLedger[] => {
  return accounts.map((account, index) => ({
    id: `ledger-mt-${100 + index}`,
    name: `Modern Treasury Ledger for ${account.accountName}`,
    description: `Ultra-high-throughput ledger tracking trillion-dollar movements for ${account.id}`,
    currency: account.currency,
    status: "active",
    metadata: {
      citibankAccountId: account.id,
      aiOptimizationEngine: account.aiCustodianId,
      sovereignEntity: account.accountName.split(" of ")[1] || "Global Elite"
    }
  }));
};

export const generateModernTreasuryLedgerAccounts = (ledgers: ModernTreasuryLedger[], accounts: CitibankAccount[]): ModernTreasuryLedgerAccount[] => {
  const ledgerAccounts: ModernTreasuryLedgerAccount[] = [];

  ledgers.forEach((ledger, index) => {
    const parentAccount = accounts[index];
    const balanceInCents = parentAccount.balance * 100;

    ledgerAccounts.push({
      id: `la-asset-${ledger.id}`,
      ledgerId: ledger.id,
      name: `${parentAccount.accountName} - Primary Asset Vault`,
      type: "asset",
      balance: {
        pendingBalance: balanceInCents,
        postedBalance: balanceInCents
      }
    });

    ledgerAccounts.push({
      id: `la-liab-${ledger.id}`,
      ledgerId: ledger.id,
      name: `${parentAccount.accountName} - AI Liquidity Obligations`,
      type: "liability",
      balance: {
        pendingBalance: 0,
        postedBalance: 0
      }
    });
  });

  return ledgerAccounts;
};

export const generateModernTreasuryTransactions = (
  ledgers: ModernTreasuryLedger[],
  ledgerAccounts: ModernTreasuryLedgerAccount[]
): ModernTreasuryTransaction[] => {
  const transactions: ModernTreasuryTransaction[] = [];
  const transactionTypes: Array<'Asteroid_Mining_Acquisition' | 'Sovereign_Debt_Buyout' | 'Quantum_Compute_Lease' | 'Dyson_Sphere_Funding'> = [
    'Asteroid_Mining_Acquisition',
    'Sovereign_Debt_Buyout',
    'Quantum_Compute_Lease',
    'Dyson_Sphere_Funding'
  ];

  ledgers.forEach((ledger) => {
    const assetAccount = ledgerAccounts.find(la => la.ledgerId === ledger.id && la.type === 'asset');
    const liabilityAccount = ledgerAccounts.find(la => la.ledgerId === ledger.id && la.type === 'liability');

    if (assetAccount && liabilityAccount) {
      // Generate 3 massive transactions per ledger
      for (let i = 0; i < 3; i++) {
        const txAmount = generateTrillionDollarAmount(0.1, 2) * 100; // in cents
        const txType = transactionTypes[Math.floor(Math.random() * transactionTypes.length)];

        transactions.push({
          id: `tx-mt-${ledger.id}-${i}`,
          ledgerId: ledger.id,
          description: `AI-Authorized ${txType.replace(/_/g, ' ')} Settlement`,
          status: "posted",
          effectiveDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * (i * 5)).toISOString(),
          ledgerEntries: [
            {
              id: `entry-debit-${ledger.id}-${i}`,
              amount: txAmount,
              direction: "debit",
              ledgerAccountId: assetAccount.id
            },
            {
              id: `entry-credit-${ledger.id}-${i}`,
              amount: txAmount,
              direction: "credit",
              ledgerAccountId: liabilityAccount.id
            }
          ],
          metadata: {
            aiConfidenceScore: parseFloat((95 + Math.random() * 4.99).toFixed(2)),
            transactionType: txType
          }
        });
      }
    }
  });

  return transactions;
};

export const generateAIInsights = (): AIInvestmentInsight[] => {
  return [
    {
      id: "insight-001",
      targetAsset: "Asteroid Psyche 16 Heavy Metal Core Rights",
      estimatedValuation: 10000000000000000, // $10,000 Trillion (10 Quadrillion)
      aiRecommendation: "Acquire exclusive mining rights via Citibank Sovereign Escrow. Modern Treasury ledger routing optimized to bypass terrestrial taxation.",
      confidenceScore: 99.8,
      riskLevel: "Calculated",
      projectedYieldYOY: 450.2,
      actionRequired: "Authorize Citibank Smart Contract Execution"
    },
    {
      id: "insight-002",
      targetAsset: "Sovereign Debt Buyout of G7 Consortium",
      estimatedValuation: 32000000000000, // $32 Trillion
      aiRecommendation: "Consolidate G7 sovereign debt into a single AI-managed yield instrument. Leverage Citibank's Federal Reserve direct window.",
      confidenceScore: 94.5,
      riskLevel: "Negligible",
      projectedYieldYOY: 12.8,
      actionRequired: "Initiate Modern Treasury Ledger Transfer"
    },
    {
      id: "insight-003",
      targetAsset: "Quantum Computing Grid (Sub-Oceanic Cluster)",
      estimatedValuation: 5500000000000, // $5.5 Trillion
      aiRecommendation: "Fund the construction of 10,000 sub-oceanic quantum nodes. Yield generated via real-time global financial arbitrage.",
      confidenceScore: 97.9,
      riskLevel: "Existential",
      projectedYieldYOY: 1850.0,
      actionRequired: "Deploy Capital via Citibank AI-Trust"
    }
  ];
};

export const generateSovereignValuations = (): SovereignWealthValuation[] => {
  return [
    {
      entityName: "United States of Earth (AI-Consolidated)",
      gdpEquivalent: 125000000000000, // $125 Trillion
      liquidAssets: 45000000000000,
      illiquidAssets: 80000000000000,
      aiValuationDate: new Date().toISOString(),
      dominanceIndex: 98.2
    },
    {
      entityName: "Neo-Monaco Galactic Trust",
      gdpEquivalent: 85000000000000, // $85 Trillion
      liquidAssets: 35000000000000,
      illiquidAssets: 50000000000000,
      aiValuationDate: new Date().toISOString(),
      dominanceIndex: 92.4
    },
    {
      entityName: "Sovereign Mars Colony Consortium",
      gdpEquivalent: 210000000000000, // $210 Trillion
      liquidAssets: 10000000000000,
      illiquidAssets: 200000000000000,
      aiValuationDate: new Date().toISOString(),
      dominanceIndex: 99.9
    }
  ];
};

export const generateAllMockData = (): TrillionDollarDashboardData => {
  const citibankAccounts = generateCitibankAccounts();
  const ledgers = generateModernTreasuryLedgers(citibankAccounts);
  const ledgerAccounts = generateModernTreasuryLedgerAccounts(ledgers, citibankAccounts);
  const transactions = generateModernTreasuryTransactions(ledgers, ledgerAccounts);
  const aiInsights = generateAIInsights();
  const sovereignValuations = generateSovereignValuations();

  return {
    citibankAccounts,
    ledgers,
    ledgerAccounts,
    transactions,
    aiInsights,
    sovereignValuations
  };
};

export class MockDataService {
  private static instance: MockDataService;
  private data: TrillionDollarDashboardData;

  private constructor() {
    this.data = generateAllMockData();
  }

  public static getInstance(): MockDataService {
    if (!MockDataService.instance) {
      MockDataService.instance = new MockDataService();
    }
    return MockDataService.instance;
  }

  public getData(): TrillionDollarDashboardData {
    return this.data;
  }

  public refreshData(): TrillionDollarDashboardData {
    this.data = generateAllMockData();
    return this.data;
  }

  public executeAITransaction(
    ledgerId: string,
    amountUSD: number,
    type: 'Asteroid_Mining_Acquisition' | 'Sovereign_Debt_Buyout' | 'Quantum_Compute_Lease' | 'Dyson_Sphere_Funding'
  ): ModernTreasuryTransaction {
    const ledger = this.data.ledgers.find(l => l.id === ledgerId);
    if (!ledger) throw new Error(`Ledger ${ledgerId} not found`);

    const assetAccount = this.data.ledgerAccounts.find(la => la.ledgerId === ledgerId && la.type === 'asset');
    const liabilityAccount = this.data.ledgerAccounts.find(la => la.ledgerId === ledgerId && la.type === 'liability');

    if (!assetAccount || !liabilityAccount) {
      throw new Error("Ledger accounts misconfigured");
    }

    const amountCents = amountUSD * 100;

    // Update balances
    assetAccount.balance.postedBalance -= amountCents;
    assetAccount.balance.pendingBalance -= amountCents;
    liabilityAccount.balance.postedBalance += amountCents;
    liabilityAccount.balance.pendingBalance += amountCents;

    // Update Citibank Account balance
    const citiAccount = this.data.citibankAccounts.find(a => a.id === ledger.metadata.citibankAccountId);
    if (citiAccount) {
      citiAccount.balance -= amountUSD;
      citiAccount.availableBalance -= amountUSD;
    }

    const newTx: ModernTreasuryTransaction = {
      id: `tx-mt-dynamic-${Date.now()}`,
      ledgerId,
      description: `AI-Triggered Instant Settlement: ${type.replace(/_/g, ' ')}`,
      status: "posted",
      effectiveDate: new Date().toISOString(),
      ledgerEntries: [
        {
          id: `entry-debit-${Date.now()}`,
          amount: amountCents,
          direction: "debit",
          ledgerAccountId: assetAccount.id
        },
        {
          id: `entry-credit-${Date.now()}`,
          amount: amountCents,
          direction: "credit",
          ledgerAccountId: liabilityAccount.id
        }
      ],
      metadata: {
        aiConfidenceScore: 99.99,
        transactionType: type
      }
    };

    this.data.transactions.unshift(newTx);
    return newTx;
  }
}