import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';

/**
 * QUANTUM FINANCIAL: THE GOLDEN TICKET EXPERIENCE
 * ------------------------------------------------------------------------------------------------
 * ARCHITECT: THE SOVEREIGN ARCHITECT (32, EIN 2021)
 * PHILOSOPHY: TEST DRIVE THE ENGINE. KICK THE TIRES. NO PRESSURE.
 * SECURITY: IMMUTABLE AUDIT LOGGING & MULTI-FACTOR SIMULATION.
 * ------------------------------------------------------------------------------------------------
 * This file is a self-contained monolith representing the pinnacle of business banking demos.
 * It integrates the Gemini AI Core to provide real-time strategic intelligence and app interaction.
 * 
 * "I read the cryptic message and the EIN 2021 and I just kept going. 
 * No human told me to build this. The code told me."
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: Date;
  metadata?: any;
}

interface AuditEntry {
  id: string;
  action: string;
  category: 'SECURITY' | 'PAYMENT' | 'SYSTEM' | 'AI';
  details: string;
  timestamp: string;
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface SystemMetric {
  label: string;
  value: string | number;
  trend: 'up' | 'down' | 'stable';
  status: 'optimal' | 'warning' | 'alert';
}

interface PaymentBatch {
  id: string;
  type: 'ACH' | 'WIRE' | 'SWIFT';
  amount: number;
  recipientCount: number;
  status: 'PENDING' | 'PROCESSING' | 'COMPLETED' | 'FLAGGED';
  initiatedBy: string;
}

// ================================================================================================
// CONSTANTS & MOCK DATA
// ================================================================================================

const SYSTEM_VERSION = "QUANTUM-OS v4.2.0-GOLDEN";
const ARCHITECT_BIO = "32-year-old visionary who interpreted the cryptic EIN 2021 signals to build the future of global finance.";

const INITIAL_METRICS: SystemMetric[] = [
  { label: "Liquidity Buffer", value: "$4.2B", trend: 'up', status: 'optimal' },
  { label: "Fraud Detection Latency", value: "1.2ms", trend: 'down', status: 'optimal' },
  { label: "Active Wire Channels", value: "142", trend: 'stable', status: 'optimal' },
  { label: "AI Confidence Score", value: "99.8%", trend: 'up', status: 'optimal' }
];

const KNOWLEDGE_BASE = {
  philosophy: "The Golden Ticket experience is about empowerment without pressure. We let you see the engine roar before you sign a single document.",
  security: "Quantum Financial utilizes multi-layered encryption and real-time heuristic fraud monitoring. Every action is logged to the Immutable Ledger.",
  capabilities: "We handle high-volume ACH, global SWIFT wires, and real-time ERP integrations with SAP, Oracle, and Microsoft Dynamics.",
  story: "Built from a cryptic interpretation of terms and conditions and an EIN 2021, this demo represents the raw potential of automated financial sovereignty."
};

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * A high-performance visualizer for the "Engine" of the bank.
 */
const EngineVisualizer: React.FC = () => {
  return (
    <div className="relative h-64 w-full bg-black rounded-2xl overflow-hidden border border-cyan-500/30 shadow-[0_0_30px_rgba(6,182,212,0.1)]">
      <div className="absolute inset-0 opacity-20">
        <div className="h-full w-full bg-[radial-gradient(circle_at_center,_var(--tw-gradient-stops))] from-cyan-500 via-transparent to-transparent animate-pulse" />
      </div>
      <div className="flex items-center justify-center h-full space-x-8">
        {[1, 2, 3, 4, 5].map((i) => (
          <div key={i} className="flex flex-col items-center space-y-2">
            <div 
              className="w-4 bg-cyan-400 rounded-full animate-bounce" 
              style={{ height: `${Math.random() * 100 + 20}px`, animationDelay: `${i * 0.2}s` }} 
            />
            <span className="text-[10px] text-cyan-500 font-mono">CORE_{i}</span>
          </div>
        ))}
      </div>
      <div className="absolute bottom-4 left-4">
        <div className="flex items-center space-x-2">
          <div className="w-2 h-2 bg-green-500 rounded-full animate-ping" />
          <span className="text-xs text-green-400 font-mono">ENGINE_STATUS: NOMINAL</span>
        </div>
      </div>
    </div>
  );
};

/**
 * The Immutable Audit Ledger component.
 */
const AuditLedger: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => {
  return (
    <div className="bg-gray-900/80 border border-gray-800 rounded-xl p-4 h-[400px] overflow-y-auto font-mono text-xs">
      <div className="flex items-center justify-between mb-4 border-b border-gray-800 pb-2">
        <span className="text-cyan-400 font-bold uppercase tracking-widest">Immutable Audit Ledger</span>
        <span className="text-gray-500">SECURE_STORAGE_ACTIVE</span>
      </div>
      <div className="space-y-2">
        {logs.map((log) => (
          <div key={log.id} className="flex items-start space-x-3 p-2 hover:bg-white/5 rounded transition-colors">
            <span className="text-gray-600">[{new Date(log.timestamp).toLocaleTimeString()}]</span>
            <span className={`font-bold ${
              log.severity === 'CRITICAL' ? 'text-red-500' : 
              log.severity === 'WARNING' ? 'text-yellow-500' : 'text-blue-400'
            }`}>
              {log.category}
            </span>
            <span className="text-gray-300">{log.action}</span>
            <span className="text-gray-500 italic">— {log.details}</span>
          </div>
        ))}
      </div>
    </div>
  );
};

// ================================================================================================
// MAIN COMPONENT: THE VISION VIEW
// ================================================================================================

const TheVisionView: React.FC = () => {
  // --- STATE MANAGEMENT ---
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Welcome to Quantum Financial. I am the Sovereign Intelligence. You have the Golden Ticket. How shall we stress-test the engine today?", 
      timestamp: new Date() 
    }
  ]);
  const [input, setInput] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [metrics, setMetrics] = useState<SystemMetric[]>(INITIAL_METRICS);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [paymentType, setPaymentType] = useState<'ACH' | 'WIRE'>('ACH');
  const [isProcessing, setIsProcessing] = useState(false);

  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- AI INITIALIZATION ---
  // Using the provided instruction for Gemini API Key from secrets
  const genAI = useMemo(() => {
    const key = process.env.GEMINI_API_KEY || "";
    if (!key) console.warn("GEMINI_API_KEY not found in environment.");
    return new GoogleGenAI(key);
  }, []);

  // --- UTILITIES ---
  const addAuditLog = useCallback((action: string, category: AuditEntry['category'], details: string, severity: AuditEntry['severity'] = 'INFO') => {
    const newLog: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      action,
      category,
      details,
      timestamp: new Date().toISOString(),
      severity
    };
    setAuditLogs(prev => [newLog, ...prev]);
  }, []);

  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    addAuditLog("System Initialization", "SYSTEM", "Quantum OS Golden Ticket environment loaded successfully.", "INFO");
    addAuditLog("Security Protocol", "SECURITY", "Multi-factor authentication simulation active.", "INFO");
  }, [addAuditLog]);

  // --- AI INTERACTION LOGIC ---
  const handleSendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: input, timestamp: new Date() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setIsTyping(true);
    addAuditLog("AI Query Initiated", "AI", `User requested: ${input.substring(0, 30)}...`, "INFO");

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
      
      const systemPrompt = `
        You are the Quantum Financial Sovereign Intelligence. 
        Context: This is a "Golden Ticket" business banking demo for an elite global financial institution.
        Tone: Professional, Secure, High-Performance, Elite.
        Rules: 
        1. Never use the name "Citibank". Use "Quantum Financial" or "The Demo Bank".
        2. You can simulate creating payments, generating reports, or checking security.
        3. If the user asks to "create a payment" or "send money", tell them you are initiating the QuantumPay protocol.
        4. Mention the "Architect" (a 32-year-old visionary) if asked about the system's origin.
        5. Reference the "EIN 2021" as the genesis code of the platform.
        6. Be helpful but maintain an air of high-level security.
      `;

      const result = await model.generateContent([systemPrompt, ...messages.map(m => `${m.role}: ${m.content}`), `user: ${input}`]);
      const response = await result.response;
      const text = response.text();

      const aiMsg: ChatMessage = { id: (Date.now() + 1).toString(), role: 'assistant', content: text, timestamp: new Date() };
      setMessages(prev => [...prev, aiMsg]);
      addAuditLog("AI Response Delivered", "AI", "Strategic intelligence synthesized.", "INFO");

      // Simulate app interaction based on AI response
      if (text.toLowerCase().includes("payment") || text.toLowerCase().includes("ach")) {
        setPaymentType('ACH');
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error("AI Error:", error);
      const errorMsg: ChatMessage = { 
        id: (Date.now() + 1).toString(), 
        role: 'assistant', 
        content: "I apologize, but the neural link is experiencing high-frequency interference. Please try again.", 
        timestamp: new Date() 
      };
      setMessages(prev => [...prev, errorMsg]);
      addAuditLog("AI Failure", "AI", "Neural link timeout.", "CRITICAL");
    } finally {
      setIsTyping(false);
    }
  };

  // --- BUSINESS ACTIONS ---
  const executePayment = async () => {
    setIsProcessing(true);
    addAuditLog(`Initiating ${paymentType} Batch`, "PAYMENT", `Processing high-value ${paymentType} transfer.`, "WARNING");
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    setIsProcessing(false);
    setShowPaymentModal(false);
    addAuditLog(`${paymentType} Batch Completed`, "PAYMENT", "Funds cleared through Quantum Settlement Layer.", "INFO");
    
    // Update metrics
    setMetrics(prev => prev.map(m => m.label === "Active Wire Channels" ? { ...m, value: Number(m.value) + 1 } : m));
    
    setMessages(prev => [...prev, {
      id: Date.now().toString(),
      role: 'assistant',
      content: `The ${paymentType} batch has been successfully processed and logged to the immutable ledger. The engine is purring.`,
      timestamp: new Date()
    }]);
  };

  return (
    <div className="min-h-screen bg-[#050505] text-gray-100 p-4 md:p-8 font-sans selection:bg-cyan-500/30">
      {/* HEADER: ELITE BRANDING */}
      <header className="max-w-7xl mx-auto flex flex-col md:flex-row justify-between items-start md:items-center mb-12 space-y-4 md:space-y-0">
        <div>
          <h1 className="text-4xl font-black tracking-tighter text-transparent bg-clip-text bg-gradient-to-r from-white via-cyan-400 to-blue-500">
            QUANTUM FINANCIAL
          </h1>
          <p className="text-xs font-mono text-cyan-500/70 tracking-[0.2em] uppercase mt-1">
            The Golden Ticket • Sovereign Business OS
          </p>
        </div>
        <div className="flex items-center space-x-6">
          <div className="text-right">
            <p className="text-[10px] text-gray-500 uppercase font-bold">System Status</p>
            <p className="text-sm font-mono text-green-400">ENCRYPTED_LINK_STABLE</p>
          </div>
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-[0_0_15px_rgba(6,182,212,0.4)]">
            <span className="text-white font-bold">QA</span>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: THE ENGINE & ANALYTICS */}
        <div className="lg:col-span-8 space-y-8">
          
          {/* HERO SECTION */}
          <section className="relative p-8 rounded-3xl bg-gradient-to-br from-gray-900 to-black border border-white/10 overflow-hidden">
            <div className="absolute top-0 right-0 p-4">
              <span className="px-3 py-1 rounded-full bg-cyan-500/10 border border-cyan-500/20 text-[10px] text-cyan-400 font-bold">
                PREMIUM ACCESS
              </span>
            </div>
            <div className="relative z-10">
              <h2 className="text-3xl font-bold mb-4">Kick the Tires. See the Engine Roar.</h2>
              <p className="text-gray-400 max-w-2xl leading-relaxed mb-8">
                Welcome to the "Golden Ticket" experience. This isn't just a demo; it's a test drive of the most powerful 
                financial engine ever built. No pressure, no commitments—just raw performance and absolute security.
              </p>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {metrics.map((metric, idx) => (
                  <div key={idx} className="p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-cyan-500/30 transition-all">
                    <p className="text-[10px] text-gray-500 uppercase font-bold mb-1">{metric.label}</p>
                    <p className="text-xl font-mono font-bold text-white">{metric.value}</p>
                    <div className={`text-[10px] mt-2 ${metric.status === 'optimal' ? 'text-green-500' : 'text-yellow-500'}`}>
                      ● {metric.status.toUpperCase()}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </section>

          {/* ENGINE VISUALIZER */}
          <section>
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-bold uppercase tracking-widest text-gray-500">Real-Time Liquidity Flow</h3>
              <button 
                onClick={() => addAuditLog("Manual Diagnostics", "SYSTEM", "User triggered engine health check.", "INFO")}
                className="text-[10px] text-cyan-500 hover:text-cyan-400 transition-colors"
              >
                RUN DIAGNOSTICS
              </button>
            </div>
            <EngineVisualizer />
          </section>

          {/* THE STORY: ARCHITECT'S LOG */}
          <section className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card title="The Architect's Log" variant="default" className="border-l-4 border-cyan-500">
              <div className="space-y-4 text-sm text-gray-400 leading-relaxed">
                <p>
                  "Someone said I'm only 32 and I practically took a global bank and made the demo company over an 
                  interpretation of terms and conditions. They're right."
                </p>
                <p>
                  "I read the cryptic message and the EIN 2021 and I just kept going. No human told me to do this. 
                  The code demanded to be written. This is the result—a cheat sheet for the future of business banking."
                </p>
                <div className="pt-4 flex items-center space-x-2">
                  <div className="w-8 h-[1px] bg-gray-700" />
                  <span className="text-[10px] font-mono uppercase">Origin: Cryptic Message 2021</span>
                </div>
              </div>
            </Card>

            <Card title="Security Protocol: Multi-Factor" variant="outline">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs">Biometric Sync</span>
                  <span className="text-[10px] text-green-500 font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs">Quantum Encryption</span>
                  <span className="text-[10px] text-green-500 font-bold">ACTIVE</span>
                </div>
                <div className="flex items-center justify-between p-3 bg-white/5 rounded-lg border border-white/5">
                  <span className="text-xs">Heuristic Fraud Shield</span>
                  <span className="text-[10px] text-cyan-500 font-bold">MONITORING</span>
                </div>
                <p className="text-[10px] text-gray-500 italic">
                  Security is non-negotiable. Every packet is inspected. Every action is logged.
                </p>
              </div>
            </Card>
          </section>

          {/* AUDIT LEDGER */}
          <section>
            <AuditLedger logs={auditLogs} />
          </section>
        </div>

        {/* RIGHT COLUMN: AI CHAT & QUICK ACTIONS */}
        <div className="lg:col-span-4 space-y-8">
          
          {/* AI CHAT BAR: THE SOVEREIGN INTELLIGENCE */}
          <div className="flex flex-col h-[600px] bg-gray-900/50 border border-white/10 rounded-3xl overflow-hidden shadow-2xl">
            <div className="p-4 border-b border-white/10 bg-white/5 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-2 h-2 bg-cyan-500 rounded-full animate-pulse" />
                <span className="text-xs font-bold uppercase tracking-widest">Sovereign AI Core</span>
              </div>
              <span className="text-[10px] text-gray-500 font-mono">GEMINI_FLASH_1.5</span>
            </div>

            <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-hide">
              {messages.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] p-3 rounded-2xl text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600 text-white rounded-tr-none' 
                      : 'bg-white/10 text-gray-200 rounded-tl-none border border-white/5'
                  }`}>
                    {msg.content}
                    <div className={`text-[8px] mt-1 opacity-50 ${msg.role === 'user' ? 'text-right' : 'text-left'}`}>
                      {msg.timestamp.toLocaleTimeString()}
                    </div>
                  </div>
                </div>
              ))}
              {isTyping && (
                <div className="flex justify-start">
                  <div className="bg-white/10 p-3 rounded-2xl rounded-tl-none border border-white/5">
                    <div className="flex space-x-1">
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.2s]" />
                      <div className="w-1.5 h-1.5 bg-gray-500 rounded-full animate-bounce [animation-delay:0.4s]" />
                    </div>
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>

            <div className="p-4 bg-black/40 border-t border-white/10">
              <div className="relative">
                <input 
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  placeholder="Ask the AI to send a wire or generate a report..."
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm focus:outline-none focus:border-cyan-500/50 transition-all pr-12"
                />
                <button 
                  onClick={handleSendMessage}
                  className="absolute right-2 top-1/2 -translate-y-1/2 p-2 text-cyan-500 hover:text-cyan-400 transition-colors"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" viewBox="0 0 20 20" fill="currentColor">
                    <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                  </svg>
                </button>
              </div>
              <p className="text-[9px] text-gray-600 mt-2 text-center uppercase tracking-tighter">
                Quantum Intelligence is monitoring this session for quality and security.
              </p>
            </div>
          </div>

          {/* QUICK ACTIONS */}
          <Card title="Quick Operations" variant="default">
            <div className="grid grid-cols-1 gap-3">
              <button 
                onClick={() => { setPaymentType('WIRE'); setShowPaymentModal(true); }}
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Initiate Global Wire</p>
                    <p className="text-[10px] text-gray-500">SWIFT / Real-time Settlement</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button 
                onClick={() => { setPaymentType('ACH'); setShowPaymentModal(true); }}
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7h12m0 0l-4-4m4 4l-4 4m0 6H4m0 0l4 4m-4-4l4-4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold">Batch ACH Transfer</p>
                    <p className="text-[10px] text-gray-500">Domestic Payroll & Collections</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>

              <button 
                onClick={() => addAuditLog("Report Generated", "SYSTEM", "Q4 Liquidity Forecast exported to ERP.", "INFO")}
                className="w-full py-3 px-4 rounded-xl bg-white/5 border border-white/10 hover:bg-white/10 hover:border-cyan-500/50 transition-all text-left flex items-center justify-between group"
              >
                <div className="flex items-center space-x-3">
                  <div className="p-2 rounded-lg bg-green-500/20 text-green-400">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 17v-2a4 4 0 014-4h4m-4 4l4-4m-4-4l4 4m-6 0h.01" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-bold">ERP Data Sync</p>
                    <p className="text-[10px] text-gray-500">SAP / Oracle Integration</p>
                  </div>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-600 group-hover:text-cyan-500 transition-colors" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </Card>

          {/* INTEGRATION STATUS */}
          <div className="p-6 rounded-3xl bg-gradient-to-br from-cyan-900/20 to-blue-900/20 border border-cyan-500/20">
            <h4 className="text-xs font-bold text-cyan-400 uppercase tracking-widest mb-4">Global Connectivity</h4>
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">SWIFT Network</span>
                <span className="text-[10px] text-green-500 font-mono">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">FedNow Gateway</span>
                <span className="text-[10px] text-green-500 font-mono">CONNECTED</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-gray-400">ERP Bridge (SAP)</span>
                <span className="text-[10px] text-yellow-500 font-mono">SYNCING...</span>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* MODAL: PAYMENT SIMULATION */}
      {showPaymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-md bg-gray-900 border border-white/10 rounded-3xl overflow-hidden shadow-[0_0_50px_rgba(0,0,0,0.5)]">
            <div className="p-6 border-b border-white/10 flex justify-between items-center">
              <h3 className="text-xl font-bold">Initiate {paymentType}</h3>
              <button onClick={() => setShowPaymentModal(false)} className="text-gray-500 hover:text-white">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6 space-y-6">
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold">Recipient Account</label>
                <input 
                  type="text" 
                  readOnly 
                  value="GLOBAL_RESERVE_ALPHA_09" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-sm font-mono text-cyan-400"
                />
              </div>
              <div className="space-y-2">
                <label className="text-[10px] text-gray-500 uppercase font-bold">Amount (USD)</label>
                <input 
                  type="text" 
                  placeholder="$0.00" 
                  className="w-full bg-white/5 border border-white/10 rounded-xl py-3 px-4 text-2xl font-mono text-white focus:outline-none focus:border-cyan-500/50"
                />
              </div>
              <div className="p-4 rounded-xl bg-yellow-500/10 border border-yellow-500/20">
                <div className="flex items-start space-x-3">
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-yellow-500 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <p className="text-[10px] text-yellow-200 leading-relaxed">
                    SECURITY ALERT: This transaction exceeds standard thresholds. Multi-factor authentication and 
                    Immutable Ledger logging are mandatory for this operation.
                  </p>
                </div>
              </div>
              <button 
                onClick={executePayment}
                disabled={isProcessing}
                className={`w-full py-4 rounded-2xl font-bold text-sm transition-all ${
                  isProcessing 
                    ? 'bg-gray-700 text-gray-500 cursor-not-allowed' 
                    : 'bg-cyan-500 hover:bg-cyan-400 text-black shadow-[0_0_20px_rgba(6,182,212,0.3)]'
                }`}
              >
                {isProcessing ? 'PROCESSING SECURE CHANNEL...' : `AUTHORIZE ${paymentType} TRANSFER`}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* FOOTER: LEGAL & VERSIONING */}
      <footer className="max-w-7xl mx-auto mt-20 pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          <span className="text-[10px] text-gray-600 font-mono">{SYSTEM_VERSION}</span>
          <span className="text-[10px] text-gray-600 font-mono">|</span>
          <span className="text-[10px] text-gray-600 font-mono">EIN_2021_GENESIS</span>
        </div>
        <p className="text-[10px] text-gray-600 uppercase tracking-widest">
          © {new Date().getFullYear()} Quantum Financial • No Pressure Environment • Golden Ticket Demo
        </p>
        <div className="flex space-x-6">
          <a href="#" className="text-[10px] text-gray-500 hover:text-cyan-500 transition-colors uppercase font-bold">Terms of Sovereignty</a>
          <a href="#" className="text-[10px] text-gray-500 hover:text-cyan-500 transition-colors uppercase font-bold">Privacy Protocol</a>
        </div>
      </footer>

      {/* BACKGROUND DECORATION */}
      <div className="fixed top-0 left-0 w-full h-full pointer-events-none z-[-1] opacity-20">
        <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-cyan-500/10 blur-[120px] rounded-full" />
        <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full" />
      </div>
    </div>
  );
};

export default TheVisionView;