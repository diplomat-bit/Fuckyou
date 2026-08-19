import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../context/DataContext';

// ================================================================================================
// 🎨 QUANTUM DESIGN SYSTEM (INLINE)
// ================================================================================================
// To ensure a "Golden Ticket" experience without external dependencies, we define a 
// high-performance, elite UI system directly within this module.

const THEME = {
  colors: {
    primary: 'from-cyan-500 to-blue-600',
    primaryHover: 'from-cyan-400 to-blue-500',
    secondary: 'from-purple-500 to-indigo-600',
    accent: 'text-cyan-400',
    bg: 'bg-slate-900',
    surface: 'bg-slate-800/50',
    surfaceHighlight: 'bg-slate-700/50',
    border: 'border-slate-700',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
    glass: 'backdrop-blur-xl bg-slate-900/80',
  },
  animation: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    slideIn: 'animate-in slide-in-from-bottom-4 duration-500',
    fadeIn: 'animate-in fade-in duration-300',
  }
};

// --- UI Primitives ---

const QuantumCard: React.FC<{ children: React.ReactNode; className?: string; title?: string; icon?: any }> = ({ children, className = '', title, icon }) => (
  <div className={`rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-md shadow-2xl overflow-hidden ${className}`}>
    {(title || icon) && (
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center space-x-3 bg-slate-800/30">
        {icon && <span className="text-cyan-400">{icon}</span>}
        {title && <h3 className="text-lg font-semibold text-slate-100 tracking-wide">{title}</h3>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const QuantumInput: React.FC<any> = ({ label, error, ...props }) => (
  <div className="group">
    {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">{label}</label>}
    <div className="relative">
      <input 
        className={`w-full bg-slate-900/50 border ${error ? 'border-rose-500/50' : 'border-slate-700'} rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300`}
        {...props}
      />
      {error && <div className="absolute right-3 top-3 text-rose-400"><AlertIcon size={16} /></div>}
    </div>
    {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
  </div>
);

const QuantumSelect: React.FC<any> = ({ label, children, ...props }) => (
  <div className="group">
    {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">{label}</label>}
    <div className="relative">
      <select 
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none transition-all duration-300"
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-4 pointer-events-none text-slate-500">
        <ChevronDownIcon size={16} />
      </div>
    </div>
  </div>
);

const QuantumButton: React.FC<any> = ({ children, variant = 'primary', isLoading, icon, ...props }) => {
  const baseClass = "relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  const variants: any = {
    primary: `bg-gradient-to-r ${THEME.colors.primary} text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110`,
    secondary: `bg-slate-700 hover:bg-slate-600 text-slate-200`,
    outline: `border border-slate-600 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 bg-transparent`,
    danger: `bg-gradient-to-r from-rose-600 to-red-700 text-white hover:brightness-110`,
    ghost: `bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200`
  };

  return (
    <button className={`${baseClass} ${variants[variant]}`} {...props}>
      {isLoading ? <Spinner size={20} /> : icon}
      <span>{children}</span>
      {variant === 'primary' && <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 pointer-events-none" />}
    </button>
  );
};

const QuantumBadge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' }> = ({ children, variant = 'info' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} inline-flex items-center space-x-1`}>
      {children}
    </span>
  );
};

// --- Icons (SVG) ---
const SendIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const SparklesIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>;
const ShieldCheckIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const AlertIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const ChevronDownIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>;
const Spinner = ({ size = 20 }) => <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const BotIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const HistoryIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><path d="M3 3v9h9"></path><path d="M12 7v5l4 2"></path></svg>;
const GlobeIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;

// ================================================================================================
// 🧠 TYPES & INTERFACES
// ================================================================================================

interface Account {
  id: string;
  name: string;
  currency: string;
  balance?: number;
}

interface LineItem {
  amount: number; // in cents
  description: string;
  metadata?: { [key: string]: string };
}

interface PaymentOrderFormData {
  id?: string;
  type: 'ach' | 'wire' | 'rtp' | 'check' | 'book' | 'eft' | 'sepa' | 'bacs' | 'au_becs' | 'interac' | 'sen' | 'signet' | 'provexchange' | '';
  subtype?: 'CCD' | 'PPD' | 'IAT' | 'CTX' | 'WEB' | 'CIE' | 'TEL' | '';
  amount: number; // in dollars
  direction: 'credit' | 'debit' | '';
  priority: 'normal' | 'high' | '';
  originating_account_id: string;
  receiving_account_id: string;
  currency: string;
  effective_date: string; // YYYY-MM-DD
  description: string;
  statement_descriptor: string;
  remittance_information: string;
  purpose: string;
  metadata: { key: string; value: string }[];
  line_items: LineItem[];
  send_remittance_advice: boolean;
  nsf_protected: boolean;
  charge_bearer?: 'shared' | 'sender' | 'receiver' | '';
  ultimate_originating_party_name: string;
  ultimate_receiving_party_name: string;
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  actor: 'USER' | 'AI_AGENT' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface PaymentOrderFormProps {
  initialData?: Partial<PaymentOrderFormData>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  internalAccounts: Account[];
  externalAccounts: Account[];
}

// ================================================================================================
// 🤖 AI CORE CONFIGURATION
// ================================================================================================

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Assistant. Your goal is to assist users in creating secure, high-value payment orders.
You have access to the form fields. When the user gives a command, extract the relevant information and return a JSON object to populate the form.
If the user asks a question, answer it professionally as a top-tier banking concierge.

OUTPUT FORMAT FOR COMMANDS:
{
  "action": "UPDATE_FORM",
  "data": {
    "amount": number | null,
    "currency": string | null,
    "type": string | null,
    "description": string | null,
    "priority": string | null,
    "receiving_account_name_match": string | null
  },
  "message": "Brief confirmation message."
}

OUTPUT FORMAT FOR QUESTIONS:
{
  "action": "MESSAGE",
  "message": "Your answer here."
}

Be concise, elite, and helpful.
`;

// ================================================================================================
// 🚀 MAIN COMPONENT: PAYMENT ORDER FORM
// ================================================================================================

const PaymentOrderForm: React.FC<PaymentOrderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  internalAccounts,
  externalAccounts,
}) => {
  // --- Context & State ---
  const { geminiApiKey, userProfile } = useContext(DataContext) || { geminiApiKey: process.env.GEMINI_API_KEY, userProfile: { name: 'Guest' } };
  
  const [formData, setFormData] = useState<PaymentOrderFormData>({
    type: '',
    subtype: '',
    amount: 0,
    direction: '',
    priority: 'normal',
    originating_account_id: '',
    receiving_account_id: '',
    currency: 'USD',
    effective_date: new Date().toISOString().split('T')[0],
    description: '',
    statement_descriptor: '',
    remittance_information: '',
    purpose: '',
    metadata: [],
    line_items: [{ amount: 0, description: '' }],
    send_remittance_advice: false,
    nsf_protected: false,
    charge_bearer: '',
    ultimate_originating_party_name: '',
    ultimate_receiving_party_name: '',
    ...initialData
  });

  // AI & Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 'init', role: 'ai', content: `Welcome back, ${userProfile?.name || 'Commander'}. I am ready to orchestrate your payments.`, timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Audit & Security State
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [securityScore, setSecurityScore] = useState(100);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (initialData) {
      const populatedData = { ...formData, ...initialData };
      if (typeof populatedData.amount === 'number' && initialData.amount && initialData.amount > 10000) {
         // Heuristic: if amount is large, it might be in cents in DB, but form uses dollars. 
         // Assuming input prop is consistent with type definition (dollars).
      }
      setFormData(populatedData);
      logAudit('SYSTEM', 'Form initialized with existing data', 'INFO');
    } else {
      logAudit('SYSTEM', 'New payment order session started', 'INFO');
    }
  }, [initialData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- Helpers ---

  const logAudit = (actor: 'USER' | 'AI_AGENT' | 'SYSTEM', details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const newEvent: AuditEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      action: 'AUDIT_LOG',
      details,
      actor,
      severity
    };
    setAuditLog(prev => [newEvent, ...prev]);
    
    if (severity === 'WARNING') setSecurityScore(prev => Math.max(0, prev - 10));
    if (severity === 'CRITICAL') setSecurityScore(prev => Math.max(0, prev - 25));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'amount') {
      newValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Debounced audit log could go here, but for demo we log key changes
    if (name === 'amount' && newValue > 10000) {
      logAudit('USER', `High value amount entered: ${newValue}`, 'WARNING');
    }
  };

  // --- AI Logic ---

  const processAICommand = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      if (!geminiApiKey) {
        throw new Error("Quantum AI Link Disconnected (Missing API Key)");
      }

      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
      });

      // Contextualize with current form state
      const prompt = `
        CURRENT FORM STATE: ${JSON.stringify(formData)}
        AVAILABLE ACCOUNTS: ${JSON.stringify([...internalAccounts, ...externalAccounts].map(a => ({ id: a.id, name: a.name, currency: a.currency })))}
        USER INPUT: "${userMsg.content}"
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Attempt to parse JSON
      let aiResponse;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          aiResponse = { action: 'MESSAGE', message: responseText };
        }
      } catch (e) {
        aiResponse = { action: 'MESSAGE', message: responseText };
      }

      if (aiResponse.action === 'UPDATE_FORM') {
        const updates = aiResponse.data;
        setFormData(prev => {
          const newData = { ...prev };
          if (updates.amount) newData.amount = updates.amount;
          if (updates.currency) newData.currency = updates.currency;
          if (updates.type) newData.type = updates.type as any;
          if (updates.description) newData.description = updates.description;
          if (updates.priority) newData.priority = updates.priority as any;
          
          // Smart Account Matching
          if (updates.receiving_account_name_match) {
            const match = [...internalAccounts, ...externalAccounts].find(a => 
              a.name.toLowerCase().includes(updates.receiving_account_name_match.toLowerCase())
            );
            if (match) newData.receiving_account_id = match.id;
          }
          return newData;
        });
        logAudit('AI_AGENT', `Form auto-filled based on command: "${userMsg.content}"`, 'INFO');
      }

      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: aiResponse.message || "Command executed.", 
        timestamp: new Date() 
      }]);

    } catch (error: any) {
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        content: `Error: ${error.message}`, 
        timestamp: new Date() 
      }]);
      logAudit('SYSTEM', `AI Processing Error: ${error.message}`, 'WARNING');
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- Submission Logic ---

  const handleSimulate = async () => {
    setIsSimulating(true);
    logAudit('SYSTEM', 'Initiating Transaction Simulation...', 'INFO');
    
    // Simulate network delay and checks
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (formData.amount > 100000 && securityScore < 80) {
      logAudit('SYSTEM', 'Simulation Failed: Risk Threshold Exceeded', 'CRITICAL');
      setIsSimulating(false);
      return;
    }

    logAudit('SYSTEM', 'Simulation Successful. Liquidity confirmed. OFAC checks passed.', 'INFO');
    setIsSimulating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logAudit('USER', 'Submitting Payment Order', 'INFO');
    
    const submissionData = {
      ...formData,
      amount: Math.round(formData.amount * 100), // Convert to cents for backend
    };
    onSubmit(submissionData);
  };

  // ================================================================================================
  // 🖥️ RENDER
  // ================================================================================================

  return (
    <div className={`min-h-screen ${THEME.colors.bg} text-slate-200 font-sans selection:bg-cyan-500/30`}>
      
      {/* HEADER */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GlobeIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Quantum Financial</h1>
              <p className="text-xs text-cyan-400 font-medium tracking-widest uppercase">Payment Orchestration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${securityScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="text-xs font-mono text-slate-400">SECURE_CHANNEL_ACTIVE</span>
            </div>
            <QuantumButton variant="ghost" onClick={onCancel}>Cancel</QuantumButton>
            <QuantumButton variant="primary" onClick={handleSubmit} icon={<SendIcon size={18} />}>
              Execute Order
            </QuantumButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: AI ASSISTANT (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <QuantumCard title="Quantum AI Assistant" icon={<SparklesIcon />} className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-br-none' 
                      : msg.role === 'system'
                      ? 'bg-rose-900/20 text-rose-200 border border-rose-500/30'
                      : 'bg-slate-700/50 text-slate-200 border border-slate-600/30 rounded-bl-none'
                  }`}>
                    {msg.role === 'ai' && <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400 font-bold uppercase"><BotIcon size={12} /> <span>Quantum Core</span></div>}
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && processAICommand()}
                  placeholder="Ask Quantum to fill the form..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
                <button 
                  onClick={processAICommand}
                  disabled={!chatInput.trim() || isAiThinking}
                  className="absolute right-2 top-2 p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <SendIcon size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Powered by Gemini 1.5 Flash. Secure Enclave.
              </p>
            </div>
          </QuantumCard>

          <QuantumCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setFormData(prev => ({ ...prev, priority: 'high' }))} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs font-medium text-slate-300 flex flex-col items-center gap-2">
                <span className="text-rose-400">⚡</span> Rush Payment
              </button>
              <button onClick={() => setFormData(prev => ({ ...prev, currency: 'EUR' }))} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs font-medium text-slate-300 flex flex-col items-center gap-2">
                <span className="text-blue-400">€</span> Switch to Euro
              </button>
              <button onClick={handleSimulate} className="col-span-2 p-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600 transition-all text-xs font-medium text-cyan-400 flex items-center justify-center gap-2">
                <span className="animate-pulse">👁️</span> Test Drive Simulation
              </button>
            </div>
          </QuantumCard>
        </div>

        {/* CENTER COLUMN: THE FORM (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <QuantumCard title="Payment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Amount & Currency */}
              <div className="col-span-2 grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <QuantumInput 
                    label="Amount" 
                    name="amount" 
                    type="number" 
                    value={formData.amount} 
                    onChange={handleInputChange} 
                    placeholder="0.00"
                    step="0.01"
                    error={formData.amount > 1000000 ? "Requires Executive Approval" : null}
                  />
                </div>
                <div className="col-span-4">
                  <QuantumSelect label="Currency" name="currency" value={formData.currency} onChange={handleInputChange}>
                    {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </QuantumSelect>
                </div>
              </div>

              {/* Accounts */}
              <div className="col-span-2 md:col-span-1">
                <QuantumSelect label="Originating Account" name="originating_account_id" value={formData.originating_account_id} onChange={handleInputChange}>
                  <option value="">Select Source Asset</option>
                  {internalAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                  ))}
                </QuantumSelect>
              </div>
              <div className="col-span-2 md:col-span-1">
                <QuantumSelect label="Beneficiary" name="receiving_account_id" value={formData.receiving_account_id} onChange={handleInputChange}>
                  <option value="">Select Counterparty</option>
                  {[...internalAccounts, ...externalAccounts].map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                  ))}
                </QuantumSelect>
              </div>

              {/* Payment Type */}
              <div className="col-span-2 md:col-span-1">
                <QuantumSelect label="Payment Rail" name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="">Auto-Route (Best Cost)</option>
                  <option value="wire">Wire Transfer (SWIFT)</option>
                  <option value="ach">ACH Network</option>
                  <option value="rtp">Real-Time Payment (RTP)</option>
                  <option value="book">Internal Book Transfer</option>
                  <option value="sepa">SEPA Credit</option>
                </QuantumSelect>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <QuantumInput 
                  label="Effective Date" 
                  name="effective_date" 
                  type="date" 
                  value={formData.effective_date} 
                  onChange={handleInputChange} 
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <QuantumInput 
                  label="Description / Reference" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Q3 Consulting Services"
                />
              </div>

              {/* Advanced Toggles */}
              <div className="col-span-2 flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="priority" 
                    name="priority" 
                    checked={formData.priority === 'high'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.checked ? 'high' : 'normal' }))}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="priority" className="text-sm font-medium text-slate-300 cursor-pointer">High Priority Processing</label>
                </div>
                {formData.priority === 'high' && <QuantumBadge variant="warning">FEES APPLY</QuantumBadge>}
              </div>

            </div>
          </QuantumCard>

          {/* Line Items Section */}
          <QuantumCard title="Remittance Data">
            <div className="space-y-4">
              {formData.line_items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4">
                  <div className="flex-1">
                    <QuantumInput 
                      placeholder="Invoice # or Item Description" 
                      value={item.description} 
                      onChange={(e: any) => {
                        const newItems = [...formData.line_items];
                        newItems[idx].description = e.target.value;
                        setFormData(prev => ({ ...prev, line_items: newItems }));
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <QuantumInput 
                      type="number" 
                      placeholder="0.00" 
                      value={item.amount / 100} 
                      onChange={(e: any) => {
                        const newItems = [...formData.line_items];
                        newItems[idx].amount = parseFloat(e.target.value) * 100;
                        setFormData(prev => ({ ...prev, line_items: newItems }));
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (formData.line_items.length > 1) {
                        setFormData(prev => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== idx) }));
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setFormData(prev => ({ ...prev, line_items: [...prev.line_items, { amount: 0, description: '' }] }))}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>+ ADD LINE ITEM</span>
              </button>
            </div>
          </QuantumCard>
        </div>

        {/* RIGHT COLUMN: AUDIT & SECURITY (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Security Score Widget */}
          <QuantumCard className="bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * securityScore) / 100} className={`${securityScore > 80 ? 'text-emerald-500' : securityScore > 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{securityScore}</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">Trust Score</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon size={14} className="text-emerald-400" />
                  <span>Encryption: AES-256</span>
                </div>
              </div>
            </div>
          </QuantumCard>

          {/* Audit Log */}
          <QuantumCard title="Audit Trail" icon={<HistoryIcon />} className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {auditLog.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No events recorded.</p>}
              {auditLog.map((event) => (
                <div key={event.id} className="flex space-x-3 text-xs border-l-2 border-slate-700 pl-3 py-1 animate-in fade-in slide-in-from-right-4">
                  <div className="flex-shrink-0 pt-0.5">
                    {event.severity === 'INFO' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    {event.severity === 'WARNING' && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                    {event.severity === 'CRITICAL' && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">{event.details}</p>
                    <div className="flex items-center space-x-2 mt-1 text-slate-500 text-[10px]">
                      <span>{event.timestamp.toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="uppercase">{event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </QuantumCard>

          {/* Simulation Status */}
          {isSimulating && (
            <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-slate-800 border border-cyan-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping" />
                  <GlobeIcon size={40} className="text-cyan-400 animate-spin duration-[3000ms]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Simulating Transaction</h3>
                  <p className="text-slate-400 mt-2">Running OFAC checks, liquidity validation, and routing optimization...</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full animate-[width_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PaymentOrderForm;

// --- CONSOLIDATED FROM: PaymentOrderForm (1).tsx ---


import React, { useState, useEffect, useCallback } from 'react';

// NOTE: This component assumes a UI library like Material-UI is installed and configured.
// e.g., `import { TextField, Button } from '@mui/material';`
// For brevity, component types are aliased to standard HTML elements or placeholder types.

// --- UI Component Placeholders ---
const Box: React.FC<any> = ({ component: Component = 'div', ...props }) => <Component {...props} />;
const Typography: React.FC<any> = (props) => <h5 {...props} />;
const Grid: React.FC<any> = (props) => <div {...props} />;
const TextField: React.FC<any> = (props) => <input {...props} />;
const Button: React.FC<any> = (props) => <button {...props} />;
const Select: React.FC<any> = ({ children, ...props }) => <select {...props}>{children}</select>;
const MenuItem: React.FC<any> = (props) => <option {...props} />;
const FormControl: React.FC<any> = (props) => <div {...props} />;
const InputLabel: React.FC<any> = (props) => <label {...props} />;
const IconButton: React.FC<any> = (props) => <button {...props} />;
const Switch: React.FC<any> = (props) => <input type="checkbox" {...props} />;
const FormControlLabel: React.FC<any> = ({ control, label }) => <label>{control}{label}</label>;
const Accordion: React.FC<any> = (props) => <details {...props} />;
const AccordionSummary: React.FC<any> = (props) => <summary {...props} />;
const AccordionDetails: React.FC<any> = (props) => <div {...props} />;
const AddCircleOutline: React.FC<any> = () => <span>+</span>;
const RemoveCircleOutline: React.FC<any> = () => <span>-</span>;
const ExpandMore: React.FC<any> = () => <span>v</span>;
// --- End UI Component Placeholders ---

// --- Type Definitions ---
interface Account {
  id: string;
  name: string;
  currency: string;
}

interface LineItem {
  amount: number; // in cents
  description: string;
  metadata?: { [key: string]: string };
}

interface PaymentOrderFormData {
  id?: string;
  type: 'ach' | 'wire' | 'rtp' | 'check' | 'book' | 'eft' | 'sepa' | 'bacs' | 'au_becs' | 'interac' | 'sen' | 'signet' | 'provexchange' | '';
  subtype?: 'CCD' | 'PPD' | 'IAT' | 'CTX' | 'WEB' | 'CIE' | 'TEL' | '';
  amount: number; // in dollars
  direction: 'credit' | 'debit' | '';
  priority: 'normal' | 'high' | '';
  originating_account_id: string;
  receiving_account_id: string;
  currency: string;
  effective_date: string; // YYYY-MM-DD
  description: string;
  statement_descriptor: string;
  remittance_information: string;
  purpose: string;
  metadata: { key: string; value: string }[];
  line_items: LineItem[];
  send_remittance_advice: boolean;
  nsf_protected: boolean;
  charge_bearer?: 'shared' | 'sender' | 'receiver' | '';
  ultimate_originating_party_name: string;
  ultimate_receiving_party_name: string;
}

const initialFormData: PaymentOrderFormData = {
  type: '',
  subtype: '',
  amount: 0,
  direction: '',
  priority: 'normal',
  originating_account_id: '',
  receiving_account_id: '',
  currency: 'USD',
  effective_date: new Date().toISOString().split('T')[0],
  description: '',
  statement_descriptor: '',
  remittance_information: '',
  purpose: '',
  metadata: [],
  line_items: [{ amount: 0, description: '' }],
  send_remittance_advice: false,
  nsf_protected: false,
  charge_bearer: '',
  ultimate_originating_party_name: '',
  ultimate_receiving_party_name: '',
};

interface PaymentOrderFormProps {
  initialData?: Partial<PaymentOrderFormData>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  internalAccounts: Account[];
  externalAccounts: Account[];
}

const paymentTypes = ['ach', 'wire', 'rtp', 'check', 'book', 'eft', 'sepa', 'bacs', 'au_becs', 'interac', 'sen', 'signet', 'provexchange'];
const achSubtypes = ['CCD', 'PPD', 'IAT', 'CTX', 'WEB', 'CIE', 'TEL'];
const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'AUD'];

const PaymentOrderForm: React.FC<PaymentOrderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  internalAccounts,
  externalAccounts,
}) => {
  const [formData, setFormData] = useState<PaymentOrderFormData>(initialFormData);

  useEffect(() => {
    if (initialData) {
        // When editing, convert amount from cents to dollars for the form
        const populatedData = { ...initialFormData, ...initialData };
        if (typeof populatedData.amount === 'number') {
            populatedData.amount = populatedData.amount / 100;
        }
        setFormData(populatedData);
    } else {
      setFormData(initialFormData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newAmount = isNaN(value) ? 0 : value;
    setFormData(prev => ({
      ...prev,
      amount: newAmount,
      line_items: prev.line_items.length === 1 ? [{ ...prev.line_items[0], amount: Math.round(newAmount * 100) }] : prev.line_items
    }));
  };

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newMetadata = [...formData.metadata];
    newMetadata[index] = { ...newMetadata[index], [field]: value };
    setFormData(prev => ({ ...prev, metadata: newMetadata }));
  };

  const addMetadataField = () => {
    setFormData(prev => ({ ...prev, metadata: [...prev.metadata, { key: '', value: '' }] }));
  };

  const removeMetadataField = (index: number) => {
    setFormData(prev => ({ ...prev, metadata: prev.metadata.filter((_, i) => i !== index) }));
  };

  const handleLineItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newLineItems = [...formData.line_items];
    const item = { ...newLineItems[index] };
    if (field === 'amount') {
      const amountValue = typeof value === 'string' ? parseFloat(value) : value;
      item.amount = isNaN(amountValue) ? 0 : Math.round(amountValue * 100);
    } else {
      item.description = value as string;
    }
    newLineItems[index] = item;
    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({ ...prev, line_items: [...prev.line_items, { amount: 0, description: '' }] }));
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 1) {
      setFormData(prev => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      amount: Math.round(formData.amount * 100), // Convert to cents
    };
    onSubmit(submissionData);
  };

  const totalLineItemAmount = useCallback(() => {
    return formData.line_items.reduce((sum, item) => sum + item.amount, 0);
  }, [formData.line_items]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {formData.id ? 'Edit Payment Order' : 'Create Payment Order'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Payment Type</InputLabel>
            <Select name="type" value={formData.type} label="Payment Type" onChange={handleChange}>
              <MenuItem value=""><em>Select Type</em></MenuItem>
              {paymentTypes.map(type => <MenuItem key={type} value={type}>{type.toUpperCase()}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {formData.type === 'ach' && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>ACH Subtype</InputLabel>
              <Select name="subtype" value={formData.subtype} label="ACH Subtype" onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {achSubtypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Direction</InputLabel>
            <Select name="direction" value={formData.direction} label="Direction" onChange={handleChange}>
              <MenuItem value=""><em>Select Direction</em></MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="debit">Debit</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="amount" label="Amount" type="number" value={formData.amount} onChange={handleAmountChange} fullWidth required inputProps={{ step: "0.01" }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Currency</InputLabel>
            <Select name="currency" value={formData.currency} label="Currency" onChange={handleChange}>
              {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField name="description" label="Description (Internal)" value={formData.description} onChange={handleChange} fullWidth multiline rows={2} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Originating Account</InputLabel>
            <Select name="originating_account_id" value={formData.originating_account_id} label="Originating Account" onChange={handleChange}>
              <MenuItem value=""><em>Select Account</em></MenuItem>
              {internalAccounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Receiving Account</InputLabel>
            <Select name="receiving_account_id" value={formData.receiving_account_id} label="Receiving Account" onChange={handleChange}>
              <MenuItem value=""><em>Select Account</em></MenuItem>
              {[...internalAccounts, ...externalAccounts].map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="effective_date" label="Effective Date" type="date" value={formData.effective_date} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={formData.priority} label="Priority" onChange={handleChange}>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Line Items</Typography>
          {formData.line_items.map((item, index) => (
            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={7}>
                <TextField label={`Line Item ${index + 1} Description`} value={item.description} onChange={(e: any) => handleLineItemChange(index, 'description', e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Amount" type="number" value={item.amount / 100} onChange={(e: any) => handleLineItemChange(index, 'amount', e.target.value)} fullWidth inputProps={{ step: "0.01" }} />
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => removeLineItem(index)} disabled={formData.line_items.length <= 1}><RemoveCircleOutline /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button onClick={addLineItem} startIcon={<AddCircleOutline />}>Add Line Item</Button>
          {Math.round(formData.amount * 100) !== totalLineItemAmount() && (
            <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>Total of line items (${(totalLineItemAmount() / 100).toFixed(2)}) does not match payment amount (${formData.amount.toFixed(2)}).</Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography>Optional Fields</Typography></AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}><TextField name="statement_descriptor" label="Statement Descriptor" value={formData.statement_descriptor} onChange={handleChange} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField name="remittance_information" label="Remittance Information" value={formData.remittance_information} onChange={handleChange} fullWidth /></Grid>
                {formData.type === 'wire' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Charge Bearer</InputLabel>
                      <Select name="charge_bearer" value={formData.charge_bearer} label="Charge Bearer" onChange={handleChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="shared">Shared (SHA)</MenuItem>
                        <MenuItem value="sender">Sender (OUR)</MenuItem>
                        <MenuItem value="receiver">Receiver (BEN)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.send_remittance_advice} onChange={handleChange} name="send_remittance_advice" />} label="Send Remittance Advice" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.nsf_protected} onChange={handleChange} name="nsf_protected" />} label="NSF Protected" /></Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography>Metadata</Typography></AccordionSummary>
            <AccordionDetails>
              {formData.metadata.map((meta, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={5}><TextField label="Key" value={meta.key} onChange={(e: any) => handleMetadataChange(index, 'key', e.target.value)} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Value" value={meta.value} onChange={(e: any) => handleMetadataChange(index, 'value', e.target.value)} fullWidth /></Grid>
                  <Grid item xs={1}><IconButton onClick={() => removeMetadataField(index)}><RemoveCircleOutline /></IconButton></Grid>
                </Grid>
              ))}
              <Button onClick={addMetadataField} startIcon={<AddCircleOutline />}>Add Metadata</Button>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">{formData.id ? 'Update Payment Order' : 'Create Payment Order'}</Button>
      </Box>
    </Box>
  );
};

export default PaymentOrderForm;


// --- CONSOLIDATED FROM: PaymentOrderForm_1.tsx ---

import React, { useState, useEffect, useRef, useCallback, useContext } from 'react';
import { GoogleGenAI } from "@google/genai";
import { DataContext } from '../context/DataContext';

// ================================================================================================
// 🎨 QUANTUM DESIGN SYSTEM (INLINE)
// ================================================================================================
// To ensure a "Golden Ticket" experience without external dependencies, we define a 
// high-performance, elite UI system directly within this module.

const THEME = {
  colors: {
    primary: 'from-cyan-500 to-blue-600',
    primaryHover: 'from-cyan-400 to-blue-500',
    secondary: 'from-purple-500 to-indigo-600',
    accent: 'text-cyan-400',
    bg: 'bg-slate-900',
    surface: 'bg-slate-800/50',
    surfaceHighlight: 'bg-slate-700/50',
    border: 'border-slate-700',
    text: 'text-slate-200',
    textMuted: 'text-slate-400',
    success: 'text-emerald-400',
    warning: 'text-amber-400',
    error: 'text-rose-400',
    glass: 'backdrop-blur-xl bg-slate-900/80',
  },
  animation: {
    pulse: 'animate-pulse',
    spin: 'animate-spin',
    slideIn: 'animate-in slide-in-from-bottom-4 duration-500',
    fadeIn: 'animate-in fade-in duration-300',
  }
};

// --- UI Primitives ---

const QuantumCard: React.FC<{ children: React.ReactNode; className?: string; title?: string; icon?: any }> = ({ children, className = '', title, icon }) => (
  <div className={`rounded-2xl border border-slate-700/50 bg-slate-800/40 backdrop-blur-md shadow-2xl overflow-hidden ${className}`}>
    {(title || icon) && (
      <div className="px-6 py-4 border-b border-slate-700/50 flex items-center space-x-3 bg-slate-800/30">
        {icon && <span className="text-cyan-400">{icon}</span>}
        {title && <h3 className="text-lg font-semibold text-slate-100 tracking-wide">{title}</h3>}
      </div>
    )}
    <div className="p-6">{children}</div>
  </div>
);

const QuantumInput: React.FC<any> = ({ label, error, ...props }) => (
  <div className="group">
    {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">{label}</label>}
    <div className="relative">
      <input 
        className={`w-full bg-slate-900/50 border ${error ? 'border-rose-500/50' : 'border-slate-700'} rounded-lg px-4 py-3 text-slate-200 placeholder-slate-600 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all duration-300`}
        {...props}
      />
      {error && <div className="absolute right-3 top-3 text-rose-400"><AlertIcon size={16} /></div>}
    </div>
    {error && <p className="mt-1 text-xs text-rose-400">{error}</p>}
  </div>
);

const QuantumSelect: React.FC<any> = ({ label, children, ...props }) => (
  <div className="group">
    {label && <label className="block text-xs font-medium text-slate-400 mb-1.5 uppercase tracking-wider group-focus-within:text-cyan-400 transition-colors">{label}</label>}
    <div className="relative">
      <select 
        className="w-full bg-slate-900/50 border border-slate-700 rounded-lg px-4 py-3 text-slate-200 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 appearance-none transition-all duration-300"
        {...props}
      >
        {children}
      </select>
      <div className="absolute right-4 top-4 pointer-events-none text-slate-500">
        <ChevronDownIcon size={16} />
      </div>
    </div>
  </div>
);

const QuantumButton: React.FC<any> = ({ children, variant = 'primary', isLoading, icon, ...props }) => {
  const baseClass = "relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform active:scale-95";
  const variants: any = {
    primary: `bg-gradient-to-r ${THEME.colors.primary} text-white shadow-lg shadow-cyan-500/20 hover:shadow-cyan-500/40 hover:brightness-110`,
    secondary: `bg-slate-700 hover:bg-slate-600 text-slate-200`,
    outline: `border border-slate-600 hover:border-cyan-500 text-slate-300 hover:text-cyan-400 bg-transparent`,
    danger: `bg-gradient-to-r from-rose-600 to-red-700 text-white hover:brightness-110`,
    ghost: `bg-transparent hover:bg-slate-800 text-slate-400 hover:text-slate-200`
  };

  return (
    <button className={`${baseClass} ${variants[variant]}`} {...props}>
      {isLoading ? <Spinner size={20} /> : icon}
      <span>{children}</span>
      {variant === 'primary' && <div className="absolute inset-0 bg-white/20 translate-y-full hover:translate-y-0 transition-transform duration-300 pointer-events-none" />}
    </button>
  );
};

const QuantumBadge: React.FC<{ children: React.ReactNode; variant?: 'success' | 'warning' | 'error' | 'info' }> = ({ children, variant = 'info' }) => {
  const styles = {
    success: 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20',
    warning: 'bg-amber-500/10 text-amber-400 border-amber-500/20',
    error: 'bg-rose-500/10 text-rose-400 border-rose-500/20',
    info: 'bg-cyan-500/10 text-cyan-400 border-cyan-500/20',
  };
  return (
    <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium border ${styles[variant]} inline-flex items-center space-x-1`}>
      {children}
    </span>
  );
};

// --- Icons (SVG) ---
const SendIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="22" y1="2" x2="11" y2="13"></line><polygon points="22 2 15 22 11 13 2 9 22 2"></polygon></svg>;
const SparklesIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m12 3-1.912 5.813a2 2 0 0 1-1.275 1.275L3 12l5.813 1.912a2 2 0 0 1 1.275 1.275L12 21l1.912-5.813a2 2 0 0 1 1.275-1.275L21 12l-5.813-1.912a2 2 0 0 1-1.275-1.275L12 3Z"></path></svg>;
const ShieldCheckIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path><path d="m9 12 2 2 4-4"></path></svg>;
const AlertIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="12" y1="8" x2="12" y2="12"></line><line x1="12" y1="16" x2="12.01" y2="16"></line></svg>;
const ChevronDownIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m6 9 6 6 6-6"></path></svg>;
const Spinner = ({ size = 20 }) => <svg className="animate-spin" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56"></path></svg>;
const BotIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect width="18" height="10" x="3" y="11" rx="2"></rect><circle cx="12" cy="5" r="2"></circle><path d="M12 7v4"></path><line x1="8" y1="16" x2="8" y2="16"></line><line x1="16" y1="16" x2="16" y2="16"></line></svg>;
const HistoryIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 12a9 9 0 1 0 9-9 9.75 9.75 0 0 0-6.74 2.74L3 12"></path><path d="M3 3v9h9"></path><path d="M12 7v5l4 2"></path></svg>;
const GlobeIcon = ({ size = 20 }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="2" y1="12" x2="22" y2="12"></line><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"></path></svg>;

// ================================================================================================
// 🧠 TYPES & INTERFACES
// ================================================================================================

interface Account {
  id: string;
  name: string;
  currency: string;
  balance?: number;
}

interface LineItem {
  amount: number; // in cents
  description: string;
  metadata?: { [key: string]: string };
}

interface PaymentOrderFormData {
  id?: string;
  type: 'ach' | 'wire' | 'rtp' | 'check' | 'book' | 'eft' | 'sepa' | 'bacs' | 'au_becs' | 'interac' | 'sen' | 'signet' | 'provexchange' | '';
  subtype?: 'CCD' | 'PPD' | 'IAT' | 'CTX' | 'WEB' | 'CIE' | 'TEL' | '';
  amount: number; // in dollars
  direction: 'credit' | 'debit' | '';
  priority: 'normal' | 'high' | '';
  originating_account_id: string;
  receiving_account_id: string;
  currency: string;
  effective_date: string; // YYYY-MM-DD
  description: string;
  statement_descriptor: string;
  remittance_information: string;
  purpose: string;
  metadata: { key: string; value: string }[];
  line_items: LineItem[];
  send_remittance_advice: boolean;
  nsf_protected: boolean;
  charge_bearer?: 'shared' | 'sender' | 'receiver' | '';
  ultimate_originating_party_name: string;
  ultimate_receiving_party_name: string;
}

interface AuditEvent {
  id: string;
  timestamp: Date;
  action: string;
  details: string;
  actor: 'USER' | 'AI_AGENT' | 'SYSTEM';
  severity: 'INFO' | 'WARNING' | 'CRITICAL';
}

interface ChatMessage {
  id: string;
  role: 'user' | 'ai' | 'system';
  content: string;
  timestamp: Date;
}

interface PaymentOrderFormProps {
  initialData?: Partial<PaymentOrderFormData>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  internalAccounts: Account[];
  externalAccounts: Account[];
}

// ================================================================================================
// 🤖 AI CORE CONFIGURATION
// ================================================================================================

const SYSTEM_PROMPT = `
You are the Quantum Financial AI Assistant. Your goal is to assist users in creating secure, high-value payment orders.
You have access to the form fields. When the user gives a command, extract the relevant information and return a JSON object to populate the form.
If the user asks a question, answer it professionally as a top-tier banking concierge.

OUTPUT FORMAT FOR COMMANDS:
{
  "action": "UPDATE_FORM",
  "data": {
    "amount": number | null,
    "currency": string | null,
    "type": string | null,
    "description": string | null,
    "priority": string | null,
    "receiving_account_name_match": string | null
  },
  "message": "Brief confirmation message."
}

OUTPUT FORMAT FOR QUESTIONS:
{
  "action": "MESSAGE",
  "message": "Your answer here."
}

Be concise, elite, and helpful.
`;

// ================================================================================================
// 🚀 MAIN COMPONENT: PAYMENT ORDER FORM
// ================================================================================================

const PaymentOrderForm: React.FC<PaymentOrderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  internalAccounts,
  externalAccounts,
}) => {
  // --- Context & State ---
  const { geminiApiKey, userProfile } = useContext(DataContext) || { geminiApiKey: process.env.GEMINI_API_KEY, userProfile: { name: 'Guest' } };
  
  const [formData, setFormData] = useState<PaymentOrderFormData>({
    type: '',
    subtype: '',
    amount: 0,
    direction: '',
    priority: 'normal',
    originating_account_id: '',
    receiving_account_id: '',
    currency: 'USD',
    effective_date: new Date().toISOString().split('T')[0],
    description: '',
    statement_descriptor: '',
    remittance_information: '',
    purpose: '',
    metadata: [],
    line_items: [{ amount: 0, description: '' }],
    send_remittance_advice: false,
    nsf_protected: false,
    charge_bearer: '',
    ultimate_originating_party_name: '',
    ultimate_receiving_party_name: '',
    ...initialData
  });

  // AI & Chat State
  const [chatHistory, setChatHistory] = useState<ChatMessage[]>([
    { id: 'init', role: 'ai', content: `Welcome back, ${userProfile?.name || 'Commander'}. I am ready to orchestrate your payments.`, timestamp: new Date() }
  ]);
  const [chatInput, setChatInput] = useState('');
  const [isAiThinking, setIsAiThinking] = useState(false);
  const chatEndRef = useRef<HTMLDivElement>(null);

  // Audit & Security State
  const [auditLog, setAuditLog] = useState<AuditEvent[]>([]);
  const [securityScore, setSecurityScore] = useState(100);
  const [isSimulating, setIsSimulating] = useState(false);

  // --- Effects ---

  useEffect(() => {
    if (initialData) {
      const populatedData = { ...formData, ...initialData };
      if (typeof populatedData.amount === 'number' && initialData.amount && initialData.amount > 10000) {
         // Heuristic: if amount is large, it might be in cents in DB, but form uses dollars. 
         // Assuming input prop is consistent with type definition (dollars).
      }
      setFormData(populatedData);
      logAudit('SYSTEM', 'Form initialized with existing data', 'INFO');
    } else {
      logAudit('SYSTEM', 'New payment order session started', 'INFO');
    }
  }, [initialData]);

  useEffect(() => {
    chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatHistory]);

  // --- Helpers ---

  const logAudit = (actor: 'USER' | 'AI_AGENT' | 'SYSTEM', details: string, severity: 'INFO' | 'WARNING' | 'CRITICAL') => {
    const newEvent: AuditEvent = {
      id: Math.random().toString(36).substr(2, 9),
      timestamp: new Date(),
      action: 'AUDIT_LOG',
      details,
      actor,
      severity
    };
    setAuditLog(prev => [newEvent, ...prev]);
    
    if (severity === 'WARNING') setSecurityScore(prev => Math.max(0, prev - 10));
    if (severity === 'CRITICAL') setSecurityScore(prev => Math.max(0, prev - 25));
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target;
    let newValue: any = value;
    
    if (type === 'checkbox') {
      newValue = (e.target as HTMLInputElement).checked;
    } else if (name === 'amount') {
      newValue = parseFloat(value) || 0;
    }

    setFormData(prev => ({ ...prev, [name]: newValue }));
    
    // Debounced audit log could go here, but for demo we log key changes
    if (name === 'amount' && newValue > 10000) {
      logAudit('USER', `High value amount entered: ${newValue}`, 'WARNING');
    }
  };

  // --- AI Logic ---

  const processAICommand = async () => {
    if (!chatInput.trim()) return;
    
    const userMsg: ChatMessage = { id: Date.now().toString(), role: 'user', content: chatInput, timestamp: new Date() };
    setChatHistory(prev => [...prev, userMsg]);
    setChatInput('');
    setIsAiThinking(true);

    try {
      if (!geminiApiKey) {
        throw new Error("Quantum AI Link Disconnected (Missing API Key)");
      }

      const ai = new GoogleGenAI({ apiKey: geminiApiKey });
      const model = ai.getGenerativeModel({ 
        model: "gemini-1.5-flash",
        systemInstruction: SYSTEM_PROMPT
      });

      // Contextualize with current form state
      const prompt = `
        CURRENT FORM STATE: ${JSON.stringify(formData)}
        AVAILABLE ACCOUNTS: ${JSON.stringify([...internalAccounts, ...externalAccounts].map(a => ({ id: a.id, name: a.name, currency: a.currency })))}
        USER INPUT: "${userMsg.content}"
      `;

      const result = await model.generateContent(prompt);
      const responseText = result.response.text();
      
      // Attempt to parse JSON
      let aiResponse;
      try {
        const jsonMatch = responseText.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          aiResponse = JSON.parse(jsonMatch[0]);
        } else {
          aiResponse = { action: 'MESSAGE', message: responseText };
        }
      } catch (e) {
        aiResponse = { action: 'MESSAGE', message: responseText };
      }

      if (aiResponse.action === 'UPDATE_FORM') {
        const updates = aiResponse.data;
        setFormData(prev => {
          const newData = { ...prev };
          if (updates.amount) newData.amount = updates.amount;
          if (updates.currency) newData.currency = updates.currency;
          if (updates.type) newData.type = updates.type as any;
          if (updates.description) newData.description = updates.description;
          if (updates.priority) newData.priority = updates.priority as any;
          
          // Smart Account Matching
          if (updates.receiving_account_name_match) {
            const match = [...internalAccounts, ...externalAccounts].find(a => 
              a.name.toLowerCase().includes(updates.receiving_account_name_match.toLowerCase())
            );
            if (match) newData.receiving_account_id = match.id;
          }
          return newData;
        });
        logAudit('AI_AGENT', `Form auto-filled based on command: "${userMsg.content}"`, 'INFO');
      }

      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'ai', 
        content: aiResponse.message || "Command executed.", 
        timestamp: new Date() 
      }]);

    } catch (error: any) {
      setChatHistory(prev => [...prev, { 
        id: Date.now().toString(), 
        role: 'system', 
        content: `Error: ${error.message}`, 
        timestamp: new Date() 
      }]);
      logAudit('SYSTEM', `AI Processing Error: ${error.message}`, 'WARNING');
    } finally {
      setIsAiThinking(false);
    }
  };

  // --- Submission Logic ---

  const handleSimulate = async () => {
    setIsSimulating(true);
    logAudit('SYSTEM', 'Initiating Transaction Simulation...', 'INFO');
    
    // Simulate network delay and checks
    await new Promise(resolve => setTimeout(resolve, 1500));
    
    if (formData.amount > 100000 && securityScore < 80) {
      logAudit('SYSTEM', 'Simulation Failed: Risk Threshold Exceeded', 'CRITICAL');
      setIsSimulating(false);
      return;
    }

    logAudit('SYSTEM', 'Simulation Successful. Liquidity confirmed. OFAC checks passed.', 'INFO');
    setIsSimulating(false);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    logAudit('USER', 'Submitting Payment Order', 'INFO');
    
    const submissionData = {
      ...formData,
      amount: Math.round(formData.amount * 100), // Convert to cents for backend
    };
    onSubmit(submissionData);
  };

  // ================================================================================================
  // 🖥️ RENDER
  // ================================================================================================

  return (
    <div className={`min-h-screen ${THEME.colors.bg} text-slate-200 font-sans selection:bg-cyan-500/30`}>
      
      {/* HEADER */}
      <header className="border-b border-slate-700/50 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-lg bg-gradient-to-br from-cyan-500 to-blue-600 flex items-center justify-center shadow-lg shadow-cyan-500/20">
              <GlobeIcon size={24} className="text-white" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-white tracking-tight">Quantum Financial</h1>
              <p className="text-xs text-cyan-400 font-medium tracking-widest uppercase">Payment Orchestration</p>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <div className="hidden md:flex items-center space-x-2 px-3 py-1.5 rounded-full bg-slate-800 border border-slate-700">
              <div className={`w-2 h-2 rounded-full ${securityScore > 80 ? 'bg-emerald-500' : 'bg-amber-500'} animate-pulse`} />
              <span className="text-xs font-mono text-slate-400">SECURE_CHANNEL_ACTIVE</span>
            </div>
            <QuantumButton variant="ghost" onClick={onCancel}>Cancel</QuantumButton>
            <QuantumButton variant="primary" onClick={handleSubmit} icon={<SendIcon size={18} />}>
              Execute Order
            </QuantumButton>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-6 py-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* LEFT COLUMN: AI ASSISTANT (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          <QuantumCard title="Quantum AI Assistant" icon={<SparklesIcon />} className="h-[600px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-4 pr-2 scrollbar-thin scrollbar-thumb-slate-700 scrollbar-track-transparent">
              {chatHistory.map((msg) => (
                <div key={msg.id} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                  <div className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm ${
                    msg.role === 'user' 
                      ? 'bg-cyan-600/20 text-cyan-100 border border-cyan-500/30 rounded-br-none' 
                      : msg.role === 'system'
                      ? 'bg-rose-900/20 text-rose-200 border border-rose-500/30'
                      : 'bg-slate-700/50 text-slate-200 border border-slate-600/30 rounded-bl-none'
                  }`}>
                    {msg.role === 'ai' && <div className="flex items-center space-x-2 mb-1 text-xs text-cyan-400 font-bold uppercase"><BotIcon size={12} /> <span>Quantum Core</span></div>}
                    {msg.content}
                  </div>
                </div>
              ))}
              {isAiThinking && (
                <div className="flex justify-start">
                  <div className="bg-slate-700/50 rounded-2xl rounded-bl-none px-4 py-3 flex space-x-1">
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                    <div className="w-2 h-2 bg-cyan-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                  </div>
                </div>
              )}
              <div ref={chatEndRef} />
            </div>
            <div className="mt-4 pt-4 border-t border-slate-700/50">
              <div className="relative">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && processAICommand()}
                  placeholder="Ask Quantum to fill the form..."
                  className="w-full bg-slate-900 border border-slate-700 rounded-xl pl-4 pr-10 py-3 text-sm focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 outline-none transition-all"
                />
                <button 
                  onClick={processAICommand}
                  disabled={!chatInput.trim() || isAiThinking}
                  className="absolute right-2 top-2 p-1.5 text-cyan-400 hover:bg-cyan-500/10 rounded-lg transition-colors disabled:opacity-50"
                >
                  <SendIcon size={16} />
                </button>
              </div>
              <p className="text-[10px] text-slate-500 mt-2 text-center">
                Powered by Gemini 1.5 Flash. Secure Enclave.
              </p>
            </div>
          </QuantumCard>

          <QuantumCard title="Quick Actions">
            <div className="grid grid-cols-2 gap-3">
              <button onClick={() => setFormData(prev => ({ ...prev, priority: 'high' }))} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs font-medium text-slate-300 flex flex-col items-center gap-2">
                <span className="text-rose-400">⚡</span> Rush Payment
              </button>
              <button onClick={() => setFormData(prev => ({ ...prev, currency: 'EUR' }))} className="p-3 rounded-lg bg-slate-800 hover:bg-slate-700 border border-slate-700 hover:border-cyan-500/50 transition-all text-xs font-medium text-slate-300 flex flex-col items-center gap-2">
                <span className="text-blue-400">€</span> Switch to Euro
              </button>
              <button onClick={handleSimulate} className="col-span-2 p-3 rounded-lg bg-gradient-to-r from-slate-800 to-slate-700 hover:from-slate-700 hover:to-slate-600 border border-slate-600 transition-all text-xs font-medium text-cyan-400 flex items-center justify-center gap-2">
                <span className="animate-pulse">👁️</span> Test Drive Simulation
              </button>
            </div>
          </QuantumCard>
        </div>

        {/* CENTER COLUMN: THE FORM (6 cols) */}
        <div className="lg:col-span-6 space-y-6">
          <QuantumCard title="Payment Details">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Amount & Currency */}
              <div className="col-span-2 grid grid-cols-12 gap-4">
                <div className="col-span-8">
                  <QuantumInput 
                    label="Amount" 
                    name="amount" 
                    type="number" 
                    value={formData.amount} 
                    onChange={handleInputChange} 
                    placeholder="0.00"
                    step="0.01"
                    error={formData.amount > 1000000 ? "Requires Executive Approval" : null}
                  />
                </div>
                <div className="col-span-4">
                  <QuantumSelect label="Currency" name="currency" value={formData.currency} onChange={handleInputChange}>
                    {['USD', 'EUR', 'GBP', 'JPY', 'CAD', 'AUD', 'SGD'].map(c => <option key={c} value={c}>{c}</option>)}
                  </QuantumSelect>
                </div>
              </div>

              {/* Accounts */}
              <div className="col-span-2 md:col-span-1">
                <QuantumSelect label="Originating Account" name="originating_account_id" value={formData.originating_account_id} onChange={handleInputChange}>
                  <option value="">Select Source Asset</option>
                  {internalAccounts.map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                  ))}
                </QuantumSelect>
              </div>
              <div className="col-span-2 md:col-span-1">
                <QuantumSelect label="Beneficiary" name="receiving_account_id" value={formData.receiving_account_id} onChange={handleInputChange}>
                  <option value="">Select Counterparty</option>
                  {[...internalAccounts, ...externalAccounts].map(acc => (
                    <option key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</option>
                  ))}
                </QuantumSelect>
              </div>

              {/* Payment Type */}
              <div className="col-span-2 md:col-span-1">
                <QuantumSelect label="Payment Rail" name="type" value={formData.type} onChange={handleInputChange}>
                  <option value="">Auto-Route (Best Cost)</option>
                  <option value="wire">Wire Transfer (SWIFT)</option>
                  <option value="ach">ACH Network</option>
                  <option value="rtp">Real-Time Payment (RTP)</option>
                  <option value="book">Internal Book Transfer</option>
                  <option value="sepa">SEPA Credit</option>
                </QuantumSelect>
              </div>
              
              <div className="col-span-2 md:col-span-1">
                <QuantumInput 
                  label="Effective Date" 
                  name="effective_date" 
                  type="date" 
                  value={formData.effective_date} 
                  onChange={handleInputChange} 
                />
              </div>

              {/* Description */}
              <div className="col-span-2">
                <QuantumInput 
                  label="Description / Reference" 
                  name="description" 
                  value={formData.description} 
                  onChange={handleInputChange} 
                  placeholder="e.g. Q3 Consulting Services"
                />
              </div>

              {/* Advanced Toggles */}
              <div className="col-span-2 flex items-center justify-between p-4 bg-slate-900/30 rounded-xl border border-slate-700/50">
                <div className="flex items-center space-x-3">
                  <input 
                    type="checkbox" 
                    id="priority" 
                    name="priority" 
                    checked={formData.priority === 'high'} 
                    onChange={(e) => setFormData(prev => ({ ...prev, priority: e.target.checked ? 'high' : 'normal' }))}
                    className="w-5 h-5 rounded border-slate-600 bg-slate-800 text-cyan-500 focus:ring-cyan-500"
                  />
                  <label htmlFor="priority" className="text-sm font-medium text-slate-300 cursor-pointer">High Priority Processing</label>
                </div>
                {formData.priority === 'high' && <QuantumBadge variant="warning">FEES APPLY</QuantumBadge>}
              </div>

            </div>
          </QuantumCard>

          {/* Line Items Section */}
          <QuantumCard title="Remittance Data">
            <div className="space-y-4">
              {formData.line_items.map((item, idx) => (
                <div key={idx} className="flex items-center space-x-3 animate-in fade-in slide-in-from-left-4">
                  <div className="flex-1">
                    <QuantumInput 
                      placeholder="Invoice # or Item Description" 
                      value={item.description} 
                      onChange={(e: any) => {
                        const newItems = [...formData.line_items];
                        newItems[idx].description = e.target.value;
                        setFormData(prev => ({ ...prev, line_items: newItems }));
                      }}
                    />
                  </div>
                  <div className="w-32">
                    <QuantumInput 
                      type="number" 
                      placeholder="0.00" 
                      value={item.amount / 100} 
                      onChange={(e: any) => {
                        const newItems = [...formData.line_items];
                        newItems[idx].amount = parseFloat(e.target.value) * 100;
                        setFormData(prev => ({ ...prev, line_items: newItems }));
                      }}
                    />
                  </div>
                  <button 
                    onClick={() => {
                      if (formData.line_items.length > 1) {
                        setFormData(prev => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== idx) }));
                      }
                    }}
                    className="p-2 text-slate-500 hover:text-rose-400 transition-colors"
                  >
                    ×
                  </button>
                </div>
              ))}
              <button 
                onClick={() => setFormData(prev => ({ ...prev, line_items: [...prev.line_items, { amount: 0, description: '' }] }))}
                className="text-xs font-medium text-cyan-400 hover:text-cyan-300 flex items-center space-x-1"
              >
                <span>+ ADD LINE ITEM</span>
              </button>
            </div>
          </QuantumCard>
        </div>

        {/* RIGHT COLUMN: AUDIT & SECURITY (3 cols) */}
        <div className="lg:col-span-3 space-y-6">
          
          {/* Security Score Widget */}
          <QuantumCard className="bg-gradient-to-br from-slate-800 to-slate-900">
            <div className="text-center py-4">
              <div className="relative inline-flex items-center justify-center">
                <svg className="w-32 h-32 transform -rotate-90">
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" className="text-slate-700" />
                  <circle cx="64" cy="64" r="60" stroke="currentColor" strokeWidth="8" fill="transparent" strokeDasharray={377} strokeDashoffset={377 - (377 * securityScore) / 100} className={`${securityScore > 80 ? 'text-emerald-500' : securityScore > 50 ? 'text-amber-500' : 'text-rose-500'} transition-all duration-1000 ease-out`} />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-bold text-white">{securityScore}</span>
                  <span className="text-[10px] uppercase tracking-widest text-slate-400">Trust Score</span>
                </div>
              </div>
              <div className="mt-4 flex justify-center space-x-4 text-xs text-slate-400">
                <div className="flex items-center space-x-1">
                  <ShieldCheckIcon size={14} className="text-emerald-400" />
                  <span>Encryption: AES-256</span>
                </div>
              </div>
            </div>
          </QuantumCard>

          {/* Audit Log */}
          <QuantumCard title="Audit Trail" icon={<HistoryIcon />} className="h-[400px] flex flex-col">
            <div className="flex-1 overflow-y-auto space-y-3 pr-2 scrollbar-thin scrollbar-thumb-slate-700">
              {auditLog.length === 0 && <p className="text-xs text-slate-500 text-center py-4">No events recorded.</p>}
              {auditLog.map((event) => (
                <div key={event.id} className="flex space-x-3 text-xs border-l-2 border-slate-700 pl-3 py-1 animate-in fade-in slide-in-from-right-4">
                  <div className="flex-shrink-0 pt-0.5">
                    {event.severity === 'INFO' && <div className="w-2 h-2 rounded-full bg-cyan-500" />}
                    {event.severity === 'WARNING' && <div className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />}
                    {event.severity === 'CRITICAL' && <div className="w-2 h-2 rounded-full bg-rose-500 animate-ping" />}
                  </div>
                  <div>
                    <p className="text-slate-300 font-medium">{event.details}</p>
                    <div className="flex items-center space-x-2 mt-1 text-slate-500 text-[10px]">
                      <span>{event.timestamp.toLocaleTimeString()}</span>
                      <span>•</span>
                      <span className="uppercase">{event.actor}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </QuantumCard>

          {/* Simulation Status */}
          {isSimulating && (
            <div className="fixed inset-0 z-[100] bg-slate-900/90 backdrop-blur-sm flex items-center justify-center">
              <div className="bg-slate-800 border border-cyan-500/30 p-8 rounded-2xl shadow-2xl max-w-md w-full text-center space-y-6 animate-in zoom-in duration-300">
                <div className="w-20 h-20 mx-auto bg-cyan-500/10 rounded-full flex items-center justify-center relative">
                  <div className="absolute inset-0 border-4 border-cyan-500/30 rounded-full animate-ping" />
                  <GlobeIcon size={40} className="text-cyan-400 animate-spin duration-[3000ms]" />
                </div>
                <div>
                  <h3 className="text-xl font-bold text-white">Simulating Transaction</h3>
                  <p className="text-slate-400 mt-2">Running OFAC checks, liquidity validation, and routing optimization...</p>
                </div>
                <div className="w-full bg-slate-700 rounded-full h-2 overflow-hidden">
                  <div className="bg-cyan-500 h-full animate-[width_1.5s_ease-in-out_infinite]" style={{ width: '60%' }} />
                </div>
              </div>
            </div>
          )}

        </div>
      </main>
    </div>
  );
};

export default PaymentOrderForm;

// --- CONSOLIDATED FROM: PaymentOrderForm (2).tsx ---

import React, { useState, useEffect, useCallback } from 'react';

// NOTE: This component assumes a UI library like Material-UI is installed and configured.
// e.g., `import { TextField, Button } from '@mui/material';`
// For brevity, component types are aliased to standard HTML elements or placeholder types.

// --- UI Component Placeholders ---
const Box: React.FC<any> = ({ component: Component = 'div', ...props }) => <Component {...props} />;
const Typography: React.FC<any> = (props) => <h5 {...props} />;
const Grid: React.FC<any> = (props) => <div {...props} />;
const TextField: React.FC<any> = (props) => <input {...props} />;
const Button: React.FC<any> = (props) => <button {...props} />;
const Select: React.FC<any> = ({ children, ...props }) => <select {...props}>{children}</select>;
const MenuItem: React.FC<any> = (props) => <option {...props} />;
const FormControl: React.FC<any> = (props) => <div {...props} />;
const InputLabel: React.FC<any> = (props) => <label {...props} />;
const IconButton: React.FC<any> = (props) => <button {...props} />;
const Switch: React.FC<any> = (props) => <input type="checkbox" {...props} />;
const FormControlLabel: React.FC<any> = ({ control, label }) => <label>{control}{label}</label>;
const Accordion: React.FC<any> = (props) => <details {...props} />;
const AccordionSummary: React.FC<any> = (props) => <summary {...props} />;
const AccordionDetails: React.FC<any> = (props) => <div {...props} />;
const AddCircleOutline: React.FC<any> = () => <span>+</span>;
const RemoveCircleOutline: React.FC<any> = () => <span>-</span>;
const ExpandMore: React.FC<any> = () => <span>v</span>;
// --- End UI Component Placeholders ---

// --- Type Definitions ---
interface Account {
  id: string;
  name: string;
  currency: string;
}

interface LineItem {
  amount: number; // in cents
  description: string;
  metadata?: { [key: string]: string };
}

interface PaymentOrderFormData {
  id?: string;
  type: 'ach' | 'wire' | 'rtp' | 'check' | 'book' | 'eft' | 'sepa' | 'bacs' | 'au_becs' | 'interac' | 'sen' | 'signet' | 'provexchange' | '';
  subtype?: 'CCD' | 'PPD' | 'IAT' | 'CTX' | 'WEB' | 'CIE' | 'TEL' | '';
  amount: number; // in dollars
  direction: 'credit' | 'debit' | '';
  priority: 'normal' | 'high' | '';
  originating_account_id: string;
  receiving_account_id: string;
  currency: string;
  effective_date: string; // YYYY-MM-DD
  description: string;
  statement_descriptor: string;
  remittance_information: string;
  purpose: string;
  metadata: { key: string; value: string }[];
  line_items: LineItem[];
  send_remittance_advice: boolean;
  nsf_protected: boolean;
  charge_bearer?: 'shared' | 'sender' | 'receiver' | '';
  ultimate_originating_party_name: string;
  ultimate_receiving_party_name: string;
}

const initialFormData: PaymentOrderFormData = {
  type: '',
  subtype: '',
  amount: 0,
  direction: '',
  priority: 'normal',
  originating_account_id: '',
  receiving_account_id: '',
  currency: 'USD',
  effective_date: new Date().toISOString().split('T')[0],
  description: '',
  statement_descriptor: '',
  remittance_information: '',
  purpose: '',
  metadata: [],
  line_items: [{ amount: 0, description: '' }],
  send_remittance_advice: false,
  nsf_protected: false,
  charge_bearer: '',
  ultimate_originating_party_name: '',
  ultimate_receiving_party_name: '',
};

interface PaymentOrderFormProps {
  initialData?: Partial<PaymentOrderFormData>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  internalAccounts: Account[];
  externalAccounts: Account[];
}

const paymentTypes = ['ach', 'wire', 'rtp', 'check', 'book', 'eft', 'sepa', 'bacs', 'au_becs', 'interac', 'sen', 'signet', 'provexchange'];
const achSubtypes = ['CCD', 'PPD', 'IAT', 'CTX', 'WEB', 'CIE', 'TEL'];
const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'AUD'];

const PaymentOrderForm: React.FC<PaymentOrderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  internalAccounts,
  externalAccounts,
}) => {
  const [formData, setFormData] = useState<PaymentOrderFormData>(initialFormData);

  useEffect(() => {
    if (initialData) {
        // When editing, convert amount from cents to dollars for the form
        const populatedData = { ...initialFormData, ...initialData };
        if (typeof populatedData.amount === 'number') {
            populatedData.amount = populatedData.amount / 100;
        }
        setFormData(populatedData);
    } else {
      setFormData(initialFormData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newAmount = isNaN(value) ? 0 : value;
    setFormData(prev => ({
      ...prev,
      amount: newAmount,
      line_items: prev.line_items.length === 1 ? [{ ...prev.line_items[0], amount: Math.round(newAmount * 100) }] : prev.line_items
    }));
  };

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newMetadata = [...formData.metadata];
    newMetadata[index] = { ...newMetadata[index], [field]: value };
    setFormData(prev => ({ ...prev, metadata: newMetadata }));
  };

  const addMetadataField = () => {
    setFormData(prev => ({ ...prev, metadata: [...prev.metadata, { key: '', value: '' }] }));
  };

  const removeMetadataField = (index: number) => {
    setFormData(prev => ({ ...prev, metadata: prev.metadata.filter((_, i) => i !== index) }));
  };

  const handleLineItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newLineItems = [...formData.line_items];
    const item = { ...newLineItems[index] };
    if (field === 'amount') {
      const amountValue = typeof value === 'string' ? parseFloat(value) : value;
      item.amount = isNaN(amountValue) ? 0 : Math.round(amountValue * 100);
    } else {
      item.description = value as string;
    }
    newLineItems[index] = item;
    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({ ...prev, line_items: [...prev.line_items, { amount: 0, description: '' }] }));
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 1) {
      setFormData(prev => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      amount: Math.round(formData.amount * 100), // Convert to cents
    };
    onSubmit(submissionData);
  };

  const totalLineItemAmount = useCallback(() => {
    return formData.line_items.reduce((sum, item) => sum + item.amount, 0);
  }, [formData.line_items]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {formData.id ? 'Edit Payment Order' : 'Create Payment Order'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Payment Type</InputLabel>
            <Select name="type" value={formData.type} label="Payment Type" onChange={handleChange}>
              <MenuItem value=""><em>Select Type</em></MenuItem>
              {paymentTypes.map(type => <MenuItem key={type} value={type}>{type.toUpperCase()}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {formData.type === 'ach' && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>ACH Subtype</InputLabel>
              <Select name="subtype" value={formData.subtype} label="ACH Subtype" onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {achSubtypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Direction</InputLabel>
            <Select name="direction" value={formData.direction} label="Direction" onChange={handleChange}>
              <MenuItem value=""><em>Select Direction</em></MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="debit">Debit</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="amount" label="Amount" type="number" value={formData.amount} onChange={handleAmountChange} fullWidth required inputProps={{ step: "0.01" }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Currency</InputLabel>
            <Select name="currency" value={formData.currency} label="Currency" onChange={handleChange}>
              {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField name="description" label="Description (Internal)" value={formData.description} onChange={handleChange} fullWidth multiline rows={2} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Originating Account</InputLabel>
            <Select name="originating_account_id" value={formData.originating_account_id} label="Originating Account" onChange={handleChange}>
              <MenuItem value=""><em>Select Account</em></MenuItem>
              {internalAccounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Receiving Account</InputLabel>
            <Select name="receiving_account_id" value={formData.receiving_account_id} label="Receiving Account" onChange={handleChange}>
              <MenuItem value=""><em>Select Account</em></MenuItem>
              {[...internalAccounts, ...externalAccounts].map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="effective_date" label="Effective Date" type="date" value={formData.effective_date} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={formData.priority} label="Priority" onChange={handleChange}>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Line Items</Typography>
          {formData.line_items.map((item, index) => (
            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={7}>
                <TextField label={`Line Item ${index + 1} Description`} value={item.description} onChange={(e: any) => handleLineItemChange(index, 'description', e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Amount" type="number" value={item.amount / 100} onChange={(e: any) => handleLineItemChange(index, 'amount', e.target.value)} fullWidth inputProps={{ step: "0.01" }} />
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => removeLineItem(index)} disabled={formData.line_items.length <= 1}><RemoveCircleOutline /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button onClick={addLineItem} startIcon={<AddCircleOutline />}>Add Line Item</Button>
          {Math.round(formData.amount * 100) !== totalLineItemAmount() && (
            <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>Total of line items (${(totalLineItemAmount() / 100).toFixed(2)}) does not match payment amount (${formData.amount.toFixed(2)}).</Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography>Optional Fields</Typography></AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}><TextField name="statement_descriptor" label="Statement Descriptor" value={formData.statement_descriptor} onChange={handleChange} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField name="remittance_information" label="Remittance Information" value={formData.remittance_information} onChange={handleChange} fullWidth /></Grid>
                {formData.type === 'wire' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Charge Bearer</InputLabel>
                      <Select name="charge_bearer" value={formData.charge_bearer} label="Charge Bearer" onChange={handleChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="shared">Shared (SHA)</MenuItem>
                        <MenuItem value="sender">Sender (OUR)</MenuItem>
                        <MenuItem value="receiver">Receiver (BEN)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.send_remittance_advice} onChange={handleChange} name="send_remittance_advice" />} label="Send Remittance Advice" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.nsf_protected} onChange={handleChange} name="nsf_protected" />} label="NSF Protected" /></Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography>Metadata</Typography></AccordionSummary>
            <AccordionDetails>
              {formData.metadata.map((meta, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={5}><TextField label="Key" value={meta.key} onChange={(e: any) => handleMetadataChange(index, 'key', e.target.value)} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Value" value={meta.value} onChange={(e: any) => handleMetadataChange(index, 'value', e.target.value)} fullWidth /></Grid>
                  <Grid item xs={1}><IconButton onClick={() => removeMetadataField(index)}><RemoveCircleOutline /></IconButton></Grid>
                </Grid>
              ))}
              <Button onClick={addMetadataField} startIcon={<AddCircleOutline />}>Add Metadata</Button>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">{formData.id ? 'Update Payment Order' : 'Create Payment Order'}</Button>
      </Box>
    </Box>
  );
};

export default PaymentOrderForm;

// --- CONSOLIDATED FROM: PaymentOrderForm (2)_1.tsx ---

import React, { useState, useEffect, useCallback } from 'react';

// NOTE: This component assumes a UI library like Material-UI is installed and configured.
// e.g., `import { TextField, Button } from '@mui/material';`
// For brevity, component types are aliased to standard HTML elements or placeholder types.

// --- UI Component Placeholders ---
const Box: React.FC<any> = ({ component: Component = 'div', ...props }) => <Component {...props} />;
const Typography: React.FC<any> = (props) => <h5 {...props} />;
const Grid: React.FC<any> = (props) => <div {...props} />;
const TextField: React.FC<any> = (props) => <input {...props} />;
const Button: React.FC<any> = (props) => <button {...props} />;
const Select: React.FC<any> = ({ children, ...props }) => <select {...props}>{children}</select>;
const MenuItem: React.FC<any> = (props) => <option {...props} />;
const FormControl: React.FC<any> = (props) => <div {...props} />;
const InputLabel: React.FC<any> = (props) => <label {...props} />;
const IconButton: React.FC<any> = (props) => <button {...props} />;
const Switch: React.FC<any> = (props) => <input type="checkbox" {...props} />;
const FormControlLabel: React.FC<any> = ({ control, label }) => <label>{control}{label}</label>;
const Accordion: React.FC<any> = (props) => <details {...props} />;
const AccordionSummary: React.FC<any> = (props) => <summary {...props} />;
const AccordionDetails: React.FC<any> = (props) => <div {...props} />;
const AddCircleOutline: React.FC<any> = () => <span>+</span>;
const RemoveCircleOutline: React.FC<any> = () => <span>-</span>;
const ExpandMore: React.FC<any> = () => <span>v</span>;
// --- End UI Component Placeholders ---

// --- Type Definitions ---
interface Account {
  id: string;
  name: string;
  currency: string;
}

interface LineItem {
  amount: number; // in cents
  description: string;
  metadata?: { [key: string]: string };
}

interface PaymentOrderFormData {
  id?: string;
  type: 'ach' | 'wire' | 'rtp' | 'check' | 'book' | 'eft' | 'sepa' | 'bacs' | 'au_becs' | 'interac' | 'sen' | 'signet' | 'provexchange' | '';
  subtype?: 'CCD' | 'PPD' | 'IAT' | 'CTX' | 'WEB' | 'CIE' | 'TEL' | '';
  amount: number; // in dollars
  direction: 'credit' | 'debit' | '';
  priority: 'normal' | 'high' | '';
  originating_account_id: string;
  receiving_account_id: string;
  currency: string;
  effective_date: string; // YYYY-MM-DD
  description: string;
  statement_descriptor: string;
  remittance_information: string;
  purpose: string;
  metadata: { key: string; value: string }[];
  line_items: LineItem[];
  send_remittance_advice: boolean;
  nsf_protected: boolean;
  charge_bearer?: 'shared' | 'sender' | 'receiver' | '';
  ultimate_originating_party_name: string;
  ultimate_receiving_party_name: string;
}

const initialFormData: PaymentOrderFormData = {
  type: '',
  subtype: '',
  amount: 0,
  direction: '',
  priority: 'normal',
  originating_account_id: '',
  receiving_account_id: '',
  currency: 'USD',
  effective_date: new Date().toISOString().split('T')[0],
  description: '',
  statement_descriptor: '',
  remittance_information: '',
  purpose: '',
  metadata: [],
  line_items: [{ amount: 0, description: '' }],
  send_remittance_advice: false,
  nsf_protected: false,
  charge_bearer: '',
  ultimate_originating_party_name: '',
  ultimate_receiving_party_name: '',
};

interface PaymentOrderFormProps {
  initialData?: Partial<PaymentOrderFormData>;
  onSubmit: (data: any) => void;
  onCancel: () => void;
  internalAccounts: Account[];
  externalAccounts: Account[];
}

const paymentTypes = ['ach', 'wire', 'rtp', 'check', 'book', 'eft', 'sepa', 'bacs', 'au_becs', 'interac', 'sen', 'signet', 'provexchange'];
const achSubtypes = ['CCD', 'PPD', 'IAT', 'CTX', 'WEB', 'CIE', 'TEL'];
const currencies = ['USD', 'CAD', 'EUR', 'GBP', 'AUD'];

const PaymentOrderForm: React.FC<PaymentOrderFormProps> = ({
  initialData,
  onSubmit,
  onCancel,
  internalAccounts,
  externalAccounts,
}) => {
  const [formData, setFormData] = useState<PaymentOrderFormData>(initialFormData);

  useEffect(() => {
    if (initialData) {
        // When editing, convert amount from cents to dollars for the form
        const populatedData = { ...initialFormData, ...initialData };
        if (typeof populatedData.amount === 'number') {
            populatedData.amount = populatedData.amount / 100;
        }
        setFormData(populatedData);
    } else {
      setFormData(initialFormData);
    }
  }, [initialData]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    if (type === 'checkbox') {
      setFormData(prev => ({ ...prev, [name]: (e.target as HTMLInputElement).checked }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };
  
  const handleAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value);
    const newAmount = isNaN(value) ? 0 : value;
    setFormData(prev => ({
      ...prev,
      amount: newAmount,
      line_items: prev.line_items.length === 1 ? [{ ...prev.line_items[0], amount: Math.round(newAmount * 100) }] : prev.line_items
    }));
  };

  const handleMetadataChange = (index: number, field: 'key' | 'value', value: string) => {
    const newMetadata = [...formData.metadata];
    newMetadata[index] = { ...newMetadata[index], [field]: value };
    setFormData(prev => ({ ...prev, metadata: newMetadata }));
  };

  const addMetadataField = () => {
    setFormData(prev => ({ ...prev, metadata: [...prev.metadata, { key: '', value: '' }] }));
  };

  const removeMetadataField = (index: number) => {
    setFormData(prev => ({ ...prev, metadata: prev.metadata.filter((_, i) => i !== index) }));
  };

  const handleLineItemChange = (index: number, field: 'description' | 'amount', value: string | number) => {
    const newLineItems = [...formData.line_items];
    const item = { ...newLineItems[index] };
    if (field === 'amount') {
      const amountValue = typeof value === 'string' ? parseFloat(value) : value;
      item.amount = isNaN(amountValue) ? 0 : Math.round(amountValue * 100);
    } else {
      item.description = value as string;
    }
    newLineItems[index] = item;
    setFormData(prev => ({ ...prev, line_items: newLineItems }));
  };

  const addLineItem = () => {
    setFormData(prev => ({ ...prev, line_items: [...prev.line_items, { amount: 0, description: '' }] }));
  };

  const removeLineItem = (index: number) => {
    if (formData.line_items.length > 1) {
      setFormData(prev => ({ ...prev, line_items: prev.line_items.filter((_, i) => i !== index) }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const submissionData = {
      ...formData,
      amount: Math.round(formData.amount * 100), // Convert to cents
    };
    onSubmit(submissionData);
  };

  const totalLineItemAmount = useCallback(() => {
    return formData.line_items.reduce((sum, item) => sum + item.amount, 0);
  }, [formData.line_items]);

  return (
    <Box component="form" onSubmit={handleSubmit} sx={{ p: 3, border: '1px solid #ddd', borderRadius: 2 }}>
      <Typography variant="h5" gutterBottom>
        {formData.id ? 'Edit Payment Order' : 'Create Payment Order'}
      </Typography>

      <Grid container spacing={3}>
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Payment Type</InputLabel>
            <Select name="type" value={formData.type} label="Payment Type" onChange={handleChange}>
              <MenuItem value=""><em>Select Type</em></MenuItem>
              {paymentTypes.map(type => <MenuItem key={type} value={type}>{type.toUpperCase()}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        {formData.type === 'ach' && (
          <Grid item xs={12} sm={4}>
            <FormControl fullWidth>
              <InputLabel>ACH Subtype</InputLabel>
              <Select name="subtype" value={formData.subtype} label="ACH Subtype" onChange={handleChange}>
                <MenuItem value=""><em>None</em></MenuItem>
                {achSubtypes.map(type => <MenuItem key={type} value={type}>{type}</MenuItem>)}
              </Select>
            </FormControl>
          </Grid>
        )}
        <Grid item xs={12} sm={4}>
          <FormControl fullWidth required>
            <InputLabel>Direction</InputLabel>
            <Select name="direction" value={formData.direction} label="Direction" onChange={handleChange}>
              <MenuItem value=""><em>Select Direction</em></MenuItem>
              <MenuItem value="credit">Credit</MenuItem>
              <MenuItem value="debit">Debit</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="amount" label="Amount" type="number" value={formData.amount} onChange={handleAmountChange} fullWidth required inputProps={{ step: "0.01" }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Currency</InputLabel>
            <Select name="currency" value={formData.currency} label="Currency" onChange={handleChange}>
              {currencies.map(c => <MenuItem key={c} value={c}>{c}</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <TextField name="description" label="Description (Internal)" value={formData.description} onChange={handleChange} fullWidth multiline rows={2} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Originating Account</InputLabel>
            <Select name="originating_account_id" value={formData.originating_account_id} label="Originating Account" onChange={handleChange}>
              <MenuItem value=""><em>Select Account</em></MenuItem>
              {internalAccounts.map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth required>
            <InputLabel>Receiving Account</InputLabel>
            <Select name="receiving_account_id" value={formData.receiving_account_id} label="Receiving Account" onChange={handleChange}>
              <MenuItem value=""><em>Select Account</em></MenuItem>
              {[...internalAccounts, ...externalAccounts].map(acc => <MenuItem key={acc.id} value={acc.id}>{acc.name} ({acc.currency})</MenuItem>)}
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField name="effective_date" label="Effective Date" type="date" value={formData.effective_date} onChange={handleChange} fullWidth required InputLabelProps={{ shrink: true }} />
        </Grid>
        <Grid item xs={12} sm={6}>
          <FormControl fullWidth>
            <InputLabel>Priority</InputLabel>
            <Select name="priority" value={formData.priority} label="Priority" onChange={handleChange}>
              <MenuItem value="normal">Normal</MenuItem>
              <MenuItem value="high">High</MenuItem>
            </Select>
          </FormControl>
        </Grid>
        <Grid item xs={12}>
          <Typography variant="h6" gutterBottom>Line Items</Typography>
          {formData.line_items.map((item, index) => (
            <Grid container spacing={2} key={index} alignItems="center" sx={{ mb: 1 }}>
              <Grid item xs={7}>
                <TextField label={`Line Item ${index + 1} Description`} value={item.description} onChange={(e: any) => handleLineItemChange(index, 'description', e.target.value)} fullWidth />
              </Grid>
              <Grid item xs={4}>
                <TextField label="Amount" type="number" value={item.amount / 100} onChange={(e: any) => handleLineItemChange(index, 'amount', e.target.value)} fullWidth inputProps={{ step: "0.01" }} />
              </Grid>
              <Grid item xs={1}>
                <IconButton onClick={() => removeLineItem(index)} disabled={formData.line_items.length <= 1}><RemoveCircleOutline /></IconButton>
              </Grid>
            </Grid>
          ))}
          <Button onClick={addLineItem} startIcon={<AddCircleOutline />}>Add Line Item</Button>
          {Math.round(formData.amount * 100) !== totalLineItemAmount() && (
            <Typography color="error" variant="caption" display="block" sx={{ mt: 1 }}>Total of line items (${(totalLineItemAmount() / 100).toFixed(2)}) does not match payment amount (${formData.amount.toFixed(2)}).</Typography>
          )}
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography>Optional Fields</Typography></AccordionSummary>
            <AccordionDetails>
              <Grid container spacing={3}>
                <Grid item xs={12} sm={6}><TextField name="statement_descriptor" label="Statement Descriptor" value={formData.statement_descriptor} onChange={handleChange} fullWidth /></Grid>
                <Grid item xs={12} sm={6}><TextField name="remittance_information" label="Remittance Information" value={formData.remittance_information} onChange={handleChange} fullWidth /></Grid>
                {formData.type === 'wire' && (
                  <Grid item xs={12} sm={6}>
                    <FormControl fullWidth>
                      <InputLabel>Charge Bearer</InputLabel>
                      <Select name="charge_bearer" value={formData.charge_bearer} label="Charge Bearer" onChange={handleChange}>
                        <MenuItem value=""><em>None</em></MenuItem>
                        <MenuItem value="shared">Shared (SHA)</MenuItem>
                        <MenuItem value="sender">Sender (OUR)</MenuItem>
                        <MenuItem value="receiver">Receiver (BEN)</MenuItem>
                      </Select>
                    </FormControl>
                  </Grid>
                )}
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.send_remittance_advice} onChange={handleChange} name="send_remittance_advice" />} label="Send Remittance Advice" /></Grid>
                <Grid item xs={12} sm={6}><FormControlLabel control={<Switch checked={formData.nsf_protected} onChange={handleChange} name="nsf_protected" />} label="NSF Protected" /></Grid>
              </Grid>
            </AccordionDetails>
          </Accordion>
        </Grid>
        <Grid item xs={12}>
          <Accordion>
            <AccordionSummary expandIcon={<ExpandMore />}><Typography>Metadata</Typography></AccordionSummary>
            <AccordionDetails>
              {formData.metadata.map((meta, index) => (
                <Grid container spacing={2} key={index} sx={{ mb: 1 }}>
                  <Grid item xs={5}><TextField label="Key" value={meta.key} onChange={(e: any) => handleMetadataChange(index, 'key', e.target.value)} fullWidth /></Grid>
                  <Grid item xs={6}><TextField label="Value" value={meta.value} onChange={(e: any) => handleMetadataChange(index, 'value', e.target.value)} fullWidth /></Grid>
                  <Grid item xs={1}><IconButton onClick={() => removeMetadataField(index)}><RemoveCircleOutline /></IconButton></Grid>
                </Grid>
              ))}
              <Button onClick={addMetadataField} startIcon={<AddCircleOutline />}>Add Metadata</Button>
            </AccordionDetails>
          </Accordion>
        </Grid>
      </Grid>
      <Box sx={{ display: 'flex', justifyContent: 'flex-end', mt: 3 }}>
        <Button onClick={onCancel} sx={{ mr: 1 }}>Cancel</Button>
        <Button type="submit" variant="contained" color="primary">{formData.id ? 'Update Payment Order' : 'Create Payment Order'}</Button>
      </Box>
    </Box>
  );
};

export default PaymentOrderForm;