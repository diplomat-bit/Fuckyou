import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import BalanceSummary from './BalanceSummary';
import RecentTransactions from './RecentTransactions';
import AIInsights from './AIInsights';
import ImpactTracker from './ImpactTracker';
import InvestmentPortfolio from './InvestmentPortfolio';
import { View } from '../types';

interface ModuleItem {
    name: string;
    view: string;
    description: string;
    icon: string;
}

interface ModuleCategory {
    title: string;
    color: string;
    items: ModuleItem[];
}

const categories: ModuleCategory[] = [
    {
        title: "Alpaca & Trading Systems",
        color: "from-amber-500/20 to-orange-500/20 border-amber-500/30 text-amber-300",
        items: [
            { name: "Alpaca Broker View", view: "AlpacaBroker", description: "Direct broker integration and account overview", icon: "📈" },
            { name: "Alpaca Accounts Manager", view: "AlpacaAccountsManager", description: "Manage multiple Alpaca accounts and profiles", icon: "👥" },
            { name: "Alpaca Crypto Wallets", view: "AlpacaCryptoWallets", description: "On-chain crypto wallets linked to Alpaca", icon: "🪙" },
            { name: "Alpaca Funding Hub", view: "AlpacaFundingHub", description: "ACH, Wire, and instant transfer management", icon: "🏦" },
            { name: "Alpaca IPO Marketplace", view: "AlpacaIpoMarketplace", description: "Participate in primary public offerings", icon: "🚀" },
            { name: "Alpaca Journals", view: "AlpacaJournals", description: "Internal journal entries and ledger sync", icon: "📓" },
            { name: "Alpaca Rebalancing", view: "AlpacaRebalancing", description: "Automated portfolio weight rebalancing", icon: "⚖️" },
            { name: "Alpaca Reporting", view: "AlpacaReporting", description: "Tax documents, statements, and trade confirmations", icon: "📊" },
            { name: "Alpaca Tokenization", view: "AlpacaTokenization", description: "Tokenize equities and real-world assets", icon: "🪙" },
            { name: "Alpaca Trading Terminal", view: "AlpacaTradingTerminal", description: "High-frequency manual trading interface", icon: "🖥️" },
            { name: "BTC Swing Trading Notebook", view: "BtcSwingTradingNotebook", description: "Jupyter-style algorithmic trading notebook", icon: "📓" },
            { name: "TQQQ Algorithm Terminal", view: "TqqqAlgorithmTerminal", description: "Leveraged ETF momentum trading engine", icon: "⚡" }
        ]
    },
    {
        title: "Bridges & Integrations",
        color: "from-cyan-500/20 to-blue-500/20 border-cyan-500/30 text-cyan-300",
        items: [
            { name: "Citi-Alpaca Bridge", view: "CitiAlpacaBridge", description: "Bridge institutional liquidity to retail brokerage", icon: "🌉" },
            { name: "Plaid-Alpaca Bridge", view: "PlaidAlpacaBridge", description: "Fund Alpaca accounts directly via Plaid bank links", icon: "🔌" },
            { name: "Real Estate Alpaca Bridge", view: "RealEstateAlpacaBridge", description: "Collateralize real estate for margin trading", icon: "🏠" },
            { name: "Sovereign Market Takeover", view: "SovereignMarketTakeover", description: "Global market coordination dashboard", icon: "👑" },
            { name: "Stripe-Alpaca Bridge", view: "StripeAlpacaBridge", description: "Process card payments directly into brokerage cash", icon: "💳" },
            { name: "Tax Lien Modern Treasury Bridge", view: "TaxLienModernTreasuryBridge", description: "Settle tax lien acquisitions via Modern Treasury", icon: "🏛️" }
        ]
    },
    {
        title: "Citi & Treasury Hub",
        color: "from-blue-600/20 to-indigo-600/20 border-blue-500/30 text-blue-300",
        items: [
            { name: "Citi Connect Initiation", view: "CitiConnectInitiation", description: "Initiate corporate payments and wire transfers", icon: "🔑" },
            { name: "Citi Connect Inquiry", view: "CitiConnectInquiry", description: "Query transaction status and balance reports", icon: "🔍" },
            { name: "Citi Connect Notifications", view: "CitiConnectNotifications", description: "Real-time webhook and event stream", icon: "🔔" },
            { name: "Citi Decryption Utility", view: "CitiDecryptionUtility", description: "Decrypt PGP-encrypted Citi statements", icon: "🔓" },
            { name: "Citi Gateway", view: "CitiGateway", description: "Direct API gateway to Citi Connect", icon: "🚪" },
            { name: "Citi Partner Hub", view: "CitiPartnerHub", description: "Manage institutional partner connections", icon: "🤝" },
            { name: "Citi Sovereign Ledger", view: "CitiSovereignLedger", description: "Reconcile Citi balances with sovereign ledger", icon: "📖" },
            { name: "Citi Treasury Hub", view: "CitiTreasuryHub", description: "Global cash management and liquidity pooling", icon: "💼" },
            { name: "Citi UK International Payments", view: "CitiUkInternationalPayments", description: "Cross-border GBP/EUR payment rails", icon: "🇬🇧" },
            { name: "Modern Treasury Ledger Hub", view: "ModernTreasuryLedgerHub", description: "Double-entry ledger management", icon: "📚" },
            { name: "Stripe Treasury Manager", view: "StripeTreasuryManager", description: "Manage virtual accounts and card issuing", icon: "💳" }
        ]
    },
    {
        title: "Aquarius & AI Swarms",
        color: "from-purple-500/20 to-pink-500/20 border-purple-500/30 text-purple-300",
        items: [
            { name: "Aquarius Architect", view: "AquariusArchitect", description: "Design autonomous agent swarms", icon: "📐" },
            { name: "Aquarius Auditor", view: "AquariusAuditor", description: "Audit AI decisions and compliance logs", icon: "🕵️" },
            { name: "Aquarius Creative Suite", view: "AquariusCreativeSuite", description: "Generative marketing and asset creation", icon: "🎨" },
            { name: "Aquarius Dashboard", view: "AquariusDashboard", description: "Central command for Aquarius AI", icon: "🧠" },
            { name: "Aquarius Ghost View", view: "AquariusGhost", description: "Stealth mode operations and dark pool routing", icon: "👻" },
            { name: "Aquarius Institutional Hub", view: "AquariusInstitutionalHub", description: "Enterprise-grade AI coordination", icon: "🏢" },
            { name: "Aquarius Live Voice", view: "AquariusLiveVoice", description: "Real-time voice synthesis and agent calls", icon: "🎙️" },
            { name: "Aria Comms", view: "AriaComms", description: "Secure communication channel with Aria AI", icon: "💬" },
            { name: "Gemini Live Portal", view: "GeminiLivePortal", description: "Multimodal Gemini Live integration", icon: "♊" },
            { name: "Neural Tools", view: "NeuralTools", description: "Advanced machine learning utilities", icon: "⚙️" },
            { name: "Sovereign Chat", view: "SovereignChat", description: "Encrypted chat with sovereign intelligence", icon: "💬" },
            { name: "Sovereign Intelligence", view: "SovereignIntelligence", description: "Global threat and opportunity analysis", icon: "👁️" }
        ]
    },
    {
        title: "Government & Compliance",
        color: "from-red-500/20 to-rose-500/20 border-red-500/30 text-red-300",
        items: [
            { name: "GIS Property Map", view: "GisPropertyMap", description: "Geospatial property and parcel mapping", icon: "🗺️" },
            { name: "Government API Dashboard", view: "GovernmentApiDashboard", description: "Direct links to federal and state APIs", icon: "🏛️" },
            { name: "IRS Tax Filing", view: "IrsTaxFiling", description: "Automated corporate and personal tax filing", icon: "📝" },
            { name: "SEC Filing Viewer", view: "SecFilingViewer", description: "Real-time EDGAR filing analysis", icon: "📄" },
            { name: "Political Compliance", view: "PoliticalCompliance", description: "FEC compliance and lobbying tracking", icon: "⚖️" },
            { name: "Florida Voter View", view: "FloridaVoter", description: "Voter registration and demographic analytics", icon: "🗳️" },
            { name: "Contractor Lobbying List", view: "ContractorLobbyingList", description: "Track defense and government contractors", icon: "📋" },
            { name: "Impeachment Generator", view: "ImpeachmentGenerator", description: "Draft constitutional articles of impeachment", icon: "🔨" },
            { name: "War Appropriations Tracker", view: "WarAppropriationsTracker", description: "Monitor defense spending and contracts", icon: "🎖️" }
        ]
    },
    {
        title: "Real Estate & Tax Liens",
        color: "from-emerald-500/20 to-teal-500/20 border-emerald-500/30 text-emerald-300",
        items: [
            { name: "Deed Registrar", view: "DeedRegistrar", description: "On-chain property deed registration", icon: "📜" },
            { name: "Escrow Manager", view: "EscrowManager", description: "Smart contract-based escrow accounts", icon: "🔒" },
            { name: "Property Marketplace", view: "PropertyMarketplace", description: "Fractional real estate marketplace", icon: "🏡" },
            { name: "Foreclosure Tracker", view: "ForeclosureTracker", description: "Monitor distressed property opportunities", icon: "🏚️" },
            { name: "Tax Lien Auctions", view: "TaxLienAuctions", description: "Bid on high-yield municipal tax liens", icon: "🔨" }
        ]
    },
    {
        title: "Trillionaire Status & Research",
        color: "from-yellow-500/20 to-amber-500/20 border-yellow-500/30 text-yellow-300",
        items: [
            { name: "Capital Allocation Models", view: "CapitalAllocationModels", description: "Macroeconomic capital deployment models", icon: "📊" },
            { name: "Competitor Intelligence", view: "CompetitorIntelligence", description: "Deep-dive analysis of Fortune 500 rivals", icon: "🕵️" },
            { name: "Consumer Sentiment Analysis", view: "ConsumerSentimentAnalysis", description: "Real-time social media and market sentiment", icon: "🗣️" },
            { name: "Corporate Governance Review", view: "CorporateGovernanceReview", description: "Board composition and voting power analysis", icon: "🏢" },
            { name: "Digital Transformation Audit", view: "DigitalTransformationAudit", description: "Assess legacy enterprise tech stacks", icon: "💻" },
            { name: "Emerging Market Expansion", view: "EmergingMarketExpansion", description: "Identify high-growth global opportunities", icon: "🌍" },
            { name: "ESG Impact Metrics", view: "ESGImpactMetrics", description: "Track environmental, social, and governance scores", icon: "🌱" },
            { name: "Executive Compensation Audit", view: "ExecutiveCompensationAudit", description: "Analyze C-suite pay vs performance", icon: "💰" },
            { name: "Financial Data Ingestion", view: "FinancialDataIngestion", description: "Ingest SEC, Bloomberg, and Reuters feeds", icon: "📥" },
            { name: "Fortune 500 Research Plan", view: "Fortune500ResearchPlan", description: "Strategic roadmap for market dominance", icon: "📋" },
            { name: "Global Tax Strategy", view: "GlobalTaxStrategy", description: "Optimize multi-jurisdictional tax structures", icon: "🌍" },
            { name: "Infrastructure Dependencies", view: "InfrastructureDependencies", description: "Map critical supply chain and cloud dependencies", icon: "🏗️" },
            { name: "Innovation Pipeline Research", view: "InnovationPipelineResearch", description: "Track patents and R&D breakthroughs", icon: "🔬" },
            { name: "Lobbying Influence Mapping", view: "LobbyingInfluenceMapping", description: "Visualize political contributions and policy impact", icon: "🗺️" },
            { name: "Market Cap Analysis", view: "MarketCapAnalysis", description: "Track valuation trends across sectors", icon: "📈" },
            { name: "Mergers & Acquisitions", view: "MergersAndAcquisitions", description: "Model potential corporate takeovers", icon: "🤝" },
            { name: "Patent Portfolio Audit", view: "PatentPortfolioAudit", description: "Evaluate intellectual property assets", icon: "📜" },
            { name: "Regulatory Compliance Audit", view: "RegulatoryComplianceAudit", description: "Ensure compliance with global regulators", icon: "🛡️" },
            { name: "Risk Assessment Framework", view: "RiskAssessmentFramework", description: "Stress-test portfolios against black swan events", icon: "⚠️" },
            { name: "Shareholder Value Metrics", view: "ShareholderValueMetrics", description: "Track ROIC, EVA, and dividend yields", icon: "📊" },
            { name: "Supply Chain Mapping", view: "SupplyChainMapping", description: "Visualize global logistics and bottlenecks", icon: "🚢" },
            { name: "Sustainability Reporting", view: "SustainabilityReporting", description: "Generate carbon footprint and green reports", icon: "🍃" },
            { name: "Talent Acquisition Pipeline", view: "TalentAcquisitionPipeline", description: "Track executive and engineering talent movement", icon: "👥" },
            { name: "Tech Stack Integration", view: "TechStackIntegration", description: "Map API and database integrations", icon: "🔌" },
            { name: "Trillionaire Status Summary", view: "TrillionaireStatusSummary", description: "Consolidated roadmap to $1T net worth", icon: "🏆" }
        ]
    },
    {
        title: "Core Platform & Security",
        color: "from-slate-500/20 to-zinc-500/20 border-slate-500/30 text-slate-300",
        items: [
            { name: "Administration Audit", view: "AdministrationAudit", description: "System logs and administrative actions", icon: "🛡️" },
            { name: "AI Ad Studio", view: "AIAdStudio", description: "Generate and deploy targeted ad campaigns", icon: "📺" },
            { name: "AI Advisor", view: "AIAdvisor", description: "Personalized financial advisory agent", icon: "🤖" },
            { name: "API Integration", view: "APIIntegration", description: "Manage third-party API connections", icon: "🔌" },
            { name: "API Keys", view: "APIKeys", description: "Generate and revoke secure API keys", icon: "🔑" },
            { name: "Astra DB Quickstart", view: "AstraDBQuickstart", description: "Vector database status and quickstart", icon: "💾" },
            { name: "Azure Apps", view: "AzureApps", description: "Monitor Azure cloud deployments", icon: "☁️" },
            { name: "Billing & Identity", view: "BillingIdentity", description: "Manage subscription and KYC status", icon: "🆔" },
            { name: "Budgets", view: "Budgets", description: "Set and monitor spending limits", icon: "💰" },
            { name: "Card Customization", view: "CardCustomization", description: "Design custom physical and virtual cards", icon: "💳" },
            { name: "Credit Health", view: "CreditHealth", description: "Monitor credit score and debt-to-income", icon: "📈" },
            { name: "Data Ingest", view: "DataIngest", description: "Upload and parse financial statements", icon: "📥" },
            { name: "Developer View", view: "Developer", description: "System console and raw database access", icon: "💻" },
            { name: "Entra Swarm Manager", view: "EntraSwarmManager", description: "Manage Microsoft Entra ID identities", icon: "🐝" },
            { name: "Feature Palette", view: "FeaturePalette", description: "Toggle experimental platform features", icon: "🎨" },
            { name: "Financial Democracy", view: "FinancialDemocracy", description: "Participate in community governance", icon: "🗳️" },
            { name: "Financial Goals", view: "FinancialGoals", description: "Set and track long-term wealth goals", icon: "🎯" },
            { name: "Fleet App", view: "FleetApp", description: "Manage corporate vehicle and asset fleets", icon: "🚗" },
            { name: "Flow Controller", view: "FlowController", description: "Visual workflow automation builder", icon: "🎛️" },
            { name: "Gas Price Correlation", view: "GasPriceCorrelation", description: "Correlate gas prices with market indices", icon: "⛽" },
            { name: "GCP Inventory", view: "GcpInventory", description: "Monitor Google Cloud Platform assets", icon: "☁️" },
            { name: "Global Ledger", view: "GlobalLedger", description: "Immutable multi-currency ledger", icon: "📖" },
            { name: "Growth Nexus", view: "GrowthNexus", description: "Track user acquisition and platform growth", icon: "📈" },
            { name: "HoK Token Mint", view: "HoKTokenMint", description: "Mint House of Keys utility tokens", icon: "🪙" },
            { name: "Identity Citadel", view: "IdentityCitadel", description: "Decentralized identity and biometric vault", icon: "🏰" },
            { name: "Injustice Dashboard", view: "InjusticeDashboard", description: "Track legal and regulatory disputes", icon: "⚖️" },
            { name: "Integrations Marketplace", view: "IntegrationsMarketplace", description: "Browse and install third-party apps", icon: "🛍️" },
            { name: "JWE/JWS Verifier", view: "JweJwsVerifier", description: "Verify JSON Web Encryption and Signatures", icon: "🔑" },
            { name: "Krypto Bridge Widget", view: "KryptoBridgeWidget", description: "Cross-chain token swap widget", icon: "🌉" },
            { name: "Machine View", view: "Machine", description: "Monitor bare-metal server infrastructure", icon: "🖥️" },
            { name: "Marketing Automation", view: "MarketingAutomation", description: "Automate email and social campaigns", icon: "📧" },
            { name: "Marketplace", view: "Marketplace", description: "Sovereign asset and service marketplace", icon: "🛒" },
            { name: "Nexus Builder", view: "NexusBuilder", description: "Build custom integrations and workflows", icon: "🛠️" },
            { name: "NFC Validator", view: "NFCValidator", description: "Verify physical card NFC signatures", icon: "📡" },
            { name: "OFX Statement Viewer", view: "OFXStatementViewer", description: "Parse and view OFX bank statements", icon: "📄" },
            { name: "Open Banking FAPI", view: "OpenBankingFapi", description: "Financial-grade API compliance suite", icon: "🔒" },
            { name: "Open Banking View", view: "OpenBanking", description: "Connect external bank accounts", icon: "🏦" },
            { name: "Payment Methods", view: "PaymentMethods", description: "Manage linked cards and bank accounts", icon: "💳" },
            { name: "Personalization", view: "Personalization", description: "Customize dashboard theme and layout", icon: "🎨" },
            { name: "Portal Handshake", view: "PortalHandshake", description: "Secure cross-origin portal handshake", icon: "🤝" },
            { name: "Portal Hub", view: "PortalHub", description: "Central hub for multi-portal routing", icon: "🌀" },
            { name: "Privacy Guardian", view: "PrivacyGuardian", description: "Manage data sharing and privacy settings", icon: "🛡️" },
            { name: "Public Aid Calculator", view: "PublicAidCalculator", description: "Calculate eligibility for public assistance", icon: "🧮" },
            { name: "Quantum Weaver", view: "QuantumWeaver", description: "Synthesize complex financial instruments", icon: "⚛️" },
            { name: "Recovery Mesh", view: "RecoveryMesh", description: "Decentralized social recovery setup", icon: "🕸️" },
            { name: "Rewards", view: "Rewards", description: "Track cashback and loyalty points", icon: "🎁" },
            { name: "Security Orchestrator", view: "SecurityOrchestrator", description: "Real-time threat detection and response", icon: "🛡️" },
            { name: "Security View", view: "Security", description: "Two-factor auth and security logs", icon: "🔒" },
            { name: "Sovereign Deal Audit", view: "SovereignDealAudit", description: "Audit high-value business deals", icon: "🕵️" },
            { name: "Sovereign Iframe", view: "SovereignIframe", description: "Embed external sovereign portals securely", icon: "🖼️" },
            { name: "Sovereign Org Handshake", view: "SovereignOrgHandshake", description: "B2B organizational handshake protocol", icon: "🤝" },
            { name: "Sovereign Sentry Engine", view: "SovereignSentryEngine", description: "Automated compliance and security sentry", icon: "🛡️" },
            { name: "Story Viewer", view: "StoryViewer", description: "Interactive platform lore and roadmap", icon: "📖" },
            { name: "The Vision", view: "TheVision", description: "Sovereign platform manifesto and vision", icon: "👁️" },
            { name: "Token Issuance", view: "TokenIssuance", description: "Issue custom ERC-20 or security tokens", icon: "🪙" },
            { name: "Trading Bots", view: "TradingBots", description: "Deploy and monitor automated trading bots", icon: "🤖" },
            { name: "Transactions View", view: "Transactions", description: "Detailed transaction history and search", icon: "📝" },
            { name: "Trust Registry", view: "TrustRegistry", description: "Verified institutional trust registry", icon: "📜" },
            { name: "Universe 3D", view: "Universe3D", description: "3D visualization of the financial universe", icon: "🌌" },
            { name: "Universe Graph Visualizer", view: "UniverseGraphVisualizer", description: "Interactive node graph of assets", icon: "🕸️" },
            { name: "Voice Control", view: "VoiceControl", description: "Voice-activated command console", icon: "🎙️" },
            { name: "Wallet Connect", view: "WalletConnect", description: "Connect external Web3 wallets", icon: "🔌" },
            { name: "Wealth Distribution Chart", view: "WealthDistributionChart", description: "Visualize global wealth distribution", icon: "📊" },
            { name: "Wealth Nexus", view: "WealthNexus", description: "Cross-asset wealth aggregation engine", icon: "🕸️" },
            { name: "Wealth Timeline", view: "WealthTimeline", description: "Historical and projected wealth timeline", icon: "📅" },
            { name: "Workspace Nexus", view: "WorkspaceNexus", description: "Collaborative workspace and document hub", icon: "💼" }
        ]
    }
];

const Dashboard: React.FC<{ setActiveView: (view: View) => void }> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedCategory, setSelectedCategory] = useState<string | null>(null);

    if (!context) return null;

    const { treesPlanted, userProfile } = context;

    const filteredCategories = categories.map(cat => {
        const items = cat.items.filter(item => 
            (item.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
             item.description.toLowerCase().includes(searchTerm.toLowerCase())) &&
            (!selectedCategory || cat.title === selectedCategory)
        );
        return { ...cat, items };
    }).filter(cat => cat.items.length > 0);

    return (
        <div className="space-y-6 animate-in fade-in duration-700">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-4xl font-extrabold text-white tracking-tight">Sovereign Command</h2>
                    <p className="text-gray-400 font-mono mt-1">Status: All Systems Operational // Global settlement logic active</p>
                </div>
                <div className="hidden md:block text-right">
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Available Liquidity</p>
                    <p className="text-2xl font-bold text-cyan-400">${userProfile.usdBalance.toLocaleString()}</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                <div className="lg:col-span-8 space-y-6">
                    <BalanceSummary />
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card title="Quick Actions" className="h-full">
                            <div className="grid grid-cols-2 gap-4">
                                <button onClick={() => setActiveView(View.SendMoney)} className="p-4 bg-cyan-600/20 hover:bg-cyan-600/40 border border-cyan-500/30 rounded-xl text-cyan-300 font-bold transition-all transform hover:scale-105">Transmit Funds</button>
                                <button onClick={() => setActiveView(View.Crypto)} className="p-4 bg-indigo-600/20 hover:bg-indigo-600/40 border border-indigo-500/30 rounded-xl text-indigo-300 font-bold transition-all transform hover:scale-105">Web3 Gateway</button>
                                <button onClick={() => setActiveView(View.QuantumWeaver)} className="p-4 bg-purple-600/20 hover:bg-purple-600/40 border border-purple-500/30 rounded-xl text-purple-300 font-bold transition-all transform hover:scale-105">Forge Venture</button>
                                <button onClick={() => setActiveView(View.Goals)} className="p-4 bg-emerald-600/20 hover:bg-emerald-600/40 border border-emerald-500/30 rounded-xl text-emerald-300 font-bold transition-all transform hover:scale-105">Goal Matrix</button>
                            </div>
                        </Card>
                        <ImpactTracker initialTrees={treesPlanted} initialCarbonOffsetTonnes={14.2} initialBiodiversityIndex={88} initialWaterPurityPPM={12} initialSocialEquityScore={91} transactionsPerSecond={5} />
                    </div>
                </div>

                <div className="lg:col-span-4 space-y-6">
                    <AIInsights />
                    <InvestmentPortfolio />
                    <RecentTransactions />
                </div>
            </div>

            {/* Sovereign Command Center - All Modules Directory */}
            <div className="mt-12 border border-slate-800 bg-slate-950/40 backdrop-blur-md rounded-2xl p-6">
                <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                    <div>
                        <h3 className="text-2xl font-bold text-white tracking-tight">Sovereign Command Center</h3>
                        <p className="text-sm text-gray-400 font-mono">Access and orchestrate all platform modules and integrations</p>
                    </div>
                    <div className="flex flex-col sm:flex-row gap-3">
                        <input 
                            type="text" 
                            placeholder="Search modules..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono text-sm"
                        />
                        <select
                            value={selectedCategory || ''}
                            onChange={(e) => setSelectedCategory(e.target.value || null)}
                            className="px-4 py-2 bg-slate-900/80 border border-slate-700 rounded-xl text-white focus:outline-none focus:border-cyan-500/50 focus:ring-1 focus:ring-cyan-500/30 transition-all font-mono text-sm"
                        >
                            <option value="">All Categories</option>
                            {categories.map(cat => (
                                <option key={cat.title} value={cat.title}>{cat.title}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-8">
                    {filteredCategories.map(category => (
                        <div key={category.title} className="space-y-4">
                            <div className="flex items-center gap-2 border-b border-slate-800/60 pb-2">
                                <span className="h-2 w-2 rounded-full bg-cyan-500 animate-pulse"></span>
                                <h4 className="text-sm font-bold uppercase tracking-widest text-gray-400 font-mono">{category.title}</h4>
                            </div>
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {category.items.map(item => (
                                    <button
                                        key={item.name}
                                        onClick={() => setActiveView(item.view as any)}
                                        className="flex flex-col text-left p-4 bg-slate-900/40 hover:bg-slate-900/80 border border-slate-800/80 hover:border-cyan-500/30 rounded-xl transition-all duration-300 group hover:shadow-[0_0_15px_rgba(6,182,212,0.15)]"
                                    >
                                        <div className="flex items-center gap-3 mb-2">
                                            <span className="text-2xl group-hover:scale-110 transition-transform">{item.icon}</span>
                                            <span className="font-bold text-white group-hover:text-cyan-400 transition-colors text-sm">{item.name}</span>
                                        </div>
                                        <p className="text-xs text-gray-400 line-clamp-2 font-mono leading-relaxed">{item.description}</p>
                                    </button>
                                ))}
                            </div>
                        </div>
                    ))}
                    {filteredCategories.length === 0 && (
                        <div className="text-center py-12">
                            <p className="text-gray-500 font-mono">No modules found matching your search criteria.</p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default Dashboard;