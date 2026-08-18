/**
 * @file types/citi-ai-treasury.ts
 * @description Unified TypeScript interfaces combining Citibank OpenAPI schemas, Modern Treasury models,
 * and AI-driven ultra-high-net-worth (UHNW) wealth metadata. Designed for the world's most exclusive
 * financial operating system, managing multi-billion dollar sovereign, corporate, and private assets.
 */

// ============================================================================
// 1. CITIBANK OPENAPI SCHEMA DEFINITIONS (UHNW & Institutional Extensions)
// ============================================================================

export interface CitiBalances {
  availableBalance: number;
  ledgerBalance: number;
  currentBalance: number;
  outstandingBalance?: number;
  overdraftLimit?: number;
  uncollectedFunds?: number;
  escrowBalance?: number;
  sovereignCollateralValue?: number; // Value of sovereign bonds held as collateral
  quantumLiquidityPool?: number;     // AI-allocated instant-access liquidity
  currencyCode: string;              // e.g., "USD", "EUR", "CHF", "AED"
  lastUpdated: string;               // ISO 8601 timestamp
}

export interface CitiAccountSummary {
  accountId: string;
  displayAccountNumber: string;
  accountName: string;
  accountType: 'PRIVATE_BANKING' | 'SOVEREIGN_WEALTH' | 'FAMILY_OFFICE' | 'CORPORATE_TREASURY' | 'ESCROW';
  accountStatus: 'ACTIVE' | 'SUSPENDED' | 'RESTRICTED' | 'UNDER_AUDIT';
  currencyCode: string;
  balances: CitiBalances;
  clearingCode?: string;
  swiftBic?: string;
  iban?: string;
  routingNumber?: string;
  citiBranchCode: string;
  citiCountryCode: string;
  relationshipManagerId: string;
}

export interface CitiAccountSummaryResponse {
  accounts: CitiAccountSummary[];
  totalCount: number;
  nextPageToken?: string;
  executionTimeMs: number;
}

export interface CitiTransactionDetails {
  transactionId: string;
  bookingDate: string;
  valueDate: string;
  transactionAmount: number;
  transactionCurrency: string;
  transactionStatus: 'POSTED' | 'PENDING' | 'REJECTED' | 'SETTLED';
  transactionType: 'CREDIT' | 'DEBIT';
  transactionDescription: string;
  merchantCategoryCode?: string;
  merchantName?: string;
  referenceNumber: string;
  customerReferenceNumber?: string;
  bankReferenceNumber?: string;
  paymentMethod: 'WIRE' | 'ACH' | 'SWIFT' | 'SEPA' | 'BOOK_TRANSFER' | 'CHIPS';
  chargeBearer?: 'OUR' | 'BEN' | 'SHA';
  orderingCustomerName?: string;
  beneficiaryCustomerName?: string;
}

export interface CitiTransactionDetailsResponse {
  transactions: CitiTransactionDetails[];
  accountId: string;
  nextPageToken?: string;
  totalCount: number;
}


// ============================================================================
// 2. MODERN TREASURY MODELS
// ============================================================================

export interface MTLedger {
  id: string;
  object: 'ledger';
  name: string;
  description: string | null;
  metadata: Record<string, any>;
  liveMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MTLedgerAccount {
  id: string;
  object: 'ledger_account';
  name: string;
  description: string | null;
  ledgerId: string;
  normalBalance: 'credit' | 'debit';
  balances: {
    pendingBalance: number;
    postedBalance: number;
    availableBalance: number;
    currency: string;
  };
  metadata: Record<string, any>;
  liveMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MTPaymentOrder {
  id: string;
  object: 'payment_order';
  type: 'ach' | 'wire' | 'check' | 'rtp' | 'swift' | 'book';
  amount: number; // in cents/smallest unit
  currency: string;
  direction: 'credit' | 'debit';
  status: 'draft' | 'pending' | 'processing' | 'completed' | 'failed' | 'cancelled';
  originatingAccountId: string;
  receivingAccountId?: string;
  receivingAccountType?: 'internal_account' | 'external_account';
  effectiveDate: string;
  statementDescriptor: string | null;
  description: string | null;
  metadata: Record<string, any>;
  ledgerTransactionId: string | null;
  liveMode: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface MTVirtualAccount {
  id: string;
  object: 'virtual_account';
  name: string;
  description: string | null;
  internalAccountId: string;
  routingDetails: Array<{
    id: string;
    routingNumber: string;
    routingNumberType: 'aba' | 'swift' | 'chips' | 'sort_code' | 'bic';
  }>;
  accountDetails: Array<{
    id: string;
    accountNumber: string;
    accountNumberType: 'iban' | 'clabe' | 'wallet_address' | 'other';
  }>;
  metadata: Record<string, any>;
  liveMode: boolean;
  createdAt: string;
  updatedAt: string;
}


// ============================================================================
// 3. AI-DRIVEN WEALTH METADATA (The "Most Expensive Thing in the World" Layer)
// ============================================================================

export interface LuxuryAssetAllocation {
  assetClass: 'SUPER_YACHT' | 'PRIVATE_AVIATION' | 'FINE_ART' | 'MEGA_MANSION' | 'SOVEREIGN_DEBT' | 'HYPER_CAR_PORTFOLIO' | 'SPACE_EXPLORATION_EQUITY';
  assetName: string;
  estimatedValueUSD: number;
  annualMaintenanceCostUSD: number;
  aiOptimizedLiquidationSpeed: 'INSTANT' | '24_HOURS' | '7_DAYS' | 'STRATEGIC_HOLD';
  collateralizationRatio: number; // Percentage of asset value available for instant borrowing
  aiYieldGenerationStrategy?: string; // e.g., "Chartering yacht during off-season via AI-driven dynamic pricing"
}

export interface SovereignYieldOptimization {
  targetJurisdiction: string; // e.g., "Switzerland", "Singapore", "Cayman Islands", "Monaco"
  currentYield: number;
  aiProjectedYield: number;
  taxOptimizationScore: number; // 0 to 100 (100 = absolute legal tax avoidance)
  geopoliticalRiskIndex: number; // 0 to 100 (0 = absolute stability)
  recommendedReallocationAmount: number;
  automatedExecutionTriggered: boolean;
}

export interface AIPredictiveTreasury {
  liquidityForecast30Days: Array<{
    date: string;
    projectedInflow: number;
    projectedOutflow: number;
    confidenceInterval: number; // 0.0 to 1.0
  }>;
  optimalSweepThreshold: number; // AI-calculated threshold to trigger automatic sweeps to high-yield sovereign ledgers
  recommendedPaymentRouting: {
    paymentOrderId: string;
    optimalRail: 'SWIFT_GPI' | 'CITI_DIRECT_CONNECT' | 'MODERN_TREASURY_BOOK' | 'FEDNOW_INSTANT';
    estimatedFeeUSD: number;
    estimatedSettlementTimeSeconds: number;
    carbonOffsetCostUSD: number; // Automatic carbon offsetting for ultra-luxury compliance
  };
  anomalyDetectionScore: number; // 0.0 (safe) to 1.0 (highly suspicious/potential elite cyber-threat)
  aiWealthAdvisorNotes: string;  // Generative AI insights tailored for the family office principal
}

export interface AIWealthMetadata {
  principalNetWorthUSD: number;
  wealthTier: 'CENTI_MILLIONAIRE' | 'BILLIONAIRE' | 'DECABILLIONAIRE' | 'SOVEREIGN_STATE';
  aiRiskToleranceProfile: 'CONSERVATIVE_DYNASTIC' | 'BALANCED_EMPIRE' | 'AGGRESSIVE_CONQUEST';
  luxuryAssetAllocation: LuxuryAssetAllocation[];
  sovereignYieldOptimization: SovereignYieldOptimization[];
  predictiveTreasury: AIPredictiveTreasury;
  generativeWealthStrategySummary: string; // Dynamic AI-generated executive summary of wealth preservation
  lastAiRebalanceTimestamp: string;
}


// ============================================================================
// 4. UNIFIED CITI-AI-TREASURY INTEGRATED MODELS
// ============================================================================

/**
 * The ultimate unified account model.
 * Combines Citibank's core banking API data, Modern Treasury's ledgering and virtual account infrastructure,
 * and the AI-driven wealth optimization engine.
 */
export interface CitiAITreasuryUnifiedAccount {
  id: string; // Unique system identifier
  citiAccount: CitiAccountSummary;
  modernTreasuryVirtualAccount?: MTVirtualAccount;
  modernTreasuryLedgerAccount?: MTLedgerAccount;
  aiWealthMetadata: AIWealthMetadata;
  systemStatus: {
    citiSyncStatus: 'CONNECTED' | 'SYNCING' | 'DEGRADED' | 'DISCONNECTED';
    modernTreasurySyncStatus: 'CONNECTED' | 'SYNCING' | 'DEGRADED' | 'DISCONNECTED';
    aiEngineStatus: 'OPTIMIZED' | 'REBALANCING' | 'STANDBY';
    lastUnifiedSyncAt: string;
  };
  customBranding?: {
    familyOfficeName: string;
    primaryColorHex: string; // e.g., "#D4AF37" (Metallic Gold)
    secondaryColorHex: string; // e.g., "#002F6C" (Citi Blue / Deep Navy)
    customLogoUrl?: string;
  };
}

/**
 * The ultimate unified transaction model.
 * Combines Citibank's raw transaction details, Modern Treasury's payment order and ledger transaction tracking,
 * and AI-driven transaction insights (e.g., tax classification, luxury asset depreciation tracking).
 */
export interface CitiAITreasuryUnifiedTransaction {
  id: string; // Unique system identifier
  citiTransaction: CitiTransactionDetails;
  modernTreasuryPaymentOrder?: MTPaymentOrder;
  modernTreasuryLedgerEntryId?: string;
  aiTransactionInsights: {
    category: 'SOVEREIGN_TAX' | 'LUXURY_ACQUISITION' | 'YACHT_OPERATIONS' | 'PRIVATE_EQUITY_CALL' | 'PHILANTHROPY' | 'TREASURY_SWEEP';
    taxDeductibilityStatus: 'FULLY_DEDUCTIBLE' | 'PARTIALLY_DEDUCTIBLE' | 'NON_DEDUCTIBLE' | 'OFFSHORE_EXEMPT';
    estimatedTaxSavingsUSD: number;
    depreciationImpactUSD?: number;
    associatedLuxuryAssetId?: string; // Links to LuxuryAssetAllocation
    aiVerificationConfidence: number; // 0.0 to 1.0
    flaggedAsEliteAnomaly: boolean;
    anomalyReasoning?: string;
    suggestedLedgerAccountReclassification?: string;
  };
}

/**
 * Payload for initiating an AI-optimized, multi-million dollar payment order
 * across Citibank rails via Modern Treasury.
 */
export interface InitiateAIPaymentRequest {
  originatorUnifiedAccountId: string;
  beneficiaryDetails: {
    name: string;
    accountNumber: string;
    routingNumber: string;
    routingType: 'aba' | 'swift' | 'iban';
    countryCode: string;
    swiftBic?: string;
  };
  amountUSD: number;
  purposeOfPayment: 'ART_ACQUISITION' | 'REAL_ESTATE_SETTLEMENT' | 'YACHT_CHARTER' | 'SOVEREIGN_BOND_PURCHASE' | 'FAMILY_OFFICE_DISTRIBUTION';
  aiRoutingPreference: 'MAXIMUM_SPEED' | 'MAXIMUM_PRIVACY' | 'LOWEST_FEE' | 'OPTIMAL_TAX_SHIELD';
  requireMultiSignatureApproval: boolean;
  authorizedSignerIds: string[];
}

/**
 * Response returned after initiating an AI-optimized payment.
 */
export interface InitiateAIPaymentResponse {
  paymentOrderId: string;
  modernTreasuryStatus: string;
  citiReferenceNumber: string;
  aiRoutingDecision: {
    selectedRail: string;
    reasoning: string;
    estimatedSettlementTime: string;
    savedFeesUSD: number;
  };
  securityVerification: {
    biometricVerified: boolean;
    quantumEncryptionKeyId: string;
    complianceCheckPassed: boolean;
  };
}