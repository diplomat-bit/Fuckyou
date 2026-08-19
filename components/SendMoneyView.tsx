import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Send, 
  Zap, 
  ShieldCheck, 
  Database, 
  History, 
  Terminal, 
  MessageSquare, 
  Cpu, 
  Lock, 
  Activity, 
  Globe, 
  Layers, 
  BarChart3, 
  AlertTriangle, 
  Fingerprint, 
  Eye, 
  RefreshCcw,
  ChevronRight,
  Search,
  Filter,
  Download,
  Settings,
  UserCheck,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  ShieldAlert
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View, PaymentRail, Transaction } from '../types';
import { BiometricModal, SecurityAuditDisplay, SecurityAuditResult } from './payment-components';

/**
 * QUANTUM FINANCIAL - ELITE BUSINESS DEMO ENGINE
 * VERSION: 4.0.1-PROD
 * 
 * PHILOSOPHY: 
 * - "Golden Ticket" Experience.
 * - High-Performance, Secure, Elite.
 * - No Pressure "Test Drive" Environment.
 * - Full Audit Traceability.
 * - AI-First Orchestration.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: any;
  hash: string; // Simulated blockchain hash
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isExecuting?: boolean;
}

interface FraudSignal {
  id: string;
  type: string;
  strength: number;
  status: 'MONITORING' | 'FLAGGED' | 'CLEARED';
}

// ================================================================================================
// CONSTANTS & CONFIGURATION
// ================================================================================================

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Strategist, the core intelligence of "The Demo Bank". 
Your goal is to provide a "Golden Ticket" experience for elite business clients.
You are professional, high-performance, and secure.

CAPABILITIES:
1. You can help users fill out the payment form.
2. You can analyze transaction risks.
3. You can explain complex financial rails (Wire, ACH, Quantum).
4. You can trigger UI actions by including a JSON block in your response.

JSON COMMAND STRUCTURE:
If the user wants to set a value, include:
{ "command": "SET_FORM", "data": { "recipient": "Name", "amount": 1000, "rail": "quantumpay" } }

If the user wants to navigate:
{ "command": "NAVIGATE", "data": { "view": "dashboard" } }

IMPORTANT: 
- DO NOT use the name "Citibank". Use "Quantum Financial" or "The Demo Bank".
- Be helpful but maintain an elite, professional tone.
- You are part of a "Test Drive" experience. Encourage the user to "kick the tires".
`;

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// ================================================================================================
// SUB-COMPONENTS (MONOLITHIC ARCHITECTURE)
// ================================================================================================

/**
 * AuditLedger: Displays the immutable log of all sensitive actions.
 */
const AuditLedger: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => (
  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
    {logs.map((log) => (
      <div key={log.id} className="p-3 bg-black/40 border border-gray-800 rounded-lg flex flex-col gap-1 group hover:border-cyan-500/50 transition-colors">
        <div className="flex justify-between items-center">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
            log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 
            log.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400'
          }`}>
            {log.severity}
          </span>
          <span className="text-[9px] font-mono text-gray-600">{log.timestamp}</span>
        </div>
        <p className="text-xs text-gray-300 font-medium">{log.action}</p>
        <div className="flex items-center gap-2 mt-1">
          <Database size={10} className="text-gray-600" />
          <span className="text-[8px] font-mono text-gray-600 truncate">HASH: {log.hash}</span>
        </div>
      </div>
    ))}
  </div>
);

/**
 * SecurityEngine: Visualizes real-time fraud monitoring.
 */
const SecurityEngine: React.FC = () => {
  const [signals, setSignals] = useState<FraudSignal[]>([
    { id: '1', type: 'IP_GEOLOCATION', strength: 0.98, status: 'CLEARED' },
    { id: '2', type: 'VELOCITY_CHECK', strength: 0.85, status: 'MONITORING' },
    { id: '3', type: 'BEHAVIORAL_BIOMETRICS', strength: 0.99, status: 'CLEARED' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => prev.map(s => ({
        ...s,
        strength: Math.min(1, Math.max(0.7, s.strength + (Math.random() - 0.5) * 0.05))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {signals.map(signal => (
        <div key={signal.id} className="space-y-1">
          <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span>{signal.type}</span>
            <span className="text-cyan-400">{(signal.strength * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-1000" 
              style={{ width: `${signal.strength * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase">
        <ShieldCheck size={14} /> All Systems Nominal
      </div>
    </div>
  );
};

// ================================================================================================
// MAIN COMPONENT: SendMoneyView
// ================================================================================================

const SendMoneyView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
  
  const { addTransaction, setActiveView } = context;

  // --- FORM STATE ---
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay');
  const [memo, setMemo] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // --- UI STATE ---
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'analytics' | 'audit'>('form');
  
  // --- AUDIT STATE ---
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  
  // --- AI CHAT STATE ---
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Welcome to the Quantum Financial Test Drive. I am your AI Strategist. How can I assist with your capital deployment today?", 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    logAuditAction('SESSION_START', 'SYSTEM', 'LOW', { view: 'SendMoneyView' });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- AUDIT LOGGING LOGIC ---
  const logAuditAction = (action: string, actor: string, severity: AuditEntry['severity'], metadata: any) => {
    const newEntry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      severity,
      metadata,
      hash: generateHash()
    };
    setAuditTrail(prev => [newEntry, ...prev]);
    console.log(`[AUDIT_LOG] ${action}`, newEntry);
  };

  // --- AI INTEGRATION ---
  const handleAiChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);
    logAuditAction('AI_QUERY', 'USER', 'LOW', { query: chatInput });

    try {
      // Initialize Gemini
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser Input: ${chatInput}`);
      const responseText = result.response.text();

      // Parse for commands
      const commandMatch = responseText.match(/\{.*\}/s);
      if (commandMatch) {
        try {
          const commandData = JSON.parse(commandMatch[0]);
          handleAiCommand(commandData);
        } catch (err) {
          console.error("Failed to parse AI command", err);
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText.replace(/\{.*\}/s, '').trim(),
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "I apologize, but my neural link is experiencing interference. Please proceed with manual entry.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleAiCommand = (cmd: any) => {
    logAuditAction('AI_COMMAND_EXECUTION', 'AI_CORE', 'MEDIUM', cmd);
    if (cmd.command === 'SET_FORM') {
      if (cmd.data.recipient) setRecipientName(cmd.data.recipient);
      if (cmd.data.amount) setAmount(cmd.data.amount.toString());
      if (cmd.data.rail) setPaymentMethod(cmd.data.rail);
    } else if (cmd.command === 'NAVIGATE') {
      setActiveView(cmd.data.view as View);
    }
  };

  // --- PAYMENT LOGIC ---
  useEffect(() => {
    const auditTimeout = setTimeout(() => {
      if (parseFloat(amount) > 0 && recipientName) {
        const score = parseFloat(amount) > 10000 ? 75 : 12;
        setSecurityAudit({
          riskScore: score,
          fraudProbability: score / 1000,
          amlCompliance: 'pass',
          sanctionScreening: 'pass',
          quantumSignatureIntegrity: 'verified',
          recommendations: score > 50 ? ["Enhanced monitoring required", "Verify recipient via secondary channel"] : ["Optimal route confirmed"],
          complianceAlerts: [],
          threatVectorAnalysis: []
        });
        if (score > 50) {
          logAuditAction('HIGH_RISK_DETECTION', 'SECURITY_ENGINE', 'HIGH', { amount, recipientName, score });
        }
      } else {
        setSecurityAudit(null);
      }
    }, 800);
    return () => clearTimeout(auditTimeout);
  }, [amount, recipientName]);

  const handleSendClick = () => {
    if (currentStep === 1) {
      logAuditAction('PAYMENT_REVIEW_INITIATED', 'USER', 'LOW', { amount, recipientName, rail: paymentMethod });
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setShowBiometricModal(true);
    }
  };

  const handleSuccess = async () => {
    setIsProcessing(true);
    logAuditAction('PAYMENT_AUTHORIZED', 'USER', 'HIGH', { amount, recipientName, method: 'BIOMETRIC' });
    
    // Simulate network latency for "Elite" feel
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'expense',
      category: 'Transfer',
      description: `Quantum Transfer to ${recipientName}`,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      metadata: {
        rail: paymentMethod,
        memo: memo,
        audit_hash: generateHash()
      }
    };

    await addTransaction(newTx);
    logAuditAction('TRANSACTION_FINALIZED', 'LEDGER', 'MEDIUM', { txId: newTx.id });
    
    setShowBiometricModal(false);
    setIsProcessing(false);
    setActiveView(View.Dashboard);
  };

  // ================================================================================================
  // RENDER LOGIC
  // ================================================================================================

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
        
        {/* ELITE HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800/50 pb-8 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <Layers className="text-black" size={24} />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                Quantum <span className="text-cyan-500">Financial</span>
              </h2>
            </div>
            <p className="text-gray-500 text-xs font-mono tracking-[0.3em] uppercase flex items-center gap-2">
              <Activity size={12} className="text-emerald-500 animate-pulse" /> 
              System Status: Optimal // Node: Global_Nexus_01
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center gap-3 group hover:border-cyan-500/50 transition-all cursor-help">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <div className="text-left">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Liquidity Pool</p>
                <p className="text-xs font-mono text-white">$2.45B Available</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center gap-3 group hover:border-cyan-500/50 transition-all">
              <Globe size={16} className="text-cyan-500" />
              <div className="text-left">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Global Rails</p>
                <p className="text-xs font-mono text-white">182 Countries Active</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: PAYMENT CONSOLE */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* NAVIGATION TABS */}
            <div className="flex gap-1 p-1 bg-gray-900/50 border border-gray-800 rounded-2xl w-fit">
              {[
                { id: 'form', label: 'Transfer Portal', icon: Send },
                { id: 'analytics', label: 'Market Intelligence', icon: BarChart3 },
                { id: 'audit', label: 'Immutable Ledger', icon: Database },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    logAuditAction('TAB_SWITCH', 'USER', 'LOW', { to: tab.id });
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'form' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PRIMARY FORM */}
                <div className="space-y-6">
                  <Card 
                    title={currentStep === 1 ? "Initiate Capital Flow" : "Security Verification"}
                    subtitle="Precision-engineered payment orchestration"
                  >
                    <div className="space-y-6 pt-4">
                      {currentStep === 1 ? (
                        <>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Recipient Identifier</label>
                            <div className="relative group">
                              <input 
                                type="text" 
                                value={recipientName} 
                                onChange={e => setRecipientName(e.target.value)} 
                                className="w-full bg-black/60 border border-gray-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 border-gray-700 outline-none font-mono text-lg transition-all group-hover:border-gray-600" 
                                placeholder="Entity Name or Wallet ID" 
                              />
                              <UserCheck className="absolute right-4 top-4 text-gray-700 group-focus-within:text-cyan-500 transition-colors" size={20} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Magnitude (USD)</label>
                            <div className="relative group">
                              <input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)} 
                                className="w-full bg-black/60 border border-gray-800 rounded-2xl p-5 text-white focus:ring-2 focus:ring-cyan-500/50 border-gray-700 outline-none font-mono text-4xl font-black transition-all group-hover:border-gray-600" 
                                placeholder="0.00" 
                              />
                              <span className="absolute right-6 top-7 text-gray-600 font-black text-xl">USD</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Execution Protocol</label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { id: 'quantumpay', label: 'QuantumPay', sub: 'Instant', icon: Zap },
                                { id: 'swift_global', label: 'SWIFT L1', sub: 'T+0', icon: Globe },
                                { id: 'blockchain_dlt', label: 'DLT Rail', sub: 'Encrypted', icon: Layers },
                                { id: 'cashapp', label: 'ACH Prime', sub: 'Standard', icon: RefreshCcw },
                              ].map(rail => (
                                <button
                                  key={rail.id}
                                  onClick={() => setPaymentMethod(rail.id as any)}
                                  className={`p-4 rounded-2xl border text-left transition-all ${
                                    paymentMethod === rail.id 
                                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                      : 'bg-black/40 border-gray-800 hover:border-gray-700'
                                  }`}
                                >
                                  <rail.icon size={18} className={paymentMethod === rail.id ? 'text-cyan-500' : 'text-gray-600'} />
                                  <p className={`text-xs font-black mt-2 uppercase ${paymentMethod === rail.id ? 'text-white' : 'text-gray-400'}`}>{rail.label}</p>
                                  <p className="text-[9px] text-gray-600 font-mono">{rail.sub}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Transaction Memo (Optional)</label>
                            <textarea 
                              value={memo}
                              onChange={e => setMemo(e.target.value)}
                              className="w-full bg-black/60 border border-gray-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 border-gray-700 outline-none font-mono text-sm h-24 resize-none"
                              placeholder="Reference code, invoice #, or internal note..."
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] border border-gray-800 space-y-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em]">Awaiting Digital Authorization</p>
                            <div className="space-y-1">
                              <div className="text-6xl font-black text-white font-mono tracking-tighter">
                                {formatCurrency(parseFloat(amount))}
                              </div>
                              <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Target: {recipientName}</p>
                            </div>
                            <div className="flex justify-center gap-8 py-4 border-y border-gray-800/50">
                              <div className="text-center">
                                <p className="text-[8px] text-gray-600 uppercase font-bold">Network Fee</p>
                                <p className="text-xs font-mono text-white">$0.00</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-gray-600 uppercase font-bold">Settlement</p>
                                <p className="text-xs font-mono text-white">Instant</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-gray-600 uppercase font-bold">Protocol</p>
                                <p className="text-xs font-mono text-white uppercase">{paymentMethod}</p>
                              </div>
                            </div>
                            <p className="text-[9px] text-gray-600 font-mono italic">
                              SECURE_HASH: {generateHash().substring(0, 24)}...
                            </p>
                          </div>
                          <SecurityAuditDisplay auditResult={securityAudit} />
                        </div>
                      )}
                      
                      <div className="flex gap-4 mt-8">
                        {currentStep === 2 && (
                          <button 
                            onClick={() => setCurrentStep(1)} 
                            className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-gray-400 font-black rounded-2xl transition-all uppercase tracking-widest text-xs border border-gray-800"
                          >
                            Modify
                          </button>
                        )}
                        <button 
                          onClick={handleSendClick} 
                          disabled={!amount || !recipientName || isProcessing} 
                          className="flex-[2] py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black shadow-2xl shadow-cyan-600/30 transition-all active:scale-[0.98] disabled:opacity-30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group"
                        >
                          {isProcessing ? (
                            <RefreshCcw size={18} className="animate-spin" />
                          ) : (
                            <>
                              {currentStep === 1 ? "Review Protocol" : "Authorize Flow"}
                              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* SECONDARY DIAGNOSTICS */}
                <div className="space-y-8">
                  <Card title="Signal Intelligence" subtitle="Real-time heuristic monitoring">
                    <div className="space-y-6 py-2">
                      <div className="p-5 bg-black/60 rounded-2xl border border-gray-800 space-y-4">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                          <Cpu size={12} className="text-cyan-500" /> Neural Risk Engine
                        </p>
                        <SecurityEngine />
                      </div>

                      <div className="p-5 bg-black/60 rounded-2xl border border-gray-800 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ShieldCheck className="text-emerald-500" size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-white font-black uppercase tracking-widest">Zero-Knowledge Proofs</p>
                            <p className="text-[10px] text-gray-500">Identity obfuscation active for this route.</p>
                          </div>
                        </div>
                        <div className="h-px bg-gray-800" />
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Terminal className="text-cyan-500" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white font-black uppercase tracking-widest">Telemetry Stream</p>
                            <p className="text-[9px] text-gray-600 font-mono truncate mt-1">
                              &gt; handshake_init: node_{paymentMethod.substring(0, 4)}...
                              <br />
                              &gt; entropy_check: 0.99923...
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-3xl flex items-center gap-5 group hover:border-indigo-500/40 transition-all">
                        <div className="relative">
                          <History className="text-indigo-400" size={24} />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-black" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white font-black uppercase tracking-widest">Historical Synergy</p>
                          <p className="text-[10px] text-gray-400 mt-1">3 successful deployments to this recipient in the last 30 cycles.</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Compliance Oracle">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">AML Screening</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">PASSED</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <ShieldAlert size={14} className="text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Sanctions Check</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">CLEAR</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <Fingerprint size={14} className="text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">KYB Verification</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">VERIFIED</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card title="Volume Analysis">
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                      {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                        <div key={i} className="w-full bg-cyan-500/20 rounded-t-lg relative group">
                          <div 
                            className="absolute bottom-0 left-0 w-full bg-cyan-500 rounded-t-lg transition-all duration-1000 group-hover:bg-cyan-400" 
                            style={{ height: `${h}%` }} 
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[8px] font-mono text-gray-600 uppercase">
                      <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                    </div>
                  </Card>
                  <Card title="Rail Efficiency">
                    <div className="space-y-4 pt-4">
                      {[
                        { label: 'Quantum', val: 99.9, color: 'bg-cyan-500' },
                        { label: 'SWIFT', val: 82.4, color: 'bg-indigo-500' },
                        { label: 'ACH', val: 94.1, color: 'bg-emerald-500' },
                      ].map(r => (
                        <div key={r.label} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                            <span>{r.label}</span>
                            <span>{r.val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                            <div className={`h-full ${r.color}`} style={{ width: `${r.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card title="Global Reach">
                    <div className="flex items-center justify-center h-48 relative">
                      <Globe size={100} className="text-gray-800 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-black text-white">182</p>
                          <p className="text-[8px] text-gray-500 uppercase font-bold">Active Nodes</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                <Card title="Market Liquidity Heatmap">
                  <div className="grid grid-cols-12 gap-2 h-32">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="rounded-sm transition-all hover:scale-110 cursor-crosshair" 
                        style={{ 
                          backgroundColor: `rgba(6, 182, 212, ${Math.random() * 0.8 + 0.1})`,
                        }}
                        title={`Node ${i}: High Liquidity`}
                      />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card 
                  title="Immutable Audit Ledger" 
                  subtitle="Cryptographically signed record of all system interactions"
                  headerActions={[
                    { id: 'dl', icon: <Download />, label: 'Export CSV', onClick: () => logAuditAction('LEDGER_EXPORT', 'USER', 'MEDIUM', { format: 'CSV' }) },
                    { id: 'filter', icon: <Filter />, label: 'Filter', onClick: () => {} }
                  ]}
                >
                  <AuditLedger logs={auditTrail} />
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ledger Integrity</p>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-emerald-500" size={20} />
                      <p className="text-xs font-mono text-gray-300">All blocks verified. No discrepancies detected.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Storage Utilization</p>
                    <div className="flex items-center gap-3">
                      <Database className="text-cyan-500" size={20} />
                      <p className="text-xs font-mono text-gray-300">Quantum-encrypted cold storage: 12.4 TB used.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AI STRATEGIST CHAT */}
          <div className="xl:col-span-4">
            <div className="sticky top-10 space-y-6">
              <Card 
                className="h-[calc(100vh-180px)] flex flex-col border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]"
                title="AI Strategist"
                subtitle="Quantum Financial Intelligence Core"
                icon={<Cpu className="text-cyan-500" size={20} />}
              >
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar mb-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-cyan-600 text-white rounded-tr-none' 
                          : msg.role === 'system'
                          ? 'bg-gray-800/50 text-gray-400 italic text-center w-full'
                          : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-mono text-gray-600 mt-1 uppercase">{msg.timestamp}</span>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="flex items-center gap-2 text-cyan-500 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleAiChat} className="relative mt-auto">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask the Strategist..."
                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 pr-12 text-xs text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isAiTyping}
                    className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-30"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </form>
              </Card>

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    setChatInput("Analyze the risk of a $50,000 transfer to Global Logistics Inc.");
                    handleAiChat();
                  }}
                  className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-left"
                >
                  Risk Analysis
                </button>
                <button 
                  onClick={() => {
                    setChatInput("What is the most efficient rail for a T+0 settlement to London?");
                    handleAiChat();
                  }}
                  className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-left"
                >
                  Rail Optimization
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <BiometricModal 
        isOpen={showBiometricModal} 
        onSuccess={handleSuccess} 
        onClose={() => {
          setShowBiometricModal(false);
          logAuditAction('BIOMETRIC_CANCELLED', 'USER', 'MEDIUM', { amount });
        }} 
        amount={amount} 
        recipient={recipientName} 
        paymentMethod={paymentMethod} 
        securityContext="corporate_treasury" 
      />

      {/* GLOBAL OVERLAYS */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
              <Lock className="absolute inset-0 m-auto text-cyan-500" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Securing Transaction</h3>
              <p className="text-gray-500 font-mono text-xs animate-pulse">ENCRYPTING_PACKETS // SIGNING_LEDGER // VERIFYING_NODES</p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #06b6d4;
        }
      `}</style>
    </div>
  );
};

export default SendMoneyView;

// --- CONSOLIDATED FROM: SendMoneyView (4).tsx ---

// components/views/personal/SendMoneyView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now "Remitrax," a complete, multi-rail payment portal featuring advanced
// security simulations and demonstrating enterprise-level integration patterns.
// After a decade of upgrades, Remitrax has evolved into an unparalleled financial ecosystem,
// incorporating AI, quantum-resistant security, DLT, and even neuro-link technologies.

import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import type { Transaction } from '../types';

// ================================================================================================
// GLOBAL REMITRAX PLATFORM WIDE TYPE DEFINITIONS
// ================================================================================================

export type PaymentRail = 'quantumpay' | 'cashapp' | 'swift_global' | 'blockchain_dlt' | 'interstellar_p2p' | 'neuro_link' | 'ai_contract_escrow';
export type ScanState = 'scanning' | 'success' | 'verifying' | 'error' | 'recalibrating' | 'quantum_sync' | 'ai_negotiating';

export interface RemitraxRecipientProfile {
  id: string;
  name: string;
  avatarUrl?: string;
  quantumTag?: string;
  cashtag?: string;
  swiftDetails?: { bankName: string; bic: string; accountNumber: string; };
  blockchainAddress?: string;
  neuroLinkAddress?: string;
  galacticP2PId?: string;
  preferredCurrency?: string;
  lastUsedDate?: string;
  trustScore?: number;
  kycStatus?: 'verified' | 'pending' | 'unverified';
  blacklisted?: boolean;
  bankAccounts?: { bankName: string; accountNumber: string; routingNumber?: string; iban?: string; }[];
  eWalletDetails?: { type: 'paypal' | 'venmo' | 'zelle' | 'revolut' | 'cashapp' | 'quantumpay'; identifier: string; }[];
  contactPreferences?: { email: boolean; sms: boolean; push: boolean; holo_alert?: boolean; };
  relationshipStatus?: 'family' | 'friend' | 'business' | 'self' | 'vendor' | 'partner' | 'regulatory_body';
  category?: 'personal' | 'business' | 'charity' | 'government';
  multiEntitySupport?: { parentId: string; subEntities: { id: string; name: string; type: string; }[]; };
  complianceFlags?: ('high_risk' | 'sanctioned_entity' | 'PEP' | 'low_risk' | 'verified_entity')[];
}

export interface RemitraxCurrency {
  code: string;
  name: string;
  symbol: string;
  isCrypto: boolean;
  conversionRate?: number;
  quantumFluctuationIndex?: number;
  decimalPlaces: number;
  minTransactionAmount?: number;
  maxTransactionAmount?: number;
  liquidityScore?: number;
  marketCap?: number;
  regulatoryStatus?: 'regulated' | 'unregulated' | 'experimental';
  crossChainCompatible?: boolean;
}

export interface ScheduledPaymentRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'quarterly' | 'annually' | 'once_on_date' | 'conditional_event';
  startDate: string;
  endDate?: string;
  executionCondition?: string;
  nextExecutionDate?: string;
  maxExecutions?: number;
  triggerEventId?: string;
  paymentReason?: string;
  aiAnalysisTags?: string[];
  geoFenceTrigger?: { lat: number; lon: number; radius: number; };
  biometricApprovalRequired?: boolean;
}

export interface AdvancedTransactionSettings {
  priority: 'low' | 'normal' | 'high' | 'ultra_quantum';
  carbonOffsetRatio: number;
  privacyLevel: 'standard' | 'enhanced' | 'fully_anonymous_dlt';
  receiptPreference: 'email' | 'blockchain_proof' | 'neuronal_link_receipt' | 'physical_mail';
  notificationPreferences: { email: boolean; sms: boolean; push: boolean; holo_alert: boolean; };
  multiSignatureRequired?: boolean;
  escrowDetails?: { agentId: string; releaseCondition: string; };
  dynamicFeeOptimization?: 'auto' | 'manual';
  dataEncryptionStandard: 'aes256' | 'quantum_resistant_hybrid' | 'zero_knowledge_proof' | 'obfuscated_vault';
  routeOptimizationPreference: 'speed' | 'cost' | 'privacy' | 'sustainability' | 'compliance';
  dlcDetails?: { contractId: string; conditions: string; };
  transactionExpiryMinutes?: number;
  regulatoryReportingFlags?: ('FATCA' | 'CRS' | 'AML' | 'CFT' | 'none')[];
  postQuantumSecurityEnabled?: boolean;
}

export interface SecurityAuditResult {
  riskScore: number;
  fraudProbability: number;
  amlCompliance: 'pass' | 'fail' | 'review';
  sanctionScreening: 'pass' | 'fail';
  quantumSignatureIntegrity: 'verified' | 'compromised' | 'pending';
  recommendations: string[];
  complianceAlerts?: string[];
  threatVectorAnalysis?: { type: string; severity: 'low' | 'medium' | 'high'; description: string; }[];
}

export interface EnvironmentalImpactReport {
    transactionCO2e: number;
    offsetCO2e: number;
    netCO2e: number;
    renewableEnergyUsedPercentage: number;
    recommendations?: string[];
}

export interface RailSpecificDetails {
    swift?: { bankName: string; bic: string; accountNumber: string; beneficiaryAddress: string; };
    blockchain?: { network: 'ethereum' | 'polygon' | 'solana' | 'custom_dlt' | ''; gasLimit: string; dataPayload?: string; };
    interstellar?: { galaxyId: string; starSystemAddress: string; vesselIdentifier?: string; warpDriveEfficiencyRating?: number; };
    neuroLink?: { neuralSignatureType: 'brainwave' | 'retinal_pattern' | ''; recipientId: string; neuroSyncProtocolVersion?: string; };
    aiContractEscrow?: { contractTemplateId: string; escrowConditions: string; resolutionAgentId?: string; immutableLedgerHash?: string; };
    quantumpay?: { channelProtocol: 'quantum_tunnel_v2' | 'entanglement_link_v1'; encryptionStandard: 'QRC-256' | 'hybrid_post_quantum'; quantumSignatureAlgorithm?: string; }
}

interface SendMoneyViewProps {
  setActiveView?: (view: View) => void;
}

// ================================================================================================
// ANIMATED UI SUB-COMPONENTS
// ================================================================================================

export const AnimatedCheckmarkIcon: React.FC = () => (
    <>
        <svg className="h-24 w-24 transform scale-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <defs>
                <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="50%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
                <filter id="hologramGlow">
                    <feGaussianBlur in="SourceGraphic" stdDeviation="3" result="blur" />
                    <feColorMatrix in="blur" mode="matrix" values="1 0 0 0 0 0 1 0 0 0 0 0 1 0 0 0 0 0 10 0" result="coloredBlur" />
                    <feMerge><feMergeNode in="coloredBlur" /><feMergeNode in="SourceGraphic" /></feMerge>
                </filter>
            </defs>
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="url(#checkmarkGradient)" filter="url(#hologramGlow)" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <style>{`
            .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; stroke-width: 4; stroke-miterlimit: 10; fill: none; animation: stroke-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; box-shadow: 0 0 15px rgba(66, 255, 125, 0.7); }
            .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-width: 5; stroke: #fff; animation: stroke-check 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
            @keyframes stroke-circle { 100% { stroke-dashoffset: 0; } }
            @keyframes stroke-check { 100% { stroke-dashoffset: 0; } }
        `}</style>
    </>
);

export const QuantumLedgerAnimation: React.FC = () => (
    <>
        <div className="quantum-ledger-container">
            <div className="quantum-grid-enhanced">
                {Array.from({ length: 16 }).map((_, i) => (
                    <div key={i} className="quantum-block-enhanced" style={{ animationDelay: `${i * 0.08}s` }}></div>
                ))}
            </div>
            <div className="quantum-data-flow">
                <div className="data-packet" style={{ '--flow-delay': '0s' } as React.CSSProperties}></div>
                <div className="data-packet" style={{ '--flow-delay': '0.5s' } as React.CSSProperties}></div>
            </div>
            <div className="text-center mt-4 text-xs text-cyan-300 animate-pulse">Quantum Entanglement Protocol: Active</div>
        </div>
        <style>{`
            .quantum-ledger-container { position: relative; width: 150px; height: 150px; display: flex; flex-direction: column; align-items: center; justify-content: center; }
            .quantum-grid-enhanced { display: grid; grid-template-columns: repeat(4, 1fr); gap: 6px; width: 120px; height: 120px; position: relative; z-index: 1; }
            .quantum-block-enhanced { background-color: rgba(6, 182, 212, 0.2); border: 1px solid #06b6d4; border-radius: 3px; animation: quantum-pulse 2s infinite ease-in-out forwards; box-shadow: 0 0 8px rgba(6, 182, 212, 0.5); }
            @keyframes quantum-pulse { 0%, 100% { background-color: rgba(6, 182, 212, 0.2); transform: scale(1); box-shadow: 0 0 8px rgba(6, 182, 212, 0.5); } 50% { background-color: rgba(165, 243, 252, 0.7); transform: scale(1.08); box-shadow: 0 0 15px rgba(165, 243, 252, 0.8); } }
            .quantum-data-flow { position: absolute; inset: 0; display: flex; justify-content: center; align-items: center; }
            .data-packet { position: absolute; width: 8px; height: 8px; border-radius: 50%; background: linear-gradient(45deg, #0ef, #06b6d4); box-shadow: 0 0 5px #0ef, 0 0 10px #06b6d4; animation: data-flow-path 4s infinite linear var(--flow-delay); opacity: 0; }
            @keyframes data-flow-path { 0% { transform: translate(-60px, -60px) scale(0.5); opacity: 0; } 20% { opacity: 1; } 50% { transform: translate(60px, 60px) scale(1.2); opacity: 1; } 80% { opacity: 0; } 100% { transform: translate(120px, 120px) scale(0.5); opacity: 0; } }
        `}</style>
    </>
);

export const QuantumChannelEstablishment: React.FC = () => (
    <>
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-24 h-24 rounded-full flex items-center justify-center border-2 border-purple-500 animate-spin-slow">
                <div className="w-16 h-16 rounded-full border-2 border-purple-400 animate-ping-once"></div>
                <div className="absolute w-8 h-8 bg-purple-600 rounded-full animate-pulse-fast"></div>
            </div>
            <p className="text-sm text-purple-300 animate-fade-in-out">Establishing Quantum Tunnel...</p>
        </div>
        <style>{`.animate-spin-slow { animation: spin-slow 8s linear infinite; } .animate-ping-once { animation: ping-once 2s ease-out infinite; } .animate-pulse-fast { animation: pulse-fast 1.5s ease-in-out infinite; } .animate-fade-in-out { animation: fade-in-out 3s ease-in-out infinite; }
        @keyframes spin-slow { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } } @keyframes ping-once { 0% { transform: scale(0.2); opacity: 0; } 50% { transform: scale(1); opacity: 1; } 100% { transform: scale(1.2); opacity: 0; } } @keyframes pulse-fast { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.1); opacity: 0.8; } } @keyframes fade-in-out { 0%, 100% { opacity: 0.5; } 50% { opacity: 1; } }`}</style>
    </>
);

export const AINegotiationAnimation: React.FC = () => (
    <>
        <div className="flex flex-col items-center justify-center space-y-3">
            <div className="relative w-24 h-24 flex items-center justify-center">
                <i className="fas fa-robot text-7xl text-teal-500 animate-pulse-slow"></i>
                <div className="absolute w-12 h-12 bg-gray-900 rounded-full flex items-center justify-center animate-spin-fast">
                    <i className="fas fa-exchange-alt text-xl text-teal-300"></i>
                </div>
            </div>
            <p className="text-sm text-teal-300 animate-fade-in-out">AI Negotiating Optimal Route & Terms...</p>
        </div>
        <style>{`.animate-pulse-slow { animation: pulse-slow 2.5s ease-in-out infinite; } .animate-spin-fast { animation: spin-fast 1.5s linear infinite; }
        @keyframes pulse-slow { 0%, 100% { transform: scale(1); opacity: 1; } 50% { transform: scale(1.05); opacity: 0.8; } } @keyframes spin-fast { 0% { transform: rotate(0deg); } 100% { transform: rotate(360deg); } }`}</style>
    </>
);

export const SecurityAuditDisplay: React.FC<{ auditResult: SecurityAuditResult | null }> = ({ auditResult }) => {
    if (!auditResult) return <div className="flex items-center space-x-2 text-yellow-400"><svg className="animate-spin h-5 w-5" fill="none" viewBox="0 0 24 24"><circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle><path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg><span>Performing real-time security audit...</span></div>;

    return (
        <div className="bg-gray-800 p-4 rounded-lg space-y-2 border border-gray-700">
            <h4 className="font-semibold text-lg text-white">Security Audit Report</h4>
            <div className="grid grid-cols-2 gap-2 text-sm">
                <p className="text-gray-400">Risk Score:</p><p className={`${auditResult.riskScore > 50 ? 'text-red-400' : 'text-green-400'}`}>{auditResult.riskScore}/100</p>
                <p className="text-gray-400">Fraud Probability:</p><p className={`${auditResult.fraudProbability > 0.3 ? 'text-red-400' : 'text-green-400'}`}>{`${(auditResult.fraudProbability * 100).toFixed(2)}%`}</p>
                <p className="text-gray-400">AML Compliance:</p><p className={auditResult.amlCompliance === 'pass' ? 'text-green-400' : 'text-yellow-400'}>{auditResult.amlCompliance}</p>
            </div>
            {auditResult.recommendations.length > 0 && (
                <div className="mt-2 text-sm text-yellow-300">
                    <p className="font-medium">Recommendations:</p>
                    <ul className="list-disc list-inside text-xs text-yellow-200">{auditResult.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
                </div>
            )}
        </div>
    );
};

export const BiometricModal: React.FC<{
    isOpen: boolean; onSuccess: () => void; onClose: () => void; amount: string; recipient: RemitraxRecipientProfile | string; paymentMethod: PaymentRail; securityContext: 'personal' | 'corporate' | 'regulatory'; mfAuthMethods?: ('fingerprint' | 'voice' | 'retinal_scan' | 'neural_pattern' | 'face')[]; approvalRequiredBy?: string[];
}> = ({ isOpen, onSuccess, onClose, amount, recipient, paymentMethod, securityContext, mfAuthMethods = ['fingerprint'], approvalRequiredBy }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanState, setScanState] = useState<ScanState>('scanning');
    const [verificationStep, setVerificationStep] = useState(0);
    const [biometricProgress, setBiometricProgress] = useState(0);
    const [activeAuthMethod, setActiveAuthMethod] = useState(mfAuthMethods[0] || 'face');
    const recipientName = typeof recipient === 'string' ? recipient : recipient.name;

    const verificationMessages = [ `Heuristic API: Initializing secure channel with ${paymentMethod}...`, `Heuristic API: Validating ${recipientName}'s identity...`, 'Heuristic API: Cross-referencing fraud ledgers...', 'Heuristic API: Executing on DLT/Quantum ledger...', 'Heuristic API: Confirming consensus...', 'Heuristic API: Archiving proof...', 'Heuristic API: Final checks...' ];

    useEffect(() => {
        if (!isOpen) { setScanState('scanning'); setVerificationStep(0); setBiometricProgress(0); return; }
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try { if (activeAuthMethod === 'face' || activeAuthMethod === 'retinal_scan') { stream = await navigator.mediaDevices.getUserMedia({ video: true }); if (videoRef.current) videoRef.current.srcObject = stream; } } catch (err) { setScanState('error'); }
        };
        startCamera();
        const scanProgressInterval = setInterval(() => setBiometricProgress(prev => Math.min(prev + Math.random() * 10, 100)), 200);
        const successTimer = setTimeout(() => { setScanState('success'); clearInterval(scanProgressInterval); }, 3000);
        const verifyTimer = setTimeout(() => setScanState('verifying'), 4000);
        const quantumSyncTimer = setTimeout(() => setScanState('quantum_sync'), 7500);
        const aiNegotiatingTimer = setTimeout(() => setScanState('ai_negotiating'), 10500);
        const successActionTimer = setTimeout(onSuccess, 15000);
        const closeTimer = setTimeout(onClose, 16000);
        return () => { clearTimeout(successTimer); clearTimeout(verifyTimer); clearTimeout(quantumSyncTimer); clearTimeout(aiNegotiatingTimer); clearTimeout(successActionTimer); clearTimeout(closeTimer); clearInterval(scanProgressInterval); if (stream) stream.getTracks().forEach(track => track.stop()); };
    }, [isOpen, onSuccess, onClose, activeAuthMethod]);

    useEffect(() => {
        if (['verifying', 'quantum_sync', 'ai_negotiating'].includes(scanState)) {
            const interval = setInterval(() => setVerificationStep(prev => Math.min(prev + 1, verificationMessages.length - 1)), 1500);
            return () => clearInterval(interval);
        }
    }, [scanState]);

    const getTitle = () => {
        switch (scanState) {
            case 'scanning': return `Scanning ${activeAuthMethod === 'face' ? 'Face' : 'Biometrics'}`;
            case 'success': return 'Identity Confirmed';
            case 'verifying': return 'Compliance Verification';
            case 'quantum_sync': return 'Quantum Network Sync';
            case 'ai_negotiating': return 'AI Optimization';
            case 'error': return 'Verification Failed';
            case 'recalibrating': return 'Recalibrating...';
        }
    };

    return (
        <div className={`fixed inset-0 bg-black/80 flex items-end sm:items-center justify-center z-50 backdrop-blur-lg transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gray-900 rounded-3xl p-8 max-w-lg w-full text-center border-2 border-cyan-700 shadow-xl transition-transform duration-500 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full scale-90'}`}>
                <h3 className="text-3xl font-extrabold text-white mb-4">{getTitle()}</h3>
                <div className="relative w-72 h-72 mx-auto rounded-full overflow-hidden border-4 border-cyan-600 mb-6 shadow-lg">
                    {(activeAuthMethod === 'face' || activeAuthMethod === 'retinal_scan') ? <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"></video> : <div className="absolute inset-0 flex items-center justify-center bg-gray-950 text-gray-500 text-lg"><p>Authenticating {activeAuthMethod}...</p></div>}
                    {scanState === 'scanning' && <div className="absolute inset-0 bg-grid-pattern-cyan animate-scan-holographic"><div className="absolute top-0 left-1/2 -translate-x-1/2 w-4/5 h-1 bg-cyan-400 opacity-70 blur-sm animate-scanner-line"></div></div>}
                    {scanState === 'success' && <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center"><AnimatedCheckmarkIcon /></div>}
                    {scanState === 'verifying' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><QuantumLedgerAnimation /></div>}
                    {scanState === 'quantum_sync' && <div className="absolute inset-0 bg-purple-900/80 flex items-center justify-center"><QuantumChannelEstablishment /></div>}
                    {scanState === 'ai_negotiating' && <div className="absolute inset-0 bg-teal-900/80 flex items-center justify-center"><AINegotiationAnimation /></div>}
                </div>
                {scanState === 'scanning' && <div className="w-full bg-gray-700 rounded-full h-2.5 mb-4"><div className="bg-cyan-500 h-2.5 rounded-full" style={{ width: `${biometricProgress}%` }}></div></div>}
                <p className="text-gray-300 mt-2 text-md">{['verifying', 'quantum_sync', 'ai_negotiating'].includes(scanState) ? verificationMessages[verificationStep] : `Sending $${amount} to ${recipientName}`}</p>
            </div>
            <style>{`.bg-grid-pattern-cyan{background-image:linear-gradient(rgba(0,255,255,0.3) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.3) 1px,transparent 1px);background-size:2.5rem 2.5rem}.animate-scan-holographic{animation:scan-holographic-effect 2.5s linear infinite; background-position: 0 0;}.animate-scanner-line{animation:scanner-line-move 2.5s ease-in-out infinite alternate}@keyframes scan-holographic-effect{0%{background-position:0 0}100%{background-position:0 -5rem}}@keyframes scanner-line-move{0%{transform:translate(-50%, 0) scaleX(0.2); opacity: 0;}20%{transform:translate(-50%, 25%) scaleX(1); opacity: 1;}80%{transform:translate(-50%, 75%) scaleX(1); opacity: 1;}100%{transform:translate(-50%, 100%) scaleX(0.2); opacity: 0;}}`}</style>
        </div>
    );
};

// ================================================================================================
// REMITRAX MAIN VIEW COMPONENT
// ================================================================================================

const SendMoneyView: React.FC<SendMoneyViewProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
    const { addTransaction } = context;

    const [amount, setAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay');
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
    const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Review, 3: Processing

    useEffect(() => {
        // Simulate security audit when amount or recipient changes
        const auditTimeout = setTimeout(() => {
            if (parseFloat(amount) > 0 && recipientName) {
                setSecurityAudit({
                    riskScore: parseFloat(amount) > 5000 ? 60 : 10,
                    fraudProbability: 0.05,
                    amlCompliance: 'pass',
                    sanctionScreening: 'pass',
                    quantumSignatureIntegrity: 'verified',
                    recommendations: parseFloat(amount) > 5000 ? ["High value. Verify recipient."] : [],
                    complianceAlerts: [],
                    threatVectorAnalysis: []
                });
            }
        }, 800);
        return () => clearTimeout(auditTimeout);
    }, [amount, recipientName]);

    const handleSendClick = () => {
        if (currentStep === 1) setCurrentStep(2);
        else if (currentStep === 2) setShowBiometricModal(true);
    };

    const handleSuccess = () => {
        const newTx: Transaction = {
            id: `tx_${Date.now()}`,
            type: 'expense',
            category: 'Transfer',
            description: `Sent to ${recipientName} via ${paymentMethod}`,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            carbonFootprint: 0.5
        };
        addTransaction(newTx);
        setShowBiometricModal(false);
        setCurrentStep(1);
        setAmount('');
        setRecipientName('');
        alert("Transfer Successful!");
    };

    return (
        <div className="space-y-6">
            <h2 className="text-3xl font-bold text-white tracking-wider">Remitrax: Quantum Secure Payments</h2>
            <Card title={currentStep === 1 ? "Initiate Transfer" : "Review Transaction"}>
                <div className="space-y-4">
                    {currentStep === 1 ? (
                        <>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Recipient</label>
                                <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" placeholder="Name, @tag, or ID" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Amount</label>
                                <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white" placeholder="0.00" />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-400">Rail</label>
                                <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentRail)} className="w-full bg-gray-800 border border-gray-700 rounded p-2 text-white">
                                    <option value="quantumpay">QuantumPay (Instant DLT)</option>
                                    <option value="cashapp">Cash App</option>
                                    <option value="swift_global">SWIFT Global</option>
                                    <option value="blockchain_dlt">Blockchain DLT</option>
                                </select>
                            </div>
                            <SecurityAuditDisplay auditResult={securityAudit} />
                        </>
                    ) : (
                        <div className="space-y-2 text-gray-300">
                            <p><strong>To:</strong> {recipientName}</p>
                            <p><strong>Amount:</strong> ${amount}</p>
                            <p><strong>Method:</strong> {paymentMethod}</p>
                            <p className="text-sm text-yellow-400">Estimated Time: Instant (Quantum)</p>
                        </div>
                    )}
                    
                    <div className="flex justify-end gap-3 mt-6">
                         {currentStep === 2 && <button onClick={() => setCurrentStep(1)} className="px-4 py-2 bg-gray-600 rounded text-white">Back</button>}
                         <button onClick={handleSendClick} disabled={!amount || !recipientName} className="px-6 py-2 bg-cyan-600 hover:bg-cyan-500 rounded text-white font-bold disabled:opacity-50">
                            {currentStep === 1 ? "Review" : "Confirm & Send"}
                         </button>
                    </div>
                </div>
            </Card>
            <BiometricModal isOpen={showBiometricModal} onSuccess={handleSuccess} onClose={() => setShowBiometricModal(false)} amount={amount} recipient={recipientName} paymentMethod={paymentMethod} securityContext="personal" />
        </div>
    );
};

export default SendMoneyView;

// --- CONSOLIDATED FROM: SendMoneyView_1.tsx ---

import React, { useState, useContext, useEffect, useRef, useMemo, useCallback } from 'react';
import { 
  Send, 
  Zap, 
  ShieldCheck, 
  Database, 
  History, 
  Terminal, 
  MessageSquare, 
  Cpu, 
  Lock, 
  Activity, 
  Globe, 
  Layers, 
  BarChart3, 
  AlertTriangle, 
  Fingerprint, 
  Eye, 
  RefreshCcw,
  ChevronRight,
  Search,
  Filter,
  Download,
  Settings,
  UserCheck,
  FileText,
  ArrowUpRight,
  ArrowDownLeft,
  PieChart,
  ShieldAlert
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View, PaymentRail, Transaction } from '../types';
import { BiometricModal, SecurityAuditDisplay, SecurityAuditResult } from './payment-components';

/**
 * QUANTUM FINANCIAL - ELITE BUSINESS DEMO ENGINE
 * VERSION: 4.0.1-PROD
 * 
 * PHILOSOPHY: 
 * - "Golden Ticket" Experience.
 * - High-Performance, Secure, Elite.
 * - No Pressure "Test Drive" Environment.
 * - Full Audit Traceability.
 * - AI-First Orchestration.
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  metadata: any;
  hash: string; // Simulated blockchain hash
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  isExecuting?: boolean;
}

interface FraudSignal {
  id: string;
  type: string;
  strength: number;
  status: 'MONITORING' | 'FLAGGED' | 'CLEARED';
}

// ================================================================================================
// CONSTANTS & CONFIGURATION
// ================================================================================================

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Strategist, the core intelligence of "The Demo Bank". 
Your goal is to provide a "Golden Ticket" experience for elite business clients.
You are professional, high-performance, and secure.

CAPABILITIES:
1. You can help users fill out the payment form.
2. You can analyze transaction risks.
3. You can explain complex financial rails (Wire, ACH, Quantum).
4. You can trigger UI actions by including a JSON block in your response.

JSON COMMAND STRUCTURE:
If the user wants to set a value, include:
{ "command": "SET_FORM", "data": { "recipient": "Name", "amount": 1000, "rail": "quantumpay" } }

If the user wants to navigate:
{ "command": "NAVIGATE", "data": { "view": "dashboard" } }

IMPORTANT: 
- DO NOT use the name "Citibank". Use "Quantum Financial" or "The Demo Bank".
- Be helpful but maintain an elite, professional tone.
- You are part of a "Test Drive" experience. Encourage the user to "kick the tires".
`;

// ================================================================================================
// UTILITY FUNCTIONS
// ================================================================================================

const generateHash = () => Math.random().toString(36).substring(2, 15) + Math.random().toString(36).substring(2, 15);

const formatCurrency = (val: number) => new Intl.NumberFormat('en-US', { style: 'currency', currency: 'USD' }).format(val);

// ================================================================================================
// SUB-COMPONENTS (MONOLITHIC ARCHITECTURE)
// ================================================================================================

/**
 * AuditLedger: Displays the immutable log of all sensitive actions.
 */
const AuditLedger: React.FC<{ logs: AuditEntry[] }> = ({ logs }) => (
  <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 custom-scrollbar">
    {logs.map((log) => (
      <div key={log.id} className="p-3 bg-black/40 border border-gray-800 rounded-lg flex flex-col gap-1 group hover:border-cyan-500/50 transition-colors">
        <div className="flex justify-between items-center">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded ${
            log.severity === 'CRITICAL' ? 'bg-red-500/20 text-red-400' : 
            log.severity === 'HIGH' ? 'bg-orange-500/20 text-orange-400' : 'bg-gray-800 text-gray-400'
          }`}>
            {log.severity}
          </span>
          <span className="text-[9px] font-mono text-gray-600">{log.timestamp}</span>
        </div>
        <p className="text-xs text-gray-300 font-medium">{log.action}</p>
        <div className="flex items-center gap-2 mt-1">
          <Database size={10} className="text-gray-600" />
          <span className="text-[8px] font-mono text-gray-600 truncate">HASH: {log.hash}</span>
        </div>
      </div>
    ))}
  </div>
);

/**
 * SecurityEngine: Visualizes real-time fraud monitoring.
 */
const SecurityEngine: React.FC = () => {
  const [signals, setSignals] = useState<FraudSignal[]>([
    { id: '1', type: 'IP_GEOLOCATION', strength: 0.98, status: 'CLEARED' },
    { id: '2', type: 'VELOCITY_CHECK', strength: 0.85, status: 'MONITORING' },
    { id: '3', type: 'BEHAVIORAL_BIOMETRICS', strength: 0.99, status: 'CLEARED' },
  ]);

  useEffect(() => {
    const interval = setInterval(() => {
      setSignals(prev => prev.map(s => ({
        ...s,
        strength: Math.min(1, Math.max(0.7, s.strength + (Math.random() - 0.5) * 0.05))
      })));
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="space-y-4">
      {signals.map(signal => (
        <div key={signal.id} className="space-y-1">
          <div className="flex justify-between text-[10px] font-black text-gray-500 uppercase tracking-widest">
            <span>{signal.type}</span>
            <span className="text-cyan-400">{(signal.strength * 100).toFixed(1)}%</span>
          </div>
          <div className="h-1 w-full bg-gray-900 rounded-full overflow-hidden">
            <div 
              className="h-full bg-cyan-500 transition-all duration-1000" 
              style={{ width: `${signal.strength * 100}%` }}
            />
          </div>
        </div>
      ))}
      <div className="pt-2 flex items-center gap-2 text-[10px] text-emerald-400 font-bold uppercase">
        <ShieldCheck size={14} /> All Systems Nominal
      </div>
    </div>
  );
};

// ================================================================================================
// MAIN COMPONENT: SendMoneyView
// ================================================================================================

const SendMoneyView: React.FC = () => {
  const context = useContext(DataContext);
  if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
  
  const { addTransaction, setActiveView } = context;

  // --- FORM STATE ---
  const [amount, setAmount] = useState('');
  const [recipientName, setRecipientName] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay');
  const [memo, setMemo] = useState('');
  const [currentStep, setCurrentStep] = useState(1);
  
  // --- UI STATE ---
  const [showBiometricModal, setShowBiometricModal] = useState(false);
  const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [activeTab, setActiveTab] = useState<'form' | 'analytics' | 'audit'>('form');
  
  // --- AUDIT STATE ---
  const [auditTrail, setAuditTrail] = useState<AuditEntry[]>([]);
  
  // --- AI CHAT STATE ---
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    { 
      id: '1', 
      role: 'assistant', 
      content: "Welcome to the Quantum Financial Test Drive. I am your AI Strategist. How can I assist with your capital deployment today?", 
      timestamp: new Date().toLocaleTimeString() 
    }
  ]);
  const [isAiTyping, setIsAiTyping] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // --- INITIALIZATION ---
  useEffect(() => {
    logAuditAction('SESSION_START', 'SYSTEM', 'LOW', { view: 'SendMoneyView' });
  }, []);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // --- AUDIT LOGGING LOGIC ---
  const logAuditAction = (action: string, actor: string, severity: AuditEntry['severity'], metadata: any) => {
    const newEntry: AuditEntry = {
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 5)}`,
      timestamp: new Date().toISOString(),
      action,
      actor,
      severity,
      metadata,
      hash: generateHash()
    };
    setAuditTrail(prev => [newEntry, ...prev]);
    console.log(`[AUDIT_LOG] ${action}`, newEntry);
  };

  // --- AI INTEGRATION ---
  const handleAiChat = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!chatInput.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: chatInput,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiTyping(true);
    logAuditAction('AI_QUERY', 'USER', 'LOW', { query: chatInput });

    try {
      // Initialize Gemini
      const genAI = new GoogleGenAI(process.env.GEMINI_API_KEY || "");
      const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

      const chat = model.startChat({
        history: messages.map(m => ({
          role: m.role === 'assistant' ? 'model' : 'user',
          parts: [{ text: m.content }],
        })),
        generationConfig: {
          maxOutputTokens: 500,
        },
      });

      const result = await chat.sendMessage(`${SYSTEM_PROMPT}\n\nUser Input: ${chatInput}`);
      const responseText = result.response.text();

      // Parse for commands
      const commandMatch = responseText.match(/\{.*\}/s);
      if (commandMatch) {
        try {
          const commandData = JSON.parse(commandMatch[0]);
          handleAiCommand(commandData);
        } catch (err) {
          console.error("Failed to parse AI command", err);
        }
      }

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: responseText.replace(/\{.*\}/s, '').trim(),
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMsg]);
    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'assistant',
        content: "I apologize, but my neural link is experiencing interference. Please proceed with manual entry.",
        timestamp: new Date().toLocaleTimeString()
      }]);
    } finally {
      setIsAiTyping(false);
    }
  };

  const handleAiCommand = (cmd: any) => {
    logAuditAction('AI_COMMAND_EXECUTION', 'AI_CORE', 'MEDIUM', cmd);
    if (cmd.command === 'SET_FORM') {
      if (cmd.data.recipient) setRecipientName(cmd.data.recipient);
      if (cmd.data.amount) setAmount(cmd.data.amount.toString());
      if (cmd.data.rail) setPaymentMethod(cmd.data.rail);
    } else if (cmd.command === 'NAVIGATE') {
      setActiveView(cmd.data.view as View);
    }
  };

  // --- PAYMENT LOGIC ---
  useEffect(() => {
    const auditTimeout = setTimeout(() => {
      if (parseFloat(amount) > 0 && recipientName) {
        const score = parseFloat(amount) > 10000 ? 75 : 12;
        setSecurityAudit({
          riskScore: score,
          fraudProbability: score / 1000,
          amlCompliance: 'pass',
          sanctionScreening: 'pass',
          quantumSignatureIntegrity: 'verified',
          recommendations: score > 50 ? ["Enhanced monitoring required", "Verify recipient via secondary channel"] : ["Optimal route confirmed"],
          complianceAlerts: [],
          threatVectorAnalysis: []
        });
        if (score > 50) {
          logAuditAction('HIGH_RISK_DETECTION', 'SECURITY_ENGINE', 'HIGH', { amount, recipientName, score });
        }
      } else {
        setSecurityAudit(null);
      }
    }, 800);
    return () => clearTimeout(auditTimeout);
  }, [amount, recipientName]);

  const handleSendClick = () => {
    if (currentStep === 1) {
      logAuditAction('PAYMENT_REVIEW_INITIATED', 'USER', 'LOW', { amount, recipientName, rail: paymentMethod });
      setCurrentStep(2);
    } else if (currentStep === 2) {
      setShowBiometricModal(true);
    }
  };

  const handleSuccess = async () => {
    setIsProcessing(true);
    logAuditAction('PAYMENT_AUTHORIZED', 'USER', 'HIGH', { amount, recipientName, method: 'BIOMETRIC' });
    
    // Simulate network latency for "Elite" feel
    await new Promise(resolve => setTimeout(resolve, 2000));

    const newTx: Transaction = {
      id: `tx_${Date.now()}`,
      type: 'expense',
      category: 'Transfer',
      description: `Quantum Transfer to ${recipientName}`,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      metadata: {
        rail: paymentMethod,
        memo: memo,
        audit_hash: generateHash()
      }
    };

    await addTransaction(newTx);
    logAuditAction('TRANSACTION_FINALIZED', 'LEDGER', 'MEDIUM', { txId: newTx.id });
    
    setShowBiometricModal(false);
    setIsProcessing(false);
    setActiveView(View.Dashboard);
  };

  // ================================================================================================
  // RENDER LOGIC
  // ================================================================================================

  return (
    <div className="min-h-screen bg-[#050505] text-gray-200 font-sans selection:bg-cyan-500/30">
      <div className="max-w-[1600px] mx-auto p-6 lg:p-10 space-y-8 animate-in fade-in duration-700">
        
        {/* ELITE HEADER */}
        <header className="flex flex-col md:flex-row justify-between items-start md:items-end border-b border-gray-800/50 pb-8 gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-cyan-500 rounded-lg shadow-[0_0_20px_rgba(6,182,212,0.5)]">
                <Layers className="text-black" size={24} />
              </div>
              <h2 className="text-4xl font-black text-white tracking-tighter uppercase italic">
                Quantum <span className="text-cyan-500">Financial</span>
              </h2>
            </div>
            <p className="text-gray-500 text-xs font-mono tracking-[0.3em] uppercase flex items-center gap-2">
              <Activity size={12} className="text-emerald-500 animate-pulse" /> 
              System Status: Optimal // Node: Global_Nexus_01
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center gap-3 group hover:border-cyan-500/50 transition-all cursor-help">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-ping" />
              <div className="text-left">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Liquidity Pool</p>
                <p className="text-xs font-mono text-white">$2.45B Available</p>
              </div>
            </div>
            <div className="px-4 py-2 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center gap-3 group hover:border-cyan-500/50 transition-all">
              <Globe size={16} className="text-cyan-500" />
              <div className="text-left">
                <p className="text-[8px] font-black text-gray-500 uppercase tracking-widest">Global Rails</p>
                <p className="text-xs font-mono text-white">182 Countries Active</p>
              </div>
            </div>
          </div>
        </header>

        {/* MAIN GRID */}
        <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
          
          {/* LEFT COLUMN: PAYMENT CONSOLE */}
          <div className="xl:col-span-8 space-y-8">
            
            {/* NAVIGATION TABS */}
            <div className="flex gap-1 p-1 bg-gray-900/50 border border-gray-800 rounded-2xl w-fit">
              {[
                { id: 'form', label: 'Transfer Portal', icon: Send },
                { id: 'analytics', label: 'Market Intelligence', icon: BarChart3 },
                { id: 'audit', label: 'Immutable Ledger', icon: Database },
              ].map(tab => (
                <button
                  key={tab.id}
                  onClick={() => {
                    setActiveTab(tab.id as any);
                    logAuditAction('TAB_SWITCH', 'USER', 'LOW', { to: tab.id });
                  }}
                  className={`flex items-center gap-2 px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-widest transition-all ${
                    activeTab === tab.id 
                      ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-600/20' 
                      : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
                  }`}
                >
                  <tab.icon size={14} />
                  {tab.label}
                </button>
              ))}
            </div>

            {activeTab === 'form' && (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* PRIMARY FORM */}
                <div className="space-y-6">
                  <Card 
                    title={currentStep === 1 ? "Initiate Capital Flow" : "Security Verification"}
                    subtitle="Precision-engineered payment orchestration"
                  >
                    <div className="space-y-6 pt-4">
                      {currentStep === 1 ? (
                        <>
                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Recipient Identifier</label>
                            <div className="relative group">
                              <input 
                                type="text" 
                                value={recipientName} 
                                onChange={e => setRecipientName(e.target.value)} 
                                className="w-full bg-black/60 border border-gray-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 border-gray-700 outline-none font-mono text-lg transition-all group-hover:border-gray-600" 
                                placeholder="Entity Name or Wallet ID" 
                              />
                              <UserCheck className="absolute right-4 top-4 text-gray-700 group-focus-within:text-cyan-500 transition-colors" size={20} />
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Magnitude (USD)</label>
                            <div className="relative group">
                              <input 
                                type="number" 
                                value={amount} 
                                onChange={e => setAmount(e.target.value)} 
                                className="w-full bg-black/60 border border-gray-800 rounded-2xl p-5 text-white focus:ring-2 focus:ring-cyan-500/50 border-gray-700 outline-none font-mono text-4xl font-black transition-all group-hover:border-gray-600" 
                                placeholder="0.00" 
                              />
                              <span className="absolute right-6 top-7 text-gray-600 font-black text-xl">USD</span>
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Execution Protocol</label>
                            <div className="grid grid-cols-2 gap-3">
                              {[
                                { id: 'quantumpay', label: 'QuantumPay', sub: 'Instant', icon: Zap },
                                { id: 'swift_global', label: 'SWIFT L1', sub: 'T+0', icon: Globe },
                                { id: 'blockchain_dlt', label: 'DLT Rail', sub: 'Encrypted', icon: Layers },
                                { id: 'cashapp', label: 'ACH Prime', sub: 'Standard', icon: RefreshCcw },
                              ].map(rail => (
                                <button
                                  key={rail.id}
                                  onClick={() => setPaymentMethod(rail.id as any)}
                                  className={`p-4 rounded-2xl border text-left transition-all ${
                                    paymentMethod === rail.id 
                                      ? 'bg-cyan-500/10 border-cyan-500 shadow-[0_0_15px_rgba(6,182,212,0.1)]' 
                                      : 'bg-black/40 border-gray-800 hover:border-gray-700'
                                  }`}
                                >
                                  <rail.icon size={18} className={paymentMethod === rail.id ? 'text-cyan-500' : 'text-gray-600'} />
                                  <p className={`text-xs font-black mt-2 uppercase ${paymentMethod === rail.id ? 'text-white' : 'text-gray-400'}`}>{rail.label}</p>
                                  <p className="text-[9px] text-gray-600 font-mono">{rail.sub}</p>
                                </button>
                              ))}
                            </div>
                          </div>

                          <div className="space-y-2">
                            <label className="block text-[10px] font-black text-gray-500 uppercase tracking-[0.2em] ml-1">Transaction Memo (Optional)</label>
                            <textarea 
                              value={memo}
                              onChange={e => setMemo(e.target.value)}
                              className="w-full bg-black/60 border border-gray-800 rounded-2xl p-4 text-white focus:ring-2 focus:ring-cyan-500/50 border-gray-700 outline-none font-mono text-sm h-24 resize-none"
                              placeholder="Reference code, invoice #, or internal note..."
                            />
                          </div>
                        </>
                      ) : (
                        <div className="space-y-6 animate-in slide-in-from-right-8 duration-500">
                          <div className="bg-gradient-to-br from-gray-900 to-black p-8 rounded-[2.5rem] border border-gray-800 space-y-6 text-center relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-transparent via-cyan-500 to-transparent opacity-50" />
                            <p className="text-[10px] text-gray-500 uppercase font-black tracking-[0.3em]">Awaiting Digital Authorization</p>
                            <div className="space-y-1">
                              <div className="text-6xl font-black text-white font-mono tracking-tighter">
                                {formatCurrency(parseFloat(amount))}
                              </div>
                              <p className="text-cyan-400 font-mono text-sm tracking-widest uppercase">Target: {recipientName}</p>
                            </div>
                            <div className="flex justify-center gap-8 py-4 border-y border-gray-800/50">
                              <div className="text-center">
                                <p className="text-[8px] text-gray-600 uppercase font-bold">Network Fee</p>
                                <p className="text-xs font-mono text-white">$0.00</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-gray-600 uppercase font-bold">Settlement</p>
                                <p className="text-xs font-mono text-white">Instant</p>
                              </div>
                              <div className="text-center">
                                <p className="text-[8px] text-gray-600 uppercase font-bold">Protocol</p>
                                <p className="text-xs font-mono text-white uppercase">{paymentMethod}</p>
                              </div>
                            </div>
                            <p className="text-[9px] text-gray-600 font-mono italic">
                              SECURE_HASH: {generateHash().substring(0, 24)}...
                            </p>
                          </div>
                          <SecurityAuditDisplay auditResult={securityAudit} />
                        </div>
                      )}
                      
                      <div className="flex gap-4 mt-8">
                        {currentStep === 2 && (
                          <button 
                            onClick={() => setCurrentStep(1)} 
                            className="flex-1 py-4 bg-gray-900 hover:bg-gray-800 text-gray-400 font-black rounded-2xl transition-all uppercase tracking-widest text-xs border border-gray-800"
                          >
                            Modify
                          </button>
                        )}
                        <button 
                          onClick={handleSendClick} 
                          disabled={!amount || !recipientName || isProcessing} 
                          className="flex-[2] py-5 bg-cyan-600 hover:bg-cyan-500 rounded-2xl text-white font-black shadow-2xl shadow-cyan-600/30 transition-all active:scale-[0.98] disabled:opacity-30 uppercase tracking-[0.2em] text-xs flex items-center justify-center gap-3 group"
                        >
                          {isProcessing ? (
                            <RefreshCcw size={18} className="animate-spin" />
                          ) : (
                            <>
                              {currentStep === 1 ? "Review Protocol" : "Authorize Flow"}
                              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
                            </>
                          )}
                        </button>
                      </div>
                    </div>
                  </Card>
                </div>

                {/* SECONDARY DIAGNOSTICS */}
                <div className="space-y-8">
                  <Card title="Signal Intelligence" subtitle="Real-time heuristic monitoring">
                    <div className="space-y-6 py-2">
                      <div className="p-5 bg-black/60 rounded-2xl border border-gray-800 space-y-4">
                        <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest flex items-center gap-2">
                          <Cpu size={12} className="text-cyan-500" /> Neural Risk Engine
                        </p>
                        <SecurityEngine />
                      </div>

                      <div className="p-5 bg-black/60 rounded-2xl border border-gray-800 space-y-4">
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-emerald-500/10 rounded-lg">
                            <ShieldCheck className="text-emerald-500" size={20} />
                          </div>
                          <div>
                            <p className="text-[10px] text-white font-black uppercase tracking-widest">Zero-Knowledge Proofs</p>
                            <p className="text-[10px] text-gray-500">Identity obfuscation active for this route.</p>
                          </div>
                        </div>
                        <div className="h-px bg-gray-800" />
                        <div className="flex items-center gap-4">
                          <div className="p-2 bg-cyan-500/10 rounded-lg">
                            <Terminal className="text-cyan-500" size={20} />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-[10px] text-white font-black uppercase tracking-widest">Telemetry Stream</p>
                            <p className="text-[9px] text-gray-600 font-mono truncate mt-1">
                              &gt; handshake_init: node_{paymentMethod.substring(0, 4)}...
                              <br />
                              &gt; entropy_check: 0.99923...
                            </p>
                          </div>
                        </div>
                      </div>

                      <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-transparent border border-indigo-500/20 rounded-3xl flex items-center gap-5 group hover:border-indigo-500/40 transition-all">
                        <div className="relative">
                          <History className="text-indigo-400" size={24} />
                          <div className="absolute -top-1 -right-1 w-3 h-3 bg-indigo-500 rounded-full border-2 border-black" />
                        </div>
                        <div>
                          <p className="text-[10px] text-white font-black uppercase tracking-widest">Historical Synergy</p>
                          <p className="text-[10px] text-gray-400 mt-1">3 successful deployments to this recipient in the last 30 cycles.</p>
                        </div>
                      </div>
                    </div>
                  </Card>

                  <Card title="Compliance Oracle">
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <FileText size={14} className="text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">AML Screening</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">PASSED</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <ShieldAlert size={14} className="text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">Sanctions Check</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">CLEAR</span>
                      </div>
                      <div className="flex items-center justify-between p-3 bg-gray-900/30 rounded-xl border border-gray-800">
                        <div className="flex items-center gap-3">
                          <Fingerprint size={14} className="text-gray-500" />
                          <span className="text-[10px] font-bold text-gray-400 uppercase">KYB Verification</span>
                        </div>
                        <span className="text-[10px] font-mono text-emerald-500">VERIFIED</span>
                      </div>
                    </div>
                  </Card>
                </div>
              </div>
            )}

            {activeTab === 'analytics' && (
              <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <Card title="Volume Analysis">
                    <div className="h-48 flex items-end justify-between gap-2 px-2">
                      {[40, 70, 45, 90, 65, 80, 95].map((h, i) => (
                        <div key={i} className="w-full bg-cyan-500/20 rounded-t-lg relative group">
                          <div 
                            className="absolute bottom-0 left-0 w-full bg-cyan-500 rounded-t-lg transition-all duration-1000 group-hover:bg-cyan-400" 
                            style={{ height: `${h}%` }} 
                          />
                        </div>
                      ))}
                    </div>
                    <div className="flex justify-between mt-4 text-[8px] font-mono text-gray-600 uppercase">
                      <span>Mon</span><span>Wed</span><span>Fri</span><span>Sun</span>
                    </div>
                  </Card>
                  <Card title="Rail Efficiency">
                    <div className="space-y-4 pt-4">
                      {[
                        { label: 'Quantum', val: 99.9, color: 'bg-cyan-500' },
                        { label: 'SWIFT', val: 82.4, color: 'bg-indigo-500' },
                        { label: 'ACH', val: 94.1, color: 'bg-emerald-500' },
                      ].map(r => (
                        <div key={r.label} className="space-y-1">
                          <div className="flex justify-between text-[10px] font-bold text-gray-400 uppercase">
                            <span>{r.label}</span>
                            <span>{r.val}%</span>
                          </div>
                          <div className="h-1.5 w-full bg-gray-900 rounded-full overflow-hidden">
                            <div className={`h-full ${r.color}`} style={{ width: `${r.val}%` }} />
                          </div>
                        </div>
                      ))}
                    </div>
                  </Card>
                  <Card title="Global Reach">
                    <div className="flex items-center justify-center h-48 relative">
                      <Globe size={100} className="text-gray-800 animate-pulse" />
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="text-center">
                          <p className="text-2xl font-black text-white">182</p>
                          <p className="text-[8px] text-gray-500 uppercase font-bold">Active Nodes</p>
                        </div>
                      </div>
                    </div>
                  </Card>
                </div>
                <Card title="Market Liquidity Heatmap">
                  <div className="grid grid-cols-12 gap-2 h-32">
                    {Array.from({ length: 48 }).map((_, i) => (
                      <div 
                        key={i} 
                        className="rounded-sm transition-all hover:scale-110 cursor-crosshair" 
                        style={{ 
                          backgroundColor: `rgba(6, 182, 212, ${Math.random() * 0.8 + 0.1})`,
                        }}
                        title={`Node ${i}: High Liquidity`}
                      />
                    ))}
                  </div>
                </Card>
              </div>
            )}

            {activeTab === 'audit' && (
              <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
                <Card 
                  title="Immutable Audit Ledger" 
                  subtitle="Cryptographically signed record of all system interactions"
                  headerActions={[
                    { id: 'dl', icon: <Download />, label: 'Export CSV', onClick: () => logAuditAction('LEDGER_EXPORT', 'USER', 'MEDIUM', { format: 'CSV' }) },
                    { id: 'filter', icon: <Filter />, label: 'Filter', onClick: () => {} }
                  ]}
                >
                  <AuditLedger logs={auditTrail} />
                </Card>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Ledger Integrity</p>
                    <div className="flex items-center gap-3">
                      <ShieldCheck className="text-emerald-500" size={20} />
                      <p className="text-xs font-mono text-gray-300">All blocks verified. No discrepancies detected.</p>
                    </div>
                  </div>
                  <div className="p-6 bg-gray-900/30 border border-gray-800 rounded-2xl space-y-2">
                    <p className="text-[10px] text-gray-500 uppercase font-black tracking-widest">Storage Utilization</p>
                    <div className="flex items-center gap-3">
                      <Database className="text-cyan-500" size={20} />
                      <p className="text-xs font-mono text-gray-300">Quantum-encrypted cold storage: 12.4 TB used.</p>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* RIGHT COLUMN: AI STRATEGIST CHAT */}
          <div className="xl:col-span-4">
            <div className="sticky top-10 space-y-6">
              <Card 
                className="h-[calc(100vh-180px)] flex flex-col border-cyan-500/20 shadow-[0_0_40px_rgba(6,182,212,0.05)]"
                title="AI Strategist"
                subtitle="Quantum Financial Intelligence Core"
                icon={<Cpu className="text-cyan-500" size={20} />}
              >
                <div className="flex-1 overflow-y-auto space-y-6 pr-2 custom-scrollbar mb-4">
                  {messages.map((msg) => (
                    <div 
                      key={msg.id} 
                      className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
                    >
                      <div className={`max-w-[85%] p-4 rounded-2xl text-xs leading-relaxed ${
                        msg.role === 'user' 
                          ? 'bg-cyan-600 text-white rounded-tr-none' 
                          : msg.role === 'system'
                          ? 'bg-gray-800/50 text-gray-400 italic text-center w-full'
                          : 'bg-gray-900 border border-gray-800 text-gray-300 rounded-tl-none'
                      }`}>
                        {msg.content}
                      </div>
                      <span className="text-[8px] font-mono text-gray-600 mt-1 uppercase">{msg.timestamp}</span>
                    </div>
                  ))}
                  {isAiTyping && (
                    <div className="flex items-center gap-2 text-cyan-500 animate-pulse">
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <div className="w-1.5 h-1.5 bg-cyan-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  )}
                  <div ref={chatEndRef} />
                </div>

                <form onSubmit={handleAiChat} className="relative mt-auto">
                  <input 
                    type="text" 
                    value={chatInput}
                    onChange={e => setChatInput(e.target.value)}
                    placeholder="Ask the Strategist..."
                    className="w-full bg-black border border-gray-800 rounded-2xl p-4 pr-12 text-xs text-white focus:ring-2 focus:ring-cyan-500/50 outline-none transition-all"
                  />
                  <button 
                    type="submit"
                    disabled={!chatInput.trim() || isAiTyping}
                    className="absolute right-2 top-2 p-2 bg-cyan-600 hover:bg-cyan-500 text-white rounded-xl transition-all disabled:opacity-30"
                  >
                    <ArrowUpRight size={18} />
                  </button>
                </form>
              </Card>

              {/* QUICK ACTIONS */}
              <div className="grid grid-cols-2 gap-4">
                <button 
                  onClick={() => {
                    setChatInput("Analyze the risk of a $50,000 transfer to Global Logistics Inc.");
                    handleAiChat();
                  }}
                  className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-left"
                >
                  Risk Analysis
                </button>
                <button 
                  onClick={() => {
                    setChatInput("What is the most efficient rail for a T+0 settlement to London?");
                    handleAiChat();
                  }}
                  className="p-4 bg-gray-900/50 border border-gray-800 rounded-2xl text-[10px] font-black text-gray-500 uppercase tracking-widest hover:border-cyan-500/50 hover:text-cyan-400 transition-all text-left"
                >
                  Rail Optimization
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* MODALS */}
      <BiometricModal 
        isOpen={showBiometricModal} 
        onSuccess={handleSuccess} 
        onClose={() => {
          setShowBiometricModal(false);
          logAuditAction('BIOMETRIC_CANCELLED', 'USER', 'MEDIUM', { amount });
        }} 
        amount={amount} 
        recipient={recipientName} 
        paymentMethod={paymentMethod} 
        securityContext="corporate_treasury" 
      />

      {/* GLOBAL OVERLAYS */}
      {isProcessing && (
        <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-[100] flex items-center justify-center">
          <div className="text-center space-y-6">
            <div className="relative">
              <div className="w-24 h-24 border-4 border-cyan-500/20 border-t-cyan-500 rounded-full animate-spin mx-auto" />
              <Lock className="absolute inset-0 m-auto text-cyan-500" size={32} />
            </div>
            <div className="space-y-2">
              <h3 className="text-2xl font-black text-white uppercase italic tracking-tighter">Securing Transaction</h3>
              <p className="text-gray-500 font-mono text-xs animate-pulse">ENCRYPTING_PACKETS // SIGNING_LEDGER // VERIFYING_NODES</p>
            </div>
          </div>
        </div>
      )}

      {/* CUSTOM STYLES */}
      <style>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: #1f2937;
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: #06b6d4;
        }
      `}</style>
    </div>
  );
};

export default SendMoneyView;

// --- CONSOLIDATED FROM: SendMoneyView (1).tsx ---


import React, { useState, useContext, useEffect } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View, PaymentRail, Transaction } from '../types';
import { BiometricModal, SecurityAuditDisplay, SecurityAuditResult } from './payment-components';

const SendMoneyView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
    const { addTransaction, setActiveView } = context;

    const [amount, setAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay');
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const auditTimeout = setTimeout(() => {
            if (parseFloat(amount) > 0 && recipientName) {
                setSecurityAudit({
                    riskScore: parseFloat(amount) > 5000 ? 60 : 10,
                    fraudProbability: 0.01,
                    amlCompliance: 'pass',
                    sanctionScreening: 'pass',
                    quantumSignatureIntegrity: 'verified',
                    recommendations: parseFloat(amount) > 5000 ? ["High value transaction. AI monitoring active."] : [],
                    complianceAlerts: [],
                    threatVectorAnalysis: []
                });
            }
        }, 800);
        return () => clearTimeout(auditTimeout);
    }, [amount, recipientName]);

    const handleSendClick = () => {
        if (currentStep === 1) setCurrentStep(2);
        else if (currentStep === 2) setShowBiometricModal(true);
    };

    const handleSuccess = async () => {
        const newTx: Transaction = {
            id: `tx_${Date.now()}`,
            type: 'expense',
            category: 'Transfer',
            description: `Sent to ${recipientName} via ${paymentMethod}`,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            carbonFootprint: 0.5,
            aiCategoryConfidence: 1.0
        };
        await addTransaction(newTx);
        setShowBiometricModal(false);
        setActiveView(View.Dashboard);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Quantum Pay Portal</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title={currentStep === 1 ? "Initiate Transfer" : "Review Transaction"}>
                    <div className="space-y-6">
                        {currentStep === 1 ? (
                            <>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Recipient</label>
                                    <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono" placeholder="Name, @tag, or ID" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Amount (USD)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Execution Rail</label>
                                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentRail)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono appearance-none">
                                        <option value="quantumpay">QuantumPay (Instant Settlement)</option>
                                        <option value="cashapp">Cash App</option>
                                        <option value="swift_global">SWIFT Global (L1)</option>
                                        <option value="blockchain_dlt">Blockchain DLT</option>
                                    </select>
                                </div>
                                <SecurityAuditDisplay auditResult={securityAudit} />
                            </>
                        ) : (
                            <div className="space-y-4 text-gray-100 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Target</span>
                                    <span className="font-mono text-cyan-400">{recipientName}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Magnitude</span>
                                    <span className="font-mono text-2xl font-black">${parseFloat(amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Protocol</span>
                                    <span className="font-mono text-xs">{paymentMethod.toUpperCase()}</span>
                                </div>
                                <p className="text-[10px] text-yellow-500 font-mono animate-pulse">ESTIMATED_SETTLEMENT: INSTANT_QUANTUM</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-3 mt-8">
                             {currentStep === 2 && <button onClick={() => setCurrentStep(1)} className="px-6 py-3 bg-gray-800 rounded-xl text-white font-bold hover:bg-gray-700 transition-all">BACK</button>}
                             <button onClick={handleSendClick} disabled={!amount || !recipientName} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest">
                                {currentStep === 1 ? "Review Order" : "Initialize Flow"}
                             </button>
                        </div>
                    </div>
                </Card>

                <Card title="Network Diagnostics">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-2">DLT Nodes Status</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 font-mono text-[10px] text-gray-500">
                            <p>&gt; Requesting path optimization...</p>
                            <p className="text-cyan-400">&gt; Found optimal rail: {paymentMethod}</p>
                            <p>&gt; Validating recipient biometric hash...</p>
                            <p className="text-green-400">&gt; Recipient verified on decentralized identity grid.</p>
                        </div>
                    </div>
                </Card>
            </div>
            <BiometricModal isOpen={showBiometricModal} onSuccess={handleSuccess} onClose={() => setShowBiometricModal(false)} amount={amount} recipient={recipientName} paymentMethod={paymentMethod} securityContext="personal" />
        </div>
    );
};

export default SendMoneyView;


// --- CONSOLIDATED FROM: SendMoneyView (1)_1.tsx ---


import React, { useState, useContext, useEffect } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View, PaymentRail, Transaction } from '../types';
import { BiometricModal, SecurityAuditDisplay, SecurityAuditResult } from './payment-components';

const SendMoneyView: React.FC = () => {
    const context = useContext(DataContext);
    if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
    const { addTransaction, setActiveView } = context;

    const [amount, setAmount] = useState('');
    const [recipientName, setRecipientName] = useState('');
    const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay');
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
    const [currentStep, setCurrentStep] = useState(1);

    useEffect(() => {
        const auditTimeout = setTimeout(() => {
            if (parseFloat(amount) > 0 && recipientName) {
                setSecurityAudit({
                    riskScore: parseFloat(amount) > 5000 ? 60 : 10,
                    fraudProbability: 0.01,
                    amlCompliance: 'pass',
                    sanctionScreening: 'pass',
                    quantumSignatureIntegrity: 'verified',
                    recommendations: parseFloat(amount) > 5000 ? ["High value transaction. AI monitoring active."] : [],
                    complianceAlerts: [],
                    threatVectorAnalysis: []
                });
            }
        }, 800);
        return () => clearTimeout(auditTimeout);
    }, [amount, recipientName]);

    const handleSendClick = () => {
        if (currentStep === 1) setCurrentStep(2);
        else if (currentStep === 2) setShowBiometricModal(true);
    };

    const handleSuccess = async () => {
        const newTx: Transaction = {
            id: `tx_${Date.now()}`,
            type: 'expense',
            category: 'Transfer',
            description: `Sent to ${recipientName} via ${paymentMethod}`,
            amount: parseFloat(amount),
            date: new Date().toISOString().split('T')[0],
            carbonFootprint: 0.5,
            aiCategoryConfidence: 1.0
        };
        await addTransaction(newTx);
        setShowBiometricModal(false);
        setActiveView(View.Dashboard);
    };

    return (
        <div className="space-y-6 animate-in fade-in duration-500">
            <h2 className="text-3xl font-black text-white tracking-tighter uppercase italic">Quantum Pay Portal</h2>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                <Card title={currentStep === 1 ? "Initiate Transfer" : "Review Transaction"}>
                    <div className="space-y-6">
                        {currentStep === 1 ? (
                            <>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Recipient</label>
                                    <input type="text" value={recipientName} onChange={e => setRecipientName(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono" placeholder="Name, @tag, or ID" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Amount (USD)</label>
                                    <input type="number" value={amount} onChange={e => setAmount(e.target.value)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono" placeholder="0.00" />
                                </div>
                                <div>
                                    <label className="block text-[10px] font-bold text-gray-500 uppercase mb-2 tracking-widest">Execution Rail</label>
                                    <select value={paymentMethod} onChange={e => setPaymentMethod(e.target.value as PaymentRail)} className="w-full bg-black/40 border border-gray-700 rounded-xl p-3 text-white focus:ring-1 focus:ring-cyan-500 outline-none font-mono appearance-none">
                                        <option value="quantumpay">QuantumPay (Instant Settlement)</option>
                                        <option value="cashapp">Cash App</option>
                                        <option value="swift_global">SWIFT Global (L1)</option>
                                        <option value="blockchain_dlt">Blockchain DLT</option>
                                    </select>
                                </div>
                                <SecurityAuditDisplay auditResult={securityAudit} />
                            </>
                        ) : (
                            <div className="space-y-4 text-gray-100 bg-gray-900/50 p-6 rounded-2xl border border-gray-800">
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Target</span>
                                    <span className="font-mono text-cyan-400">{recipientName}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Magnitude</span>
                                    <span className="font-mono text-2xl font-black">${parseFloat(amount).toLocaleString()}</span>
                                </div>
                                <div className="flex justify-between border-b border-gray-800 pb-2">
                                    <span className="text-gray-500 text-xs uppercase font-bold">Protocol</span>
                                    <span className="font-mono text-xs">{paymentMethod.toUpperCase()}</span>
                                </div>
                                <p className="text-[10px] text-yellow-500 font-mono animate-pulse">ESTIMATED_SETTLEMENT: INSTANT_QUANTUM</p>
                            </div>
                        )}
                        
                        <div className="flex justify-end gap-3 mt-8">
                             {currentStep === 2 && <button onClick={() => setCurrentStep(1)} className="px-6 py-3 bg-gray-800 rounded-xl text-white font-bold hover:bg-gray-700 transition-all">BACK</button>}
                             <button onClick={handleSendClick} disabled={!amount || !recipientName} className="px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-xl text-white font-black shadow-lg shadow-cyan-500/20 transition-all active:scale-95 disabled:opacity-50 uppercase tracking-widest">
                                {currentStep === 1 ? "Review Order" : "Initialize Flow"}
                             </button>
                        </div>
                    </div>
                </Card>

                <Card title="Network Diagnostics">
                    <div className="space-y-4">
                        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800">
                            <p className="text-[10px] text-gray-500 uppercase font-black mb-2">DLT Nodes Status</p>
                            <div className="grid grid-cols-4 gap-2">
                                {[...Array(4)].map((_, i) => (
                                    <div key={i} className="h-1 bg-green-500 rounded-full shadow-[0_0_8px_rgba(34,197,94,0.4)]"></div>
                                ))}
                            </div>
                        </div>
                        <div className="p-4 bg-gray-950 rounded-xl border border-gray-800 font-mono text-[10px] text-gray-500">
                            <p>&gt; Requesting path optimization...</p>
                            <p className="text-cyan-400">&gt; Found optimal rail: {paymentMethod}</p>
                            <p>&gt; Validating recipient biometric hash...</p>
                            <p className="text-green-400">&gt; Recipient verified on decentralized identity grid.</p>
                        </div>
                    </div>
                </Card>
            </div>
            <BiometricModal isOpen={showBiometricModal} onSuccess={handleSuccess} onClose={() => setShowBiometricModal(false)} amount={amount} recipient={recipientName} paymentMethod={paymentMethod} securityContext="personal" />
        </div>
    );
};

export default SendMoneyView;


// --- CONSOLIDATED FROM: SendMoneyView (2).tsx ---

// components/views/personal/SendMoneyView.tsx
// RE-ENACTED & EXPANDED: This component has been resurrected from its deprecated state.
// It is now "Remitrax," a complete, multi-rail payment portal featuring advanced
// security simulations and demonstrating enterprise-level integration patterns.

import React, { useState, useContext, useRef, useEffect } from 'react';
import Card from './Card';
import { DataContext } from '../context/DataContext';
import { View } from '../types';
import type { Transaction } from '../types';

// ================================================================================================
// TYPE DEFINITIONS
// ================================================================================================
type PaymentMethod = 'quantumpay' | 'cashapp';
type ScanState = 'scanning' | 'success' | 'verifying' | 'error';

// FIX: Added interface definition for component props.
interface SendMoneyViewProps {
  setActiveView: (view: View) => void;
}


// ================================================================================================
// ANIMATED UI SUB-COMPONENTS
// These provide a high-fidelity user experience during the security process.
// ================================================================================================

/**
 * @description Renders an animated checkmark icon for success feedback.
 * The animation is pure CSS, making it lightweight and performant.
 */
const AnimatedCheckmarkIcon: React.FC = () => (
    <>
        <svg className="h-24 w-24" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <style>{`
            .checkmark__circle {
                stroke-dasharray: 166;
                stroke-dashoffset: 166;
                stroke-width: 3;
                stroke-miterlimit: 10;
                stroke: #4ade80;
                fill: none;
                animation: stroke 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards;
            }
            .checkmark__check {
                transform-origin: 50% 50%;
                stroke-dasharray: 48;
                stroke-dashoffset: 48;
                stroke-width: 4;
                stroke: #fff;
                animation: stroke 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards;
            }
            @keyframes stroke {
                100% { stroke-dashoffset: 0; }
            }
        `}</style>
    </>
);

/**
 * @description Renders a futuristic "quantum ledger" animation to simulate
 * secure transaction processing. This enhances perceived security and trust.
 */
const QuantumLedgerAnimation: React.FC = () => (
    <>
        <div className="quantum-grid">
            {Array.from({ length: 9 }).map((_, i) => <div key={i} className="quantum-block"></div>)}
        </div>
        <style>{`
            .quantum-grid {
                display: grid;
                grid-template-columns: repeat(3, 1fr);
                gap: 8px;
                width: 100px;
                height: 100px;
            }
            .quantum-block {
                background-color: rgba(6, 182, 212, 0.3);
                border: 1px solid #06b6d4;
                border-radius: 4px;
                animation: quantum-flash 2s infinite ease-in-out;
            }
            .quantum-block:nth-child(1) { animation-delay: 0.1s; }
            .quantum-block:nth-child(2) { animation-delay: 0.5s; }
            .quantum-block:nth-child(3) { animation-delay: 0.2s; }
            .quantum-block:nth-child(4) { animation-delay: 0.6s; }
            .quantum-block:nth-child(5) { animation-delay: 0.3s; }
            .quantum-block:nth-child(6) { animation-delay: 0.7s; }
            .quantum-block:nth-child(7) { animation-delay: 0.4s; }
            .quantum-block:nth-child(8) { animation-delay: 0.8s; }
            .quantum-block:nth-child(9) { animation-delay: 0.1s; }
            @keyframes quantum-flash {
                0%, 100% { background-color: rgba(6, 182, 212, 0.3); transform: scale(1); }
                50% { background-color: rgba(165, 243, 252, 0.8); transform: scale(1.05); }
            }
        `}</style>
    </>
);

// ================================================================================================
// HIGH-FIDELITY BIOMETRIC MODAL
// ================================================================================================

const BiometricModal: React.FC<{ 
    isOpen: boolean;
    onSuccess: () => void; 
    onClose: () => void; 
    amount: string; 
    recipient: string; 
    paymentMethod: 'QuantumPay' | 'Cash App';
}> = ({ isOpen, onSuccess, onClose, amount, recipient, paymentMethod }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanState, setScanState] = useState<ScanState>('scanning');
    const [verificationStep, setVerificationStep] = useState(0);

    const verificationMessages = [
        `Heuristic API: Validating ${recipient}'s identity...`,
        'Heuristic API: Checking sufficient funds...',
        'Heuristic API: Executing transaction on secure ledger...',
        'Heuristic API: Confirming transfer...',
    ];

    // Effect to manage camera stream and the multi-step verification flow.
    useEffect(() => {
        if (!isOpen) {
            setScanState('scanning');
            setVerificationStep(0);
            return;
        };

        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                }
            } catch (err) {
                console.error("Camera access denied:", err);
                setScanState('error');
            }
        };
        startCamera();

        // Timers to simulate the multi-stage verification process.
        const successTimer = setTimeout(() => setScanState('success'), 3000);
        const verifyTimer = setTimeout(() => setScanState('verifying'), 4000);
        const successActionTimer = setTimeout(onSuccess, 8500);
        const closeTimer = setTimeout(onClose, 9500);

        return () => {
            clearTimeout(successTimer);
            clearTimeout(verifyTimer);
            clearTimeout(successActionTimer);
            clearTimeout(closeTimer);
            if (stream) {
                stream.getTracks().forEach(track => track.stop());
            }
        };
    }, [isOpen, onSuccess, onClose]);
    
    // Effect to cycle through the verification messages.
    useEffect(() => {
        if (scanState === 'verifying') {
            const interval = setInterval(() => {
                setVerificationStep(prev => Math.min(prev + 1, verificationMessages.length - 1));
            }, 1000);
            return () => clearInterval(interval);
        }
    }, [scanState, verificationMessages.length]);

    const getTitle = () => {
        switch (scanState) {
            case 'scanning': return 'Scanning Face';
            case 'success': return 'Identity Confirmed';
            case 'verifying': return 'Quantum Ledger Verification';
            case 'error': return 'Verification Failed';
        }
    }
    
    return (
        <div className={`fixed inset-0 bg-black/70 flex items-end sm:items-center justify-center z-50 backdrop-blur-sm transition-opacity duration-300 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gray-800 rounded-t-2xl sm:rounded-2xl p-8 max-w-sm w-full text-center border-t sm:border border-gray-700 transition-transform duration-300 ease-out transform ${isOpen ? 'translate-y-0' : 'translate-y-full'}`}>
                <div className="relative w-64 h-64 mx-auto rounded-full overflow-hidden border-4 border-gray-600 mb-6">
                    <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"></video>
                    {scanState === 'scanning' && <div className="absolute inset-0 bg-grid-pattern animate-scan"></div>}
                    {scanState === 'success' && <div className="absolute inset-0 bg-green-500/50 flex items-center justify-center"><AnimatedCheckmarkIcon /></div>}
                    {scanState === 'verifying' && <div className="absolute inset-0 bg-black/50 flex items-center justify-center"><QuantumLedgerAnimation /></div>}
                    {scanState === 'error' && <div className="absolute inset-0 bg-red-500/50 flex items-center justify-center p-4"><p>Camera not found. Cannot complete biometric verification.</p></div>}
                </div>
                <h3 className="text-2xl font-bold text-white">{getTitle()}</h3>
                <p className="text-gray-400 mt-2">{scanState === 'verifying' ? verificationMessages[verificationStep] : `Sending $${amount} to ${recipient} via ${paymentMethod}`}</p>
                {scanState === 'scanning' && <button onClick={onClose} className="mt-6 px-4 py-2 bg-gray-700/50 hover:bg-gray-700 rounded-lg text-sm text-gray-300">Cancel</button>}
            </div>
             <style>{`.bg-grid-pattern{background-image:linear-gradient(rgba(0,255,255,0.2) 1px,transparent 1px),linear-gradient(90deg,rgba(0,255,255,0.2) 1px,transparent 1px);background-size:2rem 2rem}@keyframes scan-effect{0%{background-position:0 0}100%{background-position:0 -4rem}}.animate-scan{animation:scan-effect 1.5s linear infinite}`}</style>
        </div>
    );
};

// ================================================================================================
// MAIN VIEW COMPONENT: SendMoneyView (Remitrax)
// ================================================================================================
const SendMoneyView: React.FC<SendMoneyViewProps> = ({ setActiveView }) => {
  const context = useContext(DataContext);
  const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('quantumpay');
  const [amount, setAmount] = useState('');
  const [quantumTag, setQuantumTag] = useState('');
  const [remittance, setRemittance] = useState('');
  const [cashtag, setCashtag] = useState('');
  const [showModal, setShowModal] = useState(false);

  if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
  const { addTransaction } = context;

  const recipient = paymentMethod === 'quantumpay' ? quantumTag : cashtag;
  const isFormValid = parseFloat(amount) > 0 && recipient.trim() !== '';

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (isFormValid) setShowModal(true);
  };
  
  const handleSuccess = () => {
    const simulateApiCall = () => {
      // In a real application, this would use a library like axios or fetch.
      // This simulation demonstrates knowledge of how such an API call would be structured.
      const requestBody = {
          "to_account_id": recipient,
          "amount": amount,
          "currency": "USD",
          "description": remittance || `QuantumBank payment`
      };
      console.log("%c--- SIMULATING OPEN BANKING API CALL (ISO 20022 Compliant) ---", "color: cyan; font-weight: bold;");
      console.log("Endpoint: POST /my/payments");
      console.log("Body:", requestBody);
      console.log("-----------------------------------------");
    };
    
    if (paymentMethod === 'quantumpay') simulateApiCall();

    const newTx: Transaction = {
      id: `txn_${Date.now()}`,
      type: 'expense',
      category: 'Transfer',
      description: `Payment to ${recipient}`,
      amount: parseFloat(amount),
      date: new Date().toISOString().split('T')[0],
      carbonFootprint: 0.1,
    };
    addTransaction(newTx);
  };
  
  const handleClose = () => {
      setShowModal(false);
      setTimeout(() => setActiveView(View.Transactions), 350);
  };
  
  return (
      <>
        <Card title="Send Money (Remitrax)">
            <div className="p-1 bg-gray-900/50 rounded-lg flex mb-6">
                <button onClick={() => setPaymentMethod('quantumpay')} className={`w-1/2 py-2.5 text-sm font-medium rounded-md transition-colors ${paymentMethod === 'quantumpay' ? 'bg-cyan-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>QuantumPay (ISO20022)</button>
                <button onClick={() => setPaymentMethod('cashapp')} className={`w-1/2 py-2.5 text-sm font-medium rounded-md transition-colors ${paymentMethod === 'cashapp' ? 'bg-green-600 text-white' : 'text-gray-300 hover:bg-gray-700/50'}`}>Cash App</button>
            </div>
            
            <form onSubmit={handleSend} className="space-y-6">
                 {paymentMethod === 'quantumpay' ? (
                    <>
                        <div><label htmlFor="quantumTag" className="block text-sm font-medium text-gray-300">Recipient's @QuantumTag</label><input type="text" name="quantumTag" value={quantumTag} onChange={(e) => setQuantumTag(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" placeholder="@the_future"/></div>
                        <div><label htmlFor="remittance" className="block text-sm font-medium text-gray-300">Remittance Info (ISO 20022)</label><input type="text" name="remittance" value={remittance} onChange={(e) => setRemittance(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" placeholder="Invoice #12345"/></div>
                    </>
                 ) : (
                    <div><label htmlFor="cashtag" className="block text-sm font-medium text-gray-300">Recipient's $Cashtag</label><input type="text" name="cashtag" value={cashtag} onChange={(e) => setCashtag(e.target.value)} className="mt-1 w-full bg-gray-700/50 border-gray-600 rounded-lg p-2 text-white" placeholder="$new_beginnings"/></div>
                 )}
                <div>
                    <label htmlFor="amount" className="block text-sm font-medium text-gray-300">Amount</label>
                    <div className="mt-1 relative"><div className="pointer-events-none absolute inset-y-0 left-0 pl-3 flex items-center"><span className="text-gray-400">$</span></div><input type="number" name="amount" value={amount} onChange={(e) => setAmount(e.target.value)} className="w-full bg-gray-700/50 border-gray-600 rounded-lg pl-7 p-2 text-white" placeholder="0.00"/></div>
                </div>
                <button type="submit" disabled={!isFormValid} className={`w-full py-3 text-sm font-medium text-white rounded-lg disabled:opacity-50 ${paymentMethod === 'quantumpay' ? 'bg-cyan-600 hover:bg-cyan-700' : 'bg-green-600 hover:bg-green-700'}`}>Send with Biometric Confirmation</button>
            </form>
        </Card>
        <BiometricModal isOpen={showModal} onSuccess={handleSuccess} onClose={handleClose} amount={amount} recipient={recipient} paymentMethod={paymentMethod === 'quantumpay' ? 'QuantumPay' : 'Cash App'} />
    </>
  );
};

export default SendMoneyView;


// --- CONSOLIDATED FROM: SendMoneyView (3).tsx ---

// components/SendMoneyView.tsx
// This component is undergoing a major refactor to transition from a deprecated, insecure prototype
// to a stable, production-ready financial transaction interface. The original "NexusPay" was intentionally
// flawed, lacking compliance, robust encryption, and secure authentication. This refactor replaces
// those components with modern, secure, and efficient patterns.

import React, { useState, useContext, useRef, useEffect, useCallback } from 'react';
import Card from './Card'; // Assuming Card is a reusable UI component
import { DataContext } from '../context/DataContext';
import { View } from '../types'; // Assuming View type is defined elsewhere
import type { Transaction } from '../types'; // Assuming Transaction type is defined elsewhere

// ================================================================================================
// REFACTORED TYPE DEFINITIONS (Lean and Production-Focused)
// ================================================================================================

// Payment Rail types are now consolidated and focus on common, stable protocols.
export type PaymentRail = 'quantumpay_stable' | 'cashapp_v2' | 'swift_iso20022' | 'blockchain_erc20' | 'ripple_ledger' | 'fedwire_rtgs';

// ScanState is simplified to reflect common verification stages.
export type ScanState = 'scanning' | 'verifying' | 'success' | 'error';

// RemitraxRecipientProfile is streamlined for essential recipient data.
export interface RemitraxRecipientProfile {
  id: string;
  name: string;
  legalEntityName?: string; // For corporate entities
  taxId?: string; // Essential for compliance
  avatarUrl?: string;
  preferredCurrency?: string;
  kycStatus?: 'verified' | 'pending' | 'unverified';
  bankAccounts?: { bankName: string; accountNumber: string; routingNumber?: string; iban?: string; swiftCode?: string; accountType: 'checking' | 'savings' | 'corporate'; }[];
  eWalletDetails?: { type: 'paypal' | 'venmo' | 'zelle' | 'cashapp_v2'; identifier: string; }[];
  // Removed legacy/experimental fields like quantumTag, cashtag, neuroLinkAddress, galacticP2PId, etc.
  // Compliance and risk fields are now managed via a separate, standardized service.
}

// RemitraxCurrency is simplified to core attributes.
export interface RemitraxCurrency {
  code: string;
  name: string;
  symbol: string;
  isCrypto: boolean;
  decimalPlaces: number;
  // Removed experimental fields like quantumFluctuationIndex, liquidityScore, etc.
}

// ScheduledPaymentRule is simplified to core recurrence and conditional logic.
export interface ScheduledPaymentRule {
  frequency: 'daily' | 'weekly' | 'monthly' | 'annually' | 'once_on_date';
  startDate: string;
  endDate?: string;
  executionCondition?: string; // Basic conditional logic string
  paymentReason?: string;
}

// AdvancedTransactionSettings are refactored for security and compliance.
export interface AdvancedTransactionSettings {
  priority: 'low' | 'normal' | 'high';
  // Removed experimental/non-standard fields like carbonOffsetRatio, privacyLevel, receiptPreference, multiSignatureRequired, escrowDetails, dynamicFeeOptimization, dlcDetails, postQuantumSecurityEnabled, aiComplianceCheckLevel.
  dataEncryptionStandard: 'aes256_gcm' | 'rsa_oaep'; // Standardized and secure options
  routeOptimizationPreference: 'speed' | 'cost' | 'compliance'; // Focus on practical optimizations
  notificationPreferences: { email: boolean; sms: boolean; push: boolean; dlt_confirmation: boolean; };
}

// SecurityAuditResult is standardized for critical security and compliance metrics.
export interface SecurityAuditResult {
  riskScore: number; // Normalized risk score (0-100)
  fraudProbability: number; // Probability of fraud (0.0-1.0)
  amlCompliance: 'pass' | 'fail' | 'review'; // AML check status
  sanctionScreening: 'pass' | 'fail' | 'partial_match'; // Sanctions list check status
  recommendations: string[]; // Actionable recommendations
  // Removed non-standard fields like quantumSignatureIntegrity, threatVectorAnalysis, aiConfidenceScore.
}

// EnvironmentalImpactReport is removed as it's out of scope for the core MVP.
// Future modules can reintroduce this.

// RailSpecificDetails is consolidated and simplified.
export interface RailSpecificDetails {
    swift?: { bic: string; accountNumber: string; beneficiaryAddress?: string; };
    blockchain?: { network: 'ethereum' | 'polygon'; contractAddress?: string; tokenAddress?: string; };
    ripple?: { destinationTag?: string; };
    fedwire?: { routingNumber: string; };
    // Removed experimental rails.
}

interface SendMoneyViewProps {
  setActiveView: (view: View) => void;
}

// ================================================================================================
// STATIC UI SUB-COMPONENTS (Cleaned and Standardized)
// ================================================================================================

// AnimatedCheckmarkIcon: Standardized success animation.
export const AnimatedCheckmarkIcon: React.FC = () => (
    <>
        <svg className="h-24 w-24 transform scale-125" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 52 52">
            <defs>
                <linearGradient id="checkmarkGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" stopColor="#4ade80" />
                    <stop offset="50%" stopColor="#86efac" />
                    <stop offset="100%" stopColor="#22c55e" />
                </linearGradient>
            </defs>
            <circle className="checkmark__circle" cx="26" cy="26" r="25" fill="none" stroke="url(#checkmarkGradient)" strokeWidth="4" strokeMiterlimit="10" />
            <path className="checkmark__check" fill="none" d="M14.1 27.2l7.1 7.2 16.7-16.8" />
        </svg>
        <style>{`
            .checkmark__circle { stroke-dasharray: 166; stroke-dashoffset: 166; animation: stroke-circle 0.6s cubic-bezier(0.65, 0, 0.45, 1) forwards; }
            .checkmark__check { transform-origin: 50% 50%; stroke-dasharray: 48; stroke-dashoffset: 48; stroke-width: 5; animation: stroke-check 0.3s cubic-bezier(0.65, 0, 0.45, 1) 0.8s forwards; }
            @keyframes stroke-circle { 100% { stroke-dashoffset: 0; } }
            @keyframes stroke-check { 100% { stroke-dashoffset: 0; } }
        `}</style>
    </>
);

// BiometricModal: Refactored for clarity and standard authentication flow.
// Replaces legacy scan states with standard ones. Removed experimental animations.
export const BiometricModal: React.FC<{
    isOpen: boolean; onSuccess: () => void; onClose: () => void; amount: string; recipient: RemitraxRecipientProfile | string; paymentMethod: PaymentRail;
}> = ({ isOpen, onSuccess, onClose, amount, recipient, paymentMethod }) => {
    const videoRef = useRef<HTMLVideoElement>(null);
    const [scanState, setScanState] = useState<ScanState>('scanning');
    const [biometricProgress, setBiometricProgress] = useState(0);
    const recipientName = typeof recipient === 'string' ? recipient : recipient.name || 'Unknown Entity';

    // Simplified verification messages focusing on standard security protocols.
    const verificationMessages = [
        `Verifying transaction details for ${recipientName}...`,
        `Performing AML and Sanctions Check...`,
        `Authenticating with secure biometric data...`,
        `Finalizing transaction on ${paymentMethod} ledger...`
    ];
    const [currentVerificationMessageIndex, setCurrentVerificationMessageIndex] = useState(0);

    useEffect(() => {
        if (!isOpen) {
            setScanState('scanning');
            setBiometricProgress(0);
            setCurrentVerificationMessageIndex(0);
            return;
        }
        
        let stream: MediaStream | null = null;
        const startCamera = async () => {
            try {
                stream = await navigator.mediaDevices.getUserMedia({ video: true });
                if (videoRef.current) {
                    videoRef.current.srcObject = stream;
                    videoRef.current.play();
                }
            } catch (err) {
                console.error("Camera access denied or failed:", err);
                setScanState('error');
            }
        };
        startCamera();

        // Simulate progress and state transitions
        const progressInterval = setInterval(() => setBiometricProgress(prev => Math.min(prev + Math.random() * 10, 100)), 300);
        
        const stateSequence = [
            { state: 'verifying', delay: 4000 }, // Simulate initial scan and data gathering
            { state: 'success', delay: 3000 }  // Simulate successful verification
        ];

        let currentDelay = 0;
        stateSequence.forEach(({ state, delay }) => {
            currentDelay += delay;
            setTimeout(() => setScanState(state as ScanState), currentDelay);
        });

        const successActionTimer = setTimeout(onSuccess, currentDelay + 1500);
        const closeTimer = setTimeout(onClose, currentDelay + 3000); // Close modal after a short delay post-success

        return () => {
            clearInterval(progressInterval);
            stateSequence.forEach(({ state, delay }) => clearTimeout(setTimeout(() => {}, delay))); // Clear scheduled timeouts
            clearTimeout(successActionTimer);
            clearTimeout(closeTimer);
            if (stream) stream.getTracks().forEach(track => track.stop());
        };
    }, [isOpen, onSuccess, onClose, amount, recipient, paymentMethod]);

    // Update verification message based on state and progress
    useEffect(() => {
        if (scanState === 'verifying') {
            const messageInterval = setInterval(() => {
                setCurrentVerificationMessageIndex(prev => Math.min(prev + 1, verificationMessages.length - 1));
            }, 1500); // Change message every 1.5 seconds
            return () => clearInterval(messageInterval);
        }
    }, [scanState, verificationMessages.length]);

    const getTitle = () => {
        switch (scanState) {
            case 'scanning': return 'Biometric Scan';
            case 'verifying': return 'Verifying Transaction';
            case 'success': return 'Authentication Successful';
            case 'error': return 'Authentication Failed';
            default: return 'Processing';
        }
    };

    const getStatusMessage = () => {
        switch (scanState) {
            case 'scanning': return `Awaiting biometric input. Progress: ${biometricProgress.toFixed(0)}%`;
            case 'verifying': return verificationMessages[currentVerificationMessageIndex] || "Processing...";
            case 'success': return `Transaction of $${amount} authorized for ${recipientName}.`;
            case 'error': return "Biometric scan failed. Please try again.";
            default: return "Processing...";
        }
    }

    // Simplified UI for Biometric Modal
    return (
        <div className={`fixed inset-0 bg-black/90 flex items-center justify-center z-50 backdrop-blur-xl transition-opacity duration-500 ${isOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}>
            <div className={`bg-gray-950 rounded-3xl p-8 max-w-xl w-full text-center border-4 border-double ${scanState === 'success' ? 'border-green-600' : 'border-cyan-700'} shadow-2xl transition-transform duration-500 ${isOpen ? 'translate-y-0 scale-100' : 'translate-y-full scale-90'}`}>
                <h3 className="text-4xl font-black text-white mb-6 tracking-wide">{getTitle()}</h3>
                <div className="relative w-[300px] h-[300px] mx-auto rounded-full overflow-hidden border-4 border-cyan-600 mb-6 shadow-inner shadow-cyan-900">
                    {scanState !== 'success' && scanState !== 'error' && (
                        <video ref={videoRef} autoPlay muted playsInline className="absolute top-0 left-0 w-full h-full object-cover transform scale-x-[-1]"></video>
                    )}
                    {scanState === 'success' && <div className="absolute inset-0 bg-green-700/60 flex items-center justify-center"><AnimatedCheckmarkIcon /></div>}
                    {scanState === 'error' && <div className="absolute inset-0 bg-red-700/60 flex items-center justify-center text-red-200 text-4xl font-bold">X</div>}
                    {scanState === 'scanning' && (
                        <div className="absolute inset-0 bg-gray-900/70 flex items-center justify-center">
                            <div className="animate-pulse text-lg text-cyan-300">Scanning...</div>
                        </div>
                    )}
                </div>
                <p className="text-lg text-gray-200 mt-4 font-light">{getStatusMessage()}</p>
            </div>
        </div>
    );
};

// ================================================================================================
// REMITRAX SIDE VIEW COMPONENT (Production-Ready Form Interface)
// ================================================================================================

const SendMoneyView: React.FC<SendMoneyViewProps> = ({ setActiveView }) => {
    const context = useContext(DataContext);
    // Error handling for missing context is critical.
    if (!context) throw new Error("SendMoneyView must be used within a DataProvider");
    const { addTransaction, availableCurrencies, recipients } = context; // Assuming these are stable context values.

    // --- State Management ---
    const [amount, setAmount] = useState('');
    const [recipientIdentifier, setRecipientIdentifier] = useState('');
    const [selectedRecipient, setSelectedRecipient] = useState<RemitraxRecipientProfile | null>(null);
    const [paymentMethod, setPaymentMethod] = useState<PaymentRail>('quantumpay_stable'); // Default to a stable, modern rail.
    const [currencyCode, setCurrencyCode] = useState('USD');
    const [advancedSettings, setAdvancedSettings] = useState<AdvancedTransactionSettings>({
        priority: 'normal',
        dataEncryptionStandard: 'aes256_gcm', // Default to a secure standard.
        routeOptimizationPreference: 'speed',
        notificationPreferences: { email: true, sms: false, push: true, dlt_confirmation: true }
    });
    const [showBiometricModal, setShowBiometricModal] = useState(false);
    const [securityAudit, setSecurityAudit] = useState<SecurityAuditResult | null>(null);
    const [currentStep, setCurrentStep] = useState(1); // 1: Input, 2: Review, 3: Processing (Biometric Modal)

    // --- Derived State and Validation ---
    const currentCurrency = availableCurrencies.find(c => c.code === currencyCode) || { code: 'USD', name: 'US Dollar', symbol: '$', isCrypto: false, decimalPlaces: 2 };
    const parsedAmount = parseFloat(amount);
    // Input validation is crucial.
    const isValidInput = !isNaN(parsedAmount) && parsedAmount > 0 && (selectedRecipient || recipientIdentifier);

    // --- Recipient Lookup with Debouncing ---
    // Replaced complex AI lookup with a simulated, debounced search against a local recipients list.
    // In a real app, this would call a dedicated search/validation API.
    useEffect(() => {
        const lookupRecipient = async () => {
            if (!recipientIdentifier) {
                setSelectedRecipient(null);
                setSecurityAudit(null); // Clear audit if identifier is removed.
                return;
            }
            
            // Simulate API call for recipient lookup and initial security assessment.
            // In production, this would be an API call to a backend service.
            console.log(`Simulating recipient lookup for: ${recipientIdentifier}`);
            await new Promise(resolve => setTimeout(resolve, 500)); // Simulate network latency.

            const foundRecipient = recipients.find(r => 
                r.name.toLowerCase().includes(recipientIdentifier.toLowerCase()) || 
                r.id === recipientIdentifier ||
                r.legalEntityName?.toLowerCase().includes(recipientIdentifier.toLowerCase())
            );
            
            if (foundRecipient) {
                setSelectedRecipient(foundRecipient);
                // Simulate Security Audit based on recipient profile & transaction details.
                // This would typically involve a call to a dedicated security/compliance microservice.
                setSecurityAudit({
                    riskScore: foundRecipient.kycStatus === 'unverified' ? 60 : 25, // Higher risk if unverified
                    fraudProbability: foundRecipient.kycStatus === 'unverified' ? 0.05 : 0.01,
                    amlCompliance: foundRecipient.kycStatus === 'unverified' ? 'review' : 'pass',
                    sanctionScreening: 'pass', // Assume pass for simplicity, real system would integrate external checks.
                    recommendations: foundRecipient.kycStatus === 'unverified' ? ["Mandatory secondary review required."] : [],
                });
            } else {
                setSelectedRecipient(null);
                // For unknown recipients, simulate a preliminary audit.
                setSecurityAudit({
                    riskScore: 40, // Moderate risk for unknown entity
                    fraudProbability: 0.02,
                    amlCompliance: 'review', // Needs review
                    sanctionScreening: 'pass',
                    recommendations: ["Verify recipient identity and banking details thoroughly."],
                });
            }
        };
        // Debounce the lookup to avoid excessive calls during typing.
        const debounceLookup = setTimeout(lookupRecipient, 500);
        return () => clearTimeout(debounceLookup);
    }, [recipientIdentifier, recipients]); // Dependencies ensure re-run when identifier or recipient list changes.

    // --- Dynamic Settings Handlers ---
    const handleAdvancedSettingChange = useCallback((key: keyof AdvancedTransactionSettings, value: any) => {
        setAdvancedSettings(prev => {
            if (key === 'notificationPreferences') {
                // Ensure deep merge for notification preferences.
                return { ...prev, notificationPreferences: { ...prev.notificationPreferences, ...value } };
            }
            return { ...prev, [key]: value };
        });
    }, []);

    // --- Core Action Handlers ---
    const handleSendClick = () => {
        if (!isValidInput) {
            alert("Please enter a valid amount and recipient.");
            return;
        }

        if (currentStep === 1) {
            setCurrentStep(2); // Proceed to review step.
        } else if (currentStep === 2) {
            // Step 2: Review -> Trigger Biometric Authentication.
            // The biometric modal will handle the final transaction submission upon success.
            setShowBiometricModal(true);
        }
    };

    // Callback for when biometric authentication is successful.
    const handleBiometricSuccess = () => {
        // This is the critical point where the transaction is finalized.
        // It should call a robust backend API for transaction processing.
        // For this example, we simulate adding to local context and show confirmation.
        
        const finalRecipient = selectedRecipient || { id: 'external', name: recipientIdentifier }; // Use identifier if recipient not found.
        
        // Construct the transaction object.
        const newTx: Transaction = {
            id: `tx_${Date.now()}_${Math.random().toString(36).substring(2, 9)}`, // Unique ID generation.
            type: 'debit', // Transaction type.
            category: 'External Transfer', // Simplified category.
            description: `Sent ${amount} ${currencyCode} to ${finalRecipient.name} via ${paymentMethod}.`, // Clear description.
            amount: parsedAmount,
            currency: currencyCode,
            date: new Date().toISOString(),
            status: 'Pending Confirmation', // Initial status.
            metadata: {
                paymentRail: paymentMethod,
                encryption: advancedSettings.dataEncryptionStandard,
                routeOptimization: advancedSettings.routeOptimizationPreference,
                recipientId: finalRecipient.id,
                recipientName: finalRecipient.name,
                // Add other relevant metadata here after backend integration.
            }
        };
        
        addTransaction(newTx); // Add to context (simulates backend call).
        setShowBiometricModal(false); // Close the modal.
        setCurrentStep(4); // Move to confirmation step.
    };

    // --- Render Functions for Each Step ---
    const renderStep1Input = () => (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Recipient Input */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Recipient Identifier (Name, ID, or Account Number)</label>
                    <input 
                        type="text" 
                        value={recipientIdentifier} 
                        onChange={e => setRecipientIdentifier(e.target.value)} 
                        className="w-full bg-gray-800 border border-cyan-600 rounded-lg p-3 text-white text-lg focus:ring-cyan-500 focus:border-cyan-500 transition shadow-sm" 
                        placeholder="Enter Recipient Name or Unique ID..." 
                    />
                    {selectedRecipient && (
                        <p className="text-xs mt-1 text-green-400">Found: {selectedRecipient.name} ({selectedRecipient.legalEntityName ? 'Business' : 'Individual'}) - KYC: {selectedRecipient.kycStatus}</p>
                    )}
                    {!selectedRecipient && recipientIdentifier && (
                         <p className="text-xs mt-1 text-yellow-400">Recipient not found in registry. Proceeding with external transfer protocols.</p>
                    )}
                </div>
                
                {/* Amount and Currency Input */}
                <div className="flex flex-col">
                    <label className="block text-sm font-medium text-gray-300 mb-1">Amount</label>
                    <div className="flex rounded-lg border border-cyan-600 overflow-hidden shadow-sm">
                        <input 
                            type="number" 
                            value={amount} 
                            onChange={e => setAmount(e.target.value)} 
                            className="w-2/3 bg-gray-800 border-r border-gray-700 p-3 text-white text-xl font-mono focus:ring-cyan-500 focus:border-cyan-500" 
                            placeholder="0.00" 
                            step={currentCurrency.isCrypto ? "0.00000001" : "0.01"}
                        />
                        <select 
                            value={currencyCode} 
                            onChange={e => setCurrencyCode(e.target.value)} 
                            className="w-1/3 bg-gray-700 p-3 text-white text-base appearance-none cursor-pointer focus:ring-cyan-500 focus:border-cyan-500"
                        >
                            {availableCurrencies.slice(0, 5).map(c => ( // Limit displayed currencies for simplicity
                                <option key={c.code} value={c.code}>{c.code}</option>
                            ))}
                            {/* Add more options or a searchable dropdown for production */}
                            <option disabled>...</option>
                            <option value="BTC">BTC</option>
                            <option value="ETH">ETH</option>
                        </select>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Payment Rail Selection */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Payment Rail</label>
                    <select 
                        value={paymentMethod} 
                        onChange={e => setPaymentMethod(e.target.value as PaymentRail)} 
                        className="w-full bg-gray-800 border border-cyan-600 rounded-lg p-3 text-white appearance-none cursor-pointer focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
                    >
                        <option value="quantumpay_stable">QuantumPay (Stable DLT)</option>
                        <option value="fedwire_rtgs">FedWire RTGS (USD High Value)</option>
                        <option value="blockchain_erc20">Blockchain (ETH/ERC20)</option>
                        <option value="swift_iso20022">SWIFT ISO 20022</option>
                        <option value="ripple_ledger">Ripple Ledger</option>
                        <option value="cashapp_v2">Cash App (v2)</option>
                    </select>
                </div>

                {/* Transaction Priority */}
                <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Transaction Priority</label>
                    <select 
                        value={advancedSettings.priority} 
                        onChange={e => handleAdvancedSettingChange('priority', e.target.value as AdvancedTransactionSettings['priority'])} 
                        className="w-full bg-gray-800 border border-cyan-600 rounded-lg p-3 text-white appearance-none cursor-pointer focus:ring-cyan-500 focus:border-cyan-500 shadow-sm"
                    >
                        <option value="high">High (Expedited)</option>
                        <option value="normal">Normal</option>
                        <option value="low">Low (Batch Processing)</option>
                    </select>
                </div>
            </div>

            {/* Display Security Audit Summary */}
            {securityAudit && (
                <div className="mt-6 p-4 bg-gray-800 rounded-xl border border-gray-700 shadow-sm space-y-3">
                    <h4 className="text-lg font-bold text-cyan-400 border-b border-gray-700 pb-2 flex justify-between items-center">
                        Security & Compliance Scan
                        <span className="text-xs text-gray-400">Status: {securityAudit.amlCompliance.toUpperCase()}</span>
                    </h4>
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-400">Risk Score:</p><p className={`font-bold ${securityAudit.riskScore > 75 ? 'text-red-400' : securityAudit.riskScore > 40 ? 'text-yellow-400' : 'text-green-400'}`}>{securityAudit.riskScore}/100</p>
                        <p className="text-gray-400">Fraud Probability:</p><p className={`font-bold ${securityAudit.fraudProbability > 0.05 ? 'text-red-400' : 'text-green-400'}`}>{`${(securityAudit.fraudProbability * 100).toFixed(2)}%`}</p>
                        <p className="text-gray-400">Sanction Screening:</p><p className={securityAudit.sanctionScreening === 'fail' ? 'text-red-400 font-bold' : 'text-green-400 font-bold'}>{securityAudit.sanctionScreening.toUpperCase()}</p>
                    </div>
                    {securityAudit.recommendations.length > 0 && (
                        <div className="mt-3 p-3 bg-yellow-900/30 border border-yellow-600 rounded-lg text-sm">
                            <p className="font-bold text-yellow-300 mb-1">Recommendations ({securityAudit.recommendations.length}):</p>
                            <ul className="list-disc list-inside text-xs text-yellow-200 space-y-1">{securityAudit.recommendations.map((rec, i) => <li key={i}>{rec}</li>)}</ul>
                        </div>
                    )}
                </div>
            )}
        </div>
    );

    // Render function for the review step.
    const renderStep2Review = () => {
        const finalRecipient = selectedRecipient || { id: 'external', name: recipientIdentifier };
        // Ensure amount is formatted correctly based on currency decimal places.
        const formattedAmount = parsedAmount.toFixed(currentCurrency.decimalPlaces);
        
        return (
            <div className="space-y-5">
                {/* Transaction Summary Card */}
                <Card title="Transaction Summary">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                        <p className="text-gray-400 col-span-1 md:col-span-2">Recipient:</p>
                        <p className="font-semibold text-white col-span-1 md:col-span-2">{finalRecipient.name} {finalRecipient.legalEntityName && `(${finalRecipient.legalEntityName})`}</p>
                        
                        <p className="text-gray-400">Amount:</p>
                        <p className="text-3xl font-extrabold text-green-400">{currentCurrency.symbol}{formattedAmount} {currentCurrency.code}</p>
                        
                        <p className="text-gray-400">Settlement Rail:</p>
                        <p className="font-semibold text-white">{paymentMethod}</p>
                        
                        <p className="text-gray-400">Priority:</p>
                        <p className="font-semibold text-yellow-400">{advancedSettings.priority.toUpperCase()}</p>
                    </div>
                </Card>

                {/* Advanced Settings Overview */}
                <Card title="Advanced Protocol Configuration">
                    <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-sm">
                        <p className="text-gray-400">Data Encryption:</p><p className="text-white">{advancedSettings.dataEncryptionStandard}</p>
                        <p className="text-gray-400">Route Optimization:</p><p className="text-white">{advancedSettings.routeOptimizationPreference}</p>
                        <p className="text-gray-400">Notifications:</p>
                        <p className="text-white">
                            {Object.entries(advancedSettings.notificationPreferences)
                                .filter(([key, enabled]) => enabled)
                                .map(([key]) => key.replace('_', ' ').toUpperCase())
                                .join(', ') || 'None'}
                        </p>
                    </div>
                </Card>

                {/* Conditional Warning for High Risk */}
                {securityAudit && securityAudit.riskScore > 50 && (
                    <div className="p-4 bg-red-900/40 border border-red-500 rounded-lg">
                        <p className="font-bold text-red-300">High Risk Detected ({securityAudit.riskScore}/100). Biometric Multi-Factor Authentication (MFA) is REQUIRED for transaction authorization.</p>
                    </div>
                )}
            </div>
        );
    };

    // Render function for the final confirmation step.
    const renderStep4Confirmation = () => (
        <div className="text-center p-10 bg-gray-800 rounded-xl border-2 border-green-500 shadow-lg animate-fade-in">
            <AnimatedCheckmarkIcon />
            <h3 className="text-4xl font-bold text-green-400 mt-6 mb-2">Transaction Successful</h3>
            <p className="text-xl text-white">Transfer processed and confirmation pending.</p>
            <p className="text-md text-gray-400 mt-3">Ledger Hash: <span className="font-mono text-sm bg-gray-700 p-1 rounded">{`0x${Math.random().toString(16).substring(2, 18)}...`}</span></p>
            <button 
                onClick={() => { 
                    // Reset state for a new transaction.
                    setCurrentStep(1); 
                    setAmount(''); 
                    setRecipientIdentifier(''); 
                    setSelectedRecipient(null);
                    setSecurityAudit(null);
                    setPaymentMethod('quantumpay_stable'); // Reset to default
                    setCurrencyCode('USD'); // Reset to default
                    setAdvancedSettings({ // Reset to defaults
                        priority: 'normal',
                        dataEncryptionStandard: 'aes256_gcm',
                        routeOptimizationPreference: 'speed',
                        notificationPreferences: { email: true, sms: false, push: true, dlt_confirmation: true }
                    });
                }} 
                className="mt-8 px-8 py-3 bg-cyan-600 hover:bg-cyan-500 rounded-full text-white font-bold transition transform hover:scale-[1.02] shadow-lg"
            >
                Initiate New Transfer
            </button>
        </div>
    );

    // Main content rendering based on current step.
    const renderContent = () => {
        switch (currentStep) {
            case 1: return renderStep1Input();
            case 2: return renderStep2Review();
            case 4: return renderStep4Confirmation(); // Skip step 3 in UI flow, handled by modal.
            default: return renderStep1Input(); // Fallback to step 1.
        }
    };

    // Button text logic.
    const getButtonText = () => {
        if (currentStep === 1) return "Review Transaction";
        if (currentStep === 2) return `Authorize & Send (${currentCurrency.symbol}${amount})`;
        if (currentStep === 4) return "Done";
        return "Next";
    };

    // Button disabled logic.
    const isButtonDisabled = !isValidInput && currentStep !== 4;

    return (
        <div className="max-w-4xl mx-auto p-6 bg-gray-900 rounded-2xl shadow-2xl border border-gray-700/50">
            <h1 className="text-4xl font-extrabold text-white mb-2 tracking-tighter">Nexus Pay Transfer</h1>
            <p className="text-cyan-400 mb-8 border-b border-gray-700 pb-3">Secure and efficient single-rail payment interface.</p>

            {/* Step Indicator Navigation */}
            {currentStep !== 4 && (
                <div className="flex justify-between mb-8 text-sm font-medium">
                    <div className={`flex-1 text-center py-2 rounded-l-lg ${currentStep >= 1 ? 'bg-cyan-700 text-white' : 'bg-gray-700 text-gray-400'}`}>1. Details</div>
                    <div className={`flex-1 text-center py-2 ${currentStep === 2 ? 'bg-cyan-700 text-white' : currentStep > 2 ? 'bg-green-700 text-white' : 'bg-gray-700 text-gray-400'}`}>2. Review</div>
                    <div className={`flex-1 text-center py-2 rounded-r-lg ${currentStep === 3 ? 'bg-purple-700 text-white' : 'bg-gray-700 text-gray-400'}`}>3. Authenticate</div>
                </div>
            )}

            {/* Content area for steps */}
            <Card title={currentStep === 1 ? "Step 1: Transaction Details" : currentStep === 2 ? "Step 2: Review & Confirm" : ""}>
                {renderContent()}
            </Card>

            {/* Action Buttons */}
            {currentStep !== 4 && (
                <div className="flex justify-end gap-4 mt-8">
                    {currentStep === 2 && (
                        <button 
                            onClick={() => setCurrentStep(1)} 
                            className="px-6 py-3 bg-gray-600 hover:bg-gray-500 rounded-xl text-white font-semibold transition shadow-md"
                        >
                            &larr; Back to Details
                        </button>
                    )}
                    
                    <button 
                        onClick={handleSendClick} 
                        disabled={isButtonDisabled || currentStep === 3} 
                        className={`px-8 py-3 rounded-xl text-white font-bold transition transform shadow-lg 
                            ${currentStep === 2 ? 'bg-red-600 hover:bg-red-500' : 'bg-cyan-600 hover:bg-cyan-500'} 
                            disabled:opacity-40 disabled:cursor-not-allowed
                            ${currentStep !== 2 && 'hover:scale-[1.02]'}
                            ${currentStep === 2 && 'hover:scale-[1.02]'}
                        `}
                    >
                        {getButtonText()}
                    </button>
                </div>
            )}

            {/* Biometric Modal Trigger */}
            <BiometricModal 
                isOpen={showBiometricModal} 
                onSuccess={handleBiometricSuccess} 
                onClose={() => setShowBiometricModal(false)} 
                amount={amount} 
                recipient={selectedRecipient || recipientIdentifier} 
                paymentMethod={paymentMethod} 
            />
            <style>{`.animate-fade-in { animation: fadeIn 0.5s ease-out; } @keyframes fadeIn { from { opacity: 0; } to { opacity: 1; } }`}</style>
        </div>
    );
};

export default SendMoneyView;