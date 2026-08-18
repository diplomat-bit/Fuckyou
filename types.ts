import React, { ReactNode } from 'react';

export type UserProfile = User;

export interface ACHDetails {
  routingNumber: string;
  realAccountNumber: string;
}

export type PaymentRail = 'quantumpay' | 'cashapp' | 'swift_global' | 'blockchain_dlt' | 'fedwire' | 'rtp';

export enum View {
    Dashboard = 'dashboard',
    Transactions = 'transactions',
    SendMoney = 'send-money',
    Budgets = 'capital-allocation',
    FinancialGoals = 'strategic-goals',
    CreditHealth = 'credit-health',
    Personalization = 'personalization',
    Accounts = 'accounts-overview',
    Investments = 'investments',
    CryptoWeb3 = 'crypto-web3',
    AlgoTradingLab = 'algo-trading-lab',
    ForexArena = 'forex-arena',
    CommoditiesExchange = 'commodities-exchange',
    RealEstateEmpire = 'real-estate-empire',
    ArtCollectibles = 'art-collectibles',
    DerivativesDesk = 'derivatives-desk',
    VentureCapital = 'venture-capital',
    PrivateEquity = 'private-equity',
    TaxOptimization = 'tax-optimization',
    LegacyBuilder = 'legacy-builder',
    SovereignWealth = 'sovereign-wealth',
    QuantumAssets = 'quantum-assets',
    // Quantum Connect Core (Rebranded from Legacy)
    QuantumAccounts = 'quantum-accounts',
    QuantumAccountProxy = 'quantum-account-proxy',
    QuantumBillPay = 'quantum-bill-pay',
    QuantumCrossBorder = 'quantum-cross-border',
    QuantumPayeeManagement = 'quantum-payee-mgmt',
    QuantumStandingInstructions = 'quantum-standing-instructions',
    QuantumDeveloperTools = 'quantum-dev-tools',
    QuantumEligibility = 'quantum-eligibility',
    QuantumUnmaskedData = 'quantum-unmasked-data',
    // Plaid Nexus
    PlaidMainDashboard = 'plaid-main',
    DataNetwork = 'plaid-data-network',
    PlaidIdentity = 'plaid-identity',
    PlaidCRAMonitoring = 'plaid-cra-monitoring',
    PlaidInstitutions = 'plaid-institutions',
    PlaidItemManagement = 'plaid-item-mgmt',
    // Enterprise Operations
    CorporateCommand = 'corporate-command',
    ModernTreasury = 'modern-treasury',
    Treasury = 'treasury',
    CardPrograms = 'card-programs',
    Payments = 'payments',
    StripeNexus = 'stripe-nexus',
    CounterpartyDashboard = 'counterparty-dashboard',
    VirtualAccounts = 'virtual-accounts',
    CorporateActions = 'corporate-actions',
    CreditNoteLedger = 'credit-note-ledger',
    ReconciliationHub = 'reconciliation-hub',
    GEINDashboard = 'gein-dashboard',
    CardholderManagement = 'cardholder-mgmt',
    VentureCapitalDeskView = 'vc-desk-view',
    // System & Intelligence
    AIAdvisor = 'ai-advisor',
    AIInsights = 'ai-insights',
    QuantumWeaver = 'quantum-weaver',
    AgentMarketplace = 'agent-marketplace',
    AIAdStudio = 'ai-ad-studio',
    GlobalPositionMap = 'global-position-map',
    GlobalSsiHub = 'global-ssi-hub',
    SecurityCompliance = 'security-compliance',
    DeveloperHub = 'developer-hub',
    SchemaExplorer = 'schema-explorer',
    ResourceGraph = 'resource-graph',
    TheVision = 'the-vision',
    ApiPlayground = 'api-playground',
    ComplianceOracle = 'compliance-oracle',
    // Admin & Tools
    CustomerDashboard = 'customer-dashboard',
    VerificationReports = 'verification-reports',
    FinancialReporting = 'financial-reporting',
    StripeNexusDashboard = 'stripe-nexus-dashboard',
    // Component Registry
    AccountDetails = 'account-details',
    AccountList = 'account-list',
    AccountStatementGrid = 'account-statement-grid',
    AccountsView = 'accounts-view',
    AccountVerificationModal = 'account-verification-modal',
    ACHDetailsDisplay = 'ach-details-display',
    AICommandLog = 'ai-command-log',
    AIPredictionWidget = 'ai-prediction-widget',
    AssetCatalog = 'asset-catalog',
    AutomatedSweepRules = 'automated-sweep-rules',
    BalanceReportChart = 'balance-report-chart',
    BalanceTransactionTable = 'balance-transaction-table',
    CardDesignVisualizer = 'card-design-visualizer',
    ChargeDetailModal = 'charge-detail-modal',
    ChargeList = 'charge-list',
    ConductorConfigurationView = 'conductor-config',
    CounterpartyDetails = 'counterparty-details',
    CounterpartyForm = 'counterparty-form',
    DisruptionIndexMeter = 'disruption-index',
    DocumentUploader = 'document-uploader',
    DownloadLink = 'download-link',
    EarlyFraudWarningFeed = 'early-fraud-warning',
    ElectionChoiceForm = 'election-choice-form',
    EventNotificationCard = 'event-notification-card',
    ExpectedPaymentsTable = 'expected-payments',
    ExternalAccountCard = 'external-account-card',
    ExternalAccountForm = 'external-account-form',
    ExternalAccountsTable = 'external-accounts-table',
    FinancialAccountCard = 'financial-account-card',
    IncomingPaymentDetailList = 'incoming-payment-details',
    InvoiceFinancingRequest = 'invoice-financing-req',
    PaymentInitiationForm = 'payment-initiation-form',
    PaymentMethodDetails = 'payment-method-details',
    PaymentMethodBalance = 'payment-method-balance',
    PaymentOrderForm = 'payment-order-form',
    PayoutsDashboard = 'payouts-dashboard',
    PnLChart = 'pnl-chart',
    RefundForm = 'refund-form',
    RemittanceInfoEditor = 'remittance-info-editor',
    ReportingView = 'reporting-view',
    ReportRunGenerator = 'report-run-gen',
    ReportStatusIndicator = 'report-status-indicator',
    SsiEditorForm = 'ssi-editor-form',
    StripeNexusView = 'stripe-nexus-view',
    StripeStatusBadge = 'stripe-status-badge',
    StructuredPurposeInput = 'structured-purpose-input',
    SubscriptionList = 'subscription-list',
    TimeSeriesChart = 'time-series-chart',
    TradeConfirmationModal = 'trade-confirm-modal',
    TransactionFilter = 'transaction-filter',
    TransactionList = 'transaction-list',
    TreasuryTransactionList = 'treasury-txn-list',
    TreasuryView = 'treasury-view',
    UniversalObjectInspector = 'object-inspector',
    VirtualAccountForm = 'virtual-account-form',
    VirtualAccountsTable = 'virtual-accounts-table',
    VoiceControl = 'voice-control',
    WebhookSimulator = 'webhook-simulator',
    TheBook = 'the-book',
    KnowledgeBase = 'knowledge-base',
    Settings = 'settings',
    SSO = 'sso',
    ConciergeService = 'concierge-service',
    Philanthropy = 'philanthropy',
    OpenBanking = 'open-banking',
    FinancialDemocracy = 'financial-democracy',
    APIStatus = 'api-status',
    APIIntegration = 'api-integration',
    APIConsole = 'api-console',
    SecurityCenter = 'security-center',
    Security = 'security',
    AIStrategy = 'ai-strategy',
    Goals = 'financial-goals',
    Rewards = 'rewards',
    CardCustomization = 'card-customization',
}

export type UserRole = 'ADMIN' | 'TRADER' | 'CLIENT' | 'VISIONARY' | 'SYSTEM_ARCHITECT' | 'QUANT_ANALYST' | 'ETHICS_OFFICER' | 'DATA_SCIENTIST' | 'NETWORK_WEAVER' | 'FOUNDER' | 'INVESTOR';
export type SecurityLevel = 'STANDARD' | 'ELEVATED' | 'QUANTUM_ENCRYPTED' | 'ARCHITECT_LEVEL' | 'SOVEREIGN_CLEARED';

export interface User {
  id: string;
  name: string;
  email: string;
  roles?: UserRole[];
  securityLevel?: SecurityLevel;
  usdBalance?: number;
  avatarUrl?: string;
  title?: string;
  phone?: string;
  loyaltyTier?: string;
  fiatBalance?: number;
  cryptoBalance?: number;
  netWorth?: number;
  businessId?: string;
  bio?: string;
  isAdmin?: boolean;
}

export interface Transaction {
  id: string;
  type: 'income' | 'expense' | 'transfer' | 'credit' | 'debit';
  category: string;
  description: string;
  amount: number;
  date: string;
  currency?: string;
  metadata?: any;
  carbonFootprint?: number;
  aiCategoryConfidence?: number;
}

export interface PortfolioAsset {
  id: string;
  name: string;
  value: number;
  color: string;
  assetClass: string;
  performanceYTD?: number;
  riskLevel?: string;
  esgRating?: number;
}

export interface BudgetCategory {
  id: string;
  name: string;
  limit: number;
  spent: number;
  color: string;
  remaining: number;
  category: string;
  alerts: any[];
}

export interface FinancialGoal {
  id: string;
  name: string;
  targetAmount: number;
  currentAmount: number;
  targetDate: string;
  status: 'on_track' | 'needs_attention' | 'achieved' | 'behind';
  iconName?: string;
  startDate?: string;
}

export interface Notification {
  id: string;
  message: string;
  timestamp: string;
  read: boolean;
  severity: 'info' | 'warning' | 'error' | 'success';
  view?: View;
}

export interface APIStatus {
  provider: string;
  status: 'Operational' | 'Degraded Performance' | 'Partial Outage' | 'Maintenance' | 'Major Outage' | 'Unknown';
  responseTime: number;
}

export interface RewardItem {
  id: string;
  name: string;
  cost: number;
  type: string;
  description: string;
  iconName: string;
}

export interface RewardPoints {
  balance: number;
  lastEarned: number;
  currency: string;
  lastRedeemed?: number;
}

export interface CreditScore {
  score: number;
  change: number;
  rating: string;
}

export interface CreditFactor {
  name: string;
  status: 'Excellent' | 'Good' | 'Fair' | 'Poor';
  description: string;
}

export interface GitHubFile {
  name: string;
  path: string;
  type: 'file' | 'dir';
  download_url?: string;
  children?: GitHubFile[];
}

export interface SettlementInstruction {
    messageId: string;
    creationDateTime: string;
    numberOfTransactions: number;
    settlementDate: string;
    totalAmount: number;
    currency: string;
    purpose?: any;
}

export interface AuditLogEntry {
    id: string;
    timestamp: string;
    userId: string;
    action: string;
    targetResource: string;
    success: boolean;
    metadata?: any;
    ipAddress?: string;
}

export interface CorporateCard {
  id: string;
  holderName: string;
  cardNumberMask: string;
  status: string;
  frozen: boolean;
  controls: {
    atm: boolean;
    contactless: boolean;
    online: boolean;
    monthlyLimit: number;
  };
  biometricLockEnabled: boolean;
}

export interface CorporateTransaction {
  id: string;
  cardId: string;
  holderName: string;
  merchant: string;
  amount: number;
  status: string;
  timestamp: string;
  date: string;
  description: string;
}

export interface FraudRule {
  id: string;
  name: string;
  description?: string;
  severity: 'High' | 'Medium' | 'Low';
  isActive: boolean;
}

export interface ComplianceCase {
  id: string;
  reason: string;
  entityType: string;
  entityId: string;
  status: string;
  openedDate: string;
  type?: string;
  description?: string;
}

export interface AIInsight {
    id: string;
    type: string;
    severity: string;
    message: string;
    details: string;
    timestamp: string;
}

export interface VirtualAccount {
    id: string;
    name: string;
    accountNumber?: string;
    currency?: string;
    status?: string;
}

export interface Counterparty {
  id: string;
  name: string;
  type: string;
  riskLevel: string;
  createdDate: string;
  accounts: ExternalAccount[];
  virtualAccounts: any[];
}

export interface ExternalAccount {
  id: string;
  bankName: string;
  mask: string;
  balance: number;
  type: string;
  party_name: string;
  verification_status: string;
  account_details: any[];
  routing_details: any[];
}

export interface StripeBalance {
    available: { amount: number; currency: string }[];
    pending: { amount: number; currency: string }[];
}

export interface PlaidLinkSuccessMetadata {
    institution: {
        name: string;
        institution_id: string;
    };
    accounts: {
        id: string;
        name: string;
        mask: string;
        type: string;
        subtype: string;
    }[];
}

export interface Device {
    id: string;
    name: string;
    type: string;
    model: string;
    lastActivity: string;
    location: string;
    ip: string;
    isCurrent: boolean;
    permissions: string[];
    status: string;
    firstSeen: string;
    userAgent: string;
    pushNotificationsEnabled: boolean;
    biometricAuthEnabled: boolean;
    encryptionStatus: string;
}

export interface Business {
  id: string;
  owner_id: string;
  name: string;
  type: string;
  monthly_revenue: number;
  expenses: number;
  employees: string[];
  status: string;
  marketing_factor: number;
  businessPlan: string;
  valuation: number;
  cashBalance: number;
  hqLocation: string;
}