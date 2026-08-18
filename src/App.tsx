import React, { useState, useContext, useEffect, useMemo } from 'react';
import { HashRouter as Router, Route, Routes, Navigate, Link, useLocation, useNavigate, Outlet } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Cpu, ShieldAlert, Sparkles, Terminal, ArrowLeft, ExternalLink, Grid } from 'lucide-react';
import { Auth0Provider, useAuth0 } from '@auth0/auth0-react';
import { datadogLogs } from '@datadog/browser-logs';
import { Analytics } from '@vercel/analytics/react';

// Contexts
import { AuthProvider, AuthContext } from './context/AuthContext';
import { DataProvider, DataContext } from './context/DataContext';
import { StripeDataProvider } from './components/StripeDataProvider';
import { MoneyMovementProvider } from './components/MoneyMovementContext';

// Layout & Components
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import SApp from './components/SApp';
import { View } from './types';

// Views & Components
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
import PlaidDashboardView from './components/PlaidDashboardView';
import StripeDashboardView from './components/StripeDashboardView';
import MarqetaDashboardView from './components/MarqetaDashboardView';
import SSOView from './components/SSOView';
import ConciergeService from './components/ConciergeService';
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
import VoiceControl from './components/VoiceControl';
import LandingPage from './components/LandingPage';
import QuantumAssets from './components/QuantumAssets';
import CitibankAccountsView from './components/CitibankAccountsView';
import CitibankAccountProxyView from './components/CitibankAccountProxyView';
import CitibankBillPayView from './components/CitibankBillPayView';
import CitibankCrossBorderView from './components/CitibankCrossBorderView';
import CitibankPayeeManagementView from './components/CitibankPayeeManagementView';
import CitibankStandingInstructionsView from './components/CitibankStandingInstructionsView';
import CitibankDeveloperToolsView from './components/CitibankDeveloperToolsView';
import CitibankEligibilityView from './components/CitibankEligibilityView';
import CitibankUnmaskedDataView from './components/CitibankUnmaskedDataView';
import PlaidIdentityView from './components/PlaidIdentityView';
import PlaidCRAMonitoringView from './components/PlaidCRAMonitoringView';
import { PlaidInstitutionsExplorer } from './components/PlaidInstitutionsExplorer';
import { PlaidItemManagementView } from './components/PlaidItemManagementView';
import PlaidMainDashboard from './components/PlaidMainDashboard';
import StripeNexusView from './components/StripeNexusView';
import CounterpartyDashboardView from './components/CounterpartyDashboardView';
import VirtualAccountsDashboard from './components/VirtualAccountsDashboard';
import CorporateActionsNexusView from './components/CorporateActionsNexusView';
import { CreditNoteLedger } from './components/CreditNoteLedger';
import ReconciliationHubView from './components/ReconciliationHubView';
import GEINDashboard from './components/GEIN_DashboardView';
import CardholderManagement from './components/CardholderManagement';
import UniversalObjectInspector from './components/UniversalObjectInspector';
import { LoginView } from './components/LoginView';
import { PlaidClient } from './lib/plaidClient';
import DeveloperHubView from './components/DeveloperHubView';
import ApiPlaygroundView from './components/ApiPlaygroundView';

// --- ALL COMPONENT IMPORTS FOR DIRECT ACCESS ---
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
import ExternalAccountTable from './components/ExternalAccountsTable';
import { FinancialAccountCard } from './components/FinancialAccountCard';
import IncomingPaymentDetailList from './components/IncomingPaymentDetailList';
import { InvestmentForm } from './components/InvestmentForm';
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
import ResourceGraphView from './components/ResourceGraphView';
import SchemaExplorer from './components/SchemaExplorer';
import SecurityComplianceView from './components/SecurityComplianceView';
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
import VentureCapitalDeskView from './components/VentureCapitalDeskView';
import VirtualAccountForm from './components/VirtualAccountForm';
import VirtualAccountsTable from './components/VirtualAccountsTable';
import WebhookSimulator from './components/WebhookSimulator';

// --- FIXED Wrapper Components ---
type WrapperProps = {
  Component: React.FC<any>;
  props?: any;
};

const Wrapper: React.FC<WrapperProps> = ({ Component, props = {} }) => {
  return <Component {...props} />;
};

const ModalWrapper: React.FC<WrapperProps> = ({ Component, props = {} }) => {
  const [isOpen, setIsOpen] = useState(true);
  return (
    <Component
      isOpen={isOpen}
      onClose={() => setIsOpen(false)}
      {...props}
    />
  );
};

const DataContextWrapper: React.FC<{ Component: React.FC<any>; extraProps?: any }> = ({ Component, extraProps = {} }) => {
  const dataContext = useContext(DataContext);
  const mockContext = {
    setActiveView: () => {},
    impactData: { treesPlanted: 0, progressToNextTree: 0 },
  };
  const props = { ...(dataContext || mockContext), ...extraProps };
  return <Component {...props} />;
};

const AIIntentStub: React.FC<{ view: View }> = ({ view }) => {
  return (
    <div className="h-full flex flex-col items-center justify-center p-12 text-center space-y-6 animate-in fade-in duration-700 bg-gray-950/50 rounded-3xl border border-gray-800">
      <div className="w-24 h-24 bg-cyan-600/10 rounded-full flex items-center justify-center border border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.1)]">
        <Sparkles className="text-cyan-400 w-12 h-12 animate-pulse" />
      </div>
      <div className="space-y-2 max-w-md">
        <h2 className="text-2xl font-black text-white uppercase tracking-tighter italic font-mono">
          Module Ingress: {String(view).replace(/-/g, '_').toUpperCase()}
        </h2>
        <p className="text-gray-400 text-sm leading-relaxed font-mono">
          The Sovereign AI Core is compiling the high-frequency logic for this specific subsystem. Targeting zero-latency node deployment in the next epoch.
        </p>
      </div>
      <div className="flex gap-4">
        <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-2 text-[10px] font-mono text-cyan-400 uppercase tracking-widest">
          <Terminal size={14} /> STATUS: COMPILING_INTENT
        </div>
        <div className="px-4 py-2 bg-gray-900 border border-gray-800 rounded-xl flex items-center gap-2 text-[10px] font-mono text-emerald-400 uppercase tracking-widest">
          <ShieldAlert size={14} /> AUTH: VERIFIED
        </div>
      </div>
    </div>
  );
};

const MonetizationOverlay = () => {
  const context = useContext(DataContext);
  if (!context) return null;
  const { sovereignCredits } = context;
  return (
    <div className="fixed bottom-6 right-6 z-50 px-5 py-3 bg-black/80 backdrop-blur-xl border border-cyan-500/30 rounded-2xl flex items-center gap-4 shadow-[0_0_40px_rgba(6,182,212,0.15)]">
      <div className="w-2 h-2 rounded-full bg-cyan-400 animate-pulse"></div>
      <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Sovereign Balance:</span>
      <span className="text-cyan-400 font-mono text-lg font-bold tracking-tighter">
        {sovereignCredits.toLocaleString()} SC
      </span>
    </div>
  );
};

const Logout = () => {
  const { logout } = useAuth0();
  useEffect(() => {
    logout({ logoutParams: { returnTo: window.location.origin } });
  }, [logout]);
  return (
    <div className="h-screen w-screen flex items-center justify-center bg-black text-cyan-400 font-mono">
      <div className="flex flex-col items-center gap-4">
        <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
        <span>TERMINATING SESSION...</span>
      </div>
    </div>
  );
};

const SAppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    datadogLogs.logger.info('App View Loaded', { name: 'SovereignNexus', id: 'init_view' });
  }, []);

  // Define Route Configuration to map Views to Paths and Components
  const viewConfig = useMemo(() => [
    { view: View.Dashboard, path: '/dashboard', element: <Dashboard /> },
    { view: View.Transactions, path: '/transactions', element: <TransactionsView /> },
    { view: View.SendMoney, path: '/send-money', element: <SendMoneyView /> },
    { view: View.Budgets, path: '/budgets', element: <BudgetsView /> },
    { view: View.FinancialGoals, path: '/financial-goals', element: <FinancialGoalsView /> },
    { view: View.CreditHealth, path: '/credit-health', element: <CreditHealthView /> },
    { view: View.Personalization, path: '/personalization', element: <PersonalizationView /> },
    { view: View.Accounts, path: '/accounts', element: <AccountsView /> },
    { view: View.Investments, path: '/investments', element: <InvestmentsView /> },
    { view: View.CryptoWeb3, path: '/crypto', element: <CryptoView /> },
    { view: View.AlgoTradingLab, path: '/algo-trading', element: <AlgoTradingLab /> },
    { view: View.ForexArena, path: '/forex', element: <ForexArena /> },
    { view: View.CommoditiesExchange, path: '/commodities', element: <CommoditiesExchange /> },
    { view: View.RealEstateEmpire, path: '/real-estate', element: <RealEstateEmpire /> },
    { view: View.ArtCollectibles, path: '/art-collectibles', element: <ArtCollectibles /> },
    { view: View.DerivativesDesk, path: '/derivatives', element: <DerivativesDesk /> },
    { view: View.VentureCapital, path: '/venture-capital', element: <VentureCapitalDesk /> },
    { view: View.PrivateEquity, path: '/private-equity', element: <PrivateEquityLounge /> },
    { view: View.TaxOptimization, path: '/tax-optimization', element: <TaxOptimizationChamber /> },
    { view: View.LegacyBuilder, path: '/legacy-builder', element: <LegacyBuilder /> },
    { view: View.CorporateCommand, path: '/corporate-command', element: <CorporateCommandView setActiveView={dataContext?.setActiveView} /> },
    { view: View.ModernTreasury, path: '/modern-treasury', element: <ModernTreasuryView /> },
    { view: View.OpenBanking, path: '/open-banking', element: <OpenBankingView /> },
    { view: View.FinancialDemocracy, path: '/financial-democracy', element: <FinancialDemocracyView /> },
    { view: View.AIAdStudio, path: '/ai-ad-studio', element: <AIAdStudioView /> },
    { view: View.QuantumWeaver, path: '/quantum-weaver', element: <QuantumWeaverView /> },
    { view: View.AgentMarketplace, path: '/agent-marketplace', element: <AgentMarketplaceView /> },
    { view: View.APIStatus, path: '/api-status', element: <APIIntegrationView /> },
    { view: View.Settings, path: '/settings', element: <SettingsView /> },
    { view: View.QuantumAssets, path: '/quantum-assets', element: <QuantumAssets /> },
    { view: View.SovereignWealth, path: '/sovereign-wealth', element: <SovereignWealth /> },
    { view: View.Philanthropy, path: '/philanthropy', element: <PhilanthropyHub /> },
    { view: View.TheVision, path: '/vision', element: <TheVisionView /> },
    { view: View.AIAdvisor, path: '/ai-advisor', element: <AIAdvisorView /> },
    { view: View.AIInsights, path: '/ai-insights', element: <AIInsights /> },
    { view: View.SecurityCenter, path: '/security', element: <SecurityView /> },
    { view: View.ComplianceOracle, path: '/compliance', element: <ComplianceOracleView /> },
    { view: View.GlobalPositionMap, path: '/global-map', element: <GlobalPositionMap /> },
    { view: View.GlobalSsiHub, path: '/ssi-hub', element: <GlobalSsiHubView /> },
    { view: View.CustomerDashboard, path: '/customer-dashboard', element: <CustomerDashboard /> },
    { view: View.VerificationReports, path: '/verification-reports', element: <VerificationReportsView customerId="c1" /> },
    { view: View.FinancialReporting, path: '/financial-reporting', element: <FinancialReportingView /> },
    { view: View.StripeNexusDashboard, path: '/stripe-nexus-dashboard', element: <StripeNexusDashboard /> },
    { view: View.TheBook, path: '/the-book', element: <TheBookView /> },
    { view: View.KnowledgeBase, path: '/knowledge-base', element: <KnowledgeBaseView /> },
    { view: View.CitibankAccounts, path: '/citi-accounts', element: <CitibankAccountsView /> },
    { view: View.CitibankAccountProxy, path: '/citi-proxy', element: <CitibankAccountProxyView /> },
    { view: View.CitibankBillPay, path: '/citi-bill-pay', element: <CitibankBillPayView /> },
    { view: View.CitibankCrossBorder, path: '/citi-cross-border', element: <CitibankCrossBorderView /> },
    { view: View.CitibankPayeeManagement, path: '/citi-payee', element: <CitibankPayeeManagementView /> },
    { view: View.CitibankStandingInstructions, path: '/citi-standing-instructions', element: <CitibankStandingInstructionsView /> },
    { view: View.CitibankDeveloperTools, path: '/citi-dev-tools', element: <CitibankDeveloperToolsView /> },
    { view: View.CitibankEligibility, path: '/citi-eligibility', element: <CitibankEligibilityView /> },
    { view: View.CitibankUnmaskedData, path: '/citi-unmasked', element: <CitibankUnmaskedDataView accountIdsToUnmask={['acc_1']} /> },
    { view: View.PlaidMainDashboard, path: '/plaid-dashboard', element: <PlaidMainDashboard /> },
    { view: View.PlaidIdentity, path: '/plaid-identity', element: <PlaidIdentityView /> },
    { view: View.PlaidCRAMonitoring, path: '/plaid-cra', element: <PlaidCRAMonitoringView /> },
    { view: View.PlaidInstitutions, path: '/plaid-institutions', element: <PlaidInstitutionsExplorer client={new PlaidClient()} /> },
    { view: View.PlaidItemManagement, path: '/plaid-items', element: <PlaidItemManagementView accessToken="mock_token" /> },
    { view: View.StripeNexus, path: '/stripe-nexus', element: <StripeNexusView /> },
    { view: View.CounterpartyDashboard, path: '/counterparty-dashboard', element: <CounterpartyDashboardView /> },
    { view: View.VirtualAccounts, path: '/virtual-accounts', element: <VirtualAccountsDashboard /> },
    { view: View.SApp, path: '/sapp', element: <SApp /> }, // Fixed Typo: SAPP -> SApp
    { view: View.CorporateActions, path: '/corporate-actions', element: <CorporateActionsNexusView /> },
    { view: View.CreditNoteLedger, path: '/credit-note-ledger', element: <CreditNoteLedger /> },
    { view: View.ReconciliationHub, path: '/reconciliation', element: <ReconciliationHubView /> },
    { view: View.GEINDashboard, path: '/gein-dashboard', element: <GEINDashboard /> },
    { view: View.CardholderManagement, path: '/cardholder-management', element: <CardholderManagement /> },
    { view: View.SecurityCompliance, path: '/security-compliance', element: <SecurityComplianceView /> },
    { view: View.DeveloperHub, path: '/developer-hub', element: <DeveloperHubView /> },
    { view: View.SchemaExplorer, path: '/schema-explorer', element: <SchemaExplorer schemaData={{ definitions: {}, properties: {} }} /> },
    { view: View.ResourceGraph, path: '/resource-graph', element: <ResourceGraphView /> },
    { view: View.ApiPlayground, path: '/api-playground', element: <ApiPlaygroundView /> },
    { view: View.VentureCapitalDeskView, path: '/vc-desk-view', element: <VentureCapitalDeskView /> },
    
    // Direct Component Access
    { view: View.AccountDetails, path: '/comp/account-details', element: <Wrapper Component={AccountDetails} props={{ accountId: '1', customerId: 'c1' }} /> },
    { view: View.AccountList, path: '/comp/account-list', element: <Wrapper Component={AccountList} props={{ accounts: [] }} /> },
    { view: View.AccountStatementGrid, path: '/comp/account-statement', element: <Wrapper Component={AccountStatementGrid} props={{ statementLines: [] }} /> },
    { view: View.AccountVerificationModal, path: '/comp/account-verification', element: <ModalWrapper Component={AccountVerificationModal} props={{ externalAccount: {id: '1', verification_status: 'unverified' }, onSuccess: () => {}}} /> },
    { view: View.ACHDetailsDisplay, path: '/comp/ach-details', element: <Wrapper Component={ACHDetailsDisplay} props={{ details: { routingNumber: '123', realAccountNumber: '456' } }} /> },
    { view: View.AICommandLog, path: '/comp/ai-command-log', element: <AICommandLog /> },
    { view: View.AIPredictionWidget, path: '/comp/ai-prediction', element: <AIPredictionWidget /> },
    { view: View.AssetCatalog, path: '/comp/asset-catalog', element: <Wrapper Component={AssetCatalog} props={{ assets: [], onAssetSelected: () => {}, getAssetDetails: async () => ({}) }} /> },
    { view: View.AutomatedSweepRules, path: '/comp/sweep-rules', element: <AutomatedSweepRules /> },
    { view: View.BalanceReportChart, path: '/comp/balance-chart', element: <Wrapper Component={BalanceReportChart} props={{ data: [] }} /> },
    { view: View.BalanceTransactionTable, path: '/comp/balance-table', element: <Wrapper Component={BalanceTransactionTable} props={{ balanceTransactions: [] }} /> },
    { view: View.CardDesignVisualizer, path: '/comp/card-design', element: <Wrapper Component={CardDesignVisualizer} props={{ design: { id: 'd_1', physical_bundle: { features: {} } } }} /> },
    { view: View.ChargeDetailModal, path: '/comp/charge-detail', element: <ModalWrapper Component={ChargeDetailModal} props={{ charge: {id: 'ch_1', amount: 50000, currency: 'USD', status: 'succeeded'}, onClose: () => {}}} /> },
    { view: View.ChargeList, path: '/comp/charge-list', element: <ChargeList /> },
    { view: View.ConductorConfigurationView, path: '/comp/conductor-config', element: <ConductorConfigurationView /> },
    { view: View.CounterpartyDetails, path: '/comp/counterparty-details', element: <Wrapper Component={CounterpartyDetails} props={{ counterpartyId: 'cp_1' }} /> },
    { view: View.CounterpartyForm, path: '/comp/counterparty-form', element: <Wrapper Component={CounterpartyForm} props={{ counterparties: [], onSubmit: () => {}, onCancel: () => {} }} /> },
    { view: View.DisruptionIndexMeter, path: '/comp/disruption-meter', element: <Wrapper Component={DisruptionIndexMeter} props={{ indexValue: 50 }} /> },
    { view: View.DocumentUploader, path: '/comp/document-uploader', element: <Wrapper Component={DocumentUploader} props={{ documentableType: 'test', documentableId: '1' }} /> },
    { view: View.DownloadLink, path: '/comp/download-link', element: <Wrapper Component={DownloadLink} props={{ url: '#', filename: 'test.pdf' }} /> },
    { view: View.EarlyFraudWarningFeed, path: '/comp/fraud-feed', element: <EarlyFraudWarningFeed /> },
    { view: View.ElectionChoiceForm, path: '/comp/election-form', element: <Wrapper Component={ElectionChoiceForm} props={{ availableChoices: {}, onSubmit: () => {}, onCancel: () => {} }} /> },
    { view: View.EventNotificationCard, path: '/comp/event-card', element: <Wrapper Component={EventNotificationCard} props={{ event: {} }} /> },
    { view: View.ExpectedPaymentsTable, path: '/comp/expected-payments', element: <ExpectedPaymentsTable /> },
    { view: View.ExternalAccountCard, path: '/comp/external-account-card', element: <Wrapper Component={ExternalAccountCard} props={{ account: {id: '1', account_details: [], routing_details: []}}} /> },
    { view: View.ExternalAccountForm, path: '/comp/external-account-form', element: <Wrapper Component={ExternalAccountForm} props={{ counterparties: [], onSubmit: () => {}, onCancel: () => {} }} /> },
    { view: View.ExternalAccountsTable, path: '/comp/external-accounts-table', element: <Wrapper Component={ExternalAccountTable} props={{ accounts: [] }} /> },
    { view: View.FinancialAccountCard, path: '/comp/financial-account-card', element: <Wrapper Component={FinancialAccountCard} props={{ financialAccount: {id: 'fa_1', balance: { cash: {}}, supported_currencies: []}}} /> },
    { view: View.IncomingPaymentDetailList, path: '/comp/incoming-payments', element: <IncomingPaymentDetailList /> },
    { view: View.InvoiceFinancingRequest, path: '/comp/invoice-financing', element: <Wrapper Component={InvoiceFinancingRequest} props={{ onSubmit: () => {} }} /> },
    { view: View.PaymentInitiationForm, path: '/comp/payment-initiation', element: <PaymentInitiationForm /> },
    { view: View.PaymentMethodDetails, path: '/comp/payment-method', element: <Wrapper Component={PaymentMethodDetails} props={{ details: { type: 'card', card: {} }}} /> },
    { view: View.PaymentOrderForm, path: '/comp/payment-order', element: <Wrapper Component={PaymentOrderForm} props={{ internalAccounts: [], externalAccounts: [], onSubmit: () => {}, onCancel: () => {} }} /> },
    { view: View.PayoutsDashboard, path: '/comp/payouts', element: <PayoutsDashboard /> },
    { view: View.PnLChart, path: '/comp/pnl-chart', element: <Wrapper Component={PnLChart} props={{ data: [], algorithmName: 'Test' }} /> },
    { view: View.RefundForm, path: '/comp/refund-form', element: <RefundForm /> },
    { view: View.RemittanceInfoEditor, path: '/comp/remittance-editor', element: <Wrapper Component={RemittanceInfoEditor} props={{ onChange: () => {} }} /> },
    { view: View.ReportingView, path: '/comp/reporting', element: <ReportingView /> },
    { view: View.ReportRunGenerator, path: '/comp/report-generator', element: <ReportRunGenerator /> },
    { view: View.ReportStatusIndicator, path: '/comp/report-status', element: <Wrapper Component={ReportStatusIndicator} props={{ status: 'success' }} /> },
    { view: View.ResourceGraphView, path: '/comp/resource-graph-view', element: <ResourceGraphView /> },
    { view: View.SchemaExplorer, path: '/comp/schema-explorer-view', element: <SchemaExplorer schemaData={{ definitions: {}, properties: {} }} /> },
    { view: View.SecurityComplianceView, path: '/comp/security-compliance-view', element: <SecurityComplianceView /> },
    { view: View.SsiEditorForm, path: '/comp/ssi-editor', element: <Wrapper Component={SsiEditorForm} props={{ onSubmit: () => {}, onCancel: () => {} }} /> },
    { view: View.StripeStatusBadge, path: '/comp/stripe-badge', element: <Wrapper Component={StripeStatusBadge} props={{ status: 'succeeded', objectType: 'charge' }} /> },
    { view: View.StructuredPurposeInput, path: '/comp/structured-purpose', element: <Wrapper Component={StructuredPurposeInput} props={{ onChange: () => {}, value: null }} /> },
    { view: View.SubscriptionList, path: '/comp/subscription-list', element: <Wrapper Component={SubscriptionList} props={{ subscriptions: [] }} /> },
    { view: View.TimeSeriesChart, path: '/comp/time-series', element: <Wrapper Component={TimeSeriesChart} props={{ data: { labels: [], datasets: [] } }} /> },
    { view: View.TradeConfirmationModal, path: '/comp/trade-confirmation', element: <ModalWrapper Component={TradeConfirmationModal} props={{ settlementInstruction: { messageId: 'NEX-INST-99281-Z', totalAmount: 12500000, currency: 'USD', creationDateTime: Date.now(), settlementDate: '2024-12-15', numberOfTransactions: 1, purpose: 'TREA' } }} /> },
    { view: View.TransactionFilter, path: '/comp/transaction-filter', element: <Wrapper Component={TransactionFilter} props={{ onApplyFilters: () => {} }} /> },
    { view: View.TransactionList, path: '/comp/transaction-list', element: <Wrapper Component={TransactionList} props={{ transactions: [] }} /> },
    { view: View.TreasuryTransactionList, path: '/comp/treasury-list', element: <Wrapper Component={TreasuryTransactionList} props={{ transactions: [] }} /> },
    { view: View.TreasuryView, path: '/comp/treasury-view', element: <TreasuryView /> },
    { view: View.UniversalObjectInspector, path: '/comp/object-inspector', element: <Wrapper Component={UniversalObjectInspector} props={{ data: { status: "Nominal", uptime: "99.999%", load: "Balanced" } }} /> },
    { view: View.VirtualAccountForm, path: '/comp/virtual-account-form', element: <Wrapper Component={VirtualAccountForm} props={{ onSubmit: () => {}, isSubmitting: false }} /> },
    { view: View.VirtualAccountsTable, path: '/comp/virtual-accounts-table', element: <Wrapper Component={VirtualAccountsTable} props={{ onEdit: () => {}, onDelete: () => {} }} /> },
    { view: View.VoiceControl, path: '/comp/voice-control', element: <DataContextWrapper Component={VoiceControl} /> },
    { view: View.WebhookSimulator, path: '/comp/webhook-simulator', element: <Wrapper Component={WebhookSimulator} props={{ stripeAccountId: 'acct_mock' }} /> },
  ], [dataContext?.setActiveView]);

  if (!dataContext || !authContext) return null;
  const { isAuthenticated, isLoading: authLoading } = authContext;
  const { isLoading: dataLoading, activeView, setActiveView } = dataContext;

  // Sync URL to State (Deep Linking)
  useEffect(() => {
    const currentPath = location.pathname;
    const config = viewConfig.find(c => c.path === currentPath);
    if (config && activeView !== config.view) {
      setActiveView(config.view);
    } else if (!config && currentPath !== '/') {
      // Fallback for unknown routes inside SAppLayout
      // Optional: Redirect to dashboard or handle 404
    }
  }, [location.pathname, viewConfig, activeView, setActiveView]);

  // Sync State to URL (Sidebar Navigation)
  useEffect(() => {
    const config = viewConfig.find(c => c.view === activeView);
    if (config && location.pathname !== config.path) {
      navigate(config.path);
    }
  }, [activeView, viewConfig, navigate, location.pathname]);

  if (authLoading || (isAuthenticated && dataLoading)) {
    return (
      <div className="h-screen w-screen flex flex-col items-center justify-center bg-black text-white gap-6">
        <Cpu className="w-20 h-20 text-cyan-400 animate-pulse" />
        <h1 className="text-3xl font-black tracking-[0.2em] italic text-transparent bg-clip-text bg-gradient-to-r from-cyan-400 to-indigo-500 uppercase font-mono">
          Nexus OS // Syncing
        </h1>
        <div className="w-80 h-1 bg-gray-900 rounded-full overflow-hidden">
          <div className="h-full bg-cyan-500 animate-progress-flow"></div>
        </div>
        <style>{`
          @keyframes flow { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
          .animate-progress-flow { animation: flow 2s linear infinite; width: 50%; }
        `}</style>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="relative flex flex-col flex-1 min-h-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,#111,transparent)]">
          <div className="max-w-[1600px] mx-auto h-full min-h-0">
            <Routes>
              {viewConfig.map((config) => (
                <Route key={config.path} path={config.path} element={config.element} />
              ))}
              <Route path="*" element={<Navigate to="/dashboard" replace />} />
            </Routes>
          </div>
        </main>
        <MonetizationOverlay />
        <Link 
          to="/modules"
          className="fixed bottom-6 left-6 z-50 w-12 h-12 bg-gray-900/80 backdrop-blur-xl border border-cyan-500/30 rounded-full flex items-center justify-center text-cyan-400 hover:bg-cyan-500/20 hover:scale-110 transition-all duration-300 shadow-[0_0_20px_rgba(6,182,212,0.2)] group"
          title="Open AI Nexus"
        >
          <Grid size={20} className="group-hover:animate-spin-slow" />
        </Link>
      </div>
    </div>
  );
};

const AI_MODULES = [
  "https://admin08077-openapi.hf.space",
  "https://admin08077-ai-banking-sovereign.static.hf.space",
  "https://admin08077-aibanke.static.hf.space",
  "https://admin08077-citibank-demo-business-inc-ai-ban-king-demo.static.hf.space",
  "https://admin08077-1233.static.hf.space",
  "https://admin08077-inventions.static.hf.space",
  "https://admin08077-gemini-app-citibank-demo-business-inc-google.static.hf.space",
  "https://admin08077-aibankdemo2.static.hf.space",
  "https://admin08077-airenderer.static.hf.space",
  "https://admin08077-book.static.hf.space",
  "https://admin08077-merrychristmas.static.hf.space",
  "https://admin08077-apiai.static.hf.space",
  "https://admin08077-projectatlas.static.hf.space",
  "https://admin08077-jocall3.static.hf.space",
  "https://admin08077-demob.static.hf.space",
  "https://admin08077-aibanke.static.hf.space",
  "https://admin08077-ai-banking-sovereign.static.hf.space",
  "https://admin08077-static.static.hf.space",
  "https://admin08077-demoo.static.hf.space",
  "https://admin08077-webgenai.static.hf.space",
  "https://admin08077-aiab.static.hf.space",
  "https://admin08077-citibank-demo-business-inc-app.static.hf.space",
  "https://admin08077-aib8nking.static.hf.space",
  "https://admin08077-bb.static.hf.space",
  "https://admin08077-citibank-demo-business-inc-apps.static.hf.space",
  "https://admin08077-newwa.static.hf.space",
  "https://admin08077-jamesocallaghanprivatebank.hf.space",
  "https://admin08077-drip-faucet.static.hf.space",
  "https://admin08077-transactpro.hf.space",
  "https://admin08077-quantumbank.hf.space",
  "https://admin08077-test.hf.space"
];

const getModuleTitle = (url: string) => {
  try {
    const urlObj = new URL(url);
    let hostname = urlObj.hostname;
    // Remove .hf.space or .static.hf.space
    hostname = hostname.replace('.static.hf.space', '').replace('.hf.space', '');
    // Remove admin08077- prefix
    hostname = hostname.replace(/^admin\d+-/, '');
    // Replace hyphens with spaces
    const title = hostname.split('-').map(word => word.charAt(0).toUpperCase() + word.slice(1)).join(' ');
    return title || 'AI Module';
  } catch (e) {
    return 'AI Module';
  }
};

const AIModuleCard = ({ url, className }: { url: string; className?: string }) => {
  const [isLoading, setIsLoading] = useState(true);
  const title = getModuleTitle(url);

  return (
    <div className={`flex flex-col w-full bg-gray-900/50 border border-gray-800 rounded-2xl overflow-hidden hover:border-cyan-500/30 transition-all duration-300 shadow-lg hover:shadow-cyan-500/10 group ${className || 'h-[500px]'}`}>
      <div className="px-4 py-3 border-b border-gray-800 bg-gray-950 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
          <span className="text-sm font-mono font-bold text-gray-300 group-hover:text-cyan-400 transition-colors truncate max-w-[300px]">
            {title}
          </span>
        </div>
        <a href={url} target="_blank" rel="noopener noreferrer" className="text-xs text-gray-600 hover:text-white transition-colors">
          <ExternalLink size={14} />
        </a>
      </div>
      <div className="relative flex-1 bg-black">
        {isLoading && (
          <div className="absolute inset-0 flex items-center justify-center z-10 bg-gray-900/20 backdrop-blur-sm">
            <div className="w-8 h-8 border-2 border-cyan-500 border-t-transparent rounded-full animate-spin" />
          </div>
        )}
        <iframe
          src={url}
          className="w-full h-full border-0"
          onLoad={() => setIsLoading(false)}
          title={title}
          sandbox="allow-same-origin allow-scripts allow-popups allow-forms"
        />
      </div>
    </div>
  );
};

const ExternalIframeCollection = () => {
  const [activeIndex, setActiveIndex] = useState(0);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const handleNext = () => {
    setActiveIndex((prev) => (prev + 1) % AI_MODULES.length);
  };

  const handlePrev = () => {
    setActiveIndex((prev) => (prev - 1 + AI_MODULES.length) % AI_MODULES.length);
  };

  return (
    <div className="flex h-screen bg-[#050505] overflow-hidden">
      {/* Sidebar */}
      <div className={`${isSidebarOpen ? 'w-80 translate-x-0' : 'w-0 -translate-x-full'} transition-all duration-300 border-r border-gray-800 bg-gray-950 flex flex-col fixed md:relative z-20 h-full`}>
        <div className="p-4 border-b border-gray-800 flex items-center justify-between bg-gray-950">
          <div className="flex items-center gap-2">
            <Terminal size={16} className="text-cyan-400" />
            <span className="font-mono font-bold text-gray-200 tracking-wider">MODULES</span>
          </div>
          <button onClick={() => setIsSidebarOpen(false)} className="text-gray-500 hover:text-white">
            <ArrowLeft size={16} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1">
          {AI_MODULES.map((url, index) => (
            <button
              key={index}
              onClick={() => setActiveIndex(index)}
              className={`w-full text-left px-4 py-3 rounded-lg text-xs font-mono transition-all duration-200 flex items-center gap-3 ${
                activeIndex === index
                  ? 'bg-cyan-900/20 text-cyan-400 border border-cyan-500/30 shadow-[0_0_15px_rgba(6,182,212,0.1)]'
                  : 'text-gray-500 hover:bg-gray-900 hover:text-gray-300 border border-transparent'
              }`}
            >
              <div className={`w-1.5 h-1.5 rounded-full ${activeIndex === index ? 'bg-cyan-400 animate-pulse' : 'bg-gray-700'}`} />
              <span className="truncate">{getModuleTitle(url)}</span>
            </button>
          ))}
        </div>
      </div>

      {/* Main Content */}
      <div className="flex-1 flex flex-col min-w-0 bg-black relative">
        {/* Top Bar */}
        <div className="h-16 border-b border-gray-800 bg-gray-950/50 backdrop-blur-xl flex items-center justify-between px-6 z-10">
          <div className="flex items-center gap-4">
            {!isSidebarOpen && (
              <button onClick={() => setIsSidebarOpen(true)} className="p-2 hover:bg-gray-800 rounded-lg text-gray-400 hover:text-white transition-colors">
                <Terminal size={20} />
              </button>
            )}
            <Link to="/" className="flex items-center gap-2 text-gray-500 hover:text-white transition-colors group">
              <div className="p-1.5 rounded-md bg-gray-900 group-hover:bg-gray-800 border border-gray-800 group-hover:border-gray-700">
                <ArrowLeft size={14} />
              </div>
              <span className="text-xs font-mono tracking-widest">RETURN TO OS</span>
            </Link>
          </div>
          
          <div className="flex items-center gap-4">
             <div className="px-3 py-1 rounded-full bg-gray-900 border border-gray-800 text-[10px] font-mono text-gray-400">
               MODULE {activeIndex + 1} / {AI_MODULES.length}
             </div>
          </div>
        </div>

        {/* Card Area */}
        <div className="flex-1 p-6 md:p-10 flex flex-col items-center justify-center overflow-hidden relative">
           {/* Navigation Buttons (Desktop) */}
           <button 
             onClick={handlePrev}
             className="absolute left-6 z-10 p-4 rounded-full bg-black/50 backdrop-blur border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all duration-300 group hidden md:flex"
           >
             <ArrowLeft size={24} className="group-hover:-translate-x-1 transition-transform" />
           </button>

           <button 
             onClick={handleNext}
             className="absolute right-6 z-10 p-4 rounded-full bg-black/50 backdrop-blur border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500/50 hover:bg-cyan-950/30 transition-all duration-300 group hidden md:flex"
           >
             <ArrowLeft size={24} className="rotate-180 group-hover:translate-x-1 transition-transform" />
           </button>

           {/* The Card */}
           <div className="w-full h-full max-w-[1400px] relative flex flex-col">
             <div className="flex-1 relative animate-in fade-in zoom-in-95 duration-500">
               <AIModuleCard 
                 key={activeIndex} 
                 url={AI_MODULES[activeIndex]} 
                 className="h-full shadow-[0_0_50px_rgba(0,0,0,0.5)] border-gray-800" 
               />
             </div>
             
             {/* Mobile Nav */}
             <div className="flex md:hidden items-center justify-between mt-4 gap-4">
               <button onClick={handlePrev} className="flex-1 py-3 bg-gray-900 rounded-xl border border-gray-800 text-gray-400">Prev</button>
               <button onClick={handleNext} className="flex-1 py-3 bg-gray-900 rounded-xl border border-gray-800 text-gray-400">Next</button>
             </div>
           </div>
        </div>
      </div>
    </div>
  );
};

const theme = createTheme({ palette: { mode: 'dark' } });

function App() {
  return (
    <Auth0Provider
      domain="aibankinguniversity.us.auth0.com"
      clientId="fOkKYLJUrLnv7hInn8CVi3cHpjF7xPRp"
      authorizationParams={{ redirect_uri: window.location.origin }}
    >
      <AuthProvider>
        <DataProvider>
          <MoneyMovementProvider>
            <StripeDataProvider>
              <ThemeProvider theme={theme}>
                <CssBaseline />
                <Router>
                  <Routes>
                    <Route path="/" element={<LandingPage />} />
                    <Route path="/login" element={<LoginView />} />
                    <Route path="/logout" element={<Logout />} />
                    <Route path="/modules" element={<ExternalIframeCollection />} />
                    <Route path="*" element={<SAppLayout />} />
                  </Routes>
                </Router>
              </ThemeProvider>
            </StripeDataProvider>
          </MoneyMovementProvider>
        </DataProvider>
      </AuthProvider>
      <Analytics />
    </Auth0Provider>
  );
}

export default App;