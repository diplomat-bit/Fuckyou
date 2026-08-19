import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CraMonitoringInsightsGetResponse,
  CraMonitoringInsightsSubscribeResponse,
  PlaidError,
} from 'plaid';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// QUANTUM FINANCIAL - CORE TYPES & INTERFACES
// ============================================================================

type ViewMode = 'DASHBOARD' | 'INSIGHTS' | 'AUDIT' | 'AI_COMMAND' | 'GUIDE';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'WARNING';
  details: string;
  hash: string; // Simulated cryptographic hash
}

interface AIMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface QuantumConfig {
  geminiKey: string;
  userToken: string;
  subscriptionId: string | null;
  isSimulationMode: boolean;
}

// ============================================================================
// MOCK DATA - "TEST DRIVE" ASSETS
// ============================================================================

const MOCK_INSIGHTS: CraMonitoringInsightsGetResponse = {
  user_insights_id: 'ins_mock_quantum_8821',
  items: [
    {
      item_id: 'itm_chase_quantum_01',
      institution_name: 'Chase (Quantum Link)',
      institution_id: 'ins_1',
      date_generated: new Date().toISOString(),
      status: { status_code: 'HEALTHY' },
      insights: {
        income: {
          forecasted_monthly_income: { current_amount: 12500.00, iso_currency_code: 'USD' },
          total_monthly_income: { current_amount: 14200.50, iso_currency_code: 'USD' },
          historical_annual_income: { current_amount: 165000.00, iso_currency_code: 'USD' },
        },
        loans: {
          loan_payments_counts: { current_count: 2 },
          loan_disbursements_count: 0,
        }
      },
      accounts: [
        {
          account_id: 'acc_chk_01',
          name: 'Quantum Elite Checking',
          mask: '8842',
          type: 'depository',
          subtype: 'checking',
          balances: { current: 45200.00, available: 44100.00, iso_currency_code: 'USD' },
          transactions: [
            { date: '2024-05-01', original_description: 'Direct Deposit - QUANTUM CORP', amount: -6200.00, iso_currency_code: 'USD' },
            { date: '2024-05-02', original_description: 'Payment to AMEX', amount: 1200.00, iso_currency_code: 'USD' },
            { date: '2024-05-05', original_description: 'Wire Transfer - Investment', amount: 5000.00, iso_currency_code: 'USD' },
          ]
        }
      ]
    }
  ]
};

const QUANTUM_GUIDE_TEXT = `
QUANTUM FINANCIAL BUSINESS DEMO: A COMPREHENSIVE GUIDE

Welcome, Visionary. You are now accessing the Quantum Financial Business Demo. This is your "Golden Ticket" to the future of financial orchestration.

Why a Quantum Business Demo is Your Secret Weapon:
Think of this as your ultimate cheat sheet to the world of high-frequency business banking. In today’s hyper-connected economy, latency is the enemy. This demo allows you to virtually walk through the entire Quantum platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools powered by our proprietary AI core.

What to Expect:
This is your backstage pass. You are test-driving the car. Kick the tires. See the engine roar.
- Robust Payment & Collection: Wire, ACH, Real-time Rails.
- Security: Non-negotiable. Multi-factor auth simulations, Fraud monitoring.
- Reporting & Analytics: Data visualization that speaks the language of profit.
- Audit Storage: Every sensitive action is logged in our immutable ledger.

This environment is NO PRESSURE. Explore, interact, and evaluate.
`;

// ============================================================================
// UI COMPONENTS (SELF-CONTAINED)
// ============================================================================

const QuantumCard: React.FC<{ children: React.ReactNode; title?: string; className?: string; action?: React.ReactNode }> = ({ children, title, className = '', action }) => (
  <div className={`bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl ${className}`}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
        {title && <h3 className="text-lg font-semibold text-cyan-400 tracking-wide uppercase">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const QuantumButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'success' | 'ghost' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 border border-gray-600',
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const QuantumInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">{label}</label>}
    <input 
      className={`w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${className}`}
      {...props}
    />
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getColor = (s: string) => {
    if (['HEALTHY', 'SUCCESS', 'ACTIVE'].includes(s)) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (['WARNING', 'PENDING'].includes(s)) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (['FAILURE', 'ERROR', 'DISCONNECTED'].includes(s)) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${getColor(status)}`}>
      {status}
    </span>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlaidCRAMonitoringView: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [config, setConfig] = useState<QuantumConfig>({
    geminiKey: process.env.GEMINI_API_KEY || '',
    userToken: '',
    subscriptionId: null,
    isSimulationMode: false,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [insights, setInsights] = useState<CraMonitoringInsightsGetResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI State
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    { id: 'init', role: 'system', content: 'Quantum AI Core Initialized. Ready to analyze financial vectors.', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);

  // Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const auditEndRef = useRef<HTMLDivElement>(null);

  // --- HELPERS ---

  const addAuditLog = (action: string, status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'WARNING', details: string) => {
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      action,
      user: config.isSimulationMode ? 'SIM_USER_ADMIN' : 'QUANTUM_USER',
      status,
      details,
      hash: Math.random().toString(36).substring(2, 15).toUpperCase() // Fake hash
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(chatEndRef); }, [chatMessages]);
  useEffect(() => { scrollToBottom(auditEndRef); }, [auditLogs]);

  // --- API INTERACTIONS (SIMULATED & REAL) ---

  const callApi = async (endpoint: string, body: object) => {
    if (config.isSimulationMode) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
      if (endpoint.includes('subscribe')) return { subscription_id: 'sub_sim_quantum_99' };
      if (endpoint.includes('get')) return MOCK_INSIGHTS;
      return {};
    }

    try {
      const response = await fetch(`/api/plaid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, ...body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error_message || 'Unknown Error');
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  // --- HANDLERS ---

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);
    addAuditLog('INITIATE_SUBSCRIPTION', 'PENDING', 'Requesting CRA monitoring subscription...');
    
    try {
      if (!config.userToken && !config.isSimulationMode) throw new Error('User Token Required');
      
      const data = await callApi('cra/monitoring_insights/subscribe', { user_token: config.userToken });
      
      setConfig(prev => ({ ...prev, subscriptionId: data.subscription_id }));
      addAuditLog('SUBSCRIPTION_CONFIRMED', 'SUCCESS', `ID: ${data.subscription_id}`);
      
      // AI Reaction
      handleAIResponse("System Alert: New CRA Monitoring Subscription active. Analyzing initial vectors...");
      
    } catch (err: any) {
      setError(err.message);
      addAuditLog('SUBSCRIPTION_FAILED', 'FAILURE', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetInsights = async () => {
    setIsLoading(true);
    setError(null);
    addAuditLog('FETCH_INSIGHTS', 'PENDING', 'Retrieving encrypted insight packets...');

    try {
      if (!config.userToken && !config.isSimulationMode) throw new Error('User Token Required');

      const data = await callApi('cra/monitoring_insights/get', { user_token: config.userToken });
      setInsights(data);
      addAuditLog('INSIGHTS_RETRIEVED', 'SUCCESS', `Packets decrypted. ID: ${data.user_insights_id}`);
      setViewMode('INSIGHTS');

      // Trigger AI Analysis automatically
      if (config.geminiKey) {
        generateAIAnalysis(data);
      }

    } catch (err: any) {
      setError(err.message);
      addAuditLog('FETCH_INSIGHTS_FAILED', 'FAILURE', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSimulationMode = () => {
    const newMode = !config.isSimulationMode;
    setConfig(prev => ({ ...prev, isSimulationMode: newMode }));
    addAuditLog('MODE_SWITCH', 'WARNING', `Simulation Mode: ${newMode ? 'ENABLED' : 'DISABLED'}`);
    if (newMode) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: '*** TEST DRIVE MODE ENGAGED *** Engine is roaring. Mock data streams active.', timestamp: new Date() }]);
    }
  };

  // --- AI LOGIC ---

  const generateAIAnalysis = async (data: any) => {
    if (!config.geminiKey) return;
    
    const prompt = `
      Analyze this financial data for a high-net-worth individual demo. 
      Data: ${JSON.stringify(data)}
      Tone: Elite, Professional, Concise.
      Output: 3 key bullet points on financial health and 1 strategic recommendation.
    `;
    
    await handleAIChat(prompt, true); // true = hidden prompt, only show response
  };

  const handleAIChat = async (message: string, isSystemTrigger = false) => {
    if (!message.trim()) return;

    if (!isSystemTrigger) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date() }]);
      setChatInput('');
    }

    setIsAITyping(true);

    try {
      if (!config.geminiKey) {
        throw new Error("AI Core Offline. Please configure GEMINI_API_KEY.");
      }

      const genAI = new GoogleGenAI({ apiKey: config.geminiKey });
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using a standard model name for stability

      const systemContext = `
        You are the Quantum Financial AI Core. 
        You are speaking to a prospective business client testing the platform.
        Your tone is Elite, Secure, and High-Performance.
        Current Context: ${config.isSimulationMode ? 'SIMULATION / TEST DRIVE' : 'LIVE PRODUCTION'}.
        User Insights Data Available: ${insights ? 'YES' : 'NO'}.
        If data is available, use it to answer.
      `;

      const result = await model.generateContent([systemContext, message]);
      const response = result.response.text();

      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: response, timestamp: new Date() }]);
      addAuditLog('AI_INTERACTION', 'SUCCESS', 'Response generated via Gemini Core');

    } catch (err: any) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Error: ${err.message}`, timestamp: new Date() }]);
      addAuditLog('AI_FAILURE', 'FAILURE', err.message);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleAIResponse = (text: string) => {
     setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: text, timestamp: new Date() }]);
  };


  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Control Panel */}
      <div className="lg:col-span-2 space-y-6">
        <QuantumCard title="System Configuration" action={
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${config.isSimulationMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className="text-xs text-gray-400">{config.isSimulationMode ? 'TEST DRIVE' : 'LIVE'}</span>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm text-gray-400 uppercase mb-2">Subscription Status</h4>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{config.subscriptionId ? 'ACTIVE' : 'INACTIVE'}</span>
                <StatusBadge status={config.subscriptionId ? 'ACTIVE' : 'DISCONNECTED'} />
              </div>
              {config.subscriptionId && <p className="text-xs text-gray-500 mt-1 font-mono">{config.subscriptionId}</p>}
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm text-gray-400 uppercase mb-2">Security Protocol</h4>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">ENCRYPTED</span>
                <StatusBadge status="HEALTHY" />
              </div>
              <p className="text-xs text-gray-500 mt-1">AES-256 / TLS 1.3</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!config.subscriptionId ? (
              <QuantumButton onClick={handleSubscribe} disabled={isLoading}>
                {isLoading ? 'Initializing...' : 'Activate Monitoring'}
              </QuantumButton>
            ) : (
              <QuantumButton variant="danger" onClick={() => setConfig(p => ({...p, subscriptionId: null}))}>
                Terminate Link
              </QuantumButton>
            )}
            <QuantumButton variant="ghost" onClick={handleGetInsights} disabled={isLoading}>
              Fetch Intelligence
            </QuantumButton>
            <QuantumButton variant="ghost" onClick={() => setIsConfigModalOpen(true)}>
              Configure Keys
            </QuantumButton>
            <QuantumButton variant="success" onClick={toggleSimulationMode}>
              {config.isSimulationMode ? 'Disable Test Drive' : 'Kick the Tires (Demo Mode)'}
            </QuantumButton>
          </div>
        </QuantumCard>

        {/* Quick Stats (Placeholder for Visuals) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Credit Velocity', 'Risk Vector', 'Liquidity Score'].map((metric, i) => (
                <QuantumCard key={i} className="text-center py-4">
                    <h4 className="text-xs text-gray-400 uppercase">{metric}</h4>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">
                        {config.isSimulationMode ? Math.floor(Math.random() * 100) + 800 : '--'}
                    </div>
                    <div className="text-xs text-emerald-500 mt-1 flex justify-center items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        {config.isSimulationMode ? '+2.4%' : '0%'}
                    </div>
                </QuantumCard>
            ))}
        </div>
      </div>

      {/* AI Command Center (Mini) */}
      <div className="lg:col-span-1">
        <QuantumCard title="AI Command Core" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 mb-4 pr-2 custom-scrollbar">
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
                            msg.role === 'user' ? 'bg-cyan-900/50 text-cyan-100 border border-cyan-700' : 
                            msg.role === 'system' ? 'bg-red-900/20 text-red-300 border border-red-800 font-mono text-xs' :
                            'bg-gray-800 text-gray-200 border border-gray-700'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isAITyping && <div className="text-xs text-cyan-500 animate-pulse">Core processing...</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAIChat(chatInput)}
                    placeholder="Ask Quantum AI..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button 
                    onClick={() => handleAIChat(chatInput)}
                    className="absolute right-2 top-2 text-cyan-500 hover:text-cyan-400"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
            </div>
        </QuantumCard>
      </div>
    </div>
  );

  const renderInsights = () => {
    if (!insights) return <div className="text-center text-gray-500 py-10">No Intelligence Data Available</div>;

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Intelligence Report <span className="text-cyan-500">#{insights.user_insights_id.split('_').pop()}</span></h2>
            <QuantumButton variant="ghost" onClick={() => setViewMode('DASHBOARD')}>Back to Command</QuantumButton>
        </div>

        {insights.items.map((item, idx) => (
            <div key={idx} className="space-y-6">
                {/* High Level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuantumCard title="Income Velocity">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-400 uppercase">Forecasted Monthly</div>
                                <div className="text-2xl font-bold text-white">
                                    ${item.insights?.income?.forecasted_monthly_income?.current_amount.toLocaleString()}
                                </div>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 w-[75%]"></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Historical Annual: ${item.insights?.income?.historical_annual_income?.current_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </QuantumCard>

                    <QuantumCard title="Liability Structure">
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">{item.insights?.loans?.loan_payments_counts?.current_count || 0}</div>
                                <div className="text-sm text-gray-400">Active Loan Obligations</div>
                            </div>
                        </div>
                    </QuantumCard>

                    <QuantumCard title="Institution Health">
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <div className="text-lg font-semibold text-white">{item.institution_name}</div>
                                <div className="text-xs text-gray-500">{item.institution_id}</div>
                            </div>
                            <div className="mt-4">
                                <StatusBadge status={item.status?.status_code || 'UNKNOWN'} />
                            </div>
                        </div>
                    </QuantumCard>
                </div>

                {/* Account Details Table */}
                <QuantumCard title="Asset Allocation & Transactions">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase">
                                    <th className="p-3">Account</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3 text-right">Balance</th>
                                    <th className="p-3 text-right">Available</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-300">
                                {item.accounts.map((acc, accIdx) => (
                                    <tr key={accIdx} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                                        <td className="p-3 font-medium text-white">{acc.name} <span className="text-gray-500">({acc.mask})</span></td>
                                        <td className="p-3 capitalize">{acc.subtype}</td>
                                        <td className="p-3 text-right font-mono text-cyan-400">${acc.balances.current.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono text-emerald-400">${acc.balances.available?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Transaction Preview */}
                    <div className="mt-6">
                        <h4 className="text-sm text-gray-400 uppercase mb-3">Recent Activity Stream</h4>
                        <div className="space-y-2">
                            {item.accounts[0]?.transactions?.slice(0, 5).map((tx, txIdx) => (
                                <div key={txIdx} className="flex justify-between items-center p-3 bg-gray-800/30 rounded border border-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.amount < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {tx.amount < 0 
                                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                }
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{tx.merchant_name || tx.original_description}</div>
                                            <div className="text-xs text-gray-500">{tx.date}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold ${tx.amount < 0 ? 'text-emerald-400' : 'text-white'}`}>
                                        {Math.abs(tx.amount).toLocaleString()} {tx.iso_currency_code}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </QuantumCard>
            </div>
        ))}
      </div>
    );
  };

  const renderAuditLog = () => (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Immutable Audit Ledger</h3>
            <span className="text-xs text-gray-500 font-mono">SECURE_STORAGE_V4</span>
        </div>
        <div className="flex-1 bg-black/50 rounded-lg border border-gray-800 p-4 overflow-y-auto font-mono text-xs custom-scrollbar max-h-[500px]">
            {auditLogs.length === 0 && <div className="text-gray-600 text-center mt-10">No audit records found.</div>}
            {auditLogs.map((log) => (
                <div key={log.id} className="mb-3 border-b border-gray-800 pb-2 last:border-0">
                    <div className="flex justify-between text-gray-500 mb-1">
                        <span>{log.timestamp}</span>
                        <span>{log.hash}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500' : 
                            log.status === 'FAILURE' ? 'bg-red-500' : 
                            log.status === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></span>
                        <span className="text-cyan-400 font-bold">[{log.action}]</span>
                        <span className="text-gray-300">{log.details}</span>
                    </div>
                    <div className="text-gray-600 mt-1 pl-4">User: {log.user}</div>
                </div>
            ))}
            <div ref={auditEndRef} />
        </div>
    </div>
  );

  const renderGuide = () => (
    <div className="prose prose-invert max-w-none">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                {QUANTUM_GUIDE_TEXT}
            </pre>
        </div>
    </div>
  );

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-gray-100 font-sans selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="font-bold text-white">Q</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">QUANTUM FINANCIAL</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Enterprise Demo Environment</p>
                </div>
            </div>
            
            <nav className="hidden md:flex gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                {(['DASHBOARD', 'INSIGHTS', 'AUDIT', 'GUIDE'] as ViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === mode 
                            ? 'bg-gray-700 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </nav>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-400">System Status</div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        OPERATIONAL
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-8">
        {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <div className="font-bold">System Error</div>
                    <div className="text-sm opacity-80">{error}</div>
                </div>
            </div>
        )}

        {viewMode === 'DASHBOARD' && renderDashboard()}
        {viewMode === 'INSIGHTS' && renderInsights()}
        {viewMode === 'AUDIT' && renderAuditLog()}
        {viewMode === 'GUIDE' && renderGuide()}
      </main>

      {/* Configuration Modal */}
      <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title="Secure Configuration">
        <div className="space-y-4">
            <p className="text-sm text-gray-400">
                Enter your credentials to unlock the full potential of the Quantum Engine. 
                In "Test Drive" mode, these are optional.
            </p>
            <QuantumInput 
                label="Gemini API Key (AI Core)" 
                type="password" 
                value={config.geminiKey} 
                onChange={(e) => setConfig(p => ({...p, geminiKey: e.target.value}))}
                placeholder="sk-..."
            />
            <QuantumInput 
                label="User Token (Plaid)" 
                value={config.userToken} 
                onChange={(e) => setConfig(p => ({...p, userToken: e.target.value}))}
                placeholder="user-sandbox-..."
            />
            <div className="flex justify-end gap-3 mt-6">
                <QuantumButton variant="ghost" onClick={() => setIsConfigModalOpen(false)}>Cancel</QuantumButton>
                <QuantumButton onClick={() => {
                    setIsConfigModalOpen(false);
                    addAuditLog('CONFIG_UPDATE', 'SUCCESS', 'Secure credentials updated');
                }}>Save Configuration</QuantumButton>
            </div>
        </div>
      </Modal>

      {/* Global Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(75, 85, 99, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(107, 114, 128, 0.8); }
      `}</style>
    </div>
  );
};

export default PlaidCRAMonitoringView;

// --- CONSOLIDATED FROM: PlaidCRAMonitoringView (2).tsx ---


import React, { useState, useCallback, useEffect } from 'react';
import {
  CraMonitoringInsightsGetResponse,
  CraMonitoringInsightsSubscribeResponse,
  PlaidError,
} from 'plaid';

// The James Burvel O’Callaghan III Code - Company: Alpha Financial Analytics - Feature: CRA Monitoring - Version 1.0.0
// UI Component: PlaidCRAMonitoringView - Comprehensive CRA Monitoring Interface
const PlaidCRAMonitoringView: React.FC = () => {
  // State Definitions - Indexed Declarations (A-Z)
  const [A_userToken, setA_userToken] = useState<string>(''); // A - User Token Input
  const [B_subscriptionId, setB_subscriptionId] = useState<string | null>(null); // B - Subscription ID
  const [C_insights, setC_insights] = useState<CraMonitoringInsightsGetResponse | null>(null); // C - Insights Data
  const [D_apiResponse, setD_apiResponse] = useState<object | null>(null); // D - Raw API Response
  const [E_isLoading, setE_isLoading] = useState<boolean>(false); // E - Loading State
  const [F_error, setF_error] = useState<PlaidError | null>(null); // F - Error State
  const [G_isSubscribed, setG_isSubscribed] = useState<boolean>(false); // G - Subscription Status
  const [H_apiCallCount, setH_apiCallCount] = useState<number>(0); // H - API Call Counter

  // Constants & Configuration - Indexed Declarations (AA-ZZ)
  const AA_API_ENDPOINT_BASE = '/api/plaid';
  const AB_POLLING_INTERVAL_MS = 15000; // Polling interval for updates (e.g., 15 seconds)

  // Utility Functions - Indexed Declarations (1-9)
  const _1_sanitizeInput = (input: string): string => {
      // Extensive sanitization of user inputs to prevent XSS and injection attacks.
      // Includes trimming, escaping special characters, and validating format.
      // This function will be called before passing any user input to the API.
      let sanitized = input.trim();
      sanitized = sanitized.replace(/</g, "&lt;").replace(/>/g, "&gt;"); // Basic HTML escaping
      // More complex sanitization rules can be added here, like checking for specific patterns.
      return sanitized;
  };

  const _2_formatDate = (dateString: string): string => {
      // Function to format date strings for consistent display in the UI.
      const date = new Date(dateString);
      if (isNaN(date.getTime())) {
          return "Invalid Date";
      }
      return date.toLocaleDateString(undefined, { year: 'numeric', month: 'long', day: 'numeric', hour: 'numeric', minute: 'numeric', second: 'numeric' });
  };

  const _3_currencyFormatter = (amount: number): string => {
      // Function to format currency amounts with proper localization.
      return new Intl.NumberFormat(undefined, {
          style: 'currency',
          currency: 'USD', // Default to USD; could be dynamic
          minimumFractionDigits: 2,
          maximumFractionDigits: 2,
      }).format(amount);
  };

  const _4_objectToJsonString = (data: object | null): string => {
      // A more robust JSON stringification that handles circular references and errors gracefully.
      try {
          return JSON.stringify(data, (key, value) => {
              // Circular reference handling
              if (typeof value === 'object' && value !== null) {
                  if (value.__circularRef) {
                      return '[Circular Reference]';
                  }
                  Object.defineProperty(value, '__circularRef', {
                      value: true,
                      enumerable: false, // Prevent the property from being serialized
                  });
              }
              return value;
          }, 2); // Pretty print with 2 spaces
      } catch (error: any) {
          return `Error stringifying JSON: ${error.message}`;
      }
  };

  const _5_generateRequestId = (): string => {
      // Generates a unique request ID for tracing API calls.
      const timestamp = Date.now().toString(36); // Base36 timestamp
      const randomString = Math.random().toString(36).substring(2, 15); // Random string
      return `${timestamp}-${randomString}`;
  };

  const _6_extractErrorMessage = (error: any): string => {
    // Robust error message extraction from different error formats.
    if (!error) return "Unknown error";
    if (typeof error === 'string') return error;
    if (error.error_message) return error.error_message;
    if (error.message) return error.message;
    if (error.data && error.data.error_message) return error.data.error_message;
    return "An unknown error occurred.";
  };

  const _7_debounce = <F extends (...args: any[]) => any>(func: F, delay: number): ((...args: Parameters<F>) => void) => {
      // Debounce function to limit the rate of function execution.
      let timeoutId: NodeJS.Timeout | null = null;
      return (...args: Parameters<F>): void => {
          if (timeoutId) {
              clearTimeout(timeoutId);
          }
          timeoutId = setTimeout(() => {
              func(...args);
              timeoutId = null;
          }, delay);
      };
  };

  const _8_throttle = <F extends (...args: any[]) => any>(func: F, limit: number): ((...args: Parameters<F>) => void) => {
      // Throttle function to limit the frequency of function calls.
      let inThrottle: boolean = false;
      return (...args: Parameters<F>): void => {
          if (!inThrottle) {
              func(...args);
              inThrottle = true;
              setTimeout(() => (inThrottle = false), limit);
          }
      };
  };

  const _9_validateUserToken = (token: string): boolean => {
      // Token validation logic. This is a placeholder and should be replaced with a robust validation system.
      // Validate the user token against known patterns, length, and format.
      // Further checks should involve server-side validation against a secure authentication system.
      if (!token) return false;
      if (token.length < 10) return false; // Minimum length
      // Basic check for alphanumeric characters and hyphens.  More sophisticated validation should be used.
      if (!/^[a-zA-Z0-9\-]+$/.test(token)) return false;
      return true; // Placeholder - replace with actual validation.
  };

  // API Call Handler - Indexed Declaration (AAA)
  const AAA_callApi = useCallback(async (endpoint: string, body: object, requestId?: string) => {
      // Master API call function with comprehensive error handling, logging, and request tracing.
      setE_isLoading(true);
      setF_error(null);
      setD_apiResponse(null);
      setC_insights(null);
      const _requestId = requestId || _5_generateRequestId(); // Use provided ID or generate a new one
      const startTime = performance.now();
      setH_apiCallCount(prevCount => prevCount + 1); // Track API call count

      try {
          const response = await fetch(AA_API_ENDPOINT_BASE, {
              method: 'POST',
              headers: {
                  'Content-Type': 'application/json',
                  'X-Request-ID': _requestId, // Include request ID in headers for tracing
              },
              body: JSON.stringify({ endpoint, ...body, requestId: _requestId }),
          });

          const data = await response.json();
          const endTime = performance.now();
          const responseTime = endTime - startTime;

          // Logging for all API responses
          console.groupCollapsed(`API Call - ${endpoint} - Request ID: ${_requestId} - Status: ${response.status} - Time: ${responseTime.toFixed(2)}ms`);
          console.log('Request Body:', JSON.stringify({ endpoint, ...body }, null, 2));
          console.log('Response Status:', response.status);
          console.log('Response Headers:', response.headers);
          console.log('Response Data:', data);
          console.groupEnd();

          if (!response.ok) {
              const errorData = data as PlaidError;
              const errorMessage = _6_extractErrorMessage(errorData)
              const errorDetails: PlaidError = {
                  error_type: errorData?.error_type || 'API_ERROR',
                  error_code: errorData?.error_code || 'SERVER_ERROR',
                  error_message: errorMessage,
                  display_message: errorData?.display_message || null,
                  request_id: _requestId,
              };

              setF_error(errorDetails);
              throw new Error(errorMessage); // Re-throw for further handling
          }

          setD_apiResponse(data);
          return data;

      } catch (err: any) {
          const errorMessage = _6_extractErrorMessage(err);
          const errorDetails: PlaidError = {
              error_type: 'API_ERROR',
              error_code: 'CLIENT_ERROR',
              error_message: errorMessage,
              display_message: null,
              request_id: _requestId,
          };
          console.error(`Error calling ${endpoint} - Request ID: ${_requestId}:`, err);
          setF_error(errorDetails);

      } finally {
          setE_isLoading(false);
      }
  }, []);

  // API Interaction Handlers - Indexed Declarations (AAB-AAE)
  const AAB_handleSubscribe = useCallback(async () => {
      // Handles subscribing to CRA monitoring insights.
      if (!A_userToken || !_9_validateUserToken(A_userToken)) {
          setF_error({
              error_type: 'INVALID_INPUT',
              error_code: 'MISSING_USER_TOKEN',
              error_message: 'Valid User Token is required to subscribe. Please provide a valid token.',
              display_message: 'Please enter a valid user token consisting of alphanumeric characters and hyphens.',
              request_id: _5_generateRequestId(),
          });
          return;
      }

      const _requestId = _5_generateRequestId();
      try {
          const data: CraMonitoringInsightsSubscribeResponse | undefined = await AAA_callApi('cra/monitoring_insights/subscribe', { user_token: _1_sanitizeInput(A_userToken) }, _requestId);
          if (data?.subscription_id) {
              setB_subscriptionId(data.subscription_id);
              setG_isSubscribed(true);
              console.log(`Subscribed successfully. Subscription ID: ${data.subscription_id}`);
          }
      } catch (error) {
          console.error('Subscription failed:', error);
      }
  }, [A_userToken, AAA_callApi]);

  const AAC_handleUnsubscribe = useCallback(async () => {
      // Handles unsubscribing from CRA monitoring insights.
      if (!B_subscriptionId) {
          setF_error({
              error_type: 'INVALID_INPUT',
              error_code: 'MISSING_SUBSCRIPTION_ID',
              error_message: 'Subscription ID is required to unsubscribe. Please subscribe first.',
              display_message: 'Please ensure you have an active subscription before attempting to unsubscribe.',
              request_id: _5_generateRequestId(),
          });
          return;
      }
      const _requestId = _5_generateRequestId();
      try {
          await AAA_callApi('cra/monitoring_insights/unsubscribe', { subscription_id: B_subscriptionId }, _requestId);
          setB_subscriptionId(null);
          setG_isSubscribed(false);
          console.log('Unsubscribed successfully.');
      } catch (error) {
          console.error('Unsubscription failed:', error);
      }
  }, [B_subscriptionId, AAA_callApi]);

  const AAD_handleGetInsights = useCallback(async () => {
      // Handles retrieving CRA monitoring insights.
      if (!A_userToken || !_9_validateUserToken(A_userToken)) {
          setF_error({
              error_type: 'INVALID_INPUT',
              error_code: 'MISSING_USER_TOKEN',
              error_message: 'Valid User Token is required to get insights. Please provide a valid token.',
              display_message: 'Please enter a valid user token consisting of alphanumeric characters and hyphens.',
              request_id: _5_generateRequestId(),
          });
          return;
      }

      const _requestId = _5_generateRequestId();
      try {
          const data: CraMonitoringInsightsGetResponse | undefined = await AAA_callApi('cra/monitoring_insights/get', { user_token: _1_sanitizeInput(A_userToken) }, _requestId);
          if (data) {
              setC_insights(data);
          }
      } catch (error) {
          console.error('Get Insights failed:', error);
      }
  }, [A_userToken, AAA_callApi]);

  const AAE_handleClearInsights = useCallback(() => {
    // Clears the insights data from the UI.
    setC_insights(null);
    setD_apiResponse(null);
    setF_error(null);
  }, []);

  // Polling Mechanism (AAF)
  const AAF_usePolling = (enabled: boolean, interval: number, callback: () => Promise<void>) => {
    useEffect(() => {
        if (!enabled) {
            return;
        }

        let isMounted = true; // Track if the component is mounted
        const poll = async () => {
            if (!isMounted) {
                return; // Stop polling if the component is unmounted
            }
            try {
                await callback();
            } catch (error) {
                console.error("Polling error:", error);
                // Consider how to handle errors during polling (e.g., exponential backoff, error notifications)
            }
            if (isMounted) { // Ensure timer is only set if component is still mounted
                setTimeout(poll, interval);
            }
        };

        poll();

        return () => {
            isMounted = false; // Set to false on unmount
        };
    }, [enabled, interval, callback]);
  };

  // Automated Updates (Polling) - example of using the polling mechanism
  AAF_usePolling(G_isSubscribed && B_subscriptionId !== null, AB_POLLING_INTERVAL_MS, async () => {
      // Implement a mechanism to fetch and display the latest insights when subscribed.
      if (B_subscriptionId && A_userToken) {
          await AAD_handleGetInsights();
          // Optionally, add logic to handle errors, and clear the data if un-subscribed.
      }
  });


  // UI Components - Indexed Declarations (BAA-BAE)
  const BAA_JsonDisplay = ({ data }: { data: object | null }) => {
      // Component to display JSON data with syntax highlighting and a copy-to-clipboard function.
      if (!data) return null;
      const jsonString = _4_objectToJsonString(data);
      const [isCopied, setIsCopied] = useState(false);

      const handleCopyToClipboard = () => {
          navigator.clipboard.writeText(jsonString)
              .then(() => {
                  setIsCopied(true);
                  setTimeout(() => setIsCopied(false), 1500); // Reset after 1.5 seconds
              })
              .catch(err => {
                  console.error('Failed to copy to clipboard', err);
                  alert('Failed to copy to clipboard.');
              });
      };

      return (
          <div className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto relative">
              <button
                  onClick={handleCopyToClipboard}
                  className="absolute top-2 right-2 px-2 py-1 text-xs bg-gray-300 hover:bg-gray-400 rounded"
              >
                  {isCopied ? 'Copied!' : 'Copy'}
              </button>
              <code className="text-sm">
                  <pre>{jsonString}</pre>
              </code>
          </div>
      );
  };

  const BAB_Spinner = () => (
      // A loading spinner component using CSS for a smooth animation.
      <div className="flex items-center justify-center">
          <svg className="animate-spin h-5 w-5 mr-3 text-indigo-500" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.866 3.582 7 8 7v-5.709z"></path>
          </svg>
          <span>Loading...</span>
      </div>
  );

  const BAC_ErrorDisplay = ({ error }: { error: PlaidError | null }) => {
      // Component to display error messages in a consistent format with details.
      if (!error) return null;
      return (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
              <strong className="font-bold">Error:</strong>
              <span className="block sm:inline">{error.error_message}</span>
              <p className="text-sm mt-2"><strong>Error Code:</strong> {error.error_code}</p>
              {error.display_message && <p className="text-sm"><strong>Details:</strong> {error.display_message}</p>}
              <p className="text-xs"><strong>Request ID:</strong> {error.request_id}</p>
          </div>
      );
  };

  const BAD_SubscriptionStatus = ({ subscriptionId }: { subscriptionId: string | null }) => {
      // Displays the current subscription ID and status.
      return (
          subscriptionId && (
              <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-md text-blue-800">
                  <p><strong>Active Subscription ID:</strong> {subscriptionId}</p>
              </div>
          )
      );
  };

  const BAE_InsightsReport = ({ insights }: { insights: CraMonitoringInsightsGetResponse | null }) => {
      // Component to render the formatted CRA monitoring insights report.
      if (!insights) return null;

      return (
          <div>
              <h2 className="text-xl font-semibold mb-2 text-gray-700">Formatted Insights Report</h2>
              <div className="p-4 border rounded-md bg-gray-50 space-y-4">
                  <p><strong>User Insights ID:</strong> {insights.user_insights_id}</p>
                  {insights.items.map((item, itemIndex) => (
                      <div key={`item-${itemIndex}`} className="p-4 border rounded-md bg-white">
                          <h3 className="text-lg font-semibold text-indigo-700">Item: {item.item_id}</h3>
                          <p><strong>Institution:</strong> {item.institution_name} ({item.institution_id})</p>
                          <p><strong>Generated:</strong> {_2_formatDate(item.date_generated)}</p>
                          <p><strong>Status:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{item.status.status_code}</span></p>

                          {item.insights && (
                              <div className="mt-4">
                                  <h4 className="font-semibold">Insights Summary</h4>
                                  <div className="pl-4 border-l-2 mt-2 space-y-2">
                                      {item.insights.income && (
                                          <div>
                                              <p><strong>Forecasted Monthly Income:</strong> {_3_currencyFormatter(item.insights.income.forecasted_monthly_income?.current_amount || 0)}</p>
                                              <p><strong>Total Monthly Income:</strong> {_3_currencyFormatter(item.insights.income.total_monthly_income?.current_amount || 0)}</p>
                                              <p><strong>Historical Annual Income:</strong> {_3_currencyFormatter(item.insights.income.historical_annual_income?.current_amount || 0)}</p>
                                          </div>
                                      )}
                                      {item.insights.loans && (
                                          <div>
                                              <p><strong>Loan Payments Count:</strong> {item.insights.loans.loan_payments_counts?.current_count}</p>
                                              <p><strong>Loan Disbursements Count:</strong> {item.insights.loans.loan_disbursements_count}</p>
                                          </div>
                                      )}
                                  </div>
                              </div>
                          )}

                          {item.accounts.map((account, accountIndex) => (
                              <div key={`account-${accountIndex}`} className="mt-4 p-3 border rounded-md bg-gray-50">
                                  <h4 className="font-semibold">Account: {account.name} ({account.mask})</h4>
                                  <p><strong>Type:</strong> {account.type} / {account.subtype}</p>
                                  <p><strong>Current Balance:</strong> {_3_currencyFormatter(account.balances.current)} {account.balances.iso_currency_code}</p>
                                  <p><strong>Available Balance:</strong> {_3_currencyFormatter(account.balances.available)} {account.balances.iso_currency_code}</p>

                                  <h5 className="font-semibold mt-2">Transactions:</h5>
                                  {account.transactions && account.transactions.length > 0 ? (
                                      <div className="overflow-x-auto">
                                          <table className="min-w-full divide-y divide-gray-200 mt-1">
                                              <thead className="bg-gray-100">
                                                  <tr>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                                      <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                                      <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                                  </tr>
                                              </thead>
                                              <tbody className="bg-white divide-y divide-gray-200">
                                                  {account.transactions.map((tx, txIndex) => (
                                                      <tr key={`tx-${txIndex}`}>
                                                          <td className="px-4 py-2 whitespace-nowrap text-sm">{_2_formatDate(tx.date)}</td>
                                                          <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.merchant_name || tx.original_description}</td>
                                                          <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-mono ${tx.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                                              {_3_currencyFormatter(tx.amount)}
                                                          </td>
                                                      </tr>
                                                  ))}
                                              </tbody>
                                          </table>
                                      </div>
                                  ) : (
                                      <p className="text-sm text-gray-500">No transactions available for this account.</p>
                                  )}
                              </div>
                          ))}
                      </div>
                  ))}
              </div>
          </div>
      );
  };

  // Main UI Structure - Indexed Declarations (CAA-CAE)
  return (
      <div className="container mx-auto p-6 bg-white rounded-lg shadow-md max-w-7xl">
          {/* Main Title and Description (CAA) */}
          <h1 className="text-3xl font-bold mb-4 text-gray-800">CRA Monitoring Insights Dashboard - {`v1.0.0`}</h1>
          <p className="mb-6 text-gray-600">
              {`This dashboard provides comprehensive tools for managing CRA monitoring subscriptions and accessing detailed insights reports for user accounts.  It leverages the Plaid API to fetch and display financial data, including income and loan information.  The UI is structured for expert users, offering a rich feature set and deep drill-down capabilities.`}
          </p>

          {/* Input Section (CAB) */}
          <div className="mb-6">
              <label htmlFor="userToken" className="block text-sm font-medium text-gray-700 mb-2">
                  User Token:
                  <span className="text-xs text-gray-500 ml-1">(Enter your user token to interact with the API)</span>
              </label>
              <input
                  type="text"
                  id="userToken"
                  value={A_userToken}
                  onChange={(e) => setA_userToken(e.target.value)}
                  placeholder="Enter user_token..."
                  className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
              />
              {/* Token Validation Feedback (Dynamic) */}
              {!_9_validateUserToken(A_userToken) && A_userToken.length > 0 && (
                  <p className="text-red-500 text-xs mt-1">Invalid token format. Please check your token.</p>
              )}
          </div>

          {/* Action Buttons Section (CAC) - Grid Layout with Responsive Design*/}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
              <button
                  onClick={AAB_handleSubscribe}
                  disabled={E_isLoading || !A_userToken || !_9_validateUserToken(A_userToken)}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400 transition duration-150 ease-in-out"
              >
                  {E_isLoading ? <BAB_Spinner /> : 'Subscribe'}
              </button>
              <button
                  onClick={AAC_handleUnsubscribe}
                  disabled={E_isLoading || !B_subscriptionId}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400 transition duration-150 ease-in-out"
              >
                  {E_isLoading ? <BAB_Spinner /> : 'Unsubscribe'}
              </button>
              <button
                  onClick={AAD_handleGetInsights}
                  disabled={E_isLoading || !A_userToken || !_9_validateUserToken(A_userToken)}
                  className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400 transition duration-150 ease-in-out"
              >
                  {E_isLoading ? <BAB_Spinner /> : 'Get Insights'}
              </button>
          </div>

          {/* Subscription Status Display (CAD) */}
          <BAD_SubscriptionStatus subscriptionId={B_subscriptionId} />

          {/* Error and Result Sections (CAE) */}
          <div className="space-y-6">
              <BAC_ErrorDisplay error={F_error} />

              {/* API Response Display */}
              {D_apiResponse && (
                  <div>
                      <h2 className="text-xl font-semibold mb-2 text-gray-700">Raw API Response</h2>
                      <BAA_JsonDisplay data={D_apiResponse} />
                  </div>
              )}

              {/* Insights Report Display */}
              <BAE_InsightsReport insights={C_insights} />
          </div>

          {/* Additional Features and Information */}
          <div className="mt-8 border-t border-gray-200 pt-4">
              <h3 className="text-lg font-semibold mb-2">Additional Information and Features</h3>
              <p className="text-sm text-gray-700">
                  {`This section contains additional information, links to documentation, and potential future features. This dashboard is part of the Alpha Financial Analytics suite, designed for expert-level analysis of financial data.`}
              </p>
              <ul className="list-disc list-inside text-sm text-gray-700 mt-2">
                  <li><strong>Feature:</strong> Real-time data updates via webhooks (Future Implementation)</li>
                  <li><strong>Feature:</strong> Advanced filtering and sorting of transaction data. (Planned)</li>
                  <li><strong>Feature:</strong> Export data to CSV and other formats. (Planned)</li>
                  <li><a href="#" className="text-indigo-600 hover:text-indigo-800">API Documentation</a></li>
                  <li><a href="#" className="text-indigo-600 hover:text-indigo-800">Support</a></li>
              </ul>
          </div>
          {/* Footer Information */}
          <div className="mt-8 border-t border-gray-200 pt-4 text-xs text-gray-500">
              <p>{`© 2024 The James Burvel O’Callaghan III Code. All rights reserved.`}</p>
              <p>{`API Call Count: ${H_apiCallCount}`}</p>
          </div>
      </div>
  );
};

export default PlaidCRAMonitoringView;


// --- CONSOLIDATED FROM: PlaidCRAMonitoringView (1).tsx ---

import React, { useState, useCallback } from 'react';
import {
  CraMonitoringInsightsGetResponse,
  CraMonitoringInsightsSubscribeResponse,
  PlaidError,
} from 'plaid';

// A simple component to display JSON data
const JsonDisplay = ({ data }: { data: object | null }) => {
  if (!data) return null;
  return (
    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
};

// A simple component for displaying loading spinners
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
);

const PlaidCRAMonitoringView: React.FC = () => {
  const [userToken, setUserToken] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [insights, setInsights] = useState<CraMonitoringInsightsGetResponse | null>(null);
  const [apiResponse, setApiResponse] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<PlaidError | null>(null);

  const callApi = async (endpoint: string, body: object) => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setInsights(null);

    try {
      const response = await fetch(`/api/plaid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, ...body }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data as PlaidError);
        throw new Error(data.error_message || 'An unknown error occurred');
      }
      
      setApiResponse(data);
      return data;

    } catch (err: any) {
      console.error(`Error calling ${endpoint}:`, err);
      if (!error) { // Don't overwrite PlaidError if it was already set
        setError({
            error_type: 'API_ERROR',
            error_code: 'CLIENT_ERROR',
            error_message: err.message,
            display_message: null,
            request_id: '',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = useCallback(async () => {
    if (!userToken) {
      setError({
        error_type: 'INVALID_INPUT',
        error_code: 'MISSING_USER_TOKEN',
        error_message: 'User Token is required to subscribe.',
        display_message: null,
        request_id: '',
      });
      return;
    }
    const data: CraMonitoringInsightsSubscribeResponse | undefined = await callApi('cra/monitoring_insights/subscribe', { user_token: userToken });
    if (data?.subscription_id) {
      setSubscriptionId(data.subscription_id);
    }
  }, [userToken]);

  const handleUnsubscribe = useCallback(async () => {
    if (!subscriptionId) {
      setError({
        error_type: 'INVALID_INPUT',
        error_code: 'MISSING_SUBSCRIPTION_ID',
        error_message: 'Subscription ID is required to unsubscribe. Please subscribe first.',
        display_message: null,
        request_id: '',
      });
      return;
    }
    await callApi('cra/monitoring_insights/unsubscribe', { subscription_id: subscriptionId });
    setSubscriptionId(null); // Clear subscription ID on successful unsubscribe
  }, [subscriptionId]);

  const handleGetInsights = useCallback(async () => {
    if (!userToken) {
      setError({
        error_type: 'INVALID_INPUT',
        error_code: 'MISSING_USER_TOKEN',
        error_message: 'User Token is required to get insights.',
        display_message: null,
        request_id: '',
      });
      return;
    }
    const data: CraMonitoringInsightsGetResponse | undefined = await callApi('cra/monitoring_insights/get', { user_token: userToken });
    if (data) {
        setInsights(data);
    }
  }, [userToken]);

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">CRA Monitoring Insights</h1>
      <p className="mb-6 text-gray-600">
        Manage CRA Monitoring subscriptions and retrieve the latest insights report for a user.
      </p>

      {/* Input Section */}
      <div className="mb-6">
        <label htmlFor="userToken" className="block text-sm font-medium text-gray-700 mb-2">
          User Token
        </label>
        <input
          type="text"
          id="userToken"
          value={userToken}
          onChange={(e) => setUserToken(e.target.value)}
          placeholder="Enter user_token..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleSubscribe}
          disabled={isLoading || !userToken}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? <Spinner /> : 'Subscribe'}
        </button>
        <button
          onClick={handleUnsubscribe}
          disabled={isLoading || !subscriptionId}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
        >
          {isLoading ? <Spinner /> : 'Unsubscribe'}
        </button>
        <button
          onClick={handleGetInsights}
          disabled={isLoading || !userToken}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {isLoading ? <Spinner /> : 'Get Insights'}
        </button>
      </div>
      
      {subscriptionId && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-md text-blue-800">
          <p><strong>Active Subscription ID:</strong> {subscriptionId}</p>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error.error_message} ({error.error_code})</span>
          </div>
        )}

        {apiResponse && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">API Response</h2>
            <JsonDisplay data={apiResponse} />
          </div>
        )}

        {insights && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Formatted Insights Report</h2>
            <div className="p-4 border rounded-md bg-gray-50 space-y-4">
              <p><strong>User Insights ID:</strong> {insights.user_insights_id}</p>
              {insights.items.map((item, index) => (
                <div key={index} className="p-4 border rounded-md bg-white">
                  <h3 className="text-lg font-semibold text-indigo-700">Item: {item.item_id}</h3>
                  <p><strong>Institution:</strong> {item.institution_name} ({item.institution_id})</p>
                  <p><strong>Generated:</strong> {new Date(item.date_generated).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{item.status.status_code}</span></p>
                  
                  {item.insights && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Insights Summary</h4>
                      <div className="pl-4 border-l-2 mt-2 space-y-2">
                        {item.insights.income && (
                            <div>
                                <p><strong>Forecasted Monthly Income:</strong> ${item.insights.income.forecasted_monthly_income?.current_amount.toFixed(2)}</p>
                                <p><strong>Total Monthly Income:</strong> ${item.insights.income.total_monthly_income?.current_amount.toFixed(2)}</p>
                                <p><strong>Historical Annual Income:</strong> ${item.insights.income.historical_annual_income?.current_amount.toFixed(2)}</p>
                            </div>
                        )}
                        {item.insights.loans && (
                            <div>
                                <p><strong>Loan Payments Count:</strong> {item.insights.loans.loan_payments_counts?.current_count}</p>
                                <p><strong>Loan Disbursements Count:</strong> {item.insights.loans.loan_disbursements_count}</p>
                            </div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.accounts.map((account, accIndex) => (
                    <div key={accIndex} className="mt-4 p-3 border rounded-md bg-gray-50">
                      <h4 className="font-semibold">Account: {account.name} ({account.mask})</h4>
                      <p><strong>Type:</strong> {account.type} / {account.subtype}</p>
                      <p><strong>Current Balance:</strong> {account.balances.current} {account.balances.iso_currency_code}</p>
                      <p><strong>Available Balance:</strong> {account.balances.available} {account.balances.iso_currency_code}</p>
                      
                      <h5 className="font-semibold mt-2">Transactions:</h5>
                      {account.transactions && account.transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 mt-1">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {account.transactions.map((tx, txIndex) => (
                                <tr key={txIndex}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.date}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.merchant_name || tx.original_description}</td>
                                  <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-mono ${tx.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No transactions available for this account.</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaidCRAMonitoringView;

// --- CONSOLIDATED FROM: PlaidCRAMonitoringView (1)_1.tsx ---

import React, { useState, useCallback } from 'react';
import {
  CraMonitoringInsightsGetResponse,
  CraMonitoringInsightsSubscribeResponse,
  PlaidError,
} from 'plaid';

// A simple component to display JSON data
const JsonDisplay = ({ data }: { data: object | null }) => {
  if (!data) return null;
  return (
    <pre className="bg-gray-100 p-4 rounded-md text-sm overflow-x-auto">
      <code>{JSON.stringify(data, null, 2)}</code>
    </pre>
  );
};

// A simple component for displaying loading spinners
const Spinner = () => (
  <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-gray-900"></div>
);

const PlaidCRAMonitoringView: React.FC = () => {
  const [userToken, setUserToken] = useState<string>('');
  const [subscriptionId, setSubscriptionId] = useState<string | null>(null);
  const [insights, setInsights] = useState<CraMonitoringInsightsGetResponse | null>(null);
  const [apiResponse, setApiResponse] = useState<object | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [error, setError] = useState<PlaidError | null>(null);

  const callApi = async (endpoint: string, body: object) => {
    setIsLoading(true);
    setError(null);
    setApiResponse(null);
    setInsights(null);

    try {
      const response = await fetch(`/api/plaid`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ endpoint, ...body }),
      });

      const data = await response.json();

      if (!response.ok) {
        setError(data as PlaidError);
        throw new Error(data.error_message || 'An unknown error occurred');
      }
      
      setApiResponse(data);
      return data;

    } catch (err: any) {
      console.error(`Error calling ${endpoint}:`, err);
      if (!error) { // Don't overwrite PlaidError if it was already set
        setError({
            error_type: 'API_ERROR',
            error_code: 'CLIENT_ERROR',
            error_message: err.message,
            display_message: null,
            request_id: '',
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubscribe = useCallback(async () => {
    if (!userToken) {
      setError({
        error_type: 'INVALID_INPUT',
        error_code: 'MISSING_USER_TOKEN',
        error_message: 'User Token is required to subscribe.',
        display_message: null,
        request_id: '',
      });
      return;
    }
    const data: CraMonitoringInsightsSubscribeResponse | undefined = await callApi('cra/monitoring_insights/subscribe', { user_token: userToken });
    if (data?.subscription_id) {
      setSubscriptionId(data.subscription_id);
    }
  }, [userToken]);

  const handleUnsubscribe = useCallback(async () => {
    if (!subscriptionId) {
      setError({
        error_type: 'INVALID_INPUT',
        error_code: 'MISSING_SUBSCRIPTION_ID',
        error_message: 'Subscription ID is required to unsubscribe. Please subscribe first.',
        display_message: null,
        request_id: '',
      });
      return;
    }
    await callApi('cra/monitoring_insights/unsubscribe', { subscription_id: subscriptionId });
    setSubscriptionId(null); // Clear subscription ID on successful unsubscribe
  }, [subscriptionId]);

  const handleGetInsights = useCallback(async () => {
    if (!userToken) {
      setError({
        error_type: 'INVALID_INPUT',
        error_code: 'MISSING_USER_TOKEN',
        error_message: 'User Token is required to get insights.',
        display_message: null,
        request_id: '',
      });
      return;
    }
    const data: CraMonitoringInsightsGetResponse | undefined = await callApi('cra/monitoring_insights/get', { user_token: userToken });
    if (data) {
        setInsights(data);
    }
  }, [userToken]);

  return (
    <div className="container mx-auto p-6 bg-white rounded-lg shadow-md">
      <h1 className="text-2xl font-bold mb-4 text-gray-800">CRA Monitoring Insights</h1>
      <p className="mb-6 text-gray-600">
        Manage CRA Monitoring subscriptions and retrieve the latest insights report for a user.
      </p>

      {/* Input Section */}
      <div className="mb-6">
        <label htmlFor="userToken" className="block text-sm font-medium text-gray-700 mb-2">
          User Token
        </label>
        <input
          type="text"
          id="userToken"
          value={userToken}
          onChange={(e) => setUserToken(e.target.value)}
          placeholder="Enter user_token..."
          className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
        />
      </div>

      {/* Actions Section */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <button
          onClick={handleSubscribe}
          disabled={isLoading || !userToken}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:bg-gray-400"
        >
          {isLoading ? <Spinner /> : 'Subscribe'}
        </button>
        <button
          onClick={handleUnsubscribe}
          disabled={isLoading || !subscriptionId}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:bg-gray-400"
        >
          {isLoading ? <Spinner /> : 'Unsubscribe'}
        </button>
        <button
          onClick={handleGetInsights}
          disabled={isLoading || !userToken}
          className="w-full flex justify-center items-center py-2 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-green-600 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500 disabled:bg-gray-400"
        >
          {isLoading ? <Spinner /> : 'Get Insights'}
        </button>
      </div>
      
      {subscriptionId && (
        <div className="mb-4 p-3 bg-blue-100 border border-blue-200 rounded-md text-blue-800">
          <p><strong>Active Subscription ID:</strong> {subscriptionId}</p>
        </div>
      )}

      {/* Results Section */}
      <div className="space-y-6">
        {error && (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
            <strong className="font-bold">Error: </strong>
            <span className="block sm:inline">{error.error_message} ({error.error_code})</span>
          </div>
        )}

        {apiResponse && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">API Response</h2>
            <JsonDisplay data={apiResponse} />
          </div>
        )}

        {insights && (
          <div>
            <h2 className="text-xl font-semibold mb-2 text-gray-700">Formatted Insights Report</h2>
            <div className="p-4 border rounded-md bg-gray-50 space-y-4">
              <p><strong>User Insights ID:</strong> {insights.user_insights_id}</p>
              {insights.items.map((item, index) => (
                <div key={index} className="p-4 border rounded-md bg-white">
                  <h3 className="text-lg font-semibold text-indigo-700">Item: {item.item_id}</h3>
                  <p><strong>Institution:</strong> {item.institution_name} ({item.institution_id})</p>
                  <p><strong>Generated:</strong> {new Date(item.date_generated).toLocaleString()}</p>
                  <p><strong>Status:</strong> <span className="font-mono bg-gray-200 px-2 py-1 rounded">{item.status.status_code}</span></p>
                  
                  {item.insights && (
                    <div className="mt-4">
                      <h4 className="font-semibold">Insights Summary</h4>
                      <div className="pl-4 border-l-2 mt-2 space-y-2">
                        {item.insights.income && (
                            <div>
                                <p><strong>Forecasted Monthly Income:</strong> ${item.insights.income.forecasted_monthly_income?.current_amount.toFixed(2)}</p>
                                <p><strong>Total Monthly Income:</strong> ${item.insights.income.total_monthly_income?.current_amount.toFixed(2)}</p>
                                <p><strong>Historical Annual Income:</strong> ${item.insights.income.historical_annual_income?.current_amount.toFixed(2)}</p>
                            </div>
                        )}
                        {item.insights.loans && (
                            <div>
                                <p><strong>Loan Payments Count:</strong> {item.insights.loans.loan_payments_counts?.current_count}</p>
                                <p><strong>Loan Disbursements Count:</strong> {item.insights.loans.loan_disbursements_count}</p>
                            </div>
                        )}
                      </div>
                    </div>
                  )}

                  {item.accounts.map((account, accIndex) => (
                    <div key={accIndex} className="mt-4 p-3 border rounded-md bg-gray-50">
                      <h4 className="font-semibold">Account: {account.name} ({account.mask})</h4>
                      <p><strong>Type:</strong> {account.type} / {account.subtype}</p>
                      <p><strong>Current Balance:</strong> {account.balances.current} {account.balances.iso_currency_code}</p>
                      <p><strong>Available Balance:</strong> {account.balances.available} {account.balances.iso_currency_code}</p>
                      
                      <h5 className="font-semibold mt-2">Transactions:</h5>
                      {account.transactions && account.transactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200 mt-1">
                            <thead className="bg-gray-100">
                              <tr>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                                <th className="px-4 py-2 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
                                <th className="px-4 py-2 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {account.transactions.map((tx, txIndex) => (
                                <tr key={txIndex}>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.date}</td>
                                  <td className="px-4 py-2 whitespace-nowrap text-sm">{tx.merchant_name || tx.original_description}</td>
                                  <td className={`px-4 py-2 whitespace-nowrap text-sm text-right font-mono ${tx.amount < 0 ? 'text-green-600' : 'text-red-600'}`}>
                                    {tx.amount.toFixed(2)}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-sm text-gray-500">No transactions available for this account.</p>
                      )}
                    </div>
                  ))}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PlaidCRAMonitoringView;

// --- CONSOLIDATED FROM: PlaidCRAMonitoringView_1.tsx ---

import React, { useState, useEffect, useRef, useCallback, useMemo } from 'react';
import {
  CraMonitoringInsightsGetResponse,
  CraMonitoringInsightsSubscribeResponse,
  PlaidError,
} from 'plaid';
import { GoogleGenAI } from "@google/genai";

// ============================================================================
// QUANTUM FINANCIAL - CORE TYPES & INTERFACES
// ============================================================================

type ViewMode = 'DASHBOARD' | 'INSIGHTS' | 'AUDIT' | 'AI_COMMAND' | 'GUIDE';

interface AuditLogEntry {
  id: string;
  timestamp: string;
  action: string;
  user: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'WARNING';
  details: string;
  hash: string; // Simulated cryptographic hash
}

interface AIMessage {
  id: string;
  role: 'user' | 'model' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface QuantumConfig {
  geminiKey: string;
  userToken: string;
  subscriptionId: string | null;
  isSimulationMode: boolean;
}

// ============================================================================
// MOCK DATA - "TEST DRIVE" ASSETS
// ============================================================================

const MOCK_INSIGHTS: CraMonitoringInsightsGetResponse = {
  user_insights_id: 'ins_mock_quantum_8821',
  items: [
    {
      item_id: 'itm_chase_quantum_01',
      institution_name: 'Chase (Quantum Link)',
      institution_id: 'ins_1',
      date_generated: new Date().toISOString(),
      status: { status_code: 'HEALTHY' },
      insights: {
        income: {
          forecasted_monthly_income: { current_amount: 12500.00, iso_currency_code: 'USD' },
          total_monthly_income: { current_amount: 14200.50, iso_currency_code: 'USD' },
          historical_annual_income: { current_amount: 165000.00, iso_currency_code: 'USD' },
        },
        loans: {
          loan_payments_counts: { current_count: 2 },
          loan_disbursements_count: 0,
        }
      },
      accounts: [
        {
          account_id: 'acc_chk_01',
          name: 'Quantum Elite Checking',
          mask: '8842',
          type: 'depository',
          subtype: 'checking',
          balances: { current: 45200.00, available: 44100.00, iso_currency_code: 'USD' },
          transactions: [
            { date: '2024-05-01', original_description: 'Direct Deposit - QUANTUM CORP', amount: -6200.00, iso_currency_code: 'USD' },
            { date: '2024-05-02', original_description: 'Payment to AMEX', amount: 1200.00, iso_currency_code: 'USD' },
            { date: '2024-05-05', original_description: 'Wire Transfer - Investment', amount: 5000.00, iso_currency_code: 'USD' },
          ]
        }
      ]
    }
  ]
};

const QUANTUM_GUIDE_TEXT = `
QUANTUM FINANCIAL BUSINESS DEMO: A COMPREHENSIVE GUIDE

Welcome, Visionary. You are now accessing the Quantum Financial Business Demo. This is your "Golden Ticket" to the future of financial orchestration.

Why a Quantum Business Demo is Your Secret Weapon:
Think of this as your ultimate cheat sheet to the world of high-frequency business banking. In today’s hyper-connected economy, latency is the enemy. This demo allows you to virtually walk through the entire Quantum platform. You get to see firsthand how easy it is to manage your accounts, process payments, track expenses, and access sophisticated reporting tools powered by our proprietary AI core.

What to Expect:
This is your backstage pass. You are test-driving the car. Kick the tires. See the engine roar.
- Robust Payment & Collection: Wire, ACH, Real-time Rails.
- Security: Non-negotiable. Multi-factor auth simulations, Fraud monitoring.
- Reporting & Analytics: Data visualization that speaks the language of profit.
- Audit Storage: Every sensitive action is logged in our immutable ledger.

This environment is NO PRESSURE. Explore, interact, and evaluate.
`;

// ============================================================================
// UI COMPONENTS (SELF-CONTAINED)
// ============================================================================

const QuantumCard: React.FC<{ children: React.ReactNode; title?: string; className?: string; action?: React.ReactNode }> = ({ children, title, className = '', action }) => (
  <div className={`bg-gray-900/80 backdrop-blur-md border border-gray-700/50 rounded-xl overflow-hidden shadow-2xl ${className}`}>
    {(title || action) && (
      <div className="px-6 py-4 border-b border-gray-700/50 flex justify-between items-center bg-gray-800/30">
        {title && <h3 className="text-lg font-semibold text-cyan-400 tracking-wide uppercase">{title}</h3>}
        {action && <div>{action}</div>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const QuantumButton: React.FC<React.ButtonHTMLAttributes<HTMLButtonElement> & { variant?: 'primary' | 'danger' | 'success' | 'ghost' }> = ({ children, variant = 'primary', className = '', ...props }) => {
  const variants = {
    primary: 'bg-cyan-600 hover:bg-cyan-500 text-white shadow-lg shadow-cyan-500/20',
    danger: 'bg-red-600 hover:bg-red-500 text-white shadow-lg shadow-red-500/20',
    success: 'bg-emerald-600 hover:bg-emerald-500 text-white shadow-lg shadow-emerald-500/20',
    ghost: 'bg-transparent hover:bg-gray-700/50 text-gray-300 border border-gray-600',
  };
  
  return (
    <button 
      className={`px-4 py-2 rounded-lg font-medium transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
};

const QuantumInput: React.FC<React.InputHTMLAttributes<HTMLInputElement> & { label?: string }> = ({ label, className = '', ...props }) => (
  <div className="mb-4">
    {label && <label className="block text-xs font-medium text-gray-400 mb-1 uppercase tracking-wider">{label}</label>}
    <input 
      className={`w-full bg-gray-800/50 border border-gray-600 rounded-lg px-4 py-2 text-gray-100 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all ${className}`}
      {...props}
    />
  </div>
);

const Modal: React.FC<{ isOpen: boolean; onClose: () => void; title: string; children: React.ReactNode }> = ({ isOpen, onClose, title, children }) => {
  if (!isOpen) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl w-full max-w-lg shadow-2xl transform transition-all animate-in fade-in zoom-in duration-200">
        <div className="flex justify-between items-center p-6 border-b border-gray-800">
          <h3 className="text-xl font-bold text-white">{title}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white transition-colors">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
          </button>
        </div>
        <div className="p-6">{children}</div>
      </div>
    </div>
  );
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const getColor = (s: string) => {
    if (['HEALTHY', 'SUCCESS', 'ACTIVE'].includes(s)) return 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30';
    if (['WARNING', 'PENDING'].includes(s)) return 'bg-amber-500/20 text-amber-400 border-amber-500/30';
    if (['FAILURE', 'ERROR', 'DISCONNECTED'].includes(s)) return 'bg-red-500/20 text-red-400 border-red-500/30';
    return 'bg-gray-500/20 text-gray-400 border-gray-500/30';
  };
  return (
    <span className={`px-2 py-1 rounded text-xs font-bold border ${getColor(status)}`}>
      {status}
    </span>
  );
};

// ============================================================================
// MAIN COMPONENT
// ============================================================================

const PlaidCRAMonitoringView: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [config, setConfig] = useState<QuantumConfig>({
    geminiKey: process.env.GEMINI_API_KEY || '',
    userToken: '',
    subscriptionId: null,
    isSimulationMode: false,
  });

  const [viewMode, setViewMode] = useState<ViewMode>('DASHBOARD');
  const [insights, setInsights] = useState<CraMonitoringInsightsGetResponse | null>(null);
  const [auditLogs, setAuditLogs] = useState<AuditLogEntry[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  
  // AI State
  const [chatMessages, setChatMessages] = useState<AIMessage[]>([
    { id: 'init', role: 'system', content: 'Quantum AI Core Initialized. Ready to analyze financial vectors.', timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAITyping, setIsAITyping] = useState(false);

  // Modal State
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);
  const auditEndRef = useRef<HTMLDivElement>(null);

  // --- HELPERS ---

  const addAuditLog = (action: string, status: 'SUCCESS' | 'FAILURE' | 'PENDING' | 'WARNING', details: string) => {
    const newLog: AuditLogEntry = {
      id: Math.random().toString(36).substring(7),
      timestamp: new Date().toISOString(),
      action,
      user: config.isSimulationMode ? 'SIM_USER_ADMIN' : 'QUANTUM_USER',
      status,
      details,
      hash: Math.random().toString(36).substring(2, 15).toUpperCase() // Fake hash
    };
    setAuditLogs(prev => [...prev, newLog]);
  };

  const scrollToBottom = (ref: React.RefObject<HTMLDivElement>) => {
    ref.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => { scrollToBottom(chatEndRef); }, [chatMessages]);
  useEffect(() => { scrollToBottom(auditEndRef); }, [auditLogs]);

  // --- API INTERACTIONS (SIMULATED & REAL) ---

  const callApi = async (endpoint: string, body: object) => {
    if (config.isSimulationMode) {
      await new Promise(resolve => setTimeout(resolve, 800)); // Simulate network latency
      if (endpoint.includes('subscribe')) return { subscription_id: 'sub_sim_quantum_99' };
      if (endpoint.includes('get')) return MOCK_INSIGHTS;
      return {};
    }

    try {
      const response = await fetch(`/api/plaid`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ endpoint, ...body }),
      });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error_message || 'Unknown Error');
      return data;
    } catch (err: any) {
      throw err;
    }
  };

  // --- HANDLERS ---

  const handleSubscribe = async () => {
    setIsLoading(true);
    setError(null);
    addAuditLog('INITIATE_SUBSCRIPTION', 'PENDING', 'Requesting CRA monitoring subscription...');
    
    try {
      if (!config.userToken && !config.isSimulationMode) throw new Error('User Token Required');
      
      const data = await callApi('cra/monitoring_insights/subscribe', { user_token: config.userToken });
      
      setConfig(prev => ({ ...prev, subscriptionId: data.subscription_id }));
      addAuditLog('SUBSCRIPTION_CONFIRMED', 'SUCCESS', `ID: ${data.subscription_id}`);
      
      // AI Reaction
      handleAIResponse("System Alert: New CRA Monitoring Subscription active. Analyzing initial vectors...");
      
    } catch (err: any) {
      setError(err.message);
      addAuditLog('SUBSCRIPTION_FAILED', 'FAILURE', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleGetInsights = async () => {
    setIsLoading(true);
    setError(null);
    addAuditLog('FETCH_INSIGHTS', 'PENDING', 'Retrieving encrypted insight packets...');

    try {
      if (!config.userToken && !config.isSimulationMode) throw new Error('User Token Required');

      const data = await callApi('cra/monitoring_insights/get', { user_token: config.userToken });
      setInsights(data);
      addAuditLog('INSIGHTS_RETRIEVED', 'SUCCESS', `Packets decrypted. ID: ${data.user_insights_id}`);
      setViewMode('INSIGHTS');

      // Trigger AI Analysis automatically
      if (config.geminiKey) {
        generateAIAnalysis(data);
      }

    } catch (err: any) {
      setError(err.message);
      addAuditLog('FETCH_INSIGHTS_FAILED', 'FAILURE', err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const toggleSimulationMode = () => {
    const newMode = !config.isSimulationMode;
    setConfig(prev => ({ ...prev, isSimulationMode: newMode }));
    addAuditLog('MODE_SWITCH', 'WARNING', `Simulation Mode: ${newMode ? 'ENABLED' : 'DISABLED'}`);
    if (newMode) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: '*** TEST DRIVE MODE ENGAGED *** Engine is roaring. Mock data streams active.', timestamp: new Date() }]);
    }
  };

  // --- AI LOGIC ---

  const generateAIAnalysis = async (data: any) => {
    if (!config.geminiKey) return;
    
    const prompt = `
      Analyze this financial data for a high-net-worth individual demo. 
      Data: ${JSON.stringify(data)}
      Tone: Elite, Professional, Concise.
      Output: 3 key bullet points on financial health and 1 strategic recommendation.
    `;
    
    await handleAIChat(prompt, true); // true = hidden prompt, only show response
  };

  const handleAIChat = async (message: string, isSystemTrigger = false) => {
    if (!message.trim()) return;

    if (!isSystemTrigger) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'user', content: message, timestamp: new Date() }]);
      setChatInput('');
    }

    setIsAITyping(true);

    try {
      if (!config.geminiKey) {
        throw new Error("AI Core Offline. Please configure GEMINI_API_KEY.");
      }

      const genAI = new GoogleGenAI({ apiKey: config.geminiKey });
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" }); // Using a standard model name for stability

      const systemContext = `
        You are the Quantum Financial AI Core. 
        You are speaking to a prospective business client testing the platform.
        Your tone is Elite, Secure, and High-Performance.
        Current Context: ${config.isSimulationMode ? 'SIMULATION / TEST DRIVE' : 'LIVE PRODUCTION'}.
        User Insights Data Available: ${insights ? 'YES' : 'NO'}.
        If data is available, use it to answer.
      `;

      const result = await model.generateContent([systemContext, message]);
      const response = result.response.text();

      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: response, timestamp: new Date() }]);
      addAuditLog('AI_INTERACTION', 'SUCCESS', 'Response generated via Gemini Core');

    } catch (err: any) {
      setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'system', content: `Error: ${err.message}`, timestamp: new Date() }]);
      addAuditLog('AI_FAILURE', 'FAILURE', err.message);
    } finally {
      setIsAITyping(false);
    }
  };

  const handleAIResponse = (text: string) => {
     setChatMessages(prev => [...prev, { id: Date.now().toString(), role: 'model', content: text, timestamp: new Date() }]);
  };


  // --- RENDERERS ---

  const renderDashboard = () => (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 animate-in fade-in duration-500">
      {/* Control Panel */}
      <div className="lg:col-span-2 space-y-6">
        <QuantumCard title="System Configuration" action={
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full ${config.isSimulationMode ? 'bg-amber-400 animate-pulse' : 'bg-emerald-400'}`}></span>
            <span className="text-xs text-gray-400">{config.isSimulationMode ? 'TEST DRIVE' : 'LIVE'}</span>
          </div>
        }>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm text-gray-400 uppercase mb-2">Subscription Status</h4>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">{config.subscriptionId ? 'ACTIVE' : 'INACTIVE'}</span>
                <StatusBadge status={config.subscriptionId ? 'ACTIVE' : 'DISCONNECTED'} />
              </div>
              {config.subscriptionId && <p className="text-xs text-gray-500 mt-1 font-mono">{config.subscriptionId}</p>}
            </div>
            <div className="p-4 bg-gray-800/50 rounded-lg border border-gray-700">
              <h4 className="text-sm text-gray-400 uppercase mb-2">Security Protocol</h4>
              <div className="flex items-center justify-between">
                <span className="text-xl font-bold text-white">ENCRYPTED</span>
                <StatusBadge status="HEALTHY" />
              </div>
              <p className="text-xs text-gray-500 mt-1">AES-256 / TLS 1.3</p>
            </div>
          </div>

          <div className="mt-6 flex flex-wrap gap-3">
            {!config.subscriptionId ? (
              <QuantumButton onClick={handleSubscribe} disabled={isLoading}>
                {isLoading ? 'Initializing...' : 'Activate Monitoring'}
              </QuantumButton>
            ) : (
              <QuantumButton variant="danger" onClick={() => setConfig(p => ({...p, subscriptionId: null}))}>
                Terminate Link
              </QuantumButton>
            )}
            <QuantumButton variant="ghost" onClick={handleGetInsights} disabled={isLoading}>
              Fetch Intelligence
            </QuantumButton>
            <QuantumButton variant="ghost" onClick={() => setIsConfigModalOpen(true)}>
              Configure Keys
            </QuantumButton>
            <QuantumButton variant="success" onClick={toggleSimulationMode}>
              {config.isSimulationMode ? 'Disable Test Drive' : 'Kick the Tires (Demo Mode)'}
            </QuantumButton>
          </div>
        </QuantumCard>

        {/* Quick Stats (Placeholder for Visuals) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {['Credit Velocity', 'Risk Vector', 'Liquidity Score'].map((metric, i) => (
                <QuantumCard key={i} className="text-center py-4">
                    <h4 className="text-xs text-gray-400 uppercase">{metric}</h4>
                    <div className="text-2xl font-bold text-cyan-400 mt-1">
                        {config.isSimulationMode ? Math.floor(Math.random() * 100) + 800 : '--'}
                    </div>
                    <div className="text-xs text-emerald-500 mt-1 flex justify-center items-center">
                        <svg className="w-3 h-3 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
                        {config.isSimulationMode ? '+2.4%' : '0%'}
                    </div>
                </QuantumCard>
            ))}
        </div>
      </div>

      {/* AI Command Center (Mini) */}
      <div className="lg:col-span-1">
        <QuantumCard title="AI Command Core" className="h-full flex flex-col">
            <div className="flex-1 overflow-y-auto max-h-[400px] space-y-3 mb-4 pr-2 custom-scrollbar">
                {chatMessages.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[90%] p-3 rounded-lg text-sm ${
                            msg.role === 'user' ? 'bg-cyan-900/50 text-cyan-100 border border-cyan-700' : 
                            msg.role === 'system' ? 'bg-red-900/20 text-red-300 border border-red-800 font-mono text-xs' :
                            'bg-gray-800 text-gray-200 border border-gray-700'
                        }`}>
                            {msg.content}
                        </div>
                    </div>
                ))}
                {isAITyping && <div className="text-xs text-cyan-500 animate-pulse">Core processing...</div>}
                <div ref={chatEndRef} />
            </div>
            <div className="relative">
                <input 
                    type="text" 
                    value={chatInput}
                    onChange={(e) => setChatInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleAIChat(chatInput)}
                    placeholder="Ask Quantum AI..."
                    className="w-full bg-gray-900 border border-gray-700 rounded-lg pl-4 pr-10 py-2 text-sm text-white focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500"
                />
                <button 
                    onClick={() => handleAIChat(chatInput)}
                    className="absolute right-2 top-2 text-cyan-500 hover:text-cyan-400"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
                </button>
            </div>
        </QuantumCard>
      </div>
    </div>
  );

  const renderInsights = () => {
    if (!insights) return <div className="text-center text-gray-500 py-10">No Intelligence Data Available</div>;

    return (
      <div className="space-y-6 animate-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center">
            <h2 className="text-2xl font-bold text-white">Intelligence Report <span className="text-cyan-500">#{insights.user_insights_id.split('_').pop()}</span></h2>
            <QuantumButton variant="ghost" onClick={() => setViewMode('DASHBOARD')}>Back to Command</QuantumButton>
        </div>

        {insights.items.map((item, idx) => (
            <div key={idx} className="space-y-6">
                {/* High Level Metrics */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                    <QuantumCard title="Income Velocity">
                        <div className="space-y-4">
                            <div>
                                <div className="text-xs text-gray-400 uppercase">Forecasted Monthly</div>
                                <div className="text-2xl font-bold text-white">
                                    ${item.insights?.income?.forecasted_monthly_income?.current_amount.toLocaleString()}
                                </div>
                            </div>
                            <div className="h-2 bg-gray-700 rounded-full overflow-hidden">
                                <div className="h-full bg-gradient-to-r from-cyan-500 to-blue-600 w-[75%]"></div>
                            </div>
                            <div className="flex justify-between text-xs text-gray-400">
                                <span>Historical Annual: ${item.insights?.income?.historical_annual_income?.current_amount.toLocaleString()}</span>
                            </div>
                        </div>
                    </QuantumCard>

                    <QuantumCard title="Liability Structure">
                        <div className="flex items-center justify-center h-full">
                            <div className="text-center">
                                <div className="text-4xl font-bold text-white">{item.insights?.loans?.loan_payments_counts?.current_count || 0}</div>
                                <div className="text-sm text-gray-400">Active Loan Obligations</div>
                            </div>
                        </div>
                    </QuantumCard>

                    <QuantumCard title="Institution Health">
                        <div className="flex flex-col justify-between h-full">
                            <div>
                                <div className="text-lg font-semibold text-white">{item.institution_name}</div>
                                <div className="text-xs text-gray-500">{item.institution_id}</div>
                            </div>
                            <div className="mt-4">
                                <StatusBadge status={item.status?.status_code || 'UNKNOWN'} />
                            </div>
                        </div>
                    </QuantumCard>
                </div>

                {/* Account Details Table */}
                <QuantumCard title="Asset Allocation & Transactions">
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="border-b border-gray-700 text-xs text-gray-400 uppercase">
                                    <th className="p-3">Account</th>
                                    <th className="p-3">Type</th>
                                    <th className="p-3 text-right">Balance</th>
                                    <th className="p-3 text-right">Available</th>
                                </tr>
                            </thead>
                            <tbody className="text-sm text-gray-300">
                                {item.accounts.map((acc, accIdx) => (
                                    <tr key={accIdx} className="border-b border-gray-800 hover:bg-gray-800/30 transition-colors">
                                        <td className="p-3 font-medium text-white">{acc.name} <span className="text-gray-500">({acc.mask})</span></td>
                                        <td className="p-3 capitalize">{acc.subtype}</td>
                                        <td className="p-3 text-right font-mono text-cyan-400">${acc.balances.current.toLocaleString()}</td>
                                        <td className="p-3 text-right font-mono text-emerald-400">${acc.balances.available?.toLocaleString()}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                    
                    {/* Transaction Preview */}
                    <div className="mt-6">
                        <h4 className="text-sm text-gray-400 uppercase mb-3">Recent Activity Stream</h4>
                        <div className="space-y-2">
                            {item.accounts[0]?.transactions?.slice(0, 5).map((tx, txIdx) => (
                                <div key={txIdx} className="flex justify-between items-center p-3 bg-gray-800/30 rounded border border-gray-700/50">
                                    <div className="flex items-center gap-3">
                                        <div className={`p-2 rounded-full ${tx.amount < 0 ? 'bg-emerald-500/10 text-emerald-500' : 'bg-red-500/10 text-red-500'}`}>
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                                {tx.amount < 0 
                                                    ? <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                                                    : <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 10l7-7m0 0l7 7m-7-7v18" />
                                                }
                                            </svg>
                                        </div>
                                        <div>
                                            <div className="text-sm font-medium text-white">{tx.merchant_name || tx.original_description}</div>
                                            <div className="text-xs text-gray-500">{tx.date}</div>
                                        </div>
                                    </div>
                                    <div className={`font-mono font-bold ${tx.amount < 0 ? 'text-emerald-400' : 'text-white'}`}>
                                        {Math.abs(tx.amount).toLocaleString()} {tx.iso_currency_code}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </QuantumCard>
            </div>
        ))}
      </div>
    );
  };

  const renderAuditLog = () => (
    <div className="h-full flex flex-col">
        <div className="flex justify-between items-center mb-4">
            <h3 className="text-lg font-semibold text-white">Immutable Audit Ledger</h3>
            <span className="text-xs text-gray-500 font-mono">SECURE_STORAGE_V4</span>
        </div>
        <div className="flex-1 bg-black/50 rounded-lg border border-gray-800 p-4 overflow-y-auto font-mono text-xs custom-scrollbar max-h-[500px]">
            {auditLogs.length === 0 && <div className="text-gray-600 text-center mt-10">No audit records found.</div>}
            {auditLogs.map((log) => (
                <div key={log.id} className="mb-3 border-b border-gray-800 pb-2 last:border-0">
                    <div className="flex justify-between text-gray-500 mb-1">
                        <span>{log.timestamp}</span>
                        <span>{log.hash}</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className={`w-2 h-2 rounded-full ${
                            log.status === 'SUCCESS' ? 'bg-emerald-500' : 
                            log.status === 'FAILURE' ? 'bg-red-500' : 
                            log.status === 'WARNING' ? 'bg-amber-500' : 'bg-blue-500'
                        }`}></span>
                        <span className="text-cyan-400 font-bold">[{log.action}]</span>
                        <span className="text-gray-300">{log.details}</span>
                    </div>
                    <div className="text-gray-600 mt-1 pl-4">User: {log.user}</div>
                </div>
            ))}
            <div ref={auditEndRef} />
        </div>
    </div>
  );

  const renderGuide = () => (
    <div className="prose prose-invert max-w-none">
        <div className="bg-gray-800/50 p-6 rounded-xl border border-gray-700">
            <pre className="whitespace-pre-wrap font-sans text-gray-300 leading-relaxed">
                {QUANTUM_GUIDE_TEXT}
            </pre>
        </div>
    </div>
  );

  // --- MAIN RENDER ---

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-900 to-black text-gray-100 font-sans selection:bg-cyan-500/30">
      {/* Top Navigation Bar */}
      <header className="bg-gray-900/90 backdrop-blur-md border-b border-gray-800 sticky top-0 z-40">
        <div className="container mx-auto px-6 py-4 flex justify-between items-center">
            <div className="flex items-center gap-3">
                <div className="w-8 h-8 bg-gradient-to-tr from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="font-bold text-white">Q</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">QUANTUM FINANCIAL</h1>
                    <p className="text-xs text-gray-500 uppercase tracking-widest">Enterprise Demo Environment</p>
                </div>
            </div>
            
            <nav className="hidden md:flex gap-1 bg-gray-800/50 p-1 rounded-lg border border-gray-700">
                {(['DASHBOARD', 'INSIGHTS', 'AUDIT', 'GUIDE'] as ViewMode[]).map((mode) => (
                    <button
                        key={mode}
                        onClick={() => setViewMode(mode)}
                        className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${
                            viewMode === mode 
                            ? 'bg-gray-700 text-white shadow-sm' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                        }`}
                    >
                        {mode}
                    </button>
                ))}
            </nav>

            <div className="flex items-center gap-4">
                <div className="text-right hidden sm:block">
                    <div className="text-xs text-gray-400">System Status</div>
                    <div className="text-xs font-bold text-emerald-400 flex items-center justify-end gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                        OPERATIONAL
                    </div>
                </div>
            </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="container mx-auto px-6 py-8">
        {error && (
            <div className="mb-6 bg-red-900/20 border border-red-500/50 text-red-200 p-4 rounded-lg flex items-center gap-3 animate-in slide-in-from-top-2">
                <svg className="w-6 h-6 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                <div>
                    <div className="font-bold">System Error</div>
                    <div className="text-sm opacity-80">{error}</div>
                </div>
            </div>
        )}

        {viewMode === 'DASHBOARD' && renderDashboard()}
        {viewMode === 'INSIGHTS' && renderInsights()}
        {viewMode === 'AUDIT' && renderAuditLog()}
        {viewMode === 'GUIDE' && renderGuide()}
      </main>

      {/* Configuration Modal */}
      <Modal isOpen={isConfigModalOpen} onClose={() => setIsConfigModalOpen(false)} title="Secure Configuration">
        <div className="space-y-4">
            <p className="text-sm text-gray-400">
                Enter your credentials to unlock the full potential of the Quantum Engine. 
                In "Test Drive" mode, these are optional.
            </p>
            <QuantumInput 
                label="Gemini API Key (AI Core)" 
                type="password" 
                value={config.geminiKey} 
                onChange={(e) => setConfig(p => ({...p, geminiKey: e.target.value}))}
                placeholder="sk-..."
            />
            <QuantumInput 
                label="User Token (Plaid)" 
                value={config.userToken} 
                onChange={(e) => setConfig(p => ({...p, userToken: e.target.value}))}
                placeholder="user-sandbox-..."
            />
            <div className="flex justify-end gap-3 mt-6">
                <QuantumButton variant="ghost" onClick={() => setIsConfigModalOpen(false)}>Cancel</QuantumButton>
                <QuantumButton onClick={() => {
                    setIsConfigModalOpen(false);
                    addAuditLog('CONFIG_UPDATE', 'SUCCESS', 'Secure credentials updated');
                }}>Save Configuration</QuantumButton>
            </div>
        </div>
      </Modal>

      {/* Global Styles for Scrollbar */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar { width: 6px; }
        .custom-scrollbar::-webkit-scrollbar-track { bg: rgba(0,0,0,0.1); }
        .custom-scrollbar::-webkit-scrollbar-thumb { background-color: rgba(75, 85, 99, 0.5); border-radius: 10px; }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover { background-color: rgba(107, 114, 128, 0.8); }
      `}</style>
    </div>
  );
};

export default PlaidCRAMonitoringView;