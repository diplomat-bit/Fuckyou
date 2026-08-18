import React, { useState, useContext } from 'react';
import { Navigate } from 'react-router-dom';
import { Cpu, AlertTriangle } from 'lucide-react';

// Contexts
import { AuthContext } from '../context/AuthContext';
import { DataContext } from '../context/DataContext';

// Layout
import Sidebar from './Sidebar';
import Header from './Header';
import { View } from '../types';

// --- ALL VIEW COMPONENTS ---
import AccountDetails from './AccountDetails';
import AccountList from './AccountList';
import AccountStatementGrid from './AccountStatementGrid';
import AccountsView from './AccountsView';
import { AccountVerificationModal } from './AccountVerificationModal';
import ACHDetailsDisplay from './ACHDetailsDisplay';
import AIAdStudioView from './AIAdStudioView';
import AIAdvisorView from './AIAdvisorView';
import AICommandLog from './AICommandLog';
import { AIInsights } from './AIInsights';
import AIPredictionWidget from './AIPredictionWidget';
import AlgoTradingLab from './AlgoTradingLab';
import APIIntegrationView from './APIIntegrationView';
import ApiPlaygroundView from './ApiPlaygroundView';
import ArtCollectibles from './ArtCollectibles';
import AssetCatalog from './AssetCatalog';
import AutomatedSweepRules from './AutomatedSweepRules';
import BalanceReportChart from './BalanceReportChart';
import BalanceTransactionTable from './BalanceTransactionTable';
import BudgetsView from './BudgetsView';
import CardDesignVisualizer from './CardDesignVisualizer';
import { ChargeDetailModal } from './ChargeDetailModal';
import ChargeList from './ChargeList';
import CommoditiesExchange from './CommoditiesExchange';
import ComplianceOracleView from './ComplianceOracleView';
import ConciergeService from './ConciergeService';
import ConductorConfigurationView from './ConductorConfigurationView';
import CorporateCommandView from './CorporateCommandView';
import CounterpartyDetails from './CounterpartyDetails';
import { CounterpartyForm } from './CounterpartyForm';
import CreditHealthView from './CreditHealthView';
import CryptoView from './CryptoView';
import CustomerDashboard from './CustomerDashboard';
import Dashboard from './Dashboard';
import DerivativesDesk from './DerivativesDesk';
import DeveloperHubView from './DeveloperHubView';
import DisruptionIndexMeter from './DisruptionIndexMeter';
import DocumentUploader from './DocumentUploader';
import { DownloadLink } from './DownloadLink';
import EarlyFraudWarningFeed from './EarlyFraudWarningFeed';
import ElectionChoiceForm from './ElectionChoiceForm';
import EventNotificationCard from './EventNotificationCard';
import ExpectedPaymentsTable from './ExpectedPaymentsTable';
import ExternalAccountCard from './ExternalAccountCard';
import ExternalAccountForm from './ExternalAccountForm';
import ExternalAccountTable from './ExternalAccountsTable';
import { FinancialAccountCard } from './FinancialAccountCard';
import FinancialDemocracyView from './FinancialDemocracyView';
import FinancialGoalsView from './FinancialGoalsView';
import FinancialReportingView from './FinancialReportingView';
import ForexArena from './ForexArena';
import GlobalPositionMap from './GlobalPositionMap';
import GlobalSsiHubView from './GlobalSsiHubView';
import IncomingPaymentDetailList from './IncomingPaymentDetailList';
import InvestmentsView from './InvestmentsView';
import InvoiceFinancingRequest from './InvoiceFinancingRequest';
import LegacyBuilder from './LegacyBuilder';
import MarketplaceView from './MarketplaceView';
import MarqetaDashboardView from './MarqetaDashboardView';
import ModernTreasuryView from './ModernTreasuryView';
import OpenBankingView from './OpenBankingView';
import PaymentInitiationForm from './PaymentInitiationForm';
import PaymentMethodDetails from './PaymentMethodDetails';
import PaymentOrderForm from './PaymentOrderForm';
import PersonalizationView from './PersonalizationView';
import PhilanthropyHub from './PhilanthropyHub';
import PlaidDashboardView from './PlaidDashboardView';
import PnLChart from './PnLChart';
import PrivateEquityLounge from './PrivateEquityLounge';
import QuantumWeaverView from './QuantumWeaverView';
import RealEstateEmpire from './RealEstateEmpire';
import RefundForm from './RefundForm';
import RemittanceInfoEditor from './RemittanceInfoEditor';
import ReportingView from './ReportingView';
import { ReportRunGenerator } from './ReportRunGenerator';
import ReportStatusIndicator from './ReportStatusIndicator';
import ResourceGraphView from './ResourceGraphView';
import SchemaExplorer from './SchemaExplorer';
import SecurityComplianceView from './SecurityComplianceView';
import SecurityView from './SecurityView';
import SendMoneyView from './SendMoneyView';
import SettingsView from './SettingsView';
import SovereignWealth from './SovereignWealth';
import SsiEditorForm from './SsiEditorForm';
import SSOView from './SSOView';
import StripeDashboardView from './StripeDashboardView';
import StripeNexusDashboard from './StripeNexusDashboard';
import StripeStatusBadge from './StripeStatusBadge';
import StructuredPurposeInput from './StructuredPurposeInput';
import SubscriptionList from './SubscriptionList';
import TaxOptimizationChamber from './TaxOptimizationChamber';
import TheVisionView from './TheVisionView';
import TimeSeriesChart from './TimeSeriesChart';
import TradeConfirmationModal from './TradeConfirmationModal';
import TransactionFilter from './TransactionFilter';
import TransactionList from './TransactionList';
import TransactionsView from './TransactionsView';
import { TreasuryTransactionList } from './TreasuryTransactionList';
import TreasuryView from './TreasuryView';
import UniversalObjectInspector from './UniversalObjectInspector';
import VentureCapitalDesk from './VentureCapitalDesk';
import VentureCapitalDeskView from './VentureCapitalDeskView';
import VerificationReportsView from './VerificationReportsView';
import VirtualAccountForm from './VirtualAccountForm';
import VirtualAccountsTable from './VirtualAccountsTable';
import VoiceControl from './VoiceControl';
import WebhookSimulator from './WebhookSimulator';
import TheBookView from './TheBookView';
import KnowledgeBaseView from './KnowledgeBaseView';

type ComponentType = React.ComponentType<any> | undefined | null;

class ViewErrorBoundary extends React.Component<{ children: React.ReactNode }, { hasError: boolean }> {
  constructor(props: { children: React.ReactNode }) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("View rendering error:", error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center h-full text-gray-400">
          <AlertTriangle className="w-12 h-12 mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-white mb-2">View Error</h2>
          <p>An error occurred while rendering this view.</p>
          <button 
            onClick={() => this.setState({ hasError: false })}
            className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
          >
            Try Again
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

const Wrapper = (Component: ComponentType, props?: Record<string, any>) => {
  if (!Component) {
    return (
      <div className="flex items-center justify-center p-8 text-red-400 bg-red-950/20 rounded-lg border border-red-500/30">
        <AlertTriangle className="w-6 h-6 mr-3" />
        <span>Component unavailable</span>
      </div>
    );
  }
  const safeProps = props ?? {};
  return <Component {...safeProps} />;
};

const ModalWrapperComponent = ({ Component, componentProps }: { Component: React.ComponentType<any>, componentProps: Record<string, any> }) => {
    const [isOpen, setIsOpen] = useState(true);
    return <Component isOpen={isOpen} onClose={() => setIsOpen(false)} {...componentProps} />;
};

const ModalWrapper = (Component: ComponentType, props?: Record<string, any>) => {
    if (!Component) {
        return (
            <div className="flex items-center justify-center p-8 text-red-400 bg-red-950/20 rounded-lg border border-red-500/30">
                <AlertTriangle className="w-6 h-6 mr-3" />
                <span>Modal component unavailable</span>
            </div>
        );
    }
    return <ModalWrapperComponent Component={Component} componentProps={props ?? {}} />;
};

const DataContextWrapperComponent = ({ Component, componentProps }: { Component: React.ComponentType<any>, componentProps: Record<string, any> }) => {
    const dataContext = useContext(DataContext);
    const mockContext = { 
        setActiveView: () => {}, 
        impactData: { treesPlanted: 0, progressToNextTree: 0 },
    };
    const props = { ...(dataContext || mockContext), ...componentProps };
    return <Component {...props} />;
};

const DataContextWrapper = (Component: ComponentType, extraProps?: Record<string, any>) => {
    if (!Component) return null;
    return <DataContextWrapperComponent Component={Component} componentProps={extraProps ?? {}} />;
};

const SApp = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);

  if (!dataContext) {
    return <div>Error: DataContext not found.</div>;
  }

  const { isLoading, error, activeView, setActiveView } = dataContext;
  const isAuthenticated = authContext?.isAuthenticated;

  if (isLoading) {
    return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-gray-950 text-white gap-4">
            <Cpu className="w-16 h-16 text-cyan-400 animate-pulse" />
            <h1 className="text-2xl font-bold tracking-wider">INITIALIZING SOVEREIGN AI NEXUS...</h1>
            <p className="text-gray-400 font-mono">Generating financial universe from quantum foam...</p>
            <div className="w-64 h-2 bg-gray-800 rounded-full overflow-hidden mt-2">
                <div className="h-2 bg-gradient-to-r from-cyan-500 to-purple-500 animate-pulse-fast-x"></div>
            </div>
            <style>{`
                .animate-pulse-fast-x {
                    animation: pulse-x 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
                }
                @keyframes pulse-x {
                    0%, 100% { transform: translateX(-100%); }
                    50% { transform: translateX(100%); }
                }
            `}</style>
        </div>
    );
  }

  if (error) {
      return (
        <div className="h-full w-full flex flex-col items-center justify-center bg-red-950 text-red-300 gap-4 p-8">
            <AlertTriangle className="w-16 h-16 text-red-500" />
            <h1 className="text-3xl font-bold">SYSTEM INITIALIZATION FAILURE</h1>
            <p className="text-red-400 max-w-md text-center bg-red-500/10 p-4 rounded-lg border border-red-500/30">
                A critical error occurred while generating the initial simulation state from the AI core.
            </p>
            <p className="text-sm font-mono text-gray-500 max-w-xl text-center break-words">{error}</p>
            <button onClick={() => window.location.reload()} className="mt-4 px-6 py-2 bg-red-600 text-white font-bold rounded-lg hover:bg-red-700">REINITIALIZE</button>
        </div>
      );
  }
  
  if (!isAuthenticated) {
      return <Navigate to="/login" replace />;
  }

  const renderViewContent = () => {
    switch (activeView) {
        case View.Dashboard: return <Dashboard />;
        case View.Transactions: return <TransactionsView />;
        case View.SendMoney: return <SendMoneyView setActiveView={setActiveView} />;
        case View.Budgets: return <BudgetsView />;
        case View.FinancialGoals: return <FinancialGoalsView />;
        case View.CreditHealth: return <CreditHealthView />;
        case View.Investments: return <InvestmentsView />;
        case View.CryptoWeb3: return <CryptoView />;
        case View.AlgoTradingLab: return <AlgoTradingLab />;
        case View.ForexArena: return <ForexArena />;
        case View.CommoditiesExchange: return <CommoditiesExchange />;
        case View.RealEstateEmpire: return <RealEstateEmpire />;
        case View.ArtCollectibles: return <ArtCollectibles />;
        case View.DerivativesDesk: return <DerivativesDesk />;
        case View.VentureCapital: return <VentureCapitalDesk />;
        case View.PrivateEquity: return <PrivateEquityLounge />;
        case View.TaxOptimization: return <TaxOptimizationChamber />;
        case View.LegacyBuilder: return <LegacyBuilder />;
        case View.CorporateCommand: return <CorporateCommandView setActiveView={setActiveView} />;
        case View.ModernTreasury: return <ModernTreasuryView />;
        case View.OpenBanking: return <OpenBankingView />;
        case View.FinancialDemocracy: return <FinancialDemocracyView />;
        case View.AIAdStudio: return <AIAdStudioView />;
        case View.QuantumWeaver: return <QuantumWeaverView />;
        case View.AgentMarketplace: return <MarketplaceView />;
        case View.APIStatus: return <APIIntegrationView />;
        case View.Settings: return <SettingsView />;
        case View.DataNetwork: return <PlaidDashboardView />;
        case View.Payments: return <StripeDashboardView />;
        case View.CardPrograms: return <MarqetaDashboardView />;
        case View.SSO: return <SSOView />;
        case View.ConciergeService: return <ConciergeService />;
        case View.SovereignWealth: return <SovereignWealth />;
        case View.Philanthropy: return <PhilanthropyHub />;
        case View.Personalization: return <PersonalizationView />;
        case View.TheVision: return <TheVisionView />;
        case View.AIAdvisor: return <AIAdvisorView />;
        case View.AIInsights: return <AIInsights />;
        case View.SecurityCenter: return <SecurityView />;
        case View.SecurityCompliance: return <SecurityComplianceView />;
        case View.DeveloperHub: return <DeveloperHubView />;
        case View.SchemaExplorer: return <SchemaExplorer schemaData={{ definitions: {}, properties: {} }} />;
        case View.ResourceGraph: return <ResourceGraphView />;
        case View.ApiPlayground: return <ApiPlaygroundView />;
        case View.ComplianceOracle: return <ComplianceOracleView />;
        case View.GlobalPositionMap: return <GlobalPositionMap />;
        case View.GlobalSsiHub: return <GlobalSsiHubView />;
        case View.Security: return <SecurityView />;
        case View.VentureCapitalDeskView: return <VentureCapitalDeskView />;
        case View.CustomerDashboard: return <CustomerDashboard />;
        case View.VerificationReports: return <VerificationReportsView customerId="cust_1" />;
        case View.FinancialReporting: return <FinancialReportingView />;
        case View.StripeNexusDashboard: return <StripeNexusDashboard />;
        case View.TheBook: return <TheBookView />;
        case View.KnowledgeBase: return <KnowledgeBaseView />;
        case View.AccountDetails: return Wrapper(AccountDetails, { accountId: '1', customerId: 'c1' });
        case View.AccountList: return Wrapper(AccountList, { accounts: [] });
        case View.AccountStatementGrid: return Wrapper(AccountStatementGrid, { statementLines: [] });
        case View.AccountsView: return <AccountsView />;
        case View.AccountVerificationModal: return ModalWrapper(AccountVerificationModal, { externalAccount: {id: '1', verification_status: 'unverified' }, onSuccess: () => {}});
        case View.ACHDetailsDisplay: return Wrapper(ACHDetailsDisplay, { details: { routingNumber: '123', realAccountNumber: '456' } });
        case View.AICommandLog: return <AICommandLog />;
        case View.AIPredictionWidget: return <AIPredictionWidget />;
        case View.AssetCatalog: return Wrapper(AssetCatalog, { assets: [], onAssetSelected: () => {}, getAssetDetails: async () => ({}) });
        case View.AutomatedSweepRules: return <AutomatedSweepRules />;
        case View.BalanceReportChart: return Wrapper(BalanceReportChart, { data: [] });
        case View.BalanceTransactionTable: return Wrapper(BalanceTransactionTable, { balanceTransactions: [] });
        case View.CardDesignVisualizer: return Wrapper(CardDesignVisualizer, { design: { id: 'd_1', physical_bundle: { features: {} } } });
        case View.ChargeDetailModal: return ModalWrapper(ChargeDetailModal, { charge: {id: 'ch_1'}, onClose: () => {}});
        case View.ChargeList: return <ChargeList />;
        case View.ConductorConfigurationView: return <ConductorConfigurationView />;
        case View.CounterpartyDetails: return Wrapper(CounterpartyDetails, { counterpartyId: 'cp_1' });
        case View.CounterpartyForm: return Wrapper(CounterpartyForm, { counterparties: [], onSubmit: () => {}, onCancel: () => {} });
        case View.DisruptionIndexMeter: return Wrapper(DisruptionIndexMeter, { indexValue: 50 });
        case View.DocumentUploader: return Wrapper(DocumentUploader, { documentableType: 'test', documentableId: '1' });
        case View.DownloadLink: return Wrapper(DownloadLink, { url: '#', filename: 'test.pdf' });
        case View.EarlyFraudWarningFeed: return <EarlyFraudWarningFeed />;
        case View.ElectionChoiceForm: return Wrapper(ElectionChoiceForm, { availableChoices: {}, onSubmit: () => {}, onCancel: () => {} });
        case View.EventNotificationCard: return Wrapper(EventNotificationCard, { event: {} });
        case View.ExpectedPaymentsTable: return <ExpectedPaymentsTable />;
        case View.ExternalAccountCard: return Wrapper(ExternalAccountCard, { account: {id: '1', account_details: [], routing_details: []}});
        case View.ExternalAccountForm: return Wrapper(ExternalAccountForm, { counterparties: [], onSubmit: () => {}, onCancel: () => {} });
        case View.ExternalAccountsTable: return Wrapper(ExternalAccountTable, { accounts: [] });
        case View.FinancialAccountCard: return Wrapper(FinancialAccountCard, { financialAccount: {id: 'fa_1', balance: { cash: {}}, supported_currencies: []}});
        case View.IncomingPaymentDetailList: return <IncomingPaymentDetailList />;
        case View.InvoiceFinancingRequest: return Wrapper(InvoiceFinancingRequest, { onSubmit: () => {} });
        case View.PaymentInitiationForm: return <PaymentInitiationForm />;
        case View.PaymentMethodDetails: return Wrapper(PaymentMethodDetails, { details: { type: 'card', card: {} }});
        case View.PaymentOrderForm: return Wrapper(PaymentOrderForm, { internalAccounts: [], externalAccounts: [], onSubmit: () => {}, onCancel: () => {} });
        case View.PnLChart: return Wrapper(PnLChart, { data: [], algorithmName: 'Test' });
        case View.RefundForm: return <RefundForm />;
        case View.RemittanceInfoEditor: return Wrapper(RemittanceInfoEditor, { onChange: () => {} });
        case View.ReportingView: return <ReportingView />;
        case View.ReportRunGenerator: return <ReportRunGenerator />;
        case View.ReportStatusIndicator: return Wrapper(ReportStatusIndicator, { status: 'success' });
        case View.SsiEditorForm: return Wrapper(SsiEditorForm, { onSubmit: () => {}, onCancel: () => {} });
        case View.StripeStatusBadge: return Wrapper(StripeStatusBadge, { status: 'succeeded', objectType: 'charge' });
        case View.StructuredPurposeInput: return Wrapper(StructuredPurposeInput, { onChange: () => {}, value: null });
        case View.SubscriptionList: return Wrapper(SubscriptionList, { subscriptions: [] });
        case View.TimeSeriesChart: return Wrapper(TimeSeriesChart, { data: { labels: [], datasets: [] } });
        case View.TradeConfirmationModal: return ModalWrapper(TradeConfirmationModal, { settlementInstruction: { messageId: '1' } });
        case View.TransactionFilter: return Wrapper(TransactionFilter, { onApplyFilters: () => {} });
        case View.TransactionList: return Wrapper(TransactionList, { transactions: [] });
        case View.TreasuryTransactionList: return Wrapper(TreasuryTransactionList, { transactions: [] });
        case View.TreasuryView: return <TreasuryView />;
        case View.UniversalObjectInspector: return Wrapper(UniversalObjectInspector, { data: { sample: 'data' } });
        case View.VirtualAccountForm: return Wrapper(VirtualAccountForm, { onSubmit: () => {}, isSubmitting: false });
        case View.VirtualAccountsTable: return Wrapper(VirtualAccountsTable, { onEdit: () => {}, onDelete: () => {} });
        case View.VoiceControl: return DataContextWrapper(VoiceControl as any);
        case View.WebhookSimulator: return Wrapper(WebhookSimulator, { stripeAccountId: 'acct_mock' });

        default: 
            return (
                <div className="flex flex-col items-center justify-center h-full text-gray-400">
                    <AlertTriangle className="w-12 h-12 mb-4 text-yellow-500" />
                    <h2 className="text-xl font-bold text-white mb-2">View Not Found</h2>
                    <p>The requested view could not be found or is currently unavailable.</p>
                    <button 
                        onClick={() => setActiveView(View.Dashboard)}
                        className="mt-4 px-4 py-2 bg-cyan-600 hover:bg-cyan-700 text-white rounded transition-colors"
                    >
                        Return to Dashboard
                    </button>
                </div>
            );
    }
  };

  const renderView = () => (
    <ViewErrorBoundary>
      {renderViewContent()}
    </ViewErrorBoundary>
  );

  return (
    <div className="flex h-full bg-gray-900 text-white overflow-hidden font-sans">
      <Sidebar 
        isOpen={isSidebarOpen} 
        setIsOpen={setIsSidebarOpen} 
      />
      <div className="relative flex flex-col flex-1 overflow-y-auto overflow-x-hidden">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        
        <main className="w-full flex-grow p-6">
            {renderView()}
        </main>
      </div>
      
      <VoiceControl setActiveView={setActiveView} />
    </div>
  );
};

export default SApp;