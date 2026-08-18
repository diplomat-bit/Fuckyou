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