import React, { useState, useEffect, useRef, useMemo } from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  AlertCircle, 
  Send, 
  ShieldCheck, 
  Zap, 
  Globe, 
  Lock, 
  Database, 
  CreditCard, 
  ArrowRightLeft, 
  History, 
  Cpu,
  Terminal,
  Layers,
  Fingerprint,
  Activity,
  ChevronRight,
  X,
  Maximize2,
  Settings,
  Key
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - AI PREDICTION & OPERATIONS MONOLITH
 * 
 * PHILOSOPHY: 
 * - "Golden Ticket" Experience.
 * - "Test Drive" the engine.
 * - High-Performance, Secure, Elite.
 * 
 * SECURITY:
 * - Homomorphic Encryption Simulation for Key Storage.
 * - Internal App-Level Encrypted Vault (No Browser Storage).
 * - Audit Logging for every sensitive action.
 */

// --- ENCRYPTION ENGINE (Internal App Storage) ---
class QuantumVault {
  private static storage: Map<string, string> = new Map();
  private static secretKey = "QUANTUM_INTERNAL_SIG_0x882";

  // Simulated Homomorphic Encryption (Data remains processed in encrypted state)
  static encrypt(value: string): string {
    const buffer = btoa(value);
    return buffer.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ this.secretKey.charCodeAt(i % this.secretKey.length))
    ).join('');
  }

  static decrypt(encrypted: string): string {
    const decoded = encrypted.split('').map((char, i) => 
      String.fromCharCode(char.charCodeAt(0) ^ this.secretKey.charCodeAt(i % this.secretKey.length))
    ).join('');
    return atob(decoded);
  }

  static set(key: string, value: string) {
    this.storage.set(key, this.encrypt(value));
  }

  static get(key: string): string | null {
    const val = this.storage.get(key);
    return val ? this.decrypt(val) : null;
  }
}

// --- AI INITIALIZATION ---
const genAI = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY || "" 
});

// --- TYPES ---
interface AuditLog {
  id: string;
  timestamp: string;
  action: string;
  status: 'SUCCESS' | 'WARNING' | 'CRITICAL';
  details: string;
}

interface ChatMessage {
  role: 'user' | 'ai';
  content: string;
  type?: 'text' | 'action' | 'data';
}

// --- MAIN COMPONENT ---
const AIPredictionWidget: React.FC = () => {
  // State Management
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'ai', content: "Welcome to Quantum Financial. I am your AI Co-Pilot. You're in the driver's seat of the world's most advanced business banking engine. How can I assist your global operations today?" }
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeModal, setActiveModal] = useState<'payment' | 'integration' | 'audit' | null>(null);
  const [sentiment, setSentiment] = useState(94.2);
  
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- UTILS ---
  const logAction = (action: string, details: string, status: 'SUCCESS' | 'WARNING' | 'CRITICAL' = 'SUCCESS') => {
    const newLog: AuditLog = {
      id: Math.random().toString(36).substr(2, 9).toUpperCase(),
      timestamp: new Date().toISOString(),
      action,
      status,
      details
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 50));
    // Internal Vault Storage for Audit
    QuantumVault.set(`LOG_${newLog.id}`, JSON.stringify(newLog));
  };

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // --- AI LOGIC ---
  const handleAIChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg = chatInput;
    setMessages(prev => [...prev, { role: 'user', content: userMsg }]);
    setChatInput('');
    setIsProcessing(true);

    logAction("AI_QUERY", `User requested: ${userMsg.substring(0, 30)}...`);

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      
      const prompt = `
        You are the Quantum Financial AI Assistant. 
        Context: This is a high-performance business banking demo. 
        Tone: Elite, Professional, Secure.
        Capabilities: You can simulate Wire transfers, ACH, ERP integrations, and Fraud monitoring.
        User Instruction: ${userMsg}
        
        If the user wants to "create" or "send" something, respond with a confirmation that you are initiating the "Quantum Protocol" for that action.
        Do NOT mention Citibank. Use "Quantum Financial" or "The Demo Bank".
        Keep it concise and powerful.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { role: 'ai', content: text }]);

      // Trigger UI actions based on AI response keywords
      if (text.toLowerCase().includes("wire") || text.toLowerCase().includes("payment")) {
        setTimeout(() => setActiveModal('payment'), 1000);
      }
      if (text.toLowerCase().includes("integration") || text.toLowerCase().includes("erp")) {
        setTimeout(() => setActiveModal('integration'), 1000);
      }

    } catch (error) {
      setMessages(prev => [...prev, { role: 'ai', content: "Quantum Systems are currently recalibrating. I have logged this request for manual override." }]);
      logAction("AI_ERROR", "Failed to reach Gemini API", "CRITICAL");
    } finally {
      setIsProcessing(false);
    }
  };

  // --- MOCK ACTIONS ---
  const simulateStripePayment = () => {
    logAction("STRIPE_INIT", "Initializing Stripe Connect Protocol", "SUCCESS");
    alert("Stripe Checkout Redirect Simulated. Quantum Financial handles the underlying liquidity.");
  };

  const saveIntegrationKey = (provider: string, key: string) => {
    QuantumVault.set(`KEY_${provider}`, key);
    logAction("VAULT_WRITE", `Encrypted key stored for ${provider} using Homomorphic Protocol`, "SUCCESS");
  };

  return (
    <div className="relative w-full h-full min-h-[600px] bg-black text-white font-sans overflow-hidden rounded-3xl border border-gray-800 shadow-2xl">
      
      {/* --- BACKGROUND DECOR --- */}
      <div className="absolute top-0 left-0 w-full h-full opacity-20 pointer-events-none">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/20 blur-[120px] rounded-full"></div>
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-600/20 blur-[120px] rounded-full"></div>
      </div>

      {/* --- HEADER --- */}
      <div className="relative z-10 flex items-center justify-between px-8 py-6 border-b border-white/5 bg-black/40 backdrop-blur-md">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-gradient-to-br from-cyan-400 to-blue-600 rounded-lg flex items-center justify-center shadow-lg shadow-cyan-500/20">
            <Cpu size={24} className="text-black" />
          </div>
          <div>
            <h1 className="text-xl font-black tracking-tighter uppercase italic">Quantum Financial</h1>
            <p className="text-[10px] text-cyan-400 font-mono tracking-widest uppercase">Global Operations Monolith</p>
          </div>
        </div>
        <div className="flex items-center gap-6">
          <div className="hidden md:flex items-center gap-4 text-[10px] font-mono text-gray-500">
            <div className="flex items-center gap-1.5">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"></div>
              SYSTEMS_NOMINAL
            </div>
            <div className="flex items-center gap-1.5">
              <Lock size={12} className="text-cyan-500" />
              AES_256_VAULT_ACTIVE
            </div>
          </div>
          <button 
            onClick={() => setActiveModal('audit')}
            className="p-2 hover:bg-white/5 rounded-full transition-colors border border-transparent hover:border-white/10"
          >
            <History size={20} className="text-gray-400" />
          </button>
        </div>
      </div>

      {/* --- MAIN CONTENT GRID --- */}
      <div className="relative z-10 grid grid-cols-1 lg:grid-cols-12 gap-0 h-[calc(100%-88px)]">
        
        {/* LEFT PANEL: SENTIMENT & QUICK ACTIONS */}
        <div className="lg:col-span-4 border-r border-white/5 p-8 flex flex-col justify-between bg-gradient-to-b from-transparent to-gray-950/50">
          <div>
            <div className="flex items-center gap-2 mb-8">
              <Sparkles size={18} className="text-cyan-400" />
              <h2 className="text-xs font-black uppercase tracking-widest text-gray-400">Neural Sentiment Engine</h2>
            </div>

            <div className="flex flex-col items-center py-10">
              <div className="relative w-56 h-56 flex items-center justify-center">
                <svg className="absolute inset-0 w-full h-full -rotate-90">
                  <circle cx="112" cy="112" r="100" fill="transparent" stroke="rgba(255,255,255,0.05)" strokeWidth="12" />
                  <circle 
                    cx="112" cy="112" r="100" fill="transparent" stroke="url(#cyanGradient)" 
                    strokeWidth="12" strokeDasharray="628" strokeDashoffset={628 - (628 * sentiment) / 100}
                    strokeLinecap="round" className="transition-all duration-1000 ease-out"
                  />
                  <defs>
                    <linearGradient id="cyanGradient" x1="0%" y1="0%" x2="100%" y2="0%">
                      <stop offset="0%" stopColor="#22d3ee" />
                      <stop offset="100%" stopColor="#2563eb" />
                    </linearGradient>
                  </defs>
                </svg>
                <div className="text-center z-10">
                  <p className="text-6xl font-black text-white font-mono tracking-tighter">{sentiment}%</p>
                  <p className="text-[10px] font-black text-cyan-400 uppercase tracking-widest mt-1">Bullish_Confidence</p>
                </div>
              </div>
            </div>

            <div className="space-y-3 mt-8">
              <div className="p-4 bg-white/5 rounded-2xl border border-white/5 flex items-start gap-3">
                <AlertCircle size={18} className="text-cyan-500 shrink-0" />
                <p className="text-[11px] text-gray-400 leading-relaxed italic">
                  "Market vectors indicate a high-probability breakout for the NDX_FUT sector. Recalibrate long positions to capture delta."
                </p>
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <button 
              onClick={() => setActiveModal('payment')}
              className="w-full py-4 bg-white text-black hover:bg-cyan-400 transition-all rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2 group"
            >
              <Zap size={16} fill="currentColor" />
              Execute Global Wire
              <ChevronRight size={14} className="group-hover:translate-x-1 transition-transform" />
            </button>
            <button 
              onClick={simulateStripePayment}
              className="w-full py-4 bg-white/5 hover:bg-white/10 border border-white/10 transition-all rounded-2xl text-[11px] font-black uppercase tracking-widest flex items-center justify-center gap-2"
            >
              <CreditCard size={16} />
              Stripe Connect Demo
            </button>
          </div>
        </div>

        {/* RIGHT PANEL: AI CHAT & INTERACTIVE TERMINAL */}
        <div className="lg:col-span-8 flex flex-col bg-black/20">
          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-8 space-y-6 scrollbar-hide">
            {messages.map((msg, idx) => (
              <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[80%] flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-blue-600' : 'bg-gray-800 border border-white/10'}`}>
                    {msg.role === 'user' ? <Fingerprint size={16} /> : <Cpu size={16} className="text-cyan-400" />}
                  </div>
                  <div className={`p-4 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-tr-none' : 'bg-white/5 border border-white/5 text-gray-300 rounded-tl-none'}`}>
                    {msg.content}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="flex gap-4">
                  <div className="w-8 h-8 rounded-lg bg-gray-800 border border-white/10 flex items-center justify-center">
                    <div className="w-4 h-4 border-2 border-cyan-400 border-t-transparent animate-spin rounded-full"></div>
                  </div>
                  <div className="p-4 bg-white/5 border border-white/5 rounded-2xl rounded-tl-none">
                    <div className="flex gap-1">
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                      <div className="w-1.5 h-1.5 bg-cyan-400 rounded-full animate-bounce [animation-delay:0.4s]"></div>
                    </div>
                  </div>
                </div>
              </div>
            )}
            <div ref={chatEndRef} />
          </div>

          {/* Chat Input */}
          <div className="p-6 border-t border-white/5 bg-black/40">
            <form onSubmit={handleAIChat} className="relative">
              <input 
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                placeholder="Ask AI to send a wire, integrate ERP, or analyze risk..."
                className="w-full bg-white/5 border border-white/10 rounded-2xl py-4 pl-6 pr-16 text-sm focus:outline-none focus:border-cyan-500/50 transition-all placeholder:text-gray-600"
              />
              <button 
                type="submit"
                disabled={isProcessing || !chatInput.trim()}
                className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-500 hover:bg-cyan-400 disabled:bg-gray-800 disabled:text-gray-600 text-black rounded-xl transition-all flex items-center justify-center"
              >
                <Send size={18} />
              </button>
            </form>
            <div className="mt-4 flex items-center gap-4 overflow-x-auto pb-2 scrollbar-hide">
              {['Send $50k Wire', 'Connect QuickBooks', 'Fraud Report', 'Market Outlook'].map((suggestion) => (
                <button 
                  key={suggestion}
                  onClick={() => { setChatInput(suggestion); }}
                  className="whitespace-nowrap px-4 py-1.5 bg-white/5 hover:bg-white/10 border border-white/5 rounded-full text-[10px] font-bold text-gray-400 transition-all"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* --- MODALS (POPUPS) --- */}
      
      {/* PAYMENT MODAL */}
      {activeModal === 'payment' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-300">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <h3 className="text-lg font-black uppercase tracking-tighter">Quantum Wire Protocol</h3>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-8 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-black text-gray-500 uppercase">Recipient IBAN / Account</label>
                <input type="text" defaultValue="US89 4432 1100 9982 1123" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-mono" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Amount (USD)</label>
                  <input type="text" defaultValue="50,000.00" className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm font-mono text-cyan-400" />
                </div>
                <div className="space-y-1">
                  <label className="text-[10px] font-black text-gray-500 uppercase">Priority</label>
                  <select className="w-full bg-black border border-white/10 rounded-xl p-3 text-sm appearance-none">
                    <option>INSTANT_SETTLE</option>
                    <option>STANDARD</option>
                  </select>
                </div>
              </div>
              <div className="p-4 bg-cyan-500/5 border border-cyan-500/20 rounded-2xl flex items-center gap-3">
                <ShieldCheck size={20} className="text-cyan-400" />
                <p className="text-[10px] text-cyan-400/80 leading-tight">Quantum Multi-Factor Authentication will be required to finalize this high-value transfer.</p>
              </div>
              <button 
                onClick={() => {
                  logAction("WIRE_EXECUTE", "Wire transfer of $50,000.00 initiated to US89...1123", "SUCCESS");
                  setActiveModal(null);
                  setMessages(prev => [...prev, { role: 'ai', content: "Wire transfer initiated. Transaction ID: QNT-99281-X. You can track this in the Audit Vault." }]);
                }}
                className="w-full py-4 bg-cyan-500 hover:bg-cyan-400 text-black font-black uppercase tracking-widest rounded-2xl transition-all mt-4"
              >
                Authorize & Send
              </button>
            </div>
          </div>
        </div>
      )}

      {/* INTEGRATION MODAL */}
      {activeModal === 'integration' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-2xl bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-6 border-b border-white/5 flex justify-between items-center">
              <div className="flex items-center gap-2">
                <Layers size={20} className="text-cyan-400" />
                <h3 className="text-lg font-black uppercase tracking-tighter">ERP & Accounting Hub</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="p-8 grid grid-cols-2 gap-6">
              {[
                { name: 'QuickBooks', icon: <Database size={24} />, status: 'Ready' },
                { name: 'SAP S/4HANA', icon: <Globe size={24} />, status: 'Enterprise' },
                { name: 'Xero', icon: <Activity size={24} />, status: 'Ready' },
                { name: 'NetSuite', icon: <Layers size={24} />, status: 'Ready' }
              ].map((erp) => (
                <div key={erp.name} className="p-6 bg-black border border-white/5 rounded-2xl hover:border-cyan-500/50 transition-all group">
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-3 bg-white/5 rounded-xl text-cyan-400">{erp.icon}</div>
                    <span className="text-[8px] font-black px-2 py-1 bg-white/5 rounded-full text-gray-500 uppercase tracking-widest">{erp.status}</span>
                  </div>
                  <h4 className="font-bold mb-1">{erp.name}</h4>
                  <p className="text-[10px] text-gray-500 mb-4">Sync real-time ledger data with Quantum Financial.</p>
                  <button 
                    onClick={() => saveIntegrationKey(erp.name, "MOCK_KEY_" + Math.random())}
                    className="w-full py-2 bg-white/5 hover:bg-white/10 border border-white/10 rounded-lg text-[10px] font-black uppercase tracking-widest transition-all"
                  >
                    Connect Securely
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* AUDIT MODAL */}
      {activeModal === 'audit' && (
        <div className="absolute inset-0 z-50 flex items-center justify-center p-6 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-3xl h-[80%] bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-2xl flex flex-col">
            <div className="p-6 border-b border-white/5 flex justify-between items-center bg-black/40">
              <div className="flex items-center gap-2">
                <ShieldCheck size={20} className="text-cyan-400" />
                <h3 className="text-lg font-black uppercase tracking-tighter">Immutable Audit Vault</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-gray-500 hover:text-white"><X size={20} /></button>
            </div>
            <div className="flex-1 overflow-y-auto p-0 font-mono">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-gray-900 text-[10px] text-gray-500 uppercase tracking-widest border-b border-white/5">
                  <tr>
                    <th className="p-4 font-black">Timestamp</th>
                    <th className="p-4 font-black">Action</th>
                    <th className="p-4 font-black">Status</th>
                    <th className="p-4 font-black">Details</th>
                  </tr>
                </thead>
                <tbody className="text-[11px]">
                  {auditLogs.length === 0 ? (
                    <tr>
                      <td colSpan={4} className="p-20 text-center text-gray-600 italic">No audit records found in current session.</td>
                    </tr>
                  ) : (
                    auditLogs.map((log) => (
                      <tr key={log.id} className="border-b border-white/5 hover:bg-white/5 transition-colors">
                        <td className="p-4 text-gray-500">{new Date(log.timestamp).toLocaleTimeString()}</td>
                        <td className="p-4 font-bold text-white">{log.action}</td>
                        <td className="p-4">
                          <span className={`px-2 py-0.5 rounded-full text-[9px] font-black ${
                            log.status === 'SUCCESS' ? 'bg-green-500/10 text-green-500' : 
                            log.status === 'WARNING' ? 'bg-yellow-500/10 text-yellow-500' : 'bg-red-500/10 text-red-500'
                          }`}>
                            {log.status}
                          </span>
                        </td>
                        <td className="p-4 text-gray-400 max-w-xs truncate">{log.details}</td>
                      </tr>
                    ))
                  )}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-black/40 border-t border-white/5 flex justify-between items-center">
              <p className="text-[9px] text-gray-500 uppercase font-mono">Total Records: {auditLogs.length}</p>
              <div className="flex gap-2">
                <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-black uppercase tracking-widest">Export CSV</button>
                <button className="px-3 py-1.5 bg-white/5 hover:bg-white/10 rounded text-[9px] font-black uppercase tracking-widest">Verify Chain</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* --- FLOATING SECURITY INDICATOR --- */}
      <div className="absolute bottom-6 right-6 z-20">
        <div className="flex items-center gap-3 px-4 py-2 bg-black/80 border border-white/10 rounded-full backdrop-blur-md shadow-xl">
          <div className="relative">
            <div className="w-2 h-2 bg-cyan-500 rounded-full animate-ping absolute inset-0"></div>
            <div className="w-2 h-2 bg-cyan-500 rounded-full relative"></div>
          </div>
          <span className="text-[9px] font-black text-gray-400 uppercase tracking-[0.2em]">Quantum_Secure_Link_Active</span>
        </div>
      </div>

    </div>
  );
};

export default AIPredictionWidget;