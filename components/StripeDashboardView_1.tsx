import React, { useContext, useState, useMemo, useCallback, useEffect, useRef } from 'react';
import { DataContext } from '../context/DataContext';
import Card from './Card';
import { 
  View, 
  StripeBalance, 
  StripeCharge, 
  StripeCustomer, 
  StripeSubscription, 
  AIInsight,
  Transaction,
  Notification
} from '../types';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL: THE GOLDEN TICKET EXPERIENCE
 * --------------------------------------------------------------------------------
 * METAPHOR: This is the "Test Drive". We are letting the user kick the tires,
 * see the engine roar, and experience the "Bells and Whistles" of a global
 * financial powerhouse.
 * 
 * PHILOSOPHY:
 * - Elite, Professional, High-Performance.
 * - No Pressure Environment.
 * - Robust Security & Auditability.
 * - AI-First Interaction.
 * --------------------------------------------------------------------------------
 */

// ================================================================================================
// CONSTANTS & CONFIGURATION
// ================================================================================================

const BRAND_NAME = "Quantum Financial";
const SYSTEM_VERSION = "v4.2.0-GOLDEN-TICKET";
const AUDIT_STORAGE_KEY = "QUANTUM_AUDIT_TRAIL";

// ================================================================================================
// EXTENDED TYPES FOR THE MONOLITH
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'INFO' | 'SECURITY' | 'CRITICAL';
  ipAddress: string;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: string;
  metadata?: any;
}

interface QuantumFormState {
  isOpen: boolean;
  type: 'WIRE' | 'ACH' | 'ERP_SYNC' | 'FRAUD_REPORT' | 'NONE';
  data: any;
}

// ================================================================================================
// MOCK DATA GENERATORS (THE ENGINE ROOM)
// ================================================================================================

const generateEliteMockData = () => {
  const charges: StripeCharge[] = Array.from({ length: 50 }, (_, i) => ({
    id: `ch_quantum_${Math.random().toString(36).substr(2, 9)}`,
    amount: Math.floor(Math.random() * 10000000) + 50000,
    currency: 'usd',
    status: Math.random() > 0.1 ? 'succeeded' : 'failed',
    created: Math.floor(Date.now() / 1000) - (i * 3600),
    description: `Global Settlement - Batch ${1000 + i}`,
    customer_id: `cus_elite_${i}`,
  }));

  const customers: StripeCustomer[] = Array.from({ length: 20 }, (_, i) => ({
    id: `cus_elite_${i}`,
    email: `treasury@enterprise-${i}.global`,
    name: `Global Enterprise ${i + 1} Corp`,
    created: Math.floor(Date.now() / 1000) - (i * 86400 * 30),
    total_spent: Math.floor(Math.random() * 500000000),
  }));

  return { charges, customers };
};

// ================================================================================================
// MAIN COMPONENT: THE MONOLITH
// ================================================================================================

const StripeDashboardView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("Quantum Financial components must be used within a DataProvider");

  const { 
    setActiveView, 
    showNotification, 
    addTransaction,
    geminiApiKey 
  } = context;

  // --- STATE MANAGEMENT ---
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'ai',
      content: "Welcome to the Quantum Financial Demo. I am your Sovereign AI Architect. How can I help you test-drive our global infrastructure today?",
      timestamp: new Date().toLocaleTimeString()
    }
  ]);
  const [userInput, setUserInput] = useState("");
  const [isAiThinking, setIsAiThinking] = useState(false);
  const [formState, setFormState] = useState<QuantumFormState>({ isOpen: false, type: 'NONE', data: {} });
  const [activeTab, setActiveTab] = useState<'OVERVIEW' | 'OPERATIONS' | 'SECURITY' | 'AUDIT'>('OVERVIEW');
  const [mockData] = useState(generateEliteMockData());
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedAudit = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (savedAudit) setAuditTrail(JSON.parse(savedAudit));
    
    logAction("SYSTEM_INIT", "Quantum Financial Dashboard Initialized", "INFO");
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatHistory]);

  // --- CORE LOGIC: AUDIT STORAGE ---
  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'INFO') => {
    const newEntry: AuditEntry = {
      id: `LOG-${Date.now()}-${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      details,
      severity,
      actor: "James Burvel oCallaghan III", // Demo User
      ipAddress: "192.168.1.1 (Quantum Tunnel)"
    };
    
    setAuditTrail(prev => {
      const updated = [newEntry, ...prev].slice(0, 1000);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // --- CORE LOGIC: AI INTEGRATION ---
  const handleAiCommand = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!userInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: userInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setChatHistory(prev => [...prev, userMsg]);
    setUserInput("");
    setIsAiThinking(true);
    logAction("AI_PROMPT", `User asked: ${userInput}`, "INFO");

    try {
      // Use the provided Gemini logic
      const apiKey = geminiApiKey || process.env.GEMINI_API_KEY || "DEMO_KEY";
      const ai = new GoogleGenAI(apiKey);
      
      // In a real demo, we'd use the actual model. For this "Golden Ticket" experience, 
      // we simulate the high-performance response if the key is missing, 
      // but attempt the real call if it exists.
      let aiResponseText = "";
      
      if (apiKey !== "DEMO_KEY") {
        const model = ai.getGenerativeModel({ model: "gemini-pro" });
        const prompt = `
          You are the Quantum Financial AI. You are helping a high-net-worth user "test drive" a global banking platform.
          The user said: "${userInput}"
          
          Instructions:
          1. Be elite, professional, and secure.
          2. If they want to send money, tell them you are opening the Wire Transfer portal.
          3. If they want to see security, mention our multi-factor authentication and fraud monitoring.
          4. Use metaphors like "kicking the tires" or "seeing the engine roar".
          5. NEVER mention Citibank. Use "Quantum Financial".
          6. Keep it concise but powerful.
        `;
        const result = await model.generateContent(prompt);
        const response = await result.response;
        aiResponseText = response.text();
      } else {
        // Simulated High-Performance AI for Demo
        await new Promise(r => setTimeout(r, 1000));
        if (userInput.toLowerCase().includes("wire") || userInput.toLowerCase().includes("send")) {
          aiResponseText = "Understood. I am initializing the Quantum Wire Transfer protocol. You can now 'kick the tires' on our global settlement engine. The secure form is appearing now.";
          setFormState({ isOpen: true, type: 'WIRE', data: {} });
        } else if (userInput.toLowerCase().includes("audit") || userInput.toLowerCase().includes("logs")) {
          aiResponseText = "Accessing the Black Box. Every sensitive action in Quantum Financial is logged with cryptographic certainty. Switching your view to the Audit Ledger.";
          setActiveTab('AUDIT');
        } else {
          aiResponseText = "Quantum Financial systems are nominal. I have analyzed your request and optimized the dashboard for your current trajectory. How else can we demonstrate the power of this engine?";
        }
      }

      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'ai',
        content: aiResponseText,
        timestamp: new Date().toLocaleTimeString()
      }]);
    } catch (error) {
      console.error("AI Error:", error);
      setChatHistory(prev => [...prev, {
        id: (Date.now() + 1).toString(),
        role: 'system',
        content: "AI Core synchronization interrupted. Manual override engaged.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- FORM HANDLERS ---
  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData(e.target as HTMLFormElement);
    const amount = formData.get('amount');
    const recipient = formData.get('recipient');

    logAction(`${formState.type}_EXECUTION`, `Amount: ${amount}, Recipient: ${recipient}`, "SECURITY");
    
    showNotification(`${formState.type} Processed Successfully`, "success");
    
    if (formState.type === 'WIRE') {
      addTransaction({
        id: `tx_${Date.now()}`,
        type: 'expense',
        category: 'Wire Transfer',
        description: `Quantum Wire to ${recipient}`,
        amount: Number(amount),
        date: new Date().toISOString(),
        currency: 'USD'
      });
    }

    setFormState({ isOpen: false, type: 'NONE', data: {} });
  };

  // ================================================================================================
  // SUB-COMPONENTS (UI MODULES)
  // ================================================================================================

  const QuantumModal = () => {
    if (!formState.isOpen) return null;

    return (
      <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-md p-4">
        <div className="w-full max-w-lg bg-gray-900 border border-cyan-500/50 rounded-2xl shadow-[0_0_50px_rgba(6,182,212,0.2)] overflow-hidden">
          <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-cyan-950">
            <h2 className="text-xl font-bold text-white tracking-tight">
              {formState.type === 'WIRE' && "🚀 Initiate Quantum Wire Transfer"}
              {formState.type === 'ACH' && "🏦 Setup ACH Collection"}
              {formState.type === 'ERP_SYNC' && "🔄 ERP Integration Bridge"}
            </h2>
            <button onClick={() => setFormState({ isOpen: false, type: 'NONE', data: {} })} className="text-gray-400 hover:text-white">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
          </div>
          <form onSubmit={handleFormSubmit} className="p-8 space-y-6">
            <div className="space-y-2">
              <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Recipient Entity</label>
              <input name="recipient" required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all" placeholder="e.g. Global Logistics Ltd" />
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Amount (USD)</label>
                <input name="amount" type="number" required className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all" placeholder="0.00" />
              </div>
              <div className="space-y-2">
                <label className="text-xs font-bold text-cyan-500 uppercase tracking-widest">Reference Code</label>
                <input name="ref" className="w-full bg-gray-800 border border-gray-700 rounded-lg p-3 text-white focus:border-cyan-500 outline-none transition-all" placeholder="INV-9901" />
              </div>
            </div>
            <div className="p-4 bg-cyan-500/10 border border-cyan-500/20 rounded-lg">
              <p className="text-xs text-cyan-300 leading-relaxed">
                <strong>Security Note:</strong> This transaction is protected by Quantum-Level Encryption and real-time fraud heuristic monitoring. By clicking "Execute", you authorize the immediate movement of capital across the global network.
              </p>
            </div>
            <button type="submit" className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-bold rounded-xl shadow-lg shadow-cyan-900/20 transition-all transform hover:scale-[1.02] active:scale-[0.98]">
              EXECUTE TRANSACTION
            </button>
          </form>
        </div>
      </div>
    );
  };

  const ChatBar = () => (
    <div className="flex flex-col h-full bg-gray-900/50 border-l border-gray-800 w-96">
      <div className="p-4 border-b border-gray-800 bg-gray-900/80">
        <h3 className="text-sm font-black text-cyan-500 uppercase tracking-[0.2em]">Sovereign AI Architect</h3>
        <p className="text-[10px] text-gray-500">Real-time Financial Intelligence</p>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
        {chatHistory.map(msg => (
          <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
            <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
              msg.role === 'user' 
                ? 'bg-cyan-600 text-white rounded-tr-none' 
                : msg.role === 'ai' 
                  ? 'bg-gray-800 text-gray-200 border border-gray-700 rounded-tl-none'
                  : 'bg-red-900/20 text-red-400 border border-red-900/50 italic'
            }`}>
              {msg.content}
              <div className="text-[9px] mt-1 opacity-50 text-right">{msg.timestamp}</div>
            </div>
          </div>
        ))}
        {isAiThinking && (
          <div className="flex justify-start">
            <div className="bg-gray-800 p-3 rounded-2xl rounded-tl-none border border-gray-700">
              <div className="flex space-x-1">
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>
      <form onSubmit={handleAiCommand} className="p-4 border-t border-gray-800 bg-gray-900/80">
        <div className="relative">
          <input 
            value={userInput}
            onChange={(e) => setUserInput(e.target.value)}
            placeholder="Ask AI to send a wire..."
            className="w-full bg-gray-800 border border-gray-700 rounded-xl py-3 pl-4 pr-12 text-sm text-white focus:border-cyan-500 outline-none transition-all"
          />
          <button type="submit" className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" /></svg>
          </button>
        </div>
      </form>
    </div>
  );

  // ================================================================================================
  // RENDER LOGIC
  // ================================================================================================

  return (
    <div className="flex h-screen bg-[#0a0a0c] text-gray-300 font-sans overflow-hidden">
      <QuantumModal />
      
      {/* MAIN CONTENT AREA */}
      <div className="flex-1 flex flex-col overflow-hidden">
        
        {/* ELITE HEADER */}
        <header className="h-20 border-b border-gray-800 flex items-center justify-between px-8 bg-gray-900/30 backdrop-blur-xl z-50">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 bg-gradient-to-br from-cyan-500 to-blue-700 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <span className="text-white font-black text-xl">Q</span>
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tighter uppercase">{BRAND_NAME}</h1>
              <div className="flex items-center space-x-2">
                <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></span>
                <span className="text-[10px] font-bold text-gray-500 uppercase tracking-widest">Global Node: Active</span>
              </div>
            </div>
          </div>

          <nav className="flex items-center space-x-1 bg-gray-800/50 p-1 rounded-xl border border-gray-700/50">
            {(['OVERVIEW', 'OPERATIONS', 'SECURITY', 'AUDIT'] as const).map(tab => (
              <button
                key={tab}
                onClick={() => {
                  setActiveTab(tab);
                  logAction("NAVIGATE", `User switched to ${tab} view`, "INFO");
                }}
                className={`px-6 py-2 rounded-lg text-xs font-bold transition-all ${
                  activeTab === tab 
                    ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' 
                    : 'text-gray-500 hover:text-gray-300 hover:bg-gray-700/30'
                }`}
              >
                {tab}
              </button>
            ))}
          </nav>

          <div className="flex items-center space-x-6">
            <div className="text-right">
              <p className="text-[10px] font-bold text-gray-500 uppercase">Available Liquidity</p>
              <p className="text-lg font-black text-white">$2,450,000,000.00</p>
            </div>
            <div className="w-10 h-10 rounded-full border-2 border-cyan-500/30 p-0.5">
              <img src="https://api.dicebear.com/7.x/avataaars/svg?seed=James" className="rounded-full bg-gray-800" alt="User" />
            </div>
          </div>
        </header>

        {/* SCROLLABLE DASHBOARD CONTENT */}
        <main className="flex-1 overflow-y-auto p-8 custom-scrollbar bg-[radial-gradient(circle_at_top_right,_var(--tw-gradient-stops))] from-cyan-950/10 via-transparent to-transparent">
          
          {activeTab === 'OVERVIEW' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
              {/* HERO METRICS */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <Card title="Gross Volume (24h)" className="border-l-4 border-cyan-500">
                  <div className="py-2">
                    <p className="text-4xl font-black text-white">$142.8M</p>
                    <p className="text-xs text-green-400 mt-2 flex items-center">
                      <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" /></svg>
                      +12.5% from yesterday
                    </p>
                  </div>
                </Card>
                <Card title="Settlement Efficiency">
                  <div className="py-2">
                    <p className="text-4xl font-black text-white">99.98%</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Real-time DLT Verification</p>
                  </div>
                </Card>
                <Card title="Active Fraud Alerts">
                  <div className="py-2">
                    <p className="text-4xl font-black text-red-500">0</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Heuristic Engine: Nominal</p>
                  </div>
                </Card>
                <Card title="Global Nodes">
                  <div className="py-2">
                    <p className="text-4xl font-black text-cyan-500">142</p>
                    <p className="text-xs text-gray-500 mt-2 uppercase tracking-widest">Latency: 14ms Avg</p>
                  </div>
                </Card>
              </div>

              {/* MAIN DATA GRID */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-8">
                  <Card title="Recent Global Settlements" subtitle="Live feed of cross-border capital movement">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left">
                        <thead>
                          <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                            <th className="pb-4">Transaction ID</th>
                            <th className="pb-4">Entity</th>
                            <th className="pb-4">Amount</th>
                            <th className="pb-4">Status</th>
                            <th className="pb-4 text-right">Timestamp</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-800/50">
                          {mockData.charges.slice(0, 8).map(tx => (
                            <tr key={tx.id} className="group hover:bg-gray-800/30 transition-colors">
                              <td className="py-4 font-mono text-xs text-cyan-500">{tx.id.split('_')[2]}</td>
                              <td className="py-4 text-sm font-bold text-white">{tx.description}</td>
                              <td className="py-4 text-sm font-black text-white">${(tx.amount / 100).toLocaleString()}</td>
                              <td className="py-4">
                                <span className={`px-2 py-1 rounded-md text-[10px] font-black uppercase ${
                                  tx.status === 'succeeded' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'
                                }`}>
                                  {tx.status}
                                </span>
                              </td>
                              <td className="py-4 text-right text-xs text-gray-500">
                                {new Date(tx.created * 1000).toLocaleTimeString()}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </Card>
                </div>

                <div className="space-y-8">
                  <Card title="The Golden Ticket" className="bg-gradient-to-br from-cyan-900/40 to-blue-900/40 border-cyan-500/30">
                    <div className="space-y-4">
                      <p className="text-sm leading-relaxed text-gray-300">
                        Welcome to your "Secret Weapon" in business banking. This demo is your backstage pass to see how easy it is to manage accounts, process payments, and track expenses.
                      </p>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-3 text-xs text-cyan-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span>Kick the tires on Wire Transfers</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-cyan-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span>See the engine roar with AI Insights</span>
                        </div>
                        <div className="flex items-center space-x-3 text-xs text-cyan-400">
                          <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" /></svg>
                          <span>Explore no-pressure security tools</span>
                        </div>
                      </div>
                      <button 
                        onClick={() => setFormState({ isOpen: true, type: 'WIRE', data: {} })}
                        className="w-full py-3 bg-white text-black font-black text-xs uppercase tracking-widest rounded-lg hover:bg-cyan-400 transition-colors"
                      >
                        Start Test Drive
                      </button>
                    </div>
                  </Card>

                  <Card title="System Health" subtitle="Quantum Infrastructure Status">
                    <div className="space-y-4">
                      {[
                        { label: 'API Gateway', status: 'Operational', color: 'bg-green-500' },
                        { label: 'DLT Ledger', status: 'Operational', color: 'bg-green-500' },
                        { label: 'AI Core', status: 'High Load', color: 'bg-yellow-500' },
                        { label: 'Fraud Engine', status: 'Operational', color: 'bg-green-500' },
                      ].map(item => (
                        <div key={item.label} className="flex justify-between items-center">
                          <span className="text-xs font-bold text-gray-400">{item.label}</span>
                          <div className="flex items-center space-x-2">
                            <span className="text-[10px] font-black text-white uppercase">{item.status}</span>
                            <span className={`w-2 h-2 rounded-full ${item.color}`}></span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'OPERATIONS' && (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 animate-in fade-in zoom-in-95 duration-500">
              <Card title="Wire Transfer" subtitle="Global real-time settlement">
                <div className="space-y-6">
                  <div className="h-32 bg-gray-800/50 rounded-xl border border-dashed border-gray-700 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                  </div>
                  <p className="text-xs text-gray-400">Execute high-value domestic and international wires with sub-second finality.</p>
                  <button onClick={() => setFormState({ isOpen: true, type: 'WIRE', data: {} })} className="w-full py-3 bg-cyan-600/20 border border-cyan-500/50 text-cyan-400 font-bold rounded-lg hover:bg-cyan-600 hover:text-white transition-all">
                    Open Wire Portal
                  </button>
                </div>
              </Card>
              <Card title="ACH & Direct Debit" subtitle="Automated clearing house">
                <div className="space-y-6">
                  <div className="h-32 bg-gray-800/50 rounded-xl border border-dashed border-gray-700 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" /></svg>
                  </div>
                  <p className="text-xs text-gray-400">Manage recurring payments and collections with automated reconciliation.</p>
                  <button onClick={() => setFormState({ isOpen: true, type: 'ACH', data: {} })} className="w-full py-3 bg-gray-800 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-700 transition-all">
                    Manage ACH
                  </button>
                </div>
              </Card>
              <Card title="ERP Integration" subtitle="Sync with SAP, Oracle, Xero">
                <div className="space-y-6">
                  <div className="h-32 bg-gray-800/50 rounded-xl border border-dashed border-gray-700 flex items-center justify-center">
                    <svg className="w-12 h-12 text-gray-600" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M11 4a2 2 0 114 0v1a1 1 0 001 1h3a1 1 0 011 1v3a1 1 0 01-1 1h-1a2 2 0 100 4h1a1 1 0 011 1v3a1 1 0 01-1 1h-3a1 1 0 01-1-1v-1a2 2 0 10-4 0v1a1 1 0 01-1 1H7a1 1 0 01-1-1v-3a1 1 0 00-1-1H4a2 2 0 110-4h1a1 1 0 001-1V7a1 1 0 011-1h3a1 1 0 001-1V4z" /></svg>
                  </div>
                  <p className="text-xs text-gray-400">Eliminate data silos by bridging your financial ledger directly to your ERP.</p>
                  <button onClick={() => setFormState({ isOpen: true, type: 'ERP_SYNC', data: {} })} className="w-full py-3 bg-gray-800 border border-gray-700 text-white font-bold rounded-lg hover:bg-gray-700 transition-all">
                    Configure Bridge
                  </button>
                </div>
              </Card>
            </div>
          )}

          {activeTab === 'SECURITY' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-right-4 duration-500">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title="Fraud Monitoring Engine" subtitle="Real-time heuristic analysis">
                  <div className="space-y-6">
                    <div className="flex items-center justify-between p-4 bg-green-500/10 border border-green-500/20 rounded-xl">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-green-500/20 rounded-full flex items-center justify-center">
                          <svg className="w-6 h-6 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                        </div>
                        <div>
                          <p className="text-sm font-black text-white uppercase">Shield Status: Active</p>
                          <p className="text-xs text-gray-400">Scanning 1,400+ vectors per second</p>
                        </div>
                      </div>
                      <span className="text-[10px] font-black text-green-500 bg-green-500/10 px-2 py-1 rounded">SECURE</span>
                    </div>
                    <div className="space-y-4">
                      <h4 className="text-xs font-black text-gray-500 uppercase tracking-widest">Recent Security Events</h4>
                      {[
                        { event: 'MFA Challenge Issued', location: 'London, UK', status: 'Verified' },
                        { event: 'New Device Authorized', location: 'New York, US', status: 'Verified' },
                        { event: 'IP Velocity Check', location: 'Global', status: 'Passed' },
                      ].map((e, i) => (
                        <div key={i} className="flex justify-between items-center p-3 bg-gray-800/30 rounded-lg border border-gray-700/50">
                          <div>
                            <p className="text-xs font-bold text-white">{e.event}</p>
                            <p className="text-[10px] text-gray-500">{e.location}</p>
                          </div>
                          <span className="text-[9px] font-black text-cyan-500">{e.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </Card>
                <Card title="Multi-Factor Authentication" subtitle="Biometric & Hardware Keys">
                  <div className="space-y-6">
                    <p className="text-sm text-gray-400">Quantum Financial requires hardware-level attestation for all high-value movements. Configure your security keys below.</p>
                    <div className="grid grid-cols-2 gap-4">
                      <button className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex flex-col items-center space-y-2 hover:border-cyan-500 transition-all">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" /></svg>
                        <span className="text-[10px] font-black uppercase">YubiKey</span>
                      </button>
                      <button className="p-4 bg-gray-800 border border-gray-700 rounded-xl flex flex-col items-center space-y-2 hover:border-cyan-500 transition-all">
                        <svg className="w-8 h-8 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1" d="M12 11c0 3.517-1.009 6.799-2.753 9.571m-3.44-2.04l.054-.09A10.003 10.003 0 0012 3c1.268 0 2.39.675 3 1.7" /></svg>
                        <span className="text-[10px] font-black uppercase">Biometrics</span>
                      </button>
                    </div>
                    <div className="p-4 bg-yellow-500/10 border border-yellow-500/20 rounded-xl">
                      <p className="text-[10px] text-yellow-500 font-bold uppercase mb-1">Security Recommendation</p>
                      <p className="text-xs text-yellow-200/70">Your account is currently using SMS-based MFA. We recommend upgrading to a hardware key for "Elite" level protection.</p>
                    </div>
                  </div>
                </Card>
              </div>
            </div>
          )}

          {activeTab === 'AUDIT' && (
            <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500">
              <Card title="Immutable Audit Ledger" subtitle="The 'Black Box' of Quantum Financial">
                <div className="overflow-x-auto">
                  <table className="w-full text-left">
                    <thead>
                      <tr className="text-[10px] font-black text-gray-500 uppercase tracking-widest border-b border-gray-800">
                        <th className="pb-4">Timestamp</th>
                        <th className="pb-4">Action</th>
                        <th className="pb-4">Details</th>
                        <th className="pb-4">Actor</th>
                        <th className="pb-4 text-right">Severity</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-800/50">
                      {auditTrail.map(log => (
                        <tr key={log.id} className="hover:bg-gray-800/20 transition-colors">
                          <td className="py-4 text-xs font-mono text-gray-500">{new Date(log.timestamp).toLocaleString()}</td>
                          <td className="py-4 text-xs font-black text-white uppercase">{log.action}</td>
                          <td className="py-4 text-xs text-gray-400">{log.details}</td>
                          <td className="py-4 text-xs font-bold text-cyan-500">{log.actor}</td>
                          <td className="py-4 text-right">
                            <span className={`px-2 py-1 rounded text-[9px] font-black uppercase ${
                              log.severity === 'CRITICAL' ? 'bg-red-500 text-white' : 
                              log.severity === 'SECURITY' ? 'bg-yellow-500 text-black' : 
                              'bg-gray-700 text-gray-300'
                            }`}>
                              {log.severity}
                            </span>
                          </td>
                        </tr>
                      ))}
                      {auditTrail.length === 0 && (
                        <tr>
                          <td colSpan={5} className="py-20 text-center text-gray-600 italic">
                            No audit entries found. Start "kicking the tires" to generate logs.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </Card>
            </div>
          )}

        </main>

        {/* FOOTER STATUS BAR */}
        <footer className="h-10 border-t border-gray-800 bg-gray-900/50 flex items-center justify-between px-8 text-[10px] font-bold text-gray-500 uppercase tracking-widest">
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-green-500 rounded-full"></span>
              <span>System: Nominal</span>
            </div>
            <div className="flex items-center space-x-2">
              <span className="w-1.5 h-1.5 bg-cyan-500 rounded-full"></span>
              <span>AI Core: Synchronized</span>
            </div>
            <div>Encryption: AES-256-GCM</div>
          </div>
          <div className="flex items-center space-x-4">
            <span>{SYSTEM_VERSION}</span>
            <span className="text-gray-700">|</span>
            <span>© 2024 {BRAND_NAME} GLOBAL</span>
          </div>
        </footer>
      </div>

      {/* AI CHAT SIDEBAR */}
      <ChatBar />
    </div>
  );
};

export default StripeDashboardView;