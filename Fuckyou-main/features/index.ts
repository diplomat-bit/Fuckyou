import { ALL_FEATURES } from '../constants';

export interface Feature {
    id: string;
    name: string;
    icon?: any;
    category: string;
    description?: string;
}

// --- Core Data Structures and Types ---

export interface ExtendedFeature extends Feature {
    description: string;
    tags: string[];
    version: string;
    maturity: 'beta' | 'stable' | 'deprecated' | 'experimental';
    securityLevel: 'low' | 'medium' | 'high' | 'critical';
    costModel: 'free' | 'tier1' | 'tier2' | 'premium' | 'custom';
    requiredServices: string[];
    aiCapabilities?: {
        generative?: boolean;
        analytical?: boolean;
        predictive?: boolean;
        nlp?: boolean;
    };
    complianceStandards: string[];
    lastUpdated: string;
    developerContact: string;
    documentationUrl: string;
    usageMetrics?: {
        dailyActiveUsers: number;
        apiCallsPerDay: number;
    };
    associatedRisks?: string[];
    releaseNotes?: string;
    roadmapStatus?: 'planned' | 'in-development' | 'released' | 'on-hold';
}

export interface ExternalServiceDefinition {
    id: string;
    name: string;
    description: string;
    type: 'AI' | 'DataStorage' | 'Auth' | 'Messaging' | 'PaymentGateway' | 'Compute' | 'Monitoring' | 'Analytics' | 'Security' | 'Blockchain' | 'API_Gateway' | 'CDN' | 'CRM' | 'ERP' | 'IoT' | 'DevOps' | 'Search' | 'Notification' | 'Compliance' | 'Reporting' | 'Banking' | 'Sovereign' | 'RealEstate';
    endpoint: string;
    apiKeyEnvVar: string;
    status: 'operational' | 'degraded' | 'maintenance';
    slaLevel: 'basic' | 'standard' | 'premium';
    costPerUnit?: string;
    vendor: string;
    integrationGuideUrl?: string;
    privacyPolicyUrl?: string;
    securityCertifications?: string[];
    geoAvailability: string[];
    dependencies?: string[];
}

export interface SystemModuleMetadata {
    id: string;
    name: string;
    category: 'api' | 'components' | 'services' | 'trillionaire-status' | 'server' | 'government' | 'tax-liens' | 'real-estate' | 'bridges' | 'alpaca';
    path: string;
    description: string;
}

// --- Extended External Services Registry ---

export const REGISTERED_SERVICES: ExternalServiceDefinition[] = [
    {
        id: 'alpaca-broker-api',
        name: 'Alpaca Brokerage & Trading API',
        description: 'Securities trading, crypto wallets, fractional shares, funding, and portfolio rebalancing.',
        type: 'Banking',
        endpoint: 'https://broker-api.alpaca.markets/v2',
        apiKeyEnvVar: 'ALPACA_BROKER_API_KEY',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: '$0.00/trade',
        vendor: 'Alpaca',
        integrationGuideUrl: 'https://alpaca.markets/docs',
        privacyPolicyUrl: 'https://alpaca.markets/privacy',
        securityCertifications: ['FINRA', 'SIPC', 'SOC2 Type II'],
        geoAvailability: ['US', 'GLOBAL'],
        dependencies: []
    },
    {
        id: 'citi-connect-api',
        name: 'CitiConnect Treasury Gateway',
        description: 'Global institutional payments, treasury ledger, decryption utility, and UK international payments.',
        type: 'Banking',
        endpoint: 'https://api.citiconnect.citi.com/v1',
        apiKeyEnvVar: 'CITI_CONNECT_CLIENT_SECRET',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: '$0.10/trans',
        vendor: 'Citigroup',
        integrationGuideUrl: 'https://developer.citi.com',
        privacyPolicyUrl: 'https://citi.com/privacy',
        securityCertifications: ['PCI-DSS', 'ISO 27001', 'SOC1'],
        geoAvailability: ['GLOBAL'],
        dependencies: []
    },
    {
        id: 'modern-treasury-api',
        name: 'Modern Treasury Ledger Hub',
        description: 'Bank payment orchestration, real-time ledger sync, tax lien escrow, and programmatic money movement.',
        type: 'Banking',
        endpoint: 'https://app.moderntreasury.com/api',
        apiKeyEnvVar: 'MODERN_TREASURY_API_KEY',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: '$0.05/trans',
        vendor: 'Modern Treasury',
        integrationGuideUrl: 'https://docs.moderntreasury.com',
        privacyPolicyUrl: 'https://moderntreasury.com/privacy',
        securityCertifications: ['SOC2 Type II', 'ISO 27001'],
        geoAvailability: ['US', 'EU'],
        dependencies: []
    },
    {
        id: 'astra-db-vector-api',
        name: 'AstraDB Vector Database & AI Engine',
        description: 'DataStax Astra DB hybrid vector search, neural memory index, and fortune 500 research plan embeddings.',
        type: 'DataStorage',
        endpoint: 'https://astra.datastax.com/api/rest',
        apiKeyEnvVar: 'ASTRA_DB_APPLICATION_TOKEN',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: '$0.001/query',
        vendor: 'DataStax',
        integrationGuideUrl: 'https://docs.datastax.com',
        privacyPolicyUrl: 'https://datastax.com/privacy',
        securityCertifications: ['SOC2', 'HIPAA', 'ISO 27001'],
        geoAvailability: ['GLOBAL'],
        dependencies: []
    },
    {
        id: 'azure-gov-compliance-api',
        name: 'Azure Government & Sovereign Sentry',
        description: 'FedRAMP High compliance monitoring, defender ATP security, and Entra ID swarm orchestration.',
        type: 'Security',
        endpoint: 'https://management.usgovcloudapi.net',
        apiKeyEnvVar: 'AZURE_GOV_CLIENT_SECRET',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: 'Subscription',
        vendor: 'Microsoft Azure',
        integrationGuideUrl: 'https://docs.microsoft.com/azure/gov',
        privacyPolicyUrl: 'https://privacy.microsoft.com',
        securityCertifications: ['FedRAMP High', 'DoD IL5', 'CJIS'],
        geoAvailability: ['US-GOV'],
        dependencies: []
    },
    {
        id: 'google-gemini-live-api',
        name: 'Gemini Multimodal Live Agent Suite',
        description: 'Aria Comms, live voice portal, autonomous ad studio, and real-time market sentiment intelligence.',
        type: 'AI',
        endpoint: 'https://generativelanguage.googleapis.com/v1beta',
        apiKeyEnvVar: 'GEMINI_API_KEY',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: '$0.00025/1k tokens',
        vendor: 'Google Cloud',
        integrationGuideUrl: 'https://ai.google.dev/docs',
        privacyPolicyUrl: 'https://policies.google.com/privacy',
        securityCertifications: ['ISO 27001', 'SOC2'],
        geoAvailability: ['GLOBAL'],
        dependencies: []
    },
    {
        id: 'stripe-treasury-bridge',
        name: 'Stripe Financial Connections & Treasury Bridge',
        description: 'Merchant processing, card customization, automated balance transfers, and Alpaca liquidity bridges.',
        type: 'PaymentGateway',
        endpoint: 'https://api.stripe.com/v1',
        apiKeyEnvVar: 'STRIPE_SECRET_KEY',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: '2.9% + 30c',
        vendor: 'Stripe',
        integrationGuideUrl: 'https://stripe.com/docs',
        privacyPolicyUrl: 'https://stripe.com/privacy',
        securityCertifications: ['PCI Service Provider Level 1'],
        geoAvailability: ['GLOBAL'],
        dependencies: []
    },
    {
        id: 'plaid-open-banking-api',
        name: 'Plaid Open Banking FAPI Engine',
        description: 'Financial account linking, balance inquiry, auth verification, and OFX statement ingestion.',
        type: 'Banking',
        endpoint: 'https://production.plaid.com',
        apiKeyEnvVar: 'PLAID_SECRET',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: '$0.30/link',
        vendor: 'Plaid',
        integrationGuideUrl: 'https://plaid.com/docs',
        privacyPolicyUrl: 'https://plaid.com/privacy',
        securityCertifications: ['SOC2 Type II', 'ISO 27001'],
        geoAvailability: ['US', 'CA', 'UK', 'EU'],
        dependencies: []
    },
    {
        id: 'griffin-mcp-server',
        name: 'Griffin Model Context Protocol Server',
        description: 'Model Context Protocol (MCP) server for secure context sharing and tool execution.',
        type: 'AI',
        endpoint: 'http://localhost:3001/mcp',
        apiKeyEnvVar: 'GRIFFIN_MCP_API_KEY',
        status: 'operational',
        slaLevel: 'premium',
        costPerUnit: 'Free',
        vendor: 'Griffin',
        geoAvailability: ['GLOBAL'],
        dependencies: []
    }
];

const generateSimulatedServices = (count: number): ExternalServiceDefinition[] => {
    const services: ExternalServiceDefinition[] = [...REGISTERED_SERVICES];
    const serviceTypes: ExternalServiceDefinition['type'][] = [
        'AI', 'DataStorage', 'Auth', 'Messaging', 'PaymentGateway', 'Compute', 'Monitoring',
        'Analytics', 'Security', 'Blockchain', 'API_Gateway', 'CDN', 'CRM', 'ERP', 'IoT',
        'DevOps', 'Search', 'Notification', 'Compliance', 'Reporting', 'Banking', 'Sovereign', 'RealEstate'
    ];
    const vendors = ['SovereignInternal', 'AWS', 'GoogleCloud', 'MicrosoftAzure', 'Stripe', 'Twilio', 'Plaid', 'OpenAI', 'GoogleAI', 'IBM', 'Datastax', 'Alpaca', 'Citigroup'];
    
    for (let i = services.length + 1; i <= count; i++) {
        const type = serviceTypes[Math.floor(Math.random() * serviceTypes.length)];
        const vendor = vendors[Math.floor(Math.random() * vendors.length)];
        const serviceId = `${type.toLowerCase().replace(/ /g, '-')}-${vendor.toLowerCase().replace(/ /g, '-')}-${i.toString().padStart(4, '0')}`;
        services.push({
            id: serviceId,
            name: `${vendor} ${type} Service ${i}`,
            description: `A highly scalable ${type} service provided by ${vendor} for enterprise sovereign systems.`,
            type: type,
            endpoint: `https://api.${vendor.toLowerCase().replace(/ /g, '')}.${type.toLowerCase().replace(/ /g, '-')}.com/v1`,
            apiKeyEnvVar: `${vendor.toUpperCase()}_${type.toUpperCase()}_API_KEY`,
            status: Math.random() < 0.95 ? 'operational' : 'degraded',
            slaLevel: 'standard',
            costPerUnit: '$0.01/req',
            vendor: vendor,
            integrationGuideUrl: `https://docs.example.com`,
            privacyPolicyUrl: `https://privacy.example.com`,
            securityCertifications: ['ISO 27001', 'SOC2'],
            geoAvailability: ['US-EAST-1', 'GLOBAL'],
            dependencies: [],
        });
    }
    return services;
};

export const GLOBAL_EXTERNAL_SERVICES = generateSimulatedServices(100);

// --- Feature Generation ---

const generateMassiveFeatureSet = (baseFeatures: Feature[], additionalCount: number): ExtendedFeature[] => {
    return baseFeatures.map((f, index) => ({
        id: f.id,
        name: f.name,
        icon: f.icon,
        category: f.category,
        description: f.description || "Advanced financial & sovereign intelligence feature.",
        tags: ['finance', 'core', 'sovereign', 'oko-main'],
        version: "2.5.0",
        maturity: 'stable' as const,
        securityLevel: 'high' as const,
        costModel: 'tier1' as const,
        requiredServices: ['alpaca-broker-api', 'citi-connect-api', 'modern-treasury-api'],
        complianceStandards: ['PCI-DSS', 'SOC2', 'FedRAMP-High'],
        lastUpdated: new Date().toISOString(),
        developerContact: "sovereign-dev@oko.internal",
        documentationUrl: "#",
        usageMetrics: { dailyActiveUsers: 15000, apiCallsPerDay: 850000 }
    }));
};

export const GLOBAL_ALL_EXTENDED_FEATURES = generateMassiveFeatureSet(ALL_FEATURES || [], 50);

export const FEATURES_MAP = new Map<string, ExtendedFeature>();
GLOBAL_ALL_EXTENDED_FEATURES.forEach(f => {
    FEATURES_MAP.set(f.id, f);
});

// --- System Directory Manifest & Feature Mapping ---

export const OKO_SYSTEM_MODULES: SystemModuleMetadata[] = [
    // Sub-components: Alpaca Suite
    { id: 'alpaca-accounts', name: 'Alpaca Accounts Manager', category: 'alpaca', path: 'components/alpaca/AlpacaAccountsManager.tsx', description: 'Institutional brokerage account creation and clearing management.' },
    { id: 'alpaca-crypto-wallets', name: 'Alpaca Crypto Wallets', category: 'alpaca', path: 'components/alpaca/AlpacaCryptoWalletsView.tsx', description: 'Digital asset custody and crypto wallet orchestration.' },
    { id: 'alpaca-funding-hub', name: 'Alpaca Funding Hub', category: 'alpaca', path: 'components/alpaca/AlpacaFundingHub.tsx', description: 'ACH, wire transfers, and instantaneous funding conduits.' },
    { id: 'alpaca-ipo-marketplace', name: 'Alpaca IPO Marketplace', category: 'alpaca', path: 'components/alpaca/AlpacaIpoMarketplaceView.tsx', description: 'Primary market offering access and IPO allocations.' },
    { id: 'alpaca-journals', name: 'Alpaca Journals View', category: 'alpaca', path: 'components/alpaca/AlpacaJournalsView.tsx', description: 'Journal entries between internal ledger sub-accounts.' },
    { id: 'alpaca-rebalancing', name: 'Alpaca Rebalancing Terminal', category: 'alpaca', path: 'components/alpaca/AlpacaRebalancingView.tsx', description: 'Automated target weight allocation and model rebalancing.' },
    { id: 'alpaca-reporting', name: 'Alpaca Reporting View', category: 'alpaca', path: 'components/alpaca/AlpacaReportingView.tsx', description: 'Tax reports, monthly statements, and execution audits.' },
    { id: 'alpaca-tokenization', name: 'Alpaca Tokenization View', category: 'alpaca', path: 'components/alpaca/AlpacaTokenizationView.tsx', description: 'Asset tokenization into fractional digital share registers.' },
    { id: 'alpaca-trading-terminal', name: 'Alpaca Trading Terminal', category: 'alpaca', path: 'components/alpaca/AlpacaTradingTerminal.tsx', description: 'Real-time level 2 market data, orders, and algorithmic execution.' },
    { id: 'btc-swing-notebook', name: 'BTC Swing Trading Notebook', category: 'alpaca', path: 'components/alpaca/BtcSwingTradingNotebook.tsx', description: 'Quantitative crypto swing trading models and Jupyter notebook integration.' },
    { id: 'tqqq-algo-terminal', name: 'TQQQ Algorithm Terminal', category: 'alpaca', path: 'components/alpaca/TqqqAlgorithmTerminal.tsx', description: '3x leveraged Nasdaq algorithmic volatility harvesting strategies.' },

    // Sub-components: Integration Bridges
    { id: 'citi-alpaca-bridge', name: 'Citi-Alpaca Bridge View', category: 'bridges', path: 'components/bridges/CitiAlpacaBridgeView.tsx', description: 'Interbank settlement bridge linking Citi Treasury with Alpaca clearing.' },
    { id: 'plaid-alpaca-bridge', name: 'Plaid-Alpaca Bridge View', category: 'bridges', path: 'components/bridges/PlaidAlpacaBridgeView.tsx', description: 'Direct bank account verification and instant ACH deposit linking.' },
    { id: 'real-estate-alpaca-bridge', name: 'Real Estate-Alpaca Bridge', category: 'bridges', path: 'components/bridges/RealEstateAlpacaBridge.tsx', description: 'Collateralization of commercial property deeds into equity trading leverage.' },
    { id: 'sovereign-market-takeover', name: 'Sovereign Market Takeover Dashboard', category: 'bridges', path: 'components/bridges/SovereignMarketTakeoverDashboard.tsx', description: 'Strategic macro capital deployment and takeover liquidity suite.' },
    { id: 'stripe-alpaca-bridge', name: 'Stripe-Alpaca Bridge View', category: 'bridges', path: 'components/bridges/StripeAlpacaBridgeView.tsx', description: 'Direct merchant payment sweep into yield-bearing brokerage sweep accounts.' },
    { id: 'tax-lien-modern-treasury-bridge', name: 'Tax Lien Modern Treasury Bridge', category: 'bridges', path: 'components/bridges/TaxLienModernTreasuryBridge.tsx', description: 'Automated municipal tax certificate bidding and escrow clearing.' },

    // Sub-components: Government & Municipal APIs
    { id: 'gis-property-map', name: 'GIS Property Map', category: 'government', path: 'components/government/GisPropertyMap.tsx', description: 'Geospatial satellite layers, zoning maps, and property parcel boundary visualizer.' },
    { id: 'government-api-dashboard', name: 'Government API Dashboard', category: 'government', path: 'components/government/GovernmentApiDashboard.tsx', description: 'Federal procurement, SAM.gov awards, and legislative tracking hub.' },
    { id: 'irs-tax-filing', name: 'IRS Tax Filing Suite', category: 'government', path: 'components/government/IrsTaxFiling.tsx', description: 'Automated corporate tax filing and IRS gateway e-file integration.' },
    { id: 'sec-filing-viewer', name: 'SEC Filing Viewer', category: 'government', path: 'components/government/SecFilingViewer.tsx', description: 'Real-time EDGAR 10-K, 10-Q, 8-K, and Form 4 insider transaction analyzer.' },

    // Sub-components: Real Estate Infrastructure
    { id: 'deed-registrar', name: 'Deed Registrar', category: 'real-estate', path: 'components/real-estate/DeedRegistrar.tsx', description: 'On-chain land deed title recording and zero-knowledge transfer verifier.' },
    { id: 'escrow-manager', name: 'Escrow Manager', category: 'real-estate', path: 'components/real-estate/EscrowManager.tsx', description: 'Multi-party property escrow and conditional smart contract releases.' },
    { id: 'property-marketplace', name: 'Property Marketplace', category: 'real-estate', path: 'components/real-estate/PropertyMarketplace.tsx', description: 'Fractionalized real estate token secondary trading exchange.' },

    // Sub-components: Tax Liens
    { id: 'foreclosure-tracker', name: 'Foreclosure Tracker', category: 'tax-liens', path: 'components/tax-liens/ForeclosureTracker.tsx', description: 'Municipal property default timelines and foreclosure auction monitoring.' },
    { id: 'tax-lien-auctions', name: 'Tax Lien Auctions', category: 'tax-liens', path: 'components/tax-liens/TaxLienAuctions.tsx', description: 'Live bidding engine for county tax certificates and high-yield tax liens.' },

    // System Modules: Trillionaire Status Research Framework
    { id: 'capital-allocation-models', name: 'Capital Allocation Models', category: 'trillionaire-status', path: 'trillionaire-status/CapitalAllocationModels.ts', description: 'Multi-trillion dollar capital deployment algorithms and hurdle-rate calculators.' },
    { id: 'competitor-intelligence', name: 'Competitor Intelligence', category: 'trillionaire-status', path: 'trillionaire-status/CompetitorIntelligence.ts', description: 'Global corporate entity profiling and strategic positioning matrix.' },
    { id: 'global-tax-strategy', name: 'Global Tax Strategy Engine', category: 'trillionaire-status', path: 'trillionaire-status/GlobalTaxStrategy.ts', description: 'Cross-border international tax optimization and treaty analysis.' },
    { id: 'mergers-and-acquisitions', name: 'M&A Intelligence Engine', category: 'trillionaire-status', path: 'trillionaire-status/MergersAndAcquisitions.ts', description: 'Target acquisition valuation models and hostile takeover execution blueprints.' },

    // Newly Integrated Modules to make them all work together
    { id: 'griffin-mcp', name: 'Griffin MCP Server', category: 'services', path: 'components/GriffinMcpView.tsx', description: 'Griffin Model Context Protocol (MCP) server interface for secure context sharing.' },
    { id: 'flow-controller', name: 'Flow Controller', category: 'services', path: 'components/FlowController.tsx', description: 'Flow Controller for managing automated transaction pipelines.' },
    { id: 'growth-nexus', name: 'Growth Nexus Core', category: 'services', path: 'components/GrowthNexus.tsx', description: 'Growth Nexus core engine for marketing and user acquisition.' },
    { id: 'azure-apps', name: 'Azure Directory', category: 'government', path: 'components/AzureAppsView.tsx', description: 'Azure Directory and enterprise application management.' },
    { id: 'gcp-inventory', name: 'Cloud Infrastructure', category: 'services', path: 'components/GcpInventoryView.tsx', description: 'GCP Cloud Infrastructure inventory and resource tracking.' },
    { id: 'florida-voter', name: 'Florida 2026 Voter Registry', category: 'government', path: 'components/FloridaVoterView.tsx', description: 'Florida 2026 Voter Registry and election integrity dashboard.' },
    { id: 'sovereign-intelligence', name: 'Sovereign Intelligence', category: 'services', path: 'components/SovereignIntelligenceView.tsx', description: 'Sovereign Intelligence and geopolitical risk analysis.' },
    { id: 'citi-uk-payments', name: 'Citi UK International Payments', category: 'bridges', path: 'components/CitiUkInternationalPayments.tsx', description: 'Citi UK International Payments PISP gateway.' },
    { id: 'fapi-pipeline', name: 'FAPI 2.0 Security Pipeline', category: 'services', path: 'components/OpenBankingFapiView.tsx', description: 'FAPI 2.0 Security Pipeline and Open Banking compliance.' },
    { id: 'astra-db-quickstart', name: 'Astra DB Quickstart', category: 'services', path: 'components/AstraDBQuickstart.tsx', description: 'Astra DB Quickstart and vector search integration.' },
    { id: 'universe-graph', name: 'Universe Graph 3D', category: 'services', path: 'components/UniverseGraphVisualizer.tsx', description: 'Universe Graph 3D network topology visualizer.' },
    { id: 'impeachment-generator', name: 'Impeachment Generator', category: 'government', path: 'components/ImpeachmentGenerator.tsx', description: 'Impeachment Generator and legislative audit tool.' },
    { id: 'contractor-lobbying', name: 'Contractor Lobbying ROI', category: 'government', path: 'components/ContractorLobbyingList.tsx', description: 'Contractor Lobbying ROI and federal procurement tracker.' },
    { id: 'sentry-engine', name: 'ISO20022 Sentry Engine', category: 'services', path: 'components/SovereignSentryEngine.tsx', description: 'ISO20022 Sentry Engine and real-time transaction monitoring.' },
    { id: 'aria-comms', name: 'Aria Neural Comms', category: 'services', path: 'components/AriaComms.tsx', description: 'Aria Neural Comms and live voice portal.' },
    { id: 'modern-treasury-ledger', name: 'Modern Treasury Ledger', category: 'bridges', path: 'components/ModernTreasuryLedgerHub.tsx', description: 'Modern Treasury Ledger Hub and programmatic money movement.' },

    // All other components from the directory tree
    { id: 'ai-ad-studio', name: 'AI Ad Studio View', category: 'components', path: 'components/AIAdStudioView.tsx', description: 'AI Ad Studio View' },
    { id: 'ai-advisor', name: 'AI Advisor View', category: 'components', path: 'components/AIAdvisorView.tsx', description: 'AI Advisor View' },
    { id: 'ai-insights', name: 'AI Insights', category: 'components', path: 'components/AIInsights.tsx', description: 'AI Insights' },
    { id: 'api-integration', name: 'API Integration View', category: 'components', path: 'components/APIIntegrationView.tsx', description: 'API Integration View' },
    { id: 'api-keys', name: 'API Keys View', category: 'components', path: 'components/APIKeysView.tsx', description: 'API Keys View' },
    { id: 'administration-audit', name: 'Administration Audit', category: 'components', path: 'components/AdministrationAudit.tsx', description: 'Administration Audit' },
    { id: 'alpaca-broker', name: 'Alpaca Broker View', category: 'components', path: 'components/AlpacaBrokerView.tsx', description: 'Alpaca Broker View' },
    { id: 'aquarius-architect', name: 'Aquarius Architect View', category: 'components', path: 'components/AquariusArchitectView.tsx', description: 'Aquarius Architect View' },
    { id: 'aquarius-auditor', name: 'Aquarius Auditor View', category: 'components', path: 'components/AquariusAuditorView.tsx', description: 'Aquarius Auditor View' },
    { id: 'aquarius-creative-suite', name: 'Aquarius Creative Suite', category: 'components', path: 'components/AquariusCreativeSuite.tsx', description: 'Aquarius Creative Suite' },
    { id: 'aquarius-dashboard', name: 'Aquarius Dashboard', category: 'components', path: 'components/AquariusDashboard.tsx', description: 'Aquarius Dashboard' },
    { id: 'aquarius-ghost', name: 'Aquarius Ghost View', category: 'components', path: 'components/AquariusGhostView.tsx', description: 'Aquarius Ghost View' },
    { id: 'aquarius-institutional-hub', name: 'Aquarius Institutional Hub', category: 'components', path: 'components/AquariusInstitutionalHub.tsx', description: 'Aquarius Institutional Hub' },
    { id: 'aquarius-live-voice', name: 'Aquarius Live Voice', category: 'components', path: 'components/AquariusLiveVoice.tsx', description: 'Aquarius Live Voice' },
    { id: 'balance-summary', name: 'Balance Summary', category: 'components', path: 'components/BalanceSummary.tsx', description: 'Balance Summary' },
    { id: 'billing-identity', name: 'Billing Identity View', category: 'components', path: 'components/BillingIdentityView.tsx', description: 'Billing Identity View' },
    { id: 'budgets', name: 'Budgets View', category: 'components', path: 'components/BudgetsView.tsx', description: 'Budgets View' },
    { id: 'card', name: 'Card', category: 'components', path: 'components/Card.tsx', description: 'Card' },
    { id: 'card-customization', name: 'Card Customization View', category: 'components', path: 'components/CardCustomizationView.tsx', description: 'Card Customization View' },
    { id: 'citi-connect-initiation', name: 'Citi Connect Initiation', category: 'components', path: 'components/CitiConnectInitiation.tsx', description: 'Citi Connect Initiation' },
    { id: 'citi-connect-inquiry', name: 'Citi Connect Inquiry', category: 'components', path: 'components/CitiConnectInquiry.tsx', description: 'Citi Connect Inquiry' },
    { id: 'citi-connect-notifications', name: 'Citi Connect Notifications', category: 'components', path: 'components/CitiConnectNotifications.tsx', description: 'Citi Connect Notifications' },
    { id: 'citi-decryption-utility', name: 'Citi Decryption Utility', category: 'components', path: 'components/CitiDecryptionUtility.tsx', description: 'Citi Decryption Utility' },
    { id: 'citi-gateway', name: 'Citi Gateway', category: 'components', path: 'components/CitiGateway.tsx', description: 'Citi Gateway' },
    { id: 'citi-partner-hub', name: 'Citi Partner Hub', category: 'components', path: 'components/CitiPartnerHub.tsx', description: 'Citi Partner Hub' },
    { id: 'citi-sovereign-ledger', name: 'Citi Sovereign Ledger', category: 'components', path: 'components/CitiSovereignLedger.tsx', description: 'Citi Sovereign Ledger' },
    { id: 'citi-treasury-hub', name: 'Citi Treasury Hub', category: 'components', path: 'components/CitiTreasuryHub.tsx', description: 'Citi Treasury Hub' },
    { id: 'corporate-command', name: 'Corporate Command View', category: 'components', path: 'components/CorporateCommandView.tsx', description: 'Corporate Command View' },
    { id: 'credit-health', name: 'Credit Health View', category: 'components', path: 'components/CreditHealthView.tsx', description: 'Credit Health View' },
    { id: 'crypto', name: 'Crypto View', category: 'components', path: 'components/CryptoView.tsx', description: 'Crypto View' },
    { id: 'dashboard', name: 'Dashboard', category: 'components', path: 'components/Dashboard.tsx', description: 'Dashboard' },
    { id: 'data-ingest', name: 'Data Ingest View', category: 'components', path: 'components/DataIngestView.tsx', description: 'Data Ingest View' },
    { id: 'developer', name: 'Developer View', category: 'components', path: 'components/DeveloperView.tsx', description: 'Developer View' },
    { id: 'entra-swarm-manager', name: 'Entra Swarm Manager', category: 'components', path: 'components/EntraSwarmManager.tsx', description: 'Entra Swarm Manager' },
    { id: 'error-boundary', name: 'Error Boundary', category: 'components', path: 'components/ErrorBoundary.tsx', description: 'Error Boundary' },
    { id: 'feature-palette', name: 'Feature Palette', category: 'components', path: 'components/FeaturePalette.tsx', description: 'Feature Palette' },
    { id: 'financial-democracy', name: 'Financial Democracy View', category: 'components', path: 'components/FinancialDemocracyView.tsx', description: 'Financial Democracy View' },
    { id: 'financial-goals', name: 'Financial Goals View', category: 'components', path: 'components/FinancialGoalsView.tsx', description: 'Financial Goals View' },
    { id: 'fleet-app', name: 'Fleet App View', category: 'components', path: 'components/FleetAppView.tsx', description: 'Fleet App View' },
    { id: 'gas-price-correlation', name: 'Gas Price Correlation', category: 'components', path: 'components/GasPriceCorrelation.tsx', description: 'Gas Price Correlation' },
    { id: 'gemini-key-modal', name: 'Gemini Key Modal', category: 'components', path: 'components/GeminiKeyModal.tsx', description: 'Gemini Key Modal' },
    { id: 'gemini-live-portal', name: 'Gemini Live Portal', category: 'components', path: 'components/GeminiLivePortal.tsx', description: 'Gemini Live Portal' },
    { id: 'global-ledger', name: 'Global Ledger View', category: 'components', path: 'components/GlobalLedgerView.tsx', description: 'Global Ledger View' },
    { id: 'goals', name: 'Goals View', category: 'components', path: 'components/GoalsView.tsx', description: 'Goals View' },
    { id: 'header', name: 'Header', category: 'components', path: 'components/Header.tsx', description: 'Header' },
    { id: 'hok-token-mint', name: 'Ho K Token Mint', category: 'components', path: 'components/HoKTokenMint.tsx', description: 'Ho K Token Mint' },
    { id: 'identity-citadel', name: 'Identity Citadel View', category: 'components', path: 'components/IdentityCitadelView.tsx', description: 'Identity Citadel View' },
    { id: 'impact-tracker', name: 'Impact Tracker', category: 'components', path: 'components/ImpactTracker.tsx', description: 'Impact Tracker' },
    { id: 'injustice-dashboard', name: 'Injustice Dashboard', category: 'components', path: 'components/InjusticeDashboard.tsx', description: 'Injustice Dashboard' },
    { id: 'integrations-marketplace', name: 'Integrations Marketplace View', category: 'components', path: 'components/IntegrationsMarketplaceView.tsx', description: 'Integrations Marketplace View' },
    { id: 'intelligence-hub', name: 'Intelligence Hub View', category: 'components', path: 'components/IntelligenceHubView.tsx', description: 'Intelligence Hub View' },
    { id: 'investment-portfolio', name: 'Investment Portfolio', category: 'components', path: 'components/InvestmentPortfolio.tsx', description: 'Investment Portfolio' },
    { id: 'investments-portfolio', name: 'Investments Portfolio', category: 'components', path: 'components/InvestmentsPortfolio.tsx', description: 'Investments Portfolio' },
    { id: 'investments', name: 'Investments View', category: 'components', path: 'components/InvestmentsView.tsx', description: 'Investments View' },
    { id: 'jwe-jws-verifier', name: 'Jwe Jws Verifier', category: 'components', path: 'components/JweJwsVerifier.tsx', description: 'Jwe Jws Verifier' },
    { id: 'krypto-bridge-widget', name: 'Krypto Bridge Widget', category: 'components', path: 'components/KryptoBridgeWidget.tsx', description: 'Krypto Bridge Widget' },
    { id: 'machine', name: 'Machine View', category: 'components', path: 'components/MachineView.tsx', description: 'Machine View' },
    { id: 'marketing-automation', name: 'Marketing Automation View', category: 'components', path: 'components/MarketingAutomationView.tsx', description: 'Marketing Automation View' },
    { id: 'marketplace', name: 'Marketplace View', category: 'components', path: 'components/MarketplaceView.tsx', description: 'Marketplace View' },
    { id: 'nfc-validator', name: 'NFC Validator', category: 'components', path: 'components/NFCValidator.tsx', description: 'NFC Validator' },
    { id: 'neural-tools', name: 'Neural Tools View', category: 'components', path: 'components/NeuralToolsView.tsx', description: 'Neural Tools View' },
    { id: 'nexus-builder', name: 'Nexus Builder', category: 'components', path: 'components/NexusBuilder.tsx', description: 'Nexus Builder' },
    { id: 'ofx-statement-viewer', name: 'OFX Statement Viewer', category: 'components', path: 'components/OFXStatementViewer.tsx', description: 'OFX Statement Viewer' },
    { id: 'open-banking', name: 'Open Banking View', category: 'components', path: 'components/OpenBankingView.tsx', description: 'Open Banking View' },
    { id: 'payment-methods', name: 'Payment Methods View', category: 'components', path: 'components/PaymentMethodsView.tsx', description: 'Payment Methods View' },
    { id: 'personalization', name: 'Personalization View', category: 'components', path: 'components/PersonalizationView.tsx', description: 'Personalization View' },
    { id: 'plaid-link', name: 'Plaid Link', category: 'components', path: 'components/PlaidLink.tsx', description: 'Plaid Link' },
    { id: 'plaid-link-button', name: 'Plaid Link Button', category: 'components', path: 'components/PlaidLinkButton.tsx', description: 'Plaid Link Button' },
    { id: 'political-compliance', name: 'Political Compliance View', category: 'components', path: 'components/PoliticalComplianceView.tsx', description: 'Political Compliance View' },
    { id: 'portal-handshake', name: 'Portal Handshake', category: 'components', path: 'components/PortalHandshake.tsx', description: 'Portal Handshake' },
    { id: 'portal-hub', name: 'Portal Hub View', category: 'components', path: 'components/PortalHubView.tsx', description: 'Portal Hub View' },
    { id: 'privacy-guardian', name: 'Privacy Guardian View', category: 'components', path: 'components/PrivacyGuardianView.tsx', description: 'Privacy Guardian View' },
    { id: 'public-aid-calculator', name: 'Public Aid Calculator', category: 'components', path: 'components/PublicAidCalculator.tsx', description: 'Public Aid Calculator' },
    { id: 'quantum-weaver', name: 'Quantum Weaver View', category: 'components', path: 'components/QuantumWeaverView.tsx', description: 'Quantum Weaver View' },
    { id: 'recent-transactions', name: 'Recent Transactions', category: 'components', path: 'components/RecentTransactions.tsx', description: 'Recent Transactions' },
    { id: 'recovery-mesh', name: 'Recovery Mesh View', category: 'components', path: 'components/RecoveryMeshView.tsx', description: 'Recovery Mesh View' },
    { id: 'rewards', name: 'Rewards View', category: 'components', path: 'components/RewardsView.tsx', description: 'Rewards View' },
    { id: 'security-orchestrator', name: 'Security Orchestrator View', category: 'components', path: 'components/SecurityOrchestratorView.tsx', description: 'Security Orchestrator View' },
    { id: 'security', name: 'Security View', category: 'components', path: 'components/SecurityView.tsx', description: 'Security View' },
    { id: 'send-money', name: 'Send Money View', category: 'components', path: 'components/SendMoneyView.tsx', description: 'Send Money View' },
    { id: 'settings', name: 'Settings View', category: 'components', path: 'components/SettingsView.tsx', description: 'Settings View' },
    { id: 'sidebar', name: 'Sidebar', category: 'components', path: 'components/Sidebar.tsx', description: 'Sidebar' },
    { id: 'sovereign-chat', name: 'Sovereign Chat', category: 'components', path: 'components/SovereignChat.tsx', description: 'Sovereign Chat' },
    { id: 'sovereign-dashboard', name: 'Sovereign Dashboard', category: 'components', path: 'components/SovereignDashboard.tsx', description: 'Sovereign Dashboard' },
    { id: 'sovereign-deal-audit', name: 'Sovereign Deal Audit', category: 'components', path: 'components/SovereignDealAudit.tsx', description: 'Sovereign Deal Audit' },
    { id: 'sovereign-iframe', name: 'Sovereign Iframe', category: 'components', path: 'components/SovereignIframe.tsx', description: 'Sovereign Iframe' },
    { id: 'sovereign-org-handshake', name: 'Sovereign Org Handshake', category: 'components', path: 'components/SovereignOrgHandshake.tsx', description: 'Sovereign Org Handshake' },
    { id: 'story-viewer', name: 'Story Viewer', category: 'components', path: 'components/StoryViewer.tsx', description: 'Story Viewer' },
    { id: 'stripe-treasury-manager', name: 'Stripe Treasury Manager', category: 'components', path: 'components/StripeTreasuryManager.tsx', description: 'Stripe Treasury Manager' },
    { id: 'tab-manager', name: 'Tab Manager', category: 'components', path: 'components/TabManager.tsx', description: 'Tab Manager' },
    { id: 'the-vision', name: 'The Vision View', category: 'components', path: 'components/TheVisionView.tsx', description: 'The Vision View' },
    { id: 'token-issuance', name: 'Token Issuance View', category: 'components', path: 'components/TokenIssuanceView.tsx', description: 'Token Issuance View' },
    { id: 'trading-bots', name: 'Trading Bots View', category: 'components', path: 'components/TradingBotsView.tsx', description: 'Trading Bots View' },
    { id: 'transactions', name: 'Transactions View', category: 'components', path: 'components/TransactionsView.tsx', description: 'Transactions View' },
    { id: 'trust-registry', name: 'Trust Registry View', category: 'components', path: 'components/TrustRegistryView.tsx', description: 'Trust Registry View' },
    { id: 'universe-3d', name: 'Universe 3D', category: 'components', path: 'components/Universe3D.tsx', description: 'Universe 3D' },
    { id: 'voice-control', name: 'Voice Control', category: 'components', path: 'components/VoiceControl.tsx', description: 'Voice Control' },
    { id: 'wallet-connect-modal', name: 'Wallet Connect Modal', category: 'components', path: 'components/WalletConnectModal.tsx', description: 'Wallet Connect Modal' },
    { id: 'war-appropriations-tracker', name: 'War Appropriations Tracker', category: 'components', path: 'components/WarAppropriationsTracker.tsx', description: 'War Appropriations Tracker' },
    { id: 'wealth-distribution-chart', name: 'Wealth Distribution Chart', category: 'components', path: 'components/WealthDistributionChart.tsx', description: 'Wealth Distribution Chart' },
    { id: 'wealth-nexus', name: 'Wealth Nexus View', category: 'components', path: 'components/WealthNexusView.tsx', description: 'Wealth Nexus View' },
    { id: 'wealth-timeline', name: 'Wealth Timeline', category: 'components', path: 'components/WealthTimeline.tsx', description: 'Wealth Timeline' },
    { id: 'workspace-nexus', name: 'Workspace Nexus View', category: 'components', path: 'components/WorkspaceNexusView.tsx', description: 'Workspace Nexus View' }
];

/**
 * Utility function to retrieve custom metadata for any module in Oko-main.
 */
export function getSystemModuleById(id: string): SystemModuleMetadata | undefined {
    return OKO_SYSTEM_MODULES.find(m => m.id === id);
}

/**
 * Utility function to query services by operational status.
 */
export function getOperationalServices(): ExternalServiceDefinition[] {
    return GLOBAL_EXTERNAL_SERVICES.filter(s => s.status === 'operational');
}