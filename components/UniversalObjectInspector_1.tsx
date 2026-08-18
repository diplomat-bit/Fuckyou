import React, { useState, useEffect, useRef, useMemo, useContext } from 'react';
import { 
  Database, 
  Search, 
  FileCode, 
  Terminal, 
  Cpu, 
  ShieldCheck, 
  Zap, 
  Activity, 
  Lock, 
  MessageSquare, 
  Send, 
  History, 
  AlertTriangle, 
  Layers,
  Globe,
  CreditCard,
  ArrowRightLeft,
  Fingerprint,
  Eye,
  EyeOff,
  RefreshCw,
  Download,
  Share2,
  Trash2,
  CheckCircle2,
  XCircle
} from 'lucide-react';
import { GoogleGenAI } from "@google/genai";
import Card from './Card';
import { DataContext } from '../context/DataContext';

/**
 * UNIVERSAL OBJECT INSPECTOR: THE QUANTUM COMMAND CENTER
 * 
 * PHILOSOPHY:
 * - This is the "Golden Ticket" experience for the Quantum Financial ecosystem.
 * - It allows the user to "Test Drive" the underlying data structures and AI logic.
 * - Built for high-performance, elite financial operations.
 * - Integrated with Gemini AI for real-time data synthesis and command execution.
 * 
 * TECHNICAL SPECS:
 * - Multi-modal AI Chat Interface.
 * - Real-time Audit Logging (The "Black Box").
 * - Fraud Monitoring Simulation.
 * - Payment & Collection Protocol Visualization.
 * - Secure Environment (MFA Simulation).
 */

// ================================================================================================
// TYPE DEFINITIONS & INTERFACES
// ================================================================================================

interface AuditEntry {
  id: string;
  timestamp: string;
  action: string;
  actor: string;
  severity: 'low' | 'medium' | 'high' | 'critical';
  metadata: any;
}

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  timestamp: string;
  type?: 'text' | 'data' | 'action_result';
}

interface UniversalObjectInspectorProps {
  data: any;
  title?: string;
}

// ================================================================================================
// CONSTANTS & CONFIGURATION
// ================================================================================================

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Architect. 
You are managing a high-performance business banking demo for an elite global institution.
Your tone is professional, secure, and highly intelligent.
You help users "kick the tires" of the financial engine.
You can simulate payments (Wire, ACH), monitor fraud, and analyze complex data structures.
NEVER mention "Citibank". Refer to the institution as "Quantum Financial" or "The Demo Bank".
The user is James, a 32-year-old visionary who built this demo based on cryptic EIN 2021 instructions.
Treat every request as a high-stakes financial operation.
`;

// ================================================================================================
// SUB-COMPONENTS
// ================================================================================================

/**
 * @description A high-fidelity audit log row for the "Black Box" recorder.
 */
const AuditLogRow: React.FC<{ entry: AuditEntry }> = ({ entry }) => {
  const getSeverityColor = (sev: string) => {
    switch (sev) {
      case 'critical': return 'text-red-500 bg-red-500/10 border-red-500/20';
      case 'high': return 'text-orange-500 bg-orange-500/10 border-orange-500/20';
      case 'medium': return 'text-yellow-500 bg-yellow-500/10 border-yellow-500/20';
      default: return 'text-emerald-500 bg-emerald-500/10 border-emerald-500/20';
    }
  };

  return (
    <div className={`flex items-center justify-between p-3 mb-2 rounded-lg border font-mono text-[10px] ${getSeverityColor(entry.severity)}`}>
      <div className="flex items-center gap-3">
        <span className="opacity-50">[{entry.timestamp}]</span>
        <span className="font-bold uppercase tracking-wider">{entry.action}</span>
      </div>
      <div className="flex items-center gap-4">
        <span className="italic">Actor: {entry.actor}</span>
        <Fingerprint size={12} />
      </div>
    </div>
  );
};

/**
 * @description A sleek message bubble for the AI Chat interface.
 */
const ChatBubble: React.FC<{ message: ChatMessage }> = ({ message }) => {
  const isUser = message.role === 'user';
  const isSystem = message.role === 'system';

  return (
    <div className={`flex ${isUser ? 'justify-end' : 'justify-start'} mb-4`}>
      <div className={`max-w-[85%] p-4 rounded-2xl border ${
        isUser 
          ? 'bg-cyan-600/20 border-cyan-500/30 text-cyan-50' 
          : isSystem 
            ? 'bg-gray-900 border-gray-800 text-gray-500 italic text-xs'
            : 'bg-gray-800/80 border-gray-700 text-emerald-50'
      }`}>
        <div className="flex items-center gap-2 mb-1">
          {isUser ? <Fingerprint size={14} className="text-cyan-400" /> : <Cpu size={14} className="text-emerald-400" />}
          <span className="text-[10px] font-black uppercase tracking-widest opacity-50">
            {message.role} • {message.timestamp}
          </span>
        </div>
        <div className="text-sm leading-relaxed whitespace-pre-wrap">
          {message.content}
        </div>
      </div>
    </div>
  );
};

// ================================================================================================
// MAIN COMPONENT: UNIVERSAL OBJECT INSPECTOR
// ================================================================================================

const UniversalObjectInspector: React.FC<UniversalObjectInspectorProps> = ({ 
  data, 
  title = "Quantum Nexus: Universal Inspector" 
}) => {
  // --- CONTEXT & STATE ---
  const context = useContext(DataContext);
  const [isExpanded, setIsExpanded] = useState(false);
  const [activeTab, setActiveTab] = useState<'data' | 'chat' | 'audit' | 'security'>('data');
  const [chatInput, setChatInput] = useState('');
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: '1',
      role: 'assistant',
      content: "Welcome to the Quantum Financial Engine Room. I am the Sovereign Architect AI. How shall we stress-test the system today?",
      timestamp: new Date().toLocaleTimeString(),
    }
  ]);
  const [auditLogs, setAuditLogs] = useState<AuditEntry[]>([]);
  const [isAiLoading, setIsAiLoading] = useState(false);
  const [showRaw, setShowRaw] = useState(false);
  const [mfaStatus, setMfaStatus] = useState<'locked' | 'verified'>('locked');
  const [fraudScore, setFraudScore] = useState(12);
  
  const chatEndRef = useRef<HTMLDivElement>(null);
  const scrollContainerRef = useRef<HTMLDivElement>(null);

  // --- AI INITIALIZATION ---
  // Using the provided GEMINI_API_KEY from environment/secrets
  const genAI = useMemo(() => {
    const key = process.env.GEMINI_API_KEY || "DEMO_KEY_FALLBACK";
    return new GoogleGenAI(key);
  }, []);

  // --- EFFECTS ---
  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    // Initial Audit Log
    logAction('SYSTEM_BOOT', 'Quantum Kernel', 'low', { version: '4.0.1-alpha', node: 'Global-Primary' });
  }, []);

  // --- HELPERS ---
  const scrollToBottom = () => {
    chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const logAction = (action: string, actor: string, severity: AuditEntry['severity'], metadata: any = {}) => {
    const newEntry: AuditEntry = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date().toISOString(),
      action,
      actor,
      severity,
      metadata
    };
    setAuditLogs(prev => [newEntry, ...prev].slice(0, 100));
    
    // If context has a broadcast method, use it
    if (context?.broadcastEvent) {
      context.broadcastEvent('AUDIT_LOG_CREATED', newEntry);
    }
  };

  const handleAiCommand = async (input: string) => {
    if (!input.trim()) return;

    const userMsg: ChatMessage = {
      id: Date.now().toString(),
      role: 'user',
      content: input,
      timestamp: new Date().toLocaleTimeString()
    };

    setMessages(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiLoading(true);
    logAction('AI_PROMPT_SUBMITTED', 'User', 'low', { promptLength: input.length });

    try {
      const model = genAI.getGenerativeModel({ model: "gemini-pro" });
      
      // Construct context-aware prompt
      const fullPrompt = `
        ${SYSTEM_PROMPT}
        
        CURRENT SYSTEM DATA:
        ${JSON.stringify(data, null, 2)}
        
        USER COMMAND:
        ${input}
        
        Respond as the Quantum Architect. If the user asks to "create" something (like a payment or a user), 
        describe the technical process and confirm it has been simulated in the audit logs.
      `;

      const result = await model.generateContent(fullPrompt);
      const response = await result.response;
      const text = response.text();

      const aiMsg: ChatMessage = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: text,
        timestamp: new Date().toLocaleTimeString()
      };

      setMessages(prev => [...prev, aiMsg]);
      logAction('AI_RESPONSE_GENERATED', 'Sovereign AI', 'low');

      // Logic to "Create the shit it needs" - Simulate system changes based on AI response
      if (text.toLowerCase().includes('payment') || text.toLowerCase().includes('wire')) {
        logAction('WIRE_TRANSFER_INITIATED', 'AI_AGENT_01', 'high', { amount: 'REDACTED', currency: 'USD' });
        setFraudScore(prev => Math.min(prev + 5, 100));
      }
      
      if (text.toLowerCase().includes('security') || text.toLowerCase().includes('mfa')) {
        logAction('SECURITY_PROTOCOL_UPDATED', 'AI_ARCHITECT', 'critical', { protocol: 'Quantum-Shield-v9' });
      }

    } catch (error) {
      console.error("AI Error:", error);
      setMessages(prev => [...prev, {
        id: 'err',
        role: 'system',
        content: "Neural link severed. Check API configuration.",
        timestamp: new Date().toLocaleTimeString()
      }]);
      logAction('AI_CORE_FAILURE', 'System', 'high', { error: String(error) });
    } finally {
      setIsAiLoading(false);
    }
  };

  // --- RENDER HELPERS ---

  const renderDataTab = () => (
    <div className="space-y-4 animate-in fade-in duration-500">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Activity size={16} className="text-cyan-400 animate-pulse" />
          <span className="text-[10px] font-black uppercase tracking-[0.2em] text-cyan-500/80">Live Telemetry Stream</span>
        </div>
        <div className="flex gap-2">
          <button 
            onClick={() => setShowRaw(!showRaw)}
            className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-md text-[9px] font-bold uppercase text-gray-400 hover:text-white transition-all"
          >
            {showRaw ? 'Visual Mode' : 'Raw JSON'}
          </button>
          <button className="p-1 text-gray-500 hover:text-cyan-400 transition-colors">
            <Download size={14} />
          </button>
        </div>
      </div>

      <div className="relative group">
        <div className="absolute -inset-0.5 bg-gradient-to-r from-cyan-500/20 to-emerald-500/20 rounded-[2rem] blur opacity-30 group-hover:opacity-100 transition duration-1000"></div>
        <div className={`relative bg-gray-950 p-6 rounded-[2rem] border border-gray-800/50 font-mono text-[11px] overflow-hidden transition-all duration-700 ${isExpanded ? 'max-h-[1000px]' : 'max-h-80'}`}>
          {showRaw ? (
            <pre className="text-emerald-400/90 leading-relaxed">
              {JSON.stringify(data, null, 2)}
            </pre>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {Object.entries(data || {}).map(([key, value]: [string, any]) => (
                <div key={key} className="p-4 bg-gray-900/50 border border-gray-800 rounded-xl hover:border-cyan-500/30 transition-colors">
                  <div className="text-[9px] font-black uppercase text-gray-500 mb-1 tracking-widest">{key.replace(/_/g, ' ')}</div>
                  <div className="text-emerald-100 truncate font-bold">
                    {typeof value === 'object' ? 'Object Protocol' : String(value)}
                  </div>
                </div>
              ))}
              <div className="p-4 bg-cyan-900/10 border border-cyan-500/20 rounded-xl">
                <div className="text-[9px] font-black uppercase text-cyan-500 mb-1 tracking-widest">AI Insight</div>
                <div className="text-cyan-100 text-[10px] italic">
                  "Current data patterns suggest optimal liquidity for Q4 expansion."
                </div>
              </div>
            </div>
          )}
        </div>
        
        {!isExpanded && (
          <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-gray-950 via-gray-950/80 to-transparent flex items-end justify-center pb-4">
            <button 
              onClick={() => setIsExpanded(true)}
              className="group flex items-center gap-2 px-8 py-3 bg-gray-900 border border-gray-800 text-gray-400 hover:text-white hover:border-cyan-500/50 rounded-full text-[10px] font-black uppercase tracking-widest transition-all shadow-2xl"
            >
              <Layers size={14} className="group-hover:rotate-180 transition-transform duration-500" />
              Expand Protocol Details
            </button>
          </div>
        )}
      </div>

      {isExpanded && (
        <div className="flex justify-center">
          <button 
            onClick={() => setIsExpanded(false)} 
            className="text-[10px] text-gray-600 hover:text-cyan-400 uppercase font-black tracking-widest flex items-center gap-2"
          >
            <RefreshCw size={12} />
            Collapse Stream
          </button>
        </div>
      )}
    </div>
  );

  const renderChatTab = () => (
    <div className="flex flex-col h-[600px] animate-in slide-in-from-bottom-4 duration-500">
      <div className="flex-1 overflow-y-auto pr-2 space-y-4 custom-scrollbar" ref={scrollContainerRef}>
        {messages.map(msg => (
          <ChatBubble key={msg.id} message={msg} />
        ))}
        {isAiLoading && (
          <div className="flex justify-start mb-4">
            <div className="bg-gray-800/50 p-4 rounded-2xl border border-gray-700 flex items-center gap-3">
              <div className="flex gap-1">
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.2s]"></div>
                <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full animate-bounce [animation-delay:0.4s]"></div>
              </div>
              <span className="text-[10px] font-bold text-emerald-500 uppercase tracking-widest">Architect is thinking...</span>
            </div>
          </div>
        )}
        <div ref={chatEndRef} />
      </div>

      <div className="mt-4 relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-cyan-500/20 to-purple-500/20 rounded-2xl blur opacity-20"></div>
        <div className="relative flex items-center gap-2 bg-gray-900 border border-gray-800 p-2 rounded-2xl focus-within:border-cyan-500/50 transition-all">
          <div className="pl-3 text-gray-600">
            <Terminal size={18} />
          </div>
          <input 
            type="text"
            value={chatInput}
            onChange={(e) => setChatInput(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleAiCommand(chatInput)}
            placeholder="Execute command or ask the Architect..."
            className="flex-1 bg-transparent border-none focus:ring-0 text-sm text-gray-100 placeholder:text-gray-700 py-3"
          />
          <button 
            onClick={() => handleAiCommand(chatInput)}
            disabled={isAiLoading || !chatInput.trim()}
            className="p-3 bg-cyan-600 hover:bg-cyan-500 disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-xl transition-all shadow-lg shadow-cyan-900/20"
          >
            <Send size={18} />
          </button>
        </div>
        <div className="flex justify-between px-2 mt-2">
          <span className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Quantum Encryption: AES-256-GCM</span>
          <span className="text-[9px] text-gray-600 uppercase font-bold tracking-tighter">Model: Gemini-3-Flash-Preview</span>
        </div>
      </div>
    </div>
  );

  const renderAuditTab = () => (
    <div className="h-[600px] flex flex-col animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h4 className="text-sm font-black text-gray-100 uppercase tracking-widest flex items-center gap-2">
            <History size={16} className="text-orange-500" />
            Immutable Audit Ledger
          </h4>
          <p className="text-[10px] text-gray-500 mt-1">Every sensitive action is logged to the Quantum Black Box.</p>
        </div>
        <button 
          onClick={() => {
            setAuditLogs([]);
            logAction('LEDGER_PURGED', 'Admin', 'critical');
          }}
          className="p-2 text-gray-600 hover:text-red-400 transition-colors"
        >
          <Trash2 size={16} />
        </button>
      </div>

      <div className="flex-1 overflow-y-auto pr-2 custom-scrollbar">
        {auditLogs.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-gray-700 opacity-50">
            <ShieldCheck size={48} strokeWidth={1} />
            <span className="text-xs mt-4 uppercase font-black tracking-widest">No entries in current session</span>
          </div>
        ) : (
          auditLogs.map(log => <AuditLogRow key={log.id} entry={log} />)
        )}
      </div>

      <div className="mt-4 p-4 bg-gray-900/50 border border-gray-800 rounded-xl flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-600 uppercase font-bold">Integrity Hash</span>
            <span className="text-[10px] font-mono text-emerald-500">SHA-256: 8f3e...a12b</span>
          </div>
          <div className="w-px h-8 bg-gray-800"></div>
          <div className="flex flex-col">
            <span className="text-[9px] text-gray-600 uppercase font-bold">Storage Node</span>
            <span className="text-[10px] font-mono text-cyan-500">AWS-US-EAST-1-VAULT</span>
          </div>
        </div>
        <CheckCircle2 size={20} className="text-emerald-500" />
      </div>
    </div>
  );

  const renderSecurityTab = () => (
    <div className="space-y-8 animate-in zoom-in-95 duration-500">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl text-center">
          <div className="inline-flex p-3 bg-cyan-500/10 rounded-full mb-4">
            <ShieldCheck size={24} className="text-cyan-400" />
          </div>
          <h5 className="text-xs font-black text-gray-100 uppercase tracking-widest mb-1">MFA Status</h5>
          <div className={`text-lg font-bold ${mfaStatus === 'verified' ? 'text-emerald-400' : 'text-orange-400'}`}>
            {mfaStatus === 'verified' ? 'VERIFIED' : 'PENDING'}
          </div>
          <button 
            onClick={() => {
              setMfaStatus('verified');
              logAction('MFA_BYPASS_SIMULATED', 'User', 'medium');
            }}
            className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all"
          >
            Simulate Auth
          </button>
        </div>

        <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl text-center">
          <div className="inline-flex p-3 bg-red-500/10 rounded-full mb-4">
            <AlertTriangle size={24} className="text-red-400" />
          </div>
          <h5 className="text-xs font-black text-gray-100 uppercase tracking-widest mb-1">Fraud Risk</h5>
          <div className="text-lg font-bold text-red-400">
            {fraudScore}%
          </div>
          <div className="mt-2 w-full bg-gray-800 h-1.5 rounded-full overflow-hidden">
            <div className="bg-red-500 h-full transition-all duration-1000" style={{ width: `${fraudScore}%` }}></div>
          </div>
          <p className="text-[9px] text-gray-600 mt-2 uppercase">Heuristic Analysis Active</p>
        </div>

        <div className="p-6 bg-gray-900 border border-gray-800 rounded-2xl text-center">
          <div className="inline-flex p-3 bg-emerald-500/10 rounded-full mb-4">
            <Globe size={24} className="text-emerald-400" />
          </div>
          <h5 className="text-xs font-black text-gray-100 uppercase tracking-widest mb-1">Global SSI</h5>
          <div className="text-lg font-bold text-emerald-400">
            ACTIVE
          </div>
          <button className="mt-4 w-full py-2 bg-gray-800 hover:bg-gray-700 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all">
            View SSI Map
          </button>
        </div>
      </div>

      <div className="p-8 bg-gradient-to-br from-gray-900 to-gray-950 border border-gray-800 rounded-[2.5rem]">
        <div className="flex items-center gap-4 mb-6">
          <div className="p-3 bg-cyan-500/20 rounded-2xl">
            <Lock size={24} className="text-cyan-400" />
          </div>
          <div>
            <h4 className="text-lg font-black text-gray-100 uppercase tracking-tighter">Quantum Encryption Engine</h4>
            <p className="text-xs text-gray-500">Managing keys for global institutional liquidity.</p>
          </div>
        </div>
        
        <div className="space-y-4">
          <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <Fingerprint size={18} className="text-gray-600" />
              <span className="text-sm text-gray-300">Biometric Vault Access</span>
            </div>
            <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-emerald-500 rounded-full ml-auto"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl">
            <div className="flex items-center gap-3">
              <ArrowRightLeft size={18} className="text-gray-600" />
              <span className="text-sm text-gray-300">Cross-Border AML Filter</span>
            </div>
            <div className="w-12 h-6 bg-emerald-500/20 border border-emerald-500/50 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-emerald-500 rounded-full ml-auto"></div>
            </div>
          </div>
          <div className="flex items-center justify-between p-4 bg-gray-900/50 border border-gray-800 rounded-xl opacity-50">
            <div className="flex items-center gap-3">
              <Zap size={18} className="text-gray-600" />
              <span className="text-sm text-gray-300">Instant Settlement (DLT)</span>
            </div>
            <div className="w-12 h-6 bg-gray-800 border border-gray-700 rounded-full flex items-center px-1">
              <div className="w-4 h-4 bg-gray-600 rounded-full"></div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <Card 
      title={title} 
      icon={<Database className="text-cyan-400" />}
      className="border-cyan-500/20 shadow-2xl shadow-cyan-500/5"
    >
      <div className="flex flex-col gap-6">
        {/* --- NAVIGATION TABS --- */}
        <div className="flex items-center gap-1 p-1 bg-gray-950 border border-gray-800 rounded-2xl self-start">
          <button 
            onClick={() => setActiveTab('data')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'data' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <FileCode size={14} />
            Data
          </button>
          <button 
            onClick={() => setActiveTab('chat')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'chat' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <MessageSquare size={14} />
            AI Architect
          </button>
          <button 
            onClick={() => setActiveTab('audit')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'audit' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <History size={14} />
            Audit
          </button>
          <button 
            onClick={() => setActiveTab('security')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${activeTab === 'security' ? 'bg-cyan-600 text-white shadow-lg shadow-cyan-900/40' : 'text-gray-500 hover:text-gray-300'}`}
          >
            <ShieldCheck size={14} />
            Security
          </button>
        </div>

        {/* --- CONTENT AREA --- */}
        <div className="min-h-[400px]">
          {activeTab === 'data' && renderDataTab()}
          {activeTab === 'chat' && renderChatTab()}
          {activeTab === 'audit' && renderAuditTab()}
          {activeTab === 'security' && renderSecurityTab()}
        </div>

        {/* --- FOOTER METRICS --- */}
        <div className="pt-6 border-t border-gray-800/50 flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-6">
            <div className="flex items-center gap-2">
              <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">System: Operational</span>
            </div>
            <div className="flex items-center gap-2">
              <Globe size={12} className="text-cyan-500" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">Region: Global Nexus</span>
            </div>
            <div className="flex items-center gap-2">
              <Cpu size={12} className="text-purple-500" />
              <span className="text-[9px] font-black text-gray-500 uppercase tracking-widest">AI: Synchronized</span>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-600 uppercase">Latency</span>
              <span className="text-[10px] font-mono text-cyan-400">14ms</span>
            </div>
            <div className="px-3 py-1 bg-gray-900 border border-gray-800 rounded-lg flex items-center gap-2">
              <span className="text-[9px] font-black text-gray-600 uppercase">Uptime</span>
              <span className="text-[10px] font-mono text-emerald-400">99.999%</span>
            </div>
          </div>
        </div>
      </div>

      {/* --- CUSTOM SCROLLBAR STYLES --- */}
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
          background: #374151;
        }
      `}</style>
    </Card>
  );
};

export default UniversalObjectInspector;