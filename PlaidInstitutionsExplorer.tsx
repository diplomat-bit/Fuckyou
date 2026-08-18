import React, { useState, useEffect, useRef, useContext, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card, { CardHeaderAction, CardVariant } from './Card';
import { DataContext } from '../context/DataContext';
import { 
  Transaction, 
  Notification, 
  AuditLogEntry, 
  SecurityScoreMetric,
  ThreatAlert
} from '../types';

// ============================================================================
// 1. CONFIGURATION & CONSTANTS
// ============================================================================

const DEMO_NAME = "Quantum Financial";
const AI_MODEL_NAME = "gemini-1.5-flash"; // Using a standard model name for stability

// Mock Data Generators for "Bells and Whistles"
const generateTraceId = () => `TRC-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;
const generateAuditId = () => `AUD-${Date.now()}-${Math.floor(Math.random() * 1000)}`;

const MOCK_GLOBAL_CURRENCIES = ['USD', 'EUR', 'GBP', 'JPY', 'SGD', 'CHF'];

const DEMO_SCENARIOS = [
  { id: 'scen_01', title: 'Liquidity Crisis Simulation', description: 'Test system response to rapid outflow.' },
  { id: 'scen_02', title: 'International Wire Fraud', description: 'Detect and block suspicious cross-border transfers.' },
  { id: 'scen_03', title: 'Payroll Batch Processing', description: 'Execute 5,000 employee payments simultaneously.' },
  { id: 'scen_04', title: 'Audit Compliance Check', description: 'Generate ISO 20022 compliant reports.' }
];

const SECURITY_LOGS_MOCK = [
  { id: 'sec_1', timestamp: '10:42:01 AM', event: 'Login Attempt', location: 'New York, USA', status: 'Success', ip: '192.168.1.1' },
  { id: 'sec_2', timestamp: '10:45:22 AM', event: 'API Key Access', location: 'London, UK', status: 'Success', ip: '10.0.0.55' },
  { id: 'sec_3', timestamp: '11:01:05 AM', event: 'High Value Transfer', location: 'Singapore', status: 'Pending Review', ip: '172.16.0.1' },
];

// ============================================================================
// 2. LOCAL TYPES
// ============================================================================

type DemoView = 'DASHBOARD' | 'PAYMENTS' | 'SECURITY' | 'ANALYTICS' | 'AUDIT' | 'SETTINGS';

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
  isTyping?: boolean;
}

interface PaymentFormState {
  recipient: string;
  amount: string;
  currency: string;
  reference: string;
  type: 'WIRE' | 'ACH' | 'RTP';
  scheduleDate: string;
}

// ============================================================================
// 3. UTILITY COMPONENTS
// ============================================================================

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  let colorClass = 'bg-gray-100 text-gray-800';
  if (['Success', 'Completed', 'Active', 'Operational'].includes(status)) colorClass = 'bg-green-100 text-green-800 border border-green-200';
  if (['Pending', 'Review', 'Processing'].includes(status)) colorClass = 'bg-yellow-100 text-yellow-800 border border-yellow-200';
  if (['Failed', 'Blocked', 'Critical'].includes(status)) colorClass = 'bg-red-100 text-red-800 border border-red-200';

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${colorClass}`}>
      {status}
    </span>
  );
};

const MetricSparkline: React.FC<{ data: number[], color?: string }> = ({ data, color = '#06b6d4' }) => {
  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;
  const height = 40;
  const width = 120;
  
  const points = data.map((d, i) => {
    const x = (i / (data.length - 1)) * width;
    const y = height - ((d - min) / range) * height;
    return `${x},${y}`;
  }).join(' ');

  return (
    <svg width={width} height={height} className="overflow-visible">
      <polyline
        points={points}
        fill="none"
        stroke={color}
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <circle cx={(data.length - 1) * (width / (data.length - 1))} cy={height - ((data[data.length-1] - min) / range) * height} r="3" fill={color} />
    </svg>
  );
};

// ============================================================================
// 4. MAIN COMPONENT: QUANTUM FINANCIAL DEMO
// ============================================================================

export const PlaidInstitutionsExplorer: React.FC = () => {
  // --- CONTEXT & STATE ---
  const context = useContext(DataContext);
  const [activeView, setActiveView] = useState<DemoView>('DASHBOARD');
  const [isLoading, setIsLoading] = useState(false);
  const [auditLog, setAuditLog] = useState<AuditLogEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 'init', role: 'ai', content: `Welcome to ${DEMO_NAME}. I am your Sovereign AI Architect. How can I assist with your treasury operations today?`, timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isChatOpen, setIsChatOpen] = useState(true);
  
  // Payment State
  const [paymentForm, setPaymentForm] = useState<PaymentFormState>({
    recipient: '', amount: '', currency: 'USD', reference: '', type: 'WIRE', scheduleDate: ''
  });
  const [paymentProcessing, setPaymentProcessing] = useState(false);

  // Security State
  const [securityLevel, setSecurityLevel] = useState<'STANDARD' | 'ELEVATED' | 'LOCKDOWN'>('STANDARD');
  const [activeThreats, setActiveThreats] = useState<ThreatAlert[]>([]);

  // Refs
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    // Simulate initial data load
    const loadData = async () => {
      setIsLoading(true);
      await new Promise(r => setTimeout(r, 1200)); // Cinematic delay
      addAuditLog('SYSTEM', 'INITIALIZATION', 'Quantum Core Services Hydrated', true);
      setIsLoading(false);
    };
    loadData();
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory, isChatOpen]);

  // --- HELPERS ---

  const addAuditLog = (user: string, action: string, resource: string, success: boolean) => {
    const newEntry: AuditLogEntry = {
      id: generateAuditId(),
      timestamp: new Date().toISOString(),
      userId: user,
      action,
      targetResource: resource,
      success
    };
    setAuditLog(prev => [newEntry, ...prev]);
  };

  const formatCurrency = (amount: number, currency = 'USD') => {
    return new Intl.NumberFormat('en-US', { style: 'currency', currency }).format(amount);
  };

  // --- AI INTEGRATION ---

  const handleAIChat = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    
    // Add typing indicator
    const typingId = 'typing-' + Date.now();
    setChatHistory(prev => [...prev, { id: typingId, role: 'ai', content: '...', timestamp: new Date(), isTyping: true }]);

    try {
      const apiKey = context?.geminiApiKey;
      
      let aiResponseText = "";

      if (!apiKey) {
        // Fallback if no key provided in context
        await new Promise(r => setTimeout(r, 1500));
        aiResponseText = "I am currently running in Simulation Mode as the Neural Link (API Key) is not connected. I can still guide you through the interface. Try clicking on 'Payments' to see our wire capabilities.";
      } else {
        const genAI = new GoogleGenAI({ apiKey });
        const model = genAI.getGenerativeModel({ 
            model: "gemini-1.5-flash",
            systemInstruction: `You are the AI interface for ${DEMO_NAME}, a futuristic, elite business banking platform. 
            Your tone is professional, concise, and slightly futuristic. 
            You have control over the dashboard. 
            If the user asks to see payments, say you are navigating them there.
            If the user asks about security, explain the quantum encryption protocols.
            Current View: ${activeView}.
            User Name: ${context?.userProfile?.name || 'Executive'}.
            Company: ${DEMO_NAME}.
            Do not mention Citibank. Use "The Demo Bank" or "Quantum Financial".
            Keep responses under 50 words unless asked for a detailed report.`
        });

        const result = await model.generateContent({
            contents: [
                { role: 'user', parts: [{ text: chatInput }] }
            ]
        });
        
        aiResponseText = result.response.text();
      }

      // Remove typing indicator and add response
      setChatHistory(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now().toString(),
        role: 'ai',
        content: aiResponseText,
        timestamp: new Date()
      }));

      // Simple intent detection for navigation (simulated tool use)
      const lowerInput = chatInput.toLowerCase();
      if (lowerInput.includes('payment') || lowerInput.includes('wire') || lowerInput.includes('send')) setActiveView('PAYMENTS');
      if (lowerInput.includes('security') || lowerInput.includes('fraud')) setActiveView('SECURITY');
      if (lowerInput.includes('dashboard') || lowerInput.includes('home')) setActiveView('DASHBOARD');
      if (lowerInput.includes('audit') || lowerInput.includes('log')) setActiveView('AUDIT');

    } catch (error) {
      console.error("AI Error", error);
      setChatHistory(prev => prev.filter(m => m.id !== typingId).concat({
        id: Date.now().toString(),
        role: 'system',
        content: "Neural Link disrupted. Please check your connection or API credentials.",
        timestamp: new Date()
      }));
    }
  };

  // --- ACTION HANDLERS ---

  const executePayment = async () => {
    if (!paymentForm.amount || !paymentForm.recipient) return;
    
    setPaymentProcessing(true);
    addAuditLog(context?.userProfile?.name || 'User', 'PAYMENT_INIT', `Initiating ${paymentForm.type} to ${paymentForm.recipient}`, true);

    // Simulate API latency and checks
    await new Promise(r => setTimeout(r, 2000));

    const isHighValue = parseFloat(paymentForm.amount) > 10000;
    
    if (isHighValue && securityLevel === 'LOCKDOWN') {
        addAuditLog('SYSTEM', 'PAYMENT_BLOCK', 'Transaction blocked by Security Protocol Omega', false);
        context?.showNotification('Payment blocked: Security Lockdown Active', 'error');
    } else {
        addAuditLog('SYSTEM', 'PAYMENT_SUCCESS', `Transferred ${paymentForm.currency} ${paymentForm.amount} via ${paymentForm.type}`, true);
        context?.showNotification('Funds transfer executed successfully.', 'success');
        setPaymentForm({ ...paymentForm, amount: '', recipient: '', reference: '' });
    }
    
    setPaymentProcessing(false);
  };

  const toggleSecurityProtocol = () => {
    const newLevel = securityLevel === 'STANDARD' ? 'ELEVATED' : securityLevel === 'ELEVATED' ? 'LOCKDOWN' : 'STANDARD';
    setSecurityLevel(newLevel);
    addAuditLog(context?.userProfile?.name || 'Admin', 'SEC_LEVEL_CHANGE', `Security Level changed to ${newLevel}`, true);
    context?.showNotification(`Security Protocol updated to ${newLevel}`, 'info');
  };

  const triggerSimulatedThreat = () => {
    const threat: ThreatAlert = {
        alertId: `THR-${Date.now()}`,
        title: 'Anomalous Login Vector',
        description: 'Login attempt detected from unrecognized device in Pyongyang, North Korea.',
        timestamp: new Date().toISOString()
    };
    setActiveThreats(prev => [threat, ...prev]);
    addAuditLog('SYSTEM', 'THREAT_DETECT', 'High severity threat detected', true);
    context?.showNotification('CRITICAL: Security Threat Detected', 'error');
  };

  // ==========================================================================
  // 5. SUB-VIEWS
  // ==========================================================================

  const renderDashboard = () => (
    <div className="space-y-6 animate-fadeIn">
      {/* Hero Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card variant="interactive" className="bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Global Liquidity</p>
              <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(24500000)}</h3>
              <p className="text-green-400 text-sm mt-1 flex items-center">
                <span className="mr-1">▲</span> 2.4% vs last close
              </p>
            </div>
            <div className="p-2 bg-blue-500/20 rounded-lg">
              <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <MetricSparkline data={[40, 42, 45, 41, 48, 52, 50, 55, 58, 60]} color="#3b82f6" />
          </div>
        </Card>

        <Card variant="interactive" className="bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Working Capital</p>
              <h3 className="text-3xl font-bold text-white mt-2">{formatCurrency(8200000)}</h3>
              <p className="text-gray-400 text-sm mt-1">Available for immediate deployment</p>
            </div>
            <div className="p-2 bg-purple-500/20 rounded-lg">
              <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" /></svg>
            </div>
          </div>
          <div className="mt-4">
            <MetricSparkline data={[30, 32, 31, 35, 34, 38, 40, 42]} color="#a855f7" />
          </div>
        </Card>

        <Card variant="interactive" className="bg-gradient-to-br from-gray-800 to-gray-900">
          <div className="flex justify-between items-start">
            <div>
              <p className="text-gray-400 text-sm font-medium uppercase tracking-wider">Security Posture</p>
              <h3 className="text-3xl font-bold text-white mt-2">98.4%</h3>
              <p className="text-green-400 text-sm mt-1">Quantum Encryption Active</p>
            </div>
            <div className="p-2 bg-green-500/20 rounded-lg">
              <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
            </div>
          </div>
          <div className="mt-4 w-full bg-gray-700 rounded-full h-2">
            <div className="bg-green-500 h-2 rounded-full" style={{ width: '98.4%' }}></div>
          </div>
        </Card>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent Transactions */}
        <div className="lg:col-span-2">
          <Card title="Real-Time Transaction Feed" variant="default" className="h-full">
            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-gray-200 uppercase font-medium">
                  <tr>
                    <th className="px-4 py-3">Trace ID</th>
                    <th className="px-4 py-3">Counterparty</th>
                    <th className="px-4 py-3">Type</th>
                    <th className="px-4 py-3 text-right">Amount</th>
                    <th className="px-4 py-3 text-center">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50">
                  {[1, 2, 3, 4, 5].map((i) => (
                    <tr key={i} className="hover:bg-gray-700/30 transition-colors">
                      <td className="px-4 py-3 font-mono text-xs text-gray-500">{generateTraceId()}</td>
                      <td className="px-4 py-3 text-white font-medium">
                        {['Alpha Corp', 'Omega Logistics', 'Sovereign Trust', 'Global Payroll', 'Azure Services'][i-1]}
                      </td>
                      <td className="px-4 py-3">{['Wire', 'ACH', 'Internal', 'Batch', 'Card'][i-1]}</td>
                      <td className="px-4 py-3 text-right text-white">
                        {formatCurrency(Math.random() * 50000)}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StatusBadge status={['Completed', 'Processing', 'Completed', 'Review', 'Completed'][i-1]} />
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="mt-4 flex justify-end">
                <button className="text-cyan-400 hover:text-cyan-300 text-sm font-medium flex items-center">
                    View Full Ledger <svg className="w-4 h-4 ml-1" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" /></svg>
                </button>
            </div>
          </Card>
        </div>

        {/* Quick Actions & Insights */}
        <div className="space-y-6">
          <Card title="Quick Actions" variant="outline">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setActiveView('PAYMENTS')} className="p-3 bg-gray-700/50 hover:bg-cyan-600/20 hover:border-cyan-500/50 border border-transparent rounded-lg transition-all text-center group">
                <div className="w-8 h-8 mx-auto bg-cyan-500/20 text-cyan-400 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" /></svg>
                </div>
                <span className="text-xs font-medium text-gray-300">New Wire</span>
              </button>
              <button onClick={() => setActiveView('SECURITY')} className="p-3 bg-gray-700/50 hover:bg-red-600/20 hover:border-red-500/50 border border-transparent rounded-lg transition-all text-center group">
                <div className="w-8 h-8 mx-auto bg-red-500/20 text-red-400 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                </div>
                <span className="text-xs font-medium text-gray-300">Security</span>
              </button>
              <button className="p-3 bg-gray-700/50 hover:bg-purple-600/20 hover:border-purple-500/50 border border-transparent rounded-lg transition-all text-center group">
                <div className="w-8 h-8 mx-auto bg-purple-500/20 text-purple-400 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2m3 2v-4m3 4v-6m2 10H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" /></svg>
                </div>
                <span className="text-xs font-medium text-gray-300">Reports</span>
              </button>
              <button onClick={() => setActiveView('AUDIT')} className="p-3 bg-gray-700/50 hover:bg-yellow-600/20 hover:border-yellow-500/50 border border-transparent rounded-lg transition-all text-center group">
                <div className="w-8 h-8 mx-auto bg-yellow-500/20 text-yellow-400 rounded-full flex items-center justify-center mb-2 group-hover:scale-110 transition-transform">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-3 7h3m-3 4h3m-6-4h.01M9 16h.01" /></svg>
                </div>
                <span className="text-xs font-medium text-gray-300">Audit Log</span>
              </button>
            </div>
          </Card>

          <Card title="AI Insight" variant="ghost" className="bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/30">
            <div className="flex items-start space-x-3">
                <div className="flex-shrink-0 mt-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-pulse"></div>
                </div>
                <div>
                    <p className="text-sm text-indigo-200 italic">
                        "Based on current cash flow velocity, I recommend moving $2.5M to the Overnight Yield Facility to optimize returns by approximately $450/day."
                    </p>
                    <button className="mt-3 text-xs bg-indigo-600 hover:bg-indigo-500 text-white px-3 py-1 rounded transition-colors">
                        Execute Strategy
                    </button>
                </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );

  const renderPayments = () => (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 animate-fadeIn">
        <Card title="Initiate Transfer" variant="default">
            <div className="space-y-4">
                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Payment Type</label>
                    <div className="flex space-x-2 p-1 bg-gray-900/50 rounded-lg">
                        {['WIRE', 'ACH', 'RTP'].map(type => (
                            <button
                                key={type}
                                onClick={() => setPaymentForm({...paymentForm, type: type as any})}
                                className={`flex-1 py-2 text-sm font-medium rounded-md transition-all ${
                                    paymentForm.type === type 
                                    ? 'bg-cyan-600 text-white shadow-lg' 
                                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                                }`}
                            >
                                {type}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Amount</label>
                        <div className="relative">
                            <span className="absolute left-3 top-2 text-gray-500">$</span>
                            <input 
                                type="number" 
                                value={paymentForm.amount}
                                onChange={e => setPaymentForm({...paymentForm, amount: e.target.value})}
                                className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 pl-8 pr-4 text-white focus:ring-2 focus:ring-cyan-500 focus:border-transparent outline-none"
                                placeholder="0.00"
                            />
                        </div>
                    </div>
                    <div>
                        <label className="block text-sm font-medium text-gray-400 mb-1">Currency</label>
                        <select 
                            value={paymentForm.currency}
                            onChange={e => setPaymentForm({...paymentForm, currency: e.target.value})}
                            className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-3 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                        >
                            {MOCK_GLOBAL_CURRENCIES.map(c => <option key={c} value={c}>{c}</option>)}
                        </select>
                    </div>
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Recipient</label>
                    <input 
                        type="text" 
                        value={paymentForm.recipient}
                        onChange={e => setPaymentForm({...paymentForm, recipient: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                        placeholder="Company or Individual Name"
                    />
                </div>

                <div>
                    <label className="block text-sm font-medium text-gray-400 mb-1">Reference (Optional)</label>
                    <input 
                        type="text" 
                        value={paymentForm.reference}
                        onChange={e => setPaymentForm({...paymentForm, reference: e.target.value})}
                        className="w-full bg-gray-900 border border-gray-700 rounded-lg py-2 px-4 text-white focus:ring-2 focus:ring-cyan-500 outline-none"
                        placeholder="Invoice #, PO #"
                    />
                </div>

                <div className="pt-4">
                    <button 
                        onClick={executePayment}
                        disabled={paymentProcessing || !paymentForm.amount || !paymentForm.recipient}
                        className={`w-full py-3 rounded-lg font-bold text-white shadow-lg transition-all flex justify-center items-center ${
                            paymentProcessing 
                            ? 'bg-gray-600 cursor-not-allowed' 
                            : 'bg-gradient-to-r from-cyan-600 to-blue-600 hover:from-cyan-500 hover:to-blue-500 hover:shadow-cyan-500/25'
                        }`}
                    >
                        {paymentProcessing ? (
                            <>
                                <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                </svg>
                                Processing Secure Transfer...
                            </>
                        ) : (
                            'Authorize Payment'
                        )}
                    </button>
                    <p className="text-center text-xs text-gray-500 mt-3">
                        <span className="inline-block w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Secure Connection • 256-bit Encryption • Audit Logged
                    </p>
                </div>
            </div>
        </Card>

        <div className="space-y-6">
            <Card title="Global Payment Map" variant="interactive" className="h-64 relative overflow-hidden group">
                {/* Abstract Map Visualization */}
                <div className="absolute inset-0 bg-gray-900 opacity-50"></div>
                <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-full h-full relative">
                        {/* Simulated Nodes */}
                        <div className="absolute top-1/4 left-1/4 w-3 h-3 bg-cyan-500 rounded-full animate-ping"></div>
                        <div className="absolute top-1/2 left-1/2 w-2 h-2 bg-blue-500 rounded-full"></div>
                        <div className="absolute bottom-1/3 right-1/4 w-2 h-2 bg-purple-500 rounded-full"></div>
                        {/* Connecting Lines (SVG) */}
                        <svg className="absolute inset-0 w-full h-full pointer-events-none">
                            <path d="M150 100 Q 300 200 450 250" stroke="rgba(6,182,212,0.3)" strokeWidth="1" fill="none" className="animate-pulse" />
                            <path d="M450 250 Q 300 300 150 350" stroke="rgba(168,85,247,0.3)" strokeWidth="1" fill="none" />
                        </svg>
                    </div>
                </div>
                <div className="absolute bottom-4 left-4">
                    <p className="text-white font-bold">Live Network Status</p>
                    <p className="text-xs text-green-400">All Corridors Operational</p>
                </div>
            </Card>

            <Card title="Recent Beneficiaries" variant="outline">
                <ul className="divide-y divide-gray-700/50">
                    {['Tesla Inc.', 'SpaceX Logistics', 'Neuralink Corp', 'Boring Company'].map((name, i) => (
                        <li key={i} className="py-3 flex justify-between items-center hover:bg-gray-800/50 px-2 rounded transition-colors cursor-pointer" onClick={() => setPaymentForm({...paymentForm, recipient: name})}>
                            <div className="flex items-center">
                                <div className="w-8 h-8 rounded-full bg-gray-700 flex items-center justify-center text-xs font-bold text-gray-300 mr-3">
                                    {name.substring(0,2).toUpperCase()}
                                </div>
                                <span className="text-sm text-gray-300">{name}</span>
                            </div>
                            <button className="text-xs text-cyan-500 hover:text-cyan-400">Select</button>
                        </li>
                    ))}
                </ul>
            </Card>
        </div>
    </div>
  );

  const renderSecurity = () => (
    <div className="space-y-6 animate-fadeIn">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-red-900/20 border-red-500/30">
                <div className="text-center p-4">
                    <h3 className="text-gray-400 text-sm uppercase tracking-widest">Threat Level</h3>
                    <div className="text-4xl font-black text-red-500 mt-2 animate-pulse">
                        {activeThreats.length > 0 ? 'CRITICAL' : 'LOW'}
                    </div>
                    <p className="text-xs text-red-300 mt-2">{activeThreats.length} Active Incursions Detected</p>
                </div>
            </Card>
            <Card className="bg-blue-900/20 border-blue-500/30">
                <div className="text-center p-4">
                    <h3 className="text-gray-400 text-sm uppercase tracking-widest">Protocol Status</h3>
                    <div className={`text-4xl font-black mt-2 ${securityLevel === 'LOCKDOWN' ? 'text-yellow-500' : 'text-blue-500'}`}>
                        {securityLevel}
                    </div>
                    <button onClick={toggleSecurityProtocol} className="mt-3 text-xs bg-gray-700 hover:bg-gray-600 px-3 py-1 rounded text-white transition-colors">
                        Change Protocol
                    </button>
                </div>
            </Card>
            <Card className="bg-green-900/20 border-green-500/30">
                <div className="text-center p-4">
                    <h3 className="text-gray-400 text-sm uppercase tracking-widest">System Integrity</h3>
                    <div className="text-4xl font-black text-green-500 mt-2">100%</div>
                    <p className="text-xs text-green-300 mt-2">Core Ledger Verified</p>
                </div>
            </Card>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
                <Card title="Live Threat Monitor" variant="default">
                    <div className="h-64 bg-black rounded-lg border border-gray-800 relative overflow-hidden font-mono text-xs p-4">
                        {activeThreats.length === 0 ? (
                            <div className="absolute inset-0 flex items-center justify-center text-gray-600">
                                <div className="text-center">
                                    <svg className="w-12 h-12 mx-auto mb-2 opacity-50" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                                    <p>No Active Threats Detected</p>
                                    <p className="text-gray-700 mt-1">Scanning Global Nodes...</p>
                                </div>
                            </div>
                        ) : (
                            <div className="space-y-2">
                                {activeThreats.map(threat => (
                                    <div key={threat.alertId} className="bg-red-900/30 border border-red-500/50 p-2 rounded text-red-200 flex justify-between items-center animate-pulse">
                                        <span>[{new Date(threat.timestamp).toLocaleTimeString()}] {threat.title.toUpperCase()}</span>
                                        <span className="bg-red-600 text-white px-2 py-0.5 rounded text-[10px]">BLOCKING</span>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        {/* Simulation Controls */}
                        <div className="absolute bottom-4 right-4">
                            <button 
                                onClick={triggerSimulatedThreat}
                                className="bg-gray-800 hover:bg-red-900/50 text-gray-400 hover:text-red-400 border border-gray-700 hover:border-red-500 px-3 py-1 rounded text-xs transition-all"
                            >
                                Simulate Attack
                            </button>
                        </div>
                    </div>
                </Card>
            </div>
            
            <div className="space-y-6">
                <Card title="Access Logs" variant="outline">
                    <ul className="space-y-3">
                        {SECURITY_LOGS_MOCK.map(log => (
                            <li key={log.id} className="text-xs">
                                <div className="flex justify-between text-gray-400 mb-1">
                                    <span>{log.timestamp}</span>
                                    <span className={log.status === 'Success' ? 'text-green-400' : 'text-yellow-400'}>{log.status}</span>
                                </div>
                                <div className="text-gray-200 font-medium">{log.event}</div>
                                <div className="text-gray-500">{log.location} • {log.ip}</div>
                            </li>
                        ))}
                    </ul>
                </Card>
            </div>
        </div>
    </div>
  );

  const renderAudit = () => (
    <Card title="Immutable Audit Ledger" variant="default" className="animate-fadeIn">
        <div className="overflow-x-auto">
            <table className="w-full text-left text-sm text-gray-400">
                <thead className="bg-gray-800/50 text-gray-200 uppercase font-medium">
                    <tr>
                        <th className="px-4 py-3">Timestamp</th>
                        <th className="px-4 py-3">Audit ID</th>
                        <th className="px-4 py-3">User</th>
                        <th className="px-4 py-3">Action</th>
                        <th className="px-4 py-3">Resource</th>
                        <th className="px-4 py-3 text-center">Result</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-700/50 font-mono text-xs">
                    {auditLog.length === 0 ? (
                        <tr><td colSpan={6} className="px-4 py-8 text-center text-gray-500">Ledger is empty. Perform actions to generate logs.</td></tr>
                    ) : (
                        auditLog.map((log) => (
                            <tr key={log.id} className="hover:bg-gray-700/30 transition-colors">
                                <td className="px-4 py-3 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                                <td className="px-4 py-3 text-cyan-600">{log.id}</td>
                                <td className="px-4 py-3 text-white">{log.userId}</td>
                                <td className="px-4 py-3 text-yellow-500">{log.action}</td>
                                <td className="px-4 py-3">{log.targetResource}</td>
                                <td className="px-4 py-3 text-center">
                                    {log.success ? (
                                        <span className="text-green-400">✔ CONFIRMED</span>
                                    ) : (
                                        <span className="text-red-400">✘ REJECTED</span>
                                    )}
                                </td>
                            </tr>
                        ))
                    )}
                </tbody>
            </table>
        </div>
    </Card>
  );

  // ==========================================================================
  // 6. MAIN RENDER
  // ==========================================================================

  if (isLoading) {
    return (
        <div className="min-h-screen bg-gray-900 flex flex-col items-center justify-center text-white">
            <div className="w-16 h-16 border-4 border-cyan-500 border-t-transparent rounded-full animate-spin mb-4"></div>
            <h2 className="text-xl font-bold tracking-widest animate-pulse">INITIALIZING QUANTUM CORE</h2>
            <p className="text-gray-500 text-sm mt-2">Establishing Secure Handshake...</p>
        </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 font-sans selection:bg-cyan-500/30">
      {/* TOP NAVIGATION */}
      <header className="bg-gray-900 border-b border-gray-800 sticky top-0 z-30">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
            <div className="flex items-center space-x-4">
                <div className="w-8 h-8 bg-gradient-to-br from-cyan-500 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
                    <span className="text-white font-bold text-lg">Q</span>
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white tracking-tight">{DEMO_NAME}</h1>
                    <p className="text-[10px] text-gray-400 uppercase tracking-widest">Enterprise Demo Environment</p>
                </div>
            </div>
            
            <nav className="hidden md:flex space-x-1">
                {['DASHBOARD', 'PAYMENTS', 'SECURITY', 'AUDIT'].map((view) => (
                    <button
                        key={view}
                        onClick={() => setActiveView(view as DemoView)}
                        className={`px-4 py-2 rounded-md text-sm font-medium transition-all ${
                            activeView === view 
                            ? 'bg-gray-800 text-white shadow-inner' 
                            : 'text-gray-400 hover:text-white hover:bg-gray-800/50'
                        }`}
                    >
                        {view}
                    </button>
                ))}
            </nav>

            <div className="flex items-center space-x-4">
                <div className="hidden md:block text-right">
                    <p className="text-sm text-white font-medium">{context?.userProfile?.name || 'Guest User'}</p>
                    <p className="text-xs text-gray-500">Sovereign Access</p>
                </div>
                <div className="w-8 h-8 rounded-full bg-gray-700 border border-gray-600 overflow-hidden">
                    <img src={`https://api.dicebear.com/7.x/avataaars/svg?seed=${context?.userProfile?.name || 'Guest'}`} alt="Avatar" />
                </div>
            </div>
        </div>
      </header>

      {/* MAIN LAYOUT */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 flex gap-6 relative">
        
        {/* LEFT CONTENT AREA */}
        <main className="flex-1 min-w-0">
            <div className="mb-6 flex justify-between items-end">
                <div>
                    <h2 className="text-2xl font-bold text-white">{activeView === 'DASHBOARD' ? 'Treasury Overview' : activeView.charAt(0) + activeView.slice(1).toLowerCase()}</h2>
                    <p className="text-gray-400 text-sm mt-1">
                        {activeView === 'DASHBOARD' && 'Real-time liquidity and operational insights.'}
                        {activeView === 'PAYMENTS' && 'Execute secure domestic and international transfers.'}
                        {activeView === 'SECURITY' && 'Monitor threats and manage access protocols.'}
                        {activeView === 'AUDIT' && 'Immutable record of all system activities.'}
                    </p>
                </div>
                <div className="flex space-x-2">
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-900/30 text-blue-400 border border-blue-500/20">
                        <span className="w-1.5 h-1.5 bg-blue-400 rounded-full mr-1.5 animate-pulse"></span>
                        Live Data Feed
                    </span>
                </div>
            </div>

            {activeView === 'DASHBOARD' && renderDashboard()}
            {activeView === 'PAYMENTS' && renderPayments()}
            {activeView === 'SECURITY' && renderSecurity()}
            {activeView === 'AUDIT' && renderAudit()}
        </main>

        {/* RIGHT SIDEBAR: AI COMPANION */}
        <aside className={`fixed inset-y-0 right-0 w-96 bg-gray-900 border-l border-gray-800 shadow-2xl transform transition-transform duration-300 z-40 flex flex-col ${isChatOpen ? 'translate-x-0' : 'translate-x-full'}`}>
            {/* Toggle Handle (Visible when closed) */}
            {!isChatOpen && (
                <button 
                    onClick={() => setIsChatOpen(true)}
                    className="absolute left-0 top-1/2 -translate-x-full bg-cyan-600 text-white p-2 rounded-l-lg shadow-lg hover:bg-cyan-500 transition-colors"
                >
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" /></svg>
                </button>
            )}

            {/* Chat Header */}
            <div className="p-4 border-b border-gray-800 flex justify-between items-center bg-gray-800/50">
                <div className="flex items-center space-x-3">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <h3 className="font-bold text-white">Sovereign AI</h3>
                </div>
                <button onClick={() => setIsChatOpen(false)} className="text-gray-400 hover:text-white">
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
                </button>
            </div>

            {/* Chat Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                {chatHistory.map((msg) => (
                    <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                            msg.role === 'user' 
                            ? 'bg-cyan-600 text-white rounded-br-none' 
                            : msg.role === 'system'
                            ? 'bg-red-900/20 text-red-300 border border-red-500/20 w-full text-center'
                            : 'bg-gray-800 text-gray-200 rounded-bl-none border border-gray-700'
                        }`}>
                            {msg.isTyping ? (
                                <div className="flex space-x-1 h-5 items-center">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                                </div>
                            ) : (
                                <p>{msg.content}</p>
                            )}
                            {msg.role !== 'system' && !msg.isTyping && (
                                <p className={`text-[10px] mt-1 ${msg.role === 'user' ? 'text-cyan-200' : 'text-gray-500'}`}>
                                    {msg.timestamp.toLocaleTimeString([], {hour: '2-digit', minute:'2-digit'})}
                                </p>
                            )}
                        </div>
                    </div>
                ))}
                <div ref={chatEndRef} />
            </div>

            {/* Chat Input */}
            <div className="p-4 border-t border-gray-800 bg-gray-900">
                <div className="relative">
                    <input
                        type="text"
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleAIChat()}
                        placeholder="Ask about cash flow, initiate wires..."
                        className="w-full bg-gray-800 text-white rounded-xl pl-4 pr-12 py-3 text-sm focus:ring-2 focus:ring-cyan-500 focus:outline-none border border-gray-700"
                    />
                    <button 
                        onClick={handleAIChat}
                        className="absolute right-2 top-2 p-1.5 bg-cyan-600 hover:bg-cyan-500 text-white rounded-lg transition-colors"
                    >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                    </button>
                </div>
                <p className="text-center text-[10px] text-gray-600 mt-2">
                    AI can execute dashboard actions. Try "Show me security alerts".
                </p>
            </div>
        </aside>

        {/* Floating Chat Toggle (Visible when open, for symmetry/access) */}
        {isChatOpen && (
             <div className="hidden lg:block w-96 flex-shrink-0"></div> // Spacer
        )}

      </div>
    </div>
  );
};

export default PlaidInstitutionsExplorer;