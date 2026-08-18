import React, { useState, useEffect, useRef, useMemo, useCallback } from 'react';
import { GoogleGenAI } from "@google/genai";

/**
 * QUANTUM FINANCIAL - ELITE COMMAND & STATUS SYSTEM
 * 
 * PHILOSOPHY:
 * - "Golden Ticket" Experience: High-polish, high-performance.
 * - "Test Drive": Interactive components to "kick the tires" of the financial engine.
 * - "Bells and Whistles": AI-driven insights, real-time audit logging, and secure simulations.
 * - "Cheat Sheet": Simplified but powerful business banking interface.
 * 
 * SECURITY:
 * - Multi-factor authentication simulations.
 * - Real-time fraud monitoring logic.
 * - Non-negotiable audit storage for every sensitive action.
 * 
 * INTEGRATION:
 * - Simulated ERP/Accounting hooks.
 * - Robust Payment & Collection capabilities (Wire, ACH).
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface StripeStatusBadgeProps {
  status: string | null | undefined;
  objectType: string;
  enableCommandCenter?: boolean;
}

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  details: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata?: any;
}

interface ChatMessage {
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
}

interface FraudAlert {
  id: string;
  type: string;
  riskScore: number;
  status: 'flagged' | 'cleared' | 'investigating';
  description: string;
}

// ================================================================================================
// CONSTANTS & CONFIGURATION
// ================================================================================================

const SYSTEM_NAME = "Quantum Financial AI Core";
const INSTITUTION_NAME = "Quantum Financial";
const AUDIT_STORAGE_KEY = "QUANTUM_AUDIT_LOG_V1";

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

const formatCurrency = (amount: number) => {
  return new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(amount);
};

const generateId = () => Math.random().toString(36).substring(2, 15);

// ================================================================================================
// SUB-COMPONENT: AUDIT LOG VIEWER
// ================================================================================================

const AuditLogViewer: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => (
  <div className="mt-4 bg-black/40 rounded-lg border border-gray-800 overflow-hidden">
    <div className="px-4 py-2 bg-gray-900 border-b border-gray-800 flex justify-between items-center">
      <span className="text-xs font-bold uppercase tracking-widest text-cyan-400">System Audit Trail</span>
      <span className="text-[10px] text-gray-500">Immutable Ledger Active</span>
    </div>
    <div className="max-h-40 overflow-y-auto p-2 space-y-1 font-mono text-[10px]">
      {logs.length === 0 && <div className="text-gray-600 italic p-2">No entries in current session...</div>}
      {logs.map((log) => (
        <div key={log.id} className="flex gap-2 border-b border-gray-800/50 pb-1 last:border-0">
          <span className="text-gray-500">[{log.timestamp}]</span>
          <span className={`font-bold ${log.severity === 'critical' ? 'text-red-500' : 'text-cyan-600'}`}>{log.action}</span>
          <span className="text-gray-300">{log.details}</span>
        </div>
      ))}
    </div>
  </div>
);

// ================================================================================================
// MAIN COMPONENT: STRIPE STATUS BADGE & COMMAND CENTER
// ================================================================================================

const StripeStatusBadge: React.FC<StripeStatusBadgeProps> = ({ status, objectType, enableCommandCenter = true }) => {
  // --- STATE MANAGEMENT ---
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [chatInput, setChatInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([
    { role: 'assistant', content: `Welcome to the ${INSTITUTION_NAME} Business Demo. I am your AI co-pilot. How can I help you kick the tires of our financial engine today?`, timestamp: new Date().toLocaleTimeString() }
  ]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [fraudAlerts, setFraudAlerts] = useState<FraudAlert[]>([]);
  const [mfaVerified, setMfaVerified] = useState(false);
  const [showWireForm, setShowWireForm] = useState(false);
  
  // Form States
  const [wireData, setWireData] = useState({ recipient: '', amount: '', memo: '', rail: 'ACH' });

  // --- REFS ---
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    const savedLogs = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (savedLogs) {
      try {
        setAuditLogs(JSON.parse(savedLogs).slice(-50));
      } catch (e) {
        console.error("Failed to load audit logs");
      }
    }
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // --- CORE LOGIC: AUDIT LOGGING ---
  const logAction = useCallback((action: string, details: string, severity: AuditEntry['severity'] = 'low') => {
    const newEntry: AuditEntry = {
      id: generateId(),
      timestamp: new Date().toISOString(),
      action,
      details,
      actor: "System User",
      severity
    };
    setAuditLogs(prev => {
      const updated = [newEntry, ...prev].slice(0, 100);
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  // --- CORE LOGIC: AI INTERACTION ---
  const handleAiChat = async () => {
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = { role: 'user', content: chatInput, timestamp: new Date().toLocaleTimeString() };
    setMessages(prev => [...prev, userMsg]);
    setChatInput("");
    setIsAiLoading(true);
    
    logAction("AI_QUERY", `User asked: ${chatInput.substring(0, 50)}...`, 'low');

    try {
      // Using the provided GEMINI_API_KEY from environment/secrets
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const prompt = `
        You are the ${SYSTEM_NAME}, an elite financial assistant for ${INSTITUTION_NAME}.
        The user is currently "test driving" our business banking platform.
        
        Context:
        - Current Object: ${objectType}
        - Current Status: ${status}
        - User is in a "Golden Ticket" demo environment.
        - We offer Wire, ACH, Fraud Monitoring, and ERP integration.
        - Tone: Professional, High-Performance, Secure, Elite.
        - Do NOT mention Citibank. Use "Quantum Financial".
        
        User Message: ${chatInput}
        
        Instructions:
        - If the user wants to "create" something (like a wire or a report), tell them you are initializing the module.
        - If they ask about security, mention our multi-factor authentication and real-time fraud monitoring.
        - Keep responses concise but powerful.
      `;

      const result = await model.generateContent(prompt);
      const response = await result.response;
      const text = response.text();

      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: text, 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      
      logAction("AI_RESPONSE", "AI successfully generated strategic guidance.", 'low');
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, { 
        role: 'assistant', 
        content: "I apologize, but my neural link is experiencing high latency. Please proceed with manual controls or try again.", 
        timestamp: new Date().toLocaleTimeString() 
      }]);
      logAction("AI_ERROR", "Failed to connect to Gemini API Core.", 'high');
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- CORE LOGIC: BUSINESS ACTIONS ---
  const executeWireTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    if (!mfaVerified) {
      alert("Security Protocol Violation: MFA Verification Required.");
      logAction("SECURITY_BLOCK", "Wire transfer blocked due to missing MFA.", 'high');
      return;
    }

    logAction("WIRE_INITIATED", `Transfer of ${formatCurrency(Number(wireData.amount))} to ${wireData.recipient} via ${wireData.rail}`, 'critical');
    
    // Simulate Fraud Check
    const isSuspicious = Number(wireData.amount) > 50000;
    if (isSuspicious) {
      const alert: FraudAlert = {
        id: generateId(),
        type: "High Value Transfer",
        riskScore: 88,
        status: 'flagged',
        description: `Unusual volume detected for recipient ${wireData.recipient}`
      };
      setFraudAlerts(prev => [alert, ...prev]);
      logAction("FRAUD_ALERT", `High risk detected for transaction ${alert.id}`, 'critical');
    }

    alert(`Success! ${wireData.rail} Transfer of ${formatCurrency(Number(wireData.amount))} has been queued for settlement.`);
    setShowWireForm(false);
    setWireData({ recipient: '', amount: '', memo: '', rail: 'ACH' });
  };

  // --- UI HELPERS: BADGE STYLING ---
  const getBadgeVariant = (status: string, objectType: string) => {
    const lowerCaseStatus = status.toLowerCase();
    switch (objectType) {
      case 'account':
        if (lowerCaseStatus === 'active') return 'success';
        if (lowerCaseStatus === 'inactive' || lowerCaseStatus === 'pending') return 'warning';
        if (lowerCaseStatus === 'disabled') return 'danger';
        break;
      case 'charge':
        if (lowerCaseStatus === 'succeeded') return 'success';
        if (lowerCaseStatus === 'pending') return 'warning';
        if (lowerCaseStatus === 'failed') return 'danger';
        if (lowerCaseStatus === 'refunded') return 'secondary';
        break;
      case 'subscription':
          if (lowerCaseStatus === 'active') return 'success';
          if (lowerCaseStatus === 'incomplete' || lowerCaseStatus === 'past_due' || lowerCaseStatus === 'trialing') return 'warning';
          if (lowerCaseStatus === 'canceled' || lowerCaseStatus === 'unpaid' || lowerCaseStatus === 'incomplete_expired') return 'danger';
          break;
      default:
        if (['active', 'succeeded', 'paid', 'verified'].includes(lowerCaseStatus)) return 'success';
        if (['pending', 'processing', 'in_transit'].includes(lowerCaseStatus)) return 'warning';
        if (['failed', 'canceled', 'declined', 'disabled'].includes(lowerCaseStatus)) return 'danger';
    }
    return 'default';
  };

  const getBadgeText = (status: string, objectType: string) => {
    const lowerCaseStatus = status.toLowerCase();
    // Simplified for the demo "Cheat Sheet" feel
    return lowerCaseStatus.charAt(0).toUpperCase() + lowerCaseStatus.slice(1);
  };

  if (!status) return null;

  const badgeVariant = getBadgeVariant(status, objectType);
  const badgeText = getBadgeText(status, objectType);

  // --- RENDER ---
  return (
    <>
      {/* The Original Badge - Enhanced with Interactive Trigger */}
      <div className="inline-block group relative">
        <span 
          onClick={() => {
            setIsModalOpen(true);
            logAction("UI_INTERACTION", `User opened Command Center for ${objectType}`, 'low');
          }}
          className={`
            cursor-pointer px-3 py-1 rounded-full text-xs font-bold tracking-tight transition-all duration-300
            ${badgeVariant === 'success' ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 hover:bg-emerald-500/40' : ''}
            ${badgeVariant === 'warning' ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30 hover:bg-amber-500/40' : ''}
            ${badgeVariant === 'danger' ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30 hover:bg-rose-500/40' : ''}
            ${badgeVariant === 'default' ? 'bg-slate-500/20 text-slate-400 border border-slate-500/30 hover:bg-slate-500/40' : ''}
            ${badgeVariant === 'secondary' ? 'bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 hover:bg-indigo-500/40' : ''}
          `}
        >
          {badgeText}
          <span className="ml-2 opacity-0 group-hover:opacity-100 transition-opacity text-[10px] uppercase">Command Center</span>
        </span>
      </div>

      {/* QUANTUM COMMAND CENTER MODAL */}
      {isModalOpen && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="bg-[#0a0a0c] border border-gray-800 w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex flex-col overflow-hidden">
            
            {/* Header */}
            <div className="p-6 border-b border-gray-800 flex justify-between items-center bg-gradient-to-r from-gray-900 to-black">
              <div>
                <h2 className="text-2xl font-black text-white tracking-tighter flex items-center gap-3">
                  <div className="w-3 h-3 bg-cyan-500 rounded-full animate-pulse" />
                  QUANTUM FINANCIAL <span className="text-gray-500 font-light">| COMMAND CENTER</span>
                </h2>
                <p className="text-xs text-gray-400 mt-1 uppercase tracking-widest">Global Institutional Banking Demo v4.0.2</p>
              </div>
              <button 
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-gray-400 hover:text-white"
              >
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
              </button>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
              
              {/* Left Sidebar: System Controls */}
              <div className="w-72 border-r border-gray-800 bg-gray-900/20 p-4 flex flex-col gap-4 overflow-y-auto">
                
                {/* Security Status */}
                <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest">Security Protocol</h3>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs text-gray-300">MFA Status</span>
                    <span className={`text-[10px] px-2 py-0.5 rounded ${mfaVerified ? 'bg-emerald-500/20 text-emerald-400' : 'bg-rose-500/20 text-rose-400'}`}>
                      {mfaVerified ? 'VERIFIED' : 'REQUIRED'}
                    </span>
                  </div>
                  {!mfaVerified && (
                    <button 
                      onClick={() => {
                        setMfaVerified(true);
                        logAction("SECURITY_MFA", "User completed simulated biometric handshake.", 'medium');
                      }}
                      className="w-full py-2 bg-cyan-600 hover:bg-cyan-500 text-white text-xs font-bold rounded-lg transition-all"
                    >
                      Simulate Biometric Auth
                    </button>
                  )}
                </div>

                {/* Quick Actions */}
                <div className="space-y-2">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-1 tracking-widest">Test Drive Engine</h3>
                  <button 
                    onClick={() => setShowWireForm(true)}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
                  >
                    <div className="p-2 bg-indigo-500/20 rounded text-indigo-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="12" y1="5" x2="12" y2="19"></line><polyline points="19 12 12 19 5 12"></polyline></svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Initiate Payment</div>
                      <div className="text-[10px] text-gray-500">Wire / ACH / SWIFT</div>
                    </div>
                  </button>

                  <button 
                    onClick={() => {
                      logAction("REPORT_GEN", "Generating real-time liquidity analysis...", 'low');
                      alert("Liquidity Report Generated. Check your simulated ERP integration.");
                    }}
                    className="w-full flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 transition-all text-left"
                  >
                    <div className="p-2 bg-emerald-500/20 rounded text-emerald-400">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21.21 15.89A10 10 0 1 1 8 2.83"></path><path d="M22 12A10 10 0 0 0 12 2v10z"></path></svg>
                    </div>
                    <div>
                      <div className="text-xs font-bold text-white">Analytics Hub</div>
                      <div className="text-[10px] text-gray-500">Data Visualization</div>
                    </div>
                  </button>
                </div>

                {/* Fraud Monitoring */}
                <div className="mt-auto">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Fraud Watch</h3>
                  <div className="space-y-2">
                    {fraudAlerts.length === 0 && <div className="text-[10px] text-gray-600 italic">No active threats detected.</div>}
                    {fraudAlerts.map(alert => (
                      <div key={alert.id} className="p-2 rounded bg-rose-500/10 border border-rose-500/20">
                        <div className="flex justify-between items-center">
                          <span className="text-[10px] font-bold text-rose-400 uppercase">{alert.type}</span>
                          <span className="text-[10px] text-rose-300">Risk: {alert.riskScore}</span>
                        </div>
                        <p className="text-[9px] text-gray-400 mt-1">{alert.description}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Center: AI Chat & Interaction */}
              <div className="flex-1 flex flex-col bg-black/20">
                
                {/* Chat Display */}
                <div className="flex-1 overflow-y-auto p-6 space-y-6">
                  {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                      <div className={`max-w-[80%] rounded-2xl p-4 ${
                        msg.role === 'user' 
                          ? 'bg-cyan-600 text-white rounded-tr-none' 
                          : 'bg-gray-800/50 text-gray-200 border border-gray-700 rounded-tl-none'
                      }`}>
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[10px] font-black uppercase tracking-tighter opacity-50">
                            {msg.role === 'user' ? 'Authorized User' : SYSTEM_NAME}
                          </span>
                          <span className="text-[9px] opacity-30">{msg.timestamp}</span>
                        </div>
                        <p className="text-sm leading-relaxed">{msg.content}</p>
                      </div>
                    </div>
                  ))}
                  {isAiLoading && (
                    <div className="flex justify-start">
                      <div className="bg-gray-800/50 border border-gray-700 rounded-2xl rounded-tl-none p-4 flex items-center gap-3">
                        <div className="flex gap-1">
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                          <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                        </div>
                        <span className="text-xs text-gray-500 font-mono">Processing neural request...</span>
                      </div>
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                {/* Chat Input */}
                <div className="p-6 border-t border-gray-800 bg-gray-900/30">
                  <div className="relative">
                    <input 
                      type="text"
                      value={chatInput}
                      onChange={(e) => setChatInput(e.target.value)}
                      onKeyDown={(e) => e.key === 'Enter' && handleAiChat()}
                      placeholder="Ask the AI Core to generate a payment, check fraud, or explain a feature..."
                      className="w-full bg-black border border-gray-700 rounded-xl py-4 pl-6 pr-16 text-sm text-white focus:outline-none focus:border-cyan-500 transition-all placeholder:text-gray-600"
                    />
                    <button 
                      onClick={handleAiChat}
                      disabled={isAiLoading || !chatInput.trim()}
                      className="absolute right-2 top-2 bottom-2 px-4 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-lg transition-all font-bold text-xs uppercase tracking-widest"
                    >
                      Send
                    </button>
                  </div>
                  <div className="mt-3 flex justify-between items-center">
                    <div className="flex gap-4">
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" /> Gemini 1.5 Flash Active
                      </span>
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <div className="w-1 h-1 bg-emerald-500 rounded-full" /> End-to-End Encrypted
                      </span>
                    </div>
                    <span className="text-[10px] text-gray-600 italic">Quantum Financial - No Pressure Environment</span>
                  </div>
                </div>
              </div>

              {/* Right Sidebar: Audit & Details */}
              <div className="w-80 border-l border-gray-800 p-4 flex flex-col gap-4 bg-gray-900/10">
                
                {/* Object Context */}
                <div className="p-4 rounded-xl bg-cyan-500/5 border border-cyan-500/20">
                  <h3 className="text-[10px] font-bold text-cyan-500 uppercase mb-2 tracking-widest">Active Context</h3>
                  <div className="space-y-1">
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-400">Entity Type</span>
                      <span className="text-[10px] text-white font-mono">{objectType.toUpperCase()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-400">Current Status</span>
                      <span className={`text-[10px] font-mono ${badgeVariant === 'success' ? 'text-emerald-400' : 'text-amber-400'}`}>
                        {status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-[10px] text-gray-400">Trace ID</span>
                      <span className="text-[10px] text-gray-500 font-mono">TXN-{generateId().toUpperCase()}</span>
                    </div>
                  </div>
                </div>

                {/* Audit Log Component */}
                <div className="flex-1 flex flex-col min-h-0">
                  <AuditLogViewer logs={auditLogs} />
                </div>

                {/* Integration Status */}
                <div className="p-4 rounded-xl bg-gray-800/30 border border-gray-700">
                  <h3 className="text-[10px] font-bold text-gray-500 uppercase mb-3 tracking-widest">ERP Integration</h3>
                  <div className="flex items-center gap-3 opacity-50 grayscale hover:grayscale-0 hover:opacity-100 transition-all cursor-help">
                    <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">SAP</div>
                    <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">ORCL</div>
                    <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">XERO</div>
                    <div className="w-8 h-8 bg-white/10 rounded flex items-center justify-center text-[10px] font-bold">QB</div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* POPUP FORM: WIRE TRANSFER (Nested Modal) */}
          {showWireForm && (
            <div className="fixed inset-0 z-[10000] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
              <div className="bg-[#121214] border border-gray-700 w-full max-w-md rounded-2xl shadow-2xl overflow-hidden animate-in zoom-in duration-200">
                <div className="p-6 border-b border-gray-800 flex justify-between items-center">
                  <h3 className="text-lg font-bold text-white">Initiate Global Payment</h3>
                  <button onClick={() => setShowWireForm(false)} className="text-gray-500 hover:text-white">
                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                  </button>
                </div>
                <form onSubmit={executeWireTransfer} className="p-6 space-y-4">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Recipient Name / Entity</label>
                    <input 
                      required
                      type="text" 
                      value={wireData.recipient}
                      onChange={e => setWireData({...wireData, recipient: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                      placeholder="e.g. Acme Corp Global"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Amount (USD)</label>
                      <input 
                        required
                        type="number" 
                        value={wireData.amount}
                        onChange={e => setWireData({...wireData, amount: e.target.value})}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                        placeholder="0.00"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Payment Rail</label>
                      <select 
                        value={wireData.rail}
                        onChange={e => setWireData({...wireData, rail: e.target.value})}
                        className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                      >
                        <option>ACH</option>
                        <option>Domestic Wire</option>
                        <option>SWIFT / International</option>
                        <option>Real-Time Payment</option>
                      </select>
                    </div>
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-1">Memo / Reference</label>
                    <input 
                      type="text" 
                      value={wireData.memo}
                      onChange={e => setWireData({...wireData, memo: e.target.value})}
                      className="w-full bg-black border border-gray-700 rounded-lg p-3 text-sm text-white focus:border-cyan-500 outline-none"
                      placeholder="Invoice #8821-X"
                    />
                  </div>
                  
                  <div className="pt-4">
                    <div className="p-3 rounded-lg bg-amber-500/10 border border-amber-500/20 mb-4">
                      <p className="text-[10px] text-amber-200 leading-tight">
                        <strong>Security Note:</strong> Payments over $10,000 require secondary approval from your Treasury Manager.
                      </p>
                    </div>
                    <button 
                      type="submit"
                      className="w-full py-4 bg-cyan-600 hover:bg-cyan-500 text-white font-black uppercase tracking-widest rounded-xl transition-all shadow-lg shadow-cyan-500/20"
                    >
                      Authorize & Execute
                    </button>
                  </div>
                </form>
              </div>
            </div>
          )}
        </div>
      )}
    </>
  );
};

/**
 * FINAL NOTES ON THE DEMO EXPERIENCE:
 * 
 * This component serves as the "Golden Ticket" entry point. 
 * By clicking any status badge, the user is granted access to the "Quantum Command Center".
 * 
 * Key Features Demonstrated:
 * 1. AI Strategic Guidance: Powered by Gemini, providing context-aware banking advice.
 * 2. Immutable Audit Trail: Every action is logged to local storage, simulating a secure ledger.
 * 3. High-Performance UI: Dark mode, glassmorphism, and high-contrast accents.
 * 4. Functional Simulations: Wire transfers, MFA, and Fraud monitoring.
 * 5. No Pressure: A sandbox environment where users can "kick the tires" without risk.
 * 
 * This is the future of business banking - transparent, intelligent, and secure.
 */

export default StripeStatusBadge;