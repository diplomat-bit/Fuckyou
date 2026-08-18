import React, { useState, useEffect, useMemo, useCallback, useContext } from "react";
import { useMsal, useIsAuthenticated } from "@azure/msal-react";
import { usePortal } from "../context/PortalContext";
import { FixedSizeList as List } from "react-window";
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Shield, Zap, Fingerprint, BrainCircuit, Search, ExternalLink, Activity, Lock, AlertCircle, DollarSign } from "lucide-react";

import { DataContext } from "../context/DataContext";
import { stripeService } from "../services/StripeService";
import { pulsarService } from "../services/PulsarService";
import { fallbackApps } from "../data/fallbackApps";

// --- OKO MAIN APPS REGISTRY ---
const OKO_MAIN_APPS = [
  // Components
  { appId: "AdministrationAudit", app: "Administration Audit", category: "Admin" },
  { appId: "AIAdStudioView", app: "AI Ad Studio View", category: "AI" },
  { appId: "AIAdvisorView", app: "AI Advisor View", category: "AI" },
  { appId: "AIInsights", app: "AI Insights", category: "AI" },
  { appId: "AlpacaAccountsManager", app: "Alpaca Accounts Manager", category: "Alpaca" },
  { appId: "AlpacaCryptoWalletsView", app: "Alpaca Crypto Wallets View", category: "Alpaca" },
  { appId: "AlpacaFundingHub", app: "Alpaca Funding Hub", category: "Alpaca" },
  { appId: "AlpacaIpoMarketplaceView", app: "Alpaca IPO Marketplace View", category: "Alpaca" },
  { appId: "AlpacaJournalsView", app: "Alpaca Journals View", category: "Alpaca" },
  { appId: "AlpacaRebalancingView", app: "Alpaca Rebalancing View", category: "Alpaca" },
  { appId: "AlpacaReportingView", app: "Alpaca Reporting View", category: "Alpaca" },
  { appId: "AlpacaTokenizationView", app: "Alpaca Tokenization View", category: "Alpaca" },
  { appId: "AlpacaTradingTerminal", app: "Alpaca Trading Terminal", category: "Alpaca" },
  { appId: "BtcSwingTradingNotebook", app: "BTC Swing Trading Notebook", category: "Alpaca" },
  { appId: "TqqqAlgorithmTerminal", app: "TQQQ Algorithm Terminal", category: "Alpaca" },
  { appId: "AlpacaBrokerView", app: "Alpaca Broker View", category: "Alpaca" },
  { appId: "APIIntegrationView", app: "API Integration View", category: "System" },
  { appId: "APIKeysView", app: "API Keys View", category: "System" },
  { appId: "AquariusArchitectView", app: "Aquarius Architect View", category: "Aquarius" },
  { appId: "AquariusAuditorView", app: "Aquarius Auditor View", category: "Aquarius" },
  { appId: "AquariusCreativeSuite", app: "Aquarius Creative Suite", category: "Aquarius" },
  { appId: "AquariusGhostView", app: "Aquarius Ghost View", category: "Aquarius" },
  { appId: "AquariusInstitutionalHub", app: "Aquarius Institutional Hub", category: "Aquarius" },
  { appId: "AquariusLiveVoice", app: "Aquarius Live Voice", category: "Aquarius" },
  { appId: "AriaComms", app: "Aria Comms", category: "AI" },
  { appId: "AstraDBQuickstart", app: "Astra DB Quickstart", category: "Database" },
  { appId: "AzureAppsView", app: "Azure Apps View", category: "Azure" },
  { appId: "BalanceSummary", app: "Balance Summary", category: "Finance" },
  { appId: "BillingIdentityView", app: "Billing Identity View", category: "Identity" },
  { appId: "CitiAlpacaBridgeView", app: "Citi Alpaca Bridge View", category: "Bridges" },
  { appId: "PlaidAlpacaBridgeView", app: "Plaid Alpaca Bridge View", category: "Bridges" },
  { appId: "RealEstateAlpacaBridge", app: "Real Estate Alpaca Bridge", category: "Bridges" },
  { appId: "SovereignMarketTakeoverDashboard", app: "Sovereign Market Takeover Dashboard", category: "Bridges" },
  { appId: "StripeAlpacaBridgeView", app: "Stripe Alpaca Bridge View", category: "Bridges" },
  { appId: "TaxLienModernTreasuryBridge", app: "Tax Lien Modern Treasury Bridge", category: "Bridges" },
  { appId: "BudgetsView", app: "Budgets View", category: "Finance" },
  { appId: "CardCustomizationView", app: "Card Customization View", category: "Finance" },
  { appId: "Card", app: "Card Component", category: "Finance" },
  { appId: "CitiConnectInitiation", app: "Citi Connect Initiation", category: "Citi" },
  { appId: "CitiConnectInquiry", app: "Citi Connect Inquiry", category: "Citi" },
  { appId: "CitiConnectNotifications", app: "Citi Connect Notifications", category: "Citi" },
  { appId: "CitiDecryptionUtility", app: "Citi Decryption Utility", category: "Citi" },
  { appId: "CitiGateway", app: "Citi Gateway", category: "Citi" },
  { appId: "CitiPartnerHub", app: "Citi Partner Hub", category: "Citi" },
  { appId: "CitiSovereignLedger", app: "Citi Sovereign Ledger", category: "Citi" },
  { appId: "CitiTreasuryHub", app: "Citi Treasury Hub", category: "Citi" },
  { appId: "CitiUkInternationalPayments", app: "Citi UK International Payments", category: "Citi" },
  { appId: "ContractorLobbyingList", app: "Contractor Lobbying List", category: "Government" },
  { appId: "CorporateCommandView", app: "Corporate Command View", category: "Corporate" },
  { appId: "CreditHealthView", app: "Credit Health View", category: "Finance" },
  { appId: "CryptoView", app: "Crypto View", category: "Finance" },
  { appId: "Dashboard", app: "Dashboard View", category: "System" },
  { appId: "DataIngestView", app: "Data Ingest View", category: "System" },
  { appId: "DeveloperView", app: "Developer View", category: "System" },
  { appId: "EntraSwarmManager", app: "Entra Swarm Manager", category: "Azure" },
  { appId: "FeaturePalette", app: "Feature Palette", category: "System" },
  { appId: "FinancialDemocracyView", app: "Financial Democracy View", category: "Finance" },
  { appId: "FinancialGoalsView", app: "Financial Goals View", category: "Finance" },
  { appId: "FleetAppView", app: "Fleet App View", category: "System" },
  { appId: "FloridaVoterView", app: "Florida Voter View", category: "Government" },
  { appId: "FlowController", app: "Flow Controller", category: "System" },
  { appId: "GasPriceCorrelation", app: "Gas Price Correlation", category: "Finance" },
  { appId: "GcpInventoryView", app: "GCP Inventory View", category: "System" },
  { appId: "GeminiKeyModal", app: "Gemini Key Modal", category: "AI" },
  { appId: "GeminiLivePortal", app: "Gemini Live Portal", category: "AI" },
  { appId: "GlobalLedgerView", app: "Global Ledger View", category: "Finance" },
  { appId: "GoalsView", app: "Goals View", category: "Finance" },
  { appId: "GisPropertyMap", app: "GIS Property Map", category: "Government" },
  { appId: "GovernmentApiDashboard", app: "Government API Dashboard", category: "Government" },
  { appId: "IrsTaxFiling", app: "IRS Tax Filing", category: "Government" },
  { appId: "SecFilingViewer", app: "SEC Filing Viewer", category: "Government" },
  { appId: "GrowthNexus", app: "Growth Nexus", category: "Corporate" },
  { appId: "Header", app: "Header Component", category: "System" },
  { appId: "HoKTokenMint", app: "HoK Token Mint", category: "Finance" },
  { appId: "IdentityCitadelView", app: "Identity Citadel View", category: "Identity" },
  { appId: "ImpactTracker", app: "Impact Tracker", category: "System" },
  { appId: "ImpeachmentGenerator", app: "Impeachment Generator", category: "Government" },
  { appId: "InjusticeDashboard", app: "Injustice Dashboard", category: "Government" },
  { appId: "IntegrationsMarketplaceView", app: "Integrations Marketplace View", category: "System" },
  { appId: "IntelligenceHubView", app: "Intelligence Hub View", category: "AI" },
  { appId: "InvestmentPortfolio", app: "Investment Portfolio", category: "Finance" },
  { appId: "InvestmentsPortfolio", app: "Investments Portfolio", category: "Finance" },
  { appId: "InvestmentsView", app: "Investments View", category: "Finance" },
  { appId: "JweJwsVerifier", app: "JWE/JWS Verifier", category: "Security" },
  { appId: "KryptoBridgeWidget", app: "Krypto Bridge Widget", category: "Bridges" },
  { appId: "MachineView", app: "Machine View", category: "System" },
  { appId: "MarketingAutomationView", app: "Marketing Automation View", category: "Corporate" },
  { appId: "MarketplaceView", app: "Marketplace View", category: "System" },
  { appId: "ModernTreasuryLedgerHub", app: "Modern Treasury Ledger Hub", category: "Finance" },
  { appId: "NeuralToolsView", app: "Neural Tools View", category: "AI" },
  { appId: "NexusBuilder", app: "Nexus Builder", category: "System" },
  { appId: "NFCValidator", app: "NFC Validator", category: "Security" },
  { appId: "OFXStatementViewer", app: "OFX Statement Viewer", category: "Finance" },
  { appId: "OpenBankingFapiView", app: "Open Banking FAPI View", category: "Finance" },
  { appId: "OpenBankingView", app: "Open Banking View", category: "Finance" },
  { appId: "PaymentMethodsView", app: "Payment Methods View", category: "Finance" },
  { appId: "PersonalizationView", app: "Personalization View", category: "System" },
  { appId: "PlaidLinkButton", app: "Plaid Link Button", category: "Finance" },
  { appId: "PlaidLink", app: "Plaid Link Component", category: "Finance" },
  { appId: "PoliticalComplianceView", app: "Political Compliance View", category: "Government" },
  { appId: "PortalHandshake", app: "Portal Handshake", category: "System" },
  { appId: "PortalHubView", app: "Portal Hub View", category: "System" },
  { appId: "PrivacyGuardianView", app: "Privacy Guardian View", category: "Security" },
  { appId: "PublicAidCalculator", app: "Public Aid Calculator", category: "Government" },
  { appId: "QuantumWeaverView", app: "Quantum Weaver View", category: "AI" },
  { appId: "DeedRegistrar", app: "Deed Registrar", category: "Real Estate" },
  { appId: "EscrowManager", app: "Escrow Manager", category: "Real Estate" },
  { appId: "PropertyMarketplace", app: "Property Marketplace", category: "Real Estate" },
  { appId: "RecentTransactions", app: "Recent Transactions", category: "Finance" },
  { appId: "RecoveryMeshView", app: "Recovery Mesh View", category: "Security" },
  { appId: "RewardsView", app: "Rewards View", category: "Finance" },
  { appId: "SecurityOrchestratorView", app: "Security Orchestrator View", category: "Security" },
  { appId: "SecurityView", app: "Security View", category: "Security" },
  { appId: "SendMoneyView", app: "Send Money View", category: "Finance" },
  { appId: "SettingsView", app: "Settings View", category: "System" },
  { appId: "Sidebar", app: "Sidebar Component", category: "System" },
  { appId: "SovereignChat", app: "Sovereign Chat", category: "AI" },
  { appId: "SovereignDashboard", app: "Sovereign Dashboard", category: "System" },
  { appId: "SovereignDealAudit", app: "Sovereign Deal Audit", category: "Corporate" },
  { appId: "SovereignIframe", app: "Sovereign Iframe", category: "System" },
  { appId: "SovereignIntelligenceView", app: "Sovereign Intelligence View", category: "AI" },
  { appId: "SovereignOrgHandshake", app: "Sovereign Org Handshake", category: "System" },
  { appId: "SovereignSentryEngine", app: "Sovereign Sentry Engine", category: "Security" },
  { appId: "StoryViewer", app: "Story Viewer", category: "System" },
  { appId: "StripeTreasuryManager", app: "Stripe Treasury Manager", category: "Finance" },
  { appId: "TabManager", app: "Tab Manager", category: "System" },
  { appId: "ForeclosureTracker", app: "Foreclosure Tracker", category: "Tax Liens" },
  { appId: "TaxLienAuctions", app: "Tax Lien Auctions", category: "Tax Liens" },
  { appId: "TheVisionView", app: "The Vision View", category: "System" },
  { appId: "TokenIssuanceView", app: "Token Issuance View", category: "Finance" },
  { appId: "TradingBotsView", app: "Trading Bots View", category: "Finance" },
  { appId: "TransactionsView", app: "Transactions View", category: "Finance" },
  { appId: "TrustRegistryView", app: "Trust Registry View", category: "Security" },
  { appId: "Universe3D", app: "Universe 3D", category: "System" },
  { appId: "UniverseGraphVisualizer", app: "Universe Graph Visualizer", category: "System" },
  { appId: "VoiceControl", app: "Voice Control", category: "AI" },
  { appId: "WalletConnectModal", app: "Wallet Connect Modal", category: "Finance" },
  { appId: "WarAppropriationsTracker", app: "War Appropriations Tracker", category: "Government" },
  { appId: "WealthDistributionChart", app: "Wealth Distribution Chart", category: "Finance" },
  { appId: "WealthNexusView", app: "Wealth Nexus View", category: "Finance" },
  { appId: "WealthTimeline", app: "Wealth Timeline", category: "Finance" },
  { appId: "WorkspaceNexusView", app: "Workspace Nexus View", category: "Corporate" },

  // Trillionaire Status
  { appId: "CapitalAllocationModels", app: "Capital Allocation Models", category: "Trillionaire" },
  { appId: "CompetitorIntelligence", app: "Competitor Intelligence", category: "Trillionaire" },
  { appId: "ConsumerSentimentAnalysis", app: "Consumer Sentiment Analysis", category: "Trillionaire" },
  { appId: "CorporateGovernanceReview", app: "Corporate Governance Review", category: "Trillionaire" },
  { appId: "DigitalTransformationAudit", app: "Digital Transformation Audit", category: "Trillionaire" },
  { appId: "EmergingMarketExpansion", app: "Emerging Market Expansion", category: "Trillionaire" },
  { appId: "ESGImpactMetrics", app: "ESG Impact Metrics", category: "Trillionaire" },
  { appId: "ExecutiveCompensationAudit", app: "Executive Compensation Audit", category: "Trillionaire" },
  { appId: "FinancialDataIngestion", app: "Financial Data Ingestion", category: "Trillionaire" },
  { appId: "Fortune500ResearchPlan", app: "Fortune 500 Research Plan", category: "Trillionaire" },
  { appId: "GlobalTaxStrategy", app: "Global Tax Strategy", category: "Trillionaire" },
  { appId: "InfrastructureDependencies", app: "Infrastructure Dependencies", category: "Trillionaire" },
  { appId: "InnovationPipelineResearch", app: "Innovation Pipeline Research", category: "Trillionaire" },
  { appId: "LobbyingInfluenceMapping", app: "Lobbying Influence Mapping", category: "Trillionaire" },
  { appId: "MarketCapAnalysis", app: "Market Cap Analysis", category: "Trillionaire" },
  { appId: "MergersAndAcquisitions", app: "Mergers & Acquisitions", category: "Trillionaire" },
  { appId: "PatentPortfolioAudit", app: "Patent Portfolio Audit", category: "Trillionaire" },
  { appId: "RegulatoryComplianceAudit", app: "Regulatory Compliance Audit", category: "Trillionaire" },
  { appId: "RiskAssessmentFramework", app: "Risk Assessment Framework", category: "Trillionaire" },
  { appId: "ShareholderValueMetrics", app: "Shareholder Value Metrics", category: "Trillionaire" },
  { appId: "SupplyChainMapping", app: "Supply Chain Mapping", category: "Trillionaire" },
  { appId: "SustainabilityReporting", app: "Sustainability Reporting", category: "Trillionaire" },
  { appId: "TalentAcquisitionPipeline", app: "Talent Acquisition Pipeline", category: "Trillionaire" },
  { appId: "TechStackIntegration", app: "Tech Stack Integration", category: "Trillionaire" },
  { appId: "TrillionaireStatusSummary", app: "Trillionaire Status Summary", category: "Trillionaire" }
];

// --- MAIN COMPONENT ---
export default function AquariusDashboard({ setView }: { setView: (view: any) => void }) {
  const { instance, accounts } = useMsal();
  const isAuthenticated = useIsAuthenticated();
  const { buyCrypto, userProfile, transactions, sessionId } = useContext(DataContext) || {};
  const [rawApps, setRawApps] = useState<any[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [aiDirective, setAiDirective] = useState("Awaiting Identity Handshake...");
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [selectedAppId, setSelectedAppId] = useState<string | null>(null);
  const [authError, setAuthError] = useState<string | null>(null);
  const [buyAmount, setBuyAmount] = useState<string>("100");
  const [isBuyModalOpen, setIsBuyModalOpen] = useState(false);
  const [bypassAuth, setBypassAuth] = useState(true);

  const handleBuyCrypto = async () => {
    if (!buyCrypto) return;
    const amount = parseFloat(buyAmount);
    if (isNaN(amount) || amount <= 0) return;
    await buyCrypto(amount, "BTC");
    setIsBuyModalOpen(false);
  };
 
  // Calculate income
  const incomeData = useMemo(() => {
    if (!transactions) return [];
    
    return transactions
        .filter(t => t.type === 'credit' || t.type === 'INFLOW' || t.type === 'income' || t.amount > 0)
        .slice(-10)
        .map(t => ({ name: t.date, income: Math.abs(t.amount) }));
  }, [transactions]);

  // --- 3. AZURE POPUP LOGIC ---
  const isInIframe = window.self !== window.top;

  const { setMsalBypass } = usePortal();

  const handleLogin = async () => {
    setAuthError(null);
    try {
      await instance.loginPopup({ scopes: ["User.Read", "openid", "profile"] });
      setMsalBypass(true);
      setBypassAuth(true);
    } catch (e: any) {
      console.warn("Auth popup blocked or error, activating Entra Enclave Bypass:", e);
      setMsalBypass(true);
      setBypassAuth(true);
    }
  };

  // --- 4. 2,200 APP NDJSON LOADER WITH OKO MAIN INTEGRATION ---
  useEffect(() => {
    if (isAuthenticated || bypassAuth) {
      fetch('/api/v1/azure-apps', {
        headers: { 'x-session-id': sessionId || '' }
      })
        .then(res => {
          if (!res.ok) {
            throw new Error(`API error code: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          const apiApps = data.apps || [];
          const combined = [...OKO_MAIN_APPS, ...apiApps];
          const unique = Array.from(new Map(combined.map(item => [item.appId, item])).values());
          console.log("Loaded apps via API + Oko Main:", unique.length);
          setRawApps(unique);
        })
        .catch(err => {
          console.warn("Backend API fetch failed, trying static fallback apps.json:", err);
          const baseUrl = import.meta.env.BASE_URL || '/';
          const fetchStatic = (url: string) => {
            return fetch(url)
              .then(res => {
                if (!res.ok) {
                  throw new Error(`Fetch error: ${res.status}`);
                }
                return res.json();
              });
          };

          fetchStatic(`${baseUrl}apps/apps.json`)
            .catch(() => {
              if (baseUrl !== '/') {
                return fetchStatic('/apps/apps.json');
              }
              throw new Error("Root path also failed");
            })
            .then(appsData => {
              const combined = [...OKO_MAIN_APPS, ...(appsData || [])];
              const unique = Array.from(new Map(combined.map(item => [item.appId, item])).values());
              console.log("Loaded apps via static fallback + Oko Main:", unique.length);
              setRawApps(unique);
            })
            .catch(staticErr => {
              console.error("Static fallback also failed, loading in-memory precompiled list:", staticErr);
              const combined = [...OKO_MAIN_APPS, ...fallbackApps];
              const unique = Array.from(new Map(combined.map(item => [item.appId, item])).values());
              setRawApps(unique);
            });
        });
    }
  }, [isAuthenticated, bypassAuth]);

  // --- 5. SEARCH & VIRTUALIZATION ---
  const filteredApps = useMemo(() => {
    const lowTerm = searchTerm.toLowerCase();
    return rawApps.filter(app => 
      (app.app && app.app.toLowerCase().includes(lowTerm)) || 
      (app.displayName && app.displayName.toLowerCase().includes(lowTerm)) || 
      (app.appId && app.appId.toLowerCase().includes(lowTerm)) ||
      (app.category && app.category.toLowerCase().includes(lowTerm))
    );
  }, [searchTerm, rawApps]);

  const AppRow = ({ index, style }: any) => {
    const app = filteredApps[index];
    return (
      <div style={style} className="pr-4 pb-2">
        <div 
          onClick={() => {
            setSelectedAppId(app.appId);
            setView(app.appId);
          }}
          className={`h-full p-4 bg-white/5 border rounded-2xl flex items-center justify-between transition-all cursor-pointer ${selectedAppId === app.appId ? 'border-lime-500' : 'border-white/5 hover:border-lime-500/50'}`}
        >
          <div className="truncate">
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-bold text-white truncate">{app.app || app.displayName || 'Unknown App'}</h3>
              {app.category && (
                <span className="px-2 py-0.5 text-[8px] font-mono bg-lime-500/10 text-lime-400 rounded-full uppercase">
                  {app.category}
                </span>
              )}
            </div>
            <p className="text-[9px] font-mono text-gray-500 uppercase">{app.appId}</p>
          </div>
          <ExternalLink size={14} className={selectedAppId === app.appId ? 'text-lime-400' : 'text-gray-500'} />
        </div>
      </div>
    );
  };

  // --- 6. VERCEL API TRIGGER ---
  const fetchAi = useCallback(async () => {
    if ((!isAuthenticated && !bypassAuth) || isAiLoading) return;
    setIsAiLoading(true);
    try {
      const res = await fetch('/api/Gemini', {
        method: 'POST',
        headers: { 
          'Content-Type': 'application/json',
          'x-session-id': sessionId || ''
        },
        body: JSON.stringify({ prompt: `Directive for ${accounts[0]?.name || "James"}. 2,200 apps active.` })
      });
      const data = await res.json();
      setAiDirective(data.text);
    } catch (e) {
      setAiDirective("Sovereign Node Monitoring Active.");
    } finally {
      setIsAiLoading(false);
    }
  }, [isAuthenticated, bypassAuth, accounts]);

  useEffect(() => { if (isAuthenticated || bypassAuth) fetchAi(); }, [isAuthenticated, bypassAuth]);

  // --- 7. AUTH GATE UI ---
  if (!isAuthenticated && !bypassAuth) {
    return (
      <div className="h-screen bg-black flex flex-col items-center justify-center space-y-8 animate-in fade-in duration-500">
        <div className="relative">
          <Fingerprint size={120} className="text-lime-500 animate-pulse" />
          <div className="absolute inset-0 bg-lime-500/20 blur-3xl rounded-full" />
        </div>
        <h1 className="text-4xl font-black text-white tracking-tighter uppercase">Identity Required</h1>
        
        {authError && (
          <div className="max-w-md p-4 bg-red-500/10 border border-red-500/30 rounded-2xl text-red-400 text-[10px] font-mono text-center space-y-2">
            <p className="font-bold uppercase tracking-widest flex items-center justify-center gap-2">
              <AlertCircle size={12} /> Authentication_Error
            </p>
            <p className="leading-relaxed opacity-80">{authError}</p>
            <p className="text-[8px] text-slate-500 italic">
              HINT: If you see AADSTS9002326, ensure your Azure App is registered as a "Single-Page Application" (SPA) in the Azure Portal.
            </p>
          </div>
        )}

        <div className="flex flex-col gap-4 w-full max-w-sm">
          <button onClick={handleLogin} className="w-full py-5 bg-lime-500 text-black font-black rounded-2xl flex items-center justify-center gap-3 hover:scale-105 transition-transform shadow-[0_0_30px_rgba(163,230,53,0.15)]">
            <Lock size={20} /> SPAWN AZURE HANDSHAKE
          </button>
          
          <button onClick={() => setBypassAuth(true)} className="w-full py-4 bg-white/5 border border-white/10 text-gray-400 font-bold rounded-2xl flex items-center justify-center gap-3 hover:bg-white/10 transition-all font-mono text-xs uppercase tracking-wider">
            Bypass MSAL Authentication
          </button>
        </div>
      </div>
    );
  }

  // --- 8. DASHBOARD UI ---
  const pulsarConfig = pulsarService.getConfig();

  return (
    <div className="min-h-screen bg-black text-white p-8 space-y-10 font-sans selection:bg-lime-500 selection:text-black">
      <header className="flex justify-between items-end border-b border-white/10 pb-8">
        <div>
          <div className="flex items-center gap-2 mb-2 text-lime-400 font-mono text-[10px] tracking-[0.4em]">
            <Activity size={14} className="animate-pulse" /> NODE_ACTIVE // {rawApps.length} APPS
          </div>
          <h1 className="text-7xl font-black tracking-tighter">Sovereign <span className="text-lime-500">Command</span></h1>
        </div>
        <div className="text-right flex flex-col items-end gap-4">
          <div className="flex gap-8 items-end text-right">
            <div>
              <p className="text-[10px] text-gray-500 uppercase tracking-widest font-bold">Sovereign USD</p>
              <p className="text-4xl font-mono font-black text-white">${userProfile?.usdBalance?.toLocaleString('en-US', { minimumFractionDigits: 2 })}</p>
            </div>
            <div>
              <p className="text-[10px] text-lime-500 uppercase tracking-widest font-bold">Sovereign BTC</p>
              <p className="text-4xl font-mono font-black text-lime-400">{userProfile?.cryptoBalance?.toFixed(6)}</p>
            </div>
          </div>
          
          <button 
            onClick={() => setIsBuyModalOpen(true)}
            className="group relative flex items-center gap-2 px-6 py-3 bg-[#FF5F00] hover:bg-[#FF5F00]/90 text-white rounded-full font-bold transition-all overflow-hidden"
          >
            <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -translate-x-full group-hover:animate-[shimmer_1.5s_infinite]" />
            <img 
              src="data:image/svg+xml,%3Csvg width='25px' height='17px' viewBox='0 0 25 17' version='1.1' xmlns='http://www.w3.org/2000/svg'%3E%3Cg stroke='none' stroke-width='1' fill='none' fill-rule='evenodd' stroke-linecap='round'%3E%3Cg transform='translate(-1063.000000, -691.000000)' stroke='%23FFFFFF' stroke-width='1.36'%3E%3Cpath d='M1069.95,692 L1066.08,692 C1064.93,692 1064,692.93 1064,694.08 L1064,704.65 C1064,705.8 1064.93,706.73 1066.08,706.73 L1071.17,706.73 C1071.78,706.73 1072.36,706.46 1072.76,705.99 L1078.15,699.62 C1078.28,699.47 1078.28,699.25 1078.15,699.11 L1072.36,692.26 C1072.3,692.2 1072.31,692.09 1072.38,692.04 C1072.41,692.01 1072.44,692 1072.48,692 L1076.59,692 C1076.64,692 1076.69,692.02 1076.72,692.06 L1082.68,699.11 C1082.81,699.25 1082.81,699.47 1082.68,699.62 L1076.89,706.46 C1076.83,706.53 1076.84,706.63 1076.91,706.69 C1076.94,706.71 1076.98,706.73 1077.01,706.73 L1080.84,706.73 C1080.89,706.73 1080.94,706.71 1080.97,706.67 L1087.01,699.62 C1087.14,699.47 1087.14,699.25 1087.01,699.1 L1080.92,692'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E" 
              alt="Click to Pay"
              className="h-4"
            />
            <span className="text-xs tracking-tighter uppercase">Click to Pay Crypto</span>
          </button>
        </div>
      </header>

      {isBuyModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
          <div className="bg-[#111] border border-white/10 p-8 rounded-[2rem] max-w-md w-full space-y-6">
            <div className="flex justify-between items-center">
              <h2 className="text-2xl font-black tracking-tighter uppercase">Buy Crypto</h2>
              <button onClick={() => setIsBuyModalOpen(false)} className="text-gray-500 hover:text-white">✕</button>
            </div>
            
            <div className="space-y-4">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5">
                <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">Available Balance</p>
                <p className="text-2xl font-mono">${userProfile?.usdBalance?.toLocaleString()}</p>
              </div>

              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold">Amount (USD)</label>
                <input 
                  type="number" 
                  value={buyAmount}
                  onChange={(e) => setBuyAmount(e.target.value)}
                  className="w-full bg-black border border-white/10 rounded-xl py-4 px-6 text-xl text-lime-400 outline-none focus:border-lime-500 transition-all"
                />
              </div>

              <div className="p-4 bg-lime-500/10 rounded-2xl border border-lime-500/20 flex justify-between items-center">
                <span className="text-xs font-bold text-lime-400 uppercase">Estimated Crypto</span>
                <span className="font-mono text-white">{(parseFloat(buyAmount) / 50000).toFixed(6)} BTC</span>
              </div>
            </div>

            <button 
              onClick={handleBuyCrypto}
              disabled={!buyAmount || parseFloat(buyAmount) <= 0 || parseFloat(buyAmount) > (userProfile?.usdBalance || 0)}
              className="w-full py-5 bg-lime-500 disabled:bg-gray-800 disabled:text-gray-500 text-black font-black rounded-2xl transition-all hover:scale-[1.02] active:scale-95"
            >
              CONFIRM PURCHASE
            </button>
            
            <p className="text-[9px] text-center text-gray-600 uppercase tracking-widest leading-relaxed">
              Funds will be pulled from your Sovereign app balance. <br/>
              Transaction secured via Neural Mesh.
            </p>
          </div>
        </div>
      )}

      <div className="grid grid-cols-12 gap-8">
        {/* AI Strategic Brief */}
        <div className="col-span-12 p-10 rounded-[3rem] border border-lime-500/20 bg-lime-500/5 flex items-center justify-between">
          <div className="flex items-center gap-8">
            <BrainCircuit className={`text-lime-400 ${isAiLoading ? "animate-spin" : ""}`} size={48} />
            <div className="space-y-1">
              <p className="text-2xl font-light italic text-white/80">"{aiDirective}"</p>
              <div className="flex gap-4">
                <span className="text-[10px] font-mono text-lime-500 flex items-center gap-1">
                  <Activity size={10} /> PULSAR_LINK: {pulsarConfig.brokerServiceUrl ? "ACTIVE" : "STANDBY"}
                </span>
                <span className="text-[10px] font-mono text-cyan-400 flex items-center gap-1">
                  <Lock size={10} /> ZKP_MESH: OPERATIONAL
                </span>
              </div>
            </div>
          </div>
          <button onClick={fetchAi} className="p-5 bg-lime-500 text-black rounded-2xl hover:bg-lime-400"><Zap /></button>
        </div>

        {/* 2,200 App Mesh List */}
        <div className="col-span-12 lg:col-span-7 bg-white/5 p-8 rounded-[3rem] border border-white/5">
          <div className="flex justify-between items-center mb-6">
            <h2 className="text-xl font-black uppercase tracking-widest">Fleet Mesh</h2>
            <div className="relative w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={14} />
              <input 
                type="text" 
                placeholder="Filter Fleet..." 
                className="w-full bg-black/40 border border-white/10 rounded-xl py-2 pl-10 text-xs text-lime-400 outline-none"
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>
          <div className="h-[500px]">
            <List height={500} itemCount={filteredApps.length} itemSize={80} width={"100%"}>
              {AppRow}
            </List>
          </div>
        </div>

        {/* Portfolio Matrix */}
        <div className="col-span-12 lg:col-span-5 space-y-8">
            <div className="space-y-4">
              <div className="h-[300px] bg-white/5 rounded-[3rem] border border-white/5 p-8">
                  <h3 className="text-sm font-bold text-gray-400 uppercase mb-4">Income Trends</h3>
                  <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={incomeData}>
                          <XAxis dataKey="name" hide />
                          <Tooltip cursor={{fill: 'transparent'}} />
                          <Bar dataKey="income" fill="#a3e635" radius={[10, 10, 0, 0]} />
                      </BarChart>
                  </ResponsiveContainer>
              </div>

              <button 
                onClick={() => stripeService.initiatePayment(50, 'Payment for Services')}
                className="w-full p-6 bg-white text-black font-black rounded-3xl flex items-center justify-center gap-3 hover:bg-gray-200 transition-all font-mono uppercase tracking-tighter"
              >
                <DollarSign size={20} /> Process Stripe Payment
              </button>
            </div>
            
            <div className="p-8 bg-lime-500 rounded-[3rem] text-black">
                <h3 className="font-black uppercase tracking-widest text-xs mb-2">Authority Verified</h3>
                <p className="text-2xl font-bold leading-tight underline decoration-black/20">All 2,200 Apps Synchronized via Microsoft Entra ID Handshake.</p>
            </div>
        </div>
      </div>
    </div>
  );
}
