import React, { useState, useMemo } from 'react';
import Card from './Card';

interface AppFile {
  name: string;
  path: string;
  category: string;
  type: 'component' | 'service' | 'api' | 'model' | 'util' | 'config' | 'route' | 'table' | 'story';
  description: string;
}

const ALL_APP_FILES: AppFile[] = [
  // Alpaca Brokerage & Trading
  { name: 'AlpacaAccountsManager.tsx', path: 'components/alpaca/AlpacaAccountsManager.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Manages Alpaca brokerage accounts, profiles, and status.' },
  { name: 'AlpacaCryptoWalletsView.tsx', path: 'components/alpaca/AlpacaCryptoWalletsView.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Interface for managing Alpaca-hosted cryptocurrency wallets.' },
  { name: 'AlpacaFundingHub.tsx', path: 'components/alpaca/AlpacaFundingHub.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Handles ACH, wire transfers, and bank linkages for Alpaca.' },
  { name: 'AlpacaIpoMarketplaceView.tsx', path: 'components/alpaca/AlpacaIpoMarketplaceView.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Access and participate in upcoming IPOs via Alpaca.' },
  { name: 'AlpacaJournalsView.tsx', path: 'components/alpaca/AlpacaJournalsView.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Inter-account journal transfers and ledger entries.' },
  { name: 'AlpacaRebalancingView.tsx', path: 'components/alpaca/AlpacaRebalancingView.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Automated portfolio rebalancing based on target weights.' },
  { name: 'AlpacaReportingView.tsx', path: 'components/alpaca/AlpacaReportingView.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Generates tax documents, trade confirmations, and statements.' },
  { name: 'AlpacaTokenizationView.tsx', path: 'components/alpaca/AlpacaTokenizationView.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Tokenizes real-world assets and equities into digital shares.' },
  { name: 'AlpacaTradingTerminal.tsx', path: 'components/alpaca/AlpacaTradingTerminal.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Advanced trading terminal with real-time charts and order entry.' },
  { name: 'BtcSwingTradingNotebook.tsx', path: 'components/alpaca/BtcSwingTradingNotebook.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Interactive notebook for BTC swing trading strategies.' },
  { name: 'TqqqAlgorithmTerminal.tsx', path: 'components/alpaca/TqqqAlgorithmTerminal.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Algorithmic trading terminal optimized for TQQQ leverage.' },
  { name: 'AlpacaBrokerView.tsx', path: 'components/AlpacaBrokerView.tsx', category: 'Alpaca Brokerage', type: 'component', description: 'Unified dashboard for Alpaca Broker API integrations.' },
  { name: 'AlpacaAccountsService.ts', path: 'services/AlpacaAccountsService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Service layer for Alpaca account management.' },
  { name: 'AlpacaBrokerService.ts', path: 'services/AlpacaBrokerService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Core Alpaca Broker API integration service.' },
  { name: 'alpacaCollateralService.ts', path: 'services/alpacaCollateralService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Manages collateralized lending and margin accounts.' },
  { name: 'AlpacaFundingService.ts', path: 'services/AlpacaFundingService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Service for managing deposits, withdrawals, and bank links.' },
  { name: 'AlpacaJournalsService.ts', path: 'services/AlpacaJournalsService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Service for executing journal transfers between accounts.' },
  { name: 'AlpacaMarketDataService.ts', path: 'services/AlpacaMarketDataService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Fetches real-time and historical market data.' },
  { name: 'AlpacaOptionsTradingService.ts', path: 'services/AlpacaOptionsTradingService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Handles options contracts, chains, and order execution.' },
  { name: 'AlpacaRebalancingService.ts', path: 'services/AlpacaRebalancingService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Executes portfolio rebalancing algorithms.' },
  { name: 'AlpacaReportingService.ts', path: 'services/AlpacaReportingService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Generates financial reports and statements.' },
  { name: 'AlpacaTokenizationService.ts', path: 'services/AlpacaTokenizationService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Handles asset tokenization smart contracts and ledgers.' },
  { name: 'AlpacaTradingService.ts', path: 'services/AlpacaTradingService.ts', category: 'Alpaca Brokerage', type: 'service', description: 'Core order routing and execution service.' },

  // Bridges & Integrations
  { name: 'CitiAlpacaBridgeView.tsx', path: 'components/bridges/CitiAlpacaBridgeView.tsx', category: 'Bridges', type: 'component', description: 'Bridges Citi institutional liquidity with Alpaca retail trading.' },
  { name: 'PlaidAlpacaBridgeView.tsx', path: 'components/bridges/PlaidAlpacaBridgeView.tsx', category: 'Bridges', type: 'component', description: 'Bridges Plaid bank accounts with Alpaca brokerage accounts.' },
  { name: 'RealEstateAlpacaBridge.tsx', path: 'components/bridges/RealEstateAlpacaBridge.tsx', category: 'Bridges', type: 'component', description: 'Bridges real estate equity with Alpaca margin accounts.' },
  { name: 'SovereignMarketTakeoverDashboard.tsx', path: 'components/bridges/SovereignMarketTakeoverDashboard.tsx', category: 'Bridges', type: 'component', description: 'High-level dashboard for sovereign wealth market interventions.' },
  { name: 'StripeAlpacaBridgeView.tsx', path: 'components/bridges/StripeAlpacaBridgeView.tsx', category: 'Bridges', type: 'component', description: 'Bridges Stripe merchant balances with Alpaca investment accounts.' },
  { name: 'TaxLienModernTreasuryBridge.tsx', path: 'components/bridges/TaxLienModernTreasuryBridge.tsx', category: 'Bridges', type: 'component', description: 'Bridges tax lien acquisitions with Modern Treasury ledgers.' },
  { name: 'CitiAlpacaBridgeService.ts', path: 'services/CitiAlpacaBridgeService.ts', category: 'Bridges', type: 'service', description: 'Service layer for Citi-Alpaca liquidity bridging.' },
  { name: 'PlaidBridgeService.ts', path: 'services/PlaidBridgeService.ts', category: 'Bridges', type: 'service', description: 'Service layer for Plaid-Alpaca bank bridging.' },
  { name: 'StripeBridgeService.ts', path: 'services/StripeBridgeService.ts', category: 'Bridges', type: 'service', description: 'Service layer for Stripe-Alpaca merchant bridging.' },

  // Aquarius Suite
  { name: 'AquariusArchitectView.tsx', path: 'components/AquariusArchitectView.tsx', category: 'Aquarius Suite', type: 'component', description: 'System architecture and infrastructure designer.' },
  { name: 'AquariusAuditorView.tsx', path: 'components/AquariusAuditorView.tsx', category: 'Aquarius Suite', type: 'component', description: 'Real-time compliance and security auditor.' },
  { name: 'AquariusCreativeSuite.tsx', path: 'components/AquariusCreativeSuite.tsx', category: 'Aquarius Suite', type: 'component', description: 'AI-powered creative asset and marketing generator.' },
  { name: 'AquariusDashboard.tsx', path: 'components/AquariusDashboard.tsx', category: 'Aquarius Suite', type: 'component', description: 'Central command dashboard for the Aquarius ecosystem.' },
  { name: 'AquariusGhostView.tsx', path: 'components/AquariusGhostView.tsx', category: 'Aquarius Suite', type: 'component', description: 'Stealth mode and anonymous routing controller.' },
  { name: 'AquariusInstitutionalHub.tsx', path: 'components/AquariusInstitutionalHub.tsx', category: 'Aquarius Suite', type: 'component', description: 'Institutional investor portal and OTC desk.' },
  { name: 'AquariusLiveVoice.tsx', path: 'components/AquariusLiveVoice.tsx', category: 'Aquarius Suite', type: 'component', description: 'Real-time AI voice agent and communication hub.' },

  // Citi Connect & Treasury
  { name: 'CitiConnectInitiation.tsx', path: 'components/CitiConnectInitiation.tsx', category: 'Citi Connect', type: 'component', description: 'Initiates Citi Connect API payments and transfers.' },
  { name: 'CitiConnectInquiry.tsx', path: 'components/CitiConnectInquiry.tsx', category: 'Citi Connect', type: 'component', description: 'Queries Citi Connect transaction status and history.' },
  { name: 'CitiConnectNotifications.tsx', path: 'components/CitiConnectNotifications.tsx', category: 'Citi Connect', type: 'component', description: 'Manages Citi Connect webhook notifications.' },
  { name: 'CitiDecryptionUtility.tsx', path: 'components/CitiDecryptionUtility.tsx', category: 'Citi Connect', type: 'component', description: 'Decrypts Citi Connect payload files using PGP/JWE.' },
  { name: 'CitiGateway.tsx', path: 'components/CitiGateway.tsx', category: 'Citi Connect', type: 'component', description: 'Central gateway interface for Citi API endpoints.' },
  { name: 'CitiPartnerHub.tsx', path: 'components/CitiPartnerHub.tsx', category: 'Citi Connect', type: 'component', description: 'Partner onboarding and API key management for Citi.' },
  { name: 'CitiSovereignLedger.tsx', path: 'components/CitiSovereignLedger.tsx', category: 'Citi Connect', type: 'component', description: 'Sovereign-grade ledger backed by Citi accounts.' },
  { name: 'CitiTreasuryHub.tsx', path: 'components/CitiTreasuryHub.tsx', category: 'Citi Connect', type: 'component', description: 'Treasury management and liquidity optimization.' },
  { name: 'CitiUkInternationalPayments.tsx', path: 'components/CitiUkInternationalPayments.tsx', category: 'Citi Connect', type: 'component', description: 'Handles UK and international cross-border payments.' },
  { name: 'ModernTreasuryLedgerHub.tsx', path: 'components/ModernTreasuryLedgerHub.tsx', category: 'Citi Connect', type: 'component', description: 'Integrates Modern Treasury ledgers and accounts.' },
  { name: 'StripeTreasuryManager.tsx', path: 'components/StripeTreasuryManager.tsx', category: 'Citi Connect', type: 'component', description: 'Manages Stripe Treasury balances and financial accounts.' },
  { name: 'ModernTreasuryService.ts', path: 'services/ModernTreasuryService.ts', category: 'Citi Connect', type: 'service', description: 'Service layer for Modern Treasury API.' },
  { name: 'StripeService.ts', path: 'services/StripeService.ts', category: 'Citi Connect', type: 'service', description: 'Service layer for Stripe payments and treasury.' },

  // Government & Compliance
  { name: 'GisPropertyMap.tsx', path: 'components/government/GisPropertyMap.tsx', category: 'Government', type: 'component', description: 'GIS-based property map for real estate and tax liens.' },
  { name: 'GovernmentApiDashboard.tsx', path: 'components/government/GovernmentApiDashboard.tsx', category: 'Government', type: 'component', description: 'Dashboard for government API integrations (IRS, SEC, etc.).' },
  { name: 'IrsTaxFiling.tsx', path: 'components/government/IrsTaxFiling.tsx', category: 'Government', type: 'component', description: 'Automated IRS tax filing and compliance interface.' },
  { name: 'SecFilingViewer.tsx', path: 'components/government/SecFilingViewer.tsx', category: 'Government', type: 'component', description: 'Real-time SEC EDGAR filing viewer and analyzer.' },
  { name: 'ContractorLobbyingList.tsx', path: 'components/ContractorLobbyingList.tsx', category: 'Government', type: 'component', description: 'Tracks government contractors and lobbying expenditures.' },
  { name: 'FloridaVoterView.tsx', path: 'components/FloridaVoterView.tsx', category: 'Government', type: 'component', description: 'Demographic and voter registration analytics for Florida.' },
  { name: 'PoliticalComplianceView.tsx', path: 'components/PoliticalComplianceView.tsx', category: 'Government', type: 'component', description: 'Ensures compliance with FEC and local political donation laws.' },
  { name: 'PublicAidCalculator.tsx', path: 'components/PublicAidCalculator.tsx', category: 'Government', type: 'component', description: 'Calculates public aid eligibility and distribution.' },
  { name: 'WarAppropriationsTracker.tsx', path: 'components/WarAppropriationsTracker.tsx', category: 'Government', type: 'component', description: 'Tracks military spending and defense appropriations.' },
  { name: 'governmentApiService.ts', path: 'services/governmentApiService.ts', category: 'Government', type: 'service', description: 'Service layer for government API endpoints.' },

  // Real Estate & Tax Liens
  { name: 'DeedRegistrar.tsx', path: 'components/real-estate/DeedRegistrar.tsx', category: 'Real Estate', type: 'component', description: 'Registers property deeds on the blockchain ledger.' },
  { name: 'EscrowManager.tsx', path: 'components/real-estate/EscrowManager.tsx', category: 'Real Estate', type: 'component', description: 'Manages real estate escrow accounts and smart contracts.' },
  { name: 'PropertyMarketplace.tsx', path: 'components/real-estate/PropertyMarketplace.tsx', category: 'Real Estate', type: 'component', description: 'Fractionalized real estate marketplace.' },
  { name: 'ForeclosureTracker.tsx', path: 'components/tax-liens/ForeclosureTracker.tsx', category: 'Real Estate', type: 'component', description: 'Tracks tax lien foreclosures and auction dates.' },
  { name: 'TaxLienAuctions.tsx', path: 'components/tax-liens/TaxLienAuctions.tsx', category: 'Real Estate', type: 'component', description: 'Participate in live tax lien auctions.' },
  { name: 'RealEstateService.ts', path: 'services/RealEstateService.ts', category: 'Real Estate', type: 'service', description: 'Service layer for real estate transactions.' },
  { name: 'TaxLienService.ts', path: 'services/TaxLienService.ts', category: 'Real Estate', type: 'service', description: 'Service layer for tax lien acquisitions.' },

  // Trillionaire Status Models
  { name: 'CapitalAllocationModels.ts', path: 'trillionaire-status/CapitalAllocationModels.ts', category: 'Trillionaire Status', type: 'model', description: 'Capital allocation models for trillion-dollar portfolios.' },
  { name: 'CompetitorIntelligence.ts', path: 'trillionaire-status/CompetitorIntelligence.ts', category: 'Trillionaire Status', type: 'model', description: 'Intelligence gathering on Fortune 500 competitors.' },
  { name: 'ConsumerSentimentAnalysis.ts', path: 'trillionaire-status/ConsumerSentimentAnalysis.ts', category: 'Trillionaire Status', type: 'model', description: 'Global consumer sentiment analysis using AI.' },
  { name: 'CorporateGovernanceReview.ts', path: 'trillionaire-status/CorporateGovernanceReview.ts', category: 'Trillionaire Status', type: 'model', description: 'Corporate governance and board seat acquisition strategies.' },
  { name: 'DigitalTransformationAudit.ts', path: 'trillionaire-status/DigitalTransformationAudit.ts', category: 'Trillionaire Status', type: 'model', description: 'Audits digital infrastructure of target acquisitions.' },
  { name: 'EmergingMarketExpansion.ts', path: 'trillionaire-status/EmergingMarketExpansion.ts', category: 'Trillionaire Status', type: 'model', description: 'Sovereign-level emerging market expansion models.' },
  { name: 'ESGImpactMetrics.ts', path: 'trillionaire-status/ESGImpactMetrics.ts', category: 'Trillionaire Status', type: 'model', description: 'Tracks ESG impact metrics for global compliance.' },
  { name: 'ExecutiveCompensationAudit.ts', path: 'trillionaire-status/ExecutiveCompensationAudit.ts', category: 'Trillionaire Status', type: 'model', description: 'Audits executive compensation packages of target firms.' },
  { name: 'FinancialDataIngestion.ts', path: 'trillionaire-status/FinancialDataIngestion.ts', category: 'Trillionaire Status', type: 'model', description: 'Ingests global financial data feeds.' },
  { name: 'Fortune500ResearchPlan.ts', path: 'trillionaire-status/Fortune500ResearchPlan.ts', category: 'Trillionaire Status', type: 'model', description: 'Research plan for acquiring Fortune 500 companies.' },
  { name: 'GlobalTaxStrategy.ts', path: 'trillionaire-status/GlobalTaxStrategy.ts', category: 'Trillionaire Status', type: 'model', description: 'Multi-jurisdictional tax optimization strategies.' },
  { name: 'InfrastructureDependencies.ts', path: 'trillionaire-status/InfrastructureDependencies.ts', category: 'Trillionaire Status', type: 'model', description: 'Maps global infrastructure dependencies.' },
  { name: 'InnovationPipelineResearch.ts', path: 'trillionaire-status/InnovationPipelineResearch.ts', category: 'Trillionaire Status', type: 'model', description: 'Tracks patent and R&D pipelines of competitors.' },
  { name: 'LobbyingInfluenceMapping.ts', path: 'trillionaire-status/LobbyingInfluenceMapping.ts', category: 'Trillionaire Status', type: 'model', description: 'Maps lobbying expenditures to legislative outcomes.' },
  { name: 'MarketCapAnalysis.ts', path: 'trillionaire-status/MarketCapAnalysis.ts', category: 'Trillionaire Status', type: 'model', description: 'Real-time market capitalization analysis.' },
  { name: 'MergersAndAcquisitions.ts', path: 'trillionaire-status/MergersAndAcquisitions.ts', category: 'Trillionaire Status', type: 'model', description: 'M&A pipeline and valuation models.' },
  { name: 'PatentPortfolioAudit.ts', path: 'trillionaire-status/PatentPortfolioAudit.ts', category: 'Trillionaire Status', type: 'model', description: 'Audits patent portfolios of target acquisitions.' },
  { name: 'RegulatoryComplianceAudit.ts', path: 'trillionaire-status/RegulatoryComplianceAudit.ts', category: 'Trillionaire Status', type: 'model', description: 'Ensures global regulatory compliance.' },
  { name: 'RiskAssessmentFramework.ts', path: 'trillionaire-status/RiskAssessmentFramework.ts', category: 'Trillionaire Status', type: 'model', description: 'Risk assessment framework for sovereign investments.' },
  { name: 'ShareholderValueMetrics.ts', path: 'trillionaire-status/ShareholderValueMetrics.ts', category: 'Trillionaire Status', type: 'model', description: 'Tracks shareholder value metrics.' },
  { name: 'SupplyChainMapping.ts', path: 'trillionaire-status/SupplyChainMapping.ts', category: 'Trillionaire Status', type: 'model', description: 'Maps global supply chain dependencies.' },
  { name: 'SustainabilityReporting.ts', path: 'trillionaire-status/SustainabilityReporting.ts', category: 'Trillionaire Status', type: 'model', description: 'Generates sustainability and carbon offset reports.' },
  { name: 'TalentAcquisitionPipeline.ts', path: 'trillionaire-status/TalentAcquisitionPipeline.ts', category: 'Trillionaire Status', type: 'model', description: 'Tracks executive talent acquisition pipeline.' },
  { name: 'TechStackIntegration.ts', path: 'trillionaire-status/TechStackIntegration.ts', category: 'Trillionaire Status', type: 'model', description: 'Integrates tech stacks of acquired companies.' },
  { name: 'TrillionaireStatusSummary.ts', path: 'trillionaire-status/TrillionaireStatusSummary.ts', category: 'Trillionaire Status', type: 'model', description: 'Summary dashboard of trillionaire status progress.' },

  // AI & Intelligence
  { name: 'AIAdStudioView.tsx', path: 'components/AIAdStudioView.tsx', category: 'AI & Intelligence', type: 'component', description: 'AI-powered ad creation and campaign studio.' },
  { name: 'AIAdvisorView.tsx', path: 'components/AIAdvisorView.tsx', category: 'AI & Intelligence', type: 'component', description: 'AI financial advisor and portfolio strategist.' },
  { name: 'AIInsights.tsx', path: 'components/AIInsights.tsx', category: 'AI & Intelligence', type: 'component', description: 'Generates real-time AI insights on market trends.' },
  { name: 'AriaComms.tsx', path: 'components/AriaComms.tsx', category: 'AI & Intelligence', type: 'component', description: 'Aria AI communications and messaging interface.' },
  { name: 'GeminiKeyModal.tsx', path: 'components/GeminiKeyModal.tsx', category: 'AI & Intelligence', type: 'component', description: 'Modal for managing Gemini API keys.' },
  { name: 'GeminiLivePortal.tsx', path: 'components/GeminiLivePortal.tsx', category: 'AI & Intelligence', type: 'component', description: 'Live portal for Gemini AI interactions.' },
  { name: 'IntelligenceHubView.tsx', path: 'components/IntelligenceHubView.tsx', category: 'AI & Intelligence', type: 'component', description: 'Central hub for AI intelligence and analytics.' },
  { name: 'NeuralToolsView.tsx', path: 'components/NeuralToolsView.tsx', category: 'AI & Intelligence', type: 'component', description: 'Neural network tools and model training interface.' },
  { name: 'SovereignChat.tsx', path: 'components/SovereignChat.tsx', category: 'AI & Intelligence', type: 'component', description: 'Sovereign AI chat interface.' },
  { name: 'SovereignIntelligenceView.tsx', path: 'components/SovereignIntelligenceView.tsx', category: 'AI & Intelligence', type: 'component', description: 'Sovereign intelligence and geopolitical analysis.' },
  { name: 'geminiService.ts', path: 'services/geminiService.ts', category: 'AI & Intelligence', type: 'service', description: 'Service layer for Gemini AI API.' },
  { name: 'SovereignIntelligence.ts', path: 'services/SovereignIntelligence.ts', category: 'AI & Intelligence', type: 'service', description: 'Service layer for Sovereign Intelligence.' },

  // Core & System Views
  { name: 'AdministrationAudit.tsx', path: 'components/AdministrationAudit.tsx', category: 'Core System', type: 'component', description: 'Administrative audit logs and system health.' },
  { name: 'APIIntegrationView.tsx', path: 'components/APIIntegrationView.tsx', category: 'Core System', type: 'component', description: 'Manages third-party API integrations.' },
  { name: 'APIKeysView.tsx', path: 'components/APIKeysView.tsx', category: 'Core System', type: 'component', description: 'Manages system API keys and access tokens.' },
  { name: 'AstraDBQuickstart.tsx', path: 'components/AstraDBQuickstart.tsx', category: 'Core System', type: 'component', description: 'Quickstart guide and connection status for Astra DB.' },
  { name: 'AzureAppsView.tsx', path: 'components/AzureAppsView.tsx', category: 'Core System', type: 'component', description: 'Manages Azure App Services and deployments.' },
  { name: 'BalanceSummary.tsx', path: 'components/BalanceSummary.tsx', category: 'Core System', type: 'component', description: 'Displays unified balance summary across all accounts.' },
  { name: 'BillingIdentityView.tsx', path: 'components/BillingIdentityView.tsx', category: 'Core System', type: 'component', description: 'Manages billing identities and corporate entities.' },
  { name: 'BudgetsView.tsx', path: 'components/BudgetsView.tsx', category: 'Core System', type: 'component', description: 'Budget planning and expense tracking.' },
  { name: 'CardCustomizationView.tsx', path: 'components/CardCustomizationView.tsx', category: 'Core System', type: 'component', description: 'Customizes physical and virtual debit/credit cards.' },
  { name: 'CorporateCommandView.tsx', path: 'components/CorporateCommandView.tsx', category: 'Core System', type: 'component', description: 'Corporate command and control interface.' },
  { name: 'CreditHealthView.tsx', path: 'components/CreditHealthView.tsx', category: 'Core System', type: 'component', description: 'Monitors corporate and personal credit health.' },
  { name: 'CryptoView.tsx', path: 'components/CryptoView.tsx', category: 'Core System', type: 'component', description: 'Cryptocurrency trading and wallet management.' },
  { name: 'Dashboard.tsx', path: 'components/Dashboard.tsx', category: 'Core System', type: 'component', description: 'Main application dashboard.' },
  { name: 'DataIngestView.tsx', path: 'components/DataIngestView.tsx', category: 'Core System', type: 'component', description: 'Ingests external data sources and CSVs.' },
  { name: 'DeveloperView.tsx', path: 'components/DeveloperView.tsx', category: 'Core System', type: 'component', description: 'Developer tools, console, and sandbox.' },
  { name: 'EntraSwarmManager.tsx', path: 'components/EntraSwarmManager.tsx', category: 'Core System', type: 'component', description: 'Manages Microsoft Entra ID security swarms.' },
  { name: 'FinancialDemocracyView.tsx', path: 'components/FinancialDemocracyView.tsx', category: 'Core System', type: 'component', description: 'Financial democracy and shareholder voting.' },
  { name: 'FinancialGoalsView.tsx', path: 'components/FinancialGoalsView.tsx', category: 'Core System', type: 'component', description: 'Sets and tracks long-term financial goals.' },
  { name: 'FleetAppView.tsx', path: 'components/FleetAppView.tsx', category: 'Core System', type: 'component', description: 'Manages corporate vehicle and asset fleets.' },
  { name: 'FlowController.tsx', path: 'components/FlowController.tsx', category: 'Core System', type: 'component', description: 'Visual workflow and transaction flow controller.' },
  { name: 'GasPriceCorrelation.tsx', path: 'components/GasPriceCorrelation.tsx', category: 'Core System', type: 'component', description: 'Correlates gas prices with market performance.' },
  { name: 'GcpInventoryView.tsx', path: 'components/GcpInventoryView.tsx', category: 'Core System', type: 'component', description: 'Inventory of Google Cloud Platform resources.' },
  { name: 'GlobalLedgerView.tsx', path: 'components/GlobalLedgerView.tsx', category: 'Core System', type: 'component', description: 'Unified global ledger of all transactions.' },
  { name: 'GoalsView.tsx', path: 'components/GoalsView.tsx', category: 'Core System', type: 'component', description: 'Goal setting and tracking interface.' },
  { name: 'GrowthNexus.tsx', path: 'components/GrowthNexus.tsx', category: 'Core System', type: 'component', description: 'Growth hacking and marketing automation nexus.' },
  { name: 'HoKTokenMint.tsx', path: 'components/HoKTokenMint.tsx', category: 'Core System', type: 'component', description: 'Mints House of Kabaka (HoK) utility tokens.' },
  { name: 'IdentityCitadelView.tsx', path: 'components/IdentityCitadelView.tsx', category: 'Core System', type: 'component', description: 'Secure identity and credential vault.' },
  { name: 'ImpactTracker.tsx', path: 'components/ImpactTracker.tsx', category: 'Core System', type: 'component', description: 'Tracks social and environmental impact.' },
  { name: 'ImpeachmentGenerator.tsx', path: 'components/ImpeachmentGenerator.tsx', category: 'Core System', type: 'component', description: 'Generates legal and political impeachment drafts.' },
  { name: 'InjusticeDashboard.tsx', path: 'components/InjusticeDashboard.tsx', category: 'Core System', type: 'component', description: 'Tracks and reports systemic financial injustices.' },
  { name: 'IntegrationsMarketplaceView.tsx', path: 'components/IntegrationsMarketplaceView.tsx', category: 'Core System', type: 'component', description: 'Marketplace for third-party integrations.' },
  { name: 'InvestmentPortfolio.tsx', path: 'components/InvestmentPortfolio.tsx', category: 'Core System', type: 'component', description: 'Investment portfolio tracker.' },
  { name: 'InvestmentsPortfolio.tsx', path: 'components/InvestmentsPortfolio.tsx', category: 'Core System', type: 'component', description: 'Alternative investment portfolio view.' },
  { name: 'InvestmentsView.tsx', path: 'components/InvestmentsView.tsx', category: 'Core System', type: 'component', description: 'Unified investments dashboard.' },
  { name: 'JweJwsVerifier.tsx', path: 'components/JweJwsVerifier.tsx', category: 'Core System', type: 'component', description: 'Verifies JWE and JWS cryptographic signatures.' },
  { name: 'KryptoBridgeWidget.tsx', path: 'components/KryptoBridgeWidget.tsx', category: 'Core System', type: 'component', description: 'Widget for bridging crypto assets.' },
  { name: 'MachineView.tsx', path: 'components/MachineView.tsx', category: 'Core System', type: 'component', description: 'System state machine and flow visualizer.' },
  { name: 'MarketingAutomationView.tsx', path: 'components/MarketingAutomationView.tsx', category: 'Core System', type: 'component', description: 'Automated marketing campaigns.' },
  { name: 'MarketplaceView.tsx', path: 'components/MarketplaceView.tsx', category: 'Core System', type: 'component', description: 'Unified asset and service marketplace.' },
  { name: 'NexusBuilder.tsx', path: 'components/NexusBuilder.tsx', category: 'Core System', type: 'component', description: 'Builds custom integrations and workflows.' },
  { name: 'NFCValidator.tsx', path: 'components/NFCValidator.tsx', category: 'Core System', type: 'component', description: 'Validates physical NFC cards and chips.' },
  { name: 'OFXStatementViewer.tsx', path: 'components/OFXStatementViewer.tsx', category: 'Core System', type: 'component', description: 'Parses and views OFX bank statements.' },
  { name: 'OpenBankingFapiView.tsx', path: 'components/OpenBankingFapiView.tsx', category: 'Core System', type: 'component', description: 'Financial-grade API (FAPI) open banking interface.' },
  { name: 'OpenBankingView.tsx', path: 'components/OpenBankingView.tsx', category: 'Core System', type: 'component', description: 'Open banking account aggregation.' },
  { name: 'PaymentMethodsView.tsx', path: 'components/PaymentMethodsView.tsx', category: 'Core System', type: 'component', description: 'Manages linked payment methods.' },
  { name: 'PersonalizationView.tsx', path: 'components/PersonalizationView.tsx', category: 'Core System', type: 'component', description: 'Customizes application theme and layout.' },
  { name: 'PlaidLinkButton.tsx', path: 'components/PlaidLinkButton.tsx', category: 'Core System', type: 'component', description: 'Plaid Link integration button.' },
  { name: 'PlaidLink.tsx', path: 'components/PlaidLink.tsx', category: 'Core System', type: 'component', description: 'Plaid Link core component.' },
  { name: 'PortalHandshake.tsx', path: 'components/PortalHandshake.tsx', category: 'Core System', type: 'component', description: 'Handles secure handshakes between portals.' },
  { name: 'PortalHubView.tsx', path: 'components/PortalHubView.tsx', category: 'Core System', type: 'component', description: 'Central hub for all connected portals.' },
  { name: 'PrivacyGuardianView.tsx', path: 'components/PrivacyGuardianView.tsx', category: 'Core System', type: 'component', description: 'Manages privacy settings and data zero-knowledge proofs.' },
  { name: 'QuantumWeaverView.tsx', path: 'components/QuantumWeaverView.tsx', category: 'Core System', type: 'component', description: 'Quantum-encrypted communication weaver.' },
  { name: 'RecentTransactions.tsx', path: 'components/RecentTransactions.tsx', category: 'Core System', type: 'component', description: 'Displays recent transactions.' },
  { name: 'RecoveryMeshView.tsx', path: 'components/RecoveryMeshView.tsx', category: 'Core System', type: 'component', description: 'Disaster recovery and mesh network status.' },
  { name: 'RewardsView.tsx', path: 'components/RewardsView.tsx', category: 'Core System', type: 'component', description: 'Tracks rewards, cashback, and loyalty points.' },
  { name: 'SecurityOrchestratorView.tsx', path: 'components/SecurityOrchestratorView.tsx', category: 'Core System', type: 'component', description: 'Orchestrates system-wide security policies.' },
  { name: 'SecurityView.tsx', path: 'components/SecurityView.tsx', category: 'Core System', type: 'component', description: 'Security settings and multi-factor auth.' },
  { name: 'SendMoneyView.tsx', path: 'components/SendMoneyView.tsx', category: 'Core System', type: 'component', description: 'Interface for sending money globally.' },
  { name: 'SettingsView.tsx', path: 'components/SettingsView.tsx', category: 'Core System', type: 'component', description: 'Global application settings.' },
  { name: 'SovereignDashboard.tsx', path: 'components/SovereignDashboard.tsx', category: 'Core System', type: 'component', description: 'Sovereign wealth and asset dashboard.' },
  { name: 'SovereignDealAudit.tsx', path: 'components/SovereignDealAudit.tsx', category: 'Core System', type: 'component', description: 'Audits sovereign-level business deals.' },
  { name: 'SovereignIframe.tsx', path: 'components/SovereignIframe.tsx', category: 'Core System', type: 'component', description: 'Secure iframe container for sovereign apps.' },
  { name: 'SovereignOrgHandshake.tsx', path: 'components/SovereignOrgHandshake.tsx', category: 'Core System', type: 'component', description: 'Handles handshakes between sovereign organizations.' },
  { name: 'SovereignSentryEngine.tsx', path: 'components/SovereignSentryEngine.tsx', category: 'Core System', type: 'component', description: 'Sentry engine for threat detection.' },
  { name: 'StoryViewer.tsx', path: 'components/StoryViewer.tsx', category: 'Core System', type: 'component', description: 'Interactive viewer for the Oko-main story pages.' },
  { name: 'TabManager.tsx', path: 'components/TabManager.tsx', category: 'Core System', type: 'component', description: 'Manages dynamic application tabs.' },
  { name: 'TheVisionView.tsx', path: 'components/TheVisionView.tsx', category: 'Core System', type: 'component', description: 'The vision and roadmap of the Oko-main project.' },
  { name: 'TokenIssuanceView.tsx', path: 'components/TokenIssuanceView.tsx', category: 'Core System', type: 'component', description: 'Issues custom ERC-20 and security tokens.' },
  { name: 'TradingBotsView.tsx', path: 'components/TradingBotsView.tsx', category: 'Core System', type: 'component', description: 'Manages automated trading bots.' },
  { name: 'TransactionsView.tsx', path: 'components/TransactionsView.tsx', category: 'Core System', type: 'component', description: 'Advanced transaction history and filters.' },
  { name: 'TrustRegistryView.tsx', path: 'components/TrustRegistryView.tsx', category: 'Core System', type: 'component', description: 'Registry of trusted entities and smart contracts.' },
  { name: 'Universe3D.tsx', path: 'components/Universe3D.tsx', category: 'Core System', type: 'component', description: '3D visualization of the financial universe.' },
  { name: 'UniverseGraphVisualizer.tsx', path: 'components/UniverseGraphVisualizer.tsx', category: 'Core System', type: 'component', description: 'Graph visualizer for asset and entity relationships.' },
  { name: 'VoiceControl.tsx', path: 'components/VoiceControl.tsx', category: 'Core System', type: 'component', description: 'Voice control and speech-to-text interface.' },
  { name: 'WalletConnectModal.tsx', path: 'components/WalletConnectModal.tsx', category: 'Core System', type: 'component', description: 'Modal for connecting Web3 wallets.' },
  { name: 'WealthDistributionChart.tsx', path: 'components/WealthDistributionChart.tsx', category: 'Core System', type: 'component', description: 'Visualizes global wealth distribution.' },
  { name: 'WealthNexusView.tsx', path: 'components/WealthNexusView.tsx', category: 'Core System', type: 'component', description: 'Central nexus for wealth management.' },
  { name: 'WealthTimeline.tsx', path: 'components/WealthTimeline.tsx', category: 'Core System', type: 'component', description: 'Timeline of wealth accumulation and goals.' },
  { name: 'WorkspaceNexusView.tsx', path: 'components/WorkspaceNexusView.tsx', category: 'Core System', type: 'component', description: 'Collaborative workspace nexus.' },
];

const FeaturePalette: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedType, setSelectedType] = useState<string>('All');
  const [syncingFile, setSyncingFile] = useState<string | null>(null);
  const [syncedFiles, setSyncedFiles] = useState<Record<string, boolean>>({});

  const categories = useMemo(() => {
    const cats = new Set(ALL_APP_FILES.map(f => f.category));
    return ['All', ...Array.from(cats)];
  }, []);

  const types = useMemo(() => {
    const typs = new Set(ALL_APP_FILES.map(f => f.type));
    return ['All', ...Array.from(typs)];
  }, []);

  const filteredFiles = useMemo(() => {
    return ALL_APP_FILES.filter(file => {
      const matchesSearch = file.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            file.path.toLowerCase().includes(searchQuery.toLowerCase()) ||
                            file.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || file.category === selectedCategory;
      const matchesType = selectedType === 'All' || file.type === selectedType;
      return matchesSearch && matchesCategory && matchesType;
    });
  }, [searchQuery, selectedCategory, selectedType]);

  const handleSync = (filePath: string) => {
    setSyncingFile(filePath);
    setTimeout(() => {
      setSyncingFile(null);
      setSyncedFiles(prev => ({ ...prev, [filePath]: true }));
    }, 1200);
  };

  const handleSyncAll = () => {
    setSyncingFile('ALL_FILES');
    setTimeout(() => {
      setSyncingFile(null);
      const allSynced: Record<string, boolean> = {};
      filteredFiles.forEach(f => {
        allSynced[f.path] = true;
      });
      setSyncedFiles(prev => ({ ...prev, ...allSynced }));
    }, 2500);
  };

  return (
    <Card title="Oko-Main Feature Palette & Codebase Explorer">
      <div className="space-y-6">
        <p className="text-sm text-gray-400">
          Explore, search, and synchronize all modules, components, and services across the <strong>Oko-main</strong> ecosystem.
        </p>

        {/* Search and Filters */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Search Files</label>
            <input
              type="text"
              placeholder="Search by name, path, or description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-indigo-500"
            />
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Category</label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {categories.map(cat => (
                <option key={cat} value={cat}>{cat}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-gray-400 uppercase mb-1">Type</label>
            <select
              value={selectedType}
              onChange={(e) => setSelectedType(e.target.value)}
              className="w-full px-3 py-2 bg-gray-900 border border-gray-700 rounded text-sm text-white focus:outline-none focus:border-indigo-500"
            >
              {types.map(typ => (
                <option key={typ} value={typ}>{typ.toUpperCase()}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Stats Summary */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 p-4 bg-gray-900/50 rounded-lg border border-gray-800">
          <div className="text-center">
            <div className="text-2xl font-bold text-indigo-400">{ALL_APP_FILES.length}</div>
            <div className="text-xs text-gray-500 uppercase">Total Files</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-emerald-400">
              {ALL_APP_FILES.filter(f => f.type === 'component').length}
            </div>
            <div className="text-xs text-gray-500 uppercase">Components</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-amber-400">
              {ALL_APP_FILES.filter(f => f.type === 'service').length}
            </div>
            <div className="text-xs text-gray-500 uppercase">Services</div>
          </div>
          <div className="text-center">
            <div className="text-2xl font-bold text-purple-400">
              {ALL_APP_FILES.filter(f => f.type === 'model').length}
            </div>
            <div className="text-xs text-gray-500 uppercase">Models</div>
          </div>
        </div>

        {/* Action Bar */}
        <div className="flex justify-between items-center">
          <span className="text-xs text-gray-400">
            Showing {filteredFiles.length} of {ALL_APP_FILES.length} files
          </span>
          <button
            onClick={handleSyncAll}
            disabled={syncingFile !== null}
            className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:bg-indigo-800 text-white text-xs font-semibold rounded transition-colors"
          >
            {syncingFile === 'ALL_FILES' ? 'Syncing All Files...' : 'Sync All Filtered Files'}
          </button>
        </div>

        {/* File List */}
        <div className="max-h-96 overflow-y-auto space-y-2 pr-2 scrollbar-thin scrollbar-thumb-gray-700 scrollbar-track-transparent">
          {filteredFiles.length > 0 ? (
            filteredFiles.map((file) => {
              const isSynced = syncedFiles[file.path];
              const isCurrentlySyncing = syncingFile === file.path || syncingFile === 'ALL_FILES';

              return (
                <div
                  key={file.path}
                  className="p-3 bg-gray-900/40 hover:bg-gray-900/80 border border-gray-800 hover:border-gray-700 rounded-lg flex flex-col md:flex-row md:items-center justify-between gap-4 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-semibold text-gray-200">{file.name}</span>
                      <span className={`px-2 py-0.5 text-[10px] font-bold rounded uppercase ${
                        file.type === 'component' ? 'bg-emerald-950 text-emerald-400 border border-emerald-800' :
                        file.type === 'service' ? 'bg-amber-950 text-amber-400 border border-amber-800' :
                        file.type === 'model' ? 'bg-purple-950 text-purple-400 border border-purple-800' :
                        'bg-blue-950 text-blue-400 border border-blue-800'
                      }`}>
                        {file.type}
                      </span>
                      <span className="text-xs text-gray-500">({file.category})</span>
                    </div>
                    <div className="text-xs text-gray-400">{file.description}</div>
                    <div className="text-[10px] text-gray-600 font-mono">{file.path}</div>
                  </div>

                  <div className="flex items-center gap-2 self-end md:self-center">
                    <button
                      onClick={() => handleSync(file.path)}
                      disabled={isCurrentlySyncing || isSynced}
                      className={`px-3 py-1.5 text-xs font-semibold rounded transition-all ${
                        isSynced
                          ? 'bg-emerald-950 text-emerald-400 border border-emerald-800 cursor-default'
                          : isCurrentlySyncing
                          ? 'bg-gray-800 text-gray-400 border border-gray-700 cursor-wait'
                          : 'bg-gray-800 hover:bg-gray-700 text-gray-200 border border-gray-700'
                      }`}
                    >
                      {isCurrentlySyncing ? 'Syncing...' : isSynced ? 'Synced ✓' : 'Sync File'}
                    </button>
                  </div>
                </div>
              );
            })
          ) : (
            <div className="text-center py-8 text-gray-500 text-sm">
              No files match your search criteria.
            </div>
          )}
        </div>
      </div>
    </Card>
  );
};

export default FeaturePalette;