import React, { useState, useRef, useEffect, useContext } from 'react';
import { DataContext } from '../context/DataContext';
import { brain } from '../services/SovereignIntelligence';
import Card from './Card';
import { 
  FaRobot, FaUser, FaPaperPlane, FaMagic, FaShieldAlt, FaChartLine,
  FaFolderOpen, FaFileCode, FaBook, FaSearch, FaTimes, FaCheck, 
  FaBrain, FaDatabase, FaNetworkWired, FaChevronDown, FaChevronRight 
} from 'react-icons/fa';

interface Message {
  role: 'user' | 'model';
  text: string;
  confidence?: number;
}

const FILE_REGISTRY: Record<string, string[]> = {
  "Trillionaire Status": [
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
  "Alpaca Brokerage": [
    "AlpacaAccountsManager.tsx", "AlpacaCryptoWalletsView.tsx", "AlpacaFundingHub.tsx",
    "AlpacaIpoMarketplaceView.tsx", "AlpacaJournalsView.tsx", "AlpacaRebalancingView.tsx",
    "AlpacaReportingView.tsx", "AlpacaTokenizationView.tsx", "AlpacaTradingTerminal.tsx",
    "BtcSwingTradingNotebook.tsx", "TqqqAlgorithmTerminal.tsx"
  ],
  "Bridges & Gateways": [
    "CitiAlpacaBridgeView.tsx", "PlaidAlpacaBridgeView.tsx", "RealEstateAlpacaBridge.tsx",
    "SovereignMarketTakeoverDashboard.tsx", "StripeAlpacaBridgeView.tsx", "TaxLienModernTreasuryBridge.tsx"
  ],
  "Citi Treasury": [
    "CitiConnectInitiation.tsx", "CitiConnectInquiry.tsx", "CitiConnectNotifications.tsx",
    "CitiDecryptionUtility.tsx", "CitiGateway.tsx", "CitiPartnerHub.tsx",
    "CitiSovereignLedger.tsx", "CitiTreasuryHub.tsx", "CitiUkInternationalPayments.tsx"
  ],
  "Government & Compliance": [
    "GisPropertyMap.tsx", "GovernmentApiDashboard.tsx", "IrsTaxFiling.tsx",
    "SecFilingViewer.tsx", "ContractorLobbyingList.tsx", "FloridaVoterView.tsx",
    "PoliticalComplianceView.tsx", "WarAppropriationsTracker.tsx"
  ],
  "Real Estate & Tax Liens": [
    "DeedRegistrar.tsx", "EscrowManager.tsx", "PropertyMarketplace.tsx",
    "ForeclosureTracker.tsx", "TaxLienAuctions.tsx"
  ],
  "Aquarius Suite": [
    "AquariusArchitectView.tsx", "AquariusAuditorView.tsx", "AquariusCreativeSuite.tsx",
    "AquariusDashboard.tsx", "AquariusGhostView.tsx", "AquariusInstitutionalHub.tsx",
    "AquariusLiveVoice.tsx"
  ],
  "Sovereign Chronicles": Array.from({ length: 100 }, (_, i) => `story/page-${String(i + 1).padStart(3, '0')}.md`)
};

const getFileDescription = (fileName: string): string => {
  if (fileName.startsWith('story/')) {
    const pageNum = fileName.match(/\d+/)?.[0] || '001';
    return `Sovereign Chronicles - Page ${pageNum}: Historical record and strategic logs of the global financial takeover and Quantum AI evolution.`;
  }
  if (fileName.includes('CapitalAllocation')) return "Multi-trillion dollar asset allocation models optimizing risk-adjusted yields across global markets.";
  if (fileName.includes('CompetitorIntelligence')) return "Deep intelligence gathering on Fortune 500 competitors, market caps, and executive movements.";
  if (fileName.includes('ConsumerSentiment')) return "Neural sentiment analysis of global consumer trends, spending patterns, and brand loyalty.";
  if (fileName.includes('CorporateGovernance')) return "Automated proxy voting and board-level governance auditing for portfolio companies.";
  if (fileName.includes('DigitalTransformation')) return "Auditing legacy enterprise tech stacks and planning migration to Quantum-native architectures.";
  if (fileName.includes('EmergingMarket')) return "Geopolitical risk assessment and expansion strategies for high-growth sovereign jurisdictions.";
  if (fileName.includes('ESGImpact')) return "Tracking environmental, social, and governance metrics to ensure compliance with global mandates.";
  if (fileName.includes('ExecutiveCompensation')) return "Auditing executive pay structures against performance metrics to maximize shareholder value.";
  if (fileName.includes('FinancialDataIngestion')) return "High-throughput pipeline for ingesting SEC filings, market feeds, and alternative data.";
  if (fileName.includes('Fortune500Research')) return "Strategic research plan targeting the acquisition and control of the top 500 global corporations.";
  if (fileName.includes('GlobalTaxStrategy')) return "Algorithmic tax optimization across multi-jurisdictional sovereign structures.";
  if (fileName.includes('InfrastructureDependencies')) return "Mapping critical physical and digital infrastructure dependencies for global operations.";
  if (fileName.includes('InnovationPipeline')) return "Tracking patent filings, R&D breakthroughs, and disruptive tech pipelines.";
  if (fileName.includes('LobbyingInfluence')) return "Mapping political contributions, lobbying expenditures, and regulatory influence networks.";
  if (fileName.includes('MarketCapAnalysis')) return "Real-time valuation and market cap tracking of target acquisition candidates.";
  if (fileName.includes('MergersAndAcquisitions')) return "Automated M&A pipeline, valuation modeling, and post-merger integration planning.";
  if (fileName.includes('PatentPortfolio')) return "Auditing intellectual property, patent strength, and defensive IP strategies.";
  if (fileName.includes('RegulatoryCompliance')) return "Continuous compliance monitoring against SEC, FINRA, and international regulatory frameworks.";
  if (fileName.includes('RiskAssessment')) return "Monte Carlo simulations and stress-testing models for global macroeconomic shocks.";
  if (fileName.includes('ShareholderValue')) return "Metrics and dashboards focused on maximizing long-term equity value and dividend yields.";
  if (fileName.includes('SupplyChainMapping')) return "Visualizing and stress-testing global supply chains for critical components and materials.";
  if (fileName.includes('SustainabilityReporting')) return "Automated generation of sustainability reports and carbon footprint tracking.";
  if (fileName.includes('TalentAcquisition')) return "AI-driven executive search and talent pipeline tracking for key portfolio roles.";
  if (fileName.includes('TechStackIntegration')) return "Unified integration blueprint for connecting disparate enterprise software systems.";
  if (fileName.includes('TrillionaireStatusSummary')) return "Executive summary of the path to achieving and maintaining sovereign trillionaire status.";
  
  if (fileName.includes('Alpaca')) return "Alpaca API integration for automated trading, portfolio rebalancing, and asset tokenization.";
  if (fileName.includes('Citi')) return "Citi Connect API integration for institutional treasury, international payments, and ledger sync.";
  if (fileName.includes('Plaid')) return "Plaid bridge for secure bank account verification and transaction data ingestion.";
  if (fileName.includes('Stripe')) return "Stripe Treasury integration for card issuance, payment processing, and merchant services.";
  if (fileName.includes('TaxLien')) return "Automated bidding, tracking, and foreclosure management for municipal tax liens.";
  if (fileName.includes('RealEstate') || fileName.includes('Deed') || fileName.includes('Escrow') || fileName.includes('Property')) return "Fractional real estate tokenization, escrow management, and deed registration on-chain.";
  if (fileName.includes('Aquarius')) return "Aquarius AI agent suite for creative, auditing, and institutional operations.";
  if (fileName.includes('Government') || fileName.includes('Irs') || fileName.includes('Sec') || fileName.includes('Gis')) return "Government gateway integration for tax filing, SEC disclosures, and GIS property mapping.";
  
  return "Sovereign system file containing core logic, UI components, or service integrations for the Oko platform.";
};

const AIAdvisorView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) return null;
    const { user, transactions, sessionId } = context;

    const [messages, setMessages] = useState<Message[]>([
        { role: 'model', text: `Greetings, Grand Architect ${user.name}. I am Quantum. My neural arrays are calibrated to your signature. How shall we proceed with the day's expansion?` }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    // File Registry States
    const [searchQuery, setSearchQuery] = useState('');
    const [expandedCategories, setExpandedCategories] = useState<Record<string, boolean>>({
      "Trillionaire Status": true,
      "Alpaca Brokerage": false,
      "Bridges & Gateways": false,
      "Citi Treasury": false,
      "Government & Compliance": false,
      "Real Estate & Tax Liens": false,
      "Aquarius Suite": false,
      "Sovereign Chronicles": false
    });
    const [activeContextFiles, setActiveContextFiles] = useState<string[]>([]);
    const [selectedFile, setSelectedFile] = useState<string | null>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim() || loading) return;
        const userMsg = input;
        
        // Prepend context if files are active
        let finalPrompt = userMsg;
        if (activeContextFiles.length > 0) {
          finalPrompt = `[Context Files: ${activeContextFiles.join(', ')}]\n\nUser Directive: ${userMsg}`;
        }

        setMessages(prev => [...prev, { role: 'user', text: userMsg }]);
        setInput('');
        setLoading(true);

        try {
            const response = await brain.consult(finalPrompt, { transactions, user }, sessionId);
            setMessages(prev => [...prev, { 
              role: 'model', 
              text: response.text || "Neural link interrupted.", 
              confidence: response.confidence 
            }]);
        } catch (e) {
            setMessages(prev => [...prev, { role: 'model', text: "Connection to Sovereign Core interrupted. James, please verify the neural link." }]);
        } finally {
            setLoading(false);
        }
    };

    const handleAnalyzeFile = async (fileName: string) => {
      const description = getFileDescription(fileName);
      const prompt = `Analyze the system file "${fileName}" (${description}). How does this module integrate with our Sovereign Wealth strategy and how can we optimize its performance?`;
      
      setMessages(prev => [...prev, { role: 'user', text: `[System File Analysis Request: ${fileName}]` }]);
      setLoading(true);

      try {
          const response = await brain.consult(prompt, { transactions, user }, sessionId);
          setMessages(prev => [...prev, { 
            role: 'model', 
            text: response.text || "Neural link interrupted.", 
            confidence: response.confidence 
          }]);
      } catch (e) {
          setMessages(prev => [...prev, { role: 'model', text: "Connection to Sovereign Core interrupted. James, please verify the neural link." }]);
      } finally {
          setLoading(false);
      }
    };

    const toggleCategory = (category: string) => {
      setExpandedCategories(prev => ({
        ...prev,
        [category]: !prev[category]
      }));
    };

    const toggleContextFile = (fileName: string) => {
      setActiveContextFiles(prev => 
        prev.includes(fileName) 
          ? prev.filter(f => f !== fileName) 
          : [...prev, fileName]
      );
    };

    return (
        <div className="h-[calc(100vh-140px)] flex flex-col gap-6 w-full max-w-7xl mx-auto animate-in fade-in zoom-in-95 duration-500">
            <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div>
                    <h2 className="text-4xl font-black text-white tracking-tighter flex items-center gap-3">
                        <FaMagic className="text-cyan-400 animate-pulse" /> Neural Wealth Sanctum
                    </h2>
                    <p className="text-gray-500 font-medium">Direct communion with the Sovereign Intelligence Core & Oko-Main File Registry</p>
                </div>
                <div className="flex items-center gap-3 px-4 py-2 bg-gray-950 border border-cyan-500/20 rounded-full">
                   <div className="w-2 h-2 rounded-full bg-cyan-400 animate-ping"></div>
                   <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-widest">Architect_Sync: Active</span>
                </div>
            </header>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 flex-1 min-h-0">
               {/* Left Sidebar: Sovereign File Registry */}
               <div className="lg:col-span-4 flex flex-col gap-4 min-h-0">
                  <Card title="Sovereign File Registry" className="bg-gray-900/40 flex-1 flex flex-col overflow-hidden border-gray-800">
                     <div className="relative mb-4">
                        <input 
                          type="text"
                          placeholder="Search system files..."
                          value={searchQuery}
                          onChange={e => setSearchQuery(e.target.value)}
                          className="w-full bg-gray-950 border border-gray-800 rounded-xl pl-10 pr-4 py-2 text-xs text-white focus:outline-none focus:border-cyan-500 transition-all"
                        />
                        <FaSearch className="absolute left-3 top-3 text-gray-600 text-xs" />
                        {searchQuery && (
                          <button onClick={() => setSearchQuery('')} className="absolute right-3 top-3 text-gray-500 hover:text-white">
                            <FaTimes className="text-xs" />
                          </button>
                        )}
                     </div>

                     <div className="flex-1 overflow-y-auto space-y-2 pr-1 custom-scrollbar">
                        {Object.entries(FILE_REGISTRY).map(([category, files]) => {
                          const filteredFiles = files.filter(f => f.toLowerCase().includes(searchQuery.toLowerCase()));
                          if (searchQuery && filteredFiles.length === 0) return null;

                          const isExpanded = expandedCategories[category] || searchQuery !== '';

                          return (
                            <div key={category} className="border border-gray-800/40 rounded-xl overflow-hidden bg-black/20">
                              <button 
                                onClick={() => toggleCategory(category)}
                                className="w-full flex items-center justify-between p-3 bg-gray-900/40 hover:bg-gray-900/80 transition-all text-left"
                              >
                                <span className="text-xs font-bold text-gray-300 tracking-wide flex items-center gap-2">
                                  <FaFolderOpen className="text-cyan-500/70" /> {category}
                                </span>
                                <span className="flex items-center gap-2">
                                  <span className="text-[10px] font-mono bg-gray-800 text-gray-400 px-1.5 py-0.5 rounded">
                                    {filteredFiles.length}
                                  </span>
                                  {isExpanded ? <FaChevronDown className="text-gray-500 text-xs" /> : <FaChevronRight className="text-gray-500 text-xs" />}
                                </span>
                              </button>

                              {isExpanded && (
                                <div className="p-2 space-y-1 border-t border-gray-900/50 max-h-60 overflow-y-auto custom-scrollbar">
                                  {filteredFiles.map(file => {
                                    const isSelected = selectedFile === file;
                                    const isContext = activeContextFiles.includes(file);
                                    return (
                                      <div 
                                        key={file}
                                        onClick={() => setSelectedFile(file)}
                                        className={`group flex items-center justify-between p-2 rounded-lg cursor-pointer transition-all ${isSelected ? 'bg-cyan-950/40 border border-cyan-500/30' : 'hover:bg-gray-900/50 border border-transparent'}`}
                                      >
                                        <div className="flex items-center gap-2 min-w-0">
                                          <FaFileCode className={`text-xs shrink-0 ${file.endsWith('.md') ? 'text-amber-500/70' : 'text-cyan-500/70'}`} />
                                          <span className="text-[11px] font-mono text-gray-300 truncate group-hover:text-white transition-colors">
                                            {file.split('/').pop()}
                                          </span>
                                        </div>
                                        <div className="flex items-center gap-1.5 shrink-0">
                                          <button 
                                            onClick={(e) => {
                                              e.stopPropagation();
                                              toggleContextFile(file);
                                            }}
                                            className={`p-1 rounded text-[9px] font-mono transition-all ${isContext ? 'bg-cyan-500 text-black font-bold' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
                                            title="Toggle as active context"
                                          >
                                            {isContext ? 'ACTIVE' : '+ CTX'}
                                          </button>
                                        </div>
                                      </div>
                                    );
                                  })}
                                </div>
                              )}
                            </div>
                          );
                        })}
                     </div>
                  </Card>

                  {/* Selected File Details Panel */}
                  {selectedFile && (
                    <Card className="bg-gray-950/60 border-cyan-500/20 animate-in slide-in-from-bottom-2">
                      <div className="flex justify-between items-start mb-2">
                        <h4 className="text-xs font-bold text-cyan-400 font-mono truncate max-w-[80%]">
                          {selectedFile}
                        </h4>
                        <button onClick={() => setSelectedFile(null)} className="text-gray-500 hover:text-white">
                          <FaTimes className="text-xs" />
                        </button>
                      </div>
                      <p className="text-xs text-gray-400 leading-relaxed mb-4">
                        {getFileDescription(selectedFile)}
                      </p>
                      <div className="flex gap-2">
                        <button 
                          onClick={() => handleAnalyzeFile(selectedFile)}
                          className="flex-1 py-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg text-xs font-bold transition-all flex items-center justify-center gap-1.5"
                        >
                          <FaBrain /> Analyze File
                        </button>
                        <button 
                          onClick={() => toggleContextFile(selectedFile)}
                          className={`px-3 py-2 rounded-lg text-xs font-bold transition-all ${activeContextFiles.includes(selectedFile) ? 'bg-amber-600 hover:bg-amber-500 text-white' : 'bg-gray-800 hover:bg-gray-700 text-gray-300'}`}
                        >
                          {activeContextFiles.includes(selectedFile) ? 'Remove Context' : 'Add Context'}
                        </button>
                      </div>
                    </Card>
                  )}
               </div>

               {/* Right Side: Chat Interface */}
               <Card className="lg:col-span-8 flex flex-col overflow-hidden bg-gray-950/40 border-gray-800 shadow-2xl backdrop-blur-xl">
                  {/* Active Context Bar */}
                  {activeContextFiles.length > 0 && (
                    <div className="px-6 py-3 bg-cyan-950/20 border-b border-cyan-500/10 flex items-center gap-2 overflow-x-auto custom-scrollbar">
                      <span className="text-[10px] font-mono text-cyan-400 uppercase tracking-wider shrink-0">Active Context:</span>
                      {activeContextFiles.map(file => (
                        <span key={file} className="flex items-center gap-1 bg-cyan-950 border border-cyan-500/30 text-cyan-300 text-[10px] font-mono px-2 py-0.5 rounded-full shrink-0">
                          {file.split('/').pop()}
                          <button onClick={() => toggleContextFile(file)} className="hover:text-white">
                            <FaTimes className="text-[8px]" />
                          </button>
                        </span>
                      ))}
                      <button 
                        onClick={() => setActiveContextFiles([])}
                        className="text-[10px] text-gray-500 hover:text-white ml-auto shrink-0"
                      >
                        Clear All
                      </button>
                    </div>
                  )}

                  <div ref={scrollRef} className="flex-1 overflow-y-auto p-6 space-y-8 custom-scrollbar">
                      {messages.map((m, i) => (
                          <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'} animate-in slide-in-from-bottom-4`}>
                              <div className={`flex gap-4 max-w-[85%] ${m.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                  <div className={`w-10 h-10 rounded-2xl flex items-center justify-center shrink-0 shadow-lg ${m.role === 'model' ? 'bg-cyan-600/10 text-cyan-400 border border-cyan-500/20' : 'bg-indigo-600/10 text-indigo-400 border border-indigo-500/20'}`}>
                                      {m.role === 'model' ? <FaRobot className="text-xl" /> : <FaUser className="text-xl" />}
                                  </div>
                                  <div className="space-y-1">
                                      <div className={`p-5 rounded-3xl text-sm leading-relaxed shadow-xl ${m.role === 'model' ? 'bg-gray-900 text-gray-200 border border-gray-800 rounded-tl-none' : 'bg-indigo-600 text-white rounded-tr-none'}`}>
                                          {m.text}
                                      </div>
                                      {m.confidence && (
                                        <p className="text-[9px] font-mono text-gray-600 uppercase tracking-widest text-right px-2">
                                          Inference Confidence: {(m.confidence * 100).toFixed(2)}%
                                        </p>
                                      )}
                                  </div>
                              </div>
                          </div>
                      ))}
                      {loading && (
                          <div className="flex justify-start">
                              <div className="bg-gray-900/50 p-5 rounded-3xl rounded-tl-none flex gap-2 border border-gray-800 shadow-xl">
                                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.3s]"></div>
                                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce [animation-delay:-0.15s]"></div>
                                  <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce"></div>
                              </div>
                          </div>
                      )}
                  </div>

                  <div className="p-6 bg-black/40 border-t border-gray-800/50 backdrop-blur-2xl">
                      <div className="relative flex items-center gap-4">
                          <input 
                              value={input}
                              onChange={e => setInput(e.target.value)}
                              onKeyPress={e => e.key === 'Enter' && handleSend()}
                              placeholder={activeContextFiles.length > 0 ? `Communicate directive with ${activeContextFiles.length} files in context...` : "Communicate your directive, Architect..."}
                              className="flex-1 bg-gray-900 border-2 border-gray-800 rounded-2xl px-6 py-4 text-white text-sm focus:outline-none focus:border-cyan-500 transition-all placeholder-gray-600"
                              disabled={loading}
                          />
                          <button 
                              onClick={handleSend}
                              disabled={loading || !input.trim()}
                              className="absolute right-2 p-3 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all shadow-xl shadow-cyan-500/20 active:scale-95 disabled:opacity-30"
                          >
                              <FaPaperPlane />
                          </button>
                      </div>
                  </div>
               </Card>
            </div>
        </div>
    );
};

export default AIAdvisorView;