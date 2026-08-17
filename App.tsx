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
import { FleetAppView } from './components/FleetAppView';
import { WorkspaceNexusView } from './components/WorkspaceNexusView';
import GcpInventoryView from './components/GcpInventoryView';
import { JweJwsVerifier } from './components/JweJwsVerifier';
import { FloridaVoterView } from './components/FloridaVoterView';
import { SovereignIntelligenceView } from './components/SovereignIntelligenceView';
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
import { QuantumWeaverView } from './components/QuantumWeaverView';
import CryptoView from './components/CryptoView';
import InvestmentPortfolio from './components/InvestmentPortfolio';
import { CitiGateway } from './components/CitiGateway';
import { CitiConnectInitiation } from './components/CitiConnectInitiation';
import { CitiConnectInquiry } from './components/CitiConnectInquiry';
import { CitiConnectNotifications } from './components/CitiConnectNotifications';
import { CitiTreasuryHub } from './components/CitiTreasuryHub';
import { OpenBankingFapiView } from './components/OpenBankingFapiView';
import { CitiPartnerHub } from './components/CitiPartnerHub';
import AstraDBQuickstart from './components/AstraDBQuickstart';
import { UniverseGraphVisualizer } from './components/UniverseGraphVisualizer';
import ImpeachmentGenerator from './components/ImpeachmentGenerator';
import ContractorLobbyingList from './components/ContractorLobbyingList';
import SovereignSentryEngine from './components/SovereignSentryEngine';
import AriaComms from './components/AriaComms';
import { ModernTreasuryLedgerHub } from './components/ModernTreasuryLedgerHub';
import { AlpacaBrokerView } from './components/AlpacaBrokerView';
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
import { AdministrationAudit } from './components/AdministrationAudit';
import { SovereignFilesVault } from './components/SovereignFilesVault';
import AIAdStudioView from './components/AIAdStudioView';
import AIAdvisorView from './components/AIAdvisorView';
import { AIInsights } from './components/AIInsights';
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
import { GasPriceCorrelation } from './components/GasPriceCorrelation';
import GeminiKeyModal from './components/GeminiKeyModal';
import { GisPropertyMap } from './components/government/GisPropertyMap';
import { GovernmentApiDashboard } from './components/government/GovernmentApiDashboard';
import { IrsTaxFiling } from './components/government/IrsTaxFiling';
import { SecFilingViewer } from './components/government/SecFilingViewer';
import HoKTokenMint from './components/HoKTokenMint';
import ImpactTracker from './components/ImpactTracker';
import { InjusticeDashboard } from './components/InjusticeDashboard';
import KryptoBridgeWidget from './components/KryptoBridgeWidget';
import MachineView from './components/MachineView';
import MarketplaceView from './components/MarketplaceView';
import NFCValidator from './components/NFCValidator';
import { OFXStatementViewer } from './components/OFXStatementViewer';
import OpenBankingView from './components/OpenBankingView';
import PersonalizationView from './components/PersonalizationView';
import { PoliticalComplianceView } from './components/PoliticalComplianceView';
import { PublicAidCalculator } from './components/PublicAidCalculator';
import { DeedRegistrar } from './components/real-estate/DeedRegistrar';
import { EscrowManager } from './components/real-estate/EscrowManager';
import PropertyMarketplace from './components/real-estate/PropertyMarketplace';
import RecentTransactions from './components/RecentTransactions';
import { SecurityOrchestratorView } from './components/SecurityOrchestratorView';
import SecurityView from './components/SecurityView';
import SovereignChat from './components/SovereignChat';
import SovereignDashboard from './components/SovereignDashboard';
import { SovereignDealAudit } from './components/SovereignDealAudit';
import { StoryViewer } from './components/StoryViewer';
import { ForeclosureTracker } from './components/tax-liens/ForeclosureTracker';
import { TaxLienAuctions } from './components/tax-liens/TaxLienAuctions';
import Universe3D from './components/Universe3D';
import VoiceControl from './components/VoiceControl';
import WalletConnectModal from './components/WalletConnectModal';
import { WarAppropriationsTracker } from './components/WarAppropriationsTracker';
import { WealthDistributionChart } from './components/WealthDistributionChart';
import WealthTimeline from './components/WealthTimeline';
import BalanceSummary from './components/BalanceSummary';
import PlaidLink from './components/PlaidLink';
import APIIntegrationView from './components/APIIntegrationView';
import Dashboard from './components/Dashboard';
import InvestmentsPortfolio from './components/InvestmentsPortfolio';
import { GriffinMcpView } from './components/GriffinMcpView';

interface Tab { id: string; name: string; }
interface ViewProps { openTab: (id: string, name: string) => void; setView: (view: View | AppView) => void; }
interface ComponentConfig { component: React.ComponentType<any>; moduleCode: string; label: string; isProtected?: boolean; }
interface SpaceViewerProps { appId: string; }
interface AppState { openTabs: Tab[]; activeTab: string | null; isSidebarOpen: boolean; systemStatus: 'initializing' | 'ready' | 'error'; bypassAuth: boolean; isDataLoaded: boolean; }
type AppAction = { type: 'OPEN_TAB'; payload: Tab } | { type: 'CLOSE_TAB'; payload: string } | { type: 'SET_ACTIVE_TAB'; payload: string | null } | { type: 'TOGGLE_SIDEBAR' } | { type: 'SET_SIDEBAR'; payload: boolean } | { type: 'SET_SYSTEM_STATUS'; payload: AppState['systemStatus'] } | { type: 'SET_BYPASS_AUTH'; payload: boolean