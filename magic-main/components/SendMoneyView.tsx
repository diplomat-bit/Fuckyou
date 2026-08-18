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