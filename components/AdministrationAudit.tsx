import React, { useState } from 'react';
import { 
  AlertTriangle, 
  CheckCircle2, 
  TrendingDown, 
  TrendingUp, 
  Hammer, 
  Coins, 
  ShieldAlert, 
  Sparkles, 
  Users, 
  ArrowRight,
  Award,
  Skull,
  Folder,
  FileCode,
  Search,
  Filter,
  Globe,
  Layout,
  GitBranch,
  Cpu,
  Crown,
  BookOpen,
  Building,
  Check,
  X,
  ShieldCheck
} from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';

interface PolicyItem {
  id: string;
  title: string;
  description: string;
  impact: string;
  category: 'logic' | 'war' | 'labor';
}

const fileCategories = [
  {
    name: "APIs & Routes",
    files: [
      "api/acquisitions.ts", "api/ai.ts", "api/alpacaCollateral.ts", "api/alpaca.ts",
      "api/azureGovCompliance.ts", "api/azure.ts", "api/citi.ts", "api/config.ts",
      "api/crypto-strategy.ts", "api/fapi.ts", "api/google-chat.ts", "api/government-gateway.ts",
      "api/modern-treasury.ts", "api/plaid.ts", "api/real-estate.ts", "api/sovereign.ts",
      "api/stripe.ts", "api/tax-liens.ts", "api/tqqq-strategy.ts",
      "api/routes/acquisitions-orchestrator.ts", "api/routes/admin.ts", "api/routes/audit.ts",
      "api/routes/collateral.ts", "api/routes/identity.ts", "api/routes/market.ts",
      "api/routes/notifications.ts", "api/routes/treasury.ts", "api/routes/webhooks.ts"
    ]
  },
  {
    name: "UI Components",
    files: [
      "components/AdministrationAudit.tsx", "components/AIAdStudioView.tsx", "components/AIAdvisorView.tsx",
      "components/AIInsights.tsx", "components/AlpacaBrokerView.tsx", "components/APIIntegrationView.tsx",
      "components/APIKeysView.tsx", "components/AquariusArchitectView.tsx", "components/AquariusAuditorView.tsx",
      "components/AquariusCreativeSuite.tsx", "components/AquariusDashboard.tsx", "components/AquariusGhostView.tsx",
      "components/AquariusInstitutionalHub.tsx", "components/AquariusLiveVoice.tsx", "components/AriaComms.tsx",
      "components/AstraDBQuickstart.tsx", "components/AzureAppsView.tsx", "components/BalanceSummary.tsx",
      "components/BillingIdentityView.tsx", "components/BudgetsView.tsx", "components/CardCustomizationView.tsx",
      "components/Card.tsx", "components/CitiConnectInitiation.tsx", "components/CitiConnectInquiry.tsx",
      "components/CitiConnectNotifications.tsx", "components/CitiDecryptionUtility.tsx", "components/CitiGateway.tsx",
      "components/CitiPartnerHub.tsx", "components/CitiSovereignLedger.tsx", "components/CitiTreasuryHub.tsx",
      "components/CitiUkInternationalPayments.tsx", "components/ContractorLobbyingList.tsx", "components/CorporateCommandView.tsx",
      "components/CreditHealthView.tsx", "components/CryptoView.tsx", "components/Dashboard.tsx",
      "components/DataIngestView.tsx", "components/DeveloperView.tsx", "components/EntraSwarmManager.tsx",
      "components/ErrorBoundary.tsx", "components/FeaturePalette.tsx", "components/FinancialDemocracyView.tsx",
      "components/FinancialGoalsView.tsx", "components/FleetAppView.tsx", "components/FloridaVoterView.tsx",
      "components/FlowController.tsx", "components/GasPriceCorrelation.tsx", "components/GcpInventoryView.tsx",
      "components/GeminiKeyModal.tsx", "components/GeminiLivePortal.tsx", "components/GlobalLedgerView.tsx",
      "components/GoalsView.tsx", "components/GrowthNexus.tsx", "components/Header.tsx",
      "components/HoKTokenMint.tsx", "components/IdentityCitadelView.tsx", "components/ImpactTracker.tsx",
      "components/ImpeachmentGenerator.tsx", "components/InjusticeDashboard.tsx", "components/IntegrationsMarketplaceView.tsx",
      "components/IntelligenceHubView.tsx", "components/InvestmentPortfolio.tsx", "components/InvestmentsPortfolio.tsx",
      "components/InvestmentsView.tsx", "components/JweJwsVerifier.tsx", "components/KryptoBridgeWidget.tsx",
      "components/MachineView.tsx", "components/MarketingAutomationView.tsx", "components/MarketplaceView.tsx",
      "components/ModernTreasuryLedgerHub.tsx", "components/NeuralToolsView.tsx", "components/NexusBuilder.tsx",
      "components/NFCValidator.tsx", "components/OFXStatementViewer.tsx", "components/OpenBankingFapiView.tsx",
      "components/OpenBankingView.tsx", "components/PaymentMethodsView.tsx", "components/PersonalizationView.tsx",
      "components/PlaidLinkButton.tsx", "components/PlaidLink.tsx", "components/PoliticalComplianceView.tsx",
      "components/PortalHandshake.tsx", "components/PortalHubView.tsx", "components/PrivacyGuardianView.tsx",
      "components/PublicAidCalculator.tsx", "components/QuantumWeaverView.tsx", "components/RecentTransactions.tsx",
      "components/RecoveryMeshView.tsx", "components/RewardsView.tsx", "components/SecurityOrchestratorView.tsx",
      "components/SecurityView.tsx", "components/SendMoneyView.tsx", "components/SettingsView.tsx",
      "components/Sidebar.tsx", "components/SovereignChat.tsx", "components/SovereignDashboard.tsx",
      "components/SovereignDealAudit.tsx", "components/SovereignIframe.tsx", "components/SovereignIntelligenceView.tsx",
      "components/SovereignOrgHandshake.tsx", "components/SovereignSentryEngine.tsx", "components/StoryViewer.tsx",
      "components/StripeTreasuryManager.tsx", "components/TabManager.tsx", "components/TheVisionView.tsx",
      "components/TokenIssuanceView.tsx", "components/TradingBotsView.tsx", "components/TransactionsView.tsx",
      "components/TrustRegistryView.tsx", "components/Universe3D.tsx", "components/UniverseGraphVisualizer.tsx",
      "components/VoiceControl.tsx", "components/WalletConnectModal.tsx", "components/WarAppropriationsTracker.tsx",
      "components/WealthDistributionChart.tsx", "components/WealthNexusView.tsx", "components/WealthTimeline.tsx",
      "components/WorkspaceNexusView.tsx"
    ]
  },
  {
    name: "Bridges & Integrations",
    files: [
      "components/bridges/CitiAlpacaBridgeView.tsx", "components/bridges/PlaidAlpacaBridgeView.tsx",
      "components/bridges/RealEstateAlpacaBridge.tsx", "components/bridges/SovereignMarketTakeoverDashboard.tsx",
      "components/bridges/StripeAlpacaBridgeView.tsx", "components/bridges/TaxLienModernTreasuryBridge.tsx"
    ]
  },
  {
    name: "Alpaca Trading Hub",
    files: [
      "components/alpaca/AlpacaAccountsManager.tsx", "components/alpaca/AlpacaCryptoWalletsView.tsx",
      "components/alpaca/AlpacaFundingHub.tsx", "components/alpaca/AlpacaIpoMarketplaceView.tsx",
      "components/alpaca/AlpacaJournalsView.tsx", "components/alpaca/AlpacaRebalancingView.tsx",
      "components/alpaca/AlpacaReportingView.tsx", "components/alpaca/AlpacaTokenizationView.tsx",
      "components/alpaca/AlpacaTradingTerminal.tsx", "components/alpaca/BtcSwingTradingNotebook.tsx",
      "components/alpaca/TqqqAlgorithmTerminal.tsx"
    ]
  },
  {
    name: "Government & Tax",
    files: [
      "components/government/GisPropertyMap.tsx", "components/government/GovernmentApiDashboard.tsx",
      "components/government/IrsTaxFiling.tsx", "components/government/SecFilingViewer.tsx",
      "components/tax-liens/ForeclosureTracker.tsx", "components/tax-liens/TaxLienAuctions.tsx"
    ]
  },
  {
    name: "Services & Engines",
    files: [
      "services/AlpacaAccountsService.ts", "services/alpacaBrokerService.ts", "services/AlpacaBrokerService.ts",
      "services/alpacaCollateralService.ts", "services/AlpacaFundingService.ts", "services/AlpacaJournalsService.ts",
      "services/AlpacaMarketDataService.ts", "services/AlpacaOptionsTradingService.ts", "services/AlpacaRebalancingService.ts",
      "services/AlpacaReportingService.ts", "services/AlpacaTokenizationService.ts", "services/AlpacaTradingService.ts",
      "services/assetAcquisitionService.ts", "services/astraService.ts", "services/AstraVectorSearchService.ts",
      "services/AuthService.ts", "services/azureGovComplianceService.ts", "services/CitiAlpacaBridgeService.ts",
      "services/citiCryptoService.ts", "services/compressionProvider.ts", "services/consolidatedApiManager.ts",
      "services/defenderATPService.ts", "services/entraSecurityService.ts", "services/entraService.ts",
      "services/geminiService.ts", "services/governmentApiService.ts", "services/GovernmentApiService.ts",
      "services/LastBossService.ts", "services/marketDataService.ts", "services/ModernTreasuryService.ts",
      "services/ofxService.ts", "services/PlaidBridgeService.ts", "services/PulsarService.ts",
      "services/QuantumClient.ts", "services/RealEstateService.ts", "services/RemitraxService.ts",
      "services/SecurityService.ts", "services/serverHelpers.ts", "services/SovereignIntelligence.ts",
      "services/StripeBridgeService.ts", "services/StripeService.ts", "services/TaxLienService.ts",
      "services/underwritingEngine.ts", "services/WalletService.ts", "services/WorkspaceService.ts",
      "services/ZKPEngine.ts"
    ]
  },
  {
    name: "Trillionaire Status Models",
    files: [
      "trillionaire-status/CapitalAllocationModels.ts", "trillionaire-status/CompetitorIntelligence.ts",
      "trillionaire-status/ConsumerSentimentAnalysis.ts", "trillionaire-status/CorporateGovernanceReview.ts",
      "trillionaire-status/DigitalTransformationAudit.ts", "trillionaire-status/EmergingMarketExpansion.ts",
      "trillionaire-status/ESGImpactMetrics.ts", "trillionaire-status/ExecutiveCompensationAudit.ts",
      "trillionaire-status/FinancialDataIngestion.ts", "trillionaire-status/Fortune500ResearchPlan.ts",
      "trillionaire-status/GlobalTaxStrategy.ts", "trillionaire-status/InfrastructureDependencies.ts",
      "trillionaire-status/InnovationPipelineResearch.ts", "trillionaire-status/LobbyingInfluenceMapping.ts",
      "trillionaire-status/MarketCapAnalysis.ts", "trillionaire-status/MergersAndAcquisitions.ts",
      "trillionaire-status/PatentPortfolioAudit.ts", "trillionaire-status/RegulatoryComplianceAudit.ts",
      "trillionaire-status/RiskAssessmentFramework.ts", "trillionaire-status/ShareholderValueMetrics.ts",
      "trillionaire-status/SupplyChainMapping.ts", "trillionaire-status/SustainabilityReporting.ts",
      "trillionaire-status/TalentAcquisitionPipeline.ts", "trillionaire-status/TechStackIntegration.ts",
      "trillionaire-status/TrillionaireStatusSummary.ts"
    ]
  },
  {
    name: "Story Pages (100 Pages)",
    files: Array.from({ length: 100 }, (_, i) => `story/page-${String(i + 1).padStart(3, '0')}.md`)
  }
];

export default function AdministrationAudit() {
  const [activeTab, setActiveTab] = useState<'audit' | 'blueprint' | 'files'>('audit');
  
  // Interactive Simulator State
  const [laborWageSupport, setLaborWageSupport] = useState<number>(10); 
  const [warBudgetRedirect, setWarBudgetRedirect] = useState<number>(90); 
  const [publicLogicAccess, setPublicLogicAccess] = useState<boolean>(false);
  const [stopEliteParties, setStopEliteParties] = useState<boolean>(false);

  // Codebase Audit State
  const [fileSearch, setFileSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [selectedFile, setSelectedFile] = useState<string | null>("components/AdministrationAudit.tsx");
  const [liberatedFiles, setLiberatedFiles] = useState<string[]>([]);
  const [verifiedFiles, setVerifiedFiles] = useState<string[]>([]);

  // Calculate dynamic scores based on user input
  const calculateGarbageRating = () => {
    let score = 100;
    score += (warBudgetRedirect - 30); 
    score += (50 - laborWageSupport) * 1.5;
    if (!publicLogicAccess) score += 25;
    if (!stopEliteParties) score += 20;

    return Math.min(Math.max(Math.round(score), 0), 100);
  };

  const garbageScore = calculateGarbageRating();

  const getRatingLabel = (score: number) => {
    if (score > 120) return { label: "ABSOLUTE GARBAGE (F-)", color: "text-red-600 bg-red-500/10 border-red-500/20" };
    if (score > 90) return { label: "CRITICAL FAILURE (F)", color: "text-red-500 bg-red-500/5 border-red-500/10" };
    if (score > 60) return { label: "CORRUPT & SELF-SERVING (D)", color: "text-orange-500 bg-orange-500/5 border-orange-500/10" };
    if (score > 30) return { label: "PASSABLE BUT COMPROMISED (C)", color: "text-yellow-600 bg-yellow-500/5 border-yellow-500/10" };
    return { label: "THE PEOPLE'S CHAMPION (A+)", color: "text-emerald-600 bg-emerald-500/5 border-emerald-500/10" };
  };

  const ratingInfo = getRatingLabel(garbageScore);

  const policies: PolicyItem[] = [
    {
      id: 'logic-1',
      category: 'logic',
      title: 'Liberate the Public Logic',
      description: 'Stop the corporate-government collusion of stealing proprietary logic built by the people. Return the IP to the public domain so any business can build on it.',
      impact: 'Destroys state-backed monopolies and unleashes true working-class innovation.'
    },
    {
      id: 'war-1',
      category: 'war',
      title: 'The War-Fund Freeze & Reallocation',
      description: 'Legislate that money raised specifically for defense/war cannot be hoarded, diverted, or frozen in private defense contractor accounts once conflicts halt. If the war stops, the money goes directly back to the taxpayers.',
      impact: 'Ends the bait-and-switch pipeline where elites get rich off war funding that never gets spent on actual defense.'
    },
    {
      id: 'labor-1',
      category: 'labor',
      title: 'Labor-First Wealth Distribution',
      description: 'Ban taxpayer-funded political galas, lobbyist dinners, and elite parties until every blue-collar worker is guaranteed a living wage, robust healthcare, and pension security.',
      impact: 'Restores dignity to the people who actually build, maintain, and run the infrastructure of America.'
    }
  ];

  const getFileAuditDetails = (filePath: string) => {
    const name = filePath.split('/').pop() || '';
    let baseStatus: 'verified' | 'stolen_risk' | 'monopoly_risk' | 'secure' | 'pending' = 'secure';
    let baseScore = 95;
    let description = "Core system module supporting decentralized operations.";

    if (filePath.includes('api/')) {
      description = `API endpoint managing secure data transmission and integration for ${name.replace('.ts', '')}.`;
    } else if (filePath.includes('components/')) {
      description = `Interactive UI view rendering ${name.replace('.tsx', '')} interface with real-time state updates.`;
    } else if (filePath.includes('services/')) {
      description = `Backend service orchestrating business logic, data processing, and external API calls for ${name.replace('.ts', '')}.`;
    } else if (filePath.includes('trillionaire-status/')) {
      description = `Strategic intelligence model analyzing global wealth distribution, market cap, and corporate governance.`;
      baseStatus = 'stolen_risk';
      baseScore = 42;
    } else if (filePath.includes('story/')) {
      description = `Chronicle page documenting the systemic evolution, public logic struggle, and the path to financial democracy.`;
      baseStatus = 'verified';
      baseScore = 100;
    }

    if (name.includes('Bridge') || name.includes('bridge')) {
      description = `Cross-platform bridge facilitating seamless asset and data flow between legacy systems and decentralized ledgers.`;
    }

    if (name.includes('Sovereign') || name.includes('Citi') || name.includes('Alpaca')) {
      baseStatus = 'monopoly_risk';
      baseScore = 68;
    }

    if (name === 'AdministrationAudit.tsx') {
      baseStatus = 'verified';
      baseScore = 100;
      description = "The master audit dashboard exposing systemic performance, stolen logic risks, and the blueprint for greatness.";
    }

    let status = baseStatus;
    let score = baseScore;

    if (liberatedFiles.includes(filePath)) {
      status = 'verified';
      score = 100;
    } else if (verifiedFiles.includes(filePath)) {
      status = 'secure';
      score = 99;
    }

    return { status, score, description };
  };

  const getCategoryIcon = (categoryName: string) => {
    switch (categoryName) {
      case "APIs & Routes": return <Globe className="w-4 h-4" />;
      case "UI Components": return <Layout className="w-4 h-4" />;
      case "Bridges & Integrations": return <GitBranch className="w-4 h-4" />;
      case "Alpaca Trading Hub": return <TrendingUp className="w-4 h-4" />;
      case "Government & Tax": return <Building className="w-4 h-4" />;
      case "Services & Engines": return <Cpu className="w-4 h-4" />;
      case "Trillionaire Status Models": return <Crown className="w-4 h-4" />;
      case "Story Pages (100 Pages)": return <BookOpen className="w-4 h-4" />;
      default: return <Folder className="w-4 h-4" />;
    }
  };

  const filteredFiles = fileCategories.flatMap(cat => 
    cat.files.map(f => ({ ...getFileAuditDetails(f), path: f, category: cat.name }))
  ).filter(f => {
    const matchesSearch = f.path.toLowerCase().includes(fileSearch.toLowerCase());
    const matchesCategory = selectedCategory ? f.category === selectedCategory : true;
    return matchesSearch && matchesCategory;
  });

  const selectedFileDetails = selectedFile ? {
    path: selectedFile,
    ...getFileAuditDetails(selectedFile),
    category: fileCategories.find(cat => cat.files.includes(selectedFile))?.name || "System"
  } : null;

  return (
    <div className="max-w-5xl mx-auto my-8 bg-slate-950 rounded-[3rem] shadow-2xl border border-white/5 overflow-hidden font-sans">
      {/* Header Banner */}
      <div className="bg-gradient-to-r from-slate-900 via-red-950 to-slate-900 p-12 text-white relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-red-900/20 via-transparent to-transparent pointer-events-none" />
        <div className="relative z-10">
          <span className="px-4 py-1 bg-red-500/20 border border-red-500/30 rounded-full text-[10px] font-black tracking-[0.3em] text-red-400 uppercase">
            Systemic Performance Audit
          </span>
          <h1 className="text-4xl font-black tracking-tighter mt-6 mb-4 uppercase">
            THE ADMINISTRATION AUDIT CARD
          </h1>
          <p className="text-slate-400 text-sm max-w-2xl leading-relaxed font-bold uppercase tracking-widest opacity-80">
            An interactive breakdown of why the current administration is delivering a garbage-tier performance for the working class—and the exact blueprint required to become the greatest administration in history.
          </p>
        </div>
      </div>

      {/* Interactive Scoreboard */}
      <div className="bg-slate-900/50 border-b border-white/5 p-10 grid grid-cols-1 md:grid-cols-3 gap-10 items-center">
        <div className="md:col-span-2 space-y-4">
          <h3 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-500">Current Performance Rating</h3>
          <div className={`inline-flex items-center gap-3 px-6 py-4 rounded-3xl border font-black text-xl tracking-tight ${ratingInfo.color}`}>
            {garbageScore > 60 ? <AlertTriangle className="w-6 h-6 shrink-0" /> : <Award className="w-6 h-6 shrink-0" />}
            {ratingInfo.label}
          </div>
          <p className="text-xs text-slate-500 font-bold uppercase tracking-widest leading-relaxed">
            {garbageScore > 60 
              ? "Reflecting systemic corruption, stolen public logic, war-profiteering bait-and-switches, and the abandonment of real labor."
              : "Excellent. By prioritizing labor, freeing public logic, and stopping war-funding scams, America becomes great again."}
          </p>
        </div>

        <div className="bg-black/50 p-8 rounded-[2.5rem] border border-white/10 shadow-inner">
          <div className="flex justify-between items-center mb-4">
            <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Injustice Index</span>
            <span className="text-lg font-black text-red-500 font-mono">{garbageScore}%</span>
          </div>
          <div className="w-full bg-slate-800 rounded-full h-4 overflow-hidden p-1 border border-white/5">
            <motion.div 
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(garbageScore, 100)}%` }}
              className="bg-gradient-to-r from-amber-500 to-red-600 h-full rounded-full shadow-[0_0_10px_rgba(220,38,38,0.3)]"
            />
          </div>
          <div className="flex justify-between text-[8px] font-black text-slate-600 mt-3 uppercase tracking-widest">
            <span>0% (FAIR & JUST)</span>
            <span>100% (GARBAGE JOB)</span>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="flex border-b border-white/5 bg-slate-900/30 overflow-x-auto scrollbar-none">
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex-1 min-w-[180px] py-6 px-8 text-center font-black text-[10px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center justify-center gap-3 ${
            activeTab === 'audit'
              ? 'border-red-600 text-red-500 bg-red-600/5'
              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <Skull className="w-5 h-5" />
          The "Garbage Job" Audit
        </button>
        <button
          onClick={() => setActiveTab('blueprint')}
          className={`flex-1 min-w-[180px] py-6 px-8 text-center font-black text-[10px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center justify-center gap-3 ${
            activeTab === 'blueprint'
              ? 'border-emerald-600 text-emerald-500 bg-emerald-600/5'
              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <Sparkles className="w-5 h-5" />
          "How to Be the Best" Blueprint
        </button>
        <button
          onClick={() => setActiveTab('files')}
          className={`flex-1 min-w-[180px] py-6 px-8 text-center font-black text-[10px] uppercase tracking-[0.2em] border-b-2 transition-all flex items-center justify-center gap-3 ${
            activeTab === 'files'
              ? 'border-blue-600 text-blue-500 bg-blue-600/5'
              : 'border-transparent text-slate-500 hover:text-slate-300 hover:bg-white/5'
          }`}
        >
          <Folder className="w-5 h-5" />
          System Codebase Audit
        </button>
      </div>

      {/* Tab Content */}
      <div className="p-10">
        <AnimatePresence mode="wait">
          {activeTab === 'audit' && (
            <motion.div 
              key="audit"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-10"
            >
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Card 1: Stolen Logic */}
                <div className="border border-white/5 bg-slate-900/50 rounded-[2rem] p-8 space-y-6 hover:border-red-500/20 transition-all group">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <ShieldAlert className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-white text-base uppercase tracking-tight leading-tight">The Stolen Logic Deal</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    They wanted to act like my logic was theirs. They killed a deal that never happened because they wanted to monopolize public logic for private gain.
                  </p>
                  <div className="text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 w-fit uppercase tracking-widest">
                    VERDICT: INTELLECTUAL THEFT
                  </div>
                </div>

                {/* Card 2: War Money Bait-and-Switch */}
                <div className="border border-white/5 bg-slate-900/50 rounded-[2rem] p-8 space-y-6 hover:border-red-500/20 transition-all group">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <Coins className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-white text-base uppercase tracking-tight leading-tight">The War Money Scam</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    They demand billions for war. But as soon as they secure the cash, they stop the war—leaving the money frozen or diverted to elites.
                  </p>
                  <div className="text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 w-fit uppercase tracking-widest">
                    VERDICT: BUDGETARY FRAUD
                  </div>
                </div>

                {/* Card 3: Labor Abandonment */}
                <div className="border border-white/5 bg-slate-900/50 rounded-[2rem] p-8 space-y-6 hover:border-red-500/20 transition-all group">
                  <div className="p-3 bg-red-500/10 text-red-500 rounded-2xl w-fit group-hover:scale-110 transition-transform">
                    <Hammer className="w-6 h-6" />
                  </div>
                  <h4 className="font-black text-white text-base uppercase tracking-tight leading-tight">Elite Parties vs. Real Labor</h4>
                  <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">
                    The people who build this country get absolutely nothing. Meanwhile, the corrupt administration goes to lavish, taxpayer-funded parties.
                  </p>
                  <div className="text-[9px] font-black text-red-500 bg-red-500/10 px-3 py-1.5 rounded-full border border-red-500/20 w-fit uppercase tracking-widest">
                    VERDICT: ULTIMATE INJUSTICE
                  </div>
                </div>
              </div>

              {/* Interactive Policy Simulator Panel */}
              <div className="bg-slate-900 rounded-[3rem] p-10 space-y-8 border border-white/5 relative overflow-hidden shadow-inner">
                <div className="absolute top-0 right-0 w-64 h-64 bg-red-600/5 rounded-full blur-3xl pointer-events-none" />
                <div className="flex items-center gap-4">
                  <div className="p-3 bg-red-500/10 rounded-2xl">
                    <TrendingDown className="text-red-500 w-6 h-6" />
                  </div>
                  <div>
                    <h3 className="font-black text-xl text-white uppercase tracking-tight">Interactive Injustice Simulator</h3>
                    <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mt-1">Real-time systemic outcome modeling</p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-10 pt-4">
                  <div className="space-y-8">
                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">War Budget Allocation</span>
                        <span className="text-red-500 font-mono">{warBudgetRedirect}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="10" 
                        max="100" 
                        value={warBudgetRedirect}
                        onChange={(e) => setWarBudgetRedirect(Number(e.target.value))}
                        className="w-full accent-red-600 bg-slate-800 h-2 rounded-full appearance-none cursor-pointer"
                      />
                    </div>

                    <div className="space-y-4">
                      <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                        <span className="text-slate-400">Labor Support & Wages</span>
                        <span className="text-emerald-500 font-mono">{laborWageSupport}%</span>
                      </div>
                      <input 
                        type="range" 
                        min="0" 
                        max="100" 
                        value={laborWageSupport}
                        onChange={(e) => setLaborWageSupport(Number(e.target.value))}
                        className="w-full accent-emerald-500 bg-slate-800 h-2 rounded-full appearance-none cursor-pointer"
                      />
                    </div>
                  </div>

                  <div className="space-y-4 bg-black/40 p-8 rounded-[2rem] border border-white/5">
                    <label className="flex items-center gap-4 cursor-pointer select-none group">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={publicLogicAccess}
                          onChange={(e) => setPublicLogicAccess(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${publicLogicAccess ? 'bg-emerald-600' : 'bg-slate-700'}`} />
                        <motion.div 
                          animate={{ x: publicLogicAccess ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-200 block">Make Logic Public</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Bypass state monopoly</span>
                      </div>
                    </label>

                    <label className="flex items-center gap-4 cursor-pointer select-none group pt-4 border-t border-white/5">
                      <div className="relative">
                        <input 
                          type="checkbox" 
                          checked={stopEliteParties}
                          onChange={(e) => setStopEliteParties(e.target.checked)}
                          className="sr-only"
                        />
                        <div className={`w-12 h-6 rounded-full transition-colors ${stopEliteParties ? 'bg-emerald-600' : 'bg-slate-700'}`} />
                        <motion.div 
                          animate={{ x: stopEliteParties ? 24 : 4 }}
                          className="absolute top-1 w-4 h-4 rounded-full bg-white shadow-md"
                        />
                      </div>
                      <div>
                        <span className="text-xs font-black uppercase tracking-widest text-slate-200 block">Ban Elite Parties</span>
                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest mt-1 block">Redirect gala funds to labor</span>
                      </div>
                    </label>
                  </div>
                </div>

                <div className="bg-black/60 p-6 rounded-2xl flex items-center justify-between text-[10px] font-black tracking-[0.2em] uppercase border border-white/5">
                  <span className="text-slate-500 italic">Simulated Strategic Outcome:</span>
                  <span className={`font-black ${garbageScore > 60 ? 'text-red-500' : 'text-emerald-500'}`}>
                    {garbageScore > 60 ? "❌ AMERICA DECLINE DETECTED" : "✨ PATH TO GREATNESS UNLOCKED"}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'blueprint' && (
            <motion.div 
              key="blueprint"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-10"
            >
              <div className="bg-emerald-950/20 border border-emerald-500/20 rounded-[3rem] p-10 flex items-start gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(circle_at_bottom_left,rgba(16,185,129,0.1),transparent_50%)]" />
                <div className="p-4 bg-emerald-500 text-black rounded-[1.5rem] relative z-10 shadow-lg shadow-emerald-500/20">
                  <TrendingUp className="w-8 h-8" />
                </div>
                <div className="relative z-10">
                  <h3 className="font-black text-white text-2xl uppercase tracking-tight leading-tight">How to Become the Best Administration</h3>
                  <p className="text-sm text-slate-400 mt-3 font-bold uppercase tracking-widest leading-relaxed opacity-80">
                    The solution is simple: stop serving the elite class and start serving the people who build this country. Implementing these pillars transforms failure into world-record excellence.
                  </p>
                </div>
              </div>

              <div className="space-y-6">
                {policies.map((policy, idx) => (
                  <div key={policy.id} className="border border-white/5 rounded-[2.5rem] p-8 hover:border-emerald-500/30 transition-all bg-slate-900/30 group">
                    <div className="flex items-start justify-between gap-6">
                      <div className="space-y-3">
                        <div className="flex items-center gap-3">
                          <span className="text-[10px] font-black uppercase tracking-[0.3em] text-emerald-500 bg-emerald-500/10 px-3 py-1.5 rounded-full border border-emerald-500/20">
                            PILLAR 0{idx + 1}
                          </span>
                          <CheckCircle2 className="w-5 h-5 text-emerald-500 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </div>
                        <h4 className="font-black text-white text-xl uppercase tracking-tight">{policy.title}</h4>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest leading-relaxed">{policy.description}</p>
                      </div>
                    </div>
                    <div className="mt-8 pt-6 border-t border-white/5 flex items-center gap-3 text-[10px] font-black uppercase tracking-widest">
                      <span className="text-slate-500">Projected Impact:</span>
                      <span className="text-emerald-400">{policy.impact}</span>
                    </div>
                  </div>
                ))}
              </div>

              <div className="bg-gradient-to-r from-emerald-600 to-teal-700 text-white rounded-[3rem] p-10 text-center space-y-6 relative overflow-hidden shadow-2xl shadow-emerald-500/20">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.1),transparent_70%)] animate-pulse" />
                <h4 className="font-black text-2xl uppercase tracking-tight relative z-10">THE ULTIMATE INJUSTICE MUST BE FIXED</h4>
                <p className="text-xs text-emerald-50 font-black uppercase tracking-[0.2em] max-w-2xl mx-auto leading-loose relative z-10 opacity-90">
                  America will never be great again until the laborers who build the machine are prioritized over the cocktail class that siphons the oil.
                </p>
                <div className="pt-4 relative z-10">
                  <button 
                    onClick={() => {
                      setLaborWageSupport(85);
                      setWarBudgetRedirect(15);
                      setPublicLogicAccess(true);
                      setStopEliteParties(true);
                      setActiveTab('audit');
                    }}
                    className="inline-flex items-center gap-3 bg-white text-emerald-700 font-black text-[10px] uppercase tracking-widest px-8 py-5 rounded-[1.5rem] hover:bg-emerald-50 transition-all shadow-xl active:scale-95"
                  >
                    Apply Optimal Reform Parameters
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </motion.div>
          )}

          {activeTab === 'files' && (
            <motion.div 
              key="files"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className="space-y-8"
            >
              {/* Codebase Audit Summary */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Total System Files</span>
                  <span className="text-2xl font-black text-white font-mono">488</span>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Verified Public Domain</span>
                  <span className="text-2xl font-black text-emerald-500 font-mono">
                    {101 + liberatedFiles.length}
                  </span>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Secure Modules</span>
                  <span className="text-2xl font-black text-blue-500 font-mono">
                    {295 + verifiedFiles.length}
                  </span>
                </div>
                <div className="bg-slate-900/50 border border-white/5 rounded-2xl p-5 text-center">
                  <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Stolen Logic Flagged</span>
                  <span className="text-2xl font-black text-red-500 font-mono">
                    {Math.max(0, 92 - liberatedFiles.length - verifiedFiles.length)}
                  </span>
                </div>
              </div>

              {/* Search & Category Filters */}
              <div className="flex flex-col md:flex-row gap-4 items-center justify-between bg-slate-900/30 p-4 rounded-2xl border border-white/5">
                <div className="relative w-full md:w-72">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                  <input 
                    type="text"
                    placeholder="Search system files..."
                    value={fileSearch}
                    onChange={(e) => setFileSearch(e.target.value)}
                    className="w-full bg-black/50 border border-white/10 rounded-xl pl-10 pr-4 py-2.5 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-blue-500 transition-colors"
                  />
                </div>

                <div className="flex gap-2 overflow-x-auto w-full md:w-auto pb-2 md:pb-0 scrollbar-none">
                  <button
                    onClick={() => setSelectedCategory(null)}
                    className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 ${
                      selectedCategory === null 
                        ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                        : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                    }`}
                  >
                    All Categories
                  </button>
                  {fileCategories.map(cat => (
                    <button
                      key={cat.name}
                      onClick={() => setSelectedCategory(cat.name)}
                      className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest border transition-all shrink-0 flex items-center gap-1.5 ${
                        selectedCategory === cat.name 
                          ? 'bg-blue-600/10 border-blue-500/30 text-blue-400' 
                          : 'bg-black/30 border-white/5 text-slate-400 hover:text-white'
                      }`}
                    >
                      {getCategoryIcon(cat.name)}
                      {cat.name}
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Explorer Layout */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* File List */}
                <div className="lg:col-span-2 bg-black/40 border border-white/5 rounded-3xl p-6 h-[450px] overflow-y-auto scrollbar-thin scrollbar-thumb-white/5">
                  <div className="space-y-2">
                    {filteredFiles.length === 0 ? (
                      <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-widest">
                        No files match your search criteria.
                      </div>
                    ) : (
                      filteredFiles.map(file => (
                        <button
                          key={file.path}
                          onClick={() => setSelectedFile(file.path)}
                          className={`w-full text-left p-3 rounded-xl border transition-all flex items-center justify-between group ${
                            selectedFile === file.path 
                              ? 'bg-blue-600/10 border-blue-500/30 text-white' 
                              : 'bg-slate-900/20 border-transparent hover:bg-slate-900/40 text-slate-400 hover:text-slate-200'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <FileCode className={`w-4 h-4 shrink-0 ${
                              file.status === 'verified' ? 'text-emerald-500' :
                              file.status === 'stolen_risk' ? 'text-red-500' :
                              file.status === 'monopoly_risk' ? 'text-orange-500' : 'text-blue-500'
                            }`} />
                            <span className="text-xs font-mono truncate">{file.path}</span>
                          </div>

                          <div className="flex items-center gap-2 shrink-0">
                            <span className={`text-[8px] font-black uppercase tracking-widest px-2 py-1 rounded-md ${
                              file.status === 'verified' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                              file.status === 'stolen_risk' ? 'bg-red-500/10 text-red-400 border border-red-500/20' :
                              file.status === 'monopoly_risk' ? 'bg-orange-500/10 text-orange-400 border border-orange-500/20' :
                              'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                            }`}>
                              {file.status === 'verified' ? 'Public Domain' :
                               file.status === 'stolen_risk' ? 'Stolen Risk' :
                               file.status === 'monopoly_risk' ? 'Monopoly Risk' : 'Secure'}
                            </span>
                          </div>
                        </button>
                      ))
                    )}
                  </div>
                </div>

                {/* File Detail Panel */}
                <div className="bg-slate-900/50 border border-white/5 rounded-3xl p-6 flex flex-col justify-between h-[450px]">
                  {selectedFileDetails ? (
                    <div className="space-y-6 h-full flex flex-col justify-between">
                      <div className="space-y-6">
                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Selected File</span>
                          <h4 className="font-mono text-xs text-white break-all bg-black/40 p-3 rounded-xl border border-white/5">
                            {selectedFileDetails.path}
                          </h4>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Category</span>
                            <span className="text-xs font-bold text-slate-300 flex items-center gap-1.5">
                              {getCategoryIcon(selectedFileDetails.category)}
                              {selectedFileDetails.category}
                            </span>
                          </div>
                          <div>
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block mb-1">Integrity Score</span>
                            <span className={`text-xs font-black font-mono ${
                              selectedFileDetails.score > 80 ? 'text-emerald-500' :
                              selectedFileDetails.score > 60 ? 'text-orange-500' : 'text-red-500'
                            }`}>
                              {selectedFileDetails.score}%
                            </span>
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Audit Status</span>
                          <div className={`p-3 rounded-xl border text-center font-black text-[10px] uppercase tracking-widest ${
                            selectedFileDetails.status === 'verified' ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400' :
                            selectedFileDetails.status === 'stolen_risk' ? 'bg-red-500/10 border-red-500/20 text-red-400' :
                            selectedFileDetails.status === 'monopoly_risk' ? 'bg-orange-500/10 border-orange-500/20 text-orange-400' :
                            'bg-blue-500/10 border-blue-500/20 text-blue-400'
                          }`}>
                            {selectedFileDetails.status === 'verified' && "Verified Public Domain"}
                            {selectedFileDetails.status === 'stolen_risk' && "Stolen Logic Risk Detected"}
                            {selectedFileDetails.status === 'monopoly_risk' && "Corporate Monopoly Risk"}
                            {selectedFileDetails.status === 'secure' && "Secure System Module"}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest block">Functional Description</span>
                          <p className="text-xs text-slate-400 leading-relaxed font-medium">
                            {selectedFileDetails.description}
                          </p>
                        </div>
                      </div>

                      <div className="pt-4 border-t border-white/5 space-y-2">
                        {selectedFileDetails.status === 'stolen_risk' || selectedFileDetails.status === 'monopoly_risk' ? (
                          <button
                            onClick={() => {
                              if (selectedFile) {
                                setLiberatedFiles(prev => [...prev, selectedFile]);
                              }
                            }}
                            className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <Sparkles className="w-4 h-4" />
                            Liberate to Public Domain
                          </button>
                        ) : selectedFileDetails.status === 'secure' ? (
                          <button
                            onClick={() => {
                              if (selectedFile) {
                                setVerifiedFiles(prev => [...prev, selectedFile]);
                              }
                            }}
                            className="w-full bg-blue-600 hover:bg-blue-500 text-white font-black text-[10px] uppercase tracking-widest py-3 rounded-xl transition-all flex items-center justify-center gap-2"
                          >
                            <ShieldCheck className="w-4 h-4" />
                            Verify Code Integrity
                          </button>
                        ) : (
                          <div className="text-center py-3 text-[9px] font-black text-emerald-500 bg-emerald-500/10 border border-emerald-500/20 rounded-xl uppercase tracking-widest flex items-center justify-center gap-2">
                            <Check className="w-4 h-4" />
                            Audit Complete & Verified
                          </div>
                        )}
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-12 text-slate-500 text-xs font-bold uppercase tracking-widest">
                      Select a file to view audit details.
                    </div>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <footer className="bg-black py-8 px-10 text-[9px] font-black uppercase tracking-[0.4em] text-slate-600 border-t border-white/5 flex flex-col sm:flex-row justify-between items-center gap-4">
        <span>© PUBLIC LOGIC INITIATIVE 2026</span>
        <span className="text-red-500/60 font-black">DEMAND ACCOUNTABILITY • SUPPORT REAL LABOR</span>
      </footer>
    </div>
  );
}