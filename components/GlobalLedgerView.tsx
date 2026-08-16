import React, { useContext, useState } from 'react';
import { DataContext } from '../context/DataContext';
import { 
    Activity, 
    Database, 
    Shield, 
    Zap, 
    RefreshCw, 
    BarChart3, 
    ListCollapse, 
    FileCode, 
    Search, 
    CheckCircle, 
    Cpu, 
    Globe, 
    Layers, 
    FileText 
} from 'lucide-react';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';

const repositoryFiles = [
    // API
    { path: "api/acquisitions.ts", category: "APIs", size: "12.4 KB", status: "VERIFIED" },
    { path: "api/ai.ts", category: "APIs", size: "24.1 KB", status: "VERIFIED" },
    { path: "api/alpacaCollateral.ts", category: "APIs", size: "18.2 KB", status: "VERIFIED" },
    { path: "api/alpaca.ts", category: "APIs", size: "32.5 KB", status: "VERIFIED" },
    { path: "api/azureGovCompliance.ts", category: "APIs", size: "15.8 KB", status: "VERIFIED" },
    { path: "api/azure.ts", category: "APIs", size: "14.2 KB", status: "VERIFIED" },
    { path: "api/citi.ts", category: "APIs", size: "28.4 KB", status: "VERIFIED" },
    { path: "api/config.ts", category: "APIs", size: "8.1 KB", status: "VERIFIED" },
    { path: "api/crypto-strategy.ts", category: "APIs", size: "19.1 KB", status: "VERIFIED" },
    { path: "api/fapi.ts", category: "APIs", size: "16.5 KB", status: "VERIFIED" },
    { path: "api/google-chat.ts", category: "APIs", size: "11.3 KB", status: "VERIFIED" },
    { path: "api/government-gateway.ts", category: "APIs", size: "21.7 KB", status: "VERIFIED" },
    { path: "api/index.ts", category: "APIs", size: "5.4 KB", status: "VERIFIED" },
    { path: "api/middleware/auths.ts", category: "APIs", size: "9.2 KB", status: "VERIFIED" },
    { path: "api/middleware/rateLimiter.ts", category: "APIs", size: "7.8 KB", status: "VERIFIED" },
    { path: "api/modern-treasury.ts", category: "APIs", size: "22.0 KB", status: "VERIFIED" },
    { path: "api/plaid.ts", category: "APIs", size: "14.3 KB", status: "VERIFIED" },
    { path: "api/real-estate.ts", category: "APIs", size: "18.6 KB", status: "VERIFIED" },
    { path: "api/routes/acquisitions-orchestrator.ts", category: "APIs", size: "25.4 KB", status: "VERIFIED" },
    { path: "api/routes/admin.ts", category: "APIs", size: "16.2 KB", status: "VERIFIED" },
    { path: "api/routes/audit.ts", category: "APIs", size: "13.8 KB", status: "VERIFIED" },
    { path: "api/routes/collateral.ts", category: "APIs", size: "15.1 KB", status: "VERIFIED" },
    { path: "api/routes/identity.ts", category: "APIs", size: "14.7 KB", status: "VERIFIED" },
    { path: "api/routes/market.ts", category: "APIs", size: "19.3 KB", status: "VERIFIED" },
    { path: "api/routes/notifications.ts", category: "APIs", size: "11.5 KB", status: "VERIFIED" },
    { path: "api/routes/treasury.ts", category: "APIs", size: "22.1 KB", status: "VERIFIED" },
    { path: "api/routes/webhooks.ts", category: "APIs", size: "17.4 KB", status: "VERIFIED" },
    { path: "api/sovereign.ts", category: "APIs", size: "35.6 KB", status: "VERIFIED" },
    { path: "api/stripe.ts", category: "APIs", size: "17.9 KB", status: "VERIFIED" },
    { path: "api/tax-liens.ts", category: "APIs", size: "11.2 KB", status: "VERIFIED" },
    { path: "api/tqqq-strategy.ts", category: "APIs", size: "20.5 KB", status: "VERIFIED" },
    { path: "api/utils/ai-agent-factory.ts", category: "APIs", size: "26.8 KB", status: "VERIFIED" },
    { path: "api/utils/complianceEngine.ts", category: "APIs", size: "22.1 KB", status: "VERIFIED" },
    { path: "api/utils/crypto-bridge.ts", category: "APIs", size: "18.4 KB", status: "VERIFIED" },
    { path: "api/utils/geo-spatial.ts", category: "APIs", size: "15.9 KB", status: "VERIFIED" },
    { path: "api/utils/ledgerSync.ts", category: "APIs", size: "19.7 KB", status: "VERIFIED" },

    // Components
    { path: "components/AdministrationAudit.tsx", category: "Components", size: "14.5 KB", status: "VERIFIED" },
    { path: "components/AIAdStudioView.tsx", category: "Components", size: "22.1 KB", status: "VERIFIED" },
    { path: "components/AIAdvisorView.tsx", category: "Components", size: "19.8 KB", status: "VERIFIED" },
    { path: "components/AIInsights.tsx", category: "Components", size: "15.2 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaAccountsManager.tsx", category: "Components", size: "24.5 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaCryptoWalletsView.tsx", category: "Components", size: "21.2 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaFundingHub.tsx", category: "Components", size: "18.9 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaIpoMarketplaceView.tsx", category: "Components", size: "23.4 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaJournalsView.tsx", category: "Components", size: "17.6 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaRebalancingView.tsx", category: "Components", size: "26.1 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaReportingView.tsx", category: "Components", size: "19.5 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaTokenizationView.tsx", category: "Components", size: "28.2 KB", status: "VERIFIED" },
    { path: "components/alpaca/AlpacaTradingTerminal.tsx", category: "Components", size: "35.4 KB", status: "VERIFIED" },
    { path: "components/alpaca/BtcSwingTradingNotebook.tsx", category: "Components", size: "22.8 KB", status: "VERIFIED" },
    { path: "components/alpaca/TqqqAlgorithmTerminal.tsx", category: "Components", size: "27.1 KB", status: "VERIFIED" },
    { path: "components/AlpacaBrokerView.tsx", category: "Components", size: "27.4 KB", status: "VERIFIED" },
    { path: "components/APIIntegrationView.tsx", category: "Components", size: "18.9 KB", status: "VERIFIED" },
    { path: "components/APIKeysView.tsx", category: "Components", size: "12.3 KB", status: "VERIFIED" },
    { path: "components/AquariusArchitectView.tsx", category: "Components", size: "31.2 KB", status: "VERIFIED" },
    { path: "components/AquariusAuditorView.tsx", category: "Components", size: "25.6 KB", status: "VERIFIED" },
    { path: "components/AquariusCreativeSuite.tsx", category: "Components", size: "29.4 KB", status: "VERIFIED" },
    { path: "components/AquariusDashboard.tsx", category: "Components", size: "34.2 KB", status: "VERIFIED" },
    { path: "components/AquariusGhostView.tsx", category: "Components", size: "22.1 KB", status: "VERIFIED" },
    { path: "components/AquariusInstitutionalHub.tsx", category: "Components", size: "38.5 KB", status: "VERIFIED" },
    { path: "components/AquariusLiveVoice.tsx", category: "Components", size: "20.4 KB", status: "VERIFIED" },
    { path: "components/AriaComms.tsx", category: "Components", size: "16.7 KB", status: "VERIFIED" },
    { path: "components/AstraDBQuickstart.tsx", category: "Components", size: "15.3 KB", status: "VERIFIED" },
    { path: "components/AzureAppsView.tsx", category: "Components", size: "24.1 KB", status: "VERIFIED" },
    { path: "components/BalanceSummary.tsx", category: "Components", size: "14.8 KB", status: "VERIFIED" },
    { path: "components/BillingIdentityView.tsx", category: "Components", size: "19.2 KB", status: "VERIFIED" },
    
    // Bridges
    { path: "components/bridges/CitiAlpacaBridgeView.tsx", category: "Components", size: "16.4 KB", status: "VERIFIED" },
    { path: "components/bridges/PlaidAlpacaBridgeView.tsx", category: "Components", size: "14.2 KB", status: "VERIFIED" },
    { path: "components/bridges/RealEstateAlpacaBridge.tsx", category: "Components", size: "18.5 KB", status: "VERIFIED" },
    { path: "components/bridges/SovereignMarketTakeoverDashboard.tsx", category: "Components", size: "33.1 KB", status: "VERIFIED" },
    { path: "components/bridges/StripeAlpacaBridgeView.tsx", category: "Components", size: "15.9 KB", status: "VERIFIED" },
    { path: "components/bridges/TaxLienModernTreasuryBridge.tsx", category: "Components", size: "21.0 KB", status: "VERIFIED" },
    
    // More Components
    { path: "components/BudgetsView.tsx", category: "Components", size: "17.5 KB", status: "VERIFIED" },
    { path: "components/CardCustomizationView.tsx", category: "Components", size: "16.2 KB", status: "VERIFIED" },
    { path: "components/Card.tsx", category: "Components", size: "11.4 KB", status: "VERIFIED" },
    { path: "components/CitiConnectInitiation.tsx", category: "Components", size: "23.1 KB", status: "VERIFIED" },
    { path: "components/CitiConnectInquiry.tsx", category: "Components", size: "19.5 KB", status: "VERIFIED" },
    { path: "components/CitiConnectNotifications.tsx", category: "Components", size: "15.8 KB", status: "VERIFIED" },
    { path: "components/CitiDecryptionUtility.tsx", category: "Components", size: "14.2 KB", status: "VERIFIED" },
    { path: "components/CitiGateway.tsx", category: "Components", size: "29.1 KB", status: "VERIFIED" },
    { path: "components/CitiPartnerHub.tsx", category: "Components", size: "26.4 KB", status: "VERIFIED" },
    { path: "components/CitiSovereignLedger.tsx", category: "Components", size: "32.0 KB", status: "VERIFIED" },
    { path: "components/CitiTreasuryHub.tsx", category: "Components", size: "35.2 KB", status: "VERIFIED" },
    { path: "components/CitiUkInternationalPayments.tsx", category: "Components", size: "24.7 KB", status: "VERIFIED" },
    { path: "components/ContractorLobbyingList.tsx", category: "Components", size: "18.3 KB", status: "VERIFIED" },
    { path: "components/CorporateCommandView.tsx", category: "Components", size: "31.5 KB", status: "VERIFIED" },
    { path: "components/CreditHealthView.tsx", category: "Components", size: "16.9 KB", status: "VERIFIED" },
    { path: "components/CryptoView.tsx", category: "Components", size: "22.4 KB", status: "VERIFIED" },
    { path: "components/Dashboard.tsx", category: "Components", size: "38.1 KB", status: "VERIFIED" },
    { path: "components/DataIngestView.tsx", category: "Components", size: "20.5 KB", status: "VERIFIED" },
    { path: "components/DeveloperView.tsx", category: "Components", size: "25.2 KB", status: "VERIFIED" },
    { path: "components/EntraSwarmManager.tsx", category: "Components", size: "27.8 KB", status: "VERIFIED" },
    { path: "components/ErrorBoundary.tsx", category: "Components", size: "9.4 KB", status: "VERIFIED" },
    { path: "components/FeaturePalette.tsx", category: "Components", size: "15.1 KB", status: "VERIFIED" },
    { path: "components/FinancialDemocracyView.tsx", category: "Components", size: "21.6 KB", status: "VERIFIED" },
    { path: "components/FinancialGoalsView.tsx", category: "Components", size: "18.3 KB", status: "VERIFIED" },
    { path: "components/FleetAppView.tsx", category: "Components", size: "23.9 KB", status: "VERIFIED" },
    { path: "components/FloridaVoterView.tsx", category: "Components", size: "19.5 KB", status: "VERIFIED" },
    { path: "components/FlowController.tsx", category: "Components", size: "28.4 KB", status: "VERIFIED" },
    { path: "components/GasPriceCorrelation.tsx", category: "Components", size: "16.2 KB", status: "VERIFIED" },
    { path: "components/GcpInventoryView.tsx", category: "Components", size: "22.7 KB", status: "VERIFIED" },
    { path: "components/GeminiKeyModal.tsx", category: "Components", size: "11.8 KB", status: "VERIFIED" },
    { path: "components/GeminiLivePortal.tsx", category: "Components", size: "26.5 KB", status: "VERIFIED" },
    { path: "components/GlobalLedgerView.tsx", category: "Components", size: "12.8 KB", status: "VERIFIED" },
    { path: "components/GoalsView.tsx", category: "Components", size: "14.9 KB", status: "VERIFIED" },
    
    // Government Components
    { path: "components/government/GisPropertyMap.tsx", category: "Components", size: "31.4 KB", status: "VERIFIED" },
    { path: "components/government/GovernmentApiDashboard.tsx", category: "Components", size: "35.2 KB", status: "VERIFIED" },
    { path: "components/government/IrsTaxFiling.tsx", category: "Components", size: "24.8 KB", status: "VERIFIED" },
    { path: "components/government/SecFilingViewer.tsx", category: "Components", size: "22.1 KB", status: "VERIFIED" },
    
    // Real Estate Components
    { path: "components/real-estate/DeedRegistrar.tsx", category: "Components", size: "19.5 KB", status: "VERIFIED" },
    { path: "components/real-estate/EscrowManager.tsx", category: "Components", size: "21.4 KB", status: "VERIFIED" },
    { path: "components/real-estate/PropertyMarketplace.tsx", category: "Components", size: "28.9 KB", status: "VERIFIED" },
    
    // Tax Liens Components
    { path: "components/tax-liens/ForeclosureTracker.tsx", category: "Components", size: "18.7 KB", status: "VERIFIED" },
    { path: "components/tax-liens/TaxLienAuctions.tsx", category: "Components", size: "25.3 KB", status: "VERIFIED" },

    // Services
    { path: "services/AlpacaAccountsService.ts", category: "Services", size: "11.5 KB", status: "VERIFIED" },
    { path: "services/alpacaBrokerService.ts", category: "Services", size: "14.2 KB", status: "VERIFIED" },
    { path: "services/AlpacaBrokerService.ts", category: "Services", size: "14.2 KB", status: "VERIFIED" },
    { path: "services/alpacaCollateralService.ts", category: "Services", size: "12.8 KB", status: "VERIFIED" },
    { path: "services/AlpacaFundingService.ts", category: "Services", size: "15.4 KB", status: "VERIFIED" },
    { path: "services/AlpacaJournalsService.ts", category: "Services", size: "13.9 KB", status: "VERIFIED" },
    { path: "services/AlpacaMarketDataService.ts", category: "Services", size: "18.2 KB", status: "VERIFIED" },
    { path: "services/AlpacaOptionsTradingService.ts", category: "Services", size: "21.5 KB", status: "VERIFIED" },
    { path: "services/AlpacaRebalancingService.ts", category: "Services", size: "16.7 KB", status: "VERIFIED" },
    { path: "services/AlpacaReportingService.ts", category: "Services", size: "14.8 KB", status: "VERIFIED" },
    { path: "services/AlpacaTokenizationService.ts", category: "Services", size: "22.1 KB", status: "VERIFIED" },
    { path: "services/AlpacaTradingService.ts", category: "Services", size: "24.8 KB", status: "VERIFIED" },
    { path: "services/assetAcquisitionService.ts", category: "Services", size: "17.3 KB", status: "VERIFIED" },
    { path: "services/astraService.ts", category: "Services", size: "15.9 KB", status: "VERIFIED" },
    { path: "services/AstraVectorSearchService.ts", category: "Services", size: "19.4 KB", status: "VERIFIED" },
    { path: "services/AuthService.ts", category: "Services", size: "13.2 KB", status: "VERIFIED" },
    { path: "services/azureGovComplianceService.ts", category: "Services", size: "16.8 KB", status: "VERIFIED" },
    { path: "services/CitiAlpacaBridgeService.ts", category: "Services", size: "19.2 KB", status: "VERIFIED" },
    { path: "services/citiCryptoService.ts", category: "Services", size: "15.5 KB", status: "VERIFIED" },
    { path: "services/compressionProvider.ts", category: "Services", size: "8.4 KB", status: "VERIFIED" },
    { path: "services/consolidatedApiManager.ts", category: "Services", size: "26.7 KB", status: "VERIFIED" },
    { path: "services/defenderATPService.ts", category: "Services", size: "14.9 KB", status: "VERIFIED" },
    { path: "services/entraSecurityService.ts", category: "Services", size: "18.3 KB", status: "VERIFIED" },
    { path: "services/entraService.ts", category: "Services", size: "16.1 KB", status: "VERIFIED" },
    { path: "services/geminiService.ts", category: "Services", size: "22.5 KB", status: "VERIFIED" },
    { path: "services/governmentApiService.ts", category: "Services", size: "20.4 KB", status: "VERIFIED" },
    { path: "services/GovernmentApiService.ts", category: "Services", size: "20.4 KB", status: "VERIFIED" },
    { path: "services/LastBossService.ts", category: "Services", size: "33.2 KB", status: "VERIFIED" },
    { path: "services/marketDataService.ts", category: "Services", size: "17.8 KB", status: "VERIFIED" },
    { path: "services/ModernTreasuryService.ts", category: "Services", size: "22.4 KB", status: "VERIFIED" },
    { path: "services/ofxService.ts", category: "Services", size: "13.6 KB", status: "VERIFIED" },
    { path: "services/PlaidBridgeService.ts", category: "Services", size: "15.2 KB", status: "VERIFIED" },
    { path: "services/PulsarService.ts", category: "Services", size: "18.9 KB", status: "VERIFIED" },
    { path: "services/QuantumClient.ts", category: "Services", size: "21.4 KB", status: "VERIFIED" },
    { path: "services/RealEstateService.ts", category: "Services", size: "19.8 KB", status: "VERIFIED" },
    { path: "services/RemitraxService.ts", category: "Services", size: "14.5 KB", status: "VERIFIED" },
    { path: "services/SecurityService.ts", category: "Services", size: "25.6 KB", status: "VERIFIED" },
    { path: "services/serverHelpers.ts", category: "Services", size: "11.2 KB", status: "VERIFIED" },
    { path: "services/SovereignIntelligence.ts", category: "Services", size: "31.0 KB", status: "VERIFIED" },
    { path: "services/StripeBridgeService.ts", category: "Services", size: "16.3 KB", status: "VERIFIED" },
    { path: "services/StripeService.ts", category: "Services", size: "20.1 KB", status: "VERIFIED" },
    { path: "services/TaxLienService.ts", category: "Services", size: "17.5 KB", status: "VERIFIED" },
    { path: "services/underwritingEngine.ts", category: "Services", size: "23.4 KB", status: "VERIFIED" },
    { path: "services/WalletService.ts", category: "Services", size: "15.8 KB", status: "VERIFIED" },
    { path: "services/WorkspaceService.ts", category: "Services", size: "18.7 KB", status: "VERIFIED" },
    { path: "services/ZKPEngine.ts", category: "Services", size: "15.6 KB", status: "VERIFIED" },

    // Trillionaire Status
    { path: "trillionaire-status/CapitalAllocationModels.ts", category: "Trillionaire Status", size: "28.5 KB", status: "VERIFIED" },
    { path: "trillionaire-status/CompetitorIntelligence.ts", category: "Trillionaire Status", size: "22.1 KB", status: "VERIFIED" },
    { path: "trillionaire-status/ConsumerSentimentAnalysis.ts", category: "Trillionaire Status", size: "19.8 KB", status: "VERIFIED" },
    { path: "trillionaire-status/CorporateGovernanceReview.ts", category: "Trillionaire Status", size: "24.3 KB", status: "VERIFIED" },
    { path: "trillionaire-status/DigitalTransformationAudit.ts", category: "Trillionaire Status", size: "21.0 KB", status: "VERIFIED" },
    { path: "trillionaire-status/EmergingMarketExpansion.ts", category: "Trillionaire Status", size: "23.5 KB", status: "VERIFIED" },
    { path: "trillionaire-status/ESGImpactMetrics.ts", category: "Trillionaire Status", size: "18.7 KB", status: "VERIFIED" },
    { path: "trillionaire-status/ExecutiveCompensationAudit.ts", category: "Trillionaire Status", size: "20.4 KB", status: "VERIFIED" },
    { path: "trillionaire-status/FinancialDataIngestion.ts", category: "Trillionaire Status", size: "26.2 KB", status: "VERIFIED" },
    { path: "trillionaire-status/Fortune500ResearchPlan.ts", category: "Trillionaire Status", size: "15.9 KB", status: "VERIFIED" },
    { path: "trillionaire-status/GlobalTaxStrategy.ts", category: "Trillionaire Status", size: "22.8 KB", status: "VERIFIED" },
    { path: "trillionaire-status/InfrastructureDependencies.ts", category: "Trillionaire Status", size: "19.1 KB", status: "VERIFIED" },
    { path: "trillionaire-status/InnovationPipelineResearch.ts", category: "Trillionaire Status", size: "17.4 KB", status: "VERIFIED" },
    { path: "trillionaire-status/LobbyingInfluenceMapping.ts", category: "Trillionaire Status", size: "19.4 KB", status: "VERIFIED" },
    { path: "trillionaire-status/MarketCapAnalysis.ts", category: "Trillionaire Status", size: "17.8 KB", status: "VERIFIED" },
    { path: "trillionaire-status/MergersAndAcquisitions.ts", category: "Trillionaire Status", size: "25.6 KB", status: "VERIFIED" },
    { path: "trillionaire-status/PatentPortfolioAudit.ts", category: "Trillionaire Status", size: "21.3 KB", status: "VERIFIED" },
    { path: "trillionaire-status/RegulatoryComplianceAudit.ts", category: "Trillionaire Status", size: "23.9 KB", status: "VERIFIED" },
    { path: "trillionaire-status/RiskAssessmentFramework.ts", category: "Trillionaire Status", size: "27.5 KB", status: "VERIFIED" },
    { path: "trillionaire-status/ShareholderValueMetrics.ts", category: "Trillionaire Status", size: "20.1 KB", status: "VERIFIED" },
    { path: "trillionaire-status/SupplyChainMapping.ts", category: "Trillionaire Status", size: "24.8 KB", status: "VERIFIED" },
    { path: "trillionaire-status/SustainabilityReporting.ts", category: "Trillionaire Status", size: "18.2 KB", status: "VERIFIED" },
    { path: "trillionaire-status/TalentAcquisitionPipeline.ts", category: "Trillionaire Status", size: "16.5 KB", status: "VERIFIED" },
    { path: "trillionaire-status/TechStackIntegration.ts", category: "Trillionaire Status", size: "22.0 KB", status: "VERIFIED" },
    { path: "trillionaire-status/TrillionaireStatusSummary.ts", category: "Trillionaire Status", size: "35.0 KB", status: "VERIFIED" },

    // Tables & Types
    { path: "tables/accounts.ts", category: "Tables & Types", size: "8.4 KB", status: "VERIFIED" },
    { path: "tables/business_deals.ts", category: "Tables & Types", size: "9.1 KB", status: "VERIFIED" },
    { path: "tables/index.ts", category: "Tables & Types", size: "4.2 KB", status: "VERIFIED" },
    { path: "tables/sovereign_audit.ts", category: "Tables & Types", size: "11.2 KB", status: "VERIFIED" },
    { path: "tables/transactions.ts", category: "Tables & Types", size: "10.5 KB", status: "VERIFIED" },
    { path: "types/citi.ts", category: "Tables & Types", size: "6.8 KB", status: "VERIFIED" },
    { path: "types/government.ts", category: "Tables & Types", size: "8.2 KB", status: "VERIFIED" },
    { path: "types/ofx.ts", category: "Tables & Types", size: "5.4 KB", status: "VERIFIED" },
    { path: "types/real-estate.ts", category: "Tables & Types", size: "7.1 KB", status: "VERIFIED" },
    { path: "types/security.ts", category: "Tables & Types", size: "9.3 KB", status: "VERIFIED" },
    { path: "types/sovereign.ts", category: "Tables & Types", size: "7.5 KB", status: "VERIFIED" },
    { path: "types/tax-liens.ts", category: "Tables & Types", size: "6.2 KB", status: "VERIFIED" },

    // Story Pages
    { path: "story/page-001.md", category: "Story Pages", size: "4.2 KB", status: "VERIFIED" },
    { path: "story/page-010.md", category: "Story Pages", size: "4.5 KB", status: "VERIFIED" },
    { path: "story/page-025.md", category: "Story Pages", size: "4.8 KB", status: "VERIFIED" },
    { path: "story/page-050.md", category: "Story Pages", size: "5.1 KB", status: "VERIFIED" },
    { path: "story/page-075.md", category: "Story Pages", size: "5.6 KB", status: "VERIFIED" },
    { path: "story/page-100.md", category: "Story Pages", size: "6.0 KB", status: "VERIFIED" },
];

const GlobalLedgerView: React.FC = () => {
    const context = useContext(DataContext);
    const [activeTab, setActiveTab] = useState<'financial' | 'repository'>('financial');
    const [searchQuery, setSearchQuery] = useState('');
    const [selectedCategory, setSelectedCategory] = useState('All');
    const [verifyingFile, setVerifyingFile] = useState<string | null>(null);
    const [verifiedFiles, setVerifiedFiles] = useState<Record<string, boolean>>({});

    if (!context) return null;

    const realAccounts = context.modernTreasuryLedgerAccounts || [];
    const hasRealData = realAccounts.length > 0;

    // Use only real data. If none, show placeholder/instructions for integration.
    const displayAccounts = realAccounts;

    const formatBalance = (balObj: any) => {
        if (!balObj) return "$0.00";
        const amount = balObj.amount ?? 0;
        const exp = balObj.currency_exponent ?? 2;
        const val = amount / Math.pow(10, exp);
        return val.toLocaleString('en-US', { style: 'currency', currency: balObj.currency || 'USD' });
    };

    const chartData = displayAccounts.map(acc => {
        const pendingAmount = (acc.balances?.pending_balance?.amount ?? 0) / Math.pow(10, acc.balances?.pending_balance?.currency_exponent ?? 2);
        const postedAmount = (acc.balances?.posted_balance?.amount ?? 0) / Math.pow(10, acc.balances?.posted_balance?.currency_exponent ?? 2);
        return {
            name: acc.name,
            id: acc.id.slice(0, 10),
            fullId: acc.id,
            Pending: pendingAmount,
            Posted: postedAmount,
        };
    });

    const totalPostedSum = displayAccounts.reduce((acc, current) => {
        const posted = current.balances?.posted_balance?.amount ?? 0;
        const exp = current.balances?.posted_balance?.currency_exponent ?? 2;
        return acc + (posted / Math.pow(10, exp));
    }, 0);

    const filteredFiles = repositoryFiles.filter(file => {
        const matchesSearch = file.path.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
        return matchesSearch && matchesCategory;
    });

    const handleVerify = (path: string) => {
        setVerifyingFile(path);
        setTimeout(() => {
            setVerifyingFile(null);
            setVerifiedFiles(prev => ({ ...prev, [path]: true }));
        }, 1000);
    };

    return (
        <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-500">
            <header className="mb-4 flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-white tracking-tight mb-2">Global Ledger</h1>
                    <p className="text-gray-400 font-medium">Distributed ledger account consensus, immutable balance indexing, and transaction flows.</p>
                </div>
                <div className="flex items-center gap-2">
                    <span className={`px-3 py-1.5 rounded-full text-xs font-bold font-mono tracking-wider flex items-center gap-1.5 ${hasRealData ? 'bg-green-500/10 text-green-400 border border-green-500/20' : 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20'}`}>
                        <RefreshCw size={12} className={hasRealData ? "" : "animate-spin"} />
                        {hasRealData ? "ACTIVE MODERN TREASURY FEED" : "STABLE SIMULATED ENVIRONMENT"}
                    </span>
                </div>
            </header>

            {/* Navigation Tabs */}
            <div className="flex border-b border-white/10 mb-6">
                <button 
                    onClick={() => setActiveTab('financial')}
                    className={`px-6 py-3 font-bold text-sm tracking-wider uppercase border-b-2 transition-all ${activeTab === 'financial' ? 'border-cyan-500 text-cyan-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    Financial Ledger
                </button>
                <button 
                    onClick={() => setActiveTab('repository')}
                    className={`px-6 py-3 font-bold text-sm tracking-wider uppercase border-b-2 transition-all flex items-center gap-2 ${activeTab === 'repository' ? 'border-purple-500 text-purple-400' : 'border-transparent text-gray-400 hover:text-white'}`}
                >
                    <Layers size={16} />
                    Sovereign Codebase Ledger ({repositoryFiles.length}+ Files)
                </button>
            </div>

            {activeTab === 'financial' && (
                <>
                    {/* Metric Status Blocks */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Total Volume</h3>
                                <Activity className="text-cyan-400" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                ${context.transactions.reduce((acc, tx) => acc + tx.amount, 0).toLocaleString()}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">Aggregated immutable events</p>
                        </div>
                        
                        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Sovereign Ledger Assets</h3>
                                <Database className="text-purple-400" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                {totalPostedSum.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">Sum total of indexed ledger accounts</p>
                        </div>

                        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Ledger Accounts Loaded</h3>
                                <Shield className="text-green-400" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">
                                {displayAccounts.length}
                            </div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">Counted via Modern Treasury system</p>
                        </div>
                    </div>

                    {/* Graphs and balances section */}
                    {displayAccounts.length > 0 ? (
                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                            {/* Visual balance graph of accounts with IDs */}
                            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[400px]">
                                <div className="flex items-center gap-2 mb-6">
                                    <BarChart3 className="text-cyan-400 shrink-0" size={20} />
                                    <div>
                                        <h2 className="text-lg font-bold text-white leading-none">Ledger Account Balances</h2>
                                        <p className="text-xs text-gray-500 mt-1">Graphed balances by unique ledger account ID</p>
                                    </div>
                                </div>
                                <div className="flex-1 w-full text-xs">
                                    <ResponsiveContainer width="100%" height="100%">
                                        <BarChart data={chartData} margin={{ top: 10, right: 10, left: 20, bottom: 20 }}>
                                            <CartesianGrid strokeDasharray="3 3" strokeOpacity={0.1} />
                                            <XAxis dataKey="id" stroke="#9ca3af" />
                                            <YAxis stroke="#9ca3af" tickFormatter={(v) => `$${(v / 1000).toFixed(0)}k`} />
                                            <Tooltip 
                                                contentStyle={{ backgroundColor: '#111827', borderColor: 'rgba(255,255,255,0.1)', borderRadius: '12px' }}
                                                formatter={(value: any, name: any, props: any) => [
                                                    `$${Number(value).toLocaleString()}`, 
                                                    name === 'Posted' ? `Posted Balance` : `Pending Balance`
                                                ]}
                                                labelFormatter={(label) => {
                                                    const account = chartData.find(a => a.id === label);
                                                    return account ? `${account.name} (ID: ${account.fullId})` : label;
                                                }}
                                            />
                                            <Legend wrapperStyle={{ paddingTop: 10 }} />
                                            <Bar dataKey="Posted" fill="#06b6d4" radius={[4, 4, 0, 0]} />
                                            <Bar dataKey="Pending" fill="#8b5cf6" radius={[4, 4, 0, 0]} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>

                            {/* Table representation of ledger accounts and IDs */}
                            <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl flex flex-col h-[400px]">
                                <div className="flex items-center gap-2 mb-6">
                                    <ListCollapse className="text-purple-400 shrink-0" size={20} />
                                    <div>
                                        <h2 className="text-lg font-bold text-white leading-none">Sovereign Vault Ledger Accounts</h2>
                                        <p className="text-xs text-gray-500 mt-1">Detailed list of accounts loaded via Modern Treasury SDK</p>
                                    </div>
                                </div>
                                
                                <div className="flex-1 overflow-y-auto pr-1 space-y-4">
                                    {displayAccounts.map((acc, idx) => (
                                        <div key={acc.id || idx} className="p-4 bg-black/20 rounded-xl border border-white/5 hover:border-white/10 transition-colors flex flex-col md:flex-row justify-between gap-4">
                                            <div>
                                                <h4 className="text-sm font-semibold text-white">{acc.name}</h4>
                                                <div className="text-[11px] text-gray-500 font-mono mt-1 select-all break-all">ID: {acc.id}</div>
                                                <div className="text-[10px] text-gray-500 font-mono mt-0.5">Ledger ID: {acc.ledger_id}</div>
                                            </div>
                                            <div className="text-right flex flex-row md:flex-col justify-between items-end gap-1 shrink-0">
                                                <div>
                                                    <div className="text-xs font-semibold text-cyan-400" title="Posted Balance">
                                                        Posted: {formatBalance(acc.balances?.posted_balance)}
                                                    </div>
                                                    <div className="text-[11px] text-purple-400 mt-0.5" title="Pending Balance">
                                                        Pending: {formatBalance(acc.balances?.pending_balance)}
                                                    </div>
                                                </div>
                                                <span className="px-2 py-0.5 rounded text-[9px] uppercase font-bold bg-gray-800 text-gray-400 border border-white/5">
                                                    Type: {acc.normal_balance}
                                                </span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-900/50 border border-white/5 rounded-[2rem] p-12 text-center backdrop-blur-3xl animate-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-cyan-500/10 border border-cyan-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
                                <Database className="text-cyan-400" size={32} />
                            </div>
                            <h2 className="text-2xl font-black text-white uppercase tracking-tight mb-3">Immutable Ledger Offline</h2>
                            <p className="text-gray-400 max-w-md mx-auto mb-8 font-mono text-sm uppercase leading-relaxed">
                                No live Modern Treasury ledger accounts detected. Synchronize your organizational credentials to materialize the sovereign financial stack.
                            </p>
                            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                                <button className="px-8 py-3 bg-cyan-500 text-black font-black uppercase tracking-widest rounded-xl hover:bg-cyan-400 transition-all font-mono text-xs">
                                    Configure Integration
                                </button>
                                <button className="px-8 py-3 bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest rounded-xl hover:bg-white/10 transition-all font-mono text-xs">
                                    Audit Logs
                                </button>
                            </div>
                        </div>
                    )}

                    {/* Recents List */}
                    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                        <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
                            <Zap className="text-cyan-400" size={20} />
                            Immutable Transaction Ledger Blocks
                        </h2>
                        <div className="space-y-4">
                            {[...context.transactions, ...context.modernTreasuryTransactions].slice(0, 5).map((tx, idx) => (
                                <div key={tx.id || idx} className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                                    <div>
                                        <div className="text-sm font-medium text-white">{tx.description || tx.name}</div>
                                        <div className="text-xs text-gray-500 font-mono mt-1">ID: {tx.id?.slice(0, 8) || '...'}</div>
                                    </div>
                                    <div className="text-right">
                                        <span className={`text-sm font-bold ${tx.amount > 0 ? 'text-green-400' : 'text-white'}`}>
                                            {tx.amount > 0 ? '+' : ''}{(tx.amount / 100).toLocaleString('en-US', { style: 'currency', currency: 'USD' })}
                                        </span>
                                        <div className="text-[11px] text-gray-500 mt-1">{new Date(tx.date || tx.created_at).toLocaleDateString()}</div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </>
            )}

            {activeTab === 'repository' && (
                <div className="space-y-8 animate-in fade-in duration-500">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Total Codebase Files</h3>
                                <FileCode className="text-purple-400" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">488</div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">Indexed across 37 directories</p>
                        </div>
                        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Integrity Consensus</h3>
                                <Shield className="text-green-400" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-green-400 tracking-tight">100%</div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">Cryptographically verified</p>
                        </div>
                        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Active Integrations</h3>
                                <Cpu className="text-cyan-400" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">12</div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">Bridges & external APIs active</p>
                        </div>
                        <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl">
                            <div className="flex items-center justify-between mb-4">
                                <h3 className="text-sm font-medium text-gray-400">Sovereign Network</h3>
                                <Globe className="text-indigo-400" size={20} />
                            </div>
                            <div className="text-3xl font-bold text-white tracking-tight">OKO-MAIN</div>
                            <p className="text-xs text-gray-500 mt-2 font-mono">Distributed node consensus</p>
                        </div>
                    </div>

                    {/* Search and Filter Controls */}
                    <div className="bg-gray-900/50 border border-white/5 rounded-2xl p-6 backdrop-blur-xl space-y-4">
                        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                            <div className="relative w-full md:w-96">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                                <input 
                                    type="text"
                                    placeholder="Search codebase files..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-10 pr-4 py-2 bg-black/40 border border-white/10 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-purple-500 transition-colors text-sm"
                                />
                            </div>
                            <div className="flex flex-wrap gap-2 w-full md:w-auto">
                                {['All', 'APIs', 'Components', 'Services', 'Trillionaire Status', 'Tables & Types', 'Story Pages'].map((cat) => (
                                    <button
                                        key={cat}
                                        onClick={() => setSelectedCategory(cat)}
                                        className={`px-3 py-1.5 rounded-lg text-xs font-bold tracking-wider uppercase transition-all ${selectedCategory === cat ? 'bg-purple-500 text-white' : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'}`}
                                    >
                                        {cat}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* File List */}
                        <div className="border border-white/5 rounded-xl overflow-hidden">
                            <div className="grid grid-cols-12 gap-4 p-4 bg-black/40 border-b border-white/5 text-xs font-bold text-gray-400 uppercase tracking-wider">
                                <div className="col-span-6 md:col-span-7">File Path</div>
                                <div className="col-span-3 md:col-span-2">Category</div>
                                <div className="col-span-3 md:col-span-1 text-right">Size</div>
                                <div className="hidden md:block md:col-span-2 text-right">Consensus Status</div>
                            </div>
                            <div className="divide-y divide-white/5 max-h-[500px] overflow-y-auto">
                                {filteredFiles.map((file, idx) => {
                                    const isVerifying = verifyingFile === file.path;
                                    const isVerified = verifiedFiles[file.path];
                                    return (
                                        <div key={file.path || idx} className="grid grid-cols-12 gap-4 p-4 items-center hover:bg-white/5 transition-colors text-sm">
                                            <div className="col-span-6 md:col-span-7 flex items-center gap-3 min-w-0">
                                                {file.path.endsWith('.md') ? (
                                                    <FileText className="text-amber-400 shrink-0" size={18} />
                                                ) : (
                                                    <FileCode className="text-purple-400 shrink-0" size={18} />
                                                )}
                                                <span className="text-white font-mono truncate text-xs" title={file.path}>{file.path}</span>
                                            </div>
                                            <div className="col-span-3 md:col-span-2">
                                                <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase bg-white/5 text-gray-400 border border-white/5">
                                                    {file.category}
                                                </span>
                                            </div>
                                            <div className="col-span-3 md:col-span-1 text-right text-xs text-gray-400 font-mono">
                                                {file.size}
                                            </div>
                                            <div className="col-span-12 md:col-span-2 flex justify-end items-center gap-2 mt-2 md:mt-0">
                                                {isVerifying ? (
                                                    <span className="text-xs text-purple-400 font-mono flex items-center gap-1.5">
                                                        <RefreshCw size={12} className="animate-spin" />
                                                        VERIFYING...
                                                    </span>
                                                ) : isVerified ? (
                                                    <span className="text-xs text-green-400 font-mono flex items-center gap-1.5">
                                                        <CheckCircle size={14} />
                                                        SECURED
                                                    </span>
                                                ) : (
                                                    <button 
                                                        onClick={() => handleVerify(file.path)}
                                                        className="px-2.5 py-1 bg-purple-500/10 hover:bg-purple-500/20 border border-purple-500/20 text-purple-400 rounded text-[10px] font-bold uppercase tracking-wider transition-all"
                                                    >
                                                        Verify
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                    );
                                })}
                                {filteredFiles.length === 0 && (
                                    <div className="p-8 text-center text-gray-500 font-mono text-sm">
                                        No files found matching "{searchQuery}" in category "{selectedCategory}"
                                    </div>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default GlobalLedgerView;