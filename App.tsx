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
import AccountSummaryView from './components/AccountSummaryView';
import AddPayeeWizard from './components/AddPayeeWizard';
import AdhocPayeeSaver from './components/AdhocPayeeSaver';
import AdhocTransferForm from './components/AdhocTransferForm';
import AggregatorConsentManager from './components/AggregatorConsentManager';
import AppDeploymentPipeline from './components/AppDeploymentPipeline';
import AppErrorRateTracker from './components/AppErrorRateTracker';
import AppIntegrationsBridgeView from './components/AppIntegrationsBridgeView';
import AppLatencyPercentilesChart from './components/AppLatencyPercentilesChart';
import AppMetricsAlertsConsole from './components/AppMetricsAlertsConsole';
import AppMetricsDashboard from './components/AppMetricsDashboard';
import AppMetricsThresholdsEditor from './components/AppMetricsThresholdsEditor';
import AppRegistryAuthView from './components/AppRegistryAuthView';
import AppRegistryManager from './components/AppRegistryManager';
import AppVaultAndSecurity from './components/AppVaultAndSecurity';
import AquariusDashboardView from './components/AquariusDashboard';
import AuthDiagnosticsIntegrationPanel from './components/AuthDiagnosticsIntegrationPanel';
import AutoScalingPolicyEditor from './components/AutoScalingPolicyEditor';
import AzureADAppAuditor from './components/AzureADAppAuditor';
import B2BAuditTrailGenerator from './components/B2BAuditTrailGenerator';
import B2BCashFlowStressTester from './components/B2BCashFlowStressTester';
import B2BCorporateLiquidityForecaster from './components/B2BCorporateLiquidityForecaster';
import B2BDashboardComponent from './components/B2BDashboardComponent';
import B2BInterestRateOptimizer from './components/B2BInterestRateOptimizer';
import B2BPortfolioWealthAnalyzer from './components/B2BPortfolioWealthAnalyzer';
import B2BRoutingDecryptorValidator from './components/B2BRoutingDecryptorValidator';
import B2BRoutingNumberResolver from './components/B2BRoutingNumberResolver';
import B2BTransactionCategorizer from './components/B2BTransactionCategorizer';
import BalanceTransferAnalytics from './components/BalanceTransferAnalytics';
import BalanceTransferBatchSuite from './components/BalanceTransferBatchSuite';
import BalanceTransferCalculator from './components/BalanceTransferCalculator';
import BridgeConfigEditor from './components/BridgeConfigEditor';
import BridgeMetricsMonitor from './components/BridgeMetricsMonitor';
import BulkEligibilityDashboard from './components/BulkEligibilityDashboard';
import BundleHistoryManager from './components/BundleHistoryManager';
import BundleStatusViewer from './components/BundleStatusViewer';
import CamtWorkflowComponent from './components/CamtWorkflowComponent';
import CardListingComponent from './components/CardListingComponent';
import CitiAccountDashboardComponent from './components/CitiAccountDashboardComponent';
import CitiConnectInquiryView from './components/CitiConnectInquiry';
import CitiOutageTelemetryGateway from './components/CitiOutageTelemetryGateway';
import CitiQuantumAIAdvisor from './components/CitiQuantumAIAdvisor';
import CitiRepeatingPaymentTerminationGateway from './components/CitiRepeatingPaymentTerminationGateway';
import ClaimsInspectorView from './components/ClaimsInspectorView';
import ControlFlowConfirmation from './components/ControlFlowConfirmation';
import ControlFlowTracker from './components/ControlFlowTracker';
import CreditCardProductForm from './components/CreditCardProductForm';
import CrossBorderTransferWizard from './components/CrossBorderTransferWizard';
import CutoffTimeAlert from './components/CutoffTimeAlert';
import DatabaseDiagnosticPanel from './components/DatabaseDiagnosticPanel';
import DcrAuthComponent from './components/DcrAuthComponent';
import DeploymentRollbackManager from './components/DeploymentRollbackManager';
import DeploymentStreamViewer from './components/DeploymentStreamViewer';
import DiagnosticAuthConsole from './components/DiagnosticAuthConsole';
import DiagnosticDashboardView from './components/DiagnosticDashboardView';
import DiagnosticReportView from './components/DiagnosticReportView';
import DomesticTransferDashboard from './components/DomesticTransferDashboard';
import EcosystemConfigView from './components/EcosystemConfigView';
import EligibilitySimulator from './components/EligibilitySimulator';
import EppOfferSelector from './components/EppOfferSelector';
import ErrorResponseAlert from './components/ErrorResponseAlert';
import FeatureFlagToggle from './components/FeatureFlagToggle';
import FeeBreakdownCalculator from './components/FeeBreakdownCalculator';
import FleetAppViewComponent from './components/FleetAppView';
import FlowControllerView from './components/FlowController';
import FxRateCalculator from './components/FxRateCalculator';
import GeminiLivePortalView from './components/GeminiLivePortal';
import HoKTokenMintView from './components/HoKTokenMint';
import IbanValidator from './components/IbanValidator';
import ImperialAccountDetailsTerminal from './components/ImperialAccountDetailsTerminal';
import ImperialAccountListingPortal from './components/ImperialAccountListingPortal';
import ImperialCounterpartySuite from './components/ImperialCounterpartySuite';
import ImperialDeviceTelemetryConsole from './components/ImperialDeviceTelemetryConsole';
import ImperialInterInstitutionTelemetryConsole from './components/ImperialInterInstitutionTelemetryConsole';
import ImperialInvestmentPortfolioAI from './components/ImperialInvestmentPortfolioAI';
import ImperialJweSecurityConsole from './components/ImperialJweSecurityConsole';
import ImperialLedgerPayouts from './components/ImperialLedgerPayouts';
import ImperialOutageNotificationHub from './components/ImperialOutageNotificationHub';
import ImperialPaperItemVault from './components/ImperialPaperItemVault';
import ImperialRoutingValidator from './components/ImperialRoutingValidator';
import ImperialSecuritiesBrokerageAI from './components/ImperialSecuritiesBrokerageAI';
import ImperialTokenSuite from './components/ImperialTokenSuite';
import ImperialTransactionDetailTerminal from './components/ImperialTransactionDetailTerminal';
import InPrincipleApprovalDashboard from './components/InPrincipleApprovalDashboard';
import IntegrationDiagnosticsPanel from './components/IntegrationDiagnosticsPanel';
import InteractiveConsoleComponent from './components/InteractiveConsoleComponent';
import InvestmentPortfolioView from './components/InvestmentPortfolio';
import IpaDecisionResultView from './components/IpaDecisionResultView';
import IpaErrorHandling from './components/IpaErrorHandling';
import JwsSignatureGenerator from './components/JwsSignatureGenerator';
import KbaQuestionnaireRenderer from './components/KbaQuestionnaireRenderer';
import MemoryMonitor from './components/MemoryMonitor';
import MerchantSearchSelector from './components/MerchantSearchSelector';
import MfaConfirmationModal from './components/MfaConfirmationModal';
import MicroAppDeployer from './components/MicroAppDeployer';
import ModernTreasuryAccountListingLedger from './components/ModernTreasuryAccountListingLedger';
import ModernTreasuryAssetOrchestrator from './components/ModernTreasuryAssetOrchestrator';
import ModernTreasuryDepositContractGateway from './components/ModernTreasuryDepositContractGateway';
import ModernTreasuryDetailReconciler from './components/ModernTreasuryDetailReconciler';
import ModernTreasuryEnrichedTxnBridge from './components/ModernTreasuryEnrichedTxnBridge';
import ModernTreasuryFailoverLedger from './components/ModernTreasuryFailoverLedger';
import ModernTreasuryLedgerSync from './components/ModernTreasuryLedgerSync';
import ModernTreasuryMaintenanceAuditor from './components/ModernTreasuryMaintenanceAuditor';
import ModernTreasuryMultiAssetReconciler from './components/ModernTreasuryMultiAssetReconciler';
import ModernTreasuryOrchestrator from './components/ModernTreasuryOrchestrator';
import ModernTreasuryPayeeRevocationLedger from './components/ModernTreasuryPayeeRevocationLedger';
import ModernTreasuryRecurringFlowGateway from './components/ModernTreasuryRecurringFlowGateway';
import ModernTreasuryResilienceGateway from './components/ModernTreasuryResilienceGateway';
import ModernTreasuryRoutingGateway from './components/ModernTreasuryRoutingGateway';
import ModernTreasurySecureAccountBridge from './components/ModernTreasurySecureAccountBridge';
import ModernTreasurySecuritiesLedgerBridge from './components/ModernTreasurySecuritiesLedgerBridge';
import ModernTreasuryStandingInstructionAuditor from './components/ModernTreasuryStandingInstructionAuditor';
import ModernTreasuryTransactionReconciler from './components/ModernTreasuryTransactionReconciler';
import ModernTreasuryUnmaskingPolicyEngine from './components/ModernTreasuryUnmaskingPolicyEngine';
import ModernTreasuryZeroKnowledgeLedger from './components/ModernTreasuryZeroKnowledgeLedger';
import MultipleTransferBasket from './components/MultipleTransferBasket';
import MultipleTransferSimulator from './components/MultipleTransferSimulator';
import NetworkDiagnosticsPanel from './components/NetworkDiagnosticsPanel';
import OauthAuthorizeUrlBuilder from './components/OauthAuthorizeUrlBuilder';
import OauthBasicAuthGenerator from './components/OauthBasicAuthGenerator';
import OauthCallbackHandler from './components/OauthCallbackHandler';
import OauthClientConfigurator from './components/OauthClientConfigurator';
import OauthClientCredentialsDashboard from './components/OauthClientCredentialsDashboard';
import OauthClientCredentialsForm from './components/OauthClientCredentialsForm';
import OauthClientCredentialsSimulator from './components/OauthClientCredentialsSimulator';
import OauthCountryBusinessSelector from './components/OauthCountryBusinessSelector';
import OauthErrorSimulator from './components/OauthErrorSimulator';
import OauthFlowVisualizer from './components/OauthFlowVisualizer';
import OauthGrantTypeSelector from './components/OauthGrantTypeSelector';
import OauthHeaderBuilder from './components/OauthHeaderBuilder';
import OauthRefreshSimulator from './components/OauthRefreshSimulator';
import OauthRequestPayloadViewer from './components/OauthRequestPayloadViewer';
import OauthResponseInspector from './components/OauthResponseInspector';
import OauthScopeBadgeList from './components/OauthScopeBadgeList';
import OauthScopeSelector from './components/OauthScopeSelector';
import OauthSessionMonitor from './components/OauthSessionMonitor';
import OauthSessionRevocation from './components/OauthSessionRevocation';
import OauthTokenExpirationTimer from './components/OauthTokenExpirationTimer';
import OauthTokenRequestSimulator from './components/OauthTokenRequestSimulator';
import OauthTokenResponseViewer from './components/OauthTokenResponseViewer';
import OauthTokenRevoker from './components/OauthTokenRevoker';
import OauthTokenStorageManager from './components/OauthTokenStorageManager';
import OnboardingApplicantDemographicsForm from './components/OnboardingApplicantDemographicsForm';
import OnboardingApplicationInquiry from './components/OnboardingApplicationInquiry';
import OnboardingApplicationStatusTracker from './components/OnboardingApplicationStatusTracker';
import OnboardingApplicationWizard from './components/OnboardingApplicationWizard';
import OnboardingControlFlowManager from './components/OnboardingControlFlowManager';
import OnboardingCreditSelectionForm from './components/OnboardingCreditSelectionForm';
import OnboardingDocumentChecklist from './components/OnboardingDocumentChecklist';
import OnboardingEmploymentForm from './components/OnboardingEmploymentForm';
import OnboardingFinancialDetailsForm from './components/OnboardingFinancialDetailsForm';
import OnboardingKbaAssessment from './components/OnboardingKbaAssessment';
import OnboardingLoanSelectionForm from './components/OnboardingLoanSelectionForm';
import OnboardingOfferAcceptanceDashboard from './components/OnboardingOfferAcceptanceDashboard';
import OnboardingOfferAcceptancePayloadBuilder from './components/OnboardingOfferAcceptancePayloadBuilder';
import OnboardingOfferAcceptanceResponseViewer from './components/OnboardingOfferAcceptanceResponseViewer';
import OnboardingOfferComparisonMatrix from './components/OnboardingOfferComparisonMatrix';
import OnboardingOfferErrorSimulator from './components/OnboardingOfferErrorSimulator';
import OnboardingOfferEvaluator from './components/OnboardingOfferEvaluator';
import OnboardingOfferProductSelector from './components/OnboardingOfferProductSelector';
import PayeeCombinationList from './components/PayeeCombinationList';
import PayeeCreationMfaFlow from './components/PayeeCreationMfaFlow';
import PayeeDeleteConfirmation from './components/PayeeDeleteConfirmation';
import PayeeDetailsModal from './components/PayeeDetailsModal';
import PayeeEnrollmentManager from './components/PayeeEnrollmentManager';
import PayeeImportExport from './components/PayeeImportExport';
import PayeeListFilters from './components/PayeeListFilters';
import PayeeManagementDashboard from './components/PayeeManagementDashboard';
import PayeeReferenceDataSelector from './components/PayeeReferenceDataSelector';
import PayliteBookingComponent from './components/PayliteBookingComponent';
import PortalHandshakeView from './components/PortalHandshake';
import PreprocessTransferForm from './components/PreprocessTransferForm';
import ProductDisbursementDetails from './components/ProductDisbursementDetails';
import ProductOfferCard from './components/ProductOfferCard';
import ProductRepaymentConfig from './components/ProductRepaymentConfig';
import QuantumComprehensiveDetailsSuite from './components/QuantumComprehensiveDetailsSuite';
import QuantumDecryptionAuditor from './components/QuantumDecryptionAuditor';
import QuantumLedgerMonitors from './components/QuantumLedgerMonitors';
import QuantumLimitedPeriodAnalyzer from './components/QuantumLimitedPeriodAnalyzer';
import QuantumOutagePredictorAI from './components/QuantumOutagePredictorAI';
import QuantumPaymentFlows from './components/QuantumPaymentFlows';
import QuantumRoutingDecryptor from './components/QuantumRoutingDecryptor';
import QuantumSecurityShield from './components/QuantumSecurityShield';
import QuantumStandingInstructionAIAdvisor from './components/QuantumStandingInstructionAIAdvisor';
import RateLimitDashboard from './components/RateLimitDashboard';
import ReadyCreditProductForm from './components/ReadyCreditProductForm';
import RepaymentScheduleTable from './components/RepaymentScheduleTable';
import RequiredDocumentList from './components/RequiredDocumentList';
import ScenarioRunnerComponent from './components/ScenarioRunnerComponent';
import SchemaCatalogComponent from './components/SchemaCatalogComponent';
import SepaReceiptDownloader from './components/SepaReceiptDownloader';
import SepaTransferLimitsManager from './components/SepaTransferLimitsManager';
import SepaTransferWorkspace from './components/SepaTransferWorkspace';
import SourceAccountList from './components/SourceAccountList';
import SovereignAccountCollection from './components/SovereignAccountCollection';
import SovereignClearAccountTerminal from './components/SovereignClearAccountTerminal';
import SovereignClearDataVault from './components/SovereignClearDataVault';
import SovereignExpectedPayments from './components/SovereignExpectedPayments';
import SovereignIframeView from './components/SovereignIframe';
import SovereignIntelligenceViewComponent from './components/SovereignIntelligenceView';
import SovereignOutageDiscoveryConsole from './components/SovereignOutageDiscoveryConsole';
import SovereignPremiumDepositMatrix from './components/SovereignPremiumDepositMatrix';
import SovereignRepeatingPaymentVault from './components/SovereignRepeatingPaymentVault';
import SovereignStatementGenerator from './components/SovereignStatementGenerator';
import SovereignTransactionLedger from './components/SovereignTransactionLedger';
import SovereignWealthAIAdvisor from './components/SovereignWealthAIAdvisor';
import StandingInstructionForm from './components/StandingInstructionForm';
import SwiftBicValidator from './components/SwiftBicValidator';
import SystemStatusIndicator from './components/SystemStatusIndicator';
import TabManagerView from './components/TabManager';
import TaxPaymentForm from './components/TaxPaymentForm';
import TenantContextManager from './components/TenantContextManager';
import TokenProvisioningConsole from './components/TokenProvisioningConsole';
import TokenRefreshConsole from './components/TokenRefreshConsole';
import TokenRevocationConsole from './components/TokenRevocationConsole';
import TokenVerificationTester from './components/TokenVerificationTester';
import TransactionDetailsView from './components/TransactionDetailsView';
import TransferConfirmationReceipt from './components/TransferConfirmationReceipt';
import TransferHistoryTracker from './components/TransferHistoryTracker';
import TransferLimitProgress from './components/TransferLimitProgress';
import TransferPreprocessReview from './components/TransferPreprocessReview';
import TransferTypeSelector from './components/TransferTypeSelector';
import TransformationRulesManager from './components/TransformationRulesManager';
import UnsecuredLoanProductForm from './components/UnsecuredLoanProductForm';
import UnsecuredProductManager from './components/UnsecuredProductManager';
import UnsecuredProductSummary from './components/UnsecuredProductSummary';
import VoiceControlView from './components/VoiceControl';
import WealthDistributionChartComponent from './components/WealthDistributionChart';
import WorkspaceNexusViewComponent from './components/WorkspaceNexusView';

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
    'account-summary': { component: AccountSummaryView, moduleCode: 'AQ-ACC-SUM', label: 'Account Summary' },
    'add-payee-wizard': { component: AddPayeeWizard, moduleCode: 'AQ-PAY-WIZ', label: 'Add Payee Wizard' },
    'adhoc-payee-saver': { component: AdhocPayeeSaver, moduleCode: 'AQ-PAY-SAV', label: 'Adhoc Payee Saver' },
    'adhoc-transfer-form': { component: AdhocTransferForm, moduleCode: 'AQ-PAY-TRN', label: 'Adhoc Transfer Form' },
    'aggregator-consent-manager': { component: AggregatorConsentManager, moduleCode: 'AQ-AGG-CON', label: 'Aggregator Consent Manager' },
    'app-deployment-pipeline': { component: AppDeploymentPipeline, moduleCode: 'AQ-DEP-PIP', label: 'App Deployment Pipeline' },
    'app-error-rate-tracker': { component: AppErrorRateTracker, moduleCode: 'AQ-ERR-TRK', label: 'App Error Rate Tracker' },
    'app-integrations-bridge': { component: AppIntegrationsBridgeView, moduleCode: 'AQ-INT-BRG', label: 'App Integrations Bridge' },
    'app-latency-percentiles': { component: AppLatencyPercentilesChart, moduleCode: 'AQ-LAT-CHRT', label: 'App Latency Percentiles' },
    'app-metrics-alerts': { component: AppMetricsAlertsConsole, moduleCode: 'AQ-MET-ALT', label: 'App Metrics Alerts' },
    'app-metrics-dashboard': { component: AppMetricsDashboard, moduleCode: 'AQ-MET-DSH', label: 'App Metrics Dashboard' },
    'app-metrics-thresholds': { component: AppMetricsThresholdsEditor, moduleCode: 'AQ-MET-THR', label: 'App Metrics Thresholds' },
    'app-registry-auth': { component: AppRegistryAuthView, moduleCode: 'AQ-REG-AUT', label: 'App Registry Auth' },
    'app-registry-manager': { component: AppRegistryManager, moduleCode: 'AQ-REG-MGR', label: 'App Registry Manager' },
    'app-vault-security': { component: AppVaultAndSecurity, moduleCode: 'AQ-VLT-SEC', label: 'App Vault & Security' },
    'aquarius-dashboard-view': { component: AquariusDashboardView, moduleCode: 'AQ-AQ-DSH', label: 'Aquarius Dashboard' },
    'auth-diagnostics-panel': { component: AuthDiagnosticsIntegrationPanel, moduleCode: 'AQ-DIA-AUT', label: 'Auth Diagnostics Panel' },
    'auto-scaling-policy': { component: AutoScalingPolicyEditor, moduleCode: 'AQ-AUT-SCL', label: 'Auto Scaling Policy' },
    'azure-ad-app-auditor': { component: AzureADAppAuditor, moduleCode: 'AQ-AZR-AUD', label: 'Azure AD App Auditor' },
    'b2b-audit-trail': { component: B2BAuditTrailGenerator, moduleCode: 'AQ-B2B-AUD', label: 'B2B Audit Trail' },
    'b2b-cash-flow-stress': { component: B2BCashFlowStressTester, moduleCode: 'AQ-B2B-CFS', label: 'B2B Cash Flow Stress' },
    'b2b-liquidity-forecaster': { component: B2BCorporateLiquidityForecaster, moduleCode: 'AQ-B2B-LIQ', label: 'B2B Liquidity Forecaster' },
    'b2b-dashboard': { component: B2BDashboardComponent, moduleCode: 'AQ-B2B-DSH', label: 'B2B Dashboard' },
    'b2b-interest-optimizer': { component: B2BInterestRateOptimizer, moduleCode: 'AQ-B2B-INT', label: 'B2B Interest Optimizer' },
    'b2b-portfolio-analyzer': { component: B2BPortfolioWealthAnalyzer, moduleCode: 'AQ-B2B-PTF', label: 'B2B Portfolio Analyzer' },
    'b2b-routing-decryptor': { component: B2BRoutingDecryptorValidator, moduleCode: 'AQ-B2B-RDC', label: 'B2B Routing Decryptor' },
    'b2b-routing-resolver': { component: B2BRoutingNumberResolver, moduleCode: 'AQ-B2B-RRS', label: 'B2B Routing Resolver' },
    'b2b-transaction-categorizer': { component: B2BTransactionCategorizer, moduleCode: 'AQ-B2B-CAT', label: 'B2B Transaction Categorizer' },
    'balance-transfer-analytics': { component: BalanceTransferAnalytics, moduleCode: 'AQ-BT-ANA', label: 'Balance Transfer Analytics' },
    'balance-transfer-batch': { component: BalanceTransferBatchSuite, moduleCode: 'AQ-BT-BAT', label: 'Balance Transfer Batch' },
    'balance-transfer-calculator': { component: BalanceTransferCalculator, moduleCode: 'AQ-BT-CAL', label: 'Balance Transfer Calculator' },
    'bridge-config-editor': { component: BridgeConfigEditor, moduleCode: 'AQ-BRG-CFG', label: 'Bridge Config Editor' },
    'bridge-metrics-monitor': { component: BridgeMetricsMonitor, moduleCode: 'AQ-BRG-MET', label: 'Bridge Metrics Monitor' },
    'bulk-eligibility-dashboard': { component: BulkEligibilityDashboard, moduleCode: 'AQ-BUL-ELI', label: 'Bulk Eligibility Dashboard' },
    'bundle-history-manager': { component: BundleHistoryManager, moduleCode: 'AQ-BND-HIS', label: 'Bundle History Manager' },
    'bundle-status-viewer': { component: BundleStatusViewer, moduleCode: 'AQ-BND-STS', label: 'Bundle Status Viewer' },
    'camt-workflow': { component: CamtWorkflowComponent, moduleCode: 'AQ-CAM-WKF', label: 'Camt Workflow' },
    'card-listing': { component: CardListingComponent, moduleCode: 'AQ-CRD-LST', label: 'Card Listing' },
    'citi-account-dashboard': { component: CitiAccountDashboardComponent, moduleCode: 'AQ-CIT-DSH', label: 'Citi Account Dashboard' },
    'citi-connect-inquiry-view': { component: CitiConnectInquiryView, moduleCode: 'AQ-CIT-INQ-V', label: 'Citi Connect Inquiry' },
    'citi-outage-telemetry': { component: CitiOutageTelemetryGateway, moduleCode: 'AQ-CIT-OUT', label: 'Citi Outage Telemetry' },
    'citi-quantum-ai': { component: CitiQuantumAIAdvisor, moduleCode: 'AQ-CIT-QAI', label: 'Citi Quantum AI' },
    'citi-repeating-payment-termination': { component: CitiRepeatingPaymentTerminationGateway, moduleCode: 'AQ-CIT-RPT', label: 'Citi Repeating Payment Termination' },
    'claims-inspector': { component: ClaimsInspectorView, moduleCode: 'AQ-CLM-INS', label: 'Claims Inspector' },
    'control-flow-confirmation': { component: ControlFlowConfirmation, moduleCode: 'AQ-CTL-CFM', label: 'Control Flow Confirmation' },
    'control-flow-tracker': { component: ControlFlowTracker, moduleCode: 'AQ-CTL-TRK', label: 'Control Flow Tracker' },
    'credit-card-product-form': { component: CreditCardProductForm, moduleCode: 'AQ-CRD-PRD', label: 'Credit Card Product Form' },
    'cross-border-transfer-wizard': { component: CrossBorderTransferWizard, moduleCode: 'AQ-XBR-WIZ', label: 'Cross Border Transfer Wizard' },
    'cutoff-time-alert': { component: CutoffTimeAlert, moduleCode: 'AQ-CUT-ALT', label: 'Cutoff Time Alert' },
    'database-diagnostic-panel': { component: DatabaseDiagnosticPanel, moduleCode: 'AQ-DB-DIA', label: 'Database Diagnostic Panel' },
    'dcr-auth-component': { component: DcrAuthComponent, moduleCode: 'AQ-DCR-AUT', label: 'DCR Auth Component' },
    'deployment-rollback-manager': { component: DeploymentRollbackManager, moduleCode: 'AQ-DEP-ROL', label: 'Deployment Rollback Manager' },
    'deployment-stream-viewer': { component: DeploymentStreamViewer, moduleCode: 'AQ-DEP-STR', label: 'Deployment Stream Viewer' },
    'diagnostic-auth-console': { component: DiagnosticAuthConsole, moduleCode: 'AQ-DIA-AUT-C', label: 'Diagnostic Auth Console' },
    'diagnostic-dashboard': { component: DiagnosticDashboardView, moduleCode: 'AQ-DIA-DSH', label: 'Diagnostic Dashboard' },
    'diagnostic-report': { component: DiagnosticReportView, moduleCode: 'AQ-DIA-REP', label: 'Diagnostic Report' },
    'domestic-transfer-dashboard': { component: DomesticTransferDashboard, moduleCode: 'AQ-DOM-DSH', label: 'Domestic Transfer Dashboard' },
    'ecosystem-config': { component: EcosystemConfigView, moduleCode: 'AQ-ECO-CFG', label: 'Ecosystem Config' },
    'eligibility-simulator': { component: EligibilitySimulator, moduleCode: 'AQ-ELI-SIM', label: 'Eligibility Simulator' },
    'epp-offer-selector': { component: EppOfferSelector, moduleCode: 'AQ-EPP-OFF', label: 'EPP Offer Selector' },
    'error-response-alert': { component: ErrorResponseAlert, moduleCode: 'AQ-ERR-ALT', label: 'Error Response Alert' },
    'feature-flag-toggle': { component: FeatureFlagToggle, moduleCode: 'AQ-FEA-FLG', label: 'Feature Flag Toggle' },
    'fee-breakdown-calculator': { component: FeeBreakdownCalculator, moduleCode: 'AQ-FEE-CAL', label: 'Fee Breakdown Calculator' },
    'fleet-app-view': { component: FleetAppViewComponent, moduleCode: 'AQ-FLT-APP', label: 'Fleet App View' },
    'flow-controller-view': { component: FlowControllerView, moduleCode: 'AQ-FLW-CTR-V', label: 'Flow Controller View' },
    'fx-rate-calculator': { component: FxRateCalculator, moduleCode: 'AQ-FX-CAL', label: 'FX Rate Calculator' },
    'gemini-live-portal': { component: GeminiLivePortalView, moduleCode: 'AQ-GEM-LIV-P', label: 'Gemini Live Portal' },
    'hok-token-mint-view': { component: HoKTokenMintView, moduleCode: 'AQ-HOK-MNT-V', label: 'HoK Token Mint View' },
    'iban-validator': { component: IbanValidator, moduleCode: 'AQ-IBN-VAL', label: 'IBAN Validator' },
    'imperial-account-details': { component: ImperialAccountDetailsTerminal, moduleCode: 'AQ-IMP-ACC', label: 'Imperial Account Details' },
    'imperial-account-listing': { component: ImperialAccountListingPortal, moduleCode: 'AQ-IMP-LST', label: 'Imperial Account Listing' },
    'imperial-counterparty-suite': { component: ImperialCounterpartySuite, moduleCode: 'AQ-IMP-CNT', label: 'Imperial Counterparty Suite' },
    'imperial-device-telemetry': { component: ImperialDeviceTelemetryConsole, moduleCode: 'AQ-IMP-TEL', label: 'Imperial Device Telemetry' },
    'imperial-inter-institution-telemetry': { component: ImperialInterInstitutionTelemetryConsole, moduleCode: 'AQ-IMP-IIT', label: 'Imperial Inter-Institution Telemetry' },
    'imperial-investment-portfolio-ai': { component: ImperialInvestmentPortfolioAI, moduleCode: 'AQ-IMP-INV', label: 'Imperial Investment Portfolio AI' },
    'imperial-jwe-security': { component: ImperialJweSecurityConsole, moduleCode: 'AQ-IMP-JWE', label: 'Imperial JWE Security' },
    'imperial-ledger-payouts': { component: ImperialLedgerPayouts, moduleCode: 'AQ-IMP-PAY', label: 'Imperial Ledger Payouts' },
    'imperial-outage-notification': { component: ImperialOutageNotificationHub, moduleCode: 'AQ-IMP-OUT', label: 'Imperial Outage Notification' },
    'imperial-paper-item-vault': { component: ImperialPaperItemVault, moduleCode: 'AQ-IMP-PPR', label: 'Imperial Paper Item Vault' },
    'imperial-routing-validator': { component: ImperialRoutingValidator, moduleCode: 'AQ-IMP-RUT', label: 'Imperial Routing Validator' },
    'imperial-securities-brokerage-ai': { component: ImperialSecuritiesBrokerageAI, moduleCode: 'AQ-IMP-SEC', label: 'Imperial Securities Brokerage AI' },
    'imperial-token-suite': { component: ImperialTokenSuite, moduleCode: 'AQ-IMP-TOK', label: 'Imperial Token Suite' },
    'imperial-transaction-detail': { component: ImperialTransactionDetailTerminal, moduleCode: 'AQ-IMP-TXN', label: 'Imperial Transaction Detail' },
    'in-principle-approval-dashboard': { component: InPrincipleApprovalDashboard, moduleCode: 'AQ-IPA-DSH', label: 'In-Principle Approval Dashboard' },
    'integration-diagnostics-panel': { component: IntegrationDiagnosticsPanel, moduleCode: 'AQ-INT-DIA', label: 'Integration Diagnostics Panel' },
    'interactive-console': { component: InteractiveConsoleComponent, moduleCode: 'AQ-INT-CON', label: 'Interactive Console' },
    'investment-portfolio-view': { component: InvestmentPortfolioView, moduleCode: 'AQ-INV-PTF-V', label: 'Investment Portfolio View' },
    'ipa-decision-result': { component: IpaDecisionResultView, moduleCode: 'AQ-IPA-RES', label: 'IPA Decision Result' },
    'ipa-error-handling': { component: IpaErrorHandling, moduleCode: 'AQ-IPA-ERR', label: 'IPA Error Handling' },
    'jws-signature-generator': { component: JwsSignatureGenerator, moduleCode: 'AQ-JWS-GEN', label: 'JWS Signature Generator' },
    'kba-questionnaire': { component: KbaQuestionnaireRenderer, moduleCode: 'AQ-KBA-QST', label: 'KBA Questionnaire' },
    'memory-monitor': { component: MemoryMonitor, moduleCode: 'AQ-MEM-MON', label: 'Memory Monitor' },
    'merchant-search-selector': { component: MerchantSearchSelector, moduleCode: 'AQ-MER-SEL', label: 'Merchant Search Selector' },
    'mfa-confirmation-modal': { component: MfaConfirmationModal, moduleCode: 'AQ-MFA-CFM', label: 'MFA Confirmation Modal' },
    'micro-app-deployer': { component: MicroAppDeployer, moduleCode: 'AQ-MIC-DEP', label: 'Micro App Deployer' },
    'modern-treasury-account-listing': { component: ModernTreasuryAccountListingLedger, moduleCode: 'AQ-MT-ACC', label: 'Modern Treasury Account Listing' },
    'modern-treasury-asset-orchestrator': { component: ModernTreasuryAssetOrchestrator, moduleCode: 'AQ-MT-ASO', label: 'Modern Treasury Asset Orchestrator' },
    'modern-treasury-deposit-contract': { component: ModernTreasuryDepositContractGateway, moduleCode: 'AQ-MT-DEP', label: 'Modern Treasury Deposit Contract' },
    'modern-treasury-detail-reconciler': { component: ModernTreasuryDetailReconciler, moduleCode: 'AQ-MT-REC', label: 'Modern Treasury Detail Reconciler' },
    'modern-treasury-enriched-txn-bridge': { component: ModernTreasuryEnrichedTxnBridge, moduleCode: 'AQ-MT-ETB', label: 'Modern Treasury Enriched Txn Bridge' },
    'modern-treasury-failover-ledger': { component: ModernTreasuryFailoverLedger, moduleCode: 'AQ-MT-FLV', label: 'Modern Treasury Failover Ledger' },
    'modern-treasury-ledger-sync': { component: ModernTreasuryLedgerSync, moduleCode: 'AQ-MT-SYN', label: 'Modern Treasury Ledger Sync' },
    'modern-treasury-maintenance-auditor': { component: ModernTreasuryMaintenanceAuditor, moduleCode: 'AQ-MT-AUD', label: 'Modern Treasury Maintenance Auditor' },
    'modern-treasury-multi-asset-reconciler': { component: ModernTreasuryMultiAssetReconciler, moduleCode: 'AQ-MT-MAR', label: 'Modern Treasury Multi-Asset Reconciler' },
    'modern-treasury-orchestrator': { component: ModernTreasuryOrchestrator, moduleCode: 'AQ-MT-ORC', label: 'Modern Treasury Orchestrator' },
    'modern-treasury-payee-revocation': { component: ModernTreasuryPayeeRevocationLedger, moduleCode: 'AQ-MT-REV', label: 'Modern Treasury Payee Revocation' },
    'modern-treasury-recurring-flow': { component: ModernTreasuryRecurringFlowGateway, moduleCode: 'AQ-MT-REC-F', label: 'Modern Treasury Recurring Flow' },
    'modern-treasury-resilience': { component: ModernTreasuryResilienceGateway, moduleCode: 'AQ-MT-RES', label: 'Modern Treasury Resilience' },
    'modern-treasury-routing': { component: ModernTreasuryRoutingGateway, moduleCode: 'AQ-MT-RUT', label: 'Modern Treasury Routing' },
    'modern-treasury-secure-account-bridge': { component: ModernTreasurySecureAccountBridge, moduleCode: 'AQ-MT-SAB', label: 'Modern Treasury Secure Account Bridge' },
    'modern-treasury-securities-ledger-bridge': { component: ModernTreasurySecuritiesLedgerBridge, moduleCode: 'AQ-MT-SLB', label: 'Modern Treasury Securities Ledger Bridge' },
    'modern-treasury-standing-instruction-auditor': { component: ModernTreasuryStandingInstructionAuditor, moduleCode: 'AQ-MT-SIA', label: 'Modern Treasury Standing Instruction Auditor' },
    'modern-treasury-transaction-reconciler': { component: ModernTreasuryTransactionReconciler, moduleCode: 'AQ-MT-TRX', label: 'Modern Treasury Transaction Reconciler' },
    'modern-treasury-unmasking-policy': { component: ModernTreasuryUnmaskingPolicyEngine, moduleCode: 'AQ-MT-UNM', label: 'Modern Treasury Unmasking Policy' },
    'modern-treasury-zero-knowledge-ledger': { component: ModernTreasuryZeroKnowledgeLedger, moduleCode: 'AQ-MT-ZKL', label: 'Modern Treasury Zero Knowledge Ledger' },
    'multiple-transfer-basket': { component: MultipleTransferBasket, moduleCode: 'AQ-MUL-BSK', label: 'Multiple Transfer Basket' },
    'multiple-transfer-simulator': { component: MultipleTransferSimulator, moduleCode: 'AQ-MUL-SIM', label: 'Multiple Transfer Simulator' },
    'network-diagnostics-panel': { component: NetworkDiagnosticsPanel, moduleCode: 'AQ-NET-DIA', label: 'Network Diagnostics Panel' },
    'oauth-authorize-url-builder': { component: OauthAuthorizeUrlBuilder, moduleCode: 'AQ-OAU-URL', label: 'Oauth Authorize URL Builder' },
    'oauth-basic-auth-generator': { component: OauthBasicAuthGenerator, moduleCode: 'AQ-OAU-BAS', label: 'Oauth Basic Auth Generator' },
    'oauth-callback-handler': { component: OauthCallbackHandler, moduleCode: 'AQ-OAU-CAL', label: 'Oauth Callback Handler' },
    'oauth-client-configurator': { component: OauthClientConfigurator, moduleCode: 'AQ-OAU-CFG', label: 'Oauth Client Configurator' },
    'oauth-client-credentials-dashboard': { component: OauthClientCredentialsDashboard, moduleCode: 'AQ-OAU-DSH', label: 'Oauth Client Credentials Dashboard' },
    'oauth-client-credentials-form': { component: OauthClientCredentialsForm, moduleCode: 'AQ-OAU-FRM', label: 'Oauth Client Credentials Form' },
    'oauth-client-credentials-simulator': { component: OauthClientCredentialsSimulator, moduleCode: 'AQ-OAU-SIM', label: 'Oauth Client Credentials Simulator' },
    'oauth-country-business-selector': { component: OauthCountryBusinessSelector, moduleCode: 'AQ-OAU-SEL', label: 'Oauth Country Business Selector' },
    'oauth-error-simulator': { component: OauthErrorSimulator, moduleCode: 'AQ-OAU-ERR', label: 'Oauth Error Simulator' },
    'oauth-flow-visualizer': { component: OauthFlowVisualizer, moduleCode: 'AQ-OAU-VIS', label: 'Oauth Flow Visualizer' },
    'oauth-grant-type-selector': { component: OauthGrantTypeSelector, moduleCode: 'AQ-OAU-GRA', label: 'Oauth Grant Type Selector' },
    'oauth-header-builder': { component: OauthHeaderBuilder, moduleCode: 'AQ-OAU-HDR', label: 'Oauth Header Builder' },
    'oauth-refresh-simulator': { component: OauthRefreshSimulator, moduleCode: 'AQ-OAU-REF', label: 'Oauth Refresh Simulator' },
    'oauth-request-payload-viewer': { component: OauthRequestPayloadViewer, moduleCode: 'AQ-OAU-REQ', label: 'Oauth Request Payload Viewer' },
    'oauth-response-inspector': { component: OauthResponseInspector, moduleCode: 'AQ-OAU-RES', label: 'Oauth Response Inspector' },
    'oauth-scope-badge-list': { component: OauthScopeBadgeList, moduleCode: 'AQ-OAU-BDG', label: 'Oauth Scope Badge List' },
    'oauth-scope-selector': { component: OauthScopeSelector, moduleCode: 'AQ-OAU-SCP', label: 'Oauth Scope Selector' },
    'oauth-session-monitor': { component: OauthSessionMonitor, moduleCode: 'AQ-OAU-MON', label: 'Oauth Session Monitor' },
    'oauth-session-revocation': { component: OauthSessionRevocation, moduleCode: 'AQ-OAU-REV', label: 'Oauth Session Revocation' },
    'oauth-token-expiration-timer': { component: OauthTokenExpirationTimer, moduleCode: 'AQ-OAU-EXP', label: 'Oauth Token Expiration Timer' },
    'oauth-token-request-simulator': { component: OauthTokenRequestSimulator, moduleCode: 'AQ-OAU-REQ-S', label: 'Oauth Token Request Simulator' },
    'oauth-token-response-viewer': { component: OauthTokenResponseViewer, moduleCode: 'AQ-OAU-RES-V', label: 'Oauth Token Response Viewer' },
    'oauth-token-revoker': { component: OauthTokenRevoker, moduleCode: 'AQ-OAU-REV-T', label: 'Oauth Token Revoker' },
    'oauth-token-storage-manager': { component: OauthTokenStorageManager, moduleCode: 'AQ-OAU-STO', label: 'Oauth Token Storage Manager' },
    'onboarding-applicant-demographics': { component: OnboardingApplicantDemographicsForm, moduleCode: 'AQ-ONB-DEM', label: 'Onboarding Applicant Demographics' },
    'onboarding-application-inquiry': { component: OnboardingApplicationInquiry, moduleCode: 'AQ-ONB-INQ', label: 'Onboarding Application Inquiry' },
    'onboarding-application-status': { component: OnboardingApplicationStatusTracker, moduleCode: 'AQ-ONB-STS', label: 'Onboarding Application Status' },
    'onboarding-application-wizard': { component: OnboardingApplicationWizard, moduleCode: 'AQ-ONB-WIZ', label: 'Onboarding Application Wizard' },
    'onboarding-control-flow': { component: OnboardingControlFlowManager, moduleCode: 'AQ-ONB-CTL', label: 'Onboarding Control Flow' },
    'onboarding-credit-selection': { component: OnboardingCreditSelectionForm, moduleCode: 'AQ-ONB-CRE', label: 'Onboarding Credit Selection' },
    'onboarding-document-checklist': { component: OnboardingDocumentChecklist, moduleCode: 'AQ-ONB-DOC', label: 'Onboarding Document Checklist' },
    'onboarding-employment-form': { component: OnboardingEmploymentForm, moduleCode: 'AQ-ONB-EMP', label: 'Onboarding Employment Form' },
    'onboarding-financial-details': { component: OnboardingFinancialDetailsForm, moduleCode: 'AQ-ONB-FIN', label: 'Onboarding Financial Details' },
    'onboarding-kba-assessment': { component: OnboardingKbaAssessment, moduleCode: 'AQ-ONB-KBA', label: 'Onboarding KBA Assessment' },
    'onboarding-loan-selection': { component: OnboardingLoanSelectionForm, moduleCode: 'AQ-ONB-LOA', label: 'Onboarding Loan Selection' },
    'onboarding-offer-acceptance-dashboard': { component: OnboardingOfferAcceptanceDashboard, moduleCode: 'AQ-ONB-OFF', label: 'Onboarding Offer Acceptance Dashboard' },
    'onboarding-offer-acceptance-payload': { component: OnboardingOfferAcceptancePayloadBuilder, moduleCode: 'AQ-ONB-OFF-P', label: 'Onboarding Offer Acceptance Payload' },
    'onboarding-offer-acceptance-response': { component: OnboardingOfferAcceptanceResponseViewer, moduleCode: 'AQ-ONB-OFF-R', label: 'Onboarding Offer Acceptance Response' },
    'onboarding-offer-comparison-matrix': { component: OnboardingOfferComparisonMatrix, moduleCode: 'AQ-ONB-OFF-C', label: 'Onboarding Offer Comparison Matrix' },
    'onboarding-offer-error-simulator': { component: OnboardingOfferErrorSimulator, moduleCode: 'AQ-ONB-OFF-E', label: 'Onboarding Offer Error Simulator' },
    'onboarding-offer-evaluator': { component: OnboardingOfferEvaluator, moduleCode: 'AQ-ONB-OFF-V', label: 'Onboarding Offer Evaluator' },
    'onboarding-offer-product-selector': { component: OnboardingOfferProductSelector, moduleCode: 'AQ-ONB-OFF-S', label: 'Onboarding Offer Product Selector' },
    'payee-combination-list': { component: PayeeCombinationList, moduleCode: 'AQ-PAY-COM', label: 'Payee Combination List' },
    'payee-creation-mfa': { component: PayeeCreationMfaFlow, moduleCode: 'AQ-PAY-MFA', label: 'Payee Creation MFA' },
    'payee-delete-confirmation': { component: PayeeDeleteConfirmation, moduleCode: 'AQ-PAY-DEL', label: 'Payee Delete Confirmation' },
    'payee-details-modal': { component: PayeeDetailsModal, moduleCode: 'AQ-PAY-DET', label: 'Payee Details Modal' },
    'payee-enrollment-manager': { component: PayeeEnrollmentManager, moduleCode: 'AQ-PAY-ENR', label: 'Payee Enrollment Manager' },
    'payee-import-export': { component: PayeeImportExport, moduleCode: 'AQ-PAY-IMP', label: 'Payee Import Export' },
    'payee-list-filters': { component: PayeeListFilters, moduleCode: 'AQ-PAY-FIL', label: 'Payee List Filters' },
    'payee-management-dashboard': { component: PayeeManagementDashboard, moduleCode: 'AQ-PAY-DSH', label: 'Payee Management Dashboard' },
    'payee-reference-data-selector': { component: PayeeReferenceDataSelector, moduleCode: 'AQ-PAY-REF', label: 'Payee Reference Data Selector' },
    'paylite-booking': { component: PayliteBookingComponent, moduleCode: 'AQ-PAY-LIT', label: 'Paylite Booking' },
    'portal-handshake-view': { component: PortalHandshakeView, moduleCode: 'AQ-POR-HAN', label: 'Portal Handshake View' },
    'preprocess-transfer-form': { component: PreprocessTransferForm, moduleCode: 'AQ-PRE-TRN', label: 'Preprocess Transfer Form' },
    'product-disbursement-details': { component: ProductDisbursementDetails, moduleCode: 'AQ-PRD-DIS', label: 'Product Disbursement Details' },
    'product-offer-card': { component: ProductOfferCard, moduleCode: 'AQ-PRD-OFF', label: 'Product Offer Card' },
    'product-repayment-config': { component: ProductRepaymentConfig, moduleCode: 'AQ-PRD-REP', label: 'Product Repayment Config' },
    'quantum-comprehensive-details': { component: QuantumComprehensiveDetailsSuite, moduleCode: 'AQ-QUA-DET', label: 'Quantum Comprehensive Details' },
    'quantum-decryption-auditor': { component: QuantumDecryptionAuditor, moduleCode: 'AQ-QUA-DEC', label: 'Quantum Decryption Auditor' },
    'quantum-ledger-monitors': { component: QuantumLedgerMonitors, moduleCode: 'AQ-QUA-LED', label: 'Quantum Ledger Monitors' },
    'quantum-limited-period-analyzer': { component: QuantumLimitedPeriodAnalyzer, moduleCode: 'AQ-QUA-LPA', label: 'Quantum Limited Period Analyzer' },
    'quantum-outage-predictor': { component: QuantumOutagePredictorAI, moduleCode: 'AQ-QUA-OUT', label: 'Quantum Outage Predictor' },
    'quantum-payment-flows': { component: QuantumPaymentFlows, moduleCode: 'AQ-QUA-PAY', label: 'Quantum Payment Flows' },
    'quantum-routing-decryptor': { component: QuantumRoutingDecryptor, moduleCode: 'AQ-QUA-RUT', label: 'Quantum Routing Decryptor' },
    'quantum-security-shield': { component: QuantumSecurityShield, moduleCode: 'AQ-QUA-SEC', label: 'Quantum Security Shield' },
    'quantum-standing-instruction-ai': { component: QuantumStandingInstructionAIAdvisor, moduleCode: 'AQ-QUA-SIA', label: 'Quantum Standing Instruction AI' },
    'rate-limit-dashboard': { component: RateLimitDashboard, moduleCode: 'AQ-RAT-DSH', label: 'Rate Limit Dashboard' },
    'ready-credit-product-form': { component: ReadyCreditProductForm, moduleCode: 'AQ-RDY-CRE', label: 'Ready Credit Product Form' },
    'repayment-schedule-table': { component: RepaymentScheduleTable, moduleCode: 'AQ-REP-SCH', label: 'Repayment Schedule Table' },
    'required-document-list': { component: RequiredDocumentList, moduleCode: 'AQ-REQ-DOC', label: 'Required Document List' },
    'scenario-runner': { component: ScenarioRunnerComponent, moduleCode: 'AQ-SCE-RUN', label: 'Scenario Runner' },
    'schema-catalog': { component: SchemaCatalogComponent, moduleCode: 'AQ-SCH-CAT', label: 'Schema Catalog' },
    'sepa-receipt-downloader': { component: SepaReceiptDownloader, moduleCode: 'AQ-SEP-REC', label: 'Sepa Receipt Downloader' },
    'sepa-transfer-limits': { component: SepaTransferLimitsManager, moduleCode: 'AQ-SEP-LIM', label: 'Sepa Transfer Limits' },
    'sepa-transfer-workspace': { component: SepaTransferWorkspace, moduleCode: 'AQ-SEP-WRK', label: 'Sepa Transfer Workspace' },
    'source-account-list': { component: SourceAccountList, moduleCode: 'AQ-SRC-ACC', label: 'Source Account List' },
    'sovereign-account-collection': { component: SovereignAccountCollection, moduleCode: 'AQ-SOV-ACC', label: 'Sovereign Account Collection' },
    'sovereign-clear-account-terminal': { component: SovereignClearAccountTerminal, moduleCode: 'AQ-SOV-CLR', label: 'Sovereign Clear Account Terminal' },
    'sovereign-clear-data-vault': { component: SovereignClearDataVault, moduleCode: 'AQ-SOV-DAT', label: 'Sovereign Clear Data Vault' },
    'sovereign-expected-payments': { component: SovereignExpectedPayments, moduleCode: 'AQ-SOV-EXP', label: 'Sovereign Expected Payments' },
    'sovereign-iframe-view': { component: SovereignIframeView, moduleCode: 'AQ-SOV-IFR', label: 'Sovereign Iframe View' },
    'sovereign-intelligence-view': { component: SovereignIntelligenceViewComponent, moduleCode: 'AQ-SOV-INT-V', label: 'Sovereign Intelligence View' },
    'sovereign-outage-discovery': { component: SovereignOutageDiscoveryConsole, moduleCode: 'AQ-SOV-OUT', label: 'Sovereign Outage Discovery' },
    'sovereign-premium-deposit-matrix': { component: SovereignPremiumDepositMatrix, moduleCode: 'AQ-SOV-PRE', label: 'Sovereign Premium Deposit Matrix' },
    'sovereign-repeating-payment-vault': { component: SovereignRepeatingPaymentVault, moduleCode: 'AQ-SOV-RPT', label: 'Sovereign Repeating Payment Vault' },
    'sovereign-statement-generator': { component: SovereignStatementGenerator, moduleCode: 'AQ-SOV-STA', label: 'Sovereign Statement Generator' },
    'sovereign-transaction-ledger': { component: SovereignTransactionLedger, moduleCode: 'AQ-SOV-TXN', label: 'Sovereign Transaction Ledger' },
    'sovereign-wealth-ai': { component: SovereignWealthAIAdvisor, moduleCode: 'AQ-SOV-WTH', label: 'Sovereign Wealth AI' },
    'standing-instruction-form': { component: StandingInstructionForm, moduleCode: 'AQ-STA-INS', label: 'Standing Instruction Form' },
    'swift-bic-validator': { component: SwiftBicValidator, moduleCode: 'AQ-SWI-BIC', label: 'Swift Bic Validator' },
    'system-status-indicator': { component: SystemStatusIndicator, moduleCode: 'AQ-SYS-STS', label: 'System Status Indicator' },
    'tab-manager-view': { component: TabManagerView, moduleCode: 'AQ-TAB-MGR', label: 'Tab Manager View' },
    'tax-payment-form': { component: TaxPaymentForm, moduleCode: 'AQ-TAX-PAY', label: 'Tax Payment Form' },
    'tenant-context-manager': { component: TenantContextManager, moduleCode: 'AQ-TEN-CTX', label: 'Tenant Context Manager' },
    'token-provisioning-console': { component: TokenProvisioningConsole, moduleCode: 'AQ-TOK-PRO', label: 'Token Provisioning Console' },
    'token-refresh-console': { component: TokenRefreshConsole, moduleCode: 'AQ-TOK-REF', label: 'Token Refresh Console' },
    'token-revocation-console': { component: TokenRevocationConsole, moduleCode: 'AQ-TOK-REV', label: 'Token Revocation Console' },
    'token-verification-tester': { component: TokenVerificationTester, moduleCode: 'AQ-TOK-VER', label: 'Token Verification Tester' },
    'transaction-details-view': { component: TransactionDetailsView, moduleCode: 'AQ-TXN-DET', label: 'Transaction Details View' },
    'transfer-confirmation-receipt': { component: TransferConfirmationReceipt, moduleCode: 'AQ-TRN-CFM', label: 'Transfer Confirmation Receipt' },
    'transfer-history-tracker': { component: TransferHistoryTracker, moduleCode: 'AQ-TRN-HIS', label: 'Transfer History Tracker' },
    'transfer-limit-progress': { component: TransferLimitProgress, moduleCode: 'AQ-TRN-LIM', label: 'Transfer Limit Progress' },
    'transfer-preprocess-review': { component: TransferPreprocessReview, moduleCode: 'AQ-TRN-PRE', label: 'Transfer Preprocess Review' },
    'transfer-type-selector': { component: TransferTypeSelector, moduleCode: 'AQ-TRN-TYP', label: 'Transfer Type Selector' },
    'transformation-rules-manager': { component: TransformationRulesManager, moduleCode: 'AQ-TRN-RUL', label: 'Transformation Rules Manager' },
    'unsecured-loan-product-form': { component: UnsecuredLoanProductForm, moduleCode: 'AQ-UNS-LOA', label: 'Unsecured Loan Product Form' },
    'unsecured-product-manager': { component: UnsecuredProductManager, moduleCode: 'AQ-UNS-MGR', label: 'Unsecured Product Manager' },
    'unsecured-product-summary': { component: UnsecuredProductSummary, moduleCode: 'AQ-UNS-SUM', label: 'Unsecured Product Summary' },
    'voice-control-view': { component: VoiceControlView, moduleCode: 'AQ-VOC-CON', label: 'Voice Control View' },
    'wealth-distribution-chart-view': { component: WealthDistributionChartComponent, moduleCode: 'AQ-WTH-DST-V', label: 'Wealth Distribution Chart View' },
    'workspace-nexus-view': { component: WorkspaceNexusViewComponent, moduleCode: 'AQ-WRK-NEX-V', label: 'Workspace Nexus View' },
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
        if (uuidRegex.test(view)) return { component: () => <FleetAppViewComponent appId={view} setView={setView} />, moduleCode: `FLEET-${view.slice(0, 4).toUpperCase()}`, label: 'Fleet Node', isProtected: true };
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