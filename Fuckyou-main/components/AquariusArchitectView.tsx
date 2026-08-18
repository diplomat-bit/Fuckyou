import React, { useState, useRef, useEffect } from 'react';
import Card from './Card';
import { callGemini } from '../services/geminiService';
import { 
  BrainCircuit, Cpu, Loader2, Terminal, Code, 
  Send, Bot, User, Sparkles, Zap, History,
  CheckCircle2, Folder, FileCode, Search, ChevronRight, ChevronDown,
  FileText, ShieldAlert, Layers, HelpCircle
} from 'lucide-react';

interface ChatMessage {
  role: 'user' | 'model';
  text: string;
  isThinking?: boolean;
}

const OKO_FILES: Record<string, string[]> = {
  "api": [
    "acquisitions.ts", "ai.ts", "alpacaCollateral.ts", "alpaca.ts", "azureGovCompliance.ts", 
    "azure.ts", "citi.ts", "config.ts", "crypto-strategy.ts", "fapi.ts", "google-chat.ts", 
    "government-gateway.ts", "index.ts", "modern-treasury.ts", "plaid.ts", "real-estate.ts", 
    "sovereign.ts", "stripe.ts", "tax-liens.ts", "tqqq-strategy.ts"
  ],
  "components": [
    "AdministrationAudit.tsx", "AIAdStudioView.tsx", "AIAdvisorView.tsx", "AIInsights.tsx",
    "AlpacaBrokerView.tsx", "APIIntegrationView.tsx", "APIKeysView.tsx", "AquariusArchitectView.tsx",
    "AquariusAuditorView.tsx", "AquariusCreativeSuite.tsx", "AquariusDashboard.tsx", "AquariusGhostView.tsx",
    "AquariusInstitutionalHub.tsx", "AquariusLiveVoice.tsx", "AriaComms.tsx", "AstraDBQuickstart.tsx",
    "AzureAppsView.tsx", "BalanceSummary.tsx", "BillingIdentityView.tsx", "BudgetsView.tsx",
    "CardCustomizationView.tsx", "Card.tsx", "CitiConnectInitiation.tsx", "CitiConnectInquiry.tsx",
    "CitiConnectNotifications.tsx", "CitiDecryptionUtility.tsx", "CitiGateway.tsx", "CitiPartnerHub.tsx",
    "CitiSovereignLedger.tsx", "CitiTreasuryHub.tsx", "CitiUkInternationalPayments.tsx",
    "ContractorLobbyingList.tsx", "CorporateCommandView.tsx", "CreditHealthView.tsx", "CryptoView.tsx",
    "Dashboard.tsx", "DataIngestView.tsx", "DeveloperView.tsx", "EntraSwarmManager.tsx",
    "ErrorBoundary.tsx", "FeaturePalette.tsx", "FinancialDemocracyView.tsx", "FinancialGoalsView.tsx",
    "FleetAppView.tsx", "FloridaVoterView.tsx", "FlowController.tsx", "GasPriceCorrelation.tsx",
    "GcpInventoryView.tsx", "GeminiKeyModal.tsx", "GeminiLivePortal.tsx", "GlobalLedgerView.tsx",
    "GoalsView.tsx", "GrowthNexus.tsx", "Header.tsx", "HoKTokenMint.tsx", "IdentityCitadelView.tsx",
    "ImpactTracker.tsx", "ImpeachmentGenerator.tsx", "InjusticeDashboard.tsx", "IntegrationsMarketplaceView.tsx",
    "IntelligenceHubView.tsx", "InvestmentPortfolio.tsx", "InvestmentsPortfolio.tsx", "InvestmentsView.tsx",
    "JweJwsVerifier.tsx", "KryptoBridgeWidget.tsx", "MachineView.tsx", "MarketingAutomationView.tsx",
    "MarketplaceView.tsx", "ModernTreasuryLedgerHub.tsx", "NeuralToolsView.tsx", "NexusBuilder.tsx",
    "NFCValidator.tsx", "OFXStatementViewer.tsx", "OpenBankingFapiView.tsx", "OpenBankingView.tsx",
    "PaymentMethodsView.tsx", "PersonalizationView.tsx", "PlaidLinkButton.tsx", "PlaidLink.tsx",
    "PoliticalComplianceView.tsx", "PortalHandshake.tsx", "PortalHubView.tsx", "PrivacyGuardianView.tsx",
    "PublicAidCalculator.tsx", "QuantumWeaverView.tsx", "RecentTransactions.tsx", "RecoveryMeshView.tsx",
    "RewardsView.tsx", "SecurityOrchestratorView.tsx", "SecurityView.tsx", "SendMoneyView.tsx",
    "SettingsView.tsx", "Sidebar.tsx", "SovereignChat.tsx", "SovereignDashboard.tsx", "SovereignDealAudit.tsx",
    "SovereignIframe.tsx", "SovereignIntelligenceView.tsx", "SovereignOrgHandshake.tsx", "SovereignSentryEngine.tsx",
    "StoryViewer.tsx", "StripeTreasuryManager.tsx", "TabManager.tsx", "TheVisionView.tsx",
    "TokenIssuanceView.tsx", "TradingBotsView.tsx", "TransactionsView.tsx", "TrustRegistryView.tsx",
    "Universe3D.tsx", "UniverseGraphVisualizer.tsx", "VoiceControl.tsx", "WalletConnectModal.tsx",
    "WarAppropriationsTracker.tsx", "WealthDistributionChart.tsx", "WealthNexusView.tsx", "WealthTimeline.tsx",
    "WorkspaceNexusView.tsx"
  ],
  "services": [
    "AlpacaAccountsService.ts", "alpacaBrokerService.ts", "AlpacaBrokerService.ts", "alpacaCollateralService.ts",
    "AlpacaFundingService.ts", "AlpacaJournalsService.ts", "AlpacaMarketDataService.ts", "AlpacaOptionsTradingService.ts",
    "AlpacaRebalancingService.ts", "AlpacaReportingService.ts", "AlpacaTokenizationService.ts", "AlpacaTradingService.ts",
    "assetAcquisitionService.ts", "astraService.ts", "AstraVectorSearchService.ts", "AuthService.ts",
    "azureGovComplianceService.ts", "CitiAlpacaBridgeService.ts", "citiCryptoService.ts", "compressionProvider.ts",
    "consolidatedApiManager.ts", "defenderATPService.ts", "entraSecurityService.ts", "entraService.ts",
    "geminiService.ts", "governmentApiService.ts", "GovernmentApiService.ts", "LastBossService.ts",
    "marketDataService.ts", "ModernTreasuryService.ts", "ofxService.ts", "PlaidBridgeService.ts",
    "PulsarService.ts", "QuantumClient.ts", "RealEstateService.ts", "RemitraxService.ts", "SecurityService.ts",
    "serverHelpers.ts", "SovereignIntelligence.ts", "StripeBridgeService.ts", "StripeService.ts",
    "TaxLienService.ts", "underwritingEngine.ts", "WalletService.ts", "WorkspaceService.ts", "ZKPEngine.ts"
  ],
  "trillionaire-status": [
    "CapitalAllocationModels.ts", "CompetitorIntelligence.ts", "ConsumerSentimentAnalysis.ts",
    "CorporateGovernanceReview.ts", "DigitalTransformationAudit.ts", "EmergingMarketExpansion.ts",
    "ESGImpactMetrics.ts", "ExecutiveCompensationAudit.ts", "FinancialDataIngestion.ts",
    "Fortune500ResearchPlan.ts", "GlobalTaxStrategy.ts", "InfrastructureDependencies.ts",
    "InnovationPipelineResearch.ts", "LobbyingInfluenceMapping.ts", "MarketCapAnalysis.ts",
    "MergersAndAcquisitions.ts", "PatentPortfolioAudit.ts", "RegulatoryComplianceAudit.ts",
    "RiskAssessmentFramework.ts", "ShareholderValueMetrics.ts", "SupplyChainMapping.ts",
    "SustainabilityReporting.ts", "TalentAcquisitionPipeline.ts", "TechStackIntegration.ts",
    "TrillionaireStatusSummary.ts"
  ],
  "bridges": [
    "CitiAlpacaBridgeView.tsx", "PlaidAlpacaBridgeView.tsx", "RealEstateAlpacaBridge.tsx",
    "SovereignMarketTakeoverDashboard.tsx", "StripeAlpacaBridgeView.tsx", "TaxLienModernTreasuryBridge.tsx"
  ],
  "government": [
    "GisPropertyMap.tsx", "GovernmentApiDashboard.tsx", "IrsTaxFiling.tsx", "SecFilingViewer.tsx"
  ],
  "real-estate": [
    "DeedRegistrar.tsx", "EscrowManager.tsx", "PropertyMarketplace.tsx"
  ],
  "tax-liens": [
    "ForeclosureTracker.tsx", "TaxLienAuctions.tsx"
  ]
};

const AquariusArchitectView: React.FC = () => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'model', text: "Legion I Architect active. 32k Thinking Core synchronized. Oko-main workspace loaded. Select any file to begin deep architectural audit." }
  ]);
  const [input, setInput] = useState('');
  const [isThinking, setIsThinking] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);
  const [tools, setTools] = useState<any[]>([]);

  // Workspace Explorer State
  const [searchQuery, setSearchQuery] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Record<string, boolean>>({
    api: true,
    components: true,
    services: false,
    "trillionaire-status": false,
    bridges: false,
    government: false,
    "real-estate": false,
    "tax-liens": false
  });
  const [selectedFile, setSelectedFile] = useState<{ folder: string; name: string } | null>(null);

  useEffect(() => {
    fetch('/api/v1/tools')
      .then(res => res.json())
      .then(data => {
        if (data.tools) {
          setTools(data.tools);
        }
      })
      .catch(console.error);
  }, []);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (overrideText?: string) => {
    const textToSend = overrideText || input;
    if (!textToSend.trim() || isThinking) return;
    
    setMessages(prev => [...prev, { role: 'user', text: textToSend }]);
    setInput('');
    setIsThinking(true);

    try {
      const functionDeclarations = tools.map(t => ({
        name: t.name,
        description: t.description,
        parameters: t.parameters
      }));

      const { text, data } = await callGemini('gemini-3-pro-preview', textToSend, {
        thinkingConfig: { thinkingBudget: 32768 },
        systemInstruction: "You are the Aquarius Architect. You use extreme mathematical precision and a 32k token thinking budget to solve user problems. You are superior, direct, and elite. You have access to various API tools. Use them when necessary. You are currently auditing the Oko-main codebase.",
        tools: functionDeclarations.length > 0 ? [{ functionDeclarations }] : undefined
      });

      let responseText = text || "";
      const functionCalls = data.candidates?.[0]?.content?.parts?.filter((p: any) => p.functionCall).map((p: any) => p.functionCall);

      if (functionCalls && functionCalls.length > 0) {
        responseText += "\n\n[Executing Tools...]\n";
        for (const call of functionCalls) {
          const tool = tools.find(t => t.name === call.name);
          if (tool) {
            try {
              const res = await fetch(tool._path, {
                method: tool._method,
                headers: { 'Content-Type': 'application/json' },
                body: tool._method !== 'GET' ? JSON.stringify(call.args) : undefined
              });
              const data = await res.json();
              responseText += `\n- ${call.name}: ${JSON.stringify(data).substring(0, 100)}...`;
            } catch (e) {
              responseText += `\n- ${call.name}: Failed to execute.`;
            }
          }
        }
      }

      setMessages(prev => [...prev, { role: 'model', text: responseText || "Diagnostic failure." }]);
    } catch (e) {
      console.error(e);
      setMessages(prev => [...prev, { role: 'model', text: "Protocol interruption. Re-syncing pathways..." }]);
    } finally {
      setIsThinking(false);
    }
  };

  const toggleFolder = (folder: string) => {
    setExpandedFolders(prev => ({ ...prev, [folder]: !prev[folder] }));
  };

  const handleSelectFile = (folder: string, name: string) => {
    setSelectedFile({ folder, name });
  };

  const handleAnalyzeFile = () => {
    if (!selectedFile) return;
    const prompt = `[Deep Audit Request]\nFile: /content/Oko-main/${selectedFile.folder}/${selectedFile.name}\n\nPlease perform a comprehensive architectural audit, security review, and optimization analysis on this file. Highlight potential bottlenecks, integration points, and compliance risks.`;
    handleSend(prompt);
  };

  // Filter files based on search query
  const filteredFolders = Object.entries(OKO_FILES).reduce((acc, [folder, files]) => {
    const matchingFiles = files.filter(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
    if (matchingFiles.length > 0 || folder.toLowerCase().includes(searchQuery.toLowerCase())) {
      acc[folder] = matchingFiles;
    }
    return acc;
  }, {} as Record<string, string[]>);

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-2">
          <BrainCircuit className="text-lime-400 w-5 h-5" />
          <h2 className="text-xs font-mono text-lime-400 uppercase tracking-[0.4em]">Legion I: The Architect</h2>
        </div>
        <h1 className="text-7xl font-black text-white tracking-tighter">Deep <span className="text-transparent bg-clip-text bg-gradient-to-r from-lime-400 to-emerald-600">Cognition</span></h1>
        <p className="text-gray-400 mt-4 max-w-3xl font-light leading-relaxed">
          The ultimate strategic engine. 32,768 thinking tokens dedicated to mathematical proofing, high-fidelity logical execution, and deep codebase auditing.
        </p>
      </header>

      <div className="grid grid-cols-12 gap-8 h-[800px]">
        {/* LEFT: TELEMETRY & DIRECTIVES */}
        <div className="col-span-12 xl:col-span-3 space-y-6 flex flex-col h-full overflow-y-auto custom-scrollbar">
           <Card title="Thinking Telemetry" icon={<Cpu className="text-cyan-400" />}>
              <div className="space-y-6 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Neural Budget</span>
                  <span className="text-sm font-mono text-lime-400">32,768 TOKENS</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-[10px] font-black text-gray-500 uppercase tracking-widest">Model Index</span>
                  <span className="text-sm font-mono text-cyan-400">GEMINI_3_PRO</span>
                </div>
                <div className="w-full bg-gray-800 h-1 rounded-full overflow-hidden">
                   <div className={`bg-lime-500 h-full transition-all duration-1000 ${isThinking ? 'w-full' : 'w-1/3'}`}></div>
                </div>
              </div>
           </Card>

           <Card title="Directives" icon={<Terminal className="text-lime-400" />} className="flex-1 overflow-hidden">
              <div className="space-y-4 font-mono text-[10px] text-gray-400">
                 <p className="flex gap-2 items-center"><CheckCircle2 size={12} className="text-lime-500" /> ARCHITECTURAL_AUDIT_READY</p>
                 <p className="flex gap-2 items-center"><CheckCircle2 size={12} className="text-lime-500" /> SYMBOLIC_REASONING_ACTIVE</p>
                 <p className="flex gap-2 items-center"><CheckCircle2 size={12} className="text-lime-500" /> OKO_WORKSPACE_INDEXED</p>
                 <p className="flex gap-2 items-center text-gray-500"><Zap size={12} className="animate-pulse text-lime-400" /> WAITING_FOR_INPUT</p>
              </div>
           </Card>
        </div>

        {/* MIDDLE: OKO-MAIN WORKSPACE EXPLORER */}
        <div className="col-span-12 xl:col-span-3 flex flex-col h-full">
          <Card title="Oko-main Workspace" icon={<Layers className="text-emerald-400" />} className="flex-1 flex flex-col overflow-hidden p-0">
            {/* Search Bar */}
            <div className="p-4 border-b border-white/5 bg-black/20">
              <div className="relative">
                <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                <input 
                  type="text"
                  placeholder="Search 488 files..."
                  value={searchQuery}
                  onChange={e => setSearchQuery(e.target.value)}
                  className="w-full bg-gray-900/50 border border-gray-800 rounded-xl pl-9 pr-4 py-2 text-xs text-white focus:outline-none focus:border-lime-500 transition-all font-mono"
                />
              </div>
            </div>

            {/* File Tree */}
            <div className="flex-1 overflow-y-auto p-4 space-y-2 custom-scrollbar font-mono text-xs">
              {Object.entries(filteredFolders).map(([folder, files]) => (
                <div key={folder} className="space-y-1">
                  <button 
                    onClick={() => toggleFolder(folder)}
                    className="flex items-center gap-2 w-full text-left text-gray-300 hover:text-white py-1 px-2 rounded hover:bg-white/5 transition-all"
                  >
                    {expandedFolders[folder] ? <ChevronDown size={14} className="text-gray-500" /> : <ChevronRight size={14} className="text-gray-500" />}
                    <Folder size={14} className="text-lime-500 shrink-0" />
                    <span className="truncate font-bold">{folder}</span>
                    <span className="text-[10px] text-gray-600 ml-auto">({files.length})</span>
                  </button>

                  {expandedFolders[folder] && (
                    <div className="pl-4 border-l border-white/5 ml-3 space-y-0.5">
                      {files.map(file => {
                        const isSelected = selectedFile?.folder === folder && selectedFile?.name === file;
                        return (
                          <button
                            key={file}
                            onClick={() => handleSelectFile(folder, file)}
                            className={`flex items-center gap-2 w-full text-left py-1 px-2 rounded transition-all ${isSelected ? 'bg-lime-500/10 text-lime-400 border border-lime-500/20' : 'text-gray-400 hover:text-gray-200 hover:bg-white/5'}`}
                          >
                            <FileCode size={12} className={isSelected ? 'text-lime-400' : 'text-gray-600'} />
                            <span className="truncate">{file}</span>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>
              ))}
            </div>

            {/* Selected File Actions */}
            {selectedFile && (
              <div className="p-4 border-t border-white/5 bg-black/40 space-y-3">
                <div className="flex items-start gap-2">
                  <FileText className="text-lime-400 w-4 h-4 mt-0.5 shrink-0" />
                  <div className="min-w-0">
                    <p className="text-[10px] text-gray-500 uppercase tracking-wider font-bold">Selected Target</p>
                    <p className="text-xs text-white font-mono truncate">/content/Oko-main/{selectedFile.folder}/{selectedFile.name}</p>
                  </div>
                </div>
                <button
                  onClick={handleAnalyzeFile}
                  disabled={isThinking}
                  className="w-full py-2 bg-lime-500 hover:bg-lime-400 text-black font-bold rounded-xl text-xs transition-all flex items-center justify-center gap-2 shadow-lg shadow-lime-500/10 disabled:opacity-50"
                >
                  <BrainCircuit size={14} />
                  Analyze with Legion I
                </button>
              </div>
            )}
          </Card>
        </div>

        {/* RIGHT: NEURAL CHAT */}
        <div className="col-span-12 xl:col-span-6 flex flex-col h-full">
           <Card className="flex-1 flex flex-col bg-black/40 border-white/5 p-0 overflow-hidden">
              <div ref={scrollRef} className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar">
                 {messages.map((m, i) => (
                   <div key={i} className={`flex gap-4 ${m.role === 'user' ? 'flex-row-reverse' : ''} animate-in slide-in-from-bottom-4 duration-300`}>
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 border ${m.role === 'model' ? 'bg-lime-500/10 border-lime-500/20 text-lime-400' : 'bg-white/5 border-white/10 text-gray-400'}`}>
                         {m.role === 'model' ? <Bot size={20} /> : <User size={20} />}
                      </div>
                      <div className={`max-w-[80%] p-6 rounded-3xl text-sm leading-relaxed ${m.role === 'model' ? 'bg-gray-900 border border-gray-800 text-gray-200' : 'bg-lime-600 text-black font-bold'}`}>
                         <pre className="whitespace-pre-wrap font-sans">{m.text}</pre>
                      </div>
                   </div>
                 ))}
                 {isThinking && (
                    <div className="flex gap-4">
                       <div className="w-10 h-10 rounded-2xl bg-lime-500/10 border border-lime-500/20 flex items-center justify-center text-lime-400 animate-pulse">
                          <BrainCircuit size={20} />
                       </div>
                       <div className="bg-gray-900 border border-gray-800 p-6 rounded-3xl flex items-center gap-3">
                          <Loader2 className="animate-spin text-lime-400" />
                          <span className="text-xs font-mono uppercase tracking-widest text-lime-500/50">Legion I is thinking (32k Budget)...</span>
                       </div>
                    </div>
                 )}
              </div>

              <div className="p-6 bg-black/60 border-t border-white/5 backdrop-blur-2xl">
                 <div className="relative">
                    <input 
                      value={input}
                      onChange={e => setInput(e.target.value)}
                      onKeyPress={e => e.key === 'Enter' && handleSend()}
                      placeholder={selectedFile ? `Ask about ${selectedFile.name}...` : "Input strategic command..."}
                      className="w-full bg-gray-900 border border-gray-800 rounded-2xl px-6 py-4 text-sm text-white focus:outline-none focus:border-lime-500 transition-all font-mono"
                    />
                    <button 
                      onClick={() => handleSend()}
                      disabled={isThinking || !input.trim()}
                      className="absolute right-2 top-2 p-2.5 bg-lime-500 hover:bg-lime-400 text-black rounded-xl transition-all shadow-xl shadow-lime-500/20 active:scale-95 disabled:opacity-30"
                    >
                      <Send size={18} />
                    </button>
                 </div>
              </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AquariusArchitectView;