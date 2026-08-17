import React from 'react';

declare global {
  interface Window {
    aistudio?: {
      hasSelectedApiKey: () => Promise<boolean>;
      openSelectKey: () => Promise<void>;
    };
    ethereum?: any;
  }

  interface SharedArrayBuffer {
    resizable: boolean;
    resize(newLength: number): void;
    detached: boolean;
    transfer(newByteLength?: number): ArrayBuffer;
    transferToFixedLength(newByteLength?: number): ArrayBuffer;
  }
}

declare module '@google/generative-ai' {
  export interface EnumStringSchema {
    format?: string;
  }
}

export interface UserPayload {
  id: string;
  clearanceLevel: number;
  roles: string[];
  did: string;
}

export enum View {
  Dashboard = 'AQUARIUS_EXECUTIVE_COMMAND',
  FilesVault = 'SOVEREIGN_FILES_EXPLORER',
  DataIngest = 'NEURAL_DATA_INGEST',
  PortalHub = 'SOVEREIGN_PORTAL_HUB',
  BillingIdentity = 'LAST_BOSS_IDENTITY_VAULT',
  CryptoVerifier = 'JWE_JWS_CRYPTO_VERIFIER',
  
  // THE LEGIONS (Multi-modal Core)
  LegionArchitect = 'LEGION_I_ARCHITECT',
  LegionGhost = 'LEGION_II_GHOST',
  LegionVisualizer = 'LEGION_III_VISUALIZER',
  LegionVoice = 'LEGION_IV_VOICE',
  LegionAuditor = 'LEGION_V_AUDITOR',
  LegionLive = 'LEGION_VI_LIVE',
  
  // SOVEREIGNTY CORE (Identity & Security)
  IdentityCitadel = 'SOVEREIGN_IDENTITY_CITADEL',
  RecoveryMesh = 'NEURAL_RECOVERY_MESH',
  PrivacyGuardian = 'PRIVACY_BLINDER_CORE',
  TrustRegistry = 'DECENTRALIZED_TRUST_REGISTRY',
  
  // GROWTH & ASSET FORGE (Capital Expansion)
  WealthNexus = 'CAPITAL_GROWTH_NEXUS',
  TokenIssuance = 'SOVEREIGN_ASSET_FORGE',
  MarketingAutomation = 'CAMPAIGN_ORCHESTRATION_HUB',
  IntelligenceHub = 'INTELLIGENCE_CENTER_V5',
  NeuralTools = 'NEURAL_ORACLE_TOOLS',
  
  // OPERATIONS & INTELLIGENCE (Business Logic)
  InstitutionalHub = 'NEXUS_OPERATIONS_CONTROL',
  GlobalLedger = 'GLOBAL_TRANSACTION_LEDGER',
  NexusBuilder = 'NEXUS_FORGE_BUILDER',
  IntegrationsMarketplace = 'COMMAND_CENTER_INTEGRATIONS',
  
  // SYSTEM LAYER
  SendMoney = 'REMITRAX_PORTAL',
  Budgets = 'FISCAL_MANDATES',
  Goals = 'FINANCIAL_GOAL_CARTOGRAPHY',
  TheVision = 'THE_SOVEREIGN_MANIFESTO',
  Settings = 'SYSTEM_CORE_SETTINGS',
  Rewards = 'REWARDS_HUB_OMEGA',
  Portfolio = 'INVESTMENT_PORTFOLIO',
  CitiGateway = 'CITI_SOVEREIGN_GATEWAY',
  CitiConnectInitiation = 'CITI_CONNECT_PAYMENT_INITIATION',
  CitiConnectInquiry = 'CITI_CONNECT_PAYMENT_INQUIRY',
  CitiConnectNotifications = 'CITI_CONNECT_PUSH_NOTIFICATIONS',
  CitiTreasury = 'CITI_TREASURY_COMMAND_CENTER',
  FapiPipeline = 'UK_OPEN_BANKING_FAPI_SECURITY_PIPELINE',
  TradingBots = 'NEURAL_ADVISOR_SANCTUM',
  APIKeys = 'API_KEY_MANAGEMENT',
  Transactions = 'GLOBAL_TRANSACTION_LEDGER_HISTORY',
  AzureApps = 'AZURE_APPS_DIRECTORY',
  PaymentMethods = 'PAYMENT_METHODS_GATEWAY',
  
  // Navigation Aliases and Missing Views
  Investments = 'INVESTMENT_STRATEGY_PORTAL',
  QuantumWeaver = 'QUANTUM_VENTURE_INCUBATOR',
  Crypto = 'DECENTRALIZED_ASSET_GATEWAY',
  SovereignOrgHandshake = 'SOVEREIGN_ORG_HANDSHAKE',
  WorkspaceNexus = 'SOVEREIGN_WORKSPACE_NEXUS',
  GcpInventory = 'GCP_INVENTORY_VIEW',
  FloridaVoter = 'FLORIDA_VOTER_REGISTRATION',
  SovereignIntelligence = 'SOVEREIGN_INTELLIGENCE_CENTER',
  CitiDecryptionUtility = 'CITI_SOVEREIGN_DECRYPTION_VAULT',
  CitiPartnerHub = 'CITI_PARTNER_TRANSACTIONS_HUB',
  CitiUkInternationalPayments = 'CITI_UK_OPEN_BANKING_INTERNATIONAL_PAYMENTS',
  AstraDBQuickstart = 'ASTRA_DB_QUICKSTART_INITIALIZATION',
  UniverseGraph = 'UNIVERSE_GRAPH_3D_TOPOLOGY',
  ImpeachmentGenerator = 'IMPEACHMENT_GENERATOR_AUDIT',
  ContractorLobbying = 'CONTRACTOR_LOBBYING_ROI_INDEX',
  SentryEngine = 'SOVEREIGN_SENTRY_ENGINE_ISO20022',
  AriaComms = 'ARIA_COMMS_WORKLET',
  ModernTreasuryLedger = 'MODERN_TREASURY_LEDGER_HUB',
  AlpacaBroker = 'ALPACA_BROKER_API_INTEGRATION',
  AlpacaAccounts = 'ALPACA_ACCOUNTS_KYC_MANAGER',
  AlpacaTrading = 'ALPACA_TRADING_TERMINAL',
  AlpacaFunding = 'ALPACA_FUNDING_HUB',
  AlpacaCryptoWallets = 'ALPACA_CRYPTO_WALLETS',
  AlpacaJournals = 'ALPACA_SOVEREIGN_JOURNALS',
  AlpacaRebalancing = 'ALPACA_REBALANCING_ENGINE',
  AlpacaTokenization = 'ALPACA_TOKENIZATION_RWA',
  AlpacaIpoMarketplace = 'ALPACA_IPO_MARKETPLACE',
  AlpacaReporting = 'ALPACA_EOD_REPORTING',
  PlaidAlpacaBridge = 'PLAID_ALPACA_BRIDGE',
  StripeAlpacaBridge = 'STRIPE_ALPACA_BRIDGE',
  CitiAlpacaBridge = 'CITI_ALPACA_BRIDGE',
  SovereignMarketTakeover = 'SOVEREIGN_MARKET_TAKEOVER_HUB',
  AlpacaTqqq = 'ALPACA_TQQQ_ALGORITHM_TERMINAL',
  IframeView = 'IFRAME_VIEW',

  // Additional Views for Complete Integration
  GriffinMcp = 'GRIFFIN_MCP_GATEWAY',
  AppDeploymentPipeline = 'APP_DEPLOYMENT_PIPELINE',
  AppErrorRateTracker = 'APP_ERROR_RATE_TRACKER',
  AppIntegrationsBridge = 'APP_INTEGRATIONS_BRIDGE',
  AppMetricsDashboard = 'APP_METRICS_DASHBOARD',
  AppRegistryAuth = 'APP_REGISTRY_AUTH',
  AppRegistryManager = 'APP_REGISTRY_MANAGER',
  CardCustomization = 'CARD_CUSTOMIZATION_PORTAL',
}

export type AppView = View | string;

export interface ExternalApp {
  id: string;
  name: string;
  description: string;
  slug?: string;
  category: 'Banking' | 'AI' | 'Dev' | 'Security' | 'Legacy';
  viewId?: AppView;
  isPremium?: boolean;
}

export interface AzureApp {
  app: string;
  appId: string;
  servicePrincipal: string;
  owner: string;
  homepage?: string;
  objectId?: string;
  isCustom?: boolean;
}

export interface UserProfile {
  id: string;
  name: string;
  title: string;
  email: string;
  phone?: string;
  loyaltyTier: string;
  avatarUrl: string;
  usdBalance: number;
  fiatBalance: number;
  cryptoBalance: number;
  app_metadata: {
    stripe_customer_id?: string;
    subscription_status: 'active' | 'past_due' | 'unpaid' | 'none';
    is_pro: boolean;
  };
  user_metadata: {
    theme: string;
    discovery_source: string;
  };
}

export interface TransactionDetailsResponse {
  transactions?: Transaction[];
  investmentTransaction?: any[];
  nextStartIndex?: string;
}

export interface AccountDetailsResponse {
  checkingAccountSummary?: CheckingAccountSummary;
  savingsAccountSummary?: SavingsAccountSummary;
  creditCardAccountSummary?: CreditCardAccountSummary;
}

export interface CheckingAccountSummary extends BasicAccountDetails {}
export interface SavingsAccountSummary extends BasicAccountDetails {}
export interface CreditCardAccountSummary extends BasicAccountDetails {}
export interface ReadyCreditAccountSummary extends BasicAccountDetails {}
export interface LoanAccountSummary extends BasicAccountDetails {}
export interface MutualFundAccountSummary extends BasicAccountDetails {}
export interface SecuritiesBrokerageAccountSummary extends BasicAccountDetails {}
export interface CallDepositAccountSummary extends BasicAccountDetails {}
export interface PremiumDepositAccountSummary extends BasicAccountDetails {}
export interface TimeDepositAccountSummary extends BasicAccountDetails {}

export interface AccountsGroupList {
  accountGroupSummary: AccountGroupSummary[];
  nextStartIndex?: string;
}

export interface AccountGroupSummary {
  accountGroup: string;
  accounts: AccountSummary[];
  insurancePolicies?: InsurancePolicySummary[];
  totalCurrentBalance?: GroupBalance;
  totalAvailableBalance?: GroupBalance;
  totalOutstandingBalance?: GroupBalance;
}

export interface GroupBalance {
  amount: number;
  currencyCode: string;
}

export interface InsurancePolicySummary {
  policyId: string;
  policyName: string;
  policyStatus: string;
}

export interface AccountSummary {
  checkingAccountSummary?: CheckingAccountSummary;
  savingsAccountSummary?: SavingsAccountSummary;
  creditCardAccountSummary?: CreditCardAccountSummary;
  readyCreditAccountSummary?: ReadyCreditAccountSummary;
  loanAccountSummary?: LoanAccountSummary;
  mutualFundAccountSummary?: MutualFundAccountSummary;
  securitiesBrokerageAccountSummary?: SecuritiesBrokerageAccountSummary;
  callDepositAccountSummary?: CallDepositAccountSummary;
  premiumDepositAccountSummary?: PremiumDepositAccountSummary;
  timeDepositAccountSummary?: TimeDepositAccountSummary;
}

export interface BasicAccountDetails {
  displayAccountNumber: string;
  accountId: string;
  accountOpenDate: string;
  relationshipId: string;
  accountType: string;
  accountAlternateCurrencyCode: string;
  accountBaseCurrencyCode: string;
  productCode: string;
  subProductCode: string;
  accountName: string;
  accountNickname: string;
  accountDescription: string;
  accountStatus: string;
  accountGroupId: string;
  accountGroupTitle: string;
  accountGroupStatus: string;
  balances: Balances;
}

export interface Balances {
  marketValue?: { currencyBasedValue: CurrencyBasedValue };
  currentValue?: { currencyCurrentValue: CurrencyCurrentValue };
  availableBalance?: { currencyBasedValue: CurrencyBasedValue };
  accruedInterest?: { currencyBasedValue: CurrencyBasedValue };
  unrealisedGainLoss?: { currencyBasedValue: CurrencyBasedValue };
  totalBasis?: { currencyBasedValue: CurrencyBasedValue };
  yearToDateIncome?: { currencyBasedValue: CurrencyBasedValue };
  ytdRealizedGainLoss?: { currencyBasedValue: CurrencyBasedValue };
  estimatedAnnualIncome?: { currencyBasedValue: CurrencyBasedValue };
}

export interface CurrencyBasedValue {
  alternateAmount: number;
  baseAmount: number;
}

export interface CurrencyCurrentValue {
  alternateAmountValue: string[];
  baseAmountValue: string[];
}

export interface Transaction {
  id: string;
  date: string;
  amount: number;
  currency: string;
  type: 'INFLOW' | 'OUTFLOW' | 'income' | 'expense' | string;
  category: string;
  description: string;
  metadata: {
    merchantName: string;
    carbonFootprint: number;
    tags: string[];
    aiClassification?: string;
    mt_ledger_account_id?: string;
  };
}

export interface InternalAccount {
  id: string;
  bestName: string;
  currency: string;
  operationalStatus: 'ACTIVE' | 'ARCHIVED' | 'PENDING' | string;
  balance: number;
  bankName: string;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  value: number;
  assetClass: string;
  performanceYTD: number;
  color: string;
  riskLevel: 'Low' | 'Medium' | 'High';
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'critical' | 'success';
  view?: AppView;
}

export interface AIInsight {
  id: string;
  title: string;
  summary: string;
  confidence: number;
  urgency: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
  category?: string;
  remaining?: number;
  alerts?: any[];
}

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  type: string;
  description: string;
  iconName: string;
}

export interface APIStatus {
  id: string;
  name: string;
  description: string;
  provider: string;
  status: 'Operational' | 'Degraded Performance' | 'Partial Outage' | 'Major Outage';
  responseTime: number;
  latencyHistory: Array<{ time: string; latency: number }>;
}

export interface Feature {
  id: string;
  name: string;
  icon: string;
  category: string;
  description?: string;
}

export interface Asset {
  id: string;
  name: string;
  value: number;
  color: string;
  performanceYTD: number;
  type: string;
  description?: string;
  esgRating?: number;
}

export interface Subscription {
  id: string;
  name: string;
  amount: number;
  nextPayment: string;
  iconName: string;
}

export interface CreditScore {
  score: number;
  change?: number;
  rating: string;
  lastUpdated?: string;
}

export interface UpcomingBill {
  id: string;
  name: string;
  amount: number;
  dueDate: string;
}

export interface SavingsGoal {
  id: string;
  name: string;
  target: number;
  saved: number;
  iconName: string;
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  iconName: string;
  plan: any;
  startDate: string;
  contributions: any[];
  status: 'on_track' | 'needs_attention' | 'achieved' | 'behind';
}

export interface LinkedGoal {
  id: string;
  sourceGoalId: string;
  targetGoalId: string;
  relationshipType: 'prerequisite' | 'overflow' | 'milestone';
  triggerAmount?: number;
}

export interface CryptoAsset {
  ticker: string;
  name: string;
  value: number;
  amount: number;
  color: string;
}

export interface PaymentOperation {
  id: string;
  description: string;
  amount: number;
  status: string;
  type: string;
  date: string;
}

export interface CorporateCard {
  id: string;
  holderName: string;
  cardNumberMask: string;
  status: string;
  frozen: boolean;
  controls: {
    monthlyLimit: number;
    atm: boolean;
    online: boolean;
    contactless: boolean;
  };
}

export interface CorporateTransaction {
  id: string;
  merchant: string;
  amount: number;
  holderName: string;
  status: string;
  timestamp: string;
  date: string;
  description: string;
}

export interface RewardPoints {
  balance: number;
  lastEarned: number;
  lastRedeemed: number;
  currency: string;
  pending?: number;
  total?: number;
  history?: any[];
}

export interface CreditFactor {
  name: string;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  description: string;
}

export interface Counterparty {
  id: string;
  name: string;
  email: string;
  send_remittance_advice: boolean;
  accounts: any[];
  created_at: string;
}

export interface AccountDetails {
  id: string;
  name: string;
  mask: string;
  currentBalance: number;
  type: string;
  accountHolder: string;
  currency: string;
}

export interface Portfolio {
  id: string;
  name: string;
  type: string;
  currency: string;
  totalValue: number;
  unrealizedGainLoss: number;
  todayGainLoss: number;
  lastUpdated: string;
  riskTolerance: string;
  holdings: any[];
}

export interface SimulationResult {
  simulationId: string;
  narrativeSummary: string;
  keyImpacts: any[];
}

export interface CorporateAnomaly {
  id: string;
  description: string;
  details: string;
  severity: string;
  status: string;
  entityType: string;
  entityId: string;
  timestamp: string;
  riskScore: number;
  aiConfidenceScore: number;
  recommendedAction: string;
}

export interface ComplianceReport {
  auditId: string;
  status: string;
  auditDate: string;
  periodCovered: any;
  overallComplianceScore: number;
  summary: string;
  findings: any[];
  recommendedActions: any[];
}

export interface CashFlowForecast {
  forecastId: string;
  period: string;
  currency: string;
  overallStatus: string;
  projectedBalances: any[];
  inflowForecast: any;
  outflowForecast: any;
  liquidityRiskScore: number;
  aiRecommendations: any[];
}

export interface FraudRule {
  id: string;
  name: string;
}

export interface WebhookSubscription {
  id: string;
}

export interface APIKey {
  id: string;
  name: string;
}

export enum WeaverStage {
  Pitch = 'PITCH',
  Analysis = 'ANALYSIS',
  IdeaValidation = 'IDEA_VALIDATION',
  Test = 'TEST',
  Error = 'ERROR'
}

export interface AIPlan {
  id: string;
}

export interface AIQuestion {
  id: string;
  question: string;
}

export interface AIPlanStep {
  id: string;
}

export interface PaymentOrder {
  id: string;
  amount: number;
}

export interface Invoice {
  id: string;
  amount: number;
  status: string;
}

export interface ComplianceCase {
  id: string;
  status: string;
}

export interface PaginatedResponse<T> {
  data: T[];
  limit: number;
  offset: number;
  total: number;
}

export interface EIP6963ProviderDetail {
  info: {
    uuid: string;
    name: string;
    icon: string;
    rdns: string;
  };
  provider: any;
}

export interface EIP6963AnnounceProviderEvent extends Event {
  detail: EIP6963ProviderDetail;
}

export interface PersistedQueryManifest {
  format?: string;
  version: number;
  operations: Array<{
    id: string;
    name: string;
    type: string;
    body: string;
  }>;
}

export interface MarketMover {
  ticker: string;
  name: string;
  change: number;
  price: number;
}

export interface AuthorizedApp {
  id: string;
  name: string;
  description: string;
  status: 'active' | 'revoked';
  authorizedAt: string;
  scopes: string[];
}

export interface PaperNutsData {
  bibliography?: string;
  [key: string]: any;
}

export type SovereignAction = "explain" | "derive_proof" | "execute_simulation" | "trigger_banking_action" | "buy_house" | "file_tax_return";
export type AuditAction = "explain" | "derive_proof" | "execute_simulation" | "trigger_banking_action" | "buy_house" | "file_tax_return";
export type TableAction = "explain" | "derive_proof" | "execute_simulation" | "trigger_banking_action" | "buy_house" | "file_tax_return";
export type BankingAction = "explain" | "derive_proof" | "execute_simulation" | "trigger_banking_action" | "buy_house" | "file_tax_return";
export type Action = "explain" | "derive_proof" | "execute_simulation" | "trigger_banking_action" | "buy_house" | "file_tax_return";
export type AllowedActions = "explain" | "derive_proof" | "execute_simulation" | "trigger_banking_action" | "buy_house" | "file_tax_return";
export type TableActionType = "explain" | "derive_proof" | "execute_simulation" | "trigger_banking_action" | "buy_house" | "file_tax_return";

export interface GovernmentServicesTable {
  [key: string]: any;
}

export interface BankingTransaction {
  [key: string]: any;
}