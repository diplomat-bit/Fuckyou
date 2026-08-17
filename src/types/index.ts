export enum View {
  FilesVault = 'files-vault',
  Dashboard = 'dashboard',
  DataIngest = 'data-ingest',
  PortalHub = 'portal-hub',
  BillingIdentity = 'billing-identity',
  LegionArchitect = 'legion-architect',
  LegionGhost = 'legion-ghost',
  LegionVisualizer = 'legion-visualizer',
  LegionVoice = 'legion-voice',
  LegionAuditor = 'legion-auditor',
  LegionLive = 'legion-live',
  IdentityCitadel = 'identity-citadel',
  RecoveryMesh = 'recovery-mesh',
  PrivacyGuardian = 'privacy-guardian',
  TrustRegistry = 'trust-registry',
  GlobalLedger = 'global-ledger',
  Transactions = 'transactions',
  SendMoney = 'send-money',
  Budgets = 'budgets',
  Goals = 'goals',
  WealthNexus = 'wealth-nexus',
  Investments = 'investments',
  Portfolio = 'portfolio',
  QuantumWeaver = 'quantum-weaver',
  Crypto = 'crypto',
  TradingBots = 'trading-bots',
  APIKeys = 'api-keys',
  PaymentMethods = 'payment-methods',
  TokenIssuance = 'token-issuance',
  MarketingAutomation = 'marketing-automation',
  InstitutionalHub = 'institutional-hub',
  IntelligenceHub = 'intelligence-hub',
  NeuralTools = 'neural-tools',
  NexusBuilder = 'nexus-builder',
  IntegrationsMarketplace = 'integrations-marketplace',
  Settings = 'settings',
  TheVision = 'the-vision',
  Rewards = 'rewards',
  CitiGateway = 'citi-gateway',
  CitiConnectInitiation = 'citi-connect-initiation',
  CitiConnectInquiry = 'citi-connect-inquiry',
  CitiConnectNotifications = 'citi-connect-notifications',
  CitiTreasury = 'citi-treasury',
  FapiPipeline = 'fapi-pipeline',
  SovereignOrgHandshake = 'sovereign-org-handshake',
  AzureApps = 'azure-apps',
  WorkspaceNexus = 'workspace-nexus',
  GcpInventory = 'gcp-inventory',
  CryptoVerifier = 'crypto-verifier',
  FloridaVoter = 'florida-voter',
  SovereignIntelligence = 'sovereign-intelligence',
  CitiPartnerHub = 'citi-partner-hub',
  CitiUkInternationalPayments = 'citi-uk-international-payments',
  AstraDBQuickstart = 'astra-db-quickstart',
  UniverseGraph = 'universe-graph',
  ImpeachmentGenerator = 'impeachment-generator',
  ContractorLobbying = 'contractor-lobbying',
  SentryEngine = 'sentry-engine',
  AriaComms = 'aria-comms',
  ModernTreasuryLedger = 'modern-treasury-ledger',
  AlpacaBroker = 'alpaca-broker',
  AlpacaTqqq = 'alpaca-tqqq',
  AlpacaAccounts = 'alpaca-accounts',
  AlpacaTrading = 'alpaca-trading',
  AlpacaFunding = 'alpaca-funding',
  AlpacaJournals = 'alpaca-journals',
  AlpacaRebalancing = 'alpaca-rebalancing',
  AlpacaTokenization = 'alpaca-tokenization',
  AlpacaIpoMarketplace = 'alpaca-ipo-marketplace',
  AlpacaCryptoWallets = 'alpaca-crypto-wallets',
  AlpacaReporting = 'alpaca-reporting',
  PlaidAlpacaBridge = 'plaid-alpaca-bridge'
}

export enum AppView {
  Dashboard = 'dashboard',
  SovereignIntelligence = 'sovereign-intelligence',
  LegionArchitect = 'legion-architect',
  LegionGhost = 'legion-ghost',
  LegionVisualizer = 'legion-visualizer',
  LegionVoice = 'legion-voice',
  LegionAuditor = 'legion-auditor',
  LegionLive = 'legion-live',
  IdentityCitadel = 'identity-citadel',
  RecoveryMesh = 'recovery-mesh',
  PrivacyGuardian = 'privacy-guardian',
  TrustRegistry = 'trust-registry',
  GlobalLedger = 'global-ledger',
  WealthNexus = 'wealth-nexus',
  TokenIssuance = 'token-issuance',
  MarketingAutomation = 'marketing-automation',
  InstitutionalHub = 'institutional-hub',
  IntelligenceHub = 'intelligence-hub',
  NeuralTools = 'neural-tools',
  NexusBuilder = 'nexus-builder',
  IntegrationsMarketplace = 'integrations-marketplace',
  Settings = 'settings',
  TheVision = 'the-vision',
  Rewards = 'rewards',
  CitiGateway = 'citi-gateway',
  AlpacaBroker = 'alpaca-broker',
  PlaidAlpacaBridge = 'plaid-alpaca-bridge'
}

// ==========================================
// Mastercard Developers Agent Toolkit (MCP)
// ==========================================

export interface MastercardService {
  id: string;
  title: string;
  description: string;
  category?: string;
  documentationUrl?: string;
  sandboxAvailable?: boolean;
}

export interface MastercardDocSection {
  id: string;
  title: string;
  description?: string;
  navigationLink?: string;
  order: number;
}

export interface MastercardDocumentationOverview {
  serviceId: string;
  title: string;
  description: string;
  sections: MastercardDocSection[];
}

export interface MastercardDocPage {
  id: string;
  serviceId: string;
  sectionId: string;
  title: string;
  content: string;
  lastUpdated?: string;
}

export interface MastercardIntegrationGuide {
  type: 'oauth10a' | 'oauth20' | 'openfinance';
  title: string;
  version: string;
  steps: {
    stepNumber: number;
    title: string;
    description: string;
    codeSnippet?: string;
    language?: string;
  }[];
  securityRequirements: string[];
}

export interface MastercardApiParameter {
  name: string;
  in: 'path' | 'query' | 'header' | 'body';
  required: boolean;
  type: string;
  description?: string;
  example?: any;
}

export interface MastercardApiOperation {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH' | 'OPTIONS' | 'HEAD';
  path: string;
  title: string;
  description: string;
  operationId?: string;
}

export interface MastercardApiOperationDetails extends MastercardApiOperation {
  parameters: MastercardApiParameter[];
  requestSchema?: any;
  responseSchemas?: Record<string, any>;
  security?: Record<string, string[]>[];
}

// ==========================================
// Finicity (Mastercard Open Finance) Types
// ==========================================

export interface FinicityAccount {
  id: string;
  number: string;
  accountNumberDisplay: string;
  realAccountNumberLast4?: string;
  name: string;
  balance: number;
  type:
    | 'checking'
    | 'savings'
    | 'moneyMarket'
    | 'cd'
    | 'investment'
    | 'investmentTaxDeferred'
    | 'employeeStockPurchasePlan'
    | 'ira'
    | '401k'
    | '403b'
    | '529'
    | 'rollover'
    | 'ugma'
    | 'utma'
    | 'keogh'
    | '457'
    | '401a'
    | 'mortgage'
    | 'loan'
    | 'creditCard'
    | 'lineOfCredit'
    | 'payroll'
    | 'studentLoan'
    | 'brokerageAccount'
    | 'educationSavings'
    | 'healthSavingsAccount'
    | 'nonTaxableBrokerageAccount'
    | 'pension'
    | 'profitSharingPlan'
    | 'roth401k'
    | 'sepIra'
    | 'simpleIra'
    | 'thriftSavingsPlan'
    | 'variableAnnuity'
    | string;
  aggregationStatusCode: number;
  status: 'active' | 'pending' | 'error' | string;
  customerId: string;
  institutionId: string;
  balanceDate: number;
  aggregationSuccessDate?: number;
  aggregationAttemptDate?: number;
  createdDate: number;
  lastUpdatedDate?: number;
  marketSegment?: 'personal' | 'business' | string;
  currency: string;
  lastTransactionDate?: number;
  oldestTransactionDate?: number;
  institutionLoginId: number;
  authorizationStartDate?: number;
  authorizationEndDate?: number;
}

export interface FinicityTransaction {
  id: string;
  amount: number;
  postedDate: number;
  transactionDate?: number;
  description: string;
  memo?: string;
  normalizedDescription?: string;
  category?: string;
  type?: 'debit' | 'credit' | string;
  status: 'pending' | 'active' | string;
  accountId: string;
  customerId: string;
  createdDate: number;
  bestRepresentation?: string;
  categorization?: {
    normalizedPayeeName?: string;
    category?: string;
    subCategory?: string;
  };
}

// ==========================================
// Sovereign Dashboard Core Types
// ==========================================

export interface Tab {
  id: string;
  name: string;
}

export interface AppState {
  openTabs: Tab[];
  activeTab: string | null;
  isSidebarOpen: boolean;
  systemStatus: 'initializing' | 'ready' | 'error';
  bypassAuth: boolean;
  isDataLoaded: boolean;
}

export type AppAction =
  | { type: 'OPEN_TAB'; payload: Tab }
  | { type: 'CLOSE_TAB'; payload: string }
  | { type: 'SET_ACTIVE_TAB'; payload: string | null }
  | { type: 'TOGGLE_SIDEBAR' }
  | { type: 'SET_SIDEBAR'; payload: boolean }
  | { type: 'SET_SYSTEM_STATUS'; payload: AppState['systemStatus'] }
  | { type: 'SET_BYPASS_AUTH'; payload: boolean }
  | { type: 'SET_DATA_LOADED'; payload: boolean };

export interface User {
  uid: string;
  email: string | null;
  displayName: string | null;
  photoURL: string | null;
  role?: string;
  mfaEnabled?: boolean;
}

export interface SovereignFile {
  id: string;
  name: string;
  size: number;
  type: string;
  encrypted: boolean;
  hash: string;
  createdAt: string;
  ownerId: string;
  tags?: string[];
}

// ==========================================
// Financial & Trading Types (Alpaca, Plaid, Stripe, Modern Treasury, Citi)
// ==========================================

export interface AlpacaAccount {
  id: string;
  accountNumber: string;
  status: string;
  currency: string;
  cash: number;
  portfolioValue: number;
  buyingPower: number;
  equity: number;
  longMarketValue: number;
  shortMarketValue: number;
  initialMargin: number;
  maintenanceMargin: number;
  lastMaintenanceMargin: number;
  daytradingBuyingPower: number;
  regtBuyingPower: number;
}

export interface AlpacaOrder {
  id: string;
  clientOrderId: string;
  symbol: string;
  qty: number;
  side: 'buy' | 'sell';
  type: 'market' | 'limit' | 'stop' | 'stop_limit';
  timeInForce: 'day' | 'gtc' | 'opg' | 'cls' | 'ioc' | 'fok';
  status: string;
  filledQty: number;
  filledAvgPrice?: number;
  limitPrice?: number;
  stopPrice?: number;
  createdAt: string;
}

export interface PlaidLinkToken {
  token: string;
  expiration: string;
}

export interface StripeTreasuryFinancialAccount {
  id: string;
  object: 'treasury.financial_account';
  balances: {
    cash: Record<string, number>;
    inbound_transfers: Record<string, number>;
    outbound_transfers: Record<string, number>;
  };
  supported_currencies: string[];
  status: 'open' | 'closed' | 'restricted';
}

export interface ModernTreasuryLedger {
  id: string;
  name: string;
  description?: string;
  currency: string;
  createdAt: string;
}

export interface CitiPaymentInitiation {
  paymentId: string;
  debtorAccountId: string;
  creditorAccountId: string;
  amount: number;
  currency: string;
  status: 'Initiated' | 'Pending' | 'Completed' | 'Failed';
  chargeBearer: string;
  clearingSystemMemberId?: string;
}

// ==========================================
// Security & Identity Types
// ==========================================

export interface JweJwsPayload {
  protectedHeader: Record<string, any>;
  unprotectedHeader?: Record<string, any>;
  payload: string;
  signature?: string;
  recipients?: any[];
}

export interface SovereignHandshake {
  handshakeId: string;
  initiatorOrgId: string;
  targetOrgId: string;
  status: 'Proposed' | 'Accepted' | 'Rejected' | 'Revoked';
  publicKey: string;
  timestamp: number;
  signature: string;
}