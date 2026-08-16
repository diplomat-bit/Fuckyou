import React, { useState, useContext, useMemo, useEffect, useReducer, useCallback } from 'react';
import { useMsal } from "@azure/msal-react";

// Contexts & Providers
import { DataContext } from './context/DataContext';
import { useFirebase } from './context/FirebaseContext';

// Services & Security
import { lastBossService } from './services/LastBossService';
import { securityService } from './services/SecurityService';

// Types & Constants
import { View, AppView } from './types';
import { SOVEREIGN_APPS, NAV_ITEMS } from './constants';

// Core Layout Components
import Header from './components/Header';
import Sidebar from './components/Sidebar';
import TabManager from './components/TabManager';
import SovereignIframe from './components/SovereignIframe';
import ErrorBoundary from './components/ErrorBoundary';
import PortalHandshake from './components/PortalHandshake';

// App Views
import AquariusDashboard from './components/AquariusDashboard';
import AquariusArchitectView from './components/AquariusArchitectView';
import AquariusGhostView from './components/AquariusGhostView';
import AquariusCreativeSuite from './components/AquariusCreativeSuite';
import AquariusLiveVoice from './components/AquariusLiveVoice';
import AquariusAuditorView from './components/AquariusAuditorView';
import GeminiLivePortal from './components/GeminiLivePortal';
import IdentityCitadelView from './components/IdentityCitadelView';
import RecoveryMeshView from './components/RecoveryMeshView';
import PrivacyGuardianView from './components/PrivacyGuardianView';
import TrustRegistryView from './components/TrustRegistryView';
import FlowController from './components/FlowController';
import GrowthNexus from './components/GrowthNexus';
import TokenIssuanceView from './components/TokenIssuanceView';
import MarketingAutomationView from './components/MarketingAutomationView';
import AquariusInstitutionalHub from './components/AquariusInstitutionalHub';
import IntelligenceHubView from './components/IntelligenceHubView';
import NexusBuilder from './components/NexusBuilder';
import IntegrationsMarketplaceView from './components/IntegrationsMarketplaceView';
import SettingsView from './components/SettingsView';
import DataIngestView from './components/DataIngestView';
import TheVisionView from './components/TheVisionView';
import RewardsView from './components/RewardsView';
import PortalHubView from './components/PortalHubView';
import NeuralToolsView from './components/NeuralToolsView';
import BillingIdentityView from './components/BillingIdentityView';
import AzureAppsView from './components/AzureAppsView';
import FleetAppView from './components/FleetAppView';
import WorkspaceNexusView from './components/WorkspaceNexusView';
import GcpInventoryView from './components/GcpInventoryView';
import JweJwsVerifier from './components/JweJwsVerifier';
import FloridaVoterView from './components/FloridaVoterView';
import SovereignIntelligenceView from './components/SovereignIntelligenceView';
import CitiUkInternationalPayments from './components/CitiUkInternationalPayments';
import SovereignOrgHandshake from './components/SovereignOrgHandshake';
import GlobalLedgerView from './components/GlobalLedgerView';
import TransactionsView from './components/TransactionsView';
import SendMoneyView from './components/SendMoneyView';
import BudgetsView from './components/BudgetsView';
import GoalsView from './components/GoalsView';
import TradingBotsView from './components/TradingBotsView';
import APIKeysView from './components/APIKeysView';
import PaymentMethodsView from './components/PaymentMethodsView';
import WealthNexusView from './components/WealthNexusView';
import InvestmentsView from './components/InvestmentsView';
import QuantumWeaverView from './components/QuantumWeaverView';
import CryptoView from './components/CryptoView';
import InvestmentPortfolio from './components/InvestmentPortfolio';
import CitiGateway from './components/CitiGateway';
import CitiConnectInitiation from './components/CitiConnectInitiation';
import CitiConnectInquiry from './components/CitiConnectInquiry';
import CitiConnectNotifications from './components/CitiConnectNotifications';
import CitiTreasuryHub from './components/CitiTreasuryHub';
import OpenBankingFapiView from './components/OpenBankingFapiView';
import CitiPartnerHub from './components/CitiPartnerHub';
import AstraDBQuickstart from './components/AstraDBQuickstart';
import UniverseGraphVisualizer from './components/UniverseGraphVisualizer';
import ImpeachmentGenerator from './components/ImpeachmentGenerator';
import ContractorLobbyingList from './components/ContractorLobbyingList';
import SovereignSentryEngine from './components/SovereignSentryEngine';
import AriaComms from './components/AriaComms';
import ModernTreasuryLedgerHub from './components/ModernTreasuryLedgerHub';
import AlpacaBrokerView from './components/AlpacaBrokerView';
import { AlpacaAccountsManager } from './components/alpaca/AlpacaAccountsManager';
import { AlpacaTradingTerminal } from './components/alpaca/AlpacaTradingTerminal';
import { AlpacaFundingHub } from './components/alpaca/AlpacaFundingHub';
import { AlpacaCryptoWalletsView } from './components/alpaca/AlpacaCryptoWalletsView';
import { AlpacaJournalsView } from './components/alpaca/AlpacaJournalsView';
import { AlpacaRebalancingView } from './components/alpaca/AlpacaRebalancingView';
import { AlpacaTokenizationView } from './components/alpaca/AlpacaTokenizationView';
import { AlpacaIpoMarketplaceView } from './components/alpaca/AlpacaIpoMarketplaceView';
import { AlpacaReportingView } from './components/alpaca/AlpacaReportingView';
import { TqqqAlgorithmTerminal } from './components/alpaca/TqqqAlgorithmTerminal';
import PlaidLinkButton from './components/PlaidLinkButton';
import StripeTreasuryManager from './components/StripeTreasuryManager';
import AdministrationAudit from './components/AdministrationAudit';
import SovereignFilesVault from './components/SovereignFilesVault';
import AIAdStudioView from './components/AIAdStudioView';
import AIAdvisorView from './components/AIAdvisorView';
import AIInsights from './components/AIInsights';
import { BtcSwingTradingNotebook } from './components/alpaca/BtcSwingTradingNotebook';
import CitiAlpacaBridgeView from './components/bridges/CitiAlpacaBridgeView';
import PlaidAlpacaBridgeView from './components/bridges/PlaidAlpacaBridgeView';
import RealEstateAlpacaBridge from './components/bridges/RealEstateAlpacaBridge';
import SovereignMarketTakeoverDashboard from './components/bridges/SovereignMarketTakeoverDashboard';
import StripeAlpacaBridgeView from './components/bridges/StripeAlpacaBridgeView';
import TaxLienModernTreasuryBridge from './components/bridges/TaxLienModernTreasuryBridge';
import CardCustomizationView from './components/CardCustomizationView';
import Card from './components/Card';
import CitiDecryptionUtility from './components/CitiDecryptionUtility';
import CitiSovereignLedger from './components/CitiSovereignLedger';
import CorporateCommandView from './components/CorporateCommandView';
import CreditHealthView from './components/CreditHealthView';
import DeveloperView from './components/DeveloperView';
import EntraSwarmManager from './components/EntraSwarmManager';
import FeaturePalette from './components/FeaturePalette';
import FinancialDemocracyView from './components/FinancialDemocracyView';
import FinancialGoalsView from './components/FinancialGoalsView';
import GasPriceCorrelation from './components/GasPriceCorrelation';
import GeminiKeyModal from './components/GeminiKeyModal';
import GisPropertyMap from './components/government/GisPropertyMap';
import GovernmentApiDashboard from './components/government/GovernmentApiDashboard';
import IrsTaxFiling from './components/government/IrsTaxFiling';
import SecFilingViewer from './components/government/SecFilingViewer';
import HoKTokenMint from './components/HoKTokenMint';
import ImpactTracker from './components/ImpactTracker';
import InjusticeDashboard from './components/InjusticeDashboard';
import KryptoBridgeWidget from './components/KryptoBridgeWidget';
import MachineView from './components/MachineView';
import MarketplaceView from './components/MarketplaceView';
import NFCValidator from './components/NFCValidator';
import OFXStatementViewer from './components/OFXStatementViewer';
import OpenBankingView from './components/OpenBankingView';
import PersonalizationView from './components/PersonalizationView';
import PoliticalComplianceView from './components/PoliticalComplianceView';
import PublicAidCalculator from './components/PublicAidCalculator';
import DeedRegistrar from './components/real-estate/DeedRegistrar';
import EscrowManager from './components/real-estate/EscrowManager';
import PropertyMarketplace from './components/real-estate/PropertyMarketplace';
import RecentTransactions from './components/RecentTransactions';
import SecurityOrchestratorView from './components/SecurityOrchestratorView';
import SecurityView from './components/SecurityView';
import SovereignChat from './components/SovereignChat';
import SovereignDashboard from './components/SovereignDashboard';
import SovereignDealAudit from './components/SovereignDealAudit';
import StoryViewer from './components/StoryViewer';
import ForeclosureTracker from './components/tax-liens/ForeclosureTracker';
import TaxLienAuctions from './components/tax-liens/TaxLienAuctions';
import Universe3D from './components/Universe3D';
import VoiceControl from './components/VoiceControl';
import WalletConnectModal from './components/WalletConnectModal';
import WarAppropriationsTracker from './components/WarAppropriationsTracker';
import WealthDistributionChart from './components/WealthDistributionChart';
import WealthTimeline from './components/WealthTimeline';
import BalanceSummary from './components/BalanceSummary';
import PlaidLink from './components/PlaidLink';
import APIIntegrationView from './components/APIIntegrationView';
import Dashboard from './components/Dashboard';
import InvestmentsPortfolio from './components/InvestmentsPortfolio';
import GriffinMcpView from './components/GriffinMcpView';

interface Tab { id: string; name: string; }
interface ViewProps { openTab: (id: string, name: string) => void; setView: (view: View | AppView) => void; }
interface ComponentConfig { component: React.ComponentType<any>; moduleCode: string; label: string; isProtected?: boolean; }
interface SpaceViewerProps { appId: string; }
interface AppState { openTabs: Tab[]; activeTab: string | null; isSidebarOpen: boolean; systemStatus: 'initializing' | 'ready' | 'error'; bypassAuth: boolean; isDataLoaded: boolean; }
type AppAction = { type: 'OPEN_TAB'; payload: Tab } | { type: 'CLOSE_TAB'; payload: string } | { type: 'SET_ACTIVE_TAB'; payload: string | null } | { type: 'TOGGLE_SIDEBAR' } | { type: 'SET_SIDEBAR'; payload: boolean } | { type: 'SET_SYSTEM_STATUS'; payload: AppState['systemStatus'] } | { type: 'SET_BYPASS_AUTH'; payload: boolean } | { type: 'SET_DATA_LOADED'; payload: boolean };

const COMPONENT_MAP: Record<string, ComponentConfig> = {
    [View.FilesVault]: { component: SovereignFilesVault, moduleCode: 'AQ-FILE-VLT', label: 'Files & Dossier Vault' },
    'files-vault': { component: SovereignFilesVault, moduleCode: 'AQ-FILE-VLT', label: 'Files & Dossier Vault' },
    [View.Dashboard]: { component: AquariusDashboard, moduleCode: 'AQ-CMD-01', label: 'Executive Command' },
    [View.DataIngest]: { component: DataIngestView, moduleCode: 'AQ-ING-02', label: 'Neural Ingest', isProtected: true },
    [View.PortalHub]: { component: PortalHubView, moduleCode: 'AQ-HUB-99', label: 'Sovereign Portal Hub' },
    [View.BillingIdentity]: { component: BillingIdentityView, moduleCode: 'AQ-SEC-LB', label: 'Identity Vault' },
    [View.LegionArchitect]: { component: AquariusArchitectView, moduleCode: 'AQ-LG1-ARC', label: 'Legion I: Architect', isProtected: true },
    [View.LegionGhost]: { component: AquariusGhostView, moduleCode: 'AQ-LG2-GHS', label: 'Legion II: Ghost' },
    [View.LegionVisualizer]: { component: AquariusCreativeSuite, moduleCode: 'AQ-LG3-VIS', label: 'Legion III: Visualizer' },
    [View.LegionVoice]: { component: AquariusLiveVoice, moduleCode: 'AQ-LG4-VOC', label: 'Legion IV: Voice' },
    [View.LegionAuditor]: { component: AquariusAuditorView, moduleCode: 'AQ-LG5-AUD', label: 'Legion V: Auditor' },
    [View.LegionLive]: { component: GeminiLivePortal, moduleCode: 'AQ-LG6-LIV', label: 'Legion VI: Live' },
    [View.IdentityCitadel]: { component: IdentityCitadelView, moduleCode: 'AQ-SEC-CID', label: 'Identity Citadel' },
    [View.RecoveryMesh]: { component: RecoveryMeshView, moduleCode: 'AQ-SEC-MSH', label: 'Recovery Mesh' },
    [View.PrivacyGuardian]: { component: PrivacyGuardianView, moduleCode: 'AQ-SEC-GRD', label: 'Privacy Guardian' },
    [View.TrustRegistry]: { component: TrustRegistryView, moduleCode: 'AQ-SEC-REG', label: 'Trust Registry' },
    [View.GlobalLedger]: { component: GlobalLedgerView, moduleCode: 'AQ-OPS-GLD', label: 'Global Ledger' },
    [View.Transactions]: { component: TransactionsView, moduleCode: 'AQ-OPS-GLD', label: 'Global Ledger' },
    [View.SendMoney]: { component: SendMoneyView, moduleCode: 'AQ-OPS-GLD', label: 'Global Ledger' },
    [View.Budgets]: { component: BudgetsView, moduleCode: 'AQ-OPS-GLD', label: 'Global Ledger' },
    [View.Goals]: { component: GoalsView, moduleCode: 'AQ-OPS-GLD', label: 'Global Ledger' },
    [View.WealthNexus]: { component: WealthNexusView, moduleCode: 'AQ-GTH-NEX', label: 'Wealth Nexus' },
    [View.Investments]: { component: InvestmentsView, moduleCode: 'AQ-GTH-NEX', label: 'Wealth Nexus' },
    [View.Portfolio]: { component: InvestmentPortfolio, moduleCode: 'AQ-GTH-NEX', label: 'Wealth Nexus' },
    [View.QuantumWeaver]: { component: QuantumWeaverView, moduleCode: 'AQ-GTH-NEX', label: 'Wealth Nexus' },
    [View.Crypto]: { component: CryptoView, moduleCode: 'AQ-GTH-NEX', label: 'Wealth Nexus' },
    [View.TradingBots]: { component: TradingBotsView, moduleCode: 'AQ-GTH-NEX', label: 'Wealth Nexus' },
    [View.APIKeys]: { component: APIKeysView, moduleCode: 'AQ-SYS-SET', label: 'Core Settings' },
    [View.PaymentMethods]: { component: PaymentMethodsView, moduleCode: 'AQ-SYS-SET', label: 'Core Settings' },
    [View.TokenIssuance]: { component: TokenIssuanceView, moduleCode: 'AQ-GTH-TKN', label: 'Asset Forge' },
    [View.MarketingAutomation]: { component: MarketingAutomationView, moduleCode: 'AQ-GTH-MKT', label: 'Marketing Hub' },
    [View.InstitutionalHub]: { component: AquariusInstitutionalHub, moduleCode: 'AQ-OPS-HUB', label: 'Nexus Operations' },
    [View.IntelligenceHub]: { component: IntelligenceHubView, moduleCode: 'AQ-OPS-INT', label: 'Intelligence Hub' },
    [View.NeuralTools]: { component: NeuralToolsView, moduleCode: 'AQ-SYS-UTL', label: 'Neural Tools' },
    [View.NexusBuilder]: { component: NexusBuilder, moduleCode: 'AQ-OPS-FRG', label: 'Nexus Forge' },
    [View.IntegrationsMarketplace]: { component: IntegrationsMarketplaceView, moduleCode: 'AQ-OPS-MPK', label: 'Command Integrations' },
    [View.Settings]: { component: SettingsView, moduleCode: 'AQ-SYS-SET', label: 'Core Settings' },
    [View.TheVision]: { component: TheVisionView, moduleCode: 'AQ-SYS-VIS', label: 'The Vision' },
    [View.Rewards]: { component: RewardsView, moduleCode: 'AQ-SYS-REW', label: 'Rewards Hub' },
    [View.CitiGateway]: { component: CitiGateway, moduleCode: 'AQ-CIT-GTW', label: 'Citi Sovereign Gateway' },
    [View.CitiConnectInitiation]: { component: CitiConnectInitiation, moduleCode: 'AQ-CIT-PAY', label: 'Payment Initiation' },
    [View.CitiConnectInquiry]: { component: CitiConnectInquiry, moduleCode: 'AQ-CIT-INQ', label: 'Status Inquiry' },
    [View.CitiConnectNotifications]: { component: CitiConnectNotifications, moduleCode: 'AQ-CIT-NTF', label: 'Push Alerts' },
    [View.CitiTreasury]: { component: CitiTreasuryHub, moduleCode: 'AQ-CIT-TRZ', label: 'Treasury Command' },
    [View.FapiPipeline]: { component: OpenBankingFapiView, moduleCode: 'AQ-OB-FAPI', label: 'FAPI 2.0 Security Pipeline' },
    [View.SovereignOrgHandshake]: { component: SovereignOrgHandshake, moduleCode: 'AQ-SEC-ORG', label: 'Org Handshake' },
    [View.AzureApps]: { component: AzureAppsView, moduleCode: 'AQ-AZR-APP', label: 'Azure Directory' },
    [View.WorkspaceNexus]: { component: WorkspaceNexusView, moduleCode: 'AQ-WK-NEX', label: 'Workspace Nexus' },
    [View.GcpInventory]: { component: GcpInventoryView, moduleCode: 'AQ-GCP-INV', label: 'Cloud Infrastructure' },
    [View.CryptoVerifier]: { component: JweJwsVerifier, moduleCode: 'AQ-SEC-JWE', label: 'JWE / JWS Verifier' },
    [View.FloridaVoter]: { component: FloridaVoterView, moduleCode: 'AQ-FL-VOTE', label: 'FL 2026 Voter Registry' },
    [View.SovereignIntelligence]: { component: SovereignIntelligenceView, moduleCode: 'AQ-SOV-INT', label: 'Sovereign Intelligence' },
    [View.CitiPartnerHub]: { component: CitiPartnerHub, moduleCode: 'AQ-CIT-PRT', label: 'Citi Partner API' },
    [View.CitiUkInternationalPayments]: { component: CitiUkInternationalPayments, moduleCode: 'AQ-CIT-UK-PISP', label: 'Citi UK International Payments' },
    [View.AstraDBQuickstart]: { component: AstraDBQuickstart, moduleCode: 'AQ-DB-AST', label: 'Astra DB Quickstart' },
    [View.UniverseGraph]: { component: UniverseGraphVisualizer, moduleCode: 'AQ-SYS-GRPH', label: 'Universe Graph 3D' },
    [View.ImpeachmentGenerator]: { component: ImpeachmentGenerator, moduleCode: 'AQ-GOV-IMP', label: 'Impeachment Generator' },
    [View.ContractorLobbying]: { component: ContractorLobbyingList, moduleCode: 'AQ-GOV-LBY', label: 'Contractor Lobbying' },
    [View.SentryEngine]: { component: SovereignSentryEngine, moduleCode: 'AQ-SEC-SNT', label: 'Sovereign Sentry' },
    [View.AriaComms]: { component: AriaComms, moduleCode: 'AQ-ARIA-COM', label: 'Aria Neural Comms' },
    [View.ModernTreasuryLedger]: { component: ModernTreasuryLedgerHub, moduleCode: 'AQ-TRZ-LDG', label: 'Modern Treasury Ledger' },
    [View.AlpacaBroker]: { component: AlpacaBrokerView, moduleCode: 'AQ-ALP-BRK', label: 'Alpaca Broker API Suite' },
    [View.AlpacaTqqq]: { component: TqqqAlgorithmTerminal, moduleCode: 'AQ-ALP-TQQQ', label: 'TQQQ AI Quant Strategy' },
    [View.AlpacaAccounts]: { component: AlpacaAccountsManager, moduleCode: 'AQ-ALP-ACC', label: 'Alpaca Account & KYC' },
    [View.AlpacaTrading]: { component: AlpacaTradingTerminal, moduleCode: 'AQ-ALP-TRD', label: 'Alpaca Trading Terminal' },
    [View.AlpacaFunding]: { component: AlpacaFundingHub, moduleCode: 'AQ-ALP-FND', label: 'Alpaca Funding Hub' },
    [View.AlpacaJournals]: { component: AlpacaJournalsView, moduleCode: 'AQ-ALP-JRN', label: 'Alpaca Sovereign Journals' },
    [View.AlpacaRebalancing]: { component: AlpacaRebalancingView, moduleCode: 'AQ-ALP-REB', label: 'Alpaca Rebalancing Engine' },
    [View.AlpacaTokenization]: { component: AlpacaTokenizationView, moduleCode: 'AQ-ALP-RWA', label: 'Alpaca RWA Tokenization' },
    [View.AlpacaIpoMarketplace]: { component: AlpacaIpoMarketplaceView, moduleCode: 'AQ-ALP-IPO', label: 'Alpaca IPO Marketplace' },
    [View.AlpacaCryptoWallets]: { component: AlpacaCryptoWalletsView, moduleCode: 'AQ-ALP-CRY', label: 'Alpaca Crypto Wallets' },
    [View.AlpacaReporting]: { component: AlpacaReportingView, moduleCode: 'AQ-ALP-REP', label: 'Alpaca EOD Reporting' },
    [View.PlaidAlpacaBridge]: { component: () => (
        <div className="space-y-6 text-slate-100">
            <div className="bg-slate-900/80 p-6 rounded-2xl border border-emerald-500/20 backdrop-blur-md">
                <h2 className="text-xl font-bold text-emerald-400 mb-2">Plaid - Alpaca Liquidity Bridge</h2>
                <p className="text-slate-400 text-sm mb-6">Link external depository institutions via Plaid to securely fund Alpaca brokerage accounts instantly via ACH.</p>
                <PlaidLinkButton onSuccess={(token) => console.log('Plaid connected:', token)} />
            </div>
        </div>
    ), moduleCode: 'AQ-BRG-PLD', label: 'Plaid-Alpaca Bridge' },
    [View.StripeAlpacaBridge]: { component: StripeTreasuryManager, moduleCode: 'AQ-BRG-STP', label: 'Stripe-Alpaca Bridge' },
    [View.CitiAlpacaBridge]: { component: CitiTreasuryHub, moduleCode: 'AQ-BRG-CIT', label: 'Citi-Alpaca Bridge' },
    [View.SovereignMarketTakeover]: { component: AlpacaBrokerView, moduleCode: 'AQ-MKT-TAK', label: 'Market Takeover Hub' },
    'administration-audit': { component: AdministrationAudit, moduleCode: 'AQ-ADM-AUD', label: 'Administration Audit' },
    'ai-ad-studio': { component: AIAdStudioView, moduleCode: 'AQ-AI-ADS', label: 'AI Ad Studio' },
    'ai-advisor': { component: AIAdvisorView, moduleCode: 'AQ-AI-ADV', label: 'AI Advisor' },
    'ai-insights': { component: AIInsights, moduleCode: 'AQ-AI-INS', label: 'AI Insights' },
    'btc-swing-trading': { component: BtcSwingTradingNotebook, moduleCode: 'AQ-ALP-BTC', label: 'BTC Swing Trading Notebook' },
    'citi-alpaca-bridge-view': { component: CitiAlpacaBridgeView, moduleCode: 'AQ-BRG-CAB', label: 'Citi-Alpaca Bridge View' },
    'plaid-alpaca-bridge-view': { component: PlaidAlpacaBridgeView, moduleCode: 'AQ-BRG-PAB', label: 'Plaid-Alpaca Bridge View' },
    'real-estate-alpaca-bridge': { component: RealEstateAlpacaBridge, moduleCode: 'AQ-BRG-REB', label: 'Real Estate Alpaca Bridge' },
    'sovereign-market-takeover-dashboard': { component: SovereignMarketTakeoverDashboard, moduleCode: 'AQ-BRG-SMT', label: 'Sovereign Market Takeover Dashboard' },
    'stripe-alpaca-bridge-view': { component: StripeAlpacaBridgeView, moduleCode: 'AQ-BRG-SAB', label: 'Stripe-Alpaca Bridge View' },
    'tax-lien-modern-treasury-bridge': { component: TaxLienModernTreasuryBridge, moduleCode: 'AQ-BRG-TLB', label: 'Tax Lien Modern Treasury Bridge' },
    'card-customization': { component: CardCustomizationView, moduleCode: 'AQ-CRD-CST', label: 'Card Customization' },
    'card': { component: Card, moduleCode: 'AQ-CRD-CRD', label: 'Sovereign Card' },
    'citi-decryption': { component: CitiDecryptionUtility, moduleCode: 'AQ-CIT-DEC', label: 'Citi Decryption Utility' },
    'citi-sovereign-ledger': { component: CitiSovereignLedger, moduleCode: 'AQ-CIT-SLG', label: 'Citi Sovereign Ledger' },
    'corporate-command': { component: CorporateCommandView, moduleCode: 'AQ-CORP-CMD', label: 'Corporate Command' },
    'credit-health': { component: CreditHealthView, moduleCode: 'AQ-CRD-HLT', label: 'Credit Health' },
    'developer': { component: DeveloperView, moduleCode: 'AQ-DEV-DEV', label: 'Developer View' },
    'entra-swarm': { component: EntraSwarmManager, moduleCode: 'AQ-ENT-SWM', label: 'Entra Swarm Manager' },
    'feature-palette': { component: FeaturePalette, moduleCode: 'AQ-SYS-PAL', label: 'Feature Palette' },
    'financial-democracy': { component: FinancialDemocracyView, moduleCode: 'AQ-FIN-DEM', label: 'Financial Democracy' },
    'financial-goals': { component: FinancialGoalsView, moduleCode: 'AQ-FIN-GOL', label: 'Financial Goals' },
    'gas-price-correlation': { component: GasPriceCorrelation, moduleCode: 'AQ-GAS-COR', label: 'Gas Price Correlation' },
    'gemini-key-modal': { component: GeminiKeyModal, moduleCode: 'AQ-GEM-KEY', label: 'Gemini Key Modal' },
    'gis-property-map': { component: GisPropertyMap, moduleCode: 'AQ-GIS-MAP', label: 'GIS Property Map' },
    'government-api-dashboard': { component: GovernmentApiDashboard, moduleCode: 'AQ-GOV-API', label: 'Government API Dashboard' },
    'irs-tax-filing': { component: IrsTaxFiling, moduleCode: 'AQ-IRS-TAX', label: 'IRS Tax Filing' },
    'sec-filing-viewer': { component: SecFilingViewer, moduleCode: 'AQ-SEC-FIL', label: 'SEC Filing Viewer' },
    'hok-token-mint': { component: HoKTokenMint, moduleCode: 'AQ-HOK-MNT', label: 'HoK Token Mint' },
    'impact-tracker': { component: ImpactTracker, moduleCode: 'AQ-IMP-TRK', label: 'Impact Tracker' },
    'injustice-dashboard': { component: InjusticeDashboard, moduleCode: 'AQ-INJ-DSH', label: 'Injustice Dashboard' },
    'krypto-bridge': { component: KryptoBridgeWidget, moduleCode: 'AQ-KRY-BRG', label: 'Krypto Bridge Widget' },
    'machine-view': { component: MachineView, moduleCode: 'AQ-MAC-VIW', label: 'Machine View' },
    'marketplace': { component: MarketplaceView, moduleCode: 'AQ-MKT-PLC', label: 'Marketplace' },
    'nfc-validator': { component: NFCValidator, moduleCode: 'AQ-NFC-VAL', label: 'NFC Validator' },
    'ofx-statement-viewer': { component: OFXStatementViewer, moduleCode: 'AQ-OFX-VIW', label: 'OFX Statement Viewer' },
    'open-banking': { component: OpenBankingView, moduleCode: 'AQ-OB-VIW', label: 'Open Banking View' },
    'personalization': { component: PersonalizationView, moduleCode: 'AQ-SYS-PRZ', label: 'Personalization' },
    'political-compliance': { component: PoliticalComplianceView, moduleCode: 'AQ-POL-CMP', label: 'Political Compliance' },
    'public-aid-calculator': { component: PublicAidCalculator, moduleCode: 'AQ-AID-CAL', label: 'Public Aid Calculator' },
    'deed-registrar': { component: DeedRegistrar, moduleCode: 'AQ-RE-DED', label: 'Deed Registrar' },
    'escrow-manager': { component: EscrowManager, moduleCode: 'AQ-RE-ESC', label: 'Escrow Manager' },
    'property-marketplace': { component: PropertyMarketplace, moduleCode: 'AQ-RE-MKT', label: 'Property Marketplace' },
    'recent-transactions': { component: RecentTransactions, moduleCode: 'AQ-OPS-TXS', label: 'Recent Transactions' },
    'security-orchestrator': { component: SecurityOrchestratorView, moduleCode: 'AQ-SEC-ORC', label: 'Security Orchestrator' },
    'security-view': { component: SecurityView, moduleCode: 'AQ-SEC-VIW', label: 'Security View' },
    'sovereign-chat': { component: SovereignChat, moduleCode: 'AQ-SOV-CHT', label: 'Sovereign Chat' },
    'sovereign-dashboard': { component: SovereignDashboard, moduleCode: 'AQ-SOV-DSH', label: 'Sovereign Dashboard' },
    'sovereign-deal-audit': { component: SovereignDealAudit, moduleCode: 'AQ-SOV-AUD', label: 'Sovereign Deal Audit' },
    'story-viewer': { component: StoryViewer, moduleCode: 'AQ-STR-VIW', label: 'Story Viewer' },
    'foreclosure-tracker': { component: ForeclosureTracker, moduleCode: 'AQ-TL-FOR', label: 'Foreclosure Tracker' },
    'tax-lien-auctions': { component: TaxLienAuctions, moduleCode: 'AQ-TL-AUC', label: 'Tax Lien Auctions' },
    'universe-3d': { component: Universe3D, moduleCode: 'AQ-SYS-U3D', label: 'Universe 3D' },
    'voice-control': { component: VoiceControl, moduleCode: 'AQ-SYS-VOC', label: 'Voice Control' },
    'wallet-connect-modal': { component: WalletConnectModal, moduleCode: 'AQ-WLT-CON', label: 'Wallet Connect Modal' },
    'war-appropriations-tracker': { component: WarAppropriationsTracker, moduleCode: 'AQ-WAR-APP', label: 'War Appropriations Tracker' },
    'wealth-distribution-chart': { component: WealthDistributionChart, moduleCode: 'AQ-WTH-DST', label: 'Wealth Distribution Chart' },
    'wealth-timeline': { component: WealthTimeline, moduleCode: 'AQ-WTH-TML', label: 'Wealth Timeline' },
    'balance-summary': { component: BalanceSummary, moduleCode: 'AQ-BAL-SUM', label: 'Balance Summary' },
    'plaid-link': { component: PlaidLink, moduleCode: 'AQ-PLD-LNK', label: 'Plaid Link' },
    'api-integration': { component: APIIntegrationView, moduleCode: 'AQ-API-INT', label: 'API Integration' },
    'dashboard-view': { component: Dashboard, moduleCode: 'AQ-DSH-VIW', label: 'Dashboard View' },
    'investments-portfolio': { component: InvestmentsPortfolio, moduleCode: 'AQ-INV-PTF', label: 'Investments Portfolio' },
    'flow-controller': { component: FlowController, moduleCode: 'AQ-FLW-CTR', label: 'Flow Controller' },
    'growth-nexus': { component: GrowthNexus, moduleCode: 'AQ-GTH-NEX-CORE', label: 'Growth Nexus' },
    'griffin-mcp': { component: GriffinMcpView, moduleCode: 'AQ-GRF-MCP', label: 'Griffin MCP Server' },
};

const USERNAME = "admin08077";

const appReducer = (state: AppState, action: AppAction): AppState => {
    switch (action.type) {
        case 'OPEN_TAB':
            if (state.openTabs.find(t => t.id === action.payload.id)) return { ...state, activeTab: action.payload.id };
            return { ...state, openTabs: [...state.openTabs, action.payload], activeTab: action.payload.id };
        case 'CLOSE_TAB':
            const filteredTabs = state.openTabs.filter(t => t.id !== action.payload);
            return { ...state, openTabs: filteredTabs, activeTab: state.activeTab === action.payload ? (filteredTabs.length > 0 ? filteredTabs[filteredTabs.length - 1].id : null) : state.activeTab };
        case 'SET_ACTIVE_TAB': 
            if (state.activeTab === action.payload) return state;
            return { ...state, activeTab: action.payload };
        case 'TOGGLE_SIDEBAR': return { ...state, isSidebarOpen: !state.isSidebarOpen };
        case 'SET_SIDEBAR': return { ...state, isSidebarOpen: action.payload };
        case 'SET_SYSTEM_STATUS': return { ...state, systemStatus: action.payload };
        case 'SET_BYPASS_AUTH': return { ...state, bypassAuth: action.payload };
        case 'SET_DATA_LOADED': return { ...state, isDataLoaded: action.payload };
        default: return state;
    }
};

const SpaceViewer: React.FC<SpaceViewerProps> = ({ appId }) => {
    const app = useMemo(() => {
        const found = SOVEREIGN_APPS.find(a => a.id === appId) || NAV_ITEMS.find(item => item.id === appId);
        if (!found) return null;
        const viewId = (typeof found === 'object' && 'viewId' in found) ? (found as any).viewId : found.id;
        return { ...found, viewId };
    }, [appId]);
    
    const url = useMemo(() => `https://${USERNAME}-${appId.toLowerCase().replace(/[\s_]+/g, '-')}.static.hf.space`, [appId]);
    if (!app) return <div className="flex items-center justify-center h-full text-gray-200 font-mono">Module_Not_Found: {appId}</div>;
    const title = 'name' in app ? app.name : (app as any).label;
    return <SovereignIframe title={title} moduleCode={`SPX-${appId.slice(0,3).toUpperCase()}`} src={url} />;
};

const ModuleErrorFallback: React.FC = () => (
    <div className="flex flex-col items-center justify-center h-full p-8 text-center bg-slate-900/50 rounded-2xl border border-red-500/20 backdrop-blur-sm">
        <div className="w-16 h-16 bg-red-500/10 rounded-full flex items-center justify-center mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" /></svg>
        </div>
        <h3 className="text-lg font-bold text-red-400 mb-2 font-mono">MODULE_EXECUTION_ERROR</h3>
        <p className="text-slate-400 text-sm max-w-xs mx-auto mb-6 font-mono">The requested module failed to initialize or encountered a runtime exception.</p>
        <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg border border-red-500/30 transition-all text-xs font-mono">RELOAD_MODULE</button>
    </div>
);

const AppContent: React.FC = () => {
    const context = useContext(DataContext);
    const { isAuthReady: isFirebaseReady } = useFirebase();
    if (!context) return null;
    const { view, setView, user: userProfile } = context;
    const [state, dispatch] = useReducer(appReducer, { openTabs: [], activeTab: null, isSidebarOpen: false, systemStatus: 'initializing', bypassAuth: true, isDataLoaded: false });
    const { inProgress } = useMsal();
    const isLoading = inProgress !== "none";

    useEffect(() => {
        const detectAndNuke = () => {
            const start = performance.now();
            try { (function() { return false; })["constructor"]("debugger")(); } catch (e) {}
            const end = performance.now();
            if (end - start > 150) { securityService.clearSessionInMemory(); window.location.reload(); }
        };
        const interval = setInterval(detectAndNuke, 4000 + Math.random() * 2000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        lastBossService.init(userProfile);
        dispatch({ type: 'SET_SYSTEM_STATUS', payload: 'ready' });
    }, [userProfile]);

    useEffect(() => {
        const syncSystemData = async () => {
            if (state.systemStatus === 'ready' && userProfile && !state.isDataLoaded) {
                await new Promise(resolve => setTimeout(resolve, 800));
                dispatch({ type: 'SET_DATA_LOADED', payload: true });
            }
        };
        syncSystemData();
    }, [state.systemStatus, userProfile, state.isDataLoaded]);

    useEffect(() => { dispatch({ type: 'SET_ACTIVE_TAB', payload: null }); }, [view]);

    const handleOpenTab = useCallback((id: string, name: string) => { dispatch({ type: 'OPEN_TAB', payload: { id, name } }); }, []);

    const handleSetActiveView = useCallback((v: string | View) => {
        dispatch({ type: 'SET_ACTIVE_TAB', payload: null });
        setView(v as string);
    }, [setView]);

    const handleRouting = useCallback(() => {
        const urlParams = new URLSearchParams(window.location.search);
        const portalParam = urlParams.get('portal');
        const path = window.location.pathname;
        const segments = path.split('/').filter(Boolean);
        if (portalParam) {
            window.history.replaceState({}, document.title, window.location.pathname);
            const decoded = decodeURIComponent(portalParam);
            const match = decoded.match(/web\+aquarius:\/\/(.+)/i);
            const portalId = match ? match[1] : decoded;
            const found = SOVEREIGN_APPS.find(a => a.id === portalId || a.id.startsWith(portalId)) || NAV_ITEMS.find(item => item.id === portalId || item.id.startsWith(portalId));
            if (found) { setView((found as any).viewId || (found.id as AppView)); dispatch({ type: 'SET_ACTIVE_TAB', payload: null }); }
            return;
        }
        if (segments[0] === 'tab' && segments[1]) {
            const app = SOVEREIGN_APPS.find(a => a.id.toLowerCase() === segments[1].toLowerCase()) || NAV_ITEMS.find(item => item.id.toLowerCase() === segments[1].toLowerCase());
            if (app && state.activeTab !== app.id) {
                const name = 'name' in app ? app.name : (app as any).label;
                handleOpenTab(app.id, name);
            }
            return;
        }
        
        if (segments[0] === 'iframe_view') {
            const iframeUrl = segments.slice(1).join('/');
            const fullUrl = `https://${iframeUrl}`;
            if (view !== `IFRAME_VIEW:${fullUrl}`) {
                setView(`IFRAME_VIEW:${fullUrl}`);
                dispatch({ type: 'SET_ACTIVE_TAB', payload: null });
            }
            return;
        }

        const viewPath = segments[0] || 'dashboard';
        const targetView = Object.values(View).find(v => v.toString().toLowerCase() === viewPath.toLowerCase());
        if (targetView && targetView !== view) { setView(targetView as View); dispatch({ type: 'SET_ACTIVE_TAB', payload: null }); }
    }, [view, state.activeTab, setView, handleOpenTab]);

    useEffect(() => { window.addEventListener('popstate', handleRouting); handleRouting(); return () => window.removeEventListener('popstate', handleRouting); }, [handleRouting]);

    useEffect(() => {
        let newPath = '/';
        if (state.activeTab) newPath = `/tab/${state.activeTab.toLowerCase()}`;
        else if (view.startsWith('IFRAME_VIEW:')) {
            const url = view.split('IFRAME_VIEW:')[1];
            newPath = `/iframe_view/${url.replace('https://', '')}`;
        }
        else if (view !== View.Dashboard) newPath = `/${view.toString().toLowerCase()}`;
        if (window.location.pathname !== newPath) window.history.pushState({ view, activeTab: state.activeTab }, '', newPath);
    }, [view, state.activeTab]);

    const activeConfig = useMemo((): ComponentConfig => {
        if (view.startsWith('IFRAME_VIEW:')) {
            const url = view.split('IFRAME_VIEW:')[1];
            return {
                component: () => <SovereignIframe title={url.split('//')[1].split('.')[0].replace('admin08077-', '')} moduleCode="AQ-IFR-00" src={url} />,
                moduleCode: 'AQ-IFR-00',
                label: 'External Module'
            };
        }
        const isSystemView = COMPONENT_MAP[view];
        const isExternalApp = SOVEREIGN_APPS.find(a => a.id === view) || NAV_ITEMS.find(item => item.id === view);
        if (isSystemView) return isSystemView;
        if (isExternalApp) {
            const label = 'name' in isExternalApp ? isExternalApp.name : (isExternalApp as any).label;
            const isProtected = 'isPremium' in isExternalApp ? isExternalApp.isPremium : (isExternalApp as any).isPremium || false;
            return { 
                component: () => <SpaceViewer appId={isExternalApp.id} />, 
                moduleCode: `EXT-${isExternalApp.id.slice(0,3).toUpperCase()}`, 
                label, 
                isProtected 
            };
        }
        const uuidRegex = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
        if (uuidRegex.test(view)) return { component: () => <FleetAppView appId={view} setView={setView} />, moduleCode: `FLEET-${view.slice(0, 4).toUpperCase()}`, label: 'Fleet Node', isProtected: true };
        return COMPONENT_MAP[View.Dashboard];
    }, [view, setView]);

    const ActiveComponent = activeConfig.component;

    if (state.systemStatus === 'error') return <div className="min-h-screen bg-[#020617] flex items-center justify-center p-4"><div className="max-w-md w-full bg-red-900/20 border border-red-500/50 p-6 rounded-xl backdrop-blur-md text-center"><h2 className="text-xl font-bold text-red-400 mb-2 font-mono">SYSTEM_INTEGRITY_FAILURE</h2><button onClick={() => window.location.reload()} className="w-full py-2 bg-red-500/20 hover:bg-red-500/40 border border-red-500/50 text-red-200 rounded-lg transition-colors font-mono text-sm">REBOOT_SYSTEM</button></div></div>;

    return (
        <ErrorBoundary fallback={<ModuleErrorFallback />}>
            <div id="app-container" className="bg-[#020617] min-h-screen selection:bg-cyan-500/30">
                <PortalHandshake />
                <div className="flex h-screen text-gray-200 overflow-hidden relative z-10 font-sans">
                    <Sidebar activeView={view} setActiveView={handleSetActiveView} openTab={handleOpenTab} isOpen={state.isSidebarOpen} setIsOpen={(isOpen) => dispatch({ type: 'SET_SIDEBAR', payload: isOpen })} />
                    <div className="flex-1 flex flex-col overflow-hidden relative">
                        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>
                        <Header onMenuClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} setActiveView={setView} />
                        <TabManager tabs={state.openTabs} activeTab={state.activeTab} onTabClick={(id) => dispatch({ type: 'SET_ACTIVE_TAB', payload: id })} onTabClose={(id) => dispatch({ type: 'CLOSE_TAB', payload: id })} />
                        <main className="flex-1 p-4 lg:p-8 relative overflow-y-auto flex flex-col">
                            <div className="flex-1 w-full max-w-[1700px] mx-auto">
                                <ErrorBoundary fallback={<ModuleErrorFallback />}>
                                    {state.activeTab ? <SpaceViewer appId={state.activeTab} /> : COMPONENT_MAP[view] || view === View.BillingIdentity ? <SovereignIframe title={activeConfig.label} moduleCode={activeConfig.moduleCode}><ActiveComponent openTab={handleOpenTab} setView={setView} /></SovereignIframe> : <ActiveComponent openTab={handleOpenTab} setView={setView} />}
                                </ErrorBoundary>
                            </div>
                        </main>
                    </div>
                </div>
            </div>
        </ErrorBoundary>
    );
};

const App: React.FC = () => (
    <ErrorBoundary fallback={<div className="text-white">Critical System Error</div>}>
        <AppContent />
    </ErrorBoundary>
);

export default App;
