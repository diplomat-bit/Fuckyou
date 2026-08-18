import React, { useState, useEffect, useRef, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import { 
  MessageSquare, 
  ShieldCheck, 
  Zap, 
  Lock, 
  Database, 
  Send, 
  X, 
  Maximize2, 
  Terminal, 
  Activity, 
  CreditCard, 
  RefreshCw,
  Key,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle2
} from 'lucide-react';

/**
 * QUANTUM FINANCIAL - ELITE BUSINESS DEMO ENGINE
 * "The Golden Ticket Experience"
 * 
 * This module serves as the AI-driven nervous system for the platform.
 * It handles:
 * 1. Generative AI interactions via Google GenAI.
 * 2. Homomorphic-simulated internal encrypted storage (QuantumVault).
 * 3. Real-time Audit Logging for all sensitive actions.
 * 4. Mock Stripe & ERP Integration logic.
 */

// --- TYPES & INTERFACES ---

interface Message {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  action?: string;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  view: string;
  status: 'SUCCESS' | 'FAILURE' | 'PENDING';
  actor: string;
  details: string;
}

interface AIWrapperProps {
  children: React.ReactNode;
  view: string;
}

// --- SECURE INTERNAL STORAGE (HOMOMORPHIC SIMULATION) ---
// This class manages data that is encrypted at rest within the app's memory space.
// Even if a ref is captured, the underlying data requires the internal session key.
class QuantumVault {
  private static instance: QuantumVault;
  private storage: Map<string, Uint8Array>;
  private sessionKey: CryptoKey | null = null;

  private constructor() {
    this.storage = new Map();
    this.initVault();
  }

  public static getInstance(): QuantumVault {
    if (!QuantumVault.instance) {
      QuantumVault.instance = new QuantumVault();
    }
    return QuantumVault.instance;
  }

  private async initVault() {
    this.sessionKey = await window.crypto.subtle.generateKey(
      { name: "AES-GCM", length: 256 },
      true,
      ["encrypt", "decrypt"]
    );
  }

  public async store(key: string, value: string) {
    if (!this.sessionKey) await this.initVault();
    const encoder = new TextEncoder();
    const data = encoder.encode(value);
    const iv = window.crypto.getRandomValues(new Uint8Array(12));
    const encrypted = await window.crypto.subtle.encrypt(
      { name: "AES-GCM", iv },
      this.sessionKey!,
      data
    );
    // Store IV + Encrypted Data
    const combined = new Uint8Array(iv.length + encrypted.byteLength);
    combined.set(iv);
    combined.set(new Uint8Array(encrypted), iv.length);
    this.storage.set(key, combined);
  }

  public async retrieve(key: string): Promise<string | null> {
    if (!this.sessionKey || !this.storage.has(key)) return null;
    const combined = this.storage.get(key)!;
    const iv = combined.slice(0, 12);
    const data = combined.slice(12);
    try {
      const decrypted = await window.crypto.subtle.decrypt(
        { name: "AES-GCM", iv },
        this.sessionKey!,
        data
      );
      return new TextDecoder().decode(decrypted);
    } catch (e) {
      return null;
    }
  }
}

// --- THE AI WRAPPER COMPONENT ---

const AIWrapper: React.FC<AIWrapperProps> = ({ children, view }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isMinimized, setIsMinimized] = useState(false);
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: `Welcome to Quantum Financial. I am your Elite AI Assistant for the ${view} module. How can I help you kick the tires on our high-performance banking engine today?`,
      timestamp: new Date()
    }
  ]);
  const [input, setInput] = useState('');
  const [isProcessing, setIsProcessing] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [showAudit, setShowAudit] = useState(false);
  const [vaultStatus, setVaultStatus] = useState('Secure');
  
  const scrollRef = useRef<HTMLDivElement>(null);
  const vault = QuantumVault.getInstance();

  // Initialize AI
  const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "DEMO_KEY_REDACTED");

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);

  const logAction = useCallback((action: string, details: string, status: 'SUCCESS' | 'FAILURE' | 'PENDING' = 'SUCCESS') => {
    const newLog: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      view,
      status,
      actor: 'System/AI_Agent',
      details
    };
    setAuditLogs(prev => [newLog, ...prev].slice(0, 50));
  }, [view]);

  const handleAISuggestion = async (prompt: string) => {
    setIsProcessing(true);
    logAction('AI_QUERY', `User requested: ${prompt}`, 'PENDING');

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-3-flash-preview" });
      
      // Context injection for the "Golden Ticket" experience
      const systemContext = `
        You are the Quantum Financial AI. 
        Tone: Elite, Professional, High-Performance.
        Context: This is a business banking demo. 
        Current View: ${view}.
        Capabilities: You can simulate Wire Transfers, ACH, Fraud Monitoring, and ERP Integrations.
        Constraint: Never mention Citibank. Refer to us as Quantum Financial.
        User Instruction: ${prompt}
      `;

      const result = await model.generateContent(systemContext);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date()
      }]);

      logAction('AI_RESPONSE', 'Content generated successfully', 'SUCCESS');

      // Logic to "Create" things based on AI response
      if (text.toLowerCase().includes('wire transfer') || text.toLowerCase().includes('create')) {
        handleSimulatedAction('WIRE_TRANSFER_INITIATED', 'AI generated a high-value wire transfer simulation.');
      }
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: Date.now().toString(),
        role: 'assistant',
        content: "I apologize, but I encountered a synchronization error with the Quantum Grid. Please try again.",
        timestamp: new Date()
      }]);
      logAction('AI_ERROR', 'Failed to generate content', 'FAILURE');
    } finally {
      setIsProcessing(false);
    }
  };

  const handleSimulatedAction = async (type: string, details: string) => {
    logAction(type, details, 'PENDING');
    // Simulate high-performance processing
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    // Store sensitive metadata in the QuantumVault
    await vault.store(`last_action_${Date.now()}`, JSON.stringify({ type, details, timestamp: new Date() }));
    
    logAction(type, details, 'SUCCESS');
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'system',
      content: `[SYSTEM] ${type} has been executed and logged to the secure audit storage.`,
      timestamp: new Date()
    }]);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date()
    };

    setMessages(prev => [...prev, userMsg]);
    handleAISuggestion(input);
    setInput('');
  };

  return (
    <div className="relative min-h-screen w-full overflow-hidden bg-slate-50">
      {/* Main Content Area */}
      <div className={`transition-all duration-500 ${isOpen && !isMinimized ? 'pr-96' : 'pr-0'}`}>
        {children}
      </div>

      {/* Floating AI Trigger */}
      {!isOpen && (
        <button
          onClick={() => setIsOpen(true)}
          className="fixed bottom-8 right-8 z-50 flex h-16 w-16 items-center justify-center rounded-full bg-slate-900 text-white shadow-2xl transition-transform hover:scale-110 active:scale-95"
          style={{ boxShadow: '0 0 20px rgba(0,0,0,0.3), 0 0 40px rgba(30,41,59,0.2)' }}
        >
          <Zap className="h-8 w-8 text-amber-400 animate-pulse" />
        </button>
      )}

      {/* AI Chat Panel - The "Engine Room" */}
      {isOpen && (
        <div 
          className={`fixed right-0 top-0 z-50 h-full bg-slate-900 text-slate-100 shadow-2xl transition-all duration-500 ease-in-out ${isMinimized ? 'translate-y-[calc(100%-60px)]' : 'translate-y-0'} w-96 flex flex-col border-l border-slate-700`}
        >
          {/* Header */}
          <div className="flex items-center justify-between border-b border-slate-700 p-4 bg-slate-800/50">
            <div className="flex items-center gap-2">
              <div className="relative">
                <Activity className="h-5 w-5 text-emerald-400" />
                <div className="absolute -top-1 -right-1 h-2 w-2 rounded-full bg-emerald-500 animate-ping" />
              </div>
              <span className="font-bold tracking-tight text-sm uppercase">Quantum Financial AI</span>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => setIsMinimized(!isMinimized)} className="p-1 hover:bg-slate-700 rounded">
                <Maximize2 className="h-4 w-4" />
              </button>
              <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-slate-700 rounded">
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Status Bar */}
          <div className="flex items-center justify-around bg-slate-950 p-2 text-[10px] font-mono text-slate-400 border-b border-slate-800">
            <div className="flex items-center gap-1">
              <ShieldCheck className="h-3 w-3 text-emerald-500" /> VAULT: {vaultStatus}
            </div>
            <div className="flex items-center gap-1">
              <Database className="h-3 w-3 text-blue-500" /> AUDIT: ACTIVE
            </div>
            <div className="flex items-center gap-1">
              <Lock className="h-3 w-3 text-amber-500" /> MFA: VERIFIED
            </div>
          </div>

          {/* Chat Area */}
          <div 
            ref={scrollRef}
            className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-thin scrollbar-thumb-slate-700"
          >
            {messages.map((m) => (
              <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-[85%] rounded-lg p-3 text-sm ${
                  m.role === 'user' 
                    ? 'bg-blue-600 text-white' 
                    : m.role === 'system'
                    ? 'bg-slate-800 border border-slate-700 text-emerald-400 font-mono text-xs'
                    : 'bg-slate-800 text-slate-200 border border-slate-700'
                }`}>
                  {m.role === 'assistant' && <div className="mb-1 text-[10px] font-bold text-slate-500 uppercase tracking-widest">Quantum AI</div>}
                  {m.content}
                  <div className="mt-1 text-[9px] opacity-50 text-right">
                    {m.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                </div>
              </div>
            ))}
            {isProcessing && (
              <div className="flex justify-start">
                <div className="bg-slate-800 rounded-lg p-3 flex items-center gap-2">
                  <RefreshCw className="h-4 w-4 animate-spin text-blue-400" />
                  <span className="text-xs text-slate-400 italic">Synthesizing financial data...</span>
                </div>
              </div>
            )}
          </div>

          {/* Quick Actions */}
          {!isMinimized && (
            <div className="p-2 grid grid-cols-2 gap-2 bg-slate-800/30 border-t border-slate-800">
              <button 
                onClick={() => handleSimulatedAction('WIRE_INIT', 'Manual wire transfer simulation')}
                className="flex items-center justify-center gap-1 p-2 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold transition-colors"
              >
                <Send className="h-3 w-3" /> INITIATE WIRE
              </button>
              <button 
                onClick={() => handleSimulatedAction('FRAUD_CHECK', 'Real-time fraud scan initiated')}
                className="flex items-center justify-center gap-1 p-2 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold transition-colors"
              >
                <ShieldCheck className="h-3 w-3" /> FRAUD SCAN
              </button>
              <button 
                onClick={() => setShowAudit(!showAudit)}
                className="flex items-center justify-center gap-1 p-2 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold transition-colors"
              >
                <Terminal className="h-3 w-3" /> {showAudit ? 'HIDE LOGS' : 'VIEW AUDIT'}
              </button>
              <button 
                onClick={() => handleSimulatedAction('ERP_SYNC', 'Syncing with external ERP systems')}
                className="flex items-center justify-center gap-1 p-2 rounded bg-slate-700 hover:bg-slate-600 text-[10px] font-bold transition-colors"
              >
                <RefreshCw className="h-3 w-3" /> SYNC ERP
              </button>
            </div>
          )}

          {/* Input Area */}
          <form onSubmit={handleSubmit} className="p-4 bg-slate-900 border-t border-slate-800">
            <div className="relative">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask Quantum AI to perform an action..."
                className="w-full bg-slate-800 border border-slate-700 rounded-full py-2 pl-4 pr-10 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
              />
              <button 
                type="submit"
                disabled={isProcessing}
                className="absolute right-2 top-1/2 -translate-y-1/2 p-1 text-blue-400 hover:text-blue-300 disabled:opacity-50"
              >
                <Send className="h-5 w-5" />
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Audit Log Overlay */}
      {showAudit && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
          <div className="w-full max-w-4xl h-[80vh] bg-slate-900 border border-slate-700 rounded-xl shadow-2xl flex flex-col overflow-hidden">
            <div className="p-4 border-b border-slate-700 flex justify-between items-center bg-slate-800">
              <div className="flex items-center gap-2">
                <Terminal className="h-5 w-5 text-blue-400" />
                <h2 className="font-bold text-white uppercase tracking-widest text-sm">Secure Audit Storage - Quantum Financial</h2>
              </div>
              <button onClick={() => setShowAudit(false)} className="text-slate-400 hover:text-white">
                <X className="h-6 w-6" />
              </button>
            </div>
            <div className="flex-1 overflow-auto p-0 font-mono text-[11px]">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-slate-950 text-slate-400 uppercase">
                  <tr>
                    <th className="p-3 border-b border-slate-800">Timestamp</th>
                    <th className="p-3 border-b border-slate-800">Action</th>
                    <th className="p-3 border-b border-slate-800">View</th>
                    <th className="p-3 border-b border-slate-800">Status</th>
                    <th className="p-3 border-b border-slate-800">Details</th>
                  </tr>
                </thead>
                <tbody>
                  {auditLogs.map((log) => (
                    <tr key={log.id} className="border-b border-slate-800 hover:bg-slate-800/50 transition-colors">
                      <td className="p-3 text-slate-500">{log.timestamp}</td>
                      <td className="p-3 font-bold text-blue-400">{log.action}</td>
                      <td className="p-3 text-slate-300">{log.view}</td>
                      <td className="p-3">
                        <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold ${
                          log.status === 'SUCCESS' ? 'bg-emerald-500/10 text-emerald-500' :
                          log.status === 'PENDING' ? 'bg-amber-500/10 text-amber-500' :
                          'bg-red-500/10 text-red-500'
                        }`}>
                          {log.status}
                        </span>
                      </td>
                      <td className="p-3 text-slate-400 italic">{log.details}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-4 bg-slate-950 border-t border-slate-800 flex justify-between items-center">
              <div className="text-[10px] text-slate-500">
                TOTAL ENTRIES: {auditLogs.length} | ENCRYPTION: AES-256-GCM | STORAGE: INTERNAL_QUANTUM_VAULT
              </div>
              <button 
                onClick={() => setAuditLogs([])}
                className="text-[10px] font-bold text-red-400 hover:text-red-300 uppercase"
              >
                Clear Session Logs
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Stripe Simulation Modal */}
      <StripeSimulationModal />
    </div>
  );
};

// --- SUB-COMPONENTS ---

const StripeSimulationModal: React.FC = () => {
  const [isVisible, setIsVisible] = useState(false);
  const [step, setStep] = useState(1);

  // Listen for custom events to trigger the Stripe flow
  useEffect(() => {
    const handleTrigger = () => setIsVisible(true);
    window.addEventListener('trigger-stripe-demo', handleTrigger);
    return () => window.removeEventListener('trigger-stripe-demo', handleTrigger);
  }, []);

  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/90 backdrop-blur-md">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden text-slate-900">
        <div className="bg-indigo-600 p-6 text-white flex justify-between items-center">
          <div className="flex items-center gap-2">
            <CreditCard className="h-6 w-6" />
            <span className="font-bold text-lg">Quantum Pay (Stripe Engine)</span>
          </div>
          <button onClick={() => setIsVisible(false)}><X className="h-5 w-5" /></button>
        </div>
        
        <div className="p-8">
          {step === 1 && (
            <div className="space-y-6">
              <div className="text-center">
                <h3 className="text-xl font-bold">Secure Checkout</h3>
                <p className="text-slate-500 text-sm">Test drive our global payment rails.</p>
              </div>
              <div className="space-y-4">
                <div className="p-4 border rounded-xl bg-slate-50">
                  <div className="text-xs font-bold text-slate-400 uppercase mb-1">Amount</div>
                  <div className="text-2xl font-mono font-bold">$50,000.00 USD</div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-slate-600 uppercase">Card Details</label>
                  <div className="p-3 border rounded-lg flex items-center gap-3 bg-white shadow-sm">
                    <div className="h-6 w-10 bg-slate-200 rounded flex items-center justify-center text-[8px] font-bold">VISA</div>
                    <input disabled value="**** **** **** 4242" className="flex-1 bg-transparent outline-none text-sm" />
                    <Lock className="h-4 w-4 text-slate-300" />
                  </div>
                </div>
              </div>
              <button 
                onClick={() => setStep(2)}
                className="w-full py-4 bg-indigo-600 text-white rounded-xl font-bold hover:bg-indigo-700 transition-all shadow-lg shadow-indigo-200"
              >
                Authorize Payment
              </button>
            </div>
          )}

          {step === 2 && (
            <div className="py-12 flex flex-col items-center justify-center space-y-4">
              <div className="h-16 w-16 rounded-full bg-emerald-100 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-emerald-500 animate-bounce" />
              </div>
              <h3 className="text-2xl font-bold">Payment Successful</h3>
              <p className="text-slate-500 text-center text-sm px-4">
                The transaction has been processed via Quantum Financial's high-performance gateway.
              </p>
              <div className="w-full p-4 bg-slate-50 rounded-lg font-mono text-[10px] text-slate-400">
                TX_ID: QF_STRIPE_{Math.random().toString(36).toUpperCase().substr(2, 12)}<br/>
                STATUS: SETTLED<br/>
                NETWORK: STRIPE_CONNECT_V3
              </div>
              <button 
                onClick={() => { setIsVisible(false); setStep(1); }}
                className="w-full py-3 border-2 border-slate-200 rounded-xl font-bold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Return to Dashboard
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default AIWrapper;