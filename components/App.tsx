import React, { useState, useContext, useMemo, useEffect, useRef, useCallback } from 'react';
import Header from './Header';
import Sidebar from './Sidebar';
import { View } from '../types';
import { DataContext } from '../context/DataContext';
import FeatureGuard from './FeatureGuard';
import MetaDashboardView from './views/platform/MetaDashboardView';
import { ModalView } from './ModalView';

// --- NEW FRAMEWORK VIEWS ---
import AgentMarketplaceView from './views/platform/AgentMarketplaceView';
import OrchestrationView from './views/platform/OrchestrationView';
import DataMeshView from './views/platform/DataMeshView';
import DataCommonsView from './views/platform/DataCommonsView';
import MainframeView from './views/platform/MainframeView';
import AIGovernanceView from './views/platform/AIGovernanceView';
import AIRiskRegistryView from './views/platform/AIRiskRegistryView';
import OSPOView from './views/platform/OSPOView';
import CiCdView from './views/platform/CiCdView';
import InventionsView from './views/platform/InventionsView';
import RoadmapView from './views/platform/RoadmapView';
import ConnectView from './views/platform/DemoBankConnectView';
import EconomicSynthesisEngineView from './views/platform/EconomicSynthesisEngineView';

// --- FOUNDATIONAL & LEGACY VIEWS ---
import DashboardView from './views/personal/DashboardView';
import TransactionsView from './views/personal/TransactionsView';
import SendMoneyView from './views/personal/SendMoneyView';
import BudgetsView from './views/personal/BudgetsView';
import InvestmentsView from './InvestmentsView';
import PortfolioExplorerView from './views/personal/PortfolioExplorerView';
import CryptoView from './views/personal/CryptoView';
import FinancialGoalsView from './views/personal/FinancialGoalsView';
import MarketplaceView from './views/personal/MarketplaceView';
import PersonalizationView from './views/personal/PersonalizationView';
import CardCustomizationView from './views/personal/CardCustomizationView';
import RewardsHubView from './views/personal/RewardsHubView';
import CreditHealthView from './views/personal/CreditHealthView';
import SecurityView from './views/personal/SecurityView';
import OpenBankingView from './views/personal/OpenBankingView';
import SettingsView from './views/personal/SettingsView';

// AI & Platform Views
import AIAdvisorView from './views/platform/AIAdvisorView';
import QuantumWeaverView from './views/platform/QuantumWeaverView';
import QuantumOracleView from './views/platform/QuantumOracleView';
import AIAdStudioView from './views/platform/AIAdStudioView';
import TheVisionView from './views/platform/TheVisionView';
import APIStatusView from './views/platform/APIStatusView';
import TheNexusView from './views/platform/TheNexusView';
import ConstitutionalArticleView from './views/platform/ConstitutionalArticleView';
import TheCharterView from './views/platform/TheCharterView';
import FractionalReserveView from './views/platform/FractionalReserveView';
import FinancialInstrumentForgeView from './views/platform/TheAssemblyView';

// Corporate Finance Views
import CorporateDashboardView from './views/corporate/CorporateDashboardView';
import PaymentOrdersView from './views/corporate/PaymentOrdersView';
import CounterpartiesView from './views/corporate/CounterpartiesView';
import InvoicesView from './views/corporate/InvoicesView';
import ComplianceView from './views/corporate/ComplianceView';
import AnomalyDetectionView from './views/corporate/AnomalyDetectionView';
import PayrollView from './views/corporate/PayrollView';

// Demo Bank Platform Views
import DemoBankSocialView from './views/platform/DemoBankSocialView';
import DemoBankERPView from './views/platform/DemoBankERPView';
import DemoBankCRMView from './views/platform/DemoBankCRMView';
import DemoBankAPIGatewayView from './views/platform/DemoBankAPIGatewayView';
import DemoBankGraphExplorerView from './views/platform/DemoBankGraphExplorerView';
import DemoBankDBQLView from './views/platform/DemoBankDBQLView';
import DemoBankCloudView from './views/platform/DemoBankCloudView';
import DemoBankIdentityView from './views/platform/DemoBankIdentityView';
import DemoBankStorageView from './views/platform/DemoBankStorageView';
import DemoBankComputerView from './views/platform/DemoBankComputerView';
import DemoBankAIPlatformView from './views/platform/DemoBankAIPlatformView';
import DemoBankMachineLearningView from './views/platform/DemoBankMachineLearningView';
import DemoBankDevOpsView from './views/platform/DemoBankDevOpsView';
import DemoBankSecurityCenterView from './views/platform/DemoBankSecurityCenterView';
import DemoBankComplianceHubView from './views/platform/DemoBankComplianceHubView';
import DemoBankAppMarketplaceView from './views/platform/DemoBankAppMarketplaceView';
import DemoBankEventsView from './views/platform/DemoBankEventsView';
import DemoBankLogicAppsView from './views/platform/DemoBankLogicAppsView';
import DemoBankFunctionsView from './views/platform/DemoBankFunctionsView';
import DemoBankDataFactoryView from './views/platform/DemoBankDataFactoryView';
import DemoBankAnalyticsView from './views/platform/DemoBankAnalyticsView';
import DemoBankBIView from './views/platform/DemoBankBIView';
import DemoBankIoTHubView from './views/platform/DemoBankIoTHubView';
import DemoBankMapsView from './views/platform/DemoBankMapsView';
import DemoBankCommunicationsView from './views/platform/DemoBankCommunicationsView';
import DemoBankCommerceView from './views/platform/DemoBankCommerceView';
import DemoBankTeamsView from './views/platform/DemoBankTeamsView';
import DemoBankCMSView from './views/platform/DemoBankCMSView';
import DemoBankLMSView from './views/platform/DemoBankLMSView';
import DemoBankHRISView from './views/platform/DemoBankHRISView';
import DemoBankProjectsView from './views/platform/DemoBankProjectsView';
import DemoBankLegalSuiteView from './views/platform/DemoBankLegalSuiteView';
import DemoBankSupplyChainView from './views/platform/DemoBankSupplyChainView';
import DemoBankPropTechView from './views/platform/DemoBankPropTechView';
import DemoBankGamingServicesView from './views/platform/DemoBankGamingServicesView';
import DemoBankBookingsView from './views/platform/DemoBankBookingsView';
import DemoBankCDPView from './views/platform/DemoBankCDPView';
import DemoBankQuantumServicesView from './views/platform/DemoBankQuantumServicesView';
import DemoBankBlockchainView from './views/platform/DemoBankBlockchainView';
import DemoBankGISView from './views/platform/DemoBankGISView';
import DemoBankRoboticsView from './views/platform/DemoBankRoboticsView';
import DemoBankSimulationsView from './views/platform/DemoBankSimulationsView';
import DemoBankVoiceServicesView from './views/platform/DemoBankVoiceServicesView';
import DemoBankSearchSuiteView from './views/platform/DemoBankSearchSuiteView';
import DemoBankDigitalTwinView from './views/platform/DemoBankDigitalTwinView';
import DemoBankWorkflowEngineView from './views/platform/DemoBankWorkflowEngineView';
import DemoBankObservabilityPlatformView from './views/platform/DemoBankObservabilityPlatformView';
import DemoBankFeatureManagementView from './views/platform/DemoBankFeatureManagementView';
import DemoBankExperimentationPlatformView from './views/platform/DemoBankExperimentationPlatformView';
import DemoBankLocalizationPlatformView from './views/platform/DemoBankLocalizationPlatformView';
import DemoBankFleetManagementView from './views/platform/DemoBankFleetManagementView';
import DemoBankKnowledgeBaseView from './views/platform/DemoBankKnowledgeBaseView';
import DemoBankMediaServicesView from './views/platform/DemoBankMediaServicesView';
import DemoBankEventGridView from './views/platform/DemoBankEventGridView';
import DemoBankApiManagementView from './views/platform/DemoBankApiManagementView';

// Mega Dashboard Views
import AccessControlsView from './views/megadashboard/security/AccessControlsView';
import RoleManagementView from './views/megadashboard/security/RoleManagementView';
import AuditLogsView from './views/megadashboard/security/AuditLogsView';
import FraudDetectionView from './views/megadashboard/security/FraudDetectionView';
import ThreatIntelligenceView from './views/megadashboard/security/ThreatIntelligenceView';
import CardManagementView from './views/megadashboard/finance/CardManagementView';
import LoanApplicationsView from './views/megadashboard/finance/LoanApplicationsView';
import MortgagesView from './views/megadashboard/finance/MortgagesView';
import InsuranceHubView from './views/megadashboard/finance/InsuranceHubView';
import TaxCenterView from './views/megadashboard/finance/TaxCenterView';
import PredictiveModelsView from './views/megadashboard/analytics/PredictiveModelsView';
import RiskScoringView from './views/megadashboard/analytics/RiskScoringView';
import SentimentAnalysisView from './views/megadashboard/analytics/SentimentAnalysisView';
import DataLakesView from './views/megadashboard/analytics/DataLakesView';
import DataCatalogView from './views/megadashboard/analytics/DataCatalogView';
import ClientOnboardingView from './views/megadashboard/userclient/ClientOnboardingView';
import KycAmlView from './views/megadashboard/userclient/KycAmlView';
import UserInsightsView from './views/megadashboard/userclient/UserInsightsView';
import FeedbackHubView from './views/megadashboard/userclient/FeedbackHubView';
import SupportDeskView from './views/megadashboard/userclient/SupportDeskView';
import SandboxView from './views/megadashboard/developer/SandboxView';
import SdkDownloadsView from './views/megadashboard/developer/SdkDownloadsView';
import WebhooksView from './views/megadashboard/developer/WebhooksView';
import CliToolsView from './views/megadashboard/developer/CliToolsView';
import ExtensionsView from './views/megadashboard/developer/ExtensionsView';
import ApiKeysView from './views/megadashboard/developer/ApiKeysView';
import ApiContractsView from './views/developer/ApiContractsView';
import PartnerHubView from './views/megadashboard/ecosystem/PartnerHubView';
import AffiliatesView from './views/megadashboard/ecosystem/AffiliatesView';
import IntegrationsMarketplaceView from './views/megadashboard/ecosystem/IntegrationsMarketplaceView';
import CrossBorderPaymentsView from './views/megadashboard/ecosystem/CrossBorderPaymentsView';
import MultiCurrencyView from './views/megadashboard/ecosystem/MultiCurrencyView';
import NftVaultView from './views/megadashboard/digitalassets/NftVaultView';
import TokenIssuanceView from './views/megadashboard/digitalassets/TokenIssuanceView';
import SmartContractsView from './views/megadashboard/digitalassets/SmartContractsView';
import DaoGovernanceView from './views/megadashboard/digitalassets/DaoGovernanceView';
import OnChainAnalyticsView from './views/megadashboard/digitalassets/OnChainAnalyticsView';
import SalesPipelineView from './views/megadashboard/business/SalesPipelineView';
import MarketingAutomationView from './views/megadashboard/business/MarketingAutomationView';
import GrowthInsightsView from './views/megadashboard/business/GrowthInsightsView';
import CompetitiveIntelligenceView from './views/megadashboard/business/CompetitiveIntelligenceView';
import BenchmarkingView from './views/megadashboard/business/BenchmarkingView';
import LicensingView from './views/megadashboard/regulation/LicensingView';
import DisclosuresView from './views/megadashboard/regulation/DisclosuresView';
import LegalDocsView from './views/megadashboard/regulation/LegalDocsView';
import RegulatorySandboxView from './views/megadashboard/regulation/RegulatorySandboxView';
import ConsentManagementView from './views/megadashboard/regulation/ConsentManagementView';
import ContainerRegistryView from './views/megadashboard/infra/ContainerRegistryView';
import ApiThrottlingView from './views/megadashboard/infra/ApiThrottlingView';
import ObservabilityView from './views/megadashboard/infra/ObservabilityView';
import IncidentResponseView from './views/megadashboard/infra/IncidentResponseView';
import BackupRecoveryView from './views/megadashboard/infra/BackupRecoveryView';

// Blueprint imports
import CrisisAIManagerView from './views/blueprints/CrisisAIManagerView';
import CognitiveLoadBalancerView from './views/blueprints/CognitiveLoadBalancerView';
import HolographicMeetingScribeView from './views/blueprints/HolographicMeetingScribeView';
import QuantumProofEncryptorView from './views/blueprints/QuantumProofEncryptorView';
import EtherealMarketplaceView from './views/blueprints/EtherealMarketplaceView';
import AdaptiveUITailorView from './views/blueprints/AdaptiveUITailorView';
import UrbanSymphonyPlannerView from './views/blueprints/UrbanSymphonyPlannerView';
import PersonalHistorianAIView from './views/blueprints/PersonalHistorianAIView';
import DebateAdversaryView from './views/blueprints/DebateAdversaryView';
import CulturalAssimilationAdvisorView from './views/blueprints/CulturalAssimilationAdvisorView';
import DynamicSoundscapeGeneratorView from './views/blueprints/DynamicSoundscapeGeneratorView';
import EmergentStrategyWargamerView from './views/blueprints/EmergentStrategyWargamerView';
import EthicalGovernorView from './views/blueprints/EthicalGovernorView';
import QuantumEntanglementDebuggerView from './views/blueprints/QuantumEntanglementDebuggerView';
import LinguisticFossilFinderView from './views/blueprints/LinguisticFossilFinderView';
import ChaosTheoristView from './views/blueprints/ChaosTheoristView';
import SelfRewritingCodebaseView from './views/blueprints/SelfRewritingCodebaseView';
import GenerativeJurisprudenceView from './views/blueprints/GenerativeJurisprudenceView';
import AestheticEngineView from './views/blueprints/AestheticEngineView';
import NarrativeForgeView from './views/blueprints/NarrativeForgeView';
import WorldBuilderView from './views/blueprints/WorldBuilderView';
import SonicAlchemyView from './views/blueprints/SonicAlchemyView';
import AutonomousScientistView from './views/blueprints/AutonomousScientistView';
import ZeitgeistEngineView from './views/blueprints/ZeitgeistEngineView';
import CareerTrajectoryView from './views/blueprints/CareerTrajectoryView';
import LudicBalancerView from './views/blueprints/LudicBalancerView';
import HypothesisEngineView from './views/blueprints/HypothesisEngineView';
import LexiconClarifierView from './views/blueprints/LexiconClarifierView';
import CodeArcheologistView from './views/blueprints/CodeArcheologistView';

// Global Components
import VoiceControl from './VoiceControl';
import GlobalChatbot from './GlobalChatbot';

// --- AI & SECURITY CORE ---
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - SECURE VAULT & AI ORCHESTRATOR
 * This is the "Golden Ticket" experience. 
 * We are letting the user "Test Drive" the car.
 * No Citibank names. Only Quantum Financial.
 */

// --- ENCRYPTION UTILITIES (Homomorphic Simulation) ---
const ENCRYPTION_KEY = "QUANTUM_SECURE_INTERNAL_STORAGE_KEY";

const secureStorage = {
    encrypt: (data: string) => {
        // Simulated homomorphic encryption - in a real app, use SubtleCrypto
        const b64 = btoa(data);
        return `ENC_${b64.split('').reverse().join('')}_SIG`;
    },
    decrypt: (cipher: string) => {
        if (!cipher.startsWith('ENC_')) return cipher;
        const raw = cipher.replace('ENC_', '').replace('_SIG', '').split('').reverse().join('');
        return atob(raw);
    },
    save: (key: string, value: any) => {
        const encrypted = secureStorage.encrypt(JSON.stringify(value));
        // Internal App Storage (Ref-based, not localStorage for high security)
        (window as any).__QUANTUM_INTERNAL_STORAGE__ = (window as any).__QUANTUM_INTERNAL_STORAGE__ || {};
        (window as any).__QUANTUM_INTERNAL_STORAGE__[key] = encrypted;
    },
    get: (key: string) => {
        const storage = (window as any).__QUANTUM_INTERNAL_STORAGE__ || {};
        const encrypted = storage[key];
        if (!encrypted) return null;
        return JSON.parse(secureStorage.decrypt(encrypted));
    }
};

// --- AUDIT ENGINE ---
const auditLog = (action: string, details: any, view: string) => {
    const logEntry = {
        timestamp: new Date().toISOString(),
        action,
        details,
        view,
        actor: "DEMO_USER_001",
        integrityHash: btoa(action + Date.now())
    };
    const existingLogs = secureStorage.get('AUDIT_TRAIL') || [];
    secureStorage.save('AUDIT_TRAIL', [...existingLogs, logEntry]);
    console.log(`[AUDIT LOG] ${action} in ${view}`, logEntry);
};

// --- AI CHATBOT COMPONENT (Contextual) ---
const ContextualAI: React.FC<{ activeView: View; onAction: (action: string, payload: any) => void }> = ({ activeView, onAction }) => {
    const [input, setInput] = useState("");
    const [messages, setMessages] = useState<{ role: string; text: string }[]>([
        { role: "system", text: `Welcome to Quantum Financial. I am your AI co-pilot for the ${activeView} module. How can I help you kick the tires today?` }
    ]);
    const [isThinking, setIsThinking] = useState(false);
    const scrollRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        scrollRef.current?.scrollTo(0, scrollRef.current.scrollHeight);
    }, [messages]);

    const handleSend = async () => {
        if (!input.trim()) return;
        const userMsg = input;
        setInput("");
        setMessages(prev => [...prev, { role: "user", text: userMsg }]);
        setIsThinking(true);

        try {
            // Using the provided GEMINI_API_KEY from Vercel Secrets
            const apiKey = process.env.GEMINI_API_KEY || "DEMO_KEY";
            const genAI = new GoogleGenAI(apiKey);
            const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });

            const prompt = `
                You are the Quantum Financial AI Assistant. 
                Current View: ${activeView}.
                User wants: ${userMsg}.
                Context: This is a high-performance business banking demo. 
                Philosophy: "Golden Ticket", "Test Drive", "Bells and Whistles".
                Rules: 
                1. Never mention Citibank. 
                2. Be elite, professional, and secure.
                3. If the user wants to "create" something (a payment, a user, a report), respond with a JSON block starting with { "ACTION": "..." }.
                4. Use car metaphors like "engine roar", "kick the tires".
            `;

            const result = await model.generateContent(prompt);
            const responseText = result.response.text();

            // Check for actions
            if (responseText.includes("{")) {
                try {
                    const jsonMatch = responseText.match(/\{.*\}/s);
                    if (jsonMatch) {
                        const actionData = JSON.parse(jsonMatch[0]);
                        onAction(actionData.ACTION, actionData);
                        auditLog("AI_TRIGGERED_ACTION", actionData, activeView);
                    }
                } catch (e) {
                    console.error("AI Action Parse Error", e);
                }
            }

            setMessages(prev => [...prev, { role: "assistant", text: responseText.replace(/\{.*\}/s, "").trim() }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: "assistant", text: "The engine stalled for a second. Let's try that again. (API Key required for full AI roar)" }]);
        } finally {
            setIsThinking(false);
        }
    };

    return (
        <div className="fixed bottom-6 right-6 w-96 h-[500px] bg-gray-900/95 border border-cyan-500/30 rounded-2xl shadow-2xl flex flex-col overflow-hidden z-50 backdrop-blur-xl">
            <div className="p-4 bg-cyan-500/10 border-b border-cyan-500/20 flex justify-between items-center">
                <div className="flex items-center gap-2">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                    <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">Quantum AI Co-Pilot</span>
                </div>
                <span className="text-[10px] text-gray-500 uppercase">{activeView}</span>
            </div>
            <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
                {messages.map((m, i) => (
                    <div key={i} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3 rounded-xl text-sm ${m.role === 'user' ? 'bg-cyan-600 text-white' : 'bg-gray-800 text-gray-300 border border-gray-700'}`}>
                            {m.text}
                        </div>
                    </div>
                ))}
                {isThinking && <div className="text-xs text-cyan-500 animate-pulse">Quantum engine processing...</div>}
            </div>
            <div className="p-4 border-t border-gray-800 bg-gray-950/50">
                <div className="relative">
                    <input 
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                        placeholder="Command the platform..."
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 text-sm focus:outline-none focus:border-cyan-500 transition-colors"
                    />
                    <button onClick={handleSend} className="absolute right-2 top-1.5 text-cyan-500 hover:text-cyan-400">
                        <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                    </button>
                </div>
            </div>
        </div>
    );
};

// --- STRIPE SIMULATOR ---
const StripeSimulator: React.FC<{ isOpen: boolean; onClose: () => void; amount: number }> = ({ isOpen, onClose, amount }) => {
    const [step, setStep] = useState(1);
    if (!isOpen) return null;

    const handlePay = () => {
        setStep(2);
        auditLog("STRIPE_PAYMENT_INITIATED", { amount, currency: 'USD' }, "StripeModal");
        setTimeout(() => {
            setStep(3);
            auditLog("STRIPE_PAYMENT_SUCCESS", { amount, txId: 'TX_'+Math.random().toString(36).substr(2,9) }, "StripeModal");
        }, 2000);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
            <div className="bg-white text-gray-900 w-full max-w-md rounded-2xl overflow-hidden shadow-2xl">
                <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                    <h2 className="text-xl font-bold text-indigo-600">Quantum Pay <span className="text-gray-400 font-normal">| Powered by Stripe</span></h2>
                    <button onClick={onClose} className="text-gray-400 hover:text-gray-600">✕</button>
                </div>
                <div className="p-8">
                    {step === 1 && (
                        <div className="space-y-6">
                            <div className="text-center">
                                <p className="text-sm text-gray-500 uppercase tracking-widest">Total Amount</p>
                                <h3 className="text-4xl font-black text-gray-900">${amount.toLocaleString()}</h3>
                            </div>
                            <div className="space-y-4">
                                <div className="border rounded-lg p-3 focus-within:ring-2 ring-indigo-500 transition-all">
                                    <label className="block text-[10px] uppercase font-bold text-gray-400">Card Number</label>
                                    <input className="w-full outline-none text-lg" placeholder="4242 4242 4242 4242" />
                                </div>
                                <div className="flex gap-4">
                                    <div className="flex-1 border rounded-lg p-3">
                                        <label className="block text-[10px] uppercase font-bold text-gray-400">Expiry</label>
                                        <input className="w-full outline-none" placeholder="MM/YY" />
                                    </div>
                                    <div className="flex-1 border rounded-lg p-3">
                                        <label className="block text-[10px] uppercase font-bold text-gray-400">CVC</label>
                                        <input className="w-full outline-none" placeholder="123" />
                                    </div>
                                </div>
                            </div>
                            <button onClick={handlePay} className="w-full bg-indigo-600 text-white py-4 rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200">
                                Secure Payment
                            </button>
                        </div>
                    )}
                    {step === 2 && (
                        <div className="py-12 text-center space-y-4">
                            <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto"></div>
                            <p className="font-medium text-gray-600">Verifying with Quantum Secure...</p>
                        </div>
                    )}
                    {step === 3 && (
                        <div className="py-12 text-center space-y-6">
                            <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto">
                                <svg className="w-10 h-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                            </div>
                            <div>
                                <h3 className="text-2xl font-bold">Payment Successful</h3>
                                <p className="text-gray-500">Transaction logged in Audit Storage</p>
                            </div>
                            <button onClick={onClose} className="w-full border-2 border-gray-200 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all">
                                Return to Dashboard
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

/**
 * MAIN APPLICATION COMPONENT
 */
const SApp: React.FC = () => {
    const [activeView, setActiveView] = useState<View>(View.MetaDashboard);
    const [isSidebarOpen, setIsSidebarOpen] = useState(false);
    const [previousView, setPreviousView] = useState<View | null>(null);
    const dataContext = useContext(DataContext);

    const [modalView, setModalView] = useState<View | null>(null);
    const [modalPreviousView, setModalPreviousView] = useState<View | null>(null);

    // Stripe State
    const [isStripeOpen, setIsStripeOpen] = useState(false);
    const [stripeAmount, setStripeAmount] = useState(0);

    // Audit Log State (for UI display if needed)
    const [logs, setLogs] = useState<any[]>([]);

    useEffect(() => {
        // Initial Audit
        auditLog("SESSION_START", { userAgent: navigator.userAgent }, "Root");
        // Load logs
        setLogs(secureStorage.get('AUDIT_TRAIL') || []);
    }, []);

    const openModal = (view: View) => {
        setModalPreviousView(activeView);
        setModalView(view);
        auditLog("MODAL_OPEN", { view }, activeView);
    };

    const closeModal = () => {
        setModalView(null);
        auditLog("MODAL_CLOSE", {}, activeView);
    };

    if (!dataContext) {
        throw new Error("App must be used within a DataProvider");
    }

    const { customBackgroundUrl, activeIllusion, isLoading, error } = dataContext;

    const handleSetView = (view: View) => {
        if (view !== activeView) {
            auditLog("VIEW_CHANGE", { from: activeView, to: view }, activeView);
            setPreviousView(activeView);
            setActiveView(view);
            if (window.innerWidth < 1024) {
                setIsSidebarOpen(false);
            }
        }
    };

    const handleAIAction = (action: string, payload: any) => {
        console.log("AI ACTION RECEIVED:", action, payload);
        if (action === "NAVIGATE") {
            const targetView = payload.VIEW as View;
            if (targetView) handleSetView(targetView);
        }
        if (action === "PAYMENT") {
            setStripeAmount(payload.AMOUNT || 5000);
            setIsStripeOpen(true);
        }
        if (action === "LOG_AUDIT") {
            auditLog("AI_MANUAL_LOG", payload.DATA, activeView);
        }
    };
    
    if (error) {
        return (
           <div className="fixed inset-0 bg-gray-950 z-50 flex items-center justify-center p-4">
               <div className="bg-gray-900 border border-red-700 rounded-xl p-8 max-w-lg text-center">
                   <h1 className="text-2xl font-bold text-red-400 mb-4">Quantum Core Disconnected</h1>
                   <p className="text-gray-400 mb-6">{error}</p>
                   <p className="text-xs text-gray-500">The engine is cooling down. Please check your connection to the Quantum Financial servers.</p>
               </div>
           </div>
       );
   }
    
    const renderView = () => {
        if (isLoading && dataContext.transactions.length === 0) {
            return (
                <div className="flex flex-col items-center justify-center h-full space-y-4">
                    <div className="w-24 h-24 border-4 border-cyan-400 border-dashed rounded-full animate-spin"></div>
                    <p className="text-cyan-400 font-mono animate-pulse uppercase tracking-widest">Igniting Quantum Engines...</p>
                </div>
            );
        }

        if (activeView.startsWith('article-')) {
            const articleNumber = parseInt(activeView.replace('article-', ''), 10);
            return <FeatureGuard view={activeView}><ConstitutionalArticleView articleNumber={articleNumber} /></FeatureGuard>;
        }
        
        switch (activeView) {
            case View.MetaDashboard: return <MetaDashboardView openModal={openModal} />;
            case View.AgentMarketplace: return <FeatureGuard view={View.AgentMarketplace}><AgentMarketplaceView /></FeatureGuard>;
            case View.Orchestration: return <FeatureGuard view={View.Orchestration}><OrchestrationView /></FeatureGuard>;
            case View.DataMesh: return <FeatureGuard view={View.DataMesh}><DataMeshView /></FeatureGuard>;
            case View.DataCommons: return <FeatureGuard view={View.DataCommons}><DataCommonsView /></FeatureGuard>;
            case View.Mainframe: return <FeatureGuard view={View.Mainframe}><MainframeView /></FeatureGuard>;
            case View.AIGovernance: return <FeatureGuard view={View.AIGovernance}><AIGovernanceView /></FeatureGuard>;
            case View.AIRiskRegistry: return <FeatureGuard view={View.AIRiskRegistry}><AIRiskRegistryView /></FeatureGuard>;
            case View.OSPO: return <FeatureGuard view={View.OSPO}><OSPOView /></FeatureGuard>;
            case View.CiCd: return <FeatureGuard view={View.CiCd}><CiCdView /></FeatureGuard>;
            case View.Inventions: return <FeatureGuard view={View.Inventions}><InventionsView /></FeatureGuard>;
            case View.Roadmap: return <FeatureGuard view={View.Roadmap}><RoadmapView /></FeatureGuard>;
            case View.Connect: return <FeatureGuard view={View.Connect}><ConnectView /></FeatureGuard>;
            case View.EconomicSynthesisEngine: return <FeatureGuard view={View.EconomicSynthesisEngine}><EconomicSynthesisEngineView /></FeatureGuard>;
            case View.Dashboard: return <FeatureGuard view={View.Dashboard}><DashboardView setActiveView={handleSetView}/></FeatureGuard>;
            case View.Transactions: return <FeatureGuard view={View.Transactions}><TransactionsView /></FeatureGuard>;
            case View.SendMoney: return <FeatureGuard view={View.SendMoney}><SendMoneyView setActiveView={handleSetView} /></FeatureGuard>;
            case View.Budgets: return <FeatureGuard view={View.Budgets}><BudgetsView /></FeatureGuard>;
            case View.Investments: return <FeatureGuard view={View.Investments}><InvestmentsView /></FeatureGuard>;
            case View.PortfolioExplorer: return <FeatureGuard view={View.PortfolioExplorer}><PortfolioExplorerView /></FeatureGuard>;
            case View.Crypto: return <FeatureGuard view={View.Crypto}><CryptoView /></FeatureGuard>;
            case View.FinancialGoals: return <FeatureGuard view={View.FinancialGoals}><FinancialGoalsView /></FeatureGuard>;
            case View.Marketplace: return <FeatureGuard view={View.Marketplace}><MarketplaceView /></FeatureGuard>;
            case View.Personalization: return <FeatureGuard view={View.Personalization}><PersonalizationView /></FeatureGuard>;
            case View.CardCustomization: return <FeatureGuard view={View.CardCustomization}><CardCustomizationView /></FeatureGuard>;
            case View.RewardsHub: return <FeatureGuard view={View.RewardsHub}><RewardsHubView /></FeatureGuard>;
            case View.CreditHealth: return <FeatureGuard view={View.CreditHealth}><CreditHealthView /></FeatureGuard>;
            case View.Security: return <FeatureGuard view={View.Security}><SecurityView /></FeatureGuard>;
            case View.OpenBanking: return <FeatureGuard view={View.OpenBanking}><OpenBankingView /></FeatureGuard>;
            case View.Settings: return <FeatureGuard view={View.Settings}><SettingsView /></FeatureGuard>;
            case View.TheNexus: return <FeatureGuard view={View.TheNexus}><TheNexusView /></FeatureGuard>;
            case View.AIAdvisor: return <FeatureGuard view={View.AIAdvisor}><AIAdvisorView previousView={previousView} /></FeatureGuard>;
            case View.QuantumWeaver: return <FeatureGuard view={View.QuantumWeaver}><QuantumWeaverView /></FeatureGuard>;
            case View.QuantumOracle: return <FeatureGuard view={View.QuantumOracle}><QuantumOracleView /></FeatureGuard>;
            case View.AIAdStudio: return <FeatureGuard view={View.AIAdStudio}><AIAdStudioView /></FeatureGuard>;
            case View.TheWinningVision: return <FeatureGuard view={View.TheWinningVision}><TheVisionView /></FeatureGuard>;
            case View.APIStatus: return <FeatureGuard view={View.APIStatus}><APIStatusView /></FeatureGuard>;
            case View.CorporateDashboard: return <FeatureGuard view={View.CorporateDashboard}><CorporateDashboardView setActiveView={handleSetView} /></FeatureGuard>;
            case View.PaymentOrders: return <FeatureGuard view={View.PaymentOrders}><PaymentOrdersView /></FeatureGuard>;
            case View.Counterparties: return <FeatureGuard view={View.Counterparties}><CounterpartiesView /></FeatureGuard>;
            case View.Invoices: return <FeatureGuard view={View.Invoices}><InvoicesView /></FeatureGuard>;
            case View.Compliance: return <FeatureGuard view={View.Compliance}><ComplianceView /></FeatureGuard>;
            case View.AnomalyDetection: return <FeatureGuard view={View.AnomalyDetection}><AnomalyDetectionView /></FeatureGuard>;
            case View.Payroll: return <FeatureGuard view={View.Payroll}><PayrollView /></FeatureGuard>;
            case View.DemoBankSocial: return <FeatureGuard view={View.DemoBankSocial}><DemoBankSocialView /></FeatureGuard>;
            case View.DemoBankERP: return <FeatureGuard view={View.DemoBankERP}><DemoBankERPView /></FeatureGuard>;
            case View.DemoBankCRM: return <FeatureGuard view={View.DemoBankCRM}><DemoBankCRMView /></FeatureGuard>;
            case View.DemoBankAPIGateway: return <FeatureGuard view={View.DemoBankAPIGateway}><DemoBankAPIGatewayView /></FeatureGuard>;
            case View.DemoBankGraphExplorer: return <FeatureGuard view={View.DemoBankGraphExplorer}><DemoBankGraphExplorerView /></FeatureGuard>;
            case View.DemoBankDBQL: return <FeatureGuard view={View.DemoBankDBQL}><DemoBankDBQLView /></FeatureGuard>;
            case View.DemoBankCloud: return <FeatureGuard view={View.DemoBankCloud}><DemoBankCloudView /></FeatureGuard>;
            case View.DemoBankIdentity: return <FeatureGuard view={View.DemoBankIdentity}><DemoBankIdentityView /></FeatureGuard>;
            case View.DemoBankStorage: return <FeatureGuard view={View.DemoBankStorage}><DemoBankStorageView /></FeatureGuard>;
            case View.DemoBankCompute: return <FeatureGuard view={View.DemoBankCompute}><DemoBankComputerView /></FeatureGuard>;
            case View.DemoBankAIPlatform: return <FeatureGuard view={View.DemoBankAIPlatform}><DemoBankAIPlatformView /></FeatureGuard>;
            case View.DemoBankMachineLearning: return <FeatureGuard view={View.DemoBankMachineLearning}><DemoBankMachineLearningView /></FeatureGuard>;
            case View.DemoBankDevOps: return <FeatureGuard view={View.DemoBankDevOps}><DemoBankDevOpsView /></FeatureGuard>;
            case View.DemoBankSecurityCenter: return <FeatureGuard view={View.DemoBankSecurityCenter}><DemoBankSecurityCenterView /></FeatureGuard>;
            case View.DemoBankComplianceHub: return <FeatureGuard view={View.DemoBankComplianceHub}><DemoBankComplianceHubView /></FeatureGuard>;
            case View.DemoBankAppMarketplace: return <FeatureGuard view={View.DemoBankAppMarketplace}><DemoBankAppMarketplaceView /></FeatureGuard>;
            case View.DemoBankEvents: return <FeatureGuard view={View.DemoBankEvents}><DemoBankEventsView /></FeatureGuard>;
            case View.DemoBankLogicApps: return <FeatureGuard view={View.DemoBankLogicApps}><DemoBankLogicAppsView /></FeatureGuard>;
            case View.DemoBankFunctions: return <FeatureGuard view={View.DemoBankFunctions}><DemoBankFunctionsView /></FeatureGuard>;
            case View.DemoBankDataFactory: return <FeatureGuard view={View.DemoBankDataFactory}><DemoBankDataFactoryView /></FeatureGuard>;
            case View.DemoBankAnalytics: return <FeatureGuard view={View.DemoBankAnalytics}><DemoBankAnalyticsView /></FeatureGuard>;
            case View.DemoBankBI: return <FeatureGuard view={View.DemoBankBI}><DemoBankBIView /></FeatureGuard>;
            case View.DemoBankIoTHub: return <FeatureGuard view={View.DemoBankIoTHub}><DemoBankIoTHubView /></FeatureGuard>;
            case View.DemoBankMaps: return <FeatureGuard view={View.DemoBankMaps}><DemoBankMapsView /></FeatureGuard>;
            case View.DemoBankCommunications: return <FeatureGuard view={View.DemoBankCommunications}><DemoBankCommunicationsView /></FeatureGuard>;
            case View.DemoBankCommerce: return <FeatureGuard view={View.DemoBankCommerce}><DemoBankCommerceView /></FeatureGuard>;
            case View.DemoBankTeams: return <FeatureGuard view={View.DemoBankTeams}><DemoBankTeamsView /></FeatureGuard>;
            case View.DemoBankCMS: return <FeatureGuard view={View.DemoBankCMS}><DemoBankCMSView /></FeatureGuard>;
            case View.DemoBankLMS: return <FeatureGuard view={View.DemoBankLMS}><DemoBankLMSView /></FeatureGuard>;
            case View.DemoBankHRIS: return <FeatureGuard view={View.DemoBankHRIS}><DemoBankHRISView /></FeatureGuard>;
            case View.DemoBankProjects: return <FeatureGuard view={View.DemoBankProjects}><DemoBankProjectsView /></FeatureGuard>;
            case View.DemoBankLegalSuite: return <FeatureGuard view={View.DemoBankLegalSuite}><DemoBankLegalSuiteView /></FeatureGuard>;
            case View.DemoBankSupplyChain: return <FeatureGuard view={View.DemoBankSupplyChain}><DemoBankSupplyChainView /></FeatureGuard>;
            case View.DemoBankPropTech: return <FeatureGuard view={View.DemoBankPropTech}><DemoBankPropTechView /></FeatureGuard>;
            case View.DemoBankGamingServices: return <FeatureGuard view={View.DemoBankGamingServices}><DemoBankGamingServicesView /></FeatureGuard>;
            case View.DemoBankBookings: return <FeatureGuard view={View.DemoBankBookings}><DemoBankBookingsView /></FeatureGuard>;
            case View.DemoBankCDP: return <FeatureGuard view={View.DemoBankCDP}><DemoBankCDPView /></FeatureGuard>;
            case View.DemoBankQuantumServices: return <FeatureGuard view={View.DemoBankQuantumServices}><DemoBankQuantumServicesView /></FeatureGuard>;
            case View.DemoBankBlockchain: return <FeatureGuard view={View.DemoBankBlockchain}><DemoBankBlockchainView /></FeatureGuard>;
            case View.DemoBankGIS: return <FeatureGuard view={View.DemoBankGIS}><DemoBankGISView /></FeatureGuard>;
            case View.DemoBankRobotics: return <FeatureGuard view={View.DemoBankRobotics}><DemoBankRoboticsView /></FeatureGuard>;
            case View.DemoBankSimulations: return <FeatureGuard view={View.DemoBankSimulations}><DemoBankSimulationsView /></FeatureGuard>;
            case View.DemoBankVoiceServices: return <FeatureGuard view={View.DemoBankVoiceServices}><DemoBankVoiceServicesView /></FeatureGuard>;
            case View.DemoBankSearchSuite: return <FeatureGuard view={View.DemoBankSearchSuite}><DemoBankSearchSuiteView /></FeatureGuard>;
            case View.DemoBankDigitalTwin: return <FeatureGuard view={View.DemoBankDigitalTwin}><DemoBankDigitalTwinView /></FeatureGuard>;
            case View.DemoBankWorkflowEngine: return <FeatureGuard view={View.DemoBankWorkflowEngine}><DemoBankWorkflowEngineView /></FeatureGuard>;
            case View.DemoBankObservabilityPlatform: return <FeatureGuard view={View.DemoBankObservabilityPlatform}><DemoBankObservabilityPlatformView /></FeatureGuard>;
            case View.DemoBankFeatureManagement: return <FeatureGuard view={View.DemoBankFeatureManagement}><DemoBankFeatureManagementView /></FeatureGuard>;
            case View.DemoBankExperimentationPlatform: return <FeatureGuard view={View.DemoBankExperimentationPlatform}><DemoBankExperimentationPlatformView /></FeatureGuard>;
            case View.DemoBankLocalizationPlatform: return <FeatureGuard view={View.DemoBankLocalizationPlatform}><DemoBankLocalizationPlatformView /></FeatureGuard>;
            case View.DemoBankFleetManagement: return <FeatureGuard view={View.DemoBankFleetManagement}><DemoBankFleetManagementView /></FeatureGuard>;
            case View.DemoBankKnowledgeBase: return <FeatureGuard view={View.DemoBankKnowledgeBase}><DemoBankKnowledgeBaseView /></FeatureGuard>;
            case View.DemoBankMediaServices: return <FeatureGuard view={View.DemoBankMediaServices}><DemoBankMediaServicesView /></FeatureGuard>;
            case View.DemoBankEventGrid: return <FeatureGuard view={View.DemoBankEventGrid}><DemoBankEventGridView /></FeatureGuard>;
            case View.DemoBankApiManagement: return <FeatureGuard view={View.DemoBankApiManagement}><DemoBankApiManagementView /></FeatureGuard>;
            case View.SecurityAccessControls: return <FeatureGuard view={View.SecurityAccessControls}><AccessControlsView /></FeatureGuard>;
            case View.SecurityRoleManagement: return <FeatureGuard view={View.SecurityRoleManagement}><RoleManagementView /></FeatureGuard>;
            case View.SecurityAuditLogs: return <FeatureGuard view={View.SecurityAuditLogs}><AuditLogsView /></FeatureGuard>;
            case View.SecurityFraudDetection: return <FeatureGuard view={View.SecurityFraudDetection}><FraudDetectionView /></FeatureGuard>;
            case View.SecurityThreatIntelligence: return <FeatureGuard view={View.SecurityThreatIntelligence}><ThreatIntelligenceView /></FeatureGuard>;
            case View.FinanceCardManagement: return <FeatureGuard view={View.FinanceCardManagement}><CardManagementView /></FeatureGuard>;
            case View.FinanceLoanApplications: return <FeatureGuard view={View.FinanceLoanApplications}><LoanApplicationsView /></FeatureGuard>;
            case View.FinanceMortgages: return <FeatureGuard view={View.FinanceMortgages}><MortgagesView /></FeatureGuard>;
            case View.FinanceInsuranceHub: return <FeatureGuard view={View.FinanceInsuranceHub}><InsuranceHubView /></FeatureGuard>;
            case View.FinanceTaxCenter: return <FeatureGuard view={View.FinanceTaxCenter}><TaxCenterView /></FeatureGuard>;
            case View.AnalyticsPredictiveModels: return <FeatureGuard view={View.AnalyticsPredictiveModels}><PredictiveModelsView /></FeatureGuard>;
            case View.AnalyticsRiskScoring: return <FeatureGuard view={View.AnalyticsRiskScoring}><RiskScoringView /></FeatureGuard>;
            case View.AnalyticsSentimentAnalysis: return <FeatureGuard view={View.AnalyticsSentimentAnalysis}><SentimentAnalysisView /></FeatureGuard>;
            case View.AnalyticsDataLakes: return <FeatureGuard view={View.AnalyticsDataLakes}><DataLakesView /></FeatureGuard>;
            case View.AnalyticsDataCatalog: return <FeatureGuard view={View.AnalyticsDataCatalog}><DataCatalogView /></FeatureGuard>;
            case View.UserClientOnboarding: return <FeatureGuard view={View.UserClientOnboarding}><ClientOnboardingView /></FeatureGuard>;
            case View.UserClientKycAml: return <FeatureGuard view={View.UserClientKycAml}><KycAmlView /></FeatureGuard>;
            case View.UserClientUserInsights: return <FeatureGuard view={View.UserClientUserInsights}><UserInsightsView /></FeatureGuard>;
            case View.UserClientFeedbackHub: return <FeatureGuard view={View.UserClientFeedbackHub}><FeedbackHubView /></FeatureGuard>;
            case View.UserClientSupportDesk: return <FeatureGuard view={View.UserClientSupportDesk}><SupportDeskView /></FeatureGuard>;
            case View.DeveloperSandbox: return <FeatureGuard view={View.DeveloperSandbox}><SandboxView /></FeatureGuard>;
            case View.DeveloperSdkDownloads: return <FeatureGuard view={View.DeveloperSdkDownloads}><SdkDownloadsView /></FeatureGuard>;
            case View.DeveloperWebhooks: return <FeatureGuard view={View.DeveloperWebhooks}><WebhooksView /></FeatureGuard>;
            case View.DeveloperCliTools: return <FeatureGuard view={View.DeveloperCliTools}><CliToolsView /></FeatureGuard>;
            case View.DeveloperExtensions: return <FeatureGuard view={View.DeveloperExtensions}><ExtensionsView /></FeatureGuard>;
            case View.DeveloperApiKeys: return <FeatureGuard view={View.DeveloperApiKeys}><ApiKeysView /></FeatureGuard>;
            case View.DeveloperApiContracts: return <FeatureGuard view={View.DeveloperApiContracts}><ApiContractsView /></FeatureGuard>;
            case View.EcosystemPartnerHub: return <FeatureGuard view={View.EcosystemPartnerHub}><PartnerHubView /></FeatureGuard>;
            case View.EcosystemAffiliates: return <FeatureGuard view={View.EcosystemAffiliates}><AffiliatesView /></FeatureGuard>;
            case View.EcosystemIntegrationsMarketplace: return <FeatureGuard view={View.EcosystemIntegrationsMarketplace}><IntegrationsMarketplaceView /></FeatureGuard>;
            case View.EcosystemCrossBorderPayments: return <FeatureGuard view={View.EcosystemCrossBorderPayments}><CrossBorderPaymentsView /></FeatureGuard>;
            case View.EcosystemMultiCurrency: return <FeatureGuard view={View.EcosystemMultiCurrency}><MultiCurrencyView /></FeatureGuard>;
            case View.DigitalAssetsNftVault: return <FeatureGuard view={View.DigitalAssetsNftVault}><NftVaultView /></FeatureGuard>;
            case View.DigitalAssetsTokenIssuance: return <FeatureGuard view={View.DigitalAssetsTokenIssuance}><TokenIssuanceView /></FeatureGuard>;
            case View.DigitalAssetsSmartContracts: return <FeatureGuard view={View.DigitalAssetsSmartContracts}><SmartContractsView /></FeatureGuard>;
            case View.DigitalAssetsDaoGovernance: return <FeatureGuard view={View.DigitalAssetsDaoGovernance}><DaoGovernanceView /></FeatureGuard>;
            case View.DigitalAssetsOnChainAnalytics: return <FeatureGuard view={View.DigitalAssetsOnChainAnalytics}><OnChainAnalyticsView /></FeatureGuard>;
            case View.BusinessSalesPipeline: return <FeatureGuard view={View.BusinessSalesPipeline}><SalesPipelineView /></FeatureGuard>;
            case View.BusinessMarketingAutomation: return <FeatureGuard view={View.BusinessMarketingAutomation}><MarketingAutomationView /></FeatureGuard>;
            case View.BusinessGrowthInsights: return <FeatureGuard view={View.BusinessGrowthInsights}><GrowthInsightsView /></FeatureGuard>;
            case View.BusinessCompetitiveIntelligence: return <FeatureGuard view={View.BusinessCompetitiveIntelligence}><CompetitiveIntelligenceView /></FeatureGuard>;
            case View.BusinessBenchmarking: return <FeatureGuard view={View.BusinessBenchmarking}><BenchmarkingView /></FeatureGuard>;
            case View.RegulationLicensing: return <FeatureGuard view={View.RegulationLicensing}><LicensingView /></FeatureGuard>;
            case View.RegulationDisclosures: return <FeatureGuard view={View.RegulationDisclosures}><DisclosuresView /></FeatureGuard>;
            case View.RegulationLegalDocs: return <FeatureGuard view={View.RegulationLegalDocs}><LegalDocsView /></FeatureGuard>;
            case View.RegulationRegulatorySandbox: return <FeatureGuard view={View.RegulationRegulatorySandbox}><RegulatorySandboxView /></FeatureGuard>;
            case View.RegulationConsentManagement: return <FeatureGuard view={View.RegulationConsentManagement}><ConsentManagementView /></FeatureGuard>;
            case View.InfraContainerRegistry: return <FeatureGuard view={View.InfraContainerRegistry}><ContainerRegistryView /></FeatureGuard>;
            case View.InfraApiThrottling: return <FeatureGuard view={View.InfraApiThrottling}><ApiThrottlingView /></FeatureGuard>;
            case View.InfraObservability: return <FeatureGuard view={View.InfraObservability}><ObservabilityView /></FeatureGuard>;
            case View.InfraIncidentResponse: return <FeatureGuard view={View.InfraIncidentResponse}><IncidentResponseView /></FeatureGuard>;
            case View.InfraBackupRecovery: return <FeatureGuard view={View.InfraBackupRecovery}><BackupRecoveryView /></FeatureGuard>;
            case View.CrisisAIManager: return <FeatureGuard view={View.CrisisAIManager}><CrisisAIManagerView /></FeatureGuard>;
            case View.CognitiveLoadBalancer: return <FeatureGuard view={View.CognitiveLoadBalancer}><CognitiveLoadBalancerView /></FeatureGuard>;
            case View.HolographicMeetingScribe: return <FeatureGuard view={View.HolographicMeetingScribe}><HolographicMeetingScribeView /></FeatureGuard>;
            case View.QuantumProofEncryptor: return <FeatureGuard view={View.QuantumProofEncryptor}><QuantumProofEncryptorView /></FeatureGuard>;
            case View.EtherealMarketplace: return <FeatureGuard view={View.EtherealMarketplace}><EtherealMarketplaceView /></FeatureGuard>;
            case View.AdaptiveUITailor: return <FeatureGuard view={View.AdaptiveUITailor}><AdaptiveUITailorView /></FeatureGuard>;
            case View.UrbanSymphonyPlanner: return <FeatureGuard view={View.UrbanSymphonyPlanner}><UrbanSymphonyPlannerView /></FeatureGuard>;
            case View.PersonalHistorianAI: return <FeatureGuard view={View.PersonalHistorianAI}><PersonalHistorianAIView /></FeatureGuard>;
            case View.DebateAdversary: return <FeatureGuard view={View.DebateAdversary}><DebateAdversaryView /></FeatureGuard>;
            case View.CulturalAssimilationAdvisor: return <FeatureGuard view={View.CulturalAssimilationAdvisor}><CulturalAssimilationAdvisorView /></FeatureGuard>;
            case View.DynamicSoundscapeGenerator: return <FeatureGuard view={View.DynamicSoundscapeGenerator}><DynamicSoundscapeGeneratorView /></FeatureGuard>;
            case View.EmergentStrategyWargamer: return <FeatureGuard view={View.EmergentStrategyWargamer}><EmergentStrategyWargamerView /></FeatureGuard>;
            case View.EthicalGovernor: return <FeatureGuard view={View.EthicalGovernor}><EthicalGovernorView /></FeatureGuard>;
            case View.QuantumEntanglementDebugger: return <FeatureGuard view={View.QuantumEntanglementDebugger}><QuantumEntanglementDebuggerView /></FeatureGuard>;
            case View.LinguisticFossilFinder: return <FeatureGuard view={View.LinguisticFossilFinder}><LinguisticFossilFinderView /></FeatureGuard>;
            case View.ChaosTheorist: return <FeatureGuard view={View.ChaosTheorist}><ChaosTheoristView /></FeatureGuard>;
            case View.SelfRewritingCodebase: return <FeatureGuard view={View.SelfRewritingCodebase}><SelfRewritingCodebaseView /></FeatureGuard>;
            case View.GenerativeJurisprudence: return <FeatureGuard view={View.GenerativeJurisprudence}><GenerativeJurisprudenceView /></FeatureGuard>;
            case View.AestheticEngine: return <FeatureGuard view={View.AestheticEngine}><AestheticEngineView /></FeatureGuard>;
            case View.NarrativeForge: return <FeatureGuard view={View.NarrativeForge}><NarrativeForgeView /></FeatureGuard>;
            case View.WorldBuilder: return <FeatureGuard view={View.WorldBuilder}><WorldBuilderView /></FeatureGuard>;
            case View.SonicAlchemy: return <FeatureGuard view={View.SonicAlchemy}><SonicAlchemyView /></FeatureGuard>;
            case View.AutonomousScientist: return <FeatureGuard view={View.AutonomousScientist}><AutonomousScientistView /></FeatureGuard>;
            case View.ZeitgeistEngine: return <FeatureGuard view={View.ZeitgeistEngine}><ZeitgeistEngineView /></FeatureGuard>;
            case View.CareerTrajectory: return <FeatureGuard view={View.CareerTrajectory}><CareerTrajectoryView /></FeatureGuard>;
            case View.LudicBalancer: return <FeatureGuard view={View.LudicBalancer}><LudicBalancerView /></FeatureGuard>;
            case View.HypothesisEngine: return <FeatureGuard view={View.HypothesisEngine}><HypothesisEngineView /></FeatureGuard>;
            case View.LexiconClarifier: return <FeatureGuard view={View.LexiconClarifier}><LexiconClarifierView /></FeatureGuard>;
            case View.CodeArcheologist: return <FeatureGuard view={View.CodeArcheologist}><CodeArcheologistView /></FeatureGuard>;
            case View.TheCharter: return <FeatureGuard view={View.TheCharter}><TheCharterView /></FeatureGuard>;
            case View.FractionalReserve: return <FeatureGuard view={View.FractionalReserve}><FractionalReserveView /></FeatureGuard>;
            case View.FinancialInstrumentForge: return <FeatureGuard view={View.FinancialInstrumentForge}><FinancialInstrumentForgeView /></FeatureGuard>;
            default: return <MetaDashboardView openModal={openModal} />;
        }
    };

    const backgroundStyle = {
        backgroundImage: customBackgroundUrl ? `url(${customBackgroundUrl})` : 'none',
        backgroundSize: 'cover',
        backgroundPosition: 'center',
        backgroundAttachment: 'fixed',
    };

    const IllusionLayer = () => {
        if (!activeIllusion || activeIllusion === 'none') return null;
        return <div className={`absolute inset-0 z-0 ${activeIllusion}-illusion`}></div>
    };

    return (
        <div className="relative min-h-screen bg-gray-950 text-gray-300 font-sans selection:bg-cyan-500/30" style={backgroundStyle}>
            <IllusionLayer />
             <div className="relative z-10 flex min-h-screen bg-transparent">
                <Sidebar activeView={activeView} setActiveView={handleSetView} isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
                <div className="flex-1 flex flex-col lg:ml-64">
                    <Header onMenuClick={() => setIsSidebarOpen(!isSidebarOpen)} setActiveView={handleSetView} />
                    <main className="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8 relative">
                        {/* View Header with Audit Status */}
                        <div className="mb-8 flex justify-between items-end">
                            <div>
                                <h1 className="text-3xl font-black text-white tracking-tighter uppercase italic">
                                    {activeView.replace(/([A-Z])/g, ' $1').trim()}
                                </h1>
                                <p className="text-xs text-cyan-500 font-mono mt-1">SECURE_SESSION_ID: {Math.random().toString(36).substr(2, 12).toUpperCase()}</p>
                            </div>
                            <div className="hidden md:flex gap-4">
                                <div className="bg-gray-900/50 border border-gray-800 px-4 py-2 rounded-lg">
                                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Audit Integrity</span>
                                    <span className="text-green-400 text-xs font-mono">VERIFIED_OK</span>
                                </div>
                                <div className="bg-gray-900/50 border border-gray-800 px-4 py-2 rounded-lg">
                                    <span className="block text-[10px] text-gray-500 uppercase font-bold">Quantum Engine</span>
                                    <span className="text-cyan-400 text-xs font-mono">OPTIMIZED</span>
                                </div>
                            </div>
                        </div>

                        {renderView()}

                        {/* Audit Trail Mini-Viewer */}
                        <div className="mt-12 pt-8 border-t border-gray-900">
                            <h3 className="text-xs font-bold text-gray-600 uppercase tracking-widest mb-4">Live Audit Storage (Encrypted)</h3>
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                {logs.slice(-3).reverse().map((log, i) => (
                                    <div key={i} className="bg-gray-900/30 border border-gray-800 p-3 rounded-lg font-mono text-[10px]">
                                        <div className="flex justify-between text-gray-500 mb-1">
                                            <span>{log.timestamp}</span>
                                            <span className="text-cyan-900">{log.integrityHash.substr(0,8)}</span>
                                        </div>
                                        <div className="text-gray-300 font-bold">{log.action}</div>
                                        <div className="text-gray-600 truncate">{JSON.stringify(log.details)}</div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </main>
                </div>
                
                <VoiceControl setActiveView={handleSetView} />
                
                {/* Contextual AI Co-Pilot */}
                <ContextualAI activeView={activeView} onAction={handleAIAction} />

                {/* Stripe Simulation Modal */}
                <StripeSimulator 
                    isOpen={isStripeOpen} 
                    onClose={() => setIsStripeOpen(false)} 
                    amount={stripeAmount} 
                />

                {modalView && (
                    <ModalView 
                        activeView={modalView}
                        previousView={modalPreviousView}
                        closeModal={closeModal}
                        openModal={openModal}
                    />
                )}
            </div>

            {/* Global Security Overlay (Subtle) */}
            <div className="fixed inset-0 pointer-events-none border-[20px] border-cyan-500/5 z-[100]"></div>
            <div className="fixed top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500/20 to-transparent z-[101]"></div>
        </div>
    );
};

export default SApp;

// --- CONSOLIDATED FROM: App_1.tsx ---

import React, { useState, useContext, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Cpu, ShieldAlert, Sparkles, Terminal, ArrowLeft, ExternalLink, Grid } from 'lucide-react';
import { Auth0Provider } from '@auth0/auth0-react';
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
import Paywall from './components/Paywall';

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
import BusinessDemoView from './components/BusinessDemoView';

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
  Component: React.ComponentType<any>;
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

const DataContextWrapper: React.FC<{ Component: React.ComponentType<any>; extraProps?: any }> = ({ Component, extraProps = {} }) => {
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
          Module Ingress: {view.replace(/-/g, '_').toUpperCase()}
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
        {typeof sovereignCredits === 'number' ? sovereignCredits.toLocaleString() : '0'} SC
      </span>
    </div>
  );
};

const SAppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (datadogLogs && datadogLogs.logger) {
      datadogLogs.logger.info('App View Loaded', { name: 'SovereignNexus', id: 'init_view' });
    }
  }, []);

  if (!dataContext || !authContext) return null;
  const { isAuthenticated, isLoading: authLoading } = authContext;
  const { isLoading: dataLoading, activeView, setActiveView, isSubscribed } = dataContext;

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
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
          .animate-progress-flow { animation: flow 2s linear infinite; width: 50%; }
        ` }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const renderView = () => {
    if (!isSubscribed) {
      return <Paywall />;
    }
    switch (activeView) {
      case View.Dashboard: return <Dashboard />;
      case View.Transactions: return <TransactionsView />;
      case View.SendMoney: return <SendMoneyView />;
      case View.Budgets: return <BudgetsView />;
      case View.FinancialGoals: return <FinancialGoalsView />;
      case View.CreditHealth: return <CreditHealthView />;
      case View.Personalization: return <PersonalizationView />;
      case View.Accounts: return <AccountsView />;
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
      case View.AgentMarketplace: return <AgentMarketplaceView />;
      case View.APIStatus: return <APIIntegrationView />;
      case View.Settings: return <SettingsView />;
      case View.QuantumAssets: return <QuantumAssets />;
      case View.SovereignWealth: return <SovereignWealth />;
      case View.Philanthropy: return <PhilanthropyHub />;
      case View.TheVision: return <TheVisionView />;
      case View.AIAdvisor: return <AIAdvisorView />;
      case View.AIInsights: return <AIInsights />;
      case View.SecurityCenter: return <SecurityView />;
      case View.ComplianceOracle: return <ComplianceOracleView />;
      case View.GlobalPositionMap: return <GlobalPositionMap />;
      case View.GlobalSsiHub: return <GlobalSsiHubView />;
      case View.CustomerDashboard: return <CustomerDashboard />;
      case View.VerificationReports: return <VerificationReportsView customerId="c1" />;
      case View.FinancialReporting: return <FinancialReportingView />;
      case View.TheBook: return <TheBookView />;
      case View.KnowledgeBase: return <KnowledgeBaseView />;
      case View.CitibankAccounts: return <CitibankAccountsView />;
      case View.CitibankAccountProxy: return <CitibankAccountProxyView />;
      case View.CitibankBillPay: return <CitibankBillPayView />;
      case View.CitibankCrossBorder: return <CitibankCrossBorderView />;
      case View.CitibankPayeeManagement: return <CitibankPayeeManagementView />;
      case View.CitibankStandingInstructions: return <CitibankStandingInstructionsView />;
      case View.CitibankDeveloperTools: return <CitibankDeveloperToolsView />;
      case View.CitibankEligibility: return <CitibankEligibilityView />;
      case View.CitibankUnmaskedData: return <CitibankUnmaskedDataView accountIdsToUnmask={['acc_1']} />;
      case View.PlaidMainDashboard: return <PlaidMainDashboard />;
      case View.PlaidIdentity: return <PlaidIdentityView />;
      case View.PlaidCRAMonitoring: return <PlaidCRAMonitoringView />;
      case View.PlaidInstitutions: return <PlaidInstitutionsExplorer client={new PlaidClient()} />;
      case View.PlaidItemManagement: return <PlaidItemManagementView accessToken="mock_token" />;
      case View.StripeNexus: return <StripeNexusView />;
      case View.CounterpartyDashboard: return <CounterpartyDashboardView />;
      case View.VirtualAccounts: return <VirtualAccountsDashboard />;
      case View.SApp: return <SApp />;
      case View.CorporateActions: return <CorporateActionsNexusView />;
      case View.CreditNoteLedger: return <CreditNoteLedger />;
      case View.ReconciliationHub: return <ReconciliationHubView />;
      case View.GEINDashboard: return <GEINDashboard />;
      case View.CardholderManagement: return <CardholderManagement />;
      case View.SecurityCompliance: return <SecurityComplianceView />;
      case View.DeveloperHub: return <DeveloperHubView />;
      case View.SchemaExplorer: return <SchemaExplorer schemaData={{ definitions: {}, properties: {} }} />;
      case View.ResourceGraph: return <ResourceGraphView />;
      case View.ApiPlayground: return <ApiPlaygroundView />;
      case View.VentureCapitalDeskView: return <VentureCapitalDeskView />;

      // --- Direct Component Access ---
      case View.AccountDetails: 
        return <Wrapper Component={AccountDetails} props={{ accountId: '1', customerId: 'c1' }} />;
      case View.AccountList: 
        return <Wrapper Component={AccountList} props={{ accounts: [] }} />;
      case View.AccountStatementGrid: 
        return <Wrapper Component={AccountStatementGrid} props={{ statementLines: [] }} />;
      case View.AccountVerificationModal: 
        return <ModalWrapper Component={AccountVerificationModal} props={{ externalAccount: {id: '1', verification_status: 'unverified' }, onSuccess: () => {}}} />;
      case View.ACHDetailsDisplay: 
        return <Wrapper Component={ACHDetailsDisplay} props={{ details: { routingNumber: '123', realAccountNumber: '456' } }} />;
      case View.AICommandLog: 
        return <AICommandLog />;
      case View.AIPredictionWidget: 
        return <AIPredictionWidget />;
      case View.AssetCatalog: 
        return <Wrapper Component={AssetCatalog} props={{ assets: [], onAssetSelected: () => {}, getAssetDetails: async () => ({}) }} />;
      case View.AutomatedSweepRules: 
        return <AutomatedSweepRules />;
      case View.BalanceReportChart: 
        return <Wrapper Component={BalanceReportChart} props={{ data: [] }} />;
      case View.BalanceTransactionTable: 
        return <Wrapper Component={BalanceTransactionTable} props={{ balanceTransactions: [] }} />;
      case View.CardDesignVisualizer: 
        return <Wrapper Component={CardDesignVisualizer} props={{ design: { id: 'd_1', physical_bundle: { features: {} } } }} />;
      case View.ChargeDetailModal: 
        return <ModalWrapper Component={ChargeDetailModal} props={{ charge: {id: 'ch_1', amount: 50000, currency: 'USD', status: 'succeeded'}, onClose: () => {}}} />;
      case View.ChargeList: 
        return <ChargeList />;
      case View.ConductorConfigurationView: 
        return <ConductorConfigurationView />;
      case View.CounterpartyDetails: 
        return <Wrapper Component={CounterpartyDetails} props={{ counterpartyId: 'cp_1' }} />;
      case View.CounterpartyForm: 
        return <Wrapper Component={CounterpartyForm} props={{ counterparties: [], onSubmit: () => {}, onCancel: () => {} }} />;
      case View.DisruptionIndexMeter: 
        return <Wrapper Component={DisruptionIndexMeter} props={{ indexValue: 50 }} />;
      case View.DocumentUploader: 
        return <Wrapper Component={DocumentUploader} props={{ documentableType: 'test', documentableId: '1' }} />;
      case View.DownloadLink: 
        return <Wrapper Component={DownloadLink} props={{ url: '#', filename: 'test.pdf' }} />;
      case View.EarlyFraudWarningFeed: 
        return <EarlyFraudWarningFeed />;
      case View.ElectionChoiceForm: 
        return <Wrapper Component={ElectionChoiceForm} props={{ availableChoices: {}, onSubmit: () => {}, onCancel: () => {} }} />;
      case View.EventNotificationCard: 
        return <Wrapper Component={EventNotificationCard} props={{ event: {} }} />;
      case View.ExpectedPaymentsTable: 
        return <ExpectedPaymentsTable />;
      case View.ExternalAccountCard: 
        return <Wrapper Component={ExternalAccountCard} props={{ account: {id: '1', account_details: [], routing_details: []}}} />;
      case View.ExternalAccountForm: 
        return <Wrapper Component={ExternalAccountForm} props={{ counterparties: [], onSubmit: () => {}, onCancel: () => {} }} />;
      case View.ExternalAccountsTable: 
        return <Wrapper Component={ExternalAccountTable} props={{ accounts: [] }} />;
      case View.FinancialAccountCard: 
        return <Wrapper Component={FinancialAccountCard} props={{ financialAccount: {id: 'fa_1', balance: { cash: {}}, supported_currencies: []}}} />;
      case View.IncomingPaymentDetailList: 
        return <IncomingPaymentDetailList />;
      case View.InvoiceFinancingRequest: 
        return <Wrapper Component={InvoiceFinancingRequest} props={{ onSubmit: () => {} }} />;
      case View.PaymentInitiationForm: 
        return <PaymentInitiationForm />;
      case View.PaymentMethodDetails: 
        return <Wrapper Component={PaymentMethodDetails} props={{ details: { type: 'card', card: {} }}} />;
      case View.PaymentOrderForm: 
        return <Wrapper Component={PaymentOrderForm} props={{ internalAccounts: [], externalAccounts: [], onSubmit: () => {}, onCancel: () => {} }} />;
      case View.PayoutsDashboard: 
        return <PayoutsDashboard />;
      case View.PnLChart: 
        return <Wrapper Component={PnLChart} props={{ data: [], algorithmName: 'Test' }} />;
      case View.RefundForm: 
        return <RefundForm />;
      case View.RemittanceInfoEditor: 
        return <Wrapper Component={RemittanceInfoEditor} props={{ onChange: () => {} }} />;
      case View.ReportingView: 
        return <ReportingView />;
      case View.ReportRunGenerator: 
        return <ReportRunGenerator />;
      case View.ReportStatusIndicator: 
        return <Wrapper Component={ReportStatusIndicator} props={{ status: 'success' }} />;
      case View.SsiEditorForm: 
        return <Wrapper Component={SsiEditorForm} props={{ onSubmit: () => {}, onCancel: () => {} }} />;
      case View.StripeStatusBadge: 
        return <Wrapper Component={StripeStatusBadge} props={{ status: 'succeeded', objectType: 'charge' }} />;
      case View.StructuredPurposeInput: 
        return <Wrapper Component={StructuredPurposeInput} props={{ onChange: () => {}, value: null }} />;
      case View.SubscriptionList: 
        return <Wrapper Component={SubscriptionList} props={{ subscriptions: [] }} />;
      case View.TimeSeriesChart: 
        return <Wrapper Component={TimeSeriesChart} props={{ data: { labels: [], datasets: [] } }} />;
      case View.TradeConfirmationModal: 
        return (
          <ModalWrapper 
            Component={TradeConfirmationModal} 
            props={{ 
              settlementInstruction: { 
                messageId: 'NEX-INST-99281-Z',
                totalAmount: 12500000, // 125k
                currency: 'USD',
                creationDateTime: Date.now(),
                settlementDate: '2024-12-15',
                numberOfTransactions: 1,
                purpose: 'TREA'
              } 
            }} 
          />
        );
      case View.TransactionFilter: 
        return <Wrapper Component={TransactionFilter} props={{ onApplyFilters: () => {} }} />;
      case View.TransactionList: 
        return <Wrapper Component={TransactionList} props={{ transactions: [] }} />;
      case View.TreasuryTransactionList: 
        return <Wrapper Component={TreasuryTransactionList} props={{ transactions: [] }} />;
      case View.TreasuryView: 
        return <TreasuryView />;
      case View.UniversalObjectInspector: 
        return <Wrapper Component={UniversalObjectInspector} props={{ data: { status: "Nominal", uptime: "99.999%", load: "Balanced" } }} />;
      case View.VirtualAccountForm: 
        return <Wrapper Component={VirtualAccountForm} props={{ onSubmit: () => {}, isSubmitting: false }} />;
      case View.VirtualAccountsTable: 
        return <Wrapper Component={VirtualAccountsTable} props={{ onEdit: () => {}, onDelete: () => {} }} />;
      case View.VoiceControl: 
        return <DataContextWrapper Component={VoiceControl} />;
      case View.WebhookSimulator: 
        return <Wrapper Component={WebhookSimulator} props={{ stripeAccountId: 'acct_mock' }} />;

      default: return <AIIntentStub view={activeView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="relative flex flex-col flex-1 min-h-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,#111,transparent)]">
          <div className="max-w-[1600px] mx-auto h-full min-h-0">
            {renderView()}
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
                    <Route path="/modules" element={<ExternalIframeCollection />} />
                    <Route path="/business-demo" element={<BusinessDemoView />} />
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

// --- CONSOLIDATED FROM: ./App.tsx ---

import React, { useState, useContext, useEffect } from 'react';
import { HashRouter as Router, Route, Routes, Navigate, Link } from 'react-router-dom';
import { ThemeProvider, createTheme } from '@mui/material/styles';
import CssBaseline from '@mui/material/CssBaseline';
import { Cpu, ShieldAlert, Sparkles, Terminal, ArrowLeft, ExternalLink, Grid } from 'lucide-react';
import { Auth0Provider } from '@auth0/auth0-react';
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
import Paywall from './components/Paywall';

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
import BusinessDemoView from './components/BusinessDemoView';

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
  Component: React.ComponentType<any>;
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

const DataContextWrapper: React.FC<{ Component: React.ComponentType<any>; extraProps?: any }> = ({ Component, extraProps = {} }) => {
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
          Module Ingress: {view.replace(/-/g, '_').toUpperCase()}
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
        {typeof sovereignCredits === 'number' ? sovereignCredits.toLocaleString() : '0'} SC
      </span>
    </div>
  );
};

const SAppLayout = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const dataContext = useContext(DataContext);
  const authContext = useContext(AuthContext);

  useEffect(() => {
    if (datadogLogs && datadogLogs.logger) {
      datadogLogs.logger.info('App View Loaded', { name: 'SovereignNexus', id: 'init_view' });
    }
  }, []);

  if (!dataContext || !authContext) return null;
  const { isAuthenticated, isLoading: authLoading } = authContext;
  const { isLoading: dataLoading, activeView, setActiveView, isSubscribed } = dataContext;

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
        <style dangerouslySetInnerHTML={{ __html: `
          @keyframes flow { 0% { transform: translateX(-100%); } 100% { transform: translateX(200%); } }
          .animate-progress-flow { animation: flow 2s linear infinite; width: 50%; }
        ` }} />
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;

  const renderView = () => {
    if (!isSubscribed) {
      return <Paywall />;
    }
    switch (activeView) {
      case View.Dashboard: return <Dashboard />;
      case View.Transactions: return <TransactionsView />;
      case View.SendMoney: return <SendMoneyView />;
      case View.Budgets: return <BudgetsView />;
      case View.FinancialGoals: return <FinancialGoalsView />;
      case View.CreditHealth: return <CreditHealthView />;
      case View.Personalization: return <PersonalizationView />;
      case View.Accounts: return <AccountsView />;
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
      case View.AgentMarketplace: return <AgentMarketplaceView />;
      case View.APIStatus: return <APIIntegrationView />;
      case View.Settings: return <SettingsView />;
      case View.QuantumAssets: return <QuantumAssets />;
      case View.SovereignWealth: return <SovereignWealth />;
      case View.Philanthropy: return <PhilanthropyHub />;
      case View.TheVision: return <TheVisionView />;
      case View.AIAdvisor: return <AIAdvisorView />;
      case View.AIInsights: return <AIInsights />;
      case View.SecurityCenter: return <SecurityView />;
      case View.ComplianceOracle: return <ComplianceOracleView />;
      case View.GlobalPositionMap: return <GlobalPositionMap />;
      case View.GlobalSsiHub: return <GlobalSsiHubView />;
      case View.CustomerDashboard: return <CustomerDashboard />;
      case View.VerificationReports: return <VerificationReportsView customerId="c1" />;
      case View.FinancialReporting: return <FinancialReportingView />;
      case View.TheBook: return <TheBookView />;
      case View.KnowledgeBase: return <KnowledgeBaseView />;
      case View.CitibankAccounts: return <CitibankAccountsView />;
      case View.CitibankAccountProxy: return <CitibankAccountProxyView />;
      case View.CitibankBillPay: return <CitibankBillPayView />;
      case View.CitibankCrossBorder: return <CitibankCrossBorderView />;
      case View.CitibankPayeeManagement: return <CitibankPayeeManagementView />;
      case View.CitibankStandingInstructions: return <CitibankStandingInstructionsView />;
      case View.CitibankDeveloperTools: return <CitibankDeveloperToolsView />;
      case View.CitibankEligibility: return <CitibankEligibilityView />;
      case View.CitibankUnmaskedData: return <CitibankUnmaskedDataView accountIdsToUnmask={['acc_1']} />;
      case View.PlaidMainDashboard: return <PlaidMainDashboard />;
      case View.PlaidIdentity: return <PlaidIdentityView />;
      case View.PlaidCRAMonitoring: return <PlaidCRAMonitoringView />;
      case View.PlaidInstitutions: return <PlaidInstitutionsExplorer client={new PlaidClient()} />;
      case View.PlaidItemManagement: return <PlaidItemManagementView accessToken="mock_token" />;
      case View.StripeNexus: return <StripeNexusView />;
      case View.CounterpartyDashboard: return <CounterpartyDashboardView />;
      case View.VirtualAccounts: return <VirtualAccountsDashboard />;
      case View.SApp: return <SApp />;
      case View.CorporateActions: return <CorporateActionsNexusView />;
      case View.CreditNoteLedger: return <CreditNoteLedger />;
      case View.ReconciliationHub: return <ReconciliationHubView />;
      case View.GEINDashboard: return <GEINDashboard />;
      case View.CardholderManagement: return <CardholderManagement />;
      case View.SecurityCompliance: return <SecurityComplianceView />;
      case View.DeveloperHub: return <DeveloperHubView />;
      case View.SchemaExplorer: return <SchemaExplorer schemaData={{ definitions: {}, properties: {} }} />;
      case View.ResourceGraph: return <ResourceGraphView />;
      case View.ApiPlayground: return <ApiPlaygroundView />;
      case View.VentureCapitalDeskView: return <VentureCapitalDeskView />;

      // --- Direct Component Access ---
      case View.AccountDetails: 
        return <Wrapper Component={AccountDetails} props={{ accountId: '1', customerId: 'c1' }} />;
      case View.AccountList: 
        return <Wrapper Component={AccountList} props={{ accounts: [] }} />;
      case View.AccountStatementGrid: 
        return <Wrapper Component={AccountStatementGrid} props={{ statementLines: [] }} />;
      case View.AccountVerificationModal: 
        return <ModalWrapper Component={AccountVerificationModal} props={{ externalAccount: {id: '1', verification_status: 'unverified' }, onSuccess: () => {}}} />;
      case View.ACHDetailsDisplay: 
        return <Wrapper Component={ACHDetailsDisplay} props={{ details: { routingNumber: '123', realAccountNumber: '456' } }} />;
      case View.AICommandLog: 
        return <AICommandLog />;
      case View.AIPredictionWidget: 
        return <AIPredictionWidget />;
      case View.AssetCatalog: 
        return <Wrapper Component={AssetCatalog} props={{ assets: [], onAssetSelected: () => {}, getAssetDetails: async () => ({}) }} />;
      case View.AutomatedSweepRules: 
        return <AutomatedSweepRules />;
      case View.BalanceReportChart: 
        return <Wrapper Component={BalanceReportChart} props={{ data: [] }} />;
      case View.BalanceTransactionTable: 
        return <Wrapper Component={BalanceTransactionTable} props={{ balanceTransactions: [] }} />;
      case View.CardDesignVisualizer: 
        return <Wrapper Component={CardDesignVisualizer} props={{ design: { id: 'd_1', physical_bundle: { features: {} } } }} />;
      case View.ChargeDetailModal: 
        return <ModalWrapper Component={ChargeDetailModal} props={{ charge: {id: 'ch_1', amount: 50000, currency: 'USD', status: 'succeeded'}, onClose: () => {}}} />;
      case View.ChargeList: 
        return <ChargeList />;
      case View.ConductorConfigurationView: 
        return <ConductorConfigurationView />;
      case View.CounterpartyDetails: 
        return <Wrapper Component={CounterpartyDetails} props={{ counterpartyId: 'cp_1' }} />;
      case View.CounterpartyForm: 
        return <Wrapper Component={CounterpartyForm} props={{ counterparties: [], onSubmit: () => {}, onCancel: () => {} }} />;
      case View.DisruptionIndexMeter: 
        return <Wrapper Component={DisruptionIndexMeter} props={{ indexValue: 50 }} />;
      case View.DocumentUploader: 
        return <Wrapper Component={DocumentUploader} props={{ documentableType: 'test', documentableId: '1' }} />;
      case View.DownloadLink: 
        return <Wrapper Component={DownloadLink} props={{ url: '#', filename: 'test.pdf' }} />;
      case View.EarlyFraudWarningFeed: 
        return <EarlyFraudWarningFeed />;
      case View.ElectionChoiceForm: 
        return <Wrapper Component={ElectionChoiceForm} props={{ availableChoices: {}, onSubmit: () => {}, onCancel: () => {} }} />;
      case View.EventNotificationCard: 
        return <Wrapper Component={EventNotificationCard} props={{ event: {} }} />;
      case View.ExpectedPaymentsTable: 
        return <ExpectedPaymentsTable />;
      case View.ExternalAccountCard: 
        return <Wrapper Component={ExternalAccountCard} props={{ account: {id: '1', account_details: [], routing_details: []}}} />;
      case View.ExternalAccountForm: 
        return <Wrapper Component={ExternalAccountForm} props={{ counterparties: [], onSubmit: () => {}, onCancel: () => {} }} />;
      case View.ExternalAccountsTable: 
        return <Wrapper Component={ExternalAccountTable} props={{ accounts: [] }} />;
      case View.FinancialAccountCard: 
        return <Wrapper Component={FinancialAccountCard} props={{ financialAccount: {id: 'fa_1', balance: { cash: {}}, supported_currencies: []}}} />;
      case View.IncomingPaymentDetailList: 
        return <IncomingPaymentDetailList />;
      case View.InvoiceFinancingRequest: 
        return <Wrapper Component={InvoiceFinancingRequest} props={{ onSubmit: () => {} }} />;
      case View.PaymentInitiationForm: 
        return <PaymentInitiationForm />;
      case View.PaymentMethodDetails: 
        return <Wrapper Component={PaymentMethodDetails} props={{ details: { type: 'card', card: {} }}} />;
      case View.PaymentOrderForm: 
        return <Wrapper Component={PaymentOrderForm} props={{ internalAccounts: [], externalAccounts: [], onSubmit: () => {}, onCancel: () => {} }} />;
      case View.PayoutsDashboard: 
        return <PayoutsDashboard />;
      case View.PnLChart: 
        return <Wrapper Component={PnLChart} props={{ data: [], algorithmName: 'Test' }} />;
      case View.RefundForm: 
        return <RefundForm />;
      case View.RemittanceInfoEditor: 
        return <Wrapper Component={RemittanceInfoEditor} props={{ onChange: () => {} }} />;
      case View.ReportingView: 
        return <ReportingView />;
      case View.ReportRunGenerator: 
        return <ReportRunGenerator />;
      case View.ReportStatusIndicator: 
        return <Wrapper Component={ReportStatusIndicator} props={{ status: 'success' }} />;
      case View.SsiEditorForm: 
        return <Wrapper Component={SsiEditorForm} props={{ onSubmit: () => {}, onCancel: () => {} }} />;
      case View.StripeStatusBadge: 
        return <Wrapper Component={StripeStatusBadge} props={{ status: 'succeeded', objectType: 'charge' }} />;
      case View.StructuredPurposeInput: 
        return <Wrapper Component={StructuredPurposeInput} props={{ onChange: () => {}, value: null }} />;
      case View.SubscriptionList: 
        return <Wrapper Component={SubscriptionList} props={{ subscriptions: [] }} />;
      case View.TimeSeriesChart: 
        return <Wrapper Component={TimeSeriesChart} props={{ data: { labels: [], datasets: [] } }} />;
      case View.TradeConfirmationModal: 
        return (
          <ModalWrapper 
            Component={TradeConfirmationModal} 
            props={{ 
              settlementInstruction: { 
                messageId: 'NEX-INST-99281-Z',
                totalAmount: 12500000, // 125k
                currency: 'USD',
                creationDateTime: Date.now(),
                settlementDate: '2024-12-15',
                numberOfTransactions: 1,
                purpose: 'TREA'
              } 
            }} 
          />
        );
      case View.TransactionFilter: 
        return <Wrapper Component={TransactionFilter} props={{ onApplyFilters: () => {} }} />;
      case View.TransactionList: 
        return <Wrapper Component={TransactionList} props={{ transactions: [] }} />;
      case View.TreasuryTransactionList: 
        return <Wrapper Component={TreasuryTransactionList} props={{ transactions: [] }} />;
      case View.TreasuryView: 
        return <TreasuryView />;
      case View.UniversalObjectInspector: 
        return <Wrapper Component={UniversalObjectInspector} props={{ data: { status: "Nominal", uptime: "99.999%", load: "Balanced" } }} />;
      case View.VirtualAccountForm: 
        return <Wrapper Component={VirtualAccountForm} props={{ onSubmit: () => {}, isSubmitting: false }} />;
      case View.VirtualAccountsTable: 
        return <Wrapper Component={VirtualAccountsTable} props={{ onEdit: () => {}, onDelete: () => {} }} />;
      case View.VoiceControl: 
        return <DataContextWrapper Component={VoiceControl} />;
      case View.WebhookSimulator: 
        return <Wrapper Component={WebhookSimulator} props={{ stripeAccountId: 'acct_mock' }} />;

      default: return <AIIntentStub view={activeView} />;
    }
  };

  return (
    <div className="flex h-screen bg-[#050505] text-white overflow-hidden">
      <Sidebar isOpen={isSidebarOpen} setIsOpen={setIsSidebarOpen} />
      <div className="relative flex flex-col flex-1 min-h-0">
        <Header onMenuClick={() => setIsSidebarOpen(true)} />
        <main className="flex-1 overflow-y-auto overflow-x-hidden p-6 md:p-10 custom-scrollbar bg-[radial-gradient(circle_at_50%_0%,#111,transparent)]">
          <div className="max-w-[1600px] mx-auto h-full min-h-0">
            {renderView()}
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
                    <Route path="/modules" element={<ExternalIframeCollection />} />
                    <Route path="/business-demo" element={<BusinessDemoView />} />
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

// --- CONSOLIDATED FROM: ./src/App.tsx ---

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

export {
  AuthProvider,
  AuthContext,
  DataProvider,
  DataContext,
  StripeDataProvider,
  MoneyMovementProvider,
  Sidebar,
  Header,
  SApp,
  View,
  Dashboard,
  TransactionsView,
  SendMoneyView,
  BudgetsView,
  FinancialGoalsView,
  CreditHealthView,
  PersonalizationView,
  AccountsView,
  InvestmentsView,
  CryptoView,
  AlgoTradingLab,
  ForexArena,
  CommoditiesExchange,
  RealEstateEmpire,
  ArtCollectibles,
  DerivativesDesk,
  VentureCapitalDesk,
  PrivateEquityLounge,
  TaxOptimizationChamber,
  LegacyBuilder,
  CorporateCommandView,
  ModernTreasuryView,
  OpenBankingView,
  FinancialDemocracyView,
  AIAdStudioView,
  QuantumWeaverView,
  AgentMarketplaceView,
  APIIntegrationView,
  SettingsView,
  PlaidDashboardView,
  StripeDashboardView,
  MarqetaDashboardView,
  SSOView,
  ConciergeService,
  SovereignWealth,
  PhilanthropyHub,
  TheVisionView,
  AIAdvisorView,
  AIInsights,
  SecurityView,
  ComplianceOracleView,
  GlobalPositionMap,
  GlobalSsiHubView,
  CustomerDashboard,
  VerificationReportsView,
  FinancialReportingView,
  StripeNexusDashboard,
  TheBookView,
  KnowledgeBaseView,
  VoiceControl,
  LandingPage,
  QuantumAssets,
  CitibankAccountsView,
  CitibankAccountProxyView,
  CitibankBillPayView,
  CitibankCrossBorderView,
  CitibankPayeeManagementView,
  CitibankStandingInstructionsView,
  CitibankDeveloperToolsView,
  CitibankEligibilityView,
  CitibankUnmaskedDataView,
  PlaidIdentityView,
  PlaidCRAMonitoringView,
  PlaidInstitutionsExplorer,
  PlaidItemManagementView,
  PlaidMainDashboard,
  StripeNexusView,
  CounterpartyDashboardView,
  VirtualAccountsDashboard,
  CorporateActionsNexusView,
  CreditNoteLedger,
  ReconciliationHubView,
  GEINDashboard,
  CardholderManagement,
  UniversalObjectInspector,
  LoginView,
  PlaidClient,
  DeveloperHubView,
  ApiPlaygroundView,
  AccountDetails,
  AccountList,
  AccountStatementGrid,
  AccountVerificationModal,
  ACHDetailsDisplay,
  AICommandLog,
  AIPredictionWidget,
  AssetCatalog,
  AutomatedSweepRules,
  BalanceReportChart,
  BalanceTransactionTable,
  CardDesignVisualizer,
  ChargeDetailModal,
  ChargeList,
  ConductorConfigurationView,
  CounterpartyDetails,
  CounterpartyForm,
  DisruptionIndexMeter,
  DocumentUploader,
  DownloadLink,
  EarlyFraudWarningFeed,
  ElectionChoiceForm,
  EventNotificationCard,
  ExpectedPaymentsTable,
  ExternalAccountCard,
  ExternalAccountForm,
  ExternalAccountTable,
  FinancialAccountCard,
  IncomingPaymentDetailList,
  InvestmentForm,
  InvoiceFinancingRequest,
  PaymentInitiationForm,
  PaymentMethodDetails,
  PaymentOrderForm,
  PayoutsDashboard,
  PnLChart,
  RefundForm,
  RemittanceInfoEditor,
  ReportingView,
  ReportRunGenerator,
  ReportStatusIndicator,
  ResourceGraphView,
  SchemaExplorer,
  SecurityComplianceView,
  SsiEditorForm,
  StripeStatusBadge,
  StructuredPurposeInput,
  SubscriptionList,
  TimeSeriesChart,
  TradeConfirmationModal,
  TransactionFilter,
  TransactionList,
  TreasuryTransactionList,
  TreasuryView,
  VentureCapitalDeskView,
  VirtualAccountForm,
  VirtualAccountsTable,
  WebhookSimulator
};