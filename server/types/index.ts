export enum UserRole {
  CITIZEN = "CITIZEN",
  GOV_OFFICIAL = "GOV_OFFICIAL",
  ILLUMINATI_OPERATIVE = "ILLUMINATI_OPERATIVE",
  SUPPLIER = "SUPPLIER",
  LOGISTICS_PARTNER = "LOGISTICS_PARTNER",
  BANKER = "BANKER",
  SYSTEM_ADMIN = "SYSTEM_ADMIN"
}

export enum SecurityClearanceLevel {
  LEVEL_0_PUBLIC = 0,
  LEVEL_1_CONFIDENTIAL = 1,
  LEVEL_2_SECRET = 2,
  LEVEL_3_TOP_SECRET = 3,
  LEVEL_4_COSMIC = 4,
  LEVEL_5_ILLUMINATI = 5
}

export enum AssetType {
  REAL_ESTATE = "REAL_ESTATE",
  VEHICLE = "VEHICLE",
  COMMODITY = "COMMODITY",
  SOVEREIGN_DEBT = "SOVEREIGN_DEBT",
  INTELLECTUAL_PROPERTY = "INTELLECTUAL_PROPERTY",
  INFRASTRUCTURE = "INFRASTRUCTURE",
  CURRENCY = "CURRENCY",
  NATURAL_RESOURCE = "NATURAL_RESOURCE",
  MILITARY_HARDWARE = "MILITARY_HARDWARE"
}

export enum AssetStatus {
  AVAILABLE = "AVAILABLE",
  PENDING_TRANSFER = "PENDING_TRANSFER",
  RESERVED = "RESERVED",
  SEIZED = "SEIZED",
  LIQUIDATED = "LIQUIDATED",
  DESTROYED = "DESTROYED"
}

export enum TransactionType {
  BUY = "BUY",
  SELL = "SELL",
  TRANSFER = "TRANSFER",
  TAX_LEVY = "TAX_LEVY",
  SOVEREIGN_ISSUANCE = "SOVEREIGN_ISSUANCE",
  ASSET_SEIZURE = "ASSET_SEIZURE",
  ESCROW_HOLD = "ESCROW_HOLD",
  SUPPLY_CHAIN_PAYMENT = "SUPPLY_CHAIN_PAYMENT"
}

export enum TransactionStatus {
  PENDING = "PENDING",
  IN_ESCROW = "IN_ESCROW",
  COMPLETED = "COMPLETED",
  FAILED = "FAILED",
  REVERSED = "REVERSED",
  BLOCKED_BY_GOVERNMENT = "BLOCKED_BY_GOVERNMENT"
}

export enum ShipmentStatus {
  ORIGIN_PROCESSING = "ORIGIN_PROCESSING",
  IN_TRANSIT = "IN_TRANSIT",
  CUSTOMS_CLEARANCE = "CUSTOMS_CLEARANCE",
  DELIVERED = "DELIVERED",
  DELAYED = "DELAYED",
  CONFISCATED = "CONFISCATED"
}

export enum SovereignActionType {
  CURRENCY_PRINT = "CURRENCY_PRINT",
  ASSET_SEIZURE = "ASSET_SEIZURE",
  INFRASTRUCTURE_BUILD = "INFRASTRUCTURE_BUILD",
  LAW_ENACTMENT = "LAW_ENACTMENT",
  INTELLIGENCE_OPERATION = "INTELLIGENCE_OPERATION",
  RESOURCE_RATIONING = "RESOURCE_RATIONING"
}

export interface IUser {
  id: string;
  username: string;
  email: string;
  passwordHash: string;
  role: UserRole;
  clearanceLevel: SecurityClearanceLevel;
  citizenProfile?: ICitizenProfile;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICitizenProfile {
  citizenId: string;
  firstName: string;
  lastName: string;
  dateOfBirth: Date;
  nationality: string;
  socialCreditScore: number;
  netWorth: number;
  biometricHash: string;
  isSovereignEntity: boolean;
  taxBracket: number;
}

export interface IAsset {
  id: string;
  ownerId: string;
  type: AssetType;
  name: string;
  description: string;
  valueInSovereignCredits: number;
  status: AssetStatus;
  metadata: IRealEstateDetails | IVehicleDetails | IInfrastructureDetails | ICommodityDetails | IMilitaryDetails;
  isSovereignControlled: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRealEstateDetails {
  address: string;
  latitude: number;
  longitude: number;
  squareFootage: number;
  zoningType: "RESIDENTIAL" | "COMMERCIAL" | "INDUSTRIAL" | "SOVEREIGN_ZONE";
  parcelId: string;
  hasBunker: boolean;
}

export interface IVehicleDetails {
  vin: string;
  make: string;
  model: string;
  year: number;
  propulsionType: "ELECTRIC" | "HYDROGEN" | "COMBUSTION" | "NUCLEAR" | "GRAVITATIONAL";
  maxRangeKm: number;
  autonomousLevel: number;
  registrationPlate: string;
}

export interface IInfrastructureDetails {
  sector: "ENERGY" | "WATER" | "TELECOM" | "TRANSPORTATION" | "DEFENSE";
  capacityMegawatts?: number;
  throughputPerDay?: number;
  operationalStatus: "OPTIMAL" | "MAINTENANCE" | "DEGRADED" | "OFFLINE";
}

export interface ICommodityDetails {
  material: string;
  purityPercentage: number;
  weightInKg: number;
  storageFacilityId: string;
}

export interface IMilitaryDetails {
  classification: string;
  lethalityIndex: number;
  payloadCapacityKg: number;
  deploymentStatus: "STANDBY" | "ACTIVE" | "DECOMMISSIONED";
}

export interface ITransaction {
  id: string;
  senderId: string;
  receiverId: string;
  assetId?: string;
  amount: number;
  currency: string;
  type: TransactionType;
  status: TransactionStatus;
  escrowAgentId?: string;
  taxDeducted: number;
  signature: string;
  blockIndex?: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ISupplyChainItem {
  id: string;
  sku: string;
  name: string;
  description: string;
  manufacturerId: string;
  currentOwnerId: string;
  rawMaterials: IRawMaterialSource[];
  productionCost: number;
  retailPrice: number;
  carbonFootprint: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface IRawMaterialSource {
  materialName: string;
  originCountry: string;
  supplierId: string;
  quantityInKg: number;
}

export interface IShipment {
  id: string;
  itemId: string;
  quantity: number;
  originAddress: string;
  destinationAddress: string;
  carrierId: string;
  status: ShipmentStatus;
  currentLatitude: number;
  currentLongitude: number;
  estimatedDelivery: Date;
  actualDelivery?: Date;
  customsDeclarationHash: string;
}

export interface ICompany {
  id: string;
  name: string;
  registrationNumber: string;
  jurisdiction: string;
  parentCompanyId?: string;
  ceoId: string;
  marketCapitalization: number;
  isStateOwned: boolean;
  supplyChainNodeIds: string[];
}

export interface ISovereignAction {
  id: string;
  initiatorId: string;
  actionType: SovereignActionType;
  targetUserId?: string;
  targetAssetId?: string;
  justification: string;
  clearanceRequired: SecurityClearanceLevel;
  isExecuted: boolean;
  executionPayload: string;
  createdAt: Date;
}

export interface INodeSyncState {
  nodeId: string;
  lastSyncTimestamp: Date;
  blockHeight: number;
  peerCount: number;
  isOfflineCapable: boolean;
  pendingTransactionsCount: number;
  systemLoad: number;
}

export interface IPeerNode {
  id: string;
  ipAddress: string;
  port: number;
  region: string;
  publicKey: string;
  latencyMs: number;
  isTrustedSovereignNode: boolean;
}

// ==========================================
// ALPACA INTEGRATION TYPES
// ==========================================

export enum AlpacaAccountStatus {
  ONBOARDING = "ONBOARDING",
  SUBMISSION_FAILED = "SUBMISSION_FAILED",
  SUBMITTED = "SUBMITTED",
  ACCOUNT_CLOSED = "ACCOUNT_CLOSED",
  ACTIVE = "ACTIVE",
  REJECTED = "REJECTED"
}

export interface IAlpacaAccount {
  id: string;
  accountNumber: string;
  status: AlpacaAccountStatus;
  currency: string;
  cash: number;
  portfolioValue: number;
  buyingPower: number;
  createdAt: Date;
}

export interface IAlpacaOrder {
  id: string;
  clientOrderId: string;
  assetId: string;
  symbol: string;
  qty: number;
  filledQty: number;
  type: "market" | "limit" | "stop" | "stop_limit";
  side: "buy" | "sell";
  timeInForce: "day" | "gtc" | "opg" | "cls" | "ioc" | "fok";
  limitPrice?: number;
  stopPrice?: number;
  status: "new" | "partially_filled" | "filled" | "done_for_day" | "canceled" | "expired" | "replaced" | "pending_cancel" | "pending_replace" | "accepted" | "pending_new" | "accepted_for_bidding" | "stopped" | "rejected" | "suspended" | "calculated";
  filledAvgPrice?: number;
  createdAt: Date;
}

export interface IAlpacaPosition {
  assetId: string;
  symbol: string;
  exchange: string;
  assetClass: string;
  avgEntryPrice: number;
  qty: number;
  side: "long" | "short";
  marketValue: number;
  costBasis: number;
  unrealizedPl: number;
  unrealizedPlpc: number;
  currentPrice: number;
  lastdayPrice: number;
  changeToday: number;
}

export interface IAlpacaJournal {
  id: string;
  entryType: "JNLC" | "JNLS";
  fromAccount: string;
  toAccount: string;
  amount: number;
  symbol?: string;
  qty?: number;
  status: "pending" | "correct" | "canceled" | "rejected" | "deleted" | "executed";
  settleDate?: Date;
  description: string;
}

export interface IAlpacaFunding {
  id: string;
  accountId: string;
  type: "ach" | "wire";
  direction: "incoming" | "outgoing";
  amount: number;
  status: "queued" | "sent_to_clearing" | "approved" | "rejected" | "canceled" | "returned" | "complete";
  bankAccountId: string;
  createdAt: Date;
}

export interface IAlpacaMarketData {
  symbol: string;
  price: number;
  bid: number;
  bidSize: number;
  ask: number;
  askSize: number;
  timestamp: Date;
}

export interface IAlpacaOptionContract {
  id: string;
  symbol: string;
  underlyingSymbol: string;
  type: "call" | "put";
  expirationDate: Date;
  strikePrice: number;
  openInterest: number;
  volume: number;
}

export interface IAlpacaRebalanceStrategy {
  id: string;
  name: string;
  weights: Record<string, number>;
  rebalanceInterval: "daily" | "weekly" | "monthly" | "quarterly";
  lastRebalancedAt?: Date;
  isActive: boolean;
}

export interface IAlpacaTokenizedAsset {
  id: string;
  symbol: string;
  underlyingAssetId: string;
  tokenContractAddress: string;
  totalSupply: number;
  circulatingSupply: number;
  parValue: number;
}

export interface IAlpacaCollateral {
  id: string;
  accountId: string;
  eligibleValue: number;
  borrowedValue: number;
  maintenanceMargin: number;
  collateralRatio: number;
  isUnderMarginCall: boolean;
}

// ==========================================
// CITI INTEGRATION TYPES
// ==========================================

export interface ICitiAccount {
  accountId: string;
  accountNumber: string;
  iban?: string;
  swiftCode?: string;
  currency: string;
  balance: number;
  availableBalance: number;
  accountType: "CHECKING" | "SAVINGS" | "TREASURY" | "SOVEREIGN_RESERVE";
  status: "ACTIVE" | "SUSPENDED" | "CLOSED";
}

export interface ICitiPaymentInitiation {
  paymentId: string;
  sourceAccountId: string;
  destinationAccountId: string;
  destinationIban?: string;
  destinationSwift?: string;
  amount: number;
  currency: string;
  chargeBearer: "DEBT" | "CRED" | "SHAR";
  paymentMethod: "SEPA" | "CHAPS" | "FEDWIRE" | "TARGET2" | "SWIFT";
  reference: string;
  status: "INITIATED" | "PENDING_APPROVAL" | "SENT" | "COMPLETED" | "REJECTED";
  createdAt: Date;
}

export interface ICitiPaymentInquiry {
  inquiryId: string;
  paymentId: string;
  currentStatus: string;
  clearingSystemReference?: string;
  updatedAt: Date;
}

export interface ICitiNotification {
  notificationId: string;
  eventType: "PAYMENT_RECEIVED" | "PAYMENT_FAILED" | "BALANCE_ALERT" | "COMPLIANCE_HOLD";
  payload: string;
  isProcessed: boolean;
  createdAt: Date;
}

export interface ICitiDecryptionConfig {
  keyId: string;
  algorithm: "RSA-OAEP" | "AES-GCM";
  privateKeyPem: string;
  publicKeyPem: string;
}

export interface ICitiTreasuryTransfer {
  transferId: string;
  sourceTreasuryId: string;
  destinationTreasuryId: string;
  amount: number;
  currency: string;
  authorizedBy: string;
  complianceToken: string;
  status: "PENDING" | "AUTHORIZED" | "EXECUTED" | "FAILED";
}

export interface ICitiSovereignLedgerEntry {
  entryId: string;
  citiTransactionId: string;
  sovereignCreditAmount: number;
  fiatEquivalentAmount: number;
  fiatCurrency: string;
  conversionRate: number;
  timestamp: Date;
}

export interface ICitiCryptoWallet {
  walletId: string;
  citiAccountId: string;
  blockchain: "ETHEREUM" | "BITCOIN" | "SOVEREIGN_NET";
  address: string;
  publicKey: string;
  encryptedPrivateKey: string;
  balance: number;
}

// ==========================================
// PLAID INTEGRATION TYPES
// ==========================================

export interface IPlaidLinkToken {
  linkToken: string;
  expiration: Date;
  requestId: string;
}

export interface IPlaidPublicToken {
  publicToken: string;
  metadata: string;
}

export interface IPlaidAccount {
  id: string;
  name: string;
  mask: string;
  type: string;
  subtype: string;
  balances: {
    available?: number;
    current: number;
    limit?: number;
    isoCurrencyCode?: string;
  };
}

export interface IPlaidTransaction {
  id: string;
  accountId: string;
  amount: number;
  isoCurrencyCode?: string;
  category: string[];
  date: Date;
  name: string;
  pending: boolean;
}

export interface IPlaidAlpacaBridgeConfig {
  bridgeId: string;
  plaidAccountId: string;
  alpacaAccountId: string;
  autoSweepEnabled: boolean;
  sweepThreshold: number;
  lastSweepAt?: Date;
}

// ==========================================
// STRIPE INTEGRATION TYPES
// ==========================================

export interface IStripeTreasuryAccount {
  id: string;
  object: "treasury.financial_account";
  balances: {
    cash: Record<string, number>;
    inbound_flows: Record<string, number>;
    outbound_flows: Record<string, number>;
  };
  features: Record<string, boolean>;
  status: "open" | "closed" | "restricted";
}

export interface IStripeFinancialConnection {
  id: string;
  accountId: string;
  institutionName: string;
  last4: string;
  status: "active" | "inactive";
}

export interface IStripeAlpacaBridgeConfig {
  bridgeId: string;
  stripeAccountId: string;
  alpacaAccountId: string;
  payoutSchedule: "daily" | "weekly" | "manual";
  lastPayoutAt?: Date;
}

// ==========================================
// MODERN TREASURY INTEGRATION TYPES
// ==========================================

export interface IModernTreasuryLedger {
  id: string;
  name: string;
  description?: string;
  currency: string;
  createdAt: Date;
}

export interface IModernTreasuryLedgerAccount {
  id: string;
  ledgerId: string;
  name: string;
  normalBalance: "debit" | "credit";
  balances: {
    postedBalance: number;
    pendingBalance: number;
  };
}

export interface IModernTreasuryLedgerTransaction {
  id: string;
  ledgerId: string;
  description?: string;
  postedAt: Date;
  status: "pending" | "posted" | "archived";
  ledgerEntries: Array<{
    id: string;
    ledgerAccountId: string;
    amount: number;
    direction: "debit" | "credit";
  }>;
}

export interface IModernTreasuryPaymentOrder {
  id: string;
  amount: number;
  direction: "credit" | "debit";
  paymentType: "ach" | "wire" | "check" | "rtp";
  originatingAccountId: string;
  receivingAccountId: string;
  status: "pending" | "processing" | "completed" | "failed" | "cancelled";
}

// ==========================================
// REAL ESTATE & TAX LIENS TYPES
// ==========================================

export interface IRealEstateDeed {
  deedId: string;
  parcelId: string;
  grantor: string;
  grantee: string;
  recordingDate: Date;
  documentHash: string;
  isVerified: boolean;
}

export interface IEscrowAgreement {
  escrowId: string;
  buyerId: string;
  sellerId: string;
  assetId: string;
  purchasePrice: number;
  earnestMoney: number;
  conditions: string[];
  status: "PENDING" | "FUNDED" | "DISBURSED" | "CANCELLED";
  createdAt: Date;
}

export interface IPropertyListing {
  listingId: string;
  assetId: string;
  askingPrice: number;
  isNegotiable: boolean;
  listingStatus: "ACTIVE" | "PENDING" | "SOLD" | "WITHDRAWN";
  createdAt: Date;
}

export interface IForeclosureCase {
  caseId: string;
  propertyAddress: string;
  parcelId: string;
  ownerName: string;
  delinquentAmount: number;
  filingDate: Date;
  auctionDate?: Date;
  status: "FILED" | "NOTICE_SENT" | "AUCTION_SCHEDULED" | "REDEEMED" | "FORECLOSED";
}

export interface ITaxLienAuction {
  auctionId: string;
  parcelId: string;
  taxYear: number;
  delinquentTaxes: number;
  interestRateBid: number;
  winningBidderId?: string;
  winningBidAmount?: number;
  auctionStatus: "OPEN" | "CLOSED" | "CANCELLED";
  closingDate: Date;
}

export interface ITaxLienCertificate {
  certificateId: string;
  auctionId: string;
  parcelId: string;
  holderId: string;
  faceValue: number;
  interestRate: number;
  issueDate: Date;
  expirationDate: Date;
  isRedeemed: boolean;
}

// ==========================================
// GOVERNMENT & SOVEREIGN TYPES
// ==========================================

export interface IGisProperty {
  parcelId: string;
  ownerName: string;
  address: string;
  geometry: {
    type: "Polygon" | "MultiPolygon";
    coordinates: number[][][];
  };
  assessedValue: number;
  taxAmount: number;
  zoningCode: string;
}

export interface IGovernmentApiConfig {
  agencyName: string;
  endpointUrl: string;
  apiKey: string;
  authType: "Bearer" | "OAuth2" | "MutualTLS";
  scopes: string[];
}

export interface IIrsTaxFiling {
  filingId: string;
  taxpayerId: string;
  taxYear: number;
  grossIncome: number;
  deductions: number;
  taxOwed: number;
  taxPaid: number;
  status: "SUBMITTED" | "UNDER_REVIEW" | "AUDITED" | "ACCEPTED" | "REJECTED";
  submittedAt: Date;
}

export interface ISecFiling {
  accessionNumber: string;
  cik: string;
  companyName: string;
  formType: "10-K" | "10-Q" | "8-K" | "4";
  filingDate: Date;
  documentUrl: string;
}

export interface ISovereignDeal {
  dealId: string;
  sovereignEntityId: string;
  counterpartyId: string;
  dealType: "INFRASTRUCTURE_LEASE" | "RESOURCE_CONCESSION" | "DEBT_RESTRUCTURING" | "MILITARY_ALLIANCE";
  valueInSovereignCredits: number;
  terms: string;
  isAudited: boolean;
  auditHash?: string;
  status: "PROPOSED" | "NEGOTIATING" | "SIGNED" | "ACTIVE" | "TERMINATED";
}

export interface ISovereignIntelligenceReport {
  reportId: string;
  classification: SecurityClearanceLevel;
  subject: string;
  summary: string;
  sourceReliability: "A" | "B" | "C" | "D" | "E" | "F";
  informationCredibility: "1" | "2" | "3" | "4" | "5" | "6";
  contentEncrypted: string;
  createdAt: Date;
}

export interface ISovereignOrgHandshake {
  handshakeId: string;
  initiatingOrgId: string;
  receivingOrgId: string;
  sharedSecretHash: string;
  handshakeProtocol: "TLS-1.3" | "NOISE-IK" | "CUSTOM-QUANTUM";
  status: "INITIATED" | "VERIFIED" | "EXPIRED" | "REVOKED";
  timestamp: Date;
}

export interface ISovereignSentryAlert {
  alertId: string;
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  sourceSystem: string;
  message: string;
  isAcknowledged: boolean;
  acknowledgedBy?: string;
  createdAt: Date;
}

export interface IWarAppropriation {
  appropriationId: string;
  billNumber: string;
  department: string;
  allocatedAmount: number;
  spentAmount: number;
  purpose: string;
  classifiedProjectCode?: string;
  approvedDate: Date;
}

export interface IVoterRecord {
  voterId: string;
  state: string;
  county: string;
  registrationStatus: "ACTIVE" | "INACTIVE" | "PENDING" | "CANCELLED";
  partyAffiliation: "DEMOCRAT" | "REPUBLICAN" | "INDEPENDENT" | "OTHER";
  lastVotedDate?: Date;
}

export interface IPublicAidCalculation {
  calculationId: string;
  applicantId: string;
  householdSize: number;
  monthlyIncome: number;
  eligiblePrograms: string[];
  calculatedMonthlyBenefit: number;
  timestamp: Date;
}

// ==========================================
// AI & GEMINI TYPES
// ==========================================

export interface IAiAgentConfig {
  agentId: string;
  name: string;
  modelName: "gemini-1.5-pro" | "gemini-1.5-flash" | "custom-sovereign-llm";
  systemInstruction: string;
  temperature: number;
  topP: number;
  maxOutputTokens: number;
}

export interface IAiAdvisorRecommendation {
  recommendationId: string;
  userId: string;
  portfolioValue: number;
  riskTolerance: "CONSERVATIVE" | "MODERATE" | "AGGRESSIVE" | "SOVEREIGN_MAXIMALIST";
  suggestedTrades: Array<{
    symbol: string;
    action: "BUY" | "SELL";
    percentage: number;
  }>;
  justification: string;
  createdAt: Date;
}

export interface IAiInsight {
  insightId: string;
  category: "MARKET" | "GEOPOLITICAL" | "COMPLIANCE" | "SECURITY";
  title: string;
  content: string;
  confidenceScore: number;
  suggestedAction?: string;
  createdAt: Date;
}

export interface IGeminiLiveSession {
  sessionId: string;
  userId: string;
  tokenCount: number;
  latencyMs: number;
  transcript: Array<{
    speaker: "USER" | "AI";
    text: string;
    timestamp: Date;
  }>;
  isActive: boolean;
}

export interface IAiAdCampaign {
  campaignId: string;
  targetAudienceDemographics: string;
  adCopyText: string;
  generatedImagePrompt: string;
  budgetAmount: number;
  platformChannels: string[];
  conversionRateEstimate: number;
  status: "DRAFT" | "ACTIVE" | "PAUSED" | "COMPLETED";
}

// ==========================================
// AZURE & ENTRA TYPES
// ==========================================

export interface IAzureAppConfig {
  appId: string;
  displayName: string;
  tenantId: string;
  replyUrls: string[];
  requiredResourceAccess: Array<{
    resourceAppId: string;
    resourceAccess: Array<{
      id: string;
      type: "Scope" | "Role";
    }>;
  }>;
}

export interface IAzureGovComplianceReport {
  reportId: string;
  subscriptionId: string;
  complianceStandard: "NIST-800-53" | "FedRAMP-High" | "DoD-SRG-IL5";
  passedControlsCount: number;
  failedControlsCount: number;
  remediationSteps: string[];
  generatedAt: Date;
}

export interface IEntraSwarmNode {
  nodeId: string;
  swarmId: string;
  managedIdentityId: string;
  assignedRoles: string[];
  healthStatus: "HEALTHY" | "DEGRADED" | "UNHEALTHY";
  lastHeartbeat: Date;
}

export interface IEntraSecurityAlert {
  alertId: string;
  userPrincipalName: string;
  ipAddress: string;
  riskLevel: "low" | "medium" | "high" | "hidden";
  riskState: "none" | "confirmedSafe" | "remediated" | "dismissed" | "atRisk" | "confirmedCompromised";
  detectionType: string;
  detectedDateTime: Date;
}

export interface IDefenderAtpIncident {
  incidentId: string;
  incidentName: string;
  severity: "Informational" | "Low" | "Medium" | "High";
  status: "New" | "InProgress" | "Resolved";
  alertsCount: number;
  devicesCount: number;
  usersCount: number;
  lastUpdateTime: Date;
}

// ==========================================
// QUANTUM & ZKP TYPES
// ==========================================

export interface IQuantumState {
  qubitCount: number;
  coherenceTimeMs: number;
  gateFidelity: number;
  quantumVolume: number;
  isErrorCorrected: boolean;
}

export interface IQuantumBridgeTransaction {
  bridgeTxId: string;
  sourceChain: string;
  destinationChain: string;
  quantumEntangledStateId: string;
  payloadHash: string;
  status: "ENTANGLING" | "MEASURED" | "TRANSFERRED" | "COMPLETED" | "FAILED";
}

export interface IZkpProof {
  pi_a: string[];
  pi_b: string[][];
  pi_c: string[];
  protocol: "groth16" | "plonk";
}

export interface IZkpVerificationKey {
  vk_alpha_1: string[];
  vk_beta_2: string[][];
  vk_gamma_2: string[][];
  vk_delta_2: string[][];
  vk_alphabeta_12: string[][][];
  IC: string[][];
}

// ==========================================
// TRILLIONAIRE STATUS & FORTUNE 500 TYPES
// ==========================================

export interface ICapitalAllocationModel {
  modelId: string;
  modelName: string;
  r_and_d_percentage: number;
  m_and_a_percentage: number;
  capex_percentage: number;
  share_buyback_percentage: number;
  dividend_percentage: number;
  projectedRoi: number;
}

export interface ICompetitorIntelligenceReport {
  competitorId: string;
  competitorName: string;
  marketSharePercentage: number;
  estimatedRevenue: number;
  strategicThreatLevel: "LOW" | "MEDIUM" | "HIGH" | "EXISTENTIAL";
  weaknesses: string[];
  strengths: string[];
}

export interface IConsumerSentimentAnalysis {
  productId: string;
  sentimentScore: number; // -1.0 to 1.0
  sampleSize: number;
  topKeywords: string[];
  demographicBreakdown: Record<string, number>;
}

export interface ICorporateGovernanceReview {
  companyId: string;
  boardIndependenceRatio: number;
  executiveCompensationToMedianEmployeeRatio: number;
  shareholderRightsScore: number; // 1-100
  governanceRiskRating: "A" | "B" | "C" | "D" | "F";
}

export interface IDigitalTransformationAudit {
  companyId: string;
  cloudAdoptionPercentage: number;
  legacySystemCount: number;
  cybersecurityMaturityLevel: number; // 1-5
  digitalRevenuePercentage: number;
}

export interface IEmergingMarketExpansionPlan {
  planId: string;
  targetCountry: string;
  marketSizeEstimate: number;
  regulatoryBarriersScore: number; // 1-10
  plannedInvestmentAmount: number;
  timelineMonths: number;
}

export interface IEsgImpactMetrics {
  companyId: string;
  carbonEmissionsScope1: number;
  carbonEmissionsScope2: number;
  carbonEmissionsScope3: number;
  diversityPercentageBoard: number;
  diversityPercentageWorkforce: number;
  esgRating: "AAA" | "AA" | "A" | "BBB" | "BB" | "B" | "CCC";
}

export interface IExecutiveCompensationAudit {
  executiveId: string;
  companyId: string;
  baseSalary: number;
  stockOptionsValue: number;
  performanceBonus: number;
  goldenParachuteTerms: string;
  isAlignedWithPerformance: boolean;
}

export interface IFinancialDataIngestionConfig {
  sourceId: string;
  sourceName: "BLOOMBERG" | "REUTERS" | "SEC_EDGAR" | "YAHOO_FINANCE";
  ingestionFrequency: "REALTIME" | "HOURLY" | "DAILY";
  lastIngestedAt?: Date;
  status: "ACTIVE" | "INACTIVE" | "ERROR";
}

export interface IFortune500ResearchPlan {
  planId: string;
  targetCikList: string[];
  researchObjectives: string[];
  assignedAnalystIds: string[];
  dueDate: Date;
  status: "NOT_STARTED" | "IN_PROGRESS" | "COMPLETED";
}

export interface IGlobalTaxStrategy {
  strategyId: string;
  subsidiaryJurisdictions: string[];
  effectiveTaxRateTarget: number;
  transferPricingMethodology: string;
  doubleTaxationTreatiesUtilized: string[];
  complianceRiskLevel: "LOW" | "MEDIUM" | "HIGH";
}

export interface IInfrastructureDependency {
  dependencyId: string;
  systemName: string;
  dependentOnSystemName: string;
  criticality: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  failoverPlanDescription: string;
}

export interface IInnovationPipeline {
  companyId: string;
  activePatentsCount: number;
  pendingPatentsCount: number;
  annualRandDBudget: number;
  breakthroughProjects: Array<{
    projectName: string;
    stage: "CONCEPT" | "PROTOTYPE" | "TESTING" | "PRODUCTION";
    estimatedMarketLaunchYear: number;
  }>;
}

export interface ILobbyingInfluenceMap {
  lobbyistFirmId: string;
  targetPoliticianId: string;
  contributionsAmount: number;
  billsTargeted: string[];
  influenceRating: number; // 1-10
}

export interface IMarketCapAnalysis {
  companyId: string;
  outstandingShares: number;
  currentSharePrice: number;
  marketCap: number;
  enterpriseValue: number;
  peRatio: number;
  pbRatio: number;
}

export interface IMergersAndAcquisitionsDeal {
  dealId: string;
  acquirerCompanyId: string;
  targetCompanyId: string;
  dealValue: number;
  paymentType: "CASH" | "STOCK" | "MIXED";
  regulatoryApprovalStatus: "PENDING" | "APPROVED" | "BLOCKED";
  expectedSynergiesValue: number;
  closingDate?: Date;
}

export interface IPatentPortfolio {
  portfolioId: string;
  ownerCompanyId: string;
  patents: Array<{
    patentNumber: string;
    title: string;
    filingDate: Date;
    expirationDate: Date;
    jurisdiction: string;
  }>;
}

export interface IRegulatoryComplianceAudit {
  auditId: string;
  companyId: string;
  regulatoryBody: "SEC" | "FINRA" | "FTC" | "EPA" | "FDA";
  auditScope: string;
  findings: string[];
  finesAssessed: number;
  complianceStatus: "COMPLIANT" | "NON_COMPLIANT" | "UNDER_REMEDIATION";
}

export interface IRiskAssessment {
  riskId: string;
  category: "MARKET" | "CREDIT" | "OPERATIONAL" | "LIQUIDITY" | "REPUTATIONAL";
  probability: number; // 0.0 to 1.0
  impactValue: number;
  mitigationStrategy: string;
  residualRiskScore: number;
}

export interface IShareholderValueMetrics {
  companyId: string;
  returnOnEquity: number;
  returnOnAssets: number;
  totalShareholderReturn: number;
  freeCashFlowPerShare: number;
}

export interface ISupplyChainMap {
  mapId: string;
  companyId: string;
  nodes: Array<{
    nodeId: string;
    location: string;
    role: "SUPPLIER" | "MANUFACTURER" | "DISTRIBUTOR" | "RETAILER";
    riskScore: number;
  }>;
  edges: Array<{
    fromNodeId: string;
    toNodeId: string;
    transportMode: "AIR" | "SEA" | "RAIL" | "ROAD";
    leadTimeDays: number;
  }>;
}

export interface ISustainabilityReport {
  reportId: string;
  companyId: string;
  waterUsageLiters: number;
  wasteRecycledPercentage: number;
  renewableEnergyPercentage: number;
  sustainabilityScore: number; // 1-100
}

export interface ITalentPipeline {
  companyId: string;
  headcount: number;
  turnoverRate: number;
  openPositionsCount: number;
  averageTimeToHireDays: number;
  keyExecutiveSuccessionPlanReady: boolean;
}

export interface ITechStackIntegration {
  integrationId: string;
  systemA: string;
  systemB: string;
  protocol: "REST" | "GRAPHQL" | "GRPC" | "WEBSOCKET" | "MESSAGE_QUEUE";
  dataSyncFrequency: "REALTIME" | "BATCH";
  isEncrypted: boolean;
}

export interface ITrillionaireStatusSummary {
  userId: string;
  netWorthFiat: number;
  netWorthSovereignCredits: number;
  controlledCompaniesCount: number;
  globalInfluenceScore: number; // 1-100
  isTrillionaireStatusAchieved: boolean;
  achievedAt?: Date;
}

// ==========================================
// CICADA PUZZLES & LAST BOSS TYPES
// ==========================================

export interface ICicadaPuzzle {
  puzzleId: string;
  title: string;
  description: string;
  cryptographicClue: string;
  difficultyLevel: number; // 1-10
  pointsReward: number;
  solvedByCount: number;
  isSolved: boolean;
}

export interface ILastBossChallenge {
  challengeId: string;
  bossName: string;
  healthPoints: number;
  attackPower: number;
  defensePower: number;
  requiredClearance: SecurityClearanceLevel;
  cryptographicShieldHash: string;
}

export interface ILastBossState {
  bossId: string;
  currentHealth: number;
  isDefeated: boolean;
  defeatedByUserId?: string;
  defeatedAt?: Date;
}

// ==========================================
// OPEN BANKING & FAPI TYPES
// ==========================================

export interface IFapiClientConfig {
  clientId: string;
  tokenEndpointAuthMethod: "private_key_jwt" | "tls_client_auth";
  tlsClientAuthSubjectDn?: string;
  jwksUri: string;
  authorizationSignedResponseAlg: "PS256" | "ES256";
}

export interface IOpenBankingConsent {
  consentId: string;
  userId: string;
  tppId: string; // Third Party Provider ID
  permissions: string[];
  expirationDateTime: Date;
  status: "AWAITING_AUTHORISATION" | "AUTHORISED" | "REJECTED" | "REVOKED";
}

export interface IOpenBankingAccount {
  accountId: string;
  currency: string;
  nickname?: string;
  accountType: string;
  accountSubtype: string;
}

// ==========================================
// AQUARIUS SUITE TYPES
// ==========================================

export interface IAquariusArchitectBlueprint {
  blueprintId: string;
  name: string;
  architectureType: "MICROSERVICES" | "SERVERLESS" | "DECENTRALIZED_MESH";
  components: Array<{
    componentName: string;
    technology: string;
    scalingPolicy: string;
  }>;
  isApproved: boolean;
}

export interface IAquariusAuditLog {
  logId: string;
  actorId: string;
  action: string;
  resourceId: string;
  resourceType: string;
  ipAddress: string;
  userAgent: string;
  timestamp: Date;
}

export interface IAquariusCreativeAsset {
  assetId: string;
  title: string;
  mediaType: "IMAGE" | "VIDEO" | "AUDIO" | "3D_MODEL";
  storageUrl: string;
  metadataJson: string;
  creatorId: string;
}

export interface IAquariusGhostSession {
  sessionId: string;
  userId: string;
  anonymityLevel: "PSEUDONYM" | "TOR_ROUTED" | "FULLY_OBFUSCATED";
  activeDurationSeconds: number;
  bytesTransferred: number;
  isActive: boolean;
}

export interface IAquariusInstitutionalClient {
  clientId: string;
  institutionName: string;
  regulatoryJurisdiction: string;
  complianceOfficerName: string;
  onboardingStatus: "PENDING" | "APPROVED" | "REJECTED";
  riskRating: "LOW" | "MEDIUM" | "HIGH";
}

// ==========================================
// ADDITIONAL SYSTEM & INTEGRATION TYPES
// ==========================================

export interface IAstraDbConfig {
  endpoint: string;
  token: string;
  keyspace?: string;
}

export interface IPulsarConfig {
  serviceUrl: string;
  token?: string;
  topic: string;
}

export interface IQuantumClientConfig {
  endpoint: string;
  apiKey: string;
  useSimulator: boolean;
}

export interface IRemitraxTransaction {
  transactionId: string;
  senderName: string;
  receiverName: string;
  amount: number;
  currency: string;
  timestamp: Date;
  status: "PENDING" | "COMPLETED" | "FAILED";
}

export interface IGriffinMcpConfig {
  endpoint: string;
  clientId: string;
  clientSecret: string;
}

export interface IHoKToken {
  tokenId: string;
  ownerAddress: string;
  mintedAt: Date;
  metadata: Record<string, any>;
}

export interface IJweJwsPayload {
  protectedHeader: Record<string, any>;
  unprotectedHeader?: Record<string, any>;
  payload: string;
  signature?: string;
  signatures?: Array<Record<string, any>>;
}

export interface INfcValidation {
  tagId: string;
  validatedAt: Date;
  isValid: boolean;
  readerId: string;
}

export interface IOfxStatement {
  accountId: string;
  bankId: string;
  transactions: Array<{
    id: string;
    amount: number;
    date: Date;
    memo: string;
  }>;
}

export interface ISovereignChatMessage {
  messageId: string;
  senderId: string;
  text: string;
  timestamp: Date;
  isEncrypted: boolean;
}

export interface IWealthDistribution {
  bracketName: string;
  populationPercentage: number;
  wealthPercentage: number;
}

export interface IWorkspaceNexus {
  workspaceId: string;
  name: string;
  ownerId: string;
  memberIds: string[];
  createdAt: Date;
}