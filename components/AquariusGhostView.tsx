import React, { useState, useMemo } from 'react';
import Card from './Card';
import { callGemini } from '../services/geminiService';
import { 
  EyeOff, 
  Globe, 
  MapPin, 
  Search, 
  ExternalLink, 
  ShieldCheck, 
  Activity, 
  Loader2, 
  Shield, 
  Cpu, 
  Database, 
  FileText, 
  TrendingUp, 
  DollarSign, 
  Map, 
  Layers, 
  Network, 
  Terminal, 
  CheckCircle2, 
  AlertTriangle, 
  Filter 
} from 'lucide-react';

const subSystems = [
  // Bridges
  { id: 'citi-alpaca', name: 'Citi-Alpaca Bridge', category: 'Bridges', path: 'components/bridges/CitiAlpacaBridgeView.tsx', status: 'Encrypted', icon: <Network size={14} className="text-purple-400" /> },
  { id: 'plaid-alpaca', name: 'Plaid-Alpaca Bridge', category: 'Bridges', path: 'components/bridges/PlaidAlpacaBridgeView.tsx', status: 'Active', icon: <Network size={14} className="text-purple-400" /> },
  { id: 'realestate-alpaca', name: 'Real Estate Alpaca Bridge', category: 'Bridges', path: 'components/bridges/RealEstateAlpacaBridge.tsx', status: 'Active', icon: <Network size={14} className="text-purple-400" /> },
  { id: 'sovereign-takeover', name: 'Sovereign Market Takeover', category: 'Bridges', path: 'components/bridges/SovereignMarketTakeoverDashboard.tsx', status: 'Active', icon: <Network size={14} className="text-purple-400" /> },
  { id: 'stripe-alpaca', name: 'Stripe-Alpaca Bridge', category: 'Bridges', path: 'components/bridges/StripeAlpacaBridgeView.tsx', status: 'Encrypted', icon: <Network size={14} className="text-purple-400" /> },
  { id: 'taxlien-treasury', name: 'Tax Lien Modern Treasury Bridge', category: 'Bridges', path: 'components/bridges/TaxLienModernTreasuryBridge.tsx', status: 'Active', icon: <Network size={14} className="text-purple-400" /> },

  // Government
  { id: 'gis-map', name: 'GIS Property Map', category: 'Government', path: 'components/government/GisPropertyMap.tsx', status: 'Active', icon: <Map size={14} className="text-emerald-400" /> },
  { id: 'gov-api', name: 'Government API Dashboard', category: 'Government', path: 'components/government/GovernmentApiDashboard.tsx', status: 'Active', icon: <Cpu size={14} className="text-emerald-400" /> },
  { id: 'irs-tax', name: 'IRS Tax Filing', category: 'Government', path: 'components/government/IrsTaxFiling.tsx', status: 'Encrypted', icon: <FileText size={14} className="text-emerald-400" /> },
  { id: 'sec-filing', name: 'SEC Filing Viewer', category: 'Government', path: 'components/government/SecFilingViewer.tsx', status: 'Active', icon: <FileText size={14} className="text-emerald-400" /> },

  // Real Estate & Tax Liens
  { id: 'deed-registrar', name: 'Deed Registrar', category: 'Real Estate & Tax Liens', path: 'components/real-estate/DeedRegistrar.tsx', status: 'Active', icon: <Layers size={14} className="text-amber-400" /> },
  { id: 'escrow-manager', name: 'Escrow Manager', category: 'Real Estate & Tax Liens', path: 'components/real-estate/EscrowManager.tsx', status: 'Active', icon: <Layers size={14} className="text-amber-400" /> },
  { id: 'property-marketplace', name: 'Property Marketplace', category: 'Real Estate & Tax Liens', path: 'components/real-estate/PropertyMarketplace.tsx', status: 'Active', icon: <Layers size={14} className="text-amber-400" /> },
  { id: 'foreclosure-tracker', name: 'Foreclosure Tracker', category: 'Real Estate & Tax Liens', path: 'components/tax-liens/ForeclosureTracker.tsx', status: 'Active', icon: <Layers size={14} className="text-amber-400" /> },
  { id: 'tax-lien-auctions', name: 'Tax Lien Auctions', category: 'Real Estate & Tax Liens', path: 'components/tax-liens/TaxLienAuctions.tsx', status: 'Active', icon: <Layers size={14} className="text-amber-400" /> },

  // Alpaca
  { id: 'alpaca-accounts', name: 'Alpaca Accounts Manager', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaAccountsManager.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-crypto', name: 'Alpaca Crypto Wallets', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaCryptoWalletsView.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-funding', name: 'Alpaca Funding Hub', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaFundingHub.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-ipo', name: 'Alpaca IPO Marketplace', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaIpoMarketplaceView.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-journals', name: 'Alpaca Journals', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaJournalsView.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-rebalancing', name: 'Alpaca Rebalancing', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaRebalancingView.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-reporting', name: 'Alpaca Reporting', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaReportingView.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-tokenization', name: 'Alpaca Tokenization', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaTokenizationView.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'alpaca-terminal', name: 'Alpaca Trading Terminal', category: 'Alpaca Trading', path: 'components/alpaca/AlpacaTradingTerminal.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'btc-swing', name: 'BTC Swing Trading Notebook', category: 'Alpaca Trading', path: 'components/alpaca/BtcSwingTradingNotebook.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },
  { id: 'tqqq-algo', name: 'TQQQ Algorithm Terminal', category: 'Alpaca Trading', path: 'components/alpaca/TqqqAlgorithmTerminal.tsx', status: 'Active', icon: <TrendingUp size={14} className="text-cyan-400" /> },

  // Trillionaire Status
  { id: 'cap-allocation', name: 'Capital Allocation Models', category: 'Trillionaire Status', path: 'trillionaire-status/CapitalAllocationModels.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'competitor-intel', name: 'Competitor Intelligence', category: 'Trillionaire Status', path: 'trillionaire-status/CompetitorIntelligence.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'consumer-sentiment', name: 'Consumer Sentiment Analysis', category: 'Trillionaire Status', path: 'trillionaire-status/ConsumerSentimentAnalysis.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'corp-governance', name: 'Corporate Governance Review', category: 'Trillionaire Status', path: 'trillionaire-status/CorporateGovernanceReview.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'digital-audit', name: 'Digital Transformation Audit', category: 'Trillionaire Status', path: 'trillionaire-status/DigitalTransformationAudit.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'emerging-market', name: 'Emerging Market Expansion', category: 'Trillionaire Status', path: 'trillionaire-status/EmergingMarketExpansion.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'esg-metrics', name: 'ESG Impact Metrics', category: 'Trillionaire Status', path: 'trillionaire-status/ESGImpactMetrics.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'exec-comp', name: 'Executive Compensation Audit', category: 'Trillionaire Status', path: 'trillionaire-status/ExecutiveCompensationAudit.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'fin-ingestion', name: 'Financial Data Ingestion', category: 'Trillionaire Status', path: 'trillionaire-status/FinancialDataIngestion.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'fortune-plan', name: 'Fortune 500 Research Plan', category: 'Trillionaire Status', path: 'trillionaire-status/Fortune500ResearchPlan.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'tax-strategy', name: 'Global Tax Strategy', category: 'Trillionaire Status', path: 'trillionaire-status/GlobalTaxStrategy.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'infra-dependencies', name: 'Infrastructure Dependencies', category: 'Trillionaire Status', path: 'trillionaire-status/InfrastructureDependencies.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'innovation-pipeline', name: 'Innovation Pipeline Research', category: 'Trillionaire Status', path: 'trillionaire-status/InnovationPipelineResearch.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'lobbying-influence', name: 'Lobbying Influence Mapping', category: 'Trillionaire Status', path: 'trillionaire-status/LobbyingInfluenceMapping.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'market-cap', name: 'Market Cap Analysis', category: 'Trillionaire Status', path: 'trillionaire-status/MarketCapAnalysis.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'mergers-acquisitions', name: 'Mergers And Acquisitions', category: 'Trillionaire Status', path: 'trillionaire-status/MergersAndAcquisitions.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'patent-audit', name: 'Patent Portfolio Audit', category: 'Trillionaire Status', path: 'trillionaire-status/PatentPortfolioAudit.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'regulatory-compliance', name: 'Regulatory Compliance Audit', category: 'Trillionaire Status', path: 'trillionaire-status/RegulatoryComplianceAudit.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'risk-assessment', name: 'Risk Assessment Framework', category: 'Trillionaire Status', path: 'trillionaire-status/RiskAssessmentFramework.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'shareholder-metrics', name: 'Shareholder Value Metrics', category: 'Trillionaire Status', path: 'trillionaire-status/ShareholderValueMetrics.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'supply-chain', name: 'Supply Chain Mapping', category: 'Trillionaire Status', path: 'trillionaire-status/SupplyChainMapping.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'sustainability-reporting', name: 'Sustainability Reporting', category: 'Trillionaire Status', path: 'trillionaire-status/SustainabilityReporting.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'talent-pipeline', name: 'Talent Acquisition Pipeline', category: 'Trillionaire Status', path: 'trillionaire-status/TalentAcquisitionPipeline.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'tech-stack', name: 'Tech Stack Integration', category: 'Trillionaire Status', path: 'trillionaire-status/TechStackIntegration.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> },
  { id: 'trillionaire-summary', name: 'Trillionaire Status Summary', category: 'Trillionaire Status', path: 'trillionaire-status/TrillionaireStatusSummary.ts', status: 'Active', icon: <DollarSign size={14} className="text-rose-400" /> }
];

const AquariusGhostView: React.FC = () => {
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<string | null>(null);
  const [links, setLinks] = useState<any[]>([]);
  const [locationQuery, setLocationQuery] = useState('');
  
  // Ghost Network Directory States
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('All');
  const [selectedSystem, setSelectedSystem] = useState<any>(null);
  const [isAuditingSystem, setIsAuditingSystem] = useState(false);
  const [systemAuditLog, setSystemAuditLog] = useState<string[]>([]);

  const auditPerimeter = async () => {
    setIsSearching(true);
    setResults(null);
    try {
      const response = await callGemini('gemini-3-flash-preview', [
        {
          parts: [{ text: "Find the latest reports on data broker linkability vulnerabilities in EU digital wallets for 2024. List specific verifier patterns we should block." }]
        }
      ], {
        tools: [{ googleSearch: {} }]
      });
      setResults(response.text || "");
      setLinks(response.data.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (e) {
      setResults("Ghost link failed. Rerouting...");
    } finally {
      setIsSearching(false);
    }
  };

  const locateSecureNodes = async () => {
    setIsSearching(true);
    try {
      const response = await callGemini('gemini-2.5-flash', [
        {
          parts: [{ text: `Where are the most secure private compute enclaves or data centers in ${locationQuery || 'Switzerland'}?` }]
        }
      ], {
        tools: [{ googleMaps: {} }]
      });
      setResults(response.text || "");
      setLinks(response.data.candidates?.[0]?.groundingMetadata?.groundingChunks || []);
    } catch (e) {
      setResults("Mapping error.");
    } finally {
      setIsSearching(false);
    }
  };

  const auditSystemNode = async (system: any) => {
    setIsAuditingSystem(true);
    setSelectedSystem(system);
    setSystemAuditLog(prev => [
      `[${new Date().toLocaleTimeString()}] Initiating Ghost Reconnaissance on ${system.name}...`,
      `[${new Date().toLocaleTimeString()}] Target Path: ${system.path}`,
      `[${new Date().toLocaleTimeString()}] Establishing secure quantum tunnel...`
    ]);

    try {
      const response = await callGemini('gemini-3-flash-preview', [
        {
          parts: [{ text: `Perform a simulated security, compliance, and architectural audit on the system module: "${system.name}" located at "${system.path}". Identify potential zero-day vulnerabilities, data leakage vectors, and regulatory compliance risks (GDPR, SEC, FINRA, or local laws). Provide a concise, high-impact summary.` }]
        }
      ]);
      setResults(response.text || "");
      setSystemAuditLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Handshake established.`,
        `[${new Date().toLocaleTimeString()}] Analysis complete. Grounding shield active.`,
        `[${new Date().toLocaleTimeString()}] Status: SECURE.`
      ]);
    } catch (e) {
      setSystemAuditLog(prev => [
        ...prev,
        `[${new Date().toLocaleTimeString()}] Connection interrupted. Rerouting traffic...`,
        `[${new Date().toLocaleTimeString()}] Audit failed.`
      ]);
    } finally {
      setIsAuditingSystem(false);
    }
  };

  // Filtered sub-systems
  const filteredSystems = useMemo(() => {
    return subSystems.filter(sys => {
      const matchesSearch = sys.name.toLowerCase().includes(searchQuery.toLowerCase()) || sys.path.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === 'All' || sys.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [searchQuery, selectedCategory]);

  const categories = ['All', 'Bridges', 'Government', 'Real Estate & Tax Liens', 'Alpaca Trading', 'Trillionaire Status'];

  return (
    <div className="space-y-10 animate-in fade-in duration-700">
      <header className="border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-2">
          <EyeOff className="text-purple-400 w-5 h-5" />
          <h2 className="text-xs font-mono text-purple-400 uppercase tracking-[0.4em]">Legion II: The Ghost</h2>
        </div>
        <h1 className="text-7xl font-black text-white tracking-tighter">Grounding <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-indigo-600">Shield</span></h1>
      </header>

      <div className="grid grid-cols-12 gap-8">
        {/* Left Column: Controls & Metadata */}
        <div className="col-span-12 lg:col-span-4 space-y-8">
          <Card title="Audit Vectors" icon={<Search className="text-purple-400" />}>
             <div className="space-y-4 pt-4">
                <button 
                  onClick={auditPerimeter}
                  disabled={isSearching}
                  className="w-full py-4 bg-purple-600 hover:bg-purple-500 text-white font-black tracking-widest rounded-2xl transition-all shadow-xl shadow-purple-500/10 flex items-center justify-center gap-3"
                >
                  {isSearching ? <Loader2 className="animate-spin" /> : <Globe size={18} />}
                  AUDIT GLOBAL LEAKS
                </button>
                <div className="relative">
                  <input 
                    value={locationQuery}
                    onChange={e => setLocationQuery(e.target.value)}
                    placeholder="Enter region for node lookup..."
                    className="w-full bg-black border border-white/10 rounded-xl p-3 text-xs text-white outline-none focus:border-purple-500"
                  />
                  <button onClick={locateSecureNodes} className="absolute right-2 top-2 p-1 text-purple-400 hover:text-white transition-colors">
                     <MapPin size={16} />
                  </button>
                </div>
             </div>
          </Card>

          <Card title="Grounding Metadata" icon={<Activity className="text-cyan-400" />}>
             <div className="space-y-4 max-h-[250px] overflow-auto custom-scrollbar pt-2">
                {links.length > 0 ? links.map((link, i) => (
                  <a key={i} href={link.web?.uri || link.maps?.uri} target="_blank" rel="noreferrer" className="block p-3 bg-white/5 border border-white/5 rounded-xl hover:bg-white/10 transition-all group">
                     <div className="flex justify-between items-start">
                        <span className="text-[10px] font-black text-purple-400 uppercase">{link.web ? 'Web Source' : 'Mapping Source'}</span>
                        <ExternalLink size={10} className="text-gray-600 group-hover:text-white" />
                     </div>
                     <p className="text-xs text-gray-400 mt-1 truncate">{link.web?.title || link.maps?.title}</p>
                  </a>
                )) : <p className="text-[10px] text-gray-700 italic">No grounding citations currently loaded.</p>}
             </div>
          </Card>

          {selectedSystem && (
            <Card title="Node Audit Console" icon={<Terminal className="text-rose-400" />}>
              <div className="space-y-3 pt-2">
                <div className="flex justify-between items-center">
                  <span className="text-xs font-bold text-white">{selectedSystem.name}</span>
                  <span className="text-[10px] px-2 py-0.5 bg-rose-500/20 text-rose-400 rounded-full font-mono uppercase">{selectedSystem.status}</span>
                </div>
                <p className="text-[10px] text-gray-500 font-mono truncate">{selectedSystem.path}</p>
                
                <div className="bg-black/80 border border-white/5 rounded-xl p-3 font-mono text-[10px] text-emerald-400 space-y-1 max-h-[150px] overflow-y-auto">
                  {systemAuditLog.map((log, idx) => (
                    <div key={idx}>{log}</div>
                  ))}
                  {isAuditingSystem && (
                    <div className="flex items-center gap-2 text-purple-400 animate-pulse">
                      <Loader2 size={10} className="animate-spin" />
                      <span>Analyzing neural pathways...</span>
                    </div>
                  )}
                </div>
              </div>
            </Card>
          )}
        </div>

        {/* Right Column: Neural Recon Feed & Ghost Network Directory */}
        <div className="col-span-12 lg:col-span-8 space-y-8">
           <Card title="Neural Reconnaissance Feed" className="min-h-[350px] bg-black/40">
              {isSearching || isAuditingSystem ? (
                 <div className="h-full min-h-[300px] flex items-center justify-center">
                    <Loader2 className="w-10 h-10 text-purple-400 animate-spin" />
                 </div>
              ) : results ? (
                <div className="prose prose-invert prose-purple max-w-none animate-in fade-in duration-500 p-2">
                   <p className="text-gray-300 leading-relaxed italic whitespace-pre-wrap">"{results}"</p>
                </div>
              ) : (
                <div className="h-full min-h-[300px] flex flex-col items-center justify-center opacity-20 gap-4">
                  <ShieldCheck size={60} />
                  <p className="uppercase tracking-[0.4em] text-[10px] font-black">Shield Ready</p>
                </div>
              )}
           </Card>

           {/* Ghost Network Directory */}
           <Card title="Ghost Network Directory" icon={<Network className="text-purple-400" />}>
             <div className="space-y-6 pt-4">
               <div className="flex flex-col md:flex-row gap-4 justify-between items-start md:items-center">
                 <div className="relative w-full md:w-72">
                   <Search className="absolute left-3 top-2.5 text-gray-500 w-4 h-4" />
                   <input
                     type="text"
                     placeholder="Search sub-systems..."
                     value={searchQuery}
                     onChange={e => setSearchQuery(e.target.value)}
                     className="w-full bg-black/50 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-xs text-white outline-none focus:border-purple-500"
                   />
                 </div>
                 <div className="flex flex-wrap gap-1.5">
                   {categories.map(cat => (
                     <button
                       key={cat}
                       onClick={() => setSelectedCategory(cat)}
                       className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-all ${
                         selectedCategory === cat 
                           ? 'bg-purple-600 text-white' 
                           : 'bg-white/5 text-gray-400 hover:bg-white/10 hover:text-white'
                       }`}
                     >
                       {cat}
                     </button>
                   ))}
                 </div>
               </div>

               <div className="grid grid-cols-1 md:grid-cols-2 gap-3 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
                 {filteredSystems.map(sys => (
                   <div 
                     key={sys.id} 
                     className="p-3 bg-white/5 border border-white/5 rounded-xl hover:border-purple-500/30 transition-all flex justify-between items-center group"
                   >
                     <div className="flex items-center gap-3 min-w-0">
                       <div className="p-2 bg-white/5 rounded-lg">
                         {sys.icon}
                       </div>
                       <div className="min-w-0">
                         <h4 className="text-xs font-bold text-white truncate">{sys.name}</h4>
                         <p className="text-[9px] text-gray-500 font-mono truncate">{sys.path}</p>
                       </div>
                     </div>
                     <button
                       onClick={() => auditSystemNode(sys)}
                       disabled={isAuditingSystem}
                       className="px-3 py-1.5 bg-purple-600/20 hover:bg-purple-600 text-purple-300 hover:text-white text-[9px] font-black tracking-wider rounded-lg transition-all uppercase flex items-center gap-1 shrink-0"
                     >
                       <Shield size={10} />
                       Audit Node
                     </button>
                   </div>
                 ))}
                 {filteredSystems.length === 0 && (
                   <div className="col-span-2 text-center py-8 text-gray-500 text-xs italic">
                     No sub-systems found matching the criteria.
                   </div>
                 )}
               </div>
             </div>
           </Card>
        </div>
      </div>
    </div>
  );
};

export default AquariusGhostView;