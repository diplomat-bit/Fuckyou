import React, { useState, useEffect, useCallback } from 'react';
import Card from './Card';
import { callGemini } from '../services/geminiService';
import { 
  Sparkles, Video, Image as ImageIcon, Wand2, 
  Maximize, FileImage, Loader2, Play,
  Zap, Upload, Eraser, Palette, Download, Camera, AlertTriangle, Cpu, Globe, ShieldCheck, Terminal,
  Folder, File, ChevronRight, ChevronDown, Search, FileText, Database
} from 'lucide-react';

interface TreeNode {
  name: string;
  type: 'file' | 'directory';
  children?: TreeNode[];
}

const OKO_PATHS = [
  "api/acquisitions.ts",
  "api/ai.ts",
  "api/alpacaCollateral.ts",
  "api/alpaca.ts",
  "api/azureGovCompliance.ts",
  "api/azure.ts",
  "api/citi.ts",
  "api/config.ts",
  "api/crypto-strategy.ts",
  "api/fapi.ts",
  "api/google-chat.ts",
  "api/government-gateway.ts",
  "api/index.ts",
  "api/middleware/auths.ts",
  "api/middleware/rateLimiter.ts",
  "api/modern-treasury.ts",
  "api/plaid.ts",
  "api/real-estate.ts",
  "api/routes/acquisitions-orchestrator.ts",
  "api/routes/admin.ts",
  "api/routes/audit.ts",
  "api/routes/collateral.ts",
  "api/routes/identity.ts",
  "api/routes/market.ts",
  "api/routes/notifications.ts",
  "api/routes/treasury.ts",
  "api/routes/webhooks.ts",
  "api/sovereign.ts",
  "api/stripe.ts",
  "api/tax-liens.ts",
  "api/tqqq-strategy.ts",
  "api/types/sovereign.ts",
  "api/utils/ai-agent-factory.ts",
  "api/utils/complianceEngine.ts",
  "api/utils/crypto-bridge.ts",
  "api/utils/geo-spatial.ts",
  "api/utils/ledgerSync.ts",
  "api/utils/logger.ts",
  "api/utils/math-engine.ts",
  "api/utils/vault.ts",
  "App.tsx",
  "check_sql.ts",
  "components/AdministrationAudit.tsx",
  "components/AIAdStudioView.tsx",
  "components/AIAdvisorView.tsx",
  "components/AIInsights.tsx",
  "components/alpaca/AlpacaAccountsManager.tsx",
  "components/alpaca/AlpacaCryptoWalletsView.tsx",
  "components/alpaca/AlpacaFundingHub.tsx",
  "components/alpaca/AlpacaIpoMarketplaceView.tsx",
  "components/alpaca/AlpacaJournalsView.tsx",
  "components/alpaca/AlpacaRebalancingView.tsx",
  "components/alpaca/AlpacaReportingView.tsx",
  "components/alpaca/AlpacaTokenizationView.tsx",
  "components/alpaca/AlpacaTradingTerminal.tsx",
  "components/alpaca/BtcSwingTradingNotebook.tsx",
  "components/alpaca/TqqqAlgorithmTerminal.tsx",
  "components/AlpacaBrokerView.tsx",
  "components/APIIntegrationView.tsx",
  "components/APIKeysView.tsx",
  "components/AquariusArchitectView.tsx",
  "components/AquariusAuditorView.tsx",
  "components/AquariusCreativeSuite.tsx",
  "components/AquariusDashboard.tsx",
  "components/AquariusGhostView.tsx",
  "components/AquariusInstitutionalHub.tsx",
  "components/AquariusLiveVoice.tsx",
  "components/AriaComms.tsx",
  "components/AstraDBQuickstart.tsx",
  "components/AzureAppsView.tsx",
  "components/BalanceSummary.tsx",
  "components/BillingIdentityView.tsx",
  "components/bridges/CitiAlpacaBridgeView.tsx",
  "components/bridges/PlaidAlpacaBridgeView.tsx",
  "components/bridges/RealEstateAlpacaBridge.tsx",
  "components/bridges/SovereignMarketTakeoverDashboard.tsx",
  "components/bridges/StripeAlpacaBridgeView.tsx",
  "components/bridges/TaxLienModernTreasuryBridge.tsx",
  "components/BudgetsView.tsx",
  "components/CardCustomizationView.tsx",
  "components/Card.tsx",
  "components/CitiConnectInitiation.tsx",
  "components/CitiConnectInquiry.tsx",
  "components/CitiConnectNotifications.tsx",
  "components/CitiDecryptionUtility.tsx",
  "components/CitiGateway.tsx",
  "components/CitiPartnerHub.tsx",
  "components/CitiSovereignLedger.tsx",
  "components/CitiTreasuryHub.tsx",
  "components/CitiUkInternationalPayments.tsx",
  "components/ContractorLobbyingList.tsx",
  "components/CorporateCommandView.tsx",
  "components/CreditHealthView.tsx",
  "components/CryptoView.tsx",
  "components/Dashboard.tsx",
  "components/DataIngestView.tsx",
  "components/DeveloperView.tsx",
  "components/EntraSwarmManager.tsx",
  "components/ErrorBoundary.tsx",
  "components/FeaturePalette.tsx",
  "components/FinancialDemocracyView.tsx",
  "components/FinancialGoalsView.tsx",
  "components/FleetAppView.tsx",
  "components/FloridaVoterView.tsx",
  "components/FlowController.tsx",
  "components/GasPriceCorrelation.tsx",
  "components/GcpInventoryView.tsx",
  "components/GeminiKeyModal.tsx",
  "components/GeminiLivePortal.tsx",
  "components/GlobalLedgerView.tsx",
  "components/GoalsView.tsx",
  "components/government/GisPropertyMap.tsx",
  "components/government/GovernmentApiDashboard.tsx",
  "components/government/IrsTaxFiling.tsx",
  "components/government/SecFilingViewer.tsx",
  "components/GrowthNexus.tsx",
  "components/Header.tsx",
  "components/HoKTokenMint.tsx",
  "components/IdentityCitadelView.tsx",
  "components/ImpactTracker.tsx",
  "components/ImpeachmentGenerator.tsx",
  "components/InjusticeDashboard.tsx",
  "components/IntegrationsMarketplaceView.tsx",
  "components/IntelligenceHubView.tsx",
  "components/InvestmentPortfolio.tsx",
  "components/InvestmentsPortfolio.tsx",
  "components/InvestmentsView.tsx",
  "components/JweJwsVerifier.tsx",
  "components/KryptoBridgeWidget.tsx",
  "components/MachineView.tsx",
  "components/MarketingAutomationView.tsx",
  "components/MarketplaceView.tsx",
  "components/ModernTreasuryLedgerHub.tsx",
  "components/NeuralToolsView.tsx",
  "components/NexusBuilder.tsx",
  "components/NFCValidator.tsx",
  "components/OFXStatementViewer.tsx",
  "components/OpenBankingFapiView.tsx",
  "components/OpenBankingView.tsx",
  "components/PaymentMethodsView.tsx",
  "components/PersonalizationView.tsx",
  "components/PlaidLinkButton.tsx",
  "components/PlaidLink.tsx",
  "components/PoliticalComplianceView.tsx",
  "components/PortalHandshake.tsx",
  "components/PortalHubView.tsx",
  "components/PrivacyGuardianView.tsx",
  "components/PublicAidCalculator.tsx",
  "components/QuantumWeaverView.tsx",
  "components/real-estate/DeedRegistrar.tsx",
  "components/real-estate/EscrowManager.tsx",
  "components/real-estate/PropertyMarketplace.tsx",
  "components/RecentTransactions.tsx",
  "components/RecoveryMeshView.tsx",
  "components/RewardsView.tsx",
  "components/SecurityOrchestratorView.tsx",
  "components/SecurityView.tsx",
  "components/SendMoneyView.tsx",
  "components/SettingsView.tsx",
  "components/Sidebar.tsx",
  "components/SovereignChat.tsx",
  "components/SovereignDashboard.tsx",
  "components/SovereignDealAudit.tsx",
  "components/SovereignIframe.tsx",
  "components/SovereignIntelligenceView.tsx",
  "components/SovereignOrgHandshake.tsx",
  "components/SovereignSentryEngine.tsx",
  "components/StoryViewer.tsx",
  "components/StripeTreasuryManager.tsx",
  "components/TabManager.tsx",
  "components/TheVisionView.tsx",
  "components/TokenIssuanceView.tsx",
  "components/TradingBotsView.tsx",
  "components/TransactionsView.tsx",
  "components/TrustRegistryView.tsx",
  "components/Universe3D.tsx",
  "components/UniverseGraphVisualizer.tsx",
  "components/VoiceControl.tsx",
  "components/WalletConnectModal.tsx",
  "components/WarAppropriationsTracker.tsx",
  "components/WealthDistributionChart.tsx",
  "components/WealthNexusView.tsx",
  "components/WealthTimeline.tsx",
  "components/WorkspaceNexusView.tsx",
  "constants.tsx",
  "context/DataContext.tsx",
  "context/FirebaseContext.tsx",
  "context/PortalContext.tsx",
  "data/businessDeals.ts",
  "data/citiInternalAccounts.ts",
  "data/crypto_btc_usd_swing_trade.ipynb",
  "data/fallbackApps.ts",
  "data/queryManifest.ts",
  "features/index.ts",
  "firebase-applet-config.json",
  "firebase-blueprint.json",
  "firebaseErrors.ts",
  "firebase.json",
  "firebase.ts",
  "firestore.rules",
  "hooks/store.ts",
  "hooks/useAuditTrail.ts",
  "hooks/useSyncProviders.ts",
  "IMG_5610.webp",
  "index.css",
  "index.html",
  "index.tsx",
  "LICENSE",
  "metadata.json",
  "package.json",
  "package-lock.json",
  "public/apps/apps.json",
  "public/oidc-config.json",
  "README.md",
  "replace_keys.cjs",
  "scripts/generate-all-pages.cjs",
  "secrets.json",
  "server/config/env.ts",
  "server/gateway.ts",
  "server/middleware/auth.ts",
  "server/middleware/error-handler.ts",
  "server/middleware/rate-limiter.ts",
  "server/models/asset.model.ts",
  "server/models/transaction.model.ts",
  "server/models/user.model.ts",
  "server/routes/assets.ts",
  "server/routes/cicada-puzzles.ts",
  "server/routes/financials.ts",
  "server/routes/identity.ts",
  "server/routes/procurement.ts",
  "server/routes/quantum-bridge.ts",
  "server/routes/sovereign-analytics.ts",
  "server/routes/supply-chain.ts",
  "server/services/asset-service.ts",
  "server/services/compliance-service.ts",
  "server/services/financial-service.ts",
  "server/services/identity-service.ts",
  "server/services/notification-service.ts",
  "server/services/procurement-service.ts",
  "server/services/supply-chain-service.ts",
  "server/types/index.ts",
  "server/utils/db.ts",
  "server/utils/logger.ts",
  "server.ts",
  "services/AlpacaAccountsService.ts",
  "services/alpacaBrokerService.ts",
  "services/AlpacaBrokerService.ts",
  "services/alpacaCollateralService.ts",
  "services/AlpacaFundingService.ts",
  "services/AlpacaJournalsService.ts",
  "services/AlpacaMarketDataService.ts",
  "services/AlpacaOptionsTradingService.ts",
  "services/AlpacaRebalancingService.ts",
  "services/AlpacaReportingService.ts",
  "services/AlpacaTokenizationService.ts",
  "services/AlpacaTradingService.ts",
  "services/assetAcquisitionService.ts",
  "services/astraService.ts",
  "services/AstraVectorSearchService.ts",
  "services/AuthService.ts",
  "services/azureGovComplianceService.ts",
  "services/CitiAlpacaBridgeService.ts",
  "services/citiCryptoService.ts",
  "services/compressionProvider.ts",
  "services/consolidatedApiManager.ts",
  "services/defenderATPService.ts",
  "services/entraSecurityService.ts",
  "services/entraService.ts",
  "services/geminiService.ts",
  "services/governmentApiService.ts",
  "services/GovernmentApiService.ts",
  "services/LastBossService.ts",
  "services/marketDataService.ts",
  "services/ModernTreasuryService.ts",
  "services/ofxService.ts",
  "services/PlaidBridgeService.ts",
  "services/PulsarService.ts",
  "services/QuantumClient.ts",
  "services/RealEstateService.ts",
  "services/RemitraxService.ts",
  "services/SecurityService.ts",
  "services/serverHelpers.ts",
  "services/SovereignIntelligence.ts",
  "services/StripeBridgeService.ts",
  "services/StripeService.ts",
  "services/TaxLienService.ts",
  "services/underwritingEngine.ts",
  "services/WalletService.ts",
  "services/WorkspaceService.ts",
  "services/ZKPEngine.ts",
  "snarkjs.d.ts",
  "src/constants.ts",
  "src/controllers/AccountController.ts",
  "src/controllers/DealController.ts",
  "src/data/Fortune500Seed.ts",
  "src/services/AstraDBService.ts",
  "src/services/IlluminatiConsortium.ts",
  "src/services/IlluminatiEngine.ts",
  "src/services/LastBossService.ts",
  "src/services/SecurityService.ts",
  "src/services/SovereignBridgeService.ts",
  "src/types.ts",
  ...Array.from({ length: 100 }, (_, i) => `story/page-${String(i + 1).padStart(3, '0')}.md`),
  "tables/accounts.ts",
  "tables/business_deals.ts",
  "tables/index.ts",
  "tables/sovereign_audit.ts",
  "tables/transactions.ts",
  "trillionaire-status/CapitalAllocationModels.ts",
  "trillionaire-status/CompetitorIntelligence.ts",
  "trillionaire-status/ConsumerSentimentAnalysis.ts",
  "trillionaire-status/CorporateGovernanceReview.ts",
  "trillionaire-status/DigitalTransformationAudit.ts",
  "trillionaire-status/EmergingMarketExpansion.ts",
  "trillionaire-status/ESGImpactMetrics.ts",
  "trillionaire-status/ExecutiveCompensationAudit.ts",
  "trillionaire-status/FinancialDataIngestion.ts",
  "trillionaire-status/Fortune500ResearchPlan.ts",
  "trillionaire-status/GlobalTaxStrategy.ts",
  "trillionaire-status/InfrastructureDependencies.ts",
  "trillionaire-status/InnovationPipelineResearch.ts",
  "trillionaire-status/LobbyingInfluenceMapping.ts",
  "trillionaire-status/MarketCapAnalysis.ts",
  "trillionaire-status/MergersAndAcquisitions.ts",
  "trillionaire-status/PatentPortfolioAudit.ts",
  "trillionaire-status/RegulatoryComplianceAudit.ts",
  "trillionaire-status/RiskAssessmentFramework.ts",
  "trillionaire-status/ShareholderValueMetrics.ts",
  "trillionaire-status/SupplyChainMapping.ts",
  "trillionaire-status/SustainabilityReporting.ts",
  "trillionaire-status/TalentAcquisitionPipeline.ts",
  "trillionaire-status/TechStackIntegration.ts",
  "trillionaire-status/TrillionaireStatusSummary.ts",
  "TRUST.md",
  "tsconfig.json",
  "types/citi.ts",
  "types/government.ts",
  "types/ofx.ts",
  "types/real-estate.ts",
  "types/security.ts",
  "types/sovereign.ts",
  "types/tax-liens.ts",
  "types.ts",
  "utils/firebaseUtils.ts",
  "utils/gis-helper.ts",
  "utils/tax-calculator.ts",
  "utils/web3Utils.ts",
  "vercel.json",
  "vite.config.ts"
];

const buildTree = (paths: string[]): TreeNode => {
  const root: TreeNode = { name: "Oko-main", type: "directory", children: [] };

  paths.forEach(path => {
    const parts = path.split('/');
    let current = root;

    parts.forEach((part, index) => {
      const isLast = index === parts.length - 1;
      if (!current.children) current.children = [];

      let existing = current.children.find(child => child.name === part);

      if (!existing) {
        existing = {
          name: part,
          type: isLast ? 'file' : 'directory',
          children: isLast ? undefined : []
        };
        current.children.push(existing);
      }

      current = existing;
    });
  });

  const sortTree = (node: TreeNode) => {
    if (node.children) {
      node.children.sort((a, b) => {
        if (a.type !== b.type) {
          return a.type === 'directory' ? -1 : 1;
        }
        return a.name.localeCompare(b.name);
      });
      node.children.forEach(sortTree);
    }
  };
  sortTree(root);

  return root;
};

interface FileTreeNodeProps {
  node: TreeNode;
  path: string;
  expandedNodes: Record<string, boolean>;
  onToggle: (path: string) => void;
  onFileClick: (path: string) => void;
  depth: number;
}

const FileTreeNode: React.FC<FileTreeNodeProps> = ({
  node,
  path,
  expandedNodes,
  onToggle,
  onFileClick,
  depth
}) => {
  const isExpanded = expandedNodes[path];
  const hasChildren = node.children && node.children.length > 0;

  const handleToggle = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggle(path);
  };

  const handleNodeClick = () => {
    if (node.type === 'directory') {
      onToggle(path);
    } else {
      onFileClick(path);
    }
  };

  const getIcon = () => {
    if (node.type === 'directory') {
      return isExpanded ? (
        <ChevronDown className="w-4 h-4 text-pink-400 shrink-0" />
      ) : (
        <ChevronRight className="w-4 h-4 text-gray-500 shrink-0" />
      );
    }

    const ext = node.name.split('.').pop();
    switch (ext) {
      case 'tsx':
      case 'ts':
      case 'js':
      case 'cjs':
        return <Terminal className="w-3.5 h-3.5 text-cyan-400 shrink-0" />;
      case 'md':
        return <FileText className="w-3.5 h-3.5 text-emerald-400 shrink-0" />;
      case 'json':
        return <Database className="w-3.5 h-3.5 text-amber-400 shrink-0" />;
      case 'webp':
      case 'png':
      case 'jpg':
        return <ImageIcon className="w-3.5 h-3.5 text-pink-400 shrink-0" />;
      default:
        return <File className="w-3.5 h-3.5 text-gray-400 shrink-0" />;
    }
  };

  return (
    <div className="select-none">
      <div
        onClick={handleNodeClick}
        style={{ paddingLeft: `${depth * 12 + 8}px` }}
        className={`flex items-center gap-2 py-1.5 pr-2 rounded-lg cursor-pointer transition-all text-xs font-mono group ${
          node.type === 'directory' 
            ? 'hover:bg-white/5 text-gray-300' 
            : 'hover:bg-pink-500/10 text-gray-400 hover:text-white'
        }`}
      >
        {node.type === 'directory' && (
          <button onClick={handleToggle} className="p-0.5 hover:bg-white/10 rounded flex items-center justify-center">
            {getIcon()}
          </button>
        )}
        {node.type === 'file' && (
          <span className="p-0.5 flex items-center justify-center">{getIcon()}</span>
        )}
        
        {node.type === 'directory' ? (
          <Folder className="w-3.5 h-3.5 text-pink-500/70 shrink-0" />
        ) : null}

        <span className="truncate flex-1">{node.name}</span>

        {node.type === 'file' && (
          <span className="opacity-0 group-hover:opacity-100 text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-sans uppercase tracking-wider transition-opacity shrink-0">
            Stage
          </span>
        )}
      </div>

      {node.type === 'directory' && isExpanded && node.children && (
        <div className="mt-0.5">
          {node.children.map(child => (
            <FileTreeNode
              key={child.name}
              node={child}
              path={`${path}/${child.name}`}
              expandedNodes={expandedNodes}
              onToggle={onToggle}
              onFileClick={onFileClick}
              depth={depth + 1}
            />
          ))}
        </div>
      )}
    </div>
  );
};

const AquariusCreativeSuite: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [aspectRatio, setAspectRatio] = useState('16:9');
  const [imageSize, setImageSize] = useState('1K');
  const [isGenerating, setIsGenerating] = useState(false);
  const [output, setOutput] = useState<string | null>(null);
  const [logs, setLogs] = useState<string[]>([]);
  const [selectedFile, setSelectedFile] = useState<string | null>(null);
  const [hasKey, setHasKey] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedNodes, setExpandedNodes] = useState<Record<string, boolean>>({
    "Oko-main": true,
    "Oko-main/components": true,
  });

  const treeRoot = React.useMemo(() => buildTree(OKO_PATHS), []);

  useEffect(() => {
    const checkKey = async () => {
      const selected = await (window as any).aistudio.hasSelectedApiKey();
      setHasKey(selected);
    };
    checkKey();
  }, []);

  const addLog = (m: string) => setLogs(p => [`[${new Date().toLocaleTimeString()}] ${m}`, ...p].slice(0, 5));

  const promptForKey = async () => {
    await (window as any).aistudio.openSelectKey();
    setHasKey(true);
  };

  const onFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => setSelectedFile(ev.target?.result as string);
      reader.readAsDataURL(file);
      addLog(`Asset staged: ${file.name}`);
    }
  };

  const toggleNode = (path: string) => {
    setExpandedNodes(prev => ({ ...prev, [path]: !prev[path] }));
  };

  const handleFileClick = (filePath: string) => {
    addLog(`Selected workspace file: ${filePath}`);
    if (filePath.endsWith('.webp') || filePath.endsWith('.png') || filePath.endsWith('.jpg')) {
      setSelectedFile('/IMG_5610.webp');
      addLog(`Staged image asset: ${filePath}`);
    } else {
      setPrompt(prev => {
        const contextStr = `[Context: Workspace File ${filePath}] `;
        if (prev.includes(contextStr)) return prev;
        return `${contextStr}${prev}`;
      });
      addLog(`Injected file context into prompt: ${filePath}`);
    }
  };

  // --- GEMINI 3 PRO IMAGE GENERATION ---
  const generateImage = async () => {
    if (!prompt) return;
    if ((imageSize === '2K' || imageSize === '4K') && !hasKey) {
        await promptForKey();
    }

    setIsGenerating(true);
    addLog(`Initiating ${imageSize} forge...`);
    try {
      const modelName = (imageSize === '2K' || imageSize === '4K') ? 'gemini-3-pro-image-preview' : 'gemini-2.5-flash-image';
      
      const response = await callGemini(modelName, [
        {
          parts: [{ text: prompt }]
        }
      ], {
        imageConfig: { aspectRatio: aspectRatio as any, imageSize: imageSize as any }
      });

      if (response.data.candidates?.[0]?.content?.parts) {
        for (const part of response.data.candidates[0].content.parts) {
          if (part.inlineData) {
            setOutput(`data:image/png;base64,${part.inlineData.data}`);
            addLog("Forge successful. Signal clear.");
            break;
          }
        }
      }
    } catch (e: any) { 
        if (e.message?.includes("Requested entity was not found")) {
            setHasKey(false);
            await promptForKey();
        } else {
            addLog("Forge protocol failed."); 
        }
    } finally { setIsGenerating(false); }
  };

  // --- VEO 3.1 VIDEO GENERATION ---
  const generateVideo = async () => {
    if (!prompt) return;
    if (!hasKey) {
        await promptForKey();
    }

    setIsGenerating(true);
    addLog("Initializing Veo 3.1 cinematography core...");
    try {
      const res = await fetch(`/api/v1beta/models/veo-3.1-fast-generate-preview:generateVideos`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: prompt,
          image: selectedFile ? { 
            imageBytes: selectedFile.split(',')[1], 
            mimeType: 'image/png' 
          } : undefined,
          config: {
            numberOfVideos: 1,
            resolution: '720p',
            aspectRatio: aspectRatio === '16:9' ? '16:9' : '9:16'
          }
        })
      });

      if (!res.ok) throw new Error(await res.text());
      let op = await res.json();

      while (!op.done) {
        await new Promise(r => setTimeout(r, 10000));
        const pollRes = await fetch(`/api/v1beta/${op.name}`);
        op = await pollRes.json();
        addLog("Refining frame buffers...");
      }
      
      setOutput(op.response?.generatedVideos?.[0]?.video?.uri);
      addLog("Synthesis finalized.");
    } catch (e: any) { 
        addLog("Synthesis stream collapsed: " + e.message); 
    } finally { setIsGenerating(false); }
  };

  const filteredFiles = searchQuery 
    ? OKO_PATHS.filter(p => p.toLowerCase().includes(searchQuery.toLowerCase()))
    : [];

  return (
    <div className="space-y-10 animate-in fade-in duration-700 pb-20">
      {!hasKey && (
        <div className="bg-amber-500/10 border border-amber-500/30 p-6 rounded-[2rem] flex items-center justify-between shadow-2xl">
           <div className="flex items-center gap-6">
              <AlertTriangle className="text-amber-400 w-10 h-10" />
              <div>
                 <h3 className="text-xl font-black text-amber-400 uppercase tracking-widest">Professional API Access</h3>
                 <p className="text-sm text-gray-400 font-light">Billionaire-tier rendering (4K/Veo) requires a dedicated API key. <a href="https://ai.google.dev/gemini-api/docs/billing" target="_blank" className="text-cyan-400 underline">Billing Docs</a></p>
              </div>
           </div>
           <button onClick={promptForKey} className="px-8 py-3 bg-amber-500 text-black font-black tracking-widest rounded-2xl hover:bg-amber-400">SELECT KEY</button>
        </div>
      )}

      <header className="border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-2">
          <Sparkles className="text-pink-400 w-5 h-5" />
          <h2 className="text-xs font-mono text-pink-400 uppercase tracking-[0.4em]">Legion III: Multi-Modal Visualization</h2>
        </div>
        <h1 className="text-7xl font-black text-white tracking-tighter">Synthetic <span className="text-transparent bg-clip-text bg-gradient-to-r from-pink-400 to-purple-600">Media</span></h1>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Workspace Explorer */}
        <div className="col-span-12 xl:col-span-3 lg:col-span-4 space-y-8">
          <Card title="Oko-main Workspace" icon={<Folder className="text-pink-400" />}>
            <div className="space-y-4 pt-4">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 w-4 h-4 text-gray-500" />
                <input
                  type="text"
                  placeholder="Search workspace files..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-pink-500 transition-all font-mono"
                />
              </div>

              {searchQuery ? (
                <div className="space-y-1 max-h-[400px] overflow-y-auto custom-scrollbar">
                  {filteredFiles.map(filePath => (
                    <div
                      key={filePath}
                      onClick={() => handleFileClick(filePath)}
                      className="flex items-center gap-2 py-1.5 px-3 rounded-lg cursor-pointer hover:bg-pink-500/10 text-xs font-mono text-gray-400 hover:text-white transition-all"
                    >
                      <File className="w-3.5 h-3.5 text-pink-400 shrink-0" />
                      <span className="truncate flex-1">{filePath}</span>
                      <span className="text-[9px] bg-pink-500/20 text-pink-300 px-1.5 py-0.5 rounded font-sans uppercase tracking-wider shrink-0">
                        Stage
                      </span>
                    </div>
                  ))}
                  {filteredFiles.length === 0 && (
                    <p className="text-xs text-gray-500 italic text-center py-4">No matching files found.</p>
                  )}
                </div>
              ) : (
                <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                  <FileTreeNode
                    node={treeRoot}
                    path="Oko-main"
                    expandedNodes={expandedNodes}
                    onToggle={toggleNode}
                    onFileClick={handleFileClick}
                    depth={0}
                  />
                </div>
              )}

              <div className="border-t border-white/5 pt-4">
                <div className="bg-white/5 rounded-2xl p-3 text-[10px] font-mono text-gray-400 space-y-1">
                  <p className="text-pink-400 font-bold uppercase tracking-wider text-[9px]">Workspace Stats</p>
                  <p>Total Files: {OKO_PATHS.length}</p>
                  <p>Root: /content/Oko-main</p>
                </div>
              </div>
            </div>
          </Card>
        </div>

        {/* Middle Column: Forge Directives */}
        <div className="col-span-12 xl:col-span-4 lg:col-span-4 space-y-8">
          <Card title="Forge Directives" icon={<Wand2 className="text-pink-400" />}>
             <div className="space-y-6 pt-4">
                <div className="relative group">
                   <div className={`absolute inset-0 bg-pink-500/20 rounded-3xl blur transition-opacity ${selectedFile ? 'opacity-100' : 'opacity-0'}`} />
                   <div className="relative h-40 border-2 border-dashed border-white/5 rounded-3xl bg-gray-900 flex flex-col items-center justify-center gap-3 hover:border-pink-500/30 transition-all cursor-pointer overflow-hidden">
                      {selectedFile ? (
                        <img src={selectedFile} className="w-full h-full object-cover" />
                      ) : (
                        <>
                          <Camera className="text-gray-700" />
                          <span className="text-[10px] font-black uppercase text-gray-500">Stage Base Asset</span>
                        </>
                      )}
                      <input type="file" onChange={onFileSelect} className="absolute inset-0 opacity-0 cursor-pointer" />
                   </div>
                </div>

                <textarea 
                  value={prompt}
                  onChange={e => setPrompt(e.target.value)}
                  placeholder="Input descriptive syntax..."
                  className="w-full h-32 bg-black border border-white/10 rounded-2xl p-4 text-sm text-white outline-none focus:border-pink-500 transition-all font-mono"
                />

                <div className="grid grid-cols-2 gap-4">
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Ratio</label>
                      <select value={aspectRatio} onChange={e => setAspectRatio(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-2 text-xs text-white">
                        {['1:1', '3:4', '4:3', '9:16', '16:9'].map(r => <option key={r}>{r}</option>)}
                      </select>
                   </div>
                   <div className="space-y-1">
                      <label className="text-[9px] font-black text-gray-600 uppercase tracking-widest">Res</label>
                      <select value={imageSize} onChange={e => setImageSize(e.target.value)} className="w-full bg-gray-900 border border-white/10 rounded-xl p-2 text-xs text-white">
                        {['1K', '2K', '4K'].map(s => <option key={s}>{s}</option>)}
                      </select>
                   </div>
                </div>

                <div className="space-y-2">
                   <div className="flex gap-2">
                      <button onClick={generateImage} disabled={isGenerating || !prompt} className="flex-1 py-4 bg-pink-600 hover:bg-pink-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <ImageIcon size={18} />} IMAGE
                      </button>
                      <button onClick={generateVideo} disabled={isGenerating || !prompt} className="flex-1 py-4 bg-purple-600 hover:bg-purple-500 text-white font-black rounded-xl transition-all flex items-center justify-center gap-2">
                        {isGenerating ? <Loader2 className="animate-spin" /> : <Video size={18} />} VIDEO
                      </button>
                   </div>
                </div>
             </div>
          </Card>

          <Card title="Neural Log" className="bg-black/20 border-white/5">
             <div className="space-y-2 font-mono text-[10px] text-gray-600 h-24 overflow-auto custom-scrollbar">
                {logs.map((l, i) => <p key={i}>{l}</p>)}
                {logs.length === 0 && <p className="opacity-30 italic">Awaiting creative command...</p>}
             </div>
          </Card>
        </div>

        {/* Right Column: Materialization Chamber */}
        <div className="col-span-12 xl:col-span-5 lg:col-span-4 flex flex-col gap-6">
           <Card className="flex-1 min-h-[600px] flex items-center justify-center bg-black/40 border border-white/5 rounded-[4rem] relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-pink-500/5 via-transparent to-transparent"></div>
              {isGenerating ? (
                <div className="text-center space-y-6 z-10">
                   <div className="relative w-24 h-24 mx-auto">
                      <div className="absolute inset-0 border-4 border-pink-500/20 rounded-full" />
                      <div className="absolute inset-0 border-4 border-pink-500 border-t-transparent rounded-full animate-spin" />
                   </div>
                   <p className="text-pink-400 font-mono text-xs tracking-[0.4em] animate-pulse uppercase">Compiling frame buffers...</p>
                </div>
              ) : output ? (
                <div className="relative group p-10 animate-in zoom-in-95 duration-500">
                   {output.includes('video') || output.includes('veo') ? (
                     <video src={output} controls autoPlay loop className="max-w-full max-h-[600px] rounded-3xl shadow-2xl border border-white/10" />
                   ) : (
                     <img src={output} className="max-w-full max-h-[600px] rounded-3xl shadow-2xl border border-white/10" />
                   )}
                </div>
              ) : (
                <div className="opacity-10 flex flex-col items-center gap-6">
                   <FileImage size={120} />
                   <p className="uppercase tracking-[1em] text-xs font-black">Materialization Chamber Ready</p>
                </div>
              )}
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AquariusCreativeSuite;
