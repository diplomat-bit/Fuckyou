import React from 'react';
import { View } from './types';

// Import all root-level components as identified from App.tsx's renderView switch statement

// Core Views
import Dashboard from './components/Dashboard';
import TransactionsView from './components/TransactionsView';
import SendMoneyView from './components/SendMoneyView';
import BudgetsView from './components/BudgetsView';
import FinancialGoalsView from './components/FinancialGoalsView';
import CreditHealthView from './components/CreditHealthView';
import PersonalizationView from './components/PersonalizationView';
import AccountsView from './components/AccountsView';
import InvestmentsView from './components/InvestmentsView';
import CryptoView from './components/CryptoView';
import AlgoTradingLab from './components/AlgoTradingLab';
import ForexArena from './components/ForexArena';
import CommoditiesExchange from './components/CommoditiesExchange';
import RealEstateEmpire from './components/RealEstateEmpire';
import ArtCollectibles from './components/ArtCollectibles';
import DerivativesDesk from './components/DerivativesDesk';
import VentureCapitalDesk from './components/VentureCapitalDesk';
import PrivateEquityLounge from './components/PrivateEquityLounge';
import TaxOptimizationChamber from './components/TaxOptimizationChamber';
import LegacyBuilder from './components/LegacyBuilder';
import CorporateCommandView from './components/CorporateCommandView';
import ModernTreasuryView from './components/ModernTreasuryView';
import OpenBankingView from './components/OpenBankingView';
import FinancialDemocracyView from './components/FinancialDemocracyView';
import AIAdStudioView from './components/AIAdStudioView';
import QuantumWeaverView from './components/QuantumWeaverView';
import AgentMarketplaceView from './components/MarketplaceView';
import APIIntegrationView from './components/APIIntegrationView';
import SettingsView from './components/SettingsView';
import QuantumAssets from './components/QuantumAssets';
import SovereignWealth from './components/SovereignWealth';
import PhilanthropyHub from './components/PhilanthropyHub';
import TheVisionView from './components/TheVisionView';
import AIAdvisorView from './components/AIAdvisorView';
import { AIInsights } from './components/AIInsights';
import SecurityView from './components/SecurityView';
import ComplianceOracleView from './components/ComplianceOracleView';
import GlobalPositionMap from './components/GlobalPositionMap';
import GlobalSsiHubView from './components/GlobalSsiHubView';
import CustomerDashboard from './components/CustomerDashboard';
import VerificationReportsView from './components/VerificationReportsView';
import FinancialReportingView from './components/FinancialReportingView';
import StripeNexusDashboard from './components/StripeNexusDashboard';
import TheBookView from './components/TheBookView';
import KnowledgeBaseView from './components/KnowledgeBaseView';

// Citibank Views
import CitibankAccountsView from './components/CitibankAccountsView';
import CitibankAccountProxyView from './components/CitibankAccountProxyView';
import CitibankBillPayView from './components/CitibankBillPayView';
import CitibankCrossBorderView from './components/CitibankCrossBorderView';
import CitibankPayeeManagementView from './components/CitibankPayeeManagementView';
import CitibankStandingInstructionsView from './components/CitibankStandingInstructionsView';
import CitibankDeveloperToolsView from './components/CitibankDeveloperToolsView';
import CitibankEligibilityView from './components/CitibankEligibilityView';
import CitibankUnmaskedDataView from './components/CitibankUnmaskedDataView';

// Plaid Views
import PlaidMainDashboard from './components/PlaidMainDashboard';
import PlaidIdentityView from './components/PlaidIdentityView';
import PlaidCRAMonitoringView from './components/PlaidCRAMonitoringView';
import { PlaidInstitutionsExplorer } from './components/PlaidInstitutionsExplorer';
import { PlaidItemManagementView } from './components/PlaidItemManagementView';

// Stripe & Treasury Views
import StripeNexusView from './components/StripeNexusView';
import CounterpartyDashboardView from './components/CounterpartyDashboardView';
import VirtualAccountsDashboard from './components/VirtualAccountsDashboard';
import SApp from './components/SApp';
import CorporateActionsNexusView from './components/CorporateActionsNexusView';
import { CreditNoteLedger } from './components/CreditNoteLedger';
import ReconciliationHubView from './components/ReconciliationHubView';
import GEINDashboard from './components/GEIN_DashboardView';
import CardholderManagement from './components/CardholderManagement';
import SecurityComplianceView from './components/SecurityComplianceView';
import DeveloperHubView from './components/DeveloperHubView';
import SchemaExplorer from './components/SchemaExplorer';
import ResourceGraphView from './components/ResourceGraphView';
import ApiPlaygroundView from './components/ApiPlaygroundView';
import VentureCapitalDeskView from './components/VentureCapitalDeskView';

// Wrapped Components (Direct Component Access)
import AccountDetails from './components/AccountDetails';
import AccountList from './components/AccountList';
import AccountStatementGrid from './components/AccountStatementGrid';
import { AccountVerificationModal } from './components/AccountVerificationModal';
import ACHDetailsDisplay from './components/ACHDetailsDisplay';
import AICommandLog from './components/AICommandLog';
import AIPredictionWidget from './components/AIPredictionWidget';
import AssetCatalog from './components/AssetCatalog';
import AutomatedSweepRules from './components/AutomatedSweepRules';
import BalanceReportChart from './components/BalanceReportChart';
import BalanceTransactionTable from './components/BalanceTransactionTable';
import CardDesignVisualizer from './components/CardDesignVisualizer';
import { ChargeDetailModal } from './components/ChargeDetailModal';
import ChargeList from './components/ChargeList';
import ConductorConfigurationView from './components/ConductorConfigurationView';
import CounterpartyDetails from './components/CounterpartyDetails';
import { CounterpartyForm } from './components/CounterpartyForm';
import DisruptionIndexMeter from './components/DisruptionIndexMeter';
import DocumentUploader from './components/DocumentUploader';
import { DownloadLink } from './components/DownloadLink';
import EarlyFraudWarningFeed from './components/EarlyFraudWarningFeed';
import ElectionChoiceForm from './components/ElectionChoiceForm';
import EventNotificationCard from './components/EventNotificationCard';
import ExpectedPaymentsTable from './components/ExpectedPaymentsTable';
import ExternalAccountCard from './components/ExternalAccountCard';
import ExternalAccountForm from './components/ExternalAccountForm';
import ExternalAccountsTable from './components/ExternalAccountsTable';
import { FinancialAccountCard } from './components/FinancialAccountCard';
import IncomingPaymentDetailList from './components/IncomingPaymentDetailList';
import InvoiceFinancingRequest from './components/InvoiceFinancingRequest';
import PaymentInitiationForm from './components/PaymentInitiationForm';
import PaymentMethodDetails from './components/PaymentMethodDetails';
import PaymentOrderForm from './components/PaymentOrderForm';
import PayoutsDashboard from './components/PayoutsDashboard';
import PnLChart from './components/PnLChart';
import RefundForm from './components/RefundForm';
import RemittanceInfoEditor from './components/RemittanceInfoEditor';
import ReportingView from './components/ReportingView';
import { ReportRunGenerator } from './components/ReportRunGenerator';
import ReportStatusIndicator from './components/ReportStatusIndicator';
import SsiEditorForm from './components/SsiEditorForm';
import StripeStatusBadge from './components/StripeStatusBadge';
import StructuredPurposeInput from './components/StructuredPurposeInput';
import SubscriptionList from './components/SubscriptionList';
import TimeSeriesChart from './components/TimeSeriesChart';
import TradeConfirmationModal from './components/TradeConfirmationModal';
import TransactionFilter from './components/TransactionFilter';
import TransactionList from './components/TransactionList';
import { TreasuryTransactionList } from './components/TreasuryTransactionList';
import TreasuryView from './components/TreasuryView';
import UniversalObjectInspector from './components/UniversalObjectInspector';
import VirtualAccountForm from './components/VirtualAccountForm';
import VirtualAccountsTable from './components/VirtualAccountsTable';
import VoiceControl from './components/VoiceControl';
import WebhookSimulator from './components/WebhookSimulator';

/**
 * A registry of all valid root-level components (views) in the application.
 * This ensures a clean, explicit mapping between the View enum and its corresponding React component,
 * filtering out duplicates and broken files at compile-time through explicit imports.
 */
export const viewRegistry: Record<View, React.FC<any>> = {
  // Core Views
  [View.Dashboard]: Dashboard,
  [View.Transactions]: TransactionsView,
  [View.SendMoney]: SendMoneyView,
  [View.Budgets]: BudgetsView,
  [View.FinancialGoals]: FinancialGoalsView,
  [View.CreditHealth]: CreditHealthView,
  [View.Personalization]: PersonalizationView,
  [View.Accounts]: AccountsView,
  [View.Investments]: InvestmentsView,
  [View.CryptoWeb3]: CryptoView,
  [View.AlgoTradingLab]: AlgoTradingLab,
  [View.ForexArena]: ForexArena,
  [View.CommoditiesExchange]: CommoditiesExchange,
  [View.RealEstateEmpire]: RealEstateEmpire,
  [View.ArtCollectibles]: ArtCollectibles,
  [View.DerivativesDesk]: DerivativesDesk,
  [View.VentureCapital]: VentureCapitalDesk,
  [View.PrivateEquity]: PrivateEquityLounge,
  [View.TaxOptimization]: TaxOptimizationChamber,
  [View.LegacyBuilder]: LegacyBuilder,
  [View.CorporateCommand]: CorporateCommandView,
  [View.ModernTreasury]: ModernTreasuryView,
  [View.OpenBanking]: OpenBankingView,
  [View.FinancialDemocracy]: FinancialDemocracyView,
  [View.AIAdStudio]: AIAdStudioView,
  [View.QuantumWeaver]: QuantumWeaverView,
  [View.AgentMarketplace]: AgentMarketplaceView,
  [View.APIStatus]: APIIntegrationView,
  [View.Settings]: SettingsView,
  [View.QuantumAssets]: QuantumAssets,
  [View.SovereignWealth]: SovereignWealth,
  [View.Philanthropy]: PhilanthropyHub,
  [View.TheVision]: TheVisionView,
  [View.AIAdvisor]: AIAdvisorView,
  [View.AIInsights]: AIInsights,
  [View.SecurityCenter]: SecurityView,
  [View.ComplianceOracle]: ComplianceOracleView,
  [View.GlobalPositionMap]: GlobalPositionMap,
  [View.GlobalSsiHub]: GlobalSsiHubView,
  [View.CustomerDashboard]: CustomerDashboard,
  [View.VerificationReports]: VerificationReportsView,
  [View.FinancialReporting]: FinancialReportingView,
  [View.StripeNexusDashboard]: StripeNexusDashboard,
  [View.TheBook]: TheBookView,
  [View.KnowledgeBase]: KnowledgeBaseView,

  // Citibank Views
  [View.CitibankAccounts]: CitibankAccountsView,
  [View.CitibankAccountProxy]: CitibankAccountProxyView,
  [View.CitibankBillPay]: CitibankBillPayView,
  [View.CitibankCrossBorder]: CitibankCrossBorderView,
  [View.CitibankPayeeManagement]: CitibankPayeeManagementView,
  [View.CitibankStandingInstructions]: CitibankStandingInstructionsView,
  [View.CitibankDeveloperTools]: CitibankDeveloperToolsView,
  [View.CitibankEligibility]: CitibankEligibilityView,
  [View.CitibankUnmaskedData]: CitibankUnmaskedDataView,

  // Plaid Views
  [View.PlaidMainDashboard]: PlaidMainDashboard,
  [View.PlaidIdentity]: PlaidIdentityView,
  [View.PlaidCRAMonitoring]: PlaidCRAMonitoringView,
  [View.PlaidInstitutions]: PlaidInstitutionsExplorer,
  [View.PlaidItemManagement]: PlaidItemManagementView,

  // Stripe & Treasury Views
  [View.StripeNexus]: StripeNexusView,
  [View.CounterpartyDashboard]: CounterpartyDashboardView,
  [View.VirtualAccounts]: VirtualAccountsDashboard,
  [View.SApp]: SApp,
  [View.CorporateActions]: CorporateActionsNexusView,
  [View.CreditNoteLedger]: CreditNoteLedger,
  [View.ReconciliationHub]: ReconciliationHubView,
  [View.GEINDashboard]: GEINDashboard,
  [View.CardholderManagement]: CardholderManagement,
  [View.SecurityCompliance]: SecurityComplianceView,
  [View.DeveloperHub]: DeveloperHubView,
  [View.SchemaExplorer]: SchemaExplorer,
  [View.ResourceGraph]: ResourceGraphView,
  [View.ApiPlayground]: ApiPlaygroundView,
  [View.VentureCapitalDeskView]: VentureCapitalDeskView,

  // Wrapped Components (Direct Component Access)
  [View.AccountDetails]: AccountDetails,
  [View.AccountList]: AccountList,
  [View.AccountStatementGrid]: AccountStatementGrid,
  [View.AccountVerificationModal]: AccountVerificationModal,
  [View.ACHDetailsDisplay]: ACHDetailsDisplay,
  [View.AICommandLog]: AICommandLog,
  [View.AIPredictionWidget]: AIPredictionWidget,
  [View.AssetCatalog]: AssetCatalog,
  [View.AutomatedSweepRules]: AutomatedSweepRules,
  [View.BalanceReportChart]: BalanceReportChart,
  [View.BalanceTransactionTable]: BalanceTransactionTable,
  [View.CardDesignVisualizer]: CardDesignVisualizer,
  [View.ChargeDetailModal]: ChargeDetailModal,
  [View.ChargeList]: ChargeList,
  [View.ConductorConfigurationView]: ConductorConfigurationView,
  [View.CounterpartyDetails]: CounterpartyDetails,
  [View.CounterpartyForm]: CounterpartyForm,
  [View.DisruptionIndexMeter]: DisruptionIndexMeter,
  [View.DocumentUploader]: DocumentUploader,
  [View.DownloadLink]: DownloadLink,
  [View.EarlyFraudWarningFeed]: EarlyFraudWarningFeed,
  [View.ElectionChoiceForm]: ElectionChoiceForm,
  [View.EventNotificationCard]: EventNotificationCard,
  [View.ExpectedPaymentsTable]: ExpectedPaymentsTable,
  [View.ExternalAccountCard]: ExternalAccountCard,
  [View.ExternalAccountForm]: ExternalAccountForm,
  [View.ExternalAccountsTable]: ExternalAccountsTable,
  [View.FinancialAccountCard]: FinancialAccountCard,
  [View.IncomingPaymentDetailList]: IncomingPaymentDetailList,
  [View.InvoiceFinancingRequest]: InvoiceFinancingRequest,
  [View.PaymentInitiationForm]: PaymentInitiationForm,
  [View.PaymentMethodDetails]: PaymentMethodDetails,
  [View.PaymentOrderForm]: PaymentOrderForm,
  [View.PayoutsDashboard]: PayoutsDashboard,
  [View.PnLChart]: PnLChart,
  [View.RefundForm]: RefundForm,
  [View.RemittanceInfoEditor]: RemittanceInfoEditor,
  [View.ReportingView]: ReportingView,
  [View.ReportRunGenerator]: ReportRunGenerator,
  [View.ReportStatusIndicator]: ReportStatusIndicator,
  [View.SsiEditorForm]: SsiEditorForm,
  [View.StripeStatusBadge]: StripeStatusBadge,
  [View.StructuredPurposeInput]: StructuredPurposeInput,
  [View.SubscriptionList]: SubscriptionList,
  [View.TimeSeriesChart]: TimeSeriesChart,
  [View.TradeConfirmationModal]: TradeConfirmationModal,
  [View.TransactionFilter]: TransactionFilter,
  [View.TransactionList]: TransactionList,
  [View.TreasuryTransactionList]: TreasuryTransactionList,
  [View.TreasuryView]: TreasuryView,
  [View.UniversalObjectInspector]: UniversalObjectInspector,
  [View.VirtualAccountForm]: VirtualAccountForm,
  [View.VirtualAccountsTable]: VirtualAccountsTable,
  [View.VoiceControl]: VoiceControl,
  [View.WebhookSimulator]: WebhookSimulator,
};