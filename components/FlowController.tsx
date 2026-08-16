import React, { useContext, useState, useMemo } from 'react';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import ErrorBoundary from './ErrorBoundary';

// Import all views
import AdministrationAudit from './AdministrationAudit';
import AIAdStudioView from './AIAdStudioView';
import AIAdvisorView from './AIAdvisorView';
import AIInsights from './AIInsights';
import AlpacaAccountsManager from './alpaca/AlpacaAccountsManager';
import AlpacaCryptoWalletsView from './alpaca/AlpacaCryptoWalletsView';
import AlpacaFundingHub from './alpaca/AlpacaFundingHub';
import AlpacaIpoMarketplaceView from './alpaca/AlpacaIpoMarketplaceView';
import AlpacaJournalsView from './alpaca/AlpacaJournalsView';
import AlpacaRebalancingView from './alpaca/AlpacaRebalancingView';
import AlpacaReportingView from './alpaca/AlpacaReportingView';
import AlpacaTokenizationView from './alpaca/AlpacaTokenizationView';
import AlpacaTradingTerminal from './alpaca/AlpacaTradingTerminal';
import BtcSwingTradingNotebook from './alpaca/BtcSwingTradingNotebook';
import TqqqAlgorithmTerminal from './alpaca/TqqqAlgorithmTerminal';
import AlpacaBrokerView from './AlpacaBrokerView';
import APIIntegrationView from './APIIntegrationView';
import APIKeysView from './APIKeysView';
import AquariusArchitectView from './AquariusArchitectView';
import AquariusAuditorView from './AquariusAuditorView';
import AquariusCreativeSuite from './AquariusCreativeSuite';
import AquariusDashboard from './AquariusDashboard';
import AquariusGhostView from './AquariusGhostView';
import AquariusInstitutionalHub from './AquariusInstitutionalHub';
import AquariusLiveVoice from './AquariusLiveVoice';
import AriaComms from './AriaComms';
import AstraDBQuickstart from './AstraDBQuickstart';
import AzureAppsView from './AzureAppsView';
import BalanceSummary from './BalanceSummary';
import BillingIdentityView from './BillingIdentityView';
import CitiAlpacaBridgeView from './bridges/CitiAlpacaBridgeView';
import PlaidAlpacaBridgeView from './bridges/PlaidAlpacaBridgeView';
import RealEstateAlpacaBridge from './bridges/RealEstateAlpacaBridge';
import SovereignMarketTakeoverDashboard from './bridges/SovereignMarketTakeoverDashboard';
import StripeAlpacaBridgeView from './bridges/StripeAlpacaBridgeView';
import TaxLienModernTreasuryBridge from './bridges/TaxLienModernTreasuryBridge';
import BudgetsView from './BudgetsView';
import CardCustomizationView from './CardCustomizationView';
import Card from './Card';
import CitiConnectInitiation from './CitiConnectInitiation';
import CitiConnectInquiry from './CitiConnectInquiry';
import CitiConnectNotifications from './CitiConnectNotifications';
import CitiDecryptionUtility from './CitiDecryptionUtility';
import CitiGateway from './CitiGateway';
import CitiPartnerHub from './CitiPartnerHub';
import CitiSovereignLedger from './CitiSovereignLedger';
import CitiTreasuryHub from './CitiTreasuryHub';
import CitiUkInternationalPayments from './CitiUkInternationalPayments';
import ContractorLobbyingList from './ContractorLobbyingList';
import CorporateCommandView from './CorporateCommandView';
import CreditHealthView from './CreditHealthView';
import CryptoView from './CryptoView';
import Dashboard from './Dashboard';
import DataIngestView from './DataIngestView';
import DeveloperView from './DeveloperView';
import EntraSwarmManager from './EntraSwarmManager';
import FeaturePalette from './FeaturePalette';
import FinancialDemocracyView from './FinancialDemocracyView';
import FinancialGoalsView from './FinancialGoalsView';
import FleetAppView from './FleetAppView';
import FloridaVoterView from './FloridaVoterView';
import GasPriceCorrelation from './GasPriceCorrelation';
import GcpInventoryView from './GcpInventoryView';
import GeminiKeyModal from './GeminiKeyModal';
import GeminiLivePortal from './GeminiLivePortal';
import GlobalLedgerView from './GlobalLedgerView';
import GoalsView from './GoalsView';
import GisPropertyMap from './government/GisPropertyMap';
import GovernmentApiDashboard from './government/GovernmentApiDashboard';
import IrsTaxFiling from './government/IrsTaxFiling';
import SecFilingViewer from './government/SecFilingViewer';
import GrowthNexus from './GrowthNexus';
import HoKTokenMint from './HoKTokenMint';
import IdentityCitadelView from './IdentityCitadelView';
import ImpactTracker from './ImpactTracker';
import ImpeachmentGenerator from './ImpeachmentGenerator';
import InjusticeDashboard from './InjusticeDashboard';
import IntegrationsMarketplaceView from './IntegrationsMarketplaceView';
import IntelligenceHubView from './IntelligenceHubView';
import InvestmentPortfolio from './InvestmentPortfolio';
import InvestmentsPortfolio from './InvestmentsPortfolio';
import InvestmentsView from './InvestmentsView';
import JweJwsVerifier from './JweJwsVerifier';
import KryptoBridgeWidget from './KryptoBridgeWidget';
import MachineView from './MachineView';
import MarketingAutomationView from './MarketingAutomationView';
import MarketplaceView from './MarketplaceView';
import ModernTreasuryLedgerHub from './ModernTreasuryLedgerHub';
import NeuralToolsView from './NeuralToolsView';
import NexusBuilder from './NexusBuilder';
import NFCValidator from './NFCValidator';
import OFXStatementViewer from './OFXStatementViewer';
import OpenBankingFapiView from './OpenBankingFapiView';
import OpenBankingView from './OpenBankingView';
import PaymentMethodsView from './PaymentMethodsView';
import PersonalizationView from './PersonalizationView';
import PlaidLinkButton from './PlaidLinkButton';
import PlaidLink from './PlaidLink';
import { PoliticalComplianceView } from './PoliticalComplianceView';
import PortalHandshake from './PortalHandshake';
import PortalHubView from './PortalHubView';
import PrivacyGuardianView from './PrivacyGuardianView';
import PublicAidCalculator from './PublicAidCalculator';
import QuantumWeaverView from './QuantumWeaverView';
import DeedRegistrar from './real-estate/DeedRegistrar';
import EscrowManager from './real-estate/EscrowManager';
import PropertyMarketplace from './real-estate/PropertyMarketplace';
import RecentTransactions from './RecentTransactions';
import RecoveryMeshView from './RecoveryMeshView';
import RewardsView from './RewardsView';
import SecurityOrchestratorView from './SecurityOrchestratorView';
import SecurityView from './SecurityView';
import SendMoneyView from './SendMoneyView';
import SettingsView from './SettingsView';
import SovereignChat from './SovereignChat';
import SovereignDashboard from './SovereignDashboard';
import SovereignDealAudit from './SovereignDealAudit';
import SovereignIframe from './SovereignIframe';
import SovereignIntelligenceView from './SovereignIntelligenceView';
import SovereignOrgHandshake from './SovereignOrgHandshake';
import SovereignSentryEngine from './SovereignSentryEngine';
import StoryViewer from './StoryViewer';
import StripeTreasuryManager from './StripeTreasuryManager';
import ForeclosureTracker from './tax-liens/ForeclosureTracker';
import TaxLienAuctions from './tax-liens/TaxLienAuctions';
import TheVisionView from './TheVisionView';
import TokenIssuanceView from './TokenIssuanceView';
import TradingBotsView from './TradingBotsView';
import TransactionsView from './TransactionsView';
import TrustRegistryView from './TrustRegistryView';
import Universe3D from './Universe3D';
import UniverseGraphVisualizer from './UniverseGraphVisualizer';
import VoiceControl from './VoiceControl';
import WalletConnectModal from './WalletConnectModal';
import WarAppropriationsTracker from './WarAppropriationsTracker';
import WealthDistributionChart from './WealthDistributionChart';
import WealthNexusView from './WealthNexusView';
import WealthTimeline from './WealthTimeline';
import WorkspaceNexusView from './WorkspaceNexusView';

// Lucide Icons
import {
  Search,
  ChevronRight,
  Shield,
  Cpu,
  Globe,
  Landmark,
  Briefcase,
  FileText,
  TrendingUp,
  Award,
  Settings,
  HelpCircle,
  Database,
  Zap,
  Eye,
  Map,
  DollarSign,
  Users,
  MessageSquare,
  Radio,
  Sparkles,
  Key,
  Lock,
  RefreshCw,
  BarChart2,
  BookOpen,
  Layers,
  Activity,
  Compass,
  History,
  Send,
  PieChart,
  Menu,
  X
} from 'lucide-react';

interface ViewItem {
  id: string;
  label: string;
  component: React.ComponentType<any>;
  icon: any;
  description: string;
}

interface Category {
  name: string;
  icon: any;
  items: ViewItem[];
}

const FlowController: React.FC = () => {
  const context = useContext(DataContext);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('Core Ledger & Banking');
  const [activeLocalView, setActiveLocalView] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(true);

  if (!context) return null;
  const { view, setView } = context;

  // Sync context view changes to local view
  React.useEffect(() => {
    if (view) {
      setActiveLocalView(view);
    }
  }, [view]);

  const categories: Category[] = useMemo(() => [
    {
      name: 'Core Ledger & Banking',
      icon: Landmark,
      items: [
        { id: 'dashboard', label: 'Dashboard', component: Dashboard, icon: Compass, description: 'Main system overview and metrics' },
        { id: 'global-ledger', label: 'Global Ledger', component: GlobalLedgerView, icon: Globe, description: 'Sovereign global ledger sync' },
        { id: 'transactions', label: 'Transactions Stream', component: TransactionsView, icon: History, description: 'Real-time transaction stream' },
        { id: 'recent-transactions', label: 'Recent Transactions', component: RecentTransactions, icon: Activity, description: 'Latest ledger entries' },
        { id: 'send-money', label: 'Remitrax Portal', component: SendMoneyView, icon: Send, description: 'Remitrax instant capital routing' },
        { id: 'budgets', label: 'Fiscal Mandates', component: BudgetsView, icon: PieChart, description: 'Fiscal mandates and budget limits' },
        { id: 'goals', label: 'Goals View', component: GoalsView, icon: TrendingUp, description: 'Financial targets and milestones' },
        { id: 'financial-goals', label: 'Financial Goals', component: FinancialGoalsView, icon: Award, description: 'Strategic wealth objectives' },
        { id: 'balance-summary', label: 'Balance Summary', component: BalanceSummary, icon: DollarSign, description: 'Consolidated asset balances' },
        { id: 'credit-health', label: 'Credit Health', component: CreditHealthView, icon: Activity, description: 'Credit score and debt monitoring' },
        { id: 'rewards', label: 'Rewards View', component: RewardsView, icon: Award, description: 'Loyalty and yield rewards' },
        { id: 'payment-methods', label: 'Payment Methods', component: PaymentMethodsView, icon: Landmark, description: 'Linked cards and bank accounts' },
        { id: 'open-banking', label: 'Open Banking', component: OpenBankingView, icon: Lock, description: 'Secure open banking APIs' },
        { id: 'open-banking-fapi', label: 'Open Banking FAPI', component: OpenBankingFapiView, icon: Shield, description: 'Financial-grade API compliance' },
        { id: 'ofx-statement', label: 'OFX Statement Viewer', component: OFXStatementViewer, icon: FileText, description: 'Parse and view OFX statements' },
        { id: 'crypto-view', label: 'Crypto View', component: CryptoView, icon: Zap, description: 'Digital asset portfolio and tracking' }
      ]
    },
    {
      name: 'Alpaca & Trading',
      icon: TrendingUp,
      items: [
        { id: 'alpaca-broker', label: 'Alpaca Broker', component: AlpacaBrokerView, icon: Briefcase, description: 'Alpaca brokerage integration' },
        { id: 'alpaca-trading', label: 'Trading Terminal', component: AlpacaTradingTerminal, icon: TrendingUp, description: 'Advanced stock & crypto trading' },
        { id: 'alpaca-accounts', label: 'Accounts Manager', component: AlpacaAccountsManager, icon: Users, description: 'Manage Alpaca sub-accounts' },
        { id: 'alpaca-wallets', label: 'Crypto Wallets', component: AlpacaCryptoWalletsView, icon: Zap, description: 'Alpaca-hosted crypto wallets' },
        { id: 'alpaca-funding', label: 'Funding Hub', component: AlpacaFundingHub, icon: DollarSign, description: 'ACH and wire transfers' },
        { id: 'alpaca-ipo', label: 'IPO Marketplace', component: AlpacaIpoMarketplaceView, icon: Layers, description: 'Participate in public offerings' },
        { id: 'alpaca-journals', label: 'Journals', component: AlpacaJournalsView, icon: BookOpen, description: 'Inter-account journal transfers' },
        { id: 'alpaca-rebalancing', label: 'Rebalancing', component: AlpacaRebalancingView, icon: RefreshCw, description: 'Automated portfolio rebalancing' },
        { id: 'alpaca-reporting', label: 'Reporting', component: AlpacaReportingView, icon: BarChart2, description: 'Tax and transaction reports' },
        { id: 'alpaca-tokenization', label: 'Tokenization', component: AlpacaTokenizationView, icon: Cpu, description: 'Tokenize real-world assets' },
        { id: 'btc-swing-trading', label: 'BTC Swing Trading', component: BtcSwingTradingNotebook, icon: BookOpen, description: 'Bitcoin swing trading notebook' },
        { id: 'tqqq-algorithm', label: 'TQQQ Algorithm', component: TqqqAlgorithmTerminal, icon: Cpu, description: 'TQQQ algorithmic trading terminal' },
        { id: 'trading-bots', label: 'Trading Bots', component: TradingBotsView, icon: Zap, description: 'Automated trading strategies' },
        { id: 'investments', label: 'Investments View', component: InvestmentsView, icon: TrendingUp, description: 'Portfolio performance tracking' },
        { id: 'investment-portfolio', label: 'Investment Portfolio', component: InvestmentPortfolio, icon: Briefcase, description: 'Asset allocation and metrics' },
        { id: 'investments-portfolio-alt', label: 'Investments Portfolio Alt', component: InvestmentsPortfolio, icon: Layers, description: 'Alternative investments' }
      ]
    },
    {
      name: 'Bridges & Integrations',
      icon: RefreshCw,
      items: [
        { id: 'citi-alpaca-bridge', label: 'Citi-Alpaca Bridge', component: CitiAlpacaBridgeView, icon: RefreshCw, description: 'Bridge Citi Treasury with Alpaca' },
        { id: 'plaid-alpaca-bridge', label: 'Plaid-Alpaca Bridge', component: PlaidAlpacaBridgeView, icon: RefreshCw, description: 'Bridge Plaid accounts with Alpaca' },
        { id: 'real-estate-alpaca', label: 'Real Estate Alpaca Bridge', component: RealEstateAlpacaBridge, icon: RefreshCw, description: 'Bridge real estate with Alpaca' },
        { id: 'sovereign-market-takeover', label: 'Sovereign Market Takeover', component: SovereignMarketTakeoverDashboard, icon: Globe, description: 'Sovereign market takeover dashboard' },
        { id: 'stripe-alpaca-bridge', label: 'Stripe-Alpaca Bridge', component: StripeAlpacaBridgeView, icon: RefreshCw, description: 'Bridge Stripe payments with Alpaca' },
        { id: 'tax-lien-treasury', label: 'Tax Lien Treasury Bridge', component: TaxLienModernTreasuryBridge, icon: RefreshCw, description: 'Bridge tax liens with Modern Treasury' },
        { id: 'krypto-bridge', label: 'Krypto Bridge Widget', component: KryptoBridgeWidget, icon: Zap, description: 'Cross-chain crypto bridge' },
        { id: 'plaid-link', label: 'Plaid Link', component: PlaidLink, icon: Landmark, description: 'Connect bank accounts via Plaid' },
        { id: 'plaid-link-button', label: 'Plaid Link Button', component: PlaidLinkButton, icon: Landmark, description: 'Plaid authentication trigger' }
      ]
    },
    {
      name: 'Citi Treasury & Sovereign',
      icon: Shield,
      items: [
        { id: 'citi-gateway', label: 'Citi Gateway', component: CitiGateway, icon: Landmark, description: 'Citi Connect API gateway' },
        { id: 'citi-partner-hub', label: 'Citi Partner Hub', component: CitiPartnerHub, icon: Users, description: 'Citi partner ecosystem' },
        { id: 'citi-treasury-hub', label: 'Citi Treasury Hub', component: CitiTreasuryHub, icon: Briefcase, description: 'Citi treasury management' },
        { id: 'citi-sovereign-ledger', label: 'Citi Sovereign Ledger', component: CitiSovereignLedger, icon: Globe, description: 'Citi sovereign ledger integration' },
        { id: 'citi-connect-initiation', label: 'Citi Connect Initiation', component: CitiConnectInitiation, icon: Send, description: 'Initiate Citi Connect payments' },
        { id: 'citi-connect-inquiry', label: 'Citi Connect Inquiry', component: CitiConnectInquiry, icon: Search, description: 'Inquire Citi Connect status' },
        { id: 'citi-connect-notifications', label: 'Citi Connect Notifications', component: CitiConnectNotifications, icon: MessageSquare, description: 'Citi Connect webhook notifications' },
        { id: 'citi-decryption', label: 'Citi Decryption Utility', component: CitiDecryptionUtility, icon: Lock, description: 'Decrypt Citi API payloads' },
        { id: 'citi-uk-payments', label: 'Citi UK Payments', component: CitiUkInternationalPayments, icon: Globe, description: 'Citi UK international payments' },
        { id: 'sovereign-dashboard', label: 'Sovereign Dashboard', component: SovereignDashboard, icon: Shield, description: 'Sovereign wealth dashboard' },
        { id: 'sovereign-chat', label: 'Sovereign Chat', component: SovereignChat, icon: MessageSquare, description: 'AI-powered sovereign chat assistant' },
        { id: 'sovereign-deal-audit', label: 'Sovereign Deal Audit', component: SovereignDealAudit, icon: FileText, description: 'Audit sovereign business deals' },
        { id: 'sovereign-intelligence', label: 'Sovereign Intelligence', component: SovereignIntelligenceView, icon: Cpu, description: 'Sovereign intelligence feed' },
        { id: 'sovereign-handshake', label: 'Sovereign Org Handshake', component: SovereignOrgHandshake, icon: Users, description: 'Sovereign organization handshake' },
        { id: 'sovereign-sentry', label: 'Sovereign Sentry Engine', component: SovereignSentryEngine, icon: Shield, description: 'Sovereign threat detection' },
        { id: 'sovereign-iframe', label: 'Sovereign Iframe', component: SovereignIframe, icon: Globe, description: 'Sovereign external portal iframe' }
      ]
    },
    {
      name: 'Aquarius & AI Studio',
      icon: Sparkles,
      items: [
        { id: 'aquarius-dashboard', label: 'Aquarius Dashboard', component: AquariusDashboard, icon: Sparkles, description: 'Aquarius AI command center' },
        { id: 'aquarius-architect', label: 'Aquarius Architect', component: AquariusArchitectView, icon: Cpu, description: 'Aquarius system architect' },
        { id: 'aquarius-auditor', label: 'Aquarius Auditor', component: AquariusAuditorView, icon: Shield, description: 'Aquarius compliance auditor' },
        { id: 'aquarius-creative', label: 'Aquarius Creative Suite', component: AquariusCreativeSuite, icon: Sparkles, description: 'Aquarius creative content suite' },
        { id: 'aquarius-ghost', label: 'Aquarius Ghost View', component: AquariusGhostView, icon: Eye, description: 'Aquarius ghost mode analytics' },
        { id: 'aquarius-institutional', label: 'Aquarius Institutional Hub', component: AquariusInstitutionalHub, icon: Briefcase, description: 'Aquarius institutional portal' },
        { id: 'aquarius-voice', label: 'Aquarius Live Voice', component: AquariusLiveVoice, icon: Radio, description: 'Aquarius real-time voice agent' },
        { id: 'ai-ad-studio', label: 'AI Ad Studio', component: AIAdStudioView, icon: Sparkles, description: 'AI-powered ad generation' },
        { id: 'ai-advisor', label: 'AI Advisor', component: AIAdvisorView, icon: MessageSquare, description: 'AI financial advisor' },
        { id: 'ai-insights', label: 'AI Insights', component: AIInsights, icon: Zap, description: 'AI-driven financial insights' },
        { id: 'aria-comms', label: 'Aria Comms', component: AriaComms, icon: MessageSquare, description: 'Aria communications hub' },
        { id: 'gemini-live', label: 'Gemini Live Portal', component: GeminiLivePortal, icon: Radio, description: 'Gemini Live API portal' },
        { id: 'gemini-key', label: 'Gemini Key Modal', component: GeminiKeyModal, icon: Key, description: 'Manage Gemini API keys' },
        { id: 'neural-tools', label: 'Neural Tools', component: NeuralToolsView, icon: Cpu, description: 'Advanced neural network utilities' },
        { id: 'intelligence-hub', label: 'Intelligence Hub', component: IntelligenceHubView, icon: Sparkles, description: 'Central intelligence repository' }
      ]
    },
    {
      name: 'Government & Compliance',
      icon: Landmark,
      items: [
        { id: 'gov-api-dashboard', label: 'Government API Dashboard', component: GovernmentApiDashboard, icon: Landmark, description: 'Government API gateway' },
        { id: 'gis-property-map', label: 'GIS Property Map', component: GisPropertyMap, icon: Map, description: 'GIS property map visualizer' },
        { id: 'irs-tax-filing', label: 'IRS Tax Filing', component: IrsTaxFiling, icon: FileText, description: 'IRS tax filing assistant' },
        { id: 'sec-filing-viewer', label: 'SEC Filing Viewer', component: SecFilingViewer, icon: FileText, description: 'SEC filing viewer and parser' },
        { id: 'political-compliance', label: 'Political Compliance', component: PoliticalComplianceView, icon: Shield, description: 'Political compliance tracker' },
        { id: 'contractor-lobbying', label: 'Contractor Lobbying List', component: ContractorLobbyingList, icon: Users, description: 'Contractor lobbying database' },
        { id: 'florida-voter', label: 'Florida Voter View', component: FloridaVoterView, icon: Users, description: 'Florida voter registration analytics' },
        { id: 'impeachment-generator', label: 'Impeachment Generator', component: ImpeachmentGenerator, icon: FileText, description: 'Impeachment article generator' },
        { id: 'injustice-dashboard', label: 'Injustice Dashboard', component: InjusticeDashboard, icon: Shield, description: 'Injustice and civil rights tracker' },
        { id: 'public-aid-calculator', label: 'Public Aid Calculator', component: PublicAidCalculator, icon: DollarSign, description: 'Public aid eligibility calculator' },
        { id: 'war-appropriations', label: 'War Appropriations Tracker', component: WarAppropriationsTracker, icon: Activity, description: 'War appropriations tracker' },
        { id: 'admin-audit', label: 'Administration Audit', component: AdministrationAudit, icon: FileText, description: 'Administration audit trail' }
      ]
    },
    {
      name: 'Real Estate & Tax Liens',
      icon: Map,
      items: [
        { id: 'property-marketplace', label: 'Property Marketplace', component: PropertyMarketplace, icon: Map, description: 'Real estate property marketplace' },
        { id: 'deed-registrar', label: 'Deed Registrar', component: DeedRegistrar, icon: FileText, description: 'Deed registrar and title transfer' },
        { id: 'escrow-manager', label: 'Escrow Manager', component: EscrowManager, icon: Lock, description: 'Escrow manager and smart contracts' },
        { id: 'tax-lien-auctions', label: 'Tax Lien Auctions', component: TaxLienAuctions, icon: DollarSign, description: 'Tax lien auctions and bidding' },
        { id: 'foreclosure-tracker', label: 'Foreclosure Tracker', component: ForeclosureTracker, icon: Activity, description: 'Foreclosure tracker and analytics' }
      ]
    },
    {
      name: 'Enterprise & Security',
      icon: Shield,
      items: [
        { id: 'corporate-command', label: 'Corporate Command', component: CorporateCommandView, icon: Briefcase, description: 'Corporate command center' },
        { id: 'identity-citadel', label: 'Identity Citadel', component: IdentityCitadelView, icon: Shield, description: 'Identity citadel and authentication' },
        { id: 'security-orchestrator', label: 'Security Orchestrator', component: SecurityOrchestratorView, icon: Shield, description: 'Security orchestrator and SIEM' },
        { id: 'security-view', label: 'Security View', component: SecurityView, icon: Lock, description: 'Security settings and logs' },
        { id: 'entra-swarm', label: 'Entra Swarm Manager', component: EntraSwarmManager, icon: Cpu, description: 'Entra swarm manager' },
        { id: 'azure-apps', label: 'Azure Apps View', component: AzureAppsView, icon: Layers, description: 'Azure applications manager' },
        { id: 'gcp-inventory', label: 'GCP Inventory View', component: GcpInventoryView, icon: Layers, description: 'GCP inventory manager' },
        { id: 'astra-db', label: 'Astra DB Quickstart', component: AstraDBQuickstart, icon: Database, description: 'Astra DB quickstart guide' },
        { id: 'modern-treasury', label: 'Modern Treasury Ledger', component: ModernTreasuryLedgerHub, icon: Landmark, description: 'Modern Treasury ledger hub' },
        { id: 'stripe-treasury', label: 'Stripe Treasury Manager', component: StripeTreasuryManager, icon: Landmark, description: 'Stripe Treasury manager' },
        { id: 'trust-registry', label: 'Trust Registry', component: TrustRegistryView, icon: Shield, description: 'Trust registry and compliance' },
        { id: 'jwe-jws-verifier', label: 'JWE/JWS Verifier', component: JweJwsVerifier, icon: Lock, description: 'JWE/JWS signature verifier' },
        { id: 'nfc-validator', label: 'NFC Validator', component: NFCValidator, icon: Zap, description: 'NFC validator and reader' },
        { id: 'recovery-mesh', label: 'Recovery Mesh', component: RecoveryMeshView, icon: RefreshCw, description: 'Recovery mesh and backup' },
        { id: 'billing-identity', label: 'Billing Identity', component: BillingIdentityView, icon: Shield, description: 'Billing identity and verification' },
        { id: 'settings-view', label: 'Settings View', component: SettingsView, icon: Settings, description: 'System settings and configuration' }
      ]
    },
    {
      name: 'Advanced Tech & Nexus',
      icon: Cpu,
      items: [
        { id: 'quantum-weaver', label: 'Quantum Weaver', component: QuantumWeaverView, icon: Cpu, description: 'Quantum weaver and cryptography' },
        { id: 'universe-3d', label: 'Universe 3D', component: Universe3D, icon: Globe, description: 'Universe 3D visualizer' },
        { id: 'universe-graph', label: 'Universe Graph', component: UniverseGraphVisualizer, icon: Layers, description: 'Universe graph visualizer' },
        { id: 'growth-nexus', label: 'Growth Nexus', component: GrowthNexus, icon: TrendingUp, description: 'Growth nexus and analytics' },
        { id: 'nexus-builder', label: 'Nexus Builder', component: NexusBuilder, icon: Cpu, description: 'Nexus builder and orchestrator' },
        { id: 'wealth-nexus', label: 'Wealth Nexus', component: WealthNexusView, icon: DollarSign, description: 'Wealth nexus and allocation' },
        { id: 'workspace-nexus', label: 'Workspace Nexus', component: WorkspaceNexusView, icon: Briefcase, description: 'Workspace nexus and collaboration' },
        { id: 'machine-view', label: 'Machine View', component: MachineView, icon: Cpu, description: 'Machine view and telemetry' },
        { id: 'fleet-app', label: 'Fleet App', component: FleetAppView, icon: Activity, description: 'Fleet app and logistics' },
        { id: 'data-ingest', label: 'Data Ingest', component: DataIngestView, icon: Database, description: 'Data ingest and ETL pipelines' },
        { id: 'developer-view', label: 'Developer View', component: DeveloperView, icon: Settings, description: 'Developer settings and console' },
        { id: 'api-integration', label: 'API Integration', component: APIIntegrationView, icon: Zap, description: 'API integration and webhooks' },
        { id: 'api-keys', label: 'API Keys', component: APIKeysView, icon: Key, description: 'Manage API keys' },
        { id: 'feature-palette', label: 'Feature Palette', component: FeaturePalette, icon: Sparkles, description: 'Feature palette and customization' },
        { id: 'gas-price-correlation', label: 'Gas Price Correlation', component: GasPriceCorrelation, icon: Activity, description: 'Gas price correlation analytics' }
      ]
    },
    {
      name: 'Socio-Economic & Vision',
      icon: Globe,
      items: [
        { id: 'financial-democracy', label: 'Financial Democracy', component: FinancialDemocracyView, icon: Users, description: 'Financial democracy and voting' },
        { id: 'impact-tracker', label: 'Impact Tracker', component: ImpactTracker, icon: Activity, description: 'Socio-economic impact tracker' },
        { id: 'wealth-distribution', label: 'Wealth Distribution', component: WealthDistributionChart, icon: BarChart2, description: 'Wealth distribution chart' },
        { id: 'wealth-timeline', label: 'Wealth Timeline', component: WealthTimeline, icon: TrendingUp, description: 'Wealth timeline and projections' },
        { id: 'the-vision', label: 'The Vision', component: TheVisionView, icon: Eye, description: 'The Vision and roadmap' },
        { id: 'story-viewer', label: 'Story Viewer', component: StoryViewer, icon: BookOpen, description: 'Story viewer and lore' },
        { id: 'token-mint', label: 'Token Mint', component: HoKTokenMint, icon: Zap, description: 'HoK token minting' },
        { id: 'token-issuance', label: 'Token Issuance', component: TokenIssuanceView, icon: Layers, description: 'Token issuance and management' },
        { id: 'marketing-automation', label: 'Marketing Automation', component: MarketingAutomationView, icon: Sparkles, description: 'Marketing automation and campaigns' },
        { id: 'marketplace', label: 'Marketplace', component: MarketplaceView, icon: Briefcase, description: 'Marketplace and integrations' },
        { id: 'integrations-marketplace', label: 'Integrations Marketplace', component: IntegrationsMarketplaceView, icon: Layers, description: 'Integrations marketplace' },
        { id: 'portal-handshake', label: 'Portal Handshake', component: PortalHandshake, icon: Users, description: 'Portal handshake and federation' },
        { id: 'portal-hub', label: 'Portal Hub', component: PortalHubView, icon: Layers, description: 'Portal hub and dashboard' },
        { id: 'privacy-guardian', label: 'Privacy Guardian', component: PrivacyGuardianView, icon: Shield, description: 'Privacy guardian and settings' },
        { id: 'personalization', label: 'Personalization', component: PersonalizationView, icon: Settings, description: 'Personalization and themes' },
        { id: 'voice-control', label: 'Voice Control', component: VoiceControl, icon: Radio, description: 'Voice control and commands' },
        { id: 'wallet-connect', label: 'Wallet Connect', component: WalletConnectModal, icon: Zap, description: 'Wallet connect modal' },
        { id: 'card-customization', label: 'Card Customization', component: CardCustomizationView, icon: Sparkles, description: 'Card customization and design' }
      ]
    }
  ], []);

  // Flattened list of all items for search
  const allItems = useMemo(() => {
    return categories.flatMap(cat => cat.items);
  }, [categories]);

  // Filtered items based on search query
  const filteredItems = useMemo(() => {
    if (!searchQuery) return [];
    return allItems.filter(item =>
      item.label.toLowerCase().includes(searchQuery.toLowerCase()) ||
      item.description.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [searchQuery, allItems]);

  // Find active component
  const ActiveComponent = useMemo(() => {
    if (!activeLocalView) return null;
    const found = allItems.find(item => item.id === activeLocalView);
    return found ? found.component : null;
  }, [activeLocalView, allItems]);

  const handleViewSelect = (id: string) => {
    setActiveLocalView(id);
    // If it's a core view, sync with context
    if (Object.values(View).includes(id as any)) {
      setView(id as View);
    }
    setSearchQuery('');
  };

  return (
    <div className="flex h-screen bg-black text-gray-100 overflow-hidden">
      {/* Sidebar */}
      <div
        className={`${
          sidebarOpen ? 'w-80' : 'w-0 md:w-20'
        } transition-all duration-300 bg-gray-950 border-r border-gray-900 flex flex-col h-full z-30 relative overflow-hidden`}
      >
        {/* Sidebar Header */}
        <div className="p-6 border-b border-gray-900 flex items-center justify-between">
          {sidebarOpen ? (
            <div>
              <h2 className="text-2xl font-black tracking-tighter text-white uppercase">Oko Control</h2>
              <p className="text-xs text-gray-500 font-mono">v2.4.0-Sovereign</p>
            </div>
          ) : (
            <Compass className="w-8 h-8 text-cyan-500 mx-auto" />
          )}
        </div>

        {/* Search Bar */}
        {sidebarOpen && (
          <div className="p-4 border-b border-gray-900">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
              <input
                type="text"
                placeholder="Search 100+ views..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-gray-900 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors"
              />
            </div>
          </div>
        )}

        {/* Categories / Navigation */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {searchQuery ? (
            <div className="space-y-2">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-wider px-2">Search Results</p>
              {filteredItems.length > 0 ? (
                filteredItems.map(item => (
                  <button
                    key={item.id}
                    onClick={() => handleViewSelect(item.id)}
                    className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-left transition-all ${
                      activeLocalView === item.id
                        ? 'bg-cyan-950/50 border border-cyan-800 text-cyan-400'
                        : 'hover:bg-gray-900 text-gray-400 hover:text-white border border-transparent'
                    }`}
                  >
                    <item.icon className="w-4 h-4 shrink-0" />
                    <div className="truncate">
                      <p className="text-sm font-bold">{item.label}</p>
                      <p className="text-xs text-gray-500 truncate">{item.description}</p>
                    </div>
                  </button>
                ))
              ) : (
                <p className="text-sm text-gray-500 px-2">No views found matching "{searchQuery}"</p>
              )}
            </div>
          ) : (
            categories.map(cat => {
              const CatIcon = cat.icon;
              const isSelected = selectedCategory === cat.name;

              return (
                <div key={cat.name} className="space-y-1">
                  <button
                    onClick={() => sidebarOpen && setSelectedCategory(isSelected ? '' : cat.name)}
                    className={`w-full flex items-center justify-between px-3 py-2 rounded-xl text-left transition-colors ${
                      isSelected ? 'text-white bg-gray-900/50' : 'text-gray-500 hover:text-gray-300'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <CatIcon className="w-4 h-4 shrink-0" />
                      {sidebarOpen && <span className="text-xs font-bold uppercase tracking-wider">{cat.name}</span>}
                    </div>
                    {sidebarOpen && <ChevronRight className={`w-4 h-4 transition-transform ${isSelected ? 'rotate-90' : ''}`} />}
                  </button>

                  {sidebarOpen && isSelected && (
                    <div className="pl-4 space-y-1 mt-1 border-l border-gray-900 ml-5">
                      {cat.items.map(item => (
                        <button
                          key={item.id}
                          onClick={() => handleViewSelect(item.id)}
                          className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg text-left text-xs transition-all ${
                            activeLocalView === item.id
                              ? 'bg-cyan-950/30 text-cyan-400 font-bold'
                              : 'text-gray-400 hover:text-white hover:bg-gray-900/30'
                          }`}
                        >
                          <item.icon className="w-3.5 h-3.5 shrink-0" />
                          <span className="truncate">{item.label}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </div>
              );
            })
          )}
        </div>

        {/* Sidebar Footer */}
        {sidebarOpen && (
          <div className="p-4 border-t border-gray-900 bg-gray-950/80 backdrop-blur-sm">
            <div className="flex items-center gap-3 p-2 rounded-xl bg-gray-900/50 border border-gray-800">
              <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <div className="text-xs">
                <p className="font-bold text-white">Quantum Bridge Active</p>
                <p className="text-gray-500">All nodes synchronized</p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Main Content Area */}
      <div className="flex-1 flex flex-col h-full overflow-hidden bg-black">
        {/* Top Header */}
        <header className="h-20 border-b border-gray-900 px-8 flex items-center justify-between shrink-0 bg-gray-950/40 backdrop-blur-md z-20">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 rounded-xl bg-gray-900 border border-gray-800 text-gray-400 hover:text-white transition-colors"
            >
              {sidebarOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight uppercase">
                {activeLocalView
                  ? allItems.find(item => item.id === activeLocalView)?.label || 'Flow Control'
                  : 'Flow Control'}
              </h1>
              <p className="text-xs text-gray-500">
                {activeLocalView
                  ? allItems.find(item => item.id === activeLocalView)?.description || 'Monitoring and routing capital across the global mesh.'
                  : 'Monitoring and routing capital across the global mesh.'}
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="flex items-center gap-3">
            <button
              onClick={() => handleViewSelect('dashboard')}
              className="px-4 py-2 rounded-xl bg-gray-900 border border-gray-800 text-xs font-bold text-gray-300 hover:text-white hover:border-gray-700 transition-all"
            >
              Dashboard
            </button>
            <button
              onClick={() => handleViewSelect('global-ledger')}
              className="px-4 py-2 rounded-xl bg-cyan-950/50 border border-cyan-800 text-xs font-bold text-cyan-400 hover:bg-cyan-900/50 transition-all"
            >
              Global Ledger
            </button>
          </div>
        </header>

        {/* View Container */}
        <div className="flex-1 overflow-y-auto p-8 relative">
          <ErrorBoundary>
            {ActiveComponent ? (
              <div className="animate-in fade-in duration-500">
                <ActiveComponent setActiveView={handleViewSelect} />
              </div>
            ) : (
              /* Default Grid Dashboard when no view is active */
              <div className="space-y-8 animate-in fade-in duration-700">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="p-6 rounded-2xl bg-gradient-to-br from-cyan-950/20 to-transparent border border-cyan-900/50">
                    <Globe className="w-8 h-8 text-cyan-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Global Ledger</h3>
                    <p className="text-sm text-gray-400 mb-4">Monitor and audit sovereign transactions across the global mesh network.</p>
                    <button
                      onClick={() => handleViewSelect('global-ledger')}
                      className="text-xs font-bold text-cyan-400 hover:text-cyan-300 flex items-center gap-1"
                    >
                      Launch View <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/20 to-transparent border border-indigo-900/50">
                    <TrendingUp className="w-8 h-8 text-indigo-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Alpaca Trading</h3>
                    <p className="text-sm text-gray-400 mb-4">Access advanced stock, crypto, and algorithmic trading terminals.</p>
                    <button
                      onClick={() => handleViewSelect('alpaca-trading')}
                      className="text-xs font-bold text-indigo-400 hover:text-indigo-300 flex items-center gap-1"
                    >
                      Launch View <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>

                  <div className="p-6 rounded-2xl bg-gradient-to-br from-purple-950/20 to-transparent border border-purple-900/50">
                    <Sparkles className="w-8 h-8 text-purple-400 mb-4" />
                    <h3 className="text-lg font-bold text-white mb-1">Aquarius AI</h3>
                    <p className="text-sm text-gray-400 mb-4">Leverage state-of-the-art AI agents for compliance, creative, and advisory tasks.</p>
                    <button
                      onClick={() => handleViewSelect('aquarius-dashboard')}
                      className="text-xs font-bold text-purple-400 hover:text-purple-300 flex items-center gap-1"
                    >
                      Launch View <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>

                {/* Category Grid */}
                <div className="space-y-4">
                  <h2 className="text-xl font-black text-white uppercase tracking-tight">Explore System Modules</h2>
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                    {categories.map(cat => {
                      const CatIcon = cat.icon;
                      return (
                        <button
                          key={cat.name}
                          onClick={() => {
                            setSelectedCategory(cat.name);
                            setSidebarOpen(true);
                          }}
                          className="p-5 rounded-xl bg-gray-950 border border-gray-900 hover:border-gray-800 text-left transition-all flex items-start gap-4 group"
                        >
                          <div className="p-3 rounded-lg bg-gray-900 text-gray-400 group-hover:text-white transition-colors">
                            <CatIcon className="w-5 h-5" />
                          </div>
                          <div>
                            <h4 className="font-bold text-white text-sm group-hover:text-cyan-400 transition-colors">{cat.name}</h4>
                            <p className="text-xs text-gray-500 mt-1">{cat.items.length} active modules</p>
                          </div>
                        </button>
                      );
                    })}
                  </div>
                </div>
              </div>
            )}
          </ErrorBoundary>
        </div>
      </div>
    </div>
  );
};

export default FlowController;